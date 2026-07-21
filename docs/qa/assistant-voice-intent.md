# MIDAS QA - Assistant, Voice and Intent

Diese Suite besitzt aktuelle, statuslose Regressionstests mit dem Präfix
`AVI-`. Der allgemeine Testfall- und Evidence-Vertrag steht im
[QA-Einstieg](README.md).

## Zuständigkeit

- Assistant-Surface und Assistant-Kontext
- Intent Engine und Confirm-Flows
- Voice, VAD und Voice Command Semantics
- Assistant-, Voice- und Pending-Context-Anteile des Hubs

## Abgrenzung

- Fachnavigation wird nicht als zweiter Testfall kopiert; `AVI-` prüft nur den
  Assistant-/Voice-Anteil.
- Gesundheits-, Intake- und Push-Erwartungen bleiben in ihrer Domänensuite.
- Produktarchitektur bleibt in den zuständigen Module Overviews.

## Testfälle

### AVI-001 - Assistant-Surface bleibt bewusst opt-in

- Vertrag: [Assistant Module Overview](<../modules/Assistant Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: read-only
- Voraussetzung: Assistant-Einstellung kann zwischen `off` und `on` wechseln.
- Aktion: Hub in beiden Zuständen öffnen und Text- sowie Voice-Einstieg prüfen.
- Erwartung: Standardmäßig bleibt die Assistant-Oberfläche aus; Text und Voice
  werden erst im erlaubten Zustand zugänglich und zeigen den Runtime-Status.
- Invalidiert durch: Assistant-Setting, Hub-Surface, Voice-Gate oder Settings-UI.

### AVI-002 - Lokale Intake-Intents vermeiden den Assistant-Call

- Vertrag: [Intent Engine Module Overview](<../modules/Intent Engine Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: Lokaler Intent-Parser und ein beobachtbarer Assistant-Transport
  sind mit isolierten Intake-Adaptern verfügbar.
- Aktion: Eindeutige Wasser-, Salz- und Protein-Sätze mit Zahl und Einheit senden.
- Erwartung: Jeder Satz erzeugt den passenden lokalen Intent und keinen Aufruf
  von `midas-assistant`; Menge und Einheit bleiben unverändert.
- Invalidiert durch: Intent-Regeln, Normalisierung, Slot-Extraktion oder Routing.
- Cleanup: Isolierte Intake-Adapter und Teststate verwerfen.

### AVI-003 - Medication-Intent verlangt einen Tagesabschnitt

- Vertrag: [Voice Command Semantics](<../modules/Voice Command Semantics.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: Offene Medication-Slots für mehrere Tagesabschnitte sind
  isoliert vorhanden.
- Aktion: Einen Satz mit `morgens`, `mittags`, `abends` oder `nachts` und danach
  einen allgemeinen Satz ohne Abschnitt auswerten.
- Erwartung: Abschnittssätze zielen nur auf den genannten Slot; der allgemeine
  Satz erzeugt keinen direkten Write und fordert eine eindeutige Auswahl.
- Invalidiert durch: Medication-Intent, Daypart-Normalisierung oder Confirm-Pfad.
- Cleanup: Isolierte Medication-Fixtures verwerfen.

### AVI-004 - Pending Confirm gilt für Text und Voice

- Vertrag: [Assistant Module Overview](<../modules/Assistant Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: Suggest-Confirm und `ask_confirmation` können einen Pending
  Context erzeugen.
- Aktion: `ja`, `nein`, `speichern` und `abbrechen` ohne sowie mit aktivem
  Pending Context über Text und Voice senden.
- Erwartung: Ohne Pending Context entsteht keine Aktion; mit Pending Context
  wird genau die erwartete Aktion einmal ausgeführt oder verworfen.
- Invalidiert durch: Pending Context, Confirm-Resolver, Text- oder Voice-Routing.
- Cleanup: Pending Context und isolierten Action-Adapter zurücksetzen.

### AVI-005 - Compound Command verliert keinen Teilbefehl still

- Vertrag: [Voice Command Semantics](<../modules/Voice Command Semantics.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: Lokale Adapter für Wasser, Salz, Protein und Medikation sind
  isoliert instrumentiert.
- Aktion: Einen gültigen Mehrfachbefehl und einen Mehrfachbefehl mit einem
  ungültigen Teil senden.
- Erwartung: Der gültige Plan verarbeitet jede Unit genau einmal; ein ungültiger
  Teil wird sichtbar gemeldet und nicht als vollständiger Erfolg ausgegeben.
- Invalidiert durch: Command-Splitting, Plan-Ausführung, Fehleraggregation oder
  Fachadapter.
- Cleanup: Isolierte Intake- und Medication-Fixtures verwerfen.

### AVI-006 - Atemtimer-Intent bleibt eng begrenzt

- Vertrag: [Voice Command Semantics](<../modules/Voice Command Semantics.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: read-only
- Voraussetzung: Intent Engine und Atemtimer-Adapter sind instrumentiert.
- Aktion: Enge Timer-Sätze ohne Dauer, mit drei, mit fünf und mit nicht
  erlaubter freier Dauer auswerten.
- Erwartung: Ohne Dauer gelten drei Minuten, fünf nur explizit; freie Dauern und
  vage Wellness-Sätze starten keinen Timer.
- Invalidiert durch: Breath-Intent, Zahlen-Normalisierung oder Timer-Adapter.

### AVI-007 - VAD startet und stoppt kontrolliert

- Vertrag: [VAD Module Overview](<../modules/VAD Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: read-only
- Voraussetzung: Mikrofonberechtigung ist erteilt und Voice-Gate ist aktiv.
- Aktion: Push-to-talk starten, einmal schweigen und einmal normal sprechen.
- Erwartung: VAD startet ohne Fehler, Stille beendet kontrolliert und beide
  Pfade verlassen `listening`, ohne hängende Aufnahme.
- Invalidiert durch: Voice-Start, VAD-State, Silence-Timer oder MediaStream.

### AVI-008 - VAD segmentiert kurze und lange Sprache robust

- Vertrag: [VAD Module Overview](<../modules/VAD Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: read-only
- Voraussetzung: Voice ist aktiv und ein kurzer sowie ein längerer
  Morning-Command sind vorbereitet.
- Aktion: Zuerst sehr kurz nach Start sprechen und danach einen längeren
  Compound-Satz mit normalen Pausen diktieren.
- Erwartung: Kurze Anfangssprache hängt den Zustand nicht auf; der lange Satz
  wird nicht vor dem fachlichen Ende abgeschnitten.
- Invalidiert durch: VAD-Schwellen, Start-Grace, Silence-Fenster oder Segmentierung.

### AVI-009 - AudioWorklet-Fallback und Voice-Gate

- Vertrag: [VAD Module Overview](<../modules/VAD Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: read-only
- Voraussetzung: AudioWorklet-Initialisierung kann erfolgreich und fehlerhaft
  simuliert werden; Voice-Gate kann sperren.
- Aktion: Beide AudioWorklet-Pfade starten und anschließend bei gesperrtem Gate
  einen Voice-Start versuchen.
- Erwartung: Worklet-Fehler aktiviert den vorgesehenen Fallback; ein gesperrtes
  Gate startet weder Mikrofon noch VAD.
- Invalidiert durch: AudioWorklet, Fallback, Voice-Gate oder Start-Orchestrierung.

### AVI-010 - Nicht erkannter Voice-Befehl erzeugt Pflegeartefakt

- Vertrag: [Voice Command Semantics](<../modules/Voice Command Semantics.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: read-only
- Voraussetzung: Voice ist aktiv und ein eindeutig nicht unterstützter Satz ist
  vorbereitet.
- Aktion: Den Satz sprechen und den erzeugten Fallback-Download inspizieren.
- Erwartung: MIDAS meldet `no-rule-match` verständlich und erzeugt einen lokalen
  JSON-Report mit Transcript, Normalisierung, Slots und Reason, ohne Health-Write.
- Invalidiert durch: Voice-Fehlerpfad, Intent-Diagnostik oder Download-Format.

### AVI-011 - Lokale Blocker bleiben fachlich verständlich

- Vertrag: [Assistant Module Overview](<../modules/Assistant Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: read-only
- Voraussetzung: Ein lokaler Intent kann wegen fehlender Menge, fehlendem
  Abschnitt oder gesperrtem Gate blockiert werden.
- Aktion: Jeden Blocker einmal über Text oder Voice auslösen.
- Erwartung: Die UI nennt den lokalen Grund und zeigt nicht pauschal
  `Assistant nicht erreichbar`; es erfolgt kein unnötiger API-Fallback.
- Invalidiert durch: Blocker-Mapping, Error-Copy oder Assistant-Fallback.

### AVI-012 - Assistant-Kontext nutzt aktuelle Fach-Consumer

- Vertrag: [Assistant Module Overview](<../modules/Assistant Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: read-only
- Voraussetzung: Profil, kommende Termine, Intake und Protein-Ziel sind geladen.
- Aktion: Assistant-Kontext öffnen, danach Profil oder Termin aktualisieren und
  den Kontext erneut anzeigen.
- Erwartung: Kontext kommt aus den aktuellen Modul-APIs, reagiert einmal auf die
  Änderung und rendert Nutzdaten als Text statt ungefiltertem HTML.
- Invalidiert durch: Assistant-Kontext, Profile-/Appointments-Consumer,
  Event-Listener oder Rendering.
