# Hydration Target Dashboard Roadmap (DONE)

## Ziel (klar und pruefbar)
Im Hub-Dashboard soll im bestehenden Pill-Block direkt nach `WASSER` ein zusaetzlicher, ruhiger Orientierungseintrag `WASSER-SOLL` erscheinen, der rein lokal im Frontend einen zeitbasierten Referenzwert fuer einen sinnvollen Trinkverlauf anzeigt.

Pruefbare Zieldefinition:
- Das Dashboard zeigt zusaetzlich zu `WASSER` eine neue Zeile `WASSER-SOLL`.
- Der Sollwert wird rein lokal im Frontend berechnet.
- Vor `07:00` ist der Sollwert `0 ml`.
- Ab `19:30` ist der Sollwert `2000 ml`.
- Dazwischen folgt der Wert einer sanften, nicht-linearen Tageskurve mit spaeterem Plateau.
- Die Anzeige bleibt rein informativ:
  - keine Bewertung
  - kein Delta
  - kein Reminder
  - kein Incident
- Dashboard-Optik und Interaktionsmodell bleiben unveraendert ruhig.

## Scope
- Neuer Dashboard-Eintrag `WASSER-SOLL` im bestehenden Pill-Block direkt nach `WASSER`.
- Kleine lokale Helper-Logik fuer den zeitbasierten Hydration-Referenzwert.
- Render-/Refresh-Anbindung im bestehenden Dashboard-Flow.
- Ausgabe als ganze `ml`.
- Doku-, QA- und Vertrags-Sync fuer das neue Dashboard-Subfeature.

## Not in Scope
- Balken, Charts oder grafische Vergleichselemente.
- Defizit-/Ueberschuss-Anzeige gegen den Ist-Wert.
- Ampel, Farblogik oder Wertung wie `zu wenig`.
- Reminder, Push, Incident oder Assistant-Verhalten.
- Persistenz, Backend, Supabase, Edge Function, Cron.
- Medizinische Individualisierung nach Alter, Gewicht oder Tagesform.

## Relevante Referenzen (Code)
- `app/modules/hub/index.js`
- `app/styles/hub.css`
- `index.html`
- `app/modules/intake-stack/intake/index.js`
- `app/core/capture-globals.js`

## Relevante Referenzen (Doku)
- `docs/modules/Hub Module Overview.md`
- `docs/modules/Intake Module Overview.md`
- `docs/QA_CHECKS.md`
- `README.md`

## Guardrails
- `WASSER-SOLL` ist nur Orientierung, kein Verhaltensdruck.
- Das Feature darf sich nicht wie ein versteckter Reminder anfuehlen.
- Keine Formulierungen oder UI-Signale im Sinne von:
  - `du bist hinten`
  - `du musst noch`
  - `Defizit`
  - `Warnung`
- Der neue Eintrag muss sich wie ein natuerlicher Teil des bestehenden Dashboards anfuehlen.
- Die Berechnungslogik muss spaeter konfigurierbar erweiterbar sein, darf in V1 aber hart codiert bleiben.

## Architektur-Constraints
- Keine neue Persistenz.
- Keine Backend-Abhaengigkeit.
- Keine Drift zwischen Dashboard-Text, Berechnungslogik und Dokumentation.
- Tagesziel, Start- und Endzeit muessen zentral lesbar und leicht aenderbar definiert sein.
- Die Logik darf nicht an Arbeitszeit, Fruehschicht oder Homeoffice gekoppelt werden.
- `WASSER-SOLL` bezieht sich immer auf den lokalen heutigen Kalendertag und die lokale Geraetezeit.
- Die Anzeige darf nicht von historischen Capture-Datumsfiltern oder anderen Date-Pickern im UI beeinflusst werden.
- Zeitbasierter Refresh soll nur so weit laufen, wie es fuer die sichtbare Dashboard-Anzeige noetig ist; kein unnoetiger Hintergrund-Tick.
- Die Hydration-Logik wird als eigenstaendiger, kleiner Helper gekapselt, nicht als Inline-Code im Hub-Render.

## Tool Permissions
Allowed:
- Hub-Dashboard-Struktur, Styles und lokale Helper-Logik innerhalb des Scopes anpassen.
- Doku, QA und eine kleine neue Modul-Overview fuer das Subfeature anlegen.
- Lokale Syntaxchecks, Repo-Scans und Render-Smokes vorbereiten.

Forbidden:
- Intake-Fachlogik neu schneiden.
- Reminder-/Push-Logik einfuehren.
- Neue Dependencies oder ein separates Chart-/Widget-System einfuehren.

## Execution Mode
- Sequenziell arbeiten (`S1` bis `S4`).
- `S1` klaert den aktuellen Dashboard-Ist-Stand.
- `S2` fixiert den Produktvertrag fuer `WASSER-SOLL`.
- `S3` fixiert Berechnungslogik, Kurvenvertrag und UI-Integration.
- Erst `S4` ist die konkrete Umsetzung im Repo.
- Nach jedem Schritt Statusmatrix aktualisieren.
- Nach jedem Schritt mindestens ein Check: Contract-Review, Repo-Scan, Syntaxcheck oder Smoke-Definition.
- Jeder Hauptschritt endet mit denselben operativen Pflichtpunkten:
  - Schritt-Abnahme
  - Doku-Sync
  - Commit-Empfehlung

