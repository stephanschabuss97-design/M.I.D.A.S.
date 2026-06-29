# MIDAS Android Widget V2.3 Appointments Context Roadmap

## Roadmap-Metadaten

| Feld | Wert |
| --- | --- |
| Status | `DRAFT` |
| Modul / Bereich | Android Widget / Appointments Context |
| Owner / Kontext | Android, Widget, Appointments |
| Erstellt am | `2026-06-29` |
| Letzter Stand | `2026-06-29, Roadmap erstellt und initial contract-reviewed` |
| Aktueller Schritt | `wartet auf V2.2-Abschluss, danach S1` |
| Betroffene Hauptdateien | `android/app/src/main/java/de/schabuss/midas/widget/*`, `android/app/src/main/java/de/schabuss/midas/web/MidasWebActivity.kt`, `android/app/src/main/res/layout/widget_midas.xml`, `android/app/src/main/res/values/strings.xml`, `android/docs/Widget Contract.md`, `docs/modules/Android Widget Module Overview.md`, `docs/modules/Appointments Module Overview.md`, `docs/QA_CHECKS.md` |
| Deploy relevant | `nein` |
| Runtime-Smoke relevant | `ja, Android Debug-APK und Device-Smoke` |
| Archivziel | `docs/archive/MIDAS Android Widget V2.3 Appointments Context Roadmap (DONE).md` |

## Current Working State / Handoff

- Aktueller Stand:
  - Diese Roadmap baut auf abgeschlossener und getesteter V2.2 auf.
  - Appointments existieren als `appointments_v2` mit `status`, `start_at`, `title`, `location`, `notes`.
  - Web-Modul stellt `AppModules.appointments.getUpcoming()` bereit.
  - Ticker-Bar zeigt Termine ab T-2 Tagen und ist kein Push-/Reminder-System.
  - Android Widget liest Termine aktuell nicht.
- Naechster erlaubter Schritt:
  - Erst starten, wenn V2.2 S6 abgeschlossen und APK-Smoke akzeptiert ist.
- Aktuell bekannte Findings:
  - `W23-F1`: Terminzeile kann echten Nutzen haben, aber schnell zu lang und unruhig werden.
  - `W23-F2`: Android Widget braucht eigenen Appointment-Read oder Bridge-Snapshot-Erweiterung.
- Aktuell geaenderte Dateien:
  - nur diese Roadmap.
- Offene User-Freigaben:
  - Start nach V2.2.
  - Android Debug-APK-Installation und Device-Smoke nach S5.
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
- Termine sind selten und duerfen nicht taeglich die Widget-Ruhe stoeren.
- Das Widget darf nicht zur Kalender-App oder Reminder-Flaeche werden.

V2.3 darf daher nur einen kompakten, passiven Kontext liefern.

## Entscheidungslog

| Datum | Entscheidung | Begruendung | Betroffene Schritte |
| --- | --- | --- | --- |
| `2026-06-29` | V2.3 startet erst nach V2.2-Abschluss | Jede Widget-Stufe soll eigene APK und eigenen User-Test bekommen. | `S1` |
| `2026-06-29` | Terminzeile bleibt passiv | Appointments haben bereits Web-Modul und Ticker; Widget darf nicht zum Kalender werden. | `S2-S4` |
| `2026-06-29` | Nur naechster Termin, keine Liste | Homescreen-Kompass braucht eine kurze Orientierung, keine Agenda. | `S2`, `S3`, `S4` |

## Scope

- Android Widget Datenmodell:
  - naechster Appointment-Kontext als optionaler Snapshot-Wert.
- Android Sync:
  - nativer Read aus `appointments_v2` oder `v_appointments_v2_upcoming`.
  - nur `scheduled` und kommende/relevante Termine.
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
  - QA_CHECKS.
  - diese Roadmap.

## Not in Scope

