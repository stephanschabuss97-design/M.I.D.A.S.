# MIDAS Trendpilot Review Findings Roadmap

## Ziel (klar und pruefbar)

Die Trendpilot Edge Function soll die Review-Findings aus dem GPT5.5-/Code-Review sauber abfangen, ohne den Trendpilot zu einer Echtzeit-Alarm- oder Diagnose-Engine umzubauen.

Pruefbare Zieldefinition:

- Non-Dry-Run-Responses geben denselben Kontextstand zurueck, der persistiert wird.
- BP-Critical-Delta ist bewusst entschieden und in Code plus Doku eindeutig beschrieben.
- Wochenmittel-Reliabilitaet ist bewusst entschieden:
  - BP darf nicht still aus zu wenigen Einzelmessungen uebergewichtet werden.
  - Body/Lab behalten ihre Frequenzrealitaet oder dokumentieren bewusst andere Gates.
- Lab-Trends werden nicht durch ein fachlich falsches globales 6-Wochen-Gate blockiert.
- Range-Daten werden als echte Kalendertage validiert.
- ACK-Verhalten bei verlaengerten oder verschaerften Events ist bewusst entschieden und dokumentiert.
- `docs/modules/Trendpilot Module Overview.md` und `docs/QA_CHECKS.md` sprechen nach Abschluss denselben Vertrag wie `backend/supabase/functions/midas-trendpilot/index.ts`.

## Problemzusammenfassung

Beim Review von `midas-trendpilot` wurden mehrere echte, aber unterschiedlich schwere Punkte gefunden:

- Ein klarer Response-Bug:
  - Events werden mit `payload.context` gespeichert, aber im Non-Dry-Run ohne diesen Kontext zurueckgegeben.
- Mehrere fachliche Vertragsfragen:
  - BP-Delta-Critical verlangt aktuell systolisch und diastolisch zugleich.
  - ACK bleibt auch bei Event-Fortsetzung erhalten.
  - Wochenmittel koennen mit einer einzelnen Messung entstehen.
- Zwei technische Hygiene-Punkte:
  - Lab nutzt intern 2-Wochen-/2-Sample-Gates, wird aber vorher global von 6 Wochen blockiert.
  - Range-Validation prueft Format, aber nicht echte Kalendertage.

Die Function ist grundsaetzlich passend fuer MIDAS:

- deterministisch
- wochenbasiert
- baselinebasiert
- nicht als Echtzeit-Alarm ausgelegt
- single-user und service-role-scheduler-tauglich

Diese Roadmap soll daher keine neue Trendpilot-Architektur erfinden, sondern die gefundenen Punkte eng und nachvollziehbar korrigieren oder bewusst als Produktvertrag festhalten.

## Scope

- Code:
  - `backend/supabase/functions/midas-trendpilot/index.ts`
- Doku:
  - `docs/modules/Trendpilot Module Overview.md`
  - `docs/QA_CHECKS.md`
  - diese Roadmap
- Optional read-only Review:
  - `.github/workflows/trendpilot.yml`
  - `sql/14_Trendpilot.sql`
  - `app/supabase/api/trendpilot.js`
  - Trendpilot UI-Konsumenten fuer Response-/ACK-Vertrag

## Not in Scope

- Keine neue Lab-Datenmodellierung fuer Cystatin C, ACR, PCR oder Harnstatus.
- Keine neue SQL-/RLS-/Schema-Aenderung, ausser S1-S3 finden einen harten Contract-Bruch.
- Keine neue Trendpilot-UI.
- Kein Umbau zu Realtime-Spike-Alerts.
- Keine Push-/Reminder-Kette.
- Keine Diagnose- oder Therapieentscheidung.
- Kein Assistant-/Voice-Fast-Path fuer Trendpilot.
- Kein Deploy ohne ausdrueckliche Freigabe.
- Keine grossflaechige Refaktorierung der Edge Function.
- Keine Aenderung anderer Edge Functions.

## Relevante Referenzen (Code)

- `backend/supabase/functions/midas-trendpilot/index.ts`
- `.github/workflows/trendpilot.yml`
- `sql/14_Trendpilot.sql`
- `app/supabase/api/trendpilot.js`
- `app/modules/vitals-stack/trendpilot/index.js`
- `app/modules/vitals-stack/vitals/index.js`
- `app/modules/doctor-stack/doctor/index.js`
- `app/modules/doctor-stack/charts/index.js`

## Relevante Referenzen (Doku)

- `README.md`
- `docs/MIDAS Roadmap Template.md`
- `docs/modules/Trendpilot Module Overview.md`
- `docs/QA_CHECKS.md`
- `docs/archive/Trendpilotrefactor.md`
- `docs/archive/MIDAS Backend Edge Functions Deno Check Roadmap (DONE).md`

Regel:

- Erst Doku und bestehende Trendpilot-Vertraege lesen.
- Dann Edge Function und Konsumentenpfade lesen.
- S1-S3 klaeren Produktvertrag und Bruchrisiko.
- Erst danach Code aendern.

## Guardrails

- MIDAS bleibt single-user und alltagstauglich.
- Trendpilot bleibt ein Wochen-Trendsignal, kein Echtzeit-Alarm.
- Keine freie medizinische Diagnose oder Therapieempfehlung.
- Keine falsche Sicherheit:
  - kritische Verschlechterungen duerfen nicht nur aus Bequemlichkeit versteckt werden.
- Kein falscher Alarm:
  - einzelne Ausreisser duerfen nicht ohne bewussten Vertrag wie stabile Trends wirken.
- Kein Push-Spam und keine Reminder-Kette.
- ACK-Verhalten muss ruhig bleiben, aber Verschlechterungen duerfen nicht unbeabsichtigt unsichtbar werden.
- Source-of-Truth-Dokus muessen am Ende synchron sein.

## Architektur-Constraints

- Supabase Edge Function laeuft in Deno.
- Scheduler nutzt Service Role und `TRENDPILOT_USER_ID`.
- `trendpilot_events` ist Source of Truth fuer Events.
- Dedupe basiert auf `user_id + type + window_from + severity`.
- Bestehender Contract:
  - `ack` bleibt aktuell bei Upsert erhalten.
  - `payload.context` wird nur bei warning/critical angehaengt.
  - `info` erzeugt kein Popup.
- Default-Range ist 56 Tage.
- GitHub Actions Cron ist UTC.
- `deno check` ist Pflicht, ersetzt aber keinen echten Edge Runtime-Smoke.

## Tool Permissions

Allowed:

- Lesen und Aendern von:
  - `backend/supabase/functions/midas-trendpilot/index.ts`
  - `docs/modules/Trendpilot Module Overview.md`
  - `docs/QA_CHECKS.md`
  - diese Roadmap
- Lesen der referenzierten SQL-, Workflow- und Frontend-Dateien.
- Lokale Checks:
  - `deno check backend/supabase/functions/midas-trendpilot/index.ts`
  - `git diff --check`
  - gezielte `rg`-/Review-Scans.

Forbidden:

- Supabase Deploy ohne ausdrueckliche User-Freigabe.
- Echte Edge Function Runtime-Smokes mit Schreibwirkung ohne ausdrueckliche User-Freigabe.
- SQL-/RLS-/Schema-Aenderungen ohne neue Freigabe.
- Neue medizinische Metriken oder Lab-Felder.
- UI-/Assistant-/Push-/Voice-Umbauten.
- GitHub-Actions-Umbau ohne separaten Befund.

## Execution Mode

- S1 bis S3 sind Detektivarbeit und Contract Review, weil Trendpilot Edge Function und medizinische Trendlogik betroffen sind.
- S4 ist Umsetzung in Substeps.
- S5 prueft lokal und definiert nicht lokal ausgefuehrte Runtime-Smokes.
- S6 synchronisiert Trendpilot-Doku, QA und Roadmap.
- Nach jedem Hauptschritt Statusmatrix aktualisieren.
- Jeder Hauptschritt endet mit:
  - Schritt-Abnahme
  - Doku-Sync-Entscheidung
  - Commit-Empfehlung

## Vorab Contract Review 31.05.2026

Review-Frage:

- Duerfen die Trendpilot-Review-Findings in einer kleinen Roadmap zusammengefasst werden, ohne daraus einen grossen Trendpilot-Umbau zu machen?

Entscheidung:

- Ja, wenn die Roadmap eng auf die sechs Review-Findings und die dazugehoerige Doku-/QA-Synchronisierung begrenzt bleibt.

Vorab-Findings:

- CR-TRP-ROAD-F1: Der Response-Kontext-Bug ist ein klarer Code-Fix und darf nicht mit Produktentscheidungen blockiert werden.
- CR-TRP-ROAD-F2: BP-Critical-Delta ist kein reiner Tippfehler, sondern ein fachlicher Severity-Vertrag.
- CR-TRP-ROAD-F3: ACK-Reopen ist ein Produktverhalten und darf nicht still geaendert werden.
- CR-TRP-ROAD-F4: Sample-Minimum muss je Metrik bewertet werden; BP, Body und Lab haben unterschiedliche Messfrequenzen.
- CR-TRP-ROAD-F5: Lab-Gate und Date-Validation sind technische Konsistenz-/Hygiene-Fixes.
- CR-TRP-ROAD-F6: Neue CKD-Lab-Metriken bleiben ausdruecklich ausser Scope.

Korrekturen am Roadmap-Vertrag:

- S4 trennt klar zwischen sicherem Bugfix, Produktentscheidungen und Hygiene-Fixes.
- Not-in-Scope grenzt neue Lab-Metriken, SQL und UI aus.
- S2/S3 muessen BP-Critical und ACK bewusst entscheiden, bevor S4 diese Semantik umsetzt.

Nachpruefung:

- Keine offenen Contract-Findings fuer den Roadmap-Start.

## Post-Write Contract Review 31.05.2026

Review-Frage:

- Entspricht diese Roadmap den Review-Aussagen und dem bestehenden Trendpilot-Modulvertrag?

Geprueft:

- Roadmap-Struktur gegen `docs/MIDAS Roadmap Template.md`.
- Ziel gegen `docs/modules/Trendpilot Module Overview.md`.
- Scope gegen GPT5.5-Findings:
  - Response-Kontext.
  - BP-Critical-Delta.
  - Wochenmittel-Samples.
  - Lab-Gate.
  - Range-Date-Validation.
  - ACK-Fortsetzung.
- Guardrails gegen Trendpilot-Abgrenzung:
  - keine Echtzeit-Alerts.
  - keine Diagnose/Therapie.
  - keine Push-/Reminder-Kette.
  - keine neue Lab-Datenmodellierung.

Findings:

- CR-TRP-POST-F1: Die Roadmap musste klarer trennen, welche Punkte Codefehler sind und welche Produktentscheidungen sind.
- CR-TRP-POST-F2: Lab-Erweiterungen aus dem Review-Text duerfen nicht versehentlich in Scope geraten.
- CR-TRP-POST-F3: ACK-Verhalten ist bereits dokumentierter Ist-Vertrag und muss daher in S2/S3 bewusst entschieden werden.
- CR-TRP-POST-F4: Sample-Minimum darf nicht pauschal auf alle Metriken angewendet werden.

Korrekturen:

- CR-TRP-POST-F1 korrigiert:
  - S4 trennt `sicherer Bugfix`, `bewusste Produktentscheidung` und `Hygiene-Fix`.
- CR-TRP-POST-F2 korrigiert:
  - Not-in-Scope schliesst neue Lab-Felder explizit aus.
- CR-TRP-POST-F3 korrigiert:
  - ACK ist in S2/S3/S4 als eigener Entscheidungs- und Review-Punkt gefuehrt.
- CR-TRP-POST-F4 korrigiert:
  - Sample-Reliabilitaet wird metrikspezifisch geprueft.

Nachpruefung:

- Keine offenen Post-Write-Contract-Findings.

## Statusmatrix

