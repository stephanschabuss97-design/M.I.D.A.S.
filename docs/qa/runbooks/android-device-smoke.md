# Runbook RB-005 - Android Device Smoke

## Zweck und Zuständigkeit

Dieses Runbook führt Build, Installation und Gerätebeobachtung für `AW-001`
bis `AW-014` zusammen. Es prüft Shell, Native Auth, WebView, Widget-Snapshot,
Syncpfade und Trace-Sicherheit.

## Voraussetzungen

- Android-Contract und betroffene `AW-`-IDs wurden festgelegt.
- JDK 17, Gradle Wrapper, Android SDK und ADB sind verfügbar.
- Testgerät ist per USB-Debugging verbunden und autorisiert.
- Für Auth-/Sync-Smokes existieren gültige Owner-Konfiguration und
  kontrollierte MIDAS-Daten.
- Vor Installation ist geklärt, ob vorhandene App-Daten erhalten bleiben müssen.

## Wirkung

- Build und statische Checks: `disposable`.
- APK-Installation, Login, Logout und Sync auf dem Owner-Gerät: `productive`.

## Owner-Gate

Vor APK-Installation und jeder Auth-/Datenaktion ist eine explizite
Owner-Freigabe erforderlich. `adb uninstall` ist kein normaler Cleanup, da es
App-Daten entfernt, und benötigt eine gesonderte Freigabe.

## Ablauf

1. Toolchain und Build prüfen:

   ```powershell
   Push-Location android
   .\gradlew.bat --version
   .\gradlew.bat :app:assembleDebug
   Pop-Location
   adb devices
   ```

2. APK-Pfad und verbundenes Zielgerät eindeutig bestätigen.
3. Nach Owner-Freigabe Upgrade-installieren, damit bestehende App-Daten erhalten
   bleiben:

   ```powershell
   adb install -r android/app/build/outputs/apk/debug/app-debug.apk
   ```

4. Shell starten und Erstkonfiguration, OAuth-Browser, Deep-Link-Rückkehr und
   WebView-Session prüfen.
5. Widget auf dem Homescreen prüfen: Loading, manueller Tap-Sync, Flüssigkeit,
   Medication Summary, BP-Kontext und nächster Termin.
6. App-Start-, WebView-Save-, Realtime- und späten WorkManager-Catch-up mit
   kontrollierten Daten beobachten.
7. Logout nur bei bewusstem Test ausführen und kontrollieren, dass nativer
   Auth-State, Widget-Snapshot und Sync-Arbeit entfernt werden.
8. Letzten Android-Trace aus `Download/midas-android-latest-trace.json` prüfen.
   Callback-Query/-Fragment, OAuth-Code, Access-/Refresh-Token, ANON-Key oder
   andere Secrets sind ein Release-Blocker.

## Erwartung

- APK baut mit JDK 17 und installiert als Upgrade.
- Native Session bleibt Source of Truth; WebView ist Session-Mirror.
- Widget bleibt read-only, zeigt nur heutigen Snapshot und synchronisiert über
  die dokumentierten Pfade.
- Kein fehlender Snapshot wird als fachliche Entwarnung dargestellt.
- Trace ist diagnostisch lesbar und enthält keine sensitiven Callback-Werte.

## Abbruchbedingungen

- Falsches oder nicht eindeutig identifiziertes Gerät.
- Buildfehler, Signaturkonflikt oder ungeklärter Datenverlust.
- Owner-Freigabe fehlt.
- OAuth-Callback, Trace oder ADB-Ausgabe legt Secrets offen.
- Widget zeigt fremde, veraltete oder medizinisch missverständliche Daten.

## Cleanup und Postconditions

Temporäre Testdaten nach ihrem Fachvertrag entfernen. Testbenachrichtigungen
verwerfen. Die installierte APK nur auf ausdrücklichen Wunsch zurücksetzen oder
durch einen belegten vorherigen Build ersetzen; nicht automatisch deinstallieren.
Buildartefakte dürfen lokal bleiben oder mit `gradlew.bat clean` entfernt werden.

## Evidence

Datum, Commit/APK, Gerät und Android-Version, ausgeführte `AW-`-IDs,
Beobachtung, Trace-Prüfung und Cleanup in Roadmap oder Evidence festhalten.
Screenshots und Logs dürfen keine Secrets enthalten.
