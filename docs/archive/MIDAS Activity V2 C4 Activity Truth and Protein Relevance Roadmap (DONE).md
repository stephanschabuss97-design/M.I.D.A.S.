# MIDAS Activity V2 C4 – vollständige Aktivität und Protein-Berücksichtigung

Execution Roadmap nach [BLUEPRINT-1 / 2026-09-27](../../../codex-tools/docs/blueprint/ROADMAP_AUTHORING_CONTRACT.md) mit dem [MIDAS-Workflowvertrag](../templates/MIDAS%20Roadmap%20Workflow%20Contract.md). C4 ist ein begrenzter, aber risikoreicher SQL-/Edge-/UI-Cutover innerhalb der [Activity-V2-Rolling-Wave](../Future%20trainingsmodule%20update%20thoughts.md); keine zusätzliche Parent-Roadmap und kein Execution Child.

## Identität und Startkarte

| Feld | Wert |
| --- | --- |
| ID / Owner | `ACT-C4` / Stephan; persönliche Single-User-PWA |
| Stand | 2026-10-03; `DONE`; S5 abgeschlossen mit dokumentierter Protokollabweichung; SQL27/Edge32/Pages produktiv, Android OWNER-WAIVED |
| Baseline | Git `ddbcf4c`; Root-Service-Worker lokal `v29`; R14-Roadmap und Evidence archiviert `DONE`; spätere Worktree-Änderungen separat prüfen |
| Risiko / Größe | `R3`; voraussichtlich **large** wegen SQL, Edge, medizinischem Consumer, PWA, produktiven Gates und Closure – in S4R real prognostizieren |
| Produktziel | Jede absolvierte Session bleibt vollständiges Ist-Datum; Stephan kann sie bewusst nur aus dem Protein-Aktivtage-Score nehmen |
| Endpunkt / Kopplung | Maximal C4-S6 mit belegtem Produktpostimage und `(DONE)`-Archiv; R15 bleibt ein eigenes, erst danach neu zu prüfendes G0 |
| Autonomie | `gated`; Stephan hat im Ausführungsauftrag vom 2026-09-29 S1–S4R und anschließende grüne lokale S4-Wellen autorisiert; S4R-Briefing erfolgt vor S4; externe Writes bleiben Owner-gated |
| Reasoning | Erstellung/Initialreview auf Stephans Wunsch Extra High; UI-Runtime-Einstellung `NOT_OBSERVABLE`. Ausführung: S1–S3 High, S4R Extra High, lokale S4-Welle High, S5-Cutover Extra High, S6 Medium; Wechsel nur an Wellengrenzen |
| Externes Review | S1–S4 keines; S5 nach lokaler Matrix und nativem Full Review genau ein CodeRabbit-Initiallauf, Verifikation höchstens einmal nach berechtigten Fixes |
| Evidence-Owner | C4; `docs/archive/MIDAS Activity V2 C4 Activity Truth and Protein Relevance Evidence (DONE).md`; in S4R angelegt, enthält lokale und produktive Nachweise sowie ausdrückliche Abweichungen |
| Owner-Gates | produktives SQL, Edge-Deploy, Pages-/PWA-Auslieferung, produktiver Testwrite/Delete, Android-Geräteaktion, Commit/Push jeweils getrennt und nur mit gültiger Freigabe |
| Archivziel | `docs/archive/MIDAS Activity V2 C4 Activity Truth and Protein Relevance Roadmap (DONE).md` samt Evidence `(DONE)` |

**Historischer Fresh-Chat-Auftrag (S1–S5 ausgeführt):** Diese Roadmap zuerst mit `AGENTS.md`, Root-README, lokalem Environment-Overlay, Resume Card, Context Receipt, Findings und relevantem Git-Diff lesen. Danach gezielt Masterplan §4.6/C4/O-11, Activity-/Protein-Overviews, IM-013/HCR-033, R14-DONE-Postimage und betroffene Producer/Consumer lesen. Vor S1 das kanonische KASRKIN-Usage-Gate aus `docs/DEV_ENVIRONMENT.md` ausführen. S1–S4R nur innerhalb der obigen Discovery-Freigabe bearbeiten; weder SQL noch Produktcode vor grünem S4R ändern. Ist der initiale Auftrag im neuen Chat ausdrücklich Implementierung, darf die von S4R freigegebene lokale Welle nach Briefing beginnen; produktive Einzelgates bleiben bestehen. Keine Version, Freigabe oder Geräte-Evidence aus diesem Text ableiten.

**Dirty Boundary:** Der Worktree war bei Erstellung umfangreich verändert. Insbesondere `README.md`, `AGENTS.md`, `CHANGELOG.md`, Masterplan, Activity Overview, Templates, KASRKIN-Dateien und die ungetrackte R15-Roadmap enthalten fremde beziehungsweise frühere lokale Arbeit. Nur C4-bezogene Hunk-Änderungen anfassen und später exakt diese Dateien stagen. Kein `reset --hard`, keine pauschale Bereinigung, kein automatischer Commit/Push.

## Ergebnisvertrag und Grenzen

- Fachlich gibt es genau **zwei** Zustände: Eine Session zählt für den Protein-Aktivtage-Score oder ist bewusst ausgenommen. Alte V1-Aktivitäten und bestehende V2-Sessions zählen; neue V2-Sessions zählen standardmäßig. Eine dritte `legacy_unspecified`-Kategorie wird nicht eingeführt.
- Der Button **„Vom Proteinziel ausnehmen“** steht in der Abschlusskarte vor „Session abschließen“, mobil als gleich großes Touchziel darüber. Standard: neutral/grau und Ausnahme aus. Aktiv: grün mit eindeutiger Textbestätigung **„Vom Proteinziel ausgenommen ✓“**; erneuter Druck hebt die Ausnahme auf. Text/`aria-pressed` belegen den Zustand unabhängig von Farbe.
- Die Entscheidung ist sessionweit und manuell. Keine automatische Ableitung aus Dauer, Cardio/Kraft, Katalogeintrag, Intensität, Schwimmen, Archery Tag oder späterer Importherkunft. Sie bleibt im Draft/Recovery, wird für den Commit-Intent eingefroren und ist im R9-History-/Correction-Pfad nachträglich änderbar.
- Protein zählt in einem rollenden 28-Tage-Fenster eindeutige **Wiener Kalendertage**: Ein Tag mit V1-Aktivität oder mindestens einer zählenden V2-Session zählt einmal; nur ausgenommene V2-Sessions zählen null. Mehrere Sessions erhöhen denselben Tag nie mehrfach. ACT1/2/3, Modifier, CKD-Faktoren, Doctor-Lock und die Protein-Formel bleiben unverändert.
- Ausgenommene Sessions bleiben vollständig in History, Detail, Coaching-Export und maschinenlesbaren Ist-Daten. Der Export benennt die Klassifikation eindeutig. Doctor View, Arztbericht, Health Export und Trendpilot übernehmen **keinen** Proteinfilter; der gemeinsame R11-Snapshot bleibt fachlich vollständig. Der frühere Monthly-Workflow ist entfernt und kein C4-Konsument.
- Nach bestätigt gespeichertem Commit, erfolgreicher Relevanzkorrektur oder bestätigtem Delete wird der Protein-Consumer kontrolliert aktualisiert. Eine fehlgeschlagene Protein-Aktualisierung macht einen bereits bestätigten Activity-Write nicht rückgängig und darf keinen still als aktuell dargestellten Zielwert erzeugen. S2 friert einen begrenzten, wiederholbaren Fehler-/Retry-Pfad gegen den bestehenden Edge-Vertrag ein; keine neue allgemeine Job-Queue.
- R15 importiert keine Proteinentscheidung aus JSON. Freie und später importierte Drafts nutzen denselben Default und dieselbe bewusste Sessionentscheidung. R15 bleibt bis C4-DONE und seinem eigenen G0 gesperrt.
- Nicht in C4: neue Proteinformel, neue medizinische Empfehlung, Aktivitätsautomatik, Trainingsplan, R15-Import, MCP-Write, Retention, V1-Datenumbau, neue Scheduler-/Secret-Architektur oder weitere UI-Neugestaltung.

## Baseline, Quellen und Context Receipt

| Quelle / Frage | Aufnahme 2026-09-29 | Wiederlesen bei |
| --- | --- | --- |
| Masterplan §4.6, §8.1, C4, O-11 | `FOCUSED_COMPLETE`, SHA-256 `89cd8b5e…`; Ownerentscheid binär eingearbeitet | Änderung am Masterplan oder Produktziel |
| Root-README; Activity-/Protein-Overviews | README-Produktgrenze `FOCUSED_COMPLETE`; Activity SHA-256 `e606523c…`, Protein `7d37c83d…`, beide `FOCUSED_COMPLETE` | geänderte Modulverträge; vor S6 exakten Endstand lesen |
| R14-DONE-Roadmap/Evidence und Post-R14-Aktionsplan | R14-Postimage gezielt gelesen; v29 lokal aus `service-worker.js`; Android-Gym-Save 2026-09-29 nur Owner-Beobachtung | neuer Deploy, Writer-/PWA-Drift oder Exact-Source-Gate |
| `sql/20`, `23`–`26`; R7/R8/R9/R10 Runtime | Sessions-Tabelle und Commit-Insert `FOCUSED_COMPLETE`; weitere Signaturen/ACLs in S1 exakt lesen | SQL-, RPC-, ACL- oder Fingerprintänderung |
| Protein Edge, R13 Shared Context, Body-/Scheduler-Trigger | `FOCUSED_COMPLETE`: Protein liest aktuell den gemeinsamen Snapshot; Edge kann Gewicht bei fehlendem Requestwert aus letztem Body laden; Trigger sind `body_save`, `manual`, `scheduler` | Edge-/Snapshot-/Auth-Änderung |
| BLUEPRINT / MIDAS Workflow / ATLAS | Autorenvertrag `COMPLETE`; MIDAS-Workflow `COMPLETE`; zentrale Capability-Abschnitte gezielt `FOCUSED_COMPLETE` | Template-/Binding-/Tooldrift oder Prozess-Finding |
| R15-Vorbereitungsroadmap | C4-DONE/G0-Grenze `FOCUSED_COMPLETE`; ihr aktueller R14-Blockertext ist historisch vorbereitet, kein heutiger C4-Beweis | S6-Handoff und R15-G0 |

