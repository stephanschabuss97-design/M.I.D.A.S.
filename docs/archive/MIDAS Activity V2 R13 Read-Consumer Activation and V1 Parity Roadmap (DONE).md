# MIDAS Activity V2 R13 Read-Consumer Activation and V1 Parity Roadmap

Diese Roadmap aktiviert die in R11 und R12 isoliert vorbereiteten
Activity-Consumer. Sie ist bewusst kein Capture-Cutover: Activity V1 bleibt
bis R14 der einzige produktive Schreibpfad.

---

## Roadmap-Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Status | `DONE; S5.7/S5.8 produktiv PASS; S6 dokumentiert und archivbereit` |
| Modul / Bereich | `Activity V2 / Doctor View / Reports / Health Export / Protein Target / Trendpilot / Supabase Edge Auth` |
| Owner / Kontext | `Stephan; persönliche Single-User-Gesundheitsanwendung` |
| Chat-Lebenszyklus | `Denkraum -> eigener Ausführungs-Chat` |
| Erstellt am | `2026-08-23` |
| Letzter Stand | `2026-08-26; S5.7/S5.8 PASS. Commit A d121adad aktiviert SQL26, Monthly v61/true, Protein v31/false, Trend v32/false, F48-SELECT und getrennte Scheduler; Protein-Run 32962050543 und Trend-Run 32962149903 SUCCESS. Commit B 4aa97f92 aktiviert ausschließlich Web/PWA; Pages 32962301099 SUCCESS, SW v7 Fresh und v6→v7 Upgrade PASS. Neuer Arztbericht bis 26.08.2026 und Health-Export-V3-Pfad produktiv gesmokt. Final: V1 66/cfddb1fa, V2 0/0/0, Report 1/04619cae, Profil 1/e17f64da, Trend 2/976373b6 + 0/4f53cda1; 0 inflight, keine neue Advisor-P0/P1-Warnung.` |
| Aktueller Schritt | `S6 Abschluss: Doku-Sync, Evidence-Digest, Archiv und finaler Doku-Commit` |
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
| Evidence-Datei | `docs/archive/MIDAS Activity V2 R13 Read-Consumer Activation and V1 Parity Evidence (DONE).md` |
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

- Autoritativer Re-entry-Delta nach C33:
  - Commit A `f7ade43e` wurde gepusht. Protein-Run `32897430514` war
    erfolgreich und erzeugte nur die gültige Profilbaseline `e17f64da…`;
    Trend-Run `32897511236` scheiterte HTTP 401/No-write. Commit B blieb zu.
  - Vollständiger Reverse: Git `09622c0`, SQL25 `f7226f6a…`, SQL26-Core und
    Servicewrapper absent, F48-Grant revokt; Monthly v59/true, Protein
    v29/true und Trend v30/true ACTIVE/sourcegleich/Public 401; V1
    66/`cfddb1fa…`, V2 0/0/0, Trend unverändert, Profilbaseline erhalten,
    0 inflight.
  - Incidents-Runs `32902627552` und `32907728534` scheiterten auf `09622c0`
    gegen unveränderte Function v22/true jeweils 401. Die Fehlerfolge begann
    vor Commit A.
  - Am `2026-08-26` wurde der lokal vollständige und status-only aktive
    Legacy-Service-Role-Key geheim und idempotent an GitHub
    `SUPABASE_SERVICE_ROLE_KEY` gebunden. Run `32935444536` scheiterte erneut
    401; Push- und gelesene Quelldigests blieben hashgleich, 0 inflight.
  - Nächster erlaubter Schritt: serverseitigen Bindingvertrag der Incident-
    Function payloadfrei klären. Keine Rotation, Signing-Migration,
    Edgeänderung oder S5.7-Re-Forward ohne neuen Ownerentscheid.
  - Same-source-Nachweis `2026-08-26`: v22/true wurde mit exakt zwei
    sourcegleichen Dateien und unverändertem Flag als v23/true redeployt.
    v23 ist ACTIVE, Public 401 und sourcegleich; der Bundlehash ist nur
    diagnostisch. Der lokale Legacy-Key bleibt REST-status-only 200, erreicht
    im garantiert vor Datenzugriff abbrechenden Invalid-Mode-Smoke aber erneut
    401 statt erwarteter 400. Kein Workflow gestartet; Deliveries 16/
    `c238bdcb…` und Subscriptions 2/`0f207837…` unverändert, 0 inflight.
  - Control-Plane-Nachweis: Der im angemeldeten Supabase-Dashboard sichtbare
    Legacy-`service_role`-Key ist bytegleich zur lokalen ignorierten Env;
    GitHub wurde zuvor aus genau diesem lokalen Wert gesetzt. Ein direkter
    pre-data Request klassifiziert die 401 eindeutig als den eigenen
    Handler-`Unauthorized`-Pfad, nicht als Gateway-`Invalid JWT`. Ein Recopy
    kann den Fehler daher nicht schließen. Default-Secrets wurden nur nach
    Name/Updated-Metadatum geprüft; kein Wert oder Digest dokumentiert.
  - Neuer Ownerentscheid erforderlich: entweder projektweiten Default-Secret-
    Rebind mit Impact auf alle Edge Functions freigeben oder ein enges
    Incident-spezifisches Authdelta entwerfen. Bis dahin STOP.
  - F50-Entscheid und Abschluss: Owner gab den isolierten Alias
    `INCIDENTS_PUSH_LEGACY_KEY` frei. Der bestätigte Legacy-Key wurde ohne
    Ausgabe als Custom Secret gesetzt. Incident v27/true liest den Alias nur
    für den Callervergleich; sein interner DB-Client verwendet unverändert das
    eingebaute `SUPABASE_SERVICE_ROLE_KEY`. Missing/Public und gültiger anon
    liefern 401, der korrekte Alias erreicht den garantierten pre-data-400-
    Vertrag. Workflow `32938596519` auf `09622c0` ist SUCCESS.
  - Der erste Postcheck sah drei neue Slot-Events und drei Medication-Updates.
    Der vorsorgliche v23/true-Reverse wurde vollständig ausgeführt. Metadata-
    only beweist anschließend alle sechs Updates um `06:32:13Z`, der Workflow
    startete erst `06:32:27Z`; sie sind kein Workflowwrite und bleiben erhalten.
    Exakt dasselbe erfolgreiche Alias-Postimage wurde als v27/true erneut
    aktiviert und vollständig postgeprüft. Deliveries/Subscriptions blieben
    hashgleich, 0 inflight.
  - Persistierter Incident-Reverse: Das secretfreie normalisierte v23/true-
    Preimage liegt außerhalb des Repositories unter
    `C:\Users\steph\AppData\Local\Temp\midas-r13-f50-incident-v23-rollback-20260826`.
    `index.ts` hat SHA-256 `8239149c…`, `request-contract.ts` `4bd31df0…`
    und `config.toml` `d1d0a91d…`; das Manifest setzt `verify_jwt=true`
    explizit. Die Source-Dateien besitzen gegenüber dem bytegenauen Remote-
    Preimage nur einen zusätzlichen finalen Zeilenumbruch und erfüllen damit
    das akzeptierte normalisierte Source-/Flag-Orakel. Das Artefakt ist nicht
    Teil des Git-Worktrees und enthält keine Schlüsselwerte.

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
  - Am `2026-08-24` hat der Owner das dokumentierte GO für S4.1-S5.3 erteilt.
    Der kurze read-only Re-entry-Drift-Check ist `PASS`: der neue HEAD enthält
    nur den bereits dokumentierten R13-/Planungscommit; lokale R13-
    Runtimepfade sowie SQL25, Edge-Versionen/Flags, Datenzähler, Advisors,
    Scheduler und ihre Authgrenze sind unverändert.
  - Block A ist `PASS`: S4.1 liefert den gepinnten dualen Principal- und den
    requestlokalen Snapshot-Runtimevertrag; S4.2 liefert SQL26, exakten
    SQL25-Rollback, PG17-Fixture und SQL16-Sync. L01/L02 sowie die nativen
    Security-/SQL-/Consumerreviews sind grün; CodeRabbit-Läufe bleiben `0`.
  - Block B ist `PASS`: S4.3 aktiviert den read-only Doctor-/Health-V3-
    Productload samt Doctor-scoped CSS und SW v7; S4.4 verwendet im neuen
    Range-Bericht genau einen requestgebundenen User-RLS-SQL25-Snapshot vor
    jedem Reportwrite. L03/L04 und die nativen Consumer-/Privacy-/Lifecycle-
    Reviews sind grün; die reinen R11-Module bleiben fingerprintgleich.
  - Block C ist `PASS`: S4.5 verwendet für Protein genau einen 28-Tage-
    Snapshot, persistiert die unveränderte Formel als v1.3-Herleitung und
    besitzt einen authentifizierten No-write-Pfad; S4.6 verwendet genau einen
    maximal 400 Tage breiten Snapshot, konserviert Legacy-Activity-Payloads
    und schreibt erst nach allen Preconditions. L05/L06 und die nativen
    Medical-/Security-/Consumer-/Legacyreviews sind grün; beide R12-Adapter
    bleiben fingerprintgleich.
  - Block D ist `PASS`: S4.7 deklariert Monthly `true` und exakt Protein/Trend
    `false`, trennt beide Scheduler auf eigene `apikey`-Secrets mit harter
    HTTP-Fehlergrenze und schützt Legacy-/Final-Webzustand, R14, Secrets,
    produktive DML und die einzige SQL-Union durch L07. Cutovermatrix und die
    getrennten Commit-A/B-Pfadgruppen sind in der Evidence eingefroren.
  - S5.1 ist `PASS`: der finale S4-Diff besteht die relevante integrierte
    Node-Matrix 38/38, die Deno-Matrix 75/75 plus 6/6, Format/Lint/Check,
    das vollständige PG17-SQL25/26/16/Rollback-Fixture, Browser/PWA 5/5,
    TOML-/Workflow-/Scope-Isolation und `git diff --check`. Sechs bewusst durch
    R13 ersetzte R11-Preaktivierungsassertionen wurden gemäß Invalidation Map
    explizit ausgeroutet; ihre R13-Nachfolger sind grün. Die disposable
    Datenbank und der lokale Testserver wurden entfernt.
  - S5.2 ist `PASS`: nativer Full Review ohne neues P0/P1; CodeRabbit 0.7.5
    lief exakt einmal initial und einmal zur Verifikation. F30/F31 schließen
    kalenderungültige Protein-Tage und partielle Trend-Ranges. F32 synchronisiert
    die Resume Card. F33 ersetzt den von PostgreSQL 17 tatsächlich mit
    Exitcode 0 ignorierten `\quit 1`-Fixturezweig durch `assert_true`; das volle
    PG17-Fixture sowie nur die invalidierten Protein-/Trend-/Scopechecks sind
    erneut grün. Der Verifikationslauf deckte den exakten 29-Pfade-R13-Scope
    inklusive neuer Dateien und ohne Owner-Artefakte ab; Reviewbudget erschöpft.
  - S5.3 ist `PASS`: PRE01-PRE07 belegen ohne Mutation den unveränderten
    produktiven SQL25-/ACL-/Daten-/Edge-/Workflow-/Pages-/Advisor-Stand und
    alle finalen Source-/Rollback-/Fixturehashes. F35 ergänzte zunächst die
    vermeintlich fehlenden serverseitigen Ownerkonfigurationen; F38 korrigiert
    am S5.4-Gate den zugrunde liegenden PowerShell-Array-Parsefehler und belegt
    beide Namen als seit Januar vorbestehend. F36 korrigiert die interne V1-
    Hashprojektion. Keine produktive Aktion wurde ausgeführt.
  - S5.4 ist `PASS`: Der Owner hat die globale Modern-Key-Initialisierung und
    alle notwendigen Gate-A-Schritte ausdrücklich freigegeben. Die reale
    Bestätigungsmodalität korrigierte den vorläufigen UI-Preview aus F37: Sie
    legte exakt einen Publishable Key `default` und einen Secret Key `default`
    an; beide bleiben unreferenziert und dormant, Legacy `anon` und
    `service_role` bleiben aktiv. F39 korrigiert die zwei R13-Keynamen auf die
    von Supabase erzwungene Syntax `protein_targets_scheduler` und
    `trendpilot_scheduler`. Beide getrennten Secret Keys und die zugehörigen
    GitHub-Secrets sind vorhanden. Die seit Januar vorbestehenden Owner-Env-
    Namen wurden nur read-only bestätigt, nie gelesen oder überschrieben.
    Kein Workflow wurde durch Gate A ausgelöst; SQL, Edge, Git, Web/PWA und
    Devices blieben unverändert.
  - S5.5 ist `PASS`: Das gebündelte Owner-GO umfasst S5.5-S6 samt exakten
    Rollbacks. Der Re-Preflight klassifizierte höhere Edge-Versionsnummern bei
    bytegleichen PRE-Bundle-Hashes und unveränderten Flags als version-only
    Drift (F41). SQL26 wurde exakt einmal ausgeführt. User-/Service-/Corehash,
    Owner, Minimal-ACL, einzige Union, SQL25-Backcompat, V1 65/Hash, V2 0/0/0,
    Report-/Profil-/Trendhashes und Advisor-Watchlists sind exakt grün. Die
    ignorierte `.env.supabase.local` enthält nun zusätzlich nur die beiden
    Scheduler-Secretvariablen; Werte wurden nie ausgegeben.
  - S5.6 ist am ersten Einzelpostcheck gestoppt: Monthly wurde als v55/true
    deployt und der anonyme Negativpfad lieferte 401. Der verpflichtende
    positive User-JWT-/Report-Smoke erreichte korrekt die lokale App-Sperre;
    ohne PIN/Passkey wurde weder umgangen noch Sessionmaterial gelesen. Der
    freigegebene Reverse stellte das zuvor gesicherte Legacy-Sourcepreimage
    und `verify_jwt=true` bytegleich als v56/v57 wieder her. Der heutige
    Supabase-Bundler erzeugte dafür jedoch `cfd5dd51...0bbb` statt des
    historischen `914d5f8b...3182`; eine Aktivierung alter Versionen bietet
    Supabase nicht an. SQL26 wurde anschließend exakt auf SQL25
    `f7226f6a...b3c3d` zurückgerollt; ACL, V1 65/Hash, V2 0/0/0 und Advisors
    sind grün. Protein, Trendpilot, Workflows, Git und Web blieben unberührt.
  - S5.6-Re-entry ist für SQL26 und Monthly `PASS`: Der vorhandene sichtbare
    Produktionstab wurde ohne neuen Tab kontrolliert übernommen. SQL26 ist mit
    den erwarteten drei Hashes und Minimal-ACL erneut aktiv. Monthly v58/true
    enthält alle sieben lokalen Quellen bytegleich; anonymer 401 und positiver
    User-Report-Smoke sind grün. Der kontrollierte Write aktualisierte nur den
    bestehenden Range-Report-Singleton auf 1/5d5ec8b3; V1 66/cfddb1fa und
    V2 0/0/0 blieben unverändert.
  - Der Protein-Einzelcutover stoppte sicher: v23/false war mit sechs
    bytegleichen Quellen aktiv, Public 401 und der korrigierte Named-Secret-
    `dry_run` 200/No-write. Der sichtbare Userpfad kann Protein nur nach einem
    Body-Save auslösen; das unveränderte vollständig vorgefüllte Preimage vom
    11.08. traf bereits im Legacy-Body-Sync auf 409/Unique und erreichte den
    Edge nicht. Body, Profil, V1 und V2 blieben hashgleich. Protein wurde auf
    das bytegleiche Legacy-Sourcepreimage v24/true zurückgerollt; der neue
    Bundlehash 5254b32e ist nach dem akzeptierten Source-/Flag-Orakel nur
    diagnostisch. Trend, Workflow, Git und Web wurden nicht begonnen.
  - Re-entry nach dem sicheren Reverse: Der sichtbare Browserzustand enthält
    genau einen MIDAS-Produktionstab; ein zweiter Tab war weder vorhanden noch
    erforderlich. Protein ist erneut als v25/false ACTIVE, Public 401 und der
    Named-Secret-`dry_run` 200/No-write sind erneut grün. Der kontrollierte
    User-JWT-`dry_run` ist der einzige noch offene Proteinnachweis; es wurden
    weder JWT-/Sessionmaterial gelesen noch Fachdaten geschrieben.
  - Die ownerseitige Timelapse korrigiert die Reihenfolge: Der MIDAS-Dialog war
    vor dem DevTools-Aufruf nicht sichtbar. Der Protein-Edge lieferte zweimal
    401; erst danach blendete `fetchWithAuth` vertragsgemäß den Login ein.
    Der öffentliche Projekt-JWKS enthält null Keys. Der in R13 gepinnte
    `@supabase/server@1.4.1`-Usermodus verlangt dagegen einen JWKS-verifizierbaren
    JWT mit `alg` und `kid`; damit liegt ein neuer P1-Auth-Contractbruch vor.
    Protein wurde exakt auf das Legacy-Bundle v27/true/5254b32e reversiert.
  - F45-Forward ist für Protein produktiv `PASS`: v28/false enthält alle sechs
    lokalen Quellen normalisiert bytegleich; Public 401, das exakte
    `protein_targets_scheduler`-Secret und der echte Legacy-User-Bearer
    bestehen jeweils den `dry_run`. Die App gab ausschließlich
    `R13_F45_USER_SMOKE PASS` aus; weder JWT noch Payload wurden offengelegt.
    V1 66/cfddb1fa, Body 52/2b52f3b3, Profil 1/2d560902, Range-Report
    1/a77dd888 und V2 0/0/0 blieben unverändert. v27/true bleibt als exakter
    Source-/Flag-Reverse bereit.
  - Der anschließende Trendpilot-Forward ist vor dem Userpfad `PARTIAL PASS`:
    v26/false enthält sechs normalisiert bytegleiche Quellen, Public 401 und
    der exakte `trendpilot_scheduler`-dry-run liefern PASS/No-write. V1,
    Body, Profil, Trend-State 2/976373b6, Trend-Events 0/4f53cda1 und V2
    blieben unverändert; v25/true ist separat reversierbar. Der lokale
    ignorierte Trend-Key wurde ohne Wertausgabe vollständig synchronisiert.
  - Der echte Trendpilot-User-dry-run auf v26/false endet mit
    `R13_F45_TREND_USER_SMOKE FAIL_CONTRACT 500`. Das Continuation Gate wurde
    geschlossen und S5.7 nicht begonnen. Der erste Legacy-Source-Reverse als
    v27 behielt ohne explizite Gegenangabe providerseitig `verify_jwt=false`.
    Das temporäre Rollback-Manifest wurde deshalb ausschließlich für Trend auf
    `true` gepinnt und derselbe bytegleiche v25-Source als v28 erneut deployt.
  - Postcrash-Audit und Reverse sind `PASS`: v28 ACTIVE/true, Remoteindex
    `d16339af` exakt gleich v25-Preimage, Public 401; V1 66/cfddb1fa,
    Trend-State 2/976373b6, Trend-Events 0/4f53cda1 und V2 0/0/0 unverändert.
    Keine Zielworkflows inflight oder manuell gestartet; HEAD/origin/Pages
    weiterhin e3029629. F47 schließt den expliziten true-Rollbackvertrag.
  - F48 ist payloadfrei lokalisiert und minimal korrigiert: Protein und Trend
    teilen D32 erfolgreich, aber nur Trend liest im Dry-run den vorhandenen
    `trendpilot_state`. Der Tabelle fehlte `authenticated SELECT`, obwohl RLS
    und eine Own-row-SELECT-Policy aktiv waren. SQL16, sein PG17-Fixture und
    L07 schützen nun exakt User-SELECT bei weiterhin fehlendem User-DML.
    Produktiver Einzel-GRANT samt Fail-closed-Pre-/Postcheck ist PASS; V1,
    Trend-State, Trend-Events und V2 blieben hashgleich, Advisors unverändert.
  - Der erneute Trendpilot-Forward ist vollständig `PASS`: v29/false bleibt
    ACTIVE, Source/Public/Named sind grün und der ownerseitige echte
    Legacy-User-dry-run meldet ausschließlich
    `R13_F48_TREND_USER_SMOKE PASS 200`. Der unmittelbare geschützte
    No-write-Postcheck ist hashgleich; F45/F48 und S5.6 sind geschlossen.
