# MIDAS Android Widget

Native Android-Huelle fuer MIDAS.

Dieser Bereich ist bewusst innerhalb des MIDAS-Repos gekapselt und existiert
fuer:

- nativen Widget-Host
- minimalen MIDAS-Launcher
- nativen OAuth-/Deep-Link-Login fuer Android
- lokalen Android-Snapshot-Cache

Nicht Ziel dieses Bereichs:

- MIDAS als zweite App nachzubauen
- Business-Logik aus MIDAS zu verschieben
- das Widget zu einer Eingabe- oder Reminder-Flaeche zu machen
- Browser-/PWA-Push durch Android-WebView, Widget, FCM oder AlarmManager zu
  ersetzen

Aktuelles Widget-Zielbild:

- `Fluessigkeit` als `Ist / Soll L`
- `Medikation` als kompakte Tages-/Abschnitts-Summary
- weitere Kontextzeilen wie Blutdruck nur mit eigener Roadmap

Aktueller Widget-Refresh-Vertrag:

- Android-Save in der WebView darf den nativen Widget-Sync direkt anstossen
- Android-App-Start zieht das Widget bei vorhandener nativer Session direkt nach
- ein kurzer Tap auf das Widget startet einen nativen manuellen Sync
- solange der Android-Prozess lebt, versucht `USER_PRESENT` / Unlock zusaetzlich
  einen gedrosselten Catch-up-Sync
- Browser-/PWA-Aenderungen ohne lebenden Android-Prozess landen nicht als
  sofortiger Push im Widget; dafuer ist der Widget-Tap der verlässlichste
  Catch-up-Pfad

Android-Auth-Vertrag:

- Browser-/PWA-Google-Login bleibt unveraendert
- Android startet Google-/Supabase-OAuth nativ ueber sicheren Browser-Kontext
- der Callback kehrt per Deep Link zur App zurueck
- die native Session ist Source of Truth fuer Widget-Sync und Android-Shell
- die `WebView` ist MIDAS-Surface, nicht Login-Surface
- die `WebView` ist kein Reminder-Push-Master

Push-/Reminder-Vertrag:

- Browser/PWA bleibt der Reminder-Push-Master
- Android-WebView/Shell und Widget sind Sync-/Auth-/Snapshot-Nodes
- verlaessliche Push-Erinnerungen werden in MIDAS ueber Chrome/PWA aktiviert und
  im Touchlog diagnostiziert
- native Android-Push-, FCM- oder AlarmManager-Reminder brauchen eine separate
  Roadmap

Build-Hinweis:

- das Android-Teilprojekt braucht lokales Android-SDK
- AGP `8.5.2` laeuft hier mit JDK `17`
- Web-MIDAS selbst bleibt davon unberuehrt und hat weiter keinen klassischen
  Build-Step

Der fachliche Vertrag lebt primaer in:

- [`docs/Widget Contract.md`](docs/Widget%20Contract.md)
- [`../docs/modules/Android Widget Module Overview.md`][ref-1]

MIDAS bleibt Source of Truth.

## Lokale Toolchain

MIDAS Android benötigt JDK 17. Vor Androidarbeit Auswahl prüfen:

```powershell
[Environment]::GetEnvironmentVariable("JAVA_HOME", "Machine")
Push-Location android
.\gradlew.bat --version
Pop-Location
```

`java -version` kann über alte Oracle-PATHeinträge noch Java 8 finden.
Maßgeblich sind systemweites `JAVA_HOME` und die JVM-Ausgabe des Repo-Wrappers.
`android/gradle.properties` darf keinen absoluten versionsgebundenen
`org.gradle.java.home` enthalten. Kein systemweites Gradle erforderlich.
Nach separat autorisiertem JDKupdate können offene Terminals/Gradledaemons
den alten JAVA_HOME halten: VS Code neu starten und bei Bedarf aus `android/`
einmal `.\gradlew.bat --stop` verwenden. Keine Update-/PATH-Reparaturautorität
aus diesem Hinweis.

### Android SDK und ADB

Projektlokales SDK: `android/.tools/android-sdk`, kein systemweites SDKzwang.
Erhaltener lokaler SDK-Vertrag aus der Overlaybaseline (2026-10-14 migriert,
keine neue Installationsprüfung):

- `cmdline-tools/latest` Version `21.0`;
- `platform-tools` / ADB Version `37.0.0`;
- `build-tools;34.0.0` und `platforms;android-34` projektgebunden;
- Gradle, AGP `8.5.2`, Kotlin und SDK-Level nicht durch allgemeine Toolpflege
  anheben; JDK 17 bleibt Voraussetzung.

ADB: `android/.tools/android-sdk/platform-tools/adb.exe`. Der User-PATHeintrag
ist dokumentierte Baseline, keine aktuelle Terminalgarantie. Nach VS-Code-
Neustart `adb devices`; kennt das Terminal den Pfad nicht, vorhandenen
projektlokalen Fallback nutzen:

```powershell
& "android/.tools/android-sdk/platform-tools/adb.exe" devices
```

Geräteerkennung, Widget-/Shellsmokes und Logs folgen konkretem Auftrag und
den [Android-QA-Orakeln](../docs/qa/android-widget.md). Build-/Geräteablauf:

```powershell
Push-Location android
.\gradlew.bat --version
.\gradlew.bat :app:assembleDebug
Pop-Location
adb devices
```

APK-Build/Install mit Gerätewirkung, Auth-/Datenaktionen und Device-Smokes
brauchen explizite Ownerautorität; Zielgerät/Daten-/Signaturerhalt zuerst
prüfen. [Device-Runbook](../docs/qa/runbooks/android-device-smoke.md) besitzt
Installations-/Cleanupgates. Dedizierte native Public-Key-/Store-/Restore-/
Widgetmigration bleibt
[DEFERRED][ref-2],
kein Abschluss aus normaler Androidnutzung oder diesem Dokument ableiten.

[ref-1]: ../docs/modules/Android%20Widget%20Module%20Overview.md
[ref-2]: ../docs/reference/supabase/MIDAS%20Supabase%20Modernization%20Deferred%20Work%20and%20Recovery.md
