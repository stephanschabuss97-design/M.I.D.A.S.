# MIDAS Activity V2 R12 Protein Target and Trendpilot Compatibility Roadmap

Diese Roadmap bereitet die zwei verbleibenden medizinischen Activity-Consumer
auf den gemeinsamen R11-Lesevertrag vor. Protein Target und Trendpilot sollen
Activity V1 und V2 künftig über unterschiedliche Wiener Aktivtage lesen, ohne
medizinische Schwellen, Formeln oder Aussagen zu verändern. R12 bleibt lokal,
isoliert und ohne Produktwirkung. Erst R13 darf die vorbereiteten Consumer
aktivieren und dabei den Scheduler-/Authentifizierungsvertrag lösen.

---

## Roadmap-Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Status | `DONE; S1-S6 vollständig grün; isolierte R12-Vorbereitung ohne Produktwirkung` |
| Modul / Bereich | `Activity V2 / Protein Target / Trendpilot` |
| Owner / Kontext | `Stephan; private Single-User-PWA für den eigenen CKD- und Arztkontext` |
| Chat-Lebenszyklus | `Denkraum -> eigener Ausführungs-Chat` |
| Erstellt am | `2026-08-23` |
| Letzter Stand | `2026-08-23; S6 PASS: Code, QA, Modulverträge und Masterplan synchron; finaler Contract Review grün; Archivierung nach (DONE)` |
| Aktueller Schritt | `S6 DONE` |
| Risikoklasse | `R3`; medizinische Activity-Semantik und spätere Edge-/Scheduler-Authgrenze, trotz vollständig isolierter R12-Umsetzung |
| Standard-Reviewtiefe | `Full`; S4 gemäß Workflow nur Delta/Consumer |
| Ausführungsmodell | `GPT-5.6 Sol` |
| Reasoning-Standard | `High` |
| Reasoning-Ausnahmen | `Roadmap-Erstellung und initialer Contract Review: Extra High; nur bei neuem Auth-/Security-Widerspruch in S3/S4R: Extra High` |
| Autonome Discovery Wave | `S1-S4R` |
| Autonomieprofil | `local-full` |
| Maximal autonomer Endpunkt | `S6`, sofern S4R `small/medium`, alle internen Gates grün und kein Scope-Tripwire ausgelöst ist |
| Geplante Reasoning-Wellen | `S1-S6 gemeinsam High; nur ein echter Auth-/Security-Blocker erzeugt eine Extra-High-Wellengrenze` |
| Erwartete Arbeitsgröße | `medium`; in S4R anhand des realen Diffs finalisieren |
| Externes Reviewbudget | `S1-S4: 0; S5 bei Codeänderung: 1 Initial + 1 Verifikation; Doku-only: 0` |
| Owner-Erklärmodus | `Briefing + S6-Recap` |
| Betroffene Hauptdateien | `neue pure TypeScript-Kompatibilitätsmodule und fokussierte Tests unter backend/supabase/functions; ein lokaler Isolationstest; Doku erst gebündelt in S6` |
| Deploy relevant | `nein` |
| Produktive Schreibwirkung | `nein` |
| Workflow-Vertrag | `docs/templates/MIDAS Roadmap Workflow Contract.md` |
| Evidence-Datei | `nicht erforderlich`; keine produktive DDL/DML, Migration, ACL-, Cron- oder Deploywirkung |
| Gekoppelte Roadmaps | `R11 liefert den gemeinsamen Snapshot; R13 besitzt Auth-/Scheduler-Brücke und Read-Consumer-Aktivierung; R14 besitzt Capture-Cutover` |
| Evidence-Owner | `nicht relevant` |
| Archivziel | `docs/archive/MIDAS Activity V2 R12 Protein Target and Trendpilot Compatibility Roadmap (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Ausführungs-Chat-Startkarte

- Auftrag:
  - `R12 deterministisch von S1 bis S6 abarbeiten. Bei grünen internen Gates
    und unverändert lokalem Scope ohne Zwischenfreigabe fortfahren.`
- Modell und Reasoning:
  - `GPT-5.6 Sol / High; Extra High nur bei dem in den Metadaten genannten
    Auth-/Security-Abweichungsknoten.`
- Kontextübergabe aus dem Denkraum:
  - `PASS: alle verbindlichen Produkt-, Semantik-, Scope- und Stop-
    Entscheidungen stehen in dieser Roadmap oder ihren Pflichtreferenzen.`
- Verbindliche Lesereihenfolge:
  1. `Diese Startkarte, Roadmap-Metadaten, Session Resume Card und vorhandener
     Context Receipt`
  2. `AGENTS.md und README.md`
  3. `docs/DEV_ENVIRONMENT.md`
  4. `docs/templates/MIDAS Roadmap Workflow Contract.md`
  5. `docs/Future trainingsmodule update thoughts.md`, besonders R11-R14
  6. `docs/modules/Activity Module Overview.md`
  7. `docs/modules/Protein Module Overview.md`
  8. `docs/modules/Trendpilot Module Overview.md`
  9. `docs/qa/health-capture-reports.md` HCR-029
  10. `docs/qa/intake-medication.md` IM-013 und
      `docs/qa/push-trendpilot.md` PT-014
  11. `archivierte R11-Roadmap und R11-Evidence nur für den gültigen Snapshot-,
      Isolation-, Auth- und Invalidation-Vertrag`
  12. `reale Protein-/Trendpilot-Edge-Quellen, Scheduler-Workflows und nur die
      direkt betroffenen Consumer`
  13. `git status --short und nur der relevante Diff`
- Startschritt:
  - `S1`
- Freigegebener autonomer Block:
  - `S1-S6 unter local-full, sofern S4R die erwartete Größe small/medium
    bestätigt und kein Owner-Gate entsteht.`
- Interne Continuation Gates:
  - `S1, S2, S3 und S4R jeweils mit Full Review, Findings-Korrektur,
    Statusmatrix- und Resume-Card-Sync abschließen. Bei PASS automatisch
    fortfahren.`
  - `Nach S4R die empfohlenen S4-Blöcke ausführen, danach S5 und S6 als
    Gesamtblöcke.`
- Erlaubte Autonomie:
  - `lokale Reads, neue isolierte Module, Tests, Harness-/Isolationstooling,
    Dokumentation und Archivierung; keine produktive oder externe Wirkung.`
- Owner-Gates:
  - `keines im geplanten Scope.`
  - `Ein unerwarteter Bedarf an SQL/ACL, Supabase-Remotezugriff, Secrets,
    Scheduler-/Workflowänderung, Edge-/Webdeploy, Productload oder Änderung
    bestehender Produktentrypoints ist ein sofortiges Owner-Gate.`
- Stop-Bedingungen:
  - `R11-Snapshot kann nicht unverändert wiederverwendet werden.`
  - `medizinische Schwellen, Proteinformel oder Trendpilot-Aussage müssten
    verändert werden.`
  - `R12 benötigt eine operative Auth-/Scheduler-Lösung oder produktive
    Verdrahtung.`
  - `S4R klassifiziert den realen Scope als large oder findet einen offenen
    P0/P1-/Ownerentscheid.`
- Halluzinationsschutz:
  - `Keine RPCs, Claims, Payloadfelder, Deploys oder medizinischen Regeln
    annehmen. Reale Quellen prüfen; fehlende Fakten als Finding behandeln.`
  - `Weiterhin gültige R11-Nachweise über IDs übernehmen und nicht ohne
    Invalidation erneut vollständig ausführen.`
- Startprompt:

```text
Arbeite die MIDAS Activity V2 R12 Protein Target and Trendpilot Compatibility
Roadmap gemäß ihrer Ausführungs-Chat-Startkarte deterministisch ab. Lies die
Quellen in der festgelegten Reihenfolge, prüfe den realen Git- und Systemstand
und beginne mit S1. Führe S1-S4R jeweils vollständig mit Full Review,
Findings-Korrektur, Statusmatrix- und Resume-Card-Sync aus und fahre bei
bestandenem internem Gate ohne Rückfrage fort. Wenn S4R den Scope weiterhin
als lokal, reversibel und small/medium bestätigt, arbeite auch die empfohlenen
S4-Blöcke sowie S5 und S6 autonom ab. In S4 sind nur native Delta-/Consumer-
Reviews erlaubt; CodeRabbit gehört ausschließlich mit maximal einem Initial-
und einem Verifikationslauf in S5. Stoppe sofort vor SQL, Remote-Supabase,
Secrets, Scheduler-/Workflowänderung, Deploy, Productload, Änderung eines
bestehenden Produktentrypoints oder einer medizinischen Regel. R13 besitzt die
operative Aktivierung und Auth-/Scheduler-Brücke; R14 den Capture-Cutover.
```

## Session Resume Card

- Ziel:
  - `Protein Target und Trendpilot isoliert auf den gemeinsamen R11-V1-/V2-
    Snapshot und unterschiedliche Wiener Aktivtage vorbereiten.`
- Unveränderliche Verträge:
  - `R11-Snapshot bleibt einzige V1-/V2-Union; keine zweite Datenabfrage.`
  - `28 Tage inklusive; ACT1/ACT2/ACT3, Proteinformel und Trendpilot-
    Schwellen/Aussagen bleiben fachlich unverändert.`
  - `Keine Sätze, Reps, Gewichte, Volumen, Intensität oder Empfehlungen.`
  - `R12 bleibt unverdrahtet; R13 aktiviert Leser und löst Auth/Scheduler.`
  - `Activity V1 bleibt alleiniger produktiver Capture-Pfad.`
- Erledigter Stand:
  - `R1-R11 und C2 sind DONE; SQL25 ist read-only installiert.`
  - `Initialer R12-Contract-Review ist PASS; Findings F-ACT-R12-01 bis -09
    wurden im Roadmapvertrag geschlossen oder R13 zugeordnet.`
  - `S1 PASS: R11-Snapshot/Validator, Protein-/Trendpilot-Fachlogik, alle
    direkten Trendpilot-Kontextleser und Scheduler/Authgrenzen am realen
    Repositorystand belegt; bestehende R11-Nachweise bleiben gültig.`
  - `S2 PASS: shared Context, 28-Tage-Unterfenster, Protein-/Trendpilot-
    Outputs und stabile fail-closed Fehlerklassen exakt eingefroren.`
  - `S3 PASS: Same-day/Mixed, Range/DST/Wochen, medizinische Grenzwerte,
    adversariale Inputs und Product-Isolation vollständig auf die S5-Matrix
    abgebildet; keine neuen Findings.`
  - `S4R PASS: medium, ausschließlich sieben neue lokale Dateien; Block A
    S4.1, danach bei PASS Block B S4.2-S4.3; keine Runtimewirkung oder Gates.`
  - `S4.1 PASS: R11-Validator direkt wiederverwendet; enthaltene 28-Tage-
    Fenster, eindeutige Tage/Montagswochen, Mehrfensternutzung, Deep Freeze
    sowie adversariale Range-/Snapshot-/Contextgrenzen mit 7/7 belegt.`
  - `S4.2 PASS: Proteinadapter beweist 0/1/2/5/6, ACT-/Modifierparität,
    Same-day und Detailunabhängigkeit mit 4/4.`
  - `S4.3 PASS: Trendpilotadapter beweist Empty, Gates, 3/4/7/8, Wochen/DST,
    neues Keyset und Same-day mit 4/4; Isolation schützt 14 Produktpostimages.`
  - `S5 PASS: finale Deno-Matrix 15/15, Deno Check/Lint/Format, Node-Syntax,
    T04 und diff-check grün; nativer Full Review ohne offene P0/P1.`
  - `CodeRabbit initial 5 Issues, davon zwei R12-relevant und korrigiert;
    Verifikation 1 Minor-Testlücke, lokal korrigiert. Drei fremde Baseline-
    Issues nicht angefasst; kein dritter Lauf gemäß Reviewbudget.`
  - `S6 PASS: Activity-/Protein-/Trendpilot-Overviews, Masterplan und HCR-030
    auf den bewiesenen Poststand synchronisiert; Changelog und SQL-HOW-TO
    mangels Produkt-/SQL-Wirkung bewusst unverändert.`
- Aktueller Schritt:
  - `DONE`
- Nächster erlaubter Schritt:
  - `R13 Read-Consumer Activation and V1 Parity als einziges nächstes
    Core-Gate planen.`
- Offene Findings:
  - `none; F-ACT-R12-05/-06 sind explizite R13-Watchlists und blockieren den
    isolierten R12-Scope nicht.`
- Geänderte Dateien:
  - `sieben neue R12-Code-/Test-/Tooldateien; Activity-, Protein- und
    Trendpilot-Overview; Activity-V2-Masterplan; HCR-030; diese archivierte
    Roadmap. Vorbestehende fremde Dirty Files blieben erhalten.`
- Gültige Nachweise:
  - `HCR-029; EV-ACT-R11-L01/-L06/-L09/-L10 und R01-R03; SQL25- und
    Validatorfingerprints stimmen mit dem R11-DONE-Postimage überein.`
- Context Receipt:
  - `angelegt; Baseline 10654bd, relevante Hashes und Toolstatus unten.`
- Autonomieprofil / aktuelle Welle:
  - `local-full; maximal S6 bei unverändertem Scope.`
- Runtime-/Deploy-Stand:
  - `R12 isoliert implementiert; keine Runtime-, Deploy- oder produktive
    Schreibwirkung.`
- Offene Owner-Freigaben:
  - `none im geplanten Scope.`
- Stop-Bedingungen:
  - `jeder Scope-Tripwire aus der Startkarte.`

## Context Receipt

- Baseline-Commit:
  - `10654bd536b12277f80085235d369fc232a88f7d`
- Relevante Dirty Files:
  - `vorbestehend: README.md, DEV_ENVIRONMENT, Masterplan, R11-DONE-Roadmap/
    Evidence, Roadmap-Templates sowie untracked AGENTS.md, R12-Roadmap und
    tools/coderabbit.cmd; keine davon zurücksetzen oder pauschal R12
    zuschreiben.`
- Gelesene Sources of Truth:
  - `Startkarte/Metadaten/Resume/Receipt; AGENTS, README, DEV_ENVIRONMENT,
    Workflow, Masterplan R11-R14, Activity-/Protein-/Trendpilot-Overview,
    HCR-029, IM-013, PT-014, relevanter R11-DONE-/Evidencevertrag, reale
    R11-/Protein-/Trendpilot-Edgequellen, Workflows und direkte Consumer.`
- Gültige Evidence-/Test-IDs:
  - `HCR-029; EV-ACT-R11-L01/-L06/-L09/-L10, R01-R03. R11-Validator
    F25F45C4...386E, SQL25 77BE7B9F...BC572 und Functiondef-Nachweis
    F7226F6A...B3C3D unverändert übernommen; keine R11-Wiederholung.`
- Invalidation-Bedingungen:
  - `R11-Consumercontract oder SQL25 -> gesamter R12-Projektionsvertrag.`
  - `Protein-Schwellen/Formel -> Protein-Paritätstests.`
  - `Trendpilot-Fenster/Wochen-/Kontextvertrag -> Trendpilot-Paritätstests.`
  - `Entry-, Workflow-, Auth- oder Productload-Datei -> Scope-Tripwire.`
- Tool-/Runtime-Status:
  - `Node 24.18.0; Deno 2.9.5; coderabbit 0.7.5, Agent-Auth true; kanonischer
    R11-Validator deno-check PASS; keine Secrets oder Remotezugriffe.`

## Zielvertrag

R12 ist erfolgreich, wenn:

1. genau ein gemeinsamer, purer medizinischer Activity-Kontext einen strikt
   validierten R11-Snapshot für ein explizites, vollständig enthaltenes
   28-Tage-Unterfenster in unterschiedliche Wiener Aktivtage übersetzt;
2. ein isolierter Protein-Adapter aus exakt 28 inklusiven Tagen denselben
   ACT1-/ACT2-/ACT3- und Modifiervertrag wie heute ableitet;
3. ein isolierter Trendpilot-Adapter aus exakt vier Wochen aktive Tage,
   Wochen mit Einträgen und denselben `unknown/low/ok/high`-Vertrag ableitet;
4. V1-only, V2-only, Mixed, mehrere Einheiten am selben Tag und Empty
   deterministisch und ohne Doppelzählung funktionieren;
5. bestehende Protein-/Trendpilot-Produktentrypoints, Workflows, Profile,
   Payloads und sichtbare Consumer byte- beziehungsweise diffseitig
   unverändert bleiben;
6. R13 eine eindeutige, getestete Integrationsseam und einen klar benannten
   Auth-/Scheduler- sowie Versions-Handoff erhält.

Bewusst unverändert:

- Protein-Doctor-Lock, Altersbasis, CKD-Faktoren, Zielberechnung und Profil-
  Persistenz.
- Trendpilot-Severity, BP-/Body-/Lab-Logik, ACK, Textaussagen und UI.
- R11-SQL25, R10-Coaching-Export, Doctor View, Health Export und Arztbericht.
- Activity V1 Capture, Activity V2 Capture-Isolation, Datenmodell und Retention.

## Problem und Ist-Zustand

- Protein Target zählt heute V1-`activity_event`-Zeilen im 28-Tage-Fenster.
  Mehrere Aktivitäten am selben Tag zählen mehrfach und V2 fehlt.
- Trendpilot zählt heute V1-Activity-Zeilen als `sessions_4w` und bildet daraus
  Wochen sowie `unknown/low/ok/high`. V2 fehlt ebenfalls.
- R11 stellt bereits genau einen ownergebundenen, strikt validierten V1-/V2-
  Snapshot bereit und definiert Frequenz als unterschiedliche Wiener Tage.
- Der R11-RPC ist absichtlich `authenticated`-only und nutzt `auth.uid()`.
  Die produktiven Scheduler rufen Protein Target und Trendpilot heute jedoch
  über einen privilegierten Backendpfad auf. Diese operative Brücke ist nicht
  durch lokales Mapping lösbar und gehört R13.

## Entscheidungslog

<!-- markdownlint-disable MD013 -->

| ID | Datum | Entscheidung | Warum | Betrifft |
| --- | --- | --- | --- | --- |
| D-ACT-R12-01 | 2026-08-23 | Frequenz bedeutet unterschiedliche `Europe/Vienna`-Kalendertage | R11-Vertrag; verhindert Same-day-Doppelzählung | alle R12-Adapter |
| D-ACT-R12-02 | 2026-08-23 | R12 verwendet ausschließlich den validierten R11-Snapshot und erfindet keine zweite V1-/V2-Union | eine Source of Truth und konsistente Qualität | S4.1-S4.3 |
| D-ACT-R12-03 | 2026-08-23 | Protein verwendet exakt 28 inklusive Tage und die Schwellen `<2`, `2-5`, `>=6` mit Modifiern `0.1/0.2/0.3` | bestehender medizinischer Vertrag bleibt unverändert | S4.2 |
| D-ACT-R12-04 | 2026-08-23 | Trendpilot verwendet exakt 28 inklusive Tage, Montag-Sonntag-Wochen und die bestehenden Gates `>=4 Tage oder >=2 Wochen`, high `>=8`, low `<=3` | nur Datenquelle und Zähleinheit ändern | S4.3 |
| D-ACT-R12-05 | 2026-08-23 | Neuer vorbereiteter Trendpilot-Kontext heißt `active_days_4w`; alte gespeicherte `sessions_4w`-Payloads bleiben lesbar und werden nicht migriert | Semantik wird maschinenlesbar, Historie bleibt stabil | S2/S4.3/R13 |
| D-ACT-R12-06 | 2026-08-23 | `protein_activity_score_28d` bleibt als Profilfeld, bedeutet nach Aktivierung aber Aktivtage; R13 muss deshalb `protein_calc_version` sichtbar von `v1.2-*` auf `v1.3-*` erhöhen | keine stille Bedeutungsänderung | R13-Handoff |
| D-ACT-R12-07 | 2026-08-23 | Empty ergibt Protein `ACT1/0.1`, beim Trendpilot `unknown/0 Tage/0 Wochen` | bestehendes Verhalten ohne erfundene Aktivität | S4.2/S4.3 |
| D-ACT-R12-08 | 2026-08-23 | Ungültiger, unvollständiger oder rangefalscher Snapshot failt geschlossen; kein direkter V1-Fallback | vermeidet stille Abweichung und Doppelzählung | S4.1-S4.3 |
| D-ACT-R12-09 | 2026-08-23 | R12 erstellt nur pure, unreferenzierte TypeScript-Module und Tests; bestehende Edge-Handler und Workflows bleiben unverändert | kontrollierte Vorbereitung vor R13 | Scope/S4 |
| D-ACT-R12-10 | 2026-08-23 | R13 besitzt User-JWT-/Scheduler-Provider, API-Key-Migration, Productwiring und Deploy | R11-RLS-Vertrag und heutiger Servicepfad dürfen nicht vermischt werden | Stop-Gate/R13 |
| D-ACT-R12-11 | 2026-08-23 | Kein Browser-, Docker-, Device-, Remote-Supabase- oder produktiver SQL-Test in R12 | pure Backendkompatibilität benötigt diese teuren Flächen nicht | S5 |
| D-ACT-R12-12 | 2026-08-23 | `local-full` ist bis S6 erlaubt, solange S4R small/medium bestätigt und kein Tripwire eintritt | weniger Handoffs bei gleichbleibenden Gates | Ausführung |
| D-ACT-R12-13 | 2026-08-23 | Ein validierter R11-Snapshot darf mehrere explizite, vollständig enthaltene 28-Tage-Unterfenster bedienen; außerhalb seiner Range wird fail-closed abgelehnt | Trendpilot benötigt potenziell mehrere Kontextfenster, ohne N+1-RPCs zu erzwingen | S2/S4.1/R13 |

<!-- markdownlint-enable MD013 -->

## Owner-Briefing-Bedarf

- Erklärmodus:
  - `Briefing + S6-Recap`
- Neue oder entscheidungsrelevante Konzepte:
  - `Warum R12 nur die fachliche Übersetzung baut und R13 die operative
    User-JWT-/Scheduler-Brücke übernehmen muss.`
  - `Warum das bestehende Protein-Scorefeld erst mit neuer Calc-Version eine
    neue Zähleinheit erhalten darf.`
- Geplante Briefing-Gates:
  - `kein Stop im normalen Scope; kompaktes S6-Recap.`
- Nicht erneut zu erklären:
  - `normale TypeScript-, Test- und Dokumentationsarbeit.`

## Scope und Grenzen

In Scope:

- pure Validierung/Projektion eines bereits validierten R11-Snapshots in einen
  internen medizinischen Activity-Kontext;
- isolierter Protein-Adapter für aktive Tage, ACT-Level und Modifier;
- isolierter Trendpilot-Adapter für aktive Tage, belegte Wochen und Level;
- fokussierte Fixtures, Contracttests und Product-Isolation-Orakel;
- expliziter R13-Handoff für Auth, Scheduler, Version und Payloadaktivierung;
- Doku-/QA-Sync erst nach grünem S5.

Nicht in Scope:

- Änderung oder Deploy von `midas-protein-targets/index.ts` oder
  `midas-trendpilot/index.ts`;
- Änderung der GitHub-Actions, Secrets, Supabase-Keys oder Scheduler;
- SQL26, SQL25-Änderung, ACL-/RLS-/Rollenänderung oder Remote-RPC-Aufruf;
- Änderung von `user_profile`, Proteinformel, Doctor Lock oder Targets;
- neue Trendpilot-Aussage, Severity, Schwelle, Activity-Warnung oder UI-Copy;
- Productload, `index.html`, Service Worker, Browser-/Android-Smoke oder Deploy;
- reale oder synthetische produktive Activity-Daten;
- Satz-, Rep-, Gewichts-, Volumen-, Intensitäts- oder Coachinglogik.

Roadmap-spezifische Guardrails:

- R11-Validator und Snapshotsemantik werden importiert beziehungsweise direkt
  wiederverwendet, nicht kopiert.
- Jede public pure Funktion akzeptiert nur den vollständigen R11-Snapshot oder
  einen daraus validiert erzeugten internen Kontext.
- Keine Netzwerk-, Supabase-, Env-, Storage-, DML- oder Zeitabhängigkeit in
  den neuen R12-Modulen.
- Jedes 28-Tage-Unterfenster muss explizit angefordert und vollständig von der
  validierten Snapshot-Range abgedeckt sein. Es gibt weder stilles Kürzen noch
  Daten außerhalb des Snapshots; ein breiterer Snapshot darf mehrere solche
  Fenster deterministisch bedienen.
- R12 dokumentiert die spätere Aktivierung, führt sie aber nicht vorweg.

## Scope-Freeze vor S4

- Bestehende Features:
  - `vollständig erhalten; produktives Verhalten bleibt V1-basiert.`
- Datenmodell, Lifecycle und Retention:
  - `unverändert.`
- Cleanup, Scheduler, Secrets und externe Automationen:
  - `unverändert; jede notwendige Änderung stoppt R12.`
- Kompatible Producer und Consumer:
  - `R11 activity_consumer_snapshot/Validator als Producer; vorbereitete
    Protein-/Trendpilot-Adapter als einzige neue Consumer; R13 als Aktivierer.`
- Offene Grundsatzfragen:
  - `none; S1-S3 müssen den realen Stand bestätigen.`
- Umgang mit späterem Scope-Wechsel:
  - `kleine lokale Korrektur über S2/S3/S4R; Auth, SQL, Scheduler, Deploy oder
    Produktwiring immer R13/Owner-Gate.`

## Referenzen

Pflicht in S1:

- `AGENTS.md`
- `README.md`
- `docs/DEV_ENVIRONMENT.md`
- `docs/templates/MIDAS Roadmap Workflow Contract.md`
- `docs/Future trainingsmodule update thoughts.md`
- `docs/modules/Activity Module Overview.md`
- `docs/modules/Protein Module Overview.md`
- `docs/modules/Trendpilot Module Overview.md`
- `docs/qa/health-capture-reports.md`, HCR-029
- `docs/qa/intake-medication.md`, IM-013
- `docs/qa/push-trendpilot.md`, PT-014
- `backend/supabase/functions/midas-monthly-report/activity-consumer.ts`
- `backend/supabase/functions/midas-protein-targets/index.ts`
- `backend/supabase/functions/midas-trendpilot/index.ts`
- `.github/workflows/protein-targets.yml`
- `.github/workflows/trendpilot.yml`

Nur bei konkreter Vertragsfrage:

- `docs/archive/MIDAS Activity V2 R11 Doctor View and Report Integration Roadmap (DONE).md`
- `docs/archive/MIDAS Activity V2 R11 Doctor View and Report Integration Evidence (DONE).md`
- `sql/25_Activity_Consumer_Compatibility.sql`
- aktuelle offizielle Supabase-Dokumentation zu Edge-Authorization, User-JWT,
  Service-to-Service-Auth und Migration auf Publishable/Secret Keys
  - `https://supabase.com/docs/guides/functions/auth-headers`
  - `https://supabase.com/docs/guides/functions/auth`
  - `https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys`

