# Hub Dashboard + Passive Needle Polish Roadmap

## Ziel
Der neue obere Hub-Context-Surface und der passive OG-MIDAS-Startanker sollen nach dem ersten Real-Life-Test UX-seitig nachgeschnitten werden, ohne den bewusst klein gehaltenen Assistant-/Voice-Produktvertrag wieder aufzublasen.

Im Fokus stehen zwei konkrete Produktmaengel:
- das obere Dashboard soll sich bei relevanten Intake-Aenderungen genauso verlaesslich mitziehen wie der fruehere Assistant-Kontext
- der passive Startanker bei `assistant off` soll sich im Karussell intuitiver lesen und nicht wie ein technischer Sonderfall wirken

Parallel dazu soll der moegliche naechste UX-Schnitt fuer die Nadel sauber eingeordnet werden:
- nicht nur Platzhalter am Start
- sondern moeglichst ein echtes erstes Karussell-Icon
- mit der einzigen Besonderheit, dass es nach der ersten echten Bewegung aus der regulaeren Rotation faellt

## Pruefbare Zieldefinition
- Das obere Dashboard aktualisiert sich nach normalen Intake-Saves verlaesslich mit denselben relevanten Daten wie der bestehende Assistant-Kontext.
- Der erste Swipe bei `assistant off` fuehlt sich nicht mehr wie ein unerklaerlicher Sprung oder Sonderfall an.
- Der passive OG-MIDAS-Anker ist als eigener UX-Vertrag dokumentiert:
  - entweder als bewusst passiver Startanker
  - oder als ephemeres echtes erstes Karussell-Icon
- Kein neuer Assistant-Modus, kein neuer Voice-Stack und keine neue Hub-Fachlogik werden dafuer eingefuehrt.

## Scope
- Vergleich von Assistant-Kontext und oberem Dashboard gegen denselben Daten-/Refresh-Vertrag.
- Analyse und Korrektur des ersten Swipe-Verhaltens bei `assistant off`.
- Produktische Einordnung des naechsten moeglichen Nadel-Vertrags.
- Doku-Nachzug nur dort, wo sich der tatsaechliche Produktvertrag veraendert.

## Not in Scope
- Kein neuer Voice-/Assistant-Refactor.
- Kein Undo des Toggle-Vertrags.
- Kein genereller Hub-Redesign-Sprint.
- Kein TWA-/Wrapper-/Outside-the-app-Voice-Scope.

## Relevante Referenzen
- `app/modules/hub/index.js`
- `app/modules/intake-stack/intake/index.js`
- `docs/modules/Hub Module Overview.md`
- `docs/modules/Assistant Module Overview.md`
- `docs/QA_CHECKS.md`
- `docs/archive/Assistant Visibility + Voice Robustness Roadmap (DONE).md`

## Guardrails
- Das obere Dashboard bleibt ein Hub-Surface, kein versteckter zweiter Assistant.
- Der passive Nadel-Schnitt darf die normale Karussell-Logik nicht weiter verkomplizieren als noetig.
- Ein kuenftiger besserer Nadel-Vertrag soll die UX vereinfachen, nicht einen neuen Spezialfallstapel schaffen.
- Assistant `off` bleibt ein Sichtbarkeits-/Triggerbarkeitsvertrag, kein technischer Re-Park-Modus.

## Statusmatrix
| ID | Schritt | Status | Ergebnis/Notiz |
|---|---|---|---|
| B1 | Dashboard-Refresh-Vertrag gegen den frueheren Assistant-Kontext vergleichen und nachziehen | DONE | Gemeinsamer Renderer bleibt erhalten; normaler Intake-Save und beide Surfaces haengen jetzt an demselben direkten Refresh-Vertrag |
| B2 | Passiven Nadel-/Erst-Swipe-Schnitt im Karussell sauber nachziehen | DONE | Ist-Pfad, UX-Bruch und Zielvertrag fuer die passive Nadel sind jetzt klar; der naechste technische Schnitt kann daran sauber ansetzen |
| B3 | Naechsten besseren Nadel-Vertrag fuer spaeteren oder direkten Ausbau festziehen | DONE | Die passive Nadel ist jetzt auf einen klareren Produktivschnitt als ephemeres erstes Karussell-Icon gezogen; B2/B3 wurden danach nochmals gegen toten Code und Altpfade geprueft |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Schritte