**Receipt-Zustand:** `VALID` nur für die genannten Fragen und Fingerprints, nicht als Ersatz für SQL-/Runtime-Exact-Source, produktives Postimage oder einen neuen Chat-Diff. `PROTECTED`: fremde Worktree-Änderungen, V1-Historie, Doctor-Lock und vollständiger R11-Read-Vertrag. Keine abgeschnittene Suchausgabe wurde als vollständige Quelle übernommen. Baseline-Commit allein fingerprintet die schmutzigen Dateien nicht; bei Drift gezielt Original lesen.

### Environment Capability Preflight

Prüfdatum `2026-09-29`; [MIDAS-Overlay](../DEV_ENVIRONMENT.md) und nur die passenden [ATLAS-Abschnitte](../../../codex-tools/environment/DEV_ENVIRONMENT.md) wurden gelesen. Verfügbarkeit ist keine Produkt-, Secret- oder Deployfreigabe.

| Capability / C4-Bedarf | ATLAS / lokaler Nachweis | Zustand / nächstes Gate |
| --- | --- | --- |
| Git, Node, Deno, Supabase CLI, WSL-`psql` für Diff, JS, Edge und SQL-Fixture | `git 2.55.0`, Node `24.18.0`, Deno `2.9.7`, Supabase `2.109.1`, `psql 16.15`; Versionen read-only geprüft | `AVAILABLE_VERIFIED` als CLI; konkrete Kommandos vor Nutzung mit `--help` prüfen |
| Browser/PWA-Smoke | Playwright `1.61.1`, Chromium-Headless-Launch erfolgreich; Browser-Plugin als bevorzugte Oberfläche prüfen | `AVAILABLE_VERIFIED` lokal; Produkt- und Gerätepfad bleiben separate Nachweise |
| Docker Desktop / disposable PostgreSQL-17-Test | Docker-CLI `29.7.2` und Desktop-Datei vorhanden; `docker info` scheiterte, weil der Linux-Daemon nicht läuft | `AVAILABLE_UNVERIFIED_OR_STALE`; vor S4-SQL-Fixture Desktop lokal starten und Daemon/isolierte DB verifizieren; bis dahin S4 blockiert, kein Setup behauptet |
| CodeRabbit S5, GitHub/Pages, Supabase-Projektzugriff | `coderabbit 0.7.6`, `gh 2.96.0` und CLI-Projektliste erreichbar; Repo-`.env.supabase.local` vorhanden, Werte nicht ausgegeben | CLI `AVAILABLE_VERIFIED`; Review-Auth/Budget, exaktes Zielprojekt, Deployrechte und produktives Runtimepostimage am jeweiligen Gate neu prüfen |
| KASRKIN-Usage-Gate | `kasrkin version` löst gebundene Release `kasrkin-4f3f71b333dfe784` auf | `AVAILABLE_VERIFIED` für Command; **kein** aktueller Usage-Entscheid – frisches `kasrkin validate -Refresh` vor S1 und jedem späteren Pflichtblock |
| Android-Gerät | Stephan führt den Geräte-Smoke aus | Agent-ADB/Installation `NOT_REQUIRED`; Owner-Aktion und Ergebnis separat dokumentieren |

Fehlt beim späteren Gate eine benötigte Capability tatsächlich oder ist sie inkompatibel, `OWNER_TOOLING_DECISION_REQUIRED`; keine Installation aus dieser Roadmap. Ein nur gestoppter Docker-Daemon ist zunächst eine erneute lokale Verifikation, keine behauptete Tool-Unvereinbarkeit.

## Risiken, Entscheidungen und Findings

| ID | Priorität / Vertrag | Disposition / Gate |
| --- | --- | --- |
| F-C4-01 | P1: Masterplan hatte `legacy_unspecified`, Owner hat alle bisherigen Einträge als zählend bestätigt | Vor Roadmap-Freeze auf binären Produktvertrag korrigiert; S1 bestätigt Diff und R15-Abhängigkeit |
| F-C4-02 | P1: gemeinsamer R11-Snapshot speist Protein und andere Leser; globaler Filter würde Activity-Daten verschwinden lassen | S2 wählt und reviewt eine **protein-spezifische Read-Projektion** oder eine gleichwertig isolierte Alternative; S4 bis dahin STOP |
| F-C4-03 | P1: Activity-Commit sendet `activity:changed`, ruft Protein aber nicht gezielt neu auf; Edge kennt keinen Activity-Trigger | S2 friert den Weg für Commit, Correction, Delete und Fehler/Retry ein; keine stille stale Anzeige |
| F-C4-04 | P1: alte PWA-Clients, Request-ID-Fingerprint und R7-v3-Recovery können am neuen Feld brechen | S3 verlangt Missing-Field-Default `true`, stabile Idempotenz, alten Draft und Forward-/Rollback-Postimages |
| F-C4-05 | P1: Rollback auf alten Protein-Consumer nach ersten ausgeschlossenen Sessions würde diese wieder mitzählen | S3 definiert Stop/Forward-Fix oder kompatiblen Reverse; keine blinde Rücknahme von Filter oder Spalte |
| F-C4-06 | Tool-Gate: Docker-Daemon war beim Authoring aus | S4R: Daemon erreichbar, PG17-Image vorhanden; konkrete Fixture prüft dedizierte DB selbst; kein produktives SQL als Testersatz |
| F-C4-07 | Authoring-P1: Masterplan nannte den entfernten Monthly-Workflow als aktiven Negativconsumer | Im initialen Contract Review aus C4/O-11 und Testmatrix entfernt; aktiver Range-Arztbericht bleibt Negativconsumer |
| F-C4-08 | Authoring-P1: Evidence erst vor produktivem Nachweis zu spät für Migration/ACL/Reverse | Evidence-Anlage nach S4R vor die erste SQL-Fixture vorgezogen |
| F-C4-09 | Authoring-P1: produktiver Score-Test ohne Zeitfenster-, V1/V2-, Gewichts- und Doctor-Lock-Preflight mehrdeutig | T-C4-06 an aktiven Score und eindeutigen 28-Tage-Tag gebunden; Zielgramm nicht als Orakel verwendet |
| F-C4-10 | Authoring-P1: „explizit berücksichtigte Sessions“ im Masterplan widersprach dem Default und ließ V1-Aktivitäten offen | C4/O-11 auf V1 oder nicht ausgenommene V2-Session pro Wiener Tag präzisiert |

## S1–S4R: begrenzte Discovery und Readiness

| Schritt | Auftrag / Exit | Review / Gate |
| --- | --- | --- |
| S1 Systemkarte | Dirty Boundary, tatsächliche SQL-/RPC-Signaturen und ACLs, R7-Draft/Recovery, R8-Commit, R9-Correction/Delete, R10-Export, Protein-Edge samt Scheduler/Body, R11/R13-Consumer und v29-Productload gezielt kartieren. Bestehende Checks/Fixtures und produktives R14-Postimage identifizieren. | Full Contract Review im Scope; F-C4-01 und Quellendrift schließen oder STOP; keine Produktänderung |
| S2 Zielvertrag | Binäre SQL-/Payload-/Export-Namen und Default; V1/V2-Mischtage; Draft-/Retry- und History-CAS-Semantik; protein-spezifische Projektion samt User-/Service-Auth; Trigger und sichtbarer stale-/Retry-Pfad; UI-Copy und Accessibility einfrieren. Keine zusätzliche RPC, wenn bestehender R9-Correction-Vertrag reicht. | Full Contract Review; F-C4-02/03 schließen; echte Grundsatzlücke → Owner-Gate |
| S3 Bruch/Security | RLS, explizite Grants, SECURITY-Modus, Owner-Isolation, idempotente Migration, Rerun, alte PWA/alte Drafts, V1-Dedupe, 28-Tage-/Wien-Grenze, Doctor-Lock, Cache, Rollback nach `false`-Daten und keine stillen Negativconsumer prüfen. | Full Risk Review; F-C4-04/05 schließen; Forward/Reverse und Stopbedingungen belastbar |
| S4R Readiness | Tool-/Secret-Readiness-Matrix (Namen und Speicherort, nie Werte), S4-Dateien und sichere lokale Batch-Grenzen, S5-Matrix, produktives Pre-/Forward-/Rollbackpostimage, günstiger Precheck und **Gesamtaufwand** inkl. Rehydration, Toolinteraktionen, Browser, Review, Doku, Troubleshooting, Postchecks prognostizieren. C4-Evidence vor SQL-Fixture anlegen; Docker-/Browserfähigkeit nur soweit nötig neu prüfen. | Full Review; bei `large` Owner-Briefing vor S4; keine Umsetzung, bevor alle P1 geschlossen/zugeordnet und lokale Capability grün ist |

