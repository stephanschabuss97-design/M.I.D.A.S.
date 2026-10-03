# MIDAS Activity V2 R15 Prepared Session Template Import V1 Roadmap

Vorbereitet nach `docs/templates/MIDAS Roadmap Workflow Contract.md`. Dieses
Dokument friert den R15-Produktvertrag ein, ist aber bis zum realen
R14- und C4-Postimage ausdrücklich noch nicht ausführungsbereit.

---

## Roadmap-Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Status | `DRAFT` |
| Ausführungsreife | `G0 PENDING: archivierte R14-/C4-Postimages prüfen; keine automatische Aktivierung` |
| Modul / Bereich | `Activity V2 / vorbereitete Session-Vorlage` |
| Owner / Kontext | `Stephan; persönliche Single-User-PWA` |
| Chat-Lebenszyklus | `Denkraum -> eigener Ausführungs-Chat nach R14 und C4` |
| Erstellt am | `2026-08-29` |
| Letzter Stand | `2026-10-03: C4-Handoff ergänzt; DRAFT bis eigenem G0` |
| Aktueller Schritt | `G0 nach R14 und C4` |
| Risikoklasse | `R2; in S4R finalisieren` |
| Standard-Reviewtiefe | `Consumer; S5 Full` |
| Ausführungsmodell | `GPT-5.6 Sol` |
| Reasoning-Standard | `High` |
| Reasoning-Ausnahmen | `keine vorsorgliche Erhöhung; Finding-basiert` |
| Autonome Discovery Wave | `S1-S4R nach bestandenem G0` |
| Autonomieprofil | `gated` |
| Maximal autonomer Endpunkt | `S5 lokal; Deploy und Android owner-gated` |
| Geplante Reasoning-Wellen | `G0-S5 High; S6 Medium` |
| Erwartete Arbeitsgröße | `medium; in S4R real bestätigen` |
| Externes Reviewbudget | `S1-S4: 0; S5: 1 Initial + höchstens 1 Verifikation` |
| Owner-Erklärmodus | `Briefing vor Produktdeploy; S6-Recap` |
| Betroffene Hauptdateien | `Activity-V2-Controller/Shell, Import/Cache, index.html, service-worker.js, Tests/Doku` |
| Deploy relevant | `ja; Web/PWA owner-gated nach grünem S5` |
| Produktive Schreibwirkung | `keine Remote-Wirkung; lokaler IndexedDB-Komfortcache` |
| Workflow-Vertrag | `docs/templates/MIDAS Roadmap Workflow Contract.md` |
| Usage-Continuation | `verpflichtend vor jedem Haupt- und kohärenten Block` |
| Evidence-Datei | `vorläufig nicht erforderlich; S4R prüft den realen Bedarf` |
| Gekoppelte Roadmaps | `R14-DONE- und C4-DONE-Postimage sind Eingangsbedingungen` |
| Evidence-Owner | `diese Roadmap, falls S4R eine Evidence-Datei verlangt` |
| Archivziel | `docs/archive/MIDAS Activity V2 R15 Prepared Session Template Import V1 Roadmap (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Vorbereitungsstatus und Aktivierungssperre

### C4-Handoff für G0 (2026-10-03)

- Eingang: [C4 Roadmap](<archive/MIDAS Activity V2 C4 Activity Truth and Protein Relevance Roadmap (DONE).md>)
  und [C4 Evidence](<archive/MIDAS Activity V2 C4 Activity Truth and Protein Relevance Evidence (DONE).md>),
  Follow-up Postimage Receipt, EV-C4-S5-G18/EV-C4-S6-G19.
- Runtime: Activity V2 einziger Writer; SQL27, Protein-Edge v32,
  main/Pages `06638359facf67c524294249cca170b0955955ef`, Root-SW v31.
- Default: `protein_target_relevant=true`, alte Payloads/Recovery ohne Feld
  ebenso. R15-JSON importiert keine Proteinentscheidung; importierte Drafts
  verwenden denselben normalen Draft-/Recovery-/Commit-/Correctionpfad.
- API/Export: `midas.activity-session.v1` bleibt kompatibel, additives Bool
  in History und vollständigem R10-Export. Nur Protein nutzt
  `activity_protein_days`/`activity_protein_days_for_owner`; SQL26 ungefiltert.
- Grenzen: Owner-Score `7 → 8 → 7`, Pages-Zugang bestätigt; Test-Vorabnachweise
  nicht aufgezeichnet, Android erlassen. Keine R15-Test-/Device-/Deployfreigabe.
- G0 revalidiert die Archive und passenden aktuellen Fingerprints. Writer-,
  Recovery-, Katalog-, Schema-, Relevanz- oder Consumer-Drift invalidiert den
  Handoff. Diese Synchronisierung ist weder ausgeführter G0 noch R15-Start.

- Dieses Gerüst bewahrt die am 2026-08-29 entschiedenen Verträge.
- Es darf nicht ausgeführt werden, solange R14 nicht mit Roadmap und Evidence
  als `DONE` archiviert und sein Postimage Receipt vollständig ist.
- Es darf ebenso nicht ausgeführt werden, solange C4 nicht als `DONE`
  archiviert und sein Protein-Relevanz-Postimage vollständig ist.
- G0 ersetzt alle vorbereiteten Annahmen durch reale R14-/C4-Fakten und führt
  einen erneuten Full Contract Review dieser Roadmap durch.
- Erst G0 darf den Status auf `ACTIVE` und den Startschritt auf S1 setzen.
- Kein heutiger Text behauptet einen produktiven Writer-, Service-Worker- oder
  Androidzustand, den R14 noch nicht bewiesen hat.

## Ausführungs-Chat-Startkarte

- Auftrag:
  - `Nach R14 und C4 zuerst G0 ausführen. Nur bei PASS R15 deterministisch abarbeiten.`
- Modell und Reasoning:
  - `GPT-5.6 Sol / High.`
- Kontextübergabe:
  - `PASS für den vorbereiteten Vertrag; BLOCKED für die Ausführung bis R14.`
- Verbindliche Lesereihenfolge:
  1. `Diese Startkarte, Metadaten und Resume Card`
  2. `README.md, AGENTS.md und docs/DEV_ENVIRONMENT.md`
  3. `docs/templates/MIDAS Roadmap Workflow Contract.md`
  4. `archivierte R14-Roadmap und R14-Evidence, nur Abschluss/Postimage`
  5. `archivierte C4-Roadmap und Evidence, nur Abschluss/Postimage`
  6. `docs/Future trainingsmodule update thoughts.md, C4/R15/O-9/O-11`
  7. `docs/modules/Activity Module Overview.md und zuständige QA-Suite`
  8. `git status --short und nur der relevante Diff`
- Startschritt:
  - `G0 - R14-/C4-Postimage und Roadmapaktivierung`
- Freigegebener autonomer Block:
  - `Nach G0 PASS: S1-S4R.`
- Autonomieprofil:
  - `gated; lokal höchstens bis S5, produktive Wirkung owner-gated.`
- Usage-Gates:
  - `Vor G0 und jedem weiteren Haupt-/Ausführungsblock. Caution erlaubt nur
    kurze lokale Blöcke; Safe Closure stoppt.`
- Owner-Gates:
  - `Web/PWA-Deploy; realer Android-PWA-Smoke oder transparente Deferral;
    Commit/Push nur auf Auftrag.`
- Stop-Bedingungen:
  - `R14 oder C4 nicht DONE, Writer-/Recovery-/Katalog-/Relevanzwiderspruch,
    zweiter Sessionpfad, Remote-Planspeicher, unklarer Dirty-Draft-Vertrag,
    P0/P1 oder Safe Closure.`
- Halluzinationsschutz:
  - `R14-Versionen, APIs und Evidence-IDs nur aus dem realen Postimage.`

```text
Arbeite zuerst ausschließlich G0 dieser R15-Roadmap ab. Prüfe die realen
archivierten R14- und C4-Postimages und ersetze vorbereitete Annahmen durch
belegte Fakten. Ist R14 oder C4 nicht DONE oder widerspricht ein Postimage dem
R15-Vertrag, stoppe ohne Produktänderung. Bei G0 PASS arbeite S1-S4R autonom
mit High Reasoning ab. Erfinde keine APIs, Katalogwerte oder Android-Nachweise
und wende vor jedem neuen Block das kanonische Usage-Gate an.
```

## Session Resume Card

- Ziel:
  - `Eine validierte Codex-JSON-Übungsliste als normalen Activity-V2-Draft
    laden und den letzten Plan bequem wiederverwenden.`
- Unveränderliche Verträge:
  - `ein Draft-/Recovery-/Commitpfad; keine Ziel- oder Ist-Leistungen im
    Template; kein Supabase-Planspeicher.`
- Erledigter Stand:
  - `Masterplan und Roadmap-Gerüst vorbereitet.`
- Aktueller Schritt:
  - `G0 pending.`
- Nächster erlaubter Schritt:
  - `Nach R14 und C4 DONE frisches Usage-Gate und G0.`
- Offene Findings:
  - `F-ACT-R15-01: archiviertes R14-Postimage in G0 revalidieren.`
  - `F-ACT-R15-03: C4-Handoff liegt vor; Archiv in G0 revalidieren.`
- Geänderte Dateien:
  - `dieses Gerüst und R15-Masterplanergänzung.`
- Gültige Nachweise:
  - `R14-IDs erst in G0 übernehmen.`
- Context Receipt:
  - `in G0/S1 aus realer Baseline anlegen.`
- Autonomieprofil / Welle:
  - `gated; keine Ausführungswelle vor G0.`
- Letzter Usage-Checkpoint:
  - `Roadmap-Vorbereitung unter Caution; kein Ausführungscheckpoint.`
- Runtime-/Deploy-Stand:
  - `laut aktiver R14; nicht vorwegnehmen.`
- Offene Owner-Freigaben:
  - `später Web/PWA-Deploy und Android-Entscheidung.`
- Stop-Bedingung:
  - `F-ACT-R15-01 und F-ACT-R15-03 nicht überspringen.`

## Usage-Continuation-Checkpoints

<!-- markdownlint-disable MD013 -->

| ID | Grenze / nächster Block | Messzeit | 5h Rest / Reset | Woche Rest / Reset | Verbrauch | Ereignis | Entscheidung |
| --- | --- | --- | --- | --- | --- | --- | --- |
| U0 | `vor G0` | `pending` | `pending` | `pending` | `Baseline` | `pending` | `pending` |
| U1 | `nach G0 / vor S1` | `pending` | `pending` | `pending` | `pending` | `pending` | `pending` |
| U2-U5 | `zwischen S1, S2, S3 und S4R` | `pending` | `pending` | `pending` | `pending` | `pending` | `pending` |
| U6+ | `S4-Blöcke, S5, S6; in S4R finalisieren` | `pending` | `pending` | `pending` | `pending` | `pending` | `pending` |

<!-- markdownlint-enable MD013 -->

## Context Receipt

- Baseline-Commit: `pending G0`.
- Relevante Dirty Files: `pending G0; R14-Diff nicht R15 zurechnen`.
- Source of Truth: `Masterplan R15/O-9; aktive R14 nur als Abhängigkeit`.
- Evidence-/Test-IDs: `pending G0/S1`.
- Invalidation:
  - `R14-Abschluss, Productcontroller, Draft, Recovery, Katalog, Productload
    oder Service Worker -> G0 und betroffene Discovery erneuern.`
- Tool-/Runtime-Status: `pending G0; keine Secrets erforderlich`.

### Vorläufiges Pre-G0-Receipt

Diese Fakten wurden am 2026-08-29 read-only gegen den noch nicht
abgeschlossenen R14-Worktree geprüft. Sie sparen später wiederholte
Breitensuche, ersetzen aber weder G0 noch das reale R14-Postimage. G0 darf sie
nur übernehmen, wenn die angegebenen SHA-256-Fingerprints exakt fortbestehen:

- `session-draft.js` SHA-256
  `7ac418c5e1f2e49d6386ed6d1ea53a20658905799c594e22155644100c03e253`:
  `ITEM_LIMIT = 50`; `addItem(item_key)` validiert aktive Katalogidentität,
  lehnt Duplikate ab und setzt `started_at` beim ersten erfolgreichen Item.
- `session-recovery.js` SHA-256
  `6d818a2a0e2a4fc13a20b8898298cfb386fb8b4b3426f7b9d7af982c09bd189d`:
  eigene IndexedDB `midas_activity_v2_recovery`, Version 1, Store
  `session_recovery`, Slot `active_session`.
- `semantics-v2.js` SHA-256
  `cf828d91f940f5d575c484dbedca3971cf8127e4f6cda0207dc8527db23ab4b4`:
  Katalogversion 2; öffentliche read-only APIs `getCatalog()`,
  `getEntryByKey(key)` und `search(query, options)`.

Jede Fingerprintabweichung invalidiert nur den betroffenen Receiptpunkt und
erzwingt dort eine gezielte Quellprüfung. Sie ist für sich kein R15-Fehler.

## Zielvertrag

R15 liefert nachweisbar:

1. Exaktes Schema `midas.activity-session-template.v1` und eine committed
   gültige Beispieldatei.
2. Import-Keyset:
   - `schema_version`: exakter Schemawert,
   - `catalog_version`: positive sichere Ganzzahl und exakt aktuelle
     produktive Katalogversion,
   - `name`: getrimmter, begrenzter Anzeigename,
   - `items`: dichte Liste mit 1 bis maximal 50 Records aus exakt
     `item_order` und `item_key`.
3. Reihenfolge beginnt bei 1 und ist lückenlos. Doppelte, unbekannte, inaktive
   oder katalogfremde Keys werden all-or-error abgelehnt. Anzeigenamen stammen
   ausschließlich aus dem Katalog.
4. Dateigröße, Textlängen, Keysets, Prototypen und Parsefehler werden vor jeder
   Draftmutation begrenzt. MIME und Dateiendung sind keine Vertrauensanker.
5. Die Auswahl erzeugt nur eine read-only Vorschau. `Abbrechen` erzeugt weder
   Draft, Timer, Lookup noch Cachewrite. Erst `Training starten` baut einen
   vollständigen normalen Draft. Die Komposition nutzt die bestehende
   Draftfactory und deren `addItem`-Semantik; dadurch startet der vorhandene
   Timer beim ersten erfolgreich hinzugefügten Item. Ein neuer Timervertrag ist
   verboten.
6. Ein veränderter oder recoverter Draft wird nie still ersetzt. Der bestehende
   R7-/Shell-Discardvertrag bleibt die einzige Verwerfungsgrenze.
7. Importierte Items verwenden dieselben Editoren und den R4-Historienlookup
   wie manuell gewählte Items. Alle aktuellen Leistungsfelder bleiben leer.
8. Nach bestätigtem Start wird die normalisierte Vorlage ownergebunden als
   `last_used_template` in einer vom R7-Recovery-Store logisch getrennten
   IndexedDB-Cachegrenze gehalten. Der neue Komfortcache darf dafür die
   Datenbank `midas_activity_v2_recovery` weder als Backend verwenden noch von
   Version 1 hochstufen. Der bestehende R7-Recoverypfad bleibt unverändert.
9. `Letzten Plan laden` revalidiert Schema, Owner, aktuelle Katalogversion und
   Keys vollständig. Korrupter, fremder oder veralteter Cache blockiert weder
   `JSON auswählen` noch `Freies Training`.
10. Cachefehler verhindern keinen validierten Sessionstart. Der Cache ist eine
    Komfortkopie ohne Ist-Leistungsdaten und keine Recoveryquelle.
11. Sessionänderungen, Save, Korrektur oder Delete verändern die Vorlage nicht.
    Nur der bestätigte Start einer neuen validierten Datei ersetzt sie.
12. Die Startfläche bietet `Letzten Plan laden`, `JSON auswählen` und
    `Freies Training`. Ohne Cache bleibt der freie Flow unverändert.
13. Fehler sind verständlich und dürfen begrenzte secretfreie Details zum
    Kopieren anbieten. Es gibt keinen Teilimport oder Ersatzkey.
14. Ein gültiger letzter Plan ist mit lokalem Katalog offline nutzbar.

Bewusst unverändert:

- R7-Recovery, R8-Commit, R9-Historie/Korrektur/Delete und R10-Export.
- Supabase-Schema, SQL, RPC, RLS, ACL, Auth, Edge Functions und Scheduler.
- Doctor View, Health Export, Protein Target und Trendpilot.
- Katalogpflege bleibt C2; R15 erfindet keine Keys.

## Entscheidungslog

<!-- markdownlint-disable MD013 -->

| ID | Datum | Entscheidung | Warum |
| --- | --- | --- | --- |
| D-ACT-R15-01 | 2026-08-29 | Nur Identität und Reihenfolge, keine Leistungsvorgaben | MIDAS dokumentiert Ist-Leistung |
| D-ACT-R15-02 | 2026-08-29 | Vorschau vor Draft; Timer erst bei Bestätigung | kein versehentlicher Sessionbeginn |
| D-ACT-R15-03 | 2026-08-29 | Nur aktuelle Katalogversion für neue Imports | keine neue Session auf alter Semantik |
| D-ACT-R15-04 | 2026-08-29 | Normalisierten Inhalt statt Dateipfad als Pflicht speichern | robust, offline, kein wiederholter Dateibrowser |
| D-ACT-R15-05 | 2026-08-29 | Last Plan ist Komfortcache, keine Recoveryquelle | Cacheausfall darf Training nicht blockieren |
| D-ACT-R15-06 | 2026-08-29 | Freies Training bleibt gleichwertig | Activity V2 bleibt flexibel |
| D-ACT-R15-07 | 2026-08-29 | Keine Planbibliothek, Share Targets oder File Handler in V1 | keine neue Plattformarchitektur |
| D-ACT-R15-08 | 2026-08-29 | Ausführung erst nach G0 gegen R14 und C4 | keine erfundenen Postimages |

<!-- markdownlint-enable MD013 -->

## Scope und Grenzen

In Scope:

- Templateparser/-validator, JSON-Schema und Beispiel,
- Preview und Integration in den bestehenden Activity-V2-Controller,
- Last-Plan-Cache mit Owner-, Fehler- und Offlinegrenze,
- Draftkomposition über bestehende APIs,
- Accessibility, Responsive, Race- und Lifecycle-Schutz,
- lokale Tests, Browsermatrix und owner-gateter Android-PWA-Smoke,
- Productload, Service Worker, Forward/Rollback und Webdeploy nach Owner-Gate,
- Activity Overview, Masterplan, QA und Changelog.

Nicht in Scope:

- Planbibliothek, Favoriten, Planeditor oder Supabase-Planverwaltung,
- Zielgewichte, Zielwiederholungen, Satzanzahl, RPE, 1RM oder Empfehlungen,
- automatisches Speichern manueller Sessionänderungen als Vorlage,
- Share Target, File Handler, persistenter Dateihandle oder MCP-Direktwrite,
- Katalogmutation, freie Keys oder neue SQL-/Auth-/Edge-Architektur,
- Änderung medizinischer Consumer oder Activity-V1-Historie.

## Referenzen

Pflicht in G0/S1:

- `README.md`
- `AGENTS.md`
- `docs/DEV_ENVIRONMENT.md`
- `docs/templates/MIDAS Roadmap Workflow Contract.md`
- `docs/archive/[R14 Roadmap DONE].md`
- `docs/archive/[R14 Evidence DONE].md`
- `docs/Future trainingsmodule update thoughts.md`, R15/O-9
- `docs/modules/Activity Module Overview.md`
- `docs/qa/health-capture-reports.md`
- reale R14-Controller-, Draft-, Recovery-, Semantik- und Shellquellen

Nur bei Invalidation:

- archivierte R4-, R7-, R8-, R9- oder C2-Verträge.

## Tool Permissions und Gates

Allowed:

- lokale Reads, Edits, Node-/Syntax-/Katalog-/Isolationstests,
- lokaler Browser-/PWA-Harness und gebündelte Viewportmatrix,
- read-only Git-/Pages-/Runtimechecks gemäß R14-Postimage.

User-gated:

- Web-/PWA-Deploy, Push und produktive Cacheaktivierung,
- realer Android-/ADB-Zugriff oder transparente Deferral,
- Commit nur auf ausdrücklichen Auftrag.

Forbidden:

- SQL, produktiver Supabase-Write, Secretmutation oder Workflowlauf,
- R7-Recoverydaten löschen oder dessen Store still migrieren,
- importierte Pläne als absolvierte Leistung persistieren,
- fremde Worktree-Änderungen zurücksetzen oder Scope still erweitern.

## Statusmatrix und Findings

<!-- markdownlint-disable MD013 -->

| ID | Schritt | Reasoning | Status |
| --- | --- | --- | --- |
| G0 | R14-/C4-Postimage und Roadmapaktivierung | High | BLOCKED |
| S1 | System- und Vertragsdetektivarbeit | High | TODO |
| S2 | Template-, Cache-, UX- und Fehlervertrag | High | TODO |
| S3 | Risiko-, Lifecycle-, Security- und Testreview | High | TODO |
| S4R | Readiness, Blocks, Aufwand und Gates | High | TODO |
| S4 | Lokale Umsetzung | High | TODO |
| S5 | Tests, Reviews und Runtime-Gates | High | TODO |
| S6 | Doku-Sync und Archiv | Medium | TODO |

| Finding | Severity | Typ | Status | Entscheidung |
| --- | --- | --- | --- | --- |
| F-ACT-R15-01 | P1 | Contract | pending G0 | R14-DONE-Archiv liegt vor; eigenes G0 muss es revalidieren |
| F-ACT-R15-02 | Watchlist | Device | open | Android-Smoke oder transparente Deferral in S4R festlegen |
| F-ACT-R15-03 | P1 | Contract | pending G0 | C4-Handoff übergeben; eigenes G0 muss Abschluss/Postimage revalidieren |

<!-- markdownlint-enable MD013 -->

---

## G0 - R14-/C4-Postimage und Roadmapaktivierung

1. R14-Roadmap und Evidence unter `docs/archive/` als DONE prüfen.
2. C4-Roadmap und zugehörige Evidence unter `docs/archive/` als DONE prüfen.
3. Writer, Productload, Activity-V2-APIs, Service Worker, Pages, Androidstatus
   und R14-Follow-up Receipt fingerprintgebunden erfassen.
4. C4-Persistenz-, Draft-, Correction-, Export- und Protein-Relevanzvertrag
   fingerprintgebunden erfassen.
5. Bestätigen, dass Activity V2 der einzige produktive Capture-Pfad ist,
   R7-R10 weiterhin erreichbar sind und importierte Vorlagen keine
   Protein-Relevanz vorgeben.
6. Platzhalter in Metadaten, Referenzen und Context Receipt ersetzen.
7. Full Contract Review der vorbereiteten R15 gegen beide Postimages ausführen.
8. Bei PASS F-ACT-R15-01 und F-ACT-R15-03 schließen, Status `ACTIVE` und
   Schritt S1 setzen; andernfalls ohne Produktänderung stoppen.

Exit: R15 basiert auf den realen R14- und C4-Postimages.

## S1 - System- und Vertragsdetektivarbeit

1. Öffentliche APIs und Lifecycle des R14-Productcontrollers kartieren.
2. Draftfactory, Timerstart, Itemlimit, Duplikatguard, Historienlookup,
   Recoverymount, Dirty-/Discardguard und Commitsettlement nachweisen.
3. Katalogproducer, aktive Version, Lookup-API und Fehlercodes erfassen.
4. Productload-, Service-Worker-, Offline-, Browser- und Androidgrenzen prüfen.
5. R7-IndexedDB exakt abgrenzen; keine stillen Recoverymigrationen.
6. Wiederverwendbare R14-Evidence und Invalidation Map erfassen.
7. Full Review, Findings-Korrektur und Resume-Sync.

Exit: Producer, Consumer und Integrationspunkte sind belegt.

## S2 - Template-, Cache-, UX- und Fehlervertrag

1. JSON-Keysets, Limits, Beispiel, Fehlercodes und Normalisierung finalisieren.
2. Dateiinput auf user gesture, Größenlimit, Parse, Racecancel und secretfreie
   Diagnose begrenzen.
3. Preview-/Confirm-/Cancel- und Dirty-Draft-Zustandsmaschine definieren.
4. Vollständige Draftkomposition vor sichtbarem Mount festlegen. Alle Items
   werden zuerst gemeinsam validiert; scheitert danach ein sequenzielles
   `addItem`, bleibt der isolierte Draft unveröffentlicht und wird verworfen.
5. Cache-DB/Store/Record, Ownerbindung, Updatezeitpunkt, Revalidierung,
   Logout-/Reload-/Offlineverhalten und fail-soft Fehler festlegen.
6. Copy und Fokusfluss für Last Plan, Datei, Free Flow, Preview und Remove.
7. Scope Freeze und Full Contract Review.

Exit: Keine Produkt- oder Datenfrage bleibt für S4 offen.

## S3 - Risiko-, Lifecycle-, Security- und Testreview

Mindestens prüfen:

- malformed, zu groß, extra key, prototype pollution, duplicate, unknown,
  inactive und falsche Katalogversion,
- zwei Dateiauswahlen, Cancel, stale Preview und alter PWA-Client,
- Dirty/Recovered Draft, Hintergrundtab, Reload und Logout,
- Cache corrupt/unavailable/quota/owner mismatch ohne Sessionblockade,
- keine Ziel-/Ist-Daten, Dateipfade, Secrets oder Rohfehler in UI/Logs,
- kein zweiter Timer-, Draft-, Recovery-, Commit- oder Historienpfad,
- Cacheupdate nur nach Start; keine Mutation durch Sessionänderungen,
- Offline-Last-Plan, Free Flow, SW-Forward/Rollback und 320-px-UI.

Danach Rollback, Stop-Bedingungen, Test-IDs, S4-Schnitt und Invalidation Map
festlegen. Full Review und Korrektur abschließen.

Exit: Risiken sind geschlossen, zugeordnet oder transparent deferred.

## S4 Readiness Review

S4R finalisiert:

- reale Größenklasse einschließlich Browser-, Review- und Dokukosten,
- genaue Dateien und öffentliche APIs,
- kleinste Cachegrenze ohne R7-Migration,
- Block A: Parser/Schema/Beispiel und Cache,
- Block B: Preview, Startfläche, Draft/History und Lifecycle,
- Block C: Productload, CSS, Service Worker, Offline und Rollback,
- Usage-Gates zwischen allen Blöcken,
- gebündelte S5-Browsermatrix und genau 1+1 CodeRabbit-Budget,
- Deploy-/Android-Gates und Evidencebedarf.

Exit: sichere Blöcke und reale Arbeitsgröße sind bestätigt.

## S4 - Lokale Umsetzung

### S4.1 - Templatevertrag und Beispiel

- Parser/Validator mit exakten Keysets, Limits und Fehlercodes.
- Gültiges Beispiel aus realen aktiven Katalogkeys.
- Keine Produktverdrahtung vor grünen direkten Contracttests.

### S4.2 - Last-Plan-Cache

- Logisch von R7 getrennte IndexedDB-Komfortgrenze.
- Kein neuer Store und kein Versionsupgrade in `midas_activity_v2_recovery`.
- Ownerbindung, Revalidierung, atomarer Replace, Remove und fail-soft Fehler.
- Kein Ist-Datum und kein Eingriff in Recovery oder Sessioncommit.

### S4.3 - Preview und Draftintegration

- Datei-, Last-Plan- und Free-Entry-Flow.
- Preview ohne Side Effects; Confirm validiert zuerst vollständig und erzeugt
  danach einen isolierten normalen Draft über bestehende `addItem`-Semantik.
  Erst der vollständig komponierte Draft wird sichtbar. Die erste Itemmutation
  startet den bestehenden Timer; nach erfolgreicher Veröffentlichung verwendet
  jedes Item den bestehenden R4-Historienlookup.
- Dirty-/Recovered-Draft-, Fokus-, Escape-, Race- und Lifecycleguards.

### S4.4 - Productload, Responsive, Offline und Rollback

- Minimales Wiring auf dem realen R14-Productcontroller.
- Monotone Service-Worker-Aktivierung und explizites Forward-Rollback.
- Kein R14-Writer- oder Readervertrag wird ersetzt.

S4 nutzt nur native Delta-/Consumer-Reviews und invalidierte günstige Checks.
CodeRabbit und vollständige Browsermatrix gehören ausschließlich S5.

## S5 - Tests, Reviews und Runtime-Gates

1. Invalidierte Activity-V2-Matrix, Syntax, Katalog, R7-/R14-Isolation und
   `git diff --check`.
2. Parser-/Cache-/Preview-/Draft-/Race-/Offline-/Rollback-Negativmatrix.
3. Eine Browserwelle für Desktop, 390x844 und 320x800 mit Datei-Fixture,
   Last Plan, Preview, Free Flow, Dirty Draft, Fokus, Reload und Offline.
4. Android-PWA-Smoke owner-gated ausführen oder ehrlich als
   `DEFERRED / NOT PASS` dokumentieren.
5. Nativer Full Code/Contract/Security/Privacy/Cache/Scope Review.
6. Genau ein CodeRabbit-Initiallauf, begründete Fixes, invalidierte Checks und
   höchstens ein Verifikationslauf.
7. Owner-Briefing mit Preimage, Forward, Rollback und Teststatus.
8. Erst nach Owner-GO Web/PWA deployen und UI-Smokes durchführen. Kein
   produktiver Trainingswrite ist für R15 erforderlich.

Exit: Import, Last Plan, Free Flow und Rollback sind grün oder transparent
abgegrenzt; keine offenen In-Scope-P0/P1.

## S6 - Doku-Sync und Abschluss

1. Activity Overview und Masterplan auf das reale R15-Postimage setzen.
2. Nächste freie Activity-V2-QA-ID mit Schema-, Cache-, Import-, Offline- und
   Androidstatus ergänzen.
3. README/PWA-Runbook nur bei dauerhaft geändertem Vertrag aktualisieren.
4. `CHANGELOG.md` unter `Unreleased` aktualisieren.
5. Finalen Source-of-Truth-, Link-, Scope- und Diff-Review durchführen.
6. Follow-up Receipt für reale Nutzung beziehungsweise R16 an einem Ort.
7. Resume Card auf DONE setzen, Commit-Empfehlung ableiten und archivieren.

```text
feat(activity-v2): add prepared session template import
```

Exit: Produkt, Tests, QA, Doku und Roadmap beschreiben denselben bewiesenen
R15-Vertrag.