- Aktueller Schritt:
  - `DONE / S6-Doku-Commit und Archivierung`
- Nächster erlaubter Schritt:
  - `C3 Training Product Surface and Protein Context Relocation`; danach darf
    allein R14 den Activity-V2-Capture- und Android-PWA-Cutover ausführen.
- Offene Findings:
  - `F-ACT-R13-13`: parallele R1-/C2-Archivmoves erhalten und in
    S1 korrekt vom R13-Diff abgrenzen; zwei dadurch gebrochene Altlinks sind
    als separate P2-Doku-Watchlist sichtbar und nicht Teil des R13-Codediffs.
  - `F-ACT-R13-37` (P1, fixed): globale Modern-Key-Initialisierung wurde
    ausdrücklich freigegeben; die reale Modalität erzeugte exakt das dormant
    gehaltene `default`-Publishable/-Secret-Paar, nicht das vorläufig erwartete
    Dreierset.
  - `F-ACT-R13-38` (P1 Evidence, fixed): F35 beruhte auf einem PowerShell-
    Array-Parsefehler; beide Owner-Env-Namen sind vorbestehend. Gate A muss sie
    nur read-only verifizieren und darf sie nicht neu setzen.
  - `F-ACT-R13-39` (P1 Provider-Validation, fixed): Bindestriche sind für
    Supabase-Keynamen unzulässig; Code, Tests und Vertrag verwenden nun exakt
    `protein_targets_scheduler` und `trendpilot_scheduler`. Nur die
    invalidierten L01-/L05-/L06-/L07-Checks wurden erneut grün ausgeführt.
  - `F-ACT-R13-40` (P2 Evidence, fixed): die Findings-Tabelle ist nach dem
    S5.4-Full-Contract-Review wieder durchgehend sechsspaltig.
  - `F-ACT-R13-41` (P1 Runtime Drift, fixed): produktive Edge-Versionen sind
    höher als PRE03, aber Flags und alle drei Bundle-Hashes bytegleich; als
    version-only Drift ohne Contractwirkung klassifiziert und Baselines
    aktualisiert.
  - `F-ACT-R13-42` (P1 Rollback/Provider, accepted/fixed): Der positive Monthly-
    User-Smoke ist durch die lokale PIN-/Passkey-Sperre nicht autonom
    beweisbar. Der bytegleiche Legacy-Source-Reverse mit altem true-Flag
    erzeugt unter dem aktuellen Supabase-Bundler einen neuen Bundlehash;
    Supabase unterstützt keine Aktivierung einer historischen Version. Der
    Owner akzeptiert deshalb bytegleiches Sourcepreimage, ursprüngliches
    Auth-Flag und vollständige negative/positive Runtime-Smokes als
    maßgebliches Rollbackorakel. Der Re-entry bestand anschließend den
    sichtbaren positiven User-Report-Smoke auf v58/true.
  - `F-ACT-R13-43` (P1 Data Drift, accepted/fixed): Zwischen dem letzten bestätigten
    Postimage und dem erneuten S5.6-Re-entry kam genau ein neuer, formal
    kanonischer Activity-V1-Datensatz hinzu. Keine Payload wurde gelesen oder
    dokumentiert. SQL26 wurde sofort auf SQL25 reversiert; der Owner bestätigt
    die Erfassung als beabsichtigten heutigen Gym-Eintrag über Activity V1.
    66/cfddb1fa ist damit die neue geschützte Forwardbaseline.
  - `F-ACT-R13-44` (P1 Secret/User-Smoke, partial): Die lokale Env-Erweiterung
    enthielt nur die maskierten Dashboard-Präfixe. Protein wurde vollständig
    und ohne Ausgabe in `.env.supabase.local` sowie GitHub neu gebunden;
    Named-Secret-dry-run ist 200. Trendpilot war lokal zunächst nur als
    Präfix vorhanden. Der positive Protein-User-
    Smoke fehlte zunächst wegen Legacy-Body-409. Der spätere direkte Dry-run
    erreichte den Edge; dessen 401 wird nun durch F45 erklärt. Der Trend-Key
    wurde am v26-Forward ohne Wertausgabe vollständig lokal synchronisiert.
  - `F-ACT-R13-45` (P1 Auth/Contract, production partial): Das
    Projekt behält nach ausdrücklichem D32-GO Legacy-Signing ohne öffentlichen
    JWKS-Key. User-Bearer werden nun autoritativ über Supabase Auth geprüft;
    Named Secrets bleiben im getrennten `@supabase/server@1.4.1`-Pfad. Die
    invalidierte lokale Matrix ist grün. Protein besteht den produktiven
    Public-/Named-/Legacy-User-Smoke vollständig. Trend besteht Public/Named;
    der echte Trend-User-dry-run endet jedoch mit HTTP 500. F48 lokalisiert
    diesen Fehler nach vollständig grünem Safe-Reverse.
  - `F-ACT-R13-47` (P1 Rollback, fixed): Supabase behielt beim ersten
    Source-Reverse v27 das vorherige false-Flag. Jeder false→true-Reverse pinnt
    deshalb das temporäre Functionmanifest explizit; v28/true, Sourcehash,
    ACTIVE, Public 401 und Datenpostimage sind grün.
  - `F-ACT-R13-48` (P1 Trend/User, fixed / production verification pending):
    fehlendes `authenticated SELECT` auf dem RLS-geschützten Trend-State war
    die exakte 500-Ursache. Minimaler SQL16-/ACL-Fix lokal und produktiv PASS;
    S5.7 bleibt bis zum erneut grünen echten Trend-User-dry-run zu.
  - F15-F21 sowie F36-F41 sind in den Zielartefakten beziehungsweise dem
    produktiven Gatevertrag geschlossen; F35 ist durch F38 ersetzt.
