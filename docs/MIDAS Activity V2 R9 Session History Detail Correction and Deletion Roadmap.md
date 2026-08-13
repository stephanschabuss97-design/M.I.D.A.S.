# MIDAS Activity V2 R9 Session History, Detail, Correction and Deletion Roadmap

Diese Roadmap ergänzt den bewiesenen R8-Commitpfad um den kontrollierten
Lebenszyklus bereits abgeschlossener Activity-V2-Sessions. Sie baut eine
deterministisch paginierte Historie, eine snapshotbasierte Detailansicht, eine
atomare Korrektur mit Optimistic Concurrency und eine wiederholsichere
Hard-Delete-Grenze. Activity V1 bleibt produktiv und Activity V2 bleibt bis R12
isoliert.

---

## Roadmap-Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Status | `ACTIVE; S4 UND S5 DONE; STOP vor S6` |
| Modul / Bereich | `Activity V2 / Session History / Detail / Correction / Deletion` |
| Owner / Kontext | `Stephan; private Single-User-PWA für die eigene Trainingsdokumentation` |
| Chat-Lebenszyklus | `Denkraum -> eigener Ausführungs-Chat` |
| Erstellt am | `2026-08-11` |
| Letzter Stand | `2026-08-13; Post-S5-CodeRabbit-Korrekturwelle bis F-ACT-R9-57 fixed; 208/208 lokal und invalidierte PostgreSQL-17-Fixture grün; SQL 23 produktiv unverändert; STOP vor S6` |
| Aktueller Schritt | `STOP vor S6; Block E und S5 vollständig, kein Productload, Web-/Edge-/APK-Deploy, reale Sessionmutation oder Commit` |
| Freeze-ID | `R9-S4R-FREEZE-2026-08-11` |
| Freeze-Basis | `Git HEAD 0d9192f533091954e4b55e786046f004d25d1ea5; D-ACT-R9-01 bis -36; F-ACT-R9-01 bis -30; S1-S4R abgeschlossen` |
| Block-A-Basis | `Freeze-HEAD unverändert; F-ACT-R9-31/-32 fixed; 186/186 Activity-V2-Contracttests grün; kein Productload, SQL, Deploy oder Commit` |
| Block-B-Basis | `exakter R8-Postimage; SQL 23/Rollback/Fixture plus SQL-16-/HOW-TO-Spiegel; F-ACT-R9-33 bis -37 fixed; T-ACT-R9-10 bis -15 PASS; 186/186 Clienttests; kein produktives SQL, keine reale Sessionmutation, kein Deploy oder Commit` |
| Block-C-Basis | `isolierter Fakeadapter-/Consumer-Harness; F-ACT-R9-38/-39 fixed; T-ACT-R9-05 bis -09 und EV-ACT-R9-BR01 bis -BR05 PASS; 200/200 Activity-V2-Contracttests; kein Productload, produktives SQL, reale Sessionmutation, Deploy oder Commit` |
| Block-D-Basis | `reale isolierte Data-Access-/History-/R4-Cacheintegration; F-ACT-R9-40 bis -43 fixed; T-ACT-R9-16 und EV-ACT-R9-I01 PASS; 203/203 Activity-V2-Contracttests, Browser-Smoke, Isolation und disposable SQL-23-Revalidierung grün; kein Productload, produktives SQL, reale Sessionmutation, Deploy oder Commit` |
| Block-E/S5-Auftrag | `Owner-Auftrag 2026-08-13; S4.10 und S5 gekoppelt; Evidence A-D über Hash-/Invalidierungsgates wiederverwenden; keine redundanten Full Reviews; produktives SQL 23 nach grünen T17-T20 ausdrücklich freigegeben; STOP vor S6` |
| Block-E/S5-Ergebnis | `F-ACT-R9-44 bis -57 fixed; 208/208 Contracttests; Desktop-/Mobile-Browsermatrix, Isolation, PostgreSQL-17-Fixture und CodeRabbit-Fixzyklen grün; finaler CodeRabbit-Null-Lauf ausstehend; produktives SQL-23-Postimage unverändert grün` |
| Freeze-Regel | `S1-S4R, Zielvertrag und Readiness-Schnitt nicht neu interpretieren; nur bei real belegtem Drift mit namespacetem Finding korrigieren` |
| Risikoklasse | `R3`; persistente Gesundheitsdaten, produktives SQL, atomare Korrektur, Hard Delete und Concurrency |
| Standard-Reviewtiefe | `Full`; `Consumer` nur für klar isolierte UI-/Data-Access-Deltas |
| Ausführungsmodell | `GPT-5.6 Sol` |
| Reasoning-Standard | `High` |
| Reasoning-Ausnahmen | `Roadmap-Erstellung: Ultra auf Owner-Wunsch; S1-S4R, SQL-/Concurrency-Blöcke und S5: Extra High` |
| Autonome Discovery Wave | `S1-S4R` |
| Owner-Erklärmodus | `Briefing + S6-Recap` |
| Betroffene Hauptdateien | `app/modules/vitals-stack/activity/v2/data-access.js`, neue isolierte History-/Correction-Module und Styles, Activity-V2-Contracttests/Harnesses, `sql/23_Activity_V2_History_Lifecycle.sql`, Rollback und Fixture, `sql/16_Explicit_Grants.sql`, `sql/HOW_TO.md` |
| Deploy relevant | `ja`; ausschließlich owner-gatetes produktives SQL, kein Web-/Edge-/APK-Deploy |
| Produktive Schreibwirkung | `ja`; Schema-/RPC-Erweiterung und Initialisierung von `revision = 1` für vorhandene Sessions; keine synthetische Session und keine Änderung/Löschung fachlicher Sessioninhalte während der Roadmap |
| Workflow-Vertrag | `docs/templates/MIDAS Roadmap Workflow Contract.md` |
| Evidence-Datei | `docs/MIDAS Activity V2 R9 Session History Detail Correction and Deletion Evidence.md` |
| Gekoppelte Roadmaps | `R2 liefert Datenmodell/RPC-Basis; R4 Last Performance; R7 Recovery; R8 Commit; R10 Export; R12 Cutover` |
| Evidence-Owner | `diese Roadmap` |
| Archivziel | `docs/archive/MIDAS Activity V2 R9 Session History Detail Correction and Deletion Roadmap (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Ausführungs-Chat-Startkarte

- Auftrag:
  - `R9 gemäß dieser Roadmap zunächst autonom von S1 bis einschließlich S4R
    abarbeiten; S4 nicht ohne eigenen Folgeauftrag beginnen.`
- Modell und Reasoning:
  - `GPT-5.6 Sol / Extra High` für S1-S4R.
  - Danach gemäß Statusmatrix; SQL-, Race- und S5-Blöcke bleiben
    `Extra High`.
- Kontextübergabe aus dem Denkraum:
  - `PASS`: R1-R8 und C2 sind DONE. R8 ist mit zwei ausdrücklich akzeptierten
    Evidence-Lücken abgeschlossen: kein realer ADB-Prozess-Reclaim und kein
    finaler CodeRabbit-Null-Lauf nach Korrektur aller Findings.
  - `PASS`: Diese Lücken werden in R9 weder als PASS übernommen noch erneut
    gelöst. Der finale Android-PWA-Beweis und Produktcutover bleiben R12.
  - `PASS`: Activity V1 bleibt der einzige produktive Activity-Consumer. R9
    darf keine Produktnavigation, `index.html`, Service-Worker-Grenze oder
    V1-Logik verändern.
  - `PASS`: Der R8-Commit besitzt eine unveränderliche `request_id` und einen
    unveränderlichen `request_fingerprint`. Korrekturen dürfen diese
    Erstellungsidentität nicht überschreiben.
  - `PASS`: Historie wird absteigend per Keyset-Cursor `(started_at, id)`
    paginiert. `started_at` und der daraus erzeugte Tag bleiben bei Korrekturen
    unveränderlich.
  - `PASS`: Details werden aus gespeicherten Session-, Item- und Satzsnapshots
    gelesen, nicht durch einen Join auf den aktuellen Katalog umgedeutet.
  - `PASS`: Korrektur ist ein atomarer Vollersatz der veränderlichen Inhalte
    unter derselben Session-ID und ursprünglichen Katalogversion. Sie verwendet
    eine eigene Revision und einen aktuellen Content-Fingerprint als CAS;
    `title` bleibt in R9 unverändert.
  - `PASS`: Nur die Revision wird persistiert. Der Content-Fingerprint wird aus
    dem aktuellen kanonischen Snapshot abgeleitet; R9 führt keine zweite
    Fingerprint-Spalte ein und ändert den R8-Commit dafür nicht.
  - `PASS`: Technische Item-/Set-UUIDs sind keine Fachidentitäten und gehören
    nicht zum öffentlichen R9-Read- oder Korrekturvertrag. Stabil sind
    Session-ID, Katalogversion, `item_key`, `item_order` und `set_order`.
  - `PASS`: Delete ist ein kontrollierter Hard Delete. Bestehende `ON DELETE
    CASCADE`-Verträge werden genutzt; es entstehen kein Papierkorb und kein
    Audit-Trail.
  - `PASS`: Correction/Delete verwenden weder den aktiven R7-Recovery-Slot
    noch R8-Request-ID, Commit-Intent oder `commitSession`.
  - `PASS`: R9 ist nicht der Coaching-Export. R10 erhält ein eigenes,
    versioniertes und zeitraumbezogenes Exportformat.
- Verbindliche Lesereihenfolge:
  1. `Diese Startkarte, Roadmap-Metadaten und Session Resume Card`
  2. `README.md`
  3. `docs/DEV_ENVIRONMENT.md`
  4. `docs/templates/README.md`
  5. `docs/templates/MIDAS Roadmap Workflow Contract.md`
  6. `docs/Future trainingsmodule update thoughts.md`, insbesondere R9/O-5
  7. `docs/modules/Activity Module Overview.md`
  8. `docs/MIDAS Activity V2 R1 Catalog Baseline Contract.md`
  9. `docs/MIDAS Activity V2 C2 Catalog Version 2 Contract.md`
  10. archivierte R8-Roadmap und R8-Evidence für Commit-, SQL-, ACL-,
      Recovery- und akzeptierte Evidence-Grenzen
  11. archivierte R4-Roadmap für Last-Performance- und Cacheverträge
  12. R7 nur bei einer konkreten Recovery-/State-Frage
  13. `docs/qa/health-capture-reports.md`, mindestens HCR-017 bis HCR-026
  14. `sql/20_Activity_V2.sql`, SQL 21/22, `sql/16_Explicit_Grants.sql` und
      reale Activity-V2-Runtime/Tests
  15. aktuelle offizielle Supabase-Dokumentation zu Database Functions, RLS,
      Function Privileges und Data-API-Grants sowie relevante Changelog-Hinweise
  16. `git status --short` und nur der relevante Diff
- Startschritt:
  - `S1 - System- und Vertragsdetektivarbeit`.
- Freigegebener autonomer Block:
  - `S1-S4R`.
- Interne Continuation Gates:
  - Nach S1, S2 und S3 jeweils Full Review, Findings-Korrektur, Statusmatrix,
    Evidence-Baseline und Resume Card aktualisieren.
  - Bei `PASS` und ohne Owner-Gate automatisch fortfahren.
  - Nach S4R mit Readiness-Urteil und sicheren S4-Ausführungsblöcken stoppen.
- Erlaubte Autonomie:
  - Discovery: lokale Reads, read-only Supabase-/Toolchain-Preflights,
    Roadmap-/Evidence-Korrekturen und günstige Baselinechecks;
  - nach separater S4-Freigabe: eng begrenzte Activity-V2-JS-/CSS-/Test-/
    Harness- und SQL-Source-Änderungen sowie disposable lokale Tests;
  - Docker Desktop und lokaler Supabase-Stack dürfen für disposable Tests
    gestartet und gestoppt werden;
  - CodeRabbit ausschließlich in S5 nach grüner lokaler Gesamtmatrix.
- Owner-Gates:
  - produktives SQL und jeder produktive Write;
  - Korrektur oder Löschung einer realen Activity-V2-Session;
  - Änderung an Produktload, Navigation, Service Worker oder Activity V1;
  - Web-/Edge-/APK-Deploy und Device-Aktionen.
- Stop-Bedingungen:
  - Mutation von `id`, `user_id`, `request_id`, `request_fingerprint`,
    `started_at`, erzeugtem `day`, `title`, `created_at` oder ursprünglicher
    `catalog_version`;
  - Korrektur über den R8-Commitpfad oder Speicherung im R7-Recovery-Slot;
  - offsetbasierte oder unbegrenzte Historie, Live-Katalog-Reinterpretation
    historischer Snapshots oder ungeprüfte Bulk-Mutation;
  - Mutation ohne Revision/Fingerprint-CAS, unbekannter Ausgang ohne Re-read,
    direkte Tabellen-DML aus dem Client oder leaky Security-Definer-Funktion;
  - synthetischer produktiver Datensatz, vorgezogener Cutover oder fehlende
    produktive Freigabe.
- Halluzinationsschutz:
  - RPC-Signaturen, Fehlercodes, Schemaobjekte, Grants, RLS, Runtime-APIs,
    Cachegrenzen und Testbefehle zuerst am realen Repo/System prüfen.
  - Fehlende Fakten nicht erfinden; Widersprüche als Finding dokumentieren.
  - Ein lokaler Harness- oder SQL-Erfolg ist keine Produktaktivierung.
- Testökonomie:
  - Browser/Harness/Server pro zusammenhängendem Block wiederverwenden;
  - keine visuellen Volltests in S1-S3;
  - Desktop/Mobile, Konflikt-/Unknown-Outcome- und Isolation-Smokes in S5
    bündeln;
  - bereits gültige, nicht invalidierte R8-Nachweise referenzieren statt
    wiederholen.
- Startprompt:

```text
Arbeite die Roadmap
`docs/MIDAS Activity V2 R9 Session History Detail Correction and Deletion Roadmap.md`
gemäß ihrer Ausführungs-Chat-Startkarte ab.

Lies die festgelegten Quellen in der angegebenen Reihenfolge, prüfe den realen
Git-, Runtime-, SQL- und Toolstand und beginne mit S1. Führe S1 bis
einschließlich S4R deterministisch in einem autonomen Discovery-Block aus.
Schließe S1, S2, S3 und S4R jeweils separat mit Full Review,
Findings-Korrektur, Statusmatrix, Evidence-Sync und aktualisierter Session
Resume Card ab. Fahre bei bestandenem internen Continuation Gate ohne
Rückfrage fort. Stoppe nach S4R; S4 benötigt einen separaten Auftrag.

