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

MIDAS bleibt Source of Truth.
