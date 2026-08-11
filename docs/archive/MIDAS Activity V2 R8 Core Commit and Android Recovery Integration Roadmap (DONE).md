# MIDAS Activity V2 R8 Core Commit and Android Recovery Integration Roadmap

Diese Roadmap verbindet den in R7 verlustsicher gespeicherten Activity-V2-
Session-Draft mit dem atomaren R2-Commit. Sie schließt insbesondere die Lücke
zwischen lokal vorbereitetem Abschluss und einer möglicherweise erfolgreichen,
aber wegen Verbindungsabbruch nicht bestätigten Supabase-Antwort. Zusätzlich
beweist sie den Recovery- und Abschlussfluss in einer testgebundenen Android-
PWA-Laufzeit. Activity V1 bleibt produktiv; der Activity-V2-Cutover bleibt R12
vorbehalten.

---

## Roadmap-Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Status | `DONE_WITH_OWNER_ACCEPTED_EVIDENCE_GAP` |
| Modul / Bereich | `Activity V2 / Core Commit / Recovery / Android-PWA-Testintegration` |
| Owner / Kontext | `Stephan; private Single-User-PWA für die eigene Trainingsdokumentation` |
| Chat-Lebenszyklus | `Denkraum -> eigener Ausführungs-Chat` |
| Erstellt am | `2026-08-10` |
| Letzter Stand | `2026-08-11; S6 DONE, R8 mit owner-akzeptierter T16-/T19-Evidence-Lücke abgeschlossen` |
| Aktueller Schritt | `R8 abgeschlossen; nächstes erlaubtes Rolling-Wave-Gate ist R9, Produktcutover bleibt R12` |
| Risikoklasse | `R3`; persistente Gesundheitsdaten, idempotenter Remote-Write, CAS, unbekannter Commit-Ausgang, SQL und Android-Prozessverlust |
| Standard-Reviewtiefe | `Full`; `Consumer` nur für klar isolierte S4-Deltas |
| Ausführungsmodell | `GPT-5.6 Sol` |
| Reasoning-Standard | `High` |
| Reasoning-Ausnahmen | `Roadmap-Erstellung: Ultra auf Owner-Wunsch; Discovery Wave S1-S4R, S4.3-S4.10 und S5: Extra High wegen Concurrency-, Rollback-, SQL- und Datenverlustgrenze` |
| Autonome Discovery Wave | `S1-S4R` |
| Owner-Erklärmodus | `Briefing + S6-Recap` |
| Betroffene Hauptdateien | `app/modules/vitals-stack/activity/v2/session-draft.js`, `session-recovery.js`, neue Commit-Koordination, `session-shell.js`, `session-shell.css`, `data-access.js`, Contracttests und isolierte Harnesses; `sql/22_Activity_V2_Commit_Compatibility.sql`, SQL-Fixtures und `sql/HOW_TO.md` |
| Deploy relevant | `ja`; ausschließlich owner-gatetes produktives SQL, kein Web-/Edge-/APK-Deploy |
| Produktive Schreibwirkung | `ja`; nur owner-gatetes `CREATE OR REPLACE FUNCTION`/ACL-Hardening, keine produktive Activity-Testsession und keine Feature-Aktivierung |
| Workflow-Vertrag | `docs/templates/MIDAS Roadmap Workflow Contract.md` |
| Evidence-Datei | `docs/archive/MIDAS Activity V2 R8 Core Commit and Android Recovery Integration Evidence (DONE).md` |
| Gekoppelte Roadmaps | `R2 liefert RPC/DB-Commit; R6 Draft v3; R7 Recovery v1; R12 bleibt Produkt-Cutover` |
| Evidence-Owner | `diese Roadmap` |
| Archivziel | `docs/archive/MIDAS Activity V2 R8 Core Commit and Android Recovery Integration Roadmap (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Ausführungs-Chat-Startkarte

Diese Karte ist der verbindliche Einstieg für einen frischen Ausführungs-Chat.
Der Denkraum ist keine zusätzliche Source of Truth.

- Auftrag:
  - `R8 gemäß dieser Roadmap zunächst autonom von S1 bis einschließlich S4R
    abarbeiten; S4 nicht ohne eigenen Folgeauftrag beginnen.`
- Modell und Reasoning:
  - `GPT-5.6 Sol / Extra High` für die gesamte Discovery Wave S1-S4R.
  - Danach gemäß Statusmatrix; Concurrency-, SQL- und S5-Blöcke bleiben
    `Extra High`.
- Kontextübergabe aus dem Denkraum:
  - `PASS`: R1-R7 und C2 sind DONE. Activity V1 bleibt der einzige sichtbare
    und produktive Activity-Consumer; R12 bleibt das Cutover-Gate.
  - `PASS`: R6 liefert `midas.activity-session-draft.v3`; R8 ändert dieses
    fachliche Draftschema nicht.
  - `PASS`: R7 speichert genau einen Draft je Browserprofil und Origin in
    `midas_activity_v2_recovery`, Store `session_recovery`, Slot
    `active_session`, geschützt durch vollständigen Observation-CAS und
    Generationstombstone.
  - `PASS`: R2 stellt `commitSession` und `activity_v2_commit_session` bereit.
    Gleiche `request_id` plus gleiche kanonische Payload ist idempotent; gleiche
    ID plus andere Payload ist ein Konflikt.
  - `PASS`: Deshalb muss R8 vor dem ersten Netzwerkaufruf einen exakten,
    unveränderlichen Commit-Intent persistent speichern. `ended_at`,
    `duration_min`, Reihenfolge und Zahlen dürfen bei einem Retry nicht neu
    erzeugt werden.
  - `PASS`: Ein unbekannter Remote-Ausgang sperrt Bearbeiten und Verwerfen,
    behält Draft und Commit-Intent und erlaubt nur den identischen Retry.
  - `PASS`: Erst bestätigter Commit oder bestätigter Replay darf den Draft in
    einen Generationstombstone überführen. Physisches Löschen des Slots bleibt
    verboten.
  - `PASS`: Der derzeitige R2-RPC akzeptiert nur die höchste Katalogversion.
    R8 muss vorhandene unveränderliche Katalogsnapshots commitfähig machen,
    ohne Versionen umzudeuten oder zu migrieren.
  - `PASS`: R8 aktiviert Activity V2 nicht produktiv, schreibt keine
    synthetische produktive Trainingssession und ändert Activity V1 nicht.
- Verbindliche Lesereihenfolge:
  1. `Diese Startkarte, Roadmap-Metadaten und Session Resume Card`
  2. `README.md`
  3. `docs/DEV_ENVIRONMENT.md`
  4. `docs/templates/README.md`
  5. `docs/templates/MIDAS Roadmap Workflow Contract.md`
  6. `docs/Future trainingsmodule update thoughts.md`, insbesondere R8/O-8
  7. `docs/modules/Activity Module Overview.md`
  8. `docs/MIDAS Activity V2 R1 Catalog Baseline Contract.md`
  9. `docs/MIDAS Activity V2 C2 Catalog Version 2 Contract.md`
  10. archivierte R7-Roadmap und R7-Evidence vollständig
  11. archivierte R2-Roadmap und R2-Evidence für Commit-, SQL-, ACL-,
      Idempotenz- und Fehlerverträge
  12. R6-Roadmap nur für Draft-v3-, Editor- und Timerfragen
  13. `docs/qa/health-capture-reports.md`, mindestens HCR-017 bis HCR-025
  14. reale Activity-V2-Runtime, Tests, SQL 20/21 und Produkt-Scriptgrenze
  15. `git status --short` und nur der relevante Diff
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
    Roadmap-/Evidence-/Vertragskorrekturen und günstige Baselinechecks;
  - nach separater S4-Freigabe: eng begrenzte Activity-V2-JS-/CSS-/Harness-/
    Test- und SQL-Source-Änderungen sowie disposable lokale Tests;
  - Docker Desktop und lokaler Supabase-Stack dürfen für disposable Tests
    gestartet und gestoppt werden;
  - CodeRabbit ausschließlich in S5 nach grüner lokaler Gesamtmatrix.
- Owner-Gates:
  - produktives SQL und jeder produktive Write;
  - Android-Device-Aktionen wie Installieren, Force-Stop oder Prozess-Reclaim;
  - jede Änderung an Produktload, Service Worker, Navigation oder Activity V1;
  - Web-/Edge-/APK-Deploy, falls entgegen dem eingefrorenen Scope nötig.
- Stop-Bedingungen:
  - fehlende exakte Zuordnung von Draft v3 zu `midas.activity-session.v1`;
  - Netzwerkaufruf vor bestätigter Commit-Intent-Persistenz;
  - neu erzeugte Payload bei Retry, zweite parallele Commit-Promise oder
    editierbarer unbekannter Commitzustand;
  - automatische Draft-/Katalogmigration, physisches Recovery-Delete oder
    Entfernen des Tombstone-Schutzes;
  - produktive synthetische Session, Dual-Write nach Activity V1 oder
    vorgezogener Cutover;
  - ungeklärter SQL-/ACL-/RLS-Drift, fehlender Rollbacknachweis oder nicht
    erteilte Owner-Freigabe.
- Halluzinationsschutz:
  - API-Keys, Fehlertokens, Draftformen, Katalogstände, Scriptreihenfolge,
    CLI-Befehle und Android-Lane zuerst am realen Repo/System prüfen.
  - Fehlende Fakten nicht erfinden. Widersprüche als Finding dokumentieren.
  - Ein lokaler oder isolierter Harness-Erfolg ist kein Produkt-Cutover.
- Browser-/Device-Kadenz:
  - keine wiederholten visuellen Volltests in S1-S3;
  - Harness, Server und Browser-Session über zusammenhängende S4-/S5-Blöcke
    wiederverwenden;
  - Desktop-, Mobile-, Reload-, Offline-, Race- und A11y-Nachweise bündeln;
  - Android-Prozess-Reclaim nur einmal nach grüner Desktop-/Disposable-Matrix
    und nur am Device-Gate ausführen.
- Startprompt:

```text
Arbeite die Roadmap
`docs/MIDAS Activity V2 R8 Core Commit and Android Recovery Integration Roadmap.md`
gemäß ihrer Ausführungs-Chat-Startkarte ab.

Lies die festgelegten Quellen in der angegebenen Reihenfolge, prüfe den realen
Git-, Runtime-, SQL- und Toolstand und beginne mit S1. Führe die freigegebene
Discovery Wave S1 bis einschließlich S4R deterministisch aus. Schließe S1, S2,
S3 und S4R jeweils separat mit Full Review, Findings-Korrektur, Statusmatrix,
Evidence-Sync und aktualisierter Session Resume Card ab. Fahre bei bestandenem
Internal Continuation Gate ohne Rückfrage fort. Stoppe nur bei einem echten
Owner-Gate, Quellenwiderspruch, Scope-Ausweitung, blockierendem Finding oder
fehlendem belastbarem Nachweis.

Unveränderliche Grenzen: Activity V1 bleibt der einzige produktive Consumer;
Draft v3 bleibt unverändert; kein Dual-Write, kein produktiver V2-Cutover, keine
synthetische produktive Trainingssession und kein physisches Löschen des R7-
Recovery-Slots. Vor jedem Remote-Commit muss ein exakter Commit-Intent mit
derselben request_id und vollständig eingefrorener Payload persistent bestätigt
sein. Ein unbekannter Ausgang bleibt gesperrt und darf nur identisch wiederholt
werden. Beginne in der Discovery Wave noch nicht mit Produktcodeänderungen.
Ende nach S4R mit Readiness-Urteil und sicheren S4-Ausführungsblöcken; S4
benötigt einen separaten Auftrag.
```

## Session Resume Card

- Session-Freeze:
  - `2026-08-10 22:31 Europe/Vienna`; bewusster Tagesabschluss nach dem rund
    50-minütigen Block E;
  - Block E / S4.9-S4.10 ist vollständig `DONE/PASS`; es läuft kein lokaler
    Harnessserver und es sind keine Browser-Harness-Tabs offengeblieben;
  - Git-Freeze: Branch `main`, unveränderter HEAD
    `1e0294f0f514eec9b08b9b4f3e8e57d435d0bdd6`; der vorhandene Worktree enthält
    die beabsichtigten, noch nicht remote committeten R8-Änderungen S4.1-S4.10
    und darf beim Wiedereinstieg weder bereinigt noch zurückgesetzt werden;
  - letzte grüne Baseline: Activity-V2-Contracts 167/167, JS-Syntax 17/17,
    Katalog `2/80/47/58`, Diff-/Produktload-/Activity-V1-/Draft-v3-Guards
    `PASS`.
- Fortsetzung am 2026-08-11:
  - Pflichtkontext und realer Git-/Runtime-/SQL-/Android-/Browser-/Toolstand
    erneut vollständig aufgebaut; Branch `main` und HEAD `1e0294f0…bdd6`
    unverändert, beabsichtigter R8-Worktree erhalten;
  - S4.11 und S4.12 separat `DONE/PASS`; finale Block-F-Baseline 175/175
    Contracts, 21/21 rekursive Activity-V2-Syntaxchecks plus Isolationstool 1/1,
    Katalog `2/80/47/58`, Android Debug-/Release-Build sowie Produkt-/V1-/
    Draft-v3-/Secret-/Diff-Guards PASS.
  - S5 bis zum Android-Device-Gate deterministisch ausgeführt: finale lokale
    Matrix 179/179, Syntax 21/21, Isolation 7/0/0/0/0/0/1, Katalog
    `2/80/47/58`, Android Debug/Release, Diff und Whitespace PASS;
  - frisches PostgreSQL-17.6-SQL-22-Full-Fixture einschließlich Rerun,
    Rollback und Races PASS; Endstand 78/80/0 und 0/0/0, Wegwerf-DB
    anschließend unwiederbringlich entfernt und lokaler Stack gestoppt;
  - versionierte lokale Test-PWA: All-/Unknown-/identischer Retry-,
    Preparing-/Committing-Freeze-, 1440/390/320-, echter 32-Sekunden-
    Background- und Offline-Reload-/Retry-Nachweis PASS; Browser und Server
    anschließend geschlossen;
  - produktiver Read-only-Preflight belegte kanonisches R2 und 0/0/0 Historie;
    nach der in diesem Chat erteilten Owner-Freigabe wurde ausschließlich SQL
    22 mit Forward-SHA-256 `429520e5…b3d0e3` ausgeführt. Postcondition ist
    kanonisches R8 `7cdabca3…5177e`, weiterhin 78/80/0 und 0/0/0; kein
    Sessioncall, Deploy, Cutover oder Activity-V1-Write.
- Ziel:
  - R7-Draft v3 verlustsicher und idempotent über R2 in Activity V2 committen
    und Recovery/Abschluss testgebunden unter Android-PWA-Prozessverlust
    beweisen.
- Unveränderliche Verträge:
  - Activity V1 bleibt produktiv; R12 bleibt Cutover;
  - Draft v3 bleibt unverändert; Commit-Intent liegt außerhalb des Drafts;
  - kein Netzwerk vor persistiertem Intent, identischer Retry bei Unknown;
  - Erfolg löscht nicht physisch, sondern schreibt R7-Tombstone.
- Erledigter Stand:
  - R1-R7/C2 sind DONE;
  - R2-Commit- und R7-Recovery-Lücke wurde contract-reviewed;
  - S1 hat Pflichtquellen, Git-/Runtime-/SQL-/Toolstand und Produktisolation
    vollständig verifiziert;
  - lokale Node-/Katalogbaseline, produktiver Read-only-Abgleich und guarded
    PostgreSQL-17-Zwei-Versionen-Fixture sind grün;
  - S2 hat Mapper, Intent/Envelope, Recovery-/Commit-APIs, State Machine,
    SQL-22-Grenze und isolierte Android-Lane exakt eingefroren.
  - S3 hat alle 17 Red-Team-Flächen geprüft und fünf Concurrency-/Recovery-/
    Retry-/Rollbacklücken F-ACT-R8-17 bis -21 im Vertrag geschlossen.
  - S4R hat zwölf Substeps, sechs sichere Batches, Invalidation, Evidence,
    Rollback und Owner-Gates vollständig zugeordnet; Urteil `READY_FOR_S4`.
  - S4.1/S4.2 implementieren den privaten Mapper-/Zeit-/Intent-Core mit exakter
    R6-/R2-Projektion; Block A ist separat reviewt und grün.
  - S4.3/S4.4 implementieren Envelope v2, v1-Kompatibilität, Quarantäne sowie
    Intent-/Attempt-CAS und synchronen Mutationslock; Block B ist separat
    reviewt und grün.
  - S4.5 implementiert den isolierten Commit-Coordinator mit exakter API,
    One-Promise-State-Machine, Preparation-/Attempt-Reihenfolge und
    Destroy-Epoch; Full Review `PASS`.
  - S4.6 implementiert Known-/Unknown-, identische Replay-, Release-Pending-
    und Cleanup-Pfade; Full Review `PASS`.
  - S4.7 implementiert die additive versionsgebundene Semantikinjektion im
    Data Access bei unverändertem v1-Default und identischem RPC-Body; Full
    Review `PASS`.
  - S4.8 implementiert den ausschließlich funktionsgebundenen SQL-22-Forward,
    den exakt inversen R2-Rollback, R2/R8-Source- und Struktur-/ACL-Guards
    sowie die guarded PostgreSQL-17-Full-Fixture; Block D ist separat reviewt
    und grün.
  - S4.9 integriert den explizit injizierten Commit-Coordinator ausschließlich
    in die isolierte Shell; Finish/Retry, Fokus, Timerfreeze, sichere View-
    Close-Pfade und A11y sind separat reviewt und grün.
  - S4.10 liefert einen isolierten Commit-/Fault-Harness mit realem Recovery-,
    Commit- und Shellmodul, kontrollierten Storage-/Responsefehlern, Reload
    sowie persistenten Zwei-/Drei-Tab-Attempt-CAS-Races; Block E ist separat
    reviewt und grün.
  - S4.11 liefert die debug-only App-ID `de.schabuss.midas.activityv2test`,
    ausschließlich debuggebundene localhost-/Cleartext-Ressourcen, eine
    installierbare lokal gebundene Test-PWA mit eigenem Worker-Scope und das
    owner-gatete Android-/ADB-Reverse-Runbook; Full Review `PASS` nach
    F-ACT-R8-41.
  - S4.12 liefert den ausführbaren Gesamtisolationsguard, vier direkte
    Integrationscontracts und payloadfreie Data-Access-Diagnostik; der gesamte
    S4-Diff ist nach F-ACT-R8-42 full-reviewed und grün.
- Aktueller Schritt:
  - `S6 DONE; R8 DONE_WITH_OWNER_ACCEPTED_EVIDENCE_GAP`;
  - `S5 durch D-ACT-R8-42 geschlossen: T16 und T19 NOT EXECUTED, nicht PASS`;
  - `nächstes erlaubtes Rolling-Wave-Gate: R9; Produktcutover bleibt R12`.
- Nächster erlaubter Schritt:
  - eine eigene R9-Rolling-Wave-Roadmap für Session History, Detail,
    Correction und Deletion aus dem abgeschlossenen R8-Vertrag ableiten;
  - T16/T19 nur mit neuem explizitem Auftrag nachholen; R9 darf sie nicht als
    PASS voraussetzen und R12 behält den finalen Android-/Produkt-Smoke;
  - kein App-Data-Clear, Uninstall, physisches Recovery-Delete, Dual-Write oder
    Zugriff auf Produkt-App-Daten.
- Offene Findings:
  - `none`; F-ACT-R8-15 bis -61 sind geschlossen;
  - T16/T19 sind dokumentierte, owner-akzeptierte Evidence-Lücken und keine
    offenen Codefindings oder behaupteten PASS-Nachweise.
- Geänderte Dateien:
  - neu `session-commit.js` und `session-commit.contract.test.js`;
  - geändert `session-recovery.js` und `session-recovery.contract.test.js`;
  - geändert `data-access.js` und `data-access.contract.test.js`;
  - neu SQL 22 Forward, exakter Rollback und guarded SQL-22-Fixture;
  - geändert `sql/HOW_TO.md`;
  - geändert `session-shell.js`, `session-shell.css` und Shellcontracts;
  - neu isolierter `session-commit-harness` in HTML/CSS/JS, kontrollierter
    Harness-Adapter und Harnesscontracts;
  - neu lokale `test-pwa` mit eigenem Manifest/Worker/Bootstrap/Icon/CSS,
    `local-test-pwa.contract.test.js` und Android-/PWA-Runbook;
  - geändert nur `android/app/build.gradle.kts` sowie neu ausschließlich
    `android/app/src/debug/AndroidManifest.xml` und Debug-Strings; `src/main`
    bleibt unverändert;
  - neu `isolation.contract.test.js` und
    `tools/activity-v2-r8-isolation.mjs`; Data-Access-Diagnostik auf stabile
    Operation/Code/Status reduziert und zugehörige Contracts gehärtet;
  - diese Roadmap und zugehörige Evidence.
- Gültige Nachweise:
  - EV-ACT-R8-B01 bis -B06, EV-ACT-R8-C01 bis -C07 und
    EV-ACT-R8-R01 bis -R17 sowie EV-ACT-R8-Q01 bis -Q08 samt separaten
    S1-/S2-/S3-/S4R-Full-Reviews;
  - EV-ACT-R8-A01/-A02 und EV-ACT-R8-L01 für S4.1/S4.2;
  - EV-ACT-R8-A03/-A04 und EV-ACT-R8-L02 für S4.3/S4.4;
  - EV-ACT-R8-A05/-A06 und EV-ACT-R8-L03 für S4.5/S4.6;
  - EV-ACT-R8-A07 und EV-ACT-R8-L04 für S4.7;
  - EV-ACT-R8-A08 und EV-ACT-R8-L05 für S4.8;
  - EV-ACT-R8-A09/-A10 und EV-ACT-R8-L06 für S4.9/S4.10;
  - EV-ACT-R8-A11 und EV-ACT-R8-L07 für S4.11;
  - EV-ACT-R8-A12 und EV-ACT-R8-L08 für S4.12;
  - archivierte R2-EV-L01 bis -L04, R7-EV-ACT-R7-L01 bis -L10 und HCR-017 bis
    -025 nur gemäß S1-Invalidation-Map.
- Runtime-/Deploy-Stand:
  - der additive öffentliche Source-Namespace `sessionCommit.create` ist im
    isolierten Modul vollständig, bleibt aber ohne Produkt-/Service-Worker-
    Scriptload oder Commitpfad; Activity V1 bleibt einziger produktiver
    Consumer;
  - SQL 22 und Rollback sind source-complete und in der disposable PG17-Lane
    vollständig grün; der lokale Stack und die Testdatenbank sind entfernt;
  - der Commit-/Fault-Harness und die Test-PWA sind ausschließlich lokal und
    payloadfrei; lokaler HTTP-Server und Browser-Prüftabs sind geschlossen;
  - Debug-Merge: `de.schabuss.midas.activityv2test` plus lokales Cleartext;
    Release-Merge: `de.schabuss.midas` ohne Cleartext. Kein APK-Deploy und kein
    Device wurde mutiert; der freigegebene ADB-Preflight sah 0 Geräte, daher
    gab es keine Installation, Reverse-Regel oder Prozessaktion;
  - produktiv ist ausschließlich SQL 22 vollzogen: Commit-RPC-Source R8,
    Katalog v1/v2/andere = 78/80/0 und Sessions/Items/Sets = 0/0/0;
    Owner/Search Path/ACL/RLS/Policies unverändert, kein Web-/APK-Deploy.
- Offene Owner-Freigaben:
  - produktive SQL-Freigabe wurde nach frischem S5-Preflight exakt für SQL 22
    verbraucht; Rollback bleibt ein neues separates Owner-Gate;
  - T19 wurde trotz erteilter Freigabe mangels Gerät nicht ausgeführt und durch
    D-ACT-R8-42 für den R8-Abschluss deferred; ein späterer Nachlauf braucht
    einen neuen Auftrag;
  - R9-Korrektur-/Löschwrites sowie R12-Produktcutover und finaler Android-
    Smoke erhalten ihre eigenen Gates.
- Stop-Bedingungen:
  - keine weitere produktive Aktion oder Rollback ohne neues Gate; Android nur
    in der bereits freigegebenen debug-only T19-Lane und nur bei exakt einem
    autorisierten ADB-Gerät;
  - Quellenwiderspruch, Scope-Ausweitung, blockierendes Finding oder fehlender
    belastbarer Isolationsnachweis stoppen die autonome Fortsetzung.

### Nächster Ausführungs-Chat - Block-F-Startkarte

Diese Karte ist der verbindliche Re-Entry nach dem Freeze vom
`2026-08-10 22:31 Europe/Vienna`. Sie ersetzt nicht die ursprüngliche
Ausführungs-Chat-Startkarte, sondern setzt deren bewiesenen Stand ab S4.11 fort.

- Kontextaufbau in dieser Reihenfolge, vor jeder Sourceänderung:
  1. `docs/Future trainingsmodule update thoughts.md` als vollständigen
     Activity-V2-Masterplan lesen, mit besonderem Fokus auf R8, O-8, R12 und
     die Produktcutover-Grenze;
  2. diese R8-Roadmap vollständig lesen, beginnend mit Metadaten,
     ursprünglicher Startkarte und aktueller Session Resume Card, danach
     Zielvertrag, Decisions, Scope, Referenzen, Gates, Status/Findings,
     S4R sowie alle S4.1-S4.10-Abschlüsse und S4.11-S5;
  3. `docs/MIDAS Activity V2 R8 Core Commit and Android Recovery Integration
     Evidence.md` vollständig lesen;
  4. anschließend alle unter `Referenzen / Pflicht in S1` aufgeführten Quellen
     in der dortigen Reihenfolge lesen; R7- und R2-Roadmap samt Evidence
     vollständig, R6 mindestens für Draft-v3-, Editor-, Timer- und
     Lifecyclefragen;
  5. für Block F zusätzlich den realen Android-/Gradle-/Manifest-/Resource-
     Stand, vorhandene lokale Harness-/PWA-Artefakte, Produktindex, Service
     Worker, Activity-V1-Grenze und alle Activity-V2-Runtime-/Contractdateien
     prüfen;
  6. zuletzt `git status --short`, HEAD, relevanten Diff, Node-/Katalog-
     Baseline und verfügbare Android-/Browser-/Toolchain real verifizieren.
- Eingefrorener Ausgangspunkt:
  - Branch `main`, HEAD `1e0294f0f514eec9b08b9b4f3e8e57d435d0bdd6`;
  - S4.1-S4.10 und Blöcke A-E `DONE/PASS`; F-ACT-R8-15 bis -40 geschlossen,
    keine blockierenden Findings;
  - Baseline 167/167 Contracts, 17/17 Syntax, Katalog `2/80/47/58`;
  - der bestehende Worktree ist beabsichtigt und bleibt erhalten.
- Freigegebener autonomer Block:
  - S4.11 und danach bei bestandenem internen Gate ohne Rückfrage S4.12;
  - beide mit `GPT-5.6 Sol / High`;
  - S4.11 und S4.12 jeweils separat mit Full Review, Findings-Korrektur,
    Statusmatrix, Evidence-Sync und aktualisierter Session Resume Card
    abschließen.
- Block-F-Grenzen:
  - S4.11 erzeugt ausschließlich debug-/lokal gebundene Test-PWA-/Android-
    Seams; `android/app/src/main`, Release-Identität, Produkt-URL,
    Produktcredentials, Produktindex, produktiver Service Worker und Activity
    V1 bleiben unverändert;
  - keine Android-Device-Verbindung, Installation, Force-Stop, Prozess-
    Reclaim, App-Data-Clear oder Uninstall in S4;
  - keine produktive Supabase-Mutation, kein produktives SQL, kein Deploy und
    keine synthetische produktive Trainingssession;
  - keine Secrets im Repo oder in Evidence; lokale Konfiguration bleibt
    temporär und testgebunden;
  - kein physisches Recovery-Delete, kein Dual-Write, kein Activity-V2-Cutover;
    persistierter exakter Commit-Intent und identischer Unknown-Retry bleiben
    unverändert.
- Abschluss:
  - nach S4.12 Full Review und Readiness-Urteil für S5 ausgeben;
  - harter `STOP vor S5`; S5, produktives SQL und Android-Device-Nachweise
    benötigen jeweils den dafür vorgesehenen Folgeauftrag beziehungsweise das
    Owner-Gate.

Startprompt:

```text
Setze die Roadmap
`docs/MIDAS Activity V2 R8 Core Commit and Android Recovery Integration Roadmap.md`
am Session-Freeze vom 2026-08-10 22:31 Europe/Vienna fort.

