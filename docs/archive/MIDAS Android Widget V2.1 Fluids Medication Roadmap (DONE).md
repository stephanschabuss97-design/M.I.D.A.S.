# MIDAS Android Widget V2.1 Fluids Medication Roadmap

## Roadmap-Metadaten

| Feld | Wert |
| --- | --- |
| Status | `DONE` |
| Modul / Bereich | Android Widget / Daily Snapshot |
| Owner / Kontext | Android, Widget, Intake, Medication |
| Erstellt am | `2026-06-29` |
| Letzter Stand | `2026-06-29, S6 abgeschlossen; Device-Smoke erfolgreich` |
| Aktueller Schritt | `DONE` |
| Betroffene Hauptdateien | `android/app/src/main/java/de/schabuss/midas/widget/*`, `android/app/src/main/java/de/schabuss/midas/web/MidasWebActivity.kt`, `android/app/src/main/res/layout/widget_midas.xml`, `android/app/src/main/res/values/strings.xml`, `android/docs/Widget Contract.md`, `docs/modules/Android Widget Module Overview.md`, `docs/QA_CHECKS.md` |
| Deploy relevant | `nein` |
| Runtime-Smoke relevant | `ja, Android Debug-APK und Device-Smoke` |
| Archivziel | `docs/archive/MIDAS Android Widget V2.1 Fluids Medication Roadmap (DONE).md` |

## Current Working State / Handoff

- Aktueller Stand:
  - S1 wurde am `2026-06-29` deterministisch abgeschlossen.
  - S2 wurde am `2026-06-29` deterministisch abgeschlossen.
  - S3 wurde am `2026-06-29` deterministisch abgeschlossen.
  - S4 Readiness Review wurde am `2026-06-29` abgeschlossen.
  - S4.1 wurde am `2026-06-29` umgesetzt, geprueft und contract-reviewed.
  - S4.2 wurde am `2026-06-29` umgesetzt, geprueft und contract-reviewed.
  - S4.3 wurde am `2026-06-29` umgesetzt, geprueft und contract-reviewed.
  - S4.4 wurde am `2026-06-29` umgesetzt, geprueft und contract-reviewed.
  - S4.5 wurde am `2026-06-29` umgesetzt, geprueft und contract-reviewed.
  - S4.6 wurde am `2026-06-29` umgesetzt, geprueft und contract-reviewed.
  - S4.7 wurde am `2026-06-29` umgesetzt, geprueft und contract-reviewed.
  - S5 wurde am `2026-06-29` lokal abgeschlossen:
    - `compileDebugKotlin` gruen.
    - `assembleDebug` gruen.
    - Debug-APK erzeugt.
    - kein ADB-Geraet verbunden; Device-Smoke bleibt User-Test.
  - CodeRabbit-Findings nach S5 wurden am `2026-06-29` korrigiert und erneut geprueft.
  - S6-Doku-/QA-Sync wurde am `2026-06-29` abgeschlossen.
  - Device-Smoke wurde am `2026-06-29` erfolgreich durch User-Test abgeschlossen.
  - Widget V2.1-Code zeigt zwei fachliche Zeilen: `Fluessigkeit`, `Medikation`.
  - Fluessigkeit rendert `Ist / Soll L`.
  - Medikation rendert bevorzugt eine V2.1-Summary aus `med_list_v2.slots[]`.
  - Android speichert `DailyWidgetState` lokal und rendert ausschliesslich daraus.
  - Android liest Intake nativ aus `health_events` und Medikation ueber `med_list_v2`.
  - `med_list_v2` liefert bereits `slots[]` inklusive `slot_type` und `is_taken`.
  - V2.1-Zielvertrag ist festgelegt:
    - Fluessigkeit als `Ist / Soll L` mit einer Dezimalstelle und deutschem Komma.
    - Medikation als kompakter Abschnittsstatus, priorisiert nach offenem naechstem Tagesabschnitt.
    - Zwei fachliche Datenzeilen in V2.1; dritte Flaeche bleibt nur Reservierungs-/Spacing-Vertrag fuer V2.2/V2.3.
- Naechster erlaubter Schritt:
  - V2.1 ist abgeschlossen.
  - V2.2 kann als naechste Roadmap fortgesetzt werden.
- Aktuell bekannte Findings:
  - `W21-F1`: Wasser-Ist und Wasser-Soll sind im Widget getrennte Zeilen und zu exakt fuer Homescreen-Lesbarkeit.
  - `W21-F2`: Medication-Status ist nicht abschnittsfaehig, obwohl MIDAS produktiv `morning/noon/evening/night` unterstuetzt.
  - `W21-S1-F1`: V2.1-Zeilenvertrag war in S2.5 zu hart als `3 Zeilen bleiben Ziel` formuliert, obwohl V2.1 fachlich nur Fluessigkeit und Medikation einfuehrt; in S1 korrigiert.
  - `W21-S2-F1`: Doppelte Medication-Texte wie `Morgen erledigt / Abend offen` sind fuer das Widget zu overflow-gefaehrdet; V2.1 nutzt deshalb einen kompakten priorisierten Kurzstatus.
  - `W21-S3-F1`: Alte Snapshots besitzen keine V2.1-Medication-Summary; S4.1/S4.4 muessen Backward-Kompatibilitaet und Fallbacks sichern.
  - `W21-S3-F2`: WebView Bridge postet aktuell nur alten Tagesstatus; S4.5 muss Bridge-Drift verhindern.
  - `W21-G1`: Ressourcen-Strings muessen vor Provider-/Layout-Formatierung angelegt werden; S4 wurde entsprechend neu geschnitten.
  - `W21-S4.1-F1`: Android Gradle Checks muessen aus `android/` gestartet werden; Roadmap-Kommandos wurden korrigiert.
  - `W21-S4.7-F1`: Alte unreferenzierte Wasser-/Milliliter-Strings wurden nach dem Layoutumbau entfernt.
  - `W21-CR-S5-F1`: CodeRabbit-Findings zu Web-Wasser-Normalisierung, Summary-Counts, Legacy-Bridge-Status und Abschnitts-Copy wurden korrigiert.
  - `W21-S6-F1`: Device-Smoke wurde erfolgreich abgeschlossen.
- Aktuell geaenderte Dateien:
  - `android/app/src/main/java/de/schabuss/midas/widget/DailyWidgetState.kt`
  - `android/app/src/main/java/de/schabuss/midas/widget/WidgetSnapshotStore.kt`
  - `android/app/src/main/java/de/schabuss/midas/widget/MidasWidgetProvider.kt`
  - `android/app/src/main/java/de/schabuss/midas/widget/WidgetSyncRepository.kt`
  - `android/app/src/main/java/de/schabuss/midas/widget/WidgetSyncBridge.kt`
  - `android/app/src/main/java/de/schabuss/midas/web/MidasWebActivity.kt`
  - `android/app/src/main/res/layout/widget_midas.xml`
  - `android/app/src/main/res/values/strings.xml`
  - `android/docs/Widget Contract.md`
  - `docs/modules/Android Widget Module Overview.md`
  - `docs/QA_CHECKS.md`
  - diese Roadmap.
- Offene User-Freigaben:
  - Keine fuer V2.1.
- Wichtige Grenzen fuer den naechsten Chat:
  - Code ab S4 nur im jeweils freigegebenen Substep aendern.
  - Keine BP- oder Terminlogik in V2.1.
  - Kein Widget-Capture, kein Medication-Confirm, kein Reminder, kein Push.
  - Jede V2.1-Umsetzung endet mit eigener Debug-APK fuer User-Test.

## Ziel (klar und pruefbar)

Widget V2.1 soll den bestehenden V1-Nutzen verdichten, ohne neue Fachbereiche einzufuehren:

- `Wasser` und `Wasser-Soll` werden in eine kompakte Fluessigkeitszeile zusammengefuehrt.
- Fluessigkeit wird homescreen-tauglich in Litern statt millilitergenau angezeigt.
- Medikation wird zukunftsfaehig abschnittsbezogen dargestellt, wenn mehrere Tagesabschnitte relevant sind.
- Das Widget bleibt read-only und passiver Snapshot.
- Nach Abschluss entsteht eine installierbare Debug-APK fuer Android-Device-Smoke.

Pruefbare Zieldefinition:

- Das Widget zeigt eine Fluessigkeitszeile im Format `Ist / Soll L`, z. B. `0,6 / 1,7 L`.
- Wasserwerte werden aus denselben bestehenden Quellen wie V1 berechnet.
- Medikation kann mindestens `Alles erledigt`, `Morgen erledigt`, `Abend offen`, `2/4 erledigt`, `Kein Plan` oder bewusst final gewaehlte aequivalente Kurztexte darstellen.
- Medication-Status wird aus `med_list_v2.slots[]` abgeleitet und bleibt konsistent zu `morning`, `noon`, `evening`, `night`.
- Keine neue Datenbanktabelle, keine SQL-Aenderung, kein Backend-Endpoint und kein neuer Widget-Write entstehen.
- `:app:assembleDebug` ist gruen.
- Die erzeugte APK kann auf Android installiert und gegen echte Widget-Anzeige getestet werden.

## Problemzusammenfassung

Das aktuelle V1-Widget ist stabil, aber noch nicht optimal verdichtet:

- `Wasser` und `Wasser-Soll` belegen zwei Zeilen, obwohl ein Vergleichswert sinnvoller ist.
- Milliliterwerte wirken auf dem Homescreen genauer als der reale Trinkalltag.
- `Medikation: Erledigt` ist fuer 1x taeglich ausreichend, aber nicht robust fuer spaetere oder bestehende mehrfache Tagesabschnitte.
- MIDAS selbst arbeitet bei Medikation bereits abschnittsbezogen; das Widget zeigt davon nur eine grobe Tageszusammenfassung.

V2.1 ist daher der risikoarmste erste Widget-Ausbauschritt: keine neuen Module, nur Verdichtung und bessere Nutzung bestehender Medication-Daten.

## Entscheidungslog

| Datum | Entscheidung | Begruendung | Betroffene Schritte |
| --- | --- | --- | --- |
| `2026-06-29` | V2.1 behandelt nur Fluessigkeit und Medikation | Beide Datenquellen existieren bereits im Widget-V1-Vertrag. | `S1-S6` |
| `2026-06-29` | Liter statt Milliliter fuer Fluessigkeit | Homescreen braucht schnelle Orientierung, keine Scheingenauigkeit. | `S2`, `S3`, `S4` |
| `2026-06-29` | Medication-Status wird slot-/abschnittsfaehig | MIDAS unterstuetzt `morning/noon/evening/night`; Widget darf nicht am alten Tagesstatus kleben bleiben. | `S2-S4` |
| `2026-06-29` | Jede Widget-Ausbaustufe liefert eigene Debug-APK | User will V2.1, V2.2 und V2.3 jeweils installiert testen. | `S5` |

