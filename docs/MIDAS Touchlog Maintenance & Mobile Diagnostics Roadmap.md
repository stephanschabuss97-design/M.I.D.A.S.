# MIDAS Touchlog Maintenance & Mobile Diagnostics Roadmap

## Ziel (klar und pruefbar)

Der MIDAS Touchlog soll von einem engen technischen Log-Panel zu einer mobilen, ruhigen und wartbaren Diagnoseflaeche weiterentwickelt werden.

Pruefbare Zieldefinition:

- Der Touchlog ist auf Handy lesbar, bedienbar und nicht abgeschnitten.
- Diagnosezustand und Log-Stream sind visuell getrennt.
- Eine Maintenance-Section zeigt die wichtigsten Betriebszustaende, ohne das Panel zu ueberladen.
- Push-Bedienung und Push-Health werden aus dem Profil herausgeloest und im Touchlog/Maintenance gebuendelt.
- Aktive Dev-/Diagnosemodi werden als Status sichtbar, nicht als Log-Spam.
- Kleine lokale Hilfsaktionen sind klar begrenzt und veraendern keine Produktdaten.
- Der Log bleibt Event-Trace, nicht Dashboard, nicht Produktfeature und nicht technische Muellhalde.
- Hestia-Learnings werden auf MIDAS zugeschnitten, nicht blind kopiert.

## Problemzusammenfassung

MIDAS hat technisch einen starken Diagnostics-Core:

- `diag.add` mit Dedupe
- Summary-Eintraege
- Diagnostics-Layer mit Logger, Perf und Monitor
- Boot-Error-Fallbacks
- Dev-Toggles
- Push-Health-Status aus dem Profilmodul

Die UI ist aber nicht auf derselben Hoehe:

- Das Panel ist auf Mobile eng und kann abgeschnitten wirken.
- Dev-Toggles, Push-Diagnose und Log-Stream teilen sich dieselbe enge Flaeche.
- Es gibt keine klare Maintenance-Section fuer aktuelle Systemzustaende.
- Push-Health ist nach der Push-Cadence-Roadmap im Profil sichtbar, gehoert nach neuer Produktentscheidung aber nicht mehr ins Profil.
- Das Profil wirkt dadurch auf Mobile wie eine Push-/Diagnoseseite statt wie ein ruhiger Stammdatenbereich.
- Der Touchlog besitzt bereits einen Push-Toggle und eine Push-Diagnosezeile, ist aber noch nicht als alleinige Maintenance-Zentrale strukturiert.
- Hestia zeigt, dass eine ruhige Status-/Maintenance-Zone plus separater Log-Stream besser funktioniert.

## Scope

- Neues Touchlog-/Diagnostics-Layout fuer MIDAS.
- Mobile-first Struktur fuer `#diag`.
- Maintenance-Section fuer kompakte Systemzustaende.
- Touchlog wird die einzige sichtbare Wartungs- und Bedienoberflaeche fuer Push.
- Sichtbare Profil-Section `Push & Erinnerungen` samt Push-Buttons und technischen Push-Details aus dem Profil entfernen.
- Bestehende Profile-Push-Verdrahtung deterministisch inventarisieren, bevor etwas entfernt oder verschoben wird:
  - DOM-Elemente
  - Event-Handler
  - Public APIs
  - Copy/Texte
  - Datenfluss zu lokaler Push-Suppression
- Push-Health kompakt aus der in S1 bestaetigten aktuellen Quelle in den Touchlog uebertragen; falls das vorerst `profile.getPushRoutingStatus()` bleibt, ist das eine technische Quelle ohne sichtbare Profil-Surface:
  - Browser-Berechtigung
  - Browser-Abo
  - Remote-Status
  - letzter Remote-Erfolg
  - letzter Remote-Fehler
  - Fehlergrund, wenn vorhanden
  - Health-Check-Fehler, wenn vorhanden
- Aktive Diagnosemodi sichtbar machen:
  - Push
  - Sound
  - Haptik
  - No Cache
  - Assistant
- Kleine lokale Hilfsaktionen pruefen:
  - Touchlog leeren
  - Dev State zuruecksetzen, falls sinnvoll und eng begrenzt
- User-Facing Copy fuer Maintenance-/Status-Texte pruefen.
- Diagnostics-Doku und QA aktualisieren.

## Not in Scope

- Umbau der Push-Fachlogik.
- Service-Worker-Neuarchitektur.
- Native Android-Diagnose oder Android-Push.
- Remote Logging, Telemetrie oder Monitoring-Backend.
- Vollwertiges Developer-Dashboard.
- Neue Produktfeatures im Touchlog.
- Vollstaendige Push-Fachlogik-Migration in ein neues Modul ohne separaten Entscheid.
- Produktdatenaktionen aus dem Touchlog heraus.
- Log-Spam durch permanente Spiegelung jedes Toggle-Zustands.
- Anzeige von Tokens, UIDs, Endpoints oder anderen sensiblen Daten.

## Relevante Referenzen (Code)

- `index.html`
- `app/core/diag.js`
- `app/core/boot-flow.js`
- `app/diagnostics/devtools.js`
- `app/diagnostics/logger.js`
- `app/diagnostics/perf.js`
- `app/diagnostics/monitor.js`
- `app/modules/profile/index.js`
- `app/modules/incidents/index.js`
- `app/styles/auth.css`
- `app/styles/hub.css`
- `app/styles/base.css`

## Relevante Referenzen (Doku)

- `README.md`
- `docs/MIDAS Roadmap Template.md`
- `docs/modules/Diagnostics Module Overview.md`
- `docs/modules/Profile Module Overview.md`
- `docs/modules/Push Module Overview.md`
- `docs/QA_CHECKS.md`
- `docs/archive/Push Cadence & Health Visibility Follow-up Roadmap (DONE).md`

## Relevante HESTIA-Referenzen

- `C:/Users/steph/Projekte/H.E.S.T.I.A/app/core/touchlog.js`
- `C:/Users/steph/Projekte/H.E.S.T.I.A/app/styles/devtools.css`
- `C:/Users/steph/Projekte/H.E.S.T.I.A/index.html`
- `C:/Users/steph/Projekte/H.E.S.T.I.A/docs/modules/Touchlog Module Overview.md`
- `C:/Users/steph/Projekte/H.E.S.T.I.A/docs/archive/HESTIA Dev Panel, Touchlog & Diagnostics Roadmap (DONE).md`

## HESTIA Lessons Learned

- Touchlog braucht eine klare Informationsarchitektur:
  - links bzw. oben: Status, Modi, Maintenance
  - rechts bzw. unten: Log-Stream
- Aktive Sonderzustaende gehoeren nicht primaer in den Log.
- Dev-Toggles muessen lokal, sichtbar und reversibel sein.
- Kleine Hilfen wie `Touchlog leeren` sind nuetzlich, wenn sie keine Produktdaten veraendern.
- Mobile muss eigenes Layout sein, nicht Desktop-Layout in schmal.
- Ein Log ist ein Event-Trace, keine allgemeine Debug-Konsole.
- Wenige gut erklaerte Maintenance-Bloecke sind besser als viele technische Schalter.

## MIDAS-spezifische Anpassung

MIDAS ist komplexer als Hestia. Deshalb wird nicht alles kopiert.

Was uebernommen werden soll:

- klare zweigeteilte Struktur
- mobile Vollbreiten-/Safe-Area-Logik
- aktive Zustandslisten statt Log-Spam
- lokale Diagnosehilfen
- ruhige Maintenance-Section

Was nicht uebernommen werden soll:

- Hestia-Stil-/Artstyle-Schalter
- Hestia-Household-/Sync-spezifische Begriffe
- Hestia-Komplexitaet als Massstab fuer MIDAS-Featureumfang
- neue Produkt- oder Business-Features im Log-Panel

## Guardrails

- MIDAS bleibt Lebensapp, nicht Debug-Werkbank.
- Der Touchlog hilft bei Wartung und QA, bleibt aber kein Produkt-Hauptbereich.
- Maintenance zeigt nur Zustaende, die echte Diagnosefragen beantworten.
- Push-Health darf sichtbar sein, aber nicht das ganze Panel dominieren.
- Profil bleibt frei von Push-/Reminder-Bedienung und Push-Health-Diagnose.
- Touchlog/Maintenance ist die einzige sichtbare Surface fuer Push-Wartung.
- Dev-Toggles bleiben lokal und reversibel.
- Keine Maintenance-Anzeige darf fachliche App-Wahrheit veraendern.
- Keine stillen Sondermodi, die nur im Code existieren.
- Logs bleiben dedupliziert und ruhig.
- Keine PII-, Token-, UID- oder Endpoint-Leaks.
- Profil bleibt Stammdaten-, Limit-, Arztkontakt- und Medication-Snapshot-Flaeche; keine Push-Section, kein Push-Kurzstatus, keine Push-Buttons.

## Architektur-Constraints

- `diag.add` bleibt Event-Trace und darf nicht zum allgemeinen State Store werden.
- `diagnosticsLayer.logger/perf/monitor` bleiben Diagnose-Infrastruktur, nicht Produktdatenquelle.
- Boot-Error-Fallback muss den Touchlog oder Fallback-Log weiterhin deterministisch oeffnen koennen.
- Der aktuelle Ist-Zustand muss zuerst klaeren, ob `profile.getPushRoutingStatus()` nur UI-Quelle oder auch operative Push-Routing-Quelle ist.
- Falls `profile.getPushRoutingStatus()` vorerst technische Quelle bleibt, darf daraus keine sichtbare Profil-Surface folgen.
- Lokale Push-Suppression bleibt ausschliesslich Sache des Profil-/Incident-Vertrags, nicht des Touchlogs.
- Touchlog darf Push aktivieren/deaktivieren und Health anzeigen, aber nicht die fachliche Reminder-/Incident-Entscheidung treffen.
- Mobile Layout muss innerhalb Safe Area und Viewport bleiben.
- Keine neue Persistenz im Diagnostics-Layer.
- Android nativer Diagnosepfad bleibt getrennt und wird hier nicht umgebaut.

## Tool Permissions

Allowed:

- `index.html` fuer Touchlog-Markup anpassen.
- `index.html` fuer Entfernung sichtbarer Profil-Push-Markup-Teile anpassen, falls dort verdrahtet.
- `app/styles/auth.css` fuer Diagnostics-/Touchlog-Layout anpassen.
- `app/styles/hub.css` fuer Entfernung/Neutralisierung sichtbarer Profil-Push-Styles anpassen, falls noetig.
- `app/diagnostics/devtools.js` fuer Maintenance-Status und lokale Dev-Hilfen anpassen.
- `app/modules/profile/index.js` fuer Entfernung sichtbarer Profil-Push-UI und fuer eventuelle eng begrenzte Public-API-Nutzung durch Touchlog anpassen.
- Falls noetig eng begrenzte Lesefunktionen aus bestehenden Modulen nutzen.
- `docs/modules/Diagnostics Module Overview.md` aktualisieren.
- `docs/modules/Profile Module Overview.md` aktualisieren.
- `docs/modules/Push Module Overview.md` aktualisieren, falls Touchlog als einzige Push-Wartungs-Surface dokumentiert werden muss.
- `docs/QA_CHECKS.md` aktualisieren.
- Diese Roadmap aktualisieren.
- Lokale Syntaxchecks, Diff-Checks und gezielte Repo-Scans ausfuehren.

Forbidden:

- Push-Fachlogik aendern.
- Service Worker umbauen.
- Android-/TWA-native Diagnose oder Push einfuehren.
- Remote Logging oder Monitoring-Backend einfuehren.
- Produktdaten aus dem Touchlog schreiben.
- Tokens, UIDs, Push-Endpoints oder sensible Rohdaten anzeigen.
- Sichtbare Push-Bedienung oder Push-Health-Diagnose im Profil belassen.

## Execution Mode

- Diese Roadmap nutzt das Standardgeruest aus `docs/MIDAS Roadmap Template.md`.
- Sequenziell arbeiten: `S1` bis `S6`.
- `S1` bis `S3` sind Doku-Detektivarbeit, Informationsarchitektur, Risikoanalyse und Copy Review.
- `S4` ist der konkrete Umsetzungsblock.
- `S5` ist Tests, Code Review und Contract Review.
- `S6` ist Doku-Sync, QA-Update und Abschlussreview.
- Nach jedem Hauptschritt Statusmatrix aktualisieren.
- Nach jedem Hauptschritt mindestens ein Review oder Check dokumentieren.

## Skalierung der Roadmap

Diese Roadmap ist kein Mini-Fix.

Grund:

- Sie betrifft Diagnostics UI.
- Sie betrifft Mobile Layout.
- Sie beruehrt Push-Health-Anzeigen.
- Sie erfordert Source-of-Truth-Doku-Sync.

Daher wird `S1` bis `S6` voll angewendet, aber Substeps bleiben pragmatisch.

## Zielstruktur

Desktop / breite Screens:

- Header:
  - Titel
  - Close
  - optional klare Kurzinfo
- Linke Spalte:
  - Maintenance
  - Push-Wartung als eigener Maintenance-Block
  - aktive Diagnosemodi
  - Dev-Toggles
  - kleine Hilfsaktionen
- Rechte Spalte:
  - Touchlog-Stream

Mobile:

- Full-width Panel innerhalb Safe Area
- Header sticky
- Maintenance zuerst
- Push-Wartung vor den lokalen Dev-Toggles
- Dev-Toggles kompakt
- Log darunter, begrenzt und scrollable
- Close jederzeit erreichbar

## Maintenance-Section: erste Kandidaten

- Push:
  - Toggle/Bedienung fuer Push aktivieren/deaktivieren
  - `remote gesund`
  - `bereit, wartet auf erste faellige Erinnerung`
  - `Zustellung pruefen`
  - `Browser blockiert`
  - letzter Erfolg / letzter Fehler nur kompakt
- App-Shell:
  - `No Cache` aktiv/inaktiv
  - Service Worker Status nur falls vorhanden und belastbar
- Diagnostics:
  - Diagnostics aktiv/deaktiviert
  - Log-Eintraege count
  - letzter Error/Warning, falls belastbar
