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


## 0. Start hier (aktuell)

Quickstart fuer neue Sessions (Device Scaling):
1) Oeffne:
   - `docs/Device Module Scaling Roadmap.md`
   - `app/styles/hub.css`
   - `app/styles/doctor.css`
   - `app/modules/doctor-stack/charts/chart.css`
   - `app/styles/auth.css`
2) Wichtige Regeln (Lessons Learned):
   - Hub-Panel: Nur `.hub-panel-scroll` scrollt.
   - Keine `overflow`-Scrolls auf `.hub-panel-body`.
   - Kein `height: 100%` auf `.hub-panel-scroll` (Mobile blockiert Scroll).
   - Panel braucht feste Hoehe (`height: min(80vh, 860px)`) damit Scroll-Container wirkt (inkl. doctor/vitals/assistant-text).
3) Breakpoints fuer Device-Scaling:
   - Mobile: <= 640px
   - Tablet-Portrait: 641px - 900px
   - Desktop: >= 901px

---

## 0.1 Aktuelle Device-Scaling Anpassungen

- Mobile (Hub-Panels): Actions werden vertikal gestapelt, Buttons full-width.
- Mobile (Intake/Vitals/Appointments/Assistant): Intake-Inputs groesser, Vitals-Controls gestapelt, Appointments-Header vertikal, Assistant-Input sticky.
- Tablet-Portrait (Doctor/Charts): Doctor-Toolbar gestapelt, Reports in 2 Spalten; Chart-Controls 2 Spalten + KPI-Block full-width.
- Desktop (Profil/Touchlog): Profil-Form 2 Spalten, Diagnostics-Panel breiter.

---

## 0.2 Einstieg fuer neue Chats (Datei-Orientierung)

- `app/styles/hub.css`: Hub-Panels, Scroll-Container, Device-Scaling (Mobile/Tablet/Desktop).
- `app/styles/doctor.css`: Doctor-Ansicht Layout und Tablet-Portrait Regeln.
- `app/modules/doctor-stack/charts/chart.css`: Chart-Panel (Daily) und Tablet-Portrait Regeln.
- `app/styles/auth.css`: Diagnostics/Touchlog Panel Groessen (Desktop).
- `app/styles/layout.css` + `app/styles/ui.css`: globale Layout- und Button-Patterns.

---

## 0.3 Known Gotchas (aus Tests)

- Hub-Panel Scroll: Immer nur `.hub-panel-scroll` scrollen lassen.
- Kein `height: 100%` auf `.hub-panel-scroll` (bricht Mobile-Scroll in Arzt-Ansicht).
- Panel-Hoehe fuer doctor/vitals/assistant-text muss gesetzt sein, sonst kollabiert der Scroll-Container.
- Chart-Panel (`.panel.chart`) ist ein eigenes Overlay, nicht Teil der Hub-Panels.
- Hub-Panel Hoehen (fix): Intake/Appointments/Profile/Doctor/Vitals/Assistant-Text laufen auf `height: min(80vh, 860px)`.

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
| `app/styles/capture.css` | Capture-UI (Intake Panels) |
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
- **`base.css`**: Farben, Typografie, Radius, Shadows, Surfaces, Glows als Tokens.
- Status-Glow Tokens: `--status-glass-*`, `--status-glow-*`, `--status-icon-ok`.
- Keine Feature-Klassen hier.

### 5.2 Layout-Grundlage
- **`layout.css`**: Grid, Header, Main-Container, Panels.
- Nur strukturelle Layouts (kein Modul-spezifischer Look).

### 5.3 Utilities
- **`utilities.css`**: `u-*` Klassen fuer Spacing/Alignment/Text (inkl. Text-Skalen + Label-Pattern).
- Nur Helpers, keine Komponentendefinitionen.

### 5.4 Globale Patterns
- **`ui.css`**: Buttons, Tabs-Pattern (`.tabs`), Pills/Badges, Save-Feedback (`save-flash`, `save-status`).
- Status-Glow Pattern: `.status-glow` (Varianten `.ok`, `.neutral`).
- Zentraler Ort fuer wiederkehrende Patterns.

