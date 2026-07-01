# Android Widget Module - Functional Overview

Kurze Einordnung:
- Zweck: native Android-Surface fuer einen passiven MIDAS-Daily-Snapshot auf dem Homescreen.
- Rolle innerhalb von MIDAS: read-only Node fuer schnelle Tagesorientierung ohne geoeffnete PWA.
- Abgrenzung: kein Hauptsystem, keine zweite App, kein Capture-Frontend, keine Reminder-Flaeche.

Status-Hinweis:
- `V2.2` ist als ruhiges Homescreen-Widget plus minimale native Shell umgesetzt.
- MIDAS bleibt Source of Truth.
- Der Android-Pfad spiegelt Daten ueber einen lokalen Snapshot-/Sync-Vertrag.
- Browser/PWA bleibt der Reminder-Push-Master.
- Android-WebView/Shell und Widget sind kein verlaesslicher Reminder-Push-Kanal.
- Der kurze Widget-Tap ist jetzt der primaere manuelle Sync-Pfad; der harte MIDAS-Einstieg bleibt ueber den Launcher.
- Der Android-Pfad besitzt jetzt einen eigenen nativen Google-/Supabase-OAuth-Entry:
  - der bestehende Browser-/PWA-Login bleibt unveraendert
  - Android-Login laeuft ueber sicheren Browser-Kontext + Deep Link
  - die `WebView` ist MIDAS-Surface, nicht Login-Surface
  - die Detailtiefe dazu liegt bewusst in `Android Native Auth Module Overview`

Related docs:
- [Hub Module Overview](Hub Module Overview.md)
- [Hydration Target Module Overview](Hydration Target Module Overview.md)
- [Intake Module Overview](Intake Module Overview.md)
- [Medication Module Overview](Medication Module Overview.md)
- [Android Native Auth Module Overview](Android Native Auth Module Overview.md)

---

## 1. Zielsetzung

- Auf dem Android-Homescreen soll ein kompakter MIDAS-Snapshot sichtbar sein, ohne dass die PWA jedes Mal manuell geoeffnet werden muss.
- Das Widget reduziert Reibung fuer den Blick auf:
  - `Fluessigkeit` als `Ist / Soll L`
  - `Medikation` als kompakte Tages-/Abschnitts-Summary
  - `Blutdruck` als passiven Tageskontext
