# MIDAS Appointments UI Polish Roadmap (DONE)

## Ziel (klar und pruefbar)

Das Appointments-/Termine-Panel soll auf Mobile ruhiger, kompakter und besser scannbar werden, ohne zu einer Kalender-App zu werden.

Pruefbare Zieldefinition:

- Termine werden im Offen-Tab als kompakte MIDAS-Agenda dargestellt, nicht als grosser Kalender.
- Auf Mobile sind mindestens zwei kommende Termine teilweise oder vollstaendig sichtbar, sofern genug Daten vorhanden sind.
- Datum und Uhrzeit folgen dem oesterreichischen Lesemuster:
  - Datum: `dd.mm.yyyy`
  - Uhrzeit: `HH:mm`
  - optionaler Wochentag: `Mo., 15.06.2026 - 07:00`
- Der naechste Termin ist schneller erfassbar als heute, ohne das Modul zum Primaer-Dashboard aufzuwerten.
- Aktionen sind hierarchisch:
  - `Erledigt` bleibt schnell erreichbar.
  - `Loeschen` wird sichtbar, aber nicht gleichwertig dominant.
- Die Liste erzeugt keine Textueberlappung, keine horizontale Ueberbreite und keinen zweiten Scrollcontainer im Hub-Panel.
- MIDAS-Look bleibt erhalten:
  - dunkle Glas-/Panel-Sprache
  - bestehende Tokens und globale Patterns
  - keine bunte Kalender-/Kategorie-Farbwelt
  - keine Monats-/Rasterkalender-Ansicht

## Problemzusammenfassung

Der aktuelle Appointments-Tab ist funktional, aber auf Mobile visuell zu schwer.

Beobachteter Ist-Zustand aus den Handy-Screenshots vom 23.05.2026:

- Die Summary-Card `Kommende Termine` verbraucht viel Hoehe fuer wenig Informationsgewinn.
- Einzelne Termin-Cards sind auf Mobile sehr hoch.
- `Erledigt` und `Loeschen` erscheinen als grosse, gleichwertige Full-width-Aktionen.
- `Ort folgt` und `Status: Geplant` erzeugen Datenrauschen.
- Titel und Datum/Uhrzeit konkurrieren im Card-Header.
- Beim Scrollen wirkt die Liste eingeklemmt und schwer, statt agendaartig scanbar.
- Die Anzeige nutzt heute Datumsformate mit Monats-/Wochentagtext, muss aber fuer Stephan in Oesterreich klar `dd.mm.yyyy` priorisieren.

Produktrealitaet:

- Termine sind fuer MIDAS relevant, aber kein Primaermodul wie Intake, Medication oder BP.
- Ziel ist eine ruhige medizinische Terminliste, keine vollwertige Kalender-App.
- Appointments liefern Kontext fuer Hub/Assistant und bleiben ein kleines CRUD-Modul.

## Scope

- UI-Umbau des Termine-Panels:
  - Offen-Tab
  - Erledigt-Tab
  - Neu-Tab nur soweit noetig fuer konsistente Dichte und mobile Bedienbarkeit
- Anpassungen an:
  - `index.html`
  - `app/modules/appointments/index.js`
  - `app/styles/hub.css`
  - ggf. globale Pattern nur falls wirklich noetig und passend zum CSS-Vertrag
- User-Facing Copy im Appointments-Panel:
  - Summary
  - Empty States
  - Status-/Meta-Zeilen
  - Buttontexte
- Datums-/Zeitdarstellung im Appointments-Panel.
- Doku-/QA-Sync:
  - `docs/modules/Appointments Module Overview.md`
  - `docs/modules/CSS Module Overview.md`, nur falls neue CSS-Regeln/Patterns relevant werden
  - `docs/QA_CHECKS.md`
  - diese Roadmap

## Not in Scope

- Keine Kalender-Rasteransicht.
- Keine Monats-/Wochen-/Tagesansicht.
- Keine externe Kalenderintegration.
- Keine Pushes, Reminder oder Incident-Logik fuer Termine.
- Keine Voice-/Assistant-Create-Implementierung.
- Keine neue Datums-/Zeit-Semantik im Intent-Kern.
- Keine SQL-/RLS-/Supabase-Datenmodell-Aenderung.
- Keine Android-Widget-Erweiterung um Termine.
- Keine neuen Dependencies.
- Kein Redesign des gesamten Hub-Panels.
- Keine farbige Kategorie-Logik nach Kalender-App-Muster.

## Relevante Referenzen (Code)

- `index.html`
- `app/modules/appointments/index.js`
- `app/styles/hub.css`
- `app/styles/layout.css`
- `app/styles/ui.css`
- `app/styles/utilities.css`
- `app/modules/hub/index.js`, nur fuer Panel-/Scroll-Kontext

## Relevante Referenzen (Doku)

- `README.md`
- `docs/MIDAS Roadmap Template.md`
- `docs/modules/Appointments Module Overview.md`
- `docs/modules/CSS Module Overview.md`
- `docs/modules/Hub Module Overview.md`
- `docs/modules/State Layer Overview.md`
- `docs/modules/Touchlog Module Overview.md`, nur falls Diagnose-/QA-Fragen betroffen sind
- `docs/QA_CHECKS.md`
- `docs/archive/Device Module Scaling Roadmap.md`
- `docs/archive/Layout Alignment.md`
- optional als externe Design-Orientierung:
  - Apple Calendar / iOS Event-Patterns: `https://support.apple.com/en-euro/guide/iphone/iph3d110f84/ios`
  - Apple EventKit UI: `https://developer.apple.com/documentation/EventKitUI`
  - Material Design List Patterns: `https://m1.material.io/components/lists.html`
  - Material Design Date/Time Pickers: `https://m1.material.io/components/pickers.html`
  - Fantastical App-Store-/Agenda-Referenz: `https://apps.apple.com/gb/app/fantastical-calendar/id718043190`
  - Fantastical Calendar Views: `https://flexibits.com/fantastical-ios/help/calendar-views`

Regel:

- Erst README und Appointments Overview lesen.
- Dann CSS Module Overview, Device Scaling und Layout Alignment lesen.
- Dann Appointments-Code und aktuelle CSS-Regeln lesen.
- Erst danach Code aendern.

## Guardrails

- MIDAS bleibt single-user und alltagstauglich.
- Appointments bleiben ein Nebenmodul, kein neuer Produktkern.
- Kein Push-Spam und keine Reminder-Kette.
- Keine freie medizinische Bewertung oder Terminpriorisierung.
- Keine versteckten Writes.
- Keine farbige Kalender-App-Sprache, die MIDAS unruhig macht.
- Bestehende CRUD-Funktionalitaet bleibt erhalten:
  - Termin speichern
  - erledigt / zuruecksetzen
  - loeschen
  - Assistant-/Hub-Upcoming-Kontext
- CSS folgt bestehenden Tokens und Patterns.
- `.hub-panel-scroll` bleibt der einzige Scrollcontainer im Hub-Panel.
- Mobile darf keine horizontale Ueberbreite bekommen.
- User-Facing Copy bleibt ruhig und oesterreichisch lesbar.

## Architektur-Constraints

- MIDAS bleibt browser-first, statisches HTML/CSS/JS ohne Build-Step.
- Appointments nutzen `appointments_v2` als Supabase Source of Truth.
- Es gibt keine neue Persistenz und keine Schemaaenderung.
- Appointments liefern `getUpcoming()` fuer Assistant/Hub; dieser Vertrag darf nicht brechen.
- Rendering wird aktuell in `app/modules/appointments/index.js` gebaut.
- Tabs nutzen das globale `.tabs` Pattern.
- Hub-Panels nutzen feste Hoehe und `.hub-panel-scroll`.
- Datumsanzeige muss zeitzonenbewusst genug fuer lokale `Europe/Vienna`-Nutzung bleiben.

## Tool Permissions

Allowed:

- Lesen und Aendern von:
  - `index.html`
  - `app/modules/appointments/index.js`
  - `app/styles/hub.css`
  - `docs/modules/Appointments Module Overview.md`
  - `docs/QA_CHECKS.md`
  - diese Roadmap
- Lesen von CSS- und Hub-Referenzdateien.
- Lokale Checks:
  - `node --check app/modules/appointments/index.js`
  - `git diff --check`
  - gezielte `rg`-/`Select-String`-Reviews
  - lokaler Browser-/Playwright-Smoke gegen `http://127.0.0.1:8765`, falls Umsetzung startet
- Mobile/Tablet/Desktop Screenshots oder manuelle Device-Smokes definieren.

Forbidden:

- SQL-/RLS-/Backend-Aenderungen.
- Supabase Deploys.
- Android-Aenderungen.
- Service-Worker-/PWA-Cache-Aenderungen, ausser ein spaeterer Umsetzungsschritt belegt einen direkten Bedarf.
- Voice-/Intent-/Assistant-Fast-Path-Aenderungen.
- Kalenderintegration oder externe APIs.
- Neue Dependencies.
- Loeschen oder Umverdrahten bestehender Appointment-Datenpfade ohne separaten Contract Review.

## Execution Mode

- Sequenziell arbeiten: `S1` bis `S6`.
- S1 bis S3 sind Doku-, Design- und Contract-Arbeit.
- S4 ist der UI-Umsetzungsblock.
- S5 prueft lokal, visuell und vertraglich.
- S6 synchronisiert Doku, QA und Roadmap.
- Nach jedem Hauptschritt Statusmatrix aktualisieren.
- Nach jedem Hauptschritt mindestens einen Check oder Review dokumentieren.
- Jeder Hauptschritt endet mit:
  - Schritt-Abnahme
  - Doku-Sync-Entscheidung
  - Commit-Empfehlung

## Vorab Contract Review 23.05.2026

Review-Frage:

- Darf das Termine-Panel visuell deutlich umgebaut werden, ohne MIDAS in Richtung Kalender-App oder Termin-Reminder-System zu verschieben?

Entscheidung:

- Ja, wenn der Umbau auf eine kompakte Agenda-/Terminakten-Ansicht begrenzt bleibt.

Findings:

- CR-APT-F1: Eine Monats-/Kalender-Rasteransicht wuerde das Modul fachlich aufwerten und passt nicht zum Nebenmodul-Charakter.
- CR-APT-F2: Grosse dauerhafte `Loeschen`-Buttons machen eine seltene destruktive Aktion zu prominent.
- CR-APT-F3: `Ort folgt` und `Status: Geplant` sind als permanente Hauptinformationen zu laut.
- CR-APT-F4: Datumsdarstellung muss fuer Oesterreich auf `dd.mm.yyyy` ausgerichtet sein; englische oder app-store-nahe Monatsbadge-Optik darf nicht der primaere Vertrag werden.
- CR-APT-F5: Ein kompakter `naechster Termin`-Akzent ist sinnvoll, darf aber nicht zum neuen Dashboard werden.
- CR-APT-F6: Jede UI-Verdichtung muss Touch-Ziele, Lesbarkeit und Textumbruch auf Mobile respektieren.
- CR-APT-F7: Appointments duerfen keine neue Reminder-/Push-Semantik bekommen.

Korrekturen am Roadmap-Vertrag:

- Kalender-Raster, Reminder und Push wurden explizit aus Scope ausgeschlossen.
- Datumsvertrag wurde auf `dd.mm.yyyy` / `HH:mm` festgelegt.
- Zielbild wurde auf `MIDAS Agenda` statt `Kalender` geschrumpft.
- Destruktive Aktionen wurden als sekundaer zu behandelnder UI-Pfad festgelegt.
- `.hub-panel-scroll` und mobile Ueberbreite wurden als harte UI-Constraints aufgenommen.

Nachpruefung:

- Keine offenen Contract-Findings fuer den Roadmap-Start.

## Post-Write Contract Review 23.05.2026

Review-Frage:

- Entspricht die neu geschriebene Roadmap selbst dem MIDAS-Roadmap-Template, den Appointments-Grenzen und dem oesterreichischen Datumsvertrag?

Geprueft:

- Roadmap-Struktur gegen `docs/MIDAS Roadmap Template.md`.
- Scope gegen Appointments Module Overview.
- UI-Grenzen gegen README-Guardrails.
- CSS-/Scroll-Grenzen gegen CSS Module Overview.
- Referenzpfade auf Existenz.
- Datumsformat-Vertrag `dd.mm.yyyy` und `HH:mm`.
- Keine neue Backend-, SQL-, Push-, Voice-, Android- oder Service-Worker-Pflicht.
- ASCII-/Encoding-Sauberkeit der neuen Roadmap.
- `git diff --check` fuer die neue Roadmap.

Findings:

- CR-APT-POST-F1: Einzelne Umlaute waren in der neuen Roadmap enthalten, obwohl neue Dateien in MIDAS moeglichst ASCII-stabil gehalten werden sollen.

Korrektur:

- CR-APT-POST-F1 korrigiert:
  - `sekundaer` statt Umlaut-Schreibweise.

Nachpruefung:

- Keine Non-ASCII-Zeichen mehr in der Roadmap.
- Referenzpfade existieren.
- `git diff --check -- docs/MIDAS Appointments UI Polish Roadmap.md` ist sauber.
- Keine offenen Contract-Findings nach Korrektur.

## Zielbild: MIDAS Agenda Compact

Das bevorzugte Zielbild ist eine kompakte Agenda mit leichtem `naechster Termin`-Akzent.

### Obere Ebene

- Panel-Titel bleibt `Termine`.
- Tabs bleiben erhalten, werden aber dichter und informativer:
  - `Offen`
  - `Erledigt`
  - `Neu`
- Die grosse Summary-Card wird zu einer ruhigen Statuszeile oder sehr kompakten Kopfzeile; Zahlen stehen dort statt in den Tabs:
  - `4 offen - 6 gesamt`
  - optional: `Naechster: Mo., 15.06.2026 - 07:00`

