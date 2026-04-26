# MIDAS Touchlog Maintenance & Mobile Diagnostics Roadmap

## Ziel (klar und pruefbar)

Der MIDAS Touchlog soll von einem engen technischen Log-Panel zu einer mobilen, ruhigen und wartbaren Diagnoseflaeche weiterentwickelt werden.

Pruefbare Zieldefinition:

- Der Touchlog ist auf Handy lesbar, bedienbar und nicht abgeschnitten.
- Diagnosezustand und Log-Stream sind visuell getrennt.
- Eine Maintenance-Section zeigt die wichtigsten Betriebszustaende, ohne das Panel zu ueberladen.
- Push-Health aus der Profilkarte wird im Touchlog sinnvoll verfuegbar, aber nicht als grosse Push-Spezialseite.
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
- Push-Health ist nach der Push-Cadence-Roadmap im Profil sichtbar, gehoert fuer schnelle Fehlersuche aber auch in den Touchlog-Kontext.
- Hestia zeigt, dass eine ruhige Status-/Maintenance-Zone plus separater Log-Stream besser funktioniert.

## Scope

- Neues Touchlog-/Diagnostics-Layout fuer MIDAS.
- Mobile-first Struktur fuer `#diag`.
- Maintenance-Section fuer kompakte Systemzustaende.
- Push-Health kompakt aus `profile.getPushRoutingStatus()` in den Touchlog uebertragen:
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
- Entfernen der Profil-Push-Zusammenfassung ohne separaten Entscheid.
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
- Dev-Toggles bleiben lokal und reversibel.
- Keine Maintenance-Anzeige darf fachliche App-Wahrheit veraendern.
- Keine stillen Sondermodi, die nur im Code existieren.
- Logs bleiben dedupliziert und ruhig.
- Keine PII-, Token-, UID- oder Endpoint-Leaks.
- Profil bleibt ruhiger Kurzstatus; Touchlog/Maintenance darf technische Details zeigen.

## Architektur-Constraints

- `diag.add` bleibt Event-Trace und darf nicht zum allgemeinen State Store werden.
- `diagnosticsLayer.logger/perf/monitor` bleiben Diagnose-Infrastruktur, nicht Produktdatenquelle.
- Boot-Error-Fallback muss den Touchlog oder Fallback-Log weiterhin deterministisch oeffnen koennen.
- `profile.getPushRoutingStatus()` ist die Quelle fuer Push-Health im Frontend.
- Lokale Push-Suppression bleibt ausschliesslich Sache des Profil-/Incident-Vertrags, nicht des Touchlogs.
- Mobile Layout muss innerhalb Safe Area und Viewport bleiben.
- Keine neue Persistenz im Diagnostics-Layer.
- Android nativer Diagnosepfad bleibt getrennt und wird hier nicht umgebaut.

## Tool Permissions

Allowed:

- `index.html` fuer Touchlog-Markup anpassen.
- `app/styles/auth.css` fuer Diagnostics-/Touchlog-Layout anpassen.
- `app/diagnostics/devtools.js` fuer Maintenance-Status und lokale Dev-Hilfen anpassen.
- Falls noetig eng begrenzte Lesefunktionen aus bestehenden Modulen nutzen.
- `docs/modules/Diagnostics Module Overview.md` aktualisieren.
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
- Profil-Pushkarte entfernen, solange kein separater Entscheid dokumentiert ist.

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
  - aktive Diagnosemodi
  - Dev-Toggles
  - kleine Hilfsaktionen
- Rechte Spalte:
  - Touchlog-Stream

Mobile:

- Full-width Panel innerhalb Safe Area
- Header sticky
- Maintenance zuerst
- Dev-Toggles kompakt
- Log darunter, begrenzt und scrollable
- Close jederzeit erreichbar

## Maintenance-Section: erste Kandidaten

