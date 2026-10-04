# MIDAS Activity V2 R15 Prepared Session Template Import V1 Roadmap

## Metadaten

| Feld | Vertrag |
| --- | --- |
| ID / Form | ACT-R15 / BLUEPRINT Rolling Wave mit lokaler S1–S6-Struktur |
| Owner / Dokumentationsowner | Stephan / MIDAS |
| Status | DONE / 2026-10-04; S5 LOCAL PASS, Pages v32 gebaut, Owner-Abnahme mit dokumentierten Nachweisgrenzen, S6 PASS |
| BLUEPRINT / Produkt-Freeze | BLUEPRINT-1 / 2026-09-27; Produktrevision R15-2 vom 2026-10-03 |
| Erstellt / überarbeitet | 2026-08-29 / 2026-10-04 |
| Baseline | 41e18071b588a3f070743ad268cc1a246d502140; main nach C4-Git-Abschluss |
| Risiko / Größe | R2: Dateiinput, Lifecycle und lokaler Cache; vorläufig medium, S4R bestätigt Gesamtaufwand |
| Autonomie | Vollständige R15-Restfreigabe am 2026-10-04: Publikation, S6, DONE/Archiv, vollständiger Worktree-Commit und Push; erfolgreiche Live-Server-Abnahme durch Owner |
| Endpunkt | DONE; keine weitere Ausführungswelle. T06/T07 OWNER_ACCEPTED_WITH_EVIDENCE_LIMITS, keine unabhängig bewiesenen Produktiv-/Android-Smokes |
| Modell / Reasoning | Vertragsziel GPT-5.6 Sol; Erstellung/Initialreview Extra High; tatsächlich NOT_OBSERVABLE |
| Ausführungsrouting | G0–S4R High, S4 High, S5 High; produktiver Cutover Extra High, S6 Medium; kein behaupteter Wechsel |
| Review | S4 Delta/Consumer; S5 finaler Full Review, 1 CodeRabbit-Initiallauf und höchstens 1 begründete Verifikation |
| Evidence | [R15 Evidence](<MIDAS Activity V2 R15 Prepared Session Template Import V1 Evidence (DONE).md>), zentral für Lifecycle-/Rollback-/Runtime-Nachweise |
| Projektvertrag | [MIDAS Workflow](<../templates/MIDAS Roadmap Workflow Contract.md>), Root-AGENTS und installiertes KASRKIN |
| Archiv | Roadmap und Evidence unter docs/archive/ mit Suffix (DONE), S6 abgeschlossen |

Routing: abhängige Discovery-, lokale Umsetzungs-, Prüf- und Publikationswellen.
Ein Execution Child ist zunächst nicht nötig: ein Komfortfeature, keine SQL-
oder medizinische Vertragsänderung. S4R begründet ein Child nur bei neuem Risiko.

## Startkarte

- Intent: Export der letzten sechs Monate oder länger mit Codex/LLM besprechen,
  bestehenden Plan beibehalten oder vorhandene Übungen tauschen, JSON am Handy
  auswählen und sofort eine normale editierbare Session erhalten.
- Abschlussauftrag 2026-10-04: volle Freigabe der Restarbeiten, Dokumentation, KASRKIN-Übergabe, DONE/Archiv sowie Commit/Push des gesamten Worktrees; Owner meldet erfolgreichen Live-Server-Test. EV-R15-P01/D01/S6 hält die tatsächlichen Nachweisgrenzen fest.
- G0, S1–S4R, W2/W3, S5 LOCAL und S6 sind abgeschlossen. Pages v32 ist unter dem geprüften Produktcommit gebaut; die Roadmap ist archiviert. Keine nächste Welle.
- Minimaler Einstieg: Root-AGENTS, Metadaten/Resume, Receipt/Findings,
  aktueller Block, git status und relevanter Diff; README und lokales Overlay
  gemäß Projektvertrag. Unveränderte Vertragsquellen über Receipt wiederverwenden.
  Archive nur für Abschluss/Postimage, weitere Quellen nur für konkrete Fragen.
- Dirty Boundary beim Authoring: sauberer Worktree, leerer Index. Danach nur
  diese Roadmap/Evidence, gezielte zukünftige R15-Masterplanpassagen und eine
  separat beauftragte KASRKIN-Ideennotiz. Fremde Änderungen stets schützen.
- Ursprünglich separate Owner-Gates wurden durch die ausdrückliche R15-Restfreigabe geschlossen. Es wurden keine neuen produktiven Gesundheits-/Cache-/Recovery-Testwrites oder Android-Aktionen ausgeführt. Die Abschlussabnahme akzeptiert die verbleibenden Nachweisgrenzen; keine C4-Freigabe wird auf R15 übertragen.
- Stop: P0/P1, unbekannter Writer-/Recoveryvertrag, fehlende Toolfähigkeit für
  den bevorstehenden Block, Scopeausweitung oder nicht zugelassener ganzer Block.
- Reasoning bleibt NOT_OBSERVABLE, solange die tatsächliche Stufe nicht prüfbar ist.

## Sources of Truth und Context Receipt

