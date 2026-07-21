# MIDAS Supabase Explicit Grants Roadmap

## Roadmap-Metadaten

| Feld | Wert |
| --- | --- |
| Status | `DONE` |
| Modul / Bereich | Supabase SQL / RLS / Data API Grants |
| Owner / Kontext | Backend, Supabase, Security, Provisioning |
| Erstellt am | `2026-07-02` |
| Letzter Stand | `2026-07-04, S6 abgeschlossen; Roadmap archiviert` |
| Aktueller Schritt | `DONE` |
| Betroffene Hauptdateien | `sql/16_Explicit_Grants.sql`, `sql/*.sql` als Inventarquelle, `sql/HOW_TO.md`, `docs/DEV_ENVIRONMENT.md`, `docs/QA_CHECKS.md`, relevante Module Overviews |
| Deploy relevant | `ja` |
| Runtime-Smoke relevant | `ja` |
| Archivziel | `docs/archive/MIDAS Supabase Explicit Grants Roadmap (DONE).md` |

## Current Working State / Handoff

- Aktueller Stand:
  - Supabase hat eine Breaking-Change-Mail zu expliziten Data-API-`GRANT`s fuer neue `public`-Tabellen verschickt.
  - MIDAS nutzt Supabase Data API / PostgREST / `supabase-js` in PWA, Android-Node und Edge-Function-nahen Pfaden.
  - Bestehende MIDAS-Tabellen laufen heute weiter.
  - SQL-Skripte enthalten RLS und Policies, aber Table-`GRANT`s sind nicht systematisch fuer alle `public`-Tabellen dokumentiert.
  - Einige Functions/RPCs haben bereits `grant execute`.
  - Einige Views haben bereits explizite `grant select`, z. B. `v_appointments_v2_upcoming`.
  - Alle SQL-Dateien in `sql/` wurden am `2026-07-03` vorbesprochen und grob klassifiziert.
  - Arbeitsentscheidung fuer S4:
    - Primaere Umsetzung ueber ein neues zentrales, idempotentes Master-SQL `sql/16_Explicit_Grants.sql`.
    - Bestehende Modul-/Legacy-/Transition-SQLs werden nicht rueckwirkend mit Grants angereichert, ausser S1-S3 finden einen zwingenden lokalen Contract-Grund.
    - `sql/HOW_TO.md` wird in S6 so erweitert, dass kuenftige Module ihre Grants entweder im Modul-SQL oder im zentralen Grants-SQL sichtbar pflegen muessen.
  - S4.1 ist abgeschlossen:
    - `sql/16_Explicit_Grants.sql` wurde mit Header, Run-Order, Safety Contract und S4-Platzhaltern angelegt.
    - Die Datei enthaelt noch keine produktiven Grants; die Objektgruppen werden in S4.2 bis S4.7 gefuellt.
  - S4.2 ist abgeschlossen:
    - `user_profile` und `health_events` haben objektgenaue Grants fuer `authenticated` und `service_role`.
    - `v_events_bp`, `v_events_body`, `v_events_lab` und `v_events_activity` haben objektgenaue `select`-Grants fuer `authenticated` und `service_role`.
    - Altgrants fuer `anon`, `public`, `authenticated` und `service_role` werden vor den Zielgrants bereinigt.
  - S4.3 ist abgeschlossen:
    - `appointments_v2` hat objektgenaue Grants fuer `authenticated` und `service_role`.
    - `v_appointments_v2_upcoming` hat objektgenaue `select`-Grants fuer `authenticated` und `service_role`.
    - Altgrants fuer `anon`, `public`, `authenticated` und `service_role` werden vor den Zielgrants bereinigt.
  - S4.4 ist abgeschlossen:
    - Medication-Tabellen sind objektgenau gegrantet.
    - `health_medication_stock_log` hat fuer `authenticated` bewusst kein `update`.
    - `med_*_v2`-RPCs sind zentral mit `execute` fuer `authenticated` und `service_role` gespiegelt.
    - Altgrants fuer `anon`, `public`, `authenticated` und `service_role` werden vor den Zielgrants bereinigt.
  - S4.5 ist abgeschlossen:
    - `trendpilot_events` hat Userrechte fuer Lesen, Ack/Update und Delete, aber kein User-Insert.
    - `trendpilot_events_range` hat `select` fuer `authenticated` und `service_role`.
    - `trendpilot_state` bleibt service-role-only.
    - S4.2 bis S4.5 wurden gegen additive Grant-Drift abgesichert: Zielrollen werden vor dem Re-Grant bereinigt.
  - S4.6 ist abgeschlossen:
    - `push_subscriptions` hat User-CRUD unter RLS und Service-DML.
    - `push_notification_deliveries` hat fuer `authenticated` nur `select`.
    - `push_notification_deliveries` hat volle DML-Rechte fuer `service_role`.
    - Altgrants fuer `anon`, `public`, `authenticated` und `service_role` werden vor den Zielgrants bereinigt.
  - S4.7 ist abgeschlossen:
    - `upsert_intake` ist von `anon` entkoppelt und auf `authenticated`, `service_role` begrenzt.
    - `activity_add`, `activity_list` und `activity_delete` sind zentral mit `execute` fuer `authenticated`, `service_role` gespiegelt.
    - Basistabellen-/Viewrechte fuer `health_events` und `v_events_activity` wurden gegen S4.2 abgeglichen.
  - S4.8 ist abgeschlossen:
    - `sql/HOW_TO.md` dokumentiert explizite Data-API-Grants fuer neue Tabellen, Views und RPCs.
    - `sql/16_Explicit_Grants.sql` ist als zentrales Nachzieh-/Provisioning-SQL dokumentiert.
    - `anon` bleibt ohne Table-/View-Grants und ohne `upsert_intake`-Execute im Zielvertrag.
    - RLS-vor-Policy-vor-Grant-Reihenfolge ist dokumentiert.
  - S4.9 ist abgeschlossen:
    - Alle aktiven Tabellen und Views aus dem SQL-Inventar sind im zentralen Grant-SQL abgedeckt.
    - Alle Data-API-RPCs sind im zentralen Grant-SQL abgedeckt.
    - Helper-/Trigger-/Internal-Funktionen bleiben bewusst ohne Data-API-Execute-Grant.
    - Supabase Security Advisor `pg_graphql_anon_table_exposed`-Objekte sind alle durch `sql/16_Explicit_Grants.sql` abgedeckt.
    - `pg_graphql_authenticated_table_exposed` wird nicht blind entfernt, weil MIDAS authentifizierte Data-API-Pfade benoetigt.
    - `auth_leaked_password_protection` ist als separates Auth-Dashboard-Hygiene-Thema abgegrenzt.
  - S5 lokale Checks sind abgeschlossen:
    - `git diff --check` erfolgreich.
    - Tabellen-/View-/Data-API-RPC-Abdeckung erneut erfolgreich geprueft.
    - Kein `grant ... to anon`, kein `grant all`, keine destruktiven Statements, keine RLS-/Policy-Aenderungen.
    - Realtime-relevante Tabellen haben `authenticated select`.
    - `trendpilot_state` bleibt ohne `authenticated`-Grant.
    - Scope-Check bestaetigt: keine App-/Backend-/Android- oder historischen SQL-Dateien wurden geaendert.
  - CodeRabbit-Review war gruen.
  - `sql/16_Explicit_Grants.sql` wurde produktiv in Supabase ausgefuehrt und lief erfolgreich durch.
  - Supabase Security Advisor nach SQL-Ausfuehrung:
    - `pg_graphql_anon_table_exposed`: keine Treffer mehr im neuen Export.
    - `pg_graphql_authenticated_table_exposed`: 16 verbleibende Warnungen, bewusst erwartbar fuer authentifizierte MIDAS-Data-API-Pfade.
    - `auth_leaked_password_protection`: 1 verbleibende Auth-Dashboard-Hygiene-Warnung, out of scope fuer Grant-SQL.
- Naechster erlaubter Schritt:
  - S5.12 Data-API-Smoke nach Live-SQL-Ausfuehrung.
- Aktuell bekannte Findings:
  - `SG-F1`: Public-Table-`GRANT`s fehlen oder sind nicht systematisch dokumentiert.
  - `SG-F2`: Existing project ist heute nicht akut kaputt, aber neue/provisionierte Tabellen koennen spaetestens ab `2026-10-30` ohne explizite Grants ueber Data API brechen.
  - `SG-F3`: `anon`-Zugriff darf nicht pauschal vergeben werden; MIDAS ist auth-getrieben.
  - `SG-F4`: SQL-Skripte sind historisch gemischt; einige sind idempotent, andere enthalten Drops oder alte Legacy-Bezuege.
  - `SG-F5`: GitHub-Copilot-Datenschutzentscheidung bleibt bewusst ausserhalb dieser SQL-Roadmap.
  - `SG-F6`: Mehrere aktive Tabellen haben RLS/Policies, aber keine expliziten Table-Grants im Repo-Vertrag.
  - `SG-F7`: Cleanup-/Transition-/Legacy-SQLs sind keine geeigneten Zielorte fuer neue Grants.
  - `SG-F8`: Bestehende RPC-Grants sind teilweise vorhanden; `upsert_intake` soll in S4 von `anon` entkoppelt und auf `authenticated`, `service_role` begrenzt werden.
  - `SG-F9`: `01_Health Schema.sql` enthaelt vorbestehende, syntaktisch auffaellige Kommentar-/Listenzeilen; fuer diese Roadmap nur als Legacy-/Idempotenzrisiko markiert.
  - `SG-F10`: `06_Security.sql` enthaelt vorbestehende Legacy-Bezuege auf `public.appointments`; fuer diese Roadmap nur als Abgrenzungsrisiko markiert.
  - `SG-F11`: Security-invoker-RPCs brauchen neben `grant execute` auch passende Basistabellenrechte fuer den aufrufenden User.
  - `SG-F12`: `upsert_intake` hat keinen belegten anonymen Runtime-Pfad mehr; S4 soll `anon`-Execute gezielt entfernen.
  - `SG-F13`: Realtime-Refresh haengt an `authenticated select` auf den beobachteten Tabellen.
  - `SG-F14`: `trendpilot_state` bleibt nach Scan service-role-only; S5 muss sicherstellen, dass kein User-Flow darauf angewiesen ist.
  - `SG-F15`: `sql/16_Explicit_Grants.sql` ist ein Nachzieh-/Provisioning-SQL nach Objektanlage, kein standalone Schema-Bootstrap.
  - `SG-F16`: Supabase Security Advisor meldet aktuell `pg_graphql_anon_table_exposed` fuer 17 MIDAS-Objekte; S4.9 bestaetigt, dass alle betroffenen Objekte durch Revoke-/Zielgrant-Vertrag in `sql/16_Explicit_Grants.sql` abgedeckt sind.
  - `SG-F17`: Supabase Security Advisor meldet `pg_graphql_authenticated_table_exposed`; S4.9 bewertet diese Warnungen nicht pauschal als Fehler, weil `authenticated select` fuer MIDAS-Data-API-Pfade fachlich erforderlich ist und durch RLS/Policies kontrolliert wird.
  - `SG-F18`: Supabase Auth `auth_leaked_password_protection` ist eine separate Dashboard-Hygiene-Einstellung und nicht Teil des SQL-Grant-Vertrags.
- Aktuell geaenderte Dateien:
  - `docs/MIDAS Supabase Explicit Grants Roadmap.md`
  - `sql/16_Explicit_Grants.sql`
  - `sql/HOW_TO.md`
- Offene User-Freigaben:
  - SQL-Aenderungen.
  - produktives Supabase-Ausfuehren.
  - Supabase Dashboard Security Advisor / RLS Tester.
- Wichtige Grenzen fuer den naechsten Chat:
  - Kein produktives SQL ohne explizite User-Freigabe.
  - Keine RLS-Lockerung.
  - Keine pauschalen `grant all`-Aenderungen.
  - Keine `anon`-Table-Writes.
  - Keine Migration gegen Live-Daten ohne vorherigen Contract Review.

## Ziel (klar und pruefbar)

MIDAS soll gegen die Supabase-Data-API-Grant-Aenderung zukunftsfest werden, ohne RLS-Sicherheit zu verschlechtern.

Pruefbare Zieldefinition:

- Jede Data-API-relevante `public`-Tabelle im MIDAS-SQL-Bestand hat einen expliziten, reviewbaren `GRANT`-Vertrag.
- Der Grant-Vertrag wird primaer in einem zentralen SQL-Skript `sql/16_Explicit_Grants.sql` gebuendelt, sofern S1-S3 keinen zwingenden Grund fuer lokale Modul-SQL-Aenderungen finden.
- Rollenrechte sind minimal und passend:
  - `authenticated` fuer normale User-Data-API-Pfade.
  - `service_role` fuer Edge-/Scheduler-/Admin-Pfade.
  - `anon` nur bei explizit begruendetem Bedarf.
- RLS bleibt fuer userbezogene Tabellen aktiv.
- Views und RPCs behalten oder erhalten passende explizite Grants.
- SQL-Skripte bleiben idempotent oder markieren bewusst nicht-idempotente Legacy-/Transition-Skripte.
- Supabase Deploy/SQL-Ausfuehrung ist user-gated und wird erst nach S5/Review freigegeben.
- QA dokumentiert, wie ein neuer Chat die Data-API-Grant-Sicherheit prueft.

## Problemzusammenfassung

Supabase aendert die Defaults fuer neue Tabellen im `public`-Schema:

- Neue `public`-Tabellen werden nicht mehr automatisch fuer Data API / PostgREST / GraphQL exponiert.
- Neue Tabellen brauchen explizite `GRANT`s, bevor `supabase-js` oder direkte `/rest/v1/`-Calls sie erreichen.
- Existing tables behalten heutige Grants, aber bestehende Projekte werden ab `2026-10-30` in den neuen Default ueberfuehrt.
- Ein Projekt kann heute unauffaellig sein und spaeter beim naechsten neuen Table-/Provisioning-Schritt brechen.

MIDAS-Risiko:

- MIDAS-SQL legt mehrere `public`-Tabellen an.
- Viele Tabellen haben RLS-Policies, aber keine expliziten Table-`GRANT`s im Skript.
- Re-Provisioning, neue Module oder ein neues Supabase-Projekt koennen ohne Grants mit `42501` scheitern.
- Eine zu breite Korrektur koennte dagegen Daten zu weit exponieren.

## Entscheidungslog

| Datum | Entscheidung | Begruendung | Betroffene Schritte |
| --- | --- | --- | --- |
| `2026-07-02` | Eigene Roadmap statt Schnellfix | SQL/RLS/Data-API beruehrt Security und Provisioning; volle S1-S6-Disziplin ist angemessen. | `S1-S6` |
| `2026-07-02` | Existing Project nicht als akuter Incident behandeln | Bestehende Tabellen laufen weiter; Risiko liegt in zukuenftigen neuen/provisionierten Tabellen und spaetestens im Oktober-Default. | `S1-S3` |
| `2026-07-02` | `authenticated` ist Default-User-Rolle fuer MIDAS-Tabellen | MIDAS ist auth-getrieben; `anon` soll nicht pauschal Tabellenzugriff erhalten. | `S2-S4` |
| `2026-07-02` | `service_role` explizit mitdenken | Edge Functions und GitHub-Scheduler nutzen Service Role; Grants sollen diffbar und eindeutig sein. | `S2-S4` |
| `2026-07-02` | Keine produktive SQL-Ausfuehrung ohne User-Freigabe | Live-DB-Schreibwirkung muss bewusst passieren. | `S5-S6` |
| `2026-07-03` | Zentrales Master-SQL fuer Grants bevorzugen | Bestehende SQLs sind historisch gemischt; ein eigenes `sql/16_Explicit_Grants.sql` ist idempotent, reviewbar und vermeidet unnoetige Retrofits in Cleanup-/Transition-Dateien. | `S1-S5` |
| `2026-07-03` | Bestehende Modul-SQLs bleiben Inventarquelle, nicht primaeres Patch-Ziel | S4 soll Rechtevertrag hinzufuegen, aber keine alten DDL-/Migration-Skripte neu ordnen oder reparieren. | `S1-S4` |
| `2026-07-03` | Kein `anon`-Table-/View-Zugriff und kein `anon`-Execute fuer `upsert_intake` im Zielvertrag | MIDAS nutzt Auth-Header; der aktuelle Intake-RPC-Pfad ist kein anonymer Public-Flow. | `S2-S4` |
| `2026-07-03` | Security-invoker-RPCs muessen durch Basistabellen-Grants gestuetzt werden | `grant execute` allein reicht fuer `security invoker`-Funktionen nicht sauber, wenn Tabellenrechte fehlen. | `S2-S4` |
| `2026-07-03` | Realtime-Tabellen werden ueber normale `authenticated select`-Grants abgesichert | Realtime-Collector ist nur Refresh-Signal; er braucht keine Sonderrolle, aber die beobachteten Tabellen muessen fuer den User lesbar bleiben. | `S3-S5` |
| `2026-07-03` | `trendpilot_state` bleibt im Zielvertrag service-role-only | S3 fand keinen belegten PWA-/Android-User-Consumer; Trendpilot-State ist Backend-/Edge-State. | `S3-S5` |
| `2026-07-03` | `sql/16_Explicit_Grants.sql` wird nach den Objekt-SQLs ausgefuehrt | Ein zentrales Grant-SQL ist idempotent, aber setzt vorhandene Tabellen/Views/RPCs voraus. | `S4-S6` |

