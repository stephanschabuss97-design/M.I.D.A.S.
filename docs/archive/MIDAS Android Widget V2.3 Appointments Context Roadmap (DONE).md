# MIDAS Android Widget V2.3 Appointments Context Roadmap

## Roadmap-Metadaten

| Feld | Wert |
| --- | --- |
| Status | `DONE` |
| Modul / Bereich | Android Widget / Appointments Context |
| Owner / Kontext | Android, Widget, Appointments |
| Erstellt am | `2026-06-29` |
| Letzter Stand | `2026-07-02, S7 abgeschlossen; Doku/QA synchronisiert; bereit fuer Archiv` |
| Aktueller Schritt | `DONE` |
| Betroffene Hauptdateien | `android/app/src/main/java/de/schabuss/midas/widget/*`, `android/app/src/main/java/de/schabuss/midas/web/MidasWebActivity.kt`, `android/app/src/main/res/layout/widget_midas.xml`, `android/app/src/main/res/values/strings.xml`, `app/modules/hub/index.js`, `android/docs/Widget Contract.md`, `docs/modules/Android Widget Module Overview.md`, `docs/modules/Appointments Module Overview.md`, `docs/modules/Ticker Bar Module Overview.md`, `docs/QA_CHECKS.md` |
| Deploy relevant | `nein` |
| Runtime-Smoke relevant | `ja, Android Debug-APK und Device-Smoke` |
| Archivziel | `docs/archive/MIDAS Android Widget V2.3 Appointments Context Roadmap (DONE).md` |

## Current Working State / Handoff

- Aktueller Stand:
  - V2.2 ist abgeschlossen, archiviert und per Device-Smoke akzeptiert.
  - Diese Roadmap baut auf abgeschlossener und getesteter V2.2 auf.
  - Appointments existieren als `appointments_v2` mit `status`, `start_at`, `title`, `location`, `notes`.
  - Web-Modul stellt `AppModules.appointments.getUpcoming()` bereit.
  - Ticker-Bar zeigt Termine ab 7 Tagen vor Start und ist kein Push-/Reminder-System.
  - Android Widget liest Termine nativ aus `appointments_v2` und rendert den naechsten geplanten Termin dauerhaft als Terminzeile.
  - Nach Terminstart schaltet das Widget beim naechsten nativen Refresh auf den naechsten Termin oder blendet die Row aus.
  - Live-Server-Smoke vom 2026-07-02: Termin am 09.07.2026 wurde eingegeben; Ticker-Bar erscheint wie erwartet.
- Naechster erlaubter Schritt:
  - keine Roadmap-Schritte offen; Archivierung nach Abschluss.
- Aktuell bekannte Findings:
  - `W23-F1`: Termintext ist implementiert und per Homescreen-Smoke plausibilisiert.
  - `W23-F2`: Appointment-Read ist nativ umgesetzt; Bridge bleibt nur Refresh-Trigger.
  - `W23-S2-F1`: Terminzeile wird nur angezeigt, wenn ein kommender `scheduled` Termin existiert.
  - `W23-S2-F2`: Datenquelle ist ein direkter nativer Read aus `appointments_v2`, nicht `v_appointments_v2_upcoming`.
  - `W23-S2-F3`: `appointments_v2` wird in `WidgetRealtimeSync` aufgenommen; WebView-`appointments:changed` darf nativen Refresh anstossen.
  - `W23-S2-F4`: Worker/App-Start/Widget-Tap bleiben Fallback fuer Appointment-Refresh.
  - `W23-S3-F1`: Vier-Zeilen-Layout ist per dynamischer `GONE`-Row und erhoehter Mindesthoehe umgesetzt.
  - `W23-GATE-F1`: WebView-/Legacy-Saves duerfen Appointment-Kontext nicht clobbern; in S4.1 geloest.
  - `W23-S3-F3`: Appointment-REST-Query ist URL-sicher umgesetzt.
  - `W23-S4.2-F1`: Appointment-Read-Fehler blockieren den Kernsnapshot nicht, sondern preserven bestehenden Termin-Kontext.
  - `W23-S4.3-F1`: Terminformatierung ist defensiv und kuerzt Titel vor der Datums-Komposition.
  - `W23-S4.4-F1`: Terminwert bekommt maximale Row-Breite; Titelkuerzung wurde fuer Datums-Sichtbarkeit verschaerft.
  - `W23-S4.5-F1`: `appointments_v2` ist im bestehenden Realtime-Refresh-Muster angebunden.
  - `W23-S4.6-F1`: WebView-`appointments:changed` stoesst nur nativen Refresh an und postet keine Appointment-Daten.
  - `W23-S4.7-F1`: S4-Gesamtreview fand keine Code-Findings; veraltete Roadmap-Iststandssaetze wurden korrigiert.
  - `W23-S5-F1`: `lintDebug` fand einen API-34-Aufruf; auf minSdk-taugliche Jahresableitung korrigiert.
  - `W23-S5-F2`: CodeRabbit-Parserhinweis fuer Appointment-Zeitstempel wurde mit gemeinsamem robustem Parser adressiert.
  - `W23-S6-F1`: Widget-Terminzeile bleibt dauerhaft naechster geplanter Termin; Umschaltung ist refresh-basiert, kein Exact-Alarm.
  - `W23-S6-F2`: App-Ticker-Bar zeigt Termine ab 7 Tagen vor Start statt erst ab 48 Stunden.
  - `W23-S6-F3`: Ticker-Bar-Doku-Hygiene wurde im Zuge von S6.4 bereinigt.
  - `W23-CR-F1`: CodeRabbit-Finding zu doppeltem `profile:changed`-Listener korrigiert.
  - `W23-CR-F2`: CodeRabbit-Finding zu `handleSuggestionConfirmRequest`-Scope korrigiert.
  - `W23-CR-F3`: CodeRabbit-Finding zu Appointment-HTML-Rendering/XSS korrigiert.
  - `W23-S7-F1`: Doku-Drift von V2.2/keine Appointments auf V2.3-Terminvertrag korrigiert.
- Aktuell geaenderte Dateien:
  - `android/app/src/main/java/de/schabuss/midas/widget/DailyWidgetState.kt`
  - `android/app/src/main/java/de/schabuss/midas/web/MidasWebActivity.kt`
  - `android/app/src/main/java/de/schabuss/midas/widget/MidasWidgetProvider.kt`
  - `android/app/src/main/java/de/schabuss/midas/widget/WidgetRealtimeSync.kt`
  - `android/app/src/main/java/de/schabuss/midas/widget/WidgetSnapshotStore.kt`
  - `android/app/src/main/java/de/schabuss/midas/widget/WidgetSyncRepository.kt`
  - `android/app/src/main/res/layout/widget_midas.xml`
  - `android/app/src/main/res/values/strings.xml`
  - `android/app/src/main/res/xml/midas_widget_info.xml`
  - `app/modules/hub/index.js`
  - `docs/modules/Ticker Bar Module Overview.md`
  - diese Roadmap.
- Offene User-Freigaben:
  - keine.
- Wichtige Grenzen fuer den naechsten Chat:
  - Kein Code vor abgeschlossenem S4 Readiness Review.
  - Keine Kalender-App, kein Reminder, kein Push.
  - Keine Termin-CRUD-Funktion im Widget.
  - Jede V2.3-Umsetzung endet mit eigener Debug-APK fuer User-Test.

## Ziel (klar und pruefbar)

Widget V2.3 ergaenzt nach erfolgreicher V2.2 eine ruhige Termin-Kontextzeile.

Pruefbare Zieldefinition:

- Das Widget zeigt den naechsten relevanten geplanten Termin kompakt.
- Die Terminzeile nutzt bestehende Appointments-Daten.
- Lange Titel werden so gekuerzt, dass kein Homescreen-Textueberlauf entsteht.
- Datum wird fuer Oesterreich nutzerfreundlich dargestellt.
- Es entsteht keine Kalender-App, kein Termin-Reminder, kein Push und keine Widget-CRUD-Funktion.
- `:app:assembleDebug` ist gruen.
- Die erzeugte APK kann auf Android installiert und gegen echte Widget-Anzeige getestet werden.

## Problemzusammenfassung

MIDAS hat bereits Terminmodul und Ticker-Bar. Trotzdem kann ein naechster Termin am Homescreen nuetzlich sein, weil das Widget als passiver Daily-Kompass ohnehin regelmaessig sichtbar ist.

Das Risiko ist Ueberladung:

- Titel koennen lang sein.
- Datum/Uhrzeit kann zu breit werden.
- Termine sind selten und duerfen auch bei dauerhafter Anzeige nicht lauter wirken als Medikation oder Blutdruck.
- Das Widget darf nicht zur Kalender-App oder Reminder-Flaeche werden.

V2.3 darf daher nur einen kompakten, passiven Kontext liefern.

## Entscheidungslog

| Datum | Entscheidung | Begruendung | Betroffene Schritte |
| --- | --- | --- | --- |
| `2026-06-29` | V2.3 startet erst nach V2.2-Abschluss | Jede Widget-Stufe soll eigene APK und eigenen User-Test bekommen. | `S1` |
| `2026-06-29` | Terminzeile bleibt passiv | Appointments haben bereits Web-Modul und Ticker; Widget darf nicht zum Kalender werden. | `S2-S4` |
| `2026-06-29` | Nur naechster Termin, keine Liste | Homescreen-Kompass braucht eine kurze Orientierung, keine Agenda. | `S2`, `S3`, `S4` |
| `2026-07-02` | S1 startet auf V2.2-DONE-Basis | V2.2 ist abgeschlossen, archiviert und per Device-Smoke bestaetigt. | `S1` |
| `2026-07-02` | V2.3 ist die vierte Widget-Datenzeile | Echter V2.2-Stand hat drei sichtbare Zeilen: Fluessigkeit, Medikation, Blutdruck. | `S2-S4` |
| `2026-07-02` | Terminzeile ist dynamisch sichtbar | Kein kommender Termin bedeutet keine Terminzeile, nicht `Kein Termin`. | `S2-S4` |
| `2026-07-02` | Android liest Termine direkt aus `appointments_v2` | Die View liefert ab gestern; fuer das Widget ist `start_at >= now` praeziser. | `S2-S4` |
| `2026-07-02` | Appointment-Refresh wird in Realtime und WebView-Event integriert | Termin-Aenderungen sollen wie Medikation/BP zeitnah im Widget landen, ohne Push-/Reminder-Semantik. | `S2-S4` |
| `2026-07-02` | Dynamische 3/4-Zeilen-Wirkung wird akzeptiert | User bestaetigt, dass die wechselnde Terminzeile fuer V2.3 passt; fixe Terminzeile bleibt spaetere Option, falls sie im Alltag stoert. | `S3-S6` |
| `2026-07-02` | Bridge-Preserve wird vorgezogen | WebView-Snapshot-Posts ohne Appointment-Feld duerfen nativ gelesenen Termin-Kontext nicht loeschen. | `S4.1-S4.2` |
| `2026-07-02` | Widget zeigt dauerhaft den naechsten geplanten Termin | Homescreen-Test zeigt, dass der naechste Arzttermin auch ausserhalb eines Reminder-Fensters sinnvoller Kontext ist. | `S6` |
| `2026-07-02` | Widget-Umschaltung erfolgt refresh-basiert | Kein Exact-Alarm/AlarmManager in V2.3; nach Terminstart liefert der naechste native Refresh den Folgetermin oder keine Terminzeile. | `S6` |
| `2026-07-02` | Ticker-Bar-Fenster wird von 48 Stunden auf 7 Tage erweitert | In-App-Ticker ist Kontext, nicht Reminder; 7 Tage passt besser zu seltenen Arztterminen. | `S6` |

## Scope

- Android Widget Datenmodell:
  - naechster Appointment-Kontext als optionaler Snapshot-Wert.
- Android Sync:
  - nativer Read aus `appointments_v2`.
  - nur `scheduled` und kommende Termine ab aktuellem Zeitpunkt.
- Android WebView Bridge:
  - nur falls fuer Live-Snapshot-Konsistenz noetig.
- Widget UI:
  - Terminzeile.
  - kompakte Termin-Copy.
  - Textkuerzung/Truncation.
- Doku/QA:
  - Widget Contract.
  - Android Widget Module Overview.
  - Appointments Module Overview, falls Widget-Consumer dokumentiert werden muss.
  - Ticker Bar Module Overview.
  - QA_CHECKS.
  - diese Roadmap.

## Not in Scope

- Kein Termin-CRUD im Widget.
- Keine Termindetails, Notizen oder Orte, ausser S2 entscheidet bewusst eine sehr kurze Ortsnutzung.
- Keine Ortsnutzung in V2.3.
- Keine Liste mehrerer Termine.
- Kein Kalender-Grid.
- Kein Push, keine Reminder-Kette, kein Alarm.
- Kein exakter Terminzeit-Refresh um z. B. 10:31 via AlarmManager oder Exact Alarm.
- Keine Voice-/Intent-Terminanlage.
- Keine SQL-/RLS-/Backend-/Edge-Function-Aenderung, ausser S1-S3 finden einen harten Blocker.
- Keine Play-Store-/Release-AAB-Arbeit.

