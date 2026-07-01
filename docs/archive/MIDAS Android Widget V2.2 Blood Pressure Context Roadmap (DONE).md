# MIDAS Android Widget V2.2 Blood Pressure Context Roadmap

## Roadmap-Metadaten

| Feld | Wert |
| --- | --- |
| Status | `DONE` |
| Modul / Bereich | Android Widget / Blood Pressure Context |
| Owner / Kontext | Android, Widget, Vitals/BP |
| Erstellt am | `2026-06-29` |
| Letzter Stand | `2026-07-01, abgeschlossen und archivbereit` |
| Aktueller Schritt | `DONE` |
| Betroffene Hauptdateien | `android/app/src/main/java/de/schabuss/midas/widget/*`, `android/app/src/main/java/de/schabuss/midas/web/MidasWebActivity.kt`, `android/app/src/main/res/layout/widget_midas.xml`, `android/app/src/main/res/values/strings.xml`, `android/docs/Widget Contract.md`, `docs/modules/Android Widget Module Overview.md`, `docs/QA_CHECKS.md` |
| Deploy relevant | `nein` |
| Runtime-Smoke relevant | `ja, Android Debug-APK und Device-Smoke` |
| Archivziel | `docs/archive/MIDAS Android Widget V2.2 Blood Pressure Context Roadmap (DONE).md` |

## Current Working State / Handoff

- Aktueller Stand:
  - Diese Roadmap baut auf einer abgeschlossenen, getesteten und archivierten V2.1 auf.
  - V2.1 stellt Fluessigkeit verdichtet und Medikation abschnittsfaehig dar.
  - S1 wurde am `2026-06-30` deterministisch abgeschlossen.
  - S2 wurde am `2026-06-30` deterministisch abgeschlossen.
  - S3 wurde am `2026-06-30` deterministisch abgeschlossen.
  - S4 Readiness Review wurde am `2026-06-30` abgeschlossen.
  - S4.1 wurde am `2026-06-30` umgesetzt, geprueft und contract-reviewed.
  - S4.2 wurde am `2026-06-30` umgesetzt, geprueft und contract-reviewed.
  - S4.3 wurde am `2026-06-30` umgesetzt, geprueft und contract-reviewed.
  - S4.4 wurde am `2026-06-30` umgesetzt, geprueft und contract-reviewed.
  - S4.5 wurde am `2026-06-30` umgesetzt, geprueft und contract-reviewed.
  - S4.6 wurde am `2026-06-30` als Gesamt-Code- und Contract-Review abgeschlossen.
  - S5 lokale Checks wurden am `2026-06-30` abgeschlossen.
  - S5 Device-Smoke wurde am `2026-07-01` durch User-Test erfolgreich abgeschlossen.
  - S6 Doku-Sync wurde am `2026-07-01` abgeschlossen.
  - BP-Daten liegen in `health_events` mit `type = bp` und `ctx = Morgen/Abend`.
  - V2.2-Vertrag ist bewusst simpel:
    - Morgenmessung vorhanden und Abendmessung fehlt -> `BD Abend offen`.
    - Alle anderen Statusfaelle bleiben neutral.
- Naechster erlaubter Schritt:
  - V2.3 mit eigener Roadmap starten.
- Aktuell bekannte Findings:
  - `W22-F1`: BP-Abendstatus ist ein sinnvoller Homescreen-Kontext; S4.5 rendert ihn passiv ohne Reminder-Vertrag.
  - `W22-F2`: Android Widget las BP noch nicht; nativer Read wurde in S4.2 und Persistenz in S4.3 umgesetzt.
  - `W22-S1-F1`: Android-WebView-Snapshot-Script enthielt einen JS-Syntaxfehler im `postWidgetStateV2`-Block; in S4.4 korrigiert.
  - `W22-S1-F2`: Roadmap-Tooling muss Gradle-Checks wie V2.1 aus `android/` starten.
  - `W22-S1-F3`: Android README war noch V1-lastig und wurde auf V2.1/V2.2-Kontext korrigiert.
  - `W22-S1-F4`: Layout-Sprache muss nach V2.1 von einer dritten BP-Zeile sprechen, nicht von einer vierten.
  - `W22-S2-F1`: Zeitfenster-/Push-Schwellenlogik wird nicht ins Widget dupliziert; Widget zeigt rein datenbasiert nach Morgenmessung den offenen Abendstatus.
  - `W22-S2-F2`: Fallback-Copy wird auf `Alles ruhig` vereinheitlicht, damit kein fehlender Morgenwert wie ein Problem wirkt.
  - `W22-S3-F1`: BP-Status muss im Snapshot persistiert werden; reine Render-Ableitung reicht nicht, weil Widget nur aus Store rendert.
  - `W22-S3-F2`: WebView Bridge liefert BP-Status seit S4.4 mit, damit `bp:changed` bei offener Android-WebView einen Sofort-Snapshot erzeugt.
  - `W22-S3-F3`: Dritte Widget-Zeile wurde im Device-Smoke als passend bestaetigt.
  - `W22-S5-F1`: Android-Lint fand einen API-29-Helper ohne API-Annotation; in S5 korrigiert.
  - `W22-S5-F2`: Android-Lint fand `android:tint` in der WebActivity-Toolbar; in S5 auf `app:tint` korrigiert.
  - `W22-S5-F3`: ADB sah lokal kein Geraet; User-Device-Smoke wurde am Android-Geraet erfolgreich abgeschlossen.
  - `W22-S5-F4`: CodeRabbit fand, dass fehlender Snapshot fuer BP faelschlich `Alles ruhig` zeigte; in S5 auf Ladeplatzhalter korrigiert.
  - `W22-S6-F1`: Widget Contract sprach noch von V2.1 und `keine Blutdruck-Zeile`; in S6 korrigiert.
  - `W22-S6-F2`: Android Widget Overview beschrieb noch nur Fluessigkeit/Medikation; in S6 auf V2.2 erweitert.
  - `W22-S6-F3`: QA hatte keinen V2.2-BP-Widget-Block; in S6 ergaenzt.
- Aktuell geaenderte Dateien:
  - `android/app/src/main/java/de/schabuss/midas/widget/DailyWidgetState.kt`
  - `android/app/src/main/java/de/schabuss/midas/widget/WidgetSnapshotStore.kt`
  - `android/app/src/main/java/de/schabuss/midas/widget/WidgetSyncRepository.kt`
  - `android/app/src/main/java/de/schabuss/midas/widget/WidgetSyncBridge.kt`
  - `android/app/src/main/java/de/schabuss/midas/widget/MidasWidgetProvider.kt`
  - `android/app/src/main/java/de/schabuss/midas/web/MidasWebActivity.kt`
  - `android/app/src/main/java/de/schabuss/midas/diag/AndroidBootTrace.kt`
  - `android/app/src/main/res/layout/activity_midas_web.xml`
  - `android/app/src/main/res/layout/widget_midas.xml`
  - `android/app/src/main/res/values/strings.xml`
  - `android/README.md`
  - `android/docs/Widget Contract.md`
  - `docs/modules/Android Widget Module Overview.md`
  - `docs/QA_CHECKS.md`
  - diese Roadmap.
- Offene User-Freigaben:
  - Keine; V2.2 ist abgeschlossen.
- Wichtige Grenzen fuer den naechsten Chat:
  - Kein Code vor abgeschlossenem S4 Readiness Review.
  - Keine Terminlogik in V2.2.
  - Kein nativer Reminder, kein Alarm, kein Push, kein Widget-Capture.
  - Jede V2.2-Umsetzung endet mit eigener Debug-APK fuer User-Test.

## Ziel (klar und pruefbar)

Widget V2.2 ergaenzt nach erfolgreicher V2.1 eine Blutdruck-Kontextzeile.

Pruefbare Zieldefinition:

- Das Widget zeigt eine BP-Zeile, ohne Eingabe- oder Reminder-Funktion.
- Wenn heute eine Morgenmessung existiert und keine Abendmessung existiert, zeigt die BP-Zeile `BD Abend offen`.
- Wenn heute keine relevante BP-Aktion offen ist, zeigt die BP-Zeile `Alles ruhig`.
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
| `2026-06-30` | V2.2 nutzt keine Uhrzeit-/Push-Schwelle im Widget | Widget soll nur datenbasiert zeigen, dass nach Morgenmessung Abend noch offen ist. | `S2-S4` |
| `2026-06-30` | Finalcopy: `BD Abend offen` / `Alles ruhig` | Kurz, passiv, homescreen-tauglich und kein Alarmton. | `S2-S5` |

## Scope

- Android Widget Datenmodell:
  - BP-Tagesstatus als Snapshot-Feld oder abgeleitete Render-Info.
- Android Sync:
  - nativer Read aus `health_events` oder `v_events_bp`.
  - heutige `Morgen`-/`Abend`-Existenz ableiten.
- Android WebView Bridge:
  - BP-Freshness ueber `bp:changed` mitziehen.
- Widget UI:
  - BP-Zeile.
  - ruhige Copy fuer `BD Abend offen` und `Alles ruhig`.
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
- Android WebView Widget-Bridge fuer BP-Freshness aendern.
- Doku und QA aktualisieren.
- Lokale Checks:
  - aus `android/`: `.\gradlew.bat :app:compileDebugKotlin`
  - aus `android/`: `.\gradlew.bat :app:assembleDebug`
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
| Lokale Codeaenderung | `umgesetzt` |
| Lokale Checks | `gruen: compileDebugKotlin, assembleDebug, lintDebug, testDebugUnitTest, git diff --check, JS-Syntaxcheck` |
| Supabase Deploy | `nicht relevant` |
| GitHub Workflow-Smoke | `nicht relevant` |
| Browser-/Device-Smoke | `erfolgreich, User-Test am Android-Geraet 2026-07-01` |
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
| S1 | System- und Vertragsdetektivarbeit | DONE | V2.1-Abschluss, BP-Datenvertrag, Widget-Code und Incident-Vertrag gelesen; Datenfluss und Findings dokumentiert. |
| S2 | Fachlicher/technischer Contract Review | DONE | BP-Statusvertrag, Copy, Datenquelle und Snapshot-Vertrag final festgelegt. |
| S3 | Bruchrisiko-, UI-/Copy- und Umsetzungsreview | DONE | Bruchrisiken, Copy, Layout, Bridge und S4-Pflichtpunkte geprueft. |
| S4 | Umsetzung | DONE | S4.1 bis S4.6 abgeschlossen; S5 kann starten. |
| S5 | Tests, Code Review und Contract Review | DONE | Lokale Checks, CodeRabbit-Finding und User-Device-Smoke abgeschlossen. |
| S6 | Doku-Sync, QA-Update und finaler Abschlussreview | DONE | Widget Contract, Overview, QA und Roadmap synchronisiert; Archiventscheidung offen. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Finding-Klassifizierung

| ID | Severity | Typ | Status | Entscheidung / Zielschritt |
| --- | --- | --- | --- | --- |
| `W22-F1` | `P1` | `Contract` / `Copy` | `fixed` | BP-Copy bleibt passiv: `BD Abend offen` / `Alles ruhig`, ohne Reminder-, Alarm- oder medizinischen Entwarnungsvertrag. |
| `W22-F2` | `P1` | `Code` / `Contract` | `fixed` | Android Widget liest BP-Tagesstatus nativ und persistiert den abgeleiteten Status im Snapshot. |
| `W22-F3` | `Watchlist` | `Layout` | `fixed` | Device-Smoke bestaetigt, dass die dritte Zeile auf dem Homescreen passt. |
| `W22-S1-F1` | `P1` | `Code` / `Bridge` | `fixed` | `WIDGET_SYNC_SCRIPT` hatte im `postWidgetStateV2`-Block ein doppeltes `);`; in S4.4 korrigiert. |
| `W22-S1-F2` | `P2` | `Tooling` / `Roadmap` | `fixed` | Gradle-Checks laufen in V2.2 aus `android/` mit `.\gradlew.bat`, analog V2.1-Lesson-Learned. |
| `W22-S1-F3` | `P2` | `Doku` / `Android` | `fixed` | `android/README.md` wurde von V1-Zielbild auf aktuellen Widget-Zielstand korrigiert. |
| `W22-S1-F4` | `P2` | `Layout` / `Roadmap` | `fixed` | V2.2 spricht nach V2.1 von einer dritten BP-Zeile, nicht von einer vierten Zeile. |
| `W22-S2-F1` | `P1` | `Contract` / `Time` | `fixed` | Keine Uhrzeit-/Push-Schwelle im Widget; Status rein aus Tagesdaten `Morgen` vorhanden und `Abend` fehlt. |
| `W22-S2-F2` | `P2` | `Copy` / `Fallback` | `fixed` | Neutralstatus wird `Alles ruhig`; keine Morgenmessung ist kein Problemtext. |
| `W22-S3-F1` | `P1` | `Architecture` / `Snapshot` | `fixed` | S4 muss BP-Status in `DailyWidgetState`/Store persistieren; Widget rendert nicht direkt aus Query-Ergebnissen. |
| `W22-S3-F2` | `P1` | `Bridge` / `Freshness` | `fixed` | S4 muss WebView Bridge BP-faehig machen und den bestehenden JS-Syntaxfehler korrigieren. |
| `W22-S3-F3` | `Watchlist` | `Layout` / `Smoke` | `fixed` | Dritte Zeile wurde im S5-Device-Smoke erfolgreich bestaetigt. |
| `W22-S4.3-F1` | `P2` | `Code` / `Compatibility` | `fixed` | BP-ctx-Normalisierung im nativen Parser akzeptiert neben `Morgen`/`Abend` auch `M`/`A` und `morning`/`evening`, analog Web-Read-Toleranz. |
| `W22-S4.4-F1` | `P2` | `Bridge` / `Compatibility` | `fixed` | Legacy-Bridge-Saves ohne BP-Status erhalten einen bestehenden BP-Snapshot fuer denselben Tag, statt ihn auf neutral zu ueberschreiben. |
| `W22-S4.4-F2` | `P2` | `Bridge` / `Compatibility` | `fixed` | Alte 8-Argument-Calls von `postWidgetStateV2(...)` bleiben ueber einen Wrapper kompatibel; neue Calls liefern BP als zusaetzliches Argument. |
| `W22-S5-F1` | `P2` | `Tooling` / `Lint` | `fixed` | `AndroidBootTrace.writeToMediaStoreDownloads(...)` ist nur ab API 29 erreichbar und wurde fuer Lint entsprechend annotiert. |
| `W22-S5-F2` | `P2` | `Tooling` / `Lint` | `fixed` | `activity_midas_web.xml` nutzt fuer Toolbar-Icons `app:tint` statt `android:tint`. |
| `W22-S5-F3` | `Watchlist` | `Runtime` / `Device-Smoke` | `fixed` | User-Test bestaetigt installierte APK, sauberen Widget-Sync und gewuenschte Logiken am Android-Geraet. |
| `W22-S5-F4` | `P1` | `Copy` / `State` | `fixed` | Fehlender Tages-Snapshot rendert fuer BP jetzt `Lade...` statt `Alles ruhig`; `Alles ruhig` bleibt nur fuer vorhandene neutrale Snapshots. |
| `W22-S6-F1` | `P1` | `Doku` / `Contract` | `fixed` | `android/docs/Widget Contract.md` dokumentiert jetzt V2.2 mit `bloodPressureStatus`, drei Widget-Zeilen und BP-Nicht-Zielen statt `keine Blutdruck-Zeile`. |
| `W22-S6-F2` | `P1` | `Doku` / `Overview` | `fixed` | `docs/modules/Android Widget Module Overview.md` beschreibt jetzt V2.2, BP-Snapshot, BP-Read, Bridge-Event, Render-Copy und QA-Vertrag. |
| `W22-S6-F3` | `P2` | `Doku` / `QA` | `fixed` | `docs/QA_CHECKS.md` enthaelt eine eigene Phase A9 fuer Android Widget V2.2 Blood Pressure Context. |

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
  - `BD Abend offen`.
  - `Alles ruhig`.
  - keine negative Copy fuer fehlende Morgenmessung.
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

