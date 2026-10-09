# MIDAS QA - Core Runtime

## Release-Evidence D28 — 2026-10-09

Web-v34 auf GitHub Pages veröffentlicht:78 Assets exakt gegen Release-Gitbytes,
11 gehostete Browserchecks PASS für Boot/Auth/Medication/Logout, kalten/warmen
SW und Offlineasset sowie Desktop/Mobil. Keine Page-/Consoleerrors.
Die gehostete Session/SDK/Storage sind Fixtures; alle externen Transporte lokal
abgefangen. Echte Ownerchecks Login/Doctor/Report/BP getrennt dokumentiert.
Keine reale Provider-/Backend-/Geräteacceptance aus Fixtures ableiten.
Prüfresultate und offene Gates: [Programmevidence](<../MIDAS Supabase API Key and Edge Authentication Modernization Evidence.md>).


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
- Voraussetzung: eine aktuelle nicht-anonyme SDK-Session vorhanden ist; der erste
  Transport kann kontrolliert HTTP 401 liefern.
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


### CORE-012 - Konfigspeicherung bleibt nach Fehler sicher

- Vertrag: [Auth Module Overview](<../modules/Auth Module Overview.md>)
- Ebene: browser
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: isolierter echter Productload mit eigener IndexedDB und injizierbarem putConf-Fehler.
- Aktion: Configsave per aktivem Button auslösen; letzten Keywrite einmal und danach URLwrite samt Rückweg dauerhaft ablehnen.
- Erwartung: einmaliger Fehler stellt das alte Paar her; dauerhafter Rückwegfehler hinterlässt kein gemischtes gültiges Konfigpaar, Header bleiben blockiert; Writerfence endet kontrolliert ohne Rohfehlerwerte.
- Invalidiert durch: Configwriter, Feedback, DBadapter oder Clientinvalidierung.
- Cleanup: isolierten Browser-/VM-/Envzustand verwerfen; keine produktive Wirkung.


### CORE-013 - Session und Generation berechtigen jeden Transport neu

- Vertrag: [Auth Module Overview](<../modules/Auth Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: tatsächliche ESM-Sources in VM mit aktueller SDK-Session und verzögerbaren Antworten.
- Aktion: aktuellen Header, Refresh, Logout, Konfig-/Client-/Tokenwechsel, Timeout und alte Listenerantworten prüfen.
- Erwartung: raw public apikey plus aktueller User-JWT; kein Cache-/Timeout-/User-IDfallback; alte Antworten und Reader während Teilwrites abgelehnt.
- Invalidiert durch: Client-/Auth-/Headergeneration, Listener, Restore oder RESTretry.
- Cleanup: isolierten Browser-/VM-/Envzustand verwerfen; keine produktive Wirkung.


### CORE-014 - Aktiver Service Worker bleibt bei Offline und Update kohärent

- Vertrag: [Supabase Core Module Overview](<../modules/Supabase Core Overview.md>)
- Ebene: browser
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: isolierter Productload mit tatsächlich aktivem alten/current Worker und lokal abgefangenen Fremdtransporten.
- Aktion: cold/warm laden, offline Coreasset abrufen; echten Updatebutton bis controllerchange/reload betätigen. Zusätzlich tatsächlichen Worker in VM mit Cache-lookup/-open/-put-Fehlern und verzögertem Cachewrite ausführen.
- Erwartung: aktuelles Authpaket vollständig, gecachte Offlineantwort ohne unbehandelte Revalidation, erfolgreiche Netzantwort trotz Cachefehler nutzbar, ungecachte Netzfehler erhalten und Navigationswrites lifecyclegebunden/behandelt; neuer Worker/Clientgraph kohärent, alte Cachegeneration entfernt.
- Invalidiert durch: SWassets/-version, Importgraph, Updatebanner oder Worker-/Bootlifecycle.
- Cleanup: isolierten Browser-/VM-/Envzustand verwerfen; keine produktive Wirkung.


### CORE-015 - Veraltete Antwort verlangt bei gültiger aktueller Session keinen Login

- Vertrag: [Auth Module Overview](<../modules/Auth Module Overview.md>)
- Ebene: browser
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: echte Sources und aktiver Listener; isolierter Browser, SDK2.45.4 mit synthetischen Session-/HTTPfixtures und lokal abgefangenen Transporten.
- Aktion: Medication/Incident-Boot laden, med_list_v2 verzögern, INITIAL_SESSION/SIGNED_IN/Visibility-Recovery/Refresh auslösen; alte Antwort freigeben. Logout, Ablauf, Sessionverlust, fehlerhaften/verzögerten Recheck, Client-/Konfigwechsel und Noteswriteantwort getrennt prüfen.
- Erwartung: alte Antwort verworfen, Write nicht wiederholt; gültige aktuelle Anmeldung verlangt keinen Login. Erneut invalidierter oder fehlerhafter/zeitüberschrittener Recheck berechtigt nicht und behauptet keinen Logout. Aktuell bestätigter Sessionverlust öffnet Login. Ein ausdrücklicher neuer Medication-Read funktioniert mit aktueller Session; unklare Notizwriteantwort fordert Speicherstandprüfung. Reale Owner-OAuthacceptance bleibt separat.
- Invalidiert durch: HTTP-Loginentscheid, Authlistener, Session-/Headergeneration, Notesfeedback oder Medication-/Boot-/UI-Consumerpfad.
- Cleanup: isolierte Browser/Storage/SDK-/Transportfixtures verwerfen; keine echten Gesundheitswrites oder Gerätewirkung.