## Tool Permissions und Gates

Allowed:

- `rg`, Git-Reads, Node, Deno und lokale Dateiprüfungen;
- lokale pure Tests und vorhandene Contracttest-Harnesses;
- neue isolierte TypeScript-/Test-/Tooldateien im R12-Scope;
- `coderabbit` ausschließlich in S5 mit dem dokumentierten Budget;
- read-only Prüfung offizieller Supabase-Dokumentation.

User-gated:

- `jede Scope-Ausweitung auf SQL, Supabase Remote, Secrets, Workflow,
  Scheduler, Productload, Deploy, Browser/Device oder bestehende Entry-Handler.`

Forbidden:

- Secrets, JWTs, personenbezogene Rohpayloads oder Service-Role-Werte ausgeben.
- fremde Worktree-Änderungen zurücksetzen.
- produktive oder lokale Supabase-Datenbank für R12 verändern.
- einen Service-/Secret-Key als User-JWT oder RLS-Ersatz behandeln.
- Protein- oder Trendpilot-Fachregeln still ändern.
- einen manuellen Review als CodeRabbit-Ergebnis ausgeben.

## Statusmatrix

<!-- markdownlint-disable MD013 -->

| ID | Schritt | Reasoning | Status | Kompaktes Ergebnis |
| --- | --- | --- | --- | --- |
| S1 | System- und Vertragsdetektivarbeit | `High` | PASS | R11-Postimage, Fachregeln, direkte Consumer, Auth/Scheduler, Tooling und Invalidation belegt; keine offenen Findings |
| S2 | Fachlicher/technischer Zielvertrag | `High` | PASS | Exakte Context-/Adapter-Keysets, enthaltenes 28-Tage-Fenster, stabile Fehler und R13-Legacygrenze eingefroren |
| S3 | Bruchrisiko-, Security- und Umsetzungsreview | `High`; bei Authwiderspruch `Extra High` | PASS | Zählung, Wien-/Wochen-/DST-Zeit, medizinische Grenzen, adversariale Inputs und Isolation geschlossen |
| S4R | S4 Readiness Review | `High`; bei Authwiderspruch `Extra High` | PASS | medium; sieben neue unreferenzierte Dateien, keine produktive/SQL/Auth-/Workflowwirkung; Block A und Block B freigegeben |
| S4.1 | Gemeinsamer medizinischer Activity-Kontext | `High` | PASS | direkter R11-Validatorimport, 28-Tage-Unterfenster, eindeutige Wiener Tage/Montagswochen und Deep Freeze; T01 7/7 |
| S4.2 | Protein-Target-Kompatibilitätsadapter | `High` | PASS | ACT1/2/3 und Modifier aus Aktivtagen, keine Formel-/Detailabhängigkeit; T02 4/4 |
| S4.3 | Trendpilot-Kompatibilitätsadapter und Isolation | `High` | PASS | unknown/low/ok/high, aktive Tage/Wochen und exaktes neues Keyset; T03 4/4, T04 PASS |
| S5 | Tests, Full Review und CodeRabbit | `High` | PASS | Deno 15/15 plus Check/Lint/Format, Node-Isolation, diff-check und nativer Full Review grün; CodeRabbit 1 Initial + 1 Verifikation, alle R12-Issues geschlossen |
| S6 | Doku-Sync und Abschluss | `High` | PASS | Overviews, Masterplan und HCR-030 synchron; finaler Contract-/Diff-/Link-/Scope-Review grün; Roadmap archiviert |

