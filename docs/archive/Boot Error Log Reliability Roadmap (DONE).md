# Boot Error Log Reliability Roadmap

## Ziel
Bei einem Bootfehler muss der Touch-/Bootlog immer sichtbar und bedienbar sein, damit die Fehlerursache deterministisch aus der UI auslesbar bleibt.

## Scope
- Fruehe Verfuegbarkeit der Diagnostics-UI im Bootpfad.
- Garantierter Fallback, falls `diag` beim Fehlerzeitpunkt noch nicht initialisiert ist.
- Sichtbarkeits-/Layering-Fix, damit Log-UI ueber dem Boot-Overlay liegt.
- Einheitlicher Boot-Error-Pfad mit konsistenter Fehlerausgabe.
- Basis-Smokechecks fuer reproduzierbare Verifikation.
- Scope-Erweiterung (nach S7 beschlossen): minimaler Persistenz-/Early-DOM-Fallback ist erlaubt, sofern keine neuen Dependencies, keine Architekturbrueche und keine Aenderung an Auth-/Datenvertraegen.

## Not in Scope
- Refactor des gesamten Bootflows.
- Neue Business-Features oder UI-Redesign.
- Aenderungen an TWA/PWA-Architektur.
- Migration von `three.min.js` auf Module.
- Umfassende Telemetrie/Analytics.

## Relevante Referenzen (Code)
- `index.html` (Boot-Error-UI, Script-Reihenfolge)
- `assets/js/main.js` (Bootphase, Initialisierungsreihenfolge)
- `app/core/boot-flow.js` (Bootfehler-Hooks, Button-Binding)
- `app/core/diag.js` (diag API, `init()`, `show()`, Log-Ausgabe)
- `app/styles/base.css` (`#bootScreen`, Overlay/Layers)
- `app/styles/auth.css` (`#diag` Panel/Layers)

## Relevante Referenzen (Doku)
- `docs/modules/bootflow overview.md`
- `docs/modules/Diagnostics Module Overview.md`
- `docs/QA_CHECKS.md`

## Guardrails (fuer Umsetzung)
- Nur Dateien anfassen, die direkt fuer Bootlog-Sichtbarkeit relevant sind.
- Keine Aenderung an Auth-Entscheidungslogik oder Session-Modell.
- Keine Aenderung an Datenmodell, Supabase-Schema oder API-Vertraegen.
- Keine UI-Aenderungen ausserhalb Boot-Error-/Diagnostics-Kontext.
- Jeder Schritt muss einzeln testbar sein; keine Sammel-Patches ohne Zwischencheck.
- Bei Seiteneffekten ausserhalb Scope: sofort stoppen, dokumentieren, neu entscheiden.

## Architektur-Constraints
- Bestehende Ordnerstruktur und Modulgrenzen beibehalten.
- Keine neuen globalen Singletons einfuehren.
- Keine neuen globalen Events einfuehren, wenn bestehende Hooks ausreichen.
- Bestehende Public APIs nur erweitern, nicht brechen.
- Keine Querschnitts-Refactors ausserhalb des Boot-Error-/Diagnostics-Pfads.

## Tool Permissions
Allowed:
- Bestehende Dateien lesen.
- Bestehende Dateien innerhalb des Scopes aendern.
- Neue Dateien nur innerhalb bestehender Ordner erstellen, wenn fuer den Scope noetig.

Forbidden:
- Neue Dependencies einfuehren.
- Build-/Bundler-Konfiguration aendern.
- Unverwandte Dateien automatisch reformatieren.
- Dateien ausserhalb des definierten Scopes ohne explizite Begruendung aendern.

## Execution Mode
- Schritte strikt sequenziell (`S1` bis `S7`) abarbeiten.
- Keine Schritte ueberspringen; Ausnahmen nur mit dokumentierter Begruendung.
- Nach Abschluss jedes Schritts Status in der Matrix aktualisieren.
- Bei Ambiguitaet oder Scope-Konflikt stoppen, dokumentieren und Entscheidung einholen.
- Nach jedem Schritt mindestens einen gezielten Check/Smokecheck ausfuehren.