S1–S3 sind jeweils ein deterministischer Gesamtblock mit Findings-Korrektur, Status und ersetzter Resume Card. Nach jedem Hauptschritt vor dem nächsten frisches KASRKIN-Gate. Bei einem Owner-Gate, echter Quellenkollision oder Usage-Stop endet die Discovery Wave an einer sicheren Resume-Grenze.

## S4: lokale Umsetzung in kohärenten Wellen

S4R darf benachbarte **lokale** Substeps ohne Zwischen-Gate bündeln, wenn ein gemeinsamer Review alle Ergebnisse einzeln abdeckt. Kein Fullmatrix-Lauf je Datei; S4 nutzt gezielte Delta-/Consumer-Reviews und nur invalidierte Checks. Produktive Aktionen gehören erst nach grünem S5-Lokalreview in gesonderte Gates.

| Substep | Änderung / Postcondition | Kleinster Nachweis |
| --- | --- | --- |
| S4.1 SQL | Nummerierten additiven MIDAS-SQL-Vertrag samt geprüftem Reverse vorbereiten: V2-Session-Bool mit Default `true`, vorhandene V2-Zeilen weiter `true`, alte Payloads kompatibel; Commit-/R9-Correction-/History-/R10-Export- und protein-spezifischen Read-Vertrag nach S2. Bestehende V1-Daten nicht umschreiben. | eine disposable SQL-Fixture: alter/neuer Client, bestehende/ausgenommene Session, Wiederholung, CAS/Idempotenz, RLS/ACL und Reverse-Guard |
| S4.2 Activity | Session-Draft, R7-Recovery, Shell-Button, Commit-Fingerprint, History-Korrektur und Export auf **denselben** Wert bringen; Speicherversuch friert Entscheidung ein; PWA-Assets konsistent versionieren. | gezielte Contracttests und ein echter mobiler Last-Mile-Harness vom Tap über Listener/Recovery/Commit zu Data Access; kein zweiter Savepfad |
| S4.3 Protein Edge | `midas-protein-targets` und direkte Adapter auf isolierte Protein-Tage umstellen, Activity-Mutation-Trigger ergänzen; bestehende Body-/Scheduler-Pfade, Formel, Doctor-Lock und nicht gefilterte Trendpilot-/Report-Leser bewahren. Save-Erfolg und Protein-Refresh-Fehler sichtbar trennen. | Deno-Handlerfälle für User/Service, Default, ausgeschlossenen und gemischten Tag, Correction/Delete, Cooldown, fehlendes Gewicht und sichere Fehlerantwort |

Erwartete Dateigruppen: `sql/` samt Fixture/Reverse; Activity-V2-Draft/Recovery/Shell/Commit/History/Export/Data Access plus `assets/js/main.js`; `backend/supabase/functions/midas-protein-targets/` und nötige private Read-Projektion; `index.html`/`service-worker.js` nur für Productload/PWA; direkte Tests. `sql/HOW_TO.md` wird in S6 mit dem geprüften Cutover synchronisiert. S4R bestätigt die **konkreten** Dateien und entscheidet, ob eine Gruppe kleiner bleibt. Kein neues Framework, keine allgemeine Sync-Queue.

## S5: einmalige integrierte Prüfung und getrennte Produktgates

Vor S5 frisches Usage-Gate. Zuerst günstiger Productload-/Cache-/Schema-Precheck, dann nur diese risikorelevante Matrix; bereits grüne, unveränderte R14/R13-Checks über Evidence-ID übernehmen. Nach einer Korrektur ausschließlich invalidierte Checks wiederholen.

| ID | Prüfvertrag / Ebene | Soll |
| --- | --- | --- |
| T-C4-01 | disposable PostgreSQL: Migration, Rerun/Reverse, vorhandenes `true`, alte RPC-Payload, Request-ID-Konflikt, Revision/CAS, RLS/ACL | ein Writer, keine Legacy-Verfälschung, kein ungeprüftes `false`-Rollback |
| T-C4-02 | JS/IndexedDB: Default, Buttonwechsel, Reload-Recovery, eingefrorener Commit, History-Korrektur, Export | Wert bleibt über genau einen bestehenden Draft-/Commit-/Correction-Pfad erhalten |
| T-C4-03 | Deno Edge: 28-Tage-Wien, V1+V2 am selben Tag, ausschließlich ausgenommen, gemischt, Thresholds/Doctor-Lock, Body-/Scheduler-Trigger, Fehler/Retry | nur Protein-Score filtert; keine stille stale Zielanzeige |
| T-C4-04 | Browser-Harness Desktop + ein schmales mobiles Viewport, bevorzugt Browser-Plugin, sonst dokumentierter Playwright-Fallback | echter Tap → aktiver Listener → Draft/Recovery → Commit → Data Access/Transport; Fokus, Text/Farbe, Touchziel, kein Überlauf |
| T-C4-05 | Negative Consumer + PWA-Cache | Doctor/Report/Health/Trendpilot behalten volle Ist-Daten; alter Client speichert als `true`, neue Assets kohärent |
| T-C4-06 | produktiv, owner-gated | **ein** eindeutig abgegrenzter Testeintrag an einem sonst inaktiven Wiener Tag **innerhalb** des 28-Tage-Fensters: vorher V1-/V2-Leere, berechenbarer Protein-Edge samt Gewicht/Doctor-Lock-Preflight und `protein_activity_score_28d`-Baseline belegen; ausgeschlossen speichern → Score unverändert, per R9 einschließen → Score +1, bestätigen/löschen → Score zurück zur Baseline; vorab Testdaten-/Zeit-/Cleanup-Gate und Datenschutzgrenze. Zielgramm sind bei Doctor-Lock kein Orakel. |
| T-C4-07 | Android-PWA, owner-gated | Stephan sieht Default und Umschaltung, speichert ohne Hänger; History/Export-Status und Protein-Anzeige entsprechen dem bestätigten Fall; nicht beobachtete Teilpfade bleiben NOT PASS |

Nach T-C4-01–05: nativer Full Code-/Contract-/Security-/Scope-Review des Gesamtdiffs. Dann ein CodeRabbit-Initiallauf mit `coderabbit review --agent -t uncommitted`; Findings gesammelt bewerten, berechtigte Fixes minimal ausführen, invalidierte Checks wiederholen und höchstens einen Verifikationslauf. Keine Reviewspirale, keine CodeRabbit-Ausführung in S1–S4.

**Produktiver Cutover, jeweils eigener Owner-Gate mit Briefing, Preimage, Wirkung, Reverse und Postcheck:**

1. SQL-Datei und geprüftes Zielprojekt nach [RB-004](../qa/runbooks/supabase-sql-cutover.md), lokale Fixture grün; alte Clients zählen weiter. Kein pauschales History-Backfill außer dem bestätigten Default `true`.
2. Protein-Edge-Deploy nach [RB-003](../qa/runbooks/edge-function-deploy-smoke.md), read-only beziehungsweise `dry_run`-Smoke nur bei bewiesenem Nicht-Schreibmodus; User- und Scheduler-Auth getrennt.
3. Nach kohärentem SQL-/Edge-Postimage Pages-/PWA-Auslieferung samt v29→neuer Cache-Grenze; Commit/Push nur auf separaten Auftrag, Pages-Run und Fresh-/Upgradeclient prüfen.
4. Erst danach T-C4-06 und T-C4-07 mit ausdrücklicher Testwrite-/Gerätefreigabe; SQL-Zähler, Protein-Score, Export und Cleanup ohne personenbezogene Rohdaten als Evidence. Wenn ein Teil ausfällt: vorbereiteten Rollback und Daten-/Runtimepostcheck abschließen; Ursachenanalyse erst in neuem Block mit Usage-Gate.

Nach einem produktiven `false`-Eintrag darf weder der alte Protein-Consumer blind redeployed noch die Spalte blind entfernt werden. Stop/Forward-Fix oder ein C4-kompatibler Rückfall ist die sichere Grenze; Datenänderung benötigt eigenes Owner-Gate. Ein erfolgreicher lokaler Test ersetzt kein produktives Postimage.

## S6: Source of Truth und Closure

Nach grünem S5 und frischem Usage-Gate: Activity- und **Protein**-Module-Overviews, Masterplan-C4-Status, passende QA-Suites (`HCR` Activity, `IM` Protein; bestehende `BS`-Securitychecks referenzieren), SQL-HOW_TO und `CHANGELOG.md` mit tatsächlichem Postimage synchronisieren. `docs/QA_CHECKS.md` bleibt Linkindex. R15 erhält im G0-Handoff den finalen binären Default, Draft-/Export-/API-Vertrag und Evidence-IDs; R15 selbst wird nicht ausgeführt. Finaler nativer Contract Review und Findings-Korrektur, Resume Card ersetzen, Roadmap/Evidence erst bei belegter Acceptance als `(DONE)` archivieren. Commit/Push/Tag sind keine automatische S6-Folge.

**DONE bedeutet:** Alle In-Scope-P0/P1 geschlossen; SQL/RPC/ACL und PWA kohärent; genau ein produktiver Writer; alte Aktivität und neue Default-Sessions zählen, ausschließlich ausgenommene Sessions nicht; Korrektur/Delete aktualisieren den Protein-Score ohne stille stale Anzeige; Doctor-Lock und alle Negativconsumer unverändert; erforderlicher Owner-Smoke/Android-Status ehrlich dokumentiert; Daten-/Runtimepostcheck und Doku stimmen überein.

## Entscheidungslog, Review und Resume Card

### Execution-Checkpoints bis 2026-09-30