- BP-Status wird im Snapshot persistiert.
- Query nutzt `health_events` direkt.
- WebView Bridge liefert BP mit, damit `bp:changed` den Snapshot sofort nachziehen kann.
- `WidgetRealtimeSync` braucht keine weitere Tabelle, weil `health_events` bereits enthalten ist.
- Alte Snapshots ohne BP-Feld laden neutral.

Exit-Kriterium:

- S4 kann ohne offene BP-Architekturfrage starten.

## S4 - Umsetzung

Ziel:

- BP-Kontextzeile implementieren.

Geplante Substeps:

- S4.1 BP-Statusmodell und Snapshot-Fallback definieren.
- S4.2 Nativen BP-Read fuer heutigen Tag implementieren.
- S4.3 BP-Statusableitung und Store-Save integrieren.
- S4.4 WebView Bridge syntaktisch bereinigen und BP-Status mitliefern.
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
- S5.2 aus `android/`: `.\gradlew.bat :app:compileDebugKotlin`.
- S5.3 aus `android/`: `.\gradlew.bat :app:assembleDebug`.
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

### S1 - System- und Vertragsdetektivarbeit 2026-06-30

Deterministisch abgearbeitet:

- S1.1 V2.1 Roadmap/DONE-Doku:
  - V2.1 ist abgeschlossen, archiviert und per User-Device-Smoke akzeptiert.
  - Aktiver Widget-Stand:
    - `Fluessigkeit` als `Ist / Soll L`.
    - `Medikation` als V2.1-Summary aus `med_list_v2.slots[]`.
  - V2.1 bleibt passiv, read-only und ohne BP-/Terminlogik.
- S1.2 Widget Contract und Android Widget Overview:
  - Android rendert ausschliesslich aus lokalem `DailyWidgetState`.
  - Widget-Tap startet manuellen nativen Sync.
  - Android-WebView/Shell bleibt kein Reminder-Push-Master.
  - BP ist im V2.1-Contract noch Nicht-Ziel und wird durch V2.2 bewusst neu in den Vertrag aufgenommen.
- S1.3 Capture/Vitals/BP-Doku und BP-Codepfade:
  - BP-Save nutzt `context` `M`/`A` und Label `Morgen`/`Abend`.
  - BP-Persistenz erstellt Tagesdaten mit Zeit `07:00` fuer Morgen und `22:00` fuer Abend.
  - Nach erfolgreichem Save wird `bp:changed` mit `context`, `contextLabel`, `dayIso` und `date` dispatcht.
- S1.4 Push/Incident-Doku und `app/modules/incidents/index.js`:
  - Incident-Vertrag:
    - `bpMorning = true`, wenn heute `context === Morgen` existiert.
    - `bpEvening = true`, wenn heute `context === Abend` existiert.
    - BP-Incident ist erst ab `20:00` faellig, wenn Morgen vorhanden und Abend fehlt.
  - Widget darf diesen Vertrag nur passiv sichtbar machen, nicht als Push-/Reminder-Ersatz.
- S1.5 `sql/01_Health Schema.sql`:
  - BP liegt in `health_events`.
  - `type = 'bp'`.
  - `ctx in ('Morgen','Abend')`.
  - Unique pro `user_id`, `day`, `type`, `ctx`.
  - `v_events_bp` projiziert `id`, `user_id`, `ts`, `day`, `ctx`, `sys`, `dia`, `pulse`, `comment`.
  - `health_events` ist in der Supabase-Realtime-Publication enthalten.
- S1.6 Android Widget Codepfade nach V2.1:
  - `DailyWidgetState` enthaelt aktuell Wasser, Medication und `updatedAt`, aber keinen BP-Status.
  - `WidgetSnapshotStore` persistiert den Tages-Snapshot und laedt nur den heutigen Tag.
  - `WidgetSyncRepository` liest aktuell Intake und Medication, aber kein BP.
  - `WidgetRealtimeSync` beobachtet `health_events` bereits, daher ist fuer BP voraussichtlich keine neue Realtime-Tabelle noetig.
  - `MidasWidgetProvider` rendert aktuell zwei Zeilen.
  - `widget_midas.xml` hat zwei aktive Zeilen und kann fuer V2.2 um eine BP-Zeile erweitert werden.
- S1.7 BP-Datenfluss fuer heutigen Tag gemappt:
  - Quelle:
    - `health_events` direkt oder `v_events_bp`.
  - Minimal benoetigte Felder:
    - `ctx`.
  - Tagesfilter:
    - `day = today Europe/Vienna`.
    - `user_id = native auth user`.
  - Ableitung:
    - `hasMorning = rows.any(ctx == 'Morgen')`.
    - `hasEvening = rows.any(ctx == 'Abend')`.
    - `morning && !evening` ist der einzige fachlich offene BP-Kontext.
  - Keine Messwerte, keine Schwellen und keine Trendlogik erforderlich.
- S1.8 Contract Review S1:
  - Ziel bleibt innerhalb V2.2:
    - passive BP-Kontextzeile.
    - keine Eingabe.
    - keine Push-/Reminder-/Alarm-Schicht.
    - keine medizinische Bewertung.
  - Android kann den BP-Status ohne neue Writes ableiten.
  - Bestehender Realtime-Pfad reicht strukturell, weil `health_events` bereits beobachtet wird.
  - S2 muss noch entscheiden, ob der native Read `health_events` direkt oder `v_events_bp` nutzt.
  - S2 muss Copy und Fallback fuer `kein Morgen`, `Morgen ohne Abend`, `Morgen+Abend`, `nur Abend` festlegen.

Findings:

- `W22-S1-F1`: `android/app/src/main/java/de/schabuss/midas/web/MidasWebActivity.kt` enthaelt im `WIDGET_SYNC_SCRIPT` nach `postWidgetStateV2(...)` ein doppeltes `);`.
  - Bewertung:
    - echter Bridge-Bug, aber kein S1-Codefix, weil Code erst ab S4 geaendert wird.
    - S4.4 muss diesen bestehenden Syntaxfehler korrigieren; S3/S4 Readiness haben BP in der Bridge anschliessend als Pflichtteil bestaetigt.
- `W22-S1-F2`: V2.2-Roadmap uebernahm root-nahe Gradle-Kommandos.
  - Bewertung:
    - V2.1 hat gezeigt, dass Gradle-Checks aus `android/` mit `.\gradlew.bat` laufen sollen.
- `W22-S1-F3`: `android/README.md` beschrieb noch das alte V1-Zielbild.
  - Bewertung:
    - Doku-Drift gegen abgeschlossene V2.1.
- `W22-S1-F4`: Roadmap sprach bei V2.2 von einer vierten Widget-Zeile.
  - Bewertung:
    - Nach V2.1 sind aktiv zwei fachliche Zeilen vorhanden; BP ist voraussichtlich die dritte Zeile.

Korrektur:

- `android/README.md` aktualisiert:
  - aktuelles Widget-Zielbild `Fluessigkeit`, `Medikation`, weitere Kontextzeilen nur mit eigener Roadmap.
- V2.2-Roadmap aktualisiert:
  - Status auf `ACTIVE`.
  - aktueller Schritt auf `S2`.
  - S1 in der Statusmatrix auf `DONE`.
  - Gradle-Checks auf Ausfuehrung aus `android/` korrigiert.
  - S4.4 um verpflichtende WebView-Bridge-Syntaxbereinigung erweitert.
  - Layout-Sprache auf dritte BP-Zeile korrigiert.
  - S1-Findings in die Finding-Tabelle aufgenommen.

Schritt-Abnahme:

- S1 ist abgeschlossen.
- Es ist klar, wie Android den BP-Status ohne neue Writes ableiten kann.
- Naechster erlaubter Schritt ist S2.

### S2 - Fachlicher/technischer Contract Review 2026-06-30

Deterministisch abgearbeitet:

- S2.1 Statusfaelle definiert:
  - Keine Morgenmessung:
    - Status: neutral.
    - Copy: `Alles ruhig`.
    - Begruendung: kein fehlender Morgenwert soll im Widget als Problem wirken.
  - Morgen vorhanden, Abend fehlt:
    - Status: offen.
    - Copy: `BD Abend offen`.
    - Begruendung: genau dieser Zustand ist der V2.2-Nutzen.
  - Morgen und Abend vorhanden:
    - Status: neutral.
    - Copy: `Alles ruhig`.
    - Begruendung: Tagesabschluss ist aus Widget-Sicht erledigt.
  - Nur Abend vorhanden:
    - Status: neutral.
    - Copy: `Alles ruhig`.
    - Begruendung: kein Sonderalarm; V2.2 zeigt nur den offenen Abend nach vorhandener Morgenmessung.
- S2.2 Zeitfenster geprueft:
  - Keine Uhrzeitlogik im Widget.
  - Keine Kopplung an die Incident-Push-Schwelle `20:00`.
  - Kein Unterschied zwischen `Abend folgt` und `Abend offen` nach Uhrzeit.
  - Entscheidung:
    - Sobald eine Morgenmessung fuer heute vorhanden ist und Abend fehlt, ist der Widget-Status `BD Abend offen`.
    - Das bleibt bewusst ein passiver Status und kein Reminder.
- S2.3 Copy final festgelegt:
  - Label:
    - `Blutdruck`.
  - Offen:
    - `BD Abend offen`.
  - Neutral:
    - `Alles ruhig`.
  - Nicht verwendet:
    - `Abend folgt`, weil es eine Zeit-/Erwartungslogik andeutet.
    - `Keine Messung`, weil es ohne Morgenmessung zu negativ wirkt.
- S2.4 Datenquelle festgelegt:
  - Native Android-Sync liest `health_events` direkt.
  - Query-Ziel:
    - `select=id,ctx`
    - `user_id=eq.<userId>`
    - `type=eq.bp`
    - `day=eq.<todayIso>`
  - Begruendung:
    - Der native Sync liest bereits `health_events` direkt fuer Intake.
    - V2.2 braucht nur `ctx`, keine Messwerte aus `v_events_bp`.
    - Weniger Felder, weniger Kopplung an die View.
- S2.5 Snapshot-/Store-Vertrag festgelegt:
  - `DailyWidgetState` erhaelt einen BP-Status-Snapshot.
  - Minimaler Statusvertrag:
    - `NONE` / neutral.
    - `EVENING_OPEN`.
  - Alternativ duerfen die Wire-Werte klein geschrieben gespeichert werden:
    - `none`.
    - `evening_open`.
  - Alte Snapshots ohne BP-Feld muessen neutral laden.
  - Snapshot bleibt read-only und schreibt keine BP-Daten.
- S2.6 Findings und Pflichtkorrekturen fuer S4 definiert:
  - S4 muss `W22-F2` loesen:
    - nativer BP-Read aus `health_events`.
    - Ableitung `hasMorning && !hasEvening`.
  - S4 muss `W22-S1-F1` loesen:
    - bestehendes doppeltes `);` im WebView-Sync-Script bereinigen.
  - WebView Bridge BP-Mitgabe bleibt bis S3/S4 Readiness zu bestaetigen:
    - Wenn Live-Snapshot-Konsistenz aus WebView-Events noetig ist, wird sie mitgezogen.
    - S3 hat anschliessend entschieden, die Bridge fuer BP-Freshness mitziehen zu lassen.
- S2.7 Contract Review S2:
  - Ziel des Users ist abgedeckt:
    - "Nach einer Morgenmessung anzeigen, dass noch eine Abendmessung offen ist."
  - Kein Rad neu erfinden:
    - kein eigener Incident-Rechner im Widget.
    - keine Push-Schwelle.
    - keine Werteanzeige.
    - keine Trendpilot-/medizinische Bewertung.
  - MIDAS-Guardrails bleiben intakt:
    - Widget bleibt read-only.
    - Browser/PWA bleibt Reminder-Push-Master.
    - Android Widget bleibt passiver Daily-Kompass.

Findings:

- `W22-S2-F1`: Die urspruengliche Roadmap stellte `Abend folgt` vs. `Abend offen` und die `20:00`-Schwelle zu stark als moegliche Widget-Logik in den Raum.
  - Bewertung:
    - Wuerde das Widget unnoetig in Richtung Reminder-/Zeitlogik ziehen.
- `W22-S2-F2`: Fallback-Copy war noch offen und koennte mit `Keine Messung` unnoetig negativ wirken.
  - Bewertung:
    - Neutraler Fallback ist fuer den Homescreen besser.

Korrektur:

- Zieldefinition aktualisiert:
  - offen: `BD Abend offen`.
  - neutral: `Alles ruhig`.
- Entscheidungslog erweitert:
  - keine Uhrzeit-/Push-Schwelle im Widget.
  - finaler Copy-Vertrag dokumentiert.
- Scope aktualisiert:
  - Copy nur noch `BD Abend offen` und `Alles ruhig`.
- Statusmatrix aktualisiert:
  - S2 auf `DONE`.
- Finding-Tabelle erweitert:
  - `W22-S2-F1`.
  - `W22-S2-F2`.

Schritt-Abnahme:

- S2 ist abgeschlossen.
- BP-Copy und technische Ableitung sind eindeutig.
- Naechster erlaubter Schritt ist S3.

### S3 - Bruchrisiko-, UI-/Copy- und Umsetzungsreview 2026-06-30

Deterministisch abgearbeitet:

- S3.1 Bruchrisiken identifiziert:
  - Tagesgrenze:
    - `WidgetSnapshotStore.load()` verwirft Snapshots, deren `dayIso` nicht heute ist.
    - BP-Feld muss deshalb im selben Tages-Snapshot leben und alte Tage neutral verschwinden.
  - Timezone:
    - Android nutzt `LocalDate.now(ZoneId.systemDefault())`.
    - Produktiver Nutzerkontext ist Europe/Vienna; Android-Geraet muss fuer Device-Smoke normales lokales Datum liefern.
    - Keine zusaetzliche UTC-/Push-Zeitlogik in V2.2.
  - Alte Snapshots:
    - Alte V2.1-Snapshots haben kein BP-Feld.
    - Store muss fehlendes BP-Feld neutral laden.
  - Fehlende Auth:
    - Native Sync bricht heute ohne Auth sauber ab.
    - BP darf keinen separaten Auth-Pfad einfuehren.
  - Nur Abendmessung vorhanden:
    - Wird neutral `Alles ruhig`.
    - Kein "Morgen fehlt"-Text.
  - Realtime vs. Worker:
    - `WidgetRealtimeSync` beobachtet `health_events` bereits.
    - BP-Saves koennen damit grundsaetzlich nativen Re-Sync ausloesen.
    - Bei offener Android-WebView soll zusaetzlich die Bridge auf `bp:changed` reagieren, damit der Snapshot ohne Warten nachzieht.
  - Textueberlauf:
    - `BD Abend offen` und `Alles ruhig` sind kurz genug fuer die bestehende rechte Value-Spalte.
    - Dritte Zeile kann die 4x2-Hoehe dennoch enger machen; S4 muss Abstaende bewusst setzen, S5 muss Device-Smoke pruefen.
- S3.2 User-Facing Copy Review:
  - `BD Abend offen`:
    - kurz.
    - passiv.
    - kein Alarmton.
    - transportiert exakt den offenen Kontext.
  - `Alles ruhig`:
    - neutral.
    - keine negative Deutung bei fehlender Morgenmessung.
    - passt zu Homescreen-Kompass.
- S3.3 Layout Review nach V2.1:
  - V2.1 hat zwei Zeilen.
  - V2.2 fuegt voraussichtlich eine dritte Zeile hinzu:
    - `Fluessigkeit`
    - `Medikation`
    - `Blutdruck`
  - Dritte Zeile ist im 4x2-Widget plausibel, muss aber mit reduziertem/konstantem vertikalem Abstand gebaut werden.
  - Keine vierte Zeile und keine Terminlogik in V2.2.
- S3.4 Tooling und Checks geklaert:
  - S5 nutzt:
    - `git diff --check`.
    - aus `android/`: `.\gradlew.bat :app:compileDebugKotlin`.
    - aus `android/`: `.\gradlew.bat :app:assembleDebug`.
  - Device-Smoke prueft:
    - kein BP-Problemzustand -> `Alles ruhig`.
    - Morgen vorhanden, Abend fehlt -> `BD Abend offen`.
    - Morgen und Abend vorhanden -> `Alles ruhig`.
    - Widget-Tap aktualisiert den Status.
