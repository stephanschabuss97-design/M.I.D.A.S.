# Assistant Visibility + Voice Robustness Roadmap

## Ziel
Assistant-Text und Voice sollen produktisch in die zweite Reihe ruecken, ohne erneut hart geparkt oder architektonisch zurückgebaut zu werden.

Der neue Produktvertrag:
- Standardzustand:
  - Assistant `off`
  - Text-Assistant-Icon unsichtbar
  - OG-MIDAS-Nadel beim Start sichtbar, aber inaktiv
  - nach der ersten Karussell-Bewegung verschwindet die Nadel wie im frueheren Nicht-Voice-Zustand
- Bei bewusstem Opt-in:
  - Assistant `on`
  - Text-Assistant-Icon erscheint
  - Push-to-talk wird wieder aktiv
  - die MIDAS-Nadel bleibt im Karussell sichtbar
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
  - nur ein passiver Startanker ueber die OG-MIDAS-Nadel
  - nach erster Karussell-Bewegung kein sichtbarer Voice-Einstieg mehr
- `on` bedeutet:
  - bestehender Text-/Voice-Stack wird wieder sichtbar und nutzbar
  - die MIDAS-Nadel bleibt als aktiver Karussell-Eintrag sichtbar
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
- `docs/archive/Voice Reactivation Roadmap (DONE).md`
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
| A2 | Produktvertrag fuer Assistant-/Voice-Toggle schneiden | DONE | `off/on`, Nadel-Vertrag, Guardrails und Persistenz als reiner Produktpraesenz-Vertrag festgezogen |
| A3 | Toggle-UX und Sichtbarkeits-/Gate-Schnitt produktiv anbinden | DONE | Toggle, Text-Surface, passive Startnadel, Hide-after-first-move und `on`-Rueckkehr produktiv angebunden |
| A4 | Hero-Hub-Dashboard aus Assistant-Kontext produktisch hochziehen | DONE | Oberer Reveal-Surface per `swipe down` produktiv angebunden; Drei-Ebenen-Hub mit Dashboard, Hero und Quicklinks steht |
| A5 | Regression, Doku und QA fuer den Toggle-/Dashboard-Schnitt nachziehen | DONE | Modul-Overviews und `QA_CHECKS` auf den realen `off/on`- und Dashboard-Reveal-Vertrag gezogen |
| A6 | Voice-Robustheits-Follow-up fuer spaeteren Sprint sauber einordnen | DONE | Alltagsbefunde, technische Hebel und klar getrennte Future-Scope-Richtungen fuer Voice sind sauber eingeordnet |

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
- A2.2 Nadel-Vertrag explizit schneiden:
  - `off` nimmt bewusst das fruehere Nicht-Voice-/Intro-Verhalten wieder auf
  - `off` startet mit sichtbarer, aber inaktiver OG-MIDAS-Nadel
  - die erste Karussell-Bewegung entfernt diese passive Nadel wieder
  - `on` behaelt bewusst den reaktivierten Voice-V1-Vertrag
  - `on` haelt die Nadel als aktiven Voice-Eintrag im Karussell
- A2.3 Explizite Grenze:
  - kein technisches Re-Parken
  - kein zweiter Assistant-Modus
  - keine Deaktivierung der Architektur
- A2.4 Default und Persistenzfrage schneiden:
  - Standardwert dauerhaft `off`
  - bewusstes Einschalten bleibt lokal persistent erhalten
  - Toggle wirkt live auf Sichtbarkeit und Triggerbarkeit
  - kein Reboot-/Reload-Zwang als Produktvertrag
- A2.5 Check:
  - Produktentscheid ist klein, eindeutig und ohne Scope-Drift dokumentiert

#### A2.5 Ergebnisprotokoll
- Der Produktvertrag fuer den Assistant-/Voice-Toggle ist als Abschlusscheck gegen Scope und Architektur geprueft.
- Bestaetigt:
  - `off/on` ist ein Surface- und Triggerbarkeitsvertrag
  - `off` nutzt bewusst einen ruhigen Assistant-Standard mit passiver Startnadel
  - `on` behaelt bewusst den reaktivierten Voice-V1-Surface
  - der Zustand ist lokal persistent
  - der Wechsel wirkt live und ohne Produkt-Reload
- Ebenfalls bestaetigt:
  - kein neues `VOICE_PARKED`
  - kein zweiter Assistant-Modus
  - kein anderer Parser-, Intent- oder Pending-Pfad
  - keine neue Boot-/Auth-/Stage-Komplexitaet
- Wichtigster Abschlussbefund fuer `A2`:
  - der Toggle ist klein genug fuer einen klaren Produktentscheid
  - aber praezise genug, um `A3` deterministisch umzusetzen
  - `A2` ist damit `DONE`

#### A2.4 Ergebnisprotokoll
- Default und Persistenzfrage fuer den Toggle sind festgezogen.
- Produktiver Standard:
  - Assistant standardmaessig dauerhaft `off`
  - neue Nutzer- oder App-Starts beginnen damit ohne prominenten Assistant-Surface
- Persistenzvertrag:
  - bewusstes Einschalten bleibt lokal persistent erhalten
  - der Toggle ist damit kein Session-Schalter, sondern eine echte Produktpraeferenz
- Runtime-Vertrag:
  - der Toggle wirkt live auf Sichtbarkeit und Triggerbarkeit
  - kein verpflichtender Reboot oder Reload gehoert zum Produktverhalten
- Fachliche Folge fuer die Umsetzung:
  - `A3` braucht einen frueh ladbaren lokalen Preference-State
  - Hub-Surface und Karussell muessen diesen State direkt beim Start beruecksichtigen
- Wichtigster A2.4-Befund:
  - `off` ist keine temporaere Session-Laune
  - `off` ist der bewusste Standardzustand
  - `on` bleibt ein expliziter Opt-in, der erhalten bleibt, bis der Nutzer ihn wieder aendert

