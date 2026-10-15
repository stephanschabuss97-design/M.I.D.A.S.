# MIDAS QA

Dieser Ordner ist der kanonische Einstieg für aktuelle, wiederverwendbare
MIDAS-Testverträge. Er beschreibt, wie beobachtbares Verhalten geprüft wird.
Er ersetzt weder Produktverträge noch Ausführungsnachweise oder
Release-Historie.

## Adoptierte QA-Revision

MIDAS übernimmt `NOMOS-QA / 2026-10-15 / E01` ausdrücklich für neue
QA-/Runbookarbeit und neue einschlägige Aufträge ab dieser Adoption.
Es gelten die jeweils passenden Abschnitte des [NOMOS-QA-Standards][nomos].
Laufende und eingefrorene Roadmaps behalten ihre tatsächlich übernommene
Basis; ihre Migration folgt ausschließlich [BLUEPRINTs Adoption][adoption].
Wiederzugang zur vollständigen Revision: [EX-01-Originalbeilage][revision].
Lokale Testinhalte, Pflichtausweisung, Commands und Schutzgrenzen bleiben
in MIDAS. Diese Seite ist die lokale Suitekarte, keine zusätzliche Normebene.

## Leseroute

<!-- markdownlint-disable MD013 -->

| Frage | Ziel |
| --- | --- |
| Wo stehen gemeinsame QA-Kriterien? | [NOMOS-QA][nomos] |
| Welche MIDAS-Pflichten konkretisieren sie? | dieses Dokument |
| Welche Core-, Boot-, Auth- oder Runtime-Verträge gelten? | [Core Runtime][ref-1] |
| Wie werden Gesundheitsdaten, Berichte und Arztansichten geprüft? | [Health Capture and Reports][ref-2] |
| Wie werden Intake, Medikation und Retention geprüft? | [Intake and Medication][ref-3] |
| Wie werden Assistant, Voice und Intent geprüft? | [Assistant, Voice and Intent][ref-4] |
| Wie werden Push und Trendpilot geprüft? | [Push and Trendpilot][ref-5] |
| Wie werden Android Shell und Widget geprüft? | [Android and Widget][ref-6] |
| Wie werden generische Supabase- und Backend-Verträge geprüft? | [Backend and Supabase][ref-7] |
| Welche Gates gelten für einen bewussten MIDAS-Release? | [Release Readiness][ref-8] |
| Wie wird ein operativer Check sicher ausgeführt? | zuständiges Runbook unter `runbooks/` |
| Was wurde in einer konkreten Änderung tatsächlich ausgeführt? | aktive Roadmap oder zugehörige Evidence |
| Was wurde früher geprüft oder behauptet? | historisches QA-Archiv unter `docs/archive/qa/` |

<!-- markdownlint-enable MD013 -->

Verfügbare operative Runbooks:

- [Boot Error Smoke](runbooks/boot-error-smoke.md)
- [Push Runtime Smoke](runbooks/push-runtime-smoke.md)
- [Edge Function Deploy Smoke](runbooks/edge-function-deploy-smoke.md)
- [Supabase SQL Cutover](runbooks/supabase-sql-cutover.md)
- [Android Device Smoke](runbooks/android-device-smoke.md)
- [MIDAS Minimal Recovery](runbooks/midas-minimal-recovery.md)

## Artefaktrollen

Die gemeinsamen Definitionen stehen direkt in [NOMOS-QA 1][roles].
MIDAS-Produktverträge liegen in `docs/modules/*`; konkrete Implementierungen
bleiben deren Producer/Consumer/Schema. Release-Gates stehen in
[Release Readiness][ref-8], bemerkenswerte Änderungen in `CHANGELOG.md`,
exakte Dateistände in Git. Das historische QA-Archiv liegt unter
`docs/archive/qa/`; es ist kein aktueller Produkt- oder QA-Vertrag.

## Geltung und Status