### Uebersicht

Termin-Eintraege werden als kompakte Agenda-Cards dargestellt:

```text
15.06.
Mo.      Kontrolle Urologe Prostata
         07:00 - Ort folgt
         [Erledigt] [...]
```

Oder als flache Card:

```text
Kontrolle Urologe Prostata
Mo., 15.06.2026 - 07:00
Ort folgt
                           [Erledigt] [...]
```

Entscheidung in S2/S3:

- Variante A: Datum links als kleiner MIDAS-Badge.
- Variante B: Datum als Meta-Zeile unter Titel.
- Variante C: erster Termin leicht hervorgehoben, weitere Termine als dichtere Liste.

S2-Entscheidung:

- Variante C mit B:
  - erster Termin minimal akzentuiert
  - alle Termine bleiben im gleichen Listensystem
  - Datum im oesterreichischen Format als Meta-Zeile
  - weniger Risiko fuer Badge-Ueberladung auf schmalen Screens
  - keine dynamischen Zaehler in den Tabs; Zaehler bleiben in der Summary-Zeile

### Aktionen

- `Erledigt` bleibt sichtbare Primaeraktion.
- `Loeschen` wird sekundaer:
  - kleiner Ghost-Button
  - Icon-/Kebab-Menue nur wenn im bestehenden UI-Pattern sauber machbar
  - alternativ `Loeschen` als dezenter Textbutton unter Meta-Aktionen
- Kein Swipe-only-Verhalten, weil es schlechter auffindbar und riskanter fuer QA ist.

### Neu-Tab

- Formular bleibt einfach.
- Optionaler Polish:
  - Felder dichter gruppieren
  - `Datum` und `Uhrzeit` logisch nebeneinander auf Tablet/Desktop, untereinander auf Mobile
  - Buttontext ohne Emoji, falls globale UI-Polish-Richtung das verlangt
  - Notizen bleiben sekundaer

## Statusmatrix

| ID | Schritt | Status | Ergebnis/Notiz |
|---|---|---|---|
| S1 | System-, UI- und Vertragsdetektivarbeit | DONE | Doku, CSS-Vertrag, Markup, JS-Renderpfad, Ist-UI und externe Agenda-Patterns gelesen; S1-Findings dokumentiert. |
| S2 | Zielvertrag und Variantenentscheidung | DONE | Variante C+B, stabiler AT-Datumsvertrag, kompakte Summary und sekundaerer Loeschpfad festgelegt. |
| S3 | Bruchrisiko-, Mobile- und Copy-Review | DONE | Mobile/Textfit, Scroll, Action Safety, Copy/Encoding und konkrete S4-Reihenfolge geprueft. |
| S4 | Umsetzung | DONE | S4.1 bis S4.12 abgeschlossen; kompakte Agenda-UI umgesetzt und reviewed. |
| S5 | Tests, Browser-/Device-Smokes und Contract Review | DONE | Static Checks, Scope-Scans, Playwright Mobile/Desktop-Smokes und CRUD-Smoke abgeschlossen. |
| S6 | Doku-Sync, QA-Update und Abschlussreview | DONE | Appointments Overview, CSS Overview, QA und Roadmap final synchronisiert; archivbereit. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## S1 - System-, UI- und Vertragsdetektivarbeit

Ziel:

- Bestehende Appointments-UI und Datenpfade verstehen.
- Genau festhalten, was UI ist und was Daten-/Backend-Vertrag ist.

Substeps:

- S1.1 README und Produktguardrails fuer Nebenmodule lesen.
- S1.2 Appointments Module Overview lesen.
- S1.3 CSS Module Overview, Device Scaling und Layout Alignment lesen.
- S1.4 `index.html` Appointments-Markup lesen.
- S1.5 `app/modules/appointments/index.js` Render- und CRUD-Pfade lesen.
- S1.6 relevante CSS-Regeln in `app/styles/hub.css`, `layout.css`, `ui.css` lesen.
- S1.7 Screenshots gegen Ist-Code mappen:
  - Summary
  - Tabs
  - Cards
  - Actions
  - Scrollverhalten
- S1.8 Industry-Pattern-Orientierung kurz dokumentieren:
  - Agenda/List statt Calendar Grid.
  - kompakte Event-Zeilen.
  - Detail-/Edit-Flaechen getrennt von Liste.
- S1.9 S1 Contract Review.
- S1.10 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Ist-Systemkarte.
- UI-Findings.
- Betroffene Dateien.
- offene Fragen fuer S2.

Exit-Kriterium:

- Es ist klar, welche Stellen fuer den UI-Umbau angefasst werden und welche nicht.

### S1 Ergebnisprotokoll 23.05.2026

Durchgefuehrt:

- S1.1 README und Produktguardrails gelesen.
- S1.2 `docs/modules/Appointments Module Overview.md` gelesen.
- S1.3 `docs/modules/CSS Module Overview.md`, `docs/archive/Device Module Scaling Roadmap.md` und `docs/archive/Layout Alignment.md` gelesen.
- S1.4 Appointments-Markup in `index.html` gelesen.
- S1.5 Render-, CRUD- und Exportpfade in `app/modules/appointments/index.js` gelesen.
- S1.6 relevante CSS-Regeln in `app/styles/hub.css`, `app/styles/layout.css`, `app/styles/ui.css` und `app/styles/utilities.css` gelesen.
- S1.7 Handy-Screenshots gegen Markup, CSS und Renderpfad gemappt.
- S1.8 externe Agenda-/Event-Listen-Patterns kurz geprueft:
  - Apple Calendar / EventKit bestaetigt Event-View/Edit als eigenes Muster, aber ist zu stark kalenderzentriert fuer MIDAS.
  - Material Design bestaetigt mobile Date-/Time-Picker und scanbare Listen als Standardbausteine.
  - Fantastical und Events-List-Patterns bestaetigen Agenda-/Event-Listen als Industrie-Standard, aber Farbpills, Widgets, Reminder und Kalender-Views bleiben fuer MIDAS bewusst ausser Scope.
- S1.9 Contract Review durchgefuehrt.
- S1.10 Roadmap korrigiert und S1 abgeschlossen.

Ist-Systemkarte:

- Produktrolle:
  - Appointments sind ein Nebenmodul fuer medizinische Termine, nicht der neue Produktkern.
  - Das Modul unterstuetzt Alltag, Hub-Kontext und Assistant-Kontext; es ersetzt keine Kalender-App.
- Datenvertrag:
  - Source of Truth bleibt Supabase `appointments_v2`.
  - Relevante Felder: `title`, `start_at`, `location`, `notes`, `status`, `repeat_rule`, `user_id`.
  - Keine S1-Indikation fuer SQL-, RLS- oder Schemaaenderungen.
- UI-Vertrag:
  - `index.html` enthaelt das statische Hub-Panel mit Tabs `Uebersicht`, `Erledigt`, `Neu`.
  - `renderOverview()` in `app/modules/appointments/index.js` erzeugt die dynamischen Termin-Cards fuer offene und erledigte Termine.
  - Der Neu-Tab nutzt ein einfaches Formular mit Datum, Uhrzeit, Ort, Wiederholung und Notizen.
- CSS-Vertrag:
  - Feature-CSS liegt primar in `app/styles/hub.css`.
  - Globale Button-/Tab-Patterns kommen aus `app/styles/ui.css`.
  - `.hub-panel-scroll` bleibt der einzige Scrollcontainer; `.hub-panel-body` hat aktuell keine eigene Scroll-Logik.
  - Mobile-Regeln bei `<= 900px` machen Terminspalten einspaltig; mobile Button-Regeln stapeln `.appointments-actions` aktuell full-width.
- Integrationsvertrag:
  - `appointments:changed` muss weiter feuern.
  - `getUpcoming()` muss weiter den Assistant-/Hub-Kontext liefern.
  - CRUD-Pfade `save`, `done/zuruecksetzen`, `delete` muessen erhalten bleiben.

UI-Findings:

- APT-S1-F1: Die aktuelle Summary-Card ist hoehenintensiv und liefert wenig Zusatznutzen.
- APT-S1-F2: Card-Header konkurrieren auf Mobile: langer Titel und Datum/Uhrzeit stehen auf derselben Zeile bzw. im gleichen Gewicht.
- APT-S1-F3: `Ort folgt` und `Status: Geplant` sind als dauerhafte Hauptzeilen zu laut fuer ein Nebenmodul.
- APT-S1-F4: Mobile CSS stapelt `Erledigt` und `Loeschen` als gleichwertige Full-width-Aktionen. Das widerspricht der geplanten Aktionenhierarchie.
- APT-S1-F5: `formatDateDisplay(...)` nutzt bereits `de-AT`, aber der Roadmap-Vertrag verlangt eine explizite `dd.mm.yyyy`-Priorisierung. S2 muss festlegen, ob Wochentag angezeigt wird und ob die Ausgabe stabil ohne Locale-Punktuation gebaut wird.
- APT-S1-F6: Der Done-Tab rendert eigene Cards, aber `init()` bindet `handleCardAction` nur an `panelRefs.columns`, nicht an `panelRefs.doneColumns`. Aktionen im Done-Tab sind dadurch voraussichtlich nicht funktionsfaehig.
- APT-S1-F7: In den gelesenen Dateien erscheinen einzelne user-facing Strings in der Tool-Ausgabe als mojibake-nahe Zeichenfolgen. S4 darf keine neue Encoding-Unsauberkeit einfuehren und soll beruehrte Copy normalisieren.
- APT-S1-F8: Der aktuelle Scrollvertrag ist korrekt angelegt: Panel-Hoehe plus innerer `.hub-panel-scroll`. Der UI-Umbau darf keine weitere Scrollbox einfuehren.
- APT-S1-F9: Der Neu-Tab ist funktional ausreichend. Polish sollte sich auf Dichte, Gruppierung und Copy beschraenken.

Betroffene Dateien fuer S4:

- `index.html`
- `app/modules/appointments/index.js`
- `app/styles/hub.css`
- ggf. `app/styles/utilities.css` nur wenn bestehende Meta-/Muted-Regeln nicht reichen
- Doku/QA erst in S6

Offene Fragen fuer S2:

- Bleibt der Tab-Name `Uebersicht` oder wird er verdichtet? S2-Antwort: `Offen`.
- Wird der naechste Termin leicht hervorgehoben oder bleibt die Liste komplett homogen?
- Wird Datum als `Mo., 15.06.2026 - 07:00` oder als `15.06.2026 - 07:00` angezeigt?
- Wird `Ort folgt` weiterhin angezeigt, oder nur ein echter Ort?
- Wird `Loeschen` als kleiner Text-/Ghost-Button sichtbar oder hinter einer bestehenden, klaren Sekundaeraktion versteckt?

### S1 Contract Review 23.05.2026

Review-Frage:

- Ist der geplante UI-Umbau nach der tatsaechlichen Code-/Doku-Lage weiterhin ein reiner Appointments-UI-Polish ohne Backend-, Kalender- oder Reminder-Drift?

Entscheidung:

- Ja. Der Umbau kann auf Markup, Renderlogik, Appointments-CSS und Copy begrenzt bleiben.

Findings:

- APT-S1-CR-F1: Done-Tab-Aktionen sind im aktuellen JS wahrscheinlich nicht gebunden. Das ist ein bestehendes Funktionsrisiko und muss in S4/S5 explizit korrigiert und geprueft werden.
- APT-S1-CR-F2: Die Roadmap nannte `Loeschen` sekundaer, aber die aktuelle mobile CSS-Regel macht alle Appointment-Aktionen full-width. S2/S3 muessen festlegen, ob Appointment-Cards eine Ausnahme vom bestehenden Action-Stacking bekommen.
- APT-S1-CR-F3: Der Datumsvertrag ist fachlich klar, aber technisch noch nicht exakt genug. S2 muss entscheiden, ob die Ausgabe per `Intl` oder eigener Formatter-Logik stabilisiert wird.
- APT-S1-CR-F4: `getUpcoming()` ist ein wichtiger Integrationsvertrag und darf durch Card-/Date-Refactoring nicht indirekt brechen.
- APT-S1-CR-F5: Bestehende Copy-/Encoding-Auffaelligkeiten duerfen bei UI-Polish nicht fortgeschrieben werden.

Korrekturen an der Roadmap:

- S3 ergaenzt um Done-Tab-Action-Binding, mobile Action-Hierarchie und Encoding-/Copy-Risiko.
- S4 ergaenzt um explizite Korrektur/Pruefung der Action-Delegation fuer offene und erledigte Cards.
- S5 ergaenzt um Done-Tab-Smoke fuer `Zuruecksetzen` und `Loeschen`.
- S2 erhaelt eine explizite Entscheidung zur stabilen Datumsformatierung.
- Smokechecks konkretisieren `getUpcoming()` und Done-Tab-Aktionen.

Nachpruefung:

- S1 beruehrt keinen App-Code.
- Keine neuen Scope-Anforderungen fuer Backend, SQL, Push, Voice, Android oder externe Kalender.
- Exit-Kriterium von S1 erfuellt.

Schritt-Abnahme:

- S1 ist abgeschlossen.
- Doku-Sync-Entscheidung: Appointments/CSS/QA-Doku erst in S6 aktualisieren, damit sie den finalen Codezustand beschreibt.
- Commit-Empfehlung: Noch kein separater Commit noetig; S1 ist Roadmap-Arbeit.

## S2 - Zielvertrag und Variantenentscheidung

Ziel:

- Final entscheiden, welche Agenda-Variante umgesetzt wird.
- Produktvertrag fuer Datum, Aktionen, Dichte und Modulgrenze festlegen.

Substeps:

- S2.1 Ziel gegen README-Guardrails pruefen.
- S2.2 Ziel gegen Appointments Overview pruefen.
- S2.3 Variante waehlen:
  - A: Datum links als Badge.
  - B: Datum als Meta-Zeile.
  - C: erster Termin leicht hervorgehoben, Rest kompakt.