- Dev-Modi:
  - Sound
  - Haptik
  - Assistant Surface
- Auth/Runtime:
  - nur falls sicher und ohne PII darstellbar
  - keine Tokens, keine UIDs, keine sensiblen Daten

## User-Facing Copy Vertrag

- Profil:
  - keine Push-Section
  - kein Push-Kurzstatus
  - keine Push-Buttons
  - keine technischen Push-Texte
- Touchlog/Maintenance:
  - technische, aber knappe Diagnose
  - keine falsche Sicherheit
  - kein falscher Alarm
  - normale Zwischenzustaende muessen normal wirken
- Push-Health-Labels muessen zum finalen Push-Vertrag passen:
  - `bereit, wartet auf erste faellige Erinnerung` ist neutral
  - `remote gesund` nur bei echtem Remote-Erfolg
  - `Zustellung pruefen` nur bei Failure, deaktivierter Subscription oder belastbarem Warnsignal

## Statusmatrix

| ID | Schritt | Status | Ergebnis/Notiz |
|---|---|---|---|
| S1 | System- und Vertragsdetektivarbeit | DONE | README, Diagnostics/Push/Profile Overviews, Hestia-Referenzen, Screenshots und MIDAS-Codepfade gelesen; Ist-Zustand der Profil-Push- und Touchlog-Push-Verdrahtung erfasst. |
| S2 | Touchlog-Contract und Maintenance-Informationsarchitektur | DONE | Maintenance-Bloecke, Push-Control-Vertrag, Profil-ohne-Push-Vertrag, aktive Modi, Hilfsaktionen und PII-Grenzen final festgelegt. |
| S3 | Bruchrisiko-, Mobile- und User-Facing-Copy-Review | DONE | Bruchrisiken, Mobile-/Accessibility-Grenzen, Copy-Vertrag, Profil-Entkopplungsplan und konkrete S4-Pflichtpunkte festgelegt. |
| S4 | Umsetzung Touchlog v2 und Profil-Entkopplung | DONE | Touchlog v2 umgesetzt, Profil-Push-Surface entfernt, interne Push-API gehaertet, Maintenance-/Copy-/Hilfsaktionsvertrag umgesetzt. |
| S5 | Tests, Code Review und Contract Review | DONE | Syntax-, Diff-, statische Contract- und HTTP-Serve-Checks erledigt; Desktop-/Android-/Push-Smokes fuer lokale Endabnahme definiert; keine offenen Code-Findings. |
| S6 | Doku-Sync, QA-Update und Abschlussreview | TODO | Diagnostics/Profile/Push Overviews, QA und Roadmap final synchronisieren. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## S1 - System- und Vertragsdetektivarbeit

Ziel:

- MIDAS-Diagnostics und Hestia-Learnings verstehen.
- Codepfade und Source-of-Truth-Dokus identifizieren.
- Sichtbaren Ist-Zustand aus Desktop- und Android-Screenshots dokumentieren.
- Aktuelle Profil-Push-Verdrahtung vollstaendig erfassen.
- Noch keinen Code aendern.

Substeps:

- S1.1 README und allgemeine MIDAS-Guardrails lesen.
- S1.2 `docs/modules/Diagnostics Module Overview.md` lesen.
- S1.3 `docs/modules/Profile Module Overview.md` und `docs/modules/Push Module Overview.md` fuer Push-Health-Vertrag lesen.
- S1.4 abgeschlossene Push-Cadence-Roadmap im Archiv lesen.
- S1.5 aktuelle Screenshots/Beobachtungen dokumentieren:
  - Desktop-Profil mit `Push & Erinnerungen`
  - Android-Profil mit grosser Push-Karte und Umbruechen
  - Desktop-Touchlog mit Push-Toggle und Log-Spalte
  - Android-Touchlog mit Toggle-Liste und Log-Stream
- S1.6 Hestia Touchlog-Code, CSS und Module Overview gezielt lesen.
- S1.7 MIDAS `diag.js`, `devtools.js`, `auth.css`, `hub.css`, `index.html`, `profile/index.js`, `incidents/index.js` und Bootflow gegenueberstellen.
- S1.8 Profil-Push-Ist-Zustand inventarisieren:
  - Markup/DOM-IDs der Profil-Push-Section
  - Styles und Mobile-Bruchstellen
  - Event-Handler fuer Aktivieren/Deaktivieren
  - Funktionen fuer `refreshPushStatus`, `getPushRoutingStatus`, `shouldSuppressLocalPushes`
  - welche Teile rein UI sind und welche Teile operative Quelle fuer Incidents bleiben
- S1.9 Touchlog-Push-Ist-Zustand inventarisieren:
  - aktueller Push-Toggle-Vertrag
  - aktuelle Diagnosezeile unter dem Toggle
  - aktuelle Persistenz/LocalStorage-Bedeutung des Toggles
  - Unterschiede zwischen lokalem Dev-Flag und echter Push-Subscription
- S1.10 Uebernahmefaehige Patterns und No-Gos dokumentieren.
- S1.11 Contract Review S1:
  - keine Codeaenderung vor vollstaendiger Ist-Karte
  - klare Trennung zwischen sichtbarer Profil-Entfernung und operativer Push-Routing-Quelle
- S1.12 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Systemkarte des bestehenden Diagnostics-Pfads.
- Ist-Karte der Profil-Push-Verdrahtung.
- Ist-Karte der Touchlog-Push-Verdrahtung.
- Hestia-Lessons mit MIDAS-Abgrenzung.
- Liste betroffener Code- und Doku-Dateien.

Exit-Kriterium:

- Klarheit, was Touchlog v2 leisten soll, was aus dem Profil sichtbar entfernt wird und welche operativen Push-Schichten nicht betroffen sind.

#### S1 Ergebnisprotokoll

##### S1.1 README und allgemeine MIDAS-Guardrails
- Umsetzung/Review:
  - README erneut als Produktkarte gelesen.
  - Relevante Leitplanken fuer diesen Umbau: single-user, Push als ruhiges Schutznetz, keine Reminder-Ketten, keine Service-Worker-/Android-Ausweitung, keine versteckten Writes, Modulgrenzen ernst nehmen.
  - Profil ist laut README persoenlicher Kontext fuer Limits, Hausarztkontakt und Parameter; Push/Incidents sind eigener Betriebs- und Schutznetzpfad.
- Contract Review:
  - Der neue Zielvertrag `Profil push-frei, Touchlog als Maintenance-Zentrale` passt zu den README-Guardrails, solange die operative Push-Logik nicht ins Touchlog verschoben wird.
- Checks:
  - README gelesen.
- Findings:
  - Keine README-Blockade.
- Korrekturen:
  - Keine.
- Restrisiko:
  - README muss spaeter nur angepasst werden, falls sich der oeffentliche Modulvertrag sichtbar aendert; S6 prueft das.

##### S1.2 Diagnostics Module Overview
- Umsetzung/Review:
  - Diagnostics Overview gelesen.
  - Aktueller Vertrag: Touch-Log ist Dev/QA-Diagnoseflaeche, kein Business-Output und kein Produktfeature.
  - UI ist aktuell zweispaltig beschrieben: links Dev-Toggles, rechts Log-Stream.
  - Boot-Error-Fallback muss `diag.show()` oder Fallback-Log weiter deterministisch nutzen koennen.
- Contract Review:
  - Maintenance-Section darf Diagnostics erweitern, aber `diag.add` bleibt Event-Trace und wird kein State Store.
- Checks:
  - Overview gelesen und gegen Roadmap abgeglichen.
- Findings:
  - Diagnostics-Doku beschreibt noch nicht die geplante Maintenance-Zone.
- Korrekturen:
  - S6 muss Diagnostics Overview aktualisieren.
- Restrisiko:
  - Boot-Error-Overlay kann regressieren, wenn Markup/IDs unbedacht verschoben werden.

##### S1.3 Profile und Push Module Overviews
- Umsetzung/Review:
  - Profile Overview und Push Overview gelesen.
  - Beide beschreiben noch den alten Zwischenstand: Profil hat Push-Opt-in, Status und Health-Details; Touchlog hat Push-Toggle plus Diagnosezeile.
  - Push Overview bestaetigt: Profil-Modul exportiert Push-Routing-Stand fuer Incident-Engine; lokale Suppression nur bei gesundem Remote-Pfad.
- Contract Review:
  - Sichtbare Profil-Push-UI darf entfernt werden.
  - Operativer Routing-Stand darf nicht versehentlich entfernt werden, solange `incidents` diesen fuer lokale Suppression nutzt.
- Checks:
  - Profile/Push Overviews gelesen und gegen Roadmap verglichen.
- Findings:
  - Doku-Drift ist erwartbar: Profile und Push Overviews muessen nach Umsetzung auf `Profil ohne Push-Surface` und `Touchlog als sichtbare Push-Wartungs-Surface` aktualisiert werden.
- Korrekturen:
  - S6.2/S6.3 bleiben Pflicht.
- Restrisiko:
  - Technische Quelle kann vorerst im Profil-Modul bleiben, muss aber als interne/uebergangsweise Quelle dokumentiert werden.

##### S1.4 Push-Cadence-DONE-Roadmap
- Umsetzung/Review:
  - Relevante Abschnitte der DONE-Roadmap gelesen.
  - Ursprung des Ist-Zustands ist klar: S4.6 ergaenzte Profil-Push-Health, S4.7 entambiguiierte den bestehenden Dev-Push-Toggle, S4.8 machte das Diagnosepanel nur responsiver.
  - Die DONE-Roadmap nennt selbst als Follow-up: groesserer Hestia-inspirierter Touchlog-Umbau mit Maintenance-Section.
- Contract Review:
  - Der jetzige Umbau ist keine Korrektur der Push-Fachlogik, sondern die geplante Verlagerung der sichtbaren Wartungsoberflaeche.
- Checks:
  - Roadmap auf Push-Health, Touchlog, Profil und Mobile-Diagnose gescannt.
- Findings:
  - Profilkarte war bewusst ein schneller Sichtbarkeits-Fix, nicht der finale Maintenance-Ort.
- Korrekturen:
  - Keine Code-Korrektur in S1; S4 muss Sichtbarkeit verlagern.
- Restrisiko:
  - QA aus Phase P9 erwartet aktuell noch Profil-Pushstatus; S6 muss QA entsprechend aktualisieren.

##### S1.5 Screenshots / Ist-Zustand
- Umsetzung/Review:
  - Desktop-Profil: `Push & Erinnerungen` steht als grosse Karte unter `Aktuelle Daten`; auf Desktop noch lesbar, fachlich aber im Profil deplatziert.
  - Android-Profil: Push-Karte dominiert den Screen, Werte umbrechen unschoen, Buttons wirken wie ein eigener Push-Konfigurationsbereich.
  - Desktop-Touchlog: Push-Toggle, einzelne Statuszeile und Log-Stream teilen sich eine enge Flaeche; kein eigener Maintenance-Block.
  - Android-Touchlog: Panel ist bedienbar, aber Toggle-Liste und Log-Stream wirken gestapelt und technisch roh; Log ist dominant.
- Contract Review:
  - Screenshots bestaetigen den Zielvertrag: Profil muss push-frei werden, Touchlog braucht geordnete Maintenance statt Statuszeile zwischen Toggles.
- Checks:
  - Screenshots visuell gegen Roadmap-Zielstruktur geprueft.
- Findings:
  - Die direkte Statusbox unter dem Push-Toggle ist eher Zwischenloesung als finale Informationsarchitektur.
- Korrekturen:
  - S2.4 bleibt wichtig: Statuszeile entfernen oder in Push-Maintenance-Block integrieren.
- Restrisiko:
  - Mobile-Layout muss am echten Android-Geraet abgenommen werden; Desktop-Sizing reicht nicht.

##### S1.6 HESTIA-Referenzen
- Umsetzung/Review:
  - HESTIA Touchlog Overview, DONE-Roadmap, `touchlog.js`, `devtools.css` und `index.html` gelesen.
  - HESTIA trennt Sidebar/Status/Controls von Log-Stream.
  - Aktive Diagnosemodi werden als Liste/Pills sichtbar, nicht als Log-Spam.
  - `Touchlog leeren` und `Dev State zuruecksetzen` sind kleine lokale Hilfsaktionen.
  - Mobile nutzt eigenes Layout mit Safe-Area, einspaltiger Struktur und begrenztem Log.
- Contract Review:
  - Uebernehmbar fuer MIDAS: Informationsarchitektur, aktive Modi, lokale Hilfsaktionen, mobile Safe-Area-Logik.
  - Nicht uebernehmbar: HESTIA-Darstellungs-/Artstyle-Schalter, Household-/Sync-Begriffe und HESTIA-spezifische Kategorien.
- Checks:
  - HESTIA-Doku und Code gelesen.
- Findings:
  - HESTIA bestaetigt: weniger Toggles, klarere Zonen und ruhiger Event-Trace sind wirksamer als technische Breite.
- Korrekturen:
  - Keine.
- Restrisiko:
  - MIDAS-Push ist echter Betriebshebel, nicht nur lokaler Dev-Modus; UI muss das deutlicher trennen als HESTIA.

##### S1.7 MIDAS-Codepfade gegenuebergestellt
- Umsetzung/Review:
  - Gelesen/gescannt: `index.html`, `app/core/diag.js`, `app/core/boot-flow.js`, `app/diagnostics/devtools.js`, `app/modules/profile/index.js`, `app/modules/incidents/index.js`, `app/styles/auth.css`, `app/styles/hub.css`, `app/styles/base.css`.
  - `index.html` enthaelt:
    - `#diag` mit `#devTogglePush`, `#devPushStatus`, Sound/Haptik/No Cache/Assistant und `#diagLog`.
    - Profil-Push-Section `.profile-push-health` mit `#profilePushStatus`, `#profilePushDetails`, `#profilePushEnableBtn`, `#profilePushDisableBtn`.
  - `diag.js` verwaltet `#diag`, `#diagLog`, `#diagClose`, Dedupe und Summary-Eintraege.
  - `boot-flow.js` oeffnet bei Boot-Fehlern `diag.show()` oder rendert einen Fallback-Log.
