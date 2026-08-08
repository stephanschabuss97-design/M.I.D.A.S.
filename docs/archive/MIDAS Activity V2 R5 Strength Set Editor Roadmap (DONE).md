# MIDAS Activity V2 R5 Strength Set Editor Roadmap (DONE)

Diese Roadmap erweitert die weiterhin isolierte Activity-V2-Session-Shell um
die Erfassung tatsächlich ausgeführter Strength-Sätze. Sie baut ausschließlich
auf den bewiesenen R1-R4-/C2-Verträgen auf. Activity V1, Produktnavigation,
Supabase und der R2-Commitpfad bleiben unverändert.

---

## Roadmap-Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Status | `DONE` |
| Modul / Bereich | `Activity V2 / Strength Set Editor` |
| Owner / Kontext | `Stephan; private Single-User-PWA für die eigene Trainingsdokumentation` |
| Chat-Lebenszyklus | `Denkraum -> eigener Ausführungs-Chat` |
| Erstellt am | `2026-08-08` |
| Letzter Stand | `2026-08-08; S6 PASS; Sources of Truth synchron, HCR-023 ergänzt, Full Contract Review grün und Roadmap archiviert` |
| Aktueller Schritt | `R5 abgeschlossen; nächstes erlaubtes Gate ist eine eigene R6-Roadmap` |
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
| Gekoppelte Roadmaps | `R1/C2 liefern Semantik und Katalog; R2 liefert späteren Commitvertrag; R3 liefert Draft/Shell; R4 liefert Suche/Historie; R6 folgt auf R5` |
| Evidence-Owner | `diese Roadmap` |
| Archivziel | `docs/archive/MIDAS Activity V2 R5 Strength Set Editor Roadmap (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Ausführungs-Chat-Startkarte

Diese Karte ist der verbindliche Einstieg für einen frischen Ausführungs-Chat.
Sie ersetzt keine Source of Truth und erlaubt keine erfundenen
Produktentscheidungen.

- Auftrag:
  - `R5 deterministisch bis zum jeweils freigegebenen Gate abarbeiten.`
- Modell und Reasoning:
  - `GPT-5.6 Sol / High`; `S2`, `S4R`, `S4.1` und `S5` auf `Extra High`.
- Kontextübergabe aus dem Denkraum:
  - `PASS`: R1, R2, R3, C2 und R4 sind DONE. Activity V1 bleibt produktiv
    sichtbar; Activity V2 ist weiterhin isoliert.
  - `PASS`: R5 erfasst tatsächliche Strength-Sätze. Drei leere Satzzeilen sind
    Standard, aber keine behauptete Leistung.
  - `PASS`: Satzstatus wird aus Feldpolicy und Eingaben abgeleitet. Es gibt
    keine Checkbox, keinen Satzzeitpunkt und keine Sonderrolle für Satz drei.
  - `PASS`: Verlauf ist nur Gedächtnisstütze und befüllt aktuelle Werte nie vor.
  - `PASS`: Pausentimer, 1RM-Feld, RPE, Warm-up-, Drop-/Superset-, Progressions-
    und Trainingsplanlogik sind nicht Teil von R5.
  - `PASS`: Baseline bei Erstellung: `65/65` Activity-V2-Contracttests und
    Katalogcheck `v2 / 80 / 47 / 58` grün.
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
  10. archivierte R2-, R3- und R4-Roadmaps nur für den jeweils betroffenen
      Vertrag
  11. reale R1-R4-/C2-Runtime, Tests und `sql/20_Activity_V2.sql`, soweit zur
      Verifikation des unveränderten Commitvertrags nötig
  12. `git status --short` und nur der relevante Diff
- Startschritt:
  - `S1 - System- und Vertragsdetektivarbeit`.
- Erlaubte Autonomie:
  - lokale Reads, eng begrenzte JS-/CSS-/Harness-/Teständerungen und lokale
    Tests gemäß Tool Permissions;
  - isolierte Browser-Smokes mit dem bestehenden Harness;
  - CodeRabbit in S5 gemäß `docs/DEV_ENVIRONMENT.md`.
- Owner-Gates:
  - kein SQL-, Deploy- oder produktives Runtime-Gate;
  - Owner nur bei neuer Produktentscheidung, Scope-Ausweitung oder optionaler
    subjektiver Touch-Abnahme.
- Stop-Bedingungen:
  - Änderung von SQL, RPC, RLS, Grants, `commitSession`, Activity V1,
    `index.html`, produktiver Navigation, Storage oder IndexedDB;
  - Vorbefüllung aktueller Sätze aus der R4-Historie;
  - Einführung von Trainingssteuerung, 1RM, RPE oder Planlogik;
  - widersprüchlicher Draft-/Feldpolicyvertrag oder nicht zuordenbares
    CodeRabbit-Finding.
- Halluzinationsschutz:
  - Keys, Feldpolicies, Grenzen und Historienwerte ausschließlich aus realen
    Sources of Truth ableiten.
  - Keine medizinischen Empfehlungen oder freien Übungskeys ergänzen.
  - Technische Details erst nach S1 gegen den realen Code einfrieren; fehlende
    Fakten als Finding führen.
- Größenvertrag:
  - Etwa `1.200` Zeilen sind eine Orientierungsmarke, kein hartes Limit.
  - Nur kürzen oder auslagern, wenn Entscheidungen, Gates, Findings,
    Invalidation Map und Fresh-Chat-Kontext vollständig erhalten bleiben.
- Startprompt:

```text
Ich möchte mit der
`docs/MIDAS Activity V2 R5 Strength Set Editor Roadmap.md` beginnen.

Arbeite zunächst ausschließlich S1 - System- und Vertragsdetektivarbeit
deterministisch ab. Verwende `GPT-5.6 Sol / High` und halte dich an die
Ausführungs-Chat-Startkarte, den Workflowvertrag und die Stop-Bedingungen der
Roadmap.

Lies vor jeder Änderung in dieser Reihenfolge:

1. Roadmap-Metadaten, Ausführungs-Chat-Startkarte und Session Resume Card
2. `README.md`
3. `docs/DEV_ENVIRONMENT.md`
4. `docs/templates/README.md`
5. `docs/templates/MIDAS Roadmap Workflow Contract.md`
6. `docs/Future trainingsmodule update thoughts.md`
7. `docs/modules/Activity Module Overview.md`
8. `docs/MIDAS Activity V2 R1 Catalog Baseline Contract.md`
9. `docs/MIDAS Activity V2 C2 Catalog Version 2 Contract.md`
10. die in R5 als Pflichtreferenzen genannten archivierten R2-, R3- und
    R4-Roadmaps
11. die reale Activity-V2-Runtime, Contracttests und nur bei konkretem Bedarf
    `sql/20_Activity_V2.sql`
12. `git status --short` und nur den relevanten Diff

Prüfe in S1 insbesondere:

- den exakten R3-Draft-, Snapshot-, API-, Revisions- und Discardvertrag;
- alle R3-/R4-Consumer und Testdoubles dieser exakten Grenze;
- die vollständige R1-Strength-Feldpolicymatrix samt Min/Max,
  Integer-/Dezimalregeln und Catalog-v2-Beispielen;
- die R4-Suche, read-only Historie, Cache-, Fokus-, Close- und Raceguards;
- die unveränderte numerische R2-Set-/Commitgrenze;
- CSS, Harness, Browser-Testbarkeit und weiterhin fehlende Produktverdrahtung.

Führe die frische Baseline aus: alle Activity-V2-Contracttests, den
Katalogcheck und relevante Syntaxchecks. Dokumentiere Fakten getrennt von
Ableitungen. Erfinde keine fehlenden Keys, APIs oder Produktentscheidungen.

Unveränderliche Grenzen:

- Activity V1 und `index.html` bleiben unverändert.
- Kein SQL, RPC, RLS, Grant, Supabase-Write, Deploy, Storage oder IndexedDB.
- `commitSession` wird weder geändert noch aufgerufen.
- Historische Werte bleiben read-only und dürfen aktuelle Eingaben nie
  vorbefüllen oder den Draft mutieren.
- Keine RPE-, 1RM-, Warm-up-, Drop-/Superset-, Progressions-, Ziel- oder
  Trainingsplanlogik.
- Noch kein R6-, R7-, R8-, R11- oder R13-Vorgriff.

Schließe S1 mit einem Contract Review ab. Korrigiere berechtigte Findings nur
innerhalb des S1-Dokumentations- und Vertragsumfangs, aktualisiere Findings,
Statusmatrix und Session Resume Card und stoppe anschließend vor S2. Bei einem
Quellenwiderspruch, einer neuen Produktentscheidung oder Scope-Ausweitung
stoppen und den Owner informieren.

Die Roadmap soll nicht allein wegen einer ungefähren 1.200-Zeilen-Marke
gekürzt werden. Kompaktiere nur echte Duplikate oder auslagerbare Evidence,
wenn Entscheidungen, Gates, Findings, Invalidation Map und Fresh-Chat-Kontext
vollständig erhalten bleiben.

Berichte am Ende knapp:

- gelesene und geprüfte Sources of Truth,
- reale Baseline,
- System-/Consumerkarte,
- Findings und Korrekturen,
- S1-Abnahme und nächstes erlaubtes Gate.
```

## Session Resume Card

- Ziel: isolierter policy-gesteuerter Strength-Set-Editor in der R4-Session-Shell.
- Unveränderlich: Activity V1/`index.html`, SQL/RPC, `commitSession`, Storage/
  IndexedDB und Produktnavigation; R4-Historie bleibt read-only und ohne
  Vorbefüllung; keine RPE-/1RM-/Ziel-/Progressions-/Trainingsplanlogik.
- S1-S6: `PASS` am `2026-08-08`; Scope Freeze, Implementierung, vollständige
  Testmatrix, Reviews, Doku-Sync und Abschluss sind abgeschlossen.
- Frischer finaler S5-Nachweis: Contracttests `81/81`; Katalog
  `v2 / 80 / 47 / 58`; Syntax `10/10`; Isolation/geschützte Pfade `PASS`.
- Finaler R5-Codediff: ausschließlich die sieben freigegebenen Draft-, Shell-,
  CSS-, Harness- und Consumer-Testdateien; R1/R2/R4-Runtime, Datenzugriff,
  Activity V1, `index.html`, SQL und Supabase unverändert.
- Draft live: `midas.activity-session-draft.v2`; Itemkeys exakt
  `item_key`, `item_order`, `sets`; Strength-Sets halten `set_order` plus die
  fünf R2-Feldnamen als `null` oder begrenzten Rohtext, Non-Strength `sets: []`.
- API live: bestehende sieben Methoden plus exakt `addSet`, `removeSet` und
  `setSetField`; alle Mutationen atomar, tief eingefroren und revisionsgenau.
- Rebuilds live: Add/Remove/Move/Note bewahren vollständige Setrecords;
  Remove/Re-Add und Discard löschen nur den vertraglich bestimmten Zustand.
- Policy live: alle acht realen R1-Strength-Kombinationen fail-closed geprüft;
  drei leere Sets für Strength, keine Sets oder Set-API für Non-Strength.
- Strength-DOM live: ausschließlich policy-erlaubte Textinputs mit deutschen
  Labels, exakten Mobile-/Autofill-/ARIA-Attributen, drei Draftzeilen und
  getrennten Set-/Itemaktionen; Non-Strength bleibt neutral.
- Parser live: ASCII-Ziffern, Komma/Punkt, keine Exponenten/Vorzeichen/
  Gruppierung oder Rundung; R1-Definitionen werden vor DOM-Wirkung exakt
  fail-closed validiert und liefern Grenzen/Dezimalstellen.
- Validität live: `empty`, `partial`, `complete`, `invalid` nur abgeleitet;
  Complete-Präfix und leere Tails, Feldcopy, Partialcopy und Lückenfehler sind
  deterministisch und werden nie gespeichert.
- Lifecycle live: Input mutiert Draft-first ohne Full Render/Caretverlust;
  Add/Remove fokussieren deterministisch; Lookup/Timer ersetzen keine Inputs;
  Pending Close sperrt nur neue Setcontrols und reaktiviert sie aus dem Draft;
  ein Contractbruch nach erfolgreicher Draftmutation propagiert ohne stale
  DOM-Rollback.
- Browser: `1440x900`, `390x844`, `320x800` ohne horizontalen Overflow,
  abgeschnittene Controls/Textinhalte oder Set-Zeilen-Kollisionen; bei `320x800`
  erfüllen alle `143` sichtbaren Dialog-Controls die 44-Pixel-Grenze.
- Browserinteraktion: Bench Press wechselte mit erhaltenem Inputfokus von
  `invalid`/`intermediate` zu `complete`; echte 31-Sekunden-Other-Tab-Smokes
  vor und nach dem Reviewfix bewahrten `08`, `80,`, drei Zeilen, Fokus und
  States bei Timerfortschritt `01:29 -> 02:00` beziehungsweise `00:18 -> 00:50`;
  die App-Console blieb ohne MIDAS-Fehler.
- Harness: deterministische Routen `empty`, `policies`, `history`, `all` liefern
  `0/8/4/12` Items; alle acht realen R1-Policykombinationen sowie Success-,
  Empty-, Error-/Retry- und lange Historyzustände bleiben lokal und read-only.
- Findings `F-ACT-R5-16/-18`: Post-Mutations-Divergenz und reale Doku-/
  Workflowabweichungen minimal korrigiert und revalidiert.
- CodeRabbit CLI `0.7.2`: erster Lauf `5` Issues (`2` Major, `3` Minor), alle
  fachlich bewertet; zweiter Lauf nach Codefix `0` Issues.
- Offene In-Scope-P0/P1-Findings: `none`.
- Doku-Sync: Module Overview und Masterplan beschreiben den bewiesenen
  R5-Iststand; HCR-023 liegt in der kanonischen Health-Contract-Review-Suite.
- Changelog: nicht bemerkenswert, weil R5 isoliert bleibt und weder sichtbares
  Produktverhalten noch Deploy, Datenbank oder produktive Schreibwirkung ändert.
- Offene In-Scope-P0/P1-Findings: `none`.
- Aktueller Stand: `R5 DONE`; Roadmap im vereinbarten Archivziel.
- Nächster erlaubter Schritt: R6 als eigene Rolling-Wave-Roadmap vorbereiten.
- Stop: kein Vorgriff auf R6/R7/R8/R11/R13; weiterhin kein Deploy/Cutover.

## Zielvertrag

Prüfbares Endergebnis:

- Jedes ausgewählte aktive Catalog-v2-Item mit
  `tracking_mode: strength_sets` zeigt in der isolierten R4-Shell einen
  mobilen Strength-Editor.
- Beim erstmaligen Hinzufügen einer Strength-Übung entstehen genau drei leere
  Satzzeilen. Sie sind Eingabehilfen und keine abgeschlossenen Sätze.
- Weitere Zeilen können bis zur bestehenden 50-Satz-Grenze hinzugefügt werden.
  Nicht benötigte Zeilen können entfernt werden; die verbleibenden
  `set_order`-Werte bleiben lückenlos ab eins.
- Sichtbare Felder werden ausschließlich aus der R1-Feldpolicy abgeleitet:
  eine Primärmessung aus `reps`, `duration_sec` oder `distance_m` sowie nur die
  erlaubte Last aus `weight_kg` oder `assistance_kg`.
- Vollständigkeit wird ohne Checkbox automatisch aus Feldpolicy und Eingaben
  abgeleitet. Leere, teilweise und vollständige Zeilen sind unterscheidbar.
- Vollständig leere nachlaufende Zeilen bleiben zulässige Platzhalter.
  Teilzeilen, ungültige Werte und eine nichtleere Zeile nach einer leeren Lücke
  werden sichtbar als nicht speicherbar markiert.
- Deutsche Dezimaleingaben wie `77,5` und technische Punktwerte wie `77.5`
  werden kontrolliert und ohne stillen Rundungs- oder Vorzeichenfehler
  verarbeitet. Integerfelder bleiben ganzzahlig.
- R4-Historie bleibt vollständig read-only. Kein historischer Wert mutiert den
  Draft oder erscheint als aktueller Eingabewert.
- Itemverschiebung erhält aktuelle Satzwerte. Itementfernung löscht dessen
  aktuellen Editorzustand; erneutes Hinzufügen beginnt wieder mit drei leeren
  Zeilen.
- Draftsnapshots und öffentliche APIs bleiben exakt, unveränderlich und
  fail-closed. Eine notwendige Schemaänderung erhält eine neue explizite
  Draft-Schema-Version.
- Desktop sowie schmale Android-Viewports bleiben ohne horizontalen Overflow,
  überlappende Controls oder Fokusverlust bedienbar.
- Die vollständige S5-Matrix, nativer Full Review und CodeRabbit enden ohne
  offene In-Scope-P0/P1-Findings.

Bewusst unverändert:

- Activity V1, Doctor View, Reports und bestehende Health-Event-Pfade.
- R1- und C2-Kataloginhalt, Aliaslogik und Feldpolicies.
- R2-SQL, RPCs, RLS, Grants, Responseverträge und `commitSession`.
- R3-Timer, Request-ID, Close-/Discard-Guard und Backgroundvertrag.
- R4-Suche, Historienlookup, Cache- und Raceguardvertrag.
- Cardio-/Duration-Editor aus R6, Recovery aus R7, Save/History aus R8,
  Produktcutover aus R11 und Sessionvorlage aus R13.

## Problem und Ist-Zustand

- R4 kann Übungen suchen, dem Draft hinzufügen und die letzte reale Ausführung
  anzeigen. Aktuelle Wiederholungen, Dauer, Distanz oder Last können noch nicht
  erfasst werden.
- Der R3-Draft enthält pro Item derzeit nur `item_key` und `item_order` unter
  `midas.activity-session-draft.v1`.
- Die R3-Shell validiert Draftmethoden und Snapshotkeys exakt. Eine Erweiterung
  muss daher Draft, Shell, Testdoubles und Contracttests gemeinsam versionieren.
- Der R2-Commitvertrag besitzt bereits das spätere numerische Satzschema und
  die Grenze von 50 Sätzen, darf in R5 aber weder aufgerufen noch verändert
  werden.
- Browserfelder benötigen während des Tippens auch vorübergehend unvollständige
  Eingaben. Diese dürfen weder als gültige Leistung behauptet noch in einer
  zweiten, unkontrolliert divergierenden Wahrheit gehalten werden.
- Die reale Nutzungsweise ist bewusst einfach: meist drei Sätze, davon häufig
  zwei normale Arbeitssätze und ein schwererer dritter Satz. MIDAS dokumentiert
  dies, interpretiert den dritten Satz aber nicht technisch.

## Entscheidungslog

<!-- markdownlint-disable MD013 -->

| ID | Datum | Entscheidung | Warum | Betrifft |
| --- | --- | --- | --- | --- |
| D-ACT-R5-01 | 2026-08-08 | R5 bleibt ausschließlich in der isolierten Activity-V2-Harness-/Shell-Welt. | R11 besitzt den Produktcutover. | Scope, S4, S5 |
| D-ACT-R5-02 | 2026-08-08 | Jede neu hinzugefügte Strength-Übung startet mit genau drei leeren Satzzeilen. | Entspricht Stephans realem Training mit minimaler Reibung. | Draft, UI |
| D-ACT-R5-03 | 2026-08-08 | Der dritte Satz besitzt keine Sonderrolle oder Kennzeichnung. | MIDAS dokumentiert Leistung und interpretiert den Trainingsstil nicht. | Daten, Copy |
| D-ACT-R5-04 | 2026-08-08 | `+ Satz` hängt eine leere Zeile an; Entfernen reindiziert lückenlos. Mindestens eine sichtbare Zeile bleibt, die bestehende Höchstgrenze ist 50. | Vorhersagbare mobile Bedienung und Kompatibilität mit R2. | Draft, UI, Tests |
| D-ACT-R5-05 | 2026-08-08 | Satzabschluss ist ein abgeleiteter Zustand ohne Checkbox und ohne Zeitpunktfeld. | Weniger Reibung und keine redundante Wahrheit. | O-3, Draft, UI |
| D-ACT-R5-06 | 2026-08-08 | Eine Zeile ist leer, wenn alle policy-erlaubten Satzfelder leer sind; vollständig nur bei gültigen Pflicht- und optionalen Werten; sonst teilweise/ungültig. | Exakte Feldpolicy statt heuristischer Erledigt-Markierung. | Validator, Copy |
| D-ACT-R5-07 | 2026-08-08 | Nur ein Präfix vollständiger Sätze gefolgt von vollständig leeren Zeilen ist später speicherbar. | Leere Platzhalter sind erlaubt, Lücken oder Teilzeilen nicht. | Validator, R8-Handoff |
| D-ACT-R5-08 | 2026-08-08 | Sichtbare Eingabefelder stammen ausschließlich aus `entry.fields` und den R1-`field_definitions`. | Keine per Übung hartcodierte Formularlogik. | UI, Semantik |
| D-ACT-R5-09 | 2026-08-08 | Dezimalfelder akzeptieren Komma und Punkt; Integerfelder keine Dezimalstellen. Grenzen und Dezimalstellen stammen aus R1. | Österreichische Bedienung ohne Datenmehrdeutigkeit. | Parser, Mobile |
| D-ACT-R5-10 | 2026-08-08 | R4-Historie bleibt read-only und darf aktuelle Inputs nie vorbefüllen oder den Draft mutieren. | Vergangene Leistung ist Orientierung, keine aktuelle Behauptung. | R4/R5-Grenze |
| D-ACT-R5-11 | 2026-08-08 | Itemverschiebung erhält Sätze; Itementfernung entfernt den gesamten aktuellen Itemzustand; Re-Add startet frisch. | Eindeutiger Draft-Lifecycle. | Draft, Shell |
| D-ACT-R5-12 | 2026-08-08 | R5 versioniert jede Änderung der exakten R3-Snapshotform ausdrücklich; stille Mutation von `draft.v1` ist verboten. | R7 benötigt eine eindeutige spätere Recovery-Grenze. | Draftschema |
| D-ACT-R5-13 | 2026-08-08 | Der gemeinsame Draft bleibt die einzige kanonische Sessionwahrheit. Kurzlebige DOM-Eingabepuffer dürfen nur klar definierte, noch nicht parsebare Zwischenzustände halten. | Keine divergierenden Werte zwischen UI, Draft und späterem Autosave. | S2, S4.1-S4.3 |
| D-ACT-R5-14 | 2026-08-08 | R5 verändert weder numerischen R2-Commitrequest noch ruft es `commitSession` auf. | Normalisierung und Save-Integration gehören zu R8. | Scope, Tests |
| D-ACT-R5-15 | 2026-08-08 | Non-Strength-Items bleiben such- und auswählbar, erhalten in R5 aber keinen falschen Strength-Editor. | R6 ergänzt ihren eigenen Editor auf demselben Sessionpfad. | Mixed Draft, UI |
| D-ACT-R5-16 | 2026-08-08 | Es gibt keine RPE-, 1RM-, Warm-up-, Dropset-, Superset-, Ziel- oder Progressionsfelder. | Das Modul soll Training erfassen, nicht zur Wissenschaft machen. | Nicht-Scope |
| D-ACT-R5-17 | 2026-08-08 | 1RM und Progression können später aus realen Werten in Export/Chat abgeleitet werden. | Keine zusätzliche Eingabereibung oder redundante Speicherung. | R10/R13-Handoff |
| D-ACT-R5-18 | 2026-08-08 | R5 fügt keine Itemnotiz hinzu; die bestehende Sessionnotiz bleibt unverändert. | Itemnotiz ist kein freigegebenes R5-Ziel. | Scope |
| D-ACT-R5-19 | 2026-08-08 | Die UI verwendet Textinputs mit passendem `inputmode`, nicht Browser-Number-Verhalten als alleinige Validierung. | Mobile Dezimaltastatur und Komma müssen kontrollierbar bleiben. | UI, Parser |
| D-ACT-R5-20 | 2026-08-08 | S4 enthält ausschließlich Umsetzung und substepnahe Checks. Nativer finaler Full Review und CodeRabbit laufen in S5. | Aktueller Roadmap-Workflowvertrag. | S4, S5 |
| D-ACT-R5-21 | 2026-08-08 | Eine separate Evidence-Datei ist nicht erforderlich. | Kein produktiver Write, SQL oder Deploy; Roadmap und QA tragen die Nachweise. | S5, S6 |
| D-ACT-R5-22 | 2026-08-08 | Das neue Draftschema ist exakt `midas.activity-session-draft.v2`. Jedes Item erhält `sets`; Strength-Sets besitzen die fünf R2-Messfeldnamen als `null` oder Rohtext, Non-Strength besitzt `sets: []`. | Explizite Versionierung ohne parallele Raw-/Statuskeys und ohne R2-Schemamutation. | Draft, Shell, R7/R8-Handoff |
| D-ACT-R5-23 | 2026-08-08 | Die Draft-API ergänzt exakt `addSet(itemKey)`, `removeSet(itemKey, setOrder)` und `setSetField(itemKey, setOrder, fieldKey, value)`. | Kleinste policy-gesteuerte Mutationsfläche passend zur bestehenden R3-API. | Draft, Testdoubles, Shell |
| D-ACT-R5-24 | 2026-08-08 | Der Draft speichert jeden nichtleeren Set-Input unverändert als auf 32 Unicode-Codepoints begrenzten String; `''` wird `null`. Numerische Syntax, Wert und Status werden abgeleitet, nicht gespeichert. | Komma und Tipp-Zwischenstände bleiben renderfest, ohne stille Rundung oder zweite Wahrheit. | Draft, Parser, R7/R8-Handoff |
| D-ACT-R5-25 | 2026-08-08 | Dezimaler Zwischenzustand ist nur `ASCII-Ziffern + abschließendes Komma/Punkt`; vollständige Tokens erlauben ASCII-Ziffern und höchstens einen Dezimaltrenner. Vorzeichen, Exponenten, Gruppierung, Whitespace und führende Trenner sind ungültig. | Deterministische locale-unabhängige Eingabe ohne Mehrdeutigkeit. | Parser, Tests, Copy |
| D-ACT-R5-26 | 2026-08-08 | Row-/Itemstatus bleibt ungespeichert. Save-ready bedeutet ausschließlich mindestens ein vollständiger Satz als Präfix, gefolgt nur von leeren Zeilen; R5 zeigt dies, besitzt aber keine Save-Aktion. | Kein redundanter Abschlusszustand und eindeutiger R8-Handoff. | Validator, UI, R8-Handoff |
| D-ACT-R5-27 | 2026-08-08 | Jedes Set-Inputevent mutiert zuerst den Draft und patcht danach nur Validität/Copy; es gibt keinen zweiten DOM-Rohwertpuffer. Full Render, Lookupsettlement, Reorder und Background-Timer lesen beziehungsweise erhalten den Draftwert. | Schutz vor Caretverlust, stale DOM und Überschreiben durch R4-Historie. | Shell, Lifecycle, Races |
| D-ACT-R5-28 | 2026-08-08 | Jeder Draft-v2-Snapshot wird aus vollständigen Item-/Setrecords aufgebaut. `setNote`, Item-Reorder und Item-Add dürfen vorhandene Sets nie auf Itemkeys reduzieren; nur explizites Item-Remove, Re-Add und Discard entfernen Setzustand. | Der heutige R3-Rebuild aus Keylisten würde eine naive Set-Erweiterung still löschen. | Draft, Atomizität, S4.1 |
| D-ACT-R5-29 | 2026-08-08 | Solange der bestehende Close-/Discard-Guard pending ist, sind ausschließlich die neuen R5-Setinputs und Setaktionen deaktiviert. Cancel/Fehler reaktiviert sie; R3-/R4-Confirmation-, Fokus-, Discard- und Lookupsemantik bleibt unverändert. | Kein neuer Setwert darf nach dem bestätigten Snapshot in denselben Discardlauf geraten. | Shell, Close-Race, S4.3 |
| D-ACT-R5-30 | 2026-08-08 | Jedes aktuelle Setinput besitzt `maxlength="32"`, `autocomplete="off"` und `spellcheck="false"`; sein `value` stammt bei Render ausschließlich aus dem Draft. | Schutz vor überlangem, korrigiertem oder still vorbefülltem DOM-Wert außerhalb der kanonischen Draftgrenze. | UI, A11y, Browser |
| D-ACT-R5-31 | 2026-08-08 | S4 läuft final als Block A `S4.1`, Block B `S4.2+S4.3` und Block C `S4.4`. Jeder Activity-V2-JS-/Testblock wiederholt T-01, jeder Integrations-/Importblock T-13; die blockgenauen Vereinigungsmengen sind im S4R-Ergebnis eingefroren. | Die ursprünglichen Substep-Listen bildeten die eigene S5-Invalidationsregel nicht vollständig ab. | S4R, S4, S5 |

<!-- markdownlint-enable MD013 -->

## Owner-Briefing-Bedarf

- Erklärmodus:
  - `Briefing + S6-Recap`.
- Neue oder entscheidungsrelevante Konzepte:
  - Draft-Schema-Version gegenüber produktivem R2-Speicherschema;
  - abgeleitete Zeilenzustände statt gespeicherter Abschlusscheckbox;
  - kontrollierte Rohwerte beim Tippen gegenüber normalisierten späteren
    Commitwerten.
- Geplante Briefing-Gates:
  - S2-Briefing erledigt: finaler Draft-/Eingabevertrag ist vor S3/S4 erklärt;
  - S6 fasst Verhalten und R6-R8-Handoff in Alltagssprache zusammen.
- Nicht erneut zu erklären:
  - normale JS-/CSS-Syntax, Testassertions und rein mechanische Harnesspflege.

## Scope und Grenzen

In Scope:

- versionierte Erweiterung des gemeinsamen In-Memory-Drafts für Strength-Sätze;
- exakte Set-Mutations-API und fail-closed Fehlercodes;
- policy-gesteuerte Strength-Eingabefelder in der isolierten R4-Shell;
- drei Standardzeilen, Hinzufügen, Entfernen und lückenlose Reihenfolge;
- abgeleitete Leer-/Teil-/Vollständigvalidierung;
- deutsche Dezimaleingabe und mobile Tastaturhinweise;
- Lifecycle-, Fokus-, Responsive- und Background-Verhalten;
- Contracttests, Harness-Smokes, nativer Full Review und CodeRabbit;
- Synchronisierung von Masterplan, Activity Overview und QA nach Nachweis.

Nicht in Scope:

- Product Load oder sichtbarer Activity-V2-Cutover;
- Änderung oder Entfernung von Activity V1;
- SQL, RPC, RLS, Grants, Supabase-Write, Edge Function oder Deploy;
- Aufruf oder Refactor von `commitSession`;
- IndexedDB, LocalStorage oder andere persistente Draftrecovery;
- R6-Duration-/Cardiofelder;
- Katalogpflege, freie Keys oder neue Übungen;
- Save, Korrektur, Historienansicht oder Export;
- Pausentimer, Trainingsplan, Zielwerte, Empfehlungen oder medizinische Logik.

Roadmap-spezifische Guardrails:

- Historie und aktuelle Eingabe bleiben in Daten, DOM und Copy getrennt.
- Empty Defaults dürfen nie als ausgeführte Sätze gezählt werden.
- Der Editor fragt keine Daten pro Tastendruck ab und erzeugt kein Netzwerk.
- Eine ungültige Mutation verändert weder Snapshot noch Revision.
- Ein No-op erzeugt keine neue Revision und keinen unnötigen DOM-Lifecycle.
- Bestehende R3-/R4-Fokus-, Close-, Timer-, Cache- und Raceguards bleiben grün.
- Keine Änderung wird über den produktiven `index.html` geladen.

## Scope-Freeze vor S4

- Bestehende Features:
  - R1-R4/C2 erhalten; R5 ergänzt nur aktuelle Strength-Eingabe.
- Datenmodell, Lifecycle und Retention:
  - produktives Datenmodell und Retention unverändert;
  - nur der noch flüchtige R3-Draft darf explizit versioniert erweitert werden.
- Cleanup, Scheduler, Secrets und externe Automationen:
  - nicht betroffen.
- Kompatible Producer und Consumer:
  - Producer: R5-Shellaktionen über den gemeinsamen Draftcontroller;
  - Consumer: R5-Renderer und später R7/R8;
  - R4-Lookup bleibt separater read-only Consumer.
- Offene Grundsatzfragen:
  - `none`; S2 hat die exakte technische Repräsentation und API gegen den
    realen Code eingefroren.
- Umgang mit späterem Scope-Wechsel:
  - technische Korrektur vor S4 über S2/S3/S4R;
  - neue Produktfunktion als R6-R13 oder gezieltes Follow-up.

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
- `docs/archive/MIDAS Activity V2 R3 Shared Session Draft and UI Shell Roadmap (DONE).md`
- `docs/archive/MIDAS Activity V2 R4 Search and Last-Performance Lookup Roadmap (DONE).md`
<!-- markdownlint-enable MD013 -->
- `app/modules/vitals-stack/activity/v2/semantics.js`
- `app/modules/vitals-stack/activity/v2/semantics-v2.js`
- `app/modules/vitals-stack/activity/v2/data-access.js`
- `app/modules/vitals-stack/activity/v2/session-draft.js`
- `app/modules/vitals-stack/activity/v2/session-shell.js`
- die zugehörigen Contracttests, CSS und das isolierte Harness

Nur bei konkreter Vertragsfrage:

- `sql/20_Activity_V2.sql`
<!-- markdownlint-disable MD013 -->
- `docs/archive/MIDAS Activity V2 R1 Semantics and Product Contract Roadmap (DONE).md`
- `docs/archive/MIDAS Activity V2 C2 Catalog Version 2 Studio Vocabulary Roadmap (DONE).md`
<!-- markdownlint-enable MD013 -->
- `docs/QA_CHECKS.md`

## Tool Permissions und Gates

Allowed:

- lokale Datei- und Git-Reads;
- eng begrenzte Änderungen im Activity-V2-Verzeichnis und den zugeordneten
  Dokumenten;
- Node-Contracttests, Syntaxchecks, Katalogcheck und Markdownlint;
- lokaler isolierter Harness mit Browser-Plugin oder dokumentiertem Playwright-
  Fallback;
- CodeRabbit in S5 gemäß `docs/DEV_ENVIRONMENT.md`.

User-gated:

- keine produktive Aktion vorgesehen;
- nur neue Produktentscheidung oder optionale subjektive Touch-Abnahme.

Forbidden:

- Secrets ausgeben oder committen.
- fremde Worktree-Änderungen zurücksetzen.
- SQL, Supabase, Deploy, Edge Functions oder GitHub Workflows verändern.
- Activity V1, `index.html` oder produktive Navigation verändern.
- Verlauf vorbefüllen oder freie Übungskeys erzeugen.
- S5-CodeRabbit-Findings blind korrigieren.

## Statusmatrix

<!-- markdownlint-disable MD013 -->

| ID | Schritt | Reasoning | Status | Kompaktes Ergebnis |
| --- | --- | --- | --- | --- |
| S1 | System- und Vertragsdetektivarbeit | `High` | PASS | Pflichtquellen und realer Code vollständig kartiert; 65/65, Katalog und Syntax grün; F-ACT-R5-08 fixed; Stop vor S2 |
| S2 | Fachlicher und technischer Zielvertrag | `Extra High` | PASS | Draft v2, zehn Methoden, Rohtext-/Parser-, Validitäts-, UI- und Lifecyclevertrag eingefroren; keine neuen Findings; Stop vor S3 |
| S3 | Bruchrisiko-, Security- und Umsetzungsreview | `High` | PASS | Datenverlust-, Parser-, Policy-, Race-, A11y- und Isolationsrisiken geschlossen/zugeordnet; F-ACT-R5-09 bis -11 fixed; Blöcke A/B/C und T-01..T-14 eingefroren; Stop vor S4R |
| S4R | S4 Readiness Review | `Extra High` | PASS | Reale Dateien, geschützte Zonen, Baseline, Reihenfolge und Rollbacks bestätigt; F-ACT-R5-12 fixed; Scope Freeze grün; Stop vor S4.1 |
| S4.1 | Draftschema und Set-Mutationsvertrag | `Extra High` | PASS | Draft v2, zehn Methoden, acht Policykombinationen, Setgrenzen und vollständige Rebuilds umgesetzt; 72/72, Katalog, Syntax und Isolation grün; F-ACT-R5-13 fixed; Stop vor Block B |
| S4.2 | Policy-gesteuerte Strength-Karte | `High` | PASS | Acht reale Policies, exakte Felder/Attribute, drei Draftzeilen, getrennte read-only Historie und neutraler Non-Strength-Handoff umgesetzt; F-ACT-R5-14 fixed |
| S4.3 | Eingabe, Validierung und Lifecycle | `High` | PASS | Draft-first Parser/States, Add-/Remove-Fokus, Close-/Lookup-/Timer-/Destroyguards umgesetzt; 80/80 plus Browser-/Backgroundmatrix grün; F-ACT-R5-15 fixed; Stop vor S4.4 |
| S4.4 | Responsive Politur und isoliertes Harness | `High` | PASS | Stabile Desktop-/Mobile-Setlayouts, 44-Pixel-Touchziele und vier lokale Fixtures umgesetzt; 80/80, Katalog, Syntax, Isolation und Browsermatrix grün; keine neuen Findings; Stop vor S5 |
| S5 | Testmatrix, Full Review und CodeRabbit | `Extra High` | PASS | T-01..T-14 grün; 81/81, Katalog, Syntax, Isolation und Browsermatrix PASS; F-ACT-R5-16/-17 fixed; CodeRabbit 5 -> 0 Issues; Stop vor S6 |
| S6 | Doku-Sync, Recap und Archiv | `High` | PASS | Module Overview, Masterplan und HCR-023 synchronisiert; Full Contract Review ohne offene Findings; Changelog nicht bemerkenswert; R5 archiviert, Stop vor R6 |

<!-- markdownlint-enable MD013 -->

## Findings

<!-- markdownlint-disable MD013 -->

| ID | Severity | Typ | Status | Entscheidung / Zielschritt |
| --- | --- | --- | --- | --- |
| F-ACT-R5-01 | P1 | Contract | fixed | Der Masterplan führte O-3 noch als offen und R7 mit gespeichertem Abschlussstatus. Auf abgeleiteten Zustand ohne Checkbox/Zeitpunkt korrigiert. |
| F-ACT-R5-02 | P1 | Contract | fixed | R5 benötigte eine explizite Grenze zwischen flüchtigem Draft und numerischem R2-Commit. R5 versioniert nur den Draft; R2 bleibt geschützt. |
| F-ACT-R5-03 | P1 | UX/Data | fixed | Drei Standardzeilen könnten fälschlich als drei ausgeführte Sätze gelten. Leere Zeilen sind ausdrücklich nur Platzhalter. |
| F-ACT-R5-04 | P1 | Data | fixed | Historische Werte könnten als aktuelle Leistung übernommen werden. Vorbefüllung und Draftmutation sind ausdrücklich verboten. |
| F-ACT-R5-05 | P2 | UX | fixed | Browser-Number-Inputs sind für österreichische Kommaeingabe unzuverlässig. Kontrollierter Parser plus `inputmode` ist Pflicht. |
| F-ACT-R5-06 | P2 | Scope | fixed | RPE, 1RM, Satztypen und Progression hätten R5 unnötig erweitert. Sie sind ausdrücklich ausgeschlossen. |
| F-ACT-R5-07 | P2 | Workflow | fixed | Der erste R5-Entwurf führte Full Reviews in S4-Substeps, obwohl S5 den finalen Code-/Contractreview besitzt. S4.1 und S4.3 auf Consumer-Review korrigiert. |
| F-ACT-R5-08 | P1 | Contract/Consumer | fixed | Die initiale S4.1-Dateigrenze benannte die exakten R3-/C2-Consumer nur generisch. `session-shell.js`, alle fünf Draft-Fassaden in `session-shell.contract.test.js` und der direkte Consumer `semantics-v2.contract.test.js` sind jetzt als koordinierte Invalidierungsgrenze explizit. |
| F-ACT-R5-09 | P1 | Data/Implementation | fixed | Der reale R3-Draft baut bei Add, Remove, Move und `setNote` Snapshots aus Itemkeylisten neu. Eine naive v2-Erweiterung würde Sets verlieren. D-ACT-R5-28 und S4.1 verlangen jetzt vollständige Item-/Setrecords und explizite Erhaltungstests. |
| F-ACT-R5-10 | P1 | Lifecycle/Race | fixed | Der asynchrone Close-Guard hält die Shell offen. Neue R5-Setmutationen wären währenddessen möglich und könnten vom laufenden Discard erfasst werden. D-ACT-R5-29 sperrt nur die neuen Setcontrols bis Guardende und bewahrt den R3-/R4-Vertrag. |
| F-ACT-R5-11 | P2 | UX/Data | fixed | `inputmode` allein verhindert weder überlange Rohwerte noch Browser-Autofill/Spell-Correction. D-ACT-R5-30 bindet DOM-Attribute und Renderquelle jetzt exakt an die 32-Codepoint-Draftgrenze. |
| F-ACT-R5-12 | P1 | Workflow/Invalidation | fixed | Die S4.2-S4.4-Checklisten ließen trotz Activity-V2-JS-/Test- beziehungsweise Integrationsdelta T-01 und teilweise T-13 aus; S4.1 nannte außerdem den schemaabhängigen R4-Regressionstest T-08 nicht. D-ACT-R5-31, Invalidation Map und alle S4-Blockmengen sind jetzt konsistent. |
| F-ACT-R5-13 | P2 | Contract/Implementation | fixed | Die erste S4.1-Fassung klassifizierte einen nach Capture abweichenden Status derselben Semantik teilweise als regulär inaktiv. `assertKnownActiveItem` behandelt Status-/Policydrift jetzt atomar als `INVALID_CATALOG`; nur ein bereits captured-deprecated Eintrag bleibt `INACTIVE_ITEM_KEY`. |
| F-ACT-R5-14 | P1 | Contract/Consumer | fixed | Die erste Block-B-Fassung konsumierte Min/Max und Dezimalstellen, validierte die injizierten R1-Setfelddefinitionen aber noch nicht als exakte Shellgrenze. `captureCatalog` prüft jetzt je Feld exakte Keys, Scope, Typ, Unit, positive Grenzen und `max_decimals`; fünf negative Consumerfälle sichern DOM-freies Fail-Closed. |
| F-ACT-R5-15 | P2 | Security/Lifecycle | fixed | Die erste delegierte Seteventfassung validierte Itemkey, Setorder und Fieldkey, band das Eventtarget aber noch nicht an den aktuell gerenderten Controlref. Add-/Remove-/Inputpfade akzeptieren jetzt ausschließlich den kanonischen aktuellen DOM-Control; forged und stale Targets bleiben mutationsfrei. |
| F-ACT-R5-16 | P1 | Contract/Lifecycle | fixed | Nach erfolgreichem `setSetField` lag `patchEditorState` im selben Catchblock. Ein anschließender Shell-/Draft-Contractbruch konnte dadurch den alten DOM-Rohwert zurückspielen, obwohl der Draft bereits mutiert war. Mutationsfehler stellen weiterhin den stabilen Draftwert wieder her; Post-Mutations-Contractbrüche propagieren jetzt ohne stale Rollback und sind gezielt contractgetestet. |
| F-ACT-R5-17 | P1 | Documentation/Workflow | fixed | Der Masterplan behauptete trotz fertiger isolierter Implementierung noch „nicht begonnen“, sein Cross-Contract-Datum war vor R4, und Template/README formulierten CodeRabbit-Re-Run sowie S5-vor-Produktwirkung nicht deterministisch. Der reale isolierte Status, das Datum `2026-08-08`, die Codeänderungsregel und die Produktwirkungsschranke sind korrigiert, ohne S6/DONE vorwegzunehmen. |
| F-ACT-R5-18 | P2 | Documentation/Workflow | fixed | Die S6-Anweisung verwies für eine neue Health-Contract-Review-ID auf `docs/QA_CHECKS.md`, obwohl dieser Index ausdrücklich keine Testsuite ist und `docs/qa/health-capture-reports.md` die HCR-IDs führt. Nach Owner-Freigabe wurde die Anweisung auf die kanonische Suite korrigiert, HCR-023 dort ergänzt und der Kompatibilitätsindex unverändert gelassen. |

<!-- markdownlint-enable MD013 -->

S4.4-Consumer- und visuelles Review am `2026-08-08`: keine neuen Findings;
offene In-Scope-P0/P1-Findings `none`.

## Initialer Contract Review der Roadmap

Geprüft am `2026-08-08` gegen Masterplan, R1-/C2-Semantik, R2-Commitvertrag,
R3-Draft/Shell, R4-Historienvertrag und den aktuellen Workflowvertrag.

- Produktziel:
  - `PASS`; R5 bildet Stephans reale Drei-Satz-Nutzung ab, ohne sie zu
    überinterpretieren.
- Reihenfolge:
  - `PASS`; R5 setzt R4 voraus und bleibt vor R6-R8 isoliert.
- Datenvertrag:
  - `PASS`; Draftschema darf explizit versioniert werden, R2-Schema bleibt
    unverändert.
- Consumervertrag:
  - `PASS`; R4-Historie ist read-only, aktuelle Eingabe bleibt getrennt.
- Scope:
  - `PASS`; kein Product Load, Save, Storage, SQL oder Katalogumbau.
- Workflow:
  - `PASS`; S4 ist Implementierung, S5 enthält Testmatrix, nativen Full Review,
    CodeRabbit, Findingsbewertung und invalidierte Rechecks.
- Fresh-Chat-Tauglichkeit:
  - `PASS`; Lesereihenfolge, Baseline, Stop-Bedingungen und Handoffs sind
    explizit.
- Größenprüfung:
  - `PASS`; Roadmap bleibt unter der Orientierungsmarke. Diese ist weiterhin
    dynamisch und darf bei echtem Kontextbedarf überschritten werden.
- Offene blockierende Findings:
  - `none`.

---

## S1 - System- und Vertragsdetektivarbeit

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. Pflichtreferenzen in der Startkartenreihenfolge lesen.
2. `git status --short`, aktuellen Activity-V2-Diff und letzten relevanten
   Commit prüfen. Fremde Änderungen nicht zurücksetzen.
3. Baseline frisch ausführen:
   - alle fünf Activity-V2-Contracttests;
   - `node tools/activity-catalog.mjs check`;
   - Syntax der realen Activity-V2-Skripte.
4. Exakte R3-Draftgrenze erfassen:
   - Schema-ID, Snapshotkeys und Itemkeys;
   - öffentliche Methoden und sichere Fehlercodes;
   - Revision, Immutability, No-op, Discard und Timer;
   - alle Shell- und Testdouble-Consumer.
5. Exakte R4-Shellgrenze erfassen:
   - Renderpfad und Eventdelegation;
   - Suche, Lookup, Cache, Fokus, Close/Discard und Destroy;
   - Historien-DOM und geschützte read-only Grenze.
6. R1-Feldpolicy vollständig kartieren:
   - alle realen `strength_sets`-Policykombinationen;
   - `field_definitions`, Min/Max, Integer und Dezimalstellen;
   - aktive Strength- und Non-Strength-Beispiele aus Catalog v2.
7. R2-Commitgrenze read-only kartieren:
   - exakte Setkeys, numerische Werte und 50-Satz-Limit;
   - keine Änderung oder Verwendung des Commitpfads ableiten.
8. CSS-, Harness- und Browser-Testfähigkeit sowie Produktisolation prüfen.
9. Fakten, technische Ableitungen und neue Findings getrennt dokumentieren.
10. S1-Contract-Review durchführen, berechtigte Findings in Roadmap/Masterplan
    korrigieren und die Resume Card ersetzen.

Ergebnis:

### S1-Fakten

#### Git- und Baselinestand

- `git status --short` vor der S1-Dokumentationskorrektur:
  - geändert: `docs/Future trainingsmodule update thoughts.md`;
  - geändert: `docs/templates/MIDAS Roadmap Template.md`;
  - geändert: `docs/templates/MIDAS Roadmap Workflow Contract.md`;
  - geändert: `docs/templates/README.md`;
  - ungetrackt: diese R5-Roadmap.
- Der relevante Diff enthielt keine Änderung an Activity-V2-Runtime,
  Activity V1, `index.html` oder `sql/20_Activity_V2.sql`. Die vorhandenen
  Masterplan-/Templateänderungen stammen aus dem Roadmap-Denkraum und wurden
  nicht zurückgesetzt oder nebenbei umgeschrieben.
- Letzter relevanter Commit: `3f4f43a` vom `2026-08-08T16:21:18+02:00`,
  `feat(activity-v2): add isolated search and last-performance lookup`.
- Frische Baseline am `2026-08-08`:
  - fünf Activity-V2-Contractdateien: `65/65 PASS`, `0` fehlgeschlagen,
    `0` übersprungen;
  - `node tools/activity-catalog.mjs check`: `PASS`, `catalog_version=2`,
    `entries=80`, `alias_appends=47`, `search_cases=58`, Runtime und SQL
    geprüft;
  - `node --check` für alle zehn realen Activity-V2-`.js`-Dateien
    einschließlich Contracttests: `10/10 PASS`.
- Die Data-Access-Contracttests rufen `commitSession` ausschließlich gegen
  ihren lokalen Mock-Transport auf. Es gab keinen realen RPC-, Netzwerk- oder
  Produktaufruf und keine Änderung dieses Pfads.

#### R3-Draftvertrag

- Namespace/API:
  - Classic Script unter `AppModules.activityV2.sessionDraft`;
  - API exakt `create`;
  - Create-Optionen exakt `semantics`, `now`, `createRequestId`;
  - Controller exakt `getSnapshot`, `getTimerSnapshot`, `addItem`,
    `removeItem`, `moveItem`, `setNote`, `discard`.
- Snapshot:
  - Schema-ID exakt `midas.activity-session-draft.v1`;
  - Keys exakt `draft_schema_version`, `request_id`, `catalog_version`,
    `revision`, `started_at`, `note`, `items`;
  - Itemkeys exakt `item_key`, `item_order`;
  - Timerkeys exakt `running`, `elapsed_ms`, `label`.
- Identität und Mutation:
  - `request_id` ist eine normalisierte UUID und bleibt bis `discard` stabil;
  - `catalog_version` wird bei Create und erneut bei erfolgreichem Discard aus
    der injizierten Semantik gelesen;
  - der erste erfolgreiche Add startet `started_at`; Entfernen des letzten
    Items setzt den Timer nicht zurück;
  - erfolgreiche echte Mutationen erhöhen `revision` genau um eins;
  - gleiche normalisierte Note und Move auf dieselbe Position sind No-ops mit
    identischer Snapshotreferenz;
  - fehlgeschlagene Mutationen sind copy-on-write-atomar und erhalten
    Snapshotreferenz, Revision, Request-ID und Startzeit;
  - `discard` erzeugt vor dem Austausch eine neue, andere UUID und einen
    validen Katalogstand; danach ist der Draft pristine mit Revision `0`.
- Immutability und Grenzen:
  - öffentliche API, Controller, Snapshots, Items und Timer sind tief
    eingefroren;
  - Itemgrenze `50`, Notizgrenze `500` Unicode-Codepoints;
  - Timer ist timestamp-basiert, klemmt negative Deltas auf null und formatiert
    `MM:SS` beziehungsweise `HH:MM:SS`; keine Pausefunktion.
- Sichere Fehlercodes exakt:
  - `INVALID_OPTIONS`, `SEMANTICS_MISSING`, `INVALID_CATALOG`,
    `REQUEST_ID_UNAVAILABLE`, `INVALID_REQUEST_ID`, `INVALID_CLOCK`,
    `INVALID_ITEM_KEY`, `UNKNOWN_ITEM_KEY`, `INACTIVE_ITEM_KEY`,
    `DUPLICATE_ITEM`, `ITEM_LIMIT_REACHED`, `ITEM_NOT_FOUND`,
    `INVALID_ITEM_ORDER`, `INVALID_NOTE`, `REVISION_LIMIT_REACHED`.

#### R3-/R4-System- und Consumerkarte

<!-- markdownlint-disable MD013 -->

| Grenze | Reale Producer/Consumer | Exakte Bedeutung für R5 |
| --- | --- | --- |
| Katalog/Semantik | `semantics.js`, additiv `semantics-v2.js` | Catalog v2 liefert aktive Identität, `tracking_mode`, `fields`, Suche und Felddefinitionen; kein freier Key. |
| Draft | `session-draft.js`; `session-draft.contract.test.js` mit injizierten Katalog-, UUID-, Clock- und Revisionsdoubles | Exakte v1-Snapshot- und Sieben-Methoden-Grenze; Setzustand existiert real noch nicht. |
| Shell | `session-shell.js` | Validiert Draftschema, Snapshotkeys, Itemkeys, Timer und alle sieben Methoden exakt vor DOM-Wirkung. |
| Shelltests | `session-shell.contract.test.js` | Eigener Fake-DOM, echte Drafts sowie fünf exakte Draft-Fassaden für Late-Close, Discardfehler, Pending-Destroy, invaliden Snapshot und erwarteten Draftfehler. |
| C2-Integration | `semantics-v2.contract.test.js` | Erzeugt echten R3-Draft mit Semantics v2, fügt `high_row`/`total_abdominal` hinzu und mountet die echte Shell. |
| R4-Historienproducer | `data-access.js`; `data-access.contract.test.js` | Liefert optional `loadLastPerformance`; validiert aktuellen Katalog getrennt von historischen Snapshots. Kein Draftconsumer und kein aktueller Eingabewert. |
| Isolierter Browserconsumer | `session-shell-harness.html` | Lädt nur lokale Semantics v1/v2, Draft, Shell und CSS; nutzt echten Draft/Shell plus deterministische Historienfakes. |
| Produkt | `index.html` und Activity-V1-Modul | Laden Draft, Shell und CSS nicht; kein produktiver R5-Consumer vorhanden. |

<!-- markdownlint-enable MD013 -->

- Der Shell-Mount akzeptiert exakt `host`, `draft`, `semantics`, optional
  `loadLastPerformance`, `confirmDiscard`, `setIntervalFn` und
  `clearIntervalFn`. Der Shell-Controller besitzt exakt `open`, `render`,
  `requestClose`, `isOpen`, `destroy`.
- Die fünf Draft-Fassaden in `session-shell.contract.test.js` stehen bei den
  heutigen Blöcken um Zeile `1146`, `1380`, `1429`, `1467` und `1503`. Alle
  bilden die sieben R3-Methoden nach; vier davon kontrollieren zusätzlich
  Discard- oder Snapshotfehler. Sie müssen mit einer neuen exakten API gemeinsam
  invalidiert werden.

#### R4-Suche, Historie und Lifecycle

- Suche:
  - rein lokal über `semantics.search(query, { limit: 8 })`;
  - Treffer werden gegen aktuellen Katalog und `getEntryByKey` kanonisiert;
  - leere, keine, fehlerhafte und doppelte Resultate fail-closed;
  - Auswahl erfolgt über begrenzte Eventdelegation; vorhandene Items werden
    fokussiert statt erneut hinzugefügt;
  - Tippen und reine Trefferanzeige starten keinen Historienrequest.
- Historiengrenze:
  - optionaler Callback `loadLastPerformance(itemKey)`;
  - Top-Level exakt `schema_version`, `session`, `item` mit Schema
    `midas.activity-last-performance.v1`;
  - Session exakt `id`, `started_at`, `day`;
  - Item exakt `id`, `catalog_version`, `item_key`, `item_order`,
    `item_label_snapshot`, `tracking_mode_snapshot`, `equipment_snapshot`,
    `load_comparability_snapshot`, `field_policy_snapshot`, `duration_min`,
    `distance_km`, `note`, `created_at`, `sets`;
  - Historien-Set exakt `id`, `set_order`, `tracking_mode`, `reps`,
    `duration_sec`, `distance_m`, `weight_kg`, `assistance_kg`, `created_at`.
- Read-only und Cache:
  - rohe Callbackdaten werden in ein tief eingefrorenes Displaymodell
    projiziert; historische Labels, Equipment und Policies stammen aus
    Snapshots, die aktuelle Kartenidentität aus dem aktuellen Katalog;
  - Success und Empty werden pro Key und Mount bis `destroy` gecacht; Error nur
    nach explizitem Retry erneut angefragt;
  - Hidden-Mount ist request-frei; Open reconciliert vorhandene Items;
  - Remove/Re-Add nutzt den Cache und stellt keine neue Anfrage;
  - späte Settlements nach Remove, Close oder während Close-Guard sind
    cache-only; alte Generationen und Settlements nach Destroy werden
    verworfen;
  - Historienpatches ersetzen nur die jeweilige Historienregion und enthalten
    keine Inputs oder Checkboxen. Sie mutieren weder Draft noch Status/Fokus
    der aktuellen Eingabe.
- Fokus, Close und Races:
  - nur eine Shell pro Host und eine offene Shell pro Dokument;
  - Focus Trap umfasst `button`, `input`, `select`, `textarea`; Open-/Close-
    Rollbacks stellen Hintergrund, Overflow und Openerfokus wieder her;
  - alle Close-Routen laufen durch `requestClose`; pristine schließt direkt,
    dirty erzeugt einen tief eingefrorenen Confirmation-Context;
  - nur das exakte Ergebnis `true` verwirft; Discard geschieht vor Close;
  - gleichzeitige Close-Anfragen werden koalesziert; Cancel, Throw und
    Discardfehler lassen Shell, Draft, Timer und Fokus erhalten;
  - `destroy` ist idempotent, invalidiert Pending Confirmation/Lookup und ruft
    `discard` nie auf.

#### Vollständige R1-Strength-Feldpolicymatrix

- Catalog v2 besitzt `80` aktive Entries, davon `69` mit
  `tracking_mode: strength_sets`. Für alle Strength-Policies sind
  `duration_min` und `distance_km` verboten und `note` optional.

<!-- markdownlint-disable MD013 -->

| ID | Primärfeld | Lastfeld | Anzahl | Vollständige aktive Keymenge |
| --- | --- | --- | --- | --- |
| P1 | `reps required` | keine | 5 | `ab_wheel_rollout`, `bird_dog`, `box_jump`, `burpee`, `dead_bug` |
| P2 | `reps required` | `assistance_kg required` | 2 | `assisted_dip`, `assisted_pull_up` |
| P3 | `reps required` | `weight_kg optional` | 16 | `back_extension`, `calf_raise`, `crunch`, `dip`, `glute_bridge`, `glute_kickback`, `leg_raise`, `lunge`, `pull_up`, `push_up`, `russian_twist`, `sit_up`, `split_squat`, `squat`, `step_up`, `torso_rotation` |
| P4 | `duration_sec required` | keine | 5 | `battle_ropes`, `mountain_climber`, `plank`, `side_plank`, `wall_sit` |
| P5 | `reps required` | `weight_kg required` | 37 | `bench_press`, `bent_over_row`, `biceps_curl`, `chest_fly`, `chest_press`, `clean`, `clean_and_press`, `core_press`, `deadlift`, `decline_press`, `face_pull`, `front_raise`, `good_morning`, `hack_squat`, `high_row`, `hip_abduction`, `hip_adduction`, `hip_thrust`, `incline_press`, `kettlebell_swing`, `lat_pulldown`, `lateral_raise`, `leg_curl`, `leg_extension`, `leg_press`, `pallof_press`, `pullover`, `reverse_fly`, `romanian_deadlift`, `seated_row`, `shoulder_press`, `shrug`, `snatch`, `straight_arm_pulldown`, `total_abdominal`, `triceps_extension`, `upright_row` |
| P6 | `duration_sec required` | `weight_kg optional` | 1 | `dead_hang` |
| P7 | `distance_m required` | `weight_kg required` | 1 | `farmer_carry` |
| P8 | `distance_m required` | `weight_kg optional` | 2 | `sled_pull`, `sled_push` |

| Felddefinition | Scope/Typ | Untergrenze | Obergrenze | Weitere Grenze |
| --- | --- | --- | --- | --- |
| `reps` | Set / Integer / count | `1` | `1000` | keine Dezimalstellen |
| `duration_sec` | Set / Integer / s | `1` | `3600` | keine Dezimalstellen |
| `distance_m` | Set / Number / m | `0.1` | `10000` | maximal 2 Dezimalstellen |
| `weight_kg` | Set / Number / kg | `0.01` | `1000` | maximal 2 Dezimalstellen |
| `assistance_kg` | Set / Number / kg | `0.01` | `1000` | maximal 2 Dezimalstellen |
| `duration_min` | Item / Integer / min | `1` | `1440` | für Strength verboten |
| `distance_km` | Item / Number / km | `0.01` | `1000` | maximal 2 Dezimalstellen; für Strength verboten |
| `note` | Item / String | 1 Zeichen, wenn gesetzt | 500 Zeichen | `trim`; für alle Entries optional |

<!-- markdownlint-enable MD013 -->

- Aktive Non-Strength-Kontrollmenge:
  - `duration`: `cross_trainer`, `football`, `jump_rope`, `stair_climber`;
  - `duration_distance`: `cycling`, `hiking`, `rowing`, `running`, `ski_erg`,
    `swimming`, `walking`.
- Genau eine Primärmessung ist pro Strength-Set policy-aktiv. Last ist
  entweder `weight_kg`, inverse Unterstützung `assistance_kg` oder vollständig
  verboten; beide Lastfelder sind nie gleichzeitig aktiv.

#### Unveränderte numerische R2-Set-/Commitgrenze

- RPC-Vertrag nur read-only geprüft:
  `activity_v2_commit_session(p_request_id uuid, p_payload jsonb)` mit
  Payloadschema `midas.activity-session.v1`.
- Top-Level-Keys: `schema_version`, `catalog_version`, `started_at`, `ended_at`,
  `duration_min`, optional `title`, optional `note`, `items`.
- Itemkeys: `item_key`, `item_order`, optional `duration_min`, optional
  `distance_km`, optional `note`, `sets`.
- Setkeys exakt `set_order`, `reps`, `duration_sec`, `distance_m`, `weight_kg`,
  `assistance_kg`; nur `set_order` ist strukturell immer erforderlich, die
  Messwerte werden anschließend gegen die Feldpolicy validiert.
- Numerik ist in `data-access.js` und `sql/20_Activity_V2.sql` deckungsgleich:
  - Sessiondauer `1..1440` ganzzahlig;
  - Items `1..50`, `item_order` eindeutig und lückenlos `1..n`;
  - Strength-Sets `1..50`, Non-Strength-Sets exakt `0`, `set_order` eindeutig
    und lückenlos `1..n`;
  - `reps` ganzzahlig `1..1000`;
  - `duration_sec` ganzzahlig `1..3600`;
  - `distance_m` `0.10..10000.00`, maximal zwei Dezimalstellen;
  - `weight_kg` und `assistance_kg` jeweils `0.01..1000.00`, maximal zwei
    Dezimalstellen;
  - pro Set exakt eines aus `reps`, `duration_sec`, `distance_m`; niemals
    `weight_kg` und `assistance_kg` gemeinsam;
  - R1-Policy erzwingt required/optional/forbidden nach kanonischem Katalog.
- R5 darf diese Grenze in S2 als Ziel- und Akzeptanzgrenze lesen, aber weder
  `commitSession` aufrufen noch Commitnormalisierung, RPC oder SQL verändern.

#### CSS, Harness, Browser-Testbarkeit und Produktisolation

- `session-shell.css` umfasst `630` Zeilen und belegt den isolierten
  Fullscreenvertrag: fixed/inset, `100vh` plus `100dvh`, Safe Areas, sticky
  Header, eigener Scrollcontainer, `min-width: 0`, 44-px-Controls,
  `focus-visible`, Breakpoints `640px`/`350px` und Reduced Motion.
- R4-Historie besitzt eigene read-only Selektoren. R5-Seteditor-Selektoren und
  aktuelle Satzinputs fehlen erwartungsgemäß noch; R5 ist nicht implementiert.
- `session-shell-harness.html` umfasst `186` Zeilen, setzt einen Activity-V1-
  Sentinel und lädt ausschließlich lokale Semantics v1/v2, Draft, Shell und
  CSS. Es exportiert den echten Draft/Shell unter
  `activityV2SessionHarness` und macht Lookupzähler browserautomatisierbar.
- Deterministische Harnesszustände: `bench_press` spät erfolgreich,
  `ski_erg` leer, `total_abdominal` Fehler, `high_row` mit langem historischem
  Text; weitere Keys werden aus der realen Policy erzeugt.
- Der Contracttest prüft CSS/Harness, fehlende Produkt-/Persistenz-/Netzwerk-
  und unsichere DOM-Pfade sowie das Fehlen des Shell-Loads in `index.html`.
- Ein echter Browser-Smoke wurde in S1 nicht vorgezogen. Die vorhandene
  Testbarkeit ist statisch und durch Contracttest belegt; Viewport- und
  Background-Smokes bleiben die vorgesehenen S5-Gates T-ACT-R5-11/-12.

### S1-Technische Ableitungen

- Die neue Draftversion ist eine koordinierte Contractänderung. Draft,
  Shellkonstanten/-validator, fünf Shell-Testfassaden und der direkte C2-
  Integrationstest müssen gemeinsam betrachtet werden; eine isolierte
  `session-draft.js`-Änderung wäre unvollständig.
- Die R1-/R2-Zahlenlimits sind eine Akzeptanzgrenze für den flüchtigen Editor,
  aber keine Erlaubnis, den R2-Commitpfad wiederzuverwenden oder aufzurufen.
- Weil R2 nur vollständig policy-gültige Zahlen akzeptiert, R5 aber leere und
  teilweise Nutzereingaben halten muss, benötigt S2 einen expliziten
  Draft-/Eingabevertrag. Seine Keys oder Parserrepräsentation werden in S1
  bewusst nicht erfunden.
- Die historische R4-Projektion darf nicht als Editorquelle dienen. Der R5-
  Editor muss als eigener aktueller DOM-/Draftpfad neben, nicht innerhalb, der
  Historienprojektion entstehen.
- Fehlende Produktverdrahtung ist der beabsichtigte Iststand und kein Defekt:
  R5 bleibt bis zu den späteren vorgesehenen Gates isoliert.

### S1-Contract-Review und Korrektur

- Pflichtlesereihenfolge: `PASS`; alle aktiven Quellen und die relevanten
  archivierten R2-/R3-/R4-Vertragsblöcke wurden gegen den realen Code geprüft.
- Draft-/Consumervertrag: `PASS` nach Korrektur `F-ACT-R5-08`.
- R4-Suche/Historie/Lifecycle: `PASS`; keine Vorbefüllung, keine Draftmutation,
  kein ungeschütztes Late-Settlement gefunden.
- R1-Policy und R2-Numerik: `PASS`; acht reale Strength-Kombinationen und alle
  Grenzen sind deckungsgleich belegt.
- Isolation und Scope: `PASS`; kein Activity-V1-/`index.html`-/SQL-/RPC-/
  Storage-/Deploy-Delta und kein R6-/R7-/R8-/R11-/R13-Vorgriff.
- Quellenwiderspruch oder neue Produktentscheidung: `none`.
- Finding `F-ACT-R5-08`: `fixed`; S4.1 nennt nun die realen koordinierten
  Consumer und Testdoubles explizit. Keine Masterplan-Korrektur war erforderlich.
- Offene In-Scope-Findings: `none`.
- Doku-Sync: regulär S6; in S1 keine weitere Source-of-Truth-Änderung.
- S1-Abnahme: `PASS`.
- Stop: S2 wurde nicht begonnen. Nächstes erlaubtes Gate ist S2.

Exit:

- R3-/R4-Consumer und R1-/R2-Grenzen sind vollständig belegt.
- Kein ungeklärter Ist-Zustand blockiert S2.

## S2 - Fachlicher und technischer Zielvertrag

Reasoning: `GPT-5.6 Sol / Extra High`.

Deterministisch:

1. Produktvertrag aus Decision Log und Masterplan bestätigen.
2. Exakte neue Draft-Schema-ID festlegen. Erwartete Richtung ist
   `midas.activity-session-draft.v2`; eine Abweichung benötigt ein Finding mit
   belegtem Grund.
3. Exakte Item- und Satzrepräsentation festlegen:
   - jedes Item erhält eine exakte `sets`-Grenze;
   - Strength-Items starten mit drei leeren geordneten Zeilen;
   - Non-Strength-Items bleiben für R6 erhalten, ohne Strength-Felder;
   - Setfelder entsprechen sprechend der R2-Grenze
     `reps`, `duration_sec`, `distance_m`, `weight_kg`, `assistance_kg`;
   - vorübergehend unvollständige Nutzereingaben müssen ohne zweite
     divergierende Wahrheit abbildbar sein.
4. Exakte Draft-API festlegen. Erwartete additive Operationen sind semantisch:
   - Satz anhängen;
   - Satz entfernen und reindizieren;
   - einzelnes erlaubtes Satzfeld ändern;
   - bestehende Methoden bleiben erhalten.
   Namen, Optionskeys, Rückgaben, No-op und Fehlercodes werden vor S4 exakt
   dokumentiert und getestet.
5. Eingabe- und Normalisierungsvertrag einfrieren:
   - Leerwert;
   - erlaubte Zwischenzustände beim Tippen;
   - Komma/Punkt;
   - Integer-/Dezimalregeln;
   - Feldpolicy, Min/Max und maximale Dezimalstellen;
   - sicherer Fehler ohne rohe Eingabe oder Interna.
6. Zeilen- und Itemvalidierung einfrieren:
   - `empty`, `partial`, `complete` und `invalid`;
   - vollständiges Präfix plus leere nachlaufende Zeilen;
   - mindestens ein vollständiger Satz erst als spätere Save-Voraussetzung;
   - R5 zeigt Validität, ruft aber keinen Save auf.
7. UI-Vertrag festlegen:
   - Übungsidentität und R4-Historie;
   - sichtbare Policyfelder und deutsche Labels;
   - drei nummerierte Eingabezeilen;
   - Icon/Command für Hinzufügen und Entfernen mit Tooltips/ARIA;
   - kompakte Fehlermeldung ohne dauerndes Erfolgsrauschen;
   - Non-Strength-Handoff an R6.
8. Lifecycle festlegen:
   - Reorder, Remove, Re-Add, Discard und Destroy;
   - Fokus nach Add/Remove;
   - Input während Background-Tabwechsel;
   - R4-Lookupsettlement darf aktuelle Eingaben nicht überschreiben.
9. Scope-Freeze und R6-R8-Handoff finalisieren.
10. S2-Contract-Review durchführen, Findings korrigieren, Decision Log und
    Resume Card mit dem exakten technischen Vertrag ergänzen.

Ergebnis:

### S2-Finaler Draftvertrag

#### Schema und Snapshotform

- Neue Schema-ID exakt: `midas.activity-session-draft.v2`.
- Top-Level-Keys und ihre Bedeutung bleiben gegenüber R3 exakt erhalten:
  `draft_schema_version`, `request_id`, `catalog_version`, `revision`,
  `started_at`, `note`, `items`. Nur Schema-ID und Itemform ändern sich.
- Jedes Item besitzt ab Draft v2 exakt:

```text
item_key
item_order
sets
```

- Jedes Strength-Set besitzt exakt:

```text
set_order
reps
duration_sec
distance_m
weight_kg
assistance_kg
```

- Typgrenze:
  - `set_order`: sichere Ganzzahl, lückenlos `1..n`;
  - jedes Messfeld: exakt `null` oder String;
  - Stringlänge: maximal `32` Unicode-Codepoints;
  - `''` wird durch die Mutations-API kanonisch zu `null`;
  - nichtleere Strings werden byte-/zeichengetreu erhalten, nicht getrimmt,
    gerundet oder auf Punktnotation umgeschrieben.
- Strength-Item:
  - `sets.length` immer `1..50`;
  - `addItem` erzeugt atomar genau drei Sets, alle Messfelder `null`;
  - alle fünf Messfeldkeys sind vorhanden; policy-verbotene Felder müssen
    `null` bleiben.
- Non-Strength-Item:
  - Itemform ebenfalls exakt mit `sets`;
  - `sets` ist exakt `[]`;
  - keine Strength-Zeile, keine R6-Werte und kein vorgezogenes Alternativschema.
- Nicht im Snapshot vorhanden:
  - kein `status`, `complete`, `completed_at`, `is_done` oder Satzzeitpunkt;
  - keine `_raw`-/`normalized`-Doppelkeys;
  - keine Feldpolicy-, Label-, Equipment-, History- oder Zielwertkopie;
  - keine Itemnotiz und keine RPE-/1RM-/Satztypkeys.
- Semantikbindung:
  - der private Katalogzustand validiert und hält pro Key mindestens Status,
    `tracking_mode` und Feldpolicy für die eingefrorene `catalog_version`;
  - Strength-/Non-Strength-Initialisierung und erlaubte Setfelder werden daraus,
    niemals aus hartcodierten Itemkeys, abgeleitet;
  - eine inkonsistente injizierte Semantik bleibt `INVALID_CATALOG`.
- Bestehende R3-Invarianten bleiben:
  - tiefe Immutability;
  - stabile `request_id` und `started_at` bis Discard;
  - exakt eine Revision pro erfolgreicher echter Mutation;
  - identische Mutation ist No-op mit identischer Snapshotreferenz;
  - Fehler sind atomar und erhalten den vorherigen Snapshot;
  - `discard` erzeugt eine neue Request-ID und einen pristine Draft-v2-Snapshot
    mit Revision `0`, `started_at: null`, `note: null`, `items: []`.

#### Öffentliche Draft-API

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
```

