# Breath Timer Implementation Roadmap

## Ziel (klar und pruefbar)
Im BP-Bereich der Vitals soll ein gefuehrter Vorbereitungs-Timer als Vollbild-Overlay integriert werden, damit Nutzer vor der Blutdruckmessung eine ruhige Atemphase absolvieren koennen.

Pruefbare Zieldefinition:
- Der Timer kann mit `3 Minuten` oder `5 Minuten` gestartet werden.
- Atemrhythmus ist konsistent `3s Einatmen` und `4s Ausatmen` ueber die komplette Laufzeit.
- Waehrend der Laufzeit ist ein ablenkungsarmer Vollbildmodus aktiv (nur Atemeffekt + Zeit + Status).
- Abbruch ist moeglich, aber gegen Fehl-Taps geschuetzt (2-Step-Abbruch).
- Bei Ende oder Abbruch erfolgt ein sanfter Fade-out zurueck auf den BP-Screen.
- Keine Audio- oder Haptik-Ausgabe.

## Scope
- UX-Flow fuer Start, Laufzeit, Abbruch und Abschluss des Breath Timers.
- Vollbild-Overlay im Vitals/BP-Kontext.
- Visuelle Atemfuehrung mit Hero-Hub-Farbwelt (Blau/Magenta).
- Zustands- und Timing-Logik fuer 3/5 Minuten inkl. 3s/4s-Atemzyklus.
- UI-States und Copy fuer Ende/Abbruch inkl. Fade-out.
- QA-Smokes fuer Funktion, Timing und Rueckkehr in BP-Formular.

## Not in Scope
- Audio-Signale.
- Haptisches Feedback/Vibration.
- Automatischer Fokus oder Pflicht-CTA nach Timer-Ende.
- Aenderung medizinischer Inhalte oder Messlogik selbst.
- Neue Dependencies oder Framework-Wechsel.

## Relevante Referenzen (Code)
- `app/modules/vitals-stack/vitals/index.js`
- `app/modules/vitals-stack/vitals/bp.js`
- `app/modules/vitals-stack/vitals/entry.js`
- `app/modules/hub/index.js`
- `assets/js/main.js`
- `app/styles/hub.css`
- `app/styles/base.css`
- `index.html`

## Relevante Referenzen (Doku)
- `docs/archive/Bootflow Optimization Roadmap (DONE).md` (Vorlagenstruktur)
- `docs/modules/Capture Module Overview.md`
- `docs/modules/Hub Module Overview.md`
- `docs/modules/CSS Module Overview.md`
- `docs/QA_CHECKS.md`
- `CHANGELOG.md`

## Guardrails
- Ablauf muss ruhig und minimalistisch bleiben (kein visuelles Overload).
- Keine regressiven Seiteneffekte im bestehenden BP-Eingabeformular.
- Abbruch und Abschluss muessen klar unterscheidbar sein.
- Animationen muessen auf Mobile und Desktop stabil laufen.

## Architektur-Constraints
- Integration in bestehende Vitals/BP-Module ohne globalen Architekturbruch.
- Bestehende Overlay-/Panel-Konventionen der App beibehalten.
- Keine neuen globalen Events ohne zwingenden Grund.
- Timer muss sauber beendet werden (keine haengenden Intervalle/RAF-Loops).

## Tool Permissions
Allowed:
- Bestehende Vitals/BP-Dateien lesen und innerhalb Scope aendern.
- Neue Doku/QA-Eintraege in bestehenden Ordnern erstellen.
- Lokale Smokechecks und Syntaxchecks ausfuehren.

Forbidden:
- Neue Dependencies einfuehren.
- Unverwandte Module refactoren.
- Unverwandte Styles/Dateien anfassen.

## Execution Mode
- Sequenziell arbeiten (`S1` bis `S8`).
- Keine Schritte ueberspringen ohne dokumentierte Begruendung.
- Nach jedem Schritt Statusmatrix aktualisieren.
- Nach jedem Schritt mindestens ein Check (Smoke/Sanity/Syntax).