## Vorgeschlagene fachliche Default-Richtung
Hydration Target V1:
- persoenlicher Referenzwert, kein medizinisches Regelwerk
- Tagesziel: `2000 ml`
- Start: `07:00`
- Ziel erreicht: `19:30`
- Tageskontext:
  - immer `heute`
  - immer lokale Uhrzeit des Geraets
  - unabhaengig von Arbeitsbeginn oder geoeffneten historischen Capture-Ansichten
- Kurvencharakter:
  - morgens sanfter Einstieg
  - tagsueber Hauptlast
  - ab spaeterem Nachmittag flacher Auslauf
- UI-Platzierung:
  - innerhalb der bestehenden Dashboard-Pill-Zeilenlogik
  - als normale weitere Pill direkt nach `WASSER`
  - Reihenfolge im Pill-Block:
    - `WASSER`
    - `WASSER-SOLL`
    - `SALZ`
    - `PROTEIN`
  - keine Sonderkarte, keine Sonderzeile ausserhalb des bestehenden Pill-Blocks

Referenztabelle fuer das Zielbild:

| Uhrzeit | Soll bis dahin |
|---|---|
| `07:00` | `0 ml` |
| `08:00` | `180 ml` |
| `09:00` | `350 ml` |
| `10:00` | `530 ml` |
| `11:00` | `720 ml` |
| `12:00` | `920 ml` |
| `13:00` | `1130 ml` |
| `14:00` | `1340 ml` |
| `15:00` | `1540 ml` |
| `16:00` | `1710 ml` |
| `17:00` | `1850 ml` |
| `18:00` | `1940 ml` |
| `19:00` | `1985 ml` |
| `19:30` | `2000 ml` |

Hinweis:
- Diese Tabelle ist das fachliche Zielbild fuer `S2`/`S3`.
- Die konkrete technische Funktion darf spaeter leichtgewichtig approximieren, muss sich aber an diesem Charakter orientieren.

## Statusmatrix
| ID | Schritt | Status | Ergebnis/Notiz |
|---|---|---|---|
| S1 | Ist-Analyse des aktuellen Dashboard- und Wasser-Kontexts | DONE | `S1.1` bis `S1.6` abgeschlossen: Das Dashboard nutzt fuer `WASSER` denselben Assistant-/Dashboard-Kontext wie `SALZ` und `PROTEIN`, die aktuelle Anzeige sitzt im bestehenden Pill-Block `#hubDashboardIntakePills`, und Refreshes laufen heute ueber `assistant:init`, `capture:intake-changed`, `appointments:changed` und `profile:changed`. Das Layout ist auf Desktop ein flex-wrap-Pill-Block und nicht ein starres Grid; die neue Anzeige muss daher als normale weitere Pill integriert werden. |
| S2 | Produktvertrag fuer `WASSER-SOLL` finalisieren | DONE | `S2.1` bis `S2.7` abgeschlossen: `WASSER-SOLL` ist jetzt als ruhiger, persoenlicher Referenzwert ohne Bewertungs- oder Reminder-Charakter festgezogen, die Platzierung im bestehenden Pill-Block ist final, der V1-Zeitvertrag lautet `2000 ml` von `07:00` bis `19:30`, und der Kurvencharakter ist als sanfter Einstieg mit tagsueberer Hauptlast und spaetem Plateau beschlossen. |
| S3 | Berechnungs-, Kurven- und UI-Vertrag festziehen | DONE | `S3.1` bis `S3.8` abgeschlossen: Die Referenztabelle ist als fachliche Source of Truth mit linearer Interpolation zwischen benachbarten Stuetzpunkten beschlossen, Rundung und harte Randwerte sind final, der Refresh-Vertrag ist auf Dashboard-Open, bestehende Intake-Refreshes, `visibilitychange -> visible` und einen leichten Minutentakt nur bei offenem Dashboard festgezogen, und die Logik wird als kleiner eigenstaendiger Helper statt Inline-Code im Hub-Render gekapselt. |
| S4 | Umsetzung in Repo, Doku, QA und Abschluss-Sync | DONE | `S4.1` bis `S4.10` abgeschlossen: Das Dashboard-Markup in `index.html` traegt jetzt den neuen Pill-Eintrag `WASSER-SOLL` direkt nach `WASSER`, in `app/modules/hub/index.js` existiert der gekapselte Hydration-Helper mit finaler Stuetzpunkt-Tabelle und linearer Interpolation, der neue Dashboard-Wert ist an den bestehenden Hub-Render sowie den vereinbarten Refresh-Pfad fuer Open, `visibilitychange` und den leichten Minutentakt nur bei offenem Dashboard angebunden, der bestehende Hub-Stil traegt den zusaetzlichen Pill-Eintrag auf Desktop und Mobile ohne eigenen CSS-Sonderpfad, und Doku/QA spiegeln nun denselben finalen Vertrag. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Wiederkehrende Abschluss-Substeps pro Hauptschritt
Diese Abschluss-Substeps gelten fuer jeden Hauptschritt `S1` bis `S4` und sollen jeweils als letzte Substeps mitgefuehrt werden.

