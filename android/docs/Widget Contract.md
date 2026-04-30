# Widget Contract

## Zweck

Das Android-Widget ist eine passive MIDAS-Snapshot-Surface.

Es ist:

- read-only
- ruhiger Daily-Kompass
- kein Eingabesystem
- kein Reminder-System
- kein Push-System

MIDAS bleibt Hauptsystem und Source of Truth.

## DailyWidgetState

V1 arbeitet mit diesem kompakten Snapshot:

- `dayIso`
- `waterCurrentMl`
- `waterTargetNowMl`
- `medicationStatus`
- `updatedAt`

## Feldvertrag

### `waterCurrentMl`

- heutiger Wasser-Istwert in `ml`
- wird ueber denselben Read-Vertrag geholt, den MIDAS fuer Intake-Tageswerte nutzt

### `waterTargetNowMl`

- aktueller `Wasser-Soll`-Wert in `ml`
- wird lokal auf dem Geraet berechnet
- keine Backend-Abhaengigkeit

### `medicationStatus`

Moegliche V1-Werte:

- `none`
- `open`
- `partial`
- `done`

Bedeutung:

- `none`: keine aktiven geplanten Medication-Slots fuer den Tag
- `open`: geplante Slots vorhanden, aber noch kein Slot erledigt
- `partial`: ein Teil erledigt, ein Teil offen
- `done`: alle geplanten Slots fuer den Tag erledigt

## Wasser-Soll Vertrag

`waterTargetNowMl` nutzt dieselbe Stuetzpunkt-Tabelle wie MIDAS:

| Uhrzeit | Soll |
|---|---|
| `07:00` | `0 ml` |
| `08:00` | `180 ml` |
| `09:00` | `350 ml` |
| `10:00` | `530 ml` |
| `11:00` | `720 ml` |
| `12:00` | `920 ml` |
| `13:00` | `1130 ml` |
| `14:00` | `1340 ml` |
| `15:00` | `1540 ml` |
| `16:00` | `1710 ml` |
| `17:00` | `1850 ml` |
| `18:00` | `1940 ml` |
| `19:00` | `1985 ml` |
| `19:30` | `2000 ml` |

Regeln:

- vor `07:00` hart `0 ml`
- ab `19:30` hart `2000 ml`
- dazwischen lineare Interpolation zwischen benachbarten Stuetzpunkten

## V1 Nicht-Ziele

- kein Capture am Widget
- kein direktes Medication-Confirm
- kein Push-Opt-in
- keine Push-Health-Anzeige
- keine native Reminder-/Alarm-Schicht
- keine `Salz`-/`Protein`-Erweiterung
- keine `Appointments`
- keine Trend-/Analyse-Flaeche
- kein neuer dedizierter Widget-Snapshot-Backend-Endpoint

## Technischer Grundsatz

Das Widget liest nie Browser-UI-State.

Die Android-Huelle:

- authentifiziert sich bewusst
- liest MIDAS-Daten ueber bestehende Read-Vertraege
- schreibt den letzten gueltigen `DailyWidgetState` in einen lokalen Android-Cache
- das Widget rendert ausschliesslich aus diesem Cache

## Refresh- / Interaktionsvertrag

- Das Widget bleibt read-only; es ist kein Capture-Frontend.
- Ein kurzer Tap auf das Widget startet einen nativen manuellen Sync.
- Waehrend dieses manuellen Syncs zeigt das Widget sichtbar `Synchronisiere...`.
- Der harte MIDAS-Einstieg bleibt ueber den Android-Launcher bestehen und ist nicht mehr der primaere Widget-Tap.
- Bei vorhandenem nativen Login stoesst die Android-App zusaetzlich beim App-Start einen Catch-up-Sync an.
- Solange der Android-Prozess lebt, darf `USER_PRESENT` / Unlock einen gedrosselten Catch-up-Sync versuchen.
- Dieser Unlock-Pfad ist bewusst nur best effort:
  - kein Ersatz fuer Push
  - kein Weckpfad fuer gekillte Prozesse
  - keine Garantie fuer jeden einzelnen Unlock
- Browser/PWA bleibt der Reminder-Push-Master.
- Android-WebView/Shell und Widget sind keine verlaesslichen Off-App-Reminder-Kanaele.
- Native Android-Push-/FCM-/AlarmManager-Reminder sind nur mit separater Roadmap erlaubt.

## Android Auth / Shell Vertrag

- Browser-/PWA-OAuth bleibt der bestehende Web-Standardpfad.
- Android besitzt einen separaten nativen Login-Entry:
  - `Custom Tabs` primaer
  - externer Browser als Fallback
  - Deep-Link-Callback zur App
- Die native Session ist Source of Truth fuer:
  - Widget-Aktivierung
  - Widget-Sync
  - Android-Shell-Auth-Zustand
- Die `WebView` importiert diese Session Android-gatet in den MIDAS-Boot hinein.
- Der gemeinsame Google-Login-Button darf im Android-WebView keinen eingebetteten WebView-OAuth mehr starten.

## Logout / Clear Vertrag

- Android-Logout leert deterministisch:
  - nativen Session-Store
  - Widget-Kompatibilitaetsstore
  - sichtbaren Widget-Snapshot
  - nativen Client-Cache
- Eine offene `WebView` wird aktiv zu lokalem Signout + Reload angestossen.
- Laufende Worker duerfen nach Logout keine spaeten Writes mehr committen; dafuer gilt der `sessionGeneration`-Guard.
