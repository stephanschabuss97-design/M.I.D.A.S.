# CSS Rework (Marktstandard)

Ziel: CSS-Struktur nach Best Practice ausrichten (Tokens + Utilities zentral, Feature-CSS modular). Save-Handler-Vereinheitlichung kommt danach.

## Leitbild (CSS-Architektur)
- **Zentral**: Tokens/Variablen, Utilities und globale Patterns in wenigen Dateien.
- **Modular**: Feature-CSS (z. B. capture, doctor, auth) bleibt modular, nutzt aber nur zentrale Tokens/Utilities.
- **Ohne Dupes**: Keine doppelten Layout- oder Status-Pattern in Feature-Dateien.
- **Stabil**: Alias/Legacy nur als Uebergang, danach entfernen.

## Umbau-Schritte (Plan)
1) **CSS-Inventarisierung**
   - 1.1 (done) Dateien und Verantwortlichkeiten listen (base/ui/utilities + feature-CSS).
     - core: `app/styles/base.css`, `app/styles/ui.css`, `app/styles/utilities.css`
     - feature: `app/styles/capture.css`, `app/styles/doctor.css`, `app/styles/auth.css`, `app/styles/hub.css`
   - 1.2 (done) Doppelte Patterns markieren (Buttons, Panels, Status, Progress, Pills).
     - Status: `.medication-form-status` vs `.u-status-muted` (zentralisiert)
     - Flash: `.panel-flash` vs `.btn.flash` (unterschiedliche Ziele)
     - Progress/Pills: mehrfach in `capture.css` (ok/warn/bad/neutral Varianten)
     - Button-Sizing: wiederholt in `hub.css` (12px/4px 10px)
   - 1.3 (done) Legacy/Alt-Styles erfassen (Aliases, alte Klassen, Alt-Variablen).
     - Legacy-Variablen in `app/styles/base.css` (z. B. --ok, --warn, --danger)
   - 1.4 (done) Ergebnis als Matrix festhalten (Datei -> Pattern -> Zielort).

| Datei | Rolle | Pattern | Zielort |
| --- | --- | --- | --- |
| app/styles/base.css | Tokens/Vars | Farben/Shadow/Spacing | base.css |
| app/styles/ui.css | Globale Patterns | Buttons/Status/Flash | ui.css |
| app/styles/utilities.css | Utilities | Spacing/Status-Helper | utilities.css |
| app/styles/capture.css | Feature | Progress/Pills/Accordion | capture.css (nur Feature) |
| app/styles/doctor.css | Feature | Badges/Grids/Trendpilot | doctor.css (nur Feature) |
| app/styles/auth.css | Feature | Overlays/Panel | auth.css (nur Feature) |
| app/styles/hub.css | Feature | Hub-Layout/Quickbar | hub.css (nur Feature) |

2) **Zielarchitektur definieren**
   - 2.1 (done) Zentrale Dateien festlegen (Tokens/Utilities/Globals).
     - Tokens/Vars: `app/styles/base.css`
     - Globals/Patterns: `app/styles/ui.css`
     - Utilities: `app/styles/utilities.css`
   - 2.2 (done) Feature-Dateien definieren (Capture/Doctor/Auth/Hub etc.).
     - Capture: `app/styles/capture.css`
     - Doctor: `app/styles/doctor.css`
     - Auth/Overlays: `app/styles/auth.css`
     - Hub/Layout: `app/styles/hub.css`
   - 2.3 (done) Regeln: Was darf wohin (kein globales Pattern in Feature-CSS).
     - Feature-CSS nur Layout + spezifische Komponenten, keine globalen Status/Buttons
     - Globale Patterns nur in ui.css, Tokens nur in base.css
   - 2.4 (done) Naming-Konventionen fuer Utilities/Patterns.
     - Utilities: `u-*`
     - Patterns: `save-*`, `panel-*`, `btn-*`

