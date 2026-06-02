# MIDAS Monthly Report Review Findings Roadmap (DONE)

## Ziel (klar und pruefbar)

Die Monthly-/Range-Report Edge Function soll die Review-Findings sauber abfangen, ohne aus Reports eine Diagnose-, Therapie- oder neue Alert-Engine zu machen.

Pruefbare Zieldefinition:

- `midas-monthly-report` erzwingt den Auth-Vertrag:
  - Scheduler/Service-Role darf `MONTHLY_REPORT_USER_ID` nutzen.
  - User-nahe manuelle Calls laufen ueber User-JWT.
  - Kein unauthentifizierter Fallback auf den Default-User.
- `report_type` wird strikt auf `monthly_report` oder `range_report` begrenzt.
- `from`, `to` und `month` werden als echte Kalenderwerte validiert; kein stilles JS-Date-Rolling.
- Reports sind in der Inbox nachvollziehbar auffindbar:
  - Zeitraum bleibt in `payload.period`.
  - Erzeugungszeitpunkt bleibt als Erzeugungszeitpunkt erkennbar.
  - Filter-/Sortiervertrag mit `health_events.day` ist bewusst entschieden und dokumentiert.
- Client- und Edge-Function-Payload sprechen denselben Zeitstempelvertrag (`generated_at`/`created_at`).
- Range-Activity-Text enthaelt keine doppelte `Durchschnitt`-Formulierung.
- `docs/modules/Reports Module Overview.md`, `docs/QA_CHECKS.md` und diese Roadmap bilden den finalen Vertrag ab.

## Problemzusammenfassung

Beim Code Review von `backend/supabase/functions/midas-monthly-report/index.ts` wurden keine akuten Type- oder Runtime-Blocker gefunden; `deno check` ist gruen und die Function funktioniert im Alltag gefuehlt stabil.

Trotzdem gibt es echte Vertragsrisiken:

- Der Handler nutzt bei Monthly Reports direkt `MONTHLY_REPORT_USER_ID`, ohne den Bearer-Token im Codepfad sauber als Service-Role zu pruefen.
- Der Handler faellt auch ausserhalb des expliziten Monthly-Scheduler-Pfads auf `MONTHLY_REPORT_USER_ID` zurueck, wenn kein User-Token verarbeitet wurde.
- `report_type` wird nur TypeScript-seitig typisiert, aber zur Runtime nicht hart validiert.
- `from`, `to` und `month` werden kalenderweich normalisiert:
  - `from/to` werden per `.slice(0, 10)` gekuerzt.
  - `monthBoundsUTC(Number(y), Number(m))` kann ungueltige Monate still rollen.
- Reports werden als `health_events` gespeichert; `day` ist generated aus `ts`.
  - Die Inbox filtert Reports aber ueber `health_events.day`.
  - Dadurch kann ein Bericht fuer einen alten Zeitraum nach Erstellung heute aus einem alten Inbox-Zeitraum herausfallen.
- Die Edge Function schreibt `payload.generated_at`, waehrend der Client aktuell `payload.created_at` als Report-Erstellungszeit konsumiert und sonst auf `row.ts` zurueckfaellt.
- Der Range-Activity-Text kann `Durchschnitt: Durchschnitt ...` erzeugen.

Das Ziel ist ein enger Contract-Fix, kein Reporting-Umbau.

## Scope

- Code:
  - `backend/supabase/functions/midas-monthly-report/index.ts`
  - `app/supabase/api/system-comments.js`
- Doku:
  - `docs/modules/Reports Module Overview.md`
  - `docs/QA_CHECKS.md`
  - diese Roadmap
- Read-only Review:
  - `app/supabase/api/reports.js`
  - `app/modules/doctor-stack/reports/index.js`
  - `app/modules/doctor-stack/doctor/index.js`
  - `.github/workflows/monthly-report.yml`
  - relevante SQL-Dateien fuer `health_events.day` und `system_comment`

## Not in Scope

- Keine neue Report-UI.
- Keine neue Arztbericht-Struktur oder Layout-Redesign.
- Keine neuen medizinischen Bewertungen, Schwellen oder Diagnosen.
- Keine Aenderung der BP-/Body-/Lab-/Activity-Auswertungsformeln ausser Copy-Hygiene.
- Keine SQL-/RLS-/Schema-Aenderung, ausser S1-S3 finden einen harten Contract-Bruch.
- Keine Aenderung anderer Edge Functions.
- Kein Assistant-/Voice-/OpenAI-Pfad.
- Kein Push-/Reminder-Pfad.
- Kein Supabase Deploy ohne ausdrueckliche Freigabe.
- Kein GitHub Workflow-Smoke mit Schreibwirkung ohne ausdrueckliche Freigabe.

## Relevante Referenzen (Code)

- `backend/supabase/functions/midas-monthly-report/index.ts`
- `app/supabase/api/reports.js`
- `app/supabase/api/system-comments.js`
- `app/modules/doctor-stack/reports/index.js`
- `app/modules/doctor-stack/doctor/index.js`
- `.github/workflows/monthly-report.yml`
- `sql/01_Health Schema.sql`
- `sql/07_Remove_Day_Flags.sql`
- `sql/13_Activity_Event.sql`

## Relevante Referenzen (Doku)

- `README.md`
- `docs/DEV_ENVIRONMENT.md`
- `docs/MIDAS Roadmap Template.md`
- `docs/modules/Reports Module Overview.md`
- `docs/modules/Doctor View Module Overview.md`
- `docs/modules/Activity Module Overview.md`
- `docs/QA_CHECKS.md`
- `docs/archive/Doctor Lab Domain Roadmap.md`
- `docs/archive/Doctor Report Roadmap.md`
- `docs/archive/Reports-Roadmap.md`
- `docs/archive/MIDAS Backend Edge Functions Deno Check Roadmap (DONE).md`
- `docs/archive/MIDAS Backend Source Integration Roadmap (DONE).md`

Regel:

- Erst Doku und bestehende Report-Vertraege lesen.
- Dann Edge Function, Client-Wrapper, Inbox-Konsumenten, Workflow und SQL-Vertrag lesen.
- S1-S3 klaeren Auth, Date, Persistenz und Copy-Vertraege.
- Erst danach Code aendern.

## Guardrails

- MIDAS bleibt single-user und alltagstauglich.
- Reports bleiben Rueckblick-/Archivdokumente, keine Echtzeit-Alerts.
- Keine freie medizinische Diagnose oder Therapieempfehlung.
- Keine versteckten Writes aus unauthentifizierten Pfaden.
- Keine falsche Sicherheit durch unsaubere Auth-Fallbacks.
- Keine still falsch gerollten Datumswerte.
- Keine Inbox-Verwirrung durch unklaren Zeitraum-/Erstellungszeit-Vertrag.
- Source-of-Truth-Dokus muessen am Ende synchron sein.

## Architektur-Constraints

- Supabase Edge Function laeuft in Deno.
- `health_events.day` ist generated aus `ts` in `Europe/Vienna`.
- Reports werden als `health_events` mit `type = system_comment` gespeichert.
- Inbox-Filterung erfolgt ueber `payload.subtype` und `health_events.day`.
- Monthly Reports sind idempotent pro `payload.subtype = monthly_report` und `payload.month`.
- Range Reports sind bewusst nicht dedupliziert.
- GitHub Scheduler nutzt Service-Role und `MONTHLY_REPORT_USER_ID`.
- User-nahe manuelle Calls nutzen den normalen Supabase User-JWT via `fetchWithAuth`.
- `deno check` ist Pflicht, ersetzt aber keinen echten Edge Runtime-Smoke.

## Tool Permissions

Allowed:

- Lesen und Aendern von:
  - `backend/supabase/functions/midas-monthly-report/index.ts`
  - `app/supabase/api/system-comments.js`
  - `docs/modules/Reports Module Overview.md`
  - `docs/QA_CHECKS.md`
  - diese Roadmap
- Lesen der referenzierten Client-, SQL-, Workflow- und Doku-Dateien.
- Lokale Checks:
  - `deno check backend/supabase/functions/midas-monthly-report/index.ts`
  - `node --check app/supabase/api/system-comments.js`
  - `git diff --check`
  - gezielte `rg`-/`Select-String`-Scans.

Forbidden:

- Supabase Deploy ohne ausdrueckliche User-Freigabe.
- GitHub Workflow-Smoke ohne ausdrueckliche User-Freigabe.
- SQL-/RLS-/Schema-Aenderungen ohne neue Freigabe.
- UI-Redesign oder Doctor-Panel-Umbau.
- Neue medizinische Bewertungslogik.
- Aenderungen an Trendpilot, Protein, Incident Push oder Assistant.

## Execution Mode

- S1 bis S3 sind Detektivarbeit und Contract Review, weil Auth, Edge Function und Report-Persistenz betroffen sind.
- S4 ist Umsetzung in Substeps.
- S5 prueft lokal und definiert oder fuehrt freigegebene Runtime-Smokes aus.
- S6 synchronisiert Reports-Doku, QA und Roadmap.
- Nach jedem Hauptschritt Statusmatrix aktualisieren.
- Jeder Hauptschritt endet mit:
  - Schritt-Abnahme
  - Doku-Sync-Entscheidung
  - Commit-Empfehlung

## Vorab Contract Review 02.06.2026

Review-Frage:

- Duerfen die Monthly-Report-Review-Findings in einer engen Roadmap korrigiert werden, ohne den Report-Produktvertrag zu erweitern?

Entscheidung:

- Ja, wenn die Roadmap auf Auth-Vertrag, Runtime-Validation, Zeit-/Inbox-Vertrag, Payload-Zeitstempel und eine kleine Copy-Hygiene begrenzt bleibt.

Vorab-Findings:

- CR-MR-ROAD-F1: Auth-Fallback auf `MONTHLY_REPORT_USER_ID` ist ein echter Contract-Risikopunkt und muss in S4 adressiert werden.
- CR-MR-ROAD-F2: `health_events.day` ist generated aus `ts`; der Fix fuer Inbox-Auffindbarkeit muss diesen SQL-Vertrag respektieren.
- CR-MR-ROAD-F3: Range Reports sind bewusst nicht dedupliziert; eine automatische Range-Dedupe-Aenderung waere ein Produktentscheid und bleibt ausser Scope.
- CR-MR-ROAD-F4: Date-Validation ist analog zum Trendpilot sinnvoll, darf aber keine neue Kalender-/Timezone-Architektur erfinden.
- CR-MR-ROAD-F5: `generated_at` vs. `created_at` ist ein Client-/Payload-Vertrag und gehoert zum Zeitstempel-Fix.
- CR-MR-ROAD-F6: Activity-Copy ist User-facing, aber nur Hygiene; kein Activity-Auswertungsumbau.
- CR-MR-ROAD-F7: GitHub Workflow `curl --fail-with-body` ist als moegliches Follow-up beobachtbar, aber nicht automatisch Teil dieses Fixes.

Korrekturen am Roadmap-Vertrag:

- S4 trennt Auth, Runtime-Validation, Date-Validation, Report-Zeitvertrag und Copy-Hygiene.
- SQL-/RLS-Aenderungen bleiben ausser Scope, solange der bestehende `ts -> day`-Vertrag nutzbar bleibt.
- S5 trennt lokale Checks von Remote-/Workflow-Smokes mit Schreibwirkung.

Nachpruefung:

- Keine offenen Contract-Findings fuer den Roadmap-Start.

## Post-Write Contract Review 02.06.2026

Review-Frage:

- Entspricht diese Roadmap den Review-Aussagen, dem Reports-Modulziel und der bekannten MIDAS-Arbeitsweise?

Geprueft:

- Roadmap-Struktur gegen `docs/MIDAS Roadmap Template.md`.
- Scope gegen die gefundenen Review-Findings:
  - Auth/default user.
  - `report_type`.
  - Date/month validation.
  - `health_events.day`/Inbox-Auffindbarkeit.
  - `generated_at`/`created_at`.
  - Activity-Copy.