- Bestehende sieben Methoden behalten Argumente, Rückgaben, No-op-, Timer-,
  Revisions-, Fehler- und Discardsemantik.
- `addSet(itemKey)`:
  - nur für ein im Draft vorhandenes Strength-Item;
  - hängt genau ein leeres Set an und vergibt `set_order = length + 1`;
  - bei 50 Sets atomarer Fehler `SET_LIMIT_REACHED`;
  - erfolgreiche Mutation gibt den neuen tief eingefrorenen Snapshot zurück.
- `removeSet(itemKey, setOrder)`:
  - nur für ein vorhandenes Strength-Set;
  - entfernt genau diese Zeile und reindiziert alle folgenden lückenlos;
  - bei nur einer verbleibenden Zeile atomarer Fehler
    `SET_MINIMUM_REACHED`;
  - erfolgreiche Mutation gibt den neuen Snapshot zurück.
- `setSetField(itemKey, setOrder, fieldKey, value)`:
  - `fieldKey` ist exakt einer der fünf Setmessfeldkeys;
  - nur laut aktueller Entry-Policy `required` oder `optional` ist mutierbar;
  - `value` muss ein String mit maximal 32 Unicode-Codepoints sein;
  - `''` setzt das Feld auf `null`, jeder andere String bleibt exakt erhalten;
  - numerisch ungültiger, aber typ-/längengültiger Rohtext ist eine
    erfolgreiche Draftmutation und wird erst als `invalid` abgeleitet;
  - gleicher kanonischer Rohwert ist No-op ohne Revision;
  - erfolgreiche Mutation gibt den neuen Snapshot zurück.