## Statusmatrix
| ID | Schritt | Status | Ergebnis/Notiz |
|---|---|---|---|
| S1 | Ist-Analyse BP-UI + Integrationspunkte | DONE | BP-Flow, Integrationsdateien, Layer/Scroll-Constraints und Regressionsrisiken fuer Breath-Overlay vollstaendig gemappt. |
| S2 | UX-State-Machine fuer Breath Timer festlegen | DONE | Deterministische Breath-State-Machine, Transition-Regeln, Guards, Copy und Edge-Cases final spezifiziert. |
| S3 | Fullscreen-Overlay und Visual Design umsetzen | DONE | Fullscreen-Visual-Contract (Layout, Farben, Motion, Mobile-Kontrast) final definiert und implementierungsbereit gemacht. |
| S4 | Timing-Engine (3/5 Min + 3s/4s Atemzyklus) implementieren | DONE | Driftarme Engine mit 3/5-Min Presets, 3s/4s Zyklus, DOM-Sync-API und sauberem Cleanup in `breath-timer.js` implementiert. |
| S5 | Abbruchschutz (2-Step-Tap) + Ende/Abbruch-Fade-out | DONE | Overlay-Tap-Confirm, Statusmeldungen fuer Ende/Abbruch und sanfter Fade-out sind in UI+Logic implementiert. |
| S6 | BP-Flow-Integration und Regression-Absicherung | DONE | Breath-Overlay ist in den BP-Flow integriert; Save/Context/Tab/Panel-Close Guards verhindern Regressionen und Timer-Orphans. |
| S7 | Smokechecks (Desktop/Mobile, Ende/Abbruch, Timing) | DONE | Automatisierbare Smokes und Harness-Checks PASS; echter Browser-/Device-E2E bleibt als operationaler Nachlauf. |
| S8 | Doku-Sync, QA_CHECKS, CHANGELOG | DONE | Roadmap finalisiert; QA_CHECKS um Breath-Timer-Regression erweitert; CHANGELOG um Breath-Timer-Feature/Guards/Smokes ergaenzt. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Schritte + Subschritte

### S1 - Ist-Analyse BP-UI + Integrationspunkte
- S1.1 Bestehenden BP-Screen, Komponenten und Event-Flow mappen.
- S1.2 Ziel-Dateien fuer UI, State und Styling festlegen.
- S1.3 Overlay-/Z-Index-/Scroll-Kontext pruefen.
- S1.4 Risiken fuer Regression (Form-Inputs, Save-Flow) dokumentieren.

#### S1 Ergebnisprotokoll (abgeschlossen)
- S1.1 Befund (BP-UI + Event-Flow):
  - BP liegt im Hub-Vitals-Panel (`data-hub-panel="vitals"`) mit Tab-Container und aktivem BP-Tab (`data-vitals-tab="bp"`).
  - BP-Panel-Structure:
    - Kontextwaehler `#bpContextSel` (Morgens/Abends).
    - Zwei Pane-Zustaende `.bp-pane[data-context="M|A"]`.
    - Save-Buttons `.save-bp-panel-btn[data-context="M|A"]`.
  - Laufzeit-Flow:
    - Tab- und Panel-Umschaltung in `app/modules/vitals-stack/vitals/index.js` (`addCapturePanelKeys`, `setActiveVitalsTab`).
    - BP-Kontextumschaltung in `assets/js/main.js` (`applyBpContext`, `maybeAutoApplyBpContext`, `bpContextSel change`).
    - Save-Flow in `assets/js/main.js` (`handleBpPanelSave`) ruft `AppModules.bp.saveBlock(...)` auf.
    - Validierung/Persistenz in `app/modules/vitals-stack/vitals/bp.js` (`saveBlock`, `updateBpCommentWarnings`, Pflichtfeldlogik).

- S1.2 Befund (konkrete Ziel-Dateien fuer Umsetzung):
  - Primare Integrationsdateien:
    - `index.html` (Breath-Timer Trigger + Overlay-Markup im Vitals/BP-Kontext).
    - `app/modules/vitals-stack/vitals/index.js` (Vitals/BP-UI-Orchestrierung, Tab-Kontext).
    - `assets/js/main.js` (bestehender BP-Flow, Save-Handler, Kontextlogik).
    - `app/styles/hub.css` (Panel-Layout, Sichtbarkeit, BP-Bereich, Scroll-Container).
  - Sekundaere Abhaengigkeiten:
    - `app/modules/vitals-stack/vitals/bp.js` (BP-Validation/Save darf nicht regressieren).
    - `app/modules/hub/index.js` (Panel Open/Close-Lifecycle, Animation/Visibility Klassen).
    - `app/styles/base.css` (Token/Farbabgleich fuer Blau/Magenta-Look).

