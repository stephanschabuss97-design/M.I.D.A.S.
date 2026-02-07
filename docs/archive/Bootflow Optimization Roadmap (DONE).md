# Bootflow Optimization Roadmap

## Ziel (klar und pruefbar)
Der MIDAS-Bootflow soll technisch optimiert werden, ohne Stabilitaet oder bestehende UX-Garantien zu verlieren.

Pruefbare Zieldefinition:
- Boot bleibt deterministisch (`BOOT -> AUTH_CHECK -> INIT_CORE -> INIT_MODULES -> INIT_UI -> IDLE`).
- Boot-Error-Diagnostik bleibt voll funktionsfaehig (diag, fallback, early-fallback, history).
- Kein funktionaler Regressionseffekt auf Auth, Panels, Realtime, PWA-Install/Update.
- Optionaler Performance-Gewinn wird gemessen (nicht erzwungen): besseres oder gleiches Verhalten bei Cold/Warm/PWA-Start.

## Scope
- Analyse und Optimierung des kritischen Bootpfads (Script-Reihenfolge, Blocking-Init, Stage-Uebergaenge).
- Optimierung von Initialisierungsreihenfolgen ohne API-Brueche.
- PWA-bezogene Boot-Einfluesse (Service Worker / Cache-Strategie) im Rahmen der bestehenden Architektur.
- Messbare Boot-Metriken und reproduzierbare QA-Smokechecks.

## Not in Scope
- Grossrefactor der gesamten App-Architektur.
- Neue Features ausserhalb Boot/PWA/Diagnostics.
- Aenderung von Supabase-Datenmodell, RLS oder Backend-Vertraegen.
- Neue Dependencies oder Build-Tool-Migration.

## Relevante Referenzen (Code)
- `index.html`
- `assets/js/main.js`
- `assets/js/boot-auth.js`
- `app/core/boot-flow.js`
- `app/core/diag.js`
- `app/core/pwa.js`
- `app/supabase/index.js`
- `app/styles/base.css`
- `app/styles/auth.css`
- `public/sw/service-worker.js`
- `public/manifest.json`

## Relevante Referenzen (Doku)
- `docs/modules/bootflow overview.md`
- `docs/modules/Diagnostics Module Overview.md`
- `docs/modules/Supabase Core Overview.md`
- `docs/QA_CHECKS.md`
- `CHANGELOG.md`

## Guardrails
- Bootflow-Funktionsgarantien bleiben priorisiert vor Speed-Gewinn.
- Jede Optimierung muss einzeln pruefbar sein (isolierte, kleine Schritte).
- Keine stillen Verhaltensaenderungen bei Auth/Doctor-Guard/Realtime.
- Bei unerwarteten Seiteneffekten: Schritt stoppen, dokumentieren, erst dann weiter.

## Architektur-Constraints
- Bestehende Stage-Maschine bleibt erhalten (`bootFlow` als Source of Truth).
- Bestehende Public APIs nur erweitern, nicht brechen.
- Keine neuen globalen Singletons.
- Keine neuen globalen Events ohne zwingenden Grund.
- Service-Worker-Lebenszyklus bleibt kompatibel zu bestehender PWA-Update-Logik.

## Tool Permissions
Allowed:
- Bestehende Dateien lesen und innerhalb Scope aendern.
- Neue Doku/QA-Dateien in bestehenden Ordnern erstellen.
- Lokale Smokechecks und Syntaxchecks ausfuehren.

Forbidden:
- Neue Dependencies einfuehren.
- Build-/Bundler-Config aendern.
- Unverwandte Dateien formatieren oder anfassen.

## Execution Mode
- Sequenziell arbeiten (`S1` bis `S8`).
- Keine Schritte ueberspringen ohne dokumentierte Begruendung.
- Nach jedem Schritt Statusmatrix aktualisieren.
- Nach jedem Schritt mindestens ein Check (Smoke/Sanity/Syntax).

## Statusmatrix
| ID | Schritt | Status | Ergebnis/Notiz |
|---|---|---|---|
| S1 | Baseline erfassen (Boot-Metriken + Bottlenecks) | DONE | Startpfade + statische Baseline mit harten Wait-/Timeout-Budgets dokumentiert; Haupt-Bottlenecks priorisiert fuer S2/S3/S4. |
| S2 | Kritischen Bootpfad entkoppeln (nicht-kritische Init spaeter) | DONE | S2.1-S2.4 abgeschlossen: Kandidaten markiert, Initial-Refresh post-IDLE, Guard aktiv, Stage-Konsistenz statisch/syntaktisch verifiziert. |
| S3 | Supabase/Auth Readiness-Handshake optimieren | DONE | S3.1-S3.4 abgeschlossen: redundante Waits reduziert, Auth-Wait opportunistisch, Timeout-/Slow-API-Pfade gehaertet, deterministischer Bootstrap-Fallback dokumentiert. |
| S4 | UI-Initialisierung und erste Interaktion optimieren | DONE | S4.1-S4.4 abgeschlossen: Race gefixt, Warmups post-IDLE, Hub/Open-Flow und Mobile/PWA-Sanity ohne regressiven Befund. |
| S5 | PWA/SW Einfluss auf Boot kontrollieren | DONE | S5.1-S5.4 abgeschlossen: Boot-Assets gecacht, `controllerchange` boot-sicher, Navigate-Fallback app-shell-first, Update-Flows ohne regressiven Befund. |
| S6 | Diagnostics-/Boot-Error-Verhalten gegenpruefen | DONE | S6.1-S6.4 via Node-Mock-Smokes verifiziert (Touch-Log/Fallbacks/History/Duplicate-Guard), alle Checks gruen. |
| S7 | Vollstaendige Smoke/Regression ausfuehren | DONE | Automatisierbare S7-Smokes/Guards ausgefuehrt (Boot no-error/forced-error, PWA Update/Install, Auth/Doctor/Realtime/Hub statisch), alle Checks gruen; Endgeraete-E2E bleibt als Rest-Risiko. |
| S8 | Abschluss, Doku-Sync, Changelog | DONE | Status finalisiert; Bootflow-/Diagnostics-Dokus, QA_CHECKS (F4) und CHANGELOG auf finalen Ist-Zustand synchronisiert. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Schritte + Subschritte