- Contract Review:
  - IDs `#diag`, `#diagLog`, `#diagClose` muessen bei Markup-Umbau erhalten oder sauber in `diag.js`/Bootflow nachgezogen werden.
- Checks:
  - Gezielt mit `rg` und Snippet-Reads geprueft.
- Findings:
  - `auth.css` hat bereits mobile Diagnose-Regeln, aber keine echte Maintenance-Informationsarchitektur.
- Korrekturen:
  - S4.1/S4.5 muessen Markup/CSS behutsam umstellen.
- Restrisiko:
  - Fokus-Trap/Boot-Error kann brechen, wenn Panel-Struktur ohne ID-Vertrag geaendert wird.

##### S1.8 Profil-Push-Ist-Zustand
- Umsetzung/Review:
  - `profile/index.js` cached Push-DOM-Refs: `profilePushEnableBtn`, `profilePushDisableBtn`, `profilePushStatus`, `profilePushDetails`.
  - `renderPushDetails()` erzeugt die technische Detailtabelle im Profil.
  - `handleEnablePush()` und `handleDisablePush()` sind die operativen Push-Opt-in/Opt-out-Funktionen.
  - Public API: `enablePush`, `disablePush`, `isPushEnabled`, `refreshPushStatus`, `getPushRoutingStatus`, `shouldSuppressLocalPushes`.
  - `state.pushRouting` haelt Browser-Abo, Remote-Health, Remote-Failure, Failure-Reason, Suppression und `checkedAt`.
- Contract Review:
  - Sichtbare Profil-UI ist entfernbar.
  - Public API und Routing-State sind aktuell operative Quelle fuer Touchlog und lokale Incident-Suppression.
- Checks:
  - `profile/index.js` gezielt gelesen.
- Findings:
  - Kritisch: `refreshPushStatus()` startet aktuell mit `if (!refs?.pushStatus) return;`. Wenn die Profil-Push-UI entfernt wird, wuerde ohne Korrektur der Routing-State nicht mehr aktualisiert.
  - `handleEnablePush()`/`handleDisablePush()` sind robust gegen fehlende Buttons, weil sie Button-Refs optional behandeln; Fehlerpfade rufen aber `setPushStatus()`/`renderPushDetails()` auf, die ohne DOM still aussteigen.
- Korrekturen:
  - S4.3 wurde geschaerft: `refreshPushStatus()` muss auch ohne sichtbare Profil-Push-DOM-Elemente den Push-Routing-State aktualisieren.
- Restrisiko:
  - Wenn diese Entkopplung in S4 vergessen wird, koennen Touchlog-Health und lokale Push-Suppression stale werden.

##### S1.9 Touchlog-Push-Ist-Zustand
- Umsetzung/Review:
  - `devtools.js` beschreibt selbst: Push-Toggle reused Profile-Buttons/API, um doppelte Logik zu vermeiden.
  - `updatePushToggle()` ruft `profile.refreshPushStatus({ reason: 'devtools' })`, `profile.isPushEnabled()` und `profile.getPushRoutingStatus()`.
  - Toggle-Change ruft `profile.enablePush()` oder `profile.disablePush()`.
  - `describePushRouting()` erzeugt die aktuelle Diagnosezeile: kein Browser-Abo, remote gesund, Health-Check nicht lesbar, bereit/wartet, Zustellung pruefen.
  - Sound/Haptik/No Cache/Assistant sind lokale Flags; Push ist kein rein lokaler Dev-Flag.
- Contract Review:
  - Touchlog ist bereits technisch der zweite Push-Bedienpunkt.
  - S2/S4 muessen Push aus der Dev-Toggle-Liste in einen Maintenance-/Push-Control-Kontext heben, damit es nicht wie ein lokaler Dev-Modus wirkt.
- Checks:
  - `devtools.js` gelesen.
- Findings:
  - `devPushStatus` ist funktional nuetzlich, aber als einzelne Statusbox zwischen Toggles nicht die finale Maintenance-Struktur.
  - Keine eigene aktive-Modi-Liste im MIDAS-Touchlog vorhanden.
- Korrekturen:
  - Keine Code-Korrektur in S1; S2/S4 konkretisieren.
- Restrisiko:
  - Push-Control darf nicht als lokaler Toggle missverstanden werden; Copy und Layout muessen das klaeren.

##### S1.10 Uebernahmefaehige Patterns und No-Gos
- Umsetzung/Review:
  - Uebernahmefaehig:
    - Sidebar/oben fuer Maintenance und Modi, rechts/unten fuer Log.
    - aktive Modi als Liste/Pills.
    - lokale Hilfsaktionen ohne Produktdatenwirkung.
    - deduplizierter ruhiger Event-Trace.
    - mobile Safe-Area- und einspaltige Struktur.
  - No-Gos:
    - HESTIA-Darstellungs-/Artstyle-Schalter.
    - weitere technische Toggle-Sammlung ohne Diagnosefrage.
    - Push als blosses lokales Dev-Flag behandeln.
    - Push-Fachlogik, Service Worker, Android oder Backend anfassen.
- Contract Review:
  - HESTIA wird als Architektur- und UX-Vorbild genutzt, nicht als Funktionsumfang-Vorlage.
- Checks:
  - HESTIA vs. MIDAS Roadmap abgeglichen.
- Findings:
  - MIDAS braucht einen eigenen Push-Wartungsblock, weil Push hier produktiver Betrieb ist.
- Korrekturen:
  - Keine.
- Restrisiko:
  - Zu viele Maintenance-Bloecke koennen Touchlog wieder ueberladen.

##### S1.11 Contract Review S1
- Ergebnis:
  - S1 ist fachlich abgeschlossen.
  - Die Roadmap bleibt im Scope: sichtbare UI-Verlagerung und Maintenance-Struktur, keine Push-Fachlogik.
  - Profil-Push-UI kann entfernt werden, aber nicht blind die Profil-Push-APIs.
  - `profile.getPushRoutingStatus()`/`shouldSuppressLocalPushes()` sind aktuell operative Quellen fuer `incidents`.
  - `refreshPushStatus()` muss vor der sichtbaren Profil-Entfernung DOM-unabhaengig gemacht werden.
- Checks:
  - Doku- und Codepfade gegeneinander gelesen.
  - S4.3 als Korrekturpunkt nachgeschaerft.
- Findings:
  - P0/P1 vor S4: DOM-Abhaengigkeit in `refreshPushStatus()` bei entfernter Profil-Push-UI.
- Korrekturen:
  - Roadmap-S4.3 korrigiert.
- Restrisiko:
  - S2 hat entschieden: Fuer diese Roadmap bleibt die bestehende Profile-Push-API interne Quelle; eine vollstaendige Modulmigration ist nicht im Scope.

##### S1.12 Schritt-Abnahme und Commit-Empfehlung
- Abnahme:
  - Alle S1-Referenzen sind gelesen.
  - Ist-Zustand von Profil-Push und Touchlog-Push ist dokumentiert.
  - HESTIA-Learnings sind auf MIDAS abgegrenzt.
  - Der kritische technische Korrekturpunkt fuer S4 ist in der Roadmap festgehalten.
- Doku-Sync:
  - Dieses Ergebnisprotokoll synchronisiert die aktive Roadmap fuer S1.
  - Module Overviews bleiben bis S6 unveraendert, weil noch kein Code-Vertrag umgesetzt wurde.
- Commit-Empfehlung:
  - Optionaler Doku-Commit nach S1 moeglich: `docs(touchlog): document S1 diagnostics and push routing findings`.
  - Praktischer ist ein gemeinsamer Commit nach S3, wenn Informationsarchitektur und Risikoanalyse ebenfalls abgeschlossen sind.

## S2 - Touchlog-Contract und Maintenance-Informationsarchitektur

Ziel:

- Festlegen, was Maintenance im MIDAS-Touchlog bedeutet.
- Festlegen, dass Profil keine sichtbare Push- oder Reminder-Surface bleibt.
- Keine beliebige Debug-Konsole bauen.

Substeps:

- S2.1 Maintenance-Begriff fuer MIDAS definieren.
- S2.2 Push-Health-Details klassifizieren:
  - muss in Maintenance
  - optional
  - bewusst nicht anzeigen
- S2.3 Profil-Entkopplungsvertrag definieren:
  - keine Profil-Section `Push & Erinnerungen`
  - keine Profil-Push-Buttons
  - kein Profil-Push-Kurzstatus
  - keine Profil-Push-Health-Details
  - technische Profile-Push-APIs nur als interne/uebergangsweise Quelle, falls S1 das als risikoarm bestaetigt
- S2.4 Push-Bedienvertrag im Touchlog definieren:
  - Toggle als echter Push-Wartungshebel oder klar beschrifteter Push-Control
  - Aktivieren/Deaktivieren nur mit expliziter Nutzeraktion
  - Status nicht als Log-Spam, sondern als Maintenance-Zustand
  - Diagnosezeile unter dem Toggle entweder entfernen oder in den Maintenance-Block integrieren
- S2.5 aktive Diagnosemodi definieren.
- S2.6 Hilfsaktionen festlegen:
  - Touchlog leeren
  - Dev State zuruecksetzen, falls sinnvoll
  - keine produktiven Datenaktionen
- S2.7 Informationsdichte gegen Mobile-Realitaet pruefen.
- S2.8 PII-/Security-Constraints reviewen.
- S2.9 finalen Informationsvertrag dokumentieren.
- S2.10 Contract Review S2.
- S2.11 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Finaler Maintenance-Informationsvertrag.
- Finaler Profil-ohne-Push-Vertrag.
- Finaler Push-Control-Vertrag fuer den Touchlog.

Exit-Kriterium:

- Es ist klar, welche Bloecke ins Panel kommen und welche bewusst draussen bleiben.
- Es ist klar, welche sichtbaren Profil-Push-Teile entfernt werden und welche technischen Quellen vorerst bleiben duerfen.

#### S2 Ergebnisprotokoll

##### S2.1 Maintenance-Begriff fuer MIDAS
- Umsetzung:
  - Maintenance im MIDAS-Touchlog bedeutet: kurze Betriebszustaende fuer lokale Wartung, QA und Fehlersuche.
  - Maintenance beantwortet nur Fragen, die beim Betrieb der App direkt helfen:
    - Ist Push erreichbar und gesund genug?
    - Welche lokalen Diagnosemodi sind aktiv?
    - Ist der Log-Stream nutzbar und ruhig?
    - Gibt es eine lokale Hilfsaktion, die die Diagnose erleichtert?
  - Maintenance ist kein Dashboard, kein Produktbereich, kein Remote-Monitoring und kein Ort fuer Produktdatenaktionen.
- Contract:
  - `diag.add` bleibt Event-Trace.
  - Maintenance liest vorhandene Zustaende, speichert keine neue Wahrheit und veraendert keine fachlichen Daten.
  - Touchlog darf Push aktivieren/deaktivieren, weil das bereits heute ueber den Touchlog-Toggle erreichbar ist; diese Bedienung wird nur sauberer positioniert.
- Findings:
  - Keine Korrektur noetig.

##### S2.2 Push-Health-Details klassifiziert
- Muss in Maintenance:
  - Push-Control: aktivieren/deaktivieren als explizite Nutzeraktion.
  - Browser-Berechtigung: erlaubt, blockiert, unbekannt.
  - Browser-Abo: aktiv, fehlt, unbekannt.
  - Remote-Status: gesund, pruefen, unbekannt.
  - Letzter Remote-Erfolg.
  - Letzter Remote-Fehler als kurze Kategorie, nicht als Rohpayload.
  - Geprueft um / `checkedAt`.
- Optional, nur wenn platzsparend:
  - knappe Handlungszeile wie `Push bereit`, `Browser-Abo fehlt`, `Zustellung pruefen`.
  - letzter Health-Check-Grund in normalisierter Form, falls ohne UID/Endpoint/Payload.
- Bewusst nicht anzeigen:
  - Subscription-Endpoint.
  - UID, User-ID, Push-Token oder Auth-Rohdaten.
  - komplette Payloads, JSON-Rohdaten, Stacktraces.
  - Supabase-Querydetails.
  - medizinische Produktdaten oder Incident-Inhalte.
  - permanente Wiederholung jedes Push-Zustands im Log.
- Contract:
  - Push-Health ist sichtbar nur im Touchlog/Maintenance-Kontext.
  - Status darf knapp technisch sein, aber nicht alarmistisch.
- Findings:
  - Die bisherige Statuszeile unter dem Push-Toggle ist inhaltlich brauchbar, aber architektonisch falsch platziert. Sie wird in S4 in den Push-Maintenance-Block integriert oder ersetzt.

##### S2.3 Profil-Entkopplungsvertrag
- Umsetzung:
  - Profil enthaelt nach S4 keine sichtbare `Push & Erinnerungen`-Section mehr.
  - Profil enthaelt keine Push-Buttons.
  - Profil enthaelt keinen Push-Kurzstatus.
  - Profil enthaelt keine Push-Health-Details.
  - Profil bleibt Stammdaten-, Limit-, Arztkontakt- und Medication-Snapshot-Flaeche.
- Technischer Vertrag fuer diese Roadmap:
  - Die bestehende Profile-Push-API darf als interne/uebergangsweise Quelle bleiben:
    - `enablePush`
    - `disablePush`
    - `isPushEnabled`
    - `refreshPushStatus`
    - `getPushRoutingStatus`
    - `shouldSuppressLocalPushes`
  - Diese API darf keine sichtbare Profil-Push-Surface voraussetzen.
  - Eine vollstaendige Push-Service-/Modulmigration ist nicht Teil dieser Roadmap.
- Contract:
  - Sichtbar gilt: Touchlog ist die einzige Push-Wartungs- und Bedienoberflaeche.
  - Intern gilt: Profil-Modul darf vorerst technische Quelle bleiben, wenn S4 die DOM-Abhaengigkeit entfernt.
- Findings:
  - S4.4 war noch als offene Entscheidung formuliert. S2 entscheidet: fuer diese Roadmap bestehende interne Profile-API weiterverwenden, aber UI-unabhaengig haerten.
- Korrektur:
  - S4.4 wurde entsprechend konkretisiert.