#### A2.3 Ergebnisprotokoll
- Die explizite Grenze fuer den neuen Toggle ist festgezogen.
- Der Toggle bedeutet produktiv ausdruecklich nicht:
  - kein technisches Re-Parken des Voice-Moduls
  - kein Rueckfall in ein altes `VOICE_PARKED`-Konstrukt
  - kein zweiter Assistant-Modus mit eigener Runtime
  - keine zweite Boot-, Auth- oder Stage-Logik
  - kein anderer Parser-, Intent- oder Pending-Kontext
- Der Toggle bedeutet produktiv nur:
  - Sichtbarkeit des Assistant-Surface steuern
  - Triggerbarkeit von Text- und Voice-Einstiegen steuern
  - zwischen passivem und aktivem Hub-Surface umschalten
- Konkrete Guardrail fuer `off`:
  - Voice- und Text-Runtime bleiben technisch vorhanden
  - bestehende Hub-/Voice-/Assistant-Module werden nicht aus dem Produktcode herausgeschnitten
  - es wird nur verhindert, dass der Assistant-Surface im Alltag prominent und sofort nutzbar erscheint
- Konkrete Guardrail fuer `on`:
  - bestehende produktive Voice-/Text-Pfade bleiben unveraendert die offiziellen Pfade
  - kein Sonderpfad nur fuer den Toggle-Zustand
- Wichtigster A2.3-Befund:
  - der Toggle ist eine Produktpraesenz-Entscheidung
  - keine Architekturentscheidung
  - genau dadurch vermeiden wir spaeter erneut einen grossen Reaktivierungssprint

#### A2.2 Ergebnisprotokoll
- Der Nadel-Vertrag ist gegen den aktuellen Hub-Karussell-Schnitt und die fruehere Voice-Reactivation-Grenze gelesen.
- Heutiger produktiver Hub-Befund:
  - `setupCarouselController(...)` setzt den initial aktiven Carousel-Slot gezielt auf:
    - `assistant-voice`
  - die OG-MIDAS-Nadel ist damit heute nicht nur sichtbar, sondern der primaere aktive Startslot
- Historischer Vergleich aus der abgeschlossenen Voice-Reactivation:
  - dort wurde bewusst festgezogen:
    - die Nadel bleibt fuer Voice V1 permanent im Karussell
    - die fruehere Hide-after-first-move-/Intro-Sonderlogik wurde fuer Voice V1 explizit aufgehoben
- Produktentscheidung fuer den neuen Toggle:
  - `off`
    - greift bewusst das fruehere Nicht-Voice-/Intro-Verhalten wieder auf
    - die OG-MIDAS-Nadel ist beim ersten Hub-Zustand noch sichtbar
    - sie ist dort aber nur ein passiver, inaktiver Startanker
    - nach der ersten Karussell-Bewegung verschwindet sie wieder
  - `on`
    - behaelt bewusst den reaktivierten Voice-V1-Vertrag
    - die OG-MIDAS-Nadel bleibt als aktiver Voice-Slot im Karussell sichtbar
- Wichtigster A2.2-Befund:
  - der Toggle schaltet nicht zwischen zwei technischen Voice-Systemen um
  - er schaltet zwischen:
    - passivem Intro-/Nicht-Voice-Surface
    - aktivem permanentem Voice-Surface
  - genau dadurch bleibt der Produktvertrag historisch konsistent, ohne neuen Sondermodus zu erfinden

#### A2.1 Ergebnisprotokoll
- Das Sichtbarkeitsziel ist gegen den aktuellen produktiven Hub-Surface gelesen.
- Heutiger sichtbarer Assistant-Surface:
  - im Hero-Hub-Karussell existieren zwei Assistant-Einstiege:
    - `assistant-voice`
    - `assistant-text`
  - zusaetzlich existiert heute ein Text-Assistant-Einstieg in der Quickbar:
    - `data-hub-module="assistant-text"`
  - ein separater Quickbar-Voice-Button ist bereits auskommentierte Altlast und heute nicht produktiv
- Heutiger Karussell-Startzustand:
  - `setupCarouselController(...)` setzt den Default aktiv auf:
    - `assistant-voice`
  - die OG-MIDAS-Nadel ist damit heute der primaere Startslot im Hub
- Wichtigster Produktbefund fuer den Toggle:
  - `off/on` soll nicht Voice oder Text technisch entfernen
  - `off/on` soll die sichtbare Assistant-Praesenz im Hub steuern:
    - `off`
      - Assistant bleibt im Produkt in zweiter Reihe
      - Text-Assistant-Einstiege sind nicht sichtbar
      - Voice bleibt nur als passive Startnadel beim ersten Hub-Zustand praesent
    - `on`
      - Text-Assistant-Einstiege sind sichtbar
      - die Nadel bleibt als aktiver Voice-Slot produktiv praesent
- Fachliche Einordnung:
  - das ist ein UX-/Produktvertrag fuer Surface und Triggerbarkeit
  - kein neuer technischer Assistant-Modus
  - kein neues Park-/Reaktivierungsmodell

### A3 - Toggle-UX und Sichtbarkeits-/Gate-Schnitt produktiv anbinden
- A3.1 Geeigneten UI-Ort fuer den Toggle bestimmen.
- A3.2 Persistenten Toggle-State frueh genug laden, damit Startzustand und Karussell von Anfang an konsistent sind.
- A3.3 Toggle-Button im Touch-Log produktiv anbinden:
  - an den persistenten State koppeln
  - live umschaltbar machen
- A3.4 Text-Assistant-Surface an den Toggle binden:
  - Karussell-Slot
  - Quickbar-Button
- A3.5 Startnadel fuer `off` modellieren:
  - OG-MIDAS-Nadel beim Start sichtbar
  - klar inaktiv / nicht triggerbar
  - kein sichtbares Voice-Statuslabel bei `off`
- A3.6 Erste Karussell-Bewegung bei `off` anbinden:
  - passive Nadel verschwindet danach wie im frueheren Nicht-Voice-Verhalten
  - fruehere Hide-on-first-move-Logik nach Moeglichkeit wiederverwenden oder eng rekonstruieren