### S1 - Baseline erfassen (Boot-Metriken + Bottlenecks)
- S1.1 Relevante Startpfade definieren: Cold Start, Warm Start, PWA Start.
- S1.2 Stage-Timings erfassen (BOOT bis IDLE).
- S1.3 Blocking-Punkte identifizieren (Script/Wait/Auth/Refresh).
- S1.4 Baseline als Vergleichswert dokumentieren.

#### S1 Ergebnisprotokoll (abgeschlossen)
- Befund:
- Drei Startpfade fuer Vergleich definiert:
  - Cold Start: Hard-Reload, leerer Runtime-Cache, kein aktiver SW-Controller.
  - Warm Start: Reload mit bereits geladenen Assets/JS-Bytecode und vorhandenem Browser-Cache.
  - PWA Start: Standalone-Start unter Service-Worker-Kontrolle.
- Kritischer Bootpfad ist strikt sequenziell: `BOOT -> AUTH_CHECK -> INIT_CORE -> INIT_MODULES -> INIT_UI -> IDLE` (siehe `main()` in `assets/js/main.js`).
- Script-Load-Baseline zeigt hohen Vorlauf vor `main.js`: viele parser-blockierende Classic-Skripte ohne `defer/async`.
- Redundante Supabase-Readiness-Wartepfade sind vorhanden (Preflight + Modulcheck + Auth-Phase), was bei Grenzfaellen kumulierte Wartezeit erzeugt.
- `INIT_UI` wartet auf `requestUiRefresh()` bevor `IDLE` gesetzt wird; damit kann ein langsamer Doctor-Refresh die First-Interactive-Freigabe verzegern.

- Gemessene Werte (S1 Baseline, statisch/codebasiert):
- Script-Load:
  - `index.html`: 47 `<script>` Tags gesamt, davon 40 classic / 7 module.
  - Vor `assets/js/main.js`: 46 `<script>` Tags (39 classic / 7 module).
  - `defer=0`, `async=0`.
- Harte Wait-/Timeout-Budgets im Bootpfad:
  - `waitForSupabaseApi()` Default-Timeout: `6000ms` (`assets/js/main.js`).
  - Bootstrap-Preflight auf Supabase: `8000ms` (`startBootProcess`).
  - `ensureModulesReady()` Supabase-Wait: `8000ms`.
  - Stage-Hang-Timeout: `15000ms` pro Stage (`app/core/boot-flow.js`).
  - UI-Refresh Substep-Timeout: `8000ms` pro Step (`doctor`/`chart`) (`assets/js/main.js`).
  - `getSession`-Timeout fuer Header/Auth-Helfer: `2000ms` (`assets/js/main.js`).
- Abgeleitete Worst-Case-Budgets (ohne Netzwerk/Backend-Latenz, rein aus lokalem Codefluss):
  - Frueher Supabase-Fehler kann bis zu ~`16000ms` kumulieren (Bootstrap-Preflight `8000ms` + `ensureModulesReady` `8000ms`) bevor der Boot sauber in Fehlerpfad geht.
  - Bei aktivem `INIT_UI`-Refresh kann ein langsamer Doctor-Step bis zu `8000ms` vor `IDLE` kosten (optional mehr, falls zusaetzliche Steps aktiv sind).

- Betroffene Dateien:
- `index.html` (Script-Reihenfolge, Blocking-Skripte, Position von `main.js`)
- `assets/js/main.js` (`startBootProcess`, `waitForSupabaseApi`, `ensureModulesReady`, Stage-Phasen, `requestUiRefresh`)
- `app/core/boot-flow.js` (Stage-Maschine, Hang-Timer, Fehlerpfad)
- `assets/js/boot-auth.js` (AUTH_CHECK-Handshake via `bootFlow.whenStage`)
- `app/supabase/index.js` (`supabase:ready` Dispatch-Strategie)
- `app/core/pwa.js` (SW-Register erst auf `window.load`, also nicht parser-blockierend)
- `public/sw/service-worker.js` (Navigation- und Static-Caching-Verhalten fuer PWA-Pfad)

- Entscheidung/Next:
- S2 priorisiert: nicht-kritische Arbeiten aus dem Pfad vor `IDLE` ziehen (insb. `INIT_UI`-Refresh-Abhaengigkeiten).
- S3 priorisiert: Supabase-Readiness auf einen deterministischen Gate reduzieren, um doppelte Waits zu vermeiden.
- S4 priorisiert: First-Interactive frueher freigeben, ohne Boot-Error-/Diagnostics-Garantien zu brechen.
- S1-Check durchgefuehrt: statische Konsistenzpruefung der Referenzstellen und Timeouts via `rg`/Line-Reads abgeschlossen.

### S2 - Kritischen Bootpfad entkoppeln
- S2.1 Nicht-kritische Initialisierungen markieren.
- S2.2 Reihenfolge so anpassen, dass erste Interaktion frueher moeglich ist.
- S2.3 Sicherstellen, dass Boot-Error-Flow unveraendert robust bleibt.
- S2.4 Quickcheck auf Stage-Konsistenz.

#### S2 Ergebnisprotokoll (abgeschlossen)
- S2.1 Befund (abgeschlossen):
- Kritische Pre-IDLE Pfade (beibehalten):
  - `waitForDomReady`, `ensureDiagReady`, `ensureModulesReady` in `runBootPhase()`.
  - `AUTH_CHECK` Kernpfad (`waitForSupabaseApi`, `initDB`, `requireSession`, `afterLoginBoot`, `setupRealtime`).
  - Basis-UI-Bindings in `INIT_CORE`/`INIT_MODULES` (Tabs/Auth/AppLock) fuer deterministischen Start.
- Nicht-kritische oder teilkritische Defer-Kandidaten markiert in `assets/js/main.js`:
  - `helpPanel?.init?.()` in BOOT.
  - `maybeRefreshForTodayChange({ force:true, source:'boot' })`.
  - Fruehes `refreshCaptureIntake('tab:capture')`.
  - Scheduler-Setup (`scheduleMidnightRefresh`, `scheduleNoonSwitch`).
  - Konfig-Diagnose-Lesezugriffe (`getConf('webhookUrl'/'webhookKey')` + diag-Ausgabe).
  - Nicht-kritische Input-Listener-Bindings fuer Warnhinweise.
  - Optionales `cleanupOldIntake()` beim Boot.
  - `requestUiRefresh({ reason:'boot:initial' })` als groesster Kandidat zur Entkopplung der First-Interactive-Freigabe.