| Gate | Validierung | 5h / Woche | Reset-IDs 5h / Woche | Entscheidung / Zulassung |
| --- | --- | --- | --- | --- |
| vor S1, `POST_REHYDRATION_BASELINE` | `kasrkin validate -Refresh`, VALID/OK, Schema 3, Sensor 3.1.0 | 68 % / 44 % | `1790715177` / `1791137109` | `CONTINUE / PRIMARY_ALLOWED`; kein früherer C4-Checkpoint für ein Delta |
| vor S2 | `kasrkin validate -Refresh`, VALID/OK | 64 % / 43 % | `1790715177` / `1791137109` | `CONTINUE / PRIMARY_ALLOWED`; gleicher Reset, Delta 4 / 1 Prozentpunkte nach S1 |
| vor S3 | `kasrkin validate -Refresh`, VALID/OK | 61 % / 43 % | `1790715177` / `1791137109` | `CONTINUE / PRIMARY_ALLOWED`; gleicher Reset, Delta 3 / 0 Prozentpunkte nach S2 |
| vor S4R | `kasrkin validate -Refresh`, VALID/OK | 60 % / 42 % | `1790715177` / `1791137109` | `CONTINUE / PRIMARY_ALLOWED`; gleicher Reset, Delta 1 / 1 Prozentpunkte nach S3 |
| vor S4.2 | `kasrkin validate -Refresh`, VALID/OK, 2026-09-30 17:03:02 +02:00 | 99 % / 35 % | `1790798563` / `1791137109` | `CONTINUE / PRIMARY_ALLOWED`; neuer 5h-Reset, kein 5h-Delta über die Grenze |
| vor S4.3 | `kasrkin validate -Refresh`, VALID/OK, 2026-09-30 17:59:21 +02:00 | 32 % / 24 % | `1790798563` / `1791137109` | gleicher Reset, S4.2-Delta 67 / 11; `CONTINUE_WITH_CAUTION`, `PRIMARY_REJECTED_FOR_RESERVE`; Restricted-Work-Episode `AVAILABLE`, keine S4.3-Arbeit |
| S4.3 Wiederaufnahme | genau ein `kasrkin validate -Refresh`, VALID/OK, 2026-10-01 06:01:34 +02:00 | 98 % / 23 % | `1790845280` / `1791137109` | gemessener neuer 5h-Reset; Agent leitete Admission aus Projektion ab, **kein Policy-Admission-Beleg** (G-C4-01); lokale Welle technisch abgeschlossen |
| vor S5 | genau ein `kasrkin validate -Refresh -Envelope`, VALID, 2026-10-01 06:27:31 +02:00; anschließend gebundenes `kasrkin policy` | 80 % / 20 % | `1790845280` / `1791137109` | `CONTINUE_WITH_CAUTION / PRIMARY_REJECTED_FOR_RESERVE`, `CAUTION_BLOCK_NOT_ELIGIBLE`, nur `CLOSURE_ONLY`; S5 nicht begonnen |
| G-C4-01 Restarbeit | genau ein `kasrkin validate -Refresh -Envelope`, VALID, 2026-10-01 06:34:52 +02:00; gebundenes `kasrkin policy` | 77 % / 20 % | `1790845280` / `1791137109` | `CONTINUE_WITH_CAUTION / PRIMARY_ALLOWED`, `CAUTION_SINGLE_BOUNDED_BLOCK_ALLOWED`; enge dokumentarische Admission-Klärung abgeschlossen, Episode jetzt `CONSUMED` |
| Prüfwellen-Vorschlag | genau ein `kasrkin validate -Refresh -Envelope`, VALID, 2026-10-01 06:41:36 +02:00; gebundenes `kasrkin policy` | 75 % / 19 % | `1790845280` / `1791137109` | Vorbereitung von Stephan beauftragt, aber `PRIMARY_REJECTED_FOR_RESERVE / RESTRICTED_EPISODE_CONSUMED`; nur Closure, nicht begonnen |

Reasoning-Runtime: `NOT_OBSERVABLE`; kein technischer Wechsel behauptet.

### S1 Systemkarte und Full Contract Review

`PASS` für den kartierten Ist-Vertrag; keine Produkt- oder SQL-Änderung. Git-Baseline `ddbcf4c`, lokaler Root-SW `v29`; der bereits schmutzige Worktree bleibt erhalten. Der C4-Masterplan-Diff enthält O-11 mit binärem Default, V1-/V2-Mischtag und R15-Abhängigkeit; F-C4-01 ist damit im aktuellen Quellstand geschlossen. Die R14-DONE-Evidence belegt den einzigen produktiven V2-Writer und den damaligen Write/Reader/Delete, aber keinen C4- oder aktuellen Android-Nachweis. Der Post-R14-Aktionsplan dokumentiert lokale v29-Reparaturen; v29 ist hier nur lokales Productload-Preimage.

| Pfad | Aktueller Vertrag / C4-Bruchstelle |
| --- | --- |
| SQL20/22/23 | `health_activity_sessions` besitzt `user_id`, `request_id`, Fingerprint, generierten Wiener `day` und R9-`revision`, noch kein Protein-Bool. Commit `activity_v2_commit_session(uuid,jsonb)` und Replace/Delete mit Revision/Fingerprint sind SECURITY DEFINER; List/Detail SECURITY INVOKER. SQL23 stellt selektive Lese-Grants und nur RPC-Write bereit. Ein neues Feld muss alte Commit-Payloads und dieselbe Request-ID-Replay-Semantik erhalten. |
| SQL24/26 | Coaching-Export `activity_v2_coaching_export(date,date)` ist ein eigener read-only RPC. SQL26 `activity_consumer_snapshot(date,date)` und `..._for_owner(uuid,date,date)` rufen denselben privaten Core auf; dieser vereinigt V1-Events und alle V2-Sessions und dedupliziert Wiener Tage. User-RPC ist `authenticated`, Owner-RPC `service_role`; gemeinsamer Filter wäre ein Consumer-Bruch. |
| R7/R8/R9 Browser | Draft v3 und Commit-Intent v1 prüfen exakte geordnete Keys. Recovery hält den Draft und friert den Commit-Intent für Retry ein. R9-Correction nutzt die vorhandene Replace-CAS und Delete; History/List/Detail und Export haben exakte Client-Schemata. Jede neue Kennzeichnung muss alle diese Schichten koordiniert erweitern. |
| Protein Edge | `midas-protein-targets` lädt den gemeinsamen SQL26-Snapshot über User-/Scheduler-Principal, bildet daraus 28 Wiener Aktivtage und schreibt `protein_activity_score_28d` ins Profil. Trigger sind bisher `body_save`, `manual`, `scheduler`; fehlendes Requestgewicht kann aus dem letzten Body stammen. Doctor-Lock, Cooldown und Formel sitzen im Handler. |
| Productload/Trigger | `assets/js/main.js` montiert genau einen Activity-Controller. Nach Commit löst er `activity:changed` und UI-Refresh aus; der Controller schluckt Fehler dieses Consumer-Refreshs. Ein direkter Protein-Neulauf und ein sichtbarer Fehlerpfad fehlen. `index.html`/Root-SW referenzieren v29 mit gemischten Asset-Queryversionen. |
| Negative Consumer | Doctor View, Range-Arztbericht, Health Export und Trendpilot verwenden vollständige Ist-Aktivität aus SQL26 bzw. ihren Adaptern; C4 darf deren V1/V2-Daten nicht filtern. Der entfernte Monthly-Workflow ist kein aktiver Cutover-Consumer. |

Gezielte Quellen: Masterplan §4.6/§8.1/C4/O-11, Activity-/Protein-Overviews, IM-013/HCR-033, R14-DONE-Evidence, Post-R14-Aktionsplan, SQL20/22–26 und die genannten Runtime-Producer/Consumer. Fokusreads sind `FOCUSED_COMPLETE`; die breite `rg`-Indexausgabe war teils abgeschnitten und wurde nur als Wegweiser verwendet. Review: Signaturen, ACL-Grenzen, Writer-/Readerzuständigkeit, R14-Postimage und Dirty Boundary gegen Roadmap geprüft; kein neuer P0/P1-Quellwiderspruch. S2 muss F-C4-02/03 mit einem isolierten Protein-Read und einem sichtbaren Aktualisierungspfad schließen.

### S2 eingefrorener Zielvertrag und Full Contract Review

`PASS` als Vertragsentscheidung, noch kein Runtime-Nachweis. F-C4-02/03 sind konzeptionell geschlossen; S3 prüft die Sicherheit und S4/S5 beweisen die Implementierung.