##### S2.4 Push-Bedienvertrag im Touchlog
- Umsetzung:
  - Push bekommt im Touchlog einen eigenen Maintenance-Block, nicht nur einen Eintrag zwischen Dev-Toggles.
  - Der Control muss als echter Push-Wartungshebel erkennbar sein.
  - Aktivieren und Deaktivieren bleiben explizite Nutzeraktionen.
  - Der Status wird im Maintenance-Block angezeigt, nicht als Log-Spam.
  - Der bestehende `devPushStatus` wird nicht als lose Warnbox weitergefuehrt, sondern als Statuszeile/Statusfeld innerhalb des Push-Blocks.
- Zielstruktur:
  - Titel: `Push-Wartung` oder gleichwertig knapp.
  - Primaerstatus: `aktiv`, `nicht aktiv`, `Browser-Abo fehlt`, `Zustellung pruefen`, `unbekannt`.
  - Details kompakt darunter: Berechtigung, Abo, Remote, letzter Erfolg, letzter Fehler, geprueft.
  - Control: klarer Toggle oder zwei klare Actions, je nachdem was in S4 mobile robuster ist.
- Contract:
  - Push-Control gehoert nicht zur Liste der lokalen Dev-Modi.
  - Push-Control darf die gleiche fachliche Funktion wie heute nutzen, aber die UI muss den produktiven Charakter zeigen.
- Findings:
  - Keine weitere Roadmap-Korrektur noetig.

##### S2.5 Aktive Diagnosemodi
- Umsetzung:
  - Aktive Modi werden als eigener kompakter Block sichtbar, nicht als Log-Eintraege.
  - Aufgenommen werden nur lokale Diagnose-/Hilfsmodi:
    - Sound.
    - Haptik.
    - No Cache.
    - Assistant.
  - Push wird nicht als Diagnosemodus gefuehrt, sondern im Push-Wartungsblock.
  - Inaktive Modi muessen nicht prominent angezeigt werden; der Toggle-Bereich bleibt fuer Bedienung sichtbar.
- Contract:
  - Modi-Liste ist Statusanzeige, keine zweite Toggle-Leiste.
  - Statusaenderungen duerfen einmalig geloggt werden, aber nicht permanent gespiegelt.
- Findings:
  - S4.10 bleibt passend.

##### S2.6 Hilfsaktionen
- Umsetzung:
  - `Touchlog leeren` wird fuer S4 bestaetigt.
  - Wirkung: nur sichtbaren lokalen Log-Stream leeren oder zuruecksetzen; keine Produktdaten, keine Push-Subscription, keine Remote-Daten.
  - `Dev State zuruecksetzen` wird fuer diese Roadmap nicht umgesetzt.
- Begruendung:
  - Touchlog leeren ist eine klare lokale Diagnoseaktion.
  - Dev-State-Reset waere breiter, koennte Toggles/Persistenz unerwartet beruehren und braucht einen eigenen Vertrag.
- Contract:
  - Lokale Hilfsaktionen muessen reversibel oder harmlos sein.
  - Keine Hilfsaktion darf medizinische Daten, Profile, Incidents, Push-Subscriptions oder Remote-Zustaende loeschen.
- Findings:
  - S4.12 als optionaler Dev-State-Reset ist nach S2 nicht mehr Teil der Umsetzung.
- Korrektur:
  - S4.12 wurde auf `nicht umsetzen`/bewusst draussen konkretisiert.

##### S2.7 Informationsdichte und Mobile-Realitaet
- Umsetzung:
  - Mobile-Reihenfolge:
    - Header mit Close.
    - Push-Wartung.
    - Aktive Modi.
    - Lokale Dev-Toggles.
    - Hilfsaktionen.
    - Log-Stream.
  - Desktop-Reihenfolge:
    - Linke/obere Zone fuer Maintenance, Modi, Controls und Hilfsaktionen.
    - Rechte/untere Zone fuer Log.
  - Details werden kompakt und zweizeilig robust geplant, nicht als breite Tabellen.
- Contract:
  - Keine horizontalen Scrollbars im normalen Mobile-Panel.
  - Log darf scrollen, aber nicht die Wartungsbloecke verdraengen.
  - Close bleibt erreichbar.
- Findings:
  - Die Profil-Push-Tabelle aus dem Screenshot darf nicht 1:1 in den Touchlog wandern; sie muss kompakter werden.

##### S2.8 PII-/Security-Constraints
- Umsetzung:
  - Nicht anzeigen:
    - UID/User-ID.
    - Tokens, Push-Endpoint, Subscription-Rohdaten.
    - E-Mail-Adressen.
    - Supabase-Payloads oder Querydetails.
    - medizinische Intake-/Incident-Payloads.
  - Erlaubt:
    - normalisierte Zustandsworte.
    - kurze Zeitstempel.
    - kurze Fehlerkategorien ohne Rohdaten.
- Contract:
  - Touchlog ist lokal sichtbar, aber nicht automatisch sicher fuer Rohdaten.
  - Debug-Nutzen rechtfertigt keine sensiblen Werte.
- Findings:
  - Keine Korrektur noetig.

##### S2.9 Finaler Informationsvertrag
- Touchlog/Maintenance enthaelt:
  - Push-Wartung mit Control und kompaktem Health-Status.
  - Aktive Diagnosemodi.
  - Lokale Dev-Toggles.
  - Hilfsaktion `Touchlog leeren`.
  - Separaten, deduplizierten Log-Stream.
- Touchlog/Maintenance enthaelt nicht:
  - Produktdatenaktionen.
  - Remote Monitoring.
  - Rohdaten/PII/Endpoints.
  - Profil-Stammdaten.
  - Dev-State-Reset in dieser Roadmap.
- Profil enthaelt:
  - Stammdaten, Limits, Arztkontakt, Medication-Snapshot.
- Profil enthaelt nicht:
  - Push-Wartung.
  - Push-Health.
  - Push-Buttons.
  - Push-Kurzstatus.
- Technische Quelle:
  - Fuer diese Roadmap bleibt die bestehende Profile-Push-API interne Quelle, muss aber ohne Profil-DOM funktionieren.

##### S2.10 Contract Review S2
- Ergebnis:
  - S2 ist fachlich abgeschlossen.
  - Der Touchlog-Contract ist konkret genug fuer S3-Risikopruefung und S4-Umsetzung.
  - Der Profil-ohne-Push-Vertrag ist eindeutig.
  - Die technische Quelle ist entschieden: vorerst bestehende Profile-Push-API, keine neue Push-Modulmigration.
- Findings:
  - F1: S4.4 war zu offen formuliert.
  - F2: S4.12 liess Dev-State-Reset noch optional offen, obwohl S2 ihn bewusst aus dem Scope nimmt.
- Korrekturen:
  - S4.4 konkretisiert.
  - S4.12 konkretisiert.
- Restrisiko:
  - S3 muss noch pruefen, ob die UI-Texte `Push-Wartung`, `aktiv`, `nicht aktiv`, `Zustellung pruefen` auf Mobile klar genug sind.
  - S3 muss die genaue Bruchrisiko-Liste fuer fehlende Profil-Push-DOM-Refs final abklopfen.

##### S2.11 Schritt-Abnahme und Commit-Empfehlung
- Abnahme:
  - S2.1 bis S2.11 sind umgesetzt.
  - Finaler Maintenance-Informationsvertrag ist dokumentiert.
  - Finaler Profil-ohne-Push-Vertrag ist dokumentiert.
  - Finaler Push-Control-Vertrag fuer den Touchlog ist dokumentiert.
  - Eventuelle S2-Findings wurden in S4 korrigiert.
- Doku-Sync:
  - Module Overviews bleiben bis S6 unveraendert, weil noch kein Code-Vertrag umgesetzt wurde.
- Commit-Empfehlung:
  - Praktischer Commit weiterhin nach S3, weil dann Detektivarbeit, Informationsarchitektur und Risikoanalyse zusammen abgeschlossen sind.

## S3 - Bruchrisiko-, Mobile- und User-Facing-Copy-Review

Ziel:

- Risiken vor Code finden.
- Mobile Verhalten und Copy-Vertrag pruefen.
- S4-Substeps konkretisieren.

Substeps:

- S3.1 Bruchrisiken identifizieren:
  - Log-Spam
  - PII-/Token-Leak
  - falsche Push-Health-Sicherheit
  - falscher Alarm bei neutralen Zustaenden
  - abgeschnittener Mobile-Dialog
  - unerreichbarer Close-Button
  - Boot-Error-Regression
  - Dev-Toggles verlieren Persistenz oder Reversibilitaet
  - Profil-Entfernung bricht `profile:changed` oder lokale Push-Suppression
  - Touchlog-Push-Toggle wird mit lokalem Dev-Flag verwechselt
  - Push aktivieren/deaktivieren ist nach Profil-Entfernung nicht mehr erreichbar
- S3.2 User-Facing Copy Review:
  - Maintenance-Texte muessen kurz, ruhig und eindeutig sein.
  - `bereit` darf nicht wie Fehler wirken.
  - `remote gesund` darf nur bei echtem Erfolg erscheinen.
  - `Zustellung pruefen` muss auf echten Handlungs-/Warnbedarf begrenzt bleiben.
  - Profil enthaelt keine Push-Copy mehr und kann daher nicht mit Touchlog widersprechen.
  - Push-Control im Touchlog darf nicht wie ein beliebiger lokaler Dev-Modus wirken.
- S3.3 Accessibility Review:
  - Close erreichbar
  - Tastaturbedienung
  - `aria-live` nicht zu laut
  - Fokus-/Scrollverhalten
- S3.4 Tooling und lokal moegliche Checks klaeren.
- S3.5 Profil-Entkopplungsrisiken konkret pruefen:
  - leere DOM-Refs nach Entfernen der Profil-Push-Section
  - Event-Handler duerfen fehlende Buttons tolerieren
  - kein toter `aria-controls`-/Label-Verweis
  - keine ungenutzten Styles mit sichtbarem Layout-Effekt
- S3.6 S4-Substeps konkretisieren.
- S3.7 Contract Review S3.
- S3.8 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Bruchrisiko-Liste.
- Copy-/Status-Vertrag.
- Profil-Entkopplungsplan.
- Umsetzungsplan fuer S4.

Exit-Kriterium:

- S4 kann ohne Grundsatzentscheid starten.

#### S3 Ergebnisprotokoll

##### S3.1 Bruchrisiken
- Log-Spam:
  - Risiko: Push-Status, aktive Modi oder Health-Checks koennten bei jedem Refresh den Log fluten.
  - Vertrag: Status lebt in Maintenance; Log bekommt nur echte Ereignisse oder manuelle Aktionen.
- PII-/Token-Leak:
  - Risiko: Push-Subscription, UID, Payloads oder Supabase-Details koennten aus Debug-Komfort sichtbar werden.
  - Vertrag: nur normalisierte Labels und kurze Zeitstempel anzeigen.
- Falsche Push-Health-Sicherheit:
  - Risiko: `remote gesund` koennte erscheinen, obwohl nur lokale Subscription aktiv ist.
  - Vertrag: `remote gesund` nur nach echtem Remote-Erfolg; sonst `unbekannt`, `Browser-Abo fehlt` oder `Zustellung pruefen`.
- Falscher Alarm bei neutralem Zustand:
  - Risiko: `bereit, wartet auf erste faellige Erinnerung` koennte wie Fehler wirken.
  - Vertrag: neutral als `bereit` oder `bereit, wartet` formulieren, nicht gelb/rot eskalieren.
- Mobile-Dialog:
  - Risiko: breite Detailtabellen, lange Labels und Log-Zeilen erzeugen horizontales Scrollen.
  - Vertrag: Details als kompakte Key/Value-Zeilen mit Wrapping; Log separat scrollen lassen.
- Close/Button-Erreichbarkeit:
  - Risiko: Header oder Close verschwindet hinter Scroll/Viewport/Safe-Area.
  - Vertrag: Header sticky oder dauerhaft sichtbar; Close als echter Button.
- Boot-Error-Regression:
  - Risiko: `#diag`, `#diagLog`, `#diagClose` werden bei Markup-Umbau gebrochen.
  - Vertrag: IDs erhalten oder alle Binding-Pfade gleichzeitig anpassen.
- Dev-Toggle-Persistenz:
  - Risiko: Sound/Haptik/No Cache/Assistant verlieren lokale Semantik.
  - Vertrag: Toggles bleiben lokale Diagnose-/Hilfsmodi; Push wird aus dieser Gruppe herausgehoben.
- Profil-Entkopplung:
  - Risiko: fehlende Profil-Push-DOM-Refs stoppen `refreshPushStatus()` oder brechen Button-Handler.
  - Vertrag: Profile-Push-API muss DOM-unabhaengig arbeiten; sichtbare Profil-Refs optional behandeln.
- Touchlog-Push-Verwechslung:
  - Risiko: Push wirkt wie ein lokaler Dev-Toggle.
  - Vertrag: eigener Block `Push-Wartung`, nicht in der lokalen Toggle-Liste.
- Push-Erreichbarkeit:
  - Risiko: Nach Entfernen aus Profil ist Aktivieren/Deaktivieren nicht mehr auffindbar.
  - Vertrag: Touchlog ist alleinige sichtbare Push-Bedienoberflaeche.

##### S3.2 User-Facing-Copy-Review
- Finaler Copy-Vertrag fuer S4:
  - Blocktitel: `Push-Wartung`.
  - Primaerstatus:
    - `aktiv`
    - `nicht aktiv`
    - `Browser-Abo fehlt`
    - `Zustellung pruefen`
    - `unbekannt`
  - Neutrale Detailtexte:
    - `Berechtigung`
    - `Browser-Abo`
    - `Remote`
    - `Letzter Erfolg`
    - `Letzter Fehler`
    - `Geprueft`
  - Erlaubte Kurzzeilen:
    - `Push bereit`
    - `bereit, wartet`
    - `remote gesund`
    - `Health-Check offen`
  - Nicht verwenden:
    - `alles sicher`
    - `garantiert`
    - `Fehler`, wenn nur noch keine Erinnerung faellig ist
    - technische Rohbegriffe wie `subscription endpoint`, `payload`, `uid`