- S1.3 Befund (Overlay-/Z-Index-/Scroll-Kontext):
  - Hub-Panel ist `position: fixed` mit `z-index: 40`, `height: min(80vh, 860px)` fuer Vitals.
  - Scroll findet bewusst in `.hub-panel-scroll` statt (`overflow-y: auto`), nicht im gesamten Panel.
  - Sichtbarkeit/Animation des Panels laeuft ueber Klassen:
    - `is-visible`
    - `hub-panel-open`
    - `hub-panel-closing`
  - BP-spezifische Sichtbarkeit laeuft ueber:
    - `.hub-vitals-panel.is-active`
    - `.bp-pane.active`
  - Konsequenz fuer Breath-Timer:
    - Vollbild-Overlay muss innerhalb des Vitals-Panels den Scroll-Kontext gezielt uebersteuern (waehrend Laufzeit kein versehentliches Panel-Scrollen).
    - Overlay-Layer darf Hub-Close/X weiterhin kontrolliert zulassen (2-Step-Abbruch) ohne Hub-Panel-Lifecycle zu brechen.

- S1.4 Befund (Regressionsrisiken):
  - Risiko A: BP-Save-Flow
    - `handleBpPanelSave` + `saveBlock` duerfen nicht indirekt ausgelost werden, waehrend der Breath-Timer aktiv ist.
  - Risiko B: Kontextdrift
    - `maybeAutoApplyBpContext` (M/A Auto-Switch um Mittag) und manuelle `bpContextSel`-Aenderung koennen mit Timer-Zustand kollidieren.
  - Risiko C: Keyboard-Shortcuts
    - `addCapturePanelKeys` bindet Enter/Escape auf BP-Felder; Escape-Reset darf nicht ungewollt in den Timer-Abbruchpfad laufen.
  - Risiko D: Scroll/Touch auf Mobile
    - `.hub-panel-scroll` bleibt aktiv; fuer ruhigen Vollbildmodus ist Touch-Interaktion waehrend `running` strikt zu steuern.
  - Risiko E: Panel-Close
    - Hub-Close (`data-panel-close`) darf Timer-State nicht orphaned hinterlassen (Cleanup/Timer-Stop zwingend).

- Check-Ergebnis:
  - Statischer Repo-Scan auf Integrationspunkte via `rg`/`Select-String` und gezielte File-Reads fuer:
    - `index.html`
    - `app/modules/vitals-stack/vitals/index.js`
    - `app/modules/vitals-stack/vitals/bp.js`
    - `assets/js/main.js`
    - `app/styles/hub.css`
    - `app/modules/hub/index.js`
  - Kein struktureller Blocker fuer die Breath-Timer-Integration in der bestehenden Vitals/BP-Architektur.

### S2 - UX-State-Machine fuer Breath Timer festlegen
- S2.1 States definieren: `idle`, `preset_select`, `running`, `cancel_confirm`, `completed`, `aborted`, `fading_out`.
- S2.2 Transition-Regeln und Guard-Conditions spezifizieren.
- S2.3 UI-Copy fuer alle Kernstates finalisieren.
- S2.4 Edge-Cases festhalten (Tab-Wechsel, Overlay-Close, App-Hintergrund).

#### S2 Ergebnisprotokoll (abgeschlossen)
- S2.1 Befund (State-Definition, final):
  - `idle`
    - Breath Timer ist inaktiv.
    - BP-Form ist normal bedienbar.
  - `preset_select`
    - Nutzer waehlt `3 Minuten` oder `5 Minuten`.
    - Start ist erst nach gueltiger Auswahl erlaubt.
  - `running`
    - Vollbild-Overlay aktiv.
    - Sichtbar: Atem-Ball (Blau/Magenta), Restzeit, Atemphase (`Einatmen`/`Ausatmen`).
    - Interaktionen ausser Abbruch gesperrt.
  - `cancel_confirm`
    - Erster Tap waehrend `running` aktiviert Abbruch-Bestaetigung.
    - Zweiter Tap bestaetigt Abbruch.
  - `completed`
    - Timer ist regulär abgelaufen.
    - Kurzstatus: `Vorbereitung abgeschlossen`.
  - `aborted`
    - Timer wurde abgebrochen.
    - Kurzstatus: `Vorbereitung beendet`.
  - `fading_out`
    - Sanfter visueller Rueckgang zum BP-Screen.
    - Nach Fade automatisch zurueck nach `idle`.

