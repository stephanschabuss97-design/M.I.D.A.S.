# MIDAS Android Widget & Shell Roadmap (DONE)

## Ziel (klar und pruefbar)
Es soll eine lokal installierbare Android-Huelle fuer MIDAS entstehen, deren primaerer Zweck ein natives Homescreen-Widget als passive Daily-Snapshot-Surface ist. MIDAS selbst bleibt dabei unveraendert das Hauptsystem, die Source of Truth und der Ort fuer alle komplexen Interaktionen, Eingaben und Detailansichten.

Pruefbare Zieldefinition:
- Es existiert eine native Android-Huelle ausserhalb des Web-Roots von MIDAS.
- Die Android-Huelle stellt mindestens ein natives Android-Homescreen-Widget bereit.
- Das Widget ist ein read-only Daily-Snapshot und kein zweites Eingabesystem.
- Das Widget liefert Sichtbarkeit ohne dauerhaft geoeffnete MIDAS-Oberflaeche.
- MIDAS bleibt Source of Truth fuer Daten, Business-Logik und komplexe Interaktion.
- Das Widget zeigt in V1 mindestens:
  - `Wasser (Ist)`
  - `Wasser-Soll`
- Das Widget zeigt in V1 zusaetzlich:
  - `Medikation-Status`
- Das Widget kann MIDAS oeffnen, ersetzt MIDAS aber nicht.
- Es entstehen keine Root-Verschmutzung und kein Android-Datei-Sammelsurium im bestehenden Web-Repo.

## Scope
- Produktvertrag fuer Android-Widget und minimale native MIDAS-Huelle.
- Analyse des bestehenden MIDAS-Dashboard-/Snapshot-Pfads fuer:
  - `Wasser`
  - `Wasser-Soll`
  - potenziell `Medikation-Status`
- Festlegung der technischen Trennung:
  - MIDAS Web/PWA
  - Android Shell / Widget Host
- Entscheidung ueber Repo-/Ordnerstrategie:
  - klar isolierter Android-Bereich `android/` innerhalb des MIDAS-Repos
- Definition eines stabilen Widget-Datenvertrags fuer den passiven Snapshot.
- Explizite Entscheidung, wie weit V1 echte Off-App-Aktualisierung liefert und wo bewusst nur `last known snapshot` gilt.
- Spaetere Umsetzung der nativen Huelle, des Widgets und des dokumentarischen Vertrags.

## Not in Scope
- Eine vollwertige native Android-App als Ersatz fuer MIDAS.
- Komplexe Eingaben direkt ueber das Widget.
- Trendpilot, BP, Body, Lab, Training, Reports oder Doctor View im Widget.
- Reminder- oder Push-Logik fuer Wasser.
- Play-Store-Distribution.
- Root-Ablage von Android-/Gradle-/TWA-Dateien ohne klare Kapselung.
- Sofortige Wearable-/Clock-Integration; diese bleibt separater spaeterer Node-Pfad.

## Relevante Referenzen (Code)
- `app/modules/hub/index.js`
- `app/modules/intake-stack/intake/index.js`
- `app/modules/intake-stack/medication/index.js`
- `app/modules/appointments/index.js`
- `service-worker.js`
- `index.html`

## Relevante Referenzen (Doku)
- `README.md`
- `docs/modules/Hub Module Overview.md`
- `docs/modules/Hydration Target Module Overview.md`
- `docs/modules/Intake Module Overview.md`
- `docs/modules/Medication Module Overview.md`
- `docs/modules/Push Module Overview.md`
- `docs/QA_CHECKS.md`
- `docs/archive/Hydration Target Dashboard Roadmap (DONE).md`

## Guardrails
- Das Widget ist ein stiller Kompass, kein Coach.
- Das Widget ist primaer Dashboard-Surface, nicht Capture-Surface.
- MIDAS bleibt Hauptsystem; die Android-Huelle darf keine Fachlogik aus MIDAS herausziehen und verselbststaendigen.
- Keine Root-Verschmutzung durch Android-/Gradle-/TWA-Artefakte.
- Kein schleichender Ausbau zu einer halben zweiten App.
- Keine Bewertungs-, Stress- oder Reminder-Sprache im Widget.
- Die Roadmap darf keinen Zustand als "fertig passiv" verkaufen, wenn das Widget faktisch noch regelmaessig Launcher-/Shell-Oeffnung fuer frische Daten braucht.
- Wenn V1 zu voll wird, ist Scope-Reduktion vorzuziehen, nicht kreative Verdichtung.
- Reale Homescreen-Groesse auf Geraeten schlaegt fruehe Raster-Annahmen; `4x3` bleibt kein Dogma, wenn es sich im Alltag als zu gross oder zu luftig erweist.

## Architektur-Constraints
- Android-Code muss technisch sauber vom Web-/PWA-Kern getrennt bleiben.
- Der Widget-Pfad braucht einen expliziten Snapshot-Vertrag; Browser-UI-State aus dem Hub darf nicht implizit als Android-Datenquelle vorausgesetzt werden.
- `Wasser-Soll` darf nicht in zwei still driftende Logiken zerfallen; bei nativer Berechnung braucht es einen klar dokumentierten Vertragsort.
- Android-Widgets sind kein frei tickender Hub-Dashboard-Ersatz; Refresh-Genauigkeit, Staleness und Update-Frequenz muessen explizit als Android-Tradeoff beschlossen werden.
- MIDAS-Aenderungen sollen moeglichst selten APK-Rebuilds erzwingen, aber die Roadmap darf diesen Tradeoff nicht beschoenigen.
- Auth, Datenfrische und Snapshot-Aktualisierung muessen explizit entschieden werden; kein implizites "das Widget liest halt irgendwie MIDAS".
- Es gibt keinen Widget-Read-Pfad ohne bewusst entschiedenen Auth-/Snapshot-Vertrag.
- Das Endziel bleibt ein passiver Homescreen-Nutzwert ohne dauerhaft geoeffnete MIDAS-Huelle; wenn V1 technisch zunaechst nur einen `last known snapshot` absichert, muss diese Zwischenstufe ausdruecklich als Zwischenstufe markiert werden.
- Optionaler Launcher darf minimales Oeffnen von MIDAS ermoeglichen, ist aber nicht der Produktkern.
- Der Ordnername der nativen Huelle ist offen, aber die Ablage im Repo-Root ohne Kapselung ist ausgeschlossen.
- Die Widget-Oberflaeche muss sich an echter Android-Homescreen-Flaeche orientieren, nicht nur an theoretischen Cell-Angaben.
- Der visuelle Vertrag fuer das Widget orientiert sich an MIDAS-Glass-/Dashboard-Flaechen, darf auf dem Homescreen aber leichter und atmosphaerischer wirken als ein In-App-Panel:
  - transparenteres atmospheric-glass statt schwerem Vollblock
  - kuehler dunkler Surface-Kern nur als Tinte, nicht als massive Flaeche
  - subtile helle Border
  - weiche Blau-/Cyan-/Magenta-Lichtschichten
  - Gold hoechstens als feiner Akzent
  - Wallpaper-Toleranz und Lesbarkeit vor Show-Effekt
  - verspielt im Sinne von atmosphaerisch, nicht dekorativ oder cartoonhaft

## Tool Permissions
Allowed:
- Bestehende MIDAS-Dashboard-, Intake- und Medication-Pfade analysieren.
- Doku, Architekturvertrag und spaetere Android-Huelle innerhalb des beschlossenen Scopes anlegen.
- Eine isolierte native Struktur im beschlossenen Bereich anlegen, sobald der Vertrag steht.
- Lokale Machbarkeits-, Syntax- und Repo-Scans vorbereiten.