### B1 - Dashboard-Refresh-Vertrag gegen den frueheren Assistant-Kontext vergleichen und nachziehen
- B1.1 Den aktuellen Refresh-Pfad des oberen Dashboards gegen den frueheren Assistant-Kontext lesen.
- B1.2 Die relevante Luecke zwischen beiden Pfaden isolieren:
  - welche Daten
  - welche Events
  - welcher Renderzeitpunkt
- B1.3 Den engeren gemeinsamen Refresh-Vertrag produktiv nachziehen.
- B1.4 Check:
  - normales Intake-Save zieht das obere Dashboard sichtbar mit
  - kein unnoetiger zweiter Refresh-Stack entsteht
  - Assistant-Kontext und Dashboard driften nicht wieder auseinander

### B2 - Passiven Nadel-/Erst-Swipe-Schnitt im Karussell sauber nachziehen
- B2.1 Den heutigen `assistant off`-Pfad konkret lesen:
  - sichtbare Startnadel
  - erste Bewegung
  - Folgezustand
- B2.2 Isolieren, warum sich der erste Swipe heute unnatuerlich oder zu technisch anfuehlt.
- B2.3 Den aktuellen Produktivschnitt so korrigieren, dass der erste Swipe logisch lesbar wird.
- B2.4 Check:
  - kein unerklaerlicher Skip
  - kein harter Sprung zwischen Sonderzustand und normalem Karussell
  - bestehender `assistant on`-Pfad bleibt unberuehrt

### B3 - Naechsten besseren Nadel-Vertrag fuer spaeteren oder direkten Ausbau festziehen
- B3.1 Den Brainstorm-Schnitt explizit modellieren:
  - OG-Nadel als echtes erstes Karussell-Icon
  - gleiche visuelle Behandlung wie andere Icons
  - nicht triggerbar
  - nach erster echter Bewegung nicht mehr Teil der regulaeren Rotation
- B3.2 Gegen den aktuellen Hub-/Carousel-Vertrag lesen:
  - einfacher
  - intuitiver
  - weniger Spezialfall
- B3.3 Entscheidung schneiden:
  - sofort umsetzen
  - als spaeteren kleinen Follow-up behalten
- B3.4 Check:
  - der gewaehlte Vertrag ist klar genug fuer Hub-Doku und spaetere Umsetzung
  - keine diffuse Zwischenloesung bleibt liegen

#### B2.1 Ergebnisprotokoll
- Der heutige `assistant off`-Pfad fuer die passive Nadel ist konkret gegen den produktiven Hub-Code gelesen.
- Startzustand:
  - in `app/modules/hub/index.js`
    - `activateHubLayout()`
  - wird bei `assistant off` gesetzt:
    - `carouselState.showPassiveVoiceAnchor = !isAssistantSurfaceEnabled()`
  - dadurch wird `assistant-voice` trotz deaktivierter Assistant-Surface zunaechst sichtbar in die Karussell-Item-Liste aufgenommen
- Folgezustand im Karussell:
  - `getVisibleCarouselModules()` behandelt die Nadel bei `assistant off` nicht als normalen permanenten Assistant-Slot
  - sondern als sichtbaren Startanker ueber:
    - `shouldShowVoiceAnchor()`
    - `carouselState.showPassiveVoiceAnchor`
- Erster Bewegungszeitpunkt:
  - in `shiftCarousel(...)`
  - wird bei `assistant off` und gesetztem `showPassiveVoiceAnchor` sofort zuerst:
    - `carouselState.showPassiveVoiceAnchor = false`
    - `refreshCarouselItems(...)`
    ausgefuehrt
  - die Nadel wird damit bei der ersten echten Bewegung intern aus der regulaeren Item-Liste entfernt
- Wichtigster `B2.1`-Befund:
  - die passive Nadel ist heute visuell ein Startanker
  - aber intern kein vollwertiges dauerhaftes Karussell-Icon
  - genau daraus entsteht der spaetere Eindruck eines Sonderfalls statt eines natuerlichen ersten Karussell-Slots