- S3.5 S4-Substeps konkretisiert:
  - BP-Status wird persistierter Teil von `DailyWidgetState`.
  - Native Query nutzt `health_events` direkt.
  - Store-Fallback laedt alte Snapshots neutral.
  - Bridge wird BP-faehig und korrigiert dabei den bestehenden JS-Syntaxfehler.
  - Layout fuegt eine dritte Zeile hinzu und nutzt kurze Copy.
- S3.6 Contract Review S3:
  - Keine falsche Sicherheit:
    - `Alles ruhig` bedeutet nur "kein offener V2.2-BP-Kontext", nicht medizinisch unauffaellig.
  - Kein falscher Alarm:
    - Nur `hasMorning && !hasEvening` zeigt `BD Abend offen`.
    - Keine Uhrzeit- oder Push-Schwelle.
  - Kein Scope Drift:
    - keine BP-Werte.
    - keine Eingabe.
    - keine Trendpilot-Logik.
    - keine Incident-/Push-Aenderung.
  - Umsetzung ist klein genug:
    - Snapshot-Feld.
    - nativer Read.
    - einfache Ableitung.
    - Bridge-Freshness.
    - dritte Layoutzeile.

Findings:

- `W22-S3-F1`: BP-Status muss im Snapshot persistiert werden.
  - Bewertung:
    - Das Widget rendert ausschliesslich aus `WidgetSnapshotStore`; reine Render-Ableitung ohne Persistenz passt nicht zum Android-Widget-Vertrag.
- `W22-S3-F2`: WebView Bridge soll BP mitliefern.
  - Bewertung:
    - Native Realtime reicht als Hintergrundpfad, aber offene Android-WebView kann nach `bp:changed` denselben schnellen Snapshot-Pfad wie Intake/Medication nutzen.
    - Der bereits gefundene JS-Syntaxfehler muss dabei zwingend korrigiert werden.
- `W22-S3-F3`: Layout mit dritter Zeile ist ein echter Smoke-Punkt.
  - Bewertung:
    - Keine Code-Blockade, aber S4/S5 muessen Textgroesse, Abstand und Homescreen-Wirkung pruefen.

Korrektur:

- Roadmap-Handoff aktualisiert:
  - S3 abgeschlossen.
  - naechster Schritt `S4 Readiness Review`.
- Statusmatrix aktualisiert:
  - S3 auf `DONE`.
- Finding-Tabelle erweitert:
  - `W22-S3-F1`.
  - `W22-S3-F2`.
  - `W22-S3-F3`.
- S4 Readiness-Vorentscheidung dokumentiert:
  - Snapshot-Persistenz.
  - `health_events` direkt.
  - Bridge BP-faehig.
  - keine neue Realtime-Tabelle.
  - alte Snapshots neutral.
- S4-Substeps konkretisiert.

Schritt-Abnahme:

- S3 ist abgeschlossen.
- S4 hat klare BP-Substeps und Review-Kriterien.
- Naechster erlaubter Schritt ist der S4 Readiness Review.

### S4 Readiness Review 2026-06-30

Gate-Fragen beantwortet:

- Muss BP-Status im Snapshot persistiert werden oder reicht Ableitung beim Sync?
  - Entscheidung:
    - Persistieren.
  - Begruendung:
    - Das Android-Widget rendert nur aus `WidgetSnapshotStore`.
    - Reine Sync-Ableitung ohne Store-Feld waere nach Prozess-/Widget-Refresh verloren.
    - Alte Snapshots ohne BP-Feld laden neutral.
- Welche Query ist stabiler: `health_events` oder `v_events_bp`?
  - Entscheidung:
    - `health_events` direkt.
  - Begruendung:
    - V2.2 braucht nur `ctx`.
    - Native Sync liest `health_events` bereits fuer Intake.
    - Weniger Felder und keine Kopplung an View-Projektion.
- Muss WebView Bridge BP mitliefern?
  - Entscheidung:
    - Ja.
  - Begruendung:
    - Bei offener Android-WebView soll `bp:changed` denselben schnellen Snapshot-Pfad wie Intake/Medication nutzen.
    - Der bestehende JS-Syntaxfehler im `postWidgetStateV2`-Block wird in demselben Bereich korrigiert.
- Muss `WidgetRealtimeSync` um weitere Tabellen erweitert werden?
  - Entscheidung:
    - Nein.
  - Begruendung:
    - `health_events` wird bereits beobachtet.
- Sind Fallbacks fuer alte Snapshots definiert?
  - Entscheidung:
    - Ja.
  - Vertrag:
    - fehlendes BP-Feld -> neutral / `Alles ruhig`.

Finale S4-Reihenfolge:

- S4.1 BP-Statusmodell und Snapshot-Fallback definieren.
- S4.2 Nativen BP-Read fuer heutigen Tag implementieren.
- S4.3 BP-Statusableitung und Store-Save integrieren.
- S4.4 WebView Bridge syntaktisch bereinigen und BP-Status mitliefern.
- S4.5 Widget-Layout, Strings und Farben fuer BP-Zeile umsetzen.
- S4.6 Gesamt-Code- und Contract Review; Findings korrigieren.

Contract Review:

- S4 bleibt im V2.2-Scope:
  - keine BP-Werte.
  - keine Uhrzeitlogik.
  - keine Push-/Incident-Aenderung.
  - keine SQL-/Backend-Aenderung.
  - keine Terminlogik.
- Datenvertrag ist geschlossen:
  - `hasMorning && !hasEvening` -> `BD Abend offen`.
  - alle anderen Faelle -> `Alles ruhig`.
- Runtime-Vertrag ist geschlossen:
  - Native Sync/Realtime plus WebView-Bridge-Freshness.
  - Widget bleibt passiver Snapshot.

Findings:

- Keine neuen Readiness-Findings.

Korrektur:

- Roadmap-Handoff aktualisiert:
  - aktueller Schritt `S4.1`.
- Scope/Permissions aktualisiert:
  - WebView Bridge ist fuer BP-Freshness Teil von S4, nicht mehr optional.
- Statusmatrix aktualisiert:
  - S4 bleibt `TODO`, aber ist durch den Readiness Review startklar.

Schritt-Abnahme:

- S4 Readiness Review ist abgeschlossen.
- S4 kann ohne offene BP-Architekturfrage starten.
- Naechster erlaubter Schritt ist S4.1.

### S4.1 - BP-Statusmodell und Snapshot-Fallback 2026-06-30

Umgesetzt:

- `DailyWidgetState.kt`:
  - `DailyWidgetState` enthaelt jetzt `bloodPressureStatus`.
  - Default ist `BloodPressureWidgetStatus.NONE`.
  - `DailyWidgetState.empty(...)` setzt BP explizit neutral.
  - Neues Enum `BloodPressureWidgetStatus`:
    - `NONE("none")`.
    - `EVENING_OPEN("evening_open")`.
  - `fromWire(...)` mappt unbekannte, leere oder alte Werte defensiv auf `NONE`.
- `WidgetSnapshotStore.kt`:
  - `load()` liest `bloodPressureStatus`.
  - Fehlendes Feld in alten V2.1-Snapshots faellt auf `NONE` zurueck.
  - `save(...)` akzeptiert optional `bloodPressureStatus`.
  - Bestehende Save-Aufrufe bleiben durch Default-Parameter kompatibel.
  - Snapshot speichert das Feld als Wire-Wert.

Code Review:

- Keine BP-Query, keine Ableitung, kein Layout und keine Bridge-Aenderung in S4.1.
- Existing Call Sites bleiben compile-kompatibel:
  - `WidgetSyncRepository.save(...)`.
  - `WidgetSyncBridge.postWidgetState(...)`.
  - `WidgetSyncBridge.postWidgetStateV2(...)`.
- Alte Snapshots ohne BP-Feld laden neutral.
- Unbekannte zukuenftige/kaputte Wire-Werte werden nicht als offen interpretiert.

Contract Review:

- S4.1 erfuellt nur den vereinbarten Substep:
  - Statusmodell.
  - Snapshot-Fallback.
- Guardrails bleiben intakt:
  - keine Writes nach Supabase.
  - keine BP-Werte.
  - keine Reminder-/Push-/Uhrzeitlogik.
  - keine UI-Aenderung.

Checks:

- aus `android/`: `.\gradlew.bat :app:compileDebugKotlin`
  - Ergebnis: gruen.

Findings:

- Keine neuen S4.1-Findings.

Korrektur:

- Nicht erforderlich.

Schritt-Abnahme:

- S4.1 ist abgeschlossen.
- Naechster erlaubter Schritt ist S4.2.

### S4.2 - Nativer BP-Read fuer heutigen Tag 2026-06-30

Umgesetzt:

- `WidgetSyncRepository.kt`:
  - Native Sync ruft nach Intake und Medication jetzt auch heutige BP-Zeilen ab.
  - Quelle bleibt direkt `health_events`.
  - Query-Vertrag:
    - `select=id,ctx`.
    - `user_id=eq.<userId>`.
    - `type=eq.bp`.
    - `day=eq.<dayIso>`.
    - `order=ts.asc`.
  - Neuer Builder `buildBloodPressureUrl(...)` folgt dem bestehenden `buildIntakeUrl(...)`-Pattern.

Bewusste Scope-Grenze:

- S4.2 liest BP-Daten, wertet sie aber noch nicht aus.
- `bloodPressureJson` wird in S4.3 fuer die Statusableitung verwendet.
- Keine Snapshot-Save-Aenderung in S4.2.
- Keine Widget-UI-Aenderung in S4.2.
- Keine WebView-Bridge-Aenderung in S4.2.

Code Review:

- Auth-/RLS-Vertrag bleibt gleich wie bei Intake und Medication:
  - User-Token.
  - User-Filter.
  - heutiger Tag.
- Die Query liest keine BP-Werte und keine Payload.
- Der neue Read ist synchron in `syncNow()` eingebunden und respektiert weiter den bestehenden Session-Generation-Guard.
- Der Zwischenstand mit noch ungenutztem `bloodPressureJson` ist akzeptiert, weil S4.3 unmittelbar die Ableitung und Persistenz anschliesst.

Contract Review:

- S4.2 erfuellt den vereinbarten Substep:
  - BP-Read ja.
  - Statusentscheidung nein.
  - Widget-Rendering nein.
- Guardrails bleiben intakt:
  - keine Uhrzeitlogik.
  - keine Reminder-/Push-Logik.
  - keine Terminlogik.
  - keine BP-Werte im Widget.

Checks:

- aus `android/`: `.\gradlew.bat :app:compileDebugKotlin`
  - Ergebnis: gruen.
- `git diff --check`
  - Ergebnis: gruen.

Findings:

- Keine neuen S4.2-Findings.

Korrektur:

- Nicht erforderlich.

Schritt-Abnahme:

- S4.2 ist abgeschlossen.
- Naechster erlaubter Schritt ist S4.3.

### S4.3 - BP-Statusableitung und Store-Save 2026-06-30

Umgesetzt:

- `WidgetSyncRepository.kt`:
  - `deriveBloodPressureStatus(...)` ermittelt aus heutigen BP-Zeilen:
    - `hasMorning`.
    - `hasEvening`.
  - Statusvertrag:
    - `hasMorning && !hasEvening` -> `BloodPressureWidgetStatus.EVENING_OPEN`.
    - alle anderen Faelle -> `BloodPressureWidgetStatus.NONE`.
  - `syncNow()` speichert den abgeleiteten BP-Status in `WidgetSnapshotStore.save(...)`.
  - Der bestehende Snapshot bleibt damit alleinige Render-Quelle fuer das Widget.

Code Review:

- Die Ableitung nutzt nur `ctx`.
- Keine BP-Werte, keine Payload und keine medizinischen Schwellen werden gelesen oder dargestellt.
- Keine Uhrzeit-/Push-Logik wurde eingebaut.
- Keine WebView-Bridge- oder Layout-Aenderung in S4.3.
- Der native Parser toleriert bekannte BP-Kontextformen:
  - `M` / `A`.
  - `Morgen` / `Abend`.
  - `morning` / `evening`.

Contract Review:

- S4.3 erfuellt den vereinbarten Substep:
  - BP-Statusableitung ja.
  - Store-Save ja.
  - UI/Bridge nein.
- Die vier fachlichen Faelle sind abgedeckt:
  - keine Morgenmessung -> neutral.
  - Morgen vorhanden, Abend fehlt -> offen.
  - Morgen und Abend vorhanden -> neutral.
  - nur Abend vorhanden -> neutral.
- `Alles ruhig` bleibt fachlich nur ein Widget-Neutralstatus und keine medizinische Bewertung.

Checks:

- aus `android/`: `.\gradlew.bat :app:compileDebugKotlin`
  - Ergebnis: gruen.
- `git diff --check`
  - Ergebnis: gruen.

Findings:

- `W22-S4.3-F1`: Erste Implementierung erkannte nur `Morgen`/`Abend`; Web-/View-Code toleriert aber auch `M`/`A` und englische Formen.

Korrektur:

- `deriveBloodPressureStatus(...)` auf dieselbe robuste Kontextsemantik erweitert:
  - `m`, `morgen`, `morning`.
  - `a`, `abend`, `evening`.

Schritt-Abnahme:

- S4.3 ist abgeschlossen.
- Naechster erlaubter Schritt ist S4.4.

### S4.4 - WebView Bridge BP-Freshness und JS-Syntaxfix 2026-06-30

Umgesetzt:

- `MidasWebActivity.kt`:
  - `WIDGET_SYNC_SCRIPT`-Syntaxfehler im `postWidgetStateV2(...)`-Block korrigiert:
    - doppeltes `);` entfernt.
  - Web-Snapshot liest BP-Tagesstatus ueber `supa.sbSelect(...)` direkt aus `health_events`.
  - Query-Vertrag:
    - `select=id,ctx`.
    - `user_id=eq.<userId>`.
    - `type=eq.bp`.
    - `day=eq.<dayIso>`.
    - `order=ts.asc`.
  - Web-Snapshot leitet denselben BP-Status ab wie der native Sync:
    - `Morgen/M` vorhanden und `Abend/A` fehlt -> `evening_open`.
    - sonst -> `none`.
  - `postWidgetStateV2(...)` uebergibt den BP-Wire-Wert an Android.
  - `bp:changed` triggert bei offener WebView einen neuen Snapshot.
- `WidgetSyncBridge.kt`:
  - `postWidgetStateV2(...)` akzeptiert `bloodPressureStatus`.
  - Alte 8-Argument-Calls von `postWidgetStateV2(...)` bleiben ueber einen Wrapper kompatibel.
  - BP-Wire-Werte werden ueber `BloodPressureWidgetStatus.fromWire(...)` normalisiert.
  - Legacy-Bridge-Calls ohne BP-Status erhalten einen vorhandenen BP-Snapshot fuer denselben Tag.

Code Review:

- Bridge nutzt nur `ctx`; keine BP-Werte und keine Payload.
- Keine Uhrzeit-/Push-/Reminder-Logik wurde eingefuehrt.
- `WidgetRealtimeSync` bleibt unveraendert, weil `health_events` bereits beobachtet wird.
- JS-Prereqs pruefen jetzt `supa.sbSelect`, damit der Web-Snapshot nicht ohne BP-Daten als vollstaendig gilt.
- Der BP-Status wird nur als Snapshot-Zusatz gespeichert; Widget-Layout bleibt S4.5.

Contract Review:

- S4.4 erfuellt den vereinbarten Substep:
  - Bridge-Syntaxfix ja.
  - BP-Freshness ueber `bp:changed` ja.
  - Store-Save ueber Bridge ja.
  - UI/Layout nein.
- V2.2-Grenzen bleiben intakt:
  - keine Terminlogik.
  - keine aktive Reminder-Funktion.
  - keine medizinische Bewertung.

Checks:

- aus `android/`: `.\gradlew.bat :app:compileDebugKotlin`
  - Ergebnis: gruen.
- `git diff --check`
  - Ergebnis: gruen.