| ID | Schritt | Status | Ergebnis/Notiz |
| --- | --- | --- | --- |
| S1 | System- und Vertragsdetektivarbeit | DONE | README, Trendpilot-Doku, historische Roadmaps, SQL, Workflow, Edge Function und UI-/API-Konsumenten gelesen; Systemkarte und S1-Findings dokumentiert. |
| S2 | Fachlicher/technischer Contract Review | DONE | Response-Kontext, BP-Critical mit Mindestniveau, BP-Sample-Gate, evaluator-spezifisches Lab-Gate, strikte Date-Validation und ACK-Fortsetzungvertrag entschieden. |
| S3 | Bruchrisiko-, Copy- und Umsetzungsreview | DONE | Response-/DB-Drift, Dedupe, ACK-Fortsetzung, BP-Baseline-Bestand, Lab-Range, Date-Validation und S4-Substeps reviewed; keine offenen S3-Contract-Findings. |
| S4 | Umsetzung in `index.ts` | DONE | S4.1 bis S4.6 umgesetzt; S4.7 Gesamt-Code- und Contract Review ohne offene Findings abgeschlossen. |
| S5 | Tests, Code Review und Contract Review | DONE | Deno, Diff, Scans, Code Review und Contract Review abgeschlossen; keine offenen P0/P1-Findings. |
| S6 | Doku-Sync, QA-Update und Abschlussreview | DONE | Trendpilot Overview, QA und Roadmap final synchronisiert; Contract Review ohne offene Findings abgeschlossen. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## S1 - System- und Vertragsdetektivarbeit

Ziel:

- Bestehenden Trendpilot-Vertrag verstehen.
- Klaeren, welche Schichten von den sechs Review-Findings betroffen sind.
- Noch keinen Produktcode aendern.

Substeps:

- S1.1 `README.md` und MIDAS-Guardrails lesen.
- S1.2 `docs/modules/Trendpilot Module Overview.md` lesen.
- S1.3 historische Trendpilot-/Edge-Function-Roadmaps lesen:
  - `docs/archive/Trendpilotrefactor.md`
  - `docs/archive/MIDAS Backend Edge Functions Deno Check Roadmap (DONE).md`
- S1.4 `backend/supabase/functions/midas-trendpilot/index.ts` lesen.
- S1.5 SQL-/Workflow-Vertrag lesen:
  - `sql/14_Trendpilot.sql`
  - `.github/workflows/trendpilot.yml`
- S1.6 API-/UI-Konsumenten fuer Response, Ack und Events lesen.
- S1.7 Systemkarte und Findings dokumentieren.
- S1.8 Contract Review S1.

Exit-Kriterium:

- Es ist klar, wo Events entstehen, wo Kontext angehaengt wird, wie ACK erhalten bleibt und welche Konsumenten die Response oder DB lesen.

### S1 Ergebnisprotokoll 01.06.2026

Durchgefuehrt:

- S1.1 `README.md` und MIDAS-Guardrails gelesen.
- S1.2 `docs/modules/Trendpilot Module Overview.md` gelesen.
- S1.3 historische Trendpilot-/Edge-Function-Roadmaps gelesen:
  - `docs/archive/Trendpilotrefactor.md`
  - `docs/archive/MIDAS Backend Edge Functions Deno Check Roadmap (DONE).md`
- S1.4 `backend/supabase/functions/midas-trendpilot/index.ts` gelesen.
- S1.5 SQL-/Workflow-Vertrag gelesen:
  - `sql/14_Trendpilot.sql`
  - `.github/workflows/trendpilot.yml`
- S1.6 API-/UI-Konsumenten gelesen:
  - `app/supabase/api/trendpilot.js`
  - `app/modules/vitals-stack/trendpilot/index.js`
  - `app/modules/vitals-stack/vitals/index.js`
  - `app/modules/intake-stack/intake/index.js`
  - `app/modules/hub/index.js`
  - `app/modules/doctor-stack/doctor/index.js`
  - `app/modules/doctor-stack/charts/index.js`
  - `index.html`
- S1.7 Systemkarte und Findings dokumentiert.
- S1.8 Contract Review S1 durchgefuehrt.

Systemkarte:

- Produktvertrag:
  - Trendpilot ist ein mittelfristiges Wochen-Trendsignal.
  - Kein Echtzeit-Spike-Alert.
  - Keine Diagnose- oder Therapieentscheidung.
  - Kein Voice-/Assistant-Fast-Path fuer Trendpilot-Erzeugung oder ACK-Entscheidungen.
- Trigger:
  - GitHub Actions ruft woechentlich die Edge Function mit Service-Role-Bearer auf.
  - `TRENDPILOT_USER_ID` ist fuer Scheduler-Runs Pflicht, weil Service Role keine `auth.uid()`-Nutzeridentitaet liefert.
  - Manuelle/User-nahe Aufrufe koennen ueber User-Bearer laufen und werden gegen `user_id` geprueft.
- Datenbasis:
  - BP und Body kommen aus `health_events`.
  - Lab kommt aus `health_events` mit `type = lab_event`.
  - Activity-Kontext kommt aus `health_events` mit `type = activity_event`.
  - Trendpilot schreibt `trendpilot_events` und `trendpilot_state`.
- SQL-Vertrag:
  - `trendpilot_events` erlaubt `type in ('bp','body','lab','combined')`.
  - `severity in ('info','warning','critical')`.
  - `window_to >= window_from`.
  - `ack=true` verlangt `ack_at`, `ack=false` verlangt `ack_at null`.
  - Dedupe-Index ist `user_id + type + window_from + severity`.
  - `trendpilot_state` speichert Baselines fuer `bp`, `body`, `lab`.
- Event-Erzeugung:
  - Edge Function berechnet Wochenfenster, Baselines, Deltas und Severity.
  - `evaluateBpTrends`, `evaluateBodyTrends`, `evaluateLabTrends` erzeugen Single-Events.
  - `attachContextToEvents` haengt Kontext nur an Nicht-`info`-Events.
  - `correlateTrends` erzeugt Combined-Events aus upserted Single-Events mit IDs.
- Persistenz:
  - `upsertTrendpilotEvents` sucht bestehende Events ueber `user_id`, `type`, `window_from`, `severity`.
  - `window_to` wird auf den spaeteren Wert erweitert.
  - `payload` wird gemerged.
  - Bestehendes `ack` und `ack_at` werden erhalten.
- Frontend/API-Konsum:
  - `app/supabase/api/trendpilot.js` liest aus `trendpilot_events_range` und schreibt ACK/Delete direkt gegen `trendpilot_events`.
  - `app/modules/vitals-stack/trendpilot/index.js` laedt den neuesten Event, zeigt Popup bei warning/critical und setzt ACK nach expliziter Kenntnisnahme.
  - `app/modules/doctor-stack/doctor/index.js` liest Range-Events, zeigt Arzt-Block und erlaubt ACK/Delete.
  - `app/modules/doctor-stack/charts/index.js` liest BP-Trendpilot-Bands aus der Range-View.
  - Hub und Intake reagieren auf `trendpilot:latest` fuer Aura/Pill, nicht auf die Edge-Function-Response.
  - Die Edge-Function-Response ist damit vor allem fuer Dry-Run, Debug, manuelle QA und API-Smokes relevant.

Findings:

- TRP-S1-F1: Der Response-Kontext-Bug ist real.
  - `singleWithContext` wird in `upsertTrendpilotEvents` persistiert.
  - Non-Dry-Run gibt aber `allEvents = [...singleEvents, ...combined]` zurueck.
  - Dry-Run nutzt dagegen bereits `singleWithContext`.
  - Risiko: Debug/API-Smoke sieht nicht exakt, was persistiert wurde.
- TRP-S1-F2: Die Haupt-UI liest aus der DB-View, nicht aus der Edge-Function-Response.
  - Dadurch ist F1 kein direkter UI-Datenverlust, aber ein Response-/QA-Contract-Drift.
  - S4.1 bleibt trotzdem sinnvoll, weil Response und Persistenz denselben Vertrag haben sollen.
- TRP-S1-F3: BP-Critical-Delta ist fachlich nicht eindeutig dokumentiert.
  - Code nutzt fuer absolute Criticals OR:
    - `avgSys >= 140` oder `avgDia >= 90`.
  - Delta-Critical nutzt AND:
    - `deltaSys >= 15` und `deltaDia >= 10`.
  - Modul-Doku formuliert `+15/+10`, was fuer spaetere Leser nicht klar genug sagt, ob AND oder OR gemeint ist.
- TRP-S1-F4: Wochenmittel enthalten `samples`, erzwingen aber kein Mindest-Sample pro Woche.
  - BP, Body und Lab bauen Wochenmittel aus `sum / n`.
  - Bei BP kann eine Einzelmessung pro Woche einen 2-Wochen-Streak treiben.
  - Bei Body/Lab ist die Messfrequenz fachlich anders; pauschales Filtern waere riskant.
- TRP-S1-F5: Lab hat eigene 2-Wochen-/2-Sample-Gates, wird aber vorher vom globalen 6-Wochen-Range-Gate blockiert.
  - `LAB_MIN_WEEKS = 2`, `LAB_MIN_SAMPLES = 2`.
  - Handler returned vor den Evaluatoren `insufficient_data`, wenn Range unter 6 Wochen liegt.
  - Default-Range 56 Tage ist nicht betroffen, manuelle/Dry-Run-Ranges schon.
- TRP-S1-F6: Date-Validation ist format-, aber nicht kalenderstreng.
  - `ISO_DAY_RE` erlaubt formale Tage bis `31`.
  - `parseIsoDay` prueft Monat 1-12 und Tag 1-31, aber nicht echte Monatslaengen.
  - Date-Helfer koennen dadurch mit JS-Date-Rolling arbeiten.
- TRP-S1-F7: ACK-Erhalt bei Event-Fortsetzung ist dokumentierter Ist-Vertrag.
  - Trendpilot Overview sagt: ACK bleibt erhalten, auch wenn Event spaeter erweitert wird.
  - Code setzt das in `upsertTrendpilotEvents` so um.
  - Das ist kein S1-Codebug, aber eine bewusste S2-Produktentscheidung.
- TRP-S1-F8: Combined-Korrelation haengt an Single-Event-IDs.
  - Non-Dry-Run upsertet zuerst Single-Events.
  - `correlateTrends` nutzt `singleUpsert.withIds`.
  - Ein Response-Fix darf diesen Ablauf nicht brechen.
- TRP-S1-F9: Bestehende Backend-Deno-Roadmap hat Trendpilot nur als Type-/Log-Hygiene geaendert.
  - Damals wurden Baselines, Trend-Gates, Severity, ACK, Kontextpayload und Dedupe bewusst nicht angefasst.
  - Diese Roadmap ist daher der erste gezielte Scope fuer fachliche Trendpilot-Review-Findings seitdem.
- TRP-S1-F10: Workflow nutzt `curl -sS` ohne explizites Fail-on-HTTP-Error.
  - Das ist ein Watchlist-Punkt, aber kein direktes Finding dieser Roadmap.
  - Kein GitHub-Actions-Umbau in S1.

S1 Contract Review:

- Review-Frage:
  - Erfuellt S1 den Roadmap-Vertrag, ohne Code oder Produktvertrag bereits zu veraendern?
- Entscheidung:
  - Ja. S1 hat Doku, historische Roadmaps, Edge Function, SQL, Workflow und Konsumentenpfade gelesen und die betroffenen Schichten abgegrenzt.
  - Keine Produktcode-Aenderung wurde vorgenommen.
  - Die weiteren Entscheidungen gehoeren in S2/S3.

Contract-Findings:

- TRP-S1-CR-F1: S1 musste klarer festhalten, dass F1 vor allem API-/QA-Drift ist, weil UI-Konsumenten aus der DB lesen.
- TRP-S1-CR-F2: S1 musste ACK als dokumentierten Ist-Vertrag statt als sofortigen Bug klassifizieren.
- TRP-S1-CR-F3: S1 musste Lab-Gate als Handler-Gate vor Evaluator-Logik beschreiben.
- TRP-S1-CR-F4: S1 musste Sample-Minimum metrikspezifisch einordnen.
- TRP-S1-CR-F5: S1 musste den GitHub-Workflow-Fund als Watchlist abgrenzen, damit S4 nicht versehentlich Actions umbaut.

Korrekturen aus dem Contract Review:

- TRP-S1-CR-F1 korrigiert:
  - TRP-S1-F2 dokumentiert DB-View als Haupt-UI-Quelle und F1 als Response-/QA-Drift.
- TRP-S1-CR-F2 korrigiert:
  - TRP-S1-F7 klassifiziert ACK-Erhalt als bestehenden Ist-Vertrag und S2-Entscheidung.
- TRP-S1-CR-F3 korrigiert:
  - TRP-S1-F5 beschreibt das globale Handler-Gate vor den Evaluatoren.
- TRP-S1-CR-F4 korrigiert:
  - TRP-S1-F4 trennt BP, Body und Lab.
- TRP-S1-CR-F5 korrigiert:
  - TRP-S1-F10 grenzt Workflow-Haertung als Watchlist aus.