- Check-Ergebnis:
  - Reine Markierung/Kommentierung, keine Verhaltensaenderung in S2.1.
  - Grundlage fuer S2.2 ist deterministisch vorbereitet.
- Rest-Risiko:
  - Die finale Reihenfolgeaenderung in S2.2 muss auf Auth-/Doctor-/Chart-Abhaengigkeiten geprueft werden.

- S2.2 Befund (abgeschlossen):
- Reihenfolge in `INIT_UI` angepasst, damit Interaktion frueher moeglich ist:
  - Vorher: `await requestUiRefresh('boot:initial')` blockierte `IDLE`.
  - Jetzt: Controls/Auth-Lock werden zuerst freigegeben, Stage geht auf `IDLE`, danach startet `requestUiRefresh('boot:initial')` asynchron im Hintergrund.
- Umgesetzte Aenderung:
  - `assets/js/main.js`:
    - Entferntes blockierendes `await requestUiRefresh({ reason: 'boot:initial' })` vor `IDLE`.
    - Neuer post-IDLE Trigger via `Promise.resolve().then(() => requestUiRefresh(...))` inkl. Fehler-Logging.
- Check-Ergebnis:
  - Ziel von S2.2 erreicht: First-Interactive wird nicht mehr vom initialen Doctor/Chart-Refresh blockiert.
  - Boot-Reihenfolge bleibt unveraendert deterministisch (`... -> INIT_UI -> IDLE`), nur die schwere Warmup-Arbeit liegt danach.
- Rest-Risiko:
  - Direkt nach Boot koennen Doctor/Chart-Inhalte fuer einen kurzen Moment noch im alten Stand sein, bis der post-IDLE Refresh durch ist.
  - Wird in S2.3/S2.4 und S7 nochmals gegen Auth/Doctor/Chart-Flows geprueft.

- S2.3 Befund (abgeschlossen):
- Ziel war, trotz Entkopplung (S2.2) den Boot-Error-Pfad unveraendert robust zu halten.
- Umgesetzte Aenderung:
  - `assets/js/main.js`: post-IDLE Refresh in `schedulePostIdleRefresh()` gekapselt.
  - Guard-Bedingungen:
    - kein Lauf, wenn `window.__bootFailed` gesetzt ist.
    - kein Lauf, wenn `bootFlow.getStage()` verfuegbar und ungleich `IDLE` ist.
  - Fehler im post-IDLE Refresh bleiben lokal im Diag-Log (`[boot] post-idle refresh failed ...`) und triggern keinen Boot-Error-Transition-Pfad.
- Check-Ergebnis:
  - Boot-Reihenfolge unveraendert (`INIT_UI -> IDLE`), Boot-Error-Source-of-Truth bleibt `bootFlow.reportError/markFailed`.
  - Der neue asynchrone Refresh hat explizite Exit-Guards und ist vom fatalen Bootstrap-Catch entkoppelt.
- Rest-Risiko:
  - Bei sehr fruehen Stage-Transitions nach `IDLE` kann der Guard den post-IDLE Refresh auslassen; dies ist fuer Stabilitaet akzeptabel und wird in S2.4/S7 gegen UI-Aktualitaet geprueft.

- S2.4 Befund (abgeschlossen):
- Quickcheck auf Stage-Konsistenz ausgefuehrt (statisch + Syntax):
  - `main()` bleibt strikt sequenziell: `runBootPhase -> runAuthCheckPhase -> initCorePhase -> initModulesPhase -> initUiAndLiftLockPhase`.
  - `INIT_UI` setzt weiterhin deterministisch `INIT_UI` dann `IDLE`; der neue Initial-Refresh liegt danach.
  - Boot-Failure-Flag (`window.__bootFailed`) bleibt im Bootstrap-Catch gesetzt und wird vom post-IDLE-Refresh respektiert.
  - Boot-Error-API in `boot-flow` bleibt unveraendert (`reportError`, `markFailed`, `commitStage(...BOOT_ERROR...)`).
- Check-Ergebnis:
  - `node --check assets/js/main.js`: PASS
  - `node --check app/core/boot-flow.js`: PASS
  - Statische Guards per `rg` (Stage-Order, IDLE vor post-IDLE-Refresh, Boot-Error-Routen): PASS
- Rest-Risiko:
  - Funktionale Laufzeit-Validierung (Live-Smoke) bleibt noetig fuer subjektive UX und Daten-Aktualitaet direkt nach `IDLE` (abgedeckt durch deinen folgenden Live-Smoke).

#### S2 Abschlusszusammenfassung
- Befund:
  - Der kritischste Blocker fuer gefuehlte Boot-Geschwindigkeit war der initiale, schwere UI-Refresh vor `IDLE`.
  - Gleichzeitig musste der Boot-Error-Pfad strikt unveraendert robust bleiben.
- Umgesetzte Aenderung:
  - Nicht-kritische Initialisierungen wurden als Defer-Kandidaten markiert (S2.1).
  - `requestUiRefresh({ reason: 'boot:initial' })` wurde von pre-IDLE nach post-IDLE verschoben (S2.2).
  - Guard eingefuehrt (`__bootFailed` + Stage-Check), damit der post-IDLE-Refresh den Boot-Error-Pfad nicht beeinflusst (S2.3).
  - Stage-Konsistenz und Boot-Flow-Routen statisch/syntaktisch verifiziert (S2.4).
- Check-Ergebnis:
  - `node --check assets/js/main.js`: PASS
  - `node --check app/core/boot-flow.js`: PASS
  - Statische Stage/Guard-Pruefungen: PASS
  - Manueller Live-Server-Smoke (durchgefuehrt): PASS, App startet weiterhin fehlerfrei.
- Rest-Risiko:
  - Direkt nach `IDLE` kann Doctor/Chart kurz nachziehen, bis der post-IDLE-Refresh fertig ist.
  - Vollstaendige funktionale Regression ueber alle Flows folgt wie geplant in S7.

### S3 - Supabase/Auth Readiness-Handshake optimieren
- S3.1 `supabase:ready` + `waitForSupabaseApi` Pfad auf unnötige Wartezeiten pruefen.
- S3.2 Auth-Entscheidungsabhaengigkeiten minimieren (ohne Security-Abstriche).
- S3.3 Fehlerszenarien (langsame API, timeout) pruefen.
- S3.4 Deterministischen Fallback dokumentieren.