| Quelle | Stand / Read-Abdeckung / gültige Aussage |
| --- | --- |
| [BLUEPRINT](<../../../codex-tools/docs/blueprint/ROADMAP_AUTHORING_CONTRACT.md>) und Rolling-Wave-Form | BLUEPRINT-1, COMPLETE: Routing, Readiness, Freeze, Reuse und Closure |
| [ATLAS-Preflight](<../../../codex-tools/environment/README.md>) | COMPLETE; benötigte Abschnitte der Workstation-SoT FOCUSED_COMPLETE |
| [Lokale Templates](../templates/README.md), [Workflow](<../templates/MIDAS Roadmap Workflow Contract.md>) | COMPLETE; ursprüngliche Sammelausgabe TRUNCATED, vollständiger Folge-Read in Abschnitten erfolgt |
| Root-AGENTS / README | AGENTS COMPLETE als aktueller Vertrag; README FOCUSED_COMPLETE: Single-User, Ownership, geringe Reibung |
| [Activity Overview](<../modules/Activity Module Overview.md>) | FOCUSED_COMPLETE: heutiger C4-Vertrag; keine historischen R14-Nullstände als aktuellen Zustand übernehmen |
| [Masterplan](<../Future trainingsmodule update thoughts.md>) | FOCUSED_COMPLETE: Vorlagenvertrag, R15 und O-9; R15-2 synchronisiert nur zukünftige Produktpassagen |
| [R14 Roadmap](<MIDAS Activity V2 R14 Capture Cutover and Android PWA Validation Roadmap (DONE).md>) / [Evidence](<MIDAS Activity V2 R14 Capture Cutover and Android PWA Validation Evidence (DONE).md>) | Archive vorhanden; Abschluss-/Postimage-Anteile in G0 gezielt validieren, keine alten Vollmatrix-Retests |
| [C4 Roadmap](<MIDAS Activity V2 C4 Activity Truth and Protein Relevance Roadmap (DONE).md>) / [Evidence](<MIDAS Activity V2 C4 Activity Truth and Protein Relevance Evidence (DONE).md>) | G18/G19/G20 und git-closure-context-receipt: abgeschlossen; 52 Quellen beim Git-Abschluss erhalten, G0 prüft nur relevante Drift |
| Productcontroller / Draft / Recovery / Semantik / Coachingexport | FOCUSED_COMPLETE: Einstieg, normale Draftkomposition, getrennte Cachegrenze, vorhandene Übungsschlüssel; Detailverdrahtung in S1 |
| [QA-Suite](../qa/health-capture-reports.md) | In S1 nur Activity-/R15-relevante Klauseln und freie neue ID prüfen |

Current C4-Handoff: Activity V2 ist einziger Capturewriter; SQL27 und Protein-
Edge32, Root-SW v31. Code-Runtime 0663835 wurde mit unverändertem Produktcode
in main 41e1807 integriert. Öffentlicher Pages-Zugang ownerbestätigt; Score
7 → 8 → 7. Fehlende ursprüngliche Test-Vorabnachweise bleiben dokumentierte
C4-Protokollabweichung, Android OWNER-WAIVED; keine R15-Devicefreigabe.
R15 übernimmt protein_target_relevant=true und die bewusste vorhandene
Userentscheidung; Vorlagen enthalten keine Protein-Relevanz.

Fingerprint-Receipt des Authorings und Preimages:
.kasrkin/work/r15-authoring-2026-10-03/context-receipt.json.
Es ist ein lokaler Cache; die Roadmap und Sources of Truth bleiben maßgeblich.
Bei fehlendem Receipt nur die benötigten Originale öffnen.

| Kritische Quelle | SHA-256 vor R15-Implementierung |
| --- | --- |
| session-draft.js | f685329d646c4310ef6a0c7251fa4b9625674595e3977c888b29de6da9daa144 |
| session-recovery.js | d57ff86f1caef09145db375566aba1b01dbfdfb20e5cd6a006adcfafb8f38fc3 |
| semantics-v2.js | cf828d91f940f5d575c484dbedca3971cf8127e4f6cda0207dc8527db23ab4b4 |
| activity-product-controller.js | eded07ed4bc55034793a85a24dfeb1c89dfb352ecfa6230699af55ab7bb89ddd |
| activity-coaching-export.js | df4870bfe6e50c73abc5804ca5dd295abaad8c401b1658ba0fcc6af506001c4c |

Pfadbasis: app/modules/vitals-stack/activity/v2/. Ein abweichender Fingerprint
invalidiert nur den betroffenen Receiptpunkt. Historische Pre-G0-Hashes von
2026-08-29 sind durch C4 teilweise überholt und keine neuen Blocker.

### ATLAS-Capability-Preflight

Prüfdatum 2026-10-03; keine Installation, Authentifizierung oder Review gestartet.

| Capability / Zweck | ATLAS-Abschnitt / lokaler Nachweis | Status / Grenze |
| --- | --- | --- |
| Git / Diff und Schutz | Git; git --version: 2.55.0.windows.2, HEAD und sauberer Index geprüft | AVAILABLE_VERIFIED für Planung; keine Pushfreigabe |
| PowerShell / lokale Gates | Windows PowerShell; 5.1.26100.9444 | AVAILABLE_VERIFIED |
| Node / direkte Contracttests | Node.js und npm; node --version: v24.18.0 | AVAILABLE_VERIFIED; keine neuen Packages erforderlich |
| Python / lokaler HTTP-Server | Python und Deno; python --version: 3.14.6 | AVAILABLE_VERIFIED |
| KASRKIN / Admission | Lokales Overlay und Activation/2; Receipt, Bootstrap, Binding, Shim, Aktivierungsquellen geprüft, frische VALID-Telemetrie | AVAILABLE_VERIFIED für dieses Authoring; bei Ausführung frisch |
| Browser / echte UI-Kette | Playwright; playwright.cmd --version: 1.61.1 | CLI AVAILABLE_VERIFIED; Browserstart AVAILABLE_UNVERIFIED_OR_STALE, einmal vor der erforderlichen Browserwelle verifizieren |
| CodeRabbit / S5 | CodeRabbit; kanonischer Shim auflösbar unter C:/Users/steph/.local/bin/coderabbit.cmd | Command AVAILABLE_VERIFIED; Auth/Budget AVAILABLE_UNVERIFIED_OR_STALE, nur vor S5 prüfen |
| Pages-Publikation | Git und vorhandener C4-Publikationspfad | AVAILABLE_UNVERIFIED_OR_STALE für R15; gezielter Preflight am Owner-Gate |
| Android | Nur separat freigegebener Smoke; vorhandene C4-Ausnahme nicht übernehmen | AVAILABLE_UNVERIFIED_OR_STALE; Owner entscheidet Smoke oder transparente Deferral |
| SQL, Supabase CLI, Deno, Docker, neue Secrets | Kein R15-Backend-/Setup-Scope | NOT_REQUIRED |