<!-- markdownlint-enable MD013 -->

## Findings

<!-- markdownlint-disable MD013 -->

| ID | Severity | Typ | Status | Entscheidung / Zielschritt |
| --- | --- | --- | --- | --- |
| F-ACT-R12-01 | P1 | Contract/Data | fixed | V1-Zeilen-/Sessioncount wird nicht übernommen; D-ACT-R12-01 bis -04 frieren Aktivtage ein |
| F-ACT-R12-02 | P1 | Architecture | fixed | keine zweite V1-/V2-Union; ausschließlich R11-Snapshot laut D-ACT-R12-02 |
| F-ACT-R12-03 | P1 | Contract/Version | fixed | Score-Bedeutung ändert sich erst mit R13 und `v1.3-*`; D-ACT-R12-06 |
| F-ACT-R12-04 | P1 | Backcompat | fixed | neuer `active_days_4w`-Vertrag ohne Migration alter `sessions_4w`-Payloads; D-ACT-R12-05 |
| F-ACT-R12-05 | Watchlist | Auth/Runtime | deferred to R13 | Scheduler besitzt heute keinen User-JWT für SQL25; R12 baut keine privilegierte Umgehung |
| F-ACT-R12-06 | Watchlist | Operations | deferred to R13 | Legacy `anon`/`service_role`-Keymigration bis Ende 2026 beim operativen Aktivierungspfad entscheiden |
| F-ACT-R12-07 | P1 | Scope/Autonomy | fixed | local-full endet sofort an jedem SQL-/Workflow-/Deploy-/Productload-Tripwire |
| F-ACT-R12-08 | P1 | Architecture/Performance | fixed | ein Exact-Range-only-Adapter hätte für mehrere Trendpilot-Kontextfenster N+1-RPCs begünstigt; D-ACT-R12-13 erlaubt explizite enthaltene Unterfenster |
| F-ACT-R12-09 | Watchlist | Runtime/Range | deferred to R13 | R13 muss den einmaligen Snapshot-Umschlag gegen das Trendpilot-Requestfenster plus 27 Tage und das SQL25-Maximum von 400 Tagen festlegen |
| F-ACT-R12-10 | P2 | Type/Format | fixed | initiale T01-TypeScript-Narrowing- und Deno-Formatabweichung minimal korrigiert; Check/Format/Test danach grün |
| F-ACT-R12-11 | P2 | Test/Isolation | fixed | T04 verwechselte Object.fromEntries mit Supabase-from; Regex auf echte supabase-Nutzung eingegrenzt, Node-Syntax und Isolation danach PASS |
| F-ACT-R12-12 | P1 | Test/Isolation | fixed | CodeRabbit: Rename-/Copy-Zweitpfad im NUL-Status verlor drei Zeichen; Parser validiert jetzt beide Originalpfade vollständig, T04 erneut PASS |
| F-ACT-R12-13 | P2 | Documentation | fixed | CodeRabbit: Resume Card auf isoliert implementierten R12-Stand ohne Runtime-/Deploy-/Writewirkung korrigiert |
| F-ACT-R12-14 | P2 | Test/Coverage | fixed | CodeRabbit-Verifikation: vollständiges Empty-Postimage des shared Context ergänzt; fokussierte Deno-Matrix danach 15/15, kein dritter externer Lauf gemäß Budget |