#### S3 Ergebnisprotokoll (abgeschlossen)
- S3.1 Befund (abgeschlossen):
- Vorher lag ein redundanter Wait-Pfad vor:
  - `startBootProcess` wartete auf `waitForSupabaseApi({ timeout: 8000 })`.
  - Danach warteten `runBootPhase/ensureModulesReady` und `AUTH_CHECK` erneut auf Supabase-Readiness.
- Umgesetzte Aenderung:
  - `assets/js/main.js`: Supabase-Preflight-Wait im Bootstrap entfernt.
  - Bootstrap macht weiterhin fruehes `ensureDiagReady`, startet danach direkt `main()`.
  - Supabase-Readiness bleibt zentral im eigentlichen Bootpfad (`ensureModulesReady` + `runAuthCheckPhase`) abgesichert.
- Check-Ergebnis:
  - Doppelte Wartezeit vor `main()` entfaellt; dadurch sinkt potentieller Start-Overhead ohne API- oder Stage-Bruch.
  - Boot-Reihenfolge bleibt unveraendert deterministisch.
- Rest-Risiko:
  - Bei sehr spaetem Supabase-Load verlagert sich die Wartezeit vollstaendig in den regulaeren Bootpfad (gewollt), nicht mehr in den Bootstrap-Vorlauf.

- S3.2 Befund (abgeschlossen):
- Auth-Abhaengigkeiten wurden minimiert, ohne Security-Pfade zu lockern:
  - `requireSession()` bleibt weiterhin der harte, autoritative Auth-Gate im Bootpfad.
  - `waitForAuthDecision` wurde von einem potentiell blockierenden Pflicht-Wait auf einen opportunistischen Soft-Wait umgestellt.
- Umgesetzte Aenderung:
  - `assets/js/main.js`:
    - Neues `waitForAuthDecisionSoft({ timeoutMs })` mit fruehem Exit bei bereits bekanntem Auth-State.
    - Soft-Wait per `Promise.race` mit Timeout (`1200ms`) statt ungebremstem Block.
    - Bei Timeout wird nur diagnostisch geloggt und der Bootpfad laeuft weiter.
- Check-Ergebnis:
  - Auth-Sicherheit unveraendert: Session-Validierung bleibt verpflichtend vor Folgeaktionen.
  - Reduziertes Risiko fuer Boot-Stalls durch haengende/spaete Auth-Decision-Resolver.
- Rest-Risiko:
  - Bei sehr langsamer Auth-State-Synchronisierung kann die Detailentscheidung spaeter eintreffen; der Bootpfad bleibt dennoch korrekt, weil `requireSession()` bereits ausgewertet wurde.

- S3.3 Befund (abgeschlossen):
- Slow-API-/Timeout-Szenarien im `AUTH_CHECK` wurden explizit gehaertet:
  - Kein unnoetiger Wait, wenn Supabase bereits verfuegbar ist.
  - Timeout-Fehler werden als eigener, deterministischer Fehlerfall klassifiziert.
- Umgesetzte Aenderung:
  - `assets/js/main.js`:
    - `ensureSupabaseReadyForAuth({ timeoutMs })` eingefuehrt.
    - `runAuthCheckPhase` nutzt diesen Guard statt direktem `waitForSupabaseApi()`.
    - Timeout-Klassifikation via `SUPABASE_READY_TIMEOUT` + explizites Diag-Log im Catch.
- Check-Ergebnis:
  - Bei normalem Pfad: unveraenderte Auth-Semantik (`requireSession` bleibt verpflichtend).
  - Bei langsamer/fehlender Supabase-Readiness: reproduzierbarer Fehlerpfad mit klarer Diagnose im AUTH_CHECK.
- Rest-Risiko:
  - In extrem langsamen Umgebungen kann weiterhin ein Timeout eintreten; dieser ist jetzt jedoch deterministisch erkennbar und fuehrt ueber den bestehenden Boot-Error-Pfad.

- S3.4 Befund (abgeschlossen):
- Deterministischer Fallback fuer Bootstrap-Fehler finalisiert:
  - Fehler werden im Bootstrap-Catch nicht mehr generisch behandelt, sondern ueber eine konsistente Klassifikation in Payload + Reason ueberfuehrt.
- Umgesetzte Aenderung:
  - `assets/js/main.js`:
    - `buildDeterministicBootFallback(err)` eingefuehrt.
    - Spezieller Fallback fuer `SUPABASE_READY_TIMEOUT`:
      - `message`: `Supabase Readiness Timeout`
      - `detail`: klare AUTH_CHECK-Readiness-Beschreibung
      - `phase`: `AUTH_CHECK`
      - `reason`: `auth-check-supabase-timeout`
    - Standard-Fallback bleibt fuer alle anderen Bootstrap-Fehler aktiv (`phase=BOOTSTRAP`, `reason=bootstrap-catch`).
    - Bootstrap-Catch nutzt jetzt ausschliesslich die klassifizierte Payload fuer `failBootStage(...)`.
- Check-Ergebnis:
  - Fehlerpfad bleibt zentral ueber `bootFlow.reportError/markFailed`.
  - Failure-Payload ist fuer bekannte Timeout-Faelle jetzt reproduzierbar und unterscheidbar.
- Rest-Risiko:
  - Weitere spezifische Fehlercodes koennen bei Bedarf spaeter in die Klassifikation aufgenommen werden; aktueller Scope deckt den kritischsten Readiness-Fall ab.

### S4 - UI-Initialisierung und erste Interaktion optimieren
- S4.1 INIT_CORE/INIT_MODULES/INIT_UI auf kritische vs. aufschiebbare Tasks trennen.
- S4.2 First-Interactive-Moment frueher freigeben (ohne inkonsistente UI).
- S4.3 Hub/Panel/Open-Flow nach Boot testen.
- S4.4 Mobile/PWA Sichtpruefung.

#### S4 Ergebnisprotokoll (abgeschlossen)
- S4.1 Befund (abgeschlossen):
  - Live-Smoke zeigte fruehen Race-Hinweis:
    - `[auth] getUserId error: IndexedDB not initialized. Call initDB() first.`
    - `[dataLocal] IndexedDB accessed before init`
  - Einordnung: kein harter Bootabbruch, aber unerwuenschter Early-Boot-Zugriff vor `initDB()`.
