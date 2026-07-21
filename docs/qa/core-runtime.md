# MIDAS QA - Core Runtime

Diese Suite besitzt aktuelle, statuslose Regressionstests mit dem Präfix
`CORE-`. Der allgemeine Testfall- und Evidence-Vertrag steht im
[QA-Einstieg](README.md).

## Zuständigkeit

- Bootflow, Auth und Unlock
- globaler State, Main Router und Realtime-Grundverhalten
- Diagnostics und Bootfehler-Sichtbarkeit
- globale CSS-, Feedback- und Navigationsverträge
- lokale Touchlog-Diagnose ohne fachliche Pushentscheidung

## Abgrenzung

- Fachliche Gesundheits-, Intake-, Assistant- oder Push-Flows gehören ihrer
  jeweiligen Domänensuite.
- Android-Bridge- und Device-Verhalten gehört `AW-`.
- Generische Supabase-, RLS- oder Edge-Runtime-Verträge gehören `BS-`.
- Produktarchitektur bleibt in den zuständigen Module Overviews.

## Testfälle

### CORE-001 - Auth-Gate und Sessionwechsel

- Vertrag: [Auth Module Overview](<../modules/Auth Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: read-only
- Voraussetzung: MIDAS ist einmal ohne und einmal mit gültiger Session geöffnet.
- Aktion: Login, Logout und einen erneuten Seitenaufruf ausführen.
- Erwartung: Ohne Session bleibt das Login-Overlay aktiv; Login und Logout
  wechseln den sichtbaren Auth-Zustand ohne festhängenden Bootscreen.
- Invalidiert durch: Auth-, Bootflow-, Session- oder Login-Overlay-Änderungen.

### CORE-002 - Authentifizierter Request mit Token-Refresh

- Vertrag: [Auth Module Overview](<../modules/Auth Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: read-only
- Voraussetzung: `fetchWithAuth` ist mit einem abgelaufenen oder simuliert
  abgewiesenen Access Token aufrufbar.
- Aktion: Einen Request ausführen, dessen erster Versuch HTTP 401 liefert.
- Erwartung: MIDAS erneuert die Session und wiederholt den Request höchstens
  einmal; ein endgültiger Fehler bleibt als Fehler sichtbar.
- Invalidiert durch: Auth-Wrapper-, Refresh-, Retry- oder Supabase-Client-Änderungen.

### CORE-003 - Geschützte Ansichten und Pending Action

- Vertrag: [Unlock Flow Overview](<../modules/Unlock Flow Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: read-only
- Voraussetzung: Doctor- oder Chart-Ansicht ist gesperrt und PIN oder Passkey
  ist eingerichtet.
- Aktion: Eine geschützte Ansicht anfordern, einmal abbrechen und einmal
  erfolgreich entsperren.
- Erwartung: Ohne Unlock bleibt die Ansicht geschlossen; nach erfolgreichem
  Unlock wird genau die gemerkte Aktion einmal ausgeführt.
- Invalidiert durch: Unlock-, Doctor-Guard-, Chart- oder Pending-Action-Änderungen.

### CORE-004 - Refresh-Bündelung und Resume

- Vertrag: [Main Router Flow Overview](<../modules/Main Router Flow Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: read-only
- Voraussetzung: Mehrere Refresh-Anforderungen und ein Visibility-Resume sind
  kontrolliert auslösbar.
- Aktion: Parallele Refresh-Anforderungen auslösen und danach aus dem
  Hintergrund zurückkehren.
- Erwartung: Gleichzeitige Anforderungen werden gebündelt; Resume löst den
  vorgesehenen Refresh aus, ohne Doppellauf oder verlorenen Folge-Refresh.
- Invalidiert durch: Router-, Refresh-Queue-, Visibility- oder Save-Hook-Änderungen.

### CORE-005 - Globaler State bei Datum und Auth

- Vertrag: [State Layer Overview](<../modules/State Layer Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: read-only
- Voraussetzung: Capture und Doctor View sind nutzbar; Auth-Wechsel ist
  möglich.
- Aktion: Datum wechseln, einen UI-Refresh anfordern, Doctor View scrollen und
  Login beziehungsweise Logout ausführen.
- Erwartung: Capture State und Auth-State sind aktuell, Refreshes laufen nicht
  doppelt und die Doctor-Scrollposition bleibt bei internem Refresh erhalten.
- Invalidiert durch: State-, Date-, Refresh-, Doctor- oder Auth-State-Änderungen.

### CORE-006 - Bootfehler bleibt diagnostizierbar

- Vertrag: [Diagnostics Module Overview](<../modules/Diagnostics Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: read-only
- Voraussetzung: Ein reproduzierbarer Bootfehler kann lokal ausgelöst werden.
- Aktion: MIDAS mit dem Bootfehler starten und Touchlog beziehungsweise
  Fallback-Log öffnen.
- Erwartung: Der Fehlerdialog liegt bedienbar über dem Bootscreen; das Log ist
  lesbar und scrollbar, ohne dass die Oberfläche im Bootscreen gefangen bleibt.
- Invalidiert durch: Bootflow-, Diagnostics-, Overlay-, Z-Index- oder CSS-Änderungen.
- Runbook: [Boot Error Smoke](runbooks/boot-error-smoke.md)

### CORE-007 - Diagnostik bleibt lokal und begrenzt

- Vertrag: [Diagnostics Module Overview](<../modules/Diagnostics Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: read-only
- Voraussetzung: Diagnostics ist einmal aktiviert und einmal deaktiviert.
- Aktion: Logs und Perf-Samples erzeugen, einen identischen Bootfehler mehrfach
  melden und danach die lokale Anzeige leeren.
- Erwartung: Deaktiviert existiert nur die Stub-API; aktiviert sind Logs und
  Perf-Samples abrufbar, identische Fehler werden dedupliziert, die Historie
  bleibt auf drei Einträge begrenzt und Clear verändert keine Remotedaten.
- Invalidiert durch: Diagnostics-, Boot-History-, Dedupe- oder Clear-Änderungen.

### CORE-008 - Hub-Navigation und Dashboard-Refresh

- Vertrag: [Hub Module Overview](<../modules/Hub Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: read-only
- Voraussetzung: Hub, Dashboard und Quickbar sind auf Desktop und Mobile
  erreichbar.
- Aktion: Nach unten und oben wischen, zwischen Panels navigieren und einen
  normalen Intake-Refresh auslösen.
- Erwartung: Die Gesten öffnen nur ihre jeweilige Ebene; die passive Nadel
  bleibt ein echter Carousel-Schritt, Doctor-/Panel-Navigation bleibt intakt
  und offene Dashboardwerte aktualisieren ohne Reload.
- Invalidiert durch: Hub-, Gesture-, Carousel-, Panel- oder Refresh-Änderungen.

### CORE-009 - Globale CSS- und Scroll-Verträge

- Vertrag: [CSS Module Overview](<../modules/CSS Module Overview.md>)
- Ebene: static
- Ausführung: manual
- Wirkung: read-only
- Voraussetzung: Der aktuelle Frontend-Build liegt im Repo vor.
- Aktion: Stylesheet-Einbindungen und globale Pattern-Definitionen prüfen sowie
  Appointments und Bootfehler auf schmalem Viewport darstellen.
- Erwartung: `app/app.css` ist der einzige Build-Einstieg, globale Patterns sind
  nicht zwischen Feature-Dateien dupliziert, Bootfehler bleiben bedienbar und
  das Appointments-Panel erzeugt keine zweite Scrollbox.
- Invalidiert durch: CSS-Build-, Import-, Overlay-, Appointments- oder
  Responsive-Änderungen.

### CORE-010 - Sensorisches Feedback bleibt ereignisgebunden

- Vertrag:
  [Sensory Feedback Module Overview](<../modules/Sensory Feedback Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: read-only
- Voraussetzung: Sensorisches Feedback ist einmal ein- und einmal ausgeschaltet.
- Aktion: MIDAS im Idle beobachten und anschließend eine echte Nutzeraktion
  ausführen.
- Erwartung: Im Idle entsteht kein Feedback; echte Aktionen dürfen Feedback
  erzeugen und die globale Abschaltung unterdrückt es vollständig.
- Invalidiert durch: Feedback-, Settings-, Animation- oder Audio-Änderungen.

### CORE-011 - Lokales Touchlog ohne fachliche Push-Wertung

- Vertrag: [Touchlog Module Overview](<../modules/Touchlog Module Overview.md>)
- Ebene: browser
- Ausführung: manual
- Wirkung: read-only
- Voraussetzung: Touchlog ist auf Desktop und Android-WebView erreichbar.
- Aktion: Touchlog öffnen, schließen, lokale Diagnoseeinträge erzeugen und
  `Touchlog leeren` ausführen.
- Erwartung: Close bleibt erreichbar, Mobile erhält keine horizontale
  Überbreite, Diagnosemodi erzeugen keinen Log-Spam und Clear leert nur lokale
  Anzeige und lokale Indizes.
- Invalidiert durch: Touchlog-, Diagnostics-, Layout- oder Clear-Änderungen.
