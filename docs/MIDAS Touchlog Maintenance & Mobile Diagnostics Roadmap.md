# MIDAS Touchlog Maintenance & Mobile Diagnostics Roadmap

## Ziel (klar und pruefbar)

Der MIDAS Touchlog soll von einem engen technischen Log-Panel zu einer mobilen, ruhigen und wartbaren Diagnoseflaeche weiterentwickelt werden.

Pruefbare Zieldefinition:

- Der Touchlog ist auf Handy lesbar, bedienbar und nicht abgeschnitten.
- Diagnosezustand und Log-Stream sind visuell getrennt.
- Eine Maintenance-Section zeigt die wichtigsten Betriebszustaende, ohne das Panel zu ueberladen.
- Push-Health aus der Profilkarte wird im Touchlog sinnvoll verfuegbar, aber nicht als grosse Push-Spezialseite.
- Aktive Dev-/Diagnosemodi werden als Status sichtbar, nicht als Log-Spam.
- Der Log bleibt Event-Trace, nicht Dashboard, nicht Produktfeature und nicht technische Muellhalde.
- Hestia-Learnings werden auf MIDAS zugeschnitten, nicht blind kopiert.

## Problemzusammenfassung

MIDAS hat technisch einen starken Diagnostics-Core:

- `diag.add` mit Dedupe
- Summary-Eintraege
- Diagnostics-Layer mit Logger/Perf/Monitor
- Boot-Error-Fallbacks
- Dev-Toggles

Die UI ist aber nicht auf derselben Hoehe:

- Das Panel ist auf Mobile zu eng und kann abgeschnitten wirken.
- Dev-Toggles, Push-Diagnose und Log-Stream teilen sich dieselbe enge Flaeche.
- Es gibt keine klare Maintenance-Section fuer aktuelle Systemzustaende.
- Push-Health ist nach der Push-Cadence-Roadmap im Profil sichtbar, gehoert aber fuer schnelle Fehlersuche auch in den Touchlog-Kontext.
- Hestia zeigt, dass eine ruhige linke Status-/Maintenance-Spalte plus rechter Log-Stream besser funktioniert.

## Scope

- Neues Touchlog-/Diagnostics-Layout fuer MIDAS.
- Mobile-first Struktur fuer `#diag`.
- Maintenance-Section fuer kompakte Systemzustaende.
- Push-Health-Block aus dem Profil sinnvoll in den Touchlog uebertragen:
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
- Doku und QA fuer Diagnostics aktualisieren.

## Not in Scope

- Umbau der Push-Fachlogik.
- Service-Worker-Neuarchitektur.
- Native Android-Diagnose oder Android-Push.
- Remote Logging, Telemetrie oder Monitoring-Backend.
- Vollwertiges Developer-Dashboard.
- Neue Produktfeatures im Touchlog.
- Entfernen der Profil-Push-Zusammenfassung ohne separaten Entscheid.
- Log-Spam durch permanente Spiegelung jedes Toggle-Zustands.

## Relevante MIDAS-Referenzen

- `index.html`
- `app/core/diag.js`
- `app/diagnostics/devtools.js`
- `app/styles/auth.css`
- `app/styles/hub.css`
- `docs/modules/Diagnostics Module Overview.md`
- `docs/Push Cadence & Health Visibility Follow-up Roadmap.md`

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
- kleine Hestia-Komplexitaet als Massstab fuer MIDAS-Featureumfang

## Guardrails

- MIDAS bleibt Lebensapp, nicht Debug-Werkbank.
- Der Touchlog hilft bei Wartung und QA, bleibt aber kein Produkt-Hauptbereich.
- Maintenance zeigt nur Zustaende, die echte Diagnosefragen beantworten.
- Push-Health darf sichtbar sein, aber nicht das ganze Panel dominieren.
- Dev-Toggles bleiben lokal und reversibel.
- Keine Maintenance-Anzeige darf fachliche App-Wahrheit veraendern.
- Keine stillen Sondermodi, die nur im Code existieren.
- Logs bleiben dedupliziert und ruhig.

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
  - `lokales Fallback`
  - `warte auf Remote-Bestaetigung`
  - `Browser blockiert`
  - letzter Erfolg / letzter Fehler nur kompakt
