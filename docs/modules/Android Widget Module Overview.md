# Android Widget Module - Functional Overview

Kurze Einordnung:
- Zweck: native Android-Surface fuer einen passiven MIDAS-Daily-Snapshot auf dem Homescreen.
- Rolle innerhalb von MIDAS: read-only Node fuer schnelle Tagesorientierung ohne geoeffnete PWA.
- Abgrenzung: kein Hauptsystem, keine zweite App, kein Capture-Frontend, keine Reminder-Flaeche.

Status-Hinweis:
- `V1` ist als ruhiges Homescreen-Widget plus minimale native Shell umgesetzt.
- MIDAS bleibt Source of Truth.
- Der Android-Pfad spiegelt Daten ueber einen lokalen Snapshot-/Sync-Vertrag und fuehrt bei Tap in MIDAS zurueck.
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
  - `Wasser (Ist)`
  - `Wasser-Soll`
  - `Medikation-Status`
- Die native Huelle bleibt bewusst klein:
  - Widget Host
  - minimaler MIDAS-Launcher
  - kein fachlich eigenstaendiges System

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `android/app/src/main/java/de/schabuss/midas/MainActivity.kt` | minimaler nativer Launcher-Einstieg + nativer OAuth-Callback |
| `android/app/src/main/java/de/schabuss/midas/web/MidasWebActivity.kt` | native WebView-Sitzung fuer MIDAS, Android-gateter MIDAS-Surface mit Session-Import/-Export |
| `android/app/src/main/java/de/schabuss/midas/auth/AndroidAuthContract.kt` | Deep-Link-/Entry-Vertrag fuer nativen OAuth |
| `android/app/src/main/java/de/schabuss/midas/auth/NativeOAuthStarter.kt` | Start des nativen Google-Logins ueber sicheren Browser-Kontext |
| `android/app/src/main/java/de/schabuss/midas/auth/NativeAuthStore.kt` | finaler nativer Session-Source-of-Truth |
| `android/app/src/main/java/de/schabuss/midas/auth/NativeAuthConfigStore.kt` | abgesicherter Bootstrap-Store fuer REST-/ANON-Konfiguration |
| `android/app/src/main/java/de/schabuss/midas/auth/NativeSessionController.kt` | gemeinsamer Clear-Pfad fuer Android, Widget und WebView |
| `android/app/src/main/java/de/schabuss/midas/widget/MidasWidgetProvider.kt` | AppWidget-Render und Open-Action |
| `android/app/src/main/java/de/schabuss/midas/widget/DailyWidgetState.kt` | kompakter lokaler Widget-Vertrag |
| `android/app/src/main/java/de/schabuss/midas/widget/WidgetSnapshotStore.kt` | lokaler Snapshot-Cache |
| `android/app/src/main/java/de/schabuss/midas/widget/WidgetAuthStore.kt` | Kompatibilitaetsadapter zum nativen Session-Store |
| `android/app/src/main/java/de/schabuss/midas/widget/WidgetSyncBridge.kt` | JS-Bridge von MIDAS nach Android |
| `android/app/src/main/java/de/schabuss/midas/widget/WidgetSyncRepository.kt` | nativer Read-/Refresh-Pfad gegen bestehende MIDAS-/Supabase-Reads |
| `android/app/src/main/java/de/schabuss/midas/widget/WidgetSyncWorker.kt` | periodischer Android-Refresh via `WorkManager` |
| `android/app/src/main/java/de/schabuss/midas/widget/WidgetSyncScheduler.kt` | Scheduling des nativen Sync-Pfads |
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
- `updatedAt`

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

- `WorkManager` triggert periodische Syncs.
- `WidgetSyncRepository` liest:
  - Intake-Tagesdaten ueber denselben Vertrag wie MIDAS
  - Medication-Tagesstatus ueber `med_list_v2`
- `Wasser-Soll` wird lokal auf Android berechnet.
- Der neue Snapshot wird lokal gespeichert und das Widget aktualisiert.
- Laufende Worker pruefen vor spaeten Auth-/Snapshot-Writes die aktuelle `sessionGeneration`.
  - Damit duerfen Ergebnisse nach Logout oder Session-Wechsel nicht mehr als gueltig committen.

### 4.4 Widget-Render

- `MidasWidgetProvider` liest den letzten gueltigen lokalen Snapshot.
- Das Widget zeigt:
  - `Wasser`
  - `Wasser-Soll`
  - `Medikation`
- Ein Tap auf das Widget oeffnet die native MIDAS-Huelle.

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