- S2.4 finalen Datums-/Zeitvertrag definieren:
  - `dd.mm.yyyy`
  - `HH:mm`
  - optional Wochentag deutsch/Oesterreich.
  - entscheiden, ob die Anzeige stabil selbst formatiert wird oder weiter direkt ueber `Intl` laeuft.
- S2.5 Aktionenhierarchie definieren:
  - Primaer: `Erledigt`.
  - Sekundaer: `Loeschen`.
  - optional Ruecksetzen im Erledigt-Tab.
  - mobile Ausnahme fuer Appointment-Card-Aktionen gegen bestehendes Full-width-Stacking entscheiden.
- S2.6 Empty-State- und Summary-Copy definieren.
- S2.7 S2 Contract Review.
- S2.8 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Finales UI-Zielbild.
- finaler Copy-/Datumsvertrag.
- S4-Pflichtpunkte.

Exit-Kriterium:

- Umsetzung kann starten, ohne offene Design-Grundsatzfragen.

### S2 Ergebnisprotokoll 23.05.2026

Durchgefuehrt:

- S2.1 Ziel gegen README-Guardrails geprueft.
- S2.2 Ziel gegen Appointments Module Overview geprueft.
- S2.3 Variante final gewaehlt.
- S2.4 finalen Datums-/Zeitvertrag definiert.
- S2.5 Aktionenhierarchie definiert.
- S2.6 Empty-State- und Summary-Copy definiert.
- S2.7 S2 Contract Review durchgefuehrt.
- S2.8 Roadmap korrigiert und S2 abgeschlossen.

Finale Variantenentscheidung:

- Gewaehlt: Variante C+B.
- Bedeutung:
  - C: erster kommender Termin wird leicht hervorgehoben.
  - B: Datum/Zeit bleiben als Meta-Zeile im Card-Inhalt, kein separates Kalender-Badge links.
- Begruendung:
  - Weniger Kalender-App-Anmutung als Datum-Badges.
  - Besserer Platz auf schmalen Android-Viewports.
  - Passt zum bestehenden MIDAS-Panel-Look mit dunklen Cards, ruhiger Meta-Typografie und globalen Buttons.
  - Erster Termin wird schneller erfassbar, ohne das Modul zum Dashboard zu machen.

Finales UI-Zielbild:

- Panel-Titel bleibt `Termine`.
- Tabs werden dichter:
  - `Offen`
  - `Erledigt`
  - `Neu`
- Zaehler stehen nicht primaer in den Tabs, sondern in einer kompakten Summary-Zeile:
  - `4 offen - 6 gesamt`
  - optional zweite Zeile: `Naechster: Mo., 15.06.2026 - 07:00`
- Uebersicht zeigt eine flache Agenda-Liste:
  - erster offener Termin mit dezenter Akzentklasse, z. B. `is-next`
  - weitere offene Termine als kompakte Cards
  - keine Monats-, Wochen- oder Tagesrasteransicht
- Erledigt-Tab nutzt dieselbe Card-Struktur, aber ohne `is-next`-Akzent.
- Neu-Tab bleibt Formular und bekommt nur Dichte-/Copy-Polish, keine neuen Features.

Finaler Datums-/Zeitvertrag:

- Primaere Anzeige:
  - `Mo., 15.06.2026 - 07:00`
- Ohne Wochentag, falls S3/S4 einen engeren Platzbedarf feststellt:
  - `15.06.2026 - 07:00`
- Datum:
  - immer `dd.mm.yyyy`
  - fuehrende Nullen fuer Tag und Monat
  - keine englischen Monatsnamen
  - kein `yyyy-mm-dd` in sichtbarer Copy
- Uhrzeit:
  - immer `HH:mm`
  - bei fehlender Uhrzeit: `--:--`
- Technische Entscheidung:
  - numerisches Datum soll stabil selbst aus lokalen Date-Parts gebaut werden.
  - `Intl.DateTimeFormat('de-AT', { weekday: 'short' })` darf nur fuer den optionalen Wochentag genutzt werden.
  - sichtbare `dd.mm.yyyy`-Struktur soll nicht von Browser-Locale-Punktuation abhaengen.
- Zeitzonenentscheidung:
  - Anzeige bleibt lokal fuer Stephans Europe/Vienna-Nutzung.
  - S4 darf keine neue Persistenz- oder Schema-Semantik einfuehren.

Finaler Copy-Vertrag:

- Summary:
  - `4 offen - 6 gesamt`
  - bei keinem offenen Termin: `Keine offenen Termine`
  - bei keinem Termin insgesamt: `Noch keine Termine`
- Naechster-Termin-Zeile:
  - `Naechster: Mo., 15.06.2026 - 07:00`
  - nur anzeigen, wenn ein offener Termin existiert.
- Card:
  - Titel ist die erste visuelle Information.
  - Datum/Zeit als Meta direkt darunter oder rechts nur wenn genug Platz vorhanden ist.
  - Ort nur anzeigen, wenn ein echter Ort vorhanden ist.
  - Notiz nur anzeigen, wenn vorhanden, max. dezent.
  - `Status: Geplant` wird im Offen-Tab nicht dauerhaft angezeigt.
  - Im Erledigt-Tab darf ein dezenter Zustand sichtbar sein, wenn er beim Scannen hilft; Pflicht ist er nicht.
- Empty States:
  - Offen leer: `Keine offenen Termine`
  - Erledigt leer: `Noch keine erledigten Termine`
  - Fehler-/Loading-Copy bleibt ruhig und nicht alarmistisch.

Finale Aktionenhierarchie:

- Offen-Tab:
  - Primaer: `Erledigt`
  - Sekundaer: `Loeschen`
- Erledigt-Tab:
  - Primaer: `Zuruecksetzen`
  - Sekundaer: `Loeschen`
- Mobile:
  - Appointment-Card-Aktionen duerfen von der aktuellen Full-width-Stacking-Regel abweichen.
  - Ziel ist eine kompaktere Action-Zeile mit klaren Touch-Zielen.
  - `Loeschen` darf nicht gleich dominant wie die Primaeraktion wirken.
- Kein Swipe-only und kein versteckter Pflichtpfad.
- Keine neue Confirm-Modal-Pflicht in S4, ausser S3 findet ein konkretes Loeschrisiko.

S4-Pflichtpunkte aus S2:

- Tabs auf die finale Copy pruefen und ggf. auf `Offen`, `Erledigt`, `Neu` umstellen.
- Summary von grosser Card zu kompakter Kopf-/Statuszeile verdichten.
- Card-Renderstruktur auf Titel, Meta, optional Ort/Notiz, Actions umbauen.
- Ersten kommenden Termin dezent akzentuieren.
- `formatDateDisplay(...)` oder Nachfolger stabil auf `dd.mm.yyyy` plus optionalen Wochentag bringen.
- Done-Tab-Action-Delegation korrigieren.
- Mobile `.appointments-actions` fuer Cards so anpassen, dass `Loeschen` sekundaer bleibt.
- Touched Copy auf Encoding-/Mojibake-Artefakte pruefen.

### S2 Contract Review 23.05.2026

Review-Frage:

- Ist die gewaehlte Variante ein sauberer MIDAS-UI-Polish, der die S1-Findings korrigiert, ohne Appointments zur Kalender-, Reminder- oder Assistant-Action-Flaeche aufzuwerten?

Entscheidung:

- Ja. Variante C+B bleibt eine kompakte Agenda-Liste und veraendert weder Datenmodell noch Backend- oder Assistant-Vertrag.

Findings:

- APT-S2-CR-F1: Dynamische Tab-Zaehler waeren visuell nett, wuerden aber mehr JS-Zustand und Copy-Update-Flaechen erzeugen. Fuer ein Nebenmodul ist die kompakte Summary-Zeile der bessere Ort fuer Zahlen.
- APT-S2-CR-F2: Ein linker Datums-Badge koennte auf Mobile professionell wirken, rueckt das Modul aber naeher an Kalender-App-Muster und frisst Breite bei langen medizinischen Titeln.
- APT-S2-CR-F3: Eine direkt auf `toLocaleDateString('de-AT', ...)` gestuetzte Komplettanzeige ist fuer den `dd.mm.yyyy`-Vertrag zu indirekt. Der numerische Teil soll stabil gebaut werden.
- APT-S2-CR-F4: `Ort folgt` als Fallback ist nicht falsch, aber als dauerhafte Zeile zu laut. Fehlender Ort soll im Offen-Tab nicht aktiv aufgeblasen werden.
- APT-S2-CR-F5: Die bestehende Mobile-Regel `appointments-actions .btn { width: 100%; }` passt fuer Form-/Bottom-Flows, aber nicht fuer kompakte Agenda-Cards.

Korrekturen an der Roadmap:

- Tabs-Ziel von dynamischen `Offen 4`-Tabs auf statische Tabs plus kompakte Summary-Zahlen korrigiert.
- Zielbild auf Variante C+B festgelegt.
- Datumsvertrag technisch konkretisiert: stabiler numerischer Formatter plus optionaler `de-AT`-Wochentag.
- Copy-Vertrag korrigiert: fehlender Ort wird nicht mehr als laute Standardzeile gefordert.
- S4-Pflichtpunkte um Card-Action-Ausnahme und Done-Tab-Action-Delegation konkretisiert.

Nachpruefung:

- Kein Backend-, SQL-, RLS-, Push-, Voice-, Android- oder Kalenderintegrations-Scope entstanden.
- `getUpcoming()` bleibt unveraendert als Integrationsvertrag bestehen.
- `.hub-panel-scroll` bleibt einziger Scrollcontainer.
- S2 beantwortet alle offenen S1-Designfragen.

Schritt-Abnahme:

- S2 ist abgeschlossen.
- Doku-Sync-Entscheidung: Modul-/QA-Doku erst in S6 an den finalen Codezustand anpassen.
- Commit-Empfehlung: Noch kein separater Commit noetig; S2 ist Roadmap-/Contract-Arbeit.

## S3 - Bruchrisiko-, Mobile- und Copy-Review

Ziel:

- Risiken vor Codeaenderung sichtbar machen.

Substeps:

- S3.1 Mobile Layout Risks:
  - lange Titel
  - fehlender Ort
  - fehlende Uhrzeit
  - viele Termine
  - erledigte Termine
  - schmale Android-Viewports
- S3.2 Scroll-Review:
  - nur `.hub-panel-scroll`
  - keine verschachtelten Scrollbereiche
  - keine sticky Ueberlappung, ausser bewusst designt und getestet
- S3.3 Action Safety:
  - `Loeschen` nicht versehentlich zu leicht ausloesen
  - `Erledigt`/`Zuruecksetzen` stabil
  - Click-Delegation fuer offene und erledigte Cards pruefen
  - mobile Action-Hierarchie gegen aktuelle Full-width-Regel pruefen
- S3.4 User-Facing Copy Review:
  - keine falsche Dringlichkeit
  - keine technische Sprache
  - `Ort folgt` nur wenn noetig und dezent
  - Status nicht doppelt zeigen, wenn Tab und Aktion Zustand bereits erklaeren
  - beruehrte Strings auf Encoding-/Mojibake-Risiko pruefen
- S3.5 Tooling und Smokes definieren.
- S3.6 S4-Substeps konkretisieren.
- S3.7 Contract Review S3.
- S3.8 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Bruchrisiko-Liste.
- Copy-Regeln.
- konkrete S4-Reihenfolge.

Exit-Kriterium:

- S4 hat klare Review-Kriterien.

### S3 Ergebnisprotokoll 23.05.2026

Durchgefuehrt:

- S3.1 Mobile Layout Risks geprueft.
- S3.2 Scroll-Review geprueft.
- S3.3 Action Safety geprueft.
- S3.4 User-Facing Copy Review geprueft.
- S3.5 Tooling und Smokes definiert.
- S3.6 S4-Substeps konkretisiert.
- S3.7 S3 Contract Review durchgefuehrt.
- S3.8 Roadmap korrigiert und S3 abgeschlossen.

Bruchrisiko-Liste:

- APT-S3-R1: Lange medizinische Titel koennen im aktuellen Card-Header mit Datum/Zeit konkurrieren. S4 muss Titel und Meta vertikal oder responsiv trennen.
- APT-S3-R2: Fehlender Ort darf keine laute Platzhalterzeile erzeugen. S4 soll Ort nur bei vorhandenem Wert rendern oder extrem dezent behandeln.
- APT-S3-R3: Fehlende Uhrzeit braucht ein stabiles Fallback `--:--`, darf aber nicht wie eine echte Uhrzeit wirken.
- APT-S3-R4: Viele Termine duerfen keine zweite Scrollbox erzeugen. Nur `.hub-panel-scroll` darf scrollen.
- APT-S3-R5: Erledigte Termine muessen funktional bleiben; aktuell fehlt sehr wahrscheinlich der Click-Handler auf `doneColumns`.
- APT-S3-R6: Die globale Mobile-Regel stapelt `.appointments-actions` und setzt Buttons auf `width: 100%`. Das ist fuer Formularaktionen okay, fuer kompakte Agenda-Cards aber zu schwer.
- APT-S3-R7: Eine zu kleine `Loeschen`-Aktion waere riskant, wenn sie schwer erkennbar oder versehentlich antippbar wird. Sekundaer heisst nicht unsichtbar.
- APT-S3-R8: Encoding-/Mojibake-Artefakte in sichtbarer Copy muessen bei beruehrten Strings korrigiert werden, ohne einen breiten Encoding-Refactor zu starten.
- APT-S3-R9: Der erste Termin darf nur dezent akzentuiert werden. Ein zu starker Akzent wuerde das Nebenmodul wie ein Dashboard wirken lassen.
- APT-S3-R10: Summary darf nicht wieder zu einer grossen Card anwachsen. Sie muss unterhalb der Tabs kompakt bleiben.