- Extrahierter `WIDGET_SYNC_SCRIPT` mit `node --check`
  - Ergebnis: gruen.

Findings:

- `W22-S4.4-F1`: Alte Bridge-Fallback-Saves ohne BP-Status koennten einen vorhandenen BP-Status auf neutral zuruecksetzen.
- `W22-S4.4-F2`: Erweiterung der `postWidgetStateV2(...)`-Signatur koennte alte 8-Argument-Calls brechen, wenn ein bereits injiziertes oder aelteres Script noch ohne BP-Argument postet.

Korrektur:

- `postWidgetState(...)` und `postWidgetStateV2(...)` behalten bei fehlendem incoming BP-Status einen vorhandenen BP-Snapshot fuer denselben Tag.
- 8-Argument-Wrapper fuer `postWidgetStateV2(...)` ergaenzt; neue BP-faehige Variante nutzt zusaetzliches `bloodPressureStatus`-Argument.

Schritt-Abnahme:

- S4.4 ist abgeschlossen.
- Naechster erlaubter Schritt ist S4.5.

### S4.5 - Widget-Layout, Strings und Farben fuer BP-Zeile 2026-06-30

Umgesetzt:

- `MidasWidgetProvider.kt`:
  - Rendert `widgetBloodPressureValue` aus `DailyWidgetState.bloodPressureStatus`.
  - `EVENING_OPEN` -> `BD Abend offen`.
  - `NONE` bei vorhandenem Snapshot -> `Alles ruhig`.
  - fehlender kompletter Snapshot -> `Lade...` nach S5-CodeRabbit-Korrektur.
  - Offener BP-Kontext nutzt die bestehende ruhige Amber-Farbe.
  - Neutraler BP-Kontext nutzt die bestehende neutrale Widget-Farbe.
- `widget_midas.xml`:
  - Dritte Zeile `Blutdruck` hinzugefuegt.
  - Zeilenabstand zwischen Zeile 1/2 und 2/3 auf `8dp` gesetzt.
  - Textgroessen bleiben wie V2.1:
    - Label `14sp`.
    - Wert `16sp`, bold, einzeilig, ellipsize.
- `strings.xml`:
  - `widget_label_blood_pressure`: `Blutdruck`.
  - `widget_blood_pressure_evening_open`: `BD Abend offen`.
  - `widget_blood_pressure_neutral`: `Alles ruhig`.
  - Widget-Beschreibung auf Wasser, Medikation und Blutdruck erweitert.

Code Review:

- Keine Datenlogik in S4.5 geaendert.
- Keine Bridge-, Auth-, Supabase- oder Scheduler-Aenderung in S4.5.
- Keine BP-Werte und keine medizinischen Schwellen im Widget.
- Neutralfarbe fuer `Alles ruhig` vermeidet eine medizinische "alles gruen"-Deutung.
- Offene BP-Copy ist kurz genug fuer die rechte Value-Spalte.

Contract Review:

- S4.5 erfuellt den vereinbarten UI-Substep:
  - BP-Zeile ja.
  - finale Copy ja.
  - passive Darstellung ja.
  - keine Terminlogik.
  - keine Reminder-/Push-Logik.
- `W22-F1` ist damit fachlich geloest:
  - Die Copy bleibt ruhig und passiv.
  - `Alles ruhig` bedeutet nur "kein offener V2.2-BP-Kontext".
- `W22-S3-F3` bleibt bewusst Watchlist bis S5:
  - echte 4x2-Homescreen-Wirkung wird per Device-Smoke geprueft.

Checks:

- aus `android/`: `.\gradlew.bat :app:compileDebugKotlin`
  - Ergebnis: gruen.
- aus `android/`: `.\gradlew.bat :app:assembleDebug`
  - Ergebnis: gruen.
  - Debug-APK vorhanden: `android/app/build/outputs/apk/debug/app-debug.apk`.
- `git diff --check`
  - Ergebnis: gruen.

Findings:

- Keine neuen S4.5-Code-Findings.

Korrektur:

- Nicht erforderlich.

Schritt-Abnahme:

- S4.5 ist abgeschlossen.
- Naechster erlaubter Schritt ist S4.6.

### S4.6 - Gesamt-Code- und Contract Review 2026-06-30

Geprueft:

- Datenmodell:
  - `DailyWidgetState` enthaelt `bloodPressureStatus`.
  - Alte Snapshots ohne BP-Feld laden neutral.
  - Unbekannte Wire-Werte werden neutral behandelt.
- Native Sync:
  - liest `health_events` fuer heutigen BP-Kontext.
  - nutzt nur `ctx`.
  - leitet ausschliesslich `hasMorning && !hasEvening` als offen ab.
  - speichert den Status im Snapshot.
- WebView Bridge:
  - JS-Syntaxfehler im `postWidgetStateV2(...)`-Block ist im Code korrigiert.
  - extrahierter `WIDGET_SYNC_SCRIPT` ist per `node --check` gueltig.
  - `bp:changed` triggert Snapshot-Freshness.
  - 8- und 9-Argument-Pfade fuer `postWidgetStateV2(...)` bleiben compile-kompatibel.
  - Fallback-Saves ohne incoming BP-Status erhalten vorhandene BP-Snapshots fuer denselben Tag.
- Widget-UI:
  - dritte Zeile `Blutdruck` wird gerendert.
  - Copy bleibt passiv:
    - `BD Abend offen`.
    - `Alles ruhig`.
  - `Alles ruhig` nutzt neutrale Farbe, nicht Erfolgsgruen.
  - Keine BP-Werte, keine Schwellen, keine medizinische Bewertung.
- Scope:
  - keine Terminlogik.
  - keine Reminder-/Push-Aenderung.
  - keine Backend-/SQL-Aenderung.
  - keine neue Realtime-Tabelle.

Code Review:

- Keine neuen Code-Findings.
- Die historisch dokumentierte Suche nach dem doppelten `);` findet im Code keinen Treffer mehr.
- Die verbleibenden offenen Finding-Eintraege sind bewusst S5-Smoke-Themen:
  - `W22-F3`.
  - `W22-S3-F3`.

Contract Review:

- V2.2-Ziel ist technisch erfuellt:
  - Nach heutiger Morgenmessung und fehlender Abendmessung kann der Snapshot `BD Abend offen` anzeigen.
  - Alle anderen BP-Konstellationen bleiben neutral.
- Die Darstellung bleibt Homescreen-Kontext, kein Reminder-System.
- S4 ist bereit fuer S5:
  - Build.
  - APK.
  - Device-Smoke auf 4x2-Homescreen.

Checks:

- aus `android/`: `.\gradlew.bat :app:compileDebugKotlin`
  - Ergebnis: gruen.
- aus `android/`: `.\gradlew.bat :app:assembleDebug`
  - Ergebnis: gruen.
- Extrahierter `WIDGET_SYNC_SCRIPT` mit `node --check`
  - Ergebnis: gruen.
- `git diff --check`
  - Ergebnis: gruen.
- Debug-APK vorhanden:
  - `android/app/build/outputs/apk/debug/app-debug.apk`.

Findings:

- Keine neuen S4.6-Findings.

Korrektur:

- Nicht erforderlich.

Schritt-Abnahme:

- S4.6 ist abgeschlossen.
- S4 ist insgesamt abgeschlossen.
- Naechster erlaubter Schritt ist S5.

### S5 - Tests, Code Review und Contract Review 2026-06-30

Ausgefuehrte Checks:

- `git diff --check`
  - Ergebnis: gruen.
- aus `android/`: `.\gradlew.bat :app:compileDebugKotlin`
  - Ergebnis: gruen.
- aus `android/`: `.\gradlew.bat :app:assembleDebug`
  - Ergebnis: gruen.
- aus `android/`: `.\gradlew.bat :app:testDebugUnitTest`
  - Ergebnis: gruen, Test-Task ohne vorhandene Unit-Test-Sources.
- aus `android/`: `.\gradlew.bat :app:lintDebug`
  - Ergebnis nach Korrektur: gruen.
- Extrahierter `WIDGET_SYNC_SCRIPT` mit `node --check`
  - Ergebnis: gruen.