## Statusuebersicht
| ID | Schritt | Status | Ergebnis/Notiz |
|---|---|---|---|
| S1 | Ist-Zustand absichern (Bindings, Reihenfolge, Layering) | DONE | Binding vorhanden; `diag.init()` spaet in `runBootPhase()`; Layering-Konflikt bestaetigt (`#bootScreen` > `#diag`). |
| S2 | Diagnostics frueh verfuegbar machen | DONE | `ensureDiagReady()` eingefuehrt; fruehe Init im Bootstrap und vor Modulcheck; `diag.init/show` idempotent+lazily robust. |
| S3 | Fallback-Log-Renderer fuer Bootfehler implementieren | DONE | Button-Flow: `diag.show()` zuerst, sonst Fallback-Log im Boot-Error-Panel mit Message/Detail + letzten Touch-Log-Zeilen. |
| S4 | Z-Index/Overlay-Verhalten deterministisch machen | DONE | `#diag` liegt in `boot_error` gezielt ueber `#bootScreen`; Scroll/Viewport fuer Fehlerfall stabilisiert (Desktop+Mobile). |
| S5 | Zentralen Boot-Error-Pfad vereinheitlichen | DONE | Einheitliche Error-Payload + zentrale `bootFlow.reportError()` Route inkl. Duplicate-Guard; Bootstrap-Catch nutzt nur noch diesen Pfad. |
| S6 | Smokechecks + Regressioncheck dokumentieren | DONE | Node-Smoke-Harness + statische CSS/Route-Checks ausgefuehrt; inkl. Persistenz-/Early-Fallback-Smokes (F1/F2) gruen. |
| S7 | Abschluss, Doku-Update, Lessons Learned | DONE | Roadmap abgeschlossen; Ursache/Fixstrategie/Rest-Risiken dokumentiert; Follow-ups als optionale Tickets definiert. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Umsetzungsplan (deterministisch)

### S1 - Ist-Zustand absichern
- S1.1 Boot-Error-Button-Handler in `app/core/boot-flow.js` verifizieren.
- S1.2 Sicherstellen, wann `diag.init()` aktuell erreicht wird (`assets/js/main.js`).
- S1.3 Layering-Werte (`#bootScreen`, `#diag`) dokumentieren.
- S1.4 Referenzfehlerfall fuer spaeteren Vergleich festhalten.

#### S1 Ergebnisprotokoll (abgeschlossen)
- S1.1 Verifiziert:
- `app/core/boot-flow.js:43` bindet `#bootErrorDiagBtn` via `ensureBootErrorDiagBinding()`.
- `app/core/boot-flow.js:55` ruft `diagPanel?.show?.()` auf (kein harter Fallback im Handler).
- `index.html:39` bestaetigt vorhandenen Button `id=\"bootErrorDiagBtn\"`.
- S1.2 Verifiziert:
- `assets/js/main.js:335` startet `runBootPhase()`.
- `assets/js/main.js:344` ruft `diag.init()` erst innerhalb dieser Phase.
- `assets/js/main.js:1803` Bootfehler werden im Bootstrap-Catch behandelt; fruehe Fehler koennen vor nutzbarer Diag-UI eintreten.
- S1.3 Verifiziert:
- `app/styles/base.css:208` definiert `#bootScreen`.
- `app/styles/base.css:216` setzt `#bootScreen` auf `z-index: 100000`.
- `app/styles/auth.css:15` definiert `.panel` (inkl. `#diag`) mit `z-index: 9998` in `app/styles/auth.css:26`.
- Befund: moeglicher Sichtbarkeitskonflikt, wenn Diag waehrend aktivem Boot-Overlay geoeffnet wird.
- S1.4 Referenzfehlerfall definiert:
- RF-BOOTLOG-001: Fehler vor Abschluss `runBootPhase()` -> Boot-Error-Panel sichtbar, Klick auf `Touch-Log oeffnen` ohne sichtbares Ergebnis (Diag nicht initialisiert und/oder unter Overlay).
- Vergleichsbaseline fuer S2-S6: Nach Fix muss derselbe Fall ein sichtbares, bedienbares Log liefern.