- `letzter fachlicher Substep + 1: Schritt-Abnahme`
  - Ergebnis gegen den Ziel-Contract des Schritts pruefen
  - betroffene Dateien auf Drift und potenziellen Dead Code pruefen
  - gezielte Contract-/Syntax-/Smoke-Checks fuer den Schritt ausfuehren
- `danach: Doku-Sync`
  - betroffene Modul-Overviews sofort aktualisieren, wenn sich Verhalten oder Guardrails geaendert haben
  - bei Bedarf auch `docs/QA_CHECKS.md` und `README.md` nachziehen
- `danach: Commit-Empfehlung`
  - explizit festhalten, ob nach dem Schritt ein Commit sinnvoll ist
  - wenn `kein Commit`, kurz begruenden, was noch logisch zusammengehoert

## Schritte + Subschritte

### S1 - Ist-Analyse des aktuellen Dashboard- und Wasser-Kontexts
- S1.1 Das bestehende Dashboard-Markup und die aktuelle Reihenfolge der Zeilen exakt mappen.
- S1.2 Den bestehenden Wasser-Istwert-Pfad im Dashboard identifizieren:
  - Quelle
  - Render-Zeitpunkt
  - Refresh-Trigger
- S1.3 Pruefen, welche Hub-/Dashboard-Helfer heute schon Intake- oder Kontextwerte nachziehen.
- S1.4 Den aktuellen CSS-/Layoutvertrag des Dashboards aufnehmen:
  - Desktop
  - Mobile
  - Zeilenstruktur
- S1.5 Schritt-Abnahme:
  - Repo-Scan auf Dashboard-Wasserpfad und Render-Hooks
  - Ergebnis mit Dateireferenzen und Risikostellen festhalten
- S1.6 Doku-Sync:
  - nur falls die Hub- oder Intake-Doku den aktuellen Dashboard-Vertrag unscharf beschreibt
- S1.7 Commit-Empfehlung:
  - festhalten, ob reine Analyse bereits commit-wuerdig ist oder mit `S2` gebuendelt wird
- Output: belastbare Karte des aktuellen Dashboard-Pfads fuer `WASSER`.
- Exit-Kriterium: kein unbekannter Render- oder Refresh-Pfad fuer den neuen Dashboard-Eintrag mehr offen.

#### S1 Ergebnisprotokoll (abgeschlossen)

##### S1.1 Dashboard-Markup und aktuelle Reihenfolge der Eintraege
- `index.html`
  - Das Hub-Dashboard lebt in `#hubContextDashboard`.
  - Der obere Werteblock fuer Intake liegt in `#hubDashboardIntakePills`.
  - Aktuelle Reihenfolge im Pill-Block:
    - `WASSER`
    - `SALZ`
    - `PROTEIN`
  - Danach folgen getrennt:
    - `.hub-dashboard-grid` fuer `Protein-Ziel` und `CKD`
    - `#hubDashboardAppointments`
    - `#hubDashboardExpandable` fuer `Restbudget`
- Konsequenz:
  - `WASSER-SOLL` gehoert nicht in die Kontext-Grid-Zeilen
  - sondern in den bestehenden Pill-Block

##### S1.2 Bestehender Wasser-Istwert-Pfad im Dashboard
- `app/modules/hub/index.js`
  - `setupHubDashboard(...)` baut fuer den Dashboard-Pill-Block Referenzen ueber `buildPillRef(...)`.
  - Der Dashboard-Wasserwert ist kein eigener Sonderpfad, sondern Teil von:
    - `hubDashboardCtrl.pills.water`
  - Die Anzeige selbst wird in `renderAssistantIntakeTotals(snapshot)` gesetzt.
  - Der Wassertext lautet dort aktuell:
    - bei `logged=true`: `${Math.round(Number(totals.water_ml) || 0)} ml`
    - sonst `-- ml`
- Konsequenz:
  - `WASSER-SOLL` sollte am selben Dashboard-/Assistant-Kontextpfad andocken
  - nicht an einer zweiten unabhängigen Render-Logik

##### S1.3 Bestehende Render- und Refresh-Hooks
- `app/modules/hub/index.js`
  - `refreshAssistantContext(...)` ist der zentrale Refresh-Pfad fuer:
    - Intake-Snapshot
    - Termine
    - Profil-Kontext
  - `renderAssistantIntakeTotals(snapshot)` aktualisiert sowohl:
    - Assistant-Panel
    - Hub-Dashboard
  - Das Dashboard hoert explizit auf `capture:intake-changed`:
    - `applyAssistantIntakeSnapshot(intakeSnapshot)`
    - danach `refreshAssistantContext({ reason: 'capture:intake-changed' })`
  - Weitere Initial-/Refresh-Pfade:
    - `assistant:init`
    - `appointments:changed`
    - `profile:changed`
- Konsequenz:
  - der neue `WASSER-SOLL`-Pfad muss in diese bestehende Refresh-Architektur passen
  - ohne eine zweite, driftende Dashboard-Sonderaktualisierung zu bauen

