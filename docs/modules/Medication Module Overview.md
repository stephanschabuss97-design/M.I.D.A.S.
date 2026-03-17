# Medication Module - Functional Overview

Kurze Einordnung:
- Zweck: Tablettenmanager im Intake-Panel (Daily Batch) und TAB-Panel (Medikationsverwaltung).
- Rolle: Ergaenzt Intake um pharmakologische Daten; liefert Events fuer andere Module.
- Abgrenzung: Eigenstaendiges Modul; Intake konsumiert es nur ueber Events/RPCs.

Related docs:
- [Bootflow Overview](bootflow overview.md)

---

## 1. Zielsetzung

- Problem: Tagesbasierte Medikation soll ohne SQL oder manuelle Tabellenpflege funktionieren.
- Benutzer: Primär Patient (IN/TAB), indirekt Arzt via Warnhinweise.
- Nicht-Ziel: Kein Arzt-Workflow, keine externen Benachrichtigungen.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/intake-stack/medication/index.js` | Client-API, RPC Loader, Cache, TAB-UI. |
| `app/modules/intake-stack/intake/index.js` | IN-Toggles, Low-Stock Box (nutzt `AppModules.medication`). |
| `app/styles/hub.css` | Layout/Styles Tablettenmanager. |
| `sql/12_Medication.sql` | Tabellen + RPCs (`med_list`, `med_upsert`, `med_confirm_dose`, `med_undo_dose`, `med_adjust_stock`, `med_set_stock`, `med_ack_low_stock`, `med_set_active`, `med_delete`). |
| `docs/Medication Management Module Spec.md` | Spezifikation & Roadmap. |
| `docs/QA_CHECKS.md` | QA Pack (Phase E). |

---

## 3. Datenmodell / Storage

- `health_medications`: Stammdaten + Bestaende, Low-Stock-Felder, `active` Flag.
- `health_medication_doses`: tägliche Einnahmen je Nutzer/Medikation (unique per day).
- `health_medication_stock_log`: optionaler Verlauf für Bestandskorrekturen.
- Beziehungen: Doses & Log referenzieren `health_medications`.
- Besonderheiten: Low-Stock-Acknowledgements (`low_stock_ack_day/_stock`) verhindern Doppeleinblendung.

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- Modul lädt automatisch über `app/modules/intake-stack/medication/index.js` (Script-Tag).
- Aktiv sobald Supabase Auth Stage ≥ INIT_MODULES.
- Intake subscribe auf `medication:changed`.

### 4.2 User-Trigger
- IN-Tab: Checkbox-Auswahl pro Medikament + Batch-Footer (Auswahl bestaetigen/Alle genommen).
- Status-Row nach Batch-Save mit Rueckgaengig (zeitlich begrenzt).
- Low-Stock Ack im IN-Tab.
- TAB-Formular Submit/Reset.
- Kartenaktionen: Restock, Set Stock, Toggle Active, Delete.

### 4.3 Verarbeitung
- Client-Validierungen (Name Pflicht, Delta ≠ 0, Stock ≥ 0).
- Cache & Events sichern, dass UI konsistent bleibt.

### 4.4 Persistenz
- RPCs schreiben in `health_medications` & `health_medication_doses`.
- `med_upsert` Upsert; `med_confirm_dose/undo` passen Dosen & Bestaende an.
- `med_adjust_stock` und `med_set_stock` loggen in `health_medication_stock_log`.

---

## 5. UI-Integration

- IN-Panel (Intake) mit Medikamenten-Checkboxen + Batch-Footer (Actions/Status).
- TAB-Panel (Intake Subtab "TAB") mit Formular + Kartenliste.
- Low-Stock-Box sichtbar, wenn Daten vorhanden.

---

## 6. Arzt-Ansicht / Read-Only Views

- Aktuell keine dedizierte Arztansicht; Doctor Panel könnte später `med_list` konsumieren.
- Low-Stock-Box zeigt Arzt-Mail zur Kontaktaufnahme (aus Profil).

---

## 7. Fehler- & Diagnoseverhalten

- Typische Fehler: Nicht authentifiziert, RPC schlägt fehl, fehlende Arzt-Mail.
- Logging: `[capture:med] refresh/confirm/undo/ack` in diag.
- Fallback: Placeholder-Texte, Buttons disabled, kein Silent Failure.
- Fehlende Daten → IN zeigt Hinweis „Bitte anmelden…“ oder „Keine Daten vorhanden“.

---

## 8. Events & Integration Points

- Custom Event `medication:changed { reason, dayIso, data }`.
- Intake reagiert (IN), Profil-Änderungen triggen Low-Stock-Kontakt Update.
- `AppModules.medication` exportiert API für andere Module (z. B. Trendpilot).

---

## Intent / Voice Integration

- Status:
  - Produktiver lokaler Medikations-Fast-Path ist derzeit auf die taegliche Sammelbestaetigung offener Medikation begrenzt.
- Unterstuetzte Intents:
  - `medication_confirm_all`
- Voice Entry Points:
  - Produktiv nur ueber den bestehenden Hero-Hub Push-to-talk-Flow und den gemeinsamen Intent-Surface.
- Allowed Actions:
  - Keine generische Allowed-Action fuer das Modul.
  - Produktiv existiert ein enger lokaler Spezialpfad fuer `medication_confirm_all`, der ueber `loadMedicationForDay(...)` und `confirmMedication(...)` aufloest.
- Vorbefuellbare Parameter:
  - Derzeit keine produktiven Intent-/Voice-Prefills.
- Nicht erlaubte Operationen:
  - Kein freier Medikations-Write per Voice.
  - Kein Restock, `set_stock`, Aktivieren/Archivieren oder Loeschen per Intent-/Voice-Fast-Path.
  - Kein Medication-Reorder-Senden ohne separaten Workflow-Vertrag.
- Hinweise / offene Punkte:
  - Pflegehinweis fuer spaetere Satz-Ergaenzungen:
    - Beispiele und Betriebsueberblick: `docs/Voice Command Semantics.md`
    - produktive Match-Regeln liegen in `app/modules/assistant-stack/intent/rules.js`
    - robuste Transkript-/Oberflaechen-Normalisierung liegt in `app/modules/assistant-stack/intent/normalizers.js`
  - Low-Stock-UI, Arztkontakt und Reorder-Vorstufen existieren bereits im Modul und muenden heute in einen engen lokalen Reorder-Startvertrag.
  - Der derzeitige Reorder-nahe Pfad bleibt lokal und UI-confirmed; `mailto:`-Start, `ackLowStock(...)` und Low-Stock-Hinweis werden nicht als Versandnachweis oder Pending-Context-Confirm modelliert.
  - Das Modul traegt jetzt einen lokalen Reorder-Start-Contract mit expliziten Guard-Reasons fuer den Mailto-Pfad; er bleibt ausserhalb von `actions.js`, `allowed-actions.js` und Pending-Context-Confirms.
  - Die Low-Stock-UI unterscheidet jetzt sichtbar zwischen lokal verfuegbarem Reorder-Start, lokal angestossenem `reorder_prompted` und nicht verfuegbarem Kontaktpfad.
  - Vor dem Mailto-Start gibt es jetzt einen engen lokalen Zwei-Schritt-Confirm im Low-Stock-UI; auch danach bleibt der Zustand unterhalb eines behaupteten Versandnachweises.
  - Zusaetzlich schuetzt die UI den lokalen Mailto-Start per kurzem Lock/Cooldown gegen unmittelbares Doppel-Oeffnen; das ist nur lokaler Doppelklick-Schutz, kein Versandtracking.
  - Voice traegt jetzt zusaetzlich einen engen ephemeren Low-Stock-Follow-up nach erfolgreichem `medication_confirm_all`:
    - nur bei frischem realem `low_stock`
    - nur `ja` / `nein`
    - `ja` fuehrt ausschliesslich in denselben lokalen Reorder-Startvertrag
    - kein freier Reorder-Dialog, kein Versand-/Bestellstatus und kein persistenter Resume-Context
  - Future Hook: spaeterer Node-/Shortcut-Anschluss hoechstens oberhalb desselben lokalen Reorder-Starts und nur ohne neue offene Reorder-Session.

---

## 9. Erweiterungspunkte / Zukunft

- Geplante Komfort-Buttons (+28/+56), Bulk-Aktionen.
- E-Mail/Push-Reminder optional.
- Playwright-Szenarien für UI-Smoke.

---

## 10. Feature-Flags / Konfiguration

- Derzeit keine dedizierten Flags; modul deaktivierbar indem Script entfernt wird.
- Low-Stock-Schwellen user-spezifisch (Feld `low_stock_days`).

---

## 11. QA-Checkliste

- Siehe `docs/QA_CHECKS.md` Phase E (Smoke/Sanity/Regression).
- Fokus: Toggles, Low-Stock Box, TAB CRUD, Kartenaktionen, Logging.

---

## 12. Definition of Done

- Module lädt ohne Errors.
- Supabase RPCs + RLS aktiv.
- IN/TAB Panels reflekten Änderungen unmittelbar.
- Dokumentation (Spec, Overview, QA) aktuell; Tests durchgeführt.
