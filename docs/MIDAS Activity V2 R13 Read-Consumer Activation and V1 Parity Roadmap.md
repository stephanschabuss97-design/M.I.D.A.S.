# MIDAS Activity V2 R13 Read-Consumer Activation and V1 Parity Roadmap

Diese Roadmap aktiviert die in R11 und R12 isoliert vorbereiteten
Activity-Consumer. Sie ist bewusst kein Capture-Cutover: Activity V1 bleibt
bis R14 der einzige produktive Schreibpfad.

---

## Roadmap-Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Status | `PAUSED; Discovery Wave S1-S4R PASS; Owner-Cut vor S4, kein GO erteilt` |
| Modul / Bereich | `Activity V2 / Doctor View / Reports / Health Export / Protein Target / Trendpilot / Supabase Edge Auth` |
| Owner / Kontext | `Stephan; persönliche Single-User-Gesundheitsanwendung` |
| Chat-Lebenszyklus | `Denkraum -> eigener Ausführungs-Chat` |
| Erstellt am | `2026-08-23` |
| Letzter Stand | `2026-08-23; Owner beendet die Arbeit nach S4R bewusst wegen verbleibendem Nutzungskontingent; S4 unbegonnen` |
| Aktueller Schritt | `PAUSE; beim nächsten Einstieg kurzer read-only Drift-Check, danach unverändertes Owner-Gate für S4-S5.3` |
| Risikoklasse | `R3` |
| Standard-Reviewtiefe | `Consumer; Full an S4R und S5` |
| Ausführungsmodell | `GPT-5.6 Sol` |
| Reasoning-Standard | `High` |
| Reasoning-Ausnahmen | `S2, S3, S4R, S4.1, S4.2, S4.5, S4.6 und S5: Extra High wegen Auth, SQL, medizinischer Semantik und produktivem Cutover` |
| Autonome Ausführungswellen | `Welle 1: S1-S4R; nach Owner-GO Welle 2: S4-S5.3; nach den jeweils expliziten Produktivfreigaben Welle 3: restliches S5 und S6` |
| Autonomieprofil | `gated waves` |
| Maximal autonomer Endpunkt | `S4R ohne weitere Freigabe; S5.3 nach S4R-GO; S6 erst nach den einschlägigen S5.4-S5.7-Owner-Gates` |
| Geplante Reasoning-Wellen | `S1 High; S2-S4R Extra High; S4 gemäß Substep; S5 Extra High; S6 High` |
| Erwartete Arbeitsgröße | `large; S4R bestätigt 23-27 Implementierungsdateien plus Roadmap/Evidence in vier Ausführungsblöcken` |
| Externes Reviewbudget | `S1-S4: 0; S5: 1 CodeRabbit-Initiallauf + höchstens 1 Verifikationslauf` |
| Owner-Erklärmodus | `Briefing + S6-Recap` |
| Betroffene Hauptdateien | `index.html; service-worker.js; Doctor-/Activity-Consumer; midas-monthly-report; midas-protein-targets; midas-trendpilot; zwei Workflows; SQL16/SQL26; Tests und Doku` |
| Deploy relevant | `ja: Web/PWA, drei Edge Functions, zwei GitHub-Workflows, SQL/ACL` |
| Produktive Schreibwirkung | `ja: owner-gatete DDL/ACL, Deploy-/Workflowkonfiguration und bestehende Protein-/Trendpilot-/Reportwrites; keine Activity-V2-Capturedaten` |
| Workflow-Vertrag | `docs/templates/MIDAS Roadmap Workflow Contract.md` |
| Evidence-Datei | `docs/MIDAS Activity V2 R13 Read-Consumer Activation and V1 Parity Evidence.md` |
| Gekoppelte Roadmaps | `R11/R12 als Producer; R14 bleibt alleiniger Capture-Cutover` |
| Evidence-Owner | `diese Roadmap` |
| Archivziel | `docs/archive/MIDAS Activity V2 R13 Read-Consumer Activation and V1 Parity Roadmap (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Ausführungs-Chat-Startkarte

- Auftrag:
  - R13 zunächst autonom von S1 bis einschließlich S4R abarbeiten.
  - Nach jedem Hauptschritt Full Contract Review, Findings-Korrektur und
    Status-Sync durchführen.
  - Nach S4R mit einem Owner-Briefing stoppen. Bei anschließendem explizitem
    Owner-GO S4 vollständig sowie S5.1-S5.3 ohne weitere Substep-Freigaben
    autonom abarbeiten und vor S5.4 erneut stoppen.
  - Nach den jeweils einschlägigen expliziten Freigaben die produktiven
    S5-Gates deterministisch abarbeiten und anschließend S6 autonom
    abschließen. Secretänderungen, produktives SQL, Deploys, Workflowläufe,
    Commit und Push sind durch diese Startkarte allein nicht freigegeben.
- Ergebnis der Denkraumübergabe:
  - `PASS`: Produktziel, Nichtziele, Auth-Grenze, SQL-Ziel,
    Consumerverträge, Cutoverreihenfolge und Owner-Gates sind dokumentiert.
- Verbindliche Lesereihenfolge:
  1. diese Startkarte, Metadaten, Resume Card und Context Receipt
  2. `AGENTS.md` und `README.md`
  3. `docs/DEV_ENVIRONMENT.md`
  4. `docs/templates/MIDAS Roadmap Workflow Contract.md`
  5. Pflichtreferenzen dieser Roadmap, jeweils nur die relevanten Abschnitte
  6. aktueller Git-Status, relevanter Diff und reale Runtime
- Startschritt:
  - `S1`
- Freigegebener autonomer Block:
  - aktuell `S1-S4R`
  - nach explizitem S4R-GO `S4-S5.3`
  - nach den jeweils protokollierten Produktivfreigaben verbleibendes S5 und
    `S6`
- Autonomieprofil und maximaler Endpunkt:
  - `gated waves; aktuell S4R, danach S5.3, Abschluss erst nach S5-Gates`
- Erlaubte Autonomie:
  - lokale Reads, read-only Inventare, lokale Dokumentkorrekturen,
    Testplanung und Statuspflege
  - nach explizitem S4R-GO auch lokale Code-, SQL-, Workflow- und
    Testartefakte aus S4 sowie die integrierten lokalen und produktiv
    read-only Prüfungen aus S5.1-S5.3
- Owner-Gates:
  - jede Schlüsselanlage oder Secreteingabe
  - produktives SQL/ACL
  - `verify_jwt`-Änderung und Edge-Deploy
  - GitHub-Secrets, Workflowänderung/-lauf
  - produktiver Web-/PWA-Cutover, Commit, Push und Rollback
- Stop-Bedingungen:
  - unbekannter oder widersprüchlicher Authmodus
  - nicht beweisbare Ownerbindung
  - duplizierte V1-/V2-Union
  - unerwartete SQL25-, Consumer-, Runtime- oder Datenabweichung
  - fehlende Rollbackfähigkeit
  - Scope-Ausweitung auf Activity-V2-Capture oder globale Schlüsselmigration
- Halluzinationsschutz:
  - keine Schlüsselwerte lesen oder ausgeben
  - keine Remoteversion, ACL, Workflowkonfiguration oder Produktverdrahtung
    aus der Roadmap ableiten; S1 muss den Iststand belegen
  - fehlende Fakten als Finding behandeln
- Startprompt:

```text
Arbeite die Roadmap
`docs/MIDAS Activity V2 R13 Read-Consumer Activation and V1 Parity Roadmap.md`
gemäß ihrer Ausführungs-Chat-Startkarte ab.

Ziel dieses ersten Auftrags ist die autonome Discovery Wave S1-S4R. Lies die
festgelegten Quellen in der angegebenen Reihenfolge, prüfe
den realen Git-, Code-, Supabase- und Workflow-Iststand und arbeite S1, S2,
S3 und S4R deterministisch nacheinander ab. Schließe jeden Hauptschritt mit
Full Contract Review, Korrektur berechtigter Findings, Status-Sync, Resume
Card und Evidence-Sync ab. Fahre nur bei bestandenem internem Continuation
Gate automatisch fort.

Erfinde keine fehlenden Verträge und gib niemals Schlüsselwerte, JWTs oder
sensible Payloads aus. Produktives SQL, Schlüsselanlage, Secreteingabe,
verify_jwt-Änderung, Edge-/Webdeploy, Workflowlauf, Commit, Push und
Deviceaktion bleiben owner-gated und sind in diesem Auftrag verboten.

Stoppe nach abgeschlossenem S4R. Liefere dort das vertraglich geforderte
Owner-Briefing mit Scope-Freeze, S4-Ausführungsblöcken, Reasoning,
Invalidation Map, Test-/Evidence-Plan, exakter Cutover- und
Rollbackreihenfolge sowie allen noch benötigten Freigaben. Beginne S4 nicht.