- S2.2 Befund (Transitions + Guard-Conditions, final):
  - `idle -> preset_select`
    - Event: `OPEN_BREATH_PRESET`.
    - Guard: Vitals-Panel offen, BP-Tab aktiv.
  - `preset_select -> running`
    - Event: `START_TIMER(durationSec)`.
    - Guard: `durationSec` ist exakt `180` oder `300`.
  - `running -> cancel_confirm`
    - Event: `TAP_OVERLAY`.
    - Guard: noch kein aktives Confirm-Fenster.
    - Effekt: Confirm-Fenster `2500ms` aktiv.
  - `cancel_confirm -> running`
    - Event: `CONFIRM_TIMEOUT`.
    - Guard: kein zweiter Tap innerhalb `2500ms`.
  - `cancel_confirm -> aborted`
    - Event: `TAP_OVERLAY`.
    - Guard: zweiter Tap innerhalb aktivem Confirm-Fenster.
  - `running -> completed`
    - Event: `TIMER_FINISHED`.
    - Guard: Restzeit `<= 0`.
  - `completed -> fading_out`
    - Event: `STATUS_SETTLED`.
    - Effekt: Status-Anzeige kurz stehen lassen, dann Fade.
  - `aborted -> fading_out`
    - Event: `STATUS_SETTLED`.
    - Effekt: Status-Anzeige kurz stehen lassen, dann Fade.
  - `fading_out -> idle`
    - Event: `FADE_DONE`.
    - Guard: alle Timer/Animation-Loops sauber gestoppt.
  - Harte Guards (global):
    - Kein zweiter Timerstart ausserhalb `idle/preset_select`.
    - BP-Save (`.save-bp-panel-btn`) waehrend `running/cancel_confirm/fading_out` blocken.
    - Kontextwechsel (`#bpContextSel`) waehrend `running/cancel_confirm` ignorieren.

- S2.3 Befund (UI-Copy, final):
  - Preset-Auswahl:
    - Titel: `Atemvorbereitung`
    - Subline: `Waehle 3 oder 5 Minuten, dann starte in Ruhe die Messvorbereitung.`
    - Buttons: `3 Minuten`, `5 Minuten`, `Starten`
  - Running:
    - Atemstatus: `Einatmen` / `Ausatmen`
    - Restzeitformat: `mm:ss`
  - Cancel-Confirm:
    - Hint: `Nochmal tippen zum Abbrechen`
  - Completed:
    - Status: `Vorbereitung abgeschlossen`
  - Aborted:
    - Status: `Vorbereitung beendet`

- S2.4 Befund (Edge-Cases, final):
  - Fall A: Tab-Wechsel in Vitals waehrend `running`
    - Verhalten: Wechsel wird bis `idle` unterbunden.
  - Fall B: Hub-Panel-Close (`data-panel-close`) waehrend `running`
    - Verhalten: geht deterministisch ueber `aborted -> fading_out`, danach normaler Panel-Close.
  - Fall C: `visibilitychange` / App im Hintergrund waehrend `running`
    - Verhalten: deterministischer Sicherheitsabbruch `aborted -> fading_out`.
  - Fall D: Repeated Start/Stop-Spam
    - Verhalten: Start-Events ausserhalb `idle/preset_select` verwerfen; keine Mehrfach-Timer.
  - Fall E: Uhrzeitwechsel/Noon-Auto-Kontext (`maybeAutoApplyBpContext`) waehrend `running`
    - Verhalten: Kontextwechsel puffern/ignorieren bis Rueckkehr `idle`.

- State-Datenmodell (Implementationsvorgabe):
  - `status`: einer der 7 States.
  - `durationSec`: `180 | 300`.
  - `remainingMs`: verbleibende Zeit.
  - `phase`: `inhale | exhale`.
  - `phaseRemainingMs`: Restzeit der aktiven Atemphase.
  - `confirmUntilTs`: Timestamp fuer 2-Step-Abbruchfenster.

- Check-Ergebnis:
  - S2 gegen S1-Constraints gegengeprueft:
    - Panel-Lifecycle (`hub-panel-open/closing/is-visible`) kompatibel.
    - Scroll-/Touch-Kontext fuer Vollbild waehrend `running` eindeutig.
    - BP-Save- und Kontext-Regressionen durch harte Guards adressiert.