Forbidden:
- Android-Dateien ungeordnet ins Repo-Root kopieren.
- Business-Logik aus MIDAS in die Android-Huelle verschieben, nur weil es technisch einfacher wirkt.
- Das Widget zu einer Eingabe- oder Reminder-Flaeche aufblasen.
- V1 mit zu vielen Sekundaerwerten ueberladen.

## Execution Mode
- Sequenziell arbeiten (`S1` bis `S5`).
- `S1` kartiert den bestehenden MIDAS-Dashboard-/Snapshot-Kontext und fruehere Android-/TWA-Reste.
- `S2` fixiert den finalen Produktvertrag fuer Widget und Shell.
- `S3` fixiert Architektur-, Repo- und Datenvertrag.
- `S4` fixiert den technischen Umsetzungsplan fuer native Huelle, Snapshot-Pfad und optionalen Launcher.
- Erst `S5` ist die konkrete Umsetzung.
- Nach jedem Schritt Statusmatrix aktualisieren.
- Nach jedem Schritt mindestens ein Check: Contract-Review, Repo-Scan, Syntaxcheck oder Smoke-Definition.
- Jeder Hauptschritt endet mit denselben operativen Pflichtpunkten:
  - Schritt-Abnahme
  - Doku-Sync
  - Commit-Empfehlung

## Vorgeschlagene fachliche Default-Richtung
Android Widget / Shell V1:
- Widget ist passiver Daily-Snapshot.
- MIDAS bleibt Hauptsystem und Source of Truth.
- Widget zeigt zunaechst nur die Werte, die reale Reibung senken:
  - `Wasser (Ist)`
  - `Wasser-Soll`
- `Medikation-Status` ist ein bewusster Pruefpunkt fuer `S2`, nicht bereits stillschweigend gesetzt.
- `Salz` und `Protein` sind fachlich interessant, aber fuer die erste Version nachrangig, weil ihr praktischer Erfassungsflow oft ohnehin ueber Vision/GPT und die geoeffnete App laeuft.
- `Appointments` bleiben ausserhalb des fruehen Widget-Kerns:
  - bestehende Ticker-Bar
  - normale App-Nutzung
  - kein relevanter Reibungsgewinn auf dem Homescreen
- Android-Huelle ist:
  - Widget Host
  - optionaler MIDAS-Launcher
  - keine zweite Fach-App
- Layout-/Look-Richtung fuer V1:
  - kompakter als der fruehe `4x3`-Entwurf
  - visuell eher Richtung `4x2`-Nutzwert
  - kleine Kopfzeile mit Datum statt grossem luftigen Titelblock
  - transparentere atmosphaerische MIDAS-Glass-Surface statt generischer dunkler Card

Hinweis:
- Die Frage, ob die native Huelle spaeter technisch eher TWA, WebView-Launcher oder anderer Android-Mechanismus wird, ist in dieser Roadmap nachrangig.
- Produktkern ist das Widget; der Oeffnungsmechanismus ist nur Mittel zum Zweck.

## Statusmatrix
| ID | Schritt | Status | Ergebnis/Notiz |
|---|---|---|---|
| S1 | Ist-Analyse des bestehenden MIDAS-Snapshot- und Android-Kontexts | DONE | `S1.1` bis `S1.7` abgeschlossen: `Wasser (Ist)` kommt heute sauber aus dem exportierten Intake-Snapshot, `Wasser-Soll` ist aktuell eine Hub-interne Helper-/Render-Logik ohne eigenen externen Snapshot-Vertrag, `Medikation-Status` liegt fachlich ueber `loadMedicationForDay(...)` und den Medication-Cache vor, aber noch nicht als kompakter Widget-Snapshot, und fruehere Android-/TWA-Versuche existieren nur noch als Archiv-Doku, nicht als technischer Altballast im Repo. |
| S2 | Produktvertrag fuer Widget und native Shell finalisieren | DONE | `S2.1` bis `S2.8` abgeschlossen: Das Widget ist final als passive Daily-Snapshot-Surface festgezogen, MIDAS bleibt Hauptsystem, V1 zeigt verbindlich `Wasser (Ist)` und `Wasser-Soll`, `Medikation-Status` wird bewusst als V1-Wert mitgenommen, `Salz`/`Protein` bleiben spaeterer Ausbaupfad, `Appointments` sind explizit aus dem fruehen Widget-Kern ausgeschlossen, und die native Shell ist klar als minimaler Widget-Host mit optionalem MIDAS-Launcher definiert. |
| S3 | Architektur-, Repo- und Datenvertrag festziehen | DONE | `S3.1` bis `S3.9` abgeschlossen: Die native Huelle lebt klar isoliert unter `android/` im MIDAS-Repo, ohne Root-Verschmutzung; das Widget arbeitet nicht gegen Browser-UI-State, sondern gegen einen expliziten `DailyWidgetState`; `Wasser-Soll` wird nativ aus derselben Stuetzpunkt-Tabelle berechnet, `Wasser (Ist)` und `Medikation-Status` kommen ueber einen bewusst authentifizierten nativen Sync-Pfad in einen lokalen Android-Cache, und der Drift-/APK-Vertrag ist jetzt offen und ehrlich dokumentiert. |
| S4 | Technischen Umsetzungsplan fuer Widget Host, Snapshot-Pfad und Launcher finalisieren | DONE | `S4.1` bis `S4.7` abgeschlossen: Die native Huelle wird als kleiner Android-Widget-Host mit minimalem Launcher geplant, der Snapshot wird ueber einen nativen Sync-Worker in einen lokalen Cache geschrieben, das Widget liest nur den letzten gueltigen `DailyWidgetState`, `Wasser-Soll` wird lokal auf dem Geraet berechnet und in einem bewussten Android-Refresh-Takt aktualisiert, und die erste Layoutidee ist auf drei ruhige Statusbloecke festgezogen; reale Groesse und finale Verdichtung bleiben bewusst Gegenstand von `S5.6`. |
| S5 | Umsetzung in nativer Huelle, Doku, QA und Abschluss-Sync | DONE | `S5.1` bis `S5.10` abgeschlossen: Der isolierte Android-Bereich `android/` ist angelegt, das native App-Skelett samt Wrapper steht, das read-only Homescreen-Widget existiert, Snapshot-Cache und nativer Periodic Sync sind angebunden, der V1-Look wurde bis auf einen ruhigen textnahen Homescreen-Teststand ohne Header/Glasplatte reduziert, die Android-Modul-Overview liegt im MIDAS-Doku-Standard vor, README und QA sind nachgezogen, und der Abschlussblock ist mit Build-/Diff-Checks sowie Commit-Empfehlung dokumentiert. Verbleibende vertikale Abstaende wirken jetzt primaer launcher-/Samsung-gridbedingt und nicht mehr wie ein offener MIDAS-Layoutfehler. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Wiederkehrende Abschluss-Substeps pro Hauptschritt
Diese Abschluss-Substeps gelten fuer jeden Hauptschritt `S1` bis `S5` und sollen jeweils als letzte Substeps mitgefuehrt werden.

- `letzter fachlicher Substep + 1: Schritt-Abnahme`
  - Ergebnis gegen den Ziel-Contract des Schritts pruefen
  - betroffene Dateien auf Drift und potenziellen Dead Code pruefen
  - gezielte Contract-/Syntax-/Smoke-Checks fuer den Schritt ausfuehren
- `danach: Doku-Sync`
  - betroffene Modul-Overviews sofort aktualisieren, wenn sich Verhalten oder Guardrails geaendert haben
  - bei Bedarf auch `README.md`, `docs/QA_CHECKS.md` und neue Android-Doku nachziehen
- `danach: Commit-Empfehlung`
  - explizit festhalten, ob nach dem Schritt ein Commit sinnvoll ist
  - wenn `kein Commit`, kurz begruenden, was noch logisch zusammengehoert