Merke zugleich den Fortsetzungsvertrag für diesen Chat: Erteilt der Owner auf
Basis des S4R-Briefings ausdrücklich GO, arbeite S4.1-S4.7 und danach
S5.1-S5.3 autonom, deterministisch und ohne weitere Substep-Rückfragen ab.
Nutze die in S4R bestätigten Ausführungsblöcke, führe nach jedem Block nur
invalidierte Checks und native Delta-Reviews aus und halte CodeRabbit bis
S5.2 bei null. Stoppe nach S5.3 vor S5.4 mit einem präzisen Produktivbriefing.
S5.4-S5.7 bleiben jeweils owner-gated. Nach den tatsächlich erteilten
Freigaben darfst du die freigegebenen Produktivgates der Reihe nach abarbeiten;
wenn alle verpflichtenden Gates und S5.8 grün sind, schließe S6 autonom ab.
Bei `CONDITIONAL GO`, `NO-GO`, neuem P0/P1, Contractbruch, Drift oder einer
nicht erteilten Produktivfreigabe stoppst du am betroffenen Gate.
```

## Session Resume Card

- Ziel:
  - R11-/R12-Read-Consumer sicher aktivieren und mit realen V1-Daten
    beweisen, ohne Activity-V2-Capture zu aktivieren.
- Unveränderliche Verträge:
  - MIDAS bleibt Single User.
  - Activity V1 bleibt alleiniger produktiver Capture-Pfad.
  - Doctor bleibt report-first; keine Satz-/Gewichtsdetails im Arztbericht.
  - Proteinformel, ACT-Schwellen und Trendpilot-Aussagen bleiben unverändert.
  - R10-Coaching-Export und Activity-V2-Produktoberfläche bleiben verborgen.
- Erledigter Stand:
  - R11 und R12 sind `DONE`.
  - SQL25 ist produktiv installiert.
  - isolierte R11-/R12-Consumer sind lokal bewiesen.
  - R13-Auth-/Keygrenze ist im separaten Masterplan eingefroren.
  - initialer R13-Contract Review ist `PASS`.
  - S1 ist `PASS`: HEAD, lokaler Produktcode und `origin/main` sind für alle
    R13-Runtimeinputs identisch; SQL25, R11/R12-Fingerprints, Edge-Bundles,
    Workflows, GitHub Pages und Toolchain sind read-only belegt.
  - S2 ist `PASS`: Productload/API-Seams, drei SQL-Funktionen, Principal-
    Matrix, Range-/Fehlerverträge, Protein-v1.3-/Cooldownregel, Trend-
    Envelope und sichere Dry-run-Grenze sind exakt eingefroren.
  - S3 ist `PASS`: alle Security-, SQL-, Consumer-, Medical-, Runtime- und
    Rollbackrisiken sind geschlossen oder einem exakten S4-/S5-Orakel
    zugeordnet; Cutover und Reverse-Reihenfolge sind ausführbar.
  - S4R ist `PASS`: Scope und Dateigruppen sind eingefroren, vier sequenzielle
    Blöcke sind ausführbar, Invalidation/Test/Evidence und alle späteren
    Produktivgates sind exakt zugeordnet. S4 wurde nicht begonnen.
  - Der Owner hat am `2026-08-23` nach dem S4R-Briefing bewusst einen klaren
    Session-Cut wegen des verbleibenden Nutzungskontingents gesetzt. Es wurde
    kein S4-GO erteilt und keine Implementierung begonnen.
- Aktueller Schritt:
  - `PAUSED - Owner-Cut nach S4R; S4 unbegonnen, kein GO erteilt`
- Nächster erlaubter Schritt:
  - sobald der Owner die Arbeit wieder aufnimmt: kurzer read-only Drift-Check
    von Git-HEAD/Worktree, relevanten Remote-Fingerprints und laufenden
    Workflows; keine Wiederholung von S1-S4R bei unverändertem Postimage
  - danach nach ausdrücklichem `GO`: `S4.1-S4.7 und S5.1-S5.3 autonom,
    deterministisch und ohne weitere Substep-Rückfragen`; danach STOP vor S5.4
- Offene Findings:
  - `F-ACT-R13-13`: parallele R1-/C2-Archivmoves erhalten und in
    S1 korrekt vom R13-Diff abgrenzen; zwei dadurch gebrochene Altlinks sind
    als separate P2-Doku-Watchlist sichtbar und nicht Teil des R13-Codediffs.
  - keine offene unzugeordnete P0/P1; F15-F21 sind konkreten S4-/S5-
    Artefakten und Tests zugeordnet.
- Geänderte Dateien:
  - dieser Discovery-Auftrag: nur diese Roadmap und R13 Evidence
  - vorbestehender Owner-/Planungsdiff: Activity-/Auth-Masterplan und
    Archivverschiebungen; unverändert bewahrt und nicht R13 zugerechnet
- Gültige Nachweise:
  - `HCR-029 (R11), HCR-030 (R12), archivierte R11-/R12-Evidence`
- Context Receipt:
  - S1-S4R vollständig; Baseline, Dirty Boundary, Fingerprints,
    Remote-Runtime, Zielvertrag, Red-Team, Scope, Blöcke, Invalidation,
    Cutover/Rollback und Owner-Gates sind belegt
  - Session-Cut am `2026-08-23` sauber protokolliert; keine lokale oder
    produktive R13-Implementierung nach S4R
- Autonomieprofil / aktuelle Welle:
  - `gated waves; aktuell S1-S4R; nach Owner-GO S4-S5.3; S6 erst nach den
    einschlägigen produktiven Owner-Gates`
- Runtime-/Deploy-Stand:
  - R13 nicht deployed; SQL25 produktiv unverändert; R11-/R12-Consumer
    unreferenziert; drei betroffene Edge Functions und beide Scheduler laufen
    noch auf dem V1-/Legacy-Auth-Postimage; GitHub Pages liefert HEAD aus
- Offene Owner-Freigaben:
  - jetzt ausschließlich das lokale Wellen-GO S4-S5.3
  - später getrennt S5.4 Keys/Secrets, S5.5 SQL26, S5.6 Edge-Deploys und
    S5.7 Runtime-/Workflow-/Web-Cutover samt jeweils exaktem Rollback
- Stop-Bedingungen:
  - keine S4-Umsetzung vor grünem S4R und explizitem Owner-GO
  - keine S5.4-S5.7-Produktivaktion ohne die jeweils einschlägige Freigabe

## Context Receipt

- Baseline-Commit bei Roadmap-Erstellung:
  - `21ce8e5910ae9ba662503afef0059b31f03704bf`
- Relevante Dirty Files bei Roadmap-Erstellung:
  - `docs/Future trainingsmodule update thoughts.md`
  - `docs/MIDAS Supabase API Key and Edge Authentication Modernization Masterplan.md`
  - parallel vorgefundene, inhaltlich bytegleiche Owner-Archivverschiebungen:
    `docs/MIDAS Activity V2 R1 Catalog Baseline Contract.md` nach
    `docs/archive/MIDAS Activity V2 R1 Catalog Baseline Contract (DONE).md`
    sowie `docs/MIDAS Activity V2 C2 Catalog Version 2 Contract.md`
    nach
    `docs/archive/MIDAS Activity V2 C2 Catalog Version 2 Contract (DONE).md`;
    nicht R13 zuschreiben und nicht zurücksetzen
- Reale Git-Baseline in S1:
  - `HEAD = origin/main = remote main =`
    `21ce8e5910ae9ba662503afef0059b31f03704bf`; Branch `main`
  - kein Produktcode-Diff; tracked sind nur der Activity-Masterplan und die
    zwei bytegleichen Archivquell-Löschseiten, untracked die zugehörigen
    Archivziele sowie R13-Roadmap, R13-Evidence und Auth-Masterplan
  - R1-Blob alt/neu `4547581587a108dd4ac1719a59d6ae7b2d8ad6f2`,
    C2-Blob alt/neu `10e6fd7e9963e3013ddc661fedae6fcaca200c7e`
- Gelesene Sources of Truth:
  - Rootvertrag, Roadmap-Workflow, R11/R12-DONE-Quellen, Activity-/Doctor-/
    Reports-/Protein-/Trendpilot-/Supabase-Overviews, SQL25, isolierte
    Consumer, Edge-Handler und Workflows
  - aktuelle offizielle Supabase-Dokumentation zu API Keys, Edge-
    Authheadern und `@supabase/server` am 2026-08-23
- Gültige Evidence-/Test-IDs:
  - R11-Evidence/HCR-029 mit unveränderten SQL25-/Consumer-/Report-/Health-
    Fingerprints; produktive SQL25-Definition weiterhin
    `f7226f6a81e2057cd4ea345fc5d2c099b1ad88f54d8066d9b7f1759f191b3c3d`
  - R12 pure Testmatrix 15/15 und HCR-030 mit unveränderten Shared-/Protein-/
    Trendpilot-Adapterfingerprints; die spätere R13-Runtimeverdrahtung
    invalidiert nur den bisherigen Isolationsnachweis
- Invalidation-Bedingungen:
  - Änderung SQL25/Consumer-Schema -> R11-SQL-/Consumer-Nachweise
  - Änderung R12-Adapter/medizinische Projektion -> HCR-030
  - Productload/Doctor/Health -> Browser-, Cache- und V1-Parität
  - Edge/Auth/Workflow -> Auth-, Scheduler-, Deploy- und Rollbacknachweise
- Tool-/Runtime-Status:
  - Git 2.55.0, Node 24.18.0, npm 11.18.0, rg 15.2.0, Deno 2.9.5,
    Supabase CLI 2.109.1, Docker 29.7.2, gh 2.96.0, Python 3.14.6,
    Playwright 1.61.1 und CodeRabbit 0.7.5 verfügbar; Browser-Plugin verfügbar
  - PostgreSQL produktiv 17.6/UTC; `@supabase/server` stabil aktuell 1.4.1;
    keine Installation, kein CodeRabbit-Lauf und keine Remoteaktion erfolgt

## Zielvertrag

R13 ist abgeschlossen, wenn alle folgenden Aussagen gleichzeitig bewiesen
sind:

1. Doctor View verwendet den gemeinsamen R11-Activity-Snapshot. V1-Einträge
   bleiben löschbar wie bisher; V2-Sessions sind read-only.
2. Der sichtbare Health-Export ist `midas.health-export.v3` und
   bleibt strikt, privat und all-or-error. Der R10-Coaching-Export bleibt
   getrennt und verborgen.
3. Neu erzeugte Arztberichte verwenden die kompakte R11-
   Activity-Zusammenfassung. Bereits gespeicherte Berichte bleiben
   unveränderte Snapshots.
4. Protein Target verwendet eindeutige Aktivtage aus dem gemeinsamen
   Activity-Snapshot, behält Formel, CKD-Faktoren, Doctor-Lock,
   ACT1/ACT2/ACT3 und Modifier unverändert und schreibt eine neue
   Calc-Version.
5. Trendpilot verwendet pro Request genau einen ausreichenden Snapshot-
   Umschlag, zählt eindeutige Aktivtage, führt `active_days_4w` und
   `weeks_with_entries_4w` ein und liest alte
   `sessions_4w`-Historie weiterhin.
6. Angemeldete Benutzeraufrufe nutzen ein echtes Supabase-Auth-JWT.
   Protein- und Trendpilot-Scheduler nutzen ausschließlich je einen
   getrennten benannten Secret Key im `apikey`-Header.
7. Der privilegierte Schedulerpfad ist fest an Stephans serverseitig
   konfigurierten Owner gebunden. Kein Requestbody darf den Owner wählen.
8. SQL25 behält seinen öffentlichen authenticated-only Vertrag. Ein
   zusätzlicher service-only Provider verwendet dieselbe kanonische
   V1-/V2-Projektion und keine zweite Union.
9. Activity V1 bleibt der einzige produktive Capture-Pfad. Activity-V2-
   Navigation, Commit, History und Coaching-Download bleiben unsichtbar.
10. Browser, Edge Functions, Workflows, Cache und Rollback sind produktiv
    bewiesen. Ohne produktiven Post-Smoke darf R13 nicht auf `DONE`.

### Abnahmeszenarien

- V1-only:
  - alle fünf Consumer zeigen beziehungsweise verwenden dieselbe fachliche
    Aktivitätsbedeutung wie vor R13; keine Doppelzählung.
- Empty V2:
  - aktueller produktiver Zustand bleibt gültig und erzeugt keine falschen
    Null-, Loading- oder Fehlerzustände.
- Mixed Fixture:
  - V1 und V2 desselben Wiener Tages ergeben einen Aktivtag, behalten aber
    beide Einheiten im erlaubten Drilldown.
- Fehler:
  - Auth-, Snapshot-, Contract- oder Rangefehler schreiben keinen
    Teilzustand und lassen den letzten gültigen Produktzustand erhalten.
- Rollback:
  - jeder Reader kann ohne Datenmigration auf seinen vorher bewiesenen
    Vertrag zurückgestellt werden.

### Bewusst unverändert

- Activity-V2-Capture und Produktnavigation
- R10-Coaching-Exportaktivierung
- Proteinformel, Zielbereiche, CKD-Faktoren und Doctor-Lock
- Trendpilot-Gates, Severity, ACK und sichtbare medizinische Aussagen
- Doctor-View-Informationshierarchie und 60-90-Sekunden-Ziel
- bestehende Arztbericht-Snapshots und Health Export V2 als historischer
  Schema-Vertrag
- globale Migration von PWA, Android, Incident Push und weiteren Edge
  Functions auf neue API Keys
- Legacy-Key-Deaktivierung oder -Löschung

## Problem und Ist-Zustand

- R11 hat den gemeinsamen Read-Unterbau, SQL25, Doctor-Drilldown,
  Range-Report-Copy und Health Export V3 isoliert vorbereitet.
- R12 hat pure Protein- und Trendpilot-Projektionen isoliert vorbereitet.
- Diese Module sind noch nicht in Produktentrypoints oder Edge-Handler
  eingebunden.
- Protein Target und Trendpilot lesen Aktivität weiterhin direkt aus V1 und
  ihre Scheduler senden den gemeinsamen Legacy-Service-Role-Key als Bearer.
- SQL25 ist absichtlich authenticated-only und kann von einem Secret-Key-
  Scheduler nicht als angeblicher User aufgerufen werden.
- Eine unkoordinierte Aktivierung könnte Scheduler kurzzeitig brechen,
  V1/V2 doppelt zählen, alte Reports verändern oder das PWA-Cachepostimage
  inkonsistent machen.

## Entscheidungslog

<!-- markdownlint-disable MD013 -->

| ID | Datum | Entscheidung | Warum | Betrifft |
| --- | --- | --- | --- | --- |
| D-ACT-R13-01 | 2026-08-23 | R13 aktiviert nur Read-Consumer; R14 bleibt alleiniger Capture-Cutover. | Consumerfehler bleiben unabhängig vom neuen Writer rückrollbar. | Gesamt |
| D-ACT-R13-02 | 2026-08-23 | Doctor, Report, Health, Protein und Trendpilot teilen die R11-Snapshotsemantik. | Keine divergierenden Aktivtage oder zweite V1-/V2-Union. | S2, S4 |
| D-ACT-R13-03 | 2026-08-23 | SQL25 bleibt authenticated-only; ein service-only Wrapper erhält denselben kanonischen Projektionskern. | User-RLS bleibt erhalten, Scheduler erhält einen expliziten privilegierten Pfad. | S4.2 |
| D-ACT-R13-04 | 2026-08-23 | Duale Protein-/Trendpilot-Auth verwendet `@supabase/server` mit `user` und je einem spezifisch benannten `secret:<name>`-Modus; `verify_jwt=false` wird nur zusammen damit eingesetzt. | Offizieller Supabase-Vertrag; neue API Keys sind keine JWTs. | S4.1, S4.5, S4.6 |
| D-ACT-R13-05 | 2026-08-23 | Supabase-Keynamen: `protein-targets-scheduler` und `trendpilot-scheduler`; GitHub-Secrets: `PROTEIN_TARGETS_SECRET_KEY` und `TRENDPILOT_SECRET_KEY`. | Getrennte Rotation und eindeutige Calleridentität. | S5 |
| D-ACT-R13-06 | 2026-08-23 | Scheduler senden Secret Keys ausschließlich über `apikey`, nie als Bearer; Workflows nutzen harte HTTP-Fehlerprüfung. | Verhindert Invalid-JWT- und stille Schedulerfehler. | S4.7 |
| D-ACT-R13-07 | 2026-08-23 | Schedulerowner kommt ausschließlich aus serverseitiger Konfiguration; ein Body-`user_id` ist keine Autorität. | Secret Keys umgehen RLS und dürfen keinen frei wählbaren Owner erhalten. | S4.1, S4.2 |
| D-ACT-R13-08 | 2026-08-23 | Protein verwendet eine neue `v1.3-*`-Calc-Version. Cooldown darf nur skippen, wenn auch Aktivtage, Level und Versionsmetadaten unverändert sind. | Zielwert und gespeicherte Herleitung dürfen nicht auseinanderlaufen. | S4.5 |
| D-ACT-R13-09 | 2026-08-23 | Trendpilot-Input umfasst höchstens 373 inklusive Tage; mit 27 Vortagen bleibt der Snapshot bei höchstens 400 Tagen. | SQL25-/R11-Maximum bleibt fail-closed. | S4.6 |
| D-ACT-R13-10 | 2026-08-23 | Bestehende Reports und alte Trendpilot-Payloads werden nicht migriert. | Historische Snapshots behalten ihre damalige Bedeutung. | S4.4, S4.6 |
| D-ACT-R13-11 | 2026-08-23 | S4 bleibt lokal; CodeRabbit läuft nur im integrierten S5. Produktive Aktionen folgen erst nach finalem Diffreview. | Vermeidet Review- und Deployspiralen. | Prozess |
| D-ACT-R13-12 | 2026-08-23 | R13 darf für den Web-/Workflow-Cutover einen expliziten owner-gateten Zwischen-Commit/Push benötigen; ohne realen Runtime-Smoke kein DONE. | GitHub-Workflows und statische Produktion können nicht aus einem rein lokalen Worktree aktiviert werden. | S5 |
| D-ACT-R13-13 | 2026-08-23 | Die globale Schlüsselmodernisierung bleibt im separaten Masterplan; R13 deaktiviert keine Legacy Keys. | Scope bleibt beherrschbar und andere Consumer brechen nicht. | Gesamt |
| D-ACT-R13-14 | 2026-08-23 | Die duale Authschicht pinnt `npm:@supabase/server@1.4.1` und ruft `createSupabaseContext` mit `['user', 'secret:<exakter-name>']` auf. | Aktuelle stabile Primärquelle ist geprüft; Arrayreihenfolge priorisiert echte User-JWTs, der zweite erlaubte Modus ist je Function eindeutig. | S4.1 |
| D-ACT-R13-15 | 2026-08-23 | SQL26 definiert exakt `midas_private.activity_consumer_snapshot_core(uuid,date,date)`, behält `public.activity_consumer_snapshot(date,date)` und ergänzt `public.activity_consumer_snapshot_for_owner(uuid,date,date)`. | Ein nicht exponierter Kern, ein unveränderter Uservertrag und ein eigener service-only Wrapper verhindern eine zweite Union. | S4.2 |
| D-ACT-R13-16 | 2026-08-23 | `midas_private` bleibt außerhalb der Data API. `service_role` erhält nur Schema-Usage und EXECUTE auf den neuen Snapshot-Kern; der bestehende R9-Helper bleibt weiterhin nur für `authenticated` ausführbar. | Der reale R9-ACL-Poststand wird minimal erweitert statt still gebrochen; Rollback stellt seine alte Schema-ACL exakt wieder her. | S4.2 |
| D-ACT-R13-17 | 2026-08-23 | Protein und Trendpilot akzeptieren exakte Body-Keysets ohne `user_id`; beide besitzen einen authentifizierten `dry_run` ohne Write. | Body-Owner ist fail-closed und die Named-Secret-Pfade können vor einem kontrollierten Produktwrite vollständig geprüft werden. | S4.1, S4.5, S4.6, S5 |
| D-ACT-R13-18 | 2026-08-23 | Der sichtbare Productload ist Consumer -> Data Access -> Doctor View -> Health V3 -> Reports -> Doctor; Health V2 bleibt nur historischer Builder, der Downloadpfad wechselt all-or-error auf V3. | Klassische Modulregistrierung ist vor Doctor verfügbar, während I/O weiter erst nach Unlock/Öffnen erfolgt. | S4.3 |
| D-ACT-R13-19 | 2026-08-23 | Protein speichert eindeutige Aktivtage weiter im vorhandenen Feld `protein_activity_score_28d`, setzt `protein_calc_version=v1.3-<source>` und darf nur bei identischer Version, 28-Tage-Fenster, Aktivtage, ACT-Level und bisheriger Herleitung cooldown-skippen. | Keine Schemaerweiterung; gespeichertes Ergebnis und Herkunft können nicht auseinanderlaufen. | S4.5 |
| D-ACT-R13-20 | 2026-08-23 | Neue Trendpilot-Payloads verwenden ausschließlich `active_days_4w` und `weeks_with_entries_4w`; vorhandene `sessions_4w`-Payloads bleiben lesbar und unverändert. | Der neue Zähler ist eindeutig, historische Snapshots behalten ihre Bedeutung. | S4.6 |
| D-ACT-R13-21 | 2026-08-23 | Beim bestehenden Trendpilot-Upsert bleibt ein erkanntes Legacy-`context.activity` mit `sessions_4w` vollständig erhalten; es entsteht weder Rewrite noch Hybrid. Erst neue beziehungsweise bereits neue Activity-Unterobjekte erhalten das R12-Keyset. | Der reale Mergepfad darf historische Snapshotsemantik nicht still umschreiben. | S4.6 |
| D-ACT-R13-22 | 2026-08-23 | Der produktive Git-Cutover verwendet zwei getrennt freizugebende, pfadselektive Commits/Pushes: zuerst Runtimequelle plus Workflows, danach ausschließlich Web-/PWA-Aktivierung. | Workflow-/Edge- und sichtbarer Webrollback bleiben unabhängig; fremde Archivmoves und Dirty Files werden nie mitgestaged. | S5.7 |
| D-ACT-R13-23 | 2026-08-23 | Die R11-View-CSS wird minimal und Doctor-scoped in `app/app.css` übernommen; Harness-CSS wird nicht als Produktstylesheet geladen. | Die isolierte View besitzt sonst keine Produktstyles; Doctor-Hierarchie und globales Design bleiben geschützt. | S4.3 |
| D-ACT-R13-24 | 2026-08-23 | Der Owner setzt nach bestandenem S4R einen klaren Session-Cut wegen des verbleibenden Nutzungskontingents. S4 bleibt unbegonnen; beim nächsten Einstieg genügt vor der unveränderten GO-Entscheidung ein kurzer read-only Drift-Check. | Der vollständig synchronisierte S4R-Stand ist die sichere Wiederaufnahmekante; ein begonnenes Ausführungsblockfragment wird vermieden. | Prozess |

<!-- markdownlint-enable MD013 -->

## Owner-Briefing-Bedarf

- Erklärmodus:
  - `Briefing + S6-Recap`
- Neue oder entscheidungsrelevante Konzepte:
  - Unterschied User-JWT / Publishable Key / Secret Key
  - `verify_jwt` versus In-Function-Auth
  - RLS-bewusster Userpfad versus service-only Ownerprovider
  - koordinierter SQL-/Edge-/Workflow-/Web-Cutover
- Geplante Briefing-Gates:
  - S4R vor jeder Implementierung
  - S5 vor Schlüsselanlage und GitHub-Secrets
  - S5 vor SQL26
  - S5 vor jedem Edge-/Workflow-/Web-Cutover
- Nicht erneut zu erklären:
  - normale JS-/TS-Integration, CSS oder Standardtests

## Scope und Grenzen

### In Scope

- Produktverdrahtung der R11-Doctor-/Health-Consumer
- Aktivierung der R11-Range-Report-Projektion
- Aktivierung der R12-Protein-/Trendpilot-Projektionen
- ein gemeinsamer Edge-Auth-Vertrag für die zwei real dual aufgerufenen
  Functions, ohne Plattformabstraktion
- SQL26 mit kanonischem Projektionskern, SQL25-Wrapper und service-only
  Ownerprovider samt Rollback, Fixture und SQL16-Sync
- getrennte moderne Secret Keys und GitHub-Secrets für zwei Scheduler
- Workflow-Härtung, Cache-/Scriptload und produktive Smokes

### Nicht in Scope

- Activity-V2-Capture, Navigation, Commit, History oder Coaching-Download
- neue Fitnessmetriken oder medizinische Empfehlungen
- Änderung des Doctor-Designs über nötige Consumerverdrahtung hinaus
- Migration alter Arztberichte, Exporte oder Trendpilot-Events
- Incident Push, PWA-/Android-Publishable-Key, Vision, Assistant,
  Transcribe, TTS oder sonstige globale Schlüsselmodernisierung
- Deaktivierung/Löschung von Legacy Keys
- Retention, Prepared Session Import oder MCP

### Roadmap-spezifische Guardrails

- Secretwerte erscheinen nie in Chat, Git, Doku, Evidence, Logs oder
  Screenshots.
- Kein Secret-Key wird als Bearer gesendet oder akzeptiert.
- `verify_jwt=false` ohne nachgewiesene In-Function-Auth ist P0 und
  Stop.
- Ein Secretpfad darf den Owner nicht aus untrusted Input übernehmen.
- Kein Consumer baut eine eigene V1-/V2-Union.
- Kein Teilwrite bei Auth-, Snapshot-, Contract- oder Rangefehler.
- Reale V2-Produktdaten werden weder erzeugt noch vorausgesetzt.
- Keine fremden Dirty-Worktree-Änderungen zurücksetzen.

## Scope-Freeze vor S4

- Bestehende Features:
  - Read-Consumer werden aktiviert; Capture und R10-Download bleiben
    unverändert verborgen.
- Datenmodell, Lifecycle und Retention:
  - keine fachliche Datenmigration; nur additive/refaktorierende
    Read-Functions und bestehende Consumerwrites.
- Cleanup, Scheduler, Secrets und externe Automationen:
  - genau zwei Scheduler und zwei neue benannte Keys; kein globales Cleanup.
- Kompatible Producer und Consumer:
  - R11 `midas.activity-consumer.v1`
  - R11 Range-Report-/Health-V3-Projektion
  - R12 `midas.activity-medical-context.v1`
  - bestehende V1-Capture-, Profile-, Trendpilot- und Reporttabellen
- Offene Grundsatzfragen:
  - `none`; S1-S4R verifizieren nur reale Implementierungs- und
    Runtimefakten.
- Umgang mit späterem Scope-Wechsel:
  - blockierende Abweichung in S2/S3/S4R korrigieren; sonst Follow-up statt
    stiller Erweiterung.

## Referenzen

### Pflicht in S1

- `AGENTS.md`
- `README.md`
- `docs/DEV_ENVIRONMENT.md`
- `docs/templates/MIDAS Roadmap Workflow Contract.md`
- `docs/Future trainingsmodule update thoughts.md`, R11-R14
- `docs/MIDAS Supabase API Key and Edge Authentication Modernization Masterplan.md`, insbesondere R13-Vertrag
- `docs/modules/Activity Module Overview.md`
- `docs/modules/Doctor View Module Overview.md`
- `docs/modules/Reports Module Overview.md`
- `docs/modules/Protein Module Overview.md`
- `docs/modules/Trendpilot Module Overview.md`
- `docs/modules/Supabase Core Overview.md`
- archivierte R11-/R12-Roadmaps und R11-Evidence, nur die vertraglich
  relevanten Abschnitte
- `docs/qa/health-capture-reports.md`, HCR-029 und HCR-030

### Technische Producer/Consumer

- `sql/25_Activity_Consumer_Compatibility.sql` und Rollback/Fixture
- `app/modules/vitals-stack/activity/v2/activity-consumer*.js`
- `app/modules/doctor-stack/doctor/activity-consumer-view.js`
- `app/modules/doctor-stack/doctor/health-export-v3.js`
- `backend/supabase/functions/midas-monthly-report/activity-*.ts`
- `backend/supabase/functions/_shared/activity-medical-context.ts`
- `backend/supabase/functions/midas-protein-targets/activity-compatibility.ts`
- `backend/supabase/functions/midas-trendpilot/activity-compatibility.ts`
- drei produktive Edge-Handler und zwei Schedulerworkflows
- `index.html` und `service-worker.js`

### Aktuelle Primärquellen

- [Supabase: Authorization headers](https://supabase.com/docs/guides/functions/auth-headers)
- [Supabase: Securing Edge Functions](https://supabase.com/docs/guides/functions/auth)
- [Supabase: Migrating to publishable and secret API keys](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys)

## Tool Permissions und Gates

### Allowed

- Git, `rg`, Node, Deno und lokale statische Tests
- Browser-/Playwright-Harness und Live Server
- Docker/PostgreSQL-17-Fixtures
- Supabase CLI/MCP für read-only Inventar
- `gh` für read-only Workflow-/Secretnameinventar
- CodeRabbit ausschließlich in S5 über `coderabbit`

### User-gated

- Schlüssel im Supabase Dashboard erstellen oder rotieren
- GitHub-Secrets setzen
- produktives SQL/ACL und Rollback
- `verify_jwt` ändern und Edge Functions deployen
- Workflow committen/pushen, manuell ausführen oder zurückrollen
- Web/PWA deployen, committen oder pushen
- produktive Profile-, Trendpilot- oder Report-Smokes mit Schreibwirkung

### Forbidden

- Secrets, vollständige JWTs oder sensible Payloads ausgeben/committen.
- produktive Ownerdaten für Fixtures verändern.
- Activity-V2-Sessions als Testdaten produktiv erzeugen.
- Legacy Keys deaktivieren/löschen.
- CodeRabbit außerhalb S5 starten oder neu installieren.
- fremde Worktree-Änderungen zurücksetzen.

## Statusmatrix

<!-- markdownlint-disable MD013 -->

| ID | Schritt | Reasoning | Status | Kompaktes Ergebnis |
| --- | --- | --- | --- | --- |
| S1 | System- und Vertragsdetektivarbeit | High | PASS | realer Git-/Code-/SQL-/Edge-/Workflow-/Web-/Toolchain-Iststand; Full Review und Continuation Gate PASS |
| S2 | Fachlicher/technischer Zielvertrag | Extra High | PASS | Productload/API, Auth/Owner, SQL26-Signaturen/ACL, Errors, Ranges, Medical/Legacy und Cache eingefroren; Full Review PASS |
| S3 | Bruchrisiko-, Security- und Cutoverreview | Extra High | PASS | 22 P0/P1-Risiken geschlossen/zugeordnet; Test-, Cutover- und Reversevertrag PASS |
| S4R | S4 Readiness Review | Extra High | PASS | Scope-Freeze; Blöcke A-D; Dateiownership, Invalidation, Evidence und Owner-Gates ausführbar; S4 nicht begonnen |
| S4.1 | Shared Edge Auth und Principal Contract | Extra High | TODO | |
| S4.2 | SQL26 kanonischer Snapshotprovider | Extra High | TODO | |
| S4.3 | Doctor View und Health Export V3 | High | TODO | |
| S4.4 | Range-Arztbericht | High | TODO | |
| S4.5 | Protein Target | Extra High | TODO | |
| S4.6 | Trendpilot | Extra High | TODO | |
| S4.7 | Workflows, Productload, Cache und Cutoverartefakte | High | TODO | |
| S5 | Integrierte Tests, Review und produktiver Cutover | Extra High | TODO | |
| S6 | Doku-Sync, Recap und Archiv | High | TODO | |

<!-- markdownlint-enable MD013 -->

## Initialer Contract Review und Findings

<!-- markdownlint-disable MD013 -->

| ID | Severity | Typ | Status | Entscheidung / Zielschritt |
| --- | --- | --- | --- | --- |
| F-ACT-R13-01 | P0 | Security | fixed | `verify_jwt=false` nur mit `@supabase/server`-User-/spezifischem Secretmodus; S4.1/S5 |
| F-ACT-R13-02 | P0 | Security | fixed | Secretowner ausschließlich serverseitig; kein Body-Owner; S4.1/S4.2 |
| F-ACT-R13-03 | P1 | SQL/Contract | fixed | ein kanonischer Projektionskern, SQL25-Userwrapper und service-only Wrapper; S4.2 |
| F-ACT-R13-04 | P1 | Data | fixed | Trendpilot-Input maximal 373 Tage plus 27 = 400; S4.6 |
| F-ACT-R13-05 | P1 | Medical/State | fixed | neue Protein-Version und Cooldown berücksichtigt auch Activity-Metadaten; S4.5 |
| F-ACT-R13-06 | P1 | Runtime | fixed | Cutover als koordinierte S5-Welle mit Zwischenzustands- und Rollbackchecks; S5 |
| F-ACT-R13-07 | P1 | Cache | fixed | Productload, Scriptreihenfolge, SW-Version und Fresh-/Upgrade-Smoke gemeinsam; S4.3/S5 |
| F-ACT-R13-08 | P1 | Workflow | fixed | getrennte Keys, nur `apikey`, harte HTTP-Fehlerprüfung; S4.7/S5 |
| F-ACT-R13-09 | P1 | Backcompat | fixed | alte Reports/Trendpilot-Payloads bleiben unverändert lesbar; S4.4/S4.6 |
| F-ACT-R13-10 | P1 | Scope | fixed | R14-Capture und globale Schlüsselmodernisierung explizit ausgeschlossen |
| F-ACT-R13-11 | P2 | Doku | fixed | widersprüchliche offene Secret-Key-Frage im Auth-Masterplan entfernt |
| F-ACT-R13-12 | Watchlist | Operations | fixed | S1 belegt GitHub Pages `legacy` aus `main:/`, HTTPS, aktuellen HEAD-Build und reversiblen Revert-/Pushweg; S4R trennt Workflow- und Web-Cutover |
| F-ACT-R13-13 | Watchlist | Worktree | bounded | parallele bytegleiche R1-/C2-Archivmoves erhalten; zwei daraus folgende aktive Altlinks als fremde P2-Doku-Watchlist sichtbar, nicht R13 zuschreiben |
| F-ACT-R13-14 | P1 | Execution | fixed | Ausführung in drei klar begrenzte autonome Wellen geteilt: S1-S4R, nach GO S4-S5.3, danach nur freigegebene Produktivgates plus S6 |
| F-ACT-R13-15 | P1 | Runtime/Deploy | fixed in target | lokales `config.toml` besitzt noch keine Function-Blöcke; S4.7 muss `verify_jwt=false` ausschließlich für Protein/Trendpilot deklarativ festschreiben und Monthly/default true schützen |
| F-ACT-R13-16 | P1 | SQL/ACL | fixed in target | realer `midas_private`-R9-Poststand ist authenticated-only; SQL26/SQL16 erweitern nur Schema-Usage plus neuen Core für service_role, schützen den alten Helper und restaurieren die Preimage-ACL im Rollback |
| F-ACT-R13-17 | P1 | Supply/Auth | fixed in target | unversionierter `@supabase/server`-Import wäre driftanfällig; S4.1 pinnt die geprüfte stabile Version 1.4.1 und testet exakt beide kombinierten Modi |
| F-ACT-R13-18 | P1 | Production safety | fixed in target | Protein besitzt noch keinen no-write Secret-Smoke; S4.5 ergänzt strikt authentifiziertes `dry_run`, Trendpilot behält seinen vorhandenen no-write Pfad |
| F-ACT-R13-19 | P1 | Backcompat/Data | fixed in target | realer Trend-Upsert überschreibt top-level `context`; S4.6 konserviert Legacy-Activity-Unterobjekte ohne Hybrid und testet vorhandene `sessions_4w`-Rows |
| F-ACT-R13-20 | P1 | UI/Consumer | fixed in target | isolierte Activity-View-Styles fehlen in `app/app.css`; S4.3 ergänzt nur die erforderlichen Doctor-scoped Regeln und prüft 1280/390/320 ohne Overflow |
| F-ACT-R13-21 | P1 | Cutover/Rollback | fixed in target | ein gemeinsamer Workflow-/Web-Commit koppelt Rollbacks; S5.7 verwendet pfadselektiv Runtime/Workflow zuerst und Web/PWA separat, fremder Dirty Diff bleibt ausgeschlossen |

<!-- markdownlint-enable MD013 -->

Reviewurteil:

- Produktvertrag: `PASS`
- Security-/Authvertrag: `PASS`
- Scope und R14-Abgrenzung: `PASS`
- Ausführbarkeit: `PASS mit owner-gateten S5-Aktionen`
- offene unzugeordnete P0/P1: `none`

---

## S1 - System- und Vertragsdetektivarbeit

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. Pflichtreferenzen und nur relevante R11-/R12-Abschnitte lesen.
2. Baseline-Commit, Dirty Files und realen Diff erfassen.
3. Productload und Scriptreihenfolge für Doctor/Health/Activity kartieren.
4. die drei Edge-Handler samt Auth, Datenzugriff, Writes, Fehlern,
   Deploymodus und Version inventarisieren.
5. SQL25-Definition, Hash, Owner, ACL, RLS, Grants und produktive
   V1-/V2-Zähler read-only verifizieren.
6. alle R11-/R12-Adapter, Tests, HCR-029/HCR-030 und ihre Invalidation
   kartieren.
7. Workflows, Trigger, Secrets ausschließlich als Namen, Header, Schedules,
   laufende Runs und Fehlerverhalten erfassen.
8. Supabase-API-Key-/Edge-Auth-Dokumentation auf Aktualität prüfen.
9. aktuellen Web-/PWA-Hosting-, Commit-, Push-, Cache- und Rollbackweg
   belegen.
10. Tools nur auf Verfügbarkeit prüfen; nichts installieren.
11. Context Receipt und Evidence-Baseline anlegen.
12. Full Contract Review, Findings-Korrektur und Status-Sync.

Ergebnis:

- Systemkarte:
  - Browserreader, User-Edge-Reader, duale Scheduler, SQLwrapper,
    Produktwrites und Deploymentgrenzen.
- Betroffene Schichten:
  - statische PWA, drei Edge Functions, zwei Workflows, SQL/ACL und Doku.
- Belegte Verträge:
  - R11/R12-Evidence nur wiederverwenden, wenn Fingerprints unverändert.
- Offene Fragen:
  - nur reale Iststandsabweichungen; keine neue Produktentscheidung erwartet.

Exit:

- Kein Producer, Consumer, Keyname, Runtimeobjekt oder Deployweg ist nur aus
  Erinnerung bekannt.
- Bei PASS automatisch S2.

### S1-Abschluss und Continuation Gate

- Systemkarte:
  - Browser: Productload enthält nur den V1-Activity-Writer/Reader; R11-
    Consumer, Doctor-View und Health-V3 liegen im Repo, sind aber nicht
    referenziert. `service-worker.js` nutzt `v6`, Navigation network-first und
    statische Assets cache-first.
  - User-Edge: Monthly Report akzeptiert nur User-Bearer, liest Activity noch
    direkt aus V1 und schreibt build-before-write genau einen Range Report.
  - Duale Edge-Consumer: Protein und Trendpilot akzeptieren aktuell User-JWT
    oder den gemeinsamen Legacy-Service-Role-Bearer, lesen Activity direkt aus
    V1 und schreiben Profil beziehungsweise Trendpilot-State/-Events.
  - Scheduler: Freitag beziehungsweise Dienstag `01:00 UTC`, zusätzlich
    `workflow_dispatch`; beide senden den gemeinsamen Legacy-Key als Bearer
    und `curl -sS` ohne harte HTTP-Fehlerprüfung. Es läuft kein Run.
  - SQL: genau eine SQL25-Signatur, Owner `postgres`, `STABLE SECURITY
    INVOKER`, leerer Search Path, EXECUTE nur `authenticated`; V1-/V2-
    Basisrelationen sind Owner-/RLS-konform.
- Reale Runtime:
  - Monthly Report `ACTIVE` Version 50, Protein Version 18, Trendpilot Version
    21; alle `verify_jwt=true`; Remotequellen entsprechen den lokalen
    produktiven Handlern. R11/R12-Zusatzmodule sind nicht deployed.
  - GitHub Pages ist `legacy`, Quelle `main:/`, letzter Build ist der
    Baseline-HEAD; produktives `index.html` lädt keine R11-Consumer und der
    produktive Service Worker ist `v6`.
  - GitHub-Secretnamen enthalten nur die Legacy-Schedulergrenze; die zwei
    neuen Zielnamen fehlen. Supabase-Secretwerte und Keyinhalte wurden weder
    gelesen noch ausgegeben.
- Full Contract Review:
  - Produkt-, Security-, Single-User-, R14-, Daten- und Scopevertrag `PASS`.
  - R11-/R12-Fingerprints und produktive SQL-/Datenpostimages sind
    unverändert; keine unerwartete Drift.
  - berechtigte Findings: F12 geschlossen, F13 sichtbar abgegrenzt, F15 dem
    deklarativen S4.7-Deployartefakt zugeordnet.
- Internal Continuation Gate:
  - `PASS`; keine offene unzugeordnete P0/P1, kein produktiver Write und keine
    fehlende S1-Faktengrundlage. S2 darf automatisch beginnen.

## S2 - Fachlicher und technischer Zielvertrag

Reasoning: `GPT-5.6 Sol / Extra High`.

Deterministisch:

1. R13-Zielvertrag gegen Root-, Modul-, R11-, R12- und Auth-Masterplan
   prüfen.
2. exakte Productload- und öffentliche API-Seams für Doctor/Health
   festlegen.
3. neuen Report-Activity-Untervertrag und Legacy-Snapshotgrenze bestätigen.
4. gemeinsamen SQL-Projektionskern, SQL25-Userwrapper und service-only
   Ownerwrapper einschließlich Signaturen, Rollen und Errorcodes einfrieren.
5. User- und Schedulerprincipal für Protein/Trendpilot samt
   `@supabase/server`-Authmodi, Ownerquelle, Headern und stabilen
   Fehlerantworten einfrieren.
6. Protein-Calc-Version, Cooldown-/Metadatenregel und Build-before-write
   festlegen.
7. Trendpilot-Snapshot-Umschlag, 373-/400-Tage-Grenze,
   `active_days_4w`, `weeks_with_entries_4w` und
   Legacy-Lesbarkeit festlegen.
8. exakte Workflow-Keynamen und Übergangszustände festlegen.
9. Fehler-, Stale-, Retry-, Race-, Cache- und all-or-error-Vertrag
   finalisieren.
10. S4-Dateigrenzen und Nicht-Scope finalisieren.
11. Full Contract Review, Findings-Korrektur und Status-Sync.

Exit:

- Keine Grundsatzfrage bleibt offen.
- Jeder Consumer besitzt genau eine Source of Truth und einen Rollbackpfad.
- Bei PASS automatisch S3.

### S2-Abschluss und eingefrorener Zielvertrag

#### Productload und Browser-/Doctor-Seams

1. `app/modules/vitals-stack/activity/v2/activity-consumer.js`
2. `app/modules/vitals-stack/activity/v2/activity-consumer-data-access.js`
3. `app/modules/doctor-stack/doctor/activity-consumer-view.js`
4. `app/modules/doctor-stack/doctor/health-export-v3.js`
5. bestehendes Reports-Modul
6. bestehender Doctor-Produktentrypoint

- Der bestehende V1-Capture-Load bleibt unverändert davor; kein R14-Modul wird
  geladen. Alle vier R11-Module registrieren nur APIs und starten beim Parsen
  kein I/O.
- Der Doctor-Entry besitzt genau einen `activityConsumerView`-Controller. Er
  setzt Range/Unlock/Open/Close/Logout auf den vorhandenen report-first-
  Lifecycle um. Geschlossene Einzelwerte lesen nichts; Rangewechsel und
  Logout invalidieren inflight Antworten.
- V1-Units behalten die bestehende tagbezogene Löschwirkung über
  `deleteRemoteByType(day, 'activity_event')`; V2-Units erhalten weder Button
  noch Deletecallback.
- `buildHealthExportV2` bleibt als historischer öffentlicher Builder erhalten.
  Der sichtbare `exportDoctorJson`-Pfad lädt V2-Basis und genau denselben
  Activity-Snapshot parallel über `healthExportV3.createLoader`, validiert V3
  vollständig und erzeugt bei irgendeinem Fehler keinen Download.
- Browser-Activity nutzt ausschließlich
  `AppModules.activityV2.consumerDataAccess.loadSnapshot`; kein Productcode
  baut eine zweite V1-/V2-Union.

#### SQL26-Funktionen und ACL

<!-- markdownlint-disable MD013 -->

| Objekt | Signatur / Modus | Owner / ACL | Vertrag |
| --- | --- | --- | --- |
| kanonischer Kern | `midas_private.activity_consumer_snapshot_core(p_owner uuid, p_from date, p_to date) returns jsonb`; `STABLE SECURITY INVOKER`; leerer Search Path | postgres; EXECUTE nur authenticated+service_role; Schema-Usage für beide | enthält als einzige Stelle die SQL25-V1-/V2-Union und alle R11-Validierungen/Caps |
| Userwrapper | `public.activity_consumer_snapshot(p_from date, p_to date) returns jsonb`; `STABLE SECURITY INVOKER`; leerer Search Path | postgres; EXECUTE nur authenticated | prüft `auth.uid()`, delegiert mit diesem Owner und bleibt in Keys, Semantik und stabilen SQL-Tokens extern SQL25-kompatibel |
| Schedulerwrapper | `public.activity_consumer_snapshot_for_owner(p_owner uuid, p_from date, p_to date) returns jsonb`; `STABLE SECURITY INVOKER`; leerer Search Path | postgres; EXECUTE nur service_role | delegiert expliziten serverseitigen Owner; kein anon/authenticated/PUBLIC-EXECUTE, kein eigener Unioncode |

<!-- markdownlint-enable MD013 -->

- Bestehende SQL-Tokens bleiben exakt:
  `MIDAS_ACTIVITY_CONSUMER_AUTH_REQUIRED`, `...INVALID_RANGE`,
  `...RANGE_TOO_LARGE`, `...LIMIT_EXCEEDED` und `...SOURCE_INVALID`.
- Kern und beide Wrapper liefern für denselben Owner/Range jsonb-gleiches
  `midas.activity-consumer.v1`; Same-day zählt zwei Units, aber einen aktiven
  Wiener Tag.
- SQL26-Rollback prüft das exakte Postimage, entfernt neuen Wrapper/Kern,
  stellt SQL25-Definition `f7226f6a...b3c3d` und die vorherige
  `midas_private`-ACL wieder her und verändert keine Fachdaten.
- SQL16 erkennt bedingt SQL25- oder SQL26-Postimage; der bestehende
  `midas_private.activity_v2_canonical_content(...)` bleibt für service_role
  nicht ausführbar. Katalog- plus Data-API-Negativtest beweisen die
  Nicht-Exposition des Schemas.

#### Principal-, Header- und Fehlervertrag

- Shared Contract: `midas.activity-edge-principal.v1`, implementiert nur für
  Protein und Trendpilot mit `npm:@supabase/server@1.4.1`.
- Authmodi:
  - Protein: `['user', 'secret:protein-targets-scheduler']`
  - Trendpilot: `['user', 'secret:trendpilot-scheduler']`
- Userprincipal: echtes JWT ausschließlich in `Authorization: Bearer`; Owner
  aus validierten Userclaims; RLS-Client und SQL25-Userwrapper.
- Schedulerprincipal: benannter Secret Key ausschließlich in `apikey`; Owner
  aus `PROTEIN_TARGETS_USER_ID` beziehungsweise `TRENDPILOT_USER_ID`;
  Adminclient und service-only Wrapper. Bodyowner ist nie erlaubt.
- Secret-as-Bearer, Legacy-Service-Role-Bearer, Publishable/anon, Public,
  falscher Named Key, Cross-Key, malformed oder fehlend werden vor jedem Read
  mit 401 und stabiler öffentlicher Meldung `Unauthorized` abgewiesen.
- Body-`user_id`/Extrakeys ergeben 400 `Invalid request`; fehlende
  serverseitige Ownerkonfiguration 500 `Server configuration unavailable`.
  Snapshot-/Contractfehler werden auf stabile `Invalid range`, `Activity
  snapshot unavailable` oder `Internal server error`-Antworten reduziert.
  Logs enthalten nur Operation, internen Code, HTTP-Status und Modus, niemals
  Credential, Owner-ID oder Rohfehler/Payload.
- `verify_jwt=false` gilt deklarativ nur für die zwei dualen Functions;
  Monthly Report und alle anderen Functions bleiben `true`.

#### Consumer-, Range-, Write- und Backcompatvertrag

- Doctor, Health und Monthly Report: 1 bis 400 inklusive Tage, kein
  Zukunftsende, ein Snapshot pro Operation.
- Protein: exakt 28 inklusive Tage (`to-27..to`); der R12-Adapter leitet
  ACT1/2/3 und Modifier nur aus eindeutigen Aktivtagen ab. Formel,
  CKD-Faktoren, Doctor-Lock und Zielrundung bleiben unverändert.
- Protein-Cooldown prüft zusätzlich exakt `v1.3-<source>`, Fenster 28,
  `protein_activity_score_28d`, `protein_activity_level` und alle bisherigen
  Weight-/Factor-/CKD-/Lock-Bedingungen. Jede Abweichung berechnet und schreibt
  neu. `dry_run=true` liest/validiert/berechnet identisch, schreibt aber nie.
- Trendpilot: Inputrange 1 bis 373 inklusive Tage; ein RPC lädt
  `input.from-27..input.to`, damit der Umschlag höchstens 400 Tage umfasst.
  Alle 28-Tage-Kontexte werden pure aus diesem Snapshot abgeleitet; genau null
  weitere Activity-Reads. Neue Payloads besitzen `level`, `active_days_4w`
  und `weeks_with_entries_4w`, nicht `sessions_4w`; alte Payloads bleiben
  lesbar. Gate, Severity, ACK, Dedup und sichtbare Copy bleiben unverändert.
- Auth, Range, Snapshot und vollständige Contractvalidierung passieren vor
  jedem Report-/Profil-/State-/Eventwrite. Monthly bleibt build-before-write;
  Protein/Trend `dry_run` haben null Writes; ein Fehler behält das letzte
  gültige Produktpostimage.
- Alte Range Reports, Health-V2-Dateien und Trendpilot-Payloads werden nicht
  migriert. Der R10-Coaching-Export, Activity-V2-Capture, Navigation, Commit,
  History und Download bleiben unverändert verborgen.

#### Retry-, Stale- und Cachevertrag

- Browser-REST bleibt bei `maxAttempts=0` plus höchstens einem vorhandenen
  Authrefresh; kein fachlicher Blind-Retry. Doctor generation/lifecycle fängt
  Range-, Close- und Logout-Races ab.
- Edge-Handler führen je Request höchstens einen Activity-RPC aus und
  wiederholen weder Snapshot noch Write blind. Bestehende Report-Singleton-,
  Protein-Cooldown- und Trend-Dedupregeln bleiben die Racegrenze.
- Der sichtbare Cutover hebt `CACHE_VERSION` von `v6` auf `v7`; Activation
  entfernt v6 Shell/Runtime, Fresh- und kontrollierter Upgradeclient müssen
  die neue Scriptreihenfolge ohne Mischpostimage laden.

#### S2 Full Contract Review und Continuation Gate

- Produkt-, API-, Auth-, Owner-, RLS-, SQL-, Range-, Medical-, Fehler-,
  Stale-, Cache-, Backcompat- und R14-Vertrag: `PASS`.
- Berechtigte Findings F16-F18 wurden im Zielvertrag geschlossen und besitzen
  eindeutige S4-Datei-/Testowner; keine neue Grundsatzentscheidung bleibt.
- Internal Continuation Gate: `PASS`; jeder Consumer besitzt genau eine
  Activity-Source of Truth und einen beschriebenen Rollbackpfad. S3 darf
  automatisch beginnen.

## S3 - Bruchrisiko-, Security- und Cutoverreview

Reasoning: `GPT-5.6 Sol / Extra High`.

Deterministisch:

1. P0 prüfen:
   - öffentliche Function durch falsches `verify_jwt`
   - Secret im Browser/Log/Git
   - frei wählbarer Owner
   - RLS-Bypass ohne expliziten Filter
   - Teilwrite nach Snapshot-/Authfehler
2. SQL prüfen:
   - duplizierte Union
   - ACL-/Owner-/Search-Path-/Volatility-/Overloaddrift
   - SQL25-Vertragsbruch und Rollback-Preimage
3. Consumer prüfen:
   - V1/V2-Doppelzählung, Same-day, Empty, Range, DST, Sortierung
   - V1-Löschung versus V2 read-only
   - Health-V3 all-or-error und Privacy
   - alte Report-/Trendpilot-Snapshots
4. medizinische Consumer prüfen:
   - Proteinformel/Doctor-Lock unverändert
   - Cooldown-Stale-Metadaten
   - Trendpilot 27-Tage-Erweiterung, N+1 und Payloadkompatibilität
5. Runtime prüfen:
   - Function-/Workflow-Zwischenzustände
   - laufende Scheduler, manuelle Dispatches und HTTP-Fehler
   - Webload, Service Worker, frischer Client und Upgradeclient
6. Rollbackmatrix pro SQL, Function, Workflow und Webreader festlegen.
7. S5-Testmatrix und Evidence-IDs festlegen; gültige R11/R12-Evidence
   referenzieren statt wiederholen.
8. S4-Blöcke und Invalidation Map ableiten.
9. Full Contract Review, Findings-Korrektur und Status-Sync.

Exit:

- Alle P0/P1 sind geschlossen, einem S4-Paket zugeordnet oder als
  owner-akzeptierte Out-of-Scope-Watchlist dokumentiert.
- Bei PASS automatisch S4R.

### S3-Abschluss: Red-Team-, Test- und Cutoververtrag

#### Security-, Daten- und Consumer-Red-Team

<!-- markdownlint-disable MD013 -->

| Risiko | Severity | Geschlossene Grenze / Pflichtorakel | Owner |
| --- | --- | --- | --- |
| `verify_jwt=false` erreicht ungeschützten Handler | P0 | deklarative False-Liste exakt zwei; erster Handlerpfad ist `createSupabaseContext`; Public/anon/malformed 401 und 0 Reads/Writes | S4.1/S4.7 L01/L07 |
| Secret in Browser, Git, Doku, Log oder Testoutput | P0 | Named-Secret nur GitHub/Supabase Stores; Scanner auf Literal/JWT; Diagnosen nur Code/Status/Modus | S4.1/S4.7 L01/L07 |
| Secret-as-Bearer, Legacy-Bearer oder Cross-Key | P0 | kombinierte Named-Mode-Matrix weist alle drei vor Business-I/O mit 401 ab | S4.1 L01 |
| frei wählbarer Owner | P0 | exakte Body-Keysets ohne `user_id`; Claim-Owner oder Function-spezifische Env; Owner-ID nie Antwort/Log | S4.1/L01, S4.5/L05, S4.6/L06 |
| RLS-Bypass ohne Ownerfilter | P0 | Userclient RLS; Schedulerclient muss bei jedem Table-Read/Write explizit denselben Owner tragen; Fake-Client-Orakel zählt Filter/Payloads | S4.5/L05, S4.6/L06 |
| Teilwrite nach Auth-/Range-/Snapshot-/Contractfehler | P0 | vollständige Preconditions und dry-run-Build vor erstem Write; Failure-Fixtures erwarten null Repositorycalls | S4.4-L06 |
| zweite V1-/V2-Union oder abweichende Aggregation | P1 | ausschließlich neuer SQL-Core enthält Union; statischer Negativscan plus Wrapper-jsonb-Parität | S4.2 L02, S4.7 L07 |
| SQL25-/ACL-/Owner-/Mode-/Overloaddrift | P1 | exakte Katalog-, Definition-, Functiondef-, ACL-, Search-Path-, Volatility- und Overloadorakel | S4.2 L02 |
| `midas_private` öffnet R9-Helper für service_role | P1 | Schema-Usage allein plus Execute nur neuer Core; alter Helper bleibt service=false; Data API 406/PGRST106 | S4.2 L02 |
| SQL26-Rollback löscht/ändert Fachdaten oder falsches SQL25 | P1 | geschützte V1/V2/Report/Profile/Trend-Hashes, DML-Negativorakel, exakte f7226f6a-Restoredefinition, Forwardtest | S4.2 L02 |
| V1/V2-Doublecount oder Same-day-/DST-Fehler | P1 | wiederverwendete R11-Goldens plus SQL-Core-Parität für Empty/V1/V2/Mixed/Same-day/Vienna-DST/Sort | S4.2-L06 |
| V1-Delete greift V2 an | P1 | UI- und Callback-Orakel: Delete nur `source=activity_v1`; V2 ohne Control/Mutation | S4.3 L03 |
| Health V3 ist partial, enthält Details oder fällt auf V2 zurück | P1 | V2-Basis ohne Activity-Read plus ein Snapshot; strict/all-or-error/privacy; 0 Downloadanker bei Fehler | S4.3 L03 |
| alte Reports werden migriert | P1 | nur neu gebautes Payload wird projiziert; bestehende Row bleibt bis normalem explizitem Report-Lifecycle unberührt | S4.4 L04 |
| Legacy-Trendpayload wird überschrieben oder hybrid | P1 | Legacy-Activity-Unterobjekt bei Conflict unverändert; neue Activity exakt R12-Keyset; beide Readerfälle | S4.6 L06 |
| Proteinformel/Doctor-Lock/ACT driftet | P1 | Alt-/Neu-Fixtures vergleichen alle nicht-Activity-Faktoren und Ziele; Adapter bestimmt nur Tage/ACT/Modifier | S4.5 L05 |
| Protein-Cooldown übersieht Activity-/Versionsdrift | P1 | jede einzelne v1.3/Fenster/Tage/Level-/Herleitungsabweichung erzwingt Recompute; identisches Postimage skippt | S4.5 L05 |
| Trend 373+27 überschreitet SQL-Maximum oder erzeugt N+1 | P1 | 373 PASS, 374 fail; Envelope exakt max400; ein RPC unabhängig von Event-/Fensterzahl | S4.6 L06 |
| Edge-/Workflow-Zwischenzustand bricht Scheduler | P1 | geschütztes Cutoverfenster, 0 queued/in-progress, Edge-Smoke vor Workflowpush, bei neuem Run STOP | S5.3/S5.6/S5.7 |
| SW liefert gemischtes v6/v7-Postimage | P1 | Versionsbump, Fresh plus v6-Upgrade, Script-/CSS-Loadoracle, alte Caches entfernt | S4.3/S5.1 L03 |
| Workflow- und Webrollback sind gekoppelt | P1 | zwei pfadselektive Commits; zweiter Webrevert lässt Runtime/Workflows intakt | S5.7 |
| Baseline driftet zwischen Review und Gate | P1 | S5.3 wiederholt Versionen, Hashes, ACL, Counts, Runs, Key-/Secret-Namen und Pages-HEAD; jede Drift STOP | S5.3 PRE01-PRE07 |

<!-- markdownlint-enable MD013 -->

Kein neuer transaktionaler Mehrfachwritevertrag wird erfunden: Trendpilot darf
nach vollständig grünen Preconditions seine bestehende sequenzielle
State-/Event-Persistenz verwenden. Verboten ist ausschließlich ein Write nach
Auth-, Owner-, Range-, Snapshot- oder Contractfehler; ein DB-Writefehler wird
sicher gemeldet und im produktiven Postcheck anhand der bestehenden Dedup-/
ACK-Grenzen bewertet.

#### Test- und Evidence-Plan

<!-- markdownlint-disable MD013 -->

| Evidence | Ausführung | Muss beweisen | Wiederverwendung / Invalidation |
| --- | --- | --- | --- |
| L01 | Deno Shared-Auth-/Principal-Fixtures, Paket-Typcheck | User, beide korrekten Named Secrets getrennt, Cross-Key/Public/anon/Legacy/malformed, Bodyowner, fehlende Env, 0 I/O bei Fehler | neu; jede Authhelper-/Mode-/Configänderung invalidiert |
| L02 | disposable PostgreSQL 17 Full Fixture | SQL25/26 fresh/rerun/drift, drei Signaturen, ACL/RLS/BOLA, private-schema 406, Empty/V1/V2/Mixed/Same-day, 400/401, Caps, Rollback/Forward, DML-/Hashschutz | R11 pure Golden wiederverwenden; R11 SQL-Nachweise durch SQL26 gezielt invalidiert |
| L03 | Node Contracts + Playwright 1280x900/390x844/320x800 Fresh/v6-Upgrade | report-first, Ready/Empty/Error/Stale/Range/Close/Logout, V1 Delete/V2 read-only, Health V3 strict/privacy/all-or-error, CSS/Overflow/Console, Productload/SW | R11 View/Health-pure Tests wiederverwenden; frühere Productload-Absenz bewusst ersetzt |
| L04 | Deno Monthly-Handler-Harness plus R11 Reporttests | User-JWT, genau ein SQL25-RPC, V1/V2/Mixed/Empty, neue Copy/Meta/Series, Legacyrow unberührt, Fehler vor Write, Rohfehler sanitizt | R11 Consumer/Report pure gültig; Handlerintegration neu |
| L05 | Deno Protein-Handler-Harness plus R12 Adaptertests | User/Secret/dry-run, 28 Tage, ACT/Formel/CKD/Lock, v1.3, jede Cooldownkomponente, Body-Save/Manual/Scheduler, 0 Teilwrite | R12 Protein pure 4/4 gültig; Runtime-Isolation absichtlich invalidiert |
| L06 | Deno Trend-Handler-Harness plus R12 Adaptertests | User/Secret/dry-run, 1/373/374 und 400-Envelope, ein RPC/N+1=0, Gates/Severity/ACK, neue Keys, Legacy-Konflikt ohne Rewrite/Hybrid, 0 Teilwrite | R12 Trend pure 4/4 gültig; Runtime-Isolation absichtlich invalidiert |
| L07 | YAML/static Scope-/Secret-/DML-/Productload-Orakel | exakte Secret-Namen, nur `apikey`, `--fail-with-body --silent --show-error`, Schedules/Inputs gleich, config false nur 2, R14 loads=0, Union=1, Secretliterale=0 | ersetzt R11/R12 Productload-/Isolation-Negativpostimage |
| L08 | finaler S4-Diff einmal integriert | alle invalidierten Node/Deno/PG17/Browser/Workflowchecks, Deno check/lint/fmt, diff-check, nativer Full Review | S5.1/S5.2; nach Fix nur direkt invalidierte Teilmenge |
| L09 | CodeRabbit genau 1 Initial + höchstens 1 Verifikation | finaler identischer Diff; berechtigte Findings geschlossen | erst S5.2; S1-S4 weiterhin 0 |

<!-- markdownlint-enable MD013 -->

#### Exakte Cutover- und Zwischenzustandsreihenfolge

1. S5.3 wiederholt den vollständigen read-only Preflight. Kein Scheduler darf
   queued/in-progress sein; Dienstag/Freitag `00:30-02:30 UTC` ist kein
   Cutoverfenster. Bei Drift oder neuem Run: STOP.
2. S5.4 legt nach Einzelbestätigung die zwei Supabase-Named-Keys an und setzt
   die zwei GitHub-Secrets. Alte Workflows/Edges ignorieren sie; Legacy Keys
   bleiben aktiv.
3. S5.5 führt exakt den freigegebenen SQL26-Hash aus und prüft sofort drei
   Functions, Wrapperparität, ACL/private Schema, Advisors, Zähler und
   geschützte Hashes. Alte Edges bleiben funktionsfähig.
4. S5.6 deployt Monthly Report mit `verify_jwt=true`; kontrollierter User-JWT-
   Report-Smoke. Danach Protein mit `verify_jwt=false`, User- und benannter
   Secret-`dry_run`. Danach Trendpilot mit `verify_jwt=false`, User- und
   benannter Secret-`dry_run`. Nach jedem Einzelpostcheck eigener STOP-Punkt.
5. Zwischen Protein-Deploy und Workflowpush wäre der alte Protein-Scheduler,
   zwischen Trend-Deploy und Workflowpush wären beide alten Scheduler
   absichtlich inkompatibel. Deshalb weiter nur im geschützten Fenster und vor
   jeder Grenze Runs erneut prüfen; kein Legacy-Fallback wird eingebaut.
6. S5.7 Commit/Push A staged ausschließlich reviewte Runtime-/SQL-/Config-/
   Workflow-/Testpfade, nie die fremden R1/C2-Archivmoves oder anderen Dirty
   Files. Danach je ein owner-freigegebener manueller Workflowlauf und
   kontrollierter Profil-/Trend-Postcheck.
7. Erst danach staged Commit/Push B ausschließlich Doctor-/Productload-/CSS-/
   SW-Pfade. Pages-Build muss exakt dessen SHA liefern; Fresh- und v6-
   Upgradeclient, Doctor, Health V3, neuer Report und V1-Capture-/R14-
   Negativorakel müssen grün sein.
8. S5.8 prüft das vollständige Postimage. Named Keys und Legacy Keys werden
   weder deaktiviert noch gelöscht.

#### Exakte Rollbackreihenfolge

- Vor jedem produktiven Gate wird zusammen mit dem Forward-Schritt eine
  ausdrückliche Freigabe für seinen exakten Rollback benötigt; ohne diese
  Freigabe wird bei Fehler gestoppt und nicht improvisiert zurückgeschrieben.
- Fehler in S5.5 vor Edge-Aktivierung:
  1. keine Edge-/Workflow-/Webaktion
  2. SQL26-Rollback auf SQL25 f7226f6a und alte private-schema-ACL
  3. Hash-/ACL-/Advisorpostcheck
- Fehler bei einem Edge in S5.6:
  1. keine nächste Function und kein Git-Push
  2. betroffene Function auf letzte Version/letzten Bundlehash plus altes
     `verify_jwt` zurückstellen (Monthly 50/true, Protein 18/true,
     Trendpilot 21/true)
  3. bei vollständigem Abbruch bereits umgestellte Functions in umgekehrter
     Reihenfolge Trend -> Protein -> Monthly zurückstellen
  4. erst danach SQL26 rückrollen; Named Keys/Secrets dürfen dormant bleiben
- Fehler nach Commit/Push A:
  1. Dispatches stoppen und 0 laufende Runs belegen
  2. Trend -> Protein -> Monthly auf letzte Versionen/Flags zurückstellen
  3. Commit A per freigegebenem Revert/Push zurückstellen; Pages baut weiter
     das noch unveränderte Webpostimage
  4. SQL26 rückrollen und Postimage prüfen
- Fehler nach Commit/Push B bei ansonsten grüner Runtime:
  1. nur Commit B per freigegebenem Revert/Push zurückstellen
  2. Pages-Build, Fresh-/Upgradeclient und altes Doctor/Health-Postimage prüfen
  3. Runtime/Workflows bleiben aktiv; nur bei zusätzlichem Runtimefehler die
     vollständige Reversefolge aus dem vorigen Punkt anwenden
- Schlüssel-/GitHub-Secret-Löschung oder -Rotation ist nie automatischer
  Rollbackbestandteil und benötigt eine eigene spätere Ownerfreigabe.

#### S3 Full Contract Review und Continuation Gate

- Security, SQL, Datenintegrität, Consumer, Medical, Legacy, Scheduler,
  Commit/Push, Cache, Testabdeckung, Cutover und Rollback: `PASS`.
- F19-F21 wurden durch Legacy-Preservation, produktive CSS-Ownership und zwei
  getrennte Commit-/Pushpostimages im Vertrag geschlossen.
- offene unzugeordnete P0/P1: `none`; P2 bleibt ausschließlich die fremde
  Altlink-Watchlist F13.
- Internal Continuation Gate: `PASS`; S4R darf automatisch beginnen.

## S4 Readiness Review

Reasoning: `GPT-5.6 Sol / Extra High`.

<!-- markdownlint-disable MD013 -->

| Block | Substep | Änderung | Exakte Dateiownership | Review | Checks / Evidence | Gate |
| --- | --- | --- | --- | --- | --- | --- |
| A | S4.1 | Shared Edge Auth, Principal und requestlokaler Activity-Runtime-Loader | neu `_shared/activity-edge-principal.ts` + Test; neu `_shared/activity-consumer-runtime.ts` + Test | nativer Security-/Consumerreview | fokussiert L01; Deno check/lint/fmt nur Shared-Files | none |
| A | S4.2 | SQL26 kanonischer Snapshotprovider | neu SQL26, Rollback, PG17-Fixture; `sql/16_Explicit_Grants.sql` | nativer SQL-/Securityreview | L02 Full Fixture; geschützte R11-/R9-Orakel | none in S4; produktiv S5.5 |
| B | S4.3 | Doctor View, Health Export V3, produktive Styles/Productload/Cache | `doctor/index.js`, `app/app.css`, `index.html`, `service-worker.js`; neue R13-Productcontract-/Browsertests; R11-Module unverändert | nativer Consumer-/Privacy-/UI-Review | fokussiert L03 Fresh/v6-Upgrade 1280/390/320 | none |
| B | S4.4 | Range-Arztbericht | `midas-monthly-report/index.ts`; neuer Handler-Integrationstest; R11 Consumer/Reportmodule unverändert | nativer Consumer-/Lifecycle-Review | fokussiert L04 plus invalidierte Deno check/lint/fmt | none; produktiv S5.6 |
| C | S4.5 | Protein Target | `midas-protein-targets/index.ts`; neuer Handler-Integrationstest; R12-Adapter unverändert | nativer Medical-/Security-/Consumerreview | fokussiert L05 plus invalidierte Deno checks | none; produktiv S5.6 |
| C | S4.6 | Trendpilot | `midas-trendpilot/index.ts`; neuer Handler-Integrationstest; R12-Adapter unverändert | nativer Medical-/Security-/Legacyreview | fokussiert L06 plus invalidierte Deno checks | none; produktiv S5.6 |
| D | S4.7 | deklarative Functionflags, Workflows, Isolation und Cutoverartefakte | `backend/supabase/config.toml`; zwei Scheduler-YAMLs; neues/erweitertes R13-Isolationsorakel; Roadmap/Evidence-Cutoverlisten | nativer Runtime-/Scope-/Secretreview | fokussiert L07; YAML/config/Productload/R14/Secret/DML | none in S4; produktiv S5.7 |

<!-- markdownlint-enable MD013 -->

S4R muss vor Umsetzung:

- die Tabelle gegen den realen S1-S3-Iststand korrigieren
- Größenklasse und betroffene Dateigruppen finalisieren
- diese bevorzugten Ausführungsblöcke bestätigen oder begründet ändern:
  - Block A: S4.1-S4.2 Auth-/Datenfundament
  - Block B: S4.3-S4.4 sichtbare und Report-Reader
  - Block C: S4.5-S4.6 medizinische Consumer
  - Block D: S4.7 Runtime-/Cutoverartefakte
- nach jedem Block nur invalidierte Checks ausführen
- CodeRabbit in S4 ausdrücklich bei null halten
- alle produktiven Gates ausschließlich S5 zuordnen
- ein Owner-Briefing liefern:
  - exakte Produktwirkung
  - erwartete Dateien und Arbeitsgröße
  - SQL-/Auth-/Keymodell in Alltagssprache
  - Cutover- und Rollbackreihenfolge
  - notwendige manuelle Owneraktionen
  - Kriterien für `GO / CONDITIONAL GO / NO-GO`

Exit:

- S4 kann ohne neue Grundsatzentscheidung beginnen.
- Dieser erste Discovery-Auftrag stoppt nach aktualisierter Resume Card und
  Evidence. Ein explizites Owner-GO startet danach ohne weitere
  Substep-Freigaben die autonome Welle S4-S5.3.

### S4R-Abschluss, Scope-Freeze und Owner-Briefing

#### Readiness-Urteil

- Größenklasse: `large`, voraussichtlich 23 bis 27 Code-/Test-/Runtimepfade
  plus laufender Roadmap-/Evidence-Sync. Keine Produktivaktion ist Bestandteil
  von S4.
- Empfehlung: `GO` für die lokale autonome Welle S4.1-S4.7 und danach
  S5.1-S5.3. Dieses GO autorisiert keine Schlüssel-/Secretanlage, kein
  produktives SQL, keine `verify_jwt`-Änderung, keinen Deploy, Workflowlauf,
  Commit, Push, Webcutover oder Deviceaktion.
- S4 beginnt erst nach dem tatsächlich ausgesprochenen Owner-GO. Aktueller
  Zustand: `STOP; S4 nicht begonnen`.

#### Finaler Scope-Freeze

- Sichtbare Wirkung nach späterem vollständigem Cutover:
  - Doctor-Trainingstab zeigt den gemeinsamen V1/V2-Snapshot report-first;
    V1 bleibt tagbezogen löschbar, V2 read-only.
  - der sichtbare Gesundheitsdownload ist Health Export V3;
  - nur neu erzeugte Range Reports erhalten die kompakte R11-
    Activityprojektion;
  - Protein verwendet eindeutige 28-Tage-Aktivtage mit Calc v1.3 und
    herleitungssicherem Cooldown;
  - Trendpilot verwendet pro Request einen maximal 400-Tage-Snapshot und neue
    eindeutige Activitykeys, ohne Legacy-Payloads umzuschreiben;
  - beide Scheduler verwenden je einen eigenen Named Secret Key nur in
    `apikey` und schlagen bei HTTP-Fehlern sichtbar fehl.
- Daten-/Authwirkung:
  - SQL26 ist additive/refaktorierende Read-DDL mit exakt einem privaten
    Projektionskern und zwei öffentlichen Wrappern; keine Activity-/Report-
    Datenmigration.
  - Userpfade bleiben JWT/RLS; nur Protein/Trendpilot werden dual und deshalb
    in-function-authentifiziert. Owner bleibt serverseitig Stephan.
- Unverändert und geschützt:
  - Activity V1 ist alleiniger Capturewriter; R14-Productloads bleiben null.
  - R10-Coaching-Export, Activity-V2-Navigation/Commit/History/Download,
    Doctor-Informationshierarchie, Proteinformel/CKD/Lock, Trend-Gates/Copy,
    alte Reports/Exports/Trendpayloads und alle anderen Edge/API-Key-
    Migrationen.
  - Legacy Keys werden nicht deaktiviert; Incident Push, Android/PWA-Key,
    Assistant, Vision, Transcribe und TTS sind out of scope.
  - die fremden bytegleichen R1/C2-Archivmoves werden weder zurückgesetzt noch
    mit R13 gestaged; ihre zwei Altlinks bleiben eine separat sichtbare
    P2-Doku-Watchlist.

#### Bestätigte Ausführungsblöcke und Reasoning

1. Block A - S4.1/S4.2, `Extra High`:
   - erst testbare Principal-/Runtimegrenze, dann SQLprovider/ACL;
   - Output: requestlokale User-/Secretclients, ein kanonischer Loader,
     SQL26+Rollback+Fixture und SQL16-Sync;
   - Blockreview: Security, BOLA, private-schema, SQL25-Backcompat;
   - nur L01/L02 und direkt betroffene Deno-/PG17-Checks.
2. Block B - S4.3/S4.4, `High`:
   - sichtbare Doctor/Health-Reader und User-JWT-Reportreader auf dem grünen
     Fundament; kein Scheduler-/Medicalwrite;
   - Output: Doctor-Lifecycle, V3-Download, scoped CSS, Productload/SW v7 und
     neuer Report-Build-before-write;
   - Blockreview: Consumer, Privacy, Report-Lifecycle, responsive UI;
   - nur L03/L04 und deren Browser-/Deno-Checks.
3. Block C - S4.5/S4.6, `Extra High`:
   - beide medizinischen Consumer nacheinander, Adapter bleiben unverändert;
   - Output: Protein v1.3/Cooldown/dry-run sowie Trend Envelope/Legacy-
     Preservation/dry-run;
   - Blockreview: Medical, Ownerfilter, no-partial-write, Legacy;
   - nur L05/L06 und direkt betroffene Deno-Checks.
4. Block D - S4.7, `High`:
   - erst nach allen Handlern deklarative Flags und inkompatible
     Workflowcaller ändern; keine Remoteaktivierung;
   - Output: config false exakt zwei, getrennte `apikey`-Workflows, harte
     HTTP-Fehler, R13-Isolation und deploybare Cutover-/Rollbackartefakte;
   - Blockreview: Runtime, Scope, Secret, R14, Dirty Boundary;
   - nur L07. Die integrierte einmalige Vollmatrix folgt in S5.1.

Blöcke laufen strikt `A -> B -> C -> D`; Substeps innerhalb eines Blocks
laufen in Nummernreihenfolge. Nach jedem Block: Findings bündeln, berechtigte
minimal korrigieren, nur dadurch invalidierte Checks wiederholen, nativen
Delta-Review und Roadmap/Resume/Evidence-Sync ausführen. CodeRabbit bleibt in
ganz S4 exakt `0`.

#### Invalidation Map

<!-- markdownlint-disable MD013 -->

| Delta | Direkt invalidiert | Nicht erneut nötig, solange unverändert |
| --- | --- | --- |
| Shared Principal/Authmodi/Paketpin | L01, Handlerauthteile L05/L06, config/header-Teil L07 | R11 pure Consumer/View/Health/Report, R12 pure Medicalsemantik |
| Shared Activity-Runtime-Loader | L01-Loaderteil, One-RPC-/Erroranteile L05/L06 | Browser-Data-Access und Monthly-R11-Loader |
| SQL26/Rollback/SQL16/private ACL | L02; SQL-Token-/Wrapperintegration L04-L06 | R11 JS/TS-Validator-Goldens als fachliche Orakel |
| Doctor/Productload/CSS/SW | L03 und Productloadteil L07 | L01/L02/L04-L06 |
| Monthly Handler | L04; vorhandene Request-/Lifecycletests nur soweit Import-/Buildpfad berührt | Doctor/Health, Protein, Trend, Workflows |
| Protein Handler | L05 | R12 Proteinadapter-Fingerprint und alle fremden Handler |
| Trend Handler | L06 | R12 Trendadapter-Fingerprint und alle fremden Handler |
| config/YAML/Isolation | L07; L01 nur falls Modusliste geändert wird | L02-L06 bei reinen statischen Calleränderungen |
| Findings-Fix | nur Zeile(n) der berührten Dateiowner plus abhängige Consumer | alle übrigen grünen Blocknachweise |

<!-- markdownlint-enable MD013 -->

HCR-029 bleibt für unveränderte pure R11-Module gültig; SQL-/Productload-/
Handlerintegration wird durch L02-L04 ersetzt. HCR-030 bleibt für unveränderte
R12-Adapter/15 pure Tests gültig; nur die alte Isolation `product_wiring=0`
wird absichtlich durch L05-L07 ersetzt.

#### S5.1-S5.3 nach S4R-GO

- S5.1 führt einmal auf dem finalen S4-Diff L01-L08 integriert aus:
  relevante Node-/Deno-Suites, Check/Lint/Fmt, PG17-Full-Fixture,
  Browser Fresh/Upgrade, Workflow-/Scopeorakel und `git diff --check`.
- S5.2 führt nativen Full Review und danach genau einen CodeRabbit-
  Initiallauf plus höchstens einen Verifikationslauf aus. CodeRabbit-Zähler vor
  S5.2 bleibt null.
- S5.3 wiederholt ausschließlich read-only PRE01-PRE07: Git/Remote-HEAD,
  SQL/ACL/RLS/Counts/Hashes/Advisors, Edge-Versionen/Flags/Bundles,
  Key-/Secret-Namen ohne Werte, Workflow/Runs und Pages/SW. Bei Drift: STOP.
- Danach zwingender STOP vor S5.4 mit finalen Artefakthashes, Versionen,
  erwarteter Wirkung und konkreten produktiven Einzelgates.

#### Exakte Cutover-/Rollbackreihenfolge

- Verbindlicher Forwardpfad: `S5.3 Preflight -> S5.4 zwei Named Keys + zwei
  GitHub-Secrets -> S5.5 SQL26 -> S5.6 Monthly(true) -> Protein(false,
  User+Secret dry-run) -> Trend(false, User+Secret dry-run) -> S5.7
  Runtime/Workflow Commit A + zwei kontrollierte Dispatches -> Web/PWA Commit
  B + Pages Fresh/Upgrade/Doctor/Health/Report/V1/R14-Smokes -> S5.8`.
- Verbindlicher Reversepfad bei vollständigem Rollback: `0 Runs -> Web Commit
  B revert (falls vorhanden) -> Trend v21/true -> Protein v18/true -> Monthly
  v50/true -> Runtime/Workflow Commit A revert -> SQL26-Rollback auf SQL25
  f7226f6a + alte private ACL -> vollständiger read-only Postcheck`.
- Bei reinem Webfehler wird nur Commit B revertiert; grüne Runtime/Workflows
  bleiben. Bei SQL26-Fehler vor Edges wird nur SQL26 rückgerollt. Named Keys
  und GitHub-Secrets dürfen dormant bleiben und werden nie automatisch
  gelöscht/rotiert.
- Jede produktive Forward- und Rollbackaktion bleibt trotz dieser Spezifikation
  owner-gated. Das aktuelle S4R-GO erteilt dafür keine Berechtigung.

#### Noch benötigte Freigaben

1. Jetzt: ausdrückliches `GO` für exakt S4.1-S4.7 und S5.1-S5.3 gemäß diesen
   vier Blöcken. Dies ist die einzige unmittelbar benötigte Freigabe.
2. Später S5.4: einzeln Named Key `protein-targets-scheduler`, Named Key
   `trendpilot-scheduler`, GitHub Secret `PROTEIN_TARGETS_SECRET_KEY` und
   `TRENDPILOT_SECRET_KEY`; Werte nur in Secretdialogen.
3. Später S5.5: finaler SQL26-Hash plus sein exakter Rollback.
4. Später S5.6: drei Edge-Deploys/Flags in der festgelegten Reihenfolge,
   kontrollierter Reportwrite und je exakter Versions-/Flagrollback.
5. Später S5.7: pfadselektiver Commit/Push A, zwei manuelle Workflowläufe mit
   kontrollierter Writewirkung, pfadselektiver Commit/Push B, Pages-/Web-
   Smokes und die jeweiligen Reverts.
- Keine Deviceaktion ist für R13 vorgesehen. Eine zusätzliche S6-Doku-
  Commit/Push-Aktion wäre separat owner-gated und ist nicht impliziert.

#### GO / CONDITIONAL GO / NO-GO

- `GO`: Scope, Blöcke, Invalidation und lokaler Endpunkt S5.3 werden ohne
  Erweiterung akzeptiert; dann läuft die Welle autonom bis zum Produktivbrief.
- `CONDITIONAL GO`: STOP; Bedingung zuerst in Roadmap/Evidence einarbeiten,
  Full Contract Review wiederholen und keine Umsetzung beginnen.
- `NO-GO`: STOP; keine S4-Änderung.
- Während der Welle erzwingen neuer P0/P1, Contractbruch, Drift oder fehlende
  Rollbackfähigkeit ebenfalls sofortigen STOP am betroffenen Gate.

#### S4R Full Contract Review

- Scope, Dateiownership, Reihenfolge, Reasoning, Test/Evidence, Invalidation,
  Security/Medical/Legacy, Cutover, Rollback, Dirty Boundary, Reviewbudget und
  Owner-Gates: `PASS`.
- fehlende Zuordnung: `none`; offene unzugeordnete P0/P1: `none`.
- Discovery Wave S1-S4R: `PASS`. S4 nicht begonnen; Status bewusst am
  Owner-Gate.

## S4 - Umsetzung

S4 ist lokal und nicht produktiv. Jeder Block erhält einen nativen Delta-,
Consumer-, Security- oder Medical-Review sowie nur die invalidierten Checks.
Kein CodeRabbit, kein Remote-Write, kein Deploy, kein Workflowlauf.

### S4.1 - Shared Edge Auth und Principal Contract

Reasoning: `GPT-5.6 Sol / Extra High`.

- eine kleine versionierte Shared-Auth-Schicht nur für die zwei dualen
  Functions implementieren
- `@supabase/server` mit `user` plus spezifischem
  `secret:<name>` verwenden
- Userowner aus validierten Claims, Schedulerowner aus serverseitiger
  Konfiguration ableiten
- falschen Modus, falschen Keynamen, Secret-as-Bearer, fehlenden Owner und
  Body-Owner fail-closed behandeln
- sichere Fehlerantworten ohne Credential-/DB-Details
- Auth-/Principal-Fixtures für User, beide richtigen Secrets, Cross-Key,
  Public, anon, Legacy-Bearer und malformed Header

Exit:

- beide Principals sind strikt und unabhängig testbar; noch kein Handler
  produktiv umgestellt.

### S4.2 - SQL26 kanonischer Snapshotprovider

Reasoning: `GPT-5.6 Sol / Extra High`.

- `sql/26_Activity_Consumer_Runtime_Activation.sql`,
  Rollback und PostgreSQL-17-Fixture erstellen
- einen nicht exponierten kanonischen ownerparametrisierten Projektionskern
  schaffen
- bestehenden SQL25-Userwrapper extern kompatibel auf diesen Kern delegieren
- service-only Wrapper mit explizitem Ownerparameter und minimaler ACL
  bereitstellen
- `SECURITY INVOKER`, fester/leer gehärteter Search Path,
  Volatility, Owner, Rollen und Errorcodes einfrieren
- SQL16 für Full Builds synchronisieren
- Fresh, Rerun, Drift, Auth, RLS, BOLA, Same-day, V1/V2/Mixed/Empty,
  400/401 Tage, Caps, Rollback und Forward beweisen
- keine fachliche Activity-/Report-DML

Exit:

- User- und Schedulerwrapper liefern byte-/semantikgleich denselben
  validierten Consumervertrag; SQL25 bleibt nach außen kompatibel.

### S4.3 - Doctor View und Health Export V3

Reasoning: `GPT-5.6 Sol / High`.

- R11-Consumer in definierter Scriptreihenfolge laden
- Doctor-Trainingstab auf gemeinsamen Snapshot umstellen
- V1-Delete erhalten; V2 ohne Delete
- Health-Download kontrolliert auf V3 umstellen
- Loading, Empty, Error, Stale, Logout und Rangewechsel absichern
- Service-Worker-/Productloadvertrag aktualisieren, ohne R14-Module zu laden
- Desktop, 390 und 320 px; kein Overflow; bestehende Doctor-Hierarchie
  unverändert

Exit:

- sichtbarer read-only Consumer ist lokal vollständig, V1-Capture bleibt
  unverändert.

### S4.4 - Range-Arztbericht

Reasoning: `GPT-5.6 Sol / High`.

- requestgebundenen User-RLS-Snapshot über SQL25 laden
- isolierte R11-Reportprojektion in den bestehenden Build-before-write-Pfad
  einbinden
- direkte V1-Activity-Abfrage aus dem neuen Berichtspfad entfernen
- kompakte Copy und versionierte Activity-Meta verwenden
- bestehende gespeicherte Reports nicht migrieren
- Snapshotfehler vor Reportwrite fail-closed und sanitizen

Exit:

- neu erzeugte Berichte verwenden den gemeinsamen Consumervertrag; alte
  Reports bleiben unverändert.

### S4.5 - Protein Target

Reasoning: `GPT-5.6 Sol / Extra High`.

- Shared Auth aktivieren und beide Principals unterstützen
- Userpfad über SQL25, Schedulerpfad über service-only Ownerwrapper
- R12-Proteinadapter einbinden; direkte V1-Count-Abfrage entfernen
- Formel, CKD-Faktoren, Doctor-Lock und ACT-Schwellen unverändert halten
- Calc-Version `v1.3-*` und Aktivtage/Level konsistent persistieren
- Cooldown nur bei vollständig unveränderter Herleitung skippen
- Snapshot/Contract/Auth vor jedem Profilwrite
- Body-Save-, Manual-, Scheduler-, Locked-, Empty- und Fehlerpfade testen

Exit:

- Zielwertbedeutung bleibt gleich; Herkunft ist V1/V2-kompatibel und
  nachvollziehbar.

### S4.6 - Trendpilot

Reasoning: `GPT-5.6 Sol / Extra High`.

- Shared Auth aktivieren und beide Principals unterstützen
- genau einen Snapshot-Umschlag pro Request laden
- explizite Inputrange auf maximal 373 Tage begrenzen
- alle 28-Tage-Fenster pure aus demselben Snapshot ableiten
- R12-Adapter aktivieren; direkte V1-Activity-Abfrage und N+1 verhindern
- neue Events mit `active_days_4w` und
  `weeks_with_entries_4w` schreiben
- alte `sessions_4w`-Events weiterhin lesen
- Gate, Level, Severity, ACK und Copy unverändert
- Snapshot/Contract/Auth vor jedem Trendpilotwrite

Exit:

- Trendpilot erhält kompatiblen Aktivitätskontext ohne neue medizinische
  Aussage.

### S4.7 - Workflows, Productload, Cache und Cutoverartefakte

Reasoning: `GPT-5.6 Sol / High`.

- Proteinworkflow auf `PROTEIN_TARGETS_SECRET_KEY` und
  Trendworkflow auf `TRENDPILOT_SECRET_KEY` umstellen
- nur `apikey` senden; kein Bearer
- `curl --fail-with-body --silent --show-error` oder gleichwertig
- bestehende Schedules/Inputs unverändert lassen
- Productload-/R14-Negativorakel und Secret-Scan erweitern
- deklarativen `verify_jwt=false`-/Deployvertrag reproduzierbar
  dokumentieren
- geordnete Cutover-/Rollbackcheckliste und Zwischenzustandsmatrix erstellen
- GitHub-/Web-Aktivierung weiterhin nicht ausführen

Exit:

- finaler lokaler Diff ist deploybar und besitzt für jeden Zwischenzustand
  eine Stop-/Rollbackaktion.

## S5 - Integrierte Tests, Review und produktiver Cutover

Reasoning: `GPT-5.6 Sol / Extra High`.

### S5.1 Lokale Abschlussmatrix

Einmal auf dem finalen S4-Diff:

1. relevante Node-/Deno-Contracttests
2. Deno check/lint/fmt
3. PostgreSQL-17-Full-Fixture für SQL25/26/SQL16/Rollback
4. Browser-/PWA-Smokes Desktop/390/320, Fresh und Upgrade
5. Edge-Harness für User-, Secret-, Cross-Key- und Fehlerpfade
6. Workflow-Syntax und Headerorakel
7. Productload-, R14-, Secret-, DML- und Scope-Isolation
8. `git diff --check`

### S5.2 Integrierter Review

1. nativer Full Code-, Contract-, Security-, Medical- und Scopereview
2. genau ein CodeRabbit-Initiallauf über denselben finalen Diff
3. Findings gesammelt bewerten; nichts blind korrigieren
4. berechtigte Findings minimal bündeln
5. nur invalidierte Checks wiederholen
6. genau ein CodeRabbit-Verifikationslauf
7. keine weitere Reviewspirale ohne P0/P1-/Security-/Datenintegritätsgrund

### S5.3 Produktiver Read-only Preflight

Ohne Writes erfassen:

- Functionversionen, `verify_jwt`, Bundles und aktuelle ACLs
- SQL25-Hash, Owner, Grants, Zähler und geschützte Datenhashes
- V1-/V2-/Report-/Profil-/Trendpilot-Baselines
- GitHub-Secretnamen, Workflowstände und laufende Runs
- Keynamenexistenz ohne Werte
- Web-/SW-Version und aktueller Deploymentweg
- Advisor-Watchlists

Bei Drift: Stop, Roadmap/Evidence korrigieren, keine Teilaktivierung.

### S5.4 Owner-Gate A - Schlüssel und Secrets

Briefing und Einzelbestätigung für:

1. benannten Supabase Secret Key `protein-targets-scheduler`
2. benannten Supabase Secret Key `trendpilot-scheduler`
3. GitHub Secret `PROTEIN_TARGETS_SECRET_KEY`
4. GitHub Secret `TRENDPILOT_SECRET_KEY`

Werte werden ausschließlich in den vorgesehenen Secretdialogen eingegeben.
Evidence speichert nur Namen, Existenz und erfolgreichen Modus-Smoke.

### S5.5 Owner-Gate B - SQL26

- finalen Hash, erwartete Objekte, ACLs und geschützte Daten briefen
- SQL26 exakt einmal ausführen
- sofort Owner, Definition, ACL, SQL25-Backcompat, service-only Wrapper,
  Zähler, Datenhashes und Advisors read-only prüfen
- bei Abweichung keine Edge-Aktivierung

### S5.6 Owner-Gate C - Edge-Cutover

In dieser Reihenfolge und jeweils mit eigenem Smoke/Rollbackpunkt:

1. `midas-monthly-report` deployen und User-JWT-/Report-Smoke
2. `midas-protein-targets` mit finalem Dual-Auth-Vertrag deployen
3. Userpfad und benannten Protein-Secretpfad prüfen
4. `midas-trendpilot` mit finalem Dual-Auth-Vertrag deployen
5. Userpfad und benannten Trendpilot-Secretpfad prüfen

Kein Secret-Smoke darf unkontrolliert medizinische Daten neu berechnen. Der
konkrete Dry-run-/no-op-/kontrollierte Writevertrag wird in S2/S3 eingefroren.

### S5.7 Owner-Gate D - Workflow- und Web/PWA-Cutover

- keine laufende Schedulerausführung im Cutoverfenster
- final reviewten Workflow-/Webdiff per explizit freigegebenem Commit/Push
  oder gleichwertigem kanonischen Deployment aktivieren
- beide Workflows manuell mit kontrolliertem Input ausführen
- HTTP-Status, Functionmodus, Ownerbindung und erwartete Writewirkung prüfen
- Doctor View, Health Export V3 und neuen Arztbericht produktiv smoken
- frischen Client und Upgradeclient gegen Service Worker prüfen
- Activity-V1-Capture und alle R14-Negativorakel erneut prüfen

R13 bleibt `BLOCKED`, wenn der Owner keinen für den realen
Produktdeploy nötigen Zwischen-Commit/Push freigibt.

### S5.8 Finales Postimage

- alle fünf Consumer nutzen den gemeinsamen Vertrag
- SQL25 und service-only Wrapper gehärtet
- beide Scheduler nur über je eigenen benannten Secret Key
- keine neue Advisor-P0/P1-Warnung
- Activity-V1-Capture grün
- Activity-V2-Capture/Productload weiterhin null
- Rollbackartefakte und letzte gültige Versionen dokumentiert

<!-- markdownlint-disable MD013 -->

| ID | Ebene | Check / Smoke | Status | Nachweis |
| --- | --- | --- | --- | --- |
| T-ACT-R13-01 | lokal | Shared Auth/Principal Matrix | TODO | EV-ACT-R13-L01 |
| T-ACT-R13-02 | disposable | SQL25/26 Fresh/Rerun/Drift/Auth/RLS/Rollback | TODO | EV-ACT-R13-L02 |
| T-ACT-R13-03 | Browser | Doctor/Health V3 Desktop/390/320 Fresh/Upgrade | TODO | EV-ACT-R13-L03 |
| T-ACT-R13-04 | Edge lokal | Monthly Report V1/V2/Mixed/Empty/Error | TODO | EV-ACT-R13-L04 |
| T-ACT-R13-05 | Edge lokal | Protein User/Secret/Formula/Cooldown/Error | TODO | EV-ACT-R13-L05 |
| T-ACT-R13-06 | Edge lokal | Trend User/Secret/373/400/Legacy/N+1/Error | TODO | EV-ACT-R13-L06 |
| T-ACT-R13-07 | Workflow/Scope | Header, HTTP fail, Secret-, Productload-, R14-Orakel | TODO | EV-ACT-R13-L07 |
| T-ACT-R13-08 | produktiv read-only | Baseline und Preflight | USER-GATED | EV-ACT-R13-PRE01.. |
| T-ACT-R13-09 | produktiv write | Keys, SQL, Edge, Workflow, Web | USER-GATED | EV-ACT-R13-W01.. |
| T-ACT-R13-10 | produktiv | vollständiges Postimage und Rollbackbereitschaft | USER-GATED | EV-ACT-R13-R01.. |

<!-- markdownlint-enable MD013 -->

Exit:

- alle relevanten lokalen und produktiven Checks grün
- keine offenen In-Scope-P0/P1
- jede produktive Aktion und Wirkung in Evidence
- R13-Consumer real aktiv, R14-Capture weiterhin inaktiv

## S6 - Doku-Sync und Abschluss

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. Activity, Doctor View, Reports, Protein, Trendpilot und Supabase Core
   Overviews auf das bewiesene R13-Postimage synchronisieren.
2. Activity-Masterplan:
   - R13 `DONE`
   - R14 als einziges nächstes Core-Gate
3. Auth-Modernisierungs-Masterplan:
   - R13-Postimage als Baseline
   - verbleibende globale Migration unverändert offen
4. HCR-031 mit dauerhaftem Consumer-/Auth-/Parityvertrag ergänzen.
5. SQL-HOW-TO, Recovery-/Deploydoku und Workflowhinweise nur mit realen
   Versionen/Hashes aktualisieren.
6. `CHANGELOG.md` unter `Unreleased` aktualisieren, weil
   Doctor/Health/Report/Protein/Trendpilot produktiv verändert wurden.
7. Owner Recap in Alltagssprache:
   - was sich sichtbar geändert hat
   - warum User-JWT und Secret Key getrennt sind
   - warum SQL26 nötig war
   - wie Scheduler und Rollback funktionieren
   - was bewusst bis R14 unverändert bleibt
8. finalen Contract-, Security-, Medical- und Scopereview durchführen.
9. Findings korrigieren und nur invalidierte Checks wiederholen.
10. Resume Card und Evidence auf Abschluss setzen.
11. Roadmap und Evidence mit `(DONE)` archivieren.
12. Commit-Empfehlung aus dem realen finalen Diff ableiten.

Erwartete Commit-Empfehlung:

```text
feat(activity-v2): activate read consumers with v1 parity
```

Exit:

- Code, Runtime, Workflows, Doku, Roadmap und Evidence beschreiben denselben
  produktiven Vertrag.
- R14 kann anschließend allein den Activity-V2-Capture und finalen
  Android-PWA-Cutover planen.