- Guardrails gegen Reports-Abgrenzung:
  - keine Diagnose/Therapie.
  - kein Echtzeit-Alert.
  - kein UI-Redesign.
  - kein SQL-/RLS-Umbau ohne neue Freigabe.
- Relevante Referenzpfade gegen vorhandene Code-/Doku-Pfade.

Findings:

- CR-MR-POST-F1: Der Zeit-/Inbox-Fix musste explizit `health_events.day` als generated column beruecksichtigen.
- CR-MR-POST-F2: Der Payload-Zeitstempel-Drift `generated_at` vs. `created_at` musste als eigenes Finding aufgenommen werden.
- CR-MR-POST-F3: Range-Report-Dedupe durfte nicht versehentlich in Scope geraten.

Korrekturen:

- CR-MR-POST-F1 korrigiert:
  - Architektur-Constraints dokumentieren `day` als generated aus `ts`.
  - S4.4/S4.5 behandeln den Report-Zeit-/Inbox-Vertrag ohne pauschale SQL-Aenderung.
- CR-MR-POST-F2 korrigiert:
  - Zieldefinition, Problemzusammenfassung und S4.6 enthalten den Zeitstempel-Vertrag.
- CR-MR-POST-F3 korrigiert:
  - Not in Scope und S2/S3 grenzen automatische Range-Dedupe aus.

Nachpruefung:

- Keine offenen Post-Write-Contract-Findings.

## Statusmatrix

| ID | Schritt | Status | Ergebnis/Notiz |
| --- | --- | --- | --- |
| S1 | System- und Vertragsdetektivarbeit | DONE | Reports-Doku, historische Roadmaps, Edge Function, Client/Inbox, Workflow und SQL-Vertrag gelesen; Systemkarte und S1-Contract Review dokumentiert. |
| S2 | Fachlicher/technischer Contract Review | DONE | Auth-, Date-, Report-Typ-, Zeit-/Inbox-, Payload-Zeitstempel- und Range-Dedupe-Vertraege festgelegt; Contract Review dokumentiert. |
| S3 | Bruchrisiko-, Copy- und Umsetzungsreview | DONE | Bruchrisiken, User-Facing Copy, lokale Checks, Runtime-Smokes und geschaerfte S4-Substeps finalisiert; Contract Review dokumentiert. |
| S4 | Umsetzung in Edge Function und Client-Zeitstempel-Normalisierung | DONE | S4.1 bis S4.8 umgesetzt und reviewed; ein S4.8-Date-Guard-Finding korrigiert. |
| S5 | Tests, Code Review und Contract Review | DONE | Lokale Checks, Vertrags-Scans, Date-Sanity, Supabase/GitHub Read-only-Status, CodeRabbit-JSON-Finding-Korrektur und S5-Contract Review abgeschlossen; Schreib-Smokes erst nach Deploy sinnvoll. |
| S6 | Doku-Sync, QA-Update und Abschlussreview | DONE | Reports Overview und QA synchronisiert; finaler Contract Review abgeschlossen; Roadmap archivbereit. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## S1 - System- und Vertragsdetektivarbeit

Ziel:

- Bestehenden Monthly-/Range-Report-Vertrag verstehen.
- Klaeren, welche Schichten von den Findings betroffen sind.
- Noch keinen Produktcode aendern.

Substeps:

- S1.1 `README.md` und MIDAS-Guardrails lesen.
- S1.2 `docs/DEV_ENVIRONMENT.md` fuer Tool-/Deploy-/Workflow-Grenzen lesen.
- S1.3 `docs/modules/Reports Module Overview.md` lesen.
- S1.4 `docs/modules/Doctor View Module Overview.md` und `docs/modules/Activity Module Overview.md` lesen.
- S1.5 historische Reports-/Backend-Roadmaps lesen:
  - `docs/archive/Doctor Lab Domain Roadmap.md`
  - `docs/archive/Doctor Report Roadmap.md`
  - `docs/archive/Reports-Roadmap.md`
  - `docs/archive/MIDAS Backend Edge Functions Deno Check Roadmap (DONE).md`
- S1.6 Edge Function vollstaendig lesen:
  - `backend/supabase/functions/midas-monthly-report/index.ts`
- S1.7 Konsumentenpfade lesen:
  - `app/supabase/api/reports.js`
  - `app/supabase/api/system-comments.js`
  - `app/modules/doctor-stack/reports/index.js`
  - `app/modules/doctor-stack/doctor/index.js`
- S1.8 Scheduler- und SQL-Vertrag lesen:
  - `.github/workflows/monthly-report.yml`
  - `sql/01_Health Schema.sql`
  - `sql/07_Remove_Day_Flags.sql`
  - `sql/13_Activity_Event.sql`
- S1.9 Systemkarte und Ist-Vertrag dokumentieren.
- S1.10 Contract Review S1.

Exit-Kriterium:

- Auth-, Zeit-, Persistenz-, Inbox- und Report-Typ-Vertraege sind verstanden.

### S1 Ergebnisprotokoll 02.06.2026

Durchgefuehrt:

- S1.1 `README.md` und MIDAS-Guardrails gelesen.
- S1.2 `docs/DEV_ENVIRONMENT.md` gelesen:
  - lokales Arbeiten ist erlaubt.
  - Deploys und produktive Runtime-Aktionen brauchen explizite User-Freigabe.
  - `deno check`, `git diff --check` und gezielte CLI-/Workflow-Pruefungen sind lokale Standardchecks.
- S1.3 `docs/modules/Reports Module Overview.md` gelesen:
  - Reports sind deterministische Rueckblick-/Archivdokumente.
  - Monthly Report laeuft per Scheduler oder manuell.
  - Range Report ist on demand fuer die Arztansicht.
  - Keine Diagnose, keine Therapieempfehlung, keine LLM-Erzeugung.
- S1.4 `docs/modules/Doctor View Module Overview.md` und `docs/modules/Activity Module Overview.md` gelesen:
  - Doctor View bleibt Read-Only-Auswertung.
  - Reports-Inbox ist ein eigenes Fenster im Doctor-Kontext.
  - Activity liefert `activity_event`-Daten fuer Doctor View und Reports.
- S1.5 historische Reports-/Backend-Roadmaps gelesen:
  - Doctor Lab Domain Roadmap.
  - Doctor Report Roadmap.
  - Reports Roadmap.
  - Backend Edge Functions Deno Check Roadmap.
  - Backend Source Integration Roadmap als Zusatzabgleich, weil sie den aktuellen Repo-Backend-Source-Vertrag beschreibt.
- S1.6 `backend/supabase/functions/midas-monthly-report/index.ts` gelesen und gegen die Review-Findings gescannt.
- S1.7 Konsumentenpfade gelesen:
  - `app/supabase/api/reports.js`
  - `app/supabase/api/system-comments.js`
  - `app/modules/doctor-stack/reports/index.js`
  - `app/modules/doctor-stack/doctor/index.js`
- S1.8 Scheduler- und SQL-Vertrag gelesen:
  - `.github/workflows/monthly-report.yml`
  - `sql/01_Health Schema.sql`
  - `sql/07_Remove_Day_Flags.sql`
  - `sql/13_Activity_Event.sql`

Systemkarte Ist-Zustand:

- Source of Truth:
  - Produktive Edge Function liegt im Repo unter `backend/supabase/functions/midas-monthly-report/index.ts`.
  - Lokaler statischer Pflichtcheck ist `deno check backend/supabase/functions/midas-monthly-report/index.ts`.
- Persistenz:
  - Reports werden als `health_events` mit `type = system_comment` gespeichert.
  - Report-Subtypen liegen in `payload.subtype` als `monthly_report` oder `range_report`.
  - `health_events.day` ist generated aus `ts at time zone Europe/Vienna`; `day` kann nicht direkt sinnvoll als eigenstaendiger Report-Zeitraum geschrieben werden.
  - Report-Zeitraum liegt in `payload.period`.
- Report-Erzeugung:
  - Monthly Report ist idempotent pro `payload.subtype = monthly_report` und `payload.month`.
  - Range Report wird bewusst pro Lauf neu eingefuegt und nicht dedupliziert.
  - Edge Function zieht BP, Body, Lab und Activity aus `v_events_*`.
  - Range Report zieht zusaetzlich Profil- und Trendpilot-Kontext (`user_profile`, `trendpilot_events_range`).
- Auth:
  - Client-Wrapper `generateMonthlyReportRemote` ruft die Edge Function via `fetchWithAuth` mit User-JWT auf.
  - GitHub Scheduler ruft die Edge Function mit Service-Role Bearer und `report_type = monthly_report` auf.
  - Edge Function nutzt derzeit `MONTHLY_REPORT_USER_ID` als Default-User-Fallback.
- Inbox:
  - Reports-Modul laedt `monthly_report` und `range_report` getrennt ueber `fetchSystemCommentsBySubtype`.
  - Fetch-Filter laufen ueber `health_events.day`; Sortierung ebenfalls primaer ueber `day`.
  - Report-Karten zeigen den Zeitraum aus `payload.period`, aber den Erstellungszeitpunkt aus `payload.created_at` oder fallback `row.ts`.
- Payload-Zeitstempel:
  - Edge Function schreibt `payload.generated_at`.
  - Client-Normalisierung liest aktuell `payload.created_at`.
  - UI faellt dadurch auf `row.ts` zurueck.
- Scheduler:
  - Workflow `monthly-report.yml` nutzt `curl -sS` mit Service-Role Secret.
  - `--fail-with-body` waere als Workflow-Haertung denkbar, ist aber kein S1-blockierender Report-Code-Fix.

Bestaetigte S1-Findings:

- MR-S1-F1: Auth-Fallback ist bestaetigt:
  - `MONTHLY_REPORT_USER_ID` wird fuer Monthly schon vor User-Token-Pruefung genutzt.
  - Ohne Token kann der Handler auf Default-User fallen.
- MR-S1-F2: `report_type` ist zur Runtime nicht strikt validiert.
- MR-S1-F3: Date-/Month-Validation ist weich:
  - `from`/`to` werden per `.slice(0, 10)` gekuerzt.
  - `monthBoundsUTC(Number(y), Number(m))` kann ungueltige Monate via JS-Date-Rolling normalisieren.
- MR-S1-F4: Inbox-/Zeitvertrag ist bestaetigt:
  - Report-Zeitraum liegt in `payload.period`.
  - Inbox-Filter laufen ueber generated `health_events.day`.
  - Ein alter Range-Report, der heute erzeugt wird, kann aus einer Inbox-Suche fuer den alten Zeitraum fallen.
- MR-S1-F5: Payload-Zeitstempel-Drift ist bestaetigt:
  - Edge: `generated_at`.
  - Client: `created_at` mit Fallback auf `row.ts`.
- MR-S1-F6: Range-Activity-Copy-Risiko ist bestaetigt:
  - Der Textpfad kann doppelte `Durchschnitt`-Formulierung erzeugen.
- MR-S1-F7: Workflow-Haertung ist ein Watchlist-Punkt:
  - `curl -sS` ohne `--fail-with-body` kann Fehlerausgaben weniger robust machen.
  - Bleibt ausser Scope, solange S2/S3 keinen harten Workflow-Contract-Bruch finden.
- MR-S1-F8: Aktive Reports-Doku wird nach Code-Fix voraussichtlich S6-Sync brauchen:
  - Auth-, Zeit-/Inbox- und Payload-Zeitstempel-Vertrag muessen nach finaler Entscheidung nachgezogen werden.

S1 Contract Review:

- Review-Frage:
  - Wurden alle S1-Referenzen deterministisch genug gelesen und ist der Ist-Vertrag eng genug dokumentiert, um S2 ohne offene Grundsatzluecken zu starten?
- Entscheidung:
  - Ja.

Contract-Findings:

- MR-S1-CR-F1: Activity musste explizit in den Ist-Vertrag aufgenommen werden, weil ein Finding die Activity-Copy betrifft.
- MR-S1-CR-F2: Der Inbox-Fix darf nicht als direkter `day`-Write geplant werden, weil `day` generated aus `ts` ist.
- MR-S1-CR-F3: Workflow-Haertung darf nicht versehentlich in den Code-Fix-Scope rutschen.
- MR-S1-CR-F4: Backend Source Integration bestaetigt, dass der aktuelle relative Repo-Pfad Source of Truth ist; alte externe Pfade sind nur historische Referenz.

Korrektur der Findings:

- MR-S1-CR-F1 korrigiert:
  - Activity Overview gelesen und Activity in Systemkarte/Findings dokumentiert.
- MR-S1-CR-F2 korrigiert:
  - Systemkarte dokumentiert `day` als generated column und verschiebt die konkrete Zeit-/Inbox-Entscheidung nach S2.
- MR-S1-CR-F3 korrigiert:
  - Workflow `curl --fail-with-body` als Watchlist, nicht als S4-Pflichtfix klassifiziert.
- MR-S1-CR-F4 korrigiert:
  - Backend Source Integration als Zusatzabgleich dokumentiert; produktiver Source-Pfad bleibt `backend/supabase/functions/...`.

Doku-Sync-Entscheidung:

- Keine aktiven Modul-/QA-Dokus in S1 geaendert.
- Reports Overview und QA werden erst in S6 synchronisiert, wenn S2-S5 den finalen Vertrag bestaetigt haben.

Schritt-Abnahme:

- S1 ist abgeschlossen.
- S2 kann mit Auth-, Date-, Report-Typ-, Zeit-/Inbox- und Payload-Vertragsentscheidung starten.

## S2 - Fachlicher/technischer Contract Review

Ziel:

- Finalen Zielvertrag fuer die Korrekturen festlegen.
- Keine Grundsatzfragen offen lassen, bevor S4 startet.

Substeps:

- S2.1 Auth-Vertrag festlegen:
  - Service-Role/Scheduler vs. User-JWT.
  - Default-User nur fuer erlaubte Service-Role-Pfade.
- S2.2 `report_type`-Vertrag festlegen:
  - nur `monthly_report` und `range_report`.
  - unbekannte Werte werden abgelehnt.
- S2.3 Date-/Month-Vertrag festlegen:
  - echte ISO-Days.
  - echter `YYYY-MM`-Monat.
  - keine stille Kuerzung oder JS-Rolling.
- S2.4 Report-Zeit-/Inbox-Vertrag festlegen:
  - Was ist Erstellungszeit?
  - Was ist Report-Zeitraum?
  - Wie bleibt ein Report nach Erstellung im erwarteten Inbox-Kontext sichtbar?
- S2.5 Payload-Zeitstempel-Vertrag festlegen:
  - `generated_at`, `created_at` oder bewusst beide.
- S2.6 Range-Report-Dedupe bewusst abgrenzen.
- S2.7 Contract Review S2.

Exit-Kriterium:

- S4 kann starten, ohne Auth-, Date- oder Persistenzgrundsatz offen zu lassen.

### S2 Ergebnisprotokoll 02.06.2026

Durchgefuehrt:

- S2.1 Auth-Vertrag festgelegt.
- S2.2 `report_type`-Vertrag festgelegt.
- S2.3 Date-/Month-Vertrag festgelegt.
- S2.4 Report-Zeit-/Inbox-Vertrag festgelegt.
- S2.5 Payload-Zeitstempel-Vertrag festgelegt.
- S2.6 Range-Report-Dedupe abgegrenzt.
- S2.7 Contract Review S2 durchgefuehrt.

Auth-Vertrag:

- User-nahe manuelle Calls:
  - muessen ueber User-JWT laufen.
  - `fetchWithAuth` im Client bleibt der erlaubte Pfad.
  - `userId` kommt aus `supabase.auth.getUser(token)`.
  - `MONTHLY_REPORT_USER_ID` darf in diesem Pfad nicht als Fallback genutzt werden.
- Scheduler-/Service-Role-Calls:
  - muessen explizit als Service-Role erkannt werden.
  - duerfen `MONTHLY_REPORT_USER_ID` nur fuer `monthly_report` nutzen.
  - duerfen keinen `range_report` fuer den Default-User erzeugen.
  - muessen scheitern, wenn `MONTHLY_REPORT_USER_ID` fehlt.
- Unauthentifizierte Calls:
  - duerfen keinen Default-User-Fallback ausloesen.
  - muessen mit klarer Auth-Fehlermeldung scheitern.
- Rueckwaertskompatibilitaet:
  - `report_type` darf fehlen oder `null` sein und wird dann als `monthly_report` behandelt.
  - Das ist fuer manuelle Monthly-Calls und aeltere Scheduler-Payloads akzeptiert.

`report_type`-Vertrag:

- Erlaubt:
  - `monthly_report`
  - `range_report`
  - `null`/fehlend als Alias fuer `monthly_report`.
- Nicht erlaubt:
  - jeder andere String.
  - nicht-string Werte ausser `null`/fehlend.
- Fehlerverhalten:
  - ungueltige Runtime-Werte werden vor Datenbankzugriff abgelehnt.
  - die Antwort soll fuer S5-Smokes als 400/Fehler erkennbar sein.

Date-/Month-Vertrag:

- ISO-Day:
  - `from` und `to` muessen echte `YYYY-MM-DD` Kalenderdaten sein.
  - keine `.slice(0, 10)`-Kuerzung als Validierung.
  - keine Akzeptanz von `2026-02-31`, `2026-13-01`, Zeitstempelstrings oder Teilstrings.
- Range Report:
  - benoetigt `from` und `to`.
  - `from <= to` ist Pflicht.
  - `month` wird fuer Range Reports nicht als Ersatz fuer `from/to` genutzt.
- Monthly Report:
  - nutzt `month`, wenn gesetzt.
  - `month` muss ein echtes `YYYY-MM` mit Monat `01` bis `12` sein.
  - wenn `month` fehlt oder `null` ist, bleibt der bisherige Default auf den aktuellen Monat erlaubt.
  - `from/to` sind fuer Monthly nicht der Vertragsinput.
- Monatsgrenzen:
  - duerfen weiter ueber UTC-Date-Objekte berechnet werden, aber erst nach strikter Jahr-/Monat-Validierung.
  - kein stilles JS-Date-Rolling.

Report-Zeit-/Inbox-Vertrag:

- Fachlicher Zeitraum:
  - bleibt `payload.period = { from, to }`.
  - wird in der UI als Zeitraum angezeigt.
- Erzeugungszeit:
  - bleibt ein Payload-Zeitstempel.
  - darf nicht mit dem Report-Zeitraum verwechselt werden.
- Datenbank-Anker:
  - `health_events.day` ist generated aus `ts`.
  - fuer Reports soll `ts` kuenftig als Report-Anker im Zeitraum dienen, nicht als alleinige Erzeugungszeit.
  - Report-Anker ist `period.to` an einem sicheren UTC-Mittag, damit `day` in Europe/Vienna deterministisch `period.to` ergibt.
- Inbox:
  - bestehende `day`-Filter koennen dadurch ohne SQL-/PostgREST-Umbau weiter funktionieren.
  - ein Range Report fuer `from/to` bleibt sichtbar, wenn die Inbox denselben oder einen einschliessenden Zeitraum filtert.
  - Monthly Reports werden im Monat ihres `period.to` einsortiert und bleiben im Monatskontext auffindbar.
- Bestehende alte Reports:
  - werden nicht in S2 migriert.
  - S4 kann bestehende Monthly-Updates auf den neuen `ts`-Anker bringen, wenn ein Monatsbericht erneut erzeugt wird.

Payload-Zeitstempel-Vertrag:

- Edge Function soll kuenftig beide Felder schreiben:
  - `generated_at`
  - `created_at`
- Beide Felder bekommen beim aktuellen Reportlauf denselben ISO-Zeitstempel.
- `generated_at` bleibt semantisch der Generator-Zeitpunkt.
- `created_at` bleibt Client-/UI-kompatibler Erstellungszeitpunkt.
- Client-Normalisierung soll robust lesen:
  - zuerst `created_at`.
  - dann `generated_at`.
  - dann Fallback auf `row.ts`, falls Altbestand keinen Payload-Zeitstempel hat.

Range-Report-Dedupe-Vertrag:

- Monthly Reports bleiben idempotent:
  - Suche nach `user_id`, `type = system_comment`, `payload.subtype = monthly_report`, `payload.month`.
  - bestehende Zeile wird aktualisiert.
- Range Reports bleiben Insert-per-run:
  - keine automatische Dedupe nach `period`.
  - Regenerate/Neu erzeugen darf bewusst mehrere Arzt-Berichte fuer denselben Zeitraum erzeugen.
- Kein SQL-Unique-Index, keine RLS-Aenderung, keine neue Tabelle.

S2 Contract Review:

- Review-Frage:
  - Sind die S2-Vertraege eng genug, um alle Review-Findings zu adressieren, ohne Reports fachlich umzubauen oder Scheduler/Doctor-UI zu brechen?
- Entscheidung:
  - Ja, mit dokumentierten Korrekturen.

Contract-Findings:

- MR-S2-CR-F1: Service-Role-Erkennung muss vor User-JWT-Aufloesung stattfinden, weil ein Service-Role-Token kein normaler User-JWT ist.
- MR-S2-CR-F2: `report_type = null` als Monthly-Default muss erlaubt bleiben, sonst koennten aeltere manuelle Monthly-Calls unnoetig brechen.
- MR-S2-CR-F3: `health_events.ts` als Report-Anker darf die Erzeugungszeit nicht ersetzen; Payload-Zeitstempel muessen deshalb Pflichtteil des Fixes sein.
- MR-S2-CR-F4: `period.to` als `day`-Anker macht Range Reports bei exakt gleichem oder einschliessendem Inbox-Zeitraum sichtbar, aber nicht bei beliebigen Teilueberlappungen.
- MR-S2-CR-F5: Workflow-Haertung bleibt nicht Teil des S4-Code-Fixes, solange der Scheduler mit Service-Role und `monthly_report` den neuen Auth-Vertrag erfuellt.

Korrektur der Findings:

- MR-S2-CR-F1 korrigiert:
  - Auth-Vertrag verlangt explizite Service-Role-Erkennung und trennt Scheduler- von User-JWT-Pfad.
- MR-S2-CR-F2 korrigiert:
  - `null`/fehlend bleibt als Alias fuer `monthly_report` dokumentiert.
- MR-S2-CR-F3 korrigiert:
  - Report-Zeit-/Inbox-Vertrag und Payload-Zeitstempel-Vertrag sind gekoppelt dokumentiert.
- MR-S2-CR-F4 korrigiert:
  - Inbox-Vertrag benennt die Grenze: sichtbar bei gleichem/einschliessendem Zeitraum, keine Teilueberlappungs-Suche in S4.
- MR-S2-CR-F5 korrigiert:
  - Workflow-Haertung bleibt Watchlist und wird erst bei S5/S6 oder separater Freigabe relevant.

Doku-Sync-Entscheidung:

- Keine aktiven Modul-/QA-Dokus in S2 geaendert.
- Reports Overview und QA werden in S6 auf den final umgesetzten Vertrag synchronisiert.

Schritt-Abnahme:

- S2 ist abgeschlossen.
- S3 kann mit konkreter Bruchrisiko- und Umsetzungsplanung starten.

## S3 - Bruchrisiko-, Copy- und Umsetzungsreview

Ziel:

- Risiken vor Codeaenderung abfangen.
- Konkrete S4-Substeps finalisieren.

Substeps:

- S3.1 Bruchrisiken pruefen:
  - Scheduler bricht durch strengere Auth.
  - Manuelle Doctor-Reports verlieren User-JWT-Funktion.
  - Monthly-Idempotenz wird versehentlich gebrochen.
  - Range Reports werden versehentlich dedupliziert.
  - Inbox zeigt alte Reports nicht mehr oder falsch.
  - Report-Erstellungszeit und Report-Zeitraum werden vermischt.
  - Date-Validation erzeugt falsche 400er fuer legitime Inputs.