- Kein Termin-CRUD im Widget.
- Keine Termindetails, Notizen oder Orte, ausser S2 entscheidet bewusst eine sehr kurze Ortsnutzung.
- Keine Liste mehrerer Termine.
- Kein Kalender-Grid.
- Kein Push, keine Reminder-Kette, kein Alarm.
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
- Android Widget braucht entweder eigenen nativen Read oder Bridge-Erweiterung.
- `appointments_v2` ist in Supabase Realtime-Publication, aber `WidgetRealtimeSync` beobachtet diese Tabelle aktuell nicht.
- Eine Erweiterung von `WidgetRealtimeSync` auf `appointments_v2` ist moeglich, muss aber in S2/S3 gegen Nutzen und Akku-/Komplexitaetsrisiko geprueft werden.
- Widget-Layout nach V2.2 kann bereits vier Zeilen haben; V2.3 fuegt voraussichtlich eine fuenfte Zeile hinzu oder nutzt einen final beschlossenen kompakten Layoutschnitt.

## Tool Permissions

Allowed:

- Android Widget Dateien aendern.
- Android Ressourcen und Layout aendern.
- Android WebView Widget-Bridge aendern, falls noetig.
- `WidgetRealtimeSync` erweitern, falls S2/S3 das bestaetigen.
- Doku und QA aktualisieren.
- Lokale Checks:
  - `android\gradlew.bat :app:compileDebugKotlin`
  - `android\gradlew.bat :app:assembleDebug`
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
| Lokale Codeaenderung | `geplant` |
| Lokale Checks | `geplant: compileDebugKotlin, assembleDebug, git diff --check` |
| Supabase Deploy | `nicht relevant` |
| GitHub Workflow-Smoke | `nicht relevant` |
| Browser-/Device-Smoke | `offen, Android Debug-APK nach S5` |
| Produktive Schreibwirkung | `nein` |
| Letzter Remote-Nachweis | `none` |

## Execution Mode

- Sequenziell arbeiten: `S1` bis `S6`.
- Vor S1 V2.1- und V2.2-Abschluss lesen.
- `S1` bis `S3` sind Detektivarbeit und Reviews.
- Nach `S3` gibt es einen S4 Readiness Review.
- S4 wird substepweise umgesetzt.
- S5 baut eine eigene V2.3-Debug-APK.
- S6 synchronisiert Doku und QA.

## Skalierung der Roadmap

Diese Roadmap ist mittelgross, weil ein weiteres Modul in den Android-Snapshot kommt und die Widget-Dichte steigt. S1 bis S6 werden voll angewendet.

## Statusmatrix

| ID | Schritt | Status | Ergebnis/Notiz |
| --- | --- | --- | --- |
| S1 | System- und Vertragsdetektivarbeit | TODO | V2.1/V2.2-Abschluss, Appointment-Datenvertrag, Ticker-Bar und Widget-Code lesen. |
| S2 | Fachlicher/technischer Contract Review | TODO | Termin-Sichtbarkeit, Textkuerzung und Datenquelle final festlegen. |
| S3 | Bruchrisiko-, UI-/Copy- und Umsetzungsreview | TODO | Ueberladung, Textueberlauf, Realtime und Datumscopy pruefen. |
| S4 | Umsetzung | TODO | Termin-Snapshot, Sync, Render und Layout nach Readiness Review umsetzen. |
| S5 | Tests, Code Review und Contract Review | TODO | Build, lokale Checks und Debug-APK Device-Smoke. |
| S6 | Doku-Sync, QA-Update und finaler Abschlussreview | TODO | Doku/QA synchronisieren, Abschluss und Archiventscheidung. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Finding-Klassifizierung

| ID | Severity | Typ | Status | Entscheidung / Zielschritt |
| --- | --- | --- | --- | --- |
| `W23-F1` | `P1` | `UI` / `Copy` | `open` | Termintext muss kurz und homescreen-tauglich sein. |
| `W23-F2` | `P1` | `Code` / `Contract` | `open` | Android Widget braucht stabilen Appointment-Read oder Bridge-Erweiterung. |
| `W23-F3` | `Watchlist` | `Layout` | `open` | Fuenfte Zeile kann Widget ueberladen; S2/S3 muessen Layoutschnitt bestaetigen. |

Severity-Vertrag:

- `P0`: blockiert Umsetzung oder kann produktiv falsche/sensible Writes, Auth-Bruch oder harte Datenfehler erzeugen.
- `P1`: echter Contract-/Runtime-/User-Facing-Bug, muss in dieser Roadmap adressiert oder explizit abgegrenzt werden.
- `P2`: Hygiene, Robustheit oder Copy-Verbesserung ohne akuten Blocker.
- `Watchlist`: erkannt, aber nicht Teil dieser Roadmap; nur dokumentieren, wenn es fuer spaetere Reviews relevant ist.

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
  - immer naechster Termin.
  - nur innerhalb 48h.
  - oder Hybrid nach Nutzerentscheidung.