## Scope

- SQL-Skripte in `sql/`:
  - Neues zentrales Grant-SQL `sql/16_Explicit_Grants.sql`.
  - Tabellen-`GRANT`s als expliziter, gruppierter Rollenvertrag.
  - View-`GRANT`s als expliziter, gruppierter Rollenvertrag.
  - RPC-/Function-`GRANT`s, falls Inventar Drift findet oder bestehende Grants bewusst gespiegelt werden sollen.
  - RLS-Enablement und Policies nur reviewen, nicht lockern.
  - Bestehende SQL-Dateien bleiben Inventar- und Vergleichsquelle.
- Doku:
  - `sql/HOW_TO.md`
  - `docs/DEV_ENVIRONMENT.md`, falls Supabase Security Advisor / RLS Tester / SQL-Ausfuehrungshinweise ergaenzt werden muessen.
  - `docs/QA_CHECKS.md`
  - relevante Module Overviews nur falls Grants dort als Source-of-Truth relevant sind.
- QA:
  - lokale SQL-Strukturscans.
  - Supabase Dashboard Security Advisor als manueller Check.
  - optionaler PostgREST-/Supabase-Client-Smoke nach User-Freigabe.

## Not in Scope

- Keine neue Datenmodellierung.
- Keine RLS-Policy-Lockerung.
- Keine neuen Tabellen oder Module.
- Keine Migration von `public` in ein anderes Schema.
- Kein Umbau auf server-only Backend.
- Kein Wechsel weg von Supabase Data API.
- Keine Pauschalrechte wie `grant all on all tables in schema public to anon`.
- Kein blindes `grant all on all tables in schema public` fuer irgendeine Rolle.
- Keine Rueckmigration historischer SQL-Dateien nur aus kosmetischen Gruenden.
- Keine produktive SQL-Ausfuehrung ohne explizite Freigabe.
- Keine GitHub-Copilot-Datenschutzentscheidung; das bleibt eine manuelle Account-Setting-Pruefung.

## Relevante Referenzen (Code)

- `sql/00_Tabua Rasa.sql`
- `sql/01_Health Schema.sql`
- `sql/02_Admin Checks.sql`
- `sql/04_Body_Comp.sql`
- `sql/05_Intake_Rpc.sql`
- `sql/06_Security.sql`
- `sql/07_Remove_Day_Flags.sql`
- `sql/09_Appointments_v2.sql`
- `sql/10_User_Profile_Ext.sql`
- `sql/11_Lab_Event_Extension.sql`
- `sql/12_Medication.sql`
- `sql/13_Activity_Event.sql`
- `sql/14_Trendpilot.sql`
- `sql/15_Push_Subscriptions.sql`
- `sql/transition_bp_comment.sql`
- `sql/16_Explicit_Grants.sql` geplant
- `backend/supabase/functions/*/index.ts`
- `app/supabase/*.js`
- `app/modules/**/*.js`
- `android/app/src/main/java/de/schabuss/midas/widget/WidgetSyncRepository.kt`

## Relevante Referenzen (Doku)

- `README.md`
- `docs/DEV_ENVIRONMENT.md`
- `docs/QA_CHECKS.md`
- `sql/HOW_TO.md`
- `docs/modules/Protein Module Overview.md`
- `docs/modules/Trendpilot Module Overview.md`
- `docs/modules/Push Module Overview.md`
- `docs/modules/Appointments Module Overview.md`
- `docs/modules/Android Widget Module Overview.md`
- `docs/archive/MIDAS Trendpilot Review Findings Roadmap (DONE).md`
- `docs/archive/MIDAS Monthly Report Review Findings Roadmap (DONE).md`
- `docs/archive/MIDAS Incident Push Review Findings Roadmap (DONE).md`

Externe Referenz:

- Supabase Breaking Change: `https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically`
- Supabase Discussion: `https://github.com/orgs/supabase/discussions/45329`

Regel:

- Erst Supabase-Aenderung und lokale SQL-Konventionen lesen.
- Dann Tabellen/Views/RPCs inventarisieren.
- Dann Data-API-Consumer mappen.
- Erst nach S4 Readiness Review SQL aendern.

## Guardrails

- RLS bleibt fuer alle userbezogenen Tabellen aktiv.
- Grants ersetzen keine Policies.
- Grants duerfen keine fremden Userdaten freigeben.
- `anon` bekommt nur Rechte, wenn ein bestehender, begruendeter unauthentifizierter Pfad existiert.
- `authenticated` bekommt nur Rechte, die durch RLS/Policies fachlich gedeckt sind.
- `service_role` darf explizit grantbar sein, bleibt aber nie clientseitig sichtbar.
- Keine hidden production writes.
- SQL bleibt reviewbar, diffbar und moeglichst idempotent.
- Edge Functions und Scheduler behalten ihre Service-Role-Grenzen.
- Source-of-Truth-Dokus muessen am Ende synchron sein.

## Architektur-Constraints

- MIDAS nutzt Supabase Auth und RLS als Sicherheitsgrenze fuer Userdaten.
- MIDAS nutzt Data API / PostgREST ueber:
  - `supabase-js` im Browser/PWA.
  - Android native REST-Reads.
  - Edge Functions mit Service Role.
- Bestehende Tabellen behalten kurzfristig ihre aktuellen Grants, aber neue Tabellen in `public` brauchen explizite Grants.
- `service_role` umgeht RLS technisch, braucht aber fuer Data-API-/PostgREST-Reichbarkeit weiterhin eindeutige Grants im neuen Supabase-Modell.
- Views mit `security_invoker` sollen weiterhin ueber zugrundeliegende RLS/Grants kontrolliert bleiben.
- RPCs brauchen `grant execute`, wenn sie ueber Data API nutzbar sein sollen.
- Produktive SQL-Ausfuehrung hat echte DB-Schreibwirkung und ist user-gated.

## SQL-Datei-Klassifizierung aus Vorpruefung 2026-07-03

Diese Klassifizierung ist die Ausgangslage fuer S1. Sie ersetzt nicht das deterministische Inventar, begrenzt aber die erwartete Umsetzungsform.

| SQL-Datei | Rolle im Bestand | Grant-Entscheidung fuer S4 |
| --- | --- | --- |
| `00_Tabua Rasa.sql` | Destruktives Cleanup/Reset-Skript fuer Health-Objekte. | Keine Grants hier einbauen; bewusst aus Scope fuer S4. |
| `01_Health Schema.sql` | Core-Tabellen `user_profile`, `health_events`, Core-Views `v_events_bp`, `v_events_body`, RLS/Policies. | Objektquelle fuer zentrale Grants. Bestehendes SQL nicht retroaktiv umbauen, ausser S1-S3 verlangen es. |
| `02_Admin Checks.sql` | Admin-/QA-Abfragen, keine DDL-Source-of-Truth. | Keine Grants hier einbauen. |
| `04_Body_Comp.sql` | Delta fuer Body-Validierung und `v_events_body`. | View-/Basistabellen-Quelle fuer zentrale Grants; Datei selbst nicht Ziel. |
| `05_Intake_Rpc.sql` | RPC `upsert_intake` inkl. bestehendem `grant execute`. | Bestehenden Execute-Grant in S2 pruefen; zentrale Datei darf ihn spiegeln/korrigieren, falls entschieden. |
| `06_Security.sql` | Security-/Policy-Patch mit Legacy-Bezug auf `public.appointments`. | Nicht primaeres Ziel fuer Grants; Legacy-Bezug in S1/S3 markieren. |
| `07_Remove_Day_Flags.sql` | Cleanup/Transition fuer alten Event-Typ. | Keine Grants hier einbauen. |
| `09_Appointments_v2.sql` | Aktives Appointments-v2-Schema inkl. View-Grant. Enthaelt Drops und ist nicht reines Idempotenz-Master-SQL. | `appointments_v2` und View in zentrale Grants aufnehmen; bestehende View-Grants gegen Vertrag pruefen. |
| `10_User_Profile_Ext.sql` | Erweiterung von `user_profile`. | Keine eigene Grants-Aenderung; `user_profile` zentral abdecken. |
| `11_Lab_Event_Extension.sql` | Lab-Event-Erweiterung und `v_events_lab`. | View-/Basistabellen-Quelle fuer zentrale Grants. |
| `12_Medication.sql` | Aktives Medication-Schema mit vier Tabellen und vielen RPC-Grants. | Tabellen und RPCs zentral pruefen/abdecken; bestehende Execute-Grants gegen Vertrag pruefen. |
| `13_Activity_Event.sql` | Activity-Erweiterung, `v_events_activity`, Activity-RPCs. | View/RPCs zentral pruefen/abdecken. |
| `14_Trendpilot.sql` | Aktive Trendpilot-Tabellen und View. | Tabellen und View zentral abdecken. |
| `15_Push_Subscriptions.sql` | Aktive Push-Tabellen. | Tabellen zentral abdecken; service-role Schreibpfade gesondert pruefen. |
| `transition_bp_comment.sql` | Transition-Skript fuer BP-Kommentar und Lab-View-Anpassung. | Keine Grants hier einbauen; betroffene Views zentral abdecken. |
| `HOW_TO.md` | SQL-Arbeitsvertrag. | In S6 um Explicit-Grants-Konvention ergaenzen. |
| `16_Explicit_Grants.sql` | Neu geplantes zentrales Grant-SQL. | Primaeres S4-Umsetzungsartefakt. |

Vorlaeufiges Fazit:

- Es wird kein pauschales globales Grant-SQL geschrieben.
- Es wird ein zentrales, explizit nach Objekten gruppiertes Grant-SQL geschrieben.
- Historische, destruktive oder reine Admin-Dateien bleiben unveraendert.
- Bestehende Modul-SQLs bleiben fachliche Quelle fuer Objekt- und RLS-Vertrag.

## Tool Permissions

Allowed:

- Lesen aller SQL-, Doku-, Edge-Function- und Client-Consumer-Dateien.
- Aendern von SQL-Dateien in `sql/` nach abgeschlossenem S4 Readiness Review.
- Aendern von `sql/HOW_TO.md`, `docs/DEV_ENVIRONMENT.md`, `docs/QA_CHECKS.md` und relevanten Module Overviews in S6.
- Lokale Scans:
  - `rg`
  - `git diff --check`
  - strukturierte SQL-Objektinventare per PowerShell.
- Nach User-Freigabe:
  - Supabase Dashboard Security Advisor manuell pruefen.
  - SQL im Supabase SQL Editor oder via erlaubtem Tool ausfuehren.
  - PostgREST-/Client-Smoke gegen Live-Projekt.

Forbidden:

- Produktives SQL ohne User-Freigabe.
- Destruktive SQL-Befehle wie `drop table`, `truncate`, Datenmigrationen oder Policy-Loeschen ohne separaten Review.
- Pauschale Grants an `public` oder `anon` ohne konkrete Begruendung.
- Service-Role-Key in Client-/Doku-Ausgaben leaken.
- Edge Function Deploys ohne explizite Freigabe.
- Supabase-Projektkonfiguration blind aendern.

## Deploy- und Runtime-Status

| Feld | Wert |
| --- | --- |
| Lokale Codeaenderung | `geplant, SQL/Doku` |
| Lokale Checks | `offen` |
| Supabase Deploy | `offen, user-gated` |
| GitHub Workflow-Smoke | `nicht relevant, ausser S1-S3 finden Workflow-Abhaengigkeit` |
| Browser-/Device-Smoke | `offen, nach SQL-Freigabe Data-API-Smoke definieren` |
| Produktive Schreibwirkung | `ja, erst nach User-Freigabe` |
| Letzter Remote-Nachweis | `none` |

## Execution Mode

- Sequenziell arbeiten: `S1` bis `S6`.
- `S1` bis `S3` sind Detektivarbeit, Systemverstaendnis und Contract Review.
- Nach `S3` gibt es einen expliziten S4 Readiness Review.
- `S4` ist SQL-/Doku-Umsetzung, substepweise.
- `S5` prueft lokal, optional live nach Freigabe, und klassifiziert externe Findings.
- `S6` synchronisiert Doku/QA, finalisiert die Roadmap und gibt eine Commit-Empfehlung.
- Kein produktives SQL in S4/S5 ohne User-Freigabe.

## Skalierung der Roadmap

Diese Roadmap ist mittelgross bis sicherheitsrelevant, weil SQL/RLS/Data-API betroffen sind.

Folge:

- S1 bis S6 voll anwenden.
- S4 substepweise.
- S5 strikt trennen:
  - lokal ausfuehrbare Scans.
  - SQL-Live-Ausfuehrung nur nach Freigabe.
  - Data-API-Smoke nur nach Freigabe.
- Optionaler CodeRabbit-/externer Review nach S5 sinnvoll.

## Statusmatrix

| ID | Schritt | Status | Ergebnis/Notiz |
| --- | --- | --- | --- |
| S1 | System- und Vertragsdetektivarbeit | DONE | Supabase-Aenderung, lokale SQL-Objekte, RLS/Grant-Iststand und Data-API-Consumer inventarisiert; zentrales Grants-SQL bestaetigt. |
| S2 | Fachlicher/technischer Contract Review | DONE | Minimaler Grant-Vertrag pro Rolle und Objektklasse festgelegt; `anon`-Altlast bei `upsert_intake` fuer S4 markiert. |
| S3 | Bruchrisiko-, Security- und Umsetzungsreview | DONE | Bruchrisiken, Live-DB-Risiken, Realtime-Vertrag, S4-Substeps und S5-Checks konkretisiert. |
| S4 | Umsetzung | TODO | SQL-Grant-Vertrag und ggf. Doku-Konventionen substepweise umsetzen. |
| S5 | Tests, Code Review und Contract Review | TODO | Lokale SQL-Strukturscans, optionale Live-Smokes, externer Review-Gate. |
| S6 | Doku-Sync, QA-Update und finaler Abschlussreview | TODO | SQL How-To, QA, Module Overviews und Roadmap final synchronisieren. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Finding-Klassifizierung

| ID | Severity | Typ | Status | Entscheidung / Zielschritt |
| --- | --- | --- | --- | --- |
| `SG-F1` | `P1` | `SQL` / `Contract` | `confirmed` | Public-Table-`GRANT`s fehlen oder sind nicht systematisch dokumentiert; S1 inventarisiert, S4 korrigiert. |
| `SG-F2` | `P1` | `Runtime` / `Future Break` | `confirmed` | Neue/provisionierte Tabellen koennen ab Supabase-Default ohne Grants ueber Data API brechen; S2/S4 Zielvertrag. |
| `SG-F3` | `P1` | `Security` / `Roles` | `confirmed` | `anon` darf nicht pauschal Table-Rechte bekommen; S2 Rollenvertrag. |
| `SG-F4` | `P2` | `SQL` / `Hygiene` | `confirmed` | SQL-Skripte sind historisch gemischt; S1/S3 klaeren, ob nur Grants oder auch How-To-Konvention angepasst wird. |
| `SG-F5` | `Watchlist` | `Account` / `Privacy` | `deferred` | GitHub Copilot Training-Opt-out ist manuelle Account-Einstellung und nicht Teil dieser SQL-Roadmap. |
| `SG-F6` | `P1` | `SQL` / `Provisioning` | `confirmed` | Aktive Tabellen mit RLS/Policies haben im Repo keinen vollstaendigen expliziten Table-Grant-Vertrag; S4 ueber `sql/16_Explicit_Grants.sql`. |
| `SG-F7` | `P2` | `SQL` / `Scope` | `confirmed` | Cleanup-/Transition-/Legacy-SQLs duerfen nicht blind gepatcht werden; S1/S3 grenzen sie als Inventarquelle oder out-of-scope ab. |
| `SG-F8` | `P2` | `RPC` / `Roles` | `decision-made` | Bestehende RPC-Grants sind uneinheitlich; `upsert_intake` soll in S4 auf `authenticated`, `service_role` begrenzt und von `anon` entkoppelt werden. |
| `SG-F9` | `P2` | `SQL` / `Legacy Hygiene` | `confirmed` | `01_Health Schema.sql` enthaelt vorbestehende syntaktisch auffaellige Kommentar-/Listenzeilen; in S3 als Risiko pruefen, nicht in S4 Grants-Fix vermischen. |
| `SG-F10` | `P2` | `SQL` / `Legacy Scope` | `confirmed` | `06_Security.sql` enthaelt vorbestehende Legacy-Bezuege auf `public.appointments`; in S3 als Scope-Risiko pruefen, nicht blind patchen. |
| `SG-F11` | `P1` | `RPC` / `Base Grants` | `confirmed` | `security invoker`-RPCs brauchen passende Basistabellen-Grants; S4 muss Tabellenrechte fuer Intake, Activity und Medication passend setzen. |
| `SG-F12` | `P2` | `Security` / `Roles` | `decision-made` | Kein belegter anonymer Intake-Flow; S4 soll `revoke execute on function public.upsert_intake(...) from anon` aufnehmen. |
| `SG-F13` | `P1` | `Realtime` / `Table Grants` | `confirmed` | Android Widget beobachtet `health_events`, Medication-Tabellen und `appointments_v2`; S4/S5 muessen `authenticated select` fuer diese Tabellen pruefen. |
| `SG-F14` | `P2` | `Trendpilot` / `Scope` | `decision-made` | `trendpilot_state` hat keinen belegten User-Consumer; S4 gibt `authenticated` keine Rechte, S5 prueft per Scan gegen Drift. |
| `SG-F15` | `P2` | `SQL` / `Run Order` | `decision-made` | `sql/16_Explicit_Grants.sql` ist als Nachzieh-/Provisioning-SQL nach den Objekt-SQLs zu behandeln; Header und HOW_TO muessen das sichtbar machen. |

