# CSS Module - Functional Overview

Kurze Einordnung:
- Zweck: Zentrale CSS-Struktur fuer MIDAS (Tokens + Utilities + globale Patterns + Feature-CSS).
- Rolle innerhalb von MIDAS: sorgt fuer konsistente UI-Optik, modulare Styles und klare Ablageorte.
- Abgrenzung: keine JS-Logik, keine Datenmodelle.

Related docs:
- [Hub Module Overview](Hub Module Overview.md)
- [Capture Module Overview](Capture Module Overview.md)
- [Doctor View Module Overview](Doctor View Module Overview.md)
- [Auth Module Overview](Auth Module Overview.md)

---

## 1. Zielsetzung

- Problem: Styles sollen schnell auffindbar sein und nicht mehrfach implementiert werden.
- Nutzer: Entwickler (schnelles Auffinden), Designer (konsistente Patterns).
- Nicht Ziel: CSS-Preprocessing oder Build-Pipeline.
- Leitprinzip: Ein Button-Farbwechsel passiert einmal zentral und wirkt global.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/app.css` | Zentrale Bundle-Datei (Import-Reihenfolge) |
| `app/styles/base.css` | Design Tokens (Farben, Typo, Radius, Shadows, Surfaces), Basis-Reset |
| `app/styles/layout.css` | Layout-Struktur (Header, Panels, Grid) |
| `app/styles/utilities.css` | Utilities (u-*) fuer Spacing, Layout, Text-Skalen |
| `app/styles/ui.css` | Globale UI-Patterns (Buttons, Tabs-Pattern, Pills/Badges, Save-Feedback) |
| `app/styles/hub.css` | Hub-spezifische Styles (Orbit, Panels, Aura) |
| `app/styles/capture.css` | Capture-UI (Accordions, Intake, Pills, Progress) |
| `app/styles/doctor.css` | Doctor-Ansicht (Karten, Badges, Grids) |
| `app/styles/auth.css` | Auth-Overlays (Login, Unlock, Busy) |
| `app/modules/doctor-stack/charts/chart.css` | Chart-Styles (Arzt-Ansicht) |
| `index.html` | Bindet `app/app.css` ein |

---

## 3. Datenmodell / Storage

- Kein Storage.
- CSS definiert ausschliesslich visuelle Darstellung.

---

## 4. Ablauf / Logikfluss (Load-Order)

### 4.1 Import-Reihenfolge
`app/app.css` importiert in dieser Reihenfolge:
1) `base.css` (Tokens, Reset)
2) `layout.css` (Layout-Grundlage)
3) `capture.css` (Feature)
4) `doctor.css` (Feature)
5) `auth.css` (Feature)
6) `utilities.css` (Helpers)
7) `ui.css` (Globale Patterns)
8) `hub.css` (Feature)
9) `chart.css` (Feature)

### 4.2 Grundregel
- Tokens/Reset immer zuerst.
- Globale Patterns vor Feature-Overrides.
- Utilities sind stabil und sollen nicht durch Feature-CSS redefiniert werden.
- Tabs laufen ueber das globale `.tabs` Pattern (kein `nav.tabs` mehr).

---

## 5. UI-Integration (Wo kommt was hin?)

### 5.0 Zentrale Steuerung (kurz erklaert)
- Farben/Typo/Spacing kommen aus `base.css` (Tokens).
- Buttons/States/Feedback kommen aus `ui.css` (Patterns).
- Feature-CSS nutzt diese Tokens/Patterns und darf keine eigenen Button-Farben definieren.
- Ergebnis: Eine Aenderung an Tokens oder Patterns wirkt auf alle Module (Intake, Vitals, Profile, Appointments, Assistant, Doctor).

### 5.1 Tokens & Basis
- **`base.css`**: Farben, Typografie, Radius, Shadows, Surfaces als Tokens.
- Keine Feature-Klassen hier.

### 5.2 Layout-Grundlage
- **`layout.css`**: Grid, Header, Main-Container, Panels.
- Nur strukturelle Layouts (kein Modul-spezifischer Look).

### 5.3 Utilities
- **`utilities.css`**: `u-*` Klassen fuer Spacing/Alignment/Text (inkl. Text-Skalen).
- Nur Helpers, keine Komponentendefinitionen.

### 5.4 Globale Patterns
- **`ui.css`**: Buttons, Tabs-Pattern (`.tabs`), Pills/Badges, Save-Feedback (`save-flash`, `save-status`).
- Zentraler Ort fuer wiederkehrende Patterns.

### 5.5 Feature-CSS
Nur modul-spezifische Komponenten:
- **`hub.css`**: Hub-UI (Aura, Orbit, Panels).
- **`capture.css`**: Intake-Accordion, Progress, Pills.
- **`doctor.css`**: Doctor-Ansicht, KPI/Grids, Trends.
- **`auth.css`**: Login/Unlock/Busy Overlays.
- **`chart.css`**: Chart-Visuals in Doctor.

---

## 6. Arzt-Ansicht / Read-Only Views

- Doctor UI lebt in `doctor.css` + `chart.css`.
- Doctor nutzt Tokens/Buttons aus `base.css`/`ui.css`.
- Keine neuen Tokens in `doctor.css` anlegen.

---

## 7. Fehler- & Diagnoseverhalten

- CSS hat keine Fehlerlogik.
- Visuale Fehler (z. B. fehlende Klassen) sind QA-Thema.

---

## 8. Events & Integration Points

- Keine Events.
- Integration nur ueber Klassen/IDs im DOM.
- Kritische Hooks:
  - Save-Feedback: `.save-flash`, `.save-status`.
  - Buttons: `.btn`, `.btn.primary`, `.btn.ghost`.
  - Pills/Badges: `.pill`, `.badge`.
  - Tabs: `.tabs` + `.btn.is-active` (global underline).
  - Panels: `.panel`, `.panel-header`, `.panel-body` (Hub/Capture).

---

## 9. Erweiterungspunkte / Zukunft

- Weitere Feature-CSS Dateien sind ok, wenn sie klar abgegrenzt sind.
- Neue globale Patterns nur in `ui.css`.
- Neue Utilities nur in `utilities.css`.

---

## 10. Feature-Flags / Konfiguration

- Keine CSS Feature-Flags aktuell.
- Konfiguration laeuft ueber Root-Variablen in `base.css`.

---

## 11. Status / Dependencies / Risks

- Status: aktiv.
- Dependencies (hard): `base.css` Tokens fuer alle Module.
- Dependencies (soft): Feature-CSS darf sich nicht gegenseitig ueberschreiben.
- Known issues / risks: Duplicate-Patterns in Feature-CSS, unklare Ablageorte.
- Backend / SQL / Edge: n/a.

---

## 12. QA-Checkliste

- Build laedt nur `app/app.css` (keine Einzel-Imports in HTML).
- Save-Feedback (Flash/Status) nutzt nur `ui.css`.
- Feature-CSS redefiniert keine globalen Patterns.
- Keine doppelten Pattern-Definitionen zwischen Feature-Dateien.

---

## 13. Definition of Done

- Neue Styles sind klar zuordenbar (Token, Utility, Global Pattern, Feature).
- Globale Styles und Feature-Styles sind getrennt.
- Dokumentation aktuell.