## Schritte + Subschritte

### S1 - Ist-Analyse des bestehenden MIDAS-Snapshot- und Android-Kontexts
- S1.1 Den aktuellen Hub-Dashboard-Pfad fuer `Wasser (Ist)` und `Wasser-Soll` exakt mappen:
  - Quelle
  - Render-Zeitpunkt
  - Refresh-Trigger
- S1.2 Pruefen, wie `Medikation-Status` heute fachlich und technisch im Tageskontext vorliegt.
- S1.3 Pruefen, welche Werte bereits als kompakter Daily-Snapshot existieren und welche heute nur aus geoeffneter UI ableitbar sind.
- S1.4 Repo-Scan auf bestehende oder historische Android-/TWA-Reste:
  - vorhandene Ordner
  - Build-Dateien
  - Manifeste
  - Altversuche
- S1.5 Schritt-Abnahme:
  - Repo-Scan auf Dashboard-/Snapshot-/Medication-Pfade und Android-Artefakte
  - Ergebnis mit Dateireferenzen und Risikostellen festhalten
- S1.6 Doku-Sync:
  - nur falls bestehende Doku den Snapshot-Charakter oder Android-Grenzen bereits unscharf beschreibt
- S1.7 Commit-Empfehlung:
  - festhalten, ob reine Analyse schon commit-wuerdig ist oder mit `S2` gebuendelt wird
- Output: belastbare Karte der heutigen Snapshot-Werte und aller relevanten Android-/TWA-Vorbedingungen.
- Exit-Kriterium: kein unbekannter heutiger Datenpfad fuer `Wasser`, `Wasser-Soll` und den Kandidaten `Medikation-Status` mehr offen.

#### S1 Ergebnisprotokoll (abgeschlossen)

##### S1.1 Aktueller Hub-Dashboard-Pfad fuer `Wasser (Ist)` und `Wasser-Soll`
- `index.html`
  - Der obere Dashboard-Werteblock lebt in `#hubDashboardIntakePills`.
  - Aktuelle Reihenfolge:
    - `Wasser`
    - `Wasser-Soll`
    - `Salz`
    - `Protein`
- `app/modules/hub/index.js`
  - `setupHubDashboard(...)` baut die Dashboard-Pill-Referenzen:
    - `water`
    - `waterTarget`
    - `salt`
    - `protein`
  - `Wasser (Ist)` wird ueber `renderAssistantIntakeTotals(snapshot)` gesetzt.
  - `Wasser-Soll` wird separat ueber `renderDashboardHydrationTarget(...)` gesetzt.
- Konsequenz:
  - `Wasser (Ist)` und `Wasser-Soll` sitzen zwar im selben sichtbaren Dashboard-Block,
  - kommen heute aber aus zwei verschiedenen technischen Pfaden:
    - Intake-Snapshot
    - Hub-Hydration-Helper

##### S1.2 Heutige Quellen, Render-Zeitpunkte und Refresh-Trigger
- `app/modules/intake-stack/intake/index.js`
  - `getCaptureIntakeSnapshot()` liefert bereits einen expliziten kompakten Snapshot:
    - `dayIso`
    - `logged`
    - `totals.water_ml`
    - `totals.salt_g`
    - `totals.protein_g`
  - `emitCaptureIntakeChanged(...)` dispatcht `capture:intake-changed` mit denselben Total-Werten.
- `app/modules/hub/index.js`
  - `renderAssistantIntakeTotals(snapshot)` rendert:
    - `Wasser`
    - `Salz`
    - `Protein`
  - im selben Pfad wird anschliessend `renderDashboardHydrationTarget()` aufgerufen.
  - `Wasser-Soll` basiert auf `getHydrationTargetMl(...)` mit lokaler Stuetzpunkt-Interpolation und aktueller Geraetezeit.
- Refresh-Trigger fuer den Hub-Dashboard-Kontext:
  - Dashboard-Open
  - `capture:intake-changed`
  - `visibilitychange -> visible` fuer `Wasser-Soll`
  - Minutentakt nur bei offenem Dashboard fuer `Wasser-Soll`
  - regulaere `refreshAssistantContext(...)`-Pfade
- Konsequenz:
  - `Wasser (Ist)` hat heute bereits einen exportierbaren Snapshot-Charakter.
  - `Wasser-Soll` ist noch kein separater transportfaehiger Snapshot-Wert, sondern reine Hub-Renderlogik.

##### S1.3 Kandidat `Medikation-Status`: heutiger fachlicher und technischer Stand
- `app/modules/intake-stack/medication/index.js`
  - `loadMedicationForDay(dayIso, ...)` liefert Payload:
    - `dayIso`
    - `medications[]`
  - `mapRpcRow(...)` normalisiert je Medikament u. a.:
    - `state` (`open` / `partial` / `done`)
    - `taken`
    - `taken_count`
    - `total_count`
    - `daily_remaining_qty`
    - `slots[]`
  - `getCachedMedicationDay(dayIso)` liefert den gecachten Tagespayload.
- Befund:
  - Ein fachlich belastbarer Tagesstatus fuer Medication ist bereits ableitbar.
  - Es gibt heute aber noch keinen kleinen, expliziten Daily-Snapshot-Vertrag im Stil von:
    - `medicationStatus = open | partial | done`
  - Fuer ein Widget muesste diese Verdichtung erst bewusst beschlossen werden.

##### S1.4 Kompakte Snapshot-Werte vs. reine UI-Ableitung
- Bereits kompakt vorhanden:
  - Intake-Totals via `getCaptureIntakeSnapshot()`
  - Medication-Tagespayload via `loadMedicationForDay(...)` / Cache
- Noch nicht kompakt als eigener Widget-Vertrag vorhanden:
  - `Wasser-Soll`
  - verdichteter `Medikation-Status`
- Wichtigster S1-Befund:
  - Das Widget kann heute nicht einfach "den Hub lesen".
  - Fuer Android braucht es einen expliziten Snapshot-Vertrag statt implizitem Browser-UI-State.

##### S1.5 Android-/TWA-Reste im Repo
- Repo-Scan:
  - kein `android/`
  - kein `twa/`
  - keine `build.gradle`
  - keine `settings.gradle`
  - kein `AndroidManifest.xml`
  - keine Widget-/AppWidget-Artefakte
- Vorhanden sind nur historische Doku-Dateien:
  - `docs/archive/twa-session-report.md`
  - `docs/archive/twa-implementation-roadmap.md`
- Zusatzbefund:
  - Die archivierte TWA-Roadmap referenziert historische Platzhalter wie `public/twa/Android/README.md`, die im aktuellen Repo nicht mehr existieren.
- Konsequenz:
  - technisch liegt kein Android-Altballast im Repo
  - historisches TWA-Wissen ist nur noch als Referenz in `docs/archive/*` vorhanden

##### S1.6 Doku-Sync
- Kein sofortiger Doku-Sync ausserhalb dieser Roadmap noetig.
- Die bestehende README beschreibt bereits sauber:
  - MIDAS als Hauptsystem
  - das Dashboard als Orientierungsflaeche
  - `WASSER-SOLL` als lokalen Referenzwert
- Android-/Widget-Vertrag ist bewusst noch nicht in README oder Modul-Overview gezogen, solange `S2`/`S3` offen sind.

##### S1.7 Commit-Empfehlung
- Noch kein eigener Commit noetig.
- `S1` gehoert logisch mit `S2` zusammen, weil die Analyse vor allem den Produktvertrag vorbereitet und noch keinen eigenstaendigen stabilen Repo-Endzustand erzeugt.