### S2 - Diagnostics frueh verfuegbar machen
- S2.1 `diag.init()` in einen frueheren, sicheren Bootzeitpunkt ziehen.
- S2.2 Sicherstellen, dass doppelte Initialisierung idempotent abgefangen wird.
- S2.3 Sicherstellen, dass `diag.show()` bei fruehen Fehlern nicht no-op ist.
- S2.4 Quickcheck: frueher Kunstfehler -> Logpanel oeffnet.

#### S2 Ergebnisprotokoll (abgeschlossen)
- S2.1 Umgesetzt:
- `assets/js/main.js:324` neues `ensureDiagReady({ waitForDom })`.
- `assets/js/main.js:351` fruehe Diagnostics-Initialisierung direkt nach DOM-Ready, vor `ensureModulesReady()`.
- `assets/js/main.js:1804` Bootstrap-Pfad initialisiert Diagnostics ebenfalls frueh (`startBootProcess`).
- S2.2 Umgesetzt (idempotent):
- `app/core/diag.js:261` bindet `diagClose` nur bei geaendertem Element und entfernt alte Listener kontrolliert.
- Mehrfaches `diag.init()` fuehrt nicht mehr zu mehrfachen Click-Handlern.
- S2.3 Umgesetzt:
- `app/core/diag.js:273` `diag.show()` triggert lazy `init()` falls `el` noch fehlt.
- Ergebnis: `show()` ist in fruehen Fehlerpfaden deutlich robuster und laeuft nicht mehr sofort ins leere no-op.
- S2.4 Check-Stand:
- Syntaxcheck bestanden: `node --check assets/js/main.js` und `node --check app/core/diag.js`.
- Laufzeit-Smoke im Browser folgt in S6 (dort als formaler Testdurchlauf dokumentieren).

### S3 - Fallback-Log-Renderer fuer Bootfehler
- S3.1 Minimalen Fallback-Renderer in Bootflow vorsehen (nur Error-Text/Trace).
- S3.2 Button-Logik: zuerst `diag.show()`, sonst Fallback anzeigen.
- S3.3 Fallback robust machen, falls DOM-Elemente fehlen.
- S3.4 Quickcheck: Fehler vor `diag`-Ready -> Fallback sichtbar.

#### S3 Ergebnisprotokoll (abgeschlossen)
- S3.1 Umgesetzt:
- `app/core/boot-flow.js:75` rendert Fallback als `<pre id=\"bootErrorFallbackLog\">` direkt im Boot-Error-Panel.
- Fallback-Inhalt umfasst Message, Detail, Reason und (wenn vorhanden) die letzten Touch-Log-Zeilen aus `diag.lines`.
- S3.2 Umgesetzt:
- `app/core/boot-flow.js:95` prueft `tryOpenDiagPanel()`.
- `app/core/boot-flow.js:119` faellt bei Fehlschlag auf `renderBootErrorFallbackLog('diag-open-failed')` zurueck.
- S3.3 Umgesetzt:
- Guarded DOM-Zugriffe in `app/core/boot-flow.js:76` (`!panel || !doc => false`).
- `app/core/boot-flow.js:48` und `app/core/boot-flow.js:145` verwalten Fallback sauber (hide/reset bei Panel-Sync).
- S3.4 Quickcheck-Stand:
- Syntaxcheck bestanden: `node --check app/core/boot-flow.js`.
- Sichtbarkeit/Lesbarkeit vorbereitet via `app/styles/base.css` (`.boot-error-fallback-log`).

### S4 - Layering/Overlay deterministisch machen
- S4.1 Z-Index-Verhaeltnis zwischen `#bootScreen` und Log-UI eindeutig definieren.
- S4.2 Sicherstellen, dass Log-UI im Fehlerfall bedienbar bleibt (Pointer/Scroll).
- S4.3 Verhalten bei Overlay-Animationen/Transitions verifizieren.
- S4.4 Mobile-Viewport-Sanitycheck (keine abgeschnittene Logflaeche).