- Bewertung:
  - `Push-Wartung` ist fuer diesen Wartungsbereich klar genug.
  - `Zustellung pruefen` bleibt absichtlich eine Handlungsformulierung und wird nur bei echtem Warnsignal verwendet.
  - `nicht aktiv` ist besser als `deaktiviert`, weil es neutraler wirkt und nicht automatisch Fehler bedeutet.
  - `Browser-Abo fehlt` ist technisch, aber fuer Maintenance verstaendlich und kurz.
- Nutzerentscheidung vom 26.04.2026:
  - Sichtbarer Blocktitel bleibt `Push-Wartung`.
  - Neutraler Inaktiv-Status bleibt `nicht aktiv`.
  - S4 startet mit dieser Copy.

##### S3.3 Accessibility Review
- Close:
  - Close bleibt ein Button, nicht nur ein visuelles `X`.
  - Auf Mobile muss er im sichtbaren Header erreichbar bleiben.
- Tastatur:
  - Fokusreihenfolge: Close, Push-Control, lokale Toggles, Hilfsaktion, Log.
  - Keine Fokusfalle durch interne Scrollbereiche.
- `aria-live`:
  - Log darf nicht laut jede Statusaenderung ansagen.
  - Maintenance-Status kann ruhig aktualisiert werden; keine aggressive Live-Region.
- Scroll:
  - Panel-Scroll und Log-Scroll duerfen sich nicht gegenseitig blockieren.
  - Mobile braucht klare Max-Hoehen fuer den Log.
- Findings:
  - S4 muss bei neuen Buttons/Controls explizite Labels setzen.

##### S3.4 Tooling und lokale Checks
- Moegliche Checks in S4/S5:
  - `git diff --check`.
  - `rg` gegen entfernte Profil-Push-IDs.
  - `rg` gegen verbotene Rohdatenbegriffe in Touchlog-Markup/Devtools.
  - Browser-Smoke Desktop.
  - Android-Smoke am echten Geraet.
  - optional Playwright/Screenshot-Smoke, falls vorhandenes Setup schnell verfuegbar ist.
- Konkrete `rg`-Checks:
  - Nach S4 duerfen `profilePushEnableBtn`, `profilePushDisableBtn`, `profilePushStatus`, `profilePushDetails` nicht mehr als harte UI-Pflicht im Profil wirken.
  - `Push & Erinnerungen` darf im Profil-Markup nicht mehr sichtbar sein.
  - `endpoint`, `payload`, `uid` duerfen im Touchlog-UI-Code nicht als sichtbare Labels auftauchen.

##### S3.5 Profil-Entkopplungsplan
- Markup:
  - `.profile-push-health` inklusive Buttons und Detailcontainer aus `index.html` entfernen.
- Profile-JS:
  - Push-DOM-Refs optional behandeln.
  - `refreshPushStatus()` so umbauen, dass State-Aktualisierung vor UI-Rendering passiert.
  - `renderPushDetails()` und `setPushStatus()` duerfen bei fehlender UI still aussteigen.
  - `enablePush`/`disablePush` bleiben als interne API fuer Touchlog erhalten.
- Devtools/Touchlog:
  - Touchlog ruft weiter die interne Profile-API auf.
  - Push-Control im Touchlog zeigt produktiven Push-Zustand, keinen Dev-Modus.
- Styles:
  - Profil-Push-Styles entfernen, wenn eindeutig ungenutzt.
  - Falls Entfernen zu riskant ist, duerfen sie ohne sichtbare Wirkung bis S6/S5-Review liegen bleiben.
- Tests/Smokes:
  - Profil oeffnet ohne Push-Section.
  - Touchlog kann Push aktivieren/deaktivieren.
  - Incident lokale Suppression bleibt ueber `shouldSuppressLocalPushes()` erreichbar.

##### S3.6 Konkretisierte S4-Pflichtpunkte
- S4 muss zusaetzlich beachten:
  - `#diag`, `#diagLog`, `#diagClose` bleiben stabil oder werden geschlossen migriert.
  - Push-Wartung steht auf Mobile vor lokalen Toggles.
  - Push ist nicht Teil der aktiven Diagnosemodi.
  - `devPushStatus` wird in den Push-Wartungsblock integriert oder ersetzt.
  - `Touchlog leeren` loescht nur den sichtbaren lokalen Log-Stream.
  - Kein Dev-State-Reset.
  - Keine Profil-Push-Copy bleibt sichtbar.
  - Keine sensible Rohdaten-Copy wird eingefuehrt.
- S4-Substeps sind ausreichend konkret, brauchen aber eine Copy-Pflicht in S4.13.
- Korrektur:
  - S4.13 wurde auf den S3-Copy-Vertrag konkretisiert.

##### S3.7 Contract Review S3
- Ergebnis:
  - S3 ist fachlich abgeschlossen.
  - S4 kann ohne Grundsatzentscheid starten.
  - Die einzige bewusst optionale Nutzerentscheidung ist kosmetisch: exakter Blocktitel/Labelton fuer Push.
- Findings:
  - F1: S4.13 war zu allgemein; Copy-Vertrag musste verbindlich auf S3 zeigen.
  - F2: S5-Smokes sollten nach S3 auch pruefen, dass keine Profil-Push-Copy und keine Rohdaten-Copy sichtbar sind.
- Korrekturen:
  - S4.13 konkretisiert.
  - S5.9 konkretisiert.
- Restrisiko:
  - Echte Mobile-Abnahme bleibt erst nach S4/S5 moeglich.
- Ob `Push-Wartung` emotional der beste Titel ist, ist eine Produkt-Tonfrage, nicht mehr blocker fuer Umsetzung.
  - Erledigt am 26.04.2026: `Push-Wartung` und `nicht aktiv` sind bestaetigt.

##### S3.8 Schritt-Abnahme und Commit-Empfehlung
- Abnahme:
  - Bruchrisiko-Liste ist dokumentiert.
  - Copy-/Status-Vertrag ist dokumentiert.
  - Accessibility- und Mobile-Grenzen sind dokumentiert.
  - Profil-Entkopplungsplan ist dokumentiert.
  - S4 kann starten.
- Doku-Sync:
  - Module Overviews bleiben bis S6 unveraendert, weil noch kein Code-Vertrag umgesetzt wurde.
- Commit-Empfehlung:
  - Jetzt sinnvoller Doku-Commit moeglich: `docs(touchlog): complete S1-S3 maintenance planning`.

## S4 - Umsetzung Touchlog v2

Ziel:

- Touchlog v2 sequenziell umsetzen.
- Sichtbare Profil-Push-UI sequenziell entfernen.
- Nach jedem Substep direkt pruefen und dokumentieren.

Substeps:

- S4.1 `index.html` Touchlog-Markup fuer Header, Maintenance, Toggles und Log strukturieren.
- S4.2 Profil-Push-Markup und sichtbare Profil-Push-Controls entfernen.
- S4.3 Profile-JS so haerten, dass fehlende Profil-Push-DOM-Elemente keine Fehler erzeugen und `refreshPushStatus()` den Push-Routing-State auch ohne sichtbare Profil-Push-UI aktualisiert.
- S4.4 Push-Enable/-Disable-Funktionen fuer diese Roadmap ueber die bestehende interne Profile-API weiterverwenden, aber als Touchlog-Control anbinden und ohne sichtbare Profil-Surface betreiben.
- S4.5 `app/styles/auth.css` fuer Desktop- und Mobile-Touchlog-Layout anpassen.
- S4.6 `app/styles/hub.css` fuer entfernte Profil-Push-Styles bereinigen oder neutral lassen, wenn risikoaermer.
- S4.7 `app/diagnostics/devtools.js` an Maintenance-Status anbinden.
- S4.8 Push-Health kompakt aus der bestaetigten Quelle darstellen.
- S4.9 Push-Control im Touchlog als Maintenance-Control abgrenzen.
- S4.10 aktive Diagnosemodi als Liste/Pills darstellen.
- S4.11 lokale Hilfsaktion `Touchlog leeren` umsetzen, falls in S2 bestaetigt.
- S4.12 keinen Dev-State-Reset umsetzen; falls spaeter gewuenscht, als eigene Roadmap mit separatem Vertrag planen.
- S4.13 User-Facing Copy anhand des S3-Copy-Vertrags finalisieren und nur bei bewusstem Produktentscheid davon abweichen.
- S4.14 Code Review waehrend der Umsetzung.
- S4.15 Schritt-Abnahme.

Jeder S4-Substep dokumentiert:

- Umsetzung
- betroffene Dateien
- lokaler Check
- Contract Review
- Findings/Korrekturen
- Restrisiko

Output:

- Touchlog v2 in MIDAS.
- Profil ohne sichtbare Push-/Reminder-Section.

Exit-Kriterium:

- Zielstruktur ist umgesetzt, ohne Scope-Ausweitung.
- Push-Bedienung und Push-Health sind sichtbar nur noch im Touchlog/Maintenance-Kontext erreichbar.

#### S4 Umsetzungsprotokoll

##### S4.1 Touchlog-Markup fuer Header, Maintenance, Toggles und Log
- Umsetzung:
  - `index.html` Touchlog-Markup strukturiert.
  - Bestehender Header mit `#diagTitle` und `#diagClose` bleibt erhalten.
  - `#devTogglePush` wurde aus der lokalen Dev-Toggle-Liste heraus in einen eigenen Bereich `Push-Wartung` verschoben.
  - `#devPushStatus` bleibt erhalten und sitzt nun im Push-Wartungsbereich.
  - Sound, Haptik, No Cache und Assistant wurden unter `Lokale Diagnosemodi` gruppiert.
  - `#diagLog` bleibt erhalten und sitzt nun in einer eigenen `Log-Stream`-Section.
- Betroffene Dateien:
  - `index.html`
  - `docs/MIDAS Touchlog Maintenance & Mobile Diagnostics Roadmap.md`
- Lokaler Check:
  - Markup-IDs fuer bestehende JS-Bindings bleiben erhalten:
    - `#diag`
    - `#diagTitle`
    - `#diagClose`
    - `#devTogglePush`
    - `#devPushStatus`
    - `#devToggleSound`
    - `#devToggleHaptic`
    - `#devToggleNoCache`
    - `#devToggleAssistant`
    - `#diagLog`
- Contract Review:
  - Erfuellt S2/S3: Push ist nicht mehr Teil der lokalen Diagnosemodi.
  - Erfuellt S3: `Push-Wartung` ist als bestaetigter Blocktitel umgesetzt.
  - Keine Profil-Push-Entfernung in S4.1; das bleibt korrekt fuer S4.2/S4.3.
  - Keine neue Push-Fachlogik, kein Service-Worker-, Android- oder Backend-Scope.
- Findings/Korrekturen:
  - Keine funktionalen Findings in S4.1.
  - CSS ist noch nicht final auf die neue Struktur optimiert; das ist planmaessig S4.5.
- Restrisiko:
  - Bis S4.5 kann das neue Markup visuell noch nicht optimal wirken, weil die CSS-Struktur erst spaeter angepasst wird.
  - S4.8 hat die kompakte Health-Detaildarstellung ergaenzt.

##### S4.2 Profil-Push-Markup und sichtbare Profil-Push-Controls entfernen
- Umsetzung:
  - Sichtbare Profil-Section `.profile-push-health` aus `index.html` entfernt.
  - Profil-Copy `Push & Erinnerungen` entfernt.
  - Profil-Buttons `Push aktivieren` und `Push deaktivieren` entfernt.
  - Profil-Diagnosecontainer `#profilePushStatus` und `#profilePushDetails` entfernt.
- Betroffene Dateien:
  - `index.html`
  - `docs/MIDAS Touchlog Maintenance & Mobile Diagnostics Roadmap.md`
- Lokaler Check:
  - `rg` in `index.html` findet keine Treffer mehr fuer:
    - `profile-push`
    - `profilePush`
    - `Push & Erinnerungen`
    - `Push aktivieren`
    - `Push deaktivieren`
    - `Push Diagnose`
  - Verbleibende Treffer in `app/modules/profile/index.js` und `app/styles/hub.css` sind erwartet und fuer S4.3/S4.6 reserviert.
- Contract Review:
  - Erfuellt S2/S3: Profil hat keine sichtbare Push-Surface mehr.
  - Touchlog bleibt die einzige sichtbare Push-Wartungs- und Bedienoberflaeche.
  - Keine Profile-JS-Aenderung in S4.2; die DOM-unabhaengige Haertung bleibt bewusst S4.3.
  - Keine Push-Fachlogik, kein Service-Worker-, Android- oder Backend-Scope beruehrt.
- Findings/Korrekturen:
  - Keine Korrektur in S4.2 erforderlich.
  - Bekannter Folgepunkt: `profile/index.js` referenziert die entfernten DOM-IDs noch optional/teilweise; S4.3 muss `refreshPushStatus()` DOM-unabhaengig machen.
- Restrisiko:
  - Zwischen S4.2 und S4.3 kann ein Laufzeitpfad stale Push-Routing-State erzeugen, weil die JS-Haertung noch nicht umgesetzt ist.
  - S4.3 sollte direkt als naechster Code-Substep folgen.

##### S4.3 Profile-JS ohne sichtbare Profil-Push-DOM-Elemente haerten
- Umsetzung:
  - `app/modules/profile/index.js` gehaertet.
  - Frueher Stop in `refreshPushStatus()` bei fehlendem `#profilePushStatus` entfernt.
  - Push-Routing-State wird dadurch auch ohne sichtbare Profil-Push-UI aktualisiert.
  - Bestehende UI-Render-Helper `setPushStatus()` und `renderPushDetails()` bleiben DOM-sicher: Wenn Profil-Push-Elemente fehlen, steigen sie still aus.
  - `enablePush`, `disablePush`, `isPushEnabled`, `getPushRoutingStatus` und `shouldSuppressLocalPushes` bleiben als interne API erhalten.
- Betroffene Dateien:
  - `app/modules/profile/index.js`
  - `docs/MIDAS Touchlog Maintenance & Mobile Diagnostics Roadmap.md`
