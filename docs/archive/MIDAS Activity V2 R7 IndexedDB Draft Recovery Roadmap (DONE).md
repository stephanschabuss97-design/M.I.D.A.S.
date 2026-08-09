# MIDAS Activity V2 R7 IndexedDB Draft Recovery Roadmap (DONE)

Diese Roadmap schützt den weiterhin isolierten Activity-V2-Session-Draft vor
Reload und Browserprozessverlust. Sie baut auf dem bewiesenen Draft v3 aus R6
auf, führt aber weder einen Supabase-Commit noch einen produktiven Activity-V2-
Cutover aus.

---

## Roadmap-Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Status | `DONE` |
| Modul / Bereich | `Activity V2 / lokale Draft-Recovery` |
| Owner / Kontext | `Stephan; private Single-User-PWA für die eigene Trainingsdokumentation` |
| Chat-Lebenszyklus | `Denkraum -> eigener Ausführungs-Chat` |
| Erstellt am | `2026-08-09` |
| Letzter Stand | `2026-08-09; S6 PASS; Sources of Truth und HCR-025 synchron, Full Contract Review grün, Roadmap und Evidence archiviert` |
| Aktueller Schritt | `R7 abgeschlossen; nächstes erlaubtes Rolling-Wave-Gate ist eine eigene R8-Roadmap` |
| Risikoklasse | `R3`; lokale persistente Gesundheitsdaten plus Concurrency-, CAS- und Verwerfungs-Races |
| Standard-Reviewtiefe | `Consumer`; `Full` in S1-S3, S4R, gemeinsam in S4.2-S4.3, S5 und S6 |
| Ausführungsmodell | `GPT-5.6 Sol` |
| Reasoning-Standard | `High` |
| Reasoning-Ausnahmen | `Discovery Wave S1-S4R, S4.2-S4.3 und S5: Extra High wegen Recovery-, Concurrency-, Rollback- und Datenverlustgrenze` |
| Autonome Discovery Wave | `S1-S4R` |
| Owner-Erklärmodus | `Briefing + S6-Recap` |
| Betroffene Hauptdateien | `app/modules/vitals-stack/activity/v2/session-draft.js`, neue `session-recovery.js`, zugehörige Contracttests, `session-shell.js`, `session-shell.css`, neuer `session-recovery-harness.html`; bestehender `session-shell-harness.html` bleibt storagefrei |
| Deploy relevant | `nein` |
| Produktive Schreibwirkung | `nein`; nur isolierte lokale IndexedDB-Persistenz im Activity-V2-Harness |
| Workflow-Vertrag | `docs/templates/MIDAS Roadmap Workflow Contract.md` |
| Evidence-Datei | `docs/archive/MIDAS Activity V2 R7 IndexedDB Draft Recovery Evidence (DONE).md` |
| Gekoppelte Roadmaps | `R6 liefert Draft v3; R8 übernimmt Recovery später in die interne Commit-/Android-Integration` |
| Evidence-Owner | `diese Roadmap` |
| Archivziel | `docs/archive/MIDAS Activity V2 R7 IndexedDB Draft Recovery Roadmap (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Ausführungs-Chat-Startkarte

Diese Karte ist der verbindliche Einstieg für einen frischen Ausführungs-Chat.
Der lange Denkraum ist keine zusätzliche Source of Truth.

- Auftrag:
  - `R7 gemäß dieser Roadmap zunächst autonom von S1 bis einschließlich S4R
    abarbeiten; S4 nicht ohne eigenen Folgeauftrag beginnen.`
- Modell und Reasoning:
  - `GPT-5.6 Sol / Extra High` für die gesamte Discovery Wave S1-S4R.
  - Danach `High`, außer S4.2-S4.3 und S5 mit `Extra High`.
- Kontextübergabe aus dem Denkraum:
  - `PASS`: R1-R6 und C2 sind DONE. Activity V1 bleibt der einzige sichtbare
    und produktive Activity-Consumer.
  - `PASS`: R6 liefert den finalen flüchtigen Draft
    `midas.activity-session-draft.v3` für Strength-, Duration-, Distance- und
    Mixed-Sessions. R7 erzeugt allein wegen Recovery kein Draft v4.
  - `PASS`: Genau ein lokaler Slot gilt je Browserprofil und Origin. Desktop,
    Android-PWA und andere Browserprofile synchronisieren Drafts nicht.
  - `PASS`: Der Recovery-Envelope trägt Autosave- und Konfliktmetadaten
    außerhalb des fachlichen Drafts.
  - `PASS`: Autosave beginnt nach jeder echten erfolgreichen Draftmutation,
    läuft serialisiert und hält höchstens den neuesten noch ausstehenden
    Snapshot desselben Branches.
  - `PASS`: Compare-and-Swap prüft Lease-Token, Slotgeneration,
    Schreibsequenz, `request_id` und persistierte Revision. Eine höhere
    Revision allein ist kein Schreibrecht.
  - `PASS`: Bewusstes Verwerfen invalidiert die Slotgeneration atomar. Wenn
    dies nicht bestätigt werden kann, bleibt die Session offen.
  - `PASS`: Restore verwendet exakt die gespeicherte `catalog_version`; keine
    stille Migration, kein Versionssprung und keine automatische Löschung.
  - `PASS`: R7 bleibt ohne Supabase, Netzwerk, Produktload und echten Android-
    Prozess-Reclaim. Diese Integration gehört R8; der Cutover bleibt bis R12
    gesperrt.
- Verbindliche Lesereihenfolge:
  1. `Diese Startkarte, Roadmap-Metadaten und Session Resume Card`
  2. `README.md`
  3. `docs/DEV_ENVIRONMENT.md`
  4. `docs/templates/README.md`
  5. `docs/templates/MIDAS Roadmap Workflow Contract.md`
  6. `docs/Future trainingsmodule update thoughts.md`
  7. `docs/modules/Activity Module Overview.md`
  8. `docs/MIDAS Activity V2 R1 Catalog Baseline Contract.md`
  9. `docs/MIDAS Activity V2 C2 Catalog Version 2 Contract.md`
  10. archivierte R6-Roadmap vollständig; R2-R5 nur für konkrete Request-,
      Draft-, Shell-, Historien- oder Lifecyclefragen
  11. `docs/qa/health-capture-reports.md`, mindestens HCR-017 bis HCR-024
  12. reale Activity-V2-Runtime, Contracttests, CSS und isoliertes Harness
  13. bestehende IndexedDB-/Storage-Nutzung im Repo ausschließlich zur
      Abgrenzung von `healthlog_db`
  14. `git status --short` und nur der relevante Diff
- Startschritt:
  - `S1 - System- und Vertragsdetektivarbeit`.
- Freigegebener autonomer Block:
  - `S1-S4R`.
- Interne Continuation Gates:
  - Nach S1, S2 und S3 jeweils Full Review, Findings-Korrektur, Statusmatrix
    und Resume Card aktualisieren.
  - Bei `PASS` und ohne Owner-Gate automatisch fortfahren.
  - Nach S4R mit Readiness-Urteil und Ausführungsblock-Empfehlung stoppen.
- Erlaubte Autonomie:
  - lokale Reads, Roadmap-/Vertragskorrekturen und Baselinechecks in der
    Discovery Wave;
  - nach separater S4-Freigabe eng begrenzte Activity-V2-JS-/CSS-/Harness-
    und Teständerungen sowie lokale Browser-Smokes;
  - CodeRabbit ausschließlich in S5 nach grüner lokaler Gesamtmatrix.
- Owner-Gates:
  - keines für die bereits freigegebene isolierte lokale Recovery-
    Architektur;
  - Owner-Gate bei neuer Produktentscheidung, Cross-Device-Sync,
    Verschlüsselungs-/Schlüsselmanagement, Produktload, Supabase, Deploy,
    Android-Integration oder Scope-Ausweitung.
- Stop-Bedingungen:
  - Änderung von Activity V1, `index.html`, R2-SQL/RPC/RLS/Grants,
    `commitSession`, Service Worker oder produktiver Navigation;
  - stilles Draftschema-Upgrade, stiller Katalogversionswechsel oder
    automatische Recovery-Löschung;
  - Revision-only-CAS, unbedingtes Überschreiben, zweiter aktiver Write oder
    Wiederauferstehen nach Verwerfen;
  - Schließen der Session, obwohl die persistente Verwerfung nicht bestätigt
    wurde;
  - notwendige neue Dependency, freier Storage-Pfad oder unauflösbarer
    Quellenwiderspruch.
- Halluzinationsschutz:
  - API-Formen, Scriptreihenfolge, vorhandene Storagekonventionen und
    Testzähler zuerst am realen Repo verifizieren.
  - Fehlende Fakten nicht erfinden. Technische Detailentscheidungen nur
    innerhalb des hier eingefrorenen Produktvertrags in S2 festlegen.
  - Keine Datenbank-, Android-, medizinische oder produktive Wirkung aus der
    lokalen Harness-Recovery ableiten.
- Browser-/Harness-Kadenz:
  - Kein visueller Volltest in S1-S3, solange Code und Contracttests die Frage
    beantworten.
  - Ein gezielter realer IndexedDB-Smoke nach dem vollständigen Recovery-
    Integrationsblock.
  - Eine gebündelte finale Browsermatrix in S4/S5; Server, Harnessseite und
    Browser-Session wiederverwenden.
  - Reload-, Resume-, Discard-, Lifecycle-, Konflikt-, Viewport- und
    Accessibilitybelege möglichst in derselben Session erfassen.
  - Bereits grüne Browsernachweise nur bei relevanter Invalidation wiederholen.
- Startprompt:

```text
Arbeite die Roadmap
`docs/MIDAS Activity V2 R7 IndexedDB Draft Recovery Roadmap.md` gemäß ihrer
Ausführungs-Chat-Startkarte ab.

Lies die festgelegten Quellen in der angegebenen Reihenfolge, prüfe den realen
Git- und Systemstand und beginne mit S1. Führe die freigegebene autonome
Discovery Wave S1 bis einschließlich S4R deterministisch aus. Schließe S1, S2,
S3 und S4R jeweils separat mit Full Review, Findings-Korrektur, Statusmatrix
und aktualisierter Session Resume Card ab. Fahre bei bestandenem internem
Continuation Gate ohne Rückfrage fort. Stoppe nur bei einem echten Owner-Gate,
Quellenwiderspruch, Scope-Ausweitung, blockierendem Finding oder fehlendem
belastbarem Nachweis.

Unveränderliche Grenzen: Activity V1, index.html, R2-SQL/RPC/RLS/Grants,
commitSession, Supabase, Netzwerk, Service Worker und Produktnavigation bleiben
unverändert. R7 verwendet eine getrennte lokale Activity-V2-IndexedDB, den
unveränderten Draft v3, den gespeicherten Katalogstand und einen
transaktionalen CAS-Vertrag. Keine stille Migration, kein Cross-Device-Sync,
kein produktiver Cutover und kein Android-Prozess-Reclaim-Nachweis.