<!-- markdownlint-enable MD013 -->

## Initialer Roadmap Contract Review

Stand: `2026-08-23`.

- AGENTS, README, Workflow-Vertrag, Masterplan, R11-DONE-Postimage, Activity-,
  Protein- und Trendpilot-Overview sowie reale Edge-/Workflowquellen wurden
  gegeneinander geprüft.
- Der zunächst leicht missverständliche Satz „R12 verwendet den R11-Snapshot“
  wurde präzisiert: R12 beweist nur pure Projektion. Der heutige Scheduler kann
  den authenticated-only SQL25-Vertrag nicht einfach mit seinem privilegierten
  Schlüssel als User aufrufen. R13 besitzt diese operative Entscheidung.
- Die semantische Änderung des Profilfelds
  `protein_activity_score_28d` ist nicht mehr still: R13 muss die Calc-Version
  erhöhen und die sichtbare Bedeutung als Aktivtage prüfen.
- Der Trendpilot-Vertrag trennt neue `active_days_4w`-Payloads von lesbarer
  Legacy-Historie mit `sessions_4w`; es gibt keine Datenmigration in R12.
- Der erste Exact-Range-Entwurf wurde korrigiert: Der pure R12-Vertrag nimmt
  explizite enthaltene 28-Tage-Unterfenster aus einem validierten Snapshot.
  Damit kann R13 später einen gemeinsamen Umschlag statt eines RPC pro Event
  laden; das 400-Tage-/Requestfenster bleibt sichtbar F-ACT-R12-09.
