# Layout Alignment Roadmap (Deterministic)

Zweck
- Eine deterministische Schrittfolge, die Layout und Spacing ueber alle Module vereinheitlicht.
- Ergebnis: eine App "wie aus einem Guss" (Profil + Termine sind die Referenz fuer Look & Dichte).
- Diese Datei ist der Einstiegspunkt fuer neue Sessions: starte bei "Start hier".

Start hier (fuer neue Sessions)
1) Oeffne diese Dateien:
   - `docs/Layout Alignment.md` (dieses Dokument)
   - `docs/modules/CSS Module Overview.md` (Source of Truth fuer CSS-Architektur)
2) Nutze Profil + Termine als visuelles Zielbild.
   - Appointments: `"C:\Users\steph\Pictures\Screenshots\Screenshot 2026-01-18 211425.png"`
   - Profile: `"C:\Users\steph\Pictures\Screenshots\Screenshot 2026-01-18 211444.png"`
3) Pruefe den Status-Block unten und setze beim ersten "pending" Step fort.

Status (immer hier aktualisieren)
- Step 1: completed
- Step 2: completed
- Step 3: completed
- Step 4: completed
- Step 5: completed
- Step 6: completed
- Step 7: completed

Scope
- Layout-Patterns definieren und ueber alle Module vereinheitlichen.
- Abstaende, Feldhoehen, Button-Placement, Card-Dichten konsistent machen.
- HTML nur anpassen, wenn CSS alleine kein konsistentes Layout ermoeglicht.

Nicht im Scope
- Neues UI-Design, neue Features, oder Business-Logik.
- JS-Refactors ausserhalb von noetigen Layout-Adjustments.

Definitionen (verbindlich)
- Panel: Hauptcontainer eines Moduls (Header + Content).
- Card: Untersektion innerhalb eines Panels (z. B. Intake-Karten).
- Form-Grid: Raster fuer Eingabefelder im Panel oder in einer Card.
- Actions: Primar/Sekundaer-Buttons fuer Speichern/Reset/Archiv etc.
- Tabs: Modulinterne Navigation (globales `.tabs` Pattern, keine Modulvarianten).
- Inputs: Textfelder, Selects, Date/Time, Textarea (einheitliche Hoehe/Padding).

Zielbild (Referenz)
- Profil + Termine sind die visuelle Referenz (Spacing, Dichte, Feldhoehen, Button-Placement).
- Abweichungen anderer Module werden auf dieses Zielbild hin normalisiert.

Zielwerte (festgelegt)
- Panel-Breite: `width: min(100%, 1200px); max-width: calc(100% - 32px);` (<=640px: `calc(100% - 16px)`).
- Panel-Padding: `padding: clamp(20px, 3vw, 48px);` (<=640px: `clamp(16px, 6vw, 32px)`).
- Panel-Radius: `var(--radius-xl)` (20px).
- Panel-Header: `min-height: 40px; gap: 16px; margin-bottom: clamp(16px, 2vw, 24px)`.
- Tabs: `.tabs` `gap: 8px`, `.btn` `height: 40px`, Tabs-Area `--size-tabs-height: 48px`, Underline `2px` bei `-10px`.
- Form-Grid: `grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px`.
- Inputs: `min-height: 40px; padding: 10px 12px; border-radius: var(--radius-md); font-size: 1rem`.
- Buttons: `.btn` `height: 40px; padding: 0 18px; border-radius: 8px; font-size: 1rem`.
- Actions: im Form-Grid als letzte Zeile, links ausgerichtet (`justify-content: flex-start`), `gap: 12px`, kein Extra-Margin ausserhalb des Grid-Gaps.
- Cards (Standard): `padding: 16px; border-radius: var(--radius-lg);` Abstand zwischen Cards: `16px`.
- Section-Header: `margin: 0 0 12px;` Label-Abstand: `6px` vor Inputs.

Alignment-Matrix (Template)
Diese Matrix wird in Step 2 ausgefuellt. Sie ist die Quelle fuer Abweichungen.