- A3.7 `on`-Verhalten anbinden:
  - Nadel bleibt im Karussell
  - Push-to-talk ist aktiv
  - Text-Assistant-Icon ist sichtbar
- A3.8 Sicherstellen, dass bestehende Boot-/Auth-/Voice-Gates darunter unveraendert weitergelten.
- A3.9 Check:
  - `off`/`on` veraendert Sichtbarkeit und Nutzbarkeit, nicht den zugrunde liegenden Fachvertrag

#### A3.1 Ergebnisprotokoll
- Der UI-Ort fuer den neuen Assistant-/Voice-Toggle ist gegen den aktuellen Hub- und Diagnose-Surface gelesen.
- Gepruefte sichtbare Orte:
  - Hero-Hub selbst
  - Quickbar
  - Touch-Log / Diagnose-Panel
- Entscheid fuer den ersten produktiven Schnitt:
  - der Toggle wird im Touch-Log / Diagnose-Panel verankert
- Begruendung:
  - der Toggle ist eine bewusste Produktpraeferenz, kein taeglicher Primary-Action-Button
  - der Ort ist erreichbar, aber nicht aufdringlich
  - dort existiert bereits ein lokaler Toggle-Bereich mit demselben Interaktionsmuster
  - dadurch entsteht kein neuer prominenter UI-Druck im Hero-Hub selbst
- Explizit nicht gewaehlt fuer den ersten Schnitt:
  - kein permanenter Toggle direkt im Hub-Karussell
  - kein zusaetzlicher Quickbar-Hauptbutton nur fuer Assistant-Sichtbarkeit
- Wichtigster A3.1-Befund:
  - fuer den aktuellen Scope ist der Touch-Log der passende Ort, um Assistant/Voice bewusst ein- oder auszuschalten
  - ein spaeterer Umzug in einen allgemeineren Settings-Ort bleibt moeglich, ist aber jetzt nicht noetig

#### A3.2 Ergebnisprotokoll
- Der Persistenz- und Ladezeitpunkt fuer den Toggle-State ist gegen den aktuellen Hub-/Voice-Start gelesen.
- Heutiger technischer Befund:
  - das Hub-Karussell wird beim Setup sofort initial auf `assistant-voice` gesetzt
  - die Voice-UI bindet direkt an denselben Hub-Button und markiert ihn ueber Gate-/Lock-Zustaende
  - fuer den neuen Assistant-Toggle existiert heute noch kein passender lokaler Preference-State
- Praktische Folgerung:
  - `A3` braucht einen kleinen neuen lokalen Preference-State fuer den Assistant-Surface
  - der State soll lokal persistent sein
  - der State muss vor oder waehrend der fruehen Hub-Initialisierung verfuegbar sein, bevor:
    - das Karussell seinen Startslot festzieht
    - Voice-Lock-/Gate-UI an den Button geschrieben wird
- Produktiver Ladevertrag:
  - Standardwert ohne gespeicherte Praeferenz:
    - `off`
  - gespeicherter Wert:
    - beim Start direkt anwenden
  - kein sichtbares Nachspringen des Karussells als Produktziel
- Umsetzungsgrenze:
  - kein Profil- oder Backend-Persistenzpfad
  - kein neuer globaler Settings-Apparat
  - nur ein enger lokaler Preference-State fuer den Assistant-Surface
- Wichtigster A3.2-Befund:
  - der Toggle-State muss frueh und lokal geladen werden
  - sonst startet der Hub zunaechst im falschen Voice-Surface und korrigiert sich erst nachtraeglich

#### A3.3 Ergebnisprotokoll
- Der sichtbare Text-Assistant-Surface ist gegen den aktuellen Hub gelesen und an den Toggle-Vertrag gespiegelt.
- Heute existieren zwei sichtbare Text-Einstiege:
  - Karussell-Slot:
    - `data-carousel-id="assistant-text"`
  - Quickbar-Button:
    - `data-hub-module="assistant-text"`
- Produktiver Bindungsvertrag:
  - `off`
    - Karussell-Textslot ist nicht sichtbar
    - Quickbar-Textbutton ist nicht sichtbar
    - der Text-Assistant-Panelvertrag selbst bleibt technisch bestehen, wird aber ohne sichtbaren Einstieg nicht aktiv angeboten
  - `on`
    - Karussell-Textslot ist sichtbar
    - Quickbar-Textbutton ist sichtbar
    - beide zeigen weiter auf denselben bestehenden `assistant-text`-Panelpfad
- Guardrail:
  - kein zweiter Text-Assistant-Entry-Contract
  - keine Sonderlogik nur fuer Quickbar oder nur fuer Karussell
  - der Toggle steuert denselben sichtbaren Text-Surface konsistent an beiden Stellen
- Wichtigster A3.3-Befund:
  - Text-Assistant darf bei `off` nicht halb sichtbar bleiben
  - fuer den Produktvertrag muessen Karussell und Quickbar gemeinsam geschaltet werden

#### A3.3 Umsetzungsstand
- Der erste produktive Toggle-Baustein ist eingebaut.
- Umgesetzt:
  - `index.html`
    - neuer Touch-Log-Toggle:
      - `#devToggleAssistant`
  - `app/diagnostics/devtools.js`
    - neuer lokaler Preference-Key:
      - `MIDAS_ASSISTANT_SURFACE_ENABLED`
    - fruehes Anwenden auf:
      - `body[data-assistant-surface="on|off"]`
    - kleines lokales API fuer spaetere Hub-/Voice-Bindung:
      - `AppModules.assistantSurface.isEnabled()`
      - `AppModules.assistantSurface.setEnabled(...)`
      - `AppModules.assistantSurface.subscribe(...)`
    - Live-Umschaltung ueber den neuen Touch-Log-Toggle
- Verifikation:
  - `node --check` gruen fuer:
    - `app/diagnostics/devtools.js`
- Einordnung:
  - die sichtbaren Assistant-Surfaces sind in diesem Schritt noch nicht verborgen oder eingeblendet
  - `A3.4+` ziehen jetzt erst die eigentliche Hub-/Karussell-/Needle-Logik auf diesen State

