# Doctor View Module - Functional Overview

## Einordnung

- Zweck: Ruhige, read-only Konsultationsansicht für Arzt und Patient.
- Primärer Inhalt: der aktuell gespeicherte Arzt-Bericht.
- Sekundäre Werkzeuge: Einzelwerte, Verlauf und Health Export V2.
- Nicht Teil des Moduls: Dateneingabe, Diagnosen oder Therapieentscheidungen.

Related docs:

- [Reports Module Overview](Reports Module Overview.md)
- [Charts Module Overview](Charts Module Overview.md)
- [Unlock Flow Overview](Unlock Flow Overview.md)
- [Health Capture and Reports QA](../qa/health-capture-reports.md)

---

## 1. Produktvertrag

- Nach erfolgreichem Doctor-Unlock zeigt die Hauptfläche den aktuellen
  `range_report`.
- Existiert noch kein Bericht, erscheint ein klarer Zero-State mit
  `Neuer Bericht`.
- Es gibt keine Report-Inbox, kein Report-Archiv und keine Monatsberichte.
- Ein neuer Bericht ersetzt den bisherigen Bericht erst nach vollständiger
  Berechnung.
- Einzelwerte und Verlauf bleiben sekundär und werden erst bei Bedarf geöffnet.
- Der JSON-Export bleibt als manueller, maschinenlesbarer Fallback sichtbar.

## 2. Kernkomponenten

<!-- markdownlint-disable MD013 -->

| Datei | Verantwortung |
| --- | --- |
| `app/modules/doctor-stack/doctor/index.js` | Hauptansicht, Live-Zeitraum, Einzelwerte und Health Export V2 |
| `app/modules/doctor-stack/reports/index.js` | Reportvalidierung, Latest-Auswahl, Darstellung und Erzeugungsflow |
| `app/modules/doctor-stack/charts/index.js` | Sekundäres Vollbild-Diagramm |
| `app/modules/hub/index.js` | Doctor-Panel und fail-closed Unlock-Einstieg |
| `app/supabase/auth/guard.js` | Unlock-Resume für Doctor View und Verlauf |
| `app/supabase/api/reports.js` | Authentifizierter Edge-Function-Aufruf |
| `app/styles/doctor.css` | Report-first-, Detail- und responsive Darstellung |
| `backend/supabase/functions/midas-monthly-report/` | Range-only Report-Engine und Singleton-Replacement |

<!-- markdownlint-enable MD013 -->

## 3. Datenquellen

- `health_events`
  - BP, Body, Lab, Activity, Notes und aktueller `range_report`.
- Views:
  - `v_events_bp`
  - `v_events_body`
  - `v_events_lab`
  - `v_events_activity`
- `trendpilot_events_range`
- `user_profile`
- `health_medications`
- `health_medication_schedule_slots`

Supabase ist die Source of Truth. Lokale Daten sind nur ein begrenzter
Offline-Fallback für bestehende Read-Pfade.

## 4. Hauptablauf

### 4.1 Öffnen

1. Hub oder Shortcut fordert den Doctor-Unlock an.
2. Fehlt die Guard-API, bleibt der Einstieg geschlossen und zeigt eine
   verständliche Fehlermeldung.
3. Nach erfolgreichem Unlock wird der aktuelle Bericht geladen.
4. Lade-, Zero-, Offline-, Read- und Korruptionszustände bleiben getrennt.

### 4.2 Aktueller Bericht

- Der Client akzeptiert nur gültige `range_report`-Datensätze.
- Die Auswahl ist deterministisch:
  1. größtes gültiges `period.to`
  2. neueste `generated_at`
  3. stabiler ID-Tie-Break
- Pagination besitzt Fortschrittsprüfung und eine harte 50-Seiten-Grenze.
- Berichtstext wird vor HTML-Darstellung escaped.

### 4.3 Neuer Bericht

- Erzeugung ist immer eine explizite Nutzeraktion.
- Standardzeitraum:
  - `from`: Ende des aktuellen Berichts oder vorhandener Kontext
  - `to`: aktueller Wiener Kalendertag
- Beide Datumsfelder bleiben editierbar.
- Der inklusive Zeitraum ist auf 400 Tage begrenzt.
- Zukunft, umgekehrte oder ungültige Kalenderdaten werden vor dem Request
  abgelehnt.