##### S1.4 Aktueller CSS-/Layoutvertrag des Dashboards
- `app/styles/hub.css`
  - `.assistant-pills` ist ein flex-wrap-Container mit `gap: 10px`
  - `.assistant-pill` ist ein generischer kompakter Wertetrager mit:
    - `flex: 1 1 120px`
    - gleichem Label-/Value-Look wie die bestehende Wasser-/Salz-/Protein-Anzeige
  - Das eigentliche Dashboard-Grid `.hub-dashboard-grid` wird heute nur fuer:
    - `Protein-Ziel`
    - `CKD`
    genutzt
  - Mobile:
    - das Grid wird einspaltig
    - der Pill-Block bleibt als wrap-Stack nutzbar
- Konsequenz:
  - `WASSER-SOLL` soll als normale `assistant-pill` umgesetzt werden
  - nicht als neuer Grid-Eintrag oder als Spezialkarte

##### S1.5 Schritt-Abnahme: Repo-Scan und Risikostellen
- Repo-lokal belastbar identifiziert:
  - Markup:
    - `index.html`
  - Hub-Refs / Render:
    - `app/modules/hub/index.js`
  - Dashboard-/Pill-Styling:
    - `app/styles/hub.css`
  - angrenzender Intake-Kontext:
    - `docs/modules/Intake Module Overview.md`
    - `docs/modules/Hub Module Overview.md`
- Hauptrisiken fuer spaeteren Umbau:
  - eine falsche Platzierung im Grid statt im Pill-Block
  - eine zweite separate Dashboard-Refresh-Logik statt Nutzung des bestehenden Context-Refreshes
  - Verwechslung von `WASSER-SOLL` mit einem Intake-Wert statt einem rein lokalen Zeit-Referenzwert

##### S1.6 Doku-Sync
- Die bestehende Doku ist fuer `S1` hinreichend konsistent:
  - `docs/modules/Hub Module Overview.md` beschreibt das Dashboard bereits als datenorientierten Reveal-Surface
  - `docs/modules/Intake Module Overview.md` beschreibt die Tageswerte und den Hub-Kontext ausreichend
- Konsequenz:
  - kein sofortiger Doku-Eingriff in `S1` noetig
  - Doku-Sync bleibt bewusst fuer `S3`/`S4`

##### S1.7 Commit-Empfehlung
- Noch kein eigener Commit sinnvoll.
- Begruendung:
  - `S1` ist reine Analyse im Arbeitsdokument
  - logisch sinnvoller Commit-Block startet erst mit dem finalisierten Produkt- und Berechnungsvertrag in `S2`/`S3`

### S2 - Produktvertrag fuer `WASSER-SOLL` finalisieren
- S2.1 Den finalen Zwecktext festziehen:
  - `WASSER-SOLL` ist ein persoenlicher, zeitbasierter Referenzwert
  - keine Bewertung
  - kein Reminder
- S2.2 Platzierung und Reihenfolge final festziehen:
  - innerhalb von `#hubDashboardIntakePills`
  - direkt nach `WASSER`
  - vor `SALZ`
  - als normale `assistant-pill`, nicht als separate Sonderkomponente
- S2.3 Finalen V1-Zeitvertrag beschliessen:
  - Tagesziel `2000 ml`
  - Start `07:00`
  - Ende `19:30`
- S2.4 Den gewuenschten Kurvencharakter final benennen:
  - keine harte lineare Verteilung
  - sanfter Einstieg
  - tagsueber Hauptlast
  - spaeteres Plateau
- S2.5 Guardrails textlich finalisieren:
  - keine Defizitsprache
  - keine Ampel
  - keine Auto-Hinweise
- S2.6 Schritt-Abnahme:
  - Produktvertrag auf MIDAS-Konformitaet pruefen
  - Konflikte mit Intake-, Push- oder Trendpilot-Charakter ausschliessen
- S2.7 Doku-Sync:
  - falls noetig Kurzvermerk in README / angrenzenden Modulen
- S2.8 Commit-Empfehlung
- Output: finaler Produktvertrag fuer V1.
- Exit-Kriterium: kein offener Produktstreit mehr ueber Zweck, Platzierung oder Schaerfegrad.

#### S2 Ergebnisprotokoll (abgeschlossen)

##### S2.1 Finaler Zwecktext
- `WASSER-SOLL` ist ein persoenlicher, zeitbasierter Referenzwert fuer einen physiologisch und alltagspraktisch sinnvollen Trinkverlauf zwischen `07:00` und `19:30`.
- Das Feature dient nur der Orientierung.
- Es hat in `V1` bewusst keinen:
  - Bewertungscharakter
  - Reminder-Charakter
  - Incident-Charakter
- Produktwahrheit:
  - MIDAS zeigt damit nicht, was `muss`
  - sondern nur, wo ein sinnvoller Tagesstand ungefaehr liegen duerfte

##### S2.2 Platzierung und Reihenfolge
- Die Platzierung ist final beschlossen:
  - im bestehenden Pill-Block `#hubDashboardIntakePills`
  - direkt nach `WASSER`
  - vor `SALZ`
- Finaler Reihenfolgevertrag fuer den Pill-Block:
  - `WASSER`
  - `WASSER-SOLL`
  - `SALZ`
  - `PROTEIN`
- `WASSER-SOLL` ist damit:
  - keine Sonderkarte
  - keine Kontext-Grid-Zeile
  - kein Overlay