#### A3.4 Ergebnisprotokoll
- Der Text-Assistant-Surface ist jetzt produktiv an den Assistant-Toggle gebunden.
- Umgesetzt in:
  - `app/modules/hub/index.js`
- Produktives Verhalten:
  - `off`
    - Karussell-Slot `assistant-text` ist nicht sichtbar
    - Quickbar-Button `assistant-text` ist nicht sichtbar
    - ein offen stehendes `assistant-text`-Panel wird bei Umschalten auf `off` geschlossen
  - `on`
    - Karussell-Slot `assistant-text` ist sichtbar
    - Quickbar-Button `assistant-text` ist sichtbar
- Wichtiger Implementierungsschnitt:
  - das Hub-Karussell leitet seine sichtbaren Module jetzt ueber den Assistant-Surface-State ab
  - `assistant-text` wird bei `off` nicht nur optisch versteckt, sondern auch aus der aktiven Karussell-Itemliste entfernt
  - dadurch rotiert das Karussell nicht mehr auf ein unsichtbares Text-Ziel
- Guardrail:
  - der bestehende `assistant-text`-Panelpfad bleibt technisch unveraendert
  - es wurde kein zweiter Text-Assistant-Vertrag eingefuehrt
- Verifikation:
  - `node --check` gruen fuer:
    - `app/modules/hub/index.js`

#### A3.5 Ergebnisprotokoll
- Die Startnadel fuer `off` ist jetzt ueber den bestehenden Voice-Gate-Schnitt als inaktiv modelliert.
- Umgesetzt in:
  - `app/modules/assistant-stack/voice/index.js`
  - `app/modules/hub/index.js`
- Produktives Verhalten:
  - `off`
    - die OG-MIDAS-Nadel bleibt beim Start sichtbar
    - Voice ist fuer diesen Zustand aber nicht triggerbar
    - der Gate-Grund lautet produktiv:
      - `assistant-surface-off`
    - die Nadel wird damit wie ein bewusst deaktivierter Voice-Einstieg behandelt
  - `on`
    - der zusaetzliche Surface-Block faellt weg
    - die normalen Boot-/Auth-/Voice-Gates bleiben die einzigen Gate-Gruende
- Wichtigster Implementierungsschnitt:
  - keine neue Fake-Inaktivitaet nur ueber CSS
  - keine zweite Triggerlogik
  - die Inaktivitaet der Startnadel laeuft ueber denselben realen Voice-Gate-Mechanismus wie andere Blocker
- Verifikation:
  - `node --check` gruen fuer:
    - `app/modules/assistant-stack/voice/index.js`
    - `app/modules/hub/index.js`

#### A3.6 Ergebnisprotokoll
- Die erste Karussell-Bewegung bei `off` ist jetzt an die passive Startnadel gebunden.
- Umgesetzt in:
  - `app/modules/hub/index.js`
- Produktives Verhalten:
  - `off`
    - beim ersten Hub-Zustand ist die passive OG-MIDAS-Nadel noch Teil der sichtbaren Karussell-Liste
    - nach der ersten Karussell-Bewegung wird dieser passive Voice-Anker entfernt
    - danach bleibt der Hub im normalen Nicht-Voice-Surface ohne sichtbaren Voice-Slot
  - `on`
    - der Voice-Slot bleibt weiter normal im Karussell
- Wichtiger Implementierungsschnitt:
  - der passive Startanker ist kein eigener zweiter Button
  - er ist nur ein frueher temporärer Zustand derselben Karussell-Itemliste
  - nach der ersten Bewegung wird `assistant-voice` bei `off` aus der sichtbaren Carousel-Liste entfernt
- Verifikation:
  - `node --check` gruen fuer:
    - `app/modules/hub/index.js`

#### A3.7 Ergebnisprotokoll
- Das `on`-Verhalten ist jetzt als echter Live-Umschaltpfad an den Assistant-Toggle gebunden.
- Umgesetzt in:
  - `app/modules/hub/index.js`
  - `app/modules/assistant-stack/voice/index.js`
- Produktives Verhalten:
  - `on`
    - der Text-Assistant-Surface wird wieder sichtbar
    - die OG-MIDAS-Nadel bleibt dauerhaft als Voice-Slot im Karussell
    - der passive Off-Startanker ist dann nicht mehr der aktive Vertrag
    - Voice-Gate-Status wird nach dem Toggle-Wechsel sofort neu berechnet
  - `off`
    - der passive Startanker wird fuer den Startzustand wieder vorbereitet
    - der Off-/On-Wechsel bleibt damit auch live konsistent
- Wichtiger Implementierungsschnitt:
  - Assistant-Surface-Aenderungen senden jetzt ein echtes Gate-Update in den Voice-Adapter
  - Hub und Voice reagieren damit direkt auf den Toggle-Wechsel
  - kein Reload und kein spaeteres Nachziehen noetig
- Verifikation:
  - `node --check` gruen fuer:
    - `app/modules/assistant-stack/voice/index.js`
    - `app/modules/hub/index.js`

#### A3.8 Ergebnisprotokoll
- Die bestehenden Boot-/Auth-/Voice-Gates sind gegen den neuen Assistant-Toggle gelesen und bleiben darunter erhalten.
- Bestaetigt:
  - `assistant-surface-off` ist nur ein zusaetzlicher frueher Produkt-Surface-Blocker
  - darunter bleiben die bisherigen produktiven Gate-Gruende unveraendert bestehen:
    - `booting`
    - `auth-check`
    - weitere bestehende Voice-Blocker
- Hub-/Voice-Integration:
  - Hub liest weiter denselben Gate-Status ueber `getVoiceGateStatus()` / `onGateChange(...)`
  - Voice aktualisiert den Gate-Status auch nach Assistant-Toggle-Aenderungen sofort neu
  - damit entstehen keine getrennten Gate-Welten fuer Hub und Voice