#### B2.2 Ergebnisprotokoll
- Die Ursache fuer den unnatuerlichen ersten Swipe ist UX-seitig isoliert.
- Der eigentliche Bruch ist nicht nur:
  - dass sich die Nadel nach der ersten Bewegung entfernt
- sondern:
  - **wann** und **wie** das geschieht
- Aktueller Produktivschnitt:
  - der User sieht beim Start ein scheinbar normales erstes Karussell-Icon
  - beim ersten Swipe wird dieses Icon aber intern vor oder waehrend derselben Interaktion aus der Item-Liste entfernt
  - dadurch stimmt die sichtbare Karussell-Logik nicht ganz mit der internen Item-Logik ueberein
- UX-Wirkung:
  - die Nadel liest sich nicht wie ein echtes erstes Karussell-Element
  - sondern wie ein besonderer Platzhalter, der beim ersten echten Karussellkontakt ploetzlich verschwindet
  - selbst wenn der technische Skip schon korrigiert ist, bleibt dadurch ein Restgefuehl von:
    - Sprung
    - Sonderfall
    - nicht ganz intuitiver Rotation
- Wichtigster `B2.2`-Befund:
  - das Problem ist heute primaer kein Daten- oder Index-Bug mehr
  - sondern eine Inkonsistenz zwischen sichtbarer Erwartung und internem Karussell-Vertrag
- Praktische Folgerung fuer `B2.3`:
  - der aktuelle Produktivschnitt muss entweder:
    - klarer als passiver Startanker lesbar werden
    - oder naeher an ein echtes erstes Karussell-Icon heranruecken

#### B2.3 Ergebnisprotokoll
- Der Zielvertrag fuer den `assistant off`-Pfad ist jetzt bewusst in Richtung eines echten Karussell-Icons geschnitten.
- Produktentscheidung:
  - die OG-MIDAS-Nadel soll bei `assistant off` nicht laenger nur wie ein Platzhalter gelesen werden
  - sie soll sich moeglichst wie ein echtes erstes Karussell-Icon verhalten
- Konkret heisst das:
  - beim Start ist sie ein sichtbarer erster Karussell-Slot
  - sie nimmt an der ersten Rotation moeglichst normal teil
  - sie bleibt fachlich trotzdem speziell:
    - nicht triggerbar
    - kein produktiver Voice-Einstieg
  - nach der ersten echten Bewegung faellt sie aus der regulaeren Rotation heraus
- Wichtigster Qualitaetsanspruch:
  - ihr Austritt soll nicht wie ein interner Vorgriff mitten in derselben Interaktion wirken
  - sondern wie ein lesbarer Uebergang von:
    - Startanker
    - zu normalem Hub-Karussell
- Guardrails:
  - `assistant on` bleibt unveraendert permanenter Voice-Slot
  - kein zweiter Assistant-Modus
  - keine neue Hub-Fachlogik
  - keine neue Voice-Gate-Sonderarchitektur
- Praktische Folgerung:
  - `B2` ist damit nicht mehr nur Bugfix
  - sondern ein kleiner UX-Vertragsnachschnitt
  - `B3` wird dadurch eher Feinschnitt/Validierung dieses Modells als komplett neue Richtung

#### B2.4 Ergebnisprotokoll
- Der Abschlusscheck fuer den passiven Nadel-/Erst-Swipe-Schnitt ist gegen Produktklarheit und Scope gelesen.
- Bestaetigt:
  - der aktuelle Problemkern ist jetzt sauber benannt:
    - nicht primaer Datenfehler
    - nicht primaer Indexfehler
    - sondern ein UX-Vertragsbruch zwischen sichtbarer Startnadel und interner Item-Logik
  - der gewuenschte Zielzustand ist ebenfalls klar:
    - die Nadel bei `assistant off` soll moeglichst wie ein echtes erstes Karussell-Icon wirken
    - ohne dabei wieder produktiver Voice-Einstieg zu werden
- Ebenfalls bestaetigt:
  - `assistant on` bleibt davon fachlich getrennt und unveraendert
  - kein zweiter Assistant-Modus ist dafuer noetig
  - kein neuer Hub-Fachpfad ist dafuer noetig