- Gemeinsame Set-Fehlercodes neu und exakt:
  - `SETS_UNAVAILABLE`: vorhandenes Item ist nicht `strength_sets`;
  - `INVALID_SET_ORDER`: Order ist keine sichere Ganzzahl in `1..50`;
  - `SET_NOT_FOUND`: Item besitzt diese gültige Order nicht;
  - `SET_LIMIT_REACHED`: Append bei bereits 50 Sets;
  - `SET_MINIMUM_REACHED`: Remove bei nur einer sichtbaren Zeile;
  - `INVALID_SET_FIELD`: Fieldkey ist kein bekannter Setmessfeldkey;
  - `FORBIDDEN_SET_FIELD`: bekannter Fieldkey ist für das Item verboten;
  - `INVALID_SET_VALUE`: Wert ist kein String oder länger als 32 Codepoints.
- Validierungs- und Fehlerpräzedenz ist fail-closed und exakt:

  1. Itemkey formal validieren;
  2. Item im Draft finden;
  3. `strength_sets` bestätigen;
  4. methodenspezifisch Order, Existenz, Fieldkey, Policy und Wert validieren;
  5. Min-/Max-Setgrenze prüfen;
  6. kanonischen No-op vor der Revisionsgrenze erkennen;
  7. Revisionsgrenze prüfen und erst danach den neuen Snapshot bauen.

- Bestehende Fehler werden wiederverwendet:
  - `INVALID_ITEM_KEY` für formal ungültigen Itemkey;
  - `ITEM_NOT_FOUND` für einen nicht im Draft vorhandenen Itemkey;
  - `INVALID_CATALOG` für inkonsistente Semantik/Policy;
  - `REVISION_LIMIT_REACHED` vor jeder echten Setmutation.