- Wichtige Guardrail:
  - `assistant-surface-off` ersetzt keine Boot-/Auth-Pruefung
  - er ueberlagert nur die Produktpraesenz des Voice-Einstiegs
  - sobald `on` aktiv ist, greifen die normalen produktiven Gates wieder allein
- Wichtigster A3.8-Befund:
  - der Toggle fuehrt keinen eigenen technischen Gate-Stack ein
  - er nutzt den bestehenden Gate-Pfad und fuegt nur einen engen Produktzustand hinzu

#### A3.9 Ergebnisprotokoll
- Der gesamte Toggle-Schnitt ist als Abschlusscheck gegen den definierten Produktvertrag geprueft.
- Live bestaetigt:
  - Touch-Log-Toggle ist bedienbar und persistent
  - `off`
    - Text-Assistant ist aus Karussell und Quickbar entfernt
    - OG-MIDAS-Nadel bleibt beim Start sichtbar
    - Nadel ist nicht triggerbar
    - kein sichtbares Voice-Statuslabel
    - nach der ersten Karussell-Bewegung verschwindet die passive Nadel wieder
  - `on`
    - Text-Assistant wird wieder sichtbar
    - Voice-Slot bleibt im Karussell
    - Umschaltung funktioniert live
- Technisch bestaetigt:
  - kein zweiter Assistant-Stack
  - kein zweiter Parserpfad
  - kein neuer Boot-/Auth-/Voice-Gatestack
  - keine toten sichtbaren Text- oder Voice-Einstiege im aktuellen Schnitt
- Verifikation:
  - `node --check` gruen fuer:
    - `app/diagnostics/devtools.js`
    - `app/modules/hub/index.js`
    - `app/modules/assistant-stack/voice/index.js`
- Abschlussbefund:
  - `A3` ist damit `DONE`
  - `A4` kann jetzt den sichtbaren Assistant-Kontext in einen normalen Hub-Dashboard-Surface uebersetzen

### A4 - Hero-Hub-Dashboard aus Assistant-Kontext produktisch hochziehen
- A4.1 Bestehenden Assistant-Kontext als Datenvertrag lesen:
  - Wasser
  - Salz
  - Protein
  - Proteinziel
  - naechste 2 Termine
  - Restbudget
  - bestehender Copy-Kontext
- A4.2 Position und Surface im Hub schneiden:
  - Dashboard noerdlich des Hero-Hub als oberer Reveal-Surface
  - per `swipe down`, analog zur unteren Quickbar per `swipe up`
- A4.3 Layout- und Scope-Vertrag festziehen:
  - kompakter oberer Dashboard-Surface statt zweiter Vollansicht
  - dieselben bestehenden Datenquellen
  - keine neue Fachlogik
  - kein Chat-/Voice-Zwang fuer die Sichtbarkeit
- A4.4 Copy-Button-/Icon-Vertrag schneiden:
  - bestehende Copy-Aktion erhalten
  - deformiertes Symbol korrigieren
  - Copy bezieht sich weiter auf denselben produktiven Kontext-String
- A4.5 Produktiv anbinden:
  - Dashboard im Hub sichtbar machen
  - Daten produktiv speisen
  - Copy-Button anbinden
- A4.6 Check:
  - Hub-Dashboard ersetzt keine Fachmodule, bringt aber den nuetzlichen Assistant-Kontext in den normalen Hub zurueck

#### A4.1 Ergebnisprotokoll
- Der bestehende Assistant-Kontext ist gegen den aktuellen produktiven Hub-Code gelesen und als moeglicher Dashboard-Datenvertrag gespiegelt.
- Produktiv vorhandene Kontextbausteine:
  - Intake-Pills:
    - Wasser
    - Salz
    - Protein
  - Kontext-Extras:
    - Protein-Ziel
    - CKD
  - Termine:
    - bereits auf die naechsten `2` Upcoming-Items normalisiert
  - Expandable-Kontext:
    - Restbudget
    - Warnung bei Limitueberschreitung
  - Copy-Kontext:
    - erzeugt bereits einen bestehenden Snapshot-String mit:
      - Datum
      - Zeit
      - Wasser
      - Salz
      - Protein
      - Protein-Ziel
      - CKD
      - Termine
      - Restbudget
- Produktive Datenquellen heute:
  - `app/modules/hub/index.js`
    - `loadAssistantIntakeSnapshot(...)`
    - `fetchAssistantAppointments(...)`
    - `getAssistantProfileSnapshot(...)`
    - `buildAssistantContextSnapshotText()`
  - Intake kommt ueber denselben Capture-/Today-Snapshot wie der bestehende Assistant-Kontext.
  - Termine kommen ueber `appointments.getUpcoming(...)` bzw. denselben normalisierten Upcoming-Pfad.
  - Protein-Ziel / CKD / Salz-Limit kommen ueber den bestehenden Profile-Snapshot.
- Wichtigster Datenvertrags-Befund:
  - der moegliche Hub-Dashboard-Surface braucht fuer den ersten Schnitt keine neue Fachlogik
  - alle gewuenschten Kerndaten sind bereits als bestehender Hub-/Assistant-Kontext vorhanden oder ableitbar
  - das Dashboard sollte deshalb dieselben bestehenden Snapshot-/Render-Helfer nutzen oder eng daran andocken
- Explizite Grenze fuer die weitere Arbeit:
  - das Dashboard ist kein zweiter Chat-Kontext-Builder
  - keine neue Terminlogik jenseits der schon bestehenden `next 2`
  - keine neue Intake- oder Profile-Berechnung nur fuer das Dashboard
  - der bestehende Copy-Vertrag bleibt inhaltlich derselbe, auch wenn Button/Icon und Platzierung spaeter angepasst werden
- Zusatzbefund:
  - der aktuelle Copy-Button nutzt heute das Zeichen:
    - `&#x29C9;`
  - dieses Symbol wirkt im Produkt deformiert und passt nicht zu einem klaren Copy-Surface
  - der Icon-/Button-Schnitt gehoert deshalb berechtigt in `A4.4`

