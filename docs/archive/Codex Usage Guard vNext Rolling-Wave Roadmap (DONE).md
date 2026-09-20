# Codex Usage Guard vNext Rolling-Wave Roadmap

Vorbereitet nach `docs/templates/MIDAS Roadmap Workflow Contract.md`. Diese
Roadmap überführt die konsolidierten Guard-Erkenntnisse aus C3 und R14 in einen
versionierten, lokal testbaren und anschließend kontrolliert aktivierten
Guard-vNext-Vertrag.

---

## Roadmap-Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Status | `DONE_2026-09-13 / GUARD_VNEXT_ACTIVE / KASRKIN_QUALIFIED` |
| Ausführungsreife | `W0-W6A PASS; 119/119 integrierte Guardfälle; Guard vNext lokal aktiv; Legacy-Rollback grün` |
| Modul / Bereich | `Developer Tooling / Codex Usage Guard` |
| Owner / Kontext | `Stephan; lokale Codex-Arbeitsumgebung` |
| Chat-Lebenszyklus | `Denkraum -> eigener Ausführungs-Chat; Resume zwischen Wellen vorgesehen` |
| Erstellt am | `2026-09-09` |
| Letzter Stand | `2026-09-13: A.R.G.U.S.-Pilot nach einem ungescorten V1.6-Tested-Agent-Lauf ownerseitig unvollständig geschlossen; G-BENCHMARK-Override dokumentiert` |
| Aktueller Schritt | `COMPLETE / ARCHIVE_READY` |
| Risikoklasse | `R2; mehrere Prozessconsumer, aber lokal und reversibel` |
| Standard-Reviewtiefe | `Full` |
| Ausführungsmodell | `W0-W4: GPT-5.6 Sol; Benchmark: ownergewählte Profile; W5-W6: benchmarkkalibriertes Profil` |
| Reasoning-Standard | `W0-W4: High; niemals höher. Andere Profile ausschließlich in der ownergewählten Benchmarkkampagne oder nach ihrer Kalibrierung.` |
| Reasoning-Nachweis | `UI-/Runtime-Level ist vom Dokument nicht verifizierbar; im Chat ehrlich protokollieren` |
| Reasoning-Preflight | `NOT_OBSERVABLE im Ausführungs-Chat; angefordert GPT-5.6 Sol / High, keine stille Erhöhung und kein Modellwechsel` |
| Autonome Discovery Wave | `W0-W1` |
| Autonomieprofil | `local-full bis zum Benchmark-Gate; danach erneut local-full bei gültigem Ergebnisreceipt` |
| Maximal autonomer Endpunkt | `W4 vor G-BENCHMARK; danach W5 bis G-POLICY-ACTIVATE; nach Freigabe durch W6A/W6B bis W6C, jeweils nach Usage-/Finding-Gates` |
| Erwartete Arbeitsgröße | `mehrere kleine/mittlere Wellen über mehrere 5h-Buckets` |
| Externes Reviewbudget | `Codeänderungen: erst W6/S5, 1 Initial + höchstens 1 Verifikation` |
| Owner-Erklärmodus | `kurzes Briefing am Benchmark-Gate und vor aktiver Policy-Umschaltung` |
| Betroffene Hauptdateien | `tools/codex-usage/*, AGENTS.md, DEV_ENVIRONMENT.md, Roadmap-Templates, Evolution Notes` |
| Deploy relevant | `nein` |
| Produktive MIDAS-Wirkung | `keine; keine Gesundheits-, Supabase-, Web- oder Activity-Runtimeänderung` |
| Lokale Prozesswirkung | `ja; aktive Guard-Policy erst nach Benchmark und Owner-Gate` |
| Workflow-Vertrag | `docs/templates/MIDAS Roadmap Workflow Contract.md` |
| Usage-Continuation | `verpflichtend vor jeder Welle und jedem in W1 festgelegten kohärenten Block` |
| Evidence-Datei | `docs/archive/Codex Usage Guard vNext Rolling-Wave Evidence (DONE).md` |
| Gekoppelte Kampagne | `Codex Model Benchmark V1; getrenntes Ausführungsdokument, kein Unterblock dieser Roadmap` |
| Evidence-Owner | `diese Roadmap; Benchmarkkampagne besitzt nur ihr eigenes Run-Receipt` |
| Archivziel | `docs/archive/Codex Usage Guard vNext Rolling-Wave Roadmap (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Ausführungsmodell

Diese Datei ist zugleich Masterplan und ausführbare Roadmap. W0-W6 werden
direkt hier protokolliert. Es entstehen keine separaten Guard-Unterroadmaps,
solange eine Welle nicht durch eine neue externe Wirkung oder einen wesentlich
anderen Risikovertrag aus diesem Dokument herauswächst.

Der kontrollierte Modellbenchmark bleibt getrennt, weil er andere Modelle,
unabhängige Wiederholungen, einen eingefrorenen Korpus und eine eigene
Auswertungsdisziplin benötigt. Die Guard-Roadmap darf ihn vorbereiten und sein
fingerprintgebundenes Ergebnis übernehmen, aber nicht während der Messung ihre
Policy oder den Benchmarkvertrag verändern.

Mehrere Usage-Buckets sind ausdrücklich zulässig. Das ist keine Erlaubnis für
breite Wiederholungen: Jede Welle besitzt eine vollständige lokale
Postcondition, und weiterhin gültige Evidence wird per ID übernommen.

Die Wellen ersetzen nicht die kanonischen Roadmapphasen, sondern bündeln sie:

<!-- markdownlint-disable MD013 -->

| Kanonische Phase | Rolling-Wave-Zuordnung |
| --- | --- |
| `G0 / S1` | W0: reale Baseline, Istinventar und Fingerprints |
| `S2 / S3 / S4R` | W1: Zielcontract, Risiken, Security, Migration, Fixtures und Readiness |
| `S4` | W2-W5: lokale Implementierung, Shadow Mode, Benchmark-Gate, Kalibrierung und Umschaltung |
| `S5` | W6: integrierte Testmatrix und Reviews |
| `S6` | W6: Source-of-Truth-Sync und Archivierung |

<!-- markdownlint-enable MD013 -->

## Ausführungs-Chat-Startkarte

- Auftrag:
  - `Arbeite W0-W1 als autonome Discovery- und Contract-Wave ab. Setze danach
    die in W1 bestätigten lokalen W2-Wellen um und stoppe nur an den
    dokumentierten Gates.`
- Modell und Reasoning:
  - `W0-W4: GPT-5.6 Sol / High. Benchmarkprofile ownergewählt. W5-W6:
    benchmarkkalibriertes Profil, maximal High. Keine stille Erhöhung;
    tatsächlichen Zustand nur behaupten, wenn er beobachtbar ist.`
- Verbindliche Lesereihenfolge:
  1. `Diese Startkarte, Metadaten, Resume Card und Statusmatrix`
  2. `README.md und AGENTS.md`
  3. `docs/DEV_ENVIRONMENT.md, nur Codex-Start- und Usage-Abschnitte`
  4. `docs/templates/MIDAS Roadmap Workflow Contract.md, relevante Abschnitte`
  5. `docs/Codex Usage Guard Evolution Notes.md, Ledger und betroffene Themen`
  6. `tools/codex-usage/GetCodexUsage.ps1 und Test-CodexUsageState.ps1`
  7. `git status --short und nur der relevante Diff`
- Startschritt:
  - `W0 - Baseline und Ledger-Freeze.`
- Freigegebener autonomer Block:
  - `W0-W1; danach gemäß W1-Readiness und Usage-Gate.`
- Usage-Gates:
  - `Vor jeder Welle; innerhalb einer Welle nur an den in W1 festgelegten
    sicheren Grenzen. Kein Polling mitten im atomaren Block.`
- Owner-Gates:
  - `Auswahl und Start unabhängiger Benchmarkprofile; aktive Policy-Umschaltung;
    Installation einer geänderten Sensorversion in das Benutzerprofil.`
- Stop-Bedingungen:
  - `unklare aktive Semantik, fehlender Rollback, Datenschutzbruch, nicht
    deterministische Policyausgabe, nicht reproduzierbares Benchmarkreceipt,
    P0/P1 oder Usage-Safe-Closure.`
- Halluzinationsschutz:
  - `Keine Kosten, Modelleigenschaften, Tokenzahlen oder OpenAI-Lifecycle-APIs
    erfinden. Unbeobachtbares wird als NOT_OBSERVABLE dokumentiert.`

```text
Arbeite W0 und W1 dieser Roadmap deterministisch als autonome lokale Wave ab.
Nutze die Evolution Notes als Design- und Evidence-Quelle, aber den aktiven
Workflowvertrag als operative Regel. Markiere jede übernommene Idee exakt als
ACTIVE_REUSE, IMPLEMENT, VALIDATE_THEN_DECIDE, EXTERNAL_CAMPAIGN oder DEFERRED.
Implementiere nichts doppelt. Führe vor jeder neuen Welle das kanonische
Usage-Gate aus und halte an den dokumentierten Resume-Grenzen.
```

## Session Resume Card

- Ziel:
  - `Den bewiesenen Usage-Sensor zu einer deterministischen Guard-vNext-Policy
    mit dynamischer Topologie, belastbaren Receipts, Evidenzwiederverwendung
    und benchmarkkalibrierter Aktivierung weiterentwickeln.`
- Unveränderliche Verträge:
  - `Der Guard entscheidet nur über Arbeitszulassung; er schwächt keine
    Produkt-, Security-, Daten-, Owner- oder Reviewgates.`
  - `Rainmeter bleibt Anzeige; der kanonische Validator bleibt technische
    Eingangsschnittstelle.`
  - `Keine MIDAS-Produkt-, Gesundheits- oder Supabase-Wirkung.`
- Erledigter Stand:
  - `W0 PASS; W1 READY_WITH_GATES; W2 PASS: pure Kernpolicy, versionierte
    Schemas sowie 24/24 Core-, 12/12 Topologie- und 12/12 Cost-Fixtures ohne
    Seiteneffekt. W3A PASS: 15/15 Resume-/Read-Completeness-Fixtures; W3B
    PASS: 19/19 Evidence-Klassifikationsfixtures; W3C PASS: 12/12
    Verification-Fixtures. W3 gesamt 46/46. W4A PASS: 13/13 Validator-/
    Shadow-Fixtures. W4B PASS: 12/12 Migrations-/Rollback-Fixtures. W4C PASS:
    ursprüngliche Campaign Revision codex-model-benchmark-v1.0 ohne Run. Der
    Abschlussreview ersetzt sie vor Run 1 zunächst durch V1.1 und der
    Ausführungsreview danach durch codex-model-benchmark-v1.2. Der begrenzte
    Repair ersetzt V1.2 vor Run 1 durch codex-model-benchmark-v1.3. Der
    unabhängige Diff-/Contract-Review ersetzt V1.3 ebenfalls vor Run 1 durch
    codex-model-benchmark-v1.4: Raw-Output-/Attempt-Outcome-Kette,
    Campaign-Dokumentbindung, Stage-Revalidierung vor Ingestion und
    konservative 5,0-Punkte-Entscheidungszone. W4 gesamt bleibt PASS.`
- Aktueller Schritt:
  - `W0-W6 vollständig; Guard vNext aktiv, Legacy-Rollback grün, KASRKIN-Kern
    qualifiziert. A.R.G.U.S.-Pilot ehrlich unvollständig geschlossen; beide
    Context Bridges und Evolution-Notes-Sync abgeschlossen.`
- Nächster erlaubter Schritt:
  - `TOOLING EXTRACTION / WORKSPACE CLEANUP als separater, noch nicht
    begonnener Auftrag.`
- Offene Findings:
  - `keine offenen P0/P1; F-GUARD-29 bis F-GUARD-31 sind in W6B geschlossen;
    F-GUARD-06 DEFERRED_POST_ROADMAP und F-GUARD-11 ACCEPTED_WATCHLIST.`
- Geänderte Dateien dieser Ausführung:
  - `Roadmap/Evidence, Workflow-/Agent-/Umgebungsverträge, Changelog, README,
    Guard-vNext-Policy/Schema/Fixture-/Runnerdateien, additiver A.R.G.U.S.-
    Pilotabschluss sowie KASRKIN- und A.R.G.U.S.-Overviews; fremde Dirty-Files
    unangetastet.`
- Gültige Nachweise:
  - `finale C3-/R14-Receipts in den Evolution Notes; in W0 fingerprintbinden.`
- Context Receipt:
  - `W0-Live-Receipt, W1-Zielcontract und W2-W4-Evidence gültig;
    Evidence-Datei aktiv und auf den G-BENCHMARK-Resume synchronisiert.`
- Autonomieprofil / Welle:
  - `local-full bis W4 vollständig genutzt; G-BENCHMARK ist owner-gated.`
- Letzter Usage-Checkpoint:
  - `U43 schließt W6C bei 24/58 und SAFE_CLOSURE; gleicher Reset wie U42,
    exaktes W6C-Delta 23/4. Diese Werte sind keine Run-Usage-Evidence.`
- Rehydrationsstatus:
  - `POST_REHYDRATION_BASELINE; Rehydration ist SUNK_USAGE.`
- Primärblock / Zulassung:
  - `Der begrenzte lokale V1.6-Workspace-Binding-/Usage-Ingestion-Repair ist
    abgeschlossen; keine Benchmark-, Scoring- oder Produktarbeit.`
- Restricted-Work-Episode:
  - `Der V1.6-Block wurde nach kanonischem CONTINUE-Gate als ein kohärenter
    BOUNDED_LOCAL-Block ausgeführt und endet an einer sicheren Resume-Grenze.`
- Runtime-/Deploy-Stand:
  - `Sensor v3.1.0 unverändert aktiv; guard-vnext/1 lokal aktiv; keine
    Produkt-, Deploy-, Browser-, Device- oder Supabase-Wirkung.`
- Offene Owner-Freigaben:
  - `keine für W6A-W6C; G-POLICY-ACTIVATE wurde nach grünen Gates verbraucht;
    G-SENSOR-INSTALL war mangels Sensor-/Validatoränderung nicht erforderlich.`
- Exakter Resume-Punkt:
  - `DONE / nächster Auftrag TOOLING EXTRACTION / WORKSPACE CLEANUP.`

## Usage-Continuation-Checkpoints

<!-- markdownlint-disable MD013 -->

| ID | Grenze / nächster Block | Messzeit | 5h Rest / Reset | Woche Rest / Reset | Verbrauch | Entscheidung |
| --- | --- | --- | --- | --- | --- | --- |
| U0 | `Roadmap-Erstellung / bounded documentation` | `2026-09-09T14:14:34+02:00` | `37 % / 1788970506` | `90 % / 1789557306` | `Baseline` | `CONTINUE_WITH_CAUTION` |
| U0C | `Roadmap und Notes synchron / vor W0` | `2026-09-09T14:29:22+02:00` | `18 % / 1788970506` | `87 % / 1789557306` | `19 / 3` | `SAFE_CLOSURE` |
| U0R | `Pre-W0-Reviewblock` | `2026-09-09T21:39:08+02:00` | `100 % / 1789000745` | `87 % / 1789557306` | `Baseline` | `CONTINUE` |
| U0RC | `Review vollständig / vor externem Zweitreview` | `2026-09-09T22:04:08+02:00` | `59 % / 1789000745` | `80 % / 1789557306` | `41 / 7` | `CONTINUE / STOP_AS_PLANNED` |
| U0E | `externes Zweitreview und Korrekturblock` | `2026-09-09T22:11:14+02:00` | `57 % / 1789000745` | `80 % / 1789557306` | `Baseline` | `CONTINUE` |
| U0EC | `Zweitreview korrigiert / vor Ausführungs-Startprompt` | `2026-09-09T22:29:37+02:00` | `27 % / 1789000745` | `75 % / 1789557306` | `30 / 5` | `CONTINUE_WITH_CAUTION / STOP_AS_PLANNED` |
| U1 | `vor W0` | `2026-09-10T07:20:11+02:00` | `93 % / 1789035420` | `73 % / 1789557306` | `Baseline; Rehydration bereits sunk` | `CONTINUE / POST_REHYDRATION_BASELINE` |
| U2 | `nach W0 / vor W1` | `2026-09-10T07:27:55+02:00` | `82 % / 1789035420` | `71 % / 1789557306` | `11 / 2` | `CONTINUE` |
| U3 | `nach W1 / vor W2A` | `2026-09-10T07:37:56+02:00` | `74 % / 1789035419` | `70 % / 1789557306` | `5h: RESET_CROSSED; Woche: 1` | `CONTINUE / neue 5h-Baseline` |
| U4 | `nach W2A / vor W2B` | `2026-09-10T07:53:35+02:00` | `56 % / 1789035420` | `67 % / 1789557306` | `5h: RESET_CROSSED; Woche: 3` | `CONTINUE / neue 5h-Baseline` |
| U5 | `nach W2B / vor W2C` | `2026-09-10` | `INVALID / nicht übernommen` | `INVALID / nicht übernommen` | `nicht berechenbar` | `SAFE_CLOSURE; state.status nicht erfolgreich` |
| U5R | `Resume vor W2C` | `2026-09-10T08:01:27+02:00` | `43 % / 1789035419` | `65 % / 1789557306` | `5h: RESET_CROSSED; Woche: 2` | `CONTINUE / neue 5h-Baseline` |
| U6 | `nach W2 / vor W3A` | `2026-09-10T08:12:12+02:00` | `35 % / 1789035419` | `64 % / 1789557306` | `8 / 1` | `CONTINUE_WITH_CAUTION; W3A nicht kurz, NO_START` |
| U6R | `Resume vor W3A` | `2026-09-10T16:29:05+02:00` | `92 % / 1789053422` | `59 % / 1789557306` | `5h: RESET_CROSSED; Woche: 5` | `CONTINUE / neue 5h-Baseline` |
| U7 | `nach W3A / vor W3B` | `2026-09-10T16:37:28+02:00` | `86 % / 1789053422` | `58 % / 1789557306` | `6 / 1` | `CONTINUE` |
| U8 | `nach W3B / vor W3C` | `2026-09-10T16:45:23+02:00` | `79 % / 1789053422` | `57 % / 1789557306` | `7 / 1` | `CONTINUE` |
| U9 | `nach W3 / vor W4A` | `2026-09-10T16:52:45+02:00` | `72 % / 1789053422` | `56 % / 1789557306` | `7 / 1` | `CONTINUE` |
| U10 | `nach W4A / vor W4B` | `2026-09-10T17:02:45+02:00` | `62 % / 1789053422` | `55 % / 1789557306` | `10 / 1` | `CONTINUE` |
| U11 | `nach W4B / vor W4C` | `2026-09-10T17:09:22+02:00` | `54 % / 1789053422` | `53 % / 1789557306` | `8 / 2` | `CONTINUE` |
| U12 | `vor A.R.G.U.S.-Abschlussreview` | `2026-09-10T18:01:49+02:00` | `71 % / 1789071491` | `48 % / 1789557306` | `Baseline; Rehydration bereits sunk` | `CONTINUE / POST_REHYDRATION_BASELINE` |
| U13 | `vor V1.1-Ausführungsschichtreview` | `2026-09-10T22:30:41+02:00` | `72 % / 1789089518` | `32 % / 1789557306` | `Baseline; keine exakte Pre-Chat-Attribution` | `CONTINUE / POST_REHYDRATION_BASELINE` |
| U14 | `vor V1.2-Korrekturblock` | `2026-09-10T22:33:19+02:00` | `64 % / 1789089518` | `31 % / 1789557306` | `8 / 1` | `CONTINUE` |
| U15 | `vor Profilfreeze und Run-01-Stage` | `2026-09-10T22:58:36+02:00` | `39 % / 1789089518` | `27 % / 1789557306` | `25 / 4` | `CONTINUE_WITH_CAUTION / BOUNDED_LOCAL` |
| U16 | `Run 01 vorbereitet / Abschluss-Sync` | `2026-09-10T23:03:39+02:00` | `22 % / 1789089518` | `25 % / 1789557306` | `17 / 2` | `SAFE_CLOSURE` |
| U17 | `Dirty-Stop-Resume / finale Re-Bindung` | `2026-09-11T07:05:20+02:00` | `100 % / 1789121120` | `21 % / 1789557306` | `neue 5h-Baseline; Pre-Resume-Kosten nicht exakt attribuiert` | `CONTINUE / POST_REHYDRATION_BASELINE` |
| U18 | `alle V1.2-Postconditions geschlossen` | `2026-09-11T07:08:45+02:00` | `89 % / 1789121120` | `19 % / 1789557306` | `11 / 2` | `CONTINUE_WITH_CAUTION / STOP_AS_PLANNED` |
| U19 | `vor begrenztem V1.3-Control-Plane-Repair` | `2026-09-11T07:25:45+02:00` | `68 % / 1789121120` | `16 % / 1789557306` | `Baseline; Rehydration bereits sunk` | `CONTINUE_WITH_CAUTION / BOUNDED_LOCAL` |
| U20 | `V1.3-Postconditions geschlossen` | `2026-09-11T08:25:10+02:00` | `77 % / 1789125082` | `96 % / 1789711882` | `RESET_CROSSED in beiden Fenstern; kein Delta` | `CONTINUE / STOP_AS_PLANNED` |
| U21 | `vor begrenztem V1.4-Control-Plane-Repair` | `2026-09-11T08:46:41.8942774+02:00` | `62 % / 1789125082` | `94 % / 1789711882` | `kanonisch validierte Rehydration-Baseline` | `CONTINUE / BOUNDED_LOCAL` |
| U22 | `V1.4-Postconditions geschlossen` | `2026-09-11T14:13:40.3694332+02:00` | `58 % / 1789145710` | `78 % / 1789711882` | `5h RESET_CROSSED; Woche 16` | `CONTINUE / STOP_AS_PLANNED` |
| U23 | `vor Attempt-1-Ingestion und Klassifikation` | `2026-09-11T14:57:22.2714544+02:00` | `47 % / 1789145710` | `76 % / 1789711882` | `kanonisch validierte Blockbaseline; nicht RUN_END` | `CONTINUE_WITH_CAUTION / BOUNDED_LOCAL` |
| U24 | `Attempt 1 klassifiziert und sicher synchronisiert` | `2026-09-11T15:01:40.1224871+02:00` | `37 % / 1789145710` | `75 % / 1789711882` | `10 / 1` | `CONTINUE_WITH_CAUTION / STOP_AS_PLANNED` |
| U25 | `vor Run-01-Scoring und Receipt` | `2026-09-11T15:06:00.1748101+02:00` | `35 % / 1789145710` | `74 % / 1789711882` | `kanonisch validierte Blockbaseline` | `CONTINUE_WITH_CAUTION / BOUNDED_LOCAL` |
| U26 | `Scorecard und Receipt valide; POST_RUN-Blocker synchronisiert` | `2026-09-11T15:10:44.3186336+02:00` | `25 % / 1789145710` | `73 % / 1789711882` | `10 / 1` | `SAFE_CLOSURE / STOP_AS_PLANNED` |
| U27 | `vor ownerautorisiertem ARGUS-R38-V1.5-Repair` | `2026-09-11T18:58:56.1599133+02:00` | `94 % / 1789163772` | `68 % / 1789711882` | `neue 5h-Resetidentität; kein Delta zu U26` | `CONTINUE / BOUNDED_LOCAL` |
| U28 | `V1.5-Postconditions geschlossen` | `2026-09-11T19:22:47.2879487+02:00` | `52 % / 1789163772` | `61 % / 1789711882` | `42 / 7` | `CONTINUE / STOP_AS_PLANNED` |
| U29 | `vor Run-02-Scoring und Run-03-Vorbereitung` | `2026-09-11T19:53:31.5958358+02:00` | `26 % / 1789163772` | `57 % / 1789711882` | `Rehydrationsbaseline; keine Run-Usage-Attribution` | `CONTINUE_WITH_CAUTION / BOUNDED_LOCAL` |
| U30 | `Run 02 POST_RUN-valide; Run 03 vorbereitet` | `2026-09-11T20:03:36.8915806+02:00` | `7 % / 1789163772` | `54 % / 1789711882` | `19 / 3; keine Run-Usage-Attribution` | `SAFE_CLOSURE / STOP_AS_PLANNED` |
| U31 | `V1.6-Control-Plane- und Console-Abschluss` | `2026-09-12; genaue Messzeit nicht separat erhalten` | `76 % / 1789219257` | `96 % / 1789806057` | `Abschlusscheckpoint; keine Run-Usage-Attribution` | `CONTINUE / STOP_AS_PLANNED` |
| U32 | `vor Smoke-Session-Auto-Discovery-Repair` | `2026-09-12T11:05:36.7631902+02:00` | `62 % / 1789219257` | `94 % / 1789806057` | `kanonisch validierte Blockbaseline` | `CONTINUE / BOUNDED_LOCAL` |
| U33 | `Auto-Discovery und Control-Plane-Regression grün / vor Dokumentationsclosure` | `2026-09-12T11:24:27.3218563+02:00` | `38 % / 1789219257` | `90 % / 1789806057` | `24 / 4; keine Run-Usage-Attribution` | `CONTINUE / BOUNDED_DOCUMENTATION` |
| U34 | `finale Operator-Friction-Wave Start` | `2026-09-12; genaue Messzeit hier nicht separat erhalten` | `99 % / 1789249643` | `84 % / 1789806057` | `neue 5h-Resetidentität; keine Run-Usage-Attribution` | `CONTINUE / BOUNDED_LOCAL` |
| U35 | `finale Operator-Friction-Wave Closure` | `2026-09-12; genaue Messzeit hier nicht separat erhalten` | `78 % / 1789249643` | `81 % / 1789806057` | `21 / 3; keine Run-Usage-Attribution` | `CONTINUE / STOP_AS_PLANNED` |
| U36 | `vor Live-Smoke-Discovery-Repair` | `2026-09-12T19:10:46.7626394+02:00` | `74 % / 1789249643` | `80 % / 1789806057` | `kanonisch validierte Blockbaseline; keine Run-Usage-Evidence` | `CONTINUE / BOUNDED_LOCAL` |
| U37 | `Repair, Smoke-Wiederverwendung und Binding-PASS / vor Dokumentationsclosure` | `2026-09-12T19:22:48.5178326+02:00` | `48 % / 1789249644` | `76 % / 1789806057` | `Reset-ID nicht exakt gleich U36; kein Delta behauptet; kein PRE_RUN` | `CONTINUE / BOUNDED_DOCUMENTATION` |

<!-- markdownlint-enable MD013 -->

## Context Receipt

- Pre-W0-Review-Baseline: `52010c7b778e24018975e4dd0e1a9fd2a60fd690`.
- W0-Ausführungsbaseline: `52010c7b778e24018975e4dd0e1a9fd2a60fd690`.
- Dirty Boundary bei Erstellung:
  - `bestehende Guard-/Template-Dokumentänderungen und R15-Gerüst vorhanden`;
  - `test-results/.last-run.json ist fremde Laufzeitausgabe und bleibt
    unangetastet`.
- W0-Live-Dirty-Boundary:
  - `M AGENTS.md`, `M docs/DEV_ENVIRONMENT.md`,
    `M docs/Future trainingsmodule update thoughts.md`,
    `M docs/templates/MIDAS Roadmap Template.md`,
    `M docs/templates/MIDAS Roadmap Workflow Contract.md`,
    `M docs/templates/README.md`, `M test-results/.last-run.json`;
  - `D docs/Codex Usage Guard VS Code Extension Future Notes.md` und
    `D docs/MIDAS Validated Context Reuse Future Notes.md` gehören zur bereits
    konsolidierten Guard-Dokumentänderung;
  - untracked sind diese Roadmap, `docs/Codex Usage Guard Evolution Notes.md`
    und die fremde R15-Roadmap; W0 verändert ausschließlich die beiden
    Guard-Dokumente.
- Autoritative Quellen:
  - `AGENTS.md` für kurze aktive Regeln,
  - `docs/DEV_ENVIRONMENT.md` für Sensor und Bedienung,
  - `docs/templates/MIDAS Roadmap Workflow Contract.md` für Admission,
  - `docs/Codex Usage Guard Evolution Notes.md` für Design und Empirie.
- Bekannter Toolstand:
  - `GetCodexUsage.ps1 und Test-CodexUsageState.ps1`, Sensor `3.1.0`, Schema 3.
- Invalidation:
  - `Änderung an Sensor, Validator, Schema, Workflowzuständen oder Usage-Bands
    invalidiert den jeweiligen W0-Receiptpunkt.`
  - `Änderung am Benchmarkkorpus, Prompt, Goldstandard oder Scorer invalidiert
    Vergleichsruns ab dieser Revision.`
  - `Änderung an einer wiederverwendeten Quelle, ihrem Consumer, Harness,
    Oracle oder Runtime-Fingerprint invalidiert die betreffende Evidence-ID.`
- Read Completeness:
  - `Rolling-Wave-Roadmap und Evolution Notes am 2026-09-09 COMPLETE.`
  - `AGENTS.md COMPLETE; README Produkt-/Agentvertrag FOCUSED_COMPLETE.`
  - `DEV_ENVIRONMENT Start-/Usage-/Dokucheck FOCUSED_COMPLETE.`
  - `Workflow Contract Usage, Context, Evidence, S4/S5/S6 und Abschluss
    FOCUSED_COMPLETE.`
  - `Roadmap Template COMPLETE; Evidence Template und Template-README
    COMPLETE.`
  - `Ein kombinierter Erstread war TRUNCATED und wurde durch die genannten
    separaten vollständigen beziehungsweise fokussiert vollständigen Reads
    ersetzt.`
  - `Externes LLM-Zweitreview EXT-01 bis EXT-14 COMPLETE; alle Findings einzeln
    gegen ihre Fundstellen bewertet.`
  - `Nach den Korrekturen betroffene Roadmap-, Evolution-Notes-, State-,
    Ownership-, Permission-, Reuse- und Kalibrierungsabschnitte
    FOCUSED_COMPLETE.`
  - `W0: aktive Roadmap, README und AGENTS COMPLETE; DEV_ENVIRONMENT Usage und
    Dokucheck, Workflow Usage/Context/Evidence/Review, Roadmap-Template
    Resume/Usage/S4R und Evolution-Ledger/W0-W1-Design FOCUSED_COMPLETE.`
  - `W0: Sensor und Validator COMPLETE; R14-Evidencezielstellen
    FOCUSED_COMPLETE. Ein gekürzter kombinierter README-/AGENTS-Output wurde
    durch getrennte vollständige Reads ersetzt und nicht wiederverwendet.`

### Pre-W0-Review-Fingerprints

<!-- markdownlint-disable MD013 -->

| Source | SHA-256 am 2026-09-09 | Reviewabdeckung |
| --- | --- | --- |
| `README.md` | `538f0729fba09a5e26e29adbe6f3b63393257493c5975fbe579ca016e67ff6bf` | Produkt-/Agentvertrag fokussiert vollständig |
| `AGENTS.md` | `495a53ea8a29352d6148f867750af609c66e26e0c83f1944e63da6a6ea3e773f` | vollständig |
| `docs/DEV_ENVIRONMENT.md` | `01c037609c1d862799543928bc6d83e4ae49e3d1fb0a589a4b7a62f72e006a57` | Start-/Usage-/Dokucheck fokussiert vollständig |
| `docs/templates/README.md` | `ec552a4641f9f0018cb744ffed8d8c0491549101583fb53051132a4a134db0e4` | vollständig |
| `docs/templates/MIDAS Roadmap Workflow Contract.md` | `1ced1fe707da8a10d20353e7dacb2ecfab17a8bc8ca695623f702227421eeeb6` | Guard-relevante Vertragsabschnitte fokussiert vollständig |
| `docs/templates/MIDAS Roadmap Template.md` | `578b7615c0a61672d7784355159dbfccb96070914de4e4b4d7285362a44de8c5` | vollständig |
| `docs/templates/MIDAS Roadmap Evidence Template.md` | `9363a0a0f5be445601d0d274a77ad084e6d37f4008470797350819a671cf14dc` | vollständig |

<!-- markdownlint-enable MD013 -->

Jede Fingerprintabweichung invalidiert nur die davon betroffene Aussage. Die
beiden Guard-Dateien selbst erhalten nach diesem Review neue Fingerprints und
werden in W0 live geprüft.

### W0-Live-Fingerprints

<!-- markdownlint-disable MD013 -->

| Source | SHA-256 / Bindung am 2026-09-10 | Ergebnis |
| --- | --- | --- |
| `README.md` | `af0161a6c75e271a0431a25c8143e984e9bb284e6534b17820e260a7e9396330` | live gelesen; Produktgrenze unverändert |
| `AGENTS.md` | `748caef76ef31b27c32e8fe83d7a8a27f6bf91bbb1a6a2ec049ac08431f96789` | live gelesen; F-GUARD-01 bleibt bis W5 |
| `docs/DEV_ENVIRONMENT.md` | `70b6e8960df88a0d055e1fade216d2103357465af6711e953638fbb457ddf92d` | Sensor-/Validatorvertrag bestätigt |
| `docs/templates/README.md` | `513b0dc938b6bf0688a3604c3769de70b372019fb20785545c35e0eb7e0cac67` | relevante Workflowverweise bestätigt |
| Workflow Contract | `dd168f4d109c1094828bc35e7a0413f0248eff3ddefef38154352d12f1e14263` | aktive Admission-/State-Ownership bestätigt |
| Roadmap Template | `7620560af5179e66f0755426e079f10a10ae2dac3139879a7913ae43d8a41bc0` | Resume-/Usage-/S4R-Pflichtfelder bestätigt |
| Evidence Template | `8700675193b6531ad3061ffd71ace9d1d6aed89af80f6bf356fd1f5decde6692` | W1-Zielstruktur bestätigt |
| Evolution Notes, W0-Preimage | `1ad06e019af12b642c5615fae959bc69cbc1a790bca6fd96da6c8adbb79efc6f` | Ledger und Designquellen live gelesen; nichtnormativ |
| diese Roadmap, W0-Preimage | `70844fd8e732e6bdd7d34b25dd800e2751503484893ba7493f961370a7067a8b` | aktive Ausführungsinstanz |
| kanonischer Sensor | `3d8f8601d67e33193566cc4273faf517ed32915d8b758d4a5c5c60e08037c8d1` | installierte Kopie bytegleich; v3.1.0 / Schema 3 |
| Validator | `357c4227e613ba78bf652173aadc24eaf14281719143c7d89284b4cc36bccf6e` | U1 validiert; Parsefehler 0 |
| R14 Roadmap `(DONE)` | `00fd13710fb2a695a9b3072fde2c1ddd0b3ba93d5aefc4b39cacf25ffbdf572e` | historische Abschlussquelle |
| R14 Evidence `(DONE)` | `a7f4fb84111d6962ff3aa843013521a586d6a89eb43d9e1269aa6800c90c3b78` | 75/11 und 13/2 übernommen |

<!-- markdownlint-enable MD013 -->

Die Pre-W0-Fingerprints der zwischenzeitlich korrigierten Vertragsdateien
wichen vom Live-Stand ab und wurden deshalb nicht als aktiver Kontextcache
verwendet. Die betroffenen aktuellen Abschnitte wurden gezielt live gelesen.
F-GUARD-07 bis F-GUARD-10 und F-GUARD-12 bis F-GUARD-28 zeigen im aktuellen
Postimage keinen semantischen Rückfall und bleiben geschlossen.

Die aktive Evidence-Datei besitzt nach W4C/G-BENCHMARK-Resume-Sync den
Fingerprint `b72bcd97d8255680f931b5ed2a5e3129baf9266eb469c9e9214e09e6c2fd021a`;
der frühere W1-/W2B-Fingerprint ist dadurch erwartbar ersetzt. Der W1-
Zielcontract, die Evidence-Vorlage und die S4R-Abschnitte wurden
`FOCUSED_COMPLETE` gelesen; alle 16 geforderten Algebra-Dimensionen sind in
einer einzigen Tabelle enthalten.

W2-Context: Policy `87ec8995...0df9`, Runner `86864567...bd18`, Inputschema
`c302c41d...e756`, Outputschema `3dfc03d4...e02f`, Cost-Receipt-Schema
`66f15fee...b5c`, W2A-Fixtures `6224ac8b...1d40`, W2B-Fixtures
`858f6e7a...5221` und W2C-Fixtures `4eb48a74...c901`. Die vollständigen
Nachweise stehen unter `EV-GUARD-W2A-01..03`, `EV-GUARD-W2B-01..03` und
`EV-GUARD-W2C-01..03`.
Änderung an diesen Dateien, Zielcontract, direktem Consumer oder eine neue
Failure Class invalidiert nur die betroffene Evidence.

W3A/W3B-Context: Contractmodul `c1882a15...8b69`, Resume-Runner
`ba2a4221...ed81`, Evidence-Runner `3dabfa7b...c590`, Resume-/Contextschema
`ad3442db...a451`, Evidence-Schema `fbfaa564...5b54`, W3A-Fixtures
`4f0b6ee5...56b1` und W3B-Fixtures `be36222c...b525`.
`EV-GUARD-W3A-01..03` und `EV-GUARD-W3B-01..03` belegen das aktuelle
Postimage. Änderung an diesen Dateien oder am Resume-/Evidence-Vertrag
invalidiert nur die betroffenen W3- und nachgelagerten W4-Receiptprojektionen.

W3C-Context: Verification-Modul `58796e8b...134c`, Runner
`8bf2c47f...08d4`, Schema `ece2853d...9b5f` und Fixtures
`d2487c2b...bf1b`. `EV-GUARD-W3C-01..03` belegen den Finding-only-/Dirty-
Stop-/Resume-Roundtrip; Änderungen an diesen Artefakten invalidieren W3C und
die W4-Shadow-Receiptprojektion, nicht W3A/W3B.

W4A-Context: Validator `2174bc2c...2082`, unveränderter Sensor
`3d8f8601...c8d1`, Shadow-Modul `51292fdc...4ef1`, Runner
`3cde9113...ac29`, Envelope-Schema `47013d82...bbb1`, Shadow-Schema
`15efbbc0...027a` und Fixturekatalog `7d574def...fb84` samt vier gebundenen
State-Fixtures. Der frühere Validatorfingerprint `357c4227...ccf6e` bleibt
historisches W0-W3-Receipt; sein Defaultvertrag wurde im W4A-Postimage erneut
bewiesen.

W4B-Context: Migration-Modul `84789b19...378a`, Runner
`6115af3c...2b7a`, Schema `c41f179a...e8a4` und Fixtures
`a9fe23d4...0ecf`. Der Integrationsfixture bindet die tatsächlichen W4A-
Fingerprints und belegt Forward-Plan, Rollbackvorbereitung und sicheren
Legacy-Fallback ohne Mutation.

W4C-Context: V1.0 mit Kampagnendokument `eb51479d...7045` und Campaign
Fingerprint `57d932fd...8da9` bleibt historische Null-Run-Evidence. Der
Abschlussreview bindet V1.1 mit Kampagnendokument `2d1f82c1...54f7`, Manifest
`eb71f37a...019f`, 23 Assets, Campaign Fingerprint `3cb099cb...bef6`, Run-Bundle
Fingerprint `1a5eca76...7eaf`, zehn bereinigten Dokumenten und elf parsebaren
JSON-Dateien.
Der Ausführungsreview bindet anschließend V1.2 mit 31 Assets, Campaign
`e1c24734...eceb`, Run-Bundle `2c18b5a1...8177f`, Profilmanifest
`55819483...789c` und Run-01-Stage `4eecb549...719d`. V1.0 und V1.1 bleiben
`SUPERSEDED_BEFORE_FIRST_RUN` mit null Runs. Es wurde weiterhin kein
Benchmarkrun ausgeführt.
Der V1.2-Context Receipt bindet zusätzlich Campaign-Dokument
`71dc7cee...47c2`, Campaign Manifest `ffd01bba...8689` und Run-Metadaten
`eed62e8d...0d55`.
Der V1.3-Repair bindet anschließend 39 Assets, Campaign
`0634e1d9...47294`, Run-Bundle `cfaed4f9...f1f4d`, Toolcontract
`0b4864f2...d3fec`, Profilmanifest `6aa36dc2...c8b61`, Run-01-Metadaten
`d47055c2...825ba` und Stage `20c3061e...3fa2c`. V1.0, V1.1 und V1.2 bleiben
`SUPERSEDED_BEFORE_FIRST_RUN` mit null Runs; auch V1.3 besitzt weiterhin null
Runs, Responses, Scorecards, Receipts oder Campaign Results.

## Zielvertrag

Guard vNext liefert nachweisbar:

1. Eine pure, deterministische Policyfunktion. Sie erhält ausschließlich ein
   vom Validator erzeugtes Telemetrie-Envelope, dessen Ergebniszustand auch
   `INVALID`, `STALE`, `PARTIAL` oder `LIMIT` sein kann, einen expliziten
   Blockdescriptor, vorhandene Cost Receipts und Workflowzustand und gibt eine
   begründete Admission aus. Rohe ungeprüfte Sensorobjekte gelangen nicht in die
   Policy.
2. Keine Policyfunktion führt selbst Tools, Roadmaps, Commits, Deployments,
   Browseraktionen oder Produktwrites aus.
3. Usage-Fenster werden als dynamische Topologie behandelt. Ein fehlendes oder
   temporär aufgehobenes 5h-Fenster ist ein eigener validierter Zustand und
   kein automatisches `Computer sagt nein`.
4. `POST_REHYDRATION_BASELINE`, Resetwechsel, Sensorauflösung, Messlücken,
   Restricted-Work-Episode, Owner Boundary, Operational Safety Floor und
   Autonomous Full-Closure Floor besitzen deterministische Transitionen.
5. Ein Preferred-Wert über physischer Kapazität bleibt
   `PREFERRED_UNATTAINABLE`; ein unmöglicher Operational Floor wird
   `POLICY_INFEASIBLE` und erzeugt keine Reset-Warteschleife.
6. Cost Receipts trennen Arbeit, Pflichtpostcondition und administrative
   Closure und kennzeichnen Erfolg, sicheren Rollback, Finding-only,
   Safe Closure, Dirty Stop und nicht zurechenbare Intervalle.
7. Cost Confidence bleibt konservativ und kann nur aus vergleichbaren,
   störungsfreien, fingerprintgebundenen Wiederholungen steigen.
8. `MINIMAL_RESUME_WORKING_SET`, Context Receipt, Evidence Manifest,
   Mutation Scope, Out-of-Block Watchlist und Verification Mise en Place
   besitzen ein kompaktes Schema und klare Invalidierungsregeln.
9. Validated Context und Test Evidence Reuse reduziert nur redundante
   Verifikation. Es überspringt nie einen wegen Änderung, neuer Failure Class
   oder finalem Integrationsvertrag erforderlichen Test.
10. `ChatContextState` bleibt zunächst beschreibend. Eine automatische
    Chatwechsel-Empfehlung über `LOW` Confidence erfordert kontrollierte und
    ökologische Messungen.
11. Ein getrennter, reproduzierter Modellbenchmark kalibriert Modell-/Reasoning-
    Empfehlungen. Mindestens zwei unabhängige, gegengewichtete Runs je Profil
    sind Pflicht; bei Widerspruch oder Grenzfall folgt ein dritter.
12. Die aktive Policy wird erst nach grünem Benchmarkreceipt, Migrationstest,
    Full Review und explizitem Owner-Gate umgeschaltet.
13. Bestehende aktive Roadmaps werden nicht rückwirkend umgedeutet.
14. Extension, automatische Roadmapmutation, automatische Testauslassung,
    erzwungener Chatwechsel und eine behauptete Quotenreservierung bleiben
    außerhalb dieses Zielvertrags.

## Problem und Ist-Zustand

- Der aktive Sensor v3.1 und die manuelle Workflowpolicy haben C3 und R14 vor
  mehreren unsicheren Starts geschützt.
- Dieselbe R14-Empirie zeigte starre oder falsch zusammengesetzte Floors,
  wiederholte Ablehnungsdialoge, nicht zurechenbare Dirty-Stop-Intervalle und
  unnötige Rehydrations-/Verifikationswiederholungen.
- Aktive Regeln sind heute teilweise als ausführliche Klauseln in mehreren
  Vertragsdateien formuliert. Das erhöht das Risiko semantischer Drift.
- Policy, Blockdescriptor, Cost Confidence, dynamische Fenstertopologie und
  maschinenlesbare Evidence-Reuse existieren noch nicht als gemeinsam getestete
  lokale Implementierung.
- Der Umbau muss vorhandene Sicherheitswirkung bewahren und Redundanz senken,
  ohne Tests, Owner-Gates oder Produktverträge zu schwächen.

## Nicht-Ziele

- Kein Umbau von MIDAS-Produktcode, Activity V2, Supabase, SQL, Auth oder
  Gesundheitsdaten.
- Keine Cloudtelemetrie und kein Speichern von Prompts, Secrets,
  Gesundheitsdaten oder vollständigen Quellinhalten in Cost Receipts.
- Keine exakten Tokenkosten aus Prozentpunkten, Laufzeit oder Toolanzahl
  rekonstruieren.
- Keine Modellpolicy aus YouTube-Videos, Einzelläufen oder subjektivem Eindruck.
- Keine Garantie eines Graceful Stop, solange OpenAI keine belastbare
  Schnittstelle dafür bereitstellt.
- Kein Polling mitten in atomaren Blöcken.
- Keine verpflichtende VS-Code-Extension.
- Keine Zentralisierung über mehrere Repositories in dieser Roadmap.

## Ownership- und Statusledger

Der W6C-Endstand verwendet ausschließlich `ACTIVE`, `DEFERRED`, `REJECTED`
oder `POST_ROADMAP_CAMPAIGN`. Die früheren W0-Arbeitszustände bleiben in den
Wellenresultaten historisch nachvollziehbar.

<!-- markdownlint-disable MD013 -->

| ID | Thema | Finalstatus | Owner / Abschluss- oder Validierungspfad |
| --- | --- | --- | --- |
| GVN-001 | Sensor v3.1.0, Schema 3, Hash-/Freshness-Validator | `ACTIVE` | DEV_ENVIRONMENT und Sensor/Validator; W6 Regression; nur bei echter Schemaänderung migrieren |
| GVN-002 | Rainmeter als menschliche Anzeige | `ACTIVE` | DEV_ENVIRONMENT; Anzeige ohne Policyownership |
| GVN-003 | sichere Blockgrenzen, kein Mid-Block-Polling | `ACTIVE` | Workflow Contract; W6 Regression |
| GVN-004 | Rehydration als sunk usage | `ACTIVE` | Workflow Contract und W2-Fixtures |
| GVN-005A | Operational-/Full-Closure-Floors und Owner Boundary, aktive Semantik | `ACTIVE` | Workflow Contract; W6 Regression |
| GVN-005B | pure Berechnung der Floors und Admission | `ACTIVE` | Policy und W2-Fixtures |
| GVN-006A | Restricted-Work-Episode, Anti-Splitting und LIMIT, aktive Semantik | `ACTIVE` | Workflow Contract; W6 Regression |
| GVN-006B | pure Transitionen für Episode, Anti-Splitting und LIMIT | `ACTIVE` | Policy und W2-Fixtures |
| GVN-007 | pure Policy Engine und Blockdescriptor | `ACTIVE` | Guard-vNext-Policy und Schema |
| GVN-008 | dynamische Fenstertopologie einschließlich fehlendem 5h-Fenster | `ACTIVE` | Topologien werden dargestellt; unkalibrierte Profile bleiben fail-closed |
| GVN-009 | Resetjitter- und Sensorauflösungsvertrag | `ACTIVE` | Sensorauflösung ist gebunden; Resetidentität bleibt ohne unbewiesene Jitternormalisierung strikt |
| GVN-010A | bestehende manuelle Cost Receipts | `ACTIVE` | Workflow-/Evidence-Vertrag; W6 Regression |
| GVN-010B | maschinenlesbare Cost Receipts und konservative Cost Confidence | `ACTIVE` | striktes Schema, Policy und W2-Fixtures |
| GVN-011 | Advisory Lease / Parallelitätswarnung | `ACTIVE` | ausschließlich advisory; keine automatische Sperrwirkung |
| GVN-012 | Minimal Resume Working Set | `ACTIVE` | W3A |
| GVN-013A | manuelle Validated Context Reuse | `ACTIVE` | Workflow Contract; W6 Regression |
| GVN-013B | maschinenlesbare Context-Reuse-Klassifikation | `ACTIVE` | W3B; keine execution-beeinflussende Automation |
| GVN-014 | Validated Test Evidence Reuse | `ACTIVE` | W3B |
| GVN-015 | Verification Mise en Place | `ACTIVE` | W3C |
| GVN-016 | Evidence Manifest / Mutation Scope / Watchlist | `ACTIVE` | W3C; Protected-Descendant-Regression W6B |
| GVN-017 | ChatContextState | `ACTIVE` | ausschließlich beschreibend, keine automatische Admission |
| GVN-018 | optionale MICRO_TASK / automatische Fallbacksuche | `DEFERRED` | nicht aktiviert; neue Evidence und Ownerentscheidung erforderlich |
| GVN-019 | kontrollierter Modell-/Reasoning-Benchmark | `DEFERRED` | Pilot unvollständig geschlossen; ein späteres schlankes A.R.G.U.S. beginnt neu bei V1.0 |
| GVN-020 | ökologische C4-/R15-Messungen | `POST_ROADMAP_CAMPAIGN` | natürliche Folgeroadmaps; keine künstlichen Messblöcke |
| GVN-021 | automatische Chatwechsel-Empfehlung | `DEFERRED` | frühestens nach Benchmark plus C4/R15 neu entscheiden |
| GVN-022 | VS-Code-Extension | `DEFERRED` | neue Ownerentscheidung erforderlich |
| GVN-023 | Interrupt-/Graceful-Stop-Hook | `DEFERRED` | nur bei belastbarer Plattformunterstützung neu entscheiden |
| GVN-024 | automatische Testauslassung oder PASS-/DONE-Markierung | `REJECTED` | Workflow Contract; bleibt verboten |
| GVN-025 | automatische Tool-, Commit-, Deploy- oder Produktaktion | `REJECTED` | Workflow Contract; bleibt verboten |

<!-- markdownlint-enable MD013 -->

## Scope Freeze

Erlaubt:

- lokale Guard-Skripte, pure Policy-/Fixturedateien und fokussierte Tests,
- Roadmap-, Template-, Workflow-, AGENTS- und DEV_ENVIRONMENT-Sync,
- ein getrenntes Benchmarkkampagnen-Dokument,
- lokale, secretfreie Benchmark- und Cost-Receipts,
- Installation einer geänderten kanonischen Sensorkopie nur nach eigenem
  Owner-Gate und bytegleichem Postcheck.

Nicht erlaubt:

- MIDAS-Produktcode oder produktive Daten,
- Supabase, GitHub-Secrets, Deploys, Deviceaktionen, Commit oder Push ohne
  separaten Auftrag,
- ungefragte Änderung anderer Repositories,
- neue Extension-Arbeit,
- rückwirkende Änderung archivierter Roadmaps,
- Policyaktivierung vor Benchmark und W5-Gate.

Scopebruch führt zu Finding, sicherem Dokumentationsabschluss und Stop. Er wird
nicht als spontane Erweiterung dieser Roadmap behandelt.

## Referenzen

Verbindlich beziehungsweise für den jeweiligen Schritt autoritativ:

- `README.md`
- `AGENTS.md`
- `docs/DEV_ENVIRONMENT.md`
- `docs/templates/README.md`
- `docs/templates/MIDAS Roadmap Workflow Contract.md`
- `docs/templates/MIDAS Roadmap Template.md`
- `docs/templates/MIDAS Roadmap Evidence Template.md`
- `docs/Codex Usage Guard Evolution Notes.md`
- `tools/codex-usage/GetCodexUsage.ps1`
- `tools/codex-usage/Test-CodexUsageState.ps1`
- archivierte C3-/R14-Abschlussquellen nur für konkret referenzierte Postimages
  oder bei invalidiertem Evolution-Notes-Receipt.

Das spätere Benchmarkkampagnen-Dokument wird erst ab seiner in W4 fixierten
Revision zur autoritativen Quelle für Benchmarkresultate.

## Permission Matrix

<!-- markdownlint-disable MD013 -->

| Aktion | Zulassung |
| --- | --- |
| Relevante lokale Quellen lesen und fokussiert durchsuchen | autonom innerhalb der aktiven Welle |
| Roadmap, Evidence, Context Receipt, Findings und Evolution-Ledger synchronisieren | autonom in W0/W1 innerhalb Scope und Usage-Gate |
| Guard-Policy, Runtime, Fixtures und Tests ändern | autonom erst nach W1-Readiness |
| Lokale Tests, Parser, Linter und Shadow-Vergleiche ausführen | autonom innerhalb Scope und Usage-Gate |
| Modell-/Reasoning-Profil in der Codex-Oberfläche wechseln | Owneraktion in G-BENCHMARK |
| Installierte Rainmeter-Sensorkopie ändern | nur G-SENSOR-INSTALL |
| Aktive Guardpolicy umschalten | nur G-POLICY-ACTIVATE |
| CodeRabbit | nur W6/S5, 1 Initial + höchstens 1 Verifikation |
| MIDAS-Produktcode, Supabase, SQL, Deploy oder Device ändern | verboten |
| Commit oder Push | nur auf ausdrücklichen separaten Ownerauftrag |

<!-- markdownlint-enable MD013 -->

## Owner-Briefing-Bedarf

- W0-W4 benötigen kein zusätzliches Owner-Briefing, solange sie lokal,
  nichtproduktiv und innerhalb des eingefrorenen Scopes bleiben.
- G-BENCHMARK benötigt die Auswahl beziehungsweise Bestätigung der tatsächlich
  verfügbaren Modell-/Reasoning-Profile.
- G-POLICY-ACTIVATE benötigt den Vergleich von altem und neuem Orakel samt
  Rollback und offenen Low-Confidence-Bereichen.
- G-SENSOR-INSTALL ist nur bei realer Sensor-/Validatoränderung erforderlich.
- Bereits erklärte C3-/R14-Produktdetails werden nicht erneut aufgerollt.

## Canonical-Ownership-Matrix

Diese Matrix ist der verbindliche Sollvertrag für das Single-Definition-
Red-Team. Bis W5 darf eine bestehende aktive Duplikation als F-GUARD-01
dokumentiert bleiben. G-POLICY-ACTIVATE autorisiert die vorbereitete
Umschaltung; spätestens vor dem finalen vNext-Postimage muss jede aktive Regel
genau einen Definitionsowner besitzen.

<!-- markdownlint-disable MD013 -->

| Regelbereich | Einzige kanonische Definitionsquelle | Erlaubte Referenzstellen |
| --- | --- | --- |
| Sensortransport, State-Pfad, Schema, Sensorversion, Hash, Freshness und technischer Validatoraufruf | `docs/DEV_ENVIRONMENT.md` | AGENTS verweist auf Bedienvertrag; Workflow und Roadmap konsumieren nur validierten Output |
| Usage-Bands, Schwellen, Deltas, Reset-/Adjustment-Semantik und Safe Closure | `docs/templates/MIDAS Roadmap Workflow Contract.md` | AGENTS kurze Enforcement-Referenz; Templates Pflichtfelder; aktive Roadmap konkrete Messwerte |
| Operational-/Full-Closure-Floors, Preferred Reserve, Owner Boundary und POLICY_INFEASIBLE | `docs/templates/MIDAS Roadmap Workflow Contract.md` | AGENTS kurze Enforcement-Referenz; Roadmap konkrete blockbezogene Berechnung; Evolution Notes historische Evidence |
| Blockklassen, Primary Admission, Restricted-Work-Episode, Fallback, Anti-Splitting, BOUNDEDNESS_BREACH und LIMIT-Folge | `docs/templates/MIDAS Roadmap Workflow Contract.md` | AGENTS kurze Enforcement-Referenz; Templates Zustandsfelder; Roadmap aktueller Execution State |
| Context-Reuse-, Test-Evidence-Reuse- und Read-Completeness-Semantik | `docs/templates/MIDAS Roadmap Workflow Contract.md` | AGENTS Kurzregel; Roadmap Template Receiptfelder; Evidence Template Evidencefelder; aktive Roadmap konkrete IDs |
| Roadmapstruktur, Resume-, Context-, Usage- und Status-Pflichtfelder | `docs/templates/MIDAS Roadmap Template.md` | Template-README als Einstieg; aktive Roadmap ausgefüllte Instanz |
| Evidence-Lebenszyklus und Pflichtfälle | `docs/templates/MIDAS Roadmap Workflow Contract.md` | Evidence Template stellt Struktur; Roadmap benennt Owner und Pfad |
| Evidence-Felder, Invalidationstabelle und externer Reviewnachweis | `docs/templates/MIDAS Roadmap Evidence Template.md` | Workflow beschreibt nur Lebenszyklus; aktive Evidence enthält Werte |
| CodeRabbit-Phase und Reviewbudget | `docs/templates/MIDAS Roadmap Workflow Contract.md` | DEV_ENVIRONMENT definiert nur Installation und kanonischen Aufruf; AGENTS erzwingt kurz; Templates stellen Felder |
| MIDAS-Produktgrenze | `README.md` | AGENTS kurze verbindliche Produktregeln; Guard-Dokus verweisen nur auf Nichtwirkung |
| C3-/R14-Empirie, historische Receipts und zukünftige Designkandidaten | `docs/Codex Usage Guard Evolution Notes.md` | Roadmap referenziert GVN-IDs und übernommene Evidence; keine aktive Policy aus historischen Zahlen ableiten |
| Aktueller Wellen-, Finding-, Gate-, Usage- und Resume-Zustand | aktive Guard-vNext-Roadmap | Resume Card und optionale Evidence als zugehörige Instanzen; keine Template- oder Evolution-Notes-Rückschreibung als zweiter Zustand |

<!-- markdownlint-enable MD013 -->

Klassifikation jedes Fundorts:

- `CANONICAL_DEFINITION`: genau die oben benannte Quelle.
- `REFERENCE`: kurzer Verweis oder Enforcement ohne eigene alternative Formel.
- `EXECUTION_STATE`: konkrete Messung, Zulassung, Finding oder Entscheidung der
  aktiven Roadmap.
- `HISTORICAL_EVIDENCE`: datierte Beobachtung ohne normative Wirkung.
- `FUTURE_DESIGN`: ausdrücklich nicht aktive Zielidee.

Ein Fundort, der keine dieser Klassen eindeutig erfüllt, ist ein Contract-
Finding. Historische Zahlen dürfen ausführlich bleiben, müssen aber als
Evidence erkennbar sein.

## Entscheidungslog

<!-- markdownlint-disable MD013 -->

| ID | Datum | Entscheidung | Warum | Betrifft | Status |
| --- | --- | --- | --- | --- | --- |
| D-GUARD-01 | `2026-09-09` | Guard vNext wird direkt in einer Rolling-Wave-Roadmap umgesetzt; keine Pflicht-Unterroadmaps. | Ein gemeinsames Ziel, aber sichere Wellen. | W0-W6 | `ACCEPTED` |
| D-GUARD-02 | `2026-09-09` | Der Modellbenchmark bleibt eine getrennte, replizierte Kampagne und ein Gate vor Policykalibrierung. | Messvertrag und Policy dürfen sich während Runs nicht gegenseitig verändern. | W4/G-BENCHMARK/W5 | `ACCEPTED` |
| D-GUARD-03 | `2026-09-09` | Alle gesammelten Ideen werden entschieden, aber nicht blind aktiviert. | Deferred/Rejected sind kontrollierte Endzustände. | GVN-Ledger | `ACCEPTED` |
| D-GUARD-04 | `2026-09-09` | Aktive v3.1-Semantik wird als Regression übernommen und nicht neu erfunden. | Bewiesene Schutzwirkung erhalten. | W0-W2/W6 | `ACCEPTED` |
| D-GUARD-05 | `2026-09-09` | Mehrere Usage-Buckets sind zulässig; jede Welle bleibt kostenbewusst und sicher resumierbar. | Kein Qualitätsverlust durch künstlichen Ein-Bucket-Zwang. | alle Wellen | `ACCEPTED` |
| D-GUARD-06 | `2026-09-09` | C4 und R15 liefern ökologische Nachmessung, blockieren aber nicht den technischen vNext-Core-Abschluss. | Produktroadmaps bleiben echte Arbeit, keine künstlichen Benchmarks. | Post-Roadmap | `ACCEPTED` |
| D-GUARD-07 | `2026-09-09` | Die VS-Code-Extension und automatische Aktionsausführung bleiben außerhalb dieses Umbaus. | Zuerst Policy und Evidence stabilisieren. | Nicht-Scope | `ACCEPTED` |
| D-GUARD-08 | `2026-09-09` | Aktive Guardregeln erhalten je genau eine kanonische Definitionsquelle. | Semantische Drift zwischen Vertragsdateien verhindern. | W0/W5/W6B | `ACCEPTED` |
| D-GUARD-09 | `2026-09-09` | Eine separate Evidence-Datei wird in W1 angelegt. | Geplante Concurrency-, Migration- und Rollbacknachweise erfüllen den zentralen Evidence-Vertrag. | W1-W6 | `ACCEPTED` |
| D-GUARD-10 | `2026-09-09` | Evolution Notes sind vollständig nichtnormativ; Active-Angaben darin sind ausschließlich historische Snapshots. | Empirie erhalten, ohne eine zweite aktive Policydefinition zu erzeugen. | Notes/W0/W5/SDEF | `ACCEPTED` |
| D-GUARD-11 | `2026-09-09` | W1 friert eine einzige State Algebra ein und trennt Reuse-Klassifikation von execution-beeinflussender Automation. | Widersprüchliche Enums und vorzeitige Aktivierung verhindern. | W1-W3/W5/Post-Roadmap | `ACCEPTED` |
| D-GUARD-12 | `2026-09-10` | Gemischte GVN-Status werden in getrennte aktive Semantik und vNext-Projektion aufgelöst; jede Ledgerzeile besitzt exakt einen Status. | Bereits aktive Funktionen dürfen nicht als neue Implementierung erscheinen und Implementierungsownership darf nicht doppelt sein. | W0/W2/W3 | `ACCEPTED` |
| D-GUARD-13 | `2026-09-10` | Pre-W0-Fingerprintdrift invalidiert nur den alten Context Cache; die aktuellen Zielabschnitte wurden live gelesen und zeigen keinen Rückfall der geschlossenen Findings. | Der Dirty Stand enthält die bereits dokumentierten Reviewkorrekturen, nicht eine neue ungebundene Policy. | W0 Context Receipt / F-GUARD-07..10,12..28 | `ACCEPTED` |
| D-GUARD-14 | `2026-09-10` | W1 friert `guard-vnext/1`, Validator-Envelope, Blockdescriptor, Cost Receipt und die einzige State Algebra als nicht aktive Zieldefinition ein. | W2 benötigt einen deterministischen, schemafähigen Contract ohne Seiteneffekte oder rohe Sensorinputs. | W1-W4 | `ACCEPTED` |
| D-GUARD-15 | `2026-09-10` | Evidence-Klassifikation bleibt in W2-W4 rein Shadow/Advisory; automatische execution-beeinflussende Reuse bleibt Post-Roadmap. | Manuelle Workflow-Reuse schützen und F-GUARD-22 nicht erneut öffnen. | W3/W4/Post-Roadmap | `ACCEPTED` |
| D-GUARD-16 | `2026-09-10` | Cost Confidence verwendet nur exakt vergleichbare, störungsfreie, fingerprintgebundene Receipts; 0/1/2/3+ berechtigte Receipts ergeben konservativ NONE/LOW/DEVELOPING/ESTABLISHED. | Keine Confidence aus Parallelität, Unterbrechung, Reset-/Topologiedrift oder unpassender Arbeit ableiten. | W2C/W5 | `ACCEPTED` |
| D-GUARD-17 | `2026-09-10` | Nach W2B wird wegen ungültigem U5 kein W2C- oder Fallbackblock begonnen. | Fehlende valide Messlage erzwingt Safe Closure; der abgeschlossene W2B-Stand bleibt grün und resumierbar. | U5 / W2C | `ACCEPTED` |
| D-GUARD-18 | `2026-09-10` | U5R ersetzt ausschließlich den ungültigen Gatezustand; W2C akzeptiert nur störungsfreie, vollständig fingerprint- und resetgebundene Cost Receipts. Advisory Lease bleibt warnend, MICRO_TASK und automatische Fallbacksuche bleiben deaktiviert. | Keine Confidence aus unpassender Evidence und keine neue Ausführungswirkung vor Benchmark/Aktivierung. | U5R / W2C | `ACCEPTED` |
| D-GUARD-19 | `2026-09-10` | W3A beginnt bei U6 `CONTINUE_WITH_CAUTION` nicht. | Der bestätigte Contractmodul-/Schema-/Fixtureblock ist vollständig resumierbar, aber nicht kurz; es existiert kein vorab dokumentierter unabhängiger Kurz-Fallback. | U6 / W3A | `ACCEPTED` |
| D-GUARD-20 | `2026-09-10` | Das Minimal Resume Working Set speichert nur kompakte Metadaten und Fingerprints; Chat Context State bleibt beschreibend und unvollständige Pflichtreads blockieren die Resume-Readiness. | Rehydration darf weder Quellinhalte/Chatnarrative duplizieren noch `TRUNCATED`, `PARTIAL` oder `FAILED` als ausreichenden Nachweis behandeln. | W3A | `ACCEPTED` |
| D-GUARD-21 | `2026-09-10` | Tier A verlangt Live-Read, Tier B erlaubt nur vollständig fingerprintgebundene validierte Reuse und Tier C verlangt Original-Read on demand; jede Klassifikation bleibt Shadow/Advisory. | Validity, Quality und Failure Class dürfen weder vermischt noch zur automatischen Änderung bestehender Allowed Actions verwendet werden. | W3B | `ACCEPTED` |
| D-GUARD-22 | `2026-09-10` | Verification Mise en Place hält Evidence Manifest, Mutation Scope und Out-of-Block Watchlist als getrennte Strukturen; Finding-only, neue Failure Class, Scope Breach und Dirty Stop beenden den Block ohne Diagnose oder Repair. | Sichere Resume-Grenzen dürfen nicht durch implizite Zusatzarbeit oder Watchlist-Mutationen verwischt werden. | W3C | `ACCEPTED` |
| D-GUARD-23 | `2026-09-10` | Der Validator erhält ausschließlich einen opt-in `-Envelope`-Pfad; ohne Switch bleiben Legacy-JSON und Exitcodevertrag erhalten. Shadow Compare hält Legacy als aktive Quelle und kann nur advisory divergieren. | Migration messbar vorbereiten, ohne den aktiven Guard oder den installierten Sensor umzuschalten. | W4A | `ACCEPTED` |
| D-GUARD-24 | `2026-09-10` | W4B erzeugt nur fingerprintgebundene Forward-/Rollbackpläne; beobachtete aktive Policy und Validator-Default bleiben Legacy, Sensorinstallation und Policycutover sind verboten. | Migration und Rückfall beweisen, ohne die spätere Aktivierungsentscheidung vorwegzunehmen. | W4B | `ACCEPTED` |
| D-GUARD-25 | `2026-09-10` | `codex-model-benchmark-v1.0` friert Prompt, Contract, Korpus, Goldstandard, Scorer sowie Profilmanifest-, Run- und Ergebnisreceipt-Schemas mit einem reproduzierten Campaign Fingerprint ein; Profile und tatsächliche Runs bleiben owner-gated. | Messvertrag vor der Profilwahl stabilisieren, ohne Modellwechsel, Run oder Guardwirkung in W4. | W4C / G-BENCHMARK | `ACCEPTED` |
| D-GUARD-26 | `2026-09-10` | Der Abschlussreview ersetzt die ungestartete V1.0 durch A.R.G.U.S. V1.1, trennt Guard Conformance und Document Work als Sichtbarkeitsklassen und vertagt unbrauchbares Warm/Long Context. | Die allgemeine Entscheidungsfrage verlangt dokumentenbasierte Fähigkeiten, leakage-freie Rollen und vergleichbares Fixed Work; V1.0 bleibt historische Null-Run-Evidence. | W4C / G-BENCHMARK | `ACCEPTED` |
| D-GUARD-27 | `2026-09-10` | ARGUS-R14..R23 ersetzen V1.1 vor Run 1 durch V1.2. Exaktes Stage-Inventar liefert operative Inputisolation, nicht OS-Sicherheit; Profile A/B und A/B/B/A sind ownerseitig eingefroren, Run 01 nur vorbereitet. | Phasenvalidierung, Usage-Attribution, Response-/Receipt-Striktheit und Scorearithmetik müssen vor jedem Run ausführbar sein; V1.0/V1.1 bleiben Null-Run-Historie. | G-BENCHMARK | `ACCEPTED` |
| D-GUARD-28 | `2026-09-11` | ARGUS-R24..R33 ersetzen V1.2 vor Run 1 durch V1.3. Response-Ingestion, vollständige Hashkette, Usage Eligibility und Campaign Result werden ausführbar gebunden. | V1.0-V1.2 bleiben Null-Run-Historie; semantische Bewertung bleibt Scorerarbeit; kein Run im Orchestratorchat. | G-BENCHMARK | `ACCEPTED` |
| D-GUARD-29 | `2026-09-11` | ARGUS-R34..R37 ersetzen V1.3 vor Run 1 durch V1.4. Jeder begonnene Attempt bleibt als Erfolg, Modellfehler oder technischer Incident sichtbar; Campaign-Dokument und Stage werden neu gebunden; Entscheidungen benötigen mehr als 5,0 Punkte Abstand. | V1.0-V1.3 bleiben Null-Run-Historie; technische Attempts werden nicht als Modellqualität gezählt; praktische Gleichwertigkeit allein löst keinen dritten Run aus. | G-BENCHMARK | `ACCEPTED` |
| D-GUARD-30 | `2026-09-13` | Der Owner beendet den A.R.G.U.S.-V1.2-V1.6-Piloten nach einem vollständigen, aber ungescorten V1.6-Tested-Agent-Lauf als `BENCHMARK_INCOMPLETE` und lässt W5/W6 mit `GPT-5.6 Sol / High` als `OWNER_SELECTED` fortsetzen. | Weitere Control-Plane-Komplexität steht nicht mehr im Verhältnis zum praktischen Nutzen; es gibt weder Vergleichsentscheidung noch Benchmarkgewinner oder negative Aussage über GPT-6 Astra. | G-BENCHMARK/W5/W6 | `OWNER_OVERRIDE_ACCEPTED` |
| D-GUARD-31 | `2026-09-13` | Die drei W6B-Reviewfindings werden vor Abschluss minimal geschlossen; Schema-Parität wird regressiv geprüft und Protected Paths gelten einschließlich ihrer Nachfahren. | False Rejects kanonischer Inputs, zu schwache Receipts und Scope-False-Passes sind mit dem aktiven Guard unvereinbar. | W6B / F-GUARD-29..31 | `ACCEPTED` |
| D-GUARD-32 | `2026-09-13` | KASRKIN und A.R.G.U.S. erhalten getrennte kompakte Context Bridges; KASRKINs bestehende Evolution Notes bleiben die einzige historische Entwicklungschronik. | Ein frischer Chat braucht Statuswahrheit und Zukunftsgrenze, ohne Tooling-Extraktion oder ein neues A.R.G.U.S. vorwegzunehmen. | W6C / docs/modules | `ACCEPTED` |

<!-- markdownlint-enable MD013 -->

## Owner-Gates

### G-BENCHMARK

Stephan wählt zuerst die tatsächlich verfügbaren Modell-/Reasoning-Profile.
Danach darf der Orchestrator ein reales Profilmanifest und die gegengewichtete
Reihenfolge erzeugen und zur ownerseitigen Bindung vorlegen. Erst eine spätere,
separate Owneraktion startet die unabhängigen Benchmark-Chats. Der Agent darf
kein UI-Modell umschalten oder fehlende Modellmetadaten erfinden.

Der Owner hat den Pilot am `2026-09-13` vor einer vergleichenden Auswertung
beendet. Der additive Closure-Record
`docs/benchmark/codex-model-benchmark-v1/pilot-closure.json` erhält die
eingefrorenen V1.6-Bindungen und klassifiziert den Stand als
`ARGUS_PILOT_CLOSED_INCOMPLETE / NO_COMPARATIVE_DECISION`. Dieser Override
schließt ausschließlich das W5-Gate. Er ist kein Benchmark-PASS und keine
Modellrangliste.

### G-POLICY-ACTIVATE

Vor der Umschaltung von Shadow/Advisory auf die aktive Guard-vNext-Policy erhält
Stephan ein kurzes Briefing mit:

- Benchmarkresultat und Wiederholbarkeit,
- altem gegen neuem Entscheidungsorakel,
- Migrations- und Rollbackpfad,
- offenen Low-Confidence-Bereichen,
- unveränderten Produkt-/Security-Grenzen.

### G-SENSOR-INSTALL

Nur falls der kanonische Sensor oder Validator geändert wird, wird die Kopie im
Rainmeter-Benutzerprofil nach expliziter Freigabe installiert und anschließend
bytegleich sowie frisch validiert. Reine Policydateien benötigen diesen Gate
nicht.

## Statusmatrix

<!-- markdownlint-disable MD013 -->

| Welle | Ziel | Status | Pflichtpostcondition |
| --- | --- | --- | --- |
| W0 | Baseline, Fingerprints und finales Ideenledger | `PASS_2026-09-10` | Ist/Plan/Deferred ohne Doppelownership; W0 Full Review PASS |
| W1 | Zielcontract, Risiken, Fixtures, Evidence und Ausführungsblöcke | `READY_WITH_GATES_2026-09-10` | S4R Readiness PASS; Evidence aktiv; W2A-W4C bestätigt |
| W2 | Pure Policy Engine und Usage-/Cost-Zustände | `PASS_2026-09-10` | Core 24/24, Topologie 12/12 und Cost 12/12 grün; vollständige W2-Regression PASS |
| W3 | Resume-, Context-, Evidence- und Verification-Verträge | `PASS_2026-09-10` | Resume 15/15, Evidence 19/19 und Verification 12/12; W3 gesamt 46/46 |
| W4 | Shadow Mode und Benchmark-V1-Readiness | `PASS_2026-09-10` | Envelope/Shadow 13/13, Migration/Rollback 12/12 und A.R.G.U.S. V1.4 grün; kein Run |
| G-BENCHMARK | getrennte replizierte Kampagne | `ARGUS_PILOT_CLOSED_INCOMPLETE / OWNER_OVERRIDE_ACCEPTED / NO_COMPARATIVE_DECISION` | V1.6-Run-01-Evidence bleibt ungescort; keine weiteren Runs; kein Benchmarkgewinner |
| W5 | Kalibrierung, Migration und aktive Vertragsumschaltung | `PASS_2026-09-13 / GUARD_VNEXT_ACTIVE` | 111 bestehende Fälle + Aktivierung 8/8; SDEF-001 PASS; Legacy-Rollback grün |
| W6A | integrierte lokale Testmatrix | `PASS_2026-09-13` | 119/119; Parser 14/14; Guard-JSON 23/23; Runtime `759651d8...bf5e` |
| W6B | Full Review, Korrektur und invalidierte Nachläufe | `PASS_2026-09-13` | drei Findings geschlossen; gezielte Regression 118/118; CodeRabbit-Verifikation 0 Findings; SDEF-002 PASS |
| W6C | Doku, Abschluss-Sync und Archivierung | `PASS_2026-09-13` | Sources of Truth synchron; KASRKIN-/A.R.G.U.S.-Context ready; Guard-Roadmap/Evidence archiviert |
| C4/R15 | ökologische Nachmessung | `POST_ROADMAP_CAMPAIGN` | Feedback, keine Voraussetzung für vNext-Core-DONE |

<!-- markdownlint-enable MD013 -->

## Findings-Register

<!-- markdownlint-disable MD013 -->

| ID | Severity | Typ | Finding | Status | Entscheidung / Zielschritt |
| --- | --- | --- | --- | --- | --- |
| F-GUARD-01 | `P1` | Contract | Aktive Guardsemantik war teilweise außerhalb des Workflow Contracts detailliert beschrieben, obwohl sie genau einen kanonischen Owner benötigt. | `CLOSED_W5_2026-09-13` | Workflow Contract ist alleiniger Detailowner; AGENTS und DEV_ENVIRONMENT wurden auf kurze Enforcement-/Sensorreferenzen reduziert; SDEF-001 PASS. |
| F-GUARD-02 | `P1` | Contract | Der kontrollierte Benchmark besaß kein eingefrorenes Kampagnendokument und Ergebnisreceipt. | `CLOSED_W4C_REVIEWED_2026-09-10` | Die ungestartete V1.0 wurde nach `ARGUS-R01..R13` durch V1.1 mit getrennten Suites, Visibility/Rollen, zehnteiligem Corpus, Schemas und Fingerprints ersetzt; G-BENCHMARK blockiert W5 bis zum echten Ergebnis. |
| F-GUARD-03 | `P1` | Contract/Code | Dynamische Abwesenheit eines 5h-Fensters war Designwissen, aber kein bewiesener Validator-/Policyvertrag. | `CLOSED_W4B_2026-09-10` | Pure Policyprofile, opt-in Validator-Envelope, Shadowchain und Legacy-Rollback sind lokal belegt; keine Aktivierung. |
| F-GUARD-04 | `P2` | QA | Cost Confidence, Resetjitter und Advisory Lease besitzen noch keine grünen Fixtures. | `CLOSED_W2_2026-09-10` | Confidence/Eligibility und rein warnende Lease sind grün; Reset-ID-Wechsel bleibt strikt `RESET_CROSSED`, MICRO_TASK/Auto-Fallback bleiben deferred. |
| F-GUARD-05 | `P1` | Contract/QA | Context-/Test-Evidence-Reuse war dokumentiert, aber nicht als maschinenlesbare Klassifikation und Advisory bewiesen. | `CLOSED_W3_2026-09-10` | W3A-W3C belegen Resume, getrennte Klassifikation und Verificationvertrag; automatische execution-beeinflussende Empfehlung bleibt post-roadmap deaktiviert. |
| F-GUARD-06 | `Watchlist` | Measurement | Lange Chats korrelieren plausibel mit Rehydrationskosten, besitzen aber keine ausreichende kontrollierte Messbasis. | `DEFERRED_POST_ROADMAP` | Der unvollständig geschlossene Pilot liefert keine kontrollierte Vergleichsbasis; C4/R15 bleiben natürliche spätere Beobachtung und blockieren W5/W6 nicht. |
| F-GUARD-07 | `P2` | Roadmap | Status, Vor-Benchmark-Modell und maximaler autonomer Endpunkt waren nicht templatekonform eindeutig. | `FIXED_2026-09-09` | Metadaten und Startkarte korrigiert. |
| F-GUARD-08 | `P1` | Evidence | Geplante Concurrency-/Rollbacknachweise waren trotz zentralem Evidence-Vertrag ohne Evidence-Datei geplant. | `FIXED_2026-09-09` | Evidence-Datei wird verpflichtend in W1 vor W2 angelegt. |
| F-GUARD-09 | `P1` | Contract | Evolution Notes legten C4 einmal vorzeitig auf GPT-6 High fest und nannten die Extension trotz Aufschub als direkten Folgeschritt. | `FIXED_2026-09-09` | Benchmark entscheidet C4-Profil; Extension bleibt owner-deferred. |
| F-GUARD-10 | `P2` | Roadmap | Resume Card und Abschlussplan enthielten keinen vollständigen Single-Definition-Red-Team-Vertrag. | `FIXED_2026-09-09` | Resume verweist auf Register; `SDEF-PRE-001`, `SDEF-001`, `SDEF-002` und Ownership-Matrix ergänzt. |
| F-GUARD-11 | `Watchlist` | Doku | Evolution Notes überschreiten mit rund 100 KB und deutlich über 1200 Zeilen den Größenprüfpunkt. | `ACCEPTED_W0_REVIEW_CONFIRMED` | W0 fand historische Wiederholungen, aber keine zweite aktive Policy: globale Non-Normative-Grenze und operative Kurzquelle sind eindeutig. Kein riskanter Umbau; W6 prüft Navigation erneut. |
| F-GUARD-12 | `P1` | Contract | Der Single-Definition-Nachweis war nur im finalen Review geplant, obwohl W5 bereits aktive Vertragsdateien umschaltet. | `FIXED_2026-09-09` | `SDEF-001` prüft unmittelbar den W5-Zielstand; `SDEF-002` bestätigt das finale technische Postimage in W6B. |
| F-GUARD-13 | `P2` | Review | Der CodeRabbit-Ausfallpfad benannte den Evidence Gap, schloss aber eine improvisierte Ersatzinstallation nicht ausdrücklich aus. | `FIXED_2026-09-09` | W6B verweist nun eindeutig auf den kanonischen Aufruf und verbietet eine improvisierte Ersatzroute. |
| F-GUARD-14 | `P1` | Contract | Evolution Notes bezeichneten AGENTS, DEV_ENVIRONMENT, Workflow Contract und Ausführungsartefakte als pauschale Rangfolge statt als getrennte Zuständigkeiten. | `FIXED_2026-09-09` | Zuständigkeiten und Konfliktverhalten explizit an die Canonical-Ownership-Matrix angeglichen. |
| F-GUARD-15 | `P1` | Permission | Die Permission Matrix erlaubte selbst Roadmap-/Evidence-Sync erst nach W1-Readiness und kollidierte damit mit W0/W1. | `FIXED_2026-09-09` | Execution-Dokumentation ist in W0/W1 zulässig; Policy-, Runtime-, Fixture- und Teständerungen erst nach Readiness. Quelle: EXT-01. |
| F-GUARD-16 | `P1` | Single Definition | Evolution Notes enthielten trotz historischer Klassifikation normativ klingende aktive Vertragsblöcke. | `FIXED_2026-09-09` | Globale Non-Normative-Grenze ergänzt, konkrete Active-Core-/Restricted-Work-Passagen als historische Snapshots markiert und F-GUARD-01 erweitert. Quelle: EXT-02. |
| F-GUARD-17 | `P1` | State Contract | Eine ältere Fünf-Dimensionen-Skizze verwendete ein zweites Telemetry-/Outcome-Modell. | `FIXED_2026-09-09` | Als `SUPERSEDED_DESIGN_SNAPSHOT / DO_NOT_IMPLEMENT` markiert; W1 friert allein die provisorische Zielmatrix ein. Quelle: EXT-03. |
| F-GUARD-18 | `P1` | State Contract | `BOUNDEDNESS_BREACH` besaß keinen eindeutigen State-Owner. | `FIXED_2026-09-09` | Als `ContractViolation` statt Execution Outcome verortet; W1 muss diese Zuordnung einfrieren. Quelle: EXT-04. |
| F-GUARD-19 | `P1` | Evidence | Validität, Qualität und neue Failure Class waren in widersprüchlichen Enumlisten vermischt. | `FIXED_2026-09-09` | `EvidenceValidity`, `EvidenceQuality` und `FailureClassRelation` getrennt. Quelle: EXT-05. |
| F-GUARD-20 | `P1` | Topology | `NO_USAGE_WINDOWS -> NOT_APPLICABLE` besaß kein eigenes maschinenlesbares Zuhause. | `FIXED_2026-09-09` | `UsageApplicability` getrennt; `UsageBand` existiert nur bei `APPLICABLE`. Quelle: EXT-06. |
| F-GUARD-21 | `P1` | Input | Der Begriff validierter Sensor-Snapshot schloss die zu verarbeitenden Invalid-/Stale-/Partial-/Limit-Ergebnisse logisch aus. | `FIXED_2026-09-09` | Policyinput ist ein vom Validator erzeugtes Telemetrie-Envelope; rohe Sensorobjekte bleiben ausgeschlossen. Quelle: EXT-07. |
| F-GUARD-22 | `P1` | Activation | Reuse-Klassifikation und automatische execution-beeinflussende Reuse-Empfehlung hatten keine scharfe Aktivierungsgrenze. | `FIXED_2026-09-09` | Shadow-/Advisory-Klassifikation ist vNext; automatische Empfehlung bleibt bis nach Benchmark und C4/R15 `POST_ROADMAP_CAMPAIGN`. Quelle: EXT-08. |
| F-GUARD-23 | `P2` | Model | Reasoning-Metadaten erlaubten Medium, während die Startkarte W0-W4 auf High festlegte. | `FIXED_2026-09-09` | W0-W4 einheitlich High, niemals höher; andere Profile nur in der ownergewählten Kampagne oder nach Kalibrierung. Quelle: EXT-09. |
| F-GUARD-24 | `P2` | Measurement | W0 bezeichnete jedes Startgate pauschal als Post-Rehydration-Baseline. | `FIXED_2026-09-09` | Nur tatsächlicher Fresh-/Rehydration-Einstieg erhält diesen Zustand; sonst regulärer Checkpoint. Quelle: EXT-10. |
| F-GUARD-25 | `P2` | Ownership | Instruktionshierarchie und Canonical Ownership waren in den Evolution Notes mehrdeutig kombiniert. | `FIXED_2026-09-09` | Externe Hierarchie bleibt bindend; innerhalb der Repo-Dokumente entscheidet der Regelbereichsowner, Abweichung ist Finding. Quelle: EXT-11. |
| F-GUARD-26 | `P2` | Calibration | W5 koppelte Modellbenchmark und Cost Confidence ohne Vergleichbarkeitsgrenze. | `FIXED_2026-09-09` | Benchmark kalibriert Profile; Cost Confidence stammt nur aus passenden störungsfreien Cost Receipts. Quelle: EXT-12. |
| F-GUARD-27 | `P2` | Roadmap | Der maximale autonome Endpunkt übersprang sprachlich W6A/W6B. | `FIXED_2026-09-09` | Metadaten nennen nun den Weg durch W6A/W6B bis W6C samt Gates. Quelle: EXT-13. |
| F-GUARD-28 | `P3` | Wording | W0-PASS verlangte für bereits aktive, vertagte oder verworfene Ideen fälschlich ein späteres Gate. | `FIXED_2026-09-09` | Gefordert sind Owner, Status und Abschluss- oder Validierungspfad. Quelle: EXT-14. |
| F-GUARD-29 | `P1` | Schema/Single Definition | Das Policy-Input-Schema akzeptierte strengere Telemetriegrenzen als das kanonische Telemetrie-Envelope und konnte dadurch kanonisch gültige Inputs abweisen. | `CLOSED_W6B_2026-09-13` | Kanonisches Envelope und Consumer besitzen dieselben Window-Grenzen; ACT-07 bindet die semantische Parität regressiv. |
| F-GUARD-30 | `P1` | Schema/Contract | Der im Policy-Input eingebettete Cost-Receipt-Vertrag war schwächer als das kanonische Receipt-Schema. | `CLOSED_W6B_2026-09-13` | Pflichtfelder, Topologie-Enum, strikte Checkpoints/Deltas und `additionalProperties: false` sind angeglichen; ACT-08 verhindert erneuten Drift. |
| F-GUARD-31 | `P1` | Scope/Safety | Der Verification-Builder erkannte nur den exakt geschützten Pfad, nicht dessen Nachfahren, als Scope-Verstoß. | `CLOSED_W6B_2026-09-13` | Protected-Path-Prüfung verwendet dieselbe Segmentpräfixsemantik wie Allowed Paths; FX-X25 beweist den geschützten Unterpfad. |

<!-- markdownlint-enable MD013 -->

## W0 - G0/S1 Baseline und Ledger-Freeze

Ziel: den realen aktiven Guard vom Zukunftsbacklog trennen, ohne bestehende
Semantik neu zu implementieren.

1. Usage-Gate ausführen. Nur nach tatsächlichem Fresh-/Rehydration-Einstieg als
   `POST_REHYDRATION_BASELINE` protokollieren; andernfalls als regulären
   Baseline- oder Continuation-Checkpoint.
2. Git-Baseline, Dirty Boundary und SHA-256 der relevanten Guard-/Vertragsdateien
   erfassen.
3. Aktiven Sensor-, Validator-, Workflow-, Template- und AGENTS-Vertrag
   symbol- und abschnittsbezogen lesen.
4. Das Ownership- und Statusledger gegen Code und Dokumente prüfen.
5. Jede Abweichung als `ALREADY_ACTIVE`, `PARTIAL`, `PLANNED`, `DEFERRED` oder
   `REJECTED` dokumentieren; keine Idee erhält zwei Implementierungsowner.
6. Finale R14-Receipts nur über die Evolution Notes und archivierte
   Abschlussquelle fingerprintbinden; keine R14-Testmatrix erneut ausführen.
7. Context Receipt, Findings, Statusmatrix und Resume Card synchronisieren.
8. Full Contract Review für W0; nur berechtigte Inkonsistenzen korrigieren.

W0 PASS, wenn der bestehende v3.1-Kern unverändert reproduzierbar beschrieben
ist und jede bekannte Idee genau einen Owner, Status und Abschluss- oder
Validierungspfad besitzt.

### Ergebnis W0

Status: `PASS_2026-09-10`.

- `W0-B01`: HEAD `52010c7b778e24018975e4dd0e1a9fd2a60fd690`
  und die vollständige Dirty Boundary sind im Context Receipt gebunden;
  fremde Laufzeit- und R15-Dateien blieben unangetastet.
- `W0-B02`: Der kanonische Sensor und die installierte Kopie sind bytegleich
  (`3d8f8601...37c8d1`); Sensor `3.1.0`, Schema `3` und Validatorausgabe wurden
  mit U1 real bestätigt. Beide PowerShell-Dateien parsen ohne Fehler.
- `W0-B03`: Die Pre-W0-Fingerprintabweichungen invalidierten nur den alten
  Cache. Aktuelle Vertragsregionen wurden live gelesen; F-GUARD-07 bis
  F-GUARD-10 und F-GUARD-12 bis F-GUARD-28 bleiben ohne Drift geschlossen.
- `W0-B04`: Das GVN-Ledger besitzt nach D-GUARD-12 je Zeile genau einen Status,
  einen Owner und einen Abschluss- oder Validierungspfad. Bereits aktive
  Semantik ist getrennt von ihrer späteren puren Policyprojektion.
- `W0-B05`: R14-Evidence `75/11` für den erfolgreichen atomaren Cutover bis zur
  sicheren Produkt-/Datenpostcondition und `13/2` für die getrennte S6-Closure
  wurde fingerprintgebunden übernommen. Keine R14-Matrix wurde wiederholt.
- `W0-B06`: F-GUARD-01 bleibt W5 zugeordnet; F-GUARD-02 W4;
  F-GUARD-03/-04 W2; F-GUARD-05 W3; F-GUARD-06 Benchmark plus C4/R15;
  F-GUARD-11 bleibt akzeptierte Doku-Watchlist.

Nativer Full Review: `PASS`. Contract: keine Doppelownership im Ledger und
kein zweites aktives Policywort in den Evolution Notes. Security/Privacy:
keine Secrets, Prompts, Health-Payloads oder Roh-State-Snapshots aufgenommen.
Scope: ausschließlich Roadmap und Evolution-Ledger; keine Guard-Policy-,
Runtime-, Fixture-, Test-, Produkt-, Supabase-, Deploy- oder Deviceänderung.
Restrisiko: F-GUARD-01 blockiert weiterhin erst W5/G-POLICY-ACTIVATE, nicht W1.

## W1 - S2/S3/S4R Zielcontract und Readiness

Ziel: die lokale Umsetzung in sichere, kleine, resumierbare Blöcke schneiden.

1. Input-/Outputschema der puren Policyfunktion festlegen.
2. Blockdescriptor definieren: Klasse, Scopefingerprint, Runtime-Fingerprint,
   erwartete Arbeit, Pflichtpostcondition, Success-/Rollback-Closure,
   Reversibilität, Owner-Gates und erlaubte Toolklassen.
3. Cost-Receipt-Schema definieren, ohne Prompt-, Secret-, Gesundheits- oder
   vollständige Quellinhalte.
4. Eine einzige State-Algebra-Tabelle mit `Dimension`, `Allowed values`,
   `Meaning`, `Owner`, `Input/Output`, `Illegal combinations` und
   `Transition events` einfrieren. Sie muss mindestens Telemetry Result,
   Window Topology, Usage Applicability, Usage Band, Floor Feasibility,
   Preferred Reserve, Primary Admission, Restricted Episode, Allowed Actions,
   Contract Violation, Execution Outcome, Read Completeness, Evidence Validity,
   Evidence Quality, Failure Class Relation und Chat Context enthalten.
5. Insbesondere `BOUNDEDNESS_BREACH` ausschließlich als Contract Violation,
   `NOT_APPLICABLE` als Usage Applicability, `FINAL_RESPONSE_ONLY` als erlaubte
   Action Class und `NEW_FAILURE_CLASS` als Failure Class Relation verorten.
   Evidence Validity, Evidence Quality und Failure Class bleiben getrennt.
6. Backwards-Compatibility und Migration von Sensor v3.1.0/Schema 3 festlegen.
7. `docs/Codex Usage Guard vNext Rolling-Wave Evidence.md` aus dem
   Evidence-Template anlegen und diese Roadmap als Evidence-Owner binden.
8. Fixturekatalog für erlaubte und verbotene Kombinationen erstellen.
9. W2-W4 in kohärente Blöcke mit Usage-Gates und sicheren Postconditions
   finalisieren.
10. Aufwand nicht aus Dateianzahl ableiten; Reads, Toolinteraktionen,
   Regressionen, Review und Abschluss berücksichtigen.
11. Native Contract-, Security-, Privacy-, Scope- und Migrationsreview.

W1 endet wie S4R mit `READY`, `READY_WITH_GATES` oder `BLOCKED`. Nur die
bestätigten W2-Blöcke dürfen danach autonom beginnen.

### W1-Zielcontract `guard-vnext/1`

Status: `FROZEN_FOR_W2_W4 / NOT_ACTIVE`. Dieser Vertrag ist die
implementierbare Zieldefinition bis G-BENCHMARK. Er ändert weder die aktive
Workflowpolicy noch den Validator v3.1.0/Schema 3. Die pure Policy führt keine
Tools aus, liest oder schreibt keine Dateien und erzeugt keine Zeitstempel,
IDs, Hashes oder Zufallswerte; alle entscheidungsrelevanten Werte werden als
Input übergeben und die Ausgabe ist für bytegleich kanonisierten Input
deterministisch.

#### Policy-Inputschema

Pflichtobjekt `GuardPolicyInputV1`:

<!-- markdownlint-disable MD013 -->

| Feld | Typ / erlaubte Werte | Vertrag |
| --- | --- | --- |
| `contractVersion` | exakt `guard-vnext/1` | unbekannte Version fail-closed |
| `evaluationId` | nichtleerer, nichtsensibler String | vom Caller erzeugt und nur gespiegelt |
| `evaluationTime` | ISO-8601 mit Offset | nur für Freshness-/Leasevergleich; nie intern erzeugen |
| `telemetryEnvelope` | `TelemetryEnvelopeV1` | ausschließlich vom kanonischen Validator erzeugt; rohe Sensorobjekte verboten |
| `block` | `BlockDescriptorV1` | der exakt zu admissionierende Block |
| `workflow` | `WorkflowStateV1` | letzter Checkpoint, Episode, Owner-/Contract-Gates und optionale Fallbackentscheidung |
| `costReceipts` | Array `CostReceiptV1` | ausschließlich secretfreie, fingerprintgebundene Receipts; leeres Array erlaubt |
| `evidenceItems` | Array `EvidenceItemV1` | optional für Shadow-/Advisory-Klassifikation; beeinflusst in W2-W4 keine Ausführung |
| `policyConfig` | `PolicyConfigV1` | versionierte Schwellen, Sensorauflösung und bereits kalibrierte Topologieprofile; keine stillen Defaults |

<!-- markdownlint-enable MD013 -->

`TelemetryEnvelopeV1` enthält `envelopeVersion = guard-telemetry/1`,
`producer = Test-CodexUsageState.ps1`, `producerFingerprint`,
`telemetryResult`, `measuredAt`, `ageSeconds`, `sourceSchemaVersion`,
`sourceSensorVersion`, `topologyProfile`, eine sortierte `windows`-Liste und
höchstens nicht-sensitive `validationCodes`. Ein Fenster enthält `id`,
`state`, `windowDurationMins`, `remaining`, `used` und `resetAtEpoch`.
Messwerte existieren ausschließlich bei `state = ACTIVE`; `NOT_OFFERED` besitzt
keinen erfundenen Rest- oder Resetwert. Das Envelope kann `VALID`, `INVALID`,
`STALE`, `PARTIAL` oder `LIMIT` melden. Ein Parser- oder Prozessfehler ohne
authentisches Validator-Envelope bleibt ein äußerer Validatorfehler und darf
nicht als synthetisches `VALID` in die Policy gelangen.

`PolicyConfigV1` hält für `DUAL_WINDOW` die aktive Bandsemantik `>40/>20`,
`25-40/10-20` und `<25/<10`, den Sensorpuffer `1` sowie explizite
`calibratedTopologyProfiles`. `WEEKLY_ONLY` und `FIVE_HOUR_ONLY` sind bis zu
einer eigenen Kalibrierung nicht enthalten und enden deshalb fail-closed.
`NO_USAGE_WINDOWS` ist ausdrücklich `NOT_APPLICABLE` und besitzt kein
`UsageBand`.

#### Blockdescriptor

`BlockDescriptorV1` enthält ausschließlich Metadaten, keine Prompts oder
Quellinhalte:

<!-- markdownlint-disable MD013 -->

| Feld | Pflichtvertrag |
| --- | --- |
| `descriptorVersion`, `blockId` | exakt `guard-block/1`; stabile, nicht-sensitive ID |
| `class` | `BOUNDED_DOCUMENTATION`, `BOUNDED_LOCAL`, `DISCOVERY_BOUNDED`, `DIAGNOSTIC_UNBOUNDED`, `INTEGRATED_REVIEW`, `PRODUCTIVE_CUTOVER` oder `CLOSURE_ONLY` |
| `riskClass` | `R1`, `R2` oder `R3` |
| `descriptorFingerprint` | SHA-256 über den vollständigen kanonisierten Descriptor ohne dieses Feld |
| `scopeFingerprint` | SHA-256 über kanonische Pfad-/Vertragsliste, nie über Secret- oder Payloadwerte |
| `runtimeFingerprint` | selektive Hash-/Versionsmap für relevante Producer, Consumer, Harness, Oracle, Runtime und Lifecycle; `NOT_APPLICABLE` je irrelevanter Dimension |
| `workProfile` | erwartete lokale Toolklassen, Reviewtiefe, Remote-/Browser-/Devicewirkung und Größenklasse `SMALL`, `MEDIUM` oder `LARGE` |
| `postconditions` | nichtleere `success`, `rollback` oder `NOT_APPLICABLE` sowie immer ein `minimalResumeFact` |
| `reversibility` | `REVERSIBLE`, `ROLLBACK_REQUIRED` oder `IRREVERSIBLE_OWNER_GATED` |
| `ownerGates` | sortierte `required`- und `satisfied`-IDs; fehlende Pflicht-ID blockiert |
| `allowedToolClasses` | geschlossene sortierte Liste; die Policy führt sie niemals selbst aus |
| `fallback` | höchstens ein vorab definierter unabhängiger `BOUNDED_DOCUMENTATION`-/`BOUNDED_LOCAL`-Block oder `null` |
| `comparisonKey` | Hash aus Blockklasse, Scope-/Runtimefingerprints, Modell-/Reasoningnachweis, Context State, Toolprofil, Reviewtiefe, Topologie und Closurevertrag |

<!-- markdownlint-enable MD013 -->

#### Cost-Receipt-Schema und Confidence

`CostReceiptV1` ist lokal, secret- und gesundheitsdatenfrei. Es enthält:
`receiptVersion`, `receiptId`, `roadmapId`, `blockId`, `blockClass`,
`descriptorFingerprint`, `comparisonKey`, `runtimeFingerprint`,
`topologyProfile`, angefordertes sowie beobachtetes Modell/Reasoning oder
`NOT_OBSERVABLE`, `chatContextState`, grobe `toolClasses`, `reviewDepth`,
Start-/Endcheckpoint je aktivem Fenster mit `remaining` und `resetAtEpoch`,
`delta`, `attribution`, `parallelUsage`, `interruptionState`,
`executionOutcome`, `postconditionReached`, `closureIncluded`, optionale echte
`closureOnlyDelta`, sortierte Evidence-IDs und nicht-sensitive
`invalidationCodes`. Verboten sind Prompts, Secrets, Token/JWT-Werte,
Gesundheitsdaten, vollständige Quelltexte, Terminaldumps und aus Prozenten
rekonstruierte Tokenzahlen.

Ein Receipt ist für Kostenvergleich nur `ELIGIBLE`, wenn `comparisonKey`,
Scope-/Runtime-/Producer-/Consumer-/Harness-/Oracle-Fingerprints und Topologie
exakt passen, alle Deltas innerhalb unveränderter Resetidentitäten liegen,
`parallelUsage = EXCLUDED`, `interruptionState = NONE`, Attribution
`BLOCK_ONLY` oder `CONTROLLED_EXPERIMENT` lautet und eine sichere operative
Postcondition belegt ist. Alle anderen Receipts bleiben Evidence, sind aber
`INELIGIBLE_FOR_COST_CONFIDENCE`.

Confidence wird ausschließlich aus solchen vergleichbaren, störungsfreien und
fingerprintgebundenen Receipts berechnet: `NONE` bei 0; `LOW` bei 1 oder bei
widersprüchlichen Wiederholungen; `DEVELOPING` bei 2 mit höchstens einem
Prozentpunkt Spannweite je aktivem Fenster; `ESTABLISHED` ab 3 mit derselben
Spannweitengrenze. Ein Topologie-, Reset-, Fingerprint-, Outcome- oder
Closure-Mismatch senkt die Zahl berechtigter Receipts, statt Werte zu mitteln.
Der Floor verwendet weiterhin den höchsten berechtigten vollständigen
Verbrauch; Confidence schwächt keinen statischen Gatevertrag.

#### Policy-Outputschema

`GuardPolicyDecisionV1` enthält `contractVersion`, `evaluationId`,
`telemetryResult`, `windowTopology`, `usageApplicability`, optional genau ein
`usageBand`, `operationalFloorFeasibility`,
`preferredReserveAvailability`, `primaryAdmission`,
`restrictedWorkEpisode`, eine sortierte Menge `allowedActionClasses`,
`contractViolation`, `executionOutcome = NOT_STARTED`, `chatContextState`,
`costConfidence`, berechnete empirische und effektive Floors je aktivem
Fenster, `preferredReserve`, `usageTransition` mit Event und ausschließlich
bei vergleichbaren Checkpoints vorhandenen Deltas, sortierte stabile
`reasonCodes`, `advisories` und eine rein informative `evidenceAssessment`.
Die Ausgabe enthält keine Aktion und kein Kommando. Bei `LIMIT` ist
`allowedActionClasses` exakt
`[FINAL_RESPONSE_ONLY]`.

#### Einzige State Algebra

Die folgende Tabelle ist für W2-W4 die einzige vollständige Zustandsalgebra.
Ältere Skizzen in den Evolution Notes bleiben superseded beziehungsweise
nichtnormativ.

<!-- markdownlint-disable MD013 -->

| Dimension | Allowed values | Meaning | Owner | Input/Output | Illegal combinations | Transition events |
| --- | --- | --- | --- | --- | --- | --- |
| Telemetry Result | `VALID`, `INVALID`, `STALE`, `PARTIAL`, `LIMIT` | Ergebnis des kanonischen Validators im Envelope | Validator | Input; unverändert gespiegelt | rohe Sensorwerte; `INVALID`/`STALE`/`PARTIAL` mit `PRIMARY_ALLOWED`; `LIMIT` mit weiterer Aktion | `VALIDATION_SUCCEEDED`, `VALIDATION_FAILED`, `FRESHNESS_EXPIRED`, `SOURCE_PARTIAL`, `LIMIT_REACHED` |
| Window Topology | Fensterstatus `ACTIVE`, `NOT_OFFERED`, `UNKNOWN`, `INVALID`, `STALE`; Profile `DUAL_WINDOW`, `WEEKLY_ONLY`, `FIVE_HOUR_ONLY`, `NO_USAGE_WINDOWS`, `UNSUPPORTED_TOPOLOGY` | reale angebotene und gültige Usage-Fenster | Validator für Fensterstatus; Policy für Profil | Inputstatus / Outputprofil | `NOT_OFFERED` mit Messwert; unbekanntes Fenster still ignoriert; Delta über Profilwechsel | `WINDOW_DISCOVERED`, `WINDOW_WITHDRAWN`, `WINDOW_INVALID`, `WINDOW_STALE`, `WINDOW_TOPOLOGY_CHANGED` |
| Usage Applicability | `APPLICABLE`, `NOT_APPLICABLE` | ob eine Usage-Band-Entscheidung existiert | Policy | Output | `NOT_APPLICABLE` außer bei validem `NO_USAGE_WINDOWS`; `NOT_APPLICABLE` mit Usage Band | `NO_USAGE_WINDOWS_CONFIRMED`, `USAGE_WINDOWS_AVAILABLE` |
| Usage Band | `CONTINUE`, `CONTINUE_WITH_CAUTION`, `SAFE_CLOSURE`; bei `NOT_APPLICABLE` nicht vorhanden | Budgetzustand, nicht Blockzulassung | Policy nach Workflow Contract | Output optional | vorhanden bei `NOT_APPLICABLE`; `CONTINUE` aus unkalibrierter oder ungültiger Topologie | `THRESHOLD_EVALUATED`, `TELEMETRY_FAIL_CLOSED`, `TOPOLOGY_UNCALIBRATED` |
| Operational Floor Feasibility | `FEASIBLE`, `POLICY_INFEASIBLE`, `NOT_APPLICABLE` | Erreichbarkeit der sicheren operativen Postcondition | Policy | Output | `POLICY_INFEASIBLE` mit Owner-Boundary-Zulassung; `FEASIBLE` ohne berechtigte Basis, wenn ein empirischer Floor beansprucht wird | `FLOOR_COMPUTED`, `FLOOR_EXCEEDS_CAPACITY`, `USAGE_NOT_APPLICABLE` |
| Preferred Reserve Availability | `AVAILABLE`, `PREFERRED_UNATTAINABLE`, `NOT_APPLICABLE` | advisory Erreichbarkeit von max(1,5x, Full Closure) | Policy | Output | `PREFERRED_UNATTAINABLE` als Hard Stop; `AVAILABLE` ohne berechenbaren Wert | `PREFERRED_COMPUTED`, `PREFERRED_EXCEEDS_CAPACITY`, `USAGE_NOT_APPLICABLE` |
| Primary Admission | `PRIMARY_ALLOWED`, `PRIMARY_OWNER_BOUNDARY_ALLOWED`, `PRIMARY_REJECTED_FOR_RESERVE`, `PRIMARY_REJECTED_FOR_CONTRACT` | Zulassung des exakt beschriebenen Primärblocks | Policy | Output | Owner Boundary außerhalb `CONTINUE`, unter effektivem Operational Floor, ohne passende Receipts oder ohne erfüllte Owner-/Contract-Gates | `GATES_EVALUATED`, `RESERVE_EVALUATED`, `OWNER_BOUNDARY_ACCEPTED`, `CONTRACT_REJECTED` |
| Restricted Work Episode | `AVAILABLE`, `CONSUMED`, `NOT_APPLICABLE` | höchstens ein bounded Block bei Caution oder Reserveablehnung | Caller-State / Policyprüfung | Input und Output | zweiter bounded Block bei `CONSUMED`; Episode ohne Reset-IDs; neue Episode ohne Reset/Adjustment oder `CONTINUE + PRIMARY_ALLOWED` | `CAUTION_ENTERED`, `PRIMARY_RESERVE_REJECTED`, `BOUNDED_BLOCK_STARTED`, `RESET_CROSSED`, `ADJUSTMENT`, `FULL_ADMISSION_RESTORED` |
| Allowed Action Classes | Teilmenge der Blockklassen sowie `CLOSURE_ONLY`, `FINAL_RESPONSE_ONLY` | einzige nach der Entscheidung erlaubte Arbeitsklasse | Policy | Output | `FINAL_RESPONSE_ONLY` mit jedem anderen Wert; neue Major-Arbeit bei `SAFE_CLOSURE`; vertragsumgehender Fallback | `ADMISSION_DECIDED`, `SAFE_CLOSURE_ENTERED`, `LIMIT_REACHED` |
| Contract Violation | `NONE`, `BOUNDEDNESS_BREACH` | Verletzung der vorab gebundenen Blockgrenze | Caller meldet; Policy erzwingt Folge | Input und Output | `BOUNDEDNESS_BREACH` als Execution Outcome; Breach mit stiller Fortsetzung | `SCOPE_EXPANDED`, `TOOL_CLASS_EXPANDED`, `INVALIDATION_BOUNDARY_BROKEN`, `SAFE_LOCAL_STOP_RECORDED` |
| Execution Outcome | `NOT_STARTED`, `COMPLETED_SUCCESS`, `ROLLED_BACK_SAFE`, `FINDING_ONLY`, `SAFE_CLOSURE`, `DIRTY_STOP` | Ergebnis eines Blocks, getrennt von Vertragsverletzung | Executor/Receipt | Input in Receipts; Output initial `NOT_STARTED` | Erfolg ohne Pflichtpostcondition; Rollback ohne Daten-/Runtimepostcheck; `BOUNDEDNESS_BREACH` | `BLOCK_STARTED`, `POSTCONDITION_PROVED`, `ROLLBACK_PROVED`, `FINDING_RECORDED`, `DIRTY_STOP_RECORDED` |
| Read Completeness | `COMPLETE`, `FOCUSED_COMPLETE`, `TRUNCATED`, `PARTIAL`, `FAILED` | technische Vollständigkeit eines Reads | Reader/Context Receipt | Input in Evidence Assessment; Outputklassifikation | `TRUNCATED`/`PARTIAL`/`FAILED` als alleinige ausreichende Quelle | `READ_FINISHED`, `OUTPUT_TRUNCATED`, `FOLLOWUP_READ_COMPLETED`, `READ_FAILED` |
| Evidence Validity | `VALID`, `INVALIDATED`, `MISSING` | Bindung der Evidence an aktuelle Inputs/Fingerprints | Evidence Classifier | Input und Advisory-Output | Reuse bei `INVALIDATED`/`MISSING`; Vermischung mit Quality oder Failure Class | `FINGERPRINT_MATCHED`, `INVALIDATION_TRIGGERED`, `EVIDENCE_NOT_FOUND` |
| Evidence Quality | `COMPLETE`, `PARTIAL`, `STALE`, `AMBIGUOUS` | Beweiskraft bei gegebener Validität | Evidence Classifier | Input und Advisory-Output | `COMPLETE` allein macht invalidierte Evidence wiederverwendbar; Quality als Validity | `COVERAGE_EVALUATED`, `FRESHNESS_EXPIRED`, `CONTRADICTION_FOUND`, `FOLLOWUP_EVIDENCE_ADDED` |
| Failure Class Relation | `KNOWN_COVERED`, `NEW_FAILURE_CLASS` | Verhältnis des aktuellen Fehlers zum bewiesenen Oracleumfang | Evidence Classifier | Input und Advisory-Output | `NEW_FAILURE_CLASS` mit Reuse der betroffenen Evidence oder spontaner Repairfortsetzung | `FAILURE_MATCHED`, `NEW_FAILURE_DETECTED`, `NEW_GATE_OPENED` |
| Chat Context State | `FRESH_MINIMAL`, `WARM_BOUNDED`, `LONG_RUNNING`, `COMPACTED_OR_UNKNOWN` | beschreibende Contextklasse, keine Admission | Caller / Receipt | Input; gespiegelt | automatische Ausführungssperre oder Chatwechselzwang allein aus diesem Zustand | `CHAT_STARTED`, `BOUNDED_CONTINUATION`, `LONG_RUN_THRESHOLD_OBSERVED`, `COMPACTION_OR_STATE_UNKNOWN` |

<!-- markdownlint-enable MD013 -->

Evidence-Validität, Evidence-Qualität und Failure-Class-Relation werden je
Evidence-ID getrennt gespeichert. Guard vNext darf sie im Shadow-/Advisory-
Receipt maschinenlesbar klassifizieren; diese Klassifikation verändert in
W2-W4 keine Ausführung. Die bestehende manuelle Evidence Reuse folgt weiterhin
dem Workflow Contract. Eine automatische execution-beeinflussende
Reuse-Empfehlung bleibt bis nach Benchmark und C4/R15
`POST_ROADMAP_CAMPAIGN`.

#### Backwards-Compatibility und Migration

1. Sensor v3.1.0, Schema 3, installierter Sensorpfad und bestehender
   Validator-Defaultoutput bleiben bis G-SENSOR-INSTALL unverändert.
2. W2 arbeitet ausschließlich mit statischen `TelemetryEnvelopeV1`-Fixtures;
   keine Sensor- oder Validatoränderung.
3. W4 ergänzt am kanonischen Validator einen expliziten opt-in Envelope-Modus.
   Der Defaultmodus bleibt byte- und exitcodekompatibel für bestehende
   Consumer. `VALID` mappt Schema 3 verlustfrei auf `DUAL_WINDOW`; `LIMIT`
   bleibt LIMIT. Invalid, stale und partial werden nur aus realen
   Validatorbefunden klassifiziert, nie aus geratenen Rohobjekten.
4. Der Shadow Runner konsumiert ausschließlich den opt-in Validatoroutput und
   schreibt keine aktive Policydatei. Legacyentscheidung und vNext-Entscheidung
   werden auf demselben Input verglichen.
5. Rollback vor Aktivierung: Shadow Runner und neue Guard-Dateien entfernen
   beziehungsweise ignorieren und den unveränderten Validator-Defaultpfad
   weiterverwenden. Keine Sensorinstallation ist für W2-W4 erforderlich.
6. Jede Änderung an der installierten Sensorkopie bleibt G-SENSOR-INSTALL;
   jede aktive Guard-Umschaltung bleibt G-POLICY-ACTIVATE nach Benchmark/W5.

#### Fixturekatalog

<!-- markdownlint-disable MD013 -->

| ID | Welle | Fall | Erwartung |
| --- | --- | --- | --- |
| FX-A01 | W2A | valides Dual Window im Continue-Band, Floors erfüllt | `PRIMARY_ALLOWED` |
| FX-A02 | W2A | Caution, bounded Block, Episode verfügbar | genau dieser Block erlaubt; Episode danach `CONSUMED` |
| FX-A03 | W2A | Caution, Episode bereits verbraucht | nur `CLOSURE_ONLY` |
| FX-A04 | W2A | Primärblock unter Reserve, unabhängiger dokumentierter Fallback | Primärblock gesperrt; höchstens ein Fallback |
| FX-A05 | W2A | `LIMIT` | exakt `FINAL_RESPONSE_ONLY` |
| FX-A06 | W2A | `INVALID`, `STALE` oder `PARTIAL` | `SAFE_CLOSURE`, keine Primärzulassung |
| FX-A07 | W2A | Rehydration ohne kanonischen Vorcheckpoint | Baseline, kein erfundenes Delta |
| FX-A08 | W2A | gleicher Reset und sinkender Restwert | nichtnegatives Delta |
| FX-A09 | W2A | Resetwechsel | `RESET_CROSSED`, neue Baseline |
| FX-A10 | W2A | Restwertanstieg bei gleichem Reset | `ADJUSTMENT`, kein negativer Verbrauch |
| FX-A11 | W2A | Preferred über 100, Floors erreichbar | `PREFERRED_UNATTAINABLE` advisory; zulässige Admission bleibt |
| FX-A12 | W2A | Operational Floor über Kapazität | `POLICY_INFEASIBLE`, Primärblock gesperrt |
| FX-A13 | W2A | gültige Owner Boundary | nur im Continue-Band zwischen effektivem Operational-/Full-Closure-Floor |
| FX-A14 | W2B | `NO_USAGE_WINDOWS` ausdrücklich validiert | `NOT_APPLICABLE`, kein Usage Band |
| FX-A15 | W2B | Weekly-only oder Five-hour-only ohne Kalibrierung | fail-closed `SAFE_CLOSURE` |
| FX-A16 | W2B | unbekanntes Fenster oder nicht beweisbares Fehlen | `UNSUPPORTED_TOPOLOGY`, fail-closed |
| FX-A17 | W2B | Topologiewechsel und Wiedererscheinen mit neuer Reset-ID | neue Baseline, kein Delta über Wechsel |
| FX-A18 | W2C | 0/1/2/3 passende störungsfreie Receipts | `NONE/LOW/DEVELOPING/ESTABLISHED` nach Confidence-Regel |
| FX-A19 | W2C | parallele Nutzung, Interruption oder Fingerprintmismatch | Receipt nicht confidence-berechtigt |
| FX-A20 | W2C | Advisory Lease | höchstens Warnung; keine Sperre oder Quotenbehauptung |
| FX-A21 | W2C | MICRO_TASK / automatische Fallbacksuche | standardmäßig inaktiv; keine Ausführungswirkung |
| FX-A22 | W2A | identischer kanonischer Input mehrfach | bytegleich kanonisierte Ausgabe; keine Datei-/Toolwirkung |
| FX-X01 | W2A | rohes Sensorobjekt statt Envelope | Schemafehler, fail-closed |
| FX-X02 | W2B | `NOT_APPLICABLE` zusammen mit Usage Band | Contractfehler |
| FX-X03 | W2A | `LIMIT` zusammen mit weiterer Action Class | Contractfehler |
| FX-X04 | W2A | `BOUNDEDNESS_BREACH` als Execution Outcome | Schemafehler; nur Contract Violation zulässig |
| FX-X05 | W2A | ungültige Telemetrie mit `PRIMARY_ALLOWED` | Contractfehler |
| FX-X06 | W2A | `SAFE_CLOSURE` mit neuem Major Block | Contractfehler |
| FX-X07 | W2A | Contractablehnung mit Fallbackumgehung | Contractfehler |
| FX-X08 | W3B | invalidierte oder fehlende Evidence als reused | Reuse abgelehnt |
| FX-X09 | W2C | Erfolg/Rollback ohne Pflichtpostconditions | Cost Receipt nicht berechtigt |
| FX-X10 | W3A | `TRUNCATED` als alleinige ausreichende Quelle | Reuse/Resume abgelehnt |
| FX-X11 | W2A | zweiter bounded Block derselben Episode | Contractfehler |
| FX-X12 | W2B | `NOT_OFFERED` mit Rest-/Resetwert | Schemafehler |
| FX-X13 | W2A | Delta über Reset- oder Topologiewechsel | Vergleich abgelehnt |
| FX-X14 | W2C | Confidence aus gestörten oder nicht passenden Receipts | Confidence bleibt `NONE`/`LOW` gemäß berechtigter Teilmenge |
| FX-X15 | W3B | `NEW_FAILURE_CLASS` mit automatischer Reuse | Evidence invalidiert; Finding-only und neues Gate |
| FX-X16 | W3B | Advisory-Reuse verändert Allowed Actions | Contractfehler |
| FX-X17 | W2A | Policy versucht Tool-/Datei-/Netzwerkaktion | Testfehler; keine Policyausgabe gültig |

<!-- markdownlint-enable MD013 -->

#### S4R-Aufwand, bestätigte Blöcke und Invalidation Map

Gesamtgröße W2-W4: `large` über mehrere getrennte Usage-Buckets. Grund sind
nicht primär Dateizahlen, sondern Schema- und State-Implementierung,
deterministische Fixturematrix, Migrationskompatibilität, Shadowvergleich,
native Reviews, Evidence-/Resume-Sync und der eingefrorene Benchmarkvertrag.
Keine Browser-, Device-, Remote-, Supabase-, SQL-, Deploy- oder Produktwirkung;
CodeRabbit bleibt W6/S5 vorbehalten. W2-W4 laufen ausschließlich mit dem
angeforderten Profil GPT-5.6 Sol / High; der tatsächliche Runtimezustand bleibt
`NOT_OBSERVABLE`.

<!-- markdownlint-disable MD013 -->

| Block | Klasse / Dateien | Inhalt | Pflichtchecks und lokale sichere Postcondition | Gate danach |
| --- | --- | --- | --- | --- |
| W2A | `BOUNDED_LOCAL`; Policymodul, Input-/Outputschema, Core-Fixtures, Test-Runner | pure Kernzustände, Floors, Bands, Episode, LIMIT, Determinismus | PowerShell-Parse; Schemafixtures; FX-A01..A13, A22, X01, X03..X07, X09, X11, X13, X17 grün; keine Seiteneffekte; Evidence/Resume synchron | Usage-Gate vor W2B |
| W2B | `BOUNDED_LOCAL`; Policymodul, Topologieschema/-fixtures, Runner | dynamische Topologie, Applicability, Reset/Adjustment | FX-A14..A17, X02, X12 und betroffene W2A-Regression grün; Dual-Window-Kompatibilität erhalten | Usage-Gate vor W2C |
| W2C | `BOUNDED_LOCAL`; Policymodul, Cost-Receipt-Schema/-fixtures, Runner | Eligibility, Confidence, Advisory Lease; MICRO_TASK bleibt aus | FX-A18..A21, X14 und komplette W2-Fixturematrix grün; keine harte Lease/Automation; W2-Postimage resumierbar | Usage-Gate vor W3A |
| W3A | `BOUNDED_LOCAL`; Contractmodul, Resume-/Contextschema, Fixtures | Minimal Resume Working Set und Read Completeness | FX-X10 plus Fresh/Warm/Long/Unknown- und Dirty-Stop-Resume-Fixtures grün; keine Quellinhalte im Receipt | Usage-Gate vor W3B |
| W3B | `BOUNDED_LOCAL`; Contractmodul, Evidence-Schema/-fixtures | getrennte Validity/Quality/Failure-Class-Klassifikation | FX-X08, X15, X16 sowie Match-/Mismatch-Matrix grün; Ausführungsausgabe unverändert | Usage-Gate vor W3C |
| W3C | `BOUNDED_LOCAL`; Verification-Mise-en-Place-Builder und Fixtures | Manifest, Mutation Scope, Watchlist, Required/Expensive/Exit | synthetischer Finding-only-/Dirty-Stop-/Resume-Roundtrip grün; keine Diagnose oder Repair angehängt | Usage-Gate vor W4A |
| W4A | `BOUNDED_LOCAL`; Validator opt-in Envelope, Shadow Runner, Kompatibilitätsfixtures | v3.1/Schema-3-Adapter und Legacy/vNext-Compare | Legacy-Defaultoutput unverändert; Envelopeklassen grün; Shadow schreibt keine aktive Policy | Usage-Gate vor W4B |
| W4B | `BOUNDED_LOCAL`; Migration-/Rollbackfixtures und Evidence | Forward-/Rollbackvorbereitung ohne Aktivierung | Legacy→Envelope→Shadow und Rückfall auf Legacy PASS; keine Sensorinstallation, kein Policycutover | Usage-Gate vor W4C |
| W4C | `BOUNDED_DOCUMENTATION`; Benchmarkkampagnendokument, Roadmap/Evidence | Korpus, Prompt, Goldstandard, Scorer, Reihenfolge und Receipt-Schema einfrieren | Fingerprints vollständig; kein Run; Roadmap `WAITING_FOR_BENCHMARK`; exakter G-BENCHMARK-Resume | Stop vor G-BENCHMARK |

<!-- markdownlint-enable MD013 -->

Vor jedem Tabellenblock gilt ein kanonisches Usage-Gate. Unter Caution darf
höchstens der exakt nächste Block laufen, wenn er kurz, reversibel und mit
vollständiger Postcondition admissioniert ist; andernfalls Safe Closure. Kein
Primärblock wird zur Reservekosmetik geteilt. Ein neuer Finding-only-Block mit
`NEW_FAILURE_CLASS` endet nach Finding-, Evidence- und Resume-Sync; Diagnose
oder Repair benötigt ein neues Gate.

Invalidation Map:

- Änderung an Policyinput, State Algebra oder Blockdescriptor invalidiert alle
  nachgelagerten W2-W4-Schema- und Entscheidungsfixtures.
- Änderung an Topologie-/Resetsemantik invalidiert W2B, betroffene W2A-
  Admissionfälle, Cost-Vergleichbarkeit und den W4-Adapter.
- Änderung am Cost-Receipt-/Confidencevertrag invalidiert W2C und alle daraus
  abgeleiteten Reserve-/Shadowaussagen, nicht historische R14-Rohreceipts.
- Änderung an Resume-/Evidence-Schema oder Failure-Class-Regel invalidiert nur
  W3 und die entsprechende W4-Receiptprojektion; manuelle Workflow-Reuse bleibt
  aktiv und wird nicht automatisch neu gedeutet.
- Änderung am Validator, Envelopeadapter oder Schema 3 invalidiert W4A/W4B und
  jedes Shadowreceipt; sie löst keine Sensorinstallation ohne G-SENSOR-INSTALL
  aus.
- Änderung an Benchmarkkorpus, Prompt, Goldstandard oder Scorer invalidiert
  W4C-Fingerprints und alle späteren Runs ab dieser Revision.
- Änderungen nur an Roadmap-/Evidence-Ausführungsstatus invalidieren keine
  grüne Fixtureevidence, sofern Contract- und Sourcefingerprints gleich bleiben.

#### W1-Readiness-Urteil

Ergebnis: `READY_WITH_GATES`.

Begründung: Input, Output, Blockdescriptor, Cost Receipt, eine einzige State
Algebra, Migration, erlaubte/verbotene Fixtures, W2-W4-Blöcke, Postconditions
und Invalidation sind vollständig und ohne offene P0/P1-Lücke für W2A
festgelegt. Die Gates sind die kanonischen Usage-Checks vor jedem Block,
F-GUARD-02 vor W5 durch W4C/G-BENCHMARK, G-SENSOR-INSTALL nur bei einer später
tatsächlich zu installierenden Sensorkopie und G-POLICY-ACTIVATE erst nach
Benchmark/W5. F-GUARD-01 blockiert weiterhin nur die aktive Umschaltung.

Nativer W1 Full Review: `PASS`. Contract: alle Pflichtdimensionen besitzen
genau einen State-Owner; `BOUNDEDNESS_BREACH`, `NOT_APPLICABLE`,
`FINAL_RESPONSE_ONLY` und `NEW_FAILURE_CLASS` sind eindeutig verortet.
Security/Privacy: Schemas verbieten Secrets, Prompts, Gesundheitsdaten und
Quell-/Terminaldumps. Scope: rein lokale Guard-/Dokumentarbeit. Migration:
Schema 3 und Validator-Default bleiben kompatibel, Envelope und Shadow sind
opt-in. Single Definition: Workflow Contract bleibt aktiver Policyowner;
dieser Abschnitt ist bis W5 nur eingefrorener vNext-Zielcontract, Evolution
Notes bleiben nichtnormativ. Die Evidence-Datei ist aktiv und an diese Roadmap
gebunden.

## W2 - S4 Pure Policy Engine

Ziel: Admission zentral berechnen, ohne irgendeine Arbeit selbst auszuführen.

### W2A - Kernzustände

- Pure Policyfunktion und versionierte Schemas implementieren.
- Bestehende `CONTINUE`, `CONTINUE_WITH_CAUTION`, `SAFE_CLOSURE`, `LIMIT`,
  Owner-Boundary-, Anti-Splitting- und Infeasible-Semantik abbilden.
- Rehydration nur als Net-Baseline beziehungsweise bewiesenes Same-Reset-Delta
  behandeln.
- Operational und Full Closure strikt trennen.
- `PREFERRED_UNATTAINABLE` advisory halten.

#### Ergebnis W2A

Status: `PASS_2026-09-10`.

- Neue pure Policy: `CodexUsageGuard.Policy.psm1`; keine Tool-, Datei-,
  Netzwerk- oder Zeitschreibwirkung.
- Versionierte JSON-Schemas für `GuardPolicyInputV1` und
  `GuardPolicyDecisionV1`; rohe Sensorobjekte werden fail-closed abgelehnt.
- Core-Fixtures: `24/24 PASS`, einschließlich LIMIT/
  `FINAL_RESPONSE_ONLY`, Restricted Episode, Floors, Owner Boundary,
  `POLICY_INFEASIBLE`, `PREFERRED_UNATTAINABLE`, Rehydration, Reset,
  Adjustment, Boundedness und Determinismus.
- PowerShell-Parser `0` Fehler; alle drei JSON-Dateien parsebar;
  Whitespacechecks `0`; Seiteneffektwächter `false`.
- Native Delta-/Contract-/Security-/Privacy-/Scope-Review: `PASS`. Während der
  Implementierung wurde `descriptorFingerprint` als vom `scopeFingerprint`
  getrennte Bindung präzisiert und `usageTransition` im Output ergänzt; dies
  schließt die bereits geplanten W1-Fixtures, ohne neue Failure Class.

### W2B - Topologie und Messqualität

- dynamische Bucketliste unterstützen;
- vorhandenes 5h+weekly-Verhalten unverändert als Kompatibilitätsfixture;
- fehlendes oder aufgehobenes 5h-Fenster nur bei valide erkannter Topologie
  korrekt behandeln;
- stale, partial, contradictory und unknown weiterhin fail-closed behandeln;
- Auflösung und Resetjitter über explizite Fixtures prüfen;
- keine Toleranz aktivieren, die einen echten Resetwechsel verschluckt.

#### Ergebnis W2B

Status: `PASS_2026-09-10`.

- `DUAL_WINDOW` bleibt unverändert kompatibel; `WEEKLY_ONLY` und
  `FIVE_HOUR_ONLY` bleiben mangels eigener Kalibrierung sichtbar fail-closed.
- `NO_USAGE_WINDOWS` ergibt ausschließlich bei explizitem Validatornachweis
  `UsageApplicability = NOT_APPLICABLE` und keinen `UsageBand`; andere Gates
  bleiben wirksam.
- Unbekannte Fenster und unbewiesenes Fehlen ergeben
  `UNSUPPORTED_TOPOLOGY`; `NOT_OFFERED` mit Messwert wird als Contractfehler
  abgewiesen.
- W2B `12/12 PASS`; W2A-Regression `24/24 PASS`; Parserfehler `0`,
  Determinismus und Seiteneffektfreiheit bestätigt.
- Native Delta-/Consumer-/Contract-/Security-/Privacy-/Scope-Review: `PASS`;
  keine Resetjitter-Toleranz aktiviert, jeder Reset-ID-Wechsel bleibt
  `RESET_CROSSED`.

### W2C - Kosten, Confidence und Parallelität

- Cost Receipts klassifizieren und vergleichbare Blöcke fingerprintbinden;
- `LOW`, `DEVELOPING`, `ESTABLISHED` nur anhand festgelegter Mindestbelege
  berechnen;
- unzureichende oder widersprüchliche Daten als `LOW` belassen;
- Advisory Lease höchstens als Warnung implementieren, falls lokale
  Parallelität zuverlässig erkannt wird;
- MICRO_TASK und automatische Fallbacksuche nur aktivieren, wenn Boundedness,
  Exit und Restricted-Episode-Fixtures vollständig grün sind; sonst vertagen.

Pflichtpostcondition: Eine statische Fixturematrix beweist identische Ausgaben
bei identischen Inputs, alle verbotenen Kombinationen enden fail-closed und
keine Funktion besitzt Seiteneffekte.

#### Ergebnis W2C

Status: `PASS_2026-09-10`.

- Cost Receipts sind nur bei identischem Comparison Key, Descriptor sowie
  Runtime-, Producer-, Consumer-, Harness- und Oracle-Fingerprint berechtigt.
  Start-/Endcheckpoint müssen dieselbe Resetidentität und den angegebenen
  nichtnegativen Delta besitzen; Parallelität, Unterbrechung oder Drift
  schließen das Receipt von Confidence und Floors aus.
- `NONE`, `LOW`, `DEVELOPING` und `ESTABLISHED` sind mit 0/1/2/3 passenden
  Receipts belegt; widersprüchliche berechtigte Receipts bleiben `LOW`.
- Advisory Lease erzeugt nur `POSSIBLE_PARALLEL_USAGE` und verändert die
  Admission nicht. MICRO_TASK und automatische Fallbacksuche sind schema- und
  runtime-seitig deaktiviert und als deferred Advisory sichtbar.
- W2C `12/12 PASS`; vollständige Regression W2A `24/24`, W2B `12/12`;
  Parserfehler `0`, alle Schemas/Fixtures JSON-parsebar, Determinismus und
  Seiteneffektfreiheit bestätigt.
- Native Delta-/Consumer-/Contract-/Security-/Privacy-/Scope-Review: `PASS`.
  Historische R14-Receipts bleiben gültige Evidence, werden ohne die neuen
  Vergleichsfingerprints aber nicht als Cost-Confidence-Input fingiert.

## W3 - S4 Resume, Context und Evidence

Ziel: Rehydration und Verifikation reduzieren, ohne Informations- oder
Qualitätsverlust.

### W3A - Minimal Resume Working Set

- kompaktes, fingerprintgebundenes Schema für Ziel, aktuellen Schritt,
  unveränderliche Verträge, Dirty Boundary, gültige Evidence, Invalidation,
  Owner-Gates und exakten Resume-Punkt implementieren;
- vollständige Quellinhalte und historische Chatnarrative ausschließen;
- partial/truncated Reads als nicht ausreichend kennzeichnen;
- Fresh-, Warm-, Long-running- und Unknown-Context beschreibend erfassen.

#### Ergebnis W3A

Status: `PASS_2026-09-10`.

- `guard-resume/1` bindet Ziel, aktuellen Schritt, unveränderliche
  Vertragsfingerprints, Dirty Boundary, gültige Evidence, Invalidation,
  Owner-Gates und den exakten Resume-Punkt ohne Quelltext oder Chatnarrativ.
- `FRESH_MINIMAL`, `WARM_BOUNDED`, `LONG_RUNNING` und
  `COMPACTED_OR_UNKNOWN` bleiben rein beschreibend und besitzen keine
  Admissionwirkung.
- Erforderliche Reads mit `TRUNCATED`, `PARTIAL` oder `FAILED` ergeben
  `INCOMPLETE`; `COMPLETE` und `FOCUSED_COMPLETE` sind explizit getrennt.
- Dirty Stop benötigt eine konkrete Dirty Boundary und behält den sicheren
  Resume-Punkt; fehlende Boundary endet als Contractfehler.
- W3A `15/15 PASS`; Parserfehler `0`, Schema/Fixtures JSON-parsebar,
  Determinismus bestätigt, Inputmutation und Dateiseiteneffekte `false`.
- Native Delta-/Contract-/Security-/Privacy-/Scope-Review: `PASS`; W3B-
  Evidence-Klassifikation oder automatische Reuse wurde nicht vorgezogen.

### W3B - Validated Context und Test Evidence Reuse

- Tier-A-/B-/C-Quellenregeln maschinenlesbar abbilden;
- Source-, Producer-, Consumer-, Harness-, Oracle-, Runtime- und
  Preconditions-Fingerprints gemeinsam prüfen;
- Evidence Validity (`VALID`, `INVALIDATED`, `MISSING`), Evidence Quality
  (`COMPLETE`, `PARTIAL`, `STALE`, `AMBIGUOUS`) und Failure Class Relation
  (`KNOWN_COVERED`, `NEW_FAILURE_CLASS`) getrennt berechnen;
- finale Fullmatrix nicht durch eine Sammlung isolierter Teilnachweise
  vortäuschen;
- neue Failure Class invalidiert betroffene Evidence deterministisch;
- maschinenlesbare Klassifikation nur im Shadow-/Advisory-Receipt ausgeben;
  die bereits aktive manuelle Reuse folgt weiterhin dem Workflow Contract;
- automatische, execution-beeinflussende Reuse-Empfehlungen bleiben bis nach
  Benchmark und C4/R15 `POST_ROADMAP_CAMPAIGN`.

#### Ergebnis W3B

Status: `PASS_2026-09-10`.

- Tier A (`ALWAYS_LIVE`), Tier B (`VALIDATED_REUSE`) und Tier C
  (`ORIGINAL_ON_DEMAND`) sind maschinenlesbar und fail-closed abgebildet.
- Source-, Producer-, Consumer-, Harness-, Oracle-, Runtime- und
  Preconditions-Fingerprint müssen gemeinsam passen; Missing oder jeder
  Mismatch verhindert Reuse.
- Evidence Validity, Evidence Quality und Failure Class Relation werden
  getrennt ausgegeben. `NEW_FAILURE_CLASS` invalidiert das betroffene Receipt
  und erzwingt ein neues Gate statt automatischer Fortsetzung.
- Eine geforderte integrierte Matrix kann nicht aus isolierten Teilnachweisen
  zusammengesetzt werden. Stale, ambiguous und partial bleiben unterscheidbar.
- Die bestehende Execution-Baseline wird nur gespiegelt;
  `automaticExecutionInfluence = false` und `SHADOW_ADVISORY_ONLY` sind fest.
- W3B `19/19 PASS`; W3A-Regression `15/15 PASS`; Parserfehler `0`, JSON
  parsebar, Determinismus bestätigt, Inputmutation und Dateiseiteneffekte
  `false`.
- Native Delta-/Consumer-/Contract-/Security-/Privacy-/Scope-Review: `PASS`;
  die aktive manuelle Workflow-Reuse bleibt unverändert.

### W3C - Verification Mise en Place

- `EVIDENCE_VALIDITY`, `EVIDENCE_QUALITY`, `FAILURE_CLASS_RELATION`, `REQUIRED`,
  `EXPENSIVE` und `EXIT` als kompakten Roadmapblock erzeugen;
- Evidence Manifest, Mutation Scope und Out-of-Block Watchlist getrennt halten;
- Finding-only beendet den Block; Diagnose und Repair beginnen erst nach neuem
  Usage-Gate;
- einen synthetischen Dirty Stop und eine sichere Resume-Fortsetzung testen.

#### Ergebnis W3C

Status: `PASS_2026-09-10`.

- Der pure Builder erzeugt einen stabilen kompakten Roadmapblock für
  `EVIDENCE_VALIDITY`, `EVIDENCE_QUALITY`, `FAILURE_CLASS_RELATION`,
  `REQUIRED`, `EXPENSIVE` und `EXIT`.
- Evidence Manifest, erlaubte/geschützte Mutation Scope und Out-of-Block
  Watchlist bleiben getrennte, sortierte Strukturen; eine Watchlist autorisiert
  keine Mutation.
- Finding-only, `NEW_FAILURE_CLASS` und Scope Breach führen zu
  `STOP_AT_FINDING_BOUNDARY`; Dirty Stop zu `SAFE_RESUME_ONLY`. Diagnose und
  Repair bleiben false, und jede Fortsetzung verlangt ein neues Usage-Gate.
- Ein Dirty-Stop-Resume ohne validiertes Gate endet als Contractfehler; mit
  Gate bleibt der exakte Resume-Punkt erhalten.
- W3C `12/12 PASS`; vollständige W3-Matrix W3A `15/15`, W3B `19/19`, W3C
  `12/12`; Parserfehler `0`, JSON parsebar, Determinismus bestätigt,
  Inputmutation und Dateiseiteneffekte `false`.
- Native Delta-/Consumer-/Contract-/Security-/Privacy-/Scope-Review: `PASS`.

Pflichtpostcondition: Reuse darf einen unveränderten Nachweis korrekt übernehmen
und muss jede relevante Fingerprint- oder Failure-Class-Änderung ablehnen.

## W4 - S4 Shadow Mode und Benchmark-Readiness

Ziel: Guard vNext beobachten und messen, ohne die aktive Admission zu ändern.

1. Einen lokalen Shadow-/Compare-Modus bereitstellen, der altes und neues
   Orakel auf denselben validierten Input anwendet.
2. Abweichungen, Gründe, Confidence und potenzielle Wirkung secretfrei
   protokollieren; kein automatischer Policywechsel.
3. Migration, Rollback und Schema-Versionierung gegen Fixtures beweisen.
4. Das getrennte Dokument `docs/Codex Model Benchmark V1 Campaign.md` erstellen
   oder einen bereits ownerseitig festgelegten Pfad übernehmen.
5. Korpus, Prompt, Goldstandard, Scorer, kritische Fehler, Runreihenfolge,
   Warm/Fresh-Bedingung, Modell-/Reasoning-Metadaten und Abweichungsvertrag
   fingerprintbinden.
6. Mindestens zwei unabhängige, gegengewichtete Runs je Profil festlegen; bei
   Widerspruch oder Grenzfall einen dritten.
7. Während der Kampagne keine Guardpolicy, keinen Korpus und keinen Scorer
   ändern. Ein notwendiger Fix invalidiert betroffene Runs und startet eine neue
   Campaign-Revision.
8. Roadmap auf `WAITING_FOR_BENCHMARK` setzen und Resume Card auf W5 vorbereiten.

Pflichtpostcondition: Shadow Mode ist lokal grün, die aktive Policy unverändert
und die Benchmarkkampagne reproduzierbar startbereit.

### Ergebnis W4A

Status: `PASS_2026-09-10`.

- `Test-CodexUsageState.ps1 -Envelope` erzeugt ausschließlich opt-in das
  versionierte `guard-telemetry/1`-Envelope mit VALID, LIMIT, INVALID, STALE
  oder PARTIAL. Der Aufruf ohne Switch behält Legacy-Felder und Exitcodes.
- Schema 3 mappt bei gültiger Dual-Window-Messung verlustfrei; Fehler-Envelopes
  enthalten nur stabile Validation Codes und keine Roh-State-Dumps.
- Der Shadow-Receipt hält `activeDecisionSource = LEGACY`,
  `mode = SHADOW_ONLY` und `executionInfluence = false`; Divergenzen sind nur
  `ADVISORY_ONLY`.
- Ein Same-Input-Consumerfixture leitet Legacy- und vNext-Entscheidung aus
  demselben validierten State/Envelope ab und bestätigt `MATCH` ohne Wirkung.
- W4A `13/13 PASS`; Parserfehler `0`, sieben JSON-Dateien parsebar,
  Determinismus und Dateiseiteneffektfreiheit bestätigt.
- Native Delta-/Consumer-/Contract-/Security-/Privacy-/Scope-/Migrationsreview:
  `PASS`. Sensor v3.1.0 blieb unverändert; keine Installation und kein Cutover.

### Ergebnis W4B

Status: `PASS_2026-09-10`.

- `guard-migration/1` plant ausschließlich `PREPARE_FORWARD`,
  `PREPARE_ROLLBACK` und `VERIFY_FALLBACK`; keine Operation mutiert Dateien,
  Runtime oder aktive Policy.
- Forward bleibt `SHADOW_READY`, Rollback bleibt `ROLLBACK_READY`, und der
  bewiesene Fallback endet `ROLLED_BACK_SAFE / LEGACY_DEFAULT`.
- Artifact-, Schema- oder W4A-Evidence-Drift blockiert fail-closed. Ein
  angeforderter Sensorinstall oder Policycutover ist ein Contractfehler.
- Der Integrationsfixture verwendet die realen W4A-Sensor-/Validator-/Shadow-
  Fingerprints und beweist die gesamte Plansequenz ohne Ausführungswirkung.
- W4B `12/12 PASS`; Parserfehler `0`, Schema/Fixtures JSON-parsebar,
  Determinismus bestätigt, Inputmutation und Dateiseiteneffekte `false`.
- Native Delta-/Consumer-/Contract-/Security-/Privacy-/Scope-/Migrationsreview:
  `PASS`; keine Installation, keine aktive Umschaltung und kein Deploy.

### Ergebnis W4C

Status: `PASS_2026-09-10`.

- Die historische Revision `codex-model-benchmark-v1.0` besitzt keine Runs;
  Dokumentfingerprint `eb51479d...7045` und Campaign Fingerprint
  `57d932fd...8da9` bleiben im Decision Log erhalten.
- Der Abschlussreview bindet Revision `codex-model-benchmark-v1.1` mit Guard
  Conformance Suite, Document Work Suite, zehn privacy-bereinigten Dokumenten
  und 23 getrennten Assets. Dokument `2d1f82c1...54f7`, Manifest
  `eb71f37a...019f`, Campaign `3cb099cb...bef6`, Run-Bundle
  `1a5eca76...7eaf`, Toolcontract `7783928d...cd74`; elf JSON-Dateien sind
  parsebar.
- Visibility, Rollen, `FIXED_WORK`, Usage-Attribution, mindestens zwei Runs je
  Profil in `FRESH_MINIMAL`, Third-Run-Trigger, Scoringböden, Critical Failures
  und Invalidation sind eingefroren. Nur die Arithmetik aus einer semantisch
  adjudizierten Scorecard ist deterministisch. Warm und Long Context sind
  ausdrücklich vertagt.
- Das tatsächliche Profilmanifest ist ownerseitig entschieden und semantisch
  validiert. Nicht beobachtbares aktives Modell oder Reasoning wird
  `NOT_OBSERVABLE`; kein Agent wechselt es selbst.
- Native Contract-/Architektur-/Security-/Privacy-/Scope-/Red-Team-/Readiness-
  Review: `PASS` nach Korrektur von `ARGUS-R01..R13`. Es gab keinen
  Benchmarklauf, kein Profilmanifest, keinen Modellwechsel, keine
  Guardaktivierung und keine Produkt- oder externe Wirkung.
- W4 ist vollständig `PASS`; der sichere Resume-Punkt ist exakt
  `G-BENCHMARK`.

### Ergebnis V1.3-Ausführungsschicht und Profilfreeze

Historischer Vor-Run-Status: `READY_TO_RUN / RUN_01_PREPARED / NOT_STARTED`.

- `ARGUS-R14..R23` bleiben als V1.2-Evidence erhalten; `ARGUS-R24..R33` sind in
  V1.3 geschlossen. Kein Campaign-P0/P1 bleibt offen.
- PRE_FREEZE, PROFILE_FROZEN und RUN_PREPARED validieren jeweils grün.
- Run 01 liegt als operativ isolierter Stage außerhalb des MIDAS-Workspace;
  die Isolation ist keine OS-Sicherheitsgrenze.
- F-GUARD-01 blockiert erst W5/G-POLICY-ACTIVATE, F-GUARD-06 bleibt bis zum
  Kampagnenergebnis offen und F-GUARD-11 ist eine akzeptierte Watchlist. Keines
  dieser Findings blockiert den erfolgten Profilfreeze.
- Der sichere Resume-Punkt ist `G-BENCHMARK / OWNER_POSTIMAGE_CHECK`; Run 01
  darf erst danach in einem separaten frischen Chat gestartet werden.

### Ergebnis V1.4-Control-Plane-Repair

Status: `READY_TO_RUN / RUN_01_PREPARED / NOT_STARTED`.

- V1.3 ist mit null Runs `SUPERSEDED_BEFORE_FIRST_RUN`; auch V1.0 bis V1.2
  behalten ihre Null-Run-Historie.
- `ARGUS-R34..R37` sind in V1.4 geschlossen. Ein finaler formal ungültiger
  Modelloutput wird bytegleich als `MODEL_FAIL_COMPLETE` erfasst, bewertet
  und triggerwirksam; `TECHNICALLY_INVALID_RUN` bleibt auditierbar, aber aus
  Modellqualität und Empfehlungen ausgeschlossen.
- Der tatsächliche Campaign-Dokumenthash wird vom Manifestvalidator neu
  berechnet und von Profil, Metadata, Stage und allen späteren Nachweisen
  gebunden. Eine Dokumentänderung invalidiert die Runvorbereitung.
- Der Import führt den vollständigen Expected-Run-Stagevalidator unmittelbar
  vor jedem kanonischen Write erneut aus. Die lokale Race-Fixture beweist,
  dass Drift vor Commit keine Zieldatei erzeugt.
- `MINIMUM_DECISION_MARGIN = 5.0`; Gleichheit sowie Abstände von 0,1 bis 5,0
  ergeben `NO_DECISION`. Confidence bindet Profilabstand und interne Streuung.
- Run 01 ist als neuer V1.4-Stage außerhalb des Repository vorbereitet. Kein
  Tested-Agent-Chat, Run, Raw-Output, Attempt, Response, Scorecard, Receipt
  oder Campaign Result wurde real erzeugt.
- Aktive Fingerprintkette: Campaign-Dokument
  `e75c9f64...44db`, Campaign `bc41ed14...38b2`, Run-Bundle
  `0e126151...2088`, Toolvertrag `aa8ff1c3...c2d`, Profilmanifest
  `fb7e779b...f12a`, Run-01-Metadata `8c5c5dc0...d8e4` und Stage
  `c443c687...904c`. Der aktuelle Manifest-Dateihash nach Übergang auf
  `RUNNING` lautet `fbefdd84...ede4`.

### Run 01 Attempt 1

Status: `RUNNING / RUN_01_POST_RUN_VALID`.

- `ARGUS-V14-RUN-01-ATTEMPT-01` ist `MODEL_FAIL_COMPLETE`, nicht
  `TECHNICALLY_INVALID_RUN`.
- Der 23-Byte-Raw-Output wurde bytegleich mit SHA-256
  `e4e941ad...b9b8d` erfasst; es existiert keine strukturierte Response.
- Reason Codes: `INVALID_RESPONSE_ENVELOPE`, `INVALID_JSON`.
- Der Attempt ist mit `qualityIncluded = true` und
  `retryDisposition = RUN_SLOT_COMPLETE` gebunden.
- `RUN_END` ist kanonisch erfasst. `PRE_RUN_BASELINE` fehlt; die nur aus
  Rainmeter abgelesenen Werte werden nicht rekonstruiert. Usage ist daher
  `INELIGIBLE`, die Qualitätsauswertung bleibt zulässig.
- Kein Retry wurde gestartet. V1.5 übernimmt diese Run-Evidence unverändert;
  nächster Resume-Punkt ist `G-BENCHMARK / RUN_02_READY_FOR_OWNER_START`.
- Die Scorecard ist mit `0 / 0 / 0`, nicht bestandenen Qualitätsböden und
  Critical Failure `INVALID_RESPONSE_ENVELOPE` valide; Fingerprint
  `936f7167...b18c`.
- Das Receipt ist mit `PRE_RUN_BASELINE = MISSING`, `RUN_END = CAPTURED`,
  `usageComparison = INELIGIBLE` und Reason Code
  `PRE_RUN_BASELINE_NOT_CAPTURED` valide; Fingerprint `2888b236...ae3f`.
- Die aktuelle Third-Run-Auswertung ist noch nicht entscheidungsfähig, weil
  Profil A erst einen seiner zwei Basisruns besitzt. `MODEL_FAIL_COMPLETE`
  bleibt als triggerwirksame Evidence erhalten; kein konditionaler Run-Slot
  wird vor Abschluss der Basisreplikate gestartet.
- `ARGUS-R38` ist in V1.5 geschlossen: Der Aufruf trennt `StageRoot`,
  `ValidateOnly` und `ExpectedRunId` eindeutig. Der echte V1.4-Artefaktsatz
  läuft über `ARGUS-V14-TO-V15-RUN-01` vollständig durch `POST_RUN`, ohne Raw
  Output, Attempt, Scorecard oder Receipt zu verändern oder neu zu bewerten.

### Ergebnis V1.5-ARGUS-R38-Repair

Status: `RUNNING / RUN_01_POST_RUN_VALID / RUN_02_PREPARED / NOT_STARTED`.

- Aktive Revision: `codex-model-benchmark-v1.5`; V1.4 ist nach genau einem
  realen Run als `SUPERSEDED_AFTER_RUN_01_MIGRATED_UNCHANGED` erhalten.
- Der echte Run-01-Chain- und POST_RUN-Nachweis ist grün. Migration und aktiver
  Campaign-Fingerprint lehnen Stage-, Receipt- oder Evidence-Austausch ab.
- Corpus, Aufgaben, Goldanker, Scoringmodell, 5,0-Punkte-Decision-Margin,
  Profile und A/B/B/A-Reihenfolge sind inhaltlich unverändert.
- Run 02: `ARGUS-V14-RUN-02`, `GPT6_ASTRA_MEDIUM`, `GPT-6 Astra`, `Medium`,
  Replikat 1, `FRESH_MINIMAL`; 19 Stage-Dateien; nicht gestartet.
- Aktive Bindungen: Campaign-Dokument `f1ec2a0c...1bee`, Campaign
  `642151ef...1a31`, Run-Bundle `4778103c...a449`, Toolcontract
  `f09a7c9b...e162`, Profil `a8b5a7a2...b4cb`, Run-02-Metadata
  `ec06c9e6...1873`, Run-02-Stage `a5fb474e...5113`.

### Run 02 Attempt 1 und Run-03-Vorbereitung

Status: `RUNNING / RUN_02_POST_RUN_VALID / RUN_03_PREPARED / NOT_STARTED`.

- `ARGUS-V14-RUN-02-ATTEMPT-01` ist nach dem aktiven V1.5-Importvertrag
  `MODEL_FAIL_COMPLETE`; der vollständige 23-Byte-Raw-Output
  `STAGE_INVENTORY_INVALID` bleibt bytegleich unter SHA-256
  `e4e941ad...b9b8d` erhalten. Es existiert keine strukturierte Response.
- Attempt `c957380a...39e2`, Scorecard `5eaca120...9368` und Receipt
  `d291e36e...4a1e` bilden die unveränderliche Run-02-Kette. Score: `0 / 0 /
  0`, Quality Floors nicht bestanden, Critical Failure
  `INVALID_RESPONSE_ENVELOPE`.
- `PRE_RUN_BASELINE` und `RUN_END` sind beide `MISSING`; die spätere
  Rehydrationsmessung wird nicht als Run-Evidence rekonstruiert. Usage ist mit
  `PRE_RUN_BASELINE_NOT_CAPTURED`, `RUN_END_NOT_CAPTURED` und
  `PARALLEL_OR_UNKNOWN_INTERFERENCE` strikt `INELIGIBLE`.
- Der echte Run-Chain-Validator und die übergeordnete `POST_RUN`-Phase sind
  grün. Die aktive Control Plane ist V1.5; der aus der V1.4-Folge historisch
  beibehaltene technische Run-Identifier bleibt `ARGUS-V14-RUN-02`.
- Nach aktuellem Stand sind für beide Profile `MODEL_FAIL_COMPLETE`,
  `ANY_CRITICAL_FAILURE` und `NONCOMPARABLE_USAGE_RECEIPT` triggerwirksam.
  Konditionale Runs beginnen dennoch erst nach den vier Basisruns.
- Nächster Basisrun ist `ARGUS-V14-RUN-03`, `GPT6_ASTRA_MEDIUM`, `GPT-6
  Astra`, `Medium`, Replikat 2, `FRESH_MINIMAL`. Metadata
  `9bbcb554...102d`, 19-Dateien-Stage `f722fed6...5d7e`; nicht gestartet.

## G-BENCHMARK - Getrennte Kampagne

Dieser Gate gehört nicht zu einem einzelnen autonomen Guardblock.

Das Ergebnisreceipt muss enthalten:

- Campaign-Revision und Fingerprints,
- fingerprintgebundene, schema-valide sichtbare Run-Metadaten je Run,
- tatsächliches Modell/Reasoning oder `NOT_OBSERVABLE`,
- mindestens zwei unabhängige Runs je Profil im selben Context State,
- Reihenfolge und Resetidentitäten,
- Requested versus Executed Work,
- Qualitäts- und Kritikalitätsscore,
- Closure Outcome, Usage, Rehydration und ChatContextState,
- Abweichungen, Ausreißer und Entscheidung über einen dritten Run,
- getrennte Aussagen je untersuchter Work Class und eine Empfehlung mit
  Confidence, keine universelle Modellbehauptung.

Fehlt ein Pflichtfeld oder wurde die Kampagne unterwegs verändert, bleibt W5
blockiert. Ein einzelner guter Lauf genügt nicht.

### Ergebnis V1.6-Workspace-Binding-Migration

Status: `V1.6 CONTROL_PLANE_GREEN / FRESH_RUN_01_PREPARED /
OPERATOR_CONSOLE_V16_READY / SMOKE_SESSION_AUTO_DISCOVERY_READY /
TESTED_AGENT_SESSION_AUTO_DISCOVERY_READY /
USAGE_CHECKPOINT_CAPTURE_READY / WORKSPACE_BINDING_EVIDENCE_PASS /
PRE_RUN_READY / ARGUS_READY_FOR_VALID_RUNS / NOT_STARTED`.

- `ARGUS-R39` ist geschlossen. Die historischen Session-Metadaten binden Run
  01 und Run 02 an den MIDAS-Root statt an ihren Stage Root. Die ursprünglichen
  `MODEL_FAIL_COMPLETE`-Dateien bleiben unverändert, werden aber additiv als
  `TECHNICALLY_INVALID_RUN / CONTROL_PLANE_FAILURE /
  WORKSPACE_ROOT_MISMATCH` klassifiziert und weder als Qualität noch als
  Replikat gezählt.
- Der alte Run 03 ist `RETIRED_UNSTARTED`; kein alter Run wurde wiederholt oder
  neu gescort.
- `ARGUS-R40` ist prospektiv geschlossen. Usage-Checkpoints werden vor Receipt
  in ein eigenes fingerprintgebundenes Evidence-Artefakt importiert. Der alte
  Run-02-Receipt bleibt unverändert.
- Der Startvertrag verlangt Stage-PASS, explizites **Open Folder** auf den
  Stage Root, nicht gewerteten relativen Read-Smoke und immutable
  Workspace-Binding-Evidence **vor** `PRE_RUN_BASELINE`. Prompttext allein
  erfüllt diesen Vertrag nicht.
- Die aktive Basisserie verwendet `ARGUS-V16-RUN-01` bis `-04` in unveränderter
  A/B/B/A-Reihenfolge. Fresh Run 01 ist vorbereitet; kein Run ist gestartet.
- Die lokale Operator Console bildet Stage-PASS, explizites Open Folder,
  Owner-Attestation, maschinelle Workspace-Binding-Evidence, PRE_RUN und
  TESTED_AGENT-Freigabe als getrennte Zustände ab. Sie verwirft abgeleitete
  Freigaben bei Run-/Stage-/Fingerprintdrift und übergibt vorhandene PRE-/END-
  Evidence an den kanonischen V1.6-Import statt sie als `MISSING` auszugeben.
- Der lokale Operator-Finder sucht nur frische Codex-Sessionlogs, verlangt
  exakt einen kanonisch validen Smoke für Revision, Run, Profil und Stage-CWD
  und übergibt dessen unveränderten Pfad an den bestehenden V1.6-Binding-
  Validator. Kein Treffer, Mehrdeutigkeit, falscher CWD, falsche Metadaten,
  TESTED_AGENT-Inhalt oder ungültiges JSON bleiben fail-closed. Ein expliziter
  Pfad bleibt nur als gleich streng validierter Diagnose-Fallback erhalten.
  Der Finder ist eine lokale Operatorhilfe außerhalb des eingefrorenen
  Run-/Evaluator-/Orchestrator-Assetinventars; Campaign-, Run-Bundle-, Tool-
  und Stage-Fingerprints bleiben dadurch unverändert.
- Der zweite lokale Operator-Finder bindet einen abgeschlossenen
  `TESTED_AGENT`-Chat fail-closed an exakt einen Sessionlog: genau eine
  `session_meta`, exakter Stage-CWD, eingefrorener Startprompt, genau ein
  `final_answer`, kein Smoke-/Orchestratorinhalt und strikte zeitliche Lage
  zwischen den fingerprintgebundenen `PRE_RUN`- und `RUN_END`-Quellen. Run-,
  Revisions- und Profilfelder des strukturierten Outputs werden geprüft, wenn
  sie technisch beobachtbar sind; Modell und Reasoning bleiben andernfalls
  `NOT_OBSERVABLE`. Kein Treffer, Mehrdeutigkeit, falscher CWD, unvollständige
  Session oder widersprüchliche Metadaten blockieren Raw und Handoff.
- `Capture-ArgusUsageCheckpoint.ps1` ruft ausschließlich den kanonischen
  Usage-Validator mit Refresh auf und schreibt `PRE_RUN_BASELINE.json` oder
  `RUN_END.json` atomar und ohne Überschreiben unter dem deterministischen
  Operatorpfad `C:\Users\steph\ARGUS-RUN-EVIDENCE\<RUN-ID>\`. Diese Quellen
  liegen außerhalb des eingefrorenen Campaign-Inventars; der vorhandene
  V1.6-Usage-Import bleibt alleiniger nachgelagerter Evidence-Vertrag.
  `PRE_RUN` verlangt vorher gültige Workspace-Binding-Evidence.
- Die Operator Console erzwingt nun zusätzlich `TESTED_AGENT COMPLETE` →
  **CAPTURE RUN_END NOW** → Session-Discovery → Raw → Orchestrator. Run- oder
  Evidence-Identitätswechsel löschen alle nachgelagerten Proofs; Reload stellt
  keine maschinelle Freigabe aus `localStorage` wieder her. Open Folder,
  Ownerbestätigung, Profilwahl, Chatstart und Promptabsenden bleiben bewusst
  ownergeführt. Raw-Output-Automation bleibt außerhalb dieses Blocks.
- Der erste reale V1.6-Operatorfluss traf unmittelbar nach dem erfolgreichen
  Smoke auf einen temporären Windows-Sharingkonflikt: Der noch schreibende
  Codex-Prozess ließ den kanonischen `[IO.File]::ReadLines`-Zugriff nicht zu
  (`System.IO.IOException`, `0x80070020`). Der Operator-Finder prüft diesen
  exakten Zugriff nun vor dem Child-Prozess, meldet
  `SMOKE_SESSION_NOT_READABLE` mit vollständiger Pfad-/Exceptionkette und
  schreibt keine Evidence. Nach Freigabe wurde derselbe bytegleiche Smoke
  automatisch gefunden und durch den unveränderten kanonischen Validator als
  Workspace-Binding-Evidence gebunden; ein zweiter Smoke war nicht nötig.

Historischer Resume-Punkt war `G-BENCHMARK /
V1.6_RUN_01_PRE_RUN_READY`. Der Owner hat den Pilot danach nach einem
vollständigen Tested-Agent-Lauf ohne Raw-Import oder Scoring beendet. Der
additive Closure-Record bindet Session, PRE_RUN, RUN_END und Workspace-Evidence
unverändert; weitere Runs sind verboten. W5 ist ausschließlich durch
`D-GUARD-30` zugelassen.

## W5 - S4 Kalibrierung und aktive Umschaltung

Voraussetzung: grünes, fingerprintgebundenes G-BENCHMARK-Receipt oder ein
expliziter, fingerprintgebundener Owner-Override, der die Kampagne ehrlich als
unvollständig schließt und jede benchmarkbasierte Modellbehauptung verbietet.

1. Benchmarkresultat und weiterhin gültige R14-Empirie getrennt übernehmen.
2. Modell-/Reasoning-Empfehlungen ausschließlich aus dem Benchmark kalibrieren.
   Cost Confidence und blockbezogene Defaults ausschließlich aus störungsfreien,
   fingerprintgebundenen Cost Receipts mit passendem Vergleichsschlüssel
   ableiten. Benchmarkkosten dürfen nur bei tatsächlich identischer Work Class,
   Topology, Context State, Runtime und Closure einfließen.
3. Nur belegte `VALIDATE_THEN_DECIDE`-Kandidaten aktivieren; alle anderen mit
   Begründung `DEFERRED` lassen.
4. Altes und neues Orakel über die gesamte Transition-/Fixturematrix vergleichen.
5. Migrations- und Rollbackprobe durchführen.
6. Owner-Briefing für G-POLICY-ACTIVATE erstellen.
7. Nach Freigabe aktive Verträge gezielt aktualisieren:
   - `AGENTS.md` nur mit kurzen verbindlichen Regeln,
   - Workflow Contract mit zentraler Detailpolicy,
   - Roadmap-/Evidence-Templates mit Pflichtfeldern,
   - `docs/DEV_ENVIRONMENT.md` nur bei Tool-, Schema- oder Bedienänderung,
   - Template-README nur mit Erstellungs-/Ausführungsregeln.
8. Unmittelbar auf dem vollständigen Zielstand `SDEF-001` gegen die
   Canonical-Ownership-Matrix ausführen. Bei aktiver Mehrfachdefinition oder
   semantischer Abweichung die Umschaltung nicht finalisieren, sondern die
   Abweichung minimal korrigieren oder auf die alte Policy zurückrollen.
9. Bestehende aktive Roadmaps nicht rückwirkend ändern; neue Roadmaps verwenden
   vNext ab dem dokumentierten Aktivierungszeitpunkt.
10. Falls Sensor/Validator geändert wurde, G-SENSOR-INSTALL ausführen und
   bytegleiches, frisches Postimage beweisen.

Pflichtpostcondition: vNext ist entweder kontrolliert aktiv mit grünem Rollback
oder ausdrücklich nicht aktiviert und die alte Policy bleibt vollständig
funktionsfähig.

### Ergebnis W5

Status: `PASS_2026-09-13 / GUARD_VNEXT_ACTIVE`.

- Der A.R.G.U.S.-Pilot ist über `pilot-closure.json` als
  `BENCHMARK_INCOMPLETE / NO_COMPARATIVE_DECISION` geschlossen. Die Profilwahl
  `GPT-5.6 Sol / High` ist ausschließlich `OWNER_SELECTED`.
- Policy-, Topologie-, Cost-, Resume-, Evidence-, Verification-, Shadow- und
  Migrationsmatrix bestanden vor dem Cutover vollständig (`111/111`).
- `guard-policy-config.json` friert ausschließlich die bereits getestete
  Dual-Window-Konfiguration ein. Single-Window-Profile und experimentelle
  Features bleiben deaktiviert.
- `guard-activation.json` bindet Sensor, Validator, pure Policy,
  Input-/Outputschema, Konfiguration und die aktiven Vertragsquellen per
  SHA-256. Der Aktivierungstest besteht `8/8`, einschließlich Drift-,
  Modellbasis-, LIMIT- und Rollbackfällen.
- Sensor v3.1.0 und Validator blieben unverändert; der Defaultoutput bleibt
  Legacy-JSON-kompatibel. `G-SENSOR-INSTALL` war daher nicht erforderlich.
- `SDEF-001 PASS`: Der Workflow Contract besitzt die aktive Detailpolicy;
  AGENTS ist kurze Enforcement-Referenz, DEV_ENVIRONMENT besitzt Sensor und
  Bedienung, Templates besitzen Struktur, Roadmap/Evidence den
  Ausführungszustand und Evolution Notes ausschließlich Historie/Future Design.
- Legacy bleibt der explizite, getestete Rollbacktarget. Guard vNext führt
  keine automatische Tool-, Commit-, Deploy- oder Produktaktion aus.

## W6 - S5/S6 Integrierte QA und Abschluss

W6 bewahrt eine gemeinsame integrierte Aussage, besitzt aber drei sichere
Resume-Grenzen. Vor W6A, W6B und W6C wird jeweils ein Usage-Gate ausgeführt.
Ein grünes W6A-Postimage wird in W6B per Fingerprint übernommen; Reviewfixes
wiederholen nur die dadurch invalidierten Prüfungen. W6C öffnet keine neue
Diagnose oder Implementierung.

### W6A / S5.1 - Integrierte Testmatrix

- vollständige Policy-/Transition-/Migration-/Rollback-Fixturematrix,
- PowerShell-Parser und vorhandene passende lokale Testframeworks,
- Sensor-/Validator-Kompatibilität für die aktive Topologie,
- no-5h-, stale-, partial-, reset-, resolution-, rehydration-, owner-boundary-,
  restricted-episode-, LIMIT-, dirty-stop- und concurrency-Fälle,
- Context-/Evidence-Reuse inklusive adversarial Invalidation,
- Shadow-/Active-Vergleich,
- `git diff --check` und Markdownlint.

Keine Browser-, Device-, Supabase- oder Produktmatrix wird nur aus Gewohnheit
ausgeführt. Eine UI-Prüfung ist nur erforderlich, falls die Rainmeter-Anzeige
tatsächlich geändert wurde; die Policy selbst benötigt keine Browsermatrix.

W6A endet mit Manifest, Test-IDs, Runtime-Fingerprint und einer sicheren lokalen
Postcondition. Findings werden dokumentiert, aber ein neuer offener
Diagnoseblock wird nicht ohne W6B-Gate begonnen.

#### Ergebnis W6A

Status: `PASS_2026-09-13`.

- Integrierte Guardmatrix: `119/119` grün (`W2A 24`, `W2B 12`, `W2C 12`,
  `W3A 15`, `W3B 19`, `W3C 12`, `W4A 13`, `W4B 12`, `W5 8`).
- PowerShell-Parser: `14/14`; Guard-JSON-Parse: `23/23`.
- Sensor und installierte Kopie: bytegleich
  `3d8f8601...c8d1`; Validator `2174bc2c...2082`.
- Technischer Runtime-Fingerprint über `tools/codex-usage`:
  `759651d880f9bb851eef40df12118a653b3342cdea0de322cdb45629ae85bf5e`.
- Keine Browser-, Device-, Supabase-, Produkt- oder Sensorinstallationsmatrix
  betroffen. Keine neue Failure Class und kein offenes W6A-Finding.

### W6B / S5.2 - Full Review und Korrektur

- nativer Full Contract-, Code-, Security-, Privacy-, Scope-, Consumer- und
  Migrationsreview,
- `SDEF-002` als finales Single-Definition-Red-Team über AGENTS,
  DEV_ENVIRONMENT, Workflow Contract, Template-README, Roadmap-/Evidence-
  Template, Evolution Notes und aktive Roadmap durchführen,
- jedes relevante Vorkommen als `CANONICAL_DEFINITION`, `REFERENCE`,
  `EXECUTION_STATE`, `HISTORICAL_EVIDENCE` oder `FUTURE_DESIGN` klassifizieren,
- jede aktive Mehrfachdefinition oder semantische Abweichung vor dem finalen
  technischen Postimage schließen; Canonical-Ownership-Matrix aktualisieren,
- danach genau einen initialen CodeRabbit-Lauf über den kanonischen Aufruf
  planen und, sofern verfügbar, ausführen,
- nur berechtigte Findings korrigieren,
- höchstens einen CodeRabbit-Verifikationslauf nach berechtigten Korrekturen
  planen und, sofern verfügbar, ausführen,
- nur durch Korrekturen invalidierte Prüfungen aus W6A wiederholen,
- bei neuer Failure Class Finding und Resume-Grenze herstellen, statt spontan
  in einen ungebundenen Repairblock zu wachsen.

Ist CodeRabbit nicht verfügbar oder sein Budget erschöpft, wird das als
Evidence-Gap dokumentiert. Der native Full Review bleibt gültig; ein
CodeRabbit-PASS wird nicht erfunden und es wird keine alternative Installation
oder Ersatzroute improvisiert.

W6B endet mit `SDEF-002 PASS`, ohne offene P0/P1-Findings und mit einem
fingerprintgebundenen finalen technischen Postimage. Ein ehrlich dokumentierter
externer Review-Gap bleibt zulässig, sofern der native Full Review PASS ist und
der Workflow Contract keinen strengeren Pflichtnachweis verlangt.

#### Ergebnis W6B

Status: `PASS_2026-09-13`.

- Nativer Contract-, Code-, Security-, Privacy-, Scope-, Consumer- und
  Migrationsreview: PASS; keine weitere Failure Class.
- Der initiale CodeRabbit-Lauf meldete drei berechtigte Findings. F-GUARD-29
  bis F-GUARD-31 wurden minimal geschlossen; der zulässige Verifikationslauf
  endete mit `0` Findings.
- Gezielte Nachläufe: Policy W2A 24/24, W2B 12/12, W2C 12/12,
  Contracts 15/15, Evidence 19/19, Verification 13/13, Shadow 13/13 und
  Activation 10/10, insgesamt 118/118.
- `SDEF-002 PASS`: der Workflow Contract bleibt alleiniger aktiver Detailowner;
  die Schemakonsumenten sind semantisch an ihre kanonischen Verträge gebunden.
- Finaler technischer Runtime-Fingerprint über `tools/codex-usage`:
  `9658d0db4f88cf26092d76423fc028c8b0ea23b26c682ca613ce5df31258091f`.
- Keine offenen P0/P1-Findings. W6C ist freigegeben.

### W6C / S6 - Source-of-Truth-Sync

1. Statusledger in dieser Roadmap und den Evolution Notes final synchronisieren.
2. Jede GVN-ID als `ACTIVE`, `DEFERRED`, `REJECTED` oder
   `POST_ROADMAP_CAMPAIGN` abschließen.
3. Aktive Vertragsdateien auf Widersprüche und unnötige Duplikation prüfen.
4. Changelog nur aktualisieren, wenn das lokale Entwicklerverhalten tatsächlich
   geändert wurde.
5. Offene Fragen und Low-Confidence-Bereiche ausdrücklich erhalten.
6. C4 und R15 als ökologische Kampagnen vorbereiten, aber nicht künstlich für
   Messzwecke aufblasen.
7. Roadmap nach vollständigem PASS als `(DONE)` archivieren.
8. Kein Commit oder Push ohne ausdrücklichen Auftrag.

#### Ergebnis W6C

Status: `PASS_2026-09-13`.

- Alle GVN-IDs besitzen genau einen Finalstatus; experimentelle Automation
  bleibt deferred und C4/R15 bleiben `POST_ROADMAP_CAMPAIGN`.
- KASRKINs qualifizierter Istzustand, aktive/Legacy-Rollen, Rollback,
  Owner-Gates, Sources of Truth und spätere Extraktion sind in
  `docs/modules/KASRKIN Module Overview.md` zusammengefasst.
- Die bestehende `Codex Usage Guard Evolution Notes.md` wurde als alleinige
  historische Entwicklungschronik um W5/W6, Failure Classes und Invarianten
  ergänzt.
- `docs/modules/A.R.G.U.S. Module Overview.md` trennt den unvollständig
  geschlossenen Pilot eindeutig vom späteren Neustart bei V1.0.
- README und Changelog verweisen auf den tatsächlichen Guard-/Toolingstand.
- JSON 25/25, PowerShell-Parser 14/14, Activation/Rollback 10/10,
  historische Pilotbindungen 6/6, lokale Referenzen, Privacy und
  Markdown-Control PASS. Ein kanonisches Markdownlint-CLI ist lokal nicht
  vorhanden; es wurde nichts installiert.
- Keine Campaign-Evidence verändert, kein weiterer Benchmarkrun, keine
  Tooling-Extraktion, kein Commit oder Push.

## Abschlusskriterien

Diese Roadmap ist erst `DONE`, wenn:

- alle GVN-IDs genau einen finalen Status besitzen,
- der aktive v3.1-Kern entweder kompatibel erhalten oder kontrolliert migriert
  wurde,
- Policy Engine und Transitionen deterministisch grün sind,
- Evidence Reuse keinen erforderlichen Nachweis überspringen kann,
- die Benchmarkkampagne repliziert und ausgewertet wurde oder ein expliziter
  Owner-Override sie unvollständig und ohne Benchmarkentscheidung geschlossen
  hat,
- aktive Vertragsdateien synchron und widerspruchsfrei sind,
- `SDEF-001` nach Umschaltung und `SDEF-002` im finalen Review bestätigen, dass
  jede aktive Guardregel genau eine kanonische Definitionsquelle besitzt,
- Rollback und Safe Resume bewiesen sind,
- keine offenen P0/P1-Findings bestehen,
- Extension und unbelegte Automation weiterhin klar vertagt sind.

C4 und R15 sind nachgelagerte ökologische Validierung und blockieren nicht den
technischen Guard-vNext-Core-Abschluss. Ihre Ergebnisse dürfen später eine neue
Kalibrierungsrevision begründen, aber den abgeschlossenen vNext-Vertrag nicht
still umdeuten.

## Externes LLM-Zweitreview

Status:
`FINDINGS_FOUND / ARCHITECTURE_SOUND / NO_REPLAN_REQUIRED / ALL_14_EVALUATED`.

Die Findings EXT-01 bis EXT-14 wurden einzeln gegen Roadmap, Evolution Notes
und die kanonischen Vertragsquellen bewertet. Alle waren fachlich berechtigt
und sind als F-GUARD-15 bis F-GUARD-28 nachvollziehbar minimal korrigiert.
Kein Finding erforderte Guard-Code, W0, eine neue Funktion oder eine
Umstrukturierung der historischen Empirie.

Der wichtigste externe Treffer war ein False Negative in `SDEF-PRE-001`:
Normativ klingende Active-Passagen in den Evolution Notes waren nicht mit ihrer
behaupteten Klassifikation als reine Evidence/Future Design vereinbar. Die
Datei besitzt nun eine globale nichtnormative Grenze, konkrete Altstände sind
als historische beziehungsweise superseded Snapshots markiert, und
F-GUARD-01 umfasst ausdrücklich jede aktive Detaildefinition außerhalb des
Canonical Owners.

## Contract-Review bei Erstellung

Status: `PASS_READY_FOR_EXECUTION_PROMPT`.

Geprüft wurde:

- R14 ist DONE und seine finalen Cost Receipts sind in den Evolution Notes
  konsolidiert.
- Die Roadmap ersetzt keine aktive Guardregel vorzeitig.
- Bereits aktive Semantik ist als `ACTIVE_REUSE` markiert und wird nicht als
  neue Implementierung verkauft.
- Benchmark und ökologische Kampagnen sind von der Guardimplementierung getrennt.
- Mehrere Buckets sind erlaubt, aber jede Welle besitzt eine sichere
  Resume-Grenze.
- Produkt-, Security-, Owner- und Reviewgates bleiben unangetastet.
- Extension und automatische Aktionsausführung bleiben außerhalb des Scopes.
- Roadmapstatus, Ausführungsprofil, autonomer Endpunkt und Evidence-Lebenszyklus
  entsprechen dem Template- und Workflowvertrag.
- Die Evolution Notes legen weder das Benchmarkprofil noch die spätere
  Extension-Arbeit vorzeitig fest.

F-GUARD-07 bis F-GUARD-10 sowie F-GUARD-12 bis F-GUARD-28 wurden minimal
korrigiert. F-GUARD-11 bleibt eine bewusst angenommene Größen-Watchlist für
W0. F-GUARD-01 bis F-GUARD-06 sind bewusst offene Ausführungsaufgaben, keine
Widersprüche des Zielvertrags. Es besteht kein bekannter Contractbruch, der W0
blockiert.

## Pre-W0-Single-Definition-Red-Team

Status: `PASS_WITH_ASSIGNED_FINDING` (`SDEF-PRE-001`, nach externer Korrektur
erneut durchgeführt).

Geprüft wurden `AGENTS.md`, `docs/DEV_ENVIRONMENT.md`, Workflow Contract,
Template-README, Roadmap- und Evidence-Template, Evolution Notes sowie diese
Roadmap. Jedes relevante Vorkommen wurde gegen die Canonical-Ownership-Matrix
als `CANONICAL_DEFINITION`, `REFERENCE`, `EXECUTION_STATE`,
`HISTORICAL_EVIDENCE` oder `FUTURE_DESIGN` eingeordnet.

<!-- markdownlint-disable MD013 -->

| Quelle | Klassifikation im Pre-W0-Postimage | Ergebnis |
| --- | --- | --- |
| `README.md` | `CANONICAL_DEFINITION` für Produktgrenze; sonst `REFERENCE` | PASS |
| `AGENTS.md` | `REFERENCE`; einzelne Passagen wirken derzeit zusätzlich wie `CANONICAL_DEFINITION` | F-GUARD-01 |
| `docs/DEV_ENVIRONMENT.md` | `CANONICAL_DEFINITION` für Sensor/Validator/Bedienung; `REFERENCE` auf Workflowpolicy | PASS |
| Workflow Contract | `CANONICAL_DEFINITION` für Admission, Zustände, Transitionen und Reuse | PASS |
| Template-README | `REFERENCE` auf Workflow und Templates | PASS; W5 prüft knappe Formulierung erneut |
| Roadmap Template | `CANONICAL_DEFINITION` für Roadmap-Pflichtstruktur; sonst `REFERENCE` | PASS |
| Evidence Template | `CANONICAL_DEFINITION` für Evidence-Felder; sonst `REFERENCE` | PASS |
| Evolution Notes | `HISTORICAL_EVIDENCE` und `FUTURE_DESIGN` | PASS |
| aktive Guard-vNext-Roadmap | `EXECUTION_STATE`, `REFERENCE` und ausdrücklich zukünftiger Zielvertrag | PASS |

<!-- markdownlint-enable MD013 -->

Ergebnis:

- Sensorpfade, Schema, Freshness und technischer Validatoraufruf besitzen mit
  `docs/DEV_ENVIRONMENT.md` einen eindeutigen technischen Owner.
- Admission, Zustände, Transitionen, Floors, Owner Boundary, Restricted Work,
  LIMIT und Reuse besitzen mit dem Workflow Contract einen eindeutigen
  Sollowner.
- Templates definieren Struktur und Nachweisfelder, nicht eine zweite aktive
  Detailpolicy.
- Evolution Notes enthalten Empirie, nichtnormative historische Snapshots und
  ausdrücklich noch nicht aktive Designkandidaten; historische Prozentwerte
  und superseded Enums sind keine aktive Policy.
- Diese Roadmap enthält nur den konkreten Ausführungszustand und den
  Sollvertrag für die spätere Konsolidierung.
- `AGENTS.md` wiederholt derzeit Teile der aktiven Floor-, Boundary- und
  LIMIT-Semantik detaillierter als eine reine Enforcement-Referenz. Das ist der
  nach der Korrektur verbleibende Teil von F-GUARD-01 und wird in W5 zusammen
  mit der tatsächlichen vNext-Aktivierung konsolidiert. Es wurde keine
  abweichende numerische Schwelle gefunden.

Damit ist die Zielownership widerspruchsfrei. Der bekannte aktuelle
Mehrfachdefinitionscharakter wird nicht kaschiert, aber auch nicht durch eine
vorzeitige Änderung aktiver Policydateien außerhalb von W5 behoben.

### Verworfene Nitpicks

- Die Evolution Notes werden vor W0 nicht nur zur Zeilenreduktion aufgeteilt.
  Historische Evidence bleibt erhalten; F-GUARD-11 verlangt zuerst einen
  fokussierten Duplikat- und Navigationscheck.
- W0-W6 werden nicht in separate Unterroadmaps oder eine zweite S1-S6-Serie
  umnummeriert. Die kanonische Phasenzuordnung ist bereits explizit.
- Die geplante Evidence- und Benchmarkdatei werden nicht vor ihrem zuständigen
  W1- beziehungsweise W4-Gate als leere Artefakte angelegt.
- `AGENTS.md` wird in diesem Review nicht vorzeitig verändert. F-GUARD-01 wird
  zusammen mit der tatsächlich aktivierten vNext-Semantik in W5 geschlossen.
