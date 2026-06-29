# MIDAS Android Widget V2.2 Blood Pressure Context Roadmap

## Roadmap-Metadaten

| Feld | Wert |
| --- | --- |
| Status | `DRAFT` |
| Modul / Bereich | Android Widget / Blood Pressure Context |
| Owner / Kontext | Android, Widget, Vitals/BP |
| Erstellt am | `2026-06-29` |
| Letzter Stand | `2026-06-29, Roadmap erstellt und initial contract-reviewed` |
| Aktueller Schritt | `wartet auf V2.1-Abschluss, danach S1` |
| Betroffene Hauptdateien | `android/app/src/main/java/de/schabuss/midas/widget/*`, `android/app/src/main/java/de/schabuss/midas/web/MidasWebActivity.kt`, `android/app/src/main/res/layout/widget_midas.xml`, `android/app/src/main/res/values/strings.xml`, `android/docs/Widget Contract.md`, `docs/modules/Android Widget Module Overview.md`, `docs/QA_CHECKS.md` |
| Deploy relevant | `nein` |
| Runtime-Smoke relevant | `ja, Android Debug-APK und Device-Smoke` |
| Archivziel | `docs/archive/MIDAS Android Widget V2.2 Blood Pressure Context Roadmap (DONE).md` |

## Current Working State / Handoff

- Aktueller Stand:
  - Diese Roadmap baut auf einer abgeschlossenen und getesteten V2.1 auf.
  - V2.1 soll Fluessigkeit verdichtet und Medikation abschnittsfaehig darstellen.
  - BP-Daten liegen in `health_events` mit `type = bp` und `ctx = Morgen/Abend`.
  - Web-Incident-Logik kennt bereits den Vertrag: Morgenmessung vorhanden, Abendmessung fehlt.
- Naechster erlaubter Schritt:
  - Erst starten, wenn V2.1 S6 abgeschlossen und APK-Smoke akzeptiert ist.
- Aktuell bekannte Findings:
  - `W22-F1`: BP-Abendstatus ist ein sinnvoller Homescreen-Kontext, aber darf nicht zum Reminder-/Alarm-System werden.
  - `W22-F2`: Android Widget liest BP aktuell nicht.
- Aktuell geaenderte Dateien:
  - nur diese Roadmap.
- Offene User-Freigaben:
  - Start nach V2.1.
  - Android Debug-APK-Installation und Device-Smoke nach S5.
- Wichtige Grenzen fuer den naechsten Chat:
  - Kein Code vor abgeschlossenem S4 Readiness Review.
  - Keine Terminlogik in V2.2.
  - Kein nativer Reminder, kein Alarm, kein Push, kein Widget-Capture.
  - Jede V2.2-Umsetzung endet mit eigener Debug-APK fuer User-Test.

## Ziel (klar und pruefbar)

Widget V2.2 ergaenzt nach erfolgreicher V2.1 eine Blutdruck-Kontextzeile.

Pruefbare Zieldefinition:

- Das Widget zeigt eine BP-Zeile, ohne Eingabe- oder Reminder-Funktion.
- Wenn heute eine Morgenmessung existiert und keine Abendmessung existiert, zeigt die BP-Zeile einen ruhigen offenen Abendstatus.
- Wenn heute keine relevante BP-Aktion offen ist, zeigt die BP-Zeile einen neutralen Status oder die final in S2 beschlossene Fallback-Copy.
- BP-Status wird aus bestehenden BP-Daten gelesen, nicht neu geschrieben.
- Keine BP-Schwellen, keine medizinische Bewertung und keine Trendpilot-Logik werden eingefuehrt.
- `:app:assembleDebug` ist gruen.
- Die erzeugte APK kann auf Android installiert und gegen echte Widget-Anzeige getestet werden.

## Problemzusammenfassung