#### A4.2 Ergebnisprotokoll
- Die Position des moeglichen Hub-Dashboards ist gegen den aktuellen Hero-Hub-Aufbau gelesen und als eigener oberer Reveal-Surface geschnitten.
- Aktueller Hub-Aufbau heute:
  - Hero-Hub / Orbit / Karussell:
    - zentraler MIDAS-Hub mit Modulen im Karussell
  - Quickbar:
    - darunter als kompakte Schnellaktionen
  - Hub-Panels:
    - separate Vollflaechen-/Overlay-Panels fuer Module wie:
      - `assistant-text`
      - `intake`
      - `appointments`
      - `vitals`
- Zielposition fuer das neue Dashboard:
  - nicht als weiteres Hub-Panel
  - nicht innerhalb des `assistant-text`-Panels
  - nicht als normaler Scrollblock unterhalb des Hero
  - sondern als eigener oberer Reveal-Surface noerdlich des Hero-Hub
  - Sichtbarkeitsvertrag:
    - `swipe up` oeffnet weiter die Quickbar unterhalb
    - `swipe down` oeffnet das Dashboard oberhalb
- Produktiver Surface-Vertrag:
  - das Dashboard ist ein normaler Hub-Surface, aber kein permanenter Scrollblock
  - es haengt nicht an `assistant-text` sichtbar/unsichtbar
  - es bleibt damit auch bei Assistant-Toggle `off` zugaenglich
  - es ersetzt kein Fachpanel und oeffnet auch nicht automatisch eines
- Guardrail fuer die weitere Arbeit:
  - kein zweiter grosser "Assistant-Kasten" direkt im Hero
  - kein normales Scrollziel unter dem Hero
  - kein Panel-Dialog
  - kein erneuter Versuch, den Assistant-Panel-Body einfach in den Hub zu verschieben
  - stattdessen:
    - kompakter oberer Reveal-Surface
    - visuell verwandt mit der Quickbar-Mechanik, aber mit eigenem Dateninhalt
- Wichtigster A4.2-Befund:
  - die richtige Produktposition ist ein oberer Reveal-Surface per `swipe down`
  - gerade dadurch bleibt der Hero klar und Quickbar/Dashboard bekommen eindeutige Gestenrichtungen

#### A4.3 Ergebnisprotokoll
- Der Layout- und Scope-Vertrag fuer den ersten Hub-Dashboard-Schnitt ist gegen den bestehenden Assistant-Kontext und die Hub-Layoutstruktur festgezogen.
- Erster produktiver Dashboard-Scope:
  - oberste Reihe:
    - Wasser
    - Salz
    - Protein
  - zweite Reihe:
    - Protein-Ziel
    - CKD
  - Terminblock:
    - naechste `2` Termine
  - Abschlusszeile:
    - Restbudget
  - eigene kleine Action:
    - Copy des bestehenden Kontext-Snapshots
- Bewusst nicht Teil des ersten Dashboard-Schnitts:
  - kompletter Chat-Verlauf
  - Prompt-/Eingabefeld
  - Reset-Button des Assistant-Panels
  - "Mehr/Weniger"-Toggle aus dem bisherigen mobilen Panel-Kontext
  - Warnungen nur dann sichtbar, wenn bereits heute produktiv berechnet und sinnvoll vorhanden
- Produktiver Layout-Schnitt:
  - kompakter Dashboard-Surface mit mehreren kleinen Karten/Zeilen
  - visuell eher:
    - Quickbar-verwandt
    - ruhiger Daten-Surface
    - direkt lesbar ohne Chat-UI
  - explizit nicht:
    - zweites grosses Panel
    - kopierter Assistant-Panel-Body
    - eigener scrollender Unterdialog im Hub
- Daten-/Architekturgrenze:
  - dieselben bestehenden Render-/Snapshot-Daten
  - moeglichst Wiederverwendung der schon vorhandenen Assistant-Kontext-Helfer
  - keine zweite Pflege fuer dieselben Werte in einer Parallelstruktur
- Mobile-/Desktop-Folgerung:
  - der Surface soll ohne "Mehr"-Interaktion lesbar bleiben
  - Sichtbarkeit erfolgt ueber `swipe down`, nicht ueber Seiten-Scroll
  - mobile Reduktion erfolgt ueber kompaktes Layout und sinnvolle Reihenfolge, nicht ueber einen weiteren Assistant-spezifischen Expand-Mechanismus
- Wichtigster A4.3-Befund:
  - der neue Surface ist ein kompaktes Produkt-Dashboard, kein transplantierter Assistant-Panel-Ausschnitt
  - zusammen mit der oberen Reveal-Logik bleibt der Hub ruhig und die Daten bleiben trotzdem schnell erreichbar

#### A4.4 Ergebnisprotokoll
- Der Copy-Button-/Icon-Vertrag ist jetzt als erster echter Dashboard-naher UI-Baustein produktiv enger gezogen.
- Umgesetzt in:
  - `index.html`
  - `app/modules/hub/index.js`
  - `app/styles/hub.css`
- Produktiver Vertrag:
  - die bestehende Copy-Aktion bleibt erhalten
  - Copy bezieht sich weiter auf denselben produktiven Snapshot-String aus:
    - `buildAssistantContextSnapshotText()`
  - das deformierte fontabhaengige Sonderzeichen ist entfernt
  - der Idle-Zustand nutzt jetzt ein stabiles eingebettetes Copy-SVG statt eines fragilen Unicode-Symbols
  - Success/Error bleiben weiterhin direkte kurze Button-Rueckmeldungen
- Wichtigster Implementierungsschnitt:
  - der Icon-Vertrag ist jetzt fontunabhaengig und damit spaeter auch fuer den Hub-Dashboard-Surface wiederverwendbar
  - die Fachseite der Copy-Aktion wurde nicht veraendert, nur ihre produktive Oberflaeche
- Verifikation:
  - `node --check` gruen fuer:
    - `app/modules/hub/index.js`