- `local-full` wurde gegen die R3-Risikoklasse red-geteamt: Autonomie gilt nur
  für lokale, reversible Module und endet vor jeder Runtime- oder
  Produktwirkung.
- Evidence ist nicht erforderlich, da die Roadmap SQL, ACL, Migration,
  Remote-Runtime und Deploy ausdrücklich verbietet.
- Fresh-Chat-Test: Ziel, Semantik, Quellen, Autonomie, Reviewbudget,
  Stop-Bedingungen und R13-Handoff sind ohne Denkraumwissen eindeutig.

Reviewurteil: `PASS - ready for execution chat`.

---

## S1 - System- und Vertragsdetektivarbeit

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. Pflichtreferenzen in der Startkartenreihenfolge lesen und Context Receipt
   mit Baseline, Dirty Files, Fingerprints und gültigen R11-Nachweisen anlegen.
2. Reale Producer-/Consumerkarte erfassen:
   - R11 Snapshot, TS-Validator und relevante Fixtures;
   - Protein Activity-Read, Schwellen, Formel, Version und Profilconsumer;
   - Trendpilot Activity-Read, Wochenbildung, Gates, Payload und alle Leser;
   - Scheduler-Header, Authmodus und Deploykonfiguration nur read-only.
3. Belegen, dass bestehende Consumer von Trendpilot-Aktivitätskontext nur
   `activity.level` fachlich auswerten oder Abweichung als Finding erfassen.
4. Bestehende Tests und weiterhin gültige R11-Nachweise samt
   Invalidation-Bedingungen kartieren; keine breite R1-R11-Testwiederholung.
5. Mögliche neue Dateigrenzen und Importpfade mit `deno check`-fähiger
   Minimalprobe prüfen, ohne Produktdatei zu ändern.
6. Toolstatus für Deno, Node und kanonisches `coderabbit` read-only prüfen.
7. Full Review, Findings-Korrektur, Statusmatrix und Resume Card aktualisieren;
   bei PASS automatisch S2 beginnen.

Ergebnis:

- Systemkarte:
  - `Producer ist ausschließlich der strikt validierte R11-Snapshot
    midas.activity-consumer.v1. Protein zählt produktiv noch V1-Zeilen im
    inklusiven 28-Tage-Fenster; Trendpilot zählt produktiv V1-Zeilen je
    4-Wochen-Kontext und speichert sessions_4w. Beide Scheduler verwenden
    heute den Service-Role-Bearer; SQL25 bleibt authenticated/User-JWT-only.`
- Betroffene Schichten:
  - `nur neue pure TypeScript-Projektion unter _shared, je ein unreferenzierter
    Protein-/Trendpilot-Adapter, fokussierte Deno-Tests und ein statisches
    Isolationsorakel; keine Daten-, Handler-, Workflow- oder Produktschicht.`
- Belegte Verträge:
  - `R11 validiert exakte Keysets, Range, Units, Summary, Quality, Sortierung,
    Same-day- und Mixed-Semantik fail-closed. Protein verwendet unverändert
    <2/2-5/>=6 und 0.1/0.2/0.3. Trendpilot verwendet unverändert Gate >=4
    beziehungsweise >=2 Wochen, high >=8 und low <=3. Die drei sichtbaren
    Trendpilot-Textconsumer lesen aus activity ausschließlich level.`
- Offene Fragen:
  - `none; operative User-JWT-/Scheduler-, Key-, Version-, Payload- und
    Snapshot-Umschlagentscheidungen bleiben explizit F-ACT-R12-05/-06/-09 in
    R13 und werden für die pure R12-Projektion nicht benötigt.`
- Doku-Sync:
  - `S6.`
- Full Contract Review:
  - `PASS; Quellenhierarchie, R11-Fingerprints, direkte Consumer,
    medizinische Schwellen, Fehler-/Authgrenze, Scope und Rollback stimmen
    überein. Keine berechtigte Korrektur und kein neues Finding.`
- Internal Continuation Gate:
  - `PASS; S2 ist ohne Ownerentscheidung freigegeben.`

Exit: R11-, Protein-, Trendpilot-, Auth-, Scheduler- und Consumer-Iststand ist
belegt; keine Annahme muss in S2 erfunden werden.

## S2 - Fachlicher und technischer Zielvertrag

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. Exaktes internes Keyset für den medizinischen Activity-Kontext festlegen:
   Schema/Range, sortierte eindeutige Aktivtage, Aktivtagzahl und belegte
   Montag-Sonntag-Wochen; keine Health- oder Trainingsdetails.
2. Exakte Inputgrenze festlegen: vollständiger R11-validierter Snapshot plus
   explizites 28-Tage-Unterfenster, das vollständig in seiner Range liegt;
   keine stillen Slices, Außenbereichsdaten oder Fallbacks. Ein Snapshot darf
   mehrere angeforderte Unterfenster bedienen.
3. Proteinoutput einfrieren: aktive Tage, ACT-Level, Modifier und stabiler
   Fehlervertrag; Ziel-/CKD-/Doctor-Lock-Formel bleibt außerhalb des Adapters.
4. Trendpilotoutput einfrieren: `level`, `active_days_4w`,
   `weeks_with_entries_4w`; Gates und Montag-Sonntag-Wochen exakt wie heute.
5. Legacy- und Aktivierungsvertrag einfrieren:
   - bestehende `sessions_4w`-Events bleiben lesbar;
   - `protein_calc_version v1.3-*` und neue Payload werden erst in R13 aktiv;
   - bestehende Producthandler bleiben in R12 byte-/diffseitig unverändert.
6. Stabile Fehlerklassen ohne Rohpayload, Datendetails oder Secretmaterial
   festlegen; mutierende oder werfende Diagnose-Sinks dürfen den Fehler nicht
   ersetzen.
7. Full Review, Findings-Korrektur, Statusmatrix und Resume Card aktualisieren;
   bei PASS automatisch S3 beginnen.

Ergebnis:

- Finaler Zielvertrag:
  - `Shared schema midas.activity-medical-context.v1 mit exaktem Top-Level-
    Keyset schema_version, timezone, range, active_days,
    active_day_count, active_week_starts, weeks_with_entries. Range ist exakt
    { from, to, inclusive_days: 28 }; active_days und active_week_starts sind
    aufsteigend, eindeutig und enthalten ausschließlich kanonische ISO-Tage.`
  - `createActivityMedicalContext(snapshot, window) validiert zuerst den
    vollständigen R11-Snapshot, danach das explizite { from, to }-Fenster und
    lehnt andere Länge, unvollständige Snapshotabdeckung und ungültige Keys
    ohne Slicing/Fallback ab. validateActivityMedicalContext revalidiert das
    exakte, tief eingefrorene Postimage.`
  - `Proteinoutput exakt { active_days_28d, activity_level,
    activity_modifier }; ACT1 <2/0.1, ACT2 2-5/0.2, ACT3 >=6/0.3.`
  - `Trendpilotoutput exakt { level, active_days_4w,
    weeks_with_entries_4w }; Gate active_days>=4 oder weeks>=2, danach high
    >=8, low <=3, sonst ok; vor Gate unknown.`
  - `Shared-Fehlercodes INVALID_SNAPSHOT, INVALID_WINDOW,
    WINDOW_NOT_CONTAINED und INVALID_CONTEXT; Adapter exponieren ausschließlich
    ihren sicheren INVALID_CONTEXT-Fehler. Keine Rohmessage, Payloaddaten,
    Secrets, Diagnose-Sink- oder Inputmutation.`
- Gewählte Lösung:
  - `pure shared projection plus zwei consumer-spezifische Adapter.`
- Abgrenzung:
  - `keine Datenquelle, Persistenz, Productentrypoints oder Aktivierung.`
- S4-Pflichtpunkte:
  - `S4.1-S4.3.`
- Doku-Sync:
  - `S6.`