- Geänderte Dateien:
  - R13 Block A: vier neue Shared-Auth-/Runtime-Dateien, SQL26 samt Rollback
    und Fixture, `sql/16_Explicit_Grants.sql` sowie Roadmap/Evidence
  - R13 Block B: Doctor-Produktintegration, `app/app.css`, `index.html`,
    `service-worker.js`, vier neue R13-Product-/Browsertestartefakte, Monthly-
    Handler und neuer Handler-Integrationstest sowie Roadmap/Evidence
  - R13 Block C: Protein- und Trendpilot-Handler sowie je ein neuer Handler-
    Integrationstest und Roadmap/Evidence; die R12-Adapter sind unverändert
  - R13 Block D: `backend/supabase/config.toml`, beide Scheduler-YAMLs,
    erweitertes Isolation-Contracttest, neues R13-Isolationstool sowie
    Roadmap/Evidence-Cutoverartefakte
  - vorbestehender aktueller Owner-Diff: Activity-Masterplan sowie untracked
    C3-Roadmap und `assets/img/Personal_data_v3.png`; unverändert bewahren und
    nicht R13 zuschreiben
- Gültige Nachweise:
  - `HCR-029 (R11), HCR-030 (R12), EV-ACT-R13-L01-L09 und archivierte
    R11-/R12-Evidence`
- Context Receipt:
  - S1-S4R vollständig; Baseline, Dirty Boundary, Fingerprints,
    Remote-Runtime, Zielvertrag, Red-Team, Scope, Blöcke, Invalidation,
    Cutover/Rollback und Owner-Gates sind belegt
  - Session-Cut am `2026-08-23` sauber protokolliert; keine lokale oder
    produktive R13-Implementierung nach S4R
  - Re-entry am `2026-08-24`: Owner-GO und EV-ACT-R13-C02 PASS; kein
    relevanter Contract-/Runtimedrift
  - Block A am `2026-08-24`: EV-ACT-R13-L01/L02 PASS; Principal-/Runtime-
    Grenzen, SQL26-Hashes/ACL, Rollback auf SQL25 `f7226f6a...b3c3d`,
    geschützter R9-Helper und null Fachdaten-DML belegt
  - Block B am `2026-08-24`: EV-ACT-R13-L03/L04 PASS; definierte
    Consumer→Data-Access→View→Health→Reports→Doctor-Reihenfolge, SW v7 Fresh/
    Upgrade, 1280/390/320, V1-only Delete, V3 all-or-error sowie Monthly-
    User-RLS-SQL25 und Build-before-write belegt
  - Block C am `2026-08-24`: EV-ACT-R13-L05/L06 PASS; Protein v1.3 mit
    vollständigem Cooldown-/Dry-run-Vertrag sowie Trend-373/400-Umschlag,
    Midweek-Grenze, genau ein RPC, Legacy-Preservation und aufgeschobene
    State-Writes nach vollständiger Contractvalidierung belegt
  - Block-C-Full-Contract-Review und internes Continuation Gate: `PASS`;
    CodeRabbit-Läufe weiterhin exakt `0`, daher autonome Fortsetzung in S4.7
  - Block D am `2026-08-24`: EV-ACT-R13-L07 PASS; TOML-Flags exakt
    Monthly true/Protein false/Trend false, zwei getrennte apikey-Caller,
    Schedule/Payload unverändert, harte HTTP-Fehler, Legacy-/Final-
    Productzustand ohne Mischpostimage, R14-Loads/Secretmaterial/produktive
    DML null und SQL-Union eins
  - S4-Full-Contract-Review und internes Continuation Gate: `PASS`;
    CodeRabbit-Läufe weiterhin exakt `0`, daher autonome Fortsetzung in S5.1
  - S5.1 am `2026-08-24`: EV-ACT-R13-L08-Testmatrix und C07 `PASS`; relevante
    Node 38/38, Deno 81/81, Deno Format/Lint/Check, PG17 Full Fixture,
    Browser/PWA 5/5, L07-Orakel/TOML und diff-check grün. F29 korrigierte nur
    das Test-Routing; kein Produktcode wurde dadurch geändert. CodeRabbit bleibt
    exakt `0`, daher autonome Fortsetzung in S5.2
  - S5.2 am `2026-08-24`: nativer Full Review und EV-ACT-R13-L08/L09 `PASS`;
    CodeRabbit 0.7.5 exakt `1` Initial + `1` Verifikation. F30-F33 geschlossen,
    F34 grenzt den ersten CLI-Scopeschnitt transparent ab; der vollständige
    29-Pfade-R13-Scope wurde im Verifikationslauf geprüft. Invalidierte Protein-/
    Trend-/L07-/PG17-Checks erneut PASS; keine dritte externe Reviewrunde
  - S5.3 am `2026-08-24`: EV-ACT-R13-PRE01-PRE07 und C09 `PASS`; SQL25
    `f7226f6a...b3c3d`, geschützte Baselines, drei Legacy-Edge-Bundles,
    GitHub-/Scheduler-/Pages-Postimage und Advisor-Watchlists sind unverändert;
    HEAD/origin/remote bleiben `e3029629`. Die zwei Ziel-Keynamen und zwei
    GitHub-Secrets fehlen erwartungsgemäß. Die damalige Owner-Env-Abwesenheit
    war ein Parsefehler und wird durch F38 am S5.4-Gate korrigiert. Keine
    Mutation.
  - S5.4 am `2026-08-24`: EV-ACT-R13-C11/W00-W03 `PASS`. Der Owner gab die
    globale Initialisierung und alle notwendigen Schritte ausdrücklich frei.
    Das tatsächliche Initialpostimage besteht aus einem dormant gehaltenen
    Publishable Key `default` und einem Secret Key `default`; Legacykeys bleiben
    aktiv. F39 passt den lokal eingefrorenen Principalnamen an die reale
    Unterstrichsyntax an; Deno Format/Lint/Check, Principal 6/6, Protein/Trend
    12/12, L07 5/5 und diff-check sind grün. Die zwei getrennten Scheduler-
    Keys und GitHub-Secrets sind vorhanden, Owner-Env-Namen unverändert und
    Zielworkflows nicht gestartet. STOP vor S5.5.
  - S5.5/S5.6 am `2026-08-24`: EV-ACT-R13-C12/C13 sowie R01/R02. SQL26 war
    grün; Monthly v55/true und anonymer 401-Pfad grün. Positiver User-Smoke
    durch App-Sperre blockiert. Reverse auf bytegleiches Legacy-Sourcepreimage
    und true als v56/v57, aber neuer providerseitiger Hash cfd5dd51; deshalb
    F42/STOP. SQL25 f7226f6a, V1 65/859a0619, V2 0/0/0 und Advisorbaseline
    wiederhergestellt. Keine Fachdaten-, Protein-, Trend-, Workflow- oder
    Gitmutation.
- Autonomieprofil / aktuelle Welle:
  - `gated waves; F42/F43 akzeptiert; F45-GO Legacy-Signing erteilt; bei
    grünem produktivem F45-Gate autonom S5.6-S6`
- Runtime-/Deploy-Stand:
  - SQL26 ist mit User-/Service-/Corehash und Minimal-ACL aktiv. Monthly
    v58/true/957159c0 ist vollständig gesmokt. Protein v28/false ist mit
    F45-Source, Public 401, Named 200/No-write und echtem Legacy-User-dry-run
    vollständig grün; v27/true/5254b32e ist als sofortiger Reverse
    vorbereitet. Trendpilot v26/false bestand Source/Public/Named/No-write,
    scheiterte aber im echten User-dry-run mit HTTP 500. Der Safe-Reverse ist
    als v28/true mit exakt bytegleichem v25-Source, Public 401 und unverändertem
    Datenpostimage aktiv. Workflow-/Git-/Web-/PWA-Cutover ist nicht begonnen;
    GitHub Pages liefert weiterhin den alten HEAD aus.
- Offene Owner-Freigaben:
  - lokales Wellen-GO S4-S5.3 am `2026-08-24` erteilt
  - S5.4 für zwei benannte Keys, read-only Prüfung der zwei vorbestehenden
    function-spezifischen Ownerkonfigurationen und zwei GitHub-Secrets am
    `2026-08-24` erteilt und abgearbeitet; globale Initialisierung samt dormant
    gehaltenem `default`-Paar ebenfalls ausdrücklich freigegeben und erledigt
  - gebündeltes konditionales GO für S5.5-S6 einschließlich SQL/ACL,
    Edge-/verify_jwt, Smokes, kontrollierter Writes, Workflows, Commit/Push,
    Web/PWA, Doku/Archiv und exakter Rollbacks am `2026-08-24` erteilt
  - ausdrückliches F45-GO für D32 Legacy-Signing am `2026-08-25` erteilt;
    keine globale Signing-Key-Migration, danach bestehendes Gesamt-GO S5.6-S6
  - derzeit keine weitere Ownerfreigabe offen; Stop nur gemäß den protokollierten
    P0/P1-, Contract-, Evidence- und Rollbackbedingungen
- Stop-Bedingungen:
  - keine S4-Umsetzung vor grünem S4R und explizitem Owner-GO
  - keine S5.4-S5.7-Produktivaktion ohne die jeweils einschlägige Freigabe
  - vor S5.5 erneut den zielworkflowbezogenen Scheduler-Run-Preflight prüfen;
    der Re-entry am 2026-08-25 zeigt beide Zielworkflows ohne laufenden Run
    und Pages vollständig `completed`; am jeweiligen Cutoverpunkt erneut prüfen

## Context Receipt

- Baseline-Commit bei Roadmap-Erstellung:
  - `21ce8e5910ae9ba662503afef0059b31f03704bf`