- Wichtigster A4.4-Befund:
  - der Copy-Button ist jetzt kein kaputter Sonderzeichen-Carrier mehr
  - damit ist der Surface sauber genug, um in `A4.5` in das neue Hub-Dashboard uebernommen zu werden

#### A4.5 Ergebnisprotokoll
- Das kompakte Hub-Dashboard ist jetzt produktiv als oberer Reveal-Surface ueber dem Hero-Hub angebunden.
- Umgesetzt in:
  - `index.html`
  - `app/styles/hub.css`
  - `app/modules/hub/index.js`
- Produktives Verhalten:
  - neuer oberer Hub-Surface ueber dem Hero-Hub
  - initial verborgen
  - `swipe down` auf dem Orbit oeffnet das Dashboard
  - `swipe up` oeffnet weiter die Quickbar
  - Hero/Karussell ist die neutrale Mittelebene
  - Gesten bewegen immer nur eine Ebene:
    - Mitte -> oben
    - oben -> Mitte
    - Mitte -> unten
    - unten -> Mitte
  - Quickbar und Dashboard bleiben nicht gleichzeitig offen
  - zeigt:
    - Wasser
    - Salz
    - Protein
    - Protein-Ziel
    - CKD
    - naechste `2` Termine
    - Restbudget
  - eigener Copy-Button im Dashboard
  - dieselbe bestehende Snapshot-Copy-Aktion wie im Assistant-Kontext
- Implementierungsschnitt:
  - Dashboard haengt an denselben produktiven Snapshot-/Render-Helfern wie der bestehende Assistant-Kontext
  - Intake-, Profile- und Appointment-Werte werden nicht neu berechnet
  - Assistant-Panel und Hub-Dashboard werden aus demselben Refresh-Pfad gespeist
  - Copy-Status wird fuer Panel und Dashboard gemeinsam rueckgemeldet
- Guardrail:
  - kein neuer Chat- oder Panel-Surface
  - keine neue Fachlogik
  - kein zweiter Kontext-Builder
- Verifikation:
  - `node --check` gruen fuer:
    - `app/modules/hub/index.js`
- Wichtigster A4.5-Befund:
  - der nuetzliche Assistant-Kontext ist jetzt nicht mehr an den Assistant-Panel-Surface gebunden
  - damit kommt der praktische Alltagswert in den normalen Hub zurueck, auch wenn Assistant/Voice in der zweiten Reihe bleiben

#### A4.6 Ergebnisprotokoll
- Der gesamte Dashboard-Schnitt ist gegen Produktvertrag, Live-Verhalten und Scope-Grenzen geprueft.
- Live bestaetigt:
  - Dashboard erscheint nicht mehr als falscher Scrollblock
  - `swipe down` oeffnet den oberen Dashboard-Surface
  - `swipe up` oeffnet die unteren Quicklinks
  - Hero/Karussell bleibt als neutrale Mittelebene erhalten
  - ein weiterer Gegenswipe fuehrt jeweils sauber in die Mitte zurueck
- Produktisch bestaetigt:
  - kein direkter Sprung mehr von Dashboard zu Quicklinks oder umgekehrt
  - Dashboard und Quicklinks bleiben getrennte Reveal-Surfaces
  - der Dashboard-Surface nutzt denselben bestehenden Assistant-Kontext, ohne neue Fachlogik einzufuehren
  - der Copy-Vertrag bleibt konsistent zwischen Assistant-Panel und Hub-Dashboard
- Wichtige Restgrenze:
  - Feinschliff an Typografie, Abstaenden oder spaeteren Zusatzdaten bleibt moeglich
  - fuer den ersten Schnitt ist der Surface-Vertrag aber produktiv klar genug und funktional belastbar
- Abschlussbefund:
  - `A4` ist damit `DONE`
  - `A5` kann jetzt Regression, Doku und QA auf den realen Toggle-/Dashboard-Zustand ziehen

### A5 - Regression, Doku und QA fuer den Toggle-/Dashboard-Schnitt nachziehen
- A5.1 Modul-Overviews auf den neuen Sichtbarkeitsvertrag ziehen.
- A5.2 `docs/QA_CHECKS.md` um den neuen `off/on`-Produktzustand und das Hub-Dashboard ergaenzen.
- A5.3 Pruefen, dass Text-/Voice-/Hub-Flow bei `on` weiter normal laufen.
- A5.4 Pruefen, dass bei `off` keine toten Buttons, keine halbaktiven Needle-Zustaende und kein UI-Drift sichtbar bleiben.
- A5.5 Pruefen, dass das neue Hub-Dashboard keine doppelte Fachlogik oder inkonsistente Werte einfuehrt.
- A5.6 Check:
  - Doku, QA und Runtime beschreiben denselben Produktzustand

#### A5.1 Ergebnisprotokoll
- Die betroffenen Modul-Overviews sind auf den neuen Sichtbarkeitsvertrag gezogen.
- Nachgezogen:
  - `docs/modules/Assistant Module Overview.md`
  - `docs/modules/Hub Module Overview.md`
- Assistant-Doku beschreibt jetzt:
  - `off/on` als Surface-Vertrag statt zweiten Modus
  - den ausgelagerten Kontextwert im Hub-Dashboard
- Hub-Doku beschreibt jetzt:
  - passive Startnadel bei `off`
  - produktiven Voice-Slot bei `on`
  - oberen Dashboard-Reveal per `swipe down`
  - untere Quickbar per `swipe up`

#### A5.2 Ergebnisprotokoll
- `docs/QA_CHECKS.md` ist um einen eigenen produktiven Sweep fuer Toggle und Dashboard erweitert.
- Neue Phase:
  - `Phase A5 - Assistant Surface Toggle & Hub Dashboard (2026-03-18)`
- Enthalten:
  - Toggle- und Persistenzchecks
  - Needle-/Text-Surface-Checks
  - Dashboard-/Quickbar-Reveal-Checks
  - Copy-/Snapshot-Checks
  - Regressionen fuer `off/on` und konsistente Datenwerte