MIDAS nutzt BP als wichtigen CKD-Alltagsanker. Die Push-/Incident-Logik erinnert abends, wenn eine Morgenmessung vorliegt und die Abendmessung fehlt. Das Widget ist aber heute blind fuer diesen Status.

V2.2 soll diesen Zustand passiv sichtbar machen:

- nicht als Alarm,
- nicht als Eingabe,
- nicht als Push-Ersatz,
- sondern als ruhiger Tagesstatus am Homescreen.

## Entscheidungslog

| Datum | Entscheidung | Begruendung | Betroffene Schritte |
| --- | --- | --- | --- |
| `2026-06-29` | V2.2 startet erst nach V2.1-Abschluss | Jede Widget-Stufe soll eigene APK und eigenen User-Test bekommen. | `S1` |
| `2026-06-29` | BP ist passiver Kontext, kein Reminder | Widget-Vertrag verbietet Reminder-/Push-/Capture-Funktion. | `S2-S4` |
| `2026-06-29` | BP nutzt bestehenden Morgen/Abend-Vertrag | Dieser Vertrag existiert bereits in Vitals und Incidents. | `S1-S4` |

## Scope

- Android Widget Datenmodell:
  - BP-Tagesstatus als Snapshot-Feld oder abgeleitete Render-Info.
- Android Sync:
  - nativer Read aus `health_events` oder `v_events_bp`.
  - heutige `Morgen`-/`Abend`-Existenz ableiten.
- Android WebView Bridge:
  - nur falls fuer Live-Snapshot-Konsistenz noetig.
- Widget UI:
  - BP-Zeile.
  - ruhige Copy fuer `Abend offen`, `Abend folgt`, `Alles ruhig` oder final beschlossenen aequivalenten Text.
- Doku/QA:
  - Widget Contract.
  - Android Widget Module Overview.
  - QA_CHECKS.
  - diese Roadmap.

## Not in Scope

- Keine Termin-Zeile.
- Keine BP-Werteanzeige wie `113/74`.
- Keine Trendpilot-Hinweise.
- Keine BP-Schwellen oder medizinische Bewertung.
- Keine BP-Eingabe im Widget.
- Keine Push-/Reminder-/AlarmManager-/FCM-Schicht.
- Keine Aenderung an `app/modules/incidents/index.js`, ausser S1-S3 finden einen harten Contract-Drift.
- Keine SQL-/RLS-/Backend-/Edge-Function-Aenderung.
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
- `app/modules/incidents/index.js`
- `app/modules/vitals-stack/vitals/bp.js`
- `sql/01_Health Schema.sql`

## Relevante Referenzen (Doku)

- `README.md`
- `docs/DEV_ENVIRONMENT.md`
- `docs/MIDAS Roadmap Template.md`
- `android/README.md`
- `android/docs/Widget Contract.md`
- `docs/modules/Android Widget Module Overview.md`
- `docs/modules/Android Native Auth Module Overview.md`
- `docs/modules/Capture Module Overview.md`
- `docs/modules/Push Module Overview.md`
- `docs/QA_CHECKS.md`
- `docs/archive/MIDAS Android Widget V2.1 Fluids Medication Roadmap (DONE).md` nach V2.1-Abschluss

Regel:

- Erst V2.1-Abschluss und finale Doku lesen.
- Dann Widget-, Native-Auth-, Capture-/Vitals- und Push-Dokus lesen.
- Dann BP- und Android-Codepfade lesen.
- Erst nach S4 Readiness Review Code aendern.

## Guardrails

- Widget bleibt read-only.
- Widget bleibt passiver Daily-Kompass.
- BP-Zeile darf keinen falschen Alarm erzeugen.
- BP-Zeile darf keine medizinische Bewertung enthalten.
- Keine Rohwerte im V2.2-Widget, solange nicht explizit neu entschieden.
- Keine neue Reminder-Kette.
- Browser/PWA bleibt Reminder-Push-Master.
- Android Widget ist kein verlaesslicher Off-App-Reminder-Kanal.
- BP-Status darf bestehende Incident-/Push-Logik nicht veraendern.