- Erinnerungen und Push-Health bleiben Aufgabe der Browser-/PWA-Schicht und des Touchlogs.
- Die native Huelle bleibt bewusst klein:
  - Widget Host
  - minimaler MIDAS-Launcher
  - kein fachlich eigenstaendiges System

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
| --- | --- |
| `android/app/src/main/java/de/schabuss/midas/MainActivity.kt` | minimaler nativer Launcher-Einstieg + nativer OAuth-Callback |
| `android/app/src/main/java/de/schabuss/midas/web/MidasWebActivity.kt` | native WebView-Sitzung fuer MIDAS, Android-gateter MIDAS-Surface mit Session-Import/-Export |
| `android/app/src/main/java/de/schabuss/midas/auth/AndroidAuthContract.kt` | Deep-Link-/Entry-Vertrag fuer nativen OAuth |
| `android/app/src/main/java/de/schabuss/midas/auth/NativeOAuthStarter.kt` | Start des nativen Google-Logins ueber sicheren Browser-Kontext |
| `android/app/src/main/java/de/schabuss/midas/auth/NativeAuthStore.kt` | finaler nativer Session-Source-of-Truth |
| `android/app/src/main/java/de/schabuss/midas/auth/NativeAuthConfigStore.kt` | abgesicherter Bootstrap-Store fuer REST-/ANON-Konfiguration |
| `android/app/src/main/java/de/schabuss/midas/auth/NativeSessionController.kt` | gemeinsamer Clear-Pfad fuer Android, Widget und WebView |
| `android/app/src/main/java/de/schabuss/midas/widget/MidasWidgetProvider.kt` | AppWidget-Render, manueller Sync-Tap und sichtbarer Sync-Zustand |
| `android/app/src/main/java/de/schabuss/midas/widget/DailyWidgetState.kt` | kompakter lokaler Widget-Vertrag |
| `android/app/src/main/java/de/schabuss/midas/widget/WidgetSnapshotStore.kt` | lokaler Snapshot-Cache |
| `android/app/src/main/java/de/schabuss/midas/widget/WidgetAuthStore.kt` | Kompatibilitaetsadapter zum nativen Session-Store |
| `android/app/src/main/java/de/schabuss/midas/widget/WidgetSyncBridge.kt` | JS-Bridge von MIDAS nach Android |
| `android/app/src/main/java/de/schabuss/midas/widget/WidgetSyncRepository.kt` | nativer Read-/Refresh-Pfad gegen bestehende MIDAS-/Supabase-Reads |
| `android/app/src/main/java/de/schabuss/midas/widget/WidgetSyncWorker.kt` | periodischer Android-Refresh via `WorkManager` |
| `android/app/src/main/java/de/schabuss/midas/widget/WidgetSyncScheduler.kt` | Scheduling des nativen Sync-Pfads |
| `android/app/src/main/java/de/schabuss/midas/widget/WidgetRefreshCoordinator.kt` | zentraler Catch-up-/Manual-Sync-Koordinator fuer App-Start, Widget-Tap und Unlock |
| `android/app/src/main/java/de/schabuss/midas/widget/WidgetWakeRefresh.kt` | `USER_PRESENT`-/Unlock-Best-Effort fuer Catch-up-Sync im lebenden Android-Prozess |
| `android/app/src/main/java/de/schabuss/midas/widget/WidgetRealtimeSync.kt` | nativer Realtime-Listener fuer nahezu sofortige Widget-Refreshes bei relevanten Datenwrites |
| `android/app/src/main/java/de/schabuss/midas/widget/HydrationTargetCalculator.kt` | lokale `Wasser-Soll`-Berechnung aus derselben Stuetzpunkt-Tabelle wie MIDAS |
| `android/app/src/main/res/layout/widget_midas.xml` | aktuelles Widget-Layout |
| `android/app/src/main/res/xml/midas_widget_info.xml` | Android-Widget-Metadaten, Zellgroesse und Resize-Vertrag |
| `android/docs/Widget Contract.md` | technische Arbeitsnotiz fuer den nativen Android-Bereich |

---

## 3. Datenmodell / Storage

### 3.1 `DailyWidgetState`

- `dayIso`
- `waterCurrentMl`
- `waterTargetNowMl`
- `medicationStatus`
- `medicationSummary`
- `bloodPressureStatus`
- `updatedAt`

`medicationStatus` bleibt der Legacy-/Fallback-Tagesstatus.

`medicationSummary` ist der V2.1-Vertrag fuer:

- `status`
- `takenCount`
- `totalCount`
- `plannedSections`
- `openSections`

Abschnitte folgen dem MIDAS-/Medication-Vertrag:

- `morning`
- `noon`
- `evening`
- `night`

`bloodPressureStatus` ist der V2.2-Vertrag fuer:

- `none`
- `evening_open`

Ableitung:

- heutige Morgenmessung vorhanden und heutige Abendmessung fehlt -> `evening_open`
- alle anderen heutigen BP-Konstellationen -> `none`
- fehlende oder unbekannte Snapshot-Werte -> `none`

Der BP-Status nutzt nur `health_events.type = bp` und den Kontext `ctx`. BP-Rohwerte, Schwellen, Kommentare und Trendpilot-Events sind nicht Teil des Widget-Snapshots.

### 3.2 Lokale Stores

- `WidgetSnapshotStore`
  - haelt den letzten gueltigen Snapshot fuer den heutigen Tag
- `NativeAuthStore`
  - haelt den finalen nativen Session-Zustand abgesichert
  - inklusive `sessionGeneration` als Guard gegen spaete Worker-Writes nach Logout
- `NativeAuthConfigStore`
  - haelt abgesichert den Android-Bootstrap fuer:
    - REST-URL
    - Supabase-URL
    - ANON-Key