- S2.2 Termin-Copy final festlegen:
  - Titelkuerzung.
  - Datum.
  - Uhrzeit.
  - `Heute`, `Morgen`, Wochentag und `dd.mm.`.
- S2.3 Fallback definieren:
  - keine Terminzeile.
  - `Termin -`.
  - `Kein Termin`.
- S2.4 Datenquelle festlegen:
  - `appointments_v2` direkt.
  - `v_appointments_v2_upcoming`.
  - WebView Bridge.
- S2.5 Realtime-/Refresh-Vertrag festlegen:
  - `appointments_v2` in `WidgetRealtimeSync` aufnehmen oder nur Worker/App-Start/Widget-Tap nutzen.
- S2.6 Layoutschnitt final entscheiden:
  - fuenfte Zeile.
  - verdichtete Kontextzeile.
  - optional anderes Spacing.
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
  - Layout mit fuenf Zeilen.
- S3.2 User-Facing Copy Review:
  - `Termin`.
  - `Nephro, Mi 22.07.`.
  - `Morgen 10:30`.
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
- Ist `v_appointments_v2_upcoming` fuer Android geeignet?
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

- S4.1 Appointment-Snapshot-Modell und Fallback definieren.
- S4.2 Nativen Appointment-Read implementieren oder Bridge-Erweiterung umsetzen, je nach S2/S3-Entscheidung.
- S4.3 Termin-Auswahl und Textformatierung implementieren.
- S4.4 Optional `WidgetRealtimeSync` um `appointments_v2` erweitern, falls beschlossen.
- S4.5 Widget-Layout, Strings und Textkuerzung umsetzen.
- S4.6 Gesamt-Code- und Contract Review; Findings korrigieren.

Jeder Substep endet mit Code Review, Contract Review, Findings und Korrektur der Findings.

Exit-Kriterium:

- V2.3 ist lokal implementiert und bereit fuer S5.

## S5 - Tests, Code Review und Contract Review

Ziel:

- V2.3 pruefen und Debug-APK bereitstellen.

Substeps:

- S5.1 `git diff --check`.
- S5.2 `android\gradlew.bat :app:compileDebugKotlin`.
- S5.3 `android\gradlew.bat :app:assembleDebug`.
- S5.4 APK-Pfad dokumentieren.
- S5.5 Optional `adb devices` und Installation nach User-Freigabe.
- S5.6 Device-Smoke definieren oder ausfuehren:
  - kein Termin.
  - Termin heute.
  - Termin morgen.
  - Termin weiter in der Zukunft, je nach S2-Vertrag.
  - langer Titel wird gekuerzt.
  - Widget-Tap aktualisiert Status.
- S5.7 User-Facing Copy Review auf echtem Homescreen.
- S5.8 Code Review gegen Bruchrisiken.
- S5.9 Contract Review gegen Guardrails.
- S5.10 Schritt-Abnahme und Commit-Empfehlung.

Exit-Kriterium:

- Lokale Checks sind gruen und APK ist fuer User-Test verfuegbar oder Device-Smoke ist dokumentiert.

## S6 - Doku-Sync, QA-Update und finaler Abschlussreview

Ziel:

- Source-of-Truth-Dokus synchronisieren und V2.3 abschliessen.

Substeps:

- S6.1 `android/docs/Widget Contract.md` aktualisieren.
- S6.2 `docs/modules/Android Widget Module Overview.md` aktualisieren.
- S6.3 `docs/modules/Appointments Module Overview.md` aktualisieren, falls Widget-Consumer-Vertrag neu ist.
- S6.4 `docs/QA_CHECKS.md` aktualisieren.
- S6.5 Roadmap mit Ergebnisprotokollen aktualisieren.
- S6.6 Finaler Contract Review.
- S6.7 Abschluss-Abnahme.
- S6.8 Commit-Empfehlung.
- S6.9 Archiv-Entscheidung nach User-Freigabe.

Exit-Kriterium:

- V2.3 ist dokumentiert, geprueft und abschliessbar.

---

## Ergebnisprotokoll

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