Doku-Sync-Entscheidung:

- Noch keine Aenderung an `docs/modules/Trendpilot Module Overview.md` oder `docs/QA_CHECKS.md`.
- Doku-Sync folgt in S6, nachdem S2/S3 Entscheidungen und S4 Umsetzung abgeschlossen sind.

S1 Exit:

- Erfuellt.
- Es ist klar:
  - wo Events entstehen.
  - wo Kontext angehaengt wird.
  - wie ACK erhalten bleibt.
  - welche Konsumenten die DB lesen.
  - warum die Edge-Function-Response dennoch contractrelevant bleibt.

S1 Schritt-Abnahme und Commit-Empfehlung:

- Abnahme: S1 abgeschlossen.
- Commit: noch nicht einzeln noetig; sinnvoll nach S3 oder nach vollstaendigem Fix.

## S2 - Fachlicher/technischer Contract Review

Ziel:

- Fachlichen Zielvertrag fuer die sechs Findings festlegen.
- Entscheiden, was Codefix, No-Change oder Doku-Klarstellung wird.

Substeps:

- S2.1 Response-Kontext-Vertrag festlegen:
  - Non-Dry-Run muss zurueckgeben, was fuer Single-Events persistiert wurde.
- S2.2 BP-Critical-Delta-Optionen vergleichen:
  - aktuelles AND dokumentieren.
  - OR.
  - OR mit Mindestniveau.
- S2.3 Wochenmittel-Reliabilitaet je Metrik entscheiden:
  - BP.
  - Body.
  - Lab.
- S2.4 Lab-Gate-Vertrag entscheiden:
  - globales 6-Wochen-Gate entfernen oder evaluator-spezifisch machen.
- S2.5 Range-Date-Validation-Vertrag festlegen.
- S2.6 ACK-Verhalten entscheiden:
  - ACK immer erhalten.
  - ACK bei Fortsetzung/Verschlechterung resetten.
  - ACK erhalten, aber Payload/Response markiert Fortsetzung.
- S2.7 S4-Pflichtpunkte definieren.
- S2.8 Contract Review S2.

Exit-Kriterium:

- S4 kann starten, ohne offene Grundsatzfragen zu Severity, ACK oder Sample-Gates.

### S2 Ergebnisprotokoll 01.06.2026

Durchgefuehrt:

- S2.1 Response-Kontext-Vertrag festgelegt.
- S2.2 BP-Critical-Delta-Optionen verglichen.
- S2.3 Wochenmittel-Reliabilitaet je Metrik entschieden.
- S2.4 Lab-Gate-Vertrag entschieden.
- S2.5 Range-Date-Validation-Vertrag festgelegt.
- S2.6 ACK-Verhalten entschieden.
- S2.7 S4-Pflichtpunkte definiert.
- S2.8 Contract Review S2 durchgefuehrt.

#### S2.1 Response-Kontext-Vertrag

Entscheidung:

- Non-Dry-Run muss fuer Single-Events denselben Context-Stand zurueckgeben, der an `upsertTrendpilotEvents` uebergeben und persistiert wird.
- Der Fix bleibt eng:
  - Response verwendet context-angereicherte Single-Events.
  - Kein neues Response-Schema.
  - Keine neue ID-Anforderung fuer `events`.
  - `written` bleibt die Quelle fuer Upsert-Ergebnisse/IDs.

Begruendung:

- Dry-Run und DB-Persistenz sind bereits context-konsistent.
- Nur Non-Dry-Run-Response driftet ab.
- Haupt-UI liest aus der DB-View, aber Debug/API-QA soll dieselbe Semantik sehen.

S4-Pflicht:

- S4.1 muss `allEvents` im Non-Dry-Run auf den context-angereicherten Single-Events aufbauen.

#### S2.2 BP-Critical-Delta-Vertrag

Optionen:

- Aktuelles AND dokumentieren:
  - Vorteil: sehr konservativ, wenig Alarm.
  - Nachteil: isolierte systolische oder diastolische Verschlechterung kann zu schwach gewichtet werden.
- Reines OR:
  - Vorteil: jede starke Delta-Achse zaehlt.
  - Nachteil: bei sehr niedriger Baseline koennen relativ moderate absolute Werte kritisch wirken.
- OR mit Mindestniveau:
  - Vorteil: isolierte Verschlechterung zaehlt, aber erst ab einem absoluten Niveau, das fuer Trendpilot als Warnkontext plausibel ist.
  - Nachteil: etwas komplexerer Vertrag, muss sauber dokumentiert werden.

Entscheidung:

- BP-Critical bleibt absolut weiterhin:
  - `avgSys >= 140` oder `avgDia >= 90`.
- Delta-Critical wird auf OR mit Mindestniveau umgestellt:
  - systolisch: `avgSys >= 130` und `deltaSys >= 15`.
  - diastolisch: `avgDia >= 85` und `deltaDia >= 10`.
- Warning bleibt:
  - `deltaSys >= 8` oder `deltaDia >= 5`.
- Der 2-Wochen-Streak bleibt unveraendert.

Begruendung:

- Trendpilot soll nicht aus einem einzelnen relativen Sprung sofort alarmistisch werden.
- Isolierte systolische Verschlechterung soll aber nicht kuenstlich auf Warning begrenzt bleiben, wenn das Wochenmittel bereits im hoeheren Bereich liegt.
- Das bleibt ein Trend-Signal, keine Diagnose.

S4-Pflicht:

- S4.2 muss die BP-Klassifikation entsprechend anpassen.
- S6 muss die Doku-Zeile `+15/+10` eindeutig machen.

#### S2.3 Wochenmittel-Reliabilitaet je Metrik

BP:

- Entscheidung:
  - BP-Wochen werden fuer Baseline, Status, Streak und Normalisierung nur gewertet, wenn sie mindestens 2 valide BP-Samples enthalten.
- Begruendung:
  - BP ist typischerweise hoeherfrequent und schwankungsanfaellig.
  - Zwei Einzelmessungen in zwei Wochen sollen keinen stabil wirkenden Trend erzeugen.
  - Das reduziert False Positives, ohne den Wochen-Trendcharakter zu verlassen.

Body:

- Entscheidung:
  - Kein Mindest-Sample pro Woche in diesem Fix.
- Begruendung:
  - Koerpergewicht/Body-Werte werden realistischerweise niedriger frequent gemessen.
  - Ein pauschales 2-Sample-Wochengate koennte Body-Trends unnoetig blind machen.

Lab:

- Entscheidung:
  - Kein Mindest-Sample pro Woche.
  - Bestehender Lab-Vertrag bleibt:
    - mindestens 2 Wochen.
    - mindestens 2 Samples im Range.
    - mindestens 2 Samples im Baseline-Slice.
- Begruendung:
  - Laborwerte sind seltene Messpunkte.
  - Per-Week-Minimum waere fuer Lab fachlich unpassend.

S4-Pflicht:

- S4.3 muss BP-Wochen mit weniger als 2 validen Samples aus der BP-Auswertung ausschliessen.
- Body und Lab bleiben in diesem Punkt No-Change.

#### S2.4 Lab-Gate-Vertrag

Entscheidung:

- Das globale 6-Wochen-Gate im Handler wird entfernt oder so umgebaut, dass Lab nicht vorzeitig blockiert wird.
- BP und Body duerfen weiterhin intern 6 Wochen verlangen.
- Lab entscheidet mit seinen eigenen Gates:
  - `LAB_MIN_WEEKS = 2`.
  - `LAB_MIN_SAMPLES = 2`.
  - `LAB_BASELINE_WEEKS = 3`.

Begruendung:

- Der aktuelle Default-Range von 56 Tagen bleibt unkritisch.
- Manuelle/Dry-Run-Lab-Tests unter 6 Wochen sollen aber nicht falsch mit `insufficient_data` vom Handler blockiert werden.
- Evaluator-spezifische Gates sind klarer als ein globales Gate fuer unterschiedliche Metriken.

S4-Pflicht:

- S4.4 muss das globale Handler-Gate entfernen oder evaluator-spezifisch machen.
- Response-Noise darf dabei nicht wachsen; S3 muss pruefen, ob eine neutrale Diagnose-Note sinnvoll ist.

#### S2.5 Range-Date-Validation-Vertrag

Entscheidung:

- `range.from` und `range.to` muessen echte Kalendertage im Format `YYYY-MM-DD` sein.
- Regex allein reicht nicht.
- Datum wird nach dem Parsen per UTC-Roundtrip validiert:
  - Eingabe `2026-02-31` muss abgelehnt werden.
  - `from > to` bleibt Fehler.
- Vienna-Default-Range bleibt unveraendert.

Begruendung:

- Trendpilot arbeitet mit Wochenfenstern und Datumsvergleichen.
- Stilles JS-Date-Rolling ist fuer Health-Datenlogik unpassend.

S4-Pflicht:

- S4.5 muss eine strikte ISO-Day-Validierung einfuehren und die bestehenden Date-Helfer daran anbinden.

#### S2.6 ACK-Fortsetzungsvertrag

Optionen:

- ACK immer erhalten:
  - Vorteil: ruhig, kein Popup-Laerm.
  - Nachteil: Fortsetzung kann zu still wirken.
- ACK bei Fortsetzung resetten:
  - Vorteil: Nutzer sieht verlaengerten Trend erneut.
  - Nachteil: kann bei woechentlichen Trends laestig werden und dem MIDAS-Ruheprinzip widersprechen.
- ACK erhalten, aber Fortsetzung markieren:
  - Vorteil: kein neuer Popup-Zwang, aber Persistenz/Arztansicht koennen die Fortsetzung erkennen.
  - Nachteil: UI zeigt die Markierung erst nach Doku-/Darstellungsnachzug explizit.

Entscheidung:

- ACK bleibt bei Event-Fortsetzung erhalten.
- Wenn ein bereits acknowledged Event durch ein spaeteres `window_to` erweitert wird, soll die Payload eine Fortsetzungsmarkierung bekommen.
- Kein ACK-Reset fuer gleiche Event-Identitaet.
- Wenn eine hoehere Severity als eigenes Event entsteht, bleibt sie durch den bestehenden Dedupe-Key separat und standardmaessig unacknowledged.

Begruendung:

- Trendpilot soll nicht woechentlich neue Pflicht-Popups erzeugen.
- Fortsetzung darf aber in Payload/Doctor-Kontext nachvollziehbar sein.
- Das respektiert den dokumentierten Ist-Vertrag und ergaenzt Transparenz.

S4-Pflicht:

- S4.6 muss ACK-Erhalt beibehalten.
- S4.6 muss bei `existing.ack` und wachsendem `window_to` eine Fortsetzungsmarkierung im Payload setzen.
- Keine UI-Pflicht in S4; S6 dokumentiert den Payload-Vertrag.

#### S2.7 S4-Pflichtpunkte

S4 muss in dieser Reihenfolge arbeiten:

- S4.1 Response-Kontext:
  - Non-Dry-Run-Response nutzt context-angereicherte Single-Events.
- S4.2 BP-Critical:
  - Absolute Criticals unveraendert.
  - Delta-Critical als OR mit Mindestniveau.
- S4.3 BP-Sample-Gate:
  - BP-Wochen erst ab 2 validen Samples werten.
  - Body/Lab in diesem Punkt No-Change.
- S4.4 Lab-Gate:
  - Kein globales 6-Wochen-Blockieren vor Lab-Evaluator.
- S4.5 Date-Validation:
  - echte Kalendertage, kein Date-Rolling.
- S4.6 ACK-Fortsetzung:
  - ACK erhalten.
  - Fortsetzung bei wachsendem `window_to` im Payload markieren.
- S4.7 Gesamt-Code- und Contract Review.

#### S2.8 Contract Review

Review-Frage:

- Sind die S2-Entscheidungen eng genug, um die sechs Review-Findings zu korrigieren, ohne den Trendpilot-Produktvertrag zu ueberdehnen?

Entscheidung:

- Ja. S2 trennt klar:
  - sicheren Response-Bugfix.
  - fachliche Severity-Entscheidung.
  - metrikspezifische Sample-Reliabilitaet.
  - technische Lab-/Date-Hygiene.
  - ruhiges, aber transparenteres ACK-Verhalten.

Contract-Findings:

- TRP-S2-CR-F1: Reines Delta-OR waere fuer MIDAS zu alarmistisch, wenn die absolute Ebene noch niedrig ist.
- TRP-S2-CR-F2: ACK-Reset bei jeder Fortsetzung koennte Trendpilot in Reminder-Laerm verwandeln.
- TRP-S2-CR-F3: BP-Sample-Minimum durfte nicht pauschal auf Body und Lab uebertragen werden.
- TRP-S2-CR-F4: Lab-Gate-Fix darf nicht dazu fuehren, dass BP/Body ihre 6-Wochen-Baseline verlieren.
- TRP-S2-CR-F5: Response-Kontext-Fix darf nicht nebenbei das Response-ID-Schema veraendern.
- TRP-S2-CR-F6: Date-Validation darf Vienna-Default-Range und ISO-Day-Vergleiche nicht umbauen.

Korrekturen aus dem Contract Review:

- TRP-S2-CR-F1 korrigiert:
  - BP-Delta-Critical als OR mit Mindestniveau festgelegt.
- TRP-S2-CR-F2 korrigiert:
  - ACK bleibt erhalten; Fortsetzung wird markiert statt neu gepopupt.
- TRP-S2-CR-F3 korrigiert:
  - Sample-Gate nur fuer BP festgelegt; Body/Lab No-Change.
- TRP-S2-CR-F4 korrigiert:
  - Lab-Gate wird evaluator-spezifisch; BP/Body behalten interne 6-Wochen-Anforderung.
- TRP-S2-CR-F5 korrigiert:
  - S4.1 bleibt auf Context-Konsistenz begrenzt; `written` bleibt ID-/Upsert-Quelle.
- TRP-S2-CR-F6 korrigiert:
  - Date-Validation wird als strikter Roundtrip-Check formuliert, ohne Range-Default oder Zeitzonenvertrag zu aendern.

Doku-Sync-Entscheidung:

- Noch keine Aenderung an `docs/modules/Trendpilot Module Overview.md` oder `docs/QA_CHECKS.md`.
- Doku-Sync folgt in S6, nachdem Code und S5-Checks abgeschlossen sind.

S2 Exit:

- Erfuellt.
- S4 kann starten, ohne offene Grundsatzfragen zu:
  - Response-Kontext.
  - BP-Critical.
  - Sample-Gates.
  - Lab-Gate.
  - Date-Validation.
  - ACK-Fortsetzung.

S2 Schritt-Abnahme und Commit-Empfehlung:

- Abnahme: S2 abgeschlossen.
- Commit: noch nicht einzeln noetig; sinnvoll nach S3 oder nach vollstaendigem Fix.

## S3 - Bruchrisiko-, Copy- und Umsetzungsreview

Ziel:

- Risiken vor Codeaenderungen finden.
- Runtime- und QA-Grenzen definieren.

Substeps:

- S3.1 Bruchrisiken identifizieren:
  - Response-/DB-Drift.
  - Dedupe- und Upsert-Verhalten.
  - ACK-Noise oder stilles Unterdruecken.
  - False-Positive-Trends aus Einzelmessungen.
  - Lab-Tests mit kurzem Range.
  - Invalid-Date-Rolling.
- S3.2 User-Facing Copy Review:
  - Nur falls ACK-/Severity-/Status-Texte betroffen werden.
  - Meldungen duerfen weder falschen Alarm noch falsche Sicherheit erzeugen.
- S3.3 Tooling und lokale Checks klaeren.
- S3.4 Runtime-Smokes definieren:
  - Dry-Run mit Context.
  - Non-Dry-Run Response.
  - ACK-Fortsetzung.
  - BP-Delta-Beispiele.
  - Lab-Range unter 6 Wochen.
  - Invalid-Date-Input.
- S3.5 S4-Substeps finalisieren.
- S3.6 Contract Review S3.

Exit-Kriterium:

- Alle S4-Substeps haben klare Review-Kriterien.

### S3 Ergebnisprotokoll 01.06.2026

Durchgefuehrt:

- S3.1 Bruchrisiken identifiziert.
- S3.2 User-Facing Copy Review durchgefuehrt.
- S3.3 Tooling und lokal moegliche Checks geklaert.
- S3.4 Runtime-Smokes definiert.
- S3.5 S4-Substeps finalisiert.
- S3.6 Contract Review S3 durchgefuehrt.

#### S3.1 Bruchrisiken

Response-/DB-Drift:

- Risiko:
  - S4.1 korrigiert Context in der Non-Dry-Run-Response.
  - `upsertTrendpilotEvents` merged aber bestehende Payloads und kann `window_to` aus bestehenden DB-Zeilen uebernehmen.
  - Die bisherige Response ist ein generierter Event-Snapshot, nicht zwingend der vollstaendige persistierte DB-Row.
- Entscheidung:
  - S4.1 bleibt eng auf den Context-Drift begrenzt:
    - Single-Events in der Response muessen `payload.context` enthalten, wenn sie so persistiert wurden.
    - `written` bleibt die Quelle fuer Upsert-Ergebnisse.
    - Kein neues Response-ID-Schema in S4.1.
- Review-Kriterium:
  - Dry-Run und Non-Dry-Run nutzen dieselbe context-angereicherte Single-Event-Basis.

Dedupe und Severity:

- Risiko:
  - Dedupe-Key enthaelt `severity`.
  - Wenn S4.2 eine bisherige Warning fuer denselben `window_from` zu Critical macht, kann ein neues Critical-Event neben einem alten Warning-Event entstehen.
- Entscheidung:
  - Kein automatisches Loeschen oder Umschreiben alter Warning-Events in dieser Roadmap.
  - Hoehere Severity bleibt als separates unacknowledged Event moeglich.
- Begruendung:
  - Dedupe-/Lifecycle-Umbau waere groesser als der Review-Fix.
  - Bestehender SQL-Vertrag verwendet Severity bewusst im Unique-Index.
- Review-Kriterium:
  - S4.2 aendert Klassifikation, aber nicht Dedupe-Key oder historische Event-Lifecycle-Regeln.

BP-Sample-Gate und bestehende Baselines:

- Risiko:
  - BP-Baselines in `trendpilot_state` koennen bereits aus Wochen mit weniger als 2 Samples entstanden sein.
  - S4.3 filtert kuenftige BP-Wochen, migriert aber keine bestehende Baseline.
- Entscheidung:
  - Kein automatischer Baseline-Reset und keine SQL-/State-Migration in dieser Roadmap.
  - S4.3 betrifft die Bewertung der aktuell geladenen BP-Wochen.
  - Bestehende `trendpilot_state`-Baselines bleiben bestehen, bis die normale Normalisierung oder ein spaeterer bewusst gesetzter Reset greift.
- Review-Kriterium:
  - S4.3 darf `trendpilot_state` nicht pauschal loeschen oder neu initialisieren.
  - Doku/QA muessen das Restrisiko als bestehender State-Kontext erfassen.

Lab-Gate:

- Risiko:
  - Entfernt man das globale 6-Wochen-Gate, laufen BP/Body/Lab-Evaluatoren immer an.
  - BP/Body duerfen dadurch keine zu kurzen Baselines schreiben.
- Entscheidung:
  - BP und Body behalten ihre internen 6-Wochen-Gates.
  - Lab darf mit eigenen 2-Wochen-/2-Sample-Gates entscheiden.
  - Der globale `insufficient_data`-Return wird nicht mehr fuer alle Metriken vorgeschaltet.
- Review-Kriterium:
  - Ein Range unter 6 Wochen darf Lab erreichen.
  - BP/Body duerfen bei Range unter 6 Wochen keine Events oder State-Writes erzeugen.

Invalid-Date-Rolling:

- Risiko:
  - `normalizeRange`, `subDaysIso`, `diffDays*` und `weekWindowForDay` bauen auf ISO-Day-Strings.
  - Ein einzelner laxer Helper kann weiter Date-Rolling ermoeglichen.
- Entscheidung:
  - S4.5 braucht einen zentralen strikten ISO-Day-Check und muss ihn fuer Request-Ranges und date-basierte Helper nutzbar machen.
- Review-Kriterium:
  - `2026-02-31` wird abgelehnt.
  - `2026-02-29` wird abgelehnt.
  - `2028-02-29` bleibt gueltig.

ACK-Fortsetzung:

- Risiko:
  - ACK-Reset wuerde neue Popups erzeugen.
  - Reines ACK-Erhalten macht Fortsetzungen leise.
  - Payload-Marker koennen durch Merge-Reihenfolge verloren gehen oder veralten.
- Entscheidung:
  - ACK bleibt erhalten.
  - Bei `existing.ack === true` und wachsendem `window_to` wird ein neutraler Payload-Marker gesetzt.
  - Vorgeschlagener Marker fuer S4:
    - `continued_after_ack: true`
    - `continued_after_ack_from: existing.window_to`
    - `continued_after_ack_to: evt.window_to`
  - Kein neuer Button, kein neuer Popup-Zwang.
- Review-Kriterium:
  - Fortsetzungsmarker darf nur bei echtem Wachstum gesetzt werden.
  - Kein Marker bei unveraendertem oder kuerzerem `window_to`.
  - ACK und `ack_at` bleiben unveraendert.

Combined-Korrelation:

- Risiko:
  - Combined nutzt Single-Events mit IDs.
  - S4.1/S4.6 duerfen den Ablauf `Single upsert -> Combined korrelieren -> Combined upsert` nicht brechen.
- Entscheidung:
  - S4 aendert keine Combined-Regeln.
  - Falls `upsertTrendpilotEvents` intern angepasst wird, muss `withIds` fuer Combined weiterhin `id`, `type`, `severity`, `window_from`, `window_to` und Payload-Felder liefern.
- Review-Kriterium:
  - `bp-weight-correlation-v1` bleibt unveraendert.

Workflow:

- Risiko:
  - `.github/workflows/trendpilot.yml` nutzt `curl -sS` ohne `--fail-with-body`.
- Entscheidung:
  - Kein Workflow-Umbau in dieser Roadmap.
  - Bleibt Watchlist.
- Review-Kriterium:
  - S4 aendert keine GitHub Actions.

#### S3.2 User-Facing Copy Review

Betroffene sichtbare Texte:

- Keine neuen UI-Texte in S4 geplant.
- Bestehende Popup-/Doctor-/Chart-Texte bleiben vorerst unveraendert.
- BP-Critical kann bestehende Critical-Darstellung haeufiger ausloesen, nutzt aber dieselbe Copy.
- ACK-Fortsetzungsmarker wird in S4 nicht als neue UI-Zeile angezeigt.

Copy-Entscheidung:

- Kein User-Facing-Copy-Change in S4.
- S6 muss die Modul-Doku zur BP-Critical-Regel, zum BP-Sample-Gate, zum Lab-Gate und zur ACK-Fortsetzungsmarkierung aktualisieren.
- Ein spaeterer UI-Hinweis fuer `continued_after_ack` waere ein eigener UI-Scope, falls er gebraucht wird.

Copy-Review:

- Normale Fortsetzung eines bestaetigten Trends erzeugt kein neues Pflicht-Popup.
- Critical bleibt als "kritischer Hinweis" formuliert, nicht als Diagnose.
- Keine neue Meldung behauptet medizinische Sicherheit oder Therapiebedarf.

#### S3.3 Tooling und lokal moegliche Checks

Lokal sinnvoll:

- `deno check backend/supabase/functions/midas-trendpilot/index.ts`
- `git diff --check -- backend/supabase/functions/midas-trendpilot/index.ts docs/MIDAS Trendpilot Review Findings Roadmap.md`
- `rg`-/Review-Scans fuer:
  - `allEvents`
  - `singleWithContext`
  - `CRITICAL_DELTA_SYS`
  - `CRITICAL_DELTA_DIA`
  - `CRITICAL_ABS_SYS`
  - `CRITICAL_ABS_DIA`
  - `samples`
  - `LAB_MIN_WEEKS`
  - `MIN_WEEKS_REQUIRED`
  - `continued_after_ack`
  - `window_to`
  - `ISO_DAY_RE`

Nicht automatisch lokal:

- Echter Edge Runtime-Smoke mit Schreibwirkung.
- Supabase Deploy.
- GitHub Workflow-Smoke.

#### S3.4 Runtime-Smokes

Dry-Run-Smokes, wenn Runtime-Zugriff bewusst freigegeben wird:

- Dry-Run mit Warning/Critical:
  - erwartet `payload.context` in Single-Events.
  - keine Writes.