#### A5.3 Ergebnisprotokoll
- Der produktive `on`-Vertrag bleibt im Doku-/QA-Schnitt explizit abgesichert:
  - Text-Assistant sichtbar
  - Voice-Slot sichtbar
  - bestehende Text-/Voice-/Hub-Flows unveraendert nutzbar
- Es wurde kein Doku-Schnitt eingefuehrt, der `on` wie einen Sondermodus oder Debugzustand beschreibt.

#### A5.4 Ergebnisprotokoll
- Der produktive `off`-Vertrag ist jetzt in Doku und QA klar gegen halbfertige UI-Zustaende abgesichert:
  - keine toten Text-Einstiege
  - keine halbaktive Nadel
  - kein sichtbares Voice-Statuslabel im passiven Startzustand
  - kein UI-Drift nach der ersten Carousel-Bewegung

#### A5.5 Ergebnisprotokoll
- Das neue Hub-Dashboard ist dokumentarisch klar gegen doppelte Fachlogik abgegrenzt.
- Festgezogen:
  - dieselben bestehenden Snapshot-/Render-Helfer
  - kein zweiter Kontext-Builder
  - kein eigener Termin- oder Intake-Rechenpfad
  - Copy bleibt derselbe produktive Snapshot-String

#### A5.6 Ergebnisprotokoll
- Abschlusscheck fuer den Toggle-/Dashboard-Schnitt durchgefuehrt.
- Bestaetigt:
  - Roadmap, Modul-Overviews und `QA_CHECKS` beschreiben jetzt denselben realen Produktzustand
  - der sichtbare Assistant-Rueckzug ist sauber dokumentiert, ohne die Architektur falsch als "geparkt" darzustellen
  - das Hub-Dashboard ist als eigener produktiver Surface beschrieben und nicht mehr als Assistant-Panel-Altlast
- Abschlussbefund:
  - `A5` ist damit `DONE`
  - `A6` bleibt der naechste saubere Future-/Follow-up-Block

### A6 - Voice-Robustheits-Follow-up fuer spaeteren Sprint sauber einordnen
- A6.1 Alltagsbefunde dokumentieren:
  - lauter / exakter sprechen noetig als gewuenscht
  - soziale Awkwardness im echten Umfeld
  - natuerliche Einleitungsphrasen verschlechtern Compound-Erkennung
- A6.2 Technische Folgerungen nur einordnen, nicht vorschnell bauen:
  - VAD-/Noise-/Empfindlichkeitsfrage
  - semantische Filler wie `kannst du mir bitte`
  - spaeterer Outside-the-app-Voice-Start
- A6.3 Klar trennen:
  - kurzfristiger Produkt-UX-Toggle
  - spaeterer Voice-Robustheits-/TWA-/Wrapper-Scope
- A6.4 Abschlusscheck:
  - naechster Sprint startet nicht diffus, sondern mit klar getrennten Follow-up-Richtungen

#### A6.1 Ergebnisprotokoll
- Die realen Alltagsbefunde aus dem ersten offenen Voice-Einsatz sind jetzt explizit festgehalten.
- Bestaetigt:
  - Voice funktioniert grundsaetzlich, verlangt im Alltag aber noch zu oft:
    - relativ lautes Sprechen
    - relativ exakte Aussprache
  - dadurch entsteht im echten Umfeld eine spuerbare soziale Awkwardness
  - natuerlich ausgesprochene Einleitungssaetze wie:
    - `Kannst du mir bitte ...`
    verschlechtern den produktiven Compound-Fast-Path gegenueber nackten Command-Formen
- Wichtigster A6.1-Befund:
  - die aktuelle Voice-Basis ist brauchbar, aber noch nicht niedrigschwellig genug fuer selbstverstaendliche Alltagsnutzung

#### A6.2 Ergebnisprotokoll
- Die technischen Folgerungen sind jetzt als spaetere Hebel eingeordnet, ohne vorschnell neuen Scope in diesen Sprint zu ziehen.
- Relevante spaetere Hebel:
  - Akustik-/Empfindlichkeitsschicht:
    - VAD
    - Noise Floor
    - Eingangspegel / leiseres Sprechen
  - Semantik-/Natural-Language-Schicht:
    - Filler wie `kannst du mir bitte`
    - natuerlichere Einleitungen vor ansonsten klaren Commands
  - Entry-Point-Schicht:
    - echter Voice-Start ausserhalb der sichtbaren App
    - langfristig eher TWA / Wrapper / nativerer Scope statt PWA-Shortcut
- Guardrail:
  - diese Punkte sind bewusst als Follow-up-Hebel dokumentiert
  - sie werden hier nicht halb umgesetzt

#### A6.3 Ergebnisprotokoll
- Die Scope-Trennung ist jetzt explizit saubergezogen.
- Kurzfristiger Produkt-UX-Schnitt:
  - Assistant-/Voice-Sichtbarkeit in die zweite Reihe
  - Toggle
  - Hub-Dashboard fuer den nuetzlichen Kontext
- Spaeterer Voice-Robustheits-/Entry-Point-Schnitt:
  - akustische Robustheit
  - semantische Natuerlichkeit
  - TWA / Wrapper / externerer Voice-Start
- Wichtigster A6.3-Befund:
  - der aktuelle Produktzustand wird nicht mit spaeteren Voice-Ambitionen vermischt
  - dadurch bleibt der naechste Sprint fokussiert statt diffus

#### A6.4 Ergebnisprotokoll
- Abschlusscheck fuer die Future-Einordnung durchgefuehrt.
- Bestaetigt:
  - der aktuelle Roadmap-Block endet mit einem klaren produktiven Zustand
  - offene Voice-Themen sind nicht verloren, aber sauber aus dem aktuellen Scope herausgeloest
  - der naechste spaetere Voice-Sprint kann auf echten Alltagsbefunden aufsetzen:
    - leiseres Sprechen
    - Filler-/Natursprache
    - externer Voice-Entry
- Abschlussbefund:
  - `A6` ist damit `DONE`
  - die gesamte `Assistant Visibility + Voice Robustness Roadmap` ist damit insgesamt `DONE`
