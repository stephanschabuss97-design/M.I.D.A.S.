# Doctor View Module – Functional Overview

Dieses Dokument beschreibt die Arzt-Ansicht (Doktor-Tab) im Gesundheits-Logger. Ziel ist eine vollständige Referenz über UI-Struktur, Datenflüsse, Supabase-Abhängigkeiten sowie Diagnose- und Sicherheitsmechanismen.

---

## 1. Zielsetzung & Funktionen

Die Arzt-Ansicht konsolidiert Tagesdaten, Trendpilot-Hinweise, Labor-Events und Monatsberichte für Ärzt:innen oder Patienten im „Doctor“-Modus. Kerneigenschaften:

- Zeitraumfilter (Von/Bis) mit Anbindung an Supabase `fetchDailyOverview` sowie dedizierte Loader für BP/Body/Lab.
- Tabbed Layout (`BP`, `Body`, `Lab`, `Inbox`) für klar getrennte Domänen; Inbox öffnet Monatsberichte als Overlay.
- Trendpilot-Hinweisblock (Severity, Ack, Arztstatus samt Buttons).
- JSON-Export, Remote-Löschen einzelner Domains und Tab-übergreifender Scroll-Restore.
- Chart-Integration (`Werte anzeigen`) und neues „Monatsbericht“-Feature (Edge Function `midas-monthly-report`).
- Zugriffsschutz via Doctor-Unlock (Finger/PIN).

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|-------|-------|
| `app/modules/doctor/index.js` | Hauptlogik: Rendern, Scroll-Restore, Tab-Steuerung (BP/Body/Lab/Inbox), Trendpilot-Block, Delete/Export, Monatsberichte. |
| `app/styles/doctor.css` | Layout/Stil (Toolbar, Badge, Trendpilot-Karten, Tagesgrid). |
| `app/modules/hub/index.js` | Orbit-Buttons & Overlay-Steuerung (öffnet Doctor-Panel nach Unlock). |
| `assets/js/main.js` | Legacy Tab-Wechsel (bleibt für Altansichten); Hub überlagert dies mit Orbit. |
| `app/supabase/api/vitals.js`, `app/supabase/api/system-comments.js`, `app/supabase/api/reports.js` | REST-Fetch für Tageswerte/Lab-Events, Trendpilot-Kommentare und Monatsberichte (Edge Function Wrapper). |
| `app/modules/trendpilot/index.js` | Liefert `trendpilot:latest` Events, Ack-Patching etc. |
| `assets/js/charts/index.js` | Chart-Button nutzt das gleiche Range, um Diagramm zu öffnen. |
| `docs/QA_CHECKS.md` | Enthält Tests (Unlock, Trendpilot-Block, Delete, Chart). |

---

## 3. Ablauf / Datenfluss

### 3.1 Unlock & Setup

1. Beim Orbit-Button-Klick für die Arzt-Ansicht ruft `hub/index.js` `requireDoctorUnlock`.
2. Nach erfolgreichem Unlock öffnet `hub/index.js` das Doctor-Panel automatisch und triggert `requestUiRefresh({ doctor: true })`.
3. Legacy-Tab (`setTab('doctor')`) existiert weiterhin für Altansichten/QA, folgt aber demselben Guard.

### 3.2 Render (`renderDoctor`)

1. Liest `from/to` Felder, validiert sie (sonst Placeholder „Bitte Zeitraum wählen“).
2. Ruft `fetchDailyOverview(from, to)` für BP/Body/Notes sowie `loadLabEventsRange` für Lab-Einträge; Ergebnisse werden pro Domain getrennt gespeichert.
3. Sortiert Tage absteigend, mappt in DOM-Blöcke:
   - **BP-Tab:** Datum + Cloud/Actions (Löschen) + Messgrid (Sys/Dia/Puls/MAP morgens/abends, rot markiert bei Schwellen).
   - **Body-Tab:** Datum + Cloud/Actions + numerische Zeile (Gewicht, Bauchumfang, Fett/Muskel in separaten Spalten).
   - **Lab-Tab:** Datum + Cloud/Actions + zwei Messgruppen (Nierenwerte, Stoffwechselwerte) plus Kommentarbereich. Jede Karte repräsentiert einen `lab_event`.
   - **Inbox-Tab:** Placeholder im Hauptpanel, öffnet beim Klick ein Overlay mit Monatsberichten (siehe 3.5).
4. Scroll-Restore: Merkt Scroll-Position (`__doctorScrollSnapshot`), setzt sie nach Render zurück (BP/Body/Lab teilen sich denselben Scroll-Container).

### 3.3 Aktionen