READY_FOR_G0 bezieht sich auf den belegten lokalen Leseblock. S4R/S5/
Publikation dürfen ihre jeweils erforderlichen noch offenen Capability-Nachweise
nicht überspringen. MISSING/INCOMPATIBLE → OWNER_TOOLING_DECISION_REQUIRED,
kein automatisches Setup und kein READY für den betroffenen Block.

## Produktvertrag R15-2

### Bedienung

1. Neben Export steht Import. Klick öffnet direkt die Dateiauswahl.
2. Eine vollständig gültige ausgewählte Datei startet unmittelbar die normale
   Session mit allen Übungen in ihrer Reihenfolge. Keine Vorschau, kein zweiter
   Training-starten-Button und keine zweite Dateiauswahl.
3. Der Planname ist harmlose sichtbare Herkunftsmetadaten in der Trainingsfläche.
   Er erzeugt keinen neuen Persistenzvertrag oder vorgeschriebene Sessionnotiz.
4. Abgebrochene Dateiauswahl und ungültige Datei erzeugen keinen neuen Draft,
   Timer, Lookup oder Vorlagencachewrite. Fehler werden verständlich angezeigt.
5. Letzten Plan laden startet den einen lokal gespeicherten Plan ebenfalls
   direkt nach vollständiger Revalidierung. Ohne gültigen Plan ist dieser Weg
   deaktiviert oder verborgen; Import und freies Training bleiben bedienbar.
6. Aktiver, veränderter oder recoverter Draft wird niemals still ersetzt.
   Vor Dateiauswahl gilt der vorhandene Fortsetzen-/Verwerfenvertrag; nach
   asynchronem Lesen wird erneut geprüft. Ablehnung bewahrt den vorhandenen Draft.
   Das ist die einzige notwendige Konfliktentscheidung, keine allgemeine Vorschau.
7. Dateievents gehören zur aktuellen Controller-/Owner-/Lifecyclegeneration.
   Doppelklick, überholte Auswahl, unmount, logout und Ownerwechsel dürfen keine
   veraltete Session oder fremde Cachekopie veröffentlichen.

### JSON und LLM-Arbeitsablauf

Grundlage ist ausschließlich der vorhandene Coachingexport der letzten sechs
Monate oder länger. Der Chat bespricht Progress und gesundheitlichen Kontext;
ein unveränderter Plan ist genauso gültig wie ein Tausch vorhandener Übungen.
Keine Änderung des Exports, kein Kataloganhang und kein In-App-Coach.

Exaktes Schema midas.activity-session-template.v1; Root-Keys ausschließlich
schema_version, catalog_version, name und items. catalog_version ist eine
positive sichere Ganzzahl und entspricht dem tatsächlich geladenen Katalog.
name wird getrimmt und auf 1–80 Zeichen begrenzt. items enthält 1–50 Records
mit exakt item_order und item_key, lückenlos geordnet ab 1. Keys müssen aktive,
eindeutige Einträge des aktuellen Katalogs sein; keine erfundenen Ersatzkeys.

Anzeigenamen ausschließlich als Text rendern, keine HTML-Interpretation.
Maximal 64 KiB Dateigröße vor dem Lesen/Parsen; strikte Objekte/Arrays,
Keysets und sichere Zahlen prüfen. Unbekannte Felder, Duplikate, falsche
Version, inaktive/unbekannte Übungen und Prototypmanipulation werden vollständig
abgelehnt. MIME/Endung sind nur Auswahlhilfen. Keine Sets, Soll-/Ist-Leistungen,
Proteinentscheidung, User-ID, Dateipfade oder Authdaten aus der Datei übernehmen.
Eine gültige Beispieldatei und ein maschinenlesbares Schema entstehen in S4.
Ihr Übungsvokabular stammt aus bereits erfassten gültigen Übungen.

### Normaler Sessionpfad und letzter Plan

- Vor sichtbarer Veröffentlichung vollständig validieren und einen normalen
  Draft über die bestehende Factory/addItem-Semantik komponieren.
  ITEM_LIMIT bleibt 50; der vorhandene Timer beginnt beim ersten übernommenen
  Item. Kein neuer Timer oder zweiter Session-/Recovery-/Commitpfad.
- Ein Kompositionsfehler lässt den isolierten Kandidaten unveröffentlicht.
  Recoverywrites und Lookup erst über die akzeptierte normale Sessiongraph-
  Integration; kein sichtbarer Teilimport.
- Alle aktuellen Leistungsfelder bleiben leer. R4 zeigt bisherige reale
  Leistungen; Editoren, freie Änderungen, R7-Recovery, R8-Save und R9-History/
  Correction/Delete funktionieren wie bei manueller Übungsauswahl.