## Relevante Referenzen (Code)

- `android/app/src/main/java/de/schabuss/midas/widget/DailyWidgetState.kt`
- `android/app/src/main/java/de/schabuss/midas/widget/WidgetSnapshotStore.kt`
- `android/app/src/main/java/de/schabuss/midas/widget/WidgetSyncRepository.kt`
- `android/app/src/main/java/de/schabuss/midas/widget/WidgetSyncBridge.kt`
- `android/app/src/main/java/de/schabuss/midas/widget/MidasWidgetProvider.kt`
- `android/app/src/main/java/de/schabuss/midas/widget/WidgetRealtimeSync.kt`
- `android/app/src/main/res/layout/widget_midas.xml`
- `android/app/src/main/res/values/strings.xml`
- `app/modules/appointments/index.js`
- `app/modules/hub/index.js`
- `sql/09_Appointments_v2.sql`

## Relevante Referenzen (Doku)

- `README.md`
- `docs/DEV_ENVIRONMENT.md`
- `docs/MIDAS Roadmap Template.md`
- `android/README.md`
- `android/docs/Widget Contract.md`
- `docs/modules/Android Widget Module Overview.md`
- `docs/modules/Android Native Auth Module Overview.md`
- `docs/modules/Appointments Module Overview.md`
- `docs/modules/Ticker Bar Module Overview.md`
- `docs/QA_CHECKS.md`
- `docs/archive/MIDAS Android Widget V2.1 Fluids Medication Roadmap (DONE).md` nach V2.1-Abschluss
- `docs/archive/MIDAS Android Widget V2.2 Blood Pressure Context Roadmap (DONE).md` nach V2.2-Abschluss

Regel:

- Erst V2.1 und V2.2 Abschlussdokus lesen.
- Dann Widget-, Native-Auth-, Appointments- und Ticker-Bar-Dokus lesen.
- Dann betroffene Android- und Appointments-Codepfade lesen.
- Erst nach S4 Readiness Review Code aendern.

## Guardrails

- Widget bleibt read-only.
- Widget bleibt passiver Daily-Kompass.
- Keine Kalender-App.
- Keine Reminder- oder Push-Semantik.
- Termine duerfen nicht lauter wirken als Medikation oder BP.
- Keine langen Termintexte.
- Keine versteckten Writes.
- Keine Browser-UI-State-Abhaengigkeit; Widget rendert aus lokalem Android-Snapshot.
- Datum-/Zeit-Copy muss fuer Oesterreich passen.

## Architektur-Constraints

- `appointments_v2` ist Source of Truth.
- `v_appointments_v2_upcoming` liefert geplante Termine ab gestern plus Zukunft.
- Web-Modul `getUpcoming()` filtert kommende offene Termine.
- Android Widget nutzt einen eigenen nativen Read aus `appointments_v2`.
- `appointments_v2` ist in Supabase Realtime-Publication und wird von `WidgetRealtimeSync` beobachtet.
- `WidgetRealtimeSync` nutzt `appointments_v2` nur als Refresh-Signal fuer den nativen Snapshot-Read.
- Die WebView Bridge soll bei `appointments:changed` einen nativen Widget-Refresh anstossen, aber keine Terminlogik selbst besitzen.
- Widget-Terminvertrag ab S6: angezeigt wird dauerhaft der naechste geplante Termin mit `start_at >= now`.
- Widget-Umschaltung nach Terminstart ist refresh-basiert: Worker, App-Start, Widget-Tap, Realtime oder WebView-Event aktualisieren den Snapshot; kein Exact-Alarm.
- Ticker-Bar-Vertrag ab S6: Termine sind ab 7 Tagen vor Start sichtbar und verschwinden beim naechsten UI-Refresh nach Start.
- Widget-Layout nach V2.2 hat drei sichtbare Datenzeilen; V2.3 fuegt voraussichtlich eine vierte Zeile hinzu oder nutzt einen final beschlossenen kompakten Layoutschnitt.

## Tool Permissions

Allowed:

- Android Widget Dateien aendern.
- Android Ressourcen und Layout aendern.
- Android WebView Widget-Bridge aendern, falls noetig.
- `WidgetRealtimeSync` erweitern, falls S2/S3 das bestaetigen.
- Doku und QA aktualisieren.
- Lokale Checks:
  - aus `android/`: `.\gradlew.bat :app:compileDebugKotlin`
  - aus `android/`: `.\gradlew.bat :app:assembleDebug`
  - `node --check app/modules/hub/index.js`
  - `git diff --check`
  - gezielte `rg`-Scans.
- Nach User-Freigabe:
  - APK auf Android-Geraet testen.
  - `adb devices`.

Forbidden:

- Termin-CRUD im Widget.
- Kalender-/Reminder-/Push-Funktionen.
- Edge Function Deploys.
- SQL-/RLS-Aenderungen ohne explizite neue Freigabe.
- Voice-/Intent-Fast-Path fuer Termine.
- Native Reminder, FCM, AlarmManager.

## Deploy- und Runtime-Status

| Feld | Wert |
| --- | --- |
| Lokale Codeaenderung | `S4 und S6 umgesetzt` |
| Lokale Checks | `S5: git diff --check, compileDebugKotlin, lintDebug, testDebugUnitTest und assembleDebug gruen; S6: node --check app/modules/hub/index.js gruen` |
| Supabase Deploy | `nicht relevant` |
| GitHub Workflow-Smoke | `nicht relevant` |
| Browser-/Device-Smoke | `Homescreen-/Widget-Test erfolgt; Live-Server-Ticker-Smoke 2026-07-02 gruen` |
| Produktive Schreibwirkung | `nein` |
| Letzter Remote-Nachweis | `2026-07-02: Termin 09.07.2026 eingegeben; Ticker-Bar erscheint auf Live Server` |

## Execution Mode

- Sequenziell arbeiten: `S1` bis `S7`.
- Vor S1 V2.1- und V2.2-Abschluss lesen.
- `S1` bis `S3` sind Detektivarbeit und Reviews.
- Nach `S3` gibt es einen S4 Readiness Review.
- S4 wird substepweise umgesetzt.
- S5 baut eine eigene V2.3-Debug-APK.
- S6 dokumentiert und implementiert die nach Homescreen-Test entschiedene Termin-Fenster- und Ticker-Anpassung.
- S7 synchronisiert Doku und QA.

## Skalierung der Roadmap

Diese Roadmap ist mittelgross, weil ein weiteres Modul in den Android-Snapshot kommt und die Widget-Dichte steigt. S1 bis S7 werden voll angewendet.

## Statusmatrix

| ID | Schritt | Status | Ergebnis/Notiz |
| --- | --- | --- | --- |
| S1 | System- und Vertragsdetektivarbeit | DONE | V2.1/V2.2-Abschluss, Appointment-Datenvertrag, Ticker-Bar und Widget-Code gelesen; S1-Findings korrigiert. |
| S2 | Fachlicher/technischer Contract Review | DONE | Sichtbarkeit, Copy, Fallback, Datenquelle, Refresh und Layoutschnitt festgelegt. |
| S3 | Bruchrisiko-, UI-/Copy- und Umsetzungsreview | DONE | Bruchrisiken, Copy, Layoutdichte, Tooling und S4-Substeps konkretisiert. |
| S4 | Umsetzung | DONE | S4.1 bis S4.7 abgeschlossen; keine offenen Code-Findings aus dem S4-Gesamtreview. |
| S5 | Tests, Code Review und Contract Review | DONE | APK gebaut; CodeRabbit-Findings korrigiert; Homescreen-/Widget-Test durch User erfolgt. |
| S6 | Termin-Fenster, Ticker-Bar und Widget-Umschaltvertrag | DONE | Widget bleibt dauerhaft naechster Termin; Ticker-Bar ist auf 7 Tage erweitert; Umschaltung bleibt refresh-basiert. |
| S7 | Doku-Sync, QA-Update und finaler Abschlussreview | DONE | Widget Contract, Module Overviews, QA und Roadmap synchronisiert; Archiventscheidung umgesetzt. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Finding-Klassifizierung

| ID | Severity | Typ | Status | Entscheidung / Zielschritt |
| --- | --- | --- | --- | --- |
| `W23-F1` | `P1` | `UI` / `Copy` | `resolved` | Termintext wird `Titel, Wochentag dd.mm. hh:mm`; Titel wird vor Komposition gekuerzt, Row bleibt einzeilig. |
| `W23-F2` | `P1` | `Code` / `Contract` | `resolved` | Android Widget nutzt direkten nativen Appointment-Read aus `appointments_v2`; Bridge nur als Refresh-Trigger. |
| `W23-F3` | `Watchlist` | `Layout` | `resolved` | Vierte Zeile ist dynamisch und wird bei fehlendem Termin ausgeblendet. |
| `W23-S1-F1` | `P2` | `Roadmap` | `resolved` | Roadmap war noch `DRAFT`/V2.2-wartend; auf `ACTIVE`, S1-DONE und S2 umgestellt. |
| `W23-S1-F2` | `P2` | `Tooling` | `resolved` | Gradle-Kommandos waren im alten Root-Stil; auf Ausfuehrung aus `android/` korrigiert. |
| `W23-S1-F3` | `P2` | `Roadmap` / `Layout` | `resolved` | Zeilenzahl war veraltet; V2.3 ist nach echtem V2.2-Stand die vierte Datenzeile. |
| `W23-S1-F4` | `P1` | `Contract` / `Realtime` | `resolved` | S2 legt fest: `appointments_v2` in `WidgetRealtimeSync` aufnehmen und WebView-Event als Refresh-Trigger nutzen. |
| `W23-S1-F5` | `P1` | `Contract` / `Data` | `resolved` | S2 legt fest: direkter nativer Read aus `appointments_v2` mit `start_at >= now`, nicht die View. |
| `W23-S2-F1` | `P1` | `UX` / `Contract` | `resolved` | Sichtbarkeit: Terminzeile nur bei kommendem `scheduled` Termin, sonst ausgeblendet. |
| `W23-S2-F2` | `P1` | `Copy` / `Layout` | `resolved` | Copy: Label `Termin`, Wert `Titel, Mi 22.07. 10:30`; kein Ort, keine Notizen. |
| `W23-S2-F3` | `P1` | `Data` / `Contract` | `resolved` | Datenquelle: nativer `appointments_v2`-Read, `user_id`, `status = scheduled`, `start_at >= now`, sortiert asc, `limit=1`. |
| `W23-S2-F4` | `P1` | `Refresh` / `Contract` | `resolved` | Refresh: Realtime-Collector fuer `appointments_v2`, Worker/App-Start/Tap bleiben Fallback; WebView `appointments:changed` stoesst nativen Refresh an. |
| `W23-S2-F5` | `P2` | `Compatibility` | `resolved` | S3 bestaetigt: Appointment-Feld wird optional; alte Snapshots ohne Feld laden weiter gueltig. |
| `W23-S3-F1` | `P1` | `Layout` | `resolved` | S4.4 setzt vierte Zeile per `GONE` dynamisch um und hebt die Widget-Mindesthoehe auf `120dp`. |
| `W23-S3-F2` | `P1` | `Compatibility` | `superseded` | Durch Gate-Finding `W23-GATE-F1` praezisiert: Preserve muss frueh in S4.1/S4.2 passieren. |
| `W23-S3-F3` | `P1` | `Data` / `Network` | `resolved` | S4.2 baut die Appointment-REST-Query URL-sicher, inklusive `start_at=gte.<Instant>`. |
| `W23-S3-F4` | `P2` | `Copy` | `resolved` | Copy wird kompakt: Wochentag ohne Punkt, `dd.mm.`, `HH:mm`; Beispiel `Nephrologie, Mi 22.07. 10:30`. |
| `W23-S3-F5` | `P2` | `UX` / `Future` | `watchlist` | Fixe Terminzeile bleibt spaeterer Follow-up, falls dynamischer 3/4-Zeilen-Wechsel im Alltag stoert. |
| `W23-GATE-F1` | `P1` | `Compatibility` / `Order` | `resolved` | S4.1: Appointment-Kontext ist optional; Save-Pfade ohne Appointment-Feld erhalten bestehenden Termin-Kontext. |
| `W23-GATE-F2` | `P2` | `Implementation` / `Order` | `resolved` | S4-Reihenfolge angepasst: Modell/Preserve -> nativer Read -> Format -> Layout -> Realtime/WebView-Refresh -> Review. |
| `W23-GATE-F3` | `P2` | `Test` | `resolved` | S5 hat `lintDebug` und `testDebugUnitTest` ausgefuehrt; `testDebugUnitTest` war gruen mit `NO-SOURCE`. |
| `W23-S4.2-F1` | `P2` | `Resilience` / `Contract` | `resolved` | Appointment-Read-Fehler preserven bestehenden Termin-Kontext und blockieren Wasser/Medikation/BP nicht; leere erfolgreiche Antwort speichert `NONE`. |
| `W23-S4.3-F1` | `P2` | `Copy` / `Defensive Rendering` | `resolved` | Formatter normalisiert und kuerzt Titel vor der Datumskomposition; unparsbare oder vergangene Termine rendern nicht. |
| `W23-S4.4-F1` | `P1` | `Layout` / `Overflow` | `resolved` | Appointment-Label ist nur so breit wie noetig, der Wert bekommt die Restbreite; Titel-Maximum auf 12 Zeichen reduziert. |
| `W23-S4.5-F1` | `P2` | `Realtime` / `Refresh` | `resolved` | `WidgetRealtimeSync` registriert `appointments_v2` im bestehenden debounced Snapshot-Refresh-Muster. |
| `W23-S4.6-F1` | `P2` | `WebView Bridge` / `Refresh` | `resolved` | WebView-Event `appointments:changed` ruft nur `requestImmediateRefresh('appointments')` auf; kein `getUpcoming()` und kein Appointment-Post. |
| `W23-S4.7-F1` | `P2` | `Roadmap` / `Handoff` | `resolved` | Veraltete Iststandssaetze zur fehlenden Appointment-Lesung und Realtime-Beobachtung korrigiert. |
| `W23-S5-F1` | `P1` | `Lint` / `Android API` | `resolved` | `LocalDate.ofInstant()` benoetigte API 34; ersetzt durch `now.atZone(zone).year` fuer minSdk 28. |
| `W23-S5-F2` | `P1` | `Parser` / `CodeRabbit` | `resolved` | Appointment-Zeitstempel werden ueber `parseAppointmentInstant()` geparst; `Instant` und `OffsetDateTime`-Formate werden akzeptiert. |
| `W23-S6-F1` | `P2` | `UX` / `Contract` | `resolved` | Widget-Terminzeile bleibt dauerhaft naechster geplanter Termin; Wechsel nach Start erfolgt beim naechsten nativen Refresh, nicht per Exact-Alarm. |
| `W23-S6-F2` | `P2` | `Ticker` / `Contract` | `resolved` | App-Ticker-Bar-Fenster wurde von 48 Stunden auf 7 Tage erweitert und dokumentiert. |
| `W23-S6-F3` | `P2` | `Docs` / `Copy` | `resolved` | Ticker-Bar-Doku-Hygiene korrigiert: Tabellenstil, Bullets und Uhrzeit-Copy `HH:mm`. |
| `W23-CR-F1` | `P2` | `CodeRabbit` / `Perf` | `resolved` | Doppelter `profile:changed`-Listener in `setupAssistantChat()` zu einem Handler konsolidiert. |
| `W23-CR-F2` | `P1` | `CodeRabbit` / `Scope` | `resolved` | `handleSuggestionConfirmRequest` und Follow-up-Helfer in Modul-Scope gehoben; verschachtelte `runAllowedAction`/`runUiSafeAction`-Duplikate entfernt. |
| `W23-CR-F3` | `P1` | `CodeRabbit` / `Security` | `resolved` | Appointment-Kontextliste rendert Termindaten mit DOM-Knoten und `textContent` statt HTML-Template. |
| `W23-S7-F1` | `P2` | `Docs` / `Contract` | `resolved` | Widget Contract und Android Widget Overview standen noch auf V2.2 bzw. `keine Appointments`; auf V2.3-Terminvertrag korrigiert. |