### 5.5 Feature-CSS
Nur modul-spezifische Komponenten:
- **`hub.css`**: Hub-UI (Aura, Orbit, Panels).
- **`capture.css`**: Intake-Accordion, Progress, Pills.
- **`doctor.css`**: Doctor-Ansicht, KPI/Grids, Trends.
- **`auth.css`**: Login/Unlock/Busy Overlays.
- **`auth.css`**: Login/Unlock/Busy Overlays sowie Diagnostics-Layering im `boot_error` Zustand.
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
  - Status-Glow: `.status-glow`, `.status-glow.ok`, `.status-glow.neutral`.
  - Buttons: `.btn`, `.btn.primary`, `.btn.ghost`.
  - Pills/Badges: `.pill`, `.badge`.
  - Tabs: `.tabs` + `.btn.is-active` (global underline).
  - Panels: `.panel`, `.panel-header`, `.panel-body` (Hub/Capture).
  - Boot error layering: `body[data-boot-stage="boot_error"] #diag` muss ueber `#bootScreen` liegen.
  - Boot error fallback: `.boot-error-fallback-log` (in `base.css`) muss lesbar und scrollbar bleiben.
  - Hub-Scroll: `.hub-panel-scroll` ist der einzige Scroll-Container im Panel (keine `overflow`-Scrolls auf `.hub-panel-body`).
  - Hub-Scroll (Mobile): Kein `height: 100%` auf `.hub-panel-scroll`; nur `max-height` + `min-height` nutzen, sonst blockiert Scroll in der Arzt-Ansicht.

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
- `boot_error`: Diagnostics-Panel ist ueber dem Bootscreen sichtbar/bedienbar (`#diag` > `#bootScreen`).
- Boot-Error-Fallback-Log (`.boot-error-fallback-log`) ist im Overlay lesbar und vertikal scrollbar.

---

## 13. Definition of Done

- Neue Styles sind klar zuordenbar (Token, Utility, Global Pattern, Feature).
- Globale Styles und Feature-Styles sind getrennt.
- Dokumentation aktuell.

---

## 14. Layout Alignment Zielwerte (verbindlich)

Quelle: `docs/Layout Alignment.md`

| Kategorie | Zielwert | Owner (global) |
|----------|----------|----------------|
| Panel-Breite | `width: min(100%, 1200px); max-width: calc(100% - 32px);` (<=640px: `calc(100% - 16px)`) | `app/styles/layout.css` |
| Panel-Padding | `padding: clamp(20px, 3vw, 48px);` (<=640px: `clamp(16px, 6vw, 32px)`) | `app/styles/layout.css` |
| Panel-Radius | `var(--radius-xl)` | `app/styles/base.css`, `app/styles/layout.css` |
| Panel-Header | `min-height: 40px; gap: 16px; margin-bottom: clamp(16px, 2vw, 24px)` | `app/styles/layout.css` |
| Tabs | `.tabs` gap `8px`; `.btn` `height: 40px`; Tabs-Area `--size-tabs-height: 48px`; Underline `2px` bei `-10px` | `app/styles/ui.css`, `app/styles/base.css` |
| Form-Grid | `grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px` | `app/styles/layout.css` |
| Inputs | `min-height: 40px; padding: 10px 12px; border-radius: var(--radius-md); font-size: 1rem` | `app/styles/base.css`, `app/styles/utilities.css` |
| Buttons | `height: 40px; padding: 0 18px; border-radius: 8px; font-size: 1rem` | `app/styles/ui.css` |
| Actions | Form-Ende, links, `gap: 12px`, kein Extra-Margin | `app/styles/layout.css`, `app/styles/ui.css` |
| Cards (Standard) | `padding: 16px; border-radius: var(--radius-lg);` Card-Abstand `16px` | `app/styles/layout.css` |
| Section-Header | `margin-bottom: 12px;` Label-Abstand `6px` | `app/styles/layout.css`, `app/styles/utilities.css` |

Zusatz (Patterns + Tokens)
- Globale Layout-Patterns: `.panel-shell`, `.panel-header`, `.panel-body`, `.form-grid`, `.form-actions`, `.section-header` liegen in `app/styles/layout.css`.
- Tokens in `app/styles/base.css`: `--panel-max-width`, `--panel-side-gap`, `--panel-side-gap-mobile`, `--panel-padding`, `--panel-padding-mobile`, `--panel-radius`, `--panel-header-min-height`, `--panel-header-gap`, `--panel-header-margin`, `--form-grid-min`, `--form-grid-gap`, `--card-padding`, `--card-gap`, `--section-header-margin`, `--label-gap`.
- Input-Token (global): `--input-bg`, `--input-border` in `app/styles/base.css` (greifen in `base.css` + `utilities.css`).
- Globale Form-Pattern: `.field-group`, `.field-group.checkbox`, `.field-hint`, `.field-group .label` in `app/styles/utilities.css`.
- Subtle Cards: `.card.subtle` in `app/styles/layout.css` (Overview-Optik fuer Profile/Appointments).
- Actions-Aliases: `.appointments-actions`, `.profile-actions`, `.medication-form-actions`, `.activity-form-actions`, `.capture-card-actions` als Alias auf `.form-actions` in `app/styles/layout.css`.