### S3 - Fullscreen-Overlay und Visual Design umsetzen
- S3.1 Vollbild-Overlay mit fokusreduzierter UI einbauen.
- S3.2 Zentralen Atem-Ball mit Blau/Magenta-Look aus Hero-Hub gestalten.
- S3.3 Restzeit und Atemstatus (`Einatmen`/`Ausatmen`) klar platzieren.
- S3.4 Sanfte Animationen und lesbare Kontraste fuer mobile fruehe Nutzung absichern.

#### S3 Ergebnisprotokoll (abgeschlossen)
- S3.1 Befund (Fullscreen-Overlay, final):
  - Breath-Mode wird als eigenstaendiger Vollbild-Layer ueber dem Vitals-Panel definiert.
  - Sichtbare Elemente waehrend `running`:
    - zentraler Atem-Ball
    - Restzeit (`mm:ss`)
    - Atemphase (`Einatmen`/`Ausatmen`)
    - optionaler kurzer Hint nur im `cancel_confirm`-State
  - Alles andere im Hintergrund visuell ausgeblendet und interaktiv gesperrt (kein Formular, kein Scroll, kein Tab-Wechsel).
  - Overlay-Layering-Contract:
    - Breath-Overlay liegt oberhalb der Hub-Panel-Inhalte.
    - Hub-Panel bleibt technisch erhalten, wird aber waehrend Breath-Mode nicht bedienbar.

- S3.2 Befund (Atem-Ball + Hero-Hub-Farben, final):
  - Farbquelle aus bestehender Hero-Aura:
    - Blau: `rgba(88, 190, 255, 0.55)` (mobile boosted bis `0.72`)
    - Magenta: `rgba(220, 130, 255, 0.55)` (mobile boosted bis `0.72`)
  - Visual-Form:
    - Zentraler Ball mit weichem radialen Kern + conic Glow-Anmutung analog `midas-aura-flow`.
    - Keine harten Kanten, keine schnellen Blink-Effekte.
  - Look-and-feel:
    - Dunkler, ruhiger Hintergrund mit leichtem Verlauf.
    - Ball bleibt klarer Fokuspunkt, alle Sekundaerelemente untergeordnet.

- S3.3 Befund (Zeit + Atemstatus, final):
  - Restzeit:
    - Position: oberhalb des Balls, zentriert.
    - Format: `mm:ss`, monospaced oder tabular digits fuer ruhiges Zaehlen.
    - Hohe Lesbarkeit bei wenig Licht (frueher Morgen).
  - Atemstatus:
    - Position: unterhalb des Balls, zentriert.
    - Dynamik: klarer Wechsel zwischen `Einatmen` und `Ausatmen`.
  - Cancel-Confirm-Hinweis:
    - Nur bei erstem Tap einblenden: `Nochmal tippen zum Abbrechen`.
    - Nach Ablauf des Confirm-Fensters wieder ausblenden.

- S3.4 Befund (Motion + Kontrast + Mobile, final):
  - Atem-Motion:
    - `Einatmen (3s)`: Ball skaliert sanft aufwaerts.
    - `Ausatmen (4s)`: Ball skaliert sanft abwaerts.
    - Easing weich und ruhig (kein Bounce, kein abruptes Stoppen).
  - Hintergrund-/Glow-Motion:
    - sehr langsame Rotation/Drift erlaubt, aber klar untergeordnet zur Atembewegung.
  - Fade-Standards:
    - Eintritt ins Overlay: sanfter Fade-In.
    - Austritt (Ende/Abbruch): sanfter Fade-Out zurueck auf BP-Screen.
  - Mobile-Fruehnutzung:
    - Kontrast und Schriftgroessen so setzen, dass Anzeige bei geringer Umgebungshelligkeit lesbar bleibt.
    - Keine visuelle Ueberladung auf kleinen Viewports.

- Visual Contract (Implementationsvorgabe):
  - Nur drei Primary-Komponenten im `running`-State: `time`, `breath-orb`, `phase-label`.
  - Keine Audio-/Haptik-Indikatoren.
  - Keine zusaetzliche CTA nach Ablauf; Rueckkehr erfolgt ausschliesslich per Fade-out.
  - Design muss sich in bestehende Hub/Vitals-Farbwelt einfuegen (Blau/Magenta-Aura).

