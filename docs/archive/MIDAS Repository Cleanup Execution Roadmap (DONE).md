# MIDAS Repository Cleanup — Execution Roadmap

Autorenbasis: [BLUEPRINT-Autorenvertrag](../../../codex-tools/docs/blueprint/ROADMAP_AUTHORING_CONTRACT.md)
und [Execution-Form](../../../codex-tools/docs/blueprint/EXECUTION_ROADMAP_TEMPLATE.md),
`BLUEPRINT / 2026-10-13 / Harmonized`, ausdrücklich für diesen Auftrag übernommen.

## Identität und Startkarte

- ID / Typ / Owner / Dokumentationsowner: `MC-EX-01` / EXECUTION / Stephan / MIDAS.
- Status: `READY`; nächster Ausführungsschritt: S1. Autorenreview: `GREEN`.
- Planstand / Planfreeze: 2026-10-13 / Revision 2, nach korrigiertem Autorenreview
  und gezielter Prüfung der nachgereichten Guard-/Authkritik.
  Ausführbarer Freeze: erst S4R, derzeit `NOT_ESTABLISHED`.
- Parent: keiner. Eigenständige lokale Repositorybereinigung.
- Auftrag: die 15 im Discovery-Bericht genannten Pfade kontrolliert behandeln,
  historische Inhalte archivieren, entbehrliche Verzeichnisse entfernen und
  tatsächliche Consumer erhalten. ARGUS/Benchmark sind auf Ownerentscheid stillgelegt.
- Aktuelle Autorität: Roadmap und Evidence erstellen, Findings-/Contractreview,
  Reihenfolge-/Coverageprüfung und Markdownlint. Keine Bereinigung in diesem Auftrag.
- Risiko: R3 wegen geplanter Löschung und Entfernung alter Rückfallswerkzeuge;
  tatsächliche Wirkung nur lokale Dateien und Prüfwerkzeuge. Medizinische Runtime,
  Authimplementierung, Daten, SQL und produktive Systeme sind geschützt.
- Arbeitsgröße: large; ein kohärenter Auftrag mit sieben S4-Blöcken.
  Hohe native Reviewtiefe für Provenienz, Guardrails und Consumer; kein Modellpin.
  Tatsächliche Client-/Reasoningeinstellung: `NOT_OBSERVABLE`.
- Lesepfad: [AGENTS](../../AGENTS.md), diese Startkarte und Resume Card,
  [Evidence](<MIDAS Repository Cleanup Execution Evidence (DONE).md>),
  aktuelle Findings,
  Gitstatus/Diff, nur die betroffenen Quellen.
- Dirty Boundary bei Planung: `main`,
  `c2e147ef046764d5428f16b71332d4e4d1965356`, sauber.
  Eigene Änderungen dieses Auftrags: ausschließlich Roadmap und Evidence.
  Vor Ausführung erneut aufnehmen; fremde Änderungen weder stagen noch zurücksetzen.

## Verbindlicher Scope, Acceptance und Gates

### Lieferung und Grenzen

Die Dispositionsmatrix ist die Dateiautorität dieses Plans. Zusatzänderungen sind
nur die unten benannten direkten Consumer, Navigation und betroffene QA/SoT.
Es gibt keinen pauschalen Löschauftrag für `tools`, `docs/reference` oder `.kasrkin`.

Geschützt bleiben insbesondere:

- Produkt-JS/CSS/HTML, Root-/Public-Service-Worker, Android, SQL und Backend;
  Ausnahmen unter `app/` sind ausschließlich die zwei benannten Contract-Testdateien.
- Activity-V1-Historie, Activity-V2-Daten, Katalogbytes, Vorlagenformat,
  Recovery-/Commit-/Protein-/Read-Consumerverträge und alle medizinischen Grenzen.
- `.env.supabase.local`, Secretstores, Keystores, private Preimages und
  `.kasrkin` samt Freeze-/Recovery-/Receiptbeständen.
- Externe ARGUS-Archive, `codex-tools`, HESTIA, globale Tools und Installationen.
  Insbesondere keine Wiederaufnahme von ARGUS oder KASRKIN-Consumerbetrieb.
- Keine API-/DBverbindung, SQLausführung, Deploys, Geräteaktionen, Browserwrites,
  Workflowstarts, Secrets-/Keyänderungen oder Signing-/Legacyabschaltung.

### Acceptance

<!-- markdownlint-disable MD013 -->
| ID | Pflichtpostcondition | Nachweis |
| --- | --- | --- |
| A01 | Alle 15 Ausgangspfade und alle 39 darin erfassten Dateien haben genau eine bestätigte Disposition; neue/unbekannte Inhalte werden vor Mutation eingeordnet. | T01, EV-B01, EV-W01–W07 |
| A02 | Die sechs entbehrlichen Verzeichnisse sind entfernt; ausschließlich die genehmigten Inhalte waren darin. | T01, T02 |
| A03 | 15 Toolingdateien, neun historische Tools, C4-Vorschlag und Studioinventar sind vollständig und byteidentisch am festgelegten Archivziel. | T02, T07 |
| A04 | Masterplan ist unter dem eindeutigen neuen Namen erhalten; aktuelle Links und ausführbare Dateileser verwenden den neuen Pfad. Historische Pfadbelege bleiben historische Belege. | T03, T06, T07 |
| A05 | Kataloginspektor prüft Standardkatalog, Suche und Beschreibung mit dem archivierten Originalvertrag; dessen eingebettete Provenienzbytes bleiben unverändert. | T04, T07 |
| A06 | Behaltene R8-/R13-Guards und direkte Tests prüfen den aktuellen Vertrag mit positivem und negativem Orakel; alte Snapshotfehler werden nicht durch blindes Hash-/Versionsersetzen versteckt. | T05, T06 |
| A07 | Vorlagen-Schema/-Beispiel, Test-PWA-Runbook, Operatorvorlage und Restarbeitsvertrag bleiben erhalten. Storemap wird mit dem belegten D33-Teilabschluss synchronisiert. | T06, T07, T08 |
| A08 | Produktbytes, medizinische Regeln, DB-/Secret-/Gerätestände und externe Repositories bleiben außerhalb des Deltas. | T09 |
| A09 | Betroffene Dokumentation/QA/HOW-TO ist synchron; Markdownlint, Links, Encoding, Gitdiff und finaler nativer Review sind grün; S5-CodeRabbitpflicht tatsächlich erfüllt oder ausdrücklich owner-disponiert. | T08–T11, EV-R01 |
| A10 | Erst nach finalen S6-Postchecks werden Roadmap und Evidence als `(DONE)` archiviert. Kein Commit/Push/Tag/Publish ohne separaten Auftrag. | T11, EV-C01 |
<!-- markdownlint-enable MD013 -->

### Ownergates

<!-- markdownlint-disable MD013 -->
| Gate | Status / Datum / Herkunft | Autorisierte Wirkung / Grenze |
| --- | --- | --- |
| G-PLAN | ERTEILT / 2026-10-13 / aktueller Ownerauftrag | Genau Roadmap/Evidence, Planreview, Findingskorrekturen und Markdownlint. Keine S4-Mutation. |
| G-EXEC | OFFEN / benötigt vor S4 | Künftiger expliziter Ausführungsauftrag für diese Roadmap einschließlich lokaler Moves, sechs Verzeichnislöschungen, begrenzter Tool-/Testkorrekturen und lokalem Preimage-Staging. READY erteilt dieses Gate nicht. |
| G-REVIEW | Aus Projektvertrag, wirksam nur bei autorisierter Ausführung / S5 | Da drei Toolquellen und Contract-Tests geändert werden: ein initialer kanonischer CodeRabbitlauf, höchstens ein begründeter Verifikationslauf. Kein externer Lauf bei dieser Planerstellung. |
| G-EXTERNAL | NICHT_ERTEILT / nicht benötigt | Externe Repos/Archive, Produktion, DB/Secrets/Devices und Shared-Installation bleiben geschützt. Reale zusätzliche Wirkung verlangt eigenen Scope-/Ownerentscheid. |
| G-GIT | NICHT_ERTEILT / nicht benötigt | Keine Commits, Tags, Pushes oder Veröffentlichung. Gitstatus/Diff und lokale Dateioperationen bei G-EXEC sind zulässig. |
<!-- markdownlint-enable MD013 -->