- `WidgetAuthStore`
  - ist nur noch Kompatibilitaetsadapter fuer bestehenden Widget-/Sync-Code
  - fuehrt keinen eigenstaendigen finalen Auth-Vertrag mehr

### 3.3 Source of Truth

- Fachlich bleibt MIDAS / Supabase Source of Truth.
- Android speichert nur:
  - letzten lokalen Snapshot
  - technischen Auth-/Sync-Kontext
- Fuer den Android-Node gilt zusaetzlich:
  - `NativeAuthStore` ist der Auth-Source-of-Truth
  - `WidgetAuthStore` ist kein konkurrierender Session-Owner mehr

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung

- `MainActivity` ist der minimale native Einstieg.
- `WidgetSyncScheduler` stellt sicher, dass der periodische Sync registriert ist.
- Das Widget selbst rendert nie direkt gegen MIDAS-UI-State, sondern nur gegen den lokalen Snapshot.

### 4.2 Erste Inbetriebnahme

- Fuer eine frische Android-Installation wird einmal Android-Bootstrap-Konfiguration hinterlegt:
  - REST-Endpoint
  - ANON-Key
- Der erste echte Google-Login startet dann nativ:
  - `Custom Tabs` primaer
  - externer Browser als Fallback
  - Deep-Link-Callback zur App zurueck
- Die native Session wird lokal gespeichert und ist danach Owner fuer:
  - Widget-Aktivierung
  - Widget-Sync
  - Android-Shell-Auth-Zustand
- Die `WebView` importiert diese native Session spaeter Android-gatet in den MIDAS-Boot hinein.

### 4.3 Laufender Refresh

- `WidgetRealtimeSync` haelt im laufenden Android-Prozess einen nativen Supabase-Realtime-Listener offen.
- Relevante Writes auf:
  - `health_events`
  - `health_medications`
  - `health_medication_schedule_slots`
  - `health_medication_slot_events`
  triggern einen debouncten nativen Re-Sync.
- Zusaetzlich darf die Android-WebView bei erfolgreichem Intake-Save den nativen Widget-Sync direkt anstossen.
  - Das ist der pragmatische Sofortpfad fuer `save -> Widget`
  - und reduziert die Abhaengigkeit von Realtime-/Lifecycle-Timing innerhalb der offenen Android-Sitzung
- Zusaetzlich stoesst `MainActivity` bei vorhandenem nativen Login direkt beim Android-App-Start einen Widget-Catch-up-Sync an.
  - Dadurch wird ein veraltetes Widget beim bewussten Android-Einstieg moeglichst frueh nachgezogen
  - auch wenn davor nur die PWA genutzt wurde
- Solange der Android-Prozess lebt, wird zusaetzlich bei `USER_PRESENT` / Unlock ein gedrosselter Catch-up-Sync versucht.
  - Das ist bewusst best effort
  - und kein vollwertiger Hintergrund-Push-Ersatz
- Dadurch koennen Aenderungen aus:
  - Android-MIDAS
  - Browser-/PWA-MIDAS
  nahezu sofort im Widget sichtbar werden, solange der Android-Prozess lebt.
- `WorkManager` bleibt als periodischer Sicherheitsgurt und Fallback aktiv.
- `WidgetSyncRepository` liest:
  - Intake-Tagesdaten ueber denselben Vertrag wie MIDAS
  - Medication-Tagesstatus ueber `med_list_v2`
  - Medication-Slots ueber `med_list_v2.slots[]`
  - Blutdruck-Tageskontext aus `health_events` mit `type = bp`
- `Wasser-Soll` wird lokal auf Android berechnet.
- Der neue Snapshot wird lokal gespeichert und das Widget aktualisiert.
- Laufende Worker pruefen vor spaeten Auth-/Snapshot-Writes die aktuelle `sessionGeneration`.
  - Damit duerfen Ergebnisse nach Logout oder Session-Wechsel nicht mehr als gueltig committen.

### 4.4 Widget-Render