### S2 - Produktvertrag fuer Widget und native Shell finalisieren
- S2.1 Den finalen Zwecktext festziehen:
  - Widget = passive Daily-Snapshot-Surface
  - Shell = minimale native Huelle
  - MIDAS = Hauptsystem
- S2.2 V1-Inhalt final festziehen:
  - `Wasser (Ist)`
  - `Wasser-Soll`
  - Beschluss, ob `Medikation-Status` bereits V1 wird oder bewusst erst spaeter
- S2.3 Sekundaerwerte klar einordnen:
  - `Salz`
  - `Protein`
  - `Appointments`
- S2.4 Guardrails textlich finalisieren:
  - kein Capture-Fokus
  - keine Reminder-Schicht
  - keine Analyse
  - keine zweite App
- S2.5 Launcher-Rolle final benennen:
  - optional MIDAS oeffnen
  - kein Produktkern
- S2.6 Schritt-Abnahme:
  - Produktvertrag auf MIDAS-Konformitaet und Alltagstauglichkeit pruefen
  - Scope-Drift fuer V1 aktiv ausschliessen
- S2.7 Doku-Sync:
  - falls noetig kurzer Vermerk in `README.md`
- S2.8 Commit-Empfehlung
- Output: finaler Produktvertrag fuer die erste Android-Surface.
- Exit-Kriterium: kein offener Produktstreit mehr ueber Rolle, Inhalt oder Schweregrad der nativen Huelle.

#### S2 Ergebnisprotokoll (abgeschlossen)

##### S2.1 Finaler Zwecktext
- Das Widget ist final:
  - passive Daily-Snapshot-Surface
  - ruhiger MIDAS-Kompass auf dem Android-Homescreen
  - kein Eingabesystem
  - kein Reminder-System
- Die native Shell ist final:
  - minimaler nativer Host fuer das Widget
  - optionaler Launcher fuer MIDAS
  - keine zweite Fach-App
- MIDAS bleibt final:
  - Hauptsystem
  - Source of Truth
  - Ort fuer Eingaben, Vision-/GPT-Flows, Detailsichten und komplexe Interaktion

##### S2.2 Finaler V1-Inhalt
- Verbindlich in V1:
  - `Wasser (Ist)`
  - `Wasser-Soll`
  - `Medikation-Status`
- Begruendung:
  - `Wasser (Ist)` + `Wasser-Soll` erzeugen den eigentlichen Dashboard-/Kompass-Nutzen.
  - `Medikation-Status` ist der fachlich sinnvollste dritte Wert, weil er spaeter ein stiller Airbag fuer Vergesslichkeit oder unruhigere Tage sein kann.
  - `Medikation-Status` wird dabei ausdruecklich nur als passiver Status verstanden:
    - `offen`
    - `teilweise`
    - `erledigt`
  - keine direkte Bestaetigung am Widget
  - kein Alarmcharakter

##### S2.3 Sekundaerwerte
- `Salz`
  - fachlich interessant, aber fuer V1 nicht noetig
  - spart auf dem Homescreen wenig echte Reibung, weil die Erfassung meist ohnehin ueber Vision/GPT und geoeffnete App erfolgt
- `Protein`
  - gleiches Urteil wie `Salz`
- `Appointments`
  - explizit kein frueher Widget-Kern
  - bestehende Ticker-Bar plus normale App-Nutzung decken den praktischen Bedarf bereits ausreichend ab

##### S2.4 Finalisierte Guardrails
- kein Capture-Fokus
- keine Eingabeflaeche am Widget
- keine Reminder-Schicht
- keine Analyse- oder Trendflaeche
- keine zweite App
- keine "wenn wir schon dabei sind"-Ueberladung mit Sekundaerwerten
- wenn V1 in Konflikt geraet:
  - lieber kleiner schneiden
  - nicht dichter packen

##### S2.5 Launcher-Rolle
- Der Launcher bleibt bewusst Hilfsfunktion:
  - Widget-Tap oder explizite Launcher-Oeffnung darf MIDAS starten
  - der Launcher ist aber kein eigener Produktgrund
- Konsequenz:
  - Architektur und Scope werden vom Widget her gedacht
  - nicht von TWA/WebView/Launcher-Mechanik aus

##### S2.6 Produkturteil zur MIDAS-Konformitaet
- Der Vertrag ist mit der aktuellen MIDAS-Realitaet konsistent:
  - frueher Tageskompass statt Vollzeit-Tracking
  - Sichtbarkeit vor Interaktion
  - geringe Reibung vor Feature-Breite
  - Airbag-Logik bei Medication statt neuer Reminder-Flaeche
- Wichtig:
  - `Medikation-Status` wurde bewusst aufgenommen, aber nur als stiller Statusanker
  - nicht als Einstieg in Widget-Interaktion

##### S2.7 Doku-Sync
- Noch kein README-Sync noetig.
- Der Produktvertrag ist jetzt in der Roadmap sauber genug fixiert und kann spaeter mit `S3`/`S4` in Android-spezifische Doku uebernommen werden.

##### S2.8 Commit-Empfehlung
- Noch kein Commit noetig.
- `S2` gehoert logisch mit `S3` zusammen, weil Produktvertrag und Architektur-/Datenvertrag zusammen den eigentlichen Arbeitsauftrag fuer die spaetere Umsetzung bilden.

### S3 - Architektur-, Repo- und Datenvertrag festziehen
- S3.1 Final entscheiden, wo die native Huelle lebt:
  - klar isolierter Bereich `android/` im MIDAS-Repo
- S3.2 Finalen Ordnervertrag festziehen:
  - `android/` ist der einzige zulaessige Android-Bereich im Repo
  - keine Android-/Gradle-/Manifest-Dateien ausserhalb von `android/`
  - klare Root-Schutzregel definieren
- S3.3 Snapshot-Vertrag definieren:
  - welche Felder das Widget wirklich braucht
  - welches Format stabil sein soll
  - welche Felder lokal berechnet werden duerfen und welche nicht
- S3.4 `Wasser-Soll`-Vertrag festziehen:
  - native Re-Implementierung derselben Stuetzpunkt-Logik
  - oder explizit gelieferter Snapshot-Wert
- S3.5 Auth- und Aktualisierungsvertrag festziehen:
  - wie das Widget an frische Daten kommt
  - wann es aktualisiert
  - welche Offline-/Stale-Grenzen akzeptabel sind
  - wie Android-spezifische Refresh-Grenzen fuer `Wasser-Soll` bewusst behandelt werden
- S3.6 APK-Rebuild-/Drift-Vertrag ehrlich festziehen:
  - welche MIDAS-Aenderungen Widget-Rebuilds erzwingen koennen
  - welche nicht
- S3.7 Schritt-Abnahme:
  - Architekturvertrag ist ohne versteckte Root-/Drift-/Business-Logic-Verschiebung geschlossen
- S3.8 Doku-Sync:
  - Vertragsstand im Arbeitsdokument konsistent halten
- S3.9 Commit-Empfehlung
- Output: belastbarer Architektur- und Datenvertrag fuer die spaetere native Umsetzung.
- Exit-Kriterium: kein offener Streit mehr ueber Ablage, Snapshot-Quelle oder Drift-Risiko.

#### S3 Ergebnisprotokoll (abgeschlossen)

##### S3.1 Repo- und Ablageentscheidung
- Finaler Beschluss:
  - Die native Android-Huelle lebt unter `android/` im MIDAS-Repo.
- Begruendung:
  - alles bleibt unter einem Dach und besser im Blick
  - gemeinsamer Kontext fuer spaetere Arbeit
  - trotzdem saubere Trennung von Web/PWA und Android durch harte Ordnergrenze
- Konsequenz:
  - die eigentliche native Implementierung lebt ausschliesslich unter `android/`
  - der Repo-Root bleibt frei von Android-/Gradle-/Manifest-Artefakten

