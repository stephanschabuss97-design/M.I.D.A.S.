# MIDAS Activity V2 R10 Completed Activity Coaching Export V1 Roadmap (DONE)

Diese Roadmap baut auf dem abgeschlossenen Activity-V2-Kern R1 bis R9 auf und
liefert einen eigenständigen, versionierten Ist-Datenexport für Training und
Coaching. Der Export ist für den manuellen Upload in ChatGPT oder Codex sowie
für einen späteren read-only MCP-Consumer bestimmt. Er bleibt bis R12
isoliert und verändert weder Activity V1 noch Doctor View, Health Export oder
die produktive Activity-Navigation.

---

## Roadmap-Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Status | `DONE; S1-S6 PASS/DONE; gemeinsam mit Evidence archiviert` |
| Modul / Bereich | `Activity V2 / Completed Activity Coaching Export V1` |
| Owner / Kontext | `Stephan; private Single-User-PWA für die eigene Trainingsdokumentation` |
| Chat-Lebenszyklus | `Denkraum -> eigener Ausführungs-Chat` |
| Erstellt am | `2026-08-13` |
| Letzter Stand | `2026-08-22; S6 vollständig PASS; R10 abgeschlossen; SQL 24 produktiv installiert und postgeprüft; keine offenen P0/P1; zwei nicht blockierende Watchlists` |
| Aktueller Schritt | `R10 DONE; nächster Planungsgegenstand R11 im Denkraum` |
| Risikoklasse | `R3`; neue produktive read-only Database Function, ACL- und Exportvertrag für Gesundheitsdaten |
| Standard-Reviewtiefe | `Full`; Consumer Review für isolierte Client-/Harness-Deltas |
| Ausführungsmodell | `GPT-5.6 Sol` |
| Reasoning-Standard | `High` |
| Reasoning-Ausnahmen | `Roadmap-Erstellung und initialer Review: Extra High; S1-S4R und S5: Extra High; SQL-/ACL-Substep S4.2: Extra High` |
| Autonome Discovery Wave | `S1-S4R abgeschlossen` |
| Owner-Erklärmodus | `Briefing + S6-Recap` |
| Betroffene Hauptdateien | `sql/24_Activity_V2_Coaching_Export.sql`, Rollback und Fixture, `sql/16_Explicit_Grants.sql`, `sql/HOW_TO.md`, Activity-V2-Data-Access, neue isolierte Exportmodule, Contracttests und Harness` |
| Deploy relevant | `ja`; ausschließlich owner-gatetes produktives SQL 24, kein Web-/Edge-/APK-Deploy in R10 |
| Produktive Schreibwirkung | `ja`; nur DDL/Function-/ACL-Wirkung, keine Session-DML und keine synthetischen Produktdaten |
| Workflow-Vertrag | `docs/templates/MIDAS Roadmap Workflow Contract.md` |
| Evidence-Datei | `docs/archive/MIDAS Activity V2 R10 Completed Activity Coaching Export V1 Evidence (DONE).md` |
| Gekoppelte Roadmaps | `R1/C2 Semantik; R2/R8 Speicherung; R9 Historien-Lifecycle; R11 Doctor View; R12 Cutover; R13 Template-Import` |
| Evidence-Owner | `diese Roadmap` |
| Archivziel | `docs/archive/MIDAS Activity V2 R10 Completed Activity Coaching Export V1 Roadmap (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Ausführungs-Chat-Startkarte

- Auftrag:
  - `R10 gemäß dieser Roadmap zunächst autonom von S1 bis einschließlich
    S4R abarbeiten; S4 nicht ohne separaten Folgeauftrag beginnen.`
- Modell und Reasoning:
  - `GPT-5.6 Sol / Extra High` für die Discovery Wave S1-S4R.
  - Danach risikobasiert gemäß Statusmatrix; SQL/ACL und S5 bleiben
    `Extra High`.
- Kontextübergabe aus dem Denkraum:
  - `PASS`: R1 bis R9 und C2 sind abgeschlossen. R9 ist die Source of Truth
    für gespeicherte, korrigierte und gelöschte Activity-V2-Sessions.
  - `PASS`: R10 exportiert ausschließlich den aktuellen Ist-Zustand
    abgeschlossener Activity-V2-Sessions. Gelöschte Versionen, Drafts,
    Activity V1 und erfundene Historie gehören nicht in den Export.
  - `PASS`: Der Export bleibt ein eigenständiges Artefakt. Doctor View,
    Arztbericht und Health Export werden in R10 nicht erweitert.
  - `PASS`: Ein späterer MCP darf mehrere getrennte Exporte kombinieren.
    R10 selbst enthält weder Befund-, Labor-, Blutdruck-, Medikamenten- noch
    sonstige Gesundheitsdaten.
  - `PASS`: Der Export liefert Roh-Istwerte und Semantik, keine
    Trainingsempfehlung, keine Progressionslogik, kein RPE, kein 1RM, keine
    Zielgewichte und keine Importsemantik.
  - `PASS`: R9-Listen- und Detail-RPCs sind UI-Verträge und werden nicht als
    N+1-Exportpipeline missbraucht. R10 erhält einen eigenen read-only RPC,
    der einen konsistenten Datenbanksnapshot als vollständiges JSON liefert.
  - `PASS`: Historische Item-Snapshots bleiben unverändert. Kategorie,
    Muskelgruppen und Sport-Tags werden über die exakte gespeicherte
    Kombination aus `catalog_version` und `item_key` des historischen Items
    gelesen, niemals über die aktuell höchste Katalogversion.
  - `PASS`: Drei und sechs Kalendermonate sowie ein freier Zeitraum sind
    Consumer-Presets. Der RPC akzeptiert nur explizite inklusive `from`-/
    `to`-Tage in `Europe/Vienna`.
  - `PASS`: Leere Zeiträume sind ein gültiger vollständiger Export mit
    `sessions: []`. Teil- oder still gekürzte Exporte sind verboten.
  - `PASS`: R10 bleibt bis R12 isoliert beziehungsweise testgebunden. Es gibt
    keinen Produktload, keinen Activity-V2-Cutover und keinen produktiven
    Downloadbutton in der normalen MIDAS-Oberfläche.
- Verbindliche Lesereihenfolge:
  1. `Diese Startkarte, Roadmap-Metadaten und Session Resume Card`
  2. `README.md`
  3. `docs/DEV_ENVIRONMENT.md`
  4. `docs/templates/README.md`
  5. `docs/templates/MIDAS Roadmap Workflow Contract.md`
  6. `docs/Future trainingsmodule update thoughts.md`, insbesondere R10,
     R11, R12 und das finale Akzeptanzbild
  7. `docs/modules/Activity Module Overview.md`
  8. `docs/MIDAS Activity V2 R1 Catalog Baseline Contract.md`
  9. `docs/MIDAS Activity V2 C2 Catalog Version 2 Contract.md`
  10. archivierte R9-Roadmap und R9-Evidence für Snapshot-, Revision-,
      Korrektur-, Delete-, SQL- und ACL-Verträge
  11. archivierte R8-Roadmap/Evidence nur für Commit- und produktive
      SQL-Postconditions, wenn eine konkrete Frage dies verlangt
  12. `sql/20_Activity_V2.sql`, SQL 21 bis 23, Rollbacks, Fixtures,
      `sql/16_Explicit_Grants.sql` und `sql/HOW_TO.md`
  13. `app/modules/vitals-stack/activity/v2/data-access.js`, zugehörige
      Contracttests und Isolationstests
  14. bestehender Health-Export ausschließlich als Referenz für
      Versionierung, Download und All-or-Error, nicht als Integrationsziel
  15. `docs/qa/health-capture-reports.md`, relevante Activity-/Exportchecks
  16. aktuelle offizielle Supabase-Dokumentation und Changelog-Hinweise zu
      Database Functions, RLS, Function Privileges und Data-API-Grants
  17. `git status --short` und nur der relevante Diff
- Startschritt:
  - `S1 - System- und Vertragsdetektivarbeit`.
- Freigegebener autonomer Block:
  - `S1-S4R`.
- Interne Continuation Gates:
  - Nach S1, S2, S3 und S4R jeweils Full Review, Findings-Korrektur,
    Statusmatrix, Evidence und Resume Card aktualisieren.
  - Bei `PASS` und ohne Owner-Gate automatisch fortfahren.
  - Nach S4R mit Readiness-Urteil und empfohlenen S4-Ausführungsblöcken
    stoppen.
- Erlaubte Autonomie:
  - Discovery: lokale Reads, read-only Supabase-/Toolchain-Preflights,
    Roadmap-/Evidence-Korrekturen und günstige Baselinechecks.
  - Nach separater S4-Freigabe: eng begrenzte Activity-V2-JS-/Test-/Harness-
    und SQL-Source-Änderungen sowie disposable PostgreSQL-Tests.
  - Docker Desktop und lokaler Supabase-/PostgreSQL-Stack dürfen für
    disposable Tests gestartet und gestoppt werden.
  - CodeRabbit ausschließlich in S5 nach grüner Gesamtmatrix.
- Owner-Gates:
  - jedes produktive SQL und jeder produktive Write;
  - jede Änderung an Produktload, `index.html`, Service Worker, Navigation,
    Activity V1, Doctor View oder Health Export;
  - Web-/Edge-/APK-Deploy und Device-Aktionen;
  - Erweiterung des Exportes um medizinische Daten oder Write-/Importscope.
- Stop-Bedingungen:
  - fehlende oder widersprüchliche Source of Truth für ein Exportfeld;
  - N+1-Export aus R9-UI-RPCs, stilles Truncation, offsetbasierter
    Vollhistorien-Scan oder mehrere inkonsistente Datenbank-Snapshots;
  - Live-Katalog-Reinterpretation historischer Items;
  - produktive SQL-Wirkung ohne grüne S5-Matrix, Owner Briefing und explizite
    Freigabe;
  - vorgezogener R11-/R12-/R13-Scope oder synthetische Produktdaten.
- Halluzinationsschutz:
  - Tabellen, Spalten, RPC-Signaturen, Grants, RLS, Runtime-APIs,
    Katalog-FKs und Testbefehle am realen Repo/System prüfen.
  - Fehlende Fakten nicht erfinden; Abweichungen als Finding dokumentieren.
  - Offizielle Supabase-Dokumentation vor SQL-Implementierung frisch prüfen.
- Testökonomie:
  - keine Browser-Volltests in S1-S3;
  - einen Harness-/Serverlauf pro zusammenhängendem S4-Block wiederverwenden;
  - S5 führt genau einen initialen CodeRabbit-Lauf und nach gebündelter
    Korrektur genau einen geplanten Verifikationslauf aus;
  - bestehende R9-Evidence referenzieren, sofern sie nicht invalidiert wird.
- Startprompt:

```text
Arbeite die Roadmap
`docs/MIDAS Activity V2 R10 Completed Activity Coaching Export V1 Roadmap.md`
gemäß ihrer Ausführungs-Chat-Startkarte ab.

Lies die festgelegten Quellen in der angegebenen Reihenfolge, prüfe den realen
Git-, Runtime-, SQL- und Toolstand und beginne mit S1. Führe S1 bis
einschließlich S4R deterministisch in einem autonomen Discovery-Block aus.
Schließe S1, S2, S3 und S4R jeweils separat mit Full Review,
Findings-Korrektur, Statusmatrix, Evidence-Sync und aktualisierter Session
Resume Card ab. Fahre bei bestandenem internem Continuation Gate ohne
Rückfrage fort. Stoppe nach S4R; S4 benötigt einen separaten Auftrag.

Unveränderliche Grenzen: R10 exportiert nur abgeschlossene Activity-V2-
Ist-Daten. Activity V1 bleibt produktiv und Activity V2 bleibt bis R12
isoliert. Doctor View, Health Export, medizinische Daten, Coachingempfehlungen,
Import und produktive UI-Verdrahtung sind nicht Teil von R10. Verwende keinen
N+1-Export aus R9-RPCs. Der Export muss aus einem konsistenten read-only
Datenbanksnapshot stammen, exakt versioniert, streng validiert, deterministisch
sortiert und entweder vollständig oder mit explizitem Fehler beendet werden.
Beginne in der Discovery Wave noch nicht mit Produktcode.
```

## Session Resume Card

- Ziel:
  - Einen eigenständigen, versionierten und maschinenlesbaren Export
    abgeschlossener Activity-V2-Ist-Daten isoliert bereitstellen.
- Unveränderliche Verträge:
  - Activity V1 produktiv; Activity V2 bis R12 isoliert; kein Health-/Doctor-/
    MCP-/Importscope; historische Semantik bleibt an `catalog_version` und
    `item_key` gebunden; genau ein read-only Snapshot-RPC; vollständig oder
    expliziter Fehler; keine stille Kürzung und kein R9-N+1.
- Erledigter Stand:
  - R1 bis R9 und C2 abgeschlossen;
  - S1 `PASS`: verbindliche Quellenfolge, Git-/Repo-/SQL-/Runtime-/Toolstand,
    aktueller produktiver Read-only-Stand und Baselinechecks verifiziert;
  - S2 `PASS`: RPC, Snapshot, Range, Keysets, Typen, Enums, Limits,
    Sortierung, Fehler, Privacy und Client-API deterministisch eingefroren;
  - S3 `PASS`: Security-, BOLA-, Daten-, Snapshot-/Race-, Range-, Cap-,
    Isolation-, Consumer-, Provisioning- und Rollbackrisiken red-teamed;
  - S4R `PASS`: jedes S4.x-Paket auf Inputs, Outputs, Consumer, Failure Modes,
    Tests, Invalidierung und Rollback geprüft;
  - S4.1 `PASS`: pures, tief eingefrorenes `coachingExport`-V1-/Range-/Preset-/
    Filename-Modul und T-ACT-R10-01 bis -04;
  - S4.2 `PASS`: SQL 24, exakter Rollback, SQL-16-Spiegel, HOW-TO und der
    vollständige PostgreSQL-17-Fixture implementiert; Fresh/Rerun/Drift,
    Auth/RLS/BOLA, v1/v2/Modes, Range/Empty, Caps, Correction/Delete-Races,
    Rollback/zweiter Rollback/Forward und S4.1-Validatorbrücke bestanden;
  - S4.3 `PASS`: Data Access um exakt `loadCoachingExport({ from, to })`
    ergänzt; Range vor I/O, ein logischer RPC, identischer Auth-Retry-Body,
    S4.1-Responsevalidator, Deep-Freeze und sichere Fehlergrenze belegt;
  - S4.4 `PASS`: isolierter Controller, Shell und Fakeadapter-Harness für sechs/
    drei Monate, Custom, Loading, Empty, Error, Retry, stale responses und
    parsebaren/revoketen JSON-Blob; Desktop/390/320 3/3 PASS;
  - S4.5 `PASS`: SQL-/Client-Key- und Katalog-Enumparität, realistisches
    Consumer-Fixture, sechs Adjacent-Negativorakel, SQL-16-R10-Isolationshash
    und HOW-TO-Provisioning automatisiert belegt.
  - S5 `PASS`: gesamte Node-/Contract-/Isolation-/Browser-/Consumer- und
    PostgreSQL-17-Matrix, nativer Full Review und CodeRabbit abgeschlossen;
    SQL 24 nach expliziter Einzel-Freigabe produktiv installiert und mit
    exaktem ACL-/Auth-/Empty-V1-/Advisor-/Datenpostcheck bestätigt.
  - S6 `DONE`: Activity Overview, Masterplan, HCR-028, SQL-HOW-TO/
    Grantspiegel und Changelog auf das reale Produktpostimage synchronisiert;
    finaler Source-of-Truth-Review, Owner-Recap, Denkraum-Übergabe und
    gemeinsame Archivierung von Roadmap/Evidence abgeschlossen.
- Readiness-Urteil:
  - `DONE`; S6-Exit-Kriterium erfüllt. Keine offenen P0/P1-, Security-,
    Datenintegritäts- oder Scope-Blocker. F-ACT-R10-23 und Tooling-Watch
    F-ACT-R10-32 bleiben ausschließlich nicht blockierende Watchlists.
- Aktueller Schritt:
  - `R10 vollständig abgeschlossen und archiviert`.
- Nächster erlaubter Schritt:
  - im Denkraum R11 `Doctor View and Report Integration` aus dem bewiesenen
    R10-Postimage als neue Roadmap vorbereiten; Umsetzung ausschließlich in
    einem neuen Ausführungs-Chat. Kein weiterer R10-/Produkt-SQL-Lauf.
- Empfohlene S4-Ausführungsblöcke:
  - Block A: `S4.1` allein, pure Schema-/Range-/Validatorbasis, `PASS`;
  - Block B: `S4.2` allein, SQL 24/ACL/Rollback/Fixture, `PASS`;
  - Block C: `S4.3-S4.5` gemeinsam, Data Access/Harness/Isolation, `PASS`;
  - alle empfohlenen R10-Blöcke einschließlich S5/S6 sind abgeschlossen; für
    R11 wird eine neue eigenständige Blockplanung benötigt.
- Offene Findings:
  - keine P0/P1;
  - F-ACT-R10-23: bestehende, R10-fremde Security-Advisor-Warnungen beobachten;
  - F-ACT-R10-32: In-App-Browser-Service auch in S5 nicht verfügbar; lokaler
    Edge/Playwright-Fallback erneut 3/3 PASS;
  - F-ACT-R10-37 bis -42 und -44 bis -47 korrigiert und revalidiert;
    F-ACT-R10-43 nach Vertragsprüfung begründet verworfen.
- Geänderte Dateien:
  - R10-Roadmap und R10-Evidence;
  - Exportvertrag/-tests/-Fixture, Data-Access-Methode und Adaptertests;
  - `activity-coaching-export-controller.js` samt Contracttest;
  - isolierte Shell/CSS/Harness-HTML/Harness-JS und Browser-Smokespec;
  - finaler Schema-/Enum-/Consumer-/Negativorakel-Contracttest;
  - `tools/activity-v2-r8-isolation.mjs` auf R10 fortgeschrieben;
  - `sql/24_Activity_V2_Coaching_Export.sql`;
  - `sql/24_Activity_V2_Coaching_Export_Rollback.sql`;
  - `sql/tests/24_Activity_V2_Coaching_Export_fixture.sql`;
  - `sql/16_Explicit_Grants.sql`, `sql/HOW_TO.md` und die aktualisierte
    Isolation-Contract-Erwartung;
  - `docs/modules/Activity Module Overview.md`,
    `docs/Future trainingsmodule update thoughts.md`,
    `docs/qa/health-capture-reports.md` und `CHANGELOG.md`;
  - bereits vorhandene fremde Templateänderungen und die R9-Archivverschiebung
    wurden nicht verändert oder zurückgesetzt.
- Gültige Nachweise:
  - Git HEAD `5f01033e15abf59be782479ef90abb86b7b87d1e` auf `main`;
  - finale Activity-V2-Node-/Contractmatrix `237/237 PASS`, fokussierte
    R10-Matrix `29/29 PASS`, Syntax/JSON, SQL-/Client-Key-/Enumparität,
    deterministische Consumerfragen und R10-Isolation mit sechs
    Adjacent-Negativorakeln `PASS`;
  - lokaler Browser-Harness nach S5-Korrektur per Edge/Playwright-Fallback
    `3/3 PASS`: Desktop, 390x844 und 320x800 einschließlich Werterhalt und
    Korrektur einer ungültigen Custom-Range;
  - disposable PostgreSQL 17: finaler kompletter SQL-24-Fixture Exit 0; exakte
    Function `STABLE/INVOKER/search_path=''`, Owner/ACL/Sourcehash; final
    0/0/0; exakter Cap-Export `1000/10000/50000`, 13.666.612 Bytes und im
    S5-Lauf 1,159023 Sekunden unter `statement_timeout=8s`; SQL-16-
    Source-/Hardening-Drift wird vor Grant explizit abgelehnt;
  - SQL24-Antwort durch den realen S4.1-Validator akzeptiert; T-ACT-R10-06
    bis -11 und EV-ACT-R10-L02 bis -L13 `PASS`;
  - Native Review ohne offene P0/P1; CodeRabbit initial, vollständiger
    Verifikationslauf und wegen neuer P1-Security-/Datenfindings erlaubter
    Nachreview abgeschlossen; alle berechtigten Findings revalidiert;
  - produktiv: PostgreSQL 17.6, Katalog 78/80, V2-Zähler und vollständige
    Tabellenhashes unverändert 0/0/0; SQL 24 exakt
    `fad0af25e471553a7d1f7263e502d0e5a58423560fc655753a7630f5ba3bd1b6`
    installiert, Functionhash
    `ef3b00b9e674fa379d0e190c8c8b9866d14d4994f488e4b1279c66d174c22376`,
    authenticated-only Execute, anon/fehlender Auth abgelehnt und reales
    Empty-V1 durch den Clientvalidator akzeptiert; kein neuer R10-Advisor;
  - F-ACT-R10-31/-40 geschlossen: SQL-16-Hash
    `8f6882c6f3945d86ad1e3455391009e3a91a4f286672b54dec747bb1a950ff4c`
    ist im Isolationstool gespiegelt, source-/hardeninggeprüft und grün;
  - aktuelle offizielle Supabase-Functions-/API-Security-Dokumentation und der
    Changelog wurden am 2026-08-22 erneut gegen RPC/Grant/RLS geprüft.
  - S6-Read-only-Recheck per `to_regprocedure` bestätigt erneut exakt eine
    benannte `date,date`-Function, den kanonischen Functionhash, Owner/Mode/
    Search Path/ACL und V2-Zähler 0/0/0; F-ACT-R10-46 geschlossen.
- Noch fehlende Nachweise:
  - keine R10-Nachweise. Git-Commit und Push bleiben Owner-Aktionen und sind
    kein Roadmap-Evidence-Gate; R11/R12-Nachweise gehören ihren Roadmaps.
- Reale Runtime-, SQL- und Deploy-Lage:
  - Node 24.18.0, npm 11.18.0, Docker 29.7.2, Supabase CLI 2.109.1,
    lokales PostgreSQL-17-/Supabase-17.6-Image verfügbar; kein Host-`psql`;
  - Browser-Plugin installiert, aber sein trusted Node-REPL-Service war auch
    in S5 nicht verfügbar; lokaler Microsoft Edge plus Playwright 1.55.0 als
    dokumentierter Fallback erneut 3/3 PASS. CodeRabbit CLI 0.7.2 wurde gemäß
    Reviewvertrag verwendet; Python 3.14.6 lieferte den Harness lokal aus;
  - SQL 24 ist lokal/disposable vollständig bewiesen und auf dem produktiven
    Projekt `M.I.D.A.S.` (`jlylmservssinsavlkdi`, eu-central-1, PostgreSQL
    17.6) installiert. Produktiv wirkte ausschließlich Function-DDL/ACL;
    V2-Daten blieben 0/0/0 und hashidentisch. Kein Web-, Edge-, APK-, Device-
    oder sonstiger Deploy und keine Produkt-DML erfolgte;
    die reale Rolle `authenticated` besitzt `statement_timeout=8s`
    (`authenticator` ebenfalls 8s), daher ist 8 Sekunden die S4.2-
    Performancegrenze ohne neue Owner-/Konfigurationsentscheidung.
- Offene Owner-Freigaben:
  - Commit und Push des abgeschlossenen R10-Diffs;
  - danach optional der separat notierte `doctor.css`-Prefix-Order-Lintfix;
  - jeder etwaige Rollback von SQL 24 bleibt separat freigabepflichtig;
  - weiterhin jede Produktload-/Navigation-/Activity-V1-/Doctor-/Health-
    Export-/Deploy- oder reale Sessionaktion.
- Stop-Bedingungen:
  - R10 ist beendet; in diesem Ausführungs-Chat keine R11-/R12-Implementierung
    und keine separate Doctor-CSS-Wartung beginnen;
  - kein weiterer Produkt-SQL-Lauf, kein Rollback und kein Deploy ohne neue
    explizite Einzel-Freigabe.
- Fresh-Chat-Übergabe:
  - Diese archivierte Card, das S6 Gate Record und die Denkraum-Übergabe
    enthalten den vollständigen R10-Abschlusskontext. Eine neue R11-Roadmap
    muss Masterplan, Activity Overview, HCR-028, R10-Roadmap/Evidence und den
    realen Git-/Produktstand lesen, die getrennte R10-Vollpayload-/R11-
    Zusammenfassungsgrenze bewahren und darf ohne eigenes Gate weder R10-SQL,
    Produktload noch Doctor-/Health-Consumer verändern. Kein Rückgriff auf
    diesen Chat ist erforderlich.

## Zielvertrag

Prüfbares Endergebnis:

- Ein strikt versioniertes JSON mit
  `schema_version: midas.activity-coaching-export.v1` exportiert alle und nur
  die abgeschlossenen Activity-V2-Sessions des angemeldeten Users im
  inklusiven Vienna-Tageszeitraum.
- Das JSON enthält Session-, Item- und Satz-Istwerte, historische
  Snapshotsemantik, exakte Einheiten, Range-, Vollständigkeits- und
  Qualitätsmetadaten sowie eine deterministische Reihenfolge.
- Ein dedicated read-only RPC liefert den Export aus genau einem konsistenten
  Datenbanksnapshot. Der Client validiert die Antwort streng, bevor eine Datei
  angeboten wird.
- Presets für drei und sechs Kalendermonate sowie ein freier Zeitraum erzeugen
  explizite `from`-/`to`-Tage. Der Standard ist sechs Monate.
- Leere Zeiträume liefern ein gültiges, vollständiges JSON. Zu große oder
  ungültige Requests und nicht vollständig exportierbare Daten liefern einen
  expliziten Fehler statt Teilantwort oder stiller Kürzung.
- Ein realistisches disposable Fixture beweist Strength-, Duration-,
  Duration-Distance-, Mixed-, korrigierte, gelöschte und mehrere
  Katalogversionen umfassende Verläufe sowie Security und deterministische
  Ausgabe.
- Ein isolierter Browser-Harness beweist Zeitraumwahl, Download,
  Empty-/Error-State und strikte Responsevalidierung. R10 bleibt aus der
  produktiven `index.html` ausgeschlossen.
- Produktives SQL 24 wird erst nach grüner S5-Matrix und expliziter
  Owner-Freigabe installiert; reale Activity-V2-Produktdaten werden weder
  erzeugt noch verändert.

Bewusst unverändert:

- Activity V1, Doctor View, Arztbericht, Health Export, Protein Target,
  Trendpilot und produktive Activity-Navigation.
- R7-Recovery, R8-Commit, R9-Korrektur/Delete und alle gespeicherten Session-
  Inhalte.
- Katalogversionen 1 und 2, ihre unveränderlichen Semantiken und der
  kontrollierte Katalogpflegeweg.
- Retention, MCP, vorbereiteter Session-Import und medizinische Bewertung.

## Problem und Ist-Zustand

- Beobachtung:
  - Activity V2 besitzt nach R9 vollständige gespeicherte Sessions, Items und
    Sets sowie bounded UI-RPCs für Historie und Detail.
  - Diese UI-RPCs sind für einzelne Screens optimiert, nicht für einen
    vollständigen sechsmonatigen Coaching-Export.
  - Der bestehende Health Export enthält andere fachliche Bereiche und darf
    nicht zur versteckten Activity-V2-Coaching-Schnittstelle werden.
- Risiko oder Reibung:
  - Ein Client-seitiger N+1-Export wäre langsam, könnte zwischen Requests
    unterschiedliche Datenstände sehen und müsste Pagination/Fehler selbst
    zusammensetzen.
  - Ein Export ohne historische Katalogsemantik könnte alte Übungen später
    falsch interpretieren.
  - Ein still gekürztes JSON wäre für Coaching gefährlicher als ein klarer
    Fehler, weil scheinbar vollständige Daten analysiert würden.
- Offene Hypothese:
  - `none`; S1 bestätigte die SQL-/ACL-/RLS-Postconditions. Konsistenz folgt
    dem Aufruf-Snapshot der `STABLE`-Function; getrennte Count-Guards vor der
    Aggregation bleiben im selben Snapshot und sind der verbindliche Weg.

## Entscheidungslog

<!-- markdownlint-disable MD013 -->

| ID | Datum | Entscheidung | Warum | Betrifft |
| --- | --- | --- | --- | --- |
| D-ACT-R10-01 | 2026-08-13 | R10 ist ein eigenständiger Activity-V2-Ist-Datenexport. | Training kann isoliert analysiert werden; Health- und Doctor-Consumer bleiben redundant. | Ziel/Scope |
| D-ACT-R10-02 | 2026-08-13 | Der Export verwendet einen dedicated read-only RPC statt R9-Listen-/Detail-N+1. | Ein konsistenter Snapshot, klare Fehlergrenze und geringere Clientkomplexität. | SQL/API |
| D-ACT-R10-03 | 2026-08-13 | RPC-Zielname ist `public.activity_v2_coaching_export(date,date) returns jsonb`. | Eindeutige, versionierbare Schnittstelle; Abweichung nur bei realem Namenskonflikt als Finding. | SQL/API |
| D-ACT-R10-04 | 2026-08-13 | Exportiert werden nur aktuelle abgeschlossene V2-Sessions im Range. Jede persistierte Zeile in `health_activity_sessions` ist bereits ein erfolgreicher R8/R9-Commit und damit abgeschlossen; R10 erfindet keine zusätzliche Statusspalte. | Drafts, gelöschte Versionen und Activity V1 sind nicht Teil des Coaching-Istbilds. | Daten |
| D-ACT-R10-05 | 2026-08-13 | Historische Snapshots bleiben Source of Truth; die Session-Katalogversion wird nur akzeptiert, wenn alle gespeicherten Items exakt dieselbe Version tragen; Tags kommen aus dieser Original-Katalogversion. | Die Sessiontabelle besitzt keine eigene Katalogspalte; die Ableitung muss eindeutig sein und darf nicht auf die aktuelle Version zeigen. | Semantik |
| D-ACT-R10-06 | 2026-08-13 | Standard sind sechs Kalendermonate; drei Monate und Custom sind Consumer-Presets. | Reale Coaching-Nutzung bei eindeutigem RPC-Vertrag. | Zeitraum |
| D-ACT-R10-07 | 2026-08-13 | Range ist Vienna-local, inklusive, nicht zukünftig und maximal 366 Tage. Die Mitgliedschaft einer Session richtet sich nach dem gespeicherten generierten `health_activity_sessions.day`. | Deterministische Tagesgrenzen ohne zweite Lifecycle-Interpretation und begrenzte Datenwirkung. | Contract/Security |
| D-ACT-R10-08 | 2026-08-13 | Presets ziehen den lokalen Kalendertag um N Monate zurück und klemmen auf den letzten gültigen Zielmonatstag. | Eindeutiges Verhalten etwa für den 31. und Schaltjahre. | Client |
| D-ACT-R10-09 | 2026-08-13 | Leerer Range ist `complete`; Teilantworten und stilles Truncation sind verboten. | Maschinen dürfen fehlende Daten nicht für Vollständigkeit halten. | Export |
| D-ACT-R10-10 | 2026-08-13 | Harte Obergrenzen: 1000 Sessions, 10000 Items, 50000 Sets; Überschreitung ist ein expliziter Fehler. | Schutz vor ungebremster Aggregation ohne versteckten Datenverlust. | SQL/Security |
| D-ACT-R10-11 | 2026-08-13 | Sortierung: Sessions chronologisch aufsteigend, Tie-Break `session_id`; Items/Sets nach Order aufsteigend. | Deterministische Maschinenlesbarkeit und stabile Diffs. | Export |
| D-ACT-R10-12 | 2026-08-13 | Roh-Istwerte sind Source of Truth; keine 1RM-, RPE-, Volumen-, Ziel- oder Progressionsableitung. | MIDAS dokumentiert, ein externer Coach interpretiert. | Scope |
| D-ACT-R10-13 | 2026-08-13 | Korrigierte Sessions sind aktueller gültiger Iststand und kein Qualitätsmangel. | R9-Korrektur ist fachlich legitim; Revision bleibt nur Traceability. | Quality |
| D-ACT-R10-14 | 2026-08-13 | `device_relative` und Assistance werden sichtbar exportiert und als deterministische Caution markiert. | Unzulässige Lastvergleiche zwischen Maschinen vermeiden. | Quality |
| D-ACT-R10-15 | 2026-08-13 | Notes werden exportiert; User-ID, Authdaten, Request-/Content-Fingerprints und technische Item-/Set-UUIDs nicht. | Coachingrelevanz bei Datensparsamkeit. | Privacy |
| D-ACT-R10-16 | 2026-08-13 | Der RPC ist `STABLE SECURITY INVOKER`, mit leerem `search_path`, explizitem `auth.uid()`-/`is_anonymous = false`-Check und API-Execute ausschließlich für `authenticated`; `postgres` bleibt Function-Owner. | RLS bleibt wirksam; die Postgres-Rolle allein darf keine anonyme Auth-Session autorisieren. | Security |
| D-ACT-R10-17 | 2026-08-13 | Produktdaten werden nicht als Fixture verwendet; realistische Beweise laufen disposable. | Produkt ist derzeit leer und darf nicht synthetisch befüllt werden. | QA |
| D-ACT-R10-18 | 2026-08-13 | R10 bleibt isoliert/testgebunden bis R12. | Kein vorgezogener Cutover. | Rollout |
| D-ACT-R10-19 | 2026-08-13 | Dateiname: `midas-activity-coaching_YYYY-MM-DD_YYYY-MM-DD.json`. | Eindeutig, stabil und frei von lokalen Zeitstempelproblemen. | Download |
| D-ACT-R10-20 | 2026-08-13 | SQL 24 besitzt einen eigenen Rollback, der nur Function/ACL entfernt; nach R12 ist Rollback consumer-abhängig. | Reversibilität ohne Sessiondaten anzutasten. | Rollback |
| D-ACT-R10-21 | 2026-08-13 | CodeRabbit läuft nur in S5: einmal initial, einmal als geplante Verifikation. | Reviewqualität ohne wiederholte Token-/Rate-Limit-Spirale. | QA |
| D-ACT-R10-22 | 2026-08-13 | `generated_at` stammt aus `statement_timestamp()` desselben RPC-Aufrufs und wird kanonisch in UTC ausgegeben. | Eindeutige Snapshot-Zeitbasis ohne zusätzliche Datenbankrunde. | Export/SQL |
| D-ACT-R10-23 | 2026-08-13 | JSON-Objekt-Key-Reihenfolge ist kein Vertrag; nur exakte Keysets, Werte und Arrayreihenfolgen sind deterministisch. | PostgreSQL `jsonb` garantiert keine fachlich relevante Objekt-Key-Reihenfolge. | Export/Test |
| D-ACT-R10-24 | 2026-08-13 | Snapshotgarantie ist ein logischer `STABLE`-RPC. Alle internen Reads der Funktion verwenden den Snapshot der aufrufenden Query; Count-Guards dürfen deshalb vor der Payloadaggregation in eigenen `SELECT`s laufen. PostgREST führt auch einen POST auf eine `STABLE`-Function read-only aus. | Belegt konsistente All-or-error-Daten und vermeidet unnötigen JSON-Bau oberhalb der Caps. | SQL/Snapshot |
| D-ACT-R10-25 | 2026-08-13 | SQL-Fehlertokens sind exakt `MIDAS_ACTIVITY_AUTH_REQUIRED`, `MIDAS_ACTIVITY_INVALID_EXPORT_REQUEST`, `MIDAS_ACTIVITY_EXPORT_LIMIT_EXCEEDED` und `MIDAS_ACTIVITY_EXPORT_SNAPSHOT_DRIFT`. | SQL, Data Access, UI und Tests benötigen eine gemeinsame sichere Fehlergrenze. | API/Error |
| D-ACT-R10-26 | 2026-08-13 | `muscle_groups` und `sport_tags` übernehmen die unveränderliche Reihenfolge der exakten Original-Katalogzeile; die realen v1-/v2-Kataloge sind darin duplikatfrei und codepoint-sortiert. | Historische Semantik bleibt versionsgebunden und dennoch deterministisch. | Daten/Sorting |
| D-ACT-R10-27 | 2026-08-13 | Cap-Prüfungen zählen zunächst Sessions, Items und Sets im Snapshot. Erst wenn alle drei Werte innerhalb `1000/10000/50000` liegen, darf die Exportaggregation beginnen. | Oberhalb eines Limits entsteht weder Teilantwort noch unnötiger Maximalpayload. | SQL/Performance |

<!-- markdownlint-enable MD013 -->

## Exportvertrag V1

Top-Level-Form:

```json
{
  "schema_version": "midas.activity-coaching-export.v1",
  "generated_at": "2026-08-13T10:00:00.000Z",
  "timezone": "Europe/Vienna",
  "range": {
    "from": "2026-02-13",
    "to": "2026-08-13",
    "inclusive": true
  },
  "units": {
    "session_duration": "min",
    "item_duration": "min",
    "item_distance": "km",
    "set_duration": "s",
    "set_distance": "m",
    "weight": "kg",
    "assistance": "kg",
    "repetitions": "count"
  },
  "completeness": {
    "status": "complete",
    "truncated": false,
    "session_count": 0,
    "item_count": 0,
    "set_count": 0
  },
  "quality": {
    "status": "no_data",
    "cautions": ["no_sessions_in_range"]
  },
  "sessions": []
}
```

RPC-, Snapshot- und Rangevertrag:

- Signatur exakt
  `public.activity_v2_coaching_export(p_from date, p_to date) returns jsonb`;
  kein zweiter Overload.
- `STABLE SECURITY INVOKER`, Owner `postgres`, `search_path=''`, Execute nur
  für `authenticated`; `PUBLIC`, `anon` und `service_role` ohne Execute.
- Die Function lehnt fehlenden `auth.uid()` und jede Auth-Session mit
  `is_anonymous != false` ab. Jede Session-/Item-/Set-Leseoperation ist
  zusätzlich explizit auf denselben User begrenzt; der globale immutable
  Katalog besitzt fachlich korrekt keine `user_id`-Spalte.
- Der `STABLE`-Aufruf bindet alle internen Count-, Drift- und Aggregatreads an
  den Snapshot der aufrufenden Query. Es gibt genau einen logischen
  Data-API-RPC und keine zweite Datenbankrunde.
- `from` und `to` sind kanonische ISO-Tage `YYYY-MM-DD`; beide inklusive,
  `from <= to`, höchstens 366 inklusive Tage und `to` höchstens der durch
  `timezone('Europe/Vienna', statement_timestamp())::date` bestimmte Tag.
  SQL-Grenze: `p_to - p_from between 0 and 365`.
- Sessionmitgliedschaft verwendet `health_activity_sessions.day between
  p_from and p_to`; eine optionale, logisch äquivalente Timestamp-Vorfilterung
  darf nur der Nutzung des bestehenden `(user_id, started_at, id)`-Indexes
  dienen und die Day-Prüfung nicht ersetzen.

Exakte Objekt-Keysets:

- Top Level: `schema_version`, `generated_at`, `timezone`, `range`, `units`,
  `completeness`, `quality`, `sessions`.
- `range`: `from`, `to`, `inclusive`.
- `units`: `session_duration`, `item_duration`, `item_distance`,
  `set_duration`, `set_distance`, `weight`, `assistance`, `repetitions`.
- `completeness`: `status`, `truncated`, `session_count`, `item_count`,
  `set_count`.
- `quality`: `status`, `cautions`.
- Session: `session_id`, `catalog_version`, `revision`, `day`, `started_at`,
  `ended_at`, `duration_min`, `title`, `note`, `items`.
- Item: `item_key`, `item_order`, `item_label_snapshot`,
  `tracking_mode_snapshot`, `equipment_snapshot`,
  `load_comparability_snapshot`, `field_policy_snapshot`, `category`,
  `muscle_groups`, `sport_tags`, `duration_min`, `distance_km`, `note`,
  `sets`.
- Set: `set_order`, `tracking_mode`, `reps`, `duration_sec`, `distance_m`,
  `weight_kg`, `assistance_kg`.
- Unbekannte, fehlende oder accessor-basierte Keys sowie sparse Arrays sind
  Client-Contractverletzungen. Objekt-Key-Reihenfolge bleibt irrelevant.

Exakte Typ-, Enum- und Zahlengrenzen:

- `generated_at`, `started_at` und `ended_at` haben exakt die kanonische UTC-
  Form `YYYY-MM-DDTHH:mm:ss.SSSZ`; Tage exakt `YYYY-MM-DD`.
- `session_id` ist eine kanonische Lowercase-UUID; `revision` ein positiver
  Dezimalstring bis `9223372036854775807`; `catalog_version` liegt in
  `1..2147483647`.
- `duration_min` liegt in `1..1440`; optionale Itemdauer ebenso.
  `distance_km` liegt optional in `0.01..1000.00`, höchstens zwei Dezimalen.
- `item_order` und `set_order` liegen in `1..50` und sind innerhalb des
  Elternarrays exakt lückenlos `1..n`.
- `reps` liegt optional in `1..1000`, `duration_sec` in `1..3600`,
  `distance_m` in `0.10..10000.00`, `weight_kg` und `assistance_kg` in
  `0.01..1000.00`; Dezimalfelder besitzen höchstens zwei Dezimalstellen.
- Pro Set ist genau eines aus `reps`, `duration_sec`, `distance_m` gesetzt;
  `weight_kg` und `assistance_kg` sind nie gleichzeitig gesetzt.
- `category` ist `endurance|sport|strength`; Tracking Mode ist
  `duration|duration_distance|strength_sets`; Equipment ist
  `barbell|bodyweight|cable|cardio_machine|dumbbell|kettlebell|machine|none|variable`;
  Load Comparability ist `device_relative|not_applicable|standardized`.
- `muscle_groups` enthält nur `adductors|back|biceps|calves|chest|core|forearms|full_body|glutes|hamstrings|hip_flexors|quadriceps|shoulders|triceps`;
  `sport_tags` nur `endurance|indoor|outdoor|team_sport|water_sport`.
  Beide Arrays sind dicht, duplikatfrei und in der Original-Katalogreihenfolge.
- `field_policy_snapshot` besitzt exakt die acht Keys `assistance_kg`,
  `distance_km`, `distance_m`, `duration_min`, `duration_sec`, `note`, `reps`,
  `weight_kg`; jeder Wert ist `forbidden|optional|required`.
- Titel ist `null` oder ein bereits kanonischer String mit `1..120`
  Codepoints; Session-/Itemnote analog `1..500`; Itemlabel `1..80`.

Verbindliche Sessionfelder:

- `session_id`: kanonische UUID für Traceability;
- `catalog_version`: positive Ganzzahl, eindeutig aus den gespeicherten Items
  derselben Session abgeleitet; fehlende Items oder mehrere Versionen sind
  Snapshotdrift und führen zum Fehler;
- `revision`: positiver Dezimalstring analog R9, nicht unsicheres JS-BigInt;
- `day`: Vienna-ISO-Tag;
- `started_at` und `ended_at`: kanonische UTC-RFC3339-Timestamps;
- `duration_min`: gespeicherter positiver Istwert;
- `title` und `note`: gespeicherter String oder `null`;
- `items`: dichtes Array.

Verbindliche Itemfelder:

- `item_key`, `item_order`, `item_label_snapshot`,
  `tracking_mode_snapshot`, `equipment_snapshot`,
  `load_comparability_snapshot`, `field_policy_snapshot`;
- `category`, `muscle_groups`, `sport_tags` aus der exakt referenzierten
  unveränderlichen Katalogzeile `(catalog_version, item_key)`;
- `duration_min`, `distance_km`, `note` als gespeicherter Wert oder `null`;
- `sets`: bei Strength die gespeicherten Sätze, sonst ein leeres Array.

Verbindliche Setfelder:

- `set_order`, `tracking_mode`, `reps`, `duration_sec`, `distance_m`,
  `weight_kg`, `assistance_kg`;
- verbotene beziehungsweise nicht gesetzte Werte bleiben `null`; Zahlen
  bleiben JSON-Zahlen und werden nicht als lokalisierter Text exportiert.

Qualitätsvertrag:

- `quality.status` ist ausschließlich `ok` oder `no_data`.
- `quality.cautions` ist ein dedupliziertes, codepoint-sortiertes Array aus:
  - `no_sessions_in_range`, falls keine Session vorliegt;
  - `device_relative_loads_present`, falls mindestens ein Item so markiert ist;
  - `assistance_loads_present`, falls mindestens ein Assistance-Wert vorliegt;
  - `multiple_catalog_versions_present`, falls der Range mehr als eine
    Katalogversion enthält.
- Revision größer eins erzeugt keine Warnung. Sie beschreibt den aktuellen
  korrigierten Iststand, nicht schlechte Datenqualität.
- `generated_at` ist die kanonische UTC-Darstellung von
  `statement_timestamp()` des einen Exportaufrufs. Zwei inhaltlich gleiche
  Exporte dürfen sich deshalb in diesem Feld unterscheiden.
- Objekt-Key-Reihenfolge besitzt keine Semantik. Exakte Keysets und die
  Reihenfolge aller Arrays sind Teil des Vertrags.

Struktureller Drift- und Vollständigkeitsvertrag:

- Jede exportierte Session besitzt `1..50` Items, exakt eine daraus
  abgeleitete Katalogversion und lückenlose Itemorders; Itemkeys bleiben
  eindeutig.
- Jedes `strength_sets`-Item besitzt `1..50` lückenlos geordnete Sets;
  Non-Strength-Items besitzen exakt `sets: []`.
- Für jedes Item muss genau die Katalogzeile
  `(catalog_version,item_key,tracking_mode_snapshot)` vorhanden sein. Nur aus
  dieser Zeile kommen `category`, `muscle_groups` und `sport_tags`.
- Fehlendes Item, gemischte Session-Katalogversion, Orderlücke, unerwartete
  Setstruktur, fehlender Original-Katalogjoin oder sonstige Snapshotdrift
  erzeugt `MIDAS_ACTIVITY_EXPORT_SNAPSHOT_DRIFT`; niemals Empty-Success.
- Die Completeness-Counts entsprechen exakt den Längen der verschachtelten
  Arrays und den vorab geprüften Snapshotcounts. Alle drei Caps werden vor
  Payloadaggregation geprüft; `truncated` ist ausschließlich `false`.

Fehler- und Clientvertrag:

- Bekannte SQL-Tokens werden auf die sicheren Data-Access-Codes
  `AUTH_REQUIRED`, `INVALID_EXPORT_REQUEST`, `EXPORT_LIMIT_EXCEEDED` und
  `EXPORT_SNAPSHOT_DRIFT` abgebildet. Rohes SQL, PostgREST-Detail und
  Responsebody gelangen weder in UI, Diagnose noch Download.
- Transport-/5xx-/429-Fehler werden als `REQUEST_FAILED` retrybar behandelt;
  malformed Success, unbekannte Keys oder Count-/Schemaabweichung als
  `EXPORT_CONTRACT_INVALID` fail-closed. Ein Export besitzt weder
  `commitState` noch `mutationState`; ein Retry ist wegen read-only sicher.
- Pure Namespace: `AppModules.activityV2.coachingExport` mit
  `validateExport(value)`, `validateRange(value, today)`,
  `createPresetRange(months, now)` für exakt `3|6` und
  `buildDownloadName(range)`.
- Data Access ergänzt exakt
  `loadCoachingExport({ from, to })`. Der Requestbody ist
  `{ p_from, p_to }`; pro Aufruf gibt es genau einen logischen RPC auf
  `activity_v2_coaching_export`. Ein Auth-Refresh darf höchstens den
  identischen Body über die bestehende `maxAttempts: 2`-Grenze wiederholen.
- Presets bestimmen `to` als Vienna-Tag des injizierten `now`, ziehen im
  lokalen Kalender exakt drei oder sechs Monate ab und klemmen den Tag auf
  den letzten gültigen Zielmonatstag. Custom verwendet dieselbe Rangeprüfung.

Nicht enthalten:

- `user_id`, JWT-/Authdaten, E-Mail, Request-ID, Request-Fingerprint,
  Content-Fingerprint, technische Item-/Set-UUIDs und interne Timestamps ohne
  Coachingnutzen;
- Health Events, Medikamente, Labor, Blutdruck, Profil oder medizinischer
  Status;
- Empfehlungen, Diagnosen, Zielwerte, Trainingsplan, Importhinweise oder
  Modellprompt.

## Owner-Briefing-Bedarf

- Erklärmodus:
  - `Briefing + S6-Recap`.
- Neue oder entscheidungsrelevante Konzepte:
  - warum ein eigener Export-RPC statt vieler History-Requests notwendig ist;
  - warum `SECURITY INVOKER`, RLS und Function-ACL getrennte Schutzschichten
    sind;
  - Unterschied zwischen vollständigem Ist-Export, Health Export und
    späterer MCP-Orchestrierung;
  - produktive Wirkung und Rollback von SQL 24.
- Geplante Briefing-Gates:
  - S4R vor dem Umsetzungsauftrag;
  - S5 vor produktivem SQL 24;
  - S6 als kurze Erklärung des finalen Exportflusses.
- Nicht erneut zu erklären:
  - normale JS-Modularisierung, Testsyntax, CSS-/Harness-Standardarbeit.

## Scope und Grenzen

In Scope:

- versionierter Exportvertrag und strikte Clientvalidierung;
- dedicated read-only Database Function samt ACL, Rollback und Fixture;
- drei/sechs Kalendermonate und Custom-Range als isolierter Consumervertrag;
- Activity-V2-Data-Access-Erweiterung;
- isolierter Downloadcontroller und Browser-Harness;
- SQL-/Node-/Browser-/Security-/Isolationstests;
- produktive Installation von SQL 24 nach separatem Owner-Gate;
- Doku-, QA-, Masterplan-, HOW-TO- und Changelog-Entscheidung in S6.

Nicht in Scope:

- produktive UI-Verdrahtung, `index.html`, Service Worker oder Navigation;
- Activity V1, Doctor View, Arztbericht, Health Export, Protein Target oder
  Trendpilot;
- MCP-Server, OpenAI-API-Aufruf oder LLM-Auswertung im Test;
- Session-Import, Trainingsplanverwaltung oder Prepared Template;
- neue Trainingssemantik, Katalogeinträge oder Katalogversion;
- Retention, Löschung, Korrektur oder Erzeugung realer Sessions;
- Android-/ADB-/APK-Test; dieser bleibt R12, da R10 nicht produktiv geladen
  wird.

Roadmap-spezifische Guardrails:

- Export ist read-only und all-or-error.
- Nur Daten des `auth.uid()` dürfen sichtbar werden.
- Kein `SECURITY DEFINER`, keine direkte Tabellen-DML aus dem Client und kein
  Execute für `anon`, `PUBLIC` oder `service_role`.
- Alle historischen Itemsemantiken bleiben an ihre gespeicherte
  Katalogversion gebunden.
- Der Browser darf nur ein streng validiertes V1-Objekt herunterladen.
- Kein stiller Fallback auf Activity V1 oder Health Export.

## Scope-Freeze vor S4

- Bestehende Features:
  - bleiben unverändert; R10 ist isoliert und testgebunden.
- Datenmodell, Lifecycle und Retention:
  - keine Tabellen-/Spaltenänderung und keine DML;
  - additive read-only Function plus ACL und Rollback.
- Cleanup, Scheduler, Secrets und externe Automationen:
  - nicht betroffen.
- Kompatible Producer und Consumer:
  - Producer: gespeicherte R8/R9-Activity-V2-Postimages;
  - Consumer: isolierter R10-Download und später read-only MCP;
  - R11 nutzt nur eigene Zusammenfassung, nicht dieses Vollschema als
    Doctor-Report-Layout.
- Offene Grundsatzfragen:
  - keine; S1-S3 dürfen reale Implementierungsdetails korrigieren, aber den
    Zielvertrag nicht still erweitern.
- Umgang mit späterem Scope-Wechsel:
  - kleine technische Korrektur via S2/S3/S4R;
  - Health-/Doctor-/MCP-/Importerweiterung nur in zuständiger Follow-up-
    Roadmap.

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
- archivierte R9-Roadmap und R9-Evidence
- `sql/20_Activity_V2.sql`
- `sql/21_Activity_V2_Catalog_V2.sql`
- `sql/22_Activity_V2_Commit_Compatibility.sql`
- `sql/23_Activity_V2_History_Lifecycle.sql`
- `sql/16_Explicit_Grants.sql`
- `sql/HOW_TO.md`
- Activity-V2-Data-Access und Contract-/Isolationstests
- `docs/qa/health-capture-reports.md`
- aktuelle offizielle Supabase-Dokumentation und relevante Changelog-Hinweise

Nur bei konkreter Vertragsfrage:

- R8-Roadmap/Evidence für Commit-/Produkt-SQL-Postconditions;
- bestehender Health Export für Versionierungs-, Download- und
  All-or-Error-Muster;
- R4-Roadmap für historische Item-Key-/Last-Performance-Semantik;
- R7-Recovery, falls eine Isolationsfrage den Draft berührt.

In S1 frisch geprüfte Primärquellen (Stand 2026-08-13):

- [Supabase Database Functions](https://supabase.com/docs/guides/database/functions)
  für Invoker/Definer, leeren Search Path und Function-Privileges;
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
  für RLS, `auth.uid()` und anonyme Auth-User;
- [Supabase Database Timeouts](https://supabase.com/docs/guides/database/postgres/timeouts)
  für die maximal konfigurierbare 60-Sekunden-Grenze von Dashboard-/Client-
  Queries;
- [Supabase Advisors](https://supabase.com/docs/guides/database/database-advisors)
  für die aktuellen Security-Lints einschließlich `0029`;
- [Supabase Data API / PostgREST v14](https://supabase.com/changelog/41288-data-api-upgrade-to-postgrest-v14)
  und [PostgREST Transactions](https://postgrest.org/en/stable/references/transactions.html)
  für RPC-Transaktionsmodus und `STABLE`-POST als read-only;
- [PostgreSQL 17 Function Volatility](https://www.postgresql.org/docs/17/xfunc-volatility.html)
  für den gemeinsamen Calling-Query-Snapshot aller Reads einer `STABLE`-
  Function;
- [Supabase Automatic PostgREST Retries](https://supabase.com/changelog/45071-automatic-postgrest-retries-for-transient-errors)
  als aktuelle Abgrenzung: automatische Library-Retries betreffen GET/HEAD,
  nicht den bestehenden MIDAS-POST-Adapter.

Die Dokumentation erlaubt höchstens 60 Sekunden für Clientqueries; das reale
Projekt ist strenger konfiguriert: `authenticated` und `authenticator` stehen
read-only belegt auf jeweils 8 Sekunden. R10 plant keine Timeoutänderung.

## Tool Permissions und Gates

Allowed:

- lokale Dateireads, `rg`, Git-Status/Diff und read-only Runtimechecks;
- Node-/Contract-/Lint-/Syntaxchecks;
- Docker/PostgreSQL-17- und lokaler Supabase-Stack für disposable Fixtures;
- read-only Supabase-Preflight und Advisors;
- Browser-/Live-Server-Test des isolierten Harnesses;
- CodeRabbit in S5 gemäß Reviewvertrag;
- Source-Edits nach separater S4-Freigabe.

User-gated:

- produktives SQL 24 oder Rollback;
- Änderung an produktivem Webload, Navigation, Activity V1, Doctor View oder
  Health Export;
- Web-/Edge-/APK-Deploy und Device-Aktionen;
- reale Sessionmutation.

Forbidden:

- Secrets ausgeben oder committen.
- fremde Worktree-Änderungen zurücksetzen.
- Scope, Datenwirkung oder Architektur still erweitern.
- synthetische Activity-V2-Produktdaten anlegen.
- produktive SQL-Ausführung aus einer allgemeinen S4-Freigabe ableiten.
- R9-History-RPCs zu einer clientseitigen Vollhistorie loopen.
- Teilantwort als vollständigen Export kennzeichnen.

## Statusmatrix

<!-- markdownlint-disable MD013 -->

| ID | Schritt | Reasoning | Status | Kompaktes Ergebnis |
| --- | --- | --- | --- | --- |
| S1 | System- und Vertragsdetektivarbeit | `Extra High` | PASS | Repo/Git, SQL 20-23, R9-Consumer, Produktbaseline 0/0/0, Toolchain, Primärquellen und 208 Contracts verifiziert. |
| S2 | Fachlicher/technischer Zielvertrag | `Extra High` | PASS | Exakter Snapshot-, Range-, JSON-, Enum-, Count-, Error-, Privacy- und Clientvertrag eingefroren. |
| S3 | Bruchrisiko-, Security- und Umsetzungsreview | `Extra High` | PASS | BOLA, Snapshot/Race, Katalog, Range, Caps, Drift, Privacy, Isolation, Rollback und Consumer vollständig mit Prevention/Testorakel belegt. |
| S4R | S4 Readiness Review | `Extra High` | PASS | `CONDITIONAL GO`; S4.1-S4.5 vollständig paketiert und Owner-Gates definiert. |
| S4.1 | Pure V1-Schema-, Range- und Validatorbasis | `High` | PASS | Exakte immutable V1-/Range-/Preset-/Filename-API; 14/14 gezielte und 222/222 gesamte Contracts PASS; Isolation/Katalog PASS. |
| S4.2 | SQL 24, Rollback, ACL und disposable Fixture | `Extra High` | PASS | SQL 24/Rollback/SQL 16/HOW-TO und PG17-Fixture; Fresh/Rerun/Drift/Auth/RLS/Range/Cap/Race/Rollback PASS; 13.666.612-Byte-Maximalpayload in 1,453s unter 8s. |
| S4.3 | Data-Access-Adapter und sichere Fehlergrenze | `High` | PASS | Exakt ein read-only RPC, strict Range/Response, Deep-Freeze und sichere Auth/Range/Cap/Snapshot/Contract/Request-Fehler; T-ACT-R10-05 PASS. |
| S4.4 | Isolierter Exportcontroller und Download-Harness | `High` | PASS | Default 6, Preset 3, Custom, Loading/Empty/Error/Retry, stale guard und Blob-Revoke; Desktop/390/320 Browser-Smokes 3/3 PASS. |
| S4.5 | Isolation, Negativorakel und Provisioning-Spiegel | `High` | PASS | SQL-/Client-Feld- und Enumparität, Fixture-Consumerfragen, sechs Adjacent-Negativorakel, SQL-16-Historisierung und HOW-TO PASS; weiterhin kein Produktload. |
| S5 | Testmatrix, Review, CodeRabbit und produktives SQL-Gate | `Extra High` | PASS | 237/237 Contracts, PG17-Vollfixture, Browser 3/3, Consumer/Isolation, Native Review und CodeRabbit geschlossen; SQL 24 produktiv mit exaktem Hash installiert, ACL/Auth/Empty-V1/Advisor und unveränderte 0/0/0-Daten postgeprüft. |
| S6 | Doku-Sync, Commit-Empfehlung und Archiv | `High` | DONE | Activity Overview, Masterplan, HCR-028, SQL HOW-TO/Grantspiegel und Changelog synchron; Produktpostimage read-only bestätigt; Owner-Recap und Denkraum-Übergabe erstellt; R10-Roadmap/Evidence gemeinsam archiviert. |

<!-- markdownlint-enable MD013 -->

## Findings

<!-- markdownlint-disable MD013 -->

| ID | Severity | Typ | Status | Entscheidung / Zielschritt |
| --- | --- | --- | --- | --- |
| F-ACT-R10-01 | P2 | Doku | fixed | Veraltete aktive R9-Doppeldatei vor R10 entfernt; archivierte DONE-Datei bleibt einzige R9-Source-of-Truth. |
| F-ACT-R10-02 | P1 | Contract | fixed | R9-UI-RPCs nicht als Exportpipeline verwenden; dedicated Snapshot-RPC in D-ACT-R10-02/-03. |
| F-ACT-R10-03 | P1 | Daten | fixed | Historische Tags aus exakter Original-Katalogversion statt aktuellem Katalog. |
| F-ACT-R10-04 | P1 | Contract | fixed | All-or-error, explizite Caps und `truncated: false`; keine Teilantwort. |
| F-ACT-R10-05 | P1 | Scope | fixed | Health Export, Doctor View, MCP und Import explizit getrennt. |
| F-ACT-R10-06 | P2 | Quality | fixed | Korrigierte Session nicht als schlechte Qualität markieren; nur deterministische Cautions. |
| F-ACT-R10-07 | P1 | QA | fixed | Realistische Coachingdaten im disposable Fixture; Produktpostcheck darf leer sein. |
| F-ACT-R10-08 | P1 | Security | fixed | `SECURITY INVOKER`, RLS, leerer Search Path und authenticated-only Execute eingefroren. |
| F-ACT-R10-09 | P1 | Contract | fixed | Vienna-Zeitzone, inklusive Range, Zukunftsverbot, Monats-Clamping und 366-Tage-Cap exakt definiert. |
| F-ACT-R10-10 | P2 | QA | fixed | CodeRabbit auf einen Initial- und einen Verifikationslauf in S5 begrenzt. |
| F-ACT-R10-11 | P1 | Evidence | fixed | Eigene Evidence-Datei wegen produktiver Function-/ACL-Wirkung verpflichtend. |
| F-ACT-R10-12 | P1 | Daten | fixed | `catalog_version` nicht als Session-Spalte vorausgesetzt; eindeutige Ableitung aus allen gespeicherten Items und Driftfehler eingefroren. |
| F-ACT-R10-13 | P1 | Security | fixed | Authcheck um reale R9-Grenze `auth.uid()` plus `is_anonymous = false` präzisiert. |
| F-ACT-R10-14 | P2 | Contract | fixed | Objekt-Key-Reihenfolge aus Determinismusvertrag entfernt; exakte Keysets und Arrayreihenfolgen bleiben verbindlich. |
| F-ACT-R10-15 | P2 | Contract | fixed | `generated_at` an `statement_timestamp()` desselben RPC-Aufrufs gebunden und bei semantischen Gleichheitschecks ausgenommen. |
| F-ACT-R10-16 | P2 | Copy | fixed | Neue R10-Dokumente auf deutsche Umlaute und bestehende MIDAS-Schreibkonvention normalisiert. |
| F-ACT-R10-17 | P1 | Lifecycle | fixed | Persistierte R8/R9-Session als abgeschlossenen Commit definiert; keine erfundene Completion-Statusspalte. |
| F-ACT-R10-18 | P1 | Range | fixed | Range-Mitgliedschaft explizit an den gespeicherten Vienna-Tag `health_activity_sessions.day` gebunden. |
| F-ACT-R10-19 | P1 | Snapshot | fixed | Ein interner Ein-Statement-Zwang war unbelegt und kollidierte mit Cap-before-build. Der reale PostgreSQL-17-Vertrag bindet alle Reads einer `STABLE`-Function an den Calling-Query-Snapshot; D-ACT-R10-24 und S4.2 korrigiert. |
| F-ACT-R10-20 | P1 | Daten | fixed | Der Katalog besitzt keine `user_id`-Spalte. Expliziter Ownerfilter gilt exakt für Sessions, Items und Sets; der Katalogjoin bleibt global, versionsgebunden und RLS-/ACL-geschützt. |
| F-ACT-R10-21 | P1 | Contract | fixed | Fehlende exakte Keysets, Timestampform, Enums, Zahlengrenzen, SQL-/Clientfehler und API-Namen im V1-Vertrag ergänzt. |
| F-ACT-R10-22 | P1 | Datenintegrität | fixed | Mixed-Version, fehlende Items, Orderlücken, Mode-/Set-Drift und fehlender Original-Katalogjoin erzeugen nun explizit Snapshotdrift statt scheinbar vollständigem Export. |
| F-ACT-R10-23 | P2 | Security | watch | Produktiver Advisor meldet drei erwartete, bereits R8/R9-reviewte `authenticated_security_definer_function_executable`-Warnungen sowie deaktivierten Leaked-Password-Schutz. R10 fügt ausschließlich `SECURITY INVOKER` hinzu; der S5-Postcheck bestätigt keine neue R10-Warnung. |
| F-ACT-R10-24 | P2 | Tooling | fixed | Windows-PATH besitzt keine CLI, der dokumentierte kanonische WSL-Pfad `/root/.local/bin/coderabbit` liefert aber CodeRabbit 0.7.2. Kein Review wurde vorgezogen; der Pflichtlauf bleibt S5. |
| F-ACT-R10-25 | P2 | Performance | fixed | Exakte 1000/10000/50000-Caplast ergab 13.666.612 Bytes und zuletzt 1,453s unter `statement_timeout=8s`; jede Einzelüberschreitung brach mit dem Limit-Token vor Payloadaggregation ab. Keine Timeout-Erhöhung nötig. |
| F-ACT-R10-26 | P1 | Range | fixed | Der erste S4.1-Deltaentwurf hätte `range.to` gegen den UTC-Kalendertag von `generated_at` geprüft. Korrigiert auf den daraus abgeleiteten Vienna-Tag; UTC-Sommer-/Wintergrenzen sind in T-ACT-R10-02 abgedeckt. |
| F-ACT-R10-27 | P2 | Evidence | fixed | Der Evidence-Nachweisvertrag verwies trotz bereits eingefrorener Entscheidungen nur auf D-ACT-R10-01 bis -23. Auf den realen Entscheidungsstand D-ACT-R10-01 bis -27 synchronisiert. |
| F-ACT-R10-28 | P1 | SQL Runtime | fixed | Der erste SQL-24-Runtimecall deckte unzulässig qualifiziertes `pg_catalog.coalesce` und den realen Katalognamen `label` statt `item_label` auf. Beide Quellen korrigiert, Functionhash neu eingefroren und Empty/Real/Cap erneut ausgeführt. |
| F-ACT-R10-29 | P1 | Provisioning | fixed | Der erste Forward-Guard prüfte die vier öffentlichen R9-RPCs, aber noch nicht R8 Commit/Lookup, den privaten R9-Helper und exakte Tabellen-ACLs. Guard und Driftfixture fail-closed erweitert; vollständige Matrix erneut PASS. |
| F-ACT-R10-30 | P2 | Fixture | fixed | Das Range-Negativorakel verwendete zunächst die gültige 366-Tage-Inklusivgrenze und das Delete-Race verglich gegen das Vorbild vor der Correction. Auf 367 Tage beziehungsweise das unmittelbare Pre-Delete-Bild korrigiert; beide Orakel erneut PASS. |
| F-ACT-R10-31 | P2 | Isolation | fixed | Das in S4.2 erwartbar invalidierte SQL-16-Hashorakel wurde in S4.5 auf den geprüften R10-Hash fortgeschrieben und um sechs Doctor-/Health-/Protein-/Trendpilot-Negativorakel ergänzt; Isolation erneut PASS. |
| F-ACT-R10-32 | P2 | Tooling | watch | Der installierte In-App-Browser konnte mangels `trusted Node REPL browser service` auch beim verpflichtenden S5-Erstversuch nicht initialisiert werden. Der vom Frontend-Testvertrag erlaubte lokale Edge/Playwright-Fallback bestand die Desktop-/390-/320-Matrix erneut 3/3. |
| F-ACT-R10-33 | P2 | Browser | fixed | Der erste ansonsten grüne Browserlauf meldete nur einen Favicon-404. Das isolierte Harness erhielt ein Data-Icon; Console-/Page-Error-Orakel danach 3/3 PASS. |
| F-ACT-R10-34 | P1 | Contract | fixed | Delta-Review härtete Adapter- und Controller-Rangeinputs auf exakte Own-Data-Properties; Accessor-, Symbol- und versteckte Extrakeys werden vor RPC beziehungsweise Load fail-closed abgewiesen. |
| F-ACT-R10-35 | P2 | Harness | fixed | Der Fakeadapter filterte die realistische Fixture zunächst nicht für beliebige Custom-Ranges. Filter, Counts, Quality und Cautions werden nun deterministisch aus der gewählten Range neu abgeleitet; Browsermatrix erneut PASS. |
| F-ACT-R10-36 | P2 | Lifecycle | fixed | Der begrenzte S4.5-Delta-/Consumer-Review fand einen theoretischen Blob-Lifecycle-Randfall bei werfenden Consumer-Subscriptions beziehungsweise Fehlern nach URL-Erzeugung. Subscriberfehler werden isoliert und der Filename vor Blob/URL abgeleitet; Controller- und Browsermatrix erneut PASS, während EV-ACT-R10-L12 bis S5 offen blieb. |
| F-ACT-R10-37 | P2 | QA | fixed | Der S5-Gesamtlauf zeigte eine veraltete R9-Ausgabeerwartung im Isolation-Contract. Das erwartete payloadfreie Ergebnis wurde um `r10_negative_oracles=6` ergänzt; anschließend 237/237 Contracts und Isolation PASS. |
| F-ACT-R10-38 | P2 | Tooling | fixed | Das aktuelle lokale Supabase-17.6-Image startet einmal neu und führt `postgres` nicht mehr als Superuser, während der disposable `dblink`-Raceharness den früheren privilegierten Testzustand erwartet. Ausschließlich im exakt benannten Wegwerfcontainer wurde der Harnesszustand hergestellt; Vollfixture PASS und Container entfernt. |
| F-ACT-R10-39 | P2 | Review | fixed | Der initiale CodeRabbit-Lauf erfasste untracked R10-Dateien nicht. Für den geplanten Verifikationslauf wurde ausschließlich der R10-Dateisatz temporär gestaged, vollständig reviewt und der ursprüngliche unstaged Indexzustand danach wiederhergestellt. |
| F-ACT-R10-40 | P1 | Security | fixed | CodeRabbit fand, dass SQL 16 einer vorhandenen Exportfunction ohne Source-/Hardeningprüfung erneut Execute geben konnte. SQL 16 validiert nun Functionhash, Owner, Returntyp, `SECURITY INVOKER`, `STABLE` und `search_path=''` vor Grants; ein Runtime-Driftorakel und der aktualisierte Isolationshash sind PASS. |
| F-ACT-R10-41 | P1 | Datenintegrität | fixed | CodeRabbit fand ein TOCTOU-Fenster zwischen SQL-24-Preimageprüfung und Tabellenlock. Der `SHARE`-Lock liegt nun vor allen katalog-/tabellenkritischen Guards; vollständige Fresh/Rerun/Drift/Rollback/Forward-/Race-Matrix erneut PASS. |
| F-ACT-R10-42 | P2 | UX | fixed | Eine ungültige Custom-Range wurde beim Error-Render auf den vorherigen gültigen State zurückgesetzt. Die Shell erhält die aktuelle Nutzereingabe bei `INVALID_EXPORT_REQUEST`; das 320px-Browserorakel prüft Fehler, Werterhalt, Korrektur und Empty-Download. |
| F-ACT-R10-43 | P2 | Contract/Fixture | rejected | Zwei CodeRabbit-Minors wurden gegen reale Verträge verworfen: strengere Unicode-/Control-Textregeln würden gültige R1/R9-`btrim`-Daten ablehnen; `password=postgres` ist ausschließlich die dokumentierte disposable `dblink`-Credential und kein Produktsecret. |
| F-ACT-R10-44 | P2 | Evidence | fixed | Der außergewöhnliche P1-Nachreview fand nur die missverständliche Bezeichnung von F-ACT-R10-36 als S4-Finalreview. Auf S4.5-Delta-/Consumer-Review präzisiert; EV-ACT-R10-L12 bleibt eindeutig der abgeschlossene S5-Native-Review. |
| F-ACT-R10-45 | P2 | Preflight | fixed | Der erste ausschließlich read-only ausgeführte Produktdiagnosequery qualifizierte `COALESCE` fälschlich mit `pg_catalog` und brach ohne Wirkung ab. Der Query wurde korrigiert und der vollständige frische Preflight anschließend PASS wiederholt; keine Produktmutation erfolgte. |
| F-ACT-R10-46 | P2 | S6 Postcheck | fixed | Der erste read-only S6-Recheck verglich `pg_get_function_identity_arguments` fälschlich mit unbenanntem `date,date` und meldete die benannten Argumente als absent. Der korrigierte `to_regprocedure`-Lookup bestätigte exakt eine Function mit `p_from date, p_to date`, kanonischem Hash/ACL/Hardening und 0/0/0; beide Queries waren wirkungslos. |
| F-ACT-R10-47 | P1 | Provisioning/Doku | fixed | `sql/HOW_TO.md` konnte so gelesen werden, als müsse auf einem kanonischen R9-Produktziel nach SQL 24 zusätzlich SQL 16 laufen. Gegen den realen S5-Vertrag korrigiert: produktiv wurde und wird nur SQL 24 benötigt; SQL 16 ist Full-Build-/Grantspiegel und jede spätere produktive Ausführung ein separates Owner-Gate. |

<!-- markdownlint-enable MD013 -->

## Initialer Roadmap Contract Review

Status: `PASS` am 2026-08-13.

Geprüft nach dem ersten Schreibstand:

1. Zielvertrag gegen Masterplan R10/R11/R12 und finales Akzeptanzbild prüfen.
2. Exportfelder gegen reale SQL-20-/R9-Spalten und Katalog-FKs prüfen.
3. Scope gegen Activity V1, Doctor View, Health Export, MCP und R13 abgrenzen.
4. Securityvertrag gegen aktuelle Supabase-Vorgaben und R9-ACL-Muster prüfen.
5. S4-/S5-Phasentrennung und CodeRabbit-Ökonomie gegen Workflow-Vertrag
   prüfen.
6. Evidence-, Owner- und Produkt-SQL-Gates auf Vollständigkeit prüfen.
7. Fresh-Chat-Test: Roadmap muss ohne Denkraum-Nacherzählung ausführbar sein.

Ergebnis:

- Zielbild und Reihenfolge stimmen mit R10/R11/R12/R13 im Masterplan überein.
- Reale SQL-20-/R9-Struktur bestätigt alle Exportfelder; die nicht direkt in
  der Session gespeicherte Katalogversion wurde als eindeutige Item-Ableitung
  korrigiert.
- R9-Auth-/ACL-Muster bestätigt `SECURITY INVOKER`, `auth.uid()`, den
  Ausschluss anonymer Auth-Sessions und authenticated-only Execute.
- Snapshot-, Vollständigkeits-, Range-, Cap-, Rollback- und Evidence-Gates
  sind einem konkreten Schritt und Testorakel zugeordnet.
- S4 baut ohne CodeRabbit und ohne Produktwirkung; S5 besitzt genau einen
  initialen und einen geplanten Verifikationslauf vor dem Produkt-SQL-Gate.
- Fresh-Chat-Test PASS: Kein erforderlicher R10-Vertrag verbleibt nur im
  Denkraum. Offene Implementierungsfakten werden in S1 verifiziert.

## S1 - System- und Vertragsdetektivarbeit

Ziel: Reale Exportquellen, APIs, Securitygrenzen und Toolchain verifizieren,
ohne Produktcode oder produktive Wirkung.

1. Pflichtquellen in der Startkarten-Reihenfolge lesen und relevante
   Versions-/Statusangaben notieren.
2. `git status --short`, HEAD und relevanten Diff erfassen; fremde Änderungen
   schützen.
3. R9-DONE-Postimage und aktive/archivierte Sources of Truth auf Widersprüche
   prüfen.
4. Tabellen, Spalten, Constraints, RLS, Grants und Original-Katalog-FK für
   Sessions, Items, Sets und Catalog Entries feldgenau erfassen.
5. R9-List-/Detail-RPCs und Data-Access-Validatoren lesen; beweisen, warum sie
   UI-Consumer bleiben und welche Validierungsbausteine wiederverwendbar sind.
6. Aktuelle Produktzähler für V2 Sessions/Items/Sets ausschließlich read-only
   erfassen; keine Produktpayload dokumentieren.
7. Bestehenden Health Export nur auf Versionierung, Range, All-or-Error,
   Downloadname und strikte Validierung untersuchen; keine Kopplung ableiten.
8. Bestehende SQL-Nummerierung, Rollback-/Fixture-/Grant-/HOW-TO-Muster und
   PostgreSQL-Version verifizieren.
9. Node-, Docker-, PostgreSQL-, Supabase-CLI-, Browser-/Live-Server- und
   CodeRabbit-Verfügbarkeit samt Versionen erfassen.
10. Offizielle Supabase-Dokumentation und Changelog auf relevante Änderungen
    bei Database Functions, Function Privileges, RLS und Data API prüfen.
11. Test-/QA-Quellen und nächste freie namespacete HCR-/T-/EV-IDs bestimmen.
12. Ergebnis, Findings, Evidence-Baseline, Statusmatrix und Resume Card
    aktualisieren.

Exit-Kriterium:

- Alle Exportquellen und Securitygrenzen sind real belegt.
- Kein Feld oder Toolbefehl beruht nur auf Erinnerung.
- Widersprüche sind korrigiert oder blockieren S2 sichtbar.
- S1 endet mit Full Review und internem Continuation Gate.

### S1 Gate Record - 2026-08-13

Urteil: `PASS`; kein Owner-Gate, autonome Fortsetzung mit S2.

- Git: `main` auf
  `5f01033e15abf59be782479ef90abb86b7b87d1e`; R10-Dokumente untracked,
  fremde Templateänderungen und die bereits vorbereitete Entfernung der
  aktiven R9-Doppeldatei geschützt. Archivierte R9-Roadmap/Evidence sind die
  vollständigen DONE-Quellen.
- Produktiv read-only: PostgreSQL 17.6; Katalog v1/v2 `78/80`, sonst keine;
  exakte Kataloghashes `1bc08533…2147`/`ca18cdef…5d4`, Referenzen `0/0`;
  Sessions/Items/Sets `0/0/0`; SQL-24-Signatur nicht vorhanden. Alle sieben
  R8/R9-Function-Hashes, Owner, Volatility, Security und leerer Search Path
  entsprechen der archivierten Evidence.
- Reales Modell: vier RLS-Tabellen, SELECT-Policies, Composite-FKs
  Session->Items->Sets und Item->Original-Katalog bestätigt. Session-
  `catalog_version` existiert absichtlich nicht; `revision bigint` existiert.
- Consumer: R9 List/Detail bleiben bounded UI-Verträge; Child-UUIDs sind keine
  Fachidentität. Der Health Export ist ein separater medizinischer V2-
  Consumer und nur Referenz für versionierten All-or-error-Download.
- Toolchain: Node 24.18.0, npm 11.18.0, Docker 29.7.2, Supabase CLI 2.109.1,
  Python 3.14.6; PostgreSQL-17-/Supabase-17.6-Images verfügbar. Host-`psql`
  fehlt, disposable Ausführung bleibt über Docker möglich. Browser- und
  CodeRabbit-Plugins sind installiert; verbotene Voll-/Reviewläufe erfolgten
  nicht.
- Günstige Baseline: Activity-V2-Contracts `208/208 PASS`, Isolation `PASS`,
  Katalog `v2/80/47/58 PASS`.
- QA-Namespace: bestehende HCR-Reihe endet bei HCR-027; R10 reserviert als
  nächsten freien Eintrag HCR-028. T-ACT-R10-01 bis -18 und
  EV-ACT-R10-B/L/PRE/W/R sind in Roadmap/Evidence namespaced.
- Full Code-/Contract-/Consumer-Review: Findings F-ACT-R10-19 bis -22 waren
  berechtigt und wurden im Zielvertrag korrigiert; F-ACT-R10-23 bis -25 sind
  nicht blockierende Watchlists. Direkt invalidierte Dokuabgleiche wurden
  wiederholt.

## S2 - Fachlicher und technischer Zielvertrag

Ziel: Den V1-Export so exakt einfrieren, dass SQL, Client und Tests unabhängig
dasselbe Objekt erzeugen beziehungsweise validieren können.

1. RPC-Signatur, Auth-, Range-, Limit-, Empty-, Error- und Snapshotvertrag
   gegen S1 finalisieren.
2. Exaktes Top-Level-Keyset, Typen, Nullbarkeit, Enumwerte und Timestampformat
   festlegen.
3. Exakte Session-, Item- und Set-Keysets samt Zahlengrenzen aus dem realen
   Schema ableiten.
4. Original-Katalog-Join für `category`, `muscle_groups` und `sport_tags`
   feldgenau festlegen; Join-Lücke muss fail-closed sein.
5. Sortier- und Tie-Break-Vertrag für Arrays und Cautions festlegen.
6. Monats-Preset-Algorithmus inklusive Monatsende, Schaltjahr und Vienna-
   Tagesgrenze als pure Funktion festlegen.
7. Vollständigkeits-, Count-, Cap- und No-Truncation-Vertrag finalisieren.
8. Quality-Cautions und den Ausschluss nicht deterministischer Bewertung
   finalisieren.
9. Privacy-/Minimierungsvertrag für IDs, Notes und technische Metadaten
   finalisieren.
10. Client-API, Fehlerklassen, Downloadname und Unknown-/Retry-Verhalten
    finalisieren.
11. Consumer-Akzeptanzfragen definieren, die ohne LLM/API durch Fixture-
    Assertions beantwortbar sein müssen:
    - letzte Ausführung einer Übung;
    - Verlauf der Istleistungen über mehrere Wochen;
    - Häufigkeit nach Muskelgruppen, Kategorien und Sport-Tags;
    - welche Lasten geräte-relativ oder standardisiert vergleichbar sind;
    - ob der Export vollständig, leer oder abgelehnt ist.
12. Scope-Freeze, Findings, Evidence, Statusmatrix und Resume Card
    aktualisieren.

Exit-Kriterium:

- JSON-Keysets, Einheiten, Ranges, Caps, Errors, Sorting und Security sind
  deterministisch.
- Kein LLM muss Feldbedeutungen aus Anzeigenamen erraten.
- Kein offener Produktentscheid blockiert S3.
- S2 endet mit Full Review und internem Continuation Gate.

### S2 Gate Record - 2026-08-13

Urteil: `PASS`; kein Owner-Gate, autonome Fortsetzung mit S3.

- RPC-/Snapshot-/Auth-/Range-/Cap-/Empty-/Errorvertrag ist gegen PostgreSQL
  17, PostgREST 14, SQL 20-23, R9 und den Masterplan konsistent.
- Alle Objekt-Keysets, Nullbarkeiten, Enums, Zahlen- und Textgrenzen,
  Millisekunden-UTC-Timestamps, Units, Counts, Arrayordnungen und
  Driftbedingungen sind normativ festgelegt.
- Original-Katalogjoin ist exakt versionsgebunden; Snapshotfelder bleiben
  Source of Truth. Tags werden weder aus dem aktuellen Katalog noch aus
  Anzeigenamen abgeleitet.
- Pure API, Data-Access-Methode, Requestbody, sichere Fehlercodes,
  Retrygrenze, Downloadname und Vienna-Monatspresets sind eingefroren.
- Full Contract-/Consumer-Review gegen R10/R11/R12/R13: keine Health-,
  Doctor-, MCP-, Import- oder Empfehlungskopplung; Consumerfragen sind durch
  das Fixture ohne LLM beantwortbar.

## S3 - Bruchrisiko-, Security- und Umsetzungsreview

Ziel: Daten-, Security-, Performance-, Rollback- und Consumer-Risiken vor
Codebeginn gegen den Zielvertrag red-teamen.

1. Auth/RLS/ACL-BOLA-Test: fremder User, `anon`, fehlender JWT und
   `authenticated` mit eigener/anderer Zeile.
2. Snapshot-/Race-Test: Korrektur oder Delete während Export darf weder
   gemischte Revisionen noch Teilpayload erzeugen.
3. Historiensemantik-Test: Katalog v1/v2 im selben Export, aktueller
   Katalogwechsel und fehlende Originalzeile fail-closed.
4. Range-Test: Future, `from > to`, 366/367 Tage, Vienna-UTC-Tagesgrenze,
   Monatsende und Schaltjahr.
5. Cap-/Payload-Test: exakt am Limit und oberhalb von Session-, Item- und
   Set-Cap; kein JSON-Bau oberhalb des erlaubten Umfangs.
6. Numeric-/Timestamp-Test: Dezimalwerte, Nullfelder, Revision als String,
   kanonische UTC-Zeit und keine Localeformatierung.
7. Empty-/Completeness-Test: leerer Range ist gültig; DB-/Contractfehler darf
   nicht als leer oder vollständig erscheinen.
8. Privacy-Test: ausgeschlossene Felder dürfen weder SQL-Response noch
   Download noch Diagnose erreichen.
9. Clientfehler-Test: malformed RPC JSON, unbekannte Keys, Sparse Arrays,
   falsche Counts, falsche Units und `truncated != false` fail-closed.
10. Isolationstest: kein Produktload, keine Activity-V1-/Doctor-/Health-
    Export-Änderung und kein Netzaufruf außer dem dedizierten RPC.
11. Rollback-/Provisioning-Test: Fresh, Rerun, Drift, Rollback und erneutes
    Forward; ACL und Owner exakt.
12. Produktgate-Test: leere Produktdaten dürfen nur Empty-Success und
    Security beweisen; realistische Coachingsemantik bleibt disposable.
13. Testinvalidation und Evidence-IDs für jeden S4-Substep festlegen.
14. Findings, Scope-Freeze, Statusmatrix und Resume Card aktualisieren.

Exit-Kriterium:

- P0/P1-Risiken besitzen Prevention und Testorakel.
- Produkt-SQL hat Vorher-/Nachher-/Rollback- und Owner-Gate.
- S4-Schnitt ist klein, reversibel und isoliert.
- S3 endet mit Full Review und internem Continuation Gate.

### S3 Gate Record - 2026-08-13

Urteil: `PASS`; kein offener P0/P1-/Security-/Datenintegritätsblocker,
autonome Fortsetzung mit S4R.

<!-- markdownlint-disable MD013 -->

| Risiko | Prevention | Verbindliches Testorakel / Evidence |
| --- | --- | --- |
| Auth/BOLA/RLS/ACL | `SECURITY INVOKER`, permanent-user Authcheck, Ownerfilter auf allen drei User-Tabellen, authenticated-only Execute | T-ACT-R10-09 / EV-ACT-R10-L04; eigener, fremder, anon, fehlender JWT, service_role und direkte DML |
| Snapshot/Race | `STABLE`-Calling-Query-Snapshot; Counts, Driftchecks und Payload im selben RPC | T-ACT-R10-10 / EV-ACT-R10-L05; Correction/Delete vor, während und nach Snapshot liefert je nur vollständiges Vor- oder Nachbild |
| Katalog/Snapshotdrift | genau eine Item-Katalogversion je Session; exakter Originaljoin; lückenlose Ordnungen und Mode-/Setstruktur | T-ACT-R10-07 / EV-ACT-R10-L03/-L05; v1/v2, Missing Join, Mixed Version, Order Gap und Catalog Drift |
| Range/Zeitzone | Server-Today Vienna; inklusive Day-Mitgliedschaft; Differenz `0..365` | T-ACT-R10-02/-08 / EV-ACT-R10-L01/-L06; Future, from>to, 366/367, DST, Monatsende, Schaltjahr |
| Caps/Last | Count-first `1000/10000/50000`, kein Payloadbau over limit | T-ACT-R10-08 / EV-ACT-R10-L06; exact-limit, jede Einzelüberschreitung und Laufzeit unter produktivem `authenticated statement_timeout=8s` |
| Numeric/Timestamp | exakte Grenzen, höchstens zwei Dezimalen, Revisionstring, UTC mit drei Millisekundenstellen | T-ACT-R10-01/-04/-06 / EV-ACT-R10-L01/-L03 |
| Empty/Completeness | Empty ist einzig `no_data`; jeder andere Fehler wirft Token; Counts müssen Arrays entsprechen | T-ACT-R10-04/-08 / EV-ACT-R10-L01/-L06 |
| Privacy/Diagnose | minimiertes Keyset; sichere Codes; kein Rohproblem in Diagnose oder Download | T-ACT-R10-05/-13 / EV-ACT-R10-L08/-L10 |
| Clientvertrag | pure strikte Validierung vor Download, deep freeze, exakt ein logischer RPC | T-ACT-R10-01/-03/-05/-12 / EV-ACT-R10-L01/-L08/-L09 |
| Isolation/Scope | kein Produktload; Negativorakel auf geschützte Consumer; nur isolierter Harness | T-ACT-R10-13 / EV-ACT-R10-L10 |
| Provisioning/Rollback | exakte Preimage-/Overload-/Hash-/Owner-/ACL-Guards; Rollback droppt nur kanonische Function | T-ACT-R10-11 / EV-ACT-R10-L02/-L07 |
| Produktwirkung | S4 nur Source/disposable; S5 frischer read-only Preflight, Briefing und separates SQL-Gate | T-ACT-R10-18 / EV-ACT-R10-PRE01..PRE05/W01 |

<!-- markdownlint-enable MD013 -->

Rollback-Urteil: Vor R12 kann der geprüfte SQL-24-Rollback die unbenutzte
isolierte Function entfernen. Nach Consumeraktivierung ist ein frischer
Consumer-/Incidententscheid erforderlich. In keinem Fall werden Sessiondaten
verändert oder wiederhergestellt.

## S4 Readiness Review

Ziel: Vor Umsetzung beweisen, dass Zielvertrag, Risiken, Tests und Gates für
jeden Substep vollständig sind.

1. S1-S3 und alle Findings gegen den realen Git-/SQL-Stand revalidieren.
2. Scope-Freeze bestätigen; offene Grundsatzfragen müssen `none` sein.
3. Für S4.1-S4.5 Inputs, Outputs, Consumer, Failure Modes, Tests,
   Invalidierung und Rollback festlegen.
4. SQL-24-Preconditions, disposable Fixture und Produkt-Preflight als eigene
   Evidence-Grenzen prüfen.
5. Sicherstellen, dass S4 keine produktive SQL-Ausführung enthält.
6. Sicherstellen, dass S5 alle finalen Tests und Reviews vor Produkt-SQL
   ausführt.
7. Sichere Ausführungsblöcke empfehlen. Erwarteter Schnitt:
   - Block A: S4.1 allein;
   - Block B: S4.2 allein wegen SQL-/ACL-Risiko;
   - Block C: S4.3 bis S4.5 gemeinsam, falls S4.2-Vertrag unverändert bleibt.
8. Evidence, Findings, Statusmatrix und Resume Card synchronisieren.

Readiness-Urteil:

- `GO`: keine offenen P0/P1-Findings, alle Testorakel und Owner-Gates
  vorhanden.
- `CONDITIONAL GO`: nur klar benannte nicht blockierende Watchlists.
- `NO-GO`: offener Daten-, Security-, Scope- oder Produktvertrag.

Exit-Kriterium:

- S4R endet mit Urteil und Blockempfehlung.
- Danach STOP. S4 beginnt nur nach separatem Owner-Auftrag.

### S4R Gate Record - 2026-08-13

Readiness-Urteil: `CONDITIONAL GO`.

Begründung: Alle Inputs, Outputs, Consumer, Failure Modes, Tests,
Invalidierungen, Rollbacks und Owner-Gates sind vollständig. Es gibt keine
offenen P0/P1-Findings und keinen fachlichen Ownerentscheid. Zum S4R-Gate
waren F-ACT-R10-23 bis -25 die zugewiesenen P2-Watchlists. Nach S4.2 sind
F-ACT-R10-24/-25 geschlossen; aktuell bleiben nur F-ACT-R10-23 und die
S4.5-Invalidierungswatchlist F-ACT-R10-31, beide nicht blockierend.
Der Scope-Freeze ist bestätigt; offene Grundsatzfragen: `none`. S4 enthält
keine produktive SQL-Ausführung, S5 führt alle finalen Reviews vor seinem
separaten Produkt-SQL-Gate aus.

<!-- markdownlint-disable MD013 -->

| Paket | Inputs | Outputs / Consumer | Failure Modes / Prevention | Tests / Evidence | Invalidiert durch | Rollback |
| --- | --- | --- | --- | --- | --- | --- |
| S4.1 | eingefrorener Export-/Range-/Clientvertrag, R1/C2-Enums | pures `coachingExport`-Modul; Consumer S4.3/S4.4 | Key-/Typ-/Range-/Sorting-/Countdrift; fail-closed ohne I/O | T-ACT-R10-01..04 / EV-ACT-R10-L01 | Schema-, Enum-, Units-, Range-, Sorting- oder Namespaceänderung | neue isolierte Dateien entfernen; keine Datenwirkung |
| S4.2 | SQL-23-Postimage, D-ACT-R10-24..27, S4.1-Schema | SQL 24, exakter Rollback, Fixture, SQL-16-Spiegel; Consumer S4.3/S5 | Overload-/Source-/ACL-/RLS-/Catalogdrift, BOLA, Snapshotmix, Caplast; Guard plus disposable Race/Limit | T-ACT-R10-06..11 / EV-ACT-R10-L02..L07 | SQL 20-24, Catalog, RLS/ACL/FKs, Caps, Error- oder Snapshotvertrag | nur exakt erkannte Exportfunction entfernen; kein automatischer Produktrollback |
| S4.3 | S4.1-Validator und unveränderte HTTP-/Auth-Bridge | `loadCoachingExport`; Consumer S4.4 | N+1, Bodydrift, Rohfehler, unvalidierter Success; single logical RPC plus strict validator | T-ACT-R10-05 / EV-ACT-R10-L08 | Data Access, Auth bridge, Errorcodes, Validator oder RPC-Signatur | additive API-Methode/Tokenmapping entfernen |
| S4.4 | S4.1-Presets/Validator, S4.3-Adapter | isolierter Controller/Harness/Download; kein Produktconsumer | vorzeitiger Download, Blob-Leak, stale Response, A11y/Viewportfehler; State-/Generationguards | T-ACT-R10-12 / EV-ACT-R10-L09 | Controller, DOM/CSS, Presets, Download-/Focus-/Harnessvertrag | isolierte Harness-/Controllerdateien entfernen |
| S4.5 | S4.1-S4.4, geschützte Produktpfade, SQL-16/HOW-TO | Isolation-/Schema-Paritäts-/Consumerorakel und Provisioningdoku; Consumer S5 | Produktkopplung, V1/Doctor/Health/SW-Delta, Schema- oder Grantdrift | T-ACT-R10-13/-14 / EV-ACT-R10-L10/-L11 | jeder geschützte Pfad, Exportkey/Enum, Grants, HOW-TO oder Consumerfrage | Test-/Doku-Delta zurücknehmen; Produktpfade bleiben unverändert |

<!-- markdownlint-enable MD013 -->

Empfohlener, tokenökonomischer Schnitt:

1. Block A: S4.1 allein; pure Contractbasis zuerst stabilisieren; `PASS`.
2. Block B: S4.2 allein; SQL-/ACL-/Race-/Cap-Risiko mit eigenem Review- und
   Fixturekontext halten und F-ACT-R10-25 schließen; `PASS`.
3. Block C: S4.3 bis S4.5 gemeinsam als nächster erlaubter Block; denselben Data-Access-/Harness-Kontext
   und einen gebündelten Delta-/Consumer-Review verwenden. Nur trennen, wenn
   Block B den eingefrorenen Schema- oder Errorvertrag ändert.

Owner-Gate: Der nächste Block beginnt ausschließlich nach einem neuen
expliziten S4-Auftrag. S4 enthält weiterhin keine produktive SQL-Ausführung.
S5 besitzt ein separates Produkt-SQL-Gate.

## S4 - Umsetzung

Allgemeiner Vertrag:

- S4 baut; CodeRabbit und finaler Full Review bleiben S5.
- Pro Substep nur Delta-/Consumer-Review und direkt invalidierte Tests.
- Keine produktive SQL-Ausführung.
- Nach jedem Block Ergebnis, Findings, Evidence, Statusmatrix und Resume Card
  aktualisieren.

### S4.1 - Pure V1-Schema-, Range- und Validatorbasis

1. Neues isoliertes Modul
   `app/modules/vitals-stack/activity/v2/activity-coaching-export.js`
   anlegen.
2. Exakte Keysets, Enums, Units, Counts, Cautions, Sortierung und Nullbarkeit
   als pure, fail-closed Validatoren umsetzen.
3. Vienna-Presethelper für drei/sechs Monate und Custom-Range mit injizierbarer
   Zeitbasis umsetzen.
4. Downloadname deterministisch aus validiertem Range ableiten.
5. Keine Supabase-, DOM-, Storage- oder Produktload-Abhängigkeit einführen.
6. Pure Contracttests für gültige und ungültige Exportobjekte,
   Monats-Clamping und Zeitzonengrenzen ergänzen.

Exit-Kriterium:

- Pure Tests PASS; unbekannte/fehlende Keys, falsche Counts/Units/Sorting und
  ungültige Ranges werden abgelehnt.

#### S4.1 Gate Record - 2026-08-22

Urteil: `PASS`; verbindlicher STOP vor S4.2.

- Implementiert wurden ausschließlich das pure klassische Script
  `activity-coaching-export.js` und sein Contracttest. Die immutable API
  besitzt exakt `validateExport`, `validateRange`, `createPresetRange` und
  `buildDownloadName`.
- Der Validator klont und friert den akzeptierten Export tief ein, lehnt
  unbekannte, fehlende, accessor-basierte oder sparse Strukturen fail-closed ab
  und prüft Keysets, Enums, Units, Nullbarkeit, Field Policies, Counts, Caps,
  Cautions, Identitäten und alle deterministischen Arrayreihenfolgen.
- Vienna-Presets verwenden eine injizierte Epoch-Millisekunden-Zeitbasis,
  ziehen exakt drei oder sechs lokale Kalendermonate ab und klemmen Monatsende
  sowie Schaltjahr deterministisch. Der Dateiname folgt exakt dem V1-Vertrag.
- Delta-/Contract-/Consumer-Review: F-ACT-R10-26 und der Evidence-Sync
  F-ACT-R10-27 waren berechtigt und wurden vor dem Gate korrigiert. S4.3 kann
  den tief eingefrorenen Validierungsclone und S4.4 dieselbe Range-/Preset-/
  Filename-API ohne I/O oder Produktkopplung konsumieren. Weitere berechtigte
  Findings: `none`.
- Direkt invalidierte Nachweise: T-ACT-R10-01 bis -04 gezielt `14/14 PASS`;
  alle Activity-V2-Contracts `222/222 PASS`; Syntax, Katalog und Isolation
  `PASS`, produktive V2-Loads weiterhin `0`.
- Keine Supabase-, Netzwerk-, DOM-, Storage-, Productload-, Activity-V1-,
  Doctor-, Health-Export-, SQL-, Produktdaten- oder Deploywirkung. SQL 24
  bleibt absent; S4.2 benötigt einen neuen expliziten Owner-Auftrag.

### S4.2 - SQL 24, Rollback, ACL und disposable Fixture

1. `sql/24_Activity_V2_Coaching_Export.sql` als rerun-sichere additive Source
   anlegen.
2. `public.activity_v2_coaching_export(date,date) returns jsonb` mit
   `STABLE SECURITY INVOKER`, leerem `search_path` und explizitem Authcheck
   sowie den vier eingefrorenen SQL-Fehlertokens implementieren; fremde
   Overloads und nicht kanonische Rerun-Preimages fail-closed ablehnen.
3. Range validieren, dann jede Leseoperation aus den drei user-eigenen
   Session-/Item-/Settabellen explizit auf `user_id = auth.uid()` begrenzen.
   Count-Guards und spätere Aggregation dürfen getrennte `SELECT`s sein, weil
   die `STABLE`-Function für alle denselben Calling-Query-Snapshot verwendet.
   Der globale Katalogjoin besitzt keine `user_id`. Oberhalb eines Caps keine
   Payloadaggregation ausführen, sondern explizit abbrechen.
4. Historische Items auf exakt `(catalog_version,item_key)` abbilden und jede
   unerwartete Semantiklücke, gemischte Sessionversion, Item-/Set-Orderlücke
   oder Mode-/Set-Abweichung fail-closed behandeln.
5. JSON mit finalem V1-Keyset und deterministisch sortierten Arrays
   aggregieren. Die Reihenfolge von JSON-Objektschlüsseln ist kein Vertrag.
6. `generated_at` aus `statement_timestamp()` desselben RPC-Aufrufs ableiten
   und kanonisch in UTC ausgeben.
7. Function-Owner/ACL exakt setzen: `PUBLIC`, `anon` und `service_role`
   Rollen ohne Execute; nur `authenticated` erhält Execute, `postgres`
   bleibt Owner. Genau ein Overload und die exakte Source-/Proconfig-/ACL-
   Postcondition werden innerhalb des Forward-SQL geprüft.
8. `sql/24_Activity_V2_Coaching_Export_Rollback.sql` erstellen. Es entfernt
   nur die exakt erkannte Function/ACL und keine Sessiondaten; ein zweiter
   Rollback oder Source-/ACL-Drift wird abgelehnt.
9. `sql/tests/24_Activity_V2_Coaching_Export_fixture.sql` mit realistischen
   v1/v2-, Strength-, Duration-, Distance-, Mixed-, Corrected-, Deleted-,
   Empty-, Cap-, Race-, Auth-/RLS- und Rerun-Fällen erstellen.
10. `sql/16_Explicit_Grants.sql` als kanonischen Provisioning-Spiegel
   aktualisieren.
11. Fresh, Rerun, Drift, Rollback, Forward-after-Rollback und PostgreSQL-17-
    Fixture disposable beweisen; am und oberhalb jedes Caps Laufzeit und
    Abbruch vor Payloadaggregation unter dem realen produktiven
    `authenticated statement_timeout=8s` bewerten. Eine Timeoutänderung
    erfordert Finding, Scopeprüfung und Ownerentscheidung.

Exit-Kriterium:

- SQL/Fixture/ACL/Rollback PASS; keine Produktverbindung und keine
  produktive Wirkung.

#### S4.2 Gate Record - 2026-08-22

Urteil: `PASS`; verbindlicher STOP vor S4.3.

- Implementiert sind die additive SQL-24-Source, der exakt begrenzte
  Rollback, der optionale SQL-16-R10-Grantspiegel, die HOW-TO-Reihenfolge und
  der guarded PostgreSQL-17-Fixture. Functionvertrag und SHA-256 sind exakt
  `public.activity_v2_coaching_export(date,date) returns jsonb`, Owner
  `postgres`, `STABLE`, `SECURITY INVOKER`, `search_path=''`, Execute nur für
  `authenticated`, Functiondef-Hash
  `ef3b00b9e674fa379d0e190c8c8b9866d14d4994f488e4b1279c66d174c22376`.
- T-ACT-R10-06 bis -11 und EV-ACT-R10-L02 bis -L07 sind `PASS`: Fresh,
  Rerun, Overload-/Source-/Function-ACL-/Table-ACL-Drift, v1/v2, Strength,
  Duration, Distance, Mixed, Corrected, Deleted, Empty, Auth/RLS/BOLA,
  Range, Originalkatalog-/Order-/Mode-/Setdrift, Correction-/Delete-Race,
  exakter Rollback, zweiter Rollback und Forward-after-Rollback.
- Die exakte Caplast `1000/10000/50000` erzeugte 13.666.612 Bytes und lief
  im letzten vollständigen Fixturelauf in 1,453 Sekunden unter dem realen
  `authenticated statement_timeout=8s`. Jede einzelne Überschreitung brach
  mit `MIDAS_ACTIVITY_EXPORT_LIMIT_EXCEEDED` vor Payloadaggregation ab;
  F-ACT-R10-25 ist geschlossen und keine Timeoutänderung nötig.
- Der reale SQL24-Output wurde ohne Datei-/Produktkopplung durch den
  S4.1-Validator akzeptiert. Finaler disposable Datenstand `0/0/0`; Function-
  Owner/Volatilität/Security/Proconfig/ACL und Functionhash exakt bestätigt.
- Delta-/SQL-/Security-/Consumer-Review: F-ACT-R10-28 bis -30 waren
  berechtigt und wurden korrigiert; F-ACT-R10-29 ergänzte insbesondere den
  vollständigen R8/R9-Dependency- und Tabellen-ACL-Guard. Weitere offene
  P0/P1-/Security-/Datenintegritätsfindings: `none`.
- Direkt invalidierte Checks: S4.1 gezielt `14/14 PASS`; Gesamtmatrix
  `221/222 PASS`. Ausschließlich das alte, bytegenau auf den R9-SQL-16-Stand
  gepinnte Isolationorakel ist durch den verpflichtenden R10-Grantspiegel
  erwartbar rot. F-ACT-R10-31 weist die fachliche Aktualisierung S4.5 zu; sie
  wird nicht scopewidrig vorgezogen.
- Source-SHA-256: SQL 24
  `fad0af25e471553a7d1f7263e502d0e5a58423560fc655753a7630f5ba3bd1b6`,
  Rollback
  `ce4d5d2dbc4634eaa5c056434fb54f9a6b6eb1eea7f8665dbed77c290db1d9d7`,
  Fixture
  `3a79ca0fb5c3a83a64ddef5e424931f9e120e7770ecbcdf7d3c80f7423559877`,
  SQL 16
  `8f6882c6f3945d86ad1e3455391009e3a91a4f286672b54dec747bb1a950ff4c`.
- Keine Produktverbindung, kein produktives SQL, keine Produktdaten, kein
  Browser-/CodeRabbitlauf und kein Web-/Edge-/APK-/Device-Deploy. Produktiv
  bleibt der zuletzt read-only belegte Stand SQL 23 installiert, SQL 24
  absent, Activity-V2-Zähler `0/0/0`.

### S4.3 - Data-Access-Adapter und sichere Fehlergrenze

1. Activity-V2-Data-Access additiv um einen einzigen Exportaufruf erweitern.
2. Requestrange vor RPC-Aufruf strikt validieren.
3. RPC-Antwort ausschließlich durch den S4.1-Validator akzeptieren und tief
   einfrieren.
4. Sichere, endnutzergeeignete Fehlercodes für Auth, Range, Cap,
   Contractverletzung und Requestfehler ableiten; rohe SQL-/PostgREST-Details
   nicht an UI oder Download leaken.
5. `read-only`, Retry- und Unknown-Outcome-Vertrag dokumentieren: Ein
   fehlgeschlagener Export kann wiederholt werden und besitzt keinen
   Commit-/Mutation-State.
6. Data-Access-Contracttests für Request, Response, Fehler und genau einen
   RPC-Aufruf ergänzen.

Exit-Kriterium:

- Adaptertests PASS; kein N+1, keine DML und kein unvalidiertes Objekt verlässt
  die Data-Access-Grenze.

#### S4.3 Gate Record - 2026-08-22

Urteil: `PASS`; Owner-Block umfasst S4.3-S4.5, Fortsetzung mit S4.4.

- `dataAccess` ergänzt additiv exakt `loadCoachingExport({ from, to })` und
  bewahrt Activity V1 sowie alle R8/R9-Methoden. Exact own data keys und die
  366-Tage-Grenze werden vor I/O geprüft.
- Pro Aufruf erfolgt genau ein logischer POST auf
  `activity_v2_coaching_export` mit `{ p_from, p_to }`; ein Auth-Refresh darf
  nur denselben URL/Body innerhalb `maxAttempts: 2` wiederholen.
- Nur der S4.1-Validatorclone verlässt die Grenze. Auth, Range, Cap, Snapshot,
  malformed Success/Contract und Transport werden auf sichere Codes ohne SQL-/
  PostgREST-Body gemappt; Exportfehler besitzen weder Commit- noch Mutationstate.
- T-ACT-R10-05 mit fünf Adapterfällen sowie der direkt invalidierte gesamte
  Data-Access-Contract bestanden. F-ACT-R10-34 wurde im Delta-Review gefunden,
  korrigiert und durch Accessor-/Hidden-Key-Negativtests revalidiert.
- Source-SHA-256: `data-access.js`
  `35f878c1a2d33c9cea64c330662dd4ad07129a9c61b6bce4f2e692cbd784d8ac`;
  Export-Adaptertest
  `f1abc003570b4574413df60de3f3c7bcd1a99575138bdd687e10a0b105300703`.

### S4.4 - Isolierter Exportcontroller und Download-Harness

1. Isolierten Controller für Presets, Custom-Range, Loading, Empty, Error,
   Retry und Download umsetzen.
2. Sechs Monate als Default, drei Monate und Custom als explizite Auswahl
   bereitstellen.
3. Download erst nach vollständiger Validierung aktivieren; Blob/URL nach
   Verwendung sicher freigeben.
4. Isolierten Harness mit Fakeadapter und optional realem lokalen Adapter
   bereitstellen, ohne produktive `index.html` zu ändern.
5. Funktionale Browser-Smokes für Desktop, 390x844 und 320x800 bündeln;
   Fokus, Tastatur, Touchziele und kein horizontaler Overflow prüfen.
6. Keine Marketing-/Coachingcopy und keine medizinische Bewertung anzeigen.

Exit-Kriterium:

- Presets, Custom, Empty, Error, Retry und Download funktionieren im
  isolierten Harness; JSON ist byteweise parsebar und vertragstreu.

#### S4.4 Gate Record - 2026-08-22

Urteil: `PASS`; Owner-Block umfasst S4.3-S4.5, Fortsetzung mit S4.5.

- Controllerzustände `idle/loading/ready/empty/error`, Default sechs Monate,
  drei Monate, Custom, retrybare Requestfehler und Generationguard gegen stale
  Responses sind isoliert umgesetzt. Download entsteht erst nach erneuter
  Vollvalidierung, ist parsebares UTF-8-JSON und wird bei Nutzung, Rangewechsel
  oder Destroy revoket.
- Der Fakeadapter-Harness lädt nur seine realistische Fixture; keine produktive
  `index.html`, Navigation oder Service-Worker-Datei wurde geändert. F-ACT-
  R10-35 korrigierte die Rangefilter-/Count-/Caution-Ableitung für beliebige
  Custom-Ranges.
- Controllercontracts `5/5 PASS`. Browser Desktop, 390x844 und 320x800
  `3/3 PASS`: Default/3/Custom, Empty, Error/Retry, Download, Fokus, Tastatur,
  Touchziele >=44px, kein horizontaler Overflow und keine Console/Page Errors.
- Der In-App-Browser scheiterte toolingseitig am fehlenden trusted Node-REPL-
  Service (F-ACT-R10-32). Der erlaubte lokale Edge/Playwright-1.55-Fallback
  wurde verwendet. F-ACT-R10-33 (Favicon-404) wurde korrigiert und die gesamte
  Matrix wiederholt.
- Source-SHA-256: Controller
  `8c8d3690acc0a2c55c186c617ffc527aeb943bfb5f8bb1baab2326b282f191a0`,
  Harness-JS `e5d2864a2aae2c9fac9d1ed8268e85c934494dd66e020c67e2641384a3b93e33`,
  Fixture `6e30bd6a8baa9777ee4528f2e2cfde91c8730d48039f2a3d5db0b870fa386550`.

### S4.5 - Isolation, Negativorakel und Provisioning-Spiegel

1. Isolationstest aktualisieren: neue R10-Module sind nicht produktiv geladen
   und nicht aus Activity V1 erreichbar.
2. Negative Orakel für Doctor View, Health Export, Protein Target,
   Trendpilot, Service Worker und `index.html` ergänzen beziehungsweise
   bestehende Hash-/Diff-Nachweise verwenden.
3. Client-/SQL-Schemaabgleich automatisiert prüfen; Feld- oder Enumdrift muss
   den Test brechen.
4. Consumer-Akzeptanzfragen mit Fixture-JSON deterministisch beantworten,
   ohne OpenAI-/LLM-API aufzurufen.
5. `sql/HOW_TO.md` für Source-Reihenfolge, lokalen Test, produktives
   Owner-Gate und Rollback aktualisieren.
6. Delta-/Consumer-Review des finalen S4-Diffs ausführen und nur direkt
   invalidierte Checks wiederholen; kein CodeRabbit.

Exit-Kriterium:

- Isolation und Negativorakel PASS; R10 ist S5-bereit und weiterhin nicht
  produktiv sichtbar.

#### S4.5 Gate Record - 2026-08-22

Urteil: `PASS`; R10 ist S5-ready; verbindlicher STOP vor S5.

- Das historische Isolationstool pinnt nun den geprüften R10-SQL-16-Hash und
  schützt zusätzlich Doctor Stack, Reports/Health-API, Protein Target,
  Trendpilot, produktiven Service Worker und `index.html`. F-ACT-R10-31 ist
  geschlossen; Isolation meldet `product_v2_loads=0`, sechs R10-Negativorakel
  und `PASS`.
- T-ACT-R10-13 prüft SQL-/Client-Keysets von Top/Range/Units/Completeness/
  Quality/Session/Item/Set exakt und beweist, dass alle realen R1/C2-Katalog-
  Enums im eingefrorenen Clientvokabular liegen. Field- oder Enumdrift bricht.
- T-ACT-R10-14 validiert die realistische Fixture und beantwortet deterministisch
  Session-/Item-/Setzahlen, Katalogversionen, Dauer/Distanz, device-relative/
  Assistance-Cautions und korrigierte Revisionen ohne LLM/API.
- `sql/HOW_TO.md` dokumentiert Client-Source-Reihenfolge, lokale Node-/Browser-
  Gates, Produktloadverbot, produktives Einzel-Gate und Rollbackgrenze.
- Finaler direkt invalidierter Lauf `48/48 PASS`, Finalcontracts `5/5`,
  Isolation `PASS`, Browser nach letzter Harnesskorrektur `3/3`, Syntax/JSON/
  `git diff --check` PASS. Kein CodeRabbit, Produkt-SQL oder Deploy wurde
  vorgezogen; keine offenen P0/P1-/Security-/Datenintegritätsfindings.
- Source-SHA-256: Finalcontract
  `1142ccaeee18dd0d4eab18fc262b8c3756d5ebccb529f97649bdef9b5797cd21`,
  Isolationtool
  `dd3ad6a3850ed57624ed85812ec8cd8c02015da8137ca14fa06f65efb0bc45f7`,
  HOW-TO `2f725b7412c393c08faa7d3f81ec32dd7adb10daf0aff54ee0ac2648aacf4660`.

## S5 - Tests, Runtime-Gates und Abschlussreview

Reihenfolge gemäß Workflow-Vertrag:

1. Finalen Gesamtdiff und Source-Hashes einfrieren; fremde Änderungen
   ausgrenzen.
2. Alle Activity-V2-Node-/Contract-/Isolationstests ausführen.
3. SQL-24-Fresh-/Rerun-/Drift-/Rollback-/Forward-, ACL-, Auth/RLS-, Range-,
   Cap-, Snapshot-/Race- und Datenfixturematrix auf disposable PostgreSQL 17
   ausführen.
4. Client-/SQL-V1-Schema, Counts, Units, deterministische Array-Sortierung
   und All-or-Error automatisiert abgleichen. Semantische Gleichheitschecks
   ignorieren ausschließlich `generated_at` und die Reihenfolge von
   JSON-Objektschlüsseln.
5. Browser-Harnessmatrix für Default sechs Monate, drei Monate, Custom,
   Empty, Error, Retry und Download gebündelt ausführen.
6. Coaching-Consumer-Akzeptanzfragen gegen realistische Fixture-Datei
   nachweisen; kein LLM/API-Call.
7. Native Full Code-/Contract-/Security-Review des finalen Diffs ausführen.
8. Genau einen initialen CodeRabbit-Lauf ausführen. Alle Findings sammeln,
   einzeln bewerten und nicht blind korrigieren.
9. Berechtigte Findings gebündelt korrigieren; alle dadurch invalidierten
   Tests wiederholen.
10. Genau einen geplanten CodeRabbit-Verifikationslauf ausführen. Weitere
    Läufe nur bei neuem P0/P1-/Security-/Datenintegritätsrisiko oder
    explizitem Owner-Auftrag.
11. Produktiven read-only Preflight dokumentieren:
    - Function/ACL vor SQL 24;
    - relevante Tabellen/RLS/Owner;
    - V2 Session-/Item-/Set-Zähler;
    - keine vollständigen Gesundheitsdaten in Evidence.
12. Owner Briefing geben: exakte DDL-Wirkung, kein Sessionwrite, Rollback,
    erwartete leere/nichtleere Produktantwort und geschützte Objekte.
13. STOP und explizite Owner-Freigabe für produktives SQL 24 einholen.
14. Nach Freigabe ausschließlich SQL 24 produktiv ausführen; keine Fixture-
    oder Session-DML.
15. Read-only Postcheck:
    - Function existiert mit exakter Signatur, Owner und Proconfig;
    - Execute nur wie freigegeben;
    - `anon`/fehlender Auth wird abgelehnt;
    - angemeldeter User erhält validiertes komplettes oder leeres V1;
    - Session-/Item-/Set-Zähler unverändert;
    - Advisors ohne neue relevante Findings.
16. Bei Abweichung STOP, Finding und kontrollierte Rollbackentscheidung; kein
    automatischer Produkt-Retry-Loop.
17. Finalen Full Review, Evidence-Digest, Statusmatrix und Resume Card
    aktualisieren.

Geplante Test- und Evidence-IDs:

<!-- markdownlint-disable MD013 -->

| ID | Nachweis |
| --- | --- |
| T-ACT-R10-01 | Pure Export-V1-Keyset-/Typ-/Null-/Enumvalidierung |
| T-ACT-R10-02 | Vienna-Presets, Monatsende, Schaltjahr und 366-Tage-Grenze |
| T-ACT-R10-03 | Deterministische Session-/Item-/Set-/Caution-Sortierung |
| T-ACT-R10-04 | Strict Counts, Units, Completeness und No-Truncation |
| T-ACT-R10-05 | Dedicated Single-RPC-Data-Access und sichere Fehlergrenze |
| T-ACT-R10-06 | Strength-/Duration-/Distance-/Mixed-Exportfixture |
| T-ACT-R10-07 | Korrektur, Delete und mehrere Katalogversionen |
| T-ACT-R10-08 | Empty-, Future-, Invalid- und Cap-Grenzen |
| T-ACT-R10-09 | Auth/RLS/ACL und fremder-User-Negativnachweis |
| T-ACT-R10-10 | Ein-Snapshot-Race-/Consistency-Nachweis |
| T-ACT-R10-11 | Fresh/Rerun/Drift/Rollback/Forward SQL 24 |
| T-ACT-R10-12 | Isolierter Browser-Harness und Download |
| T-ACT-R10-13 | Produktload-/V1-/Doctor-/Health-Export-Negativorakel |
| T-ACT-R10-14 | Coaching-Consumer-Akzeptanzfragen ohne LLM |
| T-ACT-R10-15 | Native Full Review |
| T-ACT-R10-16 | Initialer CodeRabbit-Lauf und Findingbewertung |
| T-ACT-R10-17 | CodeRabbit-Verifikation nach gebündelter Korrektur |
| T-ACT-R10-18 | Produktiver Preflight, SQL-24-Wirkung und Postcheck |

<!-- markdownlint-enable MD013 -->

S5-Gate:

- `PASS`: alle Pflichtchecks grün, keine offenen P0/P1-Findings, Produkt-
  Postconditions exakt und keine Session-DML.
- `CONDITIONAL PASS`: nur ausdrücklich owner-akzeptierte, nicht die
  Vollständigkeit/Security/Isolation betreffende Evidence-Lücke.
- `FAIL`: unvollständiger Export, Datenleck, Security-/ACL-Abweichung,
  produktive Datenmutation oder unbekannte SQL-Wirkung.

### S5 Gate Record - 2026-08-22

Urteil: `PASS`; S5 vollständig abgeschlossen; verbindlicher STOP vor S6.

- Freeze: `main`/`5f01033e15abf59be782479ef90abb86b7b87d1e`; alle
  fremden Template-/R9-Archivdeltas blieben unberührt. Toolchain: Node 24.18.0,
  npm 11.18.0, Docker 29.7.2, Supabase CLI 2.109.1, Python 3.14.6.
- Finale QA: gesamte Activity-V2-Matrix `237/237 PASS`, fokussierte R10-
  Matrix `29/29 PASS`, Isolation `PASS` mit sechs Negativorakeln,
  Edge/Playwright-Fallback Desktop/390/320 erneut `3/3 PASS` und Consumer-/
  Schema-/Enum-/All-or-Error-Parität vollständig grün.
- Disposable PostgreSQL 17.6: vollständige Fresh/Rerun/Drift/Auth/RLS/BOLA/
  Range/Cap/Snapshot/Race/Rollback/Forward-Matrix `PASS`; Maximalexport exakt
  `1000/10000/50000`, 13.666.612 Bytes in 1,159023s unter 8s; final 0/0/0.
- Native Full Review `PASS`. CodeRabbit: initialer Lauf meldete nur ein
  fremdes Templatefinding und erfasste untracked R10-Dateien nicht; der
  vollständige Verifikationslauf bewertete fünf Findings, korrigierte drei
  berechtigte und verwarf zwei vertragswidrige Minors. Wegen neuer P1-
  Security-/Datenintegritätsfindings war ein Nachreview zulässig; dessen
  einziges P2-Evidencefinding wurde korrigiert. Keine offenen P0/P1.
- Frischer produktiver Preflight auf `M.I.D.A.S.`/`jlylmservssinsavlkdi`
  `PASS`: PostgreSQL 17.6, SQL 24 absent, vier RLS-Tabellen/-Policies,
  kanonische Dependencies/Kataloghashes, V2 0/0/0 und bekannte Advisorbaseline.
- Nach Owner-Briefing erteilte der Owner im aktuellen Auftrag die explizite
  Einzel-Freigabe. Ausgeführt wurde ausschließlich
  `sql/24_Activity_V2_Coaching_Export.sql` mit SHA-256
  `fad0af25e471553a7d1f7263e502d0e5a58423560fc655753a7630f5ba3bd1b6`;
  kein Retry, kein Rollback, keine Fixture-/Session-DML und kein Deploy.
- Produktpostcheck `PASS`: exakte `date,date -> jsonb`-Function, Owner
  `postgres`, `STABLE`, `SECURITY INVOKER`, `search_path=''`, Functionhash
  `ef3b00b9e674fa379d0e190c8c8b9866d14d4994f488e4b1279c66d174c22376`
  und Execute nur für `authenticated` plus Owner. Anon und fehlender Auth
  werden abgelehnt; ein angemeldeter User erhielt ein clientvalidiertes
  vollständiges Empty-V1. V2-Zähler und Tabellenhashes blieben unverändert;
  Advisors enthalten keine neue R10-Warnung.
- Restrisiken sind nur die nicht blockierenden Watchlists F-ACT-R10-23 und
  F-ACT-R10-32. Ein Rollback oder jede weitere Produktaktion erfordert eine
  neue explizite Owner-Freigabe.

## S6 - Doku-Sync und Abschluss

1. `docs/modules/Activity Module Overview.md` auf finalen isolierten
   Exportvertrag, Function, Security, Limits und R12-Grenze aktualisieren.
2. `docs/Future trainingsmodule update thoughts.md` auf den bewiesenen R10-
   Iststand und die unveränderte R11-/R12-/R13-Reihenfolge synchronisieren.
3. `docs/qa/health-capture-reports.md` um einen namespaceten R10-
   Export-/Security-/Isolation-/Consumer-Check ergänzen.
4. `sql/HOW_TO.md` und `sql/16_Explicit_Grants.sql` final gegen Produkt-
   Postimage prüfen.
5. Changelog-Relevanz entscheiden und begründen. Bei produktiv installierter
   read-only Exportfunktion ist ein technischer Eintrag erwartbar, obwohl die
   UI bis R12 verborgen bleibt.
6. Roadmap und Evidence auf identische Nachweise, Findings, Wirkung,
   Restrisiken und Rollbackstatus abgleichen.
7. Kurzes Owner-Recap in Nicht-Programmiersprache geben:
   - welche Trainingsdaten exportiert werden;
   - warum der Export vollständig oder gar nicht entsteht;
   - warum Health Report und späterer MCP getrennt bleiben.
8. Roadmapstatus `DONE`, Titel um `(DONE)` erweitern und Roadmap plus Evidence
   ohne aktive Doppelquelle nach `docs/archive/` verschieben.
9. Commit-Message empfehlen; Commit und Push bleiben Owner-Aufgabe.
10. Eine vollständige, copy-paste-fähige Denkraum-Übergabe aus diesem
    Ausführungs-Chat, der Roadmap und den tatsächlich durchgeführten Arbeiten
    erstellen. Sie muss Ziel, Entscheidungen, Implementierung, Tests,
    Produktwirkung, offene Watchlists, unveränderte Grenzen, Folge-Roadmaps
    und den nächsten sinnvollen Denkraum-Schritt ohne Rückgriff auf diesen
    Chat zusammenfassen.

Exit-Kriterium:

- Dokumentation entspricht dem realen Postimage.
- Roadmap und Evidence sind gemeinsam archiviert.
- Kein aktives R10-Arbeitsartefakt bleibt unter `docs/` zurück.
- Die Denkraum-Übergabe ist vollständig und direkt wiederverwendbar.
- R11 darf auf den bewiesenen Export-/Activity-V2-Iststand aufbauen, ohne das
  Vollschema in den Arztbericht zu kopieren.

### S6 Gate Record - 2026-08-22

Urteil: `PASS`; R10 ist `DONE` und wird gemeinsam mit seiner Evidence
archiviert.

- `docs/modules/Activity Module Overview.md` dokumentiert den produktiv
  installierten, aber weiterhin consumerlosen R10-Snapshot-RPC, Clientvertrag,
  Limits, Security, Produktwirkung und R11-/R12-Grenze.
- `docs/Future trainingsmodule update thoughts.md` setzt R10 auf `DONE`, R11
  auf `NEXT_ROLLING_WAVE_GATE` und hält den R10-Vollpayload von der späteren
  Doctor-/Report-Zusammenfassung getrennt.
- `HCR-028` ist der kanonische R10-QA-Vertrag für Vollständigkeit, Snapshot,
  Range, Caps, Auth/RLS/ACL, Isolation, Browser, Produktpostimage und
  Invalidierung.
- `sql/HOW_TO.md` enthält Source-Reihenfolge, produktiven SQL-24-Record,
  exakte Hashes, Rollbackgrenze und die Korrektur F-ACT-R10-47: auf einem
  kanonischen R9-Produktziel läuft nur SQL 24; SQL 16 ist kein nachträglicher
  R10-Pflichtlauf.
- Der Changelog-Eintrag unter `Unreleased / Added` ist erforderlich, weil eine
  neue produktive read-only Function/ACL bereitgestellt wurde. Er erzeugt
  weder Release-Cut noch Tag.
- Der S6-Read-only-Postcheck bestätigt erneut Functionhash
  `ef3b00b9e674fa379d0e190c8c8b9866d14d4994f488e4b1279c66d174c22376`,
  Owner `postgres`, `STABLE SECURITY INVOKER`, `search_path=''`, ACL nur Owner
  plus `authenticated` und Sessions/Items/Sets 0/0/0. F-ACT-R10-46 ist
  geschlossen; keine produktive Mutation erfolgte.
- Finale günstige Invalidationchecks: gesamte Activity-V2-Contractmatrix
  `237/237 PASS`, Isolation `PASS` mit `product_v2_loads=0` und sechs R10-
  Negativorakeln sowie `git diff --check PASS`.
- Roadmap, Evidence, Findings F-ACT-R10-01 bis -47, Produktwirkung,
  Rollbackstatus, Watchlists und Resume Card sind synchron. Keine offenen
  P0/P1-, Security-, Datenintegritäts- oder Scope-Blocker.
- Commit und Push wurden nicht ausgeführt. Der separate Doctor-CSS-Lintfix
  bleibt gemäß Maintenance-Fußnote ausdrücklich nach dem R10-Commit.

Commit-Empfehlung für den Owner:

```text
feat(activity-v2): add completed coaching export v1

- add guarded read-only snapshot RPC, rollback and PostgreSQL fixture
- add isolated export contract, data access, controller and download harness
- document productive SQL 24 postimage, HCR-028 and R10 completion
```

## Owner-Recap in Alltagssprache

1. MIDAS kann jetzt abgeschlossene Activity-V2-Trainings als vollständiges,
   maschinenlesbares JSON aus der Datenbank bereitstellen.
2. Enthalten sind die tatsächlich gespeicherten Sessions, Aktivitäten,
   Übungen, Sätze, Wiederholungen, Gewichte, Unterstützung, Dauer, Distanz,
   Notizen, Einheiten und historische Katalogbedeutung.
3. Der Export liest alles für den gewählten Zeitraum in einem konsistenten
   Datenbanksnapshot. Entweder ist das Ergebnis vollständig oder der Aufruf
   schlägt ausdrücklich fehl; eine stille Kürzung gibt es nicht.
4. Nur der angemeldete Owner darf exportieren. Die Function schreibt nichts
   und besitzt keine Berechtigung, fremde Daten zu umgehen.
5. Die Produktdatenbank enthält derzeit noch keine Activity-V2-Sessions;
   deshalb ist der reale Produkt-Smoke korrekt ein vollständiger leerer Export.
6. Es gibt noch keinen sichtbaren Downloadbutton. Client und Harness bleiben
   isoliert, bis R12 Activity V2 kontrolliert produktiv aktiviert.
7. Doctor View und Health Export wurden bewusst nicht erweitert. R11 erhält
   später nur eine ruhige Zusammenfassung; Satzdetails bleiben im separaten
   Coaching-Export.
8. Ein späterer MCP darf getrennte versionierte Exporte lesen und kombinieren,
   aber R10 enthält weder medizinische Daten noch Empfehlungen oder Imports.
9. Rollback, weiterer Produkt-SQL-Lauf, UI-Verdrahtung und Deploy benötigen
   neue ausdrückliche Freigaben.
10. Als nächstes wird im Denkraum die eigenständige R11-Roadmap aus diesem
    bewiesenen Abschlussstand erstellt.

## Denkraum-Übergabe nach R10

Der folgende Block ist als vollständige Übergabe in den MIDAS-Denkraum
gedacht und benötigt keinen Rückgriff auf diesen Ausführungs-Chat:

```text
MIDAS Activity V2 R10 „Completed Activity Coaching Export V1“ ist am
2026-08-22 vollständig DONE.

Ausgangslage und Chatverlauf:
- R1-R9 und C2 waren bereits abgeschlossen. Activity V1 blieb der sichtbare
  Produktpfad; Activity V2 blieb bis R12 isoliert.
- Dieser Ausführungs-Chat arbeitete zuerst S1-S4R autonom ab und stoppte am
  Readiness-Gate. Danach wurden auf separate Owner-Aufträge S4.1, S4.2,
  S4.3-S4.5, S5 und nun S6 deterministisch abgeschlossen.
- Die zwei gemeldeten doctor.css-Prefix-Order-Hinweise wurden bewusst nicht im
  R10-Scope geändert. Eine Maintenance-Fußnote reserviert den verhaltenslosen
  Lintfix erst nach R10-Commit und Archivierung.

Fachlicher Vertrag:
- R10 exportiert ausschließlich abgeschlossene Activity-V2-Ist-Daten des
  angemeldeten Owners. Jede persistierte V2-Session ist bereits ein R8/R9-
  Commit; es existiert keine erfundene Completion-Spalte.
- Schema: midas.activity-coaching-export.v1.
- Zeitraum: explizite inklusive Europe/Vienna-Tage; Presets drei/sechs
  Kalendermonate; maximal 366 Tage; keine Zukunft.
- Historische Bedeutung kommt aus der exakten gespeicherten Kombination
  catalog_version + item_key, niemals aus dem aktuell höchsten Katalog.
- Vollständig oder expliziter Fehler. Keine Pagination, stille Kürzung,
  Teilantwort oder N+1-Schleife über R9-History-RPCs.
- Harte Caps: 1000 Sessions, 10000 Items, 50000 Sets. Counts entstehen vor
  Payloadaggregation.
- Keine medizinischen Daten, Doctor-/Health-Integration, Empfehlungen, RPE,
  1RM, Zielwerte, MCP-Logik oder Importsemantik.

Implementierung:
- Reiner Clientvertrag activity-coaching-export.js mit exakten tief
  eingefrorenen Keysets, Typen, Enums, Units, Counts, Ranges, Presets,
  Sortierung, Validator und Filename.
- Data Access besitzt additiv genau loadCoachingExport({ from, to }) und ruft
  logisch genau einmal activity_v2_coaching_export auf. Range wird vor I/O
  validiert; Auth-Retry verwendet denselben Body; Success wird strikt geprüft.
- Isolierter Controller, Shell, CSS, Harness und committed realistisches
  Fixture beweisen Presets, Custom, Loading, Empty, Error, Retry, stale
  responses und parsebaren/revoketen JSON-Download. Kein Produktload.
- SQL 24 installiert genau
  public.activity_v2_coaching_export(date,date) returns jsonb als STABLE,
  SECURITY INVOKER, search_path='', Owner postgres. Ein Calling-Query-Snapshot
  liest ownergefilterte Sessions/Items/Sets und historische Katalogzeilen.
- SQL-24-Rollback entfernt ausschließlich die exakte Function und bleibt
  separat owner-gated. SQL 16 spiegelt den Grantvertrag für Full Builds und
  prüft Hash/Owner/Returntyp/Invoker/Stable/Search Path vor Grants.

Security und Datenwirkung:
- Execute liegt ausschließlich bei authenticated und postgres als Owner;
  PUBLIC, anon und service_role besitzen kein Execute.
- Fehlender Auth, anonymer User und fremder Owner liefern keine Daten.
- Produktiv wurde nach vollständigem Preflight und explizitem Einzel-Gate
  ausschließlich SQL 24 mit SHA-256
  fad0af25e471553a7d1f7263e502d0e5a58423560fc655753a7630f5ba3bd1b6
  einmal ausgeführt. Kein Retry, SQL 16, Rollback, Fixture, Sessionwrite oder
  Deploy.
- Functiondef-SHA-256 ist
  ef3b00b9e674fa379d0e190c8c8b9866d14d4994f488e4b1279c66d174c22376.
- Produktive Sessions/Items/Sets waren und blieben 0/0/0; vollständige
  Tabellenhashes blieben identisch. Ein angemeldeter Realuser erhielt ein
  clientvalidiertes vollständiges Empty-V1. Advisors erhielten keine neue
  R10-Warnung.

Nachweise:
- Finale Activity-V2-Contractmatrix 237/237 PASS; fokussierte R10-Matrix
  29/29 PASS; Isolation PASS mit product_v2_loads=0 und sechs R10-
  Negativorakeln.
- Browser-Harness über lokalen Microsoft Edge/Playwright-Fallback bei Desktop,
  390x844 und 320x800: 3/3 PASS. Der installierte In-App-Browser-Service war
  nicht verfügbar; dies ist Watchlist F-ACT-R10-32, kein Produktfehler.
- Disposable PostgreSQL 17.6: Fresh/Rerun/Drift/Auth/RLS/BOLA/Range/Empty/
  v1/v2/Modes/Correction/Delete/Cap/Snapshotrace/Rollback/Forward PASS.
  Maximalpayload 1000/10000/50000, 13.666.612 Bytes, 1,159023s unter dem realen
  authenticated statement_timeout=8s.
- Native Full Review und CodeRabbit abgeschlossen. Zwei berechtigte P1-
  Findings wurden geschlossen: SQL 16 prüft Source/Hardening vor Grants und
  SQL 24 lockt vor dem Preimageguard gegen TOCTOU. Keine offenen P0/P1.
- S6 bestätigte Functionhash, Owner, Invoker/Stable/Search Path, ACL und 0/0/0
  erneut read-only. Activity Overview, Masterplan, HCR-028, HOW-TO und
  CHANGELOG sind synchron.

Offene Watchlists und Grenzen:
- F-ACT-R10-23: bekannte R8/R9-Security-Advisorwarnungen plus deaktivierter
  Leaked-Password-Schutz bleiben beobachtet; R10 erzeugte keine neue Warnung.
- F-ACT-R10-32: In-App-Browser-Testservice nicht verfügbar; grüner lokaler
  Edge/Playwright-Fallback ist dokumentiert.
- Activity V1, index.html, Service Worker, Navigation, Doctor View, Health
  Export, Protein Target, Trendpilot und reale V2-Produktnutzung blieben
  unverändert. Kein Web-, Edge-, APK- oder Device-Deploy.
- Kein R10-Rollback oder weiterer Produkt-SQL-Lauf ohne neues Owner-Gate.

Dokumentation und nächster Schritt:
- Kanonische Abschlussquellen liegen als R10 Roadmap (DONE) und R10 Evidence
  (DONE) unter docs/archive/; HCR-028 ist der dauerhafte QA-Vertrag.
- docs/modules/Activity Module Overview.md und der Activity-V2-Masterplan
  dokumentieren R10 DONE und R11 als NEXT_ROLLING_WAVE_GATE.
- Nächster Denkraum-Schritt: eine neue R11 „Doctor View and Report
  Integration“-Roadmap aus dem realen R10-Postimage erstellen. R11 darf nur
  eine ruhige Activity-Zusammenfassung und einen bewiesenen V1/V2-
  Kompatibilitätsvertrag planen. Das vollständige R10-Satzschema bleibt aus
  Arztbericht und Health Export heraus. R12 bleibt allein für sichtbaren
  Activity-V2-Cutover, produktive Consumer und finalen Android-PWA-Smoke
  zuständig.
- Commit und Push des R10-Diffs bleiben Owner-Aufgabe. Erst nach diesem Commit
  darf die separate doctor.css-Prefix-Order-Fußnote abgearbeitet werden.
```

> **Maintenance-Fußnote nach S6:** Erst nach abgeschlossenem R10-Commit und
> archivierter R10-Evidence in `app/styles/doctor.css` an den derzeitigen
> Zeilen 371/372 und 416/417 jeweils `-webkit-line-clamp` vor das gleichwertige
> `line-clamp` stellen. Dies ist ein separater, verhaltensneutraler
> `css-prefix-order`-Lintfix außerhalb des R10-/Doctor-Scopes. Anschließend den
> CSS-Lint sowie Doctor View auf Desktop und Mobile kurz prüfen; während R10
> darf diese Änderung nicht das Doctor-Negativorakel invalidieren.

## Finales Akzeptanzbild

R10 ist fachlich erfolgreich, wenn Stephan eine sechsmonatige JSON-Datei
erzeugen kann, die einem neuen Chat oder einem späteren read-only MCP ohne
weitere Datenbankabfragen verlässlich zeigt:

1. welche abgeschlossenen Activity-V2-Sessions im Zeitraum stattfanden;
2. welche Übungen und Aktivitäten in welcher Reihenfolge ausgeführt wurden;
3. welche realen Sätze, Wiederholungen, Gewichte, Assistance-, Dauer- und
   Distanzwerte gespeichert sind;
4. welche historische Semantik und Einheiten für jeden Wert gelten;
5. welche Lasten nur geräte-relativ verglichen werden dürfen;
6. ob der Export vollständig, leer oder explizit fehlgeschlagen ist;
7. dass keine medizinischen Daten, Empfehlungen oder erfundenen Zielwerte im
   Activity-Export enthalten sind.