- Push:
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
  - ruhiger Kurzstatus
  - keine technischen Wandtexte
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
| S1 | System- und Vertragsdetektivarbeit | TODO | README, Diagnostics/Push/Profile Overviews, Hestia-Referenzen und MIDAS-Codepfade lesen. |
| S2 | Touchlog-Contract und Maintenance-Informationsarchitektur | TODO | Final klaeren, welche Statusbloecke, Modi und Hilfsaktionen ins Panel kommen. |
| S3 | Bruchrisiko-, Mobile- und User-Facing-Copy-Review | TODO | Mobile Risiken, PII/Security, Copy-Vertrag und konkrete S4-Pflichtpunkte festlegen. |
| S4 | Umsetzung Touchlog v2 | TODO | Markup, CSS und Devtools-/Maintenance-Integration sequenziell umsetzen. |
| S5 | Tests, Code Review und Contract Review | TODO | Lokale Checks, responsive Smoke, mobile Device-Smoke-Definition und Guardrail-Review. |
| S6 | Doku-Sync, QA-Update und Abschlussreview | TODO | Diagnostics Overview, QA und Roadmap final synchronisieren. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## S1 - System- und Vertragsdetektivarbeit

Ziel:

- MIDAS-Diagnostics und Hestia-Learnings verstehen.
- Codepfade und Source-of-Truth-Dokus identifizieren.
- Noch keinen Code aendern.

Substeps:

- S1.1 README und allgemeine MIDAS-Guardrails lesen.
- S1.2 `docs/modules/Diagnostics Module Overview.md` lesen.
- S1.3 `docs/modules/Profile Module Overview.md` und `docs/modules/Push Module Overview.md` fuer Push-Health-Vertrag lesen.
- S1.4 abgeschlossene Push-Cadence-Roadmap im Archiv lesen.
- S1.5 Hestia Touchlog-Code, CSS und Module Overview gezielt lesen.
- S1.6 MIDAS `diag.js`, `devtools.js`, `auth.css`, `index.html` und Bootflow gegenueberstellen.
- S1.7 Uebernahmefaehige Patterns und No-Gos dokumentieren.
- S1.8 Contract Review S1.
- S1.9 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Systemkarte des bestehenden Diagnostics-Pfads.
- Hestia-Lessons mit MIDAS-Abgrenzung.
- Liste betroffener Code- und Doku-Dateien.

Exit-Kriterium:

- Klarheit, was Touchlog v2 leisten soll und welche Schichten nicht betroffen sind.

## S2 - Touchlog-Contract und Maintenance-Informationsarchitektur

Ziel:

- Festlegen, was Maintenance im MIDAS-Touchlog bedeutet.
- Keine beliebige Debug-Konsole bauen.

Substeps:

- S2.1 Maintenance-Begriff fuer MIDAS definieren.
- S2.2 Push-Health-Details klassifizieren:
  - muss in Maintenance
  - optional
  - bleibt nur Profil
- S2.3 aktive Diagnosemodi definieren.
- S2.4 Hilfsaktionen festlegen:
  - Touchlog leeren
  - Dev State zuruecksetzen, falls sinnvoll
  - keine produktiven Datenaktionen
- S2.5 Informationsdichte gegen Mobile-Realitaet pruefen.
- S2.6 PII-/Security-Constraints reviewen.
- S2.7 finalen Informationsvertrag dokumentieren.
- S2.8 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Finaler Maintenance-Informationsvertrag.

Exit-Kriterium:

- Es ist klar, welche Bloecke ins Panel kommen und welche bewusst draussen bleiben.

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
- S3.2 User-Facing Copy Review:
  - Maintenance-Texte muessen kurz, ruhig und eindeutig sein.
  - `bereit` darf nicht wie Fehler wirken.
  - `remote gesund` darf nur bei echtem Erfolg erscheinen.
  - `Zustellung pruefen` muss auf echten Handlungs-/Warnbedarf begrenzt bleiben.
  - Profil-Kurzstatus und Touchlog-Detailstatus duerfen sich nicht widersprechen.
- S3.3 Accessibility Review:
  - Close erreichbar
  - Tastaturbedienung
  - `aria-live` nicht zu laut
  - Fokus-/Scrollverhalten
- S3.4 Tooling und lokal moegliche Checks klaeren.
- S3.5 S4-Substeps konkretisieren.
- S3.6 Contract Review S3.
- S3.7 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Bruchrisiko-Liste.
- Copy-/Status-Vertrag.
- Umsetzungsplan fuer S4.

Exit-Kriterium:

- S4 kann ohne Grundsatzentscheid starten.

## S4 - Umsetzung Touchlog v2

Ziel:

- Touchlog v2 sequenziell umsetzen.
- Nach jedem Substep direkt pruefen und dokumentieren.

Substeps:

- S4.1 `index.html` Touchlog-Markup fuer Header, Maintenance, Toggles und Log strukturieren.
- S4.2 `app/styles/auth.css` fuer Desktop- und Mobile-Layout anpassen.
- S4.3 `app/diagnostics/devtools.js` an Maintenance-Status anbinden.
- S4.4 Push-Health kompakt aus `profile.getPushRoutingStatus()` darstellen.
- S4.5 aktive Diagnosemodi als Liste/Pills darstellen.
- S4.6 lokale Hilfsaktion `Touchlog leeren` umsetzen, falls in S2 bestaetigt.
- S4.7 optional Dev-State-Reset umsetzen, falls in S2 bestaetigt.
- S4.8 User-Facing Copy finalisieren.
- S4.9 Code Review waehrend der Umsetzung.
- S4.10 Schritt-Abnahme.

Jeder S4-Substep dokumentiert:

- Umsetzung
- betroffene Dateien
- lokaler Check
- Contract Review
- Findings/Korrekturen
- Restrisiko

Output:

- Touchlog v2 in MIDAS.

Exit-Kriterium:

- Zielstruktur ist umgesetzt, ohne Scope-Ausweitung.

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
- S5.4 Mobile-Smoke definieren oder ausfuehren:
  - Panel nicht abgeschnitten
  - Safe Area eingehalten
  - Header/Close erreichbar
  - Maintenance und Log separat lesbar
  - keine horizontale Ueberbreite
- S5.5 Push-Health-Smoke definieren oder ausfuehren:
  - kein Browser-Abo
  - bereit, wartet auf erste faellige Erinnerung
  - remote gesund
  - Zustellung pruefen, soweit lokal simulierbar
- S5.6 Boot-Error-/Fallback-Smoke definieren oder ausfuehren.
- S5.7 User-Facing Copy Review nach Smoke.
- S5.8 Code Review gegen Bruchrisiken.
- S5.9 Contract Review gegen MIDAS-Guardrails.
- S5.10 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Getesteter Touchlog-v2-Stand mit klaren Restrisiken.

Exit-Kriterium:

- Alle lokal moeglichen Checks sind erledigt oder bewusst als nicht lokal ausfuehrbar markiert.

## S6 - Doku-Sync, QA-Update und Abschlussreview

Ziel:

- Source-of-Truth-Dokus synchronisieren.
- QA aktualisieren.
- Roadmap final abschliessen.

Substeps:

- S6.1 `docs/modules/Diagnostics Module Overview.md` aktualisieren.
- S6.2 `docs/modules/Profile Module Overview.md` aktualisieren, falls Profil-/Touchlog-Vertrag betroffen ist.
- S6.3 `docs/modules/Push Module Overview.md` aktualisieren, falls Push-Health-Darstellung betroffen ist.
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
- Profil-Pushstatus und Touchlog-Maintenance widersprechen sich nicht.
- Keine sensiblen Werte werden angezeigt.
- Mobile Panel bleibt innerhalb des Viewports.
- Close bleibt auf Mobile erreichbar.
- Dev-Toggles bleiben lokal und reversibel.
- Hilfsaktionen veraendern keine Produktdaten.

## Abnahmekriterien

- MIDAS Touchlog ist auf Handy praktisch nutzbar.
- Maintenance-Section beantwortet echte Betriebsfragen.
- Push-Health ist im Touchlog-Kontext sichtbar, ohne Push-Overflow.
- Profil-Pushkarte und Touchlog-Maintenance widersprechen sich nicht.
- Hestia-Learnings sind erkennbar umgesetzt, aber MIDAS-spezifisch geschnitten.
- Diagnostics-Doku und QA sprechen denselben Vertrag.
- Kein Service-Worker-, Android-, Push-Fachlogik- oder Produktdaten-Scope wurde versehentlich beruehrt.

## Risiken

- Zu viele Maintenance-Bloecke koennen den Touchlog wieder ueberladen.
- Push-Health kann falsche Sicherheit vermitteln, wenn Labels unpraezise sind.
- Mobile Layout kann formal korrekt, aber real auf Samsung/Android weiter eng wirken.
- PII-/Token-Leaks waeren besonders kritisch, wenn Auth-/Runtime-Status aufgenommen wird.
- Boot-Error-Fallback koennte regressieren, wenn Markup oder Bindings falsch verschoben werden.
- Doku-Drift zwischen Profil-Pushkarte, Touchlog-Maintenance und Diagnostics Overview.