| Fläche | C4-Vertrag |
| --- | --- |
| Binärwert | SQL-Spalte und JSON-Schlüssel `protein_target_relevant` (`boolean NOT NULL DEFAULT true`). `true` heißt: Session zählt für den Protein-Aktivtage-Score. Vorhandene V2-Zeilen und fehlende alte Commit-Felder sind `true`; ausschließlich explizites `false` nimmt aus. Kein `null` und keine dritte Kategorie. |
| Commit/Replay | Bestehende Signatur `activity_v2_commit_session(uuid,jsonb)` und `midas.activity-session.v1` bleiben. Optionaler boolescher Payload-Schlüssel wird strikt validiert. Der bestehende kanonische Request-Fingerprint bleibt für fehlendes Feld oder explizites `true` bytegleich; nur `false` wird dem kanonischen Hashinhalt hinzugefügt. So replayt ein alter Request nach Migration, während gleicher Request mit geänderter Relevanz kollidiert. Commit-Response v1 bleibt für alte Clients unverändert. |
| Draft/Recovery | Neue Drafts führen den Wert im sessionweiten Snapshot (`draft.v4`, Default `true`); R7 validiert v3/v4. Ein v3-Draft ohne laufenden Commit wird beim Restore deterministisch zu `true` normalisiert. Bereits gespeicherte v1-Commit-Intents und unbekannte Versuche behalten ihren originalen Request, die Payload und Request-ID bis zur Klärung; neue Intents v2 frieren den booleschen Wert ein. Während `preparing`/`committing`/`unknown` ist die Umschaltung gesperrt. Kein neuer Draft-Speicherpfad. |
| History/CAS | Dieselbe R9-Replace-Signatur nimmt optional `protein_target_relevant`; fehlend erhält **den aktuellen DB-Wert**. Ein expliziter Wechsel erhöht die Revision atomar; Current/Desired-Fingerprint umfasst `false`, während `true` den alten kanonischen Fingerprint beibehält. Der bestehende Revision- und Fingerprint-CAS gilt auch für reine Relevanzkorrektur und Delete. History-Detail/List zeigen den Wert; alte Clients dürfen bei neuem Response-Schema fail-closed auf den PWA-Refresh warten, aber alte Saves bleiben gültig. Keine separate Correction-RPC. |
| Export | R10-Export behält alle V1- und V2-Ist-Sessions. Jede V2-Session enthält maschinenlesbar `protein_target_relevant`; Clients validieren das neue Exportschema und kennzeichnen `false` verständlich. Kein Sessionfilter. |
| Isolierte Protein-Projektion | Neue, ausschließlich für Protein benutzte SQL-Read-RPCs `activity_protein_days(date,date)` für `authenticated` und `activity_protein_days_for_owner(uuid,date,date)` für `service_role`; gemeinsamer privater SECURITY-INVOCER-Core liefert eindeutig sortierte Wiener Tage und Count. V1 zählt immer, V2 nur bei `protein_target_relevant = true`; Union/DISTINCT dedupliziert Misch- und Mehrfachsessions. SQL26 und alle anderen Leser bleiben bytegleich. Edge nutzt die eigene strikt validierte Projektion für ACT1/2/3; Formel, CKD, Doctor-Lock und Body-/Scheduler-Verhalten bleiben. |
| Trigger/Fehler | Nach bestätigtem Commit sowie bestätigter R9-Correction/Delete löst die bestehende Product-Composition genau einen gezielten `midas-protein-targets`-Aufruf mit `trigger: activity_save` beziehungsweise `activity_correction`/`activity_delete` aus, ohne neue Persistenzqueue. Fehlendes Gewicht folgt dem bestehenden letzten Body. Activity-Mutation bleibt bei Edge-Fehler erfolgreich; die Oberfläche zeigt „Training gespeichert; Proteinziel noch nicht aktualisiert“ und bietet einen expliziten Retry, bis ein bestätigter Proteinlauf/Profil-Reload die Anzeige freigibt. Weder `activity:changed` noch ein verschlucktes Promise gilt als Protein-Nachweis. Auth-/Scheduler-Zweige werden getrennt geprüft. |
| Button | Abschlusskarte unmittelbar vor „Session abschließen“: „Vom Proteinziel ausnehmen“, neutral/grau, `aria-pressed=false`; aktiv grün, „Vom Proteinziel ausgenommen ✓“, `aria-pressed=true`; erneuter Druck setzt `true`. Mobil gleich großes Touchziel darüber, Tastatur/Fokus und Text tragen den Zustand unabhängig von Farbe. History-Korrektur zeigt denselben binären Textvertrag. |

Review: Der optionale SQL-Schlüssel bewahrt die vorhandenen RPC-Signaturen und den alten Fingerprint; `false` kann nicht über eine alte Replacement-Payload zu `true` werden. Die separate Protein-Projektion hält SQL26 als Negativconsumer stabil. Die bestehende Edge-Read- und UI-Refreshkette erklärt, warum ein eigener bestätigter Protein-Refresh mit sichtbarem Retry erforderlich ist. Offene Umsetzungsdetails (exakte R7-Envelope-Migration, History-Schema-Versionen und konkrete Statusdarstellung) bleiben an diesen Vertrag gebunden und werden in S3/S4 geprüft; sie sind keine neue fachliche Entscheidung.

### S3 Bruch-, Security- und Reverse-Review

`PASS` als Risikovertrag, keine Produktänderung. F-C4-04/05 sind mit folgenden Stopbedingungen geschlossen; die Fixture und der tatsächliche Runtimecheck bleiben S4/S5-Gates.

- **ACL/Owner:** SQL27 erweitert nur die vorhandene Tabelle additiv. RLS-Select `(select auth.uid()) = user_id` plus nicht-anonymer JWT-Check bleibt; kein Browser-UPDATE/INSERT/DELETE-Grant. Commit/Replace/Delete behalten SECURITY DEFINER, leeren `search_path`, `auth.uid()`/nicht-anonymen Check, Owner-Prädikat und explizite EXECUTE-Grants nur für `authenticated`. Die neue Protein-Projektion ist SECURITY INVOKER, prüft beim User-Wrapper dieselbe Auth-Bedingung wie SQL26 und nimmt `p_owner` nur in einem `service_role`-Wrapper an. Private Core-EXECUTE und Schema-USAGE sind explizit; `anon` und `PUBLIC` erhalten nichts. User-/Service-/Fremdowner- und anonyme Negativfälle gehören in die Fixture.
- **Migration/Rerun:** SQL27 läuft unter PostgreSQL 17/postgres in einer Transaktion mit kurzen Timeouts und einem exakt geprüften SQL22–26-/ACL-/Spalten-Preimage. `ADD COLUMN ... boolean NOT NULL DEFAULT true` erhält bestehende Zeilen; kein V1-Backfill. Rerun erkennt ausschließlich das exakte C4-Postimage und prüft Funktionen, ACLs, Default/NOT NULL, Zeilen- und Datenhashes. Teilstände oder Quellendrift brechen ab. Vorher/Nachher sind Counts, boolesche Verteilung, V1-Events und Funktions-/ACL-Fingerprints zu sichern, ohne personenbezogene Rohdaten zu protokollieren.
- **Alte Clients/Drafts:** Alte Commit-Payloads ohne Feld bleiben `true` und replayen mit unverändertem Fingerprint; `false` mit derselben Request-ID ist Konflikt. Ein bestehender Recovery-Draft v3 wird nur ohne eingefrorenen Commit zu v4/`true` migriert. Ein alter gespeicherter Commit-Intent v1 samt Request-ID bleibt bis Bestätigung oder bekanntem Nicht-Commit unverändert. Der neue Client darf bei unbekanntem Remote-Ausgang keinen zweiten Intent und keinen anderen Bool senden. Alte History-Clients, die neue Detail-/List-Keys strikt ablehnen, müssen fail-closed bleiben und ein kohärentes PWA-Update erhalten; keine stillen Korrekturen.
- **Wien/Consumer:** SQL-Projektion begrenzt `day` sowie den Wiener Halbopen-Zeitraum `[from 00:00, to+1 00:00)`; 28 Tage inklusive, Sommerzeitgrenzen und V1/V2-Mischtag dedupliziert. `false` filtert nur diesen RPC. SQL26/R11/R13, Doctor, Range-Bericht, Health Export, Trendpilot und R10-Vollständigkeit sind Negativorakel. Edge muss fehlendes Gewicht, Doctor-Lock, Cooldown und Scheduler getrennt von neuer Aktivitätsmutation prüfen; erfolgreiche DB-Mutation plus fehlgeschlagener Edge-Refresh bleibt sichtbar stale mit Retry.
- **Forward/Reverse:** Vor dem ersten `false`-Write darf ein exakter, lokal geprobter Reverse SQL27-Funktionen und Spalte nur nach Nonuse-/Null-False-Guard zurücknehmen; R14-/R13-Objekte und Daten bleiben. Nach irgendeinem `false` ist ein Drop der Spalte oder Redeploy des alten Protein-Consumers verboten. Sichere Grenze ist Stop + C4-kompatibler Forward-Fix bzw. vorbereiteter C4-kompatibler Runtime-Rückfall mit erhaltenem booleschen Datenvertrag; eine Datenumklassifizierung benötigt ein eigenes Owner-Gate. Fehlgeschlagener produktiver Versuch schließt zuerst Rollback und Postchecks, Diagnose beginnt erst nach neuem Usage-Gate.

Full Risk Review: SQL20-RLS und SQL23-Grant-Reparatur, SQL26-User/Service-Wrapper und sein guarded Reverse, SQL22-Commit-Fingerprint, SQL23-CAS/Detail/Delete, R7-v3-Recovery sowie Protein-Principal/Doctor-Lock gegen den C4-Zielvertrag geprüft. Die Browser- und DB-Beweise sind ausdrücklich noch offen; kein P0/P1 wird als Runtime-PASS vorweggenommen.

### S4R Readiness, Wellen und Full Review

`PASS / LARGE / lokale S4-Wellen freigegeben`. F-C4-06 geschlossen: `docker info` erreichte den lokalen Linux-Daemon (Server 29.7.2), `docker version` meldete Server 29.8.1 und das lokale `postgres:17`-Image ist vorhanden. `kasrkin`-Aktivierungsproof bestand mit gebundenem Release `kasrkin-4f3f71b333dfe784`, acht Konsultationsartefakten, VALID-Validator und inaktivem Legacy-Rollback. Der Unterschied zwischen Docker-Info- und Version-Ausgabe ist ein Toolzeitpunkt und kein PostgreSQL-Beweis; die konkrete Fixture prüft ihre DB-Version selbst. Git/Node/Deno/Supabase/CodeRabbit/gh/Playwright sind vorhanden; Chromium-Launch aus dem gültigen Preflight wird übernommen. Browser-Plugin/-Skill fehlen in dieser Sitzung, daher lokaler Playwright-Harness gemäß Frontend-Testing-Skill. Kein Remote-Secret, Projekt-Deployrecht oder produktives Postimage wird hier als grün behauptet.

