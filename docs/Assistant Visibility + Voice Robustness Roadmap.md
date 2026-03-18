# Assistant Visibility + Voice Robustness Roadmap

## Ziel
Assistant-Text und Voice sollen produktisch in die zweite Reihe ruecken, ohne erneut hart geparkt oder architektonisch zurückgebaut zu werden.

Der neue Produktvertrag:
- Standardzustand:
  - Assistant `off`
  - Text-Assistant-Icon unsichtbar
  - MIDAS-Voice-/Push-to-talk-Einstieg sichtbar inaktiv oder nicht drueckbar
- Bei bewusstem Opt-in:
  - Assistant `on`
  - Text-Assistant-Icon erscheint
  - Push-to-talk wird wieder aktiv
- Voice und Text bleiben technisch produktiv vorhanden:
  - kein zweiter Reaktivierungssprint noetig
  - kein erneutes hartes Parken des Runtime-Stacks

Parallel dazu sollen die ersten realen Alltagsbefunde sauber verarbeitet werden:
- Medikations-Regression im Intake fixen
- Voice-Robustheit fuer natuerlichere Sprache spaeter gezielt nachziehen
- echter Outside-the-app-Voice-Start bleibt als eigener spaeterer Scope erhalten, aber nicht ueber PWA-Shortcut verwechselt

## Pruefbare Zieldefinition
- Die aktuelle Medikations-Regression im Intake ist behoben.
- Assistant-/Voice-Sichtbarkeit ist ueber einen klaren Produkt-Toggle steuerbar.
- `off` bedeutet:
  - kein sichtbares Text-Assistant-Icon
  - kein aktiver Push-to-talk-Einstieg
- `on` bedeutet:
  - bestehender Text-/Voice-Stack wird wieder sichtbar und nutzbar
- Es entsteht kein neuer Runtime-Modus, kein zweiter Parserpfad und kein zweiter Assistant-Stack.
- Voice-Robustheitsprobleme aus dem Alltag sind als eigener spaeterer Follow-up-Schnitt dokumentiert:
  - leiseres / weniger exaktes Sprechen
  - natuerlichere Einleitungsphrasen wie `kannst du mir bitte ...`
  - spaeterer Outside-the-app-Voice-Start

## Scope
- Fix der aktuellen Medikations-Regression im Intake-/Medication-Renderpfad.
- Produktentscheidung und Implementierung fuer einen sichtbarkeitsbezogenen Assistant-/Voice-Toggle.
- UI-/State-/Gate-Schnitt fuer:
  - Text-Assistant-Icon
  - Push-to-talk / MIDAS-Nadel
- Dokumentation des neuen Produktvertrags in den relevanten Modul-Overviews und QA-Checks.
- Enger Future-/Follow-up-Hook fuer Voice-Robustheit und spaeteren externen Voice-Start.

## Not in Scope
- Kein neuer kompletter Voice-Refactor.
- Kein harter Rueckbau oder erneutes Parken des bestehenden Voice-/Assistant-Stacks.
- Kein sofortiger lokaler STT-Wechsel.
- Kein Widget-/Wrapper-/TWA-Start in diesem Block.
- Keine breite neue Satzbibliothek fuer natuerliche Sprache im Vorbeigehen.

## Relevante Referenzen
- `app/modules/intake-stack/intake/index.js`
- `app/modules/intake-stack/medication/index.js`
- `app/modules/hub/index.js`
- `app/modules/assistant-stack/voice/index.js`
- `docs/modules/Assistant Module Overview.md`
- `docs/modules/Hub Module Overview.md`
- `docs/modules/Medication Module Overview.md`
- `docs/QA_CHECKS.md`

## Guardrails
- Assistant-/Voice-Toggle ist ein Produkt-UX-Toggle, kein zweiter technischer Modus.
- `off` darf Sichtbarkeit und Trigger deaktivieren, aber nicht den zugrunde liegenden Runtime-Vertrag zerstoeren.
- Kein erneutes halbgares `VOICE_PARKED`-Konstrukt.
- Voice-Robustheit wird spaeter als eigener gezielter Follow-up behandelt, nicht still in denselben Toggle-Block hineingemischt.
- PWA-/Shortcut-/Outside-the-app-Ideen bleiben explizit getrennt vom jetzigen Sichtbarkeits-/Produktentscheid.