- Nach erfolgreicher Sessionübernahme speichert ein eigener IndexedDB-
  Komfortcache genau last_used_template als normalisierten Inhalt pro Owner.
  Cache-DB logisch getrennt: kein Store/Versionsupgrade in
  midas_activity_v2_recovery, dessen Version 1, session_recovery/active_session.
- Cachewrite ist atomarer Replace. Cachefehler oder Quota verhindern keinen
  validierten Start; kurze Meldung zur fehlenden Wiederverwendung genügt.
  Sessionänderung/Save/Correction/Delete und erneutes Laden verändern die
  gespeicherte Vorlage nicht. Nur erfolgreicher Import einer neuen Datei ersetzt sie.
- Cachezugriff nutzt vorhandene Owneridentität; fremde/veraltete/kaputte Records
  werden nicht geladen. Keine neue Autharchitektur. Im Browser keine unbegrenzt
  wartenden Cachezugriffe; Timeout-/Fehlergrenze in S2 verbindlich festlegen.
- Offline-Wiederverwendung funktioniert bei geladenem Katalog und gültigem
  bestehendem Ownerkontext. Kein neuer Login oder Historytransport erforderlich;
  fehlender Last-Performance-Lookup darf die normale Offlinegrenze nicht ausweiten.

### Scope und Invariants

In Scope: Parser/Schema/Beispiel, Import- und Last-Plan-Einstieg, lokaler
Komfortcache, normale Draftintegration, minimale CSS/Productload/SW-Verdrahtung,
relevante Tests, Review, gezielter Deploymentplan und Doku.

Erwartete Consumer: activity-product-controller.js, session-draft/-shell/
-recovery, R4-Lookup, bestehender R8-Transport, index.html/service-worker.js.
Neue Module nur für klar abgegrenzten Parser/Cachebedarf; keine Plattformschicht.

Unverändert/protected: Coachingexport, Katalog, SQL27, Edge32, Proteinrefresh,
Doctor/Reports/Trendpilot, Auth/Scheduler, produktive Trainingsdaten und
R7-Recovery-DB. Keine Planbibliothek, Planeditor, Exporterweiterung, neue
Maschinen/Keys, Soll-Leistungen, Supabase-Plantabelle, MCP-Write, Share Target,
File Handler, Paketinstallation oder Android-Neubuild als V1-Voraussetzung.
Die beobachtete Meldung „Activity V2 ist derzeit nicht verfügbar“ nach Abbruch
bleibt auf ausdrücklichen Ownerwunsch außerhalb dieses Scopes; erfolgreiche
Importverdrahtung darf dennoch nicht auf einem unbedienbaren Einstieg beruhen.

## Entscheidungslog

| ID / Datum | Entscheidung / Wirkung |
| --- | --- |
| D-ACT-R15-01 / 2026-08-29 | Identität/Reihenfolge; keine Leistungsvorgaben. Gültig. |
| D-ACT-R15-02 / 2026-08-29 | Historisch Vorschau plus Bestätigung; durch D-ACT-R15-09 ausdrücklich supersediert. |
| D-ACT-R15-03 / 2026-08-29 | Nur aktuelle Katalogversion. Gültig. |
| D-ACT-R15-04 / 2026-08-29 | Normalisierten Inhalt statt Dateipfad speichern. Gültig. |
| D-ACT-R15-05 / 2026-08-29 | Last Plan ist Komfortcache, keine Recoveryquelle. Gültig. |
| D-ACT-R15-06 / 2026-08-29 | Freies Training gleichwertig erhalten. Gültig. |
| D-ACT-R15-07 / 2026-08-29 | Keine Planbibliothek/Share Targets/File Handler. Gültig. |
| D-ACT-R15-08 / 2026-08-29 | G0 gegen R14-/C4-DONE vor Ausführung. Gültig. |
| D-ACT-R15-09 / 2026-10-03, Owner | Import neben Export; Dateiauswahl ist Startabsicht, direkter Start ohne Vorschau/Bestätigung; Last Plan ebenfalls direkt. |
| D-ACT-R15-10 / 2026-10-03, Owner | Bestehender Export genügt; keine Zusatzkatalogdatei/Exportänderung. Beibehalten eines Plans ist gültiges Ergebnis. |
| D-ACT-R15-11 / 2026-10-03, Owner | Keine Reparatur der bestehenden Abbruch-Statusmeldung in R15. |
| D-ACT-R15-12 / 2026-10-03, Owner | Kleinstmöglicher belastbarer Prüfaufwand; konkrete Invalidation statt Wiederholung aus Gewohnheit. |

## Gates und Aufwand begrenzen

KASRKIN nach aktueller Projektbindung/Activation/2 konsultieren. In jedem neuen
PowerShell-Prozess command.json, Binding, Installationsreceipt und Bootstrapbytes
verifizieren; ausgewählten Bootstrap mit -ProjectRoot ausführen und Shimauflösung
prüfen. Kanonischer Refresh: kasrkin validate -Refresh -Envelope; reguläre
Admission über kasrkin gate -PlanPath ... -BlockId .... Gate kann bereits frisch
messen: einen belastbaren Checkpoint verwenden, keine zusätzlichen Messschleifen.