3) **Globale Patterns & Tokens**
   - 3.1 (done) Tokens konsolidieren (Farben, Border, Shadow, Spacing).
     - Primar in `app/styles/base.css` (Farben/Shadow/Spacing Tokens)
     - Legacy-Aliases bleiben temporaer
   - 3.2 (done) Utilities konsolidieren (Status, Spacing, Alignment, Text).
     - Utilities bleiben in `app/styles/utilities.css` (u-*)
     - Status-Utility wird ueber `save-status` in `app/styles/ui.css` abgedeckt
   - 3.3 (done) Globale Komponenten-Patterns sammeln (Panels, Buttons, Progress, Pills).
     - Buttons/Flash/Status in `app/styles/ui.css`
     - Progress/Pills bleiben Feature, aber mit Tokens
   - 3.4 (done) Uebergangs-Plan fuer Legacy-Aliases (entfernen nach Migration).
     - Nach Feature-Migration: Legacy-Variablen in base.css entfernen

4) **Feature-CSS harmonisieren**
   - 4.1 (done) Capture: doppelte Progress/Pill-Styles auf globale Patterns mappen.
     - Doppelte `#lifestyle .progress` Selector entfernt in `app/styles/capture.css`
   - 4.2 (done) Doctor: doppelte Actions/Badges auf globale Patterns mappen.
     - Doppelte `.tp-actions` zusammengefuehrt in `app/styles/doctor.css`
   - 4.3 (done) Auth: Panel/Overlay-Styles auf globale Patterns mappen.
     - Doppelte Login/AppLock Card-Styles zusammengefuehrt in `app/styles/auth.css`
   - 4.4 (done) Hub: wiederholte Button-Sizing/Border/Background zentralisieren.
     - Tab-Button Styles in `app/styles/hub.css` zusammengefuehrt (intake/appointments/profile/vitals)

5) **Refactor & Cleanup**
   - 5.1 (done) Doppelte Selektoren entfernen.
     - capture.css: doppeltes `#lifestyle .progress` entfernt
     - doctor.css: doppelte `.tp-actions` zusammengefuehrt
     - auth.css: doppelte Login/AppLock Card-Styles zusammengefuehrt
     - hub.css: doppelte Tab-Button-Styles zusammengefuehrt
   - 5.2 (done) Legacy-Klassen entfernen oder auf neue Tokens mappen.
     - Status-Altklassen entfernt (panel-flash/medication-form-status/u-status-muted)
     - neue Klassen: save-flash/save-status in ui.css
   - 5.3 (done) Visual Smoke-Check (nur Optik).
     - Alle Module ok, Farben ok; Auth-Overlay wirkt halb transparent (bekannt, vorerst ok)
   - 5.4 (done) Kontrast/Motion-Check.
     - Visuell ok, Auth-Overlay bleibt vorerst halb transparent
   - 5.5 (done) Artefakt-Check (keine kaputten Zeichen).
     - index.html:826 "Eintr?0ge" -> "Eintraege"
     - index.html:849 "J?0hrlich" -> "Jaehrlich"
    - app/styles/hub.css:1822 "moeglich" (Kommentar)

6) **Save-Handler Vereinheitlichung (Training als Referenz)**
   - 6.1 (done) Referenz definieren: Training-Save als Vorbild (Button-OK + Panel-Flash + lokaler Fehlertext).
   - 6.2 (done) Gemeinsame Save-Feedback-API festlegen (z. B. `saveFeedback.start/ok/error`).
     - `saveFeedback.start({ button, panel, statusEl, label })`
     - `saveFeedback.ok({ button, panel, statusEl, successText })`
     - `saveFeedback.error({ button, panel, statusEl, message })`
   - 6.3 (done) Save-Feedback-Helper zentral implementieren (ohne Modul-Code-Dupes).
     - Zentraler Helper `saveFeedback` in `assets/js/ui.js`
   - 6.4 Module migrieren (Vitals -> Intake -> Notes -> Medikation -> Profile -> Termine -> Auth-Konfig).
     - 6.4.1 (done) Vitals/Training: BP/Body/Lab/Training in `assets/js/main.js` auf saveFeedback umgestellt
     - 6.4.2 (done) Intake: Capture Saves in `app/modules/intake-stack/intake/index.js` auf saveFeedback umgestellt
     - 6.4.3 (done) Notes: Notiz-Sync in `app/supabase/api/notes.js` auf saveFeedback.error umgestellt
     - 6.4.4 (done) Medikation: Save-Form + Stock-Aktionen auf saveFeedback umstellen
     - 6.4.5 (done) Profile: Profil-Save auf saveFeedback umstellen
     - 6.4.6 (done) Termine: Appointment-Save/Toggle/Delete auf saveFeedback umstellen
     - 6.4.7 (done) Auth-Konfig: Config-Save auf saveFeedback umstellen
   - 6.5 Alte Feedback-Wege entfernen (uiInfo/uiError fuer Save, alte Status-Texte).
     - 6.5.1 (done) Save-Flows: uiInfo/uiError durch saveFeedback ersetzen (Save-Kontext).
       - BP Save: fehlender Button-Guard nutzt saveFeedback.error in `assets/js/main.js`
     - 6.5.2 (done) Alte Status-Texte/Labels entfernen (z. B. "Gespeichert.").
       - In Save-Flows keine alten "Gespeichert."-Status mehr, alles via saveFeedback
     - 6.5.3 (done) Alte Helper entfernen (z. B. flashButtonOk, doppelte Busy-Logik).
       - flashButtonOk entfernt (keine Referenzen mehr)
     - 6.5.4 (done) Fallbacks pruefen (saveFeedback fehlt -> uiError).
       - saveFeedback wird defensiv mit optional chaining genutzt
       - notes.js faellt auf uiError zurueck, falls saveFeedback fehlt
     - 6.5.5 (done) Smoke-Check fuer Save-Fehlertexte.
   - 6.6 (done) Smoke-Check pro Modul (Save + Fehler).