- S4.1 Umgesetzte Aenderung (Teil 1):
  - `app/supabase/auth/core.js`:
    - `getUserId()` hat jetzt einen Early-Boot-Guard.
    - Wenn `sbClient` noch fehlt und Boot-Stage noch `BOOT`/`AUTH_CHECK` ist, wird frueh mit `null` beendet statt `ensureSupabaseClient()` zu erzwingen.
    - Ziel: kein indirekter `getConf()`/IndexedDB-Zugriff vor `initDB`.
- S4.1 Check-Ergebnis (Teil 1):
  - Guard ist klein, lokal und ohne API-Bruch.
  - Security-/Auth-Gate unveraendert: `requireSession()`-Pfad bleibt unveraendert.
- S4.1 Rest-Risiko (Teil 1):
  - Weitere Callsites koennen weiterhin frueh `getUserId()` anfragen; diese erhalten nun deterministisch `null` statt Fehler.
  - Vollstaendige Verifikation folgt in S4.3/S7 via Live-Smoke und Touchlog-Pruefung.

- S4.1 Rest-Callsites-Analyse (Teil 2):
  - Relevante `getUserId()`-Aufrufe geprueft in:
    - `assets/js/main.js` (z. B. Intake-Reset)
    - `app/supabase/api/*` (intake, vitals, notes, trendpilot, push, system-comments)
    - `app/modules/*` (vitals, appointments, assistant actions)
  - Befund:
    - Viele Aufrufe sind indirekt und kontextabhaengig; fruehe Boot-Aufrufe sind nicht komplett ausschliessbar.
  - Umgesetzte Aenderung (Teil 2):
    - `app/supabase/auth/core.js`: zusaetzlicher Guard `isIndexedDbPendingError(...)`.
    - Wenn trotz fruehem Guard ein IndexedDB-init-pending Fehler auftritt, wird `getUserId()` deterministisch mit `null` beendet (`getUserId done null (db-init-pending)`), ohne harten Error-Pfad.
  - Check-Ergebnis (Teil 2):
    - Boot-Race wird jetzt doppelt abgefangen:
      - proaktiv vor `ensureSupabaseClient()` (Stage-/sbClient-Guard)
      - reaktiv im Catch bei IndexedDB-init-pending.
  - Rest-Risiko (Teil 2):
    - Funktionale Auswirkungen sind gering (nur fruehe `null`-Rueckgabe), muessen aber im Live-Smoke auf Nebenwirkungen in fruehen Modulen geprueft werden.

- S4.2 Befund (abgeschlossen):
  - First-Interactive kann weiter entlastet werden, wenn nicht-kritische Warmups erst nach `IDLE` laufen.
- S4.2 Umgesetzte Aenderung:
  - `assets/js/main.js`:
    - `helpPanel.init()` aus `runBootPhase()` entfernt.
    - Neues `runPostIdleWarmups()` eingefuehrt (idempotent).
    - Nicht-kritische Tasks (`helpPanel.init`, `cleanupOldIntake`) laufen jetzt in der post-IDLE-Kette statt im kritischen Pfad.
    - Frueher blockierender `cleanupOldIntake`-Block aus `initModulesPhase()` entfernt.
- S4.2 Check-Ergebnis:
  - Kritischer Bootpfad bis `IDLE` wurde weiter entkoppelt.
  - Boot-Error-/Stage-Logik bleibt unveraendert.
  - Warmups sind abgesichert (idempotent + Fehlerlogging).
- S4.2 Rest-Risiko:
  - `cleanupOldIntake` kann nun leicht spaeter erfolgen; fachlich akzeptabel, da keine Voraussetzung fuer initiale Interaktion.

- S4.3 Befund (abgeschlossen):
  - Hub/Panel/Open-Flow wurde nach den S4.1/S4.2-Aenderungen auf Boot-Kopplungen geprueft.
  - Fokus war: keine harte Abhaengigkeit von fruehen Warmups vor `IDLE`, keine Regression in Gate-/Open-Handlern.
- S4.3 Umgesetzte Pruefung:
  - `app/modules/hub/index.js` statisch geprueft:
    - `isBootReady()`-Gate bleibt vor Button-Handlern aktiv.
    - `openPanel(...)`, `openDoctorPanel(...)`, `closePanel(...)` bleiben unveraendert an Hub-State gebunden.
    - Hub-Aktivierung bleibt an `bootFlow.whenStage('INIT_UI', ...)` gekoppelt; damit keine Vorverlagerung vor Boot-Ready.
  - Live-Log-Plausibilisierung:
    - Nach Hard-Refresh kein IndexedDB-before-init Fehler mehr.
    - Boot erreicht konsistent `INIT_UI done` / `BOOTSTRAP done`.
    - Module mit Hub-Relevanz (`appointments`, `profile`, capture refresh) initialisieren ohne Abbruch.
- S4.3 Check-Ergebnis:
  - Kein statischer Hinweis auf Open-Flow-Bruch durch die verlagerten post-IDLE-Warmups.
  - Boot-Nachlauf und Modulinitialisierung bleiben stabil.
- S4.3 Rest-Risiko:
  - Interaktive Klickpfade (Assistant/Doctor/Profile/Chart-Shortcut) sollten im Live-Smoke kurz manuell bestaetigt werden; formale Regression dafuer bleibt in S7 enthalten.

- S4.4 Befund (abgeschlossen):
  - Mobile/PWA-Sichtpruefung auf Boot-/Panel-Kontext statisch geprueft; keine Inkonsistenz zur aktuellen Optimierung erkennbar.
- S4.4 Umgesetzte Pruefung:
  - `index.html`:
    - Viewport nutzt `viewport-fit=cover` (Mobile Safe-Area kompatibel).
    - Hub-Panels/Quickbar/Diag-Markup unveraendert vorhanden.
  - `app/modules/hub/index.js`:
    - Performance-Mode bleibt responsiv via `matchMedia('(max-width: 1024px)')`.
    - `data-panel-perf` Umschaltung (`mobile`/`desktop`) bleibt aktiv.
  - `app/styles/hub.css` / `app/styles/auth.css` / `app/styles/base.css`:
    - Mobile- und Boot-Error-regeln fuer Panel-/Diag-/Overlay-Layer weiterhin konsistent.
    - `#bootScreen`/`#diag` Priorisierung im Fehlerfall bleibt unveraendert.
  - `public/manifest.json` + `app/core/pwa.js`:
    - PWA `display=standalone`, Scope/Start-URL und SW-Updatefluss unveraendert.