Bei CAUTION oder abgelehntem Primärblock ausschließlich die installierten
Endphase-Regeln: vollständiger eingefrorener Plan, -Endphase -Start, erlaubte
effectiveDecision und persistiertes Permit vor Arbeit; denselben Permit nach
Checks/Review/Evidence/Closure mit -CompletionPath schließen. Keine Übernahme
veralteter SMALL-/Ein-Block-Cautionregeln als zusätzliche Endphase-Sperre.
Keine Bucket-/Reset-/Reserveannahme, Paid-Credit-Erlaubnis oder C4-Ausnahme.
Bei LIMIT oder 0 % ausschließlich sichere Abschlussantwort, keine weiteren Tools.

### Verbindlicher Sparsamkeitsvertrag

- Jeder Read/Toollauf braucht eine konkrete offene Frage, Mutation oder
  vorgeschriebene Postcondition. Keine pauschale Inventarisierung.
- Unabhängige Suchen/Reads und Tests bündeln; Ausgaben klein halten.
  Truncation gezielt nachlesen und als unzureichend markieren.
- Kein Refresh innerhalb eines laufenden atomaren Blocks und keine Gates
  pro Datei, Testfall oder kleinem Substep.
- Full Review bedeutet vollständige R15-Vertragsabdeckung, kein Repo-Full-Read.
- S4 nur direkte Delta-/Consumer-Checks; kein separater S4.5-Abschlussreview,
  keine vollständige Browsermatrix und kein CodeRabbit.
- S5 übernimmt gültige S4-Testresultate per Hash/ID. Kein Vollrerun vor oder
  nach CodeRabbit ohne konkrete Invalidation; universelle günstige Hygiene bleibt.
- Jeder Retest nennt zuerst geänderte Quelle/Finding → invalidierte Test-ID.
  Unveränderte C4-SQL-/Protein-/Doctor-/Scorezyklen werden nicht erneut ausgeführt.
- Neue Tests sollen unabhängige Fehlergrenzen prüfen, keine triviale Spiegelung
  der Implementierung. Keine rein kosmetischen Tests oder Browser-Kreuzprodukte.
- Evidence an einem Ort, Resume/Receipt ersetzen den letzten Stand; keine
  parallelen Logs in Roadmap, Masterplan und Modul-Dokus. Doku-Sync einmal in S6.
- Ownerfragen nur bei echter fehlender Entscheidung/Freigabe. Bestehende
  gültige Freigaben nutzen; nötige Ownerbedienung als eine exakte Operatoranweisung.
- Keine starre erfundene Toolcall-/Tokenquote. Mehr Prüfaufwand nur für benanntes
  Risiko, tatsächliches Finding oder einen verpflichtenden Gate-Nachweis.

## Wave- und Statusmatrix

| Wave / Schritte | Scope / nächstes Gate | Status / Child |
| --- | --- | --- |
| W0 / G0 | R14/C4-Handoff, Fingerprintdelta, aktueller Contract Review | PASS_G0; EV-R15-G0, kein Child |
| W1 / S1, S2, S3, S4R | bestehende APIs, frozen Produktvertrag, Risiken, vollständige Wellenplanung | PASS S1/S2/S3/S4R; eigene Gates belegt, kein Child |
| W2 / S4.1–S4.2 | Parser/Schema/Beispiel plus eigener Last-Plan-Cache | PASS W2; T01/T02 und Consumerreview belegt |
| W3 / S4.3–S4.4 | direkter Import, normale Draftintegration, Productload/CSS/Offline/SW | PASS W3; T03/T05 und Consumerreview belegt |
| W4 / S5 LOCAL | integrierte relevante Matrix, nativer Full Review, CodeRabbit | PASS_LOCAL; gültige direkte/Browsertests und vollständiger Review, EV-R15-W4C2 |
| W5 / S5 PRODUCTIVE | freigegebene Publikation, Owner-Abnahme, vorbereiteter Rückfall | PAGES_BUILD_PASS / OWNER_ACCEPTED_WITH_EVIDENCE_LIMITS; EV-R15-P01/D01 |
| W6 / S6 | gebündelte Doku, finales Receipt, echte Closure und Archiv | PASS_DONE; EV-R15-S6, FINAL2 regulär zugelassen |

Nach jedem ganzen Block Postconditions, Findings, Evidence und Resume abschließen.
Späteren Scope vor Start konkretisieren; Ablehnung nie durch künstliches Zerlegen
umgehen. S4R forecastet Reads, Tools, Browser, Review, troubleshooting und Closure;
keine Aussage „klein, weil wenige Dateien“. Kein Kostenwert aus C4 automatisch
als vergleichbare R15-Kostenreceipt übernehmen.

### G0–S4R

- G0: Archive und relevante Abschluss-/Postimages prüfen, C4-Git-Receipt nur
  bei exakter Deckung nutzen; aktueller Writer, SW/Productload und C4-Defaults.
  Erwartete C4-Hashänderungen gegenüber R14 sind Rebaseline, kein Vollretestgrund.
  Contract Review schließt F-R15-01/02 und aktiviert erst dann die Roadmap.
- S1: die echte Import-Einstiegsfläche und aktive Listener/Lifecycle kartieren,
  normale Draft-/Recoveryübernahme, R4-Lookup, Katalog und getrennte Cachegrenze.
  Keine API allein aus diesem Plan als vorhanden voraussetzen.
- S2: striktes Schema/Limits/Fehlercodes, direkte Startzustandsmaschine,
  Generation-/Busyguards, Konfliktentscheidung, Cache-Timeout/Ownerbindung.
  Alle Items vor Veröffentlichung validieren; vorgeschlagene Namens-/Cache-
  Details technisch konkretisieren, ohne erneute Produktentscheidungsrunde.
- S3: Parser-/Dateifehler, Race/Logout/Unmount, geschützter Draft, Cachefehler/
  Fremdowner und Offlinegrenzen auf die Testgruppen unten abbilden.