| Secret/Config-Name | Consumer / kanonischer Speicherort | Lokal nötig | Gate |
| --- | --- | --- | --- |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Protein-Edge User-Principal / Supabase Function Env | nein, lokale Handler-Tests mocken den Principal | vor Edge-Deploy remote read-only prüfen |
| `PROTEIN_TARGETS_USER_ID`, `protein_targets_scheduler` | Protein-Edge Scheduler-Principal / Supabase Function Env | nein | vor Edge-Deploy/Scheduler-Smoke prüfen |
| `PROTEIN_TARGETS_URL`, `PROTEIN_TARGETS_SECRET_KEY` | GitHub Workflow / Actions Secrets; letzter Name auch im lokalen `.env.supabase.local` vorhanden | nein für lokale Tests | vor produktivem Workflow-/Scheduler-Smoke prüfen; kein Run ohne Gate |
| `SUPABASE_PROJECT_REF`, `SUPABASE_SERVICE_ROLE_KEY` | Operator / ignoriertes `.env.supabase.local`, Namen vorhanden | nein für S4/disposable Tests | zielgebundener read-only Preflight vor jeder produktiven Aktion |

Kein Secret-Wert wurde gelesen oder protokolliert. Für S4 wird weder ein produktiver Schlüssel noch eine Remote-Function benötigt. MIDAS verwendet seine nummerierten `sql/NN_*.sql`-Transitions und eine disposable Fixture als Repositoryvertrag; die generische Supabase-CLI-Migrationsanleitung ersetzt diesen projektspezifischen Vertrag nicht. Vor produktivem SQL gelten RB-004 und das separate Owner-Gate.

| Welle | Konkrete Dateigruppen und sichere Postcondition | kleinster Review / Stop |
| --- | --- | --- |
| S4.1 SQL | `sql/27_Activity_Protein_Relevance.sql`, `_Rollback.sql`, `sql/tests/27_Activity_Protein_Relevance_fixture.sql`; additive Spalte, bestehende Commit-/R9-/R10-RPCs, isolierte Protein-Read-RPCs, exakter Reverse. Keine produktive DB. | Disposable PostgreSQL-17-Fresh/Rerun/Reverse/ACL/Replay/CAS; SQL-Delta-/Security-Review. Bei Fixturefehler sicherer lokaler Stand und eigenes neues Gate für offene Diagnose. |
| S4.2 Activity | `session-draft.js`, `session-recovery.js`, `session-commit.js`, `session-correction.js`, `session-history.js`, `session-history-shell.js/.css`, `session-shell.js/.css`, `data-access.js`, `activity-coaching-export.js`, `activity-product-controller.js`, `assets/js/main.js`, direkte Tests/Harness; `index.html`/`service-worker.js` als kohärente Cachegrenze. | Gezielte Contracttests, Delta-/Consumer-Review, echter Tap→Listener→Draft/Recovery→Commit→Data Access/Transport-Harness, Desktop + 390 px; kein zweiter Writer. |
| S4.3 Protein | `backend/supabase/functions/midas-protein-targets/index.ts`, neue private Protein-Read-Adapterdatei und direkte Deno-Tests; `app/modules/vitals-stack/protein/index.js` nur bei nötigem sichtbarem Retry-Vertrag. | User-/Scheduler-/Weight-/Lock-/Cooldown-/Correction-/Delete-Fälle, isolierter Consumer-Review. SQL26/R13 und Trendpilot bleiben unverändert. |

S4.1–S4.3 bleiben getrennte kohärente Hauptblöcke mit eigenem Usage-Gate und Resume nach jeder Welle. Kleine Nachbarkorrekturen innerhalb einer Welle sind erlaubt; kein Fullmatrix-Lauf pro Datei. Reasoning-Wahl gemäß Roadmap: Discovery S1–S3 High, S4R Extra High, lokale S4 High, S5-Cutover Extra High, S6 Medium; tatsächliche Runtime-Stufe bleibt `NOT_OBSERVABLE` und es wurde nichts technisch umgeschaltet.

**Gesamtaufwand-Forecast:** `large`, etwa 20–34 Arbeitsstunden über Discovery/Rehydration (2–3 h), drei lokale S4-Wellen einschließlich Tool-Interaktionen/Fixture/Browser und fokussierter Fehlersuche (11–18 h), integrierte S5-Matrix/nativer Review/CodeRabbit und nötige Retests (4–7 h), getrennte produktive Pre-/Forward-/Rollback-/Postchecks samt Owner-/Android-Zeiten (2–4 h) und S6-Doku/Evidence/Resume/Archiv (1–2 h). Das ist eine Arbeitsprognose, kein KASRKIN-Budget. Bisherige Discovery-Kosten sind keine vergleichbare empirische Reserve für SQL-/Browser-/Cutoverblöcke; numerische Floors werden dafür nicht erfunden. Nach jedem abgeschlossenen Block entscheidet frische Telemetrie über die nächste vollständige Welle.

**S5-Plan:** günstiger Productload-/Cache-/SQL-Precheck, dann T-C4-01–05 genau einmal auf dem integrierten Diff; unveränderte R13/R14-Nachweise per Evidence-ID wiederverwenden. Nativer Full Code-/Contract-/Security-/Scope-Review, dann ein initialer `coderabbit review --agent -t uncommitted`; berechtigte Fixes und nur invalidierte Tests, höchstens ein Verifikationslauf. Produktive SQL-, Edge-, Pages-/PWA-, Testdaten-/Cleanup-, Android- und Commit/Push-Gates bleiben einzeln. Für den UI-Schreibpfad muss T-C4-04 den echten Produktlistener samt aktivem Lifecycle/Recovery und Transport zeigen, nicht nur Komponenten. Bei Pflichtfehler erst Rollback und Daten-/Runtimepostcheck, dann neues Usage-Gate für Diagnose.

**Produktimages:** Preimage vor SQL: SQL26/R14-Writer, boolesche Spalte/RPCs fehlen, Root-SW lokal v29; produktive Version und V1/V2-/Protein-Zähler werden erst read-only am Zielprojekt geprüft. Forward: Spalte/RPCs/ACLs exakt, Altclients `true`, Protein-Edge nutzt isolierte Tage, erst danach neue PWA-Cacheversion; T-C4-06 ausschließlich nach eigenem Testdaten-Gate. Reverse vor `false`: Guarded SQL-Rücknahme und vorheriger Edge/Web-Stand mit unveränderten Daten; nach `false`: nur C4-kompatibler Forward-Fix/Rückfall mit erhaltener Spalte und Filter, kein alter Protein-Consumer. Ein günstiger Precheck prüft Projektref, SQL27-Objekte/ACL-Hash, Edge-Version und SW-Version vor tieferem Smoke.

Evidence-Datei ist vor der ersten SQL-Fixture angelegt. Full Readiness Review: Zielvertrag, Toolfähigkeit, Secret-Namen, Dateiscope, S5-Orakel, produktive Pre-/Forward-/Rollbackpostimages und Owner-Gates sind konsistent. Kein offenes P0/P1 vor lokaler S4; operative Beweise bleiben den benannten Wellen vorbehalten. Owner-Briefing vor S4: C4 bleibt eine Roadmap, weil SQL, Activity und Protein denselben binären Vertrag und dieselbe Evidence teilen; die drei Wellen sind unabhängig resumierbar, externe Aktionen einzeln gated. Stephans aktueller Auftrag autorisiert die lokalen Wellen nach diesem grünen S4R bereits.

### Statusmatrix

| Phase | Status 2026-10-03 | Nächster Beleg |
| --- | --- | --- |
| Autorenschaft / initialer Contract Review | `PASS` für den Entwurf; F-C4-01/07/08/09/10 korrigiert | aktueller Roadmap-/Masterplan-Diff |
| S1 | `PASS`, Full Contract Review; F-C4-01 geschlossen | Systemkarte oben |
| S2 | `PASS`, Zielvertrag und Full Contract Review; F-C4-02/03 konzeptionell geschlossen | S3-Risiko- und S4-Runtime-Beweis |
| S3 | `PASS`, Full Risk Review; F-C4-04/05 als Sicherheitsvertrag geschlossen | S4-Fixture und S5-Postimage |
| S4R | `PASS`, `large`, Full Readiness Review und lokales Owner-Briefing | Evidence und Wellenvertrag oben |
| S4.1 | `PASS LOCAL`; SQL27/Reverse/Fixture und Security-Review | EV-C4-L01, produktiver Cutover EV-C4-P01 |
| S4.2 | `PASS LOCAL`; Draft bis Productload und echter Desktop-/390-px-Tap→Transport | EV-C4-L02, S5 integriert EV-C4-S5-G03–G06 |
| S4.3 | `PASS LOCAL`; isolierte Protein-Tage, Trigger, Fehler/Retry und Profilreload; historische Governance-Nachweisgrenze G-C4-01 bleibt dokumentiert | EV-C4-L03, EV-C4-S5-G03–G06, EV-C4-P02 |
| S5 lokal | `PASS LOCAL` 2026-10-03; T-C4-01–05, nativer Full Review und CodeRabbit mit berechtigten Minimalfixes | EV-C4-S5-G03–G06; 273Node/12Deno, Last-Mile/Mobile/Guard grün |
| S5 produktiv / Acceptance | `PASS_WITH_DOCUMENTED_PROTOCOL_DEVIATION`; Owner-Score 7→8→7 und Pages-Zugang; Android OWNER-WAIVED | EV-C4-P01–P04, EV-C4-S5-G18; keine historische Preflight-/durchgehend grüne Governance-Behauptung |
| S6 | `DONE`; abschließender Doku-/Vertragsreview | EV-C4-S6-G19 nach Abschluss |