- Check-Ergebnis:
  - S3 auf bestehende CSS/Hub-Standards gegengeprueft:
    - `app/styles/hub.css` (Aura-Farben, Panel-Layering, Panel-Animationen, Mobile-Profile)
    - `app/styles/base.css` (globale Tokens/Kontrastbasis)
  - Keine Design- oder Architekturkollision zum bestehenden Hub-Panel-Lifecycle identifiziert.

### S4 - Timing-Engine implementieren
- S4.1 Presets `3 min` und `5 min` anbinden.
- S4.2 Zyklus-Logik `3s ein / 4s aus` implementieren.
- S4.3 Visuelle Animation mit Atemphase synchronisieren.
- S4.4 Cleanup auf Ende/Abbruch sicherstellen (keine Timer-Leaks).

#### S4 Ergebnisprotokoll (abgeschlossen)
- S4.1 Befund (Presets, umgesetzt):
  - Neues Modul: `app/modules/vitals-stack/vitals/breath-timer.js`.
  - Preset-Contract implementiert:
    - `3 min` -> `180s`
    - `5 min` -> `300s`
  - API:
    - `selectPreset(minutes)`
    - `startPreset(minutes)`
    - `start()`

- S4.2 Befund (3s/4s Zyklus, umgesetzt):
  - Feste Atemphasen:
    - `inhale = 3000ms`
    - `exhale = 4000ms`
  - Zyklusdauer `7000ms`, phasenbasierte Berechnung ueber modulo-Zeit.
  - Driftarme Laufzeitlogik:
    - Restzeit wird gegen absolute `startedAtMs/endAtMs` berechnet.
    - Kein kumulierendes Delta-Addieren pro Tick.

- S4.3 Befund (visueller Sync, umgesetzt):
  - DOM-Sync ueber `bindDom(...)` mit optionalen Targets:
    - `data-breath-overlay`
    - `data-breath-time`
    - `data-breath-phase-label`
    - `data-breath-orb`
  - Pro Tick werden UI-relevante Werte synchronisiert:
    - `remainingMs` -> `mm:ss`
    - `phase` -> `Einatmen`/`Ausatmen`
    - `orbScale` / `phaseProgress` via CSS-Variablen (`--breath-orb-scale`, `--breath-phase-progress`)
  - Event-Ausgabe:
    - `breath:state` CustomEvent auf `document`
    - `onChange(handler)` fuer modulare Subscriber

- S4.4 Befund (Cleanup, umgesetzt):
  - Scheduler-Cleanup in allen Exit-Pfaden:
    - `clearSchedulers()` stoppt `requestAnimationFrame` und Fallback-Timer.
  - Saubere API fuer Lebenszyklus:
    - `stop(reason)` fuer Abbruch
    - `reset()` fuer Rueckkehr zu `idle`
  - Guard gegen Mehrfachstart:
    - `start()` ist idempotent waehrend `running`.

- Integrationsaenderung:
  - `index.html` bindet das neue Modul ein:
    - `<script src="app/modules/vitals-stack/vitals/breath-timer.js"></script>`

- Check-Ergebnis:
  - Syntax/Struktur ohne Befund; finale Verifikation folgt in S7 mit UI-Smokes.

### S5 - Abbruchschutz + Fade-out
- S5.1 2-Step-Abbruch per Tap (`Nochmal tippen zum Abbrechen`) implementieren.
- S5.2 Ablauf bei Timer-Ende (`Vorbereitung abgeschlossen`) umsetzen.
- S5.3 Ablauf bei Abbruch (`Vorbereitung beendet`) umsetzen.
- S5.4 In beiden Faellen sanften Fade-out zurueck zum BP-Screen implementieren.

#### S5 Ergebnisprotokoll (abgeschlossen)
- S5.1 Befund (2-Step-Abbruch, umgesetzt):
  - Erster Tap im laufenden Overlay aktiviert `cancel_confirm`.
  - Feedback-Text: `Nochmal tippen zum Abbrechen`.
  - Confirm-Fenster laeuft `2500ms`; danach automatische Rueckkehr nach `running`.

- S5.2 Befund (Timer-Ende, umgesetzt):
  - Bei `timer-finished` wird Status `completed` gesetzt.
  - Feedback-Text: `Vorbereitung abgeschlossen`.
  - Status bleibt kurz sichtbar und geht dann in Fade-out ueber.

- S5.3 Befund (Abbruch, umgesetzt):
  - Zweiter Tap im Confirm-Fenster stoppt den Timer deterministisch (`aborted`).
  - Feedback-Text: `Vorbereitung beendet`.
  - Status bleibt kurz sichtbar und geht dann in Fade-out ueber.