##### S2.3 Finaler V1-Zeitvertrag
- `WASSER-SOLL` basiert in `V1` auf:
  - Tagesziel `2000 ml`
  - Start `07:00`
  - Ziel erreicht `19:30`
- Der Zeitvertrag ist bewusst:
  - stabil
  - persoenlich
  - nicht an Fruehschicht, Homeoffice oder einen spaeteren Pensionsalltag gekoppelt
- Produktentscheidung:
  - der Referenzwert beschreibt einen sinnvollen Tagesrahmen
  - nicht den tatsaechlichen Beginn des ersten Trinkens

##### S2.4 Finaler Kurvencharakter
- Der Kurvencharakter ist final beschlossen als:
  - sanfter Einstieg am Morgen
  - Hauptlast tagsueber
  - spaeteres Plateau am Abend
- Ausdruecklich nicht gewollt:
  - harte lineare Verteilung
  - aggressives Front-Loading
  - spaetes Aufholgefuehl kurz vor Tagesende
- Die Referenztabelle bleibt dafuer die fachliche Leitplanke.

##### S2.5 Finalisierte Guardrails
- `WASSER-SOLL` darf sich sprachlich oder visuell nicht wie ein versteckter Zeigefinger anfuehlen.
- Nicht gewollt sind:
  - Defizitsprache
  - Ampel- oder Warnlogik
  - automatische Hinweise
  - stiller Uebergang zu Reminder-Verhalten
- Gewollt ist:
  - ruhige Orientierung
  - ein Klick weniger ins Intake-Panel
  - MIDAS-konforme, unaufdringliche Integration

##### S2.6 Schritt-Abnahme
- Der Produktvertrag ist mit den MIDAS-Prinzipien konsistent:
  - alltagstauglich statt feature-lastig
  - keine Push-/Reminder-Schaerfe
  - keine Vermischung mit Trendpilot oder Incident-Logik
- Konflikte mit bestehenden Modulen sind fachlich ausgeschlossen:
  - Intake bleibt Source of Truth fuer Ist-Werte
  - Hub bleibt Orchestrator der Anzeige
  - Push/Incidents bleiben unberuehrt

##### S2.7 Doku-Sync
- Fuer `S2` ist noch kein sofortiger Doku-Eingriff ausserhalb der Arbeits-Roadmap noetig.
- Konsequenz:
  - README und Modul-Overviews bleiben bis `S3`/`S4` unveraendert
  - der finale Produktvertrag ist zunaechst in dieser Arbeits-Roadmap sauber festgezogen

##### S2.8 Commit-Empfehlung
- Noch kein eigener Commit sinnvoll.
- Begruendung:
  - `S2` ist zwar fachlich final, aber `S3` schliesst den technischen Vertrag direkt daran an
  - sinnvoller Commit-Block startet erst mit geschlossenem Berechnungs- und UI-Vertrag


### S3 - Berechnungs-, Kurven- und UI-Vertrag festziehen
- S3.1 Final festziehen, dass die Referenztabelle ueber feste Stuetzwert-Interpolation umgesetzt wird:
  - keine freie mathematische Kurve als primaere Source of Truth
  - die Tabelle ist der fachliche Vertrag
  - zwischen den Stuetzwerten wird leichtgewichtig lokal linear interpoliert
  - Interpolation erfolgt nur zwischen zwei benachbarten Stuetzwerten
  - keine zusaetzliche Glaettung oder Kurvenfunktion darueber hinaus
- S3.2 Den technischen Vertragsstil festziehen:
  - deterministisch
  - leichtgewichtig
  - keine Persistenz
  - keine externe Datenquelle
- S3.3 Final definieren, wie gerundet wird:
  - ganzzahlige `ml`
  - vor Start hart `0`
  - nach Ende hart `2000`
- S3.4 Refresh-Vertrag festziehen:
  - Wert wird beim Dashboard-Open berechnet
  - Wert wird bei normalen Intake-Refreshes neu berechnet
  - Wert aktualisiert sich waehrend offenem Dashboard in einem leichten Minutentakt
  - zusaetzlich Recalc bei `visibilitychange -> visible`
  - kein dauerhafter Hintergrund-Tick, wenn das Dashboard geschlossen ist
- S3.5 UI-Vertrag festziehen:
  - reine Textzeile
  - im bestehenden Pill-Stil
  - kein Balken
  - keine Zusatzfarbe
  - keine Sekundaerinfo
- S3.6 Doku-Vertrag festziehen:
  - eigene kleine Modul-Overview `Hydration Target Module Overview.md`
  - Hub-/Intake-Doku nur soweit noetig nachziehen
- S3.7 Schritt-Abnahme:
  - technischer Vertrag ist ohne Reminder-/Incident-Drift geschlossen
- S3.8 Doku-Sync:
  - Vertragsstand im Arbeitsdokument konsistent halten
- S3.9 Commit-Empfehlung
- Output: finaler Berechnungs- und UI-Vertrag fuer die spaetere Umsetzung.
- Exit-Kriterium: kein offener Streit mehr ueber Kurvenform, Rundung oder Dashboard-Darstellung.