- Lokaler Check:
  - `node --check app/modules/profile/index.js`
  - `rg` bestaetigt: `refreshPushStatus()` hat keinen fruehen Return mehr auf `refs.pushStatus`.
  - Der verbliebene `if (!refs?.pushStatus) return;` sitzt nur in `setPushStatus()` und ist als UI-No-op korrekt.
- Contract Review:
  - Erfuellt S1/S3-Finding: Entfernte Profil-Push-DOM-Elemente stoppen keine Routing-State-Aktualisierung mehr.
  - Touchlog und Incident-Routing koennen weiter die bestehende interne Profile-Push-API nutzen.
  - Keine sichtbare Profil-Push-Surface wieder eingefuehrt.
  - Keine neue Push-Fachlogik, kein Service-Worker-, Android- oder Backend-Scope.
- Findings/Korrekturen:
  - S4.3-Finding aus S1/S3 ist korrigiert.
  - Keine neuen Findings.
- Restrisiko:
  - S4.8 hat den Touchlog-Status um kompakte Health-Details aus dieser internen Quelle ergaenzt.
  - S4.6 muss noch entscheiden, ob alte Profil-Push-Styles entfernt oder risikolos liegen gelassen werden.

##### S4.4 Push-Enable/-Disable ueber bestehende interne Profile-API anbinden
- Umsetzung:
  - `app/diagnostics/devtools.js` auf den S2/S3-Vertrag geschaerft.
  - Modulkommentar korrigiert: Touchlog-Push-Control nutzt die interne Profile-Push-API, nicht sichtbare Profil-Buttons.
  - Neuer Helper `getProfilePushApi()` prueft explizit, ob die benoetigten internen Methoden vorhanden sind:
    - `enablePush`
    - `disablePush`
    - `isPushEnabled`
    - `refreshPushStatus`
    - `getPushRoutingStatus`
  - `updatePushToggle()` nutzt diese API jetzt geschlossen und ohne optionale Teilaufrufe.
  - Toggle-Change bricht sauber mit `Push: Profilmodul nicht bereit` ab, falls die interne API nicht vollstaendig bereit ist.
- Betroffene Dateien:
  - `app/diagnostics/devtools.js`
  - `docs/MIDAS Touchlog Maintenance & Mobile Diagnostics Roadmap.md`
- Lokaler Check:
  - `node --check app/diagnostics/devtools.js`
  - `rg` bestaetigt: der alte Kommentar `profile buttons` ist entfernt.
  - `rg` bestaetigt: Touchlog-Push-Control nutzt weiterhin `#devTogglePush` und `#devPushStatus`.
- Contract Review:
  - Erfuellt S2: Fuer diese Roadmap bleibt die bestehende interne Profile-Push-API Quelle.
  - Erfuellt S3: Touchlog-Control ist nicht von sichtbarer Profil-Push-UI abhaengig.
  - Keine Profil-Push-Surface wieder eingefuehrt.
  - Keine neue Push-Fachlogik, kein Service-Worker-, Android- oder Backend-Scope.
- Findings/Korrekturen:
  - Finding: Devtools-Kommentar beschrieb noch `profile buttons`; das war nach S4.2 falsch.
  - Korrektur: Kommentar und API-Gate auf interne Profile-Push-API geaendert.
- Restrisiko:
  - S4.8 hat die sichtbare Statuscopy um kompakte Health-Details ergaenzt.
  - S4.5 muss das Layout fuer den neuen Markup-Aufbau stabilisieren.

##### S4.5 `app/styles/auth.css` fuer Desktop- und Mobile-Touchlog-Layout anpassen
- Umsetzung:
  - CSS fuer die neue Touchlog-Struktur in `app/styles/auth.css` angepasst.
  - `.diag-section` als kompakter Block fuer Maintenance und lokale Modi eingefuehrt.
  - `.diag-maintenance` visuell leicht hervorgehoben, damit `Push-Wartung` nicht wie ein lokaler Dev-Toggle wirkt.
  - `.diag-log-section` als eigener Log-Bereich strukturiert.
  - Desktop: Controls-Spalte verbreitert und in getrennte Bloecke aufgeteilt.
  - Mobile: einspaltige Struktur beibehalten, Gap/Padding stabilisiert, Log separat begrenzt und scrollbar gehalten.
  - Lange Toggle-Labels duerfen umbrechen, ohne horizontale Ueberbreite zu erzeugen.
- Betroffene Dateien:
  - `app/styles/auth.css`
  - `docs/MIDAS Touchlog Maintenance & Mobile Diagnostics Roadmap.md`
- Lokaler Check:
  - `git diff --check -- app/styles/auth.css`
  - `rg` bestaetigt neue Selektoren:
    - `.diag-section`
    - `.diag-maintenance`
    - `.diag-log-section`
    - `.diag-toggle > span:first-child`
- Contract Review:
  - Erfuellt S2/S3: Push-Wartung steht als eigener Maintenance-Block vor lokalen Diagnosemodi.
  - Erfuellt S3: Log bleibt separat und scrollbar.
  - Erfuellt Mobile-Vertrag: keine neuen breiten Tabellen, Labels koennen umbrechen.
  - Keine Profil-Styles, keine Push-Fachlogik, kein Service-Worker-, Android- oder Backend-Scope beruehrt.
- Findings/Korrekturen:
  - Keine neuen Findings.
- Restrisiko:
  - Visuelle Endabnahme braucht weiterhin Desktop-/Android-Smoke in S5.
  - S4.8 hat den Statusinhalt um kompakte Health-Details ergaenzt.

##### S4.6 `app/styles/hub.css` fuer entfernte Profil-Push-Styles bereinigen
- Umsetzung:
  - Ungenutzte Profil-Push-Styles aus `app/styles/hub.css` entfernt.
  - Entfernte Selektoren:
    - `.profile-push-health`
    - `.profile-push-status`
    - `.profile-push-details`
    - `.profile-push-hint`
    - `.profile-push-actions`
    - Desktop-Media-Regel fuer `.profile-push-details dl`
- Betroffene Dateien:
  - `app/styles/hub.css`
  - `docs/MIDAS Touchlog Maintenance & Mobile Diagnostics Roadmap.md`
- Lokaler Check:
  - `git diff --check -- app/styles/hub.css`
  - `rg` bestaetigt: `app/styles/hub.css` und `index.html` enthalten keine Profil-Push-Styles, Profil-Push-Markup oder Profil-Push-Copy mehr.
  - Verbleibende Treffer in `app/modules/profile/index.js` sind erwartet: interne optionale API/No-op-Renderpfade fuer S4.3/S4.4.
- Contract Review:
  - Erfuellt S2/S3: Profil hat keine sichtbare Push-Surface und keine dazugehoerigen Styles mehr.
  - Keine Touchlog-Styles, keine JS-Logik, keine Push-Fachlogik, kein Service-Worker-, Android- oder Backend-Scope beruehrt.
- Findings/Korrekturen:
  - Keine neuen Findings.
- Restrisiko:
  - `profile/index.js` enthaelt noch optionale Push-UI-Selektoren und eine Hint-Klasse als interne No-op-Pfade. Das ist fuer diese Roadmap akzeptiert, solange keine sichtbare Profil-Surface existiert.
  - S6 muss dokumentieren, dass die technische Profile-Push-API intern/uebergangsweise bleibt.

##### S4.7 `app/diagnostics/devtools.js` an Maintenance-Status anbinden
- Umsetzung:
  - Sichtbare Push-Statuscopy im Touchlog an den S3-Copy-Vertrag angepasst.
  - Initialer Status in `index.html` von `Push: Status wird geprueft ...` auf `Push: unbekannt` geaendert.
  - `describePushRouting()` liefert jetzt kurze Maintenance-Status statt Zwischenloesungs-Copy:
    - `Push: nicht aktiv`
    - `Push: Browser-Abo fehlt`
    - `Push: aktiv - remote gesund`
    - `Push: aktiv - bereit, wartet`
    - `Push: Zustellung pruefen`
    - `Push: unbekannt - Health-Check offen`
    - `Push: unbekannt - Remote offen`
  - Sichtbare Diagnosefehler zeigen keine rohen Error-Messages mehr, sondern `Push: unbekannt - Diagnose fehlgeschlagen`.
  - Sichtbarer Zustellungswarnstatus zeigt keinen rohen `lastRemoteFailureReason` mehr.
- Betroffene Dateien:
  - `app/diagnostics/devtools.js`
  - `index.html`
  - `docs/MIDAS Touchlog Maintenance & Mobile Diagnostics Roadmap.md`
- Lokaler Check:
  - `node --check app/diagnostics/devtools.js`
  - `git diff --check -- app/diagnostics/devtools.js index.html`
  - `rg` bestaetigt: alte Zwischenloesungs-Copy wie `Abo aktiv`, `Remote gesund`, `kein Browser-Abo` und `Status wird geprueft` ist aus sichtbaren Touchlog-Statusstrings entfernt.
- Contract Review:
  - Erfuellt S3: `nicht aktiv` wird als neutraler Inaktiv-Status genutzt.
  - Erfuellt S3: `remote gesund` nur bei `routing.remoteHealthy`.
  - Erfuellt S3: `Zustellung pruefen` nur bei blockiertem Browser oder belastbarem Remote-Warnsignal.
  - Erfuellt PII-/Security-Grenze: keine Roh-Error-Messages oder Failure-Reasons in sichtbarer Statuscopy.
  - Keine Push-Fachlogik, kein Service-Worker-, Android- oder Backend-Scope beruehrt.
- Findings/Korrekturen:
  - Finding: sichtbare Statuscopy war noch uneinheitlich und zeigte potenziell rohe Failure-Reasons.
  - Korrektur: Statuscopy normalisiert und Failure-Reason aus sichtbarer Zeile entfernt.
- Restrisiko:
  - S4.8 hat die kompakte Health-Detaildarstellung ergaenzt; S4.7 blieb bewusst bei einer Statuszeile.
  - Endgueltige mobile Lesbarkeit wird in S5 per Smoke geprueft.

##### S4.8 Push-Health kompakt aus der bestaetigten Quelle darstellen
- Umsetzung:
  - Kompakte Push-Health-Detailflaeche im Touchlog-Markup ergaenzt.
  - Neues Element `#devPushDetails` im Block `Push-Wartung`.
  - Neutraler HTML-Fallback zeigt `unbekannt`/`--`, bis `devtools.js` gebunden ist.
  - `app/diagnostics/devtools.js` rendert Health-Details aus `profile.getPushRoutingStatus()`.
  - Gerenderte Detailfelder:
    - `Berechtigung`
    - `Browser-Abo`
    - `Remote`
    - `Letzter Erfolg`
    - `Letzter Fehler`
    - `Geprueft`
  - `app/styles/auth.css` fuer kompakte Key/Value-Darstellung im Maintenance-Block ergaenzt.
- Betroffene Dateien:
  - `index.html`
  - `app/diagnostics/devtools.js`
  - `app/styles/auth.css`
  - `docs/MIDAS Touchlog Maintenance & Mobile Diagnostics Roadmap.md`
- Lokaler Check:
  - `node --check app/diagnostics/devtools.js`
  - `git diff --check -- app/diagnostics/devtools.js index.html app/styles/auth.css`
  - `rg` bestaetigt neue Selektoren/Funktionen:
    - `#devPushDetails`
    - `.diag-health-details`
    - `setPushDiagDetails`
    - `buildPushDetailRows`
- Contract Review:
  - Erfuellt S2/S3: Health-Details sind im Touchlog/Maintenance-Kontext sichtbar, nicht im Profil.
  - Erfuellt S3-Copy-Vertrag: Detailtexte nutzen die erlaubten Labels.
  - Erfuellt PII-/Security-Grenze: keine Endpoints, Payloads, UIDs oder Roh-Error-Messages werden gerendert.
  - `lastRemoteFailureReason` bleibt aus der sichtbaren Detaildarstellung draussen.
  - Keine neue Push-Fachlogik, kein Service-Worker-, Android- oder Backend-Scope beruehrt.
- Findings/Korrekturen:
  - Finding: Ohne HTML-Fallback waere die Detailflaeche bis zum JS-Bind leer.
  - Korrektur: neutraler Fallback mit `unbekannt`/`--` im Markup ergaenzt.
- Restrisiko:
  - S5 muss mobile Lesbarkeit der sechs Detailzeilen pruefen.
  - S4.9 muss die Push-Control visuell/semantisch final als Maintenance-Control abgrenzen.

##### S4.9 Push-Control im Touchlog als Maintenance-Control abgrenzen
- Umsetzung:
  - Push-Control im Block `Push-Wartung` semantisch und visuell geschaerft.
  - Sichtbares Toggle-Label von `Push` auf `Push-Benachrichtigungen` geaendert.
  - `#devTogglePush` mit `aria-describedby="devPushStatus devPushDetails"` an Status und Health-Details angebunden.
  - `.diag-push-control` in `app/styles/auth.css` als eigener Control-Streifen innerhalb des Maintenance-Blocks gestaltet.
- Betroffene Dateien:
  - `index.html`
  - `app/styles/auth.css`
  - `docs/MIDAS Touchlog Maintenance & Mobile Diagnostics Roadmap.md`
- Lokaler Check:
  - `git diff --check -- index.html app/styles/auth.css`
  - `rg` bestaetigt:
    - `Push-Benachrichtigungen`
    - `.diag-push-control`
    - `aria-describedby="devPushStatus devPushDetails"`
    - stabile IDs `#devTogglePush`, `#devPushStatus`, `#devPushDetails`
- Contract Review:
  - Erfuellt S2/S3: Push-Control ist sichtbar Teil von `Push-Wartung`, nicht der lokalen Diagnosemodi.
  - Erfuellt Accessibility-Plan: Control verweist auf Status und Details.
  - Keine Profil-Surface, keine Push-Fachlogik, kein Service-Worker-, Android- oder Backend-Scope beruehrt.
- Findings/Korrekturen:
  - Finding: Das sichtbare Label `Push` war nach S4.8 noch zu nah an den lokalen Toggles.
  - Korrektur: Label und Control-Styling auf Maintenance-Kontext geschaerft.
- Restrisiko:
  - S5 muss pruefen, ob `Push-Benachrichtigungen` auf Android ohne unschoenen Umbruch lesbar bleibt.
  - S4.10 hat aktive Diagnosemodi getrennt als Liste/Pills ergaenzt.