Verwende GPT-5.6 Sol mit Reasoning High. Baue den Kontext vor Änderungen in
der Reihenfolge der „Nächster Ausführungs-Chat - Block-F-Startkarte“ vollständig
neu auf: Lies zuerst den gesamten Activity-V2-Masterplan
`docs/Future trainingsmodule update thoughts.md`, danach die gesamte R8-Roadmap
einschließlich aktueller Session Resume Card, anschließend die vollständige
R8-Evidence und danach alle in der Roadmap festgelegten Pflichtreferenzen in
der angegebenen Reihenfolge. Prüfe anschließend den realen Git-, Worktree-,
Runtime-, Android-/Gradle-, Browser-, Node-, Katalog-, SQL-Source- und Toolstand.
Bewahre den beabsichtigten bestehenden R8-Worktree; setze nichts zurück.

Führe Block F mit S4.11 „Lokale Test-PWA- und Android-Seams“ und danach bei
bestandenem internen Gate ohne Rückfrage S4.12 „Integrierte Isolation und
Delta-Härtung“ deterministisch als autonomen Block aus. Schließe S4.11 und
S4.12 jeweils separat mit Full Review, Findings-Korrektur, Statusmatrix,
Evidence-Sync und aktualisierter Session Resume Card ab.

Unveränderliche Grenzen: Activity V1 bleibt der einzige produktive Consumer;
Draft v3 bleibt unverändert; kein Dual-Write oder produktiver Activity-V2-
Cutover; keine synthetische produktive Trainingssession; kein physisches
Löschen des R7-Recovery-Slots; kein Remote-Commit vor bestätigter Persistenz
des exakten Commit-Intents; Unknown darf nur mit identischer request_id und
identischer Payload wiederholt werden. S4.11 darf nur debug-/lokal gebundene
Test-PWA-/Android-Seams anlegen. Main/Release, Produkt-URL, Produktcredentials,
Produktindex, produktiver Service Worker und Activity V1 bleiben unverändert.
Keine Android-Device-Aktion, kein produktives SQL, kein Deploy und kein Secret
im Repo.