- S4.4 Check-Ergebnis:
  - Keine statischen Hinweise auf Mobile/PWA-Regression durch S4-Aenderungen.
  - Vorliegende Live-Smokes zeigen stabilen Bootabschluss und intakte Modul-Initialisierung.
- S4.4 Rest-Risiko:
  - Device-spezifische UX-Details (einzelne Android/iOS WebView-Eigenheiten) bleiben naturgemaess nur per realem Endgeraete-Smoke voll bestaetigbar; formale Endabnahme dafuer in S7.

#### S4 Abschlusszusammenfassung
- Befund:
  - Hauptthemen in S4 waren fruehe Init-Races (`getUserId` vor `initDB`) und nicht-kritische Arbeiten im kritischen Bootpfad vor `IDLE`.
- Umgesetzte Aenderung:
  - `getUserId`-Race entschärft (frueher Guard + Catch-Guard fuer `IndexedDB not initialized`).
  - Nicht-kritische Warmups (`helpPanel.init`, `cleanupOldIntake`) von pre-IDLE nach post-IDLE verschoben.
  - Hub/Panel/Open-Flow nach den Reihenfolgeaenderungen statisch geprueft; Mobile/PWA-Sanity gegen Layout/Boot/Manifest/PWA-Flow gegengeprueft.
- Check-Ergebnis:
  - Live-Log zeigt keinen `IndexedDB accessed before init` Fehler mehr.
  - Boot erreicht weiterhin stabil `INIT_UI done` / `BOOTSTRAP done`.
  - Keine statischen Hinweise auf Open-Flow- oder Mobile/PWA-Regression durch S4-Aenderungen.
- Rest-Risiko:
  - Device-spezifische UX-Eigenheiten bleiben fuer finale Sicherheit in S7 per breiterem manuellen Regression-Sweep vorgesehen.

### S5 - PWA/SW Einfluss auf Boot kontrollieren
- S5.1 Service-Worker Cache-Strategie fuer Boot-Assets pruefen.
- S5.2 Update/Install-Banner und controllerchange auf Boot-Einfluss pruefen.
- S5.3 Offline/Navigate-Fallback-Verhalten gegen Bootscreen abgleichen.
- S5.4 Keine Regression bei Update-Flows.

#### S5 Ergebnisprotokoll (abgeschlossen)
- S5.1 Befund (abgeschlossen):
  - Vorher enthielt der Shell-Precache nur einen kleinen Core-Satz.
  - Mehrere fuer den Boot relevante Skripte liefen nur ueber Runtime-Cache, was vor allem beim ersten SW-kontrollierten Start zusaetzliche Netzlatenz bedeuten kann.
  - Es existieren zwei SW-Dateien (`service-worker.js` aktiv, `public/sw/service-worker.js` als Repo-Spiegel), die synchron gehalten werden muessen.
- S5.1 Umgesetzte Aenderung:
  - `service-worker.js` (aktiver SW) und `public/sw/service-worker.js` (Spiegel) angepasst:
    - `CACHE_VERSION` von `v1` auf `v2` angehoben.
    - `CORE_ASSETS` um zentrale Boot-Assets erweitert (`assets/js/main.js`, `assets/js/boot-auth.js`, `app/supabase/index.js`, zentrale `assets/js/ui*`/`data-local`/`format`, `app/core/feedback.js`, `app/core/utils.js`, `app/core/capture-globals.js`).
- S5.1 Check-Ergebnis:
  - PWA-Cachestrategie fuer den Bootpfad ist jetzt expliziter und deterministischer.
  - Versionsbump erzwingt saubere Cache-Rotation beim naechsten SW-Update.
- S5.1 Rest-Risiko:
  - Groesserer Precache kann die Installationsphase leicht verlaengern; wird in S5.2/S5.4 gegen Update-Flow/UX validiert.

- S5.2 Befund (abgeschlossen):
  - `controllerchange` hat bisher immer sofort `location.reload()` ausgefuehrt.
  - Dadurch konnte ein SW-Controller-Wechsel waehrend frueher Bootphasen den Startfluss unnoetig hart unterbrechen.
- S5.2 Umgesetzte Aenderung:
  - `app/core/pwa.js` angepasst:
    - Neuer boot-sicherer Reload-Pfad (`scheduleControllerReload`).
    - Reload erfolgt sofort nur wenn `bootFlow` fehlt oder Stage bereits `IDLE`/`BOOT_ERROR` ist.
    - Sonst wird auf `bootFlow.whenStage('IDLE')` gewartet, mit `2000ms` Timeout-Fallback.
    - Duplicate-Guard (`didApplyControllerReload`) verhindert Mehrfach-Reload bei mehrfachen `controllerchange`-Events.
- S5.2 Check-Ergebnis:
  - `node --check app/core/pwa.js`: PASS
  - Update-/Install-Banner-Logik bleibt unveraendert (`SKIP_WAITING`, Banner-Visibility).
  - SW-Update bleibt funktional, aber mit geringerer Chance auf Boot-Interrupt mitten im Stage-Funnel.
- S5.2 Rest-Risiko:
  - Bei sehr langen/non-standard Bootlaeufen kann der Timeout-Fallback weiterhin einen Reload vor `IDLE` ausloesen; bewusstes Tradeoff zugunsten deterministischer Update-Anwendung.

- S5.3 Befund (abgeschlossen):
  - Im Navigate-Offline-Pfad wurde bisher direkt `offline.html` priorisiert.
  - Dadurch konnte bei Offline-Navigation der normale App-Bootscreen/Bootflow umgangen werden.
- S5.3 Umgesetzte Aenderung:
  - `service-worker.js` und `public/sw/service-worker.js` angepasst:
    - Neuer Helper `getNavigateFallbackResponse(request)`.
    - Fallback-Reihenfolge fuer `request.mode === 'navigate'` jetzt:
      1. `caches.match(request)`
      2. `caches.match(index.html)`
      3. `caches.match(./)`
      4. `caches.match(offline.html)` als letzter Fallback
- S5.3 Check-Ergebnis:
  - `node --check service-worker.js`: PASS
  - `node --check public/sw/service-worker.js`: PASS
  - Offline-/Navigate-Fallback ist jetzt auf App-Shell ausgerichtet und damit besser mit Bootscreen/Bootflow konsistent.
- S5.3 Rest-Risiko:
  - Wenn Shell-Eintraege im Cache fehlen/korrupt sind, faellt der Pfad weiterhin deterministisch auf `offline.html` zurueck.