## Architektur-Constraints

- BP liegt in `health_events`, `type = bp`, `ctx = Morgen/Abend`.
- `v_events_bp` stellt BP-Events als View bereit.
- Es gibt pro Tag und Kontext maximal einen BP-Eintrag.
- BP-Widgetstatus braucht nur Existenz von Morgen/Abend, nicht Messwerte.
- Europe/Vienna-Tageslogik muss mit bestehendem Widget-Tagesvertrag konsistent bleiben.
- `WidgetRealtimeSync` beobachtet `health_events` bereits; BP-Aenderungen koennen dadurch grundsaetzlich Sync triggern.

## Tool Permissions

Allowed:

- Android Widget Dateien aendern.
- Android Ressourcen und Layout aendern.
- Android WebView Widget-Bridge aendern, falls noetig.
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

- SQL-/RLS-/Backend-Aenderungen.
- Edge Function Deploys.
- Push-/Incident-Schwellenaenderungen.
- Widget-Capture oder BP-Eingabe.
- Native Reminder, FCM, AlarmManager.
- Terminlogik.

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
- Vor S1 V2.1-Abschluss lesen.
- `S1` bis `S3` sind Detektivarbeit und Reviews.
- Nach `S3` gibt es einen S4 Readiness Review.
- S4 wird substepweise umgesetzt.
- S5 baut eine eigene V2.2-Debug-APK.
- S6 synchronisiert Doku und QA.

## Skalierung der Roadmap

Diese Roadmap ist mittelgross, weil ein neuer Datenbereich in den Android-Snapshot kommt. S1 bis S6 werden voll angewendet.

## Statusmatrix

| ID | Schritt | Status | Ergebnis/Notiz |
| --- | --- | --- | --- |
| S1 | System- und Vertragsdetektivarbeit | TODO | V2.1-Abschluss, BP-Datenvertrag, Widget-Code und Incident-Vertrag lesen. |
| S2 | Fachlicher/technischer Contract Review | TODO | BP-Statusvertrag und Copy final festlegen. |
| S3 | Bruchrisiko-, UI-/Copy- und Umsetzungsreview | TODO | Falscher Alarm, Tageslogik, Layout und Sync-Risiken pruefen. |
| S4 | Umsetzung | TODO | BP-Snapshot, Sync, Render und Layout nach Readiness Review umsetzen. |
| S5 | Tests, Code Review und Contract Review | TODO | Build, lokale Checks und Debug-APK Device-Smoke. |
| S6 | Doku-Sync, QA-Update und finaler Abschlussreview | TODO | Doku/QA synchronisieren, Abschluss und Archiventscheidung. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Finding-Klassifizierung

| ID | Severity | Typ | Status | Entscheidung / Zielschritt |
| --- | --- | --- | --- | --- |
| `W22-F1` | `P1` | `Contract` / `Copy` | `open` | BP-Copy muss passiv bleiben und darf keinen Reminder-Vertrag vortaeuschen. |
| `W22-F2` | `P1` | `Code` / `Contract` | `open` | Android Widget braucht BP-Tagesstatus aus bestehendem Read-Vertrag. |
| `W22-F3` | `Watchlist` | `Layout` | `open` | V2.2 erzeugt vermutlich vierte Zeile; Homescreen-Lesbarkeit in S5 pruefen. |

Severity-Vertrag:

- `P0`: blockiert Umsetzung oder kann produktiv falsche/sensible Writes, Auth-Bruch oder harte Datenfehler erzeugen.
- `P1`: echter Contract-/Runtime-/User-Facing-Bug, muss in dieser Roadmap adressiert oder explizit abgegrenzt werden.
- `P2`: Hygiene, Robustheit oder Copy-Verbesserung ohne akuten Blocker.
- `Watchlist`: erkannt, aber nicht Teil dieser Roadmap; nur dokumentieren, wenn es fuer spaetere Reviews relevant ist.