Stoppe nur bei einem echten Owner-Gate, Quellenwiderspruch, einer Scope-
Ausweitung, einem blockierenden Finding oder fehlendem belastbarem Nachweis.
Beende den Auftrag nach bestandenem S4.12 mit Readiness-Urteil für S5 und einem
harten STOP vor S5. S5 benötigt einen separaten Folgeauftrag.
```

## Zielvertrag

Prüfbares Endergebnis:

- Ein vollständiger Strength-, Duration-, Distance- oder Mixed-Draft v3 wird
  deterministisch in genau eine gültige `midas.activity-session.v1`-Payload
  abgebildet.
- `ended_at` und `duration_min` werden beim ersten gültigen Abschlussversuch
  genau einmal erzeugt; die exakte Request-ID und Payload werden vor Netzwerk
  atomar im Recovery-Envelope v2 persistiert.
- Gleicher Commit-Intent kann nach Reload, Prozessverlust, Timeout oder
  verlorenem Response identisch erneut gesendet werden.
- `not_committed` gibt den unveränderten Draft nach sicherem Intent-Cleanup
  wieder zur Bearbeitung frei; `unknown` sperrt Bearbeiten und Verwerfen.
- Bestätigter `created`- oder `replayed`-Erfolg überführt den lokalen Slot
  persistent in einen Generationstombstone. Cleanupfehler behalten den Intent
  und erlauben einen identischen Replay plus erneuten Cleanup.
- R2-Commit akzeptiert jeden vorhandenen unveränderlichen Katalogsnapshot, auf
  den der Draft exakt verweist, und validiert jedes Item gegen genau diese
  Version statt gegen `max(catalog_version)`.
- Die isolierte Desktop-/Browsermatrix sowie ein testgebundener Android-PWA-
  Smoke beweisen Background, Reload, Prozess-Reclaim, Resume und Abschluss.
- R8 bleibt nicht produktiv sichtbar. Es gibt keinen Activity-V1-Write, keine
  Historienkorrektur, keinen Export-, Doctor-, Protein- oder Cutover-Umbau.

Bewusst unverändert:

- `midas.activity-session-draft.v3`, R1/C2-Katalogidentitäten und vorhandene
  Katalogsnapshots;
- R2-Datenmodell, Session-/Item-/Settabellen, Ownership, RLS und direkte
  Tabellen-DML-Grenzen;
- Activity V1, produktive `index.html`, Navigation, Service Worker, Widget,
  Doctor View, Trendpilot und Protein Target;
- R9 Historie/Korrektur/Löschung, R10 Export, R11 Doctor View, R12 Cutover und
  R13 vorbereiteter Sessionimport.

## Problem und Ist-Zustand

- R7 schützt den bearbeitbaren Draft, kennt aber keinen Remote-Commit-Intent.
- R2 ist idempotent, wenn Request-ID und kanonische Payload identisch bleiben.
- Wird ein Commit serverseitig erfolgreich, aber der Response geht verloren,
  würde eine neu erzeugte `ended_at`-Zeit eine andere Payload und damit einen
  Idempotenzkonflikt erzeugen.
- R2 validiert aktuell nur gegen die höchste Katalogversion. Ein älterer,
  unveränderlicher und korrekt wiederhergestellter Draft kann dadurch allein
  wegen eines späteren Katalogrollouts uncommitbar werden.
- Leere R5-Default-Satzzeilen sind Eingabehilfen, keine ausgeführte Leistung.
  Ohne expliziten Mapper könnten sie als ungültige oder falsche Historie
  behandelt werden.
- R7 wurde im Browser bewiesen, aber noch nicht zusammen mit Commit und einem
  realistischen Android-PWA-Prozessverlust.

## Entscheidungslog

<!-- markdownlint-disable MD013 -->

| ID | Datum | Entscheidung | Warum | Betrifft |
| --- | --- | --- | --- | --- |
| D-ACT-R8-01 | 2026-08-10 | S1-S4R läuft als autonome Discovery Wave; S4 benötigt einen neuen Auftrag. | Vollständige Detektivarbeit ohne künstliche Chatpausen, aber klare Codegrenze. | Startkarte, S1-S4R |
| D-ACT-R8-02 | 2026-08-10 | R8 bleibt isoliert und testgebunden; R12 bleibt der einzige Produkt-Cutover. | Commit-Sicherheit darf Activity V1 nicht vorzeitig ersetzen. | Scope |
| D-ACT-R8-03 | 2026-08-10 | Der fachliche Draft bleibt exakt `midas.activity-session-draft.v3`. | Commitkontrolle ist keine neue Trainingssemantik. | Draft, Recovery |
| D-ACT-R8-04 | 2026-08-10 | R7-Recovery erhält einen Envelope v2 mit optionalem `commit_intent`; bekannte Envelope-v1-Records bleiben lesbar. | Commitmetadaten gehören außerhalb des Drafts und bestehende Drafts dürfen nicht verloren gehen. | Storage |
| D-ACT-R8-05 | 2026-08-10 | Neu unter R8 gestartete Sessions schreiben Envelope v2 ab dem ersten Recovery-Write. Bestehende Envelope-v1-Drafts bleiben bei Read, Continue und normalem Autosave v1 und werden erst beim expliziten Abschlussversuch CAS-geschützt in v2 überführt; Draft, Request-ID und Katalogversion bleiben identisch. | Kein stilles Upgrade bestehender Drafts, aber ein eindeutiger Schreibvertrag für neue R8-Sessions. | Recovery, Migration |
| D-ACT-R8-06 | 2026-08-10 | Der Commit-Intent v1 enthält Schema-ID, Request-ID, Draftrevision, Katalogversion, Vorbereitungszeit und die exakte normalisierte R2-Payload; keine Authdaten oder Secrets. | Identischer Retry und Diagnose ohne zweite Datenquelle. | Commit Intent |
| D-ACT-R8-07 | 2026-08-10 | Kein Netzwerkaufruf beginnt, bevor `flush()`, atomare Commit-Intent-Persistenz und der zugehörige persistente Attempt-Claim bestätigt sind. | Servererfolg darf nie ohne lokalen Retry- und Concurrencyvertrag entstehen. | Pipeline |
| D-ACT-R8-08 | 2026-08-10 | Jeder Retry verwendet byte-inhaltlich dieselbe normalisierte Request-ID/Payload; Zeiten und Zahlen werden nicht neu berechnet. | R2-Fingerprint und Idempotenz bleiben stabil. | Retry |
| D-ACT-R8-09 | 2026-08-10 | `ended_at` ist die einmalige UTC-Zeit des ersten gültigen Finish-Klicks; `duration_min = max(1, Math.round((ended-started)/60000))`. | Exakte Zeit bleibt erhalten, die Ganzzahl bildet die nächstliegende volle Minute ab. | Zeitvertrag |
| D-ACT-R8-10 | 2026-08-10 | Negative Zeitdifferenz oder gerundete Dauer über 1440 blockiert sichtbar; kein Clamp und keine manuelle Zeitkorrektur in R8. | Keine stille Fälschung der Sessiondauer. | Validierung |
| D-ACT-R8-11 | 2026-08-10 | R8 setzt `title` auf `null`; die Sessionnotiz wird als optionale getrimmte `note` abgebildet. | Es existiert noch kein Titel-UX-Vertrag. | Payload |
| D-ACT-R8-12 | 2026-08-10 | Leere Strength-Satzzeilen werden ausgelassen; vollständige Sätze werden in sichtbarer Reihenfolge lückenlos neu nummeriert. Partial/invalid blockiert; ein Strength-Item ohne vollständigen Satz blockiert. | Platzhalter sind keine Leistung, ausgewählte Items dürfen aber nicht still verschwinden. | Mapper |
| D-ACT-R8-13 | 2026-08-10 | Non-Strength-Felder werden ausschließlich nach gespeicherter Katalogpolicy normalisiert; verbotene, fehlende Pflicht- oder ungültige Werte blockieren fail-closed. | Katalogsnapshot bleibt Semantikquelle. | Mapper |
| D-ACT-R8-14 | 2026-08-10 | Deutsche Kommazahlen werden deterministisch in die R2-Zahlenform überführt; Rohtext bleibt nur im Draft. | Gym-Eingabe und Datenbankvertrag bleiben getrennt. | Parser |
| D-ACT-R8-15 | 2026-08-10 | Genau eine Commit-Promise darf aktiv sein; Doppelklicks koaleszieren oder bleiben deaktiviert. | Keine parallelen Writes oder divergierenden Zustände. | Coordinator |
| D-ACT-R8-16 | 2026-08-10 | Lokale Contract-/Validierungsfehler erzeugen keinen Intent. Ein sicherer `not_committed`-Ausgang darf den Intent nur im ersten, weiterhin allein gehaltenen Attempt persistent freigeben; nach konkurrierendem oder wiederaufgenommenem Attempt bleibt der Ausgang konservativ `unknown`. | Nur ein zweifelsfrei konkurrenzfreier Nicht-Write darf wieder editierbar werden. | Fehlervertrag |
| D-ACT-R8-17 | 2026-08-10 | Transportabbruch, Timeout nach Dispatch, malformed Success oder nicht sicher klassifizierbarer Fehler gilt als `unknown`; Draft und Intent bleiben gesperrt erhalten. | Servererfolg kann nicht ausgeschlossen werden. | Fehlervertrag |
| D-ACT-R8-18 | 2026-08-10 | Unknown erlaubt nur identischen Retry oder Schließen der UI; Bearbeiten, Verwerfen, neue Session und neue Payload bleiben gesperrt. | Kein Doppelcommit und kein Verlust eines möglicherweise geschriebenen Datensatzes. | UX, Recovery |
| D-ACT-R8-19 | 2026-08-10 | Bestätigter `created`/`replayed`-Erfolg schreibt den tokenrotierten Generationstombstone. Physisches Record-Delete bleibt verboten. | Alte Tabs dürfen den abgeschlossenen Draft nicht wiederbeleben. | Cleanup |
| D-ACT-R8-20 | 2026-08-10 | Scheitert der Tombstone nach Servererfolg, bleibt der persistierte Intent erhalten; ein identischer Replay wird erneut bestätigt und Cleanup wiederholt. | Servererfolg darf nicht als lokaler Vollerfolg behauptet werden. | Cleanup, Retry |
| D-ACT-R8-21 | 2026-08-10 | Recoverycontroller wird additiv um explizite Commit-Intent-Operationen erweitert; bestehende R7-Methoden und Managed-Draft-Semantik bleiben kompatibel. | Commit-CAS gehört zum Recovery-Owner, nicht in eine zweite unkoordinierte IDB-Schicht. | API |
| D-ACT-R8-22 | 2026-08-10 | Eine getrennte `sessionCommit`-Koordination besitzt Mapper, Zustandsmaschine und R2-Aufruf; sie erfindet keine zweite Storage- oder Draftquelle. | Trennung von Trainingsdraft, Persistenz und Remote-Workflow. | Architektur |
| D-ACT-R8-23 | 2026-08-10 | `commitSession` erhält additive explizite Semantikinjektion; der bisherige v1-Default bleibt rückwärtskompatibel. | Ein Draft muss gegen seine eigene Katalogversion normalisiert werden. | Data Access |
| D-ACT-R8-24 | 2026-08-10 | Der Server validiert neue Sessions gegen die vom Client genannte vorhandene Katalogversion, nicht gegen `max`; Replays werden weiterhin vor der Katalogprüfung erkannt. | Unveränderliche ältere Drafts bleiben während Rollouts commitfähig. | SQL, O-8 |
| D-ACT-R8-25 | 2026-08-10 | R8 ändert keine Katalogzeile. Vollständigkeit und Unveränderlichkeit von v1/v2 werden vor und nach SQL separat geprüft. | Kompatibilität darf keinen Snapshot umschreiben. | SQL |
| D-ACT-R8-26 | 2026-08-10 | SQL 22 ersetzt nur den bestehenden Commit-RPC kontrolliert und reassertiert Owner, leeren Search Path und minimale Execute-ACL; Tabellen/RLS/DML bleiben unverändert. | Kleinstmögliche produktive Wirkung und sichere Wiederholbarkeit. | SQL, Security |
| D-ACT-R8-27 | 2026-08-10 | Disposable E2E verwendet lokale Testuser und Testdaten; produktiv wird keine synthetische Session erzeugt. | Medizinische Produktionshistorie bleibt sauber. | Evidence, S5 |
| D-ACT-R8-28 | 2026-08-10 | Android bevorzugt eine lokale testgebundene PWA über `localhost`/ADB-Reverse und disposable Supabase. Die konkrete Lane wird in S4R nach Tool-Preflight eingefroren. | Prozess-Reclaim ohne produktive Trainingsdaten oder versteckten Produktload. | Android |
| D-ACT-R8-29 | 2026-08-10 | R8 besitzt Evidence; lange SQL-, Race-, Browser- und Device-Nachweise werden dort einmalig geführt. | R3-Evidence-Vertrag und Tokenökonomie. | QA |
| D-ACT-R8-30 | 2026-08-10 | Produktives SQL und Android-Device-Aktionen sind getrennte Owner-Gates; kein Gate wird aus lokaler Autonomie abgeleitet. | Externe Wirkung bleibt bewusst. | S5 |
| D-ACT-R8-31 | 2026-08-10 | SQL 22 reassertiert Function-Owner, leeren Search Path und minimale Execute-ACL selbst. `sql/16_Explicit_Grants.sql` bleibt unverändert, sofern S1-S4R keinen realen Vertragsdrift beweist. | Kein unnötiger zweiter Migrationspfad für denselben Function-ACL-Vertrag. | SQL, Scope |
| D-ACT-R8-32 | 2026-08-10 | Ein sicherer Remote-`not_committed`-Ausgang wird bei lokal gescheitertem Intent-Release als `release_pending` gesperrt. Retry wiederholt nur `releaseCommit` und niemals den Remoteaufruf. | Bekannter Nicht-Commit darf weder zum ungeschützten Editieren noch zu einem unnötigen Netzwerk-Retry führen. | Recovery, State Machine |
| D-ACT-R8-33 | 2026-08-10 | Die Android-R8-Lane verwendet eine debug-only Application-ID/Datensandbox, localhost-Resource und ausschließlich debuggebundene Cleartextfreigabe. | Der Prozess-Reclaim-Nachweis darf weder Produktorigin noch native Produktcredentials oder Produkt-App-Daten berühren. | Android, QA |
| D-ACT-R8-34 | 2026-08-10 | Envelope v2 persistiert neben dem unveränderlichen Intent einen CAS-geschützten `commit_attempt`. Jeder logische Remoteversuch claimt ihn vor Dispatch mit steigender Attemptnummer und neuem Token. Release ist nur für den weiterhin allein gehaltenen ersten Attempt erlaubt; Complete verlangt den aktuell gehaltenen Claim. | Observation-CAS allein serialisiert keine Netzwerklaufzeit. Ein alter Tab darf den Intent nicht freigeben, während ein anderer identisch committet. | Recovery, Multi-Tab |
| D-ACT-R8-35 | 2026-08-10 | `finish()` koalesziert synchron, wartet zuerst auf einen belegten Recovery-Flush und bildet danach in einem JS-Turn Snapshot, Validierung, Clock und Intent. `prepareCommit()` setzt vor seinem ersten Await einen transienten Mutations-/Discardlock und prüft Snapshot, Queue und Observation erneut. | Mutation zwischen Flush und Intenttransaktion darf weder eine veraltete Payload noch einen ungeschützten Autosave erzeugen. | Recovery, Coordinator |
| D-ACT-R8-36 | 2026-08-10 | Unbekannte Recoveryschemas sowie malformed v2-/Intent-/Attempt-Records werden quarantänisiert: read-only `blocked`, kein normaler Discard, Tombstone oder Start-New. Nur ein beweisbar intentfreier v1-/v2-Record folgt dem bisherigen R7-Discardvertrag. | Ein möglicherweise unbekannter Commit-Intent darf nicht durch Fehlerbehandlung gelöscht werden. | Recovery, Security |
| D-ACT-R8-37 | 2026-08-10 | „Ein Remoteversuch“ bezeichnet eine logische, koaleszierte `commitSession`-Operation unter einem Attempt-Claim. Die bestehende R2-Transportpolicy darf darin höchstens zwei sequenzielle Dispatches mit demselben einmal serialisierten Body ausführen; parallele oder neu berechnete Requests bleiben verboten. | R2 `maxAttempts: 2` muss mit dem One-Promise-/Identical-Retry-Vertrag präzise vereinbar sein. | Data Access, Retry |
| D-ACT-R8-38 | 2026-08-10 | SQL 22 akzeptiert vor Replacement ausschließlich den eingefrorenen kanonischen R2-Preimage oder den eigenen R8-Rerun-Stand. Ein separates, reviewtes Rollback-SQL stellt ausschließlich den exakten R2-RPC samt Owner/Search-Path/ACL wieder her; produktive Ausführung und Rollback bleiben getrennt owner-gated. | Drift darf nicht überschrieben werden, und eine produktive Functionänderung braucht einen präzisen inversen Pfad. | SQL, Rollback |
| D-ACT-R8-39 | 2026-08-10 | S4.1/S4.2 implementieren Mapper, Zeit und Intent als privaten Core in `session-commit.js`; die öffentliche `sessionCommit.create`-API wird erst mit dem vollständigen Coordinator in S4.5 registriert. Contracttests instrumentieren ausschließlich eine VM-Kopie. | Ein unfertiger öffentlicher Finishpfad darf weder produktiv sichtbar noch mit einer temporären API festgeschrieben werden. | Commit Core, Isolation |
| D-ACT-R8-40 | 2026-08-10 | Draft- und Endzeit müssen zusätzlich zur kanonischen ISO-Form exakt in der realen R2-Jahresdomäne `0001..9999` liegen. Eine injizierte Clock außerhalb dieser Domäne ist `INVALID_CLOCK`; ein Draft mit solcher Startzeit ist `INVALID_DRAFT`. | JavaScripts `Date` akzeptiert Jahr 0000 und erweiterte sechsstellige Jahre, der reale R2-Parser nicht. | Zeit, R2-Kompatibilität |
| D-ACT-R8-41 | 2026-08-10 | Der private Commit-Core verwendet ausschließlich die payloadfreien Codes `INVALID_DRAFT`, `INVALID_SEMANTICS`, `CATALOG_VERSION_MISMATCH`, `EMPTY_SESSION`, `UNKNOWN_ITEM`, `INACTIVE_ITEM`, `INVALID_ITEM_VALUE`, `INVALID_SET_VALUE`, `INVALID_TIME`, `INVALID_CLOCK` und `INVALID_COMMIT_INTENT` plus das tiefgefrorene exakte Fokusziel. | S4.5 muss lokale Ergebnisse deterministisch in State/UX abbilden können, ohne Rohwerte oder fremde Fehlertexte zu übernehmen. | Error Contract, Coordinator |
| D-ACT-R8-42 | 2026-08-11 | Der Owner beendet die S5-Langläufer nach grüner technischer Kernmatrix und setzt S6 fort. T16 erhält keinen erfundenen CodeRabbit-Null-Ausgang; T19 bleibt mangels ADB-Gerät `NOT EXECUTED`. R8 schließt als `DONE_WITH_OWNER_ACCEPTED_EVIDENCE_GAP`, R9 darf beginnen, R12 behält Produktcutover und finalen Android-Smoke. | Zwei Stunden S5, wiederholtes externes Rate-Limit und kein sichtbares ADB-Gerät rechtfertigen eine bewusste Owner-Risikoannahme, nicht eine falsche PASS-Deklaration. | S5/S6, Evidence, R9/R12 |

<!-- markdownlint-enable MD013 -->

## Owner-Briefing-Bedarf

- Erklärmodus:
  - `Briefing + S6-Recap`.
- Neue oder entscheidungsrelevante Konzepte:
  - Commit-Intent als „eingefrorener Briefumschlag“ vor dem Versand;
  - Unterschied zwischen sicher `not_committed` und unbekanntem Ausgang;
  - identischer Retry statt neuem Save;
  - lokaler Supabase-/Android-Test versus produktiver Cutover.
- Geplante Briefing-Gates:
  - S4R vor Umsetzung;
  - vor produktivem SQL;
  - vor Android-Prozess-Reclaim;
  - S6-Recap in Alltagssprache.
- Nicht erneut zu erklären:
  - normale JS-/CSS-Syntax, Standard-Nodechecks oder gewöhnliche Harness-
    Darstellung.

## Scope und Grenzen

In Scope:

- strikter Draft-v3-zu-R2-Payload-Mapper;
- Recovery-Envelope v2 und persistenter Commit-Intent;
- Commitzustandsmaschine, Unknown-/Retry-/Cleanup-Vertrag;
- additive Semantikinjektion in `commitSession`;
- begrenzte SQL-22-Kompatibilitätsänderung am Commit-RPC;
- isolierte Shell-Finish-/Status-/Retry-Integration;
- deterministic Fault-Injection-, Browser-, disposable Supabase- und
  testgebundene Android-PWA-Nachweise;
- QA-, Module-Overview-, HOW-TO- und Masterplan-Sync nach bewiesenem Ergebnis.

Nicht in Scope:

- produktiver Activity-V2-Scriptload, Navigation oder Cutover;
- Activity-V1-Mutation oder Dual-Write;
- Historie, Detail, Korrektur oder Löschung abgeschlossener Sessions;
- Coachingexport, Doctor View, Protein Target, Trendpilot oder Reports;
- vorbereiteter Trainingsplanimport;
- Cross-Device-Draftsync, Verschlüsselungs-Key-Lifecycle oder Cloud-Backup;
- manuelle Zeitkorrektur, Pause, 1RM, RPE, Warm-up, Dropset, Superset,
  Progression oder Zielwerte;
- Web-/Edge-/APK-Deploy.

Roadmap-spezifische Guardrails:

- kein Remote-Dispatch ohne bestätigten persistenten Commit-Intent;
- kein zweiter Requestbody für dieselbe Intent-ID;
- kein editierbarer oder verwerfbarer Unknown-Zustand;
- kein Entfernen des R7-Tombstone-/Lease-/Generation-Schutzes;
- keine produktive Testsession;
- keine neue Abhängigkeit ohne S4R-Finding und Owner-Gate.

## Scope-Freeze vor S4

- Bestehende Features:
  - Activity V1 und alle produktiven Consumer bleiben unverändert;
  - Activity V2 bleibt über isolierte Harness-/Testpfade erreichbar.
- Datenmodell, Lifecycle und Retention:
  - DB-Tabellen unverändert;
  - Recovery-Envelope v1 wird lesekompatibel um v2/Commit-Intent ergänzt;
  - Draft v3 unverändert;
  - bestätigter Abschluss erzeugt Tombstone, kein physisches Delete.
- Cleanup, Scheduler, Secrets und externe Automationen:
  - kein Scheduler, Cron, Push oder Secret;
  - lokale Testcredentials bleiben temporär und werden nicht dokumentiert.
- Kompatible Producer und Consumer:
  - R6/R7 Draft und Recovery;
  - R2 `dataAccess.commitSession` und SQL-RPC;
  - isolierte Session-Shell/Harnesses;
  - R12 übernimmt später ausschließlich den bewiesenen Vertrag.
- Offene Grundsatzfragen:
  - `none`; S1-S4R dürfen technische Iststandsdetails und die konkrete
    disposable Android-Lane präzisieren, aber keinen Produktvertrag ändern.
- Umgang mit späterem Scope-Wechsel:
  - kleine technische Korrektur gezielt in S2/S3/S4R;
  - Produktload, neue Datenwirkung oder abweichender Lifecycle erfordert
    Follow-up-Roadmap beziehungsweise R12.

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
- `docs/archive/MIDAS Activity V2 R7 IndexedDB Draft Recovery Roadmap (DONE).md`
- `docs/archive/MIDAS Activity V2 R7 IndexedDB Draft Recovery Evidence (DONE).md`
- `docs/archive/MIDAS Activity V2 R2 Unified Database and Commit API Roadmap (DONE).md`
- `docs/archive/MIDAS Activity V2 R2 Unified Database and Commit API Evidence (DONE).md`
- `docs/qa/health-capture-reports.md`
- `sql/20_Activity_V2.sql`, `sql/21_Activity_V2_Catalog_V2.sql`,
  `sql/16_Explicit_Grants.sql`, `sql/HOW_TO.md`
- `app/modules/vitals-stack/activity/v2/*.js`, `*.contract.test.js` und
  vorhandene Harnesses

Nur bei konkreter Vertragsfrage:

- archivierte R3-R6-Roadmaps;
- `docs/modules/Supabase Core Overview.md`;
- `docs/modules/Android Widget Module Overview.md` zur Abgrenzung, nicht als
  R8-Änderungspfad;
- aktuelle offizielle Supabase-Dokumentation für Database Functions, RLS,
  Search Path und Funktionsprivilegien.

## Tool Permissions und Gates

Allowed:

- lokale Datei-, Git-, Node-, Deno-, SQL-Source- und Toolchain-Reads;
- `node --test`, `node --check`, Katalogcheck, Diff-/Lint-/Linkchecks;
- Docker Desktop und lokaler Supabase-Stack für disposable Testdaten;
- lokale Browser-/PWA-Harnesses und kontrollierte Fault Injection;
- produktive Supabase-Abfragen ausschließlich read-only und ohne sensible
  Rohdaten in Logs/Evidence;
- Roadmap-, Evidence-, QA- und Source-of-Truth-Edits im jeweiligen Schritt.

User-gated:

- produktives SQL beziehungsweise jede produktive Datenbankmutation;
- Android-Device-Verbindung, Installation, Force-Stop, Prozess-Reclaim und
  sonstige Gerätemutation;
- Web-/Edge-/APK-Deploy;
- Produktload, Navigation, Service Worker oder Activity-V1-Änderung.

Forbidden:

- Secrets, Passwörter, JWTs oder echte Gesundheitsrohpayloads ausgeben oder
  committen;
- fremde Worktree-Änderungen zurücksetzen;
- produktive Testsession oder Cleanup über noch nicht definierte R9-Pfade;
- Security-Definer-Hardening, RLS, ACL oder Grants still lockern;
- Scope, Datenwirkung oder Architektur still erweitern.

## Statusmatrix

<!-- markdownlint-disable MD013 -->

| ID | Schritt | Reasoning | Status | Kompaktes Ergebnis |
| --- | --- | --- | --- | --- |
| S1 | System- und Vertragsdetektivarbeit | `Extra High` | DONE | Pflichtquellen, Git/Runtime/SQL/Tools und Isolation real belegt; Full Review PASS. |
| S2 | Commit-, Recovery-, Daten- und UX-Zielvertrag | `Extra High` | DONE | Mapper, Intent, APIs, Zustände, SQL und Testlane exakt eingefroren; Full Review PASS. |
| S3 | Datenverlust-, Concurrency-, Security- und Umsetzungsreview | `Extra High` | DONE | 17 Flächen geprüft; F-ACT-R8-17..21 vertraglich korrigiert; Full Review PASS. |
| S4R | S4 Readiness Review | `Extra High` | DONE | READY_FOR_S4; zwölf Substeps, sechs Batches, Evidence, Rollback und Gates vollständig; Full Review PASS. |
| S4 | Umsetzung | `High / Extra High je Block` | DONE | Blöcke A bis F einschließlich S4.12 separat DONE/PASS; harter STOP vor S5. |
| S4.1 | Draft-v3-Mapper und Abschlussvalidierung | `High` | DONE | privater Core, 10 direkte Mapper-/Consumerchecks, Full Review PASS. |
| S4.2 | Zeitvertrag und Commit-Intent | `High` | DONE | ein Clockread, exakte R2-Zeitdomäne, Intent Create/Validate/Freeze, 5 direkte Checks, Full Review PASS. |
| S4.3 | Recovery-Envelope v2 und v1-Kompatibilität | `Extra High` | DONE | v2 exakt; v1 Read/Continue/Autosave/Discard kompatibel; Commit-Truth-Quarantäne; Full Review PASS. |
| S4.4 | Intent-/Attempt-CAS und Mutationslock | `Extra High` | DONE | fünf additive persistent-first Operationen, synchroner Lock, Attempt-Claim und Tombstone; Full Review PASS. |
| S4.5 | Commit-Coordinator und One-Promise-State-Machine | `Extra High` | DONE | exakte API/States, koaleszierte Promise, persistierter Intent und Claim vor Dispatch, Destroy-Epoch; Full Review PASS. |
| S4.6 | Known-, Unknown-, Replay- und Cleanup-Pfade | `Extra High` | DONE | sichere Fehlerklassen, Attempt-1-Release, Unknown-/Cleanup-Replay und Bestätigungsgrenzen; Full Review PASS. |
| S4.7 | Versionsgebundene Semantikinjektion in Data Access | `Extra High` | DONE | additive exakte Option, v1-Default, v1/v2-Request-/Responsebindung und unveränderter Body; Full Review PASS. |
| S4.8 | SQL-22-Katalogkompatibilität, Hardening und Rollback | `Extra High` | DONE | kontrollierter Forward, exakter R2-Rollback, R2/R8-/Struktur-/ACL-Guards und PG17-Full-Fixture; Full Review PASS. |
| S4.9 | Isolierte Shell-Finish- und Retry-Integration | `Extra High` | DONE | explizite Injection, vollständige UX-State-Matrix, intentgebundener Timerfreeze, View-Close ohne Discard und A11y; Full Review PASS. |
| S4.10 | Commit- und Fault-Injection-Harness | `Extra High` | DONE | realer isolierter Modulharness, kontrollierte Faults, Reload und 2-/3-Tab-CAS-Races; Full Review PASS. |
| S4.11 | Lokale Test-PWA- und Android-Seams | `High` | DONE | debug-only App-ID/URL/Cleartext, eigener lokaler PWA-Worker-Scope und owner-gatetes Runbook; Full Review PASS. |
| S4.12 | Integrierte Isolation und Delta-Härtung | `High` | DONE | ausführbarer Gesamtguard, payloadfreie Diagnostik und Full Review des gesamten S4-Diffs; PASS. |
| S5 | Tests, SQL-/Runtime-/Device-Gates und Abschlussreview | `Extra High` | CLOSED BY OWNER / EVIDENCE GAP ACCEPTED | T01-T15, T17-T18 und pre-device T20 PASS; F43-F61 geschlossen. T16 finaler Null-Lauf und T19 Device-Smoke `NOT EXECUTED`, nicht PASS. |
| S6 | Doku-Sync, Recap und Archiv | `High` | DONE | Source-of-Truth-Sync, HCR-026, SQL-Iststand, Changelog, Recap, Full Review und Archivierung abgeschlossen. |

<!-- markdownlint-enable MD013 -->

## Findings

<!-- markdownlint-disable MD013 -->

| ID | Severity | Typ | Status | Entscheidung / Zielschritt |
| --- | --- | --- | --- | --- |
| F-ACT-R8-01 | P0 | Contract | fixed | Verlorener Success-Response hätte mit neuem `ended_at` einen Idempotenzkonflikt erzeugt; persistenter Commit-Intent vor Netzwerk ist D-ACT-R8-06 bis -08. |
| F-ACT-R8-02 | P1 | SQL | fixed | Max-only-Katalogprüfung blockiert ältere unveränderliche Drafts; versionsgebundene Prüfung ist D-ACT-R8-24/-25 und S4.8. |
| F-ACT-R8-03 | P1 | Contract | fixed | R5-Leerzeilen durften nicht als Leistung persistiert oder Items still ausgelassen werden; Mappervertrag D-ACT-R8-12/-13. |
| F-ACT-R8-04 | P1 | Time | fixed | Rundung und Wiederholungszeit waren mehrdeutig; einmalige UTC-Zeit und `Math.round` sind D-ACT-R8-09/-10. |
| F-ACT-R8-05 | P1 | Recovery | fixed | Physisches Löschen nach Commit hätte Tombstone-Schutz aufgehoben; D-ACT-R8-19/-20. |
| F-ACT-R8-06 | P1 | Compatibility | fixed | Envelope-v1-Bestand und Draft v3 waren nicht explizit übernehmbar; D-ACT-R8-04/-05. |
| F-ACT-R8-07 | P1 | UX/Concurrency | fixed | Unknown durfte weder editierbar noch verwerfbar bleiben; D-ACT-R8-17/-18. |
| F-ACT-R8-08 | P1 | Code | fixed | `commitSession` ist aktuell an Semantik v1 gebunden; additive Injektion mit v1-Default ist D-ACT-R8-23. |
| F-ACT-R8-09 | P1 | QA | fixed | Android-Success-Smoke drohte produktive Testdaten zu erzeugen; disposable lokale Test-PWA ist D-ACT-R8-27/-28. |
| F-ACT-R8-10 | P1 | Scope | fixed | Core-Commit hätte als vorgezogener Produktcutover missverstanden werden können; R12-Grenze ist D-ACT-R8-02. |
| F-ACT-R8-11 | P2 | Process | fixed | S4-Implementierung und S5-Runtime-Nachweise waren zunächst vermischt; Roadmap trennt Source/Harnessbau in S4 und Vollmatrix/Gates in S5. |
| F-ACT-R8-12 | P1 | Security | fixed | `CREATE OR REPLACE FUNCTION` muss Owner, leeren Search Path und Execute-ACL erneut beweisen; D-ACT-R8-26 und EV-Gates. |
| F-ACT-R8-13 | P1 | Contract | fixed | Eine beliebige teilweise Katalogversion ist ohne Manifest nicht vollständig erkennbar. R8 validiert deshalb alle verwendeten Items, Status und Policies exakt gegen die angeforderte Version; Snapshotvollständigkeit bleibt C2-/Katalogpflegevertrag. |
| F-ACT-R8-14 | P1 | Recovery/UX | fixed | Close/Escape durfte bei `unknown` oder `cleanup_pending` nicht indirekt R7-Discard auslösen. Die Ansicht darf schließen, Intent und Draft bleiben jedoch persistent und gesperrt. |
| F-ACT-R8-15 | P1 | Android/QA | fixed (contract) | Der reale Android-Stand besitzt nur `src/main`, dieselbe Application-ID und eine feste Produkt-URL. S4.11 muss deshalb eine ausschließlich debuggebundene Variante mit eigener Application-ID/Datensandbox, localhost-URL und nur dort erlaubtem Cleartext bereitstellen; Produkt-URL, Produkt-Credentials und Main-/Release-Manifest bleiben unverändert. Device-Aktionen bleiben S5-owner-gated. |
| F-ACT-R8-16 | P1 | Recovery/State | fixed (contract) | Ein sicherer `not_committed`-Remoteausgang mit lokal gescheitertem `releaseCommit` war keinem eigenen Zustand zugeordnet. `release_pending` hält Intent und Draft gesperrt, erlaubt ausschließlich identisches lokales Release-Cleanup ohne Netzwerk und wird erst nach Transaction-Complete zu `not_committed`. |
| F-ACT-R8-17 | P0 | Multi-Tab/Concurrency | fixed (contract) | Vollständiger Observation-CAS schützt Storagewrites, aber nicht einen parallelen Netzwerklauf: ein Tab hätte nach Known-Fehler den Intent freigeben können, während ein anderer denselben Intent noch committet. D-ACT-R8-34 ergänzt den persistenten Attempt-Claim und beschränkt Release auf den allein gehaltenen ersten Attempt. |
| F-ACT-R8-18 | P1 | Recovery/Concurrency | fixed (contract) | Zwischen beendetem `flush()` und asynchroner Intentpersistenz konnte eine Managed-Draft-Mutation einen veralteten Intent oder nachlaufenden Autosave erzeugen. D-ACT-R8-35 friert Reihenfolge und synchronen Preparation-Lock ein. |
| F-ACT-R8-19 | P0 | Recovery/Security | fixed (contract) | Der R7-Blocked-Pfad konnte unbekannte oder malformed Records weiterhin tombstonen; unter R8 könnte darin ein nicht interpretierbarer Commit-Intent liegen. D-ACT-R8-36 quarantänisiert diese Records ohne Discard. |
| F-ACT-R8-20 | P1 | Retry/Contract | fixed (contract) | „Genau ein Remoteversuch“ war gegenüber realem R2 `maxAttempts: 2` mehrdeutig. D-ACT-R8-37 trennt eine logische Operation von höchstens zwei seriellen Transportdispatches mit identischem Body. |
| F-ACT-R8-21 | P1 | SQL/Rollback | fixed (contract) | Function-Replacement und allgemeiner Rollbackhinweis belegten weder den akzeptierten Preimage noch einen exakten inversen Pfad. D-ACT-R8-38 verlangt Source-Guard, Rerun-Guard und ein separates minimales Rollback-SQL. |
| F-ACT-R8-22 | P1 | Mapper/Focus | fixed (implementation) | Der erste S4.1-Entwurf validierte Sessionnote/Startzeit vor sichtbaren Item-/Setfehlern und hätte damit bei mehrfach beschädigtem Input die eingefrorene Fokuspriorität verletzt. Die Reihenfolge ist jetzt Draftform -> Semantik/Katalog -> Items/Sets/Felder -> Sessionnote/Startzeit und per kombiniertem Fehlerfixture belegt. |
| F-ACT-R8-23 | P1 | Time/Compatibility | fixed (implementation) | Reines `Date.parse`/`toISOString` hätte Jahr 0000 oder erweiterte sechsstellige Jahre akzeptiert, obwohl R2 vierstellige Jahre ab 0001 verlangt. D-ACT-R8-40 und Boundarytests schließen den Drift vor Intentbildung. |
| F-ACT-R8-24 | P1 | Recovery/Compatibility | fixed (implementation) | Der erste S4.3-Übergangsschutz hätte Store-nahe Sonderpfade für einen v2-zu-v1-Downgrade beziehungsweise einen normalen v1-Discard als v2 offenlassen können. Aktive Records und Tombstones erzwingen jetzt die erlaubte Versionsrichtung; nur `prepareCommit` migriert einen aktiven v1-Draft. |
| F-ACT-R8-25 | P1 | Recovery/Integrity | fixed (implementation) | Eine nur äußere Intentprüfung hätte formgültige, aber gegenüber dem Draft veränderte Payloadzahlen oder Itemnotizen als Commit-Wahrheit akzeptieren können. v2-Inspection bindet Dauer, Reihenfolge, normalisierte Draftzahlen und ASCII-btrim-Itemnotizen jetzt exakt an den gespeicherten Draft. |
| F-ACT-R8-26 | P1 | Recovery/Concurrency | fixed (implementation) | Ein direkter Store-Metadatenwrite hätte den Intent auch nach Attempt >1 auf `null` setzen können. Die Transition selbst erlaubt Release nur aus dem persistenten Attempt 1; der Controller verlangt zusätzlich den lokal gehaltenen aktuellen Claim. |
| F-ACT-R8-27 | P2 | Recovery/Lifecycle | fixed (implementation) | Ein nach `destroy()` spät abgewiesener Commit-Metadatenwrite hätte den terminalen Controller wieder als `degraded` publizieren können. Commitoperationen tragen nun die Controller-Epoch und dürfen nach Destroy weder Zustand noch Subscriber reaktivieren. |
| F-ACT-R8-28 | P2 | Recovery/Input Hardening | fixed (implementation) | Intent-, Attempt- oder Draftobjekte mit Accessor-Properties hätten vor der JSON-Sicherheitsprüfung ausgelesen werden können. Commitmetadaten und Store-Drafts werden jetzt vor jedem Feldzugriff descriptorbasiert geschützt geklont; Accessoren werden ohne Getter-Aufruf abgelehnt. |
| F-ACT-R8-29 | P1 | Coordinator/Lifecycle | fixed (implementation) | Ein Subscriber konnte beim veröffentlichten `committing` reentrant `destroy()` ausführen; ohne erneuten Epochcheck wäre danach im selben Stack trotzdem der Remoteaufruf gestartet. Der Coordinator prüft den aktiven Vorgang jetzt unmittelbar nach Publish und der Regressionstest belegt null Dispatches. |
| F-ACT-R8-30 | P1 | Commit/Recovery | fixed (implementation) | Ein formal gültiger, aber gegenüber dem einmal erzeugten Kandidaten veränderter `prepareCommit()`-Rückgabewert hätte als persistierter Intent akzeptiert werden können. Bestätigung und Kandidat müssen jetzt strukturell exakt identisch sein; sonst bleibt der Intent gesperrt und es gibt keinen Claim/Dispatch. |
| F-ACT-R8-31 | P1 | Recovery/State | fixed (implementation) | Bloße Promise-Erfüllung von `releaseCommit()` oder `completeCommit()` hätte bei einem vertragswidrigen Ergebnis `not_committed` beziehungsweise `committed` veröffentlicht. Nur `null` beziehungsweise Recovery-State `destroyed` bestätigen den Übergang; andernfalls bleibt `release_pending`/`cleanup_pending`. |
| F-ACT-R8-32 | P2 | Security/Contract | fixed (implementation) | Fremde Dependency-Fehler konnten beliebige `code`-Strings als State-Reason durchreichen und Fokusaccessoren ausführen. Commitcodes sind jetzt allowlisted; Fokus-, Flush- und Ergebnisfelder werden nur als eigene Datenproperties gelesen. |
| F-ACT-R8-33 | P2 | State/Retry | fixed (implementation) | Nach erfolgreichem rein lokalem `release_pending`-Retry ging der belegte Known-Code verloren. Der Coordinator hält ihn nur flüchtig bis zur bestätigten Freigabe und stellt ihn im finalen `not_committed`-State wieder her, ohne Payload oder ID zu speichern. |
| F-ACT-R8-34 | P1 | Data Access/Integrity | fixed (implementation) | Eine Response-Itemversion war nur an den erneut gelesenen injizierten Katalog gebunden. Bei veränderlicher Injection hätte sie dadurch von der Request-Katalogversion abweichen können. Response-Items und gebundener Semantikkatalog müssen jetzt zusätzlich exakt `request.payload.catalog_version` entsprechen; die einmal descriptorbasiert gebundenen Methoden gelten für Request und Response. |
| F-ACT-R8-35 | P2 | Data Access/Input Hardening | fixed (implementation) | Der bisherige Commit-Optionscheck über `Object.keys` konnte Symbol-Extras übersehen und Accessoren auslesen. Commitoptionen erlauben jetzt über `Reflect.ownKeys` exakt zwei oder drei eigene Datenproperties; Options- und Semantikmethoden-Accessoren werden ohne Getter-Aufruf abgelehnt. |
| F-ACT-R8-36 | P2 | SQL/Portability | fixed (implementation) | Der erste SQL-22-Guard qualifizierte `coalesce` fälschlich als `pg_catalog.coalesce`, obwohl es PostgreSQL-Syntax und keine qualifizierbare Funktion ist. Der erste disposable Lauf rollte atomar zurück; Forward und Rollback verwenden jetzt das gültige unqualifizierte Konstrukt und bestehen Fresh/Rerun/Rollback. |
| F-ACT-R8-37 | P2 | SQL/Fixture Lifecycle | fixed (implementation) | Der erste vollständige S4.8-Harness hielt den v1/v2-Vorher-Snapshot in einer temporären Tabelle; die für echte dblink-Races nötige `\connect`-Grenze beendete deren Sessionlebensdauer. Der Snapshot liegt jetzt ausschließlich im wegwerfbaren `midas_fixture`-Schema, wird nach der Postcondition explizit entfernt und die Full-Fixture endet sauber bei 78/80/0 und 0/0/0 Historie. |
| F-ACT-R8-38 | P2 | Shell/A11y | fixed (implementation) | Nach terminalem Commit konnte der Fokus auf dem nun ausgeblendeten Finish-/Retry-Button verbleiben. Die Shell verschiebt ihn deterministisch auf den weiterhin erlaubten Close-Button; Contract und gesamte Shellmatrix sind erneut grün. |
| F-ACT-R8-39 | P1 | Shell/Compatibility | fixed (implementation) | Die Shell akzeptierte nur die exakte achtteilige R7-Recovery-API und lehnte dadurch den realen additiven R8-Controller beim Harness-Mount ab. Sie allowlistet jetzt exakt die unveränderte R7- oder die vollständige dreizehnteilige R8-Oberfläche; beliebige Extras bleiben fail-closed. |
| F-ACT-R8-40 | P2 | Harness/Truthfulness | fixed (implementation) | Der erste Browser-Harness meldete Setupfehler nur generisch und bezeichnete einen persistent blockierten Intentfehler missverständlich als Retry-Erfolg. Payloadfreie `failure_stage`/`failure_code`-Diagnose und die korrigierte Blocked-/No-Dispatch-Erwartung machen Ergebnis und Ursache deterministisch, ohne IDs oder Payloads offenzulegen. |
| F-ACT-R8-41 | P1 | PWA/Isolation | fixed (implementation) | Beim ersten Besuch konnte ein bereits registrierter übergeordneter lokaler Produkt-Service-Worker noch veraltete Activity-V2-Module liefern, bevor der engere Test-Worker die Seite kontrollierte. Der versionierte localhost-Bootstrap lädt den Harness jetzt erst nach belegter Kontrolle durch exakt seinen eigenen Worker; ein fremder oder alter Controller kann keine Modul-Mischversion mehr starten. |
| F-ACT-R8-42 | P1 | Diagnostics/Privacy | fixed (implementation) | Data Access übernahm bislang beliebige Transport-/Serverdetails in den Diagnosekanal. Eine Fremdexception hätte dadurch `request_id` oder Payloadfragmente in lokalen Logs hinterlassen können. Diagnostik projiziert jetzt ausschließlich stabile Operation, Domaincode und numerischen HTTP-Status; Sentinel-Contracts belegen, dass weder ID noch Payloadtext austritt. |
| F-ACT-R8-43 | P1 | Recovery/Promise Boundary | fixed (S5 review) | `beginCommitAttempt` und `releaseCommit` erzeugten Save-Optionen vor der Promise-Fehlergrenze. Snapshotfehler bleiben jetzt asynchron, erreichen den Store nicht und sind durch einen direkten Regressionstest belegt. |
| F-ACT-R8-44 | P2 | Shell/Focus | fixed (S5 review) | Ein geschlossener View konnte ein verzögertes Commit-Aktionsfokusziel behalten. Close und geschlossene State-Patches löschen den Marker, bevor ein späteres Open Fokus übernehmen kann. |
| F-ACT-R8-45 | P2 | Harness/State | fixed (S5 review) | Preparing-/Committing-Evidence konnte nach Abschluss der asynchronen Operation durch den Live-Subscriber überschrieben werden. Beide Fixtures deaktivieren Live-Publish jetzt vor `finish()` und bleiben dennoch über den aktiven Kontext aufräumbar. |
| F-ACT-R8-46 | P2 | Recovery/Test Robustness | fixed (S5 review) | Das Malformed-Intent-Fixture hing von einer bestimmten ersten Setform ab. Es verändert nun direkt die persistierte Payloaddauer und prüft dieselbe Draft-/Intent-Bindung ohne Formannahme. |
| F-ACT-R8-47 | P2 | SQL/Fixture Secret Hygiene | fixed (S5 review) | Das disposable Fixture enthielt die lokale Default-DB-Passwortzeichenfolge. SQL und Evidence sind credential-frei; die lokale Neuverbindung erhält das temporäre Credential nur aus der laufenden Container-Umgebung. |
| F-ACT-R8-48 | P2 | SQL/Volatility | fixed (S5 review) | Der Fixture-Helper für zeitabhängige Payloads war fälschlich `IMMUTABLE`. Er ist jetzt `STABLE`; Fresh/Rerun/Rollback/Race-Full-Fixture auf PostgreSQL 17.6 bleibt grün. |
| F-ACT-R8-49 | P2 | Documentation | fixed (S5 review) | Der S4-Entscheidungsbereich endete textuell bei D-ACT-R8-38, obwohl -39 bis -41 bereits verbindlich waren. Die Pflichtentscheidungsspanne ist auf -03 bis -41 synchronisiert. |
| F-ACT-R8-50 | P2 | PWA/Cache Contract | fixed (S5 review) | HTML-CSS-Requests und Worker-Cachekeys verwendeten zunächst unterschiedliche Query-URLs. Alle lokalen Assets tragen jetzt denselben S5-Token und werden contractseitig paarweise verglichen. |
| F-ACT-R8-51 | P2 | PWA/Path Contract | fixed (S5 review) | Der localhost-Guard akzeptierte nur den Slash-Pfad. Exakt `test-pwa`, `test-pwa/` und `test-pwa/index.html` sind erlaubt; alle anderen Pfade bleiben blockiert, alle drei Einstiege sind im Browser grün. |
| F-ACT-R8-52 | P1 | Harness/Lifecycle | fixed (S5 CodeRabbit) | `settlePersistedSlot()` schloss Recovery auf Retry-/Discard-/Fehlerpfaden nicht garantiert. Verschachtelte `try/finally` zerstören Coordinator vor Recovery und schließen den Store in jedem Ausgang. |
| F-ACT-R8-53 | P2 | Harness/Compatibility | fixed (S5 CodeRabbit) | Fehlende optionale v1-Semantik wurde als `undefined` statt `null` weitergereicht. Der Resolver normalisiert v1 jetzt explizit auf `null`; v2 und unbekannte Versionen bleiben unverändert. |
| F-ACT-R8-54 | P1 | Harness/PWA Determinism | fixed (S5 browser) | Reale 11-Sekunden-Proben deckten sowohl das Subscriber-Fenster als auch wiederverwendbare unversionierte Modul-URLs auf. Publish ist vor `finish()` eingefroren, alle Harness-/PWA-Assets werden bei jeder Änderung gemeinsam versioniert; der aktuelle Token ist `r8-s5-3`, Worker-Cache `v5`. |
| F-ACT-R8-55 | P2 | Contract Invalidation | fixed (S5 final rerun) | Der Isolationstest erwartete nach F-ACT-R8-54 noch die unversionierte Adapter-URL. Die Erwartung bindet nun exakt den lokalen S5-Token; die Gesamtmatrix war danach wieder vollständig grün. |
| F-ACT-R8-56 | P1 | Recovery/Promise Boundary | fixed (S5 CodeRabbit) | `prepareCommit()` erzeugte Save-Optionen nach dem synchronen Lock, aber vor der Promise-Fehlergrenze. Die Optionen werden jetzt vor dem Lock im geschützten Block erzeugt; Snapshotfehler bleiben rejected Promises, schreiben nicht und lassen den Draft editierbar. |
| F-ACT-R8-57 | P2 | PWA/Diagnostics | fixed (S5 CodeRabbit) | `loadHarness()` lag im Worker-Registrierungs-Catch und meldete Modulfehler fälschlich als Registrierungsfehler. Registrierung/Controller und Modulload haben jetzt getrennte terminale Diagnosepfade. |
| F-ACT-R8-58 | P2 | Harness/Error Boundary | fixed (S5 CodeRabbit) | Fehlende Dashboard-Knoten konnten im globalen Harness-Catch eine zweite Exception auslösen. Dispose, DOM-Publish und payloadfreier Frozen-Snapshot-Fallback sind jetzt jeweils geschützt; der Handler endet ohne neue Rejection. |
| F-ACT-R8-59 | P2 | PWA/Offline Lifecycle | fixed (S5 CodeRabbit) | Der Worker konnte bei fehlendem Navigation-Fallback `undefined` an `respondWith` liefern und einen Cache-Write ungebunden lassen. Er liefert nun mindestens `Response.error()` und bindet abgefangene Cache-Writes an `event.waitUntil`. |
| F-ACT-R8-60 | P2 | Documentation | fixed (S5 CodeRabbit) | Der historische Konsistenzabschnitt nannte noch 31 Decisions. Nach D-ACT-R8-42 umfasst der finale Entscheidungslog 42 Einträge; die Zahl ist synchronisiert. |
| F-ACT-R8-61 | P2 | Documentation | fixed (S5 CodeRabbit) | Die S4-Readiness-Tabelle vermischte bei einzelnen Substeps `DONE/PASS` mit echten Owner-Gates. Eine eigene Statusspalte trennt nun den vollständigen S4-Abschluss von `none`, dem SQL-S4-Verbot und dem Device-S4-Verbot. |

<!-- markdownlint-enable MD013 -->

## Initialer Contract Review

- Reviewumfang:
  - Root- und Templateverträge;
  - Activity-V2-Masterplan sowie archivierte R1-R7/C2-Roadmaps;
  - R1-Semantik, R2-Commit/RPC, R7-Recovery und aktuelle lokale Source;
  - Supabase-Function-, RLS- und ACL-Verträge;
  - Fresh-Chat-, Scope-, Security-, Recovery-, SQL- und Testbarkeitssicht.
- Ergebnis:
  - `PASS - ready for execution chat`;
  - keine offenen In-Scope-P0/P1-Findings;
  - S1-S4R kann als autonome Discovery Wave starten;
  - S4 bleibt bis zum Readiness-Gate und einem neuen Owner-Auftrag gesperrt.
- Im Review korrigiert:
  - eindeutiger Envelope-v1/v2-Migrationsvertrag;
  - realistisch beweisbare Katalogvalidierung ohne erfundenes Manifest;
  - persistentes Close-/Escape-Verhalten nach unklarem Commit-Ausgang;
  - SQL-22-Eigenverantwortung ohne vorsorgliche Änderung an SQL 16.
- Geprüfte Konsistenz:
  - 42 Entscheidungen (D-ACT-R8-01 bis -42);
  - 12 kleine S4-Substeps;
  - getrennte lokale, disposable, produktive und Device-Evidence;
  - kein Produktcutover, keine Activity-V1-Mutation und kein produktiver
    Testdatensatz ohne Owner-Gate.

---

## S1 - System- und Vertragsdetektivarbeit

Reasoning: `GPT-5.6 Sol / Extra High`.

Deterministisch:

1. Pflichtreferenzen in der Startkarten-Reihenfolge lesen.
2. Git-Status, aktuelle Activity-V2-Dateien, Scriptgrenze, Contracttests und
   Katalogcheck erfassen.
3. Draft-v3-Felder, Editorparser, Validierungszustände und Shell-Lifecycle am
   realen Code kartieren.
4. R7-Envelope, Store-/CAS-API, Controller-/Managed-Draft-API, Tombstone,
   Recoverygate und Failure States exakt erfassen.
5. R2-Request-/Response-/Fehlerform, Retrygrenze, Semantikbindung und
   Idempotenzvertrag exakt erfassen.
6. SQL 20/21/16 auf aktuelle Katalogprüfung, RPC-Signatur, Owner, Search Path,
   ACL, RLS, Tabellen-DML und Rerun-Vertrag prüfen.
7. Produktiven Supabase-Iststand read-only erfassen: vorhandene
   Katalogversionen/Zähler, RPC-Attribute/ACL, Sessionzähler und keine
   produktiven Rohpayloads.
8. Lokalen Supabase-/Docker-/psql-Pfad und eine disposable Zwei-Versionen-
   Fixture verifizieren, ohne Schemaänderung vorzunehmen.
9. Browser-, In-App-Browser-, lokaler HTTP-/PWA-, ADB-/Android- und
   `adb reverse`-Stand prüfen. Keine Device-Aktion ohne Gate.
10. R7-/R2-Evidence nur auf weiterhin gültige, wiederverwendbare IDs prüfen;
    invalidierte Nachweise markieren statt blind wiederholen.
11. Systemkarte, Evidence-Baseline, Findings und Invalidation Map schreiben.
12. Full Contract Review, Findings-Korrektur, Statusmatrix und Resume Card.

Ergebnis:

- Systemkarte:
  - exakte Producer-/Consumer-/Storage-/RPC-/SQL-/Harness-Grenzen.
- Betroffene Schichten:
  - Draftmapper, Recovery, Commitkoordination, Data Access, Shell, SQL-RPC,
    disposable Runtime und Android-Testlane.
- Belegte Verträge:
  - R2, R6, R7, C2 und Produktisolation.
- Offene Fragen:
  - nur technische Findings; keine Owner-Grundsatzfrage erwartet.
- Doku-Sync:
  - S6, außer ein blockierender Source-of-Truth-Widerspruch erfordert sofortige
    Korrektur.

Exit: Reale APIs, Katalogstände, SQL-Hardening, Testtools und Produktgrenzen
sind ohne Annahme kartiert.

### S1-Abschluss - 2026-08-10

- Systemkarte:
  - Producer: R6 `sessionDraft` erzeugt exakt Draft v3; R7 `sessionRecovery`
    besitzt den einzigen persistenten Draft und liefert den Managed Draft an die
    isolierte R7-Shell.
  - Geplanter R8-Pfad: Draft v3 -> neuer `sessionCommit`-Mapper/Coordinator ->
    Commit-Intent im Recovery-Envelope v2 -> R2
    `dataAccess.commitSession` -> PostgREST ->
    `public.activity_v2_commit_session(uuid,jsonb)` -> drei normalisierte
    Activity-V2-Historientabellen.
  - Storage-Owner: ausschließlich R7-IndexedDB
    `midas_activity_v2_recovery` v1, Store `session_recovery`, Slot
    `active_session`; bestehender Envelope v1 hat noch keinen Commit-Intent.
  - Server-Owner: R2-RPC ist der einzige V2-Writepfad; Tabellen besitzen für
    `authenticated` nur SELECT und keine direkte DML-Berechtigung.
  - Consumergrenze: Produkt lädt ausschließlich Activity V1 mit
    `activity_add/list/delete`; kein Produkt-, Service-Worker- oder
    Navigationspfad referenziert Activity V2.
- Reale Implementierungslücken für S4:
  - keine `sessionCommit`-API und kein Draft-v3-zu-R2-Abschlussmapper;
  - Recovery kennt nur Envelope v1 und keine Intent-CAS-Operationen;
  - Data Access bindet Commit-Request und Commit-Response fest an Semantik v1;
  - Shell besitzt keine explizite Finish-/Commit-Injection;
  - SQL 20 validiert neue Requests gegen `max(catalog_version)`;
  - Android besitzt noch keine isolierte lokale R8-Debugvariante.
- Baseline:
  - Activity-V2-Contracts `119/119 PASS`, keine Fehler/Skips/TODOs;
  - `node --check` `12/12 PASS`;
  - Katalogcheck `PASS`: Version 2, 80 Einträge, 47 Alias-Appends, 58 Suchfälle,
    Runtime und SQL konsistent;
  - guarded PostgreSQL-17-Fixture `20 -> 21 -> 16`, Rerun, v2-Commit,
    Cross-Version-Lookup und Cleanup `PASS`;
  - produktiv read-only: PostgreSQL 17.6, Katalog v1/v2 78/80 mit identischen
    disposable SHA-256-Fingerprints, Sessions/Items/Sets 0/0/0, viermal RLS plus
    je eine SELECT-Policy, gehärtete RPC-Owner/Search-Path-/ACL-Grenze `PASS`;
  - Git: `main` auf `1e0294f0f514eec9b08b9b4f3e8e57d435d0bdd6`;
    ausschließlich diese R8-Roadmap und Evidence waren untracked, kein
    Produkt-/SQL-Diff.
- Tool- und Testlane:
  - Node 24.18.0, npm 11.18.0, Deno 2.9.5, Supabase CLI 2.109.1,
    Docker Client/Server 29.7.2, WSL-psql 16.14, PostgreSQL-17-Container,
    Edge, ADB 37.0.0, Gradle 8.7 und JDK 17 sind verfügbar;
  - lokaler Supabase-Stack ist gestoppt, Projekt ist verlinkt und Config fordert
    PostgreSQL 17; die direkte guarded Docker-Fixture beweist die disposable
    SQL-Lane ohne Repo- oder Produktivmutation;
  - keine Device-Verbindung, Installation, Reverse-Regel oder Prozessaktion
    wurde ausgeführt.
- Wiederverwendung und Invalidation:
  - R2 EV-L01 bis -L04 bleiben für Schema/RPC, Idempotenz/Races, Lookup und
    Data-Access-Baseline gültig; SQL-22- und Semantikinjektionsdeltas
    invalidieren die jeweils betroffenen Teile.
  - R7 EV-ACT-R7-L01 bis -L10 bleiben für Draft v3, Envelope-v1-Lesen,
    Observation-CAS, Tombstone, Autosave/Flush, Browser-IDB und Isolation
    gültig; Envelope-v2-/Intent-/Lock-Deltas invalidieren L02-L08.
  - HCR-017 bis -025 bleiben als Isolationsregression gültig; neue R8-Pfade
    benötigen HCR-026 erst in S6.
- Findings-Korrektur:
  - F-ACT-R8-15 ergänzt die zwingende Android-Debugisolation in S4.11; keine
    Abhängigkeit, kein Produktload und kein Device-Gate wurden vorgezogen.
- Full Review:
  - `PASS`; Quellenreihenfolge, Git-, Runtime-, SQL-, Security-, Recovery-,
    Produkt- und Toolgrenzen sind widerspruchsfrei belegt;
  - keine offenen In-Scope-P0/P1-Blocker und kein Owner-Gate für S2.
- S1 Session Resume Snapshot:
  - S1 `DONE`; Evidence EV-ACT-R8-B01 bis -B06 grün;
  - nächster Schritt S2; Produktcode, SQL-Source und produktive Runtime
    unverändert; S4, produktives SQL und Android-Device bleiben gesperrt.

## S2 - Commit-, Recovery-, Daten- und UX-Zielvertrag

Reasoning: `GPT-5.6 Sol / Extra High`.

### S2.1 - Draft-zu-Commit-Abbildung

1. Exakte erlaubte Draft-v3-Top-Level- und Item-/Setfelder bestätigen.
2. `started_at` und `request_id` referenzgleich übernehmen.
3. `ended_at`, `duration_min`, `title`, Sessionnotiz und Items exakt nach
   D-ACT-R8-09 bis -14 bilden.
4. Strength-Leerzeilen auslassen, vollständige Sätze lückenlos neu nummerieren,
   Partial/Invalid und Strength-ohne-Set blockieren.
5. Duration-/Distance-/Mixed-Felder ausschließlich nach der zum Draft
   gehörenden Semantik normalisieren.
6. Itemreihenfolge lückenlos aus sichtbarer Draftreihenfolge bilden; kein
   ausgewähltes Item still auslassen.
7. Erste ungültige Eingabe deterministisch als Fokusziel ausgeben; keine
   medizinische oder Trainingsbewertung hinzufügen.

### S2.2 - Zeit- und Commit-Intent-Vertrag

1. Finish validiert zuerst; bei Fehler kein Intent und Timer läuft weiter.
2. Beim ersten gültigen Finish `ended_at` einmalig erfassen und Dauer exakt
   nach D-ACT-R8-09 berechnen.
3. Intentform, erlaubte Keys, Deep-Freeze, Größen-/Textgrenzen und
   Secretfreiheit festschreiben.
4. `flush()` muss den neuesten Draft bestätigen; Konflikt/Storagefehler
   blockiert den Commit.
5. Envelope-v2-Transition und CAS müssen Draftrevision, Request-ID,
   Katalogversion und vollständige Observation prüfen.
6. Neue R8-Sessions schreiben Envelope v2 ab dem ersten Recovery-Write.
   Bestehende Envelope-v1-Sessions bleiben bei Read, Continue und normalem
   Autosave v1; nur `prepareCommit()` darf sie CAS-geschützt in v2 überführen.
7. Persistenz gilt erst nach IndexedDB-Transaction-Complete.
8. Nach bestätigtem Intent darf die Sessionzeit für alle Retries nicht mehr
   fortschreiten oder neu berechnet werden.

### S2.3 - Commitzustandsmaschine

Mindestens diese fachlichen Zustände werden eingefroren:

- `editing`: Draft editierbar, kein Intent;
- `preparing`: lokale Validierung/Flush/Intent-Persistenz, noch kein Netzwerk;
- `committing`: exakt ein Remoteversuch, UI mutiert nicht;
- `not_committed`: sicher kein Servercommit; Intent persistent gelöst und
  Draft wieder editierbar;
- `release_pending`: sicher kein Servercommit, aber Intent-Release lokal noch
  nicht bestätigt; Draft bleibt gesperrt und Retry ist ausschließlich lokal;
- `unknown`: Servercommit nicht ausschließbar; Intent/Draft gesperrt;
- `cleanup_pending`: Remoteerfolg bestätigt, Tombstone lokal noch nicht
  bestätigt;
- `committed`: Remoteerfolg und Tombstone bestätigt; Controller terminal;
- `blocked`: lokaler Contract-, Recovery-, Catalog- oder Konfliktzustand;
- `destroyed`: keine neuen Side Effects.

Für jeden Zustand festlegen:

1. erlaubte Aktionen;
2. Buttonstatus und ruhige Copy;
3. Timeranzeige;
4. Close-/Escape-/Discard-Verhalten;
5. Reload-/Resume-Verhalten;
6. zulässiger nächster Zustand;
7. Fehler-/Diagnoseinhalt ohne Payloadleck.

Für `unknown` und `cleanup_pending` gilt zusätzlich: Close oder Escape darf
die isolierte Ansicht schließen, aber weder `discard()` noch eine Löschung von
Draft oder Intent auslösen. Beim nächsten Öffnen bleibt exakt derselbe Intent
gesperrt; weil die flüchtige Coordinator-Phase nicht persistiert wird, startet
der Resume konservativ als `unknown`.

### S2.4 - Remote-Ergebnisvertrag

1. R2-Domänenfehler am realen Code klassifizieren.
2. Vor Dispatch sicher erkannte Fehler als `not_committed` behandeln.
3. Nach möglichem Dispatch nicht beweisbare Fehler als `unknown` behandeln.
4. `created` und `replayed` gleichermaßen als bestätigten Erfolg behandeln.
5. Malformed Success und Antwortvalidierungsfehler als `unknown` behandeln.
6. Idempotenzkonflikt bei identischem persistentem Intent ist ein P0-Finding
   und keine automatisch heilbare Eingabe.
7. Known-Fehler-Cleanup und Success-Tombstone persistent-first ausführen.

### S2.5 - API- und Ownership-Vertrag

1. Additive Recoverycontroller-Methoden exakt benennen und ihre
   Preconditions/Returns/Errors einfrieren.
2. `getCommitIntent()` gibt nur einen tiefgefrorenen Snapshot zurück und
   verändert nichts.
3. `prepareCommit(intent)`, `releaseCommit(intent)` und
   `completeCommit(intent)` bleiben CAS-geschützt und persistent-first.
4. Neue `AppModules.activityV2.sessionCommit`-API minimal halten; Mapper und
   Coordinator nicht auf Top-Level-Globals legen.
5. `commitSession({requestId,payload,semantics})` additiv erlauben;
   `semantics` wird nie serialisiert. Der alte v1-Aufruf bleibt gültig.
6. Shell erhält Commitkoordination ausschließlich explizit über Injection;
   bestehende R3-R7-Mounts bleiben unverändert.

### S2.6 - SQL- und Katalogrollout-Vertrag

1. SQL 22 akzeptiert nur den kanonischen R2-Ausgangszustand und ist in einer
   Transaktion rerun-fähig.
2. Replay-Check bleibt vor aktueller Katalogvalidierung, damit vorhandene
   identische Sessions unabhängig von späterem Rollout replaybar bleiben.
3. Neue Session validiert jedes Item gegen
   `p_payload.catalog_version`, Status `active` und dessen exakte Policy.
4. Fehlende, leere oder unbekannte Katalogversion sowie jedes in dieser
   Version fehlende, inaktive oder policyabweichende verwendete Item
   blockiert. Die Vollständigkeit eines gesamten Snapshots bleibt ein
   C2-/Katalogpflegevertrag; R8 erfindet dafür keine Manifesttabelle.
5. Version 1 und 2 bleiben inhaltlich unverändert und werden vor/nach der
   Function-Ersetzung per Hash/Setvergleich geprüft.
6. Owner `postgres`, `security definer`, leerer Search Path,
   schemaqualifizierte Objekte und ausschließlich `authenticated` Execute
   bleiben erhalten.
7. Kein Tabellen-DML-Grant, keine RLS-/Schema-/Tabellen-/Katalogmutation.
8. Produktives SQL ist ein separates Owner-Gate; keine produktive Testsession.

### S2.7 - Browser- und Android-Testvertrag

1. Isolierter Commit-Harness verwendet dieselben R7-/R8-Module und keine
   nachgebaute Parallelimplementierung.
2. Deterministische Adapter decken Success, Replay, Known Failure, Unknown,
   Cleanup Failure, Reload und Races ohne Netzwerk ab.
3. Disposable Supabase beweist echte R2-RPC- und SQL-22-Semantik mit Testusern.
4. Android-Lane verwendet bevorzugt lokale Test-PWA plus ADB-Reverse und
   disposable Supabase; temporäre Credentials werden nicht committed.
5. Falls dieser Pfad am realen Toolstand nicht sicher möglich ist, stoppt S4R
   mit Finding statt auf Produktion auszuweichen.
6. Der Device-Smoke beweist Background, Prozess-Reclaim, explizites Resume,
   identischen Commit und bestätigten Cleanup; R12 bleibt finaler Produkt-PWA-
   Cutover-Smoke.

### S2.8 - Eingefrorene exakte Projektion

Der Mapper ist intern in `sessionCommit`; er wird nicht als zweite Draftquelle
oder Top-Level-Global veröffentlicht. Er liest einen tiefgefrorenen Draft-v3-
Snapshot und die genau zu `catalog_version` gehörende Semantik.

<!-- markdownlint-disable MD013 -->

| Ziel | Exakte Abbildung |
| --- | --- |
| Request | `requestId = draft.request_id`; die Request-ID muss bereits kanonisch kleingeschrieben sein und wird weder normalisiert noch ersetzt |
| Payload Keys | exakt und in kanonischer Reihenfolge `schema_version`, `catalog_version`, `started_at`, `ended_at`, `duration_min`, `title`, `note`, `items` |
| Session | Schema `midas.activity-session.v1`; Katalog und `started_at` referenzgleich; `ended_at` aus genau einem gültigen UTC-Clockread; Dauer `max(1, Math.round(delta/60000))`; `title=null`; Draft-Sessionnotiz unverändert übernommen, da R6 sie bereits trimmt |
| Items | jedes ausgewählte Item bleibt in sichtbarer Reihenfolge erhalten und erhält `item_order=index+1`; exakt `item_key`, `item_order`, `duration_min`, `distance_km`, `note`, `sets` |
| Itemnote | R2-/PostgreSQL-kompatibles ASCII-Space-`btrim`; leer danach `null`; andere Unicodezeichen werden nicht still umgedeutet |
| Zahlen | Integer nur `^[0-9]+$`; Dezimal nur `^[0-9]+(?:[,.][0-9]+)?$`; Komma wird einmal zu Punkt normalisiert; keine Vorzeichen, Exponenten, Spaces oder Zwischenzustände; Bereich und Dezimalstellen kommen aus der gespeicherten Semantik |
| Strength | nur nach Policy erlaubte Setfelder; vollständig leere nachlaufende Platzhalter werden ausgelassen; eine leere Zeile vor einer später nichtleeren Zeile ist ein Gap und blockiert; jeder übrige Satz muss vollständig gültig sein und wird sichtbar lückenlos ab 1 nummeriert; mindestens ein Satz |
| Duration/Distance | `sets=[]`; Pflicht-/Optional-/Forbidden-Regeln exakt aus der Semantik; fehlendes Pflichtfeld, verbotenes Feld oder ungültiger Wert blockiert |
| Fehlerziel | tiefgefroren exakt `{scope,item_key,set_order,field_key}`; erste Abweichung in sichtbarer Item-, Set- und Feldreihenfolge; Sessionzeit verwendet `scope=session` und sonst `null` für nicht anwendbare Koordinaten |

<!-- markdownlint-enable MD013 -->

Validierungsreihenfolge:

1. Draft-/Semantik-/Katalogform und referenzgleiche Version;
2. Itemreihenfolge, Itemexistenz, Status und Policy;
3. sichtbare Items, Sets und Felder in DOM-Reihenfolge;
4. Sessionnotiz und `started_at`;
5. genau ein Clockread für `prepared_at = ended_at` und die Dauergrenzen.

Bis einschließlich Schritt 4 gibt es keinen Intent, Netzwerk- oder
commit-spezifischen Storage-Side-Effect; ein vorangestellter normaler R7-Flush
darf ausschließlich den bereits vorhandenen Draft bestätigen. Ein Fehler in
Schritt 5 erzeugt ebenfalls keinen Intent; Timer und Draft bleiben unverändert.
Das normalisierte Ergebnis und alle Unterobjekte werden tief gefroren.

### S2.9 - Recovery-Envelope und Commit-Intent

- Envelope v2:
  - Schema `midas.activity-session-recovery.v2`;
  - exakte geordnete Keys `slot_key`, `recovery_schema_version`,
    `slot_generation`, `write_sequence`, `lease_token`, `request_id`,
    `persisted_revision`, `saved_at`, `draft`, `commit_intent`,
    `commit_attempt`;
  - Active Record trägt Draft v3, `commit_intent` als `null` oder exaktes
    Intentobjekt und `commit_attempt` als `null` oder exakten Attempt-Claim;
    ein Attempt ohne Intent ist ungültig; Tombstone trägt Draft, Intent und
    Attempt `null`;
  - neue Sessions schreiben bei ihrem ersten Save v2; v1-Observation bleibt bei
    Continue/Autosave/normalem Discard v1; ausschließlich `prepareCommit`
    migriert einen aktiven v1-Record mit vollständigem CAS zu v2.
- Commit-Intent v1:
  - exakte geordnete Keys `commit_intent_schema_version`, `request_id`,
    `draft_revision`, `catalog_version`, `prepared_at`, `payload`;
  - Schema `midas.activity-session-commit-intent.v1`;
  - Request, Revision und Katalog müssen Envelope und Draft exakt entsprechen;
    `prepared_at` ist dieselbe einmal gelesene UTC-Zeit wie `payload.ended_at`;
  - Payload ist die exakte tiefgefrorene S2.8-Projektion;
  - keine URL, Header, Auth-/Refreshdaten, JWTs, User-ID, Response, Rohdiagnose
    oder zweite Serialisierung;
  - Größenvertrag bleibt die belegte Recovery-Grenze von 50.000 JSON-Knoten,
    Tiefe 100, maximal 50 Items/50 Sets sowie R2-Text-/Zahlenlimits; R8 erfindet
    kein unbelegtes Byte-Limit.
- Commit-Attempt v1:
  - exakte geordnete Keys `commit_attempt_schema_version`, `attempt_number`,
    `attempt_token`;
  - Schema `midas.activity-session-commit-attempt.v1`, positive sichere
    Ganzzahl und kanonisch kleingeschriebene UUID;
  - `beginCommitAttempt(intent)` schreibt vor jedem logischen Remoteversuch per
    vollständigem CAS `null -> 1` oder `n -> n+1` mit neuem Token und gilt erst
    auf Transaction-Complete; der aufrufende Recoverycontroller hält den Claim
    zusätzlich nur in Memory;
  - Request-ID, Payload, `prepared_at` und Intent bleiben dabei byte-inhaltlich
    unverändert; Attempt-Metadaten werden niemals an R2 serialisiert.
- Persistenz/CAS:
  - vollständige vorherige Observation, Lease, Generation, Sequence, Request,
    Draftrevision, Katalog, Intent- und Attemptgleichheit werden in derselben
    Readwrite-Transaktion geprüft;
  - Erfolg gilt ausschließlich auf `transaction.oncomplete`;
  - nach belegtem `flush()` setzt `prepareCommit()` vor seinem ersten Await
    synchron einen transienten Mutations-/Discardlock, prüft Snapshot,
    Writequeue und Observation erneut und löst den Lock bei sicherem Pre-Intent-
    Fehler wieder; es gibt keinen ungeschützten Await zwischen finalem Snapshot,
    Clockread und diesem Lock;
  - Intentpräsenz blockiert alle Managed-Draft-Mutationen, Recovery-Discard und
    Start-New; Draft-/State-Getter bleiben payloadfrei, ausschließlich
    `getCommitIntent()` liefert den geschützten Intent-Clone;
  - unbekannte Schemas, malformed v2-/Intent-/Attempt-Records oder Records mit
    nicht sicher interpretierbaren Commitfeldern bleiben quarantänisiert
    `blocked`; normaler Discard/Tombstone/Start-New ist dort verboten;
  - kein Store-/Record-Delete; Abschluss ist immer tokenrotierter
    Generationstombstone.

### S2.10 - Exakte APIs und Ownership

- Additive Recoverycontroller-Methoden:
  - `getCommitIntent()` nimmt kein Argument, ist side-effect-frei und liefert
    `null` oder einen tiefgefrorenen geschützten Clone;
  - `prepareCommit(intent)` liefert erst nach Transaction-Complete eine Promise
    des bestätigten tiefgefrorenen Intents;
  - `beginCommitAttempt(intent)` liefert erst nach Transaction-Complete den
    tiefgefrorenen bestätigten Attempt-Claim und erlaubt erst danach Dispatch;
  - `releaseCommit(intent)` prüft strukturell denselben persistenten Intent,
    den lokal gehaltenen aktuellen Attempt und zusätzlich
    `attempt_number === 1`; es schreibt v2 mit Intent/Attempt `null`, entsperrt
    erst nach Complete und löst mit `null` auf;
  - `completeCommit(intent)` prüft denselben Intent und den lokal gehaltenen
    aktuellen Attempt, rotiert Token/Generation, schreibt Intent/Attempt `null`
    in den Tombstone und liefert danach den terminalen Recovery-State;
  - Fehler sind payloadfreie `ActivityV2SessionRecoveryError`-Codes:
    `INVALID_COMMIT_INTENT`, `COMMIT_INTENT_REQUIRED`,
    `COMMIT_INTENT_MISMATCH`, `INVALID_COMMIT_ATTEMPT`,
    `COMMIT_ATTEMPT_REQUIRED`, `COMMIT_ATTEMPT_MISMATCH`, `RELEASE_BLOCKED`,
    `UNSAFE_DISCARD`, `MUTATION_BLOCKED`, `CONFLICT` oder `STORAGE_ERROR`.
- `AppModules.activityV2.sessionCommit`:
  - öffentlich exakt eine tiefgefrorene `create`-Methode;
  - exakte Create-Injections `draft`, `recovery`, `semantics`, `commitSession`,
    `now`; keine implizite Storage-, Netzwerk- oder Semantikquelle;
  - Controller exakt `getState`, `finish`, `retry`, `subscribe`, `destroy`;
  - State exakt `{state,reason,focus_target,intent_present}` und ohne Payload,
    Rohfehler, IDs oder Secrets;
  - `finish()` veröffentlicht Promise und `preparing` synchron, wartet auf
    `recovery.flush()` samt bestätigter Revision und führt danach im selben
    JS-Turn Snapshotread, Validierung, einen Clockread, Projektion und den
    synchronen Eintritt in `prepareCommit()` aus;
  - `finish()`/`retry()` liefern dieselbe aktive Promise bei Wiederholung und
    lösen für fachliche Ergebnisse mit dem tiefgefrorenen State auf; falsche
    API-Nutzung scheitert payloadfrei;
  - der Coordinator ruft pro logischer Commitoperation genau einmal
    `beginCommitAttempt()` auf; innerhalb des danach bestätigten Claims darf R2
    seine belegten höchstens zwei sequenziellen Transportdispatches mit dem
    einmal serialisierten identischen Body ausführen;
  - `destroy()` invalidiert lokale Callbacks/Promises, persistiert und löscht
    aber nichts. Ein bereits persistierter Intent bleibt beim nächsten Open als
    `unknown` gesperrt.
- Data Access:
  - erlaubt exakt `{requestId,payload}` oder additiv
    `{requestId,payload,semantics}`;
  - ohne Injection bleibt Semantik v1; mit Injection müssen API, Katalogversion,
    Requestnormalisierung und Commit-Responseprüfung dieselbe Semantik nutzen;
  - `semantics` wird nie serialisiert; Namespace und die zwei öffentlichen
    Methoden bleiben unverändert.
- Shell:
  - optionale Injection heißt `sessionCommit` und akzeptiert nur den exakten
    Controller;
  - ohne Injection bleibt die bestehende R3-R7-Shell bytefunktional ohne Finish-
    oder Netzwerkpfad; kein globaler Data-Access-Fallback.

### S2.11 - Zustands-, UX- und Lifecyclematrix

<!-- markdownlint-disable MD013 -->

| Zustand | Erlaubte Aktion / Button | Timer | Close / Discard | Reload / nächster Zustand |
| --- | --- | --- | --- | --- |
| `editing` | Edit, Finish, bestätigter R7-Discard; Copy `Session bereit.` | live | bestehender persistent-first Discard | ohne Intent R7-Gate; -> `preparing` |
| `preparing` | alle Mutationen aus; ein koaleszierter Finish | am ersten gültigen Clockread vorläufig eingefroren; bei Fehler wieder live | UI-Close gesperrt; Lifecycle-Exit erzeugt keinen Netzwerkaufruf ohne bestätigten Intent | ohne Intent R7-Gate, mit Intent konservativ `unknown`; -> `editing`, `blocked` oder `committing` |
| `committing` | keine Mutation; aktive Promise wiederverwenden; Dispatch erst nach Attempt-Complete | Intentzeit eingefroren | UI-Close gesperrt; unvermeidbarer Prozessverlust bleibt durch Intent/Attempt sicher | Intent -> `unknown`; -> `not_committed`, `release_pending`, `unknown`, `cleanup_pending` oder `blocked` |
| `not_committed` | Edit, Finish und R7-Discard wieder frei; Copy `Nicht gespeichert. Eingaben bleiben erhalten.` | wieder live | normaler R7-Discard | kein Intent; -> `preparing`/`editing` |
| `release_pending` | nur lokales Release-Cleanup-Retry des allein gehaltenen Attempt 1; Copy `Nicht gespeichert. Lokale Freigabe ausstehend.` | eingefroren | Ansicht darf ohne Discard schließen; kein Start-New | bei unverändertem Claim -> `not_committed` oder `release_pending`, niemals Netzwerk; bei Claimkonflikt/Prozessverlust konservativ `unknown` |
| `unknown` | nur identischer Remote-Retry; Copy `Speicherstatus unklar. Nur identisch erneut versuchen.` | eingefroren | Ansicht darf ohne Discard schließen | gleicher Intent -> `committing`; sonst `blocked` |
| `cleanup_pending` | nur identischer Replay/Cleanup-Retry; Copy `Gespeichert. Lokaler Abschluss wird bestätigt.` | eingefroren | Ansicht darf ohne Discard schließen | Intent -> konservativ `unknown`; -> `committed` oder `cleanup_pending` |
| `committed` | terminal; Copy `Session gespeichert.` | eingefrorene Abschlusszeit | kein Discard; Ansicht darf schließen | Tombstone -> Recovery `empty` |
| `blocked` | nur ausdrücklich reason-gebundener lokaler Retry, sonst keine Mutation; Copy `Abschluss ist blockiert. Eingaben bleiben erhalten.` | ohne Intent live, mit Intent eingefroren | Ansicht ohne Discard schließen; Intent nie löschen | gleiche persistente Wahrheit erneut lesen; Idempotenzkonflikt bleibt terminal blockiert |
| `destroyed` | keine Aktion/Side Effects | keine UI | keine Persistenzmutation | persistenter Draft/Intent/Tombstone bleibt alleinige Wahrheit |

<!-- markdownlint-enable MD013 -->

- Local Validation bleibt `editing` mit erstem Fokusziel und erzeugt keinen
  Intent.
- Flush-/Catalog-/CAS-/Storage-Fehler vor Intent werden `blocked` und dürfen
  keinen Dispatch auslösen.
- `AUTH_REQUIRED`, `INVALID_SESSION` und sicher vor Dispatch erkannte
  `REQUEST_FAILED` werden nur im weiterhin allein gehaltenen Attempt 1 und erst
  nach bestätigtem `releaseCommit` zu `not_committed`. Nach Attempt >1 oder
  Claimkonflikt bleiben sie wegen eines möglichen älteren In-flight-Commits
  `unknown`.
- Ein `IDEMPOTENCY_CONFLICT` für denselben persistenten Intent wird unabhängig
  vom R2-`commitState` als P0-`blocked` behandelt; Intent bleibt erhalten.
- Transport-/Timeout-/5xx-/unbekannte Fehler nach möglichem Dispatch sowie jede
  malformed/invalid Success-Antwort werden `unknown`.
- `created` und `replayed` sind gleichwertig; erst bestätigter Tombstone ergibt
  `committed`. Scheitert er, bleibt `cleanup_pending`.
- Öffnet ein zweiter Tab denselben Intent, muss auch er vor Netzwerk einen neuen
  Attempt claimen. Jeder Abschluss oder Release mit einem älteren Claim
  scheitert CAS-geschützt; dadurch kann kein später Servererfolg einen bereits
  editierbar freigegebenen Draft hinterlassen.

### S2.12 - SQL-22- und isolierter Testlane-Vertrag

- SQL 22:
  - ein transaktionales, rerun-fähiges `CREATE OR REPLACE FUNCTION` für exakt
    `public.activity_v2_commit_session(uuid,jsonb)`;
  - Precondition verlangt einen eingefrorenen Source-Fingerprint entweder des
    kanonischen R2-Ausgangs oder des eigenen exakten R8-Rerun-Stands, genau einen
    Overload, PostgreSQL 17, Owner/Search-Path/Volatilität/Security/ACL und
    unveränderte Tabellen/RLS/Policies; jeder andere Preimage abortiert;
  - Replay-Fingerprintprüfung bleibt vor jeder Katalogprüfung;
  - neue Requests verwenden ausschließlich `v_client_catalog_version`; jedes
    verwendete Item muss in dieser vorhandenen Version aktiv sein und dieselbe
    exakte Policy liefern;
  - kein `max(catalog_version)`, keine Manifesttabelle und keine Änderung an
    Katalog, Tabellen, Indizes, RLS, Policies oder Tabellen-ACL;
  - Function-Owner `postgres`, `SECURITY DEFINER`, leerer Search Path,
    vollständig qualifizierte Objekte, `VOLATILE`, Revoke für
    PUBLIC/anon/authenticated/service_role und danach Execute nur authenticated;
  - SQL 16 bleibt unverändert; v1/v2-Zähler und Inhaltsfingerprints werden vor
    und nach SQL 22 extern verglichen.
  - ein separates
    `sql/22_Activity_V2_Commit_Compatibility_Rollback.sql` akzeptiert nur den
    exakten R8-Preimage, stellt ausschließlich den kanonischen R2-RPC wieder her
    und reassertiert dasselbe Hardening; es ist kein automatischer Fehlerpfad,
    sondern ein eigenes produktives Owner-Gate nach read-only Outcomeprüfung.
- Browser/disposable:
  - Core-/Shell-Harness verwendet echte R7-/R8-Module und deterministische
    Adapter; echter RPC wird separat mit lokaler Supabase-PG17-API, temporärem
    lokalen Testuser und Activity-only Grant-Slice bewiesen;
  - SQL-20/21/22-Full-Runs und Race-/Driftproben bleiben in der hart gegateten
    Wegwerfdatenbank; keine Probe wird auf Produktion umgebogen.
- Android:
  - Gradle-Debugvariante mit `applicationIdSuffix` für eine eigene OS-/WebView-
    Datensandbox; Debug-Resource überschreibt `midas_url` ausschließlich auf
    `http://localhost:<port>`; Cleartext ist ausschließlich im Debug-Manifest
    erlaubt;
  - Main-/Release-Manifest, Produkt-URL, produktiver Service Worker, Navigation
    und Activity V1 bleiben unverändert;
  - lokaler Harness und lokale Supabase-API werden über getrennte
    owner-gated ADB-Reverse-Ports erreicht; Laufzeitwerte/Keys werden nur aus
    lokalem Tooloutput injiziert und nie committed oder geloggt;
  - die separate App-ID verhindert Zugriff auf native Produkt-App-Daten. Der
    Testflow importiert keine Produkt-Session und erzeugt keine produktive
    Trainingssession;
  - R8 löscht auch im Test keinen Recovery-Record physisch: Erfolg/Discard
    hinterlässt einen Tombstone; Containerdaten sind disposable, Device-App-
    Daten werden nicht automatisch gecleart oder deinstalliert.

Ergebnis:

- Finaler Zielvertrag:
  - ein persistierter Intent verbindet R7 und R2 ohne unsichere Lücke.
- Gewählte Lösung:
  - Envelope v2 plus additive Recovery-/Commitkoordination und versionsgebundene
    Servervalidierung.
- Abgrenzung:
  - isoliert/testgebunden, kein Produktcutover.
- S4-Pflichtpunkte:
  - D-ACT-R8-03 bis -41.
- Doku-Sync:
  - S6.

Exit: Mapper, Zeit, Storage, State Machine, SQL, API, UX und Device-Lane sind
exakt und ohne Owner-Grundsatzfrage eingefroren.

### S2-Abschluss - 2026-08-10

- Vertragsfreeze:
  - S2.8 bis S2.12 sind die exakte Implementierungsquelle für Mapper,
    Intent/Envelope, Recovery-/Commit-/Data-Access-/Shell-API, Zustandsmaschine,
    SQL 22 und lokale Android-Lane.
- Findings-Korrektur:
  - F-ACT-R8-16 ergänzt `release_pending`; F-ACT-R8-15 ist in D-ACT-R8-33 und
    der konkreten Debugvariante vollständig verankert.
- Full Review:
  - `PASS`; Draft v3, R2-Request/Response, R7-CAS/Tombstone, SQL-Hardening und
    Produktisolation bleiben unverändert;
  - jede Remotebahn beginnt erst nach bestätigtem Intent; jeder Unknown-Retry
    verwendet dieselbe Request-ID und Payload;
  - keine offene Grundsatzfrage, kein P0/P1-Blocker und kein Owner-Gate für S3.
- S2 Session Resume Snapshot:
  - S1/S2 `DONE`; Evidence EV-ACT-R8-B01..B06 und C01..C07 gültig;
  - nächster Schritt S3 Red-Team; Produktcode/SQL-Source/Runtime unverändert;
    S4, produktives SQL und Android-Device weiterhin gesperrt.

## S3 - Datenverlust-, Concurrency-, Security- und Umsetzungsreview

Reasoning: `GPT-5.6 Sol / Extra High`.

Deterministisch red-teamen:

1. Finish-Doppelklick, Enter+Button, Retry-Doppelklick und verspätete Promises.
2. Mutation während Flush, Intent-Persistenz, Dispatch, Unknown und Cleanup.
3. Reload/Close/Destroy jeweils vor Intent, nach Intent, während Dispatch,
   nach Servererfolg und vor Tombstone-Complete.
4. Responseverlust nach Servercommit, Timeout vor/after Dispatch, malformed
   Success und Authablauf.
5. Known-Fehler plus scheiterndes `releaseCommit`; Draft darf nicht
   fälschlich editierbar werden.
6. Servererfolg plus scheiternder Tombstone; lokaler Vollerfolg darf nicht
   behauptet werden.
7. Alter Tab, neuer Tab, Lease-/Generation-/Sequence-/Request-/Revision-
   Konflikt und Wiederauferstehen nach Abschluss.
8. Envelope v1/v2, unbekannte Version, corrupt Intent, Intent/Draft-
   Requestmismatch, Catalogmismatch und Größen-/Keydrift.
9. Leere/partial/invalid Strength-Sets, Lücken, ungültige Kommazahlen,
   verbotene Felder, Mixed Sessions und ausgewähltes Item ohne Leistung.
10. Uhr rückwärts, 0-Minuten-, 24-Stunden-, >24-Stunden- und Future-Time-Fälle.
11. Katalog v1/v2, neuer höherer Snapshot, fehlender Snapshot, fehlendes
    verwendetes Item, Policyabweichung, C2-Snapshotcheck, deprecated/unknown
    Item und Replay nach Rollout.
12. SQL Owner/Search Path/ACL/RLS/Overloads, direkte DML, anon/anonymous user,
    fremder User und service-role-Abgrenzung.
13. Produktiver Scriptload, Activity-V1-Diff, Service Worker, neue Netzwerk-
    Endpunkte, Storage-Leaks und Payloads in Logs/DOM/Errors.
14. Android Background, Reload, WebView/PWA-Prozesskill, Offline-Wiederkehr,
    Fokus, Touchziele und lokaler Serververlust.
15. Rollback nach JS-only, SQL-Source, produktivem SQL und Device-Test jeweils
    getrennt definieren.
16. S4-Substeps, Invalidation Map, Evidence-IDs und sichere Batches ableiten.
17. Full Contract Review, Findings-Korrektur, Statusmatrix und Resume Card.

Ergebnis:

- S3 fand fünf P0/P1-Vertragslücken F-ACT-R8-17 bis -21. Alle sind durch
  D-ACT-R8-34 bis -38 und die korrigierten S2-Verträge geschlossen; keine wurde
  in die Implementierung verschoben.

### S3-Red-Team-Statusmatrix

<!-- markdownlint-disable MD013 -->

| # | Red-Team-Fläche | Deterministisches Ergebnis | Evidence | Status |
| --- | --- | --- | --- | --- |
| 1 | Doppelklick/Enter/Retry/späte Promise | Promise und `preparing` entstehen synchron; gleiche Instanz wird koalesziert; Epoch/Destroy entwertet späte Callbacks ohne Persistenzmutation | EV-ACT-R8-R01 | PASS |
| 2 | Mutation um Flush/Intent/Dispatch | Flush muss bestätigte Revision liefern; finaler Snapshot, Mapper, Clock und synchroner Preparation-Lock liegen in einem JS-Turn; ab Intent sind alle Mutationen gesperrt | EV-ACT-R8-R02 | PASS nach F-ACT-R8-18 |
| 3 | Reload/Close/Destroy an jeder Grenze | vor Intent gilt R7; nach Intent oder Attempt startet Resume konservativ `unknown`; nach Servererfolg vor Tombstone bleibt identischer Replay/Cleanup; Close/Destroy verwirft nichts | EV-ACT-R8-R03 | PASS |
| 4 | Responseverlust/Timeout/malformed/Auth | nach möglichem Dispatch und malformed Success `unknown`; belegter Auth-/Validierungs-Nichtcommit nur unter Release-Regel; Responseverlust wiederholt exakt Intent | EV-ACT-R8-R04 | PASS |
| 5 | Known plus Releasefehler | nur allein gehaltener Attempt 1 darf freigeben; Storagefehler wird `release_pending`; Claimverlust oder Attempt >1 wird `unknown` | EV-ACT-R8-R05 | PASS |
| 6 | Success plus Tombstonefehler | kein lokaler Vollerfolg; Intent/Attempt bleiben, Zustand `cleanup_pending`, nächster Claim replayt identisch und tombstonet | EV-ACT-R8-R06 | PASS |
| 7 | alte/neue Tabs und CAS | jeder logische Remoteversuch braucht persistenten Attempt-Claim; alter Release/Complete verliert CAS; identische parallele Serverrequests bleiben R2-idempotent | EV-ACT-R8-R07 | PASS nach F-ACT-R8-17 |
| 8 | v1/v2/unknown/corrupt/mismatch/Größe | v1 intentfrei kompatibel; v2 exakt; unknown oder möglicher malformed Intent/Attempt quarantänisiert ohne Discard; Key-/Request-/Katalog-/Größendrift fail-closed | EV-ACT-R8-R08 | PASS nach F-ACT-R8-19 |
| 9 | Strength/Non-Strength/Mixed | trailing Empty wird ausgelassen; Gap/Partial/Invalid/verboten/fehlend blockiert mit erstem Fokus; ausgewähltes Item verschwindet nie still | EV-ACT-R8-R09 | PASS |
| 10 | Zeitgrenzen | genau ein Clockread; negativ blockiert, 0 wird 1, exakt/gerundet bis 1440 erlaubt, gerundet >1440 blockiert; Future-Start ist negativ und blockiert | EV-ACT-R8-R10 | PASS |
| 11 | Katalog/Rollout/Replay | Clientsemantik und Payloadversion referenzgleich; neue Requests brauchen vorhandene aktive verwendete Items/Policies genau dieser Version; Replay liegt vor aktueller Katalogprüfung | EV-ACT-R8-R11 | PASS |
| 12 | SQL/ACL/RLS/Usergrenzen | genau ein Overload, postgres/Definer/leer/volatile, Execute nur authenticated, keine Tabellen-DML, RLS/Userisolation und service-role-Abgrenzung werden vor/nach bewiesen | EV-ACT-R8-R12 | PASS vertraglich |
| 13 | Produkt-/Secretisolation | kein Produktload/V1-/SW-/Navigationdiff; Semantik und Attempt nicht im Body; State/DOM/Logs/Errors ohne Payload, IDs, Auth- oder Rohdiagnose | EV-ACT-R8-R13 | PASS vertraglich |
| 14 | Android/Reclaim/Offline | nur debug App-ID/Datensandbox, localhost und debug Cleartext; Serververlust führt zu Offline/Unknown, nie Produktfallback; echte Device-Aktion bleibt S5-owner-gated | EV-ACT-R8-R14 | PASS mit späterem Owner-Gate |
| 15 | vier Rollbackflächen | lokale Diffs einzeln invers; unexecuted SQL-Source invers; produktiver Unknown-Ausgang erst read-only klären und nur exaktes owner-gatetes Rollback; Device behält/tombstonet Slot, kein Data-Clear/Uninstall als Recoverycleanup | EV-ACT-R8-R15 | PASS nach F-ACT-R8-21 |
| 16 | S4-Schnitt/Invalidation/Evidence | zwölf Substeps, acht lokale Evidence-IDs, getrennte SQL- und Device-Gates; neue Findings sind S4.3-S4.8 exakt zugeordnet | EV-ACT-R8-R16 | PASS |
| 17 | Full Contract Review | Draft v3/V1/kein Dual-Write/kein Produktwrite/kein physisches Delete/Intent-vor-Netz/identischer Unknown-Retry bleiben invariant | EV-ACT-R8-R17 | PASS |

<!-- markdownlint-enable MD013 -->

### S3-Rollback- und Stop-Vertrag

- JS/CSS/Harness: nur R8-Dateidelta invers anwenden, fremde Worktree-Änderungen
  bewahren und anschließend Syntax, Contracts, Katalog und Produktguards erneut
  ausführen.
- SQL-Source ohne Ausführung: Main- und Rollbacksource gemeinsam invers; keine
  Runtimewirkung.
- Produktives SQL: vor Apply disposable Full PASS, eingefrorene R2-/R8-
  Sourcefingerprints, read-only Preflight und Owner-Freigabe. Bei unbekanntem
  Ausgang weder Apply noch Rollback blind wiederholen; zuerst Functiondefinition,
  ACL und Postconditions read-only bestimmen. Rollback ist ein zweites Owner-
  Gate und erzeugt keine Session.
- Android: nur Debugsandbox. Recoverycleanup schreibt den normalen Tombstone;
  kein Record-Delete, App-Data-Clear oder Uninstall als Nachweisabkürzung.
- Kein produktives Sessioncleanup ist nötig oder erlaubt, weil kein produktiver
  Testwrite vorgesehen ist.

### S3-Abschluss - 2026-08-10

- Findings-Korrektur:
  - F-ACT-R8-17/-18 schließen Remote-/Autosave-Races durch Attempt-Claim und
    synchronen Preparation-Lock;
  - F-ACT-R8-19 quarantänisiert unbekannte Commitwahrheit ohne Discard;
  - F-ACT-R8-20 präzisiert logischen Attempt versus R2-Transportretry;
  - F-ACT-R8-21 friert SQL-Preimage und den separaten inversen Pfad ein.
- Full Review:
  - `PASS`; alle 17 Red-Team-Flächen sind geschlossen, fail-closed oder am
    bereits vorgesehenen SQL-/Device-Owner-Gate;
  - keine offene Source-Abweichung, kein blockierendes Finding und keine
    Produktcode-, SQL-Source-, Browser-, Produktiv- oder Device-Mutation.
- S3 Session Resume Snapshot:
  - S1-S3 `DONE`; Evidence EV-ACT-R8-B01..B06, C01..C07 und R01..R17 gültig;
  - nächster Schritt S4R; D-ACT-R8-01..38 ist die vollständige Entscheidungsmenge;
  - S4, produktives SQL und Android-Device bleiben gesperrt.

Exit: P0/P1-Datenverlust-, Doppelwrite-, Security- und Rolloutpfade sind
geschlossen, fail-closed oder owner-gated.

## S4 Readiness Review

Reasoning: `GPT-5.6 Sol / Extra High`.

<!-- markdownlint-disable MD013 -->

| Substep | Änderung | Findings | Dateien | Review | Checks / Evidence | Status | Gate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S4.1 | Draft-v3-Mapper und Validierungsprojektion | F-ACT-R8-03/-04/-22 | `session-commit.js`, Contracttests | Consumer | EV-ACT-R8-A01/L01 | DONE/PASS | none |
| S4.2 | einmalige Zeitbildung und tiefgefrorener Commit-Intent | F-ACT-R8-01/-04/-23 | Commitdatei, Contracttests | Consumer | EV-ACT-R8-A02/L01 | DONE/PASS | none |
| S4.3 | Recovery-Envelope v2 und Envelope-v1-Kompatibilität | F-ACT-R8-01/-05/-06/-17/-19 | `session-recovery.js`, Tests | Full | EV-ACT-R8-L02 | DONE/PASS | none |
| S4.4 | CAS-geschützte Intent-/Attempt-Operationen und Mutationslock | F-ACT-R8-05/-07/-17/-18/-19 | Recovery, Tests | Full | EV-ACT-R8-L02 | DONE/PASS | none |
| S4.5 | Commitkoordination, One-Promise- und Zustandsmaschine | F-ACT-R8-01/-07/-17/-18/-20/-29/-30/-32 | neue Commitdatei, Tests | Full | EV-ACT-R8-A05/L03 | DONE/PASS | none |
| S4.6 | Known-/Unknown-/Retry-/Cleanup-Pfade | F-ACT-R8-01/-05/-07/-16/-17/-20/-31/-33 | Commit/Recovery, Tests | Full | EV-ACT-R8-A06/L03 | DONE/PASS | none |
| S4.7 | additive Semantikinjektion in R2 Data Access | F-ACT-R8-08/-20/-34/-35 | `data-access.js`, Tests | Consumer | EV-ACT-R8-A07/L04 | DONE/PASS | none |
| S4.8 | SQL-22-Katalogkompatibilität, Source-Guard und Rollback | F-ACT-R8-02/-12/-13/-21 | SQL 22, Rollback, Fixture, HOW_TO | Full | EV-ACT-R8-L05 | DONE/PASS | kein produktives SQL in S4 |
| S4.9 | isolierte Shell-Finish-/Retry-/Statusintegration | F-ACT-R8-07/-10/-14/-16 | Shell JS/CSS, Tests | Consumer | EV-ACT-R8-L06 | DONE/PASS | none |
| S4.10 | deterministischer Commit-/Fault-/Multi-Tab-Harness | F-ACT-R8-09/-11/-17/-18/-20 | Harness, Adapter | Full | EV-ACT-R8-L06 | DONE/PASS | none |
| S4.11 | lokale Test-PWA-/ADB-Reverse-Seams | F-ACT-R8-09/-15 | Debug-Source-Set, Testmanifest/Worker nur im isolierten Harness, Doku | Full | EV-ACT-R8-L07 | DONE/PASS | keine Device-Aktion in S4 |
| S4.12 | integrierte Isolation, Diagnose und günstige Delta-Härtung | F-ACT-R8-10/-11 | Tests/Guardchecks | Full | EV-ACT-R8-L08 | DONE/PASS | none |

<!-- markdownlint-enable MD013 -->

- Reihenfolge/Abhängigkeiten:
  - S4.1-S4.2 vor Persistenz;
  - S4.3-S4.4 vor Coordinator;
  - S4.5-S4.7 vor Shell;
  - S4.8 unabhängig vom UI, aber vor echtem disposable E2E;
  - S4.9-S4.11 nach stabiler Core-State-Machine;
  - S4.12 schließt nur Implementierungsdeltas, nicht die S5-Vollmatrix.
- Fehlende Zuordnung:
  - `none` nach erfolgreicher Discovery Wave.
- Evidence:
  - aktive R8-Evidence besitzt Baseline B01..B06, Contract C01..C07, Red-Team
    R01..R17 und Readiness Q01..Q08; S4 füllt L01..L08, S5 die Runtime-/Deploy-
    Nachweise.
- Scope-Freeze:
  - `PASS`; S4 verändert nur Activity-V2-Core/Shell/Tests, isolierte Harnesses,
    debug-only Android-Seams und SQL-Source. Activity V1, Draft v3,
    Produktload/Navigation/Service Worker und produktive Runtime bleiben
    unverändert.
- Gültig übernommene Nachweise:
  - R2-/R7-Evidence und HCR-017 bis -025 nur soweit nicht invalidiert.
- Invalidation Map:
  - Mapper/Commit -> Draft-, Timer-, Semantik-, Data-Access-Consumer- und
    Activity-V2-Gesamtsuite;
  - Recovery/Attempt -> vollständige R7 Node-/Browser-/IDB-/CAS-/Discardmatrix
    plus neue Multi-Tab-/Quarantänefälle;
  - Data Access -> vollständige R2 Contract-, Retry-, Body- und Errormatrix;
  - SQL -> SQL20/21/C2 plus disposable PG17 Full Fixture, Rerun/Drift/Rollback,
    ACL/RLS/Advisor und später produktiver read-only Preflight/Postflight;
  - Shell/CSS/Harness -> alle R6/R7-Routen, Viewports, Keyboard/A11y,
    Background/Reload/Offline/Fault/Multi-Tab;
  - PWA-/Android-Seam -> Source-/Manifest-/Gradle-/URL-/Secretguards in S4;
    realer Android-Smoke ausschließlich im S5-Owner-Gate.
- Owner-Gates:
  - nach S4R separater Auftrag für S4;
  - in S5 separat für produktives SQL und Android-Device-Aktion.
- Empfohlene S4-Ausführungsblöcke:
  - Block A: S4.1-S4.2;
  - Block B: S4.3-S4.4;
  - Block C: S4.5-S4.7;
  - Block D: S4.8 separat;
  - Block E: S4.9-S4.10;
  - Block F: S4.11-S4.12.
- Begründung:
  - gleiche Ownergrenzen und eng gekoppelte Deltas werden gebündelt; SQL bleibt
    wegen eigener Rollback-/Securitygrenze separat.
- Review je Block:
  - gemeinsamer Review mit weiterhin getrennten Substep-Ergebnissen und
    Evidence-IDs; bei grünem internem Gate autonom zum nächsten Block, bei P0/
    P1, Quellenwiderspruch, Scopebedarf oder fehlendem Beleg stoppen.
- Readiness-Findings/Korrekturen:
  - S3-Findings F-ACT-R8-17..21 sind den Substeps vollständig zugeordnet;
  - SQL-Rollback ist jetzt eigenes Sourceartefakt in Block D;
  - Android ist als buildbare Debugsandbox statt Produkt-App-Testpfad definiert;
  - keine zusätzliche Produktentscheidung oder externe Abhängigkeit erforderlich.

### S4R-Readiness-Statusmatrix

<!-- markdownlint-disable MD013 -->

| Evidence | Gatefläche | Realer Stand | Urteil |
| --- | --- | --- | --- |
| EV-ACT-R8-Q01 | Scope/Git | HEAD-Baseline `1e0294f0...`; nur Roadmap/Evidence untracked; kein Produkt-/SQL-Source-Diff | PASS |
| EV-ACT-R8-Q02 | Vertrag/Findings | D-ACT-R8-01..38, F-ACT-R8-01..21 geschlossen; alle S4-Owner/Substeps/Reviews zugeordnet | PASS |
| EV-ACT-R8-Q03 | JS/Runtime | Node 24; Syntaxbaseline 12/12, Contracts 119/119, Katalog 2/80/47/58 grün | PASS |
| EV-ACT-R8-Q04 | SQL/disposable | PG17.6 produktiv read-only; lokale PG17-Full-Fixture grün; v1/v2-Hashes gleich; Rollback-/Preimage-Vertrag exakt | PASS |
| EV-ACT-R8-Q05 | Browser/Harness | Edge vorhanden; echte Module/Adapter und isolierte URL-/SW-/Secretgrenzen definiert; kein Produktload nötig | PASS |
| EV-ACT-R8-Q06 | Android | Gradle 8.7/JDK17/ADB 37; debug App-ID, Resource und Manifest-Cleartext exakt definiert; kein Device angesprochen | PASS mit S5-Owner-Gate |
| EV-ACT-R8-Q07 | Rollback/External Gates | lokale, SQL-Source-, Produkt-SQL- und Devicepfade getrennt; Produkt-SQL/Device bleiben owner-gated | PASS |
| EV-ACT-R8-Q08 | Batches/Resume | A-F sind abhängigkeitsgeordnet; S4 endet vor Produkt-SQL, Device und CodeRabbit; Resume Card vollständig | PASS |

<!-- markdownlint-enable MD013 -->

### S4R-Abschluss - 2026-08-10

- Readiness-Urteil:
  - `READY_FOR_S4`; alle Source-, Tool-, Test-, SQL- und Debug-Lane-
    Voraussetzungen sind belastbar, kein P0/P1 offen.
- Full Review:
  - `PASS`; Substeps, Findings, Dateien, Reviewtiefe, Invalidation, Evidence,
    Rollback und Owner-Gates sind vollständig zugeordnet;
  - keine Produktcode-, SQL-Source-, Runtime-, Browser-, produktive oder Device-
    Mutation in der Discovery Wave.
- S4R Session Resume Snapshot:
  - S1-S4R `DONE`; gültig B01..B06, C01..C07, R01..R17 und Q01..Q08;
  - nächster erlaubter Schritt ist ausschließlich ein separater S4-Folgeauftrag,
    empfohlen in Blöcken A-F;
  - produktives SQL, Android-Device, CodeRabbit und S5 bleiben gesperrt.

Exit: S4 kann ohne neue Produktentscheidung beginnen; Android-Testlane,
Substep-Batches, Invalidation und Owner-Gates sind real belegt. Die autonome
Discovery Wave endet hier.

## S4 - Umsetzung

S4 baut ausschließlich Source, Tests und isolierte Harnesses. Es führt kein
produktives SQL, keinen Android-Device-Smoke und keinen CodeRabbit-Lauf aus.

### S4.1 - Draft-v3-Mapper und Abschlussvalidierung

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag: D-ACT-R8-09 bis -14.
- Dateien: `session-commit.js` und `session-commit.contract.test.js`.
- Umsetzung:
  - strikte Projektion aller Session-/Item-/Setfelder;
  - leere Strength-Zeilen auslassen, vollständige lückenlos ordnen;
  - Fokusziel und sichere Fehlercodes ohne Rohdaten.
- Review: Consumer gegen R6/R2.
- Invalidation: R6-, R2- und Activity-V2-Contracttests.
- Gate: none.

Exit: Jeder gültige Draft besitzt genau eine gültige Payloadprojektion; jeder
ungültige Draft blockiert vor Side Effects.

#### S4.1-Abschluss - 2026-08-10

- Umsetzung:
  - privater, seiteneffektfreier `projectDraft`-Core; keine Namespace-
    Registrierung vor S4.5;
  - exakte Draft-v3-/Katalog-/Policyprüfung, alle acht realen Strength-Policies,
    Duration/Distance/Mixed, ASCII-btrim-Itemnote und lückenlose Setprojektion;
  - payloadfreie stabile Fehlercodes und tiefgefrorenes erstes Fokusziel.
- Findings-Korrektur:
  - F-ACT-R8-22 korrigierte die anfängliche Session-vor-Item-Fehlerpriorität auf
    die eingefrorene Item-/Set-/Feld-vor-Session-Reihenfolge.
- Full Review:
  - `PASS`; zehn direkte Mapper-/R2-Consumerchecks grün, Input unverändert,
    Ausgabe vollständig tiefgefroren, keine Storage-/Netzwerk-/DOM-Wirkung;
  - R6-Draft v3, Activity V1, Produktindex und Service Worker unverändert.
- Status/Evidence:
  - S4.1 `DONE`; EV-ACT-R8-A01 und der Mapperanteil von L01 `PASS`.
- S4.1 Session Resume Snapshot:
  - S4.1 abgeschlossen; S4.2 als nächster autorisierter Substep;
  - geändert nur Commit-Core/Test plus Roadmap/Evidence; S4.3+ gesperrt.

### S4.2 - Zeitvertrag und tiefgefrorener Commit-Intent

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag: D-ACT-R8-06 bis -10 und D-ACT-R8-40/-41.
- Dateien: Commit-Modul und Tests.
- Umsetzung:
  - `ended_at` einmalig injizierbar erfassen;
  - Dauer deterministisch bilden;
  - Intent v1 exakt validieren und deep-freezen.
- Review: Consumer.
- Invalidation: EV-ACT-R8-L01.
- Gate: none.

Exit: Derselbe Draft und Zeitpunkt erzeugt denselben unveränderlichen Intent.

#### S4.2-Abschluss - 2026-08-10

- Umsetzung:
  - `createCommitIntent` liest die injizierte Clock exakt einmal nach grüner
    Projektion, bildet `ended_at`, `max(1, round(delta))` und die 1..1440-Grenze;
  - `validateCommitIntent` prüft gespeichertes JSON gegen denselben Draft/
    dieselbe Semantik und liefert einen neuen tiefgefrorenen geschützten Clone;
  - Intent und Payload besitzen exakt die eingefrorenen geordneten Keys; kein
    Serialize-, Storage- oder Netzwerkpfad.
- Findings-Korrektur:
  - F-ACT-R8-23 schließt den `Date`-/R2-Drift für Jahr 0000 und erweiterte Jahre;
    Start und Ende liegen zwingend in `0001..9999`.
- Full Review:
  - `PASS`; fünf direkte Zeit-/Intent-/R2-Consumerchecks sowie die gemeinsamen
    Block-A-Checks grün; Invalid Draft liest keine Clock, Invalid Clock/Time
    erzeugt keinen Intent;
  - gleiche Draftreferenz und gleicher Clockwert erzeugen strukturell denselben
    Intent; Validator lehnt Key-, Request-, Zeit-, Dauer- und Payloaddrift ab.
- Status/Evidence:
  - S4.2 `DONE`; EV-ACT-R8-A02 und EV-ACT-R8-L01 `PASS`.
- S4.2 Session Resume Snapshot:
  - Block A S4.1-S4.2 `DONE`; 133/133 Activity-V2-Contracts, Syntax 14/14 und
    Katalog 2/80/47/58 `PASS`;
  - `session-commit.js` bleibt unreferenziert und registriert noch keine
    öffentliche API; nächster Scope S4.3-S4.4 nur auf neuen Auftrag;
  - produktives SQL, Android-Device, CodeRabbit und Remote-Commit gesperrt.

### S4.3 - Recovery-Envelope v2 und v1-Lesekompatibilität

Reasoning: `GPT-5.6 Sol / Extra High`.

- Vertrag: D-ACT-R8-03 bis -06, D-ACT-R8-34/-36.
- Dateien: `session-recovery.js`, Recoverytests.
- Umsetzung:
  - Envelope v2 mit `commit_intent` und `commit_attempt`;
  - strikte v1-/v2-Erkennung;
  - kein Upgrade bei bloßem Read/Continue;
  - unbekannte Version/corrupt Intent oder Attempt quarantänisiert ohne
    Discard-/Start-New-/Tombstonepfad.
- Review: Full.
- Invalidation: gesamte R7-Matrix.
- Gate: none.

Exit: Bestehende v1-Drafts bleiben exakt nutzbar, v2 ist strikt und
versioniert.

#### S4.3-Abschluss - 2026-08-10

- Umsetzung:
  - Envelope v2 besitzt exakt elf geordnete Keys und führt `commit_intent` sowie
    `commit_attempt` außerhalb des unveränderten Draft v3;
  - neue R8-Controller-Sessions schreiben ab dem ersten Save v2; aktive v1-
    Sessions bleiben bei Read, Continue, Autosave und normalem Discard v1;
  - aktive v1-Records dürfen ausschließlich bei gleicher vollständiger Draft-
    Observation und validiertem Intent nach v2 wechseln; v2 wird nie nach v1
    zurückgeschrieben;
  - unbekannte Schemas, ambige Records sowie malformed v2-/Intent-/Attempt-
    Wahrheit bleiben unverändert `blocked`; Discard, Start-New und Tombstone
    sind dort `UNSAFE_DISCARD` beziehungsweise `MUTATION_BLOCKED`.
- Findings-Korrektur:
  - F-ACT-R8-24 schließt Versionsdowngrade und falsche Discard-Migration;
  - F-ACT-R8-25 bindet Payloadzahlen, Reihenfolge, Dauer und Itemnotizen an den
    gespeicherten Draft statt nur an die äußere JSON-Form.
- Full Review:
  - `PASS`; exakte v1-/v2-Key-, Active-/Tombstone- und Migrationsübergänge sowie
    Quarantänepfade geprüft; kein Record-Delete und kein Read-/Continue-Upgrade;
  - vollständige R7-Recoverymatrix grün, Activity V1, Draft v3, Produktindex und
    Service Worker unverändert.
- Status/Evidence:
  - S4.3 `DONE`; Envelope-/Kompatibilitätsanteil von EV-ACT-R8-L02 `PASS`.
- S4.3 Session Resume Snapshot:
  - S4.3 abgeschlossen; S4.4 im autorisierten Block B als nächster Substep;
  - geändert nur Recovery-Source/Test plus Roadmap/Evidence; kein Coordinator,
    Netzwerk, SQL, Browserproduktload oder Devicepfad.

### S4.4 - Commit-Intent-/Attempt-CAS und Mutationslock

Reasoning: `GPT-5.6 Sol / Extra High`.

- Vertrag: D-ACT-R8-07, -18 bis -21 und D-ACT-R8-34 bis -36.
- Dateien: Recovery, Draftwrapper, Tests.
- Umsetzung:
  - `get/prepare/beginAttempt/release/complete` persistent-first und
    CAS-geschützt;
  - synchroner Preparation-Lock vor dem ersten Persistenz-Await;
  - Unknown-/Commitlock in allen Mutations-/Discardpfaden;
  - Tombstone und Controllerterminalität erhalten.
- Review: Full.
- Invalidation: R7 Concurrency-/Discard-/Recoverymatrix.
- Gate: none.

Exit: Kein alter oder paralleler Writer kann Intent, Draft oder Tombstone
überschreiben.

#### S4.4-Abschluss - 2026-08-10

- Umsetzung:
  - Recoverycontroller additiv exakt um `getCommitIntent`, `prepareCommit`,
    `beginCommitAttempt`, `releaseCommit` und `completeCommit` erweitert;
  - jeder Metadatenwrite prüft die vollständige vorherige Observation in einer
    Readwrite-Transaktion und gilt erst auf `transaction.oncomplete`;
  - `prepareCommit` prüft bestätigte Revision, Queue, Snapshot und Observation
    ohne Await und setzt den Mutations-/Discardlock synchron vor dem Storecall;
  - Attempt-Claims steigen atomar `null -> 1 -> n+1`, rotieren ihre kanonische
    UUID und werden erst nach Transaction-Complete lokal gehalten;
  - Release verlangt denselben Intent, den lokal gehaltenen aktuellen Attempt 1
    und entsperrt erst nach Complete; Complete verlangt den aktuellen Claim und
    erzeugt ausschließlich den tokenrotierten v2-Generationstombstone.
- Findings-Korrektur:
  - F-ACT-R8-26 erzwingt Attempt-1-Release zusätzlich in der Storetransition;
  - F-ACT-R8-27 hält Destroy auch bei spät settelnden Metadatenwrites terminal;
  - F-ACT-R8-28 lehnt Accessor-/Nicht-JSON-Metadaten vor jedem Feldzugriff ab.
- Full Review:
  - `PASS`; persistent-first, synchroner Lock, Reload ohne lokalen Claim,
    monotone Attempts, stale Observation, Attempt-2-Release, Release-Unlock,
    Complete-Tombstone und Late-Destroy gezielt belegt;
  - Recovery 37/37, gesamte Activity-V2-Matrix 142/142, Syntax 14/14, Katalog
    2/80/47/58 und Produktload-/Draft-v3-/Activity-V1-Guards `PASS`.
- Status/Evidence:
  - S4.4 `DONE`; EV-ACT-R8-L02 `PASS`.
- S4.4 Session Resume Snapshot:
  - Block B S4.3-S4.4 `DONE/PASS`; Block A bleibt nicht invalidiert;
  - nächster Scope ist Block C S4.5-S4.6 ausschließlich auf separaten
    Folgeauftrag; der private Commit-Core bleibt weiterhin ohne öffentliche API;
  - kein Remote-Dispatch, produktives SQL, Android-Device, CodeRabbit,
    Produktload, Dual-Write oder Activity-V2-Cutover ausgeführt.

### S4.5 - Commit-Coordinator und One-Promise-State-Machine

Reasoning: `GPT-5.6 Sol / Extra High`.

- Vertrag: D-ACT-R8-15 bis -22, D-ACT-R8-34/-35/-37/-39/-41.
- Dateien: neue Commit-Moduldatei, Tests.
- Umsetzung:
  - minimale Namespace-API;
  - Finish/Retry/State/Subscribe/Destroy;
  - koaleszierter Doppelklick, Attempt vor Dispatch und terminale Zustände;
  - ein logischer Call bei unveränderter R2-Transportpolicy.
- Review: Full.
- Invalidation: Mapper-, Recovery- und Data-Access-Consumer.
- Gate: none.

Exit: Ein Abschluss besitzt höchstens einen aktiven Dispatch und eine
deterministische Zustandsfolge.

#### S4.5-Abschluss - 2026-08-10

- Umsetzung:
  - öffentlicher, tiefgefrorener Namespace exakt `sessionCommit.create` mit
    expliziten Injections `draft`, `recovery`, `semantics`, `commitSession`,
    `now`; Controller und payloadfreier State besitzen die eingefrorenen
    exakten Oberflächen;
  - `finish()` veröffentlicht State und aktive Promise synchron, koalesziert
    auch Subscriber-Reentranz und ordnet Flush, einen Clockread, synchronen
    Preparation-Lock, Persistenzbestätigung, Attempt-Claim und Dispatch strikt;
  - Controller-Epoch und erneuter Post-Publish-Check verhindern Side Effects
    nach reentrantem oder asynchronem Destroy.
- Findings-Korrektur:
  - F-ACT-R8-29 schließt den reentranten Dispatch nach Destroy;
  - F-ACT-R8-30 verlangt exakte Gleichheit von erzeugtem und bestätigtem
    Intent;
  - F-ACT-R8-32 allowlistet State-Codes und liest fremde Ergebnisfelder ohne
    Accessorausführung.
- Full Review:
  - `PASS`; sieben benannte S4.5-Contracts belegen API/Isolation,
    One-Promise-Reihenfolge, lokale Validation, beide Destroy-Grenzen und
    fail-closed Dependency-/Intentbestätigung;
  - Mapper-, Recovery- und R2-v1-Consumer wurden revalidiert; kein Netzwerk
    ohne bestätigten Intent/Claim und kein Produktload.
- Status/Evidence:
  - S4.5 `DONE`; EV-ACT-R8-A05 und S4.5-Anteil von EV-ACT-R8-L03 `PASS`.
- S4.5 Session Resume Snapshot:
  - S4.5 `DONE/PASS`; keine offenen P0/P1-Findings;
  - internes Gate zu S4.6 innerhalb des explizit freigegebenen Blocks
    bestanden; S4.7, Produktload, SQL, Browserproduktlauf und Device bleiben
    unberührt.

### S4.6 - Known-, Unknown-, Replay- und Cleanup-Pfade

Reasoning: `GPT-5.6 Sol / Extra High`.

- Vertrag: D-ACT-R8-16 bis -20, D-ACT-R8-32/-34.
- Dateien: Commit/Recovery und Tests.
- Umsetzung:
  - Fehlerklassifikation;
  - identischer Retry nach Reload;
  - Intentrelease nur beim sicher allein gehaltenen Attempt 1;
  - Claimkonflikt/Attempt >1 bleibt auch bei Known-Ergebnis `unknown`;
  - Replay plus Cleanup nach Tombstonefehler.
- Review: Full.
- Invalidation: EV-ACT-R8-L03.
- Gate: none.

Exit: Jeder Fehlerpfad schützt entweder editierbaren Draft oder identischen
Commit-Intent, nie einen mehrdeutigen Zwischenzustand.

#### S4.6-Abschluss - 2026-08-10

- Umsetzung:
  - `AUTH_REQUIRED`, `INVALID_SESSION` und belegtes pre-dispatch
    `REQUEST_FAILED` lösen nur unter dem lokal gehaltenen Attempt 1 einen
    persistent bestätigten Release aus; Attempt >1, Claimfehler und
    mehrdeutige Ausgänge bleiben `unknown`;
  - `release_pending` wiederholt ausschließlich den lokalen Release und hält
    den Known-Code flüchtig; Unknown-, Reload- und Cleanup-Retries claimen neu
    und senden unverändert dieselbe Request-ID und Payload;
  - Created/Replay wird erst nach bestätigtem Recovery-State `destroyed` zu
    `committed`; fehlerhafte oder malformed Release-/Complete-Bestätigungen
    bleiben sicher pending, Idempotenzkonflikte bleiben gesperrt.
- Findings-Korrektur:
  - F-ACT-R8-31 validiert die Release-/Complete-Bestätigungswerte vor einem
    entsperrenden oder terminalen Übergang;
  - F-ACT-R8-33 erhält die Known-Klassifikation über den rein lokalen
    Release-Retry.
- Full Review:
  - `PASS`; acht benannte S4.6-Contracts decken Resume, Known Attempt 1/2,
    Release-Pending, Unknown/malformed/Idempotenzkonflikt, identischen
    Unknown-Retry, Claimfehler, Cleanup-Replay und malformed Bestätigungen ab;
  - Commit-Contracts 28/28, Recovery 37/37, gesamte Activity-V2-Matrix
    156/156, Syntax 14/14 und Katalog 2/80/47/58 `PASS`.
- Status/Evidence:
  - S4.6 `DONE`; EV-ACT-R8-A06 und EV-ACT-R8-L03 `PASS`.
- S4.6 Session Resume Snapshot:
  - Teilblock C S4.5-S4.6 `DONE/PASS`; keine offenen blockierenden Findings;
  - `STOP vor S4.7`; die additive Data-Access-Semantikinjektion benötigt einen
    separaten Folgeauftrag;
  - kein produktiver Dispatch, SQL, Browserproduktlauf, Android-Device,
    CodeRabbit, Dual-Write oder Activity-V2-Cutover wurde ausgeführt.

### S4.7 - Versionsgebundene Semantikinjektion in Data Access

Reasoning: `GPT-5.6 Sol / Extra High`.

- Vertrag: D-ACT-R8-23/-37.
- Dateien: `data-access.js`, Contracttests.
- Umsetzung:
  - optionale explizite `semantics` für Commit;
  - strikte Versionsgleichheit;
  - v1-Default und Requestbody unverändert.
- Review: Consumer gegen alle bisherigen R2-Aufrufe.
- Invalidation: R2 Data-Access-Matrix.
- Gate: none.

Exit: v1/v2-Payloads werden ausschließlich gegen ihre injizierte Semantik
validiert, ohne API- oder Bodydrift.

#### S4.7-Abschluss - 2026-08-10

- Umsetzung:
  - `commitSession` akzeptiert weiterhin exakt `{requestId,payload}` und
    additiv `{requestId,payload,semantics}`; ohne Injection wird ausschließlich
    der unveränderte produktisolierte v1-Namespace gewählt;
  - Requestnormalisierung und vollständige Commit-Responseprüfung verwenden
    dieselben einmal descriptorbasiert gebundenen Semantikmethoden und verlangen
    exakte Gleichheit zwischen Semantikkatalog, Payload- und Response-
    Itemversion;
  - der RPC-Body bleibt exakt `{p_request_id,p_payload}`, wird weiterhin nur
    einmal serialisiert und bei höchstens zwei Transportversuchen identisch
    wiederverwendet; Semantik gelangt weder in Body noch Header.
- Findings-Korrektur:
  - F-ACT-R8-34 bindet jede Response-Itemversion zusätzlich direkt an die
    Request-Katalogversion und stabilisiert die Methoden über den Await;
  - F-ACT-R8-35 ersetzt den unvollständigen Commit-Optionscheck durch exakte
    Own-Key-/Dataproperty-Prüfung ohne Accessorausführung.
- Full Review:
  - `PASS`; drei benannte S4.7-Contracts belegen v2-Success samt identischem
    Doppeltransportbody, unveränderten v1-Default, Options-/Katalog-Fail-Closed
    vor Transport sowie Response-Policy-/Versionsdrift als `unknown`;
  - vollständige Data-Access-Matrix 16/16, Commit 28/28, Recovery 37/37,
    gesamte Activity-V2-Matrix 159/159, Syntax 14/14 und Katalog 2/80/47/58
    `PASS`;
  - offizieller Supabase-Check bestätigt für PostgREST v14 keine erwartete
    Breaking Change; die 2026er Data-API-Exposure-Änderung betrifft neue
    Grants/OpenAPI, nicht den bestehenden explizit gehärteten RPC-Vertrag.
- Status/Evidence:
  - S4.7 `DONE`; EV-ACT-R8-A07 und EV-ACT-R8-L04 `PASS`.
- S4.7 Session Resume Snapshot:
  - Block C S4.5-S4.7 `DONE/PASS`; keine offenen blockierenden Findings;
  - `STOP vor S4.8`; SQL-22-Source, exakter Rollback und jede produktive SQL-
    Ausführung benötigen den separaten nächsten Auftrag beziehungsweise das
    spätere Owner-Gate;
  - kein produktiver Remoteaufruf, SQL, Browserproduktlauf, Android-Device,
    CodeRabbit, Dual-Write oder Activity-V2-Cutover wurde ausgeführt.

### S4.8 - SQL 22 Katalogkompatibilität, Hardening und Rollback

Reasoning: `GPT-5.6 Sol / Extra High`.

- Vertrag: D-ACT-R8-24 bis -27, D-ACT-R8-31/-38.
- Dateien:
  - `sql/22_Activity_V2_Commit_Compatibility.sql`;
  - `sql/22_Activity_V2_Commit_Compatibility_Rollback.sql`;
  - passende disposable Fixture/Assertions;
  - `sql/HOW_TO.md`.
- Umsetzung:
  - kontrolliertes `CREATE OR REPLACE FUNCTION`;
  - versionsgebundene Item-/Policyprüfung;
  - eingefrorene R2-/R8-Preimage-Driftguards, Rerun und
    Owner/Search-Path/ACL-Hardening;
  - minimaler rollback-only R2-Functionpfad samt eigenem Guard;
  - `sql/16_Explicit_Grants.sql` nur bei bewiesenem Vertragsdrift ändern;
  - keine produktive Ausführung.
- Review: Full SQL/Security/Consumer.
- Invalidation: R2 SQL-/Race-/ACL-/RLS-/Advisor-Matrix.
- Gate: produktives SQL ausdrücklich nicht Teil von S4.

Exit: Source und disposable Fixture beweisen v1/v2/new-highest/replay ohne
Katalog- oder ACL-Drift.

- Umsetzung:
  - `sql/22_Activity_V2_Commit_Compatibility.sql` akzeptiert ausschließlich
    den PG17-`pg_get_functiondef`-SHA-256 des kanonischen R2-Preimage
    `2241cea9…1418e` oder des exakten R8-Reruns `7cdabca3…5177e`;
  - der Forward ist gegen SQL 20 mechanisch exakt bis auf Entfernung des
    `max(catalog_version)`-Gates und Bindung von Existenzcheck, Itemlookup und
    Snapshots an `v_client_catalog_version`;
  - der getrennte Rollback akzeptiert ausschließlich `7cdabca3…5177e` und
    stellt die kanonische R2-Funktion bytegenau wieder her;
  - beide Dateien verlangen PostgreSQL 17, genau einen Commit-Overload,
    kanonische Owner-/Security-/Volatility-/Search-Path-/ACL-Eigenschaften,
    Strukturhash `657f31c1…ee14` sowie exakte v1/v2-Inhaltsfingerprints;
  - transaktionale Vorher-/Nachher-Snapshots schützen alle Katalogversionen,
    vier Tabellen samt Struktur/RLS/Policies/ACL, Lookup-Source und vorhandene
    Session-/Item-/Setzähler; persistente Wirkung bleibt auf den Commit-RPC und
    dessen bereits eingefrorenes Hardening begrenzt;
  - `sql/16_Explicit_Grants.sql` blieb mangels Vertragsdrift unverändert.
- Findings-Korrektur:
  - F-ACT-R8-36 korrigiert die nicht qualifizierbare
    `pg_catalog.coalesce`-Schreibweise nach atomarem Erstabbruch;
  - F-ACT-R8-37 macht den v1/v2-Fixturesnapshot über die echte
    Zwei-Verbindungs-`\connect`-Grenze haltbar und entfernt ihn am Ende.
- Full Review:
  - `PASS`; Forward entspricht exakt dem erwarteten minimalen R2-Delta,
    Rollback exakt R2; kein `max(catalog_version)` verbleibt im Forward;
  - guarded PostgreSQL 17.6 Full-Fixture `PASS`: Fresh, R2->R8, R8-Rerun,
    Overload-/Source-/Hardening-/ACL-/RLS-/Katalogdrift fail-closed, v1/v2 bei
    zusätzlicher v3, v3-Commit, fehlendes Item, Policyabweichung,
    Responseverlust/Replay, Replay trotz nachträglich inaktivem Katalogeintrag,
    Auth/Anonymous/Foreign-User/DML-Isolation, zwei dblink-Races, exakter
    R8->R2-Rollback, abgewiesener zweiter Rollback und R2->R8-Restoration;
  - Endstand der Fixture: v1/v2/andere Versionen `78/80/0`,
    Sessions/Items/Sets `0/0/0`, R8-Source `7cdabca3…5177e`; falsche
    Datenbank wird vor Mutation abgewiesen; Testdatenbank und lokaler Stack
    danach entfernt;
  - Supabase Schema-Lint `0` Fehler; Activity-V2-Security-Advisor
    `0` Findings. Nur elf scaffold-fremde `rls_enabled_no_policy`-Infos und
    zwei erwartete `unused_index`-Infos in der frischen Wegwerf-DB;
  - gesamte Activity-V2-Matrix 159/159, Syntax 14/14, Katalog 2/80/47/58,
    `git diff --check` und Whitespace-Guard `PASS`.
- Status/Evidence:
  - S4.8 `DONE`; EV-ACT-R8-A08 und EV-ACT-R8-L05 `PASS`;
  - Forward-Datei-SHA-256 `429520e5…b3d0e3`, Rollback
    `7cefeb94…3e2da8`, Fixture `71e99a21…41c9a`.
- S4.8 Session Resume Snapshot:
  - Block D S4.8 `DONE/PASS`; keine offenen blockierenden Findings;
  - `STOP vor S4.9 / Block E`; S4.9-S4.10 benötigen einen separaten
    Folgeauftrag;
  - die konditionale Owner-Freigabe dieses Chats wurde nicht verbraucht, weil
    produktives SQL für Source und disposable Nachweis nicht erforderlich und
    gemäß S4-Grenze nicht Teil dieses Blocks war;
  - kein produktiver Remoteaufruf oder SQL, keine synthetische produktive
    Session, kein Browserproduktlauf, Android-Device, CodeRabbit, Dual-Write,
    physisches Recovery-Delete oder Activity-V2-Cutover wurde ausgeführt.

### S4.9 - Isolierte Shell-Finish- und Retry-Integration

Reasoning: `GPT-5.6 Sol / Extra High`.

- Vertrag: D-ACT-R8-15 bis -22.
- Dateien: `session-shell.js`, CSS, Shelltests.
- Umsetzung:
  - explizit injizierter Coordinator;
  - Finish, Fokusfehler, Busy, Unknown, Retry, Cleanup und Erfolg;
  - Timer friert nur mit persistentem Intent;
  - Close/Escape bei Unknown/Cleanup schließt höchstens die Ansicht und ruft
    niemals Recovery-Discard oder physische Löschung auf;
  - Legacy-Mounts unverändert.
- Review: Consumer/A11y.
- Invalidation: R3-R7 Shell-/Lifecyclematrix.
- Gate: none.

Exit: Der isolierte Nutzerfluss erklärt jeden Zustand ruhig und verhindert
gefährliche Aktionen.

#### S4.9-Abschluss - 2026-08-10

- Umsetzung:
  - optionale Injection heißt exakt `sessionCommit`, akzeptiert nur den
    tiefgefrorenen exakten Coordinator und besitzt keinen globalen Data-Access-
    oder Netzwerkfallback; Mounts ohne Injection behalten ihren bisherigen DOM-
    und Lifecyclevertrag;
  - Finish-/Retry-Card bildet Editing, Preparing, Committing, Known,
    Release-Pending, Unknown, Cleanup-Pending, Blocked und Commit mit sicherer
    deutscher Copy, `aria-live`, `aria-busy`, koaleszierter Buttonbedienung und
    exaktem Fokusziel ab;
  - Draftmutationen sind außerhalb `editing`/`not_committed` gesperrt; der
    sichtbare Timer friert erstmals bei bestätigtem `intent_present`, bleibt
    durch Unknown/Cleanup/Commit stabil und läuft ausschließlich nach
    bestätigtem Intent-Release wieder;
  - Preparing/Committing sperren Close; Unknown, Release-/Cleanup-Pending,
    Blocked und Committed schließen ausschließlich die Ansicht und rufen nie
    Recovery-Discard oder physisches Löschen auf; die Shell übernimmt weder
    Destroy- noch Persistenzownership des injizierten Coordinators.
- Findings-Korrektur:
  - F-ACT-R8-38 verschiebt den Fokus bei terminal ausgeblendeter Abschlussaktion
    auf den erlaubten Close-Button;
  - F-ACT-R8-39 akzeptiert neben der unveränderten exakten R7-Recovery-
    Oberfläche auch die vollständige exakte R8-Erweiterung, ohne beliebige
    Zusatzmethoden zuzulassen.
- Full Review:
  - `PASS`; Consumer-/A11y-Review, alle neun Commit-UX-Zustände, Focus, Busy,
    Timerfreeze/-resume, Finish-/Retry-Doppelklick und View-Close ohne Discard
    gezielt belegt;
  - Shell 42/42; die ursprüngliche S4.9-Matrix 163/163 und nach realem R8-
    Harness-Mount/F-ACT-R8-39 die finale Block-E-Matrix 167/167, Syntax 17/17,
    Katalog 2/80/47/58, `git diff --check` und Produktload-/V1-/Draft-v3-Guards
    `PASS`.
- Status/Evidence:
  - S4.9 `DONE`; EV-ACT-R8-A09 und S4.9-Anteil von EV-ACT-R8-L06 `PASS`.
- S4.9 Session Resume Snapshot:
  - S4.9 `DONE/PASS`; keine offenen blockierenden Findings;
  - internes Gate zu S4.10 innerhalb des explizit freigegebenen Blocks E
    bestanden; S4.11 bleibt außerhalb dieses Auftrags;
  - kein Produktload, Remoteaufruf, produktives SQL, Android-Device,
    synthetischer produktiver Datensatz, Dual-Write, Recovery-Delete oder
    Activity-V2-Cutover.

### S4.10 - Commit- und Fault-Injection-Harness

Reasoning: `GPT-5.6 Sol / Extra High`.

- Vertrag: D-ACT-R8-15 bis -20, D-ACT-R8-27 und D-ACT-R8-34/-35/-37.
- Dateien: isolierter Commit-Harness und Adapter.
- Umsetzung:
  - Fixtures für alle Zustände, Attempt-Claims und Zwei-/Drei-Tab-Races;
  - kontrollierte Delays, Responseverlust und Cleanupfehler;
  - keine echten Credentials oder produktiven Endpunkte.
- Review: Consumer.
- Invalidation: Browsermatrix.
- Gate: none.

Exit: Alle Commitzustände sind deterministisch und ohne Produktload testbar.

#### S4.10-Abschluss - 2026-08-10

- Umsetzung:
  - ein isolierter, gefrorener Harness-Adapter modelliert Created, Replay,
    Known-Fehler, Responseverlust nach serverseitigem Erfolg, malformed Outcome,
    kontrollierte Delays und Request-/Payloadidentität ohne produktiven Endpoint,
    Credential oder Payloaddiagnose;
  - ein kontrollierter Storage-Adapter injiziert Intent-, Release- und Cleanup-
    Fehler über dem realen Recovery-Store; Attempt-Claims und Tombstones laufen
    durch die produktisolierte R8-CAS-Implementierung, physisches Delete bleibt
    ausgeschlossen;
  - HTML/CSS/JS laden ausschließlich die realen isolierten Semantik-, Draft-,
    Recovery-, Commit- und Shellmodule. Fixtures decken Success, Known,
    Release-Pending, Unknown, Cleanup-Pending, Blocked, Preparing, Committing,
    Reload, Zwei-/Drei-Tab-Races und die gesamte Zustandsmenge ab;
  - Reload und Races verwenden denselben persistenten Recovery-Slot: Unknown
    wird nur mit identischer Intent-Identität erneut beansprucht; genau ein
    Teilnehmer committet, alle CAS-Verlierer bleiben konservativ Unknown.
- Findings-Korrektur:
  - F-ACT-R8-39 schließt die beim realen Modulmount gefundene R7/R8-
    Recovery-Oberflächeninkompatibilität;
  - F-ACT-R8-40 ergänzt payloadfreie Fehlerstufe/-klasse und korrigiert den
    Blocked-Fixturevertrag auf `blocked` ohne Dispatch statt eines unbelegten
    Retry-Erfolgs.
- Full Review:
  - `PASS`; vier direkte Harnesscontracts, Shell 42/42, gesamte Activity-V2-
    Matrix 167/167, Syntax 17/17, Katalog 2/80/47/58, `git diff --check` sowie
    Produktindex-/Service-Worker-/Activity-V1-/Draft-v3-Guards grün;
  - frischer Browserlauf `all` endet payloadfrei mit `COMMITTED/PASS`, allen
    zehn Coordinatorzuständen, vier Dispatches und stabiler Identität;
    Reload endet nach Attempts 1/2 als Replay-Commit;
  - Zwei-Tab-Race: ein Commit/ein Unknown, drei Attemptbeobachtungen 1/2/2;
    Drei-Tab-Race: ein Commit/zwei Unknown, vier Attemptbeobachtungen 1/2/2/2;
    jeweils genau zwei Serverdispatches (Created plus identischer Replay);
  - Unknown-, Release- und Cleanup-Retry wurden interaktiv belegt; Preparing
    und Committing sperren Mutationen und Close; terminaler Erfolg verschiebt
    den Fokus sicher auf Close. Der frische Audit-Tab hatte keine Page-Logs;
  - 1440x900, 390x844 und 320x800 bleiben ohne horizontalen Overflow; mobile
    Retry-/Close-Aktionen erfüllen mindestens 44 px. Ein echter 30-s-
    Background-/Offline-/Android-Prozessnachweis wird hier ausdrücklich nicht
    behauptet und bleibt der S5-Lifecycle-Matrix vorbehalten.
- Status/Evidence:
  - S4.10 `DONE`; EV-ACT-R8-A10 und der S4.9/S4.10-Anteil von EV-ACT-R8-L06
    `PASS`; kein produktives SQL, Remote-Write, Device oder Deploy.
- S4.10 Session Resume Snapshot:
  - Block E / S4.9-S4.10 `DONE/PASS`; F-ACT-R8-38 bis -40 geschlossen, keine
    offenen blockierenden Findings;
  - Readiness `READY_FOR_S4.11`, aber harter `STOP` vor S4.11; dieser Schritt
    benötigt gemäß Ownerauftrag einen separaten Folgeauftrag;
  - Activity V1 bleibt einziger produktiver Consumer, Draft v3 unverändert,
    kein Dual-Write/Cutover, keine synthetische produktive Trainingssession,
    kein Recovery-Delete und kein Remote-Commit ohne persistent bestätigten
    exakten Intent.

### S4.11 - Lokale Test-PWA- und Android-Seams

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag: D-ACT-R8-27/-28/-30/-33.
- Dateien: Debugblock in `android/app/build.gradle.kts`, neu ausschließlich
  `android/app/src/debug/AndroidManifest.xml` und
  `android/app/src/debug/res/values/strings.xml`, dazu isolierte Test-PWA-/
  Harnessartefakte und Runbook; `src/main`/Release bleiben unverändert.
- Umsetzung:
  - minimaler lokaler PWA-Scope für Install/Resume;
  - Debug-Application-ID-Suffix, Debug-URL-Resource und Cleartext ausschließlich
    im Debugmanifest; Main-/Release-Ressourcen bleiben unverändert;
  - localhost-/ADB-Reverse-Konfiguration ohne Device-Ausführung;
  - temporäre lokale Supabase-Konfiguration ohne Repo-Secret;
  - Stop-/Resume-Anweisungen ohne App-Data-Clear, Uninstall oder physisches
    Recovery-Record-Delete.
- Review: Full auf Produkt-/Service-Worker-Isolation.
- Invalidation: Android- und PWA-Smoke.
- Gate: keine Device-Aktion in S4.

Exit: S5 kann den Android-Smoke ausführen, ohne produktive App oder Daten zu
verwenden.

#### S4.11-Abschluss - 2026-08-11

- Umsetzung:
  - `android/app/build.gradle.kts` besitzt ausschließlich für `debug` den
    Suffix `.activityv2test`; Debug-Manifest und Debug-Strings setzen nur dort
    localhost, Testidentität und Cleartext;
  - die neue `test-pwa` besitzt eigenes Manifest, Icon, Bootstrap und einen auf
    ihren Unterpfad begrenzten Worker. Der Bootstrap erlaubt nur Loopback und
    lädt die realen R8-Module erst nach exakter Worker-Kontrolle;
  - das Runbook trennt Harnessport 8765 und lokale Supabase-API 54321, übernimmt
    temporäre ANON-Konfiguration nur interaktiv und hält alle Device-Aktionen
    hinter dem S5-Owner-Gate.
- Findings-Korrektur:
  - F-ACT-R8-41 geschlossen: ein fremder lokaler Parent-Worker verursachte im
    ersten Browserlauf eine Mischversion/`INVALID_OPTIONS`; versionierter
    Test-Worker-Claim vor dynamischem Modulload macht den Wiederholungslauf
    deterministisch grün.
- Invalidation:
  - vier direkte S4.11-Contracts; Gesamtmatrix 171/171, rekursive Syntax 20/20,
    Katalog `2/80/47/58`, `git diff --check` und Secret-/Produkt-/V1-/Draft-v3-
    Guards PASS;
  - `assembleDebug` und `assembleRelease` PASS; Debug-Merge besitzt
    `de.schabuss.midas.activityv2test` und Cleartext, Release-Merge exakt
    `de.schabuss.midas` ohne Cleartext;
  - Browser `all` COMMITTED/PASS; Unknown -> identischer Retry mit Attempts 1/2
    und zwei Dispatches; 1440x900, 390x844 und 320x800 ohne Horizontaloverflow,
    mobile Aktionen mindestens 45 px. Kein Device angesprochen.
- Full Review:
  - `PASS` nach F-ACT-R8-41; Produktindex, Produkt-Service-Worker, Android
    `src/main`, Activity V1 und Draft v3 ohne Diff. Der bestehende nicht
    blockierende Gradle-Lint-Metadatenhinweis änderte weder Buildausgang noch
    Releaseidentität und stammt nicht aus dem S4.11-Delta.
- Status-/Evidence-Sync:
  - S4.11 `DONE`; EV-ACT-R8-A11/L07 `PASS`. S5-Device-Evidence EV-ACT-R8-D01
    bleibt ausdrücklich `USER-GATED`.
- S4.11 Session Resume Snapshot:
  - Branch/HEAD unverändert, R8-Worktree beabsichtigt; Baseline 171/171,
    Syntax 20/20, Katalog `2/80/47/58`, Android Debug/Release PASS;
  - internes Gate zu S4.12 innerhalb des freigegebenen Blocks F bestanden.

### S4.12 - Integrierte Isolation und Delta-Härtung

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag: D-ACT-R8-02, -27 bis -30.
- Dateien: Contracttests, statische Guards, Diagnoseprojektionen.
- Umsetzung:
  - keine Payloads in Logs/Fehlern;
  - Produkt-Script-/V1-/Service-Worker-/Netzwerkguards;
  - günstige integrierte Tests ohne S5-CodeRabbit.
- Review: Full des S4-Diffs.
- Invalidation: gesamte S5-Matrix bleibt trotzdem offen.
- Gate: none.

Exit: S4 ist implementiert, reviewt und lokal bereit für das unabhängige S5-
Gesamtgate.

#### S4.12-Abschluss - 2026-08-11

- Umsetzung:
  - `tools/activity-v2-r8-isolation.mjs` prüft den realen Git-Diff gegen sieben
    geschützte Produktflächen, Produkt-V2-Loads, Core-Netzwerkkanten, unsichere
    Diagnoseprojektionen, Secretmaterial, Recovery-Deletes und den lokalen
    Worker-Scope; Ausgabe enthält nur aggregierte Zähler;
  - vier `isolation.contract.test.js`-Verträge binden diesen Guard, den
    Injection-only-Core, die lokale Adapterkante und die produktive V1-/SW-/
    Android-Main-Isolation;
  - Data-Access-Fehlerdiagnostik enthält nur Operation, stabilen Code und Status.
    Request-ID, Payload, Serverdetail und Fremdexceptiontext werden nicht geloggt.
- Findings-Korrektur:
  - F-ACT-R8-42 geschlossen: ein expliziter Request-ID-/Payload-Sentinel in
    einer Transportexception bleibt aus Error und Diagnostik vollständig fern.
- Invalidation:
  - vier direkte S4.12-Contracts; finale Activity-V2-Matrix 175/175;
    rekursive Syntax 21/21 plus Isolationstool 1/1; Katalog `2/80/47/58`;
  - Isolationprojektion exakt `protected=7`, `product_v2_loads=0`,
    `core_network_edges=0`, `unsafe_diagnostics=0`, `secret_material=0`,
    `recovery_deletes=0`, `local_worker_scope=1`;
  - Android Debug/Release erneut PASS, `git diff --check` und untracked
    Whitespaceguard PASS. SQL-22-Quellen unverändert; kein SQL-Rerun in S4.12.
- Full Review des gesamten S4-Diffs:
  - `PASS` nach F-ACT-R8-42. Frühere S4.1-S4.11-Evidence bleibt gültig;
    S4.11-Browsernachweis ist nicht invalidiert, weil S4.12 keine PWA-/Shell-/
    Recovery-/Commitquelle geändert hat;
  - kein Produktload, Dual-Write, Cutover, Deploy, produktives SQL, Devicezugriff,
    Secret oder physisches Recovery-Delete; Activity V1 bleibt einziger
    produktiver Consumer und Draft v3 bleibt unverändert;
  - CodeRabbit, disposable SQL-Rerun, 30-s-Background/Offline, produktiver
    Preflight/SQL und Android-Prozess-Reclaim bleiben ausschließlich S5.
- Status-/Evidence-Sync:
  - S4.12 und S4 `DONE`; EV-ACT-R8-A12/L08 `PASS S4.12; S5 RERUN`.
- Readiness-Urteil:
  - `READY_FOR_S5_WITH_OWNER_GATES`; keine offenen In-Scope-P0/P1-Findings.
  - S5 muss als separater Folgeauftrag starten. Produktives SQL und Android-
    Device-Nachweise bleiben innerhalb S5 getrennte Owner-Gates.
- S4.12 Session Resume Snapshot:
  - Branch `main`, HEAD `1e0294f0f514eec9b08b9b4f3e8e57d435d0bdd6`,
    beabsichtigter uncommitteter R8-Worktree; nichts zurücksetzen;
  - finale Block-F-Baseline 175/175, Syntax 21/21 + 1/1, Katalog
    `2/80/47/58`, Android Debug/Release PASS;
  - lokaler HTTP-Server gestoppt, Browser-Prüftabs geschlossen, kein lokaler
    Supabase-Stack gestartet und kein Device angesprochen;
  - `HARTER STOP VOR S5`.

## S5 - Tests, SQL-/Runtime-/Device-Gates und Abschlussreview

Reasoning: `GPT-5.6 Sol / Extra High`.

Deterministische Reihenfolge:

1. Git-/Secret-/Syntax-/Diff-/Katalog-/Link-Hygiene ausführen.
2. Vollständige Activity-V2-Node-Contractmatrix ausführen.
3. Recovery-v1/v2-, Commit-Intent-/Attempt-, Quarantäne-, Multi-Tab-, Race- und
   Fehlerfixtures ausführen.
4. Frischen disposable Supabase-Stack und SQL-22-/Rollback-Full-Fixture ausführen;
   lokale Testdaten vollständig entfernen und Stack stoppen.
5. Gebündelte Desktop-/Mobile-Browsermatrix im Commit-Harness ausführen.
6. Full Code, Contract, SQL und Security Review des finalen Diffs.
7. CodeRabbit gegen denselben finalen Diff ausführen, Findings bewerten, nur
   berechtigte Findings korrigieren und invalidierte Checks wiederholen.
8. Produktiven Supabase-Preflight read-only erfassen und SQL-Hash einfrieren.
9. Owner vor produktivem SQL briefen und explizite Freigabe abwarten.
10. Nach Freigabe ausschließlich SQL 22 ausführen; bei Drift/Fehler sofort
    stoppen. Danach read-only Postconditions/Advisor prüfen. Keine Session.
11. Android-Preflight briefen und Device-Freigabe abwarten.
12. Nach Freigabe lokalen testgebundenen Android-PWA-Smoke einmal gebündelt
    ausführen: Background, Prozess-Reclaim, Resume, Commit, Tombstone und Reload;
    kein Data-Clear, Uninstall oder Recovery-Delete.
13. Finale günstige invalidierte Checks und Evidence-Digest aktualisieren.

<!-- markdownlint-disable MD013 -->

| ID | Ebene | Check / Smoke | Status | Nachweis | Invalidiert durch |
| --- | --- | --- | --- | --- | --- |
| T-ACT-R8-01 | lokal | `git status`, Secret-/Produktload-/V1-Diff-Guard, `git diff --check` | PASS S5 | EV-ACT-R8-L08/F01 | jeder Diff |
| T-ACT-R8-02 | lokal | alle Activity-V2-JS-Dateien `node --check` | PASS 21/21 | EV-ACT-R8-L08/F01 | JS |
| T-ACT-R8-03 | lokal | vollständige `*.contract.test.js`-Suite | PASS 179/179 | EV-ACT-R8-L01..L04/L08/F01 | Activity-V2-JS/Tests |
| T-ACT-R8-04 | lokal | `node tools/activity-catalog.mjs check` | PASS 2/80/47/58 | EV-ACT-R8-L04/F01 | Semantik/Katalog |
| T-ACT-R8-05 | lokal | Mappermatrix Strength/Duration/Distance/Mixed/Invalid | PASS S5 | EV-ACT-R8-L01 | Mapper |
| T-ACT-R8-06 | lokal | Envelope v1/v2, Intent-/Attempt-CAS, Preparation-Lock, Quarantäne, Tombstone und Corrupt-State | PASS S5 | EV-ACT-R8-L02 | Recovery |
| T-ACT-R8-07 | lokal | Doppelklick, Attempt-Claims/Multi-Tab, Known/Release-Pending, Unknown, Close/Escape ohne Discard, Replay, Cleanupfailure, Destroy/Races | PASS S5 | EV-ACT-R8-L03/L06 | Coordinator/Recovery |
| T-ACT-R8-08 | lokal | v1-Default und v1/v2-Semantikinjektion im Data Access | PASS S5 | EV-ACT-R8-L04 | Data Access |
| T-ACT-R8-09 | disposable | SQL 22 fresh/Rerun/Preimage-Drift/Rollback/Rerun, fehlendes verwendetes Item, Policyabweichung, C2-Snapshotcheck, Overload und Hardening | PASS S5 | EV-ACT-R8-L05 | SQL 22/Rollback |
| T-ACT-R8-10 | disposable | Commit v1/v2 bei zusätzlicher höherer Version, unknown/replay/race | PASS S5 | EV-ACT-R8-L05 | SQL/RPC |
| T-ACT-R8-11 | disposable | Auth, anonymous, foreign user, direct DML, RLS/ACL/Advisor | PASS S5 | EV-ACT-R8-L05 | SQL/ACL/RLS |
| T-ACT-R8-12 | Browser | Harness alle Zustände, Known/Release/Unknown/Retry/Cleanup/Reload und 2-/3-Tab-CAS-Races | PASS S5 | EV-ACT-R8-L06 | Shell/Commit/Recovery |
| T-ACT-R8-13 | Browser | 1440x900, 390x844, 320x800, Fokus/A11y/Overflow | PASS S5 | EV-ACT-R8-L06 | UI/CSS |
| T-ACT-R8-14 | Browser | mindestens 30 Sekunden Background plus identischer Intent/Timer | PASS mit dokumentierter Visibility-Automationsgrenze | EV-ACT-R8-L06 | Lifecycle/Time |
| T-ACT-R8-15 | Review | Full native Code/Contract/SQL/Security Review | PASS S5 | F-ACT-R8-43..60 | finaler Diff |
| T-ACT-R8-16 | Review | CodeRabbit, Findingbewertung, nötiger Rerun | DEFERRED BY OWNER; F43-F61 FIXED, FINAL ZERO-RUN NOT OBTAINED | EV-ACT-R8-S505/Findings | Codeänderung |
| T-ACT-R8-17 | produktiv read-only | RPC/Katalog/ACL/RLS/Zähler/Hash-Preflight | PASS S5 | EV-ACT-R8-PRE01/-02/-03 | produktive DB |
| T-ACT-R8-18 | produktiv write | SQL 22 owner-gated, keine Session | PASS S5 | EV-ACT-R8-W01/P01 | SQL-Hash/Freigabe |
| T-ACT-R8-19 | Android Device | debug-only Test-PWA-Prozess-Reclaim plus Resume/Commit/Tombstone/Reload ohne Produkt-App-Daten oder physisches Delete | NOT EXECUTED; OWNER-ACCEPTED EVIDENCE GAP, ADB DEVICE COUNT 0 | EV-ACT-R8-D01 | Android-/Harness-Diff |
| T-ACT-R8-20 | final | günstige invalidierte Matrix und Isolation erneut | PASS PRE-DEVICE; POST-DEVICE NOT APPLICABLE BECAUSE T19 NOT EXECUTED | EV-ACT-R8-F01 | Findings/Runtime-Gates |

<!-- markdownlint-enable MD013 -->

Produktives SQL-Briefing muss mindestens erklären:

- geändert wird nur die Katalogversionsprüfung im bestehenden Commit-RPC;
- Tabellen, Katalogzeilen, RLS, ACL-Zielzustand und Activity V1 bleiben
  unverändert;
- es wird keine Trainingssession erzeugt;
- bei Hash-, Objekt-, Owner-, ACL-, Katalog- oder Advisor-Drift wird nicht
  ausgeführt beziehungsweise sofort gestoppt.

Android-Briefing muss mindestens erklären:

- getestet wird eine lokale isolierte PWA mit disposable Daten;
- Force-Stop/Prozess-Reclaim kann die Test-PWA schließen, nicht aber MIDAS-
  Produktionsdaten verändern;
- Recovery gilt nur je Browserprofil/Origin, nicht cross-device;
- gebaut und gegebenenfalls installiert wird ausschließlich die debug-only
  Testvariante mit eigener Application-ID; Release-/Produkt-APK und Produkt-
  App-Daten bleiben unverändert;
- kein App-Data-Clear, Uninstall oder physisches Recovery-Record-Delete als
  Cleanupabkürzung.

Ergebnis:

- Grüne Nachweise:
  - T-/EV-IDs nach Ausführung.
- Wiederverwendete, nicht invalidierte Nachweise:
  - R2-/R7-Evidence und HCR-017 bis -025 mit begründeter Gültigkeit.
- Nicht ausgeführte Smokes:
  - nur mit Grund und sichtbarem Restrisiko; erforderlicher Device-Smoke darf
    nicht still durch Desktop ersetzt werden.
- Produktiver Iststand:
  - SQL-22-Hash, RPC-Attribute und Katalog-/Sessionzähler; keine Rohdaten.
- Externer Review:
  - CodeRabbit nach lokaler Gesamtmatrix.
- Offene Findings:
  - keine In-Scope-P0/P1 vor S6.
- Commit-Entscheidung:
  - erst nach grünen technischen und owner-gateten Pflichtnachweisen.

Exit laut Owner-Entscheidung D-ACT-R8-42: Der exakte Commit ist lokal,
disposable und im Browser bewiesen; produktives SQL ist bestätigt, ohne
Produktcutover oder synthetische Produktionssession. Android-Prozessverlust
und finaler CodeRabbit-Null-Lauf bleiben ausdrücklich `NOT EXECUTED` und sind
als akzeptierte Evidence-Lücke sichtbar.

## S6 - Doku-Sync, Owner-Recap und Abschluss

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. `docs/modules/Activity Module Overview.md` auf den bewiesenen R8-Iststand
   synchronisieren.
2. `docs/Future trainingsmodule update thoughts.md` auf R8 DONE, O-8-Ergebnis
   und das nächste erlaubte R9-Gate synchronisieren.
3. `docs/qa/health-capture-reports.md` um HCR-026 mit realen Zählern,
   Commands, Runtime- und Device-Erwartungen ergänzen.
4. `sql/HOW_TO.md` nur auf den tatsächlich bewiesenen SQL-22-Ablauf
   synchronisieren.
5. Evidence-Digest, produktiven Iststand und Restrisiken finalisieren.
6. Owner-Recap in Alltagssprache schreiben:
   - warum Commit-Intent nötig ist;
   - was Unknown bedeutet;
   - warum identischer Retry sicher ist;
   - was SQL 22 ändert;
   - was Android bewiesen hat und was erst R12 beweist.
7. Finalen Full Contract Review durchführen und Findings korrigieren.
8. Changelog-Relevanz entscheiden. Weil R8 weiterhin nicht produktiv sichtbar
   ist, nur bei bemerkenswerter Betriebs-/SQL-Wirkung unter `Unreleased`
   eintragen; keine Releaseversion erzeugen.
9. Resume Card auf Abschluss setzen.
10. Commit-Empfehlung aus realem Diff ableiten.
11. Roadmap und Evidence mit `(DONE)` nach `docs/archive/` verschieben.

Ergebnis:

- Source-of-Truth-Sync:
  - Activity Overview, Masterplan, HCR-026, SQL HOW_TO und Evidence.
- Finaler Review:
  - `PASS` oder blockierende Findings.
- Restrisiken:
  - Produktcutover, echter Produkt-PWA-Smoke und Activity-V1-Ablösung bleiben
    R12; Historienoperationen bleiben R9.
- Changelog-Relevanz:
  - in S6 anhand realer produktiver SQL-Wirkung entscheiden.
- Owner Recap:
  - maximal 10 bis 15 Punkte zu Was/Warum/Verhalten/Merksatz.
- Archiv:
  - Roadmap- und Evidence-Zielpfade laut Metadaten.
- Commit-Empfehlung:

```text
feat(activity-v2): add recoverable atomic session commit
```

Exit: Code, SQL, Runtime, der explizite Device-Nachweisstatus `NOT EXECUTED`,
QA, Masterplan, Roadmap und Evidence beschreiben denselben isolierten R8-
Vertrag; R9 darf als eigene Rolling-Wave-Roadmap beginnen.

### S6 Abschluss

- Status: `DONE_WITH_OWNER_ACCEPTED_EVIDENCE_GAP`.
- Source-of-Truth-Sync:
  - Activity Module Overview beschreibt R8-Core, SQL 22, Isolationsgrenze und
    die nicht ausgeführte Device-Lane;
  - Masterplan setzt R8 auf DONE, schließt den R8-Anteil von O-8 und gibt R9
    als nächstes Rolling-Wave-Gate frei;
  - HCR-026 enthält reale Commands, Zähler, Runtime-/SQL-/Build-Erwartungen
    und die T16-/T19-Evidence-Lücke;
  - SQL HOW_TO dokumentiert nur den tatsächlich ausgeführten SQL-22-Forward
    und erteilt keine Rollback- oder Rerunfreigabe;
  - Changelog `Unreleased` nennt die bemerkenswerte produktive
    Katalogkompatibilität ohne Releaseversion oder Featureaktivierung.
- Finaler Full Review: `PASS`; keine offenen In-Scope-P0/P1-Findings.
- Archiv:
  - `docs/archive/MIDAS Activity V2 R8 Core Commit and Android Recovery
    Integration Roadmap (DONE).md`;
  - `docs/archive/MIDAS Activity V2 R8 Core Commit and Android Recovery
    Integration Evidence (DONE).md`.
- Commit-Empfehlung aus dem realen R8-Diff:

```text
feat(activity-v2): add recoverable atomic session commit
```

Kein Commit oder Push wurde durch S6 ausgeführt.

### Owner-Recap

1. Der Commit-Intent ist die versiegelte Quittung vor dem Netzwerk: gleiche
   Request-ID, gleiche Payload und gleiche Abschlusszeit.
2. Ohne bestätigte Intent-Persistenz sendet MIDAS nichts an den Remote-Commit.
3. `Unknown` bedeutet nicht Fehler oder Erfolg, sondern: Die Antwort fehlt und
   der Server könnte bereits committed haben.
4. Deshalb bleiben Draft und Intent bei Unknown gesperrt; Bearbeiten oder
   Verwerfen würde die Wahrheit unentscheidbar machen.
5. Der Retry ist sicher, weil er exakt dieselbe Request-ID und Payload erneut
   sendet. Eine abweichende Payload bleibt ein Idempotenzkonflikt.
6. Erst bestätigter Commit oder Replay schreibt den Recovery-Tombstone; der
   Slot wird nicht physisch gelöscht und alte Tabs können nichts wiederbeleben.
7. SQL 22 ändert nur die Katalogprüfung des vorhandenen Commit-RPC: Jede
   vorhandene unveränderliche Version darf committen, nicht nur die höchste.
8. SQL 22 ändert keine Katalogzeile, Tabelle, Policy, RLS-Grenze oder
   Activity-V1-Nutzung und erzeugte keine Trainingssession.
9. Lokal, disposable und im Browser sind Commit, Unknown/Retry, Reload,
   Offline und Races bewiesen; Android Debug/Release und Produktisolation bauen.
10. Ein realer Android-Prozess-Reclaim wurde nicht ausgeführt. Ebenso fehlt
    der letzte CodeRabbit-Null-Lauf; beides ist sichtbar akzeptiertes Restrisiko.
11. R9 darf nun Historie, Detail, Korrektur und Löschung separat planen, aber
    weder die Device-Lücke als PASS behandeln noch Activity V2 aktivieren.
12. Activity V1 bleibt der einzige produktive Consumer. Erst R12 darf
    Produktcutover, gecachte PWA-Clients und finalen Android-Smoke entscheiden.