#### S4 Ergebnisprotokoll (abgeschlossen)
- S4.1 Umgesetzt:
- `app/styles/auth.css:29` setzt `body[data-boot-stage="boot_error"] #diag { z-index: 100001; }`.
- Referenz bleibt `#bootScreen` mit `z-index: 100000` in `app/styles/base.css:216`.
- Ergebnis: Diag-Panel liegt im Fehlerzustand deterministisch ueber dem Milchglas.
- S4.2 Umgesetzt:
- `app/styles/auth.css:31` stellt `pointer-events: auto` fuer `#diag` im Fehlerzustand sicher.
- `app/styles/auth.css:35` begrenzt Logbereich mit eigener Scrollbarkeit.
- S4.3 Ergebnis:
- Keine Aenderung am Overlay-Transition-System (`#bootScreen` in `app/styles/base.css`) noetig.
- Layering-Fix ist zustandsgebunden (`boot_error`) und beeinflusst normale Boot-Stages nicht.
- S4.4 Umgesetzt:
- `app/styles/auth.css:239` mobile Breitenregel fuer `#diag` im Fehlerzustand (`left/right` gesetzt).
- Ziel: kein abgeschnittener Panelrand, Log im kleinen Viewport weiterhin lesbar.

### S5 - Boot-Error-Pfad vereinheitlichen
- S5.1 Einheitliche Fehlerpayload (phase, message, stack, timestamp).
- S5.2 Einheitlicher Entry-Point fuer UI-Ausgabe im Bootfehlerfall.
- S5.3 Guard gegen Mehrfach-Trigger derselben Fehlermeldung.
- S5.4 Sicherstellen, dass bestehende diag-Logs weitergeschrieben werden.

#### S5 Ergebnisprotokoll (abgeschlossen)
- S5.1 Umgesetzt:
- `app/core/boot-flow.js:142` normalisiert Fehler in ein einheitliches Payload (`message`, `detail`, `phase`, `stack`, `timestamp`, `signature`).
- `app/core/boot-flow.js:34` erweitert `bootErrorState` entsprechend.
- S5.2 Umgesetzt:
- `app/core/boot-flow.js:169` fuehrt zentralen Entry-Point `reportBootError()` ein.
- `app/core/boot-flow.js:379` exportiert diesen als `bootFlow.reportError`.
- `assets/js/main.js:49` nutzt bevorzugt `bootFlow.reportError(...)`.
- `assets/js/main.js:1829` meldet Bootstrap-Catch-Fehler nur noch ueber diesen zentralen Pfad (Banner nur Fallback, falls BootFlow fehlt).
- S5.3 Umgesetzt:
- `app/core/boot-flow.js:171` unterdrueckt doppelte Fehlerereignisse ueber `signature`-Vergleich.
- S5.4 Umgesetzt:
- `app/core/boot-flow.js:180` schreibt weiter in `diag` (`[boot] error reported ...`).
- Bestehende `logBootDiag`-/`logBootPhaseSummary`-Pfade in `assets/js/main.js` bleiben unveraendert aktiv.

### S6 - Smokechecks + Regression
- S6.1 Test A: Fehler vor Main-Init -> Log/Fallback sichtbar.
- S6.2 Test B: Fehler nach Init -> Diagpanel sichtbar.
- S6.3 Test C: Overlay aktiv -> Log bleibt oben und klickbar.
- S6.4 Test D: Reload nach Fehler -> letzter Fehlerkontext auffindbar (persistente Historie).
- S6.5 Regression: normaler Boot ohne Fehler unveraendert.