- App-Shell:
  - `No Cache` aktiv/inaktiv
  - Service Worker Status, falls vorhanden und belastbar
- Diagnostics:
  - Diagnostics aktiv/deaktiviert
  - Log-Eintraege count
  - letzter Error/Warning, falls belastbar
- Auth/Runtime:
  - nur falls bereits sicher und ohne PII darstellbar
  - keine Tokens, keine UIDs, keine sensiblen Daten

## Execution Mode

- Sequenziell arbeiten.
- Erst Struktur und Vertrag, dann Code.
- Nach jedem Hauptschritt Statusmatrix aktualisieren.
- Nach jedem Hauptschritt mindestens ein Review oder Check.
- Doku und QA erst nach der Implementierung finalisieren.

## Statusmatrix

| ID | Schritt | Status | Ergebnis/Notiz |
|---|---|---|---|
| S1 | HESTIA-Lessons und MIDAS-Ist-Zustand final reviewen | TODO | Hestia-Pattern gegen MIDAS-Diagnostics lesen und Uebernahmegrenzen finalisieren. |
| S2 | MIDAS Touchlog-Contract und Maintenance-Informationsarchitektur festziehen | TODO | Entscheiden, welche Statusbloecke ins Panel kommen und welche bewusst draussen bleiben. |
| S3 | Mobile-first UI-Plan und DOM-Struktur definieren | TODO | Zielstruktur fuer Desktop und Mobile ohne Code-Drift festlegen. |
| S4 | Implementierung Touchlog v2 | TODO | Markup, CSS und Devtools/Diagnostics-Integration umbauen. |
| S5 | Tests, Code Review und Contract Review | TODO | JS-Checks, responsive Smoke, mobile Browsercheck und Guardrail-Review. |
| S6 | Doku-Sync, QA-Update und Abschlussreview | TODO | Diagnostics Overview, QA und Roadmap final synchronisieren. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Schritte + Subschritte

### S1 - HESTIA-Lessons und MIDAS-Ist-Zustand final reviewen

- S1.1 Hestia Touchlog-Code und Devtools-CSS gezielt lesen.
- S1.2 Hestia Touchlog Module Overview gegen echte Dateien pruefen.
- S1.3 MIDAS `diag.js`, `devtools.js`, `auth.css` und `index.html` gegenueberstellen.
- S1.4 Uebernahmefaehige Patterns und No-Gos dokumentieren.
- S1.5 Contract Review gegen MIDAS-Guardrails.
- Output: klare Lessons-Learned-Karte.

### S2 - Touchlog-Contract und Maintenance-Informationsarchitektur

- S2.1 Definieren, was Maintenance im MIDAS-Kontext bedeutet.
- S2.2 Push-Health-Details aus Profil/S4.6 klassifizieren:
  - muss in Maintenance
  - optional
  - bleibt nur Profil
- S2.3 Aktive Diagnosemodi definieren.
- S2.4 Hilfsaktionen festlegen:
  - Touchlog leeren
  - Dev State zuruecksetzen
  - keine produktiven Datenaktionen
- S2.5 Contract Review gegen PII-/Security-Constraints.
- Output: finaler Informationsvertrag.

### S3 - Mobile-first UI-Plan und DOM-Struktur

- S3.1 Ziel-Markup fuer `#diag` festlegen.
- S3.2 Desktop-Layout definieren.
- S3.3 Mobile-Layout definieren.
- S3.4 Accessibility pruefen:
  - Dialog-Rollen
  - Close erreichbar
  - aria-live nicht zu laut
  - Tastaturbedienung