- S4R: tatsächliche Dateiliste, Größe, Reviewtiefe, volle W2/W3/W4/W5-Postconditions,
  günstiger Productload-Precheck, Deploy-/Rollbackfingerprints und Browserfähigkeit.
  Verwendbares Kostenprofil/History für W4 und W5 prüfen; falls die installierte
  Admission einen Erstlauf-Ownervertrag verlangt, vor dem Start genau dessen
  endlichen Scope und Budgetannahme vorlegen. Keine selbst erfundene Ausnahme.
  Androidentscheidung spätestens vor dem produktiven Block benennen.
- Je Hauptschritt ein nativer Full Contract Review im begrenzten Scope; bei PASS
  weiter innerhalb des Auftrags, ohne künstliche Pause. Exit S4R: umsetzungsreif,
  keine offenen Produktfragen/P0/P1. Anschließend Stop ohne Implementierungsauftrag.

### S4

W2: S4.1 Parser/JSON-Schema/realistische Beispieldatei und S4.2 separater
IndexedDB-Last-Plan-Cache. Direkte Contractchecks T-R15-01/02 und Consumer-Review.
W3: S4.3 Import-/Last-Plan-/Free-Flow, atomare normale Draftübernahme, aktive
Listener und Lifecycle; S4.4 minimale Productload-/CSS-/SW-Integration.
Direkte Checks T-R15-03 und T-R15-05, günstigster Wiring-Smoke. Keine neue
produktive Session, SQL/Edge-Änderung oder echte Android-Aktion.

### S5: einmalige integrierte Verifikation

Vor dem Browserlauf günstiges Orakel: lokaler Productload, erwartete Script-/
SW-Version, Harnessmodus und Transport-Stub stimmen. Bei Fehler nicht die
erwartbar falsche Browsermatrix starten.

| Test-ID | Unabhängiges Orakel / Umfang | Wann neu? |
| --- | --- | --- |
| T-R15-01 | Parser: gültig/geänderter/unveränderter Plan; Größen-/Namens-/Itemgrenze, malformed, extra Keys/Prototype, unsafe order/version, duplicate/inactive/unknown | Parser, Schema oder Kataloggrenze geändert |
| T-R15-02 | Echter disposable IndexedDB-Cache: ein Plan pro Owner, Replace, Fremdowner/alte Version/corrupt/quota/blocked, fail-soft Start, kein Update durch Sessionänderung | Cache, Ownerseam oder Updatezeitpunkt geändert |
| T-R15-03 | Controller: echte Datei-/Last-Plan-Aktion, Abbruch, Busy/Race/stale/logout/unmount, bestehender/recoverter Draft, atomare Übernahme und Free Flow | Listener, Controller, Draftübernahme oder Lifecycle geändert |
| T-R15-04 | Eine Browserwelle: Desktop und 390×844; echte DOM-Aktion → aktiver Listener → Dateilesen → Validator → Draft → Recovery/Lookup → normaler Save/Data Access/Transportstub; Defaults und leere Ist-Felder | betroffene Verdrahtung, Scriptload oder Shared Consumer geändert |
| T-R15-05 | Productload/SW-Verdrahtung und geschützte Recoverygrenze; Offline-Last-Plan/Reload auf einem mobilen Lauf; 320px nur Layoutcheck, kein dritter kompletter Funktionslauf | Asset-/SW-/Offline- oder Cachevertrag geändert |
| T-R15-06 | Nach freigegebener Publikation: Versionspostimage und ein realer Importstart ohne Speichern; genau dessen Entwurf über vorhandenen Verwerfungsweg bereinigen | tatsächlich anderer publizierter Build |
| T-R15-07 | Android-Dateipicker/Start/Last Plan nur nach Ownerfreigabe; andernfalls explizite OWNER-WAIVED/DEFERRED-Entscheidung, nie PASS behaupten | Device-/Dateipicker-Finding oder geänderter Devicevertrag |

T-R15-01/02/03 günstige Fälle datengetrieben je Gruppe bündeln, keine einzelne
Toolrunde pro Fall. T-R15-04 deckt die produktive Last-Mile-Kette im echten
isolierten UI-Harness mit nichtproduktiver Transportseam ab; Componenttests
allein genügen nicht. Ein vollständiges unsaved UI-Smoke wiederholt keine
produktiven Trainings-/Score-/Löschzyklen. Für Save/Correction/Delete und Export
bestehende Nachweise nutzen; geänderte direkte Consumer gezielt ergänzen.
Keine Speicherung eines importierten Plans als absolvierte Leistung.

Reihenfolge: erforderliche statische Hygiene → neue/invalidierte Gruppen und
gebündelte Browserwelle → nativer Full Code/Contract/Security/Privacy Review →
genau 1 initialer CodeRabbit-Lauf → relevante Findings gebündelt bewerten →
minimal korrigieren und nur invalidierte Tests → höchstens 1 begründeter
CodeRabbit-Verifikationslauf. Kein dritter Lauf ohne ausdrücklichen neuen
Auftrag bei neuem wesentlichem Risiko. Externes Review nur über coderabbit;
Fehler/Rate-Limit ehrlich dokumentieren, keine Ersatzinstallation.

S5 LOCAL Exit: integrierte Gruppen belegt oder wirksam ownerentschieden,
kein offenes In-Scope-P0/P1. W5 ist eine bereits vorab definierte separate
produktive Wirkung hinter Owner-Gate, kein Resttest zur Umgehung abgelehnter W4.

### Produktiver Owner-Block und Rückfall