## Scope

- Android Widget Datenmodell:
  - `DailyWidgetState`
  - Medication-Status-/Summary-Modell
- Android Snapshot Store:
  - Persistenz neuer oder geaenderter Snapshot-Felder.
- Android Sync:
  - native Ableitung aus `med_list_v2.slots[]`.
  - WebView-Bridge-Snapshot angleichen, falls weiter benoetigt.
- Widget UI:
  - Zeile `Fluessigkeit`.
  - Medication-Kurzstatus.
  - Textgroessen/Abstaende innerhalb bestehender Homescreen-Aesthetik.
- Doku:
  - `android/docs/Widget Contract.md`
  - `docs/modules/Android Widget Module Overview.md`
  - `docs/QA_CHECKS.md`
  - diese Roadmap.
- QA:
  - Android Build.
  - Device-Smoke mit installierter Debug-APK.

## Not in Scope

- Keine Blutdruck-Zeile.
- Keine Termin-Zeile.
- Keine Salz-/Protein-Erweiterung.
- Kein Widget-Capture.
- Kein direkter Medication-Confirm im Widget.
- Keine Push-/Reminder-/AlarmManager-/FCM-Schicht.
- Keine SQL-/RLS-/Backend-/Edge-Function-Aenderung.
- Keine Play-Store-/Release-AAB-Arbeit.
- Keine Neuarchitektur der Android-Shell oder des nativen OAuth.

## Relevante Referenzen (Code)

- `android/app/src/main/java/de/schabuss/midas/widget/DailyWidgetState.kt`
- `android/app/src/main/java/de/schabuss/midas/widget/WidgetSnapshotStore.kt`
- `android/app/src/main/java/de/schabuss/midas/widget/WidgetSyncRepository.kt`
- `android/app/src/main/java/de/schabuss/midas/widget/WidgetSyncBridge.kt`
- `android/app/src/main/java/de/schabuss/midas/widget/MidasWidgetProvider.kt`
- `android/app/src/main/java/de/schabuss/midas/web/MidasWebActivity.kt`
- `android/app/src/main/res/layout/widget_midas.xml`
- `android/app/src/main/res/values/strings.xml`
- `android/app/src/main/res/values/colors.xml`
- `sql/12_Medication.sql`

## Relevante Referenzen (Doku)

- `README.md`
- `docs/DEV_ENVIRONMENT.md`
- `docs/MIDAS Roadmap Template.md`
- `android/README.md`
- `android/docs/Widget Contract.md`
- `docs/modules/Android Widget Module Overview.md`
- `docs/modules/Android Native Auth Module Overview.md`
- `docs/modules/Intake Module Overview.md`
- `docs/modules/Medication Module Overview.md`
- `docs/QA_CHECKS.md`
- `docs/archive/MIDAS Android Widget & Shell Roadmap (DONE).md`
- `docs/archive/MIDAS Android Native OAuth & Widget Activation Roadmap (DONE).md`

Regel:

- Erst README und Dev Environment lesen.
- Dann Android Widget, Android Native Auth, Intake und Medication Overviews lesen.
- Dann historische Android-Widget-Roadmaps lesen.
- Dann betroffene Android-Codepfade lesen.
- Erst nach S4 Readiness Review Code aendern.

## Guardrails

- MIDAS bleibt Hauptsystem und Source of Truth.
- Android Widget bleibt read-only.
- Widget ist ein ruhiger Homescreen-Kompass, kein Coach.
- Keine neuen medizinischen Bewertungen.
- Keine neue Reminder- oder Push-Kette.
- Keine direkte Tablettenbestaetigung im Widget.
- Keine Browser-UI-State-Abhaengigkeit; Widget rendert aus lokalem Android-Snapshot.
- Keine still driftende Hydration-Soll-Logik.
- Medication-Abschnitte muessen dieselben Begriffe/Vertraege wie MIDAS nutzen.
- Source-of-Truth-Dokus muessen am Ende synchron sein.

## Architektur-Constraints

- Android arbeitet mit lokalem `DailyWidgetState`.
- Der Snapshot wird nativ gespeichert und nur fuer heutigen Tag geladen.
- `waterTargetNowMl` wird aktuell lokal ueber `HydrationTargetCalculator` berechnet.
- `med_list_v2` ist das operative Medication-Read-Model.
- `med_list_v2.slots[]` enthaelt `slot_type` und `is_taken`; diese Werte sind fuer Abschnittsstatus massgeblich.
- `WidgetRealtimeSync` beobachtet bereits Medication-Tabellen.
- Android-WebView-Bridge liefert aktuell denselben groben Medication-Status; sie muss bei Contract-Aenderung mitgezogen oder bewusst abgegrenzt werden.
- Build erfolgt aus `android/` ueber `.\gradlew.bat :app:assembleDebug`.

## Tool Permissions

Allowed:

- Android Widget Dateien aendern.
- Android WebView Widget-Bridge aendern, falls fuer Snapshot-Kompatibilitaet noetig.
- Android Ressourcen und Layout aendern.
- Android Widget / Android Native Auth / Intake / Medication Dokus aktualisieren.
- Lokale Checks ausfuehren:
  - aus `android/`: `.\gradlew.bat :app:compileDebugKotlin`
  - aus `android/`: `.\gradlew.bat :app:assembleDebug`
  - `git diff --check`
  - gezielte `rg`-Scans.
- Nach User-Freigabe:
  - APK auf Android-Geraet installieren oder Installationspfad nennen.
  - `adb devices` und einfache Device-Smokes.

Forbidden:

- SQL, RLS, Edge Functions oder Supabase Remote-Deploys.
- Push-, Service-Worker-, Incident- oder Reminder-Logik.
- BP- oder Terminlogik.
- Play-Store-/Release-Signing.
- Native Android Reminder, FCM oder AlarmManager.
- Widget-Capture oder direkte Medication-Confirm-Aktion.

## Deploy- und Runtime-Status

| Feld | Wert |
| --- | --- |
| Lokale Codeaenderung | `geplant` |
| Lokale Checks | `gruen: git diff --check, compileDebugKotlin, assembleDebug` |
| Supabase Deploy | `nicht relevant` |
| GitHub Workflow-Smoke | `nicht relevant` |
| Browser-/Device-Smoke | `gruen: APK installiert und Homescreen-Smoke erfolgreich` |
| Produktive Schreibwirkung | `nein` |
| Letzter Remote-Nachweis | `none` |

## Execution Mode

- Sequenziell arbeiten: `S1` bis `S6`.
- `S1` bis `S3` sind Doku-Detektivarbeit, Systemverstaendnis, Risikoanalyse und Contract Reviews.
- Nach `S3` und vor `S4` gibt es einen expliziten `S4 Readiness Review`.
- `S4` ist Umsetzung in Substeps.
- Jeder S4-Substep endet mit Code Review, Contract Review, Findings und Korrektur der Findings.
- `S5` baut und prueft eine eigene V2.1-Debug-APK.
- `S6` synchronisiert Doku, QA, Roadmap und Archiventscheidung.
- Commit-Empfehlungen werden nur nach S5 oder S6 dokumentiert.

## Skalierung der Roadmap

Diese Roadmap ist mittelgross, weil Android / Widget / WebView Bridge und User-facing Widget-Copy betroffen sind. S1 bis S6 werden voll angewendet.

## Statusmatrix

| ID | Schritt | Status | Ergebnis/Notiz |
| --- | --- | --- | --- |
| S1 | System- und Vertragsdetektivarbeit | DONE | V1-Vertrag, Android Auth, Intake, Medication, Widget-Code, Bridge, Layout und `med_list_v2` gelesen; Systemkarte dokumentiert. |
| S2 | Fachlicher/technischer Contract Review | DONE | Literformat, Medication-Kurzstatus, Abschnittsprioritaet, Bridge-Vertrag und V2.1-Layoutvertrag festgelegt. |
| S3 | Bruchrisiko-, UI-/Copy- und Umsetzungsreview | DONE | Snapshot-Kompatibilitaet, Bridge-Drift, Textlaengen, Layout, Tooling und S4-Kriterien geklaert. |
| S4 | Umsetzung | DONE | V2.1-Code umgesetzt; Gesamt-Code- und Contract Review abgeschlossen. |
| S5 | Tests, Code Review und Contract Review | DONE | Lokale Checks gruen, Debug-APK gebaut, ADB ohne verbundenes Geraet; Device-Smoke fuer User-Test dokumentiert. |
| S6 | Doku-Sync, QA-Update und finaler Abschlussreview | DONE | Doku/QA synchronisiert, Device-Smoke erfolgreich, Archivfreigabe erteilt. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Finding-Klassifizierung

| ID | Severity | Typ | Status | Entscheidung / Zielschritt |
| --- | --- | --- | --- | --- |
| `W21-F1` | `P2` | `UI` / `Copy` | `fixed` | Fluessigkeitszeilen wurden verdichtet; Widget rendert `Ist / Soll L`. |
| `W21-F2` | `P1` | `Contract` / `Code` | `fixed` | Medication-Status wird aus `slots[]` als V2.1-Summary abgeleitet. |
| `W21-F3` | `Watchlist` | `Layout` | `fixed` | Device-Smoke bestaetigt die V2.1-Homescreen-Wirkung; Code entfernt die aktive dritte Wasser-Soll-Zeile. |
| `W21-S1-F1` | `P2` | `Contract` / `Layout` | `fixed` | S2.5 klaert jetzt explizit den finalen Zeilen-/Spacing-Vertrag statt ein starres 3-Zeilen-Ziel vorzugeben. |
| `W21-S2-F1` | `P2` | `Copy` / `Layout` | `fixed` | Medication-Copy bleibt priorisiert und kurz; Slash-/Doppelstatus wird nicht V2.1-Standard, um Homescreen-Overflow zu vermeiden. |
| `W21-S3-F1` | `P1` | `Compatibility` / `Code` | `fixed` | S4.1/S4.4 muessen alte Snapshots, fehlende `slots[]` und alten Tagesstatus defensiv behandeln. |
| `W21-S3-F2` | `P1` | `Contract` / `Bridge` | `fixed` | S4.5 muss WebView Bridge und nativen Sync auf denselben V2.1-Snapshot-Vertrag bringen oder alte Bridge-Writes verhindern. |
| `W21-G1` | `P2` | `Execution` / `Resources` | `fixed` | S4.2 legt Strings/Copies vor Provider- und Layout-Code an; Fluessigkeitsrendering rueckt nach S4.3. |
| `W21-S4.1-F1` | `P2` | `Tooling` | `fixed` | Gradle-Checks in dieser Roadmap laufen aus `android/` mit `.\gradlew.bat`; root-Aufruf ist nicht verlaesslich. |
| `W21-S4.7-F1` | `P2` | `Hygiene` / `Resources` | `fixed` | Alte nicht mehr referenzierte `Wasser`-/`Wasser-Soll`-/Milliliter-Widget-Strings wurden entfernt. |
| `W21-CR-S5-F1` | `P2` | `Parity` / `WebView` | `fixed` | WebView-Wasserwert wird wie der native Pfad auf endliche Werte `>= 0` normalisiert. |
| `W21-CR-S5-F2` | `P1` | `Robustness` / `Snapshot` | `fixed` | `MedicationWidgetSummary.normalized()` klemmt `takenCount` auf `0..totalCount`. |
| `W21-CR-S5-F3` | `P1` | `Bridge` / `Status` | `fixed` | Legacy-Bridge-Updates duerfen neue Statuswerte nicht durch alte V2.1-Summaries ueberstimmen. |
| `W21-CR-S5-F4` | `P2` | `Copy` / `Widget` | `fixed` | Tagesabschnitt-Copy wurde auf `Morgens`, `Mittags`, `Abends`, `Nachts` umgestellt. |
| `W21-S6-F1` | `P2` | `Runtime-Smoke` / `Device` | `fixed` | Homescreen-Smoke wurde per User-Test erfolgreich abgeschlossen. |