- Aktuelle Re-entry-Baseline:
  - `HEAD = origin/main = remote main =`
    `e3029629e088d850464bde7e09df999f9e394e28`
  - der einzige Commit seit der S1-Baseline ist
    `docs(activity-v2): freeze R13 readiness and auth contracts`; sein Diff
    enthält keine R13-Runtime-, SQL-, Workflow-, Productload- oder Cachedatei
  - aktueller Owner-Worktree: geänderte
    `docs/Future trainingsmodule update thoughts.md` sowie untracked
    `docs/MIDAS Activity V2 C3 Training Product Surface and Protein Context Relocation Roadmap.md`
    und `assets/img/Personal_data_v3.png`; alle drei bleiben außerhalb R13
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
  - EV-ACT-R13-L01-L07 sowie die integrierte S5.1-Matrix in L08 sind grün;
    sechs obsolete R11-Product-Isolationstests sind durch L03/L04/L07 ersetzt
  - EV-ACT-R13-L08/L09 nach S5.2 grün; finales Handler-/Fixturepostimage besitzt
    native Delta-Nachweise und das externe Reviewbudget ist vollständig belegt
  - EV-ACT-R13-PRE01-PRE07 nach S5.3 grün; produktiver SQL25-/Daten-/Edge-/
    Workflow-/Web-/Advisor-Stand ist vor S5.4 unverändert. F36 bleibt gültig;
    F38 korrigiert die PRE04-Owner-Env-Teilbehauptung aus F35
  - EV-ACT-R13-PRE08/C10 dokumentieren den historischen STOP vor der
    Modern-Key-Initialisierung. EV-ACT-R13-C11/PRE09-PRE10/W00-W03 belegen
    danach S5.4:
    ausdrückliche Ownerfreigabe, reales dormant `default`-Publishable/-Secret-
    Paar, zwei getrennte Scheduler-Keys in Unterstrichsyntax, zwei GitHub-
    Secrets und unveränderte Owner-Env-Namen. PRE04 ist für die frühere
    Namensabsenz historisch; F37-F39 schließen Provisioning- und Evidence-Drift
  - EV-ACT-R13-C17 belegt SQL26 und Monthly v58 vollständig. C18/F44 belegen
    den historischen gestoppten Protein-Einzelcutover; C26 ersetzt dessen
    offenen Usernachweis durch den realen PASS auf v28/false. Protein-Key
    lokal/GitHub vollständig korrigiert. C27 belegt Trend v26/false mit
    Source/Public/Named/No-write und vollständig synchronisiertem ignoriertem
    lokalen Key; der erste echte Trend-User-dry-run deckte F48 auf.
  - EV-ACT-R13-C21/PRE12/F45 belegen den realen Legacy-JWT-/JWKS-
    Contractbruch und den exakten Protein-Reverse auf v27/true. C22 belegt den
    anschließenden Owner-Freeze ohne weitere technische Aktion. Diese Evidence
    bleibt bis zum Re-entry maßgeblich und wird nicht ohne Invalidation
    vollständig wiederholt.
  - EV-ACT-R13-C23/PRE13/L10 belegen den Re-entry, D32, die neue geschützte
    Alltagsdatenbaseline und den lokal grünen F45-Delta. Sie invalidieren nur
    den produktiven Protein-/Trend-Auth- und Rollbacknachweis, nicht R11/R12.
  - EV-ACT-R13-C24-C27/W06-W07/R03-R04 belegen beide exakten Reversepreimages,
    Protein produktiv vollständig und den historischen ersten Trend-Forward.
    C28-C31/F47/F48 ersetzen den offenen Trendnachweis durch den realen
    HTTP-500, den v27/false-Teilreverse und den vollständig grünen v28/true-
    Safe-Reverse sowie den minimalen, lokal und produktiv geprüften User-SELECT-
    ACL-Fix. C32-C33 schließen den erneuten v29-Forward mit Public, Named,
    echtem User und hashgleichem No-write-Postimage vollständig. Die übrige
    grüne Evidence bleibt wiederverwendbar.
  - EV-ACT-R13-C34-C40 belegen den Incident-Auth-Drift, den isolierten F50-
    Aliasfix, den erfolgreichen Workflow `32938596519`, das unveränderte Push-
    Postimage, den vorsorglichen vollständigen Reverse, die zeitliche
    Entkopplung der normalen Medication-/Slot-Updates, den exakten v27/true-
    Re-Forward sowie das außerhalb des Repositories persistierte secretfreie
    v23/true-Reverseartefakt. F50 ist production PASS.
  - EV-ACT-R13-C41-C45 belegen den finalen S5.7-Re-Forward, Commit A
    `d121adad`, beide grünen Zielworkflows, Commit B `4aa97f92`, Pages,
    Fresh-/Upgradeclient, Doctor-/Report-/Health-V3-Smokes und das vollständige
    S5.8-Postimage. Activity V1 bleibt 66/`cfddb1fa`; Activity V2 bleibt 0/0/0.
- Invalidation-Bedingungen:
  - Änderung SQL25/Consumer-Schema -> R11-SQL-/Consumer-Nachweise
  - Änderung R12-Adapter/medizinische Projektion -> HCR-030
  - Productload/Doctor/Health -> Browser-, Cache- und V1-Parität
  - Edge/Auth/Workflow -> Auth-, Scheduler-, Deploy- und Rollbacknachweise
  - Änderung von JWKS-/Signing-Topologie, Edge-Source/Flag, SQL26/ACL,
    Secretnamenstatus, Zielworkflow-Runs oder Pages-HEAD -> betroffenen
    S5.6-/S5.7-Preflight erneut ausführen und bei Contractdrift stoppen
  - normale neue Activity-V1-Einträge -> ausschließlich geschützte
    Datenbaseline vor dem nächsten produktiven Gate erneuern; keine Löschung,
    Umschreibung oder automatische Contractinvalidierung
  - normale Body-/Profil-/Report-/Legacy-Trend-Nutzung -> Metadaten, Zähler und
    serverseitige Hashes neu baselinen; bei kanonischer Form keine automatische
    Consumerinvalidierung, bei unbekannter Ursache STOP
- Session-Freeze:
  - `2026-08-24 OWNER-PAUSED / SAFE FREEZE; am 2026-08-25 nach Reset und
    read-only PASS durch ausdrückliches F45-GO aufgehoben`