- S3.2 User-Facing Copy Review:
  - Activity-Text.
  - Fehlermeldungen fuer ungueltige Ranges.
  - Keine Alarm- oder Diagnose-Sprache.
- S3.3 Lokale Checks und Remote-Smokes definieren.
- S3.4 S4-Substeps final bestaetigen.
- S3.5 Contract Review S3.

Exit-Kriterium:

- S4 hat klare Substeps und Review-Kriterien.

### S3 Ergebnisprotokoll 02.06.2026

Durchgefuehrt:

- S3.1 Bruchrisiken geprueft.
- S3.2 User-Facing Copy reviewed.
- S3.3 lokale Checks und Remote-Smokes definiert.
- S3.4 S4-Substeps final bestaetigt und geschaerft.
- S3.5 Contract Review S3 durchgefuehrt.

Bruchrisiko-Review:

- Scheduler/Auth:
  - Risiko: strenge Auth blockiert GitHub Scheduler.
  - Entscheidung: `report_type` zuerst validieren/normalisieren, dann Service-Role erkennen.
  - Scheduler bleibt erlaubt, wenn Bearer Token der Service-Role entspricht, `report_type = monthly_report` ist und `MONTHLY_REPORT_USER_ID` gesetzt ist.
- Manueller Doctor-Report:
  - Risiko: User-JWT-Pfad wird versehentlich blockiert.
  - Entscheidung: Nicht-Service-Role-Bearer laeuft ueber `requireUser(token)` und nutzt dessen `user.id`.
  - `MONTHLY_REPORT_USER_ID` ist fuer manuelle Calls kein Fallback.
- Monthly-Idempotenz:
  - Risiko: neuer `ts`-Anker oder Payload-Zeitstempel bricht das Update-Verhalten.
  - Entscheidung: Existing-Suche bleibt ueber `payload.subtype = monthly_report` und `payload.month`.
  - Bei bestehendem Monthly Report wird `payload` aktualisiert und `ts` auf den Report-Anker gesetzt.
- Range-Insert:
  - Risiko: Persistenzlogik fuehrt versehentlich Range-Dedupe ein.
  - Entscheidung: Range bleibt direkter Insert, keine Existing-Suche.
- Inbox:
  - Risiko: `health_events.day` bleibt Erstellungsdatum und alte Zeitraeume sind nicht sichtbar.
  - Entscheidung: Insert und Monthly-Update setzen `ts` auf einen Report-Anker aus `period.to`.
  - Der Anker ist UTC-Mittag auf `period.to`, damit `day` in Europe/Vienna deterministisch `period.to` bleibt.
- Erzeugungszeit vs. Zeitraum:
  - Risiko: `ts` wird faelschlich als Erzeugungszeit interpretiert.
  - Entscheidung: Erzeugungszeit steht im Payload (`created_at`/`generated_at`), `ts/day` ist fuer Reports der Inbox-Anker.
- Date-Validation:
  - Risiko: zu strenge Validierung blockiert legitime Monthly-Defaults.
  - Entscheidung:
    - Monthly validiert nur `month`, wenn gesetzt.
    - Monthly ignoriert `from/to`.
    - Range validiert `from/to` strikt und ignoriert `month`.

User-Facing Copy Review:

- Activity-Text:
  - Nur doppelte `Durchschnitt`-Formulierung entfernen.
  - Keine neue Activity-Auswertung oder Coaching-Sprache.
- Fehlertexte:
  - Kurz, technisch genug fuer Debug, aber nicht alarmistisch.
  - Ungueltige Inputs klar benennen:
    - `report_type`
    - `month`
    - `from`
    - `to`
    - `from <= to`
  - Keine Diagnose-/Therapie- oder Risiko-Sprache.
- Reporttexte:
  - Keine medizinische Neubewertung.
  - Trendpilot-Range-Text bleibt ruhig und handlungsrelevant wie bisher.

Lokale Checks:

- Pflicht:
  - `deno check backend/supabase/functions/midas-monthly-report/index.ts`
  - `git diff --check`
- Gezielte Scans:
  - kein unauthentifizierter `MONTHLY_REPORT_USER_ID`-Fallback.
  - Service-Role-Check vorhanden.
  - `report_type` runtime-validiert.
  - keine `.slice(0, 10)`-Validierung fuer `from/to`.
  - keine stillen Date-Rolling-Pfade.
  - Monthly Existing-Suche bleibt ueber `payload.subtype` und `payload.month`.
  - Range bleibt Insert.
  - Insert und Monthly-Update setzen den Report-Anker `ts`.
  - Payload enthaelt `generated_at` und `created_at`.
  - Client liest `created_at` mit `generated_at`-Fallback.
  - Activity-Copy ohne doppelte `Durchschnitt`-Form.

Remote-Smokes:

- Nur nach expliziter User-Freigabe.
- Monthly Service-Role/Scheduler:
  - erzeugt oder aktualisiert Monatsbericht.
  - kein Duplikat fuer denselben Monat.
  - `day` liegt im Monatskontext.
- Range User-JWT:
  - gueltiger Zeitraum erzeugt Arzt-Bericht.
  - Bericht ist nach Inbox-Refresh bei gleichem/einschliessendem Zeitraum sichtbar.
- Invalid Inputs:
  - ungueltiger `report_type` wird abgelehnt.
  - `2026-02-31` wird abgelehnt.
  - `from > to` wird abgelehnt.
- GitHub Workflow-Smoke:
  - nur nach Freigabe.
  - Workflow-Haertung bleibt optional, sofern kein neuer harter Befund entsteht.

S4-Substeps final:

- S4.1 Request-Classification und `report_type`:
  - `null`/fehlend => `monthly_report`.
  - nur `monthly_report`/`range_report`.
  - alle anderen Runtime-Werte ablehnen.
- S4.2 Auth-/Default-User:
  - Service-Role wird als boolescher Tokenvergleich gegen `SERVICE_ROLE_KEY` erkannt.
  - Tokens werden nicht geloggt.
  - Service-Role darf nur `monthly_report` mit `MONTHLY_REPORT_USER_ID`.
  - User-JWT bleibt manueller Pfad.
  - Kein unauthentifizierter Default-User-Fallback.
- S4.3 Date-/Month:
  - Monthly: validiert optionales `month`, ignoriert `from/to`.
  - Range: validiert `from/to`, ignoriert `month`.
  - echte Kalenderdaten, kein Rolling.
- S4.4 Report-Anker berechnen:
  - Report-Anker `ts` aus `period.to` bei UTC-Mittag berechnen.
- S4.5 Report-Anker persistieren:
  - `ts` bei Insert und Monthly-Update setzen.
  - `day` bleibt generated.
- S4.6 Payload-Zeitstempel:
  - Edge schreibt `generated_at` und `created_at`.
  - Client liest `created_at || generated_at || row.ts`.
- S4.7 Activity-Copy:
  - nur doppelte Formulierung entfernen.
- S4.8 Gesamt-Review:
  - alle S2/S3-Vertraege gegen Code und Doku pruefen.

S3 Contract Review:

- Review-Frage:
  - Sind Risiken, Copy-Grenzen, Checks und S4-Substeps ausreichend konkret, damit S4 ohne neue Grundsatzentscheidung starten kann?
- Entscheidung:
  - Ja, nach den folgenden Korrekturen.

Contract-Findings:

- MR-S3-CR-F1: `report_type` muss vor Auth normalisiert werden; sonst kann der Scheduler-Pfad nicht sauber entschieden werden.
- MR-S3-CR-F2: Service-Role-Erkennung darf keine Secret-/Token-Werte loggen oder in Doku schreiben.
- MR-S3-CR-F3: `ts`-Anker muss bei Monthly-Update und Insert gesetzt werden, nicht nur beim Insert.
- MR-S3-CR-F4: Date-Validation darf keine irrelevanten Felder pruefen; Monthly und Range brauchen getrennte Input-Vertraege.
- MR-S3-CR-F5: Client-Fallback auf `generated_at` ist Teil des Payload-Zeitstempel-Fixes und darf nicht bis S6 warten.

Korrektur der Findings:

- MR-S3-CR-F1 korrigiert:
  - S4.1/S4.2-Reihenfolge und S4-Substep-Details entsprechend dokumentiert.
- MR-S3-CR-F2 korrigiert:
  - S4.2 verlangt booleschen Service-Role-Check ohne Token-Logging.
- MR-S3-CR-F3 korrigiert:
  - S4.5 verlangt `ts`-Anker bei Insert und Monthly-Update.
- MR-S3-CR-F4 korrigiert:
  - S4.3 trennt Monthly- und Range-Validation.
- MR-S3-CR-F5 korrigiert:
  - S4.6 umfasst Edge- und Client-Anpassung.

Doku-Sync-Entscheidung:

- Keine aktiven Modul-/QA-Dokus in S3 geaendert.
- Reports Overview und QA werden in S6 synchronisiert, nachdem S4/S5 den finalen Code bestaetigt haben.

Schritt-Abnahme:

- S3 ist abgeschlossen.
- S4 kann in Substeps starten.

### S4 Readiness Review 02.06.2026

Review-Frage:

- Passen die S4-Substeps nach erneutem Lesen von S1-S3 noch zur tatsaechlichen Abhaengigkeit zwischen Auth, `report_type`, Date-Validation, Persistenz, Payload-Zeitstempel und Client?

Entscheidung:

- Nicht vollstaendig. S4 war fachlich richtig, aber Reihenfolge und Code-Scope mussten praezisiert werden.

Findings:

- MR-S4-READY-F1: S4.1 verlangte bereits einen validierten/normalisierten `report_type`, waehrend S4.2 diese Validierung erst liefern sollte.
- MR-S4-READY-F2: Der Payload-Zeitstempel-Fix betrifft nicht nur die Edge Function, sondern auch `app/supabase/api/system-comments.js`, weil Altbestand `generated_at` enthalten kann und der Client bisher nur `created_at` liest.
- MR-S4-READY-F3: Der Report-Anker `ts` ist ein eigener Persistenz-Fix und sollte nicht mit dem Payload-Zeitstempel-Fix vermischt werden.
- MR-S4-READY-F4: S5 muss wegen der Client-Aenderung einen JS-Syntaxcheck fuer `app/supabase/api/system-comments.js` enthalten.

Korrektur:

- S4.1 wird zu Request-Classification und `report_type`-Runtime-Validation.
- S4.2 wird zu Auth-/Default-User-Vertrag.
- S4.4 berechnet nur den Report-Anker.
- S4.5 setzt den Report-Anker in Insert und Monthly-Update.
- S4.6 synchronisiert Payload-Zeitstempel inklusive Client-Fallback.
- S4.7 bleibt Activity-Copy.
- S4.8 wird Gesamt-Code- und Contract Review.
- Scope, Tool Permissions und S5-Checks enthalten `app/supabase/api/system-comments.js`.

## S4 - Umsetzung in Substeps

Ziel:

- Findings eng und sequenziell korrigieren.

Substeps:

- S4.1 Request-Classification und `report_type` runtime-validieren:
  - Payload als unbekannten Runtime-Input behandeln.
  - `null`/fehlend als `monthly_report` behandeln.
  - nur `monthly_report` und `range_report`.
  - klare Fehlerantwort fuer ungueltige Werte.
  - Ergebnis als normalisierten `reportType` fuer S4.2/S4.3 nutzen.
- S4.2 Auth-/Default-User-Vertrag korrigieren:
  - Service-Role explizit erkennen.
  - Service-Role-Erkennung ohne Token-/Secret-Logging.
  - `MONTHLY_REPORT_USER_ID` nur im erlaubten Scheduler/Service-Role-Pfad nutzen.
  - Service-Role darf nur `monthly_report` fuer den Default-User.
  - User-JWT-Pfad bleibt fuer manuelle Reports.
  - Kein unauthentifizierter Default-User-Fallback.