- BP-Critical-Beispiele:
  - Baseline `108/72`, Wochenmittel `126/74`:
    - bleibt Warning, weil `avgSys < 130`.
  - Baseline `112/74`, Wochenmittel `131/76`:
    - Critical, weil `avgSys >= 130` und `deltaSys >= 15`.
  - Baseline `126/82`, Wochenmittel `134/92`:
    - Critical wegen `avgDia >= 90`.
- BP-Sample-Gate:
  - Wochen mit nur 1 validem BP-Sample zaehlen nicht fuer BP-Streak/Baseline.
  - Zwei Wochen mit je nur 1 Sample erzeugen keinen BP-Trend.
- Lab-Range:
  - Range unter 6 Wochen mit 2 Lab-Samples erreicht Lab-Evaluator.
  - BP/Body bleiben ohne 6 Wochen leer.
- Date-Validation:
  - `2026-02-31` -> Error.
  - `2026-02-29` -> Error.
  - `2028-02-29` -> gueltig.

Schreibende Smokes nur mit Freigabe:

- ACK-Fortsetzung:
  - vorhandenes acknowledged Event mit `window_to = A`.
  - neuer Run erweitert auf `window_to = B`.
  - ACK bleibt true.
  - `ack_at` bleibt unveraendert.
  - Payload enthaelt Fortsetzungsmarker.
- Non-Dry-Run-Response:
  - Single-Events enthalten Context.
  - `written` enthaelt Upsert-Ergebnisse.

#### S3.5 Finalisierte S4-Substeps

S4.1 Response-Kontext:

- Enger Fix:
  - `allEvents` im Non-Dry-Run nutzt `singleWithContext`.
- Keine Dedupe-/ID-/Schema-Aenderung.

S4.2 BP-Critical:

- Absolute Schwellen bleiben.
- Delta-Critical:
  - systolisch mit Mindestniveau.
  - diastolisch mit Mindestniveau.
- Warning bleibt.
- Streak bleibt.

S4.3 BP-Sample-Gate:

- Neue Konstante oder lokaler klarer Wert fuer BP-Minimum:
  - `2` valide Samples pro Woche.
- Nur BP-Wochen filtern.
- Keine Body-/Lab-Aenderung.
- Keine State-Migration.

S4.4 Lab-Gate:

- Globales Handler-Gate entfernen oder so umformen, dass es Lab nicht blockiert.
- BP/Body verlassen sich auf interne Gates.

S4.5 Date-Validation:

- Strikte ISO-Day-Validation.
- Request-Range und Date-Helfer absichern.
- Default-Range und Vienna-Zeitlogik unveraendert lassen.

S4.6 ACK-Fortsetzung:

- ACK-Erhalt bleibt.
- Fortsetzungsmarker nur bei `existing.ack` und wachsendem `window_to`.
- Keine UI-/Popup-Aenderung.

S4.7 Gesamt-Review:

- Deno.
- Diff.
- Scans.
- Contract Review gegen S2/S3.

#### S3.6 Contract Review

Review-Frage:

- Sind die S3-Risiken und S4-Substeps konkret genug, um Code umzusetzen, ohne Dedupe, ACK, State oder UI-Vertrag versehentlich umzubauen?

Entscheidung:

- Ja. S3 grenzt die relevanten Bruchrisiken ab und konkretisiert die S4-Substeps.

Contract-Findings:

- TRP-S3-CR-F1: BP-Sample-Gate koennte als implizite Baseline-Migration missverstanden werden.
- TRP-S3-CR-F2: Severity-Aenderung kann historische Warning-Events neben neuen Critical-Events stehen lassen.
- TRP-S3-CR-F3: ACK-Fortsetzungsmarker braucht klare Merge- und Wachstumsbedingung.
- TRP-S3-CR-F4: Lab-Gate-Fix darf BP/Body nicht unter 6 Wochen aktivieren.
- TRP-S3-CR-F5: Date-Validation darf Leap-Year-faehige echte Tage nicht blockieren.
- TRP-S3-CR-F6: UI-Copy darf nicht still als Teil von S4 wachsen.

Korrekturen aus dem Contract Review:

- TRP-S3-CR-F1 korrigiert:
  - S3 dokumentiert keine State-Migration und kein pauschales Baseline-Loeschen.
- TRP-S3-CR-F2 korrigiert:
  - S3 akzeptiert Severity als Teil des bestehenden Dedupe-Keys und verbietet Lifecycle-Umbau.
- TRP-S3-CR-F3 korrigiert:
  - Fortsetzungsmarker ist nur bei `existing.ack === true` und wachsendem `window_to` erlaubt.
- TRP-S3-CR-F4 korrigiert:
  - BP/Body behalten interne 6-Wochen-Gates.
- TRP-S3-CR-F5 korrigiert:
  - Runtime-Smokes enthalten `2028-02-29` als gueltiges Leap-Year-Beispiel.
- TRP-S3-CR-F6 korrigiert:
  - S4 bleibt UI-copy-frei; Doku-Sync kommt in S6.

Doku-Sync-Entscheidung:

- Noch keine Aenderung an `docs/modules/Trendpilot Module Overview.md` oder `docs/QA_CHECKS.md`.
- S6 muss Doku/QA auf den finalen Codevertrag synchronisieren.

S3 Exit:

- Erfuellt.
- S4 hat klare Substeps und Review-Kriterien.

S3 Schritt-Abnahme und Commit-Empfehlung:

- Abnahme: S3 abgeschlossen.
- Commit: sinnvoll nach S3 moeglich, aber praktischer nach S4/S5 oder Gesamtabschluss.

## S4 - Umsetzung

Ziel:

- Review-Findings sequenziell umsetzen oder bewusst als dokumentierten No-Change festhalten.

Substeps:

- S4.1 Response-Kontext-Bug fixen:
  - Non-Dry-Run nutzt context-angereicherte Single-Events in der Response.
- S4.2 BP-Critical-Delta gemaess S2/S3 umsetzen:
  - Absolute Schwellen bleiben.
  - Delta-Critical wird OR mit Mindestniveau.
- S4.3 Wochenmittel-Reliabilitaet gemaess S2/S3 metrikspezifisch umsetzen:
  - BP-Wochen erst ab 2 validen Samples werten.
  - Body/Lab bleiben hier No-Change.
- S4.4 Lab-Gate evaluator-spezifisch machen:
  - Lab darf nicht mehr vom globalen 6-Wochen-Handler-Gate blockiert werden.
- S4.5 Range-Date-Validation auf echte Kalendertage haerten.
- S4.6 ACK-Fortsetzungsverhalten gemaess S2/S3 umsetzen:
  - ACK bleibt erhalten.
  - Fortsetzung bei wachsendem `window_to` im Payload markieren.
- S4.7 Gesamt-Code-Review und Contract Review.

Jeder S4-Substep dokumentiert:

- Umsetzung.
- betroffene Dateien.
- lokaler Check.
- Code Review.
- Contract Review.
- Findings.
- Korrekturen.
- Restrisiko.

Exit-Kriterium:

- Alle priorisierten Findings sind umgesetzt oder bewusst als No-Change mit Doku-/QA-Vertrag abgegrenzt.

### S4.1 Ergebnisprotokoll 01.06.2026

Umsetzung:

- Non-Dry-Run-Response baut `events` nun aus `singleWithContext` plus `combined`.
- Die Persistenz war bereits auf `singleWithContext`; Response und Upsert-Basis sind damit fuer Single-Events wieder konsistent.

Betroffene Dateien:

- `backend/supabase/functions/midas-trendpilot/index.ts`
- `docs/MIDAS Trendpilot Review Findings Roadmap.md`

Lokale Checks:

- `deno check backend/supabase/functions/midas-trendpilot/index.ts`
- `git diff --check -- backend/supabase/functions/midas-trendpilot/index.ts docs/MIDAS Trendpilot Review Findings Roadmap.md`
- lokaler ACK-Payload-Smoke:
  - acknowledged + wachsendes `window_to` setzt Marker.
  - acknowledged + unveraendertes `window_to` entfernt stale Marker.
  - unacknowledged + wachsendes `window_to` setzt keinen Marker.
- lokaler Datums-Smoke:
  - `2026-02-31` -> invalid.
  - `2026-02-29` -> invalid.
  - `2028-02-29` -> valid.

Code Review:

- Geprueft:
  - Dry-Run war bereits korrekt und bleibt unveraendert.
  - Non-Dry-Run persistiert weiterhin `singleWithContext`.
  - Combined-Korrelation bleibt auf `singleUpsert.withIds` und damit auf persistierten Single-Events.
  - `written` bleibt unveraendert die Upsert-Ergebnisquelle.
- Findings:
  - Keine Code-Findings nach S4.1.

Contract Review:

- Review-Frage:
  - Erfuellt S4.1 den S2/S3-Vertrag, ohne Dedupe, ID-Schema, Combined-Flow oder DB-Write-Verhalten zu veraendern?
- Entscheidung:
  - Ja. S4.1 ist auf Response-Kontext-Konsistenz begrenzt.
  - Es gibt keine Aenderung am Unique-Key, an ACK, an State oder an Combined-Events.
- Findings:
  - Keine offenen Contract-Findings.

Korrekturen:

- Keine weiteren Korrekturen noetig.

Restrisiko:

- Die Response bleibt ein generierter Event-Snapshot, nicht zwingend der vollstaendig gemergte DB-Row nach Upsert.
- Dieses Restrisiko ist in S3 bewusst akzeptiert; `written` bleibt die Upsert-Ergebnisquelle.

Abnahme:

- S4.1 abgeschlossen.

### S4.2 Ergebnisprotokoll 01.06.2026

Umsetzung:

- BP-Delta-Critical wurde von gemeinsamem systolisch-und-diastolischem Delta auf OR mit Mindestniveau umgestellt.
- Neue Konstanten:
  - `CRITICAL_DELTA_MIN_SYS = 130`
  - `CRITICAL_DELTA_MIN_DIA = 85`
- Critical greift nun bei:
  - unveraendert absolut `avgSys >= 140` oder `avgDia >= 90`.
  - systolisch `avgSys >= 130` und `deltaSys >= 15`.
  - diastolisch `avgDia >= 85` und `deltaDia >= 10`.
- Warning bleibt unveraendert:
  - `deltaSys >= 8` oder `deltaDia >= 5`.
- Streak-, Dedupe-, State- und Combined-Logik bleiben unveraendert.

Betroffene Dateien:

- `backend/supabase/functions/midas-trendpilot/index.ts`
- `docs/MIDAS Trendpilot Review Findings Roadmap.md`

Lokale Checks:

- `deno check backend/supabase/functions/midas-trendpilot/index.ts`
- `git diff --check -- backend/supabase/functions/midas-trendpilot/index.ts docs/MIDAS Trendpilot Review Findings Roadmap.md`

Code Review:

- Geprueft:
  - Absolute BP-Critical-Schwellen bleiben unveraendert.
  - Delta-Critical nutzt OR, aber nur mit Mindestniveau.
  - Warning-Fallback bleibt hinter Critical und wurde nicht geaendert.
  - `streakSeverity`, Event-Payload, Dedupe-Key und Combined-Korrelation bleiben unveraendert.
- Findings:
  - Keine Code-Findings nach S4.2.

Contract Review:

- Review-Frage:
  - Erfuellt S4.2 den S2/S3-Vertrag fuer BP-Critical, ohne Dedupe, Streak, State oder Combined versehentlich umzubauen?
- Entscheidung:
  - Ja. S4.2 setzt nur die Klassifikationsentscheidung in `evaluateBpTrends` um.
  - Der bestehende Unique-Key mit Severity bleibt unveraendert; hoeher klassifizierte neue Events koennen wie in S3 dokumentiert neben alten Warning-Events entstehen.
- Findings:
  - Keine offenen Contract-Findings.

Korrekturen:

- Keine weiteren Korrekturen noetig.

Restrisiko:

- Bestehende persistierte Warning-Events werden nicht migriert oder geloescht.
- Dieses Restrisiko ist in S3 bewusst akzeptiert, weil ein Dedupe-/Lifecycle-Umbau nicht Teil dieser Roadmap ist.

Abnahme:

- S4.2 abgeschlossen.

### S4.3 Ergebnisprotokoll 01.06.2026

Umsetzung:

- BP-Wochen werden nun nur noch gewertet, wenn sie mindestens 2 valide BP-Samples enthalten.
- Neue BP-spezifische Konstante:
  - `BP_MIN_SAMPLES_PER_WEEK = 2`
- Der Filter greift direkt auf den aus `weekMap` gebildeten BP-Wochen vor:
  - `MIN_WEEKS_REQUIRED`-Gate.
  - Baseline-Aufbau.
  - Status-/Streak-Bewertung.
  - Normalisierung.