- Full Contract Review:
  - `PASS; Keysets sind minimal und maschinenlesbar, der 28-Tage-Vertrag ist
    inklusive und vollständig enthalten, medizinische Schwellen stimmen
    byte-/wertseitig mit den produktiven Quellen überein. Legacy
    sessions_4w, v1.2-* und bestehende Producthandler bleiben unverändert.`
- Internal Continuation Gate:
  - `PASS; keine offene Grundsatzfrage oder Ownerentscheidung, S3 freigegeben.`

Exit: Alle Keys, Zeitfenster, Schwellen, Fehler und Legacygrenzen sind exakt;
keine Grundsatzfrage bleibt offen.

## S3 - Bruchrisiko-, Security- und Umsetzungsreview

Reasoning: `GPT-5.6 Sol / High`; bei einem neuen Auth-/Security-Widerspruch
`Extra High` und Stop vor dem Stufenwechsel.

Deterministisch:

1. Doppelzählung red-teamen: mehrere V1-/V2-Einheiten am selben Tag, Mixed Day,
   Korrektur/Delete, unsortierte Units und wiederholte IDs.
2. Zeitvertrag red-teamen: inklusive 28 Tage, Vienna-Day, Montag-Sonntag,
   Monats-/Jahres-/DST-Grenze, vollständig enthaltenes Unterfenster,
   Snapshot-Rand und Range-Mismatch.
3. Medizinische Parität red-teamen:
   - Protein 0/1/2/5/6 aktive Tage;
   - Trendpilot Gate knapp unter/auf 4 Tagen, zwei belegte Wochen, 3/4/7/8
     Tage sowie Empty;
   - keine Abhängigkeit von Dauer, Item-, Set-, Rep-, Gewicht- oder Volumen.
4. Security red-teamen: Getter/Prototype/Extrakey, Sparse/oversized Arrays,
   Rohfehler, mutierende Inputs, Secret-/JWT-Leak und Service-Role-RLS-
   Verwechslung.
5. Isolation red-teamen: Productimports, Entry-Diff, Workflow-/Config-/SQL-
   Delta, Netzwerk, DML, Env, Storage und Testseiteneffekte müssen failen.
6. Invalidation Map und fokussierte S5-Matrix festlegen; R11 nur bei realer
   Contractinvalidierung wiederholen.
7. Full Review, Findings-Korrektur, Statusmatrix und Resume Card aktualisieren;
   bei PASS automatisch S4R beginnen.

Ergebnis:

- Blockierende Risiken:
  - `none; F-ACT-R12-05/-06/-09 bleiben ausdrücklich R13-Watchlists.`
- Rollback-/Stop-Vertrag:
  - `nur neue isolierte Dateien entfernen; jeder Scope-Tripwire stoppt vorher.`
- S4-Schnitt:
  - `S4.1 shared context; S4.2 Protein; S4.3 Trendpilot plus Isolation.`
- S5-Pflichtchecks:
  - `T-ACT-R12-01: R11-Import, breiter Snapshot, zwei 28-Tage-Fenster,
    V1/V2/Mixed/Same-day/Empty, unsortiert/duplicate/extra/sparse/oversized,
    Snapshotrand, Range-Mismatch, Monats-/Jahres-/DST- und Montag-Sonntag-
    Grenze, Deep Freeze und Mutation.`
  - `T-ACT-R12-02: Protein 0/1/2/5/6, ACT-/Modifierparität, Detail-
    Unabhängigkeit und stabile Fehler.`
  - `T-ACT-R12-03: Trendpilot Empty, 3 Tage ohne Gate, 2-Wochen-Gate,
    4/7/8 Tage, Wochen-/DST-Grenzen, exaktes neues Keyset und keine
    sessions_4w-Ausgabe.`
  - `T-ACT-R12-04 bis -07: bytegenaue Product-/Workflow-Postimages,
    Import-/Netzwerk-/DML-/Env-/Storage-/SQL-Negativorakel, fokussierte
    Gesamtsuite, nativer Full Review und CodeRabbit-Zyklus.`
- Doku-Sync:
  - `S6.`
- Full Contract Review:
  - `PASS; R11 schließt unsortierte/duplizierte Units bereits fail-closed,
    R12 zählt ausschließlich eindeutige Wiener Tage. UTC-Tagesarithmetik auf
    kanonischen ISO-Tagen hält inklusive Range und Montag-Sonntag-Wochen über
    DST-/Monats-/Jahresgrenzen stabil. Kein medizinischer oder Authwiderspruch.`
- Internal Continuation Gate:
  - `PASS; alle Risiken sind geschlossen oder mit wirksamem R13-Gate
    außerhalb des lokalen Scopes, S4R freigegeben.`

Exit: Bruch-, Security-, Zeit-, Medizin- und Isolationrisiken sind geschlossen
oder eindeutig R13 zugeordnet.

## S4 Readiness Review

Reasoning: `GPT-5.6 Sol / High`; bei einem neuen Auth-/Security-Widerspruch
`Extra High`.

<!-- markdownlint-disable MD013 -->

| Substep | Änderung | Findings | Erwartete Dateien | Review | Checks | Gate |
| --- | --- | --- | --- | --- | --- | --- |
| S4.1 | purer medizinischer Activity-Kontext aus R11-Snapshot | S1-S3 | `_shared/activity-medical-context.ts` plus Tests/Fixture | nativer Consumer | T-ACT-R12-01 | none |
| S4.2 | isolierter Protein-Aktivitätsadapter | S1-S3 | `midas-protein-targets/activity-compatibility.ts` plus Tests | nativer Consumer | T-ACT-R12-02 | none |
| S4.3 | isolierter Trendpilot-Adapter und Product-Isolation | S1-S3 | `midas-trendpilot/activity-compatibility.ts`, Tests, Isolationstool | nativer Consumer | T-ACT-R12-03/-04 | none |

<!-- markdownlint-enable MD013 -->

- Reihenfolge/Abhängigkeiten:
  - `S4.1 vor S4.2/S4.3; S4.2 und S4.3 dürfen danach gemeinsam laufen.`
- Fehlende Zuordnung:
  - `none.`
- Evidence:
  - `nicht erforderlich.`
- Scope-Freeze:
  - `PASS; bestehende Features, Datenmodell, Lifecycle, Retention, SQL25,
    Scheduler, Secrets, Handler und Productload bleiben unverändert.`
- Gültig übernommene Nachweise:
  - `HCR-029 und gezielte R11-T-/EV-IDs nach S1-Fingerprintprüfung.`
- Invalidation Map:
  - `shared contract -> alle R12-Tests; Proteinadapter -> T02/T05-T07;
    Trendpilotadapter -> T03-T07; Isolationstool -> T04-T07.`
- Owner-Gates:
  - `keines; jeder Scope-Tripwire beendet local-full vor S4.`
- Empfohlene S4-Ausführungsblöcke:
  - `Block A: S4.1.`
  - `Block B: S4.2-S4.3 gemeinsam, sofern S4.1 PASS und Dateigrenzen
    unverändert.`
- Reviewbudget:
  - `S4 nur native Delta-/Consumer-Reviews und invalidierte fokussierte Tests;
    kein Full Review und kein CodeRabbit.`
- Aufwandsprognose:
  - `Größenklasse erwartet: medium.`
  - `Runtimeflächen: neue unreferenzierte pure Edge-TypeScript-Module; keine
    laufende Edge Function.`
  - `SQL/Backendwirkung: Code lokal, Runtimewirkung none; kein SQL.`
  - `Browser/Device/produktiv: none.`
  - `Teure Testpässe: keine PostgreSQL-, Browser-, Device- oder Remote-Matrix;
    genau ein CodeRabbit-Zyklus in S5.`
  - `Autonome Wellen: S4.1 High; danach S4.2-S4.3 High; S5-S6 High.`
  - `Owner-Briefing bei large: tritt large ein, vor S4 stoppen.`
- Readiness-Findings/Korrekturen:
  - `none; Full Review bestätigt alle S1-S3-Zuordnungen und Stop-Gates.`
  - `Exakte neue Dateien: _shared/activity-medical-context.ts,
    _shared/activity-medical-context_test.ts,
    midas-protein-targets/activity-compatibility.ts samt _test.ts,
    midas-trendpilot/activity-compatibility.ts samt _test.ts und
    tools/activity-v2-r12-isolation.mjs. Fixtures bleiben lokal in den
    jeweiligen Tests; keine zusätzliche Runtime- oder Fixturedatei nötig.`
  - `Größenklasse medium: sieben kleine, kohärente Dateien; Runtimefläche
    ausschließlich unreferenzierter purer TypeScript-Code, Rollback durch
    Entfernen dieser Dateien. Keine SQL-, Browser-, Device-, Remote- oder
    Deploywirkung.`
  - `Wellen: Block A S4.1 High mit T01; Block B S4.2-S4.3 High mit T02-T04;
    danach S5-S6 High. Kein Owner-Gate und kein Large-Tripwire.`