### Entscheidungen und Review

| ID | Stand 2026-09-29 | Invalidation |
| --- | --- | --- |
| D-C4-01 | Stephan bestätigt binär: alle bisherigen und neue Sessions zählen, Ausnahme nur bewusst | neue Produktentscheidung |
| D-C4-02 | Ein gleich großer Button in Abschlussnähe; grau → grün und eindeutiger Text, mobil über Save | UI-Abnahme ändert Copy/Position |
| D-C4-03 | Nur Protein-Target-Score wird gefiltert; Activity-Ist-Daten und andere Consumer bleiben vollständig | Masterplan-/Medizinvertrag ändert sich |
| D-C4-04 | Roadmap und initialer Contract Review jetzt; Code/SQL/Deploy erst im frischen Ausführungs-Chat und an jeweiligen Gates | neuer Auftrag oder Scopeänderung |

**Initialer Contract Review:** Quellen, binären Ownerentscheid, SQL/Edge/UI-Last-Mile, Legacy/alte Clients, getrennte Consumer, Capability-Receipt, Gates, Reverse und tokenarme Testmatrix geprüft. Zum Authoring waren F-C4-01/07/08/09/10 korrigiert und F-C4-02 bis -06 noch Discovery-/Capability-Gates. Diese wurden inzwischen in S2–S4R beziehungsweise S4.1–S4.3 geschlossen; sie sind keine heutigen Blocker und erzeugen kein neues Discovery-Gate. Der Absatz dokumentiert den historischen Initialreview; aktuelle Ausführungsnachweise und ehrliche Abweichungen stehen in Statusmatrix und Evidence.

**Historischer Resume-Stand (2026-10-03: C4 veröffentlicht; PWA-Produktload-Finding, Diagnose am KASRKIN-Gate gestoppt):**

- Minimal lesen: diese Card und EV-C4-P03/EV-C4-S5-G13. S1–S4R, S4.1–S4.3 und S5 LOCAL bleiben gültig: 273 Node-/12 Deno-Fälle, echte lokale Last-Mile-/Mobile-Kette, native Full-/Consumer-/Postfixreviews und zwei CodeRabbit-Läufe. 52 Quellen exakt unverändert; keine Wiederholung ohne Invalidation, kein drittes CodeRabbit.
- SQL27 PASS PRODUCTION auf jlylmservssinsavlkdi, Migration20261003144855, SHA83c04c31c377dea3015bfc77405638bed9972520c406542e63c50a89f8dcd3d6. Sieben alte Sessions=true, SQL-/Daten-/ACL-/RLS-Postimage PASS; zu diesem Postcheck keine false/null. SQL-Ausnahme verbraucht.
- Protein-Edge32 PASS PRODUCTION, Paketbcf907ee5fd34da2e5289ac30dfb8727ed4385e4000a0536361e8fc34249d8e8, sechs Remote-Quellen LF-identisch, Auth erhalten. User/manual/activity_save, Scheduler-Dry-run und zwei negative401-Smokes PASS; fünf Datenhashes/Counts nach allen Smokes unverändert. Genau ein Deploy, Edge-Ausnahme verbraucht.
- D-C4-PUB01 erteilt: isolierter52-Dateien-Commit/ein Fast-forward-Push/main-Pages-Auslieferung samt begrenzter produktiver Erstlaufgate-Ausnahme. Frisches Gate18:06:55+02 VALID28/75 CAUTION, produktives Endphase-Start unsupported KASRKIN_COST_PROFILE_CLASS. Tatsächliche Autorität ist die ausdrückliche konkrete Owner-Ausnahme, kein fiktiver Permit; durch einen Push verbraucht.
- Aktiver main/Pages-Commit06638359facf67c524294249cca170b0955955ef, Pages built, 20/20 geänderte produktive HTTP-Asset-LF-Hashes exakt zum Manifest8748851f7c89eee09745db50fee12c25b405fd162eb70cf3847c42f455ea5f89. Native Release-Scope-/Sourceprüfung PASS; Publikation ausgeführt, PWA-Gesamt-PASS noch NICHT belegt.
- F-C4-PWA01: produktiver Desktop-Tab zeigt Orb/Voice/Capture-Heading, aber keinen belegten bedienbaren Modul-/Activity-Zugang. v31-Referenzen und angebotenen Update-Reload-Listener beobachtet, Boot verschwindet; Screenshot geringe Bedienoberfläche. Orb-Bild-Klick ohne sichtbare Wirkung ist kein Beweis, dass dort der vorgesehene Listener liegt. DOM-CSSOM-Abfrage meldete loaded=false, deren Unterstützung unbewiesen: keine behauptete CSS-Ursache. Cause UNKNOWN. pwa-productload-finding.md und pwa-publication-attempt.json halten Stand fest.
- Erste Finding-Grenze sicher geschlossen: aktiver main/Pages-SHA und HTTP-Postimage bekannt, OriginalHEAD4d7b5b21721c9d5979fe6e620e01b4a67e025763 und staged Inhalt erhalten. Kein blindes Rollback/zweiter Push/Fix/produktiver Datenwrite. Isolierter Checkout C:/Users/steph/AppData/Local/Temp/midas-c4-release-l6ukqngp/repo bleibt zur Wiederaufnahme gesichert; keine automatische lokale Git-Synchronisierung/Rebase. Originalmain und Remotemain divergieren wie freigegeben.
- Publikations-Closure18:20:59+02 VALID22/74, Reset1791049190/1791617806; rohe Differenz6/1 Punkte zur Admission. Kein Paid-Spend. Danach eigenständiger vollständiger SMALL/R1/Consumer-Diagnoseplan (12Tools/8fokussierteFiles/4Checks) eingefroren, kanonischer Endphase-Start abgelehnt: COST_UNKNOWN, EPISODE_CAP_REACHED, SAFE_CLOSURE. Kein Diagnose-Permit, keine Root-Cause-Arbeit begonnen. Letzte22/74-Messung ist historisch; im neuen Einstieg frisches Gate, keinen Reset unterstellen.
- Nächster vollständiger Block bei echter Admission: pwa-diagnosis-endphase-plan.json / pwa-diagnosis-gate-plan.json, read-only Root-Cause F-C4-PWA01. Erst danach eigener gegateter lokaler Fix mit nur invalidierten Prüfungen, konkrete neue produktive Auslieferungsfreigabe falls ein neuer Release erforderlich ist. Kein Wiederholen des bereits erfolgreichen52-Dateien-Pushs. Der alte PWA-Ownerbrief und seine Ausnahmen gelten nicht für neue Fix-Auslieferung.
- T-C4-07 Android ausdrücklich OWNER-WAIVED (D-C4-U06-ANDROID), NOT RUN, kein PASS behauptet. User bestätigt T-C4-06 bleibt erforderlich. Konkreter aktiver28-Tage-Testtag/Score/Weight/Lock/Cleanup-Vertrag und Testdaten-Owner-Gate stehen noch aus; keine Testmutation ausgeführt oder pauschal freigegeben. S5 gesamt/S6/DONE offen, kein Archiv/Tag.
- D-C4-U04: restlicher aktueller5h-Bucket und höchstens60Weekly-Punkte für restliche Aufgabe, serielle Nutzung nur dieserChat. Installierte KASRKIN-Admission/Safe-Closure/LIMIT0 und alle Produkt-/Owner-Gates bleiben maßgeblich. Reasoning NOT_OBSERVABLE. Dirty Worktree bewahren.
- S6 nach bestandenem S5: Module, Masterplan, QA, SQL-HOW_TO, CHANGELOG und R15-Handoff synchronisieren; historischen Initialer-Contract-Review-Absatz korrigieren (F-C4-02 bis -06 geschlossen), kein Discovery-Neustart. Proposal weiterhin inaktiv. Dokumentations-Commit/Push benötigt seinen konkreten eigenen Scope.


**Historisches Resume-Delta 2026-10-03 / EV-C4-S5-G14:** Owner asks to check local Live Server directory listing. Served folder/root cause UNKNOWN; screenshot-only claim withdrawn. Fresh historical measurement18% fiveHour/74% weekly at18:41:28+02. Complete read-only local server diagnosis NOT STARTED: canonical Endphase Start rejected COST_UNKNOWN, EPISODE_CAP_REACHED, SAFE_CLOSURE; no permit. Next action: fresh admission for frozen live-server-diagnosis-endphase-plan.json before HTTP/process/path check. No server/source/data mutation; existing C4 proofs retained. S5/T-C4-06 and S6 remain open; Android waived. NOT_OBSERVABLE.


**Historisches Resume-Delta 2026-10-03 / EV-C4-S5-G15 (supersedes G14 local diagnosis status):** Explicit owner exception used for read-only Live Server check. At inspection local index existed but localhost5500 refused connections/no listener; original served folder/cause UNKNOWN. Owner subsequently restored Live Server and supplied screenshot of real local UI save (Bizeps Curl3sets), protein exclusion and successful refresh: smoke OWNER_REPORTED_AND_SCREENSHOT_PASS. Local server diagnosis CLOSED, no agent code/server/data change. T-C4-06 PARTIAL: isolated-day/score baseline, include/delete score changes and cleanup remain unproven; local screenshot does not prove GitHub Pages productload. S5 total and S6 remain open; Android waived. Last fresh historical budget16/74 at18:47:12+02, no reset assumed. Reuse existing proofs; next whole block requires current admission. Reasoning NOT_OBSERVABLE.