##### S4.10 Aktive Diagnosemodi als Liste/Pills darstellen
- Umsetzung:
  - Aktive lokale Diagnosemodi im Touchlog als eigene Statusanzeige ergaenzt.
  - Neues Element `#devActiveModes` im Block `Lokale Diagnosemodi`.
  - Neutraler HTML-Fallback zeigt `Keine aktiv`.
  - `app/diagnostics/devtools.js` rendert aktive Modi als Pills:
    - `Sound`
    - `Haptik`
    - `No Cache`
    - `Assistant`
  - Anzeige aktualisiert bei Initialisierung und bei Toggle-Aenderungen.
  - Keine Log-Eintraege fuer Statusspiegelung erzeugt.
- Betroffene Dateien:
  - `index.html`
  - `app/diagnostics/devtools.js`
  - `app/styles/auth.css`
  - `docs/MIDAS Touchlog Maintenance & Mobile Diagnostics Roadmap.md`
- Lokaler Check:
  - `node --check app/diagnostics/devtools.js`
  - `git diff --check -- app/diagnostics/devtools.js index.html app/styles/auth.css`
  - `rg` bestaetigt:
    - `#devActiveModes`
    - `.diag-active-modes`
    - `.diag-mode-pill`
    - `renderActiveModes`
    - `updateActiveModes`
  - `rg` bestaetigt: keine neue `diag.add`-Statusspiegelung fuer aktive Modi.
- Contract Review:
  - Erfuellt S2/S3: Aktive lokale Modi sind als Status sichtbar, nicht als Log-Spam.
  - Push ist nicht Teil dieser Modiliste und bleibt im eigenen Block `Push-Wartung`.
  - Toggles bleiben bedienbar; die Pill-Liste ist nur Statusanzeige.
  - Keine Profil-Surface, keine Push-Fachlogik, kein Service-Worker-, Android- oder Backend-Scope beruehrt.
- Findings/Korrekturen:
  - Keine neuen Findings.
- Restrisiko:
  - S5 muss mobile Lesbarkeit der Pills pruefen, besonders wenn alle vier Modi aktiv sind.
  - S4.11 hat `Touchlog leeren` als lokale Hilfsaktion ergaenzt.

##### S4.11 Lokale Hilfsaktion `Touchlog leeren` umsetzen
- Umsetzung:
  - Lokale Hilfsaktion `Touchlog leeren` im Touchlog ergaenzt.
  - Neues Element `#devClearLogBtn` im Block `Hilfsaktionen`.
  - `app/core/diag.js` um `diag.clear()` erweitert.
  - `diag.clear()` leert nur den sichtbaren lokalen Touchlog-State:
    - `lines`
    - `eventIndex`
    - `summaryIndex`
    - `#diagLog` via `_refreshDom()`
  - Diagnostics-disabled Stub besitzt ebenfalls `clear()`.
  - `app/diagnostics/devtools.js` bindet den Button an `diag.clear()`.
- Betroffene Dateien:
  - `index.html`
  - `app/core/diag.js`
  - `app/diagnostics/devtools.js`
  - `app/styles/auth.css`
  - `docs/MIDAS Touchlog Maintenance & Mobile Diagnostics Roadmap.md`
- Lokaler Check:
  - `node --check app/core/diag.js`
  - `node --check app/diagnostics/devtools.js`
  - `git diff --check -- app/core/diag.js app/diagnostics/devtools.js index.html app/styles/auth.css`
  - `rg` bestaetigt:
    - `#devClearLogBtn`
    - `Touchlog leeren`
    - `diag-action-btn`
    - `diag.clear()`
- Contract Review:
  - Erfuellt S2/S3: Hilfsaktion ist lokal, begrenzt und veraendert keine Produktdaten.
  - Kein LocalStorage, keine Push-Subscription, keine Remote-Daten, keine medizinischen Daten werden geloescht.
  - Kein Log-Spam durch die Aktion; der Log wird leer.
  - Keine Profil-Surface, keine Push-Fachlogik, kein Service-Worker-, Android- oder Backend-Scope beruehrt.
- Findings/Korrekturen:
  - Finding: `diag.js` hatte keine oeffentliche Clear-Methode; direkter Zugriff aus Devtools waere zu eng an Interna gekoppelt.
  - Korrektur: `diag.clear()` als kleine API ergaenzt und Devtools daran angebunden.
- Restrisiko:
  - S5 muss pruefen, ob der Button auf Mobile erreichbar bleibt und nur `#diagLog` leert.
  - S4.12 bleibt bewusst `kein Dev-State-Reset`.

##### S4.12 Keinen Dev-State-Reset umsetzen
- Umsetzung:
  - Kein Dev-State-Reset umgesetzt.
  - Kein Button fuer `Dev State zuruecksetzen` ergaenzt.
  - Keine Logik fuer `localStorage.clear()`, `removeItem()`, Toggle-Reset, Push-Reset oder Profil-/Produktdaten-Reset ergaenzt.
  - Bestehende Hilfsaktion bleibt ausschliesslich `Touchlog leeren` aus S4.11.
- Betroffene Dateien:
  - `docs/MIDAS Touchlog Maintenance & Mobile Diagnostics Roadmap.md`
- Lokaler Check:
  - `rg` gegen betroffene Dateien geprueft auf:
    - `Dev State`
    - `Dev-State`
    - `zuruecksetzen`
    - `reset`
    - `localStorage.clear`
    - `removeItem`
    - `devClearLogBtn`
    - `Touchlog leeren`
  - Ergebnis: Nur `Touchlog leeren` und bestehende fachfremde Alt-Texte/Reset-Begriffe ausserhalb des Touchlog-Scope; kein neuer Dev-State-Reset-Pfad.
- Contract Review:
  - Erfuellt S2: Dev-State-Reset ist fuer diese Roadmap bewusst aus dem Scope.
  - Erfuellt S3: Keine breitere lokale Persistenz-/Toggle-Manipulation ohne eigenen Vertrag.
  - Keine Profil-Surface, keine Push-Fachlogik, kein Service-Worker-, Android- oder Backend-Scope beruehrt.
- Findings/Korrekturen:
  - Keine Korrektur erforderlich.
- Restrisiko:
  - Falls spaeter ein Dev-State-Reset gewuenscht ist, braucht er eine eigene Roadmap mit genauer Definition, welche lokalen Flags betroffen sind und welche nicht.

##### S4.13 User-Facing Copy finalisieren
- Umsetzung:
  - Sichtbare Touchlog-Copy gegen den S3-Copy-Vertrag geprueft.
  - `Profilmodul nicht bereit` aus sichtbarer Statuscopy entfernt, weil Profil keine sichtbare Push-Surface mehr ist.
  - Ersatz: `Push: unbekannt - Modul nicht bereit`.
  - ARIA-Label `Push Health Details` auf `Push-Wartungsdetails` umgestellt.
  - Bestaetigte Copy bleibt:
    - `Push-Wartung`
    - `Push-Benachrichtigungen`
    - `Push: nicht aktiv`
    - `Push: Browser-Abo fehlt`
    - `Push: aktiv - remote gesund`
    - `Push: aktiv - bereit, wartet`
    - `Push: Zustellung pruefen`
    - `Push: unbekannt - Health-Check offen`
    - `Push: unbekannt - Remote offen`
    - `Berechtigung`
    - `Browser-Abo`
    - `Remote`
    - `Letzter Erfolg`
    - `Letzter Fehler`
    - `Geprueft`
    - `Lokale Diagnosemodi`
    - `Hilfsaktionen`
    - `Touchlog leeren`
    - `Log-Stream`
- Betroffene Dateien:
  - `index.html`
  - `app/diagnostics/devtools.js`
  - `docs/MIDAS Touchlog Maintenance & Mobile Diagnostics Roadmap.md`
- Lokaler Check:
  - `node --check app/diagnostics/devtools.js`
  - `git diff --check -- app/diagnostics/devtools.js index.html`
  - `rg` gegen verbotene/unerwuenschte sichtbare Copy:
    - `Profilmodul`
    - `Push Health Details`
    - `alles sicher`
    - `garantiert`
    - `subscription endpoint`
    - `payload`
    - `uid`
    - `endpoint`
    - `lastRemoteFailureReason`
    - `Status wird geprueft`
    - `kein Browser-Abo`
    - `Abo aktiv`
    - `Remote gesund`
    - `deaktiviert`
- Contract Review:
  - Erfuellt S3-Copy-Vertrag.
  - Keine Profil-Copy mehr in sichtbarer Push-Wartung.
  - Keine falsche Sicherheit durch `alles sicher` oder `garantiert`.
  - Keine sensiblen Rohbegriffe in sichtbarer Touchlog-Copy.
  - `Letzter Fehler` bleibt als erlaubtes Detail-Label bestehen; `Diagnose fehlgeschlagen` wird nur fuer echten Diagnosefehler genutzt.
- Findings/Korrekturen:
  - Finding: `Profilmodul nicht bereit` war fachlich/produktsprachlich nach Profil-Entkopplung falsch.
  - Korrektur: neutrale Modul-Copy verwendet.
  - Finding: `Push Health Details` war englisch und nicht final.
  - Korrektur: `Push-Wartungsdetails`.
- Restrisiko:
  - S5 muss pruefen, ob die finalen Labels auf Android nicht abgeschnitten wirken.

##### S4.14 Code Review waehrend der Umsetzung
- Reviewumfang:
  - `index.html`
  - `app/core/diag.js`
  - `app/diagnostics/devtools.js`
  - `app/modules/profile/index.js`
  - `app/styles/auth.css`
  - `app/styles/hub.css`
  - `docs/MIDAS Touchlog Maintenance & Mobile Diagnostics Roadmap.md`
- Lokale Checks:
  - `node --check app/core/diag.js`
  - `node --check app/diagnostics/devtools.js`
  - `node --check app/modules/profile/index.js`
  - `git diff --check` fuer alle S4-Dateien
  - `rg` gegen entfernte Profil-Push-Markup-/Style-Copy:
    - `profile-push`
    - `profilePush`
    - `Push & Erinnerungen`
    - `Push aktivieren`
    - `Push deaktivieren`
  - `rg` gegen verbotene sichtbare Rohdaten-/Copy-Begriffe:
    - `Profilmodul`
    - `Push Health Details`
    - `alles sicher`
    - `garantiert`
    - `subscription endpoint`
    - `payload`
    - `uid`
    - `endpoint`
    - `lastRemoteFailureReason`
  - `rg` gegen unerwuenschte Dev-State-Reset-Pfade:
    - `localStorage.clear`
    - `removeItem`
    - neue Reset-/Push-Reset-Pfade im Touchlog-Scope
- Ergebnis:
  - Keine korrekturbeduerftigen Findings.
  - Profil-Markup und `hub.css` sind frei von sichtbarer Profil-Push-Surface.
  - Verbleibende `profilePush*`-Treffer liegen nur in `app/modules/profile/index.js` als interne optionale API/No-op-Pfade.
  - `refreshPushStatus()` aktualisiert den Routing-State ohne sichtbare Profil-Push-DOM-Elemente.
  - `Touchlog leeren` leert nur den lokalen sichtbaren Log-State.
  - Keine Endpoints, Payloads, UIDs oder rohen Error-/Failure-Reasons werden im Touchlog gerendert.
- Contract Review:
  - S2/S3/S4-Vertrag eingehalten.
  - Kein Service-Worker-, Android-, Backend- oder Push-Fachlogik-Scope erweitert.
  - Kein Produktdaten-Write aus dem Touchlog eingefuehrt.
  - `diag.add` bleibt Event-Trace; Maintenance-Status wird separat gerendert.
- Restrisiko:
  - Visuelle und interaktive Smokes sind S5-Scope.
  - Echte Android-Abnahme bleibt bis S5 offen.

##### S4.15 Schritt-Abnahme
- Abnahme:
  - S4.1 bis S4.13 umgesetzt.
  - S4.14 Code Review abgeschlossen.
  - Touchlog v2 ist strukturell umgesetzt:
    - Push-Wartung
    - Push-Health-Details
    - lokale Diagnosemodi als Pills
    - lokale Toggles
    - Hilfsaktion `Touchlog leeren`
    - separater Log-Stream
  - Profil ist sichtbar push-frei:
    - keine `Push & Erinnerungen`-Section
    - keine Profil-Push-Buttons
    - keine Profil-Push-Health-Details
    - keine Profil-Push-Styles
  - Bestehende interne Profile-Push-API bleibt als technische Quelle erhalten und ist DOM-unabhaengig gehaertet.
  - S4-Exit-Kriterium erfuellt: Push-Bedienung und Push-Health sind sichtbar nur noch im Touchlog/Maintenance-Kontext erreichbar.
- Status:
  - S4 in Statusmatrix auf `DONE` gesetzt.
- Commit-Empfehlung:
  - Sinnvoller Code-/Doku-Commit nach S4: `feat(touchlog): move push maintenance into touchlog`.
- Restrisiko:
  - S5 muss Syntax-/Diff-Checks wiederholen, Desktop-Smoke, Profil-ohne-Push-Smoke, Mobile-Smoke, Push-Control-Smoke, Push-Health-Smoke und finalen Contract Review ausfuehren.

## S5 - Tests, Code Review und Contract Review

Ziel:

- Alles lokal Moegliche pruefen.
- Externe/Device-Smokes klar definieren, falls sie nicht lokal ausfuehrbar sind.
- Code und Roadmap gegen Guardrails reviewen.

Substeps:

- S5.1 `node --check` fuer betroffene JS-Dateien.
- S5.2 `git diff --check` fuer betroffene Dateien.
- S5.3 Desktop-Smoke definieren oder ausfuehren:
  - Panel oeffnen/schliessen
  - Log sichtbar
  - Maintenance sichtbar
  - Dev-Toggles nutzbar
- S5.4 Profil-ohne-Push-Smoke definieren oder ausfuehren:
  - Profil oeffnet ohne Fehler
  - keine `Push & Erinnerungen`-Section sichtbar
  - keine Push-Buttons im Profil sichtbar
  - Profil-Stammdaten, Arztkontakt, Limits und Medication-Snapshot bleiben sichtbar
  - kein toter Leerraum oder Mobile-Layoutbruch durch entfernte Section