- `MidasWidgetProvider` liest den letzten gueltigen lokalen Snapshot.
- Das Widget zeigt:
  - `Fluessigkeit`
  - `Medikation`
  - `Blutdruck`
- `Fluessigkeit` fasst Wasser-Ist und Wasser-Soll als Litervergleich zusammen:
  - Beispiel: `0,6 / 1,7 L`
  - Platzhalter: `-- / -- L`
- `Medikation` rendert eine kompakte Summary:
  - `Kein Plan`
  - `Morgens erledigt`
  - `Abends offen`
  - `Alles erledigt`
  - `2/4 erledigt`
- `Blutdruck` rendert einen passiven Tageskontext:
  - fehlender Snapshot: `Lade...`
  - Morgenmessung vorhanden und Abendmessung fehlt: `BD Abend offen`
  - alle anderen vorhandenen Snapshot-Faelle: `Alles ruhig`
- Ein kurzer Tap auf das Widget startet einen manuellen nativen Sync.
- Waehrend dieses manuellen Syncs zeigt das Widget sichtbar `Synchronisiere...`.
- Der explizite harte MIDAS-Einstieg bleibt ueber den Launcher erhalten.

### 4.5 Logout / Session-Clear

- `NativeSessionController` loescht deterministisch:
  - native Session
  - Widget-Kompatibilitaetsstore
  - Widget-Snapshot
  - nativen Client-Cache
- Der Widget-Scheduler wird gestoppt.
- Das Widget wird direkt auf Platzhalter zurueckgesetzt.
- Eine offene `WebView` wird aktiv zu lokalem Signout + Reload angestossen.

---

## 5. UI-Integration

### 5.1 V2.2-Inhalt

- `Fluessigkeit`
  - intern weiter `waterCurrentMl` und `waterTargetNowMl`
  - Anzeige als `Ist / Soll L`
- `Medikation`
  - Legacy-Fallback ueber `medicationStatus`
  - bevorzugt ueber `medicationSummary`
- `Blutdruck`
  - passiver Kontext ueber `bloodPressureStatus`
  - `BD Abend offen`, wenn heute Morgen vorhanden und Abend fehlt
  - `Alles ruhig`, wenn im vorhandenen Snapshot kein offener V2.2-BP-Kontext besteht

### 5.2 Nicht Teil von `V2.2`

- `Salz`
- `Protein`
- `Appointments`
- Blutdruck-Rohwerte
- BP-Schwellen, BP-Bewertung oder Trendpilot-Hinweise
- BP-Eingabe oder BP-Bestaetigung im Widget
- Capture-Buttons
- Reminder-/Push-Interaktion
- Push-Aktivierung oder Push-Health-Anzeige im Widget
- Trend-/Analyseflaechen

### 5.3 Visueller Stand

- Der Widget-Look wurde von einem dunklen Block schrittweise auf einen ruhigen textnahen Homescreen-Teststand reduziert.
- Header/Branding wurden bewusst entfernt.
- Der aktuelle V2.2-Stand priorisiert:
  - Zurueckhaltung
  - Homescreen-Kompatibilitaet
  - systemnahe Typografie

---

## 6. Launcher- / WebView-Rolle

- Die native Huelle ist kein Android-Ersatz fuer MIDAS.
- `MainActivity` bleibt minimal.
- `MidasWebActivity` ist nur:
  - MIDAS-Entry
  - Android-gateter MIDAS-Surface
  - Bridge fuer Session-Import und Snapshot-/Status-Export
  - Rueckweg in das Hauptsystem

Konsequenz:
- Die Android-Huelle bleibt ein Node.
- Komplexe Interaktion bleibt in MIDAS.
- Die `WebView` ist MIDAS-Surface und nicht mehr Login-Source of Truth.
- Die `WebView` ist auch kein Reminder-Push-Master.
- Falls MIDAS in Android-WebView laeuft, soll der Touchlog Chrome/PWA fuer verlaessliche Erinnerungen empfehlen.
- Der gemeinsame Google-Login-Button bleibt im Browser/PWA der Web-Login.
- Im Android-WebView wird derselbe Button gezielt auf nativen Login umgelenkt und startet keinen eingebetteten Google-OAuth mehr.
- Der Auth-, Deep-Link- und Session-Handoff-Vertrag ist getrennt dokumentiert, damit dieses Dokument Widget-zentriert bleibt.