##### S3.2 Snapshot-Grundsatz
- Finaler Architekturvertrag:
  - Das Widget liest niemals implizit Hub-/Browser-UI-State.
  - Es arbeitet gegen einen expliziten kompakten Snapshot-Vertrag.
- Finaler V1-Snapshot-Vertrag:
  - `DailyWidgetState`
    - `dayIso`
    - `waterCurrentMl`
    - `waterTargetNowMl`
    - `medicationStatus`
    - `updatedAt`
- `DailyWidgetState` ist read-only und rein fuer die Widget-Oberflaeche gedacht.

##### S3.3 Feldvertrag fuer `DailyWidgetState`
- `dayIso`
  - lokaler MIDAS-Tageskontext fuer den Snapshot
- `waterCurrentMl`
  - heutiger Wasser-Istwert in `ml`
  - Quelle: Intake-Tageswerte
- `waterTargetNowMl`
  - aktueller `Wasser-Soll`-Referenzwert in `ml`
  - Quelle: native Berechnung nach derselben Stuetzpunkt-Tabelle wie im MIDAS-Hub
- `medicationStatus`
  - kompakter Tagesstatus fuer Medication
  - finale V1-Werte:
    - `none`
    - `open`
    - `partial`
    - `done`
- `updatedAt`
  - technischer Zeitstempel des letzten erfolgreich gebauten nativen Snapshots
  - vorerst technische Vertragsinfo, nicht automatisch sichtbares UI-Element

##### S3.4 Finaler Vertrag fuer `Medikation-Status`
- `none`
  - keine aktiven geplanten Medication-Slots fuer den Tag
- `open`
  - geplante Slots vorhanden, aber noch kein Slot erledigt
- `partial`
  - geplante Slots vorhanden, ein Teil erledigt, ein Teil offen
- `done`
  - alle geplanten Slots fuer den Tag erledigt
- Konsequenz:
  - Das Widget zeigt Medication bewusst nur als ruhigen Tagesstatus,
  - nicht als Slot-Detailansicht,
  - nicht als Confirm-Flaeche,
  - nicht als Incident-Flaeche.

##### S3.5 Auth- und Aktualisierungsvertrag
- Finaler Beschluss:
  - Das Widget spricht nicht direkt und nicht ad hoc gegen MIDAS oder Supabase.
  - Die native Android-Huelle haelt eine eigene explizite Session und einen eigenen Sync-Pfad.
  - Das Widget liest nur aus einem nativen lokalen Cache / Snapshot-Store der Android-Huelle.
- Begruendung:
  - Android-Widget ist keine Browser-PWA
  - keine implizite Session-Teilung mit dem Web-Login
  - sauberere Trennung zwischen:
    - authentifiziertem Sync
    - read-only Widget-Render
- Vertrag:
  - `Wasser (Ist)` und `Medikation-Status` werden durch die native Huelle authentifiziert geladen und lokal gecacht.
  - Das Widget rendert nur den letzten gueltigen lokalen Snapshot.
  - V1 nutzt dafuer bestehende MIDAS-Read-Vertraege statt eines neuen Snapshot-Endpoints:
    - Intake-Tageswerte ueber denselben Supabase-Read-Pfad wie `loadIntakeToday(...)`
    - Medication-Tagesstatus ueber denselben Read-/RPC-Pfad wie `loadMedicationForDay(...)` / `med_list_v2`
  - Ein eigener dedizierter Widget-Snapshot-Endpoint ist fuer V1 ausdruecklich nicht noetig.

##### S3.6 Vertrag fuer `Wasser-Soll`
- Finaler Beschluss:
  - `Wasser-Soll` wird in der nativen Huelle lokal berechnet.
- Begruendung:
  - rein zeitbasiert
  - keine Backend-Abhaengigkeit noetig
  - genau dieselbe Produktlogik wie im Hub
- Guardrail:
  - die native Berechnung muss dieselbe Stuetzpunkt-Tabelle und dieselben Randwerte nutzen wie MIDAS
  - keine freie Android-Eigeninterpretation der Kurve

##### S3.7 Android-Refresh-/Staleness-Vertrag
- Finaler Beschluss:
  - Android-Widgets muessen nicht dieselbe Minutengenauigkeit wie das geoeffnete Hub-Dashboard liefern.
  - Eine bewusst begrenzte Android-Staleness ist fuer V1 akzeptabel.
- Produktwahrheit:
  - Das Widget ist ein ruhiger Kompass, kein hochfrequentes Echtzeitpanel.
- Konsequenz:
  - `Wasser-Soll` darf auf Android technisch grober aktualisieren als im offenen Hub,
  - solange das Verhalten bewusst, stabil und dokumentiert bleibt.
- Der genaue Refresh-Takt wird in `S4` final festgezogen.

##### S3.8 Drift- und APK-Vertrag
- Aenderungen in MIDAS, die fuer sich allein keinen APK-Rebuild erzwingen sollen:
  - normale Web-UI-Aenderungen
  - Dashboard-Layout-Details
  - interne Hub-Refactors ohne Vertragsaenderung
- Aenderungen, die den Android-Pfad beruehren und daher ein Android-Repo-Update bzw. APK-Rebuild ausloesen koennen:
  - Aenderung der `Wasser-Soll`-Stuetzpunkt-Tabelle
  - Aenderung des Widget-Feldvertrags
  - Aenderung der Medication-Status-Mapping-Regeln
- Wichtig:
  - dieser Tradeoff wird bewusst akzeptiert und nicht wegerklaert

##### S3.9 Doku-Sync und Commit-Empfehlung
- Noch kein README-Sync noetig.
- Die Roadmap ist jetzt der aktuelle Source-of-Truth fuer den Android-Vertrag.
- Noch kein Commit noetig.
- `S3` gehoert logisch mit `S4` zusammen, weil Architekturvertrag und technischer Umsetzungsplan gemeinsam erst den eigentlichen Android-Arbeitsauftrag erzeugen.

### S4 - Technischen Umsetzungsplan fuer Widget Host, Snapshot-Pfad und Launcher finalisieren
- S4.1 Pruefen, welcher Android-Ansatz fuer die minimale Huelle am saubersten ist:
  - Widget-Host-first
  - optionaler TWA-/Launcher-Pfad
  - kein ueberfluessiger nativer Ballast
- S4.2 Final festziehen, wie der Widget-Snapshot geliefert wird:
  - direkter API-/Backend-Pfad
  - nativer lokaler Cache
  - explizite Update-Strategie
  - bewusst definierte Staleness-/Refresh-Strategie fuer `Wasser-Soll`
- S4.3 Finalen V1-Widget-Layoutvertrag fuer die erste Android-Groessenklasse definieren:
  - Reihenfolge
  - Zeilen
  - Labels
  - Oeffnungsaktion
- S4.4 Final festziehen, welche Spaeter-Pfade bewusst nicht in V1 rutschen:
  - Capture
  - Salz/Protein-Expansion
  - Appointments
  - Reminder
- S4.5 Schritt-Abnahme:
  - technischer Plan ist mit Produkt- und Architekturvertrag konsistent
- S4.6 Doku-Sync:
  - falls noetig kurze technische Notiz fuer den bevorstehenden Android-Bereich
- S4.7 Commit-Empfehlung
- Output: finaler V1-Umsetzungsplan fuer die native Shell.
- Exit-Kriterium: kein offener Implementierungsstreit mehr ueber Widget-Inhalt, Host-Mechanik oder Snapshot-Refresh.

#### S4 Ergebnisprotokoll (abgeschlossen)

##### S4.1 Finaler Android-Ansatz
- Finaler V1-Ansatz:
  - kleines natives Android-Projekt
  - echter nativer Widget-Host
  - minimaler Launcher fuer MIDAS
