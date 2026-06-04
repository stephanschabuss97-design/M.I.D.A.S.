# MIDAS Incident Push Review Findings Roadmap (DONE)

## Roadmap-Metadaten

| Feld | Wert |
| --- | --- |
| Status | `DONE` |
| Modul / Bereich | Push / Remote Incidents / Supabase Edge Function |
| Owner / Kontext | Backend, Push, Touchlog, GitHub Actions |
| Erstellt am | `2026-06-02` |
| Letzter Stand | `2026-06-04, S7 entschieden und Roadmap abgeschlossen` |
| Aktueller Schritt | `abgeschlossen / Archiv` |
| Betroffene Hauptdateien | `backend/supabase/functions/midas-incident-push/index.ts`, `app/modules/push/index.js`, `docs/modules/Push Module Overview.md`, `docs/QA_CHECKS.md` |
| Deploy relevant | `ja` |
| Runtime-Smoke relevant | `ja` |
| Archivziel | `docs/archive/MIDAS Incident Push Review Findings Roadmap (DONE).md` |

## Current Working State / Handoff

- Aktueller Stand:
  - `midas-incident-push` funktioniert im Alltag gefuehlt stabil.
  - Deep-Dive-Review hat keine akuten fachlichen Push-Logik-Brueche gefunden.
  - `S1` wurde am `2026-06-04` deterministisch abgeschlossen.
  - `S2` wurde am `2026-06-04` deterministisch abgeschlossen.
  - `S3` wurde am `2026-06-04` deterministisch abgeschlossen.
  - `S4 Readiness Review` wurde am `2026-06-04` abgeschlossen.
  - `S4.1` wurde am `2026-06-04` abgeschlossen.
  - `S4.2` wurde am `2026-06-04` abgeschlossen.
  - `S4.3` wurde am `2026-06-04` abgeschlossen.
  - `S4.4` wurde am `2026-06-04` abgeschlossen.
  - `S4.5` wurde am `2026-06-04` abgeschlossen.
  - `S4.6` wurde am `2026-06-04` abgeschlossen.
  - `S4.7` wurde am `2026-06-04` abgeschlossen.
  - `S4.8` wurde am `2026-06-04` abgeschlossen.
  - `S4.9` wurde am `2026-06-04` abgeschlossen.
  - `S5.1` bis `S5.5` wurden am `2026-06-04` abgeschlossen.
  - Remote-Secret-Namen fuer `midas-incident-push` wurden geprueft und sind vollstaendig.
  - `S5.6` wurde am `2026-06-04` nach User-Freigabe abgeschlossen.
  - Remote Function ist deployed und `ACTIVE`, Version 16.
  - Remote Dry-Run, direkter Diagnose-Push und GitHub Workflow-Smoke sind gruen.
  - Desktop- und Android-Zielgeraet-Smokes wurden userseitig erfolgreich bestaetigt.
  - `S6` wurde am `2026-06-04` abgeschlossen.
  - `S7` wurde am `2026-06-04` besprochen und bewusst ohne Folgeumsetzung abgeschlossen.
  - `deno check backend/supabase/functions/midas-incident-push/index.ts` ist gruen.
  - `deno lint backend/supabase/functions/midas-incident-push/index.ts` ist gruen.
- Naechster erlaubter Schritt:
  - keiner; Roadmap ist abgeschlossen und wird archiviert.
- Aktuell bekannte Findings:
  - `IP-F1` Input-/JSON-/Datum-Validierung ist abgeschlossen.
  - `IP-F2` VAPID Env-Guard ist abgeschlossen.
  - `IP-F3` Deno-Hygiene ist abgeschlossen.
  - `IP-F4` Scheduler-Fallback auf alle User ist abgeschlossen.
  - `IP-F5` Push-Overview und QA sind auf den aktuellen 26-Run-/Health-/Delivery-Vertrag synchronisiert.
  - `IP-F6` Remote-Health/Freshness und Edge-Partial-Delivery-Diagnose sind abgeschlossen.
- Aktuell geaenderte Dateien:
  - `backend/supabase/functions/midas-incident-push/index.ts`
  - `app/modules/push/index.js`
  - `app/modules/incidents/index.js`
  - `docs/MIDAS Incident Push Review Findings Roadmap.md`
  - `docs/modules/Push Module Overview.md`
  - `docs/QA_CHECKS.md`
- Offene User-Freigaben:
  - keine.
- Wichtige Grenzen fuer den naechsten Chat:
  - Kein Code vor abgeschlossenem `S4 Readiness Review`.
  - Kein Supabase Deploy ohne ausdrueckliche Freigabe.
  - Kein produktiver GitHub Workflow-Smoke ohne ausdrueckliche Freigabe.
  - Keine neuen Push-Schwellen, keine neue Reminder-Kette, kein UI-Umbau.
  - Keine Per-Device-ACK-, native Android-Reminder- oder eigene BP-Reminder-Architektur in dieser Roadmap; S7 hat bestaetigt, dass dafuer aktuell keine Umsetzung gestartet wird.

## Ziel (klar und pruefbar)

Die Remote-Incident-Push Edge Function soll die Review-Findings sauber abfangen, ohne den bestehenden Push-Produktvertrag zu veraendern.

Pruefbare Zieldefinition:

- Ungueltiger Request-Body und ungueltiges `now` fuehren zu klaren `400`-Antworten statt stillem Default oder unklarem Crash.
- Web-Push-Pflicht-Env (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`) wird fail-fast validiert.
- `deno lint` und `deno check` sind fuer `midas-incident-push` gruen.
- Der Service-Role-/Scheduler-Vertrag bleibt eng und dokumentiert.
- Diagnose-Pushes bleiben technisch getrennt von Medication-/BP-Dedupe.
- Reminder-/Incident-Schwellen, Typen, Tags und Severity-Vertrag bleiben unveraendert.
- Push-Overview, QA und Roadmap sprechen denselben finalen Cron-, Runtime- und Smoke-Vertrag.

## Problemzusammenfassung

Beim Deep-Dive von `backend/supabase/functions/midas-incident-push/index.ts` wurden keine harten fachlichen Fehler in der eigentlichen Push-Entscheidung gefunden:

- Service-Role-only Auth ist vorhanden.
- Europe/Vienna wird fuer Tages- und Zeitfenster verwendet.
- Medication-Reminder und Incidents sind sauber nach `reminder` und `incident` getrennt.
- BP bleibt incident-orientiert.
- Diagnose-Pushes schreiben nicht in `push_notification_deliveries`.
- Remote-Dedupe nutzt `user/day/type/severity/source`.
- Client-Suppression haengt an echtem Remote-Erfolg, nicht an Diagnose.

Trotzdem gibt es robuste Follow-up-Punkte:

- JSON-Parsing und `now`-Parsing waren weich und liefen teils vor dem zentralen `try`; erledigt in `S4.1`.
- Fehlende VAPID Keys wurden nicht beim Start abgefangen; erledigt in `S4.2`.
- Deno-Lint war wegen unversioniertem JSR-Import nicht gruen; erledigt in `S4.3`.
- Der Fallback von `INCIDENTS_USER_ID` auf alle aktiven Subscription-User wurde fuer den Single-User-Vertrag entfernt; erledigt in `S4.4`.
- Die Push-Overview beschrieb bei der Workflow-Cron noch eine alte Kadenz, waehrend der Workflow bereits `17,37 ...` nutzt; erledigt in `S4.8`.

## Entscheidungslog

| Datum | Entscheidung | Begruendung | Betroffene Schritte |
| --- | --- | --- | --- |
| `2026-06-02` | Enger Review-Findings-Fix statt Push-Umbau | Die fachliche Push-Logik wirkt stabil; Findings betreffen Robustheit, Tooling und Doku-Sync. | `S1-S6` |
| `2026-06-02` | Keine Schwellen-/Copy-Aenderung ohne neues Finding | Reminder-/Incident-Copy und Zeitfenster passen zum Push-Modulvertrag. | `S2`, `S3`, `S4` |
| `2026-06-02` | Runtime-Smokes bleiben user-gated | Incident Push kann echte Notifications senden und Remote-Health/Dedupe schreiben. | `S5` |
| `2026-06-04` | Zielgeraet-Zuverlaessigkeit als eigener Contract-Punkt | User-Feedback zeigt wieder zickige Pushes; akzeptierter Remote-Erfolg ist nicht automatisch sichtbare Erinnerung am gewuenschten Geraet. | `S2`, `S3`, `S4 Readiness`, `S5` |

## Scope

- Code:
  - `backend/supabase/functions/midas-incident-push/index.ts`
  - `app/modules/push/index.js` fuer konservativere Remote-Health-/Suppression-Bewertung, falls `S3` und `S4 Readiness` das bestaetigen.
  - `app/modules/incidents/index.js` nur falls `S3` einen harten Bruch im Konsum von `AppModules.push.shouldSuppressLocalPushes()` findet.
- Doku:
  - `docs/modules/Push Module Overview.md`
  - `docs/QA_CHECKS.md`
  - diese Roadmap
- Contract-Analyse:
  - Remote-Erfolg vs. sichtbare Zielgeraet-Zustellung
  - Subscription-/Device-Zuordnung
  - lokale Fallback-Suppression
  - alternative BP-Erinnerungswege, falls Web Push den 10-Jahres-Vertrag nicht verlaesslich genug tragen kann
- Read-only Review:
  - `.github/workflows/incidents-push.yml`
  - `sql/15_Push_Subscriptions.sql`
  - `sql/12_Medication.sql`
  - `app/modules/push/index.js`
  - `app/modules/incidents/index.js`
  - `service-worker.js`
  - `docs/modules/Medication Module Overview.md`
  - `docs/modules/Touchlog Module Overview.md`
  - relevante historische Push-Roadmaps in `docs/archive/`
- QA:
  - lokale Deno-Checks
  - git whitespace checks
  - definierte oder freigegebene Supabase-/GitHub-/Device-Smokes

## Not in Scope

- Keine neuen Medication- oder BP-Schwellen.
- Keine neue Reminder-Kette, Snooze-Logik oder Eskalationsstufe.
- Keine neue alternative BP-Erinnerungsarchitektur ohne Entscheidung in `S2/S3` und ggf. separate Roadmap.
- Keine UI-Aenderungen im Touchlog, Profil, Hub oder Incidents-Modul, ausser S1-S3 finden einen echten Contract-Bruch.
- Keine SQL-/RLS-/Schema-Aenderung, ausser S1-S3 finden einen harten Blocker.
- Keine Aenderung an Service Worker Notification-UX, ausser Payload-Vertrag wird verletzt.
- Keine Aenderung anderer Edge Functions.
- Kein Deploy ohne ausdrueckliche User-Freigabe.
- Kein GitHub Workflow-Smoke mit produktiver Schreibwirkung ohne ausdrueckliche User-Freigabe.

## Future Scope / Separate Roadmaps

Diese Roadmap haertet den bestehenden Edge-/Web-Push-Pfad. Sie baut keine neue Reminder-Architektur.

Separate Roadmaps werden erst sinnvoll, wenn S5 oder der anschliessende Alltagstest zeigt, dass Web Push trotz konservativerer Health-Logik weiter keine verlaessliche sichtbare Zielgeraet-Zustellung liefert.

Langfristige Kandidaten:

- Per-Device ACK:
  - Ziel: MIDAS speichert nicht nur `Push-Dienst akzeptiert`, sondern `gewuenschtes Geraet hat sichtbar verarbeitet`.
  - Risiko: braucht Client-Rueckkanal, neue Writes, Race-Handling und klare Offline-Regeln.
- Native Android Reminder:
  - Ziel: robuster Handy-Reminder ueber Android-Notification-/WorkManager-Mechanik.
  - Risiko: eigene Plattformarchitektur ausserhalb des aktuellen Browser-/PWA-Vertrags.
- Eigener BP-Reminder-Kanal:
  - Ziel: BP-Erinnerungen nicht mehr vollstaendig an Incident/Web-Push-Dedupe koppeln.
  - Risiko: neue Reminder-Semantik, neue Dedupe-Regeln und moegliche Reminder-Ketten.
- Externer System-/Kalender-Reminder:
  - Ziel: maximale Alltagssicherheit unabhaengig von MIDAS-Laufzeit.
  - Risiko: weniger MIDAS-deterministisch, weniger zentral dokumentierbar.

Ausloesekriterien fuer eine separate Roadmap:

- Wiederholte reale Ausfaelle am bevorzugten Zielgeraet trotz erfolgreichem Remote-Dry-Run.
- `push_notification_deliveries` zeigt Remote-Erfolg, aber das Zielgeraet zeigt wiederholt keine sichtbare Erinnerung.
- Lokale Suppression muss dauerhaft so konservativ bleiben, dass sie praktisch ihren Nutzen verliert.
- BP-Erinnerung wird fachlich wichtiger als der bisherige Incident-Charakter und braucht eine eigene Produktentscheidung.

Nicht-Ausloesekriterien:

- Einzelner verpasster Push ohne Reproduzierbarkeit.
- Deno-/Lint-/Env-Hygiene.
- Doku-Cron-Drift.
- Wunsch nach mehr Komfort ohne belegten Reliability-Bruch.

## Relevante Referenzen (Code)

- `backend/supabase/functions/midas-incident-push/index.ts`
- `.github/workflows/incidents-push.yml`
- `sql/15_Push_Subscriptions.sql`
- `sql/12_Medication.sql`
- `app/modules/push/index.js`
- `app/modules/incidents/index.js`
- `service-worker.js`

## Relevante Referenzen (Doku)

- `README.md`
- `docs/DEV_ENVIRONMENT.md`
- `docs/MIDAS Roadmap Template.md`
- `docs/modules/Push Module Overview.md`
- `docs/modules/Medication Module Overview.md`
- `docs/modules/Touchlog Module Overview.md`
- `docs/modules/Profile Module Overview.md`
- `docs/QA_CHECKS.md`
- `docs/archive/Medication Reminder Softening & Push Tuning Roadmap (DONE).md`
- `docs/archive/MIDAS Backend Edge Functions Deno Check Roadmap (DONE).md`
- `docs/archive/Push Cadence & Health Visibility Follow-up Roadmap (DONE).md`
- `docs/archive/Push Channel Robustness & Android WebView Boundary Roadmap (DONE).md`

Regel:

- Erst README und Dev-Environment lesen.
- Dann Push-, Medication-, Touchlog- und Profile-Overviews lesen.
- Dann historische Push-Roadmaps lesen.
- Dann Workflow, SQL, Client und Edge Function lesen.
- Erst nach `S4 Readiness Review` Code aendern.

## Guardrails

- MIDAS bleibt single-user und alltagstauglich.
- Kein Push-Spam.
- Keine Reminder-Ketten ohne explizite Entscheidung.
- Diagnose-Pushes duerfen keine fachliche Suppression freischalten.
- Lokale Suppression nur bei nachweislich gesundem Remote-Pfad.
- Remote-Health darf nicht mit sichtbarer Zielgeraet-Zustellung verwechselt werden.
- Browser/PWA bleibt Reminder-Push-Master; Android-WebView bleibt kein verlaesslicher Reminder-Push-Kanal.
- Keine versteckten Writes oder produktiven Runtime-Aktionen ohne klaren Nutzerkontext.
- Keine freie medizinische Diagnose oder neue medizinische Bewertung.
- Source-of-Truth-Dokus muessen am Ende synchron sein.

## Architektur-Constraints

- Supabase Edge Function laeuft in Deno.
- GitHub Actions Cron ist UTC; fachliche Bewertung passiert in `Europe/Vienna`.
- Web Push benoetigt VAPID Public/Private Keys.
- Workflow authentifiziert mit Service-Role.
- `push_subscriptions` speichert Subscription- und Remote-Health-Stand.
- `push_notification_deliveries` ist fachliche Remote-Dedupe-Tabelle.
- Diagnose-Pushes schreiben nur `last_diagnostic_*` und nicht `push_notification_deliveries`.
- `deno check` prueft Type-/Import-Vertrag; `deno lint` prueft Deno-Hygiene.
- Supabase Deploy-Workdir ist `backend` mit `--use-api`.

## Tool Permissions

Allowed:

- Lesen und Aendern von:
  - `backend/supabase/functions/midas-incident-push/index.ts`
  - `app/modules/push/index.js`, falls `S3`/`S4 Readiness` die `IP-F6`-Umsetzung in dieser Roadmap bestaetigt
  - `app/modules/incidents/index.js`, nur falls der lokale Suppression-Konsum selbst angepasst werden muss
  - `docs/modules/Push Module Overview.md`
  - `docs/QA_CHECKS.md`
  - diese Roadmap
- Lesen der referenzierten Workflow-, SQL-, Client- und Doku-Dateien.
- Lokale Checks:
  - `deno check backend/supabase/functions/midas-incident-push/index.ts`
  - `deno lint backend/supabase/functions/midas-incident-push/index.ts`
  - `git diff --check`
  - gezielte `rg`-/`Select-String`-Scans.
- Nach User-Freigabe:
  - Supabase Deploy von `midas-incident-push`.
  - Remote Dry-Run oder Diagnostic-Smoke.
  - GitHub Workflow-Smoke.

Forbidden:

- Supabase Deploy ohne ausdrueckliche User-Freigabe.
- GitHub Workflow-Smoke ohne ausdrueckliche User-Freigabe.
- Produktive fachliche Incident-Smokes ohne ausdrueckliche User-Freigabe.
- SQL-/RLS-/Schema-Aenderungen ohne neue Freigabe.
- Aenderungen an Push-Schwellen, Notification-UX oder Touchlog-UI ohne neues Finding.
- Aenderungen an Monthly Report, Trendpilot, Protein, Assistant oder anderen Edge Functions.

## Deploy- und Runtime-Status

| Feld | Wert |
| --- | --- |
| Lokale Codeaenderung | `ja` |
| Lokale Checks | `S5.1-S5.5: deno check, deno lint, node --check fuer push/incidents, git diff --check, Workflow-/Doku-/Schema-/Secret-Scans gruen` |
| Supabase Deploy | `midas-incident-push ACTIVE Version 16, deployed 2026-06-04` |
| GitHub Workflow-Smoke | `Run 26954859805 success, diagnostic, sentSubscriptions=3, failedSubscriptions=0` |
| Browser-/Device-Smoke | `Desktop und Android userseitig erfolgreich bestaetigt` |
| Produktive Schreibwirkung | `ja` |
| Letzter Remote-Nachweis | `midas-incident-push ACTIVE Version 16 laut Function-Liste vom 2026-06-04` |

## Execution Mode

- Sequenziell arbeiten: `S1` bis `S6`.
- `S1` bis `S3` sind Doku-Detektivarbeit, Systemverstaendnis, Risikoanalyse und Contract Reviews.
- Nach `S3` und vor `S4` gibt es einen expliziten `S4 Readiness Review`.
- `S4` ist der Umsetzungsblock mit Substeps.
- `S5` ist der Pruefblock mit lokalen Checks, Smokes, Code Reviews und Contract Reviews.
- `S6` ist Doku-Sync, QA-Update, finaler Contract Review, Commit-Empfehlung und Archiv-Entscheidung.
- `S7` ist ein nachgelagerter Reliability-Merker fuer spaetere Alltagserfahrung; S7 blockiert S6, Archivierung und Commit nicht.
- Nach jedem Hauptschritt Statusmatrix aktualisieren.
- Nach jedem Hauptschritt mindestens ein Check oder Review dokumentieren.
- Jeder S4-Substep endet mit Code Review, Contract Review, Findings und Korrektur der Findings.
- Commit-Empfehlungen werden nur nach S5 oder S6 dokumentiert.

## Skalierung der Roadmap

Diese Roadmap ist klein bis mittel, aber Push / Notifications und Edge Functions sind riskante Bereiche. Deshalb wird `S1` bis `S6` voll angewendet.

- `S1-S3`: deterministische Detektivarbeit.
- `S4`: schlanke Substeps mit engem Scope.
- `S5`: lokale Checks plus klar getrennte, user-gated Runtime-Smokes.
- `S6`: Doku- und QA-Sync, weil Source-of-Truth-Doku betroffen ist.

## Statusmatrix

| ID | Schritt | Status | Ergebnis/Notiz |
| --- | --- | --- | --- |
| S1 | System- und Vertragsdetektivarbeit | DONE | Doku, historische Push-Roadmaps, Workflow, SQL, Client und Edge Function gelesen; Systemkarte und S1 Contract Review dokumentiert. |
| S2 | Fachlicher/technischer Contract Review | DONE | Runtime-Input, Env, Dedupe, Diagnostic, Single-User-Zielnutzer und Zielgeraet-Zuverlaessigkeit entschieden. |
| S3 | Bruchrisiko-, UI-/Copy- und Umsetzungsreview | DONE | Bruchrisiken, Copy-/Status-Vertrag, Checks und S4-Schnitt dokumentiert; `S4.6` in Client-Health und Edge-Partial-Delivery getrennt. |
| S4 | Umsetzung | DONE | `S4.1` bis `S4.9` abgeschlossen; alle Findings umgesetzt oder bewusst abgegrenzt. |
| S5 | Tests, Code Review und Contract Review | DONE | Lokale Checks, CodeRabbit Gate, Deploy, Remote Dry-Run, Diagnose-Push, GitHub Workflow-Smoke sowie Desktop-/Android-Zielgeraet-Smoke abgeschlossen. |
| S6 | Doku-Sync, QA-Update und finaler Abschlussreview | DONE | Push Overview, QA und Roadmap final synchronisiert; Contract Review ohne offene Findings. |
| S7 | Nachgelagerter Push-Reliability-Merker | DONE | Besprochen und bewusst ohne Folgeumsetzung abgeschlossen; Web-/PWA-Push bleibt Primaerpfad, groessere Alternativen bleiben nur bei wiederholten realen Ausfaellen separate Roadmaps. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Finding-Klassifizierung

| ID | Severity | Typ | Status | Entscheidung / Zielschritt |
| --- | --- | --- | --- | --- |
| `IP-F1` | `P1` | `Code` / `Contract` | `done` | Request-Body, explizite Enum-Werte, `dry_run`, `user_id` und `now` strikt validiert; abgeschlossen in `S4.1`. |
| `IP-F2` | `P2` | `Code` / `Runtime` | `done` | VAPID Public/Private Keys werden fail-fast geprueft; abgeschlossen in `S4.2`. |
| `IP-F3` | `P2` | `Code` / `QA` | `done` | Deno-Hygiene hergestellt: versionierter JSR-Import, unnoetige `@ts-ignore` entfernt; abgeschlossen in `S4.3`. |
| `IP-F4` | `P2` | `Contract` | `done` | Alle-User-Fallback entfernt; Zielnutzer-Aufloesung ist fail-closed ueber `user_id` oder `INCIDENTS_USER_ID`; abgeschlossen in `S4.4`. |
| `IP-F5` | `P2` | `Doku` | `done` | Push-Overview und QA auf echten Workflow und finalen Push-Health-Vertrag synchronisiert; abgeschlossen in `S4.8`. |
| `IP-F6` | `P1` | `Contract` / `Runtime` | `done` | Client-Health/Freshness abgeschlossen in `S4.6`; Edge-Partial-Delivery-Diagnose abgeschlossen in `S4.7`; groessere Per-Device-Ack-Architektur nur separate Roadmap. |

Severity-Vertrag:

- `P0`: blockiert Umsetzung oder kann produktiv falsche/sensible Writes, Auth-Bruch oder harte Datenfehler erzeugen.
- `P1`: echter Contract-/Runtime-/User-Facing-Bug, muss in dieser Roadmap adressiert oder explizit abgegrenzt werden.
- `P2`: Hygiene, Robustheit oder Copy-Verbesserung ohne akuten Blocker.
- `Watchlist`: erkannt, aber nur nach S1-S3 final entscheiden.

---

## S1 - System- und Vertragsdetektivarbeit

Ziel:

- Bestehenden Push- und Remote-Incident-Vertrag verstehen.
- Source-of-Truth-Dokus, Workflow, SQL, Client und Edge Function lesen.
- Noch keinen Code aendern, ausser diese Roadmap selbst wird aktualisiert.

Substeps:

- S1.1 `README.md` und `docs/DEV_ENVIRONMENT.md` lesen.
- S1.2 Push-, Medication-, Touchlog- und Profile-Module-Overviews lesen.
- S1.3 relevante historische Push-Roadmaps aus `docs/archive/` lesen.
- S1.4 `.github/workflows/incidents-push.yml` lesen und Scheduler-Vertrag dokumentieren.
- S1.5 `sql/15_Push_Subscriptions.sql` und `sql/12_Medication.sql` lesen.
- S1.6 Client-Vertrag lesen:
  - `app/modules/push/index.js`
  - `app/modules/incidents/index.js`
  - `service-worker.js`
- S1.7 Edge Function `midas-incident-push/index.ts` lesen.
- S1.8 Systemkarte, bestehende Datenfluesse, offene Fragen und erste Finding-Korrekturen dokumentieren.
- S1.9 Contract Review S1.
- S1.10 Schritt-Abnahme und Doku-Sync-Entscheidung.

Output:

- Systemkarte fuer Remote Push.
- Bestehender Auth-, Scheduler-, Dedupe-, Diagnostic- und Health-Vertrag.
- Entscheidung, ob `IP-F4` Code-Fix oder Watchlist bleibt.

Exit-Kriterium:

- Es ist klar, welche Schichten betroffen sind und welche nicht.

## S2 - Fachlicher/technischer Contract Review

Ziel:

- Findings gegen MIDAS-Guardrails pruefen.
- Zielvertrag und Grenzen festlegen.
- S4-Pflichtpunkte definieren.

Substeps:

- S2.1 Ziel gegen README, Dev-Environment und Push-Overview pruefen.
- S2.2 Auth-/Service-Role-Vertrag pruefen.
- S2.3 Runtime-Input-Vertrag fuer JSON, `now`, `mode`, `window`, `trigger`, `dry_run`, `user_id` definieren.
- S2.4 VAPID-/Env-Vertrag definieren.
- S2.5 Dedupe-/Diagnostic-/Remote-Health-Vertrag pruefen.
- S2.6 Zielgeraet-Zuverlaessigkeit pruefen:
  - Ist `deliveredSubscriptionCount > 0` fuer 10-Jahres-Alltagssicherheit ausreichend?
  - Darf ein Desktop-Erfolg einen Android-/PWA-Fallback fachlich deduplizieren?
  - Wie alt darf `last_remote_success_at` sein, bevor lokale Suppression nicht mehr vertraut?
  - Braucht MIDAS eine bevorzugte Subscription, eine Device-Klasse oder einen konservativeren Fallback?
- S2.7 Scheduler-Fallback-Vertrag (`INCIDENTS_USER_ID` vs. alle Subscription-User) entscheiden.
- S2.8 Doku-Cron-Vertrag gegen Workflow entscheiden.
- S2.9 Alternative BP-Erinnerungswege bewerten:
  - Edge Function plus besserer Health-Vertrag
  - lokaler Browser-/PWA-Fallback
  - Hub-/Touchlog-/Doctor-Kontext-Hinweis
  - bewusst separate Roadmap fuer andere Reminder-Architektur, falls Web Push nicht genug traegt
- S2.10 Contract Review S2.
- S2.11 Schritt-Abnahme und Doku-Sync-Entscheidung.

Output:

- Belastbarer Zielvertrag.
- S4-Pflichtpunkte.
- Bewusste Abgrenzungen.

Exit-Kriterium:

- Umsetzung kann starten, ohne dass Grundsatzfragen offen sind.

## S3 - Bruchrisiko-, UI-/Copy- und Umsetzungsreview

Ziel:

- Risiken vor Codeaenderung finden.
- User-Facing- und Diagnose-Copy gegen Produktrealitaet pruefen.
- S4-Substeps konkretisieren.

Substeps:

- S3.1 Bruchrisiken identifizieren:
  - stille Ausfaelle
  - falsche Sicherheit
  - falscher Alarm
  - Dedupe-/Race-Probleme
  - Partial Delivery: ein Geraet erfolgreich, Zielgeraet nicht sichtbar
  - veralteter Remote-Erfolg unterdrueckt lokale Fallbacks
  - Diagnose-vs.-fachliche Suppression
  - Scheduler-Jitter
  - Doku-/Code-Drift
- S3.2 User-Facing Copy Review:
  - Medication-Reminder-Copy
  - Incident-Copy
  - BP-Copy
  - Diagnose-Push-Copy
  - Response-/Fehlermeldungen der Edge Function
- S3.3 Tooling und lokal moegliche Checks klaeren.
- S3.4 S4-Substeps konkretisieren.
- S3.5 S4 Readiness Review vorbereiten:
  - voraussichtliche Reihenfolge
  - betroffene Dateien
  - Abhaengigkeiten
  - S5-Checks
- S3.6 Contract Review S3.
- S3.7 Schritt-Abnahme und Doku-Sync-Entscheidung.

Output:

- Bruchrisiko-Liste.
- Copy-/Status-Vertrag.
- Konkreter Umsetzungsplan fuer S4.

Exit-Kriterium:

- S4 hat klare Substeps und bekannte Review-Kriterien.

## S4 Readiness Review - Gate nach S3, vor S4

Ziel:

- Direkt vor dem Umsetzungsblock pruefen, ob die S4-Substeps nach S1-S3 noch richtig geschnitten sind.

Prueffragen:

- Muss `IP-F4` in Code umgesetzt oder bewusst abgegrenzt werden?
- Muss `IP-F6` in dieser Roadmap umgesetzt werden, oder braucht es eine separate Push-Reliability-/BP-Reminder-Roadmap?
- Muss Input-Parsing vor Env-/User-Resolution oder umgekehrt passieren?
- Sind `dry_run`, `diagnostic`, `incidents` und produktiver Sendepfad getrennt genug?
- Ist Event-Dedupe auf Nutzer-Ereignis-Ebene weiterhin richtig, wenn Zielgeraet-Zuverlaessigkeit wichtiger ist als Duplikatvermeidung?
- Sind Doku-Cron-Fix und Code-Fixes getrennt genug?
- Sind lokale Checks in S5 vollstaendig?
- Bleiben Deploy und GitHub Workflow-Smoke user-gated?

Exit-Kriterium:

- S4 kann starten, ohne dass Reihenfolge, Scope, betroffene Dateien oder Pflichtchecks unklar sind.

## S4 - Umsetzung

Ziel:

- Gefundene Punkte sequenziell umsetzen.
- Nach jedem Substep direkt Code und Contract reviewen.

Finale Substeps nach S4 Readiness Review:

- S4.1 Request-Input-Hardening:
  - Auth bleibt vor Body-Parsing.
  - Missing/empty body bleibt erlaubt und nutzt Scheduler-Defaults.
  - ungueltiges JSON liefert klare `400`-Antwort.
  - Body muss ein Object sein; Array/String/Number/Null liefern klare `400`-Antwort.
  - JSON-Parsing strikt behandeln.
  - `raw` als Record validieren und erst dann normalisieren.
  - explizite Enum-Werte fuer `trigger`, `mode` und `window` validieren.
  - `dry_run` nur als Boolean akzeptieren.
  - `user_id` nur als nicht-leeren String akzeptieren, wenn vorhanden.
  - `now` als gueltiges Datum validieren.
  - Datumsableitung (`toDayIsoTz`, `toISOString`) erst nach erfolgreicher Validation ausfuehren.
  - Fehler mit klarer `400`-Antwort liefern.
- S4.2 Env-Fail-fast:
  - Env-Guard vor `createClient(...)` und `webpush.setVapidDetails(...)` halten.
  - VAPID Public/Private Keys im Start-Guard pruefen.
  - `SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY` weiter als Pflicht-Env pruefen.
  - `VAPID_SUBJECT` darf Default behalten.
  - Fehlermeldung ohne Secret-Werte halten.
- S4.3 Deno-Hygiene:
  - `functions-js`-Import versionieren.
  - obsolete `@ts-ignore`-Kommentare entfernen, falls Deno check/lint danach gruen bleiben.
- S4.4 Scheduler-/User-Fallback-Vertrag umsetzen oder bewusst abgrenzen:
  - Entscheidung aus S2/S3/S4 Readiness anwenden: Code-Fix, keine Watchlist.
  - `resolveUserIds(...)` fail-closed machen:
    - explizite `user_id` verwenden, falls vorhanden.
    - sonst `INCIDENTS_USER_ID` verwenden, falls vorhanden.
    - sonst klarer Fehler statt alle Subscription-User zu scannen.
  - Fehlermeldung ohne Secret-Werte halten.
  - S5 muss pruefen, ob der produktive Zielnutzerpfad ueber Function-Secret oder Request existiert.
- S4.5 S4-Zwischenreview nach Edge-Basisfixes:
  - `S4.1` bis `S4.4` gemeinsam gegen Auth, Input, Env und Zielnutzervertrag pruefen.
  - `deno check` und `deno lint` muessen fuer die Edge Function gruen sein oder Findings sofort korrigiert werden.
  - erst danach Client-/Doku-Schritte starten.
- S4.6 Zielgeraet-Zuverlaessigkeit umsetzen oder bewusst abgrenzen:
  - Entscheidung aus `S2/S3/S4 Readiness` anwenden: in dieser Roadmap umsetzen.
  - `REMOTE_HEALTH_MAX_AGE_DAYS = 7` im Client als Startwert fuer lokale Suppression verwenden.
  - `remoteHealthy` nur bei aktueller Backend-Subscription, echtem Remote-Erfolg, keinem spaeteren Failure, `consecutive_remote_failures = 0` und frischem Erfolg erlauben.
  - `localSuppressionAllowed` bleibt exakt an diese konservative Health gebunden.
  - `app/modules/incidents/index.js` nur anfassen, falls der bestehende Konsum von `shouldSuppressLocalPushes()` den Vertrag verletzt.
  - Debug-/Status-Sprache nicht als sichtbare Zielgeraet-Zustellung formulieren.
- S4.7 Edge-Partial-Delivery-Diagnose:
  - erfolgreiche und fehlgeschlagene Subscriptions in Responses sicher zusammenfassen.
  - keine Roh-Endpunkte und keine Keys ausgeben.
  - sichere Subscription-Metadaten wie Endpoint-Hash, Kontext, Plattform, Browser und Label nutzen.
  - Event-Dedupe nicht als sichtbaren Zielgeraet-Beweis darstellen.
- S4.8 Push-Overview-/QA-Sync:
  - echte Workflow-Cron dokumentieren.
  - Run-Anzahl auf 26 regulaere Schedule-Runs pro Tag aktualisieren.
  - finalen Remote-Health-/Freshness-/Partial-Delivery-Vertrag dokumentieren.
  - S7/Future-Scope fuer Per-Device ACK, native Android Reminder und BP-Reminder-Kanal nicht als aktuellen Scope darstellen.
- S4.9 Gesamt-Code- und Contract Review:
  - Edge Function vs. Push Overview.
  - Workflow vs. Doku.
  - Client-Suppression vs. Remote-Health.
  - QA vs. tatsaechliche Checks.

Jeder Substep dokumentiert:

- Umsetzung
- betroffene Dateien
- lokaler Check
- Contract Review
- Findings
- Korrekturen
- Restrisiko

Exit-Kriterium:

- Alle priorisierten Findings sind umgesetzt oder bewusst abgegrenzt.

## S5 - Tests, Code Review und Contract Review

Ziel:

- Alles lokal Sinnvolle pruefen.
- Externe oder manuelle Smokes sauber definieren oder nach Freigabe ausfuehren.

Substeps:

- S5.1 Lokale Edge-Checks:
  - `deno check backend/supabase/functions/midas-incident-push/index.ts`
  - `deno lint backend/supabase/functions/midas-incident-push/index.ts`
- S5.2 Doku-/Whitespace-Checks:
  - `git diff --check`
  - gezielte `rg`-Scans gegen offene Findings.
- S5.3 Workflow-Strukturcheck:
  - `.github/workflows/incidents-push.yml` gegen Doku und Input-Vertrag pruefen.
- S5.4 Code Review:
  - Auth
  - Runtime-Validation
  - Dedupe
  - Partial Delivery und Zielgeraet-Zuverlaessigkeit
  - Diagnostic-Trennung
  - Subscription-Health
  - Error-Redaction
- S5.5 Contract Review:
  - README/Dev-Environment
  - Push Overview
  - Medication Overview
  - Touchlog Overview
  - QA
- S5.6 Remote-Smokes definieren oder nach Freigabe ausfuehren:
  - Supabase Function Deploy nach User-Freigabe.
  - Remote `dry_run` mit nicht-schreibender Bewertung, falls sinnvoll.
  - Manueller `mode=diagnostic` nur nach Freigabe, weil echte Notification und Health-Write.
  - GitHub Workflow-Smoke nur nach Freigabe.
  - Zielgeraet-Smoke nur nach Freigabe:
    - bevorzugtes Android/PWA-Geraet
    - Desktop/andere Subscriptions getrennt bewerten
    - partial-delivery Ergebnis als eigenes Review-Ergebnis dokumentieren
- S5.7 Optionaler CodeRabbit Review-Gate:
  - Findings klassifizieren.
  - echte Findings vor Commit oder S6 korrigieren oder bewusst abgrenzen.
- S5.8 Schritt-Abnahme und Commit-Empfehlung:
  - `noch nicht committen`, solange S6/Doku/QA oder externer Review offen ist.

Exit-Kriterium:

- Alle lokal moeglichen Checks sind erledigt oder bewusst als nicht verfuegbar markiert.

## S6 - Doku-Sync, QA-Update und finaler Abschlussreview

Ziel:

- Source-of-Truth-Dokus synchronisieren.
- QA aktualisieren.
- Roadmap final abschliessen.

Substeps:

- S6.1 `docs/modules/Push Module Overview.md` final aktualisieren.
- S6.2 `docs/QA_CHECKS.md` um Incident-Push-Review-Fix ergaenzen.
- S6.3 Roadmap mit Ergebnisprotokollen aktualisieren.
- S6.4 finaler Contract Review:
  - Roadmap vs. Code
  - Roadmap vs. Push Overview
  - Roadmap vs. Workflow
  - Roadmap vs. QA
  - Roadmap vs. Dev-Environment
- S6.5 Abschluss-Abnahme:
  - keine offenen P0/P1-Risiken
  - bekannte Restrisiken explizit dokumentiert
  - nicht betroffene Schichten bleiben unberuehrt
- S6.6 Commit-Empfehlung:
  - sinnvoller Commit-Scope dokumentieren.
- S6.7 Archiv-Entscheidung:
  - abgeschlossene Roadmap nach `docs/archive/MIDAS Incident Push Review Findings Roadmap (DONE).md` verschieben.

Exit-Kriterium:

- Doku, QA, Code und Roadmap sprechen denselben finalen Vertrag.

## S7 - Nachgelagerter Push-Reliability-Merker

Ziel:

- Nach Abschluss dieser Roadmap bewusst pruefen, ob der Edge-/Web-Push-Pfad im echten Alltag wieder verlaesslich genug ist.
- Falls nicht, eine separate Architektur-Roadmap starten statt diese Roadmap nachtraeglich aufzublaehen.

Zeitpunkt:

- Nach S6, Commit und einigen Tagen normaler Nutzung.
- Frueher nur, wenn ein klar reproduzierbarer Ausfall am bevorzugten Zielgeraet auftritt.

Prueffragen:

- Kommen BP-/Medication-Erinnerungen am bevorzugten Android-/PWA-Geraet sichtbar an?
- Gibt es Faelle, in denen `push_notification_deliveries` Remote-Erfolg zeigt, aber das Zielgeraet nichts sichtbar gemeldet hat?
- Ist lokale Suppression nach der Health-Haertung hilfreich oder weiterhin zu optimistisch?
- Reicht Web Push als Schutznetz, oder braucht BP fachlich einen eigenen Reminder-Kanal?
- Ist ein Per-Device-ACK, native Android-Reminder oder externer System-/Kalender-Reminder die sauberere Langzeitloesung?

Output:

- Keine Aktion, solange der gehaertete Web-/PWA-Push-Pfad im Alltag ausreichend stabil bleibt.
- Neue separate Roadmap nur bei wiederholten realen Ausfaellen trotz erfolgreichem Remote-/Device-Smoke.

Exit-Kriterium:

- Eine bewusste Entscheidung liegt vor: Edge-/Web-Push bleibt ausreichend oder es wird eine neue Architektur-Roadmap erstellt.

Entscheidung 2026-06-04:

- Edge-/Web-Push bleibt vorerst der ausreichende Primaerpfad.
- Keine Per-Device-ACK-Umsetzung in dieser Roadmap.
- Keine native Android-Reminder-Umsetzung in dieser Roadmap.
- Keine eigene BP-Reminder-Architektur in dieser Roadmap.
- Begruendung:
  - Per-Device ACK verbessert vor allem Diagnose, bringt aber langfristige Device-Lifecycle-Komplexitaet bei Handywechseln und alten Subscriptions.
  - Der aktuelle Android-/Widget-Vertrag ist bewusst passiv und kein Reminder-System.
  - Native Android Reminder waeren nur als separate Plattform-Roadmap sinnvoll, falls Web Push trotz Hardening wiederholt real versagt.
  - Fuer den 10-Jahres-Wartungsvertrag ist weniger manuelle Device-Pflege wichtiger als maximale technische Feindiagnose.

S7-Ergebnis:

- Kein Folgeprojekt gestartet.
- Roadmap kann abgeschlossen und archiviert werden.

---

## Ergebnisprotokoll

### Vorab Review 2026-06-02

Gelesen / geprueft:

- `backend/supabase/functions/midas-incident-push/index.ts`
- `.github/workflows/incidents-push.yml`
- `sql/15_Push_Subscriptions.sql`
- `sql/12_Medication.sql`
- `app/modules/push/index.js`
- `app/modules/incidents/index.js`
- `service-worker.js`
- `docs/modules/Push Module Overview.md`

Checks:

- `deno check backend/supabase/functions/midas-incident-push/index.ts`: gruen.
- `deno lint backend/supabase/functions/midas-incident-push/index.ts`: Finding `no-unversioned-import`.

Findings:

- `IP-F1` bis `IP-F5` in der Finding-Klassifizierung erfasst.

Contract Review:

- Die eigentliche Push-Fachlogik wirkt stabil.
- Die Roadmap darf eng auf Robustheit, Deno-Hygiene und Doku-Sync bleiben.
- Runtime-Smokes bleiben user-gated, weil echte Pushes und Remote-Health/Dedupe-Schreibwirkung moeglich sind.

Korrekturen:

- Roadmap nach neuem Template-Aufbau erstellt.

Restrisiko:

- `IP-F4` ist noch nicht final entschieden; das erfolgt deterministisch in `S1-S3`.

### S1 Ergebnisprotokoll 2026-06-04

#### S1.1 README und Dev-Environment

Gelesen:

- `README.md`
- `docs/DEV_ENVIRONMENT.md`

Ergebnis:

- MIDAS bleibt single-user, browser-first und alltagstauglich.
- Push ist Schutznetz, nicht Dauerberieselung.
- Supabase Edge Functions sind Repo-lokal unter `backend/supabase/functions/...` Source of Truth.
- Deno ist Pflichtwerkzeug fuer Edge Functions.
- Deploys, produktive GitHub Workflow-Runs und echte Push-Smokes bleiben user-gated.

#### S1.2 Module Overviews

Gelesen:

- `docs/modules/Push Module Overview.md`
- `docs/modules/Medication Module Overview.md`
- `docs/modules/Touchlog Module Overview.md`
- `docs/modules/Profile Module Overview.md`

Ergebnis:

- Push-Vertrag bestaetigt:
  - `reminder` und `incident` sind getrennte Severity-Stufen.
  - Diagnose-Pushes sind technisch und schreiben nicht in `push_notification_deliveries`.
  - Lokale Suppression darf nur bei echtem Remote-Health-Erfolg greifen.
  - Browser/PWA bleibt Reminder-Push-Master.
  - Android-WebView/Shell ist kein verlaesslicher Reminder-Push-Kanal.
- Medication-Vertrag bestaetigt:
  - Remote liest slot-/abschnittsbasiert aus `health_medications`, `health_medication_schedule_slots` und `health_medication_slot_events`.
- Touchlog-/Profile-Vertrag bestaetigt:
  - Push-Wartung gehoert sichtbar in den Touchlog.
  - Profil ist kein Push-Backend und keine sichtbare Push-Wartungsflaeche.

#### S1.3 Historische Push-Roadmaps

Gelesen:

- `docs/archive/Medication Reminder Softening & Push Tuning Roadmap (DONE).md`
- `docs/archive/MIDAS Backend Edge Functions Deno Check Roadmap (DONE).md`
- `docs/archive/Push Cadence & Health Visibility Follow-up Roadmap (DONE).md`
- `docs/archive/Push Channel Robustness & Android WebView Boundary Roadmap (DONE).md`

Ergebnis:

- Der finale Push-Vertrag ist kein neuer Umbau:
  - gestaffelte Medication-Schwellen
  - persistentes Remote-Dedupe
  - Catch-up nur hoechste faellige Severity
  - technische Diagnose strikt getrennt
  - lokale Suppression nur bei echtem Remote-Erfolg
- Deno-Check-Historie bestaetigt:
  - `deno check` ist Pflichtcheck, aber kein Runtime-Beweis.
  - Tooling-Findings duerfen nicht als Fachlogik-Bug fehlklassifiziert werden.
- Push-Cadence-Historie bestaetigt:
  - GitHub Actions bleibt nur Taktgeber.
  - Edge Function entscheidet fachlich in `Europe/Vienna`.

#### S1.4 Workflow-Vertrag

Gelesen:

- `.github/workflows/incidents-push.yml`

Aktueller Vertrag:

- Schedule:
  - `17,37 8,9,10,11,12,13,14,15,18,19,20,21,22 * * *`
  - zwei Ticks pro relevanter UTC-Stunde
  - 13 relevante UTC-Stunden mal 2 Ticks = 26 regulaere Schedule-Runs pro Tag
- `workflow_dispatch`:
  - `mode=incidents`
  - `mode=diagnostic`
  - `window=all|med|bp`
- Scheduler-Default:
  - `trigger=scheduler`
  - `mode=incidents`
  - `window=all`
- Fehlerhaertung:
  - `curl --fail-with-body`
  - HTTP-4xx/5xx sollen den Workflow sichtbar fehlschlagen lassen.

Finding-Korrektur aus S1:

- `IP-F5` wurde geschaerft: Push-Overview und QA muessen auf den aktuellen 26-Run-Vertrag synchronisiert werden.

#### S1.5 SQL-Vertrag

Gelesen:

- `sql/15_Push_Subscriptions.sql`
- `sql/12_Medication.sql`

Ergebnis:

- `push_subscriptions` traegt Remote-Health und Diagnosefelder.
- `last_diagnostic_*` ist kommentiert als nicht fuer medizinische Suppression zu verwenden.
- `push_notification_deliveries` dedupliziert fachliche Remote-Pushes ueber:
  - `user_id`
  - `day`
  - `type`
  - `severity`
  - `source`
- `severity` ist auf `reminder|incident` begrenzt.
- `source` ist auf `remote` begrenzt.
- Medication-Slots sind kanonisch auf `morning|noon|evening|night` begrenzt.

#### S1.6 Client-Vertrag

Gelesen:

- `app/modules/push/index.js`
- `app/modules/incidents/index.js`
- `service-worker.js`

Ergebnis:

- `AppModules.push` ist der Push-Service-Boundary.
- `remoteHealthy` und `localSuppressionAllowed` haengen am echten Remote-Health-Vertrag, nicht an Diagnose.
- `app/modules/incidents/index.js` nutzt lokal dieselben Medication-Schwellen wie der Remote-Vertrag:
  - `10:00/12:00`
  - `14:00/16:00`
  - `20:00/22:00`
  - `22:30/23:30`
- Lokale Tags sind severity-getrennt:
  - `midas-reminder-...`
  - `midas-incident-...`
- Service Worker wertet `data.severity` primaer aus und behaelt Legacy-Fallbacks.

#### S1.7 Edge Function

Gelesen:

- `backend/supabase/functions/midas-incident-push/index.ts`

Lokale Checks:

- `deno check backend/supabase/functions/midas-incident-push/index.ts`: gruen.
- `deno lint backend/supabase/functions/midas-incident-push/index.ts`: `no-unversioned-import` auf dem `functions-js`-Side-Effect-Import.

Bestaetigte Findings:

- `IP-F1` bestaetigt:
  - JSON-Parse-Fehler werden aktuell still zu `{}`.
  - `raw` wird nicht als Record validiert.
  - `now` wird vor dem zentralen `try` genutzt und kann bei ungueltigem Datum zu unklarem Runtime-Fehler fuehren.
- `IP-F2` bestaetigt:
  - `SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY` sind fail-fast.
  - `VAPID_PUBLIC_KEY` und `VAPID_PRIVATE_KEY` werden vor `webpush.setVapidDetails(...)` nicht fail-fast validiert.
- `IP-F3` bestaetigt:
  - unversionierter `jsr:@supabase/functions-js/edge-runtime.d.ts` Import.
  - alte `@ts-ignore`-Kommentare stehen im Widerspruch zum aktuellen Deno-Language-Server-Vertrag.
- `IP-F4` bestaetigt als Watchlist:
  - Wenn kein `INCIDENTS_USER_ID` gesetzt ist, faellt die Function auf alle aktiven Subscription-User zurueck.
  - S1-Entscheidung: `IP-F4` bleibt Watchlist und wird nicht als S1-Code-Fix abgeleitet.
  - Fuer MIDAS single-user ist das nicht akut falsch, muss in `S2/S3` aber bewusst final entschieden oder abgegrenzt werden.
- `IP-F5` bestaetigt:
  - Push-Overview und QA nennen noch 17 regulaere Runs pro Tag.
  - Aktueller Workflow hat 26 regulaere Runs pro Tag.

#### S1.8 Systemkarte Remote Push

Systemfluss:

- GitHub Actions oder manueller Call sendet Service-Role-authentifizierten POST an `midas-incident-push`.
- Edge Function:
  - prueft Methode und Service-Role-Bearer.
  - normalisiert `trigger`, `mode`, `window`, `dry_run`, `now` und optional `user_id`.
  - bestimmt `dayIso`, lokale Zeit und faellige Fenster in `Europe/Vienna`.
  - resolved Zielnutzer ueber `user_id`, `INCIDENTS_USER_ID` oder Subscription-Fallback.
  - liest aktive Push-Subscriptions.
  - liest Remote-Dedupe aus `push_notification_deliveries`.
  - liest Medication-Slots und BP-Zustand.
  - entscheidet faellige Events.
  - sendet Web Push an aktive Subscriptions.
  - aktualisiert Remote-Health pro Subscription.
  - schreibt Delivery-Dedupe nur bei mindestens einer erfolgreichen fachlichen Zustellung.
- Diagnosefluss:
  - nur `trigger=manual` plus `mode=diagnostic`.
  - sendet technischen Test-Push.
  - schreibt nur `last_diagnostic_*`.
  - schreibt nicht in `push_notification_deliveries`.

#### S1.9 Contract Review S1

Ergebnis:

- S1 bestaetigt den bestehenden Produktvertrag.
- Keine Schwellen-, Copy-, Service-Worker-, SQL- oder UI-Aenderung ist aus S1 heraus notwendig.
- Die Roadmap bleibt eng auf Robustheit, Env-Fail-fast, Deno-Hygiene und Doku-Sync.
- `IP-F1`, `IP-F2`, `IP-F3` und `IP-F5` sind Pflichtpunkte fuer S4.
- `IP-F4` bleibt als S1-Entscheidung Watchlist und darf nicht blind als Code-Fix umgesetzt werden.
- Die finale Umsetzungs- oder Abgrenzungsentscheidung fuer `IP-F4` gehoert in `S2/S3`.
- Deploy und Runtime-Smokes bleiben user-gated.

#### S1.10 Schritt-Abnahme und Doku-Sync-Entscheidung

Abnahme:

- S1 ist abgeschlossen.
- Betroffene Schichten sind klar:
  - Edge Function
  - Workflow als Read-only-Vertrag
  - SQL als Read-only-Vertrag
  - Client/Service Worker als Read-only-Vertrag
  - Push Overview und QA fuer spaeteren Doku-Sync
- Keine Codeaenderung wurde vorgenommen.

Doku-Sync-Entscheidung:

- Diese Roadmap wurde aktualisiert.
- `docs/modules/Push Module Overview.md` und `docs/QA_CHECKS.md` bleiben bis zum geplanten Doku-Fix in `S4.5` unveraendert.
- S4 Readiness korrigiert diesen Doku-Fix spaeter auf `S4.8`, damit Doku/QA erst nach Code- und Client-Fixes synchronisiert werden.

Korrektur der S1-Findings:

- `IP-F5` wurde in der Finding-Klassifizierung auf Pflichtziel `S4.5` geschaerft.
- S4 Readiness verschiebt `IP-F5` spaeter auf Pflichtziel `S4.8`.
- Keine neuen S1-Findings erfordern Scope-Erweiterung.

Naechster Schritt:

- `S2` kann starten.

### S2 Ergebnisprotokoll 2026-06-04

#### S2.1 Ziel gegen README, Dev-Environment und Push-Overview

Review:

- README fordert single-user, Alltagstauglichkeit und Push nur als Schutznetz.
- Dev-Environment fordert keine Deploys oder Runtime-Smokes ohne Freigabe.
- Push Overview fordert:
  - Browser/PWA als Reminder-Push-Master.
  - Diagnose getrennt von fachlichem Dedupe.
  - lokale Suppression nur bei nachweislich gesundem Remote-Pfad.

S2-Entscheidung:

- Die Edge Function bleibt im Scope, weil Off-App-Push fuer BP/Medication weiterhin produktiv sinnvoll ist.
- Der Vertrag wird aber konservativer:
  - Remote-Erfolg ist nur Transport-/Backend-Signal.
  - Sichtbare Zielgeraet-Erinnerung ist damit nicht automatisch bewiesen.
  - Lokale Fallbacks duerfen nicht zu optimistisch unterdrueckt werden.

#### S2.2 Auth- und Service-Role-Vertrag

Aktueller Stand:

- Workflow ruft die Function mit `Authorization: Bearer SUPABASE_SERVICE_ROLE_KEY` auf.
- Edge Function prueft Bearer-Token gegen `SUPABASE_SERVICE_ROLE_KEY`.
- `workflow_dispatch` und Scheduler nutzen denselben Service-Role-Pfad.

S2-Entscheidung:

- Service-Role-only bleibt richtig.
- Kein User-OAuth fuer diese Function.
- Kein offener Public-Endpoint.
- Fehlerantworten duerfen keine Secrets, Endpoints oder Tokens enthalten.

#### S2.3 Runtime-Input-Vertrag

Aktueller Stand:

- Ungueltiges JSON wird still zu `{}`.
- Explizit falsche `trigger`-/`window`-/`mode`-Werte werden still auf Defaults normalisiert.
- `dry_run` nutzt `Boolean(...)`; ein String wie `"false"` waere damit truthy.
- `now` wird als `new Date(raw.now)` gebaut und danach vor dem zentralen `try` genutzt.

S2-Zielvertrag:

- Fehlender Body ist erlaubt und bedeutet Scheduler-Default.
- Ungueltiges JSON fuehrt zu `400`.
- Body muss ein JSON-Object sein; Array, String, Zahl oder `null` fuehrt zu `400`.
- Fehlende optionale Felder nutzen Defaults:
  - `trigger=scheduler`
  - `mode=incidents`
  - `window=all`
  - `dry_run=false`
  - `now=new Date()`
- Explizit gesetzte, aber ungueltige Werte fuehren zu `400`:
  - `trigger` nur `scheduler|manual`
  - `mode` nur `incidents|diagnostic`
  - `window` nur `all|med|bp`
  - `dry_run` nur boolean
  - `user_id` nur nicht-leerer String, falls gesetzt
  - `now` nur gueltiger ISO-kompatibler Datumsstring
- `mode=diagnostic` bleibt nur mit `trigger=manual` erlaubt.

S4-Zuordnung:

- `IP-F1` bleibt Ziel `S4.1`.

#### S2.4 VAPID-/Env-Vertrag

Aktueller Stand:

- `SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY` werden fail-fast geprueft.
- `VAPID_PUBLIC_KEY` und `VAPID_PRIVATE_KEY` werden vor `webpush.setVapidDetails(...)` nicht fail-fast geprueft.
- Lokale `.env.supabase.local` enthaelt keine Secret-Werte in der Doku; gelesene Namen:
  - `SUPABASE_PROJECT_REF`
  - `INCIDENTS_PUSH_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

S2-Zielvertrag:

- Productive Web Push braucht:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `VAPID_PUBLIC_KEY`
  - `VAPID_PRIVATE_KEY`
- Fehlende Pflicht-Env muss beim Function-Start scheitern.
- Fehlertext nennt nur Variablennamen, keine Werte.
- `VAPID_SUBJECT` darf Default behalten, solange Public/Private vorhanden sind.

S4-Zuordnung:

- `IP-F2` bleibt Ziel `S4.2`.

#### S2.5 Dedupe-, Diagnostic- und Remote-Health-Vertrag

Bestehender Vertrag:

- `push_notification_deliveries` dedupliziert fachliche Remote-Events pro:
  - `user_id`
  - `day`
  - `type`
  - `severity`
  - `source=remote`
- Diagnose-Push schreibt nicht in `push_notification_deliveries`.
- Diagnose-Push schreibt nur `last_diagnostic_*`.
- `last_diagnostic_success_at` darf lokale medizinische Suppression nicht freischalten.

S2-Entscheidung:

- Event-Dedupe bleibt grundsaetzlich richtig, weil MIDAS keine Push-Schleifen will.
- Dedupe darf aber nicht als Beweis fuer sichtbare Zielgeraet-Zustellung missverstanden werden.
- Edge-Function-Response soll partial delivery besser sichtbar machen:
  - erfolgreiche Subscriptions als sichere Diagnosezusammenfassung
  - fehlgeschlagene Subscriptions als sichere Diagnosezusammenfassung
  - keine Roh-Endpunkte
  - keine Keys
- Tiefere Per-Device-Acknowledgement-Architektur ist nicht Teil dieses engen Fixes.
  - Wenn S3/S4 Readiness zeigt, dass einfache Health-Haertung nicht reicht, braucht das eine separate Roadmap.

#### S2.6 Zielgeraet-Zuverlaessigkeit

User-Feedback:

- Push hat nach der alten Cadence-/Health-Roadmap einige Tage besser funktioniert.
- In letzter Zeit wirkt Push wieder zickig.
- Wenn die Edge Function praktisch nicht verlaesslich genug ist, waeren alternative BP-Erinnerungswege zu pruefen.

S2-Lessons Learned:

- `deliveredSubscriptionCount > 0` ist zu grob fuer Alltagsverlaesslichkeit.
- Ein Desktop-Erfolg kann fachlich deduplizieren, obwohl das bevorzugte Android/PWA-Geraet nichts sichtbar angezeigt hat.
- `last_remote_success_at` ohne Ablaufalter kann lokale Fallbacks zu lange unterdruecken.
- Browser-/OS-Web-Push bestaetigt Annahme durch den Push-Dienst, aber nicht zwingend sichtbare Notification am Zielgeraet.

S2-Zielvertrag:

- Fuer lokale Suppression gilt kuenftig ein konservativerer Vertrag:
  - aktuelle Browser-Subscription muss im Backend bekannt sein.
  - diese konkrete Subscription muss einen echten Remote-Erfolg haben.
  - kein spaeterer Failure darf darueber liegen.
  - `consecutive_remote_failures` muss `0` sein.
  - der echte Remote-Erfolg muss frisch genug sein.
- Vorlaeufige S2-Entscheidung fuer Freshness:
  - `REMOTE_HEALTH_MAX_AGE_DAYS = 7` als Startwert fuer lokale Suppression.
  - Grund: lieber gelegentlich lokaler Duplicate/Fallback als stiller Ausfall.
  - S3 hat den Wert als passenden Startwert bestaetigt; S5/S7 bewerten ihn anhand echter Nutzung weiter.
- Remote-Health-Copy muss klar bleiben:
  - `remote gesund` bedeutet nicht garantiert `sichtbar am Handy angekommen`.
  - technische Details gehoeren in Touchlog/Maintenance, nicht in Profil.

S4-Zuordnung:

- `IP-F6` wird in dieser Roadmap adressiert:
  - in `app/modules/push/index.js` fuer konservativere lokale Suppression.
  - in `backend/supabase/functions/midas-incident-push/index.ts` fuer bessere partial-delivery Response-Diagnose.
- Groessere Loesungen wie per-device ACK, native Android-Notification oder eigener BP-Reminder-Kanal bleiben separate Roadmap.

#### S2.7 Scheduler-Fallback-Vertrag

Aktueller Stand:

- `resolveUserIds(...)` nutzt:
  - explizite `user_id`
  - sonst `INCIDENTS_USER_ID`
  - sonst alle aktiven `push_subscriptions.user_id`
- Lokale `.env.supabase.local` enthaelt keinen `INCIDENTS_USER_ID`-Namen.
- Der aktuelle Workflow sendet keine `user_id`.

S2-Entscheidung:

- Fuer MIDAS single-user ist der Alle-User-Fallback als Produktvertrag nicht sauber genug.
- Ziel ist fail-closed:
  - Scheduler braucht entweder `INCIDENTS_USER_ID` als Function-Env.
  - oder der Workflow/request sendet explizit `user_id`.
  - Wenn beides fehlt, soll die Function mit sicherem Fehler abbrechen statt alle Subscription-User zu scannen.
- Vor Deploy muss S5 pruefen:
  - ob remote `INCIDENTS_USER_ID` vorhanden ist oder
  - ob ein Workflow-/Secret-Pfad fuer explizite `user_id` noetig ist.

S4-Zuordnung:

- `IP-F4` wird von Watchlist zu `P2 Contract` und Ziel `S4.4`.

#### S2.8 Doku-Cron-Vertrag

Aktueller Stand:

- Workflow:
  - `17,37 8,9,10,11,12,13,14,15,18,19,20,21,22 * * *`
  - 26 regulaere Schedule-Runs pro Tag.
- Push Overview / QA:
  - nennen noch 17 regulaere Runs pro Tag und alte Cron-Gruppen.

S2-Entscheidung:

- Workflow ist aktueller Runtime-Vertrag.
- Doku/QA muessen auf 26 Runs und den kombinierten Cron synchronisiert werden.
- Keine Workflow-Aenderung nur wegen dieser Doku-Drift.

S4-Zuordnung:

- `IP-F5` bleibt Doku-/QA-Pflichtpunkt; S4 Readiness verschiebt die Umsetzung auf `S4.8`, damit der finalisierte Code-Vertrag dokumentiert wird.

#### S2.9 Alternative BP-Erinnerungswege

Bewertung:

- Edge Function bleibt aktuell die beste Off-App-Loesung, weil sie ohne geoeffnete App arbeiten kann.
- Web Push bleibt aber ein Browser-/OS-Transport und beweist keine sichtbare Zielgeraet-Zustellung.
- Alternative Wege koennen sinnvoll sein, sind aber nicht alle gleichwertig:
  - lokaler Browser-/PWA-Fallback: gut, wenn App offen oder wieder sichtbar ist; nicht ausreichend fuer Off-App.
  - Hub-/Touchlog-Hinweis: gut als Sichtbarkeit, aber keine echte Erinnerung.
  - Android-native lokale Notification/WorkManager: potenziell robuster am Handy, aber eigene Architektur und separate Roadmap.
  - Kalender-/System-Reminder: extern robust, aber nicht MIDAS-deterministisch integriert.

S2-Entscheidung:

- Diese Roadmap versucht zuerst den Edge-/Web-Push-Vertrag konservativer zu machen.
- Wenn S5 danach weiter zeigt, dass sichtbare Zielgeraet-Zustellung nicht verlaesslich genug ist, ist eine separate BP-Reminder-Roadmap sinnvoll.
- Kein alternativer BP-Reminder wird in dieser Roadmap nebenbei eingebaut.

#### S2.10 Contract Review S2

Review gegen Guardrails:

- Push bleibt Schutznetz, keine Reminder-Kette.
- Keine neuen Schwellen, keine neue medizinische Bewertung.
- Single-user-Vertrag wird gestaerkt durch fail-closed Zielnutzerlogik.
- Dedupe bleibt erhalten, aber wird nicht mehr als Sichtbarkeitsbeweis ueberinterpretiert.
- Diagnose bleibt getrennt von fachlicher Suppression.
- User-gated Runtime-Smokes bleiben Pflicht.

Findings-Korrektur:

- `IP-F1` wurde konkretisiert: nicht nur `now`, sondern JSON-Object, explizite Enums, `dry_run` und `user_id`.
- `IP-F4` wurde von Watchlist zu `P2 Contract` mit Ziel `S4.4` hochgestuft.
- `IP-F6` wurde als P1 in diese Roadmap integriert, aber groessere Per-Device-Ack-/Native-Reminder-Loesungen bleiben separate Roadmap.

Restrisiko:

- Web Push kann sichtbare Notification nicht kryptografisch bestaetigen.
- Ein konservativerer Health-Vertrag kann lokale Duplicate-Fallbacks erzeugen.
- Dieses Restrisiko ist akzeptabler als stille Ausfaelle bei BP-/Medication-Erinnerungen.

#### S2.11 Schritt-Abnahme und Doku-Sync-Entscheidung

Abnahme:

- S2 ist abgeschlossen.
- S4-Pflichtpunkte sind geschaerft:
  - `S4.1` Input-Hardening
  - `S4.2` VAPID fail-fast
  - `S4.3` Deno-Hygiene
  - `S4.4` Zielnutzer fail-closed
  - `S4.5` Zwischenreview nach Edge-Basisfixes
  - `S4.6` Zielgeraet-Zuverlaessigkeit / Remote-Health-Freshness
  - `S4.7` Edge-Partial-Delivery-Diagnose
  - `S4.8` Push-Overview-/QA-Sync
  - `S4.9` Gesamt-Code- und Contract Review

Doku-Sync-Entscheidung:

- Diese Roadmap wurde aktualisiert.
- Push Overview und QA bleiben bis `S4.8` unveraendert.
- Weitere Source-of-Truth-Doku wird erst nach Umsetzung und S5/S6 final synchronisiert.

Naechster Schritt:

- `S3` kann starten.

### S3 Ergebnisprotokoll 2026-06-04

#### S3.1 Bruchrisiken

Geprueft:

- `app/modules/push/index.js`
- `app/modules/incidents/index.js`
- `service-worker.js`
- `backend/supabase/functions/midas-incident-push/index.ts`
- `docs/modules/Push Module Overview.md`
- `docs/QA_CHECKS.md`

Bruchrisiken:

- Stille Ausfaelle:
  - `deliveredSubscriptionCount > 0` beweist nur mindestens eine angenommene Subscription, nicht sichtbare Zustellung am bevorzugten Zielgeraet.
  - Ein Desktop-Erfolg kann aktuell ein Event deduplizieren, obwohl Android/PWA nichts sichtbar gezeigt hat.
- Falsche Sicherheit:
  - `remoteHealthy` hat aktuell kein Ablaufalter.
  - Ein alter `last_remote_success_at` kann lokale Suppression zu lange aktivieren.
  - Debug-Text `reason=remote-healthy` klingt staerker als der technische Beweis.
- Falscher Alarm:
  - Mehrere oder alte Subscriptions koennen Touchlog-Health nervoes wirken lassen.
  - Das ist akzeptabel, solange Copy und Diagnose nicht als harter User-Fehler formuliert werden.
- Dedupe-/Race-Probleme:
  - Event-Dedupe bleibt fachlich richtig, weil MIDAS keine Push-Schleifen erzeugen soll.
  - Dedupe darf aber nicht mit Zielgeraet-Sichtbarkeit gleichgesetzt werden.
- Diagnose-vs.-fachliche Suppression:
  - Diagnose bleibt korrekt getrennt.
  - `last_diagnostic_success_at` darf weiterhin keine lokale Suppression freischalten.
- Scheduler-Jitter:
  - Weiter akzeptierter Tradeoff.
  - Kein Grund fuer Schwellen- oder Workflow-Umbau in dieser Roadmap.
- Doku-/Code-Drift:
  - Push Overview und QA nennen noch alte 17-Run-Kadenz.
  - Aktueller Workflow hat 26 Runs pro Tag.

S3-Entscheidung:

- `IP-F6` bleibt in dieser Roadmap, aber auf zwei Umsetzungsachsen getrennt:
  - Client-Health/Freshness fuer lokale Suppression.
  - Edge-Response-Diagnose fuer partial delivery.
- `REMOTE_HEALTH_MAX_AGE_DAYS = 7` bleibt fuer S4.6 der passende Startwert:
  - konservativ genug, um alte Remote-Erfolge nicht wochenlang zu vertrauen.
  - nicht so kurz, dass normale Wochenend-/Terminpausen staendig lokale Duplicates erzeugen.
  - wird nach S5 und ueber S7 anhand echter Alltagserfahrung weiter bewertet.
- Per-Device ACK, native Android Reminder und eigener BP-Reminder-Kanal bleiben `S7`/Future-Scope.

#### S3.2 User-Facing Copy Review

Medication-Copy:

- Reminder- und Incident-Copy bleiben fachlich passend.
- Kein neues Finding fuer Medication-Text.

BP-Copy:

- `Abend-Blutdruck fehlt` und `Bitte den Blutdruck fuer heute Abend jetzt messen.` bleiben passend.
- Kein neues medizinisches oder UI-Copy-Finding.

Diagnose-Push-Copy:

- Diagnose bleibt technisch und darf keine fachliche Suppression beweisen.
- Kein neues Finding, solange S4 keine Copy auf `sichtbar angekommen` erweitert.

Edge-Response-/Debug-Copy:

- `reason=remote-healthy` ist intern, aber zu stark formuliert.
- S4.6 soll bei Client-Suppression eine neutralere technische Interpretation dokumentieren oder den Debug-Grund sauberer benennen.
- S4.7 soll Response-Diagnose als `subscription accepted/failed` oder vergleichbar sicher formulieren, nicht als `device visible`.

Touchlog-/Status-Vertrag:

- `remote gesund` darf nur technische Remote-Health meinen.
- Nach S4/S6 muss Push Overview klarstellen:
  - Remote-Erfolg ist Transport-/Subscription-Erfolg.
  - Sichtbare Zielgeraet-Zustellung ist damit nicht absolut garantiert.

#### S3.3 Tooling und lokale Checks

Lokal sinnvoll:

- `deno check backend/supabase/functions/midas-incident-push/index.ts`
- `deno lint backend/supabase/functions/midas-incident-push/index.ts`
- `node --check app/modules/push/index.js`, falls `app/modules/push/index.js` geaendert wird.
- `node --check app/modules/incidents/index.js`, falls `app/modules/incidents/index.js` geaendert wird.
- `git diff --check`
- `rg`-Scans fuer:
  - `remoteHealthy`
  - `localSuppressionAllowed`
  - `last_remote_success_at`
  - `17 geplante Runs`
  - `remote gesund`
  - `deliveredSubscriptions`

Nur nach User-Freigabe:

- Supabase Deploy.
- Remote Dry-Run.
- Manueller Diagnose-Push.
- GitHub Workflow-Smoke.
- Zielgeraet-Smoke mit echter Notification.

#### S3.4 S4-Substeps

S3-Finding:

- Der bisherige `S4.6` war zu breit.
- Client-Suppression und Edge-Partial-Delivery muessen getrennt umgesetzt und reviewt werden.

Korrektur:

- `S4.6` bleibt Zielgeraet-Zuverlaessigkeit / Remote-Health-Freshness im Client.
- `S4.7` wird Edge-Partial-Delivery-Diagnose.
- Gesamt-Code- und Contract Review wandert auf `S4.8`.
- S4 Readiness schaerft diesen Schnitt spaeter weiter:
  - `S4.5` wird Zwischenreview nach Edge-Basisfixes.
  - `S4.8` wird Push-Overview-/QA-Sync.
  - Gesamt-Code- und Contract Review wandert weiter auf `S4.9`.

Voraussichtliche Reihenfolge:

- `S4.1` Input-Hardening zuerst, weil invalides `now` aktuell vor zentralem `try` brechen kann.
- `S4.2` Env-Fail-fast danach, weil fehlende VAPID Keys produktive Sendefehler sonst spaet erzeugen.
- `S4.3` Deno-Hygiene danach, damit lokale Checks als harte Gates dienen.
- `S4.4` Zielnutzer fail-closed, weil Scheduler-Zielvertrag vor Deploy klar sein muss.
- `S4.5` Cron-Doku/QA-Sync, weil Workflow selbst nicht geaendert wird.
- `S4.6` Client-Health-Freshness, weil lokale Suppression die Alltagssicherheit beeinflusst.
- `S4.7` Edge-Partial-Delivery-Diagnose, weil Response-Auswertung fuer S5/Smokes gebraucht wird.
- `S4.8` Gesamt-Review.

Readiness-Korrektur:

- Final gilt die Substep-Liste aus `S4 - Umsetzung`:
  - Doku/QA-Sync erst in `S4.8`.
  - Gesamt-Code- und Contract Review in `S4.9`.

#### S3.5 S4 Readiness Vorbereitung

Betroffene Dateien:

- `backend/supabase/functions/midas-incident-push/index.ts`
- `app/modules/push/index.js`
- `docs/modules/Push Module Overview.md`
- `docs/QA_CHECKS.md`
- diese Roadmap

Voraussichtlich nicht betroffen:

- `app/modules/incidents/index.js`
- `service-worker.js`
- SQL/RLS
- Medication-/BP-Schwellen
- GitHub Workflow-Cron

S5-Pflichtchecks:

- Edge:
  - `deno check`
  - `deno lint`
- Client, falls geaendert:
  - `node --check app/modules/push/index.js`
- Doku:
  - `git diff --check`
  - `rg`-Scans gegen alte Cron-/Health-Formulierungen
- Runtime:
  - nur user-gated.

#### S3.6 Contract Review S3

Review gegen Ziel:

- Kein Code wurde geaendert.
- Keine neue Reminder-Kette wurde eingefuehrt.
- Keine Medication-/BP-Schwellen wurden angefasst.
- `IP-F6` bleibt klein genug fuer diese Roadmap:
  - Freshness/Health im bestehenden Client-Vertrag.
  - bessere Edge-Diagnose im bestehenden Response-Vertrag.
- Groessere Architektur bleibt sauber in `S7`/Future-Scope.

Findings:

- `S4.6` war zu grob geschnitten.

Korrektur:

- `S4.6`/`S4.7`/`S4.8` wurden neu zugeschnitten.
- Finding-Klassifizierung fuer `IP-F6` wurde auf `S4.6` und `S4.7` aktualisiert.

Restrisiko:

- Auch nach S4 kann Web Push sichtbare Zielgeraet-Zustellung nicht absolut beweisen.
- Das Restrisiko ist dokumentiert und wird nach S6 ueber `S7` weiter beobachtet.

#### S3.7 Schritt-Abnahme und Doku-Sync-Entscheidung

Abnahme:

- S3 ist abgeschlossen.
- Bruchrisiken, Copy-Vertrag, Tooling und S4-Schnitt sind dokumentiert.
- Naechster Schritt ist der explizite `S4 Readiness Review`.

Doku-Sync-Entscheidung:

- Diese Roadmap wurde aktualisiert.
- Push Overview und QA bleiben bis `S4.8` unveraendert, damit Doku nicht vor Code/Review laeuft.

### S4 Readiness Review Ergebnisprotokoll 2026-06-04

#### Gate-Fragen und Entscheidungen

`IP-F4`:

- Wird als Code-Fix umgesetzt, nicht als Watchlist.
- Begruendung:
  - Der Workflow sendet aktuell keine `user_id`.
  - Der All-User-Fallback widerspricht dem MIDAS-Single-User-Vertrag.
  - Fail-closed ist langfristig robuster als implizites Scannen aller aktiven Subscriptions.
- Umsetzung:
  - `resolveUserIds(...)` nutzt explizite `user_id` oder `INCIDENTS_USER_ID`.
  - Wenn beides fehlt, liefert die Function einen klaren Fehler.

`IP-F6`:

- Bleibt in dieser Roadmap, aber nur als bestehende Web-Push-Haertung.
- Umsetzung:
  - `S4.6` Client-Health/Freshness.
  - `S4.7` Edge-Partial-Delivery-Diagnose.
- Nicht Teil dieser Roadmap:
  - Per-Device ACK.
  - Native Android Reminder.
  - eigener BP-Reminder-Kanal.
  - externe System-/Kalender-Reminder.

Input-Parsing:

- Auth bleibt vor Body-Parsing.
- Body-Parsing und Normalisierung muessen vor jeder Datumsableitung passieren.
- Invalides JSON, Nicht-Object-Body, falsche Enums, falsches `dry_run`, leere `user_id` und ungueltiges `now` muessen `400` liefern.
- Missing/empty body bleibt erlaubt, damit Scheduler-Defaults funktionieren.

Env-Initialisierung:

- Env-Guard bleibt auf Modulebene.
- Pflicht-Env muss vor `createClient(...)` und `webpush.setVapidDetails(...)` validiert werden.
- `VAPID_PUBLIC_KEY` und `VAPID_PRIVATE_KEY` werden Pflicht.
- `VAPID_SUBJECT` darf Default behalten.
- Fehlermeldungen nennen nur Variablennamen, keine Werte.

`dry_run`, `diagnostic`, `incidents`:

- Trennung bleibt ausreichend.
- Diagnostic bleibt nur fuer `trigger=manual`.
- `dry_run` darf keine Remote-Health-/Delivery-Writes erzeugen.
- Productive Sendepfad bleibt getrennt von Diagnose und Dry-Run.

Dedupe:

- Event-Dedupe auf Nutzer-Ereignis-Ebene bleibt richtig.
- Dedupe verhindert Schleifen und doppelte Remote-Events.
- Dedupe darf aber in Response/Doku nicht als sichtbarer Zielgeraet-Beweis beschrieben werden.

Doku/Code-Trennung:

- Doku-Cron-Fix wird nach hinten verschoben.
- Begruendung:
  - Push Overview und QA sollen den finalen Code-Vertrag beschreiben.
  - Code-Fixes, Client-Health und Edge-Partial-Delivery sollen vorher feststehen.
- Finaler Doku-/QA-Sync ist `S4.8`.

Runtime-Smokes:

- Deploy, Remote Dry-Run, Diagnose-Push, GitHub Workflow-Smoke und Zielgeraet-Smoke bleiben user-gated.

#### Finale S4-Reihenfolge

- `S4.1` Request-Input-Hardening.
- `S4.2` Env-Fail-fast.
- `S4.3` Deno-Hygiene.
- `S4.4` Zielnutzer fail-closed.
- `S4.5` Zwischenreview nach Edge-Basisfixes.
- `S4.6` Client-Health-Freshness.
- `S4.7` Edge-Partial-Delivery-Diagnose.
- `S4.8` Push-Overview-/QA-Sync.
- `S4.9` Gesamt-Code- und Contract Review.

#### Betroffene Dateien nach Readiness

Code:

- `backend/supabase/functions/midas-incident-push/index.ts`
- `app/modules/push/index.js`

Doku:

- `docs/modules/Push Module Overview.md`
- `docs/QA_CHECKS.md`
- diese Roadmap

Read-only:

- `.github/workflows/incidents-push.yml`
- `app/modules/incidents/index.js`
- `service-worker.js`

Nicht betroffen:

- SQL/RLS.
- Medication-/BP-Schwellen.
- Service-Worker-Notification-UX.
- Touchlog-UI.
- GitHub Workflow-Cron.

#### Pflichtchecks nach Readiness

Nach Edge-Fixes:

- `deno check backend/supabase/functions/midas-incident-push/index.ts`
- `deno lint backend/supabase/functions/midas-incident-push/index.ts`

Nach Client-Fix:

- `node --check app/modules/push/index.js`

Immer:

- `git diff --check`
- `rg`-Scans gegen:
  - `17 geplante Runs`
  - `remote gesund`
  - `localSuppressionAllowed`
  - `REMOTE_HEALTH_MAX_AGE_DAYS`
  - `deliveredSubscriptions`

#### Contract Review S4 Readiness

Review gegen Ziel:

- S4 ist jetzt sequenziell umsetzbar.
- Code-Fixes sind vor Doku-Sync platziert.
- `IP-F4` ist nicht mehr offen als Grundsatzfrage.
- `IP-F6` ist klein genug fuer diese Roadmap und fuehrt nicht zu neuer Reminder-Architektur.
- Deploy und produktive Smokes bleiben geblockt bis User-Freigabe.

Findings:

- Alter S4-Schnitt hatte Doku/QA-Sync zu frueh.
- `S4.6`/`S4.7` brauchten einen nachgelagerten Gesamt-Review.

Korrektur:

- `S4.5` wurde Zwischenreview nach Edge-Basisfixes.
- `S4.8` wurde Push-Overview-/QA-Sync.
- `S4.9` wurde Gesamt-Code- und Contract Review.
- `IP-F5` wurde auf `S4.8` aktualisiert.

Restrisiko:

- Web Push bleibt transportseitig und kann sichtbare Zielgeraet-Zustellung nicht absolut beweisen.
- Dieses Restrisiko wird durch `S4.6`, `S4.7`, S5-Zielgeraet-Smoke und S7-Follow-up transparent gehalten.

#### Schritt-Abnahme

- S4 Readiness Review ist abgeschlossen.
- Naechster Schritt ist `S4.1`.

### S4.1 Ergebnisprotokoll 2026-06-04

#### Umsetzung

Betroffene Datei:

- `backend/supabase/functions/midas-incident-push/index.ts`

Umgesetzt:

- Alte weiche `req.json().catch(() => ({}))`-Logik entfernt.
- Body-Parsing auf `req.text()` umgestellt:
  - leerer oder Whitespace-only Body bleibt erlaubt und nutzt Scheduler-Defaults.
  - nicht-leerer Body muss valides JSON sein.
  - ungueltiges JSON liefert `400`.
- Body-Shape validiert:
  - nur JSON-Object erlaubt.
  - Array, String, Number und `null` liefern `400`.
- Input-Normalisierung auf `Record<string, unknown>` umgestellt.
- Explizite Enums validiert:
  - `trigger`: `manual` oder `scheduler`.
  - `mode`: `incidents` oder `diagnostic`.
  - `window`: `all`, `med` oder `bp`.
- `dry_run` wird nur als Boolean akzeptiert.
- `user_id` wird nur als nicht-leerer String akzeptiert.
- `now` wird als ISO-Zeitpunkt validiert:
  - ISO-Date-Prefix erforderlich.
  - echte Kalendertage werden per UTC-Roundtrip geprueft.
  - invalides Date-Rolling wie `2026-02-31` wird abgelehnt.
- Datumsableitung (`toDayIsoTz`, `toISOString`, `getDatePartsInTz`) passiert erst nach erfolgreicher Validation.
- Validation-Fehler werden als `400` zurueckgegeben.
- Runtime-/Push-Fehler bleiben `500` mit redigiertem Fehlertext.

#### Lokale Checks

- `deno check backend/supabase/functions/midas-incident-push/index.ts`: gruen.
- `deno lint backend/supabase/functions/midas-incident-push/index.ts`: weiterhin exakt bekanntes `IP-F3` (`no-unversioned-import`), kein neues S4.1-Lint-Finding.

#### Code Review S4.1

Geprueft:

- Auth bleibt vor Body-Parsing.
- Empty Body bleibt Scheduler-kompatibel.
- Ungueltiges JSON wird nicht mehr still geschluckt.
- Nicht-Object-Payloads laufen nicht mehr in Defaults.
- Invalides `now` kann nicht mehr vor dem zentralen Fehlerpfad in `toISOString()` crashen.
- `2026-02-31` kann nicht mehr durch JS-Date-Rolling in Maerz verschoben werden.

Finding:

- S4.1-CR-F1:
  - Erste Implementierung nutzte `new Date(...)` mit reiner `Number.isFinite(...)`-Pruefung.
  - Das haette `2026-02-31` still als Maerz akzeptieren koennen.

Korrektur:

- `parseNowInput(...)` mit ISO-Date-Prefix und UTC-Kalendertag-Roundtrip ergaenzt.

#### Contract Review S4.1

Review gegen S4.1-Vertrag:

- Auth vor Body-Parsing: erfuellt.
- Missing/empty body erlaubt: erfuellt.
- Ungueltiges JSON liefert `400`: erfuellt.
- Body muss Object sein: erfuellt.
- Enums werden explizit validiert: erfuellt.
- `dry_run` nur Boolean: erfuellt.
- `user_id` nur nicht-leerer String: erfuellt.
- `now` gueltiger ISO-Zeitpunkt: erfuellt.
- Datumsableitung erst nach Validation: erfuellt.

Nicht beruehrt:

- Env-Fail-fast.
- Deno-Hygiene / JSR-Version.
- Zielnutzer-Fallback.
- Push-Schwellen.
- Dedupe.
- Partial Delivery.
- Client-Health.
- Doku/QA.

Restrisiko:

- `now` akzeptiert Date-only ISO (`YYYY-MM-DD`) und ISO-DateTime mit `T`.
- Das ist fuer manuelle Dry-Runs ausreichend und konservativer als freie JS-Date-Strings.

#### Schritt-Abnahme

- `IP-F1` ist abgeschlossen.
- S4.1 ist abgeschlossen.
- Naechster Schritt ist `S4.2`.

### S4.2 Ergebnisprotokoll 2026-06-04

#### Umsetzung

Betroffene Datei:

- `backend/supabase/functions/midas-incident-push/index.ts`

Umgesetzt:

- Env-Guard erweitert und vor `createClient(...)` sowie `webpush.setVapidDetails(...)` belassen.
- Pflicht-Env wird jetzt gemeinsam geprueft:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `VAPID_PUBLIC_KEY`
  - `VAPID_PRIVATE_KEY`
- Fehlende Pflicht-Env erzeugt fail-fast:
  - Fehlertext: `[midas-incident-push] Missing required env: ...`
  - Ausgabe enthaelt nur Variablennamen, keine Secret-Werte.
- `VAPID_SUBJECT` bleibt optional und darf den bestehenden Default behalten.

#### Lokale Checks

- `deno check backend/supabase/functions/midas-incident-push/index.ts`: gruen.
- `deno lint backend/supabase/functions/midas-incident-push/index.ts`: weiterhin exakt bekanntes `IP-F3` (`no-unversioned-import`), kein neues S4.2-Lint-Finding.

#### Code Review S4.2

Geprueft:

- Env-Guard liegt vor Supabase Client-Erzeugung.
- Env-Guard liegt vor Web-Push-VAPID-Initialisierung.
- VAPID Public/Private Keys koennen nicht mehr erst beim produktiven Sendepfad auffallen.
- Fehlertext enthaelt keine Werte.
- `VAPID_SUBJECT` wurde nicht unnoetig zur Pflicht gemacht.

Finding:

- S4.2-CR-F1:
  - Der erste Typ-Feinschliff deklarierte `requiredEnv` faelschlich als Tuple-Array, obwohl nach `.map(...)` ein `string[]` entsteht.
  - `deno check` schlug dadurch fehl.

Korrektur:

- Tuple-Typisierung auf die Source-Liste begrenzt und `requiredEnv` als Ergebnis der Filter-/Map-Kette inferieren lassen.
- `deno check` danach wieder gruen.

#### Contract Review S4.2

Review gegen S4.2-Vertrag:

- Env-Guard vor `createClient(...)`: erfuellt.
- Env-Guard vor `webpush.setVapidDetails(...)`: erfuellt.
- VAPID Public/Private Keys Pflicht: erfuellt.
- Supabase Pflicht-Env weiter Pflicht: erfuellt.
- `VAPID_SUBJECT` optional: erfuellt.
- Keine Secret-Werte im Fehlertext: erfuellt.

Nicht beruehrt:

- Deno-Hygiene / JSR-Version.
- Zielnutzer-Fallback.
- Push-Schwellen.
- Dedupe.
- Partial Delivery.
- Client-Health.
- Doku/QA.

Restrisiko:

- Produktiv muss vor Deploy geprueft werden, dass die Supabase Function Secrets `VAPID_PUBLIC_KEY` und `VAPID_PRIVATE_KEY` gesetzt sind.
- Diese Remote-Pruefung bleibt S5/user-gated und wird nicht lokal erzwungen.

#### Schritt-Abnahme

- `IP-F2` ist abgeschlossen.
- S4.2 ist abgeschlossen.
- Naechster Schritt ist `S4.3`.

### S4.3 Ergebnisprotokoll 2026-06-04

#### Umsetzung

Betroffene Datei:

- `backend/supabase/functions/midas-incident-push/index.ts`

Umgesetzt:

- `functions-js`-Side-Effect-Import versioniert:
  - von `jsr:@supabase/functions-js/edge-runtime.d.ts`
  - auf `jsr:@supabase/functions-js@2/edge-runtime.d.ts`
- Drei obsolete `@ts-ignore`-Kommentare entfernt:
  - Edge-Runtime-Side-Effect-Import.
  - Supabase-JSR-Import.
  - npm-Web-Push-Import.

#### Lokale Checks

- `deno check backend/supabase/functions/midas-incident-push/index.ts`: gruen.
- `deno lint backend/supabase/functions/midas-incident-push/index.ts`: gruen.

#### Code Review S4.3

Geprueft:

- Import-Versionierung entspricht dem bereits sauberen Pattern aus `midas-monthly-report`.
- Supabase-JSR-Import bleibt versioniert mit `@2`.
- npm-Web-Push-Import bleibt unveraendert.
- Keine Runtime-Logik wurde geaendert.
- Keine Input-/Env-/Dedupe-/Push-Entscheidung wurde geaendert.

Findings:

- Keine neuen S4.3-Findings nach Checks.

Korrektur:

- Nicht erforderlich.

#### Contract Review S4.3

Review gegen S4.3-Vertrag:

- Versionierter `functions-js`-Import: erfuellt.
- Obsolete `@ts-ignore`-Kommentare entfernt: erfuellt.
- `deno check` gruen: erfuellt.
- `deno lint` gruen: erfuellt.
- Keine fachliche Runtime-Aenderung: erfuellt.

Nicht beruehrt:

- Zielnutzer-Fallback.
- Push-Schwellen.
- Dedupe.
- Partial Delivery.
- Client-Health.
- Doku/QA.

Restrisiko:

- Andere Edge Functions im Repo enthalten teilweise noch unversionierte `functions-js`-Imports.
- Das ist nicht Teil dieser Roadmap und nicht Teil von `midas-incident-push`.

#### Schritt-Abnahme

- `IP-F3` ist abgeschlossen.
- S4.3 ist abgeschlossen.
- Naechster Schritt ist `S4.4`.

### S4.4 Ergebnisprotokoll 2026-06-04

#### Umsetzung

Betroffene Datei:

- `backend/supabase/functions/midas-incident-push/index.ts`

Umgesetzt:

- All-User-Fallback aus `resolveUserIds(...)` entfernt.
- Zielnutzer-Aufloesung ist jetzt fail-closed:
  - explizite `user_id` aus Request wird verwendet, falls vorhanden.
  - sonst `INCIDENTS_USER_ID` aus Function-Env wird verwendet, falls vorhanden.
  - sonst wirft die Function einen klaren Fehler.
- Die Function scannt nicht mehr alle aktiven `push_subscriptions.user_id`.
- `resolveUserIds(...)` ist synchron, weil keine Datenbankabfrage mehr noetig ist.

#### Lokale Checks

- `deno check backend/supabase/functions/midas-incident-push/index.ts`: gruen.
- `deno lint backend/supabase/functions/midas-incident-push/index.ts`: gruen.

#### Code Review S4.4

Geprueft:

- Explizite `user_id` hat Prioritaet.
- `INCIDENTS_USER_ID` bleibt Scheduler-/Default-Pfad.
- Ohne Zielnutzer gibt es keinen All-User-Scan mehr.
- Fehlermeldung nennt nur Contract-/Env-Namen, keine Secret-Werte.
- Workflow wurde nicht geaendert.
- SQL/RLS wurde nicht geaendert.

Finding:

- S4.4-CR-F1:
  - Nach Entfernen der Datenbankabfrage war `resolveUserIds(...)` noch `async`.
  - `deno lint` meldete `require-await`.

Korrektur:

- `async` aus `resolveUserIds(...)` entfernt.
- `await` am Aufruf entfernt.
- `deno check` und `deno lint` danach gruen.

#### Contract Review S4.4

Review gegen S4.4-Vertrag:

- Code-Fix statt Watchlist: erfuellt.
- Explizite `user_id` erlaubt: erfuellt.
- `INCIDENTS_USER_ID` erlaubt: erfuellt.
- Kein All-User-Fallback: erfuellt.
- Klarer Fehler bei fehlendem Zielnutzer: erfuellt.
- Keine Secret-Werte im Fehlertext: erfuellt.

Workflow-Vertrag:

- `.github/workflows/incidents-push.yml` sendet weiterhin keine `user_id`.
- Damit braucht der produktive Scheduler-Pfad zwingend `INCIDENTS_USER_ID` als Supabase Function Secret.
- Diese Remote-Pruefung bleibt S5/user-gated und wird nicht in S4.4 ausgefuehrt.

Nicht beruehrt:

- Env-Fail-fast ausserhalb des bereits abgeschlossenen S4.2.
- Push-Schwellen.
- Dedupe.
- Partial Delivery.
- Client-Health.
- Doku/QA.

Restrisiko:

- Wenn `INCIDENTS_USER_ID` remote fehlt und der Workflow keine `user_id` sendet, wird der Scheduler bewusst fehlschlagen.
- Das ist der gewollte fail-closed Vertrag und besser als ein stiller All-User-Scan.

#### Schritt-Abnahme

- `IP-F4` ist abgeschlossen.
- S4.4 ist abgeschlossen.
- Naechster Schritt ist `S4.5`.

### S4.5 Ergebnisprotokoll 2026-06-04

#### Ziel

- `S4.1` bis `S4.4` gemeinsam gegen Auth, Input, Env und Zielnutzervertrag pruefen.
- Erst nach gruenem Zwischenreview mit Client-/Doku-Schritten weitermachen.

#### Gepruefte Dateien

- `backend/supabase/functions/midas-incident-push/index.ts`
- `.github/workflows/incidents-push.yml`
- diese Roadmap

#### Lokale Checks

- `deno check backend/supabase/functions/midas-incident-push/index.ts`: gruen.
- `deno lint backend/supabase/functions/midas-incident-push/index.ts`: gruen.
- `git diff --check`: gruen.
- `rg`-Scans:
  - alte `req.json().catch(() => ({}))`-/`req.json`-Muster: keine Treffer.
  - alte `@ts-ignore`-/unversionierte `functions-js`-Muster in `midas-incident-push`: keine Treffer.
  - Zielnutzer-/Env-/Input-Pfade vorhanden:
    - `readInput`
    - `parseNowInput`
    - `resolveUserIds`
    - `INCIDENTS_USER_ID`
    - `VAPID_PUBLIC_KEY`
    - `VAPID_PRIVATE_KEY`

#### Code Review S4.5

Auth:

- `OPTIONS` und Method-Gate bleiben vor Auth.
- Service-Role-Auth bleibt vor Body-Parsing.
- Unauthorized Requests koennen den Body nicht triggern.

Input:

- Empty Body bleibt Scheduler-kompatibel.
- Nicht-leerer Body muss valides JSON-Object sein.
- Enums, `dry_run`, `user_id` und `now` werden vor Datumsableitung validiert.
- Validation-Fehler liefern `400`.

Env:

- Supabase- und VAPID-Pflicht-Env wird fail-fast vor Client-/Web-Push-Initialisierung geprueft.
- Fehlertext nennt nur Env-Namen.

Zielnutzer:

- Explizite `user_id` und `INCIDENTS_USER_ID` sind die einzigen Zielnutzerpfade.
- All-User-Fallback ist entfernt.
- Ohne Zielnutzer wird bewusst fail-closed abgebrochen.

Deno-Hygiene:

- `functions-js`-Import ist versioniert.
- Keine `@ts-ignore`-Kommentare in `midas-incident-push`.
- `deno check` und `deno lint` sind gruen.

#### Contract Review S4.5

Review gegen S4.5-Vertrag:

- `S4.1` bis `S4.4` gemeinsam geprueft: erfuellt.
- Edge-Basisfixes sind stabil genug fuer Client-/Doku-Schritte: erfuellt.
- Keine neuen P0/P1-Findings: erfuellt.
- Keine Push-Schwellen, Dedupe-Regeln oder Notification-UX geaendert: erfuellt.
- Deploy und produktive Smokes bleiben user-gated: erfuellt.

Findings:

- Keine neuen Code- oder Contract-Findings.
- Ein `rg`-Pruefbefehl hatte zunaechst ein PowerShell-Quoting-Problem; der Scan wurde mit einfachen Patterns wiederholt und war sauber.

Korrektur:

- Keine Code-Korrektur erforderlich.

Restrisiko:

- Produktiver Scheduler braucht nach S4.4 zwingend `INCIDENTS_USER_ID` als Supabase Function Secret oder einen Request mit `user_id`.
- Diese Remote-Pruefung bleibt S5/user-gated.
- Client-Health-Freshness und Partial-Delivery-Diagnose sind noch offen und folgen in `S4.6`/`S4.7`.

#### Schritt-Abnahme

- S4.5 ist abgeschlossen.
- Naechster Schritt ist `S4.6`.

### S4.6 Ergebnisprotokoll 2026-06-04

#### Umsetzung

Betroffene Dateien:

- `app/modules/push/index.js`
- `app/modules/incidents/index.js`

Umgesetzt:

- `REMOTE_HEALTH_MAX_AGE_DAYS = 7` im Push-Modul ergaenzt.
- `REMOTE_HEALTH_MAX_AGE_MS` als daraus abgeleitete Freshness-Grenze ergaenzt.
- `REMOTE_HEALTH_FUTURE_TOLERANCE_MS = 5 * 60 * 1000` ergaenzt, damit stark zukuenftige Remote-Erfolge nicht als gesund gelten.
- `isRemoteSubscriptionHealthy(...)` ist konservativer:
  - aktuelle Backend-Subscription muss vorhanden sein.
  - Subscription darf nicht disabled sein.
  - echter `last_remote_success_at` muss vorhanden sein.
  - kein spaeterer `last_remote_failure_at` darf vorliegen.
  - `consecutive_remote_failures` muss `0` sein.
  - Remote-Erfolg muss maximal 7 Tage alt sein.
  - stark in der Zukunft liegende Remote-Erfolge werden abgelehnt.
- `localSuppressionAllowed` bleibt exakt an `remoteHealthy` gebunden.
- Interner Incidents-Debuggrund geaendert:
  - von `reason=remote-healthy`
  - auf `reason=recent-remote-transport`

#### Lokale Checks

- `node --check app/modules/push/index.js`: gruen.
- `node --check app/modules/incidents/index.js`: gruen.
- `git diff --check`: gruen.

Hinweis:

- Git meldet fuer `app/modules/incidents/index.js` einen CRLF/LF-Hinweis beim Diff, aber keinen `diff --check`-Fehler.

#### Code Review S4.6

Geprueft:

- Der bestehende Konsum in `app/modules/incidents/index.js` bleibt ueber `shouldSuppressLocalPushes()`.
- Keine Medication-/BP-Schwellen wurden geaendert.
- Keine lokale Reminder-Kette wurde eingefuehrt.
- Keine Service-Worker-Notification-UX wurde geaendert.
- `last_diagnostic_success_at` schaltet weiterhin keine lokale Suppression frei.
- `localSuppressionAllowed` wird nicht von Diagnosewerten abgeleitet.
- Debug-Sprache vermeidet den zu starken Begriff `remote-healthy`.

Finding:

- S4.6-CR-F1:
  - Erste Freshness-Fassung haette stark zukuenftige `last_remote_success_at`-Werte rechnerisch als frisch akzeptiert.

Korrektur:

- `REMOTE_HEALTH_FUTURE_TOLERANCE_MS` ergaenzt.
- Remote-Erfolge, die mehr als 5 Minuten in der Zukunft liegen, gelten nicht als gesund.

#### Contract Review S4.6

Review gegen S4.6-Vertrag:

- 7-Tage-Freshness umgesetzt: erfuellt.
- `remoteHealthy` nur bei echter aktueller Subscription: erfuellt, weil die Abfrage weiterhin auf aktuellem Endpoint basiert.
- echter Remote-Erfolg erforderlich: erfuellt.
- kein spaeterer Failure: erfuellt.
- `consecutive_remote_failures = 0`: erfuellt.
- Erfolg frisch genug: erfuellt.
- `localSuppressionAllowed` exakt an konservative Health gebunden: erfuellt.
- `app/modules/incidents/index.js` nur minimal fuer Debug-Sprache beruehrt: erfuellt.
- Keine sichtbare Zielgeraet-Zustellung behauptet: erfuellt.

Nicht beruehrt:

- Edge-Partial-Delivery-Diagnose.
- Remote-Dedupe.
- Supabase Deploy.
- GitHub Workflow.
- Push Overview / QA.

Restrisiko:

- Web Push beweist weiterhin keine sichtbare Zielgeraet-Zustellung.
- S4.6 reduziert nur das Risiko, dass alte Remote-Erfolge lokale Fallbacks zu lange unterdruecken.
- Partial Delivery wird erst in `S4.7` besser diagnostiziert.

#### Schritt-Abnahme

- Client-Health/Freshness-Teil von `IP-F6` ist abgeschlossen.
- `IP-F6` bleibt bis S4.7 insgesamt `partial`.
- S4.6 ist abgeschlossen.
- Naechster Schritt ist `S4.7`.

### S4.7 Ergebnisprotokoll 2026-06-04

#### Umsetzung

Betroffene Datei:

- `backend/supabase/functions/midas-incident-push/index.ts`

Umgesetzt:

- Normale Incident-/Reminder-Sendepfade nutzen jetzt ebenfalls `buildSubscriptionDiagnosticSummary(...)`.
- Pro Event werden erfolgreiche Subscription-Annahmen in `acceptedSubscriptions` gesammelt.
- Pro Event werden fehlgeschlagene Subscription-Annahmen in `failedSubscriptions` gesammelt.
- `sentEvents` enthaelt jetzt:
  - `type`
  - `severity`
  - `deliveredSubscriptions` als bestehenden Count
  - `acceptedSubscriptions`
  - `failedSubscriptions`
- Top-level `failed`-Eintraege enthalten zusaetzlich sichere Subscription-Zusammenfassung.
- Keine Roh-Endpunkte, keine `p256dh`-Keys und keine `auth`-Keys werden in Responses ausgegeben.

Sichere Subscription-Zusammenfassung:

- `endpointHash`
- `clientContext`
- `clientPlatform`
- `clientBrowser`
- `clientLabel`

#### Lokale Checks

- `deno check backend/supabase/functions/midas-incident-push/index.ts`: gruen.
- `deno lint backend/supabase/functions/midas-incident-push/index.ts`: gruen.

#### Code Review S4.7

Geprueft:

- `buildSubscriptionDiagnosticSummary(...)` gibt nur sichere Metadaten aus.
- `buildWebPushSub(...)` nutzt intern weiterhin Endpoint und Keys, gibt sie aber nicht in Response-Strukturen weiter.
- `failedEvents` enthalten jetzt sichere Subscription-Diagnose plus redigierten Fehler.
- `sentEvents` machen Partial Delivery sichtbar:
  - welche Subscriptions angenommen wurden.
  - welche Subscriptions beim selben Event fehlgeschlagen sind.
- `recordDelivery(...)` und `deliveredKeys` bleiben unveraendert.
- Event-Dedupe bleibt auf Nutzer-/Tag-/Typ-/Severity-/Source-Ebene.
- Keine neue Per-Device-ACK-Semantik wurde eingefuehrt.

Findings:

- Keine neuen S4.7-Findings nach Checks.

Korrektur:

- Nicht erforderlich.

#### Contract Review S4.7

Review gegen S4.7-Vertrag:

- erfolgreiche Subscriptions sicher zusammengefasst: erfuellt.
- fehlgeschlagene Subscriptions sicher zusammengefasst: erfuellt.
- keine Roh-Endpunkte: erfuellt.
- keine Keys: erfuellt.
- Endpoint-Hash, Kontext, Plattform, Browser und Label genutzt: erfuellt.
- Event-Dedupe nicht als sichtbarer Zielgeraet-Beweis dargestellt: erfuellt.

Wording-Review:

- Feld `acceptedSubscriptions` beschreibt technische Web-Push-Annahme besser als sichtbare Zielgeraet-Zustellung.
- Bestehendes Count-Feld `deliveredSubscriptions` bleibt aus Kompatibilitaetsgruenden erhalten, wird aber durch `acceptedSubscriptions` diagnostisch genauer eingeordnet.

Nicht beruehrt:

- Client-Health-Freshness.
- Push-Schwellen.
- Workflow.
- Doku/QA.
- Supabase Deploy.

Restrisiko:

- Auch mit `acceptedSubscriptions` beweist Web Push keine sichtbare Notification am Zielgeraet.
- Das wird in `S4.8` und `S7` als Langzeitgrenze dokumentiert.

#### Schritt-Abnahme

- Edge-Partial-Delivery-Diagnose ist abgeschlossen.
- `IP-F6` ist abgeschlossen.
- S4.7 ist abgeschlossen.
- Naechster Schritt ist `S4.8`.

### S4.8 Ergebnisprotokoll 2026-06-04

#### Umsetzung

Betroffene Dateien:

- `docs/modules/Push Module Overview.md`
- `docs/QA_CHECKS.md`
- `docs/MIDAS Incident Push Review Findings Roadmap.md`

Umgesetzt:

- Push Overview auf finalen Workflow-Vertrag aktualisiert:
  - Cron `17,37 8,9,10,11,12,13,14,15,18,19,20,21,22 * * *`.
  - 26 regulaere Scheduler-Runs pro Tag statt alter 17-Run-Kadenz.
  - Scheduler-Jitter wird ueber zwei versetzte Ticks pro relevanter UTC-Stunde abgefedert.
- Push Overview auf finalen Runtime-/Secret-Vertrag aktualisiert:
  - Workflow-Secrets `INCIDENTS_PUSH_URL` und `SUPABASE_SERVICE_ROLE_KEY`.
  - Function Secrets / Runtime-Env `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`.
  - `INCIDENTS_USER_ID` als Zielnutzer-Pflicht fuer Scheduler-Requests ohne explizite `user_id`.
  - `VAPID_SUBJECT` bleibt optional.
- Push Overview auf finalen Health-Vertrag aktualisiert:
  - lokale Suppression nur bei echter aktueller Subscription.
  - echter Remote-Erfolg maximal 7 Tage alt.
  - kein spaeterer Failure.
  - `consecutive_remote_failures = 0`.
  - Diagnose-Erfolge schalten Suppression nicht frei.
- Push Overview auf finalen Delivery-Diagnose-Vertrag aktualisiert:
  - `acceptedSubscriptions` fuer technisch angenommene Subscriptions.
  - `failedSubscriptions` fuer fehlgeschlagene Subscriptions.
  - sichere Subscription-Metadaten ohne Roh-Endpunkte oder Keys.
  - Web-Push-Annahme wird nicht als garantierte sichtbare Zielgeraet-Zustellung dokumentiert.
- Future-Scope dokumentiert:
  - Per-Device-ACK.
  - native Android Reminder.
  - eigener BP-Reminder-Kanal.
- QA_CHECKS um Phase `P17 - Incident Push Edge Reliability Hardening` ergaenzt.
- Roadmap-Status und Finding-Klassifizierung auf `S4.8` abgeschlossen aktualisiert.

#### Lokale Checks

- `git diff --check`: gruen.
- Doku-Scans:
  - Push Overview enthaelt den aktuellen 26-Run-Vertrag.
  - Push Overview enthaelt `INCIDENTS_USER_ID`, `VAPID_PUBLIC_KEY` und `VAPID_PRIVATE_KEY`.
  - Push Overview enthaelt `acceptedSubscriptions` und `failedSubscriptions`.
  - QA Phase P17 enthaelt den finalen Health-/Delivery-/Secret-Vertrag.

#### Contract Review S4.8

Review gegen S4.8-Vertrag:

- echte Workflow-Cron dokumentiert: erfuellt.
- Run-Anzahl 26 regulaere Runs pro Tag dokumentiert: erfuellt.
- Function Secrets / Runtime-Env dokumentiert: erfuellt.
- fail-closed Zielnutzer-Vertrag dokumentiert: erfuellt.
- 7-Tage-Freshness fuer lokale Suppression dokumentiert: erfuellt.
- Diagnose-Push bleibt von fachlicher Suppression getrennt: erfuellt.
- Partial Delivery sicher dokumentiert: erfuellt.
- Keine Roh-Endpunkte oder Keys in Doku als Response-Vertrag: erfuellt.
- Web-Push-Annahme nicht als sichtbare Zielgeraet-Zustellung dargestellt: erfuellt.
- S7/Future-Scope fuer groessere Alternativen abgegrenzt: erfuellt.

Findings:

- Keine neuen S4.8-Findings nach Contract Review.

Korrektur:

- Nicht erforderlich.

Restrisiko:

- Historische QA-Phasen enthalten weiterhin alte, damals gueltige Push-Kadenz-Aussagen.
- Das ist bewusst historisch und wird durch die neue Phase P17 sowie die aktuelle Push Overview uebersteuert.

#### Schritt-Abnahme

- `IP-F5` ist abgeschlossen.
- S4.8 ist abgeschlossen.
- Naechster Schritt ist `S4.9`.

### S4.9 Ergebnisprotokoll 2026-06-04

#### Ziel

- Gesamt-Code- und Contract Review fuer alle S4-Aenderungen.
- Edge Function, Workflow, Client-Suppression, Push Overview, QA und Roadmap gegeneinander pruefen.
- Keine neuen Produktfunktionen einfuehren.

#### Gepruefte Dateien

- `backend/supabase/functions/midas-incident-push/index.ts`
- `.github/workflows/incidents-push.yml`
- `app/modules/push/index.js`
- `app/modules/incidents/index.js`
- `docs/modules/Push Module Overview.md`
- `docs/QA_CHECKS.md`
- `docs/MIDAS Incident Push Review Findings Roadmap.md`

#### Lokale Checks

- `deno check backend/supabase/functions/midas-incident-push/index.ts`: gruen.
- `deno lint backend/supabase/functions/midas-incident-push/index.ts`: gruen.
- `node --check app/modules/push/index.js`: gruen.
- `node --check app/modules/incidents/index.js`: gruen.
- `git diff --check`: gruen.
- Contract-Scans:
  - keine alten `req.json()`-/`@ts-ignore`-/unversionierten `functions-js`-Muster in der Edge Function.
  - kein alter `reason=remote-healthy`-Debugtext im Client.
  - `acceptedSubscriptions`/`failedSubscriptions` im Edge- und Doku-Vertrag vorhanden.
  - Push Overview enthaelt keinen alten 17-Run-Cron-Vertrag.

Hinweis:

- Git meldet fuer `app/modules/incidents/index.js` weiterhin einen CRLF/LF-Hinweis beim Diff, aber keinen `diff --check`-Fehler.

#### Code Review S4.9

Edge Function:

- Auth bleibt vor Body-Parsing.
- Empty Body bleibt Scheduler-kompatibel.
- Nicht-leerer Body muss valides JSON-Object sein.
- `trigger`, `mode`, `window`, `dry_run`, `user_id` und `now` werden runtime-validiert.
- Invalides `now` wird vor Datumsableitung abgefangen.
- VAPID Public/Private Keys sind Pflicht-Env.
- `functions-js`-Import ist versioniert.
- Kein All-User-Fallback mehr; Zielnutzer kommt aus `user_id` oder `INCIDENTS_USER_ID`.
- Diagnose-Push schreibt weiter nur `last_diagnostic_*`.
- Fachlicher Dedupe bleibt auf `user/day/type/severity/source`.
- Partial Delivery zeigt sichere Subscription-Zusammenfassungen, keine Roh-Endpunkte oder Keys.

Client:

- `remoteHealthy` ist konservativ:
  - aktuelle Backend-Subscription.
  - echter `last_remote_success_at`.
  - kein spaeterer `last_remote_failure_at`.
  - `consecutive_remote_failures = 0`.
  - maximal 7 Tage alt.
  - nicht mehr als 5 Minuten in der Zukunft.
- `localSuppressionAllowed` bleibt exakt an `remoteHealthy` gebunden.
- Diagnose-Erfolg schaltet lokale Suppression nicht frei.
- Interner Debugtext spricht von `recent-remote-transport`, nicht von garantiert gesundem Remote-Pfad.

Workflow:

- Workflow sendet `trigger`, `mode` und `window`.
- Workflow sendet keine `user_id`.
- Damit braucht der produktive Scheduler-Pfad `INCIDENTS_USER_ID` als Supabase Function Secret.
- Cron in Workflow und Push Overview stimmt ueberein.

#### Contract Review S4.9

Review gegen Roadmap-Ziel:

- Ungueltiger Request-Body fuehrt zu `400`: erfuellt.
- Ungueltiges `now` fuehrt zu `400`: erfuellt.
- VAPID Pflicht-Env fail-fast: erfuellt.
- `deno check` und `deno lint` gruen: erfuellt.
- Service-Role-/Scheduler-Vertrag bleibt eng: erfuellt.
- Diagnose-Push bleibt technisch getrennt von Medication-/BP-Dedupe: erfuellt.
- Reminder-/Incident-Schwellen, Typen, Tags und Severity bleiben unveraendert: erfuellt.
- Push Overview, QA und Roadmap sprechen denselben finalen Cron-, Runtime- und Smoke-Vertrag: erfuellt.
- Web-Push-Annahme wird nicht als garantierte sichtbare Zielgeraet-Zustellung behauptet: erfuellt.

#### Findings

- S4.9-CR-F1:
  - Push Overview formulierte zunaechst zu breit, dass normale Incident-/Reminder-Events sichere `acceptedSubscriptions`-/`failedSubscriptions`-Listen enthalten.
  - Der Code gibt diese Listen fuer erfolgreich oder teilweise erfolgreich gesendete Events aus; vollstaendig fehlgeschlagene Events stehen in der top-level `failed`-Liste.

#### Korrektur

- Push Overview geschaerft:
  - erfolgreich oder teilweise erfolgreich gesendete Events enthalten `acceptedSubscriptions`/`failedSubscriptions`.
  - vollstaendig fehlgeschlagene Events werden in top-level `failed` mit sicherer Subscription-Zusammenfassung dokumentiert.

#### Restrisiko

- Remote-Smokes, Supabase Deploy, GitHub Workflow-Smoke und Zielgeraet-Smoke bleiben offen und gehoeren zu S5.
- Web Push bleibt transportseitig und beweist ohne weitere Architektur keinen sichtbaren Zielgeraet-ACK.
- S7 bleibt der bewusste Merker fuer eine spaetere separate Reliability-Roadmap.

#### Schritt-Abnahme

- S4.9 ist abgeschlossen.
- S4 ist abgeschlossen.
- Naechster Schritt ist `S5`.

### S5 Ergebnisprotokoll 2026-06-04

#### S5.1 Lokale Edge-/Client-Checks

Ausgefuehrt:

- `deno check backend/supabase/functions/midas-incident-push/index.ts`: gruen.
- `deno lint backend/supabase/functions/midas-incident-push/index.ts`: gruen.
- `node --check app/modules/push/index.js`: gruen.
- `node --check app/modules/incidents/index.js`: gruen.
- `git diff --check`: gruen.

Hinweis:

- Git meldet fuer `app/modules/incidents/index.js` weiterhin einen CRLF/LF-Hinweis beim Diff, aber keinen `diff --check`-Fehler.

#### S5.2 Doku-/Whitespace-/Finding-Scans

Ausgefuehrt:

- Scan auf alte weiche JSON-Patterns:
  - kein `req.json()`-Parsing mehr in `midas-incident-push`.
- Scan auf Import-Hygiene:
  - kein `@ts-ignore` in `midas-incident-push`.
  - kein unversionierter `functions-js`-Import in `midas-incident-push`.
- Scan auf alte Debugsprache:
  - kein `reason=remote-healthy` im Client-Code.
  - `reason=recent-remote-transport` vorhanden.
- Scan auf Delivery-Diagnose:
  - `acceptedSubscriptions` und `failedSubscriptions` im Edge- und Doku-Vertrag vorhanden.
- Scan auf Secret-/Runtime-Vertrag:
  - `INCIDENTS_USER_ID`, `VAPID_PUBLIC_KEY` und `VAPID_PRIVATE_KEY` in Edge-/Doku-/QA-Vertrag vorhanden.

#### S5.3 Workflow-Strukturcheck

Geprueft:

- `.github/workflows/incidents-push.yml` ist remote per GitHub CLI lesbar.
- Workflow-Cron:
  - `17,37 8,9,10,11,12,13,14,15,18,19,20,21,22 * * *`
  - 2 Minuten-Ticks.
  - 13 UTC-Stunden.
  - 26 regulaere Runs pro Tag.
- Workflow sendet:
  - `trigger`
  - `mode`
  - `window`
- Workflow sendet keine `user_id`.
- Produktiver Scheduler-Pfad braucht daher `INCIDENTS_USER_ID` als Supabase Function Secret.

Remote-Vorpruefung:

- `supabase functions list` erfolgreich.
- `midas-incident-push` ist remote `ACTIVE`, Version 15.
- Neue S4-Aenderungen sind remote noch nicht deployed.
- Supabase Function Secret-Namen remote geprueft:
  - `SUPABASE_URL` vorhanden.
  - `SUPABASE_SERVICE_ROLE_KEY` vorhanden.
  - `VAPID_PUBLIC_KEY` vorhanden.
  - `VAPID_PRIVATE_KEY` vorhanden.
  - `INCIDENTS_USER_ID` vorhanden.
- Keine Secret-Werte wurden dokumentiert oder ausgegeben.

#### S5.4 Code Review

Review-Ergebnis:

- Auth bleibt vor Body-Parsing.
- Empty Body bleibt Scheduler-kompatibel.
- Ungueltiger nicht-leerer Body fuehrt zu `400`.
- Body muss JSON-Object sein.
- `trigger`, `mode`, `window`, `dry_run`, `user_id` und `now` sind runtime-validiert.
- Invalides `now` kann nicht vor zentralem Fehlerpfad in Datumsableitung crashen.
- VAPID Public/Private Keys werden fail-fast geprueft.
- Zielnutzer-Aufloesung ist fail-closed.
- Diagnose-Push bleibt getrennt von fachlicher Dedupe.
- Remote-Dedupe bleibt auf `user_id + day + type + severity + source`.
- Partial Delivery nutzt sichere Subscription-Zusammenfassungen.
- Client-Suppression bleibt an konservativen `remoteHealthy` gebunden.
- Keine Medication-/BP-Schwellen, Tags, Copies oder Service-Worker-UX geaendert.

#### S5.5 Contract Review

Review gegen Source-of-Truth:

- Push Overview, QA und Workflow sprechen jetzt denselben 26-Run-Cron-Vertrag.
- Push Overview, QA und Edge Function sprechen denselben Secret-/Target-User-Vertrag.
- Push Overview und Edge Function unterscheiden technische Web-Push-Annahme von sichtbarer Zielgeraet-Zustellung.
- S7/Future-Scope bleibt separate Architekturentscheidung.
- Dev Environment bestaetigt:
  - Deploys und produktive Workflow-Runs brauchen ausdrueckliche Freigabe.
  - Supabase Deploy-Workdir ist `backend`.
  - GitHub CLI und Supabase CLI sind verfuegbar.

#### S5 Findings

- S5-F1:
  - S4.8-Doku hatte die Workflow-Kadenz falsch als 28 regulaere Runs pro Tag dokumentiert.
  - Tatsachlich hat der Workflow 2 Minuten-Ticks mal 13 UTC-Stunden = 26 regulaere Runs pro Tag.

#### S5 Korrektur

- `docs/modules/Push Module Overview.md` von 28 auf 26 regulaere Runs korrigiert.
- `docs/QA_CHECKS.md` von 28 auf 26 regulaere Runs korrigiert.
- Roadmap-Vertragsstellen von 28 auf 26 regulaere Runs korrigiert.
- S5-Workflow-Strukturcheck als harte Gegenpruefung dokumentiert.

#### S5.6 Remote-Smoke-Gate

Nach CodeRabbit-Gate und User-Freigabe ausgefuehrt:

- Supabase Deploy von `midas-incident-push`:
  - Remote Function `ACTIVE`.
  - Version 16.
- Remote Dry-Run gegen neue Version:
  - `ok=true`.
  - `dryRun=true`.
  - `status=no-incidents`.
  - 5 fachliche Skip-Gruende.
- Direkter manueller Diagnose-Push:
  - `ok=true`.
  - `mode=diagnostic`.
  - `status=diagnostic-sent`.
  - `sentSubscriptions=3`.
  - `failedSubscriptions=0`.
- GitHub Workflow-Smoke:
  - Workflow `Incidents Push`.
  - Run `26954859805`.
  - Ergebnis `success`.
  - `trigger=manual`.
  - `mode=diagnostic`.
  - `status=diagnostic-sent`.
  - `sentSubscriptions=3`.
  - `failedSubscriptions=0`.

Userseitig nachtraeglich verifiziert:

- Sichtbare Notification am Desktop.
- Sichtbare Notification am Android-Geraet.

Tatsaechlich ausgefuehrte Reihenfolge:

1. `midas-incident-push` deployen.
2. Remote Dry-Run ohne Push-Schreibwirkung pruefen.
3. Manuellen Diagnose-Push ausfuehren.
4. GitHub Workflow-Smoke ausfuehren.
5. Lokale Checks nach Runtime-Smokes erneut ausfuehren.

Abschlusschecks nach Runtime:

- `deno check backend/supabase/functions/midas-incident-push/index.ts`: gruen.
- `deno lint backend/supabase/functions/midas-incident-push/index.ts`: gruen.
- `node --check app/modules/push/index.js`: gruen.
- `node --check app/modules/incidents/index.js`: gruen.
- `git diff --check`: gruen.

#### Schritt-Abnahme

- S5.1 bis S5.6 sind abgeschlossen.
- S5 ist abgeschlossen.
- Naechster Schritt ist `S6`.

### S6 Ergebnisprotokoll 2026-06-04

#### S6.1 Push Module Overview

Aktualisiert:

- Deployed Stand `midas-incident-push` Version 16 dokumentiert.
- Letzter Runtime-Smoke dokumentiert:
  - Remote Dry-Run.
  - direkter Diagnose-Push.
  - GitHub Workflow-Smoke.
  - Desktop-/Android-Zielgeraet-Smoke.
- Definition of Done um sichtbaren Desktop-/Android-Diagnose-Push ergaenzt.

#### S6.2 QA_CHECKS

Aktualisiert:

- Phase P17 enthaelt:
  - lokale Checks.
  - Supabase Deploy Version 16.
  - Remote-Secret-Vorpruefung.
  - Remote Dry-Run.
  - Diagnose-Push.
  - GitHub Workflow-Smoke Run `26954859805`.
  - Desktop-/Android-Zielgeraet-Smoke.
- 26-Run-Vertrag statt falscher 28-Run-Zaehlung dokumentiert.

#### S6.3 Roadmap

Aktualisiert:

- Current Working State auf S6 abgeschlossen gesetzt.
- Deploy-/Runtime-Status auf Version 16 und erfolgreiche Smokes gesetzt.
- Statusmatrix:
  - S1 bis S6 `DONE`.
  - S7 bleibt nachgelagerter Reliability-Merker.
- S5-Ergebnisse und S6-Abschlussreview dokumentiert.

#### S6.4 Finaler Contract Review

Roadmap vs. Code:

- `IP-F1`: Input-/JSON-/Datum-Validation im Code umgesetzt und dokumentiert.
- `IP-F2`: VAPID Public/Private fail-fast im Code umgesetzt und dokumentiert.
- `IP-F3`: Deno-Hygiene im Code umgesetzt und dokumentiert.
- `IP-F4`: Zielnutzer fail-closed im Code umgesetzt und dokumentiert.
- `IP-F5`: Doku-/QA-Cron-Vertrag auf 26 regulaere Runs korrigiert.
- `IP-F6`: 7-Tage-Remote-Health und Partial-Delivery-Diagnose im Code umgesetzt und dokumentiert.

Roadmap vs. Push Overview:

- Push Overview beschreibt:
  - 26 regulaere Scheduler-Runs.
  - Function Secret-/Runtime-Vertrag.
  - 7-Tage-Freshness.
  - Diagnose bleibt getrennt.
  - `acceptedSubscriptions`/`failedSubscriptions`.
  - keine Garantie sichtbarer Zielgeraet-Zustellung allein durch Web-Push-Annahme.
  - erfolgreicher Desktop-/Android-Smoke.

Roadmap vs. Workflow:

- Workflow-Cron stimmt mit Doku ueberein:
  - `17,37 8,9,10,11,12,13,14,15,18,19,20,21,22 * * *`.
  - 2 Minuten-Ticks mal 13 UTC-Stunden = 26 Runs pro Tag.
- Workflow sendet keine `user_id`; `INCIDENTS_USER_ID` als Function Secret ist vorhanden und dokumentiert.

Roadmap vs. QA:

- QA Phase P17 enthaelt alle lokalen Checks und Runtime-Smokes.
- QA dokumentiert Desktop-/Android-Zielgeraet-Smoke als erfolgreich.
- Keine offenen QA-Pflichtpunkte fuer diese Roadmap.

Roadmap vs. Dev Environment:

- Deploy erfolgte mit dokumentiertem `--workdir backend --use-api`-Vertrag.
- GitHub Workflow-Smoke erfolgte erst nach Freigabe.
- Keine Secret-Werte wurden dokumentiert.

#### S6.5 Abschluss-Abnahme

- Keine offenen P0/P1-Risiken.
- Keine offenen CodeRabbit-Findings.
- Keine offenen lokalen Check-Failures.
- Keine Medication-/BP-Schwellen geaendert.
- Keine SQL-/RLS-/Schema-Aenderung.
- Keine neue Reminder-Kette.
- Keine Touchlog-/Profil-/Hub-UI-Aenderung.
- Deploy und Runtime-Smokes abgeschlossen.
- Desktop-/Android-Zielgeraet-Smoke abgeschlossen.
- Restrisiko bleibt bewusst:
  - Web Push ist transportseitig.
  - Langfristige Reliability wird ueber S7 beobachtet.
  - Per-Device ACK, native Android Reminder oder eigener BP-Reminder-Kanal bleiben separate Roadmaps.

#### S6.6 Commit-Empfehlung

Sinnvoller Commit-Scope:

- `harden incident push runtime contract`

Betroffene Bereiche:

- `midas-incident-push` Edge Function.
- Push-Service Remote-Health-Freshness.
- Incidents-Debugsprache.
- Push Overview.
- QA_CHECKS.
- Roadmap.

#### S6.7 Archiv-Entscheidung

- Roadmap ist fachlich bereit fuer `(DONE)` und Archivierung.
- Archivziel:
  - `docs/archive/MIDAS Incident Push Review Findings Roadmap (DONE).md`
- Archivierung erfolgt erst nach expliziter User-Freigabe.

#### S6 Findings

- S6-F1:
  - Push Overview hatte nach S5 noch keinen expliziten Hinweis auf deployed Version 16 und erfolgreiche Desktop-/Android-Smokes.

#### S6 Korrektur

- Push Overview um deployed Version 16, Runtime-Smoke-Hinweis und Desktop-/Android-DoD ergaenzt.

#### Schritt-Abnahme

- S6 ist abgeschlossen.
- Doku, QA, Code und Roadmap sprechen denselben finalen Vertrag.
- Naechster Schritt ist Archivierung nach Freigabe oder S7 als spaetere separate Reliability-Betrachtung.