#### S3 Ergebnisprotokoll (abgeschlossen)

##### S3.1 Finaler Berechnungsvertrag
- Die Referenztabelle ist fuer `V1` die fachliche Source of Truth.
- Technische Umsetzung:
  - feste Stuetzpunkte gemaess Tabelle
  - lineare Interpolation nur zwischen zwei benachbarten Stuetzpunkten
  - keine zusaetzliche Glaettung
  - keine zweite Kurvenfunktion ueber der Tabelle
- Bewusste Produktentscheidung:
  - nicht `easing auf easing`
  - nicht `noch smoother`
  - nicht kreative mathematische Neuinterpretation der Tabelle

##### S3.2 Technischer Vertragsstil
- Die Berechnung bleibt:
  - deterministisch
  - leichtgewichtig
  - rein lokal
  - ohne Persistenz
  - ohne externe Datenquelle
- `WASSER-SOLL` ist damit kein Intake-Datenwert, sondern ein lokaler Zeit-Referenzwert.

##### S3.3 Rundung und Randwerte
- Vor `07:00` gilt hart:
  - `0 ml`
- Ab `19:30` gilt hart:
  - `2000 ml`
- Zwischenwerte werden auf ganze `ml` ausgegeben.
- Die Ausgabe folgt damit einem einfachen, stabilen Nutzervertrag:
  - keine Nachkommastellen
  - keine versteckte Sekundaeranzeige

##### S3.4 Finaler Refresh-Vertrag
- Der Hydration-Sollwert wird neu berechnet:
  - beim Dashboard-Open
  - bei normalen Intake-Refreshes / Intake-Snapshot-Updates
  - bei `visibilitychange -> visible`
  - waehrend offenem Dashboard in einem leichten Minutentakt
- Ausdruecklich nicht gewollt:
  - dauerhafter Hintergrund-Tick bei geschlossenem Dashboard
  - zweite parallele Refresh-Architektur neben dem bestehenden Hub-/Assistant-Kontext
- Konsequenz:
  - das Feature bleibt aktuell genug, ohne den Hub unnötig zu belasten

##### S3.5 Finaler UI-Vertrag
- `WASSER-SOLL` bleibt:
  - reine Textanzeige
  - im bestehenden `assistant-pill`-Stil
  - ohne Balken
  - ohne Zusatzfarbe
  - ohne Sekundaerinfo
- Produktwirkung:
  - ruhiger Dashboard-Eintrag
  - keine Wertung
  - kein visuelles Alarmmoment

##### S3.6 Helper-/Kapselungsvertrag
- Die Hydration-Logik wird als kleiner eigenstaendiger Helper gekapselt.
- Ausdruecklich nicht gewollt:
  - Inline-Berechnung direkt im Hub-Render
  - mehrfach kopierte Logik an verschiedenen Stellen
- Produkt- und Architekturvorteil:
  - spaetere Wiederverwendung fuer eine moegliche `V2`
  - saubere Lesbarkeit
  - geringere Drift

##### S3.7 Doku-Vertrag
- Fuer die spaetere Umsetzung ist beschlossen:
  - eigene kleine Modul-Overview `docs/modules/Hydration Target Module Overview.md`
  - Hub-/Intake-Doku nur gezielt nachziehen
- In `S3` selbst bleibt der Vertragsstand in dieser Arbeits-Roadmap die Source of Truth.

##### S3.8 Schritt-Abnahme
- Der technische Vertrag ist jetzt ohne Reminder-/Incident-Drift geschlossen.
- Offene Punkte aus frueheren Reviews sind damit geklaert:
  - Platzierung eindeutig
  - Tageskontext eindeutig
  - Refresh eindeutig
  - Interpolation eindeutig
  - Helper-Kapselung eindeutig

##### S3.9 Commit-Empfehlung
- Noch kein eigener Commit sinnvoll.
- Begruendung:
  - `S3` schliesst den Vertrag
  - der logisch sinnvolle Commit-Block beginnt mit `S4`, wenn Code, Doku und QA zusammen umgesetzt werden

#### S4 Checkpoint A - Dashboard-Markup vorbereitet
- Status:
  - `S4.1` ist im Repo umgesetzt.
  - `S4.2` bis `S4.10` bleiben bewusst offen.
- Umgesetzt in `index.html`:
  - Im bestehenden Dashboard-Pill-Block `#hubDashboardIntakePills` existiert jetzt direkt nach `WASSER` ein neuer `assistant-pill`-Eintrag:
    - `data-pill="water-target"`
    - Label `Wasser-Soll`
    - Placeholder `-- ml`
- Produktwirkung:
  - Die Platzierung ist jetzt strukturell fest im DOM verankert.
  - Der Eintrag ist noch bewusst passiv:
    - keine Berechnung
    - keine Render-Anbindung
    - kein eigener Stilpfad
- Validierungsstand:
  - Markup-Read gegen den finalen Platzierungsvertrag ist erfolgt.
  - Laufzeitlogik fuer den neuen Eintrag folgt erst in `S4.2` / `S4.3`.

#### S4 Checkpoint B - Hydration-Helper gekapselt
- Status:
  - `S4.2` ist im Repo umgesetzt.
  - `S4.3` bis `S4.10` bleiben bewusst offen.
