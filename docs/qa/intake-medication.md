# MIDAS QA - Intake and Medication

Diese Suite besitzt aktuelle, statuslose Regressionstests mit dem Präfix
`IM-`. Der allgemeine Testfall- und Evidence-Vertrag steht im
[QA-Einstieg](README.md).

## Zuständigkeit

- Hydration sowie Wasser-, Salz- und Protein-Intakes
- Medication, Tagesabschnitte und Einnahmesemantik
- Medikamentenbestand und Bestandskorrektur
- Retention und fachliche Datenhygiene der Intake-Domäne

## Abgrenzung

- Medikamenten-Push-Fälligkeit und Zustellung gehören `PT-`.
- Generische SQL-, RLS-, Cron- oder RPC-Verträge gehören `BS-`.
- Android-Widget-Synchronisierung und Darstellung gehören `AW-`.
- Produktarchitektur bleibt in den zuständigen Module Overviews.

## Testfälle

### IM-001 - Intake speichern und tagesrichtig laden

- Vertrag: [Intake Module Overview](<../modules/Intake Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: disposable
- Voraussetzung: Kontrollierte Wasser-, Salz- und Proteinwerte für heute und
  gestern sind vorbereitet.
- Aktion: Einzelwerte und Kombi-Save für beide Tage ausführen und neu laden.
- Erwartung: Jeder Wert landet genau am gewählten Tag; UI und Dashboard zeigen
  nach Save und Reload denselben Stand.
- Invalidiert durch: Intake-Form, RPC, Tageszuordnung, Kombi-Save oder Refresh.
- Cleanup: Die eindeutig markierten Intake-Testwerte wieder entfernen oder den
  isolierten Testbestand verwerfen.

### IM-002 - Intake Tageswechsel und Fehlerpfad

- Vertrag: [Intake Module Overview](<../modules/Intake Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: Mitternacht, Mittag und ein RPC-/Offline-Fehler sind isoliert
  simulierbar.
- Aktion: Timer über die Zeitgrenzen laufen lassen und einen fehlgeschlagenen
  Save auslösen.
- Erwartung: Tagesstate und Pills aktualisieren kontrolliert; der Fehler zeigt
  einen verständlichen Hinweis und lässt die bisherige UI unverändert.
- Invalidiert durch: Intake-Timer, State-Reset, RPC- oder Error-Handling.
- Cleanup: Simulierte Zeitquelle, Fehleradapter und Teststate zurücksetzen.

### IM-003 - Intake Tabs und Barrierefreiheit

- Vertrag: [Intake Module Overview](<../modules/Intake Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: read-only
- Voraussetzung: Intake- und Medication-Tab sind per Tastatur erreichbar.
- Aktion: Zwischen `IN` und `TAB` per Maus und Tastatur wechseln.
- Erwartung: Fokus, aktive Tab-Rolle und ARIA-Zustände bleiben korrekt; kein
  Tab-Wechsel verliert ungespeicherte Eingaben still.
- Invalidiert durch: Intake-Navigation, Fokusmanagement oder ARIA-Markup.

### IM-004 - Hydration Target folgt der Tageskurve

- Vertrag:
  [Hydration Target Module Overview](<../modules/Hydration Target Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: read-only
- Voraussetzung: Die Zeitquelle kann auf definierte Stützpunkte gesetzt werden.
- Aktion: Ziel vor 07:00, an allen Stützpunkten, zwischen Stützpunkten und um
  19:30 berechnen.
- Erwartung: Vor 07:00 gilt 0 ml, um 19:30 2000 ml und Zwischenwerte verlaufen
  ohne Sprung; es entstehen keine Warn- oder Reminder-Nebenwirkungen.
- Invalidiert durch: Hydration-Kurve, Zeitzone, Interpolation oder Zielwert.

### IM-005 - Hydration Target bleibt ruhig im Dashboard

- Vertrag:
  [Hydration Target Module Overview](<../modules/Hydration Target Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: read-only
- Voraussetzung: Dashboard ist auf Desktop und Mobile geöffnet.
- Aktion: Minutenwechsel und Responsive-Größen beobachten.
- Erwartung: `WASSER-SOLL` steht direkt nach `WASSER`, aktualisiert ohne Reload
  und erzeugt weder Layoutbruch noch warnende Copy, Farbe oder Benachrichtigung.
- Invalidiert durch: Dashboard, Hydration-Rendering, Timer oder Responsive-CSS.

### IM-006 - Medication Einzeldosis Fast Path

- Vertrag: [Medication Module Overview](<../modules/Medication Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: disposable
- Voraussetzung: Eine aktive Medikation mit genau einem Tagesabschnitt und
  bekanntem Bestand ist vorhanden.
- Aktion: Einnahme bestätigen und einmal zurücknehmen.
- Erwartung: Bestätigung und Undo betreffen den richtigen Slot, der Bestand
  sinkt beziehungsweise steigt exakt um `qty_per_slot` und es entsteht kein
  doppeltes Event.
- Invalidiert durch: Medication Fast Path, Slot-RPC, Undo oder Bestandslogik.
- Cleanup: Undo stellt Einnahmeereignis und Ausgangsbestand wieder her.

### IM-007 - Medication Mehrfachdosis verlangt Abschnitt

- Vertrag: [Medication Module Overview](<../modules/Medication Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: disposable
- Voraussetzung: Eine Medikation mit mindestens zwei aktiven Tagesabschnitten
  und bekanntem Bestand ist vorhanden.
- Aktion: Allgemeine Bestätigung versuchen, einen Abschnitt wählen,
  bestätigen und wieder zurücknehmen.
- Erwartung: Ohne expliziten Abschnitt erfolgt kein Write; Confirm und Undo
  verändern nur den gewählten Slot und den Bestand exakt.
- Invalidiert durch: Daypart-Auswahl, Slot-RPC, Undo oder Bestandslogik.
- Cleanup: Undo stellt gewählten Slot und Ausgangsbestand wieder her.

### IM-008 - Medication Manager CRUD und Bestand

- Vertrag: [Medication Module Overview](<../modules/Medication Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: disposable
- Voraussetzung: Eine eindeutig benannte Testmedikation kann angelegt werden.
- Aktion: Medikation und Plan anlegen, bearbeiten, Bestand addieren/subtrahieren
  und setzen, archivieren, reaktivieren und löschen.
- Erwartung: Karten, Plan, Status, Bestand und Aufbrauchdatum bleiben nach jedem
  Schritt konsistent; keine Aktion betrifft eine andere Medikation.
- Invalidiert durch: Medication CRUD, Schedule Slots, Stock-RPC oder Kartenlogik.
- Cleanup: Die Testmedikation samt Testslots am Ende vollständig löschen.

### IM-009 - Low Stock und Profilkontakt

- Vertrag: [Medication Module Overview](<../modules/Medication Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: disposable
- Voraussetzung: Bestand kann knapp oberhalb und unterhalb des Grenzwerts
  gesetzt werden; Hausarztkontakt ist im Profil änderbar.
- Aktion: Grenzwert überschreiten, unterschreiten und den Kontakt aktualisieren.
- Erwartung: Low-Stock erscheint nur im knappen Zustand und zeigt nach
  `profile:changed` den aktuellen Kontakt ohne Reload.
- Invalidiert durch: Low-Stock-Berechnung, Profile-Event oder Dashboard-Copy.
- Cleanup: Ausgangsbestand und vorherigen Profilkontakt wiederherstellen.

### IM-010 - Medication-Write ist atomar und nutzergebunden

- Vertrag: [Medication Module Overview](<../modules/Medication Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: Slot-Confirm kann erfolgreich, doppelt und mit ungültiger
  Medikation-/Slot-Kombination ausgeführt werden.
- Aktion: Alle drei Varianten gegen isolierte Testdaten ausführen.
- Erwartung: Event und Bestand ändern sich atomar, Wiederholung ist idempotent
  und fremde oder inkonsistente IDs werden ohne Teilwirkung abgelehnt.
- Invalidiert durch: Medication RPC, Foreign Keys, RLS oder Idempotenzschlüssel.
- Cleanup: Isolierte Datenbanktransaktion zurückrollen oder Testfixtures verwerfen.

### IM-011 - Jahres-Retention löscht nur alte Einnahmeereignisse

- Vertrag: [Medication Module Overview](<../modules/Medication Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: Ereignisse vor, auf und nach der Retention-Grenze sowie aktive
  Medikation, Slots und Bestände liegen isoliert vor.
- Aktion: Retention-Funktion zweimal mit demselben Stichtag ausführen.
- Erwartung: Nur Ereignisse vor der Grenze werden gelöscht; Grenztag und neuere
  Events, Stammdaten, Slots und Bestand bleiben erhalten, der zweite Lauf ist
  wirkungslos.
- Invalidiert durch: Retention-SQL, Grenzberechnung, Cron oder Tabellenmodell.
- Cleanup: Isolierte Retention-Fixtures und Testjob vollständig entfernen.
- Runbook: [Supabase SQL Cutover](runbooks/supabase-sql-cutover.md)

### IM-012 - Protein-Ziel nutzt CKD-Fallback konservativ

- Vertrag: [Protein Module Overview](<../modules/Protein Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: Lab- und Profil-CKD-Stufe sowie Auto- und Doctor-Lock-Fälle
  sind isoliert simulierbar.
- Aktion: Faktor mit Lab-CKD, nur Profil-CKD, ohne CKD und mit Doctor-Lock
  berechnen.
- Erwartung: Lab hat Vorrang, Profil dient als Fallback, Auto ohne CKD wird mit
  `ckd_stage_missing` übersprungen und Doctor-Lock erfindet keine CKD-Metadaten.
- Invalidiert durch: Protein-Edge-Function, CKD-Parser, Fallback oder Doctor-Lock.
- Cleanup: Isolierte Profil-, Lab- und Function-Fixtures verwerfen.

### IM-013 - Protein-Ziel reagiert auf Gewicht und Aktivität

- Vertrag: [Protein Module Overview](<../modules/Protein Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: Kontrollierte Body- und Activity-Daten für ACT1 bis ACT3
  sind vorhanden.
- Aktion: Body-Save und anschließende Zielberechnung für alle Aktivitätsbänder
  auslösen.
- Erwartung: Body-Save triggert die Funktion, Activity beeinflusst das Band und
  der berechnete Profilbereich aktualisiert Intake und Assistant-Consumer.
- Invalidiert durch: Body-Hook, Activity-Fenster, Protein-Faktor oder Consumer.
- Cleanup: Isolierte Body-, Activity- und Profil-Fixtures verwerfen.