7) **Pflichtfeld-Validierung (HTML5 statt Custom-Text)**
   - 7.1 (done) Standard definieren: required/min/pattern nutzen.
   - 7.2 (done) Submit-Handler: `form.reportValidity()` vor Save.
   - 7.3 (done) Manuelle Pflichtfeld-Fehlertexte entfernen.
   - 7.4 (done) SaveFeedback bleibt fuer Netzwerk/Auth/Serverfehler.
   - 7.5 Formular-fuer-Formular Migration (Profile, Termine, Medikation, Intake, BP/Body/Lab).
     - 7.5.1 (done) Profile: required + reportValidity + remove custom required texts
       - reportValidity bereits aktiv im Save-Handler, keine custom required Texte vorhanden
     - 7.5.2 (done) Termine: required + reportValidity + remove custom required texts
       - reportValidity aktiv, custom "Titel/Datum fehlt" entfernt
     - 7.5.3 (done) Medikation: required + reportValidity + remove custom required texts
       - reportValidity aktiv, "Name ist Pflicht." entfernt
     - 7.5.4 (done) Intake: required + reportValidity + remove custom required texts
       - cap-water-add required + reportValidity
       - salt/protein combo nutzt reportValidity (mindestens ein Feld)
     - 7.5.5 (done) BP/Body/Lab: required + reportValidity + remove custom required texts
       - BP: sys/dia missing -> reportValidity statt uiError
       - Lab: creatinine required -> reportValidity statt uiError
   - 7.6 (done) QA: Pflichtfeld leer -> Browser-Popup, Save ok -> saveFeedback.

## Notizen
- Marktstandard: zentraler Design-Core + modulare Feature-CSS.
- Save-Handler-Rework folgt nach dem CSS-Umbau.