Unveränderliche Grenzen: Activity V1 bleibt produktiv, Activity V2 bleibt
isoliert, und R12 bleibt das Cutover-Gate. R8-request_id,
request_fingerprint, started_at, day, title, created_at und die ursprüngliche
catalog_version dürfen nicht verändert werden. Historie verwendet bounded
Keyset-Pagination; Details verwenden gespeicherte Snapshots. Korrektur ist ein
atomarer Vollersatz veränderlicher Inhalte mit Revision plus
Content-Fingerprint-CAS; Delete ist ein owner-geprüfter, wiederholsicherer Hard
Delete. Correction/Delete dürfen R7-Recovery und R8-Commit nicht
wiederverwenden. Beginne in der Discovery Wave noch nicht mit Produktcode.
```

## Session Resume Card

- Freeze-/Übergabestatus:
  - Freeze-ID `R9-S4R-FREEZE-2026-08-11`.
  - Die eingefrorene Basis umfasst D-ACT-R9-01 bis -36,
    F-ACT-R9-01 bis -30, alle S1-/S2-/S3-Gates, das S4R-Gate und die
    Ausführungsblöcke A bis E; diese Basis wurde am 2026-08-13 ohne Drift
    wiederhergestellt.
  - Die Owner-Aufträge für Block A bis Block E und S5 wurden verbraucht.
    S4.1-S4.10 und S5 sind vollständig. Das darin konditional freigegebene
    produktive SQL 23 wurde am 2026-08-13 nach grünem T-ACT-R9-20 exakt
    ausgeführt und durch T-ACT-R9-22 read-only bestätigt.
  - Der Freeze schützt den bestätigten Vertrag vor stiller Neuinterpretation.
    Nur ein real belegter Repository-/Runtime-/SQL-Drift darf ihn über ein
    neues namespacetes Finding öffnen.
- Ziel:
  - Activity-V2-Historie, Snapshotdetails, atomare Korrektur und kontrollierten
    Hard Delete isoliert und concurrency-sicher bereitstellen.
- Unveränderliche Verträge:
  - Activity V1 produktiv; V2 bis R12 isoliert; R8-Erstellungsidentität,
    `started_at`, `day`, `title`, `created_at` und `catalog_version` bleiben
    unverändert.
- Erledigter Stand:
  - R1-R8 und C2 archiviert;
  - R8-SQL produktiv, ohne Activity-V2-Produktdaten;
  - R9-Zielvertrag im Denkraum red-teamed;
  - initialer Roadmap-Contract-Review PASS;
  - S1-Pflichtquellen, Repository/Runtime, Toolchain und produktiver
    Read-only-Supabase-Stand verifiziert;
  - S1-Gate `PASS mit nicht blockierenden Findings`;
  - S2-API-, Daten-, Identity-, Concurrency-, Fehler-, UX-, Guard- und
    Cacheverträge feldgenau eingefroren;
  - S2-Gate `PASS`;
  - S3-Race-, Security-, Datenbruch-, Rollback-, Provisioning- und Scope-
    Review vollständig;
  - S3-Gate `PASS`;
  - S4R gegen S4.1-S4.10 vollständig, alle Findings/Tests/Gates zugeordnet;
  - S4R-Gate `GO`, fünf sichere Ausführungsblöcke bestätigt;
  - S4.1 additive Data-Access-/Response-/Domainfehlerverträge einschließlich
    Dezimalstring-Revision und getrenntem `mutationState` implementiert;
  - S4.2 isoliertes memory-only Correction-/Canonicalization-Modell mit
    Snapshot-, Policy-, Dirty-, Desired-Content- und CAS-Ableitung umgesetzt;
  - T-ACT-R9-01 bis -04 und EV-ACT-R9-L01 bis -L04 `PASS`;
  - Full Contract Review und 186/186 Activity-V2-Contracttests grün;
    F-ACT-R9-31/-32 im Review korrigiert.
  - S4.6 additive Revision, exakte R8-/Rerun-Guards, eine private pure
    Canonicalization-Grenze sowie bounded List-/Snapshotdetail-RPCs umgesetzt;
  - S4.7 atomarer Full Replacement mit Row Lock, Snapshotpreservation,
    Originalversions-Snapshot, Replay vor stale CAS, Dual-CAS, Revision +1
    und vollständigem Transaction-Rollback umgesetzt;
  - S4.8 nicht-leakender CAS-Hard-Delete, FK-Cascade, exakte Public-/Private-
    ACLs, SQL-16-Spiegel, HOW-TO und owner-gateter Deployment-Rollback
    umgesetzt;
  - T-ACT-R9-10 bis -15 sowie EV-ACT-R9-D01 bis -D06 `PASS`; kompletter
    PostgreSQL-17-Fresh-/Rerun-/Drift-/Rollback-/Race-/Security-Fixturelauf
    grün und PostgREST-14.14-Negativnachweis für `midas_private` erbracht;
  - F-ACT-R9-33 bis -37 im Block-B-Full-Review korrigiert.
  - S4.3 isolierte History-/Detail-Shell mit bounded Pagination,
    Loading/Empty/Error/Retry und ausschließlich persistierten Snapshots;
  - S4.4 policy-gesteuerte memory-only Correction-UI mit Dirty Close,
    Originalversionskatalog, Conflict/Replay und Unknown-Reconciliation;
  - S4.5 einzelne datierte Hard-Delete-Bestätigung sowie rein lesende,
    vollständig validierende und dreifach fail-closed R7-/R8-Admission;
  - T-ACT-R9-05 bis -09 und EV-ACT-R9-BR01 bis -BR05 `PASS`; Browser-Smokes
    für Desktop und 390x844 ohne Consolefehler/Horizontaloverflow sowie
    200/200 Activity-V2-Contracttests grün;
  - F-ACT-R9-38/-39 im Block-C-Full-Review korrigiert.
  - S4.9 verdrahtet den isolierten History-Consumer mit der realen
    Data-Access-Grenze, bestätigt Liste und Detail nach Correction/Delete neu
    und ergänzt ausschließlich die additive R4-Cachegrenze
    `refreshLastPerformance(itemKeys)` mit alter/neuer Keyunion,
    Generation-Fencing und terminalem Ergebnis;
  - T-ACT-R9-16 und EV-ACT-R9-I01 `PASS`; 203/203 Activity-V2-
    Contracttests, Browser-Smoke, R8-Isolation und unverändertes SQL-23-
    Fixture in disposable PostgreSQL 17 grün;
  - F-ACT-R9-40 bis -43 im Block-D-Full-Review korrigiert.
  - S4.10 beweist die integrierte Productload-/V1-/R7-/R8-Isolation,
    Legacy-Child-UUID-Negatividentität und R8-Gap-Ehrlichkeit; die exakte
    Browsermatrix 1440x900, 390x844 und 320x800 ist ohne Overflow,
    Consolefehler, unbenannte Controls oder Fokusverlust grün;
  - F-ACT-R9-44 korrigiert die einzige Harness-Overlay-/Kontrastabweichung;
    T-ACT-R9-17/-18 sowie EV-ACT-R9-I02/-BR06 `PASS`;
  - der historische Block-E-Finalgateverbund war 206/206 grün; die
    Post-S5-CodeRabbit-Korrekturwelle schloss F-ACT-R9-46 bis -57 und erhöhte
    die aktuelle Gesamtsuite auf 208/208; Syntax, Diff, Productload,
    R8-Isolation, gezielter Browsercheck und die durch den neuen Fixturehash
    invalidierte vollständige PostgreSQL-17-Matrix sind grün;
  - CodeRabbit CLI 0.7.2 ist authentifiziert und reviewte den Gesamtdiff. Der
    erste Lauf meldete sechs Punkte: vier berechtigte wurden als
    F-ACT-R9-46 bis -49 korrigiert, zwei nach Vertragsprüfung verworfen. Der
    Fixreview meldete vier weitere berechtigte Punkte, korrigiert als
    F-ACT-R9-51 bis -54. F-ACT-R9-50 schloss den beim Gesamttest sichtbaren
    Evidence-Wortlautdrift. Der erste Null-Lauf-Versuch fand noch zwei reine
    Doku-Konsistenzen, korrigiert als F-ACT-R9-55/-56; der wiederholte finale
    Null-Lauf bleibt vor Abschluss dieser Korrekturwelle auszuführen. Der
    nächste Fixreview vereinheitlichte als F-ACT-R9-57 den exakten Namen und
    Sourcehash des unveränderten R8-Last-Performance-RPC im HOW-TO;
  - T-ACT-R9-20 bestätigte produktiv read-only Projekt `jlylmservssinsavlkdi`,
    PostgreSQL 17.6, den kanonischen R8-Strukturhash `657f31c1...3ee14`,
    Katalog 78/80/0 mit exakten Inhaltshashes, R8-Funktionsquellen/ACLs und
    Activity-V2-Zähler 0/0/0; F-ACT-R9-45 korrigierte dabei eine zunächst ohne
    Guard-`search_path` ausgeführte Hashmessung;
  - SQL 23 mit Sourcehash `b8180409...1bc4` produktiv exakt ausgeführt;
    T-ACT-R9-22 bestätigt Revision, fünf R9-Funktionshashes, Minimal-ACLs,
    fehlende Overloads/Direct-DML-Rechte, Data-API 406/`PGRST106` für
    `midas_private`, unveränderte R8-Hashes sowie 0/0/0.
- Aktueller Schritt:
  - `S4 UND S5 DONE; STOP vor S6`.
- Nächster erlaubter Schritt:
  - ausschließlich S6 nach neuem ausdrücklichem Owner-Auftrag: finaler
    Doku-Abgleich, verständliches Owner-Recap, Archivierung und getrennte
    Commit-Entscheidung; keine R9-Sessionmutation oder Produktaktivierung.
- Offene Findings:
  - `none` ohne Zielschritt; F-ACT-R9-31 bis -57 sind fixed; keine offene
    In-Scope-P0-/P1-Lücke. Der finale CodeRabbit-Null-Lauf ist ein ausstehender
    Reviewnachweis, kein offenes Produktfinding.
- Geänderte Dateien:
  - `data-access.js`, `data-access.contract.test.js`, neue
    `session-canonicalization.js`, `session-correction.js` und
    `session-correction.contract.test.js`;
  - neu SQL 23, dessen Rollback und Fixture; geändert SQL 16,
    `sql/HOW_TO.md`, der R8-Isolationsoracle sowie diese Roadmap und Evidence.
  - neu `session-history.js`, `session-history-shell.js` samt CSS, isolierter
    History-Harness und beide zugehörigen Contracttestdateien.
  - geändert `session-shell.js` samt Contracttest; neu der reale
    `session-history-integration.contract.test.js`; History-Harness und
    Controller/Shell auf bestätigten Post-Mutation-Refresh verdrahtet.
- Gültige Nachweise:
  - archivierte R8-Evidence nur innerhalb ihrer dort belegten Grenzen.
- Runtime-/Deploy-Stand:
  - R8 SQL produktiv und quellhashidentisch; R9-Clientcode/Harness bleibt
    isoliert und nicht produktiv geladen. SQL 23 ist produktiv installiert,
    die vier Public-RPCs bleiben mangels V2-Consumer produktiv unsichtbar;
    Activity-V2-Produktzähler 0/0/0. Kein Productload, keine reale Session,
    kein Web-/Edge-/APK-Deploy und kein Commit.
- Offene Owner-Freigaben:
  - S6, Rollback, produktive Sessionmutation, Productload, Deploy und Commit
    bleiben separat owner-gatet beziehungsweise verboten. Die SQL-23-
    Freigabe ist verbraucht und autorisiert keinen Rerun.
- Stop-Bedingungen:
  - vor S6 stoppen; keinen SQL-23-Rerun, Rollback, Productload, Deploy, Commit
    oder reale Activity-V2-Sessionmutation ohne neuen exakten Owner-Auftrag.

## S4-Neustartkarte nach S4R-Freeze

Status 2026-08-13: `VERBRAUCHT / HISTORISCH`. Diese Karte dokumentiert
den bereits abgeschlossenen Wiederanlauf in Block A und darf nicht erneut als
Auftrag verwendet werden. Block B wurde danach mit eigenem Owner-Auftrag
ebenfalls abgeschlossen. Für jede Fortsetzung gilt ausschließlich die
aktualisierte Session Resume Card.

Zweck: Ein neuer Chat mit frischem Tokenkontingent stellt den Arbeitskontext
aus den aktuellen Quellen wieder her, prüft nur den seit dem Freeze möglichen
Drift und beginnt danach ohne erneute Discovery-Diskussion mit Block A.

Verbindliche Kontextwiederherstellung:

1. Zuerst Roadmap-Metadaten, Ausführungs-Chat-Startkarte, Session Resume Card,
   diese Neustartkarte, Statusmatrix und S4R-Gate lesen.
2. Danach diese Roadmap und die zugehörige Evidence-Datei vollständig lesen.
   Die eingefrorenen Entscheidungen und Findings nicht aus Erinnerung
   paraphrasieren oder neu erfinden.
3. Anschließend `README.md`, `docs/DEV_ENVIRONMENT.md`,
   `docs/templates/README.md` und den Roadmap Workflow Contract lesen.
4. Für Block A gezielt die aktuelle Activity-V2-Übersicht, R1-/C2-Verträge,
   die R8-Commit-/Identity-/Evidence-Grenzen und den R4-Cachevertrag lesen.
   R7 nur bei einer konkreten Recovery-/State-Frage öffnen.
5. Danach reale Block-A-Quellen und Tests lesen, insbesondere
   `data-access.js`, `session-shell.js`, bestehende Contracttests sowie die
   relevanten SQL-20/21/22-/SQL-16-Signaturen als unveränderliche
   Servergrenze. Keine Implementierung vor Abschluss dieser Leseschritte.
6. Zuletzt `git status --short`, HEAD und nur den relevanten Diff prüfen. Den
   Freeze-HEAD nicht als aktuellen Stand annehmen: Abweichungen gezielt
   erklären, fremde Worktree-Änderungen unangetastet lassen.
7. Den günstigen bestehenden Activity-V2-Contracttest-Baselinecheck ausführen.
   Exakter Befehl:
   `node --test app/modules/vitals-stack/activity/v2/*.contract.test.js`;
   Freeze-Erwartung: 179/179 grün.
   Produktive Supabase-Abfragen nur bei einem konkreten Drift oder einer neuen
   Vertragsfrage und ausschließlich read-only wiederholen.

Wiederanlaufentscheidung:

- Wenn Freeze, realer Stand und S4R-Verträge weiter übereinstimmen, ohne
  Rückfrage direkt Block A ausführen.
- Bei nicht zentralem Drift ein namespacetes Finding dokumentieren, Roadmap
  und Evidence synchron korrigieren und Block A fortsetzen.
- Bei zentralem R8-/R9-Widerspruch, fremdem überlappendem Worktree-Delta,
  fehlender Owner-Entscheidung oder notwendiger Scope-Erweiterung stoppen und
  den Blocker berichten.
- S1-S4R nicht vorsorglich wiederholen und keine Archive außerhalb einer
  konkreten Vertragsfrage vollständig neu laden.

Block-A-Auftrag:

- ausschließlich S4.1 und S4.2 deterministisch Punkt für Punkt umsetzen;
- versionierte Data-Access-/Response-/Domainfehler-/`mutationState`-Verträge
  sowie das separate Correction-/Canonicalization-/CAS-Modell implementieren;
- T-ACT-R9-01 bis T-ACT-R9-04 und zugehörige EV-Nachweise ausführen;
- Full Contract Review gegen D-ACT-R9-01 bis -36, F-ACT-R9-01 bis -30 und die
  unveränderten R8-/Produktisolationsverträge durchführen;
- Roadmap, Evidence, Statusmatrix und Resume Card nach dem Block-A-Gate
  synchronisieren;
- nach Block A stoppen und `GO`, `CONDITIONAL GO` oder `NO-GO` für Block B
  berichten. Weder Block B ab S4.6 noch Block C ab S4.3 vorziehen.

Weiterhin verbindliche Grenzen:

- kein produktives SQL, kein Deploy, keine reale Activity-V2-Session und kein
  produktiver Write;
- keine Änderung an Activity V1, Produktnavigation, Root-`index.html`, Root-
  Service-Worker, Doctor View, Reports, Protein Target oder Trendpilot;
- R7-/R8-Request-, Recovery-, Commit-Intent-, Fingerprint- und Tombstone-
  Verträge nicht ändern;
- vorhandene fremde Worktree-Änderungen nicht anfassen;
- kein Commit ohne separaten Owner-Auftrag.

Kopierfertiger Neustartprompt:

```text
Arbeite im Repository:

C:\Users\steph\Projekte\M.I.D.A.S

Verbindliche Source of Truth ist:

docs/MIDAS Activity V2 R9 Session History Detail Correction and Deletion Roadmap.md

Evidence-Datei:

docs/MIDAS Activity V2 R9 Session History Detail Correction and Deletion Evidence.md

Dies ist der ausdrückliche Owner-Auftrag, den eingefrorenen R9-Stand
R9-S4R-FREEZE-2026-08-11 wiederaufzunehmen und ausschließlich S4 Block A
(S4.1-S4.2) vollständig auszuführen.

Stelle zuerst den Kontext exakt gemäß der „S4-Neustartkarte nach S4R-Freeze“
wieder her. Lies Roadmap und Evidence vollständig, danach die dort für Block A
genannten Referenzen und realen Quellen in der festgelegten Reihenfolge. Prüfe
HEAD, Git-Status, relevanten Diff und den günstigen Activity-V2-Testbaseline.
Übernimm weder Chat-Erinnerungen noch ältere Roadmaps ungeprüft. Wiederhole
S1-S4R nicht ohne realen Drift und lade Archive nur für konkrete
Vertragsfragen.

Wenn der reale Stand den Freeze bestätigt, beginne ohne weitere Rückfrage mit
S4.1 und arbeite anschließend S4.2 ab. Implementiere nur den eingefrorenen
Block-A-Vertrag, führe T-ACT-R9-01 bis T-ACT-R9-04 sowie die zugehörigen
Evidencechecks aus, mache den vollständigen Contract Review und synchronisiere
Roadmap, Evidence, Statusmatrix und Resume Card.

Stoppe sofort bei einem zentralen R8-/R9-Widerspruch, einer notwendigen
produktiven/destruktiven Aktion, einer fehlenden fachlichen Owner-Entscheidung,
einer Scope-Erweiterung oder einem fremden überlappenden Worktree-Delta. Nicht
blockierenden Drift mit neuer namespaceter R9-Finding-ID dokumentieren,
berechtigt korrigieren und im Block weiterarbeiten.

Unveränderliche Grenzen: Activity V1 bleibt der einzige produktive
Activity-Consumer, Activity V2 bleibt bis R12 isoliert. Kein produktives SQL,
kein Deploy, keine reale Sessionmutation, keine Änderung an Produktload,
Navigation, Root-index.html, Root-Service-Worker, Activity V1, Doctor View,
Reports, Protein Target oder Trendpilot. R7-/R8-Commit-, Recovery-, Request-ID-,
Request-Fingerprint-, Commit-Intent- und Tombstone-Verträge bleiben
unverändert. Fremde Worktree-Änderungen bleiben unangetastet. Kein Commit.

Stoppe nach dem vollständigen Block-A-Gate. Beginne weder Block B noch Block C.
Berichte kompakt: Kontext-/Driftcheck, umgesetzte Änderungen, Tests/Evidence,
Contract-Review-Findings, Block-A-Gate, verbleibende Owner-Gates und Readiness
für Block B.
```

## S4 Block-C-Handoffkarte nach Block-B-Gate

Status 2026-08-13: `VERBRAUCHT / HISTORISCH`; Block C wurde mit eigenem
Owner-Auftrag vollständig abgeschlossen. Für jede Fortsetzung gilt die
Session Resume Card und die nachfolgende Block-D-Handoffkarte.

- Ausgangspunkt:
  - Freeze-ID `R9-S4R-FREEZE-2026-08-11`;
  - HEAD-Basis `0d9192f533091954e4b55e786046f004d25d1ea5` plus die in der Session
    Resume Card aufgezählten, noch nicht committeten R9-Block-A-/B-Deltas;
  - Block-A- und Block-B-Gates `PASS`; T-ACT-R9-01 bis -04 sowie -10 bis
    -15 `PASS`; F-ACT-R9-31 bis -37 `fixed`;
  - keine produktive R9-Wirkung und keine offene In-Scope-P0-/P1-Lücke.
- Verbindliche Kontextwiederherstellung:
  1. Roadmap-Metadaten, Ausführungs-Chat-Startkarte, Session Resume Card,
     diese Handoffkarte, Statusmatrix sowie Block-A-/Block-B-Gates lesen.
  2. Roadmap und Evidence vollständig lesen; danach nur die in S4.3-S4.5
     genannten R4-/R7-/R8-/UI-/Shell-/State-/Cachequellen und aktuellen
     Block-A-/B-Dateien gezielt lesen.
  3. HEAD, `git status --short`, relevanten Diff und den günstigen Baseline-
     Befehl
     `node --test app/modules/vitals-stack/activity/v2/*.contract.test.js`
     prüfen. Erwartung am Handoff: 186/186 grün.
  4. S1-S4R und abgeschlossene Blöcke A/B ohne real belegten Drift nicht
     wiederholen. Archive nur für eine konkrete Vertragsfrage öffnen.
- Nächster zulässiger Umfang:
  - ausschließlich nach ausdrücklichem Owner-Auftrag Block C in
    deterministischer Reihenfolge S4.3 -> internes Gate -> S4.4 -> internes
    Gate -> S4.5 -> Block-C-Gate;
  - History-/Detail-Shell, Correction-/Reconciliation-UI und Delete-UX samt
    lokalen Consumer-Harnesses; SQL 23 wird nur als eingefrorene Servergrenze
    konsumiert und nicht produktiv ausgeführt;
  - T-ACT-R9-05 bis -09 und EV-ACT-R9-BR01 bis -BR05; anschließend Roadmap,
    Evidence, Statusmatrix und Resume Card synchronisieren und vor Block D
    stoppen.
- Unveränderte Stop-Grenzen:
  - kein produktives SQL, keine reale Sessionmutation, kein Deploy, kein
    Commit und keine Produktaktivierung;
  - Activity V1, Navigation, Root-`index.html`, Root-Service-Worker, Doctor
    View, Reports, Protein Target, Trendpilot sowie R7-/R8-Verträge bleiben
    unangetastet;
  - bei zentralem R8-/R9-Widerspruch, fremdem überlappendem Worktree-Delta,
    fehlender Owner-Entscheidung, destruktivem Bedarf oder Scope-Erweiterung
    sofort stoppen.

## Gekoppelte Block-E/S5-Ausführungskarte nach Block-D-Gate

Status 2026-08-13: `VERBRAUCHT / PASS / HISTORISCH`.

- Ausgangspunkt:
  - Freeze-ID `R9-S4R-FREEZE-2026-08-11` und unveränderte HEAD-Basis
    `0d9192f533091954e4b55e786046f004d25d1ea5` plus die in der Session Resume
    Card aufgezählten, noch nicht committeten R9-Deltas;
  - Block-A-, Block-B-, Block-C- und Block-D-Gates `PASS`; T-ACT-R9-01 bis
    -16 ausgeführt, F-ACT-R9-31 bis -43 `fixed`; T-ACT-R9-17 bis -22 bleiben
    bewusst Block E/S5 vorbehalten;
  - 203/203 Activity-V2-Contracttests, T-ACT-R9-16, Browser-Smoke,
    disposable SQL-23-Revalidierung und R8-Isolationsoracle grün; keine
    produktive R9-Wirkung und keine offene In-Scope-P0-/P1-Lücke.
- Verbindliche Kontextwiederherstellung:
  1. Roadmap-Metadaten, Ausführungs-Chat-Startkarte, Session Resume Card,
     diese Handoffkarte, Statusmatrix und Gates der Blöcke A bis D lesen.
  2. Roadmap und Evidence vollständig lesen; danach gezielt S4.10,
     D-ACT-R9-01 bis -36, F-ACT-R9-10 bis -12/-15/-21/-27 und F-ACT-R9-40
     bis -43 sowie reale History-/Correction-/Data-Access-/Shell-/Cache-,
     Harness-, CSS-, Isolation- und Activity-V1-/R7-/R8-Quellen.
  3. HEAD, `git status --short`, relevanten Diff und
     `node --test app/modules/vitals-stack/activity/v2/*.contract.test.js`
     prüfen; Handoff-Erwartung ist 203/203 grün.
  4. S1-S4R und Blöcke A bis D ohne real belegten Drift nicht wiederholen;
     Archive nur für konkrete Vertragsfragen öffnen.
- Freigegebener gekoppelter Umfang:
  1. Invalidation-Gate über HEAD, Worktree und exakte Source-Hashes. T-ACT-R9-
     01 bis -16 und EV-ACT-R9-L01 bis -I01 bleiben gültig, wenn ihre Quellen
     unverändert sind; anderenfalls nur die tatsächlich invalidierten Checks
     wiederholen.
  2. S4.10 mit List/Detail/Correction/Delete/Conflict/Unknown/Refresh,
     Product-/V1-/R7-/R8-Isolation, Legacy-Child-UUID-Negatividentität sowie
     1440x900, 390x844 und 320x800; T-ACT-R9-17/-18 und
     EV-ACT-R9-I02/-BR06 schließen.
  3. Einmalige finale Gesamtsuite, Syntax-, Diff-, Productload- und
     Isolationschecks. Bereits grüne SQL-/Race-/Security-Fixtures werden bei
     unveränderten SQL-/Fixture-/Grant-Hashes nicht wiederholt.
  4. Review-Ledger A-D validieren; Full Review ausschließlich für den Block-E-
     Delta und seine blockübergreifenden Integrationsflächen. Danach genau
     eine CodeRabbit-Lane auf dem finalen Gesamtdiff; nur bei daraus
     entstandener Änderung die invalidierten Checks und den geänderten Scope
     erneut prüfen.
  5. T-ACT-R9-20 produktiv read-only. Bei PASS ist das mit diesem Auftrag
     ausdrücklich freigegebene T-ACT-R9-21 auszuführen; anschließend nur
     read-only T-ACT-R9-22, Evidence-Sync und `STOP vor S6`.
- Ergebnis:
  - T-ACT-R9-17 bis -22 `PASS`; F-ACT-R9-44/-45 `fixed`;
  - SQL 23 wurde exakt einmal produktiv ausgeführt, Postconditions sind grün;
  - historischer Stand beim damaligen Block-E-Gate: CodeRabbit blieb in der
    Installationslane technisch nicht verfügbar und wurde nicht als externer
    Review-PASS dargestellt; der spätere erfolgreiche CLI-/Korrekturstand
    F-ACT-R9-46 bis -56 steht ausschließlich in der aktuellen Session Resume
    Card und Evidence;
  - diese Karte erteilt keinen Folgeauftrag. Es gilt die Session Resume Card.
- Unveränderte Stop-Grenzen:
  - produktives SQL ausschließlich exakt SQL 23 nach grünen Vorbedingungen;
    keine reale Sessionmutation, kein Rollback, Deploy, Commit oder
    Produktaktivierung;
  - Activity V1, Navigation, Root-`index.html`, Root-Service-Worker und alle
    R7-/R8-Identitäts-, Recovery-, Commit-Intent- und Tombstoneverträge bleiben
    unangetastet;
  - bei zentralem Widerspruch, fremdem überlappendem Delta, fehlender
    Owner-Entscheidung, destruktivem Bedarf oder Scope-Erweiterung stoppen.

## Zielvertrag

Prüfbares Endergebnis:

- Eine signierte Person kann ausschließlich ihre eigenen abgeschlossenen
  Activity-V2-Sessions in stabiler, absteigender Keyset-Pagination laden.
- Eine Detailansicht zeigt exakt die beim Commit persistierten Session-, Item-,
  Policy- und Satzsnapshots; spätere Katalogänderungen verändern die Historie
  nicht.
- Eine Korrektur ersetzt in einer Transaktion alle veränderlichen Inhalte der
  Session und ihrer Items/Sätze, erhöht genau eine Revision und verhindert
  Lost Updates durch Revision plus Content-Fingerprint-CAS.
- Der Content-Fingerprint wird bei Detail und Mutation serverseitig aus
  demselben kanonischen Inhalt abgeleitet. Er ist keine persistente Spalte und
  enthält weder Revision noch technische UUIDs oder Zeitstempel.
- Öffentliche R9-Readmodelle und Mutationsrequests verwenden keine technischen
  Item-/Set-UUIDs als dauerhafte Identität; ein Vollersatz darf diese
  Storage-IDs neu erzeugen.
- Eine identisch wiederholte Korrektur wird als idempotenter Replay erkannt;
  eine veraltete andere Korrektur endet sichtbar als Konflikt.
- Eine Löschung entfernt die Session und kaskadiert Items/Sätze atomar. Ein
  identischer Wiederholungsversuch ist sicher und verrät keine fremde Existenz.
- Nach Korrektur oder Löschung zeigen Historie, Detail und
  Last-Performance-Lookup bei der nächsten bestätigten Aktualisierung denselben
  Datenstand.
- Fehler-, Loading-, Empty-, Conflict-, Unknown-Outcome- und Retry-Zustände
  sind deterministisch und behaupten keinen Erfolg ohne Reconciliation.
- Neue SQL-Objekte sind mit RLS/ACL/Auth/Owner/Search-Path-/Overload-Checks,
  Forward-/Rerun-/Rollback-Nachweisen und expliziten Grants abgesichert.

Bewusst unverändert:

- Activity V1, produktive Vitals-Navigation, `index.html`, Service Worker,
  Doctor View, Reports, Protein Target und Trendpilot.
- R7-Draft- und Recovery-Schema sowie R8-Commit-Intent, Request-ID,
  Commit-RPC und Tombstone-Vertrag.
- Katalogidentitäten und -versionen bereits abgeschlossener Sessions.
- R10-Coaching-Export, R11-Doctor-Integration, R12-Cutover, R13-Import und
  optionale R14-Retention.

## Problem und Ist-Zustand

- Beobachtung:
  - R8 kann Sessions atomar persistieren und Last Performance lesen, stellt
    aber noch keine bounded Historie, Detailansicht oder Lifecycle-Mutation
    bereit.
  - `request_fingerprint` beschreibt den ursprünglichen Commit und kann nicht
    zugleich den nachträglich veränderlichen Inhalt repräsentieren.
  - Die vorhandene Sortierung `(user_id, started_at desc, id desc)` erlaubt
    bereits stabile Keyset-Pagination.
  - Session-Items und Sets kaskadieren bei Sessionlöschung bereits per FK.
- Risiko oder Reibung:
  - Ein naiver Update-Pfad könnte ursprüngliche Commitidentität zerstören,
    Lost Updates zulassen, historische Snapshots auf den Live-Katalog
    umdeuten oder nach einem Netzabbruch einen erfolgreichen Write doppelt
    ausführen.
  - Ein unbounded oder offsetbasierter History-Consumer würde mit wachsender
    Langzeithistorie instabil und teuer.
- Offene Hypothese:
  - Die genaue interne Helper-Grenze und bestehende Cache-/Shell-Seams müssen
    in S1/S2 am realen Code und an aktueller Supabase-Dokumentation bestätigt
    werden; sie ändern nicht den fachlichen Vertrag.

## Entscheidungslog

<!-- markdownlint-disable MD013 -->

| ID | Datum | Entscheidung | Warum | Betrifft |
| --- | --- | --- | --- | --- |
| D-ACT-R9-01 | 2026-08-11 | Historie verwendet Keyset-Cursor `(started_at, id)` in absteigender Reihenfolge. | Stabil bei Einfügungen und passend zum vorhandenen Index. | List RPC / UI |
| D-ACT-R9-02 | 2026-08-11 | Standardseite 20, hartes Maximum 50; kein unbounded Fetch. | Langzeit-Wartbarkeit und bounded Payload. | List RPC / Tests |
| D-ACT-R9-03 | 2026-08-11 | Detaildaten stammen aus gespeicherten Snapshots, nie aus aktueller Katalog-Reinterpretation. | Historische Wahrheit bleibt stabil. | Detail RPC / UI |
| D-ACT-R9-04 | 2026-08-11 | Korrektur ist atomarer Vollersatz aller veränderlichen Sessioninhalte. | Einfacherer, überprüfbarer Vertrag als viele Teilmutationen. | O-5 / SQL |
| D-ACT-R9-05 | 2026-08-11 | `id`, `user_id`, `request_id`, `request_fingerprint`, `started_at`, `day`, `title`, `created_at` und ursprüngliche `catalog_version` sind in R9 unveränderlich. | Commitidentität, Sortierung und Snapshotsemantik bleiben erhalten; für `title` existiert kein freigegebener Editorvertrag. | Correction |
| D-ACT-R9-06 | 2026-08-11 | `duration_min` ist korrigierbar; `ended_at` wird daraus relativ zum unveränderlichen `started_at` abgeleitet. | Keine widersprüchlichen Zeitfelder. | Correction |
| D-ACT-R9-07 | 2026-08-11 | Sessionnotiz, Itemauswahl/-reihenfolge, Itemwerte/-notizen und Sets sind innerhalb der ursprünglichen Katalogversion korrigierbar. Neu hinzugefügte Items erhalten ihren Snapshot ausschließlich aus genau dieser Version. | Reale Eingabefehler können behoben werden, ohne aktuelle Katalogsemantik in die Vergangenheit zu übertragen. | Correction |
| D-ACT-R9-08 | 2026-08-11 | Sessions erhalten eine persistente `revision bigint`, beginnend bei 1. | Explizite Optimistic-Concurrency-Grenze. | Schema |
| D-ACT-R9-09 | 2026-08-11 | Der aktuelle mutable Inhalt erhält einen serverseitig kanonisch berechneten SHA-256-Content-Fingerprint; `request_fingerprint` bleibt unangetastet. | CAS und Retry ohne Bedeutungsvermischung. | Detail / Correction / Delete |
| D-ACT-R9-10 | 2026-08-11 | Korrektur prüft erwartete Revision und erwarteten Content-Fingerprint unter Row Lock. | Verhindert Lost Updates und TOCTOU-Races. | Correction RPC |
| D-ACT-R9-11 | 2026-08-11 | Ist der aktuelle Inhalt bereits exakt der gewünschte Inhalt, antwortet Correction als idempotenter Replay. | Sicher bei verlorener Erfolgsantwort. | Correction RPC |
| D-ACT-R9-12 | 2026-08-11 | Delete ist ein Hard Delete mit CAS und FK-Cascade; kein Papierkorb/Audit-Trail. | MIDAS benötigt keine langfristige Löschhistorie. | Delete RPC |
| D-ACT-R9-13 | 2026-08-11 | Fehlende und fremde Session liefern denselben nicht-leakenden Außenvertrag. | Keine Ownership-Enumeration. | Detail / Mutation |
| D-ACT-R9-14 | 2026-08-11 | Unbekannter Mutationserfolg wird durch Re-read reconciled, nie durch blindes Wiederholen mit neuem Inhalt. | Netzabbrüche dürfen keinen falschen UI-Zustand erzeugen. | Data Access / UI |
| D-ACT-R9-15 | 2026-08-11 | Correction State ist memory-only und vollständig getrennt von R7-Recovery/R8-Commit. | Kein Überschreiben einer aktiven Trainingssession. | Client State |
| D-ACT-R9-16 | 2026-08-11 | History Reads sind erlaubt; Correction/Delete werden bei aktivem nichtleerem Draft oder ungelöstem Commitzustand im selben UI blockiert. | Destruktive Parallelflüsse bleiben verständlich. | UI Guard |
| D-ACT-R9-17 | 2026-08-11 | Nach Mutation werden Liste, Detail und betroffene Last-Performance-Daten invalidiert und bestätigt neu geladen. | Keine sichtbare Stale-Historie. | Consumer |
| D-ACT-R9-18 | 2026-08-11 | R9-Readmodelle sind versioniert, bounded und nicht das R10-Exportformat. | UI-Vertrag und Coaching-Export bleiben getrennt. | API |
| D-ACT-R9-19 | 2026-08-11 | Read-RPCs bleiben invoker-/RLS-gebunden; Mutation-RPCs dürfen nur gehärtet, explizit gegrantet und mit `auth.uid()`-Ownership arbeiten. | Supabase-Security-Vertrag. | SQL / ACL |
| D-ACT-R9-20 | 2026-08-11 | Keine produktive Testsession, Korrektur oder Löschung; produktiv wird nur owner-gatetes SQL installiert und read-only geprüft. | Schutz realer Gesundheitsdaten. | S5 |
| D-ACT-R9-21 | 2026-08-11 | R8-T16/T19 bleiben dokumentierte R8-Gaps und werden nicht als R9-PASS ausgegeben. | Evidence-Ehrlichkeit. | S5/S6 |
| D-ACT-R9-22 | 2026-08-11 | Keine Bulk-Aktion, Retention, persistente Correction-Recovery oder Produktaktivierung in R9. | Scope bleibt beherrschbar. | Nicht-Scope |
| D-ACT-R9-23 | 2026-08-11 | Der SQL-23-Rollback ist nur ein Deployment-Rollback vor der ersten realen R9-Korrektur/Löschung; nach Lifecycle-Nutzung ist eine eigene Forward-Migration erforderlich. | Ein Hard Delete hinterlässt bewusst keinen Auditnachweis und kann durch DDL-Rollback nicht wiederhergestellt werden. | Rollback / S5 |
| D-ACT-R9-24 | 2026-08-11 | Produktiv wird ausschließlich SQL 23 angewandt. Der vollständige frische/disposable Zielaufbau wird als `20 -> 21 -> 22 -> 23 -> 16` bewiesen; ältere Activity-Migrationen werden nach SQL 23 nicht nochmals über den neueren Stand gelegt. | Frühere Kanon-Guards kennen die additive R9-Revision nicht; SQL 16 kann die neuen RPCs erst nach SQL 23 abschließend granten. | Provisioning / HOW-TO |
| D-ACT-R9-25 | 2026-08-11 | `content_fingerprint` wird in Detail-, Correction- und Delete-RPC aus demselben kanonischen aktuellen Inhalt berechnet und nicht persistiert; nur `revision` ist eine neue Spalte. | Keine Driftspalte, kein Trigger und keine Änderung des bewiesenen R8-Commitpfads. | Schema / Canonicalization |
| D-ACT-R9-26 | 2026-08-11 | Item-/Set-UUIDs sind storage-lokal, dürfen beim atomaren Vollersatz wechseln und werden im öffentlichen R9-Read-/Mutationvertrag nicht als Identität exponiert. | Der einfache Vollersatz bleibt möglich; Consumer verwenden `item_key`, `item_order` und `set_order`. | API / Correction / R10-Grenze |
| D-ACT-R9-27 | 2026-08-11 | Die DB-Revision bleibt `bigint`, wird im gesamten JSON-/JS-Vertrag aber als kanonischer positiver Dezimalstring transportiert. | JavaScript-Number darf keine Concurrency-Information verlieren. | API / CAS |
| D-ACT-R9-28 | 2026-08-11 | Die ursprüngliche Katalogversion wird aus den gelockten Sessionitems abgeleitet; exakt eine gemeinsame Version ist Pflicht. | Real existiert keine Session-Katalogspalte, und der R8-Commit darf nicht geändert werden. | Detail / Correction |
| D-ACT-R9-29 | 2026-08-11 | Eine einzige pure Canonical-Content-Funktion liegt im nicht exponierten Schema `midas_private`, läuft als `SECURITY INVOKER` und besitzt nur die minimal für die invoker-gebundene Detail-RPC nötigen Rechte. | Gleiche Canonicalization ohne öffentliches Helper-RPC oder RLS-Bypass. | SQL / Security |
| D-ACT-R9-30 | 2026-08-11 | R9-Mutationsaufrufe dürfen intern höchstens einmal mit exakt demselben vorab serialisierten Request wiederholt werden; danach ist jeder unklare Ausgang `unknown` und erzwingt Re-read. | Sichere Response-Loss-Behandlung ohne neue Requestidentität oder Payloaddrift. | Data Access / Retry |
| D-ACT-R9-31 | 2026-08-11 | Der lokale History-Mutationsguard ist ein rein lesender, fail-closed Adapter über bestehende R7-/R8-Controller; deren APIs und persistente Zustände bleiben unverändert. | R9 erhält Admission Control ohne Recovery-/Commit-Scope vorzuziehen. | UI Guard |
| D-ACT-R9-32 | 2026-08-11 | `sessionShell` erhält als einzige R4-Erweiterung eine enge `refreshLastPerformance(itemKeys)`-Seam mit Generation-Fencing und terminalem Refreshresultat. | Der reale mount-lokale Cache kann sonst nach Edit/Delete nicht gezielt entwertet werden. | Consumer / Cache |
| D-ACT-R9-33 | 2026-08-11 | SQL 23 setzt ACLs für alle eigenen Objekte selbst; SQL 16 spiegelt denselben Vertrag für Fresh Provisioning. Plattform-Default-Grants sind nie Evidence. | Aktuelle Supabase-Data-API-Defaults und bestehende breite Default-ACLs sind kein stabiler Sicherheitsvertrag. | Provisioning / Security |
| D-ACT-R9-34 | 2026-08-11 | Historische Child-UUIDs in bestehenden R8-/R4-Responses bleiben aus Kompatibilitätsgründen unangetastet, sind aber ausdrücklich nur Legacy-Transportfelder. | R9 darf R8 nicht ändern und darf diese Felder zugleich nicht zur Fachidentität erheben. | Compatibility / Identity |
| D-ACT-R9-35 | 2026-08-11 | Die Nicht-Exposition von `midas_private` wird sowohl per Schema-/ACL-Katalog als auch durch einen Data-API-Negativnachweis geprüft. | Datenbankrechte allein beweisen die externe PostgREST-Schemakonfiguration nicht. | Security / Evidence |
| D-ACT-R9-36 | 2026-08-11 | Der SQL-23-Rollback verlangt zusätzlich zum technischen Preflight die positive operative Bestätigung, dass keine R9-Lifecycle-Mutation stattgefunden hat; `revision = 1` allein genügt nie. | Ein Hard Delete oder identischer Replay kann ohne Audit absichtlich keine sichere DB-Spur hinterlassen. | Rollback / Owner Gate |

<!-- markdownlint-enable MD013 -->

## Owner-Briefing-Bedarf

- Erklärmodus:
  - `Briefing + S6-Recap`.
- Neue oder entscheidungsrelevante Konzepte:
  - Keyset-Pagination statt Seitenoffset;
  - Revision plus Content-Fingerprint als Optimistic Concurrency;
  - atomarer Vollersatz unter unveränderlicher Erstellungsidentität;
  - Hard Delete und Reconciliation nach unbekanntem Ausgang;
  - produktive SQL-Erweiterung ohne reale Datenmutation.
- Geplante Briefing-Gates:
  - S4R vor Implementierung;
  - S5 vor produktivem SQL;
  - S6 als kurze Alltagserklärung.
- Nicht erneut zu erklären:
  - normale JS-/CSS-Änderungen, Standard-Syntaxchecks und bekannter
    CodeRabbit-Ablauf.

## Scope und Grenzen

In Scope:

- versionierte, bounded History- und Detail-Readmodelle;
- Keyset-Pagination mit Cursorvalidierung;
- separates memory-only Correction-Modell und isolierte UI;
- atomarer Full-Replacement-RPC mit Revision/Fingerprint-CAS;
- kontrollierter Hard-Delete-RPC mit Cascade-/Replay-/Ownership-Nachweis;
- Last-Performance-Invalidation/Re-fetch nach Mutation;
- SQL 23 Forward/Rerun/Rollback, Fixture, Grants und Security-Hardening;
- isolierte Browser-/Contract-/Disposable-SQL-Nachweise;
- Doku-, QA- und HOW-TO-Sync.

Nicht in Scope:

- produktive Sichtbarkeit oder Navigation von Activity V2;
- Änderung an Activity V1 oder Dual-Write;
- Coaching-Export, Doctor View, Reports, Protein Target oder Trendpilot;
- persistente Recovery eines begonnenen Correction-Formulars;
- Bulk Edit/Delete, Papierkorb, Audit Trail oder Retention;
- Katalogpflege, Cross-Version-Migration oder neue Aktivitätssemantik;
- Android-ADB-/Prozess-Reclaim-Beweis, APK- oder Webdeploy.

Roadmap-spezifische Guardrails:

- Das R8-`request_fingerprint` bleibt der Fingerprint des Originalcommits.
- Historische Item-/Policy-Snapshots sind Source of Truth der Anzeige.
- Korrektur validiert dieselben Policy-/Werte-/Längen-/Ordnungsgrenzen wie der
  Commit, jedoch nur gegen die ursprüngliche Katalogversion.
- Unveränderte Items behalten ihre persistierte Snapshotsemantik; neu in die
  korrigierte Session aufgenommene Items dürfen nur aus der exakt
  ursprünglichen, driftfreien Katalogversion snapshotten.
- Eine Session bleibt nach Korrektur unter derselben ID und an derselben
  chronologischen Position.
- Delete ist nur einzeln und nach expliziter Bestätigung möglich.
- Clientseitige Direct-DML auf Activity-V2-Tabellen bleibt verboten.
- SQL-Fehlerdetails werden geloggt, aber nicht roh an den UI-Consumer gegeben.
- Der Rollback ist kein Daten-Restore. Er muss bei belegter oder nicht sicher
  ausschließbarer R9-Mutationsnutzung stoppen.
- Produktiv wird nur SQL 23 ausgeführt. Frische/disposable Rekonstruktion und
  spätere Wartung befolgen die dokumentierte Sequenz; alte Migrationen werden
  nicht als globale Rerun-Skripte missverstanden.

## Scope-Freeze vor S4

- Bestehende Features:
  - Activity V1, R3-R8-Harnesses und R8-Commit bleiben funktional und
    unverändert; R9 ergänzt isolierte Consumer.
- Datenmodell, Lifecycle und Retention:
  - nur `revision` plus vier R9-RPC-Grenzen und gegebenenfalls ein nicht
    öffentlich ausführbarer interner Canonicalization-Helper;
  - keine Retention und kein Legacy-Cleanup.
- Cleanup, Scheduler, Secrets und externe Automationen:
  - nicht betroffen.
- Kompatible Producer und Consumer:
  - R8 bleibt einziger Session-Producer;
  - R4 Last Performance ist nach Mutation zu aktualisieren;
  - R10 darf später auf persistierte Daten aufbauen, aber nicht das R9-
    Readmodell als Exportvertrag missbrauchen.
- Offene Grundsatzfragen:
  - `none`; technische Helper-/Modul-Seams werden in S1/S2 belegt.
- Umgang mit späterem Scope-Wechsel:
  - gezielte S2/S3/S4R-Korrektur oder eigene Folge-Roadmap; kein stiller
    Scope-Zuwachs in S4.

## Vorgesehene API- und Datenverträge

Die Namen sind der bevorzugte Zielvertrag. S2 darf Signaturdetails nur ändern,
wenn PostgREST, bestehende SQL-Konventionen oder ein belegter Security-Grund es
erfordern; jede Abweichung wird als Finding dokumentiert.

- `midas.activity-session-history-page.v1`
  - bounded Liste mit `items`, `next_cursor` und `has_more`;
  - Cursor enthält ausschließlich `started_at` und `id`;
  - Listeneinträge enthalten keine vollständigen Sets.
- `midas.activity-session-detail.v1`
  - Session-, Item-, Policy- und Satzsnapshots;
  - `revision` und `content_fingerprint` für nachfolgende Mutation;
  - Fingerprint serverseitig abgeleitet, keine persistente
    `content_fingerprint`-Spalte;
  - keine Item-/Set-UUIDs als öffentlicher Identitätsvertrag;
  - keine Live-Katalog-Reinterpretation.
- `midas.activity-session-mutation-result.v1`
  - Ergebnis `updated`, `replayed`, `deleted`, `already_absent` oder
    definierter Konflikt;
  - neue Revision/Fingerprint bei bestehender Session;
  - keine rohen Postgres-/Constraintdetails.
- bevorzugte RPCs:
  - `activity_v2_list_sessions(integer, timestamptz, uuid)`;
  - `activity_v2_session_detail(uuid)`;
  - `activity_v2_replace_session(uuid, bigint, text, jsonb)`;
  - `activity_v2_delete_session(uuid, bigint, text)`.
- bevorzugte Data-Access-API:
  - `listSessions({ limit, cursor })`;
  - `loadSessionDetail(sessionId)`;
  - `replaceSession({ sessionId, expectedRevision,
    expectedContentFingerprint, session })`;
  - `deleteSession({ sessionId, expectedRevision,
    expectedContentFingerprint })`.

### Finaler S2-API-, Daten- und UX-Vertrag

Allgemeine JSON-Regeln:

- Responseobjekte besitzen exakt die dokumentierten Own-Keys; zusätzliche oder
  fehlende Keys, Getter/Accessors, nicht kanonische UUIDs/Fingerprints/
  Zeitstempel oder veränderbare Rückgabebäume werden clientseitig verworfen.
- UUIDs sind lowercase kanonisch. UTC-Zeitstempel verwenden exakt
  `YYYY-MM-DDTHH:mm:ss.sssZ`, Tage exakt `YYYY-MM-DD`, Fingerprints exakt 64
  lowercase Hexzeichen.
- `revision` ist in Responses und Data-Access-Optionen ein positiver
  Dezimalstring ohne Vorzeichen oder führende Null und innerhalb
  `1..9223372036854775807`; nur die SQL-Signatur verwendet `bigint`.
- Fachliche Integer bleiben JSON-Integer, persistierte `numeric`-Werte JSON-
  Numbers und fehlende optionale Werte explizit `null`; Arrays sind tief
  eingefroren und fachlich geordnet.

History Page `midas.activity-session-history-page.v1`:

```text
{
  schema_version,
  items: [{ session_id, started_at, day, title, duration_min,
            item_count, revision }],
  has_more,
  next_cursor: null | { started_at, id }
}
```

- `title` ist `string | null`; alle anderen Summaryfelder sind non-null.
- Defaultlimit 20, Minimum 1, hartes Maximum 50. Data Access sendet immer alle
  drei RPC-Parameter; SQL besitzt keine Defaultargumente.
- Cursor ist vollständig null oder vollständig gesetzt. SQL liest
  `(started_at, id) < (cursor_started_at, cursor_id)`, sortiert beide Felder
  `DESC` und lädt höchstens `limit + 1`.
- `items` enthält höchstens `limit` Einträge. `next_cursor` ist nur bei
  `has_more = true` der Cursor des letzten ausgelieferten Eintrags, sonst
  `null`. Refresh beginnt stets ohne Cursor; neue Inserts erscheinen erst dort.

Detail `midas.activity-session-detail.v1`:

```text
{
  schema_version, session_id, catalog_version, revision,
  content_fingerprint, started_at, ended_at, day, title, duration_min, note,
  items: [{
    item_key, item_order, item_label_snapshot, tracking_mode_snapshot,
    equipment_snapshot, load_comparability_snapshot, field_policy_snapshot,
    duration_min, distance_km, note,
    sets: [{ set_order, tracking_mode, reps, duration_sec, distance_m,
             weight_kg, assistance_kg }]
  }]
}
```

- Eigene vorhandene Session liefert genau ein Objekt, fehlende und fremde
  Session beide SQL-`null`; `loadSessionDetail` gibt dafür JS-`null` zurück.
- Items/Sets sind nach `item_order`/`set_order` geordnet. Detail liest nur die
  persistierten Snapshotspalten und niemals Label, Policy oder Mode aus dem
  aktuellen Katalog.
- Es werden weder `user_id`, Request-ID/-Fingerprint, Child-UUIDs noch
  Child-/Session-Creation-Timestamps exponiert.
- Detail leitet vor Ausgabe exakt eine gemeinsame positive `catalog_version`
  aus mindestens einem Sessionitem ab. Null, leer oder gemischt ist
  `SNAPSHOT_DRIFT`, wird payloadfrei diagnostiziert und außen als
  `REQUEST_FAILED` behandelt.

Replacement Request `midas.activity-session-replacement.v1`:

```text
{
  schema_version, duration_min, note,
  items: [{ item_key, item_order, duration_min, distance_km, note,
            sets: [{ set_order, reps, duration_sec, distance_m,
                     weight_kg, assistance_kg }] }]
}
```

- Request enthält weder Session-/Child-IDs, Katalogversion, Start-/Endzeit,
  Tag, Titel, Revision noch Fingerprint; CAS-Werte bleiben separate RPC-
  Parameter.
- Ein bis 50 eindeutige Items und pro Strength-Item ein bis 50 lückenlos
  geordnete Sets sind Pflicht. Normalisierung, ASCII-`btrim`, Unicode-
  Codepoint-Limits, Numeric-Skalen/Ranges, genau ein Primärwert und höchstens
  ein Lastwert entsprechen dem bewiesenen R8-Commitvertrag.
- Für bereits vorhandene `item_key`s kopiert der Server die gelockten
  persistierten Snapshotfelder unverändert. Nur neue Keys werden aus der exakt
  ursprünglichen Katalogversion gesnapshottet und müssen dort aktiv und
  policygültig sein. Live- oder höchste Katalogversion sind irrelevant.

Canonical Content `midas.activity-session-content.v1`:

- Exakte Rootkeys: `schema_version`, `catalog_version`, `duration_min`, `note`,
  `items`.
- Jedes Item enthält exakt die Detail-Itemkeys außer Child-ID/Creation-Time und
  trägt seine geordneten Sets mit exakt den im Detail genannten Setkeys.
- Enthalten sind die eine ursprüngliche Katalogversion, persistierte Item-/
  Policy-/Mode-Snapshots, alle aktuellen korrigierbaren Werte und explizite
  Nullwerte. `items` und `sets` werden aufsteigend nach ihren Ordnungen gebaut.
- Ausgeschlossen sind Session-/User-/Request-/Child-UUIDs,
  `request_fingerprint`, Revision, Start-/End-/Tag-/Created-/Updated-Zeiten und
  der unveränderliche Titel. `ended_at` ist nur aus Start plus Dauer abgeleitet.
- Die einzige Formungsgrenze ist
  `midas_private.activity_v2_canonical_content(integer, integer, text, jsonb)`.
  Sie ist pure `SECURITY INVOKER`, `IMMUTABLE`, besitzt einen leeren
  `search_path` und liegt in einem nicht Data-API-exponierten Schema.
- Die Funktion akzeptiert `p_items` nicht als opaken bereits kanonischen Block:
  sie validiert exakte Item-/Setkeys, Typen, explizite Nullwerte, eindeutige
  lückenlose Ordnungen und baut jedes Item/Set in der dokumentierten Form neu
  auf. Dadurch können Detail- und Desired-Content-Caller keine abweichende
  Itemform in den Hash einschleusen.
- Der Fingerprint ist serverseitig exakt lowercase
  `encode(extensions.digest(convert_to(canonical_content::text, 'UTF8'),
  'sha256'), 'hex')`. Detail, Replace, Delete und Fixture verwenden dieses
  Ergebnis; der Client berechnet keinen autoritativen Hash.

Immutable-/Mutable-Matrix:

| Ebene | Unveränderlich | Veränderlich/Systemwirkung |
| --- | --- | --- |
| Session | `id`, `user_id`, `request_id`, `request_fingerprint`, `started_at`, `day`, `title`, `created_at`, ursprüngliche Katalogversion | `duration_min`, daraus `ended_at`, `note`; Erfolg erhöht `revision` exakt um 1 und setzt `updated_at` |
| Item | bestehende Snapshotsemantik; Child-ID/`created_at` sind keine Fachidentität | Mitgliedschaft, `item_order`, Werte, Notiz; Vollersatz darf Storage-ID/-Zeit neu erzeugen |
| Set | keine stabile Child-ID; Mode bleibt `strength_sets` | Mitgliedschaft, `set_order`, Werte; Vollersatz darf Storage-ID/-Zeit neu erzeugen |

CAS-, Replay- und Delete-Reihenfolge:

1. Parameter/Form/Auth und permanente Sign-in-Grenze prüfen.
2. Eigene Sessionzeile per `FOR UPDATE` laden; Correction liefert bei absent/
   foreign `SESSION_NOT_FOUND`, Delete dagegen nicht-leakend `already_absent`.
3. Aktuelle Snapshotstruktur/Katalogversion/Canonical Content und Fingerprint
   unter demselben Lock ableiten; Drift stoppt vor Write.
4. Replace validiert und kanonisiert den gewünschten Vollersatz. Ist er exakt
   aktuell, folgt `replayed` vor stale CAS und ohne Revision-/Zeitänderung.
5. Sonst müssen erwartete Revision und Fingerprint beide aktuell sein;
   Abweichung liefert `SESSION_CONFLICT`. Revision-Maximum stoppt mit
   `REVISION_EXHAUSTED`.
6. Replace löscht/erstellt Children und ändert nur erlaubte Sessionfelder in
   einer Transaktion; Delete entfernt die gelockte Session mit FK-Cascade.
   Fehler rollen alles inklusive Revision zurück.
7. Replace gibt den nachpersistierten Fingerprint zurück. Delete/Delete wartet
   am Lock; der Verlierer sieht `already_absent`. Edit/Delete und Edit/Edit
   können nie beide aus demselben Preimage als unterschiedliche Writes gewinnen.

Mutation Result `midas.activity-session-mutation-result.v1`:

- Replace: exakt `{ schema_version, operation: "replace", outcome:
  "updated" | "replayed", session_id, revision, content_fingerprint }`.
- Delete: exakt `{ schema_version, operation: "delete", outcome:
  "deleted" | "already_absent", session_id }`.
- Conflict/Not-found/Invalid/Exhausted sind stabile Domainfehler, keine
  scheinbaren Resultvarianten. Rohe SQL-, Constraint- oder Ownershipdetails
  verlassen die Data-Access-Grenze nie.

RPC-/ACL-Vertrag:

- Exakte Public-Signaturen ohne Overload oder Defaultargument:
  - `activity_v2_list_sessions(integer,timestamptz,uuid)`;
  - `activity_v2_session_detail(uuid)`;
  - `activity_v2_replace_session(uuid,bigint,text,jsonb)`;
  - `activity_v2_delete_session(uuid,bigint,text)`.
- List/Detail sind `SECURITY INVOKER`, `STABLE`, RLS-/Owner-gebunden, haben
  leeren `search_path` und prüfen zusätzlich `auth.uid()` sowie
  `is_anonymous is false`, weil anonyme Sign-ins ebenfalls die DB-Rolle
  `authenticated` tragen. Replace/Delete sind `SECURITY DEFINER`, `VOLATILE`,
  Owner `postgres`, leerer `search_path`, vollqualifiziert und prüfen
  `auth.uid()` plus `is_anonymous is false` selbst.
- `PUBLIC`, `anon` und `service_role` erhalten kein Execute; nur
  `authenticated` erhält Execute auf den vier Public-RPCs. Direct Table DML
  bleibt entzogen. Das interne Schema erhält keinen Data-API-Expose-Eintrag;
  PUBLIC/anon/service bleiben ohne USAGE/Execute, `authenticated` erhält nur
  das für den invoker-Detailpfad nötige USAGE/Helper-Execute.
- SQL 23 führt Revoke/Grant selbst in derselben Transaktion aus; SQL 16 wird
  als deklarativer Fresh-Provisioning-Spiegel ergänzt.

Data-Access-/Fehler-/Retryvertrag:

- Public API wird additiv exakt um `listSessions`, `loadSessionDetail`,
  `replaceSession`, `deleteSession` ergänzt; R8-`commitSession` und
  R4-`loadLastPerformance` bleiben semantisch unverändert.
- Neue stabile Codes: `INVALID_HISTORY_REQUEST`, `SESSION_NOT_FOUND`,
  `SESSION_CONFLICT`, `REVISION_EXHAUSTED`, `MUTATION_OUTCOME_UNKNOWN`;
  bestehende `AUTH_REQUIRED`, `INVALID_SESSION`, `REQUEST_FAILED` und
  `IDEMPOTENCY_CONFLICT` bleiben kompatibel.
- Nur Replace/Delete-Fehler tragen `mutationState` mit exakt `not_applied` oder
  `unknown`; nur R8-Commitfehler behalten `commitState`. Kein bestehender
  Lookup-/Commitfehler erhält neue Own-Keys.
- Der Transport serialisiert Request/CAS einmal. Höchstens zwei Dispatches
  verwenden byte-/strukturidentische Argumente. Ein bekannter Auth-, Invalid-,
  Not-found-, Conflict- oder Exhausted-Response ist `not_applied`; Netzwerk,
  5xx oder malformed success nach Dispatch bleibt nach den identischen
  Versuchen `unknown` und nicht direkt retryable.
- Reconciliation liest Detail: gewünschter aktueller Content bestätigt das
  Ziel ohne Urheberschaft zu behaupten; unverändertes Preimage erlaubt nur
  einen ausdrücklich identischen Retry; anderer Content ist Conflict. Beim
  Delete bestätigt `null` nur „jetzt absent“, gleiches Preimage nur
  „nicht angewandt“, anderer Content Conflict. Neuer Inhalt erfordert stets
  neuen Detailstand und neue CAS-Werte.

UI- und lokale State-Verträge:

- History: `idle -> loading -> empty|ready|error`; Appendfehler erhält bereits
  geladene Einträge, Refresh ersetzt Liste/Cursor atomar.
- Detail: `closed -> loading -> ready|not_found|error`.
- Correction: `pristine|dirty -> saving -> confirmed|conflict|reconciling|
  error`; Dirty Close bestätigt, Conflict/Unknown bewahren die memory-only
  Working Copy, und Erfolg wird erst nach Result oder Reconciliation gezeigt.
- Delete: `confirming -> deleting -> confirmed|conflict|reconciling|error`;
  Bestätigung nennt Datum und Itemanzahl, niemals Bulk oder Undo.
- History Reads sind immer erlaubt. Mutation Admission liefert exakt
  `{ allowed, reason }` mit `reason = null | active_draft |
  commit_unresolved | guard_unavailable`. `item_count > 0`, Commit-Intent oder
  jeder Commitstate außer `editing`/`not_committed` ohne Intent blockiert;
  malformed/throwing bereitgestellte Controller blockieren fail-closed.
- Admission wird vor Öffnen, Bestätigen und Dispatch neu gelesen; der isolierte
  Orchestrator verhindert während Dispatch neue Session-/Commitaktionen. Die
  Adapter lesen nur bestehende Controller und schreiben nie Recovery/Commit.
- Nach Replace ist die betroffene Keymenge die Vereinigung aus altem und neuem
  Detail, nach Delete die alte Keymenge. `sessionShell.refreshLastPerformance`
  fenced alte Generationen, entfernt die Cacheeinträge und lädt offene,
  sichtbare Draftkeys genau einmal bis `success|empty|error`; geschlossene oder
  nicht vorhandene Keys bleiben invalidiert und laden beim nächsten Open.
  Liste und Detail werden ohne alten Cursor bestätigt neu gelesen; Refresh-
  Fehler zeigen keinen alten Successwert und ändern den bestätigten Write nicht.

## Referenzen

Pflicht in S1:

- `README.md`
- `docs/DEV_ENVIRONMENT.md`
- `docs/templates/README.md`
- `docs/templates/MIDAS Roadmap Workflow Contract.md`
- `docs/Future trainingsmodule update thoughts.md`
- `docs/modules/Activity Module Overview.md`
- `docs/MIDAS Activity V2 R1 Catalog Baseline Contract.md`
- `docs/MIDAS Activity V2 C2 Catalog Version 2 Contract.md`
- `docs/archive/MIDAS Activity V2 R8 Core Commit and Android Recovery Integration Roadmap (DONE).md`
- `docs/archive/MIDAS Activity V2 R8 Core Commit and Android Recovery Integration Evidence (DONE).md`
- `docs/archive/MIDAS Activity V2 R4 Search and Last-Performance Lookup Roadmap (DONE).md`
- `docs/qa/health-capture-reports.md`
- `app/modules/vitals-stack/activity/v2/`
- `sql/20_Activity_V2.sql`
- `sql/21_Activity_V2_Catalog_V2.sql`
- `sql/22_Activity_V2_Commit_Compatibility.sql`
- `sql/22_Activity_V2_Commit_Compatibility_Rollback.sql`
- `sql/16_Explicit_Grants.sql`
- aktuelle offizielle Supabase-Dokumentation und relevante Changelog-Hinweise.

Nur bei konkreter Vertragsfrage:

- R2/R3/R5/R6/R7-DONE-Roadmaps und Evidence;
- Doctor-/Report-Dokumentation erst bei unerwarteter Consumer-Kopplung;
- Android-Dokumentation nur bei unbeabsichtigter Produkt-/Device-Wirkung.

## Tool Permissions und Gates

Allowed:

- lokale Datei-, Git-, Test-, Browser- und read-only Supabase-Abfragen;
- Supabase- und Postgres-Best-Practice-Skills/Dokumentation;
- Docker/local Supabase für disposable PostgreSQL-17-Fixtures;
- isolierte Harnessserver und Browser-Smokes;
- CodeRabbit in S5 gegen den finalen Diff.

User-gated:

- S4 nach S4R;
- produktives SQL nach read-only Preflight und Briefing;
- jeder produktive Datenwrite, Deploy oder Device-Eingriff.

Forbidden:

- Secrets ausgeben oder committen.
- fremde Worktree-Änderungen zurücksetzen.
- Scope, Datenwirkung oder Architektur still erweitern.
- reale Activity-V2-Sessions erzeugen, korrigieren oder löschen.
- Service Role in Browsercode verwenden.
- Productload oder Activity V1 in R9 ändern.

## Statusmatrix

<!-- markdownlint-disable MD013 -->

| ID | Schritt | Reasoning | Status | Kompaktes Ergebnis |
| --- | --- | --- | --- | --- |
| S1 | System- und Vertragsdetektivarbeit | `Extra High` | DONE | Reale Repo-/Runtime-/SQL-/Supabase-/Toolchain-Baseline vollständig; Gate PASS mit nicht blockierenden F-ACT-R9-20 bis -28. |
| S2 | Fachlicher und technischer Zielvertrag | `Extra High` | DONE | Feldgenaue Read-/Mutation-/Canonicalization-/CAS-/Retry-/UX-/Guard-/Cacheverträge; F-ACT-R9-20 bis -28 korrigiert; Gate PASS. |
| S3 | Bruchrisiko-, Security- und Umsetzungsreview | `Extra High` | DONE | Race-/Unknown-/Security-/Leak-/Rollback-/Provisioning-/Scope-Matrix vollständig; F-ACT-R9-29/-30 korrigiert; Gate PASS. |
| S4R | S4 Readiness Review | `Extra High` | DONE | S4.1-S4.10 vollständig zugeordnet; Test-/Evidence-/Rollback-/Security-/Owner-Gates vollständig; Readiness `GO`; STOP vor S4. |
| S4 | Umsetzung | `High / Extra High je Substep` | DONE | S4.1-S4.10 vollständig; T-ACT-R9-01 bis -18 PASS; isolierter Consumer, reale Data-Access-/R4-Cacheintegration, Desktop-/Mobile-Browsermatrix und Productload-/V1-/R7-/R8-Isolation grün. |
| S5 | Tests, Runtime-Gates und Abschlussreview | `Extra High` | DONE | T-ACT-R9-19 bis -22 PASS; Post-S5-CodeRabbit-Korrekturwelle F-ACT-R9-46 bis -57 fixed, 208/208 lokal und invalidierte PG-17-Fixture grün; produktiver SQL-23-Postcheck unverändert 0/0/0; finaler Null-Lauf ausstehend; STOP vor S6. |
| S6 | Doku-Sync, Recap und Archiv | `High` | TODO | |

<!-- markdownlint-enable MD013 -->

## Initialer Contract Review und Findings

Der Denkraum-Review wurde gegen Masterplan, R8-Vertrag, reales SQL-Schema,
Data-Access-API, aktuelle Supabase-Sicherheitsgrenzen und Langzeitnutzung
durchgeführt. Alle Findings sind im Zielvertrag korrigiert; S1-S4R müssen die
Korrekturen am realen System bestätigen.

<!-- markdownlint-disable MD013 -->

| ID | Severity | Typ | Status | Entscheidung / Zielschritt |
| --- | --- | --- | --- | --- |
| F-ACT-R9-01 | P1 | Contract/SQL | fixed | Originaler `request_fingerprint` bleibt unverändert; eigene Revision und aktueller Content-Fingerprint in D-ACT-R9-08/09. |
| F-ACT-R9-02 | P1 | Data/Performance | fixed | Offset-/unbounded History durch bounded Keyset-Pagination ersetzt. |
| F-ACT-R9-03 | P1 | Contract/Data | fixed | `started_at`/`day` bleiben unveränderlich; korrigierte Dauer leitet `ended_at` ab. |
| F-ACT-R9-04 | P1 | Contract | fixed | Historie nutzt persistierte Snapshots und ursprüngliche Katalogversion. |
| F-ACT-R9-05 | P1 | State/Data loss | fixed | Correction State strikt von R7/R8 getrennt und memory-only. |
| F-ACT-R9-06 | P1 | Race | fixed | CAS, Row Lock, idempotenter Replay und Unknown-Outcome-Re-read verpflichtend. |
| F-ACT-R9-07 | P1 | Delete/Security | fixed | Owner-geprüfter Hard Delete mit CAS, Cascade und nicht-leakendem Repeat-Vertrag. |
| F-ACT-R9-08 | P1 | Consumer | fixed | Historie/Detail/Last Performance werden nach Mutation invalidiert und bestätigt neu geladen. |
| F-ACT-R9-09 | P1 | Security | fixed | Helper nicht öffentlich ausführbar; RPC-ACL/Auth/RLS/Owner/Search-Path/Overload-Pflichten in S2/S3/S5. |
| F-ACT-R9-10 | P2 | Architecture | fixed | R9-UI-Readmodell ausdrücklich vom R10-Coaching-Export getrennt. |
| F-ACT-R9-11 | P2 | Evidence | fixed | R8-T16/T19 werden nicht als R9-PASS übernommen. |
| F-ACT-R9-12 | P2 | Scope | fixed | Bulk, Retention, Correction-Recovery und Product Cutover explizit ausgeschlossen. |
| F-ACT-R9-13 | P2 | Contract | fixed | `title` ist mangels freigegebenem Editorvertrag in R9 unveränderlich; Sessionnotiz bleibt korrigierbar. |
| F-ACT-R9-14 | P2 | Data/Evidence | fixed | Produktive Wirkung benennt die Initialisierung vorhandener Sessions mit `revision = 1`; nur fachliche Sessioninhalte bleiben unangetastet. |
| F-ACT-R9-15 | P2 | Doku/QA | fixed | S4R verwendet vollständig namespacete Finding- und Test-IDs statt mehrdeutiger Kurzformen. |
| F-ACT-R9-16 | P1 | Rollback/Data | fixed | SQL-23-Rollback ist nur vor realer Lifecycle-Nutzung zulässig und ausdrücklich kein Restore gelöschter Sessions. |
| F-ACT-R9-17 | P1 | Provisioning/SQL | fixed | Fresh/disposable Reihenfolge ist `20 -> 21 -> 22 -> 23 -> 16`; produktiv nur SQL 23, kein Alt-Migrations-Rerun über R9. |
| F-ACT-R9-18 | P1 | Schema/Concurrency | fixed | Content-Fingerprint ist serverseitig abgeleitet statt redundant persistiert; R8-Commit bleibt unangetastet. |
| F-ACT-R9-19 | P1 | Identity/API | fixed | Technische Child-UUIDs werden nicht als stabile Fachidentität exponiert; Vollersatz darf sie neu erzeugen. |
| F-ACT-R9-20 | P1 | API/Data | fixed | PostgreSQL-`bigint` hat keinen allgemein verlustfreien JS-Number-Vertrag; D-ACT-R9-27 und S2 definieren kanonische positive Dezimalstrings. Pflicht: S4.1/S4.6, T-ACT-R9-01/-11. |
| F-ACT-R9-21 | P1 | Consumer/Cache | fixed | Der reale mount-lokale R4-Cache erhält gemäß D-ACT-R9-32 ausschließlich `refreshLastPerformance(itemKeys)` mit Fencing/Terminalresultat. Pflicht: S4.9, T-ACT-R9-16. |
| F-ACT-R9-22 | P1 | Security/Architecture | fixed | D-ACT-R9-29 friert eine pure invoker-Grenze in nicht exponiertem `midas_private` mit Minimal-ACL ein. Pflicht: S4.6/S4.8, T-ACT-R9-11/-15. |
| F-ACT-R9-23 | P1 | Provisioning/Security | fixed | D-ACT-R9-33 macht SQL 23 selbsthärtend und SQL 16 zum Fresh-Target-Spiegel; Default-ACLs zählen nie als Evidence. Pflicht: S4.8/S5, T-ACT-R9-10/-15/-20. |
| F-ACT-R9-24 | P1 | Retry/State | fixed | D-ACT-R9-30 und S2 trennen R9-`mutationState`/Reconciliation vom unveränderten R8-`commitState`. Pflicht: S4.1/S4.4, T-ACT-R9-01/-08. |
| F-ACT-R9-25 | P1 | State/API | fixed | D-ACT-R9-31 definiert den rein lesenden fail-closed Adapter und die dreifache Admission-Prüfung. Pflicht: S4.5, T-ACT-R9-09. |
| F-ACT-R9-26 | P1 | Data/Identity | fixed | D-ACT-R9-28 und S2 leiten unter Lock genau eine Item-Katalogversion ab und stoppen bei Drift; keine neue Katalogspalte. Pflicht: S4.6/S4.7, T-ACT-R9-11/-12. |
| F-ACT-R9-27 | P2 | Identity/Compatibility | fixed | D-ACT-R9-34 lässt Legacy-Transport unverändert, verbietet aber jede R9-Übernahme oder Identitätsbedeutung. Pflicht: S4.1/S4.9, T-ACT-R9-01/-16/-17. |
| F-ACT-R9-28 | P1 | Contract/Canonicalization | fixed | S2 friert Root-/Item-/Setkeys, Snapshot-/Null-/Orderregeln und exakt eine serverseitige Hashbildung ein. Pflicht: S4.2/S4.6, T-ACT-R9-04/-11. |
| F-ACT-R9-29 | P1 | Security/Evidence | fixed | D-ACT-R9-35 ergänzt zur internen Schema-/ACL-Prüfung einen Data-API-Negativnachweis. Pflicht: S4.8/S5, T-ACT-R9-15/-20. |
| F-ACT-R9-30 | P1 | Rollback/Evidence | fixed | D-ACT-R9-36 verbietet einen rein revisionsbasierten Rollbacknachweis und verlangt operative Nichtnutzung plus separates Owner-Gate. Pflicht: S4.8/S5, T-ACT-R9-10. |
| F-ACT-R9-31 | P2 | API/Validation | fixed | Der erste S4.1-Reviewstand hätte bei expliziten Nullable-Replacementfeldern `undefined` wie `null` normalisiert. Eigene R9-Validatoren verlangen nun tatsächlich vorhandene `null`-/Wert-Keys; Negativoracle in T-ACT-R9-01. |
| F-ACT-R9-32 | P2 | Model/Validation | fixed | Der erste S4.2-Reviewstand prüfte `day` nur formal per Regex. Das Correction-Modell validiert nun zusätzlich den realen Kalendertag; Negativoracle in T-ACT-R9-03. |
| F-ACT-R9-33 | P1 | Provisioning/Compatibility | fixed | Die erste direkte SQL-16-Spiegelung hätte den bewiesenen R8-only-Aufbau vor SQL 23 an fehlenden R9-Signaturen gestoppt. SQL 16 akzeptiert nun fail-closed entweder alle R9-Objekte oder deren vollständige Abwesenheit und stoppt bei Teilzuständen; Fresh-Ziel bleibt `20 -> 21 -> 22 -> 23 -> 16`. |
| F-ACT-R9-34 | P2 | Test/Race Harness | fixed | Wiederverwendete asynchrone `dblink`-Verbindungen hielten nach dem ersten Result noch ein ausstehendes Drain-Ergebnis. Der Fixture leert jeden Resultkanal vollständig; alle fünf deterministischen Lockreihenfolgen laufen danach grün. |
| F-ACT-R9-35 | P1 | SQL/Preimage | fixed | Der erste SQL-23-Guard belegte den R8-Katalog nur über Zähler und die Lookup-RPC nur über Hardening. Forward und Rollback prüfen nun zusätzlich die exakten v1/v2-Inhaltshashes und den unveränderten Lookup-Quellhash. |
| F-ACT-R9-36 | P1 | Security/Evidence | fixed | Der erste private Postcheck hätte Grants an unerwartete Rollen nicht vollständig ausgeschlossen, und die Cascade-Probe enthielt noch keine Set-Zeile. Exakte Schema-/Helper-ACL-Oracles, ein Rogue-Grant-Negativtest und echte Session->Item->Set-Cascade schließen beide Nachweislücken. |
| F-ACT-R9-37 | P1 | Test/Isolation | fixed | Der geerbte R8-Isolationsoracle verbot pauschal jedes Delta an SQL 16 und stoppte deshalb am planmäßigen R9-Grant-Spiegel. SQL 16 bleibt geschützt, wird nun aber auf den exakt reviewten R9-Quellhash gepinnt; alle übrigen R8-Schutzpfade bleiben diff-frei. Vollsuite danach 186/186. |
| F-ACT-R9-38 | P2 | UI/State | fixed | Der erste S4.4-Shellstand rerenderte während jedes `input`-Events und konnte ein aktives Editorfeld ersetzen. Eingaben aktualisieren nun das memory-only Modell ohne DOM-Ersatz; Change/Fehler rendert atomar, Dirty Close bewahrt den Wert und deterministische Focus-Keys stellen den Zielkontext wieder her. Pflicht: S4.4, T-ACT-R9-07. |
| F-ACT-R9-39 | P1 | Guard/Security | fixed | Der erste S4.5-Guard prüfte exakte Rootkeys, aber nicht jeden R7-/R8-Statewert. Er verlangt nun eingefrorene vollständige Recovery-/Commit-Snapshots, erlaubte Phasen, kanonische Zeitwerte, payloadarme Reason-/Focusformen und blockiert jeden unbekannten oder mutablen Zustand als `guard_unavailable`. Pflicht: S4.5, T-ACT-R9-09. |
| F-ACT-R9-40 | P1 | UX/Retry | fixed | Der erste Block-D-Reviewstand deaktivierte den Correction-Retrybutton über den gesetzten `retry_mode` dauerhaft. Nur der tatsächlich laufende Refresh sperrt ihn jetzt; der Retry lädt ausschließlich bestätigte Reads/Cache neu und dispatcht keine Mutation. Pflicht: S4.9, T-ACT-R9-16. |
| F-ACT-R9-41 | P1 | Harness/Contract | fixed | Der Block-C-Fakeadapter behauptete `has_more` bei einer partiellen Zwei-Item-Seite und wich damit vom realen Data-Access-Vertrag ab. Der begrenzte Harness liefert die Seite jetzt als terminal; die reale Data-Access-Grenze bleibt strikt. Pflicht: S4.9, T-ACT-R9-16. |
| F-ACT-R9-42 | P1 | Race/State | fixed | Competing History-/Detail-/Dialogaktionen waren während einer laufenden Mutation nicht vollständig gefencet und konnten Pending-Kontext verdrängen. Controller und Shell blockieren diese Aktionen jetzt fail-closed bis zum terminalen Mutation-/Refreshzustand. Pflicht: S4.9, T-ACT-R9-16. |
| F-ACT-R9-43 | P1 | Contract/Validation | fixed | Der erste terminale Cache-Resultvalidator prüfte Länge und Einträge, aber keine Sparse-Array-Holes. Exakte dichte Arrayvalidierung und ein Sparse-Negativoracle verhindern einen falschen Refresh-Erfolg. Pflicht: S4.9, T-ACT-R9-16. |
| F-ACT-R9-44 | P2 | Harness/Visual/Interaction | fixed | Der Block-E-Harness ließ die Cacheaktion auf weißem Untergrund stehen; der erste Fix als fixes Overlay verdeckte auf 320x800 die Delete-Aktion. Die Harness-only-Aktion liegt jetzt kontrastreich im normalen Dokumentfluss. Exakte Desktop-/Mobile-Screens und Interaktionen bleiben frei von Überdeckung und Overflow. Pflicht: S4.10, T-ACT-R9-18. |
| F-ACT-R9-45 | P2 | Evidence/Canonicalization | fixed | Die erste manuelle T-ACT-R9-20-Strukturhashabfrage übernahm nicht den in SQL 23 gesetzten leeren `search_path` und erzeugte dadurch den deparse-abhängigen Fehlhash `4b7f53a5...6e31`. Ein isolierter PostgreSQL-17-Vergleich reproduzierte die Ursache; die Wiederholung im exakten Guard-Kontext ergab den kanonischen R8-Hash `657f31c1...3ee14`. Kein Produktdrift und kein SQL-Source-Delta. Pflicht: S5, T-ACT-R9-20. |
| F-ACT-R9-46 | P1 | UI/State | fixed | `suppressNextRender` konnte bei einer synchron werfenden Correction-Settergrenze gesetzt bleiben und den nächsten legitimen Render verschlucken. `try/catch/finally` stellt die Flag-Rücksetzung und einen sicheren Fehler-Render sicher. Pflicht: S4.4/S5, T-ACT-R9-07. |
| F-ACT-R9-47 | P2 | A11y/UI | fixed | Zwei eingebettete Bestätigungsbereiche behaupteten mit `aria-modal=true` eine nicht implementierte Fokusfalle. Sie bleiben benannte `role=dialog`-Bereiche ohne falsche Modalitätszusage. Pflicht: S4.4/S4.5/S5, T-ACT-R9-07/-09/-18. |
| F-ACT-R9-48 | P1 | Controller/Error Boundary | fixed | Malforme Detail-Itemkeys konnten beim Öffnen von Delete einen rohen `TypeError` auslösen. Die Preimage-Ableitung erfolgt nun vor jeder Delete-State-Mutation und mappt fail-closed auf den stabilen `INVALID_STATE`-Domainfehler. Pflicht: S4.5/S5, T-ACT-R9-09. |
| F-ACT-R9-49 | P2 | Test/SQL Fixture | fixed | Der Overload-Drifttest prüfte den Revisionsvertrag über `limit 1` auf einer leeren Tabelle und belegte die Definition dadurch nicht. Er validiert nun Katalogtyp, NOT NULL, Default und exakten Check-Constraint. Pflicht: S4.6-S4.8/S5, T-ACT-R9-10/-11. |
| F-ACT-R9-50 | P2 | Evidence/Isolation | fixed | Der finale Isolationstest verlangte die explizite Negativform `R8-T16/T19 nicht als R9-PASS`; die Evidence enthielt nur eine semantisch gleiche Umschreibung. Der kanonische Wortlaut ist nun direkt enthalten. Pflicht: S4.10/S5, T-ACT-R9-17. |
| F-ACT-R9-51 | P1 | Shell/Lifecycle | fixed | Schlug das initiale Rendern nach erfolgreichem Subscribe fehl, entfernte Mount zwar DOM und Listener, aber nicht den bereits erworbenen Controller-Callback. Die Fehlerbereinigung unsubscribed jetzt best effort und nullt den Handle; eigener ausführbarer Regressionstest. Pflicht: S4.3/S5, T-ACT-R9-05. |
| F-ACT-R9-52 | P2 | Runbook/Rollback | fixed | Der gültige SQL-23-Rollbackvertrag stand ohne eigene Überschrift innerhalb des produktiven Execution Records. Eine getrennte R9-Rollback-Boundary macht Preflight, operative Nichtnutzungsbestätigung und Owner-Gates eindeutig, ohne die Regeln zu ändern. Pflicht: S4.8/S5, T-ACT-R9-10. |
| F-ACT-R9-53 | P2 | UX/State | fixed | Alle deaktivierten Historycontrols zeigten pauschal `wait`, auch bei bloßer fachlicher Nichtverfügbarkeit. `not-allowed` ist der Default; nur der explizite Shellzustand `data-busy=true` erhält `wait`. Pflicht: S4.3-S4.5/S5, T-ACT-R9-07/-09/-18. |
| F-ACT-R9-54 | P2 | UI/Robustness | fixed | Die best-effort Fokuswiederherstellung konstruierte den Attributselektor vor dem bestehenden Catch. Selektoraufbau, Lookup und Fokus liegen nun gemeinsam in der Fehlergrenze, sodass ein ungültiger Focus-Key keinen Render abbricht. Pflicht: S4.3-S4.5/S5, T-ACT-R9-07/-18. |
| F-ACT-R9-55 | P2 | Roadmap/Review Evidence | fixed | Die historische Block-E-Handoffkarte sagte weiterhin unqualifiziert, CodeRabbit sei nicht verfügbar, obwohl die aktuelle Post-S5-Welle erfolgreiche CLI-Läufe dokumentiert. Der Satz ist nun ausdrücklich als damaliger Gate-Stand markiert und verweist auf Resume Card/Evidence. Pflicht: S5, T-ACT-R9-19. |
| F-ACT-R9-56 | P2 | Evidence/Gate State | fixed | Die historische Block-E-Gatezeile nannte EV-ACT-R9-RV01 vollständig geschlossen, während der aktuelle Null-Lauf pending war. Produkt-/Runtime-Evidence bleibt geschlossen; RV01 ist ausdrücklich bis zum finalen Null-Lauf wieder geöffnet. Pflicht: S5, T-ACT-R9-19. |
| F-ACT-R9-57 | P2 | Runbook/Contract Naming | fixed | Das HOW-TO wechselte zwischen generischem `lookup` und `last-performance`, obwohl exakt `public.activity_v2_last_performance(text)` samt Sourcehash geschützt wird. R2-, R8- und R9-Abschnitte nennen nun konsistent die exakte Signatur; der R9-Abschnitt nennt zusätzlich beide unveränderten R8-Sourcehashes. Pflicht: S5, T-ACT-R9-19. |

<!-- markdownlint-enable MD013 -->

---

## S1 - System- und Vertragsdetektivarbeit

Reasoning: `GPT-5.6 Sol / Extra High`.

Deterministisch:

1. Pflichtreferenzen in der Startkarten-Reihenfolge lesen.
2. Git-Status, HEAD, R8-Abschlussstatus und akzeptierte Evidence-Gaps erfassen.
3. Reale Session-/Item-/Set-Struktur, Constraints, FKs, Cascades, Indizes,
   RLS, ACLs und alle Activity-V2-Funktionen kartieren.
4. Commitkanonisierung, Request-Fingerprint, Last-Performance-Sortierung und
   aktuelle Data-Access-Fehlerverträge vollständig nachvollziehen.
5. R3-R8-Clientmodule, öffentliche `AppModules`-API, Script-/Harness-Grenze,
   aktive Draft-/Commitzustände und vorhandene Cache-Seams kartieren.
6. Produktload beweisen: Activity V2 bleibt isoliert, Activity V1 produktiv.
7. Aktuelle offizielle Supabase-Verträge für Function Security, RLS,
   explizite Grants und PostgREST-RPC-Signaturen prüfen; relevante
   Changelog-Änderungen dokumentieren.
8. Lokale Toolchain und verfügbare disposable PostgreSQL-/Browser-/CodeRabbit-
   Lane prüfen, ohne Langläufer oder Produktwrite.
9. Produktiv ausschließlich read-only bestätigen: SQL-22-Stand,
   Activity-V2-Objekt-/Funktionszähler und vorhandene Session-/Item-/Set-Zähler.
10. Fakten, Hypothesen und initiale Finding-Korrekturen trennen.
11. Full Contract Review, Findings-Korrektur, Evidence-Baseline,
    Statusmatrix und Resume Card aktualisieren.

Ergebnis:

- Systemkarte:
  - exakte Producer-/Consumer-/SQL-/Cache-/State-Grenzen.
- Betroffene Schichten:
  - isolierte Activity-V2-Runtime, SQL 23, Data Access, Harness/Tests und Doku.
- Belegte Verträge:
  - R8-Identität, Snapshotstruktur, Paginationindex, Cascade, ACL/RLS und
    Last-Performance-Verhalten.
- Offene Fragen:
  - technische Helper-/Moduldetails dürfen S2 erreichen; keine offene
    Produktentscheidung.
- Doku-Sync:
  - S6; sofort nur bei blockierender Source-of-Truth-Abweichung.

Exit: Der reale Iststand bestätigt oder korrigiert jeden angenommenen
History-/Correction-/Delete-Vertrag ohne produktive Änderung.

### S1-Gate-Ergebnis

- Ergebnis: `PASS mit ausschließlich nicht blockierenden Findings`.
- Realer Repository-Stand:
  - HEAD `0d9192f533091954e4b55e786046f004d25d1ea5`; vor der
    R9-Dokumentation keine fremden Änderungen, Roadmap und Evidence untracked;
  - 179/179 Activity-V2-Contracttests grün;
  - Productload, Root-Service-Worker und Activity V1 bleiben V2-frei;
  - R4-Last-Performance-Cache ist `lookupStates` pro Shell-Mount; öffentliche
    Shell-API exakt `open`, `render`, `requestClose`, `isOpen`, `destroy`;
  - R7/R8 liefern getrennte Recovery-/Commitcontroller und unveränderte
    Commit-Intent-/Tombstone-Verträge.
- Realer produktiver Read-only-Stand:
  - PostgreSQL 17.6; R8-Commit-Sourcehash exakt
    `7cdabca31dd7b4f3a8a78f5dc4d79c2116c7f77a2a0f5b834439093c0215177e`;
  - exakt zwei Activity-V2-Funktionen, keine R9-Funktion und keine
    `revision`-Spalte;
  - Katalog v1/v2 exakt 78/80 aktive Zeilen; Session/Item/Set exakt 0/0/0;
  - vier RLS-Tabellen und vier SELECT-Policies; `authenticated`/`service_role`
    nur SELECT, kein Direct DML; `anon` ohne Tabellen- oder RPC-Zugriff;
  - R8-Commit `SECURITY DEFINER`, Owner `postgres`, leerer `search_path`, nur
    `authenticated` Execute; Last Performance invoker/stable mit gleicher
    Execute-Grenze.
- Toolchain:
  - Git 2.55.0, Node 24.18.0, npm 11.18.0, Deno 2.9.5, Supabase CLI 2.109.1;
  - Docker 29.7.2 mit laufendem Linux-Daemon und lokalem `postgres:17-alpine`;
  - Browser- und CodeRabbit-Lanes verfügbar; kein Host-`psql`, disposable SQL
    daher über den bewiesenen Docker-/Supabase-Weg.
- Contract Review:
  - Masterroadmap, R8-Erstellungsidentität, R4-Cache, R7-Recovery, reales SQL,
    Runtime, Supabase ACL/RLS und aktuelle offizielle Function-/Grant-Verträge
    stimmen im Kern überein;
  - F-ACT-R9-20 bis -28 sind technische Präzisierungen mit festem Zielschritt,
    keine Owner- oder Scope-Blocker.
- Continuation:
  - S2 darf automatisch beginnen.

## S2 - Fachlicher und technischer Zielvertrag

Reasoning: `GPT-5.6 Sol / Extra High`.

Deterministisch:

1. Versionierte History-, Detail- und Mutation-Response-Schemas exakt
   festlegen, einschließlich Null-/Empty-/Not-found-/Conflict-Vertrag.
2. Cursorformat, Default-/Max-Limit, Tie-Break, `has_more` und
   Cursorvalidierung einfrieren.
3. Readmodelle begrenzen: Listensummary versus vollständiges Snapshotdetail.
4. Immutable-/Mutable-Matrix für Session, Items und Sets vollständig
   festschreiben.
5. Kanonische Content-Fingerprint-Eingabe und Sortierung exakt definieren;
   technische UUIDs, Revision und Zeitstempel ausschließen; Fingerprint nur
   serverseitig ableiten und dieselbe Definition in Detail, Correction, Delete
   und Tests verwenden.
6. Revisionseinführung, CAS-Reihenfolge, Row-Lock, idempotenten Replay,
   Konflikt und Unknown-Outcome-Reconciliation einfrieren.
7. Full-Replacement-Validierung gegen ursprüngliche Katalogversion und
   ursprüngliche Feldpolicy festlegen.
8. Delete-Außenvertrag, Bestätigungscopy und nicht-leakende Absent-/Foreign-
   Semantik festlegen.
9. Exakte RPC-Namen/Signaturen und SQL-Helper-Grenze gegen reale PostgREST-
   und Supabase-Konventionen einfrieren.
10. Data-Access-Methoden, Domainfehler, Retryability und Responsevalidierung
    festlegen.
11. UI-State-Machine für History, Detail, Correction, Dirty Close, Delete,
    Conflict und Unknown Outcome festlegen.
12. Last-Performance-Invalidation und bestätigten Re-fetch-Vertrag
    festschreiben.
13. Produkt-/Active-Draft-/Commit-Guards und Nicht-Scope finalisieren.
14. Full Contract Review, Findings-Korrektur, Evidence-Sync, Statusmatrix und
    Resume Card aktualisieren.

Ergebnis:

- Finaler Zielvertrag:
  - bounded Readmodelle plus atomare CAS-Mutationen unter unveränderlicher
    Erstellungsidentität.
- Gewählte Lösung:
  - Full Replacement mit Revision/Content-Fingerprint; einzelner Hard Delete.
- Abgrenzung:
  - kein Export, Cutover, Bulk, Retention oder persistentes Correction-Draft.
- S4-Pflichtpunkte:
  - F-ACT-R9-01 bis F-ACT-R9-19 und alle neu belegten Findings.
- Doku-Sync:
  - S6; Source-of-Truth-Widersprüche sofort.

Exit: Kein API-, Daten-, Race-, Fehler-, Security- oder UX-Grundvertrag bleibt
offen.

### S2-Gate-Ergebnis

- Ergebnis: `PASS`.
- API-/Datenreview:
  - History-, Detail-, Replacement-, Mutation- und Canonical-Content-Schemas
    sind exakt versioniert, bounded und voneinander getrennt;
  - `bigint`-Revision wird verlustfrei als String transportiert;
  - Child-UUIDs, Requestidentität und R10-Exportsemantik bleiben außerhalb der
    R9-Read-/Mutationmodelle.
- Identity-/Canonicalization-Review:
  - unveränderliche Erstellungsidentität bleibt vollständig erhalten;
  - ursprüngliche Katalogversion wird aus mindestens einem und exakt einer
    gemeinsamen Itemversion abgeleitet;
  - bestehende Snapshots werden konserviert, neue Items nur aus dieser Version
    gesnapshottet;
  - eine interne pure Funktion formt denselben serverseitigen Inhalt für
    Detail, Replace, Delete und Tests; keine persistente Fingerprintspalte.
- Concurrency-/Fehlerreview:
  - Lock-, Replay-vor-CAS-, Dual-CAS-, Revision-Increment-, Delete- und
    Reconciliation-Reihenfolgen sind widerspruchsfrei;
  - R9-`mutationState` und identischer Transportretry verändern weder
    R8-`commitState` noch Commit-Intent/Request-ID.
- UX-/State-/Cache-Review:
  - alle Loading/Empty/Error/Dirty/Conflict/Unknown/Delete-Zustände besitzen
    einen definierten Übergang;
  - Guardadapter schreibt nie R7/R8-State; Cache-Refresh fenced Late Settlements
    und entfernt jeden alten Successwert.
- Findings:
  - F-ACT-R9-20 bis -28 sind vertraglich korrigiert und konkreten S4-Schritten
    sowie T-/EV-Nachweisen zugeordnet; keine offene P0/P1-Grundsatzfrage.
- Continuation:
  - S3 darf automatisch beginnen.

## S3 - Bruchrisiko-, Security- und Umsetzungsreview

Reasoning: `GPT-5.6 Sol / Extra High`.

Deterministisch:

1. Race-Matrix prüfen: Edit/Edit, Edit/Delete, Delete/Delete, identischer
   Replay, veralteter Replay und verlorene Antwort.
2. Transaktions-/Rollbackgrenzen prüfen: kein partieller Item-/Set-Ersatz und
   kein Revisionssprung bei Fehler.
3. Prüfen, dass kein Readmodell oder Consumer technische Item-/Set-UUIDs als
   stabile Identität übernimmt und SQL 23 keine persistente
   `content_fingerprint`-Driftquelle einführt.
4. Pagination prüfen: gleiche Timestamps, Cursorgrenzen, neue Inserts zwischen
   Seiten, Refresh nach Mutation und kein Duplikat/Skip.
5. Auth/RLS/ACL/Function-Owner/`search_path`/Overload-/PUBLIC-/anon-/
   authenticated-Vertrag prüfen; Security-Definer nur wo nötig.
6. Direct-DML-, fremde-User-, Enumeration- und rohe-Fehlerdetail-Risiken
   prüfen.
7. Catalog-/Snapshot-Drift, Cross-Version-Mutation und Live-Label-
   Reinterpretation red-teamen.
8. Active-Draft-, Recovery-, Commit-, Cache- und Fokus-/Close-Kollisionen
   prüfen.
9. Delete-Cascade und Last-Performance-Fälle prüfen: letzte Session geändert,
   Item entfernt, letzte Session gelöscht, einzige Vorkommnis gelöscht.
10. SQL-23-Forward-/Rerun-/Preimage-/Rollback-/Overload-/Grant- und
   Postcondition-Vertrag sowie produktive und frische Provisioning-Reihenfolge
   festlegen.
11. Produktivgate so definieren, dass ausschließlich DDL/RPC-Hardening und
    read-only Postchecks erfolgen; keine echte Sessionmutation.
12. Rollback- und Stop-Vertrag festlegen.
13. S4 in kleine, reviewbare Deltas schneiden und sichere Ausführungsblöcke
    ableiten.
14. S5-Testmatrix und Evidence-IDs vollständig zuordnen.
15. Full Contract Review, Findings-Korrektur, Statusmatrix, Evidence und
    Resume Card aktualisieren.

Ergebnis:

- Blockierende Risiken:
  - `none` oder IDs mit klarer S4-Zuordnung.
- Rollback-/Stop-Vertrag:
  - SQL 23 besitzt eigenständigen Deployment-Rollback; jede Preimage-
    Abweichung, unklare Datenwirkung oder mögliche frühere R9-Mutationsnutzung
    stoppt dessen Ausführung.
- S4-Schnitt:
  - S4.1 bis S4.10 gemäß Readiness-Tabelle.
- S5-Pflichtchecks:
  - T-ACT-R9-01 bis T-ACT-R9-22 und EV-ACT-R9-*.
- Doku-Sync:
  - S6 oder sofort bei blockierender Source-of-Truth-Korrektur.

Exit: Alle Bruch-, Security-, Race- und Rollbackrisiken sind geschlossen,
einem Substep zugeordnet oder explizit außerhalb des Scopes.

### S3-Gate-Ergebnis

- Ergebnis: `PASS`.

Race- und Unknown-Outcome-Matrix:

| Fall | Lock-/CAS-Ergebnis | Clientabschluss | Pflichtnachweis |
| --- | --- | --- | --- |
| Edit/Edit, verschiedener Inhalt | erster Lockgewinner `updated`; zweiter nach Lock `SESSION_CONFLICT` | zweiter lädt neues Detail, Working Copy bleibt erhalten | S4.7; T-ACT-R9-12/-13 |
| Edit/Edit, identischer Zielinhalt | erster `updated`, zweiter `replayed` vor stale CAS | gleicher bestätigter Content, kein zweiter Revisionssprung | S4.7; T-ACT-R9-12/-13 |
| Edit/Delete, Edit gewinnt | Edit erhöht Revision; Delete mit altem CAS `SESSION_CONFLICT` | Delete muss neu bestätigen | S4.7/S4.8; T-ACT-R9-13 |
| Edit/Delete, Delete gewinnt | Delete kaskadiert; Edit sieht `SESSION_NOT_FOUND` | keine Resurrection oder Partial Children | S4.7/S4.8; T-ACT-R9-13/-14 |
| Delete/Delete | erster `deleted`; zweiter wartet und sieht `already_absent` | Ziel „absent“ bestätigt, keine Enumeration | S4.8; T-ACT-R9-14 |
| verlorene Replace-Antwort | höchstens identischer zweiter Dispatch wird `replayed`; sonst Re-read | desired=current bestätigt Ziel, preimage=current erlaubt nur identischen Retry, anderer Inhalt Conflict | S4.1/S4.4/S4.7; T-ACT-R9-08/-12 |
| verlorene Delete-Antwort | höchstens identischer zweiter Dispatch wird `already_absent`; sonst Re-read | `null` bestätigt nur „jetzt absent“, vorhandenes verändertes Detail ist Conflict | S4.1/S4.4/S4.8; T-ACT-R9-08/-14 |

Security-/Informationsleck-Matrix:

| Grenze | Pflichtvertrag | Red-Team-Ergebnis | Pflichtnachweis |
| --- | --- | --- | --- |
| List/Detail | invoker, stable, permanente Authprüfung, RLS/Owner, leerer `search_path` | anonymous/anon/foreign kann keine Zeile oder Existenz sehen | S4.6; T-ACT-R9-15 |
| Replace/Delete | definer nur wegen entzogenem Direct DML; Owner `postgres`, permanent auth, explizites `user_id`, vollqualifiziert, volatile | RLS-Bypass ist eng auf eine eigene Session begrenzt; Advisorwarnung ist nur mit dokumentierter Endpoint-Absicht akzeptabel | S4.7/S4.8; T-ACT-R9-15 |
| `midas_private` | nicht exponiert, invoker/immutable, minimale Schema-/Execute-ACL | kein öffentliches Helper-RPC; Data-API-Negativtest zusätzlich zur Katalogprüfung | S4.6/S4.8; T-ACT-R9-11/-15/-20 |
| Tabellen | bestehende SELECT-Policies, kein INSERT/UPDATE/DELETE für Browserrollen | R9 öffnet keinen Direct-DML-Nebenpfad; service role bleibt browserfern | S4.8; T-ACT-R9-15 |
| Absent/Foreign/Error | Detail `null`, Replace ein gemeinsames Not-found, Delete `already_absent`, nur sichere Tokens | keine IDOR-/BOLA- oder Constraint-/Payload-Leaks | S4.1/S4.6-S4.8; T-ACT-R9-01/-15 |
| Overloads/Default ACL | exakt eine Signatur, PUBLIC/anon/service revoke, authenticated nur reviewed Public-RPCs | PostgREST-Overload- und 2026-Default-Grant-Risiko geschlossen | S4.8; T-ACT-R9-10/-15/-20 |

Bruch-/Daten-/Consumerreview:

- Pagination bleibt bei Timestamp-Ties, Inserts zwischen Seiten und Deletes
  stabil; Korrektur ändert weder Sortierschlüssel noch Cursoridentität. Ein
  Refresh setzt den Cursor zurück, daher wird kein neueres Insert still
  angehängt.
- Full Replacement konserviert vorhandene Snapshotsemantik vor dem Child-
  Delete, validiert neue Items ausschließlich gegen die gelockte ursprüngliche
  Version und schreibt nie einen gemischten oder leeren Itemblock.
- Jede Exception liegt in derselben SQL-Transaktion; weder Children,
  Sessionfelder, Revision noch `updated_at` dürfen partiell sichtbar werden.
- Last-Performance verwendet die Vereinigung alter/neuer Keys, fenced alte
  Promises vor Cachelöschung und zeigt bei Refreshfehler niemals den alten
  Successwert als aktuell.
- Lokale Admission schützt nur denselben isolierten UI-Orchestrator; Cross-Tab-
  Kollisionen werden bewusst vom Server-CAS geschlossen. R7-Recovery und
  R8-Commit-Intent bleiben unverändert und werden nicht als Correction-
  Persistence zweckentfremdet.
- Bestehende R8-/R4-Child-UUID-Transportfelder bleiben kompatibel; alle neuen
  R9-Validatoren/Modelle und DOM-Keys ignorieren sie als Identität.

Forward-/Rerun-/Drift-/Rollback-/Provisioning-Review:

| Lane | Zulässiges Preimage | Wirkung/Gate | Stop |
| --- | --- | --- | --- |
| SQL 23 fresh-on-R8 | exakt R8-Commit-/Lookup-Source, vier Tabellen/RLS/Policies/ACLs, Katalog 78/80; R9-Objekte/Revision absent | eine Transaktion: Revision/default/check, internes Schema/Helper, vier RPCs, explizite ACLs | jede Source-/Struktur-/Katalog-/Overloadabweichung vor erstem Write |
| SQL 23 exact rerun | exakter vollständiger R9-Postimage | Null-Datendelta und identische Objektdefinitionen/ACLs | partielles oder semantisch anderes R9-Postimage |
| Drift fixtures | jeweils genau eine Source-/Spalten-/Constraint-/RLS-/ACL-/Owner-/Search-Path-/Overload-/Katalogabweichung | muss vor Mutation fehlschlagen und Drift bewahren | irgendein stilles Repair oder Drop fremder Objekte |
| Rollback | exaktes R9-Postimage, technischer Preflight, alle Revisionen 1, positive operative Nichtnutzungsbestätigung, separates Owner-Gate | entfernt nur vier RPCs, R9-Helper/Schema und Revision; R8-Stand/Rows bleiben | bekannte oder nicht sicher ausschließbare Replace/Delete-Nutzung; `revision=1` allein nie ausreichend |
| vollständiger Fresh-Aufbau | `20 -> 21 -> 22 -> 23 -> 16` | SQL 16 endet auf exakt demselben ACL-Ziel wie SQL 23 | SQL 20/21/22 nach SQL 23 oder SQL 16 vor den R9-Objekten |
| produktiv | aktueller read-only Preflight und exakter reviewed SQL-23-Hash | ausschließlich SQL 23 nach separatem Briefing/Owner-Gate; danach read-only | jede Sessionmutation, unerklärte Zählerabweichung, unbekannter Outcome oder fehlende Freigabe |

- Rollback ist nie automatischer Fehlerhandler. Bei unbekanntem Forward-Ausgang
  werden zuerst Source-/Objekt-/ACL-Postconditions gelesen.
- Das Fixture muss zusätzlich beweisen, dass ein unveränderter R8-Commit nach
  SQL 23 automatisch `revision = 1` erhält und dass Rollback nach künstlicher
  R9-Lifecycle-Nutzung fail-closed ist.
- F-ACT-R9-29 und F-ACT-R9-30 sind durch D-ACT-R9-35/-36 korrigiert und
  konkreten S4-/S5-Nachweisen zugeordnet.

Scope- und Umsetzungsreview:

- R8 Commit-/Recovery-/Request-/Fingerprint-/Intent-/Tombstone-Code wird nicht
  semantisch geändert; nur der additive DB-Default wirkt auf neue Sessions.
- R10-Export, R11-Doctor-Integration, R12-Productload/Cutover/Android und R14-
  Retention bleiben vollständig außerhalb S4.
- Activity V1, Root-`index.html`, Root-Service-Worker, Reports, Doctor View,
  Protein Target und Trendpilot sind Negativoracles, keine S4-Dateien.
- Keine offene P0/P1-Lücke ohne Zielschritt, keine fehlende Owner-Entscheidung
  und keine notwendige produktive/destruktive Aktion in S4-Sourcearbeit.
- Continuation: S4R darf automatisch beginnen.

## S4 Readiness Review

Reasoning: `GPT-5.6 Sol / Extra High`.

<!-- markdownlint-disable MD013 -->

| Substep | Änderung | Findings | Dateien | Review | Checks / Evidence | Gate |
| --- | --- | --- | --- | --- | --- | --- |
| S4.1 | Versionierte JS-Verträge für History/Detail/Mutation, Cursor, Dezimalstring-Revision, Domainfehler und getrennten `mutationState` | F-ACT-R9-02, F-ACT-R9-06, F-ACT-R9-10, F-ACT-R9-19, F-ACT-R9-20, F-ACT-R9-24, F-ACT-R9-27 | `data-access.js`, Contracttests | Full | T-ACT-R9-01, T-ACT-R9-02 | nur nach Block-A-Vertragsabgleich |
| S4.2 | Separates Correction-Modell, Immutable-Matrix, Desired-/Canonical-Content und CAS-Request | F-ACT-R9-01, F-ACT-R9-03 bis F-ACT-R9-06, F-ACT-R9-13, F-ACT-R9-18 bis F-ACT-R9-20, F-ACT-R9-28 | neue isolierte JS-Module, Tests | Full | T-ACT-R9-03, T-ACT-R9-04 | nur nach S4.1-Schemafreeze |
| S4.3 | Isolierte History-/Detail-Shell mit Loading/Empty/Error/Pagination | F-ACT-R9-02, F-ACT-R9-04, F-ACT-R9-10 | neue UI-/CSS-/Harness-Dateien | Consumer | T-ACT-R9-05, T-ACT-R9-06 | nach Block A; kein Productload |
| S4.4 | Correction-UI mit Snapshotfeldern, Dirty Close, Conflict, identischem Retry und Unknown Reconcile | F-ACT-R9-01, F-ACT-R9-03, F-ACT-R9-05, F-ACT-R9-06, F-ACT-R9-13, F-ACT-R9-24 | UI/Controller/CSS/Tests | Full | T-ACT-R9-07, T-ACT-R9-08 | nach S4.2/S4.3 |
| S4.5 | Delete-UX, Bestätigung und fail-closed Active-Draft-/Commit-Admission | F-ACT-R9-05, F-ACT-R9-07, F-ACT-R9-25 | UI/Controller/Tests | Full | T-ACT-R9-09 | nach S4.3; kein R7/R8-Statewrite |
| S4.6 | SQL 23: Revision, interne Canonicalization, ursprüngliche Katalogversion, bounded List/Detail-RPCs | F-ACT-R9-01, F-ACT-R9-02, F-ACT-R9-04, F-ACT-R9-09, F-ACT-R9-14, F-ACT-R9-18 bis F-ACT-R9-20, F-ACT-R9-22, F-ACT-R9-26, F-ACT-R9-28 | SQL 23/Rollback/Fixture | Full | T-ACT-R9-10, T-ACT-R9-11 | SQL-Source/disposable only |
| S4.7 | SQL 23: atomarer Full-Replacement-RPC mit Snapshotpreservation, CAS/Replay und Races | F-ACT-R9-01, F-ACT-R9-03, F-ACT-R9-04, F-ACT-R9-06, F-ACT-R9-09, F-ACT-R9-26 | SQL 23/Rollback/Fixture | Full | T-ACT-R9-12, T-ACT-R9-13 | nach S4.6; SQL-Source only |
| S4.8 | SQL 23: Hard Delete, Cascade, Helper-/RPC-ACL, Data-API-Negativgrenze, Rollback/Provisioning | F-ACT-R9-07, F-ACT-R9-09, F-ACT-R9-16, F-ACT-R9-17, F-ACT-R9-22, F-ACT-R9-23, F-ACT-R9-29, F-ACT-R9-30 | SQL 23, Rollback, Fixture, SQL 16, HOW-TO | Full | T-ACT-R9-10, T-ACT-R9-14, T-ACT-R9-15 | nach S4.6/S4.7; kein produktives SQL |
| S4.9 | Reale Data-Access-Integration, Reconciliation und gefenceter History/Detail/Last-Performance-Refresh | F-ACT-R9-06, F-ACT-R9-08, F-ACT-R9-19, F-ACT-R9-21, F-ACT-R9-24, F-ACT-R9-27, F-ACT-R9-40 bis F-ACT-R9-43 | Data Access, Shell, Controller, Tests/Harness | Full | T-ACT-R9-08, T-ACT-R9-16 | erst nach Blöcken B und C |
| S4.10 | Integrierte Isolation, Legacy-Identity-Negativoracles, Responsive-/A11y-/Race-Harnesses | F-ACT-R9-10 bis F-ACT-R9-12, F-ACT-R9-15, F-ACT-R9-21, F-ACT-R9-27 sowie Gesamtvertrag | Tests/Harness/Styles | Full | T-ACT-R9-17, T-ACT-R9-18 | erst nach S4.1-S4.9 |

<!-- markdownlint-enable MD013 -->

- Reihenfolge/Abhängigkeiten:
  - S4.1/S4.2 implementieren zuerst den eingefrorenen Clientvertrag;
  - S4.6-S4.8 implementieren und beweisen denselben Vertrag serverseitig;
  - S4.3-S4.5 bauen danach die isolierte UI gegen die fertigen Clientmodelle;
  - S4.9 verbindet erst nach grüner Client-, SQL- und UI-Seite;
  - S4.10 prüft abschließend den integrierten, weiterhin isolierten Zustand.
- Fehlende Zuordnung:
  - `none`; F-ACT-R9-01 bis -30 besitzen mindestens einen konkreten S4-Schritt
    und T-/EV-Nachweis.
- Evidence:
  - aktive R9-Evidence-Datei angelegt.
- Scope-Freeze:
  - `PASS`; Produktload/V1/R8/R10-R12/R14 bleiben Negativoracles.
- Gültig übernommene Nachweise:
  - nur ausdrücklich nicht invalidierte R8-Nachweise; T16/T19 nicht als PASS.
- Invalidation Map:
  - JS-Vertrag -> zugehörige Contract-/Browserchecks;
  - SQL-/Signatur-/Canonicalization-Änderung -> vollständiges SQL-23-Fixture,
    Data-Access- und Racechecks;
  - UI/CSS -> gebündelte drei Viewports, Fokus und Dirty-Close;
  - Grant/RLS/Owner -> vollständige Securitymatrix und produktiver Preflight.
- Owner-Gates:
  - S4-Start nur nach neuem ausdrücklichem Auftrag;
  - produktives SQL erst in S5 nach Briefing und expliziter Freigabe.
- Empfohlene S4-Ausführungsblöcke:
  - Block A: S4.1-S4.2;
  - Block B: S4.6-S4.8;
  - Block C: S4.3-S4.5;
  - Block D: S4.9;
  - Block E: S4.10.
- Begründung der Zusammenlegung/Trennung:
  - Block A schützt alle nachfolgenden Implementierungen vor Schema-/
    Concurrencydrift;
  - Block B bleibt als eigener `Extra High`-SQL-/Race-/Rollbackblock vollständig
    disposable und ohne produktive Ausführung;
  - Block C kann danach mit Fakeadaptern UI/Guard/UX isoliert schließen;
  - Block D berührt als einziger Block bestehende Cache-/Integrationsseams und
    wartet deshalb auf beide Seiten;
  - Block E enthält nur den vollständigen integrierten Abschlussnachweis.
- Review je Ausführungsblock:
  - Block A `Full Review` wegen bestehender Data-Access-API und CAS-Vertrag;
  - Block B `Full Review` inklusive SQL-/Security-/Race-/Rollbackmatrix;
  - Block C gemeinsamer `Full Review`; S4.3 darin zusätzlich gezielter
    `Consumer Review`, S4.4/S4.5 Full;
  - Block D `Full Review` wegen bestehender R4-Cache- und R8-Data-Access-Seams;
  - Block E `Full Review` plus gebündelter Browser-/Isolation-Nachweis.
- Readiness-Findings/Korrekturen:
  - F-ACT-R9-01 bis -30 korrigiert und vollständig zugeordnet;
  - keine offene P0/P1-Lücke, kein fachlicher Entscheidungsbedarf.

Readiness-Urteil:

- `GO` für die S4-Sourceimplementierung in den Blöcken A bis E.
- Dieses `GO` ist keine Ausführungsfreigabe in diesem Chat: Der Auftrag endet
  vor S4, und Block A benötigt den nächsten ausdrücklichen Owner-Auftrag.
- SQL 23 bleibt auch bei grünem Block B ausschließlich Source/disposable.
  Produktive Ausführung bleibt das separate S5-Owner-Gate T-ACT-R9-21.
- Reale Activity-V2-Korrektur/Löschung, Produktload und Deploy bleiben verboten.

### S4R-Gate-Ergebnis

- Ergebnis: `GO` für S4, `STOP` im aktuellen Auftrag.
- Vollständigkeit:
  - S4.1-S4.10 jeweils gegen S1-Systemkarte, S2-Zielvertrag und S3-Risiko-
    matrix geprüft;
  - F-ACT-R9-01 bis -30 jeweils konkretem S4-Schritt und T-/EV-Nachweis
    zugeordnet;
  - Test-, Evidence-, Rollback-, Security-, Review- und Owner-Gates vollständig.
- Sichere Reihenfolge:
  - A `S4.1-S4.2` -> B `S4.6-S4.8` -> C `S4.3-S4.5` -> D `S4.9` ->
    E `S4.10`.
- Reviewtiefe:
  - alle Blöcke gemeinsamer Full Review;
  - S4.3 zusätzlich gezielter Consumer Review innerhalb Block C.
- Owner-Grenzen:
  - S4 ist noch nicht beauftragt;
  - produktives SQL bleibt ein eigenes späteres S5-Gate;
  - reale Sessionmutation, Produktload, Deploy und Device-Aktion bleiben
    weiterhin verboten.
- Blocker:
  - `none`.

Exit: S4 kann ohne neue Grundsatzentscheidung beginnen; sichere Blöcke und
Owner-Gates sind bestätigt. Die autonome Discovery Wave endet hier.

## S4 - Umsetzung

### S4.1 - Data-Access- und Response-Verträge

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - D-ACT-R9-01/02/13/14/18/26.
- Dateien:
  - `data-access.js`, Contracttests und Testadapter.
- Umsetzung:
  - versionierte Responsevalidatoren, Cursor-/Limitvalidierung, Domainfehler
    und bevorzugte vier Data-Access-Methoden ergänzen;
  - Revision ausschließlich als kanonischen Dezimalstring transportieren und
    R9-`mutationState` ohne Änderung des R8-`commitState` ergänzen;
  - höchstens zwei byte-/strukturidentische Dispatches und danach
    verpflichtenden Unknown-Re-read abbilden;
  - Item-/Set-UUIDs weder exponieren noch als Consumeridentität verwenden;
  - noch keine produktive UI oder SQL-Ausführung.
- Review:
  - `Full` inklusive bestehender Commit-/Lookup-Consumer.
- Invalidation:
  - T-ACT-R9-01 und T-ACT-R9-02.
- Gate:
  - none.

#### S4.1-Ergebnis

- Status: `DONE`; T-ACT-R9-01/-02 und EV-ACT-R9-L01/-L02 `PASS`.
- Additive API: `listSessions`, `loadSessionDetail`, `replaceSession` und
  `deleteSession`; R8-`commitSession` und R4-`loadLastPerformance` blieben
  semantisch und testseitig unverändert.
- Response-/Requestgrenzen: exakte versionierte Own-Keys, bounded Cursor/
  Limit, lowercase UUID/Fingerprint, millisekundengenauer UTC-Zeitstempel,
  tief eingefrorene Ergebnisse und verlustfreie Revision-Dezimalstrings.
- Mutation: CAS einmal serialisiert, höchstens zwei identische Dispatches,
  getrenntes `mutationState` und nicht direkt retrybares Unknown Outcome;
  technische Child-UUIDs fehlen vollständig im R9-Detailvertrag.
- Reviewkorrektur: F-ACT-R9-31 `fixed`; explizite Nullable-Keys akzeptieren
  kein `undefined`.
- Wirkung: kein Productload, keine UI, kein SQL und keine reale Mutation.

### S4.2 - Separates Correction-Modell

Reasoning: `GPT-5.6 Sol / Extra High`.

- Vertrag:
  - D-ACT-R9-04 bis D-ACT-R9-11, D-ACT-R9-15 und D-ACT-R9-25/26.
- Dateien:
  - neue isolierte Correction-/Canonicalization-Module und Tests.
- Umsetzung:
  - Detail -> memory-only Working Copy;
  - Immutable-Matrix, Policyvalidierung, gewünschter kanonischer Inhalt,
    Dirty-State und Mutationrequest deterministisch ableiten;
  - ursprüngliche Katalogversion aus dem Detail übernehmen, bestehende
    Snapshotsemantik von neuem Originalversions-Snapshot unterscheiden;
  - technische UUIDs, Revision und Zeitstempel aus der kanonischen
    Fingerprint-Eingabe ausschließen;
  - keine Kopplung an aktiven Draft, IndexedDB oder Commit-Intent.
- Review:
  - `Full`.
- Invalidation:
  - T-ACT-R9-03 und T-ACT-R9-04.
- Gate:
  - none.

#### S4.2-Ergebnis

- Status: `DONE`; T-ACT-R9-03/-04 und EV-ACT-R9-L03/-L04 `PASS`.
- Neue isolierte Module: reine Canonicalization-Projektion und memory-only
  Correction-Controller; beide Classic-Script-Namespaces sind exakt und tief
  eingefroren.
- Das Modell bewahrt unveränderliche Session-/Snapshotidentität, übernimmt
  die ursprüngliche Katalogversion und snapshottet nur neue Keys aus genau
  dieser Version; entfernte und erneut hinzugefügte Bestandskeys behalten ihre
  persistierten Snapshots.
- Replacement, Canonical Content, Dirty-/Valid-State und CAS-Mutationrequest
  werden deterministisch abgeleitet; Child-UUIDs, Revision, Fingerprint,
  Titel und Zeitfelder fehlen in der kanonischen Inhaltsform.
- Reviewkorrektur: F-ACT-R9-32 `fixed`; Detailtage werden kalendarisch
  validiert.
- Wirkung: keine Kopplung an Draft, Recovery, IndexedDB, Commit-Intent,
  Netzwerk oder Produktload.

### S4 Block-A-Gate

- Kontext-/Driftcheck: `PASS`; Freeze-HEAD
  `0d9192f533091954e4b55e786046f004d25d1ea5`, kein fremdes Worktree-Delta,
  SQL-20/21/22/16 und produktive Isolation unverändert.
- Tests: gezielter Block-A-Lauf 23/23 und vollständiger Activity-V2-Lauf
  186/186 `PASS`; `git diff --check`, Syntax- und Productload-Negativscan grün.
- Full Contract Review: D-ACT-R9-01 bis -36 und F-ACT-R9-01 bis -32 gegen
  R8-Commit/Lookup, Identity, Retry, Scope und Isolation geprüft; keine offene
  P0-/P1-Lücke.
- Gate: `PASS` für Block A.
- Readiness: technisches `GO` für Block B (`S4.6-S4.8`), aber weiterhin
  `USER-GATED`; produktives SQL bleibt ein separates späteres Owner-Gate.
- Stop: `STOP vor Block B`; S4.3-S4.10 wurden nicht begonnen.

### S4.3 - History- und Detail-Shell

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - D-ACT-R9-01 bis D-ACT-R9-03 und D-ACT-R9-18.
- Dateien:
  - neue isolierte History-/Detail-JS-/CSS-/Harness-Dateien.
- Umsetzung:
  - bounded Liste, Mehr-laden, Detailansicht, Loading/Empty/Error/Retry;
  - gespeicherte Snapshotlabels/-policies/-sets anzeigen;
  - kein Productload.
- Review:
  - `Consumer`.
- Invalidation:
  - T-ACT-R9-05 und T-ACT-R9-06.
- Gate:
  - none.

#### S4.3-Ergebnis

- Status: `DONE`; T-ACT-R9-05/-06 und EV-ACT-R9-BR01/-BR02 `PASS`.
- Isolierte Shell und Fakeadapter-Harness bilden bounded 20er-Seiten,
  Mehr-laden, atomaren Refresh, Loading/Empty/Error/Retry und fehlende Details
  ab; Appendfehler bewahren bereits geladene Einträge.
- Detail rendert Session-/Item-/Policy-/Set-Snapshots aus dem gespeicherten
  Payload. Der Browser-Negativcheck zeigte `Historischer Press` und keinen
  aktuellen Live-Katalognamen; Root-Productload bleibt V2-frei.
- Internes S4.3-Gate: `PASS` nach Consumer Review; keine neue Finding-Lücke.

### S4.4 - Correction-UI und Reconciliation

Reasoning: `GPT-5.6 Sol / Extra High`.

- Vertrag:
  - D-ACT-R9-04 bis D-ACT-R9-17.
- Dateien:
  - History-/Correction-Controller, UI, Styles und Tests.
- Umsetzung:
  - korrigierbare Felder aus gespeicherter Policy rendern;
  - Dirty Close, Save, stale Conflict, identischen Replay und unbekannten
    Ausgang mit Re-read abbilden;
  - keine automatische Live-Katalogmigration.
- Review:
  - `Full`.
- Invalidation:
  - T-ACT-R9-07 und T-ACT-R9-08.
- Gate:
  - none.

#### S4.4-Ergebnis

- Status: `DONE`; T-ACT-R9-07/-08 und EV-ACT-R9-BR03/-BR04 `PASS`.
- Die Correction-UI rendert ausschließlich laut gespeicherter Policy erlaubte
  Session-/Item-/Setfelder, ergänzt neue Keys nur aus der ursprünglichen
  Detail-Katalogversion und bewahrt unveränderliche Identität/Snapshots.
- Dirty Close, Validation, Save, Updated/Replay, Known Conflict und Unknown-
  Outcome-Re-read für desired/preimage/changed sind im Controller belegt;
  höchstens der identische eingefrorene Request wird erneut dispatcht.
- Internes S4.4-Gate: `PASS`; F-ACT-R9-38 korrigiert, kein stiller
  Eingabeverlust und keine Live-Katalogmigration.

### S4.5 - Delete-UX und lokale Mutationsguards

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - D-ACT-R9-12 bis D-ACT-R9-17.
- Dateien:
  - History-/Correction-Controller, UI und Tests.
- Umsetzung:
  - einzelne Bestätigung mit Datum und Itemanzahl;
  - keine Bulk-Aktion;
  - Correction/Delete bei nichtleerem aktivem Draft oder ungelöstem
    Commitzustand blockieren;
  - rein lesenden Guardadapter vor Öffnen, Bestätigen und Dispatch prüfen und
    Dependency-/Statewechsel fail-closed behandeln;
  - Absent-/Foreign-Außenvertrag nicht unterscheiden.
- Review:
  - `Full`.
- Invalidation:
  - T-ACT-R9-09.
- Gate:
  - none.

#### S4.5-Ergebnis

- Status: `DONE`; T-ACT-R9-09 und EV-ACT-R9-BR05 `PASS`.
- Delete besitzt genau eine Bestätigung mit Tag und Itemanzahl, Cancel ohne
  Mutation, kein Bulk/Undo sowie dieselben nicht-leakenden Result-/Unknown-
  Outcome-Zustände für deleted/already-absent/absent/preimage/changed.
- Der rein lesende Guard validiert exakte eingefrorene R7-/R8-Snapshots und
  prüft vor Öffnen, Bestätigen und nach Microtask unmittelbar vor Dispatch;
  Draft, Intent/Commitphase, malformed/throwing Dependency und Statewechsel
  blockieren fail-closed.
- Internes S4.5- und Block-C-Gate: `PASS`; F-ACT-R9-39 korrigiert, 200/200
  Activity-V2-Contracttests und Isolation grün. `STOP vor Block D`.

### S4.6 - SQL 23 Revision, History und Detail

Reasoning: `GPT-5.6 Sol / Extra High`.

- Vertrag:
  - D-ACT-R9-01 bis D-ACT-R9-03, D-ACT-R9-08/09/13/18/19/25/26.
- Dateien:
  - `sql/23_Activity_V2_History_Lifecycle.sql`, Rollback und Fixture.
- Umsetzung:
  - additive `revision` mit kanonischem Preimage/Rerun-Vertrag und
    deterministischer Initialisierung vorhandener und Default 1 für neuer
    R8-Sessions; JSON-Ausgabe als Dezimalstring;
  - ursprüngliche Katalogversion aus exakt einer gemeinsamen Itemversion
    ableiten und bei leer/gemischt fail-closed bleiben;
  - exakt eine validierende pure Canonical-Content-Grenze in nicht exponiertem
    `midas_private`, die den Fingerprint bei Bedarf ableitet; keine persistente
    Fingerprint- oder Session-Katalogspalte und kein Trigger;
  - bounded List- und Snapshotdetail-RPCs;
  - keine Änderung des R8-Commit-RPCs erforderlich, sofern S1/S2 dies
    bestätigen.
- Review:
  - `Full` inklusive aktueller Supabase-/Postgres-Verträge.
- Invalidation:
  - T-ACT-R9-10 und T-ACT-R9-11.
- Gate:
  - SQL-Source only; kein produktives SQL.

#### S4.6-Ergebnis

- Status: `DONE`; T-ACT-R9-10/-11 und EV-ACT-R9-D01/-D02 `PASS`.
- SQL 23 fügt ausschließlich `revision bigint not null default 1` mit
  positivem Check hinzu; bestehende und neue R8-Sessions starten bei 1, und
  sämtliche JSON-Antworten transportieren die Revision als Dezimalstring.
- Der PostgreSQL-17-Guard akzeptiert exakt den R8-Postimage oder den eigenen
  R9-Rerun, prüft Commit-/Lookup-Quellhash, v1/v2-Kataloginhalt, Struktur,
  RLS und ACL und bewahrt R8-Commit und Lookup bitgenau.
- Genau ein `IMMUTABLE SECURITY INVOKER`-Helper in `midas_private`
  validiert und rekonstruiert Canonical Content. List ist bounded per
  `(started_at,id)`-Keyset; Detail leitet genau eine ursprüngliche
  Katalogversion aus gespeicherten Snapshots ab und exponiert keine Child-IDs.
- Internes S4.6-Gate: `PASS`; F-ACT-R9-35/-36 korrigiert, keine offene
  P0-/P1-Lücke und keine produktive SQL-Ausführung.

### S4.7 - SQL 23 atomare Korrektur

Reasoning: `GPT-5.6 Sol / Extra High`.

- Vertrag:
  - D-ACT-R9-04 bis D-ACT-R9-11 und D-ACT-R9-19.
- Dateien:
  - SQL 23, Rollback und Fixture.
- Umsetzung:
  - Ownerzeile unter Lock lesen;
  - aktuellen und gewünschten Content kanonisieren;
  - identischen Replay vor stale CAS erkennen;
  - andernfalls Revision/Fingerprint prüfen, mutable Inhalte atomar ersetzen,
    Revision einmal erhöhen und `updated_at` setzen;
  - bei jedem Fehler vollständig rollbacken.
- Review:
  - `Full`.
- Invalidation:
  - T-ACT-R9-12 und T-ACT-R9-13 sowie alle SQL-23-Checks.
- Gate:
  - SQL-Source only.

#### S4.7-Ergebnis

- Status: `DONE`; T-ACT-R9-12/-13 und EV-ACT-R9-D03/-D04 `PASS`.
- Replace sperrt zuerst die eigene Sessionzeile, leitet aktuellen Content und
  Fingerprint unter demselben Lock ab, erkennt identischen Replay vor stale
  CAS und verlangt sonst Revision plus Content-Fingerprint.
- Ein echter Vollersatz bewahrt die Snapshots bestehender Keys, snapshottet
  neue Keys nur aus der exakt ursprünglichen Katalogversion, ersetzt Children
  atomar, erhöht Revision genau einmal und leitet `ended_at` aus
  `started_at + duration` ab. R8-Erstellungsidentität und Titel bleiben
  unverändert.
- Disposable Tests belegen success, Originalversionsitem, Snapshotpreservation,
  stale conflict, Mixed-Version-Drift, Revisionsexhaustion, vollständigen
  Fehlerrollback sowie Edit/Edit verschieden/identisch und beide
  Edit/Delete-Lockreihenfolgen.
- Internes S4.7-Gate: `PASS`; F-ACT-R9-34 korrigiert, kein Lost Update,
  keine Resurrection und keine offene P0-/P1-Lücke.

### S4.8 - SQL 23 Hard Delete und Security-Hardening

Reasoning: `GPT-5.6 Sol / Extra High`.

- Vertrag:
  - D-ACT-R9-12/13/19/20.
- Dateien:
  - SQL 23, Rollback, Fixture und `sql/16_Explicit_Grants.sql`.
- Umsetzung:
  - CAS-Delete, owner-/auth-geprüft und nicht-leakend;
  - FK-Cascade beweisen;
  - Function Owner, leerer/sicherer Search Path, exakt eine Signatur,
    PUBLIC/anon/service revoke und authenticated grant;
  - internes Schema/Helper minimal granten und Nicht-Exposition mit Katalog-
    plus Data-API-Negativnachweis belegen;
  - explizite Grant-Source ergänzen und Provisioningfolge
    `20 -> 21 -> 22 -> 23 -> 16` dokumentieren/beweisen;
  - Rollback nach künstlicher Lifecycle-Nutzung zurückweisen und operatives
    Nichtnutzungs-/Owner-Gate dokumentieren.
- Review:
  - `Full`.
- Invalidation:
  - T-ACT-R9-14 und T-ACT-R9-15 sowie die Securitymatrix.
- Gate:
  - SQL-Source only.

#### S4.8-Ergebnis

- Status: `DONE`; T-ACT-R9-10/-14/-15 und
  EV-ACT-R9-D01/-D05/-D06 `PASS`.
- Delete sperrt die eigene Zeile, prüft denselben abgeleiteten Fingerprint plus
  Revision, kaskadiert Session->Item->Set und liefert bei absent/foreign
  einheitlich `already_absent`; Delete/Delete endet
  `deleted`/`already_absent`.
- Vier exakte Public-Signaturen sind owner `postgres`, ohne Defaults,
  mit leerem `search_path`; Read-RPCs sind invoker/stable,
  Mutations-RPCs definer/volatile. Nur `authenticated` besitzt Execute,
  Direct DML bleibt allen Browserrollen und der browserfernen Service Role
  entzogen.
- `midas_private` besitzt exakte Minimal-ACLs. Ein lokaler
  PostgREST-14.14-Check mit ausschließlich `public` als exposed schema
  löste den Public-Detailendpoint auf, während der Helper mit HTTP 404 /
  `PGRST202` außerhalb des Schema-Caches blieb.
- SQL 16 spiegelt R9 all-or-none/fail-closed; HOW-TO und Fixture beweisen
  `20 -> 21 -> 22 -> 23 -> 16`. Rollback verlangt technische
  Nichtnutzung, positive operative Bestätigung und ein separates Owner-Gate;
  nach künstlicher Lifecycle-Nutzung stoppt er.
- Internes S4.8-Gate: `PASS`; F-ACT-R9-33/-36/-37 korrigiert, keine offene
  P0-/P1-Lücke und weiterhin kein produktives SQL.

### S4 Block-B-Gate

- Kontext-/Driftcheck: `PASS`; HEAD
  `0d9192f533091954e4b55e786046f004d25d1ea5`, ausschließlich bekannte
  Block-A-/R9-Dokumentdeltas vor Beginn, kein fremdes überlappendes Delta.
- Tests: vollständiger PostgreSQL-17-Fixturelauf
  `sql/tests/23_Activity_V2_History_Lifecycle_fixture.sql` `PASS`;
  T-ACT-R9-10 bis -15 grün, final 0/0/0 Session-/Item-/Set-Zeilen und
  unveränderter R8-Commit-Hash. PostgREST-14.14-Data-API-Negativprobe `PASS`;
  beide namentlich geprüften Wegwerf-Container danach entfernt und als
  abwesend verifiziert. Vollständige Activity-V2-Clientsuite 186/186 `PASS`.
- Full Contract Review: D-ACT-R9-01 bis -36, F-ACT-R9-01 bis -37,
  Supabase-/Postgres-Funktions-, RLS-, ACL-, Lock-, Rollback- und
  Provisioningverträge geprüft; keine offene In-Scope-P0-/P1-Lücke.
- Gate: `PASS` für Block B.
- Readiness: technisches `GO` für Block C (`S4.3-S4.5`), aber
  weiterhin `USER-GATED`. Produktives SQL 23 bleibt ein separates
  Owner-Gate.
- Stop: `STOP vor Block C`; S4.3-S4.5, S4.9 und S4.10 wurden nicht
  begonnen.

### S4.9 - Reale Integration und Consumer-Konsistenz

Reasoning: `GPT-5.6 Sol / Extra High`.

- Vertrag:
  - D-ACT-R9-14/17/18.
- Dateien:
  - Data Access, History/Correction Controller, Shelladapter und Tests.
- Umsetzung:
  - Fakeadapter gegen reale RPC-Aufrufe tauschen;
  - nach Correction/Delete Liste und Detail neu laden;
  - `sessionShell.refreshLastPerformance(itemKeys)` als einzige R4-Erweiterung
    mit alter/neuer Keyunion, Generation-Fencing und terminalem Resultat
    implementieren;
  - Unknown Outcome vor UI-Erfolg reconciled behandeln.
- Review:
  - `Full`.
- Invalidation:
  - T-ACT-R9-16 sowie Client-/SQL-Contracttests.
- Gate:
  - `PASS`; weiterhin isoliert und `STOP vor Block E`.
- Ausführung 2026-08-13:
  - der Harness und der Integrationstest verwenden die reale additive
    Data-Access-Grenze über einen ausschließlich lokalen deterministischen
    RPC-Transport;
  - bestätigte Correction/Delete-Ergebnisse sowie Unknown-Outcome-
    Reconciliation werden vor dem UI-Erfolg durch cursorlose Liste, Detail
    beziehungsweise Absence und den terminalen R4-Cache-Refresh gemeinsam
    bestätigt;
  - Refreshfehler leeren stale History/Detaildaten, bewahren die
    Writebestätigung und wiederholen ausschließlich Reads/Cache, niemals den
    bereits bestätigten Write;
  - `refreshLastPerformance(itemKeys)` ist die einzige additive R4-Grenze,
    verwendet alte/neue Keyunion, Generation-Fencing und dichte exakte
    terminale Resultate.
- Nachweis:
  - T-ACT-R9-16 und EV-ACT-R9-I01 `PASS`; 203/203 Activity-V2-
    Contracttests, Syntax, Diffcheck, R8-Isolation, finaler Browser-Smoke und
    das unveränderte SQL-23-Fixture in disposable PostgreSQL 17 grün;
  - F-ACT-R9-40 bis -43 im Full Contract Review gefunden, korrigiert und mit
    Negativoracles geschlossen; keine offene In-Scope-P0-/P1-Lücke;
  - der ergänzende CodeRabbit-Lauf lieferte kein Ergebnis, weil die offizielle
    CLI-Installation im lokalen Toolkanal in ein Timeout lief; der finale
    CodeRabbit-Nachweis bleibt ehrlich T-ACT-R9-19/S5 und ist keine Block-D-
    PASS-Evidence.
- Produktive Wirkung:
  - keine; kein produktives SQL, keine reale Sessionmutation, kein
    Productload, Deploy oder Commit.

### S4.10 - Integrierter isolierter Nachweis

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - gesamter R9-Zielvertrag.
- Dateien:
  - Harnesses, Tests und Styles; Produktdateien nur bei belegter Isolation.
- Umsetzung:
  - List/Detail/Correction/Delete/Conflict/Unknown/Refresh im Harness;
  - 1440x900, 390x844 und 320x800 ohne Overflow und mit korrektem Fokus;
  - Productload-, Activity-V1-, R7-/R8-State- und Netzwerkisolation beweisen.
- Review:
  - `Full` ausschließlich für den Block-E-Diff und dessen neue
    blockübergreifende Integrationsflächen; A-D-Reviews über ihr
    Invalidation-Ledger wiederverwenden.
- Invalidation:
  - T-ACT-R9-17 und T-ACT-R9-18.
- Gate:
  - `PASS`; ohne künstlichen Zwischenstopp in den gekoppelten S5-
    Finalgateverbund fortgeführt.
- Ergebnis:
  - T-ACT-R9-17/-18 und EV-ACT-R9-I02/-BR06 `PASS`;
  - 206/206 finale Contracttests sowie Productload-/Isolation-/Syntax-/Diff-
    Checks grün; F-ACT-R9-44 `fixed`;
  - drei exakte Viewports ohne Horizontaloverflow, Consolefehler, doppelte IDs
    oder unbenannte Controls; erwartete Fokusziele in Detail, Correction und
    Delete; Activity V2 bleibt produktiv ungeladen.

#### Ergebnisformat für jeden S4-Substep

- Änderung:
  - nur das Delta.
- Prüfung:
  - zugeordnete T-/EV-IDs.
- Finding/Korrektur:
  - ID oder `none`.
- Restrisiko:
  - kurz oder `none`.
- Doku-Sync:
  - S6 oder sofort nur bei blockierender Source-of-Truth-Korrektur.
- Status:
  - `DONE` oder `BLOCKED`.

Exit S4: Alle In-Scope-Verträge sind implementiert, lokal bewiesen und Activity
V2 bleibt produktiv unsichtbar.

## S5 - Tests, Runtime-Gates und Abschlussreview

Reasoning: `GPT-5.6 Sol / Extra High`.

Deterministische Reihenfolge:

1. S4.10 vollständig ausführen und denselben Browserlauf zugleich als
   T-ACT-R9-18 verwenden; keinen zweiten identischen S5-Browserlauf starten.
2. Einmal die finale Contract-, Syntax-, Catalog-, Diff-, Isolation- und
   Productloadmatrix ausführen.
3. Die in Block B/D vollständig bestandene SQL-23-Fresh-/Rerun-/Drift-/
   Rollback-/Race-/Securitymatrix über die dort dokumentierten exakten
   SQL-/Fixture-/Grant-Hashes validieren. Nur bei Hash- oder Toolchain-
   Invalidierung den betroffenen disposable Nachweis wiederholen.
4. Review-Ledger der Full Reviews A-D gegen unveränderte Sourcegrenzen prüfen;
   anschließend Full Review nur des Block-E-Deltas und der neuen
   blockübergreifenden Integrationsflächen durchführen. Kein zweites
   vollständiges A-D-Code-Review.
5. CodeRabbit genau einmal gegen den endgültigen Gesamtdiff ausführen,
   Issues einzeln bewerten und nichts blind korrigieren. Nur wenn daraus eine
   Codeänderung entsteht, die dadurch invalidierten Checks und den geänderten
   Scope erneut prüfen; kein routinemäßiger zweiter Vollreview.
6. Produktiv read-only Preflight: SQL-22-Kanonik, Schema/ACL/RLS/Funktions-
   Preimage, Objektzähler, Data-API-Exposition und 0/0/0-Datenstand prüfen.
7. Das Owner-Gate für exakt SQL 23 ist durch den Auftrag vom 2026-08-13 bereits
   freigegeben. Nur bei vollständig grünem Schritt 6 SQL 23 produktiv
   ausführen; jede Abweichung stoppt vor dem Write.
8. Produktiv ausschließlich read-only Postconditions prüfen; keine Session
   anlegen, korrigieren, löschen oder RPC-Mutation testen.
9. Finalen Contract-/Evidence-Abgleich durchführen und `STOP vor S6`.

<!-- markdownlint-disable MD013 -->

| ID | Ebene | Check / Smoke | Status | Nachweis | Invalidiert durch |
| --- | --- | --- | --- | --- | --- |
| T-ACT-R9-01 | lokal | Exakte History-/Detail-/Mutation-Responses, Cursor/Limit, Dezimalstring-Revision, Legacy-UUID-Negativgrenze und getrennte `commitState`/`mutationState` | PASS | EV-ACT-R9-L01 | Data Access |
| T-ACT-R9-02 | lokal | Keyset-Seiten mit gleichen Timestamps: keine Duplikate/Skips | PASS | EV-ACT-R9-L02 | Cursor/Sortierung |
| T-ACT-R9-03 | lokal | Immutable-/Mutable-Matrix, aus Items abgeleitete ursprüngliche Katalogversion, bestehende versus neue Snapshots und keine stabile Child-UUID-Zusage | PASS | EV-ACT-R9-L03 | Correction Model |
| T-ACT-R9-04 | lokal | Exakte Canonical-Content-Root-/Item-/Setform ohne ausgeschlossene Identitäten/Zeiten; Desired Request und Null-/Orderregeln deterministisch | PASS | EV-ACT-R9-L04 | Canonicalization |
| T-ACT-R9-05 | Browser | History Loading/Empty/Error/Retry/Mehr-laden | PASS | EV-ACT-R9-BR01 | History UI |
| T-ACT-R9-06 | Browser | Detail nutzt gespeicherte Snapshots, nicht Live-Katalog | PASS | EV-ACT-R9-BR02 | Detail UI |
| T-ACT-R9-07 | Browser | Correction, Dirty Close, Validation und Fokus | PASS | EV-ACT-R9-BR03 | Correction UI |
| T-ACT-R9-08 | Browser | Conflict/Replay/Unknown Outcome: höchstens identischer Redispatch und desired/preimage/changed beziehungsweise absent-Re-read | PASS | EV-ACT-R9-BR04 | Mutation Controller |
| T-ACT-R9-09 | Browser | Delete-Bestätigung/Repeat und Admission bei active draft, Commit-Intent/-Phasen, Dependencyfehler sowie Statewechsel vor Dispatch | PASS | EV-ACT-R9-BR05 | Delete UI |
| T-ACT-R9-10 | disposable | SQL 23 fresh/rerun/einzelne Preimage-Drifts/rollback/forward-after-rollback, Reject bei technisch belegter Lifecycle-Nutzung sowie separates operatives Nichtnutzungsgate und kompletter Aufbau `20 -> 21 -> 22 -> 23 -> 16` | PASS | EV-ACT-R9-D01 | SQL 23 |
| T-ACT-R9-11 | disposable | Revision/default/check und unveränderter R8-Commit erzeugt Revision 1; ursprüngliche Katalogableitung, interne Helperform/ACL, Read-RPC/Fingerprint; keine Fingerprint-/Katalogspalte/Child-ID-Zusage | PASS | EV-ACT-R9-D02 | Schema/Read RPC |
| T-ACT-R9-12 | disposable | Correction success, bestehende Snapshotpreservation, neues Item nur Originalversion, exact replay, stale/drift/exhausted und kein Partial Write | PASS | EV-ACT-R9-D03 | Correction RPC |
| T-ACT-R9-13 | disposable | Edit/Edit verschieden/identisch sowie beide Edit/Delete-Lockreihenfolgen unter Dual-CAS | PASS | EV-ACT-R9-D04 | Correction RPC |
| T-ACT-R9-14 | disposable | Delete/Delete, absent repeat und FK-Cascade | PASS | EV-ACT-R9-D05 | Delete RPC |
| T-ACT-R9-15 | disposable | Permanent-/Anonymous-Auth, RLS/ACL/Owner/Search-Path/Overload/Direct-DML/Foreign-User, internes Schema und Data-API-Negativgrenze | PASS | EV-ACT-R9-D06 | SQL Security |
| T-ACT-R9-16 | integriert | Liste/Detail nach Edit/Delete plus alte/neue Keyunion, Cachegeneration/Late Settlement und terminaler Last-Performance-Refresh konsistent | PASS | EV-ACT-R9-I01 | Integration |
| T-ACT-R9-17 | integriert | Activity V1/Productload/R7/R8 unverändert, Legacy-Child-UUIDs keine R9-Identität und R8-Evidence-Gaps nicht als PASS | PASS | EV-ACT-R9-I02 | Gesamtdiff |
| T-ACT-R9-18 | Browser | 1440x900, 390x844, 320x800; kein Overflow, Fokus/A11y | PASS | EV-ACT-R9-BR06 | UI/CSS |
| T-ACT-R9-19 | Review | A-D-Review-Ledger validieren; Full Review nur für Block-E-Diff und neue Integrationsflächen; CodeRabbit-Gesamtdiff plus ausschließlich durch Fixes erforderliche Nachreviews | PASS bis Fixreview; finaler Null-Lauf ausstehend | EV-ACT-R9-RV01 | finaler Code-Diff |
| T-ACT-R9-20 | produktiv read-only | Projekt-/SQL-22-/Schema-/ACL-/RLS-/Zähler-Preflight plus Data-API-Schemaexposition und SQL-23-/Rollback-Hash | PASS | EV-ACT-R9-PRE01 bis -PRE04 | Produktivstand |
| T-ACT-R9-21 | produktiv write | SQL 23 nach vollständig grünem T-ACT-R9-20 ausführen | PASS; Owner-Freigabe verbraucht | EV-ACT-R9-W01 | Drift oder fehlgeschlagener Preflight |
| T-ACT-R9-22 | produktiv read-only | Postconditions, Funktionen/Grants/Revision und unveränderte 0/0/0-Zähler | PASS | EV-ACT-R9-P01 | SQL 23 |

<!-- markdownlint-enable MD013 -->

Produktive Stop-Bedingungen:

- Activity-V2-Produktzähler sind entgegen der Baseline nicht 0/0/0 und der
  Datenbestand wurde nicht owner-seitig erklärt.
- SQL-22-/R2-/R8-Kanonik, ACL/RLS oder erwartete Objektstruktur weichen ab.
- Die bewiesene Provisioningfolge oder die Regel `produktiv nur SQL 23` ist
  nicht eindeutig eingehalten.
- SQL 23 ist im disposable Stack nicht vollständig fresh/rerun/rollback/race-
  und security-grün.
- Forward-/Rollback-Hashes und erwartete DDL-Wirkung sind nicht eindeutig.
- Die Aktion würde reale Sessiondaten schreiben, ändern oder löschen.
- T-ACT-R9-20 ist nicht vollständig grün oder der Owner-Auftrag vom
  2026-08-13 kann nicht eindeutig exakt SQL 23 zugeordnet werden.

Ergebnis:

- Grüne Nachweise:
  - T-/EV-IDs nach Ausführung.
- Wiederverwendete, nicht invalidierte Nachweise:
  - explizit benannte R8-IDs; R8-T16/T19 ausgeschlossen.
- Nicht ausgeführte Smokes:
  - mit Grund und ohne falsches PASS.
- Produktiver Iststand:
  - SQL-Version, Objekt-/Grant-/Datenzähler.
- Externer Review:
  - CodeRabbit oder dokumentiert nicht verfügbar.
- Offene Findings:
  - `none` für In-Scope-P0/P1 vor S6.
- Commit-Entscheidung:
  - `S6 offen`; kein Commit ausgeführt.

Ausführungsergebnis 2026-08-13:

- T-ACT-R9-17 bis -22 `PASS`; A-D-Evidence blieb über unveränderte Hash-/
  Sourcegrenzen gültig, die redundante SQL-/Race-/Securitymatrix wurde nicht
  erneut ausgeführt.
- Full Review des Block-E-Deltas und der neuen Integrationsflächen ohne offene
  P0/P1-Lücke. Die später verfügbare CodeRabbit CLI 0.7.2 meldete zunächst
  sechs Punkte; vier berechtigte Findings wurden korrigiert und zwei
  vertragswidrige Vorschläge verworfen. Der erforderliche Fixreview meldete
  vier weitere berechtigte Punkte, die ebenfalls korrigiert und revalidiert
  wurden. Der finale Null-Lauf bleibt vor Abschluss der Korrekturwelle offen.
- Produktiver Preflight und Postcheck belegen PostgreSQL 17.6, exakte R8-/R9-
  Quellen/ACLs, Katalog 78/80/0, Activity-V2-Zähler 0/0/0 und die Data-API-
  Negativgrenze 406/`PGRST106` für `midas_private`.
- SQL 23 wurde aus der Datei mit SHA-256 `b8180409e2199477177d4cb6fe21604467bc8da37fce73342db49c511cf01bc4`
  exakt einmal produktiv ausgeführt. Kein Rerun, Rollback, Productload,
  Web-/Edge-/APK-Deploy, reale Sessionmutation oder Commit.
- Gate: `PASS`; `STOP vor S6`.

Exit: Relevante Checks sind grün oder sichtbar abgegrenzt; produktives SQL ist
owner-freigegeben und nachgewiesen, ohne reale Activity-Datenmutation.

## S6 - Doku-Sync, Owner-Recap und Abschluss

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. `docs/modules/Activity Module Overview.md` auf bewiesenen R9-Iststand
   synchronisieren.
2. Masterplan R9 auf DONE setzen und R10 als nächstes Rolling-Wave-Gate
   bestätigen; keine spätere Roadmap vorwegimplementieren.
3. `docs/qa/health-capture-reports.md` um den nächsten kanonischen HCR-Nachweis
   für History/Correction/Delete erweitern.
4. `sql/HOW_TO.md` und `sql/16_Explicit_Grants.sql` auf SQL 23 und Rollback
   synchronisieren.
5. Finalen Full Contract Review gegen Zielvertrag, reale Implementierung,
   produktiven Runtime-Stand und Evidence durchführen.
6. Findings korrigieren; alle dadurch invalidierten Checks wiederholen.
7. Changelog-Relevanz entscheiden: produktive Backend-Lifecycle-Grundlage
   unter `Unreleased` dokumentieren oder Nicht-Relevanz begründen; kein
   Release-Cut oder Tag.
8. Owner-Recap in Alltagssprache erstellen:
   - wie Keyset-History funktioniert;
   - warum ursprünglicher Fingerprint und neuer Content-Fingerprint getrennt
     sind;
   - wie Revision/CAS Lost Updates verhindert;
   - warum Hard Delete hier bewusst genügt;
   - was produktiv installiert wurde und was weiterhin unsichtbar bleibt.
9. Resume Card und Evidence auf Abschluss setzen.
10. Commit-Empfehlung aus dem realen Diff ableiten.
11. Roadmap und Evidence mit `(DONE)` nach `docs/archive/` verschieben.

Ergebnis:

- Source-of-Truth-Sync:
  - Activity Overview, Masterplan, QA, SQL HOW-TO/Grants und gegebenenfalls
    Changelog.
- Finaler Review:
  - `PASS` oder Findings.
- Restrisiken:
  - R8-T16/T19 bleiben R8-Evidence-Gaps; R9 bleibt bis R12 isoliert.
- Changelog-Relevanz:
  - bei Abschluss entscheiden.
- Owner Recap:
  - maximal 10 bis 15 verständliche Punkte.
- Archiv:
  - Roadmap und Evidence gemäß Metadaten.
- Commit-Empfehlung:

```text
feat(activity-v2): add isolated session history lifecycle
```

Exit: Code, SQL, Runtime, Roadmap, QA und Doku beschreiben denselben finalen
R9-Vertrag; R10 darf auf einer bewiesenen History-/Lifecycle-Grenze starten.