- S4.3 Date-/Month-Validation korrigieren:
  - Monthly validiert optionales `month` und ignoriert `from/to`.
  - Range validiert `from/to` und ignoriert `month`.
  - strikte ISO-Day-Validation fuer `from/to`.
  - strikte `YYYY-MM`-Validation fuer `month`.
  - keine `.slice(0, 10)`-Kuerzung als Validierung.
  - keine JS-Date-Rolling-Akzeptanz.
- S4.4 Report-Anker berechnen:
  - Report-Anker `ts` aus `period.to` bei UTC-Mittag berechnen.
  - `health_events.day` generated aus `ts` respektieren.
  - keine SQL-/RLS-/Schema-Aenderung.
- S4.5 Report-Anker persistieren:
  - Persistenz so anpassen, dass Reports im erwarteten Inbox-Kontext sichtbar bleiben.
  - Report-Anker `ts` bei Insert und Monthly-Update setzen.
  - Monthly-Idempotenz ueber `payload.subtype` und `payload.month` behalten.
  - Range Reports bleiben Insert-per-run.
  - Erstellungszeit weiterhin nachvollziehbar halten.
- S4.6 Payload-Zeitstempel synchronisieren:
  - Edge Function und Client-Vertrag fuer `generated_at`/`created_at` klaeren und umsetzen.
  - Edge schreibt `generated_at` und `created_at`.
  - Client liest `created_at || generated_at || row.ts`.
- S4.7 Activity-Copy korrigieren:
  - keine doppelte `Durchschnitt`-Formulierung.
- S4.8 Gesamt-Code- und Contract Review:
  - Auth.
  - Scheduler.
  - Monthly-Idempotenz.
  - Range-Insert.
  - Date-Validation.
  - Report-Anker.
  - Payload-Zeitstempel.
  - Inbox-Sichtbarkeit.
  - Copy.

Jeder S4-Substep dokumentiert:

- Umsetzung.
- Betroffene Dateien.
- Lokaler Check.
- Code Review.
- Contract Review.
- Findings.
- Korrekturen.

Exit-Kriterium:

- Alle priorisierten Findings sind umgesetzt oder bewusst abgegrenzt.

### S4 Ergebnisprotokoll 02.06.2026

#### S4.1 Request-Classification und `report_type` Runtime-Validation

Umsetzung:

- Betroffene Datei:
  - `backend/supabase/functions/midas-monthly-report/index.ts`
- `RangeInput.report_type` von Compile-Time-Literal auf `unknown` umgestellt, damit Runtime-Input nicht faelschlich als bereits validiert gilt.
- `ReportType = "monthly_report" | "range_report"` eingefuehrt.
- `normalizeReportType(raw)` eingefuehrt:
  - `undefined`/`null` => `monthly_report`.
  - `monthly_report` und `range_report` werden akzeptiert.
  - alle anderen Runtime-Werte werden vor Datenbankzugriff mit klarer Fehlermeldung abgelehnt.
- `reportType` wird direkt nach JSON-Parse normalisiert und danach im Handler wiederverwendet.
- Auth-Entscheidung wurde fachlich noch nicht korrigiert; das bleibt bewusst S4.2.

Code Review:

- `report_type` wird nicht mehr als TypeScript-Vertrag vertraut.
- Ungueltige `report_type`-Werte laufen nicht mehr still in den Range-/Monthly-Pfad.
- `null`/fehlend bleibt als Monthly-Default erhalten.
- `reportType` steht fuer S4.2/S4.3 als normalisierter Wert bereit.
- Keine Service-Role-/Default-User-Logik wurde in S4.1 fachlich umgebaut.

Contract Review:

- S4.1 erfuellt den Readiness-Vertrag:
  - Payload als Runtime-Input behandeln.
  - `null`/fehlend => `monthly_report`.
  - nur `monthly_report` und `range_report`.
  - klare Fehlerantwort fuer ungueltige Werte.
  - normalisierter `reportType` fuer spaetere Substeps.
- S4.2 bleibt offen:
  - unauthentifizierter Default-User-Fallback ist noch nicht korrigiert.
  - Service-Role-Erkennung ist noch nicht umgesetzt.

Checks:

- `deno check backend/supabase/functions/midas-monthly-report/index.ts`: gruen.
- `git diff --check -- backend/supabase/functions/midas-monthly-report/index.ts`: keine Whitespace-Fehler.
  - Git meldet nur den bestehenden CRLF/LF-Hinweis fuer diese Datei.
- Gezielter Scan bestaetigt:
  - `report_type?: unknown`.
  - `type ReportType`.
  - `normalizeReportType(...)`.
  - normalisierter `const reportType = normalizeReportType(payload.report_type)`.

Findings:

- MR-S4.1-F1: Der erste Patch normalisierte zwar `report_type`, behandelte den JSON-Payload selbst aber noch nicht robust als unbekannten Runtime-Wert. `null` oder Arrays haetten einen unsauberen Property-Zugriff erzeugt.

Korrektur:

- MR-S4.1-F1 korrigiert:
  - `isRecord(rawPayload)` eingefuehrt.
  - Nicht-Objekt-Payloads werden fuer diesen engen S4.1-Pfad als leerer Payload behandelt.
  - Dadurch bleibt der bestehende Monthly-Default fuer fehlende Payloads erhalten, waehrend S4.2 separat den Auth-Fallback korrigiert.

Restrisiko / bewusst offen:

- Auth-Fallback auf `MONTHLY_REPORT_USER_ID` ist weiterhin vorhanden und wird in S4.2 korrigiert.
- Date-/Month-Validation ist weiterhin weich und wird in S4.3 korrigiert.

#### S4.2 Auth-/Default-User-Vertrag

Umsetzung:

- Betroffene Datei:
  - `backend/supabase/functions/midas-monthly-report/index.ts`
- `isServiceRoleToken(token)` eingefuehrt:
  - erkennt Service-Role ausschliesslich durch booleschen Vergleich mit `SERVICE_ROLE_KEY`.
  - loggt keine Token- oder Secret-Werte.
- `resolveUserId(token, reportType)` eingefuehrt:
  - Service-Role-Pfad:
    - nur fuer `monthly_report` erlaubt.
    - nutzt `MONTHLY_REPORT_USER_ID`.
    - scheitert, wenn `MONTHLY_REPORT_USER_ID` fehlt.
  - User-JWT-Pfad:
    - laeuft ueber `requireUser(token)`.
    - nutzt `data.user.id`.
  - unauthentifizierte Requests:
    - kein Default-User-Fallback mehr.
    - scheitern ueber `requireUser(null)` mit Auth-Fehler.
- Handler nutzt nach S4.1 den normalisierten `reportType` fuer die Auth-Entscheidung.

Code Review:

- Alte Default-User-Pfade im Handler wurden entfernt:
  - kein `reportType === "monthly_report" && DEFAULT_USER_ID`-Kurzschluss mehr.
  - kein `else if (DEFAULT_USER_ID)`-Fallback mehr.
  - keine direkte `userId = DEFAULT_USER_ID`-Zuweisung im Handler mehr.
- Service-Role kann keinen `range_report` fuer den Default-User erzeugen.
- Manuelle Calls mit User-JWT bleiben moeglich.
- `MONTHLY_REPORT_USER_ID` wird nur noch in `resolveUserId(...)` im Service-Role-Monthly-Pfad genutzt.

Contract Review:

- S4.2 erfuellt den Auth-Vertrag aus S2/S3:
  - Service-Role explizit erkannt.
  - Default-User nur im erlaubten Scheduler-/Service-Role-Monthly-Pfad.
  - User-JWT bleibt manueller Pfad.
  - Kein unauthentifizierter Default-User-Fallback.
  - Keine Token-/Secret-Werte werden geloggt.
- S4.1-Vertrag bleibt intakt:
  - `reportType` wird weiterhin vor Auth normalisiert.

Checks:

- `deno check backend/supabase/functions/midas-monthly-report/index.ts`: gruen.
- `git diff --check -- backend/supabase/functions/midas-monthly-report/index.ts`: keine Whitespace-Fehler.
  - Git meldet nur den bestehenden CRLF/LF-Hinweis fuer diese Datei.
- Gezielter Scan bestaetigt:
  - `isServiceRoleToken(...)` vorhanden.
  - `resolveUserId(...)` vorhanden.
  - `MONTHLY_REPORT_USER_ID` nur im Service-Role-Monthly-Pfad verwendet.
  - keine alten Handler-Fallbacks `else if (DEFAULT_USER_ID)` oder `userId = DEFAULT_USER_ID`.

Findings:

- Keine offenen S4.2-Code- oder Contract-Findings.

Korrektur:

- Nicht erforderlich.

Restrisiko / bewusst offen:

- Date-/Month-Validation ist weiterhin weich und wird in S4.3 korrigiert.
- Report-Anker/Inbox-Vertrag ist weiterhin offen und wird in S4.4/S4.5 korrigiert.

#### S4.3 Date-/Month-Validation

Umsetzung:

- Betroffene Datei:
  - `backend/supabase/functions/midas-monthly-report/index.ts`
- Strikte Parser eingefuehrt:
  - `parseIsoDay(value, fieldName)` fuer `YYYY-MM-DD`.
  - `parseIsoMonth(value)` fuer `YYYY-MM`.
- `from` und `to` werden nicht mehr per `.slice(0, 10)` gekuerzt.
- `month` wird nicht mehr ueber `monthBoundsUTC(Number(y), Number(m))` weich gerollt.
- Monthly- und Range-Normalisierung getrennt:
  - `normalizeMonthlyRange(...)` nutzt optionales `month` oder den bisherigen Default-Vormonat.
  - `normalizeExplicitRange(...)` verlangt valide `from`/`to`.
- Monthly ignoriert `from/to`.
- Range ignoriert `month`.
- `previousMonthBounds(...)` nutzt ebenfalls die strikte Month-Validation fuer den internen `monthTag`.

Code Review:

- Ungueltige Tage wie `2026-02-31` werden abgelehnt, weil der UTC-Date-Roundtrip wieder exakt denselben ISO-Tag ergeben muss.
- Ungueltige Monate wie `2026-13`, `2026-00`, `2026-1` oder `2026-01-01` werden abgelehnt.
- Range-Reports koennen nicht mehr versehentlich auf den Default-Vormonat fallen, wenn `from/to` fehlen.
- Monthly-Reports bleiben abwaertskompatibel:
  - fehlendes oder `null`-`month` erzeugt weiter den Default-Vormonat.
  - gueltiges `month` erzeugt Monatsgrenzen wie bisher.
- `.slice(0, 10)` existiert nur noch in `toISODate(...)` als Format-Helfer, nicht mehr als Input-Validation.

Contract Review:

- S4.3 erfuellt den Date-/Month-Vertrag aus S2/S3:
  - Monthly validiert optionales `month` und ignoriert `from/to`.
  - Range validiert `from/to` und ignoriert `month`.
  - `from/to` sind strikte ISO-Days.
  - `month` ist ein strikter ISO-Month.
  - Kein stilles JS-Date-Rolling fuer externe Inputs.
- S4.1/S4.2 bleiben intakt:
  - `reportType` wird weiterhin vor Auth normalisiert.
  - Auth-/Default-User-Vertrag bleibt unveraendert.

Checks:

- `deno check backend/supabase/functions/midas-monthly-report/index.ts`: gruen.
- `git diff --check -- backend/supabase/functions/midas-monthly-report/index.ts`: keine Whitespace-Fehler.
  - Git meldet nur den bestehenden CRLF/LF-Hinweis fuer diese Datei.
- Gezielter Scan bestaetigt:
  - `parseIsoDay(...)` vorhanden.
  - `parseIsoMonth(...)` vorhanden.
  - `normalizeMonthlyRange(...)` vorhanden.
  - `normalizeExplicitRange(...)` vorhanden.
  - keine alte `normalizeRange(...)`-Weichlogik mehr.
  - keine alte `input.month && input.month.length`-Weichlogik mehr.
  - keine direkte `monthBoundsUTC(Number(...), Number(...))`-Month-Konvertierung mehr.