---

## 7. Fehler- & Diagnoseverhalten

- Ohne gueltigen Snapshot bleiben Platzhalter sichtbar.
- Ohne gueltige native Session kann der Android-Sync nicht eigenstaendig starten.
- Fehler im nativen Sync sollen nicht zu Writes oder fachlicher Drift fuehren.
- `WidgetSyncRepository` nutzt einen defensiven Netzwerkpfad mit sauberem `disconnect()`-Cleanup.
- Logout / Session-Verlust werden nicht nur per Worker-Stopp behandelt, sondern ueber:
  - gemeinsamen Clear-Pfad
  - `sessionGeneration`-Guard
  - aktives WebView-Signout

---

## 8. Events & Integration Points

- Native Events:
  - Widget-Update
  - `WorkManager`-Tick
  - `USER_PRESENT` / Unlock im lebenden Android-Prozess
  - nativer Realtime-Write-Trigger
  - Widget-Tap
- Nicht enthalten:
  - nativer Push-Reminder
  - FCM
  - AlarmManager-/Exact-Alarm-Fachlogik
  - Medication-/BP-Reminder-Bestaetigung im Widget
- WebView-/MIDAS-Bridge:
  - Android -> WebView:
    - Bootstrap-State
    - nativer Session-Import
    - nativer Login-Request aus dem Overlay
  - WebView -> Android:
    - Auth-State
    - Intake-Snapshot
    - Medication-State
    - Blood-Pressure-State
    - `visibilitychange`
    - `capture:intake-changed`
    - `bp:changed`
    - `medication:changed`

---

## 9. Erweiterungspunkte / Zukunft

- moegliche Datums-/Homescreen-Hybrid-Variante, falls Samsung-/Launcher-Raster die Flaechennutzung spaeter sinnvoller buendeln soll
- spaetere `Salz`-/`Protein`-Expansion
- weitere dynamische Zeilen, z. B. Termine, nur mit eigener Roadmap
- andere Widget-Groessen oder Hybrid-Flaechen
- separate native Push-/FCM-/Alarm-Roadmap, falls MIDAS irgendwann echte Android-native Reminder braucht

Wichtig:
- diese Zukunftspfade sind bewusst nicht Teil von `V2.2`
- sie aendern nicht den Grundvertrag:
  - MIDAS bleibt Hauptsystem
  - das Widget bleibt passive Surface

---

## 10. Feature-Flags / Konfiguration

- Keine dedizierten Feature-Flags in `V2.2`.
- Android-Verhalten ist aktuell fest ueber:
  - Widget-Konfiguration
  - Sync-Scheduler
  - lokale `Wasser-Soll`-Stuetzpunkte
  definiert.

---

## 11. Status / Dependencies / Risks

- Status: `V2.2` fuer Widget + minimale Android-Huelle ist umgesetzt, per User-Device-Smoke bestaetigt und dokumentiert.
- Der native Android-OAuth-/Deep-Link-Nachzug fuer Widget-Aktivierung ist technisch geschlossen; echter Geraete-Smoke bleibt ein manueller End-to-End-Test.
- Der Widget-Refresh ist jetzt nicht mehr nur Worker-basiert:
  - laufender Android-Prozess -> nativer Realtime-Refresh
  - Prozess nicht aktiv -> periodischer Worker-Fallback
- Dependencies (hard):
  - Android AppWidget Host
  - `WorkManager`
  - `supabase:realtime-kt`
  - Android `USER_PRESENT` Broadcast im lebenden Prozess
  - MIDAS-/Supabase-Read-Vertraege
  - lokales Android-SDK/Gradle-Buildsetup
- Dependencies (soft):
  - One UI / Launcher-Grid-Verhalten
  - Wallpaper-/Homescreen-Komposition

