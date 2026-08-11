# Activity V2 R8 - Local Android/PWA Test Runbook

Dieses Runbook beschreibt ausschließlich die lokale, disposable R8-Testlane.
Es ist kein Produktcutover. Activity V1, Produkt-PWA, Produkt-Service-Worker,
Produkt-URL und native Produkt-App-Daten bleiben unberührt.

## Harte Gates

- Alle Befehle unter „S5 Device-Lauf“ benötigen vorher das separate Android-
  Owner-Gate. In S4 wird kein Gerät angesprochen.
- Gebaut und gegebenenfalls installiert wird ausschließlich die Debug-Variante
  `de.schabuss.midas.activityv2test`.
- Es werden nur lokale Testuser und disposable Daten verwendet. Kein produktiver
  Endpoint, kein Produktcredential und keine synthetische Produktionssession.
- Ein ANON-Key kommt nur zur Laufzeit aus lokalem Tooloutput. Er wird weder in
  Git noch in Roadmap, Evidence, Screenshots oder Logs übernommen.
- Kein App-Data-Clear, kein Uninstall und kein physisches Recovery-Record-Delete.
  Commit oder Discard müssen den normalen R8-/R7-Tombstonepfad verwenden.

## Lokaler Preflight ohne Device

1. Toolstand prüfen:

   ```powershell
   node --version
   supabase --version
   docker version
   android\gradlew.bat -p android :app:assembleDebug
   ```

2. Den Repository-Root nur auf Loopback bereitstellen:

   ```powershell
   python -m http.server 8765 --bind 127.0.0.1
   ```

3. Im Desktop-Browser ausschließlich diese URL öffnen:

   ```text
   http://127.0.0.1:8765/app/modules/vitals-stack/activity/v2/test-pwa/?fixture=all
   ```

4. Die PWA muss `COMMITTED/PASS`, einen lokalen Worker-Scope unter
   `/app/modules/vitals-stack/activity/v2/test-pwa/` und ausschließlich
   payloadfreie Metriken zeigen.

## Disposable Supabase-Konfiguration

Die echte RPC-/SQL-Lane bleibt ein separater S5-Schritt. Nach Aufbau des
disposable Stacks werden URL und temporärer ANON-Key nur interaktiv übernommen:

```powershell
supabase start
supabase status -o env
```

Für die debug-only Android-Konfiguration wird als REST-Endpoint
`http://localhost:54321/rest/v1/health_events` verwendet. Aus dem Tooloutput darf
ausschließlich der lokale ANON-Key in das native Debug-Formular kopiert werden.
Der Service-Role-Key wird nie verwendet. Kein Wert wird in eine Datei oder einen
Command geschrieben.

## S5 Device-Lauf - erst nach Owner-Gate

1. Nur die zwei lokalen Ports an das bereits freigegebene Gerät spiegeln:

   ```powershell
   adb reverse tcp:8765 tcp:8765
   adb reverse tcp:54321 tcp:54321
   ```

2. Ausschließlich `android/app/build/outputs/apk/debug/app-debug.apk` installieren
   oder aktualisieren und danach die Debug-App-ID
   `de.schabuss.midas.activityv2test` starten. Die Produkt-App-ID
   `de.schabuss.midas` wird nicht angesprochen.

3. Vor Background/Reclaim festhalten: Harnesszustand, boolesche Intentidentität,
   Attemptnummer und gekürzter Request-ID-Hash. Keine Payload und keine rohe
   Request-ID erfassen.

4. Die Debug-App in den Hintergrund schicken, mindestens 30 Sekunden warten und
   ausschließlich den Debug-Prozess reclaimen. Kein App-Data-Clear und kein
   Uninstall. Danach die Debug-App explizit erneut starten.

5. Resume, identische Intent-/Request-Bindung, Retry, Commit, Tombstone und Reload
   prüfen. Unknown darf nur mit derselben `request_id` und derselben Payload
   erneut gesendet werden. Ein physisches Recovery-Delete ist verboten.

## Stop und Cleanup

- Den lokalen HTTP-Server normal beenden.
- Den disposable Supabase-Stack gemäß S5-Fixturevertrag stoppen und dessen
  lokale Testdaten entfernen. Das ist kein Device-App-Data-Clear.
- Nur die Reverse-Regeln entfernen:

  ```powershell
  adb reverse --remove tcp:8765
  adb reverse --remove tcp:54321
  ```

- Die Debug-App bleibt installiert und ihr Recovery-Tombstone bleibt erhalten,
  bis ein eigener Owner-Auftrag etwas anderes festlegt. Kein Uninstall und kein
  physisches Recovery-Record-Delete als Cleanup-Abkürzung.