Vor W5 eine kompakte Entscheidungsvorlage: exakter Diff/Forward/SW,
aktuelles Preimage, bekannte Daten-/Cachewirkung, Preflight, T-R15-06/07,
Rollback und Erfolgskriterien. Freigaben für Publikation/Push, notwendige
produktive lokale Cache-/Recovery-Testwrites und bedingten Rückfall benennen.
Keine produktive Trainingsspeicherung erforderlich.

Rückfall ist ein gezielter Forward-Build, der R15-Einstiege deaktiviert und
C4-Writer/SQL27/Edge32 bewahrt. Keine Rückkehr zum alten V1-Writer und keine
R7- oder Produktdatenlöschung. R15-Komfortcache darf ungenutzt bestehen bleiben.
Vorwärts-/Rollback-SW-Version monoton; Preimages und betroffene Assets vorab.
Erster Pflichtfehler: ausschließlich freigegebener Rückfall, Postchecks und
sicherer Finding-/Resume-Stand. Diagnose/Fix/Retry erst als eigener neuer Block.

### S6

Ownerfreigabe 2026-10-04: S6 und anschließend sämtliche Restarbeiten einschließlich Publikation, DONE/Archiv, Worktree-Commit und Push ausdrücklich beauftragt. Lokaler Doku-Sync und finaler Review sind abgeschlossen. Erfolgreicher Live-Server-Test wird als Owner-Abnahme mit den in EV-R15-P01/D01 benannten Grenzen übernommen; Android oder der exakte T06-Ablauf werden nicht als ausgeführt behauptet.

Activity Overview, nur betroffene Masterplanpassagen, neue Activity-QA-ID und
CHANGELOG unter Unreleased einmal synchronisieren. README/Runbook nur bei
wirklicher dauerhafter Änderung. Finaler nativer SoT-/Link-/Scope-Review,
Follow-up Postimage mit Quellenfingerprints, Evidence und Grenzen an einem Ort.
Produktiver Status wahrheitsgemäß festhalten; keine offenen Pflichtsmokes als PASS.
Roadmap/Evidence erst bei echter Acceptance als (DONE) archivieren.
Commit/Push sind separat freizugeben, lokale Fertigstellung ist kein Git-Gate.

## Findings, Invalidation und Initialreview

| ID | Einstufung / Status | Disposition |
| --- | --- | --- |
| F-R15-01 | G0-PRECONDITION / CLOSED_G0 | R14-DONE-Handoff in G0 gezielt belegen; kein schon behauptetes G0 |
| F-R15-02 | G0-PRECONDITION / CLOSED_G0 | C4-DONE/Postimage prüfen, dokumentierte Abweichung/Androidwaiver bewahren |
| F-R15-03 | CLOSED_OWNER_ACCEPTANCE / EVIDENCE_LIMIT | Neue R15-Abschlussabnahme akzeptiert verbleibende Devicegrenze; kein unabhängig belegter Android-T07-PASS und keine Übernahme des C4-Waivers |
| F-R15-04 | Out of scope / OWNER-DEFERRED | bestehende „nicht verfügbar“-Statusmeldung nach Abbruch; heute keine Diagnose |
| F-R15-05 | Authoring / RESOLVED | alte Vorschau-/Confirmpflicht durch direkte Startentscheidung ersetzt; aktive Klauseln konsistent |
| F-R15-06 | Authoring / RESOLVED | alte Cautionprojektion entfernt; exakter installierter Endphase-Vertrag maßgeblich |
| F-R15-07 | Usage / RESOLVED_OWNER_2026-10-04 | Restscope S5/S6 60/16 ownerbeauftragt, seriell bestätigt; W4 25/8 ENDPHASE_OWNER_ALLOWED mit persistiertem Permit; keine neue Episode/Reserve behauptet |
| F-R15-08 | S5 / CLOSED_C1 | CSS-Import und Parent/SW v32 konsistent; erweiterte tatsächliche CSS-Consumerprüfung T05 PASS |
| F-R15-09 | S5 / CLOSED_C2 | einzige begründete Verifikation0Issues, alle21R15Dateien in disposable Clone; Quellindex/HEAD erhalten |
| F-R15-10 | S5 / CLOSED_C2 | autorun=1 berichtigt; tatsächliche CSS-Ladekette/320px PASS, keine erneute funktionale Vollmatrix |
| F-R15-11 | CLOSED_WITH_EVIDENCE_LIMIT / BASELINE_HTTP404 | Pages-API bestätigt öffentlichen main-Build und Produktcommit; anonymer HTTP-Abruf bereits vor Publikation 404. Keine öffentliche Runtime-Postimage-/UI-PASSbehauptung, kein R15-Codefinding. Owner akzeptiert den Abschluss nach erfolgreichem Live-Server-Test |

Invalidation: Parser → T01; Cache → T02/T03/Offlineanteil T05; Controller/
Lifecycle → T03/T04; Scriptload/CSS/SW → betroffener T04/T05-Anteil;
Shared Draft/Recovery/Auth/Transportänderung → nur tatsächliche Consumer plus
S4R-Risikoprüfung. SQL-/medizinische Scopeänderung stoppt R15 für Ownerentscheidung.
Dokuänderung allein invalidiert keine funktionalen Tests. Alter PWA-Client ist
eine Productloadfrage, kein Grund für komplette Backend-Retests.