- Body- und Lab-Wochenmittel bleiben unveraendert.
- Bestehende `trendpilot_state`-Baselines werden nicht migriert, geloescht oder neu initialisiert.

Betroffene Dateien:

- `backend/supabase/functions/midas-trendpilot/index.ts`
- `docs/MIDAS Trendpilot Review Findings Roadmap.md`

Lokale Checks:

- `deno check backend/supabase/functions/midas-trendpilot/index.ts`
- `git diff --check -- backend/supabase/functions/midas-trendpilot/index.ts docs/MIDAS Trendpilot Review Findings Roadmap.md`

Code Review:

- Geprueft:
  - Filter ist nur in `evaluateBpTrends` gesetzt.
  - Body- und Lab-Evaluatoren wurden nicht geaendert.
  - BP-Wochen mit einem Sample koennen keine Baseline, keinen Status, keinen Streak und keine Normalisierung mehr treiben.
  - Kein Zugriff auf `trendpilot_state` wurde geloescht oder veraendert.
- Findings:
  - Keine Code-Findings nach S4.3.

Contract Review:

- Review-Frage:
  - Erfuellt S4.3 den S2/S3-Vertrag, BP-Wochen ab 2 validen Samples zu werten, ohne Body/Lab oder bestehenden State umzubauen?
- Entscheidung:
  - Ja. Der Filter ist BP-spezifisch und vor allen relevanten BP-Bewertungsschritten platziert.
  - Body/Lab bleiben No-Change.
  - Bestehende BP-Baselines bleiben als bewusst akzeptierter State-Kontext bestehen.
- Findings:
  - Keine offenen Contract-Findings.

Korrekturen:

- Keine weiteren Korrekturen noetig.

Restrisiko:

- Bereits gespeicherte BP-Baselines koennen aus historisch weniger robusten Wochen entstanden sein.
- Dieses Restrisiko ist in S3 akzeptiert; ein Baseline-Reset oder eine SQL-/State-Migration gehoert nicht in diese Roadmap.

Abnahme:

- S4.3 abgeschlossen.

### S4.4 Ergebnisprotokoll 01.06.2026

Umsetzung:

- Der globale Handler-Return fuer Ranges unter 6 Wochen wurde entfernt.
- Dadurch erreichen kurze manuelle/Dry-Run-Ranges nun alle Evaluatoren.
- BP und Body bleiben fachlich geschuetzt durch ihre internen `MIN_WEEKS_REQUIRED`-Gates.
- Lab entscheidet weiterhin mit den eigenen Gates:
  - `LAB_MIN_WEEKS = 2`.
  - `LAB_MIN_SAMPLES = 2`.
  - `LAB_BASELINE_WEEKS = 3`.
- Der nun ungenutzte Helper `hasMinWeeks` wurde entfernt.

Betroffene Dateien:

- `backend/supabase/functions/midas-trendpilot/index.ts`
- `docs/MIDAS Trendpilot Review Findings Roadmap.md`

Lokale Checks:

- `deno check backend/supabase/functions/midas-trendpilot/index.ts`
- `git diff --check -- backend/supabase/functions/midas-trendpilot/index.ts docs/MIDAS Trendpilot Review Findings Roadmap.md`

Code Review:

- Geprueft:
  - `evaluateBpTrends` behält `weeks.length < MIN_WEEKS_REQUIRED`.
  - `evaluateBodyTrends` behält `weeks.length < MIN_WEEKS_REQUIRED`.
  - `evaluateLabTrends` nutzt weiterhin `LAB_MIN_WEEKS` und `LAB_MIN_SAMPLES`.
  - Der Handler blockiert Lab nicht mehr pauschal vor dem Evaluator.
  - `insufficient_data`-Response wurde nur fuer das globale Gate entfernt; normale leere `events`/`written` bleiben moeglich.
- Findings:
  - Keine Code-Findings nach S4.4.

Contract Review:

- Review-Frage:
  - Erfuellt S4.4 den S2/S3-Vertrag, Lab nicht mehr global mit 6 Wochen zu blockieren, ohne BP/Body unter 6 Wochen zu aktivieren?
- Entscheidung:
  - Ja. Das globale Gate ist entfernt, und BP/Body behalten ihre internen 6-Wochen-Gates.
  - Lab kann nun mit eigenen 2-Wochen-/2-Sample-Gates entscheiden.
- Findings:
  - Keine offenen Contract-Findings.

Korrekturen:

- Keine weiteren Korrekturen noetig.

Restrisiko:

- Kurze Ranges liefern nun keine `note: "insufficient_data"` mehr aus dem Handler.
- Das ist bewusst akzeptiert, weil die Metrik-spezifischen Evaluatoren leere Events liefern, wenn ihre Gates nicht erfuellt sind.

Abnahme:

- S4.4 abgeschlossen.

### S4.5 Ergebnisprotokoll 01.06.2026

Umsetzung:

- `parseIsoDay` nutzt nun `ISO_DAY_RE` plus UTC-Roundtrip gegen den Originalstring.
- Ungueltige Kalendertage wie `2026-02-31` und `2026-02-29` werden abgelehnt.
- Gueltige Leap-Year-Tage wie `2028-02-29` bleiben erlaubt.
- `normalizeRange` validiert `range.from` und `range.to` direkt mit `parseIsoDay`.
- Das vorherige `slice(0, 10)` wurde entfernt, damit Request-Ranges exakt `YYYY-MM-DD` sein muessen.
- `subDaysIso`, `diffDaysInclusive` und `diffDays` nutzen nun `dateFromIsoDayUtc` und werfen bei ungueltigen ISO-Tagen statt JS-Date-Rolling zu erlauben.
- `utcDateFromIsoParts` neutralisiert das JS-`Date.UTC`-Spezialverhalten fuer Jahre 0-99.
- Default-Range und Vienna-Zeitlogik bleiben unveraendert.

Betroffene Dateien:

- `backend/supabase/functions/midas-trendpilot/index.ts`
- `docs/MIDAS Trendpilot Review Findings Roadmap.md`

Lokale Checks:

- `deno check backend/supabase/functions/midas-trendpilot/index.ts`
- `git diff --check -- backend/supabase/functions/midas-trendpilot/index.ts docs/MIDAS Trendpilot Review Findings Roadmap.md`

Code Review:

- Geprueft:
  - Regex und Roundtrip pruefen dieselbe ISO-Day-Eingabe.
  - `2026-02-31` kann nicht mehr in Maerz rollen.
  - `2026-02-29` wird als Nicht-Schaltjahr abgelehnt.
  - `2028-02-29` bleibt gueltig.
  - `Date.UTC`-Spezialverhalten fuer Jahre 0-99 ist durch `utcDateFromIsoParts` neutralisiert.
  - Default-Range nutzt weiter `viennaTodayIso()` und `DEFAULT_RANGE_DAYS`.
  - Date-Helper werfen explizit bei ungueltigen Tagen.
- Findings:
  - TRP-S4.5-CR-F1: `Date.UTC` behandelt Jahre 0-99 als 1900-1999 und konnte den Roundtrip fuer formal gueltige vierstellige Jahre verzerren.

Contract Review:

- Review-Frage:
  - Erfuellt S4.5 den S2/S3-Vertrag fuer echte Kalendertage, ohne Default-Range, Vienna-Zeitlogik oder ISO-Day-Vergleiche umzubauen?
- Entscheidung:
  - Ja. Die Aenderung ist auf strikte ISO-Day-Validierung und abgesicherte Date-Helper begrenzt.
  - Default-Range und `from > to`-Vergleich bleiben semantisch unveraendert.
- Findings:
  - Keine offenen Contract-Findings.

Korrekturen:

- TRP-S4.5-CR-F1 korrigiert:
  - `utcDateFromIsoParts` setzt nach `Date.UTC` explizit `setUTCFullYear(year)`.
  - `parseIsoDay` und `dateFromIsoDayUtc` nutzen denselben Helper.

Restrisiko:

- Request-Werte mit Zeitanteil wie `YYYY-MM-DDT...` werden nicht mehr per `slice(0, 10)` akzeptiert.
- Das ist bewusst akzeptiert, weil der S2-Vertrag exakt `YYYY-MM-DD` verlangt.

Abnahme:

- S4.5 abgeschlossen.

### S4.6 Ergebnisprotokoll 01.06.2026

Umsetzung:

- ACK-Erhalt bleibt unveraendert:
  - `row.ack = true`
  - `row.ack_at = existing.ack_at || null`
- Wenn ein bestehendes acknowledged Event durch ein spaeteres `evt.window_to` erweitert wird, setzt der Payload nun:
  - `continued_after_ack: true`
  - `continued_after_ack_from: existing.window_to`
  - `continued_after_ack_to: evt.window_to`
- Fortsetzungsmarker werden vor dem Setzen aus dem gemergten Payload entfernt.
- Dadurch bleibt kein stale Marker stehen, wenn ein spaeterer Upsert kein wachsendes `window_to` hat.
- Kein ACK-Reset, keine UI-/Popup-Aenderung, keine Dedupe-/Severity-Aenderung.

Betroffene Dateien:

- `backend/supabase/functions/midas-trendpilot/index.ts`
- `docs/MIDAS Trendpilot Review Findings Roadmap.md`

Lokale Checks:

- `deno check backend/supabase/functions/midas-trendpilot/index.ts`
- `git diff --check -- backend/supabase/functions/midas-trendpilot/index.ts docs/MIDAS Trendpilot Review Findings Roadmap.md`

Code Review:

- Geprueft:
  - Marker wird nur bei `existing.ack === true` gesetzt.
  - Marker wird nur gesetzt, wenn `evt.window_to > existing.window_to`.
  - Kein Marker bei unveraendertem oder kuerzerem `window_to`.
  - `ack` und `ack_at` bleiben erhalten.
  - `window_to` bleibt weiterhin der spaetere Wert aus bestehendem Event oder neuem Event.
  - `withIds` und Combined-Korrelation bleiben unveraendert.
- Findings:
  - TRP-S4.6-CR-F1: Ein bestehender alter Marker koennte ueber `mergePayload(existing?.payload, evt.payload)` bei unveraendertem `window_to` stale bleiben.
  - TRP-S4.6-CR-F2: `withIds` wurde nach dem Upsert noch aus `evt` aufgebaut und haette intern nicht den bereinigten Payload und den finalen `windowTo` genutzt.

Contract Review:

- Review-Frage:
  - Erfuellt S4.6 den S2/S3-Vertrag, ACK zu erhalten und Fortsetzung nur bei echtem `window_to`-Wachstum neutral im Payload zu markieren?
- Entscheidung:
  - Ja. Die Markierung ist an `existing.ack === true` und wachsendes `window_to` gebunden.
  - ACK, `ack_at`, Dedupe-Key, Severity und UI-Verhalten bleiben unveraendert.
- Findings:
  - Keine offenen Contract-Findings nach Korrektur von TRP-S4.6-CR-F1 und TRP-S4.6-CR-F2.

Korrekturen:

- TRP-S4.6-CR-F1 korrigiert:
  - `withoutAckContinuationPayload` entfernt `continued_after_ack`, `continued_after_ack_from` und `continued_after_ack_to` vor dem optionalen Neu-Setzen.
- TRP-S4.6-CR-F2 korrigiert:
  - `withIds` wird nach dem Upsert mit finalem `window_to: windowTo` und bereinigtem `payload` aufgebaut.
  - Combined-Korrelation arbeitet dadurch mit demselben Single-Event-Stand, der fuer den Upsert verwendet wurde.

Restrisiko:

- Die UI zeigt `continued_after_ack` in S4 nicht separat an.
- Das ist bewusst akzeptiert; S6 dokumentiert den Payload-Vertrag, ein spaeterer UI-Hinweis waere eigener Scope.

Abnahme:

- S4.6 abgeschlossen.

### S4.7 Ergebnisprotokoll 01.06.2026

Durchgefuehrt:

- Gesamt-Diff von `backend/supabase/functions/midas-trendpilot/index.ts` reviewed.
- Deno-Typecheck ausgefuehrt.
- Diff-/Whitespace-Checks ausgefuehrt.
- Gezielte Contract-Scans ausgefuehrt fuer:
  - Response-Kontext.
  - BP-Critical.
  - BP-Sample-Gate.
  - Lab-Gate.
  - Date-Validation.
  - ACK-Fortsetzung.
  - Combined-Korrelation.
  - Dedupe-/State-Grenzen.