Findings:

- MR-S4.3-F1: Der erste S4.3-Patch gab in `parseIsoMonth(...)` noch ein ungenutztes `tag` zurueck.

Korrektur:

- MR-S4.3-F1 korrigiert:
  - `parseIsoMonth(...)` gibt nur noch `{ year, month }` zurueck.

Restrisiko / bewusst offen:

- Report-Anker/Inbox-Vertrag ist weiterhin offen und wird in S4.4/S4.5 korrigiert.
- Payload-Zeitstempel-Client-Vertrag bleibt offen und wird in S4.6 korrigiert.

#### S4.4 Report-Anker berechnen

Umsetzung:

- Betroffene Datei:
  - `backend/supabase/functions/midas-monthly-report/index.ts`
- `buildReportAnchorTs(range)` eingefuehrt:
  - berechnet den Report-Anker aus `range.to`.
  - nutzt UTC-Mittag: `${range.to}T12:00:00Z`.
  - gibt einen ISO-Zeitpunkt zurueck, z. B. `2026-05-31T12:00:00.000Z`.
- Handler berechnet `reportAnchorTs` direkt nach der Date-/Month-Normalisierung.
- Response enthaelt `report_anchor_ts`, damit der berechnete Wert fuer lokale/remote Smokes sichtbar ist.
- Keine Persistenz-Aenderung in S4.4:
  - `health_events.insert(...)` schreibt noch kein `ts`.
  - `health_events.update(...)` setzt noch kein `ts`.
  - S4.5 bleibt der dedizierte Persistenzschritt.

Code Review:

- Der Anker basiert auf `range.to`, nicht auf dem Erzeugungszeitpunkt.
- `range.to` kommt aus den S4.3-validierten Monats-/Range-Pfaden.
- UTC-Mittag bleibt in `Europe/Vienna` am selben Kalendertag und respektiert damit den SQL-Vertrag:
  - `health_events.day` wird aus `ts at time zone 'Europe/Vienna'` generated.
- Monthly- und Range-Reports nutzen denselben Anker-Vertrag.
- Die Response-Erweiterung ist abwaertskompatibel:
  - bestehende Consumer lesen weiterhin `report` und `range`.

Contract Review:

- S4.4 erfuellt den Report-Anker-Vertrag aus S2/S3:
  - Report-Anker wird aus `period.to` berechnet.
  - UTC-Mittag wird verwendet.
  - `health_events.day` als generated column aus `ts` bleibt respektiert.
  - Keine SQL-/RLS-/Schema-Aenderung.
- S4.3 bleibt intakt:
  - externe Date-/Month-Inputs sind weiterhin strikt validiert.
- S4.5 bleibt bewusst offen:
  - der berechnete Anker wird noch nicht in `health_events.ts` persistiert.

Checks:

- `deno check backend/supabase/functions/midas-monthly-report/index.ts`: gruen.
- `git diff --check -- backend/supabase/functions/midas-monthly-report/index.ts`: keine Whitespace-Fehler.
  - Git meldet nur den bestehenden CRLF/LF-Hinweis fuer diese Datei.
- Gezielter Scan bestaetigt:
  - `buildReportAnchorTs(...)` vorhanden.
  - `reportAnchorTs` wird im Handler berechnet.
  - `report_anchor_ts` wird in der Response ausgegeben.
  - `insert(...)` und `update(...)` persistieren noch kein `ts`.

Findings:

- Keine offenen S4.4-Code- oder Contract-Findings.

Korrektur:

- Nicht erforderlich.

Restrisiko / bewusst offen:

- Report-Anker-Persistenz ist weiterhin offen und wird in S4.5 korrigiert.
- Payload-Zeitstempel-Client-Vertrag bleibt offen und wird in S4.6 korrigiert.

#### S4.5 Report-Anker persistieren

Umsetzung:

- Betroffene Datei:
  - `backend/supabase/functions/midas-monthly-report/index.ts`
- Monthly-Update setzt nun den Report-Anker:
  - `.update({ ts: reportAnchorTs, payload: reportPayload })`.
- Insert setzt nun den Report-Anker:
  - `ts: reportAnchorTs`.
- `reportAnchorTs` bleibt derselbe Wert aus S4.4:
  - `period.to` bei UTC-Mittag.
- Die Response enthaelt weiterhin:
  - `report`.
  - `range`.
  - `report_anchor_ts`.

Code Review:

- `health_events.day` bleibt generated und wird nicht direkt geschrieben.
- Durch `ts = reportAnchorTs` zeigt `day` auf den Report-Zeitraum, nicht auf den Erzeugungstag.
- Monthly-Idempotenz bleibt erhalten:
  - Existing-Suche bleibt ueber `payload.subtype = monthly_report`.
  - Existing-Suche bleibt ueber `payload.month = range.monthTag`.
  - Bei bestehendem Monthly Report wird derselbe Datensatz aktualisiert.
- Range-Reports bleiben Insert-per-run:
  - Es wurde keine Range-Dedupe-Logik eingefuehrt.
- Erzeugungszeit bleibt fachlich ueber Payload-Zeitstempel abbildbar:
  - `generated_at` existiert weiterhin.
  - `created_at`/Client-Fallback wird bewusst erst in S4.6 synchronisiert.

Contract Review:

- S4.5 erfuellt den Persistenzvertrag aus S2/S3:
  - Report-Anker `ts` wird bei Insert gesetzt.
  - Report-Anker `ts` wird bei Monthly-Update gesetzt.
  - `health_events.day` wird ueber den bestehenden SQL-Vertrag aus `ts` abgeleitet.
  - Keine SQL-/RLS-/Schema-Aenderung.
  - Monthly-Idempotenz bleibt ueber Payload-Monat erhalten.
  - Range Reports bleiben einzelne Erzeugungen.
- S4.4 bleibt intakt:
  - der Anker wird weiterhin aus `period.to` bei UTC-Mittag berechnet.
- S4.6 bleibt bewusst offen:
  - Payload-Zeitstempelvertrag Edge/Client ist noch nicht final synchronisiert.

Checks:

- `deno check backend/supabase/functions/midas-monthly-report/index.ts`: gruen.
- `git diff --check -- backend/supabase/functions/midas-monthly-report/index.ts`: keine Whitespace-Fehler.
  - Git meldet nur den bestehenden CRLF/LF-Hinweis fuer diese Datei.
- Gezielter Scan bestaetigt:
  - Monthly-Update schreibt `{ ts: reportAnchorTs, payload: reportPayload }`.
  - Insert schreibt `ts: reportAnchorTs`.
  - Existing-Suche nutzt weiterhin `payload->>subtype` und `payload->>month`.
  - Select gibt weiterhin `id, day, ts, payload` zurueck.

Findings:

- Keine offenen S4.5-Code- oder Contract-Findings.

Korrektur:

- Nicht erforderlich.

Restrisiko / bewusst offen:

- Payload-Zeitstempel-Client-Vertrag bleibt offen und wird in S4.6 korrigiert.
- Activity-Copy bleibt offen und wird in S4.7 korrigiert.

#### S4.6 Payload-Zeitstempel synchronisieren

Umsetzung:

- Betroffene Dateien:
  - `backend/supabase/functions/midas-monthly-report/index.ts`
  - `app/supabase/api/system-comments.js`
- Edge Function schreibt nun beide Payload-Zeitstempel:
  - `generated_at: generatedAt`
  - `created_at: generatedAt`
- Beide Felder bekommen beim aktuellen Reportlauf denselben ISO-Zeitstempel.
- Client-Normalisierung liest nun robust:
  - `payload.created_at`
  - dann `payload.generated_at`
  - dann `row.ts`
  - dann `null`

Code Review:

- `generated_at` bleibt als Generator-Zeitpunkt erhalten.
- `created_at` ist als UI-kompatibler Erstellungszeitpunkt verfuegbar.
- `row.ts` bleibt nur Fallback fuer Altbestand ohne Payload-Zeitstempel.
- Der Report-Anker `ts` aus S4.5 wird nicht als primaerer UI-Erzeugungszeitpunkt verwendet.
- Reports-UI nutzt bereits `report.reportCreatedAt || report.ts` und bleibt dadurch kompatibel.

Contract Review:

- S4.6 erfuellt den Payload-Zeitstempel-Vertrag aus S2/S3:
  - Edge schreibt `generated_at` und `created_at`.
  - beide Felder sind fuer den Reportlauf identisch.
  - Client liest `created_at || generated_at || row.ts`.
  - Altbestand mit nur `generated_at` bleibt darstellbar.
- S4.5 bleibt intakt:
  - `health_events.ts` bleibt Report-Anker.
  - Payload-Zeitstempel bleibt Erzeugungszeit.

Checks:

- `deno check backend/supabase/functions/midas-monthly-report/index.ts`: gruen.
- `node --check app/supabase/api/system-comments.js`: gruen.
- `git diff --check -- backend/supabase/functions/midas-monthly-report/index.ts app/supabase/api/system-comments.js`: keine Whitespace-Fehler.
  - Git meldet nur den bestehenden CRLF/LF-Hinweis fuer diese Dateien.
- Gezielter Scan bestaetigt:
  - `generated_at: generatedAt` vorhanden.
  - `created_at: generatedAt` vorhanden.
  - `reportCreatedAt` nutzt `payload.created_at || payload.generated_at || row.ts || null`.
  - Reports-UI nutzt `report.reportCreatedAt || report.ts`.

Findings:

- Keine offenen S4.6-Code- oder Contract-Findings.

Korrektur:

- Nicht erforderlich.

Restrisiko / bewusst offen:

- Activity-Copy bleibt offen und wird in S4.7 korrigiert.
- Gesamt-Code- und Contract-Review bleibt offen und wird in S4.8 durchgefuehrt.

#### S4.7 Activity-Copy korrigieren

Umsetzung:

- Betroffene Datei:
  - `backend/supabase/functions/midas-monthly-report/index.ts`
- Range-Activity-Copy korrigiert:
  - `avgText` enthaelt nicht mehr selbst das Wort `Durchschnitt`.
  - Die bestehende Zeile `Gesamtdauer ... (Durchschnitt: ...)` bleibt als ruhiger Label-Text erhalten.
- Keine Activity-Auswertungslogik geaendert.
- Keine neuen Activity-Schwellen, Coachings oder Bewertungen eingefuehrt.

Code Review:

- Der alte moegliche Text `Durchschnitt: Durchschnitt ...` kann nicht mehr entstehen.
- `activity.avgMin` wird weiterhin unveraendert fuer den Durchschnitt pro Eintrag genutzt.
- Fallback bei fehlendem Durchschnitt bleibt `n. a.`.
- Monthly-Activity-Copy bleibt unveraendert.
- Range-Report-Struktur bleibt unveraendert:
  - Letzte Aktivitaet.
  - Trainings/Woche.
  - Gesamtdauer mit Durchschnitt.

Contract Review:

- S4.7 erfuellt den Copy-Vertrag aus S3:
  - nur doppelte `Durchschnitt`-Formulierung entfernt.
  - keine neue Activity-Auswertung.
  - keine Coaching-, Alarm- oder Diagnose-Sprache.
- S4.1 bis S4.6 bleiben intakt:
  - Auth, Runtime-Validation, Date-/Month-Validation, Report-Anker und Payload-Zeitstempel wurden nicht veraendert.

Checks:

- `deno check backend/supabase/functions/midas-monthly-report/index.ts`: gruen.
- `git diff --check -- backend/supabase/functions/midas-monthly-report/index.ts`: keine Whitespace-Fehler.
  - Git meldet nur den bestehenden CRLF/LF-Hinweis fuer diese Datei.
- Gezielter Scan bestaetigt:
  - keine `Durchschnitt: Durchschnitt`-Form.
  - kein `Durchschnitt n. a.` im Range-Activity-Fallback.
  - `Gesamtdauer`-Zeile bleibt vorhanden.

Findings:

- Keine offenen S4.7-Code- oder Contract-Findings.

Korrektur:

- Nicht erforderlich.

Restrisiko / bewusst offen:

- Gesamt-Code- und Contract-Review bleibt offen und wird in S4.8 durchgefuehrt.

#### S4.8 Gesamt-Code- und Contract Review

Review-Scope:

- Auth.
- Scheduler.
- Monthly-Idempotenz.
- Range-Insert.
- Date-/Month-Validation.
- Report-Anker.
- Payload-Zeitstempel.
- Inbox-Sichtbarkeit.
- Activity-Copy.

Code Review:

- Auth:
  - `reportType` wird vor der User-Aufloesung normalisiert.
  - Service-Role wird explizit ueber `SERVICE_ROLE_KEY` erkannt.
  - Nicht-Service-Role laeuft ueber `requireUser(token)`.
  - Kein unauthentifizierter `MONTHLY_REPORT_USER_ID`-Fallback mehr.
- Scheduler:
  - Service-Role darf nur `monthly_report`.
  - `MONTHLY_REPORT_USER_ID` ist nur im Service-Role-Monthly-Pfad zulaessig.
- Monthly-Idempotenz:
  - Existing-Suche bleibt ueber `payload.subtype = monthly_report` und `payload.month`.
  - Bestehende Monthly-Zeile wird aktualisiert.
- Range-Insert:
  - Range Reports bleiben direkte Inserts.
  - Keine Range-Dedupe-Logik eingefuehrt.
- Date-/Month-Validation:
  - `report_type` ist runtime-validiert.
  - Monthly und Range nutzen getrennte Normalisierer.
  - ungueltige Tage/Monate werden abgelehnt.
  - kein `.slice(0, 10)` als Input-Validation.
  - kein `monthBoundsUTC(Number(...), Number(...))`-Pfad.
- Report-Anker:
  - `reportAnchorTs` wird aus `period.to` bei UTC-Mittag berechnet.
  - Insert und Monthly-Update setzen `ts: reportAnchorTs`.
  - `health_events.day` bleibt generated aus `ts`.
- Payload-Zeitstempel:
  - Edge schreibt `generated_at` und `created_at`.
  - Client liest `created_at || generated_at || row.ts`.
- Inbox-Sichtbarkeit:
  - Reports werden ueber den Report-Anker in den erwarteten `day`-Kontext gelegt.
  - Report-Zeitraum bleibt in `payload.period`.
  - Erzeugungszeit bleibt im Payload.
- Activity-Copy:
  - keine doppelte `Durchschnitt`-Formulierung mehr.

Contract Review:

- S4 erfuellt die Vertraege aus S2/S3:
  - Auth-Vertrag.
  - Runtime-Validation.
  - Date-/Month-Vertrag.
  - Report-Zeit-/Inbox-Vertrag.
  - Payload-Zeitstempel-Vertrag.
  - Range-Dedupe-Abgrenzung.
  - Copy-Hygiene.
- Nicht in Scope wurde eingehalten:
  - keine SQL-/RLS-/Schema-Aenderung.
  - kein UI-Redesign.
  - keine neue medizinische Bewertung.
  - kein Deploy.
  - kein GitHub Workflow-Smoke.

Findings:

- MR-S4.8-F1: `Date.UTC` interpretiert Jahre `0000` bis `0099` als `1900` bis `1999`. `parseIsoMonth(...)` haette solche vierstelligen, aber fuer MIDAS unplausiblen Jahre akzeptiert und damit Monatsgrenzen still falsch berechnen koennen. `parseIsoDay(...)` haette Jahre unter `1000` ebenfalls akzeptiert.

Korrektur:

- MR-S4.8-F1 korrigiert:
  - `parseIsoDay(...)` lehnt Jahre unter `1000` ab.
  - `parseIsoMonth(...)` lehnt Jahre unter `1000` ab.
  - Damit bleibt der Date-/Month-Vertrag streng und ohne stille JS-Year-Uminterpretation.

Checks:

- `deno check backend/supabase/functions/midas-monthly-report/index.ts`: gruen.
- `node --check app/supabase/api/system-comments.js`: gruen.
- `git diff --check -- backend/supabase/functions/midas-monthly-report/index.ts app/supabase/api/system-comments.js docs/MIDAS Monthly Report Review Findings Roadmap.md`: keine Whitespace-Fehler.
  - Git meldet nur die bestehenden CRLF/LF-Hinweise fuer die geaenderten Code-Dateien.
- Gezielter Alt-Muster-Scan:
  - kein unauthentifizierter Default-User-Fallback.
  - keine alte `normalizeRange(...)`-Weichlogik.
  - keine `.slice(0, 10)`-Input-Validation.
  - keine `monthBoundsUTC(Number(...), Number(...))`-Konvertierung.
  - keine doppelte `Durchschnitt: Durchschnitt`-Copy.
- Gezielter Contract-Scan:
  - `generated_at: generatedAt` vorhanden.
  - `created_at: generatedAt` vorhanden.
  - `ts: reportAnchorTs` bei Insert vorhanden.
  - `{ ts: reportAnchorTs, payload: reportPayload }` bei Monthly-Update vorhanden.
  - `reportCreatedAt` liest `payload.created_at || payload.generated_at || row.ts || null`.
- Date-Sanity:
  - `2026-02-28` akzeptiert.
  - `2026-02-31` abgelehnt.
  - `2026-06` akzeptiert.
  - `2026-13` abgelehnt.
  - `0099-01-01` und `0099-01` abgelehnt.

Doku-Sync-Entscheidung:

- Reports Overview und QA werden weiterhin erst in S6 synchronisiert.
- S5 fuehrt vorher die Gesamtchecks und freigegebene Runtime-Smokes aus.

Restrisiko / bewusst offen:

- Kein Remote Runtime-Smoke in S4.8, weil Schreibwirkung erst in S5 nach Freigabe erfolgt.
- GitHub Workflow-Smoke bleibt S5-/Freigabe-Thema.

## S5 - Tests, Code Review und Contract Review

Ziel:

- Lokal und, falls freigegeben, remote pruefen, dass Reports sauber funktionieren.

Lokal ausfuehrbare Checks:

- `deno check backend/supabase/functions/midas-monthly-report/index.ts`
- `node --check app/supabase/api/system-comments.js`
- `git diff --check`
- gezielte Scans:
  - kein unauthentifizierter Default-User-Fallback.
  - `report_type` runtime-validiert.
  - keine `.slice(0, 10)`-Date-Validation.
  - keine stillen Date-Rolling-Pfade.
  - Monthly-Idempotenz bleibt.
  - Range Reports bleiben Inserts.
  - Report-Anker `ts` wird bei Insert und Monthly-Update gesetzt.
  - Payload enthaelt `generated_at` und `created_at`.
  - Client liest `created_at || generated_at || row.ts`.
  - Activity-Copy ohne doppelte `Durchschnitt`-Form.

Definierte Runtime-Smokes, nur nach Freigabe:

- Remote Monthly Scheduler-Pfad mit Service-Role:
  - erzeugt oder aktualisiert Monatsbericht.
  - kein Duplikat fuer denselben Monat.
- Remote Range-Report mit User-JWT:
  - gueltiger `from/to` erzeugt Arzt-Bericht.
  - Bericht ist nach Inbox-Refresh sichtbar.
- Remote Invalid-Date-Smoke:
  - `2026-02-31` liefert 400 mit klarer Validation.
  - ungueltiger `report_type` liefert 400.
- GitHub Workflow-Smoke:
  - `.github/workflows/monthly-report.yml` nach Freigabe ausfuehren oder nur definieren.

Code Review:

- Auth/User-Auswahl.
- Persistenz.
- Fehlerantworten.
- Report-Payload.
- User-facing Copy.

Contract Review:

- Gegen Reports Overview.
- Gegen Doctor View / Reports UI.
- Gegen DEV_ENVIRONMENT Deploy-/Workflow-Regeln.
- Gegen MIDAS-Guardrails.

Exit-Kriterium:

- Keine offenen P0/P1-Code-Findings.
- Nicht lokal ausgefuehrte Smokes sind sauber dokumentiert.

### S5 Ergebnisprotokoll 02.06.2026

Durchgefuehrte lokale Checks:

- `deno check backend/supabase/functions/midas-monthly-report/index.ts`: gruen.
- `node --check app/supabase/api/system-comments.js`: gruen.
- `node --check app/supabase/api/reports.js`: gruen.
- `node --check app/modules/doctor-stack/reports/index.js`: gruen.
- `git diff --check`: keine Whitespace-Fehler.
  - Git meldet nur die bestehenden CRLF/LF-Hinweise fuer die geaenderten Code-Dateien.

Gezielte Vertrags-Scans:

- Keine alten Auth-Fallback-Muster gefunden:
  - kein `else if (DEFAULT_USER_ID)`.
  - kein `userId = DEFAULT_USER_ID`.
  - kein unauthentifizierter Default-User-Pfad.
- `report_type` wird runtime-normalisiert:
  - `normalizeReportType(...)` vorhanden.
  - `reportType` wird vor `resolveUserId(...)` berechnet.
- Scheduler-/Service-Role-Vertrag:
  - `isServiceRoleToken(...)` vorhanden.
  - `resolveUserId(...)` trennt Service-Role und User-JWT.
  - `MONTHLY_REPORT_USER_ID` wird nur im Service-Role-Monthly-Pfad verwendet.
- Date-/Month-Vertrag:
  - `parseIsoDay(...)` vorhanden.
  - `parseIsoMonth(...)` vorhanden.
  - Jahre unter `1000` werden abgelehnt.
  - keine alte `normalizeRange(...)`-Weichlogik.
  - keine `.slice(0, 10)`-Input-Validation.
  - keine `monthBoundsUTC(Number(...), Number(...))`-Konvertierung.
- Persistenzvertrag:
  - Monthly-Update schreibt `{ ts: reportAnchorTs, payload: reportPayload }`.
  - Insert schreibt `ts: reportAnchorTs`.
  - Existing-Suche nutzt weiterhin `payload->>subtype` und `payload->>month`.
  - Select gibt weiterhin `id, day, ts, payload` zurueck.
- Payload-/Client-Zeitstempel:
  - Edge schreibt `generated_at: generatedAt`.
  - Edge schreibt `created_at: generatedAt`.
  - Client liest `payload.created_at || payload.generated_at || row.ts || null`.
  - Reports-UI nutzt `report.reportCreatedAt || report.ts`.
- Activity-Copy:
  - keine `Durchschnitt: Durchschnitt`-Form.
  - Range-Activity-Zeile bleibt `Gesamtdauer ... (Durchschnitt: ...)`.

Date-Sanity-Smoke ohne Datenbankzugriff:

- `2026-02-28` akzeptiert.
- `2026-02-31` abgelehnt.
- `0099-01-01` abgelehnt.
- `1000-01-01` akzeptiert.
- `2026-06` akzeptiert.
- `2026-13` abgelehnt.
- `0099-01` abgelehnt.
- `1000-01` akzeptiert.
- Monatsgrenzen fuer `2026-02` ergeben `2026-02-01` bis `2026-02-28`.
- Report-Anker fuer `2026-02-28` ergibt UTC-Mittag.

Read-only Remote-/Tooling-Status:

- `.env.supabase.local` enthaelt die erwarteten Variablennamen fuer Supabase-Checks.
  - Keine Secret-Werte ausgegeben oder dokumentiert.
- Supabase CLI funktioniert.
- `supabase functions list` zeigt `midas-monthly-report` als `ACTIVE`.
- GitHub CLI Auth funktioniert.
- Workflow `Monthly Report` ist vorhanden.
- Letzte gelistete `Monthly Report`-Runs waren erfolgreich.
- Neuester Workflow-Log wurde read-only geprueft:
  - Workflow ruft `midas-monthly-report` mit Service-Role und `report_type = monthly_report` auf.
  - Log zeigte eine Edge-Function-Report-Response.
  - Der Log spiegelt den bereits deployed Stand wider, nicht die lokalen S4-Aenderungen.