Initialer nativer Contract Review/Fresh-Chat-Test beim Authoring: Ziel,
Ownerentscheidungen, Scope, Preflightgrenzen, S1–S6, Last-Mile-Orakel,
Testreuse, Rollback und Gates geprüft. Keine Implementierung oder funktionalen
Checks ausgeführt. Status READY_FOR_G0 erfordert abschließenden Doku-/Link-
und Quellenpreservation-Check; sein Ergebnis steht in EV-R15-A01.
Vor G0 weder Roadmap ACTIVE noch S1/S4 abgeschlossen behaupten.

## Usage-Checkpoint und Resume Card

| ID / Block | Messzeit | 5h / Reset | Woche / Reset | Entscheidung |
| --- | --- | --- | --- | --- |
| U-A01 / Authoring | 2026-10-03 21:06:15+02 | 69 % / 1791067216 | 68 % / 1791617805 | CONTINUE / PRIMARY_ALLOWED; Evaluation 7d7c6e4e9d284e468a8b893627087567 |

| U-G0 | 2026-10-04T07:04:01.1300714+02:00 | 96 % / 1791107948 | 66 % / 1791617806 | CONTINUE / PRIMARY_ALLOWED; c1f55f4c07ee4beeb8f229d4a1c40e94 |

| U-R15-S1 | 2026-10-04T07:07:20.7096188+02:00 | 93 % / 1791107948 | 66 % / 1791617806 | CONTINUE / PRIMARY_ALLOWED; adbdf8221ebd480ab951b289798fbc51 |

| U-R15-S2 | 2026-10-04T07:10:42.6888774+02:00 | 89 % / 1791107948 | 65 % / 1791617805 | CONTINUE / PRIMARY_ALLOWED; 2071d922a1d14e428d6c8c5eb048ae54 |

| U-R15-S3 | 2026-10-04T07:11:49.7706688+02:00 | 89 % / 1791107948 | 65 % / 1791617806 | CONTINUE / PRIMARY_ALLOWED; 9c657bac8bbb4915a4e417047fdf70e5 |

| U-R15-S4R | 2026-10-04T07:12:58.0965222+02:00 | 88 % / 1791107948 | 65 % / 1791617805 | CONTINUE / PRIMARY_ALLOWED; fa2fc845f39e4283b31ee57de8c3aed8 |

| U-R15-W2 | 2026-10-04T07:14:57.4114854+02:00 | 87 % / 1791107948 | 65 % / 1791617806 | CONTINUE / PRIMARY_ALLOWED; 04b231b5d10845658b6b6f7b37669826 |

| U-R15-W3 | 2026-10-04T07:19:55.4579960+02:00 | 85 % / 1791107948 | 64 % / 1791617806 | CONTINUE / PRIMARY_ALLOWED; b9227a0f14bc4c718e18d0a8d225f6e4 |

| U-W4-Endphase | 2026-10-04T07:37:14.2357451+02:00 | 75 % / 1791107948 | 63 % / 1791617805 | REJECTED: COST_UNKNOWN, EPISODE_CAP_REACHED, PARALLEL_USAGE_NOT_EXCLUDED; kein Permit |

| U-W4C2-Start | 2026-10-04T08:06:16.6139724+02:00 | 62 % / 1791107948 | 61 % / 1791617805 | ENDPHASE_OWNER_ALLOWED, Permit9aaf60dd2f0b4870ac2a7a96d0d25901 |

| U-W4C2-Closure | 2026-10-04T08:13:07.7760284+02:00 | 59 % / 1791107948 | 60 % / 1791617805 | closed=true, anomalies=[], Permit vollständig geschlossen; alte profileBlocked-History bleibt |

| U-S6L | 2026-10-04T08:19:55.5379820+02:00 | 57 % / 1791107948 | 60 % / 1791617806 | CONTINUE / PRIMARY_ALLOWED, 0e649a7c28864fed9c6c41b8bcfa3a31; regulär, kein Endphase-Permit |

| U-FINAL2 | 2026-10-04T08:39:37.7879380+02:00 | 48 % / 1791107948 | 59 % / 1791617805 | CONTINUE / PRIMARY_ALLOWED, 81e567850b3c4a039d19cb57483e4703; vollständiger Abschlussblock, kein Endphase-Permit |

**Resume Card — 2026-10-04, DONE:**

- G0, S1–S4R, lokale Implementierung, S5 LOCAL und S6 abgeschlossen. Produktcommit `99f466e4e2433fc30d298b1883d87c0c11f46bb6` auf main gepusht; GitHub Pages meldet built für v32.
- Volle R15-Rest-/DONE-/Archiv-/Commit-/Pushfreigabe und erfolgreicher Live-Server-Test durch Stephan; tatsächliche URL, Gerät und T06-Ablauf nicht spezifiziert. T06/T07 OWNER_ACCEPTED_WITH_EVIDENCE_LIMITS, kein erfundener unabhängiger PASS.
- Roadmap/Evidence archiviert; Produktdokumentation synchronisiert. Context Receipt und abschließender Git-/Postimage-Receipt unter `.kasrkin/work/r15-execution-2026-10-04/`. Genau diese Karte ist aktuell.
- KASRKIN erhält ein manuelles, hashgeprüftes Dokumentenpaket unter `C:/Users/steph/.local/state/kasrkin/consumer-handoffs/midas-r15-2026-10-04/`; kein automatischer Import, keine Aktivierung der Ideennotiz und keine Kosten-/Statekorrektur.
- Nächste Aktion: keine. Historischer anonymer Pages-HTTP404 und fehlender unabhängiger Android-/T06-Smoke bleiben transparente Nachweisgrenzen. Git-Abschlussnachweis im final-git-receipt.json; keine erneute Test-/Reviewwelle.
