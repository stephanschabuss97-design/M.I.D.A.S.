<!-- markdownlint-disable -->

# MIDAS Historical QA Phases 2025-2026

> Historisches, nicht normatives QA-Archiv. Aktive Tests, Runbooks und
> Release-Gates liegen unter `docs/qa/`.

## Archivvertrag

- Archiviert am: `2026-07-21`
- Primärquelle: `docs/QA_CHECKS.md`
- Quellbereich A: Dateianfang bis unmittelbar vor
  `## v0.1.0 - Prototype`
- Quellbereich B: `## Diagnostics Layer Forwarding (Phase 4)` bis Dateiende
- Übernommene Blöcke: `40` H2- und `14` H3-Blöcke
- Statusmarkierungen, Reihenfolge, historische Links und vorhandene
  Encoding-Schäden bleiben als Quellenbefund unverändert erhalten.
- Aktuelle ausführbare Verträge: [QA-Einstieg](../../qa/README.md),
  [Release-Readiness](../../qa/release-readiness.md) und die
  [Runbook-Leseroute](../../qa/README.md#leseroute).

## Aktuelle Zuständigkeit

- Boot-, Fehler- und Resume-Abläufe: `CORE-*`, `RB-001`
- Health-Capture, Doctor View und Termine: `HCR-*`
- Assistant-, Voice- und Intent-Flächen: `AVI-*`
- Push und Trendpilot: `PT-*`, `BS-*`
- Medikation: `IM-*`
- Android/TWA/Widget: `AW-*`

Die Zuordnung ersetzt keine historischen Aussagen. Sie verweist lediglich auf
heutige Test-Owner, ohne alte PASS-/TODO-Zustände umzudeuten.

<!-- BEGIN SOURCE: docs/QA_CHECKS.md (historical phases) -->

## Phase P18 - Push and Medication Data Hygiene (Completed 2026-07-17)

**Scope:** Begrenzte technische Push-Daten, gehärteter historischer
Incident-Push-Zeitvertrag und `health_medications` als einzige aktive Quelle für
aktuelle Medikation in Profil, Hub und Range-Arztbericht. Klinische
`health_events`, Medication-Retention und bestehende Push-Fachregeln bleiben
unverändert.

### Static / Local Checks

- [x] `node --check app/modules/profile/index.js`
- [x] `node --check app/modules/hub/index.js`
- [x] `node --check service-worker.js`
- [x] `deno check backend/supabase/functions/midas-monthly-report/index.ts`
- [x] `deno check backend/supabase/functions/midas-incident-push/index.ts`
- [x] SQL- und Consumer-Scans bestätigen, dass aktive Profil-, Hub- und
  Report-Pfade `user_profile.medications` weder lesen noch schreiben.
- [x] SQL-Contract-Scan bestätigt strikte Push-Cutoffs, `SECURITY INVOKER`,
  fixierten `search_path`, App-ACL-Revoke, Advisory Lock und exakten Cron-
  Vertrag.
- [x] `git diff --check` und Roadmap-Markdownlint sind grün. Die bekannten
  globalen Markdownlint-Altschulden in `QA_CHECKS.md` und `sql/HOW_TO.md`
  wurden nicht durch diese Phase erzeugt oder ausgeweitet.
- [x] Optionaler CodeRabbit-Review erfolgt erst nach lokal grünem Stand;
  Findings werden vor einer Änderung bewertet und betroffene Checks danach
  wiederholt.

### Disposable Push-Hygiene / Idempotenz

- [x] Relevanter Fresh-Setup läuft in der dokumentierten SQL-Reihenfolge durch.
- [x] `18_Push_Data_Hygiene.sql` läuft zweimal fehlerfrei und hinterlässt genau
  einen Job `midas-push-hygiene-weekly`.
- [x] Job ist aktiv, gehört `postgres`, verwendet die aktuelle Datenbank,
  Schedule `45 3 * * 0` und den exakt freigegebenen Function-Command.
- [x] Delivery-Fixtures `-91`, `-90`, heute und Zukunft beweisen: Nur `-91` und
  älter werden gelöscht.
- [x] Alte deaktivierte, junge deaktivierte, aktive und reaktivierte
  Subscription beweisen: Nur alte weiterhin deaktivierte Zeilen werden
  gelöscht.
- [x] Exakt 90 Tage alte deaktivierte Subscription bleibt wegen des strikten
  `<`-Prädikats erhalten.
- [x] Reaktivierung vor und nach einem simulierten Cleanup wird in getrennten
  Zustandsfolgen geprüft; keine aktive Subscription bleibt im Löschset.
- [x] Zukunfts-Deliveries bleiben erhalten und werden im Cleanup-Ergebnis
  diagnostisch gezählt.
- [x] Partieller Index auf `push_subscriptions(updated_at)` gilt ausschließlich
  für `disabled = true`; der vorhandene Delivery-`day`-Index bleibt erhalten.

### ACL / Owner / Cron / Concurrency

- [x] `PUBLIC`, `anon`, `authenticated` und `service_role` können
  `push_data_hygiene_cleanup_internal()` nicht ausführen.
- [x] Function-Owner und Jobowner sind `postgres`; der erwartete Owner kann den
  Cleanup ausführen.
- [x] Fehlender, inaktiver oder bei Datenbank, Schedule oder Command driftender
  Job beendet den Cleanup vor jeder Löschwirkung.
- [x] Fremder Owner und mehrere gleichnamige Jobs werden bei Provisionierung
  geschlossen abgelehnt.
- [x] Gehaltener Advisory Lock `(1296647233, 1347769160)` lässt einen parallelen
  Cleanup mit SQLSTATE `55P03` und ohne Löschwirkung abbrechen.
- [x] Nur abgeschlossene eigene Cron-Laufdetails älter als 90 Tage werden
  gelöscht; fremde, laufende, nicht abgeschlossene und exakt 90 Tage alte
  Laufdetails bleiben.

### Incident-Push Time Guard

- [x] Regulärer aktueller Dry-Run bleibt kompatibel.
- [x] Historischer Dry-Run mit explizitem `now` bleibt erlaubt.
- [x] Historischer Non-Dry-Run wird mit HTTP `400` vor User-Auflösung,
  fachlichen Reads, Push-Send und Delivery-/Subscription-Write abgewiesen.
- [x] Incident- und Diagnosemodus verwenden denselben Override-Guard.
- [x] GitHub-Workflow-Payload ohne `now` bleibt mit Scheduler- und manuellem
  Aufruf kompatibel.
- [x] Dauerhafte Deno-Regressionstests decken Diagnose mit Scheduler-Trigger,
  `now` ohne `dry_run`, `now` mit `dry_run: true` und den Default-Pfad ohne
  `now` ab.
- [x] Remote-Smokes bleiben auf Dry-Run oder garantierte Pre-Read-Ablehnung
  begrenzt; kein erfolgreicher Test-Push ohne separates Owner-Gate.

### Medication Source of Truth / Report

- [x] Profil unterscheidet `loading`, erfolgreiche Leere, erfolgreiche Daten und
  Read-Fehler; alle Medication-Zustände bleiben read-only.
- [x] Null, ein und mehrere aktive Medikamente werden korrekt projiziert;
  inaktive Medikamente bleiben ausgeschlossen.
- [x] Aktuelle Slots und Mengen größer eins erscheinen; beendete und zukünftige
  Slots werden nicht als aktueller Plan ausgegeben.
- [x] Aktives Medikament ohne aktuellen Slot bleibt als Medikament sichtbar.
- [x] Profil-Save enthält keinen Legacy-Medication-Write und erhält die
  strukturierte Projektion direkt nach `profile:changed`.
- [x] Hub reicht erfolgreiche leere Medication als `[]` weiter, lässt einen
  nicht verfügbaren Medication-Kontext dagegen aus.
- [x] Erfolgreicher Medication-Snapshot ohne vorhandene Profilzeile erzeugt
  weder im Profil noch im Hub einen erfundenen Raucherstatus.
- [x] Range-Arztbericht verwendet aktive Medikamente und die am Wiener
  Berichtstag gültigen Slots mit österreichischer, lesbarer Copy.
- [x] Wiener Berichtstag bleibt nahe einer UTC-/Wien-Mitternachtsgrenze
  innerhalb des gesamten Requests konsistent.
- [x] Null aktive Medication-IDs werden ohne leeren `.in(...)`-Slot-Read als
  gültige leere Projektion behandelt.
- [x] Cross-User-Reads liefern keine Medication-Daten.
- [x] Medication- oder Slot-Query-Fehler erzeugt weder Teilbericht noch
  `health_events`-Write.
- [x] Bestehende produktive Legacy-Spalte bleibt während des Rollouts physisch
  vorhanden, wird von neuen aktiven Consumern aber nicht verwendet.

### Browser / PWA / Cache Regression

- [x] Profil und Medication-Manager zeigen denselben aktiven Stand.
- [x] Assistant- und Vision-Kontext bleiben mit erfolgreicher Projektion
  kompatibel, ohne Legacy-Fallback wieder einzuführen.
- [x] Aktiver Root-Service-Worker installiert Cache-Version `v6`; Update-Banner,
  Anwenden, Controller-Wechsel und Reload liefern den neuen Profil-/Hub-Vertrag.
- [x] `public/sw/service-worker.js` wird weiterhin nicht registriert.
- [x] Alter gecachter Client bricht wegen der vorläufig erhaltenen Legacy-Spalte
  nicht hart ab.

### Productive Owner Gates

- [x] Read-only Preflight nennt exakte löschbare Delivery-/Subscription-Zahlen
  und weist alle aktiven Subscriptions außerhalb des Löschsets nach.
- [x] Cron-Jobs, Rollen, Function-ACL, PostgreSQL-Version und Advisor-Baseline
  wurden vor produktiver Wirkung geprüft.
- [x] `midas-incident-push` wurde erst nach Owner-Freigabe deployt und der
  Zeitguard remote ohne Push-/Write-Wirkung bestätigt.
- [x] `midas-monthly-report`-Remote-Stand und der freigegebene Range-Bericht-
  Smoke bestätigen die strukturierte aktuelle Medikation.
- [x] DDL-, Cron-, Lösch- und Rollback-Wirkung von
  `18_Push_Data_Hygiene.sql` wurden vor Ausführung erklärt.
- [x] Push-Hygiene-SQL wurde erst nach ausdrücklicher Owner-Freigabe produktiv
  provisioniert und vollständig post-verifiziert.
- [x] Erster manueller Cleanup erfolgte erst nach separater Freigabe; Vorher-/
  Nachher-Zähler und erhaltene aktive Subscriptions sind dokumentiert.
- [x] Security und Performance Advisor wurden nach produktivem SQL erneut
  geprüft.

### Final Documentation Gate

- [x] Module Overviews werden erst nach grünem Runtime-Nachweis auf den
  produktiven Zielvertrag aktualisiert.
- [x] `sql/HOW_TO.md`, QA, Roadmap und finale Module Overviews beschreiben
  dieselben Ausführungsgrenzen und dieselbe Source of Truth.
- [x] `DH-F14` bleibt als separates Push-Reliability-Thema sichtbar; diese Phase
  behauptet keine exakt-einmalige Push-Zustellung.

---

## Phase M-DH - Medication Data Hygiene (Completed 2026-07-12)

**Scope:** Vorbereitung des schlanken Medication-Datenmodells ohne dauerhaften
Stock-Log, mit exakt invertierbarem Confirm/Undo, einmaligem Clean Start und
einem rollenden Kalenderjahr Slot-Events. Produktiver Stichtag ist der
`2026-07-12`.

### Static / Local Checks

- [x] `git diff --check` fuer SQL, Medication Overview, Future Notes, QA und
  Roadmap final bestaetigen.
- [x] Kein Stock-Log-Verweis in kanonischem/operativem SQL, Grants oder
  Runtime-Code; nur das einmalige Transition-SQL darf ihn referenzieren.
- [x] Schedule-Upsert, Confirm, Undo, Adjust, Set und Reset sind zwischen
  Master- und Transition-SQL semantisch identisch.
- [x] Fresh-Bootstrap `12 + Medication-Grants aus 16 + 17` und fehlerfreier
  zweiter Lauf auf disposable Supabase pruefen.
- [x] Erfolgreiche Transition sowie Owner-, Rebase- und Lock-Timeout-Abbruch
  jeweils ohne unerwartete Teilwirkung pruefen.

### Cutover / Data Contract

- [x] Sicherheits-Snapshot fuer Medication-Stammdaten, Plaene und Bestaende
  unmittelbar vor Cutover erstellen.
- [x] Cutover vor erstem Confirm, vor `10:00 Europe/Vienna` und vor jeder
  Medication-Push-Zustellung des Stichtags ausfuehren.
- [x] Genau einen gemeinsamen Medication-Owner und kollisionsfreien Rebase
  direkt vor Ausfuehrung bestaetigen.
- [x] Transition, Explicit Grants und Retention-SQL in der reviewten Reihenfolge
  erfolgreich ausfuehren.
- [x] `health_medication_stock_log` fehlt; drei Medication-Tabellen, RLS und
  Grants bleiben intakt.
- [x] Medication-Stammdaten und zukuenftige Plaene bleiben erhalten; aktuelle
  Plaene beginnen am dokumentierten Stichtag.
- [x] Alte Slot-Events und Low-Stock-Acknowledgements sind bereinigt.
- [x] Erhaltene Bestaende gegen die realen Packungen geprueft; nur bei einer
  Abweichung waere ein manuelles Setzen erforderlich gewesen.

### RPC / Runtime Regression

- [x] Confirm bei ausreichendem, niedrigem und leerem Bestand speichert die
  richtige dokumentierte Dosis und `stock_decrement_qty`.
- [x] Doppel-Confirm bleibt No-op; Undo stellt exakt die gespeicherte
  Bestandsreduktion wieder her.
- [x] Undo nach zwischenzeitlichem Set auf den maximalen Integer-Bestand
  bricht kontrolliert mit Range-Fehler und ohne Event-Loeschung ab.
- [x] Adjust unter `0` und Integer-Ueberlauf werden kontrolliert abgewiesen;
  Set auf denselben Bestand bleibt erfolgreicher No-op.
- [x] Restock-/Set-RPC, Medication-TAB, Intake und Abschnitts-Confirm
  funktionieren ohne Stock-Log; Voice und Low-Stock besitzen laut
  Consumer-Review keine Stock-Log-Abhaengigkeit.
- [x] Android und Realtime spiegeln den produktiven Slot-Event ohne weiteren
  Eingriff korrekt.
- [x] Incident Push behaelt bestehende Schwellen und erkennt offene sowie
  bestaetigte Tagesabschnitte unveraendert.
- [x] Reset liefert nur `deleted_slot_events`, `deleted_schedule_slots` und
  `deleted_medications`.

### Retention / Security

- [x] Cutoff-Grenzfall: Tag vor Cutoff wird geloescht, Cutoff-Tag bleibt.
- [x] Aktuelle/zukuenftige Slots bleiben; alte beendete Slots verschwinden erst
  nach ihren Events.
- [x] Genau ein aktiver Job `midas-medication-retention-daily` laeuft taeglich
  um `03:15 UTC`.
- [x] Retention-Funktion besitzt kein Execute fuer `PUBLIC`, `anon`,
  `authenticated` oder `service_role`.
- [x] Nur abgeschlossene Laufdetails der eigenen aktuellen Job-ID aelter als
  90 Tage sind bereinigbar.
- [x] Supabase Security Advisor, RLS und Explicit Grants nach Cutover pruefen.

### Final Documentation Gate

- [x] Medication Overview vom Pending- auf den produktiven Zielvertrag
  umstellen.
- [x] Future Notes nach finalem Review als ersetzt markieren oder archivieren.
- [x] Produktiven Stichtag, Ergebniszaehler, Cron-Status und Runtime-Smokes in
  Roadmap und QA dokumentieren.

---

## Phase S18 - Supabase Explicit Data API Grants (2026-07-04)

**Scope:** Explizite Supabase Data API Grants fuer bestehende MIDAS-`public`-
Tabellen, Views und Data-API-RPCs. Ziel ist ein reviewbarer Rollenvertrag ohne
anonyme MIDAS-Objekt-Exposition und ohne RLS-Lockerung.

**Static / Local Checks**

- [x] `git diff --check` fuer `sql/16_Explicit_Grants.sql`, `sql/HOW_TO.md`
  und Roadmap.
- [x] Alle aktiven Tabellen aus `sql/` sind in `sql/16_Explicit_Grants.sql`
  abgedeckt.
- [x] Alle aktiven Views aus `sql/` sind in `sql/16_Explicit_Grants.sql`
  abgedeckt.
- [x] Alle Data-API-RPCs sind mit `grant execute` / `revoke all`-Entscheidung
  abgedeckt.
- [x] Keine `grant ... to anon`.
- [x] Keine `grant ... to public`.
- [x] Keine `grant all`.
- [x] Keine `grant ... on all tables/functions in schema public`.
- [x] Keine `drop`, `truncate`, `delete from`, RLS-Disable- oder
  Policy-Lockerung im Grant-SQL.

**Role Contract**

- [x] `anon` hat keine Table-/View-Grants und kein `upsert_intake`-Execute.
- [x] `authenticated` hat nur die fuer PWA, Android, Realtime und User-RPCs
  benoetigten Data-API-Rechte unter bestehender RLS-/Policy-Grenze.
- [x] `service_role` ist fuer Edge-, Scheduler-, Report- und Admin-Pfade
  explizit abgedeckt.
- [x] `trendpilot_state` bleibt service-role-only.
- [x] Realtime-relevante Tabellen behalten `authenticated select`.

**Supabase Live / Dashboard**

- [x] CodeRabbit-Review ohne Findings.
- [x] `sql/16_Explicit_Grants.sql` wurde im Supabase SQL Editor erfolgreich
  produktiv ausgefuehrt.
- [x] Security Advisor nach Live-SQL: `pg_graphql_anon_table_exposed = 0`.
- [x] Security Advisor nach Live-SQL: `pg_graphql_authenticated_table_exposed`
  bleibt erwartbar fuer authentifizierte MIDAS-Data-API-Pfade.
- [x] Security Advisor nach Live-SQL: `auth_leaked_password_protection` bleibt
  separates Auth-Dashboard-Hygiene-Thema.
- [ ] Optionaler Data-API-Smoke mit echter Session bleibt user-gated und wird
  nur bei Bedarf nachgezogen.

**Regression / Guardrails**

- [x] Keine App-, Android-, Backend- oder Edge-Function-Logik geaendert.
- [x] Bestehende Cleanup-/Transition-/Legacy-SQLs wurden nicht rueckwirkend
  umgebaut.
- [x] GraphQL wird von MIDAS aktuell nicht aktiv genutzt; GraphQL-Deaktivierung
  oder Advisor-Muting bleibt separates Hygiene-Thema.
- [x] Grants ersetzen keine RLS-Policies.

---

## Phase A10 - Android Widget V2.3 Appointments Context (2026-07-02)

**Scope:** Android Widget V2.3 mit optionaler Termin-Kontextzeile und 7-Tage-Ticker-Bar. Das Widget bleibt read-only, zeigt nur den naechsten geplanten Termin und fuehrt keine Kalender-, Reminder-, Push-, Capture- oder Alarm-Logik ein.

**Static / Local Checks**

- [x] `git diff --check`
- [x] aus `android/`: `.\gradlew.bat :app:compileDebugKotlin`
- [x] aus `android/`: `.\gradlew.bat :app:assembleDebug`
- [x] aus `android/`: `.\gradlew.bat :app:testDebugUnitTest` (gruen, `NO-SOURCE`)
- [x] aus `android/`: `.\gradlew.bat :app:lintDebug`
- [x] `node --check app/modules/hub/index.js`
- [x] Debug-APK gebaut: `android/app/build/outputs/apk/debug/app-debug.apk`

**Widget Contract**

- [x] `DailyWidgetState` enthaelt `appointmentSummary`.
- [x] Alte Snapshots ohne `appointmentSummary` laden neutral ohne Terminzeile.
- [x] WebView-/Legacy-Saves ohne Appointment-Feld erhalten bestehenden Termin-Kontext fuer denselben Tag.
- [x] Android liest den naechsten Termin nativ aus `appointments_v2`.
- [x] Query-Vertrag: eigene `user_id`, `status = scheduled`, `start_at >= now`, `order=start_at.asc`, `limit=1`.
- [x] Termin-Zeitstempel werden robust als Instant oder Offset-Date-Time geparst.
- [x] Ohne kommenden Termin wird die Terminzeile ausgeblendet.
- [x] Mit kommendem Termin zeigt das Widget `Titel, Wochentag dd.MM. HH:mm`, z. B. `Nephrologie, Mi 22.07. 10:30`.
- [x] Nach Terminstart erfolgt der Wechsel auf den Folgetermin oder das Ausblenden refresh-basiert.

**Ticker / Live Smoke**

- [x] Ticker-Bar-Fenster ist 7 Tage vor Terminstart.
- [x] Ticker-Bar verschwindet zum Startzeitpunkt beim naechsten UI-Refresh.
- [x] Live-Server-Smoke 2026-07-02: Termin am 09.07.2026 angelegt; Ticker-Bar erscheint.

**Runtime / Device Smoke**

- [x] APK wurde gebaut und fuer den Android-Test bereitgestellt.
- [x] Homescreen-Test zeigte die vierte Terminzeile mit naechstem Termin.
- [x] Widget bleibt ruhig lesbar und ohne Termin-CRUD.

**Regression / Guardrails**

- [x] Widget bleibt read-only.
- [x] Keine Terminliste im Widget.
- [x] Kein Ort, keine Notizen und keine Termindetails im Widget.
- [x] Keine Termin-Anlage, kein Done/Reset und kein Delete im Widget.
- [x] Kein Push, kein Reminder, kein FCM, kein AlarmManager und kein Exact Alarm.
- [x] Kein minutengenauer Termin-Umschalt-Timer.
- [x] Browser/PWA bleibt Reminder-Push-Master.
- [x] Ticker-Bar bleibt UI-Kontext, kein Incident- oder Push-Kanal.

---

## Phase A9 - Android Widget V2.2 Blood Pressure Context (2026-07-01)

**Scope:** Android Widget V2.2 mit passiver Blutdruck-Kontextzeile. Das Widget bleibt read-only, zeigt keine BP-Rohwerte und fuehrt keine Reminder-, Push-, Capture- oder Bewertungslogik ein.

**Static / Local Checks**

- [x] `git diff --check`
- [x] aus `android/`: `.\gradlew.bat :app:compileDebugKotlin`
- [x] aus `android/`: `.\gradlew.bat :app:assembleDebug`
- [x] aus `android/`: `.\gradlew.bat :app:testDebugUnitTest` (gruen, `NO-SOURCE`)
- [x] aus `android/`: `.\gradlew.bat :app:lintDebug`
- [x] Extrahierter `WIDGET_SYNC_SCRIPT` mit `node --check`
- [x] Debug-APK gebaut: `android/app/build/outputs/apk/debug/app-debug.apk`

**Widget Contract**

- [x] `DailyWidgetState` enthaelt `bloodPressureStatus`.
- [x] Alte Snapshots ohne `bloodPressureStatus` laden neutral.
- [x] Fehlender kompletter Snapshot zeigt fuer die BP-Zeile `Lade...`, nicht `Alles ruhig`.
- [x] `health_events` mit `type = bp` und heutigem `ctx` ist die Datenquelle.
- [x] `Morgen` / `M` / `morning` und `Abend` / `A` / `evening` werden toleriert.
- [x] Morgenmessung vorhanden und Abendmessung fehlt -> `BD Abend offen`.
- [x] Alle anderen vorhandenen Snapshot-Faelle -> `Alles ruhig`.
- [x] `Alles ruhig` ist nur Widget-Neutralstatus, keine medizinische Entwarnung.

**Runtime / Device Smoke**

- [x] APK wurde am Android-Geraet installiert.
- [x] Widget synchronisiert ordentlich.
- [x] Homescreen-Darstellung mit drei Zeilen ist akzeptiert.
- [x] V2.2-Logiken laufen wie gewuenscht.

**Regression / Guardrails**

- [x] Widget bleibt read-only.
- [x] Keine BP-Rohwerte im Widget.
- [x] Keine BP-Schwellen, Trendpilot-Hinweise oder medizinische Bewertung.
- [x] Keine BP-Eingabe oder BP-Bestaetigung im Widget.
- [x] Keine Terminlogik.
- [x] Keine Push-, Reminder-, FCM- oder AlarmManager-Aenderung.
- [x] Keine SQL-/RLS-/Backend-/Edge-Function-Aenderung.
- [x] Browser/PWA bleibt Reminder-Push-Master.

---

## Phase P17 - Incident Push Edge Reliability Hardening (2026-06-04)

**Scope:** Edge Function `midas-incident-push` nach Review-Findings: Request-Validation, VAPID fail-fast, Deno-Hygiene, fail-closed Zielnutzer, Remote-Health-Freshness, Partial-Delivery-Diagnose und Push-Doku-Sync.

**Static / Local Checks**

- [x] `deno check backend/supabase/functions/midas-incident-push/index.ts`
- [x] `deno lint backend/supabase/functions/midas-incident-push/index.ts`
- [x] `node --check app/modules/push/index.js`
- [x] `node --check app/modules/incidents/index.js`
- [x] `git diff --check`
- [x] Ungueltiges JSON wird mit 400 und klarer Fehlermeldung abgelehnt.
- [x] Request-Body muss Object sein; Array/String/Number/Null werden abgelehnt.
- [x] `trigger`, `mode`, `window`, `dry_run`, `user_id`, `now` werden runtime-validiert.
- [x] Invalides `now` wie `2026-02-31` wird nicht durch JS-Date-Rolling akzeptiert.
- [x] `VAPID_PUBLIC_KEY` und `VAPID_PRIVATE_KEY` werden fail-fast als Pflicht-Env geprueft.
- [x] `functions-js` Import ist versioniert; keine `@ts-ignore` Import-Workarounds.
- [x] Zielnutzer-Aufloesung ist fail-closed ueber `user_id` oder `INCIDENTS_USER_ID`; kein All-User-Fallback.
- [x] Remote-Health fuer lokale Suppression braucht echten Remote-Erfolg der aktuellen Subscription, keinen spaeteren Failure, Failure-Counter 0 und maximal 7 Tage Alter.
- [x] Diagnose-Push schaltet lokale Suppression weiter nicht frei.
- [x] Partial Delivery Response nutzt `acceptedSubscriptions`/`failedSubscriptions` mit sicheren Metadaten, keine Roh-Endpunkte/Keys.
- [x] Push Overview dokumentiert 26 regulaere Scheduler-Runs pro Tag und den finalen Health-/Delivery-Vertrag.

**Deploy / Runtime**

- [x] Supabase Deploy nach Freigabe: `midas-incident-push` ACTIVE, Version 16.
- [x] Vor Deploy/Smoke remote sicherstellen: `INCIDENTS_USER_ID`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` als Function Secrets vorhanden oder Request mit `user_id`.
- [x] Remote Dry-Run nach Deploy: `ok=true`, `dryRun=true`, `status=no-incidents`, 5 Skip-Gruende.
- [x] Manueller Diagnose-Push nach Freigabe: `status=diagnostic-sent`, `sentSubscriptions=3`, `failedSubscriptions=0`.
- [x] GitHub Workflow-Smoke nach Freigabe: Run `26954859805`, Ergebnis `success`, `mode=diagnostic`, `sentSubscriptions=3`, `failedSubscriptions=0`.
- [x] Zielgeraet-Smoke Desktop und Android: sichtbare Notification userseitig erfolgreich bestaetigt.

**Regression / Contract**

- [x] Keine Medication-/BP-Schwellen geaendert.
- [x] Keine neue Reminder-Kette.
- [x] Keine SQL-/RLS-/Schema-Aenderung.
- [x] Keine neue Touchlog-/Profil-/Hub-UI.
- [x] Diagnose bleibt getrennt von fachlichem Dedupe.
- [x] Web-Push-Annahme wird nicht als garantierte sichtbare Zielgeraet-Zustellung dokumentiert.
- [x] Per-device ACK/native Android/BP-Reminder bleibt S7/Future-Scope.

---

## Phase P16 - Monthly Report Edge Contract Hardening (2026-06-02)

**Scope:** Edge Function `midas-monthly-report` nach Review-Findings: Auth-Vertrag, Runtime-Validation, Date-/Month-Validation, Report-Anker, Payload-Zeitstempel und Activity-Copy.

**Static / Local Checks**

- [x] `deno check backend/supabase/functions/midas-monthly-report/index.ts`
- [x] `node --check app/supabase/api/system-comments.js`
- [x] `node --check app/supabase/api/reports.js`
- [x] `node --check app/modules/doctor-stack/reports/index.js`
- [x] `git diff --check` fuer Edge Function, Client-Fallback, Reports Overview, QA und Roadmap.
- [x] Kein unauthentifizierter `MONTHLY_REPORT_USER_ID`-Fallback.
- [x] Service-Role-Pfad nur fuer `monthly_report`.
- [x] User-JWT-Pfad bleibt fuer manuelle Reports.
- [x] `report_type` runtime-validiert und auf `monthly_report` / `range_report` begrenzt.
- [x] Leerer Request-Body bleibt Monthly-Default.
- [x] Ungueltiges JSON wird mit 400 und klarer Fehlermeldung abgelehnt.
- [x] `from/to/month` werden strikt validiert; kein stilles JS-Date-Rolling.
- [x] Monthly ignoriert `from/to`; Range ignoriert `month`.
- [x] Report-Anker `ts` wird bei Insert und Monthly-Update gesetzt.
- [x] `health_events.day` bleibt generated aus `ts`.
- [x] Payload enthaelt `generated_at` und `created_at`.
- [x] Client liest `created_at || generated_at || row.ts`.
- [x] Activity-Copy ohne doppelte `Durchschnitt`-Form.

**Deploy / Runtime**

- [x] Supabase Deploy nach Freigabe: `midas-monthly-report` ACTIVE, Version 45.
- [x] Nicht-schreibender Invalid-JSON-Smoke nach Deploy: HTTP 400 mit `Ungueltiges JSON im Request-Body.`
- [ ] Remote Monthly Scheduler-Pfad nach Deploy manuell oder via naechstem natuerlichen Workflow-Run pruefen.
- [ ] Remote Range-Report mit User-JWT nach Deploy bei Bedarf manuell pruefen.
- [ ] GitHub Workflow-Smoke nach Deploy nur nach Freigabe ausfuehren.

**Regression / Contract**

- [x] Monthly-Report aktualisiert denselben Monat idempotent ueber `payload.subtype` + `payload.month`.
- [x] Range-Report bleibt Insert-per-run; keine automatische Dedupe.
- [x] Report-Zeitraum bleibt in `payload.period`.
- [x] Report-Erzeugungszeit bleibt im Payload, nicht im `ts`-Anker.
- [x] Inbox-Filter nutzt den generated `day`-Anker.
- [x] Keine SQL-/RLS-/Schema-Aenderung.
- [x] Keine neue Diagnose-, Therapie- oder Alert-Logik.

---

## Phase P15 - Trendpilot Review Findings (2026-06-01)

**Scope:** Edge Function `midas-trendpilot` nach Review-Findings: Response/Persistenzvertrag, BP-Gates, Lab-Gate, Date-Validation, ACK-Fortsetzung und Runtime-Smokes.

**Static / Local Checks**

- [x] `deno check backend/supabase/functions/midas-trendpilot/index.ts`
- [x] `git diff --check` fuer Edge Function, Dev Environment, Trendpilot Overview, QA und Roadmap.
- [x] Non-Dry-Run-Response basiert auf finalem Upsert-Stand (`singleUpsert.withIds` + `combinedUpsert.withIds`).
- [x] Dry-Run schreibt nicht und liefert context-angereicherte Events im Response-Pfad.
- [x] BP-Critical nutzt absolute Schwellen sowie Delta-Critical mit Mindestniveau.
- [x] BP-Wochen werden nur ab mindestens 2 validen Samples gewertet.
- [x] Lab hat ein evaluator-spezifisches Gate: mindestens 2 Wochen und mindestens 2 Samples, kein globales 6-Wochen-Handler-Gate.
- [x] Invalid-Date-Inputs wie `2026-02-31` werden abgelehnt.
- [x] ACK bleibt bei Upsert erhalten; echte Fortsetzung nach ACK setzt `continued_after_ack`.

**Deploy / Runtime**

- [x] Supabase Deploy nach Freigabe: `midas-trendpilot` ACTIVE, Version 20.
- [x] Remote Dry-Run nach Deploy: `ok=true`, `dry_run=true`, `written_count=0`.
- [x] Remote Invalid-Date-Smoke: `2026-02-31` liefert HTTP 400 mit Range-Validation.
- [x] GitHub Workflow-Smoke `Trendpilot Weekly` nach Deploy: Run `26778853880`, Ergebnis `success`.
- [x] Workflow-Log zeigt Edge-Function-Response `ok:true`, `trigger:"scheduler"`, `written:[]`.

**Regression / Contract**

- [x] Scheduler-Run bleibt service-role-faehig und user-gebunden.
- [x] Non-Dry-Run bleibt idempotent ueber `user_id + type + window_from + severity`.
- [x] `payload.context` bleibt nur fuer warning/critical.
- [x] `info` bleibt popup-frei.
- [x] Combined-Events referenzieren weiterhin Single-Event-IDs.
- [x] ACK-Dialog bleibt modal und schreibt nur bei expliziter Kenntnisnahme.
- [x] Arzt-Block und Chart-Bands lesen weiterhin aus `trendpilot_events`.
- [x] Keine BP-/Body-/Lab-Capture-Regression durch SQL, UI oder Intake-Pfade.

---

## Phase APT-UI - Appointments UI Polish (2026-05-23)

**Scope:** Kompakte MIDAS-Agenda fuer das Appointments-Panel, ohne Kalender-App, Reminder, Push, Voice, SQL/RLS oder neue Dependencies.

**Static / Local Checks**

- [x] `node --check app/modules/appointments/index.js`
- [x] `git diff --check -- index.html app/modules/appointments/index.js app/styles/hub.css docs/MIDAS Appointments UI Polish Roadmap.md`
- [x] Scope-Scan: keine SQL-/RLS-/Backend-/Push-/Voice-/Kalenderintegration und keine neue Dependency.
- [x] Copy-/Encoding-Scan fuer beruehrte Appointments-Dateien ohne neue Mojibake-Artefakte.

**Browser / Device Smokes**

- [x] Lokaler Static Server auf `http://127.0.0.1:8765/index.html` liefert HTTP 200.
- [x] Playwright Mobile 390x844: Offen-Tab rendert kompakte Cards, Done-Tab rendert erledigte Cards.
- [x] Playwright Mobile: Summary zeigt `x offen - y gesamt` plus optional `Naechster: Mo., 15.06.2026 - 07:00`.
- [x] Playwright Mobile: kein `Ort folgt`, kein `Status: Geplant` in den Cards.
- [x] Playwright Mobile: `Erledigt`/`Zuruecksetzen` ist Primaeraktion, `Loeschen` bleibt sekundaer.
- [x] Playwright Mobile: `Zuruecksetzen` im Done-Tab verschiebt eine erledigte Card zurueck nach Offen.
- [x] Playwright Desktop 1280x900: dreispaltige Card-Liste ohne Panel-Ueberbreite.
- [x] Stubbed CRUD-Smoke: Save, Delete und Reset aktualisieren Listen und Formularzustand.

**Manual / Live**

- [x] Live-Server-Pruefung durch Stephan: Appointments-UI sieht gut aus.
- [ ] Optionaler echter Supabase/Auth-Smoke bei Bedarf: Save/Done/Delete mit Live-Session nachziehen.

**Regression / Contract**

- [x] Tabs `Offen`, `Erledigt`, `Neu` funktionieren.
- [x] Datum im Panel folgt `dd.mm.yyyy`, Uhrzeit `HH:mm`.
- [x] `getUpcoming(2)` liefert weiter kommende offene Termine.
- [x] `appointments:changed` bleibt an den bestehenden Mutation-Pfaden.
- [x] Kein Kalender-Grid, keine Reminder- oder Push-Kette.
- [x] `.hub-panel-scroll` bleibt der einzige Scrollcontainer im Hub-Panel.
- [x] Residual: Mobile Document-Overflow von 4px wurde Nicht-Appointments-Elementen (`.hub-orb-bg`, `#loginOverlay`) zugeordnet.

---

## Phase P13 - Backend Edge Functions Deno Check Sweep (2026-05-01)

**Scope:** Statischer Deno-/Type-/Syntax-Sweep der produktiven Supabase Edge Functions im versionierten Backend-Source unter `backend/supabase/functions`.

**Static / Local Checks**

- [x] `deno check backend/supabase/functions/midas-tts/index.ts`
- [x] `deno check backend/supabase/functions/midas-transcribe/index.ts`
- [x] `deno check backend/supabase/functions/midas-vision/index.ts`
- [x] `deno check backend/supabase/functions/midas-assistant/index.ts`
- [x] `deno check backend/supabase/functions/midas-protein-targets/index.ts`
- [x] `deno check backend/supabase/functions/midas-incident-push/index.ts`
- [x] `deno check backend/supabase/functions/midas-monthly-report/index.ts`
- [x] `deno check backend/supabase/functions/midas-trendpilot/index.ts`

**Contract Review**

- [x] Keine offenen Type-/Syntax-/Import-Findings in produktiven `index.ts`-Dateien.
- [x] Keine verbleibenden `@ts-expect-error`-Direktiven in produktiven Edge-Function-Dateien.
- [x] Keine SQL-/RLS-/Datenmodell-Aenderung.
- [x] Keine Frontend-Aenderung.
- [x] Keine medizinische Schwellen-, Formel-, Dedupe-, Prompt-, Report-, Trendpilot- oder Push-Fachlogik als Teil des Sweeps geaendert.
- [x] Secret-/PII-Review: Env-Var-Namen und Authorization-Nutzung sind erwarteter Codevertrag; keine Secret-Werte wurden dokumentiert oder ausgegeben.

**Deploy / Runtime**

- [x] Deploy-Stand dokumentiert: `midas-transcribe`, `midas-vision`, `midas-protein-targets`, `midas-monthly-report`, `midas-trendpilot` wurden nach S4-Fixes deployed.
- [x] Kein weiterer Deploy aus S5/S6 notwendig.
- [x] Runtime-Smokes fuer OpenAI-/Protein-/Report-/Trendpilot-Schreibpfade bleiben optional und user-gated.
- [x] Backend-Source liegt versioniert im MIDAS-Git-Repo unter `backend/supabase/...`; der fruehere externe Workspace bleibt nur Import-/Backup-Kontext.

---

## Phase P12 - Touchlog Module & Push Service Extraction (2026-04-30)

**Scope:** UI-freier Refaktor: Touchlog als eigenes Code-Modul, Push-Service als Owner, Profile push-frei, Incidents konsumiert Push ueber `AppModules.push`.

**Static / Local Checks**

- [x] `node --check app/modules/push/index.js`
- [x] `node --check app/modules/profile/index.js`
- [x] `node --check app/modules/incidents/index.js`
- [x] `node --check app/modules/touchlog/index.js`
- [x] `node --check app/diagnostics/devtools.js`
- [x] `node --check app/modules/assistant-stack/voice/index.js`
- [x] `node --check app/modules/hub/index.js`
- [x] `node --check app/core/diag.js`
- [x] `node --check app/core/feedback.js`
- [x] `git diff --check`
- [x] Neues Touchlog-Modul separat auf trailing whitespace geprueft.

**Module Boundary**

- [x] `AppModules.push` besitzt Browser-Subscription, Subscription-Upsert/Delete/Read, Push-Kontext, Routing-Status, Remote-Health und Diagnose-Health.
- [x] `AppModules.touchlog` besitzt die sichtbare Maintenance-Surface und ruft Push nur ueber `AppModules.push`.
- [x] `app/diagnostics/devtools.js` ist Thin Bootstrap fuer `AppModules.touchlog.init()`.
- [x] `AppModules.profile` besitzt keine Push-Service-API fuer Opt-in, Opt-out, Routing-Health oder lokale Suppression.
- [x] `AppModules.incidents` konsumiert lokale Suppression ueber `AppModules.push`, nicht ueber Profile.

**UI-Free Contract**

- [x] Keine CSS-/Layout-Aenderung.
- [x] Sichtbare Push-Wartung bleibt im Touchlog.
- [x] Profil bleibt sichtbar push-frei.
- [x] `index.html` erhaelt nur die notwendige Script-Einbindung fuer `app/modules/touchlog/index.js`.
- [x] Keine Service-Worker-, SQL-, Edge-, GitHub-Actions- oder Android-Native-Aenderung.

**Browser / Device Smokes**

- [x] Browser/PWA laedt ohne neue Modulfehler.
- [x] Touchlog oeffnet und schliesst.
- [x] Touchlog-Log kann lokal geleert werden.
- [x] Lokale Modi Sound, Haptik, No Cache und Assistant sind im Touchlog bedienbar.
- [x] Push aktivieren/deaktivieren bleibt im Touchlog erreichbar.
- [x] Profil oeffnet ohne Push-Section, Push-Buttons oder Push-Kurzstatus.
- [x] Android-WebView bleibt als nicht verlaesslicher Reminder-Push-Kanal abgegrenzt.
- [ ] Optionaler manueller echter Push-Smoke wird separat beobachtet.

**Suppression / Diagnose Contract**

- [x] Lokale Suppression bleibt konservativ, wenn kein echter Remote-Health-Nachweis vorliegt.
- [x] `remoteHealthy` wird nur aus echten Remote-Health-Feldern abgeleitet.
- [x] `last_diagnostic_success_at` schaltet lokale medizinische Suppression nicht frei.
- [x] Technischer Diagnose-Push bleibt getrennt von fachlicher Delivery-Dedupe.
- [x] Touchlog zeigt nur sichere Subscription-Diagnose wie Endpoint-Hash, keine Roh-Endpunkte oder Keys.

---

## Phase P11 - Push Channel Robustness & Android WebView Boundary (2026-04-28)

**Scope:** Browser/PWA als Reminder-Push-Master, Android-WebView-Abgrenzung, technischer Diagnose-Push, sichere Subscription-Diagnose und Touchlog-Health-UX.

**Static / Local Checks**

- [x] `deno check backend/supabase/functions/midas-incident-push/index.ts`
- [x] `node --check app/modules/push/index.js`
- [x] `node --check app/modules/profile/index.js`
- [x] `node --check app/modules/incidents/index.js`
- [x] `node --check app/diagnostics/devtools.js`
- [x] `node --check service-worker.js`
- [x] `node --check public/sw/service-worker.js`
- [x] `.env.supabase.local` ist per `.gitignore` ausgeschlossen.

**Edge Function / Workflow**

- [x] `workflow_dispatch` bietet `mode=incidents` und `mode=diagnostic`.
- [x] Schedule-Runs bleiben `mode=incidents`.
- [x] Diagnosemodus ist nur fuer manuelle Runs gedacht.
- [x] Diagnose-Push schreibt nur `last_diagnostic_*`.
- [x] Diagnose-Push schreibt nicht in `push_notification_deliveries`.
- [x] Diagnose-Push setzt kein medizinisches `last_remote_success_at`.
- [x] Echter Diagnose-Smoke liefert `status=diagnostic-sent`, `failedSubscriptions=0`.

**Touchlog / Push Context**

- [x] Touchlog zeigt Kontext/Geraet/Berechtigung/Browser-Abo/Remote/Diagnose/Endpoint-Hash/letzte Zeitpunkte ohne Roh-Endpunkte.
- [x] Desktop-PWA wird als `PWA/Standalone` bzw. Browser/PWA-Kontext erkannt.
- [x] Android-PWA wird als `PWA/Standalone` mit `android / chrome / standalone` erkannt.
- [x] Android-WebView darf nicht als gesunder Reminder-Push-Master dargestellt werden.
- [x] Android-WebView soll Chrome/PWA fuer verlaessliche Erinnerungen empfehlen.
- [x] Endpoint-Hash darf fehlen, wenn alte Subscriptions noch nicht neu upserted wurden.

**Device Smokes**

- [x] Desktop/PWA erhaelt fachlichen oder Diagnose-Push real.
- [x] Android-PWA erhaelt Diagnose-Push real sichtbar in der Notification-Zeile.
- [x] Edge Function meldet erfolgreiche Zustellung an aktive Subscriptions.
- [ ] Optionaler naechster natuerlicher Medication-/BP-Reminder wird beobachtet und gegen die Touchlog-Anzeige bewertet.

**Suppression / Health Contract**

- [x] Lokale Suppression bleibt nur bei echtem Remote-Health-Nachweis erlaubt.
- [x] `last_diagnostic_success_at` schaltet lokale medizinische Suppression nicht frei.
- [x] `Health-Check offen` ist kein harter Fehler.
- [x] Bei mehreren/alten Subscriptions darf Touchlog-Health nervoes/offen wirken, solange realer Push-Transport funktioniert.

**Regression**

- [x] Keine Medication-/BP-Schwellen geaendert.
- [x] Keine neue Reminder-Kette.
- [x] Kein Service-Worker-Umbau.
- [x] Keine native Android-/FCM-/AlarmManager-Push-Schicht eingefuehrt.
- [x] Profil bleibt sichtbar push-frei.
- [x] Touchlog-Push-Health darf spaeter ruhiger als kompakte Pill plus Details gestaltet werden.

---

## Phase P9 - Push Cadence & Health Visibility Follow-up (2026-04-25)

**Scope:** GitHub-Actions-Kadenz von `*/30` auf gezielte Push-Ticks, Edge-Function-Diagnose, Profil-/Touchlog-Push-Health und mobile Diagnose.

**Workflow / Scheduler**

- [x] Workflow nutzt gezielte UTC-Crons statt `*/30`.
- [x] Regulaere Schedule-Runs sind auf 17 pro Tag reduziert; manuelle `workflow_dispatch`-Runs kommen nur bei Bedarf dazu.
- [x] `workflow_dispatch` bietet `window` als Choice mit `all`, `med`, `bp`.
- [x] Scheduler-Default ist `window=all`; Shell-Fallback und GitHub-Expression-Default sind vorhanden.
- [x] HTTP-4xx/5xx der Edge Function lassen den Run durch `curl --fail-with-body` fehlschlagen.

**Timezone / Cadence**

- [x] CET (`UTC+1`) deckt die lokalen Schwellen ab:
  - `10:05`, `12:05`, `14:05`, `16:05`, `20:05`, `22:05`, `22:35`, `23:35`
- [x] CEST (`UTC+2`) deckt dieselben lokalen Schwellen ab:
  - `10:05`, `12:05`, `14:05`, `16:05`, `20:05`, `22:05`, `22:35`, `23:35`
- [x] Die Edge Function bleibt die fachliche Source of Truth fuer `Europe/Vienna`; GitHub Actions triggert nur.

**Edge Function / Response**

- [x] Manueller Run mit `window=all` liefert `ok=true`.
- [x] Response enthaelt `trigger`, `window`, `evaluatedAtUtc`, `evaluatedAtLocal`, `dayIso` und `results`.
- [x] `no-incidents` liefert nachvollziehbare `skipped`-Gruende.
- [x] Keine Push-Endpoints werden in `failed`-Response-Eintraegen ausgegeben.
- [ ] Echter faelliger Remote-Push schreibt `last_remote_success_at`.
- [ ] Echter Zustellfehler schreibt `last_remote_failure_at`, `last_remote_failure_reason` und erhoeht den Failure-Counter.

**Profile / Health UI**

- [x] Browser-Berechtigung `erlaubt` plus Browser-Abo `aktiv` wird sichtbar angezeigt.
- [x] Backend-Subscription vorhanden, aber noch keine echte faellige Zustellung zeigt neutral `bereit (wartet auf erste Erinnerung)`.
- [x] Dieser neutrale Bereit-Zustand wird nicht als `remote gesund` oder gruen bestaetigt.
- [x] Echter Remote-Erfolg zeigt `aktiv (remote gesund)`.
- [x] Echter Failure oder deaktivierte Remote-Subscription zeigt `Zustellung noch nicht gesund`.
- [x] Lokale Push-Suppression bleibt nur bei `remoteHealthy` aktiv.

**Touchlog / Mobile Diagnosis**

- [x] Dev-Push-Toggle unterscheidet Browser-Abo und Remote-Gesundheit.
- [x] Diagnosezeile zeigt `Push: bereit, wartet auf erste faellige Erinnerung` fuer eingerichteten, aber noch nicht zugestellten Remote-Push.
- [ ] Mobile Diagnosepanel am Handy pruefen:
  - Close-Button erreichbar
  - Log scrollbar
  - Toggles lesbar
  - keine horizontale Viewport-Ueberbreite

**Regression**

- [x] Kein Service-Worker-Umbau noetig.
- [x] Keine native Android-/TWA-Push-Schicht eingefuehrt.
- [x] Keine neue Reminder-Kette oder medizinische Fachlogik.
- [x] Kein Push wird gesendet, wenn die Edge Function fachlich `no-incidents` entscheidet.
- [ ] Off-App-Push bei geschlossener App mit echter faelliger Medication oder Abend-BP praktisch pruefen.

---

## Phase F4 - Bootflow Optimization Regression (2026-02-07)

**Scope:** Finaler Regression-Sweep nach Bootflow-Optimierung (S1-S7), inkl. PWA-Update/Offline-Verhalten.

**Boot smoke (live browser/PWA)**

- [x] Cold Start (Hard Reload): Boot endet ohne Fehler in normaler UI; Touch-Log zeigt keine fruehen IndexedDB-init Fehler.
- [x] Warm Start (Reload): Boot bleibt stabil, gefuehlte First-Interactive vor schwerem Doctor/Chart-Refresh.
- [x] PWA Start (Standalone): App startet konsistent schnell, keine stuck Boot-Overlays.

**Auth / Stage guards**

- [x] Bei `authState=unknown` bleibt Guard aktiv bis Session-Entscheid; keine geschuetzten Aktionen vor Auth-Resolve.
- [x] Doctor/Chart Guard funktioniert unveraendert (`requireDoctorUnlock`).
- [x] Realtime/Resume Hooks (`visibility`, `pageshow`, `focus`) laufen ohne regressiven Fehler.

**Boot error / diagnostics**

- [x] `Touch-Log oeffnen` bleibt in Fehlerfaellen deterministisch (diag oder Fallback-Log).
- [x] `earlyBootErrorFallback` erscheint nur bei sehr fruehen Fehlern und verschwindet im Normalfall.
- [x] Duplicate Bootfehler erzeugen keinen mehrfachen History-Spam.

**PWA update / offline**

- [x] Update-Banner erscheint bei waiting worker; Reload-Button sendet `SKIP_WAITING`.
- [x] `controllerchange` unterbricht den Boot nicht unnoetig (Reload spaetestens bei `IDLE`).
- [x] Offline Navigate nutzt app-shell-first (`index.html`/`./`), `offline.html` nur als letzter Fallback.

**Regression**

- [x] Hub-Navigation (inkl. Doctor/Open-Flow), Capture-Saves, Doctor-Panel, Charts, Trendpilot bleiben funktional.
- [x] Keine neuen UI-Locks, keine dauerhaften Error-Zustaende nach Reload.

---

## Phase F3 - Boot Error Browser Smoke (2026-02-07)

**Scope:** Manueller Browser-Smoke fuer Boot-Error-Resilience (diag, fallback, early-fallback, history APIs).

**Setup**

- [ ] DevTools oeffnen (Console + Elements).
- [ ] Sicherstellen, dass `window.AppModules.bootFlow` vorhanden ist.
- [ ] Optional: vor dem Lauf `window.AppModules.bootFlow.clearErrorHistory?.()` ausfuehren.

**Console Script (copy/paste)**

```js
(() => {
  const api = window.AppModules?.bootFlow;
  if (!api) {
    console.error('[qa:f3] bootFlow missing');
    return;
  }

  api.clearErrorHistory?.();
  api.reportError?.(
    {
      message: 'QA_F3_BOOT_ERROR',
      detail: 'manual browser smoke',
      phase: 'BOOT'
    },
    { reason: 'qa-f3-smoke' }
  );

  const panelVisible = !document.getElementById('bootErrorPanel')?.hidden;
  const earlyFallback = !!document.getElementById('earlyBootErrorFallback');
  const history = api.getErrorHistory?.() || [];
  const top = history[0] || null;

  console.log('[qa:f3] panelVisible=', panelVisible);
  console.log('[qa:f3] earlyFallbackPresent=', earlyFallback);
  console.log('[qa:f3] historyLength=', history.length);
  console.log('[qa:f3] historyTop=', top);
})();
```

**Smoke**

- [ ] Nach Script-Lauf ist der Boot-Error-Status sichtbar (Boot-Error-Panel oder Early-Fallback).
- [ ] Klick auf `Touch-Log oeffnen` oeffnet `#diag` oder zeigt den Fallback-Log im Panel.
- [ ] `window.AppModules.bootFlow.getErrorHistory()` liefert mindestens einen Eintrag.
- [ ] Der neueste History-Eintrag enthaelt `message=QA_F3_BOOT_ERROR` und eine `timestamp`-Angabe.

**History limit**

- [ ] Drei weitere Fehler melden (`E1`, `E2`, `E3`) und pruefen, dass die History maximal 3 Eintraege behaelt.
- [ ] `window.AppModules.bootFlow.clearErrorHistory()` leert die History auf 0.

**Regression**

- [ ] Nach Reload startet MIDAS normal ohne dauerhaften Error-Zustand.
- [ ] Wenn kein Fehler mehr aktiv ist, sind `#bootErrorPanel` und `#earlyBootErrorFallback` nicht sichtbar.

---

## Phase 3.2 â€“ Assistant Fotoanalyse (2025-12-05)

**Scope:** Assistant-Panel Kamera/Galerie Workflow (short press Kamera, long press Galerie), Vision-Upload via `/midas-vision`, reine Darstellung (kein Speichern).

**Smoke**

- [ ] Kamera-Button **kurz tippen** â†’ OS-Kamera Ã¶ffnet; Foto aufnehmen, Senden. Erwartung: Foto-Bubble erscheint sofort mit Thumbnail + Text *â€žAnalyse lÃ¤uft â€¦â€œ*. Nach Serverantwort zeigt der Bubble Wasser/Salz/Protein und die MIDAS-Empfehlung.
- [ ] **Langer Druck** (~650â€¯ms) auf Kamera-Button â†’ Galerie-/Datei-Dialog. AusgewÃ¤hltes Bild wird angezeigt wie oben.
- [ ] Fehlerfall: Netzwerk deaktivieren oder `/midas-vision` blockieren â†’ Bubble fÃ¤rbt sich rot, Text â€žDas Foto konnte nicht analysiert werden.â€œ + Button â€žNochmal analysierenâ€œ.

**Sanity**

- [ ] Touch-Log meldet `[assistant-vision] analyse start/success/fail` maximal einmal pro Upload; keine zusÃ¤tzlichen `[capture] refresh` EintrÃ¤ge.
- [ ] Retry-Button verwendet denselben Snapshot erneut (kein erneuter Kamera-Dialog erforderlich).
- [ ] Butler-Header (Pills + Termine + Extras/Expandable) bleibt unverÃ¤ndert; kein zusÃ¤tzlicher Snapshot-Request beim Foto-Upload.

**Regression**

- [ ] Textchat (Senden/Empfangen) funktioniert unverÃ¤ndert; Voice-Gate/Needle bleiben gesperrt solange `authState === 'unknown'`.
- [ ] App-Performance auf Mobil: Foto-Bubble passt sich dem Viewport an (max 70â€¯vw), keine horizontalen Scrollbars.
- [ ] Kein Speichern: Nach Refresh sind keine zusÃ¤tzlichen Intake-Werte vorhanden, nur Anzeige im Chat.

---

## Phase 4.1 ? Vitals & Doctor Panel (2025-12-06)

**Scope:** Ein Orbit-Eintrag f?r Vitals + Buttons *Arzt-Ansicht* / *Diagramm* im Panel; Chart schlie?t zuerst zur?ck zur Liste.

**Smoke**

- [ ] Orbit zeigt nur noch einen Vitals-Button (Doctor-Orbit entf?llt). Tippen ?ffnet immer das Vitals-Panel.
- [ ] Buttons *Arzt-Ansicht* und *Diagramm* unter Datum/Messzeitpunkt funktionieren: erster ? `requireDoctorUnlock()` + Liste, zweiter ? Guard + direktes Chart.
- [ ] Chart schlie?en (X) blendet zuerst zur?ck zur Arzt-Liste; erst das zweite X kehrt zum Hub zur?ck.

**Sanity**

- [ ] `openDoctorPanel({ startMode })` akzeptiert `list`/`chart`; Touch-Log meldet `[hub] openDoctorPanel openFlow start ?` nur einmal je ?ffnung.
- [ ] Abbruch des Guards (`unlock result=cancelled`) hinterl?sst kein offenes Panel.
- [ ] Solange Doctor offen ist, blockiert das Hub-Lock weitere Orbit-Klicks (`body:has(.hub-panel.is-visible)` aktiv).
- [ ] Fallback `forceClosePanel` sollte nicht auftauchen; falls doch ? Fail & Bug notieren.

**Regression**

- [ ] Capture-Saves (Blutdruck/K?rper) laufen unver?ndert; neue Buttons beeinflussen Formulare nicht.
- [ ] Trendpilot-Block, Export JSON und Diagrammsteuerung funktionieren wie zuvor.
- [ ] Arzt-Ansicht zeigt nur Werte innerhalb des gesetzten `from/to` (BP/Body/Lab/Training).
- [ ] JSON-Export basiert auf Supabase und enthaelt nur BP/Body/Lab/Training fuer `from/to`.
- [ ] Diagramm nutzt denselben `from/to`-Bereich wie die Arzt-Ansicht.
- [ ] Arzt-Ansicht zeigt nur Werte innerhalb des gesetzten `from/to` (BP/Body/Lab/Training).
- [ ] JSON-Export basiert auf Supabase und enthaelt nur BP/Body/Lab/Training fuer `from/to`.
- [ ] Diagramm nutzt denselben `from/to`-Bereich wie die Arzt-Ansicht.
- [ ] Andere Panels (Assistant, Appointments, Capture Intake) schlie?en normal; keine neuen ARIA-Warnungen in DevTools.

---

## Phase 4.2 - Termine & Butler (2025-12-06)

**Scope:** Supabase-Termine (`appointments_v2`), Butler-Header Snapshot, Wiederholer + Sync-Events.

**Smoke**

- [ ] Orbit SÃ¼d-Ost Ã¶ffnet das Termin-Panel; Speichern legt Eintrag in Supabase an und Karte erscheint unter â€žKommende Termineâ€œ.
- [ ] Butler-Header zeigt nach Panel-Save sofort denselben Termin (max. zwei EintrÃ¤ge). "Keine Termine geladen." nur bei leerer Tabelle.
- [ ] Buttons *Erledigt*/*ZurÃ¼cksetzen* sowie *LÃ¶schen* aktualisieren Kartenstatus ohne Fehl-Toast.

**Sanity**

- [ ] `appointments_v2` respektiert RLS: fremde Sessions lÃ¶sen 403 aus, Touch-Log zeigt `[appointments] save failed â€¦`.
- [ ] Dropdown "Wiederholen" speichert `repeat_rule` (`none`/`monthly`/`annual`) und Karten zeigen den Modus im Metatext.
- [ ] `appointments:changed` triggert `refreshAssistantContext()` (Insert/Delete/Statuswechsel), Butler aktualisiert ohne Panel.
- [ ] Touch-Log enthÃ¤lt keinen Hinweis mehr auf Mock-Termine; Butler lÃ¤dt maximal einmal pro Event.

**Regression**

- [ ] Panel-Lock/Scroll-Verhalten entspricht anderen Hub-Panels; SchlieÃŸen (X) setzt Orbit zurÃ¼ck.
- [ ] Assistant-Foto/Textchat bleiben unverÃ¤ndert (kein Zusatz-Refresh bei jeder Nachricht).
- [ ] Mockdaten entfernt â€“ nach Reload erscheinen ausschlieÃŸlich echte Supabase-EintrÃ¤ge.

---

## Phase 4.3 - Health-Profil & Persona Layer (2025-12-07)

**Scope:** Profil-Panel (Orbit Nord-West) ersetzt Hilfe, speichert Gesundheitsdaten in `user_profile`, Charts/Assistant lesen Kontext aus Supabase.

**Smoke**

- [ ] Orbit NW Ã¶ffnet `#hubProfilePanel`. Formular speichert Name, Geburtsdatum, GrÃ¶ÃŸe, Medikation, Salzlimit, Proteinlimit, Rauchstatus und Lifestyle-Note via Supabase. Nach dem Speichern erscheint der Datensatz im Abschnitt â€žAktuelle Datenâ€œ.
- [ ] Der read-only Hinweis â€žCKD-Stufe (Lab)â€œ zeigt nach dem ersten Lab-Eintrag automatisch den kombinierten Wert (z.â€¯B. â€žG3a A2â€œ); ohne Labordaten bleibt der Platzhalter â€žNoch keine Labordatenâ€œ.
- [ ] Button **Aktualisieren** lÃ¤dt das bestehende Profil erneut aus Supabase; Ã„nderungen am Backend werden sofort angezeigt.
- [ ] Charts reagieren auf ProfilÃ¤nderungen: GrÃ¶ÃŸe im Profil stark verÃ¤ndern (z.â€¯B. 220â€¯cm) â†’ BMI/WHtR springen sofort nach `profile:changed`.
- [ ] Assistant-Butler (Pills + Extras + Termine + Expandable) aktualisiert nach Speichern/Refresh ohne Reload.

**Sanity**

- [ ] Supabase RLS: andere Session versucht Profil zu speichern â†’ 403, Touch-Log enthÃ¤lt `[profile] save failed 403`. Eigene Session kann Insert **und** Update per Upsert.
- [ ] Dropdowns (Rauchstatus) und Inputs behalten Theme (dunkle Schrift auf dunklem Hintergrund) sowie valide Default-Werte; invalides Proteinlimit (z.â€¯B. Text) wird mit Toast abgelehnt.
- [ ] Event `profile:changed` feuert genau einmal pro erfolgreichem Save/Load. Charts hÃ¶ren darauf (`window.addEventListener('profile:changed', â€¦)`) und loggen `[charts] profile change -> recompute`.
- [ ] Assistant-Context nutzt ausschlieÃŸlich echte Werte: Butler zeigt Profilhinweis nur, wenn Supabase-Daten vorhanden sind; keine Mock-Strings wie â€žHausarzt â€“ Kontrolleâ€œ mehr, sobald Profil & Termine existieren.

**Regression**

- [ ] Termin-, Vitals- und Doctor-Panels verhalten sich unverÃ¤ndert; das entfernte Hilfe-Panel hinterlÃ¤sst keine toten Orbit-Buttons.
- [ ] Touch-Log bleibt sauber: `[profile] save start/done` maximal einmal, keine `[help]`-EintrÃ¤ge mehr.
- [ ] Assistant Edge Functions (midas-assistant / midas-vision) akzeptieren weiterhin Requests auch wenn kein Profil gespeichert ist (Backend fÃ¤llt auf Defaults zurÃ¼ck, kein 500er).

---

## Phase 4.4 - Hybrid Panel Animation / Hub Performance Mode (2025-12-08)

**Scope:** Neue Panel-Keyframes fÃ¼r Mobile/Desktop, leichteres Orbit/Aura-Verhalten & Blur-Free Overlay auf GerÃ¤ten <1025â€¯px.

**Smoke**

- [ ] Desktop (>1024â€¯px): Panel auf/zu zeigt die cineastische Animation (Squash/Grow ~500â€¯ms); Backdrop bleibt mit Blur & Glow; Orbit dimmt weich mit Blur.
- [ ] Mobile (<1025â€¯px oder DevTools responsive): Panel Ã¶ffnet/schlieÃŸt in <250â€¯ms (nur opacity/translate) ohne Blur & ohne stotternde Shadows; Orbit dimmt nur Ã¼ber opacity (kein Blur). Scrollen wÃ¤hrend Panel offen blockiert weiterhin Body.
- [ ] Close-Button reagiert weich (Opacity/Scale) und Panel kehrt korrekt in Hub zurÃ¼ck â€“ keine â€žhÃ¤ngendenâ€œ Panels sichtbar.

**Sanity**

- [ ] `document.body.dataset.panelPerf` folgt Media Query (`mobile` bei â‰¤1024â€¯px, `desktop` sonst). Manuelles Ã„ndern der Fensterbreite lÃ¶st Animation-Wechsel ohne Reload aus.
- [ ] Touch-Log enthÃ¤lt weiterhin nur `[hub] openPanelâ€¦`/`[hub] close panelâ€¦` â€“ keine zusÃ¤tzlichen Debug-EintrÃ¤ge wegen Animationen.
- [ ] Voice/Orbit-Aura: Bei offenem Panel auf Mobile keine Pulse-Animationen mehr (nur statischer Glow); Desktop behÃ¤lt Pulse.
- [ ] Backdrop/Overlay verursachen keine ARIA/DevTools Warnungen (Cloudflare 500er aus Auth debug bleibt unabhÃ¤ngig).

**Regression**

- [ ] Andere Panels (Assistant, Termine, Profil, Vitals, Doctor) behalten ihre Layouts â€“ nur Animationen wurden reduziert; Inhalte/Scroll bleiben gleich.
- [ ] Panel-Lock (body overflow hidden) wirkt weiter auf beiden Breakpoints; keine doppelte Scrollbar.
- [ ] CSS/JS Ã„nderungen erzeugen keine unbenutzten Klassen oder Flash-of-unstyled Content beim Start.

---

## Phase 5.1/5.2 â€“ Butler Suggest & Allowed Actions (2025-12-09)

**Scope:** Suggest-Store + Confirm-Card, Follow-up Advice, Allowed-Actions-Helper mit Stage/Auth Guards.

**Smoke**

- [ ] Foto/Text-Analyse mit klarer Mahlzeit erzeugt eine Suggest-Card (Titel, Werte, Empfehlung, Buttons). **Ja** schreibt eine Chat-Nachricht â€žAlles klar â€“ ich habe â€¦ vorgemerktâ€œ, schlieÃŸt die Card und zeigt direkt im Anschluss den Resttag-Hinweis (Salz/Protein/Termin). **Nein** blendet Card aus, Touchlog meldet `[assistant-allowed] blocked action=intake_save source=suggestion-card info=user-dismiss`.
- [ ] Manueller Intake-Save (Capture Panel) oder Chat-Button `Trag 500 ml ein` ruft Allowed Action `intake_save` â†’ nach Erfolg erscheint dieselbe Follow-up Message (auch ohne Suggestion). `assistant:action-success` ist genau einmal im DevTools Event Log sichtbar.
- [ ] Voice Long-Press â†’ â€žSpeichere 0,5 Liter Wasserâ€œ lÃ¶st `assistant:action-request` (`open_module` alias voice) + Suggest-Flow aus. BestÃ¤tigung via Voice oder Button feuert denselben Save-Pfad; Needle bleibt gesperrt, solange Stage/Auth unbekannt sind.

**Sanity**

- [ ] Touchlog zeigt pro Allowed Action deterministische EintrÃ¤ge:
  - `[assistant-allowed] start action=intake_save source=suggestion-card`
  - `[assistant-allowed] success action=intake_save source=suggestion-card`
  - `[assistant-allowed] blocked action=open_module source=voice info=auth-unknown`
  - `[assistant-allowed] error action=intake_save info=dispatcher-missing`
- [ ] `assistantSuggestStore` Snapshot aktualisiert bei `appointments:changed` und `profile:changed` â€“ Butler-Header + Dayplan nutzen dieselben Werte.
- [ ] `assistant:action-request` CustomEvents (z.B. Buttons im Chat) laufen durch `runAllowedAction`; `executeAllowedAction` validiert Stage/Auth und nutzt Supabase-API. Keine Aktion lÃ¤uft auÃŸerhalb des Helpers.
- [ ] `open_module` versteht Aliase (â€žTermineâ€œ, â€žPersonaldatenâ€œ, â€žSprachchatâ€œ) â†’ Orbit-Button klickt, Touchlog `[assistant-allowed] success action=open_module source=chat`.

**Regression**

- [ ] Suggest-Card verschwindet bei Panel-Wechsel oder Store-Dismiss; kein persistenter Overlay.
- [ ] Keine zusÃ¤tzlichen `[capture] refresh â€¦` durch Suggest-Flow; `refreshAssistantContext` lÃ¤uft genau einmal pro Save/Folgeevent.
- [ ] Voice und Textchat teilen sich denselben Guard â€“ Auth-Drop wÃ¤hrend Suggest-Confirm schlieÃŸt Voice sofort und Card bleibt blockiert, bis Session wieder gÃ¼ltig ist.

---

## Phase 5.3 â€“ Kontextuelle Empfehlungen (2025-12-09)

**Scope:** Day-Plan Helper + Follow-up Advice nach jedem Intake-Save.

**Smoke**

- [ ] Suggest-Card â€žJaâ€œ â†’ Chat zeigt nach Speichern einen Mini-Report (Salz/Protein-Budget, nÃ¤chster Termin). Gleiche Nachricht erscheint, wenn Capture Intake speichert oder Voice (Long-Press) einen Save bestÃ¤tigt.
- [ ] Voice-Konversation aktiv: Nach Save wird derselbe Text per TTS vorgelesen, ohne dass zusÃ¤tzliche Aktionen nÃ¶tig sind.

**Sanity**

- [ ] `generateDayPlan()` nutzt Profil-Defaults (5â€¯g Salz, 110â€¯g Protein), wenn keine Limits gesetzt sind â€“ Logs zeigen keine `NaN`.
- [ ] Termin-Erinnerung nutzt den nÃ¤chsten Termin in den kommenden 24â€¯h; Format entspricht `formatAppointmentDateTime`.
- [ ] Snapshot-Events (`appointments:changed`, `profile:changed`) aktualisieren den Day-Plan Output unmittelbar (kein alter Termin/Limit).

**Regression**

- [ ] Keine zusÃ¤tzliche Suggest-Card entsteht; Chat erhÃ¤lt nur die Follow-up-Meldung, Card bleibt geschlossen.
- [ ] `assistant:voice-request` feuert nur bei Warnungen wÃ¤hrend Voice-Modus; ohne Voice passiert nichts auÃŸer Text.
- [ ] Touchlog bleibt unverÃ¤ndert (keine neuen `[assistant-dayplan]` Spam-EintrÃ¤ge).

---

## Phase 5.4 â€“ Optionaler Voice-Handschlag (2025-12-09)

**Scope:** Long-Press Trigger, Voice-Gate UI, kein Always-On.
**Note:** Voice ist geparkt; diese Checks nur nach Reaktivierung ausfÃ¼hren.

**Smoke**

- [ ] Kurzer Tap auf den Assistant-Button Ã¶ffnet den Textchat. Long-Press (~650â€¯ms) startet den Voice-Recorder (Needle zeigt `listening`, Orbit pulsiert), Aufnahme endet automatisch nach Stille.
- [ ] Auth â€žunknownâ€œ oder Boot < INIT_UI: Voice-Button zeigt `is-voice-locked` (grau, Tooltip â€žVoice aktiviert sich nach dem Startâ€œ), Long-Press startet keine Aufnahme, Chat bleibt gesperrt bis Auth fertig. Nach Login verschwindet der Lock ohne Reload.

**Sanity**

- [ ] Touchlog/Diag: Voice-Blockade loggt `[hub] voice trigger blocked (auth-check)` o.â€¯Ã¤., TTS/Recorder starten erst nachdem `assistantAllowedActions` Stage/Auth freigibt.
- [ ] `AppModules.hub.getVoiceGateStatus()` liefert `{ allowed:boolean, reason }`, `onVoiceGateChange` feuert bei Stage/Auth-Ã„nderungen (MutationObserver). VAD (`MidasVAD`) stoppt sofort, wenn Gate wieder gelockt wird.
- [ ] Voice-Transcripts werden wie Textchat behandelt (`assistant:action-request` â†’ Suggest-Card/Confirm). Es gibt keinen Pfad, der direkt `intake_save` ausfÃ¼hrt, ohne Confirm-Layer.

**Regression**

- [ ] Voice-Button `aria-disabled` wechselt mit Gate und wirkt sich nicht auf andere Orbit-Buttons aus.
- [ ] Keine zusÃ¤tzlichen `[assistant-actions]` EintrÃ¤ge beim bloÃŸen Long-Press ohne Aufnahme.
- [ ] Recorder/TTS verhalten sich unverÃ¤ndert auf Desktop und Mobile; kein Always-On/VAD-Streaming aktiv (nur Long-Press).

## Phase 4  MIDAS Orbit & Trendpilot (2025-11-23)

**Scope:** Neuer MIDAS Orbit Hub (Aura/Lens/Stage), panel locking, biometrischer Doctor-Unlock, Trendpilot-Schweregrade (Capture + Arzt), Diagnostics-Layer-Flag und Supabase-APIs (fetchSystemCommentsRange, setSystemCommentDoctorStatus).

**Smoke**

- [x] Desktop & Android: #captureHub zeigt den Orbit mittig, Aura pulsiert bei Hover/Touch, Orbit-Buttons haben keine sichtbaren Kreise aber reagieren via Sr-Labels. Panels (Intake/Vitals/Doctor) zentrieren sich, hub-panel-zoom-in/out laufen beim ffnen/Schlieen mit identischer Dauer/Easing, Backdrop dimmt sanft.
- [x] Capture-Header Trendpilot-Pill: WARN/CRIT Tage blenden Datum + Kurztext ein; Tage ohne Meldung verstecken die Pill vollstndig. Logging ([trendpilot] severity=...) erscheint einmal pro Tag.
- [x] Doctor Trendpilot Block: Alle Meldungen in Von/Bis erscheinen (Datum, Text, Status). Buttons Geplant, Erledigt, Zurcksetzen schreiben doctorStatus in Supabase und UI markiert den aktiven Button.
- [x] Chart Overlays: Trendpilot-Bnder (gelb/rot) rendern nur an WARN/CRIT Tagen, Legende ergnzt Swatches, Tooltips zeigen ESC-Farben fr MAP/Pulsdruck, KPI-Pillen sind synchron.
- [x] Guard Flow: Erster Klick auf Arzt-Ansicht ?
equireDoctorUnlock() (PIN/Biometrie) ? Panel ffnet sich automatisch. Weitere Klicks nutzen uthGuardState ohne erneute Abfrage; ESC/Escape schliet Panel.
- [x] Diagnostics Flag: DIAGNOSTICS_ENABLED=false deaktiviert pp/diagnostics/* (nur Stub-Logs),  rue leitet diag.add,
ecordPerfStat, Panel-Toggles an Layer weiter.

**Sanity**

- Panel-Lock verhindert Body-Scroll & Orbit-Klicks solange .hub-panel.is-visible; ody:has Regeln arbeiten in allen modernen Browsern, Mobilscroll springt nach Close nicht.
- CSS-Variablen --midas-aura-boost treiben Aura-Brightening unabhngig von DOM-Position; Touch auf Mobil lst denselben Boost aus wie Hover.
- Doctor-Modul ruft setSystemCommentDoctorStatus (Plan/Done/Reset) nur bei Statuswechseln auf; Fehler zeigen Toast + Log, UI revertiert Button-Highlight.
- Trendpilot API Fallback: wenn fetchSystemCommentsRange fehlschlgt ? Chart/Bnder zeigen Placeholder, Capture-Pill bleibt leer, diag-Log [trendpilot] bands failed.
- Guard/Resume: Visibility/PageShow/Focus triggern SupabaseAPI.resumeFromBackground, Trendpilot-Pill + Orbit behalten Zustand nach Resume.

**Regression**

- Capture-Saves, Charts, Arzt-Daily/Befunde, CSV/JSON-Export laufen unverndert; Legacy QA-Checks (Phase 03, v0.xv1.7.x) bleiben weiter unten als Archiv bestehen.

## Phase 2 â€“ Assetsâ†’App Smoke (2025-11-16)

**Scope:** pp/app.css, pp/core/{diag,utils,config,capture-globals}, pp/supabase/index.js (inkl. boot-auth Import-Pfad) â€“ Ziel: sicherstellen, dass Capture/Doctor/Chart/Trendpilot mit neuen Pfaden laufen, bevor Legacy-Assets gelÃ¶scht werden.

- [x] **Capture View:** Headless Edge (msedge --headless --dump-dom) zeigt vollstÃ¤ndiges Capture-Markup (Accordion, Buttons, Diagnose-Panel). Keine Script-Errors; Buttons/Toggles vorhanden.
- [x] **Doctor View + Trendpilot:** DOM-Dump enthÃ¤lt .doctor-view, Trendpilot-Bereich (Trendpilot-Panel, Chart-Button). Tabs aktiv laut Dump (ARIA).
- [x] **Charts:** SVG-Panel + KPI-Leiste vorhanden, Chart-Skripte geladen; Trendpilot-BÃ¤nder ( rendpilot-band) sichtbar.

### Auth Gate / Boot Overlay

- [ ] **Pre-render lock:** Beim Reload zeigt das Bootoverlay `Supabase pr?ft Session ...`, solange `authState === 'unknown'`. `body.auth-unknown` dimmt App (#appMain/Tabs/Hub) und blockiert Klicks.
- [ ] **Slow Supabase:** DevTools Network Slow 3G ? Reload. Erwartung: Keine Interaktion m?glich, Orbit/HUB Buttons reagieren erst nach Supabase-Entscheid (`auth`/`unauth`).
- [ ] **Message switch:** Nach Entscheid meldet Bootoverlay `Session ok ? MIDAS entsperrt.` oder `Nicht angemeldet ? Login erforderlich.` und entfernt `body.auth-unknown`.
- [ ] **Voice gate sichtbar:** Voice-Nadel bleibt gedimmt/gesperrt (`body.voice-locked`, Tooltip â€žVoice aktiviert sich nach dem Startâ€œ), solange bootFlow < IDLE oder `authState === 'unknown'`. Diag loggt `[voice] gate locked/unlocked`.
- [ ] **Throttle check:** Network â€žSlow 3Gâ€œ, Reload â†’ Klick auf den Voice-Button erzeugt nur `[voice] blocked (auth)` und kein Mikrofon-Prompt.
- [ ] **Auth drop mitten im Mic:** Voice-Session starten, anschliessend Supabase-Session in anderem Tab beenden. Erwartung: Aufnahme/VAD stoppen sofort, Needle relockt, Assistant meldet â€žVoice deaktiviert â€“ bitte wartenâ€œ, diag zeigt `[vad] stop due to voice gate lock`.

- [x] **Supabase/Auth:** ssets/js/boot-auth.js importiert ../../app/supabase/index.js; window.SupabaseAPI per headless Dump sichtbar. Login-Overlay DOM vorhanden.
- [x] **Static-Server-Probe:** python -m http.server 8765 + Invoke-WebRequest <http://127.0.0.1:8765/app/app.css> liefert HTTP 200 â†’ GitHub-Pages-ParitÃ¤t.
- [x] **Parity-Hashes:** Compare-Object Ã¼ber alte/neue CSS/JS-Paare â†’ keine Diff; Ergebnis in QA_Notes dokumentiert.

 ---

## Phase 0.5 â€“ Touchlog Determinism (2025-12-04)

**Scope:** Sicherstellen, dass der Touch-Log ab Phaseâ€¯0.5 deterministisch bleibt (ein Start-/Ende-Paar pro Reason, aggregierte `[auth] request â€¦`-Zeilen, keine Debug-Spam-BlÃ¶cke).

**Smoke**

- [ ] **Cold Boot:** Diag-Panel Ã¶ffnen, App neu laden. Erwartung: ein `Boot: â€¦`-Summary sowie je Reason (`boot`, `auth:login`, `tab:capture`) genau ein `[capture] refresh start â€¦` und `â€¦ done â€¦`; Mehrfachtrigger dÃ¼rfen hÃ¶chstens als `(xN)` am Ende erscheinen.
- [ ] **Manuelles Refresh:** Datum wechseln oder `window.requestUiRefresh({ reason: 'qa:manual', doctor: true, chart: true })` ausfÃ¼hren. Touch-Log darf nur ein `[ui] refresh start/end reason=qa:manual` plus je Modul ein Refresh-Paar loggen.
- [ ] **Resume:** Tab in den Hintergrund schicken, â‰¥3â€¯s warten, zurÃ¼ckkehren. Erwartung: `Resume: start/done` + genau ein `[capture] refresh reason=resume â€¦`; `[auth] request â€¦` erscheint nur aggregiert (`status=200 avg=â€¦ (xN)`).

**Sanity**

- [ ] `[conf] getConf` und `[auth] getUserId` loggen pro Boot/Resume-Zyklus nur das erste `start`; nach erfolgreichem `done` bleiben Folgeaufrufe stumm.
- [ ] `[auth] request â€¦` erzeugt pro Tag eine Startzeile und einen Endeintrag mit Durchschnittsdauer; FehlerfÃ¤lle (status â‰ â€¯200) loggen einmalig den Status inkl. Dauer/Grund.
- [ ] Voice-/Hub-Actions schreiben ausschlieÃŸlich Benutzeraktionen in den Touch-Log. Debug-Spam ist hinter `LOG_HUB_DEBUG` bzw. `DEBUG_TOUCHLOG` deaktiviert.

---


<!-- END SOURCE: docs/QA_CHECKS.md (historical phases) -->

## Ergänzende historische Phasen

Der Versionsbereich zwischen beiden Quellbereichen liegt vollständig und
getrennt im
[Legacy-Release-QA-Archiv](MIDAS%20Legacy%20Release%20QA%20v0.1-v1.8.md).
Die folgenden `14` H2-Blöcke schließen den danach liegenden Quellbereich bis
zum damaligen Dateiende. Reihenfolge und Status bleiben unverändert.

<!-- BEGIN SUPPLEMENT: docs/QA_CHECKS.md (post-release historical phases) -->

## Diagnostics Layer Forwarding (Phase 4)

**Checks**

- Diagnostics-Flag: `DIAGNOSTICS_ENABLED=false` (Config oder `data-diagnostics-enabled`) zwingt `app/core/diag.js` in den Stub-Modus; die neuen `app/diagnostics/{logger,perf,monitor}.js` melden dann nur den Logger-Boot (keine Heartbeats).
- Diagnostics-Layer Forwarding: Bei aktivem Flag landen `diag.add`-Events zustzlich in `appModules.diagnosticsLayer.logger.history`, `recordPerfStat` aktualisiert `diagnosticsLayer.perf.snapshot(...)` und das ffnen/Schlieen des Diagnose-Panels toggelt `diagnosticsLayer.monitor` inklusive Heartbeat.

---

## Phase E â€“ Medication Module QA (2025-12-18)

**Scope:** Tablettenmanager (IN/TAB) inklusive Supabase-RPCs, Low-Stock-Box, Safety-Hinweis, CRUD-Formular und Kartenaktionen (Restock/Set/Archive/Delete).

**Smoke**

- [ ] IN-Tab: `1x taeglich` bleibt kompakt; Toggle bestaetigt die Einnahme (Toast + `medication:changed`), zweiter Klick macht denselben Slot rueckgaengig und stellt den Bestand wieder her.
- [ ] IN-Tab: `>1x taeglich` zeigt offene Abschnitts-CTAs fuer `Morgen` / `Mittag` / `Abend` / `Nacht` und erlaubt weiter Confirm/Undo pro Slot ohne Tagesdrift.
- [ ] Low-Stock-Box erscheint, sobald `days_left <= low_stock_days`; `Erledigt` setzt `med_ack_low_stock` und blendet die Box aus.
- [ ] Lokale Medication-Pushes feuern abschnittsbezogen hoechstens einmal pro Abschnitt, Severity und Kalendertag:
  - `morning`: Reminder `10:00`, Incident `12:00`
  - `noon`: Reminder `14:00`, Incident `16:00`
  - `evening`: Reminder `20:00`, Incident `22:00`
  - `night`: Reminder `22:30`, Incident `23:30`
- [ ] Safety-Hinweis springt auf, wenn der Vortag offene Einnahmen hat; Button setzt Datum auf gestern und triggert `maybeRefreshForTodayChange`.
- [ ] TAB: Neues Medikament anlegen, bestehendes bearbeiten, Speichern deaktiviert/aktiviert den Button korrekt und aktualisiert die Kartenliste ohne Reload.
- [ ] Kartenaktionen: `Bestand +/-`, `Bestand setzen`, `Archivieren/Reaktivieren` und `Loeschen` fÃ¼hren jeweils zur erwarteten RPC-Aktion und reloaden die Liste.

**Sanity**

- [ ] Touch-/Diag-Log enthÃ¤lt `[capture:med] refresh â€¦`, `confirm`, `undo`, `low-stock ack` und `safety pending/cleared` EintrÃ¤ge; fehlende Arzt-Mail erzeugt genau einen Warnhinweis.
- [ ] Manuelles Aktualisieren nutzt den Cache (kein doppelter RPC, solange DayIso unverÃ¤ndert bleibt); `medication:changed` mit passendem `dayIso` aktualisiert die Liste sofort.
- [ ] Auth-Guard blockiert alle RPCs im IN/TAB-Panel, wenn der Nutzer abgemeldet ist (Placeholder-Texte + Login-Overlay erst bei Aktionen).
- [ ] TAB-Formular uebernimmt `low_stock_days`, Frequenz/Slots, `mit Mahlzeit` und `active` korrekt; invalides Delta/Stock oder ungueltige Slot-Mengen werden abgefangen.

**Regression**

- [ ] Capture-Wasser/Salz/Protein-Flows laufen unverÃ¤ndert (keine zusÃ¤tzlichen `[capture] refresh` beim Speichern).
- [ ] Profile-Ã„nderungen aktualisieren weiter nur die benÃ¶tigten Module (`medication` reagiert ausschlieÃŸlich auf `profile:changed` fÃ¼r die Arzt-Mail).
- [ ] Supabase-Fehler (z.â€¯B. Netzwerk aus) lassen die App bestehen: IN zeigt Placeholder mit Fehlermeldung, TAB-Formular bleibt editierbar.

---

## Phase F8 - Push Reminder Softening (2026-03-27)

**Scope:** Medication `reminder -> incident`, Service-Worker-Severity, Remote-Health-Suppression und Off-App-Push-Takt.

**Smoke**

- [ ] Offene Morning-Slots erzeugen vor `10:00` keinen lokalen Medication-Push.
- [ ] Offene Medication-Slots erzeugen zuerst einen sanften Reminder mit `... noch nicht erfasst?`; ein spaeterer Incident folgt nur wenn derselbe Abschnitt weiter offen bleibt.
- [ ] Reminder und Incident nutzen getrennte Tags (`midas-reminder-*` / `midas-incident-*`) und unterscheiden sich sichtbar in `requireInteraction`, Actions und Vibration.
- [ ] Abend-BP bleibt incident-orientiert und feuert ab `20:00` nur wenn Morgen-BP vorhanden und Abend-BP offen ist.

**Remote / Suppression**

- [ ] Frisch aktiviertes Browser-Abo zeigt zunaechst `aktiv (warte auf Remote-Bestaetigung)` oder bei vorhandener Backend-Subscription ohne echte Zustellung neutral `bereit (wartet auf erste Erinnerung)`; lokale Pushes bleiben aktiv bis ein gesunder Remote-Pfad nachweisbar ist.
- [ ] Echter Remote-Failure oder deaktivierte Subscription zeigt `Zustellung noch nicht gesund`.
- [ ] Nach mindestens einer erfolgreichen Remote-Zustellung wechselt der Profil-Status auf `aktiv (remote gesund)` und lokale Duplicate-Pushes werden unterdrueckt.
- [ ] GitHub Workflow tickt gezielt rund um die Medication-/BP-Schwellen; echter Off-App-Push funktioniert auch ohne geoeffnete App.
- [ ] `push_notification_deliveries` verhindert doppelte Remote-Zustellung fuer denselben `user/day/type/severity/source`.

**Sanity**

- [ ] `node --check app/modules/incidents/index.js` ist gruen.
- [ ] `node --check app/modules/profile/index.js` ist gruen.
- [ ] `node --check service-worker.js` ist gruen.
- [ ] Legacy-Payloads ohne `data.severity` bleiben im Service Worker lesbar und werden fuer bekannte alte Incident-Typen weiter korrekt als Incident behandelt.

**Regression**

- [ ] Offene, aber bereits bestaetigte Medication-Slots erzeugen weder Reminder noch Incident.
- [ ] Tageswechsel resettet die lokalen Sendeflags weiter sauber.
- [ ] Das Profil-Panel kann Push aktivieren/deaktivieren, ohne CRUD-Save oder Medication-Snapshot zu stoeren.

---

## Phase F5 - Breath Timer Regression (2026-03-03)

**Scope:** BP-Breath-Overlay (3/5 Min, 3s/4s Rhythmus, 2-Step-Cancel, Fade-out, Guard-Integration).

**Smoke**

- [ ] BP-Panel: Button `Atemtimer starten` ist in beiden Kontexten (`M`, `A`) sichtbar.
- [ ] Start ohne `data-breath-minutes` nutzt Default `3 Minuten`; mit `data-breath-minutes="5"` startet `5 Minuten`.
- [ ] Hero Hub Voice/Text: `starte timer` oeffnet `Vitals` direkt und startet ohne Preset-Umweg den `3`-Minuten-Timer.
- [ ] Hero Hub Voice/Text: nur explizite `5 Minuten` starten den `5`-Minuten-Timer.
- [ ] Running-Overlay zeigt nur Kerninhalte: Restzeit, Atem-Orb, Atemphase.
- [ ] Atemphase wechselt zwischen `Einatmen` (3s) und `Ausatmen` (4s) ohne harte Spruenge.

**Cancel / Completion**

- [ ] Erster Tap waehrend Running zeigt `Nochmal tippen zum Abbrechen` (Confirm-Fenster aktiv).
- [ ] Zweiter Tap innerhalb Confirm-Fenster fuehrt zu `Vorbereitung beendet` und anschliessendem Fade-out.
- [ ] Ohne zweiten Tap kehrt Overlay nach Confirm-Timeout in Running zurueck.
- [ ] Bei natuerlichem Ablauf erscheint `Vorbereitung abgeschlossen` und anschliessend derselbe Fade-out.

**Guards / Regression**

- [ ] Waehrend aktivem Breath-UI ist BP-Save blockiert (kein paralleler Save-Flow).
- [ ] `#bpContextSel` bleibt waehrend aktivem Breath-UI stabil (kein Kontext-Switch).
- [ ] Vitals-Tab-Wechsel ist waehrend aktivem Breath-UI blockiert.
- [ ] Vitals-Panel-Close raeumt aktiven Breath-Timer vollstaendig auf (kein Orphan-Overlay/Timer).
- [ ] Nach `completed` oder `aborted` landet der Nutzer wieder im BP-Flow mit demselben Messkontext (`M` / `A`).

**Sanity**

- [ ] `node --check app/modules/vitals-stack/vitals/breath-timer.js` ist gruen.
- [ ] `node --check app/modules/vitals-stack/vitals/index.js` ist gruen.
- [ ] `node --check assets/js/main.js` ist gruen.
- [ ] Optionaler Harness-Lauf liefert `S7-BREATH-HARNESS: PASS`.

**Visual Device Check (manual)**

- [ ] Desktop: Atemtimer-Button neben `Blutdruck speichern`, Overlay wirkt ruhig und klar.
- [ ] Mobile: Atemtimer-Button unter `Blutdruck speichern`, Overlay bleibt lesbar und ohne horizontales Scrollen.
- [ ] Fruehe Tagesnutzung (dunkle Umgebung): Restzeit/Phase bleiben gut lesbar.

---

## Phase F6 - Intent Engine Regression (2026-03-07)

**Scope:** Lokaler Intent-Fast-Path im Assistant-Hub, suggestion-basierte Confirm-/Context-Freigaben, vorbereiteter Voice-Transcript-Preflight.

**Smoke**

- [ ] `Wasser 300 ml` -> lokaler `direct_match`, `intake_save`, kein unnoetiger `midas-assistant`-Call.
- [ ] `Trage mir 300 ml Fluessigkeit ein` -> lokaler `direct_match`, `intake_save`, kein unnoetiger `midas-assistant`-Call.
- [ ] `Blutdruck 128 zu 82` -> lokaler Match im Intent-Preflight; aktuell kontrollierter Assistant-Fallback, kein lokaler Vital-Write.
- [ ] `Gewicht 78,4` -> lokaler Match im Intent-Preflight; aktuell kontrollierter Assistant-Fallback, kein lokaler Vital-Write.

**Fallback**

- [ ] `Heute habe ich zu wenig getrunken` -> `fallback`, kein direkter Write.
- [ ] `Mein Blutdruck war so um die 130` -> `fallback`, kein direkter Write.
- [ ] `Ist das bedenklich?` -> `fallback` an Assistant.
- [ ] `Was soll ich heute essen?` -> `fallback` an Assistant.
- [ ] Mehrdeutige Navigation wie `Zeig mir Blutdruck` -> kein lokaler Match.

**Confirm / Guards**

- [ ] `ja/nein/speichern/abbrechen` ohne Pending Context bleiben inert und zeigen die lokale Rueckmeldung `Es gibt aktuell nichts zu bestaetigen.`
- [ ] Mit aktivem Suggestion-Context bestaetigen `ja/speichern` denselben `confirm_intake`-Pfad wie die Suggestion-UI.
- [ ] Mit aktivem Suggestion-Context verwerfen `nein/abbrechen` denselben Suggestion-Kontext lokal.
- [ ] Re-Entrancy-/Dedupe-Guards blockieren Wiederholung desselben Pending Contexts nach `consume`.
- [ ] Fehlgeschlagene Saves verbrennen den Pending Context nicht; Retry bleibt moeglich.

**Voice / Adapter**

- [ ] Hub und Voice nutzen denselben Adapter-Eingangspunkt `parseAdapterInput(...)`.
- [ ] Geparktes Voice meldet `reason = voice-parked` ueber die Hub-Fassade.
- [ ] Optional vorbereitete lokale TTS-Bestaetigung ist vorhanden, aber nicht automatisch im Live-Flow verdrahtet.
- [ ] `device`-Quellen koennen ueber `createAdapterInput(..., { source: 'device' })` denselben Decision-Contract nutzen.

**Sanity**

- [ ] `node --check` ist gruen fuer:
  - `app/modules/assistant-stack/intent/normalizers.js`
  - `app/modules/assistant-stack/intent/rules.js`
  - `app/modules/assistant-stack/intent/validators.js`
  - `app/modules/assistant-stack/intent/context.js`
  - `app/modules/assistant-stack/intent/parser.js`
  - `app/modules/assistant-stack/intent/index.js`
  - `app/modules/hub/index.js`
  - `app/modules/assistant-stack/voice/index.js`

**Regression**

- [ ] `DIRECT_INTENT_ACTIONS` bleibt eng auf `intake_save` und `open_module`.
- [ ] Keine offensichtliche statische Drift zwischen Intent-Kern, Hub und vorbereitetem Voice-Pfad.

---

## Phase F7 - Intent Engine Execution Reliability (2026-03-07)

**Scope:** Lokale Ausfuehrungsschicht nach dem Intent-Match: UI-safe `open_module`, lokale Blocker statt irrefuehrendem Assistant-Fallback, Telemetry-Outcome-Trennung und sichtbarer Assistant-Header-Refresh nach lokalem `intake_save`.

**Local Execution**

- [ ] `Oeffne Vitals` -> lokaler `direct_match`, Modul oeffnet ohne Assistant-Roundtrip.
- [ ] `Öffne Vitals` -> lokaler `direct_match`, Modul oeffnet ebenfalls robust ueber Umlaut-Normalisierung.
- [ ] `Trage 300ml Wasser ein` -> lokaler `direct_match`, `intake_save`, Wasser-Kachel im Assistant zieht sichtbar nach.
- [ ] `Trage 300 ml Wasser ein` -> lokaler `direct_match`, `intake_save`, Wasser-Kachel zieht sichtbar nach.
- [ ] `Trage mir 300 ml Wasser ein` -> lokaler `direct_match`, `intake_save`, Wasser-Kachel zieht sichtbar nach.

**Blocked / Unsupported**

- [ ] `Blutdruck 128 zu 82` ohne Kontext -> lokaler Match, aber lokaler Hinweis auf `morgens` / `abends`, kein irrefuehrender Assistant-/Backend-Fehler.
- [ ] `Puls 66` -> lokaler Match, aber lokaler Hinweis auf die bewusst nicht freigegebene `pulse-only`-Grenze.
- [ ] Lokale Execution-Fehler erscheinen nicht mehr als `Assistant nicht erreichbar.`, sondern als lokaler Intent-Fehlerhinweis.

**Telemetry / Diag**

- [ ] Intent-Telemetry fuehrt `by_outcome` und unterscheidet mindestens:
  - `handled`
  - `blocked_local`
  - `unsupported_local`
  - `pending-local-execution`
- [ ] Hub-/Voice-Diag unterscheiden lokale Blocker von echtem Assistant-Fallback.

**Refresh / Regression**

- [ ] Kein `ReferenceError: statusEl is not defined` mehr im Intake-Refresh-Pfad.
- [ ] Nach lokalem `intake_save` aktualisieren sich Assistant-Kontext und Intake-Header ohne manuellen Reload.
- [ ] `open_module` bleibt UI-safe und fuehrt nicht zu neuen Auth-/Supabase-Abhaengigkeiten fuer reine Navigation.

---

## Phase F8 - Voice Command Reactivation Regression (2026-03-14)

**Scope:** Produktiver Hero-Hub Push-to-talk Voice-V1-Pfad inklusive lokalem Command-Orchestrator, Compound-Morning-Commands, Pending-Context-Confirm, VAD-Auto-Stop und kurzem TTS-Rueckkanal.

**Positive Voice Commands**

- [x] `Wasser 300 ml` -> lokaler `direct_match`, `intake_save`, kurzer lokaler Spoken-Reply, kein `midas-assistant`-Call.
- [x] `Protein 24 Gramm` -> lokaler `direct_match`, `intake_save`, kurzer lokaler Spoken-Reply.
- [x] `Salz 1,2 Gramm` -> lokaler `direct_match`, Dezimal-Komma wird korrekt normalisiert, kurzer lokaler Spoken-Reply.
- [x] `Ich habe morgens meine Medikamente genommen` -> lokaler Medikamentenpfad `medication_confirm_section`, kurze lokale Rueckmeldung nur fuer offene Morning-Slots.
- [x] `Ich habe 780 ml Wasser getrunken, 0,4 g Salz, 32 g Protein und abends meine Medikamente genommen` -> lokaler Compound-Plan, kein stiller Teilverlust, aggregierte lokale Rueckmeldung.

**Negative / Out-of-Scope**

- [x] `Was soll ich heute essen?` -> `fallback_semantic`, kurze lokale Rueckmeldung, kein Assistant-/LLM-Roundtrip im Voice-V1-Pfad.
- [x] `Ich habe etwas getrunken` -> kein stiller Write ohne klare Zahl/Einheit.
- [x] `Oeffne Vitals` -> parserseitig erkennbar, aber im Voice-V1-Scope lokal als `unsupported_local` geblockt.
- [x] `Gewicht 82` -> kein lokaler Vital-Write im Voice-V1-Pfad.
- [x] Gemischte Eingaben aus gueltigem Command plus fachfremdem Freitext fuehren nicht zu stiller Teilverarbeitung.

**Push-to-talk / VAD**

- [x] Hero-Hub Push-to-talk startet nur bei erlaubtem Gate-Status.
- [x] `assistant-voice` spiegelt die produktiven Voice-States sichtbar im Hub.
- [x] VAD-Auto-Stop beendet die Session kontrolliert und fuehrt aus `listening` sauber in den weiteren Voice-Flow.
- [x] Kurze Anfangssprache fuehrt nicht zu haengendem `listening`.

**Confirm / Pending Context**

- [x] `ja/nein/speichern/abbrechen` bleiben ohne brauchbaren Pending Context inert.
- [x] Positive Voice-Confirms fuehren den Zielpfad aus und clearen den Pending Context.
- [x] Negative Voice-Confirms verwerfen den Pending Context deterministisch.
- [x] `inFlight` und `consumed` blocken Doppeltrigger sauber.
- [x] Nach erfolgreichem `medication_confirm_section` mit realem `low_stock` folgt nur der enge Nachsatz `Lokalen Rezeptkontakt starten?`; `ja` oeffnet nur den lokalen Mailto-Pfad, `nein` beendet sauber.

**Static / Sanity**

- [x] `node --check` ist gruen fuer:
  - `app/modules/assistant-stack/voice/index.js`
  - `app/modules/hub/index.js`
  - `app/modules/assistant-stack/intent/index.js`
  - `app/modules/assistant-stack/intent/parser.js`
  - `app/modules/assistant-stack/intent/rules.js`
- [x] Kein normaler Assistant-/LLM-Roundtrip mehr im produktiven Voice-V1-Pfad.
- [x] Keine conversation-/resume-first Altpfade mehr im produktiven Voice-Adapter.
- [x] Keine Legacy-Begriffe wie `voice-llm-bypass` mehr im Voice-Runtime-Code.

**Note**

- [ ] Echte Browser-/Device-Mikrofonlaeufe bleiben zusaetzlich sinnvoll fuer spaetere Live-QA, auch wenn der produktive Runtime-Pfad lokal geharnesst und statisch verifiziert ist.

---

## Phase F14 - Fast Path QA & Regression Sweep (2026-03-17)

**Scope:** Produktive Fast Paths nach Voice- und Performance-Nachschnitt, inklusive sichtbarer Semantikkette, Breath-Timer-Fast-Path, Medication-Low-Stock-Follow-up und begrenzt machbarem PWA-Shortcut-Befund.

**Fast Paths / Positive**

- [ ] `Wasser 250 ml` -> lokaler `direct_match`, `intake_save`, kurzer deutscher Spoken-Reply ohne Denglisch-Rest.
- [ ] `Salz 2 g` -> lokaler `direct_match`, kurzer deutscher Spoken-Reply.
- [ ] `Protein 30 g` und `Proteine 30 g` -> gleicher lokaler `direct_match`; semantische Alias-Normalisierung fuehrt nicht zu Compound-Teilverlust.
- [ ] `Ich habe abends meine Medikamente genommen` -> lokaler `medication_confirm_section`-Pfad, bestaetigt nur offene Evening-Slots und liefert keinen Tages-Write mehr.
- [ ] `oeffne vitals` -> lokaler `open_module`-Pfad, Spoken-Reply natuerlich (`... ist offen`), kein Assistant-Roundtrip.
- [ ] `starte timer` -> lokaler `start_breath_timer`-Pfad, `3` Minuten Default, Rueckkehr in den BP-Kontext kontrolliert.

**Semantikkette / Regression**

- [ ] Touch-/Diag-/Fallback-Review kann bei echten Voice-Faellen die Kette sauber zeigen:
  - `surface_normalized_transcript`
  - `semantic_normalized_transcript`
  - `slots`
  - `intent_result`
- [ ] Reale Satzvarianten werden an der richtigen Schicht gepflegt:
  - Oberflaechenproblem -> `surface`
  - Alias-/Bedeutungsproblem -> `semantic` / `semantics/*`
  - strukturierter Wert -> `slots`
  - produktiver Fast Path -> `pattern / intent rules`
- [ ] Kein neuer produktiver Satz wird nur ueber Voice-Orchestrator-Sonderlogik statt ueber den gemeinsamen Intent-Kern tragfaehig gemacht.

**Medication / Reorder**

- [ ] Low-Stock-Follow-up bleibt eng:
  - nur nach erfolgreichem `medication_confirm_section`
  - nur bei frischem realem `low_stock`
  - nur `ja` / `nein`
- [ ] `ja` fuehrt hoechstens in den bestehenden lokalen Reorder-Start; kein Versand-/Bestellstatus entsteht.
- [ ] Reorder-Guards bleiben wirksam:
  - `notLowStock`
  - `doctorEmailMissing`
  - `mailtoUnavailable`
- [ ] Reorder-Lock und Reopen-Cooldown verhindern unmittelbare Doppeltrigger auch beim Voice-Follow-up.

**Breath Timer / BP-Kontext**

- [ ] Breath-Timer-Fast-Path wechselt kontrolliert in den vorbereiteten Vitals-/BP-Kontext.
- [ ] Waehren aktivem Breath-UI bleiben Save, Kontextwechsel und Tab-Wechsel blockiert.
- [ ] Nach Abschluss oder Abbruch bleibt kein Overlay-/Timer-Orphan zurueck.

**Performance / Spoken Surface**

- [ ] Die produktiven Perf-Segmente werden weiter im bestehenden Perf-Sampler gesammelt:
  - `voice_tap_to_listening`
  - `voice_first_speech_to_stop`
  - `voice_stop_to_transcribe_response`
  - `voice_transcribe_to_reply_ready`
  - `voice_reply_ready_to_tts_complete`
- [ ] Kurze lokale Spoken-Replies bleiben kurz und deutsch klingend; keine offensichtlichen `ge offnet`-/Zahlen-Denglisch-Faelle im Alltagspfad.

**PWA / Entry Point**

- [ ] Kein QA-Case erwartet einen echten Outside-the-app-Voice-Start ueber PWA.
- [ ] PWA-/Shortcut-Ideen bleiben auf `bestehenden Voice-Kontext schneller erreichen` begrenzt und erzeugen keinen zweiten Runtime-Pfad.

---

## Phase A5 - Assistant Surface Toggle & Hub Dashboard (2026-03-18)

**Scope:** Produktischer Sichtbarkeitsvertrag fuer Assistant/Text/Voice plus oberer Dashboard-Reveal im Hero-Hub.

**Toggle / Surface**

- [ ] Touch-Log-Toggle `Assistant` ist persistent und startet standardmaessig auf `off`.
- [ ] `off`:
  - Text-Assistant ist aus Carousel und Quickbar entfernt.
  - OG-MIDAS-Nadel ist beim Start sichtbar, aber nicht triggerbar.
  - kein sichtbares Voice-Statuslabel unter der passiven Nadel.
- [ ] Bei `off` liest sich der erste Swipe mit der passiven Nadel wie ein normaler erster Carousel-Schritt.
- [ ] Nach diesem ersten lesbaren Carousel-Schritt bei `off` verschwindet die passive Nadel wieder aus der regulaeren Rotation.
- [ ] `on`:
  - Text-Assistant ist in Carousel und Quickbar wieder sichtbar.
  - MIDAS-Nadel bleibt als produktiver Voice-Slot im Carousel.
  - Umschaltung funktioniert live ohne Reload.

**Hub Dashboard / Reveal**

- [ ] `swipe down` auf dem Hero/Orbit oeffnet das Dashboard oberhalb.
- [ ] `swipe up` auf dem Hero/Orbit oeffnet die Quicklinks unterhalb.
- [ ] Hero/Carousel bleibt die neutrale Mittelebene:
  - oben -> Mitte
  - Mitte -> unten
  - unten -> Mitte
  - Mitte -> oben
- [ ] Dashboard und Quicklinks sind nie gleichzeitig offen.

**Dashboard Content**

- [ ] Dashboard zeigt dieselben bestehenden Snapshot-Daten:
  - Wasser
  - Salz
  - Protein
  - Protein-Ziel
  - CKD
  - naechste `2` Termine
  - Restbudget
- [ ] Dashboard fuehrt keine neue Fachlogik oder abweichende Berechnung ein.
- [ ] Copy-Button im Dashboard nutzt denselben Snapshot-String wie der Assistant-Kontext.
- [ ] Copy-Icon ist als klares Symbol lesbar und nicht mehr als deformiertes Sonderzeichen.
- [ ] Normale lokale Intake-Saves ziehen das Dashboard sofort sichtbar mit, ohne Reload.

**Regression**

- [ ] Text-/Voice-/Hub-Flow bei `on` bleibt normal nutzbar.
- [ ] Bei `off` bleiben keine toten Buttons, keine halbaktiven Needle-Zustaende und kein UI-Drift sichtbar.
- [ ] Hub-Dashboard und Assistant-Panel zeigen konsistente Werte fuer denselben Snapshot-Zeitpunkt.

---

## Phase A6 - Hydration Target Dashboard (2026-03-30)

**Scope:** Lokaler Dashboard-Referenzwert `WASSER-SOLL` im bestehenden Pill-Block, ohne Reminder- oder Bewertungslogik.

**Smoke**

- [ ] Dashboard zeigt `WASSER-SOLL` direkt nach `WASSER` im bestehenden Pill-Block.
- [ ] Vor `07:00` zeigt `WASSER-SOLL` `0 ml`.
- [ ] Um `19:30` zeigt `WASSER-SOLL` `2000 ml`.
- [ ] Zwischenwerte folgen der Stützpunkt-Tabelle plausibel ohne Sprünge.

**Sanity**

- [ ] `WASSER-SOLL` nutzt keinen Backend-/Supabase-Pfad und bleibt auch ohne neuen Intake-Save berechenbar.
- [ ] Bei offenem Dashboard aktualisiert sich `WASSER-SOLL` mit dem Minutenwechsel weiter.
- [ ] `visibilitychange -> visible` zieht den Wert korrekt nach.
- [ ] `node --check app/modules/hub/index.js` ist gruen.

**Regression**

- [ ] Dashboard-Optik bleibt auf Desktop ruhig; der vierte Pill-Eintrag erzeugt keinen Layoutbruch.
- [ ] Mobile unter `768px` stapelt den Pill-Block weiterhin sauber vertikal.
- [ ] Keine Warntexte, Farben, Toasts oder Reminder-Nebenwirkungen entstehen durch das Feature.
- [ ] Wasser-Istwert, Salz, Protein, Termine und Restbudget bleiben unverändert funktional.

---

## Phase A7 - Android Widget & Shell (2026-04-02)

**Scope:** Minimaler nativer Android-Node fuer MIDAS mit read-only Homescreen-Widget, lokalem Snapshot-Cache, nativer Sync-Huelle und Ruecksprung in MIDAS.

**Smoke**

- [ ] APK laesst sich lokal installieren; App startet ohne Crash.
- [ ] Widget laesst sich auf dem Homescreen platzieren und zeigt die V2.1-Zeilen:
  - `Fluessigkeit`
  - `Medikation`
- [ ] `Fluessigkeit` zeigt Ist und Soll gemeinsam als Literwert, z. B. `0,6 / 1,7 L`.
- [ ] Fehlender Snapshot zeigt fuer Fluessigkeit den Platzhalter `-- / -- L`.
- [ ] Es gibt keine separate aktive `Wasser-Soll`-Zeile mehr.
- [ ] `Medikation` zeigt eine kompakte Summary, z. B. `Kein Plan`, `Morgens erledigt`, `Abends offen`, `Alles erledigt` oder `2/4 erledigt`.
- [ ] Ein Tap auf Widget oder Launcher fuehrt in die native MIDAS-Huelle.
- [ ] Nach einmaligem auth-faehigen Oeffnen der nativen MIDAS-Huelle verschwinden Platzhalter und das Widget zeigt echte Werte.

**Sanity**

- [ ] `Wasser-Soll` im Widget bleibt vertraglich konsistent zur MIDAS-Stuetzpunkt-Tabelle.
- [ ] `medicationSummary` bleibt konsistent zu `med_list_v2.slots[]` und faellt bei alten Snapshots sauber auf `medicationStatus` zurueck.
- [ ] Medication-Abschnittscopy nutzt `Morgens`, `Mittags`, `Abends`, `Nachts`.
- [ ] Das Widget bleibt read-only:
  - keine Capture-Aktionen
  - keine Reminder- oder Confirm-Buttons
  - keine versteckten Writes
- [ ] Nach dem ersten Bridge-/Auth-Export kann der periodische Android-Refresh ohne regelmaessige manuelle Shell-Oeffnung weiterlaufen.
- [ ] `:app:compileDebugKotlin` und `:app:assembleDebug` laufen mit lokalem Android-SDK/JDK gruen.

**Regression**

- [ ] Das Android-Widget fuehrt nicht zu Drift gegen MIDAS als Hauptsystem; Detailinteraktion bleibt in der PWA.
- [ ] Homescreen-Look ist fuer V2.1 ruhig genug; verbleibende vertikale Abstaende werden nicht vorschnell als MIDAS-Layoutfehler bewertet, wenn sie klar launcher-/Samsung-gridbedingt sind.
- [ ] README, Modul-Overview und Roadmap sprechen denselben Android-Node-Vertrag.

---

## Phase A8 - Android Native OAuth & Widget Activation (2026-04-02)

**Scope:** Nativer Google-/Supabase-OAuth fuer den Android-Node, Deep-Link-Callback, nativer Session-Owner, auth-konsistenter WebView-Boot und deterministischer Logout-/Clear-Lebenszyklus.

**Smoke**

- [ ] Android-Launcher: `Mit Google anmelden` startet den Login im sicheren Browser bzw. in `Custom Tabs`, nicht in der eingebetteten `WebView`.
- [ ] Nach erfolgreichem Login kehrt der OAuth-Callback sauber in die App zurueck; keine Google-Seite `Zugriff blockiert` / `Use secure browsers`.
- [ ] Nach erfolgreichem Callback wird die native Session uebernommen und das Widget wird aktivierbar bzw. zieht echte Werte statt Platzhalter.
- [ ] MIDAS in der Android-`WebView` bootet nach erfolgreichem nativen Login ohne unauth-Overlay-Flicker in einen konsistenten auth-Zustand.

**Logout / Session-Clear**

- [ ] Logout in `MainActivity` leert native Session, Widget-Zustand und sichtbaren Snapshot deterministisch.
- [ ] Logout in `MidasWebActivity` zieht Android, Widget und offene `WebView` gemeinsam nach.
- [ ] Nach Logout zeigt das Widget wieder Platzhalter statt alter Werte.
- [ ] Nach Logout bleibt die `WebView` nicht still im auth-Zustand haengen.

**PWA / Regression**

- [ ] Browser-/PWA-Google-Login funktioniert unveraendert weiter.
- [ ] Browser-/PWA-Logout funktioniert unveraendert weiter.
- [ ] Der gemeinsame Google-Login-Button im Browser bleibt der Web-Login; im Android-WebView startet derselbe Button keinen eingebetteten Google-OAuth mehr.
- [ ] `AUTH_CHECK` und Android-Bootstrap erzeugen keinen doppelten Refresh- oder unauth-Drift.

**Sanity**

- [ ] `:app:compileDebugKotlin` ist gruen.
- [ ] `:app:assembleDebug` ist gruen.
- [ ] Deep-Link-Konfiguration in Android + Supabase-Allowlist ist fuer das Testgeraet korrekt.
- [ ] Android-Bootstrap-Konfiguration (`REST + ANON`) ist fuer frische Installationen einmalig hinterlegt und fuehrt danach reproduzierbar zum nativen Login-Start.

## Phase P10 - Touchlog Maintenance & Mobile Diagnostics (2026-04-26)

**Scope:** Touchlog v2 als sichtbare Maintenance-Zentrale, Profil ohne sichtbare Push-Surface, mobile Diagnose und Push-Wartung.

**Static / Local Checks**

- [x] `node --check app/core/diag.js`
- [x] `node --check app/diagnostics/devtools.js`
- [x] `node --check app/modules/profile/index.js`
- [x] `git diff --check` fuer betroffene Dateien.
- [x] Statischer HTTP-Probe liefert `index.html` und `app/diagnostics/devtools.js` mit HTTP 200.
- [x] Touchlog-Anker vorhanden: `devTogglePush`, `devPushStatus`, `devPushDetails`, `devActiveModes`, `devClearLogBtn`, `diagLog`.

**Touchlog Desktop Smoke**

- [ ] Touchlog oeffnen und schliessen; Panel bleibt bedienbar.
- [ ] Push-Wartung, lokale Diagnosemodi, Hilfsaktionen und Log-Stream sind visuell getrennt.
- [ ] Log-Stream bleibt scrollbar und lesbar.
- [ ] `Touchlog leeren` leert nur den sichtbaren/localen Log.
- [ ] Aktive lokale Modi erscheinen als Status, nicht als wiederholter Log-Spam.

**Touchlog Mobile / Android Smoke**

- [ ] Touchlog am Android-Geraet oeffnen und schliessen.
- [ ] Header und `x` bleiben erreichbar.
- [ ] Panel ist nicht abgeschnitten und erzeugt keine horizontale Ueberbreite.
- [ ] Push-Wartung und Log-Stream sind getrennt lesbar.
- [ ] Button-, Toggle- und Status-Texte passen in den Viewport.

**Profile Regression**

- [ ] Profil oeffnet ohne Fehler.
- [ ] Keine sichtbare `Push & Erinnerungen`-Section.
- [ ] Keine Push-Buttons im Profil.
- [ ] Kein Profil-Push-Kurzstatus und keine Push-Health-Details im Profil.
- [ ] Stammdaten, Arztkontakt, Limits und Medication-Snapshot bleiben sichtbar.
- [ ] Kein toter Leerraum durch entfernte Push-Section.

**Push-Wartung**

- [ ] Push aktivieren ist nur im Touchlog sichtbar erreichbar.
- [ ] Push deaktivieren ist nur im Touchlog sichtbar erreichbar.
- [ ] Browser-Berechtigung und Browser-Abo werden ohne Endpoint/UID/Payload angezeigt.
- [ ] `Health-Check offen` wird nicht als harter Fehler behandelt, wenn kein echter faelliger Remote-Push gelaufen ist.
- [ ] Manueller Workflow-Smoke mit `window=all` und `status=no-incidents` gilt als erfolgreicher Scheduler/API-Smoke, aber nicht als echter Push-Delivery-Smoke.
- [ ] Echter faelliger Remote-Push schreibt spaeter sichtbar einen Remote-Erfolg.
- [ ] Echter Zustellfehler wird als Wartungsproblem sichtbar, ohne sensible Rohdaten anzuzeigen.

**Regression**

- [ ] Keine Produktdatenaktion aus dem Touchlog heraus.
- [ ] Kein Service-Worker-, Backend- oder Android-Native-Umbau erforderlich.
- [ ] Boot-Error-Fallback kann weiterhin den Touchlog oder Fallback-Log anzeigen.

---

## Phase P14 - Protein Targets CKD Fallback (2026-05-31)

**Scope:** Edge Function `midas-protein-targets` nutzt CKD konservativ ueber `Lab > Profil > Missing`; kein stiller `G1`-Default.

**Static / Local Checks**

- [x] `deno check backend/supabase/functions/midas-protein-targets/index.ts`
- [x] `git diff --check` fuer Edge Function, Protein Overview, QA und Roadmap.
- [x] Kein `parseCkdStage(...) || "G1"` und kein `|| "G1"` in `midas-protein-targets/index.ts`.
- [x] `ckd_source` ist nur Response-Diagnostik und wird nicht in `updatePayload` persistiert.
- [x] CKD-Faktorwerte bleiben unveraendert.
- [x] Activity-Schwellen bleiben unveraendert (`score >= 6`, `score >= 2`).
- [x] `minFactor` bleibt `roundTo(factorCurrent - 0.1, 2)`.

**Contract Smokes (deployment/runtime-gated)**

- [ ] Latest Lab hat `G3a A1`, Profil-CKD leer -> Function schreibt `protein_ckd_stage_g = G3a`.
- [ ] Latest Lab ohne `ckd_stage`, Profil `protein_ckd_stage_g = G3a` -> Function bleibt bei `G3a`, kein `G1`-Write.
- [ ] Latest Lab ohne `ckd_stage`, Profil ohne CKD, Auto -> Function skipped mit `ckd_stage_missing` und schreibt kein `user_profile`-Update.
- [ ] Doctor-Lock aktiv, valider Doctor-Faktor, Profil `G3a`, latest Lab ohne CKD -> Doctor-Ziele bleiben aus Doctor-Faktor; CKD-Metadaten werden nicht auf `G1` gesetzt.
- [ ] Doctor-Lock aktiv, valider Doctor-Faktor, Lab/Profile CKD missing -> Zielbereich darf aus Doctor-Faktor entstehen; CKD-Felder bleiben unveraendert.
- [ ] Cooldown bei unveraendertem Profil-Fallback skipped weiterhin mit `cooldown_unchanged`.

**Regression**

- [ ] Body-Save mit Gewicht triggert Protein-Edge-Aufruf weiterhin.
- [ ] Scheduler ohne `weight_kg` zieht weiterhin das letzte Body-Gewicht.
- [ ] Doctor-Lock ohne Doctor-Faktor skipped weiterhin mit `doctor_factor_missing`.
- [ ] Intake/Assistant konsumieren weiterhin `protein_target_min/max`; keine eigene CKD-Logik.
- [x] Supabase Deploy wurde erst nach expliziter Freigabe ausgefuehrt: `midas-protein-targets` ACTIVE, Version 17.

<!-- END SUPPLEMENT: docs/QA_CHECKS.md (post-release historical phases) -->