| Kategorie | Ziel (Token/Pattern) | Intake | Vitals | Doctor | Profil | Termine | Auth | Hub | Delta? |
|----------|----------------------|--------|--------|--------|--------|---------|------|-----|--------|
| Panel-Breite | `min(100%, 1200px); max-width: calc(100% - 32px)` (<=640px: `-16px`) | `hub-panel` (gleich Ziel) | `hub-panel` (gleich Ziel) | `hub-panel` (gleich Ziel) | `hub-panel` (gleich Ziel) | `hub-panel` (gleich Ziel) | `min(420px, 92vw)` (login/lock) | `.hub width: min(1200px, 100%)` | Auth: yes; Hub: n/a |
| Panel-Padding | `clamp(20px, 3vw, 48px)` (<=640px: `clamp(16px, 6vw, 32px)`) | `hub-panel` (gleich Ziel) | `hub-panel` (gleich Ziel) | `hub-panel` (gleich Ziel) | `hub-panel` (gleich Ziel) | `hub-panel` (gleich Ziel) | `18px` (login/lock) | `.hub padding: clamp(12px,2vw,24px) 24..48 28..56` | Auth: yes; Hub: n/a |
| Panel-Header (Hoehe + Spacing) | `min-height: 40px; gap: 16px; mb: clamp(16px, 2vw, 24px)` | `gap 16; mb clamp(16..24); min-height fehlt` | `gap 16; mb clamp(16..24); min-height fehlt` | `gap 16; mb clamp(16..24); min-height fehlt` | `gap 16; mb clamp(16..24); min-height fehlt` | `gap 16; mb clamp(16..24); min-height fehlt` | n/a | n/a | Intake/Vitals/Doctor/Profil/Termine: yes (min-height fehlt) |
| Tabs-Hoehe/Padding | `.tabs` gap `8px`; `.btn` `height: 40px`; tabs area `--size-tabs-height: 48px` | `margin 0 0 12; btn min-w 70` | `margin -12 0 -4; btn translateY(-6)` | `.doctor-tabs mb 12` | `margin 0 0 12; btn min-w 90` | `margin 0 0 12; btn min-w 90` | n/a | n/a | Vitals: yes (negative margin + translateY) |
| Form-Grid Spalten | `repeat(auto-fit, minmax(260px, 1fr))` | `intake-card-grid 1/2 cols; fields minmax 160` | `activity minmax 180; lab minmax 200` | n/a | `.form-grid minmax 260` | `.appointments-grid minmax 260` | n/a | n/a | Intake: yes; Vitals: yes |
| Form-Grid Gap | `16px` | `card-grid 16; fields 12` | `activity 14; lab 16` | n/a | `16` | `16` | n/a | n/a | Intake: yes (12); Vitals: yes (14) |
| Input-Hoehe | `min-height: 40px; padding: 10px 12px; radius: 12px` | `.capture-card input: padding 4 0; font-size 1.1; no min-height` | base inputs (ok) | n/a | base inputs (ok) | base inputs (ok) | base inputs (ok) | n/a | Intake: yes |
| Button-Groesse | `.btn` `height: 40px; padding: 0 18px; radius: 8px` | `.btn 40px` | `.btn 40px; actions min-w 140` | `.btn 40px` | `.btn 40px` | `.btn 40px` | `.btn 40px` | n/a | Vitals: partial (min-width 140) |
| Actions-Placement | Form-Ende, links, `gap: 12px`, kein Extra-Margin | `capture-card-actions in cards` | `actions in header/inline; margin-left auto` | `actions im Header` | `profile-actions nach Form, links` | `appointments-actions nach Form, links` | n/a | n/a | Intake/Vitals/Doctor: yes |
| Card-Dichte | `padding: 16px; radius: var(--radius-lg);` Card-Abstand `16px` | `.intake-card padding 16; radius xl` | `.card-nested padding 24x20; radius sm` | `.card padding 24x20; radius 8` | `.profile-overview padding 24; radius lg` | `overview padding 24/radius xl; cards 16/radius lg` | `login/lock padding 18; radius lg` | n/a | Intake: yes (radius); Vitals/Doctor: yes; Profil/Termine: partial; Auth: yes |
| Section-Header Spacing | `margin-bottom: 12px; label-gap: 6px` | `labels via gaps; blockTitle hidden` | `labels gap 6` | `doctor-tabs mb 12` | `field-group gap 6` | `overview header mb 16` | n/a | n/a | Intake: yes; Termine: yes (16) |

Deterministische Steps (mit klaren Outputs)

Step 1: Zielwerte festlegen (Global Patterns)
1.1 Definiere die Zielwerte fuer:
    - Panel-Breite, Panel-Padding, Header-Hoehe
    - Tabs-Hoehe/Padding/Underline
    - Form-Grid Spalten & Gaps
    - Input-Hoehe/Padding/Label-Abstand
    - Button-Groessen (Primary/Secondary/Ghost)
    - Actions-Placement (immer im Form-Grid, links ausgerichtet)
    - Card-Dichte (Innenabstand, Abstand zwischen Cards)
1.2 Dokumentiere die Zielwerte in `docs/modules/CSS Module Overview.md`.
Output: klar definierte Zielwerte + Doku aktualisiert.
Exit-Kriterium: alle Zielwerte sind schriftlich fixiert und referenzierbar.

Step 2: Alignment-Matrix ausfuellen (Ist-Zustand)
2.1 Erhebe pro Modul (Intake, Vitals, Doctor, Profil, Termine, Auth, Hub) die Ist-Werte.
2.2 Trage die Werte in die Alignment-Matrix ein.
2.3 Markiere Deltas gegen die Zielwerte (ja/nein + Kurznotiz).
Output: ausgefuellte Alignment-Matrix mit markierten Abweichungen.
Exit-Kriterium: jede Kategorie hat einen Ist-Wert pro Modul oder "n/a".