- Nicht V1-Kern:
  - TWA als Selbstzweck
  - WebView-App mit viel eigener UI
  - aufgeblasene native Container-Logik
- Konsequenz:
  - Android wird als Widget-Host-first gebaut
  - Launcher bleibt Zusatzfunktion, nicht Produktkern

##### S4.2 Finaler Snapshot-Lieferpfad
- Finaler Vertrag:
  - Die Android-Huelle besitzt einen kleinen nativen Sync-Pfad.
  - Dieser Sync-Pfad liest die benoetigten MIDAS-Daten authentifiziert ueber die bestehenden MIDAS-Read-Vertraege.
  - Er schreibt den letzten gueltigen `DailyWidgetState` in einen lokalen Android-Cache.
  - Das Widget rendert ausschliesslich aus diesem Cache.
- V1-Datenfluss:
  1. Android-Huelle authentifiziert sich bewusst.
  2. `Wasser (Ist)` wird ueber denselben Supabase-Read-Vertrag geholt, den MIDAS heute fuer `loadIntakeToday(...)` nutzt.
  3. `Medikation-Status` wird aus dem Medication-Tagespayload verdichtet, den MIDAS heute ueber `loadMedicationForDay(...)` / `med_list_v2` aufbaut.
  4. `Wasser-Soll` wird lokal auf dem Geraet berechnet.
  5. Der komplette `DailyWidgetState` wird lokal gespeichert.
  6. Das Widget zeigt nur diesen letzten lokalen Snapshot.
- V1-Nicht-Ziel:
  - kein neuer dedizierter Widget-Snapshot-Backend-Endpoint
  - keine neue MIDAS-Backend-Fachschicht nur fuer Android

##### S4.3 Refresh- und Staleness-Strategie
- Finaler V1-Vertrag:
  - Kein pseudo-echtzeitiges Widget.
  - Bewusster, stabiler Android-Refresh statt Hub-Minutenlogik.
- Produktziel:
  - Das Widget soll nutzbar bleiben, ohne dass MIDAS dauerhaft offen sein muss.
- V1-Refresh-Ausloeser:
  - bei erfolgreichem manuellen Oeffnen der Android-Huelle / MIDAS-Launcher-Flaeche
  - bei explizitem Hintergrund-Refresh der nativen Huelle im beschlossenen Android-Rahmen
  - bei Widget-Refresh-Event von Android, soweit das System es zulaesst
- V1-Staleness-Haltung:
  - leichte zeitliche Grobheit ist akzeptabel
  - wichtiger ist Stabilitaet als kuenstliche Live-Perfektion
- Konsequenz fuer `Wasser-Soll`:
  - Der Wert muss nicht sekundengenau oder streng minutengenau leben
  - Er soll alltagsplausibel und ruhig bleiben
- Wichtiger Wahrheitsanker:
  - Ein erster lokaler Cache-/Bridge-Pfad kann als fruehe Stufe akzeptiert werden,
  - gilt aber nicht automatisch schon als voll autonomer Zielzustand.

##### S4.4 Finaler erster Layoutvertrag
- Reihenfolge von oben nach unten:
  1. `Wasser`
  2. `Wasser-Soll`
  3. `Medikation`
- Darstellungsstil:
  - ruhige Label-/Wertstruktur
  - kein Balken
  - keine Ampel
  - keine Warnicon-Show
  - keine dichte Infowand
- Ausgangsannahme in `S4`:
  - erster Entwurf fuer eine groessere rechteckige Homescreen-Flaeche
  - kompakte Reihen statt Mini-Dashboard-Kopie
- `Medikation` zeigt nur den kompakten Status:
  - `Offen`
  - `Teilweise`
  - `Erledigt`
  - optional `Kein Plan`, falls `none`
- Oeffnungsaktion:
  - Tap auf das Widget oeffnet MIDAS ueber den minimalen Launcher-Pfad
- Wichtiger Vorbehalt:
  - konkrete Cell-Groesse und endgueltige Verdichtung werden nicht mehr abstrakt an `4x3` festgenagelt
  - reale Homescreen-Wirkung auf dem Geraet entscheidet in `S5.6`, ob das Widget visuell eher wie `4x2` oder eine andere kompaktere Raster-Nutzung wirken muss

##### S4.5 Vorlaeufiger visueller Vertrag fuer V1
- Das Widget orientiert sich visuell an den bestehenden MIDAS-Glass- und Hub-Dashboard-Flaechen, darf auf dem Homescreen aber leichter und atmosphaerischer wirken als ein In-App-Panel.
- Surface-Vertrag:
  - transparenter atmospheric-glass statt voll deckendem Schwarzblock
  - dunkler Navy-/Night-Kern nur als leichte Grundtoenung
  - subtile helle Border statt harter Outline
  - weiche Blau-/Cyan-/Magenta-Lichtschichten als MIDAS-Anmutung
  - Gold nur sehr sparsam als Akzent, nicht als Flaechenfarbe
- Wallpaper-Vertrag:
  - keine Volltransparenz, aber klar transparenter als der bisherige Block-Look
  - Lesbarkeit und Wallpaper-Toleranz gehen vor Show-Effekt
  - Ziel ist eine halbtransparente, ruhige, leicht poetische MIDAS-Surface
- Kopfzeilen-Vertrag:
  - kleine kompakte Kopfzeile statt grossem Titelblock
  - `MIDAS` klein und instrumentell
  - Datum als ruhiger Tagesanker in derselben Kopfzeile pruefen
- Typografie-Vertrag:
  - Labels klein und muted
  - Werte heller und semibold
  - keine uebergrosse Hero-Typografie
- Verdichtungs-Vertrag:
  - engeres Padding
  - kleinere vertikale Abstaende
  - Werte dichter an Labels
  - visuell eher `4x2`-Nutzwert als luftiger `4x3`-Block
- Atmosphaeren-Vertrag:
  - verspielt nur als Licht- und Tiefenwirkung
  - keine Illustrationen, keine Wetter-App-Motive, keine Cartoon-Deko
  - Daten bleiben sachlich, die Surface darf etwas lebendiger sein
- Medikation-Farbvertrag:
  - `offen` neutral bis warm, aber nicht alarmierend
  - `teilweise` ruhig und lesbar
  - `erledigt` dezent positiv
  - keine Ampel- oder Alarmshow

##### S4.6 Bewusst ausgeschlossene V1-Pfade
- kein Capture am Widget
- kein direktes Medication-Confirm
- keine `Salz`-/`Protein`-Erweiterung in V1
- keine `Appointments`-Integration
- keine Reminder-/Push-Interaktion
- keine Trend-/Analyse-Flaeche
- keine Kopie des Hub-Dashboards als kleine App

##### S4.7 Technische Vorarbeit fuer spaetere Android-Umsetzung
- Die spaetere Android-Huelle braucht mindestens:
  - Session-/Auth-Handling
  - nativen Snapshot-Store
  - kleinen Sync-Worker / Update-Pfad
  - Widget-Provider
  - Launcher-Entry
- Die spaetere MIDAS-seitige Doku muss dazu mindestens enthalten:
  - finalen `DailyWidgetState`
  - finale `Wasser-Soll`-Stuetzpunkt-Tabelle
  - Medication-Status-Mapping

##### S4.8 Doku-Sync und Commit-Empfehlung
- Noch kein weiterer Doku-Sync ausserhalb der Roadmap noetig.
- Die Roadmap ist jetzt konzeptionell geschlossen.
- Noch kein Commit noetig.
- `S4` gehoert logisch direkt vor `S5`, also vor die eigentliche Umsetzung unter `android/`.

### S5 - Umsetzung in nativer Huelle, Doku, QA und Abschluss-Sync
- S5.1 Umsetzungspfad gemaess `S3` ausfuehren:
  - isolierte native Projektstruktur unter `android/` anlegen