Archivziele: `docs/archive/tooling-extraction/`,
`docs/archive/repo-cleanup/activity-v2-tools/`,
`docs/archive/reference/activity-v2/Fitnessstudio_Geraeteinventar.md` und
`docs/archive/MIDAS C4 Independent Verification Waves Contract Proposal (LEGACY).md`.
Ziele werden nicht überschrieben. Historische Skripte werden archiviert und
nicht ausgeführt; ihr ursprünglicher Gitstand ist die Reproduktionsbaseline.

## Sources, Baseline und Context Receipt

<!-- markdownlint-disable MD013 -->
| Quelle | Stand / Read-Abdeckung / konkrete Frage | Gültigkeit / Schutz | Invalidation |
| --- | --- | --- | --- |
| [AGENTS](../../AGENTS.md), [README](../../README.md) | 2026-10-13 / FOCUSED_COMPLETE / Produktgrenzen, Agentvertrag, QA-/Archivpraxis | VALID / SUFFICIENT; Grenzen verbindlich | Vertrags-/Owneränderung |
| BLUEPRINT-Kern und Execution-Form | Harmonized 2026-10-13 / FOCUSED_COMPLETE / Scope, Gates, S1–S6, Evidence, native/externe Reviews, Closure | VALID / SUFFICIENT | Revision vor Freeze |
| [Activity Overview](<../modules/Activity Module Overview.md>), [Auth Overview](<../modules/Auth Module Overview.md>) | lokale Baseline / FOCUSED_COMPLETE / aktueller Activity-/R15-/C4-Vertrag, Authgrenzen | VALID / SUFFICIENT für Bereinigung; Produktquellen PROTECTED | fachliche Änderung oder unzureichendes Zielorakel |
| [Environment](../DEV_ENVIRONMENT.md), [ATLAS](../../../codex-tools/environment/README.md) | lokale Baseline / FOCUSED_COMPLETE / PowerShell, Git, Node, CodeRabbit; nur relevante Abschnitte | VALID / SUFFICIENT | Tool-/Authdrift |
| 15 Ausgangspfade, 39 Dateien | EV-B01 / FOCUSED_COMPLETE / Typ, Bestand, Gitrolle, Consumer und Disposition; acht JSONartefakte geparst | VALID / SUFFICIENT; Detailfragen vor jeweiligem S4-Block erneut lesen | neue Datei, Reparse Point, Bytes-/Consumerdrift |
| Toolquellen und zwei direkte Contract-Tests | EV-B02 / FOCUSED_COMPLETE / alte Release-/Hashannahmen, Runbook-/Masterplanleser | VALID / SUFFICIENT für Plan; zukünftige Guardkorrektur braucht vollständigen betroffenen Code-Read | Änderung an Tool, Test oder geschützter Quelle |
| Tooling-Closure, Inventare und Receipts | EV-B03 / FOCUSED_COMPLETE / abgeschlossene Migration, Provenienz, externe Altpfade | VALID / SUFFICIENT; historische JSONbytes PROTECTED | Archiv-/Ziel-/Linkdrift |
| Drei Supabase-Betriebsdateien, D33-Abschluss | EV-B04 / FOCUSED_COMPLETE / Backend/Web akzeptiert; Native/Legacy zurückgestellt | VALID / SUFFICIENT für Dokusync; keine aktuelle Remoteprüfung behauptet | neuer Owner-/Betriebsentscheid |
<!-- markdownlint-enable MD013 -->

Die Einzeldateibaseline und konkrete beobachtete Fehler stehen ausschließlich
in [Evidence](<MIDAS Repository Cleanup Execution Evidence (DONE).md>). Kein historisches
PASS beweist den aktuellen Guardlauf. Nur gezielt invalidierte Aussagen nachlesen.

### Capability-Preflight