Severity-Vertrag:

- `P0`: blockiert Umsetzung oder kann produktiv falsche/sensible Writes, Auth-Bruch oder harte Datenfehler erzeugen.
- `P1`: echter Contract-/Runtime-/Security-Bug, muss in dieser Roadmap adressiert oder explizit abgegrenzt werden.
- `P2`: Hygiene, Robustheit oder Doku-Verbesserung ohne akuten Blocker.
- `Watchlist`: erkannt, aber nicht Teil dieser Roadmap.

Finding-Status:

- `open`: erkannt, aber noch nicht bestaetigt oder entschieden.
- `confirmed`: durch Detektivarbeit bestaetigt und in spaeterem Schritt zu adressieren.
- `decision-made`: fachliche Entscheidung ist gefallen; Umsetzung oder Risiko-Check folgt in spaeterem Schritt.
- `deferred`: bewusst ausserhalb dieser Roadmap.

---

## S1 - System- und Vertragsdetektivarbeit

Ziel:

- Supabase-Change und MIDAS-Iststand verstehen.
- Keine SQL-Aenderung.
- Vollstaendiges Objektinventar erstellen.

Substeps:

- S1.1 Supabase Breaking Change lesen und Timeline dokumentieren:
  - `2026-05-30`: neuer Default fuer neue Projekte.
  - `2026-10-30`: Durchsetzung fuer bestehende Projekte.
- S1.2 `sql/HOW_TO.md` und SQL-Konventionen lesen.
- S1.3 Alle `sql/*.sql` einzeln lesen und klassifizieren:
  - aktive Schema-/Modul-SQLs.
  - Delta-/Transition-SQLs.
  - Cleanup-/Reset-SQLs.
  - reine Admin-/QA-SQLs.
- S1.4 Alle `sql/*.sql` auf Tabellen, Views, RPCs, RLS, Policies und Grants scannen.
- S1.5 Data-API-Consumer mappen:
  - Browser/PWA `supabase-js`.
  - Android native REST.
  - Edge Functions / Service Role.
- S1.6 Kandidatenentscheidung pro SQL-Datei dokumentieren:
  - direkte Aenderung notwendig.
  - nur Objektquelle fuer `sql/16_Explicit_Grants.sql`.
  - bewusst aus Scope.
- S1.7 Objektinventar erstellen:
  - Tabelle.
  - View.
  - Function/RPC.
  - vorhandene Grants.
  - vorhandene RLS/Policies.
  - benoetigte Rollen.
- S1.8 Legacy-/Nicht-Idempotenz-Risiken markieren.
- S1.9 Erste Findings dokumentieren.
- S1.10 Contract Review S1.
- S1.11 Findings korrigieren und Schritt-Abnahme dokumentieren.

Output:

- Vollstaendige Grant-/RLS-Systemkarte.
- Liste der S4-Pflichtobjekte.
- Liste der bewusst nicht betroffenen Objekte.
- Bestaetigung oder Korrektur der Vorentscheidung `sql/16_Explicit_Grants.sql`.

Exit-Kriterium:

- Es ist klar, welche SQL-Objekte Grants brauchen und welche Rollen beteiligt sind.

## S2 - Fachlicher/technischer Contract Review

Ziel:

- Rollen- und Grant-Vertrag festlegen.
- Sicherheitsgrenzen vor SQL-Aenderung definieren.

Substeps:

- S2.1 Ziel gegen MIDAS-Security-Guardrails pruefen.
- S2.2 Rollenvertrag definieren:
  - `authenticated`.
  - `service_role`.
  - `anon`.
- S2.3 Tabellenvertrag definieren:
  - read/write Tabellen.
  - read-only Tabellen.
  - service-only Tabellen.
- S2.4 View-Vertrag definieren:
  - `security_invoker`.
  - `grant select`.
  - zugrundeliegende Tabellenrechte.
- S2.5 RPC-/Function-Vertrag definieren:
  - `grant execute`.
  - `security invoker` vs. bestehender Function-Vertrag.
- S2.6 Live-DB-Ausfuehrungsstrategie definieren:
  - nur nach User-Freigabe.
  - keine destruktiven Befehle.
  - Smoke-Kandidaten.
- S2.7 Umsetzungsstrategie final festlegen:
  - ein zentrales `sql/16_Explicit_Grants.sql`.
  - oder begruendete Abweichung mit einzelnen Modul-SQL-Aenderungen.
- S2.8 Contract Review S2.
- S2.9 Findings korrigieren und Schritt-Abnahme dokumentieren.

Output:

- Minimaler Grant-Vertrag pro Objektklasse.
- Keine offenen Grundsatzfragen fuer S4.
- Festgelegte Ziel-Dateistrategie fuer S4.

Exit-Kriterium:

- Es ist klar, welche Grants in welchem SQL-Skript stehen sollen und welche nicht.

## S3 - Bruchrisiko-, Security- und Umsetzungsreview

Ziel:

- Risiken vor SQL-Aenderung finden.
- S4-Reihenfolge sauber schneiden.

Substeps:

- S3.1 Bruchrisiken identifizieren:
  - fehlende Grants -> `42501`.
  - zu breite Grants -> Datenexposition.
  - `anon`-Fehlvergabe.
  - View funktioniert trotz View-Grant nicht, weil Basistabelle fehlt.
  - RPC funktioniert nicht, weil `execute` fehlt.
  - alter Legacy-SQL-Pfad kollidiert mit aktuellen Tabellen.
- S3.2 SQL-Idempotenz pruefen:
  - `create table if not exists`.
  - `grant` mehrfach ausfuehrbar.
  - keine neuen Drops.
- S3.3 Live-Risiken pruefen:
  - bestehende Daten bleiben unberuehrt.
  - Grants sind Rechteaenderungen, keine Datenaenderungen.
  - RLS bleibt aktiv.
- S3.4 S5-Checks definieren:
  - `rg`-Inventarcheck.
  - `git diff --check`.
  - optional Supabase Security Advisor.
  - optional PostgREST-Smoke.
- S3.5 S4-Substeps konkretisieren.
- S3.6 Contract Review S3.
- S3.7 Findings korrigieren und Schritt-Abnahme dokumentieren.

Output:

- Bruchrisiko-Liste.
- finale S4-Substeps.
- Checkplan fuer S5.

Exit-Kriterium:

- S4 hat klare Substeps und bekannte Review-Kriterien.

## S4 Readiness Review - Gate nach S3, vor S4

Ziel:

- Direkt vor SQL-Aenderung pruefen, ob Scope und Reihenfolge stimmen.

Prueffragen:

- Sind alle `create table`-Objekte im Grant-Inventar?
- Sind alle Views im View-Inventar?
- Sind alle RPCs mit Data-API-Nutzung im Execute-Grant-Inventar?
- Gibt es ein Objekt, das `anon` braucht, oder bleibt `anon` bewusst ohne Table-Rechte?
- Muss ein bestehender Legacy-SQL-Block bewusst aus Scope bleiben?
- Ist `sql/16_Explicit_Grants.sql` weiterhin die richtige Zielstrategie?
- Gibt es eine SQL-Datei, die ausnahmsweise lokal statt zentral geaendert werden muss?
- Sind S5-Smokes definierbar, ohne Live-Daten zu riskieren?
- Ist produktive SQL-Ausfuehrung weiterhin user-gated?

Typisches Ergebnis:

- S4-Substeps bestaetigen oder korrigieren.
- Neue Findings in die Finding-Tabelle aufnehmen.
- Erst danach SQL aendern.

Exit-Kriterium:

- S4 kann starten, ohne dass Reihenfolge, Scope oder Rollenvertrag unklar sind.

## S4 - Umsetzung

Ziel:

- Explizite Grants und SQL-Konventionen substepweise umsetzen.

Voraussichtliche Substeps:

- S4.1 Zentrales Grants-SQL anlegen:
  - neue Datei `sql/16_Explicit_Grants.sql`.
  - Header mit Zweck, Supabase-Change, Nicht-Destruktivitaet und User-Gate.
  - Header mit klarer Reihenfolge: nach den Objekt-SQLs ausfuehren, nicht als standalone Schema-Bootstrap.
  - keine Datenmigration, keine Drops, keine RLS-/Policy-Aenderung.
  - keine pauschalen `grant all on all tables`.
  - nur objektgenaue `grant`-/`revoke`-Statements.
- S4.2 Core Health und Erweiterungs-Views in `sql/16_Explicit_Grants.sql` abbilden:
  - Tabellen:
    - `user_profile`
    - `health_events`
  - Views:
    - `v_events_bp`
    - `v_events_body`
    - `v_events_lab`
    - `v_events_activity`
  - Extension-/Transition-Dateien bleiben unveraendert.
  - `health_events` muss `authenticated select/insert/update/delete` behalten, weil Intake, Vitals, Activity, Trendpilot-Ack-nahe Flows und Realtime daran haengen.
- S4.3 Appointments in `sql/16_Explicit_Grants.sql` abbilden:
  - Tabelle:
    - `appointments_v2`
  - View:
    - `v_appointments_v2_upcoming`
  - bestehende View-Grants aus `09_Appointments_v2.sql` gegen Zielvertrag pruefen und bei Bedarf im zentralen SQL konsolidieren.
  - `appointments_v2` braucht `authenticated select/insert/update/delete` fuer App und Android-Widget-Realtime.
- S4.4 Medication in `sql/16_Explicit_Grants.sql` abbilden:
  - Tabellen:
    - `health_medications`
    - `health_medication_schedule_slots`
    - `health_medication_slot_events`
    - `health_medication_stock_log`
  - RPCs:
    - bestehende `med_*_v2`-Execute-Grants pruefen.
    - nur explizit benoetigte Execute-Grants aufnehmen oder bestaetigen.
  - `health_medication_stock_log` bekommt fuer `authenticated` kein `update`.
  - Realtime-Tabellen brauchen mindestens `authenticated select`.
- S4.5 Trendpilot in `sql/16_Explicit_Grants.sql` abbilden:
  - Tabellen:
    - `trendpilot_events`
    - `trendpilot_state`
  - View:
    - `trendpilot_events_range`
  - `trendpilot_state` bleibt service-role-only, sofern der S4 Readiness Review keinen neuen User-Consumer findet.
- S4.6 Push in `sql/16_Explicit_Grants.sql` abbilden:
  - Tabellen:
    - `push_subscriptions`
    - `push_notification_deliveries`
  - service-role Schreibpfade und authenticated Client-Pfade getrennt pruefen.
  - `push_notification_deliveries` bekommt fuer `authenticated` nur `select`.
- S4.7 Intake-/Activity-/sonstige RPC-Grants in `sql/16_Explicit_Grants.sql` pruefen:
  - `upsert_intake`
  - `activity_add`
  - `activity_list`
  - `activity_delete`
  - `anon`-Execute bei `upsert_intake` gezielt entfernen.
  - `security invoker`-RPCs gegen Basistabellen-Grants gegenpruefen.
- S4.8 SQL How-To Grant-Konvention:
  - neue Module muessen Grants explizit definieren.
  - `sql/16_Explicit_Grants.sql` als zentraler Nachzieh-/Provisioning-Vertrag dokumentieren.
  - `anon`-Regel dokumentieren.
  - RLS-vor-Policy-vor-Grant-Reihenfolge dokumentieren.
- S4.9 Gesamt-SQL-/Contract-Review:
  - jedes aktive `create table` hat eine Grant-Entscheidung.
  - jede aktive View hat eine Grant-Entscheidung.
  - jeder Data-API-RPC hat eine Execute-Entscheidung.
  - keine ungewollten `anon`-Grants.
  - keine RLS-Lockerung.
  - keine Aenderungen an Cleanup-/Transition-SQLs ohne eigenen Grund.

Jeder Substep endet mit:

- Umsetzung.
- lokaler Scan.
- SQL-/Security-Contract Review.
- Findings.
- Korrektur der Findings.

Exit-Kriterium:

- Alle priorisierten Grant-Findings sind umgesetzt oder bewusst abgegrenzt.

## S5 - Tests, Code Review und Contract Review

Ziel:

- SQL- und Doku-Stand lokal und optional live pruefen.

Substeps:

- S5.1 `git diff --check` fuer betroffene Dateien.
- S5.2 `rg`-Scan: jedes aktive `create table` hat eine Grant-Entscheidung in `sql/16_Explicit_Grants.sql` oder eine dokumentierte Abgrenzung.
- S5.3 `rg`-Scan: jede aktive View hat eine Grant-Entscheidung in `sql/16_Explicit_Grants.sql` oder eine dokumentierte Abgrenzung.
- S5.4 `rg`-Scan: Data-API-RPCs haben passende `grant execute`-Entscheidungen.
- S5.5 `rg`-Scan: `anon`-Grants sind begruendet und minimal.
- S5.6 `rg`-Scan: Cleanup-/Transition-SQLs wurden nicht ungewollt geaendert.
- S5.7 `rg`-Scan: Realtime-Tabellen haben `authenticated select`:
  - `health_events`
  - `health_medications`
  - `health_medication_schedule_slots`
  - `health_medication_slot_events`
  - `appointments_v2`
- S5.8 `rg`-Scan: `trendpilot_state` hat keine `authenticated`-Grants, solange kein User-Consumer dokumentiert ist.
- S5.9 SQL-Review:
  - keine destruktiven Befehle neu eingefuehrt.
  - RLS bleibt aktiv.
  - Policies bleiben usergebunden.
- S5.10 Optionaler Supabase Security Advisor Check nach User-Freigabe.
- S5.11 Optionaler Live-SQL-Apply nach User-Freigabe.
- S5.12 Optionaler Data-API-Smoke nach User-Freigabe:
  - normale authenticated Reads/Writes.
  - Intake-RPC mit eingeloggtem User.
  - Widget-REST-Read fuer Appointments.
  - Realtime-/Refresh-relevante Tabellen.
  - Edge Function service-role Reads, falls sinnvoll.
- S5.13 Optionaler externer Review-Gate, z. B. CodeRabbit.
- S5.14 Findings korrigieren.
- S5.15 Schritt-Abnahme und Commit-Empfehlung:
  - `noch nicht committen`, falls S6-Doku offen.
  - oder technische Commit-Bereitschaft, falls S6 klein bleibt.

Exit-Kriterium:

- Lokal moegliche Checks sind erledigt; Live-Smokes sind erledigt oder sauber als user-gated offen dokumentiert.

## S6 - Doku-Sync, QA-Update und finaler Abschlussreview

Ziel:

- Source-of-Truth-Dokus synchronisieren.
- Roadmap abschliessen.

Substeps:

- S6.1 `sql/HOW_TO.md` finalisieren.
- S6.2 `docs/DEV_ENVIRONMENT.md` aktualisieren, falls Supabase Security Advisor / SQL-Ausfuehrung / RLS Tester ergaenzt werden.
- S6.3 `docs/QA_CHECKS.md` um Supabase Explicit Grants Check ergaenzen.
- S6.4 relevante Module Overviews aktualisieren, falls Grants dort als Source-of-Truth noetig sind.
- S6.5 Roadmap Ergebnisprotokolle aktualisieren.
- S6.6 Finaler Contract Review:
  - SQL vs. Roadmap.
  - SQL vs. Doku.
  - Grants vs. RLS/Policies.
  - Live-Ausfuehrungsstatus.
- S6.7 Abschluss-Abnahme.
- S6.8 Commit-Empfehlung.
- S6.9 Archiv-Entscheidung.

Exit-Kriterium:

- MIDAS-SQL ist zukunftsfest fuer Supabase Explicit Grants, ohne Sicherheitsgrenzen zu lockern.

---

## Ergebnisprotokoll

### Roadmap-Erstellung und Initial Review 2026-07-02

Ausloeser:

- Supabase-Mail zu neuen Data-API-Default-Grants fuer `public`-Tabellen.
- User-Entscheidung: Supabase ist die naechste Baustelle.

Gelesen / geprueft:

- `docs/MIDAS Roadmap Template.md`
- `sql/HOW_TO.md`
- `sql/*.sql` per `rg`-Scan auf `create table`, `create view`, `grant`, RLS und Policies.
- Stichproben:
  - `sql/01_Health Schema.sql`
  - `sql/09_Appointments_v2.sql`
  - `sql/12_Medication.sql`
  - `sql/13_Activity_Event.sql`
  - `sql/14_Trendpilot.sql`
  - `sql/15_Push_Subscriptions.sql`
- Supabase Breaking-Change-Quelle:
  - `https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically`

Initiale Bewertung:

- MIDAS ist nicht akut produktiv gebrochen.
- Es gibt aber echten Wartungsbedarf fuer explizite Grants in SQL-Provisioning.
- RLS/Policies sind grossteils vorhanden, aber Grants sind nicht systematisch.
- Die Roadmap muss vor SQL-Aenderungen erst ein vollstaendiges Objektinventar erzwingen.

Initialer Contract Review:

- Roadmap bleibt im Scope SQL/RLS/Data-API.
- Keine produktive SQL-Ausfuehrung ohne User-Freigabe.
- Keine pauschalen `anon`-Grants.
- S4 wird erst nach S1-S3 und Readiness Review gestartet.
- S5 trennt lokale Checks und Live-Smokes sauber.

Findings aus Roadmap-Review:

- `SG-RF1`: Roadmap musste `anon` explizit begrenzen, weil Supabase-Beispiele oft `anon` nennen.
  - Korrektur: Guardrails, S2 und S5 enthalten `anon` als expliziten Review-Punkt.
- `SG-RF2`: Roadmap musste Live-SQL-Ausfuehrung deutlich user-gated markieren.
  - Korrektur: Metadata, Tool Permissions, S2, S5 und S6 markieren Supabase Deploy/SQL-Apply als offen und user-gated.
- `SG-RF3`: Roadmap musste zwischen heute funktionierenden Existing Tables und zukuenftiger Provisioning-Gefahr unterscheiden.
  - Korrektur: Problemzusammenfassung und Finding `SG-F2` praezisieren diesen Unterschied.

Roadmap-Abnahme:

- Roadmap ist bereit fuer S1.

### Vorbesprechung SQL-Zielstrategie 2026-07-03

Ausloeser:

- User-Frage, ob jede SQL-Datei einzeln geaendert werden muss oder ob ein gemeinsames Master-SQL sinnvoller ist.
- Ziel: vor S1 klaeren, ob die Roadmap selbst angepasst werden muss.

Gelesen / geprueft:

- `docs/MIDAS Supabase Explicit Grants Roadmap.md`
- `sql/HOW_TO.md`
- Alle Dateien in `sql/`:
  - `00_Tabua Rasa.sql`
  - `01_Health Schema.sql`
  - `02_Admin Checks.sql`
  - `04_Body_Comp.sql`
  - `05_Intake_Rpc.sql`
  - `06_Security.sql`
  - `07_Remove_Day_Flags.sql`
  - `09_Appointments_v2.sql`
  - `10_User_Profile_Ext.sql`
  - `11_Lab_Event_Extension.sql`
  - `12_Medication.sql`
  - `13_Activity_Event.sql`
  - `14_Trendpilot.sql`
  - `15_Push_Subscriptions.sql`
  - `transition_bp_comment.sql`
- Lokale `rg`-Scans auf:
  - `create table`
  - `create view`
  - `create or replace function`
  - `grant`
  - `revoke`
  - `enable row level security`
  - `create policy`
  - Data-API-Consumer in `app/`, `android/`, `backend/`.

Bewertung:

- Die MIDAS-SQL-Dateien sind historisch gewachsen und haben unterschiedliche Rollen:
  - aktive Modul-SQLs.
  - Delta-/Transition-SQLs.
  - Cleanup-/Reset-SQLs.
  - Admin-/QA-SQLs.
- Viele aktive Tabellen haben RLS und Policies, aber keinen systematischen expliziten Table-Grant-Vertrag im Repo.
- Einige Views/RPCs haben bereits Grants.
- `09_Appointments_v2.sql` enthaelt bereits View-Grants, ist wegen Drop-/Create-Struktur aber kein idealer Ort fuer einen allgemeinen Nachziehvertrag.
- `12_Medication.sql` enthaelt viele RPC-Grants, aber keine expliziten Table-Grants.
- `05_Intake_Rpc.sql` enthaelt `grant execute ... to anon, authenticated`; dieser `anon`-Execute bleibt ein S2-Review-Punkt und wird nicht blind ausgeweitet.

Entscheidung:

- Die Roadmap wird auf ein neues zentrales Master-SQL ausgerichtet:
  - `sql/16_Explicit_Grants.sql`
- Dieses SQL soll explizit objektweise arbeiten, nicht pauschal:
  - Tabellen gruppiert nach Modul.
  - Views gruppiert nach Modul.
  - RPCs nur nach bewusster Execute-Entscheidung.
- Bestehende SQL-Dateien bleiben Inventarquelle und fachlicher Contract, werden aber nicht rueckwirkend mit Grants angereichert, ausser S1-S3 finden einen zwingenden Grund.

Contract Review:

- Ziel weiterhin erfuellt:
  - MIDAS wird gegen Supabase Explicit Grants zukunftsfest.
  - RLS/Policies bleiben unveraendert.
  - Keine produktive SQL-Ausfuehrung ohne User-Freigabe.
- Security-Grenze weiterhin erfuellt:
  - keine `anon`-Table-Grants.
  - keine pauschalen `grant all`.
  - `service_role` wird explizit, aber nicht clientseitig sichtbar.
- Idempotenz-Ziel verbessert:
  - ein zentrales Grant-SQL ist sicherer wiederholbar als Retrofits in historische Transition-/Cleanup-SQLs.

Findings und Korrektur:

- `SG-RF4`: S4 war zu stark auf einzelne Modul-SQLs statt auf die geeignetere zentrale Grant-Datei ausgerichtet.
  - Korrektur: S4 auf `sql/16_Explicit_Grants.sql` als primaeres Artefakt umgestellt.
- `SG-RF5`: Die Roadmap nannte nicht alle SQL-Dateien als S1-Referenz.
  - Korrektur: Referenzliste und SQL-Datei-Klassifizierung um alle vorhandenen SQL-Dateien erweitert.
- `SG-RF6`: Cleanup-/Transition-/Admin-Dateien waren nicht klar genug aus dem Patch-Ziel abgegrenzt.
  - Korrektur: Klassifizierung und S4/S5-Gates ergaenzt.
- `SG-RF7`: `upsert_intake` mit bestehendem `anon`-Execute war noch nicht als eigener Review-Punkt sichtbar.
  - Korrektur: Finding `SG-F8` und S4.7 ergaenzt.

Abnahme:

- Roadmap ist nach der Vorbesprechung konsistenter.
- S1 kann deterministisch mit der bestaetigten, aber weiterhin pruefbaren Zielstrategie `sql/16_Explicit_Grants.sql` starten.

### S1 - System- und Vertragsdetektivarbeit 2026-07-03

Ausloeser:

- User-Auftrag: S1.1 bis S1.11 deterministisch abarbeiten.
- Keine SQL-Umsetzung und keine produktive Supabase-Aenderung in S1.

#### S1.1 Supabase Breaking Change

Gelesen / verifiziert:

- Supabase Changelog `45329`.
- Supabase Docs `Securing your API`.

Ergebnis:

- `2026-05-30`: neue Supabase-Projekte exponieren neue `public`-Tabellen nicht mehr automatisch fuer Data API / PostgREST / GraphQL.
- `2026-10-30`: der neue Default wird fuer bestehende Projekte relevant.
- Bestehende Tabellen behalten kurzfristig ihre aktuellen Grants.
- Neue Tabellen in `public` brauchen explizite `GRANT`s, bevor Data-API-Clients sie erreichen.
- RLS und Grants sind getrennte Schichten:
  - `GRANT` entscheidet, ob Rolle/Objekt ueber Data API erreichbar ist.
  - RLS/Policies entscheiden, welche Zeilen sichtbar oder schreibbar sind.
- Fehlende Grants fuehren typischerweise zu PostgREST-Fehler `42501`.
- RPCs brauchen bei Data-API-Nutzung explizites `grant execute`.

#### S1.2 SQL-Konventionen

Gelesen:

- `sql/HOW_TO.md`
- `docs/DEV_ENVIRONMENT.md`
- `docs/QA_CHECKS.md`

Ergebnis:

- `sql/HOW_TO.md` beschreibt modulare SQL-Arbeit, aber noch keinen vollstaendigen Explicit-Grants-Vertrag.
- Bestehende SQL-Dateien sind historisch gemischt:
  - aktive Modul-SQLs.
  - Delta-/Transition-SQLs.
  - Cleanup-/Reset-SQLs.
  - Admin-/QA-SQLs.
- Ein zentrales, idempotentes `sql/16_Explicit_Grants.sql` passt besser zum aktuellen Bestand als Retrofits in alle historischen Dateien.

#### S1.3 und S1.6 SQL-Datei-Kandidaten

Die Vorpruefung der SQL-Dateien wurde durch S1 bestaetigt:

- Aktive Objektquellen:
  - `01_Health Schema.sql`
  - `04_Body_Comp.sql`
  - `05_Intake_Rpc.sql`
  - `09_Appointments_v2.sql`
  - `10_User_Profile_Ext.sql`
  - `11_Lab_Event_Extension.sql`
  - `12_Medication.sql`
  - `13_Activity_Event.sql`
  - `14_Trendpilot.sql`
  - `15_Push_Subscriptions.sql`
- Inventarquelle, aber kein S4-Patch-Ziel:
  - `transition_bp_comment.sql`
- Bewusst aus Scope fuer Grant-Patches:
  - `00_Tabua Rasa.sql`
  - `02_Admin Checks.sql`
  - `06_Security.sql`
  - `07_Remove_Day_Flags.sql`

Entscheidung:

- S4 bleibt auf `sql/16_Explicit_Grants.sql` ausgerichtet.
- Historische SQL-Dateien bleiben Quelle fuer Objekte und RLS-Vertrag, aber nicht primaerer Patch-Ort.

#### S1.4 und S1.7 Objektinventar

| Objekt | Typ | Quelle | RLS/Policies | Grant-Iststand | S4-Entscheidung |
| --- | --- | --- | --- | --- | --- |
| `user_profile` | Tabelle | `01_Health Schema.sql`, `10_User_Profile_Ext.sql` | vorhanden | kein systematischer Table-Grant im Repo | zentraler Table-Grant |
| `health_events` | Tabelle | `01_Health Schema.sql` | vorhanden | kein systematischer Table-Grant im Repo | zentraler Table-Grant |
| `appointments_v2` | Tabelle | `09_Appointments_v2.sql` | vorhanden | kein systematischer Table-Grant im Repo | zentraler Table-Grant |
| `health_medications` | Tabelle | `12_Medication.sql` | vorhanden | kein systematischer Table-Grant im Repo | zentraler Table-Grant |
| `health_medication_schedule_slots` | Tabelle | `12_Medication.sql` | vorhanden | kein systematischer Table-Grant im Repo | zentraler Table-Grant |
| `health_medication_slot_events` | Tabelle | `12_Medication.sql` | vorhanden | kein systematischer Table-Grant im Repo | zentraler Table-Grant |
| `health_medication_stock_log` | Tabelle | `12_Medication.sql` | vorhanden | kein systematischer Table-Grant im Repo | zentraler Table-Grant |
| `trendpilot_events` | Tabelle | `14_Trendpilot.sql` | vorhanden | kein systematischer Table-Grant im Repo | zentraler Table-Grant |
| `trendpilot_state` | Tabelle | `14_Trendpilot.sql` | vorhanden | kein systematischer Table-Grant im Repo | zentraler Table-Grant |
| `push_subscriptions` | Tabelle | `15_Push_Subscriptions.sql` | vorhanden | kein systematischer Table-Grant im Repo | zentraler Table-Grant |
| `push_notification_deliveries` | Tabelle | `15_Push_Subscriptions.sql` | vorhanden, select-policy | kein systematischer Table-Grant im Repo | zentraler Table-Grant mit Rollenreview |
| `v_events_bp` | View | `01_Health Schema.sql`, `transition_bp_comment.sql` | ueber Basistabelle/Invoker-Vertrag pruefen | kein systematischer View-Grant im Repo | zentraler View-Grant |
| `v_events_body` | View | `01_Health Schema.sql`, `04_Body_Comp.sql` | ueber Basistabelle/Invoker-Vertrag pruefen | kein systematischer View-Grant im Repo | zentraler View-Grant |
| `v_events_lab` | View | `11_Lab_Event_Extension.sql`, `transition_bp_comment.sql` | ueber Basistabelle/Invoker-Vertrag pruefen | kein systematischer View-Grant im Repo | zentraler View-Grant |
| `v_events_activity` | View | `13_Activity_Event.sql` | ueber Basistabelle/Invoker-Vertrag pruefen | kein systematischer View-Grant im Repo | zentraler View-Grant |
| `v_appointments_v2_upcoming` | View | `09_Appointments_v2.sql` | ueber Basistabelle/Invoker-Vertrag pruefen | `grant select` an `authenticated`, `service_role` vorhanden | zentral spiegeln/konsolidieren |
| `trendpilot_events_range` | View | `14_Trendpilot.sql` | ueber Basistabelle/Invoker-Vertrag pruefen | kein systematischer View-Grant im Repo | zentraler View-Grant |
| `upsert_intake` | RPC | `05_Intake_Rpc.sql` | Function-Vertrag pruefen | `grant execute` an `anon`, `authenticated` vorhanden | S2 Rollenentscheid, S4 ggf. zentral spiegeln/korrigieren |
| `activity_add` | RPC | `13_Activity_Event.sql` | Function-Vertrag vorhanden | `grant execute` an `authenticated`, `service_role` vorhanden | S4 bestaetigen/spiegeln |
| `activity_list` | RPC | `13_Activity_Event.sql` | Function-Vertrag vorhanden | `grant execute` an `authenticated`, `service_role` vorhanden | S4 bestaetigen/spiegeln |
| `activity_delete` | RPC | `13_Activity_Event.sql` | Function-Vertrag vorhanden | `grant execute` an `authenticated`, `service_role` vorhanden | S4 bestaetigen/spiegeln |
| `med_*_v2` | RPC-Gruppe | `12_Medication.sql` | Function-Vertrag vorhanden | `grant execute` an `authenticated`, `service_role` vorhanden | S4 bestaetigen/spiegeln |

#### S1.5 Data-API-Consumer

Browser/PWA:

- `app/supabase/core/client.js`: Supabase-Client.
- `app/supabase/api/vitals.js`: `health_events`, `v_events_bp`, `v_events_body`, `v_events_lab`.
- `app/supabase/api/intake.js`: `upsert_intake`, `health_events`.
- `app/supabase/api/trendpilot.js`: `trendpilot_events`, `trendpilot_events_range`.
- `app/supabase/api/system-comments.js`: `health_events`.
- `app/supabase/api/select.js`: generische `/rest/v1/{table}`-Reads.
- `app/modules/appointments/index.js`: `appointments_v2`.
- `app/modules/profile/index.js`: `user_profile`.
- `app/modules/push/index.js`: `push_subscriptions`.
- `app/modules/intake-stack/medication/index.js`: `med_*_v2` RPCs.
- `app/modules/vitals-stack/activity/index.js`: `activity_*` RPCs.
- `app/modules/doctor-stack/charts/index.js`: `user_profile`, `activity_list`.

Android:

- `android/app/src/main/java/de/schabuss/midas/widget/WidgetSyncRepository.kt`:
  - REST `health_events`.
  - RPC `med_list_v2`.
  - REST `appointments_v2`.
- `android/app/src/main/java/de/schabuss/midas/widget/WidgetRealtimeSync.kt`:
  - Realtime fuer `health_events`, `health_medications`, `health_medication_schedule_slots`, `health_medication_slot_events`, `appointments_v2`.

Edge Functions / Service Role:

- `midas-monthly-report`:
  - `user_profile`, `health_events`, `trendpilot_events_range`, `v_events_activity`, `v_events_bp`, `v_events_body`, `v_events_lab`.
- `midas-trendpilot`:
  - `trendpilot_state`, `health_events`, `trendpilot_events`.
- `midas-incident-push`:
  - `push_subscriptions`, `health_medications`, `health_medication_schedule_slots`, `health_medication_slot_events`, `v_events_bp`, `push_notification_deliveries`.