- Fehlerobjekte behalten den vorhandenen sicheren generischen R3-Text; weder
  Rohwert, Itemkey, Feldname noch interne Exception werden in `message`
  interpoliert.

### S2-Finaler Eingabe- und Parservertrag

- Quelle der Wahrheit ist immer der Draft-Rohstring. Die Shell hält keinen
  zweiten Rohwertpuffer und rekonstruiert jedes Input bei Full Render aus dem
  Snapshot.
- Leerwert:
  - DOM `value === ''` ruft `setSetField(..., '')` auf;
  - Draftwert wird `null`;
  - `null` rendert wieder als `''`.
- Zeichenraum:
  - nur ASCII-Ziffern `0..9` sind numerisch;
  - Dezimaltrenner ist entweder genau ein `,` oder genau ein `.`;
  - Vorzeichen, Exponentialnotation, Gruppierung, Whitespace, Unicode-Ziffern,
    `NaN`, `Infinity` und gemischte Trenner sind ungültig;
  - ein führender Dezimaltrenner ist ungültig; `0,5` beziehungsweise `0.5`
    ist die eindeutige Schreibweise.
- Integerfelder `reps` und `duration_sec`:
  - vollständige Syntax exakt `^[0-9]+$`;
  - keine Dezimal- oder anderen Zwischenzustände außer leer;
  - nach Syntaxcheck `Number`, `Number.isSafeInteger` und R1-Min/Max prüfen.
- Dezimalfelder `distance_m`, `weight_kg`, `assistance_kg`:
  - vollständige Syntax besteht aus mindestens einer Ziffer und optional
    einem Trenner mit `1..max_decimals` folgenden Ziffern;
  - erlaubter Zwischenzustand exakt mindestens eine Ziffer plus abschließendes
    Komma oder Punkt, zum Beispiel `77,` oder `77.`;
  - erst nach vollständigem Syntaxcheck wird Komma intern zu Punkt projiziert
    und genau einmal `Number` aufgerufen;
  - Wert muss endlich sein und innerhalb R1-Min/Max liegen;
  - es wird nie gerundet, abgeschnitten oder in den Draft zurückformatiert.
- Führende Nullen sind zulässig und ändern den Rohtext nicht; `0001` wird für
  die Validität als Zahl `1` gelesen. Mehr als die erlaubten Dezimalstellen
  bleibt ungültig und wird nicht still korrigiert.
- Feldparser liefert intern nur ein abgeleitetes Ergebnis aus
  `empty`, `intermediate`, `valid`, `invalid` plus bei `valid` den numerischen
  Wert. Dieses Ergebnis ist weder Snapshotfeld noch öffentliche Draft-API.
- Fehlergründe für die UI sind kontrolliert:
  - Integerformat: `Nur ganze Zahlen eingeben.`;
  - Dezimalformat: `Ziffern mit optionalem Komma oder Punkt eingeben.`;
  - Dezimalstellen: `Maximal {max_decimals} Nachkommastellen.`;
  - Bereich: `Erlaubter Bereich: {min} bis {max}.`;
  - Min/Max werden ohne Gruppierung und in deutscher Anzeige mit Komma
    formatiert; die sichtbare Feldbezeichnung trägt bereits die Einheit;
  - der eingegebene Rohwert wird nie in Fehlermeldungen wiederholt.

### S2-Finaler Validitätsvertrag

<!-- markdownlint-disable MD013 -->

| Ebene/Zustand | Exakte Bedingung | Wirkung |
| --- | --- | --- |
| Feld `empty` | Draftwert `null` | keine behauptete Messung |
| Feld `intermediate` | nur der definierte dezimale trailing-Separator-Zustand | editierbar, nicht vollständig, keine Zahl gespeichert |
| Feld `valid` | vollständige Syntax, Typ, Dezimalstellen und R1-Min/Max gültig | darf Required/Optional erfüllen |
| Feld `invalid` | jeder andere nichtleere Rohtext oder Verletzung von Typ/Dezimalstellen/Grenze | sichtbarer sicherer Feldfehler |
| Row `empty` | alle policy-erlaubten Felder `empty` | Platzhalter, kein ausgeführter Satz |
| Row `invalid` | mindestens ein erlaubtes Feld `invalid` | nicht später speicherbar |
| Row `complete` | jedes Required-Feld `valid`; jedes Optional-Feld `empty` oder `valid` | tatsächlich dokumentierter Satz |
| Row `partial` | weder empty, invalid noch complete; insbesondere Intermediate oder fehlendes Required bei sonstigem Input | sichtbar unvollständig |
| Item `empty` | alle Rows `empty` | keine aktuelle Leistung dokumentiert |
| Item `invalid` | mindestens eine invalid Row oder eine empty Row vor einer späteren nichtleeren Row | Feldfehler oder Lücke sichtbar |
| Item `partial` | nicht empty/invalid/complete und mindestens eine partial Row | aktuelle Eingabe noch unvollständig |
| Item `complete` | mindestens eine complete Row als lückenloses Präfix, danach ausschließlich empty Rows | einzige spätere Save-ready-Form |

<!-- markdownlint-enable MD013 -->

- Status wird bei jedem Snapshotread aus Entry-Policy und Rohwerten neu
  abgeleitet. Er erhöht keine Revision und wird nicht eingefroren gespeichert.
- Policy-verbotene Felder sind kein Rowzustand: Sie müssen im validen Snapshot
  `null` sein; andernfalls verwirft der Shellvalidator den Draft fail-closed als
  `INVALID_DRAFT_STATE`.
- Ein optionales Lastfeld darf leer sein. Ist es nicht leer, muss es vollständig
  gültig sein; sonst ist die Row partial oder invalid.
- Lückenregel exakt: Sobald eine empty Row vorkommt, macht jede spätere
  partial, invalid oder complete Row das Item `invalid`. Leere Tails nach einem
  Complete-Präfix sind dagegen erlaubt.
- R5 besitzt weder Session-Save-Button noch Save-API. `Item complete` ist nur
  sichtbare, getestete Vorbedingung für den späteren R8-Handoff.

### S2-Finaler UI-Vertrag

- Strength-Karte:
  - aktuelle Übungsidentität aus dem aktuellen Catalog-v2-Entry;
  - R4-Historienregion bleibt unverändert separat und read-only;
  - danach eigener aktueller Editor mit nummerierten Zeilen `Satz 1..n`;
  - initial exakt drei leere Zeilen, keine visuelle Sonderrolle für Satz drei.
- Policy-gesteuerte Felder und Labels exakt:
  - `reps` -> `Wiederholungen`;
  - `duration_sec` -> `Dauer (Sek.)`;
  - `distance_m` -> `Distanz (m)`;
  - `weight_kg` -> `Gewicht (kg)`;
  - `assistance_kg` -> `Unterstützung (kg)`.
- Nur `required`- und `optional`-Setfelder werden gerendert. Verbotene Felder
  erzeugen weder sichtbares Input noch Placeholder oder verstecktes Formfeld.
- Inputs:
  - `type="text"`;
  - `inputmode="numeric"` für Integerfelder;
  - `inputmode="decimal"` für Dezimalfelder;
  - sichtbares oder programatisch eindeutig zugeordnetes Label pro Feld und
    Satz; Fehlermeldung über `aria-describedby`;
  - kein historischer Wert in `value`, `placeholder`, `defaultValue` oder
    Autofill-Hilfe.
- Aktionen:
  - `data-action="add-set"`, sichtbare Copy `+ Satz`, ARIA/Tooltip
    `Satz hinzufügen`; bei 50 Sets disabled;
  - `data-action="remove-set"`, ARIA/Tooltip
    `Satz {set_order} entfernen`; bei einer Zeile disabled;
  - beide tragen `data-item-key`; Remove zusätzlich `data-set-order`;
  - Set-Remove und bestehendes Item-Remove bleiben verschiedene Controls,
    Actions und zugängliche Namen.
- Zustandsanzeige:
  - Row und Editor erhalten maschinenprüfbares `data-state` mit dem
    abgeleiteten Zustand;
  - Empty und Complete erzeugen kein dauerndes Erfolgsrauschen;
  - Partial-Copy kompakt `Satz unvollständig.`;
  - Gap-Copy exakt `Leere Sätze sind nur am Ende erlaubt.`;
  - Invalid zeigt die kontrollierte feldspezifische Parsercopy;
  - keine Copy behauptet Save oder Speicherung.
- Non-Strength-Item:
  - Suchauswahl und R4-Historie bleiben sichtbar;
  - kein Strength-Editor;
  - neutraler Hinweis `Die Eingabe für diese Aktivität wird in diesem Editor noch nicht unterstützt.`;
  - keine sichtbare Roadmap-, R6- oder technische Schema-Sprache.

### S2-Finaler Lifecyclevertrag

- Input:
  - jedes Set-Inputevent ruft zuerst `setSetField` mit dem aktuellen DOM-String
    auf;
  - bei Erfolg ist der Draft sofort kanonisch; danach werden nur Row-/Itemstate,
    ARIA und Fehlercopy gepatcht, kein Full Render und kein Caretreset;
  - bei API-Fehler wird das Input aus dem unveränderten Snapshot restauriert,
    die sichere Meldung `Die Satzeingabe konnte nicht aktualisiert werden.`
    gesetzt und die Revision bleibt gleich.
- Add/Remove:
  - `addSet` rendert aus dem neuen Snapshot und fokussiert das erste sichtbare
    Feld der neuen letzten Zeile;
  - `removeSet` rendert und fokussiert das erste sichtbare Feld der nun an
    derselben Position stehenden Zeile, sonst der neuen letzten Zeile;
  - bei nur einer Zeile bleibt Remove disabled; kein Fokus fällt ins Dokument.
  - erfolgreiche Set-Add-/Remove-/Inputaktionen erzeugen keine globale
    Erfolgsmeldung; Fehlercopy ist `Satz konnte nicht hinzugefügt werden.`,
    `Satz konnte nicht entfernt werden.` beziehungsweise die Inputmeldung oben.
- Item-Reorder erhält alle Setrohwerte und -orders innerhalb des Items; nur
  `item_order` ändert sich nach bestehendem R3-Vertrag.
- Item-Remove entfernt den gesamten aktuellen Setzustand. Re-Add desselben
  Strength-Keys erzeugt wieder genau drei leere Zeilen; R4-History darf aus dem
  Mountcache wieder erscheinen, bleibt aber getrennt.
- Full Render und Reopen lesen Inputs ausschließlich aus dem Draft. Timer-
  Refresh und `visibilitychange` patchen keine Setinputs; Backgroundwechsel
  verliert deshalb weder Rohwerte noch Zeilen.
- Ein R4-Lookupsettlement patcht weiterhin nur seine Historyregion. Success,
  Empty, Error, Retry, Late Remove, Close-Guard und Destroy können aktuelle
  Setinputs weder setzen noch ersetzen.
- Dirty Close umfasst auch leere Standardzeilen, weil schon das Hinzufügen des
  Items die Revision erhöht. Der bestehende Confirmation-/Discardvertrag bleibt
  unverändert; Discard erzeugt den pristine Draft v2 vor Close.
- `destroy` ruft weiterhin kein Discard auf, ändert den Draft nicht und
  invalidiert alle lokalen DOM-/Lookup-/Confirmationpfade.

### S2-Scope-Freeze und Handoff

- R5 implementiert nur Draft-v2-Rohwerte, abgeleitete Validität und isolierte
  Strength-UI. Es gibt keine Normalisierungs-, Payload- oder Save-API.
- R6 erhält Non-Strength-Items mit `sets: []`; R5 erfindet keine Duration- oder
  Distance-Itemwerte. Eine spätere Snapshotform ist erneut explizit zu
  versionieren.
- R7 darf den dann bewiesenen Draftvertrag als Recoveryquelle behandeln; R5
  baut weder Storage noch Recoverylogik vor.
- R8 besitzt die spätere Grenze, nur den vollständigen Setpräfix zu numerischen
  R2-Werten zu normalisieren, leere Tails auszulassen und `commitSession`
  aufzurufen. R5 nimmt diese Umsetzung nicht vorweg.
- R11 bleibt alleiniger Produktcutover. Activity V1 und `index.html` bleiben in
  R5 unverändert.

### S2-Contract-Review

- Produktvertrag gegen Decision Log und Masterplan: `PASS`.
- Schema-ID und exakte Snapshotform: `PASS`; erwartete v2-Richtung bestätigt,
  keine Abweichung und keine stillen Zusatzkeys.
- API, Fehler, No-op, Revision und Atomizität: `PASS`.
- Parser gegen alle acht R1-Strength-Policies und unveränderte R2-Zahlen:
  `PASS`; Rohtext und abgeleitete Zahl sind eindeutig getrennt.
- Empty-/Partial-/Complete-/Invalid- und Präfixvertrag: `PASS`.
- R4-History-, Fokus-, Close-, Timer-, Cache- und Raceguardkompatibilität:
  `PASS` als Zielvertrag; Bruchrisikoanalyse folgt erst in S3.
- Scope R6-R8/R11: `PASS`; nur Handoff, keine Implementierung vorgezogen.
- Quellenwiderspruch, neue Produktentscheidung oder offenes Owner-Gate: `none`.
- Neue Findings: `none`; bestehendes `F-ACT-R5-08` bleibt fixed.
- Code-/Testinvalidierung in S2: `none`, weil nur die Roadmap geändert wurde;
  die frische S1-Baseline bleibt gültig.
- Größenprüfung: Roadmap darf den Richtwert überschreiten; der neue Block
  enthält den einmaligen ausführbaren S2-Vertrag und wird nicht verlustbehaftet
  kompaktiert.
- S2-Abnahme: `PASS`.
- Stop: S3 wurde nicht begonnen. Nächstes erlaubtes Gate ist S3.

Owner-Briefing:

- Der lokale Draft bekommt Version 2, weil seine Itemform erstmals Satzzeilen
  enthält. Das ist ein Bearbeitungsformat im Arbeitsspeicher, keine Änderung
  am Datenbank- oder Commitformat.
- Drei leere Zeilen enthalten nur `null`-Felder. Sie erleichtern die Eingabe,
  behaupten aber keine ausgeführte Leistung und werden später nicht als Sets
  übernommen.
- `77,5` bleibt beim Tippen als genau dieser Rohtext erhalten. Der Validator
  liest daraus kontrolliert `77.5`; erst R8 darf daraus denselben bestehenden
  R2-Zahlenwert für einen Commit bauen. R2 selbst bleibt unverändert.

Exit:

- `PASS`; S4 kann nach S3 und S4R ohne erfundene API-, Parser- oder UI-
  Entscheidung geplant werden.

## S3 - Bruchrisiko-, Security- und Umsetzungsreview

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. Datenverlust und falsche Leistungsbehauptung prüfen:
   - leere Defaults als abgeschlossen;
   - alte History als aktuelle Werte;
   - Inputwert im DOM, aber nicht im Draft;
   - Wertverlust bei Render, Reorder, Background oder Lookupsettlement.
2. Parser- und Zahlenrisiken prüfen:
   - Komma, Punkt, führende/trailing Separatoren;
   - `0`, negative Werte, Exponentialnotation, `NaN`, Infinity;
   - Dezimalstellen, Min/Max, Rundung und versteckte Typkonvertierung.
3. Policyrisiken für jede Strength-Kombination prüfen:
   - Pflicht-/Optional-/Forbidden-Felder;
   - Primärmessung und Lasttyp;
   - Assistance darf nie als positives Zusatzgewicht semantisch umgedeutet
     werden.
4. Lifecycle und Race prüfen:
   - Full Render während aktiver Eingabe;
   - Fokus nach Satzmutation;
   - Close-/Discard-Guard;
   - späte Historienantwort;
   - Destroy und wiederholtes Mount/Open.
5. API-/Snapshotbruch prüfen:
   - alle exakten R3-/R4-Validatoren und Testdoubles;
   - Schema-ID und Scriptreihenfolge;
   - Immutability, atomare Mutation und Revisionsgrenze.
6. UX und Accessibility prüfen:
   - Android-Tastatur;
   - 320px Breite, lange Labels und vierstellige Werte;
   - Touchziele, Labels, Fehlermeldungen und Screenreader-Zuordnung;
   - Entfernen ohne versehentliches Itemlöschen.
7. Isolation und Security prüfen:
   - kein Netzwerk, Storage, SQL, RPC oder Produktload;
   - keine unsichere `innerHTML`-Interpolation;
   - keine rohen Eingaben in Diagnose oder Fehlertext.
8. Rollback- und Invalidation Map festlegen.
9. S4-Schnitt und zusammenlegbare Ausführungsblöcke ableiten.
10. S5-Testmatrix mit stabilen IDs einfrieren.
11. S3-Contract-Review durchführen, Findings korrigieren und Resume Card
    ersetzen.

Ergebnis:

### S3-Risikoregister

<!-- markdownlint-disable MD013 -->

| ID | Severity | Risiko | Reale Angriffs-/Fehlerfläche | Abschluss / Zuordnung |
| --- | --- | --- | --- | --- |
| R-ACT-R5-01 | P0 | Drei leere Defaults werden als reale Sätze behauptet. | Strength-Add erzeugt drei sichtbare Rows. | Geschlossen durch `null`-Initialisierung, ungespeicherten Status und Complete-Präfixregel; T-03/T-07. |
| R-ACT-R5-02 | P0 | R4-History wird aktuelle Leistung oder Vorbefüllung. | History und Editor stehen in derselben Itemkarte. | Geschlossen durch getrennte DOM-Regionen, keine Historywerte in Input/Placeholder und cache-only Late Settlements; T-08. |
| R-ACT-R5-03 | P1 | DOM zeigt einen Wert, den Draft/Recovery nicht kennt. | Inputevents und Full Render können auseinanderlaufen. | Geschlossen durch Draft-first Input, unveränderten Rohstring und gezielten Statepatch statt Full Render; T-06/T-09/T-12. |
| R-ACT-R5-04 | P1 | Bestehende Sets gehen bei Note, Add oder Item-Reorder verloren. | R3-`createSnapshot` rekonstruiert heute aus Itemkeylisten. | `F-ACT-R5-09` fixed; vollständige Item-/Setrecords in S4.1, Erhaltungstests T-02/T-04/T-09. |
| R-ACT-R5-05 | P1 | Komma, Punkt oder JS-Coercion erzeugt einen anderen Zahlenwert. | Textinput, `Number`, Dezimalstellen, Min/Max. | Geschlossen durch lexikalischen Check vor einmaligem `Number`, kein `parseFloat`, keine Rundung; T-06. |
| R-ACT-R5-06 | P1 | Falsches Policyfeld oder Assistance als Zusatzgewicht. | Acht Strength-Policies, Required/Optional/Forbidden. | Geschlossen durch aktuelle Entry-Policy, eigene Assistance-Copy und vollständige Policymatrix; T-05/T-07. |
| R-ACT-R5-07 | P1 | Pending Close verwirft noch nachträglich eingegebene R5-Setwerte. | `closeGuardPromise` hält DOM offen und blockiert heute nur Lookup-Reconcile. | `F-ACT-R5-10` fixed; nur neue Setinputs/-aktionen bis Guardende disabled, T-09. |
| R-ACT-R5-08 | P1 | Full Render, Backgroundtimer oder Lookupsettlement überschreibt Inputs/Fokus. | Shell baut Itemliste vollständig neu; Timer und Lookup patchen asynchron. | Inputpfad ohne Full Render; Timer nur Timertext; Lookup nur Historyregion; T-08/T-09/T-12. |
| R-ACT-R5-09 | P1 | Draft-v2 bricht exakte R3-/C2-Consumer unkoordiniert. | Schema-ID, Itemkeys, zehn Methoden, fünf Draftfassaden und direkter C2-Test. | Block A/S4.1 als koordinierte Grenze; `F-ACT-R5-08`, T-01 bis T-04/T-09/T-13. |
| R-ACT-R5-10 | P2 | Mobile Autofill, Spell-Correction, lange Werte oder 320px-Layout erzeugen stale/unerreichbare Eingaben. | Textinputs, Android-Tastatur, Itemgrid. | `F-ACT-R5-11` fixed; DOM-Attribute in S4.2/3, Responsive-/Touchprüfung in S4.4; T-10/T-11. |
| R-ACT-R5-11 | P1 | Rohwert gelangt in HTML, Fehler, Log oder Diagnose. | Ungültige Strings dürfen im Draft existieren. | Nur `.value`/`textContent`, kontrollierte Copy, keine Interpolation/`innerHTML`; T-06/T-10/T-13. |
| R-ACT-R5-12 | P1 | R5 zieht Netzwerk, Storage, Commit oder Produktload ein. | Shell/Harness und mögliche Data-Access-Wiederverwendung. | Geschützte Zonen plus statischer Isolationstest; T-01/T-13. |