- Umgesetzt in `app/modules/hub/index.js`:
  - zentrale Konstante:
    - `HYDRATION_TARGET_TOTAL_ML = 2000`
  - finale Stuetzpunkt-Tabelle gemaess Roadmap:
    - `HYDRATION_TARGET_STOPS`
  - kleine gekapselte Helper:
    - `getMinutesSinceMidnight(...)`
    - `getHydrationTargetMl(...)`
- Technischer Vertragsstand:
  - vor `07:00` hart `0`
  - ab `19:30` hart `2000`
  - dazwischen lineare Interpolation nur zwischen benachbarten Stuetzpunkten
  - keine zusaetzliche Glaettung oder freie Kurvenfunktion
- Bewusste Grenze:
  - der Helper ist noch nicht an den Dashboard-Render angebunden
  - `WASSER-SOLL` zeigt deshalb weiter nur den Placeholder `-- ml`
- Validierungsstand:
  - `node --check app/modules/hub/index.js` erfolgreich

#### S4 Checkpoint C - Dashboard-Render und Refresh angebunden
- Status:
  - `S4.3` ist im Repo umgesetzt.
  - `S4.4` bis `S4.10` bleiben bewusst offen.
- Umgesetzt in `app/modules/hub/index.js`:
  - der Dashboard-Controller kennt jetzt den neuen Pill-Ref:
    - `hubDashboardCtrl.pills.waterTarget`
  - der lokale Render-Pfad ist angebunden:
    - `renderDashboardHydrationTarget(...)`
  - der Sollwert wird jetzt neu gesetzt:
    - beim Setup des Hub-Dashboards
    - bei den normalen Intake-Renderpfaden
    - beim Dashboard-Open
    - bei `visibilitychange -> visible`
  - waehrend offenem Dashboard laeuft jetzt der vereinbarte leichte Minutentakt:
    - Start bei `openDashboard()`
    - Stop bei `closeDashboard()`
    - kein Tick bei geschlossenem Dashboard
- Produktwirkung:
  - `WASSER-SOLL` ist jetzt im Dashboard sichtbar und lebt zeitbasiert mit
  - ohne neue Persistenz
  - ohne Backend
  - ohne Reminder-/Incident-Logik
- Validierungsstand:
  - `node --check app/modules/hub/index.js` erfolgreich

#### S4 Checkpoint D - Desktop- und Mobile-Layout validiert
- Status:
  - `S4.4` ist abgeschlossen.
  - `S4.5` bis `S4.10` bleiben bewusst offen.
- Geprueft gegen den bestehenden Hub-Stil:
  - `#hubDashboardIntakePills` nutzt den bestehenden `.assistant-pills`-Vertrag
  - Desktop:
    - flex-wrap-Layout bleibt aktiv
    - der vierte Pill-Eintrag fuegt sich ohne Sonderkarte oder Grid-Bruch ein
  - Mobile:
    - unter `768px` schaltet `.assistant-pills` bereits auf vertikalen Stack
    - der neue Eintrag folgt damit sauber dem bestehenden Mobile-Vertrag
- Ergebnis:
  - kein eigener CSS-Sonderpfad fuer `WASSER-SOLL` noetig
  - kein Layout-Refactor notwendig
  - bestehender Hub-Stil traegt den zusaetzlichen Pill-Eintrag belastbar
- Validierungsstand:
  - statischer Read gegen `index.html` und `app/styles/hub.css` erfolgt
  - bewusste Entscheidung: kein CSS-Eingriff, weil der bestehende Vertrag bereits passend ist

#### S4 Checkpoint E - Modul-Overview angelegt
- Status:
  - `S4.5` ist abgeschlossen.
  - `S4.6` bis `S4.10` bleiben bewusst offen.
- Angelegt:
  - `docs/modules/Hydration Target Module Overview.md`
- Inhaltlicher Zuschnitt:
  - bewusst als kleines Dashboard-Subfeature beschrieben
  - eigener Zweck-, Ablauf-, UI- und Guardrail-Vertrag
  - keine Aufblaehung zu einem kuenstlich grossen Modul
- Produktwirkung:
  - das Feature hat jetzt eine eigene dokumentierte Source of Truth
  - spaetere V2-Erweiterungen koennen darauf aufsetzen, ohne `V1` rueckwirkend umzudeuten

#### S4 Checkpoint F - Relevante Modul-Doku und README synchronisiert
- Status:
  - `S4.6` ist abgeschlossen.
  - `S4.7` bis `S4.10` bleiben bewusst offen.
- Nachgezogen:
  - `docs/modules/Hub Module Overview.md`
  - `docs/modules/Intake Module Overview.md`
  - `README.md`
- Sync-Inhalt:
  - Hub-Dashboard traegt den lokalen `WASSER-SOLL`-Referenzwert jetzt explizit im Dokuvertrag
  - Intake bleibt klar Source of Truth fuer Wasser-Istwerte, waehrend `WASSER-SOLL` als separater lokaler Referenzpfad beschrieben ist
  - README listet das Feature jetzt als kleinen unterstuetzenden Baustein und Einstiegspunkt

#### S4 Checkpoint G - QA erweitert
- Status:
  - `S4.7` ist abgeschlossen.
  - `S4.8` bis `S4.10` bleiben bewusst offen.
