# MIDAS Activity V2 R6 Duration and Distance Editor Roadmap (DONE)

Diese Roadmap vervollständigt die weiterhin isolierte Activity-V2-Session-
Erfassung für itemweite Dauer- und Distanzaktivitäten. Sie baut auf dem
bewiesenen R1-R5-/C2-Vertrag auf. Activity V1, Produktnavigation, Supabase und
der R2-Commitpfad bleiben unverändert.

---

## Roadmap-Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Status | `DONE` |
| Modul / Bereich | `Activity V2 / Duration and Distance Editor` |
| Owner / Kontext | `Stephan; private Single-User-PWA für die eigene Trainingsdokumentation` |
| Chat-Lebenszyklus | `Denkraum -> eigener Ausführungs-Chat` |
| Erstellt am | `2026-08-08` |
| Letzter Stand | `2026-08-09; S6 PASS; Sources of Truth synchron, HCR-024 ergänzt, Full Contract Review grün und Roadmap archiviert` |
| Aktueller Schritt | `R6 abgeschlossen; nächstes erlaubtes Gate ist eine eigene R7-Roadmap` |
| Risikoklasse | `R2` |
| Standard-Reviewtiefe | `Consumer`; `Full` in S1-S3, S4R, S5 und S6 gemäß Workflowvertrag |
| Ausführungsmodell | `GPT-5.6 Sol` |
| Reasoning-Standard | `High` |
| Reasoning-Ausnahmen | `S2, S4R, S4.1 und S5: Extra High wegen Draftschema, Feldpolicy, Lifecycle und integriertem Abschlussreview` |
| Owner-Erklärmodus | `Briefing + S6-Recap` |
| Betroffene Hauptdateien | `app/modules/vitals-stack/activity/v2/session-draft.js`, `session-draft.contract.test.js`, `session-shell.js`, `session-shell.css`, `session-shell.contract.test.js`, `semantics-v2.contract.test.js`, `session-shell-harness.html` |
| Deploy relevant | `nein` |
| Produktive Schreibwirkung | `nein` |
| Workflow-Vertrag | `docs/templates/MIDAS Roadmap Workflow Contract.md` |
| Evidence-Datei | `nicht erforderlich`; kein SQL, Deploy oder produktiver Write |
| Gekoppelte Roadmaps | `R1/C2 liefern Semantik und Katalog; R2 liefert den späteren Commitvertrag; R3-R5 liefern Draft, Shell, Suche, Historie und Strength-Editor; R7 folgt auf den finalen R6-Draft` |
| Evidence-Owner | `diese Roadmap` |
| Archivziel | `docs/archive/MIDAS Activity V2 R6 Duration and Distance Editor Roadmap (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Ausführungs-Chat-Startkarte

Diese Karte ist der verbindliche Einstieg für einen frischen Ausführungs-Chat.
Sie ersetzt keine Source of Truth und erlaubt keine erfundenen
Produktentscheidungen.

- Auftrag:
  - `R6 deterministisch bis zum jeweils freigegebenen Gate abarbeiten.`
- Modell und Reasoning:
  - `GPT-5.6 Sol / High`; `S2`, `S4R`, `S4.1` und `S5` auf `Extra High`.
- Kontextübergabe aus dem Denkraum:
  - `PASS`: R1, R2, R3, C2, R4 und R5 sind DONE. Activity V1 bleibt produktiv
    sichtbar; Activity V2 bleibt isoliert.
  - `PASS`: R5 deckt bereits alle `strength_sets` ab, einschließlich
    `duration_sec` für zeitbasierte Strength-Sätze und `distance_m` für
    Carry-/Sled-Sätze. R6 implementiert diese Felder nicht erneut.
  - `PASS`: R6 bearbeitet ausschließlich die itemweiten Tracking-Modi
    `duration` und `duration_distance` sowie die gemeinsame optionale
    Itemnotiz.
  - `PASS`: `duration_min` ist erforderlich; `distance_km` erscheint nur bei
    `duration_distance` und bleibt optional. `sets` bleibt für beide Modi
    exakt `[]`.
  - `PASS`: Die Sessionuhr und die manuell erfasste Itemdauer sind getrennte
    Wahrheiten. Sie werden nicht voneinander abgeleitet und müssen sich nicht
    summengleich verhalten.
  - `PASS`: O-6 wird für die erste produktive Activity-V2-Ausbaustufe mit
    `keine Intensität` geschlossen. Kein RPE-, Skalen- oder Freitextfeld wird
    ergänzt.
  - `PASS`: Historische Werte bleiben read-only und dürfen aktuelle Felder
    niemals vorbefüllen.
  - `PASS`: Frische Baseline bei Roadmap-Erstellung: `81/81` Activity-V2-
    Contracttests, Katalogcheck `v2 / 80 / 47 / 58` und Syntax `10/10` grün.
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
  10. archivierte R2- und R5-Roadmaps für Commit- und Draftgrenzen;
      R3/R4 nur bei konkreter Lifecycle-, Shell- oder Historienfrage
  11. reale Activity-V2-Runtime, Contracttests, CSS und isoliertes Harness;
      `sql/20_Activity_V2.sql` nur zur read-only Verifikation des
      unveränderten R2-Vertrags
  12. `git status --short` und nur der relevante Diff
- Startschritt:
  - `S1 - System- und Vertragsdetektivarbeit`.
- Erlaubte Autonomie:
  - lokale Reads, eng begrenzte JS-/CSS-/Harness-/Teständerungen und lokale
    Tests gemäß Tool Permissions;
  - isolierte Browser-Smokes mit dem bestehenden Harness;
  - CodeRabbit ausschließlich in S5 gemäß `docs/DEV_ENVIRONMENT.md`.
- Owner-Gates:
  - kein SQL-, Deploy- oder produktives Runtime-Gate;
  - Owner nur bei neuer Produktentscheidung, Scope-Ausweitung oder optionaler
    subjektiver Touch-Abnahme.
- Stop-Bedingungen:
  - Änderung von SQL, RPC, RLS, Grants, `commitSession`, Activity V1,
    `index.html`, produktiver Navigation, Storage oder IndexedDB;
  - erneute Implementierung von `duration_sec` oder `distance_m` außerhalb des
    bewiesenen R5-Strength-Vertrags;
  - automatische Ableitung der Itemdauer aus der Sessionuhr oder umgekehrt;
  - Vorbefüllung aktueller Werte aus R4-Historie;
  - Einführung von Intensität, RPE, Trainingssteuerung oder Planlogik;
  - widersprüchlicher Draft-/Feldpolicyvertrag oder nicht zuordenbares
    CodeRabbit-Finding.
- Halluzinationsschutz:
  - Keys, Feldpolicies, Grenzen und Historienwerte ausschließlich aus realen
    Sources of Truth ableiten.
  - Keine medizinischen Empfehlungen, freien Übungskeys oder neuen
    Tracking-Modi ergänzen.
  - Technische Details in S1 gegen den realen Code prüfen; Widersprüche als
    Finding führen und bei Vertragswirkung vor S4 schließen.
- Größenvertrag:
  - Etwa `1.200` Zeilen sind eine Orientierungsmarke, kein hartes Limit.
  - Nur echte Duplikate oder auslagerbare Evidence kürzen. Entscheidungen,
    Gates, Findings, Invalidation Map und Fresh-Chat-Kontext müssen erhalten
    bleiben.
- Browser-/Harness-Kadenz:
  - Kein vollständiger visueller Harness-Lauf nach jedem S4-Substep.
  - Ein gezielter Interaktions-Smoke nach dem ersten vollständigen Editorblock.
  - Eine integrierte Harness-Matrix nach dem finalen S4-Diff. Sie darf in S5
    referenziert werden, solange kein relevanter Code sie invalidiert.
  - Nach Reviewkorrekturen nur betroffene Zustände erneut prüfen; eine zweite
    Vollmatrix nur bei breiter Invalidation.
  - Innerhalb einer Phase Server, Browserseite und Harness wiederverwenden;
    DOM-Messungen und kompakte Nachweise gegenüber unnötigen Screenshots
    bevorzugen.
- Startprompt:

```text
Ich möchte mit der
`docs/MIDAS Activity V2 R6 Duration and Distance Editor Roadmap.md` beginnen.

Arbeite zunächst ausschließlich S1 - System- und Vertragsdetektivarbeit
deterministisch ab. Verwende `GPT-5.6 Sol / High` und halte dich an die
Ausführungs-Chat-Startkarte, den Workflowvertrag und die Stop-Bedingungen der
Roadmap.

Lies vor jeder Änderung in der dort festgelegten Reihenfolge zuerst die
Roadmap, `README.md`, die Entwicklungs- und Workflowverträge, den
Trainingsmodul-Masterplan, das Activity Module Overview, die R1-/C2-Verträge
und anschließend nur die für R6 erforderlichen archivierten R2-/R5-Verträge
sowie den realen Activity-V2-Code.

Prüfe in S1 insbesondere:

- den finalen R5-Draft-v2-, Set-, Parser-, Validitäts- und Lifecyclevertrag;
- die exakte R2-Itemform mit `duration_min`, `distance_km`, `note` und `sets`;
- die elf realen Catalog-v2-Non-Strength-Einträge und ihre zwei zulässigen
  Policykombinationen `duration` und `duration_distance`;
- alle Snapshot-Rebuilds und Shell-/Testdouble-Consumer, die durch Draft v3
  betroffen wären;
- die Trennung zwischen Sessionuhr und manueller Itemdauer;
- R4-Historie, Fokus-, Close-, Background- und Raceguards;
- CSS, Harness, Browser-Testbarkeit und weiterhin fehlende
  Produktverdrahtung.

Führe als frische Baseline alle Activity-V2-Contracttests, den Katalogcheck und
die relevanten Syntaxchecks aus. Dokumentiere Fakten getrennt von Ableitungen.
Erfinde keine Keys, APIs, Produktentscheidungen oder Datenbankfelder.

Unveränderliche Grenzen:

- Activity V1 und `index.html` bleiben unverändert.
- Kein SQL, RPC, RLS, Grant, Supabase-Write, Deploy, Storage oder IndexedDB.
- `commitSession` wird weder geändert noch aufgerufen.
- R5-Strength-Sätze einschließlich `duration_sec` und `distance_m` bleiben
  fachlich unverändert.
- Historische Werte bleiben read-only und dürfen aktuelle Eingaben nie
  vorbefüllen oder den Draft mutieren.
- Keine Intensitäts-, RPE-, Ziel-, Progressions- oder Trainingsplanlogik.
- Noch kein R7-, R8-, R11- oder R13-Vorgriff.

Schließe S1 mit einem Contract Review ab. Korrigiere berechtigte Findings nur
innerhalb des S1-Dokumentations- und Vertragsumfangs, aktualisiere Findings,
Statusmatrix und Session Resume Card und stoppe anschließend vor S2. Bei einem
Quellenwiderspruch, einer neuen Produktentscheidung oder Scope-Ausweitung
stoppen und den Owner informieren.

Öffne den visuellen Harness in S1 nur, wenn eine reale Baselinefrage nicht
durch Code und Contracttests beantwortet werden kann. Die vollständigen
Browserphasen gehören in den in der Roadmap definierten S4-/S5-Ablauf.

Berichte am Ende knapp:

- gelesene und geprüfte Sources of Truth,
- reale Baseline,
- System-/Consumerkarte,
- Findings und Korrekturen,
- S1-Abnahme und nächstes erlaubtes Gate.
```

## Session Resume Card

- Ziel: isolierter policy-gesteuerter Duration-/Distance-Editor auf dem
  bewiesenen R5-Draft-/Shellvertrag.
- Unveränderlich: Activity V1/`index.html`, SQL/RPC, `commitSession`, Storage/
  IndexedDB und Produktnavigation; R4-Historie bleibt read-only; R5-Strength-
  Sets werden nicht umgedeutet.
- Produktentscheidungen: `duration_min` erforderlich; `distance_km` nur bei
  `duration_distance` optional; gemeinsame Itemnotiz optional; keine
  Intensität; Sessionuhr und Itemdauer bleiben getrennt.
- Finaler Draftschnitt: `midas.activity-session-draft.v3` mit vollständigen
  Sechs-Key-Itemrecords und exakt einer neuen elften Methode
  `setItemField(itemKey, fieldKey, value)`.
- Frische S1-Baseline am `2026-08-09`: `81/81` Contracttests, Katalog
  `v2 / 80 / 47 / 58`, Syntax `10/10`; statische Isolation `PASS`.
- Erledigter Stand: S1-S6 `PASS` am `2026-08-09`; System-/Zielvertrag,
  Risikoreview, Readiness, Implementierung, Testmatrix, Reviews, Doku-Sync und
  Archivabschluss sind vollständig.
- Aktueller Schritt: `R6 abgeschlossen und archiviert`.
- Nächster erlaubter Schritt: eine eigene `R7 - IndexedDB Draft Recovery`-
  Roadmap; kein R7-Vorgriff innerhalb von R6.
- Offene Findings: `none`.
- Geänderte Dateien: `session-draft.js`, `session-draft.contract.test.js`,
  `session-shell.js`, `session-shell.contract.test.js`,
  `semantics-v2.contract.test.js`, `session-shell.css`,
  `session-shell-harness.html`, `docs/Future trainingsmodule update thoughts.md`,
  `docs/modules/Activity Module Overview.md`,
  `docs/qa/health-capture-reports.md` und diese archivierte Roadmap.
- Gültige Nachweise: finaler S5-Stand `85/85` Contracttests, Katalog
  `v2 / 80 / 47 / 58`, Syntax `10/10`, statische Isolation und nativer Full
  Review `PASS`; CodeRabbit `0 issues`. Unverändert gültig: Harness-Matrix
  `12/12` über vier Fixtures und drei konfigurierte Viewports sowie realer
  Backgroundlauf `41s` mit erhaltenem Rohwert, Notiz, Fokus, Status und Uhr.
- Doku-/QA-Stand: Masterplan und Module Overview beschreiben Draft v3 und den
  isolierten R6-Iststand; HCR-024 ist der kanonische Regressionsvertrag.
- Runtime-/Deploy-Stand: nicht relevant; Activity V2 bleibt isoliert.
- Offene Owner-Freigaben: none.
- Stop: R6 ist beendet; keine weitere R6-Implementierung und kein R7-, R8-,
  R11- oder R13-Vorgriff; keine Commit-Ausführung, Produkt-, Deploy- oder
  Datenbankaktion.

## Zielvertrag

Prüfbares Endergebnis:

- Jedes aktive Catalog-v2-Item mit `tracking_mode: duration` zeigt in der
  isolierten Session-Shell ein erforderliches Eingabefeld `Dauer (Min.)` und
  eine optionale Itemnotiz.
- Jedes aktive Catalog-v2-Item mit `tracking_mode: duration_distance` zeigt
  zusätzlich ein optionales Feld `Distanz (km)`.
- Die elf realen Non-Strength-Einträge werden ausschließlich aus dem
  injizierten Katalog und ihren Feldpolicies gerendert. Es gibt keine
  hardcodierte Cardio-Liste und keine manuelle Cardio-Checkbox.
- Non-Strength-Items behalten exakt `sets: []`. R5-Strength-Items behalten ihre
  Setstruktur und bekommen keine itemweiten Dauer- oder Distanzwerte.
- Der flüchtige Draft erhält eine neue explizite Schemaversion und vollständige
  Itemrecords, die Add, Remove, Move, Sessionnote und alle Feldmutationen ohne
  Datenverlust überstehen.
- Itemwerte bleiben während der Eingabe kontrollierter Rohtext. Leere,
  teilweise, vollständige und ungültige Zustände werden abgeleitet und nicht
  gespeichert.
- `duration_min` folgt der R1-/R2-Grenze `1..1440` als Integer.
  `distance_km` folgt `0.01..1000` mit höchstens zwei Dezimalstellen.
- Österreichische Kommaeingaben und technische Punktwerte bleiben ohne stille
  Rundung, Vorzeichen-, Exponenten- oder Gruppierungsinterpretation
  kontrollierbar.
- Eine optionale Itemnotiz ist für alle drei Tracking-Modi verfügbar, maximal
  500 Unicode-Codepoints lang und keine Leistungskennzahl.
- Ein reines Notiz-Item oder eine Distanz ohne gültige Pflichtdauer ist nicht
  vollständig. Leere UI-Felder behaupten keine ausgeführte Aktivität.
- Die Sessionuhr bleibt unverändert zeitstempelbasiert. Itemdauern sind
  manuelle Dokumentationswerte und werden weder automatisch gestartet noch aus
  der Sessiondauer berechnet.
- Strength- und Non-Strength-Items können in derselben Session vorkommen,
  verschoben und entfernt werden, ohne Werte, Fokus, Lookupcache oder Timer zu
  verlieren.
- R4-Historie zeigt Dauer, Distanz und Notiz nur read-only. Kein historischer
  Wert wird als aktueller Input übernommen.
- Desktop sowie schmale Android-Viewports bleiben ohne horizontalen Overflow,
  überlappende Controls, abgeschnittene Copy oder Fokusverlust bedienbar.
- Die S5-Matrix, nativer Full Review und CodeRabbit enden ohne offene
  In-Scope-P0/P1-Findings.

Bewusst unverändert:

- Activity V1, Doctor View, Reports und bestehende Health-Event-Pfade.
- R1-/C2-Kataloginhalt, Aliaslogik, Tracking-Modi und Feldpolicies.
- R2-SQL, RPCs, RLS, Grants, Responseverträge und `commitSession`.
- R3-Timer, Request-ID, Confirmation-/Discardsemantik und Backgroundvertrag;
  nur die pending Sperrabdeckung draftmutierender Shellcontrols wird in R6
  race-sicher vervollständigt.
- R4-Suche, Historienlookup, Cache- und Raceguardvertrag.
- R5-Strength-Setsemantik, drei Standardzeilen, Parser und Setvalidität.
- Recovery aus R7, Save/History aus R8, Export aus R9, Produktcutover aus R11
  und Sessionvorlage aus R13.

## Problem und Ist-Zustand

- Der R5-Draft `midas.activity-session-draft.v2` enthält pro Item exakt
  `item_key`, `item_order` und `sets`.
- Non-Strength-Items sind heute korrekt als `sets: []` repräsentiert, besitzen
  aber noch keine aktuellen Eingabefelder für Dauer, Distanz oder Itemnotiz.
- Der R2-Speichervertrag kennt bereits genau die Itemfelder `duration_min`,
  `distance_km`, `note` und `sets`. Er ist produktiv bewiesen, wird in R6 aber
  weder aufgerufen noch verändert.
- Catalog v2 enthält elf aktive Non-Strength-Einträge: vier `duration`- und
  sieben `duration_distance`-Einträge. Ihre beiden Feldpolicyformen sind
  bereits vollständig eingefroren.
- R5 deckt `duration_sec` und `distance_m` bereits innerhalb von
  `strength_sets` ab. Eine pauschale Bezeichnung als Duration-Editor könnte
  sonst doppelte oder widersprüchliche UI erzeugen.
- Die R3-Sessionuhr misst die gesamte geöffnete Einheit. Für Schwimmen,
  Radfahren oder einen Cardioabschluss wird zusätzlich eine manuell
  dokumentierte Itemdauer benötigt.
- R4 kann letzte Duration-/Distance-Werte anzeigen. Ohne ausdrücklichen Guard
  könnten diese versehentlich als heutige Leistung vorbefüllt werden.
- Ein visueller Harness-Lauf nach jedem kleinen Substep erzeugt wiederholte
  Toolausgaben und Analyse, ohne proportionalen Qualitätsgewinn. Die Roadmap
  bündelt deshalb visuelle Nachweise an echten Integrationsgrenzen.

## Entscheidungslog

<!-- markdownlint-disable MD013 -->

| ID | Datum | Entscheidung | Warum | Betrifft |
| --- | --- | --- | --- | --- |
| D-ACT-R6-01 | 2026-08-08 | R6 bleibt ausschließlich in der isolierten Activity-V2-Shell und führt keinen Produktload aus. | R11 besitzt den produktiven Cutover. | Scope, S4, S5 |
| D-ACT-R6-02 | 2026-08-08 | R6 implementiert nur itemweite `duration`- und `duration_distance`-Felder. `duration_sec` und `distance_m` bleiben ausschließlich R5-Strength-Setfelder. | Verhindert doppelte Semantik und UI. | Draft, UI, Tests |
| D-ACT-R6-03 | 2026-08-08 | Der Draft wird wegen neuer exakter Itemkeys explizit auf `midas.activity-session-draft.v3` versioniert. | v2 ist exakt eingefroren; stille Formerweiterung wäre ein Contractbruch. | Draft, R7/R8-Handoff |
| D-ACT-R6-04 | 2026-08-08 | Draft-v3-Items spiegeln die R2-Itemform mit `item_key`, `item_order`, `duration_min`, `distance_km`, `note` und `sets`; Draftwerte bleiben bis R8 Rohtext oder `null`. | Ein vollständiger Record verhindert Datenverlust bei Rebuilds und passt zur späteren Normalisierung. | Draft, Consumer |
| D-ACT-R6-05 | 2026-08-08 | `duration_min` ist bei beiden Non-Strength-Modi erforderlich. `distance_km` ist nur bei `duration_distance` optional. | Exakte R1-/C2-Feldpolicy. | UI, Validator |
| D-ACT-R6-06 | 2026-08-08 | Non-Strength-Items besitzen immer `sets: []`; Strength-Items besitzen immer `duration_min: null` und `distance_km: null`. | Tracking-Modi bleiben strukturell getrennt. | Draft, R8-Handoff |
| D-ACT-R6-07 | 2026-08-08 | Die bereits in R1/R2 vorgesehene optionale Itemnotiz wird einmal gemeinsam für alle Tracking-Modi ergänzt; sie beeinflusst Leistungsvalidität nicht positiv. | Einheitliche Itemform und kein späterer separater Notizumbau. | Draft, UI, R8-Handoff |
| D-ACT-R6-08 | 2026-08-08 | O-6 wird für die erste Activity-V2-Ausbaustufe mit `keine Intensität` geschlossen. | Kein bewiesener Alltagsnutzen; Aufnahme würde Datenbank-, Commit-, Lookup- und Exportvertrag erweitern. | Scope, Masterplan-Sync |
| D-ACT-R6-09 | 2026-08-08 | Sessionuhr und Itemdauer bleiben unabhängig. Keine automatische Ableitung, Summierung oder Plausibilitätsgleichheit. | Beide Werte beschreiben unterschiedliche Ebenen einer gemischten Session. | Daten, Copy, Tests |
| D-ACT-R6-10 | 2026-08-08 | Numerische Iteminputs verwenden dieselbe kontrollierte Rohtext- und Parserstrategie wie R5. | Kommaeingabe, Caret und Tippzwischenstände bleiben stabil. | Draft, Parser, UI |
| D-ACT-R6-11 | 2026-08-08 | Itemzustände werden ausschließlich aus Feldpolicy und aktuellen Werten abgeleitet. Es gibt keine Checkbox und keinen gespeicherten Status. | Keine redundante Wahrheit vor R8. | Validator, UI |
| D-ACT-R6-12 | 2026-08-08 | Eine Notiz ohne gültige Pflichtdauer und eine Distanz ohne gültige Pflichtdauer sind nicht vollständig. | Text oder optionale Distanz dürfen keine ausgeführte Aktivität behaupten. | Validator, Tests |
| D-ACT-R6-13 | 2026-08-08 | Historische Duration-/Distance-/Notizwerte bleiben read-only und füllen heutige Eingaben niemals vor. | MIDAS dokumentiert die aktuelle reale Leistung, nicht einen kopierten Plan. | R4 Consumer, UI |
| D-ACT-R6-14 | 2026-08-08 | Add/Remove/Move, Sessionnote und alle R6-Mutationen arbeiten mit vollständigen Itemrecords und exakten Revisionen. | R5 hat den Datenverlust durch Keylisten-Rebuilds bereits als reale Risikogrenze bewiesen. | Draft, Lifecycle |
| D-ACT-R6-15 | 2026-08-09 | Während eines pending Close-/Discard-Guards werden alle draftmutierenden Shellcontrols gesperrt und alle zugehörigen Handler zusätzlich geguardet: Search/Add, Sessionnotiz, Item-Move/-Remove, R5-Sets und R6-Iteminputs. Close bleibt für Promise-Koaleszierung aktiv; Lookup-Retry bleibt read-only. | Bestehende Itemaktionen können neue v3-Werte entfernen oder verschieben und würden sonst den bestätigten Snapshot nachträglich verändern. | Race, Fokus, S4.3 |
| D-ACT-R6-16 | 2026-08-08 | S4 enthält Umsetzung und substepnahe Checks; S5 enthält Gesamtmatrix, nativen Full Review und CodeRabbit. | Aktueller Workflowvertrag. | S4, S5 |
| D-ACT-R6-17 | 2026-08-08 | Visuelle Harness-Prüfungen werden auf einen gezielten Zwischen-Smoke und eine integrierte Abschlussmatrix gebündelt. Gültige Ergebnisse werden ohne Invalidation in S5 wiederverwendet. | Weniger wiederholte Toolausgaben bei gleicher Testtiefe. | S4R, S4, S5 |
| D-ACT-R6-18 | 2026-08-08 | Eine separate Evidence-Datei ist nicht erforderlich. | Kein produktiver Write, SQL, Deploy oder komplexer Remote-Nachweis. | S5, S6 |
| D-ACT-R6-19 | 2026-08-09 | Die Draft-v3-API ergänzt als elfte und letzte Methode exakt `setItemField(itemKey, fieldKey, value)`; neue Fehlercodes sind `INVALID_ITEM_FIELD`, `FORBIDDEN_ITEM_FIELD` und `INVALID_ITEM_VALUE`. | Eine gemeinsame policy-gesteuerte Mutation ist kleiner als Tracking-Mode-APIs oder eine zweite Notizmethode. | Draft, Consumer, Tests |
| D-ACT-R6-20 | 2026-08-09 | Itemnotizen bleiben im flüchtigen Draft Rohtext: exakt `''` wird `null`, jeder andere String bis 500 Unicode-Codepoints bleibt unverändert. Erst R8 darf die bestehende R2-ASCII-Space-Normalisierung anwenden. | Inputzeitiges Trimmen würde DOM und Draft auseinanderziehen oder das Caret versetzen. | Draft, UI, R8-Handoff |
| D-ACT-R6-21 | 2026-08-09 | R6 verwendet einen gemeinsamen privaten numerischen Parser für Set- und Itemfelder. Das Ergebnis besitzt nur `state` und sichere `error`-Copy; keine Zahl wird gespeichert oder als neue API exportiert. | Entspricht der realen R5-Runtime und greift der R8-Normalisierung nicht vor. | Parser, UI, Tests |
| D-ACT-R6-22 | 2026-08-09 | Ein Non-Strength-Item ist nur mit gültiger Pflichtdauer vollständig; eine alleinige Itemnotiz macht einen sonst leeren Itemzustand `partial`. Bei Strength bleibt die R5-Setvalidität leistungsentscheidend; eine Notiz kann `empty` nur zu `partial`, nie zu `complete`, anheben. | Die Notiz darf reale Eingabe erhalten, aber keine Leistung behaupten. | Validität, Copy, R8-Handoff |
| D-ACT-R6-23 | 2026-08-09 | Ungültige numerische Rohwerte werden als Itemzustand `invalid` abgeleitet. Schema-, Policy-, Freeze- oder Strukturbrüche sind dagegen kein UI-Zustand, sondern bleiben Shellfehler `INVALID_DRAFT_STATE`. | Beschädigte oder gefälschte Drafts dürfen nicht als normale Nutzereingabe weiterlaufen. | Validator, Security, Tests |
| D-ACT-R6-24 | 2026-08-09 | Der Item-Row-Container trägt den kombinierten Itemzustand. Der bestehende Strength-Editor und seine Rows behalten separat den unveränderten R5-Setzustand; beim Non-Strength-Editor entspricht `data-state` dem kombinierten Itemzustand. | Eine Strength-Notiz darf den Itemzustand `partial` machen, ohne die bewiesene R5-Setwahrheit umzudeuten. | DOM, Validität, Tests |
| D-ACT-R6-25 | 2026-08-09 | Gibt `setItemField` dieselbe Snapshotreferenz zurück, beendet der Inputhandler den Pfad ohne `readState`, Statepatch, Full Render oder globale Copy. | Der API-No-op darf keinen unnötigen DOM-Lifecycle oder Caret-/Racepfad erzeugen. | Lifecycle, Tests |
| D-ACT-R6-26 | 2026-08-09 | S4-Rollback folgt den logischen Blöcken A, B und C und nimmt nur blockeigene Diff-Hunks zurück. Ein früher Block darf nach Beginn eines abhängigen Blocks nur nach Rücknahme der späteren Blöcke oder als gesamter R6-Code-Diff zurückgerollt werden. | Shellcode und Shelltests werden in mehreren Blöcken geändert; ein Whole-File-Restore könnte bereits grüne frühere Arbeit löschen. | Rollback, S4R, S4 |

<!-- markdownlint-enable MD013 -->

## Owner-Briefing-Bedarf

- Erklärmodus:
  - `Briefing + S6-Recap`.
- Neue oder entscheidungsrelevante Konzepte:
  - Draft-v3 gegenüber unverändertem produktivem R2-Speicherschema;
  - getrennte Session- und Itemdauer;
  - O-6-Verzicht auf Intensität;
  - wiederverwendbare Browsernachweise statt Harness-Vollmatrix pro Substep.
- Geplante Briefing-Gates:
  - S2 erklärt den finalen Draft-/API-/Validitätsvertrag vor S3;
  - S6 fasst Verhalten und R7-/R8-Handoff in Alltagssprache zusammen.
- Nicht erneut zu erklären:
  - normale JS-/CSS-Syntax, Testassertions, DOM-Erstellung und mechanische
    Harnesspflege.

## Scope und Grenzen

In Scope:

- explizite Draft-v3-Erweiterung um itemweite Duration-, Distance- und
  Notizwerte;
- kleinste policy-gesteuerte Mutations-API für diese Itemfelder;
- `duration`- und `duration_distance`-Editoren in der isolierten Shell;
- gemeinsame optionale Itemnotiz für Strength und Non-Strength;
- kontrollierte Rohtexteingabe, Parser und abgeleitete Validität;
- gemischte Sessions ohne Umdeutung der Sessionuhr;
- Erhalt von Reorder-, Remove-/Re-Add-, Close-, Fokus-, Lookup-, Timer- und
  Backgroundverhalten;
- responsive Desktop-/Android-Layouts und gebündelte Harness-Nachweise;
- lokale Contracttests, nativer Full Review und CodeRabbit in S5;
- S6-Sync von Masterplan, Activity Overview und kanonischer QA-Suite.

Nicht in Scope:

- Product Load oder sichtbarer Activity-V2-Cutover;
- Änderung oder Entfernung von Activity V1;
- SQL, RPC, RLS, Grants, Supabase-Write, Edge Function oder Deploy;
- Aufruf oder Refactor von `commitSession`;
- IndexedDB, LocalStorage oder andere persistente Draftrecovery;
- neue Tracking-Modi, Katalogpflege, freie Keys oder neue Übungen;
- Intensität, RPE, 1RM, Pausentimer oder automatische Trainingssteuerung;
- automatische Itemzeitmessung, Summenbildung oder Gleichsetzung mit der
  Sessionuhr;
- Save, Korrektur, produktive Historienansicht, Export oder Doctor View;
- Trainingsplan, Zielwerte, Progression oder medizinische Empfehlung.

Roadmap-spezifische Guardrails:

- Feldsichtbarkeit und Mutierbarkeit stammen ausschließlich aus der
  injizierten Katalogpolicy.
- R5-Strength-Setwerte und R6-Itemwerte belegen nie dasselbe Feld.
- Leere Defaults und reine Notizen behaupten keine ausgeführte Aktivität.
- Der Editor fragt weder pro Tastendruck noch beim Rendern neue Daten ab.
- Eine ungültige Mutation verändert weder Snapshot noch Revision.
- Ein No-op erzeugt keine Revision und keinen unnötigen DOM-Lifecycle.
- Historie und aktuelle Eingabe bleiben in Daten, DOM und Copy getrennt.
- Keine Änderung wird über den produktiven `index.html` geladen.

## Scope-Freeze vor S4

- Bestehende Features:
  - R1-R5/C2 bleiben erhalten; R6 ergänzt nur aktuelle itemweite Eingabe und
    die gemeinsame optionale Itemnotiz.
- Datenmodell, Lifecycle und Retention:
  - produktives Datenmodell und Retention unverändert;
  - nur der flüchtige Draft wird explizit von v2 auf v3 versioniert.
- Cleanup, Scheduler, Secrets und externe Automationen:
  - nicht betroffen.
- Kompatible Producer und Consumer:
  - Producer: R6-Shellaktionen über den gemeinsamen Draftcontroller;
  - Consumer: R6-Renderer sowie später R7/R8;
  - R4-Lookup bleibt separater read-only Consumer;
  - R5-Strength-Editor konsumiert dieselben vollständigen v3-Itemrecords.
- Offene Grundsatzfragen:
  - `none`; S2 friert nach realer Codeprüfung ausschließlich technische
    Detailnamen, Fehlercodes und exakte Parserzustände ein.
- Umgang mit späterem Scope-Wechsel:
  - technische Korrektur vor S4 über S2/S3/S4R;
  - neue Produktfunktion als gezieltes Follow-up oder zuständige R7-R13.

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
<!-- markdownlint-disable MD013 -->
- `docs/archive/MIDAS Activity V2 R2 Unified Database and Commit API Roadmap (DONE).md`
- `docs/archive/MIDAS Activity V2 R5 Strength Set Editor Roadmap (DONE).md`
<!-- markdownlint-enable MD013 -->
- `app/modules/vitals-stack/activity/v2/semantics.js`
- `app/modules/vitals-stack/activity/v2/semantics-v2.js`
- `app/modules/vitals-stack/activity/v2/data-access.js`
- `app/modules/vitals-stack/activity/v2/session-draft.js`
- `app/modules/vitals-stack/activity/v2/session-shell.js`
- zugehörige Contracttests, CSS und `session-shell-harness.html`
- `docs/qa/health-capture-reports.md`, insbesondere HCR-017 bis HCR-023

Nur bei konkreter Vertragsfrage:

- `sql/20_Activity_V2.sql`
<!-- markdownlint-disable MD013 -->
- `docs/archive/MIDAS Activity V2 R3 Shared Session Draft and UI Shell Roadmap (DONE).md`
- `docs/archive/MIDAS Activity V2 R4 Search and Last-Performance Lookup Roadmap (DONE).md`
- `docs/archive/MIDAS Activity V2 C2 Catalog Version 2 Studio Vocabulary Roadmap (DONE).md`
<!-- markdownlint-enable MD013 -->
- `docs/QA_CHECKS.md` nur als Kompatibilitätsindex, nicht als aktive Suite

## Tool Permissions und Gates

Allowed:

- lokale Datei- und Git-Reads;
- eng begrenzte Änderungen im Activity-V2-Verzeichnis und den zugeordneten
  Dokumenten;
- Node-Contracttests, Syntaxchecks, Katalogcheck und Markdownlint;
- lokaler isolierter Harness mit Browser-Plugin oder dokumentiertem
  Playwright-Fallback;
- CodeRabbit in S5 gemäß `docs/DEV_ENVIRONMENT.md`.

User-gated:

- keine produktive Aktion vorgesehen;
- nur neue Produktentscheidung, Scope-Ausweitung oder optionale subjektive
  Touch-Abnahme.

Forbidden:

- Secrets ausgeben oder committen.
- fremde Worktree-Änderungen zurücksetzen.
- SQL, Supabase, Deploy, Edge Functions oder GitHub Workflows verändern.
- Activity V1, `index.html` oder produktive Navigation verändern.
- historische Werte vorbefüllen oder freie Übungskeys erzeugen.
- Intensität oder neue Messfelder still ergänzen.
- CodeRabbit-Findings blind korrigieren.

## Statusmatrix

<!-- markdownlint-disable MD013 -->

| ID | Schritt | Reasoning | Status | Kompaktes Ergebnis |
| --- | --- | --- | --- | --- |
| S1 | System- und Vertragsdetektivarbeit | `High` | PASS | `81/81`; Katalog `v2 / 80 / 47 / 58`; Syntax `10/10`; System-/Consumerkarte und Full Contract Review grün; Stop vor S2. |
| S2 | Fachlicher und technischer Zielvertrag | `Extra High` | PASS | Draft v3, elf Methoden, Fehlerpräzedenz, Rohtext-/Parser-, Validitäts-, UI- und Lifecyclevertrag eingefroren; drei Vertragsunschärfen korrigiert; Stop vor S3. |
| S3 | Bruchrisiko-, Security- und Umsetzungsreview | `High` | PASS | 18 Risiken red-geteamt und geschlossen/zugeordnet; Closeguard, Statecarrier, atomare S4.1-Consumergrenze und Invalidation korrigiert; Stop vor S4R. |
| S4R | S4 Readiness Review | `Extra High` | PASS | A->B->C, exakte Dateien/Checks, HCR-Invalidation, blockweiser Rollback und Scope-Freeze bestätigt; drei Readiness-Findings fixed; Stop vor S4.1. |
| S4.1 | Draft v3 und Item-Mutationsvertrag | `Extra High` | PASS | Draft v3, vollständige Sechs-Key-Items, elfte policy-gesteuerte Mutation, alle Rebuilds und direkten Consumer grün; `83/83`, Katalog und Syntax PASS; Stop vor Block B. |
| S4.2 | Policy-gesteuerter Duration-/Distance-Editor | `High` | PASS | Exakte Duration-/Distance-/Notizcontrols, gemeinsamer Parser und getrennte Strength-/Itemzustände für alle elf realen Non-Strength-Entries; Block-B-Matrix `85/85`. |
| S4.3 | Validität, gemischte Sessions und Lifecycle | `High` | PASS | Mixed Sessions, Draft-first, Reorder, History-/Timertrennung, vollständiger Closeguard, Fokus-, Background- und Raceguards grün; kein Draftfinding. |
| S4.4 | Responsive Politur und gebündeltes Harness | `High` | PASS | R6-CSS und vier kontrollierte Fixtures; Harness-Matrix `12/12`, 44px bei 320px, kein Overflow/Clipping, Background `41s`; Stop vor S5. |
| S5 | Testmatrix, Full Review und CodeRabbit | `Extra High` | PASS | `85/85`, Katalog `v2 / 80 / 47 / 58`, Syntax `10/10`, Isolation PASS; F-ACT-R6-28 fixed, nativer Full Review grün, CodeRabbit `0 issues`; Stop vor S6. |
| S6 | Doku-Sync, Recap und Archiv | `High` | PASS | Module Overview, Masterplan und HCR-024 synchronisiert; Full Contract Review ohne offene Findings; Changelog nicht bemerkenswert; R6 archiviert, Stop vor R7. |

<!-- markdownlint-enable MD013 -->

## Findings

<!-- markdownlint-disable MD013 -->

| ID | Severity | Typ | Status | Entscheidung / Zielschritt |
| --- | --- | --- | --- | --- |
| F-ACT-R6-01 | P1 | Contract/Scope | fixed | „Duration“ war mehrdeutig, weil R5 bereits `duration_sec` und `distance_m` für Strength-Sets implementiert. R6 ist auf itemweite `duration_min`/`distance_km` begrenzt. |
| F-ACT-R6-02 | P1 | Contract/Data | fixed | Draft v2 besitzt eine exakte Itemform ohne R2-Itemfelder. R6 verlangt deshalb Draft v3 statt stiller v2-Erweiterung. |
| F-ACT-R6-03 | P1 | Data/Lifecycle | fixed | Itemdauer könnte fälschlich aus der Sessionuhr abgeleitet werden. D-ACT-R6-09 trennt beide Ebenen verbindlich. |
| F-ACT-R6-04 | P1 | Data/Consumer | fixed | Neue Itemwerte könnten bei Add/Move/Sessionnote-Rebuilds verloren gehen. D-ACT-R6-14 verlangt vollständige Records und Erhaltungstests. |
| F-ACT-R6-05 | P1 | UX/Data | fixed | Historische Duration-Werte könnten als heutige Leistung vorbefüllt werden. D-ACT-R6-13 verbietet jede Draftmutation oder Prefill. |
| F-ACT-R6-06 | P2 | Scope | fixed | O-6 hätte Intensität samt neuem Persistenzvertrag geöffnet. Für die erste Activity-V2-Ausbaustufe ausdrücklich ausgeschlossen. |
| F-ACT-R6-07 | P1 | Data/UX | fixed | Reine Notiz oder optionale Distanz könnte fälschlich Vollständigkeit signalisieren. Pflichtdauer bleibt Voraussetzung. |
| F-ACT-R6-08 | P2 | Contract | fixed | R1/R2 erlauben Itemnotizen für alle Tracking-Modi, R5 besitzt aber keine Itemnote. R6 ergänzt sie einmal gemeinsam, ohne Setvalidität umzudeuten. |
| F-ACT-R6-09 | P1 | Lifecycle/Race | fixed | Neue Itemcontrols wären während eines pending Discardguards mutierbar. Sie werden in denselben R5-Guard aufgenommen. |
| F-ACT-R6-10 | P2 | Workflow/Tokens | fixed | Wiederholte vollständige Harness-Aufrufe pro Substep erzeugen redundante Toolausgaben. D-ACT-R6-17 bündelt sie invalidierungsbasiert. |
| F-ACT-R6-11 | P2 | Workflow | fixed | Eine Evidence-Datei wäre bei rein lokaler isolierter UI-Arbeit redundant. Evidence-Vertrag geprüft und als nicht erforderlich dokumentiert. |
| F-ACT-R6-12 | P2 | Contract/QA | fixed | S4 referenzierte die namespaceten Test-IDs verkürzt als `T-01`. Alle S4R-/Invalidation-Verweise verwenden nun eindeutig `T-ACT-R6-*`. |
| F-ACT-R6-13 | P2 | Contract/Consumer | fixed | Der archivierte frühe R5-S1-Stand nennt fünf Draftfassaden. Der finale reale Shelltest besitzt sieben vollständige Draftfassaden plus eine absichtlich unvollständige Legacy-Negativfassade. Die S1-Consumerkarte bindet deshalb den aktuellen Codebestand statt den historischen Zwischenzähler. |
| F-ACT-R6-14 | P1 | Data/UX | fixed | Die erwartete Notizbeschreibung ließ offen, ob während der Eingabe getrimmt wird. D-ACT-R6-20 friert `'' -> null`, sonst exakten Rohtext ein; dadurch bleiben Draft, DOM und Caret konsistent. |
| F-ACT-R6-15 | P1 | Contract/Security | fixed | Der erwartete Itemzustand führte einen nicht näher bestimmten „Contractbruch“ unter `invalid`. D-ACT-R6-23 trennt normale ungültige Rohwerte vom fail-closed Shellfehler `INVALID_DRAFT_STATE`. |
| F-ACT-R6-16 | P2 | Contract/Parser | fixed | Der archivierte R5-Zieltext erwähnt bei `valid` einen numerischen Parserwert, die reale private R5-Runtime liefert und konsumiert jedoch nur `state`/`error`. D-ACT-R6-21 bindet R6 an den realen Consumerbedarf und erfindet keine Vorabnormalisierung. |
| F-ACT-R6-17 | P1 | Lifecycle/Race | fixed | Eine Sperre nur neuer R6-Inputs ließ bestehende Search-, Sessionnote-, Move- und Remove-Pfade denselben v3-Draft während einer asynchronen Close-Bestätigung verändern. D-ACT-R6-15 sperrt nun alle draftmutierenden Controls und Handler, ohne Confirmation-/Discardsemantik zu ändern. |
| F-ACT-R6-18 | P1 | Contract/Consumer | fixed | S4.1 nannte den Shellvalidator nur indirekt als Consumer-Test, obwohl `session-shell.js` Schema-ID, Methoden und Itemform produktiv exakt validiert. Block A umfasst nun Shellcode, Shelltests und den direkten Semantics-v2-Consumer atomar. |
| F-ACT-R6-19 | P1 | Contract/UI | fixed | Der kombinierte Itemzustand war keinem eindeutigen DOM-Träger zugeordnet und hätte die R5-Strength-Editorwahrheit überschreiben können. D-ACT-R6-24 trennt Item-Row-Aggregat und R5-Seteditorzustand. |
| F-ACT-R6-20 | P2 | QA/Invalidation | fixed | Der S2-Handoff verlangte für S4.1 die reale 11-Entry-Policyprüfung T-ACT-R6-05, während S4R und S4.1 sie ausließen. Alle Block-A-Matrizen enthalten nun T-ACT-R6-05. |
| F-ACT-R6-21 | P2 | Lifecycle/Performance | fixed | Der API-No-op war exakt, der Shellpfad hätte danach aber trotzdem State lesen und patchen können. D-ACT-R6-25 beendet einen referenzgleichen No-op ohne DOM-Lifecycle. |
| F-ACT-R6-22 | P2 | Contract/Scope | fixed | Das initiale Risikoregister sprach von Save-ready-Zuständen, obwohl R6 keinen Session-Savevertrag besitzt. Es verwendet jetzt ausschließlich ungespeicherte Itemzustände; Save und Normalisierung bleiben R8. |
| F-ACT-R6-23 | P1 | Workflow/Rollback | fixed | Block A, B und C überlappen in Shellcode/-tests. D-ACT-R6-26 verbietet einen pauschalen Whole-File-Rollback und friert blockeigene Hunk- sowie Abhängigkeitsreihenfolge ein. |
| F-ACT-R6-24 | P2 | Scope/Files | fixed | Die S4R-Zeile für S4.3 nannte Draft/Shell/tests pauschal, obwohl S3 Draftänderungen dort nur bei realem Finding erlaubt. S4.3 ist nun auf Shellcode/-tests begrenzt; ein Draftfinding invalidiert Block A. |
| F-ACT-R6-25 | P2 | QA/Invalidation | fixed | Block C verwendete `T-ACT-R6-01 bis -13 soweit betroffen` statt einer deterministischen Menge. Für CSS/Harness/Fixtures/Shelltests gelten nun exakt T-ACT-R6-01, -03 und -05 bis -13. |
| F-ACT-R6-26 | P2 | QA/Oracle | fixed | Der erste S4.1-Negativtest verwendete `bench_press.weight_kg` als vermeintlich verbotenes Feld, obwohl die reale Policy es erlaubt. Das Oracle prüft nun das tatsächlich verbotene `assistance_kg`; der Produktvertrag war korrekt und blieb unverändert. |
| F-ACT-R6-27 | P2 | QA/Harness | fixed | Ein warmer Harness-Tab hielt nach dem S4.4-CSS-Delta noch das alte Stylesheet und zeigte neue Iteminputs deshalb mit Browserdefault-Höhe. Der isolierte Harness versioniert seine lokale CSS-URL deterministisch mit `?v=r6-s4-4`; danach waren alle Touchziele mindestens 44px. Produktintegration und CSS-Vertrag blieben unverändert. |
| F-ACT-R6-28 | P1 | Contract/Security | fixed | Der erste S5-Full-Review belegte, dass die Shell zwar Scope, Typ und Einheit der Item-Felddefinitionen prüfte, aber alternative positive Min-/Max-/Dezimalgrenzen akzeptiert hätte. Der Validator bindet `duration_min` nun exakt an `1..1440` und `distance_km` an `0.01..1000` mit zwei Dezimalstellen; neue Negativoracles decken jede Grenze ab. |

<!-- markdownlint-enable MD013 -->

## Initialer Contract Review der Roadmap

Geprüft am `2026-08-08` gegen Root-README, Workflowvertrag, Masterplan,
R1-/C2-Semantik, R2-Commitvertrag, finalen R5-Draft-/Shellvertrag, reale
Activity-V2-Runtime und HCR-017 bis HCR-023.

- Produktziel:
  - `PASS`; R6 erfasst Hallenfußball, Schwimmen, Radfahren und ähnliche
    Aktivitäten mit minimaler Reibung und ohne Trainingswissenschaft.
- Reihenfolge:
  - `PASS`; R6 setzt R5 voraus und liefert die letzte flüchtige Draftform vor
    R7-Recovery und R8-Commitintegration.
- Semantik:
  - `PASS`; elf reale Non-Strength-Einträge verwenden ausschließlich die zwei
    bestehenden Policies `duration` und `duration_distance`.
- Datenvertrag:
  - `PASS`; Draft v3 spiegelt die bereits vorhandenen R2-Itemfelder als
    Rohtext/null, während SQL und numerischer Commitvertrag unverändert bleiben.
- Strength-Kompatibilität:
  - `PASS`; R5 behält `duration_sec`, `distance_m`, Setparser und Setstatus.
    R6 ergänzt nur gemeinsame Itemrecords und optionale Notiz.
- Zeitvertrag:
  - `PASS`; Sessionuhr und Itemdauer bleiben getrennt und ohne automatische
    Plausibilitätsbehauptung.
- Consumervertrag:
  - `PASS`; R4-Historie bleibt read-only; R7/R8 erhalten einen eindeutigen
    v3-Handoff.
- Scope:
  - `PASS`; kein Produktload, Save, Storage, SQL, Supabase oder Katalogumbau.
- Workflow:
  - `PASS`; S4 baut, S5 prüft den finalen Diff und führt CodeRabbit aus.
    Browserphasen sind ohne Verlust der erforderlichen Viewports und Zustände
    gebündelt.
- Evidence:
  - `PASS`; separate Datei nicht erforderlich.
- Fresh-Chat-Tauglichkeit:
  - `PASS`; Produktentscheidungen, Lesereihenfolge, Baseline,
    Stop-Bedingungen, technische Freeze-Punkte und nächster Schritt sind
    vollständig in Roadmap und Referenzen enthalten.
- Größenprüfung:
  - `PASS`; keine Kürzung allein wegen des Orientierungswerts. Ergebnisse
    bleiben später je Substep auf höchstens sechs Kernpunkte begrenzt.
- Korrigierte Findings:
  - F-ACT-R6-01 bis F-ACT-R6-12.
- Offene blockierende Findings:
  - `none`.

---

## S1 - System- und Vertragsdetektivarbeit

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. Pflichtreferenzen in der Startkartenreihenfolge lesen.
2. `git status --short`, letzten R5-Commit und relevante Activity-V2-Dateien
   erfassen; fremde Änderungen weder verändern noch zurücksetzen.
3. Frische Baseline ausführen:
   - `node --test app/modules/vitals-stack/activity/v2/*.contract.test.js`
   - `node tools/activity-catalog.mjs check`
   - `node --check` für alle zehn Activity-V2-JS-Dateien
4. Exakten Draft-v2-Snapshot, öffentliche API, Revisions-, No-op-, Add/Remove/
   Move-/Sessionnote-/Discard-Rebuilds und alle direkten Consumer kartieren.
5. R2-Itempayload und Grenzen read-only gegen `data-access.js` und bei Bedarf
   `sql/20_Activity_V2.sql` verifizieren.
6. Alle Catalog-v2-Entries nach Tracking-Modus gruppieren und die realen
   `duration`-/`duration_distance`-Policies belegen.
7. R5-Parser-, Validitäts-, Fokus-, Close- und DOM-Patchstrategie für
   Wiederverwendung versus bewusste Abgrenzung dokumentieren.
8. R4-Historienmodell und alle Pfade prüfen, über die Lookupsettlements,
   Reorder, Timer, Backgroundwechsel oder Close aktuelle Inputs berühren
   könnten.
9. Bestehende Harness-Routen, Browserstart, Viewports und statische
   Isolationstests erfassen. In S1 keinen routinemäßigen visuellen Volltest
   starten.
10. Fakten und technische Ableitungen getrennt dokumentieren.
11. Contract Review durchführen, Findings korrigieren, Statusmatrix und Resume
    Card aktualisieren und vor S2 stoppen.

S1 muss mindestens folgende Fakten einfrieren:

- aktueller Test-/Katalog-/Syntaxstand;
- exakte v2-Item- und Setform;
- jede Snapshot-Rebuildstelle und jeder Draft-Testdouble-Consumer;
- exakte R2-Grenzen und Normalisierung für `duration_min`, `distance_km`,
  `note` und `sets`;
- Anzahl und Keys beider Non-Strength-Policygruppen;
- bestehende Shell-Handoffs für Non-Strength;
- bestehende read-only History-Darstellung;
- geschützte produktive Dateien und fehlende Produktverdrahtung.

Ergebnisformat:

- Systemkarte;
- Consumer-/Invalidationskarte;
- belegte Verträge;
- Fakten versus Ableitungen;
- Findings/Korrekturen;
- S1-Abnahme und genau ein nächstes Gate.

### S1-Ergebnis

#### Gelesene Sources of Truth und Gitstand

- Vollständig in der Startkartenreihenfolge gelesen:
  - diese Roadmap einschließlich Startkarte, Resume Card, Decision Log,
    Findings und S1-Exit;
  - Root-`README.md`, `docs/DEV_ENVIRONMENT.md` und alle vier Dateien unter
    `docs/templates/`;
  - Trainingsmodul-Masterplan und Activity Module Overview;
  - R1-Baseline- und C2-Katalog-v2-Vertrag;
  - archivierte R2- und R5-Roadmaps für den Commit-/Draftvertrag;
  - wegen der konkreten Timer-, Close-, History- und Racefrage zusätzlich die
    zuständigen R3-/R4-Vertragsabschnitte;
  - reale Activity-V2-Runtime, alle fünf Contracttestdateien, CSS, beide
    Harnesses und HCR-017 bis HCR-023.
- `git status --short` vor der S1-Dokumentation zeigte ausschließlich diese
  ungetrackte R6-Roadmap. Activity-V2-Code, Activity V1, `index.html`, SQL und
  andere Ownerdateien waren unverändert.
- Letzter relevanter Activity-V2-Commit:
  `1c8c9f773bccf0674dd42a02856cbc465cb953e1` vom
  `2026-08-08T20:13:11+02:00`,
  `feat(activity-v2): add isolated strength set editor`.

#### Frische Baseline

- `node --test app/modules/vitals-stack/activity/v2/*.contract.test.js`:
  `81/81 PASS`, `0` Fehler, `0` Skips, `0` Todos.
- `node tools/activity-catalog.mjs check`:
  `PASS catalog_version=2 entries=80 alias_appends=47 search_cases=58
  runtime=checked sql=checked`.
- `node --check` über alle zehn Activity-V2-JS-Dateien:
  `10/10 PASS`.
- Statische Negativnachweise:
  - kein Diff in `index.html`, Activity V1, `data-access.js` oder
    `sql/20_Activity_V2.sql`;
  - `index.html` lädt keine Activity-V2-Datei;
  - Draft, Shell und Shell-Harness referenzieren weder Netzwerk noch Storage/
    IndexedDB noch `commitSession`.
- Die vollständige Contractsuite prüft die bestehende JS-`commitSession`-
  Fassade ausschließlich in einem VM-lokalen Mocktransport. S1 führte keinen
  realen RPC-, Supabase-, Netzwerk- oder Produktaufruf aus.
- Kein visueller Harness wurde geöffnet: Code, Contracttests und statische
  Nachweise beantworteten alle S1-Baselinefragen. Die Browsermatrix bleibt an
  den vorgesehenen S4-/S5-Gates.

#### Systemkarte - Fakten

<!-- markdownlint-disable MD013 -->

| Schicht | Reale Producer / Consumer | Belegter Iststand |
| --- | --- | --- |
| Katalog | `semantics.js`, additiv `semantics-v2.js` | Catalog v2 ist ein tief eingefrorener vollständiger 80er-Snapshot. Entry-Policy und Felddefinitionen sind alleinige Quelle für Trackingmodus, erlaubte Felder und Grenzen. |
| Flüchtiger Draft | `session-draft.js` | Draft v2 hält Sessionidentität, Timerstart, Sessionnotiz und vollständige R5-Setrecords; Non-Strength besitzt noch ausschließlich `sets: []`. Kein Storage, Netzwerk oder Save. |
| Isolierte Shell | `session-shell.js`, `session-shell.css` | Konsumiert Draft und injizierte Semantik fail-closed, rendert R5-Strength-Editor und für Non-Strength nur den neutralen R6-Handoff. |
| Read-only Historie | optionaler Shellcallback; Producer `data-access.js` | Validierte R2-History wird in ein eigenes tief eingefrorenes Displaymodell projiziert und ausschließlich in der Historyregion gerendert. Sie ist kein Draftproducer. |
| R2-Commitgrenze | `data-access.js`, unverändertes SQL 20 | Kennt bereits numerische vollständige Session-/Item-/Setpayloads. Draft v2 ist kein Commitpayload; R6 verwendet oder ändert diesen Pfad nicht. |
| Browsernachweis | `session-shell-harness.html` | Rein lokale Routen `empty`, `policies`, `history`, `all`; echte Semantik/Draft/Shell plus deterministische Historyfakes. Kein Product Load. |
| Produkt | Activity V1 und `index.html` | Einziger sichtbarer Activitypfad; Activity V2 bleibt vollständig unverdrahtet. Außerhalb des V2-Verzeichnisses liest nur der read-only Katalog-Inspector die V2-Semantik. |

<!-- markdownlint-enable MD013 -->

#### Draft-v2-, Rebuild- und Consumervertrag - Fakten

- Draftschema exakt `midas.activity-session-draft.v2`; Top-Level-Keys exakt
  `draft_schema_version`, `request_id`, `catalog_version`, `revision`,
  `started_at`, `note`, `items`.
- Itemform exakt `item_key`, `item_order`, `sets`.
- Setform exakt `set_order`, `reps`, `duration_sec`, `distance_m`,
  `weight_kg`, `assistance_kg`; Messwerte sind `null` oder maximal 32
  Unicode-Codepoints langer Rohtext. `''` wird zu `null`.
- Öffentliche Controller-API exakt `getSnapshot`, `getTimerSnapshot`,
  `addItem`, `removeItem`, `moveItem`, `setNote`, `discard`, `addSet`,
  `removeSet`, `setSetField`.
- `createSnapshot` ist die gemeinsame Rebuildgrenze und wird an neun realen
  Stellen verwendet: pristine Create, Add Item, Remove Item, Move Item,
  Sessionnote, Discard, Add Set, Remove Set und Setfeldmutation.
- `withItemOrder` rekonstruiert ein verschobenes Item derzeit explizit aus den
  drei v2-Keys. `addSet`, `removeSet` und `setSetField` bauen ebenfalls ein
  neues Itemobjekt explizit aus diesen drei Keys. Diese vier Rekonstruktoren
  sind neben `createItemRecord` die konkrete v3-Datenverlustgrenze.
- Alle Rebuilds sind copy-on-write, tief eingefroren und revisionsgenau.
  Kanonische No-ops behalten dieselbe Snapshotreferenz; Fehler verändern weder
  Snapshot noch Revision. `discard` ist der einzige neue pristine Draft mit
  neuer Request-ID und Revision `0`.

Direkte Consumer und v3-Invalidierung:

<!-- markdownlint-disable MD013 -->

| Consumer | Exakte heutige Kopplung | v3-Invalidierung |
| --- | --- | --- |
| `session-draft.contract.test.js` | exakte Schema-, API-, Item-/Setkey-, Rebuild-, No-op- und Freezeassertions | vollständige v3-Form, neue Itemmutation und Erhaltung aller Werte |
| `session-shell.js` | `DRAFT_SCHEMA_VERSION`, zehn `DRAFT_METHODS`, exakte Snapshot-/Item-/Setkeys und Policyvalidator | neue Schema-ID, vollständige Itemkeys, neue Methode, policy-gesteuerte Itemwerte |
| `session-shell.contract.test.js` | sieben vollständige Draftfassaden an den realen Blöcken um Zeile 1214, 1452, 1509, 1553, 1601, 2070 und 2112; zusätzlich eine absichtlich unvollständige Legacy-Negativfassade um Zeile 613 | alle vollständigen Fassaden und schemaabhängigen Fixtures; Legacyfall bleibt bewusst negativ |
| `semantics-v2.contract.test.js` | direkter Realconsumer prüft zehn Methoden, Draft-v2 und exakte Item-/Setform | API-, Schema- und Itemformassertions |
| `session-shell-harness.html` | konsumiert echte Draft-/Shell-API, setzt Strength-Rohwerte und stellt vier lokale Fixtures bereit | spätere R6-Fixtures und Editorstates; keine produktive Kopplung |
| `data-access.js` | kein Draftconsumer | bleibt geschützte spätere R8-Normalisierungs-/Commitgrenze |
| Activity V1 / `index.html` | kein Consumer | müssen ohne Diff und ohne Scriptload bleiben |

<!-- markdownlint-enable MD013 -->

#### R2-Item- und Zahlenvertrag - Fakten

- Erlaubte R2-Itemkeys sind exakt `item_key`, `item_order`, `duration_min`,
  `distance_km`, `note`, `sets`. `item_key`, `item_order` und `sets` sind im
  Request immer erforderlich; die drei übrigen Keys dürfen fehlen oder
  `null` sein. Die lokale Normalisierung erzeugt anschließend den vollständigen
  kanonischen Sechs-Key-Record.
- `duration_min`: Number/Integer `1..1440`; `distance_km`: Number
  `0.01..1000` mit höchstens zwei Dezimalstellen.
- Itemnotiz: optionaler String; die reale R2-JS-Normalisierung entfernt
  ausschließlich führende/nachlaufende ASCII-Leerzeichen, bildet leer auf
  `null` ab und begrenzt auf 500 Unicode-Codepoints.
- `sets` ist immer ein Array. `strength_sets` verlangt `1..50` vollständige
  numerische Sets; `duration` und `duration_distance` verlangen exakt `[]`.
- Entry-Policy erzwingt: Strength hat keine Itemdauer/-distanz; `duration`
  verlangt Dauer und verbietet Distanz; `duration_distance` verlangt Dauer und
  erlaubt Distanz optional. `note` ist in allen drei Modi optional.
- `duration_sec` und `distance_m` sind ausschließlich R5-/R2-Setfelder und
  bleiben samt Setparser und Grenzen unverändert.

#### Elf Non-Strength-Entries - Fakten

<!-- markdownlint-disable MD013 -->

| Trackingmodus | Anzahl | Exakte aktive Catalog-v2-Keys | Policy |
| --- | --- | --- | --- |
| `duration` | 4 | `cross_trainer`, `football`, `jump_rope`, `stair_climber` | `duration_min: required`, `distance_km: forbidden`, `note: optional`, alle Setfelder `forbidden` |
| `duration_distance` | 7 | `cycling`, `hiking`, `rowing`, `running`, `ski_erg`, `swimming`, `walking` | `duration_min: required`, `distance_km: optional`, `note: optional`, alle Setfelder `forbidden` |

<!-- markdownlint-enable MD013 -->

- Reale Felddefinitionen: Itemdauer Integer `1..1440`; Itemdistanz Number
  `0.01..1000`, höchstens zwei Dezimalstellen; Itemnotiz trimbarer String
  `1..500`. Es existiert kein Intensitäts-, RPE- oder anderes R6-Messfeld.

#### Parser, Historie und Lifecycle - Fakten

- R5 hält numerische Eingaben als Draftrohtext. Der private Shellparser
  akzeptiert nur ASCII-Ziffern; Integer besitzen keinen Zwischenzustand,
  Dezimalfelder akzeptieren Komma/Punkt und ausschließlich einen nachlaufenden
  Separator als `intermediate`. Es gibt keine Rundung oder Rückformatierung.
- Feld-, Row- und Itemzustände sind rein abgeleitet. Leere Tails sind erlaubt;
  Teilzeilen und Lücken sind nicht vollständig. Kein Status wird gespeichert.
- Historische Duration-/Distance-/Notizwerte werden aus dem R2-Snapshot
  validiert, in ein eingefrorenes Displaymodell überführt und nur mit
  `textContent` in der getrennten Historyregion ausgegeben. Success, Empty,
  Error/Retry und Late Settlements mutieren den Draft nie.
- Lookup startet erst nach sichtbarem Open. Success/Empty werden pro Key und
  Mount gecacht; Retry ist explizit. Remove, Re-Add, Close-Guard und Destroy
  besitzen Generation-/Patchguards.
- Timerwahrheit ist ausschließlich `started_at` plus aktuelle Clock.
  Intervalle und `visibilitychange` sind Repainttrigger. Der sichtbare Timer
  liest oder schreibt keine Itemwerte; Itemdauer existiert im Ist-Draft noch
  nicht.
- Full Render rekonstruiert aktuelle Strengthinputs ausschließlich aus dem
  Draft. Setinput mutiert Draft-first und patcht danach nur State/ARIA/Copy.
  Ein Post-Mutations-Contractbruch propagiert ohne stale DOM-Rollback.
- Reorder rendert vollständig aus dem Draft und erhält Setrohwerte; Remove/
  Re-Add setzt ausschließlich das entfernte Item zurück. Set-Add/-Remove und
  Itemaktionen besitzen getrennte Controls und Fokusziele.
- Dirty Close koalesziert parallele Anfragen. Während der Confirmation sperrt
  R5 ausschließlich Setinputs, `add-set` und `remove-set`; Cancel oder Fehler
  reaktiviert aus dem unveränderten Draft und reconciliert History
  fokusneutral. Destroy invalidiert Guard und Lookup ohne Discard.
- Background-Visible aktualisiert ausschließlich den Timer. Lookupsettlements
  patchen ausschließlich History. Beide Pfade ersetzen weder Rohwerte noch
  Fokus.

#### Technische Ableitungen für S2

- Draft v3 muss alle sechs Itemkeys immer führen, aber Draftwerte bleiben
  Rohtext/`null`; die numerische R2-Normalisierung wird nicht in R6 kopiert oder
  aufgerufen.
- `createItemRecord`, `withItemOrder`, die drei Set-Item-Rekonstruktoren und
  jede neue Itemmutation müssen vollständige Itemrecords erhalten. Nur die
  Factory zu erweitern würde Werte bei Move, Setmutation oder Rebuild verlieren.
- Die kleinste konsistente API-Erweiterung bleibt eine gemeinsame
  policy-gesteuerte Itemfeldmutation. Exakter Name, Fehlerpräzedenz,
  Notiz-Leerraumbehandlung und Parserzustände werden erst in S2 eingefroren.
- Der bestehende R5-Parser ist privat und setfeldspezifisch. S2 muss
  entscheiden, welche reine Logik gemeinsam genutzt wird; keine neue öffentliche
  Parser-API ist aus S1 ableitbar.
- Aktuelle R6-Inputs müssen als eigene Editorregion neben der History entstehen.
  Kein Historymodell, Cache- oder Lookupsettlement darf Producer eines
  Itemfelds werden.
- R6-Iteminputs und ihre neuen Itemaktionen müssen dem bestehenden pending-
  Close-Guard beitreten. Die bestehende R5-Set- und allgemeine Shellsemantik
  darf dabei nicht umgedeutet werden.
- Sessiontimer und manuelle Itemdauer benötigen getrennte Daten- und DOM-Pfade.
  Es gibt weder eine belegte Summenregel noch eine Ableitung in irgendeine
  Richtung.
- CSS besitzt bereits isolierte Editor-/Set-/Historygrenzen, 44-px-Ziele,
  `min-width: 0` und Breakpoints bei 640/350 px. R6 ergänzt diese Struktur erst
  in S4; S1 erzeugt keine visuelle Behauptung.

#### S1-Contract-Review, Findings und Abnahme

- Pflichtlesereihenfolge und Source-of-Truth-Hierarchie: `PASS`.
- Frische Test-, Katalog-, Syntax- und statische Isolationsbaseline: `PASS`.
- Draft-v2-, R2-Item-, elf-Entry-, Parser-, Timer-, History-, Fokus-, Close-,
  Background- und Racevertrag: `PASS`; keine unbekannten Keys, APIs oder Felder.
- Produkt- und Scopegrenze: `PASS`; Activity V1, `index.html`, SQL/RPC/RLS/
  Grants, `data-access.js`, `commitSession`, Supabase, Storage/IndexedDB und
  produktive Navigation ohne Delta oder realen Aufruf.
- `F-ACT-R6-13 fixed`: Die aktuelle Consumerkarte verwendet sieben
  vollständige Shell-Draftfassaden plus den absichtlich negativen Legacyfall,
  nicht den historischen R5-S1-Zwischenzähler.
- Der Masterplan beschreibt Intensität noch als durch R6 zu entscheidenden
  Zielkorridor. Die aktive R6-Decision D-ACT-R6-08 entscheidet sie mit
  `keine Intensität`; der reguläre Masterplan-Sync bleibt bewusst S6 und ist
  kein S1-Quellenblocker.
- Neue Produktentscheidung, Scope-Ausweitung oder Quellenwiderspruch: `none`.
- Offene In-Scope-Findings: `none`.
- Geänderte Datei: ausschließlich diese Roadmap; kein Produktcode.
- S1-Abnahme: `PASS`.
- Stop: S2 wurde nicht begonnen. Genau nächstes erlaubtes Gate ist
  `S2 - Fachlicher und technischer Zielvertrag` mit `Extra High`.

Exit: Betroffene und geschützte Schichten sind eindeutig, Baseline ist grün
oder ein reales Finding blockiert S2.

## S2 - Fachlicher und technischer Zielvertrag

Reasoning: `GPT-5.6 Sol / Extra High`.

Deterministisch:

1. S1-Fakten gegen Zielvertrag und Decision Log prüfen.
2. Exakten Draft-v3-Snapshot und vollständige Itemform festlegen.
3. Kleinste öffentliche Draft-API samt Fehlercodes, No-op-, Revisions- und
   Atomizitätsvertrag einfrieren.
4. Rohtext-, Parser-, Normalisierungs- und Feldpolicyvertrag exakt definieren.
5. Itemvalidität und deren Beziehung zur bestehenden Strength-Validität
   festlegen, ohne einen Status zu speichern.
6. UI-, Copy-, Fokus-, Close-, Background- und Historyvertrag einfrieren.
7. Sessionuhr-/Itemdauer-Trennung und gemischte Sessions explizit prüfen.
8. O-6 als `keine Intensität` schließen und jeden Persistenzvorgriff abgrenzen.
9. S4-Pflichtpunkte und S5-Tests IDs zuordnen.
10. Owner Briefing zum finalen Draft-/API-Vertrag geben.
11. Contract Review, Findings-Korrektur und Abnahme; vor S3 stoppen.

### S2-finaler Draft-v3-Vertrag

- Schema-ID exakt `midas.activity-session-draft.v3`.
- Top-Level-Keys und Reihenfolge bleiben exakt:

```text
draft_schema_version
request_id
catalog_version
revision
started_at
note
items
```

- `note` auf Top-Level bleibt die bestehende R3-Sessionnotiz samt bisheriger
  `setNote`-Semantik. Sie ist nicht die neue Itemnotiz.
- Jeder Eintrag in `items` besitzt unabhängig vom Tracking-Modus exakt diese
  Keys und Reihenfolge:

```text
item_key
item_order
duration_min
distance_km
note
sets
```

- Feldrepräsentation im flüchtigen Draft:
  - `duration_min` und `distance_km`: `null` oder nichtleerer String mit maximal
    `32` Unicode-Codepoints;
  - Item-`note`: `null` oder nichtleerer String mit maximal `500` Unicode-
    Codepoints;
  - numerisch ungültige, aber typ- und längengültige Strings bleiben erlaubte
    Rohtexte; Syntax, Zahl und Status sind keine Snapshotfelder;
  - kein `_raw`, `value`, `normalized`, `status`, `complete`, `intensity`, `rpe`
    oder anderer Zusatzkey.
- Modusinvarianten ausschließlich aus der eingefrorenen Katalogpolicy:
  - `duration`: `duration_min` mutierbar/required, `distance_km: null`,
    Item-`note` optional, `sets: []`;
  - `duration_distance`: `duration_min` mutierbar/required, `distance_km`
    mutierbar/optional, Item-`note` optional, `sets: []`;
  - `strength_sets`: `duration_min: null`, `distance_km: null`, Item-`note`
    optional und die exakte R5-Setform mit `sets.length` in `1..50`.
- `addItem` initialisiert alle drei Itemfelder mit `null`; Strength erhält wie
  bisher drei vollständig leere R5-Sets, Non-Strength exakt `[]`.
- Item-Remove löscht genau diesen aktuellen Record. Re-Add erzeugt einen neuen
  leeren Record; kein Historywert wird übernommen.
- `withItemOrder`, `createSnapshot`, Sessionnotiz, Move und alle drei
  Set-Rekonstruktoren erhalten stets die vollständige Sechs-Key-Itemform.
- Set-Add/-Remove/-Mutation erhalten die Itemnotiz und die beiden für Strength
  zwingend `null` bleibenden numerischen Itemfelder. Itemmutationen erhalten
  `sets` referenz- und wertgetreu.
- Jeder Snapshot bleibt exakt und tief eingefroren. Echte Mutationen erzeugen
  genau eine Revision; kanonische No-ops behalten dieselbe Snapshotreferenz.
- Fehler sind atomar. `discard` erzeugt eine neue Request-ID und einen pristine
  v3-Snapshot mit Revision `0`, `started_at: null`, Top-Level-`note: null` und
  `items: []`.

### S2-finale öffentliche Draft-API

- Controllerkeys in exakter Reihenfolge:

```text
getSnapshot
getTimerSnapshot
addItem
removeItem
moveItem
setNote
discard
addSet
removeSet
setSetField
setItemField
```

- Die bestehenden zehn Methoden behalten ihre Argumente, Rückgaben, sicheren
  Fehler, No-op-, Revisions-, Timer- und Discardverträge.
- Genau eine Methode kommt hinzu:

```text
setItemField(itemKey, fieldKey, value)
```

- Zulässige `fieldKey`-Werte sind exakt `duration_min`, `distance_km` und
  `note`. Es gibt keine getrennte Notizmethode und keine modusspezifische API.
- `value` muss ein String sein. Für die zwei numerischen Felder gelten maximal
  `32`, für `note` maximal `500` Unicode-Codepoints.
- Exakt `''` wird zu `null`. Jeder andere typ-/längengültige String bleibt
  unverändert; insbesondere findet in der Draftmutation kein Trim, Parse,
  Runden oder Komma-/Punkt-Rewrite statt.
- Ein gleicher kanonischer Wert ist ein No-op mit identischer Snapshotreferenz
  und ohne Revision. Eine echte erfolgreiche Mutation gibt den neuen tief
  eingefrorenen Snapshot zurück.
- Neue Fehlercodes exakt:
  - `INVALID_ITEM_FIELD`: `fieldKey` ist kein bekannter Itemfeldkey;
  - `FORBIDDEN_ITEM_FIELD`: der bekannte Key ist laut captured Entry-Policy
    verboten;
  - `INVALID_ITEM_VALUE`: Wert ist kein String oder überschreitet die
    feldspezifische Codepointgrenze.
- Wiederverwendete Fehler exakt:
  - `INVALID_ITEM_KEY`, `ITEM_NOT_FOUND`, `INVALID_CATALOG` und
    `REVISION_LIMIT_REACHED`.
- Validierungs- und Fehlerpräzedenz:
  1. Itemkey formal validieren;
  2. Item im aktuellen Snapshot finden;
  3. captured Catalogentry und seine bereits validierte Policy verlangen;
  4. Fieldkey validieren;
  5. Policy `required`/`optional` bestätigen;
  6. Stringtyp und feldspezifische Codepointgrenze prüfen;
  7. `''` kanonisieren und No-op vor der Revisionsgrenze erkennen;
  8. Revisionsgrenze prüfen und erst danach den vollständigen Record/Snapshot
     bauen.
- Der Fehlertext bleibt der bestehende generische sichere Drafttext. Rohwert,
  Itemkey, Feldkey und interne Exception werden nicht interpoliert oder geloggt.

### S2-finaler Rohtext-, Parser- und Notizvertrag

- Die Draftrohwerte sind die einzige Eingabewahrheit. Ein Full Render liest
  ausschließlich sie; der DOM ist kein zweiter Puffer.
- Der private R5-Parser wird intern zu einem gemeinsamen numerischen Parser für
  Set- und Itemdefinitionen verallgemeinert. Es entsteht keine öffentliche
  Parser- oder Normalisierungs-API.
- Die Shell validiert die realen Catalog-v2-Definitionen fail-closed:
  - `duration_min`: Item, Integer, `min`, `1..1440`;
  - `distance_km`: Item, Number, `km`, `0.01..1000`, zwei Dezimalstellen;
  - `note`: Item, String, `trim: true`, `1..500`.
- Parserresultat intern exakt als tief eingefrorenes `{ state, error }`.
  `state` ist `empty`, `intermediate`, `valid` oder `invalid`; eine normalisierte
  Zahl wird weder zurückgegeben noch gespeichert.
- Gemeinsamer Zeichenraum:
  - nur ASCII-Ziffern `0..9`;
  - kein Vorzeichen, Exponent, Gruppierungszeichen, Whitespace, Unicode-Ziffer,
    `NaN`, `Infinity`, führender Trenner oder gemischter Trenner;
  - führende Nullen bleiben im Rohtext erlaubt und unverändert.
- `duration_min`:
  - vollständige Syntax exakt `^[0-9]+$`;
  - außer `empty` kein Zwischenzustand;
  - nach Syntaxcheck `Number`, `Number.isSafeInteger` und `1..1440`;
  - Formatcopy `Nur ganze Zahlen eingeben.`;
  - Rangecopy `Erlaubter Bereich: 1 bis 1440.`.
- `distance_km`:
  - vollständige Syntax: mindestens eine Ziffer, optional genau ein `,` oder
    `.` mit einer oder zwei folgenden Ziffern;
  - einziger Zwischenzustand: mindestens eine ASCII-Ziffer plus abschließendes
    Komma oder Punkt; er wird vor Dezimalstellen-/Rangeprüfung erkannt;
  - erst bei vollständiger Syntax Komma intern einmal zu Punkt projizieren und
    `Number` aufrufen; endlicher Wert `0.01..1000`;
  - Formatcopy `Ziffern mit optionalem Komma oder Punkt eingeben.`;
  - Dezimalcopy `Maximal 2 Nachkommastellen.`;
  - Rangecopy `Erlaubter Bereich: 0,01 bis 1000.`.
- Fehlerpräzedenz im Parser: `empty`/definiertes `intermediate`, dann Syntax,
  dann Dezimalstellen, dann Typ/Range. Es wird nie gerundet, abgeschnitten oder
  in den Draft zurückformatiert; Rohwerte erscheinen nie in Fehlercopy.
- Itemnotiz:
  - DOM `''` ruft `setItemField(..., 'note', '')` auf und ergibt Draft-`null`;
  - jeder andere String bis 500 Codepoints bleibt exakt erhalten, auch führende
    oder nachlaufende Zeichen;
  - `maxlength` ist nur UI-Defense; die Draft-API bleibt verbindlich;
  - keine HTML-Interpretation; Ausgabe nur über `value` beziehungsweise
    `textContent`;
  - erst R8 darf für den unveränderten R2-Payload ASCII-U+0020 an beiden Enden
    trimmen und daraus gegebenenfalls `null` machen.

### S2-finaler Validitätsvertrag

<!-- markdownlint-disable MD013 -->

| Ebene/Zustand | Exakte Bedingung | Wirkung |
| --- | --- | --- |
| Numerisches Feld `empty` | Draftwert `null` | keine Messung |
| Numerisches Feld `intermediate` | nur der definierte Distance-Trailing-Separator | editierbar, aber nicht vollständig |
| Numerisches Feld `valid` | Syntax, Typ, Dezimalstellen und Katalog-Min/Max gültig | darf Required/Optional erfüllen |
| Numerisches Feld `invalid` | jeder andere nichtleere Rohtext oder Zahlen-/Rangeverletzung | sichere sichtbare Feldcopy |
| Non-Strength `empty` | alle erlaubten numerischen Felder `empty` und Itemnote `null` | keine aktuelle Eingabe/Leistung |
| Non-Strength `invalid` | mindestens ein erlaubtes numerisches Feld `invalid` | nicht später normalisierbar |
| Non-Strength `complete` | Pflichtdauer `valid`; optionale Distanz `empty` oder `valid`; Note beliebig vertragsgültig | dokumentierte Itemleistung |
| Non-Strength `partial` | weder empty, invalid noch complete; insbesondere Note/Distanz ohne Dauer oder Distance-intermediate | sichtbar unvollständig |
| Strength-Basis | unverändert aus R5-Setzeilen und Präfix-/Lückenregel | R5-Leistungswahrheit |
| Strength gesamt `empty` | R5-Basis `empty` und Itemnote `null` | keine aktuelle Leistung |
| Strength gesamt `partial` | R5-Basis `partial` oder R5-Basis `empty` mit Itemnote | Notiz behauptet keinen Satz |
| Strength gesamt `invalid` | R5-Basis `invalid` | Notiz heilt keinen Fehler |
| Strength gesamt `complete` | R5-Basis `complete` | optionale Note ändert Vollständigkeit nicht |

<!-- markdownlint-enable MD013 -->

- Priorität ist `invalid` vor `partial`, `partial` vor `complete`; `empty` gilt
  nur ohne irgendeinen aktuellen Itemrohwert.
- Reine Itemnotiz, Distanz ohne Pflichtdauer, leere Pflichtdauer oder
  Distance-`intermediate` sind niemals `complete`.
- Structural failures sind nicht `invalid`: falsche Schema-ID oder Keys,
  fehlender Deep Freeze, nichtleere policy-verbotene Felder, Sets am
  Non-Strength-Item oder falsche Setform stoppen fail-closed mit
  `INVALID_DRAFT_STATE`.
- Item-/Feldzustände werden bei jedem Snapshotread aus Draft und captured
  Policy abgeleitet. Sie sind weder Snapshotkeys noch öffentliche Draft-API,
  erhöhen keine Revision und behaupten noch keinen Save.
- R6 führt keinen Session-Save-ready-Status ein. Der spätere vollständige
  Payload-/Normalisierungsvertrag bleibt R8.

### S2-finaler UI-, Copy- und Accessibility-Vertrag

- Kartenreihenfolge bleibt: aktuelle Itemidentität, optionale getrennte
  R4-Historienregion, aktuelle Editorregion, bestehende Itemaktionen.
- Pro Item erscheint genau der policy-gesteuerte aktuelle Editor:
  - `duration`: `Dauer (Min.)` und `Notiz`;
  - `duration_distance`: zusätzlich `Distanz (km)`;
  - `strength_sets`: unveränderter R5-Seteditor plus `Notiz`.
- Verbotene Felder erzeugen kein Input, Placeholder, `defaultValue`, Hidden-
  Feld oder andere DOM-Repräsentation.
- Numerische Inputs exakt:
  - `type="text"`, `maxlength="32"`, `autocomplete="off"`,
    `spellcheck="false"`;
  - Duration `inputmode="numeric"`, Distance `inputmode="decimal"`;
  - Duration erhält `aria-required="true"`;
  - sichtbares eindeutiges Label und Fehlerzuordnung über `aria-describedby`;
  - `aria-invalid="true"` ausschließlich bei `invalid`, nicht bei empty,
    intermediate oder valid.
- Item-`Notiz` ist eine eindeutig gelabelte `textarea` mit `maxlength="500"`
  und `autocomplete="off"`. Keines der drei neuen Felder verwendet einen
  historischen oder sonstigen Placeholder.
- Rohtext gelangt nur über DOM-`value` in Controls. Labels, Status und Fehler
  verwenden `textContent`; keine `innerHTML`- oder HTML-Templateausgabe.
- Der Item-Row-Container trägt den kombinierten `data-state`. Der bestehende
  Strength-Editor und seine Rows behalten ihren separaten R5-Setzustand;
  Non-Strength-Editorstate entspricht dem Itemaggregat. Partial-Copy für das
  Itemaggregat ist exakt `Aktivität unvollständig.`; R5 behält
  `Satz unvollständig.` und die bestehende Lückencopy. Empty/Complete erzeugen
  kein Erfolgsrauschen; invalid zeigt nur die kontrollierte Feldcopy.
- Aktuelle Eingaben erhalten weder Historywerte in `value`, `defaultValue`,
  `placeholder` oder Autofill-Hilfe noch eine Aktion zum Übernehmen der
  Historie.

### S2-finaler Lifecycle-, Fokus-, Race- und Mischvertrag

- Jedes kanonische R6-Inputevent prüft Closeguard, Controlreferenz, Item,
  Tracking-Modus und Policy und ruft dann zuerst `setItemField` mit dem aktuellen
  DOM-String auf. Forged oder stale Targets mutieren nichts.
- Nach erfolgreicher Mutation liest die Shell den neuen Snapshot und patcht nur
  Feld-/Itemzustand, ARIA und kontrollierte Copy. Kein Full Render, kein
  `value`-Rewrite und kein Caretreset pro Tastendruck.
- Gibt die Mutation dieselbe Snapshotreferenz wie `currentState.snapshot`
  zurück, endet der Handler sofort ohne `readState`, Statepatch, Render oder
  globale Statuscopy.
- Scheitert die Draftmutation, bleibt der Snapshot unverändert, das betroffene
  Control wird aus dem stabilen Snapshot restauriert und erhält wieder Fokus.
- Scheitert erst der Snapshotread oder DOM-Patch nach erfolgreicher Mutation,
  propagiert der Contractbruch; der neue Draftwert wird nicht mit einem stale
  DOM-Rollback überschrieben.
- Full Render und Reopen lesen alle Item-/Setrohwerte nur aus Draft v3.
  Item-Reorder erhält die vollständigen Werte und den bestehenden R3/R5-
  Aktionsfokusvertrag. Remove/Re-Add setzt nur das entfernte Item leer zurück.
- Während eines pending Close-/Discardguards sind alle draftmutierenden
  Shellcontrols deaktiviert: Search/Add, Sessionnotiz, Item-Move/-Remove,
  bestehende R5-Setcontrols und neue R6-Iteminputs. Jeder zugehörige Handler
  prüft den Guard zusätzlich; Close bleibt für die bestehende Promise-
  Koaleszierung aktiv, Lookup-Retry bleibt read-only.
- Cancel/Confirmationfehler reaktiviert die Controls gemäß ihren normalen
  Positions-/Limitbedingungen und stellt den vorherigen Fokus wieder her;
  bestätigtes Discard erzeugt den pristine v3-Draft vor Close. Confirmation-
  Context, `confirmed === true`, Discard-vor-Close und Destroygeneration bleiben
  der bestehende R3/R5-Vertrag.
- Historylookup bleibt ein separater read-only Pfad. Loading, Success, Empty,
  Error/Retry, Cachehit, Late Settlement, Remove/Re-Add, Close und Destroy
  patchen ausschließlich die jeweilige Historyregion und niemals aktuelle
  Controls oder Draftwerte.
- Timerintervall und `visibilitychange` lesen ausschließlich
  `getTimerSnapshot`. Die Sessionuhr liest, schreibt, summiert oder plausibilisiert
  kein `duration_min`; Itemmutationen verändern `started_at` nicht.
- `destroy` invalidiert DOM-, Lookup- und Confirmationpfade, ruft kein Discard
  auf und mutiert den Draft nicht.
- Gemischte Sessions dürfen Strength-, Duration- und Duration-Distance-Items
  beliebig enthalten und verschieben. Jedes Item verwendet nur seine Policy;
  Setfelder und itemweite Dauer/Distanz überlappen nie.

### S2-S4-/S5-Handoff

<!-- markdownlint-disable MD013 -->

| Vertragsfläche | Pflichtumsetzung | Verbindliche S5-IDs |
| --- | --- | --- |
| S4.1 Draft v3 | Schema/Keys, elfte Methode, Fehlerpräzedenz, alle Rebuilds und Consumerfassaden | `T-ACT-R6-01` bis `-05`, `-08`, `-09`, `-11` |
| S4.2 Editor | echte 11-Entry-Policies, privater Parser, Note, Aggregate, DOM/A11y/Copy | `T-ACT-R6-01`, `-03`, `-05` bis `-08`, `-11` |
| S4.3 Lifecycle | Mixed, Draft-first, Close, forged target, Post-Mutation, Reorder, Lookup, Timer, Background, Destroy | `T-ACT-R6-01`, `-03`, `-07` bis `-12` |
| S4.4 Responsive/Harness | Fixtures, CSS, Viewports, Fokus/Touch/Overflow und gebündelte Browsermatrix | `T-ACT-R6-01`, `-03`, `-10` bis `-13` |

<!-- markdownlint-enable MD013 -->

- Direkte Draftconsumer müssen Schema v3, Sechs-Key-Items und elf Methoden
  exakt übernehmen: Drafttests, Shellvalidator, sieben vollständige
  Shell-Draftfassaden, der absichtliche negative Legacyfall,
  `semantics-v2.contract.test.js` und Harness.
- `data-access.js` ist kein Draftconsumer und bleibt unverändert. Es wird in R6
  weder importiert noch aufgerufen; R2-Normalisierung und `commitSession`
  gehören ausschließlich zum späteren R8-Handoff.
- Activity V1, `index.html`, Produktnavigation, SQL/RPC/RLS/Grants, Supabase,
  Storage/IndexedDB und R5-Setfelder bleiben geschützt.
- O-6 ist endgültig `keine Intensität`; es gibt keinen Persistenz-, R7-, R8-,
  R11- oder R13-Vorgriff.

### S2-Contract-Review, Findings und Abnahme

- S1-Fakten gegen Zielvertrag und D-ACT-R6-01 bis -18: `PASS`.
- Exakte Draft-v3-Form, elf Methoden, Policy, Fehlerpräzedenz, No-op, Revision,
  Deep Freeze und Atomizität: `PASS`.
- Numerischer Rohtext, private R5-kompatible Parserzustände, sichere Copy und
  Itemnotizgrenze: `PASS`.
- Non-Strength- und Strength-Aggregate ohne gespeicherten Status oder falsche
  Leistungsbehauptung: `PASS`.
- UI-, Fokus-, Close-, History-, Timer-, Background-, Destroy- und Mixed-
  Vertrag: `PASS` als testbarer Zielvertrag; das Bruchrisikoreview folgt in S3.
- `F-ACT-R6-14 fixed`: keine inputzeitige Notiznormalisierung und keine zweite
  DOM-Wahrheit.
- `F-ACT-R6-15 fixed`: Nutzereingabe-`invalid` und fail-closed
  `INVALID_DRAFT_STATE` sind getrennt.
- `F-ACT-R6-16 fixed`: kein unbelegter numerischer Parserresultatkey und keine
  vorgezogene R8-Normalisierung.
- Quellenwiderspruch, neue Produktentscheidung, Scope-Ausweitung oder offenes
  Owner-Gate: `none`.
- Produktcode-/Testinvalidierung: `none`; nur diese Roadmap wurde geändert. Die
  frische S1-Baseline `81/81`, Katalog `v2 / 80 / 47 / 58`, Syntax `10/10` und
  statische Isolation bleiben gültig.
- Größenprüfung: Der Workflow-Prüfpunkt von ungefähr `80 KB / 1.200 Zeilen` ist
  überschritten und geprüft. Der neue Inhalt ist der einmalige ausführbare
  S2-Vertrag; eine Auslagerung würde Decisions, Gates, Invalidation und den
  Fresh-Chat-Kontext trennen. Eine Evidence-Datei bleibt nicht erforderlich.
- Visueller Harness: nicht geöffnet; S2 enthält keine visuell unbeantwortbare
  Vertragsfrage.
- S2-Abnahme: `PASS`.
- Stop: S3 wurde nicht begonnen. Genau nächstes erlaubtes Gate ist
  `S3 - Bruchrisiko-, Security- und Umsetzungsreview` mit `High`.

Owner-Briefing:

- Draft v3 ist ausschließlich das flüchtige Bearbeitungsformat. Jedes Item hat
  nun dieselben sechs Felder; die neue gemeinsame Methode ändert genau Dauer,
  Distanz oder Itemnotiz gemäß Katalogpolicy.
- Komma-/Punktwerte und Tippzwischenstände bleiben unverändert im Draft.
  Validität wird nur abgeleitet; erst R8 darf daraus vorhandene R2-Zahlen und
  normalisierte Notizen für einen Commit bilden.
- Die Sessionuhr misst weiterhin die ganze Session. `duration_min` ist ein
  unabhängiger manueller Itemwert. Historie bleibt reine Anzeige, Intensität
  bleibt bewusst außerhalb der ersten Activity-V2-Ausbaustufe.

Exit: `PASS`; keine fachliche oder technische Grundsatzfrage bleibt offen. S3
besitzt einen exakten, testbaren Vertrag und wurde noch nicht begonnen.

## S3 - Bruchrisiko-, Security- und Umsetzungsreview

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. Draftmigration v2 -> v3, vollständige Rebuilds und Consumerdifferenzen
   red-teamen.
2. Policyverwechslung zwischen Item- und Setfeldern prüfen.
3. Parser-, Range-, Locale-, Intermediate- und Notizgrenzen prüfen.
4. Leere, partielle, vollständige und ungültige Zustände auf falsche
   Leistungsbehauptung prüfen.
5. Sessiontimer-/Itemdauer-Verwechslung und gemischte Sessions prüfen.
6. History-Prefill, stale Lookup, Reorder, Close, Destroy, Background und
   Post-Mutationsfehler prüfen.
7. DOM-Eventtargets, Textausgabe, Autofill, Mobiletastatur, Fokus und
   Accessibility prüfen.
8. Produktisolation, Netzwerk-/Storagefreiheit und geschützte Dateien prüfen.
9. Rollback, Invalidation Map, S4-Schnitt und S5-Pflichtmatrix festlegen.
10. Contract Review, Findings-Korrektur und Abnahme; vor S4R stoppen.

### S3-Risikoregister

<!-- markdownlint-disable MD013 -->

| ID | Severity | Risiko | Reale Angriffs-/Fehlerfläche | Abschluss / Zuordnung |
| --- | --- | --- | --- | --- |
| R-ACT-R6-01 | P0 | Leere Non-Strength-Felder oder drei leere Strength-Sets behaupten Leistung. | Add erzeugt sichtbare Controls und R5-Defaultrows. | Ungespeicherte Policyaggregate; `null`-Defaults, Pflichtdauer und R5-Präfixregel; S4.2/3, T-ACT-R6-07/-08. |
| R-ACT-R6-02 | P0 | R4-Historie wird als heutige Dauer, Distanz oder Notiz vorbefüllt. | History und aktueller Editor stehen in derselben Itemkarte. | Getrennte Daten-/DOM-Region, keine Historywerte in Input/Placeholder/Autofill, keine Übernahmeaktion; S4.2/3, T-ACT-R6-08/-10. |
| R-ACT-R6-03 | P1 | Draft v3 bricht einen exakten v2-Consumer in einem gemischten Zwischenstand. | Schema-ID, sechs Itemkeys, elf Methoden, Shellvalidator, sieben Fassaden und Semantics-v2-Realconsumer. | `F-ACT-R6-18 fixed`; atomarer Block A umfasst Draft, Shellvalidator und direkte Consumer; S4.1, T-ACT-R6-01/-04/-09. |
| R-ACT-R6-04 | P1 | Rebuild verliert R5-Sets oder neue Itemwerte. | `createItemRecord`, `withItemOrder`, `createSnapshot`, Set-Add/-Remove/-Field und Sessionnote. | Vollständige copy-on-write Itemrecords plus Erhaltungstests; S4.1, T-ACT-R6-04/-08/-09. |
| R-ACT-R6-05 | P1 | Item- und Setpolicy werden verwechselt. | Gleichzeitige Namen `duration_min`/`duration_sec`, `distance_km`/`distance_m`, gemeinsame Note. | Disjunkte API-Keylisten, captured Policy, forbidden-field Guards, `sets: []`; S4.1/2, T-ACT-R6-05/-08. |
| R-ACT-R6-06 | P1 | Locale oder JS-Coercion erzeugt einen anderen Zahlenwert. | Komma/Punkt, Intermediate, führende Nullen, Range und `Number`. | Lexikalischer Check vor einmaligem `Number`, keine Rundung/`parseFloat`/Coercion; S4.2, T-ACT-R6-06. |
| R-ACT-R6-07 | P1 | Rohtext oder Notiz gelangt in HTML, Log oder Fehlerdiagnose. | Ungültige Zahlen und beliebiger 500-Codepoint-Notiztext sind Draftwerte. | Nur DOM-`value`/`textContent`, kontrollierte Copy und generische Fehler; S4.2/3, T-ACT-R6-06/-10/-11. |
| R-ACT-R6-08 | P1 | Notiz oder Distanz ohne Dauer beziehungsweise Note-only Strength wird `complete`. | Kombinierter Itemstatus ergänzt die R5-Setwahrheit. | `F-ACT-R6-19 fixed`; Item-Row-Aggregat getrennt vom Strength-Editorstate, Pflichtdauer und Note-only-Partial; S4.2/3, T-ACT-R6-07/-08. |
| R-ACT-R6-09 | P1 | Sessionuhr überschreibt, summiert oder plausibilisiert Itemdauer. | Timer- und Itemdauer-Copy enthalten beide „Dauer“. | Getrennte Snapshotkeys, Handler und DOM-Pfade; Timer liest nur `getTimerSnapshot`; S4.3, T-ACT-R6-09/-10. |
| R-ACT-R6-10 | P1 | Pending Close verwirft nach dem bestätigten Snapshot weitere Draftmutationen. | Asynchroner Confirmation-Promise ließ bestehende Search-/Note-/Move-/Remove-Pfade aktiv. | `F-ACT-R6-17 fixed`; alle draftmutierenden Controls disabled plus Handlerguard, bestehende Confirmationsemantik unverändert; S4.3, T-ACT-R6-10. |
| R-ACT-R6-11 | P1 | Lookup, Timer, Background oder Reopen ersetzt Rohwert/Fokus. | Async Historypatch, Intervall, `visibilitychange` und Full Render. | Lookup nur Historyregion, Timer nur Timertext, Render nur aus Draft, generation guards; S4.3, T-ACT-R6-10/-12/-13. |
| R-ACT-R6-12 | P1 | Mutation gelingt, späterer Shellpatch rollt stale DOM zurück. | Draftmutation und `readState`/DOM-Patch sind zwei Fehlergrenzen. | Mutationcatch endet vor Post-Mutationsread; nachgelagerter Contractbruch propagiert ohne Restore; S4.3, T-ACT-R6-10. |
| R-ACT-R6-13 | P1 | Forged oder stale Eventtarget mutiert das falsche Item/Feld. | Delegiertes `input`/`click`, Dataset-Key/Order und Full-Render-Replacements. | Canonical-Ref-Identität, Snapshot-/Policycheck und Draft-API-Guard; S4.2/3, T-ACT-R6-05/-10. |
| R-ACT-R6-14 | P2 | Referenzgleicher API-No-op erzeugt dennoch State-/DOM-Arbeit. | Programmatic Inputevent oder kanonisches `''` bei bereits `null`. | `F-ACT-R6-21 fixed`; Handler beendet bei identischer Snapshotreferenz; S4.2/3, T-ACT-R6-04/-10. |
| R-ACT-R6-15 | P2 | Autofill, Spell-Correction oder DOM-`maxlength` wird als Sicherheitsgrenze missverstanden. | Mobile Textinputs/Textarea und programmatische Events. | Attribute sind UX-Defense; API-Codepointgrenze, canonical refs und Policy bleiben verbindlich; S4.2/4, T-ACT-R6-06/-10/-12. |
| R-ACT-R6-16 | P2 | Notiz, Copy oder Controls brechen 320px-Layout und Touchziele. | 500 Codepoints, Status-/Range-Copy und gemischte Karten. | Grid/Wrap/`min-width: 0`, drei Viewports, 44px und gezielte Browsermatrix; S4.4, T-ACT-R6-12/-13. |
| R-ACT-R6-17 | P1 | R6 zieht Produktload, Netzwerk, Storage oder Commitpfad ein. | Harness, mögliche Data-Access-Wiederverwendung und Scriptreihenfolge. | Geschützte Dateien, kein Data-Access-Import und statische Negativtests; S4/S5, T-ACT-R6-11. |
| R-ACT-R6-18 | P1 | Itemstatus wird zu Save-, Intensitäts- oder Planlogik erweitert. | Begriffe „complete“/„Dauer“ könnten R8 oder O-6 vorziehen. | `F-ACT-R6-22 fixed`; nur ungespeicherte Itemzustände, keine Session-Saveready-/Intensitätslogik; S4/S5, T-ACT-R6-07/-11/-14. |

<!-- markdownlint-enable MD013 -->

- Blockierende Risiken nach Vertragskorrektur: `none`.
- Offene In-Scope-P0/P1-Risiken: `none`.
- Alle Implementierungsrisiken besitzen einen S4-Substep und mindestens eine
  stabile `T-ACT-R6-*`-ID; keine Zuordnung benötigt eine Produktentscheidung.

### S3-Draft-, Rebuild- und Consumerreview

- Block A ist eine atomare v2-zu-v3-Contractgrenze. Er umfasst mindestens:
  - `session-draft.js` und `session-draft.contract.test.js`;
  - `session-shell.js` für Schema-ID, elf Methoden, Sechs-Key-Items, Rohtext-
    und Policyvalidator;
  - `session-shell.contract.test.js` mit sieben vollständigen Draftfassaden und
    dem absichtlich negativen Legacyfall;
  - `semantics-v2.contract.test.js` als direkter Realconsumer.
- Das Harness konsumiert den realen Draft und die reale Shell. Es benötigt in
  Block A nur dann ein Delta, wenn sein Contracttest einen tatsächlichen
  Consumerbruch belegt; eine visuelle Prüfung ist für Schemaarbeit nicht nötig.
- `data-access.js` ist kein Draftconsumer. Es bleibt ebenso geschützt wie R2-
  Payload, SQL/RPC und `commitSession`.
- Jeder Rebuildpfad erhält die vollständige Itemform:
  - Add erzeugt genau einen neuen leeren Record;
  - Remove löscht genau einen Record und reindiziert vollständige Nachfolger;
  - Move verschiebt Records und ändert nur erforderliche `item_order`-Records;
  - Top-Level-Sessionnote übernimmt `items` vollständig;
  - Set-Add/-Remove/-Field bauen das geänderte Strength-Item mit unveränderter
    Itemnote und `duration_min`/`distance_km: null` neu;
  - Itemfieldmutation ersetzt nur das Zielitem und teilt dessen unverändertes
    Setarray sicher strukturell.
- Erhaltungstests müssen Referenz-No-op, eine Revision pro echter Mutation,
  atomare Fehler, Deep Freeze, 50er-Grenzen, Discard und Remove/Re-Add getrennt
  belegen. Ein v2/v3-Mischstand darf nie als grüner Block-A-Zwischenstand gelten.

### S3-Policy- und Validitätsreview

- Reale Policyoracles bleiben:
  - vier `duration`: Pflicht-`duration_min`, verbotene `distance_km`, `sets: []`;
  - sieben `duration_distance`: Pflicht-`duration_min`, optionale
    `distance_km`, `sets: []`;
  - 69 Strength-Entries über acht Setpolicys: itemweite Dauer/Distanz verboten,
    Itemnote optional, R5-Sets `1..50`.
- `setItemField` prüft Itemfieldkey und Itempolicy; `setSetField` prüft weiterhin
  ausschließlich Setfieldkey und Setpolicy. `duration_min` wird nie aus
  `duration_sec`, `distance_km` nie aus `distance_m` erzeugt.
- Shellvalidator akzeptiert syntaktisch ungültige typ-/längengültige numerische
  Rohstrings, verwirft aber policy-verbotene Nicht-`null`-Werte, falsche Keys,
  falsche Setanzahl oder fehlenden Deep Freeze mit `INVALID_DRAFT_STATE`.
- Der Item-Row-Container trägt das kombinierte `empty|partial|complete|invalid`.
  Der bestehende Strength-Editor und seine Setrows behalten ihren separaten
  R5-State; die Itemnote kann diesen weder heilen noch umschreiben.
- Non-Strength-Priorität exakt: irgendein numerisches `invalid` -> Item
  `invalid`; sonst gültige Pflichtdauer plus gültige/leere optionale Distanz ->
  `complete`; ohne aktuellen Rohwert -> `empty`; jeder Rest -> `partial`.
- Eine reine Notiz, auch ein erhaltener Space-only-Rohtext, ist aktuelle Eingabe
  und deshalb `partial`, aber niemals Leistung. R8 darf sie später nach seinem
  bestehenden ASCII-Space-Vertrag normalisieren; R6 tut dies nicht.

### S3-Parser-, Locale- und Notizreview

<!-- markdownlint-disable MD013 -->

| Eingabe/Klasse | Duration | Distance | Notiz/API |
| --- | --- | --- | --- |
| `''` | `empty`, Draft `null` | `empty`, Draft `null` | Draft `null` |
| `1`, `0001` | `valid` | `valid` | exakter Rohtext |
| `1440` / `1000`, `1000,00` | Grenze `valid` | Grenze `valid` | n/a |
| `0`, `1441` / `0`, `0,00`, `1000,01` | Range-`invalid` | Range-`invalid` | n/a |
| `1,` oder `1.` | Format-`invalid` | einziges `intermediate` | n/a |
| `,5`, `.5`, `1,2.3`, `1.2,3` | Format-`invalid` | Format-`invalid` | exakter Text, keine HTML-Deutung |
| `1,234` | Format-`invalid` | Dezimalstellen-`invalid` | n/a |
| `-1`, `+1`, `1e2`, `NaN`, `Infinity` | Format-`invalid` | Format-`invalid` | exakter Text |
| Whitespace oder Unicode-Ziffern | Format-`invalid` | Format-`invalid` | nichtleerer Text bleibt Rohtext |
| 32 Codepoints numerisch | Parser entscheidet | Parser entscheidet | n/a |
| 33 Codepoints numerisch | atomar `INVALID_ITEM_VALUE` | atomar `INVALID_ITEM_VALUE` | n/a |
| 500/501 Codepoints Note | n/a | n/a | 500 erlaubt; 501 atomar `INVALID_ITEM_VALUE` |
| `<img ...>` oder Steuertext | numerisch `invalid` | numerisch `invalid` | Draft erlaubt; Ausgabe nur `value`/`textContent` |

<!-- markdownlint-enable MD013 -->

- Der Distance-Trailing-Separator bleibt wie R5 vor Rangeprüfung
  `intermediate`; erst ein vollständiges Token wird numerisch bewertet.
- DOM-`maxlength` bleibt nur UX-Defense. Für programmatische und Unicode-
  Eingaben ist die Draftgrenze `Array.from(value).length` verbindlich und wird
  separat contractgetestet.
- Parsercopy enthält weder Rohwert noch Itemkey und wird nicht geloggt. Die
  einzige Komma-zu-Punkt-Projektion lebt lokal vor `Number` und schreibt nie in
  Draft oder DOM zurück.

### S3-Lifecycle-, Fokus- und Racereview

- Inputmutation:
  - kanonische Ref, Guard, Snapshotitem und Policy vor API-Aufruf prüfen;
  - API-Mutationsfehler restauriert aus dem unveränderten Snapshot und den
    auslösenden Fokus;
  - referenzgleicher No-op endet ohne Read/Patch/Status;
  - erfolgreicher echter Write wird erst danach gelesen und gezielt gepatcht;
  - Post-Mutationsbruch propagiert außerhalb des Mutationcatchs.
- Strukturmutation:
  - Reorder/Remove/Re-Add rendern vollständig aus Draft v3;
  - Move erhält Werte und fokussiert nach bestehendem R3-Vertrag dieselbe
    Aktion am verschobenen Item, mit vorhandenem Fallback;
  - Remove fokussiert Nachbaraktion oder Picker; Re-Add startet Felder leer und
    darf nur die gecachte read-only History wiederverwenden.
- Pending Close:
  - Promise-Koaleszierung, Context, `confirmed === true`, Discard-vor-Close,
    Generation und Focus-Restore bleiben erhalten;
  - Search samt Result-Add, Sessionnotiz, Item-Move/-Remove, Setcontrols und
    Iteminputs werden disabled und handlerseitig abgewehrt;
  - Close bleibt aktiv, damit parallele Requests denselben Promise erhalten;
  - Lookup-Retry bleibt read-only; Lookuppatch selbst bleibt bis Guardende
    blockiert und wird bei Cancel/Fehler fokusneutral reconciliert;
  - Cancel, Confirmationthrow oder Discardfehler reaktiviert alle Controls nach
    ihren normalen Positions-/Min-/Maxbedingungen.
- Async:
  - `visibilitychange` und Intervall patchen ausschließlich Timertext;
  - Lookupsettlements patchen ausschließlich die kanonische Historyregion und
    beachten Mount-/Item-/Generation-/Close-/Destroyguards;
  - Background, Late Settlement und Reopen verändern weder Itemrohwerte,
    Aggregate noch Fokus.
- Destroy entfernt Scheduler/DOM/Listener, invalidiert Confirmation und Lookup,
  löscht aber keinen Draft. Re-Mount liest denselben injizierten v3-Snapshot in
  einen neuen lokalen Lookupcache.

### S3-DOM-, Accessibility- und Securityreview

- Numeric: `type=text`, passendes `inputmode`, `maxlength=32`,
  `autocomplete=off`, `spellcheck=false`, eindeutiges Label,
  `aria-describedby`; nur Pflichtdauer `aria-required=true`.
- Itemnote: gelabelte `textarea`, `maxlength=500`, `autocomplete=off`, kein
  History-/generischer Placeholder. Browser-Autofill ist nicht vertrauenswürdig;
  API und Canonical-Ref-Check bleiben die Grenze.
- `aria-invalid` bezeichnet nur echte Invalidität. Intermediate/Partial werden
  über `data-state` und kontrollierte Copy vermittelt, nicht als gespeicherter
  Status oder Live-Erfolg.
- Item-Row-State und Strength-Editorstate erhalten getrennte DOM-Assertions.
  Dadurch bleiben bestehende R5-Tests aussagekräftig und Note-only Strength
  maschinenprüfbar `partial`.
- Keine Rohwerte in Dataset, ID, HTML-Template, Statuslog oder Fehlertext.
  Itemkeys bleiben regex-validiert; Cataloglabels und History/Notiz verwenden
  `textContent`.
- Der aktuelle statische Iststand bestätigt für Draft, Shell und Harness keine
  `fetch`-/RPC-, Storage-/IndexedDB-, Service-Worker- oder `commitSession`-Kante.
  `index.html` lädt Activity V2 weiterhin nicht.

### S3-Rollback-, Stop- und S4-Schnitt

- R6 besitzt keine Datenmigration, produktive Persistenz oder Deploywirkung.
  Rollback ist dateibasiert; nichts muss aus Supabase oder Storage
  zurückgeschrieben werden.
- Block A ist logisch atomar: Draft v3, Drafttests, Shellschema/API/Validator,
  Shellfassaden und Semantics-v2-Realconsumer werden gemeinsam grün oder
  gemeinsam auf v2 zurückgeführt. Ein Teilrollback ist unzulässig.
- Block B führt S4.2 und S4.3 in einem Code-/Rollbackblock aus, dokumentiert die
  Ergebnisse jedoch getrennt. Sichtbare Inputs ohne finalen Draft-first-/State-
  und Racepfad dürfen kein Zwischen-Gate bilden.
- Block C folgt erst dem finalen Block-B-DOM. CSS, Harnessfixtures und
  zugehörige Shelltests können gemeinsam auf den grünen Block-B-Stand
  zurückgenommen werden.
- Reihenfolge bleibt `A (S4.1) -> B (S4.2 + S4.3) -> C (S4.4)`.
- Ein Draft-/Consumerwiderspruch stoppt Block A. Neuer Persistenz-, Intensitäts-,
  Produktcutover- oder Tracking-Mode-Bedarf stoppt den betroffenen Block und
  geht zurück an S2/S3/S4R beziehungsweise in eine Follow-up-Roadmap.
- S4.3 ändert `session-draft.js` nur bei einem realen Finding. Dann werden
  Block-A-Vertrag und alle T-ACT-R6-04/-05/-08/-09-Checks erneut invalidiert;
  eine still nachgeschobene Draftentscheidung ist verboten.

### S3-Invalidation Map

<!-- markdownlint-disable MD013 -->

| Delta | Verpflichtend erneut | Zusätzlicher Fokus |
| --- | --- | --- |
| Draftschema, Itemform, elf Methoden oder private Policy | `T-ACT-R6-01` bis `-05`, `-08`, `-09`, `-11` | Draft, Shellvalidator, sieben Fassaden, Legacynegativfall, Semantics-v2 |
| Snapshotfactory, Reorder, Sessionnote, Set-/Itemmutation, Remove/Re-Add oder Discard | `T-ACT-R6-01`, `-04`, `-08`, `-09`, `-10` | Werte-/Referenzerhalt, Revision, Atomizität, v3-Rebuilds |
| Numeric-/Note-Limit oder privater Parser | `T-ACT-R6-01`, `-03`, `-05` bis `-08`, `-10` | Locale, Intermediate, Copy, R5-Parserregression |
| Itemaggregate, Statecarrier oder Copy | `T-ACT-R6-01`, `-05`, `-07`, `-08`, `-10`, `-12` | Note-only, Distanz ohne Dauer, Strength-Basis versus Item-Row |
| Editor-DOM, Eventdelegation, No-op, Fokus oder Closeguard | `T-ACT-R6-01`, `-05` bis `-10`, `-12`, `-13` | forged target, alle mutierenden Controls, Post-Mutation, Caret |
| History-/Lookupintegration | `T-ACT-R6-01`, `-08`, `-10`, `-12`, `-13` | kein Prefill, Cache/Retry/Late Remove/Close/Destroy |
| Timer/Background/Destroy | `T-ACT-R6-01`, `-09`, `-10`, `-12`, `-13` | getrennte Dauerpfade, Fokus-/Rohwerterhalt, Schedulercleanup |
| CSS oder A11y-/Mobileattribute | `T-ACT-R6-03`, `-10`, `-12`, `-13` | 1440x900, 390x844, 320x800, Wrap, Overflow, 44px |
| Harness, Fixtures oder Scriptreihenfolge | `T-ACT-R6-01`, `-03`, `-05` bis `-13` | reale Policies/Mixed, lokale Isolation, Console, Background |
| Geschützter Pfad oder Importkante | `T-ACT-R6-01` bis `-03`, `-11`, `-14` | V1/index/data-access/SQL/Storage/Netzwerk/Commit negativ |
| Ausschließlich Roadmap/Doku | `T-ACT-R6-16` plus nativer Contract Review | keine Runtimebaseline invalidiert |

<!-- markdownlint-enable MD013 -->

### S3-S5-Pflichtmatrix

<!-- markdownlint-disable MD013 -->

| ID | Check | Eingefrorene Erwartung |
| --- | --- | --- |
| T-ACT-R6-01 | vollständige Activity-V2-Contracttests | alle grün; finale Anzahl dokumentiert |
| T-ACT-R6-02 | Katalogcheck | exakt `v2 / 80 / 47 / 58` |
| T-ACT-R6-03 | Syntax aller Activity-V2-JS-Dateien | alle grün; Anzahl dokumentiert |
| T-ACT-R6-04 | Draft-v3-Form/API/Atomizität | Keys, elf Methoden, Deep Freeze, No-op, Revision, Fehlerpräzedenz, Rebuilds |
| T-ACT-R6-05 | reale Non-Strength-Policies | alle elf Entries, vier Duration und sieben Duration-Distance, forbidden Guards |
| T-ACT-R6-06 | Parser/Notizgrenzen | Duration, Distance, Locale, Intermediate, 32/500 Codepoints und sichere Copy |
| T-ACT-R6-07 | abgeleitete Validität | Feld-, Non-Strength- und kombinierte Itemzustände ohne gespeicherten Status |
| T-ACT-R6-08 | R5-Strength-Regression | acht Policies, Setparser/-state, Itemnote-Trennung und History unverändert |
| T-ACT-R6-09 | Mixed/Rebuild | alle drei Modi, Note/Setwerte und Sessiontimer ohne Wertverlust/Umdeutung |
| T-ACT-R6-10 | Lifecycle/Race/Fokus | No-op, forged target, vollständiger Closeguard, Reorder, Lookup, Background, Destroy, Post-Mutation |
| T-ACT-R6-11 | statische Isolation | kein Product Load, Business-Netzwerk, Storage, SQL/RPC oder `commitSession` |
| T-ACT-R6-12 | gezielter Browser-Smoke | erster kompletter Editorfluss Desktop plus schmaler Mobilezustand |
| T-ACT-R6-13 | integrierte Harness-Matrix | alle Routen bei 1440x900, 390x844 und 320x800 plus mindestens 30s Background |
| T-ACT-R6-14 | nativer Full Code/Contract Review | keine offenen In-Scope-P0/P1 |
| T-ACT-R6-15 | CodeRabbit | Findings bewertet; berechtigte Codefixes revalidiert |
| T-ACT-R6-16 | Doku-/Markdownprüfung | Links, Status, QA-ID, Größenentscheidung und Archivziel konsistent |

<!-- markdownlint-enable MD013 -->

### S3-Contract-Review, Findings und Abnahme

- Draftmigration, Rebuilds und koordinierte Consumergrenze: `PASS` nach
  `F-ACT-R6-18`; Block A enthält jetzt auch produktiven Shellvalidator und
  T-ACT-R6-05.
- Policies, Parser, Ranges, Locale, Notiz und Validität: `PASS` nach
  `F-ACT-R6-19/-22`; keine falsche Leistung, Save- oder R8-Behauptung.
- Lifecycle, Close, History, Timer, Background, Destroy, No-op und
  Post-Mutationsfehler: `PASS` nach `F-ACT-R6-17/-21`.
- DOM, A11y, Textausgabe, Autofill-Defense und Security: `PASS`; keine rohe
  HTML-/Logkante und keine vertrauenswürdige DOM-only-Grenze.
- Isolation, Rollback, Invalidation und A->B->C-Schnitt: `PASS` nach
  `F-ACT-R6-20`; geschützte Pfade liegen außerhalb jedes S4-Blocks.
- Quellenwiderspruch, neue Produktentscheidung, Persistenz- oder
  Scope-Ausweitung: `none`. Die Closeguard-Korrektur ist eine technische
  Sicherung innerhalb des bereits vorgesehenen R6-Lifecycleumfangs.
- Offene Findings und offene In-Scope-P0/P1-Risiken: `none`.
- Produktcode-/Testinvalidierung: `none`; nur diese Roadmap wurde geändert. Die
  S1-Baseline `81/81`, Katalog `v2 / 80 / 47 / 58`, Syntax `10/10` und statische
  Isolation bleiben gültig.
- Visueller Harness: nicht geöffnet; S3 klärt ausschließlich statische
  Contract-, Risiko- und Umsetzungsfragen.
- Größenprüfung: der Richtwert bleibt bewusst überschritten. Risiko-, Rollback-
  und Invalidationkontext ist einmalig und für das Fresh-Chat-Gate ausführbar;
  eine Evidence-Datei bleibt mangels Remote-/Deploynachweis nicht erforderlich.
- S3-Abnahme: `PASS`.
- Stop: S4R wurde nicht begonnen. Genau nächstes erlaubtes Gate ist das
  `S4 Readiness Review` mit `Extra High`.

Exit: `PASS`; alle Risiken sind vertraglich geschlossen, einem exakten
S4-Substep samt Pflichtchecks zugeordnet oder ausdrücklich außerhalb R6
abgegrenzt. S4R besitzt einen deterministischen Prüfstand und wurde nicht
begonnen.

## S4 Readiness Review

Reasoning: `GPT-5.6 Sol / Extra High`.

Vor Freigabe erneut reale Dateien, S1-S3-Ergebnisse, Findings und Baseline
prüfen. Keine offene Grundsatzfrage darf in S4 verschoben werden.

<!-- markdownlint-disable MD013 -->

| Substep | Änderung | Primärdateien | Review | Mindestchecks | Gate |
| --- | --- | --- | --- | --- | --- |
| S4.1 | Draft v3 + Itemmutationen | `session-draft.js`, Drafttests, `session-shell.js`, Shelltests, `semantics-v2.contract.test.js`; Harness nur bei realem Consumerbruch | Consumer | T-ACT-R6-01 bis -05, -08, -09, -11 | none |
| S4.2 | Duration-/Distance-/Notiz-DOM und Eingabe | `session-shell.js`, Shelltests | Consumer; gemeinsamer Block B mit S4.3 | T-ACT-R6-01, -02, -03, -05, -06, -07, -08, -11 | none |
| S4.3 | Lifecycle, gemischte Sessions, Races | `session-shell.js`, Shelltests; Draft nur bei Finding mit Block-A-Revalidation | Consumer; gemeinsamer Block B mit S4.2 | T-ACT-R6-01, -03, -07 bis -12 | optional Touchfeedback, kein Pflichtgate |
| S4.4 | CSS, Fixtures und integrierter Browsernachweis | CSS, Harness, Shelltests; Shell/Draft nur bei Finding | Consumer | T-ACT-R6-01, -03 und -05 bis -13 | optional Touch-Abnahme |

<!-- markdownlint-enable MD013 -->

Readiness muss dokumentieren:

- bestätigte Reihenfolge und Rollbackgrenzen;
- exakte Diff- und geschützte Dateigrenze;
- gültig übernommene R5-/HCR-Nachweise;
- Invalidation Map je Substep;
- offene Findings und deren Ziel;
- Evidence-Entscheidung `nicht erforderlich`;
- Scope-Freeze `PASS` oder Blocker;
- sichere S4-Ausführungsblöcke.

Vorgesehene Batch-Empfehlung, in S4R real zu bestätigen:

- Block A: S4.1 separat wegen Draftschema und breiter Consumergrenze.
- Block B: S4.2 + S4.3 gemeinsam, sofern S4.1 grün ist und kein neuer
  Lifecyclevertrag entsteht.
- Block C: S4.4 separat als responsive und integrierte Browsergrenze.

Browservertrag im Readiness Review:

- Während Block A nur automatisierte Tests.
- Nach Block B genau ein gezielter Interaktions-Smoke in einer wiederverwendeten
  Harness-Session.
- Nach Block C genau eine vollständige integrierte Harness-Matrix.
- S5 referenziert diese Matrix, solange der Diff unverändert bleibt.
- CodeRabbit-Fixes invalidieren nur betroffene Zustände. Eine zweite
  Vollmatrix ist nur bei breiter UI-/Lifecycleänderung erforderlich.
- Screenshots nur für visuelle Beweisfragen oder Findings; DOM-Maße, Console
  und kompakte Ergebniswerte für mechanische Checks bevorzugen.

### S4R-Ergebnis

#### Git-, Baseline- und reale Dateigrenze

- Geprüfter HEAD: `1c8c9f773bccf0674dd42a02856cbc465cb953e1`
  (`feat(activity-v2): add isolated strength set editor`).
- Worktree vor S4.1: ausschließlich diese aktive R6-Roadmap untracked; kein
  Runtime-, Test-, CSS-, Harness-, V1-, `index.html`- oder geschützter Diff.
- Reale S4-Kandidatendateien:
  - `session-draft.js` (`673` Zeilen);
  - `session-draft.contract.test.js` (`821`);
  - `session-shell.js` (`2443`);
  - `session-shell.contract.test.js` (`2252`);
  - `semantics-v2.contract.test.js` (`368`);
  - `session-shell.css` (`795`);
  - `session-shell-harness.html` (`319`).
- Geschützt in jedem S4-Block:
  - `app/modules/vitals-stack/activity/index.js`, Activity V1 und `index.html`;
  - `semantics.js`, `semantics-v2.js`, `data-access.js` samt ihren unveränderten
    Produktverträgen, `semantics.contract.test.js`,
    `data-access.contract.test.js` sowie `semantics-harness.html`;
  - SQL/RPC/RLS/Grants/Supabase, `commitSession`, Storage/IndexedDB, Service
    Worker, Produktnavigation und GitHub Workflows;
  - Masterplan, Module Overview und QA-Suite bis zum vorgesehenen S6-Sync.
- `semantics-v2.contract.test.js` darf in Block A nur seine direkte Draft-/Shell-
  Consumerassertion auf v3 aktualisieren; Kataloginhalt, Suche und
  `semantics-v2.js` bleiben unverändert.
- S1-Nachweise `81/81`, Katalog `v2 / 80 / 47 / 58`, Syntax `10/10` und
  statische Isolation sind für den Start von Block A gültig übernommen. S2,
  S3 und S4R waren reine Roadmapänderungen; eine redundante Wiederholung vor
  dem ersten Codechange ist nicht erforderlich.
- Das erste Runtime-/Testdelta in Block A invalidiert die übernommene
  Testbaseline sofort und erzwingt die blockgenauen frischen Checks.

#### Sichere S4-Blöcke und Rollback

<!-- markdownlint-disable MD013 -->

| Block | Umfang | Exakte Primärdateien | Pflichtchecks am Blockende | Rollback |
| --- | --- | --- | --- | --- |
| A / S4.1 | Draft v3, Itemmutation, Schema/API/Snapshotconsumer | `session-draft.js`, Drafttest, `session-shell.js`, Shelltest, `semantics-v2.contract.test.js` | T-ACT-R6-01 bis -05, -08, -09, -11 | alle blockeigenen A-Hunks gemeinsam; kein v2/v3-Mischstand |
| B / S4.2+S4.3 | Editor, Parser, Aggregate, Input-/Lifecycle-/Racepfade | `session-shell.js`, `session-shell.contract.test.js`; Draft nur bei Finding mit A-Revalidation | Union T-ACT-R6-01 bis -03 und -05 bis -12 | B-Hunks gemeinsam auf grünen A-Stand; Ergebnisse S4.2/S4.3 getrennt dokumentieren |
| C / S4.4 | Responsive CSS, Fixtures, finaler Harness | `session-shell.css`, `session-shell-harness.html`, `session-shell.contract.test.js`; Runtime nur bei Finding | T-ACT-R6-01, -03 und -05 bis -13 | C-Hunks gemeinsam auf grünen B-Stand |

<!-- markdownlint-enable MD013 -->

- Abhängigkeit strikt `A -> B -> C`. Nach Beginn von B darf A nur nach
  Rücknahme von C und B oder als gesamter R6-Code-Diff zurückgerollt werden;
  analog muss C vor einem B-Rollback zurückgenommen werden.
- Weil `session-shell.js` A/B und `session-shell.contract.test.js` A/B/C
  überlappen, bedeutet Rollback blockbezogene Diff-Hunks, niemals blindes
  Whole-File-Restore. Es wird kein Commit pro Block vorausgesetzt oder erzeugt.
- Block A endet vor jeder sichtbaren UI-Arbeit und benötigt keinen Browser.
- Block B bildet eine gemeinsame Code-/Rollbackgrenze, behält aber getrennte
  S4.2-/S4.3-Ergebnisabschnitte und Consumer Reviews.
- Block C darf erst gegen den finalen Block-B-DOM beginnen; eine Runtimeänderung
  dort benötigt ein reales Finding und die entsprechende S3-Invalidation.

#### Übernommene und zu invalidierende R5-/HCR-Nachweise

<!-- markdownlint-disable MD013 -->

| Nachweis | Stand vor S4 | Erste Invalidation | R6-Reproof |
| --- | --- | --- | --- |
| HCR-017 R1-Semantik | gültig; R1-Runtime/Test unverändert | nur unerlaubtes R1-Delta | T-ACT-R6-01/-02/-11 als Negativoracle |
| HCR-018 Semantikbrowser | gültig; Semantikharness unverändert | nur unerlaubtes Semantik-/Harnessdelta | keine Wiederholung ohne Invalidation |
| HCR-019 Data Access | gültig; Data Access/R2 unverändert | nur unerlaubtes Data-Access-/Commitdelta | T-ACT-R6-01/-11; kein realer Commitaufruf |
| HCR-020 R3 Draft/Shell | gültige Startbaseline | Block A durch v3/Shellvalidator | T-ACT-R6-01/-04/-09/-10/-11 |
| HCR-021 C2 Katalog v2 | Runtimeoracle gültig; direkter Testconsumer wird A-Teil | Block A nur für Consumerassertion | T-ACT-R6-01/-02/-05 |
| HCR-022 R4 Suche/History | gültige Startbaseline | A/B durch Draft/Shell/Lifecycle | T-ACT-R6-01/-08/-10/-12/-13 |
| HCR-023 R5 Strength-Editor | gültige Startbaseline `81/81` plus Harness | A/B/C nach jeweiligem Delta | T-ACT-R6-01 und -05 bis -13, besonders -08 |

<!-- markdownlint-enable MD013 -->

- R5-Setform, acht Strength-Policies, Parsercopy, Präfix-/Lückenregel,
  read-only History, Fokus, Timer und Backgroundwerte sind Regressionoracles,
  keine unverändert weiterbehaupteten R6-Endnachweise.
- Eine neue kanonische R6-HCR-ID wird erst in S6 nach finalem S5-Nachweis
  ergänzt. S4R erzeugt keine vorzeitige QA-Erfolgsbehauptung.

#### Browser-, Evidence- und Gateentscheidung

- Block A: nur automatisierte Contract-, Katalog-, Syntax- und statische
  Checks; kein Harnessstart.
- Nach vollständig grünem Block B: genau ein gezielter Editor-Smoke in einer
  wiederverwendeten Browser-/Server-Session, Desktop plus schmaler Mobilezustand.
- Nach Block C: genau eine integrierte Matrix über `empty`, `policies`,
  `history`, `all`, alle drei Viewports und mindestens 30 Sekunden Background.
- S5 übernimmt diese Browsernachweise ohne Wiederholung, solange kein
  betreffender Code-/CSS-/Harnessdiff entsteht. Reviewfixes wiederholen nur
  invalidierte Zustände; breite Lifecycle-/DOM-Änderung invalidiert die Matrix.
- Separate Evidence-Datei: weiterhin `nicht erforderlich`; alle Belege sind
  lokale Contract-, Static- und Harnessnachweise ohne Deploy, SQL oder Remote-
  Write. Die Roadmap bleibt Evidence-Owner.
- Owner-Gate: keines. Touchfeedback in S4.3/S4.4 bleibt optional und blockiert
  eine objektiv grüne technische Abnahme nicht.

#### S4R-Findings, Full Contract Review und Scope-Freeze

- `F-ACT-R6-23 fixed`: blockabhängiger Hunk-Rollback statt Whole-File-Restore.
- `F-ACT-R6-24 fixed`: S4.3 primär nur Shellcode/-tests; Draftänderung nur nach
  Finding und vollständiger Block-A-Revalidation.
- `F-ACT-R6-25 fixed`: Block C besitzt die exakte Checkmenge
  T-ACT-R6-01, -03 und -05 bis -13.
- Reihenfolge, Dateien, Checks, HCR-Invalidation, Browserkadenz und Rollback:
  `PASS`.
- S1-S3, Decision Log, Findings, reale Consumer und geschützte Grenzen
  beschreiben nach den Korrekturen denselben ausführbaren Vertrag: `PASS`.
- Offene Findings, offene In-Scope-P0/P1-Risiken, Owner-Freigaben oder neue
  Grundsatzfragen: `none`.
- Produktcode-/Testinvalidierung in S4R: `none`; der gültige S1-Nachweis bleibt
  Startoracle für Block A.
- Größenprüfung: der Roadmap-Richtwert bleibt bewusst überschritten. Der neue
  Readinessblock enthält einmalige Datei-, Evidence-, Rollback- und Gategrenzen;
  eine Auslagerung würde den Fresh-Chat-Ausführungsvertrag schwächen.
- Scope-Freeze: `PASS`.
- S4R-Abnahme: `PASS`.
- Stop: S4.1 wurde nicht begonnen. Genau nächstes erlaubtes Gate ist Block A,
  `S4.1 - Draft v3 und Item-Mutationsvertrag` mit `Extra High`.

Exit: `PASS`; S4 kann ohne neue Grundsatzentscheidung in der bestätigten
Reihenfolge beginnen. Batches, Checks, Rollback und Browserphasen sind gegen den
realen Stand eingefroren; S4.1 wurde noch nicht begonnen.

## S4 - Umsetzung

S4 ist ausschließlich Implementierung mit substepnahen Consumer-Reviews und
invalidierten Checks. Nativer Gesamtreview und CodeRabbit gehören nach S5.

### S4.1 - Draft v3 und Item-Mutationsvertrag

Reasoning: `GPT-5.6 Sol / Extra High`.

- Vertrag:
  - D-ACT-R6-03 bis D-ACT-R6-07, D-ACT-R6-10, D-ACT-R6-14,
    D-ACT-R6-19 und D-ACT-R6-20.
- Dateien:
  - `session-draft.js`
  - `session-draft.contract.test.js`
  - `session-shell.js` für Schema-ID, API- und Snapshotvalidator
  - `session-shell.contract.test.js` für alle Draftfassaden
  - `semantics-v2.contract.test.js` als direkter Realconsumer
  - Harness nur bei einem durch Contracttest belegten Consumerbruch
- Umsetzung:
  - Draft v3 mit vollständigen Itemrecords;
  - policy-gesteuerte Itemmutation;
  - exakte Deep-Freeze-, No-op-, Revisions- und Fehlergrenzen;
  - vollständige Recorderhaltung in allen Rebuilds;
  - R5-Setvertrag unverändert übernehmen.
- Review:
  - Consumer.
- Invalidation:
  - T-ACT-R6-01 bis -05, -08, -09 und -11.
- Gate:
  - none; bei Abweichung vom erwarteten API-Vertrag S2/S3/S4R korrigieren.

#### Ergebnis S4.1

- Änderung/Fakten: Draft und Shell verwenden atomar
  `midas.activity-session-draft.v3`; jedes Item besitzt exakt die sechs
  vereinbarten Keys. `setItemField` ist die elfte und letzte Controllermethode;
  der vollständige Item-Rebuilder erhält Itemrohwerte und R5-Sets über Move,
  Sessionnote sowie Set-Add/-Remove/-Mutation.
- Prüfung/Fakten: T-ACT-R6-01 bis -05, -08, -09 und -11 sind grün:
  `83/83` Activity-V2-Contracttests, Katalog `v2 / 80 / 47 / 58`, Syntax
  `10/10` und statische Isolation `PASS`. Alle elf realen Non-Strength-Entries
  mit vier `duration`- und sieben `duration_distance`-Policies sind belegt.
- Consumer Review/Fakten: Schema-ID, API, geordnete Itemform, Raw-/Längengrenzen
  und Forbidden-Policies werden im Shellvalidator fail-closed geprüft; alle
  sieben vollständigen Draftfassaden und der Semantics-v2-Realconsumer stehen
  auf v3. Der zehnmethodige v2-Legacyfall bleibt absichtlich negativ.
- Finding/Korrektur: `F-ACT-R6-26 fixed`; ausschließlich ein falsches
  Testoracle wurde auf die reale Katalogpolicy korrigiert. Offene Findings,
  Vertragsabweichungen oder Produktcodekorrekturen nach dem Review: `none`.
- Ableitung/Restrisiko: Parser, sichtbarer Editor, abgeleitete Itemvalidität
  und Input-/Close-/Race-Lifecycle sind bewusst Block B und wurden nicht
  vorgezogen. Kein S4.1-Restrisiko blockiert S4.2; kein visueller Harnesslauf
  war erforderlich.
- Doku-Sync: `S6`.
- Status: `PASS`; kontrollierter Stop vor S4.2.

Exit: `PASS`; Draft v3 und alle direkten Consumer sind grün. Kein visueller
Harness wurde geöffnet. Nächstes erlaubtes Gate war der gemeinsame Block B aus
S4.2 und S4.3 mit `High`; weitere Schritte blieben zu diesem Zeitpunkt ungeöffnet.

### S4.2 - Policy-gesteuerter Duration-/Distance-Editor

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - D-ACT-R6-02, D-ACT-R6-05 bis D-ACT-R6-13 und D-ACT-R6-20 bis
    D-ACT-R6-24.
- Dateien:
  - `session-shell.js`
  - `session-shell.contract.test.js`
  - bei Bedarf `semantics-v2.contract.test.js`
- Umsetzung:
  - Duration-, Distance- und Itemnotizcontrols ausschließlich aus Policy;
  - Draft-first Eingabe und R5-kompatibler Parser;
  - kombinierter Item-Row-State bei unverändertem R5-Strength-Editorstate;
  - sichere Copy, A11y-, Mobile- und Autofillattribute;
  - Strength-Editor und read-only History unverändert erhalten.
- Review:
  - Consumer.
- Invalidation:
  - T-ACT-R6-01 bis -08 und -11.
- Gate:
  - none.

#### Ergebnis S4.2

- Änderung/Fakten: Die Shell rendert aus der realen Katalogpolicy für alle elf
  Non-Strength-Entries exakt Pflichtdauer, optionale Distanz und Itemnotiz. Der
  gemeinsame private Zahlenparser erhält Rohwerte und liefert nur sichere
  Zustands-/Fehlercopy; der R5-Strength-Editorstate bleibt separat.
- Prüfung/Fakten: Vier `duration`- und sieben `duration_distance`-Entries,
  Felddefinitionen, Parsermatrizen, 32-/500-Codepointgrenzen, A11y-/Autofill-
  Attribute, Forbidden-Guards, Itemaggregate und R5-Regression sind in der
  finalen Block-B-Matrix `85/85` grün.
- Finding/Korrektur: Alte R5-Testoracles für neutrale Non-Strength-Editoren und
  breite Textarea-Selektoren wurden auf den eingefrorenen R6-Vertrag korrigiert;
  kein Produktvertragsfinding und kein offenes Finding.
- Ableitung/Restrisiko: Visuelle Größen und Fixturebündelung gehörten weiterhin
  ausschließlich zu S4.4; keine Persistenz- oder Save-Aussage.
- Doku-Sync: `S6`.
- Status: `PASS`.

Exit: Beide Non-Strength-Policies rendern und mutieren deterministisch; noch
kein separater vollständiger Browserlauf.

### S4.3 - Validität, gemischte Sessions und Lifecycle

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - D-ACT-R6-09 bis D-ACT-R6-15 und D-ACT-R6-22 bis D-ACT-R6-25.
- Dateien:
  - `session-shell.js`
  - `session-shell.contract.test.js`
  - `session-draft.js` und Drafttests nur bei realem Finding; dann Block A
    vollständig revalidieren
- Umsetzung:
  - Itemaggregate und sichere Fehlercopy;
  - Strength-/Duration-/Distance-Kombinationen in einer Session;
  - Fokus, Reorder, Remove-/Re-Add, Lookupcache und Timererhalt;
  - Close-/Discard-, forged-target-, stale-settlement- und
    Post-Mutationsguards;
  - alle draftmutierenden Controls im pending Closeguard und DOM-freier No-op;
  - gezielter Interaktions-Smoke nach vollständigem Block B.
- Review:
  - Consumer über S4.2 + S4.3.
- Invalidation:
  - T-ACT-R6-01, -03 und -07 bis -12.
- Gate:
  - optional Owner-Touchfeedback; kein Pflichtgate bei objektiv grünem Smoke.

#### Ergebnis S4.3

- Änderung/Fakten: Item-Row-Aggregate, Draft-first Mutation, DOM-freier No-op,
  sichere Fehlerwiederherstellung und vollständige pending-Close-Sperre gelten
  gemeinsam für Search/Add, Sessionnotiz, Itemaktionen, R5-Sets und R6-Inputs.
- Prüfung/Fakten: Mixed Strength-/Duration-/Distance-Sessions, Reorder,
  Remove/Re-Add, read-only History ohne Prefill, getrennte Sessionuhr,
  forged/stale Targets, Post-Mutationsbruch, Fokus, Background und Destroy sind
  contractgrün. Der wiederverwendete Browserfluss bestätigte Rohwerte,
  Itemzustände und Fokus auf Desktop und schmalem Mobile.
- Finding/Korrektur: Kein Draftfinding; `session-draft.js` blieb in Block B
  unverändert. Der native Close-Confirm wurde erwartungsgemäß erreicht und nach
  manueller Auflösung ohne stale Mutation verlassen.
- Ableitung/Restrisiko: Optionales Owner-Touchfeedback war kein Pflichtgate;
  responsive Politur und Vollmatrix blieben bis S4.4 offen.
- Doku-Sync: `S6`.
- Status: `PASS`.

Exit: Block B ist contractgrün und ein gezielter Desktop-/Mobile-
Interaktionsfluss ist bewiesen.

### S4.4 - Responsive Politur und gebündeltes Harness

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - D-ACT-R6-16 bis D-ACT-R6-18.
- Dateien:
  - `session-shell.css`
  - `session-shell-harness.html`
  - `session-shell.contract.test.js`
  - nur bei realem Finding Shell/Draft
- Umsetzung:
  - kontrollierte Fixtures für `duration`, `duration_distance`, Strength und
    gemischte Sessions;
  - stabile Layouts bei 1440x900, 390x844 und 320x800;
  - keine Überlappung, kein horizontaler Overflow, keine abgeschnittene Copy;
  - Touchziele mindestens 44 Pixel bei 320px;
  - ein realer Fremdtab-Smoke von mindestens 30 Sekunden mit erhaltenen
    Itemwerten, Notiz, Fokus, Status und fortlaufender Sessionuhr;
  - eine integrierte Harness-Session für alle Routen und Viewports.
- Review:
  - Consumer.
- Invalidation:
  - T-ACT-R6-01, -03 und -05 bis -13; weitere IDs nur bei realem Shell-/
    Draftfinding gemäß S3-Invalidation Map.
- Gate:
  - optional Owner-Touchabnahme.

#### Ergebnis S4.4

- Änderung/Fakten: Neue Itemfelder besitzen ein zweispaltiges Desktop- und
  einspaltiges Mobilelayout, 44px-Mindesthöhe, sichtbare Invalid-/Focuszustände,
  umbrechende Fehlercopy und eine volle Notizzeile. Der isolierte R6-Harness
  bündelt `empty`, `policies`, `history` und `all` mit acht Strength-
  Policykombinationen sowie realem `cross_trainer`/`running` für `duration` und
  `duration_distance`; Historywerte bleiben getrennt und read-only.
- Prüfung/Fakten: T-ACT-R6-01, -03 und -05 bis -13 sind grün: `85/85`, Syntax
  `10/10`, Katalog `v2 / 80 / 47 / 58`, statische Isolation `PASS`. Die
  integrierte Matrix prüfte `12/12` Fixture-/Viewport-Kombinationen bei
  konfigurierten `1440x900`, `390x844` und `320x800`: kein horizontaler
  Overflow, keine außerhalb liegenden Controls, keine abgeschnittene Copy und
  bei 320px mindestens `44x44` Touchfläche. Ein realer Fremdtablauf erhielt
  `7,`, Itemnotiz, Fokus, leeren Status und `partial`/`intermediate`; die Uhr
  lief in 41 Sekunden von `00:03` auf `00:44`. Relevante App-Console: leer.
- Finding/Korrektur: `F-ACT-R6-27 fixed`; lokale Harness-CSS-URL gegen warmen
  Assetcache versioniert und die komplette Matrix danach ohne Finding erneut
  ausgeführt. Offene In-Scope-Findings: `none`.
- Ableitung/Restrisiko: Optionales reales Android-Touchfeedback und der native
  Full Review/CodeRabbit bleiben planmäßig S5; kein S4-Restrisiko blockiert S5.
- Doku-Sync: `S6`.
- Status: `PASS`.

Exit: Finaler S4-Diff ist lokal, responsive und im isolierten Harness grün;
vollständige Matrix als wiederverwendbarer S5-Nachweis dokumentiert.

## S5 - Tests, Runtime-Gates und Abschlussreview

Reasoning: `GPT-5.6 Sol / Extra High`.

Deterministische Reihenfolge:

1. Finalen Diff und Invalidation seit S4.4 prüfen.
2. T-ACT-R6-01 bis T-ACT-R6-11 frisch beziehungsweise nachweisbar unverändert
   grün bestätigen.
3. T-ACT-R6-12/-13 aus S4 wiederverwenden, wenn seitdem keine betreffende
   Datei geändert wurde. Sonst nur invalidierte Browserzustände wiederholen.
4. Nativen Full Code und Contract Review über Draft, Shell, Tests, CSS,
   Harness, geschützte Consumer und Roadmap durchführen.
5. CodeRabbit einmal gegen denselben finalen Code-Diff ausführen.
6. Jedes Finding fachlich gegen Roadmap, Masterplan und reale Implementierung
   bewerten; nichts blind korrigieren.
7. Berechtigte Findings minimal korrigieren und nur invalidierte Tests sowie
   Browserzustände wiederholen.
8. CodeRabbit erneut ausführen, wenn eine berechtigte Korrektur Code im
   geprüften Diff verändert. Reine Dokumentationskorrekturen invalidieren den
   Lauf nicht.
9. Statische Negativnachweise bestätigen:
   - Activity V1 und `index.html` unverändert;
   - kein produktiver Scriptload;
   - kein Netzwerk, Storage, SQL/RPC oder `commitSession`;
   - keine Intensität oder neue Semantik;
   - R4-Historie weiterhin read-only.
10. Statusmatrix, Findings und Resume Card auf den realen S5-Stand setzen.

<!-- markdownlint-disable MD013 -->

| ID | Ebene | Check / Smoke | Status | Nachweis | Invalidiert durch |
| --- | --- | --- | --- | --- | --- |
| T-ACT-R6-01 | lokal | vollständige Activity-V2-Contracttests | PASS | `85/85`, `0` fail/skip/todo | Activity-V2-JS/Tests |
| T-ACT-R6-02 | lokal | Katalogcheck | PASS | `v2 / 80 / 47 / 58`, Runtime und SQL checked | Semantik/Katalog/Tool |
| T-ACT-R6-03 | lokal | Syntaxchecks | PASS | `10/10` Activity-V2-JS | JS-Diff |
| T-ACT-R6-04 | lokal | Draft-v3-Vertrag | PASS | Form, elf Methoden, Freeze, No-op, Revision, Rebuilds | Draft/Consumer |
| T-ACT-R6-05 | lokal | 11 Non-Strength-Entries | PASS | vier `duration`, sieben `duration_distance`, exakte Definitionsgrenzen | Semantik/Shell |
| T-ACT-R6-06 | lokal | Parser/Grenzen/Notiz | PASS | Locale, Intermediate, Range, 32/500 Codepoints | Draft/Shell |
| T-ACT-R6-07 | lokal | abgeleitete Validität | PASS | `empty/partial/complete/invalid`, getrennte Statecarrier | Validator/Copy |
| T-ACT-R6-08 | lokal | R5-Strength-Regression | PASS | acht Policies, Sets, Itemnote und History unverändert | Draft/Shell |
| T-ACT-R6-09 | lokal | Mixed/Rebuild | PASS | drei Modi, vollständige Records, Timertrennung | Draft/Shell |
| T-ACT-R6-10 | lokal | Lifecycle/Races/Fokus | PASS | Closeguard, No-op, forged/post-mutation, Lookup, Background, Destroy | Shell/Draft |
| T-ACT-R6-11 | static | Produktisolation | PASS | keine geschützten Pfade, Writes, Storage-, Netzwerk- oder Commitkante | Script-/Netzwerk-/Storage-Diff |
| T-ACT-R6-12 | Browser | gezielter Editor-Smoke | PASS | S4-Nachweis wiederverwendet; keine gültige Renderkante invalidiert | Editor/Lifecycle/CSS |
| T-ACT-R6-13 | Browser | integrierte Matrix + Background | PASS | S4 `12/12`, drei Viewports, vier Routen, Background `41s` wiederverwendet | Shell/CSS/Harness/Lifecycle |
| T-ACT-R6-14 | Review | nativer Full Review | PASS | F-ACT-R6-28 fixed; keine offenen In-Scope-P0/P1 | finaler Diff |
| T-ACT-R6-15 | extern | CodeRabbit | PASS | CLI `0.7.2`; sieben Codedateien geprüft; `0 issues` | Codekorrektur |
| T-ACT-R6-16 | Doku | Links/Markdown/Status | PASS | aktive Roadmap und S5-Handoff konsistent | Doku-Diff |

<!-- markdownlint-enable MD013 -->

Harness-Effizienzregeln:

- Kein erneutes Öffnen pro Fixture oder Viewport.
- Eine laufende lokale Server- und Browser-Session innerhalb des Prüfblocks
  wiederverwenden.
- Status, Feldwerte, Fokus, Timer, Overflow, Touchmaße und Console möglichst
  programmatisch beziehungsweise kompakt erfassen.
- Screenshots nur für tatsächlich visuelle Abnahme oder Findingbeleg.
- Bereits grünen vollständigen Lauf nicht ohne Invalidation wiederholen.

Ergebnis:

- Grüne Nachweise: T-ACT-R6-01 bis -11, -14, -15 und -16 frisch `PASS`;
  `85/85`, Katalog `v2 / 80 / 47 / 58`, Syntax `10/10`, Isolation `PASS`.
- Wiederverwendete, nicht invalidierte Nachweise: T-ACT-R6-12/-13 aus S4;
  `12/12` Fixture-/Viewportmatrix und `41s` Background. F-ACT-R6-28 ändert nur
  die Ablehnung abweichender injizierter Felddefinitionen; der gültige reale
  Katalog, DOM, CSS, Harness und Lifecyclepfad blieben identisch.
- Nicht ausgeführte Smokes mit Grund: keine redundante zweite Browsermatrix,
  weil seit S4.4 keine gültige Render-, CSS-, Harness- oder Lifecyclekante
  invalidiert wurde.
- Nativer Review: `F-ACT-R6-28 fixed`; alternative positive Itemgrenzen werden
  jetzt fail-closed abgelehnt. Nach Korrektur vollständige lokale Revalidation
  grün; keine weiteren offenen In-Scope-P0/P1-Findings.
- Externer Review und Findingsbewertung: CodeRabbit `0.7.2` prüfte einmal den
  korrigierten uncommitted Finaldiff aus sieben Codedateien und meldete
  `0 issues`; kein zweiter Lauf erforderlich.
- Statische Negativnachweise: Activity V1, `index.html`, Data Access,
  Semantikruntime, SQL/RPC, Produktload, Netzwerk, Storage, `commitSession`,
  Intensität und R4-read-only-Vertrag unverändert.
- Offene Findings: `none`.
- Commit-Entscheidung: `S6 offen`; keine Commit-Ausführung in S5.

Exit: Relevante Checks sind grün, CodeRabbit-Findings bewertet und keine
offenen In-Scope-P0/P1-Findings vorhanden.

## S6 - Doku-Sync und Abschluss

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. `docs/modules/Activity Module Overview.md` auf den bewiesenen R6-Iststand
   synchronisieren.
2. `docs/Future trainingsmodule update thoughts.md` aktualisieren:
   - R6 auf DONE;
   - Draft-v3-/Duration-/Distance-/Itemnotizvertrag;
   - O-6 mit `keine Intensität` schließen;
   - R7 als nächsten Rolling-Wave-Schritt;
   - keine unbelegten R8-/Produktbehauptungen.
3. Neue kanonische HCR-ID in `docs/qa/health-capture-reports.md` ergänzen.
   `docs/QA_CHECKS.md` bleibt als Kompatibilitätsindex unverändert, sofern kein
   Linkvertrag betroffen ist.
4. Optionalen Owner Recap in Alltagssprache schreiben:
   - was R6 erfasst;
   - warum Sessionuhr und Itemdauer getrennt sind;
   - warum Intensität fehlt;
   - was R7 und R8 später ergänzen.
5. Finalen Full Contract Review über Roadmap, Masterplan, Module Overview,
   QA-Suite und realen Code durchführen.
6. Findings korrigieren; In-Scope-P0/P1 müssen geschlossen sein.
7. Changelog-Relevanz entscheiden:
   - erwartete Entscheidung `nicht bemerkenswert`, solange R6 isoliert und
     produktiv unsichtbar bleibt;
   - bei realer sichtbarer oder operativer Wirkung unter `Unreleased`
     dokumentieren.
8. Resume Card und Statusmatrix auf Abschluss setzen.
9. Commit-Empfehlung aus dem realen Diff ableiten.
10. Roadmap mit `(DONE)` nach dem definierten Archivziel verschieben.

Ergebnis:

- Source-of-Truth-Sync:
  - `docs/modules/Activity Module Overview.md`: Draft v3, elf Methoden, sechs
    Itemkeys, elf reale Non-Strength-Policies, Editor-, Lifecycle-, Browser- und
    Isolationsvertrag ergänzt;
  - `docs/Future trainingsmodule update thoughts.md`: R6 auf DONE, O-6 mit
    `keine Intensität` geschlossen und R7 als nächste Rolling Wave markiert;
  - `docs/qa/health-capture-reports.md`: HCR-024 als nächste freie kanonische
    HCR-ID verifiziert und R6-Regressionsvertrag ergänzt;
  - `docs/QA_CHECKS.md` blieb als bereits korrekt verlinkender
    Kompatibilitätsindex unverändert.
- Finaler Review:
  - `PASS`; Roadmap, Masterplan, Module Overview, HCR-024 und realer Code bilden
    denselben Draft-v3-, Policy-, Parser-, Lifecycle- und Isolationsvertrag ab;
  - keine S6-Codeänderung, deshalb bleiben die S5-Nachweise `85/85`, Katalog
    `v2 / 80 / 47 / 58`, Syntax `10/10`, Isolation `PASS`, Browsermatrix
    `12/12`, Background `41s` und CodeRabbit `0 issues` gültig;
  - finaler Doku-Check: 43 lokale Links über vier Abschlussdokumente, Status-
    und Contractassertions, erlaubter Diffscope sowie Whitespace `PASS`;
  - keine offenen In-Scope-P0/P1-Findings.
- Fakten:
  - S6 änderte ausschließlich Dokumentation; Activity V1, `index.html`,
    Activity-V2-Code, SQL/RPC/RLS/Grants, Supabase, `commitSession`, Netzwerk,
    Storage/IndexedDB und produktiver Scriptload blieben unverändert;
  - HCR-024 war nach HCR-023 die nächste freie ID; HCR-008 und HCR-011 bleiben
    historisch reserviert;
  - historische Werte bleiben read-only, Sessionuhr und Itemdauer getrennt und
    R5-Strength-Sätze einschließlich `duration_sec`/`distance_m` unverändert.
- Ableitungen:
  - weil S6 keinen Code änderte, wurde kein S5-Code- oder Browsergate
    invalidiert;
  - weil R6 ohne produktiven Consumer, Save oder Deploy bleibt, entsteht keine
    Changelog-relevante Nutzungs- oder Betriebsänderung.
- Restrisiken:
  - Reload-/Android-Prozessverlust bis zum isolierten R7-Recoveryvertrag;
  - kein produktiver Save/Commit bis zu einem späteren R8-Vertrag;
  - kein produktiver Activity-V2-Consumer oder Cutover in R6.
- Changelog-Entscheidung:
  - `nicht bemerkenswert`; R6 bleibt ausschließlich in lokaler isolierter
    Runtime und Harness erreichbar und ändert weder sichtbares Produktverhalten
    noch Betrieb, Deploy, Datenbank oder produktive Schreibwirkung.
- Owner-Recap:
  1. R6 erfasst in der isolierten Activity-V2-Shell Dauer, bei passenden
     Aktivitäten optional Distanz und für jedes Item optional eine Notiz.
  2. Die Sessionuhr misst die gesamte Einheit; die manuelle Itemdauer beschreibt
     nur das jeweilige Item. Deshalb werden beide Werte nicht voneinander
     abgeleitet.
  3. Intensität fehlt bewusst: R2 besitzt dafür keinen Speichervertrag, und die
     erste Activity-V2-Ausbaustufe soll keine RPE- oder Skalenlogik erfinden.
  4. R7 darf als eigene Roadmap lokale Draft-Recovery ergänzen; R8 entscheidet
     erst später die echte Commit- und Historienintegration.
- Commit-Empfehlung:

```text
feat(activity-v2): add isolated duration and distance editor
```

- Archivpfad:
  - `docs/archive/MIDAS Activity V2 R6 Duration and Distance Editor Roadmap (DONE).md`.

Exit:

- R6 ist vollständig bewiesen und dokumentiert;
- keine offenen In-Scope-P0/P1-Findings;
- Activity V2 bleibt produktiv isoliert;
- R7 darf als eigene Roadmap für IndexedDB Draft Recovery vorbereitet werden;
- Roadmap ist als `(DONE)` archiviert.
