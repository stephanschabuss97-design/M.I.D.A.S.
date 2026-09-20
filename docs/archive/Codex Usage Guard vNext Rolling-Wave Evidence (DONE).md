# Codex Usage Guard vNext Rolling-Wave - Execution Evidence

Diese Datei enthält ausschließlich technische Nachweise der zugehörigen
Rolling-Wave-Roadmap. Sie ist keine zweite Roadmap und trifft keine neue
Policy-, Produkt- oder Ownerentscheidung.

## Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Zugehörige Roadmap | `docs/archive/Codex Usage Guard vNext Rolling-Wave Roadmap (DONE).md` |
| Status | `DONE_2026-09-13 / GUARD_VNEXT_ACTIVE / KASRKIN_QUALIFIED` |
| Erstellt am | `2026-09-10` |
| Letzter Stand | `2026-09-13; W0-W6 vollständig; Sources of Truth und Context Bridges synchron; Archivierung vorbereitet` |
| Verantwortlicher Schritt | `COMPLETE / ARCHIVED_EVIDENCE` |
| Umgebungen | `lokal; keine produktive, Browser-, Device-, Supabase- oder Deploywirkung` |
| Baseline-Commit | `52010c7b778e24018975e4dd0e1a9fd2a60fd690` |
| Evidence-Owner | `Codex Usage Guard vNext Rolling-Wave Roadmap` |
| Externes Reviewbudget | `W0-W5: 0; W6/S5 bei Codeänderung: 1 Initial + höchstens 1 Verifikation` |
| Archivziel | `docs/archive/Codex Usage Guard vNext Rolling-Wave Evidence (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Nachweisvertrag

- Diese Datei beweist:
  - lokale Fingerprints, Fixture-/Schemaergebnisse, Shadowvergleiche sowie
    Migrations- und Rollbackpostconditions der Guard-vNext-Wellen.
- Diese Datei beweist nicht:
  - Benchmarkqualität, aktive Policyumschaltung, Sensorinstallation,
    produktive MIDAS-Wirkung oder ein nicht ausgeführtes Gate.
- Source of Truth für Entscheidungen:
  - Zielcontract, Decision Log und Statusmatrix der zugehörigen Roadmap;
    aktive Admissionsemantik bis W5 im Workflow Contract.
- Verbotene Inhalte:
  - Secrets, Tokens/JWTs, Prompts, Gesundheitsdaten, vollständige Quellinhalte,
    rohe Usage-State-Snapshots und unnötige Terminaldumps.

## Baseline

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Umgebung | Beobachtung | Ergebnis |
| --- | --- | --- | --- |
| EV-GUARD-B01 | Git | HEAD und Dirty Boundary vor W0 | HEAD `52010c7b...690`; bestehende fremde Änderungen abgegrenzt; nur Guard-Roadmap/-Notes in W0 geändert |
| EV-GUARD-B02 | lokaler Sensor | kanonische und installierte SHA-256 | beide `3d8f8601...37c8d1`; bytegleich |
| EV-GUARD-B03 | Validator | U1 mit Refresh | `VALID`; v3.1.0 / Schema 3; 93/73; `POST_REHYDRATION_BASELINE` |
| EV-GUARD-B04 | historische R14-Evidence | archivierte Roadmap-/Evidencehashes und Zielstellen | `00fd1371...572e` / `a7f4fb84...3b78`; 75/11 operative Erfolgswelle und 13/2 getrennte Closure übernommen |
| EV-GUARD-B05 | Contractquellen | W0-Live-Fingerprints laut Roadmap Context Receipt | aktuelle Zielregionen live gelesen; alter Pre-W0-Cache gezielt invalidiert |

<!-- markdownlint-enable MD013 -->

## Lokale und Disposable Nachweise

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Schritt | Check | Erwartung | Ergebnis | Status |
| --- | --- | --- | --- | --- | --- |
| EV-GUARD-L01 | W0 | PowerShell-Parser für Sensor und Validator | keine Syntaxfehler | je `PARSE_ERRORS=0` | `PASS` |
| EV-GUARD-L02 | W0 | GVN-Ledgerparser | jede Zeile eindeutige ID und genau ein erlaubter Status | 29/29 eindeutige Zeilen; 0 ungültige Status | `PASS` |
| EV-GUARD-L03 | W0 | Markdownlint Roadmap und Evolution Notes | keine Issues | markdownlint-cli2 0.23.2: `0 issues` | `PASS` |
| EV-GUARD-L04 | W0 | Whitespace-/Diffcheck der untracked Guard-Dokumente | keine Fehlerausgabe | keine Whitespacefehler | `PASS` |
| EV-GUARD-L05 | W1 | Zielcontract-Pflichtfeldscan | alle angeforderten Schemas, Dimensionen, Sonderzustände und Grenzen vorhanden | vollständig; W1 Full Review PASS | `PASS` |
| EV-GUARD-L06 | W1 | Security-/Privacy-Schemascan | keine Speicherung sensibler Inhalte erlaubt | Prompt-, Secret-, Health-, Source- und Dump-Ausschlüsse explizit | `PASS` |
| EV-GUARD-L07 | W1 | Migration-/Single-Definition-Review | Schema 3/Validator-Default kompatibel; keine zweite aktive Policy | opt-in Envelope/Shadow erst W4; Workflow bleibt aktiver Owner | `PASS` |
| EV-GUARD-W2A-01 | W2A | PowerShell-Parser und JSON-Parse | Policy/Runner ohne Syntaxfehler; Schemas/Fixtures parsebar | PS `0/0`; JSON `3/3` | `PASS` |
| EV-GUARD-W2A-02 | W2A | Core-Fixturematrix | alle bestätigten W2A-Fälle deterministisch und fail-closed | `24/24`; deterministic true; sideEffectsDetected false | `PASS` |
| EV-GUARD-W2A-03 | W2A | Native Delta-/Contract-/Security-/Privacy-/Scope-Review | pure lokale Policy; keine sensible oder aktive Wirkung | `PASS`; descriptor- und usageTransition-Präzisierung eingearbeitet | `PASS` |
| EV-GUARD-W2B-01 | W2B | Topologie-Fixturematrix | dynamische Profile und verbotene Kombinationen | `12/12`; deterministic true; sideEffectsDetected false | `PASS` |
| EV-GUARD-W2B-02 | W2B | W2A-Regression | aktive Dual-Window- und Kernsemantik unverändert | `24/24` | `PASS` |
| EV-GUARD-W2B-03 | W2B | Native Delta-/Consumer-/Contract-/Privacy-Review | NOT_APPLICABLE ohne Band; unbekannte Profile fail-closed | `PASS`; keine Jittertoleranz aktiviert | `PASS` |
| EV-GUARD-U05 | U5 | kanonischer Validator mit genau einem Refresh | valide Messlage vor W2C | `INVALID: state.status is not a successful measurement status`; keine Roh-State-Interpretation | `SAFE_CLOSURE` |
| EV-GUARD-U05R | U5R | kanonischer Validator mit genau einem Refresh | valide Messlage vor W2C | `VALID`; 43/65; 5h `RESET_CROSSED`, weekly Delta 2 | `CONTINUE` |
| EV-GUARD-W2C-01 | W2C | Cost-/Advisory-Fixturematrix | Eligibility, Confidence, Advisory Lease und deaktivierte Experimente | `12/12`; deterministic true; sideEffectsDetected false | `PASS` |
| EV-GUARD-W2C-02 | W2C | vollständige W2-Regression | W2A/W2B bleiben nach Cost-Delta grün | W2A `24/24`; W2B `12/12`; W2C `12/12` | `PASS` |
| EV-GUARD-W2C-03 | W2C | Parser, JSON und nativer Delta-/Consumer-/Contract-/Security-/Privacy-/Scope-Review | lokale pure Policy; keine aktive/produktive Wirkung | PS `0/0`; JSON parsebar; Review `PASS` | `PASS` |
| EV-GUARD-U06 | U6 | kanonischer Validator mit genau einem Refresh | W3A vollständig zulässig | `VALID`; 35/64; Delta 8/1 bei gleichen Reset-IDs; W3A ist kein kurzer Caution-Block | `CONTINUE_WITH_CAUTION / NO_START` |
| EV-GUARD-U06R | U6R | kanonischer Validator mit genau einem Refresh | valide vollständige Zulassung vor W3A | `VALID`; 92/59; 5h `RESET_CROSSED`, weekly Delta 5 | `CONTINUE` |
| EV-GUARD-W3A-01 | W3A | Resume-/Read-Completeness-Fixturematrix | Fresh/Warm/Long/Unknown, FX-X10 und Dirty Stop | `15/15`; deterministic true; inputMutationDetected false; sideEffectsDetected false | `PASS` |
| EV-GUARD-W3A-02 | W3A | PowerShell-Parser und JSON-Parse | Modul/Runner syntaktisch korrekt; Schema/Fixtures parsebar | PS `0/0`; JSON `2/2` | `PASS` |
| EV-GUARD-W3A-03 | W3A | Native Delta-/Contract-/Security-/Privacy-/Scope-Review | kompakte Metadaten, keine Quellinhalte/Chatnarrative, keine Admissionwirkung | `PASS`; W3B nicht vorgezogen | `PASS` |
| EV-GUARD-U07 | U7 | kanonischer Validator mit genau einem Refresh | valide vollständige Zulassung vor W3B | `VALID`; 86/58; Delta 6/1 bei gleichen Reset-IDs | `CONTINUE` |
| EV-GUARD-W3B-01 | W3B | Match-/Mismatch- und Tier-Fixturematrix | sieben Fingerprints, Tier A/B/C, Missing/Stale/Ambiguous/Partial und Fullmatrix | `19/19`; deterministic true; inputMutationDetected false; sideEffectsDetected false | `PASS` |
| EV-GUARD-W3B-02 | W3B | W3A-Regression und Parser/JSON | Resume-Vertrag bleibt grün; neue Dateien syntaktisch/strukturell parsebar | W3A `15/15`; PS `0/0`; JSON `2/2` | `PASS` |
| EV-GUARD-W3B-03 | W3B | Native Delta-/Consumer-/Contract-/Security-/Privacy-/Scope-Review | Klassifikation rein advisory, Ausführungsbaseline unverändert | `PASS`; keine automatische Reuse-Ausführung | `PASS` |
| EV-GUARD-U08 | U8 | kanonischer Validator mit genau einem Refresh | valide vollständige Zulassung vor W3C | `VALID`; 79/57; Delta 7/1 bei gleichen Reset-IDs | `CONTINUE` |
| EV-GUARD-W3C-01 | W3C | Verification-/Finding-/Dirty-Stop-Fixturematrix | getrenntes Manifest/Scope/Watchlist und sichere Exitgrenzen | `12/12`; deterministic true; inputMutationDetected false; sideEffectsDetected false | `PASS` |
| EV-GUARD-W3C-02 | W3C | vollständige W3-Matrix und Parser/JSON | alle W3-Verträge bleiben grün | W3A `15/15`; W3B `19/19`; W3C `12/12`; PS `0/0`; JSON `2/2` | `PASS` |
| EV-GUARD-W3C-03 | W3C | Native Delta-/Consumer-/Contract-/Security-/Privacy-/Scope-Review | Finding-only/Dirty Stop ohne Diagnose/Repair; Watchlist ohne Mutation | `PASS`; keine Ausführungsautomation | `PASS` |
| EV-GUARD-U09 | U9 | kanonischer Validator mit genau einem Refresh | valide vollständige Zulassung vor W4A | `VALID`; 72/56; Delta 7/1 bei gleichen Reset-IDs | `CONTINUE` |
| EV-GUARD-W4A-01 | W4A | Legacy-/Envelope-/Shadow-Fixturematrix | Defaultkompatibilität, fünf Envelopeklassen und inertes Compare | `13/13`; deterministic true; sideEffectsDetected false | `PASS` |
| EV-GUARD-W4A-02 | W4A | PowerShell-Parser und JSON-Parse | Validator/Shadow/Runner korrekt; Schemas und Fixtures parsebar | PS `0/0/0`; JSON `7/7` | `PASS` |
| EV-GUARD-W4A-03 | W4A | Native Delta-/Consumer-/Contract-/Security-/Privacy-/Scope-/Migrationsreview | Same-Input-Compare; Legacy aktiv; Sensor unverändert | `PASS`; keine Installation oder Policyumschaltung | `PASS` |
| EV-GUARD-U10 | U10 | geänderter kanonischer Validator im Defaultmodus mit genau einem Refresh | Legacy-Default nach W4A real weiter gültig; W4B zulässig | `VALID`; 62/55; Delta 10/1 bei gleichen Reset-IDs | `CONTINUE` |
| EV-GUARD-W4B-01 | W4B | Migration-/Rollback-Fixturematrix | Forward, Rollback, Fallback, Drift und verbotene Aktionen | `12/12`; deterministic true; inputMutationDetected false; sideEffectsDetected false | `PASS` |
| EV-GUARD-W4B-02 | W4B | PowerShell-Parser und JSON-Parse | Modul/Runner korrekt; Schema/Fixtures parsebar | PS `0/0`; JSON `2/2` | `PASS` |
| EV-GUARD-W4B-03 | W4B | Native Delta-/Consumer-/Contract-/Security-/Privacy-/Scope-/Migrationsreview | reale W4A-Fingerprintchain, Legacy-Fallback, keine Mutation | `PASS`; keine Installation, Umschaltung oder Deployment | `PASS` |
| EV-GUARD-U11 | U11 | kanonischer Validator im Legacy-Defaultmodus mit genau einem Refresh | valide vollständige Zulassung vor W4C | `VALID`; 54/53; Delta 8/2 bei gleichen Reset-IDs | `CONTINUE` |
| EV-GUARD-W4C-01 | W4C | Campaign-Asset-Parse und Fingerprintreproduktion | acht eingefrorene Assets; sieben JSON-Dateien parsebar; keine Platzhalter | Campaign `57d932fd...8da9`; Dokument `eb51479d...7045` | `PASS` |
| EV-GUARD-W4C-02 | W4C | deterministischer Kampagnenvertrag | Reihenfolge, Context-Gegenbalancierung, Wiederholung, Scoring, Receipt und Invalidation vollständig | Revision `codex-model-benchmark-v1.0`; Profile owner-gated | `PASS` |
| EV-GUARD-W4C-03 | W4C | Native Contract-/Security-/Privacy-/Scope-/Single-Definition-/Readiness-Review | getrennte Kampagne startbereit; keinerlei Run- oder Guardwirkung | `PASS`; Benchmark `NOT_STARTED` | `PASS` |
| EV-GUARD-U12 | U12 | kanonischer Validator im Legacy-Defaultmodus mit genau einem Refresh vor dem Abschlussreview | valide Zulassung für lokalen reversiblen Dokumentations- und Vorbereitungsblock | `VALID`; 71/48; Reset-IDs 1789071491/1789557306 | `CONTINUE / POST_REHYDRATION_BASELINE` |
| EV-GUARD-W4C-04 | W4C Review | vollständiger Contract-/Architektur-/Red-Team-Review der V1.0-Quellen und des Desktop-Entwurfs | `ARGUS-R01..R13` berechtigt; sechs Guardfälle fachlich erhalten, Aussagegrenze korrigiert | V1.0 `SUPERSEDED_BEFORE_FIRST_RUN`; Runs `0` | `PASS_AFTER_FIX` |
| EV-GUARD-W4C-05 | W4C Review | A.R.G.U.S.-Validator auf V1.1 | elf JSON-Dateien, 23 Assets, zehn Corpusdokumente, sechs Guard- und sechs Document-Fälle; Hash-, Schema-, Visibility-, Privacy-, Citation-, Scoring- und Null-Run-Prüfungen | Campaign `3cb099cb...bef6`; Run-Bundle `1a5eca76...7eaf`; Fehler `0` | `PASS` |
| EV-GUARD-W4C-06 | W4C Review | Read- und Privacy-Nachweis | alte Campaign/Prompt/Contract/Corpus/Gold/Scorer vollständig; zehn ausgewählte Quellen und zehn bereinigte Kopien vollständig gelesen und fingerprintgebunden | Dokument `2d1f82c1...54f7`; Manifest `eb71f37a...019f`; keine secret- oder personenbezogenen Rohwerte im Run-Bundle | `PASS` |
| EV-GUARD-W4C-07 | W4C Review | formale Abschlussmatrix | Markdownlint 5 Dateien/0 Findings; PowerShell-Parse 2/2; Whitespace 28 Dateien/0 Findings; Assetinventar 23/23; `git diff --check` PASS; kein Profilmanifest, Run-Metadata-Objekt, Receipt oder Result | alle durch V1.1 invalidierten Checks grün; alte W0-W4-Codechecks nicht wiederholt | `PASS` |
| EV-GUARD-U13 | V1.2 Rehydration | kanonischer Usage-Validator vor Corpus-/Control-Reads | erste interne Baseline ohne behauptete Pre-Chat-Kostenattribution | `VALID`; 72/32; Reset-IDs 1789089518/1789557306 | `CONTINUE / POST_REHYDRATION_BASELINE` |
| EV-GUARD-U14 | V1.2 Korrekturblock | kanonischer Usage-Validator an Blockgrenze | V1.2-Ausführungsschicht zugelassen | `VALID`; 64/31; Delta 8/1 | `CONTINUE` |
| EV-GUARD-G01 | G-BENCHMARK Vorbereitung | Contract-/Architektur-/Privacy-/Leakage-/Reproducibility-/Scope-/Red-Team-Review | `ARGUS-R14..R23` am realen V1.1-Stand bestätigt und in neuer Revision korrigiert | V1.0/V1.1 je 0 Runs; Gold- und Corpusinhalt unverändert | `PASS_AFTER_FIX` |
| EV-GUARD-G02 | G-BENCHMARK Vorbereitung | V1.2 PRE_FREEZE-Validator und Contractfixtures | 31 Assets, 16 statische JSON-Artefakte, 10 Corpusdokumente, 6+6 Fälle; 3 Positiv-/6 Negativtests | Campaign `e1c24734...eceb`; Run-Bundle `2c18b5a1...8177f` | `PASS` |
| EV-GUARD-G03 | G-BENCHMARK Vorbereitung | Anchor-Scorecard-Arithmetik | vollständige FULL-Fixture ergibt 100/100/100; Duplicate Anchor wird mit Exit 1 abgelehnt | semantische Adjudikation bleibt SCORER-Aufgabe; Outputmutation verboten | `PASS` |
| EV-GUARD-U15 | Profilfreeze | kanonischer Usage-Validator vor begrenztem lokalen Block | genau ein `BOUNDED_LOCAL`: Profilfreeze, Stage-Smoke und Run-01-Vorbereitung | `VALID`; 39/27; Delta 25/4 | `CONTINUE_WITH_CAUTION` |
| EV-GUARD-G04 | Profilfreeze | semantische PROFILE_FROZEN-Validierung | genau zwei eindeutige Profile; A/B/B/A; Replikate 1/1/2/2; konditionale A3/B3 | Profilmanifest `55819483...789c` | `PASS` |
| EV-GUARD-G05 | Run-Stage | positiver und adversarialer Stage-Smoke | 19 Inputs grün; fremde Datei erzeugt `STAGE_EXACT_INVENTORY`; beide Smoke-Stages danach endgültig entfernt | operative Inputisolation, keine OS-Sicherheitsgrenze | `PASS` |
| EV-GUARD-G06 | Run 01 Vorbereitung | RUN_PREPARED-Validator | Metadaten `eed62e8d...0d55`; Stage `4eecb549...719d`; kein Output, Receipt oder Runstart | Position 1 `GPT56_SOL_HIGH` / Replikat 1 | `PASS / NOT_STARTED` |
| EV-GUARD-U16 | Abschluss-Sync | kanonischer Usage-Validator nach operativer Postcondition | kein neuer Block; nur offene Doku-/Prüfpostconditions | `VALID`; 22/25; Delta 17/2 | `SAFE_CLOSURE` |
| EV-GUARD-U17 | Dirty-Stop-Resume | kanonischer Usage-Validator vor finaler Re-Bindung | letzter offener Validatorpatch lokalisiert; neue 5h-Baseline | `VALID`; 100/21; Reset-IDs 1789121120/1789557306 | `CONTINUE / POST_REHYDRATION_BASELINE` |
| EV-GUARD-U18 | Abschluss | kanonischer Usage-Validator nach allen Postconditions | kein neuer Block; Runstart bleibt ownergesteuerter nächster Schritt | `VALID`; 89/19; Delta 11/2 | `CONTINUE_WITH_CAUTION / STOP_AS_PLANNED` |
| EV-GUARD-U19 | V1.3 Repairstart | kanonischer Usage-Validator vor dem begrenzten lokalen Control-Plane-Block | Rehydration bereits sunk; genau ein BOUNDED_LOCAL-Block | `VALID`; 68/16; Reset-IDs 1789121120/1789557306 | `CONTINUE_WITH_CAUTION` |
| EV-GUARD-U20 | V1.3 Abschluss | kanonischer Usage-Validator nach allen operativen Postconditions | beide Resetidentitäten gegenüber U19 geändert; kein Verbrauchsdelta ableitbar | `VALID`; 77/96; Reset-IDs 1789125082/1789711882 | `CONTINUE / STOP_AS_PLANNED` |
| EV-GUARD-G07 | V1.3 Contract-Repair | Response-Ingestion, vollständige Response-/Scorecard-/Receiptkette und abgeleitetes Campaign Result | ARGUS-R24..R33 minimal geschlossen; Gold, Corpus und Aufgaben unverändert | `6` positive und `31` negative Contracttests | `PASS_AFTER_FIX` |
| EV-GUARD-G08 | V1.3 Phasen- und False-PASS-Review | PRE_FREEZE, PROFILE_FROZEN und RUN_PREPARED auf vollständigen Artefakten; unvollständige POST_RUN-/COMPLETE-Ketten adversarial | frühe Phasen PASS; Mengen-False-Passes jeweils abgelehnt | `PASS` |
| EV-GUARD-G09 | V1.3 Run-01-Vorbereitung | exaktes Stage-Inventar und vollständige Fingerprintkette | 39 Assets; 17 statische JSON; 19 Stage-Dateien; keine Runtimeausgabe | `PASS / NOT_STARTED` |
| EV-GUARD-U21 | V1.4 Repairstart | kanonischer Usage-Validator vor dem lokalen Control-Plane-Block | Rehydration bereits sunk; ein kohärenter BOUNDED_LOCAL-Block | `VALID`; 62/94; Reset-IDs 1789125082/1789711882 | `CONTINUE` |
| EV-GUARD-U22 | V1.4 Abschluss | kanonischer Usage-Validator nach allen operativen Postconditions | 5h-Reset gegenüber U21 geändert; dort kein Delta; weekly gleicher Reset und Delta 16 | `VALID`; 58/78; Reset-IDs 1789145710/1789711882 | `CONTINUE / STOP_AS_PLANNED` |
| EV-GUARD-U23 | Attempt-1-Ingestion | kanonischer Usage-Validator vor dem lokalen Klassifikationsblock; ausdrücklich nicht als RUN_END verwendet | Raw-/Attempt-Erfassung und Statussync zugelassen | `VALID`; 47/76; Reset-IDs 1789145710/1789711882 | `CONTINUE_WITH_CAUTION` |
| EV-GUARD-U24 | Attempt-1-Abschluss | kanonischer Usage-Validator nach vollständiger Ingestion-/Klassifikationspostcondition | gleicher Reset wie U23; Delta 10/1; kein Retry | `VALID`; 37/75; Reset-IDs 1789145710/1789711882 | `CONTINUE_WITH_CAUTION / STOP_AS_PLANNED` |
| EV-GUARD-U25 | Run-01-Scoring | kanonischer Usage-Validator vor Scorecard-/Receipt-/POST_RUN-Block | ein BOUNDED_LOCAL-Block zugelassen | `VALID`; 35/74; Reset-IDs 1789145710/1789711882 | `CONTINUE_WITH_CAUTION` |
| EV-GUARD-U26 | Run-01-Scoring-Abschluss | kanonischer Usage-Validator nach valider Scorecard und validem Receipt sowie fail-closed POST_RUN | gleicher Reset wie U25; Delta 10/1; nur Blockersync, kein Run 02 | `VALID`; 25/73; Reset-IDs 1789145710/1789711882 | `SAFE_CLOSURE / STOP_AS_PLANNED` |
| EV-GUARD-G10 | V1.4 Outcome- und Ingestion-Repair | bytegleiche Raw-Erfassung, Success-/Model-Fail-/Technical-Attempt-Klassen, Stage-Revalidierung vor Commit | ungültiges JSON, Fence, fehlende Closure und leerer Output bleiben sichtbar; Race-Drift erzeugt keinen kanonischen Write | lokale Positiv-/Negativmatrix | `PASS_AFTER_FIX` |
| EV-GUARD-G11 | V1.4 Campaign- und Entscheidungsvertrag | tatsächlicher Campaign-Dokumenthash, 5,0-Punkte-Margin, Confidence aus Abstand und Streuung | Gleichheit, 0,1, unter/auf/über Margin sowie Third-Run- und Technical-Exclusion-Fixtures | deterministisch abgeleitet | `PASS` |
| EV-GUARD-G12 | V1.4 Run-01-Vorbereitung | V1.4-Profil, Metadata und exakter 19-Input-Stage; keine Runtimeausgabe | `READY_TO_RUN / RUN_01_PREPARED / NOT_STARTED`; V1.0-V1.3 je null Runs | Dokument `e75c9f64...44db`; Campaign `bc41ed14...38b2`; Bundle `0e126151...2088`; Tool `aa8ff1c3...c2d`; Profil `fb7e779b...f12a`; Metadata `8c5c5dc0...d8e4`; Stage `c443c687...904c`; Manifestdatei `4dce1d88...e84e` | `PASS / NOT_STARTED` |
| EV-GUARD-G13 | Run 01 Attempt 1 Ingestion | Source und kanonischer Raw Output je 23 Bytes und SHA-256 `e4e941ad...b9b8d`; Attempt `94ab14db...5d9f`; Stage `c443c687...904c` vor und nach Import valide | `MODEL_FAIL_COMPLETE`; Reason Codes `INVALID_RESPONSE_ENVELOPE`, `INVALID_JSON`; keine strukturierte Response; kein Retry | Attempt `qualityIncluded=true`, `retryDisposition=RUN_SLOT_COMPLETE`; Manifeststatus `RUNNING`, Dateihash `fbefdd84...ede4` | `PASS / SCORING_PENDING` |
| EV-GUARD-G14 | Run 01 Scoring und Receipt | Scorecard `936f7167...b18c`; Receipt `2888b236...ae3f`; direkte V1.4-Vertragsvalidierung | Scores 0/0/0; Critical Failure `INVALID_RESPONSE_ENVELOPE`; PRE_RUN fehlt; RUN_END kanonisch; Usage `INELIGIBLE` | vollständiger POST_RUN ruft Stage-Validator wegen ARGUS-R38 fehlerhaft im Erzeugungsmodus auf | `PARTIAL_PASS / POST_RUN_BLOCKED` |
| EV-GUARD-U27 | V1.5-Repairstart | kanonischer Usage-Validator vor dem ownerautorisierten lokalen ARGUS-R38-Block | neue 5h-Resetidentität; kein Delta zu U26 | `VALID`; 94/68; Reset-IDs 1789163772/1789711882 | `CONTINUE / BOUNDED_LOCAL` |
| EV-GUARD-G15 | V1.5 ARGUS-R38 und Run-02-Vorbereitung | echter Run-01-POST_RUN, Migrationsbindung, 9 positive und 54 negative Contracttests, exakter Run-02-Stage | V1.4-Runtimehashes unverändert; Run 01 nicht wiederholt oder neu gescort; Run 02 nicht gestartet | Campaign `642151ef...1a31`; Bundle `4778103c...a449`; Tool `f09a7c9b...e162`; Profil `a8b5a7a2...b4cb`; Metadata `ec06c9e6...1873`; Stage `a5fb474e...5113` | `PASS / NOT_STARTED` |
| EV-GUARD-U28 | V1.5-Abschluss | kanonischer Usage-Validator nach allen operativen Postconditions | gleiche Resetidentitäten wie U27; Delta 42/7; kein Runstart | `VALID`; 52/61; Reset-IDs 1789163772/1789711882 | `CONTINUE / STOP_AS_PLANNED` |
| EV-GUARD-U29 | Run-02-Scoringstart | kanonischer Usage-Validator vor dem begrenzten lokalen Abschlussblock | Rehydrationsbaseline; keine Rekonstruktion von PRE_RUN oder RUN_END | `VALID`; 26/57; Reset-IDs 1789163772/1789711882 | `CONTINUE_WITH_CAUTION / BOUNDED_LOCAL` |
| EV-GUARD-G16 | Run 02 Attempt, Scorecard und Receipt | Raw `e4e941ad...b9b8d`; Attempt `c957380a...39e2`; Scorecard `5eaca120...9368`; Receipt `d291e36e...4a1e` | `MODEL_FAIL_COMPLETE`; 0/0/0; Critical Failure `INVALID_RESPONSE_ENVELOPE`; PRE_RUN und RUN_END fehlen; Usage `INELIGIBLE` | echter Run-Chain- und vollständiger POST_RUN-Nachweis `PASS` |
| EV-GUARD-G17 | Run-03-Vorbereitung | Metadata `9bbcb554...102d`; exakter 19-Dateien-Stage `f722fed6...5d7e` | Position 3, GPT6_ASTRA_MEDIUM, Medium, Replikat 2, FRESH_MINIMAL; nicht gestartet | `PASS / NOT_STARTED` |
| EV-GUARD-U30 | Run-02-/Run-03-Abschluss | kanonischer Usage-Validator nach sämtlichen operativen Postconditions | gleiche Resetidentitäten wie U29; Delta 19/3; kein weiterer Block und kein Runstart | `VALID`; 7/54; Reset-IDs 1789163772/1789711882 | `SAFE_CLOSURE / STOP_AS_PLANNED` |
| EV-GUARD-U31 | V1.6-/Console-Abschluss | kanonischer Usage-Validator nach Phase-A-Closure und Phase-B-Postcondition; keine Run-Usage-Evidence | gleicher Reset wie Phase-B-Baseline; Abschlussstand 76/96; kein Runstart | `VALID`; Reset-IDs 1789219257/1789806057 | `OK / STOP_AS_PLANNED` |
| EV-GUARD-U32 | Smoke-Session-Auto-Discovery-Start | kanonischer Usage-Validator vor dem begrenzten Operator-Friction-Repair; keine Run-Usage-Evidence | gleicher Reset wie U31; Blockbaseline 62/94; kein Runstart | `VALID`; Reset-IDs 1789219257/1789806057 | `CONTINUE / BOUNDED_LOCAL` |
| EV-GUARD-U33 | Smoke-Session-Auto-Discovery-Closure | kanonischer Usage-Validator nach Discovery-, Browser- und vollständiger Control-Plane-Matrix; keine Run-Usage-Evidence | gleiche Reset-IDs wie U32; Delta 24/4; Abschlussstand 38/90; kein Runstart | `VALID`; Reset-IDs 1789219257/1789806057 | `CONTINUE / STOP_AS_PLANNED` |
| EV-GUARD-U34 | finale Operator-Friction-Wave Start | kanonischer Usage-Validator nach Dirty-Stop-Rehydration und vor Fortsetzung des bestehenden Operator-Blocks; keine Run-Usage-Evidence | neue 5h-Resetidentität gegenüber U33; Blockbaseline 99/84; kein Runstart | `VALID`; Reset-IDs 1789249643/1789806057 | `CONTINUE / BOUNDED_LOCAL` |
| EV-GUARD-U35 | finale Operator-Friction-Wave Closure | kanonischer Usage-Validator nach Operator-, Browser-, Contract-, Hash- und Null-Run-Postconditions; keine Run-Usage-Evidence | gleiche Reset-IDs wie U34; Delta 21/3; Abschlussstand 78/81; kein Runstart | `VALID`; Reset-IDs 1789249643/1789806057 | `CONTINUE / STOP_AS_PLANNED` |
| EV-GUARD-G19 | V1.6 Operator Console vor Auto-Discovery | Standalone-HTML Pre-Hygiene `4be721c6...9335`, Post-Hygiene `d98e07e1...1e6c`; Browser-Zustandsmatrizen | Open Folder, Owner-Attestation und maschinelle Binding-Evidence getrennt; PRE erst nach Binding-PASS; rungebundener Smoke-/Interference-State fail-closed; PRE-/END-Quellpfade ohne erfundene Kanonizität | initial `40/40`, Hygiene `17/17`; keine Console-/Page-Errors; kein Runstart | `PASS / SUPERSEDED_BY_EV-GUARD-G20` |
| EV-GUARD-G20 | V1.6 Smoke-Session-Auto-Discovery | Finder `64c594a2...b76d`; Test `3f913dce...c8e6`; Console `8719213e...1262`; unveränderter kanonischer Binding-Validator | genau ein frischer, revisions-/run-/profil-/stagegebundener NON_SCORED-Smoke wird ausgewählt; kein Treffer, Mehrdeutigkeit, falscher CWD/Run, TESTED_AGENT-Inhalt und ungültiges Log fail-closed; manueller Pfad nur gleich streng validierter Fallback | Discovery `9/9`; Browserzustand `13/13`; vollständige V1.6-Matrix `12 positiv / 55 negativ`; RUN_PREPARED grün; kein Runstart | `PASS / SMOKE_SESSION_AUTO_DISCOVERY_READY` |
| EV-GUARD-G21 | V1.6 Tested-Agent-Discovery und Usage-Capture | Agent-Finder `2d416993...c54a`; Finder-Test `47c17160...c59b`; Capture-Helper `45d0505a...dae9`; Capture-Test `9fb9226e...8b02`; Console `e04955dc...f4a8`; bestehende V1.6-Binding-/Usage-Validatoren unverändert | exakt eine vollständige Tested-Agent-Session mit Stage-CWD, Startprompt und strengem PRE/END-Zeitanker; PRE/END-Quellen deterministisch operatorseitig, atomar, immutable und rungebunden; RUN_END bleibt erste Aktion nach dem finalen Output; manuelle Sessionangabe nur gleich strenger Diagnose-Fallback | Agent Discovery `11/11`; Capture `9/9`; Smoke-Regression `9/9`; Browserzustand `20/20`; V1.6 `12 positiv / 55 negativ`; JSON `35/35`; PowerShell `18/18`; Historie `11/11`; keine V1.6-Runtimeartefakte | `PASS / ARGUS_READY_FOR_VALID_RUNS / NOT_STARTED` |
| EV-GUARD-U36 | Live-Smoke-Discovery-Repair Start | kanonischer Usage-Validator vor dem begrenzten Operator-Tool-Block; keine Run-Usage-Evidence | Blockbaseline 74/80; kein Runstart | `VALID`; Messzeit `2026-09-12T19:10:46.7626394+02:00`; Reset-IDs 1789249643/1789806057 | `CONTINUE / BOUNDED_LOCAL` |
| EV-GUARD-U37 | Live-Smoke-Discovery operative Closure | kanonischer Usage-Validator nach Repair, echter Smoke-Wiederverwendung und Binding-PASS; keine Run-Usage-Evidence | 48/76; 5h-Reset-ID weicht um eine Sekunde von U36 ab, daher kein Delta behauptet; kein PRE_RUN und kein Runstart | `VALID`; Messzeit `2026-09-12T19:22:48.5178326+02:00`; Reset-IDs 1789249644/1789806057 | `CONTINUE / DOCUMENTATION_CLOSURE` |
| EV-GUARD-G22 | Live-Smoke-Discovery ReadLines-Repair | Finder `015961c0...f948`; Test `da82ee5d...b91c`; unveränderter kanonischer Binding-Validator `3bf50ae5...344e`; bestehender Smoke `c6f9212c...4770`; Binding `c7babb9f...a4d0` | `ReadLines` traf während des offenen Smoke-Chats auf Windows-Sharingfehler `IOException/0x80070020`; Finder klassifiziert dies nun fail-closed als `SMOKE_SESSION_NOT_READABLE` mit Pfad und vollständiger Exceptionkette; derselbe Smoke wurde nach Freigabe unverändert wiederverwendet | Discovery `10/10`; V1.6-Verträge `12 positiv / 55 negativ`; Stage `19/19`; Historie `11/11`; null V1.6-Benchmark-Runtimeartefakte | `PASS / WORKSPACE_BINDING_EVIDENCE_PASS / PRE_RUN_READY / NOT_STARTED` |
| EV-GUARD-U38 | Pilot-Closure Start | kanonischer Usage-Validator vor dem additiven Closure- und Owner-Override-Block; keine Run-Usage-Evidence | Rehydrationsbaseline U38a 99/70; Blockgate 86/68; gleicher Reset; keine Schätzung des vor Rehydration verbrauchten Anteils | `VALID`; Messzeit `2026-09-13T06:50:57.8994162+02:00`; Reset-IDs 1789292755/1789806057 | `CONTINUE / BOUNDED_DOCUMENTATION` |
| EV-GUARD-G23 | A.R.G.U.S.-Pilotclosure und G-BENCHMARK-Override | Closure-Record; eingefrorenes Campaign-Dokument `33961229...b9d7`; Campaign `b63975ac...dfc6`; Session `461c0cc6...f8ee`; PRE_RUN `764d182b...9dc`; RUN_END `b8032d76...64b2`; Workspace-Binding `c7babb9f...a4d0` | Pilot `BENCHMARK_INCOMPLETE`; Run 01 bleibt vollständig, ungescort und nicht wiederholbar; keine Vergleichsentscheidung; GPT-5.6 Sol / High ausschließlich `OWNER_SELECTED` | kein Raw-Import, Scoring, Result oder weiterer Run; eingefrorene Campaignassets unverändert | `PASS / OWNER_OVERRIDE_ACCEPTED / W5_READY` |
| EV-GUARD-U39 | W5 Start | kanonischer Usage-Validator vor altem/neuem Orakel, Aktivierung und SDEF-001 | gleicher Reset wie U38; 82/68; Sensor/Validator unverändert | `VALID`; Messzeit `2026-09-13T06:53:27.9769618+02:00`; Reset-IDs 1789292755/1789806057 | `CONTINUE / BOUNDED_LOCAL` |
| EV-GUARD-W5-01 | W5 Orakel- und Rollbackpreflight | W2A 24/24, W2B 12/12, W2C 12/12, W3A 15/15, W3B 19/19, W3C 12/12, W4A 13/13, W4B 12/12; Legacy- und Envelope-Validator PASS | vollständige bestehende Transitionmatrix sowie Legacy-Fallback vor Cutover grün | Policy/Schema/Fixture-/Validatoränderung | `PASS / 111_OF_111` |
| EV-GUARD-W5-02 | Aktiver Guard-vNext-Postimage | Config `306a6202...c489`; Activation `5f325cfe...c0f79`; Test `fd9e9e26...a640`; Policy `87ec8995...0df9`; Validator `2174bc2c...2082`; Sensor `3d8f8601...c8d1` | `guard-vnext/1` ist lokal aktives Governance-Orakel; automatische Aktionen aus; Legacy-JSON-Default und Rollback erhalten | Drift an einem gebundenen Artefakt oder aktiver Vertragsquelle | `PASS / 8_OF_8 / GUARD_VNEXT_ACTIVE` |
| EV-GUARD-W5-03 | SDEF-001 | Workflow Contract `8c91cb65...d378`; AGENTS `5ff1e41e...f0bc`; DEV_ENVIRONMENT `93079ca9...c287`; Templates, aktive Roadmap und nichtnormative Evolution Notes fokussiert geprüft | genau ein aktiver Detailowner; andere Quellen sind Reference, Sensor/Bedienung, Struktur, Execution State oder Historical/Future | aktive zweite Detaildefinition oder semantische Abweichung | `PASS / F-GUARD-01_CLOSED` |
| EV-GUARD-U40 | W6A Start | kanonischer Usage-Validator vor der integrierten S5.1-Matrix | gleicher Reset wie U39; 65/65; keine parallele Nutzung beobachtet | `VALID`; Messzeit `2026-09-13T06:59:35.4018933+02:00`; Reset-IDs 1789292755/1789806057 | `CONTINUE / INTEGRATED_REVIEW` |
| EV-GUARD-W6A-01 | integrierte Guardmatrix | W2A 24, W2B 12, W2C 12, W3A 15, W3B 19, W3C 12, W4A 13, W4B 12, W5 8 | vollständiger technischer Guard-vNext-Postimage ohne Seiteneffekt | Änderung an Guardcode, Config, Aktivierung, Schema oder Fixtures | `PASS / 119_OF_119` |
| EV-GUARD-W6A-02 | Parser, JSON und Sensorbindung | 14 PowerShell-Dateien; 23 Guard-JSON-Dateien; Sensor repo/installiert `3d8f8601...c8d1` | Syntax/Parse vollständig grün; Sensorinstallation unverändert und bytegleich | Änderung an geprüfter Datei oder installierter Sensorkopie | `PASS` |
| EV-GUARD-W6A-03 | technischer Runtime-Fingerprint | sortierte relative Pfade plus SHA-256 aller Dateien unter `tools/codex-usage` | `759651d880f9bb851eef40df12118a653b3342cdea0de322cdb45629ae85bf5e` | jede Dateiänderung unter `tools/codex-usage` | `PASS / W6A_POSTIMAGE` |
| EV-GUARD-U41 | W6B Start | kanonischer Usage-Validator vor Full Review und SDEF-002 | gleicher Reset wie U40; 61/64; keine Run-Usage-Evidence | `VALID`; Messzeit `2026-09-13T07:01:08+02:00`; Reset-IDs 1789292755/1789806057 | `CONTINUE / INTEGRATED_REVIEW` |
| EV-GUARD-W6B-01 | nativer Full Review und SDEF-002 | aktive Vertragsquellen, Guardcode, Schemas, Consumer, Fixtures und Scopegrenzen | drei berechtigte Findings F-GUARD-29..31; keine weitere Failure Class; Single Definition bleibt eindeutig | Korrekturen und gezielte Regression | `PASS_AFTER_FIX / SDEF_002_PASS` |
| EV-GUARD-W6B-02 | externer Review | kanonischer CodeRabbit-Initiallauf und ein Verifikationslauf | initial 3 berechtigte Findings; Verifikation 0 Findings | keine weitere Ausführung zulässig oder erforderlich | `PASS_AFTER_FIX` |
| EV-GUARD-W6B-03 | invalidierte Regression | Policy W2A 24, W2B 12, W2C 12, Contracts 15, Evidence 19, Verification 13, Shadow 13, Activation 10 | 118/118 deterministisch grün; Protected-Descendant- und Schema-Paritätsregressionen enthalten | Änderung an korrigierten Modulen, Schemas, Fixtures, Aktivierung oder Tests | `PASS / 118_OF_118` |
| EV-GUARD-W6B-04 | finales technisches Postimage | Runtime `9658d0db4f88cf26092d76423fc028c8b0ea23b26c682ca613ce5df31258091f`; Verification `e4ed55df...9c97`; Policy-Input `03c8358b...aa0`; Telemetry `0724da3d...aca2`; Activation `e7c3c5bd...7016` | fingerprintgebundener W6B-Stand ohne offene P0/P1 | jede Änderung unter `tools/codex-usage` | `PASS / W6C_READY` |
| EV-GUARD-U42 | W6C Start | kanonischer Usage-Validator vor Source-of-Truth-Sync und Abschlussdokumentation; keine Run-Usage-Evidence | gleicher Reset wie U41; 47/62 | `VALID`; Messzeit `2026-09-13T07:15:24.6973107+02:00`; Reset-IDs 1789292755/1789806057 | `CONTINUE / DOCUMENTATION_CLOSURE` |
| EV-GUARD-U43 | W6C Abschluss | kanonischer Usage-Validator nach vollständiger technischer und dokumentarischer Postcondition; keine Run-Usage-Evidence | gleicher Reset wie U42; 24/58; exaktes W6C-Delta 23/4 | `VALID`; Messzeit `2026-09-13T07:27:35.4120255+02:00`; Reset-IDs 1789292755/1789806057 | `SAFE_CLOSURE / STOP_AS_PLANNED` |
| EV-GUARD-W6C-01 | Context Bridges und Evolution-Kontinuität | KASRKIN Overview `af19104b...2f78`; A.R.G.U.S. Overview `ba7413dd...ffa1`; Evolution Notes `5e243939...abb5`; README `ef8e541d...0529`; Changelog `94569108...c70b` | aktueller Guard-/KASRKIN-Stand und unvollständiger A.R.G.U.S.-Pilot sind für einen frischen Chat getrennt auffindbar; Pläne bleiben Zukunft | Änderung an einer genannten Context Bridge oder Statusquelle | `PASS / CONTEXT_READY` |
| EV-GUARD-W6C-02 | formaler Abschlusskandidat | 25 Guard-/Closure-JSON; 14 PowerShell-Dateien; Aktivierung 10/10; sechs historische Pilotbindungen; sieben Control-Markdowns; lokale Links und Privacy | parse-, hash-, referenz- und hygienegrün; Markdownlint-CLI nicht installiert und daher dokumentierter lokaler Control-Check | Änderung am Abschlusskandidaten | `PASS` |
| EV-GUARD-W6C-03 | DONE-Archivierung | Roadmap `ceffaeb4...d3d2`; eindeutige Archivepfade für Roadmap und Evidence | nur Guard-Roadmap/Evidence verschoben; A.R.G.U.S.-Campaign und Run-Evidence unverändert am kanonischen Ort | Änderung an archivierter Roadmap/Evidence oder Pilot-Evidence | `PASS / ARCHIVED` |

<!-- markdownlint-enable MD013 -->

## Evidence-Gültigkeit und Invalidation

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Inputs / Fingerprints | Belegte Aussage | Invalidiert durch | Wiederverwendet in |
| --- | --- | --- | --- | --- |
| EV-GUARD-B02 | Sensor `3d8f8601...37c8d1` | aktiver v3.1.0-/Schema-3-Sensor ist bytegleich | Sensor-/Schema-/Installationsdrift | W2 Regression, W4 Migration |
| EV-GUARD-B03 | Validator-W0-Preimage `357c4227...bccf6e` | W0-W3 verwendeten den validen Legacy-Validator | durch W4A-Validatoränderung invalidiert und durch EV-GUARD-W4A-01..03 ersetzt | historische W0-W3-Gates |
| EV-GUARD-B04 | R14 Roadmap `00fd1371...572e`; Evidence `a7f4fb84...3b78` | historische 75/11- und 13/2-Receipts | Änderung der archivierten Quellen oder neue Zuordnungsfrage | W1 Forecast; spätere Cost-Eignungsprüfung |
| EV-GUARD-L02 | Roadmap-W0-Postimage | Ledger ohne Doppelstatus/-owner | Änderung am GVN-Ledger | W1-W6 |
| EV-GUARD-L05/L06/L07 | W1-Zielcontract und W0-Live-Quellen | W2A ist contract-, privacy- und migrationsbereit | Änderung an Zielcontract, Workflow, Schema oder Finding der Failure Class `NEW_FAILURE_CLASS` | W2-W4 |
| EV-GUARD-W2A-01..03 | W2-Postimage: Policy `87ec8995...0df9`; Runner `86864567...bd18`; Inputschema `c302c41d...e756`; Outputschema `3dfc03d4...e02f`; Fixtures `6224ac8b...1d40` | W2A-Kernzustände und 24 Core-Fixtures im finalen W2-Postimage grün | Änderung an einem genannten File, W1-Zielcontract oder direktem Consumer | W2B/W2C/W4 |
| EV-GUARD-W2B-01..03 | W2-Postimage: Policy `87ec8995...0df9`; Runner `86864567...bd18`; Inputschema `c302c41d...e756`; W2B-Fixtures `858f6e7a...5221` | 12 Topologiefälle und 24 Core-Regressionen im finalen W2-Postimage grün | Änderung an Policy, Runner, Topologie-/Resetvertrag oder Fixtures | W2C/W4 |
| EV-GUARD-U05 | Validator `357c4227...bccf6e`; Gate nach abgeschlossenem W2B | W2C war nicht zugelassen und wurde nicht begonnen | ein neues valides kanonisches U5R ersetzt ausschließlich den Gatezustand | Resume vor W2C |
| EV-GUARD-U05R | Validator `357c4227...bccf6e`; 5h Reset `1789035419`; weekly Reset `1789557306` | W2C war mit 43/65 im `CONTINUE`-Band zugelassen | neuer Gatecheckpoint; Sensor-/Validator-/Resetdrift | W2C |
| EV-GUARD-W2C-01..03 | Policy `87ec8995...0df9`; Runner `86864567...bd18`; Inputschema `c302c41d...e756`; Outputschema `3dfc03d4...e02f`; Costschema `66f15fee...b5c`; Fixtures A/B/C `6224ac8b...1d40` / `858f6e7a...5221` / `4eb48a74...c901` | vollständige pure W2-Policymatrix ist deterministisch, fail-closed und ohne Seiteneffekt | Änderung an Policy, Runner, Schema, Fixture, W1-Zielcontract oder direktem Consumer | W3/W4/W6 |
| EV-GUARD-U06 | Validator `357c4227...bccf6e`; 5h Reset `1789035419`; weekly Reset `1789557306` | W3A wurde unter Caution nicht begonnen; W2-Postimage bleibt sicher | neuer Gatecheckpoint oder Drift an Validator/Usage-Vertrag | Resume vor W3A |
| EV-GUARD-U06R | Validator `357c4227...bccf6e`; 5h Reset `1789053422`; weekly Reset `1789557306` | W3A war mit 92/59 im `CONTINUE`-Band zugelassen | neuer Gatecheckpoint oder Sensor-/Validator-/Resetdrift | W3A |
| EV-GUARD-W3A-01..03 | W3B-Postimage: Contractmodul `c1882a15...8b69`; Runner `ba2a4221...ed81`; Schema `ad3442db...a451`; Fixtures `4f0b6ee5...56b1` | Minimal Resume Working Set und Read Completeness bleiben im aktuellen Contractmodul deterministisch und ohne Seiteneffekt | Änderung an Modul, Runner, Schema, Fixtures oder Resume-/Read-Completeness-Vertrag | W3B/W3C/W4 |
| EV-GUARD-U07 | Validator `357c4227...bccf6e`; 5h Reset `1789053422`; weekly Reset `1789557306` | W3B war mit 86/58 im `CONTINUE`-Band zugelassen | neuer Gatecheckpoint oder Sensor-/Validator-/Resetdrift | W3B |
| EV-GUARD-W3B-01..03 | Contractmodul `c1882a15...8b69`; Evidence-Runner `3dabfa7b...c590`; Schema `fbfaa564...5b54`; Fixtures `be36222c...b525` | getrennte advisory Evidence-Klassifikation und vollständige Fingerprintmatrix belegt | Änderung an Modul, Runner, Schema, Fixtures, Tier-/Reuse-/Failure-Class-Vertrag | W3C/W4 |
| EV-GUARD-U08 | Validator `357c4227...bccf6e`; 5h Reset `1789053422`; weekly Reset `1789557306` | W3C war mit 79/57 im `CONTINUE`-Band zugelassen | neuer Gatecheckpoint oder Sensor-/Validator-/Resetdrift | W3C |
| EV-GUARD-W3C-01..03 | Verification-Modul `58796e8b...134c`; Runner `8bf2c47f...08d4`; Schema `ece2853d...9b5f`; Fixtures `d2487c2b...bf1b` | Verification Mise en Place und synthetischer Finding-/Dirty-Stop-/Resume-Roundtrip belegt | Änderung an Modul, Runner, Schema, Fixtures oder Verification-/Exitvertrag | W4 |
| EV-GUARD-U09 | Validator-Preimage `357c4227...bccf6e`; 5h Reset `1789053422`; weekly Reset `1789557306` | W4A war mit 72/56 im `CONTINUE`-Band zugelassen | abgeschlossenes W4A-Delta; neuer Gatecheckpoint | W4A |
| EV-GUARD-W4A-01..03 | Validator `2174bc2c...2082`; Sensor `3d8f8601...c8d1`; Shadow-Modul `51292fdc...4ef1`; Runner `3cde9113...ac29`; Envelope-Schema `47013d82...bbb1`; Shadow-Schema `15efbbc0...027a`; W4A-Fixtures `7d574def...fb84`; State-Fixtures `fac162b9...2de6`, `d403d8a1...4e43`, `83486ed9...ae60`, `8eacb034...6c47` | opt-in Envelope, Legacy-Defaultkompatibilität und inert Same-Input-Shadow belegt | Änderung an Validator, Sensor, Adapter, Shadow-Modul/-Runner, Schema oder Fixtures | W4B/W6 |
| EV-GUARD-U10 | Validator `2174bc2c...2082`; 5h Reset `1789053422`; weekly Reset `1789557306` | W4B war mit 62/55 im `CONTINUE`-Band zugelassen; neuer Defaultpfad real validiert | neuer Gatecheckpoint oder Validator-/Sensor-/Resetdrift | W4B |
| EV-GUARD-W4B-01..03 | Migration-Modul `84789b19...378a`; Runner `6115af3c...2b7a`; Schema `c41f179a...e8a4`; Fixtures `a9fe23d4...0ecf`; reale W4A-Fingerprintchain | Forward-/Rollbackvorbereitung und sicherer Legacy-Fallback ohne Cutover/Installation belegt | Änderung an Migration-Artefakten, W4A-Fingerprints oder Aktivierungsgrenzen | W4C/W6 |
| EV-GUARD-U11 | Validator `2174bc2c...2082`; 5h Reset `1789053422`; weekly Reset `1789557306` | W4C war mit 54/53 im `CONTINUE`-Band zugelassen | neuer Gatecheckpoint oder Validator-/Sensor-/Resetdrift | W4C |
| EV-GUARD-W4C-01..03 | historisches V1.0-Kampagnendokument `eb51479d...7045`; Campaign `57d932fd...8da9` | vollständige historische Null-Run-Evidence; durch Review als allgemeiner Benchmarkpostimage abgelöst | niemals für V1.1-Runs wiederverwenden; nur Historie | Decision Log |
| EV-GUARD-U12 | Validator `2174bc2c...2082`; 5h Reset `1789071491`; weekly Reset `1789557306` | Reviewblock war mit 71/48 im `CONTINUE`-Band zugelassen; Rehydration sunk | neuer Gatecheckpoint oder Validator-/Sensor-/Resetdrift | A.R.G.U.S.-Review |
| EV-GUARD-W4C-04..07 | Dokument `2d1f82c1...54f7`; Manifest `eb71f37a...019f`; 23 Asset-Hashes; Campaign `3cb099cb...bef6`; Run-Bundle `1a5eca76...7eaf`; Toolcontract `7783928d...cd74` | V1.1 trennt Suites und Sichtbarkeit, bindet Rollen, Run-Metadaten, Fixed Work, zehn Dokumente, sechs konkrete Packets, Scoringböden und Null-Run-Status | jede Asset-/Contract-/Corpus-/Gold-/Scorer-/Schemaänderung; Profil- oder Runabweichung; neue Failure Class | G-BENCHMARK/W5 |
| EV-GUARD-G01..06 | Dokument `71dc7cee...47c2`; Manifest `ffd01bba...8689`; 31 Asset-Hashes; Campaign `e1c24734...eceb`; Run-Bundle `2c18b5a1...8177f`; Toolcontract `283dfb16...2f58`; Profil `55819483...789c`; Stage `4eecb549...719d` | V1.2 schließt Ausführungsschicht, Profile und Run-01-Stage ohne Benchmarkrun; V1.0/V1.1 bleiben Null-Run-Historie | Änderung an Asset, Profilmanifest, Run-Metadaten oder Stage; tatsächlicher Run erzeugt neue POST_RUN-Evidence | G-BENCHMARK / RUN_01_START |
| EV-GUARD-G07..09 | 39 Asset-Hashes; Campaign `0634e1d9...47294`; Run-Bundle `cfaed4f9...f1f4d`; Toolcontract `0b4864f2...d3fec`; Profil `6aa36dc2...c8b61`; Metadata `d47055c2...825ba`; Stage `20c3061e...3fa2c` | V1.3 schließt Ingestion, Kettenvalidierung, Usage Eligibility und Resultableitung ohne Benchmarkrun; V1.0-V1.2 bleiben Null-Run-Historie | Änderung an V1.3-Asset, Profilmanifest, Metadata oder Stage; tatsächlicher Run erzeugt neue POST_RUN-Evidence | G-BENCHMARK / OWNER_POSTIMAGE_CHECK |
| EV-GUARD-G10..12 | Dokument `e75c9f64...44db`; Campaign `bc41ed14...38b2`; Bundle `0e126151...2088`; Tool `aa8ff1c3...c2d`; Profil `fb7e779b...f12a`; Metadata `8c5c5dc0...d8e4`; Stage `c443c687...904c`; Vor-Run-Manifestdatei `4dce1d88...e84e` | V1.4 schließt False-Drop, Campaign-Drift, Import-Race und Null-Margin-Bias im Vor-Run-Postimage; V1.0-V1.3 bleiben Null-Run-Historie | Änderung an Campaign-Dokument, V1.4-Asset, Profilmanifest, Metadata oder Stage; durch EV-GUARD-G13 für den tatsächlichen Attempt fortgeführt | G-BENCHMARK / RUN_01_SCORING_PENDING |
| EV-GUARD-G13 | Raw `e4e941ad...b9b8d`; Attempt-Record; Stage `c443c687...904c`; Metadata `8c5c5dc0...d8e4`; laufendes Manifest `fbefdd84...ede4` | Attempt 1 ist unverändert sichtbar und strikt MODEL_FAIL_COMPLETE; kein technischer Fehler und kein stiller Retry | Änderung an Raw, Attempt, Stage, Metadata oder Outcome; nachfolgende Scorecard-/Receipt-Bindung | G-BENCHMARK / RUN_01_SCORING_PENDING |
| EV-GUARD-G15 | Migration `ARGUS-V14-TO-V15-RUN-01`; historische V1.4-Bindungen; aktive V1.5-Fingerprints; Run-02-Stage `a5fb474e...5113` | ARGUS-R38 ist minimal geschlossen, Run 01 vollständig POST_RUN-valide und Run 02 reproduzierbar vorbereitet | Änderung an Migration, V1.4-Run-01-Evidence, aktivem V1.5-Asset, Profil, Run-02-Metadata oder Stage | G-BENCHMARK / RUN_02_READY_FOR_OWNER_START |
| EV-GUARD-G16 | Run-02-Raw/Attempt/Scorecard/Receipt und Stage `a5fb474e...5113` | Run 02 ist vollständig POST_RUN-valide; Modellfehler bleibt qualitäts- und triggerwirksam, Usage getrennt ineligible | Änderung an Run-02-Raw, Attempt, Scorecard, Receipt, Metadata oder Stage | G-BENCHMARK / RUN_03_READY_FOR_OWNER_START |
| EV-GUARD-G17 | Run-03-Metadata `9bbcb554...102d`; Stage `f722fed6...5d7e` | nächster A/B/B/A-Basisslot reproduzierbar vorbereitet und nicht gestartet | Änderung an aktivem V1.5-Asset, Profil, Metadata oder Stage | G-BENCHMARK / RUN_03_READY_FOR_OWNER_START |
| EV-GUARD-G18 | Migration `d3819d64...47b8`; Dokument `33961229...b9d7`; Campaign `b63975ac...dfc6`; Bundle `b69a1303...8541`; Tool `89c93a25...db87`; Profil `fa2d2798...56e3`; Metadata `74abdb80...188c`; Stage `b35d7a72...af5` | alte Runs 01/02 technisch invalid und qualitätsneutral; alter Run 03 retired; explizites Stage-Binding und separate Usage-Evidence sind prospektiv erzwungen; 12 positive und 55 negative Tests einschließlich integrierter POST_RUN-Kette grün | Änderung an Migration, altem gebundenem Artefakt, V1.6-Asset, Profil, Metadata oder Stage | G-BENCHMARK / V1.6_RUN_01_READY_FOR_OWNER_START |
| EV-GUARD-G19 | Operator Console Post-Hygiene `d98e07e1...1e6c`, Pre-Hygiene `4be721c6...9335`; V1.6-Binding-/Usage-Verträge | lokale Bedienhilfe erzwingt die V1.6-Gatereihenfolge und erzeugt keinen eigenen Workspace-, Usage- oder Scoring-Wahrheitsbestand | durch EV-GUARD-G20 erwartbar ersetzt; historische QA bleibt gültig | EV-GUARD-G20 |
| EV-GUARD-G20 | Finder `64c594a2...b76d`; Discovery-Test `3f913dce...c8e6`; Console `8719213e...1262`; V1.6-Binding-Validator unverändert | Bedienhilfe entfernt die Pfadsuche aus dem Normalpfad, während der kanonische Session-/CWD-/Smoke-Nachweis erhalten bleibt | Änderung an Finder, Test, Console, Codex-Sessionformat oder V1.6-Binding-Vertrag | G-BENCHMARK / V1.6_RUN_01_READY_FOR_OWNER_START |
| EV-GUARD-G21 | Agent-Finder `2d416993...c54a`; Finder-Test `47c17160...c59b`; Capture-Helper `45d0505a...dae9`; Capture-Test `9fb9226e...8b02`; Console `e04955dc...f4a8`; aktive V1.6-Fingerprints unverändert | Operatorpfad entdeckt die Tested-Agent-Session eindeutig innerhalb PRE/END, erfasst Checkpoints ohne erfundene Dateipfade und hält RUN_END vor Discovery/Raw/Orchestrator | Änderung an einem genannten Operatorartefakt, Codex-Sessionformat, Workspace-Binding-, Usage- oder Run-Metadatenvertrag | G-BENCHMARK / V1.6_RUN_01_READY_FOR_OWNER_START |
| EV-GUARD-G22 | Finder `015961c0...f948`; Discovery-Test `da82ee5d...b91c`; Smoke `c6f9212c...4770`; Binding `c7babb9f...a4d0`; kanonischer Binding-Validator unverändert | Ein temporär vom Codex-Writer blockiertes Sessionlog wird als lesbar-wiederholbarer Operatorzustand statt als ungültige Evidence behandelt; nach Freigabe bleibt dieselbe Evidence verwendbar | Änderung an Finder, Test, bestehendem Smoke, Binding, Stage oder kanonischem Binding-Validator | G-BENCHMARK / V1.6_RUN_01_PRE_RUN_READY |

<!-- markdownlint-enable MD013 -->

Nur betroffene Evidence wird nach Invalidation erneut erzeugt. Manuelle
Evidence Reuse folgt bis nach Benchmark und C4/R15 ausschließlich dem Workflow
Contract; maschinenlesbare Klassifikation hat in W2-W4 keine
execution-beeinflussende Wirkung.

Die ursprünglichen W2A-/W2B-Ausführungsfingerprints wurden durch das W2C-Delta
invalidiert. Die dokumentierten vollständigen Regressionen ersetzten sie mit
dem gemeinsamen finalen W2-Postimage; es wird kein alter Lauf als Nachweis für
geänderten Code weiterverwendet.

## Produktiver Read-only Preflight

Nicht relevant für W0-W4: keine produktive, Supabase-, SQL-, Browser-, Device-
oder Deployaktion ist erlaubt.

## Produktive Aktionen

Keine. G-POLICY-ACTIVATE, G-SENSOR-INSTALL und alle MIDAS-Produktaktionen liegen
außerhalb des aktuellen Chats.

## Vorher-/Nachher-Nachweis

Nicht relevant für W0-W4; es gibt keine Daten- oder Produktkonfigurationswirkung.

## Deploy- und Runtime-Nachweise

Keine Deploys. W4 darf nur lokale Shadow-/Migrationsnachweise ergänzen.

## Findings und Korrekturen

<!-- markdownlint-disable MD013 -->

| Finding | Nachweis | Korrektur | Wiederholter Check | Status |
| --- | --- | --- | --- | --- |
| F-GUARD-01 | W0 Single-Definition-Review | Workflow Contract ist alleiniger aktiver Detailowner | SDEF-001 in W5 und SDEF-002 in W6B | `CLOSED_W5 / CONFIRMED_W6B` |
| F-GUARD-02 | W1 Campaign-Gate-Review | V1.0 vor Run 1 reviewed und durch A.R.G.U.S. V1.1 mit getrennten Suites, Sichtbarkeit, Rollen, Corpus, Scoring und Schemas ersetzt | EV-GUARD-W4C-01..06 | `CLOSED_W4C_REVIEWED` |
| F-GUARD-03 | W1 Fixturekatalog | Policyprofile, opt-in Validator-Envelope und Legacy-Rollback grün | EV-GUARD-W2B-01..03; EV-GUARD-W4A-01..03; EV-GUARD-W4B-01..03 | `CLOSED_W4B` |
| F-GUARD-04 | W1 Fixturekatalog | Confidence, Eligibility und rein warnende Lease belegt; Jitter/Experimente nicht aktiviert | EV-GUARD-W2C-01..03 | `CLOSED_W2` |
| F-GUARD-05 | W1 Reuse-Grenze | Resume, advisory Klassifikation und Verificationvertrag vollständig grün; Automation bleibt aus | EV-GUARD-W3A-01..03; EV-GUARD-W3B-01..03; EV-GUARD-W3C-01..03 | `CLOSED_W3` |
| F-GUARD-06 | W1 Scope Review | Pilot liefert keine kontrollierte Messbasis; natürliche C4/R15-Beobachtung bleibt später möglich | Owner-Override und W6-Abschluss | `DEFERRED_POST_ROADMAP` |
| F-GUARD-11 | W0 Größen-/Duplikationsreview | keine riskante Aufteilung; historische Notes bleiben nichtnormativ | W6-Navigationsreview | `ACCEPTED_WATCHLIST` |
| F-GUARD-29 | W6B Schema-/Consumerreview | kanonische Telemetriegrenzen und Consumer angeglichen; ACT-07 bindet Parität | 118/118 gezielte Regression | `CLOSED_W6B` |
| F-GUARD-30 | W6B Schema-/Contractreview | Cost Receipt im Policy-Input vollständig auf kanonische Striktheit gebracht; ACT-08 bindet Parität | 118/118 gezielte Regression | `CLOSED_W6B` |
| F-GUARD-31 | W6B Scope-/Safetyreview | geschützte Pfadnachfahren lösen fail-closed `BOUNDEDNESS_BREACH` aus | FX-X25 und Verification 13/13 | `CLOSED_W6B` |

<!-- markdownlint-enable MD013 -->

F-GUARD-01 blockiert die spätere W5-Policyaktivierung, F-GUARD-06 bleibt bis
zum vollständigen Campaign-Result offen und F-GUARD-11 bleibt Watchlist. Sie
blockieren nicht den bereits validierten Profilfreeze.

### A.R.G.U.S.-Ausführungsschicht

<!-- markdownlint-disable MD013 -->

| Finding | Auswirkung | Owner | Korrektur | Status |
| --- | --- | --- | --- | --- |
| ARGUS-R14 | Post-Freeze-Validierungs-Dead-End | Orchestrator | Phasen PRE_FREEZE bis CAMPAIGN_COMPLETE mit Artefaktregeln | `FIXED_V1.2` |
| ARGUS-R15 | unstrikter Tested-Agent-Output | Campaign Maintainer | Response-Schema, exakte 6+6-IDs und Positiv-/Negativtests | `FIXED_V1.2` |
| ARGUS-R16 | Prompt-/Metadatenwiderspruch | Campaign Maintainer | `profileId` plus vier requested/UI-Felder durchgängig gebunden | `FIXED_V1.2` |
| ARGUS-R17 | semantisch offenes Profilmanifest | Orchestrator | exakt zwei Profile, A/B/B/A und konditionale A3/B3 geprüft | `FIXED_V1.2` |
| ARGUS-R18 | Receipt-Privacy-/Keyset-Lücken | Orchestrator | feste Work-/Read-IDs und minimale Novel-Finding-Bindung | `FIXED_V1.2` |
| ARGUS-R19 | Tested-Agent-Usage-Messung nicht ausführbar | Orchestrator | PRE_RUN_BASELINE/RUN_END ausschließlich beim Orchestrator | `FIXED_V1.2` |
| ARGUS-R20 | Rollenablage als Isolation überbewertet | Orchestrator | frischer exakter Stage; ehrlich keine OS-Sicherheitsgrenze | `FIXED_V1.2` |
| ARGUS-R21 | Semantik und Arithmetik vermischt | Scorer | SCORER-Adjudikation plus deterministischer lokaler Rechner | `FIXED_V1.2` |
| ARGUS-R22 | Source Drift blockierte Provenance-Werkzeug | Campaign Maintainer | Frozen-Verify-Modus; Rebuild nur aus exakten Preimages | `FIXED_V1.2` |
| ARGUS-R23 | Dokumentationswahrheit driftete | Campaign Maintainer | Assets, Writes, Isolation, Lint und Guard-Gates synchronisiert | `FIXED_V1.2` |
| ARGUS-R24 | echte Response-Ingestion fehlte | Orchestrator | bytegleicher Import, kanonischer Pfad, Validierung und SHA-256-Bindung | `FIXED_V1.3` |
| ARGUS-R25 | Receipt-Validator war schwächer als das Schema | Orchestrator | vollständige Keyset-, Typ-, Semantik- und Cross-Artifact-Prüfung | `FIXED_V1.3` |
| ARGUS-R26 | Response-Validierung war partiell | Campaign Maintainer | vollständige Format-, Case-, Citation-, Closure- und Metadata-Bindung | `FIXED_V1.3` |
| ARGUS-R27 | Scorecard war nicht beweisbar an die Antwort gebunden | Scorer | Responsehash wird aus der unveränderten Datei selbst reproduziert | `FIXED_V1.3` |
| ARGUS-R28 | POST_RUN und COMPLETE erlaubten Mengen-False-Passes | Orchestrator | identische Artefaktsets plus vollständige Kettenvalidierung | `FIXED_V1.3` |
| ARGUS-R29 | Campaign Result trug die Entscheidungsfrage nicht | Campaign Maintainer | abgeleitete Work-Class-, Confidence-, Usage- und Roadmap-Gate-Struktur | `FIXED_V1.3` |
| ARGUS-R30 | Stage nicht vollständig rungebunden | Orchestrator | Run-, Slot-, Profil-, Context-, Metadatahash- und Originbindung | `FIXED_V1.3` |
| ARGUS-R31 | Usage Eligibility nicht ausführbar bewiesen | Orchestrator | deterministische Checkpoint-, Reset-, Delta- und Interference-Prüfung | `FIXED_V1.3` |
| ARGUS-R32 | Output-Handoff und RUN_END mehrdeutig | Orchestrator | feste Reihenfolge vor Orchestrator-Rehydration; sonst Usage ineligible | `FIXED_V1.3` |
| ARGUS-R33 | Fixture-Bypass nicht auf Fixturepfade begrenzt | Orchestrator | Bypass nur unter dem lokalen Temp-Root; Campaignpfade werden abgelehnt | `FIXED_V1.3` |
| ARGUS-R34 | formal ungültige Modelloutputs verschwanden vor der Auswertung | Orchestrator / Scorer | unveränderlicher Raw-Output und Attempt-Outcome; Modellfehler bleibt qualitäts- und triggerwirksam | `FIXED_V1.4` |
| ARGUS-R35 | aktiver Campaign-Dokumentvertrag war nicht fingerprintgebunden | Campaign Maintainer | tatsächlicher Dokumenthash in Manifest sowie Profil-/Metadata-/Stage-/Nachweiskette | `FIXED_V1.4` |
| ARGUS-R36 | Ingestion revalidierte den vollständigen Stage nicht unmittelbar vor Write | Orchestrator | Expected-Run-Stageprüfung vor Temp-Copy, vor Commit und danach; Drift vor Commit schreibt nichts | `FIXED_V1.4` |
| ARGUS-R37 | jede positive Mittelwertdifferenz konnte ein Profil wählen | Campaign Maintainer / Scorer | unveränderliche 5,0-Punkte-Gleichwertigkeitszone und Confidence aus Abstand plus Streuung | `FIXED_V1.4` |
| ARGUS-R38 | echter `Test-ArgusRunChain.ps1`-Aufruf trennte Stage-Validatorparameter nicht und erreichte dadurch nicht `ValidateOnly` | Orchestrator | Argumenttokens getrennt; gleichartige Scriptaufrufe geprüft; V1.4-Run-01-Evidence unverändert migriert; echter POST_RUN grün | `FIXED_V1.5` |
| ARGUS-R39 | TESTED_AGENT-Chats liefen trotz valider Stages aus dem MIDAS-Root | Orchestrator | additive Hashmigration; beide Versuche technisch invalid und qualitätsneutral; expliziter Open-Folder-/Smoke-Bindingvertrag | `FIXED_V1.6` |
| ARGUS-R40 | Run-02-Operatorcheckpoints wurden nicht in den Receiptpfad übernommen | Orchestrator | altes Receipt unverändert; prospektiv separates Usage-Evidence-Artefakt mit Chronologie- und Receiptbindung | `FIXED_PROSPECTIVELY_V1.6` |
| ARGUS-R41 | Live Smoke Session konnte während des noch offenen Codex-Writes vom kanonischen `ReadLines` nicht geöffnet werden; Finder verlor die innere Ursache | Orchestrator | fail-closed Preflight mit `SMOKE_SESSION_NOT_READABLE`, vollständiger Pfad-/Exceptionkette und unveränderter Wiederverwendung nach Freigabe; kanonischer Validator unverändert | `FIXED_OPERATOR_TOOLING_V1.6` |

<!-- markdownlint-enable MD013 -->

Offene Campaign-P0/P1-Findings: `0`.

## Externer Review-Nachweis

- W0-W5 CodeRabbit-Läufe: `0` erwartet und ausgeführt.
- Externes Pre-W0-Zweitreview: in der Roadmap als EXT-01 bis EXT-14 bereits
  vollständig bewertet; wegen unverändertem Reviewpostimage nicht wiederholt.
- W6/S5: initialer CodeRabbit-Lauf meldete drei berechtigte Findings;
  F-GUARD-29..31 geschlossen; einziger Verifikationslauf `0` Findings.

## Finaler Evidence-Digest

- Gültige Nachweise: `EV-GUARD-B01..B05`, `EV-GUARD-L01..L07`,
  `EV-GUARD-W2A-01..03`, `EV-GUARD-W2B-01..03`,
  `EV-GUARD-W2C-01..03`, `EV-GUARD-U05R`, `EV-GUARD-U06`,
  `EV-GUARD-U06R`, `EV-GUARD-W3A-01..03`, `EV-GUARD-U07`,
  `EV-GUARD-W3B-01..03`, `EV-GUARD-U08`, `EV-GUARD-W3C-01..03`,
  `EV-GUARD-U09`, `EV-GUARD-W4A-01..03`, `EV-GUARD-U10`,
  `EV-GUARD-W4B-01..03`, `EV-GUARD-U11`, `EV-GUARD-W4C-01..03`,
  `EV-GUARD-U12`, `EV-GUARD-W4C-04..07`, `EV-GUARD-U13..U43`,
  `EV-GUARD-G01..23` und `EV-GUARD-W5-01..W6C-03`.
  EV-GUARD-B03 ist historisch und durch die W4A-Regression ersetzt.
- Exakte produktive Wirkung: keine.
- Nicht ausgeführte Nachweise: weitere V1.6-Benchmarkruns, Scoring des
  vollständigen V1.6-Run-01-Outputs, Sensorinstallation und alle späteren
  Tooling-Extraktionsarbeiten. W5/W6 und Policyaktivierung sind abgeschlossen.
- Restrisiken: Cost Confidence bleibt receiptabhängig; unkalibrierte
  Topologien bleiben fail-closed; F-GUARD-06 ist post-roadmap deferred und
  F-GUARD-11 als historische Größen-Watchlist akzeptiert.
- Usage-Abschlussstand: EV-GUARD-U43 schließt W6C bei 24/58 und
  `SAFE_CLOSURE / STOP_AS_PLANNED`; dies ist keine Run-Usage-Evidence.
- Externe Reviewläufe in W6B: `2` (Initiallauf mit 3 berechtigten Findings,
  einziger Verifikationslauf mit 0 Findings).
- Roadmap-Verweise: W0-W4-Ergebnisse, W1-Zielcontract und G-BENCHMARK-Gate.

Abschlussregeln:

- Evidence bleibt bis zum finalen S6-Abgleich `ACTIVE`.
- Bei Widerspruch gewinnt der erneut geprüfte reale Iststand; Roadmap und
  Evidence werden gemeinsam korrigiert.