- `midas-protein-targets`:
  - `health_events`, `user_profile`.

#### S1.8 Legacy- und Idempotenzrisiken

- `00_Tabua Rasa.sql` ist destruktiv und bleibt out of scope.
- `07_Remove_Day_Flags.sql` ist Transition/Cleanup und bleibt out of scope.
- `09_Appointments_v2.sql` enthaelt Drop-/Create-Struktur; aktive Objektquelle, aber kein idealer Grants-Nachziehort.
- `01_Health Schema.sql` enthaelt vorbestehende syntaktisch auffaellige Kommentar-/Listenzeilen; Risiko `SG-F9`.
- `06_Security.sql` enthaelt vorbestehende Legacy-Bezuege auf `public.appointments`; Risiko `SG-F10`.
- `upsert_intake` hat bestehenden `anon`-Execute; dieser wird in S2 bewusst entschieden, nicht automatisch uebernommen.

#### S1.9 Findings

- `SG-F1` bis `SG-F8` wurden durch S1 bestaetigt.
- `SG-F9` wurde neu aufgenommen: Legacy-Hygiene in `01_Health Schema.sql`.
- `SG-F10` wurde neu aufgenommen: Legacy-Scope in `06_Security.sql`.

#### S1.10 Contract Review

Pruefung gegen Ziel:

- Ziel `zukunftsfest fuer Supabase Explicit Grants` bleibt korrekt.
- Zentrale Datei `sql/16_Explicit_Grants.sql` bleibt die passende S4-Strategie.
- Keine SQL-/DB-Schreibwirkung wurde ausgefuehrt.
- Keine RLS-Policy wurde geaendert.
- Keine `anon`-Table-Rechte wurden geplant oder vergeben.
- `service_role` bleibt als Edge-/Scheduler-Rolle im Zielvertrag sichtbar, aber nicht clientseitig.
- Live-SQL-Ausfuehrung bleibt user-gated.

Review-Findings:

- `SG-RF8`: S1 musste neue Legacy-Risiken explizit in Findings aufnehmen.
  - Korrektur: `SG-F9` und `SG-F10` ergaenzt.
- `SG-RF9`: Nach S1 musste der aktuelle Schritt von `S1` auf `S2` wechseln.
  - Korrektur: Roadmap-Metadaten und Statusmatrix aktualisiert.
- `SG-RF10`: Consumer- und Objektinventar mussten vollstaendig im Ergebnisprotokoll stehen, nicht nur implizit in Toolausgaben.
  - Korrektur: Objektinventar und Consumer-Karte in dieses Protokoll uebernommen.

#### S1.11 Schritt-Abnahme

S1 ist abgeschlossen.

Naechster Schritt:

- S2 definiert den minimalen Rollen- und Objektvertrag:
  - `authenticated`
  - `service_role`
  - `anon`
  - Tabellen
  - Views
  - RPCs

Offene Punkte fuer S2:

- Braucht `upsert_intake` weiterhin `anon`-Execute oder kann es auf `authenticated` begrenzt werden?
- Welche Tabellen sind read/write fuer `authenticated`, welche nur service-role-relevant?
- Welche Views brauchen `authenticated` und/oder `service_role`?
- Wie werden Realtime-Tabellenrechte im zentralen Grant-SQL abgebildet?

### S2 - Fachlicher/technischer Contract Review 2026-07-03

Ausloeser:

- User-Auftrag: S2 deterministisch in derselben Arbeitsweise wie S1 abarbeiten.
- Ziel: minimalen Rollen-, Tabellen-, View- und RPC-Vertrag festlegen.

#### S2.1 Security-Guardrails

Geprueft gegen:

- Roadmap-Ziel.
- S1-Objektinventar.
- vorhandene RLS-Policies.
- aktive PWA-/Android-/Edge-Consumer.

Ergebnis:

- RLS bleibt unveraendert.
- Grants ersetzen keine Policies.
- Keine pauschalen Schema- oder Rollen-Grants.
- Keine `anon`-Table- oder `anon`-View-Grants.
- `authenticated` bekommt nur Rechte, die durch bestehende RLS/Policies und konkrete Consumer gedeckt sind.
- `service_role` wird fuer Edge-/Scheduler-/Admin-Pfade explizit mitgedacht.

#### S2.2 Rollenvertrag

| Rolle | Zielvertrag | Begruendung |
| --- | --- | --- |
| `anon` | Keine Table-Grants, keine View-Grants, kein `upsert_intake`-Execute im Zielvertrag. | MIDAS ist auth-getrieben; aktueller Intake-RPC nutzt `fetchWithAuth` und ist kein anonymer Public-Flow. |
| `authenticated` | Userseitige Tabellen-, View- und RPC-Rechte gemaess RLS und konkretem Clientbedarf. | PWA, Android-REST und Realtime laufen mit User-Kontext. |
| `service_role` | Explizite Data-API-Reichweite fuer Edge Functions, Scheduler und Admin-Smokes. | Edge Functions nutzen Service Role und muessen auch unter neuem Data-API-Default objektseitig erreichbar bleiben. |

S2-Entscheidung zu `upsert_intake`:

- Der bestehende `grant execute ... to anon, authenticated` wird fachlich nicht mehr als Zielvertrag bestaetigt.
- S4 soll `anon` fuer `upsert_intake` gezielt entfernen und `authenticated`, `service_role` setzen.

#### S2.3 Tabellenvertrag

| Tabelle | `authenticated` | `service_role` | Notiz |
| --- | --- | --- | --- |
| `user_profile` | `select`, `insert`, `update`, `delete` | `select`, `insert`, `update`, `delete` | Profilmodul und Edge Functions nutzen Profilwerte. |
| `health_events` | `select`, `insert`, `update`, `delete` | `select`, `insert`, `update`, `delete` | Vitals, Intake, Activity, Trendpilot, Reports und Widget brauchen diese Basis. |
| `appointments_v2` | `select`, `insert`, `update`, `delete` | `select`, `insert`, `update`, `delete` | Appointments-Modul und Android Widget. |
| `health_medications` | `select`, `insert`, `update`, `delete` | `select`, `insert`, `update`, `delete` | Medication-RPCs sind `security invoker`; Tabellenrechte muessen RPCs stuetzen. |
| `health_medication_schedule_slots` | `select`, `insert`, `update`, `delete` | `select`, `insert`, `update`, `delete` | Medication-RPCs, Incident Push und Realtime. |
| `health_medication_slot_events` | `select`, `insert`, `update`, `delete` | `select`, `insert`, `update`, `delete` | Medication-RPCs, Incident Push und Realtime. |
| `health_medication_stock_log` | `select`, `insert`, `delete` | `select`, `insert`, `update`, `delete` | Keine bestehende Update-Policy fuer User; deshalb kein `authenticated update`. |
| `trendpilot_events` | `select`, `update`, `delete` | `select`, `insert`, `update`, `delete` | User kann Events lesen/acknowledgen/loeschen; Edge Function erzeugt Events. |
| `trendpilot_state` | keine Userrechte im Zielvertrag | `select`, `insert`, `update`, `delete` | Aktuell Edge-/Service-State, kein belegter User-Consumer. |
| `push_subscriptions` | `select`, `insert`, `update`, `delete` | `select`, `insert`, `update`, `delete` | PWA registriert/loescht Subscriptions; Edge Function pflegt Remote-Health. |
| `push_notification_deliveries` | `select` | `select`, `insert`, `update`, `delete` | Userseitig nur lesbar; Edge Function schreibt Delivery-/Dedupe-State. |

Hinweis:

- `authenticated`-Grants folgen bestehenden RLS-Policies.
- `service_role`-Grants sind explizit fuer Data-API-Reichweite; der Service Key bleibt nie clientseitig.

#### S2.4 View-Vertrag

| View | Zielrollen | Begruendung |
| --- | --- | --- |
| `v_events_bp` | `authenticated`, `service_role` | Charts, Reports, Incident Push. |
| `v_events_body` | `authenticated`, `service_role` | Charts und Reports. |
| `v_events_lab` | `authenticated`, `service_role` | Arztbericht / Lab-Kontext. |
| `v_events_activity` | `authenticated`, `service_role` | Activity-RPC und Arztbericht. |
| `v_appointments_v2_upcoming` | `authenticated`, `service_role` | Bestehender View-Grant wird zentral gespiegelt/konsolidiert. |
| `trendpilot_events_range` | `authenticated`, `service_role` | PWA liest Trendpilot-Hinweise; Monthly Report nutzt Service Role. |

View-Regeln:

- Keine `anon`-View-Grants.
- Views mit `security_invoker` behalten den Basistabellen-/RLS-Vertrag.
- View-Grants werden zentral in `sql/16_Explicit_Grants.sql` sichtbar gemacht.

#### S2.5 RPC-/Function-Vertrag

| RPC / Function | Zielrollen | Entscheidung |
| --- | --- | --- |
| `upsert_intake(date, numeric, numeric, numeric)` | `authenticated`, `service_role` | `anon` entfernen; aktueller Runtime-Pfad ist auth-getrieben. |
| `activity_add(date, jsonb)` | `authenticated`, `service_role` | Bestehenden Grant bestaetigen/spiegeln. |
| `activity_list(date, date)` | `authenticated`, `service_role` | Bestehenden Grant bestaetigen/spiegeln. |
| `activity_delete(uuid)` | `authenticated`, `service_role` | Bestehenden Grant bestaetigen/spiegeln. |
| `med_reset_all_data_v2()` | `authenticated`, `service_role` | Bestehenden Grant bestaetigen/spiegeln. |
| `med_list_v2(date)` | `authenticated`, `service_role` | Bestehenden Grant bestaetigen/spiegeln. |
| `med_upsert_v2(...)` | `authenticated`, `service_role` | Bestehenden Grant bestaetigen/spiegeln. |
| `med_upsert_schedule_v2(uuid, date, jsonb)` | `authenticated`, `service_role` | Bestehenden Grant bestaetigen/spiegeln. |
| `med_confirm_slot_v2(uuid, date)` | `authenticated`, `service_role` | Bestehenden Grant bestaetigen/spiegeln. |
| `med_undo_slot_v2(uuid, date)` | `authenticated`, `service_role` | Bestehenden Grant bestaetigen/spiegeln. |
| `med_adjust_stock_v2(uuid, int, text)` | `authenticated`, `service_role` | Bestehenden Grant bestaetigen/spiegeln. |
| `med_set_stock_v2(uuid, int, text)` | `authenticated`, `service_role` | Bestehenden Grant bestaetigen/spiegeln. |
| `med_ack_low_stock_v2(uuid, date, int)` | `authenticated`, `service_role` | Bestehenden Grant bestaetigen/spiegeln. |
| `med_set_active_v2(uuid, boolean)` | `authenticated`, `service_role` | Bestehenden Grant bestaetigen/spiegeln. |
| `med_delete_v2(uuid)` | `authenticated`, `service_role` | Bestehenden Grant bestaetigen/spiegeln. |

Nicht im Explicit-Grants-Zielvertrag:

- Trigger-Helfer wie `set_*_updated_at`.
- interne Helper wie `_med_default_slot_type`, `_med_infer_slot_type`, `_med_today`.
- Validation-Triggerfunktionen, sofern kein Data-API-RPC-Consumer existiert.

Wichtiger S2-Befund:

- Viele relevante RPCs sind `security invoker`.
- Deshalb muss S4 Basistabellen-Grants mitsetzen; `grant execute` allein ist kein vollstaendiger Vertrag.

#### S2.6 Live-DB-Ausfuehrungsstrategie

- Keine produktive SQL-Ausfuehrung in S2.
- Live-SQL bleibt user-gated.
- S5/S6 muessen klar trennen:
  - lokaler Strukturcheck.
  - optionaler Security Advisor.
  - optionaler SQL-Apply.
  - optionaler Data-API-Smoke.
- `sql/16_Explicit_Grants.sql` soll idempotent sein:
  - gezielte `grant`-Statements.
  - gezielte `revoke`-Statements nur fuer bewusst entfernte Altlasten wie `upsert_intake`/`anon`.
  - keine Drops, keine Datenmigration, keine Policy-Lockerung.

#### S2.7 Umsetzungsstrategie

S1-Strategie bestaetigt:

- Primaeres S4-Artefakt bleibt `sql/16_Explicit_Grants.sql`.
- Bestehende Modul-SQLs bleiben fachliche Objektquelle.
- Keine Retrofits in Cleanup-, Admin- oder Transition-SQLs.
- `sql/HOW_TO.md` wird spaeter um die Explicit-Grants-Konvention erweitert.

#### S2.8 Contract Review

Pruefung gegen Ziel:

- Rollenvertrag ist minimal und MIDAS-auth-getrieben.
- `anon` wird nicht pauschal erweitert, sondern reduziert.
- `authenticated`-Rechte folgen vorhandenen RLS-Policies und realen PWA-/Android-Consumer-Pfaden.
- `service_role` wird explizit fuer Edge Functions/Reports/Push eingeplant.
- Security-invoker-RPCs sind korrekt als Basistabellen-Grant-Abhaengigkeit erkannt.
- Live-Ausfuehrung bleibt user-gated.

Review-Findings:

- `SG-RF11`: S2 musste `security invoker` als Grund fuer Basistabellen-Grants ausdruecklich dokumentieren.
  - Korrektur: `SG-F11` und Tabellen-/RPC-Vertrag ergaenzt.
- `SG-RF12`: `upsert_intake` hatte aus S1 noch eine offene `anon`-Entscheidung.
  - Korrektur: S2 entscheidet gegen `anon` und markiert S4-Revoke.
- `SG-RF13`: `push_notification_deliveries` darf fuer `authenticated` nicht pauschal Write-Rechte bekommen, weil nur eine Select-Policy existiert.
  - Korrektur: `authenticated` nur `select`, `service_role` DML.
- `SG-RF14`: `health_medication_stock_log` darf fuer `authenticated` nicht pauschal `update` bekommen, weil keine Update-Policy existiert.
  - Korrektur: `authenticated` nur `select`, `insert`, `delete`.

#### S2.9 Schritt-Abnahme

S2 ist abgeschlossen.

Naechster Schritt:

- S3 prueft Bruchrisiken, Security-Risiken und Live-DB-Ausfuehrungsrisiken vor SQL-Aenderung.

Offene Punkte fuer S3:

- Reicht der bewusst reduzierte `upsert_intake`-Vertrag fuer alle dokumentierten Runtime-Pfade?
- Gibt es Views, die trotz View-Grant wegen Basistabellenrechten brechen koennten?
- Sind Realtime-Tabellenrechte fuer Android Widget und PWA ausreichend?
- Muss `trendpilot_state` wirklich service-role-only bleiben, oder gibt es einen verdeckten User-Consumer?
- Sind die gezielten `revoke`-Statements in S4 risikoarm und idempotent formulierbar?

### S3 - Bruchrisiko-, Security- und Umsetzungsreview 2026-07-03

Ausloeser:

- User-Auftrag: S3 deterministisch in derselben Arbeitsweise wie S1/S2 abarbeiten.
- Ziel: Bruchrisiken, Security-Risiken, Live-DB-Risiken, S5-Checks und S4-Substeps konkretisieren.

#### S3.1 Bruchrisiken

Geprueft:

- `rg`-Scans auf `trendpilot_state`, `push_notification_deliveries`, `health_medication_stock_log`, `upsert_intake`, Realtime und bestehende Grants.
- S1-Consumer-Karte.
- S2-Rollenvertrag.

Risiken und Ergebnis:

| Risiko | Bewertung | S3-Entscheidung |
| --- | --- | --- |
| Fehlende Table-Grants brechen `security invoker`-RPCs. | Relevant. | S4 muss Basistabellen-Grants fuer `health_events` und Medication-Tabellen setzen. |
| View-Grant reicht nicht, wenn Basistabelle fuer `security_invoker`-View nicht erreichbar ist. | Relevant. | S4/S5 muessen Views und Basistabellen gemeinsam pruefen. |
| `anon`-Revoke auf `upsert_intake` koennte versteckten anonymen Flow brechen. | Kontrolliertes Risiko. | Scan zeigt nur auth-getriebene Runtime-Pfade; S5 muss Intake-RPC mit eingeloggtem User smoken. |
| Realtime-Refresh bricht, wenn beobachtete Tabellen nicht fuer `authenticated select` erreichbar sind. | Relevant. | Neues Finding `SG-F13`; S4/S5 pruefen Realtime-Tabellen. |
| `trendpilot_state` service-role-only koennte User-Flow brechen. | Niedrig nach Scan. | Kein belegter PWA-/Android-Consumer; neues Finding `SG-F14`, S5 Drift-Scan. |
| `push_notification_deliveries` Write-Rechte fuer User waeren zu breit. | Relevant. | S2-Vertrag bleibt: `authenticated select`, `service_role` DML. |
| `health_medication_stock_log` Update-Recht fuer User waere zu breit. | Relevant. | S2-Vertrag bleibt: `authenticated select/insert/delete`, kein Update. |