- Lokale Date- und ACK-Smokes wiederholt.

Lokale Checks:

- `deno check backend/supabase/functions/midas-trendpilot/index.ts`
- `git diff --check -- backend/supabase/functions/midas-trendpilot/index.ts docs/MIDAS Trendpilot Review Findings Roadmap.md`
- Roadmap trailing-whitespace Check.
- Datums-Smoke:
  - `2026-02-31` -> invalid.
  - `2026-02-29` -> invalid.
  - `2028-02-29` -> valid.
  - `0001-01-01` -> valid.
- ACK-Smoke:
  - acknowledged + wachsendes `window_to` setzt Marker.
  - acknowledged + unveraendertes `window_to` entfernt stale Marker.
  - unacknowledged + wachsendes `window_to` setzt keinen Marker.

Code Review:

- S4.1:
  - Non-Dry-Run-Response nutzt `singleWithContext`.
  - Dry-Run bleibt unveraendert konsistent.
- S4.2:
  - Absolute BP-Critical-Schwellen bleiben `140/90`.
  - Delta-Critical ist OR mit Mindestniveau.
  - Warning-Logik bleibt unveraendert.
- S4.3:
  - BP-Wochen werden erst ab 2 validen Samples gewertet.
  - Body/Lab-Wochenmittel bleiben No-Change.
  - Kein State-Reset und keine State-Migration.
- S4.4:
  - Globales 6-Wochen-Handler-Gate ist entfernt.
  - BP und Body behalten interne `MIN_WEEKS_REQUIRED`-Gates.
  - Lab nutzt eigene `LAB_MIN_WEEKS`-/`LAB_MIN_SAMPLES`-Gates.
- S4.5:
  - Request-Ranges muessen echte `YYYY-MM-DD`-Kalendertage sein.
  - Date-Helper nutzen strikte ISO-Day-Validierung statt JS-Date-Rolling.
  - Default-Range und Vienna-Zeitlogik bleiben unveraendert.
- S4.6:
  - ACK und `ack_at` bleiben erhalten.
  - Fortsetzungsmarker wird nur bei `existing.ack === true` und wachsendem `window_to` gesetzt.
  - `withIds` nutzt finalen `window_to` und bereinigten Payload fuer Combined.
- Findings:
  - TRP-S4.7-CR-F1: `toISODateUTC` gab Jahre unter 1000 nicht vierstellig aus und war damit nicht vollstaendig konsistent mit dem `YYYY-MM-DD`-Contract.

Contract Review:

- Review-Frage:
  - Erfuellt S4 den S2/S3-Vertrag vollstaendig, ohne Trendpilot in Richtung Echtzeit-Alert, Therapiehinweis, UI-Umbau, SQL-Migration oder Workflow-Umbau zu erweitern?
- Entscheidung:
  - Ja. S4 bleibt auf die geplanten Review-Findings in `index.ts` begrenzt.
  - Keine UI- oder Copy-Aenderung in S4.
  - Keine SQL-/State-Migration.
  - Kein Dedupe-Key-Umbau.
  - Kein GitHub-Workflow-Umbau.
  - Kein Deploy in S4.
- Findings:
  - Keine offenen Contract-Findings nach Korrektur von TRP-S4.7-CR-F1.

Korrekturen:

- TRP-S4.7-CR-F1 korrigiert:
  - `toISODateUTC` nutzt nun `String(year).padStart(4, "0")`.
  - Der lokale Datums-Smoke bestaetigt `0001-01-01` als gueltig.

Restrisiken:

- Bestehende persistierte Events/States werden nicht migriert.
- Bestehende Warning-Events koennen neben neuen Critical-Events bestehen bleiben, weil Severity Teil des bestehenden Dedupe-Keys ist.
- `continued_after_ack` wird in S4 nicht in der UI dargestellt.
- S6 muss Trendpilot-Doku und QA auf den finalen Codevertrag synchronisieren.

Doku-Sync-Entscheidung:

- Noch keine Aenderung an `docs/modules/Trendpilot Module Overview.md` oder `docs/QA_CHECKS.md`.
- Doku-/QA-Sync folgt wie geplant in S6.

Abnahme:

- S4 abgeschlossen.

## S5 - Tests, Code Review und Contract Review

Ziel:

- Lokal pruefen, dass Trendpilot syntaktisch und vertraglich sauber ist.

Lokal ausfuehrbare Checks:

- S5.1 `deno check backend/supabase/functions/midas-trendpilot/index.ts`
- S5.2 `git diff --check`
- S5.3 gezielte `rg`-Scans:
  - Response-Events verwenden den erwarteten Kontextstand.
  - BP-Critical-Regel entspricht S2.
  - Lab-Gate entspricht S2.
  - ACK-Verhalten entspricht S2.
  - Date-Validation ist strikt.
- S5.4 Code Review:
  - Dry-Run.
  - Non-Dry-Run.
  - Upsert/Dedupe.
  - ACK.
  - BP.
  - Body.
  - Lab.
  - Combined.
- S5.5 Contract Review gegen Trendpilot Overview, diese Roadmap und MIDAS-Guardrails.

Nicht automatisch ausfuehrbar ohne Freigabe:

- echter Edge Runtime-Smoke mit Schreibwirkung.
- Supabase Deploy.
- GitHub Workflow-Smoke.

Definierte Runtime-Smokes fuer spaeter:

- Dry-Run liefert warning/critical mit `payload.context`.
- Non-Dry-Run liefert dieselben Single-Event-Contextdaten wie persistiert.
- BP-Beispiel fuer isolierten systolischen Delta folgt S2-Entscheidung.
- BP-Wochen mit zu wenigen Samples folgen S2/S3-Entscheidung.
- Lab-Range unter 6 Wochen wird nicht faelschlich global blockiert, falls S2 das fordert.
- Invalid range wie `2026-02-31` wird abgelehnt.
- Bestehendes acknowledged Event verhaelt sich bei `window_to`-Fortsetzung gemaess S2.

Exit-Kriterium:

- Keine offenen P0/P1-Findings nach lokalem Review.

### S5 Ergebnisprotokoll 01.06.2026

Durchgefuehrt:

- S5.1 Deno-Typecheck ausgefuehrt.
- S5.2 Diff-/Whitespace-Check ausgefuehrt.
- S5.3 gezielte `rg`-/Scan-Pruefungen ausgefuehrt.
- S5.4 Code Review durchgefuehrt.
- S5.5 Contract Review gegen Trendpilot Overview, diese Roadmap und MIDAS-Guardrails durchgefuehrt.

Ausgefuehrte Checks:

- `deno check backend/supabase/functions/midas-trendpilot/index.ts`
  - Ergebnis: exit 0.
- `git diff --check -- backend/supabase/functions/midas-trendpilot/index.ts docs/MIDAS Trendpilot Review Findings Roadmap.md`
  - Ergebnis: exit 0.
- Roadmap trailing-whitespace Check:
  - Ergebnis: keine trailing whitespace lines.
- S5.3 Scans:
  - Response:
    - `singleWithContext` ist Dry-Run- und Non-Dry-Run-Basis fuer `allEvents`.
  - BP-Critical:
    - `CRITICAL_DELTA_MIN_SYS = 130`.
    - `CRITICAL_DELTA_MIN_DIA = 85`.
    - `criticalSysDelta` und `criticalDiaDelta` werden OR-verknuepft.
  - BP-Sample-Gate:
    - `BP_MIN_SAMPLES_PER_WEEK = 2`.
    - BP-Wochen werden mit `.filter((w) => w.samples >= BP_MIN_SAMPLES_PER_WEEK)` gefiltert.
  - Lab-Gate:
    - kein globales `hasMinWeeks`-/`insufficient_data`-Gate mehr im Handler.
    - BP/Body behalten `MIN_WEEKS_REQUIRED`.
    - Lab nutzt `LAB_MIN_WEEKS` und `LAB_MIN_SAMPLES`.
  - Date-Validation:
    - `parseIsoDay`, `dateFromIsoDayUtc`, `utcDateFromIsoParts` und Date-Helper sind aktiv.
    - kein `slice(0, 10)` mehr in `normalizeRange`.
  - ACK:
    - `withoutAckContinuationPayload`.
    - `continued_after_ack`.
    - `row.ack`/`row.ack_at` bleiben erhalten.
    - `withIds.push` nutzt finalen `window_to` und Payload.
  - Dedupe/State/Combined:
    - `onConflict: "user_id,type,window_from,severity"` bleibt unveraendert.
    - `bp-weight-correlation-v1` bleibt unveraendert.
    - keine `delete`-/Migration-Logik in `midas-trendpilot`.

Lokale Smokes:

- Date-Smoke:
  - `2026-02-31` -> invalid.
  - `2026-02-29` -> invalid.
  - `2028-02-29` -> valid.
  - `0001-01-01` -> valid.
- ACK-Smoke:
  - acknowledged + wachsendes `window_to` setzt Marker.
  - acknowledged + unveraendertes `window_to` entfernt stale Marker.
  - unacknowledged + wachsendes `window_to` setzt keinen Marker.

Code Review:

- Dry-Run:
  - schreibt nicht.
  - nutzt `singleWithContext`.
  - Combined bleibt synthetisch ueber IDs ableitbar.
- Non-Dry-Run:
  - schreibt Single-Events zuerst.
  - korreliert Combined aus `singleUpsert.withIds`.
  - Response nutzt `singleWithContext`.
- Upsert/Dedupe:
  - Unique-/Conflict-Key bleibt `user_id,type,window_from,severity`.
  - Keine historische Migration oder Loeschlogik.
- ACK:
  - Erhalt von `ack` und `ack_at` bleibt.
  - Fortsetzung wird nur bei echtem Wachstum markiert.
- BP:
  - Delta-Critical entspricht S2.
  - BP-Wochen unter 2 validen Samples werden nicht gewertet.
- Body:
  - keine S4-Aenderung ausser Wegfall des globalen Handler-Blocks.
  - internes 6-Wochen-Gate bleibt.
- Lab:
  - erreicht kurze Ranges, wenn der Handler nicht mehr blockiert.
  - eigene 2-Wochen-/2-Sample-Gates bleiben.
- Combined:
  - `bp-weight-correlation-v1` bleibt.
  - arbeitet mit finalem Single-Event-Stand aus `withIds`.

Contract Review:

- Gegen Roadmap:
  - S4.1 bis S4.6 sind umgesetzt.
  - S4.7 Gesamt-Review ist abgeschlossen.
  - Keine S4-Ausweitung auf UI, SQL, Deploy oder GitHub Actions.
- Gegen Trendpilot Overview:
  - Doku beschreibt noch den alten BP-Critical-Text `+15/+10`, ohne OR mit Mindestniveau.
  - Doku nennt ACK-Erhalt, aber noch nicht `continued_after_ack`.
  - Doku nennt Lab-Samples, aber muss das Entfernen des globalen Handler-Gates klarer abbilden.
  - Doku nennt noch keine strikte Range-Date-Validation.
  - Bewertung: erwarteter Doku-Drift nach Code-S4; S6 ist dafuer vorgesehen.
- Gegen MIDAS-Guardrails:
  - Kein Diagnose-/Therapiepfad.
  - Kein Echtzeit-Spike-Alert.
  - Kein Push-/Reminder-Laerm.
  - Kein Voice-/Assistant-Fast-Path.
  - Single-user-/Service-role-Vertrag bleibt unveraendert.

Findings:

- Keine offenen P0/P1-Code-Findings.
- TRP-S5-CR-F1: Trendpilot Overview und QA sind nach S4 erwartungsgemaess nicht mehr vollstaendig synchron.

Korrekturen:

- Keine Code-Korrektur in S5 erforderlich.
- TRP-S5-CR-F1 wird nicht in S5 korrigiert, weil S6 explizit fuer Doku-/QA-Sync vorgesehen ist.

Nicht ausgefuehrt im lokalen S5-Block:

- Kein echter Edge Runtime-Smoke mit Schreibwirkung.
- Kein GitHub Workflow-Smoke.

Remote-/External-Check-Nachtrag:

- `supabase functions list --project-ref ...` ausgefuehrt:
  - `midas-trendpilot` ist remote `ACTIVE`.
  - Remote-Version zum Checkzeitpunkt: Version 18, `UPDATED_AT` 2026-04-30 19:36:52 UTC.
  - Interpretation: Die S4-Codeaenderungen sind noch nicht deployed.