<!-- markdownlint-disable MD013 -->
| Capability / Zweck | ATLAS-Verweis | Status am 2026-10-13 | Nachweis / Grenze |
| --- | --- | --- | --- |
| Git: Bestand, Baseline, Diff | [Git](../../../codex-tools/environment/DEV_ENVIRONMENT.md#git) | AVAILABLE_VERIFIED | `git --version`: 2.55.0.windows.2; Gitstatus sauber; keine Remoteauth nötig. |
| PowerShell: sichere lokale Pfade/Moves/Deletes, Hashes | [Windows PowerShell](../../../codex-tools/environment/DEV_ENVIRONMENT.md#windows-powershell) | AVAILABLE_VERIFIED | 5.1.26100.9444; native `-LiteralPath`, absolute Zielprüfung, Reparse-Abwehr. |
| Node: Tools, fokussierte Contract-Tests | [Node/npm](../../../codex-tools/environment/DEV_ENVIRONMENT.md#nodejs-und-npm) | AVAILABLE_VERIFIED | `node --version`: v24.18.0; drei read-only Baselineläufe mit erwarteten Findings erhoben. |
| Python: gezielte lokale Link-/Dispositionsprüfung | [Python/Deno](../../../codex-tools/environment/DEV_ENVIRONMENT.md#python-und-deno) | AVAILABLE_VERIFIED | Python 3.14.6; nur lokale Dateien, keine Dependencyinstallation. |
| Markdownlint: neue/geänderte Markdown-Dateien | ATLAS enthält keinen eigenen Markdownlint-Eintrag; vorhandener lokaler npm-Cache | AVAILABLE_VERIFIED | `ML` ist `C:/Users/steph/AppData/Local/npm-cache/_npx/0b2c56f61857d977/node_modules/.bin/markdownlint-cli2.cmd`; v0.23.2, Engine v0.41.1. Direkter Aufruf, keine Installation, kein Repo-Package. |
| CodeRabbit: externer S5-Code-Review | [CodeRabbit](../../../codex-tools/environment/DEV_ENVIRONMENT.md#coderabbit) | CLI/structured Auth AVAILABLE_VERIFIED (S5) | Kanonischer Shim, Version 0.7.6. `auth status` Exit 0, Ausgabe nicht zuverlässig klassifiziert; kein Auth-PASS. Vor S5 klaren Status redigiert verifizieren. |
| Supabase/DB, Deno-Runtimetests, Browser, Android/ADB, 7z | Projekt-Overlay; hier keine tatsächliche Wirkung | NOT_REQUIRED | Kein Setup, keine Remote-/Deviceprüfung und kein pauschaler Produkt-Smoke. |
<!-- markdownlint-enable MD013 -->

`ML` ist im Dokument ein Pfadalias, kein bereits gesetztes Shellkommando.
Vor Aufruf den genannten Pfad erneut auflösen. MISSING/INCOMPATIBLE verlangt
einen begrenzten Owner-Toolentscheid; keine Installation aus diesem Plan ableiten.
S5-CodeRabbit-Auth ist ein späterer Readinesscheck, keine aktuelle Loginaktion.

## Entscheidungen, Risiken und korrigierte Findings

<!-- markdownlint-disable MD013 -->
| ID / Priorität | Finding / Auswirkung | Disposition und Gegenmaßnahme | Nachweis |
| --- | --- | --- | --- |
| F01 / P2 | Sechs lokale Altverzeichnisse sind entbehrlich; fünf haben keine Dateien, `test-results` nur 46 Byte Status. | S4.6: exakt allowlisten, vor Löschung neu prüfen und eigenes Preimage sichern; bei neuen Inhalten keine rekursive Pauschallöschung. | EV-B01, T01–T02 |
| F02 / P1 | `tools` ist kein reines Altprojektverzeichnis. | Vier Tools bleiben; neun historische Tools werden als Paket archiviert. Aktuelle Guardconsumer vor Entfernung/Rehome absichern. | S4.1–S4.2, T04–T06 |
| F03 / P1 | Katalogtool hat zwei gebrochene Pfade: C2-Default und eingebettetes R1-`base_contract`. Ein korrigierter C2-Aufruf allein scheitert weiterhin. | Explizite Auflösung der beiden bekannten Originalpfade auf unveränderte archivierte Verträge; unbekannte/mehrdeutige Targets bleiben Fehler. Keine Änderung eingebetteter Katalog-/Provenienzbytes. | EV-B02, S4.1, T04 |
| F04 / P1 | R13 scheitert tatsächlich an `VERIFY_JWT_FALSE_SCOPE`; R8 `--c4` tatsächlich an `R14_SUPABASE_RELEASE_CONTRACT`. Weitere historische Releaseannahmen sind im Source sichtbar. | Beide Tools bleiben mit explizitem `--current`-Pfad. Historische Modi bleiben benannte historische Orakel. Direkte aktuelle Tests verwenden aktuellen Modus; positive/negative Sourcefixtures sichern relevante Invariants. | EV-B02, S4.1, T05–T06 |
| F05 / P1 | Masterplanname suggeriert Ideensammlung; Modul und Tests lesen ihn aktiv. | Vollständig als `docs/MIDAS Activity V2 Masterplan.md` erhalten; aktive Reader in derselben Transaktion ändern. R16 bleibt OPTIONAL; keine neue Activity-Ausführung. | S4.3, T03, T06 |
| F06 / P1 | Schema, Beispiel, Katalogrunbook und lokale Test-PWA-Anleitung sind weiter benötigt. | Behalten; nur Studioinventar ist eingefrorene C2-Provenienz und wird archiviert. Keine Testlane-/APK-/Runbookentfernung. | S4.3–S4.5, T06–T07 |
| F07 / P2 | Tooling-/ARGUS-Unterlagen sind abgeschlossene, teilweise repoübergreifende Historie. | Alle 15 byteidentisch archivieren; aktuelle ARGUS-Zukunftsnavigation entfernen. Kein ARGUS/KASRKIN-Start und keine alten W7-Skripte ausführen. | EV-B03, S4.4, T02–T03 |
| F08 / P2 | C4-Prüfwellenvorschlag war nicht aktiviert und besitzt keine heutige Ausführungsautorität. | Als LEGACY archivieren; vorhandene C4-Evidence bleibt erhalten. | S4.4, T02–T03 |
| F09 / P1 | Supabase-Storemap nennt noch offene klinische Acceptance aus D32; D33 akzeptiert Backend/Web, Native/Legacy bleiben zurückgestellt. | Wertfreier Dokusync aus belegtem D33; Vorlage und Restarbeitsvertrag unverändert behalten. Keine Remoteverifikation/Legacyabschaltung. | EV-B04, S4.5, T08–T09 |
| F10 / P2 | Nachbar-Repo hat einen historischen W3-Prüfer mit festem Inventarpfad; Archive/Receipts nennen Altpfade. | Als historische Reproduktionsabhängigkeit dokumentieren, nicht als aktiven MIDAS-Consumer reparieren. Kein Hashrewrite und keine unautorisierte codex-tools-Änderung. | S4.4, T03, T09 |
| F11 / P1 | Einfaches Rehome von Skripten verändert deren `$PSScriptRoot`-/`import.meta.url`-Basis. | Archivscripts nicht als aktuell ausführbar anbieten. Originalbytes und ursprünglichen Gitstand erhalten; Reproduktion nur in isolierter Originalbaseline. | S4.2/S4.4, T02, T08 |
| F12 / P1 | Planung könnte Umsetzung/DONE oder globalen Toolsupport vortäuschen. | G-PLAN und G-EXEC trennen; alle S-Schritte NOT_STARTED. Nur Planchecks als durchgeführt führen; externe Auth/Runtime nicht als bewiesen ausgeben. | T10–T11, Planreview |
<!-- markdownlint-enable MD013 -->

## Vollständige Dispositionsmatrix

`ARCHIVE` bedeutet Move ohne Byteänderung. `RENAME` erhält ebenfalls Originalbytes;
bei einer notwendigen neuen Navigationsnotiz den alten Quellhash separat erhalten.
`KEEP_FIX` erlaubt nur den explizit beschriebenen Doku-/Tooldelta.

### Sechs Verzeichnisentfernungen

<!-- markdownlint-disable MD013 -->
| ID | Ausgangspfad | Istbestand | Disposition / Block |
| --- | --- | --- | --- |
| D01 | `.codex-r13-trend-postcheck-20260825/` | leere `supabase/.temp`-Struktur | DELETE / S4.6 |
| D02 | `.codex-r13-trend-postcheck-20260825-02/` | ausschließlich leere Supabase-Unterverzeichnisse | DELETE / S4.6 |
| D03 | `.agents/` | leer; keine AGENTS.md darin | DELETE / S4.6 |
| D04 | `test-results/` | nur `.last-run.json`, siehe P39 | DELETE / S4.6 |
| D05 | `tmp/` | nur leere `pdfs/activity-v2-plan`-Struktur | DELETE / S4.6 |
| D06 | `docs/benchmark/` | leer | DELETE / S4.6 |
<!-- markdownlint-enable MD013 -->

### Tooldateien P01–P13

Ausgangspräfix: `tools/`. Archivpräfix für P05–P13:
`docs/archive/repo-cleanup/activity-v2-tools/`; Dateiname unverändert.

<!-- markdownlint-disable MD013 -->
| ID | Datei | Disposition / Ziel / Block |
| --- | --- | --- |
| P01 | `activity-catalog.mjs` | KEEP_FIX: Standard-/Basiskatalogauflösung / S4.1 |
| P02 | `coderabbit.cmd` | KEEP unverändert / S4.7 |
| P03 | `activity-v2-r8-isolation.mjs` | KEEP_FIX: aktueller Modus und Masterplanleser / S4.1, S4.3 |
| P04 | `activity-v2-r13-read-consumer-isolation.mjs` | KEEP_FIX: aktueller Modus / S4.1 |
| P05 | `activity-v2-c3-training-surface.contract.test.mjs` | ARCHIVE / S4.2 |
| P06 | `activity-v2-r12-isolation.mjs` | ARCHIVE; aktuelle QA-Verweise historisch einordnen / S4.2, S6 |
| P07 | `activity-v2-r14-actual-release-transition.browser.smoke.js` | ARCHIVE / S4.2 |
| P08 | `activity-v2-r14-capture-cutover.contract.test.mjs` | ARCHIVE / S4.2 |
| P09 | `activity-v2-r14-local-product-browser.smoke.js` | ARCHIVE / S4.2 |
| P10 | `activity-v2-r14-release-coherence.browser.smoke.js` | ARCHIVE / S4.2 |
| P11 | `activity-v2-r14-release-coherence.contract.test.mjs` | ARCHIVE / S4.2 |
| P12 | `activity-v2-r14-v1-productload-rollback.ps1` | ARCHIVE; kein aktueller Rückweg / S4.2 |
| P13 | `activity-v2-r14-v2-productload-cutover.ps1` | ARCHIVE; nicht ausführen / S4.2 |
<!-- markdownlint-enable MD013 -->

### Activity-Referenzen und einzelne Dokumente P14–P23

<!-- markdownlint-disable MD013 -->
| ID | Ausgangspfad | Disposition / Ziel / Block |
| --- | --- | --- |
| P14 | `docs/qa/activity-v2-r8-local-android-pwa-runbook.md` | KEEP unverändert; lokale Testlane besteht / S4.7 |
| P15 | `docs/reference/activity-v2/activity-session-template-v1.schema.json` | KEEP unverändert / S4.7 |
| P16 | `docs/reference/activity-v2/activity-session-template-v1.example.json` | KEEP unverändert / S4.7 |
| P17 | `docs/reference/activity-v2/Catalog Maintenance Runbook.md` | KEEP_FIX: aktueller Masterplan-/Katalogpfad und Pflichtcommands / S6 |
| P18 | `docs/reference/activity-v2/Fitnessstudio_Geraeteinventar.md` | ARCHIVE nach `docs/archive/reference/activity-v2/Fitnessstudio_Geraeteinventar.md` / S4.3 |
| P19 | `docs/Future trainingsmodule update thoughts.md` | RENAME nach `docs/MIDAS Activity V2 Masterplan.md`; Inhalt erhalten / S4.3 |
| P20 | `docs/MIDAS C4 Independent Verification Waves Contract Proposal.md` | ARCHIVE nach `docs/archive/MIDAS C4 Independent Verification Waves Contract Proposal (LEGACY).md` / S4.4 |
| P21 | `docs/MIDAS Supabase Modernization Deferred Work and Recovery.md` | KEEP unverändert / S4.7 |
| P22 | `docs/MIDAS Supabase Operator Env.example` | KEEP unverändert; alle 13 Werte bleiben leer / S4.7 |
| P23 | `docs/MIDAS Supabase Operator Key and Store Map.md` | KEEP_FIX: belegter D33-Teilabschluss, Native/Legacy weiterhin zurückgestellt / S4.5 |
<!-- markdownlint-enable MD013 -->

### Toolingpaket P24–P38 und generiertes Testergebnis P39

Ausgangspräfix P24–P38: `docs/tooling-extraction/`.
Zielpräfix: `docs/archive/tooling-extraction/`; alle Namen und Bytes unverändert.

<!-- markdownlint-disable MD013 -->
| ID | Datei | Disposition / Block |
| --- | --- | --- |
| P24 | `ARGUS V1.0 Product Handoff.md` | ARCHIVE / S4.4 |
| P25 | `codex-tools-topology-inventory.json` | ARCHIVE / S4.4 |
| P26 | `migration-inventory.json` | ARCHIVE / S4.4 |
| P27 | `Post-W7 Migration Closure Report.md` | ARCHIVE / S4.4 |
| P28 | `Post-W7 Migration Closure Review.md` | ARCHIVE / S4.4 |
| P29 | `w3-m-midas-consumer-receipt.json` | ARCHIVE / S4.4 |
| P30 | `w4-argus-pilot-archive-receipt.json` | ARCHIVE / S4.4 |
| P31 | `w5-argus-v1-handoff-receipt.json` | ARCHIVE / S4.4 |
| P32 | `w6-m-midas-ownership-receipt.json` | ARCHIVE / S4.4 |
| P33 | `w7-retirement-candidate-manifest.json` | ARCHIVE / S4.4 |
| P34 | `w7-retirement-receipt.json` | ARCHIVE / S4.4 |
| P35 | `Invoke-W7ArchiveRehome.ps1` | ARCHIVE; nicht ausführen / S4.4 |
| P36 | `Invoke-W7Retirement.ps1` | ARCHIVE; nicht ausführen / S4.4 |
| P37 | `New-W7RollbackStaging.ps1` | ARCHIVE; nicht ausführen / S4.4 |
| P38 | `Remove-W7RollbackStaging.ps1` | ARCHIVE; nicht ausführen / S4.4 |
| P39 | `test-results/.last-run.json` | DELETE nach eigenem lokalen Preimage / S4.6 |
<!-- markdownlint-enable MD013 -->

### Direkte Consumer und zusätzliche erlaubte Dateien

- `app/modules/vitals-stack/activity/v2/isolation.contract.test.js`:
  aktueller R13-Modus, aktuelle kohärente Release-/Authinvariants;
  weiterhin gültige Diagnostics-/Injection-/Testlanechecks erhalten.
- `app/modules/vitals-stack/activity/v2/activity-consumer-final.contract.test.js`:
  aktueller R8-Modus, neuer Masterplanpfad und aktuelle Consumergrenzen;
  historische exakte Postimages nicht als aktuellen Gesamtvertrag ausgeben.
- Eine neue `tools/activity-current-isolation.contract.test.mjs` ist zulässig
  ausschließlich für positive/negative Orakel der beiden aktuellen Modi.
  Fixtures sind payload-/secretfreie lokale Sourcekopien außerhalb Git.
- `README.md`, `docs/modules/Activity Module Overview.md`,
  `docs/qa/health-capture-reports.md`, `sql/HOW_TO.md` und P17:
  aktuelle Navigation, aktueller Guardaufruf und Kennzeichnung historischer QA.
- `docs/archive/repo-cleanup/README.md` neu: Archivkarte, Stilllegung,
  Originalbaseline und Grenzen der archivierten Skripte; keine Prozesskopie.
- `CHANGELOG.md`: ein knapper tatsächlicher Bereinigungseintrag unter Unreleased,
  erst S6. Keine Release-/Versionsbehauptung.
- Historische Markdown-Dateien dürfen ausschließlich auflösbare Navigationslinks
  zu den verschobenen Zielen erhalten. Die genaue Liste wird in S1/S4R aus
  eingehenden Markdownlinks eingefroren. Codefences, damalige Commands,
  Rohpfade, Aussagen, Status, Hashes und JSON-Provenienz bleiben unverändert.
- Diese Roadmap und Evidence: Status, tatsächliche Findings/Checks/Resume und
  finaler Archivpfad. Keine anderen Dateien ohne konkrete neue Scopeentscheidung.

### Zusätzliche außerhalb MIDAS gefundene Bestände

Diese Einträge erhalten ausdrücklich `KEEP_PROTECTED`: bereits ausgelagerte
Historie oder fremder Repositoryscope. Sie werden weder gelöscht noch verschoben.
Damit sind auch die zusätzlich im Bericht genannten Funde disponiert.

<!-- markdownlint-disable MD013 -->
| Bestand unter `codex-tools/apps/argus/docs/` | Disposition |
| --- | --- |
| `(Ankerpunkt für späteren release von GPT-6) ARGUS Future Thought - Release-Aware Qualification & Anti-Churn Benchmarking.md` | KEEP_PROTECTED; externer Scope |
| `A.R.G.U.S. Future Thought — Token Telemetry & Counterfactual API Economics.md` | KEEP_PROTECTED; externer Scope |
| `A.R.G.U.S. V1.0 Pitch.md` | KEEP_PROTECTED; externer Scope |
| `Analyse nach deep dive 20.09.2026.md` | KEEP_PROTECTED; externer Scope |
| `ARGUS Future Thought - Addendum Thinking Room, Roadmap Authoring & Operator Transition.md` | KEEP_PROTECTED; externer Scope |
| `ARGUS Future Thought - Tool Provenance & Execution-Context Attribution.md` | KEEP_PROTECTED; externer Scope |
| `ARGUS Future Thought - Workfield-Oriented Benchmarking & Empirical Operator Routing.md` | KEEP_PROTECTED; externer Scope |
| `ARGUS Premorten analyse.md` | KEEP_PROTECTED; externer Scope |
| `Konsolidierte Arbeitsnotiz nach dem GPT-6-Astra-Release.md` | KEEP_PROTECTED; externer Scope |
<!-- markdownlint-enable MD013 -->

Das vorhandene externe Pilotarchiv mit 202 Dateien bleibt `KEEP_PROTECTED`.
Der historische W3-Prüfer in codex-tools bleibt ebenfalls unverändert. Dies ist
keine Wiederaufnahme von ARGUS und keine Verpflichtung zu dessen späterem Start.

## Phasenstatus

<!-- markdownlint-disable MD013 -->
| Schritt | Status | Exit / nächste erlaubte Aktion bei G-EXEC |
| --- | --- | --- |
| S1 | DONE | Vollständige aktuelle Baseline-/Consumerabdeckung und nativer Full Review → S2 |
| S2 | DONE | Konsistenter Zielvertrag einschließlich aktueller Guardorakel, Disposition und Acceptance; nativer Full Review → S3 |
| S3 | DONE | Bruchrisiken und Rückwege gedeckt; nativer Full Review → S4R |
| S4R | DONE | Finale Durchsicht, Gate, Preimages und ausführbarer Dateifreeze grün → S4.1 |
| S4 | DONE | S4.1–S4.7 umgesetzt und lokal geprüft → S5 |
| S5 | DONE | Relevante Testmatrix, nativer Full Review, erforderlicher externer Review und Findings geschlossen → S6 |
| S6 | DONE | Dokusync, Archivierung, finale Postchecks; erst danach Gesamt-DONE |
<!-- markdownlint-enable MD013 -->

### S1 — System- und Vertragsanalyse

1. Aktuelle Dirty Boundary, Baselinecommit, Dispositionsbestand und Reparse Points
   aufnehmen; EV-B01 gegen 15 Pfade/39 Dateien abgleichen. Neue Inhalte sind Drift.
2. Aktive Dateileser und echte Markdownlinks in Git-erfassten Dateien suchen;
   Prozentkodierung, Windowsseparatoren und Codefences berücksichtigen.
   Keine Secret-/Healthdateien pauschal durchsuchen oder ausgeben.
3. Betroffene Tool-/Contract-Testquellen vollständig lesen. Aktuelle Auth-,
   Script-/Cache-, Katalog-/Read-/Recoverygrenzen gegen geschützte Sources binden.
   EV-B02-Erstfehler gezielt reproduzieren, keine breite Produkt-Testserie.
4. Historische Provenienz von aktueller Navigation und ausführbaren Consumern
   unterscheiden; externen W3-Altprüfer und externe ARGUS-Bestände abgrenzen.
5. Nativer Full Contract Review; eigene Findings korrigieren, Scope/Receipt
   aktualisieren. Exit: alle geplanten Operationen und direkten Consumer bekannt.

Ergebnis: aktuelle Dateikarte, exakte Navigationslink-Fileliste und fachliche
Invariants für T04–T06. Gültige Vorbelege wiederverwenden; nächste Aktion S2.

### S2 — Fachlicher und technischer Zielvertrag

1. P01–P39, D01–D06 und Zusatzconsumer verbindlich bestätigen; Zielkollisionen
   ausschließen. Neues Masterplanziel ist P19, kein zweiter aktiver Masterplan.
2. Katalogauflösung auf die zwei bekannten archivierten Originalverträge binden:
   C2-Default und R1-Basis. Keine beliebige Dateisuche, Fallback auf falsche Version
   oder Änderungen der maschinenlesbaren Vertragsbytes.
3. Für R8/R13 `--current` als ausdrücklich aktuelles read-only Orakel definieren.
   Historische Modi behalten ihre historischen Bedeutungen und dürfen aktuell rot
   sein. Aktuelle Releasekohärenz prüft die in S1 gebundenen erwarteten Quellen,
   Reihenfolgen und Authgrenzen; kein Selbstvergleich, der beliebige Drift akzeptiert.
   Ein optionaler `--source-root <Pfad>` dient ausschließlich `--current`-Tests:
   die zu lesenden Sourcefixtures liegen im eigenen ignorierten S4R-Staging;
   echte Repo-/Gitgrenzen bleiben separat am Originalrepo geprüft. Fixtures
   niemals ausführen, unbekannte Optionen und Reparse-/Pfadausbrüche ablehnen.
   Jede zu ändernde Erwartung vor dem Toolpatch einem belegten Vertrag zuordnen:
   ursprüngliche Assertion/Datei, Schutzzweck, gültiger oder historischer Stand,
   belegter Änderungsgrund, aktueller Ersatzcheck beziehungsweise reine Historie
   und zugehörige Positiv-/Negativfälle. Diese Prüfdeckungsmatrix in EV-PRE01
   einfrieren; weder Produktbytes noch das später erzeugte PASS sind die Begründung.
4. Weiterhin verpflichtend: ein produktiver V2-Writer, erhaltene V1-/V2-Reader,
   kein produktiver Test-PWA-/Debugload, kein Cleartext in Main, keine Secrets,
   keine produktive DML, injection-only Commit-/Recoverykern und erlaubte
   Named-Key-/User-Authgrenzen. Sourcefixtures müssen Verstöße gezielt ablehnen.
5. Keine neuen Writes oder Datenformate. Native/Legacy bleiben DEFERRED;
   Operatorfelder leer beziehungsweise nur als Namen dokumentiert.
6. Nativer Full Review gegen Modul-/Ownervertrag und A01–A10.

Exit: konkrete Orakel und Ziellinks ohne offene Grundsatzentscheidung; S3.

### S3 — Bruchrisiko-, Security- und Umsetzungsreview

- Consumerverlust: Dateileser vor Move korrigieren beziehungsweise Move plus
  Readerdelta atomar behandeln; kein Abschluss mit ENOENT oder verlorenen Tests.
- Provenienzverlust: Archive P05–P13, P18, P20, P24–P38 byteidentisch;
  historische Rohpfade und Hashes nicht nachträglich aufwerten.
- Guardabschwächung: alte Checks einzeln fachlich einordnen, aktuelle negative
  Orakel erhalten; grünes Ergebnis darf nicht durch Löschen der Schutzchecks entstehen.
- Fehlziel/Overwrite: aufgelöste absolute Grenzen, keine Reparse Points,
  Zielabwesenheit und SHA-256-Vergleich vor Quellentfernung.
- Löschdrift: fünf dateifreie Verzeichnisse und P39 exakt überprüfen;
  unbekannte Dateien schützen. Kein Shellwechsel und kein `git clean`.
- Fremde Arbeit: scoped Preimages und own-diff; kein pauschales Gitrestore.
- Archivscripts: Ausführung ausdrücklich ausgeschlossen; verschobene Rootannahmen
  in Archivkarte nennen. Produktrollback ausschließlich eigener Bereinigungspatch.
- Externe Altpfade: historischer W3-Prüfer kann die neue Ablage nicht reproduzieren;
  Reproduktion benötigt Originalbaseline, kein stiller Nachbarrepo-Fix.

Ergebnis: Zuordnung F01–F12 zu T01–T11 und S4-Blöcken. Nativer Full Review,
berechtigte Planfindings korrigieren; Exit ohne ungedeckten P0/P1 → S4R.

### S4R — finale Durchsicht und ausführbarer Scope-Freeze

1. S1–S3, Gate G-EXEC, exakte Dateien, Tests und S6-Coverage nativ vollständig
   prüfen. Korrigierte Erkenntnisse in denselben Plan eintragen.
   Für S4.1 muss die Prüfdeckungsmatrix aus S2 vollständig vorliegen:
   kein ungeklärter Schutzzweck und keine ersatzlos gestrichene gültige Invariant.
   Gebundene Baseline, Fixturemutationen und erwartete fachliche Fehlerklassen
   werden vor Änderung des Prüfers festgelegt, nicht aus dessen Output übernommen.
2. Lokales ignoriertes Preimage-Staging unter
   `.tmp/repo-cleanup/MC-EX-01-<Zeitstempel>/` vorbereiten. Nur eigene Inhalte:
   alle veränderten/verschobenen/gelöschten Dateien und Zusatzconsumer,
   Pfade, Bytes und SHA-256; P39 ebenfalls sichern. Keine Secretstores kopieren.
   Geschützte Produktbytes über Baselinecommit plus scoped Gitdiff nachweisen.
3. Zielabwesenheit, absolute Repo-/Staginggrenzen, Reparsefreiheit, Staging-
   Ignorierung und reconstructable Rückweg prüfen. Zusatzlinkliste einfrieren.
   Für KEEP-/Archividentität SHA-256 verwenden; bei Sourcefixtures gezielte
   Negativmutation nur unter der eigenen Staginggrenze. Alle sieben geplanten
   neuen Zielpfade waren bei Planung am 2026-10-13 nicht vorhanden; vor Mutation
   trotzdem erneut prüfen.
4. Arbeitsgröße large wegen 39 Dispositionen, Guard-/Testkorrekturen,
   historischer Byteerhaltung, Linkpflege, Review und Closure. Ownerbriefing:
   lokale Ablage-/Testwirkung; kein Produktwrite; Rückweg eigenes Preimage;
   größte Risiken Guardabschwächung/Provenienzverlust; Acceptance A01–A10.
   Bereits konkret erteiltes G-EXEC nicht erneut abfragen.
5. Zusammenlegung: S4.1 Toolreparatur vor historischen Moves; S4.3 Rename und
   aktive Reader zusammen; S4.4 Provenienzpaket zusammen; Delete erst S4.6.
   Kein eigener Childauftrag pro Datei. S6-Dokusync bleibt nach S5.

Exit: ausführbarer Freeze mit Datum, Baseline, eigener Dirty Boundary, Gate,
Preimage und konkreter Linkliste belegt. Sonst kein S4-Start.

### S4 — Umsetzung

<!-- markdownlint-disable MD013 -->
| Block / Status | Inputs / erlaubte Tools | Änderung / Dateien | Output / direkte Consumer | Review / Checks | Gate, Fehler-/Rückweg und sichere Postcondition |
| --- | --- | --- | --- | --- | --- |
| S4.1 / DONE | F02–F04, vollständige Tools/Tests, geschützte aktuelle Sources und eingefrorene Prüfdeckungsmatrix EV-PRE01; Node, lokale Sourcefixtures, Gitdiff | P01: C2-/R1-Pfadadapter. P03/P04: expliziter aktueller Modus. Zwei benannte Contract-Tests und gezielter neuer Guardtest. Produktquellen unverändert. | Aktive Prüfer funktionieren am tatsächlichen Repostand; historische Modi bleiben klar getrennt. | Consumerreview; T04–T06 und Zuordnung jeder geänderten Assertion; positive Baseline grün, negative Mutation wegen ihrer vorab erwarteten fachlichen Fehlerklasse rot. | G-EXEC; eigenes Preimage/Toolpatch rückspielen. Kein grüner Stand durch bloßes Rehashen, Versionslesen oder Testlöschen. Ungedeckter Schutzzweck sperrt den Exit zu S4.2. |
| S4.2 / DONE | P05–P13, ursprüngliche Baseline, S4.1-Consumerkarte; PowerShell Hash/Move | Neun historische Tools byteidentisch ins festgelegte Toolarchiv. | `tools/` enthält vier bisherige Tools plus höchstens den gezielten neuen Guardtest; alte Umschaltscripts werden nicht ausgeführt. | Delta/Consumer; T02, T03, T07; keine aktive Imports/Reader auf entfernte Tools. | G-EXEC; bei Zielkollision stoppen, Originale erhalten. Kopie/Move nur mit exaktem Hashpostcheck; Rückweg eigene Dateien. |
| S4.3 / DONE | P18/P19, aktive Masterplanleser; PowerShell, Node | Studioinventar byteidentisch archivieren; Masterplan byteidentisch umbenennen; P03 und `activity-consumer-final.contract.test.js` in derselben Transaktion auf neuen Pfad umstellen. | Ein aktiver eindeutig benannter Masterplan; Tests lesen ihn, Inventar bleibt Provenienz. | Consumerreview; T02, T03, T06, T07; fachlicher Inhalt unverändert. | G-EXEC; Rename und Readerdelta gemeinsam zurücknehmen, sofern Prüfung fehlschlägt. |
| S4.4 / DONE | P20/P24–P38, Closure/Receipts, externe Altpfadkarte | Toolingpaket und C4-Vorschlag an feste Ziele verschieben; Originalbytes erhalten. | Historisches vollständiges Paket, keine ARGUS-Zukunftsausführung. Externe Bestände/Repos unverändert. | Consumerreview; T02, T03, T07, T09; historische Rohpfade erlaubte Provenienz, aktive Dokusync folgt S6. | G-EXEC; keine W7-Skripte ausführen. Originalbaseline/Preimages sind Rückweg. Kein Overwrite oder Hashrewrite. |
| S4.5 / DONE | P23, belegte D33-Abnahme und P21 | Storemap erhält aktuellen D33-Teilabschluss; D32-Aussagen als damaliger Stand abgrenzen. | Backend/Web-Abnahme verständlich; Native/Legacy bleiben zurückgestellt; keine neuen Remoteclaims. | Delta/Consumer; T08; alle 13 Operatorfelder und Consumer-/Storegrenzen erhalten. | G-EXEC; ausschließlich Dokumentpatch zurücknehmbar. Keine Keys lesen/setzen oder klinische Vollabnahme erfinden. |
| S4.6 / DONE | D01–D06/P39 und frische Inhaltsprüfung; ausschließlich PowerShell | Exakt die sechs erlaubten Altverzeichnisse löschen, P39 vorher lokal sichern. | Verzeichnisse fehlen; keine anderen Dateien entfernt. | Consumerreview; T01, T02, T09; alle absoluten Targets innerhalb MIDAS, keine Reparse Points, exakter Bestand. | G-EXEC; unerwarteter Inhalt bleibt geschützt und wird vor seiner Behandlung eingeordnet. Native `Remove-Item -LiteralPath`; Rückweg eigene gesicherte P39-/Verzeichnisstruktur. |
| S4.7 / DONE | KEEP-Matrix, EV-B01 und own-diff | Behaltene P02/P14–P16/P21–P22 auf Byteerhaltung prüfen; alle 39 Dispositionen und sechs Verzeichnisse abgleichen. | Vollständiger Dispositionsabschluss ohne Produktänderung; gültige Evidence je Block. | Consumerreview; T01, T07, T09; Runbook-/Vorlagenconsumer weiterhin vorhanden. | G-EXEC; Restlücke unter derselben ID schließen. Exit nur bei geprüften S4.1–S4.7; nächste Aktion S5. |
<!-- markdownlint-enable MD013 -->

Pro Block EV-W01–W07 aktualisieren: tatsächliches Delta, Checks, Finding/Fix,
Invalidation und sichere Postcondition. Kein neues Journal oder Meta-Receipt.
Aktuelle Dokuverweise dürfen bis S6 vorübergehend als bekannte offene Linkliste
geführt werden; ausführbare Reader dürfen an keiner sicheren Blockgrenze brechen.

### S5 — Tests und Abschlussreview

<!-- markdownlint-disable MD013 -->
| ID | Vertragsfrage / konkreter Check | Erwartung | Ergebnis / Invalidation |
| --- | --- | --- | --- |
| T01 | Dispositionsabgleich: 15 Pfade, P01–P39, D01–D06, Zusatzallowlist und neu erfasste Drift | Vollständig/eindeutig, kein unbekannter Löschkandidat | PASS / 2026-10-13; Bestands-/Scopeänderung → gezielter Neuabgleich |
| T02 | Original-/Ziel-SHA-256 für alle ARCHIVE/RENAME-Dateien; Zielkollisionen; sechs Delete-Postconditions | 26 Archivdateien und ein Rename byteidentisch; P39 gesichert; keine verlorenen Dateien | PASS / 2026-10-13; Move/Byte-/Zieldrift → betroffene Dateien |
| T03 | Aktive Reader/Imports und tatsächlich navigierbare Links getrennt von historischen Rohpfaden suchen | Keine aktiven Leser auf entfernte Pfade; bekannte S6-Linkliste vollständig; Nachbar-W3-Historie ausdrücklich abgegrenzt | PASS / 2026-10-13; Pfad-/Consumerdelta → relevante Linkgruppe |
| T04 | `node tools/activity-catalog.mjs check`; `search "Romanian Deadlift"`; `describe romanian_deadlift`; unbekannten Key/Pfad negativ prüfen | Originalkatalog v2, 80 Einträge; Parität und Suche erhalten, unbekannte Inputs bleiben Fail; C2/R1 Originalbytes unverändert | PASS / 2026-10-13; Tool-/Katalogpfadänderung → T04 |
| T05 | R8/R13 mit `--current`; `node --test tools/activity-current-isolation.contract.test.mjs`; `node --check` für drei geänderte Toolquellen/Testtool | Prüfdeckungsmatrix vollständig; positive gebundene Baseline grün. Negative lokale Sourcefixtures für falsches Flag, gemischte Version/Reihenfolge, unerlaubten Produkt-Testload, Secretmaterial und verletzte Netzwerk-/Recovery-/DMLgrenze scheitern an der jeweils vorab gebundenen fachlichen Fehlerklasse, nicht an beliebigem Exit 1/Harnessfehler | PASS / 2026-10-13; Guard-/Oracle-/geschützter Sourceänderung → betroffene Fälle |
| T06 | `node --test app/modules/vitals-stack/activity/v2/isolation.contract.test.js app/modules/vitals-stack/activity/v2/activity-consumer-final.contract.test.js app/modules/vitals-stack/activity/v2/session-template.contract.test.js`; danach separater fokussierter Test-PWA-Aufruf unten | Aktuelle Isolation, Masterplanreader, lokale Testlane und Vorlagenformat bestehen; historische Hashfälle ehrlich eingeordnet, keine still entfernte Schutzdeckung | PASS / 2026-10-13; Tool/Test/Reader/Schemaänderung → betroffene Tests |
| T07 | Byte-/JSON-/Operatorformprüfung von KEEP und archivierter Provenienz; genau 13 leere Envfelder | Unveränderte geschützte Referenzen; valide JSONs; keine Secretwerte | PASS / 2026-10-13; betroffene Byte-/Formänderung → T07 |
| T08 | Nativer vollständiger Code-/Contract-/Security-/Scopereview; danach S5-CodeRabbit `coderabbit review --agent --uncommitted` | F01–F12 gedeckt, keine Guardabschwächung; externer Review ausgewertet, kein fingiertes PASS | PASS / 2026-10-13; berechtigter Fix → betroffene Retests und ggf. ein Verifikationslauf |
| T09 | `git diff <Ausführungsbaseline> --` gegen geschützte Produkt-/Backend-/SQL-/Android-/Workflowflächen; benannte Testausnahmen separat erlauben | Produktbytes unverändert, keine externe/Secret-/Dateneffektaktion und keine fremde Änderung erfasst | PASS / 2026-10-13; Delta-/Baselineänderung → T09 |
| T10 | `ML` auf ausschließlich neue/geänderte Markdownfiles; geänderte PS-Sources nur bei tatsächlichem Delta parsen | Keine Markdownfehler, kein neues Toolsetup; Tabellen-MD013 nur lokal begründet | PASS / 2026-10-13 für Ausführung; Planlint separat EV-PLAN |
| T11 | S6: interne/eingehende relative Pfade und reale Anker nach Rename/Rehome; UTF-8/Umlaute, `git diff --check`, Scope/Gitstatus, finale Native-SoTprüfung | Finale Ziellinks funktionieren; nach `(DONE)`-Archivierung weiterhin konsistent; kein Commit/Publish | PASS / 2026-10-13; finaler Move/Statusdelta → betroffene Postchecks |
<!-- markdownlint-enable MD013 -->

Reihenfolge: günstiger Bestands-/Produktbyteprecheck → fokussierte lokale Matrix
T04–T07 → nativer Full Review → kanonischer externer S5-Review → berechtigte Fixes
und invalidierte Retests → finaler Review. Für diese Wirkung sind keine zusätzlichen
DB-/Deno-/Browser-/Device-/Gesamtproduktsuiten nötig. Historische archivierte
Releaseharnesses werden nicht gegen v34 ausgeführt und nicht als heutiges PASS geführt.

CodeRabbitstatus/Auth vor dem Lauf wertfrei eindeutig prüfen. Ein Initiallauf,
höchstens ein Verifikationslauf; kein weiterer Versuch aus einem neuen Finding.
Auth-/Tool-/Budgetausfall ist ein echtes Pflichtgap, unabhängig gültige Evidence
bleibt gültig. Keine alternative Installation, kein Login oder natives Ersatz-PASS.

Die Authprüfung erfolgt erst am S5-Revieweintritt mit einem begrenzten read-only
`coderabbit auth status`-Aufruf. Exit 0 allein genügt nicht; der Status muss eindeutig
klassifiziert werden können, ohne Account-/Tokenwerte in Evidence zu übernehmen.
Bei fehlender Auth, unklarer Ausgabe, Timeout oder Toolfehler keinen Review starten
und keine automatische Retry-/Installations-/PATH-/Loginmission eröffnen.
EV-R01 als GAP mit sicherer Fehlerklasse, betroffener Scopebaseline und tatsächlichem
Reviewbudget führen. Bereits gültige lokale Checks bleiben gültig; unabhängige
Prüfungen und Findingkorrekturen dürfen fortgesetzt werden. S5 ist dann nicht PASS,
S6/Gesamt-DONE bleibt gesperrt. Sicheren geprüften Zustand und eigenes Staging
erhalten; ein neues Ownerbriefing benennt ausschließlich den nötigen begrenzten
Auth-/Toolentscheid oder eine ausdrücklich wirksame Disposition des Pflichtgaps.
Eine spätere Scope-/Sourcedrift invalidiert nur die betroffenen lokalen Nachweise;
die Authstörung allein verlangt keinen erneuten Gesamttest.

Exit S5: relevante Matrix und Pflichtreview erfüllt, Findings korrigiert; S6 offen.

### S6 — Doku-Sync und endlicher Abschluss

<!-- markdownlint-disable MD013 -->
| SoT / Datei | Konkreter Sync oder begründete Unbetroffenheit |
| --- | --- |
| README | ARGUS aus aktueller Tool-/Zukunftsnavigation nehmen; knapper Stilllegungs-/Archivverweis statt Aktivierungsanleitung. |
| Activity Overview | Neuer Masterplan-/Inventarpfad, vier behaltene Tools, aktuelle Guardcommands; historische R12-/R14-Nachweise als Historie. Keine fachliche Activityänderung. |
| `docs/qa/health-capture-reports.md` | Aktuelle ausführbare Toolaufrufe auf `--current`; R12-/alte Releasechecks ausschließlich historische Evidence; Schutzfragen bleiben abgedeckt. |
| `sql/HOW_TO.md` | Nur aktueller Isolationstoolaufruf/Referenz; SQLbytes und produktive SQLbefehle unverändert. |
| Catalog Maintenance Runbook | Echter archivierter Katalogvertrag, aktueller Masterplanname, keine veraltete Blockade durch bereits abgeschlossene R7/R8/R11-Gates; immutable Katalog-/Ownergrenzen erhalten. |
| Archivkarte | Genau Ziele, Originalbaseline, Stilllegung, historische Pfadbelege und nicht aktuell ausführbare Skripte erklären. |
| Historische Markdownnavigation | Nur eingefrorene tatsächliche Links rebasen; damalige Inhalte, Codeblöcke, Hashes und Receipts unverändert. Falls Byteerhaltung und eingebetteter Link kollidieren: unveränderten historischen Originalbeleg erhalten und auf Archivkarte als solchen kennzeichnen. |
| Operator-Storemap | S4.5-Ergebnis und P21 konsistent; D33-Backend/Web-Teilabnahme, keine komplette Native-/Legacyfreigabe. |
| AGENTS / DEV_ENVIRONMENT | Unverändert: Produkt-/Ownergrenzen und CodeRabbitshim bleiben gültig; keine neue Prozesskopie. |
| BLUEPRINT-Kern/Formen / ATLAS | Unverändert: ausschließlich Consumerauftrag, keine gemeinsame Installation oder Regeländerung. |
| Andere Module / BackendREADME / QA-Index / Recoveryrunbook | Unverändert, sofern die eingefrorene direkte Linkkarte keine betroffenen echten Navigationslinks nachweist; dann ausschließlich diesen Link korrigieren und Scope im Freeze benennen. |
| CHANGELOG | Tatsächliche lokale Bereinigung und erhaltene Betriebs-/Produktgrenzen knapp unter Unreleased; kein Release. |
| Roadmap / Evidence | Tatsächliche A-/T-/EV-Deckung, Findings, Restgrenzen, gültiger finaler Digest und Resume synchronisieren; keine doppelte aktive SoT. |
<!-- markdownlint-enable MD013 -->

1. Vorgesehene Doku-/QA-/HOW-TO- und tatsächliche Linkänderungen durchführen;
   T10/T11 auf genau betroffenem Delta. Unveränderte historische Originale
   werden nicht pauschal gelintet oder stilistisch modernisiert.
2. Eigenes Staging erst nach erfolgreichem Reconstructability-/Postimagecheck
   gezielt entfernen; absolute eigene Untergrenze und Reparsefreiheit prüfen.
   Fremde `.tmp`-Inhalte/Eltern nicht entfernen. Bei Fehler Staging erhalten.
3. Roadmap/Evidence am Ende nach
   `docs/archive/MIDAS Repository Cleanup Execution Roadmap (DONE).md` und
   `docs/archive/MIDAS Repository Cleanup Execution Evidence (DONE).md`
   verschieben, alle darin tatsächlich navigierbaren Links auf die Zieltiefe
   rebasen und gegenseitige Links aktualisieren. Historische Baselinepfade bleiben
   dokumentierte Originalpfade, keine aktuellen Commandziele.
4. T11 am finalen Archivstand, nativer betroffener SoT-Review, A01–A10 bestätigen.
   Erst danach S6/Gesamtstatus DONE setzen und letzte Status-/Digeständerung
   nochmals auf Links, Markdown und Gitdiffhygiene prüfen.

## Planerstellungsreview

Dieser Abschnitt dokumentiert ausschließlich den aktuellen Autorenauftrag.
Er stellt keine S1–S6-Ausführung oder S4-Freigabe dar.

<!-- markdownlint-disable MD013 -->
| Prüfung | Status | Nachweis / Korrektur |
| --- | --- | --- |
| Findings- und Full Contract Review | PASS / 2026-10-13 | AGENTS/BLUEPRINT/Modulgrenzen, Gates, Sourcefragen, alle Findings und Consumer nativ geprüft; Korrekturen unten. Keine offenen P0/P1-Planfindings. Umsetzungsfindings bleiben NOT_IMPLEMENTED. |
| S1–S6-Coverage und Reihenfolge | PASS / 2026-10-13 | Analyse → Zielvertrag → Risiko → S4R/Freeze → sieben S4-Blöcke → S5 → S6; Outputs, Reviews, Exits, Gates, Evidence, Rollback und Resume abgebildet. |
| Dateidisposition | PASS / 2026-10-13 | P01–P39 und D01–D06 maschinell/native abgeglichen; 39 Baselinehashes stimmen; 26 Archive, ein Rename, elf KEEP/KEEP_FIX, eine Datei-Delete. Alle zusätzlichen externen Funde KEEP_PROTECTED. |
| Markdownlint / Links / Gitdiff | PASS / 2026-10-13 | Markdownlint-cli2 0.23.2: initial MD012 in Evidence, korrigiert, Folgelauf null Fehler. 18 lokale Links inklusive Anker und UTF-8 geprüft; `git diff --check` ohne Befund. |
<!-- markdownlint-enable MD013 -->

### Korrigierte Autorenfindings

<!-- markdownlint-disable MD013 -->
| ID | Reviewfinding | Korrektur / Disposition |
| --- | --- | --- |
| AR01 | Ursprüngliches F03 erfasste nur den C2-Standardpfad; eingebettetes R1-Ziel ebenfalls nicht vorhanden. | CLOSED: tatsächlichen ENOENT erhoben; beide Pfade und immutable Provenienz in S2/S4.1/T04 gebunden. |
| AR02 | Alte Guardfehler waren zunächst nur aus Source abgeleitet; Anpassung könnte Schutzdeckung verlieren. | CLOSED: R8-/R13-Erstfehler tatsächlich erhoben; aktueller Modus, geschützte Sources, direkte Tests und positive/negative Orakel verbindlich. |
| AR03 | Rehome lässt Rootableitungen historischer Skripte nicht automatisch weiter funktionieren. | CLOSED: Archive sind Historie; keine Ausführung, Originalbytes/Originalbaseline und eigener Bereinigungsrückweg statt alter Scripts. |
| AR04 | Eine Reparatur im Nachbar-Repo wäre unautorisierter Scope; zusätzliche ARGUS-Funde könnten unberücksichtigt bleiben. | CLOSED: historischer W3-Prüfer, neun externe ARGUS-Dokumente und 202-Dateien-Pilotarchiv explizit KEEP_PROTECTED. |
| AR05 | Negative Guardfixtures brauchten einen konkreten Testseam und sichere Dateigrenze. | CLOSED: `--source-root` ausschließlich im aktuellen Modus, eigenes ignoriertes Staging, echte Repo-/Gitgrenzen getrennt, Fixtures nicht ausführen. |
| AR06 | Tool-/Testkorrektur macht die spätere Ausführung zu einem Codeauftrag; Autorenreview ist davon getrennt. | CLOSED: CodeRabbitpflicht ausschließlich späteres S5, kein externer Planreview; G-EXEC offen, S1–S6 NOT_STARTED. |
| AR07 | Markdownlint fand eine überzählige Schlussleerzeile in Evidence. | CLOSED: Leerzeile entfernt, echter Folgelauf null Fehler; Tabellen-MD013-Ausnahmen ausschließlich lokal. |
| AR08 | Nachgereichte Kritik: S4.1 könnte Erwartungen bis zu einem künstlichen PASS abschwächen. | CLOSED für den Plan: vor Mutation eingefrorene Assertion-/Vertrags-/Ersatzcheckmatrix und spezifische Negativfehler verpflichtend; tatsächliche Deckung erst EV-PRE01/EV-W01/T05–T06. |
| AR09 | Nachgereichte Kritik: ungeklärte CodeRabbit-Auth könnte spätere automatische Toolingarbeit oder vorzeitiges DONE auslösen. | CLOSED für den Plan: begrenzter read-only Check erst beim S5-Revieweintritt; bei unklarem/rotem Ergebnis EV-R01 GAP, keine Toolingmission und kein S5-/Gesamt-PASS. |
<!-- markdownlint-enable MD013 -->

## Rollback, Stop und Resume Card

- MC-EX-01 DONE am 2026-10-13; A01–A10 erfüllt, S1–S6 und S4.1–S4.7 DONE.
- 26 Originaldateien byteidentisch archiviert; Masterplan byteidentisch
  umbenannt; sechs Verzeichnisse und der generierte P39-Status entfernt.
- Aktuelle Tools/Consumer erhalten; CodeRabbit ein Initiallauf mit 0 issues,
  kein Verifikationslauf und keine Codeänderung nach dem Review.
- Originalarchive und geschützte Produktbytes geprüft; neue Dokudeltas ohne
  neue Markdownlintfehler, finale Roadmap/Evidence/Archivkarte mit 0 Fehlern.
- Drei unveränderte PWA-Snapshotfälle historisch invalidiert; ihre heutigen
  Schutzfragen im aktuellen Tooltest erhalten, kein historisches PASS erfunden.
- Eigenes temporäres Staging und dessen leere eigene Eltern entfernt.
- Originalsourcecommit c2e147e plus Dispositionsmatrix/Archivoriginale bleiben
  Reproduktionsgrundlage. Kein alter W7-/V1-Rollback im aktuellen Produkt.
- Git: ausschließlich eigener uncommitteter Scope, Index leer, HEAD unverändert.
  Kein Commit/Push/Tag/Deploy und keine Produkt-/Secret-/Geräteaktion.
- Nächste Aktion: Abschlussbericht an Stephan; keine weitere Ausführung
  aus diesem Auftrag. Neue Produkt-/Gitwirkung benötigt eigenen Auftrag.