**Historisches Resume-Delta2026-10-03 / EV-C4-P04 and EV-C4-S5-G16:** Owner completes actual local UI score cycle: excluded7, included correction8/revision2, deleted7. Core mutation/score-restore OWNER_REPORTED_AND_SCREENSHOT_PASS; do not repeat. Saved owner-smoke-score-cycle.json and fingerprint-bound context receipt. Original before-create preflight/baseline and independently queried DB cleanup not captured; localhost screenshot does not prove public Pages interaction. Productive false data has existed; no never-false rollback assumption. Full S5 acceptance review not executed: fresh historical telemetry13/73 at19:07:29+02, canonical Endphase Start rejected COST_UNKNOWN, EPISODE_CAP_REACHED, SAFE_CLOSURE/no permit. Incoming evidence stored as safe closure only. Next: fresh admission for complete S5 acceptance/remaining-proof review, then S6 own gate; existing tests/reviews retained. Public Pages finding remains unproven, local Live Server diagnosis closed. No S6/DONE/archive/commit/push; Android waived. NOT_OBSERVABLE.


**Historischer Resume-Stand (2026-10-03 19:43+: S5-Abschluss zugelassen; Pages-Bediennachweis beim Owner):**

- Minimal lesen: diese Card und EV-C4-S5-G17 sowie EV-C4-P04/G16 bei Bedarf. S1 bis S4.3 und S5 LOCAL bleiben gruen;52/52 Quellen exakt unveraendert. Alle bisherigen Tests/native Reviews/zwei CodeRabbit-Laeufe weiterverwenden. Kein dritter Lauf und kein erneuter7/8/7-Test.
- SQL27, Protein-Edge32, main/Pages06638359facf67c524294249cca170b0955955ef und20/20 HTTP-Assets bereits belegt. OriginalHEAD4d7b5b21721c9d5979fe6e620e01b4a67e025763, leerer staged Inhalt/73 dirty entries erhalten; keine Git-Synchronisierung.
- Neuer fiveHour-Bucket durch kanonische Telemetrie bewiesen:99/73 um19:41:08+02. Regulaeres Gate19:43:16+02 CONTINUE/PRIMARY_ALLOWED,98/73, evaluation6ac1a10e43e14dc5a83709ac3194416e. Vollstaendiger Block C4-S5-FINAL-ACCEPTANCE zugelassen; kein Endphasepermit noetig. Historische Reset-ID-Drift im Plan nach installierter Validierung korrigiert; kein AVAILABLE erfunden.
- Aktueller Block wartet ausschliesslich auf konkreten Operatornachweis: public Pages in Edge -> Training -> Trainingshistorie, Screenshot mit Adresszeile, nichts speichern/loeschen. Tab44029546 handoff markiert. Automatisierung sah nur Orb; underlying DOM zeigt Modulcontrols, Logs ohne Error, keine Code-/CSS-Ursache bewiesen. F-C4-PWA01 bleibt bis echtem Zugangsnachweis offen.
- Owner-UI-Score7/8/7 und geloeschter Test03Oct2026 gruen; fehlende urspruengliche Vorabnachweise explizite Protokollabweichung, kein erfundener Preflight. Android OWNER-WAIVED. Produktives false hat existiert: kein never-false/blindes Rollback.
- Nach Ownerergebnis aktuellen zugelassenen S5-Abschlussblock vollstaendig schliessen; bei nachgewiesenem Zugang und tatsaechlicher Acceptance S5 abschliessen, danach frisches vorgeschriebenes Gate fuer S6. Bei echtem Finding keine automatische Diagnose/Fix/Neuveroeffentlichung.
- S6: Activity/Protein-Overviews, Masterplan, QA, SQL-HOW_TO, CHANGELOG, R15-G0-Handoff und historischen Initialer-Contract-Review synchronisieren (F-C4-02 bis -06 geschlossen). Noch nicht gestartet, kein DONE/Archiv. Commit/Push weiter separater Gate. Reasoning NOT_OBSERVABLE.
- Artefakte: s5-final-acceptance-{scope.md,gate-plan.json,endphase-plan.json,checkpoint.json}; s5-final-preserved-state.json; s5-final-context-receipt.json. Quellenreceipt nur bei exakt passenden Fingerprints und gedeckter Frage nutzen.


**Historisches Resume-Delta2026-10-03 / EV-C4-S5-G18:** Owner confirms exact public Pages Training/Trainingshistorie reachable and usable. F-C4-PWA01 CLOSED via OWNER_CONFIRMED_ACCESS_PASS; automated rendering remains inconclusive, no CSS/code finding. Native final delta/consumer acceptance complete,52 unchanged fingerprints and all inherited reviews/postimages reused. S5 PASS_WITH_DOCUMENTED_PROTOCOL_DEVIATION: T-C4-06 functional7/8/7 green, original before-create preflight not captured (explicit deviation, not historical PASS); Android waived. No new tests/CodeRabbit/source/DB changes. Current S5 block complete; next whole block S6 after fresh canonical gate. S6/DONE/archive/commit/push not yet executed. NOT_OBSERVABLE.


## Abschluss und aktuelle Resume Card

**Resume Card (2026-10-03: C4 DONE — lokal abgeschlossen):**

- S1–S6 abgeschlossen; S5 PASS_WITH_DOCUMENTED_PROTOCOL_DEVIATION, S6 PASS.
  Kein offenes In-Scope-P0/P1. Abschluss: EV-C4-S5-G18 und EV-C4-S6-G19.
- SQL27-Migration20261003144855, Protein-Edge32, main/Pages
  06638359facf67c524294249cca170b0955955ef, Root-SW v31 produktiv.
  Öffentlicher Pages-Zugang vom Owner bestätigt; automatisierte Darstellung
  blieb unklar und ist kein behaupteter automatisierter UI-PASS.
- Owner-Score: ausgeschlossen7 → Korrektur/eingeschlossen8 → gelöscht7.
  Ursprüngliche Test-Vorabnachweise fehlen: dokumentierte Protokollabweichung,
  kein erfundener Preflight. Android OWNER-WAIVED, kein PASS. Historische
  Governance-Nachweisgrenze G-C4-01 erhalten, keine erfundene grüne Gatekette.
- 52/52 Produktquellen unverändert. 273Node/12Deno, echte lokale Last-Mile/
  Mobile-Proofs, native Reviews und zwei CodeRabbit-Läufe weiterverwendet.
  Dieser Abschluss: null funktionale Retests, null weitere CodeRabbit-Läufe.
- Activity/Protein, Masterplan, HCR-034/IM-013/BS-008, QA-Linkindex,
  SQL-HOW_TO, CHANGELOG und R15-G0-Handoff synchronisiert.
  Historischer Initialreview korrigiert: F-C4-02 bis -06 geschlossen.
- Roadmap und Evidence lokal unter docs/archive als (DONE) archiviert.
  Archiv ist historische Evidence. R15 bleibt DRAFT/G0 PENDING.
- Produktives false hat existiert: kein blindes SQL-/Protein-/PWA-Rollback.
  Keine neuen SQL-/Deploy-/Testdaten-/Android-Freigaben aus diesem Abschluss.
- HEAD4d7b5b21721c9d5979fe6e620e01b4a67e025763, staged Inhalt und fremde
  Änderungen erhalten; kein Abgleich mit divergendem Remote.
  Dokumentationscommit/Push/Tag nicht ausgeführt, separat owner-gated.
- S6-Admission19:51:04+02 CONTINUE/PRIMARY_ALLOWED,94/72; historische
  Messung, keinen Reset/Reserve daraus ableiten. Reasoning NOT_OBSERVABLE.
- Abschlussreceipt: .kasrkin/work/c4-s5-2026-10-03/s6-final-context-receipt.json.
  Folgearbeit nur mit eigenem aktuellen Gate und bei gedeckter Fingerprintgleichheit.


**Abschlussmessung (historisch):** Kanonisches kasrkin validate -Refresh -Envelope um20:19:18+02 VALID:83% fiveHour/70% weekly. Gegen frische Wiedereinstiegsbaseline19:41:08+02(99/73) bei identischen Reset-IDs1791067216/1791617805 beobachtete Differenz16/3 Prozentpunkte. Keine token-/toolspezifische Attribution, keine neue Kostenreceipt/Reserve/Freigabe; im Folgeauftrag frisch messen. Abschlusszustand unveraendert DONE_LOCAL.

**Nachgelagerter Git-Abschluss (2026-10-03):** Der Owner hat Commit und Push
des bestehenden Worktrees ausdrücklich freigegeben. KASRKIN lässt den
vollständigen, begrenzten Git-Abschluss zu: Evaluation
8852bf41f9684eb181ad72c9c3e55f32, CONTINUE/PRIMARY_ALLOWED, 20:26:57+02,
78 % fiveHour / 69 % weekly. Der oben dokumentierte HEAD-/Indexstand ist
die historische S6-Postcondition, keine fortbestehende Commit-Sperre.
Alle 52 C4-Quellen stimmen mit origin/main 0663835 überein; keine funktionalen
Retests. Sicherung außerhalb des Projekts, normales Zusammenführen der
Historien und Fast-Forward-Push; kein Reset, Rebase oder Force-Push.
Lokale KASRKIN-Artefakte und generierte Testergebnisse bleiben erhalten und
werden nicht veröffentlicht. Der tatsächliche Git-Postimage wird lokal in
.kasrkin/work/c4-s5-2026-10-03/git-closure-result.json festgehalten.
S5/S6 und ihre dokumentierten Nachweisgrenzen bleiben unverändert abgeschlossen.