- Tool-/Runtime-Status:
  - Git 2.55.0, Node 24.18.0, npm 11.18.0, rg 15.2.0, Deno 2.9.5,
    Supabase CLI 2.109.1, Docker 29.7.2, gh 2.96.0, Python 3.14.6,
    Playwright 1.61.1 und CodeRabbit 0.7.5 verfügbar; Browser-Plugin verfügbar
  - PostgreSQL produktiv 17.6/UTC; `@supabase/server` stabil aktuell 1.4.1;
    keine Installation und kein weiterer CodeRabbit-Lauf. Der authentifizierte
    S5.4-Browserzugang führte ausschließlich die freigegebene Key-/Secret-
    Provisionierung aus; Schlüsselwerte wurden weder protokolliert noch
    ausgegeben und nach der Bindung aus der Browser-Sitzungsvariable entfernt

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
| D-ACT-R13-05 | 2026-08-23 | Supabase-Keynamen: `protein_targets_scheduler` und `trendpilot_scheduler`; GitHub-Secrets: `PROTEIN_TARGETS_SECRET_KEY` und `TRENDPILOT_SECRET_KEY`. F39 korrigiert die ursprünglichen Bindestrichnamen auf die reale Supabase-Namensyntax. | Getrennte Rotation und eindeutige Calleridentität. | S5 |
| D-ACT-R13-06 | 2026-08-23 | Scheduler senden Secret Keys ausschließlich über `apikey`, nie als Bearer; Workflows nutzen harte HTTP-Fehlerprüfung. | Verhindert Invalid-JWT- und stille Schedulerfehler. | S4.7 |
| D-ACT-R13-07 | 2026-08-23 | Schedulerowner kommt ausschließlich aus serverseitiger Konfiguration; ein Body-`user_id` ist keine Autorität. | Secret Keys umgehen RLS und dürfen keinen frei wählbaren Owner erhalten. | S4.1, S4.2 |
| D-ACT-R13-08 | 2026-08-23 | Protein verwendet eine neue `v1.3-*`-Calc-Version. Cooldown darf nur skippen, wenn auch Aktivtage, Level und Versionsmetadaten unverändert sind. | Zielwert und gespeicherte Herleitung dürfen nicht auseinanderlaufen. | S4.5 |
| D-ACT-R13-09 | 2026-08-23 | Trendpilot-Input umfasst höchstens 373 inklusive Tage; mit 27 Vortagen bleibt der Snapshot bei höchstens 400 Tagen. | SQL25-/R11-Maximum bleibt fail-closed. | S4.6 |
| D-ACT-R13-10 | 2026-08-23 | Bestehende Reports und alte Trendpilot-Payloads werden nicht migriert. | Historische Snapshots behalten ihre damalige Bedeutung. | S4.4, S4.6 |
| D-ACT-R13-11 | 2026-08-23 | S4 bleibt lokal; CodeRabbit läuft nur im integrierten S5. Produktive Aktionen folgen erst nach finalem Diffreview. | Vermeidet Review- und Deployspiralen. | Prozess |
| D-ACT-R13-12 | 2026-08-23 | R13 darf für den Web-/Workflow-Cutover einen expliziten owner-gateten Zwischen-Commit/Push benötigen; ohne realen Runtime-Smoke kein DONE. | GitHub-Workflows und statische Produktion können nicht aus einem rein lokalen Worktree aktiviert werden. | S5 |
| D-ACT-R13-13 | 2026-08-23 | Die globale Legacy-Key-Migration/-Deaktivierung bleibt im separaten Masterplan; die für Named Keys notwendige Modern-Key-Initialisierung wurde in S5.4 separat freigegeben. R13 deaktiviert oder rotiert keine Legacy Keys. | Scope bleibt beherrschbar und andere Consumer brechen nicht. | Gesamt |
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
| D-ACT-R13-25 | 2026-08-24 | Der Owner erteilt das S4R-GO exakt für S4.1-S5.3. Der Re-entry-Drift-Check ist PASS; der docs-only HEAD-Fortschritt und der neue Owner-Worktree invalidieren keine eingefrorene R13-Runtime-Evidence. | Die autonome lokale Welle kann ohne Wiederholung von S1-S4R mit Block A beginnen und stoppt zwingend vor S5.4. | Prozess |
| D-ACT-R13-26 | 2026-08-24 | S5.3 schließt PRE01-PRE07 ohne Drift. Gate A umfasst zusätzlich zu zwei benannten Secret Keys und zwei GitHub-Secrets die bereits vertraglich festgelegten function-spezifischen Ownerkonfigurationen `PROTEIN_TARGETS_USER_ID` und `TRENDPILOT_USER_ID`; Werte bleiben ausschließlich im Supabase-Secretstore. | Der Named-Secret-Pfad kann nach dem Deploy nicht wegen fehlender serverseitiger Ownerbindung auf 500 fallen; es entsteht keine neue Ownerquelle und kein Body-Owner. | S5.4 |
| D-ACT-R13-27 | 2026-08-24 | Historischer STOP: Das erste S5.4-GO umfasste nur Named Keys, Owner-Prerequisites und GitHub-Secrets; der vorläufige Dashboard-Preview ließ bei `Create new API keys` ein zusätzliches Dreierset erwarten. Deshalb wurde die globale Initialisierung nicht still abgeleitet. D29 supersediert Preview und Freigabestand mit der realen Bestätigungsmodalität. | Verhinderte eine stille Scope-/Blast-Radius-Erweiterung und erzwang den später ausdrücklich erteilten Ownerentscheid. | S5.4 / F37 / superseded by D29 |
| D-ACT-R13-28 | 2026-08-24 | F35 wird durch F38 korrigiert: Die beiden function-spezifischen Owner-Env-Namen waren bereits seit Januar vorhanden; die S5.3-Abwesenheit entstand durch falsches PowerShell-Array-Pipelining. Gate A verifiziert diese Namen nur read-only und überschreibt keine Werte. | Verhindert unnötige Secretrotation und ein unbemerktes Teilpostimage. PRE04 bleibt für Named-Key-/GitHub-Namen gültig, nicht für die frühere Owner-Env-Abwesenheitsbehauptung. | S5.4 / F38 |
| D-ACT-R13-29 | 2026-08-24 | Der Owner erweitert S5.4 ausdrücklich um die globale Modern-Key-Initialisierung und alle notwendigen Gate-A-Schritte. Die reale Bestätigungsmodalität erzeugt exakt Publishable `default` plus Secret `default`; beide bleiben dormant und unreferenziert, Legacykeys aktiv. | Schließt F37 mit einem beobachteten statt erfundenen Postimage und ohne Legacy-Migration. Dormant Keys werden nicht automatisch gelöscht oder rotiert. | S5.4 / F37 |
| D-ACT-R13-30 | 2026-08-24 | Supabase akzeptiert für Secret-Keynamen nur Kleinbuchstaben, Ziffern und Unterstriche. Die zwei R13-Principals heißen deshalb exakt `protein_targets_scheduler` und `trendpilot_scheduler`; Authcode, Fixtures und Vertrag wurden vor Provisionierung synchronisiert. | Verhindert Provider-/Code-Drift. Nur invalidierte Auth-/Handler-/Isolationchecks werden wiederholt. | S5.4 / F39 |
| D-ACT-R13-31 | 2026-08-24 | Der Owner friert R13 am sicheren S5.6/F45-Haltepunkt bis zum Reset des Wochenkontingents ein. Es erfolgen keine weiteren lokalen oder produktiven R13-Aktionen. Normale Activity-V1-Nutzung darf weiterlaufen; sie verlangt beim Re-entry nur eine neue geschützte Datenbaseline. | Die verbleibenden 10 % reichen nicht belastbar für Auth-Neudesign, erneute Edge-Gates, Workflow-/Web-Cutover, finales Postimage und S6. Der Freeze verhindert ein unvollständiges Produktivzwischenpostimage. | Prozess / F45 / S5.6-S6 |
| D-ACT-R13-32 | 2026-08-25 | Der Owner wählt für F45 ausdrücklich die Legacy-Signing-Variante: globale Signing-Key-Topologie und Legacykeys bleiben unverändert. Ein Bearer-Caller wird ohne lokales JWT-Decoding autoritativ durch `supabase.auth.getUser(jwt)` validiert und erhält anschließend nur den requestgebundenen User-RLS-Client; ein vorhandener oder fehlgeschlagener Bearer darf niemals auf den Named-Secret-Pfad zurückfallen. Scheduler bleiben getrennt über `@supabase/server@1.4.1` und den jeweils exakten Secret-Keynamen gebunden. | Der reale Legacy-HS256-Userpfad wird serverseitig gegen Supabase Auth beweisbar, ohne R13 zu einer globalen Signing-Key-Migration auszuweiten. Owner-ID stammt ausschließlich aus dem validierten Auth-User; Body-/Metadatenowner, Tokenlogging und stille Fallbacks bleiben ausgeschlossen. | F45 / S5.6 |
| D-ACT-R13-33 | 2026-08-25 | F48 wird ohne neuen Authvertrag durch einen minimalen ACL-Delta geschlossen: `authenticated` erhält auf der bereits RLS-geschützten `trendpilot_state` ausschließlich `SELECT`; `INSERT/UPDATE/DELETE` bleiben service-only. Exakter Rollback ist der einzelne Gegen-REVOKE. | Der User-dry-run kann seinen eigenen bestehenden Baseline-State lesen; RLS bindet die Row weiterhin an `auth.uid()`. Named Scheduler und produktive State-Writes bleiben unverändert service-only. | F48 / S5.6 |

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
| S4.1 | Shared Edge Auth und Principal Contract | Extra High | PASS | gepinntes `@supabase/server@1.4.1`; exakte User/Named-Secret-Principals, requestlokaler Runtime-Loader, sichere Fehler; L01 10/10 |
| S4.2 | SQL26 kanonischer Snapshotprovider | Extra High | PASS | ein privater Core, User-/service-only Wrapper, SQL16 und exakter SQL25-Rollback; PG17 L02 und nativer Review PASS |
| S4.3 | Doctor View und Health Export V3 | High | PASS | exakter Read-Productload, lazy Doctor-Snapshot, V1-only Delete, Health V3, scoped CSS und SW v7; L03 4/4 Node + 5/5 Browser |
| S4.4 | Range-Arztbericht | High | PASS | requestgebundener User-RLS-SQL25-Snapshot, R11-Projektion und Snapshot-/Contractfehler vor Write; L04 4/4 Deno |
| S4.5 | Protein Target | Extra High | PASS | v1.3, exakter Cooldown, User/Secret, ein 28-Tage-Snapshot, dry-run ohne Write; L05 6/6 + R12 4/4 |
| S4.6 | Trendpilot | Extra High | PASS | User/Secret, 373+27, ein RPC, neue Keysets, Legacy unverändert, Preconditions vor Write; L06 6/6 + R12 4/4 |
| S4.7 | Workflows, Productload, Cache und Cutoverartefakte | High | PASS | config false exakt zwei, getrennte apikey-Caller, HTTP fail, sichere Legacy-/Finalzustände und R14-/Secret-/DML-Orakel; L07 5/5 |
| S5 | Integrierte Tests, Review und produktiver Cutover | Extra High | PASS | SQL26/ACL, vier Edge-Ziele, getrennte Scheduler, beide kontrollierten Workflows, Commit B/Pages, Fresh/Upgrade/Doctor/Report/Export und finales Datenpostimage grün; R14-Orakel 0/0/0 |
| S6 | Doku-Sync, Recap und Archiv | High | PASS | Module, Masterpläne, HCR-031, SQL-HOW-TO, Changelog, Evidence und Resume Card auf das reale R13-Postimage synchronisiert |

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
| F-ACT-R13-16 | P1 | SQL/ACL | fixed | SQL26/SQL16 erweitern nur Schema-Usage plus neuen Core für service_role; PG17-Orakel schützt den alten R9-Helper und restauriert im Rollback exakt SQL25/alte Schema-ACL |
| F-ACT-R13-17 | P1 | Supply/Auth | fixed | S4.1 pinnt `npm:@supabase/server@1.4.1`; reale Paketcontracttests bestehen für User und beide exakten Named-Secret-Modi |
| F-ACT-R13-18 | P1 | Production safety | fixed in target | Protein besitzt noch keinen no-write Secret-Smoke; S4.5 ergänzt strikt authentifiziertes `dry_run`, Trendpilot behält seinen vorhandenen no-write Pfad |
| F-ACT-R13-19 | P1 | Backcompat/Data | fixed in target | realer Trend-Upsert überschreibt top-level `context`; S4.6 konserviert Legacy-Activity-Unterobjekte ohne Hybrid und testet vorhandene `sessions_4w`-Rows |
| F-ACT-R13-20 | P1 | UI/Consumer | fixed | minimale Activity-View-Regeln Doctor-scoped in `app/app.css`; Browser-Plugin und Playwright 1280/390/320 ohne Overflow PASS |
| F-ACT-R13-21 | P1 | Cutover/Rollback | fixed in target | ein gemeinsamer Workflow-/Web-Commit koppelt Rollbacks; S5.7 verwendet pfadselektiv Runtime/Workflow zuerst und Web/PWA separat, fremder Dirty Diff bleibt ausgeschlossen |
| F-ACT-R13-22 | P2 | Implementation | fixed | erster L01-Lauf fand einen zu breiten Authmodustyp, unnötige `async`-Testdoubles und eine 400 statt 401 Tage breite Negativfixture; korrigiert, danach Format/Lint/Check/Test 10/10 |
| F-ACT-R13-23 | P1 | SQL/ACL | fixed | nativer S4.2-Review verlangte zusätzlich exakte Fresh-/Rerun-Overload- und ACL-Abweisung; Guards/Postconditions ergänzt und mit Drift-/Rollbackmatrix wiederholt bewiesen |
| F-ACT-R13-24 | P2 | UI-Test | fixed | erstes Product-Smoke-Orakel verlangte 44 px auch von geschützten vorbestehenden Doctor-Buttons; auf den neuen Activity-Delete-Seam begrenzt, 5/5 Browser erneut PASS |
| F-ACT-R13-25 | P2 | Handler-Test | fixed | erste L04-Fixture übergab den gespeicherten Dreifeld-Rangevertrag an den exakten Zweifeld-Runtimeeingang und nutzte unnötige `async`-Doubles; Eingabe normalisiert, Doubles bereinigt, Format/Lint/Check/Test 4/4 PASS |
| F-ACT-R13-26 | P2 | Handler/Supply | fixed | erster L05-Review fand den unversionierten Edge-Runtime-Typimport und ein unnötiges `async`-Testdouble; Import auf Major 2 gepinnt, Double bereinigt, Format/Lint/Check/Test 6/6 PASS |
| F-ACT-R13-27 | P0 | Contract/State | fixed | erster L06-Review fand mögliche State-Writes vor Activity-Contextvalidierung und ein sonntägliches Eventfenster hinter einem Midweek-Inputende; State-Writes bis nach kompletter Kontextableitung aufgeschoben und Activityfenster am Snapshotende gebunden, Fehlerfixture mit null Writes und Midweek-Orakel PASS |
| F-ACT-R13-28 | P1 | Cutover/Test | fixed | erster L07-Orakelentwurf zählte Pfadreferenzen in Kommentaren und akzeptierte nur das finale Webpostimage; auf exakte `src`-/`toUrl`-Tags sowie die zwei sicheren Zustände Legacy/Final mit harter Mischzustandsabweisung korrigiert, L07 5/5 erneut PASS |
| F-ACT-R13-29 | P2 | Test-Routing | fixed | erster integrierter Lauf enthielt sechs durch R13 bewusst invalidierte R11-Preaktivierungsassertionen, Deno fehlte lokal `--allow-read` und PowerShell blockierte den `.ps1`-Playwright-Launcher; obsolete Assertions explizit ausgeroutet, Deno-Berechtigung ergänzt und `playwright.cmd` verwendet; valide Matrix grün, kein Produktcode-Diff |
| F-ACT-R13-30 | P2 | Request/Date | fixed | CodeRabbit Initial fand, dass Protein nur die ISO-Form, nicht den realen Kalendertag validierte; UTC-Roundtrip ergänzt, `2026-02-31` wird vor RPC/Tabellenzugriff mit 400 abgewiesen; L05 10/10 PASS |
| F-ACT-R13-31 | P2 | Request/Range | fixed | CodeRabbit Initial fand, dass Trendpilot einen nur halb gesetzten Range still durch Default ersetzte; genau ein gesetztes Rangeende wird nun vor RPC/Tabellenzugriff mit 400 abgewiesen; L06 10/10 PASS |
| F-ACT-R13-32 | P2 | Resume/Doku | fixed | CodeRabbit Verifikation fand im nächsten erlaubten Schritt bereits abgeschlossene S4-/S5.1-Anteile; Resume Card auf den tatsächlich offenen S5.3-Rest und STOP vor S5.4 synchronisiert |
| F-ACT-R13-33 | P1 | SQL/Test | fixed | CodeRabbit Verifikation fand, dass PostgreSQL 17 `\quit 1` als Extraargument ignoriert und der Fixture-Fehlerzweig Exitcode 0 liefert; disposable Realprobe bestätigt, auf `midas_fixture.assert_true` unter `ON_ERROR_STOP` umgestellt, komplettes PG17-Full-Fixture PASS |
| F-ACT-R13-34 | P2 | Review-Scope | fixed | der Windows-Temporary-Index wurde vom WSL-CLI im Initiallauf nicht als vollständiger Untracked-Scope übernommen; Verifikationslauf deshalb in disposable exakter 29-Pfade-R13-Kopie inklusive aller neuen Dateien und ohne Owner-Artefakte ausgeführt; Scope vollständig, Kopie entfernt |
| F-ACT-R13-35 | P1 | Runtime/Owner-Konfiguration | superseded by F38 | S5.3 meldete beide Owner-Env-Namen durch falsches PowerShell-Array-Pipelining als fehlend und ergänzte irrtümlich eine Set-Aktion; S5.4 belegt die Namen als seit Januar vorbestehend. Kein Wert gelesen, kein Rewrite |
| F-ACT-R13-36 | P2 | Preflight/Evidence | fixed | erste interne S5.3-V1-Abfrage hashte versehentlich die abgeleitete View; vor Entscheidung auf die kanonische geschützte `health_events`-Basistabelle, `type=activity_event`, `order by id` korrigiert und Baseline `859a0619...cbef7` exakt bestätigt |
| F-ACT-R13-37 | P1 | Key-Control-Plane/Scope | fixed | die aktuelle Supabase-UI verlangte vor Named Secret Keys `Create new API keys`; der Owner gab die Initialisierung und alle notwendigen Schritte ausdrücklich frei. Die reale Bestätigungsmodalität korrigierte den vorläufigen Preview: exakt Publishable `default` plus Secret `default` angelegt, beide dormant/unreferenziert; Legacy `anon`/`service_role` unverändert aktiv |
| F-ACT-R13-38 | P1 | Preflight/Evidence/Secret-Hygiene | fixed | PRE04/F35 behandelten das von `ConvertFrom-Json` gelieferte Array als ein Pipelineobjekt; exakte Elementauswertung belegt `PROTEIN_TARGETS_USER_ID` und `TRENDPILOT_USER_ID` seit Januar als vorhanden. Gate A setzt sie nicht neu; Roadmap, Evidence, Resume, Forward- und Rollbackvertrag korrigiert |
| F-ACT-R13-39 | P1 | Key-Control-Plane/Provider-Validation | fixed | der erste Named-Key-Dialog wies die Bindestrichnamen mit der realen Lowercase-/Digit-/Underscore-Regel ab. Vor Keyanlage Authcode, Tests, Entscheidungen und Gatevertrag auf `protein_targets_scheduler`/`trendpilot_scheduler` synchronisiert; Deno Format/Lint/Check, Principal 6/6, Handler 12/12, L07 5/5 und diff-check PASS |
| F-ACT-R13-40 | P2 | Evidence/Markdown | fixed | S5.4-Full-Contract-Review fand in der Evidence-Findings-Tabelle einen ab F22 unbemerkten Wechsel von fünf auf sechs Spalten; Header und ältere Zeilen normalisiert, Tabellenstruktur und diff-check PASS |
| F-ACT-R13-41 | P1 | Runtime/Preflight | fixed | S5.5-Re-Preflight fand Monthly/Protein/Trend auf höheren Versionsnummern 54/22/25 statt 50/18/21; alle drei PRE-Bundle-Hashes und `verify_jwt=true` blieben exakt. Kein Contract-/Source-Drift, neue numerische Rollbackbaselines dokumentiert |
| F-ACT-R13-42 | P1 | Runtime/Rollback/Device | accepted / fixed | Monthly v55/true bestand den 401-Negativpfad, der positive User-Smoke blieb hinter der lokalen PIN-/Passkey-Sperre. Der Reverse restaurierte Legacy-Source und true bytegleich, aber der aktuelle Supabase-Bundler erzeugte cfd5dd51 statt 914d5f8b. Owner akzeptiert am 2026-08-24 Sourcebytegleichheit plus ursprüngliches Flag und negative/positive Runtime-Smokes als maßgebliches Rollbackorakel; kontrollierbarer Produktionstab wird vor Write-Smoke ownerseitig entsperrt |
| F-ACT-R13-43 | P1 | Data/Continuation Gate | accepted / fixed | erneuter S5.6-Re-entry fand Activity V1 66/cfddb1fa statt bestätigter Baseline 65/859a0619; Metadaten belegen genau einen formal kanonischen V1-Neuzugang am 2026-08-24, ohne Payloadread. SQL26 sofort mit 79ec07cd auf SQL25 f7226f6a reversiert. Owner bestätigt den Datensatz als beabsichtigten heutigen Gym-Eintrag über Activity V1; 66/cfddb1fa als neue Forwardbaseline akzeptiert |
| F-ACT-R13-44 | P1 | Secret/User-Smoke | partial / superseded by F45 | `.env.supabase.local` enthielt für beide Named Keys nur maskierte Dashboard-Präfixe. Proteinwert lokal/GitHub sicher korrigiert und Named-Secret-dry-run 200/No-write; Trendwert lokal weiterhin unvollständig/unbenutzt. Der direkte User-dry-run erreichte den Edge und machte den separaten F45 sichtbar |
| F-ACT-R13-45 | P1 | Auth/Contract | fixed / production PASS | Produktiver JWKS enthält null Keys; der frühere `@supabase/server@1.4.1`-Usermodus verwarf deshalb reale Legacy-User-JWTs. Owner entscheidet D32 ausdrücklich gegen eine globale Migration. Bearer werden nun autoritativ über Supabase Auth `getUser(jwt)` validiert, der User-RLS-Client trägt denselben Bearer; kein Decoding, Claim-/Bodyowner, Secret-Fallback oder Tokenlogging. Named Secrets bleiben getrennt im gepinnten Paketpfad. Lokaler Delta PASS. Protein v28/false und Trend v29/false bestehen Source/Public/Named/echten Legacy-User vollständig und bleiben in den Dry-runs No-write; v27/true- bzw. v25/true-Reverse bereit. |
| F-ACT-R13-46 | P2 | Freeze/Evidence | fixed | Freeze-Full-Contract-Review fand die Hauptmatrix sowie ältere Test-/Vorher-Nachher-Zeilen noch auf dem vorletzten F42-/SQL25-Reversepostimage. Auf OWNER-PAUSED/C22, SQL26 + Monthly v58 aktiv und Protein F45 safe reverse synchronisiert; keine Runtime- oder Vertragsänderung |
| F-ACT-R13-47 | P1 | Runtime/Rollback | fixed | erster Trend-Legacy-Source-Reverse v27 behielt ohne expliziten Functionblock verify_jwt=false. Temporäres Rollback-Manifest auf Trend=true gepinnt und dasselbe bytegleiche v25-Sourcepreimage als v28 erneut deployt; ACTIVE/true, Source d16339af, Public 401 und Datenpostimage PASS |
| F-ACT-R13-48 | P1 | Trend/User-Runtime/ACL | fixed / production PASS | Payloadfreie Logs und der Proteinvergleich belegen erfolgreichen D32-Handlerzugang. Nur Trend liest im User-dry-run `trendpilot_state`; `authenticated` fehlte dort SELECT trotz aktiver RLS-/Own-row-Policy. SQL16 gewährt nun ausschließlich SELECT an authenticated, User-DML bleibt aus. PG17-Full-Fixture, L07, diff-check, nativer Securityreview und produktiver Grant-Postcheck sind PASS; der echte v29-User-dry-run meldet PASS 200 und der unmittelbare No-write-Postcheck ist hashgleich. Exakter REVOKE-Rollback bereit. |
| F-ACT-R13-49 | P1 | S5.7/Workflow-Runtime | contained / safe reverse | Erster Commit-A-Cutover: Proteinworkflow PASS, Trendworkflow HTTP 401/No-write. Commit B blieb geschlossen; Reverse stellte Git `09622c0`, SQL25, drei Legacy-Edges true/sourcegleich/Public 401, revokten F48-Grant und 0 inflight her. Trend-GitHub-Secretbinding geheim resynchronisiert, aber wegen des Reverse noch nicht erneut produktiv bewiesen. |
| F-ACT-R13-50 | P1 | Incidents/Auth-Binding | fixed / production PASS | Der eingebaute Functionwert war nicht bytegleich zum vom Gateway akzeptierten aktuellen Dashboard-/Local-/GitHub-Legacy-Key. Owner genehmigte den isolierten Custom-Secret-Alias. Incident v27/true verwendet `INCIDENTS_PUSH_LEGACY_KEY` ausschließlich für den Callervergleich und unverändert den eingebauten Service-Key intern. Public/missing und anon 401, gültiger Alias pre-data 400; Workflow `32938596519` SUCCESS. Deliveries/Subscriptions unverändert; zeitgleich erkannte Medication-/Slot-Updates lagen beweisbar vor Dispatch. v23/true-Reverse und exakter Re-Forward PASS, 0 inflight. |