- S3.5 Review gegen Hestia-Lessons.
- Output: umsetzbarer UI-Plan.

### S4 - Implementierung Touchlog v2

- S4.1 `index.html` Touchlog-Markup umbauen.
- S4.2 `app/styles/auth.css` oder separates Diagnostics-CSS fuer neues Layout anpassen.
- S4.3 `app/diagnostics/devtools.js` an Maintenance-Status anbinden.
- S4.4 Push-Health kompakt aus `profile.getPushRoutingStatus()` darstellen.
- S4.5 Aktive Diagnosemodi als Liste/Pills darstellen.
- S4.6 Optional `Touchlog leeren` anbinden, falls vertraglich bestaetigt.
- S4.7 Code Review waehrend Umsetzung.
- Output: Touchlog v2 in MIDAS.

### S5 - Tests, Code Review und Contract Review

- S5.1 `node --check` fuer betroffene JS-Dateien.
- S5.2 CSS-/Diff-Whitespace-Check.
- S5.3 Desktop Smoke:
  - Panel oeffnen/schliessen
  - Log sichtbar
  - Maintenance sichtbar
- S5.4 Mobile Smoke:
  - Panel nicht abgeschnitten
  - Header/Close erreichbar
  - Maintenance und Log separat scroll-/lesbar
- S5.5 Push-Health Smoke:
  - kein Abo
  - wartend
  - remote gesund
  - Fallback/Fehler, soweit lokal simulierbar
- S5.6 Contract Review:
  - keine Produktdatenmutation
  - keine Push-Fachlogik
  - keine PII
  - kein Log-Spam
- Output: getesteter Touchlog-v2-Stand.

### S6 - Doku-Sync, QA-Update und Abschlussreview

- S6.1 `docs/modules/Diagnostics Module Overview.md` aktualisieren.
- S6.2 `docs/QA_CHECKS.md` um Touchlog-v2-Smokes erweitern.
- S6.3 Diese Roadmap mit Ergebnisprotokollen aktualisieren.
- S6.4 Finaler Contract Review gegen Hestia-Lessons und MIDAS-Guardrails.
- S6.5 Commit-/Archiv-Empfehlung.
- Output: dokumentierter und abgeschlossener Touchlog-v2-Umbau.

## Smokechecks / Regression

- Touchlog oeffnet und schliesst weiter deterministisch.
- Boot-Error kann Touchlog weiterhin oeffnen.
- Log-Eintraege bleiben dedupliziert.
- Aktive Modi erzeugen keinen Log-Spam.
- Push-Health wird kompakt sichtbar.
- Keine sensiblen Werte werden angezeigt.
- Mobile Panel bleibt innerhalb des Viewports.
- Close bleibt auf Mobile erreichbar.
- Dev-Toggles bleiben lokal und reversibel.

## Abnahmekriterien

- MIDAS Touchlog ist auf Handy praktisch nutzbar.
- Maintenance-Section beantwortet echte Betriebsfragen.
- Push-Health ist im Touchlog-Kontext sichtbar, ohne Push-Overflow.
- Profil-Pushkarte und Touchlog-Maintenance widersprechen sich nicht.
- Hestia-Learnings sind erkennbar umgesetzt, aber MIDAS-spezifisch geschnitten.
- Diagnostics-Doku und QA sprechen denselben Vertrag.

## Risiken

- Zu viele Maintenance-Bloecke koennen den Touchlog wieder ueberladen.
- Push-Health kann falsche Sicherheit vermitteln, wenn Labels unpraezise sind.
- Mobile Layout kann formal korrekt, aber real auf Samsung/Android weiter eng wirken.
- PII-/Token-Leaks waeren besonders kritisch, wenn Auth-/Runtime-Status aufgenommen wird.
- Doku-Drift zwischen Profil-Pushkarte, Dev-Panel und Diagnostics Overview.