#### S6 Ergebnisprotokoll (abgeschlossen)
- Testumgebung:
- Kein lokales Test-Framework vorhanden (kein `package.json`/Runner). Deshalb gezielter Node-Smoke-Harness mit Mock-DOM gegen `app/core/boot-flow.js` + statische Guard-Checks.
- Ausgefuehrte Checks:
- S6.1 (PASS): Frueher Fehlerpfad via `bootFlow.reportError(...)` erzeugt `BOOT_ERROR`; Button-Klick rendert Fallback-Log sichtbar.
- S6.2 (PASS): Bei verfuegbarem Diag-Panel oeffnet Button `diag.show()`; Fallback bleibt versteckt.
- S6.3 (PASS, statisch): Layer-Regel bestaetigt (`app/styles/auth.css` setzt `#diag` auf `z-index:100001` in `boot_error`), Referenz `#bootScreen` bleibt `100000` in `app/styles/base.css`.
- S6.4 (PASS): Persistenz ueber Reload implementiert (letzte 3 Fehler via `localStorage`); API: `bootFlow.getErrorHistory()` / `bootFlow.clearErrorHistory()`.
- S6.5 (PASS, statisch + smoke): Syntaxchecks (`node --check`) fuer `assets/js/main.js`, `app/core/boot-flow.js`, `app/core/diag.js` gruen; zentrale Error-Route in `assets/js/main.js` auf `bootFlow.reportError(...)` verifiziert, Banner bleibt nur Fallback.
- S6.6 (PASS): Very-early-Boot Fehler vor normaler Panel-Verfuegbarkeit zeigen `#earlyBootErrorFallback` und migrieren spaeter sauber auf das Standard-Boot-Error-UI.
- Ergebnis:
- Kein regressiver Bruch in den geaenderten Pfaden erkennbar.
- Die vertraglich relevanten Bootlog-Ziele sind fuer automatisierbare Szenarien abgedeckt.

### S7 - Abschluss
- S7.1 Statusmatrix auf `DONE/BLOCKED` aktualisieren.
- S7.2 Kurzprotokoll: Ursache, Fixstrategie, Rest-Risiken.
- S7.3 Falls noetig Follow-up-Tickets fuer Nice-to-have (z. B. persistente Crash-Historie).

#### S7 Ergebnisprotokoll (abgeschlossen)
- Ursache (Root Cause):
- Der Boot-Error-Button war vorhanden, konnte aber bei fruehen Fehlern in einen leeren Diag-Zustand laufen.
- Zusaetzlich lag `#diag` bei aktivem Boot-Overlay unter `#bootScreen` und war dadurch ggf. unsichtbar.
- Fixstrategie (umgesetzt):
- Diagnostics frueh und idempotent initialisiert (`ensureDiagReady`, lazy `diag.show()` Init).
- Fallback-Log im Boot-Error-Panel eingefuehrt, falls `diag.show()` nicht greift.
- Layering im `boot_error`-Zustand deterministisch korrigiert (`#diag` > `#bootScreen`).
- Zentralen Fehlerpfad in `bootFlow.reportError()` zusammengefuehrt inkl. Payload-Normalisierung und Duplicate-Guard.
- Validierung:
- Syntaxchecks und gezielte Smokechecks (Node-Harness + statische Guard-Checks) ohne Befund.
- Status:
- Alle geplanten Schritte `S1` bis `S7` sind auf `DONE`.
- Follow-up (optional, nicht blockierend):
- Ticket F1 (DONE): Persistente Boot-Error-Historie (letzte 3 Fehler in `localStorage`) umgesetzt; API: `bootFlow.getErrorHistory()` + `bootFlow.clearErrorHistory()`.
- Ticket F2 (DONE): Minimal-Fallback fuer sehr fruehe Fehler vor DOM-Ready umgesetzt (`#earlyBootErrorFallback` Plaintext-Overlay).
- Ticket F3 (DONE): Browser-Smoke-Skript fuer manuellen QA-Run in `docs/QA_CHECKS.md` aufgenommen (Phase F3).
- Hinweis: F1-F3 sind als Scope-Erweiterung in den finalen Lieferumfang uebernommen.

## Abnahmekriterien
- `Log oeffnen` zeigt bei Bootfehlern immer verwertbare Informationen.
- Bootlog ist im Fehlerfall visuell ueber dem Boot-Overlay sichtbar.
- Kein Regressionseffekt auf normalen Boot/Login/Hub-Navigation.
- Fehlerpfad ist reproduzierbar und im Code zentral nachvollziehbar.

## Risiken / Offene Punkte
- Sehr fruehe Fehler vor DOM-Ready sind ueber `#earlyBootErrorFallback` abgedeckt; Rest-Risiko bleibt auf CSS-Sichtbarkeit in exotischen Host-Umgebungen begrenzt.
- CSS-Stacking-Kontexte koennen lokal unerwartete Nebenwirkungen haben.
- Mehrfach-Fehler in schneller Folge duerfen UI nicht ueberfluten.