Severity-Vertrag:

- `P0`: blockiert Umsetzung oder kann produktiv falsche/sensible Writes, Auth-Bruch oder harte Datenfehler erzeugen.
- `P1`: echter Contract-/Runtime-/User-Facing-Bug, muss in dieser Roadmap adressiert oder explizit abgegrenzt werden.
- `P2`: Hygiene, Robustheit oder Copy-Verbesserung ohne akuten Blocker.
- `Watchlist`: erkannt, aber nicht Teil dieser Roadmap; nur dokumentieren, wenn es fuer spaetere Reviews relevant ist.

---

## S1 - System- und Vertragsdetektivarbeit

Ziel:

- Bestehenden V1-Widget-Vertrag verstehen.
- Fluessigkeits-, Medication-, Snapshot- und Bridge-Pfade mappen.
- Noch keinen Code aendern, ausser diese Roadmap selbst wird aktualisiert.

Substeps:

- S1.1 `README.md`, `docs/DEV_ENVIRONMENT.md` und `android/README.md` lesen.
- S1.2 `android/docs/Widget Contract.md` und Android Widget Overview lesen.
- S1.3 Android Native Auth Overview lesen.
- S1.4 Intake und Medication Module Overviews lesen.
- S1.5 Historische Android Widget & Shell Roadmap lesen.
- S1.6 Codepfade lesen:
  - `DailyWidgetState.kt`
  - `WidgetSnapshotStore.kt`
  - `WidgetSyncRepository.kt`
  - `WidgetSyncBridge.kt`
  - `MidasWidgetProvider.kt`
  - `MidasWebActivity.kt`
  - `widget_midas.xml`
  - `strings.xml`
- S1.7 `sql/12_Medication.sql` / `med_list_v2` lesen.
- S1.8 Systemkarte und bestehende Datenfluesse dokumentieren.
- S1.9 Contract Review S1.
- S1.10 Findings korrigieren und Schritt-Abnahme dokumentieren.

Exit-Kriterium:

- Es ist klar, welche Felder und Sync-Pfade V2.1 fuer Fluessigkeit und Medication anfassen muss.

## S2 - Fachlicher/technischer Contract Review

Ziel:

- Finalen V2.1-Zielvertrag fuer Fluessigkeit und Medikation festlegen.

Substeps:

- S2.1 Literformat final festlegen:
  - Rundung.
  - Dezimaltrennzeichen.
  - Fallback bei fehlendem Snapshot.
- S2.2 Medication-Kurzstatus final festlegen:
  - Einzeldosis.
  - Mehrfachdosis.
  - offene naechste Tagesabschnitte.
  - alles erledigt.
  - kein Plan.
- S2.3 Abschnitts-Prioritaet definieren:
  - `morning`, `noon`, `evening`, `night`.
- S2.4 Native Sync vs. WebView Bridge Vertrag pruefen.
- S2.5 Layout-Ziel festlegen:
  - V2.1 finalisiert den sichtbaren Zeilen-/Spacing-Vertrag fuer die bestehende 4x2-Widget-Flaeche.
  - Eine Zeile wird `Fluessigkeit` und ersetzt `Wasser` plus `Wasser-Soll`.
  - Eine Zeile bleibt `Medikation` und wird abschnittsfaehig.
  - S2 entscheidet, ob eine dritte V2.1-Zeile als ruhiger Reserved-/Status-/Spacing-Slot erhalten bleibt oder ob das Layout bewusst luftiger wird.
  - Keine BP- oder Termin-Inhalte in diesem Reserved-Slot.
- S2.6 Findings und Pflichtkorrekturen fuer S4 definieren.
- S2.7 Contract Review S2.
- S2.8 Findings korrigieren und Schritt-Abnahme dokumentieren.

Exit-Kriterium:

- Copy, Datenmodell und Sync-Vertrag sind vor S4 eindeutig.

## S3 - Bruchrisiko-, UI-/Copy- und Umsetzungsreview

Ziel:

- Risiken finden, bevor Android-Code geaendert wird.

Substeps:

- S3.1 Bruchrisiken identifizieren:
  - alte Snapshots.
  - fehlende `slots[]`.
  - uneinheitliche WebView-Bridge vs. nativer Sync.
  - Textueberlauf im Widget.
  - Medication-Abschnitt mit mehreren Medikamenten.
  - Sortierung und Prioritaet bei offenen Slots.
- S3.2 User-Facing Copy Review:
  - `Fluessigkeit`.
  - `0,6 / 1,7 L`.
  - `Morgen erledigt`, `Abend offen`, `Alles erledigt`, `Kein Plan`.
- S3.3 Layout Review:
  - 4x2 Widget.
  - Schriftgroessen.
  - Textlaenge auf Samsung Homescreen.
- S3.4 Tooling und Checks klaeren.
- S3.5 S4-Substeps konkretisieren.
- S3.6 Contract Review S3.
- S3.7 Findings korrigieren und Schritt-Abnahme dokumentieren.

Exit-Kriterium:

- S4 hat klare Substeps und bekannte Review-Kriterien.

## S4 Readiness Review - Gate nach S3, vor S4

Ziel:

- Direkt vor Code-Aenderungen pruefen, ob S4 nach S1-S3 noch richtig geschnitten ist.

Prueffragen:

- Muss das Datenmodell vor Layout und Provider geaendert werden?
- Muss die WebView Bridge zwingend mitgezogen werden?
- Reicht `med_list_v2` fuer alle Medication-Texte?
- Muessen Ressourcen-Strings vor Provider-Formatierung angelegt werden?
- Sind S5-Checks vollstaendig fuer Kotlin, XML und APK?

Exit-Kriterium:

- Reihenfolge, Dateien und Pflichtchecks fuer S4 sind eindeutig.

## S4 - Umsetzung

Ziel:

- V2.1 sequenziell umsetzen.

Geplante Substeps:

- S4.1 Snapshot-Modell fuer V2.1 vorbereiten:
  - Medication-Summary-Felder oder Hilfsmodell einfuehren.
  - Backward-kompatibles Laden alter Snapshots sicherstellen.
  - Alten `MedicationStatus` als defensiven Fallback erhalten, solange kein V2.1-Summary-Text vorhanden ist.
- S4.2 Ressourcen-Strings und Copy-Basis vorbereiten:
  - `Fluessigkeit`-Label anlegen.
  - Liter-Format-/Placeholder-Strings anlegen.
  - Medication-Kurztexte anlegen oder bestehende Texte gezielt weiterverwenden.
  - alte V1-Strings erst entfernen, wenn Layout/Provider nicht mehr darauf referenzieren.
- S4.3 Fluessigkeitsformat umsetzen:
  - `waterCurrentMl` und `waterTargetNowMl` als Liter-Kurztext rendern.
  - `Wasser` / `Wasser-Soll` zu `Fluessigkeit` zusammenfuehren.
  - Fehlenden Snapshot als `-- / -- L` darstellen.
- S4.4 Medication-Slot-Auswertung nativ umsetzen:
  - `slots[]` auswerten.
  - offene/erledigte Abschnitte ableiten.
  - mehrere Medikamente pro Abschnitt aggregieren.
  - fehlende oder leere `slots[]` ueber `total_count` / `taken_count` defensiv auf alten Tagesstatus zurueckfuehren.
- S4.5 WebView-Bridge-Snapshot angleichen:
  - JS-Ableitung und native Bridge gegen denselben Medication-Vertrag pruefen.
  - verhindern, dass ein alter Bridge-Post einen reicheren nativen V2.1-Snapshot auf groben Tagesstatus zurueckstuft.
- S4.6 Widget-Layout anpassen:
  - Zeilen, Labels, Werte, Farben.
  - Textueberlauf vermeiden.
  - `Wasser-Soll` als aktive UI-Zeile entfernen oder in die Fluessigkeitszeile ueberfuehren.
  - dritte Zone nur als ruhiges Spacing/Reserve behandeln, ohne neue Fachinformation.
- S4.7 Gesamt-Code- und Contract Review:
  - Datenmodell, Store, Sync, Bridge, Provider, Layout.
  - Findings korrigieren.

Jeder Substep endet mit:

- Umsetzung.
- Betroffene Dateien.
- Lokaler Check.
- Code Review.
- Contract Review.
- Findings.
- Korrektur der Findings.

Exit-Kriterium:

- V2.1 ist lokal implementiert und bereit fuer S5.

## S5 - Tests, Code Review und Contract Review

Ziel:

- V2.1 pruefen und Debug-APK bereitstellen.

Substeps:

- S5.1 `git diff --check`.
- S5.2 aus `android/`: `.\gradlew.bat :app:compileDebugKotlin`.
- S5.3 aus `android/`: `.\gradlew.bat :app:assembleDebug`.
- S5.4 APK-Pfad dokumentieren:
  - `android/app/build/outputs/apk/debug/app-debug.apk`.