## Statusmatrix
| ID | Schritt | Status | Ergebnis/Notiz |
|---|---|---|---|
| A1 | Medikations-Regression im Intake fixen | DONE | Intake-/Medication-Panel rendert wieder; lokaler Helper-Drift im Daily-UI bereinigt |
| A2 | Produktvertrag fuer Assistant-/Voice-Toggle schneiden | TODO | Default `off`, bewusster Opt-in statt hartem Parken modellieren |
| A3 | Toggle-UX und Sichtbarkeits-/Gate-Schnitt produktiv anbinden | TODO | Text-Assistant-Icon und Push-to-talk an denselben Toggle binden |
| A4 | Regression, Doku und QA fuer den Toggle-Schnitt nachziehen | TODO | sicherstellen, dass `off/on` keine neue Runtime-Drift erzeugt |
| A5 | Voice-Robustheits-Follow-up fuer spaeteren Sprint sauber einordnen | TODO | leises Sprechen, `bitte`-/natuerliche Einleitung, spaeterer externer Voice-Start |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Schritte

### A1 - Medikations-Regression im Intake fixen
- A1.1 Fehlerbild gegen den realen Runtime-Stand lesen.
- A1.2 Ursache im Intake-/Medication-Renderpfad isolieren.
- A1.3 Produktiv minimal fixen, ohne den Medication-/Daily-Batch-Vertrag aufzuweichen.
- A1.4 Check:
  - Intake-Panel rendert wieder sauber
  - Medikationsauswahl / Footer / Low-Stock-UI bleiben intakt
  - kein neuer Render-/Helper-Drift entsteht

#### A1.1 Ergebnisprotokoll
- Das reale Fehlerbild ist gegen den aktuellen Intake-Renderpfad gelesen.
- Runtime-Befund aus dem offenen Intake-/Medication-Panel:
  - sichtbarer Fehler:
    - `getActiveMedicationRows is not defined`
  - der Fehler tritt direkt im produktiven Daily-Renderbereich auf und blockiert:
    - Medikationskarten
    - Batch-Footer
    - bestaetigbare Auswahl
- Laufzeitanker im Code:
  - `app/modules/intake-stack/intake/index.js`
    - `updateMedicationBatchFooter()`
    - `renderMedicationDaily(data)`
    - `syncMedicationSelection(data, ...)`
- Wichtigster A1.1-Befund:
  - das Problem ist kein diffuser Medication-Load- oder Voice-Bug
  - der Bruch sitzt lokal im Intake-Daily-UI-Schnitt
  - damit kann `A1.2` eng auf fehlende/inkonsistente Helper im Renderpfad fokussieren

#### A1.2 Ergebnisprotokoll
- Die Ursache ist im Intake-Renderpfad isoliert.
- Konkreter Codebefund:
  - `getActiveMedicationRows(data)` und `getOpenMedicationIds(data)` werden mehrfach produktiv aufgerufen
  - in `app/modules/intake-stack/intake/index.js` existierte dafuer aber keine lokale Definition mehr
- Wirkung des Bruchs:
  - schon der erste Renderpfad fuer aktive Medikamente lief in einen `ReferenceError`
  - dadurch fielen Folgebereiche indirekt mit aus:
    - Selektion offener Medikamente
    - Footer-State
    - Batch-Confirm-Button
- Fachliche Einordnung:
  - der bestehende Medication-Day-Snapshot liefert die benoetigten Daten bereits
  - es fehlte kein neuer Medication-API-Vertrag
  - es war ein lokaler Helper-Drift im Intake-UI, kein tieferer Architekturbruch
- Praktische Folgerung fuer `A1.3`:
  - minimaler Restore derselben zwei Helper ist der richtige Schnitt
  - kein Umbau am Medication-Modul
  - keine neue Daily-/Selection-Semantik

#### A1.3 Ergebnisprotokoll
- Der Produktivfix wurde bewusst minimal im lokalen Intake-Daily-UI umgesetzt.
- Wiederhergestellte lokale Helper in:
  - `app/modules/intake-stack/intake/index.js`
    - `getActiveMedicationRows(data)`
    - `getOpenMedicationIds(data)`
    - `syncCardOrder(order, items)`
    - `sortByCardOrder(items, order)`