#### S3.2 SQL-Idempotenz

Bewertung:

- `grant`-Statements sind wiederholbar.
- `revoke execute ... from anon` ist wiederholbar und gezielt.
- `sql/16_Explicit_Grants.sql` darf keine Datenmigration, keine Drops und keine Policy-Loescher enthalten.
- Bestehende Transition-/Cleanup-Dateien bleiben unveraendert.
- Keine pauschalen `grant all on all tables in schema public`-Statements.
- Keine pauschalen `revoke all on schema/table`-Statements fuer aktive Tabellen.

S3-Entscheidung:

- S4 soll objektgenaue Grants schreiben.
- Revoke nur fuer die bewusste Altlast `upsert_intake`/`anon`.
- Bestehende View-`revoke all on ... from public` aus `09_Appointments_v2.sql` wird nicht pauschal auf andere Objekte uebertragen.

#### S3.3 Live-Risiken

Bewertung:

- Grants aendern Rechte, nicht Daten.
- Trotzdem ist produktive SQL-Ausfuehrung sicherheits- und runtime-relevant.
- `upsert_intake`-Revoke ist die einzige bewusst verhaltensaendernde Reduktion.
- Service-Role-Grants duerfen nicht in Client-Konfigurationen oder Dokus mit Secrets vermischt werden.

S3-Entscheidung:

- Live-SQL bleibt user-gated.
- S5 trennt lokale Checks, optionalen SQL-Apply und optionale Live-Smokes.
- Keine Edge-Function-Deploys in dieser Roadmap, ausser spaeter explizit freigegeben.

#### S3.4 S5-Checks

S5 muss mindestens lokal pruefen:

- Jedes aktive `create table` hat eine Grant-Entscheidung im zentralen SQL oder eine dokumentierte Abgrenzung.
- Jede aktive View hat eine Grant-Entscheidung.
- Jeder Data-API-RPC hat eine Execute-Entscheidung.
- Keine `anon`-Table-/View-Grants.
- `upsert_intake` enthaelt kein Ziel-`grant execute ... to anon`.
- Realtime-Tabellen haben `authenticated select`:
  - `health_events`
  - `health_medications`
  - `health_medication_schedule_slots`
  - `health_medication_slot_events`
  - `appointments_v2`
- `trendpilot_state` bleibt ohne `authenticated`-Grant, solange kein User-Consumer existiert.
- Cleanup-/Transition-/Admin-SQLs wurden nicht ungewollt gepatcht.

Optionale Live-Smokes nach User-Freigabe:

- Intake-RPC als eingeloggter User.
- Appointments Read/Write als eingeloggter User.
- Widget-relevanter REST-Read.
- Trendpilot-Event-Read/Ack.
- Push-Subscription Read/Upsert.
- Edge-/service-role Read fuer Reports/Push/Trendpilot, falls sinnvoll.

#### S3.5 S4-Substeps

S4-Substeps wurden nach S3 konkretisiert:

- S4.1 bleibt zentrale Datei `sql/16_Explicit_Grants.sql`.
- S4.2 bis S4.6 bleiben nach Modulgruppen geschnitten.
- S4.7 muss `upsert_intake`/`anon` gezielt entfernen und `security invoker`-RPCs gegen Basistabellen-Grants pruefen.
- S4.8/S4.9 bleiben Doku-/Review-Schritte.

Keine neue Modul-SQL-Datei wird in S4 primaeres Patch-Ziel.

#### S3.6 Contract Review

Pruefung gegen Ziel:

- Scope bleibt SQL/RLS/Data-API-Grants.
- Keine SQL-Umsetzung wurde vorgenommen.
- Keine produktive Supabase-Aktion wurde vorgenommen.
- Zentrales `sql/16_Explicit_Grants.sql` bleibt die richtige S4-Strategie.
- `anon` wird nicht erweitert.
- `upsert_intake`-Reduktion ist bewusst und testpflichtig.
- Realtime-Refresh wird als `authenticated select`-Anforderung dokumentiert, nicht als Sonderrecht.
- `trendpilot_state` bleibt service-role-only, weil kein User-Consumer gefunden wurde.

Review-Findings:

- `SG-RF15`: S3 musste den Realtime-Grant-Vertrag explizit machen.
  - Korrektur: `SG-F13`, Entscheidungslog, S4/S5-Pruefpunkte ergaenzt.
- `SG-RF16`: S3 musste `trendpilot_state` service-role-only gegen Consumer-Scan bestaetigen.
  - Korrektur: `SG-F14`, Entscheidungslog und S5-Drift-Scan ergaenzt.
- `SG-RF17`: S5-Checkliste musste nach S3 neu nummeriert werden, weil Realtime-/Trendpilot-Pruefungen eingefuegt wurden.
  - Korrektur: S5.7 bis S5.15 angepasst.

#### S3.7 Schritt-Abnahme

S3 ist abgeschlossen.

Naechster Schritt:

- S4 Readiness Review:
  - alle Tabellen, Views und RPCs gegen S1-S3 pruefen.
  - danach erst S4.1 starten.

Offene Punkte fuer den Readiness Review:

- Sind alle Realtime-Tabellen in S4/S5 abgedeckt?
- Ist `trendpilot_state` service-role-only weiterhin korrekt?
- Ist der `upsert_intake`-Revoke ausreichend risikoarm?
- Sind S4-Substeps klein genug fuer substepweise Umsetzung?

### S4 Readiness Review 2026-07-03

Ausloeser:

- User-Auftrag: Readiness Gate Review nach S3, vor S4.
- Ziel: pruefen, ob S4 ohne unklare Reihenfolge, Scope-Luecken oder Rollenvertragsluecken starten kann.

#### Prueffragen

| Prueffrage | Ergebnis | Entscheidung |
| --- | --- | --- |
| Sind alle `create table`-Objekte im Grant-Inventar? | Ja. | S4.2 bis S4.6 decken alle aktiven Tabellen ab. |
| Sind alle Views im View-Inventar? | Ja. | Views sind in S4.2, S4.3 und S4.5 enthalten. |
| Sind alle Data-API-RPCs im Execute-Inventar? | Ja. | Intake, Activity und Medication-RPCs sind in S4.4/S4.7 abgedeckt. |
| Gibt es ein Objekt, das `anon` braucht? | Nein. | `anon` bleibt ohne Table-/View-Rechte; `upsert_intake`-Execute wird entfernt. |
| Muss ein Legacy-SQL-Block lokal gepatcht werden? | Nein. | `00`, `06`, `07`, `transition_*` bleiben out-of-scope fuer S4-Patches. |
| Ist `sql/16_Explicit_Grants.sql` weiterhin richtig? | Ja. | Zentrales, objektgenaues Nachzieh-SQL bleibt beste Strategie. |
| Gibt es eine SQL-Datei, die ausnahmsweise lokal geaendert werden muss? | Nein. | S4 startet mit neuer Datei; `sql/HOW_TO.md` folgt spaeter in S4.8/S6. |
| Sind S5-Smokes definierbar? | Ja. | Lokal per `rg`/`git diff`; live nur nach User-Freigabe. |
| Ist produktive SQL-Ausfuehrung weiterhin user-gated? | Ja. | Keine Live-DB-Aktion vor ausdruecklicher Freigabe. |

#### Ergaenzender Gate-Befund

- `sql/16_Explicit_Grants.sql` ist idempotent als Grant-Nachziehskript, aber nicht standalone.
- Es setzt voraus, dass die betroffenen Tabellen, Views und RPCs bereits existieren.
- Diese Reihenfolge muss im Header des SQLs und spaeter im `sql/HOW_TO.md` klar stehen.

Neues Finding:

- `SG-F15`: `sql/16_Explicit_Grants.sql` ist ein Nachzieh-/Provisioning-SQL nach Objektanlage, kein standalone Schema-Bootstrap.

#### Gate Contract Review

Pruefung gegen Ziel:

- S4 kann mit `sql/16_Explicit_Grants.sql` starten.
- S4-Substeps sind klein genug:
  - S4.1 Datei/Header.
  - S4.2 Core Health/Views.
  - S4.3 Appointments.
  - S4.4 Medication.
  - S4.5 Trendpilot.
  - S4.6 Push.
  - S4.7 RPCs.
  - S4.8 How-To.
  - S4.9 Gesamtreview.
- Keine RLS-Lockerung geplant.
- Keine pauschalen Grants geplant.
- Keine produktive SQL-Ausfuehrung geplant.
- `anon` wird nicht erweitert.
- Realtime- und `trendpilot_state`-Entscheidungen sind in S4/S5 sichtbar.

Review-Findings:

- `SG-RF18`: Run-Order des zentralen Grants-SQL war noch nicht explizit genug.
  - Korrektur: `SG-F15`, Entscheidungslog und S4.1-Header-Anforderung ergaenzt.

#### Gate-Abnahme

S4 Readiness Review ist abgeschlossen.

Naechster Schritt:

- S4.1 darf starten:
  - `sql/16_Explicit_Grants.sql` anlegen.
  - Header/Scope/Run-Order/Guardrails definieren.
  - noch keine Live-Ausfuehrung.

### S4.1 - Zentrales Grants-SQL anlegen 2026-07-03

#### Durchgefuehrte Arbeiten

- `sql/16_Explicit_Grants.sql` neu angelegt.
- Header definiert:
  - Zweck: expliziter Data-API-Grant-Vertrag fuer MIDAS-Objekte im `public`-Schema.
  - Run-Order: Ausfuehrung nach den Objektdefinitionen, nicht als standalone Schema-Bootstrap.
  - Safety Contract: keine Datenmigration, keine Drops, keine RLS-Policy-Aenderungen, keine breiten Schema-Grants, keine `anon`-Table-/View-Grants.
  - Produktive Ausfuehrung bleibt user-gated.
- S4-Platzhalter angelegt:
  - S4.2 Core Health und Health-Views.
  - S4.3 Appointments.
  - S4.4 Medication.
  - S4.5 Trendpilot.
  - S4.6 Push.
  - S4.7 Intake, Activity und uebrige Data-API-RPCs.

#### Code Review

- `git diff --check -- sql/16_Explicit_Grants.sql "docs/MIDAS Supabase Explicit Grants Roadmap.md"` erfolgreich.
- Statement-Scan auf produktive/destruktive SQL-Kommandos in `sql/16_Explicit_Grants.sql` erfolgreich:
  - keine `drop`-/`truncate`-/`delete from`-Statements.
  - keine Policy-Aenderungen.
  - keine `grant ... on all`-Statements.
  - keine `grant ... to anon`-Statements.
- `begin;` / `commit;` ist bewusst gesetzt:
  - S4.1 fuehrt noch keine Grants aus.
  - S4.2 bis S4.7 fuellen die Transaktion mit objektgenauen Statements.

#### Contract Review

Pruefung gegen Ziel:

- S4.1 hat nur das Zielartefakt angelegt und keine Rechte produktiv erweitert.
- `SG-F15` ist abgedeckt:
  - Das SQL ist klar als Nachzieh-/Provisioning-SQL nach Objektanlage beschrieben.
- `SG-F3` bleibt eingehalten:
  - Es wurden keine `anon`-Rechte vergeben.
- `SG-F4` und `SG-F7` bleiben eingehalten:
  - Historische Modul-/Legacy-/Transition-SQLs wurden nicht rueckwirkend veraendert.
- Live-Supabase wurde nicht beruehrt.

Review-Findings:

- Keine offenen S4.1-Findings.

#### Schritt-Abnahme

S4.1 ist abgeschlossen.

Naechster Schritt:

- S4.2 Core Health und Health-Views in `sql/16_Explicit_Grants.sql` abbilden.

### S4.2 - Core Health und Health-Views 2026-07-03

#### Durchgefuehrte Arbeiten

In `sql/16_Explicit_Grants.sql` wurden die Core-Health-Objekte eingetragen:

- Tabellen:
  - `public.user_profile`
  - `public.health_events`
- Views:
  - `public.v_events_bp`
  - `public.v_events_body`
  - `public.v_events_lab`
  - `public.v_events_activity`

Umgesetzter Rollenvertrag:

- `authenticated`:
  - `select, insert, update, delete` auf `user_profile`.
  - `select, insert, update, delete` auf `health_events`.
  - `select` auf die vier Event-Views.
- `service_role`:
  - gleicher Core-Tabellen-/View-Zugriff fuer Edge-Functions, Reports und Scheduler-nahe Pfade.
- `anon`:
  - explizites `revoke all` auf den Core-Tabellen und Core-Views.
  - keine neuen `anon`-Grants.
- `public`:
  - explizites `revoke all` auf den Core-Tabellen und Core-Views, damit keine alten `PUBLIC`-Grants anonym durchschlagen.
- Altgrant-Bereinigung:
  - `anon`, `public`, `authenticated` und `service_role` werden vor den Zielgrants bereinigt.
  - Danach werden nur die Zielrechte neu gesetzt.

#### Code Review

- `git diff --check -- sql/16_Explicit_Grants.sql "docs/MIDAS Supabase Explicit Grants Roadmap.md"` erfolgreich.
- Scan auf ungewollte Grants oder destruktive Statements erfolgreich:
  - keine `grant ... to anon`.
  - keine `grant ... on all`.
  - keine `drop`, `truncate`, `delete from`.
  - keine RLS-/Policy-Aenderungen.
- Vollstaendigkeitscheck S4.2 erfolgreich:
  - alle sechs S4.2-Objekte sind im zentralen Grant-SQL enthalten.

#### Contract Review

Pruefung gegen Ziel:

- `SG-F1` und `SG-F6` werden fuer Core Health adressiert:
  - vormals nicht systematisch dokumentierte Core-Table-Grants sind jetzt explizit.
- `SG-F3` bleibt eingehalten:
  - `anon` wurde nicht erweitert, sondern fuer diese Objekte explizit entkoppelt.
- `SG-F11` bleibt eingehalten:
  - Security-invoker-Views/RPC-nahe Pfade haben passende Basistabellenrechte.
- `SG-F13` bleibt eingehalten:
  - `health_events` hat `authenticated select` fuer Realtime-Refresh.
- Extension-/Transition-Dateien bleiben unveraendert.
- Live-Supabase wurde nicht beruehrt.

Review-Findings:

- `SG-RF19`: `revoke ... from anon` allein deckt alte `PUBLIC`-Grants nicht robust ab.
- `SG-RF20`: `grant` ist additiv; engere Zielgrants entfernen keine alten Zusatzrechte auf Zielrollen.
  - Korrektur: S4.2-Core-Objekte bereinigen jetzt `anon`, `public`, `authenticated` und `service_role` vor dem Re-Grant.

#### Schritt-Abnahme

S4.2 ist abgeschlossen.

Naechster Schritt:

- S4.3 Appointments in `sql/16_Explicit_Grants.sql` abbilden.

### S4.3 - Appointments 2026-07-03

#### Durchgefuehrte Arbeiten

In `sql/16_Explicit_Grants.sql` wurden die Appointments-Objekte eingetragen:

- Tabelle:
  - `public.appointments_v2`
- View:
  - `public.v_appointments_v2_upcoming`

Umgesetzter Rollenvertrag:

- `authenticated`:
  - `select, insert, update, delete` auf `appointments_v2`.
  - `select` auf `v_appointments_v2_upcoming`.
- `service_role`:
  - gleicher Tabellen-/View-Zugriff fuer Edge-/Admin-/Report-nahe Pfade.
- `anon`:
  - explizites `revoke all` auf Appointments-Tabelle und Upcoming-View.
  - keine neuen `anon`-Grants.
- `public`:
  - explizites `revoke all` auf Appointments-Tabelle und Upcoming-View.
  - bestehender View-Vertrag aus `09_Appointments_v2.sql` wird zentral gespiegelt/konsolidiert.
- Altgrant-Bereinigung:
  - `anon`, `public`, `authenticated` und `service_role` werden vor den Zielgrants bereinigt.
  - Danach werden nur die Zielrechte neu gesetzt.

#### Code Review

- `git diff --check -- sql/16_Explicit_Grants.sql "docs/MIDAS Supabase Explicit Grants Roadmap.md"` erfolgreich.
- Scan auf ungewollte Grants oder destruktive Statements erfolgreich:
  - keine `grant ... to anon`.
  - keine `grant ... on all`.
  - keine `drop`, `truncate`, `delete from`.
  - keine RLS-/Policy-Aenderungen.
- Vollstaendigkeitscheck S4.3 erfolgreich:
  - `appointments_v2` und `v_appointments_v2_upcoming` sind im zentralen Grant-SQL enthalten.

#### Contract Review

Pruefung gegen Ziel:

- `SG-F1` und `SG-F6` werden fuer Appointments adressiert:
  - die Table-Grants fuer `appointments_v2` sind jetzt explizit.