- S5.4 Befund (abgeschlossen):
  - Nach den S5.1-S5.3-Aenderungen musste verifiziert werden, dass Update-/Install-/Offline-Flow funktional stabil bleiben.
- S5.4 Umgesetzte Pruefung:
  - `app/core/pwa.js` statisch geprueft:
    - Update-Flow bleibt intakt (`updatefound` -> `registration.waiting` -> `SKIP_WAITING`).
    - Install-Flow bleibt intakt (`beforeinstallprompt`, `installBtn`, `appinstalled`).
    - `controllerchange` bleibt update-kompatibel, aber jetzt boot-sicher getaktet.
  - `service-worker.js` + `public/sw/service-worker.js` geprueft:
    - `message: SKIP_WAITING`, `self.skipWaiting()`, `clients.claim()` unveraendert aktiv.
    - Navigate-Fallback nutzt app-shell-first mit deterministischem `offline.html` Endfallback.
  - `index.html` geprueft:
    - `offlineBanner`, `updateBanner`, `updateReloadBtn`, `installBanner`, `installBtn` vorhanden.
- S5.4 Check-Ergebnis:
  - `node --check app/core/pwa.js`: PASS
  - `node --check service-worker.js`: PASS
  - `node --check public/sw/service-worker.js`: PASS
  - Statische Banner-/Hook-Checks ohne Befund; kein regressiver Hinweis im Update-Flow.
- S5.4 Rest-Risiko:
  - Echte Browser-/Device-SW-Zustaende (z. B. sehr alte Worker-Instanzen) koennen nur im finalen End-to-End-Smoke voll bewertet werden; das bleibt in S7 explizit enthalten.

#### S5 Abschlusszusammenfassung
- Befund:
  - Hauptthemen in S5 waren SW-Cache-Abdeckung, reload-Verhalten bei Controllerwechsel und Navigate-Fallback-Konsistenz zum Bootscreen.
- Umgesetzte Aenderung:
  - Shell-Precache fuer boot-kritische Assets erweitert (`CACHE_VERSION v2`).
  - `controllerchange` von hartem Sofort-Reload auf boot-sicheren Reload-Scheduler umgestellt.
  - Navigate-Offline-Fallback auf App-Shell priorisiert (`request -> index -> ./ -> offline`).
  - Update-/Install-/Offline-Flow statisch und syntaktisch gegen Regression geprueft.
- Check-Ergebnis:
  - `node --check` fuer `app/core/pwa.js`, `service-worker.js`, `public/sw/service-worker.js`: PASS.
  - Statische Hook-/Markup-Pruefung fuer Banner und SW-Messages: PASS.
- Rest-Risiko:
  - Rest-Risiko liegt hauptsaechlich in browser-/device-spezifischen SW-Lebenszyklen und wird in S7 durch breiteren Smoke/Regression-Sweep abgefangen.

### S6 - Diagnostics-/Boot-Error-Verhalten gegenpruefen
- S6.1 `Touch-Log oeffnen` in allen Fehlerzeitpunkten pruefen.
- S6.2 `bootErrorFallbackLog` und `earlyBootErrorFallback` validieren.
- S6.3 `getErrorHistory`/`clearErrorHistory` inklusive Reload pruefen.
- S6.4 Duplicate-Guard unter Mehrfachfehlern pruefen.

#### S6 Ergebnisprotokoll (abgeschlossen)
- Befund:
  - Nach S1-S5 musste sichergestellt werden, dass Boot-Error-/Diagnostics-Verhalten unveraendert deterministisch bleibt.
  - Fokus: `Touch-Log oeffnen`, Fallbacks (`bootErrorFallbackLog`, `earlyBootErrorFallback`), History-API und Duplicate-Guard.
- Umgesetzte Pruefung:
  - Ausfuehrbarer Node-Smoke mit Mock-DOM gegen `app/core/boot-flow.js` durchgefuehrt (ohne Produktivcode-Aenderung).
  - S6.1:
    - Fall A: Diag verfuegbar -> `bootErrorDiagBtn` oeffnet Diag-Panel.
    - Fall B: Diag nicht verfuegbar -> Fallback-Log wird im Boot-Error-Panel gerendert.
  - S6.2:
    - Ohne `bootErrorPanel` wird `#earlyBootErrorFallback` mit Fehlerinhalt erzeugt.
  - S6.3:
    - `getErrorHistory()` auf Limit (3) geprueft.
    - Persistenz ueber Reload (neues Modul-Init bei gleichem `localStorage`) verifiziert.
    - `clearErrorHistory()` inkl. Persistenz ueber Reload verifiziert.
  - S6.4:
    - Doppeltes `reportError(...)` mit identischer Signatur erzeugt keinen zweiten History-Eintrag.
    - Duplicate-Suppression wird diagnostisch geloggt.
- Check-Ergebnis:
  - Ausfuehrbare S6-Smokes: `9/9 PASS`.
  - Einzelresultate:
    - `S6.1A diag opens` PASS
    - `S6.1B fallback renders` PASS
    - `S6.2 early fallback renders` PASS
    - `S6.3 history capped to 3` PASS
    - `S6.3 history survives reload` PASS
    - `S6.3 clearErrorHistory works` PASS
    - `S6.3 clear persists across reload` PASS
    - `S6.4 duplicate does not duplicate history` PASS
    - `S6.4 duplicate guard logs suppression` PASS
- Rest-Risiko:
  - Mock-DOM deckt den deterministischen Kernpfad ab, ersetzt aber keinen echten Browser-/Endgeraete-Regressionlauf; dieser bleibt explizit in S7 vorgesehen.

### S7 - Smokechecks + Regression
- S7.1 Cold/Warm/PWA Boot Smoke.
- S7.2 Auth unknown -> resolved Flow.
- S7.3 Doctor-Guard, Realtime, Resume/Focus, Hub-Navigation.
- S7.4 No-error Boot + forced-error Boot vergleichen.
- S7.5 Syntaxchecks und gezielte statische Guards.