- Wichtigster Abschlussbefund:
  - `B2` ist fuer den aktuellen Stand ausreichend klar geschnitten
  - der naechste technische Schritt muss nicht mehr erst die Problemdefinition suchen
  - sondern kann direkt auf dem jetzt klaren UX-Zielvertrag aufsetzen

#### B3.1 Ergebnisprotokoll
- Der technische Zielvertrag fuer die passive OG-MIDAS-Nadel ist konkret modelliert.
- Gewuenschtes Modell bei `assistant off`:
  - die Nadel ist zunaechst ein echtes erstes Karussell-Item
  - sie nutzt dieselbe sichtbare Rotationslogik wie die anderen Hub-Icons
  - sie bleibt dennoch fachlich speziell:
    - nicht triggerbar
    - kein aktiver Voice-Einstieg
- Verhalten bei der ersten echten Bewegung:
  - die erste Rotation soll wie eine normale Karussellbewegung lesbar sein
  - erst **nach** diesem lesbaren Uebergang faellt die Nadel aus der regulaeren Item-Liste
  - der Hub laeuft danach mit der normalen Nicht-Assistant-Liste weiter
- Technische Lesart:
  - nicht mehr:
    - Startanker, der waehrend derselben ersten Interaktion intern schon verschwindet
  - sondern:
    - ephemeres erstes echtes Karussell-Icon
- Guardrails fuer die spaetere Umsetzung:
  - kein neuer permanenter Voice-Slot bei `assistant off`
  - keine neue Voice-Gate-Sonderarchitektur
  - `assistant on` bleibt vollstaendig unveraendert
  - die Nadel darf optisch/rotatorisch normal, aber fachlich nicht aktiv sein

#### B3.2 Ergebnisprotokoll
- Der modellierte Zielvertrag ist gegen den aktuellen Hub-/Carousel-Schnitt gelesen.
- Vergleich zum heutigen Produktivzustand:
  - heute:
    - die Nadel sieht wie ein echtes erstes Karussell-Icon aus
    - ist intern aber schon beim ersten echten Karussellkontakt nur halb ein regulaeres Item
  - Zielvertrag:
    - sichtbare und interne Logik liegen naeher beieinander
    - was wie ein Karussell-Icon aussieht, verhaelt sich auch zunaechst wie eines
- Warum das Modell einfacher wirkt:
  - weniger Widerspruch zwischen:
    - sichtbarer Startszene
    - interner Item-Logik
  - weniger Bedarf, dem User gedanklich einen Sonderfall zu erklaeren
  - klarerer Uebergang von:
    - Startanker
    - zu normalem Hub-Karussell
- Warum das Modell intuitiver wirkt:
  - der erste Swipe bleibt lesbar als normale Rotation
  - die Nadel verschwindet nicht gefuehlt "unter" der ersten Interaktion
  - der Hub fuehlt sich weniger wie Sonderlogik und mehr wie ein konsistenter Carousel an
- Wichtigster `B3.2`-Befund:
  - der modellierte Vertrag ist UX-seitig klarer als der heutige Platzhalter-Schnitt
  - er erhoeht die Produktkonsistenz, ohne den Assistant-/Voice-Vertrag wieder auszuweiten

#### B3.3 Ergebnisprotokoll
- Der modellierte Nadel-Vertrag ist als erster produktiver Umsetzungsschnitt im Hub eingebaut.
- Umgesetzter Schnitt in:
  - `app/modules/hub/index.js`
- Verhalten jetzt:
  - bei `assistant off` wird der erste Swipe nicht mehr zunaechst gegen eine bereits intern entfernte Nadel gerechnet
  - stattdessen laeuft die erste Bewegung noch gegen die echte Startliste mit sichtbarer Nadel
  - der Swipe landet lesbar auf dem naechsten regulaeren Modul
  - erst danach faellt die Nadel aus der regulaeren Rotation heraus
- Wichtig:
  - die Nadel bleibt weiter:
    - optisch praesent
    - nicht triggerbar
    - kein Voice-Einstieg bei `assistant off`
  - `assistant on` bleibt vom neuen Schnitt unberuehrt