---

## S1 - System- und Vertragsdetektivarbeit

Ziel:

- BP-Vertrag und Widget-V2.1-Endstand verstehen.

Substeps:

- S1.1 V2.1 Roadmap/DONE-Doku lesen.
- S1.2 Widget Contract und Android Widget Overview lesen.
- S1.3 Capture/Vitals/BP-Doku und relevante BP-Codepfade lesen.
- S1.4 Push/Incident-Doku und `app/modules/incidents/index.js` lesen.
- S1.5 `sql/01_Health Schema.sql` BP-View und Constraints lesen.
- S1.6 Android Widget Codepfade nach V2.1 lesen.
- S1.7 BP-Datenfluss fuer heutigen Tag mappen.
- S1.8 Contract Review S1.
- S1.9 Findings korrigieren und Schritt-Abnahme dokumentieren.

Exit-Kriterium:

- Es ist klar, wie Android den BP-Status ohne neue Writes ableiten kann.

## S2 - Fachlicher/technischer Contract Review

Ziel:

- Finalen BP-Widgetvertrag festlegen.

Substeps:

- S2.1 Statusfaelle definieren:
  - keine Morgenmessung.
  - Morgen vorhanden, Abend fehlt.
  - Morgen und Abend vorhanden.
  - nur Abend vorhanden.
- S2.2 Zeitfenster pruefen:
  - `Abend folgt` vs. `Abend offen`.
  - Bezug zu bestehender Push-Zeit 20:00.
- S2.3 Copy final festlegen:
  - ruhig, kurz, kein Alarm.
- S2.4 Datenquelle festlegen:
  - `health_events` direkt oder `v_events_bp`.
- S2.5 Snapshot-/Store-Vertrag festlegen.
- S2.6 Findings und Pflichtkorrekturen fuer S4 definieren.
- S2.7 Contract Review S2.
- S2.8 Findings korrigieren und Schritt-Abnahme dokumentieren.

Exit-Kriterium:

- BP-Copy und technische Ableitung sind eindeutig.

## S3 - Bruchrisiko-, UI-/Copy- und Umsetzungsreview

Ziel:

- Falsche Sicherheit und falschen Alarm vermeiden.

Substeps:

- S3.1 Bruchrisiken identifizieren:
  - Tagesgrenze.
  - Timezone.
  - alte Snapshots.
  - fehlende Auth.
  - nur Abendmessung vorhanden.
  - Realtime vs. Worker.
  - Textueberlauf.
- S3.2 User-Facing Copy Review:
  - `Abend folgt`.
  - `Abend offen`.
  - `Alles ruhig`.
  - `Keine Messung`.
- S3.3 Layout Review nach V2.1.
- S3.4 Tooling und Checks klaeren.
- S3.5 S4-Substeps konkretisieren.
- S3.6 Contract Review S3.
- S3.7 Findings korrigieren und Schritt-Abnahme dokumentieren.

Exit-Kriterium:

- S4 hat klare BP-Substeps und Review-Kriterien.

## S4 Readiness Review - Gate nach S3, vor S4

Ziel:

- S4-Reihenfolge gegen echte Abhaengigkeiten pruefen.

Prueffragen:

- Muss BP-Status im Snapshot persistiert werden oder reicht Ableitung beim Sync?
- Welche Query ist stabiler: `health_events` oder `v_events_bp`?
- Muss WebView Bridge BP mitliefern?
- Muss `WidgetRealtimeSync` um weitere Tabellen erweitert werden? Erwartung: nein, `health_events` ist bereits enthalten.
- Sind Fallbacks fuer alte Snapshots definiert?

Exit-Kriterium:

- S4 kann ohne offene BP-Architekturfrage starten.

## S4 - Umsetzung

Ziel:

- BP-Kontextzeile implementieren.

Geplante Substeps:

- S4.1 BP-Statusmodell und Snapshot-Fallback definieren.
- S4.2 Nativen BP-Read fuer heutigen Tag implementieren.
- S4.3 BP-Statusableitung implementieren.
- S4.4 Optional WebView Bridge angleichen, falls S2/S3 das erfordern.
- S4.5 Widget-Layout, Strings und Farben fuer BP-Zeile umsetzen.
- S4.6 Gesamt-Code- und Contract Review; Findings korrigieren.

Jeder Substep endet mit Code Review, Contract Review, Findings und Korrektur der Findings.

Exit-Kriterium:

- V2.2 ist lokal implementiert und bereit fuer S5.

## S5 - Tests, Code Review und Contract Review

Ziel:

- V2.2 pruefen und Debug-APK bereitstellen.

Substeps:

- S5.1 `git diff --check`.
- S5.2 `android\gradlew.bat :app:compileDebugKotlin`.
- S5.3 `android\gradlew.bat :app:assembleDebug`.
- S5.4 APK-Pfad dokumentieren.
- S5.5 Optional `adb devices` und Installation nach User-Freigabe.
- S5.6 Device-Smoke definieren oder ausfuehren:
  - kein BP heute.
  - Morgenmessung vorhanden, Abend fehlt.
  - Morgen und Abend vorhanden.
  - Widget-Tap aktualisiert Status.
- S5.7 User-Facing Copy Review auf echtem Homescreen.
- S5.8 Code Review gegen Bruchrisiken.
- S5.9 Contract Review gegen Guardrails.
- S5.10 Schritt-Abnahme und Commit-Empfehlung.

Exit-Kriterium:

- Lokale Checks sind gruen und APK ist fuer User-Test verfuegbar oder Device-Smoke ist dokumentiert.

## S6 - Doku-Sync, QA-Update und finaler Abschlussreview

Ziel:

- Source-of-Truth-Dokus synchronisieren und V2.2 abschliessen.

Substeps:

- S6.1 `android/docs/Widget Contract.md` aktualisieren.
- S6.2 `docs/modules/Android Widget Module Overview.md` aktualisieren.
- S6.3 `docs/QA_CHECKS.md` aktualisieren.
- S6.4 Roadmap mit Ergebnisprotokollen aktualisieren.
- S6.5 Finaler Contract Review.
- S6.6 Abschluss-Abnahme.
- S6.7 Commit-Empfehlung.
- S6.8 Archiv-Entscheidung nach User-Freigabe.

Exit-Kriterium:

- V2.2 ist dokumentiert, geprueft und bereit fuer V2.3.

---

## Ergebnisprotokoll

### Roadmap-Erstellung 2026-06-29

Gelesen / beruecksichtigt:

- `docs/MIDAS Roadmap Template.md`
- `android/docs/Widget Contract.md`
- `docs/modules/Android Widget Module Overview.md`
- `docs/modules/Push Module Overview.md`
- `app/modules/incidents/index.js`
- aktueller BP-Vertrag aus Repo-Analyse

Contract Review:

- Roadmap bleibt im V2.2-Scope: passive BP-Zeile.
- Keine Termin-, Push-, Reminder-, Trendpilot- oder BP-Werte-Logik enthalten.
- APK-/Device-Smoke ist als S5-Pflicht enthalten.
- V2.1-Abhaengigkeit ist explizit dokumentiert.

Checks:

- `git diff --check` fuer die neue Roadmap: gruen.
- ASCII-Hygiene-Scan fuer die neue Roadmap: gruen.
- Template-Review:
  - S1-S3 Detektivarbeit enthalten.
  - S4 Readiness Review enthalten.
  - S4 Substeps sequenziell und reviewpflichtig.
  - S5 mit eigener Debug-APK enthalten.
  - S6 mit Doku-/QA-Sync enthalten.

Findings:

- Keine offenen Roadmap-Contract-Findings nach Erstellung.

Korrektur:

- Nicht erforderlich.