Beginne in der Discovery Wave noch nicht mit Produktcodeänderungen. Ende nach
dem S4 Readiness Review mit dem Readiness-Urteil und den empfohlenen sicheren
S4-Ausführungsblöcken. S4 benötigt einen separaten Auftrag.
```

## Session Resume Card

- Ziel:
  - Activity-V2-Draft v3 lokal gegen Reload und Prozessverlust absichern,
    ohne Produkt- oder Supabase-Integration vorzuziehen.
- Unveränderliche Verträge:
  - ein Slot je Browserprofil/Origin; Draft v3 bleibt unverändert;
  - exakter gespeicherter Katalogstand; Token-/Lease-CAS plus
    Generationstombstone;
  - Activity V1 und produktive App bleiben unverändert.
- Erledigter Stand:
  - R1-R6/C2 sind DONE;
  - Masterplan-R7-Vertrag wurde um lokale Slotgrenze, Envelope-Metadaten,
    transaktionalen CAS und Tombstone präzisiert;
  - Roadmap und Evidence wurden erstellt und initial contract-reviewed;
  - S1 hat Git, Draft v3, alle direkten Consumer, Semantik v1/v2,
    Lifecycle, Testseams und die bestehende `healthlog_db`-Grenze am realen
    Repo belegt;
  - frische Baseline: Activity-V2-Contracttests `85/85`, Katalog
    `v2 / 80 / 47 / 58`, Syntax `10/10`;
  - S2 hat Restore-/Recovery-/Store-API, Lease-Token, State Machine,
    Managed-Discard, Shell-Handoff und separaten Recovery-Harness exakt
    eingefroren;
  - S3 hat Fork-, Pending-, Discard-, Destroy-, IDB-, Corrupt-, Overflow-,
    Callback-, UI-, Privacy- und Rollbackpfade red-teamed; alle P0/P1-
    Fehlwirkungen enden fail-closed;
  - S4R hat Git, betroffene Runtimepfade, Evidence, Invalidation,
    Risikozuordnung und Rollback erneut geprüft: `READY`.
  - S4.1 ergänzt additiv die strikte, versionsgebundene
    `sessionDraft.restore(snapshot, options?)`-Fabrik; Restore bewahrt den
    validierten Snapshot referenzgleich, erzeugt weder ID noch Zeit und lässt
    alle elf R3-R6-Controllermethoden unverändert.
  - S4.1-Nachweise: Drafttests `24/24`, vollständige Activity-V2-
    Contracttests `88/88`, Katalog `v2 / 80 / 47 / 58`, Syntax `10/10`;
    Consumer Review `PASS`.
  - S4.2 implementiert den festen IDB-v1-Slot, geschützte vollständige
    Observations, Token-/Lease-CAS, Transaction-Complete-Erfolg und den
    Generationstombstone einschließlich Corrupt-/Unknown-Discard.
  - S4.3 implementiert die exakte Recovery-Fassade, Managed Draft,
    One-Write-/Latest-Pending-Autosave, Flush/Retry/Conflict, Lifecycle,
    Subscription, terminalen Destroy und persistent-first Discard.
  - Block-B-Nachweise: Recoverytests `27/27`, vollständige Activity-V2-
    Contracttests `115/115`, Katalog `v2 / 80 / 47 / 58`, Syntax `12/12`;
    gemeinsamer Full Contract Review `PASS`.
  - S4.4 bindet die bestehende Shell optional an den exakten
    Recoverycontroller, patcht Status ausschließlich in einer eigenen polite-
    Live-Region und wartet bei Close/Escape persistent-first auf
    `recovery.discard()`; Legacy-Mounts bleiben unverändert.
  - S4.4-Nachweise: Shelltests `38/38`, vollständige Activity-V2-
    Contracttests `118/118`, Syntax `12/12`, `git diff --check`; Consumer
    Review `PASS`.
  - S4.5 ergänzt den separaten `session-recovery-harness.html` mit bewusstem
    Gate, kontrollierten Empty/Recoverable/Malformed/Unavailable/Saving/
    Lifecycle/Degraded/Conflict/Discard-Fixtures, DOM-Bestätigung und gezieltem
    Cleanup ausschließlich der R7-Datenbank; der R6-Harness bleibt storagefrei.
  - Block-C-Nachweise: Recoverytests `28/28`, Shelltests `38/38`, vollständige
    Activity-V2-Contracttests `119/119`, Katalog `v2 / 80 / 47 / 58`, Syntax
    `12/12`, `git diff --check`; realer Edge-IDB-Lauf für Save/Reload/Continue,
    Discard/Tombstone/stale Writer, Conflict, Pagehide, Fehlerzustände,
    Desktop/390x844/320x800, Fokus, Touch, Overflow und Console `PASS`;
    gemeinsamer Consumer Review `PASS`.
  - S5 hat Drafttests `24/24`, Recoverytests `28/28`, Shelltests `38/38`, die
    vollständige Activity-V2-Suite `119/119`, Katalog `v2 / 80 / 47 / 58`,
    Syntax `12/12`, `git diff --check` und alle statischen Produkt-/Storage-
    Negativgrenzen bestätigt.
  - Der gezielte reale Edge-Lauf bestätigte den seit S4 invalidierten
    Alertdialog mit Initialfokus, Tab/Shift+Tab, Escape, Fokusrestauration,
    unverändert offener Shell und leerer Fehlerkonsole. Nativer Full Review
    `PASS`; CodeRabbit endete nach Korrektur und Re-Review mit `0 Findings`.
  - S6 hat Activity Module Overview, Trainingsmodul-Masterplan und HCR-025 auf
    denselben bewiesenen R7-Vertrag synchronisiert; Changelog-Relevanz wurde
    als `nicht bemerkenswert` bewertet, finaler Full Contract Review `PASS`.
- Aktueller Schritt:
  - `R7 abgeschlossen und archiviert`.
- Nächster erlaubter Schritt:
  - eine eigene `R8 - Core Commit and Android Recovery Integration`-Roadmap;
    kein R8-Vorgriff innerhalb von R7.
- Offene Findings:
  - `none`.
- Geänderte Dateien:
  - `session-draft.js`, `session-draft.contract.test.js`, neue
    `session-recovery.js`, neue `session-recovery.contract.test.js`,
    `session-shell.js`, `session-shell.contract.test.js`, `session-shell.css`,
    neuer `session-recovery-harness.html`, `docs/modules/Activity Module
    Overview.md`, `docs/qa/health-capture-reports.md`, diese archivierte
    Roadmap, archivierte Evidence und gezielte R7-Präzisierungen im
    Trainingsmodul-Masterplan; vorhandene Template-Diffs nicht zurücksetzen.
- Gültige Nachweise:
  - EV-ACT-R7-B01 bis -B04 und EV-ACT-R7-D01 bis -D06: `PASS`;
  - EV-ACT-R7-L01: `PASS`;
  - EV-ACT-R7-L02 bis -L05: `PASS`;
  - EV-ACT-R7-L06 bis -L09: `PASS`;
  - EV-ACT-R7-L10 bis -L11: `PASS`;
  - letzter Activity-V2-Commit
    `cdca045bdda1681834c0e257cc8f99234f208306` vom 2026-08-09.
- Runtime-/Deploy-Stand:
  - S4.1-S4.5 sind ausschließlich in unreferenzierten Activity-V2-Modulen und
    dem separaten Harness implementiert; realer Browserstorage wurde nur in
    `midas_activity_v2_recovery` verwendet und am Ende gezielt gelöscht; kein
    Deploy oder produktive Wirkung.
- Doku-/QA-Stand:
  - Masterplan und Module Overview beschreiben R7 als isoliert abgeschlossen;
    HCR-025 ist der kanonische Regressionsvertrag; Roadmap und Evidence liegen
    ausschließlich als `(DONE)` im Archiv.
- Offene Owner-Freigaben:
  - für R7 `none`; R8 benötigt eine eigene Roadmap und Freigabe.
- Stop-Bedingungen:
  - R7 ist beendet; keine weitere R7-Implementierung und kein R8-, Supabase-,
    Android-, Deploy-, Produktload- oder Cutover-Vorgriff.

## Zielvertrag

Prüfbares Endergebnis:

- Ein fachlich veränderter Activity-V2-Draft v3 wird in einer separaten
  Activity-V2-IndexedDB lokal wiederherstellbar gespeichert.
- Nach Reload zeigt das isolierte Harness bei vorhandenem gültigem Draft
  ausschließlich die bewussten Optionen `Session fortsetzen` und
  `Session verwerfen`; kein stilles Resume.
- Fortsetzen stellt Request-ID, Revision, Startzeit, Katalogversion,
  Reihenfolge, Notizen, Items, Sätze und Rohwerte exakt wieder her. Abgeleitete
  UI-Zustände werden neu berechnet und nicht persistiert.
- Autosave ist serialisiert und coalescable. No-op- und fehlgeschlagene
  Mutationen erzeugen keinen Write.
- Mehrtab- und stale-write-Races können weder einen anderen Branch
  überschreiben noch einen verworfenen Draft wiederauferstehen lassen.
- Bewusstes Verwerfen löscht den Draftinhalt erst nach atomar bestätigter
  Slotinvalidierung; bei Fehler bleibt die Session offen und verständlich
  bedienbar.
- Storage-, Quota-, Open-, Abort- und Konfliktfehler beenden die laufende
  In-Memory-Session nicht. Der Verlust des Recovery-Versprechens bleibt
  sichtbar und wird nicht als Erfolg dargestellt.
- Reale IndexedDB-Smokes belegen Save, Reload, Resume, Discard, Lifecycle-
  Flush, Konflikt und Fehlergrenzen im isolierten Harness.

Bewusst unverändert:

- Activity V1, sichtbare Produktnavigation und `index.html`.
- Draftschema `midas.activity-session-draft.v3` und R5-/R6-Feldsemantik.
- R2-Commit, SQL, RPC, RLS, Grants und Supabase-Daten.
- R4-Historie und deren read-only Grenze.
- Service Worker, Android-Shell, PWA-Cutover und produktiver Katalogselektor.
- Keine Cross-Device-Synchronisierung, Cloud-Drafts, Drafthistorie, Retention,
  automatische Migration oder lokale Verschlüsselungsinfrastruktur.

## Problem und Ist-Zustand

- Beobachtung:
  - R3-R6 bewahren Draft und Uhr bei normalem Tab- oder App-Wechsel, solange
    der Browserprozess lebt.
  - Reload, Browserabsturz, Android-Prozess-Reclaim oder das Schließen der PWA
    verlieren den Draft derzeit vollständig.
  - Der aktuelle Draft besitzt keine Restore-API und die Shell verwirft
    synchron nur im Arbeitsspeicher.
- Risiko oder Reibung:
  - Eine reale Trainingssession kann nach längerer Eingabe verloren gehen.
  - Ein naiver IndexedDB-Write kann durch zwei Tabs, verzögerte Promises oder
    einen bereits bestätigten Discard alte Daten wiederherstellen.
  - Ein stilles Katalogupgrade könnte alte, aber gültige Drafts fachlich
    umdeuten.
- Offene Hypothese:
  - Keine fachliche Owner-Frage ist offen. S1-S3 müssen ausschließlich die
    exakte technische API-, Lifecycle- und Testform am realen Code einfrieren.

## Entscheidungslog

<!-- markdownlint-disable MD013 -->

| ID | Datum | Entscheidung | Warum | Betrifft |
| --- | --- | --- | --- | --- |
| D-ACT-R7-01 | 2026-08-09 | R7 verwendet eine eigene IndexedDB `midas_activity_v2_recovery`; `healthlog_db` bleibt unverändert. | Recovery darf den produktiven Boot-/Storage-Vertrag nicht koppeln. | Storage, S2, S4.2 |
| D-ACT-R7-02 | 2026-08-09 | Die lokale Grenze ist genau ein Slot je Browserprofil und Origin, nicht ein globaler Geräte- oder Cloud-Slot. | IndexedDB synchronisiert weder Desktop und Android noch verschiedene Profile. | Produktvertrag, Copy |
| D-ACT-R7-03 | 2026-08-09 | Der fachliche Draft bleibt exakt v3; Recovery erhält einen separaten Envelope v1. | Autosave-Metadaten sind keine Trainingsdaten. | Draft, Restore |
| D-ACT-R7-04 | 2026-08-09 | Der Recovery-Envelope enthält Slotkey, Recovery-Schema, Slotgeneration, Schreibsequenz, Lease-Token, Request-ID, persistierte Revision, Savezeit und Draft oder `null`. | CAS, Diagnose, Corrupt-Discard und Tombstone benötigen stabile Kontrollfelder. | Storage, Evidence |
| D-ACT-R7-05 | 2026-08-09 | Ein fehlender Record entspricht logisch Generation 0 / Sequenz 0 / leer; ein unberührter Draft erzeugt keinen aktiven Recovery-Draft. | Kein Datenmüll und deterministischer Erstwrite. | Autosave |
| D-ACT-R7-06 | 2026-08-09 | Jede echte erfolgreiche Mutation stößt sofort einen Autosave an; höchstens ein Write ist aktiv und nur der neueste Pending-Snapshot bleibt. | Unload-Events sind keine belastbare Hauptsicherung. | Coordinator |
| D-ACT-R7-07 | 2026-08-09 | `visibilitychange: hidden` und `pagehide` lösen nur einen bestmöglichen Flush aus. | Browser dürfen asynchrone Arbeit beim Verlassen abbrechen. | Lifecycle, Copy |
| D-ACT-R7-08 | 2026-08-09 | CAS prüft erwartete Slotgeneration und Schreibsequenz sowie Request-ID und persistierte Revision. | Höhere Revision allein verhindert keinen Same-Request-Fork. | Concurrency, S4.2-S4.3 |
| D-ACT-R7-09 | 2026-08-09 | Ein CAS-Konflikt ist terminal für den aktuellen Autosave-Branch; spätere Mutationen überschreiben nicht still. | Konflikt ist kein transienter Quota-Fehler. | Error state |
| D-ACT-R7-10 | 2026-08-09 | Discard schreibt atomar einen leeren Generationstombstone statt den Konfliktschutz vollständig zu löschen. | Alte Tabs dürfen einen verworfenen Draft nicht wiederbeleben. | Discard, Evidence |
| D-ACT-R7-11 | 2026-08-09 | Scheitert die persistente Invalidierung, wird der In-Memory-Draft weder verworfen noch die Shell geschlossen. | Keine falsche Erfolgsaussage und kein Datenverlust durch fehlgeschlagenen Discard. | Shell, UX |
| D-ACT-R7-12 | 2026-08-09 | `sessionDraft` erhält eine strikte Restore-Grenze, die keinen Snapshot durch Replay von Mutationen rekonstruiert. | Identität, Revision und Startzeit müssen exakt erhalten bleiben. | S4.1 |
| D-ACT-R7-13 | 2026-08-09 | Restore bekommt die Semantik exakt für die gespeicherte Katalogversion injiziert und prüft Versionsgleichheit. | Kein stilles Upgrade auf den höchsten Katalog. | Catalog v1/v2 |
| D-ACT-R7-14 | 2026-08-09 | Gültige Recovery wird nie automatisch fortgesetzt oder verworfen. | Der Nutzer entscheidet bewusst über eine laufende Session. | Recovery Gate |
| D-ACT-R7-15 | 2026-08-09 | Ein Draft besitzt kein Ablaufdatum; Alter und letzte Sicherung werden nur angezeigt. | Lange Sessions werden nicht ohne Ownerabsicht gelöscht. | Time, UX |
| D-ACT-R7-16 | 2026-08-09 | Storagefehler lassen den RAM-Draft weiterlaufen; transiente Fehler werden nur bei späterer echter Mutation oder explizitem Flush erneut versucht. | Training darf wegen lokaler Persistenz nicht blockieren; es gibt keinen stillen Timerretry. | Errors |
| D-ACT-R7-17 | 2026-08-09 | Recovery-Status ist ruhig und persistent: `Wird lokal gesichert …`, `Lokal gesichert` oder eine klare Warnung; kein Toast pro Eingabe. | Geringe Reibung im Gym. | Copy, A11y |
| D-ACT-R7-18 | 2026-08-09 | Draftinhalte werden weder geloggt noch in Fehlertexte interpoliert. R7 führt keine eigene WebCrypto-/Schlüsselverwaltung ein. | Datenschutz ohne riskanten neuen Schlüssel-Lifecycle. | Security |
| D-ACT-R7-19 | 2026-08-09 | Löschen von Site-Daten, Inkognito-Ende, Browserprofilverlust oder Geräteverlust liegt außerhalb des Recovery-Versprechens. | IndexedDB ist lokale Ausfallsicherung, kein Backup. | Grenzen, Recap |
| D-ACT-R7-20 | 2026-08-09 | R7 enthält keinen Netzwerkzugriff, Supabase-Commit, Produktload oder Android-Prozess-Reclaim-Smoke. | Diese Grenzen gehören R8 beziehungsweise R12. | Scope |
| D-ACT-R7-21 | 2026-08-09 | Die zweite Löschgrenze nach bestätigt erfolgreichem Supabase-Commit wird erst in R8 ergänzt. | R7 darf keinen Commit-Erfolg vortäuschen. | R8-Gate |
| D-ACT-R7-22 | 2026-08-09 | Deterministische Tests verwenden injizierbaren Storage, Zeitgeber und Scheduler; reale IndexedDB wird zusätzlich im Browser belegt. | Node-Testbarkeit ohne neue Repo-Dependency. | QA |
| D-ACT-R7-23 | 2026-08-09 | Wegen CAS-, Tombstone- und Rollbacknachweisen ist eine separate Evidence-Datei verpflichtend. | Workflow-Evidence-Vertrag. | S4-S6 |
| D-ACT-R7-24 | 2026-08-09 | Nach bestätigt erfolgreichem Recovery-Discard wird der alte Controller terminal beendet und nicht wiederverwendet; eine neue Session erhält einen frischen Draft und Controller. | Der dauerhafte Tombstone darf nicht von einem danach noch fehlerfähigen RAM-Reset abhängen. | Discard, Shell |
| D-ACT-R7-25 | 2026-08-09 | `Lokal gesichert` gilt nur, wenn der neueste dem Controller bekannte Snapshot persistiert ist und weder ein aktiver neuerer Write noch ein Pending-Snapshot existiert. | Ein erfolgreich geschriebener Zwischenstand darf keine falsche Sicherheitsaussage erzeugen. | Autosave, UX |
| D-ACT-R7-26 | 2026-08-09 | Ein blockierter beschädigter oder unbekannter Recoveryzustand erhält keinen leeren Fallback, aber einen sichtbaren, erneut bestätigten und gegen den beobachteten Record geschützten Verwerfungsweg. | Ohne kontrollierten Ausweg könnte ein einzelner beschädigter Record das Modul dauerhaft blockieren. | Recovery Gate, Corrupt-State |
| D-ACT-R7-27 | 2026-08-09 | Jeder vorhandene kanonische Record trägt ein UUID-`lease_token`; Save behält es, Discard rotiert es. CAS prüft es zusätzlich zu Generation, Sequenz, Request und Revision. | Auch bei beschädigten numerischen Kontrollfeldern muss ein bestätigter Corrupt-Discard alte R7-Writer sicher ausschließen. | S2, CAS, Tombstone |
| D-ACT-R7-28 | 2026-08-09 | `sessionDraft` exportiert additiv `restore`; `sessionRecovery` exportiert exakt `resolveSemantics`, `createIndexedDbStore` und `open`. | Eine Recovery-Fassade genügt; Restore bleibt beim fachlichen Draftproducer. | S2, S4.1-S4.3 |
| D-ACT-R7-29 | 2026-08-09 | Der Recoverycontroller gibt einen exakt elfmethodigen Managed-Draft aus. Dessen `discard()` ist fail-closed; nur `recovery.discard()` darf persistent verwerfen. | Ein Legacy-Close darf einen Managed-Draft nie vor dem Tombstone synchron zurücksetzen. | S2, S4.3-S4.4 |
| D-ACT-R7-30 | 2026-08-09 | IDB-`save` und -`discard` erfüllen ihr Promise ausschließlich nach `transaction.oncomplete`; Request-Erfolg allein ist kein Erfolg. | Nur der bestätigte persistente Postzustand darf UI und Controller fortschalten. | S2, S4.2 |
| D-ACT-R7-31 | 2026-08-09 | Der bestehende R6-Shell-Harness bleibt storagefrei; reale R7-Recovery erhält `session-recovery-harness.html`. | Geerbte Isolation bleibt aussagekräftig und Browser-IDB wird separat beweisbar. | S2, S4.5 |
| D-ACT-R7-32 | 2026-08-09 | Enqueued Writes tragen einen internen Controller-Epoch. Discard und Destroy invalidieren die Epoch; nur eine bereits gestartete leasegeschützte Transaktion darf noch enden. | Ein später Queuecallback darf keinen Tombstone überschreiben oder zerstörte UI patchen. | S3, Lifecycle |
| D-ACT-R7-33 | 2026-08-09 | Ein nach initialem Storagefehler gestarteter RAM-Draft muss vor seinem ersten Write den Slot neu lesen. Jeder inzwischen aktive oder blockierte Record führt zu `conflict`, nie zu Takeover. | Verfügbarkeit darf keinen ungesehenen Recovery-Draft überschreiben. | S3, Availability |
| D-ACT-R7-34 | 2026-08-09 | `onblocked`, `versionchange`, Late-Success und Connection-Reopen werden über eine Store-Epoch fail-closed koordiniert. Eine veraltete Connection oder Transaktion kann keinen Erfolg an den Controller liefern. | IDB-Lifecycle darf weder Handle-Leaks noch falschen Erfolg erzeugen. | S3, IDB |
| D-ACT-R7-35 | 2026-08-09 | Generation-, Sequenz- oder Revisionsoverflow wird nie gewrappt. Der betroffene Save/Discard bleibt blockiert beziehungsweise degradiert und behauptet keinen Erfolg. | Safe-Integer-CAS muss auch an theoretischen Grenzwerten korrekt bleiben. | S3, Overflow |
| D-ACT-R7-36 | 2026-08-09 | Exceptions aus `enqueue` oder Statussubscribern werden an der Recoverygrenze abgefangen. Enqueuefehler degradieren sichtbar; Subscriberfehler ändern weder Draft noch Coordinator. | Fremde UI-/Testcallbacks dürfen die RAM-Mutation oder Storagewahrheit nicht beschädigen. | S3, Robustness |

<!-- markdownlint-enable MD013 -->

## Owner-Briefing-Bedarf

- Erklärmodus:
  - `Briefing + S6-Recap`.
- Neue oder entscheidungsrelevante Konzepte:
  - IndexedDB als lokale Ausfallsicherung, nicht als historische Wahrheit;
  - Compare-and-Swap, Slotgeneration, Schreibsequenz und Tombstone;
  - Unterschied zwischen transientem Storagefehler und echtem Mehrtabkonflikt;
  - Grenze zwischen lokaler Recovery, Backup und Cloud-Sync.
- Geplante Briefing-Gates:
  - S2 fasst den finalen technischen Vertrag in Alltagssprache zusammen;
  - kein erneutes Owner-Gate, solange die festgelegten Grenzen unverändert
    bleiben;
  - S6 erklärt das reale Ergebnis und die verbleibende R8-Grenze.
- Nicht erneut zu erklären:
  - normale JavaScript-, CSS-, DOM- und Contracttest-Syntax.

## Scope und Grenzen

In Scope:

- strikte Rehydration eines vollständigen Draft-v3-Snapshots;
- neue isolierte Activity-V2-Recovery-Schicht unter
  `AppModules.activityV2.sessionRecovery`;
- eigener IndexedDB-Adapter mit genau einem logischen Slot;
- Recovery-Envelope, CAS, Autosave-Koaleszierung, Flush und Tombstone;
- Recovery-/Statusintegration in die weiterhin isolierte Session-Shell;
- kontrollierte Continue-/Discard-Darstellung im isolierten Harness;
- deterministische Fake-Storage-Tests und reale IndexedDB-Browsernachweise;
- gezielte Doku-, QA- und Masterplan-Synchronisierung in S6.

Nicht in Scope:

- Activity V1, produktive Navigation oder Scriptload;
- Supabase-Commit, Sessionhistorie, Korrektur, Löschung oder Coaching-Export;
- Android-Prozess-Reclaim, Service Worker oder produktiver PWA-Cutover;
- Cross-Device- oder Cross-Browser-Synchronisierung;
- mehrere lokale Draftslots, Draftarchiv oder automatische Retention;
- stille Recovery-/Draftmigration oder Katalogupgrade;
- BroadcastChannel, `navigator.locks`, Cloud-Lock oder neue Dependency ohne
  nachgewiesenen Bedarf;
- Verschlüsselungs-/Passphrase-Infrastruktur;
- R8-R14-Funktionalität.

Roadmap-spezifische Guardrails:

- Recovery ist nur erfolgreich, wenn der persistierte Postzustand bestätigt
  ist. UI-Copy darf Absicht nicht als Erfolg ausgeben.
- Der Draft bleibt die fachliche RAM-Wahrheit während einer offenen Session;
  IndexedDB ist nur Recovery-Kopie.
- Der Recovery-Envelope darf keine abgeleiteten UI-, History-, Parser- oder
  Validitätszustände speichern.
- Ein Mehrtabkonflikt wird nicht automatisch gemergt, übernommen oder durch
  spätere höhere Revisionen kaschiert.
- Keine vollständigen Draftpayloads in Roadmap, Evidence, Diagnose oder Logs.

## Scope-Freeze vor S4

- Bestehende Features:
  - Activity V1 bleibt vollständig sichtbar und aktiv;
  - R3-R6-Shell, Suche, Historie und Editorverhalten bleiben fachlich erhalten;
  - R7 ergänzt nur eine isolierte Recovery-Grenze.
- Datenmodell, Lifecycle und Retention:
  - Supabase unverändert;
  - neue lokale IndexedDB mit genau einem Slot und ohne Draftretention;
  - Draft v3 unverändert, Recovery-Envelope v1 additiv;
  - Löschen nur durch atomaren bewussten Discard, R8 später nach Commit.
- Cleanup, Scheduler, Secrets und externe Automationen:
  - keine Scheduler, Secrets, GitHub Actions oder Remote-Automationen;
  - lokaler Autosave-Scheduler ist injizierbar und kein Hintergrunddienst.
- Kompatible Producer und Consumer:
  - `session-draft.js`, `session-shell.js`, Semantik v1/v2,
    der storagefreie `session-shell-harness.html`, der neue
    `session-recovery-harness.html` und zugehörige Contracttests;
  - R2-`request_id` bleibt spätere Commit-Identität;
  - R4-Historie bleibt read-only.
- Offene Grundsatzfragen:
  - `none`; S1-S3 dürfen nur technische Details innerhalb dieses Vertrags
    präzisieren.
- Umgang mit späterem Scope-Wechsel:
  - kleine technische Präzisierung: gezielte S2/S3/S4R-Korrektur;
  - Cross-Device, Produktintegration, Supabase oder neues Recovery-Produktziel:
    Follow-up beziehungsweise zuständige R8-/R12-Roadmap.

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
- `docs/archive/MIDAS Activity V2 R6 Duration and Distance Editor Roadmap (DONE).md`
- `docs/qa/health-capture-reports.md`
- `app/modules/vitals-stack/activity/v2/session-draft.js`
- `app/modules/vitals-stack/activity/v2/session-draft.contract.test.js`
- `app/modules/vitals-stack/activity/v2/session-shell.js`
- `app/modules/vitals-stack/activity/v2/session-shell.contract.test.js`
- `app/modules/vitals-stack/activity/v2/session-shell.css`
- `app/modules/vitals-stack/activity/v2/session-shell-harness.html`
- `app/modules/vitals-stack/activity/v2/semantics.js`
- `app/modules/vitals-stack/activity/v2/semantics-v2.js`
- `app/modules/vitals-stack/activity/v2/semantics-v2.contract.test.js`

Nur bei konkreter Vertragsfrage:

- `docs/archive/MIDAS Activity V2 R2 Unified Database and Commit API Roadmap (DONE).md`
- `docs/archive/MIDAS Activity V2 R2 Unified Database and Commit API Evidence (DONE).md`
- `docs/archive/MIDAS Activity V2 R3 Shared Session Draft and UI Shell Roadmap (DONE).md`
- `docs/archive/MIDAS Activity V2 R4 Search and Last-Performance Lookup Roadmap (DONE).md`
- `docs/archive/MIDAS Activity V2 R5 Strength Set Editor Roadmap (DONE).md`
- bestehende IndexedDB-/Storage-Dateien im Repo nur für Naming-, Boot- und
  Nicht-Kopplungsfragen.

## Tool Permissions und Gates

Allowed:

- read-only Repo- und Git-Inspektion;
- lokale Activity-V2-JS-/CSS-/Harness-/Teständerungen nach grünem S4R;
- Node-Syntax- und Contracttests;
- lokaler statischer Server und isolierte Browser-/IndexedDB-Smokes;
- browserseitiges Löschen ausschließlich der neuen R7-Testdatenbank im
  isolierten Harness;
- CodeRabbit in S5 gemäß `docs/DEV_ENVIRONMENT.md`;
- Roadmap-, Evidence-, QA- und Module-Overview-Sync.

User-gated:

- neue Produktentscheidung oder Scope-Ausweitung;
- Produktload, Deploy, Supabase, Android-Gerät oder echte produktive Session;
- neue Dependency oder Systemwerkzeug mit Repo-/Systemwirkung.

Forbidden:

- Secrets ausgeben oder committen.
- fremde Worktree-Änderungen zurücksetzen.
- `healthlog_db`, Activity V1, SQL/RPC/RLS/Grants oder `index.html` ändern.
- echte Gesundheitsdaten in Fixtures, Evidence oder Logs schreiben.
- Browserprofil-, Site-Daten- oder andere bestehende IndexedDB-Datenbanken
  pauschal löschen.
- S4 innerhalb der autonomen Discovery Wave starten.

## R7-Speichervertrag

S2 validiert die technische Form am realen Code und friert sie vor S4 final
ein. Folgende Semantik ist bereits verbindlich:

- Datenbank: `midas_activity_v2_recovery`
- Datenbankversion: `1`
- Object Store: `session_recovery`
- logischer Key: `active_session`
- Recovery-Schema: `midas.activity-session-recovery.v1`
- genau ein JSON-kompatibler Record ohne personenbezogene Zusatzmetadaten

Kanonische Recordform:

```text
slot_key
recovery_schema_version
slot_generation
write_sequence
lease_token
request_id
persisted_revision
saved_at
draft
```

Invarianten:

- `slot_key === "active_session"`.
- Generation und Sequenz sind nichtnegative Safe Integers.
- Jeder vorhandene kanonische aktive Record oder Tombstone besitzt ein
  syntaktisch gültiges UUID-`lease_token`. Nur der logisch fehlende Record hat
  kein Token.
- Ein aktiver Record enthält Request-ID, Revision mindestens 1, gültige
  Savezeit und den vollständigen Draft v3 mit identischen Kontrollwerten.
- Ein leerer Tombstone enthält `request_id`, `persisted_revision`, `saved_at`
  und `draft` exakt als `null`.
- Ein fehlender Record wird logisch wie ein leerer Startzustand mit Generation
  0 und Sequenz 0 behandelt.
- Keine zweite Tabelle, kein zweiter Slot und kein historischer Record.
- Storageadapter und Recoverycontroller geben keine veränderbaren Record- oder
  Draftreferenzen nach außen.

## R7-Compare-and-Swap-Vertrag

Jede Instanz arbeitet mit einer beobachteten lokalen Lease aus
`slot_generation` und `write_sequence`.

Ein Save darf nur committen, wenn innerhalb derselben IndexedDB-
Readwrite-Transaktion gilt:

1. Lease-Token, Generation und Sequenz entsprechen exakt der beobachteten
   Lease.
2. Ein leerer Slot darf die erste Request-ID dieses Branches aufnehmen.
3. Bei aktivem Slot stimmt die Request-ID exakt überein.
4. Die gespeicherte Revision entspricht der erwarteten persistierten Revision.
5. Der neue Snapshot besitzt innerhalb desselben Branches eine höhere
   Revision.

Nach erfolgreichem Save bleibt das Lease-Token gleich, die Schreibsequenz
steigt genau einmal und die Instanz übernimmt die neue Lease. Beim ersten
Write in einen wirklich fehlenden Slot wird ein neues Lease-Token erzeugt.
Ein abweichender Wert ist `conflict`, nicht `storage_error`. Der Controller
stoppt weitere automatische Writes dieses Branches, hält den RAM-Draft offen
und zeigt die Konfliktwarnung.

Ein Discard:

1. stoppt beziehungsweise koordiniert neue Autosaves derselben Instanz,
2. wartet einen bereits gestarteten lokalen Write kontrolliert ab,
3. prüft die beobachtete Lease erneut in einer Readwrite-Transaktion,
4. erhöht bei einem gültigen Kontrollrecord die Slotgeneration genau einmal
   und rotiert das Lease-Token; ein blockierter Record mit unbrauchbarer
   Generation erhält Generation 1 plus frisches Token,
5. setzt Sequenz auf 0 und entfernt Request, Revision, Savezeit und Draft,
6. beendet erst nach bestätigtem Transaktionserfolg den alten Controller als
   terminal, löst seine Listener und schließt die Shell.

Jeder alte R7-Writer vergleicht auch das Lease-Token und kann deshalb selbst
nach einem Corrupt-Discard mit reparierter Generation den Tombstone nicht
ersetzen. Der alte Draft/Controller wird danach nicht zurückgesetzt oder erneut
verwendet. Eine spätere neue Session erzeugt einen frischen Draft und
Recoverycontroller. Scheitert die persistente Invalidierung, bleibt der alte
Controller dagegen aktiv und die Shell offen.

Ein Write aus einer älteren Generation kann den Tombstone nicht ersetzen.
Kann ein unbekannter oder beschädigter Record nicht normal rehydriert werden,
muss auch dessen bewusstes Verwerfen gegen den unmittelbar zuvor beobachteten
Recordzustand geschützt sein; eine zwischenzeitliche Änderung führt zum
Konflikt statt zum unbedingten Löschen.

## R7-Autosave- und Lifecycle-Vertrag

- Mutationserfolg wird am tatsächlich zurückgegebenen Draftsnapshot erkannt.
- Gibt eine Mutation dieselbe Snapshotreferenz zurück, entsteht kein Save.
- Wirft die Mutation, bleibt Recovery unverändert.
- Ein Snapshot mit Revision größer 0 gilt als berührt, auch wenn der Nutzer
  sichtbare Felder später wieder leert.
- Es läuft höchstens ein persistenter Write pro Controller.
- Während eines Writes ersetzt ein neuerer Snapshot nur den Pending-Snapshot;
  Zwischenrevisionen müssen nicht einzeln geschrieben werden.
- Der Status `saved` darf erst gelten, wenn genau der neueste bekannte
  Snapshot persistiert ist und kein neuerer Write oder Pending-Snapshot mehr
  wartet. Ein erfolgreicher Zwischenwrite hält den Status auf `saving`.
- Pending-Coalescing ist nur innerhalb derselben Request-ID und Lease zulässig.
- Nach einem transienten Storagefehler bleibt der aktuelle Snapshot im RAM.
  Erst eine spätere echte Mutation oder ein expliziter Flush versucht erneut
  zu sichern.
- Nach einem CAS-Konflikt gibt es keinen automatischen Retry oder Takeover.
- `visibilitychange: hidden` und `pagehide` fordern einen sofortigen
  bestmöglichen Flush an. Die Oberfläche wartet beim Verlassen nicht
  synchron, und dieser Hook ist nicht die primäre Durability-Garantie.
- `destroy` entfernt Listener und Statusabonnements. Bereits gestartete
  Transaktionen dürfen nur noch den durch ihre Lease erlaubten Record
  abschließen und keine zerstörte UI patchen.
- Jeder enqueued Callback trägt die aktuelle Controller-Epoch. Discard und
  Destroy erhöhen sie vor weiterem Await; ein Callback mit alter Epoch ist ein
  No-op. Nach Destroy darf kein Pending-Write mehr beginnen.
- Wurde wegen eines initialen Open-/Readfehlers noch keine Observation
  erworben, muss der erste spätere Write zuerst `read()` ausführen. Nur
  `missing` oder der bereits beobachtete Tombstone darf übernommen werden;
  jeder aktive oder blockierte Record wird zum terminalen Konflikt.

## R7-Restore-Vertrag

- `sessionDraft` erhält eine explizite strikte Restore-Fabrik. S2 friert die
  exakte Signatur innerhalb des bestehenden Namespace ein.
- Restore validiert zuerst die exakte Draft-v3-Top-Level- und Item-/Setform.
- Die injizierte Semantik muss dieselbe `catalog_version` liefern wie der
  gespeicherte Draft.
- Jeder Itemkey, Trackingmodus, jede Feldpolicy, Reihenfolge, Grenze und jeder
  Rohwert wird gegen diese gespeicherte Katalogversion geprüft.
- Restore bewahrt `request_id`, `revision`, `started_at`, `note`, Itemfolge,
  Setfolge und sämtliche Rohwerte exakt. Es spielt keine Mutationen nach und
  erzeugt keine neue Identität.
- Öffentliche Snapshots bleiben tief eingefroren. Timerberechnung verwendet
  weiterhin die gespeicherte Startzeit und die injizierte aktuelle Uhr.
- Abgeleitete `empty`, `partial`, `complete` und `invalid`-Zustände sowie
  History-/Lookupzustände werden nicht gespeichert und beim Rendern neu
  bestimmt.
- Unbekanntes Recovery-Schema, unbekanntes Draftschema, ungültige Form,
  Kontrollwertabweichung oder nicht auflösbare Katalogversion ergeben einen
  blockierten Recoveryzustand. Es gibt keine stille Migration oder Löschung.

## R7-UX-, Copy- und Fehlervertrag

Recovery Gate bei gültigem Draft:

- Titel: `Unvollständige Session gefunden`
- ruhige Metadaten: Startzeit, letzter lokaler Speicherzeitpunkt und Anzahl
  ausgewählter Einträge
- Aktionen: `Session fortsetzen` und `Session verwerfen`
- keine automatische Fortsetzung, Countdown- oder Ablaufcopy

Blockierter beschädigter oder unbekannter Record:

- klare Meldung, dass die lokale Session nicht sicher wiederhergestellt werden
  kann;
- kein Start als vermeintlich leere Session;
- Aktion `Lokale Session verwerfen` erst nach erneuter Bestätigung und nur über
  den gegen den beobachteten Record geschützten Discardpfad.

Aktive Session:

- transient: `Wird lokal gesichert …`
- Erfolg: `Lokal gesichert`
- degradierter Fehler: `Lokale Wiederherstellung derzeit nicht garantiert.`
- Konflikt: `Die Session wurde in einem anderen Tab verändert. Bitte neu
  laden, bevor du sie lokal weiter sicherst oder verwirfst.`

Fehlerregeln:

- Meldungen nennen keine Draftinhalte, Datenbankinternas oder vollständigen
  Rohfehler.
- Warnungen bleiben sichtbar, bis ein nachweisbarer Erfolg oder ein bewusster
  Zustandswechsel sie ablöst.
- Ein Quota-/Open-/Abortfehler blockiert Eingaben nicht.
- Ein Restore- oder CAS-Konflikt wird nicht als normaler leerer Startzustand
  dargestellt.
- Ein fehlgeschlagener Discard behält Shell, Draft, Fokus und verständliche
  Wiederholmöglichkeit.
- Kein Erfolgstoast pro Set-/Itemeingabe; `aria-live="polite"` für normalen
  Status, verständliche Fehlersemantik für Warnungen.

## Statusmatrix

<!-- markdownlint-disable MD013 -->

| ID | Schritt | Reasoning | Status | Kompaktes Ergebnis |
| --- | --- | --- | --- | --- |
| S1 | System- und Vertragsdetektivarbeit | `Extra High` | DONE | Frische Baseline grün; Draft-/Consumer-/Lifecycle-/Storagegrenzen vollständig am Repo kartiert; Full Review und Continuation Gate PASS. |
| S2 | Recovery-, Storage-, API- und UX-Zielvertrag | `Extra High` | DONE | Restore-, Recovery-, Store-, State-, Shell- und Harness-API exakt eingefroren; Full Review und Continuation Gate PASS. |
| S3 | Datenverlust-, Concurrency-, Security- und Umsetzungsreview | `Extra High` | DONE | Race-, Corrupt-, IDB-, Privacy-, UI- und Rollbackmatrix red-teamed; sechs Findings korrigiert; Full Review und Gate PASS. |
| S4R | S4 Readiness Review | `Extra High` | DONE | `READY`; API-, Risiko-, Evidence-, Invalidation- und Rollbackgrenzen bestätigt; sichere Blöcke A-C empfohlen; S4 nicht begonnen. |
| S4.1 | Strikte Draft-v3-Rehydration | `High` | DONE | Additive `restore`-Fabrik validiert Draft v3 und exakte Semantik strikt, bewahrt Identität/Rohwerte referenzgleich und bleibt ohne Storage- oder Produktwirkung; Consumer Review PASS. |
| S4.2 | IndexedDB-Slot, CAS und Tombstone | `Extra High` | DONE | Fester IDB-v1-Slot, vollständige geschützte Observation, Token-/Lease-CAS, Transaction-Complete-Erfolg und Generationstombstone fail-closed implementiert; S4.2-Review PASS. |
| S4.3 | Autosave-Coordinator und Recovery-Fassade | `Extra High` | DONE | Exakte Fassade/Controller/Managed-Draft-API, serialisiertes Autosave, Latest-Pending, Retry/Conflict, Lifecycle und persistent-first Discard implementiert; gemeinsamer Block-B-Full-Review PASS. |
| S4.4 | Shell-, Status- und Discard-Integration | `High` | DONE | Optionale Recovery-Injektion, dedizierte Statusregion und persistent-first Async-Discard implementiert; Consumer Review PASS. |
| S4.5 | Isoliertes Recovery-Harness und Browserfixtures | `High` | DONE | Separates Gate/Harness, kontrollierte Fixtures, reale IDB-/Reload-/Discard-/Conflict-/Lifecycle- und Viewportnachweise; gemeinsamer Block-C-Consumer-Review PASS. |
| S5 | Integrierte Tests, Full Review und CodeRabbit | `Extra High` | DONE | Vollständige lokale/statische Matrix und gezielter Edge-Alertdialog PASS; nativer Full Review PASS; berechtigte Findings korrigiert; finaler CodeRabbit-Re-Review `0 Findings`. |
| S6 | Doku-Sync, Owner-Recap und Archiv | `High` | DONE | Module Overview, Masterplan und HCR-025 synchronisiert; Changelog bewusst unverändert; finaler Full Contract Review PASS; Roadmap und Evidence als `(DONE)` archiviert. |

<!-- markdownlint-enable MD013 -->

## Findings

<!-- markdownlint-disable MD013 -->

| ID | Severity | Typ | Status | Entscheidung / Zielschritt |
| --- | --- | --- | --- | --- |
| F-ACT-R7-01 | P1 | Contract | fixed | `saved_at` war im Masterplan missverständlich als Draftinhalt lesbar. Es ist jetzt ausschließlich Envelope-Metadatum; Draft v3 bleibt unverändert. |
| F-ACT-R7-02 | P1 | Concurrency | fixed | `request_id` plus höhere Revision verhindert einen Same-Request-Fork nicht. CAS umfasst jetzt Generation, Schreibsequenz, Request-ID und erwartete persistierte Revision. |
| F-ACT-R7-03 | P1 | Lifecycle | fixed | Vollständiges Löschen ohne Generationstombstone erlaubte stale Resurrection. Discard invalidiert jetzt atomar die Generation und behält einen leeren Kontrollzustand. |
| F-ACT-R7-04 | P1 | UX/Data loss | fixed | Ein persistenter Discardfehler darf die RAM-Session nicht dennoch schließen. Reihenfolge und Fail-closed-Verhalten sind eingefroren. |
| F-ACT-R7-05 | P2 | Product | fixed | „Ein Single-User-Slot“ war als geräteübergreifend missverständlich. Der Vertrag nennt jetzt Browserprofil und Origin sowie keinen Cross-Device-Sync. |
| F-ACT-R7-06 | P2 | Durability | fixed | `pagehide` durfte nicht als belastbare Hauptsicherung erscheinen. Sofortiges Autosave ist primär; Lifecycle-Flush bleibt best effort. |
| F-ACT-R7-07 | P1 | Catalog | fixed | Restore benötigt Semantik exakt zur gespeicherten Katalogversion. Resolver- und Versionsgleichheitsvertrag wurden ergänzt. |
| F-ACT-R7-08 | P2 | Evidence | fixed | Concurrency-, CAS- und Tombstone-Nachweise lösen den Evidence-Vertrag aus. Separate aktive Evidence-Datei wurde angelegt. |
| F-ACT-R7-09 | P1 | Scope | fixed | Android-Prozess-Reclaim und Commitbereinigung waren als R7-Ergebnis missverständlich. Beide bleiben explizit R8 vorbehalten. |
| F-ACT-R7-10 | P2 | Privacy | fixed | Lokale Persistenz brauchte eine klare Datenschutzgrenze. Keine Payloadlogs und keine neue Schlüsselverwaltung sind eingefroren. |
| F-ACT-R7-11 | P1 | Discard | fixed | Nach einem erfolgreichen Tombstone durfte der Ablauf nicht noch von `draft.discard()` und einem potenziell fehlschlagenden RAM-Neuaufbau abhängen. Der alte Controller wird jetzt terminal beendet; neue Sessions erhalten einen frischen Controller. |
| F-ACT-R7-12 | P1 | UX/Durability | fixed | Ein erfolgreicher Zwischenwrite konnte trotz neuerem Pending-Snapshot als `Lokal gesichert` erscheinen. Der Erfolgsstatus ist jetzt an den neuesten bekannten Snapshot gebunden. |
| F-ACT-R7-13 | P1 | Recovery | fixed | Fail-closed bei beschädigtem Record hatte noch keinen expliziten Nutzer-Ausweg. Der geschützte, erneut bestätigte Corrupt-Discard ist jetzt Teil des UX- und CAS-Vertrags. |
| F-ACT-R7-14 | P2 | Evidence | fixed | EV-ACT-R7-L11 war angelegt, aber in der S5-Testmatrix nicht referenziert. T-ACT-R7-17 und -18 verweisen jetzt explizit darauf. |
| F-ACT-R7-15 | P2 | Evidence | fixed | Die vier S1-Baseline-IDs standen nur in der Evidence-Datei. T-ACT-R7-01 bis -03 und -16 referenzieren sie jetzt, damit jeder Evidence-Nachweis einen Roadmap-Owner besitzt. |
| F-ACT-R7-16 | P1 | Storage | fixed | Der vorhandene `healthlog_db`-Wrapper bestätigt Writes teilweise bereits beim Request-Erfolg. R7 übernimmt dieses Muster nicht: Save und Tombstone gelten erst nach `transaction.oncomplete` als erfolgreich. |
| F-ACT-R7-17 | P2 | Harness | fixed | Der bestehende R6-Shell-Harness und sein Negativtest verbieten Persistenz absichtlich. S4.5 erhält deshalb einen separaten `session-recovery-harness.html`; der R6-Harness bleibt storagefrei. |
| F-ACT-R7-18 | P1 | Concurrency | fixed | Ein beschädigter `slot_generation`-Wert ließ keinen sicheren „+1“-Tombstone zu. Ein UUID-`lease_token` ist jetzt Teil jeder Lease und wird beim Discard rotiert; alte R7-Writer können auch nach kontrollierter Generationreparatur nicht wiederauferstehen. |
| F-ACT-R7-19 | P1 | Discard/API | fixed | Ein exakt elfmethodiger Managed-Draft könnte über den alten synchronen Shellpfad vor der Persistenz verworfen werden. Managed `discard()` scheitert jetzt fail-closed; die optionale Shellintegration muss den passenden Recoverycontroller verwenden. |
| F-ACT-R7-20 | P2 | Availability | fixed | Ein IDB-Openfehler vor der ersten Eingabe durfte weder als leerer Slot erscheinen noch die RAM-Nutzung verhindern. Der Controller startet sichtbar `degraded`, darf einen frischen RAM-Draft öffnen und erwirbt vor jedem späteren Write zuerst eine echte Beobachtung. |
| F-ACT-R7-21 | P1 | Lifecycle | fixed | Ein bereits enqueueter, aber noch nicht gestarteter Save konnte nach Discard oder Destroy anlaufen. Controller-Epoch und No-op-Guard erlauben danach nur noch eine tatsächlich bereits gestartete leasegeschützte Transaktion. |
| F-ACT-R7-22 | P1 | Availability/Concurrency | fixed | Nach initialem IDB-Fehler war der spätere Erstwrite ohne erneutes Read missverständlich. Er muss zuerst beobachten; ein inzwischen aktiver oder blockierter Slot wird terminaler Konflikt, niemals überschrieben. |
| F-ACT-R7-23 | P1 | IndexedDB | fixed | `onblocked`, `versionchange` und Late-Success brauchten einen gemeinsamen Handle-/Erfolgsvertrag. Store-Epoch, sofortiges Close veralteter Handles und `transaction.oncomplete` sind jetzt Pflicht. |
| F-ACT-R7-24 | P2 | Overflow | fixed | Safe-Integer-Grenzen für Generation und Sequenz hatten keine explizite Postcondition. Kein Wert wrappt; Save/Discard bleibt ohne persistente Erfolgsaussage blockiert oder degradiert. |
| F-ACT-R7-25 | P2 | Robustness | fixed | Ein werfender Queue- oder Statuscallback durfte eine bereits erfolgreiche RAM-Mutation nicht nachträglich beschädigen. Callbackfehler sind isoliert; nur Enqueuefehler setzt sichtbare Degradation. |
| F-ACT-R7-26 | P2 | Retry | fixed | Decision Log und Autosavevertrag widersprachen sich beim expliziten Flush nach transientem Fehler. D-ACT-R7-16 erlaubt jetzt exakt spätere echte Mutation oder expliziten Flush und weiterhin keinen Timerretry. |
| F-ACT-R7-27 | P2 | Evidence/Ownership | fixed | Implementierungs-Evidence L02-L05 und einzelne S4-Vertragsowner nannten nach S2/S3 noch nicht überall Lease-Token, Controller-Epoch und finalen Discardvertrag. Oracles, Invalidation und S4-Decision-Owner wurden synchronisiert. |
| F-ACT-R7-28 | P1 | Storage/Observation | fixed | Nicht-JSON-kompatible IDB-Werte konnten beim geschützten Clone als scheinbar leeres Objekt erscheinen. Der Adapter akzeptiert nur sicher vollständig vergleichbare JSON-Bäume; andere Werte enden als `STORAGE_ERROR`. |
| F-ACT-R7-29 | P1 | Storage/Security | fixed | Ein eigener JSON-Key `__proto__` durfte beim Clone nicht den Prototyp verändern oder aus der Observation verschwinden. Data-Properties werden jetzt explizit definiert und vollständig verglichen. |
| F-ACT-R7-30 | P1 | Boundary/Storage | fixed | Die erste JSON-Nodegrenze lag unter dem maximal zulässigen Draft-v3-Baum. Die fail-closed Grenze deckt jetzt die vollständigen Item-/Setlimits; eine große neutrale Corrupt-Observation belegt den Pfad. |
| F-ACT-R7-31 | P1 | Discard/Reentrancy | fixed | Der öffentliche Discard-Promise entstand erst nach dem `discarding`-Statuspatch; ein reentranter Subscriber konnte dadurch einen zweiten Discard starten. Promise und Epoch werden jetzt vor Publish fixiert und jeder Late-Start erneut geguardet. |
| F-ACT-R7-32 | P2 | Managed Draft | fixed | Getter waren während `discarding` zusammen mit Mutationen blockiert. Lesen bleibt jetzt bis zum bestätigten terminalen Ende erlaubt; ausschließlich neue Mutationen scheitern fail-closed. |
| F-ACT-R7-33 | P2 | Error Contract | fixed | Ein nicht-stringförmiges Recovery-Schema wurde als unbekannte Version statt ungültiger Record klassifiziert. Nur fremde Stringversionen sind `unknown_recovery_schema`; andere Formen sind `invalid_record`. |
| F-ACT-R7-34 | P2 | Harness/Browser | fixed | Native `confirm()`-Dialoge blockierten die steuerbare externe Browser-Session. Der isolierte Harness verwendet jetzt einen fokussierten asynchronen DOM-Alertdialog; der injizierte Shell-Bestätigungsvertrag bleibt unverändert. |
| F-ACT-R7-35 | P2 | Harness/Fokus | fixed | Nach abgebrochenem Gate-Discard ersetzte das Re-Render den zuvor fokussierten Actionbutton. Der neue gleichartige Actionbutton erhält den Fokus explizit zurück. |
| F-ACT-R7-36 | P2 | Harness/Copy | fixed | Ein vorheriger Abbruchstatus konnte nach erfolgreichem Gate- oder Shell-Discard sichtbar bleiben. Der terminale `destroyed`-Übergang setzt jetzt ausschließlich bestätigte Erfolgscopy. |
| F-ACT-R7-37 | P2 | Harness/Saving | fixed | `saving` wurde publiziert, bevor die verzögerte Browserfixture ihre Freigabefunktion sichtbar registriert hatte. Die Fixture rendert nach Registrierung erneut und bleibt deterministisch steuerbar. |
| F-ACT-R7-38 | P2 | Harness/A11y | fixed | Tab-/Escape-Ereignisse des Bestätigungsdialogs konnten bis in den Shell-Focustrap weiterlaufen. Der DOM-Dialog hält Tab zwischen seinen zwei Aktionen und stoppt beide Tastenereignisse kontrolliert. |
| F-ACT-R7-39 | P2 | Harness/Cleanup | fixed | Der erste Cleanup öffnete nach `deleteDatabase` sofort wieder eine leere R7-DB. Der finale Cleanup lässt die Datenbank gelöscht und bietet erst danach einen bewussten Harness-Reload an. |
| F-ACT-R7-40 | P1 | Storage/Retry | fixed | Ein synchron geworfener `indexedDB.open()`-Fehler konnte vor Zuweisung des Open-Promise bereinigt und danach als dauerhaft gecachte Ablehnung gespeichert werden. Die Ablehnung löscht den Cache jetzt nach der Zuweisung; ein zweiter Open versucht real erneut. |
| F-ACT-R7-41 | P2 | Harness/Storage | fixed | Die Malformed-Fixture schloss ihren rohen IDB-Handle bei Transaktionsfehlern nicht garantiert. Der Handle wird jetzt in `finally` geschlossen. |
| F-ACT-R7-42 | P2 | Harness/API | fixed | Test-APIs konnten nach Cleanup oder fehlgeschlagener Initialisierung auf einen fehlenden Controller zugreifen. Sie liefern jetzt den definierten unavailable-Zustand. |
| F-ACT-R7-43 | P2 | Harness/Diagnostics | fixed | Der Bootstrap setzte ohne `.code` stets einen generischen Fehler und verlor sichere bekannte Identifier. Nur streng geformte Recovery-Codes aus `code` oder `message` werden übernommen; sonst gilt der generische Harnesscode. |
| F-ACT-R7-44 | P2 | A11y | fixed | Die leere polite Recovery-Statusregion wurde mit `display:none` aus dem Accessibility Tree entfernt. Sie bleibt jetzt semantisch vorhanden und behält leer nur Nullhöhe/-abstand. |
| F-ACT-R7-45 | P2 | Tests | fixed | Der Harness-Syntaxtest zählte externe Script-Tags fälschlich als Inline-Scripts. Er filtert `src`-Tags explizit und prüft exakt die zwei realen Inline-Blöcke. |
| F-ACT-R7-46 | P2 | Harness/Fokus | fixed | Nach positiver Bestätigung konnte Fokus auf dem ausgeblendeten Alertdialog verbleiben. Direkter Gate-Discard fokussiert den stabilen Titel; die Shell verwendet denselben Titel als stabilen Close-Opener. |
| F-ACT-R7-47 | P2 | Harness/Display | fixed | Die Metadatenformatierung behandelte nur `null`, nicht `undefined` oder ein ungültiges Datum als fehlend. Alle drei Fälle ergeben jetzt ausschließlich die neutrale Fallbackcopy. |
| F-ACT-R7-48 | P2 | Harness/A11y | fixed | Beim Alertdialog blieben Hintergrund-Siblings semantisch erreichbar. Ihr vorheriger `inert`-/`aria-hidden`-Zustand wird jetzt exakt gesichert, während des Dialogs isoliert und danach restauriert. |
| F-ACT-R7-49 | P2 | Harness/Teardown | fixed | Ein kontrolliert verzögerter Fixture-Write konnte beim Teardown unaufgelöst bleiben. Der einzelne durch den Coordinator garantierte aktive Write wird jetzt explizit abgelehnt; unerwartetes Write-Overlap scheitert sichtbar statt einen Resolver zu überschreiben. |
| F-ACT-R7-50 | P2 | Harness/Bootstrap | fixed | Eine fehlende Activity-V2-Modulfassade konnte synchron vor dem Initialisierungs-Catch werfen. Die Fassade wird jetzt als erste Initialisierungsprüfung validiert und setzt bei Fehler den definierten Harnessstatus. |
| F-ACT-R7-51 | P2 | Documentation/Archive | fixed | Die archivierte Evidence verwies in ihrem Source-of-Truth-Abschnitt noch auf den früheren aktiven Roadmap-Pfad. Der Verweis nutzt jetzt ausschließlich den `(DONE)`-Archivpfad; Archiv-only- und Linkcheck bestätigen den Abschlusszustand. |

<!-- markdownlint-enable MD013 -->

## Initialer Contract Review der Roadmap

Reviewumfang:

- Root-Produktvertrag und permanente Single-User-Grenze;
- Workflow-, Evidence-, Reasoning-, Discovery-Wave- und S5-Vertrag;
- R1-/C2-Katalogverträge und R2-Request-ID-Grenze;
- bewiesener R6-Draft-v3-, Shell-, Timer-, Editor- und Isolationstand;
- Masterplan-R7-/R8-/R12-Grenzen;
- Concurrency, CAS, Autosave, Restore, Discard, Fehler, Privacy und Browser-QA;
- Fresh-Chat-Ausführbarkeit ohne Denkraumwissen.

Ergebnis:

- `PASS`: Ziel, Scope, Architekturgrenzen und nächster Schritt sind eindeutig.
- `PASS`: Alle Entscheidungen aus dem Denkraum stehen in Masterplan,
  Decision Log oder den expliziten R7-Verträgen.
- `PASS`: Keine fachliche Owner-Frage blockiert S1-S4R.
- `PASS`: R7 kann weder Supabase noch Activity V1 oder Produktnavigation
  verändern, ohne eine sichtbare Stop-Bedingung zu verletzen.
- `PASS`: Evidence-Owner, IDs, Invalidation und Archivziel sind eindeutig.
- `PASS`: Der Fresh-Chat-Startprompt erlaubt die autonome Discovery Wave,
  stoppt aber vor S4.
- `PASS`: Mit rund 62 KB und 1.230 Zeilen überschreitet die Roadmap nur den
  dynamischen Zeilen-Prüfpunkt knapp; die zusätzlichen Verträge, Oracles und
  Findings lassen sich nicht verlustfrei als Duplikat entfernen.
- Korrigierte Findings: `F-ACT-R7-01` bis `F-ACT-R7-15`.
- Offene Findings nach Korrektur: `none`.

---

## S1 - System- und Vertragsdetektivarbeit

Reasoning: `GPT-5.6 Sol / Extra High`.

Deterministisch:

1. Pflichtreferenzen in Startkartenreihenfolge lesen.
2. `git status --short`, relevanten Diff und letzten Activity-V2-Commit
   erfassen; fremde Änderungen nicht verändern.
3. Frische Baseline ausführen:
   - vollständige Activity-V2-Contracttests;
   - Katalogcheck;
   - Syntaxcheck aller realen Activity-V2-JS-Dateien.
4. Exakte Draft-v3-Form, öffentliche Methoden, Mutationen, No-ops,
   Rebuildpfade, Freeze- und Timervertrag kartieren.
5. Alle direkten Draftconsumer und Testdoubles erfassen, insbesondere
   Shellvalidator, Close-/Discard-Flow, Semantics-v2-Kompatibilität und
   Harnessinitialisierung.
6. Semantik-v1-/v2-Namespace und die sichere Auflösung einer gespeicherten
   `catalog_version` prüfen.
7. Bestehende IndexedDB-/Storage-Nutzung, Datenbanknamen, Bootreihenfolge und
   Cleanupmechanismen im Repo read-only erfassen. Belegen, dass die neue R7-
   Datenbank `healthlog_db` nicht berührt.
8. Browser-/Node-Testbarkeit ohne neue Dependency prüfen: injizierbarer
   Storage, Zeitgeber, Scheduler und reale IndexedDB im Harness.
9. Bestehende Visibility-, Pagehide-, Destroy-, Fokus- und Racepfade
   kartieren. In S1 keinen visuellen Volltest starten, wenn Code und Tests die
   Frage beantworten.
10. Fakten und technische Ableitungen getrennt dokumentieren.
11. Full Contract Review durchführen, berechtigte Findings innerhalb von S1
    korrigieren und Statusmatrix, Findings und Resume Card aktualisieren.
12. `Internal Continuation Gate S1 -> S2` bewerten und bei PASS automatisch
    fortfahren.

S1 muss mindestens einfrieren:

- frischen Test-/Katalog-/Syntaxstand;
- alle Draftmutations- und Shell-Discardstellen;
- exakte Snapshot- und Katalogversionsconsumer;
- reale bestehende Storagegrenzen und Namenskollisionen;
- produktive Negativgrenze;
- testbare Scheduler-/Storage-/Browserseams;
- offene technische Widersprüche oder `none`.

Ergebnisformat:

- Systemkarte;
- Producer-/Consumer-/Invalidationskarte;
- Fakten versus Ableitungen;
- frische Baseline und geerbte Nachweise;
- Findings/Korrekturen;
- S1-Abnahme und internes Continuation Gate.

Exit: Alle betroffenen und geschützten Schichten sind am realen Code belegt.

### Ergebnis S1

Git- und Baselinestand:

- `git status --short` zeigt vorbestehende Änderungen am Trainingsmodul-
  Masterplan und an drei Workflow-Templates sowie die neue, noch ungetrackte
  R7-Roadmap und Evidence. Keine dieser fremden oder vorbereitenden Änderungen
  wurde zurückgesetzt.
- Letzter Activity-V2-Commit:
  `cdca045bdda1681834c0e257cc8f99234f208306`,
  `feat(activity-v2): add isolated duration and distance editor`,
  2026-08-09T11:23:40+02:00.
- `node --test app/modules/vitals-stack/activity/v2/*.contract.test.js`:
  `85/85 PASS`.
- `node tools/activity-catalog.mjs check`:
  `PASS catalog_version=2 entries=80 alias_appends=47 search_cases=58
  runtime=checked sql=checked`.
- `node --check` über alle zehn realen Activity-V2-JS-Dateien:
  `10/10 PASS`.

System- und Consumerkarte:

<!-- markdownlint-disable MD013 -->

| Schicht | Reale Tatsache | R7-Invalidation |
| --- | --- | --- |
| `semantics.js` / `semantics-v2.js` | Zwei additive, tief eingefrorene Namespaces mit Katalog 1 beziehungsweise 2 und jeweils exakt fünf Methoden; kein Versionsresolver | S4.1 ergänzt nur eine fail-closed Auswahl für gespeicherte Version 1 oder 2; kein Fallback auf „neueste“ |
| `session-draft.js` | Öffentliche API exakt `{ create }`; Controller exakt elf Methoden; Draftschema exakt v3; echte Mutation erzeugt neuen tief eingefrorenen Snapshot, kanonischer No-op behält Referenz; Timer wird aus `started_at` und injizierter Epoch-Clock abgeleitet | S4.1 ergänzt `restore`; alle bisherigen Create-/Mutation-/Freeze-/Timerverträge bleiben Consumerpflicht |
| Draft-Discard | `draft.discard()` erzeugt synchron eine neue Request-ID und einen neuen RAM-Startzustand und re-captured aktuelle Semantik | Ein bestätigter R7-Tombstone darf diesen zweiten, fehlerfähigen Reset nicht aufrufen; alter Recoverycontroller wird terminal |
| Direkte Draftconsumer | Drafttests, Shellvalidator, Semantics-v2-Integrationstest und Shell-Harness; Shell und Testfacades erwarten alle elf Controllermethoden | Restore-API ist additiv; Managed-Draft muss dieselbe Controllerform liefern; Legacy-Mounts ohne Recovery bleiben gültig |
| `session-shell.js` | Mountoptionen enthalten noch kein Recovery; `requestClose()` bestätigt dirty Discard, ruft danach synchron `draft.discard()` und schließt; `destroy()` bewahrt den Draft; nur `visibilitychange` für sichtbaren Timer-Repaint, kein `pagehide` | S4.4 benötigt optionale Recovery-Injektion, asynchron bestätigten persistenten Discard, recovery-only Statuspatch und Listenercleanup |
| Testseams | Node-VM, Fake-DOM, injizierte Semantik, Clock, Request-ID, Timer-Scheduler, Lookup und Confirmation existieren; Storageseam fehlt | S4.2-S4.3 ergänzen injizierbaren Store/Clock/Scheduler ohne neue Dependency; reale IDB bleibt Browsernachweis |
| bestehende IndexedDB | Einzige IDB-Runtime ist `assets/js/data-local.js`: `healthlog_db`, Version 5, Stores `entries` und `config`; produktiv aus `index.html` geladen | Keine Wiederverwendung, kein Versionsbump, keine Storeänderung; neue DB `midas_activity_v2_recovery` |
| Produktgrenze | `index.html`, Service Worker und Activity-V1-Runtime laden oder referenzieren Activity V2 nicht; V1 bleibt einziger produktiver Consumer | statische Negativtests und Diffprüfung bleiben Pflicht |

<!-- markdownlint-enable MD013 -->

Fakten versus technische Ableitungen:

- Fakt: `saved_at` existiert nicht im Draft v3. Ableitung: Es bleibt
  ausschließlich Envelope-Metadatum; kein Draft v4.
- Fakt: Katalog 1 und 2 sind gleichzeitig als feste Namespaces vorhanden.
  Ableitung: Der Resolver darf nur die gespeicherte Ganzzahl exakt auf einen
  vorhandenen Namespace abbilden und muss sonst blockieren.
- Fakt: Der bestehende Produkt-IDB-Wrapper kann Write-Promises vor
  Transaktionscommit erfüllen. Ableitung: R7 braucht einen eigenen Adapter,
  dessen Write-/Discard-Erfolg ausschließlich `transaction.oncomplete`
  bestätigt; Finding F-ACT-R7-16 ist im Vertrag korrigiert.
- Fakt: Der R6-Harness beweist ausdrücklich fehlende Persistenz. Ableitung:
  Ein separater Recovery-Harness erhält den realen IDB-Nachweis, ohne den
  geerbten Shell-Isolationsbeleg umzudeuten; Finding F-ACT-R7-17 ist
  korrigiert.
- Fakt: Browser dürfen asynchrone IDB-Arbeit bei `pagehide` abbrechen.
  Ableitung: unmittelbares Autosave nach Mutation bleibt die einzige primäre
  Sicherung; Hidden/Pagehide fordert nur bestmögliches Flush an.

S1 Full Contract Review:

- Reviewumfang: Root-/Produktgrenzen, vollständiger Draft-v3-Producer und
  seine direkten Consumer, Semantikversionen, Close/Discard, Fokus/Timer,
  vorhandene IDB, Testseams, Baseline, Git-Diff und Evidence B01-B04.
- Korrigierte Findings: F-ACT-R7-16 und F-ACT-R7-17.
- Offene S1-Findings: `none`.
- Geschützte Dateien wurden nicht verändert; keine Runtime-, Storage-,
  Browser-, Netzwerk- oder Produktaktion wurde ausgeführt.
- Ergebnis: `PASS`.
- Internal Continuation Gate S1 -> S2: `PASS`; kein Owner-Gate, kein offenes
  P0/P1 und kein Quellenwiderspruch.

## S2 - Recovery-, Storage-, API- und UX-Zielvertrag

Reasoning: `GPT-5.6 Sol / Extra High`.

Deterministisch:

1. Ziel gegen Masterplan, R6-Draft und Produktguardrails prüfen.
2. Exakte öffentliche Restore- und Recovery-API innerhalb
   `AppModules.activityV2` festlegen; keine unnötige zweite Fassade.
3. Datenbank-, Store-, Key-, Envelope-, Tombstone- und Leaseform anhand des
   R7-Speichervertrags finalisieren.
4. State Machine für `empty`, `recoverable`, `active`, `saving`, `saved`,
   `degraded`, `conflict`, `blocked`, `discarding` und `destroyed` festlegen.
5. Save-CAS, Pending-Coalescing, Flush, transienten Retry und terminalen
   Konflikt vollständig spezifizieren.
6. Discardreihenfolge inklusive aktivem Write, unbekanntem oder beschädigtem
   Record und fehlgeschlagener Invalidierung festlegen.
7. Strikte Restorevalidierung, Katalogresolver, Timererhaltung und
   Ableitungsgrenze festlegen.
8. Shell-/Harness-Handoff, Statussubscription, Fokus, Copy und Accessibility
   festlegen. Bestehende R3-R6-Consumer ohne Recovery müssen weiterhin
   funktionieren.
9. Privacy-, Diagnose-, Site-Daten-, Inkognito- und Cross-Device-Grenzen
   explizit festhalten.
10. Exakte S4-Dateien, öffentliche Methoden, Testoracles und Evidence-IDs
    zuordnen.
11. Owner Briefing in Alltagssprache geben: Was IndexedDB, CAS und Tombstone
    hier leisten und was sie nicht leisten.
12. Full Contract Review durchführen, Findings korrigieren und Statusmatrix,
    Decision Log sowie Resume Card aktualisieren.
13. `Internal Continuation Gate S2 -> S3` bewerten und bei PASS automatisch
    fortfahren.

S2 darf den eingefrorenen Vertrag präzisieren, aber nicht:

- ein Draft v4 allein für Recovery erzeugen;
- mehrere Slots, Cloud-Sync, automatische Merge-/Takeoverlogik oder
  Katalogmigration einführen;
- Produktload, Supabase oder R8-Commitsemantik vorziehen.

Exit: Keine API-, Storage-, UX- oder Fehlergrundsatzfrage bleibt offen.

### Ergebnis S2

Exakte öffentliche APIs:

```text
AppModules.activityV2.sessionDraft
  create(options?)
  restore(snapshot, options?)

AppModules.activityV2.sessionRecovery
  resolveSemantics(catalogVersion)
  createIndexedDbStore(options?)
  open(options) -> Promise<RecoveryController>
```

- `sessionDraft.restore(snapshot, options)` akzeptiert bei `options` nur
  `createRequestId`, `now` und `semantics`, also dieselben kontrollierbaren
  Abhängigkeiten wie `create`. Es erzeugt keine ID, Zeit oder Mutation beim
  Restore. `createRequestId` wird nur für das geerbte spätere rohe
  `draft.discard()` vorgehalten.
- `sessionDraft` besitzt danach exakt die tief eingefrorenen Own-Keys
  `create`, `restore`. Der Restorecontroller besitzt weiterhin exakt die elf
  R3-R6-Methoden und bewahrt den validierten Snapshot zunächst referenzgleich.
- `sessionRecovery.resolveSemantics(version)` akzeptiert nur eine positive
  Safe-Integer-Version, gibt für 1 exakt `semantics`, für 2 exakt
  `semanticsV2` und sonst `null` zurück. Vor Rückgabe muss
  `getCatalog().catalog_version === version` gelten; es gibt keinen
  Höchstversionsfallback.
- `sessionRecovery.createIndexedDbStore({ indexedDB }?)` verwendet nur die
  feste DB-/Store-/Keyform. Es liefert ein eingefrorenes Adapterobjekt mit
  exakt `read`, `save`, `discard`, `close`. `indexedDB` ist ausschließlich
  Testseam; DB-Name, Version, Store und Key sind nicht konfigurierbar.
- `sessionRecovery.open(options)` akzeptiert exakt `storage`, `semantics`,
  `resolveSemantics`, `now`, `createRequestId`, `createLeaseToken` und
  `enqueue`. `storage` und die Semantik für eine neue Session sind Pflicht;
  die übrigen Abhängigkeiten haben lokale Browserdefaults. Keine Option darf
  Netzwerk, Produktload oder freien DB-Namen injizieren.
- Der zurückgegebene Recoverycontroller besitzt exakt `getState`,
  `getDraft`, `startNew`, `continueSession`, `flush`, `discard`, `subscribe`
  und `destroy`. `subscribe(listener)` liefert einen idempotenten Unsubscriber
  und übermittelt sofort den aktuellen tief eingefrorenen Status.
- `getState()` gibt nur die exakten Keys `state`, `started_at`, `saved_at`,
  `item_count`, `reason` aus. Es exponiert weder Draft, Request-ID, Lease noch
  Rohfehler. `reason` ist `null` oder einer der stabilen Codes
  `storage_error`, `conflict`, `unknown_recovery_schema`, `invalid_record`,
  `catalog_unavailable`.
- `getDraft()` ist vor Start/Continue `null` und danach der einzige
  Managed-Draft. Dieser besitzt dieselben elf Keys wie der rohe Controller.
  Acht fachliche Mutationsmethoden werden über Referenzvergleich beobachtet;
  Getter delegieren. Managed `discard()` wirft fail-closed den stabilen Code
  `PERSISTENT_DISCARD_REQUIRED` und verändert RAM oder Storage nicht.

Adapter-, Observation- und Transaktionsvertrag:

- `read()` liefert intern eine tief geklonte, eingefrorene Observation für
  `missing` oder den exakt gelesenen Storewert. Der Recoverycontroller hält
  sie privat; keine veränderbare Recordreferenz verlässt die Schicht.
- `save({ observation, draft, savedAt, leaseToken })` liest innerhalb genau
  einer Readwrite-Transaktion erneut, vergleicht den vollständigen
  beobachteten Wert strukturell und prüft zusätzlich Token, Generation,
  Sequenz, Request-ID sowie persistierte Revision. Erst danach schreibt es den
  vollständig kanonischen aktiven Envelope.
- `discard({ observation, leaseToken })` vergleicht ebenfalls den
  vollständigen beobachteten Wert in derselben Transaktion und schreibt den
  kanonischen Tombstone. Bei gültiger Generation gilt `+1`; bei einem
  blockierten Record mit unbrauchbarer Generation wird sie auf 1 repariert.
  Das immer frische Lease-Token ist die unabhängige Resurrection-Sperre.
- Der private strukturelle Observation-Vergleich deckt alle von R7
  geschriebenen Werte und JSON-kompatible Unknown-/Corrupt-Fixtures ab.
  Nicht sicher vergleichbare Fremdwerte führen zu `storage_error`, niemals zu
  unbedingtem Überschreiben oder behauptetem Discard.
- `save` und `discard` resolven erst auf `transaction.oncomplete`. Request-
  Erfolg, `onblocked`, `onerror`, `onabort`, `versionchange` oder vorzeitiges
  Connection-Close dürfen keinen Erfolg melden. `close()` ist idempotent und
  löscht keine Datenbank.

State Machine:

<!-- markdownlint-disable MD013 -->

| Von | Ereignis / Guard | Nach | Persistente Wirkung |
| --- | --- | --- | --- |
| Init | fehlender Record oder gültiger Tombstone | `empty` | keine; `startNew()` erzeugt nur RAM `active` |
| Init | gültiger aktiver Envelope, exakte Semantik und Restore | `recoverable` | keine; kein stilles Continue |
| Init | unbekanntes Schema, ungültige Form/Kontrollwerte oder fehlende Semantik | `blocked` | keine; nur geschützter bestätigter Discard |
| Init | Storage-Open/Read schlägt fehl | `degraded` | keine; frischer RAM-Start bleibt möglich, vor Write ist eine neue Observation Pflicht |
| `recoverable` | bewusste `continueSession()` | `saved` | keine; gespeicherter Snapshot wird Managed-Draft |
| `empty` / initial `degraded` | `startNew()` | `active` beziehungsweise `degraded` | unberührte Revision 0 schreibt nichts |
| `active` / `saved` / `degraded` | echte erfolgreiche Mutation | `saving` | Zero-delay Enqueue; höchstens ein aktiver Write, nur latest Pending |
| `saving` | Write committed, kein neuerer Stand | `saved` | Sequenz +1, gleiche Generation und gleiches Token |
| `saving` | Write committed, neuerer Pending-Snapshot | `saving` | nächste erlaubte CAS-Runde; noch kein Saved-Status |
| `saving` | Open/Quota/Abort/Transaktionsfehler | `degraded` | Observation/Lease bleiben beim letzten bestätigten Stand; RAM bleibt aktiv |
| schreibfähig | CAS-/Observation-Abweichung | `conflict` | kein Write; Branch terminal für Autosave und Takeover |
| discardfähig | bestätigter Discard startet | `discarding` | neue Managed-Mutationen fail-closed; aktiven lokalen Write abwarten, Pending nicht mehr schreiben |
| `discarding` | Tombstone-Transaktion committed | `destroyed` | Token rotiert, Generation fortgeschaltet/repariert, Payload null; kein RAM-Reset |
| `discarding` | Storagefehler oder Konflikt | vorheriger nutzbarer Zustand, bei Storagefehler `degraded`, bei CAS `conflict` | kein behaupteter Discard; Shell und RAM bleiben offen |
| jeder nicht zerstörte Zustand | `destroy()` | `destroyed` | keine Löschung; UI-Callbacks enden, bereits aktive Transaktion bleibt nur leasegeschützt |

<!-- markdownlint-enable MD013 -->

Autosave-, Discard- und Shell-Handoff:

- Der Managed-Draft liest vor jeder Mutation den Snapshot, delegiert exakt
  einmal und enqueued nur dann, wenn die Rückgabereferenz neu ist. Throws und
  kanonische No-ops verändern Recovery nicht.
- `enqueue` ist eine Zero-delay-Testseam. `flush()` überspringt die Queue,
  wartet den aktiven Write, verarbeitet höchstens den neuesten Pending-Stand
  und darf einen degradierten neuesten Snapshot ausdrücklich erneut versuchen.
- Nach Storagefehler gibt es keinen Timerretry. Nur spätere echte Mutation
  oder explizites `flush()` versucht erneut. Nach `conflict` versuchen beide
  Wege keinen Write.
- `discard()` friert neue Managed-Mutationen ein, verwirft einen vorhandenen
  Pending-Write, wartet den aktiven Write und verwendet dessen bestätigte neue
  Observation oder die unveränderte alte Observation. Erst der bestätigte
  Tombstone zerstört den Controller.
- `sessionShell.mount(...)` erhält den optionalen Mount-Key `recovery`.
  Ohne ihn bleiben alle R3-R6-Pfade byte-for-byte semantisch gleich. Mit ihm
  muss `recovery.getDraft() === draft` gelten; andernfalls schlägt Mount vor
  DOM-Mutation fehl.
- Im Recovery-Mount ruft Close/Escape nach Bestätigung ausschließlich
  `await recovery.discard()` auf. Es gibt keinen anschließenden
  `draft.discard()`- oder zweiten `recovery.destroy()`-Schritt. Fehler lassen
  Controls, Fokus, Timer, History und Shell offen.
- Recoverystatus erhält eine eigene `aria-live="polite"`-Region. Statuspatches
  ersetzen ausschließlich deren Text/Ton und lösen weder Full Render noch
  Draft-, Timer- oder Historyreads aus.
- Das neue `session-recovery-harness.html` besitzt das Continue-/Discard-Gate
  und registriert `visibilitychange: hidden` sowie `pagehide` als
  bestmögliche `flush()`-Aufrufe. Der bestehende R6-Harness bleibt unverändert
  storagefrei.

Privacy- und Diagnosegrenze:

- Zulässige Diagnosewerte sind Operation, stabiler Fehlercode, DB-Version,
  Status und Zähler. Draft, Notizen, Item-/Setwerte, Request-ID, Lease-Token,
  gespeicherte Timestamps und komplette Records werden nicht geloggt.
- Gleicher Origin bedeutet keinen Schutz vor anderem bösartigem Same-Origin-
  Code. CAS verhindert unbeabsichtigte alte R7-Writer, ist aber keine
  Sicherheits- oder Zugriffskontrollgrenze.
- Inkognito-Ende, Site-Datenlöschung, Browser-/Profil-/Geräteverlust bleiben
  Datenverlustgrenzen. R7 ist weder Backup noch Sync und fügt keine
  Verschlüsselungs-/Schlüsselverwaltung hinzu.

S4-Datei- und Evidence-Zuordnung:

- S4.1: `session-draft.js`, `session-draft.contract.test.js`;
  T-ACT-R7-01/-03/-04/-05, EV-ACT-R7-L01.
- S4.2-S4.3: neue `session-recovery.js` und
  `session-recovery.contract.test.js`; T-ACT-R7-06 bis -10,
  EV-ACT-R7-L02 bis -L05.
- S4.4: `session-shell.js`, `session-shell.contract.test.js`, CSS nur für die
  dedizierte Statusregion; T-ACT-R7-01/-09/-11, EV-ACT-R7-L05.
- S4.5: neuer `session-recovery-harness.html` und statische Harnessoracles im
  Recoverytest; T-ACT-R7-12 bis -15, EV-ACT-R7-L06 bis -L09. Der vorhandene
  `session-shell-harness.html` wird nicht zum IDB-Harness umgebaut.

Owner Briefing:

IndexedDB ist hier eine lokale Notkopie der gerade offenen Session. CAS ist
der „Kassenbon“ für den zuletzt wirklich gesehenen Slot: Stimmt er beim
Schreiben nicht mehr, gewinnt kein Tab still. Der Tombstone ist ein leerer,
neu markierter Slot; dadurch erkennt ein alter Tab, dass sein Entwurf bewusst
verworfen wurde. Das hilft bei Reload und Browserprozessverlust im selben
Profil und Origin, aber nicht nach Site-Datenlöschung, auf einem anderen Gerät
oder als Cloud-Backup.

S2 Full Contract Review:

- Reviewumfang: exakte Public-/Managed-/Store-APIs, Envelope, Token-Lease,
  State Machine, Save/Flush/Discard, Restore, Shell-Handoff, Lifecycle,
  Harness, Privacy, Evidence und S4-Dateigrenze.
- Korrigierte Findings: F-ACT-R7-18 bis F-ACT-R7-20.
- Offene S2-Findings: `none`.
- Produktcode blieb unverändert; keine IDB-, Browser-, Netzwerk-, Supabase-
  oder Android-Aktion wurde ausgeführt.
- Ergebnis: `PASS`.
- Internal Continuation Gate S2 -> S3: `PASS`; kein Owner-Gate und keine
  offene API-, Storage-, UX- oder Fehlergrundsatzfrage.

## S3 - Datenverlust-, Concurrency-, Security- und Umsetzungsreview

Reasoning: `GPT-5.6 Sol / Extra High`.

Deterministisch:

1. Alle in S2 eingefrorenen Pfade gegen Datenverlust, falsche Sicherheit,
   stale Writes und falschen Erfolg red-teamen.
2. Mindestens folgende Races prüfen:
   - zwei frische Tabs mit unterschiedlichen Request-IDs;
   - zwei Tabs desselben wiederhergestellten Requests mit gleichem
     Ausgangsstand;
   - höherer lokaler Fork nach verlorenem CAS;
   - Pending-Write während Discard;
   - fremder Discard während aktivem Write;
   - erfolgreicher Tombstone mit anschließend fehlerfähigem RAM-Reset;
   - erfolgreicher Zwischenwrite bei bereits vorhandenem neuerem Pending-Draft;
   - Destroy, Hidden und Pagehide während Save;
   - Storagefehler, anschließende Mutation und Retry;
   - Katalogversion zwischen Save und Restore.
3. Unbekanntes Envelope-Schema, ungültiges Draftschema, beschädigte
   Kontrollwerte, beschädigter Payload und fehlende Semantik prüfen.
4. Prüfen, dass RAM-Session, Fokus, Timer, R4-Historie und aktuelle Rohwerte
   bei Statuspatches und Fehlern erhalten bleiben.
5. XSS-/Log-/Fehlertext-, Same-Origin- und lokale Datenschutzgrenzen prüfen.
6. IDB-Open-, Upgrade-, Blocked-, Versionchange-, Transaction-abort-, Quota-
   und Overflowfälle prüfen.
7. Rollback-/Stopvertrag pro S4-Block festlegen. Kein Mischstand darf einen
   unvalidierten Restore- oder ungeschützten Discardpfad hinterlassen.
8. S4-Schnitt, Reihenfolge, Reviewtiefe, Invalidation Map und gebündelte
   Browserkadenz final ableiten.
9. T-ACT-R7-/EV-ACT-R7-Oracles auf vollständige Postconditions prüfen.
10. Full Contract Review durchführen, Findings korrigieren und Statusmatrix,
    Risikoregister, Evidence-Zuordnung sowie Resume Card aktualisieren.
11. `Internal Continuation Gate S3 -> S4R` bewerten und bei PASS automatisch
    fortfahren.

Verpflichtendes Risikoregister in S3:

<!-- markdownlint-disable MD013 -->

| Risiko-ID | Mindestthema | Blockierende Fehlwirkung | Pflichtgegenmaßnahme |
| --- | --- | --- | --- |
| R-ACT-R7-01 | Revision-only-CAS | Same-Request-Fork überschreibt anderen Tab | Token + Generation + Sequenz + Request + erwartete Revision |
| R-ACT-R7-02 | stale Write nach Discard | verworfener Draft lebt wieder auf | atomarer Generationstombstone |
| R-ACT-R7-03 | Discardfehler | Shell schließt trotz nicht gelöschter Recovery | persistente Invalidierung vor RAM-Discard/Close |
| R-ACT-R7-04 | Restore falscher Katalog | gespeicherte Übung wird umgedeutet | exakter Versionsresolver und Gleichheitscheck |
| R-ACT-R7-05 | stiller Corrupt-Fallback | Datenverlust oder falscher Leerzustand | blockierter Zustand plus bewusster geschützter Discard |
| R-ACT-R7-06 | Quota/Open/Abort | RAM-Session wird unbedienbar oder Erfolg behauptet | degradierter sichtbarer Zustand, späterer Retry |
| R-ACT-R7-07 | Pagehide-Vertrauen | letzter Stand geht trotz behaupteter Sicherung verloren | sofortiges Autosave als Primärgarantie |
| R-ACT-R7-08 | Doppelwrite | Reihenfolge und Lease driften | ein aktiver Write plus Pending-Coalescing |
| R-ACT-R7-09 | Statusrender | Werte, Fokus oder Timer werden überschrieben | recovery-only DOM-Patch und Generationguards |
| R-ACT-R7-10 | Payloaddiagnose | Gesundheitsdaten gelangen in Logs/Fehler | generische Codes und keine Payloadinterpolation |
| R-ACT-R7-11 | Site-Daten/Cross-Device | Recovery wird als Backup missverstanden | klare lokale Produkt- und Copygrenze |
| R-ACT-R7-12 | Produktvorgriff | isolierte Grundlage wird versehentlich sichtbar | statische Script-/Netzwerk-/Produktnegativtests |
| R-ACT-R7-13 | Post-Tombstone-RAM-Reset | Storage ist verworfen, aber ein zweiter Reset schlägt fehl | alten Controller nach Tombstone terminal beenden und nie wiederverwenden |
| R-ACT-R7-14 | verfrühter Saved-Status | UI behauptet Sicherung, obwohl neuerer Snapshot wartet | `saved` nur bei vollständig aufgeholtem Coordinator |
| R-ACT-R7-15 | Queuecallback nach Discard/Destroy | später Save startet trotz terminalem Übergang | Controller-Epoch und No-op-Guard vor jedem Writebeginn |
| R-ACT-R7-16 | degraded Erstwrite | ungesehener bestehender Draft wird übernommen | zwingendes Re-read; aktiver/blockierter Record wird Konflikt |
| R-ACT-R7-17 | IDB blocked/versionchange | veraltetes Handle meldet Erfolg oder blockiert Upgrade | Store-Epoch, Late-Close, Transaction-Commit als einzige Bestätigung |
| R-ACT-R7-18 | Kontrollwertoverflow | Generation/Sequenz wrappt und CAS wird wieder erreichbar | Safe-Integer-Guard; kein Write oder Discard bei Overflow |
| R-ACT-R7-19 | Subscriber-/Queueexception | RAM-Mutation oder Statusmaschine bricht nach Erfolg | Callbackisolation, generischer Code, keine Payloadlogs |
| R-ACT-R7-20 | Corrupt-Discard-Token | Generationreparatur allein trifft alte Lease | frisches UUID-Lease-Token, vollständiger Observation-Vergleich und Token-CAS |

<!-- markdownlint-enable MD013 -->

Exit: Alle P0/P1-Risiken sind geschlossen oder blockieren sichtbar S4.

### Ergebnis S3

Red-Team-Racematrix:

<!-- markdownlint-disable MD013 -->

| Szenario | Deterministische Reihenfolge | Pflichtpostcondition |
| --- | --- | --- |
| Zwei frische unterschiedliche Requests | beide lesen `missing`; A committed zuerst | B vergleicht nicht mehr dieselbe Observation und wird `conflict`; A bleibt einziger aktiver Record |
| Zwei Tabs desselben Restores | beide lesen Token/Generation/Sequenz/Revision identisch; A schreibt | B verliert trotz höherer lokaler Revision den vollständigen CAS; kein Revision-Takeover |
| Mutation nach verlorenem CAS | lokaler Draft mutiert nach `conflict` weiter | RAM bleibt nutzbar, aber weder Mutation noch Flush schreibt automatisch; Warnung bleibt |
| Pending während Discard | aktiver Write plus neuerer Pending; Discard bestätigt | Mutationseingang gesperrt, Pending verworfen, aktiver Write abgewartet, Tombstone auf dessen bestätigter Observation |
| Fremder Discard gegen aktiven Write | IDB serialisiert beide Readwrite-Transaktionen | genau eine Operation gewinnt; die zweite sieht Observation-/Tokenabweichung und überschreibt nicht |
| Tombstone plus alter Queuecallback | Discard rotiert Token und invalidiert Controller-Epoch | Callback ist vor Writebeginn No-op; selbst eine schon aktive Transaktion bleibt zusätzlich token-/leasegeschützt |
| Zwischenwrite plus neuer Pending | Revision n committed, n+1 wartet | Status bleibt `saving`; erst Commit von n+1 ohne weiteres Pending setzt `saved` |
| Storagefehler plus spätere Mutation | Write abortet; RAM mutiert erneut | alte bestätigte Observation bleibt; nur neueste Revision wird bei Mutation/Flush erneut versucht |
| Destroy/Hidden/Pagehide während Save | Lifecycle fordert Flush oder Destroy | Hidden/Pagehide wartet nicht synchron; Destroy verhindert neue Writes/UI-Patches, bereits aktive Transaktion darf leasegeschützt enden |
| Katalogwechsel nach Save | Katalog 2 gespeichert, später weiterer Namespace vorhanden | Resolver wählt weiterhin exakt 2; fehlender Namespace blockiert statt Upgrade |

<!-- markdownlint-enable MD013 -->

Corrupt-, Storage- und Overflowmatrix:

- Unknown Recovery-Schema, falsches Draftschema, zusätzliche/fehlende Keys,
  Kontrollwertabweichung, Draft-/Envelope-Request-Mismatch, ungültige Revision,
  Zeit oder Policy und nicht auflösbare Katalogversion ergeben `blocked`.
  Keine dieser Formen wird als `empty` dargestellt oder beim Read verändert.
- Geschützter Blocked-Discard vergleicht den vollständigen beobachteten Wert.
  Bei zwischenzeitlicher Änderung folgt `conflict`. Bei unbrauchbarer
  Generation entsteht nur nach erfolgreichem Vergleich ein Tombstone mit
  Generation 1 und neuem Token. Nicht sicher vergleichbare Fremdwerte bleiben
  blockiert; es gibt kein unbedingtes `put` oder `delete`.
- `onblocked` beendet den Openversuch sichtbar. Trifft später noch
  `onsuccess` ein, wird das Handle sofort geschlossen und nicht publiziert.
  `versionchange` schließt das aktuelle Handle, erhöht die Store-Epoch und
  lässt alle späteren Calls bis zu kontrolliertem Reopen fail-closed.
- Requestfehler, `transaction.onerror`, `transaction.onabort`, Quota-,
  DataClone-, Version- und NotFound-Fehler können niemals `saved` oder
  bestätigten Discard liefern. Write-Erfolg entsteht nur auf
  `transaction.oncomplete` derselben Store-Epoch.
- Generation, Sequenz, Revision und Item-/Setgrenzen werden vor Addition
  geprüft. Am Safe-Integer-Limit gibt es keinen Wrap, keine Reparatur eines
  gültigen aktiven Records und keinen Erfolgstext.
- `createRequestId`, `createLeaseToken`, `now`, `enqueue`, Storage-Thenables
  und Subscriber werden gegen Throw, falschen Rückgabetyp und Reentrancy
  geprüft. Ein fehlerhafter Subscriber wird entfernt oder ignoriert, ohne
  andere Subscriber oder den Coordinator zu stoppen.

UI-, Security- und Privacyreview:

- Statussubscription patcht nur `.activity-v2-session-recovery-status` per
  `textContent`; Draftinputs, Fokus, Auswahlbereiche, Timer und R4-Historie
  behalten Node-Identität und Werte. Async-Callbacks prüfen Shell- und
  Controllergeneration vor DOM-Wirkung.
- Recoverymetadaten werden erst nach strikter Validierung formatiert. Keine
  Record-, Notiz-, Item-, Set-, Request- oder Tokenwerte gelangen in HTML,
  Logs, Fehlertexte, Fixtures oder Evidence.
- Die getrennte DB ist same-origin und damit keine Zugriffskontrolle gegen
  anderen Same-Origin-Code. Es gibt keinen Netzwerkpfad, Cross-Device-
  Anspruch, Backup, stillen Merge, stille Migration oder neue Kryptografie.
- Fixtures verwenden nur synthetische IDs, Katalogkeys und neutrale Rohwerte.
  Reale Gesundheits- oder Draftdaten sind für keinen S4-/S5-Nachweis nötig.

Rollback- und Stopvertrag:

<!-- markdownlint-disable MD013 -->

| Block | Atomarer Ausführungsschnitt | Rollback / Stop |
| --- | --- | --- |
| A / S4.1 | nur additive Restore-API und Drafttests | bei Consumerbruch beide Deltas zurücknehmen; `create` bleibt alleinige API; kein Storage-/Produktload existiert |
| B / S4.2-S4.3 | Recoverydatei und Recoverytests gemeinsam, intern Adapter vor Coordinator | bei offenem CAS-/Tombstone-P0/P1 gesamten Block B zurücknehmen; keine Shell/Harness-Referenz darf verbleiben; Block A darf isoliert bestehen |
| C / S4.4-S4.5 | optionale Shellintegration, eigener Recovery-Harness, CSS/Testdeltas | bei UI-/Lifecyclebruch gesamten Block C zurücknehmen; Recoverycore bleibt unreferenziert und produktiv unsichtbar; bestehender R6-Harness bleibt gültig |

<!-- markdownlint-enable MD013 -->

Stopbedingungen innerhalb S4:

- Jede notwendige Änderung an Activity V1, `index.html`, Service Worker,
  `healthlog_db`, R2-Data-Access/Commit oder Supabase stoppt den Block.
- Block B stoppt bei ungeschütztem Write/Discard, zweitem aktiven Write,
  falschem Transaktionserfolg oder möglicher Resurrection.
- Block C stoppt, wenn Recovery nicht optional bleibt oder Status-/Asyncpfade
  Rohwerte, Fokus, Timer oder History ersetzen.
- Ein blockierter realer IDB-Nachweis verhindert S5/S6, aber löst weder
  Produktload noch Android-/Netzwerkersatz aus.

Invalidation und Browserkadenz:

- Block A invalidiert T-ACT-R7-01/-03/-04/-05 und EV-ACT-R7-L01.
- Block B invalidiert T-ACT-R7-03/-06 bis -10 und EV-ACT-R7-L02 bis -L05.
- Block C invalidiert T-ACT-R7-01/-03/-09/-11 bis -16 und
  EV-ACT-R7-L05 bis -L10.
- Erst nach vollständigem Block C wird ein lokaler Server gestartet. Ein
  Browserlauf bündelt Save/Reload/Continue/Discard, Zwei-Controller-Konflikt,
  Hidden/Pagehide und die Viewports; Cleanup schließt Handles und betrifft nur
  `midas_activity_v2_recovery`.

S3 Full Contract Review:

- Reviewumfang: alle Pflicht-Races, Corrupt-/Unknown-Fälle, IDB-Lifecycle,
  Overflow, Callbackreentrancy, Fokus/Timer/History, XSS/Logs/Privacy,
  Rollback, Invalidation, Evidence und Produktnegativgrenze.
- Korrigierte Findings: F-ACT-R7-21 bis F-ACT-R7-26.
- Offene S3-Findings: `none`; alle P0/P1-Risiken sind vertraglich geschlossen
  oder führen fail-closed zu `conflict`, `blocked` oder `degraded`.
- Produktcode blieb unverändert; kein Browser, Storagewrite, Netzwerk,
  Supabase, Deploy oder Android-Eingriff wurde ausgeführt.
- Ergebnis: `PASS`.
- Internal Continuation Gate S3 -> S4R: `PASS`; kein Owner-Gate, kein offenes
  In-Scope-P0/P1 und kein unauflösbarer Widerspruch.

## S4 Readiness Review

Reasoning: `GPT-5.6 Sol / Extra High`.

S4R liest die finalen S1-S3-Ergebnisse, den realen Gitstand, die Evidence-
Datei und nur die tatsächlich betroffenen Codepfade erneut.

Vorläufiger S4-Schnitt, in S4R gegen den realen Stand zu bestätigen:

<!-- markdownlint-disable MD013 -->

| Substep | Änderung | Primäre Dateien | Review | Checks / Evidence | Gate |
| --- | --- | --- | --- | --- | --- |
| S4.1 | strikte Draft-v3-Rehydration und Katalogversionsbindung | `session-draft.js`, Drafttests, direkte Snapshotconsumer | Consumer | T-ACT-R7-01/-03/-04/-05; EV-ACT-R7-L01 | none |
| S4.2 | isolierter IDB-Adapter, Envelope, Token-/Lease-CAS und Tombstone | neue `session-recovery.js`, Recoverytests | Full im Block B | T-ACT-R7-06/-07/-08/-10; EV-ACT-R7-L02/-L03 | none |
| S4.3 | Recoverycontroller, Managed-Draft, Autosave, Flush, Fehler und Discard | `session-recovery.js`, Recovery-/Drafttests | Full im Block B | T-ACT-R7-06 bis -11; EV-ACT-R7-L02 bis -L05 | none |
| S4.4 | bestehende Shell optional an Recoverystatus und asynchronen Discard anbinden | `session-shell.js`, Shelltests, CSS bei Bedarf | Consumer | T-ACT-R7-01/-09/-11/-12; EV-ACT-R7-L05 | none |
| S4.5 | isoliertes Recovery Gate und reale IDB-Fixtures | neuer `session-recovery-harness.html`, optional gemeinsames CSS, Shell-/Recoverytests; bestehender R6-Harness bleibt storagefrei | Consumer | T-ACT-R7-12 bis -15; EV-ACT-R7-L06 bis -L09 | optional visuelle Owner-Abnahme |

<!-- markdownlint-enable MD013 -->

S4R muss zusätzlich dokumentieren:

- exakte API- und Dateigrenze aus S2;
- Risikozuordnung aus S3;
- Evidence-IDs und Invalidation Map;
- Rollback pro Ausführungsblock;
- ob der bestehende Harness erweitert oder ein enger Recovery-Harness
  erforderlich ist;
- ob S4.2-S4.3 als gemeinsamer Concurrencyblock sicher ausführbar bleiben;
- ob S4.4-S4.5 als gemeinsamer UI-/Harnessblock sicher ausführbar bleiben;
- dass S4.1 einen wiederherstellbaren Draft erzeugt, aber ohne Storage noch
  keinen halben produktiven Recoverypfad lädt;
- dass kein Owner-Gate oder offene Grundsatzfrage S4 blockiert.

Vorläufig empfohlene Ausführungsblöcke:

- Block A: S4.1 separat wegen Draft-API und breiter Consumergrenze.
- Block B: S4.2 + S4.3 gemeinsam wegen gemeinsamem Lease-/CAS-/Rollbackvertrag.
- Block C: S4.4 + S4.5 gemeinsam wegen Shell-, Copy-, CSS- und Harnessgrenze.

Exit: S4 kann ohne neue Grundsatzentscheidung beginnen. Die autonome Discovery
Wave endet hier und startet S4 nicht selbstständig.

### Ergebnis S4R

Readiness-Urteil: `PASS / READY FOR S4`, ausschließlich nach separatem Auftrag.
S4 wurde nicht begonnen.

Erneut geprüfter Iststand:

- Worktree weiterhin mit den vorbestehenden Masterplan-/Templateänderungen
  sowie der neuen R7-Roadmap/Evidence; keine fremde Änderung zurückgesetzt.
- Activity-V2-HEAD weiterhin
  `cdca045bdda1681834c0e257cc8f99234f208306` vom 2026-08-09.
- `index.html`, `service-worker.js`, `assets/js/data-local.js`, Activity V1 und
  `activity/v2/data-access.js` sind gegen Git unverändert.
- Activity-V2-Runtime besitzt weiterhin weder Restore noch Recovery noch IDB-
  oder Pagehidepfad. Die Discovery Wave hat ausschließlich Roadmap und
  Evidence fortgeschrieben.
- EV-ACT-R7-B01 bis -B04 bleiben gültig, weil kein Runtime-/Test-/Katalogdiff
  sie invalidiert hat. EV-ACT-R7-D01 bis -D06 belegen die abgeschlossene
  Discovery; EV-ACT-R7-L01 bis -L11 bleiben korrekt offen für S4/S5.

Bestätigte API- und Dateigrenze:

<!-- markdownlint-disable MD013 -->

| Grenze | Finaler Vertrag | Primäre Dateien |
| --- | --- | --- |
| Draft Restore | additiv `sessionDraft.restore(snapshot, options?)`; Draft v3 und elfmethodiger Controller bleiben exakt | `session-draft.js`, `session-draft.contract.test.js` |
| Recovery Public API | exakt `resolveSemantics`, `createIndexedDbStore`, `open`; Controller exakt acht Methoden, Managed-Draft exakt elf | neue `session-recovery.js`, neue `session-recovery.contract.test.js` |
| Storage/CAS | feste DB v1, ein Store/Key, Envelope v1 plus Lease-Token, vollständige Observation, Commit nur nach Transaction Complete | `session-recovery.js`, Recoverytests |
| Shell | optionaler `recovery`-Mount; Legacypfad unverändert; Recovery-Discard async und persistent zuerst | `session-shell.js`, Shelltests, CSS nur bei Statusbedarf |
| Browser | separates Continue-/Discard-/IDB-Gate; bestehender R6-Harness storagefrei | neuer `session-recovery-harness.html`, Recovery-/Shelltests, gemeinsames CSS nach Bedarf |

<!-- markdownlint-enable MD013 -->

Empfohlene sichere S4-Ausführungsblöcke:

<!-- markdownlint-disable MD013 -->

| Block | Enthaltene Hauptschritte | Reihenfolge und Review | Block-Gate / Rollback |
| --- | --- | --- | --- |
| A | S4.1 Draft-v3-Restore | Restore und Tests additiv implementieren; danach Consumer Review über Draft, Shellvalidator, Semantics-v2 und direkte Facades | T-ACT-R7-01/-03/-04/-05, EV-ACT-R7-L01; bei Breach nur Draft-/Testdelta zurücknehmen, kein Storagepfad existiert |
| B | S4.2 IDB-Adapter, danach S4.3 Coordinator im selben Concurrencyblock | zuerst Envelope/Observation/Token-CAS/Tombstone, dann Managed-Draft/Queue/Flush/Discard; getrennte S4.2-/S4.3-Ergebnisse, ein gemeinsamer Full Review | T-ACT-R7-03/-06 bis -10, EV-ACT-R7-L02 bis -L05; bei offenem P0/P1 gesamten neuen Recoveryblock entfernen, Shell bleibt unberührt |
| C | S4.4 optionale Shellintegration, danach S4.5 eigener Recovery-Harness | Shellstatus/Async-Discard zuerst, dann Gate/Lifecycle/Browserfixtures; getrennte Ergebnisse, gemeinsamer Consumer Review und gebündelter Browserlauf | T-ACT-R7-01/-03/-09/-11 bis -16, EV-ACT-R7-L05 bis -L10; bei Breach Shell/CSS/Harnessdelta zurücknehmen, Recoverycore bleibt isoliert |

<!-- markdownlint-enable MD013 -->

Warum dieser Schnitt sicher ist:

- Block A erweitert nur den Producer und lädt nirgends produktiv. Er erzeugt
  ohne Block B keine halbe automatische Recovery.
- S4.2 und S4.3 teilen Observation, Token, Lease, Store-Epoch und Rollback.
  Eine getrennte Freigabe zwischen beiden würde genau die riskante
  Concurrencygrenze halbieren; als gemeinsamer Block bleiben die Hauptschritte
  dennoch getrennt dokumentiert.
- S4.4 und S4.5 teilen Copy, Statusregion, Lifecycle und Browseroracles. Der
  neue Harness kann erst nach optionaler Shellintegration sinnvoll Continue,
  Discard und Fokus beweisen; der geerbte R6-Harness bleibt unverändert.

Risiko- und Evidence-Zuordnung:

- Block A besitzt R-ACT-R7-04/-05 und Teile von -09/-12; EV-ACT-R7-L01.
- Block B besitzt R-ACT-R7-01 bis -08, -10, -13 bis -20;
  EV-ACT-R7-L02 bis -L05.
- Block C besitzt R-ACT-R7-03/-05/-07/-09 bis -12/-15/-19;
  EV-ACT-R7-L05 bis -L10.
- S5 besitzt den vollständigen Regressions-, Negativ-, nativen Full-Review-
  und CodeRabbitabschluss EV-ACT-R7-L10/-L11. Kein Block darf S5 als Ersatz
  für ein eigenes lokales Gate verwenden.

S4R Full Contract Review:

- Reviewumfang: S1-Systemkarte, S2-API-/State-Vertrag, S3-Risiken,
  Entscheidung D-ACT-R7-01 bis -36, Findings, Evidence, Testoracles,
  betroffene Runtimepfade, geschützte Dateien, Gitstatus und Blockrollback.
- Korrigiertes Finding: F-ACT-R7-27.
- Offene Findings: `none`; offene EV-ACT-R7-L*-Zeilen sind erwartete
  Implementierungsnachweise und kein Readinessmangel.
- Owner-Gate: `none` für die eingefrorene technische Lösung. Die separate
  S4-Ausführungsfreigabe bleibt absichtlich ausstehend.
- Ergebnis: `PASS / READY`.
- Stopnachweis: keine Datei unter `app/`, `assets/`, `index.html`, Service
  Worker, SQL oder Android wurde in S1-S4R geändert; S4.1 bleibt `TODO`.

## S4 - Umsetzung

S4 baut. Jeder Block erhält nur seinen Delta-/Consumer-Review und die durch ihn
invalidierten Checks. Der finale Full Review und CodeRabbit gehören S5.

### S4.1 - Strikte Draft-v3-Rehydration

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - D-ACT-R7-03, -12, -13, -28;
  - finaler S2-Restorevertrag.
- Dateien:
  - `session-draft.js`;
  - `session-draft.contract.test.js`;
  - direkte exakte Draftconsumer nur bei nachgewiesener Invalidation.
- Umsetzung:
  - öffentliche Restore-Fabrik im bestehenden Namespace;
  - exakte Form-, ID-, Revision-, Zeit-, Item-, Set- und Rohwertvalidierung;
  - Semantikgleichheit zur gespeicherten Katalogversion;
  - tief eingefrorener Snapshot ohne Replay oder neue Identität;
  - vorhandenes `create(...)` und alle R3-R6-Mutationen unverändert erhalten.
- Review:
  - `Consumer` über Draft, Shellvalidator und Semantics-v2-Kompatibilität.
- Invalidation:
  - T-ACT-R7-01, -03, -04, -05 und direkte R3-R6-Draftregressionen.
- Gate:
  - `none`.

#### Ergebnis S4.1

- Änderung:
  - `sessionDraft` exportiert exakt die tief eingefrorenen Own-Keys `create`
    und `restore`;
  - `restore(snapshot, options?)` akzeptiert exakt die bestehenden
    Dependency-Keys, validiert kanonische Top-Level-, Item-, Set-, ID-,
    Revision-, Zeit-, Policy-, Reihenfolge-, Grenz- und Rohwertzustände gegen
    exakt `snapshot.catalog_version` und friert den vollständig validierten
    Eingabebaum referenzgleich tief ein;
  - Restore liest weder Uhr noch ID-Quelle, spielt keine Mutation nach und
    erzeugt keine Identität; die ID-Quelle bleibt ausschließlich für einen
    späteren rohen `discard()` verfügbar;
  - `create(...)`, Draft v3 und alle elf R3-R6-Controllermethoden bleiben
    unverändert; kein Storage-, Shell-, Harness- oder Produktpfad wurde ergänzt.
- Prüfung:
  - T-ACT-R7-01 `PASS 88/88`, T-ACT-R7-03 `PASS 10/10`,
    T-ACT-R7-04 `PASS`, T-ACT-R7-05 `PASS`;
  - EV-ACT-R7-L01 `PASS`; gezielte Draftsuite `24/24`, realer Katalog-v2-
    Restore für Strength, Duration und Duration/Distance, Mixed-Roundtrip,
    Invalid-/Mismatchmatrix, Referenz-/Freeze-/No-Replay-Nachweis;
  - ergänzender Katalogcheck `PASS v2 / 80 / 47 / 58` und `git diff --check`
    `PASS`.
- Finding/Korrektur:
  - `none`.
- Restrisiko:
  - kein offenes S4.1-Risiko; Storage, CAS, Tombstone und Coordinator bleiben
    absichtlich Block B und sind noch nicht implementiert.
- Doku-Sync:
  - Roadmap und Evidence auf S4.1 synchronisiert; finaler Modul-/QA-/Archivsync
    bleibt S6.
- Status:
  - `DONE`.

S4.1 Consumer Review:

- Draft/API: additive API exakt `{ create, restore }`; bestehende Create-,
  Mutation-, Timer-, No-op-, Freeze- und Discardtests bleiben grün.
- Shellvalidator: Restore liefert weiterhin exakt den vom bestehenden
  Shellvalidator erwarteten tief eingefrorenen Draft-v3-Baum; vollständige
  Shell-/Editorregression grün, keine Consumeränderung erforderlich.
- Semantics-v2: gespeicherte Version 2 wird nur mit injizierter Semantik v2
  akzeptiert; reale Strength-, Duration- und Duration/Distance-Einträge sowie
  ihre Feldpolicies rehydrieren ohne Rohwertänderung.
- Isolation: Activity V1, `index.html`, Service Worker, Produktnavigation,
  Netzwerk, Supabase, SQL/RPC/RLS/Grants, `commitSession`, `healthlog_db` und
  Android bleiben unverändert.
- Ergebnis: `PASS`; offene Findings `none`.

Exit: Draft v3 kann exakt und versionsgebunden rehydriert werden.

### S4.2 - IndexedDB-Slot, Token-/Lease-CAS und Tombstone

Reasoning: `GPT-5.6 Sol / Extra High`.

- Vertrag:
  - D-ACT-R7-01 bis -05, -08 bis -10, -18, -23, -26, -27, -30, -34,
    -35;
  - finaler S2-Speicher- und CAS-Vertrag.
- Dateien:
  - neue `app/modules/vitals-stack/activity/v2/session-recovery.js`;
  - neue `session-recovery.contract.test.js`.
- Umsetzung:
  - isolierter IDB-Adapter ohne `healthlog_db`-Kopplung;
  - exakter Envelope und geschützte Recordkopien;
  - atomare Save- und Discardtransaktionen;
  - Leasevergleich und Konfliktcodes;
  - Generationstombstone und geschützter Corrupt-/Unknown-Discard;
  - Open-/Blocked-/Versionchange-/Abort-/Overflowfehler fail-closed.
- Review:
  - `Full` innerhalb des gemeinsamen Blocks B.
- Invalidation:
  - T-ACT-R7-02, -03, -06, -07, -08, -10;
  - EV-ACT-R7-L02/-L03.
- Gate:
  - `none`.

#### Ergebnis S4.2

- Änderung:
  - neuer tief eingefrorener Namespace `sessionRecovery` mit exakt
    `resolveSemantics`, `createIndexedDbStore` und `open`;
  - IDB-Adapter mit festem Namen `midas_activity_v2_recovery`, Version 1,
    Store `session_recovery`, Key `active_session` und exakt
    `read/save/discard/close`;
  - vollständige tief geklonte/frozen Observation, kanonischer Envelope v1,
    atomarer vollständiger Observation-/Token-/Generation-/Sequenz-/Request-/
    Revision-CAS und Erfolg ausschließlich nach `transaction.oncomplete`;
  - Save behält das Lease-Token; Discard rotiert Token, erhöht oder repariert
    Generation und schreibt ausschließlich den leeren Tombstone;
  - Blocked-, Late-Success-, Versionchange-, Request-, Abort-, Overflow-,
    Non-JSON-, Unknown- und Corrupt-Pfade enden fail-closed ohne `delete`.
- Prüfung:
  - T-ACT-R7-02/-03/-06/-07/-08/-10 `PASS`;
  - EV-ACT-R7-L02/-L03 `PASS`; zusätzlich EV-ACT-R7-L04-Adapterpostcondition
    `PASS`;
  - gezielte Recoverysuite `27/27`, vollständige Activity-V2-Suite `115/115`,
    Katalog `v2 / 80 / 47 / 58`, Syntax `12/12`, `git diff --check` `PASS`.
- Finding/Korrektur:
  - F-ACT-R7-28 bis -30 korrigiert und revalidiert.
- Restrisiko:
  - realer Browser-IDB-Postzustand bleibt absichtlich S4.5; kein offenes
    Adapter-P0/P1.
- Doku-Sync:
  - Roadmap und Evidence auf Block B synchronisiert; finaler Modul-/QA-/
    Archivsync bleibt S6.
- Status:
  - `DONE`.

Exit: Der lokale Slot kann keinen stale oder konkurrierenden Write still
akzeptieren.

### S4.3 - Autosave-Coordinator und Recovery-Fassade

Reasoning: `GPT-5.6 Sol / Extra High`.

- Vertrag:
  - D-ACT-R7-05 bis -11, -14 bis -18, -21 bis -27, -29, -30, -32 bis
    -36;
  - finaler S2-State-/Lifecyclevertrag.
- Dateien:
  - `session-recovery.js`;
  - `session-recovery.contract.test.js`;
  - Drafttests nur bei realer Managed-Draft-Invalidation.
- Umsetzung:
  - öffentliche Recovery-Fassade mit injizierbarem Storage, Clock und
    Scheduler;
  - Managed-Draft-Mutationen mit Referenz-No-op-Erkennung;
  - ein aktiver Write, Latest-Pending-Koaleszierung und Leasefortschritt;
  - transient degradierter Retry versus terminaler Konflikt;
  - `hidden`-/`pagehide`-Flush und sicheres `destroy`;
  - persistenter Discard vor terminalem Controllerende und Close; kein
    Wiederverwenden oder zweiter Reset des verworfenen Draftbranches;
  - Statussubscription ohne Payloadlogs.
- Review:
  - `Full` gemeinsam mit S4.2; Ergebnisse getrennt dokumentieren.
- Invalidation:
  - T-ACT-R7-01, -06 bis -11;
  - EV-ACT-R7-L02 bis -L05.
- Gate:
  - `none`.

#### Ergebnis S4.3

- Änderung:
  - `open(options)` liefert den exakt achtmethodigen Recoverycontroller und
    initialisiert deterministisch `empty`, `recoverable`, `blocked` oder
    `degraded`; gültige Recovery wird nie automatisch fortgesetzt;
  - Managed Draft besitzt exakt elf Methoden, beobachtet acht fachliche
    Mutationen referenzbasiert und blockiert rohes `discard()` mit
    `PERSISTENT_DISCARD_REQUIRED`;
  - höchstens ein Write, Latest-Pending-Coalescing, `saved` nur für den neuesten
    Stand, transienter Retry nur nach echter Mutation oder explizitem Flush
    und terminaler CAS-Konflikt;
  - Controller-Epoch schützt Queue, Discard und Destroy; Hidden/Pagehide
    fordern bestmöglichen Flush, Subscriber-/Enqueuefehler bleiben isoliert;
  - Recovery-Discard blockiert neue Mutationen, wartet aktiven Write, verwirft
    Pending, persistiert zuerst den Tombstone und beendet erst danach terminal;
    Fehler behalten den Managed RAM-Draft offen und retryfähig.
- Prüfung:
  - T-ACT-R7-01/-06 bis -10 `PASS`; T-ACT-R7-11 bleibt korrekt S4.4-Owner;
  - EV-ACT-R7-L02 bis -L05 `PASS`;
  - Missing/Tombstone/Recoverable/Blocked/Degraded, Katalog v1/v2,
    Zwei-Controller-Konflikt, Pending/Discard, Retry/Flush, Lifecycle,
    Subscriber-/Schedulerthrow und Discard-Reentrancy deterministisch belegt.
- Finding/Korrektur:
  - F-ACT-R7-31 bis -33 korrigiert und revalidiert.
- Restrisiko:
  - optionale Shell-/Statusintegration und reale Browser-IDB-Smokes bleiben
    absichtlich Block C; kein offenes Coordinator-P0/P1.
- Doku-Sync:
  - Roadmap und Evidence auf Block B synchronisiert; finaler Modul-/QA-/
    Archivsync bleibt S6.
- Status:
  - `DONE`.

Block-B Full Contract Review:

- Reviewumfang: Public-/Managed-/Store-APIs, Envelope/Observation, Token-Lease,
  Save-/Discardtransaktionen, alle S3-Races, Queue/Flush/Retry, Statuswahrheit,
  Lifecycle/Reentrancy, Corrupt/Unknown, Overflow, Callbackisolation, Privacy,
  Produktgrenzen, Invalidation, Evidence und Rollback.
- Korrigierte Findings: F-ACT-R7-28 bis -33.
- Offene Findings: `none`; insbesondere kein offenes In-Scope-P0/P1.
- Geschützte Grenzen: Activity V1, `index.html`, Service Worker, Produktload,
  R2-Data-Access/`commitSession`, SQL/RPC/RLS/Grants, Supabase, Netzwerk,
  `healthlog_db` und Android unverändert.
- Runtime: ausschließlich disposable Fake-IDB; kein realer Browserstorage,
  Deploy oder produktiver Eingriff.
- Ergebnis: `PASS`; Block B abgeschlossen, Stop vor S4.4.

Exit: Mutationen, Autosave, Konflikt, Flush und Discard bilden einen
deterministischen lokalen Recovery-Lifecycle.

### S4.4 - Shell-, Status- und Discard-Integration

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - D-ACT-R7-11, -14, -17, -24, -29, -32, -36;
  - R7-UX- und Fehlervertrag.
- Dateien:
  - `session-shell.js`;
  - `session-shell.contract.test.js`;
  - `session-shell.css` nur für erforderliche Recoveryzustände.
- Umsetzung:
  - Recovery bleibt optional; bestehende R3-R6-Mounts ohne Recovery laufen
    unverändert;
  - Statusänderungen patchen nur Recoveryregionen und erhalten Draftwerte,
    Fokus, Timer und Historie;
  - Close-/Escape-Flow wartet auf den asynchron bestätigten persistenten
    Discard und beendet danach den alten Recoverycontroller terminal;
  - failed Discard hält Shell offen und stellt Controls/Fokus wieder her;
  - Konflikt- und Degraded-Copy gemäß Vertrag.
- Review:
  - `Consumer` über Shell, Draft, Recovery und bestehende R3-R6-Fixtures.
- Invalidation:
  - T-ACT-R7-01, -09, -11, -12;
  - EV-ACT-R7-L05.
- Gate:
  - `none`.

#### Ergebnis S4.4

- Änderung:
  - optionaler Mount-Key `recovery` mit exakter Controller-/Draftzuordnung vor
    DOM-Mutation;
  - dedizierte `aria-live="polite"`-Region für Saving, Saved, Degraded,
    Conflict und Discarding ohne Full Render oder Draft-/Timer-/Historyread;
  - Close/Escape wartet ausschließlich auf `recovery.discard()`; Fehler hält
    Shell, RAM-Draft, Controls, Fokus, Timer und History offen und retryfähig;
    Legacy-Mounts verwenden unverändert den synchronen Draft-Discard.
- Prüfung:
  - T-ACT-R7-01/-09/-11 `PASS`; Shelltests `38/38`, vollständige
    Activity-V2-Contracttests `118/118`, Syntax `12/12`,
    `git diff --check` `PASS`; EV-ACT-R7-L05 `PASS`.
- Finding/Korrektur:
  - `none`; native Consumer Review über Shell, Draft, Recovery, R3-R6-Fixtures
    und CSS `PASS`.
- Restrisiko:
  - reales IndexedDB-, Gate-, Reload-, Viewport- und A11y-Verhalten bleibt
    S4.5; kein offenes Shell-P0/P1.
- Doku-Sync:
  - Roadmap und Evidence auf S4.4 synchronisiert; finaler Modul-/QA-/Archivsync
    bleibt S6.
- Status:
  - `DONE`.

Exit: Die isolierte Shell zeigt Recoverywahrheit und schließt nie vor
bestätigtem Discard.

### S4.5 - Isoliertes Recovery-Harness und Browserfixtures

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - D-ACT-R7-02, -07, -14 bis -19, -22, -26, -31 bis -34, -36;
  - Evidence-Vertrag.
- Dateien:
  - neuer `session-recovery-harness.html`;
  - `session-shell.css`;
  - Recovery-/Shelltests.
- Umsetzung:
  - kontrollierte Zustände für empty, recoverable, malformed, unavailable,
    saving, degraded und conflict;
  - echte IDB-Save-/Reload-/Continue-/Discard-Routen;
  - deterministische Zwei-Controller-/Mehrtab-Konfliktfixture;
  - Lifecycle-/Flush-, Fokus-, A11y-, Touch- und Viewportnachweise;
  - gezielter Cleanup nur der R7-Testdatenbank.
- Review:
  - `Consumer` über finalen UI-/Harnessblock.
- Invalidation:
  - T-ACT-R7-12 bis -15;
  - EV-ACT-R7-L06 bis -L09.
- Gate:
  - optional subjektive Owner-Abnahme; automatisierte Postconditions sind
    Pflicht.

#### Ergebnis S4.5

- Änderung:
  - separater storagefähiger `session-recovery-harness.html`; vorhandener
    `session-shell-harness.html` unverändert storagefrei;
  - bewusstes Empty-/Recoverable-/Blocked-Gate mit exakter Copy, ruhigen
    Metadaten, Continue, erneut bestätigtem geschütztem Discard und ohne Auto-
    Resume;
  - kontrollierte Live-, Empty-, Recoverable-, Malformed-, Unavailable-,
    Saving-, Lifecycle-, Degraded-, Conflict- und stale-Writer-Fixtures sowie
    payloadfreier Testseam;
  - fokussierter DOM-Alertdialog, responsive Gate-/Fixture-CSS und gezielter
    Cleanup, der nur `midas_activity_v2_recovery` löscht.
- Prüfung:
  - T-ACT-R7-12 `PASS`: reale IDB Save -> Reload -> bewusstes Continue,
    Itemanzahl und laufender Timer wiederhergestellt;
  - T-ACT-R7-13 `PASS`: Gate- und Shell-Discard committen Tombstone; Reload ist
    empty und ein alter Controller endet conflict statt Resurrection;
  - T-ACT-R7-14 `PASS`: Zwei-Controller-Konflikt, kontrolliertes Saving,
    Pagehide-Flush, malformed blocked Discard sowie unavailable/degraded im
    realen Browser;
  - T-ACT-R7-15 `PASS`: Desktop, 390x844 und 320x800 ohne horizontalen
    Overflow; sichtbare Gate-Ziele 46 px, Shell-Ziele mindestens 44 px;
    Dialog-/Live-Regionen, Initial-/Cancel-Fokus, Touch und Console `PASS`;
  - EV-ACT-R7-L06 bis -L09 `PASS`; Recoverytests `28/28`, Shelltests `38/38`,
    vollständige Activity-V2-Contracttests `119/119`, Katalog
    `v2 / 80 / 47 / 58`, Syntax `12/12`, `git diff --check` `PASS`.
- Finding/Korrektur:
  - F-ACT-R7-34 bis -39 berechtigt, minimal korrigiert und gezielt sowie in der
    finalen lokalen Matrix revalidiert.
- Restrisiko:
  - Android-Prozess-Reclaim, Gerätewechsel und produktiver Cutover bleiben
    unverändert außerhalb R7/S4; finaler Full Review und CodeRabbit bleiben S5.
- Doku-Sync:
  - Roadmap und Evidence auf Block C synchronisiert; finaler Modul-/QA-/
    Archivsync bleibt S6.
- Status:
  - `DONE`.

Gemeinsamer Block-C Consumer Review:

- Umfang: optionale Shellintegration, Draft-/Recovery-Handoff, Statusregion,
  CSS, neuer Recovery-Harness, beide Contracttests und R3-R6-Negativfixtures.
- Ergebnis: `PASS`; keine offenen In-Scope-P0/P1, Findings F-ACT-R7-34 bis -39
  behoben, `index.html`, Produktnavigation, Service Worker, Activity V1,
  R2-Data-Access/`commitSession`, SQL/RPC/RLS/Grants, Supabase, Netzwerk,
  `healthlog_db` und Android unverändert.
- Runtime: ausschließlich isolierter lokaler Harness; die einzige reale
  Browser-DB `midas_activity_v2_recovery` wurde nach dem Nachweis gezielt
  gelöscht. Kein Deploy oder produktiver Consumer.
- Ergebnis: Block C abgeschlossen; Stop vor S5.

Exit: Die Recovery ist lokal mit realer IndexedDB und den entscheidenden
Fehler-/Racezuständen bewiesen; kein produktiver Consumer wurde aktiviert.

## S5 - Integrierte Tests, Full Review und CodeRabbit

Reasoning: `GPT-5.6 Sol / Extra High`.

Deterministische Reihenfolge:

1. Finalen Diff und Invalidation seit dem letzten S4-Block prüfen.
2. Vollständige lokale Activity-V2-, Katalog-, Syntax-, Restore-, Storage-,
   Autosave-, CAS-, Discard-, Shell- und Negativmatrix ausführen.
3. Reale IndexedDB-Browsernachweise aus S4 wiederverwenden, wenn kein
   betreffender Code invalidiert wurde; sonst nur invalidierte Zustände
   wiederholen.
4. Nativen Full Code und Contract Review über Draft, Recovery, Shell, Tests,
   CSS, Harness, Evidence und geschützte Consumer durchführen.
5. CodeRabbit einmal gegen denselben finalen Code-Diff ausführen.
6. Jedes Finding gegen Roadmap, Masterplan und reale Implementierung bewerten;
   nichts blind korrigieren.
7. Berechtigte Findings minimal korrigieren und nur invalidierte lokale und
   Browserchecks wiederholen.
8. CodeRabbit erneut ausführen, wenn eine berechtigte Korrektur Code im
   geprüften Diff verändert. Reine Dokuänderungen invalidieren ihn nicht.
9. Statische Negativnachweise bestätigen:
   - Activity V1 und `index.html` unverändert;
   - `healthlog_db` und bestehende Stores unverändert;
   - kein Netzwerk, Supabase, SQL, RPC, Commit oder produktiver Scriptload;
   - Draft bleibt v3 und History bleibt read-only;
   - keine Payloadinhalte in Logs oder Evidence.
10. Evidence-Digest, Findings, Statusmatrix und Resume Card aktualisieren.

<!-- markdownlint-disable MD013 -->

| ID | Ebene | Check / Smoke | Status | Nachweis | Invalidiert durch |
| --- | --- | --- | --- | --- | --- |
| T-ACT-R7-01 | lokal | vollständige Activity-V2-Contracttests | PASS | EV-ACT-R7-B01 / EV-ACT-R7-L01 bis -L09; aktuell `119/119` | Activity-V2-JS/Tests |
| T-ACT-R7-02 | lokal | Katalogcheck | PASS | EV-ACT-R7-B02; `v2 / 80 / 47 / 58` | Semantik/Katalog/Tool |
| T-ACT-R7-03 | lokal | Syntaxcheck aller Activity-V2-JS-Dateien | PASS | EV-ACT-R7-B03 / EV-ACT-R7-L01 bis -L09; `12/12` | JS-Diff |
| T-ACT-R7-04 | lokal | Restore-Roundtrip Draft v3 | PASS | EV-ACT-R7-L01 | Draft/Restore/Semantik |
| T-ACT-R7-05 | lokal | R3-R6 Draft-/Timer-/Editorregression | PASS | EV-ACT-R7-L01; vollständige Suite `119/119` | Draft/Shell |
| T-ACT-R7-06 | lokal | Envelope, Slot und Adapter | PASS | EV-ACT-R7-L02 | Recovery/IDB |
| T-ACT-R7-07 | lokal | CAS, Forks und unterschiedliche Requests | PASS | EV-ACT-R7-L03 | Lease/Storage |
| T-ACT-R7-08 | lokal | Discard, Tombstone, terminaler Controller und stale Resurrection | PASS | EV-ACT-R7-L04 | Discard/Storage |
| T-ACT-R7-09 | lokal | Autosave, Coalescing, No-op, Flush, Retry und neuester Saved-Status | PASS | EV-ACT-R7-L05 | Coordinator/Scheduler |
| T-ACT-R7-10 | lokal | Unknown, corrupt, catalog mismatch, quota/open/abort | PASS | EV-ACT-R7-L02 bis -L05 | Validator/Adapter |
| T-ACT-R7-11 | lokal | Shellstatus, Async-Discard, Fokus, Timer und History | PASS | EV-ACT-R7-L05; Shelltests `38/38` | Shell/Recovery |
| T-ACT-R7-12 | Browser | reale IDB Save -> Reload -> Continue | PASS | EV-ACT-R7-L06 | Recovery/Harness |
| T-ACT-R7-13 | Browser | reale IDB Discard -> Tombstone -> kein Wiederauferstehen | PASS | EV-ACT-R7-L07 | Recovery/Harness |
| T-ACT-R7-14 | Browser | Konflikt, Lifecycle und Background | PASS | EV-ACT-R7-L08 | Coordinator/Harness |
| T-ACT-R7-15 | Browser | Desktop/Mobile, A11y, Touch und Overflow | PASS | EV-ACT-R7-L09 | Shell/CSS/Harness |
| T-ACT-R7-16 | static | Produkt-, Netzwerk-, Supabase- und `healthlog_db`-Isolation | PASS | EV-ACT-R7-B04 / EV-ACT-R7-L10; geschützte Consumer clean, getrennte feste R7-DB, kein Netzwerk-/Supabase-/Commit-/Legacy-Storagepfad | Script-/Storage-/Netzwerkdiff |
| T-ACT-R7-17 | Review | nativer Full Code und Contract Review | PASS | EV-ACT-R7-L11 / Findings-Tabelle; Draft, Recovery, Shell, Tests, CSS, Harness, Evidence und geschützte Consumer vollständig geprüft | finaler Diff |
| T-ACT-R7-18 | extern | CodeRabbit | PASS | EV-ACT-R7-L11; drei erfolgreiche CLI-Läufe, berechtigte Findings korrigiert, finaler Re-Review `0 Findings` | Codekorrektur |
| T-ACT-R7-19 | Doku | Links, Markdown, Evidence und Statuskonsistenz | TODO | S6 | Doku-Diff |

<!-- markdownlint-enable MD013 -->

Browser-Effizienzregeln:

- Server, Browser und Harness während des Prüfblocks wiederverwenden.
- Save/Reload/Continue/Discard und die Viewportmatrix in möglichst wenigen
  kontrollierten Browserläufen bündeln.
- DOM-Werte, IDB-Postconditions, Fokus, Status, Timer, Overflow und Console
  programmatisch beziehungsweise kompakt erfassen.
- Screenshots nur für echte visuelle Abnahme oder Findingbeleg.
- Kein vollständiger zweiter Browserlauf ohne Invalidation.

### Ergebnis S5

- Integrierte lokale Matrix: Draft `24/24`, Recovery `28/28`, Shell `38/38`,
  vollständig `119/119`; Katalog `v2 / 80 / 47 / 58`; Syntax `12/12`;
  `git diff --check` und statische Produkt-/Storageisolation `PASS`.
- Die grünen S4-Browsernachweise EV-ACT-R7-L06 bis -L09 blieben gültig. Der
  einzige vor S5 relevante Alertdialog-Diff wurde gezielt in Edge geprüft:
  Initialfokus, Tab/Shift+Tab, Escape, Fokusrestauration, Shellstatus,
  fehlender Overflow und leere Fehlerkonsole `PASS`.
- Nachgelagerte Harness-Härtungen ändern keine sichtbare Recoverycopy oder
  Geometrie. Modal-Isolation, stabiler Erfolgsfokus, Facade-Fehlerpfad und
  Teardown werden durch neue statische Oracles und die finale Gesamtsuite
  abgedeckt; die zuvor geprüfte Tab-/Escape-Sequenz blieb funktional gleich.
- Nativer Full Code/Contract Review: `PASS`; keine offenen In-Scope-P0/P1.
- CodeRabbit:
  - erster Lauf: zehn Findings, davon sechs berechtigt und vier nach Prüfung
    verworfen;
  - zweiter Lauf: fünf Harness-Hinweise, vier berechtigt; beim Delayed-Store
    war nur der Teardownteil berechtigt, Mehrfach-Queueing widerspricht der
    bewiesenen Single-Write-Invariante;
  - finaler Re-Review über dieselben acht Code-/Testdateien: `0 Findings`.
- Verworfene Vorschläge: zusätzliche Delayed-Write-Queue, unerreichbarer
  Shellstatus `blocked`, unvereinbar mehrdeutiger Discard-Timeout und rein
  kosmetisches Verschieben finaler Test-Dateireads. Keine davon verbessert
  den eingefrorenen Vertrag.
- Korrigierte Findings: F-ACT-R7-40 bis -50. Offene Findings: `none`.
- Ergebnis: `PASS`; S5 abgeschlossen, `STOP vor S6`. S6 wurde nicht begonnen.

S5 beweist ausdrücklich nicht:

- Android-Prozess-Reclaim oder Gerätewechsel;
- Supabase-Commit oder Bereinigung nach Commit;
- produktive PWA-/Service-Worker-Integration;
- Cross-Device-Sync oder Backupwiederherstellung.

Exit: Alle relevanten lokalen, Browser-, Concurrency-, Isolation- und
Reviewchecks sind grün oder sichtbar abgegrenzt; keine offenen In-Scope-P0/P1.

## S6 - Doku-Sync, Owner-Recap und Abschluss

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. `docs/modules/Activity Module Overview.md` um den tatsächlich bewiesenen
   R7-Iststand, Dateien, Grenzen und QA-Nachweise ergänzen.
2. `docs/Future trainingsmodule update thoughts.md` nur mit dem bewiesenen
   Abschlussstatus und realen Detailkorrekturen synchronisieren.
3. `docs/qa/health-capture-reports.md` mit dem nächsten freien kanonischen
   Check, voraussichtlich HCR-025, ergänzen. Die Nummer in S6 frisch prüfen.
4. Evidence vollständig auf reale Ergebnisse setzen; keine Rohpayloads oder
   erfundenen Browsernachweise.
5. Owner Recap in Alltagssprache schreiben:
   - was lokal gespeichert wird;
   - warum CAS und Tombstone nötig sind;
   - wann Recovery funktioniert;
   - was Site-Datenlöschung, anderes Gerät und R8 weiterhin bedeuten.
6. Finalen Full Contract Review über Code, Roadmap, Evidence, Masterplan,
   Overview, QA und geschützte Produktgrenzen durchführen.
7. Findings korrigieren. In-Scope-P0/P1 müssen geschlossen sein.
8. Changelog-Relevanz entscheiden. Erwartung: `nicht bemerkenswert`, solange
   R7 isoliert und produktiv unsichtbar bleibt; bei real sichtbarer Änderung
   unter `Unreleased` dokumentieren.
9. Resume Card auf Abschluss setzen und Commit-Empfehlung aus dem realen Diff
   ableiten.
10. Roadmap und Evidence mit `(DONE)` nach `docs/archive/` verschieben.

### Ergebnis S6

- Source-of-Truth-Sync:
  - `docs/modules/Activity Module Overview.md` beschreibt R7-Dateien, strikte
    Draft-v3-Rehydration, eigene DB/Store/Slot-Grenze, Envelope, vollständigen
    Lease-CAS, Autosave, Tombstone, Shell/Harness und R8-Abgrenzung;
  - `docs/Future trainingsmodule update thoughts.md` setzt R7 auf `DONE`,
    verlinkt Roadmap/Evidence und markiert R8 als nächstes Rolling-Wave-Gate;
  - `docs/qa/health-capture-reports.md` verwendet die frisch verifizierte
    nächste freie ID HCR-025 für den kanonischen Recovery-Regressionsvertrag;
  - `docs/QA_CHECKS.md` und `docs/qa/README.md` blieben als bereits korrekt
    verlinkende Indizes unverändert.
- Finaler Full Contract Review:
  - `PASS`; Code, Roadmap, Evidence, Masterplan, Module Overview und HCR-025
    beschreiben denselben Draft-v3-, Storage-, CAS-, Autosave-, Discard-,
    Browser- und Produktisolationsvertrag;
  - S6 änderte keinen Code; der finale Abschlusslauf bestätigt Draft `24/24`,
    Recovery `28/28`, Shell `38/38`, vollständig `119/119`, Katalog
    `v2 / 80 / 47 / 58`, Syntax `12/12`, statische Isolation und
    `git diff --check`. Realer Edge-Harness und finaler CodeRabbit-Re-Review
    `0 Findings` bleiben mangels Codeinvalidation gültig;
  - 63 lokale Links über die fünf Abschlussdokumente, Archiv-only-Status,
    HCR-025-Eindeutigkeit, Changelog-Unverändertheit und geschützte Produktpfade
    sind geprüft und `PASS`;
  - F-ACT-R7-51 wurde korrigiert; keine offenen In-Scope-P0/P1 und keine
    offene R7-Evidence.
- Fakten:
  - Activity V1, `index.html`, Produktnavigation, Service Worker,
    `healthlog_db`, R2-SQL/RPC/RLS/Grants, `commitSession`, Supabase, Netzwerk,
    Deploy und Android blieben unverändert;
  - es wurden weder echte Gesundheitsdaten noch Draftpayloads in Doku, QA,
    Fixtures, Logs oder Evidence übernommen;
  - HCR-025 war nach HCR-024 die nächste freie ID; HCR-008 und HCR-011 bleiben
    historisch reserviert.
- Ableitungen:
  - weil S6 ausschließlich Dokumentation und Archivpfade änderte, wurde kein
    S5-Code-, Storage- oder Browsergate invalidiert;
  - weil R7 weiterhin ohne produktiven Consumer, Deploy oder sichtbare
    Betriebswirkung bleibt, entsteht keine Changelog-relevante Änderung.
- Changelog-Entscheidung:
  - `nicht bemerkenswert`; `CHANGELOG.md` bleibt unverändert. R7 ist nur über
    unreferenzierte Activity-V2-Module und den lokalen isolierten Harness
    erreichbar und verändert weder Nutzung noch Betrieb oder Securitygrenzen
    des produktiven MIDAS.
- Owner-Recap in Alltagssprache:
  1. MIDAS kann eine noch nicht abgeschlossene Activity-V2-Session lokal im
     selben Browserprofil sichern. Gespeichert wird der unveränderte Draft v3
     plus technische Kontrollinformationen; es entsteht keine Trainingshistorie.
  2. CAS verhindert, dass zwei Tabs einander unbemerkt überschreiben. Token,
     Generation und vollständiger gespeicherter Ausgangszustand müssen zum
     Schreiben passen; eine höhere Revision allein reicht nicht.
  3. Beim bestätigten Verwerfen bleibt ein kleiner leerer Tombstone zurück.
     Er enthält keine Sessiondaten, hindert aber einen alten Tab daran, den
     verworfenen Draft wiederherzustellen. Scheitert dieser persistente Schritt,
     bleibt die laufende RAM-Session offen.
  4. Recovery funktioniert nach Reload im selben Origin und Browserprofil,
     solange Site-Daten und die lokale IndexedDB vorhanden sind. Sie startet
     nie still und verwendet exakt die gespeicherte Katalogversion.
  5. Gelöschte Site-Daten, ein anderes Gerät oder Browserprofil teilen diesen
     Slot nicht. R7 ist kein Backup und kein Cross-Device-Sync. R8 muss erst
     Commit, bestätigte Bereinigung und realistischen Android-PWA-Prozess-
     Reclaim intern integrieren und beweisen.
- Commit-Empfehlung aus dem finalen Diff:

```text
feat(activity-v2): add isolated draft recovery
```

- Archivpfade:
  - `docs/archive/MIDAS Activity V2 R7 IndexedDB Draft Recovery Roadmap (DONE).md`;
  - `docs/archive/MIDAS Activity V2 R7 IndexedDB Draft Recovery Evidence (DONE).md`.

Exit:

- R7 ist vollständig bewiesen, dokumentiert und archiviert;
- keine offenen In-Scope-P0/P1-Findings;
- Activity V2 bleibt produktiv isoliert;
- R8 ist das nächste erlaubte Rolling-Wave-Gate.

Erwartete Abschlussartefakte:

- `docs/modules/Activity Module Overview.md`
- `docs/Future trainingsmodule update thoughts.md`
- `docs/qa/health-capture-reports.md`
- archivierte R7-Roadmap und R7-Evidence
- optional `CHANGELOG.md` nur bei tatsächlich sichtbarer Produktrelevanz

Commit-Empfehlung, final aus dem Diff zu bestätigen:

```text
feat(activity-v2): add isolated draft recovery
```

Exit: Code, lokale Runtime, Roadmap, Evidence, QA und Module Overview
beschreiben denselben bewiesenen R7-Vertrag. Activity V2 bleibt isoliert; R8
ist das nächste erlaubte Rolling-Wave-Gate.