<!-- markdownlint-enable MD013 -->

Reviewurteil:

- Produktvertrag: `PASS`
- Security-/Authvertrag: `PASS; F45 Legacy-Signing serverseitig kompatibel, Protein und Trend produktiv Source/Public/Named/User vollständig grün; F48-User-SELECT minimal und RLS-geschützt`
- Scope und R14-Abgrenzung: `PASS`
- Ausführbarkeit: `S5.6 vollständig PASS; S5.7 gemäß Commit-A/B- und Reversevertrag freigegeben`
- offene P0/P1: `keine`

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
  - Protein: `['user', 'secret:protein_targets_scheduler']`
  - Trendpilot: `['user', 'secret:trendpilot_scheduler']`
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
2. S5.4 initialisiert nach Einzelbestätigung das dormant gehaltene `default`-
   Publishable/-Secret-Paar, legt die zwei Supabase-Named-Keys an, verifiziert
   die zwei seit Januar vorbestehenden function-spezifischen
   Ownerkonfigurationen ausschließlich read-only und setzt die zwei GitHub-
   Secrets. Alte Workflows/Edges ignorieren die neuen Caller-Credentials;
   Legacy Keys bleiben aktiv. F37-F39 sind vor S5.5 geschlossen.
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
  4. erst danach SQL26 rückrollen; Named Keys und GitHub-Secrets dürfen
     dormant bleiben; die vorbestehenden Ownerkonfigurationen bleiben
     unverändert
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
  Vorbestehende Ownerkonfigurationen werden durch R13 nicht verändert.

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