### 5.1 V1-Inhalt

- `Wasser (Ist)`
- `Wasser-Soll`
- `Medikation-Status`

### 5.2 Nicht Teil von `V1`

- `Salz`
- `Protein`
- `Appointments`
- Capture-Buttons
- Reminder-/Push-Interaktion
- Trend-/Analyseflaechen

### 5.3 Visueller Stand

- Der Widget-Look wurde von einem dunklen Block schrittweise auf einen ruhigen textnahen Homescreen-Teststand reduziert.
- Header/Branding wurden bewusst entfernt.
- Der aktuelle V1-Stand priorisiert:
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
  - Widget-Tap
- WebView-/MIDAS-Bridge:
  - Android -> WebView:
    - Bootstrap-State
    - nativer Session-Import
    - nativer Login-Request aus dem Overlay
  - WebView -> Android:
    - Auth-State
    - Intake-Snapshot
    - Medication-State
    - `visibilitychange`
    - `capture:intake-changed`
    - `medication:changed`

---

## 9. Erweiterungspunkte / Zukunft

- moegliche Datums-/Homescreen-Hybrid-Variante, falls Samsung-/Launcher-Raster die Flaechennutzung spaeter sinnvoller buendeln soll
- spaetere `Salz`-/`Protein`-Expansion
- verfeinerter Medication-Status
- andere Widget-Groessen oder Hybrid-Flaechen

Wichtig:
- diese Zukunftspfade sind bewusst nicht Teil von `V1`
- sie aendern nicht den Grundvertrag:
  - MIDAS bleibt Hauptsystem
  - das Widget bleibt passive Surface

---

## 10. Feature-Flags / Konfiguration

- Keine dedizierten Feature-Flags in `V1`.
- Android-Verhalten ist aktuell fest ueber:
  - Widget-Konfiguration
  - Sync-Scheduler
  - lokale `Wasser-Soll`-Stuetzpunkte
  definiert.

---

## 11. Status / Dependencies / Risks

- Status: `V1` fuer Widget + minimale Android-Huelle ist umgesetzt und dokumentiert.
- Der native Android-OAuth-/Deep-Link-Nachzug fuer Widget-Aktivierung ist technisch geschlossen; echter Geraete-Smoke bleibt ein manueller End-to-End-Test.
- Dependencies (hard):
  - Android AppWidget Host
  - `WorkManager`
  - MIDAS-/Supabase-Read-Vertraege
  - lokales Android-SDK/Gradle-Buildsetup
- Dependencies (soft):
  - One UI / Launcher-Grid-Verhalten
  - Wallpaper-/Homescreen-Komposition

Known risks:
- Launcher-/Samsung-Raster bestimmt sichtbare Restabstaende mit, auch wenn das Widget selbst bereits kompakt genug ist.
- Frische Android-Installationen brauchen weiterhin einmalige Android-Bootstrap-Konfiguration fuer REST-/ANON-Daten.
- Deep-Link-/Provider-Konfiguration bleibt ein echter End-to-End-Risikopunkt fuer den Geraetetest.
- Zukuenftige Aenderungen an:
  - `Wasser-Soll`-Stuetzpunkten
  - `DailyWidgetState`
  - Medication-Mapping
  koennen Android-Rebuilds erfordern.

---

## 12. QA-Checkliste

- Das Widget ist read-only.
- Das Widget zeigt `Wasser`, `Wasser-Soll` und `Medikation`.
- Ein Tap fuehrt in MIDAS zurueck.
- Nach einmaligem nativen Auth-/Bridge-Setup bleibt periodischer nativer Refresh moeglich.
- `Wasser-Soll` bleibt vertraglich konsistent zur MIDAS-Hub-Version.
- Der aktuelle V1-Look ist ruhig genug fuer den Homescreen.
- Verbleibende Leerraeume werden nicht vorschnell als MIDAS-Layoutfehler missdeutet, wenn sie klar launcherbedingt sind.

---

## 13. Definition of Done

- Der Android-Pfad ist als MIDAS-Node sauber dokumentiert.
- Die Modul-Overview beschreibt Snapshot, Sync, Cache, Launcher und Widget-Rolle ohne Reverse Engineering.
- Native Auth-/Deep-Link-Details bleiben ueber die getrennte Android-Auth-Overview nachvollziehbar, ohne dieses Dokument zu ueberladen.
- Spaetere Chats koennen den Android-Widget-Pfad aus der Doku heraus sicher uebernehmen.