8) **Globale CSS-Harmonisierung (Buttons, Cards, Pills, Typo)**
   - 8.1 CSS-Inventar erweitern: alle lokalen Button/Spacing/Fontsize-Overrides sammeln.
     - 8.1.1 (done) Dateien scannen (capture/doctor/auth/hub/base/ui/utilities).
       - `app/styles/capture.css`: `.panel-actions .btn` (min-width), `#cap-intake-wrap ... .btn` (width: 100%).
       - `app/styles/auth.css`: `#appLock .btn.primary`, `#loginOverlay .btn.primary` (background/color).
       - `app/styles/hub.css`: Tabs `.btn` (min-width/transform), `.hub-vitals-actions .btn` (min-width), `.assistant-panel-actions .btn.small` (padding/border-radius), confirm/followup `.btn` (min-width), `.medication-card .btn` (width).
       - `app/styles/doctor.css`: keine `.btn` Overrides mehr vorhanden.
     - 8.1.2 (done) Trefferliste erstellen (Selector + Eigenschaft + Datei).
       - `app/styles/capture.css`: `.panel-actions .btn` -> `min-width: 160px`
       - `app/styles/capture.css`: `#cap-intake-wrap .row > div:last-child .btn` -> `width: 100%`
       - `app/styles/auth.css`: `#appLock .btn.primary` -> `background: var(--color-accent)`, `color: #fff`
       - `app/styles/auth.css`: `#loginOverlay .btn.primary` -> `background: var(--color-accent)`, `color: #fff`
       - `app/styles/hub.css`: `.hub-intake-tabs .btn` -> `min-width: 70px`
       - `app/styles/hub.css`: `.hub-appointments-tabs .btn` -> `min-width: 90px`
       - `app/styles/hub.css`: `.hub-profile-tabs .btn` -> `min-width: 90px`
       - `app/styles/hub.css`: `.hub-vitals-tabs .btn` -> `min-width: 70px`, `transform: translateY(-6px)`
       - `app/styles/hub.css`: `.hub-vitals-tabs .btn:not(:disabled):active` -> `transform: translateY(-6px)`
       - `app/styles/hub.css`: `.hub-vitals-actions .btn` -> `min-width: 140px`
       - `app/styles/hub.css`: `.capture-card-actions .btn` -> `margin-top: 0`
       - `app/styles/hub.css`: `.medication-card-grid .medication-card .btn` -> `align-self: stretch`, `width: 100%`
       - `app/styles/hub.css`: `.assistant-panel-actions .btn.small` -> `padding: 4px 10px`, `border-radius: 999px`
       - `app/styles/hub.css`: `.assistant-confirm-actions .btn` -> `min-width: 120px`
       - `app/styles/hub.css`: `.assistant-confirm-block.is-busy .btn` -> `opacity: 0.6`, `pointer-events: none`
       - `app/styles/hub.css`: `.assistant-followup-actions .btn` -> `min-width: 120px`
     - 8.1.3 (done) Doppelte/nahezu gleiche Regeln clustern.
       - Button-Min-Width Cluster: 70px (hub-intake-tabs, hub-vitals-tabs), 90px (hub-appointments-tabs, hub-profile-tabs), 120px (assistant-confirm/followup), 140px (hub-vitals-actions), 160px (capture panel-actions).
       - Button-Full-Width Cluster: `width: 100%` (capture intake row button, medication card button).
       - Button-Primary Color Override: `background: var(--color-accent) + color: #fff` (auth login/app lock).
       - Button-Small Chip: `padding: 4px 10px` + `border-radius: 999px` (assistant panel small buttons).
       - Button-Active Offset: `transform: translateY(-6px)` (hub vitals tabs active/pressed).
       - Button-Busy State: `opacity: 0.6` + `pointer-events: none` (assistant confirm busy).
   - 8.2 Cards/Panels: Schatten/Radien/Backgrounds in Tokens ueberfuehren.
     - 8.2.1 (done) Aktuelle Card/Panel-Varianten sammeln.
       - `app/styles/auth.css`: `.panel` (radius 12px, shadow 0 6px 18px), `.lock-card/.login-card` (radius 16px, shadow 0 18px 48px).
       - `app/styles/capture.css`: `.capture-card` (radius 8px, shadow var(--shadow-soft)), `.card-nested` (radius 8px, shadow var(--shadow-soft)), `.intake-card` (radius 20px), `.pill` (radius 999px).
       - `app/styles/doctor.css`: `.doctor-trendpilot` (radius 12px, shadow 0 4px 12px), `.doctor-view .doctor-day` (radius 12px, shadow 0 6px 18px), `.doctor-report-card` (radius 12px, shadow 0 4px 12px), `.doctor-inbox-panel` (shadow 0 18px 48px, radius 0).
       - `app/styles/hub.css`: `.hub-panel` (radius 32px, shadow 0 40px 70px), `.intake-card` (radius 20px), `.medication-card` (radius 18px), `.appointments-card` (radius 16px), `.assistant-suggest-card` (radius 14px).
     - 8.2.2 (done) Ziel-Tokens definieren (Radius, Shadow, Surface).
       - Radius-Tokens: `--radius-sm` (8px), `--radius-md` (12px), `--radius-lg` (16px), `--radius-xl` (20px), `--radius-pill` (999px).
       - Shadow-Tokens: `--shadow-card` (0 4px 12px rgba(0,0,0,.25)), `--shadow-panel` (0 6px 18px rgba(0,0,0,.25)), `--shadow-modal` (0 18px 48px rgba(0,0,0,.35)), `--shadow-hub-panel` (0 40px 70px rgba(0,0,0,.6)).
       - Surface-Tokens: `--surface-card` (var(--color-surface-card)), `--surface-card-secondary` (var(--color-surface-card-secondary)), `--surface-elevated` (var(--color-surface-elevated)).
     - 8.2.3 (done) Feature-CSS auf Tokens umstellen.
       - Capture: `.capture-card`, `.card-nested`, `.intake-card`, `.pill` -> Radius/Shadow/Surface ueber Tokens.
       - Doctor: `.doctor-trendpilot`, `.doctor-day`, `.doctor-report-card`, `.doctor-inbox-panel` -> Radius/Shadow/Surface ueber Tokens (Inbox Panel bleibt radius 0).
       - Auth: `.panel`, `.lock-card`, `.login-card` -> Radius/Shadow/Surface ueber Tokens.
       - Hub: `.hub-panel`, `.intake-card`, `.medication-card`, `.appointments-card`, `.assistant-suggest-card` -> Radius/Shadow/Surface ueber Tokens.
   - 8.3 Pills/Badges: Statusfarben/Border/Size in globale Patterns ueberfuehren.
     - 8.3.1 (done) Alle Pills/Badges erfassen (Status, Size, Border).
       - `app/styles/capture.css`: `.pill` (base + ok/warn/bad/neutral/plain) + `.pill .dot`.
       - `app/styles/doctor.css`: `.badge` (KPI) + `.tp-badge` (warning/critical/info).
       - `app/styles/hub.css`: `.hub-intake-pills .cap-pill`, `.intake-pill-slot .pill`, `.assistant-pill`.
     - 8.3.2 (done) Globales Pattern in `ui.css` definieren (Klassen + Tokens).
       - Basisklasse: `.pill` (inline-flex, gap, padding, border, radius, font-size/weight).
       - Statusklassen: `.pill.ok`, `.pill.warn`, `.pill.bad`, `.pill.neutral`, `.pill.plain`.
       - Optionaler Dot: `.pill .dot` + Statusfarben ueber Tokens.
       - Badge-Variante: `.badge` + `.badge.good/.bad` als Alias auf Pill-Status.
     - 8.3.3 (done) Feature-CSS auf Pattern umstellen.
       - `app/styles/ui.css`: globale `.pill` + `.badge` Patterns hinzugefuegt.
       - `app/styles/capture.css`: lokale `.pill*` Regeln entfernt (nutzt jetzt globale Pattern).
       - `app/styles/doctor.css`: lokale `.badge*` Regeln entfernt (nutzt jetzt globale Pattern).
   - 8.4 Typo-Skalen: 12/13/14/16px in zentrale Tokens + Utilities ueberfuehren.
     - 8.4.1 (done) Schriftgroessen-Cluster erfassen.
       - 11px: `app/styles/doctor.css` (measure-head, report-tag).
       - 12px: `app/styles/ui.css` (.small, pills), `app/styles/doctor.css` (labels/meta), `app/styles/auth.css` (hints), `app/styles/base.css` (form controls), `app/styles/utilities.css` (diag-log), `app/styles/capture.css` (pills).
       - 13px: `app/styles/ui.css` (.badge), `app/styles/doctor.css` (text/meta), `app/styles/auth.css` (panel content).
       - 14px: `app/styles/auth.css` (panel content).
       - 15px: `app/styles/ui.css` (trendpilot dialog).
       - 16px: `app/styles/doctor.css` (date cloud), `app/styles/doctor.css` (report period).
       - 20px: `app/styles/layout.css` (h1).
     - 8.4.2 (done) Tokens/Utilities definieren (z. B. `--text-xs`, `.u-text-xs`).
       - Tokens: `--text-xxs` (11px), `--text-xs` (12px), `--text-sm` (13px), `--text-md` (14px), `--text-lg` (16px), `--text-xl` (20px).
       - Utilities: `.u-text-xxs`, `.u-text-xs`, `.u-text-sm`, `.u-text-md`, `.u-text-lg`, `.u-text-xl`.
     - 8.4.3 (done) Feature-CSS auf Tokens/Utilities umstellen.
       - `app/styles/base.css`: Text-Token hinzugefuegt (`--text-xxs` bis `--text-xl`).
       - `app/styles/utilities.css`: Utilities `.u-text-*` hinzugefuegt, diag-log nutzt Token.
       - `app/styles/ui.css`: `.small`, pills, badges, hints auf Text-Tokens umgestellt.
       - `app/styles/auth.css`, `app/styles/capture.css`, `app/styles/doctor.css`, `app/styles/layout.css`: font-size auf Text-Tokens umgestellt.
   - 8.5 Mapping-Matrix erstellen (lokales Pattern -> globaler Token/Pattern).
     - 8.5.1 (done) Mapping pro Feature-Datei auflisten.
       - `app/styles/capture.css`: Panels/Cards -> `--surface-card(-secondary)` + `--shadow-card` + `--radius-sm`; Pills -> global `.pill`; Button widths -> globale Button-Utilities (spaeter).
       - `app/styles/doctor.css`: Cards/Reports -> `--surface-card` + `--shadow-card` + `--radius-md`; Badges -> global `.badge`; Typo -> `--text-*`.
       - `app/styles/auth.css`: Panels/Overlays -> `--surface-card` + `--shadow-modal` + `--radius-lg`; Primary Button Farbe -> global `.btn.primary` (keine lokalen Farben); Typo -> `--text-*`.
       - `app/styles/hub.css`: Hub-Panel -> `--shadow-hub-panel` + `--radius-xl`; Cards -> `--shadow-card` + `--radius-md/lg`; Pills -> global `.pill`; Typo -> `--text-*`.
     - 8.5.2 (done) Offene Entscheidungen markieren (benoetigte neue Tokens).
       - Card-Standard: Ein gemeinsamer Shadow/Radius fuer alle Cards oder zwei Stufen (Card vs Panel)?
       - Panel-Standard: Hub-Panel bleibt Sonderfall (groesserer Shadow/Radius) oder globaler Panel-Token?
       - Pills/Badges: Soll `badge` nur Alias von `pill` sein oder eigenes Pattern behalten?
       - Button-Widths: Gemeinsame Utility-Klassen (`.u-btn-wide`, `.u-btn-full`) oder in Pattern aufnehmen?
       - Assistant-Pills: bleiben spezielle Layouts (Grid/Value) oder werden auf generische Pills reduziert?
   - 8.6 Schrittweise Migration pro Feature-CSS (Capture, Doctor, Auth, Hub).
     - 8.6.1 (done) Capture migrieren + Smoke-Check.
       - `app/styles/base.css`: Radius/Shadow/Surface Tokens hinzugefuegt.
       - `app/styles/capture.css`: Accordions, Cards, Intake-Wrapper, Inputs auf Tokens umgestellt.
     - 8.6.2 (done) Doctor migrieren + Smoke-Check.
       - `app/styles/doctor.css`: Cards/Reports/Panels auf Radius/Shadow/Surface-Tokens umgestellt, Pills/Borders auf Token-Radius.
     - 8.6.3 (done) Auth migrieren + Smoke-Check.
       - `app/styles/auth.css`: Panels/Overlays auf Radius/Shadow/Surface-Tokens umgestellt, Primary-Button Override entfernt.
     - 8.6.4 (done) Hub migrieren + Smoke-Check.
       - `app/styles/hub.css`: Hub-Panel auf Token-Radius/Shadow umgestellt, Kern-Cards (intake/medication/appointments/profile/assistant) auf Token-Radius gemappt.
   - 8.7 QA: visuelle Regression (Buttons, Cards, Pills, Typo) pro Modul.
     - 8.7.1 (done) Vorher/Nachher-Screens pruefen.
     - 8.7.2 (done) Kritische Abweichungen sammeln (keine gefunden).
   - 8.8 Cleanup: alte lokale Overrides entfernen, Doku aktualisieren.
     - 8.8.1 (done) Verwaiste Klassen entfernen.
       - `app/styles/ui.css`: `--color-surface-elevated` durch `--surface-elevated` ersetzt, `--shadow-soft` durch `--shadow-card`.
       - `app/styles/layout.css`: `--shadow-soft` durch `--shadow-card`.
     - 8.8.2 (done) CSS Module Overview aktualisieren.