- S5.5 Optional `adb devices` und Installation nach User-Freigabe.
- S5.6 Device-Smoke definieren oder ausfuehren:
  - Widget zeigt `Fluessigkeit`.
  - Literformat korrekt.
  - Medication bei 1x taeglich korrekt.
  - Medication bei mehreren Tagesabschnitten korrekt oder Testfall als offen dokumentiert.
  - Widget-Tap triggert weiterhin manuellen Sync.
- S5.7 User-Facing Copy Review auf echtem Homescreen.
- S5.8 Code Review gegen Bruchrisiken.
- S5.9 Contract Review gegen Guardrails.
- S5.10 Schritt-Abnahme und Commit-Empfehlung.

Exit-Kriterium:

- Lokale Checks sind gruen und APK ist fuer User-Test verfuegbar oder Device-Smoke ist dokumentiert.

## S6 - Doku-Sync, QA-Update und finaler Abschlussreview

Ziel:

- Source-of-Truth-Dokus synchronisieren und V2.1 abschliessen.

Substeps:

- S6.1 `android/docs/Widget Contract.md` aktualisieren.
- S6.2 `docs/modules/Android Widget Module Overview.md` aktualisieren.
- S6.3 `docs/QA_CHECKS.md` aktualisieren.
- S6.4 Roadmap mit Ergebnisprotokollen aktualisieren.
- S6.5 Finaler Contract Review:
  - Roadmap vs. Code.
  - Roadmap vs. Widget Contract.
  - Roadmap vs. Android Overview.
  - Roadmap vs. QA.
- S6.6 Abschluss-Abnahme.
- S6.7 Commit-Empfehlung.
- S6.8 Archiv-Entscheidung nach User-Freigabe.

Exit-Kriterium:

- V2.1 ist dokumentiert, geprueft und bereit fuer V2.2.

---

## Ergebnisprotokoll

### Roadmap-Erstellung 2026-06-29

Gelesen / beruecksichtigt:

- `docs/MIDAS Roadmap Template.md`
- `android/docs/Widget Contract.md`
- `docs/modules/Android Widget Module Overview.md`
- `docs/modules/Medication Module Overview.md`
- `docs/DEV_ENVIRONMENT.md`
- aktueller Widget-Iststand aus Android-Codeanalyse

Contract Review:

- Roadmap bleibt im V2.1-Scope: Fluessigkeit und Medikation.
- Keine BP-, Termin-, Push- oder Reminder-Logik enthalten.
- APK-/Device-Smoke ist als S5-Pflicht enthalten.
- Source-of-Truth-Doku-Sync ist in S6 enthalten.

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

### S1 - System- und Vertragsdetektivarbeit 2026-06-29

Deterministisch abgearbeitet:

- S1.1 `README.md`, `docs/DEV_ENVIRONMENT.md` und `android/README.md`:
  - MIDAS ist das Hauptsystem und bleibt Source of Truth.
  - Android ist ein kleiner MIDAS-Node fuer Launcher, native Auth und Widget.
  - Android-Build erfolgt ueber den Repo-Wrapper mit lokalem SDK/JDK-Vertrag aus `docs/DEV_ENVIRONMENT.md`.
- S1.2 `android/docs/Widget Contract.md` und Android Widget Overview:
  - Widget bleibt passiver, read-only Daily Snapshot.
  - Kein Capture, kein Reminder, kein Push, keine direkte Medication-Bestaetigung.
  - V1-Felder sind `dayIso`, `waterCurrentMl`, `waterTargetNowMl`, `medicationStatus`, `updatedAt`.
- S1.3 Android Native Auth Overview:
  - Native Android Session ist Source of Truth fuer Widget-Aktivierung und Android-Sync.
  - WebView ist MIDAS-Surface und Session-Mirror, nicht OAuth-Owner und nicht Reminder-Push-Master.
- S1.4 Intake und Medication Overviews:
  - Intake liefert Wasser-Ist ueber bestehende Tageswerte.
  - Medication nutzt produktiv `med_list_v2`.
  - Medication arbeitet bereits mit den Abschnitten `morning`, `noon`, `evening`, `night`.
- S1.5 Historische Android Widget & Shell Roadmap:
  - V1 wurde bewusst als ruhiges Homescreen-Widget gebaut.
  - V1-Grenzen bleiben fuer V2.1 gueltig: keine BP-/Termin-/Reminder-Erweiterung.
- S1.6 Codepfade:
  - `DailyWidgetState.kt` enthaelt aktuell nur den groben `MedicationStatus`.
  - `WidgetSnapshotStore.kt` speichert Wasser-Ist und groben Medication-Status, berechnet Wasser-Soll lokal.
  - `WidgetSyncRepository.kt` liest Intake nativ und Medication per `med_list_v2`, wertet aber nur `total_count` und `taken_count` aus.
  - `WidgetSyncBridge.kt` kann nur den groben Medication-Status speichern.
  - `MidasWidgetProvider.kt` rendert aktuell drei getrennte Zeilen: Wasser, Wasser-Soll, Medikation.
  - `MidasWebActivity.kt` injiziert denselben groben Medication-Status in die WebView-Bridge.
  - `widget_midas.xml` und `strings.xml` sind noch auf V1-Zeilen und Milliliter-Copy ausgelegt.
- S1.7 `sql/12_Medication.sql` / `med_list_v2`:
  - `med_list_v2` liefert `slots[]` mit `slot_type`, `is_taken`, `taken_at`, `qty`, `sort_order` und `day`.
  - Keine SQL-Aenderung fuer V2.1 noetig.
- S1.8 Systemkarte:
  - Fluessigkeit: Supabase Intake Read -> `WidgetSyncRepository.extractWaterMl` -> `WidgetSnapshotStore` -> lokaler Target-Rechner -> Widget Render.
  - Medication: `med_list_v2` -> aktuell grobe Tagesaggregation -> `WidgetSnapshotStore` -> Widget Render.
  - WebView-Bridge: MIDAS-WebView kann Snapshot posten, nutzt aber ebenfalls nur groben Tagesstatus.
  - V2.1 muss native Sync- und Bridge-Ableitung konsistent halten oder bewusst eine Quelle priorisieren.

Contract Review S1:

- Scope passt: V2.1 kann ohne Backend, SQL, Push, Reminder, BP oder Termine umgesetzt werden.
- Datenquellen passen: Wasser und Medication liegen bereits im V1-Widget-Vertrag vor.
- Hauptbruchrisiko liegt nicht bei Datenzugriff, sondern bei Snapshot-Kompatibilitaet, Medication-Slot-Auswertung und Widget-Textlaengen.
- Finding `W21-S1-F1`: S2.5 formulierte den Layout-Vertrag zu starr als `3 Zeilen bleiben Ziel`, obwohl V2.1 fachlich nur Fluessigkeit und Medikation bearbeitet.

Korrektur S1:

- `W21-S1-F1` wurde in der Finding-Tabelle aufgenommen und als `fixed` markiert.
- S2.5 wurde korrigiert:
  - V2.1 klaert den finalen Zeilen-/Spacing-Vertrag.
  - Fluessigkeit und Medikation sind Pflichtinhalte.
  - Eine moegliche dritte Zeile bleibt nur Reserved-/Status-/Spacing-Slot.
  - BP und Termine bleiben ausdruecklich aus V2.1 draussen.

Schritt-Abnahme:

- S1 ist abgeschlossen.
- Naechster erlaubter Schritt ist S2.

### S2 - Fachlicher/technischer Contract Review 2026-06-29

Deterministisch abgearbeitet:

- S2.1 Literformat final festgelegt:
  - Anzeigeformat: `Ist / Soll L`.
  - Beispiel: `0,6 / 1,7 L`.
  - Wertebasis bleibt Milliliter im Snapshot; Anzeige rechnet nur fuer den Homescreen in Liter um.
  - Rundung: eine Dezimalstelle.
  - Dezimaltrennzeichen: deutsches Komma.
  - Einheit: einmalig am Ende als `L`.
  - Fehlender Snapshot: `-- / -- L`.
  - Manueller Sync: bestehende sichtbare Sync-Copy bleibt erlaubt, z. B. `Synchronisiere...`.
  - Keine Aenderung an `HydrationTargetCalculator`; der Target-Vertrag bleibt Milliliter intern.
- S2.2 Medication-Kurzstatus final festgelegt:
  - Datenbasis: `med_list_v2.slots[]`.
  - Kein aktiver Tagesplan: `Kein Plan`.
  - Genau ein geplanter Abschnitt:
    - Abschnitt voll erledigt: `<Abschnitt> erledigt`, z. B. `Morgen erledigt`.
    - Abschnitt offen oder teilweise offen: `<Abschnitt> offen`, z. B. `Morgen offen`.
  - Mehrere geplante Abschnitte:
    - alle geplanten Slots erledigt: `Alles erledigt`.
    - genau ein Abschnitt offen: `<Abschnitt> offen`, z. B. `Abend offen`.
    - mehrere Abschnitte offen oder gemischte Teilzustaende: `<taken>/<total> erledigt`, z. B. `2/4 erledigt`.
  - Slash-/Doppelstatus wie `Morgen erledigt / Abend offen` wird in V2.1 nicht Standard, weil die Zeile sonst auf dem Homescreen zu leicht ueberlaeuft.
- S2.3 Abschnitts-Prioritaet definiert:
  - Reihenfolge: `morning`, `noon`, `evening`, `night`.
  - User-Facing Mapping:
    - `morning` -> `Morgen`
    - `noon` -> `Mittag`
    - `evening` -> `Abend`
    - `night` -> `Nacht`
  - Bei mehreren offenen Abschnitten gewinnt der erste offene Abschnitt nur fuer Ein-Abschnitt-Copy; sonst greift die kompakte Zaehler-Copy.
- S2.4 Native Sync vs. WebView Bridge Vertrag:
  - Native Sync bleibt kanonischer Widget-Sync-Pfad.
  - WebView-Bridge darf keinen inkompatiblen alten Tagesstatus in den Snapshot schreiben, wenn das Snapshot-Modell erweitert wird.
  - S4 muss die Bridge entweder auf denselben Medication-Summary-Vertrag bringen oder bewusst nur noch einen nativen Refresh anstossen lassen.
  - Akzeptierter Zielzustand: Native Sync und WebView Bridge koennen denselben V2.1-Snapshot ohne Bedeutungsdrift erzeugen.
- S2.5 Layout-Ziel final festgelegt:
  - V2.1 hat zwei fachliche Datenzeilen:
    - `Fluessigkeit`
    - `Medikation`
  - Die bestehende 4x2-Widget-Flaeche bleibt erhalten.
  - Die durch Verdichtung frei werdende Flaeche wird in V2.1 nicht mit Fake-Status gefuellt.
  - Eine moegliche dritte optische Zone bleibt nur ruhiger Reserved-/Spacing-Vertrag fuer V2.2/V2.3.
  - Keine BP- oder Termin-Inhalte in V2.1.