- S5.2 Minimalen Launcher-/Shell-Pfad fuer MIDAS im beschlossenen Zielkontext anlegen.
- S5.3 Homescreen-Widget als read-only Snapshot-Surface implementieren.
- S5.4 Ersten echten Snapshot-Pfad und lokalen Android-Cache an den beschlossenen Vertrag anbinden:
  - lokaler `DailyWidgetState`
  - lokaler `Wasser-Soll`-Helper
  - erster authentifizierter Sync-Pfad
- S5.5 V1-Refresh-/Session-Realitaet gegen das Produktziel pruefen und geradeziehen:
  - ist der aktuelle Stand schon alltagstauglich genug als passives Widget?
  - falls nein: Session-/Refresh-Pfad so nachziehen, dass das Widget nicht regelmaessig manuelle Shell-Oeffnung fuer frische Daten voraussetzt
  - falls ein `last known snapshot` als Zwischenstufe bewusst akzeptiert wird, dies explizit dokumentieren statt still vorauszusetzen
- S5.6 V1-Layout gegen das ruhige MIDAS-Dashboard-Gefuehl und echte Homescreen-Groesse pruefen.
  - reale Geraete-Groesse gegen die fruehe `4x3`-Annahme abgleichen
  - bei Bedarf auf kompaktere Raster-Nutzung / `4x2`-artige Verdichtung ziehen
  - kleine Kopfzeile mit Datum pruefen
  - MIDAS-smoked-glass Surface gegen den aktuellen Vollblock-Look ziehen
  - Padding, Zeilenabstaende und Typohierarchie auf echten Homescreen-Nutzwert optimieren
- S5.7 Android-Doku / Modul-Overview fuer die Shell anlegen:
  - echte Modul-Overview in `docs/modules/`
  - Android-/Widget-Vertrag so dokumentieren, dass spaetere Chats den Pfad ohne Reverse Engineering uebernehmen koennen
- S5.8 Relevante README-/QA-/Modul-Doku nachziehen.
- S5.9 Schritt-Abnahme und Doku-Sync:
  - Code-/Dead-Code-Pruefung, statische Validierung, Widget-Smokes
  - finalen Repo-Stand in Doku spiegeln
- S5.10 Commit-Empfehlung:
  - finalen Commit-/Merge-Vorschlag dokumentieren
- Output: native MIDAS-Huelle mit minimalem Launcher und passivem Widget-Snapshot im beschlossenen Zielkontext.
- Exit-Kriterium: Die Android-Surface reduziert echte Alltagsreibung, ohne MIDAS zu verdoppeln oder den Produktkern zu verwischen.

#### S5 Checkpoint A
- `S5.1` ist erledigt.
- Neuer Android-Bereich:
  - `C:\Users\steph\Projekte\M.I.D.A.S\android`
- Vorbereitet wurden:
  - `README.md`
  - `.gitignore`
  - `docs/Widget Contract.md`
  - `app/README.md`
- Noch bewusst nicht umgesetzt:
  - nativer Launcher
  - Widget-Provider
  - Android-Sync-Pfad
  - lokaler Snapshot-Store

#### S5 Checkpoint B
- `S5.2` ist erledigt.
- Unter `android/` existiert jetzt ein minimales natives App-Skelett mit:
  - `settings.gradle.kts`
  - Root-`build.gradle.kts`
  - `gradle.properties`
  - `gradlew` / `gradlew.bat`
  - `gradle/wrapper/*`
  - `app/build.gradle.kts`
  - `AndroidManifest.xml`
  - `MainActivity.kt`
  - einfachem Launcher-Layout
- Der aktuelle Launcher-Pfad:
  - oeffnet MIDAS ueber `Intent.ACTION_VIEW`
  - ist bewusst minimal
  - enthaelt noch kein Widget
  - enthaelt noch keinen nativen Sync oder lokalen Snapshot-Store
- Verifikation:
  - Gradle Wrapper wurde lokal generiert
  - `gradlew -p android tasks --all` lief erfolgreich mit lokalem JDK-17-Hilfspfad
  - lokales Android-SDK fuer `android-34` wurde unter `android/.tools/android-sdk` eingerichtet
  - `local.properties` verweist lokal auf diesen SDK-Pfad
  - `:app:compileDebugKotlin` lief erfolgreich
  - `:app:assembleDebug` lief erfolgreich

#### S5 Checkpoint C
- `S5.3` ist erledigt.
- Unter `android/app/src/main/...` existiert jetzt ein erster nativer Widget-Pfad mit:
  - `widget/MidasWidgetProvider.kt`
  - `res/layout/widget_midas.xml`
  - `res/xml/midas_widget_info.xml`
  - Manifest-Registrierung des Widget-Providers
- Das Widget ist bewusst read-only:
  - keine Eingaben
  - keine Confirm-Action
  - kein Reminder-Verhalten
- Der Widget-Tap fuehrt ueber `MainActivity` direkt in den MIDAS-Open-Pfad.
- Aktueller Stand:
  - statische Platzhalteranzeige
  - echte Snapshot-Daten folgen erst in `S5.4`
  - Android-Buildpfad ist fuer den aktuellen Stand lokal verifiziert

#### S5 Checkpoint D
- `S5.4` ist erledigt.
- Der Snapshot-Pfad ist jetzt an den beschlossenen Vertrag angebunden:
  - lokaler `DailyWidgetState`-Store in Android
  - lokaler `Wasser-Soll`-Helper mit derselben Stuetzpunkt-Tabelle wie MIDAS
  - Widget rendert `Wasser`, `Wasser-Soll` und `Medikation` aus dem lokalen Cache statt aus Platzhaltern
- Der Launcher-Pfad fuehrt jetzt in eine minimale native WebView-Sitzung fuer MIDAS:
  - dieselbe Huelle kann MIDAS anzeigen
  - dieselbe Huelle kann den Widget-Snapshot ueber eine JS-Bridge aus echten MIDAS-Read-Vertraegen aktualisieren
- Aktueller V1-Refresh-Stand:
  - initialer Snapshot-Versuch beim Oeffnen von MIDAS in der nativen Huelle
  - Re-Sync bei `capture:intake-changed`
  - Re-Sync bei `medication:changed`
  - Re-Sync bei `visibilitychange -> visible`
- Wichtige V1-Grenze:
  - noch kein separater Hintergrund-Worker
  - Sync passiert heute primär, wenn die native MIDAS-Huelle verwendet wird
  - `S5.4` liefert damit einen ersten echten Snapshot-Pfad, aber noch nicht automatisch den finalen autonomen Widget-Zielzustand
- Verifikation:
  - `:app:assembleDebug` lief erfolgreich mit lokalem SDK/JDK-Hilfspfad

#### S5 Checkpoint E
- `S5.5` ist erledigt.
- Die V1-Refresh-/Session-Realitaet wurde gegen das Produktziel geradegezogen:
  - Widget nutzt jetzt nicht mehr nur den Launcher-/WebView-Pfad fuer frische Daten
  - nach einmaligem Auth-/Config-Export aus der nativen MIDAS-Huelle kann Android den Snapshot periodisch nativ aktualisieren
- Technischer Zuschnitt:
  - nativer Auth-/Config-Store fuer:
    - `webhookUrl`
    - ANON-Key
    - Access-Token
    - Refresh-Token
    - `userId`
  - nativer Sync-Worker mit `WorkManager`
  - periodischer Netzwerk-Sync im Android-Rahmen
  - weiterhin kein neuer dedizierter Widget-Backend-Endpoint