- `SG-F3` bleibt eingehalten:
  - `anon` wurde nicht erweitert, sondern fuer Appointments-Objekte explizit entkoppelt.
- `SG-F13` bleibt eingehalten:
  - `appointments_v2` hat `authenticated select` fuer Android-Widget-Realtime.
- Bestehende View-Grants aus `09_Appointments_v2.sql` sind im zentralen SQL gespiegelt.
- `09_Appointments_v2.sql` selbst bleibt unveraendert.
- Live-Supabase wurde nicht beruehrt.

Review-Findings:

- `SG-RF19`: `PUBLIC`-Grants koennen anonyme Lesbarkeit indirekt erhalten.
- `SG-RF20`: Additive Grants koennen alte Zusatzrechte auf Zielrollen behalten.
  - Korrektur: S4.2- und S4.3-Objekte bereinigen jetzt `anon`, `public`, `authenticated` und `service_role` vor dem Re-Grant.

#### Schritt-Abnahme

S4.3 ist abgeschlossen.

Naechster Schritt:

- S4.4 Medication-Tabellen und relevante Medication-RPCs in `sql/16_Explicit_Grants.sql` abbilden.

### S4.4 - Medication 2026-07-03

#### Durchgefuehrte Arbeiten

In `sql/16_Explicit_Grants.sql` wurden die Medication-Objekte eingetragen:

- Tabellen:
  - `public.health_medications`
  - `public.health_medication_schedule_slots`
  - `public.health_medication_slot_events`
  - `public.health_medication_stock_log`
- RPCs:
  - `public.med_reset_all_data_v2()`
  - `public.med_list_v2(date)`
  - `public.med_upsert_v2(uuid, text, text, text, text, int, int, boolean, boolean)`
  - `public.med_upsert_schedule_v2(uuid, date, jsonb)`
  - `public.med_confirm_slot_v2(uuid, date)`
  - `public.med_undo_slot_v2(uuid, date)`
  - `public.med_adjust_stock_v2(uuid, int, text)`
  - `public.med_set_stock_v2(uuid, int, text)`
  - `public.med_ack_low_stock_v2(uuid, date, int)`
  - `public.med_set_active_v2(uuid, boolean)`
  - `public.med_delete_v2(uuid)`

Umgesetzter Rollenvertrag:

- `authenticated`:
  - `select, insert, update, delete` auf:
    - `health_medications`
    - `health_medication_schedule_slots`
    - `health_medication_slot_events`
  - `select, insert, delete` auf `health_medication_stock_log`.
  - `execute` auf alle `med_*_v2`-RPCs.
- `service_role`:
  - `select, insert, update, delete` auf alle vier Medication-Tabellen.
  - `execute` auf alle `med_*_v2`-RPCs.
- `anon`:
  - explizites `revoke all` auf Medication-Tabellen und `med_*_v2`-RPCs.
  - keine neuen `anon`-Grants.
- `public`:
  - explizites `revoke all` auf Medication-Tabellen und `med_*_v2`-RPCs.
- Altgrant-Bereinigung:
  - `anon`, `public`, `authenticated` und `service_role` werden vor den Zielgrants bereinigt.
  - Danach werden nur die Zielrechte neu gesetzt.

#### Code Review

- `git diff --check -- sql/16_Explicit_Grants.sql "docs/MIDAS Supabase Explicit Grants Roadmap.md"` erfolgreich.
- Scan auf ungewollte Grants oder destruktive Statements erfolgreich:
  - keine `grant ... to anon`.
  - keine `grant ... on all`.
  - keine `drop`, `truncate`, `delete from`.
  - keine RLS-/Policy-Aenderungen.
- Vollstaendigkeitscheck S4.4 erfolgreich:
  - alle vier Medication-Tabellen sind im zentralen Grant-SQL enthalten.
  - alle elf `med_*_v2`-RPC-Signaturen aus `sql/12_Medication.sql` sind gespiegelt.
- Spezialcheck `health_medication_stock_log` erfolgreich:
  - `authenticated` hat kein `update`.
  - `service_role` hat volle DML-Rechte.

#### Contract Review

Pruefung gegen Ziel:

- `SG-F1` und `SG-F6` werden fuer Medication adressiert:
  - vormals nicht systematisch dokumentierte Medication-Table-Grants sind jetzt explizit.
- `SG-F11` bleibt eingehalten:
  - Security-invoker-Medication-RPCs haben passende Basistabellenrechte.
- `SG-F13` bleibt eingehalten:
  - Realtime-relevante Medication-Tabellen haben `authenticated select`.
- `SG-RF14` bleibt eingehalten:
  - `health_medication_stock_log` bekommt fuer `authenticated` kein `update`.
- Bestehende `med_*_v2`-Execute-Grants aus `sql/12_Medication.sql` sind im zentralen SQL gespiegelt.
- `sql/12_Medication.sql` selbst bleibt unveraendert.
- Live-Supabase wurde nicht beruehrt.

Review-Findings:

- `SG-RF20`: Additive Grants koennen alte Zusatzrechte auf Zielrollen behalten; besonders relevant fuer `health_medication_stock_log`, weil `authenticated update` verboten bleibt.
  - Korrektur: S4.4-Medication-Objekte bereinigen jetzt `anon`, `public`, `authenticated` und `service_role` vor dem Re-Grant.

#### Schritt-Abnahme

S4.4 ist abgeschlossen.

Naechster Schritt:

- S4.5 Trendpilot-Tabellen und Trendpilot-View in `sql/16_Explicit_Grants.sql` abbilden.

### S4.5 - Trendpilot 2026-07-03

#### Durchgefuehrte Arbeiten

In `sql/16_Explicit_Grants.sql` wurden die Trendpilot-Objekte eingetragen:

- Tabellen:
  - `public.trendpilot_events`
  - `public.trendpilot_state`
- View:
  - `public.trendpilot_events_range`

Umgesetzter Rollenvertrag:

- `authenticated`:
  - `select, update, delete` auf `trendpilot_events`.
  - `select` auf `trendpilot_events_range`.
  - keine Rechte auf `trendpilot_state`.
  - kein `insert` auf `trendpilot_events`.
- `service_role`:
  - `select, insert, update, delete` auf `trendpilot_events`.
  - `select` auf `trendpilot_events_range`.
  - `select, insert, update, delete` auf `trendpilot_state`.
- `anon`:
  - explizites `revoke all` auf Trendpilot-Tabellen und Trendpilot-View.
  - keine neuen `anon`-Grants.
- `public`:
  - explizites `revoke all` auf Trendpilot-Tabellen und Trendpilot-View.
- Altgrant-Bereinigung:
  - `anon`, `public`, `authenticated` und `service_role` werden vor den Zielgrants bereinigt.
  - Danach werden nur die Zielrechte neu gesetzt.

#### Code Review

- `git diff --check -- sql/16_Explicit_Grants.sql "docs/MIDAS Supabase Explicit Grants Roadmap.md"` erfolgreich.
- Scan auf ungewollte Grants oder destruktive Statements erfolgreich:
  - keine `grant ... to anon`.
  - keine `grant ... on all`.
  - keine `drop`, `truncate`, `delete from`.
  - keine RLS-/Policy-Aenderungen.
- Vollstaendigkeitscheck S4.5 erfolgreich:
  - beide Trendpilot-Tabellen und die Trendpilot-View sind im zentralen Grant-SQL enthalten.
- Spezialchecks erfolgreich:
  - `trendpilot_state` hat keinen `authenticated`-Grant.
  - `trendpilot_events` hat fuer `authenticated` kein `insert`.

#### Contract Review

Pruefung gegen Ziel:

- `SG-F1` und `SG-F6` werden fuer Trendpilot adressiert:
  - vormals nicht systematisch dokumentierte Trendpilot-Grants sind jetzt explizit.
- `SG-F3` bleibt eingehalten:
  - `anon` wurde nicht erweitert.
- `SG-F14` bleibt eingehalten:
  - `trendpilot_state` bleibt service-role-only.
- PWA-/Doctor-Stack-Lesepfade bleiben abgedeckt:
  - `trendpilot_events_range` hat `authenticated select`.
  - `trendpilot_events` hat `authenticated select/update/delete` fuer Ack/Delete.
- Edge-/Report-Pfade bleiben abgedeckt:
  - `service_role` hat passende Rechte auf `trendpilot_events`, `trendpilot_events_range` und `trendpilot_state`.
- Live-Supabase wurde nicht beruehrt.

Review-Findings:

- `SG-RF20`: Additive Grants koennen alte Zusatzrechte auf Zielrollen behalten.
  - Korrektur: S4.2 bis S4.5 bereinigen jetzt `anon`, `public`, `authenticated` und `service_role` vor den Zielgrants.

#### Schritt-Abnahme

S4.5 ist abgeschlossen.

Naechster Schritt:

- S4.6 Push-Tabellen in `sql/16_Explicit_Grants.sql` abbilden.

### S4.6 - Push 2026-07-03

#### Durchgefuehrte Arbeiten

In `sql/16_Explicit_Grants.sql` wurden die Push-Objekte eingetragen:

- Tabellen:
  - `public.push_subscriptions`
  - `public.push_notification_deliveries`

Umgesetzter Rollenvertrag:

- `authenticated`:
  - `select, insert, update, delete` auf `push_subscriptions`.
  - `select` auf `push_notification_deliveries`.
- `service_role`:
  - `select, insert, update, delete` auf `push_subscriptions`.
  - `select, insert, update, delete` auf `push_notification_deliveries`.
- `anon`:
  - explizites `revoke all` auf beide Push-Tabellen.
  - keine neuen `anon`-Grants.
- `public`:
  - explizites `revoke all` auf beide Push-Tabellen.
- Altgrant-Bereinigung:
  - `anon`, `public`, `authenticated` und `service_role` werden vor den Zielgrants bereinigt.
  - Danach werden nur die Zielrechte neu gesetzt.

#### Code Review

- `git diff --check -- sql/16_Explicit_Grants.sql "docs/MIDAS Supabase Explicit Grants Roadmap.md"` erfolgreich.
- Scan auf ungewollte Grants oder destruktive Statements erfolgreich:
  - keine `grant ... to anon`.
  - keine `grant ... on all`.
  - keine `drop`, `truncate`, `delete from`.
  - keine RLS-/Policy-Aenderungen.
- Vollstaendigkeitscheck S4.6 erfolgreich:
  - beide Push-Tabellen sind im zentralen Grant-SQL enthalten.
- Spezialcheck `push_notification_deliveries` erfolgreich:
  - `authenticated` hat nur `select`.
  - `service_role` hat volle DML-Rechte.

#### Contract Review

Pruefung gegen Ziel:

- `SG-F1` und `SG-F6` werden fuer Push adressiert:
  - vormals nicht systematisch dokumentierte Push-Table-Grants sind jetzt explizit.
- `SG-F3` bleibt eingehalten:
  - `anon` wurde nicht erweitert.
- `SG-RF13` bleibt eingehalten:
  - `push_notification_deliveries` bekommt fuer `authenticated` keine Write-Rechte.
- Client-Pfade bleiben abgedeckt:
  - PWA kann `push_subscriptions` registrieren, lesen, aktualisieren und loeschen.
  - User kann Delivery-State lesen.
- Edge-/Scheduler-Pfade bleiben abgedeckt:
  - `service_role` kann Subscription-Health und Delivery-/Dedupe-State schreiben.
- Live-Supabase wurde nicht beruehrt.

Review-Findings:

- Keine offenen S4.6-Findings.

#### Schritt-Abnahme

S4.6 ist abgeschlossen.

Naechster Schritt:

- S4.7 Intake, Activity und uebrige Data-API-RPCs in `sql/16_Explicit_Grants.sql` abbilden.

### S4.7 - Intake, Activity und uebrige Data-API-RPCs 2026-07-03

#### Durchgefuehrte Arbeiten

In `sql/16_Explicit_Grants.sql` wurden die verbleibenden Data-API-RPCs eingetragen:

- Intake:
  - `public.upsert_intake(date, numeric, numeric, numeric)`
- Activity:
  - `public.activity_add(date, jsonb)`
  - `public.activity_list(date, date)`
  - `public.activity_delete(uuid)`

Umgesetzter Rollenvertrag:

- `authenticated`:
  - `execute` auf alle vier S4.7-RPCs.
- `service_role`:
  - `execute` auf alle vier S4.7-RPCs.
- `anon`:
  - explizites `revoke all` auf alle vier S4.7-RPCs.
  - `upsert_intake` hat keinen Ziel-Grant an `anon`.
- `public`:
  - explizites `revoke all` auf alle vier S4.7-RPCs.
- Altgrant-Bereinigung:
  - `anon`, `public`, `authenticated` und `service_role` werden vor den Zielgrants bereinigt.
  - Danach werden nur die Zielrechte neu gesetzt.

#### Code Review

- `git diff --check -- sql/16_Explicit_Grants.sql "docs/MIDAS Supabase Explicit Grants Roadmap.md"` erfolgreich.
- Scan auf ungewollte Grants oder destruktive Statements erfolgreich:
  - keine `grant ... to anon`.
  - keine `grant ... on all`.
  - keine `drop`, `truncate`, `delete from`.
  - keine RLS-/Policy-Aenderungen.
- Vollstaendigkeitscheck S4.7 erfolgreich:
  - `upsert_intake`, `activity_add`, `activity_list` und `activity_delete` sind im zentralen Grant-SQL enthalten.
- Spezialcheck `upsert_intake` erfolgreich:
  - kein Ziel-`grant execute ... to anon`.

#### Contract Review

Pruefung gegen Ziel:

- `SG-F8` und `SG-F12` werden adressiert:
  - `upsert_intake` ist von `anon` entkoppelt und auf `authenticated`, `service_role` begrenzt.
- `SG-F11` bleibt eingehalten:
  - `upsert_intake` und `activity_add` werden durch `health_events`-Basistabellenrechte aus S4.2 gestuetzt.
  - `activity_list` wird durch `v_events_activity`-Viewrechte und `health_events`-Basistabellenrechte aus S4.2 gestuetzt.
  - `activity_delete` wird durch `health_events`-Basistabellenrechte aus S4.2 gestuetzt.
- Bestehende Activity-Execute-Grants aus `sql/13_Activity_Event.sql` sind im zentralen SQL gespiegelt.
- `sql/05_Intake_Rpc.sql`, `sql/06_Security.sql` und `sql/13_Activity_Event.sql` bleiben unveraendert.
- Live-Supabase wurde nicht beruehrt.

Review-Findings:

- Keine offenen S4.7-Findings.

#### Schritt-Abnahme

S4.7 ist abgeschlossen.

Naechster Schritt:

- S4.8 SQL How-To Grant-Konvention dokumentieren.

### S4.8 - SQL How-To Grant-Konvention 2026-07-04

#### Durchgefuehrte Arbeiten

`sql/HOW_TO.md` wurde um einen Abschnitt `Explicit Data API Grants` erweitert.

Dokumentierte Konventionen:

- Neue Data-API-relevante Objekte muessen explizite Grants erhalten.
- Grant-Platzierung:
  - direkt im aktiven Modul-SQL, wenn dieses SQL die Provisioning-Quelle ist.
  - in `sql/16_Explicit_Grants.sql`, wenn das Objekt bereits existiert oder als Nachzieh-/Provisioning-Update behandelt wird.
- `sql/16_Explicit_Grants.sql` ist kein standalone Schema-Bootstrap.
- Run-Order pro Objekt:
  - Objekt anlegen/aendern.
  - RLS fuer userbezogene Tabellen aktivieren.
  - Policies anlegen.
  - alte breite Grants von `anon`, `public`, `authenticated`, `service_role` bereinigen, wenn ein sauberer Zielvertrag gesetzt wird.
  - nur explizite Zielrechte vergeben.
- Rollenvertrag:
  - `anon` ohne Table-/View-Grants und ohne `upsert_intake`-Execute.
  - `authenticated` fuer userseitige Data-API-Rechte unter RLS oder security-invoker-Vertrag.
  - `service_role` fuer Edge-/Scheduler-/Report-/Admin-Pfade.
- Keine pauschalen Grants:
  - kein `grant all`.
  - kein `grant ... on all tables/functions in schema public`.
- Checklisten fuer Tabellen, Views und Data-API-RPCs.

#### Code Review

- `git diff --check -- sql/HOW_TO.md "docs/MIDAS Supabase Explicit Grants Roadmap.md" sql/16_Explicit_Grants.sql` erfolgreich.
- Whitespace-Scan erfolgreich:
  - keine trailing whitespace Treffer in `sql/HOW_TO.md`, Roadmap oder `sql/16_Explicit_Grants.sql`.
- Inhalts-Scan erfolgreich:
  - `Explicit Data API Grants`
  - `sql/16_Explicit_Grants.sql`
  - `Required Order Per Object`
  - `Role Contract`
  - `anon`
  - `upsert_intake`
  - `security invoker`
  - Base-table-/View-Grant-Hinweis fuer RPCs.