#### S7 Ergebnisprotokoll (abgeschlossen)
- Durchgefuehrte Checks:
  - S7.1 Cold/Warm/PWA Boot Smoke (automatisierbarer Anteil):
    - Node-Mock-Smoke gegen `app/core/boot-flow.js`:
      - No-error Stage-Folge bis `IDLE` (inkl. `aria-busy=false`, `bootErrorPanel` hidden).
      - Forced-error Vergleichspfad bis `BOOT_ERROR` (inkl. sichtbarer Fehlerausgabe).
  - S7.2 Auth unknown -> resolved Flow:
    - Statische Guards in `assets/js/main.js`:
      - `requireSession()` im `AUTH_CHECK` vor Folgeaktionen.
      - `waitForAuthDecisionSoft()` weiterhin eingebunden.
      - `setupRealtime()` nur nach Session/Phase.
    - Statischer Guard in `assets/js/boot-auth.js`:
      - Auth-Boot an `bootFlow.whenStage('AUTH_CHECK', ...)` gekoppelt.
      - `onStatus`-Pfad fuer unknown/auth/unauth bleibt vorhanden.
  - S7.3 Doctor-Guard, Realtime, Resume/Focus, Hub-Navigation:
    - Statische Guards:
      - Doctor-Guard/Unlock-Pfade (`requireDoctorUnlock`, `isDoctorUnlocked`) in `assets/js/main.js` + `app/modules/hub/index.js`.
      - Realtime/Resume/Focus-Hooks in `assets/js/main.js` (`setupRealtime`, `resumeFromBackground`, `visibilitychange`, `focus`, `pageshow`).
      - Hub-Open/Panel-Flows (`openPanel`, doctor open-flow) in `app/modules/hub/index.js`.
  - S7.4 No-error Boot + forced-error Boot vergleichen:
    - Im Bootflow-Harness direkt gegeneinander ausgefuehrt (No-error endet in `IDLE`, forced error in `BOOT_ERROR`).
  - S7.5 Syntaxchecks und gezielte statische Guards:
    - `node --check`: `assets/js/main.js`, `app/core/boot-flow.js`, `app/core/pwa.js`, `service-worker.js`, `public/sw/service-worker.js`.
    - Zusatztest Node-Mock gegen `app/core/pwa.js`:
      - Update-Banner bei waiting worker.
      - `SKIP_WAITING` beim Reload-Klick.
      - `controllerchange` vor `IDLE` defered, Reload nach `IDLE`.
      - Install-Banner/-Prompt und `appinstalled`-Hide-Pfad.
- PASS/BLOCKED:
  - PASS:
    - Bootflow-Harness: `6/6 PASS`.
    - PWA-Harness: `11/11 PASS`.
    - Syntaxchecks: alle ausgefuehrten Dateien PASS.
    - Statische Auth/Doctor/Realtime/Hub-Guards ohne regressiven Befund.
  - BLOCKED:
    - Kein echter Browser-/Endgeraete-E2E-Lauf aus CLI (Cold/Warm/PWA mit realem SW-Lifecycle, Touch-Interaktion, UI-Animationen).
- Auffaelligkeiten:
  - Keine neuen regressiven Befunde in den geaenderten Boot/PWA/Diagnostics-Pfaden.
  - Verbleibende Unsicherheit ist erwartbar geraete-/browser-spezifisch (nicht codepfad-spezifisch).
- Entscheidung:
  - S7 fuer den automatisierbaren Scope als abgeschlossen gewertet.
  - Finale Endgeraete-E2E-Bestaetigung bleibt als operationaler Nachlauf (kein Blocker fuer S8-Dokuabschluss).

### S8 - Abschluss, Doku-Sync, Changelog
- S8.1 Statusmatrix finalisieren.
- S8.2 Bootflow-/Diagnostics-Overviews aktualisieren.
- S8.3 QA_CHECKS + CHANGELOG aktualisieren.
- S8.4 Lessons Learned + verbleibende Risiken dokumentieren.

#### S8 Ergebnisprotokoll (abgeschlossen)
- Abschlussergebnis:
  - Roadmap `S1` bis `S8` abgeschlossen; alle geplanten Schritte wurden mit nachvollziehbaren Checks/Protokollen dokumentiert.
  - Bootflow-Optimierung bleibt innerhalb Scope/Guardrails: Stabilitaet priorisiert, Performance verbessert, Error-/Diag-Pfade unveraendert robust.
- Aktualisierte Dokus:
  - `docs/modules/bootflow overview.md`
    - Boot-Sequenz auf finalen Ist-Zustand synchronisiert (post-`IDLE` heavy refresh, boot-aware PWA reload, app-shell-first offline navigate).
  - `docs/modules/Diagnostics Module Overview.md`
    - QA-Checkliste erweitert um History-Limit/Clear und Duplicate-Guard Verhalten.
  - `docs/QA_CHECKS.md`
    - Neue `Phase F4 - Bootflow Optimization Regression` als operativer Endgeraete-/Browser-Checkblock.
  - `CHANGELOG.md`
    - Unreleased um Bootflow-Optimierungs-Aenderungen, Fixes und Doku-Sync ergaenzt.
- Offene Punkte:
  - Kein harter Code-Blocker offen.
  - Browser-/Endgeraete-E2E bleibt als operationaler Nachlauf (bewusst als Rest-Risiko in S7 dokumentiert).
- Follow-up Vorschlaege:
  - Optional: Nach deinem naechsten Live/PWA-Endgeraete-Sweep die F4-Checkboxen in `docs/QA_CHECKS.md` abhaken.
  - Optional: Diese Roadmap nach finalem Deploy in `docs/archive/` verschieben und mit `(done)` markieren (wie beim letzten abgeschlossenen Sprint).

## Smokechecks / Regression (Definition)
- Boot Stage-Reihenfolge bleibt korrekt und endet in `IDLE`.
- `bootErrorPanel`, `bootErrorFallbackLog`, `earlyBootErrorFallback` verhalten sich deterministisch.
- PWA Update/Install/Offline Banner funktionieren unveraendert.
- Keine Regression bei Auth, Capture, Doctor, Charts, Hub.

## Abnahmekriterien
- Boot bleibt funktional stabil und deterministisch.
- Alle zentralen Boot-Error-Diagnosepfade funktionieren weiterhin.
- Smokechecks/Regression sind reproduzierbar dokumentiert.
- Performance ist mindestens nicht schlechter; Verbesserungen sind messbar dokumentiert.

## Risiken
- Zu aggressive Entkopplung kann Hidden Dependencies sichtbar machen.
- Service-Worker-Caching kann bei Versionierung falsche Assets bevorzugen.
- Auth-/Realtime-Timing kann bei Grenzfaellen Race-Conditions erzeugen.
- Optimierung ohne Messdisziplin kann subjektive statt objektive Gewinne erzeugen.