Severity-Vertrag:

- `P0`: blockiert Umsetzung oder kann produktiv falsche/sensible Writes, Auth-Bruch oder harte Datenfehler erzeugen.
- `P1`: echter Contract-/Runtime-/User-Facing-Bug, muss in dieser Roadmap adressiert oder explizit abgegrenzt werden.
- `P2`: Hygiene, Robustheit oder Copy-Verbesserung ohne akuten Blocker.
- `Watchlist`: erkannt, aber nicht Teil dieser Roadmap; nur dokumentieren, wenn es fuer spaetere Reviews relevant ist.
- `contracted`: fachlich entschieden, aber noch nicht umgesetzt.
- `superseded`: durch spaeteren Review-Punkt ersetzt/praezisiert.

---

## S1 - System- und Vertragsdetektivarbeit

Ziel:

- Appointment-Vertrag und Widget-V2.2-Endstand verstehen.

Substeps:

- S1.1 V2.1 und V2.2 Roadmaps/DONE-Dokus lesen.
- S1.2 Widget Contract und Android Widget Overview lesen.
- S1.3 Appointments Module Overview lesen.
- S1.4 Ticker Bar Module Overview lesen.
- S1.5 `sql/09_Appointments_v2.sql` lesen.
- S1.6 `app/modules/appointments/index.js` und `getUpcoming()` lesen.
- S1.7 Android Widget Codepfade nach V2.2 lesen.
- S1.8 Appointment-Datenfluss fuer naechsten Termin mappen.
- S1.9 Contract Review S1.
- S1.10 Findings korrigieren und Schritt-Abnahme dokumentieren.

Exit-Kriterium:

- Es ist klar, wie Android den naechsten Termin ohne neue Writes ableiten kann.

## S2 - Fachlicher/technischer Contract Review

Ziel:

- Finalen Termin-Widgetvertrag festlegen.

Substeps:

- S2.1 Sichtbarkeitsfenster definieren:
  - Ergebnis: Terminzeile nur sichtbar, wenn ein kommender `scheduled` Termin existiert.
  - Ergebnis: kein 48h-Limit fuer das Widget; die Ticker-Bar wird in S6 auf 7 Tage erweitert.
- S2.2 Termin-Copy final festlegen:
  - Ergebnis: Label `Termin`.
  - Ergebnis: Wertformat `<Titel>, <Wochentag> <dd.mm.> <HH:mm>`.
  - Ergebnis: Titelkuerzung vor Komposition, kein Ort, keine Notizen.
- S2.3 Fallback definieren:
  - Ergebnis: keine Terminzeile bei fehlendem Snapshot, fehlendem Termin oder ungueltigen Appointment-Daten.
- S2.4 Datenquelle festlegen:
  - Ergebnis: `appointments_v2` direkt.
  - Ergebnis: `v_appointments_v2_upcoming` nicht fuer V2.3 nutzen.
  - Ergebnis: WebView Bridge nur als Refresh-Trigger, nicht als fachliche Quelle.
- S2.5 Realtime-/Refresh-Vertrag festlegen:
  - Ergebnis: `appointments_v2` in `WidgetRealtimeSync` aufnehmen.
  - Ergebnis: Worker/App-Start/Widget-Tap bleiben Fallback.
  - Ergebnis: WebView `appointments:changed` stoesst nativen Refresh an.
- S2.6 Layoutschnitt final entscheiden:
  - Ergebnis: vierte dynamische Zeile.
  - Ergebnis: neutrales Styling, einzeilig, Ellipsis.
- S2.7 Findings und Pflichtkorrekturen fuer S4 definieren.
- S2.8 Contract Review S2.
- S2.9 Findings korrigieren und Schritt-Abnahme dokumentieren.

Exit-Kriterium:

- Termin-Copy, Sichtbarkeit und technische Ableitung sind eindeutig.

## S3 - Bruchrisiko-, UI-/Copy- und Umsetzungsreview

Ziel:

- Ueberladung und falsche Termin-Semantik vermeiden.

Substeps:

- S3.1 Bruchrisiken identifizieren:
  - Textueberlauf.
  - Zeitzone.
  - Termin in Vergangenheit.
  - mehrere Termine.
  - keine Termine.
  - Realtime-Drift.
  - alte Snapshots.
  - Layout mit vier Zeilen.
- S3.2 User-Facing Copy Review:
  - `Termin`.
  - `Nephrologie, Mi 22.07. 10:30`.
  - `Zahnarzt, Morgen 16:30`.
  - Fallback-Copy.
- S3.3 Layout Review nach V2.2.
- S3.4 Tooling und Checks klaeren.
- S3.5 S4-Substeps konkretisieren.
- S3.6 Contract Review S3.
- S3.7 Findings korrigieren und Schritt-Abnahme dokumentieren.

Exit-Kriterium:

- S4 hat klare Appointment-Substeps und Review-Kriterien.

## S4 Readiness Review - Gate nach S3, vor S4

Ziel:

- S4-Reihenfolge gegen echte Abhaengigkeiten pruefen.

Prueffragen:

- Muss das Layout vor Datenmodell final geschnitten werden?
- Ist die S2-Entscheidung gegen `v_appointments_v2_upcoming` weiterhin durch S3-Bruchrisiken gedeckt?
- Muss `WidgetRealtimeSync` `appointments_v2` beobachten?
- Muss die WebView Bridge `getUpcoming()` verwenden?
- Wie wird alte Snapshot-Persistenz ohne Appointment-Feld geladen?
- Sind Textlaengen fuer deutsche/Oesterreichische Datumsformate begrenzt?

Exit-Kriterium:

- S4 kann ohne offene Termin-Architekturfrage starten.

## S4 - Umsetzung

Ziel:

- Termin-Kontextzeile implementieren.

Geplante Substeps:

- S4.1 Appointment-Snapshot-Modell, Store-Fallback und Preserve-Vertrag definieren.
- S4.2 Nativen Appointment-Read aus `appointments_v2` implementieren, inkl. URL-sicherer Query.
- S4.3 Termin-Auswahl und Textformatierung implementieren.
- S4.4 Widget-Layout, Strings, dynamische Visibility und Textkuerzung umsetzen.
- S4.5 `WidgetRealtimeSync` um `appointments_v2` erweitern.
- S4.6 WebView-`appointments:changed` als nativen Refresh-Trigger anbinden.
- S4.7 Gesamt-Code- und Contract Review; Findings korrigieren.

Jeder Substep endet mit Code Review, Contract Review, Findings und Korrektur der Findings.

Exit-Kriterium:

- V2.3 ist lokal implementiert und bereit fuer S5.

## S5 - Tests, Code Review und Contract Review

Ziel:

- V2.3 pruefen und Debug-APK bereitstellen.

Substeps:

- S5.1 `git diff --check`.
- S5.2 aus `android/`: `.\gradlew.bat :app:compileDebugKotlin`.
- S5.3 aus `android/`: `.\gradlew.bat :app:assembleDebug`.
- S5.4 aus `android/`: `.\gradlew.bat :app:lintDebug`, falls lokal verfuegbar.
- S5.5 aus `android/`: `.\gradlew.bat :app:testDebugUnitTest`, falls lokal verfuegbar.
- S5.6 APK-Pfad dokumentieren.
- S5.7 Optional `adb devices` und Installation nach User-Freigabe.
- S5.8 Device-Smoke definieren oder ausfuehren:
  - kein Termin.
  - Termin heute.
  - Termin morgen.
  - Termin weiter in der Zukunft, je nach S2-Vertrag.
  - langer Titel wird gekuerzt.
  - dynamischer Wechsel 3 Zeilen ohne Termin / 4 Zeilen mit Termin.
  - Widget-Tap aktualisiert Status.
- S5.9 User-Facing Copy Review auf echtem Homescreen.
- S5.10 Code Review gegen Bruchrisiken.
- S5.11 Contract Review gegen Guardrails.
- S5.12 Schritt-Abnahme und Commit-Empfehlung.

Exit-Kriterium:

- Lokale Checks sind gruen und APK ist fuer User-Test verfuegbar oder Device-Smoke ist dokumentiert.

## S6 - Termin-Fenster, Ticker-Bar und Widget-Umschaltvertrag

Ziel:

- Homescreen-Erkenntnis nach dem ersten V2.3-Test sauber in Produktvertrag, Code und Doku uebernehmen.

Substeps:

- S6.1 Widget-Sichtbarkeit finalisieren:
  - Ergebnis: Widget zeigt dauerhaft den naechsten `scheduled` Termin ab `now`.
  - Ergebnis: keine 48h-/7-Tage-Grenze fuer das Widget.
- S6.2 Widget-Umschaltung finalisieren:
  - Ergebnis: Nach Terminstart wird beim naechsten nativen Refresh auf den Folgetermin gewechselt oder die Terminzeile ausgeblendet.
  - Ergebnis: kein AlarmManager, kein Exact Alarm, kein 10:31-Scheduler.
- S6.3 Ticker-Bar-Fenster von 48 Stunden auf 7 Tage erweitern.
- S6.4 `docs/modules/Ticker Bar Module Overview.md` aktualisieren.
- S6.5 Checks:
  - `node --check app/modules/hub/index.js`.
  - `git diff --check`.
- S6.6 Contract Review gegen Guardrails.
- S6.7 Findings korrigieren und Schritt-Abnahme dokumentieren.

Exit-Kriterium:

- App-Ticker nutzt 7 Tage, Widget-Vertrag ist als dauerhaft naechster Termin dokumentiert, und es gibt keine neue Reminder-/Alarm-Semantik.

## S7 - Doku-Sync, QA-Update und finaler Abschlussreview

Ziel:

- Source-of-Truth-Dokus synchronisieren und V2.3 abschliessen.

Substeps:

- S7.1 `android/docs/Widget Contract.md` aktualisieren.
- S7.2 `docs/modules/Android Widget Module Overview.md` aktualisieren.
- S7.3 `docs/modules/Appointments Module Overview.md` aktualisieren, falls Widget-Consumer-Vertrag neu ist.
- S7.4 `docs/modules/Ticker Bar Module Overview.md` pruefen.
- S7.5 `docs/QA_CHECKS.md` aktualisieren.
- S7.6 Roadmap mit Ergebnisprotokollen aktualisieren.
- S7.7 Finaler Contract Review.
- S7.8 Abschluss-Abnahme.
- S7.9 Commit-Empfehlung.
- S7.10 Archiv-Entscheidung nach User-Freigabe.

Exit-Kriterium:

- V2.3 ist dokumentiert, geprueft und abschliessbar.

---

## Ergebnisprotokoll

### S7 - Doku-Sync, QA-Update und finaler Abschlussreview 2026-07-02

Ziel:

- Source-of-Truth-Dokus synchronisieren und V2.3 abschliessen.

Deterministisch abgearbeitet:

- S7.1 `android/docs/Widget Contract.md` aktualisiert.
- S7.2 `docs/modules/Android Widget Module Overview.md` aktualisiert.
- S7.3 `docs/modules/Appointments Module Overview.md` aktualisiert.
- S7.4 `docs/modules/Ticker Bar Module Overview.md` geprueft.
- S7.5 `docs/QA_CHECKS.md` aktualisiert.
- S7.6 Roadmap mit Ergebnisprotokollen aktualisiert.
- S7.7 Finaler Contract Review durchgefuehrt.
- S7.8 Abschluss-Abnahme dokumentiert.
- S7.9 Commit-Empfehlung vorbereitet.
- S7.10 Archiv-Entscheidung umgesetzt.

Doku-Aenderungen:

- `android/docs/Widget Contract.md`
  - `DailyWidgetState` auf V2.3 mit `appointmentSummary` erweitert.
  - Terminvertrag dokumentiert: `appointments_v2`, `status = scheduled`, `start_at >= now`, `order=start_at.asc`, `limit=1`.
  - Widget-Anzeige auf drei feste Zeilen plus optionale Terminzeile aktualisiert.
  - Nicht-Ziele von `keine Appointments` auf keine Termin-CRUD-/Listen-/Reminder-/Alarm-Funktion praezisiert.
- `docs/modules/Android Widget Module Overview.md`
  - Status auf V2.3 aktualisiert.
  - Appointment-Snapshot, Realtime-Refresh und Widget-Render dokumentiert.
  - `appointments:changed` als reines Refresh-Signal dokumentiert.
  - QA-Checkliste auf V2.3 erweitert.
- `docs/modules/Appointments Module Overview.md`
  - Android Widget als passiven Consumer ergaenzt.
  - Widget-Query- und Refresh-Vertrag dokumentiert.
  - Markdown-Tabellenstil korrigiert.
- `docs/modules/Ticker Bar Module Overview.md`
  - geprueft; 7-Tage-Fenster und UI-only-Abgrenzung waren bereits konsistent.
- `docs/QA_CHECKS.md`
  - Phase A10 fuer Android Widget V2.3 Appointments Context ergaenzt.
  - Static Checks, Widget Contract, Ticker-/Live-Smoke, Runtime-Smoke und Guardrails dokumentiert.

Finaler Contract Review:

- Widget bleibt read-only und passiver Daily-Kompass.
- Terminzeile zeigt nur den naechsten geplanten Termin.
- Kein Termin-CRUD, keine Terminliste, kein Ort, keine Notizen, kein Done/Reset/Delete im Widget.
- Keine Reminder-, Push-, FCM-, AlarmManager- oder Exact-Alarm-Semantik.
- Ticker-Bar bleibt UI-Kontext und nutzt 7 Tage vor Terminstart.
- Nach Terminstart bleibt die Widget-Umschaltung refresh-basiert.
- Appointments-Modul bleibt Source of Truth; die WebView postet keine Appointment-Fachdaten in den Widget-Snapshot.

Checks:

- `git diff --check` fuer die S7-Doku-Dateien - gruen.
- Hinweis: Git meldet weiter den bekannten CRLF/LF-Hinweis fuer `docs/modules/Appointments Module Overview.md`; kein Whitespace-Fehler.

Findings:

- `W23-S7-F1`: Widget Contract und Android Widget Overview standen noch auf V2.2 bzw. grenzten `Appointments` als Nicht-Ziel ab.
  - Bewertung: echte Doku-Drift nach V2.3.
  - Korrektur: Dokus auf V2.3-Terminvertrag aktualisiert.

S7-Abnahme:

- Exit-Kriterium erreicht: V2.3 ist dokumentiert, geprueft und abschliessbar.
- Roadmap wird mit `(DONE)` abgeschlossen und ins Archiv verschoben.

Commit-Empfehlung:

- `feat(android): add appointment context to widget`

### S6 - Termin-Fenster, Ticker-Bar und Widget-Umschaltvertrag 2026-07-02

Ausloeser:

- Erster Homescreen-Test zeigte, dass der naechste Termin bereits dauerhaft sichtbar ist.
- Fachliche Neubewertung: Das ist fuer seltene Arzttermine sinnvoller als ein reines 48h-/7-Tage-Widget-Fenster.
- Gleichzeitig soll die In-App-Ticker-Bar frueher Kontext geben als bisher.

Deterministisch abgearbeitet:

- S6.1 Widget-Sichtbarkeit finalisiert.
- S6.2 Widget-Umschaltung finalisiert.
- S6.3 Ticker-Bar-Fenster von 48 Stunden auf 7 Tage erweitert.
- S6.4 Ticker-Bar-Doku aktualisiert.
- S6.5 `node --check app/modules/hub/index.js` ausgefuehrt.
- S6.6 Contract Review gegen Guardrails durchgefuehrt.
- S6.7 Findings korrigiert und Schritt-Abnahme dokumentiert.

S6.1 Detailabnahme:

- Codepfad geprueft:
  - `WidgetSyncRepository.buildAppointmentUrl()` liest direkt aus `appointments_v2`.
  - Filter: `user_id = currentUser`, `status = scheduled`, `start_at >= syncInstant`.
  - Sortierung: `start_at.asc`.
  - Begrenzung: `limit=1`.
- Renderpfad geprueft:
  - `MidasWidgetProvider.formatAppointmentSummary()` kennt kein 48h-/7-Tage-Fenster.
  - Ungueltige oder vergangene Snapshot-Termine werden nicht gerendert.
  - Ein gueltiger kommender Termin macht die Terminzeile sichtbar.
- Ergebnis:
  - Das Widget zeigt dauerhaft den naechsten geplanten Termin.
  - Es gibt keine Widget-Fenstergrenze.
  - Keine Codeaenderung in S6.1 notwendig.

S6.2 Detailabnahme:

- Umschaltpfad geprueft:
  - `WidgetSyncRepository.syncNow()` nutzt pro Sync ein frisches `syncInstant`.
  - `buildAppointmentUrl()` fragt mit `start_at=gte.<syncInstant>` ab.
  - `deriveAppointmentSummary()` ignoriert zusaetzlich lokal vergangene Termine.
  - Nach erfolgreichem Sync speichert `snapshotStore.save()` den neuen Termin-Kontext oder explizit `AppointmentWidgetSummary.NONE`.
  - `MidasWidgetProvider.refreshAll()` rendert danach den neuen Snapshot.
- Refresh-Quellen geprueft:
  - Periodischer WorkManager-Sync laeuft mit 15-Minuten-Intervall.
  - Widget-Tap triggert `ACTION_MANUAL_SYNC` und `WidgetRefreshCoordinator.request(..., force = true)`.
  - App-Start/Resume startet `WidgetRealtimeSync.ensureRunning()` und Catch-up-Refresh.
  - `appointments_v2`-Realtime triggert einen debounced nativen Snapshot-Read.
  - WebView-Event `appointments:changed` ruft `requestImmediateRefresh('appointments')`.
- Verhalten direkt nach Terminstart:
  - Ein alter Snapshot-Termin wird im Provider nicht mehr gerendert, sobald `startInstant.isBefore(now)` gilt.
  - Der Wechsel auf den Folgetermin erfolgt mit dem naechsten erfolgreichen nativen Sync.
  - Ohne Folgetermin wird die Terminzeile ausgeblendet.
- Ergebnis:
  - Umschaltung ist bewusst refresh-basiert.
  - Kein AlarmManager, kein Exact Alarm, kein minutengenauer 10:31-Scheduler.
  - Keine Codeaenderung in S6.2 notwendig.

S6.3/S6.4 Detailabnahme:

- Codepfad geprueft:
  - `app/modules/hub/index.js` definiert `TICKER_WINDOW_DAYS = 7`.
  - `TICKER_WINDOW_MS` wird aus `TICKER_WINDOW_DAYS * 24 * 60 * 60 * 1000` berechnet.
  - `updateTickerBar()` zeigt nur Eintraege mit `entry.ts > now`.
  - Sichtbarkeit startet, wenn `now >= entry.ts - TICKER_WINDOW_MS`.
  - Statusfilter bleibt unveraendert: `done` und `cancelled` werden ausgeblendet.
- Doku-Pfad geprueft:
  - `docs/modules/Ticker Bar Module Overview.md` dokumentiert 7 Tage vor Start.
  - Die QA-Checkliste dokumentiert das Verschwinden zum naechsten UI-Refresh nach Start.
  - Markdown-Hygiene der Ticker-Doku wurde im Zuge von S6.4 korrigiert.
- Ergebnis:
  - App-Ticker ist auf 7 Tage erweitert.
  - Ticker bleibt UI-Kontext, kein Push, kein Alarm, kein Incident.
  - Kein Android-APK-Rebuild notwendig.

S6.5 Check-Detailabnahme:

- Technische Checks:
  - `node --check app/modules/hub/index.js` - gruen.
  - `git diff --check` - gruen.
  - Hinweis: Git meldet weiter den bekannten CRLF/LF-Hinweis fuer `app/modules/hub/index.js`; kein Whitespace- oder Syntaxfehler.

S6.6 Contract-Detailabnahme:

- Contract-Scan:
  - Aktiver Ticker-Vertrag ist 7 Tage vor Start.
  - Einziger `T-2`-Treffer ist historischer S1-Iststand und als solcher markiert.
  - Kein aktiver 48h-Hinweiskanal-Vertrag mehr vorhanden.
  - `AlarmManager`, `Exact Alarm`, Push und Reminder werden nur als Guardrails/Abgrenzung genannt.
- Ergebnis:
  - S6 bleibt im Produktvertrag: Termin-Kontext, kein Reminder.
  - Keine weiteren Code- oder Doku-Korrekturen aus S6.6 notwendig.

S6.7 Findings- und Schritt-Abnahme:

- Findings geprueft:
  - `W23-S6-F1` ist `resolved`.
  - `W23-S6-F2` ist `resolved`.
  - `W23-S6-F3` ist `resolved`.
- Zusaetzliche Roadmap-Hygiene:
  - `W23-GATE-F3` stand noch `open`, obwohl S5 `lintDebug` und `testDebugUnitTest` bereits ausgefuehrt hat.
  - Korrektur: `W23-GATE-F3` auf `resolved` gestellt.
- Schritt-Abnahme:
  - S6 ist fachlich und technisch abgeschlossen.
  - Keine offenen S6-Findings.
  - Naechster Schritt bleibt S7 Doku-Sync, QA-Update und finaler Abschlussreview nach User-Freigabe.

Code-/Doku-Aenderungen:

- `app/modules/hub/index.js`
  - `TICKER_WINDOW_DAYS = 7` eingefuehrt.
  - `TICKER_WINDOW_MS` wird daraus berechnet.
- `docs/modules/Ticker Bar Module Overview.md`
  - Sichtbarkeitsfenster auf 7 Tage vor Terminstart aktualisiert.
  - Ausblendung als naechster UI-Refresh nach Start dokumentiert.
  - Markdown-Tabelle, eingerueckte Bullets und Zeitformat-Copy bereinigt.
- Android Widget-Code:
  - keine Aenderung in S6.
  - Der bestehende native Query-Vertrag `start_at >= now`, `status = scheduled`, `limit=1` liefert bereits dauerhaft den naechsten Termin.
  - Nach Terminstart erfolgt die Umschaltung beim naechsten nativen Refresh.

Checks:

- `node --check app/modules/hub/index.js` - gruen.
- `git diff --check` - gruen.

Live-Server-Smoke:

- Datum: 2026-07-02.
- Testdaten: Termin am 09.07.2026 angelegt.
- Ergebnis: Ticker-Bar erscheint auf dem Live Server.
- Bewertung:
  - Bestaetigt den S6-Vertrag fuer das 7-Tage-Ticker-Fenster.
  - Bestaetigt nicht automatisch den Android-APK-Smoke; dieser bleibt vom Live-Server-Web-Smoke getrennt.
  - Keine weitere Codeaenderung aus dem Live-Server-Smoke notwendig.

Contract Review:

- Widget bleibt passiv und read-only.
- Es gibt keinen exakten 10:31-Refresh, keinen AlarmManager und keinen Exact Alarm.
- Termine bleiben Kontext, nicht Reminder.
- Ticker-Bar ist App-Kontext und darf 7 Tage vorher sichtbar werden.
- APK muss wegen S6 nicht neu gebaut werden, weil kein Android-Native-Code geaendert wurde.

Findings:

- `W23-S6-F1`: Widget-Umschaltung war unausgesprochen.
  - Korrektur: Umschaltung ist explizit refresh-basiert dokumentiert.
- `W23-S6-F2`: Ticker-Bar-Fenster passte nicht mehr zur neuen Termin-UX.
  - Korrektur: 48h-Fenster auf 7 Tage erweitert und dokumentiert.
- `W23-S6-F3`: Ticker-Bar-Doku hatte kleine Markdown-/Copy-Hygiene-Findings.
  - Korrektur: Tabellenstil, Bullets und Uhrzeit-Copy `HH:mm` bereinigt.
- `W23-CR-F1`: CodeRabbit meldete doppelte `profile:changed`-Listener in `setupAssistantChat()`.
  - Bewertung: korrekt; zwei Handler erzeugten doppelte Arbeit und potenziell konkurrierende Renders.
  - Korrektur: zu einem Handler konsolidiert, der Snapshot/Extras/Store und Context-Refresh gemeinsam aktualisiert.
- `W23-CR-F2`: CodeRabbit meldete einen Scope-Fehler fuer `handleSuggestionConfirmRequest`.
  - Bewertung: korrekt; Text-Bestaetigungen konnten aus dem Modul-Scope in einen `ReferenceError` laufen.
  - Korrektur: Suggestion-/Follow-up-Helfer in Modul-Scope gehoben und verschachtelte Action-Helper-Duplikate entfernt.
- `W23-CR-F3`: CodeRabbit meldete DOM-XSS-Risiko bei Terminlisten-Rendering.
  - Bewertung: korrekt; Appointment-Daten wurden per `innerHTML` interpoliert.
  - Korrektur: Rendering auf DOM-Knoten mit `textContent` umgestellt.

S6-Abnahme:

- Exit-Kriterium erreicht: App-Ticker nutzt 7 Tage, Live-Server-Smoke bestaetigt Ticker-Sichtbarkeit, Widget bleibt dauerhaft naechster Termin, keine Reminder-/Alarm-Semantik eingefuehrt.
- Naechster Schritt: S5-Device-Smoke abschliessen oder S7-Doku-/QA-Abschluss nach User-Freigabe.

### S5 - Checks, APK-Build, Code Review und Contract Review 2026-07-02

Hinweis:

- APK wurde nach CodeRabbit-Korrekturen gebaut.
- Installation und Device-Smoke bleiben beim User offen.

Deterministisch abgearbeitet:

- S5.1 `git diff --check`.
- S5.2 aus `android/`: `.\gradlew.bat :app:compileDebugKotlin`.
- S5.3 aus `android/`: `.\gradlew.bat :app:assembleDebug`.
- S5.4 aus `android/`: `.\gradlew.bat :app:lintDebug`.
- S5.5 aus `android/`: `.\gradlew.bat :app:testDebugUnitTest`.
- S5.6 APK-Pfad dokumentiert.
- S5.10 Code Review gegen Bruchrisiken fuer den Pre-APK-Stand.
- S5.11 Contract Review gegen Guardrails fuer den Pre-APK-Stand.

Bewusst offen:

- S5.7 `adb devices` und Installation.
- S5.8 Device-Smoke.
- S5.9 User-Facing Copy Review auf echtem Homescreen.
- S5.12 finale Schritt-Abnahme und Commit-Empfehlung.

Checks:

- `git diff --check` - gruen.
- aus `android/`: `.\gradlew.bat :app:compileDebugKotlin` - gruen.
- aus `android/`: `.\gradlew.bat :app:lintDebug` - nach Korrektur gruen.
  - Hinweis: Gradle schreibt weiterhin bekannte Kotlin-Metadata-Meldungen der Supabase-Abhaengigkeiten auf stderr, beendet aber erfolgreich.
- aus `android/`: `.\gradlew.bat :app:testDebugUnitTest` - gruen, `NO-SOURCE`.
- aus `android/`: `.\gradlew.bat :app:assembleDebug` - gruen.
- APK-Pfad:
  - `android/app/build/outputs/apk/debug/app-debug.apk`
  - Groesse: `40714006` Bytes.
  - Build-Zeitpunkt lokal: `2026-07-02 17:22:41`.

Code Review:

- Der Appointment-Formatter nutzt keine API-34-only Funktion mehr.
- Terminanzeige bleibt defensiv und minSdk-tauglich:
  - `Instant.parse()`.
  - `Instant.atZone(zone).year`.
  - dynamische Row via `GONE`/`VISIBLE`.
- Keine neue Datenquelle oder WebView-Appointment-Postings.
- APK wurde erzeugt, aber noch nicht per Device-Smoke abgenommen.

Contract Review:

- APK-Build-Stand erfuellt den V2.3-Vertrag.
- Android Widget bleibt read-only und passiv.
- Kein Push, kein Reminder, kein Termin-CRUD.
- Device-Smoke muss die echte Homescreen-Anzeige noch bestaetigen.

Findings:

- `W23-S5-F1`: `lintDebug` fand `LocalDate.ofInstant()` als API-34-Aufruf bei minSdk 28.
  - Korrektur: ersetzt durch `now.atZone(zone).year`.
- `W23-S5-F2`: CodeRabbit meldete ein moegliches stilles Ausblenden der Terminzeile bei PostgREST-`timestamptz` mit numerischem Offset.
  - Bewertung: Die starke Behauptung, `Instant.parse()` akzeptiere nur `Z`, ist auf der lokalen JDK-17-Pruefung falsch; `+00:00` wird akzeptiert.
  - Korrektur: trotzdem als sinnvolle Robustheits-Haertung umgesetzt.
  - Neuer gemeinsamer Parser `parseAppointmentInstant()` akzeptiert `Instant.parse()` und als Fallback `OffsetDateTime.parse(...).toInstant()`.
  - Beide Stellen nutzen nun denselben Parser:
    - nativer `appointments_v2`-Read.
    - Widget-Formatter.

S5-Zwischenabnahme:

- APK-Build-Gate erreicht.
- CodeRabbit-Findings aus dem ersten Review sind korrigiert.
- Naechster Schritt:
  - APK installieren.
  - Device-Smoke durchfuehren.
  - Falls Findings auftreten, korrigieren.

### S4.7 - Gesamt-Code- und Contract Review 2026-07-02

Deterministisch geprueft:

- `DailyWidgetState` und `AppointmentWidgetSummary`.
- `WidgetSnapshotStore` inklusive Backcompat und Preserve-Vertrag.
- `WidgetSyncRepository` inklusive nativer `appointments_v2`-Query.
- `MidasWidgetProvider` inklusive Formatter, Visibility und Layout-Anbindung.
- `WidgetRealtimeSync` inklusive neuem `appointments_v2`-Collector.
- `MidasWebActivity` WebView-Injection inklusive `appointments:changed`-Trigger.
- `widget_midas.xml`, `strings.xml`, `midas_widget_info.xml`.
- `sql/09_Appointments_v2.sql` gegen Spalten, RLS und Realtime-Publication.
- `app/modules/appointments/index.js` gegen bestehenden `appointments:changed`-Event.

Code Review:

- Datenquelle ist eindeutig:
  - nativer Read aus `appointments_v2`.
  - kein `v_appointments_v2_upcoming`.
  - kein `getUpcoming()` in der Android-Bridge.
- Snapshot-Backcompat ist intakt:
  - alte Snapshots ohne `appointmentSummary` laden als `NONE`.
  - WebView-Snapshot-Posts ohne Appointment-Feld erhalten bestehenden Termin-Kontext fuer denselben Tag.
- Termin-Read ist defensiv:
  - `status = scheduled`.
  - `start_at >= syncInstant`.
  - lokale Nachvalidierung per `Instant.parse()`.
  - leere erfolgreiche Antwort loescht den Termin-Kontext bewusst.
  - fehlgeschlagener Appointment-Read preservt den bestehenden Termin-Kontext.
- UI bleibt passiv:
  - Terminzeile ist dynamisch `GONE`/`VISIBLE`.
  - kein Fallback-Text `Kein Termin`.
  - einzeilig, neutral, kein Kalender-/Reminder-Charakter.
- Refresh-Pfade sind konsistent:
  - Realtime auf `appointments_v2`.
  - WebView `appointments:changed` ruft nur nativen Refresh.
  - Worker/App-Start/Widget-Tap bleiben Fallback.

Contract Review:

- S2/S3/S4-Readiness-Vertrag erfuellt.
- Keine neuen SQL-, RLS-, Backend- oder Edge-Function-Aenderungen.
- Keine produktiven Writes ausser bestehender lokaler Android-Snapshot.
- Keine Termin-CRUD-Funktion im Widget.
- Keine Push-, Reminder-, Alarm- oder Kalender-App-Semantik.
- S5 muss noch Build-/APK-/Homescreen-Smoke liefern.

Checks:

- aus `android/`: `.\gradlew.bat :app:compileDebugKotlin` - gruen.
- `git diff --check` - gruen.

Findings:

- Keine Code-Findings.
- `W23-S4.7-F1`: Roadmap-Handoff enthielt veraltete Iststandssaetze.
  - Korrektur: Iststand auf nativen `appointments_v2`-Read und Realtime-Beobachtung aktualisiert.

S4.7-Abnahme:

- Exit-Kriterium erreicht: V2.3 ist lokal implementiert und bereit fuer S5.
- Naechster Schritt: S5 Tests, Code Review und Contract Review.

### S4.6 - WebView-`appointments:changed` als nativen Refresh-Trigger 2026-07-02

Umgesetzt:

- `MidasWebActivity` WebView-Injection hoert jetzt auf `appointments:changed`.
- Der Listener ruft nach kurzem Delay:
  - `window.MidasAndroidWidget?.requestImmediateRefresh?.('appointments')`
- Es werden keine Appointment-Daten aus der WebView an den nativen Snapshot gepostet.

Code Review:

- Bestehende Bridge-Methode `requestImmediateRefresh()` wurde genutzt; keine neue Bridge-API noetig.
- Der Refresh-Pfad ruft nativ `WidgetSyncRepository.syncNow()` auf.
- Die fachliche Terminableitung bleibt damit im nativen `appointments_v2`-Read.
- `postSnapshot()` wird fuer Appointments bewusst nicht genutzt.
- Kein `AppModules.appointments.getUpcoming()` im WebView-Bridge-Pfad.

Contract Review:

- S2/S3/S4-Readiness-Vertrag erfuellt: WebView-Bridge ist nur Refresh-Trigger, nicht Datenquelle.
- Preserve-Vertrag aus S4.1 bleibt erhalten: bestehende WebView-Snapshot-Posts ohne Appointment-Feld clobbern den Termin-Kontext nicht.
- Kein Termin-CRUD, kein Kalender, kein Reminder, kein Push.
- Realtime und WebView decken nun beide Appointment-Aenderungen als Refresh-Signale ab.

Checks:

- aus `android/`: `.\gradlew.bat :app:compileDebugKotlin` - gruen.

Findings:

- `W23-S4.6-F1`: WebView-Bridge darf nicht zur zweiten Appointment-Quelle werden.
  - Entscheidung: nur `requestImmediateRefresh('appointments')`, keine Appointment-Daten, kein `getUpcoming()`.

Korrekturen:

- `W23-S4.6-F1` als resolved dokumentiert.
- Roadmap-Handoff auf `S4.7` aktualisiert.

S4.6-Abnahme:

- Exit-Kriterium erreicht: WebView-`appointments:changed` stoesst den nativen Widget-Refresh an, ohne Appointment-Fachdaten selbst zu liefern.
- Naechster Schritt: S4.7 Gesamt-Code- und Contract Review.

### S4.5 - `WidgetRealtimeSync` um `appointments_v2` 2026-07-02

Umgesetzt:

- `WidgetRealtimeSync.ensureRunning()` registriert zusaetzlich `appointments_v2`.
- Die neue Tabelle nutzt das bestehende Collector-Muster:
  - `schema = public`
  - `table = appointments_v2`
  - Filter `user_id = currentUser`
  - Emission in den bestehenden debounced `triggerFlow`.
- Termin-Aenderungen loesen dadurch einen normalen `WidgetSyncRepository.syncNow()` aus.

Code Review:

- Keine eigene Terminlogik im Realtime-Collector.
- Insert, Update und Delete werden wie die bestehenden Tabellen als Refresh-Signal behandelt.
- Debounce, Session-Generation-Check und Scheduler-Fallback bleiben unveraendert.
- Die Sichtbarkeit der Terminzeile wird weiterhin durch den nativen `appointments_v2`-Read und den Snapshot bestimmt.
- Kein neuer Write und kein Push-/Reminder-Verhalten.

Contract Review:

- S2/S3-Refresh-Vertrag erfuellt: `appointments_v2` ist in `WidgetRealtimeSync` aufgenommen.
- Worker, App-Start und Widget-Tap bleiben als Fallback erhalten.
- Die Realtime-Anbindung ist nur ein Snapshot-Catch-up im laufenden Prozess.
- Bridge-Vertrag bleibt offen fuer S4.6: WebView `appointments:changed` muss noch nativen Refresh anstossen.

Checks:

- aus `android/`: `.\gradlew.bat :app:compileDebugKotlin` - gruen.

Findings:

- `W23-S4.5-F1`: Realtime-Erweiterung darf keine eigene Appointment-Quelle werden.
  - Entscheidung: nur Collector registrieren; `syncNow()` bleibt die einzige native Snapshot-Ableitung.

Korrekturen:

- `W23-S4.5-F1` als resolved dokumentiert.
- Roadmap-Handoff auf `S4.6` aktualisiert.

S4.5-Abnahme:

- Exit-Kriterium erreicht: Appointment-Aenderungen koennen den Widget-Snapshot ueber das bestehende Realtime-Muster aktualisieren.
- Naechster Schritt: S4.6 WebView-`appointments:changed` als nativen Refresh-Trigger anbinden.

### S4.4 - Widget-Layout, Strings, dynamische Visibility und Textkuerzung 2026-07-02

Umgesetzt:

- `widget_midas.xml` um eine vierte dynamische Termin-Row erweitert.
- Neue Row:
  - `@+id/widgetAppointmentRow`
  - Label `Termin`
  - Wert `@+id/widgetAppointmentValue`
  - initial `android:visibility="gone"`
  - Wert einzeilig mit `ellipsize="end"` und `maxLines="1"`.
- `MidasWidgetProvider.buildRemoteViews()` verdrahtet die Row:
  - `null` aus `formatAppointmentSummary()` setzt `widgetAppointmentRow` auf `View.GONE`.
  - gueltiger Termin setzt die Row auf `View.VISIBLE`.
  - Terminwert nutzt neutrales Widget-Styling.
- `strings.xml` um `widget_label_appointment` ergaenzt.
- `midas_widget_info.xml` hebt `minHeight` und `minResizeHeight` von `96dp` auf `120dp`.
- `APPOINTMENT_TITLE_MAX_CHARS` wurde von 16 auf 12 reduziert, damit Datum/Uhrzeit auf dem Widget sichtbar bleiben.

Code Review:

- Die Terminzeile ist wirklich dynamisch:
  - ohne Termin kein leerer Text und kein leerer Row-Block.
  - mit Termin wird nur der kompakte Formatter-Wert angezeigt.
- Appointment-Label ist `wrap_content`; der Terminwert bekommt die Restbreite.
- `maxLines=1` und `ellipsize=end` verhindern mehrzeiligen Homescreen-Overflow.
- Die Mindesthoehe passt besser zum Vier-Zeilen-Fall.
- Keine neuen Datenreads, Writes, Realtime- oder WebView-Refresh-Aenderungen in S4.4.

Contract Review:

- S2/S3-Layoutvertrag erfuellt: vierte dynamische Zeile, kein `Kein Termin`-Fallback.
- `W23-S3-F1` erfuellt: dynamische `GONE`-Row und gepruefte Mindesthoehe umgesetzt.
- `W23-F1` erfuellt: Terminwert bleibt einzeilig und wird vorab gekuerzt.
- Widget bleibt read-only, passiv und ohne Kalender-/Reminder-/Push-Semantik.
- Echter Homescreen-Smoke bleibt S5-Pflicht.

Checks:

- aus `android/`: `.\gradlew.bat :app:compileDebugKotlin` - gruen.

Findings:

- `W23-S4.4-F1`: Erster Layoutschnitt gab dem Terminwert zu wenig Breite; Ellipsis haette Datum/Uhrzeit treffen koennen.
  - Entscheidung: Appointment-Label auf `wrap_content`, Wert auf Restbreite, Titel-Maximum auf 12 Zeichen reduziert.

Korrekturen:

- `W23-F1`, `W23-F3`, `W23-S3-F1` und `W23-S4.4-F1` als resolved dokumentiert.
- Roadmap-Handoff auf `S4.5` aktualisiert.

S4.4-Abnahme:

- Exit-Kriterium erreicht: Widget kann den optionalen Termin-Kontext sichtbar, einzeilig und dynamisch rendern.
- Naechster Schritt: S4.5 `WidgetRealtimeSync` um `appointments_v2` erweitern.

### S4.3 - Termin-Auswahl und Textformatierung 2026-07-02

Umgesetzt:

- `MidasWidgetProvider` hat einen defensiven Appointment-Formatter erhalten.
- `formatAppointmentSummary()`:
  - normalisiert den Snapshot ueber `AppointmentWidgetSummary.normalized()`.
  - ignoriert leere, unvollstaendige oder ungueltige Termine.
  - parst `startAt` per `Instant.parse()`.
  - rendert vergangene Termine nicht.
  - baut den finalen Terminwert als `Titel, Wochentag dd.MM. HH:mm`.
- `compactAppointmentTitle()` normalisiert Whitespace und kuerzt den Titel vor der Datumskomposition.
- `formatAppointmentDateTime()` nutzt die Geraete-Zeitzone und deutsches Kurzdatum:
  - gleiches Jahr: `Mi 22.07. 10:30`
  - anderes Jahr: `Mi 22.07.26 10:30`
  - Wochentag wird ohne Punkt gerendert.

Code Review:

- Die Termin-Auswahl aus Supabase bleibt in `WidgetSyncRepository`.
- Die Widget-Anzeigeentscheidung bleibt in `MidasWidgetProvider`.
- Der Formatter ist noch nicht sichtbar verdrahtet; das gehoert bewusst zu S4.4.
- Titelkuerzung passiert vor der Datums-Komposition, damit Datum und Uhrzeit nicht durch Titel-Overflow verschwinden.
- Unparsbare oder vergangene Termine liefern `null` statt falscher Entwarnung oder falscher Anzeige.
- Keine Layout-, Realtime- oder WebView-Refresh-Aenderung in S4.3.

Contract Review:

- S2/S3-Copy-Vertrag erfuellt: `Titel, Wochentag dd.MM. HH:mm`.
- AT-taugliche Darstellung ist vorbereitet.
- Kein Ort, keine Notizen, kein Status und keine Kalender-/Reminder-Semantik.
- Fehlende oder ungueltige Appointment-Daten erzeugen keine Terminzeile.
- `W23-F1` bleibt bis S4.4 teilweise offen, weil einzeilige TextView/Ellipsis erst im Layout umgesetzt wird.

Checks:

- aus `android/`: `.\gradlew.bat :app:compileDebugKotlin` - gruen.

Findings:

- `W23-S4.3-F1`: Termintext darf das Datum nicht verdraengen.
  - Entscheidung: Titel wird vor der Datumskomposition auf eine kompakte Laenge begrenzt.

Korrekturen:

- `W23-S4.3-F1` als resolved dokumentiert.
- Roadmap-Handoff auf `S4.4` aktualisiert.

S4.3-Abnahme:

- Exit-Kriterium erreicht: Termin-Auswahl aus dem Snapshot und Textformatierung sind robust vorbereitet.
- Naechster Schritt: S4.4 Widget-Layout, Strings, dynamische Visibility und Textkuerzung.

### S4.2 - Nativer Appointment-Read aus `appointments_v2` 2026-07-02

Umgesetzt:

- `WidgetSyncRepository.syncNow()` liest zusaetzlich einen Appointment-Snapshot.
- Direkter REST-Read gegen `appointments_v2`:
  - `select=id,title,start_at`
  - `user_id=eq.<currentUser>`
  - `status=eq.scheduled`
  - `start_at=gte.<syncInstant>`
  - `order=start_at.asc`
  - `limit=1`
- Filterwerte werden ueber `urlEncode()` URL-sicher gebaut.
- `deriveAppointmentSummary()` mappt erfolgreiche Antworten auf `AppointmentWidgetSummary`.
- Leere erfolgreiche Antwort speichert explizit `AppointmentWidgetSummary.NONE`.
- Appointment-Read-Fehler liefern `null` und nutzen dadurch den S4.1-Preserve-Vertrag:
  - bestehender Termin-Kontext bleibt erhalten.
  - Wasser/Medikation/BP werden trotzdem aktualisiert.

Code Review:

- `syncInstant` wird fuer Query und lokale Nachfilterung gemeinsam verwendet.
- `start_at` wird lokal nochmals mit `Instant.parse()` geprueft.
- Unparsbare oder bereits vergangene Termine werden ignoriert.
- Nur die erste gueltige Zeile aus der REST-Antwort wird genutzt.
- Keine UI-, Layout-, Realtime- oder WebView-Refresh-Aenderung in S4.2.
- Der neue Appointment-Read ist optionaler Kontext und blockiert den Kernsnapshot nicht bei REST-/Netzwerkfehlern.

Contract Review:

- S2/S3-Datenquellenvertrag erfuellt: direkter nativer Read aus `appointments_v2`, nicht die View.
- `W23-S3-F3` erfuellt: Query-Filter sind URL-sicher.
- `status = scheduled`, `start_at >= now`, `limit=1` sind umgesetzt.
- Kein Termin bedeutet bewusst `NONE`; ein fehlgeschlagener Read bedeutet Preserve.
- Kein neuer Write nach Supabase.
- Keine Kalender-, Reminder-, Push- oder CRUD-Semantik.

Checks:

- aus `android/`: `.\gradlew.bat :app:compileDebugKotlin` - gruen.

Findings:

- `W23-S4.2-F1`: Appointment-Read darf den Kernsnapshot nicht blockieren.
  - Entscheidung: Fehler preserven bestehenden Appointment-Kontext; erfolgreiche leere Antwort speichert `NONE`.

Korrekturen:

- `W23-S3-F3` auf `resolved` gesetzt.
- `W23-S4.2-F1` als resolved dokumentiert.
- Roadmap-Handoff auf `S4.3` aktualisiert.

S4.2-Abnahme:

- Exit-Kriterium erreicht: Android kann den naechsten kommenden `scheduled` Termin direkt aus `appointments_v2` lesen und im lokalen Snapshot-Kontext speichern oder bewusst entfernen.
- Naechster Schritt: S4.3 Termin-Auswahl und Textformatierung.

### S4.1 - Appointment-Snapshot-Modell, Store-Fallback und Preserve-Vertrag 2026-07-02

Umgesetzt:

- `DailyWidgetState` um optionalen `appointmentSummary` erweitert.
- Neues `AppointmentWidgetSummary`-Modell eingefuehrt:
  - `id`
  - `title`
  - `startAt`
  - `hasAppointment`
  - `normalized()`
  - `NONE`
- `WidgetSnapshotStore.load()` liest optionales `appointmentSummary`.
- Alte Snapshots ohne `appointmentSummary` laden weiter als `AppointmentWidgetSummary.NONE`.
- `WidgetSnapshotStore.save()` nimmt optionales `appointmentSummary: AppointmentWidgetSummary? = null` an.
- Preserve-Vertrag umgesetzt:
  - `null` bedeutet: bestehenden Appointment-Kontext fuer denselben Tag erhalten.
  - explizites `AppointmentWidgetSummary.NONE` kann spaeter in S4.2 den Termin-Kontext bewusst loeschen.
  - gueltiger Appointment-Kontext wird als `appointmentSummary` JSON gespeichert.
  - ungueltiger/leerer Appointment-Kontext wird nicht persistiert.

Code Review:

- Bestehende Save-Call-Sites bleiben source-kompatibel, weil der neue Parameter optional ist.
- `DailyWidgetState.empty()` bleibt gueltig, da `appointmentSummary` einen Default hat.
- Store-Backcompat ist defensiv:
  - fehlendes JSON-Feld -> `NONE`
  - unvollstaendiges JSON -> `NONE`
  - altes Snapshot-JSON bleibt ladbar.
- Preserve-Verhalten ist bewusst im Store zentralisiert, nicht in einzelnen Call-Sites.
- Kein UI-, Query-, Realtime- oder WebView-Refresh-Code wurde in S4.1 veraendert.

Contract Review:

- S4.1 erfuellt den Gate-Vertrag `W23-GATE-F1`.
- Widget bleibt read-only.
- Es gibt keine neuen Writes nach Supabase.
- Appointment-Kontext bleibt lokaler Snapshot-Kontext.
- Alte Snapshots und bestehende Bridge-/Legacy-Saves duerfen den Termin-Kontext nicht unabsichtlich loeschen.
- Explizites Loeschen bleibt fuer S4.2 moeglich, indem der native Read `AppointmentWidgetSummary.NONE` uebergibt.

Checks:

- aus `android/`: `.\gradlew.bat :app:compileDebugKotlin` - gruen.

Findings:

- Keine neuen Code-Findings nach Review.

Korrekturen:

- `W23-GATE-F1` auf `resolved` gesetzt.
- Roadmap-Handoff auf `S4.2` aktualisiert.

S4.1-Abnahme:

- Exit-Kriterium erreicht: Appointment-Kontext ist im lokalen Snapshot-Modell vorhanden, rueckwaertskompatibel ladbar und fuer bestehende Save-Pfade preserve-faehig.
- Naechster Schritt: S4.2 nativer Appointment-Read aus `appointments_v2`.

### S4 Readiness Review 2026-07-02

Deterministisch abgearbeitet:

- Readiness-Prueffrage 1: Muss das Layout vor Datenmodell final geschnitten werden?
- Readiness-Prueffrage 2: Ist die S2-Entscheidung gegen `v_appointments_v2_upcoming` weiterhin durch S3-Bruchrisiken gedeckt?
- Readiness-Prueffrage 3: Muss `WidgetRealtimeSync` `appointments_v2` beobachten?
- Readiness-Prueffrage 4: Muss die WebView Bridge `getUpcoming()` verwenden?
- Readiness-Prueffrage 5: Wie wird alte Snapshot-Persistenz ohne Appointment-Feld geladen?
- Readiness-Prueffrage 6: Sind Textlaengen fuer deutsche/Oesterreichische Datumsformate begrenzt?
- Contract Review Readiness durchgefuehrt.
- Findings korrigiert und S4-Reihenfolge aktualisiert.

Prueffrage 1 - Layout vor Datenmodell?

- Entscheidung: Nein.
- Begruendung:
  - Datenmodell und Store muessen zuerst wissen, ob ein Appointment-Kontext vorhanden ist.
  - Render/Layout kann danach sauber mit `GONE`/sichtbar arbeiten.
  - Layout-Schnitt bleibt S4.4, nachdem Modell, Read und Format stehen.

Prueffrage 2 - `v_appointments_v2_upcoming`?

- Entscheidung: Die S2-Entscheidung gegen die View bleibt richtig.
- Begruendung:
  - Die View liefert absichtlich ab gestern.
  - Das Widget braucht den naechsten kommenden Termin ab jetzt.
  - Direkter `appointments_v2`-Read mit `start_at >= now`, `status = scheduled`, `limit=1` ist praeziser.

Prueffrage 3 - Realtime?

- Entscheidung: Ja, `appointments_v2` soll beobachtet werden.
- Begruendung:
  - Die Tabelle ist laut SQL bereits in der Supabase-Realtime-Publication.
  - Ein weiterer Tabellen-Collector passt zum bestehenden V2.2-Realtime-Muster.
  - Worker/App-Start/Widget-Tap bleiben Fallback.
  - Das ist kein Push-/Reminder-Kanal, sondern Snapshot-Catch-up im laufenden Prozess.

Prueffrage 4 - WebView Bridge und `getUpcoming()`?

- Entscheidung: Nein, die Bridge verwendet nicht `getUpcoming()` als Datenquelle.
- Begruendung:
  - Widget soll nicht aus Browser-UI-State rendern.
  - Native Query bleibt Source fuer den lokalen Snapshot.
  - WebView `appointments:changed` soll nur `requestImmediateRefresh('appointments')` anstossen.

Prueffrage 5 - Alte Snapshots / fehlendes Appointment-Feld?

- Entscheidung: Appointment-Kontext ist optional.
- Umsetzungspflicht:
  - Alte Snapshots ohne Feld laden weiter.
  - Save-Pfade ohne Appointment-Feld muessen vorhandenen Appointment-Kontext fuer denselben Tag erhalten.
  - Diese Preserve-Pflicht gehoert frueh in S4.1/S4.2, nicht erst ans Ende.

Prueffrage 6 - Textlaengen?

- Entscheidung: Begrenzung bleibt Pflicht.
- Umsetzungspflicht:
  - Titel normalisieren und vor der Datums-Komposition kuerzen.
  - Datums-/Zeitteil muss sichtbar bleiben.
  - Widget-Wert bleibt einzeilig mit Ellipsis.
  - Device-Smoke prueft langen Titel.

Readiness-Findings:

- `W23-GATE-F1`: Bridge-/Legacy-Saves duerfen Appointment-Kontext nicht clobbern.
  - Korrektur: Preserve-Vertrag in S4.1 vorgezogen; S4.6 ist jetzt nur noch WebView-Refresh-Anbindung.
- `W23-GATE-F2`: S4-Reihenfolge war fachlich richtig, aber Bridge-Haertung zu spaet.
  - Korrektur: S4-Sequenz aktualisiert zu Modell/Preserve -> Read -> Format -> Layout -> Realtime -> WebView-Refresh -> Review.
- `W23-GATE-F3`: S5 sollte nach V2.2-Standard zusaetzlich `lintDebug` und `testDebugUnitTest` versuchen.
  - Korrektur: S5-Substeps um optionale Zusatzchecks erweitert.

Contract Review:

- Keine offene Architekturfrage blockiert S4.
- Direct-Read-, Realtime- und WebView-Refresh-Vertrag sind konsistent.
- Widget bleibt read-only und passiv.
- Keine SQL-/RLS-/Backend-/Edge-Function-Aenderung notwendig.
- S4 kann substepweise starten, wenn S4.1 den optionalen Appointment-Kontext und den Preserve-Vertrag zuerst abdeckt.

Readiness-Abnahme:

- Exit-Kriterium erreicht: S4 kann ohne offene Termin-Architekturfrage starten.
- Naechster Schritt: S4.1.

### S3 - Bruchrisiko-, UI-/Copy- und Umsetzungsreview 2026-07-02

Deterministisch abgearbeitet:

- S3.1 Bruchrisiken identifiziert.
- S3.2 User-Facing Copy Review durchgefuehrt.
- S3.3 Layout Review nach V2.2 durchgefuehrt.
- S3.4 Tooling und Checks geklaert.
- S3.5 S4-Substeps konkretisiert.
- S3.6 Contract Review S3 durchgefuehrt.
- S3.7 Findings korrigiert und Schritt-Abnahme dokumentiert.

S3.1 Bruchrisiken:

- Textueberlauf:
  - Terminwert kann durch lange Titel schnell breiter werden als die Row.
  - S4 muss Titel vor der Komposition kuerzen und den Wert einzeilig mit Ellipsis rendern.
  - Datum/Uhrzeit duerfen nicht durch die Titel-Ellipsis verschwinden.
- Zeitzone:
  - `start_at` ist `timestamptz`.
  - Native Query nutzt UTC-`Instant.now()`.
  - Anzeige nutzt Geraete-Zeitzone via `ZoneId.systemDefault()`.
  - Ungueltige oder unparsbare `start_at`-Werte werden ignoriert.
- Termin in Vergangenheit:
  - Native Query muss `start_at >= now` verwenden.
  - Zusaetzlich muss S4 beim Parsen defensiv gegen alte/ungueltige Zeilen filtern.
- Mehrere Termine:
  - Nur der naechste Termin wird gerendert.
  - Sortierung `start_at asc`, `limit=1`.
- Keine Termine:
  - Terminzeile ist `GONE`.
  - Kein `Kein Termin`, kein Placeholder.
- Realtime-Drift:
  - `appointments_v2` wird in `WidgetRealtimeSync` aufgenommen.
  - Worker/App-Start/Widget-Tap bleiben Fallback.
  - WebView `appointments:changed` stoesst nativen Refresh an.
- Alte Snapshots:
  - Appointment-Kontext ist optional.
  - Alte Snapshots ohne Appointment-Feld muessen normal laden.
  - Bridge-/Legacy-Saves duerfen vorhandenen Appointment-Kontext nicht clobbern.
- Layout mit vier Zeilen:
  - Aktuelles Layout ist aus dem 3-Zeilen-Stand.
  - S4 muss dynamische Termin-Row mit `GONE` umsetzen.
  - S4 muss Spacing/Mindesthoehe pruefen und bei Bedarf kompakter schneiden.

S3.2 User-Facing Copy Review:

- Label bleibt `Termin`.
- Primaeres Wertformat:
  - `<Titel>, <Wochentag> <dd.mm.> <HH:mm>`
  - Beispiel: `Nephrologie, Mi 22.07. 10:30`
- Wochentag wird kompakt ohne Punkt angezeigt:
  - `Mo`, `Di`, `Mi`, `Do`, `Fr`, `Sa`, `So`
- Relative Begriffe sind nur erlaubt, wenn sie Platz sparen und eindeutig bleiben:
  - z. B. `Zahnarzt, Morgen 16:30`
  - S4 darf aber beim stabilen Wochentag-/Datumsformat bleiben, wenn das einfacher und ruhiger ist.
- Fallback-Copy:
  - kein Fallback-Text im Widget.
  - Bei fehlenden Daten wird die Row ausgeblendet.
- Kein Ort, keine Notizen, keine Statusdetails.

S3.3 Layout Review:

- V2.2-Layout hat drei horizontale Rows mit `8dp` vertikalem Abstand.
- V2.3 darf eine vierte Row ergaenzen, muss sie aber bei fehlendem Termin ausblenden.
- User bestaetigt, dass der Wechsel zwischen drei und vier Zeilen fuer V2.3 akzeptiert ist.
- Eine dauerhaft fixe Terminzeile bleibt Watchlist/Future-Option, falls die wechselnde Hoehe spaeter stoert.
- S4 muss pruefen:
  - Termin-Row `GONE`, nicht nur leerer Text.
  - Wert-Text `maxLines=1`, `ellipsize=end`.
  - Label/Wert bleiben lesbar.
  - `midas_widget_info.xml` Mindesthoehe bleibt passend oder wird bewusst angepasst.

S3.4 Tooling und Checks:

- Pflichtchecks bleiben:
  - `git diff --check`
  - aus `android/`: `.\gradlew.bat :app:compileDebugKotlin`
  - aus `android/`: `.\gradlew.bat :app:assembleDebug`
- Empfohlene Zusatzchecks in S5:
  - aus `android/`: `.\gradlew.bat :app:lintDebug`
  - aus `android/`: `.\gradlew.bat :app:testDebugUnitTest`
- Device-Smoke muss beide Zustände pruefen:
  - kein Termin -> drei Zeilen
  - kommender Termin -> vier Zeilen

S3.5 Konkretisierte S4-Pflichten:

- S4.1:
  - `DailyWidgetState` um optionalen Appointment-Kontext erweitern.
  - Store parse/save rueckwaertskompatibel halten.
- S4.2:
  - Native Query direkt gegen `appointments_v2`.
  - Filterwerte URL-sicher bauen.
  - `start_at >= now`, `status = scheduled`, `user_id = currentUser`, `limit=1`.
- S4.3:
  - Termin defensiv parsen.
  - Titel normalisieren und begrenzen.
  - Datumsformat AT-tauglich und kompakt bauen.
- S4.4:
  - `appointments_v2` in `WidgetRealtimeSync` aufnehmen.
- S4.5:
  - Termin-Row, Strings, Visibility und Ellipsis umsetzen.
  - Spacing/Mindesthoehe pruefen.
- S4.6:
  - WebView `appointments:changed` ruft nativen Refresh an, nicht eigenen Appointment-Post.
- S4.7:
  - Gesamt-Code- und Contract Review.

Contract Review:

- S3 bestaetigt S2: direkter `appointments_v2`-Read bleibt die sauberste Datenquelle.
- S3 bestaetigt S2: dynamische Terminzeile bleibt fachlich gewollt.
- Keine neuen Writes, keine Kalender-/Reminder-/Push-Semantik.
- Die Terminzeile bleibt passiver Kontext, kein Handlungs- oder Alarmkanal.
- Backcompat ist als Pflicht vor S4 geklaert: alte Snapshots und Bridge-Saves duerfen nicht brechen.
- Offene Punkte sind konkrete Umsetzungspflichten fuer S4, keine Architekturblocker.

Findings und Korrekturen:

- `W23-S2-F5`: Snapshot-Backcompat war offen.
  - Korrektur: optionales Appointment-Feld und Bridge-Erhaltungsvertrag fuer S4 festgelegt.
- `W23-S3-F1`: Vier-Zeilen-Layout kann bei aktueller Mindesthoehe/Spacing knapp werden.
  - Korrektur: S4 muss dynamische `GONE`-Row, Spacing und Mindesthoehe pruefen.
- `W23-S3-F2`: Bridge-Saves koennten nativen Appointment-Kontext ueberschreiben.
  - Korrektur: durch Readiness Review praezisiert; Preserve-Vertrag wurde in S4.1 vorgezogen.
- `W23-S3-F3`: Appointment-REST-Query braucht URL-sichere Filterwerte.
  - Korrektur: S4.2 um URL-sichere Query-Pflicht erweitert.
- `W23-S3-F4`: Copy musste final kompakter werden.
  - Korrektur: Wochentag ohne Punkt, `dd.mm.`, `HH:mm` festgelegt.
- `W23-S3-F5`: Fixe Terminzeile bleibt moegliche spaetere Alternative.
  - Korrektur: als Watchlist/Future dokumentiert, nicht Teil von V2.3.

S3-Abnahme:

- Exit-Kriterium erreicht: S4 hat klare Appointment-Substeps und Review-Kriterien.
- Naechster Schritt: S4 Readiness Review.

### S2 - Fachlicher/technischer Contract Review 2026-07-02