- S5.4 Befund (Fade-out, umgesetzt):
  - Sanfter Overlay-Fade-out (`is-fading-out`) mit definierter Dauer.
  - Danach: Overlay hidden, Feedback reset, Background unlock, Timer reset auf `idle`.

- Umgesetzte Dateien:
  - `app/modules/vitals-stack/vitals/breath-timer.js`
  - `index.html` (Breath-Overlay-Markup)
  - `app/styles/hub.css` (Overlay-Layout + Visuals + Fade)

### S6 - BP-Flow-Integration + Regression
- S6.1 Startpunkt im BP-Screen integrieren (ohne Formularfluss zu stoeren).
- S6.2 Rueckkehr in BP-Screen ohne Auto-Fokus/extra CTA verifizieren.
- S6.3 Save-Flow fuer Blutdruckwerte auf Unveraendertheit pruefen.
- S6.4 UI-Robustheit bei schnellem Start/Stop wiederholt testen.

#### S6 Ergebnisprotokoll (abgeschlossen)
- S6.1 Befund (Startpunkt, umgesetzt):
  - Breath-Startbuttons sind in beiden BP-Kontext-Panes (M/A) integriert.
  - Overlay-Markup ist direkt im BP-Container verankert (`.hub-vitals-bp`) und nutzt denselben Panel-Kontext.

- S6.2 Befund (Rueckkehrverhalten, umgesetzt):
  - Nach Ende/Abbruch und Fade-out wird ohne CTA und ohne Auto-Fokus in den BP-Screen zurueckgekehrt.
  - Overlay/Feedback/Locks werden beim Reset vollstaendig zurueckgesetzt.

- S6.3 Befund (Save-Flow-Absicherung, umgesetzt):
  - Guard in `assets/js/main.js`:
    - BP-Save wird blockiert, solange Breath-UI aktiv ist (`isUiBlocking()`).
  - Kontextwechsel-Guard in `assets/js/main.js`:
    - `#bpContextSel`-Aenderungen werden waehrend aktivem Breath-UI verworfen und auf letzten Zustand zurueckgesetzt.

- S6.4 Befund (Robustheit, umgesetzt):
  - Anti-Orphan-Guard:
    - Beim Vitals-Panel-Close wird aktives Breath-UI hart bereinigt (Timer + UI-State + Overlay-Lock).
  - Tab-Guard:
    - Vitals-Tab-Wechsel (`[data-vitals-tab]`) wird waehrend aktivem Breath-UI blockiert.
  - Start-Guard:
    - Mehrfachstart wird durch `isUiBlocking()` unterbunden.

- Umgesetzte Dateien:
  - `app/modules/vitals-stack/vitals/breath-timer.js`
  - `assets/js/main.js`
  - `index.html`
  - `app/styles/hub.css`

### S7 - Smokechecks + Regression
- S7.1 Timer-Start mit beiden Presets pruefen (`3 min`, `5 min`).
- S7.2 Atemphasen-Rhythmus ueber Stichproben validieren.
- S7.3 Ende vs. Abbruch inkl. Fade-out visuell/funktional pruefen.
- S7.4 Mobile/Desktop sowie fruehe Tageslicht-/Kontrastlesbarkeit pruefen.
- S7.5 Syntaxchecks und gezielte statische Guards ausfuehren.

#### S7 Ergebnisprotokoll (abgeschlossen)
- Durchgefuehrte Checks:
  - S7.1 Presets/Start:
    - Statischer Check auf Preset-Mapping (`3 -> 180s`, `5 -> 300s`) in `breath-timer.js`.
    - Node-Harness startet den Timer ueber den UI-Button-Flow deterministisch.
  - S7.2 Atemrhythmus:
    - Statischer Check auf feste Phase-Budgets (`inhale=3000ms`, `exhale=4000ms`).
    - Drift-Logik geprueft (absolute Zeitbasis via `startedAt/endAt`).
  - S7.3 Ende vs. Abbruch:
    - Node-Harness verifiziert:
      - 2-Step-Cancel (`cancel_confirm` nach erstem Tap)
      - Abbruchpfad inkl. Rueckkehr nach Fade-out zu `idle`
      - Completion-Pfad (Zeitablauf) inkl. Rueckkehr nach Fade-out zu `idle`
  - S7.4 Mobile/Desktop/Kontrast:
    - Statischer CSS-Check der Overlay-Layer-/Kontrastregeln in `hub.css`.
    - Realgeraete-Visuallauf aus CLI nicht automatisierbar.
  - S7.5 Syntax + statische Guards:
    - `node --check app/modules/vitals-stack/vitals/breath-timer.js` PASS
    - `node --check assets/js/main.js` PASS
    - Guard-Checks PASS:
      - Save-Block waehrend Breath-UI (`isUiBlocking`)
      - Context-Guard fuer `#bpContextSel`
      - Tab-Guard waehrend Breath-UI
      - Panel-Close Hard-Reset gegen Timer-Orphans