- Wichtige V1-Wahrheit:
  - fuer die allererste Inbetriebnahme braucht die native Huelle einmal eine auth-faehige MIDAS-Sitzung, damit Auth-/Config-Daten exportiert werden koennen
  - danach ist das Widget nicht mehr auf regelmaessige manuelle Shell-Oeffnung fuer frische Daten angewiesen
- Erster echter Geraetebefund nach APK-Install:
  - der fruehe Widget-Entwurf wirkt auf dem Homescreen deutlich zu gross und zu luftig
  - die reine `4x3`-Ausgangsannahme ist damit fuer V1 nicht mehr ausreichend
  - fuer `S5.6` ist jetzt verbindlich:
    - kompaktere reale Raster-Nutzung pruefen
    - Datum in kleiner Kopfzeile pruefen
    - dunklen Vollblock-Look auf transparentere atmosphaerische MIDAS-Glass-Surface ziehen
- Verifikation:
  - `:app:assembleDebug` lief erfolgreich nach Einbau des nativen Sync-/Worker-Pfads

#### S5 Checkpoint F
- `S5.6` ist erledigt.
- Das Widget wurde gegen den realen Homescreen-Befund nachgeschaerft:
  - `targetCellHeight` von `3` auf `2` reduziert
  - `minHeight` deutlich reduziert
  - engeres Padding und kompaktere Zeilenabstaende
  - zunaechst kleine Kopfzeile mit Datum, danach bewusst auf einen noch ruhigeren Teststand ohne Header reduziert
  - transparente Surface ohne eigentliche Glasplatte als weiterer Homescreen-Test
  - Typografie bewusst systemnah und ohne Branding-Header
- Farb-/Typo-Vertrag im Code:
  - Labels fast-weiss statt grau
  - Werte klar weiss und semibold/bold
  - `Medikation` farblich ruhig nach Status differenziert
  - Placeholder fuer Medication kompakter auf `Lade...`
- Realwelt-Fazit zu `S5.6`:
  - der eigentliche MIDAS-Inhalt ist jetzt ruhig genug fuer den Homescreen
  - die verbleibende wahrgenommene Hoehe / der Restabstand kommt ueberwiegend aus dem Samsung-/Launcher-Raster, nicht mehr aus einem unnoetig schweren MIDAS-Container
  - weiterer Feinschliff an MIDAS allein wuerde dieses Grid-Verhalten nur begrenzt verbessern
  - eine spaetere Hybrid-Variante mit Datumsmodul bleibt als bewusster Zukunftspfad offen, ist aber nicht noetig, um `S5.6` fachlich als abgeschlossen zu werten
- Verifikation:
  - `:app:compileDebugKotlin` lief erfolgreich mit lokalem JDK-17-Hilfspfad
  - `:app:assembleDebug` lief erfolgreich mit lokalem JDK-17-Hilfspfad

#### S5 Checkpoint G
- `S5.7` ist erledigt.
- Neue Modul-Overview:
  - `docs/modules/Android Widget Module Overview.md`
- Inhaltlich festgezogen wurden dort:
  - Rolle des Android-Pfads als MIDAS-Node, nicht als Hauptsystem
  - V1-Inhalt des Widgets
  - Launcher-/WebView-Rolle
  - `DailyWidgetState`
  - Auth-/Sync-/Cache-Vertrag
  - realer Homescreen-/Samsung-Tradeoff
- Ergebnis:
  - spaetere Chats muessen den Android-Bereich nicht erst aus dem Dateibaum rekonstruieren
  - der Widget-/Shell-Vertrag ist jetzt im selben Doku-Stil greifbar wie die anderen MIDAS-Module

#### S5 Checkpoint H
- `S5.8` ist erledigt.
- Relevante Doku wurde auf den Android-Node-Stand gezogen:
  - `README.md`
  - `docs/QA_CHECKS.md`
  - `docs/modules/Android Widget Module Overview.md`
- In `README.md` ist jetzt sauber festgezogen:
  - MIDAS bleibt browser-first PWA
  - die native Android-Huelle ist nur ein schmaler Widget-/Launcher-Node
  - `android/` ist Teil der Repo-Karte
  - die Android-Modul-Overview ist Teil der Modul-/Doku-Karte
- In `docs/QA_CHECKS.md` existiert jetzt eine eigene Android-Phase fuer:
  - APK-/Launcher-Smoke
  - Widget-Platzierung
  - ersten auth-faehigen Bridge-Setup
  - read-only-/Refresh-Vertrag

#### S5 Checkpoint I
- `S5.9` ist erledigt.
- Schritt-Abnahme / statische Validierung:
  - `:app:compileDebugKotlin` lief erfolgreich
  - `:app:assembleDebug` lief erfolgreich
  - `git diff --check` ist sauber
- Fachlicher Abnahmebefund:
  - Widget bleibt read-only
  - MIDAS bleibt Hauptsystem und Source of Truth
  - der aktuelle V1-Look ist fuer den Homescreen ruhig genug
  - verbleibende vertikale Restabstaende sind bewusst als Launcher-/Samsung-Tradeoff akzeptiert

#### S5 Checkpoint J
- `S5.10` ist erledigt.
- Commit-Empfehlung:
  - Ein gemeinsamer Commit fuer `android/`, `README.md`, `docs/QA_CHECKS.md`, `docs/modules/Android Widget Module Overview.md` und `docs/MIDAS Android Widget & Shell Roadmap.md` ist jetzt sinnvoll.
  - Der Stand ist fachlich geschlossen genug fuer einen ersten echten V1-Commit.
  - Die Roadmap kann nach dem Commit auf Wunsch wie die anderen abgeschlossenen Arbeitsroadmaps archiviert werden.

## Smokechecks / Regression (Definition)
- Es liegt keine Android-/Gradle-/TWA-Datei ungeordnet im Repo-Root.
- Das Widget ist read-only und fuehrt keine versteckten Writes aus.
- `Wasser (Ist)` und `Wasser-Soll` sind im Widget klar und ruhig sichtbar.
- Das Widget oeffnet MIDAS, wenn die Oeffnungsaktion ausgeloest wird.
- Die Roadmap dokumentiert ehrlich, ob das Widget echte Off-App-Aktualisierung liefert oder aktuell nur einen `last known snapshot`.
- V1 enthaelt keine schleichenden Analyse-, Reminder- oder Capture-Features.
- Snapshot-Werte und Doku sprechen denselben Vertrag.

## Abnahmekriterien
- Das Widget ist eine frictionless MIDAS-Surface, keine zweite App.
- MIDAS bleibt fachliche Source of Truth.
- Android-Huelle und Web-Kern sind sauber getrennt.
- Der akzeptierte V1-Nutzwert ist explizit beschrieben:
  - entweder echter passiver Off-App-Refresh im beschlossenen Rahmen
  - oder bewusst dokumentierter `last known snapshot` als Zwischenstufe
- Die erste Version ist klein genug, um im Alltag ehrlich evaluiert werden zu koennen.

## Risiken
- Zu fruehe Aufnahme von `Salz`, `Protein`, `Appointments` oder Capture-Interaktion koennte V1 ueberladen.
- Ein unsauberer Snapshot-Vertrag koennte zu Drift zwischen MIDAS und Widget fuehren.
- Android-Widget-Refresh kann zeitbasierte Werte wie `Wasser-Soll` real grober aktualisieren als der offene Hub; dieser Unterschied muss bewusst akzeptiert oder technisch sauber abgefangen werden.
- Ein Widget, das fuer frische Daten zu oft manuelle Shell-Oeffnung braucht, wuerde den eigentlichen Reibungsgewinn nur teilweise einloesen.
- Falsch geschnittene Android-Ablage koennte das Repo unnoetig verschmutzen.
- Ein zu starkes TWA-/Launcher-Denken koennte das eigentliche Produktziel `Widget` verwischen.