- Implementierungsschnitt:
  - die Helper arbeiten ausschliesslich auf dem bereits vorhandenen `data.medications`-Snapshot
  - aktive Medikamente bleiben:
    - alle Eintraege mit `active !== false`
  - offene Medikamente bleiben:
    - aktive Eintraege ohne `taken`
- Guardrail:
  - kein Umbau am Medication-Modul
  - keine neue API
  - keine neue Selection- oder Sortiersemantik
  - nur lokaler Restore des kaputten Daily-Rendervertrags

#### A1.4 Ergebnisprotokoll
- Der Intake-/Medication-Renderpfad ist nach dem Minimalfix erneut geprueft.
- Verifikation:
  - Live-Retest bestaetigt:
    - Medikamentenbereich ist wieder sichtbar
    - das Intake-Panel laeuft nicht mehr in den frueheren `ReferenceError`
  - `node --check` gruen fuer:
    - `app/modules/intake-stack/intake/index.js`
- Abgedeckte betroffene Teilpfade:
  - `renderMedicationDaily(data)`
  - `syncMedicationSelection(data, ...)`
  - `updateMedicationBatchFooter()`
  - Kartenreihenfolge fuer aktive Medikamente
- Abschlussbefund:
  - der Bruch war ein lokaler Helper-Drift im Intake-UI
  - keine Hinweise auf einen tieferen Medication- oder Voice-Vertragsschaden
  - `A1` ist damit `DONE`

### A2 - Produktvertrag fuer Assistant-/Voice-Toggle schneiden
- A2.1 Sichtbarkeitsziel klarziehen:
  - `off` = Assistant in zweite Reihe
  - `on` = bestehender Assistant-/Voice-Einstieg sichtbar
- A2.2 Explizite Grenze:
  - kein technisches Re-Parken
  - kein zweiter Assistant-Modus
  - keine Deaktivierung der Architektur
- A2.3 Default und Persistenzfrage schneiden:
  - Standardwert `off`
  - spaeter klären, ob lokal persistent oder nur Session-weit
- A2.4 Check:
  - Produktentscheid ist klein, eindeutig und ohne Scope-Drift dokumentiert

### A3 - Toggle-UX und Sichtbarkeits-/Gate-Schnitt produktiv anbinden
- A3.1 Geeigneten UI-Ort fuer den Toggle bestimmen.
- A3.2 Text-Assistant-Icon an den Toggle binden.
- A3.3 Push-to-talk / MIDAS-Nadel an denselben Toggle binden:
  - sichtbar inaktiv oder nicht triggerbar bei `off`
- A3.4 Sicherstellen, dass bestehende Boot-/Auth-/Voice-Gates darunter unveraendert weitergelten.
- A3.5 Check:
  - `off`/`on` veraendert Sichtbarkeit und Nutzbarkeit, nicht den zugrunde liegenden Fachvertrag

### A4 - Regression, Doku und QA fuer den Toggle-Schnitt nachziehen
- A4.1 Modul-Overviews auf den neuen Sichtbarkeitsvertrag ziehen.
- A4.2 `docs/QA_CHECKS.md` um den neuen `off/on`-Produktzustand ergaenzen.
- A4.3 Pruefen, dass Text-/Voice-/Hub-Flow bei `on` weiter normal laufen.
- A4.4 Pruefen, dass bei `off` keine toten Buttons, keine halbaktiven Needle-Zustaende und kein UI-Drift sichtbar bleiben.
- A4.5 Check:
  - Doku, QA und Runtime beschreiben denselben Produktzustand

### A5 - Voice-Robustheits-Follow-up fuer spaeteren Sprint sauber einordnen
- A5.1 Alltagsbefunde dokumentieren:
  - lauter / exakter sprechen noetig als gewuenscht
  - soziale Awkwardness im echten Umfeld
  - natuerliche Einleitungsphrasen verschlechtern Compound-Erkennung
- A5.2 Technische Folgerungen nur einordnen, nicht vorschnell bauen:
  - VAD-/Noise-/Empfindlichkeitsfrage
  - semantische Filler wie `kannst du mir bitte`
  - spaeterer Outside-the-app-Voice-Start
- A5.3 Klar trennen:
  - kurzfristiger Produkt-UX-Toggle
  - spaeterer Voice-Robustheits-/TWA-/Wrapper-Scope
- A5.4 Abschlusscheck:
  - naechster Sprint startet nicht diffus, sondern mit klar getrennten Follow-up-Richtungen
