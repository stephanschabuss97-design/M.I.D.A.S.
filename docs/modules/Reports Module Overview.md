# Reports Module - Functional Overview

## R13-Produktionsstand (2026-08-26)

Neue Range-Arztberichte verwenden produktiv genau einen requestgebundenen
SQL26-Snapshot für Activity V1 und V2. Berechnung und vollständige
Contractvalidierung erfolgen vor dem atomaren Ersatz des einen
Report-Singletons. Bestehende Altberichte wurden nicht migriert. Der Bericht
bleibt kompakt und enthält keine Übungs-, Satz-, Gewichts- oder
Coachingdetails.

## Einordnung

- Zweck: Einen aktuellen Arzt-Bericht für einen expliziten Zeitraum erzeugen,
  speichern und darstellen.
- Produktmodell: `0..1` ersetzbarer Bereichsbericht für das persönliche
  Single-User-MIDAS.
- Nicht Teil des Moduls: Monatsberichte, Scheduler, Report-Archiv, Diagnosen
  oder Therapieentscheidungen.

Related docs:

- [Doctor View Module Overview](Doctor View Module Overview.md)
- [Medication Module Overview](Medication Module Overview.md)
- [Health Capture and Reports QA](../qa/health-capture-reports.md)
- [Activity V2 R11 Roadmap](<../archive/MIDAS Activity V2 R11 Doctor View and Report Integration Roadmap (DONE).md>)
- [Activity V2 R11 Evidence](<../archive/MIDAS Activity V2 R11 Doctor View and Report Integration Evidence (DONE).md>)

---

## 1. Kernkomponenten

<!-- markdownlint-disable MD013 -->

| Datei | Verantwortung |
| --- | --- |
| `app/modules/doctor-stack/reports/index.js` | Clientvalidierung, Current-Read, Darstellung und Erzeugungsflow |
| `app/modules/doctor-stack/doctor/index.js` | Permanente Reportfläche und Zeitraumkontext |
| `app/supabase/api/reports.js` | Authentifizierter Edge-Aufruf |
| `backend/supabase/functions/midas-monthly-report/index.ts` | Datenaggregation und Repository-Adapter |
| `backend/supabase/functions/midas-monthly-report/request-contract.ts` | Auth-, JSON- und Zeitraumvertrag |
| `backend/supabase/functions/midas-monthly-report/report-lifecycle.ts` | Build-before-write und Singleton-Replacement |
| `sql/19_Report_Lifecycle.sql` | Fresh-Setup-Singleton-Index |
| `app/styles/doctor.css` | Berichtsdarstellung und Erzeugungsformular |
| `backend/supabase/functions/midas-monthly-report/activity-consumer.ts` | Produktiver requestlokaler Loader für den gemeinsamen Activity-Snapshot |
| `backend/supabase/functions/midas-monthly-report/activity-report.ts` | Produktiver kompakter Activity-Untervertrag für neu erzeugte Berichte |
| `sql/25_Activity_Consumer_Compatibility.sql` | Produktiv installierter read-only V1-/V2-Snapshot-RPC; keine Report-DML |

<!-- markdownlint-enable MD013 -->

## 2. Datenmodell

- Tabelle: `public.health_events`
- `type = 'system_comment'`
- `payload.subtype = 'range_report'`
- Wichtige Payload-Felder:
  - `period.from`
  - `period.to`
  - `report_type = 'range_report'`
  - `text`
  - `summary`
  - `meta`
  - `generated_at`
  - `created_at`
  - BP-, Body-, Lab- und Activity-Serien

Bestehende gespeicherte Berichte bleiben unveränderte Snapshots. Der in R11
isoliert vorbereitete Activity-Untervertrag gilt erst für nach einer späteren
R13-Aktivierung neu und explizit erzeugte Berichte.

Der partielle Unique-Index `uq_events_range_report_per_user` erzwingt
höchstens einen `range_report` je technischer `user_id`. MIDAS bleibt
fachlich eine Single-User-App; `user_id` ist die bestehende
Authentifizierungs- und Ownership-Grenze.

## 3. Zeitvertrag

- Request und Payload verwenden ISO-Tage `YYYY-MM-DD`.
- `to` darf nicht nach dem aktuellen Kalendertag in `Europe/Vienna` liegen.
- `from <= to`.
- Der inklusive Zeitraum ist auf 400 Tage begrenzt.
- `health_events.ts` wird auf UTC-Mittag des `period.to` gesetzt.
- Die Generated Column `health_events.day` muss dadurch `period.to`
  entsprechen.
- `created_at` bleibt beim Replacement stabil.
- `generated_at` beschreibt die aktuelle erfolgreiche Neuberechnung.

## 4. Auth- und Request-Vertrag

- Erlaubt ist ausschließlich ein User-Bearer-Token.
- Service Role ist als Caller explizit abgelehnt.
- Der Body muss ein JSON-Objekt enthalten.
- `report_type` muss explizit `range_report` sein.
- `month` wird auch als `null` abgelehnt.
- Leerer Body, ungültiges JSON, ungültige Kalenderdaten, Zukunft und zu lange
  Zeiträume liefern einen Requestfehler.
- Nur Requestfehler werden als öffentliche `4xx`-Details zurückgegeben.
- Interne Datenbank-, Build- und Lifecycle-Fehler liefern eine generische
  `500`-Meldung; Details bleiben im Serverlog.

## 5. Datenquellen

Die Edge Function aggregiert:

- `v_events_bp`
- `v_events_body`
- `v_events_lab`
- `v_events_activity`
- `user_profile`
- `health_medications`
- `health_medication_schedule_slots`
- `trendpilot_events_range`

Der aktuelle produktive Handler liest Activity weiterhin über
`v_events_activity`. R11 hat daneben
`activity_consumer_snapshot(date,date)` als authenticated-only
`STABLE SECURITY INVOKER`-RPC installiert. Der isolierte Edge-Loader ist im
produktiven `index.ts` nicht importiert; es gibt vor R13 keinen neuen
Report-Read- oder Writepfad.

Medication- und Slot-Reads sind explizit auf den authentifizierten Nutzer
begrenzt. Ein fehlgeschlagener Domain-Read verhindert den Report-Write.

### 5.1 R11-Activity-Untervertrag

- Report-first bleibt unverändert: Der aktuelle Arztbericht ist der primäre
  Inhalt und in 60-90 Sekunden erfassbar.
- Die vorbereitete Copy beschränkt sich auf letzte Aktivität, aktive Tage pro
  Woche sowie Gesamt- und Durchschnittsdauer. Frequenzwerte besitzen höchstens
  eine Dezimalstelle.
- Keine Übungen, Sätze, Reps, Gewichte, Volumen oder Empfehlungen gelangen in
  den Bericht. Der vollständige R10-Coaching-Export bleibt getrennt.
- Der Snapshot wird vollständig validiert und vor jedem künftigen Write gebaut.
  Read-, Contract- oder Buildfehler verhindern den Report-Write atomar.

## 6. Persistenz und Replacement

1. Auth und Request werden vollständig validiert.
2. Alle Datenquellen werden gelesen.
3. Der vollständige Payload wird gebaut.
4. Erst danach beginnt die Persistenz.
5. Bei Zero-State wird genau eine Zeile eingefügt.
6. Bei bestehendem Bericht wird dieselbe ID aktualisiert.
7. Ein Update-Nichttreffer wird als `ReportLifecycleError` behandelt.
8. Ein einmaliger `23505`-Insert-Race wird erneut gelesen und in-place
   aufgelöst.
9. Mehrere bestehende Range-Berichte führen fail-closed zum Abbruch.
10. ID und abgeleiteter `day` werden nach dem Write geprüft.

Damit bleibt der bisherige gültige Bericht bei Read-, Build-, Insert- oder
Updatefehlern erhalten.

## 7. Client-Read und Darstellung

- Die Doctor View lädt den aktuellen Bereichsbericht additiv paginiert.
- Ungültige, zukünftige oder leere Kandidaten werden verworfen.
- Auswahlreihenfolge:
  1. größtes `period.to`
  2. neuestes `generated_at`
  3. deterministischer ID-Tie-Break
- Eine wiederholte Seite ohne Fortschritt oder mehr als 50 Seiten führt
  fail-closed zum Fehlerzustand.
- Berichtstext wird vor HTML-Darstellung escaped.
- Es existieren weder Inbox-Filter noch Archivaktionen.

## 8. Erzeugungsflow

- Einstieg: `Neuer Bericht` in der Doctor View.
- Der Nutzer bestätigt oder ändert `from` und `to`.
- Der Client validiert denselben 400-Tage-Vertrag wie die Edge Function.
- Der Write erfolgt explizit.
- Nach erfolgreichem Write wird die Current-Fläche aktualisiert.
- Ein Fehler des nachgelagerten UI-Refreshs ändert einen erfolgreichen
  Persistenzstatus nicht in einen Generierungsfehler.

## 9. Recovery und Betrieb

- Reports sind abgeleitete Arbeitsdokumente; Gesundheits-Rohdaten bleiben die
  Source of Truth.
- Ein Restore darf ohne Report starten. Der nächste explizite Create-Flow
  rekonstruiert den aktuellen Bericht.
- Es gibt keinen Monthly-Workflow und keine exklusiven Monthly-Secrets.
- Der technische Function-Name `midas-monthly-report` bleibt aus
  Kompatibilitätsgründen bestehen.

## 10. QA-Kernpunkte

- Auth-, JSON-, `month`- und Range-Grenzen.
- Wiener Tagesgrenze.
- Inklusive 400-Tage-Grenze.
- Build-before-write.
- Zero-State, Replacement und stabile ID/`created_at`.
- Update-Nichttreffer und einmaliger `23505`-Race.
- Interne `500`-Details bleiben aus dem Client.
- Genau ein produktiver `range_report`.
- Kein aktiver Monthly-, Scheduler-, Inbox- oder Archivpfad.
- R11: V1-/V2-/Mixed-/Empty-Reportcopy, JS-/TS-Parität, Fehlersanitization,
  Build-before-write und Legacy-Payloads. Keine Activity-/Report-DML im Test
  und kein Productimport vor R13.

## 11. Definition of Done

- Die Edge akzeptiert ausschließlich explizite Bereichsberichte.
- Ein neuer Bericht ersetzt den bisherigen Bericht sicher in-place.
- Doctor View zeigt Current oder einen verifizierten Zero-State.
- Runtime, SQL, QA und Recovery beschreiben denselben Singleton-Vertrag.
- Der R11-Read-Unterbau ist produktiv installiert, während Report-Consumer und
  sichtbare Copy bis R13 isoliert bleiben; bestehende Berichte wurden nicht
  neu erzeugt oder verändert.