Deterministisch abgearbeitet:

- S2.1 Sichtbarkeitsfenster definiert.
- S2.2 Termin-Copy final festgelegt.
- S2.3 Fallback definiert.
- S2.4 Datenquelle festgelegt.
- S2.5 Realtime-/Refresh-Vertrag festgelegt.
- S2.6 Layoutschnitt final entschieden.
- S2.7 Findings und Pflichtkorrekturen fuer S4 definiert.
- S2.8 Contract Review S2 durchgefuehrt.
- S2.9 Findings korrigiert und Schritt-Abnahme dokumentiert.

S2.1 Sichtbarkeit:

- Die Terminzeile ist dynamisch.
- Sie wird nur angezeigt, wenn ein kommender `scheduled` Termin existiert.
- Kein Termin bedeutet: Terminzeile wird ausgeblendet.
- Es gibt in V2.3 keine dauerhafte `Kein Termin`- oder `Termin -`-Anzeige.
- Es gibt kein 48h-Limit fuer die Widget-Zeile.
- Die Ticker-Bar wird in S6 auf 7 Tage erweitert; das Widget zeigt den naechsten geplanten Termin als ruhigen Kontext.

S2.2 Termin-Copy:

- Label: `Termin`.
- Wertformat: `<Titel>, <Wochentag> <dd.mm.> <HH:mm>`.
- Beispiel: `Nephrologie, Mi 22.07. 10:30`.
- Bei anderem Kalenderjahr darf S4 eine kompakte Jahresform ergaenzen, sofern sie einzeilig bleibt.
- Titel wird vor der Komposition gekuerzt, damit Datum/Uhrzeit nicht durch Ellipsis verschwinden.
- Kein Ort, keine Notizen, keine Statusdetails.
- Datum/Zeit bleiben AT-tauglich:
  - Wochentag kurz.
  - Datum `dd.mm.`.
  - Uhrzeit `HH:mm`.

S2.3 Fallback:

- Fehlender kompletter Snapshot: keine Terminzeile.
- Snapshot vorhanden, aber kein kommender Termin: keine Terminzeile.
- Ungueltige oder unvollstaendige Appointment-Daten: Termin ignorieren, keine Fehleranzeige im Widget.
- Vorhandener alter Snapshot ohne Appointment-Feld bleibt gueltig.

S2.4 Datenquelle:

- Primaere Datenquelle ist ein direkter nativer Read aus `appointments_v2`.
- Query-Vertrag:
  - `user_id = currentUser`
  - `status = scheduled`
  - `start_at >= now`
  - `order start_at asc`
  - `limit 1`
  - benoetigte Felder: `id`, `title`, `start_at`
- `v_appointments_v2_upcoming` wird fuer V2.3 nicht verwendet, weil sie bewusst Termine ab gestern enthaelt.
- WebView Bridge wird nicht zur fachlichen Appointment-Quelle.

S2.5 Refresh-Vertrag:

- `WidgetRealtimeSync` soll `appointments_v2` beobachten.
- Worker/App-Start/Widget-Tap bleiben Fallback.
- WebView-Event `appointments:changed` darf einen nativen Widget-Refresh anstossen.
- Diese Refresh-Erweiterung ist keine Push-, Reminder- oder Alarmfunktion.

S2.6 Layoutschnitt:

- V2.3 fuegt eine vierte Datenzeile hinzu.
- Die Zeile ist dynamisch sichtbar und bei fehlendem Termin weg.
- Die Zeile nutzt neutrales Styling und darf nicht lauter wirken als Medikation oder BP.
- Text bleibt einzeilig mit Ellipsis.
- S3 prueft noch, ob Spacing oder Textgroesse fuer vier Zeilen angepasst werden muss.

Pflichtkorrekturen fuer S4:

- Snapshot-Modell um optionalen Appointment-Kontext erweitern.
- Snapshot-Store rueckwaertskompatibel halten.
- Native Appointment-Query direkt gegen `appointments_v2` implementieren.
- Appointment-Zeitpunkt gegen aktuelle Zeit filtern; vergangene Termine ignorieren.
- Termintext mit gekuerztem Titel und stabilem AT-Datumsformat bauen.
- Layout um dynamische Terminzeile erweitern.
- `appointments_v2` in `WidgetRealtimeSync` aufnehmen.
- WebView `appointments:changed` als nativen Refresh-Trigger anbinden.

Contract Review:

- Read-only-Vertrag bleibt eingehalten.
- Keine Termin-CRUD-, Kalender-, Reminder-, Push-, FCM- oder Alarm-Semantik eingefuehrt.
- Kein neuer Backend-/SQL-/RLS-Vertrag erforderlich.
- MIDAS/Supabase bleibt Source of Truth; Android speichert nur lokalen Snapshot.
- Die direkte `appointments_v2`-Query ist praeziser als die View und reduziert Past-Appointment-Risiko.
- Die dynamische Zeile verhindert unnoetige `Kein Termin`-Dauerinformation.
- Offenes Restrisiko fuer S3: Textueberlauf und Layoutdichte auf echtem Homescreen.

Findings und Korrekturen:

- `W23-S1-F4`: Realtime-Vertrag war offen.
  - Korrektur: `appointments_v2` wird in V2.3 in `WidgetRealtimeSync` aufgenommen; WebView-Event stoesst nativen Refresh an.
- `W23-S1-F5`: Datenquelle war offen.
  - Korrektur: direkter nativer Read aus `appointments_v2`; View wird nicht genutzt.
- `W23-F1`: Termintext war zu offen.
  - Korrektur: konkretes Copy-Format und Titelkuerzung festgelegt.
- `W23-F2`: Datenableitung war zu offen.
  - Korrektur: native Query als primaerer Pfad festgelegt.
- `W23-F3`: Layoutfrage war zu offen.
  - Korrektur: vierte dynamische Zeile festgelegt; S3 prueft Dichte.
- `W23-S2-F5`: Backcompat bleibt als S3-Pruefpunkt offen.

S2-Abnahme:

- Exit-Kriterium erreicht: Termin-Copy, Sichtbarkeit und technische Ableitung sind eindeutig.
- Naechster Schritt: S3 Bruchrisiko-, UI-/Copy- und Umsetzungsreview.

### S1 - System- und Vertragsdetektivarbeit 2026-07-02

Deterministisch abgearbeitet:

- S1.1 V2.1- und V2.2-Abschlussdokus gelesen:
  - `docs/archive/MIDAS Android Widget V2.1 Fluids Medication Roadmap (DONE).md`
  - `docs/archive/MIDAS Android Widget V2.2 Blood Pressure Context Roadmap (DONE).md`
- S1.2 Widget Contract und Android Widget Overview gelesen:
  - `android/docs/Widget Contract.md`
  - `docs/modules/Android Widget Module Overview.md`
- S1.3 Appointments Module Overview gelesen:
  - `docs/modules/Appointments Module Overview.md`
- S1.4 Ticker Bar Module Overview gelesen:
  - `docs/modules/Ticker Bar Module Overview.md`
- S1.5 SQL-Vertrag gelesen:
  - `sql/09_Appointments_v2.sql`
- S1.6 Appointments-Code und `getUpcoming()` gelesen:
  - `app/modules/appointments/index.js`
  - relevante Hub-/Ticker-Consumer in `app/modules/hub/index.js`
- S1.7 Android Widget Codepfade nach V2.2 gelesen:
  - `DailyWidgetState.kt`
  - `WidgetSnapshotStore.kt`
  - `WidgetSyncRepository.kt`
  - `WidgetSyncBridge.kt`
  - `MidasWidgetProvider.kt`
  - `WidgetRealtimeSync.kt`
  - `MidasWebActivity.kt`
  - `widget_midas.xml`
  - `strings.xml`
- S1.8 Appointment-Datenfluss gemappt.
- S1.9 Contract Review S1 durchgefuehrt.
- S1.10 Findings korrigiert und Schritt-Abnahme dokumentiert.

Datenfluss-Iststand:

- Source of Truth ist `appointments_v2`.
- SQL-View `v_appointments_v2_upcoming` liefert `scheduled` Termine ab `now() - interval '1 day'`.
- Web-Appointments laden aktuell direkt aus `appointments_v2`, sortieren nach `start_at` und halten lokalen Modul-State.
- `getUpcoming(limit)` filtert im Web-Modul auf offene, kommende Termine ab `Date.now()`, sortiert frueheste zuerst und gibt kompakte Terminobjekte zurueck.
- Ticker-Bar nutzt Appointments-UI-State, zeigte zu S1 noch Termine im T-2-Fenster und wird in S6 auf 7 Tage erweitert.
- Android V2.2 Snapshot enthaelt noch kein Appointment-Feld.
- Nativer Widget-Sync liest aktuell:
  - `health_events` fuer Intake
  - `med_list_v2` fuer Medikation
  - `health_events` fuer BP-Kontext
- WebView-Bridge postet aktuell Intake, Medication und BP, aber keine Termine.
- `WidgetRealtimeSync` beobachtet aktuell `health_events`, `health_medications`, `health_medication_schedule_slots` und `health_medication_slot_events`, aber nicht `appointments_v2`.

Contract Review:

- Der V2.3-Scope bleibt gueltig: passive naechster-Termin-Zeile, read-only, keine Reminder-, Push-, Alarm- oder Kalender-Semantik.
- Der technische Grundsatz bleibt gueltig: Widget rendert aus lokalem Android-Snapshot, nicht aus Browser-UI-State.
- `appointments_v2` ist als Source of Truth bestaetigt.
- `v_appointments_v2_upcoming` ist moeglich, aber wegen `ab gestern` nicht automatisch der sauberste Widget-Read; S2 muss Datenquelle final entscheiden.
- Realtime ist technisch moeglich, aber nicht zwingend fuer S1 entschieden; S2/S3 muessen Nutzen gegen Komplexitaet abwaegen.
- V2.2 ist abgeschlossen; V2.3 ist nach echtem Layoutstand die vierte sichtbare Datenzeile, nicht die fuenfte.
- Keine SQL-/RLS-/Backend-/Edge-Function-Aenderung ist aus S1 heraus erforderlich.

Findings und Korrekturen:

- `W23-S1-F1`: Roadmap war noch `DRAFT` und wartete auf V2.2.
  - Korrektur: Status auf `ACTIVE`, aktueller Schritt auf `S2`, S1 in Statusmatrix auf `DONE`.
- `W23-S1-F2`: Gradle-Kommandos waren im alten Root-Stil dokumentiert.
  - Korrektur: Kommandos auf Ausfuehrung aus `android/` umgestellt.
- `W23-S1-F3`: Zeilenzahl war veraltet.
  - Korrektur: V2.3 als vierte Widget-Datenzeile dokumentiert.
- `W23-S1-F4`: Android-Realtime beobachtet `appointments_v2` noch nicht.
  - Entscheidung: offen fuer S2/S3, kein S1-Code-Fix.
- `W23-S1-F5`: `v_appointments_v2_upcoming` liefert auch Termine ab gestern.
  - Entscheidung: offen fuer S2, Datenquelle dort final festlegen.

S1-Abnahme:

- Exit-Kriterium erreicht: Es ist klar, dass Android den naechsten Termin ohne neue Writes entweder nativ aus `appointments_v2` / View lesen oder ueber eine Bridge-Erweiterung in den lokalen Snapshot uebernehmen kann.
- Empfehlung fuer S2: zuerst Datenquelle und Sichtbarkeitsvertrag festlegen, danach erst Layout-/Copy-Entscheidung finalisieren.

### Roadmap-Erstellung 2026-06-29

Gelesen / beruecksichtigt:

- `docs/MIDAS Roadmap Template.md`
- `android/docs/Widget Contract.md`
- `docs/modules/Android Widget Module Overview.md`
- `docs/modules/Appointments Module Overview.md`
- `docs/modules/Ticker Bar Module Overview.md`
- aktueller Appointments-Vertrag aus Repo-Analyse

Contract Review:

- Roadmap bleibt im V2.3-Scope: passive naechster-Termin-Zeile.
- Keine CRUD-, Kalender-, Push-, Reminder- oder Voice-Logik enthalten.
- APK-/Device-Smoke ist als S5-Pflicht enthalten.
- V2.1- und V2.2-Abhaengigkeit ist explizit dokumentiert.

Checks:

- `git diff --check` fuer die neue Roadmap: gruen.
- ASCII-Hygiene-Scan fuer die neue Roadmap: initial mit Finding, nach Korrektur gruen.
- Template-Review:
  - S1-S3 Detektivarbeit enthalten.
  - S4 Readiness Review enthalten.
  - S4 Substeps sequenziell und reviewpflichtig.
  - S5 mit eigener Debug-APK enthalten.
  - S6 mit Doku-/QA-Sync enthalten.

Findings:

- `W23-RF1`: Nicht-ASCII-Umlaute in Termin-Copy-Begriffen passten nicht zum ASCII-Vertrag der neuen Roadmaps.

Korrektur:

- `W23-RF1` korrigiert zu `Textkuerzung` / `Titelkuerzung`.