Ergebnisort und -geltung bestimmt direkt [BLUEPRINT Evidence][evidence].
Ein früherer PASS-Zustand bleibt ausschließlich historisch. Ein weiterhin
gültiger historischer Test erhält eine aktuelle ID, aber nicht seinen
früheren Status. Bestehende IDs bleiben erhalten; gemeinsame Identitätsregeln
stehen direkt in [NOMOS-QA 2][ids].

## Suite- und ID-Vertrag

<!-- markdownlint-disable MD013 -->

| Präfix | Eigentümer-Suite | Primärer Bereich |
| --- | --- | --- |
| `CORE-` | `core-runtime.md` | Boot, Auth, State, Router, Diagnostics und globale Runtime |
| `HCR-` | `health-capture-reports.md` | Gesundheitsdaten, Capture, Berichte und Arztansichten |
| `IM-` | `intake-medication.md` | Intake, Medikation, Bestand und Retention |
| `AVI-` | `assistant-voice-intent.md` | Assistant, Voice, VAD und Intent |
| `PT-` | `push-trendpilot.md` | Push, Scheduler, Incidents und Trendpilot |
| `AW-` | `android-widget.md` | Android Shell, Native Auth und Widget |
| `BS-` | `backend-supabase.md` | domänenneutrale Backend- und Supabase-Plattformverträge |
| `RB-` | `runbooks/*.md` | operativer Ablauf; kein fachlicher Testfall |
| `REL-` | `release-readiness.md` | Release-Gate; kein fachlicher Testfall |

<!-- markdownlint-enable MD013 -->

Die Präfixe und Suiteowner dieser Tabelle bleiben lokal verbindlich.
Kanonische Definition und Aussageownership: direkt [NOMOS-QA 2][ids].

## Testfallschema

Gemeinsame Feldbedeutungen und Dimensionen: direkt [NOMOS-QA 3][fields]
und [NOMOS-QA 4][dimensions]. MIDAS verschärft die Darstellung:
Jeder aktuelle Test verwendet `PREFIX-NNN` und weist **jedes Pflichtfeld
ausdrücklich pro Test** aus. Gemeinsamer Fließtext oder ein früherer PASS
ersetzt diese Ausweisung nicht. Das lokale Pflichtschema bleibt:

```text
### PREFIX-NNN - Kurzer beobachtbarer Titel

- Vertrag: <ausdrücklich ausweisen>
- Ebene: static | local-runtime | browser | device | remote
- Ausführung: automated | manual | owner-observation
- Wirkung: read-only | disposable | productive; konkrete Variante angeben
- Voraussetzung: <ausdrücklich ausweisen>
- Aktion: <ausdrücklich ausweisen>
- Erwartung: <ausdrücklich ausweisen>
- Invalidiert durch: <ausdrücklich ausweisen>
- Runbook: optionaler RB-Link
- Historie: optionaler Archivanker
```

## Smoke- und Evidence-Vertrag

Dimensionen und Isolation/Cleanup sind direkt in [NOMOS-QA 4][dimensions]
und [NOMOS-QA 5][isolation] definiert; notwendige Runbookinformationen in
[NOMOS-QA 7][runbooks]. Die konkrete MIDAS-Variante und ihre Zugriffs-, Daten-,
Geräte- und Ownergrenzen bestimmen weiterhin die lokale Ausführung.

Lokale statische und read-only Sourcechecks benötigen kein zusätzliches
Owner-Gate, soweit sie keine geschützten Zugriffs-/Datenbereiche berühren.
Produktive Wirkung benötigt das sichtbare Owner-Gate der aktiven Roadmap
und datierte Evidence gemäß [BLUEPRINT][evidence]. Ein Preview/Dry-Run
wird nur bei tatsächlich vorhandener und zulässiger Fähigkeit erwogen.
Remote-read-only bezeichnet ausschließlich die begrenzte Remotezustandswirkung:
keine Änderung an Zustand, Scheduler oder Nutzerkommunikation. Daraus folgt
keine Erlaubnis, produktive oder sensible Daten zu lesen. Lokale Dateiablage
und Sensitivität sind zusätzlich zu berücksichtigen; bestehende Zugriffs-,
Recovery- und Ownergrenzen bleiben verbindlich. Insbesondere gelten
[Recoveryfreigabe und produktives Dry-Run-Verbot][recovery-gate] unverändert;
ein vollständiger Restore bleibt unbewiesen.