- Qualitativer Effekt:
  - erster Swipe liest sich naeher an einer normalen Karussellbewegung
  - der bisherige Eindruck eines "intern schon verschwundenen" Startankers wird reduziert

#### B3.4 Ergebnisprotokoll
- Der Abschlusscheck fuer den verbesserten Nadel-Vertrag ist gegen Produktklarheit und technische Einfachheit gelesen.
- Bestaetigt:
  - der gewaehlte Schnitt ist klarer als der fruehere Platzhaltervertrag
  - die Nadel bei `assistant off` bleibt weiter:
    - nicht triggerbar
    - kein Voice-Einstieg
    - nur Startanker fuer den ruhigen Nicht-Assistant-Zustand
  - ihre erste sichtbare Bewegung liest sich jetzt naeher wie ein normaler Karussellschritt
- Ebenfalls bestaetigt:
  - `assistant on` bleibt unveraendert permanenter Voice-Slot
  - kein neuer Assistant-Modus ist eingefuehrt worden
  - kein zweiter Hub-/Carousel-Stack ist entstanden
- Wichtigster Abschlussbefund:
  - die passive Nadel ist jetzt nicht mehr nur als lose Brainstorm-Idee beschrieben
  - sondern als klarer kleiner Produktivvertrag mit passender Umsetzung
  - `B3` ist damit `DONE`

#### Nachtraeglicher Review-Stand
- `B2` und `B3` wurden nach der Umsetzung nochmals deterministisch gegen den aktuellen Hub-Code gelesen.
- Bestaetigt:
  - kein zweiter Hub-/Voice-Sonderstack fuer denselben Zweck
  - kein zweiter Dashboard-/Carousel-Renderer
  - der neue `B3`-Schnitt laeuft ueber denselben Hub-Karussell-Mechanismus
- Bereinigter Altrest:
  - in `app/modules/hub/index.js` wurde ein alter `assistant-voice`-Fallback aus `shiftCarousel(...)` entfernt, der nach dem neuen Promote-Schnitt nicht mehr sinnvoll war
  - in `index.html` wurde der auskommentierte alte Quickbar-Voice-Button als Legacy-Markup-Rest entfernt
- Wichtigster Review-Befund:
  - der kleine Block endet nicht mit halb altem Sondercode
  - sondern mit einem aufgeraeumten, nachvollziehbaren Produktivschnitt

#### B1.1 Ergebnisprotokoll
- Der aktuelle Refresh-Pfad des oberen Dashboards wurde gegen den frueheren Assistant-Kontext gelesen.
- Wichtigster Struktur-Befund:
  - beide Surfaces haengen heute am selben Render-/Context-Pfad in:
    - `app/modules/hub/index.js`
    - `refreshAssistantContext(...)`
  - derselbe Pfad rendert bereits fuer beide:
    - Intake-Pills
    - Termine
    - Profilextras
    - Restbudget-/Expandable-Kontext
- Der relevante Unterschied lag deshalb nicht im Datenmodell, sondern im Einstieg:
  - der Text-Assistant bekam schon vorher explizite Refresh-Punkte ueber:
    - `assistant:init`
    - `assistant:panel-open`
    - `assistant:action-success`
    - `appointments:changed`
    - `profile:changed`
  - das obere Dashboard war zwar an denselben Renderer angebunden, bekam aber die normalen Intake-UI-Saves urspruenglich nicht verlaesslich mit
- Vergleich mit dem Intake-Save-Pfad:
  - normale Saves in `app/modules/intake-stack/intake/index.js` aktualisierten Capture-/UI-Status lokal
  - es fehlte aber zunaechst ein eigener Hub-/Dashboard-tauglicher Event-Einstieg
- Praktische Folgerung fuer `B1.2`:
  - kein zweiter Dashboard-Renderer noetig
  - keine neue Fachlogik noetig
  - entscheidend ist ein enger gemeinsamer Refresh-Vertrag fuer normale Intake-Aenderungen

