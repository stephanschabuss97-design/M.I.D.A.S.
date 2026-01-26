# Ticker Bar Module - Functional Overview

Kurze Einordnung:
- Zweck: ruhige, passive Statusleiste (Ticker) am unteren Rand mit Terminen.
- Rolle innerhalb von MIDAS: sanfter Hinweis-Kanal, ohne Aktion oder Reminder.
- Abgrenzung: keine Pushes, keine Incidents, keine Lifestyle-Ziele, keine Persistenz.
 - Status: implementiert (Appointments-only, UI-only).

Related docs:
- [MIDAS Ticker Bar Roadmap](../MIDAS Ticker Bar Roadmap.md)
- [Appointments Module Overview](Appointments Module Overview.md)
- [Hub Module Overview](Hub Module Overview.md)
- [CSS Module Overview](CSS Module Overview.md)

---

## 1. Zielsetzung

- Problem: Termine sollen sichtbar sein, ohne den Alltag zu stoeren oder zu erinnern wie eine Fitness-App.
- Nutzer: Patient (passive Info), System (ruhiger Kontextkanal).
- Nicht Ziel: Reminder/Push, Eskalation, Gamification, neue Datenspeicher.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `index.html` | Ticker-Bar Markup / Slot im Layout |
| `app/modules/hub/index.js` | UI-Refresh und Events fuer Ticker-Update |
| `app/modules/appointments/index.js` | Quelle fuer Termine + `appointments:changed` |
| `app/styles/ui.css` | Globales Ticker-Pattern (Buttons/Patterns Regeln beachten) |
| `app/styles/base.css` | Tokens fuer Glass/Glow/Surfaces |
| `app/styles/hub.css` | Hub-Kontext / Layout-Override falls noetig |
| `docs/MIDAS Ticker Bar Roadmap.md` | Regeln, Steps, QA |

---

## 3. Datenmodell / Storage

- Kein eigenes Storage.
- Source of Truth: Termine aus dem Appointments-Modul (UI-State).
- Keine Erweiterungen im Backend oder SQL.

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- Ticker startet unsichtbar und wird erst bei gueltigen Terminen sichtbar.
- Initialer Update kommt beim Hub-Init.

### 4.2 Trigger
- `appointments:changed` triggert Ticker-Update.
- Hub-Init triggert initialen Ticker-Update.

### 4.3 Verarbeitung
- Filter: Termine ab T-2 Tage sichtbar, verschwinden exakt zum Startzeitpunkt.
- Status-Filter: nur geplante Termine (done/abgesagt erscheinen nicht).
- Sortierung: nach Startzeit, fruehester zuerst.
- Textbildung: Termine zu einem ruhigen Lauftext kombinieren.
- Separator: `" | "`.
- Zeitformat: `Heute/Morgen` oder Wochentag (de-AT), Uhrzeit `HH:MM`.

### 4.4 Persistenz
- Keine Persistenz.

---

## 5. UI-Integration

- Position: fixed bottom, immer untergeordnet (niemals in den Vordergrund).
- Vertikaler Abstand (fest): Desktop ca. 36px + safe-area, Mobile ca. 28px + safe-area.
- Sichtbarkeit: nur bei relevanten Terminen, sonst komplett verborgen.
- Lauftext: ruhige Marquee-Animation (reduzierte Bewegung respektieren).
- Milchglas-Optik (Best Practice / Industriestandard im MIDAS-Kontext):
  - nutzt bestehende `--status-glass-*` Tokens statt neue Farben.
  - dezenter Blur/Transparenz, klare Lesbarkeit, kein aggressiver Glow.
  - keine Animationen ausser sanftem Lauftext.
  - ausreichender Kontrast und safe-area Ruecksicht auf Mobile.
  - zentriert mit max-width analog Panel-Breite.

---

## 6. Arzt-Ansicht / Read-Only Views

- Keine Arzt-Ansicht.

---

## 7. Fehler- & Diagnoseverhalten

- Fehler oder fehlende Daten fuehren zu verstecktem Ticker (silent fail).
- Keine User-Fehlermeldungen.
 - Kein Crash, falls Markup fehlt.

---

## 8. Events & Integration Points

- Public API / Entry Points: Hub-Refresh, `appointments:changed`.
- Source of Truth: Appointments UI-State (`getAll()`).
- Side Effects: Toggle Sichtbarkeit, Update Lauftext.
- Constraints: nur Termine; kein Push, kein Incident, keine Erwartungen.

---

## 9. Erweiterungspunkte / Zukunft

- Medizinische Erwartungen (zeitgebunden), spaeter optional.
- Incidents/Push als separater Kanal (eigene Roadmap).
- Personalisierte Prioritaeten oder Stummschaltung.
 - Optional: statischer Text bei kurzen Lauftexten (kein Marquee).

---

## 10. Feature-Flags / Konfiguration

- Keine dedizierten Flags.

---

## 11. Status / Dependencies / Risks

- Status: aktiv (Appointments-only, UI-only).
- Dependencies (hard): Appointments-Modul, Hub-UI-Refresh, Tokens in `base.css`.
- Dependencies (soft): Layout in `ui.css`/`hub.css`.
- Known issues / risks: Timezone/Startzeit, Lesbarkeit bei Glasoptik, zu viel Sichtbarkeit.

---

## 12. QA-Checkliste

- T-2 sichtbar, zum Startzeitpunkt weg.
- Mehrere Termine: korrekt kombiniert, ruhiger Text.
- Kein Ticker wenn keine Termine.
- Mobile: keine Ueberlappung mit System-Safe-Area.
 - Reduzierte Bewegung: Marquee deaktiviert.

---

## 13. Definition of Done

- Ticker ist ruhig, sichtbar nur bei Terminen.
- Milchglas-Optik konsistent zu Tokens/Status-Glow.
- Dokumentation aktuell und erweiterbar.