- Internal Continuation Gate:
  - `PASS; S4.1 darf autonom beginnen.`

Exit: S4 kann ohne neue Grundsatzentscheidung und ohne produktive Wirkung in
höchstens zwei autonomen Implementierungsblöcken beginnen.

## S4 - Umsetzung

### S4.1 - Gemeinsamer medizinischer Activity-Kontext

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-ACT-R12-01/-02/-07/-08/-09.`
- Erwartete Dateien:
  - `backend/supabase/functions/_shared/activity-medical-context.ts`
  - `fokussierte Test-/Fixturedatei; exakte Form in S4R einfrieren.`
- Umsetzung:
  - `R11-Validator wiederverwenden; ein explizites, vollständig enthaltenes
    28-Tage-Unterfenster validieren; eindeutige sortierte Aktivtage und
    Montag-Sonntag-Wochen tief eingefroren ableiten; mehrere Fenster aus
    demselben Snapshot ohne Mutation erlauben.`
- Review:
  - `nativer Consumer-Review.`
- Invalidation:
  - `T-ACT-R12-01; danach alle Adapterchecks.`
- Gate:
  - `none, solange kein Produkt-/Runtimeimport nötig wird.`

#### Ergebnis S4.1

- Änderung: `activity-medical-context.ts importiert den unveränderten R11-
  Validator und projiziert einen expliziten enthaltenen 28-Tage-Range in
  strikt validierte, sortierte, eindeutige Aktivtage und Montag-Wochen.`
- Prüfung: `T-ACT-R12-01 PASS 7/7; Deno Check und Format für beide S4.1-
  Dateien PASS.`
- Finding/Korrektur: `F-ACT-R12-10 fixed; keine fachliche Korrektur.`
- Restrisiko: `keines im pure Scope; Auth-/Snapshotbeschaffung bleibt R13.`
- Doku-Sync: `S6`
- Status: `PASS; nativer Delta-/Consumerreview bestätigt direkte R11-
  Wiederverwendung, keine zweite Union, keine Mutation und keine Runtime-
  Abhängigkeit.`

Exit: Ein purer, fail-closed und tief eingefrorener 28-Tage-Kontext zählt
aktive Wiener Tage und Wochen aus einem expliziten enthaltenen Snapshotfenster
ohne neue Datenquelle oder erzwungenen N+1-Read.

### S4.2 - Protein-Target-Kompatibilitätsadapter

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-ACT-R12-03/-06/-07/-08/-09.`
- Erwartete Dateien:
  - `backend/supabase/functions/midas-protein-targets/activity-compatibility.ts`
  - `zugehörige fokussierte Tests.`
- Umsetzung:
  - `aus dem S4.1-Kontext aktive Tage, ACT1/ACT2/ACT3 und Modifier ableiten;
    keine Ziel-, CKD-, Alters-, Lock- oder Persistenzlogik übernehmen.`
- Review:
  - `nativer Consumer-Review gegen reale v1.2-Schwellen und IM-013.`
- Invalidation:
  - `T-ACT-R12-02/-05/-06/-07.`
- Gate:
  - `none; jede Änderung am produktiven index.ts stoppt R12.`

#### Ergebnis S4.2

- Änderung: `purer, unreferenzierter Adapter leitet ausschließlich
  active_days_28d, ACT1/ACT2/ACT3 und 0.1/0.2/0.3 aus dem validierten shared
  Context ab.`
- Prüfung: `T-ACT-R12-02 PASS 4/4; Deno Check/Format PASS.`
- Finding/Korrektur: `none.`
- Restrisiko: `R13 muss Version und Profil-/UI-Bedeutung aktivieren.`
- Doku-Sync: `S6`
- Status: `PASS; nativer Consumerreview gegen reale v1.2-Schwellen und
  IM-013, keine Formel-, Alters-, CKD-, Lock- oder Persistenzlogik berührt.`

Exit: Der vorbereitete Adapter beweist die bestehende medizinische
Proteinaktivitätslogik mit Aktivtagen, ohne Produktwirkung.