- S2.6 Pflichtkorrekturen fuer S4:
  - S4 muss Wasser-Ist und Wasser-Soll zu einer Fluessigkeitszeile zusammenfuehren.
  - S4 muss Literformatierung in der Provider-/Render-Schicht umsetzen.
  - S4 muss Medication aus `slots[]` ableiten und dabei alte Snapshots defensiv behandeln.
  - S4 muss WebView Bridge und native Sync-Ableitung gegen denselben Vertrag pruefen.
  - S4 muss `strings.xml` und `widget_midas.xml` so anpassen, dass keine alten V1-Zeilen/Copies als aktive UI uebrig bleiben.

Contract Review S2:

- Der Vertrag bleibt im V2.1-Scope:
  - keine BP-Zeile
  - keine Termin-Zeile
  - keine Push-/Reminder-Schicht
  - kein Widget-Capture
  - keine SQL-/Backend-Aenderung
- Die Vision passt weiterhin:
  - Widget bleibt ein ruhiger Homescreen-Kompass.
  - Fluessigkeit wird bewusst alltagstauglich statt millilitergenau.
  - Medikation zeigt die naechste relevante Orientierung, ohne eine zweite Medication-App zu werden.
  - Die V2.2-/V2.3-Erweiterbarkeit bleibt erhalten, weil die frei werdende Zone nicht fachlich blockiert wird.
- Finding `W21-S2-F1`:
  - Urspruenglich diskutierte Doppeltexte wie `Morgen erledigt / Abend offen` waeren informativ, aber im rechten Widget-Wert zu lang.
  - Korrektur: V2.1 nutzt priorisierte kompakte Statuswerte und laesst lange Doppeltexte fuer spaetere Layout-Experimente offen.

Korrektur S2:

- `W21-S2-F1` wurde in der Finding-Tabelle aufgenommen und als `fixed` markiert.
- Der S2-Vertrag priorisiert jetzt kurze, deterministische Medication-Copy.

Schritt-Abnahme:

- S2 ist abgeschlossen.
- Naechster erlaubter Schritt ist S3.

### S3 - Bruchrisiko-, UI-/Copy- und Umsetzungsreview 2026-06-29

Deterministisch abgearbeitet:

- S3.1 Bruchrisiken identifiziert:
  - Alte Snapshots enthalten nur `medicationStatus` und keine V2.1-Medication-Summary.
  - Fehlende oder leere `slots[]` muessen defensiv behandelt werden, obwohl `med_list_v2` produktiv Slots liefern soll.
  - Native Sync und WebView Bridge leiten Medication aktuell beide nur ueber `total_count` / `taken_count` auf `NONE`, `OPEN`, `PARTIAL`, `DONE` ab.
  - Wenn die Bridge unveraendert bleibt, kann sie nach S4 einen reicheren nativen V2.1-Snapshot mit altem Tagesstatus ueberschreiben.
  - Textueberlauf ist realistisch bei langen Medication-Doppeltexten, langen Sync-Texten oder zu breiter Fluessigkeits-Copy.
  - Mehrere Medikamente im selben Abschnitt muessen aggregiert werden; Abschnittscopy darf nicht pro Medikament kippen.
  - Sortierung und Prioritaet bleiben nur stabil, wenn `morning`, `noon`, `evening`, `night` zentral genutzt werden.
- S3.2 User-Facing Copy Review:
  - `Fluessigkeit` passt zur Vision, weil Ist und Soll semantisch zusammengefasst werden.
  - `0,6 / 1,7 L` ist kurz genug und vermeidet Milliliter-Scheingenauigkeit.
  - `Alles erledigt`, `Abend offen`, `Morgen erledigt`, `2/4 erledigt`, `Kein Plan` sind ausreichend kurz fuer den rechten Wert.
  - Lange Doppeltexte bleiben ausgeschlossen.
  - Repo bleibt im bestehenden ASCII-Stil; Code-/Doku-Copy nutzt daher `Fluessigkeit` statt Umlaut-Copy, sofern die konkrete Android-String-Datei nicht bewusst anders entschieden wird.
- S3.3 Layout Review:
  - 4x2 Widget-Flaeche bleibt erhalten.
  - Zwei fachliche Zeilen sind fuer V2.1 ausreichend; die freie Flaeche darf ruhig bleiben.
  - `maxLines=1` und `ellipsize=end` muessen fuer rechte Werte erhalten bleiben.
  - Schriftgroesse `16sp` fuer Werte ist weiterhin sinnvoll; S5 muss echten Homescreen pruefen.
  - Keine Cards, Header, Branding oder dekorative UI im Widget.
- S3.4 Tooling und Checks geklaert:
  - Roadmap-/Doku-Hygiene:
    - `git diff --check`
    - ASCII-Scan
  - Android-Codechecks fuer S5:
    - aus `android/`: `.\gradlew.bat :app:compileDebugKotlin`
    - aus `android/`: `.\gradlew.bat :app:assembleDebug`
  - Optionaler Device-Pfad:
    - `adb devices`
    - Installation der Debug-APK nach User-Freigabe.
- S3.5 S4-Substeps konkretisiert:
  - S4.1 muss Snapshot-Kompatibilitaet und Medication-Summary-Modell klaeren.
  - S4.2 muss Ressourcen-Strings und Copy-Basis vorbereiten.
  - S4.3 muss Fluessigkeit in der Render-Schicht als Litervergleich umsetzen.
  - S4.4 muss Slot-Aggregation nativ umsetzen und Fallbacks sichern.
  - S4.5 muss WebView Bridge und nativen Sync vertraglich angleichen.
  - S4.6 muss Layout/Strings an den Zwei-Zeilen-Vertrag anpassen.
  - S4.7 bleibt Gesamt-Code- und Contract Review.

Contract Review S3:

- Scope bleibt sauber:
  - keine BP-Zeile
  - keine Termin-Zeile
  - keine neue Datenquelle
  - kein Capture
  - kein Reminder
  - keine SQL-/Backend-Aenderung
- Vision-Gegencheck:
  - V2.1 verbessert den Homescreen-Blick, ohne das Widget zur App zu machen.
  - Fluessigkeit wird alltagstauglicher und platzsparender.
  - Medication wird robuster fuer Mehrfachmedikation, aber bleibt bewusst ein kurzer Status.
  - Die freie Widget-Flaeche bleibt spaeter fuer V2.2/V2.3 nutzbar.
- Findings:
  - `W21-S3-F1`: Alte Snapshots und fehlende `slots[]` koennen sonst zu leerem oder falschem Medication-Text fuehren.
  - `W21-S3-F2`: WebView Bridge kann sonst V2.1-Snapshot-Semantik zurueck auf V1 reduzieren.

Korrektur S3:

- `W21-S3-F1` wurde in der Finding-Tabelle aufgenommen und als `fixed` markiert.
- `W21-S3-F2` wurde in der Finding-Tabelle aufgenommen und als `fixed` markiert.
- S4.1, S4.4, S4.5 und S4.6 wurden mit verbindlichen Pflichten fuer Kompatibilitaet, Slot-Aggregation, Bridge-Paritaet und Layout-Reserve geschaerft.

Schritt-Abnahme:

- S3 ist abgeschlossen.
- Naechster erlaubter Schritt ist der S4 Readiness Review.

### S4 Readiness Review 2026-06-29

Gate-Fragen beantwortet:

- Muss das Datenmodell vor Layout und Provider geaendert werden?
  - Ja.
  - `DailyWidgetState` / Snapshot-Modell muss zuerst einen V2.1-Medication-Summary-Vertrag tragen koennen.
  - Alte Snapshots muessen weiter lesbar bleiben.
  - Provider/Layout duerfen erst danach auf neue Felder vertrauen.
- Muss die WebView Bridge zwingend mitgezogen werden?
  - Ja.
  - Die Bridge postet aktuell denselben groben V1-Tagesstatus wie der native Sync.
  - Nach V2.1 darf ein WebView-Post keinen reicheren nativen Snapshot auf `OPEN/PARTIAL/DONE` zurueckstufen.
  - S4.5 muss Bridge-Paritaet herstellen oder alte Bridge-Writes sicher abgrenzen.
- Reicht `med_list_v2` fuer alle Medication-Texte?
  - Ja.
  - `slots[]`, `slot_type`, `is_taken`, `total_count` und `taken_count` reichen fuer den S2-Vertrag.
  - Keine SQL- oder Backend-Aenderung erforderlich.
- Muessen Ressourcen-Strings vor Provider-Formatierung angelegt werden?
  - Ja.
  - Neuer Substep `S4.2` wurde eingefuegt, damit `Fluessigkeit`, Liter-Placeholder und Medication-Copy vor Provider-/Layout-Code existieren.
- Sind S5-Checks vollstaendig fuer Kotlin, XML und APK?
  - Ja fuer lokale Umsetzung:
    - `git diff --check`
    - aus `android/`: `.\gradlew.bat :app:compileDebugKotlin`
    - aus `android/`: `.\gradlew.bat :app:assembleDebug`
  - Device-Smoke bleibt nach Debug-APK User-/ADB-abhaengig.

Gate-Entscheidung:

- S4 darf starten.
- Reihenfolge wurde angepasst:
  - S4.1 Snapshot-Modell
  - S4.2 Ressourcen-Strings und Copy-Basis
  - S4.3 Fluessigkeitsformat
  - S4.4 Medication-Slot-Auswertung
  - S4.5 WebView Bridge
  - S4.6 Widget-Layout
  - S4.7 Gesamt-Code- und Contract Review

Contract Review Gate:

- Der geaenderte S4-Schnitt bleibt in V2.1-Scope.
- Keine neuen Datenquellen, keine SQL-/Backend-Aenderung, kein Reminder, kein Capture.
- Die Reihenfolge reduziert Risiko:
  - Datenvertrag vor Render-Code.
  - Ressourcen vor Provider-/Layout-Referenzen.
  - Native Medication-Semantik vor Bridge-Paritaet.
  - Layout zuletzt.

Finding und Korrektur:

- `W21-G1`: Ressourcen-Strings waren im alten S4-Schnitt zu spaet bzw. mit Layout vermischt.
- Korrektur:
  - neuer S4.2-Substep eingefuegt.
  - alte S4.2-S4.6 zu S4.3-S4.7 verschoben.
  - Finding als `fixed` in der Finding-Tabelle dokumentiert.

Schritt-Abnahme:

- S4 Readiness Review ist abgeschlossen.
- Naechster erlaubter Schritt ist S4.1.

### S4.1 - Snapshot-Modell fuer V2.1 2026-06-29

Umsetzung:

- `DailyWidgetState.kt` erweitert:
  - `DailyWidgetState` enthaelt jetzt zusaetzlich `medicationSummary`.
  - `MedicationWidgetSummary` bildet den kuenftigen V2.1-Medication-Vertrag ab:
    - `status`
    - `takenCount`
    - `totalCount`
    - `plannedSections`
    - `openSections`
  - `MedicationSection` bildet die kanonischen Abschnitte ab:
    - `morning`
    - `noon`
    - `evening`
    - `night`
  - Legacy-Fallback bleibt ueber `MedicationWidgetSummary.legacy(medicationStatus)` erhalten.
- `WidgetSnapshotStore.kt` erweitert:
  - Alte V1-Snapshots ohne `medicationSummary` laden weiter ueber den alten `medicationStatus`.
  - Neue Snapshots speichern zusaetzlich `medicationSummary`.
  - Geladene Snapshots setzen den alten `medicationStatus` aus `medicationSummary.status`, damit bestehender Provider-Code weiter funktioniert.
  - Section-Arrays werden defensiv geparst und normalisiert.

Lokale Checks:

- Fehlgeschlagener Erstversuch:
  - `android\gradlew.bat :app:compileDebugKotlin` aus Repo-Root.
  - Ergebnis: Gradle fand im Repo-Root keinen Android-Build.
- Korrigierter Check:
  - aus `android/`: `.\gradlew.bat :app:compileDebugKotlin`
  - Ergebnis: gruen.
- `git diff --check` fuer die betroffenen Kotlin-Dateien:
  - Ergebnis: gruen.

Code Review S4.1:

- Bestehende Call-Sites bleiben kompatibel, weil `WidgetSnapshotStore.save(...)` die neue Summary als Default aus dem alten `MedicationStatus` ableitet.
- Der Provider kann unveraendert weiter `medicationStatus` verwenden, bis S4.4/S4.6 die neue Summary nutzt.
- Alte Snapshots werden nicht verworfen, solange `dayIso` weiter heute ist.
- Keine Slot-Auswertung wurde vorgezogen; S4.4 bleibt dafuer verantwortlich.

Contract Review S4.1:

- Keine UI-/Layout-Aenderung.
- Keine Medication-Copy-Aenderung.
- Keine SQL-, Backend-, Push-, Reminder- oder Capture-Aenderung.
- S4.1 erfuellt den S3-Fallback-Vertrag fuer alte Snapshots.
- S4.1 bereitet den S2-Vertrag vor, ohne ihn schon user-facing zu aktivieren.

Findings:

- `W21-S4.1-F1`: Der dokumentierte Root-Aufruf fuer Gradle ist fuer dieses Repo nicht verlaesslich; Gradle muss aus `android/` gestartet werden.

Korrektur:

- Roadmap-Kommandos fuer Android Checks wurden auf `aus android/: .\gradlew.bat ...` korrigiert.
- Finding `W21-S4.1-F1` wurde in der Finding-Tabelle aufgenommen und als `fixed` markiert.

Schritt-Abnahme:

- S4.1 ist abgeschlossen.
- Naechster erlaubter Schritt ist S4.2.

### S4.2 - Ressourcen-Strings und Copy-Basis 2026-06-29

Umsetzung:

- `android/app/src/main/res/values/strings.xml` additiv erweitert:
  - `widget_label_fluids`: `Fluessigkeit`
  - `widget_placeholder_fluids`: `-- / -- L`
  - `widget_value_fluids_liters`: `%1$s / %2$s L`
  - `widget_medication_all_done`: `Alles erledigt`
  - `widget_medication_section_done`: `%1$s erledigt`
  - `widget_medication_section_open`: `%1$s offen`
  - `widget_medication_progress_done`: `%1$d/%2$d erledigt`
  - Abschnittsnamen:
    - `Morgen`
    - `Mittag`
    - `Abend`
    - `Nacht`
- Bestehende V1-Strings wurden bewusst nicht entfernt:
  - `Wasser`
  - `Wasser-Soll`
  - `-- ml`
  - `%1$d ml`
  - alte grobe Medication-Statuswerte.

Lokale Checks:

- aus `android/`: `.\gradlew.bat :app:compileDebugKotlin`
  - Ergebnis: gruen.
- `git diff --check` fuer `strings.xml` und Roadmap:
  - Ergebnis: gruen.
- ASCII-Scan fuer `strings.xml` und Roadmap:
  - Ergebnis: gruen.

Code Review S4.2:

- Die neuen Ressourcen sind rein additiv.
- Keine aktive UI-Referenz wurde umgebogen.
- Alte Provider-/Layout-Referenzen bleiben intakt.
- Die Format-Strings passen zu S4.3/S4.4:
  - Fluessigkeit bekommt zwei bereits formatierte Literwerte.
  - Medication kann Abschnitts- und Zaehlercopy zentral ueber Ressourcen rendern.

Contract Review S4.2:

- Copy entspricht dem S2-Vertrag:
  - `Fluessigkeit`
  - `-- / -- L`
  - `Alles erledigt`
  - `<Abschnitt> erledigt`
  - `<Abschnitt> offen`
  - `<taken>/<total> erledigt`
- Keine BP-, Termin-, Push-, Reminder-, Capture-, SQL- oder Backend-Erweiterung.
- Alte V1-Strings bleiben bis S4.6 als sichere Referenzbasis erhalten.

Findings:

- Keine neuen Findings.

Korrektur:

- Nicht erforderlich.

Schritt-Abnahme:

- S4.2 ist abgeschlossen.
- Naechster erlaubter Schritt ist S4.3.

### S4.3 - Fluessigkeitsformat 2026-06-29

Umsetzung:

- `MidasWidgetProvider.kt` erweitert:
  - `widgetWaterValue` rendert bei vorhandenem Snapshot jetzt den neuen Fluessigkeitswert.
  - Format: `Ist / Soll L`.
  - Beispiel: `0,6 / 1,7 L`.
  - Fehlender Snapshot nutzt `widget_placeholder_fluids`: `-- / -- L`.
  - Manueller Sync zeigt weiter `Synchronisiere...`.
- Neue Helper:
  - `formatFluidValue(...)`
  - `formatLiter(...)`
- Intern bleiben Snapshot-Werte in Millilitern.
- Rundung:
  - eine Dezimalstelle.
  - deutsches Komma via `Locale.GERMANY`.

Bewusste Abgrenzung:

- Die alte `Wasser-Soll`-Layoutzeile wird in S4.3 noch nicht entfernt.
- Das Label `Wasser` wird in S4.3 noch nicht auf `Fluessigkeit` umgestellt, weil die TextView aktuell keine eigene ID hat.
- Diese sichtbare Layout-Zusammenfuehrung bleibt Bestandteil von S4.6.
- S4.3 aktiviert nur den neuen Wertvertrag im Provider.

Lokale Checks:

- aus `android/`: `.\gradlew.bat :app:compileDebugKotlin`
  - Ergebnis: gruen.
- `git diff --check` fuer `MidasWidgetProvider.kt` und Roadmap:
  - Ergebnis: gruen.
- ASCII-Scan fuer `MidasWidgetProvider.kt` und Roadmap:
  - Ergebnis: gruen.

Code Review S4.3:

- Kein Snapshot- oder Sync-Vertrag wurde geaendert.
- Keine Medication-Logik wurde vorgezogen.
- `formatLiter(...)` coerced negative Werte auf `0`.
- Die neue Formatierung nutzt Ressourcen-Strings aus S4.2.
- Alte `widget_value_water_ml`-Nutzung bleibt fuer die noch vorhandene `Wasser-Soll`-Zeile bis S4.6 bestehen.

Contract Review S4.3:

- S2-Litervertrag ist fuer den Haupt-Wasserwert umgesetzt.
- `-- / -- L` ist fuer fehlenden Snapshot umgesetzt.
- Keine BP-, Termin-, Push-, Reminder-, Capture-, SQL- oder Backend-Erweiterung.
- Vollstaendige visuelle Zusammenfuehrung von `Wasser` und `Wasser-Soll` ist noch nicht abgeschlossen und bleibt S4.6-Pflicht.

Findings:

- Keine neuen Code-Findings.
- Kein Roadmap-Finding erforderlich, weil die Layout-Abgrenzung bereits im S4-Schnitt vorgesehen ist.

Korrektur:

- Nicht erforderlich.

Schritt-Abnahme:

- S4.3 ist abgeschlossen.
- Naechster erlaubter Schritt ist S4.4.

### S4.4 - Medication-Slot-Auswertung nativ 2026-06-29

Umsetzung:

- `WidgetSyncRepository.kt` erweitert:
  - Der native Sync erzeugt jetzt `MedicationWidgetSummary` statt nur `MedicationStatus`.
  - Der Snapshot speichert:
    - `status`
    - `takenCount`
    - `totalCount`
    - `plannedSections`
    - `openSections`
  - `med_list_v2.slots[]` wird fuer Abschnittsinformationen ausgewertet.
  - Mehrere Medikamente pro Abschnitt werden aggregiert und dedupliziert.
  - Abschnittssortierung folgt dem MIDAS-Vertrag:
    - `morning`
    - `noon`
    - `evening`
    - `night`
- Fallback-Vertrag:
  - `total_count` und `taken_count` bleiben die Basis fuer den groben Status.
  - Wenn `slots[]` fehlt oder leer ist, bleibt der alte Tagesstatus weiterhin korrekt nutzbar.
  - `plannedSections` und `openSections` bleiben dann leer, statt eine falsche Abschnittsinformation zu erfinden.

Lokale Checks:

- aus `android/`: `.\gradlew.bat :app:compileDebugKotlin`
  - Ergebnis: gruen.
- `git diff --check` fuer `WidgetSyncRepository.kt` und Roadmap:
  - Ergebnis: gruen.
- ASCII-Scan fuer `WidgetSyncRepository.kt` und Roadmap:
  - Ergebnis: gruen.

Code Review S4.4:

- Keine UI- oder Layout-Aenderung.
- Keine WebView-Bridge-Aenderung; diese bleibt S4.5.
- Status-Logik bleibt kompatibel:
  - `NONE`, wenn keine geplanten Slots/Counts vorhanden sind.
  - `OPEN`, wenn geplant und nichts erledigt ist.
  - `PARTIAL`, wenn ein Teil erledigt ist.
  - `DONE`, wenn alle geplanten Counts erledigt sind.