Nicht ausgefuehrte Runtime-Smokes mit Schreibwirkung:

- Remote Monthly Scheduler-Pfad wurde nicht manuell neu gestartet.
- Remote Range-Report mit User-JWT wurde nicht erzeugt.
- Remote Invalid-Date-Smoke wurde nicht gegen Produktion ausgefuehrt.
- GitHub Workflow-Smoke wurde nicht gestartet.

Begruendung:

- Die S4-Codeaenderungen sind lokal noch nicht deployed.
- Remote-Smokes mit Schreibwirkung wuerden aktuell entweder den alten deployed Stand testen oder produktiv Reports schreiben.
- Nach Deploy von `midas-monthly-report` sind die Remote-Smokes fachlich sinnvoll.

Code Review S5:

- Keine P0/P1-Code-Findings.
- Keine S5-Korrektur an Produktcode erforderlich.
- Beobachtung ohne Code-Aenderung:
  - Der Workflow nutzt aktuell `curl -sS` ohne `--fail-with-body`.
  - Das war bereits als Watchlist/Future-Hardening dokumentiert und bleibt ausserhalb dieses engen Fix-Scopes, weil `.github/workflows/monthly-report.yml` in dieser Roadmap nur Read-only-Review ist.

Contract Review S5:

- Gegen Reports Overview:
  - Der finale Code erweitert den bestehenden Reports-Vertrag um harte Runtime-Validation, Report-Anker und Payload-Zeitstempel.
  - Reports Overview muss in S6 synchronisiert werden.
- Gegen Doctor View / Reports UI:
  - `reportCreatedAt` bleibt fuer die UI verfuegbar.
  - Periodendarstellung bleibt ueber `payload.period`.
  - Inbox-Filter nutzt weiterhin `day`, profitiert nach Deploy vom Report-Anker.
- Gegen DEV_ENVIRONMENT:
  - Kein Deploy ohne separate Freigabe.
  - Kein produktiver Workflow-Run ohne separate Freigabe.
  - Secrets wurden nicht ausgegeben.
- Gegen MIDAS-Guardrails:
  - Keine neue Diagnose-/Therapie-/Alert-Logik.
  - Kein UI-Redesign.
  - Keine SQL-/RLS-/Schema-Aenderung.
  - Range Reports bleiben bewusst Insert-per-run.

Findings:

- MR-S5-CRB-F1: CodeRabbit fand, dass `req.json().catch(() => ({}))` ungueltiges JSON still als leeren Payload behandelt. Dadurch konnte ein malformed Request spaeter einen verwirrenden Validierungsfehler ausloesen oder im Monthly-Default landen.
- Keine offenen P0/P1-S5-Findings nach Korrektur.

Korrektur:

- MR-S5-CRB-F1 korrigiert:
  - `parseRequestPayload(req)` eingefuehrt.
  - leerer oder Whitespace-Body bleibt `{}` und erhaelt den bestehenden Monthly-Default.
  - syntaktisch ungueltiges JSON wirft `Ungueltiges JSON im Request-Body.`.
  - gueltige Nicht-Objekt-Payloads bleiben nach S4.1-Vertrag ein leerer Payload.
- Nachpruefung:
  - `deno check backend/supabase/functions/midas-monthly-report/index.ts`: gruen.
  - `req.json().catch(() => ({}))` nicht mehr vorhanden.
  - `parseRequestPayload(req)` im Handler verwendet.

Restrisiko / bewusst offen:

- Remote Runtime-Smokes mit Schreibwirkung muessen nach Deploy neu bewertet bzw. ausgefuehrt werden.
- S6 muss Reports Overview und QA auf den finalen Vertrag synchronisieren.

Deploy-Nachtrag 02.06.2026:

- `midas-monthly-report` wurde nach S5 und CodeRabbit-Korrektur deployed.
- Deploy-Kommando:
  - `supabase functions deploy midas-monthly-report --project-ref <SUPABASE_PROJECT_REF> --workdir backend --use-api`
- Remote-Status nach Deploy:
  - `midas-monthly-report` ist `ACTIVE`.
  - Version: `45`.
  - Updated at: `2026-06-02 17:23:43 UTC`.
- Nicht-schreibender Runtime-Smoke:
  - Invalid-JSON-Request mit Service-Role-Header.
  - Ergebnis: `HTTP/1.1 400 Bad Request`.
  - Response: `{"error":"Ungueltiges JSON im Request-Body."}`.
- Keine produktiven Report-Write-Smokes ausgefuehrt:
  - kein manueller Monthly Scheduler-Run.
  - kein Range-Report-Insert.
  - kein GitHub Workflow-Run.

## S6 - Doku-Sync, QA-Update und Abschlussreview

Ziel:

- Doku, QA und Code sprechen denselben finalen Report-Vertrag.

Substeps:

- S6.1 `docs/modules/Reports Module Overview.md` aktualisieren:
  - Auth-Vertrag.
  - Runtime-Validation.
  - Date-/Month-Vertrag.
  - Report-Zeit-/Inbox-Vertrag.
  - `generated_at`/`created_at`.
  - Range-Report-Dedupe-Abgrenzung.
- S6.2 `docs/QA_CHECKS.md` um Monthly-Report-Review-Smokes erweitern.
- S6.3 Roadmap-Ergebnisprotokolle aktualisieren.
- S6.4 Finaler Contract Review:
  - Roadmap vs. Code.
  - Roadmap vs. Reports Overview.
  - Roadmap vs. QA.
  - Roadmap vs. DEV_ENVIRONMENT.
  - Roadmap vs. MIDAS-Guardrails.
- S6.5 Abschluss-Abnahme:
  - keine offenen P0/P1-Risiken.
  - Deploy-Status explizit dokumentiert.
  - Runtime-Smokes offen oder ausgefuehrt dokumentiert.
- S6.6 Commit-Empfehlung.
- S6.7 Archiv-Entscheidung nach User-Abnahme.

Exit-Kriterium:

- Roadmap ist commit- oder archivbereit.

### S6 Ergebnisprotokoll 02.06.2026

Durchgefuehrt:

- S6.1 `docs/modules/Reports Module Overview.md` aktualisiert.
- S6.2 `docs/QA_CHECKS.md` um Monthly-Report-Review-Smokes erweitert.
- S6.3 Roadmap-Ergebnisprotokoll inklusive Deploy-Nachtrag aktualisiert.
- S6.4 Finaler Contract Review durchgefuehrt.
- S6.5 Abschluss-Abnahme dokumentiert.
- S6.6 Commit-Empfehlung bestaetigt.
- S6.7 Archiv-Entscheidung umgesetzt.

Reports Overview synchronisiert:

- Auth-Vertrag:
  - manuelle Reports laufen mit User-JWT.
  - Scheduler/Cron nutzt Service Role + `MONTHLY_REPORT_USER_ID`.
  - Service Role ist nur fuer `monthly_report` erlaubt.
  - kein offener Default-User-Fallback.
- Runtime-Validation:
  - `report_type` ist runtime-begrenzt.
  - leerer Request-Body bleibt Monthly-Default.
  - ungueltiges JSON liefert 400.
- Date-/Month-Vertrag:
  - Monthly validiert optionales `month`.
  - Range validiert `from/to`.
  - kein stilles JS-Date-Rolling.
- Report-Zeit-/Inbox-Vertrag:
  - `health_events.ts` ist Report-Anker.
  - `health_events.day` bleibt generated.
  - Zeitraum bleibt in `payload.period`.
  - Erzeugungszeit bleibt in `payload.generated_at` / `payload.created_at`.
- Range-Report-Dedupe:
  - Range bleibt Insert-per-run.
  - keine automatische Dedupe.

QA synchronisiert:

- Neue Phase `P16 - Monthly Report Edge Contract Hardening (2026-06-02)` eingefuegt.
- Lokale Checks dokumentiert:
  - `deno check`.
  - relevante `node --check`-Checks.
  - Vertrags-Scans.
- Deploy dokumentiert:
  - `midas-monthly-report` ACTIVE, Version 45.
  - Invalid-JSON-Smoke mit HTTP 400.
- Offene Runtime-Smokes mit Schreibwirkung dokumentiert:
  - Monthly Scheduler-Pfad.
  - Range-Report mit User-JWT.
  - GitHub Workflow-Smoke nach Freigabe.

Finaler Contract Review:

- Roadmap vs. Code:
  - Auth-, Runtime-, Date-, Persistenz-, Payload- und Copy-Vertrag stimmen mit `backend/supabase/functions/midas-monthly-report/index.ts` und `app/supabase/api/system-comments.js` ueberein.
- Roadmap vs. Reports Overview:
  - Reports Overview beschreibt den finalen Vertrag inklusive Report-Anker, Payload-Zeitstempel und Range-Dedupe-Abgrenzung.
- Roadmap vs. QA:
  - QA enthaelt die lokalen Checks, Deploy-Info und offene write-gated Runtime-Smokes.
- Roadmap vs. DEV_ENVIRONMENT:
  - Deploy erfolgte erst nach Freigabe.
  - GitHub Workflow-Run wurde nicht ohne Freigabe gestartet.
  - Secret-Werte wurden nicht dokumentiert.
- Roadmap vs. MIDAS-Guardrails:
  - keine neue Diagnose-, Therapie- oder Alert-Logik.
  - kein UI-Redesign.
  - keine SQL-/RLS-/Schema-Aenderung.
  - Range Reports bleiben bewusst Insert-per-run.

S6 Findings:

- MR-S6-F1: Der finale `deno check` fand einen versehentlich eingefuegten CodeRabbit-Snippet-Rest direkt vor `Deno.serve(...)`: `req.json()` und `return responseJson(...)` standen ausserhalb des Handler-Scopes.
- Keine offenen S6-Contract-Findings nach Korrektur.

Korrektur:

- MR-S6-F1 korrigiert:
  - fehlerhaften Snippet-Rest entfernt.
  - korrekte `parseRequestPayload(req)`-Logik im Handler beibehalten.
  - `deno check backend/supabase/functions/midas-monthly-report/index.ts` danach erneut gruen.

Abschluss-Abnahme:

- Keine offenen P0/P1-Risiken.
- Deploy-Status explizit dokumentiert:
  - `midas-monthly-report` ACTIVE, Version 45.
- Runtime-Smokes:
  - nicht-schreibender Invalid-JSON-Smoke ausgefuehrt und gruen.
  - produktive Write-Smokes bleiben bewusst offen und user-gated.

Archiv-Entscheidung:

- Roadmap wird mit `(DONE)` abgeschlossen und nach `docs/archive/` verschoben.

## Smokechecks / Regression

- Monthly-Report erzeugt oder aktualisiert denselben Monat idempotent.
- Range-Report bleibt bewusst ein Insert pro Erzeugung.
- Manuelle Reports funktionieren mit User-JWT.
- Scheduler funktioniert mit Service-Role und `MONTHLY_REPORT_USER_ID`.
- Kein unauthentifizierter Call kann Default-User-Reports erzeugen.
- Invalid `report_type` wird abgelehnt.
- Invalid `from/to/month` wird abgelehnt.
- Inbox zeigt neu erzeugte Reports im erwarteten Kontext.
- Report-Erstellungszeit und Report-Zeitraum bleiben unterscheidbar.
- Activity-Text ist ruhig und ohne doppelte Formulierung.
- Keine neue Diagnose-/Therapie-/Alert-Logik.
- Keine Regression in Doctor Inbox, Delete, Regenerate und Clear Inbox.

## Abnahmekriterien

- Auth-Vertrag ist in Code und Doku eindeutig.
- Runtime-Validation ist robust.
- Report-Typen sind begrenzt.
- Date-/Month-Inputs rollen nicht still.
- Reports bleiben in der Inbox nachvollziehbar auffindbar.
- Client und Edge Function sprechen denselben Payload-Zeitstempelvertrag.
- Doku und QA bilden den finalen Vertrag ab.

## Commit-Empfehlung

Nach Umsetzung geeignet:

```text
fix(reports): harden monthly report edge contract
```