## Pflegevertrag

Neue Testaussagen werden der zuständigen Suite oben zugeordnet. Facharchitektur
bleibt im Module Overview; technische Abläufe stehen in `runbooks/`.
Historische Phasen und Statuswerte bleiben im Archiv. Kriterien für
Invalidation stehen direkt in [NOMOS-QA 3][fields], Ergebnisgeltung und
Retests ausschließlich in [BLUEPRINT][review].

## Lokale Source- und Dokumentchecks

MIDAS nutzt PowerShell und die gemeinsamen Werkzeugfakten direkt aus
[ATLAS](../../../codex-tools/apps/atlas/README.md); nur benötigte Abschnitte
unter BLUEPRINTs Capability-Preflight lesen. Vor Code/Doku/Deploy/Archiv den
Worktree prüfen und fremde Änderungen bewahren:

```powershell
git status --short
git diff --stat
git diff --check
```

Nach Frontend-JS-Änderungen jede geänderte Datei gezielt prüfen, etwa Touchlog,
Push und Service Worker; keine Rootdependency oder Buildpipeline nötig:

```powershell
node --check <datei.js>
git diff --check
```

Backendchecks/Workdir/Stack-/Seed-/Firewallcaveats besitzt
[Backend README](../../backend/README.md); Android-JDK/Wrapper/SDK/ADB besitzt
[Android README](../../android/README.md#lokale-toolchain).
Deno LS nur im Backend, Markdownlint für Dokumentation und Actionsansicht bei
Workflowarbeit sind lokale Editoranforderungen, keine Installations-/Authfacts.
Bei Dokuänderungen Links/Pfade/Anker, Encoding/Whitespace einschließlich neuer
Dateien und betroffenen Statusscope prüfen, nativ nach BLUEPRINT reviewen:

```powershell
rg -n "TODO|BLOCKED|P0|P1" docs/<betroffene-datei>.md
rg --files app backend docs
git diff --check
```

Kein Browser-/Geräte-/SQL-/Container-/Recovery-Smoke allein wegen Dokumentation.

## Browser- und PWA-Orakel

MIDAS ist browser-first ohne Root-Build-Step. Relevante Flächen:
`index.html`, `service-worker.js`, `public/sw/service-worker.js`,
`public/manifest.json`, `app/**/*.js`, `app/styles/*.css`.
Manuelle Browser-/PWA-Smokes sind oft passend; konkrete Fachorakel bleiben
in den zuständigen Suites. Lokaler Server und sicherer Kontext stehen in
[README Lokaler Start](../../README.md#lokaler-start): Repo-Root,
`python -m http.server 8765`, Ziel `http://127.0.0.1:8765`.

Die Last-Mile-Pflicht für relevante produktive UI-Schreibpfadänderungen steht
direkt in [BLUEPRINT][lastmile]; Aussagegrenzen und Harnessorakel direkt in
[NOMOS-QA 6][claims].
Zustandsmarker bleiben wertfrei ohne Gesundheitsdaten oder Secrets.
Bei simuliertem Reload deterministische UUID-/Lease-/Request-ID-Generatoren
so fortsetzen, dass erhaltener State nicht kollidiert.

Gemeinsame
[Playwright-Technik][ref-9]
einschließlich CLI/NODE_PATH bleibt ATLAS. Vor echtem Smoke benötigten Browser
nachweisen, Installation beweist keinen Browserpayload. Keine automatischen
Playwrightdateien, package.json-Änderungen oder Testdependencies; fester Einbau
erst bei bewusstem Screenshot-/Regressionstestauftrag. Lokale Server/PWA können
produktive Backends erreichen; Livewrites/Device-/Authsmokes behalten ihre
Gates.

## CodeRabbit und lokale Shim-Recovery

Kanonischen Command, NDJSON-/Abschluss-/Dateiscope-/Auth-/Indextechnik direkt
in
[ATLAS CodeRabbit][ref-10]
lesen. Geltung/S5/Budget/Findings/Retests/Fehlerdisposition besitzt
ausschließlich
[BLUEPRINT][ref-11].
MIDAS-Code-Roadmappflicht bleibt erhalten; Dokumentaufträge starten keinen
externen Review/Authcheck. Frozen Roadmaps behalten ihre adoptierte Revision.
Keine Repositorydependency, Lockfile oder `npx skills add` allein für Review.

Lokale Recoveryquelle ist [tools/coderabbit.cmd](../../tools/coderabbit.cmd).
Fehlender kanonischer Command oder fehlende Auth stoppt den externen Pfad.
Wiederherstellung, PATHänderung und Login verlangen eigenen begrenzten
Ownerauftrag; keine alternative Installation/CLI-Kette aus Reviewbedarf.
Vor Änderungen Zielidentität und Ownership beweisen, andere Nutzer des
gemeinsamen Commandverzeichnisses schützen und ausschließlich den genehmigten
Diff zurückrollen. Lokale Quelle bleibt erhalten; keine Account-/Tokenwerte
oder Authcallbacks in Doku/Logs/Git/Antworten.

[ref-1]: core-runtime.md
[ref-2]: health-capture-reports.md
[ref-3]: intake-medication.md
[ref-4]: assistant-voice-intent.md
[ref-5]: push-trendpilot.md
[ref-6]: android-widget.md
[ref-7]: backend-supabase.md
[ref-8]: release-readiness.md
[ref-9]: ../../../codex-tools/apps/atlas/docs/WORKSTATION_CAPABILITIES.md#playwright
[ref-10]: ../../../codex-tools/apps/atlas/docs/WORKSTATION_CAPABILITIES.md#coderabbit
[ref-11]: ../../../codex-tools/docs/blueprint/ROADMAP_AUTHORING_CONTRACT.md#coderabbit-geltung-budget-und-fehlerdisposition

[nomos]: ../../../codex-tools/apps/nomos/QA_STANDARDS.md
[roles]: ../../../codex-tools/apps/nomos/QA_STANDARDS.md#1-artefaktrollen
[ids]: ../../../codex-tools/apps/nomos/QA_STANDARDS.md#2-stabile-ids-und-kanonische-definitionen
[fields]: ../../../codex-tools/apps/nomos/QA_STANDARDS.md#3-ausreichende-testinformationen-und-invalidation
[dimensions]: ../../../codex-tools/apps/nomos/QA_STANDARDS.md#4-getrennte-testdimensionen
[isolation]: ../../../codex-tools/apps/nomos/QA_STANDARDS.md#5-isolation-cleanup-und-fremder-zustand
[claims]: ../../../codex-tools/apps/nomos/QA_STANDARDS.md#6-ehrliche-aussagegrenzen-und-consumerabdeckung
[runbooks]: ../../../codex-tools/apps/nomos/QA_STANDARDS.md#7-erforderliche-runbookinformationen
[adoption]: ../../../codex-tools/docs/blueprint/ROADMAP_AUTHORING_CONTRACT.md#ownership-und-adoption
[evidence]: ../../../codex-tools/docs/blueprint/ROADMAP_AUTHORING_CONTRACT.md#technische-evidence-gemeinsame-struktur
[review]: ../../../codex-tools/docs/blueprint/ROADMAP_AUTHORING_CONTRACT.md#gemeinsame-ausführungs--und-reviewregeln
[lastmile]: ../../../codex-tools/docs/blueprint/ROADMAP_AUTHORING_CONTRACT.md#auftragsfelder-und-technische-readiness
[revision]: ../../../codex-tools/apps/nomos/docs/archive/NOMOS%20QA%20Core%20Execution%20Roadmap%20%28DONE%29.md#historische-originalbytes
[recovery-gate]: runbooks/midas-minimal-recovery.md#wirkung-und-owner-gate
