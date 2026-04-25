# MIDAS Android Widget

Native Android-Huelle fuer MIDAS.

Dieser Bereich ist bewusst innerhalb des MIDAS-Repos gekapselt und existiert fuer:

- nativen Widget-Host
- minimalen MIDAS-Launcher
- nativen OAuth-/Deep-Link-Login fuer Android
- lokalen Android-Snapshot-Cache

Nicht Ziel dieses Bereichs:

- MIDAS als zweite App nachzubauen
- Business-Logik aus MIDAS zu verschieben
- das Widget zu einer Eingabe- oder Reminder-Flaeche zu machen

V1-Zielbild:

- `Wasser (Ist)`
- `Wasser-Soll`
- `Medikation-Status`

Aktueller Widget-Refresh-Vertrag:

- Android-Save in der WebView darf den nativen Widget-Sync direkt anstossen
- Android-App-Start zieht das Widget bei vorhandener nativer Session direkt nach
- ein kurzer Tap auf das Widget startet einen nativen manuellen Sync
- solange der Android-Prozess lebt, versucht `USER_PRESENT` / Unlock zusaetzlich einen gedrosselten Catch-up-Sync
- Browser-/PWA-Aenderungen ohne lebenden Android-Prozess landen nicht als sofortiger Push im Widget; dafuer ist der Widget-Tap der verlässlichste Catch-up-Pfad

Android-Auth-Vertrag:

- Browser-/PWA-Google-Login bleibt unveraendert
- Android startet Google-/Supabase-OAuth nativ ueber sicheren Browser-Kontext
- der Callback kehrt per Deep Link zur App zurueck
- die native Session ist Source of Truth fuer Widget-Sync und Android-Shell
- die `WebView` ist MIDAS-Surface, nicht Login-Surface

Build-Hinweis:

- das Android-Teilprojekt braucht lokales Android-SDK
- AGP `8.5.2` laeuft hier mit JDK `17`
- Web-MIDAS selbst bleibt davon unberuehrt und hat weiter keinen klassischen Build-Step

Der fachliche Vertrag lebt primaer in:

- [`docs/Widget Contract.md`](docs/Widget%20Contract.md)
- [`../docs/modules/Android Widget Module Overview.md`](../docs/modules/Android%20Widget%20Module%20Overview.md)

MIDAS bleibt Source of Truth.