- Remote-Edge-Dry-Run mit gueltiger Range ausgefuehrt:
  - `ok: true`.
  - `written: 0`.
  - Keine Schreibwirkung.
  - Test-Range lieferte keine Events.
- Remote-Invalid-Date-Dry-Run mit `2026-02-31` ausgefuehrt:
  - Remote antwortete mit DB-Date-Fehler `date/time field value out of range`.
  - Interpretation: Das bestaetigt, dass remote noch der alte Stand aktiv ist; die neue lokale S4.5-Validation greift erst nach Deploy.
- GitHub CLI Check:
  - `gh` ist installiert.
  - `gh auth` war zum ersten Checkzeitpunkt noch nicht eingerichtet; Workflow-Smoke wurde danach nachgeholt.
- Workflow-Datei lokal geprueft:
  - `.github/workflows/trendpilot.yml` ruft produktiv per Service-Role ohne `dry_run` auf.
  - `workflow_dispatch` ist daher kein schreibfreier Smoke.

Deploy-Nachtrag 01.06.2026:

- Supabase Deploy nach ausdruecklicher User-Freigabe ausgefuehrt:
  - Function: `midas-trendpilot`.
  - Deploy-Kommando: `supabase functions deploy midas-trendpilot --project-ref ... --workdir backend --use-api`.
  - Ergebnis: Deploy erfolgreich.
- `supabase functions list --project-ref ...` nach Deploy ausgefuehrt:
  - `midas-trendpilot` ist remote `ACTIVE`.
  - Remote-Version nach Deploy: Version 19, `UPDATED_AT` 2026-06-01 19:47:36 UTC.
- Remote-Edge-Dry-Run mit gueltiger Range nach Deploy ausgefuehrt:
  - `ok: true`.
  - `dry_run: true`.
  - `written_count: 0`.
  - Test-Range lieferte keine Events.
- Remote-Invalid-Date-Dry-Run mit `2026-02-31` nach Deploy ausgefuehrt:
  - HTTP 400.
  - Fehler: `range.from ist ungueltig (YYYY-MM-DD erwartet).`
  - Interpretation: Die neue S4.5-Date-Validation ist remote aktiv.
- GitHub CLI nach User-Login erneut geprueft:
  - `gh auth status` erfolgreich.
  - Account: `stephanschabuss97-design`.
  - Scopes enthalten `repo` und `workflow`.
- GitHub Workflow-Smoke nach Auth-Fix ausgefuehrt:
  - Workflow: `Trendpilot Weekly`.
  - Run: `26778358247`.
  - Trigger: `workflow_dispatch`.
  - Ergebnis: `success`.
  - Job `run-trendpilot` erfolgreich.
  - Log-Response der Edge Function: `ok:true`, `trigger:"scheduler"`, Range `2026-04-07` bis `2026-06-01`, `fetched` mit BP/Body-Daten, `written:[]`.
  - Interpretation: GitHub Actions kann den produktiven Scheduler-Pfad ausfuehren; in diesem Lauf wurden keine neuen Events geschrieben.
- Weiterhin nicht separat ausgefuehrt:
  - Manueller Edge Runtime-Smoke mit direkter Schreibwirkung ausserhalb des GitHub Workflows.
  - Bewertung: nicht erforderlich fuer S5, weil der GitHub Workflow-Smoke denselben produktiven Scheduler-Pfad erfolgreich aufgerufen hat und keine neuen Writes erzeugte.

Code-Review-Nachtrag 01.06.2026:

- Nach S5 wurde ein weiterer gezielter Review auf `backend/supabase/functions/midas-trendpilot/index.ts` durchgefuehrt.
- Findings:
  - TRP-S5-CR2-F1: Non-Dry-Run-Response nutzte noch Vor-Upsert-Events und konnte dadurch bei ACK-Fortsetzung vom final persistierten Payload abweichen.
  - TRP-S5-CR2-F2: `addDaysUtc` nutzte `Date.UTC` direkt und konnte dadurch fuer Jahre `0001` bis `0099` in JS-Year-Offset-Semantik fallen.
- Korrekturen:
  - Non-Dry-Run-Response nutzt jetzt `singleUpsert.withIds` und `combinedUpsert.withIds`.
  - `addDaysUtc` arbeitet jetzt mit Date-Clone und `setUTCDate`, statt `Date.UTC` neu aufzubauen.
- Nachpruefung:
  - `deno check backend/supabase/functions/midas-trendpilot/index.ts`: exit 0.
  - `git diff --check`: exit 0.
  - Date-Smoke:
    - `0001-01-01 + 1 Tag` -> `0001-01-02`.
    - `2028-02-28 + 1 Tag` -> `2028-02-29`.
    - `2026-03-01 - 1 Tag` -> `2026-02-28`.
- Contract Review:
  - Response-Vertrag passt jetzt zum finalen Upsert-Stand.
  - Date-Helper sind konsistenter mit der strikten ISO-Day-Validation.
  - Keine offenen Code-Findings aus diesem Nachreview.

Deploy-Nachtrag nach Code-Review-Nachtrag 01.06.2026:

- Supabase Deploy erneut nach ausdruecklicher User-Freigabe ausgefuehrt:
  - Function: `midas-trendpilot`.
  - Ergebnis: Deploy erfolgreich.
- `supabase functions list --project-ref ...` nach erneutem Deploy ausgefuehrt:
  - `midas-trendpilot` ist remote `ACTIVE`.
  - Remote-Version nach erneutem Deploy: Version 20, `UPDATED_AT` 2026-06-01 20:04:12 UTC.
- Remote-Edge-Dry-Run mit gueltiger Range erneut ausgefuehrt:
  - `ok: true`.
  - `dry_run: true`.
  - `written_count: 0`.
  - `fetched`: BP 14, Body 4, Lab 0.
- GitHub Workflow-Smoke erneut ausgefuehrt:
  - Workflow: `Trendpilot Weekly`.
  - Run: `26778853880`.
  - Trigger: `workflow_dispatch`.
  - Ergebnis: `success`.
  - Log-Response der Edge Function: `ok:true`, `trigger:"scheduler"`, Range `2026-04-07` bis `2026-06-01`, `fetched` BP 30, Body 8, Lab 0, `written:[]`.
  - Interpretation: Remote-Version 20 ist deployed und der produktive Scheduler-Pfad laeuft erfolgreich ohne neue Writes in diesem Smoke.

Doku-Sync-Entscheidung:

- `docs/modules/Trendpilot Module Overview.md` und `docs/QA_CHECKS.md` werden in S6 aktualisiert.

Abnahme:

- S5 abgeschlossen.

## S6 - Doku-Sync, QA-Update und Abschlussreview

Ziel:

- Doku, QA und Code sprechen denselben Trendpilot-Vertrag.

Substeps:

- S6.1 `docs/modules/Trendpilot Module Overview.md` aktualisieren:
  - Response-Kontext.
  - BP-Critical-Regel.
  - Sample-Gates.
  - Lab-Gate.
  - Date-Validation.
  - ACK-Verhalten.
- S6.2 `docs/QA_CHECKS.md` um Trendpilot-Review-Smokes erweitern.
- S6.3 Roadmap-Ergebnisprotokolle aktualisieren.
- S6.4 Finaler Contract Review:
  - Roadmap vs. Code.
  - Roadmap vs. Trendpilot Overview.
  - Roadmap vs. QA.
  - Roadmap vs. MIDAS-Guardrails.
- S6.5 Abschluss-Abnahme:
  - keine offenen P0/P1-Risiken.
  - Deploy-Status explizit dokumentiert.
  - Runtime-Smokes offen oder ausgefuehrt dokumentiert.
- S6.6 Commit-Empfehlung.
- S6.7 Archiv-Entscheidung nach User-Abnahme.

Exit-Kriterium:

- Roadmap ist commit- oder archivbereit.

### S6 Ergebnisprotokoll 01.06.2026

Durchgefuehrt:

- S6.1 `docs/modules/Trendpilot Module Overview.md` aktualisiert.
- S6.2 `docs/QA_CHECKS.md` um Phase P15 erweitert.
- S6.3 Roadmap-Ergebnisprotokolle um Deploy-/Workflow- und Code-Review-Nachtraege aktualisiert.
- S6.4 Finaler Contract Review durchgefuehrt.
- S6.5 Abschluss-Abnahme durchgefuehrt.
- S6.6 Commit-Empfehlung bestaetigt.
- S6.7 Archiv-Entscheidung umgesetzt.

Doku-Sync:

- Trendpilot Overview dokumentiert jetzt:
  - finalen Edge-Function-Response-Vertrag fuer Dry-Run und Non-Dry-Run.
  - ACK-Fortsetzung mit `continued_after_ack`.
  - strikte `YYYY-MM-DD`-Range-Validation.
  - BP-Critical-Regel mit absoluter Schwelle und Delta-Mindestniveau.
  - BP-Minimum von 2 validen Samples pro Woche.
  - Lab-Gate ohne globales 6-Wochen-Handler-Gate.
  - Remote-Stand Version 20 nach Deploy und Runtime-Smokes.
- QA dokumentiert jetzt Phase P15:
  - lokale Checks.
  - Deploy-/Remote-Smokes.
  - GitHub Workflow-Smoke.
  - Regression-/Contract-Checks.

Finaler Contract Review:

- Roadmap vs. Code:
  - S4.1 bis S4.7 und die S5-Code-Review-Nachtraege sind in `midas-trendpilot/index.ts` umgesetzt.
  - Response nutzt finalen Upsert-Stand.
  - BP-, Lab-, Date- und ACK-Vertraege sind im Code auffindbar.
- Roadmap vs. Trendpilot Overview:
  - Alle S6.1-Themen sind dokumentiert.
  - Kein bekannter Doku-Widerspruch zum finalen Codevertrag.
- Roadmap vs. QA:
  - Phase P15 bildet die finalen Checks und Smokes ab.
  - Deploy- und Workflow-Status sind dokumentiert.
- Roadmap vs. MIDAS-Guardrails:
  - Kein Diagnose-/Therapiepfad.
  - Kein Echtzeit-Spike-Alert.
  - Kein Push-/Reminder-Laerm.
  - Kein Voice-/Assistant-Fast-Path.
  - Keine SQL-/RLS-/UI-Ausweitung.

Contract-Findings:

- Keine offenen S6-Findings.

Abschluss-Abnahme:

- Keine offenen P0/P1-Risiken.
- Supabase Deploy abgeschlossen: `midas-trendpilot` remote `ACTIVE`, Version 20.
- Remote Dry-Run abgeschlossen und schreibfrei.
- Remote Invalid-Date-Smoke abgeschlossen.
- GitHub Workflow-Smoke abgeschlossen: Run `26778853880`, `success`, Edge-Function-Response `ok:true`, `written:[]`.
- Manueller direkter Write-Smoke ausserhalb des GitHub Workflows ist nicht zusaetzlich erforderlich, weil der produktive Scheduler-Pfad per Workflow erfolgreich ausgefuehrt wurde.
- Roadmap ist archivbereit.

Commit-Empfehlung:

```text
fix(trendpilot): align review findings with event contract
```

## Smokechecks / Regression

- Scheduler-Run bleibt service-role-faehig und user-gebunden.
- Dry-Run schreibt nicht.
- Non-Dry-Run bleibt idempotent.
- `trendpilot_events` erzeugt keine Duplikate fuer denselben `user_id + type + window_from + severity`.
- `payload.context` bleibt nur fuer warning/critical.
- `info` bleibt popup-frei.
- Combined-Events referenzieren weiterhin Single-Event-IDs.
- ACK-Dialog bleibt modal und schreibt nur bei expliziter Kenntnisnahme.
- Arzt-Block und Chart-Bands lesen weiterhin aus `trendpilot_events`.
- Keine BP-/Body-/Lab-Capture-Regression.

## Abnahmekriterien

- Kein Response-/Persistenz-Drift fuer context-angereicherte Events.
- BP-Critical-Regel ist eindeutig und dokumentiert.
- Sample-Gates sind bewusst und metrikspezifisch.
- Lab-Auswertung ist nicht mehr versehentlich durch ein falsches globales Gate blockiert oder der No-Change ist begruendet.
- Invalid-Date-Inputs rollen nicht still.
- ACK-Verhalten bei Fortsetzung/Verschlechterung ist bewusst.
- Doku und QA bilden den finalen Vertrag ab.

## Commit-Empfehlung

Nach Umsetzung geeignet:

```text
fix(trendpilot): align review findings with event contract
```