- Slot-Abschnitte werden nur aus gueltigen `slot_type`-Werten uebernommen.
- Ungueltige oder fehlende Slot-Objekte werden ignoriert.

Contract Review S4.4:

- S2/S3-Vertrag ist erfuellt:
  - `med_list_v2.slots[]` wird nativ genutzt.
  - mehrere Medikamente pro Abschnitt werden aggregiert.
  - Fallback auf alten Tagesstatus bleibt erhalten.
- Keine SQL-, Backend-, Push-, Reminder-, Capture-, BP- oder Termin-Aenderung.
- Medication-Summary ist jetzt im nativen Sync vorhanden, wird aber erst in S4.6 user-facing gerendert.
- Bridge-Paritaet ist noch offen und bleibt S4.5-Pflicht.

Findings:

- Keine neuen Findings.

Korrektur:

- Nicht erforderlich.

Schritt-Abnahme:

- S4.4 ist abgeschlossen.
- Naechster erlaubter Schritt ist S4.5.

### S4.5 - WebView-Bridge-Snapshot 2026-06-29

Umsetzung:

- `WidgetSyncBridge.kt` erweitert:
  - Neue Bridge-Methode `postWidgetStateV2(...)` ergaenzt.
  - V2-Methode nimmt entgegen:
    - `dayIso`
    - `waterCurrentMl`
    - `medicationStatus`
    - `takenCount`
    - `totalCount`
    - `plannedSections`
    - `openSections`
    - `updatedAt`
  - `plannedSections` und `openSections` werden als kommagetrennte Wire-Werte geparst.
  - Der Snapshot wird mit `MedicationWidgetSummary` gespeichert.
- Alte Bridge-Methode `postWidgetState(...)` bleibt kompatibel:
  - Sie kann weiterhin alte Calls annehmen.
  - Wenn bereits V2.1-Summary-Details fuer heute vorhanden sind, werden diese nicht durch alten Tagesstatus downgraded.
  - Ohne bestehende V2.1-Details faellt sie auf Legacy-Summary zurueck.
- `MidasWebActivity.kt` / `WIDGET_SYNC_SCRIPT` erweitert:
  - `deriveMedicationSummary(...)` ersetzt den alten JS-Statuspfad.
  - JS sammelt `plannedSections` und `openSections` aus `medicationPayload.medications[].slots[]`.
  - Abschnittsreihenfolge:
    - `morning`
    - `noon`
    - `evening`
    - `night`
  - Primaerer Post nutzt `postWidgetStateV2(...)`.
  - Fallback auf `postWidgetState(...)` bleibt fuer Kompatibilitaet vorhanden.

Lokale Checks:

- aus `android/`: `.\gradlew.bat :app:compileDebugKotlin`
  - Ergebnis: gruen.
- `git diff --check` fuer `WidgetSyncBridge.kt`, `MidasWebActivity.kt` und Roadmap:
  - Ergebnis: gruen.
- ASCII-Scan fuer `WidgetSyncBridge.kt`, `MidasWebActivity.kt` und Roadmap:
  - Ergebnis: gruen.
- Scan:
  - alter JS-Helper `deriveMedicationStatus` ist nicht mehr vorhanden.
  - `postWidgetStateV2` ist im JS- und Bridge-Code vorhanden.

Code Review S4.5:

- Native Sync und WebView Bridge sprechen jetzt denselben V2.1-Summary-Vertrag.
- Alte Bridge-Calls koennen vorhandene V2.1-Details nicht mehr blind auf Legacy-Status reduzieren.
- Ungueltige Abschnittswerte werden beim nativen Parsen ignoriert.
- Kein UI-/Layout-Code wurde geaendert.
- Keine Medication-Copy wurde user-facing gerendert; das bleibt S4.6.

Contract Review S4.5:

- S3-Finding `W21-S3-F2` ist umgesetzt:
  - Bridge-Drift wird verhindert.
  - Der WebView-Pfad kann denselben V2.1-Snapshot erzeugen wie der native Sync.
- Keine BP-, Termin-, Push-, Reminder-, Capture-, SQL- oder Backend-Aenderung.
- MIDAS bleibt Source of Truth; die Bridge spiegelt nur den aktuellen Snapshot in den lokalen Android-Cache.

Findings:

- Keine neuen Findings.

Korrektur:

- Nicht erforderlich.

Schritt-Abnahme:

- S4.5 ist abgeschlossen.
- Naechster erlaubter Schritt ist S4.6.

### S4.6 - Widget-Layout und sichtbare Summary 2026-06-29

Umsetzung:

- `widget_midas.xml` angepasst:
  - erste Zeile nutzt jetzt `widget_label_fluids`.
  - aktive `Wasser-Soll`-Zeile wurde entfernt.
  - Widget zeigt damit in V2.1 zwei fachliche Datenzeilen:
    - `Fluessigkeit`
    - `Medikation`
  - Abstand zwischen den zwei Zeilen wurde leicht auf `10dp` gesetzt.
  - 4x2-Widget-Flaeche bleibt erhalten; freie Flaeche bleibt ruhig und ohne neue Fachinformation.
- `MidasWidgetProvider.kt` angepasst:
  - keine Referenz mehr auf `widgetWaterTargetValue`.
  - Medication-Zeile rendert jetzt `MedicationWidgetSummary`.
  - Copy-Vertrag:
    - kein Plan -> `Kein Plan`
    - ein erledigter Abschnitt -> `<Abschnitt> erledigt`
    - mehrere erledigte Abschnitte -> `Alles erledigt`
    - genau ein offener Abschnitt -> `<Abschnitt> offen`
    - mehrere offene/gemischte Abschnitte -> `<taken>/<total> erledigt`
  - Wenn keine Abschnittsinformation vorhanden ist, bleibt der alte Tagesstatus-Fallback erhalten.

Lokale Checks:

- aus `android/`: `.\gradlew.bat :app:compileDebugKotlin`
  - Ergebnis: gruen.
- `git diff --check` fuer `MidasWidgetProvider.kt`, `widget_midas.xml` und Roadmap:
  - Ergebnis: gruen.
- ASCII-Scan fuer `MidasWidgetProvider.kt`, `widget_midas.xml` und Roadmap:
  - Ergebnis: gruen.
- Referenzscan:
  - `widgetWaterTargetValue` wird nicht mehr referenziert.
  - alte Wasser-/Wasser-Soll-Strings sind nur noch als ungenutzte Ressourcen vorhanden und koennen spaeter bereinigt werden.

Code Review S4.6:

- Layout hat keine dritte fachliche Zeile eingefuehrt.
- `maxLines=1` und `ellipsize=end` bleiben fuer rechte Werte erhalten.
- Medication-Fallback verhindert falsche Abschnittstexte, wenn alte Snapshots oder fehlende `slots[]` vorliegen.
- Medication-Farbe bleibt statusbasiert und unveraendert:
  - offen -> offen-Farbe
  - erledigt -> erledigt-Farbe
  - teilweise/kein Plan -> neutral.
- Alte Wasser-Soll-Ressourcen wurden nicht entfernt, um Ressourcen-Bereinigung nicht mit dem Layout-Substep zu vermischen.

Contract Review S4.6:

- V2.1-UI-Vertrag ist umgesetzt:
  - `Fluessigkeit` als verdichtete Zeile.
  - `Ist / Soll L` als sichtbarer Wert.
  - `Medikation` als kompakter Summary-Status.
  - keine BP-Zeile.
  - keine Termin-Zeile.
  - kein Capture.
  - kein Reminder.
- Die frei gewordene Flaeche bleibt fuer V2.2/V2.3 offen.
- Keine SQL-, Backend-, Push- oder Auth-Aenderung.

Findings:

- Keine neuen Findings.

Korrektur:

- Nicht erforderlich.

Schritt-Abnahme:

- S4.6 ist abgeschlossen.
- Naechster erlaubter Schritt ist S4.7.

### S4.7 - Gesamt-Code- und Contract Review 2026-06-29

Review-Umfang:

- `DailyWidgetState.kt`
- `WidgetSnapshotStore.kt`
- `WidgetSyncRepository.kt`
- `WidgetSyncBridge.kt`
- `MidasWebActivity.kt`
- `MidasWidgetProvider.kt`
- `widget_midas.xml`
- `strings.xml`

Gesamt-Code-Review:

- Snapshot-Modell:
  - V2.1-Summary ist vorhanden.
  - Alte Snapshots ohne `medicationSummary` bleiben lesbar.
  - Alter `medicationStatus` bleibt als Fallback erhalten.
- Native Sync:
  - `med_list_v2.slots[]` wird fuer Abschnittsinformationen ausgewertet.
  - `total_count` / `taken_count` bleiben Status-Fallback.
  - mehrere Medikamente pro Abschnitt werden aggregiert.
- WebView Bridge:
  - `postWidgetStateV2(...)` schreibt denselben Summary-Vertrag.
  - alte Bridge-Methode bleibt kompatibel und verhindert Downgrade vorhandener V2.1-Details.
  - alter JS-Helper `deriveMedicationStatus` ist entfernt.
- Provider:
  - Fluessigkeit rendert `Ist / Soll L`.
  - Medication rendert kompakte Summary-Copy.
  - Fallback auf groben Tagesstatus bleibt vorhanden.
- Layout:
  - aktive `Wasser-Soll`-Zeile ist entfernt.
  - Widget hat zwei fachliche Zeilen.
  - rechte Werte behalten `maxLines=1` und `ellipsize=end`.

Contract Review S4.7:

- S2-Zielvertrag ist umgesetzt:
  - `Fluessigkeit`
  - `-- / -- L`
  - `Ist / Soll L`
  - `Kein Plan`
  - `<Abschnitt> erledigt`
  - `<Abschnitt> offen`
  - `Alles erledigt`
  - `<taken>/<total> erledigt`
- S3-Risiken sind adressiert:
  - alte Snapshots
  - fehlende `slots[]`
  - Bridge-Drift
  - Textueberlauf durch kurze Copy
  - mehrere Medikamente pro Abschnitt
  - stabile Abschnittsreihenfolge
- Guardrails eingehalten:
  - keine BP-Zeile
  - keine Termin-Zeile
  - kein Capture
  - kein Reminder
  - keine Push-/FCM-/AlarmManager-Schicht
  - keine SQL-/Backend-Aenderung
  - Android bleibt lokaler Snapshot-Node.

Findings:

- `W21-S4.7-F1`: Nach dem Layoutumbau waren alte Widget-Strings fuer `Wasser`, `Wasser-Soll`, `-- ml` und `%1$d ml` nicht mehr aktiv referenziert.

Korrektur:

- Alte unreferenzierte Wasser-/Milliliter-Strings wurden aus `strings.xml` entfernt.
- Finding `W21-S4.7-F1` wurde in der Finding-Tabelle aufgenommen und als `fixed` markiert.

Lokale Checks:

- aus `android/`: `.\gradlew.bat :app:compileDebugKotlin`
  - Ergebnis: gruen.
- `git diff --check` ueber Android-Widget-Code, WebView Bridge, Layout, Strings und Roadmap:
  - Ergebnis: gruen.
- ASCII-Scan ueber alle betroffenen Dateien:
  - Ergebnis: gruen.
- Referenzscan:
  - keine aktiven alten Wasser-/Wasser-Soll-/Milliliter-Widget-Strings.
  - `widgetWaterTargetValue` nicht mehr referenziert.
  - kein alter JS-Bridge-Helper `deriveMedicationStatus`.
  - keine BP-/Termin-/Reminder-/FCM-/AlarmManager-Ausweitung im Widget-Code.

Schritt-Abnahme:

- S4.7 ist abgeschlossen.
- S4 ist abgeschlossen.
- Naechster erlaubter Schritt ist S5.

### S5 - Tests, Code Review und Contract Review 2026-06-29

Deterministisch abgearbeitet:

- S5.1 `git diff --check`:
  - Ergebnis: gruen.
- S5.2 aus `android/`: `.\gradlew.bat :app:compileDebugKotlin`:
  - Ergebnis: gruen.
- S5.3 aus `android/`: `.\gradlew.bat :app:assembleDebug`:
  - Ergebnis: gruen.
- S5.4 APK-Pfad dokumentiert:
  - `android/app/build/outputs/apk/debug/app-debug.apk`
  - absolute Datei:
    - `C:\Users\steph\Projekte\M.I.D.A.S\android\app\build\outputs\apk\debug\app-debug.apk`
  - Groesse:
    - `40714006` Bytes.
  - Zeitstempel:
    - `2026-06-29 22:19:52`.
- S5.5 `adb devices`:
  - ADB-Daemon wurde gestartet.
  - Danach waren keine Geraete verbunden.
  - Keine Installation ausgefuehrt.
- S5.6 Device-Smoke definiert:
  - Widget zeigt `Fluessigkeit`.
  - Fluessigkeit zeigt `Ist / Soll L`.
  - Fehlender Snapshot zeigt `-- / -- L`.
  - Medication zeigt bei 1x taeglich einen Abschnittsstatus oder Fallback.
  - Medication zeigt bei mehreren Tagesabschnitten Summary-Copy wie `Abend offen`, `Alles erledigt` oder `2/4 erledigt`.
  - Widget-Tap triggert weiterhin manuellen Sync.
  - Widget bleibt read-only.
- S5.7 User-Facing Copy Review:
  - Copy ist kurz genug fuer Homescreen-Review:
    - `Fluessigkeit`
    - `0,6 / 1,7 L`
    - `Kein Plan`
    - `Alles erledigt`
    - `<Abschnitt> offen`
    - `<taken>/<total> erledigt`
  - Echte Homescreen-Wirkung bleibt User-/Device-Smoke.
- S5.8 Code Review gegen Bruchrisiken:
  - alte Snapshots bleiben kompatibel.
  - fehlende `slots[]` fallen auf alten Tagesstatus zurueck.
  - Bridge-Drift ist durch `postWidgetStateV2(...)` geschlossen.
  - alte Bridge-Methode downgraded vorhandene V2.1-Details nicht.
  - aktive Wasser-Soll-Zeile und alte Wasser-/Milliliter-Strings sind entfernt.
- S5.9 Contract Review gegen Guardrails:
  - keine BP-Zeile.
  - keine Termin-Zeile.
  - kein Widget-Capture.
  - kein Medication-Confirm im Widget.
  - keine Push-/Reminder-/FCM-/AlarmManager-Schicht.
  - keine SQL-/Backend-Aenderung.
- S5.10 Schritt-Abnahme:
  - Lokale Checks sind gruen.
  - Debug-APK ist verfuegbar.
  - Device-Smoke ist dokumentiert und wartet auf User-Test.

Findings:

- Keine neuen Code-Findings.
- Kein Device-Smoke-Finding, weil kein ADB-Geraet verbunden war.

Korrektur:

- Nicht erforderlich.

Schritt-Abnahme:

- S5 ist abgeschlossen.
- Naechster erlaubter Schritt ist S6.

### S5 Nachpruefung - CodeRabbit Findings 2026-06-29

Eingegangene Findings:

- `W21-CR-S5-F1`: WebView-Wasserwert wurde nicht explizit wie der native Pfad auf `>= 0` normalisiert.
- `W21-CR-S5-F2`: `MedicationWidgetSummary.normalized()` liess `takenCount > totalCount` zu.
- `W21-CR-S5-F3`: Legacy-Bridge-Update konnte bei vorhandener alter V2.1-Summary einen neuen V1-Status ignorieren.
- `W21-CR-S5-F4`: Abschnittscopy `Morgen offen` / `Morgen erledigt` war sprachlich holprig.

Bewertung:

- `W21-CR-S5-F1`:
  - korrekt als Parity-/Hygiene-Finding.
  - Anzeige war durch Store-/Render-Klemmung bereits weitgehend geschuetzt, aber Web-Pfad und nativer Pfad sollten denselben Vertrag sprechen.
- `W21-CR-S5-F2`:
  - korrekt als Robustheitsfinding.
  - Unmoegliche Counts sollen nicht persistiert werden.
- `W21-CR-S5-F3`:
  - korrekt als Bridge-Finding.
  - Downgrade-Schutz darf neue Legacy-Statuswerte nicht unterdruecken.
- `W21-CR-S5-F4`:
  - korrekt als Copy-Polish.
  - Abschnittsform ist im Widget lesbarer.

Korrektur:

- `MidasWebActivity.kt`:
  - `waterMl` wird im JS-Pfad nun aus `rawWaterMl` gebildet.
  - Nicht-endliche Werte werden zu `0`.
  - Negative Werte werden zu `0`.
- `DailyWidgetState.kt`:
  - `MedicationWidgetSummary.normalized()` klemmt `takenCount` auf `0..totalCount`.
- `WidgetSyncBridge.kt`:
  - Legacy-Bridge-Methode beachtet jetzt, ob ein eingehender Status vorhanden ist.
  - Bestehende V2.1-Summary bleibt nur erhalten, wenn kein eingehender Status vorhanden ist oder der Status identisch bleibt.
- `strings.xml`:
  - Abschnittsnamen:
    - `Morgens`
    - `Mittags`
    - `Abends`
    - `Nachts`

Nachpruefung:

- `git diff --check` fuer die korrigierten Dateien:
  - Ergebnis: gruen.
- ASCII-Scan fuer die korrigierten Dateien:
  - Ergebnis: gruen.
- aus `android/`: `.\gradlew.bat :app:compileDebugKotlin`
  - Ergebnis: gruen.
  - Hinweis: Ein vorheriger `assembleDebug`-Lauf meldete einen Kotlin-Incremental-Cache-Fallback, endete aber erfolgreich. Der anschliessende erneute `compileDebugKotlin`-Lauf war sauber gruen.
- aus `android/`: `.\gradlew.bat :app:assembleDebug`
  - Ergebnis: gruen.
- Debug-APK neu gebaut:
  - `C:\Users\steph\Projekte\M.I.D.A.S\android\app\build\outputs\apk\debug\app-debug.apk`
  - Groesse: `40714006` Bytes.
  - Zeitstempel: `2026-06-29 22:39:24`.
- Referenzscan:
  - `rawWaterMl` und geklemmter `waterMl` im WebView-Pfad vorhanden.
  - `takenCount.coerceIn(0, safeTotal)` vorhanden.
  - Legacy-Bridge-Statuslogik mit `hasIncomingStatus` vorhanden.
  - Abschnitts-Copy steht auf `Morgens`, `Mittags`, `Abends`, `Nachts`.

Schritt-Abnahme Nachpruefung:

- CodeRabbit-Findings sind korrigiert.
- S5 bleibt abgeschlossen.
- Naechster erlaubter Schritt bleibt S6.

### S6 - Doku-Sync, QA-Update und finaler Abschlussreview 2026-06-29

Deterministisch abgearbeitet:

- S6.1 `android/docs/Widget Contract.md` aktualisiert:
  - `DailyWidgetState` dokumentiert `medicationSummary`.
  - V2.1-Fluessigkeitsanzeige `Ist / Soll L` dokumentiert.
  - Medication-Summary, Abschnittsvertrag, Fallbacks und Nicht-Ziele dokumentiert.
- S6.2 `docs/modules/Android Widget Module Overview.md` aktualisiert:
  - Status auf `V2.1`.
  - Datenmodell, Refresh, Rendervertrag, UI-Inhalt und QA-Checkliste synchronisiert.
- S6.3 `docs/QA_CHECKS.md` aktualisiert:
  - Android-Widget-Smoke erwartet jetzt `Fluessigkeit` und `Medikation`.
  - Literformat, fehlender Snapshot, fehlende separate `Wasser-Soll`-Zeile und Medication-Summary sind pruefbar.
- S6.4 Roadmap aktualisiert:
  - Handoff, Statusmatrix, Finding-Status und dieses Ergebnisprotokoll wurden angepasst.
- S6.5 Finaler Contract Review durchgefuehrt:
  - Roadmap vs. Code:
    - Code enthaelt `medicationSummary`, `postWidgetStateV2`, Literformat, entfernte Wasser-Soll-Zeile und CodeRabbit-Korrekturen.
  - Roadmap vs. Widget Contract:
    - V2.1-Snapshot, Fluessigkeit, Medication-Summary und Nicht-Ziele stimmen ueberein.
  - Roadmap vs. Android Overview:
    - Overview beschreibt V2.1 als passiven Android-Node ohne neue Fachbereiche.
  - Roadmap vs. QA:
    - QA erwartet die installierbare Debug-APK und denselben V2.1-Anzeigevertrag.

Findings:

- `W21-S6-F1`: Device-Smoke war nach S5 offen, wurde am `2026-06-29` aber erfolgreich per User-Test abgeschlossen.

Korrektur / Entscheidung:

- Keine weitere Code- oder Doku-Korrektur aus dem Smoke noetig.
- Roadmap wird auf `(DONE)` gesetzt und nach `docs/archive/` verschoben.

Commit-Empfehlung:

- `Polish Android widget fluids and medication summary`

Schritt-Abnahme:

- S6 ist abgeschlossen.
- V2.1 ist abgeschlossen.
- Naechster fachlicher Schritt ist V2.2.