- S5.5 Mobile-Smoke definieren oder ausfuehren:
  - Panel nicht abgeschnitten
  - Safe Area eingehalten
  - Header/Close erreichbar
  - Maintenance und Log separat lesbar
  - keine horizontale Ueberbreite
- S5.6 Touchlog-Push-Control-Smoke definieren oder ausfuehren:
  - Push aktivieren ist im Touchlog erreichbar
  - Push deaktivieren ist im Touchlog erreichbar
  - Toggle/Control-Zustand spiegelt echte Push-Bereitschaft ohne falsche Sicherheit
  - Profil bleibt dabei unveraendert push-frei
- S5.7 Push-Health-Smoke definieren oder ausfuehren:
  - kein Browser-Abo
  - bereit, wartet auf erste faellige Erinnerung
  - remote gesund
  - Zustellung pruefen, soweit lokal simulierbar
- S5.8 Boot-Error-/Fallback-Smoke definieren oder ausfuehren.
- S5.9 User-Facing Copy Review nach Smoke:
  - S3-Copy-Vertrag eingehalten
  - keine Profil-Push-Copy sichtbar
  - keine Rohdaten-/PII-Copy sichtbar
  - Mobile-Labels verstaendlich und nicht abgeschnitten
- S5.10 Code Review gegen Bruchrisiken.
- S5.11 Contract Review gegen MIDAS-Guardrails.
- S5.12 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Getesteter Touchlog-v2-Stand mit klaren Restrisiken.

Exit-Kriterium:

- Alle lokal moeglichen Checks sind erledigt oder bewusst als nicht lokal ausfuehrbar markiert.

#### S5 Ergebnisprotokoll

##### S5.1 JS-Syntax-Check
- Umsetzung:
  - `node --check app/core/diag.js`
  - `node --check app/diagnostics/devtools.js`
  - `node --check app/modules/profile/index.js`
- Ergebnis:
  - Alle betroffenen JS-Dateien bestehen den Syntax-Check.
- Findings:
  - Keine.

##### S5.2 Diff-Whitespace-Check
- Umsetzung:
  - `git diff --check -- app/core/diag.js app/diagnostics/devtools.js app/modules/profile/index.js app/styles/auth.css app/styles/hub.css index.html "docs/MIDAS Touchlog Maintenance & Mobile Diagnostics Roadmap.md"`
- Ergebnis:
  - Keine Whitespace-Fehler.
  - Git meldet nur LF/CRLF-Normalisierungshinweise fuer die geaenderten Dateien.
- Findings:
  - Keine.

##### S5.3 Desktop-Smoke
- Lokal automatisiert:
  - Temporärer HTTP-Server auf `127.0.0.1:8876`.
  - `index.html` und `app/diagnostics/devtools.js` liefern HTTP 200.
  - Pflichtanker im ausgelieferten HTML vorhanden:
    - `devTogglePush`
    - `devPushStatus`
    - `devPushDetails`
    - `devActiveModes`
    - `devClearLogBtn`
    - `diagLog`
- Manuell offen:
  - Touchlog am Desktop oeffnen/schliessen.
  - Maintenance, Log-Stream und lokale Diagnosemodi visuell pruefen.
  - Pruefen, dass die Panel-Aufteilung nicht gedrungen oder abgeschnitten wirkt.
- Findings:
  - Keine automatischen Findings.

##### S5.4 Profil-ohne-Push-Smoke
- Lokal automatisiert:
  - Statische Suche in `index.html`, `app/styles/hub.css` und `app/styles/auth.css` findet keine sichtbare Profile-Push-Surface:
    - keine `Push & Erinnerungen`-Section
    - keine Profil-Push-Buttons
    - keine Profile-Push-CSS-Surface
- Bewusst verbleibend:
  - `app/modules/profile/index.js` enthaelt weiterhin interne Push-API-/Routing-Stellen. Das ist nach S2/S4 erlaubt, solange sie keine sichtbare Profil-Surface voraussetzen.
- Manuell offen:
  - Profil im Browser oeffnen und Stammdaten, Arztkontakt, Limits und Medication-Snapshot visuell pruefen.
  - Pruefen, dass durch die entfernte Section kein toter Leerraum oder Mobile-Layoutbruch entsteht.
- Findings:
  - Keine.

##### S5.5 Mobile-Smoke
- Lokal automatisiert:
  - Mobile-spezifische CSS- und DOM-Contracts wurden statisch gegen die neuen Touchlog-Anker geprueft.
- Manuell offen:
  - Android-Smoke am echten Geraet:
    - Touchlog nicht abgeschnitten.
    - Header und `x` erreichbar.
    - Push-Wartung, lokale Diagnosemodi, Hilfsaktionen und Log-Stream separat lesbar.
    - keine horizontale Ueberbreite.
    - Button-/Toggle-Texte nicht abgeschnitten.
- Findings:
  - Keine statischen Findings.

##### S5.6 Touchlog-Push-Control-Smoke
- Lokal automatisiert:
  - `devTogglePush` ist im Touchlog vorhanden und mit `devPushStatus`/`devPushDetails` per `aria-describedby` verbunden.
  - Keine sichtbare Profil-Push-Steuerung in `index.html`.
- Manuell offen:
  - Push ueber Touchlog aktivieren.
  - Push ueber Touchlog deaktivieren.
  - Pruefen, dass der sichtbare Status echte Bereitschaft nicht als falsche Sicherheit darstellt.
  - Profil parallel push-frei kontrollieren.
- Findings:
  - Keine.

##### S5.7 Push-Health-Smoke
- Lokal automatisiert:
  - Sichtbare Push-Health-Ausgabe bleibt auf Wartungsdetails begrenzt.
  - Keine Suche nach Rohdaten-/PII-Copy in Touchlog-Dateien gefunden:
    - keine Endpoints
    - keine UID/User-ID-Ausgabe
    - keine Payload-Ausgabe
    - kein `lastRemoteFailureReason` als sichtbarer Rohtext im Touchlog
- Manuell offen:
  - Zustandspruefung mit echtem Browser-Push:
    - kein Browser-Abo
    - aktiv, wartet auf erste faellige Erinnerung
    - remote gesund
    - Zustellung pruefen, falls real ausloesbar
- Findings:
  - Keine.

##### S5.8 Boot-Error-/Fallback-Smoke
- Lokal automatisiert:
  - Keine Code-Aenderung an `boot-flow.js`.
  - Touchlog-IDs bleiben stabil, dadurch bleibt der bestehende Diagnostics-Fallback-Vertrag unveraendert.
- Manuell offen:
  - Optionaler Boot-Fallback-Smoke nur mit bewusst provoziertem lokalen Fehler, falls du das lokal testen willst.
- Findings:
  - Keine.

##### S5.9 User-Facing-Copy-Review
- Umsetzung:
  - Sichtbare Copy statisch gegen S3-Vertrag geprueft.
- Ergebnis:
  - Profil-Push-Copy ist aus `index.html` entfernt.
  - Touchlog nutzt `Push-Wartung` und `Push-Benachrichtigungen`.
  - Statuscopy bleibt knapp und nicht absolut:
    - `Push: nicht aktiv`
    - `Push: Browser-Abo fehlt`
    - `Push: aktiv - remote gesund`
    - `Push: aktiv - bereit, wartet`
    - `Push: Zustellung pruefen`
    - `Push: unbekannt ...`
  - Keine Garantie-/Entwarnungsformulierungen gefunden.
- Manuell offen:
  - Mobile-Textfit am Android-Geraet final ansehen.
- Findings:
  - Keine.

##### S5.10 Code Review gegen Bruchrisiken
- Review:
  - Profil-Push-UI wurde aus Markup/CSS entfernt, interne API blieb erhalten.
  - `refreshPushStatus()` ist DOM-unabhaengig genug, um ohne sichtbare Profil-Push-Elemente weiterzulaufen.
  - Touchlog nutzt bestehende IDs plus neue IDs; bestehende Kern-IDs wurden nicht umbenannt.
  - `diag.clear()` loescht nur lokale Log-Anzeige und lokale Log-Indizes.
  - Kein Dev-State-Reset, kein Produktdaten-Reset, kein Push-Reset implementiert.
- Findings:
  - Keine offenen P0/P1/P2-Findings.

##### S5.11 Contract Review gegen MIDAS-Guardrails
- Ergebnis:
  - Touchlog ist die einzige sichtbare Push-Wartungs- und Bedienoberflaeche.
  - Profil ist sichtbar push-frei.
  - Keine Push-Fachlogik-, Service-Worker-, Backend- oder Android-Native-Migration in dieser Roadmap.
  - Keine Produktdatenaktion aus dem Touchlog heraus.
  - Keine sensiblen Push-Rohdaten sichtbar.
  - HESTIA-Pattern wurde nur als Informationsarchitektur uebernommen, nicht als Featurekopie.
- Findings:
  - Keine.

##### S5.12 Schritt-Abnahme und Commit-Empfehlung
- Abnahme:
  - Alle lokal automatisierbaren Checks sind erledigt.
  - Nicht automatisierbare visuelle Smokes sind konkret fuer Desktop/Android/echten Push-Browser definiert.
  - Keine Code-Findings offen.
- Lokal fuer dich offen:
  - Desktop-Smoke im echten Browser.
  - Android-Smoke am echten Geraet.
  - Echter Push-Aktivieren-/Deaktivieren- und Health-Smoke.
- Commit-Empfehlung:
  - Nach S6 sinnvoll als gemeinsamer Abschlusscommit, z. B. `feat(touchlog): move push maintenance into touchlog`.

## S6 - Doku-Sync, QA-Update und Abschlussreview

Ziel:

- Source-of-Truth-Dokus synchronisieren.
- QA aktualisieren.
- Roadmap final abschliessen.

Substeps:

- S6.1 `docs/modules/Diagnostics Module Overview.md` aktualisieren.
- S6.2 `docs/modules/Profile Module Overview.md` aktualisieren:
  - Profil hat keine Push-Surface mehr.
  - Falls technische Push-Funktionen im Profil-Modul bleiben, als interne/uebergangsweise Quelle dokumentieren.
- S6.3 `docs/modules/Push Module Overview.md` aktualisieren:
  - Touchlog/Maintenance ist einzige sichtbare Push-Wartungs-Surface.
  - Profil enthaelt keine Push-Bedienung.
- S6.4 `docs/QA_CHECKS.md` um Touchlog-v2-Smokes erweitern.
- S6.5 Diese Roadmap mit Ergebnisprotokollen aktualisieren.
- S6.6 Finaler Contract Review:
  - Roadmap vs. Code
  - Roadmap vs. Module Overviews
  - Roadmap vs. README-Guardrails
  - Roadmap vs. QA
- S6.7 Abschluss-Abnahme:
  - keine offenen P0/P1-Risiken
  - bekannte Restrisiken dokumentiert
  - nicht betroffene Schichten bleiben unberuehrt
- S6.8 Commit-Empfehlung.
- S6.9 Archiv-Entscheidung.

Output:

- Dokumentierter und abgeschlossener Touchlog-v2-Umbau.

Exit-Kriterium:

- Code, Doku, QA und Roadmap sprechen denselben finalen Diagnostics-Vertrag.

## Ergebnisprotokolle

Jeder Hauptschritt bekommt nach Bearbeitung ein Ergebnisprotokoll.

Format:

```md
#### Sx Ergebnisprotokoll

##### Sx.y [Name]
- Umsetzung/Review:
  - [...]
- Contract Review:
  - [...]
- Checks:
  - [...]
- Findings:
  - [...]
- Korrekturen:
  - [...]
- Restrisiko:
  - [...]
```

## Smokechecks / Regression

- Touchlog oeffnet und schliesst weiter deterministisch.
- Boot-Error kann Touchlog weiterhin oeffnen.
- Fallback-Log bleibt verfuegbar, falls `diag` nicht oeffnet.
- Log-Eintraege bleiben dedupliziert.
- Aktive Modi erzeugen keinen Log-Spam.
- Push-Health wird kompakt sichtbar.
- Profil enthaelt keine sichtbare Push-/Reminder-Section mehr.
- Push-Bedienung bleibt ueber Touchlog erreichbar.
- Touchlog-Push-Control und Maintenance-Status widersprechen sich nicht.
- Keine sensiblen Werte werden angezeigt.
- Mobile Panel bleibt innerhalb des Viewports.
- Close bleibt auf Mobile erreichbar.
- Dev-Toggles bleiben lokal und reversibel.
- Hilfsaktionen veraendern keine Produktdaten.

## Abnahmekriterien

- MIDAS Touchlog ist auf Handy praktisch nutzbar.
- Maintenance-Section beantwortet echte Betriebsfragen.
- Push-Health ist im Touchlog-Kontext sichtbar, ohne Push-Overflow.
- Profil ist frei von Push-Bedienung und Push-Health-Diagnose.
- Touchlog ist die Maintenance-Zentrale fuer Push.
- Hestia-Learnings sind erkennbar umgesetzt, aber MIDAS-spezifisch geschnitten.
- Diagnostics-Doku und QA sprechen denselben Vertrag.
- Kein Service-Worker-, Android-, Push-Fachlogik- oder Produktdaten-Scope wurde versehentlich beruehrt.

## Risiken

- Zu viele Maintenance-Bloecke koennen den Touchlog wieder ueberladen.
- Push-Health kann falsche Sicherheit vermitteln, wenn Labels unpraezise sind.
- Mobile Layout kann formal korrekt, aber real auf Samsung/Android weiter eng wirken.
- PII-/Token-Leaks waeren besonders kritisch, wenn Auth-/Runtime-Status aufgenommen wird.
- Boot-Error-Fallback koennte regressieren, wenn Markup oder Bindings falsch verschoben werden.
- Doku-Drift zwischen Profile Overview, Push Overview, Touchlog-Maintenance und Diagnostics Overview.
- Entfernen der Profil-Push-UI koennte operative Push-APIs beruehren, wenn S1 die Verdrahtung nicht sauber trennt.