- `adb devices -l`
  - Ergebnis: kein Android-Geraet verbunden.

APK:

- Debug-APK gebaut:
  - `android/app/build/outputs/apk/debug/app-debug.apk`.
  - Dateigroesse: `40714006` Bytes.

Lint-Findings und Korrektur:

- `W22-S5-F1`:
  - Finding:
    - `AndroidBootTrace.writeToMediaStoreDownloads(...)` verwendet API-29-Downloads-APIs.
    - Call-Site ist bereits mit `Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q` geschuetzt.
    - Lint brauchte dennoch eine explizite API-Annotation am Helper.
  - Korrektur:
    - `@TargetApi(Build.VERSION_CODES.Q)` am Helper ergaenzt.
- `W22-S5-F2`:
  - Finding:
    - `activity_midas_web.xml` nutzte bei Toolbar-Icons `android:tint`.
  - Korrektur:
    - `xmlns:app` ergaenzt.
    - `android:tint` auf `app:tint` umgestellt.

Code Review:

- BP-Fachlogik unveraendert:
  - Morgenmessung vorhanden und Abendmessung fehlt -> `BD Abend offen`.
  - Alle anderen Faelle -> `Alles ruhig`.
- Lint-Korrekturen sind ausserhalb der BP-Fachlogik und betreffen nur Android-Tooling-/Kompatibilitaetsmeldungen.
- `WIDGET_SYNC_SCRIPT` ist syntaktisch gueltig.
- Sichtbare Android-Resource nutzt nach User-Korrektur die korrekte UI-Schreibweise fuer Fluessigkeit.

Contract Review:

- V2.2 bleibt im Vertrag:
  - keine Terminlogik.
  - keine Push-/Reminder-Aenderung.
  - keine BP-Werte, keine Schwellen, keine medizinische Bewertung.
  - Widget bleibt read-only und passiver Homescreen-Kontext.
- Lokale Build-/Lint-/Syntax-Gates sind gruen.
- Echter Homescreen-Smoke bleibt erforderlich, weil ADB aktuell kein Geraet sieht.

Findings:

- `W22-S5-F1`: fixed.
- `W22-S5-F2`: fixed.
- `W22-S5-F3`: fixed durch erfolgreichen User-Device-Smoke am `2026-07-01`.
- `W22-S5-F4`: fixed.

Korrektur:

- S5-Lint-Findings wurden korrigiert.
- CodeRabbit-Finding `W22-S5-F4` wurde korrigiert:
  - Bei `snapshot == null` zeigt die BP-Zeile jetzt `Lade...`.
  - `Alles ruhig` wird nur noch gerendert, wenn ein Snapshot existiert und `bloodPressureStatus == NONE` ist.
- Weitere Code-Korrektur nach lokalem Review nicht erforderlich.

Nachtest nach `W22-S5-F4`:

- aus `android/`: `.\gradlew.bat :app:compileDebugKotlin`
  - Ergebnis: gruen.
- aus `android/`: `.\gradlew.bat :app:assembleDebug`
  - Ergebnis: gruen.
- aus `android/`: `.\gradlew.bat :app:lintDebug`
  - Ergebnis: gruen.
- Extrahierter `WIDGET_SYNC_SCRIPT` mit `node --check`
  - Ergebnis: gruen.
- `git diff --check`
  - Ergebnis: gruen.
- Debug-APK neu gebaut:
  - `android/app/build/outputs/apk/debug/app-debug.apk`.

Schritt-Abnahme:

- S5 lokale Checks sind abgeschlossen.
- CodeRabbit Review wurde ausgewertet und das einzige Finding korrigiert.
- Android Device-Smoke auf der Debug-APK wurde am `2026-07-01` durch den User erfolgreich abgeschlossen.
- S5 ist abgeschlossen.
- Naechster erlaubter Schritt ist S6.

Runtime-Smoke 2026-07-01:

- APK wurde installiert.
- Widget synchronisiert ordentlich.
- Alle V2.2-Logiken laufen wie gewuenscht.
- Homescreen-Darstellung wurde durch User-Test akzeptiert.
- `W22-F3`, `W22-S3-F3` und `W22-S5-F3` sind damit geschlossen.

### S6 - Doku-Sync, QA-Update und finaler Abschlussreview 2026-07-01

Abgearbeitet:

- S6.1 `android/docs/Widget Contract.md` aktualisiert.
- S6.2 `docs/modules/Android Widget Module Overview.md` aktualisiert.
- S6.3 `docs/QA_CHECKS.md` aktualisiert.
- S6.4 Roadmap mit Ergebnisprotokoll aktualisiert.
- S6.5 Finaler Contract Review durchgefuehrt.
- S6.6 Abschluss-Abnahme vorbereitet.
- S6.7 Commit-Empfehlung bleibt nach Archivierung sinnvoll.
- S6.8 Archiv-Entscheidung bleibt nach User-Freigabe.

Dokumentations-Sync:

- `android/docs/Widget Contract.md`:
  - `DailyWidgetState` dokumentiert jetzt `bloodPressureStatus`.
  - `bloodPressureStatus` beschreibt `none` und `evening_open`.
  - Datenvertrag bleibt `health_events`, `type = bp`, heutiger `ctx`.
  - `Morgen` / `M` / `morning` und `Abend` / `A` / `evening` sind dokumentiert.
  - Anzeigevertrag ist V2.2 mit drei Zeilen:
    - `Fluessigkeit`.
    - `Medikation`.
    - `Blutdruck`.
  - Fehlender Snapshot rendert fuer BP `Lade...`.
  - `Alles ruhig` ist als Widget-Neutralstatus abgegrenzt.
  - Nicht-Ziele wurden von `keine Blutdruck-Zeile` auf keine BP-Werte, BP-Schwellen, BP-Bewertung oder BP-Eingabe korrigiert.
- `docs/modules/Android Widget Module Overview.md`:
  - Status auf V2.2 gehoben.
  - Zielsetzung, Datenmodell, Sync-Read, Renderpfad, Bridge-Events, UI-Integration, Zukunftspfade, Status und QA-Checkliste auf BP-Kontext ergaenzt.
  - `Blood-Pressure-State` und `bp:changed` als WebView->Android-Bridge-Kontext dokumentiert.
- `docs/QA_CHECKS.md`:
  - Neue Phase `A9 - Android Widget V2.2 Blood Pressure Context (2026-07-01)` ergaenzt.
  - Lokale Checks, Widget Contract, Runtime-Smoke und Guardrails dokumentiert.

Contract Review:

- Doku ist konsistent mit dem umgesetzten V2.2-Code:
  - Snapshot-Feld `bloodPressureStatus`.
  - `evening_open` nur bei heutiger Morgenmessung ohne heutige Abendmessung.
  - alle anderen vorhandenen Snapshot-Faelle neutral.
  - fehlender kompletter Snapshot zeigt Ladeplatzhalter.
- Doku bleibt innerhalb der Guardrails:
  - keine Terminlogik.
  - keine Push-/Reminder-Aenderung.
  - keine BP-Rohwerte oder Schwellen.
  - keine medizinische Bewertung.
  - keine SQL-/Backend-/Edge-Aenderung.
- `S5`-Smoke ist in QA und Roadmap nachvollziehbar:
  - lokale Checks gruen.
  - CodeRabbit-Finding korrigiert.
  - User-Device-Smoke erfolgreich.

Findings:

- `W22-S6-F1`: fixed.
- `W22-S6-F2`: fixed.
- `W22-S6-F3`: fixed.

Korrektur:

- Widget Contract von V2.1-Anzeigevertrag auf V2.2-Anzeigevertrag korrigiert.
- Android Widget Module Overview von V2.1-Stand auf V2.2-Stand korrigiert.
- QA_CHECKS um eine dedizierte V2.2-BP-Widget-Phase erweitert.
- Markdown-Tabellenstil in der Overview fuer die Kernkomponenten-Tabelle normalisiert.

Schritt-Abnahme:

- S6 ist abgeschlossen.
- Roadmap wird mit `(DONE)` abgeschlossen und nach `docs/archive/` verschoben.
- Naechster sinnvoller Schritt:
  - V2.3 mit eigener Roadmap starten.
