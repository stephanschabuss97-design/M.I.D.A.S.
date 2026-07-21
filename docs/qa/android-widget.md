# MIDAS QA - Android and Widget

Diese Suite besitzt aktuelle, statuslose Regressionstests mit dem Präfix
`AW-`. Der allgemeine Testfall- und Evidence-Vertrag steht im
[QA-Einstieg](README.md).

## Zuständigkeit

- Android Shell und TWA-Grenze
- Native Auth und OAuth-Übergabe
- Widget-Sync, Snapshot und Persistenz auf dem Gerät
- Widget-Darstellung und Device-Verhalten

## Abgrenzung

- Fachliche Weblogik bleibt in ihrer Domänensuite; `AW-` prüft Bridge,
  Synchronisierung und native Darstellung.
- Generische Supabase- und Edge-Runtime-Verträge gehören `BS-`.
- Produktarchitektur bleibt in den zuständigen Module Overviews.

## Testfälle

### AW-001 - Android-Projekt baut reproduzierbar

- Vertrag: [Android Widget Module Overview](<../modules/Android Widget Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: Dokumentiertes JDK 17, projektlokales Android SDK und Gradle-
  Wrapper sind verfügbar.
- Aktion: `:app:assembleDebug` über den Repo-Wrapper ausführen.
- Erwartung: Der Build endet erfolgreich und erzeugt genau das erwartete Debug-
  APK-Artefakt, ohne systemweites Gradle vorauszusetzen.
- Invalidiert durch: Android Build, Gradle, Kotlin, JDK, SDK oder Ressourcen.
- Cleanup: Build-Artefakte dürfen lokal verbleiben oder mit Gradle bereinigt werden.
- Runbook: [Android Device Smoke](runbooks/android-device-smoke.md)

### AW-002 - Native Erstkonfiguration blockiert ungültige Werte

- Vertrag:
  [Android Native Auth Module Overview](<../modules/Android Native Auth Module Overview.md>)
- Ebene: device
- Ausführung: manual
- Wirkung: disposable
- Voraussetzung: Frische oder zurückgesetzte Android-App ohne Bootstrap-
  Konfiguration ist verfügbar.
- Aktion: OAuth ohne Konfiguration, mit ungültiger und mit gültiger REST-/ANON-
  Konfiguration starten.
- Erwartung: Fehlende oder ungültige Werte blockieren mit lesbarem Hinweis;
  nur gültige Konfiguration erlaubt den nativen Login-Start.
- Invalidiert durch: NativeAuthConfigStore, Config-Validierung oder Login-UI.
- Cleanup: Testkonfiguration und nativen Teststate wieder entfernen.
- Runbook: [Android Device Smoke](runbooks/android-device-smoke.md)

### AW-003 - OAuth verlässt die WebView und kehrt per Deep Link zurück

- Vertrag:
  [Android Native Auth Module Overview](<../modules/Android Native Auth Module Overview.md>)
- Ebene: device
- Ausführung: owner-observation
- Wirkung: productive
- Voraussetzung: Owner-Freigabe, gültige Android-Konfiguration, Google-Konto und
  erlaubter Supabase-Redirect sind vorhanden.
- Aktion: Login in der Android-Shell starten und den Browser-/Deep-Link-Rückweg
  bis zur geladenen MIDAS-WebView beobachten.
- Erwartung: OAuth läuft in Custom Tab oder externem Browser, Callback erzeugt
  genau eine native Session und Widget sowie WebView erhalten denselben User.
- Invalidiert durch: OAuth-Provider, Redirect, Intent Filter, Deep Link,
  NativeAuthStore oder WebView-Handoff.
- Runbook: [Android Device Smoke](runbooks/android-device-smoke.md)

### AW-004 - WebView bleibt Session-Mirror

- Vertrag:
  [Android Native Auth Module Overview](<../modules/Android Native Auth Module Overview.md>)
- Ebene: device
- Ausführung: manual
- Wirkung: read-only
- Voraussetzung: Native Session ist vorhanden und MIDAS ist in WebView sowie
  separat als PWA erreichbar.
- Aktion: Android-WebView neu starten und danach den PWA-Login separat prüfen.
- Erwartung: WebView importiert den nativen Zustand ohne eigenen OAuth-Start;
  Browser/PWA behält seinen normalen Auth-Pfad und beide enden fachlich beim
  selben User.
- Invalidiert durch: Auth-Bridge, Supabase-Client-Modus, Session-Import oder PWA-Auth.

### AW-005 - Logout räumt nativen Zustand deterministisch auf

- Vertrag:
  [Android Native Auth Module Overview](<../modules/Android Native Auth Module Overview.md>)
- Ebene: device
- Ausführung: manual
- Wirkung: productive
- Voraussetzung: Android ist eingeloggt, Widget-Snapshot und Scheduler sind aktiv.
- Aktion: Logout ausführen und danach WebView, Widget und einen verspäteten
  Worker-Refresh beobachten.
- Erwartung: Native Session, Adapter, Snapshot und Client-Cache sind leer,
  Scheduler stoppt, WebView signiert aus und alte Worker dürfen wegen
  `sessionGeneration` keinen Snapshot zurückschreiben.
- Invalidiert durch: NativeSessionController, Stores, Scheduler oder Worker-Guard.
- Runbook: [Android Device Smoke](runbooks/android-device-smoke.md)

### AW-006 - Widget rendert nur den heutigen lokalen Snapshot

- Vertrag: [Android Widget Module Overview](<../modules/Android Widget Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: read-only
- Voraussetzung: Snapshots für gestern, heute und ein ungültiger Snapshot sind
  isoliert vorhanden.
- Aktion: Provider an jedem Zustand rendern lassen.
- Erwartung: Nur der gültige heutige Snapshot liefert Nutzwerte; fehlender oder
  fremdtägiger Zustand zeigt neutrale Lade-/Placeholder-Copy.
- Invalidiert durch: DailyWidgetState, SnapshotStore, Tagesgrenze oder Provider.

### AW-007 - Widget bleibt read-only und ruhig

- Vertrag: [Android Widget Module Overview](<../modules/Android Widget Module Overview.md>)
- Ebene: device
- Ausführung: owner-observation
- Wirkung: read-only
- Voraussetzung: Widget ist auf dem Homescreen platziert.
- Aktion: Alle sichtbaren Zeilen, Taps und Resize-Zustände prüfen.
- Erwartung: Widget zeigt nur Flüssigkeit, Medikation, Blutdruck und optional
  Termin; es besitzt keine Capture-, Confirm-, Push- oder Reminder-Aktion und
  bleibt im aktuellen Launcher-Raster lesbar.
- Invalidiert durch: Widget-Layout, Provider, Click-Targets oder AppWidget-Metadaten.

### AW-008 - Flüssigkeit und Ziel sind konsistent formatiert

- Vertrag: [Android Widget Module Overview](<../modules/Android Widget Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: read-only
- Voraussetzung: Positive, negative, nicht-finite und Grenzwerte für Ist und
  zeitabhängiges Soll sind vorbereitet.
- Aktion: Snapshot normalisieren und Widget-Copy zu mehreren Tageszeiten rendern.
- Erwartung: Werte werden auf gültige Bereiche normalisiert und als
  `Ist / Soll L` mit einer Dezimalstelle und deutschem Komma dargestellt; das
  Soll entspricht der MIDAS-Hydration-Kurve.
- Invalidiert durch: Sync-Bridge, Normalisierung, Formatierung oder Zielrechner.

### AW-009 - Medication Summary und Legacy-Fallback

- Vertrag: [Android Widget Module Overview](<../modules/Android Widget Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: read-only
- Voraussetzung: V2.1-Summaries für offen/teilweise/erledigt, unmögliche Counts
  und ein reiner Legacy-Status sind vorbereitet.
- Aktion: Zustände normalisieren, speichern und rendern.
- Erwartung: Counts liegen zwischen null und total, Abschnitte sind eindeutig,
  Copy nutzt Morgens/Mittags/Abends/Nachts; ein eingehender abweichender
  Legacy-Status ersetzt eine veraltete Detail-Summary, während statusgleiche
  Detaildaten erhalten bleiben.
- Invalidiert durch: MedicationWidgetSummary, SyncBridge, Store-Merge oder Copy.

### AW-010 - Blutdruckzeile unterscheidet Laden, offen und neutral

- Vertrag: [Android Widget Module Overview](<../modules/Android Widget Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: read-only
- Voraussetzung: Kein Snapshot, nur Morgen-BP, Morgen-/Abend-BP und kein BP sind
  als Zustände vorhanden.
- Aktion: Jeden Zustand ableiten und rendern.
- Erwartung: Kein Snapshot zeigt `Lade...`, nur Morgen-BP zeigt `BD Abend offen`
  und alle gültigen ruhigen Zustände zeigen `Alles ruhig` ohne medizinische
  Entwarnungsbedeutung oder Rohwerte.
- Invalidiert durch: BP-Ableitung, Placeholder, Widget-Copy oder Snapshotvertrag.

### AW-011 - Terminzeile zeigt nur den nächsten geplanten Termin

- Vertrag: [Android Widget Module Overview](<../modules/Android Widget Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: read-only
- Voraussetzung: Vergangene, erledigte und mehrere kommende Termine mit
  verschiedenen Zeitzonenformaten sind vorbereitet.
- Aktion: Appointment Summary vor und nach dem Start des ersten Termins ableiten.
- Erwartung: Nur der früheste kommende `scheduled` Termin mit Titel und Startzeit
  erscheint; danach folgt beim nächsten Refresh der nächste oder die Zeile
  verschwindet.
- Invalidiert durch: Appointment-Query, Timestamp-Parser, Sortierung oder Widget-Copy.

### AW-012 - Manueller Sync zeigt seinen Zustand

- Vertrag: [Android Widget Module Overview](<../modules/Android Widget Module Overview.md>)
- Ebene: device
- Ausführung: owner-observation
- Wirkung: read-only
- Voraussetzung: Widget und gültige native Session sind vorhanden.
- Aktion: Widget kurz antippen und einen erfolgreichen sowie fehlerhaften Sync
  beobachten.
- Erwartung: Sofort erscheint `Synchronisiere...`; Erfolg rendert den frischen
  Snapshot, Fehler behält den letzten gültigen Stand mit nachvollziehbarem Trace.
- Invalidiert durch: Widget-Tap, RefreshCoordinator, Repository oder Provider.
- Runbook: [Android Device Smoke](runbooks/android-device-smoke.md)

### AW-013 - App-Start, WorkManager und Realtime ziehen nach

- Vertrag: [Android Widget Module Overview](<../modules/Android Widget Module Overview.md>)
- Ebene: device
- Ausführung: manual
- Wirkung: productive
- Voraussetzung: Gültige native Session, Widget und kontrolliert veränderbare
  MIDAS-Daten sind vorhanden.
- Aktion: App starten, einen relevanten Wasser-/Medication-Write ausführen und
  einen periodischen Catch-up zulassen.
- Erwartung: App-Start aktualisiert sofort, laufender Prozess reagiert nahezu
  sofort auf Realtime und WorkManager bleibt ein später Best-Effort-Catch-up.
- Invalidiert durch: Scheduler, WorkManager, Realtime, App-Start oder Repository.
- Runbook: [Android Device Smoke](runbooks/android-device-smoke.md)

### AW-014 - Android-Trace bleibt exportierbar

- Vertrag:
  [Android Native Auth Module Overview](<../modules/Android Native Auth Module Overview.md>)
- Ebene: device
- Ausführung: manual
- Wirkung: read-only
- Voraussetzung: Android-Shell kann einen Boot-/Auth-Trace erzeugen.
- Aktion: App starten, einen kontrollierten Auth-Fehler auslösen und die letzte
  Trace-Datei öffnen; gezielt nach Callback-Query/-Fragment, OAuth-Code,
  Access Token, Refresh Token, ANON-Key und anderen Secrets suchen.
- Erwartung: UI nennt Speicherort und Summary; JSON enthält nur den für die
  Diagnose erforderlichen Ablauf. Jeder gefundene Callback-Parameter oder
  Secret-Wert blockiert die Android-Freigabe.
- Invalidiert durch: AndroidBootTrace, Crash-Hook, Export oder Redaction.
- Runbook: [Android Device Smoke](runbooks/android-device-smoke.md)