Step 3: Globale Patterns bauen/straffen
3.1 Passe `app/styles/layout.css` an (Panel, Header, Card, Grid).
3.2 Passe `app/styles/ui.css` an (Tabs, Buttons, Actions-Pattern).
3.3 Passe `app/styles/utilities.css` an (Input/Label/Meta Utilities).
3.4 Passe `app/styles/base.css` an (Tokens, falls benoetigt).
Output: globale Patterns setzen die Zielwerte technisch um.
Exit-Kriterium: Zielwerte sind durch globale Klassen/Token abbildbar.

Step 4: Modulweiser Umbau (deterministische Reihenfolge)
4.1 Intake
    - Cards an Form-Grid binden (keine eigenen Spacing-Regeln).
    - Actions-Placement auf globales Pattern umstellen.
    - Tabs auf `.tabs` Pattern angleichen.
4.2 Vitals
    - BP/Body/Lab/Training auf ein Form-Grid vereinheitlichen.
    - Actions-Placement wie Zielwert.
    - Input-Hoehen angleichen.
4.3 Doctor
    - Tabs/Actions/Panel-Spacing mit Zielwert abgleichen.
4.4 Termine + Profil
    - Nur Abweichungen vom Zielbild beheben (sind Referenz).
4.5 Auth + Hub
    - Panel-Spacing und Input-Hoehen angleichen.
Output: Module folgen denselben Layout-Patterns.
Exit-Kriterium: keine Modul-spezifischen Abweichungen in Matrix (Delta = nein).

Step 5: QA / Validierung
5.1 Sichtvergleich gegen Referenz (Profil + Termine).
5.2 Pruefe: Tabs, Buttons, Inputs, Actions-Placement, Card-Dichte.
5.3 Stelle sicher: `app/app.css` bleibt einzige Import-Quelle.
Output: visuelle Konsistenz bestaetigt.
Exit-Kriterium: alle QA-Punkte erfuellt, keine offenen Deltas.

Abgleich-Stand (final)
- Intake: Form-Grid + Actions + Card-Optik an Profil angeglichen.
- Vitals: Form-Grid, Actions-Placement und Input-Look vereinheitlicht.
- Doctor: Toolbar + Card-Optik an globale Patterns angepasst.
- Tablettenmanager: Form/Card-Optik an Profil-Pattern angepasst.
- Auth: Overlays/Lock/Login auf globale Panel-Tokens gezogen.

Step 6: Dokumentation & Rueckfallplan
6.1 Aktualisiere `docs/modules/CSS Module Overview.md` (Layout-Patterns).
6.2 Notiere betroffene Dateien und minimalen Revert.
Output: Doku + Rueckfallplan vorhanden.
Exit-Kriterium: Dokumentation ist aktuell und eindeutig.

Step 7: Globalisierung verbliebener Pattern (Polish)
7.1 Form-Pattern globalisieren:
    - `.field-group`, `.field-hint`, Label-Abstand als globale Form-Regeln in `layout.css`/`utilities.css`.
    - Ziel: gleiche Feldstruktur in Profil/Vitals/Medication ohne Modul-Duplikate.
7.2 Subtle Cards global definieren:
    - Neues Pattern `.card.subtle` oder `.card.overview` fuer Overview-Optik (z. B. Profile/Appointments).
    - Ziel: konsistenter “leichter Card-Look” ohne Feature-spezifische Farbe.
7.3 Meta-Text Utilities vereinheitlichen:
    - `small`, `muted`, Meta-Label-Optik in `utilities.css` konsolidieren.
7.4 Action-Aliases harmonisieren:
    - Modul-spezifische Actions-Klassen (`appointments-actions`, `profile-actions`) als Alias auf `.form-actions`.
Output: globale Utilities/Patterns statt modul-spezifischer Duplikate.
Exit-Kriterium: keine redundanten Form/Meta/Actions-Patterns in Feature-CSS.

Rueckfallplan (minimal)
1) Rueckbau globaler Tokens/Patterns:
   - `app/styles/base.css` (Layout- + Input-Tokens, Input-Defaults)
   - `app/styles/layout.css` (globales Layout-Pattern + Card-Dichte)
   - `app/styles/ui.css` (Tabs-Hoehe)
   - `app/styles/utilities.css` (Input-Defaults via Tokens)
2) Rueckbau Modul-Anpassungen:
   - `app/styles/capture.css` (Intake-Wrapper)
   - `app/styles/hub.css` (Intake/Vitals/Doctor/Med-Manager)
   - `app/styles/auth.css` (Overlays/Lock/Login)
3) Rueckbau Markup-Klassen:
   - `index.html` (Intake + Vitals + Med-Manager)

Hinweise fuer neue Chats
- Beginne immer mit dem Status-Block oben.
- Wenn ein Step "pending" ist, arbeite nur diesen Step ab, aktualisiere Status, dann erst weiter.
- Alle Entscheidungen muessen in der Alignment-Matrix und im CSS Module Overview dokumentiert werden.