- **Löschen:** Domain-spezifische Buttons (`data-del-bp`, `data-del-body`, später `data-del-lab`) rufen `deleteRemoteByType(date, type)` → anschl. `requestUiRefresh`.
- **JSON-Export:** `exportDoctorJson()` ruft `getAllEntries()` (lokal) und lädt `gesundheitslog.json` herunter.
- **Chart-Button:** `#doctorChartBtn` öffnet Chart-Panel, nutzt dieselben Range-Felder.

### 3.4 Trendpilot-Hinweise

1. `loadTrendpilotEntries(from, to)` ruft `fetchSystemCommentsRange`.
2. Trendpilot-Sektion zeigt jede Meldung (Datum, Severity-Badge, Ack-Status, Text, Buttons).
3. Buttons patchen `doctorStatus` via `setSystemCommentDoctorStatus`.
4. Ack-Status wird aus `payload.context.ack` gelesen; falls acked, Pill `is-ack`.
5. Fehler beim Laden loggt `logDoctorError('[doctor] trendpilot fetch failed ...')` + Touch-Log.

---

## 4. Styling / Layout (Kurz)

- Toolbar: Titel, Range, Buttons (Apply, Chart, Export).
- Trendpilot-Block (`.doctor-trendpilot`): Card mit Head + List; List → `.tp-row` pro Eintrag.
- Tagescards (`.doctor-day`): Grid (Datum / Messungen / Spezial).
- Badge/Buttons nutzen App-Design-Token (`var(--color-...)`).

---

## 5. Diagnose & Logging

- `logDoctorError` schreibt Fehler in `diag` + Konsole (z. B. Supabase 400/401).
- Touch-Log-Einträge (`[doctor] ...`, `[sbSelect] ... failed`) zeigen REST-Probleme.
- Unlock-Warnungen: `[doctor] requireDoctorUnlock missing` etc., falls Guard nicht konfiguriert.
- Trendpilot-Button-Fehler (Patch) werden als `alert` + diag gemeldet.
- Boot-Flow Guard: Panel-Handler reagieren erst, wenn `AppModules.bootFlow` mindestens `INIT_MODULES` erreicht – während des Boot-Overlays bleiben Buttons damit inaktiv.

---

## 6. Speicherfluss & Abhängigkeiten

1. `hub/index.js` steuert Orbit/Unlock/Panel-Overlay (neu), `main.js` bedient Legacy-Workflow.
2. `doctor/index.js` ruft Supabase APIs (Vitals, System-Comments).
3. `trendpilot/index.js` sorgt dafür, dass `fetchSystemCommentsRange`/`setSystemCommentAck`/`setSystemCommentDoctorStatus` bereitstehen; Capture-Hook sendet `trendpilot:latest`, was an die Arzt-Ansicht weitergegeben wird.
4. Chart-Benutzung (gleicher Zeitraum) -> `assets/js/charts/index.js`.

---

## 7. Erweiterungsvorschläge

- Filter auf Serien (nur Morgen/Abend, nur Tage mit Kommentaren).
- Bulk-Aktionen (alle acken, CSV-Export) oder Tagging.
- Medikation / Symptome Spalten, falls Supabase-Datenmodell erweitert wird.

---

Aktualisiere dieses Dokument bei Änderungen (z. B. weitere Buttons, neue Felder oder Supabase-Integrationen), damit alle Beteiligten denselben Wissenstand haben.
- **Lab-Bereich:** neue Delete-Buttons (`data-del-lab`) nutzen `deleteRemoteByType(date, 'lab_event')` und triggern danach `requestUiRefresh`. Die UI spiegelt eGFR/Kreatinin/Risiko-Infos ohne BP/Body-Spalten wider.

### 3.5 Monatsberichte

1. Toolbar enthält nun den Button `Monatsbericht` (guarded). Ein Klick ruft über `app/supabase/api/reports.js` die Edge Function `midas-monthly-report` auf, übergibt `from/to` oder ein explizites `month`.
2. Die Edge Function aggregiert BP/Body/Lab-Reihen (`v_events_*`), erstellt eine textuelle Zusammenfassung (Ø-Werte, Trends, CKD-Kontext) und speichert sie als `system_comment` mit `payload.subtype = 'monthly_report'`.
3. Die Inbox im Doctor-Tab öffnet ein Overlay (`doctorInboxPanel`), listet alle Monatsberichte (Sortierung absteigend) mit:
   - Header (Monat, Erstellzeit).
   - Summary-Zeile (z. B. „September 2025: 46 BP · 17 Körper · 1 Lab“ + Warn-Flags).
   - Narrative (Markdown → HTML) plus Aktionen `Neu erstellen` und `Löschen`.
4. Löschen ruft `deleteSystemComment(id)` (Supabase) auf, Neu erstellen triggert die Edge Function erneut (optional mit `month`).
5. Trendpilot/AI-Pipeline ignoriert Monatsberichte, da `fetchSystemCommentsRange` nur Events ohne `payload.subtype` lädt.

### 3.6 Trendpilot-Hinweise