- Umgesetzt in `docs/QA_CHECKS.md`:
  - neue Phase `A6 - Hydration Target Dashboard (2026-03-30)`
  - Smoke, Sanity und Regression fuer:
    - Platzierung
    - Randwerte
    - Interpolation
    - Minutentakt bei offenem Dashboard
    - `visibilitychange`
    - Desktop-/Mobile-Vertrag

#### S4 Checkpoint H - Schritt-Abnahme und finaler Doku-Sync
- Status:
  - `S4.8` und `S4.9` sind abgeschlossen.
  - `S4.10` bleibt als Commit-Empfehlung offen.
- Code-/Vertragsabnahme:
  - `index.html` enthaelt den finalen `WASSER-SOLL`-Pill-Eintrag an der beschlossenen Stelle
  - `app/modules/hub/index.js` kapselt die Logik sauber und bindet sie an den vereinbarten Refresh-Pfad an
  - kein CSS-Sonderpfad noetig
  - keine Reminder-/Incident-Drift entstanden
- Validierungsstand:
  - `node --check app/modules/hub/index.js` erfolgreich
  - Repo-Read gegen Hub-, Intake-, README- und QA-Doku erfolgt

#### S4 Checkpoint I - Commit-Empfehlung
- Status:
  - `S4.10` ist abgeschlossen.
  - `S4` ist damit komplett `DONE`.
- Commit-Empfehlung:
  - jetzt ist ein gemeinsamer Abschluss-Commit sinnvoll
  - zusammen gehoeren:
    - `index.html`
    - `app/modules/hub/index.js`
    - `docs/modules/Hydration Target Module Overview.md`
    - `docs/modules/Hub Module Overview.md`
    - `docs/modules/Intake Module Overview.md`
    - `docs/QA_CHECKS.md`
    - `README.md`
    - diese Roadmap

### S4 - Umsetzung in Repo, Doku, QA und Abschluss-Sync
- S4.1 Dashboard-Markup um `WASSER-SOLL` erweitern.
- S4.2 Lokale Helper-Funktion fuer den Hydration-Referenzwert implementieren.
- S4.3 Dashboard-Render / Refresh sauber anbinden.
- S4.4 Desktop- und Mobile-Layout gegen den bestehenden Hub-Stil validieren.
- S4.5 Neue kleine Modul-Overview `docs/modules/Hydration Target Module Overview.md` anlegen.
- S4.6 Relevante Modul-Dokus und ggf. README nachziehen.
- S4.7 `docs/QA_CHECKS.md` um eine kleine Hydration-Target-Smoke-Sektion erweitern.
- S4.8 Schritt-Abnahme:
  - Code-/Dead-Code-Pruefung, statische Validierung, Render-Smokes
- S4.9 Doku-Sync:
  - finalen Repo-Stand in Doku spiegeln
- S4.10 Commit-Empfehlung:
  - finalen Commit-/Merge-Vorschlag dokumentieren
- Output: `WASSER-SOLL` ist ruhig, lokal und MIDAS-konform im Dashboard integriert.
- Exit-Kriterium: Das Dashboard zeigt eine belastbare Hydration-Orientierung, ohne in Bewertung oder Reminder-Verhalten zu kippen.

## Smokechecks / Regression (Definition)
- Dashboard zeigt `WASSER-SOLL` direkt unter `WASSER`.
- `WASSER-SOLL` sitzt im bestehenden Pill-Block direkt nach `WASSER`, ohne Sonderkarte oder Layoutbruch.
- Vor `07:00` bleibt `WASSER-SOLL` bei `0 ml`.
- Um `19:30` erreicht `WASSER-SOLL` exakt `2000 ml`.
- Zwischenwerte fuehlen sich entlang des Tagesbilds plausibel und nicht linear-hart an.
- Zwischen zwei Tabellenstuetzpunkten verlaeuft der Wert sauber und deterministisch ohne Spruenge.
- Dashboard-Optik bleibt auf Desktop und Mobile unveraendert ruhig.
- Keine neuen Toasts, Hinweise, Farben oder Assistenztexte entstehen durch das Feature.
- Normale Intake-Saves ziehen den Dashboard-Wasser-Istwert und den Sollwert konsistent nach.
- Geoeffnetes Dashboard aktualisiert `WASSER-SOLL` auch ohne neuen Save mit dem Minutenwechsel weiter.

## Abnahmekriterien
- `WASSER-SOLL` liefert echte Orientierung ohne erhobenen Zeigefinger.
- Das Feature spart einen Klick ins Intake-Panel, ohne das Dashboard zu ueberladen.
- Berechnungslogik, UI und Doku sprechen denselben Vertrag.
- Das Feature bleibt lokal, leichtgewichtig und spaeter ausbaubar.

## Risiken
- Eine zu mathematische Kurve koennte sich weniger natuerlich anfuehlen als die Referenztabelle.
- Eine zu sichtbare Gestaltung koennte unbeabsichtigt wie Wertung wirken.
- Eine spaetere V2 koennte die harmlose V1 rueckwirkend ueberfrachten, wenn die Guardrails nicht sauber dokumentiert bleiben.