<!-- markdownlint-enable MD013 -->

- Blockierende Risiken nach Korrektur: `none`.
- Offene In-Scope-P0/P1-Risiken: `none`.
- Zugeordnete Implementierungsrisiken: R-ACT-R5-04/-07/-09/-10 mit exakten
  S4-Substeps und Pflichtchecks; sie benötigen keine neue Produktentscheidung.

### S3-Datenverlust- und Leistungsreview

- Empty Defaults:
  - alle fünf Messfelder sind `null`;
  - Row-/Itemstatus wird nur abgeleitet;
  - kein Default kann ohne gültige Required-Werte `complete` werden;
  - leere Tails werden in R5 nie als Satzanzahl oder Leistung bezeichnet.
- History:
  - aktuelle Inputs werden ausschließlich aus Draft-v2-Setrecords erzeugt;
  - historische Werte erscheinen weder in `value`, `defaultValue`,
    `placeholder` noch Autofill-Metadaten;
  - R4-Projektion bleibt tief eingefroren und textbasiert.
- DOM/Draft:
  - jeder typ-/längengültige Rohstring wird vor Statecopy in den Draft
    geschrieben, auch wenn sein Zahlenformat `invalid` ist;
  - ein API-Fehler restauriert das Input aus dem unveränderten Snapshot;
  - Setinput darf den heutigen `runDraftAction`-Pfad nicht verwenden, weil
    dessen sofortiger Full Render Caret und aktiven Rohwert ersetzen würde.
- Snapshot-Rebuild:
  - die heutigen `itemKeys`-Zwischenarrays in `addItem`, `removeItem`,
    `moveItem` und `setNote` sind für Draft v2 unzulässig;
  - `createSnapshot` erhält vollständige interne Itemrecords; unveränderte
    bereits gefrorene Records/Setarrays dürfen sicher strukturell geteilt
    werden, während der geänderte Pfad copy-on-write neu entsteht;
  - `moveItem` verschiebt Records, `setNote` übernimmt alle Records, `addItem`
    ergänzt einen Record, `removeItem` entfernt genau einen; notwendige neue
    `item_order`-/`set_order`-Records behalten ihre bestehenden Setrohwerte;
  - Remove/Re-Add und Discard bleiben die einzigen beabsichtigten Pfade, die
    den betreffenden Setzustand löschen.

### S3-Parser- und Zahlenreview

<!-- markdownlint-disable MD013 -->

| Eingabe | Erwartung | Begründung |
| --- | --- | --- |
| `''` | `empty`, Draft `null` | kanonischer Leerwert |
| `77`, `77,5`, `77.5`, `77,50`, `0001` | nach R1-Grenze `valid` | vollständige kontrollierte Syntax |
| `77,`, `77.` | `intermediate`, Row `partial` | einziger erlaubter Tipp-Zwischenzustand |
| `,5`, `.5` | `invalid` | führender Trenner verboten; eindeutige Form `0,5`/`0.5` |
| `1,2.3`, `1.2,3`, `1,000` | `invalid` | gemischter/mehrfacher Trenner oder mehr als zwei Dezimalstellen |
| `0`, `0,00` | syntaktisch vollständig, wegen R1-Min `invalid` | keine Nullleistung als gültiges Setfeld |
| `-1`, `+1` | `invalid` | Vorzeichen verboten |
| `1e2`, `NaN`, `Infinity` | `invalid` vor `Number` | keine Exponential-/Sonderzahlkonvertierung |
| Whitespace oder Unicode-Ziffern | `invalid` | keine stille Trim-/Locale-Coercion |
| mehr als 32 Codepoints | atomarer `INVALID_SET_VALUE` | Draftressourcen und DOM bleiben begrenzt |
| Min/Max exakt | `valid` | inklusive R1-Grenze |
| knapp außerhalb Min/Max | `invalid`, keine Rundung | keine versteckte Korrektur |

<!-- markdownlint-enable MD013 -->

- Integerfelder prüfen nach Regex zusätzlich `Number.isSafeInteger`.
- Dezimalfelder prüfen `max_decimals` aus den R1-Definitionen; derzeit sind
  es für alle drei Dezimal-Setfelder zwei, aber der Parser hardcodiert dies
  nicht pro Item.
- Nur der Validierungswert normalisiert Komma zu Punkt. Der Draftrohwert bleibt
  exakt und wird nicht als bereits normalisierter R2-Wert ausgegeben.

### S3-Policyreview

- Alle acht S1-Kombinationen müssen mindestens je einen kanonischen Testkey
  abdecken; die vollständige 69-Key-Matrix bleibt der Mengenoracle.
- Pro Strength-Row ist genau eine Primärmessung aktiv:
  `reps`, `duration_sec` oder `distance_m`.
- `weight_kg` und `assistance_kg` werden nie gemeinsam gerendert oder mutiert.
- `assistance_kg` verwendet ausschließlich `Unterstützung (kg)` und wird weder
  im Parser noch in Copy oder Testnamen als positives Zusatzgewicht bezeichnet.
- Optionales Gewicht darf `null` bleiben, ohne eine ansonsten gültige Row
  partial zu machen. Required Weight/Assistance muss gültig sein.
- Der Draft validiert private Tracking-/Policy-Metadaten mit
  `INVALID_CATALOG`; die Shell validiert dieselbe Snapshot-/Catalogbeziehung vor
  DOM-Wirkung mit `INVALID_DRAFT_STATE` beziehungsweise bestehendem
  `CATALOG_VERSION_MISMATCH`.
- Non-Strength bleibt `sets: []`; Set-API liefert `SETS_UNAVAILABLE`, die Shell
  rendert nur den neutralen Handoff-Hinweis.

### S3-Lifecycle-, Race- und Consumerreview

- Full Render:
  - nur Strukturmutationen wie Set-Add/Remove oder bestehendes Item-Reorder
    bauen den Editor neu;
  - Rohwerte kommen dabei ausschließlich aus dem Draft;
  - reine Setfeldeingabe patcht nur Inputzustand, ARIA und Fehlercopy.
- Fokus:
  - Add fokussiert das erste erlaubte Feld der neuen letzten Row;
  - Remove fokussiert dieselbe reindizierte Position, sonst die letzte Row;
  - Set-Remove besitzt eigene Action/ARIA-Copy und darf nie den bestehenden
    Item-Remove-Pfad auslösen;
  - Fehler restaurieren den auslösenden Controlfokus.
- Close/Discard:
  - bestehende Promise-Koaleszierung, Context, `confirmed === true`, Fokus-
    Restore, Lookup-Reconcile und Discard-vor-Close bleiben unverändert;
  - sobald `closeGuardPromise` gesetzt ist, werden nur neue Setinputs,
    `add-set` und `remove-set` disabled;
  - Cancel, Confirmationthrow oder Discardfehler reaktiviert diese Controls aus
    dem unveränderten Draft und erhält Fokus;
  - erfolgreiche Bestätigung schließt nach bestehendem Discard ohne weitere
    Setmutation.
- Lookup:
  - R4 Success/Empty/Error/Retry und alle Late-Settlementpfade bleiben
    ausschließlich in `.activity-v2-session-history`;
  - ein Editor-Full-Render rekonstruiert die Historyregion aus dem bestehenden
    Mountcache und startet keine zweite Anfrage;
  - ein Lookuppatch darf weder Editorregion noch `data-state`, Inputwert oder
    Setfokus ersetzen.
- Background/Timer:
  - `visibilitychange` und Intervall aktualisieren nur Timerstate/-text;
  - weil Inputevents Draft-first sind, bleiben auch invalid/intermediate
    Rohwerte nach Backgroundwechsel und Reopen erhalten.
- Destroy/Mount:
  - Destroy invalidiert Lookup und Close-Guard, entfernt DOM und Scheduler,
    mutiert/discardet den Draft aber nicht;
  - wiederholtes Mount/Open behält die bestehenden Host-/Documentguards;
  - ein neuer Mount besitzt einen neuen R4-Lookupcache, aber liest denselben
    injizierten Draft entsprechend seinem Snapshot.
- Koordinierte Consumergrenze in Block A:
  - `session-draft.js` und `session-draft.contract.test.js` inklusive ihrer
    Semantik-/Katalogdoubles;
  - `session-shell.js` für v2-Konstante, zehn Methoden, Item-/Setvalidator;
  - alle fünf Draftfassaden in `session-shell.contract.test.js`;
  - direkter Realconsumer `semantics-v2.contract.test.js`;
  - isolierter Harness als realer Runtimeconsumer;
  - `data-access.js` bleibt außerhalb der Draftgrenze und unverändert.

### S3-UX-, Accessibility- und Securityreview

- Aktuelle Setinputs erhalten zusätzlich zu `type="text"` und `inputmode` exakt
  `maxlength="32"`, `autocomplete="off"` und `spellcheck="false"`.
- `maxlength` ist nur UX-Defense; `setSetField` bleibt die verbindliche
  32-Codepoint-Grenze für programmatische oder Unicode-Eingaben.
- `aria-invalid` folgt dem Feldzustand; `aria-describedby` zeigt kontrollierte
  Copy. Keine Live-Region wiederholt bei jedem gültigen Tastendruck Erfolg.
- Buttons behalten mindestens 44px Touchziel. Set-Remove und Item-Remove haben
  verschiedene Danger-/Label-/Actiongrenzen.
- Editor und History spannen im bestehenden Itemgrid `grid-column: 1 / -1`;
  Inputs/Labels besitzen `min-width: 0`, `width: 100%` und umbrechbare Copy.
- Bei 640px wird die Setzeile gestapelt oder in passende policyabhängige
  Spalten gebrochen; 350px/320px dürfen keinen horizontalen Shelloverflow
  erzeugen.
- Rohtexte werden ausschließlich über die DOM-Property `value` gesetzt.
  Labels, Status und Fehler nutzen `textContent`; `innerHTML`, HTML-Templates
  und rohe Diagnoseausgabe bleiben verboten.
- Eventdelegation bleibt auf Shellpanel und bekannte `data-action`-/Fieldkeys
  begrenzt; Itemkey und Setorder werden erneut gegen Snapshot/API validiert.
- Runtime/Harness erhalten keine Data-Access-, Netzwerk-, Storage-, Service-
  Worker-, SQL-/RPC- oder Product-Importkante.

### S3-Rollback

- Es gibt keine Datenmigration, produktive Tabelle, Persistenz oder Deployment-
  Wirkung. Der isolierte R5-Diff ist dateibasiert rückrollbar.
- Block A ist eine atomare logische Contracteinheit: Draft-v2-Code, Drafttests,
  Shellvalidator/-testdoubles und C2-Realconsumer dürfen nicht in gemischtem
  v1/v2-Stand als PASS gelten. Rollback stellt gemeinsam Draft v1 und seine
  sieben Methoden/Itemform wieder her.
- Block B kann gemeinsam entfernt werden, ohne Block A oder R4-History zu
  verändern; danach existiert Draft v2 weiterhin isoliert ohne sichtbaren
  Seteditor.
- Block C ist CSS-/Harnesspolitur und kann unabhängig auf den grünen Block-B-
  DOMstand zurückgenommen werden.
- R1-R4/C2, Activity V1, `index.html`, `data-access.js`, SQL/RPC und die
  S1-Baseline bleiben die Rollback-Oracles.

### S3-Invalidation Map

<!-- markdownlint-disable MD013 -->

| Delta | Verpflichtend erneut | Zusätzlicher Fokus |
| --- | --- | --- |
| Draftschema, Item-/Setform, private Katalogpolicy oder zehn Methoden | T-01, T-02, T-03, T-04, T-05, T-08, T-09, T-13 | Drafttests, Shellvalidator, fünf Fassaden, Semantics-v2-Realconsumer, History-/Harnessisolation |
| Snapshotclone, Reorder, Note, Remove/Re-Add oder Discard | T-02, T-04, T-09 | Setwerterhalt, Referenz-No-op, Revision, atomarer Fehler |
| Rohwertgrenze oder Parser | T-02, T-05, T-06, T-07, T-09, T-10, T-12 | alle acht Policies, Grenz-/Zwischenwerte, Draft/DOM-Gleichheit |
| Row-/Itemstatus, Prefix-/Gapregel oder Copy | T-05, T-06, T-07, T-10 | Required/Optional/Forbidden, kein Successrauschen |
| Editor-DOM, Eventdelegation, Fokus oder Close-Guard | T-01, T-03, T-07, T-08, T-09, T-10, T-11, T-12, T-13 | Set-vs-Item-Remove, Pending Guard, Lookuppatch, Viewports, Isolation |
| R4-Historyregion oder Lookupintegration | T-01, T-08, T-09, T-12, T-13 | Cache, Retry, Late Remove/Close/Destroy, keine Vorbefüllung |
| CSS/Responsive/A11y-Attribute | T-10, T-11, T-12 | 1440x900, 390x844, 320x800, 44px, Background |
| Harness oder Scriptreihenfolge | T-01, T-03, T-05 bis T-13 | lokale Fakes, kein Produkt-/Netzwerkpfad |
| Ausschließlich Roadmap/Doku | Struktur-/Whitespacecheck und Full Contract Review | keine Runtimebaseline invalidiert |

<!-- markdownlint-enable MD013 -->

### S3-S4-Schnitt

- Block A: `S4.1` allein.
  - Grund: Draft v2 und alle exakten Consumer müssen als atomare
    Contractgrenze grün sein, bevor DOM-State darauf aufbaut.
- Block B: `S4.2` und `S4.3` gemeinsam ausführen, Ergebnisse getrennt
  dokumentieren.
  - Grund: sichtbare Inputs ohne Draft-first Handler/Validator würden sofort
    R-ACT-R5-01/-03/-05 erzeugen; State und DOM teilen denselben Rollback.
- Block C: `S4.4` nach finalem Block-B-DOM.
  - Grund: Responsive CSS und Harnessfixtures sollen nicht gegen eine
    Zwischenstruktur optimiert werden.
- Kein Block benötigt ein produktives Gate. Der optionale Owner-Smoke in S4.4
  betrifft nur persönliche Ergonomie; technische Abnahme bleibt agentisch.
- S4R muss Reihenfolge, geschützte Zonen, reale Dateien und gültige Baseline
  noch separat bestätigen; S3 startet S4R nicht vorzeitig.

### S3-S5-Pflichtmatrix

- IDs `T-ACT-R5-01` bis `T-ACT-R5-14` bleiben stabil und decken gemeinsam
  lokale Contracts, Draft/API, Policies, Parser, Validität, History,
  Lifecycle, A11y, Browser, Background, Isolation und finalen Review ab.
- T-01 startet nach jedem Runtime-/Testdelta die vollständige Activity-V2-
  Contractmatrix; eine neue Testanzahl ersetzt erst in S5 die Baselinezahl.
- T-11 umfasst exakt `1440x900`, `390x844`, `320x800`; T-12 mindestens 30
  Sekunden Backgroundtab mit intermediate und validen Rohwerten.
- T-14 bleibt ausschließlich S5: finaler nativer Full Review, CodeRabbit,
  Findingsbewertung, Fixes und invalidierte Rechecks.

### S3-Contract-Review

- Datenverlust/falsche Leistung: `PASS` nach `F-ACT-R5-09`.
- Parser/Zahlen/acht Policies: `PASS`; alle geforderten Edgeklassen besitzen
  eine eindeutige Erwartung.
- Lifecycle/Races/R4-Guards: `PASS` nach `F-ACT-R5-10`; bestehender R3-/R4-
  Guardvertrag bleibt unverändert, nur neue Setcontrols werden integriert.
- API/Snapshot/Consumer: `PASS`; Block A ist vollständig und atomar kartiert.
- UX/A11y/Security: `PASS` nach `F-ACT-R5-11`; keine rohe HTML-/Diagnosekante.
- Isolation/Rollback/Invalidation: `PASS`; geschützte Pfade bleiben außerhalb
  jedes S4-Blocks.
- S4-Schnitt und S5-IDs: `PASS`; A -> B -> C, T-01 bis T-14 stabil.
- Quellenwiderspruch, neue Produktentscheidung oder Scope-Ausweitung: `none`.
- Offene Findings/P0/P1: `none`.
- Runtime-/Testinvalidierung in S3: `none`, da ausschließlich die Roadmap
  korrigiert wurde. Die frische S1-Baseline bleibt gültig.
- Größenprüfung: `PASS`; die Roadmap überschreitet den Richtwert, aber der
  neue Inhalt ist einmaliger Risiko-, Rollback- und Invalidation-Kontext. Eine
  Kürzung würde das Fresh-Chat-Gate schwächen.
- S3-Abnahme: `PASS`.
- Stop: S4R wurde nicht begonnen. Nächstes erlaubtes Gate ist das
  `S4 Readiness Review`.

Exit:

- `PASS`; alle P0/P1-Risiken sind geschlossen oder einem exakten S4-Substep
  samt Pflichtchecks zugeordnet.

## S4 Readiness Review

Reasoning: `GPT-5.6 Sol / Extra High`.

<!-- markdownlint-disable MD013 -->

| Substep | Änderung | Findings | Dateien | Review | Checks | Gate |
| --- | --- | --- | --- | --- | --- | --- |
| S4.1 | Draftschema und Set-Mutationsvertrag | `F-ACT-R5-08/-09/-12` | `session-draft.js`, Drafttests, `session-shell.js`, Shelltests, `semantics-v2.contract.test.js`; Harness nur bei Consumerbruch | `Consumer` | T-01 bis T-05, T-08, T-09, T-13 | none |
| S4.2 | Policy-gesteuerte Strength-Karte | `F-ACT-R5-11/-12` | `session-shell.js`, Shelltests | `Consumer`; gemeinsam mit S4.3 | Block B: T-01, T-03 bis T-13 | none |
| S4.3 | Eingabe, Validierung und Lifecycle | `F-ACT-R5-10 bis -12` | `session-shell.js`, Shelltests | `Consumer`; gemeinsam mit S4.2 | Block B: T-01, T-03 bis T-13 | none |
| S4.4 | Responsive Politur und Harness | `F-ACT-R5-11/-12` | CSS, Harness, Shelltests | `Consumer` plus visuelle QA | T-01, T-03, T-05, T-07, T-10 bis T-13 | optionaler Owner-Smoke |