#### Contract Review

Pruefung gegen Ziel:

- S4.8-Anforderung `neue Module muessen Grants explizit definieren` ist abgedeckt.
- S4.8-Anforderung `sql/16_Explicit_Grants.sql als zentrales Nachzieh-/Provisioning-SQL dokumentieren` ist abgedeckt.
- S4.8-Anforderung `anon-Regel dokumentieren` ist abgedeckt.
- S4.8-Anforderung `RLS-vor-Policy-vor-Grant-Reihenfolge dokumentieren` ist abgedeckt.
- Die in S4.2 bis S4.7 gefundene additive Grant-Drift ist in der neuen Konvention sichtbar:
  - Zielrollen werden vor dem Re-Grant bereinigt, wenn ein sauberer Zielvertrag gesetzt wird.
- Live-Supabase wurde nicht beruehrt.

Review-Findings:

- Keine offenen S4.8-Findings.

#### Schritt-Abnahme

S4.8 ist abgeschlossen.

Naechster Schritt:

- S4.9 Gesamt-SQL-/Contract-Review fuer S4.

### S4.9 - Gesamt-SQL-/Contract-Review fuer S4 2026-07-04

#### Durchgefuehrte Arbeiten

S4.9 wurde als Review- und Abnahmeschritt fuer die gesamte S4-Umsetzung
durchgefuehrt.

Gepruefte Artefakte:

- `sql/16_Explicit_Grants.sql`
- `sql/HOW_TO.md`
- aktive SQL-Objektquellen in `sql/`
- Supabase Security Advisor Export aus dem Dashboard

Durchgefuehrte Abgleiche:

- Aktive Tabellen aus den aktiven SQL-Dateien gegen `sql/16_Explicit_Grants.sql`.
- Aktive Views aus den aktiven SQL-Dateien gegen `sql/16_Explicit_Grants.sql`.
- Data-API-RPCs gegen `grant execute` / `revoke all` in `sql/16_Explicit_Grants.sql`.
- Helper-, Trigger- und interne Funktionen gegen bewusste Nicht-Exposition.
- `anon`-/`public`-Rechte gegen Zielvertrag.
- `authenticated`-Rechte gegen bekannte MIDAS-Data-API-Pfade.
- Supabase Security Advisor Warnings gegen den S4-Zielvertrag.

Objektabdeckung:

- Alle aktiven Tabellen sind im zentralen Grant-SQL enthalten:
  - `appointments_v2`
  - `health_events`
  - `health_medications`
  - `health_medication_schedule_slots`
  - `health_medication_slot_events`
  - `health_medication_stock_log`
  - `push_notification_deliveries`
  - `push_subscriptions`
  - `trendpilot_events`
  - `trendpilot_state`
  - `user_profile`
- Alle aktiven Views sind im zentralen Grant-SQL enthalten:
  - `trendpilot_events_range`
  - `v_appointments_v2_upcoming`
  - `v_events_activity`
  - `v_events_body`
  - `v_events_bp`
  - `v_events_lab`
- Alle Data-API-RPCs sind im zentralen Grant-SQL enthalten:
  - `upsert_intake`
  - `activity_add`
  - `activity_list`
  - `activity_delete`
  - alle `med_*_v2`-RPCs aus `sql/12_Medication.sql`

Bewusst nicht exponierte Funktionen:

- Trigger-/Validation-/Timestamp-Helper:
  - `trg_events_validate`
  - `set_appointments_v2_updated_at`
  - `set_push_subscriptions_updated_at`
  - `set_user_profile_updated_at`
- Medication-Internal-Helper:
  - `_med_default_slot_type`
  - `_med_infer_slot_type`
  - `_med_today`

Diese Funktionen sind keine direkt benoetigten Data-API-RPCs und erhalten daher
keinen `grant execute` im zentralen Zielvertrag.

Supabase Security Advisor Bewertung:

- `pg_graphql_anon_table_exposed`:
  - 17 gemeldete Tabellen/Views.
  - Alle 17 Objekte sind in `sql/16_Explicit_Grants.sql` enthalten.
  - Das zentrale SQL revoked `anon` und `public` fuer diese Objekte und setzt nur die Zielrollen neu.
  - Erwartung nach produktiver SQL-Ausfuehrung: keine unerwartete anonyme MIDAS-Objekt-Exposition.
- `pg_graphql_authenticated_table_exposed`:
  - Nicht pauschal als Fehler gewertet.
  - MIDAS nutzt bewusst `authenticated` Data-API-Pfade in PWA, Android und Realtime-nahen Flows.
  - RLS/Policies bleiben die Row-Sicherheitsgrenze.
  - Einzelobjekte koennen spaeter gehaertet werden, wenn ein User-Consumer entfaellt.
- `auth_leaked_password_protection`:
  - Kein SQL-Grant-Thema.
  - Als separates Supabase-Auth-Dashboard-Hygiene-Thema abgegrenzt.

#### Code Review

- `git diff --check -- sql/16_Explicit_Grants.sql sql/HOW_TO.md "docs/MIDAS Supabase Explicit Grants Roadmap.md"` erfolgreich.
- Whitespace-/Syntax-naher Scan erfolgreich:
  - keine trailing-whitespace-Fehler.
  - keine `grant ... to anon`.
  - keine `grant ... to public`.
  - keine `grant ... on all`.
  - keine `grant all`.
  - keine `drop`, `truncate`, `delete from`.
  - keine RLS-/Policy-Aenderungen.
- Objektinventar-Scan erfolgreich:
  - Tabellen und Views sind vollstaendig abgedeckt.
  - Data-API-RPCs sind abgedeckt.
  - Nicht abgedeckte Funktionen sind bewusst interne Helper.

Hinweis:

- Git meldet fuer `sql/HOW_TO.md`, dass CRLF beim naechsten Git-Touch in LF
  umgewandelt wird. Das ist eine Line-Ending-Warnung, kein S4.9-Blocker.

#### Contract Review

Pruefung gegen S4.9:

- Jedes aktive `create table` hat eine Grant-Entscheidung:
  - erfuellt.
- Jede aktive View hat eine Grant-Entscheidung:
  - erfuellt.
- Jeder Data-API-RPC hat eine Execute-Entscheidung:
  - erfuellt.
- Keine ungewollten `anon`-Grants:
  - erfuellt.
- Keine RLS-Lockerung:
  - erfuellt.
- Keine Aenderungen an Cleanup-/Transition-SQLs ohne eigenen Grund:
  - erfuellt.
- Supabase Security Advisor `anon`-Warnings:
  - in Scope und durch das zentrale Grant-SQL abgedeckt.
- Supabase Security Advisor `authenticated`-Warnings:
  - nicht blind zu entfernen, weil sie fuer MIDAS-User-Pfade erwartbar sind.
- Supabase Auth Password-Leak-Protection:
  - out of scope fuer diese SQL-Roadmap.

Review-Findings:

- Keine offenen S4.9-Findings.

#### Schritt-Abnahme

S4.9 ist abgeschlossen.

Naechster Schritt:

- S5 Tests, Code Review und Contract Review.

### S5 - Lokale Tests, Code Review und Contract Review 2026-07-04

#### Durchgefuehrte Arbeiten

S5 wurde lokal bis zum externen Review-Gate abgearbeitet. Danach wurden
CodeRabbit-Review, Live-SQL-Apply und Supabase Security Advisor
Live-Nachpruefung ergaenzt.

Abgearbeitete Substeps:

- S5.1 `git diff --check` fuer betroffene Dateien.
- S5.2 Tabellenabdeckung gegen `sql/16_Explicit_Grants.sql`.
- S5.3 Viewabdeckung gegen `sql/16_Explicit_Grants.sql`.
- S5.4 Data-API-RPC-Abdeckung gegen `grant execute`-Entscheidungen.
- S5.5 `anon`-Grant-Scan.
- S5.6 Scope-Check auf ungewollte Aenderungen an Cleanup-/Transition-/Alt-SQLs.
- S5.7 Realtime-Tabellen-Check.
- S5.8 `trendpilot_state`-Spezialcheck.
- S5.9 SQL-/Security-Review.
- S5.10 Supabase Security Advisor Live-Nachpruefung.
- S5.11 Live-SQL-Apply.
- S5.13 Externer Review-Gate:
  - CodeRabbit ohne Findings.
- S5.14 lokale Findings-Korrektur:
  - keine lokalen Korrekturen erforderlich.
- S5.15 vorlaeufige Schritt-Abnahme:
  - lokaler Stand war bereit fuer CodeRabbit.

Noch nicht ausgefuehrt:

- S5.12 Data-API-Smoke:
  - offen nach erfolgreichem Live-SQL-Apply.

#### Code Review

`git diff --check`:

- Erfolgreich fuer:
  - `sql/16_Explicit_Grants.sql`
  - `sql/HOW_TO.md`
  - `docs/MIDAS Supabase Explicit Grants Roadmap.md`
- Hinweis:
  - Git meldet fuer `sql/HOW_TO.md`, dass CRLF beim naechsten Git-Touch in LF umgewandelt wird.
  - Das ist kein inhaltlicher oder syntaktischer Fehler.

Risk-Pattern-Scan:

- Keine Treffer fuer:
  - `grant ... to anon`
  - `grant ... to public`
  - `grant ... on all`
  - `grant all`
  - `drop`
  - `truncate`
  - `delete from`
  - RLS-disable-/Policy-Aenderungen

Tabellen-/View-/RPC-Abdeckung:

- Fehlende aktive Tabellen im Grant-SQL:
  - `0`
- Fehlende aktive Views im Grant-SQL:
  - `0`
- Fehlende Data-API-RPCs im Grant-SQL:
  - `0`
- Bewusst nicht gegrantete interne Funktionen:
  - `_med_default_slot_type`
  - `_med_infer_slot_type`
  - `_med_today`
  - `set_appointments_v2_updated_at`
  - `set_push_subscriptions_updated_at`
  - `set_user_profile_updated_at`
  - `trg_events_validate`

Realtime-/Widget-relevante Tabellen:

- `health_events` hat `authenticated select`.
- `health_medications` hat `authenticated select`.
- `health_medication_schedule_slots` hat `authenticated select`.
- `health_medication_slot_events` hat `authenticated select`.
- `appointments_v2` hat `authenticated select`.

Spezialchecks:

- `trendpilot_state` hat keinen `authenticated`-Grant.
- `trendpilot_state` hat nur `service_role`-DML im Zielvertrag.
- `upsert_intake` hat keinen Ziel-Grant an `anon`.

Scope-Check:

- Keine App-, Backend-, Android- oder historischen SQL-Dateien wurden im Zuge von S5 geaendert.
- Geaenderte/neu angelegte Roadmap-Artefakte dieser Roadmap:
  - `docs/MIDAS Supabase Explicit Grants Roadmap.md`
  - `sql/16_Explicit_Grants.sql`
  - `sql/HOW_TO.md`
- Separat vorhandenes Future-Notes-Dokument:
  - `docs/archive/MIDAS Medication Data Hygiene Future Notes.md`
  - nicht Teil dieses Grant-Fixes.

Live-SQL und Supabase Security Advisor:

- `sql/16_Explicit_Grants.sql` wurde durch den User im Supabase SQL Editor produktiv ausgefuehrt.
- Ergebnis:
  - SQL lief erfolgreich durch.
- Security Advisor Export nach SQL-Ausfuehrung:
  - `pg_graphql_anon_table_exposed`: `0` Treffer.
  - `pg_graphql_authenticated_table_exposed`: `16` Treffer.
  - `auth_leaked_password_protection`: `1` Treffer.
- Bewertung:
  - Der kritische anonyme GraphQL-/Data-API-Exposure-Pfad ist geschlossen.
  - Die verbleibenden `authenticated`-Warnings sind erwartbar fuer MIDAS-User-Data-API-Pfade.
  - `trendpilot_state` ist nicht mehr in den `authenticated`-Warnings enthalten.
  - `auth_leaked_password_protection` bleibt separates Supabase-Auth-Dashboard-Hygiene-Thema.

#### Contract Review

Pruefung gegen Roadmap-Ziel:

- MIDAS bleibt auth-getrieben:
  - erfuellt.
- Keine `anon`-Table-/View-Grants:
  - erfuellt.
- `authenticated` bleibt fuer userseitige Data-API-Pfade erhalten:
  - erfuellt.
- `service_role` ist fuer Edge-/Scheduler-/Report-/Admin-Pfade explizit abgedeckt:
  - erfuellt.
- RLS/Policies wurden nicht gelockert:
  - erfuellt.
- Zentrales Grant-SQL bleibt Nachzieh-/Provisioning-SQL:
  - erfuellt.
- Keine pauschalen Schema- oder Rollen-Grants:
  - erfuellt.
- Security-Advisor-`anon`-Warnings sind durch das SQL adressiert:
  - erfuellt, Live-Nachpruefung zeigt `0` Treffer.
- `authenticated`-Warnings bleiben bewusst kein Blindfix:
  - erfuellt.
- `auth_leaked_password_protection` bleibt out of scope:
  - erfuellt.

Review-Findings:

- Keine lokalen S5-Findings.

#### Schritt-Abnahme

S5 ist lokal, extern und live fuer den Grant-Teil abgeschlossen.

Naechster Schritt:

- S6 Doku-Sync, QA-Update und finaler Abschlussreview.

### S6 - Doku-Sync, QA-Update und finaler Abschlussreview 2026-07-04

#### Durchgefuehrte Arbeiten

S6 wurde deterministisch abgearbeitet.

- S6.1 `sql/HOW_TO.md` finalisiert:
  - Security-Advisor-Interpretation fuer `pg_graphql_anon_table_exposed`,
    `pg_graphql_authenticated_table_exposed`, GraphQL und
    `auth_leaked_password_protection` ergaenzt.
  - Data-API-Grants bleiben objektgenau und RLS-gebunden dokumentiert.
- S6.2 `docs/DEV_ENVIRONMENT.md` aktualisiert:
  - Supabase SQL Editor, Security Advisor und RLS Tester als produktive oder
    produktionsnahe Werkzeuge dokumentiert.
  - User-Freigabe fuer produktives SQL bestaetigt.
  - MIDAS-spezifische Interpretation der Security-Advisor-Warnings
    dokumentiert.
- S6.3 `docs/QA_CHECKS.md` aktualisiert:
  - neue Phase `S18 - Supabase Explicit Data API Grants` angelegt.
  - lokale Checks, Rollenvertrag, Live-SQL-Ergebnis und Security-Advisor-
    Ergebnis dokumentiert.
- S6.4 Module Overviews geprueft:
  - keine Aktualisierung notwendig.
  - Begruendung: Es wurde kein Modulverhalten, kein Datenmodell und keine
    fachliche App-Logik geaendert. Grants sind hier ein querliegender
    SQL-/Security-Vertrag, dokumentiert in `sql/HOW_TO.md`,
    `docs/DEV_ENVIRONMENT.md` und `docs/QA_CHECKS.md`.
- S6.5 Roadmap Ergebnisprotokolle aktualisiert:
  - Status auf `DONE`.
  - letzter Stand auf S6-Abschluss gesetzt.
  - offener Data-API-Smoke als optionaler user-gated Check abgegrenzt.

#### Contract Review

Pruefung gegen Roadmap-Ziel:

- Source-of-Truth-Dokus synchronisiert:
  - erfuellt.
- Zentrales Grant-SQL bleibt alleiniger technischer Fix-Artefakt:
  - erfuellt.
- Keine Modul-Doku behauptet neue Fachlogik:
  - erfuellt.
- Security Advisor wird fuer kuenftige Chats differenziert lesbar:
  - erfuellt.
- `pg_graphql_anon_table_exposed = 0` ist als erfolgreicher Live-Befund
  dokumentiert:
  - erfuellt.
- `pg_graphql_authenticated_table_exposed` wird nicht blind als Fehler
  behandelt:
  - erfuellt.
- GraphQL bleibt als derzeit nicht genutzter MIDAS-Pfad abgegrenzt:
  - erfuellt.
- Produktive SQL-Ausfuehrung bleibt user-gated:
  - erfuellt.

Review-Findings:

- Keine offenen S6-Findings.

#### Schritt-Abnahme

S6 ist abgeschlossen.

Finaler Stand:

- Roadmap ist fachlich abgeschlossen.
- `sql/16_Explicit_Grants.sql` wurde erfolgreich produktiv ausgefuehrt.
- Security Advisor zeigt keine anonymen GraphQL-/Data-API-Exposure-Warnings
  mehr fuer MIDAS-Objekte.
- Verbleibende authentifizierte GraphQL-Warnings sind bewusst als erwartbarer
  MIDAS-Data-API-Kontext dokumentiert.
- Roadmap wird nach Abschlussreview als `(DONE)` ins Archiv verschoben.