- Ein erfolgreicher Write wird nicht durch einen nachfolgenden UI-Refresh als
  fehlgeschlagen dargestellt.

### 4.4 Einzelwerte

- Einzelwerte sind standardmäßig geschlossen.
- Erst beim Öffnen werden BP, Body, Lab, Training und Trendpilot für den
  sichtbaren Zeitraum geladen.
- Gültige Datumsänderungen aktualisieren diese Live-Daten ohne
  `Anwenden`-Button.
- Request-Version und DOM-Zeitraum verhindern, dass späte Antworten einen
  neueren Zustand überschreiben.
- Ein Löschen einzelner Rohwerte bleibt möglich und ist kein Report-Write.

### 4.5 Verlauf

- `Verlauf` öffnet ein eigenes Vollbild-Panel und startet mit Blutdruck.
- Das Chart übernimmt beim Öffnen einen unveränderlichen Zeitraum-Snapshot.
- Änderungen der Doctor-Datumsfelder verändern ein bereits offenes Chart
  nicht still; der neue Zeitraum gilt nach Schließen und erneutem Öffnen.
- Fehlt ein gültiger Zeitraum, erhält der Nutzer eine Fehlermeldung.

### 4.6 Health Export V2

- Schema: `midas.health-export.v2`.
- Der Export verwendet die sichtbare Reportperiode oder den geöffneten
  Live-Zeitraum.
- Domains sind getrennt und deterministisch sortiert.
- BP- und Body-Messungen erhalten keine erfundenen Uhrzeiten.
- `user_id` wird nicht exportiert.
- Ein Domainfehler verhindert den Download vollständig.
- Out-of-Range-Zeilen werden vor der Feldvalidierung verworfen.

## 5. Zustände und Lifecycle

- Öffnen oder Nutzerwechsel startet einen neuen Lifecycle.
- Logout leert Report- und Detailzustand ohne falschen Ladehinweis.
- Schließen invalidiert laufende Detail- und Chart-Antworten.
- Berichtserzeugung besitzt In-flight-Schutz.
- Responsive Aktionen stapeln sich auf kleinen Viewports und bleiben
  vollständig bedienbar.

## 6. Public API

- `AppModules.doctor.renderDoctor(...)`
- `AppModules.doctor.exportDoctorJson(...)`
- `AppModules.doctor.buildHealthExportV2(...)`
- `AppModules.doctor.beginDoctorPanelLifecycle()`
- `AppModules.doctor.resetDoctorState(...)`
- `AppModules.doctor.getActiveConsumerRange()`

## 7. Sicherheit und Fehlergrenzen

- Alle Doctor-Einstiege bleiben durch den Unlock geschützt.
- Report-Erzeugung benötigt einen echten User-JWT.
- Service Role ist als Report-Caller nicht erlaubt.
- Interne Edge-/PostgREST-Fehler werden geloggt, aber nicht an den Client
  durchgereicht.
- Diagnoseausgaben begrenzen öffentliche Fehlertexte.

## 8. QA-Kernpunkte

- Unlock, Logout und fehlende Guard-API.
- Current- und Zero-State.
- Gültige, ungültige, zukünftige und zu lange Zeiträume.
- Lazy Einzelwerte und Latest-request-wins.
- Chart-Snapshot, Fokus und Schließen.
- Health Export V2, Privacy und All-or-error.
- Mobile, Tablet und Desktop ohne Überlappung.
- Create-then-replace mit genau einem `range_report`.

## 9. Risiken und Zukunft

- Der technische Edge-Name `midas-monthly-report` ist historisch; fachlich
  verarbeitet er ausschließlich Bereichsberichte.
- MCP darf später den semantischen Health-Export-V2-Vertrag wiederverwenden.
- Direkter Labor-PDF-Ingest bleibt ein eigenes zukünftiges Thema.

## 10. Definition of Done

- Der aktuelle Bericht ist unmittelbar sichtbar.
- Berichterzeugung ist explizit, begrenzt und fehlersicher.
- Einzelwerte, Verlauf und Export bleiben sekundär verfügbar.
- Kein aktiver Monthly-, Inbox- oder Archivpfad ist dokumentiert.