#### B1.2 Ergebnisprotokoll
- Die konkrete Luecke zwischen oberem Dashboard und frueherem Assistant-Kontext ist isoliert.
- Unterschied nach Event-Klasse:
  - der Text-Assistant bekam Refreshes bereits ueber Assistant-/Panel-nahe Ereignisse:
    - `assistant:init`
    - `assistant:panel-open`
    - `assistant:action-success`
    - `appointments:changed`
    - `profile:changed`
  - normale manuelle Intake-Saves im Capture-/Intake-UI liefen dagegen nur ueber:
    - lokalen Save
    - `captureIntakeState`
    - `updateCaptureIntakeStatus()`
    - `requestUiRefresh(...)`
  - genau dieser lokale UI-Save-Pfad war fuer den gemeinsamen Assistant-/Dashboard-Renderer urspruenglich kein eigener Trigger
- Unterschied nach Renderzeitpunkt:
  - der relevante Datenstand war direkt nach erfolgreichem Save lokal schon vorhanden
  - das obere Dashboard wartete aber auf spaetere, indirekte Refreshs
  - dadurch wirkte es im Alltag so, als ob der Text-Assistant aktueller waere als das obere Dashboard
- Wichtigster `B1.2`-Befund:
  - nicht der Snapshot war falsch
  - nicht der Dashboard-Renderer war falsch
  - sondern der gemeinsame Hub-/Assistant-Kontext hatte fuer normale Intake-Saves keinen engen, direkten Produktiv-Hook
- Praktische Folgerung fuer `B1.3`:
  - ein kleiner gemeinsamer Intake-Changed-Trigger ist der richtige Schnitt
  - derselbe bestehende `refreshAssistantContext(...)` bleibt der einzige Renderer
  - kein zweiter Dashboard-Refresh-Stack und keine neue Fachlogik noetig

#### B1.3 Ergebnisprotokoll
- Der engere gemeinsame Refresh-Vertrag fuer normale Intake-Aenderungen ist produktiv nachgezogen.
- Umgesetzter Schnitt:
  - in `app/modules/intake-stack/intake/index.js`
    - normale manuelle Intake-Saves emittieren jetzt explizit:
      - `capture:intake-changed`
    - sowohl fuer:
      - einzelne Wasser-/Salz-/Protein-Saves
      - als auch fuer den Salz+Protein-Kombopfad
  - in `app/modules/hub/index.js`
    - derselbe bestehende `refreshAssistantContext(...)` reagiert jetzt auf:
      - `capture:intake-changed`
- Wichtig:
  - es wurde kein zweiter Dashboard-Renderer eingefuehrt
  - es wurde kein neuer Fach-Snapshot gebaut
  - Assistant-Kontext und oberes Dashboard bleiben auf demselben Renderpfad
- Wirkung des Schnitts:
  - nach erfolgreichem normalem Intake-Save bekommt der gemeinsame Hub-/Assistant-Kontext jetzt denselben direkten Nachziehpunkt wie zuvor Assistant-nahe Aktionen
  - dadurch verschwindet die fruehere Asymmetrie zwischen:
    - lokal aktualisiertem Intake-Status
    - spaeter oder indirekt aktualisiertem oberen Dashboard

#### B1.4 Ergebnisprotokoll
- Der Abschlusscheck fuer den Dashboard-Refresh-Vertrag ist gegen Doppelstrukturen und Render-Drift gelesen.
- Bestaetigt:
  - `refreshAssistantContext(...)` bleibt der eine gemeinsame Render-/Context-Pfad
  - der neue `capture:intake-changed`-Hook fuehrt nur in denselben bestehenden Renderer
  - das obere Dashboard baut keinen eigenen Snapshot- oder Render-Stack auf
  - der fruehere Assistant-Kontext und das obere Dashboard bleiben weiterhin an denselben Datenquellen:
    - Intake-Snapshot
    - kommende Termine
    - Profil-Snapshot
- Ebenfalls bestaetigt:
  - es wurde keine zweite Fachlogik fuer Restbudget, Termine oder Proteinziel eingefuehrt
  - der neue Hook schliesst nur die Event-Luecke fuer normale Capture-/Intake-Saves
- Wichtigster Abschlussbefund:
  - es existieren jetzt nicht zwei verschiedene Systeme, die faktisch dasselbe tun
  - es gibt weiterhin einen gemeinsamen Context-Renderer mit einem jetzt vollstaendigeren Event-Vertrag
  - `B1` ist damit `DONE`