### S4.3 - Trendpilot-Kompatibilitätsadapter und Isolation

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-ACT-R12-04/-05/-07/-08/-09/-10.`
- Erwartete Dateien:
  - `backend/supabase/functions/midas-trendpilot/activity-compatibility.ts`
  - `zugehörige fokussierte Tests.`
  - `tools/activity-v2-r12-isolation.mjs oder eine in S4R gleichwertig
    begründete Erweiterung des bestehenden Isolationstools.`
- Umsetzung:
  - `Level aus Aktivtagen und belegten Montag-Sonntag-Wochen ableiten; neues
    exaktes Keyset vorbereiten; alte Payloadleser und alle Produktentrypoints
    statisch unverändert schützen.`
- Review:
  - `nativer Consumer- und Isolationsreview gegen PT-014 und reale Leser.`
- Invalidation:
  - `T-ACT-R12-03/-04/-05/-06/-07.`
- Gate:
  - `none; Workflow-, Config-, Productimport- oder Handlerdelta stoppt R12.`

#### Ergebnis S4.3

- Änderung: `purer, unreferenzierter Adapter liefert exakt level,
  active_days_4w und weeks_with_entries_4w; statisches Orakel schützt
  Producthandler, Workflows, Leser, SQL25 und Productload bytegenau.`
- Prüfung: `T-ACT-R12-03 PASS 4/4; T-ACT-R12-04 PASS mit 14 geschützten
  Postimages, sieben erlaubten R12-Dateien, 0 Productwiring und 0 Runtime-
  Abhängigkeiten; Deno Check/Format und Node-Syntax PASS.`
- Finding/Korrektur: `F-ACT-R12-11 fixed; ausschließlich Orakelpräzisierung.`
- Restrisiko: `R13 besitzt Runtimepayload und Scheduler-/Authbrücke.`
- Doku-Sync: `S6`
- Status: `PASS; nativer Consumer-/Isolationsreview bestätigt unveränderte
  Gates und dass sichtbare Textconsumer weiterhin ausschließlich level lesen.`

Exit: Trendpilot besitzt einen isolierten Aktivtagadapter; Legacy-Historie und
produktive Runtime bleiben unverändert und werden durch Orakel geschützt.

## S5 - Tests, Runtime-Gates und Abschlussreview

Reasoning: `GPT-5.6 Sol / High`.

Deterministische Reihenfolge:

1. `deno check`, fokussierte Tests, Node-Isolation, Syntax/Lint/Format und
   `git diff --check` für den realen R12-Diff ausführen.
2. Nur tatsächlich invalidierte R11-/Protein-/Trendpilot-Checks wiederholen;
   unveränderte HCR-029-/R11-Nachweise referenzieren.
3. Nativen Full Code-, Contract-, Security-, Medizin-, Isolation- und
   Scope-Review des finalen Gesamtdiffs durchführen.
4. Genau einen initialen CodeRabbit-Lauf über `coderabbit` ausführen, Findings
   gesammelt bewerten und nur berechtigte Punkte minimal korrigieren.
5. Invalidierte Checks wiederholen und genau einen CodeRabbit-
   Verifikationslauf ausführen. Kein dritter Lauf ohne neues P0/P1-/Security-/
   Datenintegritätsrisiko oder ausdrücklichen Ownerauftrag.
6. Belegen, dass kein SQL, RPC-Aufruf, Netzwerk, Env, Storage, DML, Workflow-,
   Entry-, Productload-, Browser-, Device- oder Deploypfad hinzugekommen ist.
7. R13-Handoff auf Auth/Scheduler, Keymigration, Calc-Version, Payload und
   Produktwiring prüfen. Zusätzlich den einmaligen Snapshot-Umschlag, die
   27-Tage-Erweiterung des Trendpilot-Requestfensters und die SQL25-Grenze von
   400 Tagen als F-ACT-R12-09 übergeben; nichts davon in R12 ausführen.

<!-- markdownlint-disable MD013 -->

| ID | Ebene | Check / Smoke | Status | Nachweis | Invalidiert durch |
| --- | --- | --- | --- | --- | --- |
| T-ACT-R12-01 | Deno pure | R11-Validation, explizites enthaltenes 28-Tage-Unterfenster, Mehrfensternutzung, Snapshot-Rand, Vienna-Day, eindeutige Tage/Wochen, Deep Freeze, Invalid/Extrakey/Mutation | PASS | 7/7 einschließlich vollständigem Empty-Postimage | shared context |
| T-ACT-R12-02 | Deno pure | Protein 0/1/2/5/6, ACT/Modifier-Parität, Same-day/Mixed, keine Formel-/Detailabhängigkeit | PASS | 4/4 | Proteinadapter |
| T-ACT-R12-03 | Deno pure | Trendpilot Empty, 2-Wochen-Gate, 3/4/7/8 Tage, Wochen-/DST-Grenzen, neues Keyset und Legacyvertrag | PASS | 4/4 | Trendpilotadapter |
| T-ACT-R12-04 | Node/static | keine zweite Union, kein Netzwerk/DML/Env/SQL/Workflow/Productload/Entrydelta; Produktdateien unverändert | PASS | protected=14, r12_files=7, product_wiring=0, runtime_dependencies=0; Rename-/Copy-Selbsttest | Isolation |
| T-ACT-R12-05 | lokal | fokussierte Gesamtsuite, Deno Check/Lint/Format, Syntax und diff-check | PASS | Deno 15/15; Check/Lint/Format; Node-Syntax; diff-check | jeder R12-Codediff |
| T-ACT-R12-06 | Full Review | finaler nativer Code-/Contract-/Security-/Medizin-/Scope-Review | PASS | keine offene P0/P1; Fach-, Fehler-, Consumer-, Security- und Scopegrenzen konsistent | jeder R12-Codediff |
| T-ACT-R12-07 | extern | CodeRabbit initial plus maximal eine Verifikation; berechtigte Findings korrigiert | PASS | Initial 5 Issues: 2 R12 fixed, 3 fremde Baseline skipped; Verifikation 1 Minor fixed; kein dritter Lauf | finaler Diff |

<!-- markdownlint-enable MD013 -->

Nicht erforderlich und deshalb nicht aus Gewohnheit ausführen:

- Browser-/Playwright-/Device-Smoke;
- Docker/PostgreSQL/Supabase-Local-/Remote-Test;
- GitHub-Workflow-Run;
- Edge-, Web-, Service-Worker- oder APK-Deploy;
- produktiver Preflight/Postflight.

Ergebnis:

- Grüne Nachweise: `T-ACT-R12-01 bis -07; finale Deno-Matrix 15/15,
  Check/Lint/Format, Node-Isolation und diff-check PASS.`
- Wiederverwendete, nicht invalidierte Nachweise: `HCR-029;
  EV-ACT-R11-L01/-L06/-L09/-L10 und R01-R03; IM-013 und PT-014. R11-
  Validator, SQL25, Produkt-Edges und direkte Consumer blieben unverändert.`
- Nicht ausgeführte Smokes: `Browser/Device/DB/Remote erwartungsgemäß nicht relevant.`
- Produktiver Iststand: `unverändert; keine R12-Runtimewirkung.`
- Externer Review: `CodeRabbit 0.7.5 exakt ein Initial- und ein
  Verifikationslauf. R12-relevante Issues F-ACT-R12-12 bis -14 geschlossen;
  drei Issues an vorbestehenden fremden Dateien nicht übernommen. Kein
  dritter Lauf gemäß Budget.`
- Offene Findings: `none; F-ACT-R12-05/-06/-09 bleiben R13-Watchlists.`
- Commit-Entscheidung: `S6 freigegeben.`

Exit: Alle lokalen Verträge, medizinischen Grenzwerte und Isolationsorakel sind
grün; keine produktive oder externe Wirkung ist entstanden.

## S6 - Doku-Sync und Abschluss

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. Nur bewiesene R12-Ergebnisse synchronisieren in:
   - `docs/modules/Activity Module Overview.md`
   - `docs/modules/Protein Module Overview.md`
   - `docs/modules/Trendpilot Module Overview.md`
   - `docs/Future trainingsmodule update thoughts.md`
2. HCR-030 in `docs/qa/health-capture-reports.md` als isolierten R12-
   Kompatibilitätsvertrag ergänzen. IM-013 und PT-014 bleiben bis R13
   produktive V1-Verträge und werden nicht vorzeitig umgeschrieben.
3. Kein SQL-HOW-TO aktualisieren, solange R12 keine SQL-/Deploywirkung besitzt.
4. Changelog-Relevanz gegen den realen Diff entscheiden; erwartbar nicht
   bemerkenswert, solange ausschließlich unverdrahtete Vorbereitung entsteht.
5. Finalen Contract Review gegen AGENTS, Masterplan, Module Overviews,
   HCR-029/-030, realen Diff, Product-Isolation und R13-/R14-Grenze
   durchführen; Findings korrigieren.
6. Owner Recap in Alltagssprache schreiben:
   - was „aktive Tage“ künftig bedeuten;
   - warum Proteinformel und Trendpilot-Aussage unverändert bleiben;
   - warum produktiv noch nichts umgeschaltet wurde;
   - was R13 mit Auth, Scheduler, Version und einmaligem Snapshot-Umschlag noch
     lösen muss.
7. Resume Card auf DONE setzen, R13 als einziges nächstes Core-Gate nennen und
   eine Commit-Empfehlung aus dem realen Diff ableiten.
8. Roadmap mit `(DONE)` nach `docs/archive/` verschieben. Keine separate
   Evidence-Datei erzeugen.

Ergebnis:

- Source-of-Truth-Sync: `PASS; Activity-, Protein- und Trendpilot-Overview,
  Masterplan sowie HCR-030 beschreiben denselben isolierten R12-Poststand.
  IM-013 und PT-014 bleiben korrekt die produktiven V1-Verträge.`
- Finaler Review: `PASS; AGENTS, Roadmap, Masterplan, Modulverträge, HCR-029/
  -030, realer Diff, 14 geschützte Postimages und R13-/R14-Grenze stimmen
  überein. Keine offene In-Scope-P0/P1 und kein Produktentrypointdelta.`
- Restrisiken: `F-ACT-R12-05/-06/-09 bleiben ausschließlich R13-Watchlists:
  RLS-konformer Schedulerprovider, aktuelle Keymigration und einmaliger
  Snapshot-Umschlag samt 27-Tage-Erweiterung/400-Tage-Grenze.`
- Changelog-Relevanz: `nicht bemerkenswert für Unreleased; ausschließlich
  unverdrahtete interne Vorbereitung ohne sichtbares Verhalten, Runtime,
  Datenmodell oder Deploy.`
- Owner Recap:
  - `Ein Aktivtag bedeutet künftig höchstens einen Zähler pro Wiener
    Kalendertag, egal wie viele V1- oder V2-Einheiten an diesem Tag liegen.`
  - `Die Proteinformel, CKD-Faktoren, Doctor-Lock, ACT-Schwellen und Modifier
    wurden nicht verändert; R12 bereitet nur den Aktivtageinput vor.`
  - `Trendpilot behält dieselben Gates, Levels und Aussagen; vorbereitet ist
    nur der eindeutige Zähler active_days_4w.`
  - `Produktiv wurde nichts umgeschaltet. R13 muss User-JWT/RLS, Scheduler,
    Keyvertrag, Calc-Version, Payload, Snapshot-Umschlag und Productwiring
    kontrolliert aktivieren.`
- Archiv:
  - `docs/archive/MIDAS Activity V2 R12 Protein Target and Trendpilot Compatibility Roadmap (DONE).md`
- Commit-Empfehlung:

```text
feat(activity-v2): prepare protein and trendpilot compatibility
```

Exit: Code, Roadmap, QA und Module Overviews beschreiben denselben isolierten
R12-Vertrag; R13 kann die bewiesenen Reader aktivieren, ohne R12-Fachlogik neu
zu erfinden.

## Finales Akzeptanzbild

Ein frischer Chat kann nach R12-DONE belegen:

- Ein Aktivtag zählt unabhängig von Anzahl V1-Events, V2-Sessions, Items oder
  Sätzen höchstens einmal pro Wiener Kalendertag.
- Protein Target erhält mit Aktivtagen dieselben ACT-Schwellen und Modifier;
  Ziel-, CKD- und Doctor-Lock-Logik bleibt unberührt.
- Trendpilot erhält denselben Levelvertrag und dieselben Gates, aber einen
  semantisch eindeutigen `active_days_4w`-Zähler.
- Alte `sessions_4w`-Historie bleibt lesbar und wird nicht migriert.
- Fehlerhafte Snapshots failen geschlossen; es existiert kein direkter V1-
  Fallback und keine zweite V1-/V2-Union.
- Kein Produktentrypoint, Workflow, SQL, Profil, sichtbarer Consumer oder
  produktiver Datenbestand wurde durch R12 verändert.
- R13 besitzt eindeutig Auth-/Scheduler-Brücke, API-Key-Migration,
  Calc-Version, Payloadaktivierung, einmaligen Snapshot-Umschlag samt
  400-Tage-Grenze, Productwiring und Runtime-Smokes.