- PASS/BLOCKED:
  - PASS:
    - Breath-Harness: `PASS` (`S7-BREATH-HARNESS: PASS`).
    - Syntaxchecks: alle ausgefuehrten Dateien PASS.
    - Statische Integrations-/Guard-Checks ohne regressiven Befund.
  - BLOCKED:
    - Kein echter Browser-/Device-E2E aus CLI fuer visuelle Endabnahme (Mobile/Desktop Rendering, subjektive Motion, Tap-Gefuehl).

- Entscheidung:
  - S7 fuer den automatisierbaren Scope abgeschlossen.
  - Browser-/Device-Endabnahme bleibt als geplanter operativer Nachlauf vor finalem Polishing.

### S8 - Abschluss, Doku-Sync, Changelog
- S8.1 Statusmatrix finalisieren.
- S8.2 Erkenntnisse in Modul-Doku und QA_CHECKS einpflegen.
- S8.3 CHANGELOG-Eintrag vorbereiten.
- S8.4 Rest-Risiken und Follow-ups dokumentieren.

#### S8 Ergebnisprotokoll (abgeschlossen)
- S8.1 Befund:
  - Statusmatrix final auf `DONE` fuer `S1` bis `S8` gesetzt.
  - Die Roadmap dokumentiert jetzt den kompletten Umsetzungs- und Verifikationsstand.

- S8.2 Befund:
  - `docs/QA_CHECKS.md` um einen dedizierten Breath-Timer-Regression-Block erweitert:
    - Preset-Start (`3 min`/`5 min`)
    - 2-Step-Cancel
    - Ende/Abbruch + Fade-out
    - Save-/Context-/Tab-/Panel-Close Guards
    - Mobile/Desktop Sicht- und Lesbarkeitscheck

- S8.3 Befund:
  - `CHANGELOG.md` unter `Unreleased` um Breath-Timer-Implementierung erweitert:
    - Vollbild-Breath-Overlay im BP-Panel
    - Timing-Engine (`3/5 min`, `3s/4s`)
    - S5/S6 Guards und Fade-Flow
    - Automatisierbare S7-Harness-Checks

- S8.4 Befund (Rest-Risiken + Follow-up):
  - Offenes Rest-Risiko bleibt ausschliesslich visueller/device-spezifischer Feinschliff:
    - subjektives Motion-Gefuehl auf Realgeraeten
    - Kontrast/Lesbarkeit unter realen Lichtbedingungen (frueher Morgen)
  - Follow-up:
    - Geplantes Polishing kann auf derselben Architektur erfolgen (keine strukturellen Aenderungen notwendig).

## Smokechecks / Regression (Definition)
- Overlay startet und beendet sich deterministisch.
- Atemzyklus bleibt stabil bei `3s/4s`.
- Kein Audio/Haptik wird getriggert.
- BP-Formular bleibt vor/nach Timer voll funktionsfaehig.
- Ende/Abbruch unterscheiden sich klar und beide fade-out sauber.

## Abnahmekriterien
- Breath Timer ist fuer Nutzer im BP-Screen klar auffindbar und nutzbar.
- 3- und 5-Minuten-Modus verhalten sich wie spezifiziert.
- Vollbildmodus ist ruhig, lesbar und technisch stabil.
- Ende/Abbruch-Rueckkehr funktioniert ohne UI-Brueche.
- Dokumentation und QA-Checks sind aktualisiert.

## Risiken
- Zu harte/zu schnelle Animation kann unruhig wirken.
- Timer-Drift bei ungenauer Zeitlogik kann UX/Vertrauen beeintraechtigen.
- Overlay-Layering kann mit bestehenden Panels kollidieren.
- Fehlendes Cleanup kann zu doppelten Timern bei Wiederstart fuehren.