Known risks:
- Launcher-/Samsung-Raster bestimmt sichtbare Restabstaende mit, auch wenn das Widget selbst bereits kompakt genug ist.
- Frische Android-Installationen brauchen weiterhin einmalige Android-Bootstrap-Konfiguration fuer REST-/ANON-Daten.
- Deep-Link-/Provider-Konfiguration bleibt ein echter End-to-End-Risikopunkt fuer den Geraetetest.
- Wirklich sofortiger Widget-Refresh ist an einen lebenden Android-Prozess gebunden; bei gekilltem Prozess greift wieder der Worker-/Reconnect-Pfad.
- Der Wake-/Unlock-Catch-up ist bewusst nur best effort:
  - kein Weckpfad fuer gekillte Prozesse
  - keine Garantie fuer jeden einzelnen Unlock
- Android-WebView-/Widget-Pfade duerfen nicht als Ersatz fuer den Browser-/PWA-Push-Master interpretiert werden.
- Fuer PWA-Aenderungen ohne lebenden Android-Prozess bleibt der manuelle Widget-Tap der verlaesslichste Catch-up-Pfad.
- Zukuenftige Aenderungen an:
  - `Wasser-Soll`-Stuetzpunkten
  - `DailyWidgetState`
  - Medication-Mapping
  koennen Android-Rebuilds erfordern.

---

## 12. QA-Checkliste

- Das Widget ist read-only.
- Das Widget zeigt `Fluessigkeit`, `Medikation` und `Blutdruck`.
- `Fluessigkeit` zeigt `Ist / Soll L` mit einer Dezimalstelle und deutschem Komma.
- Es gibt keine separate aktive `Wasser-Soll`-Zeile mehr.
- `Medikation` nutzt `medicationSummary`, wenn vorhanden, und faellt auf `medicationStatus` zurueck.
- Abschnittscopy nutzt `Morgens`, `Mittags`, `Abends`, `Nachts`.
- `Blutdruck` zeigt bei fehlendem Snapshot `Lade...`.
- `Blutdruck` zeigt `BD Abend offen`, wenn heute eine Morgenmessung vorhanden ist und die Abendmessung fehlt.
- `Blutdruck` zeigt `Alles ruhig`, wenn ein Snapshot vorhanden ist und kein offener V2.2-BP-Kontext besteht.
- `Alles ruhig` ist nur Widget-Neutralstatus, keine medizinische Entwarnung.
- Das Widget zeigt keine BP-Rohwerte, BP-Schwellen, Trendpilot-Hinweise oder BP-Capture-Aktion.
- Das Widget zeigt keine Push-Bedienung und keine Reminder-Bestaetigung.
- Android-WebView wird im Touchlog nicht als gesunder Reminder-Push-Master verkauft.
- Ein kurzer Tap auf das Widget loest einen nativen Sync aus.
- Der Widget-Tap zeigt waehrend des manuellen Syncs sichtbar `Synchronisiere...`.
- Ein Android-App-Start zieht das Widget bei vorhandener Session direkt nach.
- Nach einmaligem nativen Auth-/Bridge-Setup bleibt periodischer nativer Refresh moeglich.
- Aenderungen an Wasser-/Medikationsdaten spiegeln sich bei laufendem Android-Prozess nahezu sofort im Widget.
- `Wasser-Soll` bleibt vertraglich konsistent zur MIDAS-Hub-Version.
- Der aktuelle V2.2-Look ist ruhig genug fuer den Homescreen.
- Verbleibende Leerraeume werden nicht vorschnell als MIDAS-Layoutfehler missdeutet, wenn sie klar launcherbedingt sind.

---

## 13. Definition of Done

- Der Android-Pfad ist als MIDAS-Node sauber dokumentiert.
- Die Modul-Overview beschreibt Snapshot, Sync, Cache, Launcher und Widget-Rolle ohne Reverse Engineering.
- Native Auth-/Deep-Link-Details bleiben ueber die getrennte Android-Auth-Overview nachvollziehbar, ohne dieses Dokument zu ueberladen.
- Spaetere Chats koennen den Android-Widget-Pfad aus der Doku heraus sicher uebernehmen.