- Verbindlicher Forwardpfad: `S5.3 Preflight -> S5.4 globales dormant
  default-Publishable/-Secret-Paar + zwei Named Keys + read-only Verifikation
  der zwei vorbestehenden function-spezifischen Ownerkonfigurationen + zwei
  GitHub-Secrets -> S5.5
  SQL26 -> S5.6 Monthly(true) -> Protein(false,
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
  gelöscht/rotiert; vorbestehende Ownerkonfigurationen bleiben unverändert.
- Jede produktive Forward- und Rollbackaktion bleibt trotz dieser Spezifikation
  owner-gated. Das aktuelle S4R-GO erteilt dafür keine Berechtigung.

#### Noch benötigte Freigaben

1. Erteilt und abgearbeitet: ausdrückliches `GO` für exakt S4.1-S4.7 und
   S5.1-S5.3 gemäß diesen vier Blöcken.
2. S5.4-GO einschließlich globaler Initialisierung erteilt und abgearbeitet:
   dormant `default`-Publishable/-Secret-Paar, einzeln Named Key
   `protein_targets_scheduler`, Named Key
   `trendpilot_scheduler`, read-only Existenzprüfung der vorbestehenden
   function-spezifischen Ownerkonfigurationen `PROTEIN_TARGETS_USER_ID` und
   `TRENDPILOT_USER_ID`, GitHub Secret
   `PROTEIN_TARGETS_SECRET_KEY` und `TRENDPILOT_SECRET_KEY`; Werte nur in
   Secretdialogen. F37-F39 geschlossen.
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

Abschluss `2026-08-24`: `PASS`. Node 38/38; Deno 75/75 plus 6/6;
Deno Format/Lint/Check; PG17-Full-Fixture mit abschließendem
`R13 S4.2 SQL 26 fixture PASS`; Browser/PWA 5/5; L07-Isolation und TOML-Parse;
`git diff --check`. F29 ist als reines Harness-/Routingfinding geschlossen.
Die sechs durch die R13-Produktaktivierung absichtlich ungültigen R11-
Negativassertionen wurden nicht als Produktfehler umgedeutet, sondern gemäß
Invalidation Map durch L03/L04/L07 ersetzt. Disposable PostgreSQL und lokaler
HTTP-Testserver sind beendet; keine produktive Aktion und CodeRabbit weiterhin
`0`.

### S5.2 Integrierter Review

1. nativer Full Code-, Contract-, Security-, Medical- und Scopereview
2. genau ein CodeRabbit-Initiallauf über denselben finalen Diff
3. Findings gesammelt bewerten; nichts blind korrigieren
4. berechtigte Findings minimal bündeln
5. nur invalidierte Checks wiederholen
6. genau ein CodeRabbit-Verifikationslauf
7. keine weitere Reviewspirale ohne P0/P1-/Security-/Datenintegritätsgrund

Abschluss `2026-08-24`: `PASS`. Nativer Full Review grün. CodeRabbit 0.7.5
meldete initial 2 Minor-Issues (F30/F31); beide wurden minimal korrigiert und
mit L05/L06 plus L07 validiert. Die einzige Verifikation über den vollständigen
disposable 29-Pfade-R13-Scope meldete 1 Minor- und 1 Major-Issue (F32/F33);
beide sind geschlossen. Die reale PG17-Probe bewies den Exitcode-0-Fehler von
`\quit 1`, und das korrigierte vollständige SQL-Fixture endet erneut mit
`R13 S4.2 SQL 26 fixture PASS`. Kein dritter externer Lauf; Reviewbudget exakt
`1 + 1`, keine produktive Aktion.

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

Abschluss `2026-08-24`: `PASS`. PRE01-PRE07 sind grün. Produktiv bleiben
SQL25 `f7226f6a...b3c3d`, die geschützten Zähler/Hashes, Monthly
v50/true, Protein v18/true, Trend v21/true, Legacy-Workflows, Pages aus
`main:/` und SW v6 unverändert; beide Scheduler haben null laufende Runs und
die Advisor-Watchlists sind identisch. HEAD, origin/main und remote main sind
`e3029629`. Die finalen 27 R13-Source-/Rollback-/Fixtureartefakte stimmen mit
L01-L07 überein und `git diff --check` bleibt grün. F36 ist geschlossen; die
spätere F38-Korrektur ersetzt F35. Keine Schlüssel-, SQL-, Secret-, Deploy-,
Workflow-, Git- oder Deviceaktion wurde ausgeführt. Zwingender STOP vor S5.4.
F39 invalidierte danach ausschließlich Principal und Principaltest; deren
S5.4-Finalhashes und erneute Delta-Checks stehen in EV-ACT-R13-PRE10, alle
übrigen PRE07-Fingerprints bleiben gültig.

### S5.4 Owner-Gate A - Schlüssel und Secrets

Briefing und Einzelbestätigung für:

1. benannten Supabase Secret Key `protein_targets_scheduler`
2. benannten Supabase Secret Key `trendpilot_scheduler`
3. read-only Existenzprüfung der vorbestehenden function-spezifischen
   Supabase-Ownerkonfiguration `PROTEIN_TARGETS_USER_ID`; kein Rewrite
4. read-only Existenzprüfung der vorbestehenden function-spezifischen
   Supabase-Ownerkonfiguration `TRENDPILOT_USER_ID`; kein Rewrite
5. GitHub Secret `PROTEIN_TARGETS_SECRET_KEY`
6. GitHub Secret `TRENDPILOT_SECRET_KEY`

Neue Keywerte werden ausschließlich in den vorgesehenen Secretdialogen
verarbeitet. Evidence speichert nur Namen, Existenz und erfolgreichen
Modus-Smoke; vorbestehende Ownerwerte werden weder gelesen, ausgegeben noch
neu gesetzt.

Gate-Abschluss `2026-08-24`: `PASS`. Der Owner erweiterte die Freigabe
ausdrücklich auf die globale Keyinitialisierung und alle notwendigen S5.4-
Schritte. Die reale Bestätigungsmodalität erzeugte exakt einen Publishable Key
`default` und einen Secret Key `default`; beide bleiben bewusst dormant und
werden von keinem R13-Artefakt referenziert. Legacy `anon` und `service_role`
bleiben aktiv. Der erste Named-Key-Dialog belegte zusätzlich, dass Supabase nur
Kleinbuchstaben, Ziffern und Unterstriche akzeptiert. F39/D30 synchronisierten
deshalb Principalcode, Fixtures und Verträge vor Provisionierung auf
`protein_targets_scheduler` und `trendpilot_scheduler`.

W00 legte das `default`-Paar an, W01/W02 die zwei getrennten Scheduler-Secret-
Keys und W03 die gleichnamig gebundenen GitHub-Actions-Secrets. W03A bestätigte
die seit Januar vorbestehenden Owner-Env-Namen read-only und führte keinen
Rewrite aus. Schlüsselwerte wurden nur in den vorgesehenen Dialogen und
Secretstores verarbeitet, nie ausgegeben oder lokal/Evidence-seitig persistiert
und nach der Bindung aus der Browser-Sitzungsvariable entfernt. Der Postcheck
belegt alle vier modernen Keynamen,
beide GitHub-Secretnamen, aktive Legacy-Keynamen und null Protein-/Trendpilot-
Runs durch diese Aktion. Zwei seit `2025-12-18` stale queued
`pages-build-deployment`-Runs wurden nicht verändert, blockieren das reine
Keypostimage nicht und werden am S5.7-Pages-Gate erneut bewertet.

Invalidierter Delta: Deno Format/Lint/Check für Auth-/Handlerfixtures,
Principaltest 6/6, Protein-/Trendpilothandler 12/12, L07 5/5 sowie
`git diff --check` sind `PASS`. Es gab keinen weiteren CodeRabbit-Lauf. SQL,
Edge-Deploys, Workflowdispatches, Git, Web/PWA und Devices blieben unverändert.
Zwingender STOP vor dem separat owner-gateten S5.5.

### S5.5 Owner-Gate B - SQL26

- finalen Hash, erwartete Objekte, ACLs und geschützte Daten briefen
- SQL26 exakt einmal ausführen
- sofort Owner, Definition, ACL, SQL25-Backcompat, service-only Wrapper,
  Zähler, Datenhashes und Advisors read-only prüfen
- bei Abweichung keine Edge-Aktivierung

Abschluss `2026-08-24`: `PASS`. Gebündeltes Owner-GO protokolliert; Re-
Preflight mit SQL25 `f7226f6a...b3c3d`, V1 65/`859a0619...cbef7`, V2 0/0/0,
unveränderten Protected-Hashes und Advisor-Watchlists grün. SQL26
`71faf186...7c47` exakt einmal ausgeführt. Postimage: User
`cffcd679...9f2b`, Service `eb27ec44...6f54`, Core `abb59627...f79f`, Owner
`postgres`, einzige Union im Core, exakte authenticated-/service_role-ACLs;
keine Fachdatenänderung. Rollback `79ec07cd...5299` auf SQL25 bleibt bereit.

### S5.6 Owner-Gate C - Edge-Cutover

In dieser Reihenfolge und jeweils mit eigenem Smoke/Rollbackpunkt:

1. `midas-monthly-report` deployen und User-JWT-/Report-Smoke
2. `midas-protein-targets` mit finalem Dual-Auth-Vertrag deployen
3. Userpfad und benannten Protein-Secretpfad prüfen
4. `midas-trendpilot` mit finalem Dual-Auth-Vertrag deployen
5. Userpfad und benannten Trendpilot-Secretpfad prüfen

Kein Secret-Smoke darf unkontrolliert medizinische Daten neu berechnen. Der
konkrete Dry-run-/no-op-/kontrollierte Writevertrag wird in S2/S3 eingefroren.

STOP `2026-08-24`: Monthly v55/true/957159c0 wurde deployt; der anonyme
Negativpfad lieferte 401. Der positive User-JWT-/Report-Smoke erreichte die
lokale PIN-/Passkey-Sperre und wurde nicht umgangen. Der freigegebene Reverse
stellte das gesicherte Legacy-Sourcepreimage und `verify_jwt=true` bytegleich
als v56/v57 wieder her. Der aktuelle providerseitige Bundler erzeugte dabei
`cfd5dd51...0bbb` statt `914d5f8b...3182`; Supabase bietet keine Aktivierung
historischer Versionen. F42 ist deshalb offen. SQL26 wurde anschließend mit
`79ec07cd...5299` erfolgreich auf SQL25 `f7226f6a...b3c3d` und alte ACL
zurückgerollt; V1 65/`859a0619...cbef7`, V2 0/0/0 und Advisors 4 WARN/8 INFO
sind grün. Kein Reportwrite; Protein, Trendpilot, Workflows, Git und Web
blieben unverändert. Kein Continuation Gate; zwingender STOP vor Protein.

Re-entry `2026-08-24`: `PASS` für SQL26 und Monthly. SQL26 wurde nach grünem
Continuation Gate erneut definitionell und ACL-seitig exakt aktiviert. Der
bereits sichtbare, entsperrte Produktionstab ließ sich kontrolliert übernehmen.
Monthly v58/true/957159c0 ist ACTIVE; alle sieben Remotequellen sind bytegleich
zum freigegebenen lokalen Postimage, der anonyme Pfad liefert 401 und der
Userpfad erstellte erfolgreich einen kontrollierten neuen Bericht. Der
Range-Report blieb ein Singleton und wechselte erwartungsgemäß von 3d4b12d6
auf 5d5ec8b3. V1 blieb 66/cfddb1fa, V2 blieb 0/0/0. Continuation Gate zu
Protein `PASS`.

Protein-Gate `2026-08-24`: `STOP / SAFE REVERSE`. v23/false war ACTIVE, alle
sechs Quellen bytegleich, Public 401. F44 korrigierte den irrtümlich nur
maskierten lokalen Protein-Key und synchronisierte das gleichnamige GitHub-
Secret; der Named-Secret-`dry_run` lieferte 200/No-write und ließ Profil,
Activity und Body unverändert. Der echte sichtbare Userpfad benötigt einen
Body-Save. Das vollständig vorgefüllte unveränderte 11.08.-Preimage kollidierte
vor dem Proteinaufruf im Legacy-Body-Sync mit 409/Unique; kein Remote-Write.
Protein wurde deshalb auf das bytegleiche Legacy-Sourcepreimage v24/true
reversiert, Public 401 grün. Der providerseitige Bundlehash 5254b32e ist nach
dem akzeptierten Source-/Flag-Orakel diagnostisch. Trend/Workflow/Git/Web
nicht begonnen; kein Continuation Gate.

Protein-Re-entry `2026-08-24`: `WAIT / FORWARD ACTIVE`. Der tatsächliche
Browserzustand enthält genau einen entsperrten MIDAS-Produktionstab; ein neuer
Tab ist nicht erforderlich. Protein v25/false ist ACTIVE, Public 401 und der
Named-Secret-`dry_run` 200/No-write sind erneut grün. Der verbleibende echte
User-JWT-`dry_run` wird über die vorhandene App-Funktion ausgelöst und gibt nur
PASS/FAIL aus; bis dahin kein Continuation Gate zu Trendpilot.

Protein-Auth-Gate `2026-08-24`: `STOP / SAFE REVERSE`. Die ownerseitige
Timelapse belegt: kein Loginoverlay vor dem Aufruf, zwei 401-Antworten, danach
erst das durch `fetchWithAuth` ausgelöste Overlay. Read-only Discovery zeigt
null öffentliche JWKS-Keys; der gepinnte `@supabase/server@1.4.1`-Usermodus
verlangt JWKS sowie JWT-`alg`/`kid`. F45 ist damit ein realer P1-Auth-
Contractbruch, kein Bedienfehler. Protein wurde über ein bytegleiches
Legacy-Sourcepreimage zunächst als v26/false und anschließend mit explizitem
Originalflag als v27/true reversiert. v27 ist ACTIVE, Bundle 5254b32e exakt,
Public 401 grün; V1 66, Body 51, V2 0/0/0, Profil 1 und Range-Report 1
unverändert. Trend/Workflow/Git/Web nicht begonnen; kein Continuation Gate.

Kontingent-Freeze `2026-08-24`: `OWNER-PAUSED / SAFE FREEZE`. Der Owner
beendet die Ausführung bewusst bei 10 % verbleibendem Wochenkontingent bis zum
Reset. Dieser Freeze ändert keinen Produkt-, Auth-, SQL-, Consumer- oder
Rollbackvertrag und erteilt keine F45-Entscheidung. Bis zur Wiederaufnahme
werden keine R13-Code-, Env-, Secret-, SQL-, Edge-, Workflow-, Git-, Web-/PWA-
oder Deviceaktionen ausgeführt. Activity V1 bleibt im Alltag nutzbar und der
einzige produktive Capture-Pfad. Beim Re-entry sind zuerst Git/Worktree,
SQL26/ACL, Edge-Versionen/Flags/Sourcepreimages, JWKS-/Signing-Topologie,
geschützte Datenzähler, Zielworkflow-Runs, Pages-HEAD und Secretnamenstatus
read-only zu prüfen. Erwartbare neue V1-Einträge werden nicht verändert,
sondern vor dem nächsten produktiven Gate als neue Baseline bestätigt. Nur bei
grünem Drift-Check und ausdrücklichem F45-GO darf S5.6 fortgesetzt werden.

F45-Re-entry `2026-08-25`: `LOCAL PASS / PRODUCTIVE GATE IN PROGRESS`. Der
Owner hebt den Kontingent-Freeze auf und erteilt ausdrücklich GO für die
Legacy-Signing-Variante sowie bei grünem F45-Gate für den bereits freigegebenen
Gesamtblock S5.6-S6. Der read-only Re-entry bestätigt HEAD/origin/Pages
`e3029629`, SQL26 `cffcd679`/`eb27ec44`/`abb59627` mit unveränderter Minimal-
ACL, Monthly v58/true, Protein v27/true/`5254b32e`, Trend v25/true und
JWKS-key_count 0. V1 bleibt 66/`cfddb1fa`, V2 0/0/0. Ein regulärer Body-Eintrag
vom 25.08. und seine Profilableitung werden als kanonische Alltagsnutzung auf
52/`2b52f3b3` beziehungsweise 1/`2d560902` neu baselined; keine Payload wurde
gelesen. Der heutige Legacy-Trendworkflow war vor dem Cutover erfolgreich und
kein Zielworkflow läuft. Pages besitzt keine stale laufenden Runs mehr.

D32 ersetzt ausschließlich den inkompatiblen lokalen User-JWT-Prüfer: Ein
vorhandener Bearer wird ohne Decoding über Supabase Auth `getUser(jwt)`
autorisiert und anschließend mit demselben Bearer an den User-RLS-Client
gebunden. Fehlgeschlagene Bearer fallen nie auf Schedulerauth zurück. Der
Named-Secret-Pfad bleibt target-spezifisch im gepinnten
`@supabase/server@1.4.1`; Legacy-Signing und globale Keys bleiben unverändert.
Hashes `520f5ca0`/`97125731`; Format/Lint/Check, Principal 7/7, Protein 6/6,
Trend 6/6, L07 5/5, eigenständiges Isolationstool, diff-check und nativer
Security-/Scope-Review sind PASS. CodeRabbit bleibt wegen ausgeschöpftem
S5-Budget bei null weiteren Läufen. Nächster Schritt ist der atomare
Protein-Forward mit Public-/Named-Secret-/echtem User-dry-run und vorbereitetem
Source-/Flag-Reverse.

Protein-F45-Forward `2026-08-25`: `PARTIAL PASS / USER DRY-RUN WAIT`.
Das bytegleiche v27-Legacy-Sourcepreimage und `verify_jwt=true` sind separat als
Reverse gesichert. Protein v28/`verify_jwt=false` ist ACTIVE; alle sechs
Remotequellen sind normalisiert bytegleich zum lokalen F45-Postimage. Public
liefert 401, der exakte `protein_targets_scheduler`-Dry-run 200/ok/dry_run und
keinen Write. V1 66/`cfddb1fa`, Body 52/`2b52f3b3`, Profil 1/`2d560902` und
V2 0/0/0 bleiben hashgleich. Der vorhandene entsperrte MIDAS-Produktionstab ist
verbunden und wurde nicht neu geladen. Bevor dessen reale App-Funktion den
bestehenden Login-Bearer an die eigene MIDAS-Supabase-Function sendet, verlangt
der Browserkanal eine unmittelbare Bestätigung der konkreten sensiblen
Übertragung. Bis dahin kein Trend-, Workflow-, Git- oder Webschritt; v28 bleibt
unter vorbereitetem Sofort-Reverse aktiv.

Browser-Handoff `2026-08-25`: `WAIT / OWNER ACTION`. Der Owner bestätigte die
konkrete Bearerübertragung unmittelbar. Die verbundene Browsersteuerung kann
den sichtbaren Produktionstab lesen und bedienen, isoliert aber dessen
JavaScript-Globale; der Versuch, den bereits bestätigten Aufruf im App-
Hauptkontext zu starten, wurde durch eine ausdrückliche Sicherheitsgrenze
abgewiesen, die Workarounds und alternative Browsersurfaces verbietet. Es wurde
kein Request ausgelöst. Deshalb bleibt ausschließlich der bereits bei C20
bewährte ownerseitige DevTools-Einzeiler offen; er protokolliert weder JWT noch
Payload, sondern nur `R13_F45_USER_SMOKE PASS` oder `FAIL` plus Status. Protein
v28/false und sein unverändertes No-write-Postimage bleiben bis zur Rückmeldung
unter vorbereitetem v27/true-Sofort-Reverse aktiv.

Protein-F45-Abschluss `2026-08-25`: `PASS / CONTINUE`. Der Owner führte den
payloadfreien DevTools-Aufruf im bestehenden MIDAS-Produktionstab aus und
übermittelte ausschließlich `R13_F45_USER_SMOKE PASS`. Damit bestehen
v28/false, sechs bytegleiche Quellen, Public 401, exaktes Named Secret und der
echte Legacy-User-Bearer gemeinsam. `ok=true` und `dry_run=true` belegen den
No-write-Vertrag; JWT, Claims und Fachdatenpayload wurden nie ausgegeben. V1,
Body, Profil, Range-Report und V2 blieben auf dem unmittelbar vorher
bestätigten Postimage. Das v27/true-Source-/Flag-Reverse bleibt bereit.

Trendpilot-F45-Forward `2026-08-25`: `PARTIAL PASS / USER DRY-RUN WAIT`.
Das bytegleiche v25-Legacy-Sourcepreimage und `verify_jwt=true` sind separat
als Reverse gesichert. Trendpilot v26/`verify_jwt=false` ist ACTIVE; alle
sechs Remotequellen sind normalisiert bytegleich zum lokalen F45-Postimage.
Public liefert 401, das exakte `trendpilot_scheduler`-Secret 200/ok/dry_run
und keinen Write. V1 66/`cfddb1fa`, Body 52/`2b52f3b3`, Profil
1/`2d560902`, Trend-State 2/`976373b6`, Trend-Events 0/`4f53cda1` und V2
0/0/0 bleiben hashgleich. Der lokale ignorierte Trend-Key wurde ohne
Wertausgabe vollständig aus der Control Plane synchronisiert. Vor S5.7 fehlt
nur der echte User-dry-run; bei Abweichung gilt der sofortige v25/true-Reverse.

Trendpilot-User-Smoke und Safe-Reverse `2026-08-25`: `STOP / SAFE REVERSE`.
Der ownerseitige payloadfreie DevTools-Aufruf erreichte v26/false über den
echten MIDAS-Userpfad und endete mit HTTP 500 beziehungsweise ausschließlich
`R13_F45_TREND_USER_SMOKE FAIL_CONTRACT 500`. Das Continuation Gate wurde
geschlossen; S5.7 blieb unberührt. Der erste Redeploy des gesicherten
bytegleichen v25-Legacy-Sourcepreimages erzeugte v27, behielt aber ohne
explizite Gegenangabe providerseitig `verify_jwt=false`. Dieser Teilzustand
wurde nicht als Reverse akzeptiert. Das temporäre Manifest wurde anschließend
ausschließlich für Trend explizit auf `verify_jwt=true` gesetzt und derselbe
Source als v28 erneut deployt.

Postcrash-Re-entry beweist ohne weitere Mutation den vollständigen Reverse:
v28 ist ACTIVE/true, Remoteindex `d16339afff5e399d...` exakt gleich dem
v25-Preimage, Public liefert 401; Bundle `f7a161a1...` bleibt gemäß F42 nur
diagnostisch. V1 66/`cfddb1fa`, Trend-State 2/`976373b6`, Trend-Events
0/`4f53cda1` und V2 0/0/0 sind unverändert. Kein Zielworkflow wurde manuell
gestartet oder läuft; HEAD, origin und Pages bleiben `e3029629`. F47 pinnt den
expliziten true-Reverse. F48 untersucht nun erst nach diesem sicheren
Postimage den 500 ohne Token-, Claim-, Secret- oder Gesundheits-Payloadread.

F48-Diagnose und Minimalfix `2026-08-25`: `PASS / FORWARD READY`. Die
payloadfreien Edge-Requestmetadaten zeigen beim echten Useraufruf vier Handler-
500 ohne vorgelagertes 401/403. D32 ist im produktiven Protein-Userpfad grün.
Der relevante Unterschied ist der Trend-State-Lesepfad: Der User-RLS-Client
benötigt im Dry-run vor jeder optionalen Writephase `SELECT` auf
`trendpilot_state`; produktiv fehlte dieses Tabellenrecht, während RLS und
genau eine Own-row-SELECT-Policy aktiv waren. SQL16 gewährt deshalb minimal nur
`SELECT` an `authenticated`; User-Insert/Update/Delete bleiben false und
Service-DML true. Ein PostgreSQL-17-Vollfixture, L07, diff-check und nativer
Security-/Scope-Review sind grün. Der einzelne produktive Grant bestand seinen
Fail-closed-Precheck und den Postcheck; V1 66/`cfddb1fa`, Trend-State
2/`976373b6`, Trend-Events 0 und V2 0/0/0 blieben unverändert. Security Advisor
bleibt bei vier bekannten WARN. Exakter Rollback ist der einzelne SELECT-
REVOKE; Trend bleibt bis zum kontrollierten Re-Forward sicher auf v28/true.

Trendpilot-F45-Re-Forward `2026-08-25`: `PASS`. Das
reviewte R13-Postimage wurde als v29 mit `verify_jwt=false` bereitgestellt.
Alle sechs Remotequellen sind normalisiert bytegleich; v29 ist ACTIVE, Bundle
`6ec69121...` diagnostisch. Public liefert 401 und der exakte
`trendpilot_scheduler`-Dry-run 200/ok/dry_run. V1 66/`cfddb1fa`, Trend-State
2/`976373b6`, Trend-Events 0 und V2 0/0/0 blieben hashgleich; User-SELECT ist
unter RLS aktiv, User-DML bleibt aus. Das v25/true-Reversepreimage ist weiterhin
vollständig deploybar. Kein Workflow-, Git- oder Web-/PWA-Cutover wurde
begonnen. Der ownerseitige payloadfreie echte User-dry-run im angemeldeten
MIDAS-Tab liefert `R13_F48_TREND_USER_SMOKE PASS 200`; der unmittelbare
geschützte Postcheck bestätigt erneut V1 66/`cfddb1fa`, Trend-State
2/`976373b6`, Trend-Events 0 und V2 0/0/0. F45/F48 sind geschlossen und das
Continuation Gate zu S5.7 ist `PASS`.

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

Abschluss `2026-08-26`: `PASS`. Commit B `4aa97f92` wurde mit exakt acht
Web-/PWA-Pfaden gepusht; Pages-Run `32962301099` ist erfolgreich. Fresh- und
v6→v7-Upgradeclient laden den finalen Productload ohne R14-Writer. Der neue
Arztbericht bis `2026-08-26` ersetzte ausschließlich den bestehenden
Range-Report-Singleton; Health Export V3 wurde über den sichtbaren Produktpfad
angestoßen. Finales geschütztes Postimage: Activity V1 66/`cfddb1fa`, Activity
V2 Sessions/Items/Sets 0/0/0, Report 1/`04619cae`, Profil 1/`e17f64da`,
Trend-State 2/`976373b6`, Trend-Events 0/`4f53cda1`. Monthly v61/true,
Protein v31/false, Trend v32/false und Incident v27/true sind ACTIVE; beide
Zielworkflows und Pages sind grün, 0 inflight. Die Advisor-Watchlists bleiben
bei vier bekannten Security-WARN und acht Performance-INFO; kein neues P0/P1.

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
| T-ACT-R13-01 | lokal | Shared Auth/Principal Matrix | PASS | EV-ACT-R13-L01 |
| T-ACT-R13-02 | disposable | SQL25/26 Fresh/Rerun/Drift/Auth/RLS/Rollback | PASS | EV-ACT-R13-L02 |
| T-ACT-R13-03 | Browser | Doctor/Health V3 Desktop/390/320 Fresh/Upgrade | PASS | EV-ACT-R13-L03 |
| T-ACT-R13-04 | Edge lokal | Monthly Report V1/V2/Mixed/Empty/Error | PASS | EV-ACT-R13-L04 |
| T-ACT-R13-05 | Edge lokal | Protein User/Secret/Formula/Cooldown/Error | PASS | EV-ACT-R13-L05 |
| T-ACT-R13-06 | Edge lokal | Trend User/Secret/373/400/Legacy/N+1/Error | PASS | EV-ACT-R13-L06 |
| T-ACT-R13-07 | Workflow/Scope | Header, HTTP fail, Secret-, Productload-, R14-Orakel | PASS | EV-ACT-R13-L07 |
| T-ACT-R13-08 | produktiv read-only | Baseline und Preflight | PASS | EV-ACT-R13-PRE01..PRE10 |
| T-ACT-R13-09 | produktiv write | Keys, SQL, Edge, Workflow, Web | PASS | EV-ACT-R13-W00..W10/C41-C44; Commit A/B, zwei Workflows und Pages PASS |
| T-ACT-R13-10 | produktiv | vollständiges Postimage und Rollbackbereitschaft | PASS | EV-ACT-R13-C45/R01-R07; V1 stabil, V2 0/0/0, alle Reverseartefakte dokumentiert |

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