<!-- markdownlint-enable MD013 -->

Deterministisch:

1. S1-S3, Decision Log, Findings und realen Gitstand abgleichen.
2. Exakte Dateien und geschützte Zonen pro Substep bestätigen.
3. Prüfen, dass S4.1 keine R2-Commitänderung und S4.2-S4.4 keinen Product Load
   benötigen.
4. Test- und Invalidation-Zuordnung vervollständigen.
5. Sichere Ausführungsblöcke empfehlen:
   - erwartbar Block A: S4.1 allein;
   - erwartbar Block B: S4.2-S4.3 gemeinsam, wenn derselbe finale DOM- und
     Statevertrag betroffen ist;
   - Block C: S4.4 nach finalem DOM.
6. Eine Zusammenlegung nur erlauben, wenn kein Owner-Gate oder unterschiedlicher
   Rollback dazwischenliegt.
7. Roadmap bei neuen Fakten gezielt korrigieren; keinen S4.5-Review ergänzen.
8. Scope-Freeze mit `PASS` oder `BLOCKED` abschließen.

Ergebnis:

- Reihenfolge/Abhängigkeiten:
  - `PASS`; Block A (`S4.1`) -> Block B (`S4.2+S4.3`) -> Block C (`S4.4`).
  - Block B bleibt ein gemeinsamer Code-/Rollbackblock, dokumentiert S4.2 und
    S4.3 jedoch getrennt; Block C beginnt erst gegen dessen finales DOM.
- Reale Dateien:
  - Block A: `session-draft.js`, `session-draft.contract.test.js`,
    `session-shell.js`, `session-shell.contract.test.js` und
    `semantics-v2.contract.test.js`; Harness nur bei bewiesenem Consumerbruch.
  - Block B: `session-shell.js` und `session-shell.contract.test.js`.
  - Block C: `session-shell.css`, `session-shell-harness.html` und
    `session-shell.contract.test.js`.
- Geschützte Zonen:
  - Activity V1, `index.html`, `data-access.js` samt Commitgrenze, SQL/RPC/RLS/
    Grants/Supabase, Storage/IndexedDB, Service Worker und Produktnavigation.
  - R1-Katalog-/Semantikruntime und R2-Zahlen-/Commitvertrag bleiben unverändert;
    nur `semantics-v2.contract.test.js` ist als realer Consumer in Block A frei.
  - Innerhalb `session-shell.js` bleiben R4-Suche, read-only Historie, Cache,
    Fokus-, Close- und Raceguards geschützt; erlaubt ist nur die ausdrücklich
    definierte R5-Integration ohne History-Vorbefüllung oder `commitSession`.
- Gültig übernommene Nachweise:
  - `PASS`; HEAD weiterhin `3f4f43a`, alle sieben S4-Kandidatendateien und alle
    geschützten Runtimepfade clean gegen HEAD; der aktuelle Diff betrifft nur
    Owner-/Roadmapdokumente.
  - S1-Baseline `65/65`, Katalog `v2 / 80 / 47 / 58` und Syntax `10/10` bleibt
    gültig, weil seitdem kein Activity-V2-JS-/Test-/CSS-/Harnessdelta entstand.
  - Der erste Block-A-Codechange invalidiert diese Baseline sofort und erzwingt
    die unten definierte frische Blockprüfung.
- Empfohlene Blöcke:
  - Block A: S4.1, `Consumer` Review, T-01 bis T-05, T-08, T-09 und T-13;
    Rollback ist das gesamte koordinierte Draft-/Consumerdelta.
  - Block B: S4.2+S4.3, je getrenntes `Consumer`-Ergebnis, gemeinsame Prüfung
    T-01 und T-03 bis T-13; Rollback ist Shellcode plus Shelltests gemeinsam.
  - Block C: S4.4, `Consumer` plus visuelle QA, T-01, T-03, T-05, T-07 und
    T-10 bis T-13; Rollback ist finales CSS/Harness/Shelltestdelta gemeinsam.
  - S5 wiederholt danach die vollständige T-01-bis-T-14-Matrix samt nativem Full
    Review und CodeRabbit; kein S4.5 wird eingeführt.
- Gates und Stopbedingungen:
  - kein Block benötigt ein Owner-Gate; der S4.4-Owner-Smoke bleibt optional.
  - Unerwarteter R7/R8-Grundsatzkonflikt, Quellenwiderspruch, neue
    Produktentscheidung oder Scope-Ausweitung stoppt den jeweiligen Block.
- Readiness-Findings:
  - `F-ACT-R5-12` fixed; Checklisten und Invalidation Map bilden nun dieselben
    blockgenauen Pflichtmengen ab.
  - offene In-Scope-P0/P1-Findings: `none`.
- Full Contract Review:
  - `PASS`; S1-S3, Decision Log, Findings, reale Activity-V2-Grenzen und S4-
    Dateischnitt beschreiben nach der Korrektur denselben Vertrag.
  - Quellenwiderspruch, neue Produktentscheidung oder Scope-Ausweitung: `none`.
- Scope-Freeze:
  - `PASS`; S4 kann ohne neue Grundsatzentscheidung und ausschließlich in den
    drei eingefrorenen Blöcken beginnen.
- S4R-Abnahme:
  - `PASS`; nur die Roadmap wurde geändert, S4.1 wurde nicht begonnen.

Exit:

- S4 kann ohne neue Grundsatzentscheidung beginnen.

## S4 - Umsetzung

S4 ist ausschließlich der Implementierungsblock. Substeps erhalten ihre
delta- oder consumernahen Checks. Der finale native Full Review und CodeRabbit
gehören ausschließlich zu S5.

### S4.1 - Draftschema und Set-Mutationsvertrag

Reasoning: `GPT-5.6 Sol / Extra High`.

- Vertrag:
  - exakte S2-Draftschema-, API-, No-op-, Fehler- und Validitätsgrenze;
  - D-ACT-R5-02 bis D-ACT-R5-15, D-ACT-R5-22 bis D-ACT-R5-24 und
    D-ACT-R5-28.
- Dateien:
  - `session-draft.js`;
  - `session-draft.contract.test.js`;
  - `session-shell.js` für die exakte Schema-/API-/Snapshotvalidierung;
  - `session-shell.contract.test.js` für alle fünf exakten Draft-Fassaden;
  - `semantics-v2.contract.test.js` als direkter realer C2-Draft-/Shellconsumer;
  - `session-shell-harness.html` nur, falls die reale Draft-/Shellgrenze dessen
    Consumerpfad invalidiert; visuelle Harness-Erweiterung bleibt S4.4.
- Umsetzung:
  - Draftschema explizit versionieren;
  - Setzustand und atomare Setmutationen implementieren;
  - `createSnapshot` und jeden bestehenden Mutationspfad auf vollständige
    Item-/Setrecords umstellen; keine Keylisten-Rekonstruktion mit Setverlust;
  - private Tracking-/Feldpolicy für die gebundene Catalogversion fail-closed
    erfassen und alle Testkataloge entsprechend exakt aktualisieren;
  - Immutability, Revision, Discard, Reorder/Remove/Re-Add und 1..50-Grenze
    bewahren;
  - Non-Strength-Items R6-kompatibel lassen;
  - keine Commitnormalisierung oder Persistenz ergänzen.
- Review:
  - `Consumer` für Draft- und öffentliche API-Grenze; finaler Full Review in
    S5.
- Invalidation:
  - T-ACT-R5-01 bis T-ACT-R5-05, T-ACT-R5-08, T-ACT-R5-09,
    T-ACT-R5-13.
- Gate:
  - `none`; bei unerwartetem R7/R8-Grundsatzkonflikt stoppen.

#### Ergebnis S4.1

- Änderung:
  - `session-draft.js`: Schema v2, exakte Item-/Setform, zehn Methoden,
    policy-gesteuerte Initialisierung, 1..50-Grenze, Rohstringmutation und
    vollständige copy-on-write Snapshot-Rebuilds.
  - `session-shell.js`: v2-/Zehnmethoden-Consumer und fail-closed Item-/Set-/
    Policyvalidator; R4-Render-, Lookup-, Cache-, Fokus- und Closecode unverändert.
  - Draft-/Shelltests und `semantics-v2.contract.test.js`: exakte API-/Keyform,
    alle acht R1-Policies, Setgrenzen, Atomizität, Immutability, Revision,
    Rebuild-Erhalt, Non-Strength und reale C2-Consumergrenze abgedeckt.
  - Harness blieb unverändert, weil kein Consumerbruch nachgewiesen wurde.
- Prüfung:
  - T-01 `PASS`: fünf Activity-V2-Contractdateien `72/72`, keine Fehler/Skips.
  - T-02/T-04 `PASS`: Draftschema/API, Fehlerpräzedenz, No-op, 1..50,
    Reindexierung, Revision, Discard und vollständiger Setwerterhalt.
  - T-03/T-05 S4.1-Anteil `PASS`: drei leere Strength-Sets, Non-Strength
    `sets: []`, alle acht realen R1-Policies; Render-/Parseranteil bleibt Block B.
  - T-08/T-09 Regression `PASS`: vollständige Shellsuite einschließlich
    History-, Cache-, Late-Race-, Reorder-, Discard-, Destroy- und Fokusguards.
  - T-13 `PASS`: Katalogcheck `v2 / 80 / 47 / 58`, Syntax `10/10`, statische
    Isolation und geschützte Pfade ohne Diff; kein realer Netzwerk-/Writeaufruf.
- Consumer Review:
  - `PASS` nach Korrektur `F-ACT-R5-13`; Draft, fünf vollständige Shellfassaden,
    Shellvalidator und C2-Realconsumer beschreiben dieselbe v2-Grenze.
- Finding/Korrektur:
  - `F-ACT-R5-13` fixed; offene In-Scope-P0/P1-Findings `none`.
- Restrisiko:
  - Editor-Rendering, Parser, Validitätscopy und Set-Lifecycle im DOM sind
    vertraglich Block B und wurden in S4.1 nicht vorgezogen.
- Doku-Sync: `S6`.
- Status: `PASS`; Stop vor S4.2+S4.3/Block B.

### S4.2 - Policy-gesteuerte Strength-Karte

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - D-ACT-R5-02 bis D-ACT-R5-10, D-ACT-R5-15, D-ACT-R5-19 sowie
    D-ACT-R5-25 bis D-ACT-R5-27 und D-ACT-R5-30.
- Dateien:
  - `session-shell.js`;
  - `session-shell.contract.test.js`.
- Umsetzung:
  - Strength-Editor nur für `tracking_mode: strength_sets` rendern;
  - ausschließlich policy-erlaubte Felder mit stabilen deutschen Labels;
  - Textinputs mit exaktem `inputmode`, `maxlength`, `autocomplete`,
    `spellcheck`, Label-/ARIA- und draftbasiertem `value`-Vertrag;
  - drei nummerierte Standardzeilen, `+ Satz` und Satzentfernung;
  - R4-Historie sichtbar, aber räumlich und semantisch read-only getrennt;
  - Non-Strength-Hinweis ohne vorgezogenen R6-Editor;
  - keine Vorbefüllung, Zielwerte oder Trainingshinweise.
- Review:
  - `Consumer` gegen R1-, R3- und R4-Verträge.
- Invalidation:
  - gemeinsam mit S4.3 als Block B: T-ACT-R5-01, T-ACT-R5-03 bis
    T-ACT-R5-13.
- Gate:
  - `none`.

#### Ergebnis S4.2

- Änderung:
  - `session-shell.js` rendert für `strength_sets` exakt die fünf möglichen
    R1-Setfelder gemäß Itempolicy, jeweils aus dem Draftrohwert, mit stabilen
    Labels, drei nummerierten Rows, `+ Satz` und eigener Satzentfernung.
  - Setinputs sind `type=text` mit exaktem `inputmode`, `maxlength=32`,
    `autocomplete=off`, `spellcheck=false`, Label-, Description- und
    `aria-invalid`-Vertrag; Historie bleibt eine getrennte inputfreie Region.
  - Non-Strength rendert ausschließlich den eingefrorenen neutralen Hinweis.
  - Die injizierten Setfelddefinitionen werden vor DOM-Wirkung exakt nach
    Keys, Scope, Typ, Unit, Min/Max und Dezimalstellen validiert.
- Prüfung: T-01, T-03, T-05, T-08, T-10, T-11 und T-13 `PASS`; gemeinsame
  Block-B-Gesamtmatrix siehe S4.3 und Testmatrix.
- Consumer Review: `PASS` gegen reale R1-Policies, Draft v2 und read-only R4-
  Historie nach Korrektur `F-ACT-R5-14`.
- Finding/Korrektur: `F-ACT-R5-14 fixed`.
- Restrisiko: visuelle Grid-, Touch- und Spacingpolitur bleibt ausschließlich
  S4.4; der finale DOM-Vertrag ist vorhanden.
- Doku-Sync: `S6`.
- Status: `PASS`.

### S4.3 - Eingabe, Validierung und Lifecycle

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - D-ACT-R5-05 bis D-ACT-R5-15, D-ACT-R5-19 sowie D-ACT-R5-23 bis
    D-ACT-R5-30.
- Dateien:
  - `session-shell.js`;
  - `session-shell.contract.test.js`;
  - Draftcode/-tests nur dann, wenn ein echtes S4.1-Finding vorliegt; keine
    zweite API- oder Schemaveränderung in Block B.
- Umsetzung:
  - Inputevents ohne stale DOM-/Draftwerte verarbeiten;
  - Input ohne Full Render und ohne Caretverlust Draft-first patchen;
  - Komma/Punkt, Integer, Dezimalstellen und R1-Grenzen anwenden;
  - Zeilenstatus und Präfixregel deterministisch anzeigen;
  - Add/Remove/Reorder/Re-Add, Close/Discard, Destroy und Fokus absichern;
  - neue Setcontrols während `closeGuardPromise` deaktivieren und bei
    Cancel/Fehler aus dem Draft reaktivieren;
  - Background-Tabwechsel ohne Wert- oder Timerverlust;
  - R4-Lookupsettlements dürfen Inputs nie ersetzen.
- Review:
  - `Consumer` für State-, Parser- und Lifecyclegrenze; finaler Full Review in
    S5.
- Invalidation:
  - gemeinsam mit S4.2 als Block B: T-ACT-R5-01, T-ACT-R5-03 bis
    T-ACT-R5-13.
- Gate:
  - `none`.

#### Ergebnis S4.3

- Änderung:
  - Setinputevents schreiben den exakten DOM-Rohwert zuerst mit
    `setSetField`; Erfolg patcht nur Field-/Row-/Itemstate, ARIA und Fehlercopy,
    ohne Inputersatz, Full Render oder Caretverlust.
  - Der Parser akzeptiert nur ASCII-Ziffern, kontrollierte Integer sowie
    Dezimalpunkt/-komma, leitet intermediate/valid/invalid aus R1-Grenzen ab
    und verändert oder rundet den Draftrohwert nie.
  - Row-/Itemvalidität, optionale Last, Complete-Präfix, leere Tails und
    Lückenfehler sind vollständig abgeleitet; kein Save-/Erfolgsstatus wird
    gespeichert oder pro Tastendruck angekündigt.
  - Add/Remove rendern strukturell neu und fokussieren die vertragliche Row;
    Reorder, Remove/Re-Add, Remount, Mutationfehler und R4-Cache bewahren ihre
    jeweils definierte Draft-/Historysemantik.
  - Pending Close deaktiviert ausschließlich Setinputs, `add-set` und
    `remove-set`; Cancel, Confirmationfehler und Discardfehler reaktivieren aus
    dem unveränderten Draft. Lookup-, Timer- und Visibilitypatches ersetzen
    weder Input, State noch Fokus.
  - Delegierte Setevents akzeptieren ausschließlich aktuelle kanonische
    Controlrefs; forged/stale Targets bleiben mutationsfrei.
- Prüfung:
  - T-01 `PASS`: fünf Activity-V2-Contractdateien `80/80`, keine Fehler/Skips.
  - T-03 bis T-10 `PASS`: Draft-/UI-, Set-, Acht-Policy-, Parser-, Validitäts-,
    History-, Lifecycle- und A11y-Verträge durch Shell-/Draftregressionen.
  - T-11 `PASS`: Harness `1440x900`, `390x844`, `320x800`, keine Dokument-,
    Shell- oder Inhaltsüberläufe, keine außerhalb liegenden Setcontrols;
    Screenshots geprüft, Console ohne Warnung/Fehler.
  - T-12 `PASS`: echter 30-Sekunden-Tabwechsel bewahrte `08` valid, `80,`
    intermediate, Row-/Itemstate und Setfokus; Timer `01:03 -> 01:36`.
  - T-13 `PASS`: Katalog `v2 / 80 / 47 / 58`, Syntax `10/10`, statische
    Isolation und geschützte Pfade ohne Diff.
- Consumer Review: `PASS` für State-, Parser- und Lifecyclegrenze nach
  Korrektur `F-ACT-R5-15`; finaler Full Review bleibt S5.
- Finding/Korrektur: `F-ACT-R5-15 fixed`; Browser-Altcache und Edge-Dialog-
  Handshake waren Testinfrastruktur, kein Produktfinding. Die Beweisführung
  lief auf frischem lokalen Origin; Closepfade sind vollständig contractgetestet.
- Restrisiko: S4.4 poliert CSS/Harness gegen diesen finalen DOM; S5 wiederholt
  die vollständige Matrix und den Full Review.
- Doku-Sync: `S6`.
- Status: `PASS`; Stop vor S4.4.

### Block-B-Contract-Review

Fakten:

- Block B änderte ausschließlich `session-shell.js` und
  `session-shell.contract.test.js`; Draftcode/-tests, Semantikruntime, CSS und
  Harness wurden nicht verändert.
- Der frische Stand ist `80/80` Contracttests, Katalog
  `v2 / 80 / 47 / 58`, Syntax `10/10` und Browsermatrix T-11/T-12 `PASS`.
- Activity V1, `index.html`, `data-access.js`, SQL, Supabase, Storage,
  IndexedDB und produktive Verdrahtung haben keinen Diff; `commitSession` wurde
  weder verändert noch von R5 aufgerufen.
- R4-Historie blieb in allen Success-/Empty-/Error-/Retry-/Late-Race-Pfaden
  read-only und inputfrei; aktuelle Eingaben stammen ausschließlich aus Draft v2.

Ableitungen:

- Es besteht kein Quellenwiderspruch, keine neue Produktentscheidung und keine
  Scope-Ausweitung. Die numerische R2-Commitgrenze blieb unverändert und wird
  erst in einem späteren freigegebenen Release konsumiert.
- S4.4 darf den bewiesenen DOM ausschließlich responsiv und visuell polieren
  sowie das isolierte Harness erweitern; Parser, Draftschema, API, History- und
  Closevertrag sind keine offene Produktentscheidung.

Findings und Korrekturen:

- `F-ACT-R5-14 fixed`: exakte R1-Felddefinitionsgrenze ergänzt und negativ
  contractgetestet.
- `F-ACT-R5-15 fixed`: kanonische DOM-Targetidentität für neue Setevents ergänzt
  und forged/stale mutationsfrei contractgetestet.
- Offene In-Scope-P0/P1-Findings: `none`.

Abnahme:

- S4.2: `PASS`.
- S4.3: `PASS`.
- Block B: `PASS`.
- Stop: S4.4/Block C wurde nicht begonnen. Nächstes erlaubtes Gate ist S4.4.

### S4.4 - Responsive Politur und isoliertes Harness

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - Zielvertrag für Desktop, Android, Accessibility und Produktisolation;
  - D-ACT-R5-19 sowie D-ACT-R5-25 bis D-ACT-R5-27 und D-ACT-R5-30.
- Dateien:
  - `session-shell.css`;
  - `session-shell-harness.html`;
  - `session-shell.contract.test.js`.
- Umsetzung:
  - finales Strength-DOM in das bestehende Vollflächenlayout integrieren;
  - stabile Spalten, Touchziele, Labels, Fokus und Fehlermeldungen;
  - lange Übungsnamen und vier-/dezimalstellige Werte ohne Überlappung;
  - Harness-Fakes für alle relevanten Feldpolicies und Historyzustände;
  - keine Remote-Abhängigkeit oder Produktintegration.
- Review:
  - `Consumer` plus visuelle QA.
- Invalidation:
  - T-ACT-R5-01, T-ACT-R5-03, T-ACT-R5-05, T-ACT-R5-07 und
    T-ACT-R5-10 bis T-ACT-R5-13.
- Gate:
  - optionaler Owner-Smoke nur für persönliche Ergonomie; technische Browser-
    Matrix wird agentisch ausgeführt.

#### Ergebnis S4.4

- Änderung:
  - `session-shell.css` integriert den finalen Editor über die volle Itembreite,
    hält Feldspalten mit `minmax(0, …)` stabil und stapelt Setfelder/Aktionen
    unter `640px`; Inputs und Setaktionen besitzen mindestens `44px` Höhe;
  - lange Labels, Status- und Fehlertexte umbrechen; vierstellige Integer- und
    Dezimalwerte bleiben in den kontrollierten Textinputs überlappungsfrei;
  - `session-shell-harness.html` bietet die vier rein lokalen Fixtures `empty`,
    `policies`, `history` und `all`, ermittelt exakt acht reale aktive
    R1-Policykombinationen aus Catalog v2 und kombiniert sie mit deterministischen
    Success-, Empty-, Error-/Retry- und langen Historyzuständen;
  - der Shellcontract bindet die responsive CSS-/Fixturegrenze statisch an diese
    Selektoren, Routen, Stresswerte und Policyanzahl.
- Prüfung:
  - T-ACT-R5-01, T-ACT-R5-03, T-ACT-R5-05, T-ACT-R5-07 und
    T-ACT-R5-10 bis T-ACT-R5-13: `PASS`;
  - fünf Activity-V2-Contractdateien: `80/80 PASS`, `0` Fehler/Skips;
  - Katalog `v2 / 80 / 47 / 58`, Syntax `10/10`, `git diff --check` und
    geschützte Pfade: `PASS`;
  - Browser `1440x900`, `390x844`, `320x800`: kein horizontaler Overflow,
    keine abgeschnittenen Controls/Textinhalte und keine Set-Zeilen-Kollision;
    bei `320x800` sind `143/143` sichtbare Dialog-Controls mindestens `44px` hoch;
  - Fixture-Routen liefern deterministisch `0/8/4/12` Items; die Bench-Press-
    Korrektur wechselt bei erhaltenem Fokus von `invalid`/`intermediate` zu
    `complete`, History-Retry bleibt read-only; drei Screenshots und leere
    Fehlerkonsole belegen die visuelle QA;
  - T-12 wurde im frischen Shelllauf erneut mit 30 simulierten Hidden-Sekunden
    geprüft; der reale Other-Tab-Smoke aus Block B bleibt für Draft/Timer/Events
    gültig, und der mehr als 30 Sekunden laufende S4.4-Browserloop bewahrte
    Rohwerte, Zustand und Timer über die Viewportwechsel.
- Consumer Review:
  - Fakten: Block C ändert ausschließlich CSS, Harness und Shellcontract; das
    Harness konsumiert reale Semantik/Draft/Shell, schreibt Historie nie in
    Inputs und besitzt keine Produkt-, Netzwerk- oder Persistenzverdrahtung;
  - Ableitung: CSS und deterministische Fixtures ändern weder Draft/API/Parser
    noch R2-Commit-, R4-Cache-/Close-/Race- oder Historyverträge;
  - Quellenwiderspruch, neue Produktentscheidung oder Scope-Ausweitung: `none`.
- Finding/Korrektur: `none`; der Consumer- und visuelle Review ergab keinen
  berechtigten Korrekturbedarf nach der S4.4-Umsetzung.
- Restrisiko: nur der optionale subjektive Owner-Smoke zur persönlichen
  Touch-Ergonomie; kein technischer Blocker.
- Doku-Sync: `S6`.
- Status: `PASS`; Block C abgeschlossen, Stop vor S5.

## S5 - Tests, Runtime-Gates und Abschlussreview

Reasoning: `GPT-5.6 Sol / Extra High`.

Deterministische Reihenfolge:

1. Frischen Gitstand und finalen R5-Diff erfassen.
2. Gesamte lokale und statische Matrix T-ACT-R5-01 bis T-ACT-R5-10 und T-13
   ausführen.
3. Browsermatrix T-ACT-R5-11 und Background-Smoke T-ACT-R5-12 ausführen.
4. Nativen Full Code und Contract Review des gesamten finalen R5-Diffs gegen
   Roadmap, Masterplan und R1-R4/C2 durchführen.
5. Berechtigte native Findings minimal korrigieren und invalidierte Checks
   wiederholen.
6. CodeRabbit gegen denselben finalen Diff gemäß `DEV_ENVIRONMENT.md`
   ausführen.
7. Jedes CodeRabbit-Finding einzeln bewerten:
   - korrekt und in Scope -> minimal korrigieren;
   - falsch oder bereits vertraglich ausgeschlossen -> begründet ablehnen;
   - neue Produktentscheidung -> Owner-Gate und Stop;
   - Out of Scope -> Watchlist/Folgeartefakt, keine stille Erweiterung.
8. Nach jeder Korrektur alle laut Invalidation Map betroffenen Tests und
   Browserchecks wiederholen.
9. CodeRabbit erneut ausführen, sobald eine berechtigte Korrektur Code im
   geprüften Diff ändert; reine Dokumentationskorrekturen invalidieren den Lauf
   nicht.
10. T-ACT-R5-14 erst auf PASS setzen, wenn keine offenen In-Scope-P0/P1-
    Findings bestehen.

<!-- markdownlint-disable MD013 -->

| ID | Ebene | Check / Smoke | Status | Nachweis | Invalidiert durch |
| --- | --- | --- | --- | --- | --- |
| T-ACT-R5-01 | lokal | Alle Activity-V2-Contracttests bleiben grün; Baseline 65/65 wird nicht regressiert | PASS | S5 final: 81/81, 0 Fehler/Skips | jedes Activity-V2-JS/Testdelta |
| T-ACT-R5-02 | Draft | Neue Schema-ID, exakte Keys/API, Immutability, sichere Fehler, No-op, atomare Revision und Erhalt kompletter Item-/Setrecords in allen Rebuilds | PASS | S4.1-Drafttests | Draft/API/Clone |
| T-ACT-R5-03 | Draft/UI | Strength-Add erzeugt drei leere Zeilen; Non-Strength erhält keinen Strength-Editor | PASS | Draft-/Shelltests; Fixtures `0/8/4/12` | Draft/Render |
| T-ACT-R5-04 | Draft | Satz hinzufügen/entfernen/reindizieren, Grenze 1..50, Reorder/Remove/Re-Add/Discard | PASS | Draft-/Shelltests | Setmutationen |
| T-ACT-R5-05 | Policy | Alle realen Strength-Policykombinationen zeigen und erlauben exakt ihre Felder | PASS | Acht-Policy-Render-/Mutationsmatrix plus Policy-Fixture | Semantik/Render/Parser |
| T-ACT-R5-06 | Parser | Leerwert, Komma/Punkt, leading/trailing Separator, Integer, Dezimalstellen, Min/Max, 0, Vorzeichen, Exponent, `NaN`/Infinity, Whitespace, Unicode und 32-Codepoint-Grenze | PASS | Parser- und API-Fehlertests | Input/Parser |
| T-ACT-R5-07 | Validität | Empty/Partial/Complete/Invalid, optionale Last, leere Tails und Lückenregel | PASS | Row-/Itemstate-/Copytests; Post-Fix-Browser invalid/intermediate -> complete | Validator/Copy |
| T-ACT-R5-08 | Historie | Lookup bleibt read-only; keine Vorbefüllung, Draftmutation oder Input-/Fokusüberschreibung in Success/Empty/Error/Retry/Late-Race | PASS | R4-Regression plus Editor-Late-Settlement | Lookup/Render |
| T-ACT-R5-09 | Lifecycle | Fokus, Full Render, Pending Close-Guard, Discard, Destroy, Reopen, Background, Remove/Re-Add und fehlerhafte Mutation erhalten Draftwerte und Guards | PASS | Shelltests inklusive Post-Mutations-Breach plus Post-Fix-Browser | Events/Lifecycle/Races |
| T-ACT-R5-10 | UI/A11y | Labels, `inputmode`, `maxlength`, `autocomplete`, `spellcheck`, getrennte Set-/Itemaktionen, ARIA, Fehlermeldungen und lange Inhalte sind zugänglich | PASS | DOM-/CSS-Contracts; Browserbounds, Fokus und lange History | DOM/CSS/Copy |
| T-ACT-R5-11 | Browser | Isolierter Harness bei 1440x900, 390x844 und 320x800 ohne Overflow/Overlap | PASS | Drei Screenshots; kein Overflow/Clipping/Overlap; 143/143 Touchziele >=44px bei 320px | DOM/CSS |
| T-ACT-R5-12 | Browser | Mindestens 30 Sekunden anderer Tab: valide und intermediate Draftwerte, Zeilen, Fokusvertrag und Timer bleiben korrekt | PASS | S5 vor/nach Fix: 31 s, `08`/`80,`, Fokus/States/3 Zeilen stabil; Timer 01:29->02:00 und 00:18->00:50 | Draft/Timer/Events |
| T-ACT-R5-13 | Isolation | Syntax, Katalogcheck, kein Produktload, Netzwerk, Storage, SQL/RPC oder `commitSession` | PASS | Syntax 10/10; Katalog v2/80/47/58; geschützte Diffs/statik grün | Integration/Imports |
| T-ACT-R5-14 | Review | Nativer Full Review plus CodeRabbit, Findings bewertet, Korrekturen und Rechecks abgeschlossen | PASS | Nativer Full Review PASS; CodeRabbit CLI 0.7.2: 5 Issues bewertet/fixed, final 0 Issues | jeder Reviewfix |

<!-- markdownlint-enable MD013 -->

Ergebnis:

- Grüne Nachweise:
  - T-ACT-R5-01 bis T-ACT-R5-14: `PASS`;
  - fünf Contractdateien `81/81`, Katalog `v2 / 80 / 47 / 58`, Syntax
    `10/10`, Isolation, geschützte Pfade und `git diff --check`: `PASS`;
  - Browsermatrix `1440x900`, `390x844`, `320x800`, vier Fixtures und zwei
    31-Sekunden-Other-Tab-Smokes: `PASS`.
- Wiederverwendete, nicht invalidierte Nachweise:
  - R1-Policy-/Felddefinitionsvertrag, numerische R2-Set-/Commitgrenze,
    R3-Draft-/Discardgrundvertrag, C2-Katalog v2 und R4-Suche/History/Cache/
    Close-/Raceguards; keine dieser Source-of-Truth-Grenzen wurde geändert.
- Nicht ausgeführte Smokes:
  - nur der optionale subjektive Owner-Smoke zur persönlichen Touch-Ergonomie;
    kein technisches oder S5-blockierendes Gate.
- Produktiver Iststand:
  - Activity V1 unverändert; R5 nur isoliert.
- Nativer Review:
  - `PASS`; finaler Gesamtdiff gegen Roadmap, Masterplan und R1-R4/C2 geprüft;
    vor dem externen Review keine eigenen offenen Findings.
- CodeRabbit:
  - CLI `0.7.2`, Scope `uncommitted`;
  - erster Lauf: `5` Issues (`2` Major, `3` Minor); alle gegen Vertrag und Code
    bewertet, F-ACT-R5-16/-17 minimal korrigiert;
  - zweiter Lauf nach Codefix: `0` Issues.
- Offene Findings:
  - `none`; insbesondere keine offenen In-Scope-P0/P1-Findings.
- Commit-Entscheidung:
  - `S6 offen`; technisch commitbereit, aber Doku-Sync/Recap/Archiv bleiben
    deterministisch in S6.

Exit:

- Alle relevanten Checks sind grün oder sichtbar abgegrenzt.
- Keine offenen In-Scope-P0/P1-Findings.
- R5 bleibt nachweislich ohne produktive Wirkung.

## S6 - Doku-Sync und Abschluss

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. `docs/modules/Activity Module Overview.md` ausschließlich mit bewiesenem
   R5-Iststand synchronisieren.
2. `docs/Future trainingsmodule update thoughts.md` aktualisieren:
   - R5 auf DONE;
   - R6 als nächsten Rolling-Wave-Schritt;
   - finalen Draft-/Satzabschlussvertrag;
   - keine vorgezogene R7-/R8-Behauptung.
3. `docs/qa/health-capture-reports.md` unter der nächsten freien Health-
   Contract-Review-ID ergänzen; erwartete ID aus dem aktuellen Stand
   verifizieren, nicht erfinden. `docs/QA_CHECKS.md` bleibt als reiner
   Kompatibilitätsindex unverändert.
4. Changelog-Relevanz entscheiden. Da R5 weiterhin isoliert und nicht
   produktiv ist, `nicht bemerkenswert` begründen, sofern sich dieser Stand
   nicht während der Umsetzung geändert hat.
5. Finalen Full Contract Review über Code, Tests, Masterplan, Module Overview,
   QA und Roadmap durchführen.
6. Findings korrigieren; jede Codekorrektur invalidiert die zugeordneten S5-
   Checks und gegebenenfalls CodeRabbit.
7. Owner-Recap in Alltagssprache schreiben:
   - was R5 jetzt kann;
   - warum drei leere Zeilen noch keine Trainingsdaten sind;
   - warum History nicht vorbefüllt;
   - was R6, R7 und R8 noch ergänzen.
8. Session Resume Card auf Abschluss setzen.
9. Commit-Empfehlung aus dem realen Diff ableiten.
10. Roadmap mit `(DONE)` ins Archiv verschieben. Keine Evidence-Datei erzeugen,
    solange kein produktiver Write oder Deploy hinzugekommen ist.

Ergebnis:

- Source-of-Truth-Sync:
  - `docs/modules/Activity Module Overview.md`: R5-Draft-, Policy-, Editor-,
    Browser- und Isolationsvertrag ergänzt;
  - `docs/Future trainingsmodule update thoughts.md`: R5 auf DONE, R6 als
    nächste Rolling Wave und Satzabschluss als rein abgeleiteter Zustand;
  - `docs/qa/health-capture-reports.md`: nächste freie ID als HCR-023 verifiziert
    und isolierten R5-Vertrag ergänzt;
  - diese Roadmap: Finding, Statusmatrix, Resume Card und Abschlussnachweis.
- Finaler Review:
  - `PASS`; Code, Tests und die drei synchronisierten Sources of Truth bilden
    denselben R5-Vertrag ab;
  - `F-ACT-R5-18 fixed`; keine offenen In-Scope-P0/P1-Findings;
  - keine S6-Codeänderung, daher bleiben S5-Testmatrix und finaler CodeRabbit-
    Lauf mit `0` Issues gültig.
- Fakten:
  - der S6-Diff enthält ausschließlich Dokumentation; `docs/QA_CHECKS.md`,
    Activity V1, `index.html`, SQL, Datenzugriff und `commitSession` sind darin
    unverändert;
  - HCR-023 war die nächste freie HCR-ID; HCR-008 und HCR-011 bleiben reserviert;
  - der frische S5-Nachweis bleibt `81/81`, Katalog `v2 / 80 / 47 / 58`, Syntax
    `10/10`, Browsermatrix grün und CodeRabbit `0` Issues.
- Ableitungen:
  - weil S6 keinen Code änderte, wurde kein S5-Gate invalidiert;
  - weil R5 ohne produktiven Consumer, Save oder Deploy bleibt, entsteht keine
    Changelog-relevante Nutzungs- oder Betriebsänderung.
- Restrisiken:
  - Reload-/Android-Prozessverlust bis R7/R8;
  - kein echter Save bis R8;
  - kein produktiver Consumer bis R11.
- Changelog-Relevanz:
  - nicht bemerkenswert: R5 ist weiterhin ausschließlich im lokalen Activity-
    V2-Harness erreichbar und ändert weder sichtbares Produktverhalten noch
    Deploy, Datenbank oder produktive Schreibwirkung.
- Owner-Recap:
  1. R5 ergänzt in der isolierten Activity-V2-Shell einen Strength-Set-Editor.
  2. Jede Strength-Übung startet mit drei leeren Eingabezeilen.
  3. Diese Zeilen sind nur Platzhalter; ohne Werte sind sie keine Trainingsdaten.
  4. Sichtbare Felder stammen ausschließlich aus der bewiesenen R1-Policy.
  5. Werte bleiben begrenzter Rohtext, damit Kommaeingaben und Zwischenstände
     beim Tippen nicht verfälscht werden.
  6. `empty`, `partial`, `complete` und `invalid` werden nur aus den Eingaben
     abgeleitet; es gibt keine Abschlusscheckbox und keinen Satzzeitpunkt.
  7. Sätze lassen sich deterministisch bis zur bestehenden Grenze 50 ergänzen
     oder entfernen.
  8. Historie bleibt eine read-only Gedächtnisstütze und befüllt aktuelle
     Felder nie vor, damit frühere Leistung nicht als heutige behauptet wird.
  9. Fokus, Close, Lookup, Timer und verspätete Antworten sind gegen bekannte
     Racebedingungen abgesichert.
  10. R5 speichert nichts produktiv und ruft `commitSession` nicht auf.
  11. R6 ergänzt als Nächstes isolierte Duration- und Cardio-Editoren, ohne den
      R5-Strength-Vertrag umzudeuten.
  12. R7 ergänzt erst später persistente Recovery; R8 ergänzt erst später den
      echten serverseitigen Save-/Commitpfad.
- Archiv:
  - `docs/archive/MIDAS Activity V2 R5 Strength Set Editor Roadmap (DONE).md`.
- Commit-Empfehlung:

```text
feat(activity-v2): add isolated strength set editor
```

Exit:

- Code, Tests, Masterplan, Module Overview, QA und Roadmap beschreiben denselben
  bewiesenen R5-Vertrag.
- R5 ist archiviert; R6 darf erst danach als eigene Roadmap vorbereitet werden.