Mobile Layout Regeln fuer S4:

- Card-Inhalt:
  - Titel oben, max. volle Breite.
  - Datum/Zeit als Meta darunter oder auf breiten Viewports rechts.
  - Kein Text darf im Header gegeneinander laufen.
  - Lange Titel duerfen umbrechen, aber Actions nicht verschieben.
- Cards:
  - Padding dichter als heute, aber Touch-Ziele bleiben mindestens sinnvoll gross.
  - Erster Termin darf `is-next` oder vergleichbare dezente Klasse erhalten.
  - Keine Kalender-Badge-Spalte als Pflichtlayout.
- Actions:
  - Card-Actions brauchen eine eigene mobile Regel, getrennt von Formular-Actions.
  - Primaeraktion bleibt deutlich antippbar.
  - `Loeschen` bleibt sichtbar, aber optisch sekundaer.
- Tabs/Summary:
  - Tabs nicht mit dynamischen Zahlen belasten.
  - Summary-Zahlen in eine kompakte Zeile legen.

Scroll-Review:

- Bestehender Vertrag ist korrekt:
  - Panel hat feste Hoehe.
  - `.hub-panel-scroll` ist der Scrollcontainer.
  - `.hub-panel-body` scrollt nicht.
- S4 darf nicht einfuehren:
  - `overflow-y: auto` auf `.hub-panel-body`
  - eigene Scrollbereiche in `.appointments-columns`
  - sticky Summary, sofern nicht separat getestet
  - `height: 100%` auf `.hub-panel-scroll`

Action Safety:

- Offen-Tab:
  - `Erledigt` muss direkt ausloesbar bleiben.
  - `Loeschen` darf nicht gleichwertig dominant wirken.
- Erledigt-Tab:
  - `Zuruecksetzen` muss direkt ausloesbar sein.
  - `Loeschen` bleibt sekundaer.
- Technische Pflicht:
  - `handleCardAction` muss fuer `appointmentsColumns` und `appointmentsDoneColumns` erreichbar sein.
  - Eine gemeinsame Delegation auf einem stabilen Parent ist erlaubt, wenn sie keine anderen Panel-Buttons faelschlich abfaengt.
- Kein neuer Confirm-Dialog in S4 als Pflicht:
  - Nur einfuehren, falls die konkrete UI-Loesung das Loeschrisiko erhoeht.

Copy-Regeln:

- Erlaubt:
  - `Offen`
  - `Erledigt`
  - `Neu`
  - `4 offen - 6 gesamt`
  - `Naechster: Mo., 15.06.2026 - 07:00`
  - `Keine offenen Termine`
  - `Noch keine erledigten Termine`
  - `Termin speichern`
- Vermeiden:
  - `Status: Geplant` im Offen-Tab
  - lautes `Ort folgt` als Standardzeile
  - technische Wiederholungswerte wie `monthly` oder `annual` ohne Mapping
  - Emoji in Primaerbutton-Copy, falls der Button in S4 beruehrt wird
  - neue nicht-ASCII-Artefakte in beruehrter Copy

Tooling und Smokes fuer S5:

- `node --check app/modules/appointments/index.js`
- `git diff --check`
- Non-ASCII-/Mojibake-Scan fuer beruehrte Appointments-Dateien.
- DOM-/Code-Scan:
  - `doneColumns`
  - `appointments-actions`
  - `formatDateDisplay`
  - `getUpcoming`
- Browser-Smoke:
  - Panel oeffnen.
  - Tabs wechseln.
  - Offen- und Erledigt-Actions pruefen.
  - Mobile Viewport mit schmaler Breite pruefen.
  - Keine horizontale Ueberbreite.

Konkrete S4-Reihenfolge:

1. Baseline und betroffene Stellen sichern.
2. Datums-/Zeit-Helper stabilisieren.
3. Renderstruktur fuer Cards umbauen.
4. Summary verdichten und Tab-Copy anpassen.
5. Action-Delegation fuer offene und erledigte Cards korrigieren.
6. Card-Action-Hierarchie und mobile CSS-Ausnahme umsetzen.
7. Neu-Tab nur dezent angleichen.
8. Empty States, Repeat-Copy und beruehrte Strings bereinigen.
9. Zwischenreview gegen S2/S3.
10. Lokale Checks fuer S4 ausfuehren.

### S3 Contract Review 23.05.2026

Review-Frage:

- Sind die Risiken vor S4 so konkret, dass die Umsetzung ohne offene UI-Grundsatzfragen starten kann und dabei keine Scope-Drift entsteht?

Entscheidung:

- Ja. S4 kann starten, wenn die genannten Pflichtpunkte in genau diesem UI-Scope bleiben.

Findings:

- APT-S3-CR-F1: Die bisherige S4-Reihenfolge setzte Summary vor Renderstruktur. Wegen Textfit und Card-Dichte sollte der Card-Render vor oder gemeinsam mit der Summary angepasst werden.
- APT-S3-CR-F2: Die Roadmap pruefte Copy zwar allgemein, aber Repeat-Werte `monthly`/`annual` koennen sichtbar technisch wirken. S4 braucht eine Copy-Pruefung fuer Wiederholungen.
- APT-S3-CR-F3: Der Non-ASCII-Scan der Roadmap reicht nicht fuer S5. Beruehrte Appointments-Dateien brauchen einen eigenen Mojibake-/Encoding-Scan.
- APT-S3-CR-F4: Eine mobile Action-Ausnahme darf nicht globale Form-Actions in anderen Modulen brechen. Die CSS-Regel muss auf Appointment-Cards begrenzt sein.
- APT-S3-CR-F5: Ein gemeinsamer Click-Delegation-Parent waere praktisch, darf aber nicht Submit- oder Tab-Buttons miterfassen.

Korrekturen an der Roadmap:

- S4-Reihenfolge wird auf Card-Render vor Summary/Actions konkretisiert.
- S4 erhaelt Pflicht zur lesbaren Repeat-Copy, falls Wiederholung angezeigt bleibt.
- S5 erhaelt beruehrte-Dateien-Scan fuer Mojibake-/Encoding-Artefakte.
- CSS-Pflicht wird auf `.appointments-card .appointments-actions` statt globale `.appointments-actions` konkretisiert.
- Action-Delegation bekommt eine Parent-Scope-Warnung.

Nachpruefung:

- Keine neuen Backend-, SQL-, Push-, Voice-, Android-, Kalender- oder Dependency-Anforderungen.
- S3 bestaetigt S2-Variante C+B.
- S3 beantwortet Mobile, Scroll, Action Safety, Copy und S4-Reihenfolge.

Schritt-Abnahme:

- S3 ist abgeschlossen.
- Doku-Sync-Entscheidung: Modul-/QA-Doku weiterhin erst in S6 aktualisieren.
- Commit-Empfehlung: Noch kein separater Commit noetig; S3 ist Roadmap-/Contract-Arbeit.

## S4 - Umsetzung

Ziel:

- Appointments-Panel als kompakte MIDAS-Agenda umsetzen.

Geplante Substeps:

- S4.1 Baseline sichern:
  - Ist-Screenshot oder kurze Notiz aus Mobile und Desktop.
  - aktuelles DOM/CSS-Verhalten dokumentieren.
- S4.2 Datumsformat-Helper anpassen:
  - `formatDateDisplay(...)` auf `dd.mm.yyyy` ausrichten.
  - lokale Zeit `HH:mm` stabil halten.
- S4.3 Termin-Card-HTML in `renderOverview()` umbauen:
  - Titel priorisieren.
  - Datum/Zeit als Meta.
  - Ort/Notiz dezent.
  - Status nur wenn wirklich nuetzlich.
  - Wiederholungen nur anzeigen, wenn sie lesbar gemappt sind.
- S4.4 Summary-Kopf verdichten:
  - grosse Summary-Card reduzieren.
  - offene/gesamt Zahlen sichtbar, aber nicht dominant.
- S4.5 Aktionenhierarchie umbauen:
  - `Erledigt` kompakt sichtbar.
  - `Loeschen` sekundaer.
  - Erledigt-Tab mit `Zuruecksetzen` konsistent behandeln.
- S4.6 Action-Delegation korrigieren:
  - offene Cards und erledigte Cards muessen Toggle/Delete-Klicks ausloesen.
  - keine neue Datenpfad- oder Backend-Logik einfuehren.
  - Delegation muss so gescoped sein, dass Tabs und Submit-Button nicht miterfasst werden.
- S4.7 CSS-Polish in `hub.css`:
  - kompaktere Cards.
  - bessere mobile Dichte.
  - keine horizontale Ueberbreite.
  - bestehende Tokens/Patterns nutzen.
  - mobile Action-Ausnahme auf `.appointments-card .appointments-actions` begrenzen.
  - neue Card-Klassen `.appointments-card-header`, `.appointments-title`, `.appointments-time`, `.appointments-detail`, `.is-next` und `.is-done` visuell aufnehmen.
- S4.8 Neu-Tab dezent angleichen:
  - Formular-Dichte und Button-Copy pruefen.
  - keine neuen Features.
- S4.9 Empty States und Loading-/Error-Copy pruefen.
- S4.10 Copy-/Encoding-Review fuer beruehrte Strings.
- S4.11 Code Review und Zwischen-Contract-Review.
- S4.12 Schritt-Abnahme und Commit-Empfehlung.

Jeder S4-Substep dokumentiert:

- Umsetzung
- betroffene Dateien
- lokaler Check
- Contract Review
- Findings
- Korrekturen
- Restrisiko

Output:

- Kompakte, mobile-taugliche Termine-Agenda.

Exit-Kriterium:

- Uebersicht, Erledigt und Neu bleiben funktional und sehen auf Mobile ruhiger aus.

### S4.1 Baseline 23.05.2026

Umsetzung:

- Keine App-Code-Aenderung.
- Baseline aus vorhandenen Handy-Screenshots, Markup-, JS- und CSS-Review gesichert.
- Ziel dieses Substeps ist nur die Ausgangslage fuer S4.2 bis S4.12.

Mobile-Istnotiz:

- Einstieg ins Termine-Panel:
  - grosse `Kommende Termine`-Summary innerhalb `appointments-overview card subtle`
  - Tabs `Uebersicht`, `Erledigt`, `Neu`
  - erste Card sehr hoch, weil Header, Ort-Fallback, Status und zwei Full-width-Aktionen Platz brauchen
- Scrollzustand:
  - Cards laufen einspaltig.
  - `Erledigt` und `Loeschen` werden als gleichwertige breite Buttons dargestellt.
  - Header mit Titel und Datum/Zeit wirkt auf engem Viewport gedrueckt.

Desktop-/Code-Istnotiz:

- `index.html`:
  - Panel-ID: `#hubAppointmentsPanel`
  - Tabs: `#appointmentsTabOverviewBtn`, `#appointmentsTabDoneBtn`, `#appointmentsTabNewBtn`
  - Listencontainer: `#appointmentsColumns`, `#appointmentsDoneColumns`
  - Form: `#appointmentsForm`
- `app/modules/appointments/index.js`:
  - `formatDateDisplay(...)` nutzt aktuell `toLocaleDateString('de-AT', ...)`.
  - `renderOverview()` baut offene und erledigte Cards mit derselben HTML-Struktur.
  - `updateSubtitle()` schreibt aktuell offene/gesamt und erledigte Zaehler.
  - `handleCardAction(...)` ist der zentrale Toggle/Delete-Pfad.
  - `getUpcoming()` bleibt Assistant-/Hub-Integrationspfad.
  - `init()` bindet aktuell nur `panelRefs.columns` an `handleCardAction`.
- `app/styles/hub.css`:
  - `.appointments-overview-header` ist flex mit `justify-content: space-between`.
  - `.appointments-columns` ist Desktop dreispaltig und bei `max-width: 900px` einspaltig.
  - `.appointments-card` nutzt `padding: 16px`, `radius-lg`, `gap: 12px`.
  - `.appointments-card header` ist horizontal flex.
  - globale Mobile-Regel setzt `.hub-panel .appointments-actions` auf column/full-width.
  - bei sehr schmalem Mobile wird `.appointments-overview-header` bereits vertikal.
- `app/styles/utilities.css`:
  - `.appointments-card .appointments-meta` ist klein, muted und opacity-reduziert.

Betroffene Dateien fuer die naechsten Substeps:

- S4.2/S4.3/S4.5/S4.6:
  - `app/modules/appointments/index.js`
- S4.4:
  - `index.html`
  - `app/modules/appointments/index.js`
  - `app/styles/hub.css`
- S4.7:
  - `app/styles/hub.css`
- S4.8:
  - `index.html`
  - ggf. `app/styles/hub.css`
- S4.9/S4.10:
  - alle beruehrten Appointments-Dateien

Lokaler Check:

- `node --check app/modules/appointments/index.js` sauber.
- `git diff --check -- docs/MIDAS Appointments UI Polish Roadmap.md app/modules/appointments/index.js app/styles/hub.css index.html` sauber.

S4.1 Code Review:

- Keine App-Code-Aenderung in S4.1, daher keine neue Runtime-Regression.
- Baseline bestaetigt bekannte Code-Risiken:
  - Done-Tab-Aktionen sind aktuell wahrscheinlich nicht gebunden.
  - sichtbare Wiederholungswerte koennen technisch wirken, falls `monthly`/`annual` gerendert werden.
  - Formular- und Card-Actions teilen aktuell dieselbe Klasse `appointments-actions`; S4.7 muss selektiv arbeiten.
- Tool-Hinweis:
  - Einzelne Shell-Ausgaben koennen Unicode-Copy unterschiedlich darstellen.
  - S4.10/S5 muessen reale Dateiinhalte und sichtbare App-Copy pruefen, nicht nur eine einzelne Konsolendarstellung.

S4.1 Contract Review:

Review-Frage:

- Wurde nur die Baseline gesichert, ohne S2/S3-Entscheidungen vorweg in Code umzusetzen oder Scope zu erweitern?

Entscheidung:

- Ja. S4.1 bleibt Dokumentations-/Baseline-Arbeit innerhalb des UI-Umsetzungsblocks.

Findings:

- APT-S4-1-CR-F1: Die Klasse `appointments-actions` wird im Formular und in Cards verwendet. Eine mobile Ausnahme darf daher nicht auf `.appointments-actions` allgemein zielen.
- APT-S4-1-CR-F2: `formatDateDisplay(...)` ist isoliert genug fuer S4.2, aber Card-Markup und `getUpcoming()` duerfen nicht vermischt werden.
- APT-S4-1-CR-F3: `updateSubtitle()` ist Teil der Summary-Logik und muss in S4.4 mit der finalen Copy abgestimmt werden.
- APT-S4-1-CR-F4: Die bestehende Card-Struktur wird in `renderOverview()` fuer offen und erledigt gemeinsam gebaut; S4.3 muss Status-/Action-Unterschiede statusabhaengig und nicht ueber getrennte Copy-Duplikate loesen.

Korrekturen aus S4.1:

- S4.7 bleibt explizit auf `.appointments-card .appointments-actions` begrenzt.
- S4.2 darf nur Anzeige-Helper anfassen, nicht `getUpcoming()`-Datenvertrag.
- S4.4 muss `updateSubtitle()` als Pflichtstelle behandeln.
- S4.3 muss einen gemeinsamen Card-Builder erhalten oder den bestehenden gemeinsamen Builder sauber weiterentwickeln.

Restrisiko:

- Kein Live-Browser-Screenshot in S4.1 erstellt; Live-/Device-Smokes bleiben wie geplant in S5.
- Echte Supabase-Daten und Auth-Session werden erst im spaeteren Browser-Smoke relevant.

Schritt-Abnahme:

- S4.1 ist abgeschlossen.
- Doku-Sync-Entscheidung: Keine Modul-/QA-Doku-Aenderung vor S6.
- Commit-Empfehlung: Noch kein separater Commit noetig; S4.1 ist Baseline-/Roadmap-Arbeit.

### S4.2 Datumsformat-Helper 23.05.2026

Umsetzung:

- `app/modules/appointments/index.js` angepasst.
- `formatDateDisplay(...)` baut den numerischen Datumsteil jetzt stabil selbst:
  - `dd.mm.yyyy`
  - fuehrende Nullen fuer Tag und Monat
  - lokale Date-Parts aus dem bestehenden `Date`-Objekt
- Neuer kleiner Helper `formatWeekday(...)` nutzt `Intl.DateTimeFormat('de-AT', { weekday: 'short' })` nur fuer den optionalen Wochentag.
- Rueckgabe bleibt kompatibel zur bestehenden Card-Ausgabe:
  - `Mo., 15.06.2026`
  - `renderOverview()` haengt weiterhin ` - ${appt.time || '--:--'}` an.
- `includeWeekday: false` ist als interne Option vorbereitet, falls S4.3/S4.7 auf sehr schmalen Viewports eine kuerzere Anzeige braucht.

Betroffene Dateien:

- `app/modules/appointments/index.js`
- `docs/MIDAS Appointments UI Polish Roadmap.md`

Lokaler Check:

- `node --check app/modules/appointments/index.js` sauber.
- `git diff --check -- app/modules/appointments/index.js docs/MIDAS Appointments UI Polish Roadmap.md` sauber.
- Isolierte Probe der Formatlogik:
  - `2026-06-15T05:00:00.000Z` -> `Mo., 15.06.2026`
  - ohne Wochentag -> `15.06.2026`
  - `null` -> `--`
  - invalider Wert -> Originalwert

S4.2 Code Review:

- Geaendert wurde nur die Anzeigeformatierung.
- `computeUpcomingFromState(...)` und `getUpcoming(...)` wurden nicht geaendert.
- Persistenz, `start_at`, lokale Formularzeit und Sortierung bleiben unveraendert.
- `formatWeekday(...)` hat einen Fallback auf leeren String; die numerische Datumsanzeige bleibt auch ohne `Intl` stabil.
- Keine neue Dependency.

S4.2 Contract Review:

Review-Frage:

- Erfuellt die Aenderung den S2-Datumsvertrag, ohne Datenmodell, Zeitsemantik oder Assistant-Kontext zu veraendern?

Entscheidung:

- Ja. Der sichtbare Datumsteil ist jetzt stabil `dd.mm.yyyy`; der Wochentag bleibt optional und deutsch/oesterreichisch.

Findings:

- APT-S4-2-CR-F1: Der Helper liefert aktuell nur Datum plus optionalen Wochentag; die Uhrzeit bleibt bewusst separat aus `appt.time`. Das ist vertragskonform, muss aber in S4.3 beim Card-Umbau erhalten bleiben.
- APT-S4-2-CR-F2: Invalide Datumswerte werden weiterhin als Originalwert zurueckgegeben. Das ist defensiv wie vorher, aber kein neuer Validierungsvertrag.
- APT-S4-2-CR-F3: Git meldet beim Diff einen bestehenden CRLF/LF-Hinweis fuer `app/modules/appointments/index.js`; kein Whitespace-Fehler, aber kein Anlass fuer einen separaten Line-Ending-Refactor in S4.2.

Korrekturen aus S4.2:

- S4.3 muss Datum und Uhrzeit weiterhin zusammen als sichtbare Meta-Zeile zusammensetzen.
- S5 bleibt verantwortlich fuer sichtbare Copy-/Encoding-Pruefung im Browser bzw. an beruehrten Dateien.
- Kein Line-Ending-Refactor in diesem Scope.

Restrisiko:

- Kein Browser-Smoke in S4.2; sichtbare Darstellung wird in S5 gegen echte DOM-Ausgabe geprueft.

Schritt-Abnahme:

- S4.2 ist abgeschlossen.
- Doku-Sync-Entscheidung: Appointments Overview erst in S6 aktualisieren.
- Commit-Empfehlung: Noch kein separater Commit noetig; S4 bleibt in Arbeit.

### S4.3 Termin-Card-HTML 23.05.2026

Umsetzung:

- `renderOverview()` in `app/modules/appointments/index.js` weiterentwickelt.
- Gemeinsamer `buildCard(...)` bleibt erhalten und rendert offene sowie erledigte Termine.
- Card-Struktur umgebaut:
  - Titel oben in `.appointments-title`
  - Datum/Zeit in `.appointments-meta.appointments-time`
  - Ort und Notizen nur bei vorhandenem Wert
  - kein lautes `Ort folgt`
  - kein dauerhaftes `Status: Geplant`
  - keine technische Repeat-Ausgabe wie `monthly`/`annual`
- Wiederholungen werden nur angezeigt, wenn sie gemappt sind:
  - `monthly` -> `Monatlich`
  - `annual` -> `Jaehrlich` in sichtbarer Ausgabe per Unicode-Escape
- Erster offener Termin erhaelt die Klasse `is-next`.
- Erledigte Cards erhalten die Klasse `is-done`.
- Dynamische Werte aus Supabase werden im Card-HTML escaped:
  - Titel
  - Ort
  - Notizen
  - Meta-Zeile

Betroffene Dateien:

- `app/modules/appointments/index.js`
- `docs/MIDAS Appointments UI Polish Roadmap.md`

Lokaler Check:

- `node --check app/modules/appointments/index.js` sauber.
- `git diff --check -- app/modules/appointments/index.js docs/MIDAS Appointments UI Polish Roadmap.md` sauber.
- Gezielter Scan:
  - `Ort folgt` nicht mehr im Card-Renderpfad.
  - `Status:` nicht mehr im Card-Renderpfad.
  - `getUpcoming()` und `computeUpcomingFromState()` nicht geaendert.
  - `doneColumns` Action-Binding noch unveraendert, wie fuer S4.6 geplant.

S4.3 Code Review:

- Der gemeinsame Card-Builder wurde beibehalten; keine duplizierten Offen-/Erledigt-HTML-Pfade.
- Card-Markup trennt Titel, Meta, Details und Actions klarer als vorher.
- `escapeHtml(...)` reduziert das Risiko, dass Supabase-Freitext per `innerHTML` HTML injiziert.
- Wiederholungswerte werden nicht mehr technisch roh angezeigt.
- Ort und Notizen sind optional und dezent.
- Die Action-Buttons bleiben funktional im bestehenden Markup; Action-Hierarchie selbst folgt erst in S4.5/S4.7.

S4.3 Contract Review:

Review-Frage:

- Erfuellt der Card-Umbau S2/S3, ohne Summary, CSS-Polish, Action-Delegation oder Datenvertrag vorzuziehen?

Entscheidung:

- Ja. S4.3 veraendert nur den Renderpfad der Cards und fuegt keine Daten-, Backend- oder Assistant-Semantik hinzu.

Findings:

- APT-S4-3-CR-F1: Neue Klassen `.appointments-card-header`, `.appointments-title`, `.appointments-time`, `.appointments-detail`, `.is-next` und `.is-done` sind noch nicht visuell ausgestaltet. Das ist fuer S4.3 akzeptabel, muss aber in S4.7 behandelt werden.
- APT-S4-3-CR-F2: `is-next` markiert aktuell den ersten offenen Termin in der sortierten Liste. Wenn spaeter vergangene offene Termine vorkommen, kann der Akzent fachlich ungenau sein. S5/S6 sollten das als Restrisiko pruefen.
- APT-S4-3-CR-F3: Done-Tab-Aktionen sind weiterhin nicht gebunden. Das bleibt absichtlich S4.6.
- APT-S4-3-CR-F4: Actions sind noch nicht hierarchisch poliert. Das bleibt absichtlich S4.5/S4.7.
- APT-S4-3-CR-F5: `Loeschen` ist jetzt im beruehrten Card-HTML als korrekt sichtbare Copy vorhanden; S4.10/S5 muessen trotzdem den finalen Copy-/Encoding-Scan machen.

Korrekturen aus S4.3:

- Ort-Zeile auf `muted small` gesetzt.
- Redundante `Erledigt`-Statuszeile im Done-Tab entfernt.
- Roadmap-Pflicht bestaetigt: S4.7 muss die neuen Card-Klassen visuell aufnehmen.
- Roadmap-Pflicht bestaetigt: S4.6 muss Done-Tab-Action-Binding separat korrigieren.

Restrisiko:

- Ohne S4.7-CSS koennen die neuen Klassen noch keine sichtbare Dichteverbesserung liefern.
- `is-next` nutzt die aktuelle Listenreihenfolge; fachlich exakte Future-Filterung wird in S5 gegen `getUpcoming()`/Ist-Daten geprueft.

Schritt-Abnahme:

- S4.3 ist abgeschlossen.
- Doku-Sync-Entscheidung: Appointments Overview erst in S6 aktualisieren.
- Commit-Empfehlung: Noch kein separater Commit noetig; S4 bleibt in Arbeit.

### S4.4 Summary-Kopf 23.05.2026

Umsetzung:

- `index.html` angepasst:
  - Tab `Uebersicht` wurde zu `Offen`.
  - Overview-Headline wurde zu `Offene Termine`.
  - initiale Empty-Copy wurde zu `Noch keine Termine.`
  - Done-Headline wurde zu `Erledigt`.
- `app/modules/appointments/index.js` angepasst:
  - `updateSubtitle()` baut die Summary jetzt aus offenen, gesamten und erledigten Terminen.
  - Offen-Summary:
    - `4 offen - 6 gesamt`
    - optional `Naechster: Mo., 15.06.2026 - 07:00`, aber nur wenn `computeUpcomingFromState(1)` wirklich einen kommenden offenen Termin liefert.
  - Empty States:
    - keine Termine: `Noch keine Termine`
    - Termine vorhanden, aber keine offenen: `Keine offenen Termine`
    - Done leer: `Noch keine erledigten Termine.`
- `app/styles/hub.css` angepasst:
  - Summary-Header kompakter:
    - `margin-bottom: 12px`
    - dezente Bottom-Border
    - kleinere H3-Skalierung ueber `var(--text-lg)`
  - Summary-Text rechts auf breiten Viewports, links im bestehenden Mobile-Column-Layout.

Betroffene Dateien:

- `index.html`
- `app/modules/appointments/index.js`
- `app/styles/hub.css`
- `docs/MIDAS Appointments UI Polish Roadmap.md`

Lokaler Check:

- `node --check app/modules/appointments/index.js` sauber.
- `git diff --check -- index.html app/modules/appointments/index.js app/styles/hub.css docs/MIDAS Appointments UI Polish Roadmap.md` sauber.
- Gezielter Scan:
  - alte Overview-Tab-Copy im App-Markup entfernt.
  - `Insgesamt`/`Eintraege` aus `updateSubtitle()` entfernt.
  - `computeUpcomingFromState(1)` wird nur zur kommenden Summary verwendet.

S4.4 Code Review:

- Summary-Logik bleibt rein visuell/textuell.
- `computeUpcomingFromState(...)` wird gelesen, aber nicht veraendert.
- Kein neuer Datenpfad, kein Backend-Scope, keine neue Persistenz.
- `Naechster`-Hinweis wird nicht aus beliebigem offenem Fallback gebaut, sondern nur aus echter Upcoming-Logik.
- Mobile-Alignment wurde korrigiert, damit die Summary-Zeile bei vertikalem Header links startet.

S4.4 Contract Review:

Review-Frage:

- Verdichtet S4.4 den Summary-Kopf gemaess S2/S3, ohne die Summary wieder zu einem Dashboard oder Kalenderkopf aufzuwerten?

Entscheidung:

- Ja. Die Summary ist kompakter, zaehlt offen/gesamt und nennt optional den naechsten echten kommenden Termin.

Findings:

- APT-S4-4-CR-F1: Ein Fallback von `Naechster` auf den ersten offenen Termin waere fachlich riskant, wenn offene Termine in der Vergangenheit liegen. Korrigiert: `Naechster` erscheint nur bei `computeUpcomingFromState(1)`.
- APT-S4-4-CR-F2: Die Summary-Zeile war auf Mobile durch `text-align: right` im vertikalen Header optisch schief. Korrigiert: Mobile-Scope setzt `.appointments-overview-header .small` links.
- APT-S4-4-CR-F3: `computeUpcomingFromState(1)` in `updateSubtitle()` koppelt Summary an denselben Upcoming-Vertrag wie Assistant. Das ist gewollt, muss in S5 mit `getUpcoming()` regression-geprueft werden.
- APT-S4-4-CR-F4: Die Summary ist textlich kompakter, aber die gesamte `card subtle`-Flaeche kann erst mit S4.7 visuell weiter verdichtet werden.

Korrekturen aus S4.4:

- `Naechster`-Fallback auf offene Alttermine entfernt.
- Mobile-Textausrichtung fuer Summary korrigiert.
- S5-Regressionspunkt `getUpcoming()` bleibt Pflicht, weil Summary jetzt dieselbe Upcoming-Berechnung liest.

Restrisiko:

- Lange Summary-Zeile kann auf sehr schmalen Viewports umbrechen; finaler Textfit bleibt S4.7/S5-Thema.
- Die Card-Flaeche selbst ist noch nicht final verdichtet; das folgt in S4.7.

Schritt-Abnahme:

- S4.4 ist abgeschlossen.
- Doku-Sync-Entscheidung: Appointments Overview erst in S6 aktualisieren.
- Commit-Empfehlung: Noch kein separater Commit noetig; S4 bleibt in Arbeit.

### S4.5 Aktionenhierarchie 23.05.2026

Umsetzung:

- `app/modules/appointments/index.js` angepasst.
- Card-Action-Gruppe erhaelt jetzt:
  - `role="group"`
  - `aria-label="Terminaktionen"`
- Primaeraktion:
  - `Erledigt` im Offen-Tab
  - `Zuruecksetzen` im Erledigt-Tab
  - Klassen: `btn primary small appointments-action-primary`
- Sekundaeraktion:
  - `Loeschen`
  - Klassen: `btn ghost small appointments-action-secondary`
- `data-action="toggle"` und `data-action="delete"` bleiben unveraendert.
- Keine Action-Delegation in S4.5 veraendert; das bleibt S4.6.

Betroffene Dateien:

- `app/modules/appointments/index.js`
- `docs/MIDAS Appointments UI Polish Roadmap.md`

Lokaler Check:

- `node --check app/modules/appointments/index.js` sauber.
- `git diff --check -- app/modules/appointments/index.js docs/MIDAS Appointments UI Polish Roadmap.md` sauber.
- Gezielter Scan bestaetigt:
  - `appointments-action-primary`
  - `appointments-action-secondary`
  - `role="group"`
  - unveraenderte `data-action`-Hooks
  - Done-Tab-Listener weiterhin unveraendert fuer S4.6

S4.5 Code Review:

- Die bestehende Toggle/Delete-Logik bleibt kompatibel, weil `data-action` unveraendert ist.
- Der gemeinsame Card-Builder bleibt erhalten.
- Die Primaer-/Sekundaer-Hierarchie ist im DOM und ueber globale Button-Varianten sichtbar.
- Die neuen Klassen geben S4.7 stabile CSS-Hooks fuer kompakte Card-Actions.
- `getUpcoming()` und Datenpfade wurden nicht geaendert.

S4.5 Contract Review:

Review-Frage:

- Setzt S4.5 die gewuenschte Aktionenhierarchie um, ohne Loeschen zu verstecken, ohne Swipe-only-Pattern und ohne S4.6/S4.7 vorzuziehen?

Entscheidung:

- Ja. Die Primaeraktion ist klarer, `Loeschen` bleibt sichtbar und die technische Action-Delegation bleibt fuer S4.6 separiert.

Findings:

- APT-S4-5-CR-F1: `aria-label` auf einem generischen Container waere ohne Rolle schwach. Korrigiert: Action-Container nutzt `role="group"`.
- APT-S4-5-CR-F2: Durch `btn primary` kann die Primaeraktion auf Mobile aktuell noch full-width und visuell stark sein. Das ist als Zwischenstand akzeptabel, muss aber in S4.7 fuer Card-Dichte feinjustiert werden.
- APT-S4-5-CR-F3: Done-Tab-Aktionen sind weiterhin nicht gebunden. Das bleibt korrekt fuer S4.6 und darf nicht als erledigt gelten.
- APT-S4-5-CR-F4: `Loeschen` ist sichtbar und sekundaer, aber noch nicht kompakt genug. S4.7 muss die Card-Action-Ausnahme visuell umsetzen.

Korrekturen aus S4.5:

- Action-Gruppe mit `role="group"` korrigiert.
- S4.7 bleibt Pflicht fuer mobile Kompaktheit und Button-Breiten.
- S4.6 bleibt Pflicht fuer Done-Tab-Action-Binding.

Restrisiko:

- Bis S4.7 greifen auf Mobile weiterhin globale Full-width-Regeln fuer `.appointments-actions`.
- Bis S4.6 funktionieren Actions im Done-Tab voraussichtlich weiterhin nicht.

Schritt-Abnahme:

- S4.5 ist abgeschlossen.
- Doku-Sync-Entscheidung: Appointments Overview erst in S6 aktualisieren.
- Commit-Empfehlung: Noch kein separater Commit noetig; S4 bleibt in Arbeit.

### S4.6 Action-Delegation 23.05.2026

Umsetzung:

- `app/modules/appointments/index.js` angepasst.
- `handleCardAction(...)` akzeptiert jetzt explizit nur:
  - `data-action="toggle"`
  - `data-action="delete"`
- Der bestehende Click-Handler bleibt auf Card-/Listenebene gescoped.
- `handleCardAction(...)` wird jetzt an beide dynamischen Listencontainer gebunden:
  - `panelRefs.columns`
  - `panelRefs.doneColumns`
- Tabs und Formular bleiben in eigenen Listenern:
  - Tab-Click bleibt auf `.hub-appointments-tabs`
  - Submit bleibt auf `#appointmentsForm`

Betroffene Dateien:

- `app/modules/appointments/index.js`
- `docs/MIDAS Appointments UI Polish Roadmap.md`

Lokaler Check:

- `node --check app/modules/appointments/index.js` sauber.
- `git diff --check -- app/modules/appointments/index.js docs/MIDAS Appointments UI Polish Roadmap.md` sauber.
- Gezielter Scan bestaetigt:
  - `panelRefs.columns?.addEventListener('click', handleCardAction)`
  - `panelRefs.doneColumns?.addEventListener('click', handleCardAction)`
  - `action !== 'delete' && action !== 'toggle'`
  - Tab- und Form-Listener unveraendert.

S4.6 Code Review:

- Done-Tab nutzt jetzt denselben Toggle/Delete-Pfad wie Overview.
- Keine neuen Datenpfade.
- Keine Backend-, SQL- oder Supabase-Query-Aenderung.
- `getUpcoming()` und `computeUpcomingFromState(...)` wurden nicht veraendert.
- Listener bleiben an stabilen Listencontainern haengen; gerenderte Card-Nodes koennen weiter ausgetauscht werden.
- Der Action-Filter verhindert, dass fremde `data-action`-Werte innerhalb einer Card versehentlich in den Delete/Toggle-Pfad fallen.

S4.6 Contract Review:

Review-Frage:

- Korrigiert S4.6 die Done-Tab-Aktionen, ohne Tabs, Submit oder andere Panel-Aktionen mitzuerfassen?

Entscheidung:

- Ja. Delegation ist auf `appointmentsColumns` und `appointmentsDoneColumns` begrenzt.

Findings:

- APT-S4-6-CR-F1: Ein gemeinsamer Panel-Delegate waere breiter als noetig und koennte Tabs/Form-Buttons erfassen. Nicht umgesetzt; stattdessen beide Listencontainer einzeln gebunden.
- APT-S4-6-CR-F2: Ohne Action-Whitelist koennten spaetere Card-Elemente mit anderem `data-action` versehentlich in den Handler fallen. Korrigiert: Handler akzeptiert nur `toggle` und `delete`.
- APT-S4-6-CR-F3: S4.6 macht die Done-Aktionen technisch erreichbar, ersetzt aber keinen Browser-Smoke. S5 muss Done-Tab `Zuruecksetzen` und `Loeschen` weiterhin praktisch pruefen.
- APT-S4-6-CR-F4: Mobile Action-Dichte bleibt unveraendert; S4.7 muss die Card-Action-Ausnahme noch visuell umsetzen.

Korrekturen aus S4.6:

- Done-Tab-Listener hinzugefuegt.
- Action-Whitelist im Handler hinzugefuegt.
- S5-Smoke fuer Done-Tab-Aktionen bleibt Pflicht.

Restrisiko:

- Kein Live-Click-Test in S4.6 ausgefuehrt; Browser-/Device-Smoke bleibt fuer S5.
- Falls Supabase-Session fehlt, koennen echte Delete/Toggle-Smokes lokal eingeschraenkt sein.

Schritt-Abnahme:

- S4.6 ist abgeschlossen.
- Doku-Sync-Entscheidung: Appointments Overview erst in S6 aktualisieren.
- Commit-Empfehlung: Noch kein separater Commit noetig; S4 bleibt in Arbeit.

### S4.7 CSS-Polish 23.05.2026

Umsetzung:

- `app/styles/hub.css` angepasst.
- Summary/Overview:
  - `.appointments-overview` dichter gepolstert.
  - Header-Abstand reduziert.
  - Summary-Zeile mit stabiler Zeilenhoehe und Max-Breite versehen.
- Cards:
  - Padding von 16px auf 12px reduziert.
  - Gap von 12px auf 8px reduziert.
  - Grid-Gap reduziert.
  - neue Card-Klassen visuell aufgenommen:
    - `.appointments-card-header`
    - `.appointments-title`
    - `.appointments-time`
    - `.appointments-detail`
    - `.is-next`
    - `.is-done`
  - lange Titel bekommen `overflow-wrap: anywhere`.
- Actions:
  - Card-Actions erhalten kompaktere Button-Paddings.
  - Primaeraktion darf Platz einnehmen.
  - `Loeschen` bleibt sichtbar, aber mit muted Textfarbe sekundaer.
- Mobile:
  - globale Full-width-Regel fuer `.appointments-actions` wird nur innerhalb von `.appointments-card` ueberschrieben.
  - Formular-Actions bleiben von dieser Ausnahme unberuehrt.
  - Overview-Padding und Card-Gap werden auf Mobile weiter reduziert.
  - Summary-Text bleibt im vertikalen Mobile-Header links ausgerichtet.

Betroffene Dateien:

- `app/styles/hub.css`
- `docs/MIDAS Appointments UI Polish Roadmap.md`

Lokaler Check:

- `git diff --check -- app/styles/hub.css docs/MIDAS Appointments UI Polish Roadmap.md` sauber.
- `node --check app/modules/appointments/index.js` sauber.
- Gezielter CSS-Scan bestaetigt:
  - globale `.hub-panel .appointments-actions`-Regel bleibt bestehen.
  - neue mobile Ausnahme ist auf `.hub-panel .appointments-card .appointments-actions` begrenzt.
  - neue S4.3/S4.5-Klassen sind im CSS aufgenommen.

S4.7 Code Review:

- Kein JS- oder Markup-Verhalten geaendert.
- CSS bleibt im Appointments-/Hub-Scope.
- Keine neuen globalen Tokens oder Dependencies.
- Keine neue Scrollbox.
- Mobile Card-Actions ueberschreiben nur Card-Buttons, nicht Formularaktionen im Neu-Tab.
- `.is-next` ist dezent akzentuiert, ohne Kalender-Farbwelt oder Kategorie-System.

S4.7 Contract Review:

Review-Frage:

- Verdichtet S4.7 die Appointments-Cards und Actions, ohne globale UI-Patterns oder andere Module zu brechen?

Entscheidung:

- Ja. Die Overrides sind auf Appointments-Cards begrenzt und folgen bestehenden Tokens/Buttons.

Findings:

- APT-S4-7-CR-F1: `opacity` auf `.is-done` haette auch Buttons abgedunkelt. Korrigiert: Done-Cards nutzen nur dezenteren Hintergrund/Borderton.
- APT-S4-7-CR-F2: Mobile Full-width-Override musste nach der globalen Mobile-Regel stehen und mindestens gleich spezifisch sein. Korrigiert: `.hub-panel .appointments-card .appointments-actions` und Button-Selector stehen spaeter im Appointments-Block.
- APT-S4-7-CR-F3: Summary-Text kann lang werden. Korrigiert: Max-Breite und Zeilenhoehe gesetzt; finaler Textfit bleibt S5-Smoke.
- APT-S4-7-CR-F4: Formular-Actions duerfen nicht kompakt gemacht werden. Korrigiert: Ausnahme ist auf `.appointments-card` begrenzt.

Korrekturen aus S4.7:

- `.is-done`-Opacity entfernt.
- Mobile Card-Action-Ausnahme scoped und nachgelagert.
- Summary-Zeile mit `max-width` und `line-height` stabilisiert.

Restrisiko:

- Kein Live-Viewport-Smoke in S4.7 ausgefuehrt; mobile Textfit- und Action-Layout-Pruefung bleibt S5.
- `is-next`-Akzent ist visuell dezent, muss aber im Live-Bild gegen MIDAS-Gesamtlook bewertet werden.

Schritt-Abnahme:

- S4.7 ist abgeschlossen.
- Doku-Sync-Entscheidung: CSS Module Overview erst in S6 aktualisieren, falls das neue Card-Action-Pattern dauerhaft als Appointments-Regel gilt.
- Commit-Empfehlung: Noch kein separater Commit noetig; S4 bleibt in Arbeit.

### S4.8 Neu-Tab 23.05.2026

Umsetzung:

- `index.html` angepasst:
  - Submit-Button im Appointments-Formular von Emoji-Copy auf `Termin speichern` reduziert.
- `app/styles/hub.css` angepasst:
  - `.appointments-form` dichter gesetzt.
  - Grid-Minimum von 260px auf 220px reduziert, damit Formularfelder flexibler umbrechen.
  - Grid-Gap reduziert.
  - Notizfeld leicht kompakter.
  - lokale Form-Action-Regel `.appointments-form .appointments-actions` ergaenzt.
- Keine neuen Formularfelder.
- Keine Aenderung an Submit-Logik, Supabase, Datenmodell oder Validierung.

Betroffene Dateien:

- `index.html`
- `app/styles/hub.css`
- `docs/MIDAS Appointments UI Polish Roadmap.md`

Lokaler Check:

- `node --check app/modules/appointments/index.js` sauber.
- `git diff --check -- index.html app/styles/hub.css docs/MIDAS Appointments UI Polish Roadmap.md` sauber.
- Gezielter Scan bestaetigt:
  - Appointments-Submit-Copy ist `Termin speichern`.
  - `&#x1F4BE;` bleibt nur in anderen, nicht beruehrten Vitals-Bereichen.
  - `Jaehrlich` ist im Appointments-Select als echte sichtbare Unicode-Copy vorhanden und nicht mojibake.

S4.8 Code Review:

- Neu-Tab bleibt ein simples Formular.
- Keine neuen Features, keine neue Validierung, keine neue Persistenz.
- Appointments-Formular bleibt vom Card-Action-Override getrennt.
- Globales Full-width-Verhalten fuer Formularaktionen bleibt auf Mobile erhalten.
- Button-Copy ist ruhiger und passt besser zum MIDAS-Polish.

S4.8 Contract Review:

Review-Frage:

- Gleicht S4.8 den Neu-Tab dezent an, ohne aus dem Appointments-Polish ein neues Formular-Feature oder breites UI-Redesign zu machen?

Entscheidung:

- Ja. S4.8 reduziert nur Dichte und Copy-Laerm im bestehenden Formular.

Findings:

- APT-S4-8-CR-F1: Andere Save-Buttons im Repo nutzen weiter Emoji-Copy. Diese liegen ausserhalb des Appointments-Scopes und wurden nicht beruehrt.
- APT-S4-8-CR-F2: `.appointments-form .appointments-actions` darf die Card-Action-Ausnahme nicht aushebeln. Review bestaetigt: Card-Regeln bleiben spezifisch auf `.appointments-card`.
- APT-S4-8-CR-F3: Kleineres Grid-Minimum kann auf Desktop mehr Felder nebeneinander erlauben. Das ist gewollt, muss aber im S5-Viewport-Smoke auf Textfit geprueft werden.
- APT-S4-8-CR-F4: Bestehende Non-ASCII-/Mojibake-Artefakte in nicht beruehrten Dateien/Kommentaren bleiben ausser Scope fuer S4.8.

Korrekturen aus S4.8:

- Emoji aus Appointments-Submit-Copy entfernt.
- Formular-Dichte reduziert, ohne Form-Flow oder Datenlogik zu aendern.
- Scope-Entscheidung dokumentiert: andere Modul-Buttons bleiben unberuehrt.

Restrisiko:

- Formular-Dichte muss im S5-Mobile-Smoke gegen echte Android-Breite geprueft werden.
- Bestehende Encoding-Artefakte ausserhalb der beruehrten Appointments-Copy bleiben fuer S4.10/S5 sichtbar zu scannen, aber nicht automatisch zu refactoren.

Schritt-Abnahme:

- S4.8 ist abgeschlossen.
- Doku-Sync-Entscheidung: Appointments Overview erst in S6 aktualisieren.
- Commit-Empfehlung: Noch kein separater Commit noetig; S4 bleibt in Arbeit.

### S4.9 Empty States und Loading-/Error-Copy 23.05.2026

Umsetzung:

- `app/modules/appointments/index.js` angepasst.
- Loading-Copy ergaenzt:
  - `Termine werden geladen`
- Sync-Fehler-Copy ergaenzt:
  - `Termine konnten nicht geladen werden.`
- Save-Fehler-Copy beruhigt:
  - `Termin konnte nicht gespeichert werden.`
- Action-Fehler-Copy differenziert:
  - Delete: `Termin konnte nicht geloescht werden.`
  - Toggle: `Termin konnte nicht aktualisiert werden.`
- Delete-Erfolgscopy korrigiert:
  - `Termin geloescht` wird ueber HTML-Entity korrekt mit Umlaut gerendert.
- Bestehende Empty States bleiben:
  - `Noch keine Termine`
  - `Keine offenen Termine`
  - `Noch keine erledigten Termine.`

Betroffene Dateien:

- `app/modules/appointments/index.js`
- `docs/MIDAS Appointments UI Polish Roadmap.md`

Lokaler Check:

- `node --check app/modules/appointments/index.js` sauber.
- `git diff --check -- index.html app/modules/appointments/index.js app/styles/hub.css docs/MIDAS Appointments UI Polish Roadmap.md` sauber.
- Copy-Scan bestaetigt:
  - keine alte `Speichern fehlgeschlagen`-Fallback-Copy im Appointments-Modul.
  - kein `Ort folgt` / `Status: Geplant` im Card-Renderpfad.
  - Loading-/Sync-Fehler-Copy vorhanden.

S4.9 Code Review:

- Loading-Copy wird beim Sync-Start gesetzt.
- Sync-Fehler bleibt nicht mehr dauerhaft im Loading-Zustand haengen.
- Technische Fehlerdetails bleiben im Diagnose-Log, nicht in der sichtbaren User-Copy.
- Kein Datenpfad, keine Supabase-Query und keine Persistenzlogik geaendert.

S4.9 Contract Review:

Review-Frage:

- Sind Empty, Loading und Error Copy ruhig, fachlich passend und ohne neue Dringlichkeit?

Entscheidung:

- Ja. Copy bleibt knapp, nicht alarmistisch und Appointments-spezifisch.

Findings:

- APT-S4-9-CR-F1: Durch die neue Loading-Copy waere ein Sync-Fehler ohne sichtbare Korrektur im Loading-Text haengen geblieben. Korrigiert: Sync-Catch setzt Fehler-Copy.
- APT-S4-9-CR-F2: Action-Fehler nutzten vorher denselben Fallback wie Save-Fehler. Korrigiert: Delete/Toggle bekommen eigene ruhige Meldungen.
- APT-S4-9-CR-F3: Technische Supabase-Fehler sollen nicht direkt in sichtbarer User-Copy landen. Korrigiert: sichtbare Copy ist generisch, technische Details bleiben in `diag`.

Korrekturen aus S4.9:

- Sync-Fehler-Copy ergaenzt.
- Save-/Action-Fehler-Copy beruhigt.
- Delete-Erfolgscopy mit korrektem Umlaut-Rendering versehen.

Restrisiko:

- Sichtbares Error-Verhalten muss in S5 im Browser-Smoke geprueft werden, soweit lokal ohne Supabase-Session ausloesbar.

### S4.10 Copy-/Encoding-Review 23.05.2026

Geprueft:

- `index.html`
- `app/modules/appointments/index.js`
- `app/styles/hub.css`

Review-Ergebnis:

- Sichtbare Appointments-Copy ist konsistent:
  - Tabs: `Offen`, `Erledigt`, `Neu`
  - Overview: `Offene Termine`
  - Empty: `Noch keine Termine`, `Keine offenen Termine`, `Noch keine erledigten Termine.`
  - Loading/Error: siehe S4.9
  - Form: `Termin speichern`
  - Actions: `Erledigt`, `Zuruecksetzen`, `Loeschen`
- `monthly`/`annual` tauchen nur noch als technische Values bzw. Mapping-Keys auf.
- Sichtbare Repeat-Copy ist gemappt:
  - `Monatlich`
  - `Jaehrlich` / sichtbarer Umlaut im UI
- Nicht-Appointments-Emoji-Save-Buttons bleiben ausser Scope.
- Bestehende Encoding-Artefakte in nicht beruehrten Kommentaren oder anderen Modulen bleiben ausser Scope.

Findings:

- APT-S4-10-CR-F1: Konsolen-/PowerShell-Ausgabe kann UTF-8-Copy als Mojibake darstellen. `rg` gegen Dateiinhalte zeigt die Appointments-Copy korrekt.
- APT-S4-10-CR-F2: `monthly`/`annual` erscheinen im Scan, sind aber technische Values und keine sichtbare Card-Copy. Kein Codefix noetig.
- APT-S4-10-CR-F3: Andere Module enthalten weiter Save-Emoji und Encoding-Altlasten. Nicht Teil dieses Appointments-UI-Scope.

Korrekturen aus S4.10:

- Keine weitere Code-Korrektur noetig nach S4.9.
- Scope-Entscheidung dokumentiert.

### S4.11 Code Review und Zwischen-Contract-Review 23.05.2026

Code Review:

- Geaenderte App-Dateien:
  - `index.html`
  - `app/modules/appointments/index.js`
  - `app/styles/hub.css`
- Nicht geaendert:
  - SQL
  - Supabase Policies
  - Service Worker / PWA Push
  - Voice / Intent
  - Android
  - externe Kalender
  - Dependencies
- `node --check app/modules/appointments/index.js` sauber.
- `git diff --check` fuer beruehrte Dateien sauber.
- Scope-Scan der Diffs zeigt keine neue Backend-, SQL-, Push-, Voice-, Kalender- oder Dependency-Anforderung.
- Bekannter Git-Hinweis:
  - CRLF/LF-Warnung fuer bestehende Dateien, kein `diff --check`-Fehler.

Contract Review:

Review-Frage:

- Erfuellt S4 den S2/S3-Vertrag: kompakte MIDAS-Agenda, keine Kalender-App, keine Reminder-/Backend-Drift, funktionale CRUD-Pfade erhalten?

Entscheidung:

- Ja, vorbehaltlich S5 Browser-/Device-Smokes.

Findings:

- APT-S4-11-CR-F1: `is-next` basiert im Card-Render weiter auf der sortierten offenen Liste; Summary nutzt echte Upcoming-Logik. Das ist akzeptabel, muss in S5 visuell gegen reale Daten betrachtet werden.
- APT-S4-11-CR-F2: Mobile Textfit fuer lange Summary-Zeilen und lange Titel kann erst im Browser/Device-Smoke final bewertet werden.
- APT-S4-11-CR-F3: Done-Tab-Aktionen sind technisch gebunden, aber noch nicht live geklickt. S5 muss `Zuruecksetzen` und `Loeschen` praktisch pruefen.
- APT-S4-11-CR-F4: Ohne aktive Supabase-Session koennen Save/Toggle/Delete-Smokes lokal eingeschraenkt sein.

Korrekturen aus S4.11:

- Keine weitere Code-Korrektur noetig.
- S5-Smokes bleiben Pflicht fuer:
  - Mobile Textfit
  - Done-Tab-Aktionen
  - `getUpcoming()`
  - Save/Toggle/Delete

### S4.12 Schritt-Abnahme 23.05.2026

S4-Abnahme:

- S4.1 Baseline abgeschlossen.
- S4.2 Datumshelper abgeschlossen.
- S4.3 Card-HTML abgeschlossen.
- S4.4 Summary-Kopf abgeschlossen.
- S4.5 Aktionenhierarchie abgeschlossen.
- S4.6 Action-Delegation abgeschlossen.
- S4.7 CSS-Polish abgeschlossen.
- S4.8 Neu-Tab abgeschlossen.
- S4.9 Empty-/Error-Copy abgeschlossen.
- S4.10 Copy-/Encoding-Review abgeschlossen.
- S4.11 Code-/Contract-Review abgeschlossen.
- S4.12 Abnahme abgeschlossen.

S4-Ergebnis:

- Appointments ist jetzt eine kompaktere MIDAS-Agenda.
- Datum folgt dem AT-Vertrag `dd.mm.yyyy` mit optionalem Wochentag.
- Cards sind dichter, Titel/Meta/Details klarer getrennt.
- `Ort folgt` und `Status: Geplant` sind aus den Cards entfernt.
- `Loeschen` ist sichtbar, aber sekundaer.
- Done-Tab-Actions sind technisch gebunden.
- Neu-Tab ist ruhiger und dichter.

Doku-Sync-Entscheidung:

- Appointments Module Overview, CSS Module Overview und QA werden in S6 aktualisiert, nachdem S5-Smokes abgeschlossen sind.

Commit-Empfehlung:

- Noch kein Commit; erst S5/S6 und anschliessende CodeRabbit-Findings abwarten.

## S5 - Tests, Browser-/Device-Smokes und Contract Review

Ziel:

- Umsetzung lokal und visuell pruefen.

Lokal ausfuehrbare Checks:

- S5.1 `node --check app/modules/appointments/index.js`
- S5.2 `git diff --check`
- S5.3 gezielter Scan:
  - keine neuen Backend-/SQL-/Push-/Voice-Aenderungen
  - keine neuen Dependencies
  - keine Kalender-/Reminder-Scope-Drift
  - beruehrte Appointments-Dateien ohne neue Mojibake-/Encoding-Artefakte
- S5.4 Browser-Smoke Desktop:
  - Panel oeffnet.
  - Tabs wechseln.
  - Liste rendert.
  - Neu-Form speichert weiterhin, sofern Testdaten/Session verfuegbar.
- S5.5 Mobile-Smoke:
  - Android/PWA oder Playwright Mobile Viewport.
  - keine horizontale Ueberbreite.
  - Buttons erreichbar.
  - mindestens zwei Termine besser scanbar als vorher.
- S5.6 Regression:
  - `getUpcoming()` liefert weiter Assistant-/Hub-Kontext.
  - `appointments:changed` feuert weiter.
  - Save/Toggle/Delete funktionieren weiter.
  - Done-Tab: `Zuruecksetzen` und `Loeschen` funktionieren.
  - Overview-Tab: `Erledigt` und `Loeschen` funktionieren.
- S5.7 User-Facing Copy Review:
  - Datum `dd.mm.yyyy`.
  - keine falsche Dringlichkeit.
  - Loeschen wirkt nicht wie Primaeraktion.
  - keine neuen mojibake-/Encoding-Artefakte in sichtbarer Copy.
- S5.8 Contract Review gegen README, Appointments Overview, CSS Overview und diese Roadmap.
- S5.9 Schritt-Abnahme und Commit-Empfehlung.

Nicht lokal oder nur eingeschraenkt pruefbar:

- echter Handy-Smoke auf Stephans Android-PWA.
- echte Supabase-Saves, falls keine aktive Session im lokalen Browser vorhanden ist.

Output:

- Gepruefter UI-Stand.
- Liste ausgefuehrter Checks.
- Liste offener manueller Device-Smokes.

Exit-Kriterium:

- Keine offenen P0/P1-UI- oder Contract-Findings.

### S5 Ergebnisprotokoll 23.05.2026

Ausgefuehrte Checks:

- `node --check app/modules/appointments/index.js`
  - Ergebnis: sauber.
- `git diff --check -- index.html app/modules/appointments/index.js app/styles/hub.css docs/MIDAS Appointments UI Polish Roadmap.md`
  - Ergebnis: sauber.
  - Hinweis: Git meldet bestehende CRLF/LF-Warnungen fuer beruehrte Dateien, aber keine Whitespace-Fehler.
- Mojibake-/Copy-Scan fuer beruehrte Appointments-Dateien:
  - keine Treffer fuer typische Mojibake-Muster, alte ASCII-Fallbacks oder alte Fehler-Copy.
- Scope-Scan im Diff:
  - keine SQL-/RLS-/Backend-Aenderung.
  - keine Push-/Reminder-/Voice-/Kalenderintegration.
  - keine neue Dependency.
  - Treffer `intent` war bestehende Feedback-Telemetrie in Appointments und kein neuer Intent-Fast-Path.

Lokaler Server:

- Statischer Server:
  - `python -m http.server 8765 --bind 127.0.0.1`
  - `http://127.0.0.1:8765/index.html` lieferte HTTP 200.
- Browser-Smokes wurden mit Playwright 1.60.0 ausgefuehrt.
- Supabase wurde im Browser-Smoke nur fuer Appointments mit Testdaten gestubbt; es gab keine echten Backend-Writes.

Mobile-Smoke 390x844:

- Ergebnis:
  - Overview rendert 3 offene Cards.
  - Done rendert 1 erledigte Card.
  - Summary: `3 offen - 4 gesamt | Naechster: Mo., 15.06.2026 - 07:00`
  - Kein `Ort folgt`.
  - Kein `Status: Geplant`.
  - erste offene Card hat `is-next`.
  - Primaeraktion ist breiter als `Loeschen`.
  - `getUpcoming(2)` liefert 2 kommende offene Termine.
  - Neu-Tab zeigt `Termin speichern`.
- Done-Tab-Smoke:
  - `Zuruecksetzen` verschiebt die erledigte Card zurueck in Offen.
- Ueberbreite:
  - `documentElement.scrollWidth` war 4px groesser als Viewport.
  - Debug zeigte Offender ausserhalb Appointments:
    - `.hub-orb-bg`
    - `#loginOverlay`
  - `#hubAppointmentsPanel` lag innerhalb des Viewports.
  - Kein S5-Codefix, da nicht durch Appointments-UI verursacht.

Desktop-Smoke 1280x900:

- Ergebnis:
  - Overview rendert 3 offene Cards.
  - Done rendert 1 erledigte Card.
  - Grid rendert dreispaltig.
  - Summary korrekt.
  - Keine Panel-Ueberbreite.
  - Keine Browser-Console-Errors.

CRUD-Smoke mit Stub:

- Start:
  - 1 offene Card.
  - 1 erledigte Card.
- Save:
  - Formular speichert Testtermin.
  - Overview steigt auf 2 Cards.
  - Formular-Titel wird zurueckgesetzt.
- Delete:
  - offene Card wird geloescht.
  - Overview sinkt wieder.
- Zuruecksetzen:
  - Done-Card wird in Offen verschoben.
  - Done sinkt auf 0.

S5 Code Review:

- Appointments-Code besteht Syntaxcheck.
- Toggle/Delete/Save funktionieren im gestubbten Browser-Smoke.
- `getUpcoming()` bleibt funktionsfaehig.
- `appointments:changed` wird weiter aus den bestehenden Mutation-Pfaden gefeuert.
- Card-Renderpfad nutzt Escape fuer dynamische Werte.
- Scope bleibt bei `index.html`, `app/modules/appointments/index.js`, `app/styles/hub.css` und dieser Roadmap.

S5 Contract Review:

Review-Frage:

- Ist die S4-Umsetzung nach statischen Checks und Browser-Smokes vertragskonform genug, um in S6 Doku/QA zu synchronisieren?

Entscheidung:

- Ja. Es gibt keine offenen P0/P1-Findings fuer Appointments.

Findings:

- APT-S5-CR-F1: Mobile Smoke meldete 4px horizontale Ueberbreite, aber Debug ordnete sie bestehenden Nicht-Appointments-Elementen zu. Kein Appointments-Fix in diesem Scope.
- APT-S5-CR-F2: Browser-Smokes liefen mit gestubbtem Supabase-Client. Echte Supabase/Auth-Smokes bleiben Stephan bzw. Live-Server-Test vorbehalten.
- APT-S5-CR-F3: `is-next` im Card-Render basiert weiterhin auf der sortierten offenen Liste; Summary nutzt echte Upcoming-Logik. Kein P1, aber im Live-Bild mit realen Daten beobachten.
- APT-S5-CR-F4: CRLF/LF-Warnungen bleiben als bestehender Git-Hinweis bestehen; kein Whitespace-Fehler, kein Line-Ending-Refactor.

Korrekturen aus S5:

- Keine weitere Code-Korrektur noetig.
- Residual Risks dokumentiert.

Schritt-Abnahme:

- S5 ist abgeschlossen.
- Doku-Sync-Entscheidung: S6 kann starten.
- Commit-Empfehlung: Noch kein Commit; erst S6 und anschliessende CodeRabbit-Findings abwarten.

## S6 - Doku-Sync, QA-Update und Abschlussreview

Ziel:

- Code, Doku, QA und Roadmap sprechen denselben Appointments-UI-Vertrag.

Substeps:

- S6.1 `docs/modules/Appointments Module Overview.md` aktualisieren:
  - Agenda-UI
  - Datum/Cards/Aktionen
  - keine Reminder-/Voice-Aenderung
- S6.2 `docs/modules/CSS Module Overview.md` aktualisieren, falls neue Pattern-Regeln entstehen.
- S6.3 `docs/QA_CHECKS.md` um Appointments UI Polish Smokes ergaenzen.
- S6.4 Roadmap-Ergebnisprotokolle aktualisieren.
- S6.5 Finaler Contract Review:
  - Roadmap vs. Code
  - Roadmap vs. Module Overviews
  - Roadmap vs. QA
  - Roadmap vs. README-Guardrails
- S6.6 Abschluss-Abnahme:
  - keine offenen P0/P1-Risiken
  - bekannte Restrisiken explizit dokumentiert
  - nicht betroffene Schichten bleiben unberuehrt
- S6.7 Commit-Empfehlung.
- S6.8 Archiv-Entscheidung:
  - aktive Roadmap bleibt in `docs/`
  - nach Abschluss nach `docs/archive/` mit `(DONE)` verschieben

Output:

- Appointments UI Polish ist dokumentiert und QA-faehig.

Exit-Kriterium:

- Roadmap ist commit- oder archivbereit.

### S6 Ergebnisprotokoll 23.05.2026

Durchgefuehrt:

- S6.1 `docs/modules/Appointments Module Overview.md` aktualisiert:
  - Tabs `Offen`, `Erledigt`, `Neu`.
  - kompakte MIDAS-Agenda statt Kalender-Grid.
  - Datums-/Zeitvertrag `dd.mm.yyyy` und `HH:mm`.
  - Card-Vertrag fuer Titel, Meta, echte Details und Aktionen.
  - `Ort folgt` und `Status: Geplant` als permanente Card-Zeilen ausgeschlossen.
  - `getUpcoming()` als reiner Read-Kontext ohne Reminder-/Kalenderlogik dokumentiert.
- S6.2 `docs/modules/CSS Module Overview.md` aktualisiert:
  - Appointments-Card-Actions als lokaler `hub.css`-Override dokumentiert.
  - Neu-Tab-Form-Actions bleiben beim globalen Mobile-Full-width-Pattern.
  - `.hub-panel-scroll` bleibt einziger Hub-Panel-Scrollcontainer.
- S6.3 `docs/QA_CHECKS.md` aktualisiert:
  - Appointments UI Polish Block fuer 23.05.2026 ergaenzt.
  - Static Checks, Playwright-Smokes, CRUD-Smoke, Live-Check und Residuals dokumentiert.
- S6.4 Roadmap aktualisiert:
  - S6 Ergebnisprotokoll ergaenzt.
  - Statusmatrix auf `DONE` gesetzt.
  - Roadmap-Titel auf `(DONE)` gesetzt.
- S6.5 Finaler Contract Review durchgefuehrt.
- S6.6 Abschluss-Abnahme dokumentiert.
- S6.7 Commit-Empfehlung beibehalten.
- S6.8 Archiv-Entscheidung umgesetzt:
  - Roadmap wird nach `docs/archive/MIDAS Appointments UI Polish Roadmap (DONE).md` verschoben.

S6 Finaler Contract Review:

Review-Frage:

- Stimmen Code, Roadmap, Module Overviews, QA und README-Guardrails nach dem Abschluss weiterhin ueberein?

Entscheidung:

- Ja. Der Appointments UI Polish ist als Nebenmodul-Agenda dokumentiert und bleibt ohne Backend-, Kalender-, Reminder-, Push-, Voice- oder Dependency-Drift.

Findings:

- APT-S6-CR-F1: Appointments Overview nannte noch `Uebersicht`; korrigiert auf `Offen` und neuen Agenda-Vertrag.
- APT-S6-CR-F2: CSS Overview kannte die neue Card-Action-Ausnahme noch nicht; korrigiert mit lokaler `hub.css`-Einordnung.
- APT-S6-CR-F3: QA_CHECKS enthielt nur alte Termine-Smokes mit veralteter Copy; korrigiert durch neuen 2026-05-23 Block.
- APT-S6-CR-F4: Roadmap war noch aktiv und S6 war `TODO`; korrigiert auf `(DONE)` und `DONE`.

Restrisiken:

- Mobile Document-Overflow von 4px wurde in S5 Nicht-Appointments-Elementen zugeordnet und bleibt ausserhalb dieses Scopes.
- Browser-Smokes liefen lokal mit gestubbtem Supabase-Client; Stephan hat den Live-Server visuell geprueft.
- Echte Supabase/Auth-Mutation-Smokes koennen bei Bedarf spaeter mit Live-Session wiederholt werden.
- CRLF/LF-Warnungen bleiben bestehende Git-Hinweise; kein Line-Ending-Refactor in diesem Scope.

Abschluss-Abnahme:

- Keine offenen P0/P1-Findings.
- Betroffene Schichten bleiben begrenzt auf Appointments UI, CSS und Doku.
- Nicht betroffene Schichten bleiben unberuehrt:
  - SQL/RLS/Backend
  - Push/Reminder
  - Voice/Intent
  - Android
  - Service Worker
  - Dependencies

Commit-Empfehlung:

```text
ui(appointments): compact mobile agenda panel
```

## Smokechecks / Regression

- Termine-Panel oeffnet und schliesst.
- Tabs `Offen`, `Erledigt`, `Neu` funktionieren.
- Kommende Termine werden kompakt und lesbar dargestellt.
- Erledigte Termine bleiben getrennt.
- Datum wird als `dd.mm.yyyy` angezeigt.
- Uhrzeit wird als `HH:mm` angezeigt.
- Lange Titel umbrechen kontrolliert und ueberlappen Datum/Aktionen nicht.
- `Ort folgt` und `Status: Geplant` werden nicht als permanente Card-Zeilen angezeigt.
- `Erledigt`, `Zuruecksetzen` und `Loeschen` funktionieren.
- Done-Tab-Aktionen sind genauso klickbar wie Overview-Tab-Aktionen.
- `Loeschen` ist nicht als gleichwertige Hauptaktion gestaltet.
- Kein Kalendergrid, keine Reminder, keine Push-Aenderung.
- Kein zweiter Scrollcontainer im Hub-Panel.
- Mobile erzeugt keine horizontale Ueberbreite.
- Assistant-/Hub-Upcoming-Kontext bleibt funktionsfaehig und `getUpcoming()` liefert weiter kommende offene Termine.

## Abnahmekriterien

- Stephan kann am Handy schneller erkennen, welche Termine anstehen.
- Die Liste wirkt dichter und ruhiger, aber nicht gequetscht.
- Das Modul bleibt Nebenmodul und fuehlt sich nicht wie eine Kalender-App an.
- MIDAS-Look bleibt erhalten.
- CRUD-Funktionalitaet bleibt unveraendert.
- Doku und QA beschreiben den neuen UI-Vertrag.

## Commit-Empfehlung

Nach Umsetzung geeignet:

```text
ui(appointments): compact mobile agenda panel
```
