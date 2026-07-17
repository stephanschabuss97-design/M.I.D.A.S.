# MIDAS Medication Data Hygiene Roadmap (DONE)

## Roadmap-Metadaten

| Feld | Wert |
| --- | --- |
| Status | `DONE` |
| Modul / Bereich | Medication / Supabase SQL / Datenmodell / Retention |
| Owner / Kontext | Patient, Medication, Intake, Push, Android Widget, Supabase |
| Erstellt am | `2026-07-10` |
| Letzter Stand | `2026-07-12, S6-Doku-Sync und finaler Contract Review erfolgreich abgeschlossen` |
| Aktueller Schritt | `COMPLETE` |
| Betroffene Hauptdateien | `sql/12_Medication.sql`, `sql/16_Explicit_Grants.sql`, geplantes Retention-/Transition-SQL, Medication-Consumer und Source-of-Truth-Dokus |
| Deploy relevant | `ja, produktive SQL-Ausfuehrung` |
| Runtime-Smoke relevant | `ja` |
| Archivziel | `docs/archive/MIDAS Medication Data Hygiene Roadmap (DONE).md` |

## Current Working State / Handoff

- Aktueller Stand:
  - Das produktive Multi-Dose-Modell mit Medication-Stammdaten, Schedule-Slots und Slot-Events bleibt fachlich richtig.
  - `health_medication_stock_log` erzeugt fuer Confirm, Undo, Restock und manuelle Bestandsaenderungen einen langfristig nicht benoetigten Bewegungsverlauf.
  - Der Stock-Log hat keinen belegten aktiven Reader in PWA, Android Widget, Push, Reports oder Edge Functions.
  - Der Stock-Log ist kein belastbarer Audit-Trail:
    - `med_upsert_v2` kann den Bestand ohne Stock-Log-Eintrag aendern.
    - Confirm kann den Bestand auf `0` begrenzen, waehrend der Log die volle negative Slot-Menge festhaelt.
    - `med_set_stock_v2` kann bei einem unveraenderten Bestand an `delta <> 0` scheitern.
  - Fachliche Entscheidung:
    - `health_medication_stock_log` wird vollstaendig abgeschafft.
    - Aktueller Bestand bleibt in `health_medications.stock_count`.
    - Slot-Events bleiben die fachliche Quelle fuer dokumentierte Einnahmen.
    - Roh-Einnahmehistorie wird auf ein rollendes Kalenderjahr begrenzt.
    - Kein lebenslanger Monats-/Jahres-Aggregatpfad wird in dieser Roadmap eingefuehrt.
  - Clean-Start-Entscheidung:
    - bestehende Medication-Stammdaten bleiben erhalten.
    - am Stichtag gueltige Slot-Plaene bleiben fachlich erhalten und werden mit unveraendertem Slot-Inhalt auf den Stichtag als neuen Beobachtungsbeginn rebased.
    - erst nach dem Stichtag beginnende zukuenftige Slot-Plaene bleiben unveraendert.
    - bisherige Slot-Events werden zu einem explizit dokumentierten Stichtag geloescht.
    - historische, vor dem Stichtag beendete Plaene werden bereinigt.
    - aktuelle Bestaende werden nach dem Cutover anhand der realen Packungen manuell neu gesetzt.
- Naechster erlaubter Schritt:
  - S6 mit finalem Doku-Sync, Contract Review und Abschlussprotokoll ausfuehren.
- Aktuell bekannte Findings:
  - `MDH-F1` bis `MDH-F44` gemaess Finding-Tabelle.
- Aktuell geaenderte Dateien:
  - `docs/MIDAS Medication Data Hygiene Roadmap.md`
  - `sql/12_Medication.sql`
  - `sql/16_Explicit_Grants.sql`
  - `sql/17_Medication_Retention.sql`
  - `sql/transition_medication_clean_start.sql`
  - `docs/modules/Medication Module Overview.md`
  - `docs/MIDAS Medication Data Hygiene Future Notes.md`
  - `docs/QA_CHECKS.md`
  - vorbestehend und nicht Teil dieser Roadmap-Erstellung:
    - `android/gradle.properties`
    - `docs/DEV_ENVIRONMENT.md`
- Offene User-Freigaben:
  - keine fuer den produktiven SQL-Cutover; Clean Start, Grants und
    Retention/Cron wurden am `2026-07-12` explizit freigegeben und ausgefuehrt.
  - manuelle App-/Widget-Smokes werden durch den User abgeschlossen.
- Wichtige Grenzen fuer den naechsten Chat:
  - Kein SQL-Code vor abgeschlossenem S4 Readiness Review.
  - Kein produktives SQL ohne erneute explizite User-Freigabe.
  - Kein `drop`, `delete`, `truncate` oder Cron-Setup waehrend S1-S3.
  - Keine Medication-Stammdaten oder aktuellen Plaene blind loeschen.
  - Keine bestehende User-Aenderung im Dirty Worktree revertieren.

## Ziel (klar und pruefbar)

MIDAS soll ein langfristig begrenztes, fachlich ehrliches Medication-Datenmodell erhalten, das auch nach Jahrzehnten keine nutzlose Bestandsbewegungshistorie ansammelt und dabei Tagesstatus, Mehrfach-Slots, Undo, Low-Stock, Widget und Reminder unveraendert traegt.

Pruefbare Zieldefinition:

- `health_medication_stock_log` existiert nach dem produktiven Cutover nicht mehr.
- Kein aktiver RPC, Grant, RLS-Vertrag, Consumer oder Source-of-Truth-Doku-Pfad referenziert den entfernten Stock-Log; Archiv- und Roadmap-Historie darf die fruehere Tabelle weiterhin dokumentieren.
- `med_confirm_slot_v2` und `med_undo_slot_v2` veraendern Slot-Event und aktuellen Bestand weiterhin atomar.
- Jedes Slot-Event speichert neben der dokumentierten Dosis in `stock_decrement_qty` die bei Confirm tatsaechlich vom Bestand abgezogene Menge; Undo stellt nur diese Menge wieder her.
- `med_adjust_stock_v2`, `med_set_stock_v2` und Restock aendern nur den aktuellen Bestand und erzeugen keine Historie.
- `health_medications.stock_count` kann weder ueber RPCs noch ueber direkte Data-API-Pfade negativ werden.
- `health_medication_slot_events` behaelt hoechstens das rollende Kalenderjahr ab dem fachlichen Cutoff.
- Beendete Schedule-Slots werden erst entfernt, wenn sie ausserhalb des erhaltenen Beobachtungszeitraums liegen und keine erhaltenen Events mehr benoetigt werden.
- Der Clean Start ist eindeutig dokumentiert und erzeugt keine falsche Aussage ueber Zeitraeume vor dem Stichtag.
- Alte Low-Stock-Acknowledgements werden beim Clean Start entfernt, damit der
  gegen die realen Packungen gepruefte und nur bei Bedarf korrigierte Bestand
  sofort neu bewertet wird.
- Die automatische Bereinigung laeuft datenbankseitig, idempotent und ohne Edge Function, GitHub Workflow oder App-Login-Abhaengigkeit.
- Push, Widget, Realtime, Intake, Assistant/Voice und Low-Stock funktionieren nach dem Umbau weiterhin auf Basis von Stammdaten, Plaenen und Slot-Events.

## Problemzusammenfassung

Der heutige Medication-Vertrag schreibt neben dem fachlich relevanten Einnahmeevent fuer fast jede normale Aktion eine zweite Bestandsbewegung in `health_medication_stock_log`.

Das erzeugt langfristig:

- unnoetige Zeilen und Indexeintraege.
- zusaetzliche Writes bei jeder Einnahme und jedem Undo.
- einen scheinbaren Audit-Trail, der den Bestand nicht vollstaendig rekonstruieren kann.
- technische Historie ohne praktischen Wert fuer Patient, Arzt, Widget oder Reminder.

MIDAS braucht langfristig nicht die Aussage:

- `Am 10.07.2026 wurde genau diese einzelne Tablette vergessen.`

MIDAS soll innerhalb eines klaren Beobachtungszeitraums ausdruecken koennen:

- wie viele Einnahmen geplant waren.
- wie viele Einnahmen dokumentiert wurden.
- wie viele Einnahmen nicht dokumentiert wurden.

`Nicht dokumentiert` ist der verbindliche Begriff. Das Fehlen eines Events beweist nicht sicher, dass eine Tablette vergessen wurde.

## Entscheidungslog

<!-- markdownlint-disable MD013 -->

| Datum | Entscheidung | Begruendung | Betroffene Schritte |
| --- | --- | --- | --- |
| `2026-07-10` | Eigene Roadmap statt eines einzelnen Schnell-SQLs | RPCs, Grants, Tabelle, Retention, Clean Start und Runtime-Consumer muessen koordiniert geaendert werden. | `S1-S6` |
| `2026-07-10` | Multi-Dose-, Slot- und aktueller Bestandsvertrag bleiben erhalten | Mehrfach-Einnahmen, temporaere Plaene, Push, Widget und Low-Stock bleiben langfristig sinnvoll. | `S1-S5` |
| `2026-07-10` | `health_medication_stock_log` wird vollstaendig entfernt | Kein aktiver Reader, kein fachlicher Langzeitnutzen und kein verlaesslicher Audit-Vertrag. | `S2-S5` |
| `2026-07-10` | Restock und manuelle Korrektur erhalten keinen historischen Log mehr | Fuer den Alltag ist nur der aktuelle reale Packungsbestand relevant. | `S2-S5` |
| `2026-07-10` | Roh-Slot-Events bleiben ein rollendes Kalenderjahr erhalten | Ein Jahr deckt den relevanten beobachtbaren Zeitraum ab, ohne lebenslange Einzelereignisse zu sammeln. | `S2-S5` |
| `2026-07-10` | Keine dauerhafte Adhaerenz-Aggregation in dieser Roadmap | Es gibt aktuell keinen Produktbedarf fuer lebenslange Monats-/Jahresquoten. | `Not in Scope` |
| `2026-07-10` | Bewusster Clean Start statt historischer Rekonstruktion | Packungsbestaende koennen real neu gesetzt werden; alte Einzeldaten muessen nicht migriert werden. | `S3-S5` |
| `2026-07-10` | Am Stichtag gueltige Plaene werden auf den Stichtag rebased | Der Beobachtungsbeginn ist dadurch im Schedule-Datenmodell erkennbar, ohne eine neue Metadatentabelle einzufuehren. | `S2-S5` |
| `2026-07-10` | Das kanonische Master-SQL wird aktualisiert, aber nicht als Live-Migration ausgefuehrt | Der produktive Cutover soll nur gezielte, reviewte Transition-Statements enthalten und keine fachfremden Legacy-/Bootstrap-Bloecke erneut laufen lassen. | `S3-S5` |
| `2026-07-10` | Produktive Migration und Clean Start bleiben user-gated | Loeschung und Schemaaenderung haben irreversible produktive Schreibwirkung. | `S5` |
| `2026-07-10` | Retention soll datenbankseitig ueber Supabase Cron laufen | Der Job ist unabhaengig von PWA, Android, Edge Functions und GitHub und kann SQL/Funktionen direkt ausfuehren. | `S1-S5` |
| `2026-07-11` | GPT-5.6 Sol bleibt ueber die gesamte Roadmap konstant; nur Reasoning variiert | Modellkontinuitaet und Frontier-Qualitaet wiegen im validierungsnahen Gesundheits-/SQL-Kontext schwerer als ein nicht quantifizierter Verbrauchsvorteil durch Variantenwechsel. | `S1-S6` |
| `2026-07-12` | Erhaltene Bestaende werden physisch geprueft und nur bei Abweichung korrigiert | Der Cutover veraendert `stock_count` bewusst nicht; ein grundloses Neusetzen bereits korrekter Werte waere unnoetig. | `S5-S6` |

<!-- markdownlint-enable MD013 -->

## Owner-Verständnis: Wie und warum

### Was aendern wir fachlich?

- MIDAS behaelt Medikamente, aktuelle Bestaende, Mehrfach-Slots, Low-Stock,
  Push und Widget.
- Der dauerhafte Stock-Log mit einzelnen `+1`-/`-1`-Bewegungen entfaellt.
- Dokumentierte Einnahmen bleiben fuer ein rollendes Wiener Kalenderjahr
  erhalten und werden danach automatisch bereinigt.
- Confirm und Undo bleiben im Alltag gleich, speichern intern aber den
  tatsaechlich angewandten Bestandsabzug exakt invertierbar im Slot-Event.

### Warum waehlen wir diesen Weg?

- Der alte Stock-Log erzeugte langfristigen Datenmuell, war aber kein
  verlaesslicher Audit-Trail und hatte keinen aktiven Reader.
- Der aktuelle Bestand und der beobachtbare Einnahmezeitraum sind fachlich
  relevant; lebenslange einzelne Bestandsbewegungen sind es nicht.
- Das bestehende Multi-Dose-Modell bleibt erhalten, weil spaetere oder
  temporaere Einnahmeabschnitte weiterhin realistisch sind.
- Ein Clean Start ist ehrlicher als der Versuch, alte unvollstaendige
  Bestandsbewegungen nachtraeglich zu einer verlaesslichen Historie umzubauen.

### Welche Werkzeuge brauchen wir warum?

<!-- markdownlint-disable MD013 -->

| Werkzeug | Aufgabe in dieser Roadmap | Wichtige Abgrenzung |
| --- | --- | --- |
| `rg`, Git und Diff-Checks | Stock-Log-Consumer, Aenderungsscope und Doku-Drift finden | Beweisen noch kein echtes PostgreSQL-Runtimeverhalten |
| Docker Desktop | Isolierte Container fuer eine lokale Wegwerf-Testumgebung starten | Ist weder das produktive Supabase-Projekt noch selbst die Datenbanklogik |
| Supabase CLI / lokaler Stack | PostgreSQL 17.6, Auth, REST und Cron lokal gemeinsam bereitstellen | Lokaler Erfolg ist noch keine Freigabe fuer Produktion |
| `psql` | SQL, RPCs, Transaktionen, Fehlercodes, Locks und Reruns praezise testen | Ist nur der Client fuer einen bereits laufenden PostgreSQL-Server |
| Supabase MCP | Produktion read-only pruefen und spaeter freigegebene Migrationen anwenden | Werkzeugverfuegbarkeit ersetzt kein User-Gate |
| REST mit Service Role | Unmittelbaren privaten Pre-Cutover-Snapshot exportieren | War nur Backup-Hilfe, nicht der Migrationspfad |
| `pg_cron` | Jahres-Retention direkt bei den Daten taeglich ausfuehren | Kein Ersatz fuer externe HTTP-/Repository-Workflows |
| CodeRabbit / Advisor | Zusaetzliche Review- und Sicherheitsbefunde liefern | Findings werden geprueft und nicht blind umgesetzt |

<!-- markdownlint-enable MD013 -->

### Wo arbeiten wir?

- Lokal/disposable:
  - Fresh-Bootstrap, Rerun, RPC-Grenzfaelle, Transition, Rollback,
    Lock-Timeout, Grants und Retention mit Wegwerfdaten beweisen.
- Produktiv read-only:
  - Owner, Tabellen, Zeilenzahlen, Bestaende, Plaene, Push-Zustand,
    Abhaengigkeiten und Cron-Ausgangslage pruefen.
- Produktiv write:
  - einmalige Transition, danach Grants und Retention/Cron in reviewter
    Reihenfolge ausfuehren.
- User-gated:
  - Toolinstallation, produktiver Clean Start, Cron-Aktivierung und echte
    Runtime-Smokes mit Schreibwirkung.

### Was kann schiefgehen?

- Falsche oder parallele Daten koennten waehrend des Cutovers geloescht oder
  nur teilweise migriert werden.
- Falsche Grants koennten die App sperren oder Daten zu breit freigeben.
- Ein falscher Cron-Vertrag koennte aktuelle Events oder fremde Jobdetails
  loeschen.
- Stop-Bedingungen waren unter anderem: falscher Owner, heutiges Confirm,
  heutige Medication-Push-Zustellung, Rebase-Kollision, Lock-Timeout oder
  Ausfuehrung nach `10:00 Europe/Vienna`.
- Rueckfallstrategie: unmittelbarer privater Snapshot, eine gemeinsame
  Transaktion, feste Lock-Reihenfolge und Postconditions vor dem Commit.

### Woran erkennen wir den Erfolg?

- Technisch:
  - genau drei Medication-Tabellen, kein Stock-Log und keine negativen
    Bestaende.
  - drei erhaltene Plaene, korrekte Constraints und explizite Grants/RLS.
  - genau ein interner Retention-Job ohne Execute fuer App-Rollen.
- Im Alltag:
  - reale Einnahme erzeugt drei korrekte Events und reduziert die Bestaende
    von `133 / 36 / 36` auf `132 / 35 / 35`.
  - Android uebernimmt den erledigten Status ohne zusaetzlichen Eingriff.
  - Incident-Dry-Run erkennt keinen offenen Morgenslot.
- Owner-Anteil:
  - bestaetigen, dass vor dem Cutover noch keine Tabletten genommen wurden.
  - reale Packungsbestaende vergleichen.
  - PWA- und Android-Verhalten mit der echten Einnahme pruefen.

### Rueckblickende Owner Briefings

#### Vor Docker und dem lokalen Supabase-Stack

- Zweck: Die SQL-Dateien gegen echtes PostgreSQL und Supabase beweisen.
- Wirkung: Nur lokale Wegwerfdaten werden erzeugt und veraendert.
- Risiko: Lokale Ports oder unvollstaendige Toolinstallation.
- Rueckfall: Lokalen Stack stoppen oder neu aufbauen; Produktion bleibt
  unberuehrt.
- Erfolgsnachweis: Fresh-Bootstrap, Rerun und alle Fixtures sind gruen.

#### Vor dem produktiven Clean Start

- Zweck: Den geprueften Altbestand einmalig in das neue Datenmodell
  ueberfuehren.
- Wirkung: Alte Events und Stock-Log werden produktiv entfernt; Medikamente,
  Bestaende und aktuelle Plaene bleiben erhalten.
- Risiko: Irreversible Loeschung oder ein paralleler Medication-Write.
- Rueckfall: Snapshot, Transaktions-Rollback, Locks und harte Preconditions.
- Erfolgsnachweis: Postconditions, drei Migrationen und reale Runtime-Smokes.

#### Vor der Cron-Aktivierung

- Zweck: Den einjaehrigen Retention-Vertrag ohne App- oder GitHub-Abhaengigkeit
  dauerhaft ausfuehren.
- Wirkung: PostgreSQL bereinigt taeglich zu alte Events, entbehrliche alte
  Plaene und eigene alte Laufdetails.
- Risiko: Falscher Cutoff, Doppeljob oder zu breite Ausfuehrungsrechte.
- Rueckfall: Transaktionsabbruch bei falschem Owner/Jobvertrag; idempotente
  Provisionierung und genau ein stabil benannter Job.
- Erfolgsnachweis: Operator-Smoke loescht keine aktuelle Zeile, Job ist genau
  einmal aktiv und App-Rollen haben kein Execute.

## Scope

- Medication-SQL und Datenmodell:
  - `health_medications`.
  - `health_medication_schedule_slots`.
  - `health_medication_slot_events`.
  - Entfernung von `health_medication_stock_log`.
- Medication-RPCs:
  - `med_reset_all_data_v2`.
  - `med_confirm_slot_v2`.
  - `med_undo_slot_v2`.
  - `med_adjust_stock_v2`.
  - `med_set_stock_v2`.
  - weitere `med_*_v2`-RPCs nur fuer Regression und Abhaengigkeitspruefung.
- SQL-Artefakte:
  - kanonischer Medication-Vertrag in `sql/12_Medication.sql`.
  - Bereinigung des Medication-Abschnitts in `sql/16_Explicit_Grants.sql`.
  - neues idempotentes Retention-/Cron-SQL `sql/17_Medication_Retention.sql`.
  - separates, klar als einmalig markiertes Clean-Start-Transition-SQL `sql/transition_medication_clean_start.sql`.
- Clean Start:
  - einmaliger Sicherheits-Snapshot.
  - Loeschung alter Slot-Events.
  - Bereinigung historischer Schedule-Slots.
  - Rebase der am Stichtag gueltigen Plaene auf den Stichtag bei unveraendertem Slot-Inhalt.
  - unveraenderter Erhalt erst spaeter beginnender zukuenftiger Plaene.
  - Ruecksetzen alter Low-Stock-Acknowledgements.
  - manueller Bestandsabgleich durch den Nutzer.
- Automatische Retention:
  - interne Cleanup-Funktion.
  - passender Cutoff-Index.
  - genau ein geplanter Supabase-Cron-Job.
- Downstream-Regression:
  - Intake und Medication-TAB.
  - lokale und Remote Medication-Reminder.
  - Android Widget und Realtime-Refresh.
  - Assistant-/Voice-Abschnittsbestaetigung.
  - Profil-/Low-Stock-Snapshot.
- Doku und QA:
  - Medication Module Overview.
  - `docs/QA_CHECKS.md`.
  - `sql/HOW_TO.md`, falls Retention-/Transition-Konvention ergaenzt werden muss.
  - diese Roadmap und die Future Notes.

## Not in Scope

- Kein Medication V3 und kein neues allgemeines Medikationsmodell.
- Keine Aenderung der vier Tagesabschnitte `morning`, `noon`, `evening`, `night`.
- Keine Aenderung der Reminder-Zeiten, Incident-Schwellen oder Push-Cadence.
- Keine neue Arztansicht oder Adhaerenz-UI.
- Keine Behauptung, eine nicht dokumentierte Einnahme sei sicher vergessen worden.
- Keine lebenslange Monats-, Jahres- oder Gesamt-Adhaerenzaggregation.
- Kein Export-/Download-Workflow fuer den laufenden Betrieb.
- Keine Edge Function fuer Retention.
- Kein GitHub Workflow fuer Retention.
- Kein App-Login- oder Device-Sync-getriebener Cleanup.
- Kein Umbau von Auth, Service Role oder allgemeinem Supabase-Grant-Vertrag.
- Keine Routineausfuehrung von `VACUUM FULL`.
- Keine pauschale Loeschung anderer Gesundheitsdaten.

## Relevante Referenzen (Code)

- `sql/12_Medication.sql`
- `sql/16_Explicit_Grants.sql`
- `sql/HOW_TO.md`
- `app/modules/intake-stack/medication/index.js`
- `app/modules/intake-stack/intake/index.js`
- `app/modules/incidents/index.js`
- `app/modules/hub/index.js`
- `app/modules/assistant-stack/voice/index.js`
- `app/modules/profile/index.js`
- `backend/supabase/functions/midas-incident-push/index.ts`
- `android/app/src/main/java/de/schabuss/midas/widget/WidgetSyncRepository.kt`
- `android/app/src/main/java/de/schabuss/midas/widget/WidgetRealtimeSync.kt`

## Relevante Referenzen (Doku)

- `README.md`
- `docs/DEV_ENVIRONMENT.md`
- `docs/MIDAS Roadmap Template.md`
- `docs/MIDAS Medication Data Hygiene Future Notes.md`
- `docs/MIDAS Medication Data Hygiene Lessons Learned.md`
- `docs/modules/Medication Module Overview.md`
- `docs/modules/Intake Module Overview.md`
- `docs/modules/Push Module Overview.md`
- `docs/modules/Android Widget Module Overview.md`
- `docs/modules/Reports Module Overview.md`
- `docs/modules/Doctor View Module Overview.md`
- `docs/QA_CHECKS.md`
- `docs/archive/Medication Multi-Dose Implementation Roadmap (DONE).md`
- `docs/archive/MIDAS Incident Push Review Findings Roadmap (DONE).md`
- `docs/archive/MIDAS Android Widget V2.3 Appointments Context Roadmap (DONE).md`
- `docs/archive/MIDAS Supabase Explicit Grants Roadmap (DONE).md`

Externe Referenzen:

- Supabase Cron: `https://supabase.com/docs/guides/cron`
- Supabase Cron Installation: `https://supabase.com/docs/guides/cron/install`
- pg_cron Upstream und Job-Run-Monitoring: `https://github.com/citusdata/pg_cron`
- Supabase Database Size: `https://supabase.com/docs/guides/platform/database-size`
- Supabase Changelog: `https://supabase.com/changelog.md`

## Guardrails

- MIDAS bleibt single-user und alltagstauglich.
- Aktueller Medication-Tagesstatus darf durch Datenhygiene nicht unzuverlaessig werden.
- Kein Push darf durch den Clean Start faelschlich als echte vergessene Einnahme eskalieren.
- Slot-Event und Bestandsaenderung bleiben in Confirm/Undo atomar.
- Der aktuelle Bestand bleibt die einzige operative Bestandswahrheit.
- Stock darf nie negativ persistiert werden.
- RLS bleibt fuer alle userbezogenen Medication-Tabellen aktiv.
- Cleanup darf nie fremde Gesundheitsmodule beruehren.
- Cleanup darf aktuelle, kuenftige oder innerhalb des Beobachtungszeitraums benoetigte Plaene nicht loeschen.
- Der Clean Start wird nicht als normale idempotente Wartungsaktion getarnt.
- Keine produktive Loeschung ohne explizite User-Freigabe unmittelbar vor der Ausfuehrung.
- Source-of-Truth-Dokus und QA muessen am Ende denselben Retention-Vertrag beschreiben.

## Architektur-Constraints

- `health_medications` bleibt Source of Truth fuer Stammdaten und `stock_count`.
- `health_medication_schedule_slots` bleibt Source of Truth fuer erwartete Einnahmen pro Tag und Abschnitt.
- `health_medication_slot_events` bleibt Source of Truth fuer dokumentierte Einnahmen.
- Ein fehlendes Slot-Event bedeutet `nicht dokumentiert`, nicht beweisbar `vergessen`.
- Slot-Events referenzieren Schedule-Slots per Foreign Key mit `on delete cascade`.
- Retention muss deshalb Events vor nicht mehr benoetigten historischen Slots loeschen.
- Realtime beobachtet Medication-Stammdaten, Schedule-Slots und Slot-Events, nicht den Stock-Log.
- `midas-incident-push` liest Schedule-Slots und Slot-Events, nicht den Stock-Log.
- Das Android Widget liest `med_list_v2` und nutzt Realtime nur als Refresh-Signal.
- Das kanonische Modul-SQL muss auch fuer ein frisches Projekt ohne Stock-Log funktionieren.
- Das kanonische Modul-SQL ist keine produktive Transition; der Live-Cutover nutzt ein gezieltes, separates Transition-SQL.
- `sql/16_Explicit_Grants.sql` darf nach dem Tabellen-Drop nicht mehr auf `health_medication_stock_log` verweisen.
- Die interne Cleanup-Funktion ist kein User-Data-API-RPC:
  - kein `anon`- oder `authenticated`-Execute-Grant.
  - keine neue UI- oder Assistant-Aktion.
- Supabase Cron verwendet `pg_cron`; Jobs werden nur ueber dokumentierte APIs oder das Dashboard verwaltet, nicht durch direkte Writes auf `cron.job`.
- Der Cleanup-Cutoff wird mit Wiener Medication-Tagessemantik geprueft. Eine geplante Ausfuehrung in den fruehen Morgenstunden muss UTC-/Sommerzeit-Drift vermeiden.
- Normale Autovacuum-Prozesse duerfen geloeschten Platz wiederverwendbar machen; `VACUUM FULL` bleibt eine separate, blockierende Ausnahmeaktion.

## Ziel-Datenmodell und Retention-Vertrag

| Objekt | Zielvertrag | Aufbewahrung |
| --- | --- | --- |
| `health_medications` | Stammdaten, aktueller Bestand, Low-Stock und Aktivstatus | dauerhaft bis User-Loeschung |
| `health_medication_schedule_slots` | aktuelle, kuenftige und fuer den Beobachtungszeitraum benoetigte Plaene | bedarfsgerecht |
| `health_medication_slot_events` | dokumentierte Einnahmen pro Slot und Tag inklusive tatsaechlich angewandter Bestandsreduktion fuer exaktes Undo | rollendes Kalenderjahr |
| `health_medication_stock_log` | kein Zielobjekt mehr | Tabelle wird entfernt |
| Monats-/Jahresaggregate | nicht Teil des Zielmodells | keine Persistenz |

Cutoff-Vertrag:

- Erhalten werden Events mit `day >= (Wiener Tagesdatum - interval '1 year')`.
- Geloescht werden Events mit `day < (Wiener Tagesdatum - interval '1 year')`.
- Der Grenztag bleibt enthalten.
- Beendete Slots duerfen erst geloescht werden, wenn ihr `end_date` vor dem Cutoff liegt und kein erhaltenes Event sie benoetigt.
- Aktuelle und zukuenftige Slots werden niemals durch den Retention-Job geloescht.
- Der Clean-Start-Stichtag wird beim produktiven Cutover als konkretes Datum dokumentiert.

## Tool Permissions

Allowed:

- Lesen aller Medication-, Intake-, Push-, Widget-, Report-, SQL- und Doku-Pfade.
- Lokale statische Scans mit `rg`, PowerShell, `git diff`, `git diff --check` und verfuegbaren Markdown-Checks.
- Nach abgeschlossenem S4 Readiness Review:
  - Aendern der in Scope genannten SQL- und Doku-Dateien.
  - Anlegen des idempotenten Retention-SQLs.
  - Anlegen des einmaligen Transition-SQLs.
- Nach expliziter User-Freigabe:
  - read-only Live-Inventar und Groessenabfragen.
  - produktive SQL-Ausfuehrung im Supabase SQL Editor oder ueber ein freigegebenes Tool.
  - Supabase Cron aktivieren oder konfigurieren.
  - Live-Smokes mit Testwrites und anschliessender Bereinigung.

Forbidden:

- Produktive SQL-Ausfuehrung waehrend S1-S4 ohne gesonderte Freigabe.
- `drop table`, `delete`, `truncate`, Cron- oder Extension-Aenderungen ohne unmittelbare User-Freigabe.
- `drop ... cascade` fuer den Stock-Log.
- Pauschales Loeschen aller Medication-Stammdaten.
- Loeschen aktueller oder zukuenftiger Schedule-Slots ohne bestaetigten Migrationsplan.
- RLS-Lockerung oder neue `anon`-Rechte.
- Service-Role-Secrets in Doku, Logs oder Antworten ausgeben.
- Retention auf andere Gesundheitsdaten ausweiten.
- Fremde Worktree-Aenderungen revertieren.

## Deploy- und Runtime-Status

| Feld | Wert |
| --- | --- |
| Lokale Codeaenderung | `nur Roadmap; SQL/Doku in S4 geplant` |
| Lokale Checks | `Roadmap-Initialreview erledigt; Implementierungschecks offen` |
| Supabase Deploy | `offen, user-gated` |
| Supabase SQL Apply | `offen, user-gated` |
| Supabase Cron | `offen, user-gated` |
| GitHub Workflow-Smoke | `nicht relevant` |
| Browser-/Device-Smoke | `offen nach produktivem SQL` |
| Produktive Schreibwirkung | `ja, destruktiver Clean Start und Retention` |
| Letzter Remote-Nachweis | `none` |

## Execution Mode

- Sequenziell arbeiten: `S1` bis `S6`.
- `S1` bis `S3` sind reine Detektivarbeit und Contract Review.
- Nach `S3` folgt ein expliziter S4 Readiness Review.
- `S4` wird substepweise umgesetzt; jeder Substep endet mit Code-/SQL- und Contract Review sowie Findings-Korrektur.
- S4 erzeugt lokale, reviewbare SQL-Artefakte, fuehrt aber noch keine produktive Loeschung aus.
- `S5` trennt strikt:
  - lokale Checks.
  - read-only Live-Preflight.
  - user-gated produktive Migration.
  - Browser-/Device-/Push-Smokes.
- `S6` synchronisiert Doku und QA, dokumentiert den echten Cutover und schliesst die Roadmap ab.
- Optionaler CodeRabbit Review erfolgt nach lokal gruenem S5-Stand und vor produktivem SQL, sofern der User ihn wuenscht.

## Modell- und Reasoning-Routing

- Offizielle Grundlage: `https://developers.openai.com/api/docs/guides/latest-model` und `https://developers.openai.com/api/docs/models/gpt-5.6-sol`.
- GPT-5.6 Sol bleibt fuer alle Hauptschritte und S4-Substeps das feste Modell dieser Roadmap.
- Nur die Reasoning-Stufe wird vor jedem kompletten Hauptschritt beziehungsweise vor jedem S4-Substep passend zu Arbeitsaufwand, Risiko und Review-Tiefe gewaehlt.
- Die Empfehlung ist ein Arbeits- und Verbrauchsvertrag, kein fachliches Exit-Kriterium und keine automatische Modellumschaltung.
- Es wird die niedrigste fuer das jeweilige Risiko belastbare Reasoning-Stufe verwendet:
  - Medium fuer eng begrenzte, deterministische Scan-, Transformations- und Doku-Arbeit.
  - High fuer Implementierung, Cross-Contract-Review, Security, medizinische Logik und produktionsnahe Tests.
  - Extra High fuer den einmaligen destruktiven Transition-Knoten mit Locks, Preconditions und Rollback-Vertrag.
- Terra und Luna bleiben gueltige GPT-5.6-Varianten fuer andere Workloads, werden innerhalb dieser validierungsnahen MIDAS-Roadmap aber nicht zum Verbrauchsoptimieren gewechselt.
- GPT-5.5 High ist kein regulaerer Roadmap-Schritt; es bleibt Fallback oder unabhaengige Zweitmeinung, falls ein GPT-5.6-Modell auffaellig scheitert oder nicht verfuegbar ist.
- Max und Ultra sind nicht regulaer eingeplant:
  - Max nur fuer einen einzelnen ungeloesten harten P0-Knoten, bei dem Sol Extra High keine belastbare Loesung erreicht.
  - Ultra nur fuer einen optionalen, klar parallelisierbaren Red-Team-Sweep; nicht fuer den sequenziellen Standardablauf dieser Roadmap.
- Unerwartete neue P0/P1-Mehrdeutigkeit darf vor dem Coding eine Eskalation um genau eine Reasoning-Stufe ausloesen; die Eskalation und ihr Grund werden im Ergebnisprotokoll dokumentiert.

## Skalierung der Roadmap

Diese Roadmap ist trotz engem Produktziel eine vollstaendige S1-S6-Roadmap, weil sie betrifft:

- produktive Gesundheitsdaten.
- destruktive Datenbereinigung.
- SQL/RLS/Grants.
- mehrere atomare RPCs.
- automatische Hintergrundwartung.
- Push-, Widget- und Realtime-Vertraege.

Die Detektivarbeit darf kompakt bleiben, aber kein Hauptschritt wird uebersprungen.

## Statusmatrix

| ID | Schritt | Status | Ergebnis/Notiz |
| --- | --- | --- | --- |
| S1 | System- und Vertragsdetektivarbeit | DONE | Datenmodell, Consumer, Live-Iststand und Supabase-Cron-Vertrag deterministisch bestaetigt; Contract Review ohne offenen S1-Blocker. |
| S2 | Fachlicher/technischer Contract Review | DONE | Zielmodell, Bestandsinversion, Clean Start, Cutoff, Retention, Cron und Reset-Payload finalisiert; Findings korrigiert. |
| S3 | Bruchrisiko-, Security- und Umsetzungsreview | DONE | Drop-Abhaengigkeiten, Lock-/Cutover-Reihenfolge, Push-Fenster, Retention-Rechte, Provisioning und Smokes abgesichert. |
| S4 | Umsetzung | DONE | S4.1-S4.10 inklusive Gesamt-Code-/SQL-/Security-/Doku-Review und Findings-Korrektur abgenommen. |
| S5 | Tests, Live-Migration und Contract Review | DONE | Lokale/disposable Tests, produktiver Clean Start, Grants, Retention/Cron, Packungsabgleich, transaktionaler RPC-Smoke, echter PWA-Confirm, Incident-Dry-Run und Android-Statusuebernahme gruen. |
| S6 | Doku-Sync, QA-Update und finaler Abschlussreview | DONE | Medication Overview, QA, SQL-Betriebsdoku, Future Notes, Ergebnisprotokoll und finaler Produktivvertrag synchronisiert und geprueft. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Finding-Klassifizierung

| ID | Severity | Typ | Status | Entscheidung / Zielschritt |
| --- | --- | --- | --- | --- |
| `MDH-F1` | `P1` | `Datenmodell` | `implemented-in-s4.5` | Stock-Log ist aus kanonischem SQL und Grants entfernt; produktiver Drop bleibt user-gated in S5. |
| `MDH-F2` | `P0` | `Runtime` | `implemented-in-s4.5` | Alle aktiven RPCs und Grants sind vor dem geplanten Drop stock-log-frei; ausfuehrbarer Nachweis folgt in S5. |
| `MDH-F3` | `P1` | `Datenintegritaet` | `implemented-in-s4.5` | Es wird keine Ersatzhistorie aufgebaut oder migriert; kanonisches SQL kennt nur noch den aktuellen Bestand und die begrenzten Slot-Events. |
| `MDH-F4` | `P1` | `Retention` | `implemented-in-s4.6` | Cleanup loescht Events strikt vor dem Wiener Jahres-Cutoff und danach nur entbehrliche beendete Slots; ausfuehrbarer Nachweis folgt in S5. |
| `MDH-F5` | `P1` | `Fachvertrag` | `contract-finalized-in-s2` | Fehlende Events werden als `nicht dokumentiert`, nicht als sicher `vergessen` bezeichnet; `S2/S6`. |
| `MDH-F6` | `P0` | `Migration` | `implemented-in-s4.8` | Transition bricht bei einem bereits bestaetigten Slot am Wiener Stichtag ab und dokumentiert den neuen Beobachtungsbeginn; Live-Nachweis folgt in S5. |
| `MDH-F7` | `P1` | `Datenintegritaet` | `implemented-in-s4.1-s4.3` | Kanonischer Bestands-Check und fachliche Adjust-Unterlaufpruefung sind lokal umgesetzt; ausfuehrbarer Nachweis folgt in S5. |
| `MDH-F8` | `P1` | `Security` | `implemented-in-s4.6` | Interne Cleanup-Funktion ist `SECURITY INVOKER` und besitzt kein Execute fuer `PUBLIC`, `anon`, `authenticated` oder `service_role`; ACL-Nachweis folgt in S5. |
| `MDH-F9` | `P1` | `Provisioning` | `implemented-in-s4.5` | Stock-Log-Rechte sind entfernt; Rechte der drei verbleibenden Tabellen und elf externen Medication-RPCs bleiben erhalten. |
| `MDH-F10` | `P2` | `Operations` | `implemented-in-s4.7` | Cron ist eindeutig benannt, owner-sicher idempotent verwaltet und besitzt Vorher-/Nachher-Guards gegen Doppeljobs; Live-Nachweis folgt in S5. |
| `MDH-F11` | `P1` | `Low Stock` | `implemented-in-s4.8` | Transition leert beide Low-Stock-Acknowledgement-Felder des Zielnutzers und beweist den Endzustand; Live-Nachweis folgt in S5. |
| `MDH-F12` | `P1` | `Migration` | `implemented-in-s4.8` | Das gezielte einmalige Transition-SQL ist vom kanonischen Fresh-Project-SQL getrennt; produktive Ausfuehrung bleibt S5. |
| `MDH-F13` | `P1` | `Schema-Drift` | `implemented-in-s4.1` | Der produktive `stock_count >= 0`-Check ist im Fresh-Project-Vertrag und im idempotenten Existing-Project-Pfad gespiegelt; Nachweis folgt in `S5`. |
| `MDH-F14` | `P1` | `Operations` | `implemented-locally-in-s4.7` | Idempotente Extension-Aktivierung und Jobanlage sind im user-gated Betriebs-SQL vorbereitet; produktive Installation bleibt S5. |
| `MDH-F15` | `P2` | `Retention` | `implemented-in-s4.7` | Cleanup begrenzt abgeschlossene Laufdetails der eindeutig provisionierten aktuellen Medication-Job-ID auf 90 Tage; Live-Nachweis folgt in S5. |
| `MDH-F16` | `P2` | `API-Vertrag` | `implemented-in-s4.4` | `deleted_stock_logs` ist aus dem Reset-Ergebnis entfernt; die drei realen Loeschzaehler bleiben und der ausfuehrbare Nachweis folgt in S5. |
| `MDH-F17` | `P0` | `Migration` | `implemented-in-s4.8` | Transition gruppiert gueltige Plaene vor jeder Aenderung nach Nutzer, Medication und `sort_order` und bricht bei Mehrdeutigkeit vollstaendig ab; Fixture-Nachweis folgt in S5. |
| `MDH-F18` | `P2` | `Doku-Vertrag` | `prepared-in-s4.9` | Future Notes bleiben als klar markierte historische Entscheidungsgrundlage erhalten; aktive Source of Truth wird erst nach Live-Cutover in S6 final stock-log-frei. |
| `MDH-F19` | `P0` | `Bestandsintegritaet` | `implemented-in-s4.2` | Confirm speichert die tatsaechliche Bestandsreduktion und Undo stellt exakt diesen Wert wieder her; ausfuehrbarer Grenzfallnachweis folgt in S5. |
| `MDH-F20` | `P0` | `Migration` | `implemented-in-s4.8` | Transition beweist einen gemeinsamen, explizit gesetzten Zielnutzer und Owner-Konsistenz bis in Slots, Events und Stock-Log, bevor der projektweite Drop zulaessig ist. |
| `MDH-F21` | `P0` | `Concurrency` | `implemented-in-s4.8` | Vier `ACCESS EXCLUSIVE`-Locks in fester Reihenfolge sowie erneuter Preflight verhindern parallele Medication-Teilwirkung; Lock-/Rollback-Nachweis folgt in S5. |
| `MDH-F22` | `P1` | `Security` | `implemented-in-s4.6` | Retention ist `SECURITY INVOKER`, nutzt festen `search_path` und entzieht Execute explizit fuer `PUBLIC`, `anon`, `authenticated` und `service_role`; produktiver ACL-Nachweis folgt in S5. |
| `MDH-F23` | `P1` | `Reminder` | `implemented-in-s4.8` | Nach Lock-Erwerb werden Wiener Datum, Uhrzeit vor `10:00`, fehlender Tages-Confirm und fehlende persistierte Medication-Push-Zustellung erneut geprueft. |
| `MDH-F24` | `P1` | `Provisioning` | `verified-and-extended-in-s5` | Schedule-Upsert, Confirm, Undo, Adjust, Set und Reset sind mechanisch normalisiert identisch zwischen Transition und `sql/12_Medication.sql`; disposable Nachweis ist gruen. |
| `MDH-F25` | `P1` | `Umsetzungsreihenfolge` | `verified-and-extended-in-s5` | Alle sechs produktiv relevanten RPC-Ersetzungen werden vor dem Stock-Log-Drop provisioniert; die disposable Gesamtsequenz ist gruen. |
| `MDH-F26` | `P1` | `Idempotenz` | `refined-in-s4.10` | Spalte und Constraints besitzen Fresh- und Existing-Project-Pfade; Constraints werden bei Wiederholung auf ihre exakte Definition konvergiert, Bootstrap-/Rerun-Nachweis folgt in S5. |
| `MDH-F27` | `P1` | `Artefaktreihenfolge` | `implemented-in-s4.6` | `sql/17_Medication_Retention.sql` existiert mit Extension, Index und Funktion vor der getrennten Cron-Registrierung in S4.7. |
| `MDH-F28` | `P1` | `Verifikation` | `verified-and-refined-in-s5` | Medication-Fresh-Bootstrap, exakter Medication-Grant-Abschnitt und Retention sind inklusive Rerun gruen; das globale `16` bleibt gemaess `sql/HOW_TO.md` an den vollstaendigen MIDAS-Objektbestand gebunden. |
| `MDH-F29` | `P1` | `Abnahmevertrag` | `implemented-in-s4.9` | Overview, Future Notes und QA sind als Pending-/historische Vorbereitung synchronisiert; der verbindliche produktive Source-of-Truth-Sync bleibt S6. |
| `MDH-F30` | `P2` | `Robustheit` | `fixed-in-s4.3` | Direkte Integer-Addition in Adjust konnte vor einer kontrollierten Zielwertpruefung ueberlaufen; Berechnung erfolgt nun als `bigint` mit explizitem Integer-Grenzcheck. |
| `MDH-F31` | `P1` | `Abnahmevertrag` | `implemented-in-s4.8` | Nur das einmalige Transition-SQL referenziert den Stock-Log noch fuer Locks, Preconditions, Diagnose und den Drop ohne `cascade`; kanonisches und operatives SQL bleiben frei davon. |
| `MDH-F32` | `P2` | `Operations-Copy` | `refined-in-s4.7` | Der Header trennt Provisionierung und spaetere Loeschwirkung sowie Existing-Project-Cutover und Fresh-/Disposable-Bootstrap; automatische App-Ausfuehrung bleibt ausgeschlossen. |
| `MDH-F33` | `P1` | `Cron-Ownership` | `fixed-in-s4.7` | Benannte Job-Idempotenz ist owner-bezogen und `cron.job` owner-gefiltert; Provisioning verlangt deshalb RLS-Bypass, prueft globale Eindeutigkeit und Owner sowie das Ausfuehrungsrecht der Job-Rolle vor der Anlage. |
| `MDH-F34` | `P1` | `Cutover-Stichtag` | `fixed-in-s4.8` | Ein beim Schreiben fest codiertes Datum koennte bis S5 veralten; Transition ermittelt den Wiener Stichtag einmal beim freigegebenen Lauf, validiert ihn nach Lock-Erwerb erneut und gibt ihn als Ergebnis aus. |
| `MDH-F35` | `P1` | `Doku-Timing` | `fixed-in-s4.9` | Eine sofortige Umschreibung des Medication Overviews auf den Zielzustand haette den noch produktiven Altvertrag falsch dargestellt; ein Pending-Block trennt lokale Vorbereitung, S5-Cutover und finalen S6-Sync. |
| `MDH-F36` | `P1` | `Constraint-Konvergenz` | `fixed-in-s4.10` | Ein reiner Constraint-Namensguard konnte eine falsche gleichnamige Definition erhalten; beide neuen Checks werden nun transaktional entfernt und mit der kanonischen Definition neu angelegt. |
| `MDH-F37` | `P2` | `Undo-Robustheit` | `fixed-in-s4.10` | Undo konnte nach einem zwischenzeitlichen manuellen Set auf den maximalen Integer-Bestand roh ueberlaufen; Bigint-Berechnung und Guard liefern nun kontrolliert `22003` ohne Event-Teilwirkung. |
| `MDH-F38` | `P1` | `Tooling` | `fixed-in-s5` | Die installierte Supabase-CLI enthielt nur den Shim und kein `supabase-go.exe`; beide offiziellen v2.109.1-Binaries wurden hash-verifiziert gemeinsam installiert und reale CLI-Befehle funktionieren. |
| `MDH-F39` | `P1` | `Bootstrap-Syntax` | `fixed-in-s5` | Zwei fehlerhafte Kommentarzeilen in `sql/01_Health Schema.sql` waren als SQL interpretierbar und blockierten einen frischen Baseline-Aufbau; beide besitzen nun gueltige `--`-Marker. |
| `MDH-F40` | `P1` | `Bootstrap-Abhaengigkeit` | `fixed-in-s5` | `sql/12_Medication.sql` erwartete den Trigger-Helper versteckt aus `06_Security.sql`; die identische gehärtete Helper-Definition wird nun idempotent im kanonischen Medication-SQL provisioniert. |
| `MDH-F41` | `P1` | `Testvertrag` | `fixed-in-s5` | `sql/16_Explicit_Grants.sql` ist laut `sql/HOW_TO.md` kein leerer Standalone-Bootstrap; S5 prueft lokal den mechanisch extrahierten Medication-Abschnitt und produktiv das vollstaendige SQL gegen den MIDAS-Vollbestand. |
| `MDH-F42` | `P0` | `Schedule-Runtime` | `fixed-and-verified-in-s5` | `WITH ORDINALITY` lieferte `bigint`, waehrend `_med_infer_slot_type` `int` erwartet; expliziter Cast und sechste Transition-RPC-Ersetzung reparieren Fresh- und Produktivpfad. |
| `MDH-F43` | `P2` | `Performance` | `fixed-and-verified-in-s5` | Der zusammengesetzte Event-FK `(slot_id, med_id)` besass keinen passenden fuehrenden Index; Fresh-SQL und Transition legen `idx_medication_slot_events_slot_med` an. |
| `MDH-F44` | `P1` | `Lokale Sicherheit` | `fixed-in-s5` | Docker Desktop publizierte lokale Supabase-Ports trotz isoliertem Netzwerk auf `0.0.0.0`; eine Windows-Firewall-Regel blockiert Remote-Inbound fuer `54320-54329`, waehrend Loopback verifiziert bleibt. |
| `MDH-F45` | `P2` | `Review-Fehlalarm` | `closed-in-s5` | CodeRabbit vermutete einen fehlenden Unique-Vertrag fuer den zusammengesetzten Event-FK; der bereits vorhandene eindeutige Index `uq_medication_schedule_slot_id_med` deckt exakt `(id, med_id)` ab. Kein redundanter Constraint wurde angelegt. |
| `MDH-F46` | `P2` | `Copy-Vertrag` | `fixed-in-s5-s6` | Die Anweisung, erhaltene Bestaende zwingend neu zu setzen, war zu streng. Verbindlich ist der physische Abgleich mit Korrektur nur bei Abweichung; produktiv waren `133 / 36 / 36` bereits korrekt. |
| `MDH-F47` | `P1` | `Doku-Drift` | `fixed-in-s6` | Medication Overview, QA und Future Notes beschrieben nach dem Cutover noch den vorbereiteten Alt-/Pending-Stand. S6 synchronisiert alle aktiven Source-of-Truth-Dokumente auf den produktiven Drei-Tabellen- und Retention-Vertrag. |

Severity-Vertrag:

- `P0`: kann produktiv Daten verlieren, Writes brechen oder falsche Medication-Zustaende erzeugen; blockiert den naechsten risikoreichen Schritt.
- `P1`: echter Contract-, Runtime-, Security- oder Datenintegritaetsbefund; muss in dieser Roadmap adressiert werden.
- `P2`: Hygiene oder Betriebsrobustheit ohne akuten Runtime-Blocker.
- `Watchlist`: erkannt, aber bewusst nicht Teil dieser Roadmap.

---

## S1 - System- und Vertragsdetektivarbeit

Empfohlenes Modell / Reasoning: `GPT-5.6 Sol / High`.

Ziel:

- Den aktuellen Medication-Datenfluss und alle Abhaengigkeiten vollstaendig bestaetigen.
- Noch keinen SQL-, Code- oder Live-Datenbestand aendern.

Substeps:

- S1.1 `README.md`, `docs/DEV_ENVIRONMENT.md` und `sql/HOW_TO.md` lesen.
- S1.2 relevante Module Overviews lesen:
  - Medication.
  - Intake.
  - Push.
  - Android Widget.
  - Reports und Doctor View.
- S1.3 historische Entscheidungen lesen:
  - Multi-Dose Roadmap.
  - Incident Push Roadmap.
  - Supabase Explicit Grants Roadmap.
  - Medication Future Notes.
- S1.4 `sql/12_Medication.sql` objektweise inventarisieren:
  - Tabellen und Foreign Keys.
  - Indizes.
  - RLS/Policies.
  - RPC-Reader und -Writer.
  - atomare Transaktionsgrenzen.
- S1.5 `sql/16_Explicit_Grants.sql` und Data-API-Vertrag inventarisieren.
- S1.6 alle aktiven Consumer per `rg` und gezieltem Lesen mappen:
  - Stock-Log-Reader und -Writer.
  - Slot-Event-Reader und -Writer.
  - Schedule-Reader und -Writer.
  - Realtime-Tabellen.
- S1.7 Supabase-Vertrag aktuell pruefen:
  - Changelog auf relevante Breaking Changes.
  - Cron-/`pg_cron`-Verwaltung.
  - Database-Size-/Autovacuum-Verhalten.
- S1.8 read-only Live-Preflight vorbereiten und nur nach Freigabe ausfuehren:
  - Zeilenzahl und Groesse der vier Medication-Tabellen.
  - aeltestes/neuestes Slot-Event.
  - aktuelle, historische und zukuenftige Schedule-Slots.
  - negativer `stock_count` oder andere Constraint-Verletzungen.
  - bestehende Cron-Extension und Medication-Jobs.
- S1.9 Systemkarte, bestehende Vertraege und erste Findings dokumentieren.
- S1.10 Contract Review S1 gegen Scope und Guardrails.
- S1.11 Findings korrigieren und Schritt-Abnahme dokumentieren.

Output:

- Vollstaendige Medication-Systemkarte.
- Bestaetigte Reader-/Writer-Liste.
- Bestaetigter Live-Iststand oder klar dokumentierte user-gated Nichtausfuehrung.
- Keine offenen Abhaengigkeitsfragen fuer S2.

Exit-Kriterium:

- Es ist bewiesen, welche Objekte, RPCs, Grants und Consumer durch Stock-Log-Entfernung, Clean Start und Retention betroffen sind.

## S2 - Fachlicher/technischer Contract Review

Empfohlenes Modell / Reasoning: `GPT-5.6 Sol / High`.

Ziel:

- Den finalen Daten-, Retention-, Bestands- und Beobachtungsvertrag festlegen.

Substeps:

- S2.1 Ziel gegen README- und Medication-Guardrails pruefen.
- S2.2 Ziel-Datenmodell bestaetigen:
  - Stammdaten dauerhaft.
  - aktueller Bestand ohne Historie.
  - Schedule-Slots bedarfsgerecht.
  - Slot-Events ein Kalenderjahr und mit dokumentierter Dosis plus `stock_decrement_qty` fuer die tatsaechlich angewandte Bestandsreduktion.
  - kein Stock-Log.
- S2.3 Bestandsvertrag definieren:
  - Confirm bleibt auch bei einem zu niedrigen getrackten Bestand erlaubt und reduziert den Bestand hoechstens bis `0`.
  - Confirm speichert im Event getrennt die dokumentierte Dosis und `stock_decrement_qty` als tatsaechlich angewandte Bestandsreduktion.
  - Undo stellt exakt das im Event gespeicherte `stock_decrement_qty` wieder her, nicht blind die volle Dosis.
  - Adjust unter `0` wird klar abgewiesen, nicht still akzeptiert.
  - Set auf denselben Wert ist ein erfolgreicher No-op.
  - Restock/Set/Adjust erzeugen keinen Verlauf.
- S2.4 Beobachtungszeitraum definieren:
  - Wiener Kalendertag.
  - ein Kalenderjahr rueckwaerts.
  - Grenztag inklusive.
  - Copy `dokumentiert` / `nicht dokumentiert`.
- S2.5 Clean-Start-Vertrag definieren:
  - das Projekt muss fuer Medication-Stammdaten, Slots und Events genau einen gemeinsamen Owner besitzen; andernfalls Abbruch vor jeder Aenderung.
  - Medication-Stammdaten bleiben.
  - alle am Stichtag gueltigen Plaene werden mit unveraendertem Slot-Inhalt auf den Stichtag rebased.
  - erst nach dem Stichtag beginnende zukuenftige Plaene bleiben unveraendert.
  - inaktive Plaene mit `start_date <= Stichtag` werden als nicht operative Altplaene entfernt.
  - alte Slot-Events werden geloescht.
  - alte beendete Plaene werden geloescht.
  - `low_stock_ack_day` und `low_stock_ack_stock` werden fuer den Zielnutzer geleert.
  - Bestaende werden manuell neu gesetzt.
  - konkrete Stichtagsdokumentation.
- S2.6 Retention-Vertrag definieren:
  - interne Cleanup-Funktion.
  - Reihenfolge Events vor Slots.
  - keine anderen Tabellen.
  - idempotentes Ergebnis und Rueckgabediagnose.
- S2.7 Cron-Vertrag definieren:
  - genau ein Job mit dem Namen `midas-medication-retention-daily`.
  - taeglich um `03:15 UTC`; damit liegen UTC- und Wiener Kalendertag ganzjaehrig auf demselben Datum.
  - SQL/Funktionsaufruf direkt in Postgres.
  - keine Edge Function und kein GitHub Workflow.
  - user-gated Installation von `pg_cron`, weil die Extension produktiv noch fehlt.
  - `cron.job_run_details` dieses Jobs werden fuer 90 Tage erhalten; aeltere abgeschlossene Laeufe derselben aktuellen Job-ID werden geloescht.
  - keine Laufdetails fremder Cron-Jobs werden veraendert.
- S2.8 Reset-Rueckgabevertrag nach Entfernung des Stock-Logs festlegen:
  - `deleted_stock_logs` wird bewusst aus dem JSON-Ergebnis entfernt.
  - erhalten bleiben `deleted_slot_events`, `deleted_schedule_slots` und `deleted_medications`.
  - es gibt keinen aktiven Consumer des entfernten Keys.
- S2.9 Contract Review S2.
- S2.10 Findings korrigieren und Schritt-Abnahme dokumentieren.

Output:

- Belastbarer Zielvertrag ohne offene Produktentscheidung.
- Exakte Datenklassen und Cutoff-Semantik.
- Finaler Clean-Start- und Cron-Vertrag.

Exit-Kriterium:

- S3 kann konkrete Bruchrisiken und eine sichere SQL-Reihenfolge ableiten.

## S3 - Bruchrisiko-, Security- und Umsetzungsreview

Empfohlenes Modell / Reasoning: `GPT-5.6 Sol / High`.

Ziel:

- Vor dem ersten SQL-Patch alle Datenverlust-, Runtime-, Reminder- und Security-Risiken pruefen.

Substeps:

- S3.1 Drop-Abhaengigkeiten pruefen:
  - alle PL/pgSQL-Referenzen.
  - Grants und Policies.
  - Reset-Funktion.
  - Kommentare, Indizes und Doku.
  - Views, Materialized Views, Trigger, Realtime-Publikationen sowie ein- und ausgehende Foreign Keys.
- S3.2 Clean-Start-Reihenfolge pruefen:
  - Backup/Snapshot.
  - kurze Transaktion mit lokalem Lock-/Statement-Timeout.
  - feste exklusive Lock-Reihenfolge fuer Medication-Stammdaten, Schedule-Slots, Slot-Events und Stock-Log.
  - alle Precondition-Abfragen nach Lock-Erwerb erneut ausfuehren.
  - vor jeder Aenderung beweisen, dass alle Medication-Stammdaten, Slots und Events genau einem gemeinsamen Zielnutzer gehoeren; sonst vollstaendiger Abbruch.
  - bestehende Slot-Events kontrolliert loeschen und `stock_decrement_qty` ergaenzen.
  - danach alle fuenf RPCs stock-log-frei ersetzen, bevor die Tabelle entfernt wird.
  - vor dem Rebase beweisen, dass je Zielnutzer, Medication und `sort_order` hoechstens ein am Stichtag gueltiger Plan existiert; bei Mehrdeutigkeit ohne Aenderung abbrechen.
  - historische Slots bereinigen.
  - am Stichtag gueltige Plaene auf den Stichtag rebasen.
  - erst spaeter beginnende zukuenftige Plaene unveraendert erhalten.
  - alte Low-Stock-Acknowledgements leeren.
  - Stock-Log ohne `cascade` entfernen.
  - Bestaende neu setzen.
  - Daten- und Schemaaenderungen des Transition-SQLs in einer kurzen, kontrollierten Transaktion ausfuehren.
- S3.3 Tages- und Push-Risiko pruefen:
  - Cutover vor der ersten Einnahmebestaetigung des Stichtags.
  - Cutover vor der ersten Medication-Reminder-Schwelle um `10:00 Europe/Vienna`.
  - keine bereits persistierte Medication-Push-Zustellung am Stichtag.
  - keine spaete Tagesloeschung, die Medication wieder faelschlich oeffnet.
  - PWA neu laden sowie Incident-Push und Widget unmittelbar nach Cutover aktualisieren.
- S3.4 Retention-SQL pruefen:
  - Foreign-Key-Reihenfolge.
  - Cutoff-Grenzen.
  - passende `day`-Indexreihenfolge.
  - kurze Transaktion.
  - mehrfaches Ausfuehren.
  - 90-Tage-Grenze der eigenen abgeschlossenen Cron-Laufdetails ohne Zugriff auf fremde Jobs.
- S3.5 Security-/Grant-Vertrag pruefen:
  - RLS bleibt aktiv.
  - interne Cleanup-Funktion als `SECURITY INVOKER` mit festem `search_path`.
  - `EXECUTE` explizit fuer `PUBLIC`, `anon`, `authenticated` und `service_role` entziehen; nur der Datenbank-Owner/Cron-Pfad darf ausfuehren.
  - kein Stock-Log in Explicit Grants.
  - kein `drop ... cascade`.
- S3.6 Provisioning-Strategie festlegen:
  - `sql/12_Medication.sql` als kanonisches frisches Datenmodell.
  - `sql/16_Explicit_Grants.sql` als synchroner Grant-Vertrag.
  - `sql/17_Medication_Retention.sql` als idempotentes Betriebs-SQL.
  - `sql/transition_medication_clean_start.sql` als einmalige, destruktive und user-gated Transition.
  - das vollstaendige `sql/12_Medication.sql` wird nicht als produktive Live-Migration ausgefuehrt.
  - die im Transition-SQL duplizierten finalen Definitionen von Confirm, Undo, Adjust, Set und Reset muessen semantisch mit `sql/12_Medication.sql` identisch sein.
- S3.7 S4-Substeps und S5-Smokes final gegen alle Findings pruefen.
- S3.8 Contract Review S3.
- S3.9 Findings korrigieren und Schritt-Abnahme dokumentieren.

Output:

- Gepruefte Ausfuehrungsreihenfolge.
- Vollstaendige Bruchrisiko-Liste.
- Finale SQL-Dateistrategie.
- Definierte lokale und produktive Smokes.

Exit-Kriterium:

- Kein P0-Finding ist offen und S4 kann ohne Produktivwirkung starten.

## S4 Readiness Review - Gate nach S3, vor S4

Empfohlenes Modell / Reasoning: `GPT-5.6 Sol / High`.

Ziel:

- Unmittelbar vor der Umsetzung pruefen, ob S4 nach S1-S3 noch vollstaendig und richtig sortiert ist.

Prueffragen:

- Ist jeder Stock-Log-Verweis einem S4-Substep zugeordnet?
- Ist der kanonische Fresh-Project-Vertrag getrennt vom einmaligen Live-Cutover?
- Kann `sql/12_Medication.sql` nach der Aenderung auf einer leeren Datenbank ohne Stock-Log laufen?
- Beweist S5 einen leeren Bootstrap mit `12 + 16 + 17` und einen fehlerfreien zweiten Lauf?
- Kann `sql/16_Explicit_Grants.sql` nach dem Drop fehlerfrei laufen?
- Ist das Transition-SQL gegen versehentliche Wiederholung sichtbar abgesichert?
- Ist vor dem projektweiten Stock-Log-Drop ein gemeinsamer Single-Owner fuer Medication-Stammdaten, Slots und Events bewiesen?
- Werden alle vier Medication-Tabellen vor dem finalen Preflight in fester Reihenfolge gesperrt und bei Lock-Timeout ohne Teilwirkung freigegeben?
- Werden am Stichtag gueltige Plaene exakt auf den Stichtag rebased und spaeter beginnende Plaene unveraendert erhalten?
- Ist vor dem Rebase eine kollisionsfreie Zuordnung gegen den Schedule-Unique-Vertrag bewiesen?
- Werden alte Low-Stock-Acknowledgements beim Clean Start geleert?
- Ist der Cutoff in Wiener Datumsemantik eindeutig?
- Ist die Cleanup-Funktion nicht per Data API fuer normale User exponiert?
- Sind `SECURITY INVOKER`, fester `search_path` und explizite Execute-Revokes fuer `PUBLIC`, `anon`, `authenticated` und `service_role` festgelegt?
- Ist der Cron-Job eindeutig benannt und gegen Duplikate abgesichert?
- Liegt der Cutover vor dem ersten Confirm, vor `10:00 Europe/Vienna` und vor jeder Medication-Push-Zustellung des Stichtags?
- Decken S5-Smokes Confirm, Doppel-Confirm, Undo, Adjust, Set, Restock, Push, Widget und Retention ab?
- Bleiben produktive SQL-Ausfuehrung und Cron-Aktivierung user-gated?

Ergebnis:

- Gate-Status: `PASS nach Roadmap-Korrekturen`.
- Alle Stock-Log-Referenzen sind einem konkreten S4-Substep zugeordnet.
- Fresh-Project-SQL, Explicit Grants, idempotentes Betriebs-SQL und einmalige Live-Transition bleiben getrennte Artefakte.
- S4 wurde neu sortiert, damit der Stock-Log erst entfernt wird, nachdem alle fuenf RPC-Referenzen bereinigt sind.
- Bestehende Installationen erhalten fuer neue Spalten und Constraints explizite idempotente Konvergenzpfade.
- `sql/17_Medication_Retention.sql` wird angelegt, bevor Funktion und Cron-Vertrag darin aufgebaut werden.
- Single-Owner-, Lock-, Rebase-, Reminder-, ACL-, Cron- und RPC-Identitaetsvertraege sind in S4 und S5 pruefbar verankert.
- Produktive SQL-Ausfuehrung, Extension-Aktivierung, Cutover und Smokes mit Schreibwirkung bleiben user-gated.

Exit-Kriterium:

- S4 kann starten, ohne dass Dateistrategie, Abhaengigkeit, Reihenfolge oder Pflichtcheck unklar ist.

## S4 - Umsetzung

Modell bleibt `GPT-5.6 Sol`; Reasoning wird fuer jeden Substep separat gewaehlt.

Ziel:

- Den Zielvertrag lokal und substepweise implementieren, ohne produktive Daten vor S5 zu veraendern.

### S4.1 Kanonische Bestands- und Event-Guardrails

Empfohlenes Modell / Reasoning: `GPT-5.6 Sol / High`.

- `sql/12_Medication.sql` anpassen, den Stock-Log aber in diesem Substep noch nicht entfernen.
- Den produktiv vorhandenen Check `stock_count >= 0` sowohl im Fresh-Table-Vertrag als auch ueber einen idempotenten Konvergenzpfad fuer bestehende Tabellen abbilden.
- `stock_decrement_qty int not null default 0` mit `0 <= stock_decrement_qty <= qty` sowohl im Fresh-Table-Vertrag als auch idempotent fuer bestehende Event-Tabellen abbilden.
- Constraint-Namen und Katalog-Guards so waehlen, dass Wiederholung weder Duplikate noch Fehler erzeugt.
- Das kanonische SQL muss nach diesem Substep weiterhin mit dem noch vorhandenen Stock-Log strukturell konsistent sein.
- Code-/SQL- und Contract Review.
- Findings korrigieren.

### S4.2 Confirm- und Undo-Vertrag

Empfohlenes Modell / Reasoning: `GPT-5.6 Sol / High`.

- `med_confirm_slot_v2` und `med_undo_slot_v2` stock-log-frei machen.
- Confirm speichert `qty` als dokumentierte Einnahme und separat `least(vorheriger Bestand, qty)` als `stock_decrement_qty`.
- Undo addiert nur das gespeicherte `stock_decrement_qty` zurueck.
- Event- und Bestandsaenderung bleiben innerhalb derselben RPC-Transaktion.
- Doppel-Confirm bleibt No-op ohne doppelte Bestandsreduktion.
- Undo ohne Event bleibt klarer Fehler und veraendert keinen Bestand.
- Code-/SQL- und Contract Review.
- Findings korrigieren.

### S4.3 Adjust-, Set- und Restock-Vertrag

Empfohlenes Modell / Reasoning: `GPT-5.6 Sol / High`.

- `med_adjust_stock_v2` und `med_set_stock_v2` stock-log-frei machen.
- Adjust prueft den Zielbestand unter Row-Lock und weist Werte unter `0` mit einem klaren Fehler ab.
- Set auf denselben Wert wird erfolgreicher No-op ohne Log-Schreibversuch.
- Restock, Adjust und Set erzeugen keine Historie.
- Bestehende RPC-Signaturen bleiben stabil.
- Code-/SQL- und Contract Review.
- Findings korrigieren.

### S4.4 Reset- und Delete-Vertrag

Empfohlenes Modell / Reasoning: `GPT-5.6 Sol / High`.

- `med_reset_all_data_v2` vom Stock-Log entkoppeln.
- Reset-Payload auf `deleted_slot_events`, `deleted_schedule_slots` und `deleted_medications` begrenzen.
- `med_delete_v2` und Foreign-Key-Verhalten gegen den spaeteren Tabellen-Drop pruefen.
- Nach diesem Substep referenziert kein aktiver RPC mehr den Stock-Log.
- Code-/SQL- und Contract Review.
- Findings korrigieren.

### S4.5 Kanonische Stock-Log-Entfernung und Grants

Empfohlenes Modell / Reasoning: `GPT-5.6 Sol / High`.

- Erst jetzt Stock-Log-Tabelle, Indizes, Policies und Kommentare aus `sql/12_Medication.sql` entfernen.
- Medication-Abschnitt in `sql/16_Explicit_Grants.sql` vom Stock-Log bereinigen.
- Bestehende Rechte fuer Stammdaten, Schedule-Slots, Slot-Events und externe `med_*_v2`-RPCs beibehalten.
- Statischer Scan beweist, dass kanonisches und operatives SQL sowie Grants keinen Stock-Log-Verweis mehr enthalten; das erst in S4.8 entstehende einmalige Transition-SQL ist die bewusst erlaubte Migrationsausnahme.
- Code-/SQL- und Contract Review.
- Findings korrigieren.

### S4.6 Retention-SQL und interne Cleanup-Funktion

Empfohlenes Modell / Reasoning: `GPT-5.6 Sol / High`.

- `sql/17_Medication_Retention.sql` anlegen.
- Idempotente, erst bei user-gated Live-Ausfuehrung wirksame `pg_cron`-Aktivierung vor allen `cron`-Abhaengigkeiten eintragen.
- Einen `day`-fuehrenden Event-Cutoff-Index idempotent definieren.
- Interne Cleanup-Funktion definieren:
  - Wiener Kalenderjahr-Cutoff genau einmal berechnen.
  - zuerst alte Slot-Events loeschen.
  - danach nur nicht mehr benoetigte beendete Schedule-Slots loeschen.
  - Cutoff und Loeschzaehler zurueckgeben.
  - nur abgeschlossene eigene Cron-Laufdetails aelter als 90 Tage bereinigen.
- Funktion ist `SECURITY INVOKER`, verwendet einen festen `search_path` und veraendert keine fremden Jobdetails.
- `EXECUTE` explizit fuer `PUBLIC`, `anon`, `authenticated` und `service_role` entziehen.
- Code-/SQL-, Security- und Contract Review.
- Findings korrigieren.

### S4.7 Idempotenter Cron-Vertrag

Empfohlenes Modell / Reasoning: `GPT-5.6 Sol / High`.

- Im bestehenden `sql/17_Medication_Retention.sql` genau einen Job namens `midas-medication-retention-daily` fuer `03:15 UTC` konfigurieren.
- Nur dokumentierte `cron.schedule`-/`cron.alter_job`-/`cron.unschedule`-Pfade verwenden; keine direkten Writes auf `cron.job`.
- Wiederholung aktualisiert den bestehenden benannten Vertrag und erzeugt keinen zweiten Job.
- Fehlender oder unerwartet mehrfach vorhandener gleichnamiger Job wird diagnostizierbar behandelt.
- Code-/SQL- und Contract Review.
- Findings korrigieren.

### S4.8 Einmaliges Clean-Start-Transition-SQL

Empfohlenes Modell / Reasoning: `GPT-5.6 Sol / Extra High`.

- `sql/transition_medication_clean_start.sql` anlegen.
- Sichtbare Warnung, Zielnutzer, Wiener Stichtag und expliziter Einmal-Vertrag im Header.
- Kurze lokale Lock- und Statement-Timeouts setzen und alle vier Medication-Tabellen in dokumentierter fester Reihenfolge exklusiv sperren.
- Single-Owner-, Zieluser-, Stock-Log-, Push-Delivery- und Rebase-Preconditions nach Lock-Erwerb und vor der ersten Aenderung pruefen.
- Transition in einer Transaktion:
  - bestehende Slot-Events des Zielnutzers loeschen.
  - `stock_decrement_qty` samt Constraint ergaenzen.
  - den nichtnegativen `stock_count`-Constraint bestaetigen oder idempotent konvergieren.
  - Confirm, Undo, Adjust, Set und Reset mit den zu `sql/12_Medication.sql` semantisch identischen finalen Definitionen ersetzen.
  - historische und inaktive Altplaene entfernen.
  - aktuelle Plaene kollisionsfrei auf den Stichtag rebasen.
  - zukuenftige Plaene unveraendert erhalten.
  - Low-Stock-Acknowledgements leeren.
  - Stock-Log ohne `cascade` entfernen.
  - `stock_count` nicht automatisch veraendern.
- Jede verletzte Precondition oder jeder Timeout fuehrt zum vollstaendigen Rollback.
- Script gegen versehentliche Wiederholung absichern.
- Code-/SQL- und Contract Review.
- Findings korrigieren.

### S4.9 Downstream- und Doku-Vorbereitung

Empfohlenes Modell / Reasoning: `GPT-5.6 Sol / Medium`.

- Statische Consumer erneut scannen.
- Nur bei echtem Contract-Bedarf Client-, Backend- oder Android-Code anpassen.
- Medication Overview, QA und Future Notes fuer S6 vorbereiten.
- Keine neue UI oder Reminder-Logik einfuehren.
- Code-/Contract Review.
- Findings korrigieren.

### S4.10 Gesamt-Code-/SQL-/Contract-Review

Empfohlenes Modell / Reasoning: `GPT-5.6 Sol / High`.

- Kein Stock-Log-Verweis verbleibt in kanonischem oder operativem SQL, Grants oder Runtime-Code; ausschliesslich das user-gated Transition-SQL darf den alten Bestand fuer Precondition und Drop referenzieren.
- Source-of-Truth-Doku-Aenderungen sind fuer S6 vollstaendig vorbereitet und als noch offene Abschlussarbeit sichtbar dokumentiert.
- Fresh-Project-, Live-Transition- und Betriebs-Retention-Vertrag sind konsistent.
- Die sechs zwischen kanonischem SQL und Transition duplizierten RPC-Definitionen sind semantisch identisch.
- Alle neuen Spalten und Constraints besitzen Fresh-Project- und idempotente Existing-Project-Pfade.
- Kein produktives SQL wurde waehrend S4 ausgefuehrt.
- Alle Findings aus S1-S3 und dem Readiness Review sind umgesetzt oder begruendet abgegrenzt.
- Gesamt-Findings korrigieren und S4 abnehmen.

Exit-Kriterium:

- Alle lokalen SQL- und Doku-Artefakte sind reviewbar und fuer S5 bereit; produktive Daten sind noch unveraendert.

## S5 - Tests, Live-Migration und Contract Review

Empfohlenes Modell / Reasoning: `GPT-5.6 Sol / High`.

Ziel:

- Erst lokal vollstaendig pruefen und danach nur mit expliziter Freigabe den produktiven Cutover kontrolliert ausfuehren.

### Lokal ausfuehrbar

- S5.1 `git diff --check` fuer alle betroffenen Dateien.
- S5.2 SQL-Strukturscan:
  - keine aktive Stock-Log-Referenz.
  - keine ungewollte RPC-Signaturaenderung.
  - kein `drop ... cascade`.
  - RLS/Grants fuer verbleibende Tabellen intakt.
  - Retention-Funktion ohne Execute fuer `PUBLIC`, `anon`, `authenticated` und `service_role`.
  - Transition mit Lock-Timeouts, fester Lock-Reihenfolge und Preflight nach Lock-Erwerb.
  - Schedule-Upsert, Confirm, Undo, Adjust, Set und Reset sind in Master- und Transition-SQL semantisch identisch.
- S5.3 SQL-Parser-/lokaler DB-Check, soweit die lokale Umgebung belastbar verfuegbar ist; Nichtverfuegbarkeit dokumentieren.
- S5.3a auf einer leeren lokalen/disposable Datenbank, soweit verfuegbar:
  - `sql/12_Medication.sql`, den mechanisch unveraenderten Medication-Abschnitt
    aus `sql/16_Explicit_Grants.sql` und
    `sql/17_Medication_Retention.sql` in vorgesehener Reihenfolge ausfuehren.
  - Das vollstaendige `sql/16_Explicit_Grants.sql` bleibt gemaess
    `sql/HOW_TO.md` an einen vollstaendigen MIDAS-Objektbestand gebunden und
    wird produktiv gegen diesen Bestand geprueft.
  - denselben Bootstrap ein zweites Mal ausfuehren und Idempotenz bestaetigen.
  - nach beiden Laeufen genau drei Medication-Tabellen und genau einen benannten Retention-Job nachweisen.
- S5.3b auf einem disposable Transition-Fixture, soweit verfuegbar:
  - erfolgreiche Transition mit Single-Owner und kollisionsfreien Plaenen pruefen.
  - Owner- oder Rebase-Precondition absichtlich verletzen und vollstaendigen Rollback ohne Teilwirkung beweisen.
  - Lock-Timeout-Pfad ohne Teilwirkung pruefen, sofern lokal belastbar simulierbar.
- S5.4 statischer Consumer-Scan fuer PWA, Android, Edge Functions, Realtime, Reports und Doku.
- S5.5 Retention-Grenzfallreview mit festen Beispieldaten:
  - Tag vor Cutoff wird geloescht.
  - Cutoff-Tag bleibt.
  - aktueller und zukuenftiger Slot bleibt.
  - alter beendeter Slot wird erst nach Events geloescht.
- S5.6 RPC-Review:
  - Confirm.
  - Confirm bei Bestand kleiner als Slot-Menge speichert nur die tatsaechlich angewandte Bestandsreduktion.
  - Doppel-Confirm.
  - Undo stellt nur die gespeicherte Bestandsreduktion wieder her und erzeugt keinen Phantom-Bestand.
  - Adjust unter `0`.
  - Set gleicher Wert.
  - Restock.
- S5.6a Transaktions-/Concurrency-Review:
  - paralleler Confirm kann nicht zwischen finalem Preflight und Event-Loeschung committen.
  - Lock-Timeout fuehrt zum vollstaendigen Abbruch ohne Teilwirkung.
- S5.7 optionaler CodeRabbit-/externer Review und Findings-Korrektur.

### Read-only Live-Preflight, user-gated

- S5.8 produktiven Iststand unmittelbar vor Cutover erneut pruefen:
  - Tabellen und Abhaengigkeiten.
  - negative Bestaende.
  - aktuelle/kuenftige Schedule-Slots.
  - bestehende Cron-Jobs.
  - genau ein gemeinsamer Medication-Owner ueber Stammdaten, Slots und Events.
  - am Stichtag noch keine persistierte Medication-Push-Zustellung.
  - je Zielnutzer und Medication keine am Stichtag ueberlappenden Plaene, die beim Rebase denselben `sort_order` und dasselbe Startdatum erhalten wuerden.
  - erwartete Zieluser-Zuordnung.
- S5.9 einmaligen Sicherheits-Snapshot erstellen:
  - Medication-Stammdaten.
  - aktuelle/kuenftige Plaene.
  - aktuelle Bestaende.
  - nur als Rollback-Hilfe, nicht als neuer laufender Exportprozess.

### Produktiver Cutover, nur nach erneuter User-Freigabe

- S5.10 Wartungsfenster festlegen:
  - am Stichtag vor der ersten Medication-Bestaetigung.
  - vor `10:00 Europe/Vienna` und vor jeder Medication-Push-Zustellung.
  - konkretes Wiener Datum dokumentieren.
- S5.11 SQL in gepruefter Reihenfolge anwenden:
  1. einmaliges Clean-Start-Transition-SQL mit den gezielt benoetigten RPC-Ersetzungen und Daten-/Schemaaenderungen.
  2. aktualisiertes Explicit-Grants-SQL.
  3. idempotentes Retention-/Cron-SQL.
- Das aktualisierte `sql/12_Medication.sql` bleibt der kanonische Fresh-Project-Vertrag und wird nicht pauschal als Live-Migration ausgefuehrt.
- S5.12 nach jedem SQL-Artefakt unmittelbaren Struktur-/Ergebnischeck ausfuehren; bei Fehler stoppen und nicht blind fortsetzen.
- S5.13 aktuelle Packungsbestaende manuell in MIDAS setzen.
- Direkt danach PWA neu laden und das Android Widget bewusst synchronisieren, bevor der normale Tagesbetrieb fortgesetzt wird.

### Runtime-Smokes

- S5.14 Browser/PWA:
  - Medication-Liste und TAB laden.
  - Bestand setzen und Restock.
  - ersten Tages-Slot bestaetigen.
  - Undo und erneutes Confirm.
  - Mehrfach-Slot nur abschnittsbezogen veraendern.
- S5.15 Android Widget:
  - Sync zeigt denselben Medication-Status.
  - Realtime-/manueller Refresh reagiert auf Slot-Event.
- S5.16 Push/Incident:
  - bestaetigter Slot bleibt geschlossen.
  - offener Slot bleibt nach bestehender Cadence erinnerbar.
  - keine neue Reminder-Kette.
- S5.17 Retention:
  - Cleanup-Funktion als autorisierter DB-Operator im Dry-/Testvertrag pruefen.
  - Job existiert exakt einmal.
  - Jobstatus ist sichtbar und ohne Fehler.
  - Funktionsrechte zeigen kein Execute fuer `PUBLIC`, `anon`, `authenticated` oder `service_role`.
  - nur abgeschlossene eigene Joblaeufe aelter als 90 Tage sind bereinigbar.
  - keine aktuelle Produktivzeile wird fuer einen kuenstlichen Test geopfert.
- S5.18 Supabase Security Advisor / Grants / RLS gegenpruefen.
- S5.19 Gesamt-Code-, SQL- und Contract Review; Findings korrigieren.
- S5.20 Schritt-Abnahme und Commit-Empfehlung:
  - `noch nicht committen`, solange S6-Doku offen ist.

Exit-Kriterium:

- Lokale Checks sind gruen, der produktive Cutover ist entweder erfolgreich geprueft oder klar als user-gated offen dokumentiert, und keine P0/P1-Findings bleiben offen.

## S6 - Doku-Sync, QA-Update und finaler Abschlussreview

Empfohlenes Modell / Reasoning: `GPT-5.6 Sol / High`.

Ziel:

- Datenmodell, Betrieb, QA und Source-of-Truth-Doku final auf denselben Vertrag bringen.

Substeps:

- S6.1 `docs/modules/Medication Module Overview.md` aktualisieren:
  - drei verbleibende Medication-Tabellen.
  - aktueller Bestand ohne Historie.
  - ein Kalenderjahr Slot-Events.
  - interne Retention und Cron.
- S6.2 relevante Downstream-Overviews nur bei tatsaechlichem Contract-Bedarf aktualisieren:
  - Intake.
  - Push.
  - Android Widget.
  - Reports/Doctor View.
- S6.3 `docs/QA_CHECKS.md` um Datenhygiene-, Clean-Start- und Retention-Smokes ergaenzen.
- S6.4 `sql/HOW_TO.md` aktualisieren, falls Retention-/Transition-/Cron-Konventionen noch nicht ausreichend beschrieben sind.
- S6.5 `docs/MIDAS Medication Data Hygiene Future Notes.md` als durch diese Roadmap ersetzt markieren oder nach finalem Review sinnvoll archivieren.
- S6.6 Roadmap-Ergebnisprotokolle und echten produktiven Stichtag eintragen.
- S6.7 finaler Contract Review:
  - Roadmap vs. SQL.
  - SQL vs. Grants/RLS.
  - SQL vs. Medication Overview.
  - SQL vs. QA.
  - Medication vs. Push/Widget/Realtime.
  - Cutoff und Copy-Vertrag.
- S6.8 Abschluss-Abnahme:
  - kein Stock-Log mehr.
  - Clean Start dokumentiert.
  - Bestaende gegen die realen Packungen abgeglichen und nur bei Bedarf korrigiert.
  - Cron exakt einmal aktiv.
  - keine offenen P0/P1-Findings.
  - keine ungewollten Aenderungen ausserhalb des Scopes.
- S6.9 Commit-Empfehlung und Archiv-Entscheidung.

Exit-Kriterium:

- MIDAS nutzt produktiv das besprochene schlanke Medication-Datenmodell, die Retention ist nachweisbar aktiv und alle Source-of-Truth-Dokumente stimmen ueberein.

---

## Ergebnisprotokoll

### Roadmap-Erstellung und Initial Contract Review 2026-07-10

Geprueft:

- Roadmap-Template und juengste abgeschlossene SQL-/Backend-Roadmaps.
- Medication Future Notes und Medication Module Overview.
- kanonisches Medication-SQL.
- Explicit-Grants-Medication-Block.
- aktive Consumer in PWA, Android und Incident Push.
- aktueller Supabase-Cron- und Database-Size-Vertrag.

Initiale Findings:

- `IR-F1`: Die Future Notes empfahlen noch einen reduzierten manuellen Stock-Log. Das widerspricht der spaeteren Entscheidung, auch Restock und manuelle Korrekturen nicht langfristig zu speichern.
- `IR-F2`: Ein einfacher Drop wurde anfangs als moeglich diskutiert, wuerde aber aktive RPCs, Reset und Explicit Grants brechen.
- `IR-F3`: Ein Clean Start ohne Stichtags-/Schedule-Vertrag koennte Zeitraeume vor dem Neustart faelschlich als undokumentiert werten.
- `IR-F4`: Nur ein Retention-Job fuer Events waere unvollstaendig, weil historische Schedule-Slots sonst dauerhaft wachsen.
- `IR-F5`: Die Roadmap brauchte einen ausdruecklichen Nicht-Expositionsvertrag fuer die interne Cleanup-Funktion.
- `IR-F6`: Die bestehende fehlende DB-Guardrail gegen negativen `stock_count` gehoert in denselben eng gekoppelten Bestandsvertrag.
- `IR-F7`: Ein einmaliges destruktives Clean-Start-SQL darf nicht mit dem idempotenten Retention-/Cron-SQL vermischt werden.
- `IR-F8`: Alte Low-Stock-Acknowledgements waren im Clean-Start-Vertrag nicht behandelt und koennten nach dem manuellen Bestandsabgleich einen veralteten Zustand transportieren.
- `IR-F9`: Die erste Roadmap-Fassung wollte das vollstaendige Master-SQL produktiv ausfuehren; das vermischt den gezielten Cutover mit fachfremden Bootstrap-/Legacy-Bloecken.
- `IR-F10`: Der Schedule-Vertrag liess noch offen, ob aktuelle Plaene erhalten oder rebased werden; damit war der Beobachtungsbeginn nicht deterministisch im Datenmodell abgebildet.

Korrekturen:

- Zielmodell auf drei Medication-Tabellen reduziert und Stock-Log vollstaendig aus dem Zielvertrag entfernt.
- RPC-, Reset-, Grant- und Doku-Abhaengigkeiten eigenen S4-Substeps zugeordnet.
- Clean Start mit Stichtag, Schedule-Erhalt/Rebase, Bestandsabgleich und Wartungsfenster konkretisiert.
- Am Stichtag gueltige Plaene werden verbindlich auf den Stichtag rebased; spaeter beginnende Plaene bleiben unveraendert.
- Alte Low-Stock-Acknowledgements werden beim Cutover geleert.
- Live-Cutover auf das gezielte Transition-SQL begrenzt; `sql/12_Medication.sql` bleibt Fresh-Project-Source-of-Truth.
- Event- und Schedule-Retention gemeinsam definiert.
- Cleanup-Funktion als interner, nicht user-exponierter DB-Pfad festgelegt.
- Nichtnegativer Bestandsvertrag in S2, S3, S4 und S5 aufgenommen.
- Idempotentes Betriebs-SQL und einmalige Transition als getrennte Artefakte definiert.

Review-Ergebnis:

- Die Roadmap deckt den besprochenen Clean Start, die vollstaendige Stock-Log-Abschaffung, die Einjahres-Retention und die benoetigten Downstream-Regressionen ab.
- Keine produktive SQL-Ausfuehrung ist Teil der Roadmap-Erstellung.
- Zum Zeitpunkt des initialen Reviews blieb der naechste erlaubte Schritt S1.

### S1 - System- und Vertragsdetektivarbeit 2026-07-11

#### S1.1 Produkt-, Werkzeug- und SQL-Arbeitsvertrag

Geprueft:

- `README.md`.
- `docs/DEV_ENVIRONMENT.md`.
- `sql/HOW_TO.md`.

Ergebnis:

- MIDAS bleibt ein personenbezogenes, langfristiges CKD-Begleitsystem; Daten werden nur mit fachlichem Nutzwert dauerhaft gespeichert.
- Produktive SQL-Ausfuehrung, Extension-Aktivierung, Cron-Konfiguration und Smokes mit Schreibwirkung bleiben explizit user-gated.
- Kanonische Master-SQL-Dateien muessen Fresh-Project-faehig und idempotent sein; destruktive Bestandsmigrationen erhalten ein separates, klar markiertes Transition-SQL.
- Der bestehende Dirty Worktree wird respektiert. `android/gradle.properties` und `docs/DEV_ENVIRONMENT.md` wurden in S1 nicht veraendert.

#### S1.2 Modulvertraege

Geprueft:

- Medication Module Overview.
- Intake Module Overview.
- Push Module Overview.
- Android Widget Module Overview.
- Reports Module Overview.
- Doctor View Module Overview.

Ergebnis:

- Medication-Stammdaten, aktueller Bestand, Schedule-Slots und Slot-Events sind der benoetigte fachliche Kern.
- Intake und PWA lesen den Tagesstatus ueber `med_list_v2` und schreiben ueber die bestehenden Medication-RPCs.
- Incident Push liest `health_medications`, `health_medication_schedule_slots` und `health_medication_slot_events` direkt.
- Das Android Widget liest `med_list_v2`; Realtime beobachtet nur Medication-Stammdaten, Schedule-Slots und Slot-Events.
- Reports und Doctor View besitzen aktuell keinen Reader fuer Medication- oder Stock-Log-Historie.
- Kein Modul benoetigt `health_medication_stock_log` als fachliche Source of Truth.

#### S1.3 Historische Entscheidungen

Geprueft:

- Medication Multi-Dose Implementation Roadmap (DONE).
- Incident Push Review Findings Roadmap (DONE).
- Supabase Explicit Grants Roadmap (DONE).
- Medication Data Hygiene Future Notes.

Ergebnis:

- Das urspruengliche Multi-Dose-Zielmodell bestand fachlich bereits aus Stammdaten, Schedule und Slot-Event.
- Der Stock-Log wurde historisch nur als optionaler Audit-/Diagnosepfad erhalten und war nie Voraussetzung fuer Tagesstatus oder Reminder.
- Der damalige Verzicht auf historische Backfills sowie ein manueller Bestandsabgleich sind mit dem heutigen Clean-Start-Vertrag vereinbar.
- Die fruehere Future-Notes-Idee eines reduzierten manuellen Stock-Logs ist durch die spaetere Produktentscheidung zur vollstaendigen Entfernung ueberholt.

#### S1.4 Kanonisches Medication-SQL

Inventarisierter Bestand in `sql/12_Medication.sql`:

- Tabellen:
  - `health_medications`.
  - `health_medication_schedule_slots`.
  - `health_medication_slot_events`.
  - `health_medication_stock_log`.
- Foreign Keys:
  - Schedule-Slots und Slot-Events haengen mit `ON DELETE CASCADE` an Medication-Stammdaten.
  - Slot-Events sichern `slot_id` und die Kombination aus Slot und Medication ab.
  - Der Stock-Log haengt an Medication; sein Slot-Verweis wird beim Slot-Drop auf `NULL` gesetzt.
- RLS:
  - alle vier Tabellen haben aktivierte RLS und owner-basierte Policies.
- Reader:
  - `med_list_v2` leitet Tagesplanung, Einnahmestatus, Bestand und Low-Stock aus den drei fachlichen Kerntabellen ab.
- Writer:
  - `med_confirm_slot_v2`, `med_undo_slot_v2`, `med_adjust_stock_v2`, `med_set_stock_v2` und `med_reset_all_data_v2` referenzieren den Stock-Log.
  - `med_upsert_v2` kann den Bestand ohne Stock-Log-Eintrag setzen; damit ist der Log bereits konzeptionell unvollstaendig.
- Transaktionen:
  - ein RPC-Aufruf bildet jeweils eine Datenbanktransaktion; Event- und Bestandsaenderungen innerhalb der Confirm-/Undo-Funktion bleiben atomar.
  - das Master-SQL besitzt einen uebergreifenden `begin`-/`commit`-Rahmen, enthaelt aber auch Bootstrap- und Legacy-Bloecke und ist deshalb kein geeignetes produktives Cutover-Script.
- Indizes:
  - Slot-Events sind nach `(med_id, day)` und `(slot_id, day)` indexiert.
  - ein global fuer Retention geeigneter, mit `day` beginnender Index fehlt.

#### S1.5 Grants- und Data-API-Vertrag

Ergebnis:

- `sql/16_Explicit_Grants.sql` exponiert alle vier aktuellen Medication-Tabellen fuer `authenticated` und `service_role` mit den jeweils vorgesehenen Rechten.
- Der Stock-Log ist damit derzeit Teil des Data-API-Vertrags und muss vor oder gemeinsam mit dem Tabellen-Drop aus dem Grants-SQL entfernt werden.
- Alle bestehenden `med_*_v2`-RPCs bleiben im Grants-Vertrag; eine neue interne Retention-Funktion darf nicht an `anon` oder `authenticated` freigegeben werden.
- RLS und explizite Grants bleiben getrennte, beide notwendige Zugriffsebenen.

#### S1.6 Aktive Consumer

Reader-/Writer-Karte:

- `app/modules/intake-stack/medication/index.js`:
  - liest `med_list_v2`.
  - schreibt Confirm, Undo, Upsert, Schedule, Adjust, Set, Ack, Active und Delete ueber RPCs.
- Intake-, Hub-, Voice- und Incident-UI:
  - konsumieren den abgeleiteten Medication-Tagesstatus oder den lokalen Medication-Cache.
- `backend/supabase/functions/midas-incident-push/index.ts`:
  - liest Medication-Stammdaten, Schedule-Slots und Slot-Events.
- Android Widget:
  - liest `med_list_v2` ueber REST.
  - beobachtet per Realtime Medication-Stammdaten, Schedule-Slots und Slot-Events.
- Stock-Log:
  - kein aktiver Reader in PWA, Android, Edge Functions, Reports oder Doctor View.
  - produktive Writer sind ausschliesslich die fuenf in S1.4 genannten RPCs.

#### S1.7 Aktueller Supabase-Vertrag

Geprueft:

- Supabase Changelog bis `2026-07-11`.
- aktuelle Supabase-Cron-Dokumentation.
- aktuelle Delete-, Database-Size- und Autovacuum-Dokumentation.

Ergebnis:

- Kein aktueller Breaking Change blockiert das geplante Medication-Zielmodell.
- Neue oder neu provisionierte Data-API-Objekte brauchen weiterhin explizite Grants; `sql/16_Explicit_Grants.sql` bleibt deshalb Teil des Vertrags.
- Cron-Jobs werden ueber `cron.schedule`, `cron.alter_job` und `cron.unschedule` verwaltet; direkte Writes auf `cron.job` sind nicht zulaessig.
- Ein erneuter `cron.schedule`-Aufruf mit demselben Jobnamen kann fuer einen idempotenten Einzeljob-Vertrag verwendet werden.
- `cron.job_run_details` wird nicht automatisch bereinigt. Ohne eigenen Grenzvertrag wuerde die Retention selbst eine neue unbegrenzte technische Historie erzeugen.
- Normales `delete` plus Autovacuum macht Platz fuer Wiederverwendung frei. `VACUUM FULL` ist fuer den kleinen Medication-Bestand nicht vorgesehen, weil es die Tabelle exklusiv sperrt und neu schreibt.

#### S1.8 Read-only Live-Preflight

Freigabe und Grenze:

- Der Auftrag, alle S1-Punkte deterministisch auszufuehren, wurde als Freigabe fuer den in S1 ausdruecklich beschriebenen Read-only-Preflight verwendet.
- Ausgefuehrt wurden ausschliesslich Metadaten- und `select`-Abfragen; kein produktiver Datensatz, Grant, Cron-Job oder Schemaeintrag wurde veraendert.

Produktiver Iststand am `2026-07-11`:

- PostgreSQL: `17.6`.
- `health_medications`: 3 Zeilen, ca. 96 KiB, alle aktiv, kein negativer Bestand.
- `health_medication_schedule_slots`: 3 Zeilen, ca. 80 KiB, alle drei am Stichtag gueltig und aktiv; keine historischen oder zukuenftigen Slots.
- `health_medication_slot_events`: 336 Zeilen, ca. 240 KiB, Zeitraum `2026-03-21` bis `2026-07-10`, keine verwaisten Medication-/Slot-Verweise und noch keine Zeile ausserhalb eines Kalenderjahres.
- `health_medication_stock_log`: 361 Zeilen, ca. 184 KiB, Zeitraum `2026-03-21` bis `2026-07-10`.
- Produktiv existiert bereits der Check `health_medications_stock_count_check` mit `stock_count >= 0`; im lokalen kanonischen SQL fehlt er.
- Der globale, mit `day` beginnende Retention-Index fuer Slot-Events existiert produktiv noch nicht.
- Produktive Stock-Log-Funktionsreferenzen: Confirm, Undo, Adjust, Set und Reset.
- `pg_cron` ist nicht installiert; `cron.job` und `cron.job_run_details` existieren daher noch nicht und es gibt keinen Medication-Retention-Job.
- Die erwarteten Tabellen-Grants fuer `authenticated` und `service_role` sind vorhanden.

Bewertung:

- Der aktuelle Speicherverbrauch ist noch klein. Die Roadmap ist deshalb praeventive Langzeit-Hygiene und keine akute Kapazitaetsrettung.
- Der produktive Datenbestand ist konsistent und klein genug fuer ein gezieltes, transaktionales Clean-Start-Script.
- Das Transition-Script muss trotzdem generisch bleiben und darf nicht auf die heutige Anzahl von drei Medikamenten oder drei Slots fest codiert werden.

#### S1.9 Systemkarte und Findings

Systemkarte:

```text
PWA / Intake / Widget
        |
        +--> med_list_v2 -----------------------------+
        |                                              |
        +--> med_*_v2 Writer                           |
                                                       v
Incident Push / Android Realtime --> health_medications
                                  --> schedule_slots
                                  --> slot_events

Nur bestehende Writer-RPCs --------> stock_log
Kein aktiver Runtime-Reader --------> stock_log
```

Neu oder durch Live-Daten praezisierte Findings:

- `MDH-F7` wurde korrigiert: Der DB-Check fehlt nicht produktiv, sondern im kanonischen Fresh-Project-SQL. Negative Adjust-Zielwerte brauchen dennoch einen klaren RPC-Fehlervertrag.
- `MDH-F13`: Live-Schema und `sql/12_Medication.sql` driften beim nichtnegativen Bestand auseinander.
- `MDH-F14`: `pg_cron` muss vor der Jobanlage explizit und user-gated installiert werden.
- `MDH-F15`: Cron-Laufdetails brauchen einen eigenen begrenzten Retention-Vertrag.
- `MDH-F16`: Der JSON-Rueckgabevertrag von `med_reset_all_data_v2` muss nach Entfernung von `deleted_stock_logs` bewusst festgelegt werden.

#### S1.10 Contract Review

Review gegen Ziel, Scope und Guardrails:

- Zielmodell: bestaetigt. Nur Stammdaten, aktueller Bestand, Schedule-Slots und einjaehrige Slot-Events werden fachlich benoetigt.
- Stock-Log-Entfernung: bestaetigt. Es existiert kein aktiver Reader; ein blinder Drop waere wegen fuenf RPCs und Grants dennoch ein P0-Fehler.
- Clean Start: bestaetigt. Die heutige Live-Lage ist einfach, aber die Roadmap bleibt datengetrieben und nicht zeilenanzahlabhaengig.
- Retention: bestaetigt. Event- und historische Schedule-Retention gehoeren zusammen; ein `day`-fuehrender Index fehlt noch.
- Cron: grundsaetzlich geeignet, aber Installation und Laufhistorienbegrenzung waren in der ersten Roadmap-Fassung nicht vollstaendig genug.
- Security: bestaetigt. Die Cleanup-Funktion bleibt intern; RLS, Grants und Funktionsrechte werden separat geprueft.
- Runtime: bestaetigt. PWA, Push und Widget benoetigen keine Stock-Log-Daten.
- Guardrails: eingehalten. In S1 wurden weder Code/SQL-Artefakte noch produktive Daten oder Schemaobjekte veraendert.

Review-Findings:

- Der Status von `MDH-F7` war nach dem Live-Preflight sachlich falsch.
- `pg_cron`-Installation war als Freigabe genannt, aber noch nicht als nachgewiesene produktive Vorbedingung in S4 verankert.
- Die unbegrenzte `cron.job_run_details`-Historie fehlte im Retention-Vertrag.
- Der Reset-Rueckgabevertrag war nach dem Tabellen-Drop nicht explizit genug.

#### S1.11 Korrekturen und Schritt-Abnahme

Korrekturen:

- `MDH-F7` auf den bestaetigten Live-vs.-Source-of-Truth-Drift korrigiert.
- `MDH-F13` bis `MDH-F16` in die Finding-Tabelle aufgenommen.
- S2 um Cron-Installation, Cron-Laufhistorienbegrenzung und Reset-Rueckgabevertrag erweitert.
- S4.1 auf Spiegelung des bereits produktiven Bestands-Checks praezisiert.
- S4.4 um die Umsetzung des Reset-Rueckgabevertrags erweitert.
- S4.6/S4.7 um die user-gated `pg_cron`-Installation und begrenzte Cron-Laufhistorie erweitert.
- Handoff, Statusmatrix und aktueller Schritt auf den abgeschlossenen S1-Stand synchronisiert.

Schritt-Abnahme:

- S1.1 bis S1.11 wurden deterministisch abgeschlossen.
- Alle relevanten Tabellen, Foreign Keys, Indizes, RLS-Policies, RPCs, Grants, Reader, Writer und Realtime-Consumer sind bekannt.
- Der produktive Iststand ist read-only bestaetigt.
- Es bestehen keine offenen Abhaengigkeitsfragen, die S2 blockieren.
- Keine produktive oder lokale Implementierung wurde vorgezogen.
- S1 ist `DONE`; der naechste erlaubte Schritt ist S2.

### S1 - Zweiter Contract Review und Findings-Korrektur 2026-07-11

Review-Fokus:

- S1-Ergebnisse gegen Zieldefinition, Scope, Guardrails und S2-Uebergabe erneut gelesen.
- Live-Schema und kanonischen Schedule-Unique-Vertrag gegen den Clean-Start-Rebase geprueft.
- Zielaussagen zur vollstaendigen Stock-Log-Entfernung gegen Archiv- und Source-of-Truth-Dokumente abgegrenzt.

Findings:

- `MDH-F17`: Der bisherige Rebase-Vertrag nahm implizit an, dass pro Medication und `sort_order` nur ein am Stichtag gueltiger Plan existiert. Bei ueberlappenden Plaenen koennte das gemeinsame neue `start_date` den Unique-Vertrag verletzen. Ein destruktives Script darf diese Mehrdeutigkeit weder still aufloesen noch teilweise fortfahren.
- `MDH-F18`: Die Formulierung, dass kein Doku-Pfad den Stock-Log referenzieren darf, war nicht erfuellbar und historisch falsch. Abgeschlossene Roadmaps und Archive muessen das fruehere Datenmodell weiterhin nachvollziehbar dokumentieren.

Korrekturen:

- Zielvertrag auf aktive RPCs, Grants, RLS-Vertraege, Consumer und Source-of-Truth-Dokumente praezisiert; historische Dokumentation bleibt zulaessig.
- `MDH-F17` und `MDH-F18` in die Finding-Klassifizierung aufgenommen.
- S3 um eine verpflichtende, aenderungsfreie Rebase-Kollisionspruefung erweitert.
- Das S4 Readiness Gate um den Nachweis einer kollisionsfreien Schedule-Zuordnung erweitert.
- Das Transition-SQL in S4.8 auf eine Precondition mit vollstaendigem Abbruch vor jeder Aenderung verpflichtet.
- Den read-only Live-Preflight in S5 um dieselbe Ueberlappungs- und Kollisionspruefung erweitert.

Abnahme:

- Beide Review-Findings sind im Roadmap-Vertrag korrigiert.
- `MDH-F17` blockiert S2 nicht, weil die erforderliche Sicherheitsentscheidung bereits feststeht und in S3-S5 deterministisch umgesetzt wird.
- Es verbleibt kein offenes S1-Finding ohne Zielschritt.
- S1 bleibt `DONE`; der naechste erlaubte Schritt bleibt S2.

### S2 - Fachlicher und technischer Contract Review 2026-07-11

#### S2.1 Ziel gegen Produktguardrails

Ergebnis:

- Die Datenhygiene dient dem langfristigen, ehrlichen Medication-Betrieb und nicht einer kurzfristigen Speicherkrise.
- Tagesstatus, Mehrfach-Slots, aktueller Bestand, Low-Stock, Push und Widget bleiben fachlich erhalten.
- Es entsteht keine lebenslange Einnahme- oder Bestandsbewegungshistorie.
- Rohdaten werden nicht zu einer Aussage umgedeutet, die sie nicht beweisen: Ein fehlendes Event bedeutet `nicht dokumentiert`, nicht sicher `vergessen`.

#### S2.2 Finales Ziel-Datenmodell

- `health_medications` bleibt dauerhaft die Source of Truth fuer Stammdaten, aktuellen Bestand, Aktivstatus und Low-Stock.
- `health_medication_schedule_slots` bleibt fuer aktuelle, zukuenftige und innerhalb des Beobachtungszeitraums benoetigte Plaene erhalten.
- `health_medication_slot_events` bleibt genau ein rollendes Kalenderjahr erhalten.
- Slot-Events speichern:
  - `qty` als dokumentierte Einnahmemenge.
  - `stock_decrement_qty` als beim Confirm tatsaechlich angewandte Bestandsreduktion.
- `stock_decrement_qty` ist `int not null default 0` und muss `0 <= stock_decrement_qty <= qty` erfuellen.
- `health_medication_stock_log` wird ohne Ersatzhistorie entfernt.
- Monats- oder Jahresaggregate bleiben ausserhalb dieser Roadmap.

#### S2.3 Finaler Bestandsvertrag

- Confirm bleibt auch dann moeglich, wenn der getrackte Bestand kleiner als die geplante Dosis ist. Die Einnahmedokumentation darf nicht an einem ungenauen Lagerzaehler scheitern.
- Bei Confirm gilt:
  - Event-`qty` entspricht der geplanten und dokumentierten Einnahmedosis.
  - `stock_decrement_qty = least(vorheriger stock_count, qty)`.
  - neuer Bestand ist `vorheriger stock_count - stock_decrement_qty` und damit nie negativ.
  - Event und Bestandsupdate bleiben atomar.
- Doppel-Confirm bleibt ein erfolgreicher No-op ohne zweites Event und ohne zweite Bestandsreduktion.
- Bei Undo gilt:
  - exakt das gespeicherte `stock_decrement_qty` wird zum Bestand addiert.
  - die volle Event-Dosis wird nicht blind zurueckgebucht.
  - Event-Loeschung und Bestandsupdate bleiben atomar.
  - Undo ohne Event bleibt ein klarer Fehler ohne Teilwirkung.
- Adjust mit einem Zielbestand unter `0` wird vor dem Update mit einem klaren fachlichen Fehler abgewiesen.
- Set mit negativem Wert wird abgewiesen.
- Set auf den bereits vorhandenen Wert ist ein erfolgreicher No-op und liefert den aktuellen Medication-Datensatz.
- Restock, Adjust und Set veraendern nur `stock_count` und erzeugen keinen Bewegungsverlauf.
- Der produktive DB-Check `stock_count >= 0` wird im kanonischen Fresh-Project-SQL gespiegelt und bleibt die letzte Datenbank-Guardrail fuer direkte Data-API-Pfade.

#### S2.4 Finaler Beobachtungszeitraum

- Fachlicher Tagesanker ist `(now() at time zone 'Europe/Vienna')::date`.
- Der Cutoff ist dieser Wiener Kalendertag minus ein Kalenderjahr.
- Events mit `day >= cutoff` bleiben erhalten.
- Events mit `day < cutoff` werden geloescht.
- Der Cutoff-Tag bleibt damit inklusive erhalten.
- Schaltjahre werden durch PostgreSQL-Kalenderarithmetik behandelt; es wird nicht mit einer fixen Anzahl von Sekunden gerechnet.
- Aus vorhandenen Events darf `dokumentiert` abgeleitet werden. Aus fehlenden Events darf nur `nicht dokumentiert`, niemals sicher `vergessen`, abgeleitet werden.

#### S2.5 Finaler Clean-Start-Vertrag

Produktvorbedingung:

- Der projektweite Drop des Stock-Logs ist nur zulaessig, wenn Medication-Stammdaten, Schedule-Slots und Slot-Events genau einen gemeinsamen Owner besitzen und dieser dem bewusst gesetzten Zielnutzer entspricht.
- Read-only bestaetigt am `2026-07-11`:
  - genau ein gemeinsamer Owner ueber alle drei Kerntabellen.
  - keine Owner-Abweichung zwischen Schedule und Medication.
  - keine Owner-Abweichung zwischen Event, Medication und Slot.
  - keine aktuelle Rebase-Kollision.
- Jede spaetere Abweichung bricht das Transition-SQL vor der ersten Aenderung vollstaendig ab.

Stichtagsvertrag:

- Der Cutover findet an einem konkret dokumentierten Wiener Kalendertag vor der ersten Medication-Bestaetigung statt.
- Medication-Stammdaten bleiben erhalten.
- Alle bisherigen Slot-Events des Zielnutzers werden geloescht; der neue Beobachtungszeitraum beginnt am Stichtag.
- Historische Plaene mit `end_date < Stichtag` werden entfernt.
- Inaktive Plaene mit `start_date <= Stichtag` werden als nicht operative Altplaene entfernt.
- Aktive, am Stichtag gueltige Plaene werden bei unveraendertem Slot-Inhalt auf den Stichtag rebased.
- Vor dem Rebase muss pro Zielnutzer, Medication und `sort_order` genau eine kollisionsfreie gueltige Zuordnung bewiesen sein.
- Plaene mit `start_date > Stichtag` bleiben unveraendert, auch wenn sie fuer eine spaetere Aktivierung vorbereitet sind.
- `low_stock_ack_day` und `low_stock_ack_stock` werden fuer den Zielnutzer geleert.
- `stock_count` wird vom Transition-SQL nicht automatisch veraendert; der
  erhaltene Bestand wird unmittelbar danach gegen die vorhandenen Packungen
  geprueft und nur bei einer Abweichung korrigiert.
- `health_medication_stock_log` wird projektweit ohne `cascade` entfernt, aber erst nachdem alle Funktions- und Grant-Abhaengigkeiten stock-log-frei sind.

#### S2.6 Finaler Retention-Vertrag

- Eine interne Datenbankfunktion berechnet den Wiener Cutoff genau einmal pro Lauf.
- Sie loescht zuerst Slot-Events mit `day < cutoff`.
- Danach loescht sie nur Schedule-Slots mit `end_date < cutoff`, die von keinem erhaltenen Event mehr referenziert werden.
- Aktuelle und zukuenftige Slots werden nie durch Retention geloescht.
- Keine andere Gesundheits-, Medication- oder User-Tabelle wird durch die Funktion bereinigt.
- Die Funktion liefert mindestens Cutoff, geloeschte Event-Zahl und geloeschte Slot-Zahl als technische Diagnose.
- Mehrfaches Ausfuehren mit unveraendertem Datenstand liefert danach Null-Loeschungen und bleibt ohne Nebenwirkung.
- Die Funktion erhaelt kein Execute-Recht fuer `anon` oder `authenticated`.

#### S2.7 Finaler Cron-Vertrag

- `pg_cron` wird erst im user-gated produktiven Cutover idempotent installiert.
- Es existiert genau ein Job namens `midas-medication-retention-daily`.
- Der Job laeuft taeglich um `03:15 UTC`. Das entspricht in Wien ganzjaehrig einem fruehen Morgen desselben Kalendertags.
- Der Job ruft die interne Retention direkt in PostgreSQL auf; Edge Function, GitHub Workflow und App-Login sind nicht beteiligt.
- Wiederholtes Provisioning mit demselben Jobnamen aktualisiert den bestehenden Vertrag und erzeugt keinen Doppeljob.
- Abgeschlossene `cron.job_run_details` der aktuellen Medication-Job-ID bleiben 90 Tage erhalten.
- Nur aeltere abgeschlossene Laufdetails dieses Jobs werden entfernt; aktuelle, laufende und fremde Cron-Jobs bleiben unberuehrt.
- Direkte Inserts oder Updates auf `cron.job` sind verboten.

#### S2.8 Finaler Reset-Rueckgabevertrag

- `med_reset_all_data_v2()` behaelt seine Funktionssignatur und den JSON-Rueckgabetyp.
- Das Ergebnis enthaelt nach Entfernung des Stock-Logs:
  - `deleted_slot_events`.
  - `deleted_schedule_slots`.
  - `deleted_medications`.
- `deleted_stock_logs` wird bewusst entfernt, weil das Zielmodell dieses Objekt nicht mehr kennt und kein aktiver Consumer den Key liest.
- Diese Payload-Bereinigung wird in Source-of-Truth-Doku und S5-Smokes nachvollzogen.

#### S2.9 Contract Review

Review gegen Ziel, S1-Evidenz und spaetere Umsetzbarkeit:

- Zielmodell und Einjahresgrenze sind fachlich konsistent und weiterhin schlank.
- Die Bestandslogik war in der ersten Roadmap-Fassung nicht invertierbar: Confirm konnte weniger als `qty` abziehen, Undo stellte aber immer `qty` wieder her.
- Ein zusaetzliches Integerfeld im einjaehrig begrenzten Event ist kleiner und fachlich ehrlicher als ein dauerhafter Stock-Log oder ein Blockieren der Einnahmebestaetigung bei ungenauem Bestand.
- Der projektweite Tabellen-Drop brauchte einen ausdruecklichen Single-Owner-Vertrag. Die produktive Voraussetzung ist read-only bestaetigt, wird aber beim Cutover erneut geprueft.
- Clean Start unterscheidet nun historische, inaktive, aktuell gueltige und zukuenftige Plaene deterministisch.
- Cutoff, Cron-Zeitpunkt, Jobname und technische Diagnoseaufbewahrung sind ohne offene Produktentscheidung festgelegt.
- Der Reset-Payload enthaelt nach dem Umbau keine fingierte Nullzahl fuer ein nicht mehr vorhandenes Objekt.
- Keine Entscheidung aus S2 erfordert vorgezogenes Coding oder eine produktive Aenderung.

Review-Findings:

- `MDH-F19`: Undo konnte Phantom-Bestand erzeugen, wenn Confirm den Bestand auf `0` geklemmt hatte.
- `MDH-F20`: Ein globaler Tabellen-Drop war nicht ausreichend gegen eine spaetere Mehrnutzerlage abgesichert.

#### S2.10 Korrekturen und Schritt-Abnahme

Korrekturen:

- Zielmodell, S2.2, S2.3, S4.1, S4.2 und S5 um `stock_decrement_qty` und den exakten Undo-Vertrag erweitert.
- `MDH-F19` in die Finding-Klassifizierung aufgenommen und den Zielschritten S3-S5 zugeordnet.
- Clean-Start-, S3-, Readiness-, Transition- und S5-Preflight-Vertrag um die gemeinsame Single-Owner-Precondition erweitert.
- `MDH-F20` in die Finding-Klassifizierung aufgenommen und den Zielschritten S3-S5 zugeordnet.
- Inaktive Altplaene, zukuenftige Plaene und Rebase-Kollisionen eindeutig abgegrenzt.
- Cron-Vertrag auf festen Jobnamen, `03:15 UTC` und 90 Tage eigene Laufhistorie konkretisiert.
- Reset-Payload ohne `deleted_stock_logs` final festgelegt.
- Finding-Status fuer die in S2 finalisierten Vertraege synchronisiert.
- Handoff, Statusmatrix und aktueller Schritt auf S3 gesetzt.

Schritt-Abnahme:

- S2.1 bis S2.10 wurden deterministisch abgeschlossen.
- Es gibt keine offene fachliche Produktentscheidung fuer S3.
- Alle neuen P0-Findings besitzen eine konkrete Sicherheitsentscheidung und pruefbare Zielschritte.
- Keine lokale Implementierung und keine produktive Aenderung wurden vorgezogen.
- S2 ist `DONE`; der naechste erlaubte Schritt ist S3.

### S3 - Bruchrisiko-, Security- und Umsetzungsreview 2026-07-11

#### S3.1 Drop-Abhaengigkeiten

Lokal und produktiv read-only geprueft:

- Funktionsreferenzen auf `health_medication_stock_log`:
  - `med_confirm_slot_v2`.
  - `med_undo_slot_v2`.
  - `med_adjust_stock_v2`.
  - `med_set_stock_v2`.
  - `med_reset_all_data_v2`.
- RLS-Policies der Tabelle:
  - `medication_stock_log_select_own`.
  - `medication_stock_log_insert_own`.
  - `medication_stock_log_delete_own`.
- Aktuelle Data-API-Rechte:
  - `authenticated`: Select, Insert und Delete.
  - `service_role`: Select, Insert, Update und Delete.
- Ausgehende Foreign Keys:
  - zu `health_medications` mit `ON DELETE CASCADE`.
  - zu `health_medication_schedule_slots` mit `ON DELETE SET NULL`.
- Keine eingehenden Foreign Keys.
- Keine Views oder Materialized Views mit Stock-Log-Referenz.
- Keine nicht internen Trigger.
- Keine Realtime-Publikationsmitgliedschaft.
- Keine aktiven PWA-, Android-, Edge-, Report- oder Doctor-Reader.

Bewertung:

- `drop table public.health_medication_stock_log` ohne `cascade` ist der richtige Endzustand.
- Eigene Policies, Indizes, Grants und ausgehende Foreign Keys verschwinden mit der Tabelle.
- Vor dem Drop muessen zwingend die fuenf Funktionskoerper und `sql/16_Explicit_Grants.sql` stock-log-frei sein.
- Ein fehlgeschlagener Drop darf nicht durch `cascade` erzwungen werden; ein unerwartetes Dependency ist ein Abbruchsignal.

#### S3.2 Sichere Clean-Start-Reihenfolge

Vor der Transaktion:

- user-gated Wartungsfenster bestaetigen.
- konkreten Zielnutzer und Wiener Stichtag setzen.
- Sicherheits-Snapshot fuer Stammdaten, Plaene und Bestaende erzeugen.
- bestaetigen, dass noch keine Einnahme und keine Medication-Push-Zustellung fuer den Stichtag erfolgt ist.

Innerhalb einer kurzen Transaktion:

1. Lokales `lock_timeout` von hoechstens 5 Sekunden und `statement_timeout` von hoechstens 60 Sekunden setzen.
2. Medication-Stammdaten, Schedule-Slots, Slot-Events und Stock-Log in dieser dokumentierten Reihenfolge exklusiv sperren.
3. Nach Lock-Erwerb alle Preconditions erneut pruefen:
   - Stock-Log existiert noch.
   - genau ein gemeinsamer Medication-Owner und keine Owner-Abweichung.
   - Zielnutzer entspricht diesem Owner.
   - keine Rebase-Kollision oder mehrdeutige gueltige Planversion.
   - Stichtag ist bewusst gesetzt.
4. Alle bisherigen Slot-Events des Zielnutzers loeschen.
5. `stock_decrement_qty` samt Check-Constraint ergaenzen.
6. Confirm, Undo, Adjust, Set und Reset durch ihre finalen stock-log-freien Definitionen ersetzen.
7. Historische und inaktive Altplaene entfernen, aktuelle Plaene kollisionsfrei rebasen und zukuenftige Plaene erhalten.
8. Low-Stock-Acknowledgements des Zielnutzers leeren.
9. Stock-Log ohne `cascade` entfernen.
10. Ergebniszaehler und Postconditions pruefen und erst danach committen.

Sicherheitswirkung:

- Ein Lock- oder Statement-Timeout bricht die gesamte Transaktion ohne Teilwirkung ab.
- Kein paralleler Confirm kann zwischen finaler Precondition und Event-Loeschung committen.
- DDL, Datenbereinigung, Rebase und Funktionsersetzung werden fuer andere Sessions erst gemeinsam beim Commit sichtbar.
- Das Script wird als Einmal-Transition behandelt und bricht klar ab, wenn der Stock-Log bereits fehlt.

Nach der Transition:

- aktualisiertes Explicit-Grants-SQL anwenden.
- Retention-/Cron-SQL separat anwenden.
- reale Packungsbestaende unmittelbar manuell setzen.
- PWA neu laden und Widget bewusst synchronisieren.

#### S3.3 Tages-, Push- und Widget-Risiko

Bestehender Vertrag:

- Morning-Reminder wird fachlich ab `10:00 Europe/Vienna` faellig.
- Der GitHub-Scheduler ruft Incident Push an relevanten UTC-Stunden bei Minute 17 und 37 auf; die Edge Function entscheidet nach Wiener Lokalzeit.
- Lokale Incident-Auswertung kann bei geoeffneter PWA ebenfalls auf einen offenen Tagesstatus reagieren.

Cutover-Vertrag:

- Cutover erfolgt vor der ersten Medication-Bestaetigung des Stichtags.
- Cutover erfolgt zusaetzlich vor `10:00 Europe/Vienna` und bevor eine Medication-Push-Zustellung fuer den Stichtag persistiert wurde.
- Falls eine dieser Bedingungen nicht erfuellt ist, wird auf den naechsten geeigneten Wiener Kalendertag verschoben.
- Nach dem Cutover ist ein offener Slot bis zur ersten neuen Bestaetigung fachlich korrekt und kein falscher Incident.
- PWA-Reload verhindert alte Cache- oder lokale Incident-Zustaende.
- Widget-Sync ist bewusst erforderlich, weil die installierte PWA den nativen Widget-Snapshot nicht direkt aktualisieren kann.
- Der bestehende Incident-Push-Code benoetigt keine Aenderung am Datenvertrag.

#### S3.4 Retention-Risiken

- Events werden vor Schedule-Slots geloescht; damit bleibt der Foreign-Key-Vertrag erhalten.
- Der Cutoff wird einmal pro Lauf in Wiener Datumsemantik berechnet.
- Der Grenztag bleibt erhalten; nur `day < cutoff` wird geloescht.
- Ein mit `day` beginnender Index begrenzt den globalen Event-Cleanup.
- Schedule-Slots werden nur bei `end_date < cutoff` und ohne erhaltenes Event geloescht.
- Aktuelle, offene und zukuenftige Plaene werden nicht beruehrt.
- Mehrfachausfuehrung ist idempotent.
- Die technische Diagnose enthaelt nur Cutoff und Loeschzaehler, keine Gesundheitsinhalte.
- Cron-Laufdetails werden nur fuer die aktuelle Job-ID von `midas-medication-retention-daily`, nur bei abgeschlossenem Lauf und nur aelter als 90 Tage geloescht.
- Ein fehlender Job-ID-Treffer darf keine fremden `cron.job_run_details` loeschen.

#### S3.5 Security-, RLS- und Grant-Vertrag

- Die drei verbleibenden Tabellen behalten RLS und ihre owner-basierten Policies.
- Bestehende RPCs bleiben `SECURITY INVOKER` mit festem `search_path`.
- Die Retention-Funktion bleibt ebenfalls `SECURITY INVOKER` und wird vom als Datenbank-Owner geplanten Cron-Job ausgefuehrt.
- PostgreSQL vergibt fuer neue Funktionen standardmaessig Execute an `PUBLIC`; blosses Weglassen eines Grants ist daher nicht ausreichend.
- Nach dem Erstellen der Retention-Funktion wird `EXECUTE` explizit fuer `PUBLIC`, `anon`, `authenticated` und `service_role` entzogen.
- Es wird kein `SECURITY DEFINER` verwendet, um Rechteprobleme zu umgehen.
- `sql/16_Explicit_Grants.sql` enthaelt nach dem Cutover weder Tabellen- noch Policy- oder Privilegverweise auf den Stock-Log.
- `stock_count >= 0` bleibt als DB-Constraint die letzte Guardrail hinter RPC- und RLS-Vertraegen.
- Supabase Security Advisor, Funktions-ACLs, RLS und Grants werden in S5 nach der Live-Anwendung erneut geprueft.

#### S3.6 Finale SQL-Dateistrategie

- `sql/12_Medication.sql`:
  - kanonischer Fresh-Project-Vertrag ohne Stock-Log.
  - drei Medication-Tabellen inklusive `stock_decrement_qty` und Bestands-Check.
  - finale RPC-Definitionen.
- `sql/16_Explicit_Grants.sql`:
  - explizite Grants nur fuer verbleibende Tabellen und bestehende externe RPCs.
  - kein Grant fuer interne Retention.
- `sql/17_Medication_Retention.sql`:
  - idempotente `pg_cron`-Aktivierung.
  - interne Retention-Funktion samt Execute-Revokes.
  - genau ein benannter Job und begrenzte eigene Laufhistorie.
- `sql/transition_medication_clean_start.sql`:
  - sichtbares, einmaliges und destruktives Live-Cutover-Artefakt.
  - Precondition-, Lock-, Daten-, DDL- und finale RPC-Aenderungen in einer Transaktion.
  - keine pauschale Ausfuehrung des Master-SQLs auf Produktion.
- Die fuenf im Transition-SQL benoetigten RPC-Definitionen muessen semantisch identisch zu ihren Definitionen in `sql/12_Medication.sql` sein.

#### S3.7 Review von S4 und S5

S4 wurde nachgeschaerft um:

- `stock_decrement_qty` samt Constraint und exakter Confirm-/Undo-Inversion.
- explizite Retention-Funktionsrechte statt nur fehlender User-Grants.
- feste Lock-Reihenfolge, Timeouts und erneuten Preflight nach Lock-Erwerb.
- finale RPC-Ersetzung vor dem Stock-Log-Drop.
- festen Cron-Namen, feste UTC-Zeit und 90-Tage-Laufhistorie.
- semantischen Gleichheitscheck der duplizierten RPC-Definitionen.

S5 wurde nachgeschaerft um:

- statische ACL-, Lock- und RPC-Gleichheitspruefungen.
- Confirm-/Undo-Grenzfall mit zu niedrigem Bestand.
- Concurrency- und Lock-Timeout-Review.
- Single-Owner-, Rebase- und Push-Delivery-Preconditions.
- Wartungsfenster vor erstem Confirm und vor `10:00 Europe/Vienna`.
- PWA-Reload und bewussten Widget-Sync.
- Funktions-ACL- und eigene Cron-Laufhistorienpruefung.

#### S3.8 Contract Review

Review gegen S1-Evidenz, S2-Zielvertrag und S4-/S5-Umsetzbarkeit:

- Der Drop-Abhaengigkeitsgraph ist vollstaendig und klein; kein unbekannter Runtime-Reader bleibt.
- `drop ... cascade` ist weder erforderlich noch zulaessig.
- Eine einzelne Transaktion war ohne explizite Locks noch nicht ausreichend gegen parallele RPCs abgesichert.
- Der Retention-Security-Vertrag war ohne ausdruecklichen `PUBLIC`-Revoke unvollstaendig.
- Das bisherige Zeitfenster `vor erster Bestaetigung` verhinderte einen spaeten Vormittags-Cutover und damit potenziell faellige Reminder nicht sicher.
- Die notwendige Duplizierung von fuenf RPCs in Master- und Transition-SQL brauchte einen expliziten Drift-Check.
- Die korrigierte Reihenfolge ist auf dem kleinen produktiven Bestand kurz, atomar und bei jeder verletzten Precondition abbrechbar.
- Keine S3-Entscheidung veraendert Produktfunktion oder fuehrt eine neue UI-/Reminder-Logik ein.

Review-Findings:

- `MDH-F21`: fehlende explizite Sperre gegen parallele Medication-Writes waehrend der Transition.
- `MDH-F22`: implizites `PUBLIC EXECUTE` auf der neuen internen Retention-Funktion.
- `MDH-F23`: zu schwaches Cutover-Fenster gegen bereits faellige Medication-Reminder.
- `MDH-F24`: moegliche semantische Drift duplizierter RPC-Definitionen zwischen Master und Transition.

#### S3.9 Korrekturen und Schritt-Abnahme

Korrekturen:

- `MDH-F21` bis `MDH-F24` in die Finding-Klassifizierung aufgenommen und mit Zielschritten versehen.
- S3.1 um Views, Materialized Views, Trigger, Publikationen und Foreign-Key-Richtungen erweitert.
- S3.2 auf kurze Timeouts, feste exklusive Lock-Reihenfolge, Preflight nach Lock-Erwerb und sichere DDL-/RPC-Reihenfolge konkretisiert.
- S3.3 um `10:00 Europe/Vienna`, Push-Delivery-Precondition, PWA-Reload und Widget-Sync erweitert.
- S3.5 und S4.6 um `SECURITY INVOKER`, festen `search_path` und explizite Execute-Revokes erweitert.
- S3.6, S4.10 und S5.2 um semantische Identitaet der fuenf duplizierten RPC-Definitionen erweitert.
- S4 Readiness Review um Single-Owner-, Lock-, ACL- und Cutover-Zeitfragen erweitert.
- S4.8 und S5 um Concurrency-, Security-, Push- und Post-Cutover-Smokes erweitert.
- Handoff, Statusmatrix und aktueller Schritt auf den S4 Readiness Review synchronisiert.

Schritt-Abnahme:

- S3.1 bis S3.9 wurden deterministisch abgeschlossen.
- Alle bekannten Drop-, Datenverlust-, Concurrency-, Reminder-, Security-, Grant- und Provisioning-Risiken besitzen einen pruefbaren Vertrag.
- Kein P0-Finding ist ohne konkrete Korrektur oder spaeteren Testschritt offen.
- Es wurden nur lokale Dateien gelesen, read-only Metadaten abgefragt und die Roadmap korrigiert.
- Kein SQL-Code und keine produktive Aenderung wurden vorgezogen.
- S3 ist `DONE`; der naechste erlaubte Schritt ist der S4 Readiness Review.

### S4 Readiness Review 2026-07-11

#### Gate-Pruefung gegen S1-S3

- Stock-Log-Abhaengigkeiten: `PASS`.
  - Confirm und Undo liegen in S4.2.
  - Adjust und Set liegen in S4.3.
  - Reset und Delete liegen in S4.4.
  - Tabelle, Policies, Indizes, Kommentare und Grants werden erst in S4.5 entfernt.
- Artefakttrennung: `PASS`.
  - `sql/12_Medication.sql` bleibt Fresh-Project-Source-of-Truth.
  - `sql/16_Explicit_Grants.sql` bleibt Grant-Vertrag.
  - `sql/17_Medication_Retention.sql` bleibt idempotentes Betriebsartefakt.
  - `sql/transition_medication_clean_start.sql` bleibt einmalige Live-Transition.
- Fresh-Project-Vertrag: `PASS mit S5-Pflichtnachweis`.
  - Drei verbleibende Tabellen, neue Event-Spalte, Constraints und finale RPCs sind S4 zugeordnet.
  - S5 prueft `12 + 16 + 17` auf leerem Testbestand und im zweiten Lauf.
- Existing-Project-Idempotenz: `PASS nach Korrektur`.
  - Neue Spalte und Constraints werden nicht nur in `create table if not exists` ergaenzt, sondern erhalten eigene idempotente Konvergenzpfade.
- Explicit Grants nach Drop: `PASS`.
  - Stock-Log-Grants werden synchron mit der kanonischen Tabellenentfernung in S4.5 entfernt.
- Einmal-Transition: `PASS`.
  - sichtbare Warnung, Zielnutzer, Stichtag, Existenzguard und vollstaendiger Abbruch bei Wiederholung sind in S4.8 Pflicht.
- Single-Owner und Zieluser: `PASS`.
  - produktiv read-only bestaetigt und im Transition-SQL nach Lock-Erwerb erneut zu beweisen.
- Concurrency: `PASS nach Korrektur`.
  - feste exklusive Lock-Reihenfolge, kurze Timeouts und finaler Preflight verhindern parallele Teilwirkung.
- Schedule-Rebase: `PASS`.
  - aktuelle, historische, inaktive und zukuenftige Plaene sind getrennt; Unique-Kollisionen brechen vor jeder Aenderung ab.
- Low-Stock: `PASS`.
  - Ack-Felder werden beim Clean Start geleert; der Bestand bleibt erhalten und
    wird physisch geprueft, nicht grundlos neu geschrieben.
- Cutoff: `PASS`.
  - Wiener Kalendertag minus ein Kalenderjahr, Grenztag inklusive.
- Retention-Security: `PASS nach Korrektur`.
  - `SECURITY INVOKER`, fester `search_path` und Execute-Revokes fuer `PUBLIC`, `anon`, `authenticated` und `service_role` sind S4.6 zugeordnet.
- Cron: `PASS`.
  - Extension vor Cron-Abhaengigkeiten, fester Jobname, `03:15 UTC`, Idempotenz und 90-Tage-Historie sind in S4.6/S4.7 getrennt.
- Reminder-/Cutover-Fenster: `PASS`.
  - vor erster Bestaetigung, vor `10:00 Europe/Vienna` und vor jeder Medication-Push-Zustellung.
- RPC-Identitaet: `PASS mit S5-Pflichtnachweis`.
  - die fuenf duplizierten Definitionen werden in S4.10 und S5 semantisch verglichen.
- Testabdeckung: `PASS nach Korrektur`.
  - Bootstrap, Rerun, erfolgreiche Transition, absichtlicher Precondition-Abbruch, Lock-Timeout, RPC-Grenzfaelle, Push, Widget, ACL und Cron sind S5 zugeordnet.
- User Gates: `PASS`.
  - S4 bleibt rein lokal; produktive SQL-Ausfuehrung, `pg_cron`, Clean Start und Runtime-Smokes mit Schreibwirkung bleiben S5 und expliziter Freigabe vorbehalten.

#### Readiness-Contract-Review

Findings:

- `MDH-F25`: Die alte S4.1-Reihenfolge haette das kanonische SQL zwischen S4.1 und S4.4 strukturell gebrochen, weil Funktionen eine bereits entfernte Tabelle referenziert haetten.
- `MDH-F26`: Neue Spalten und Constraints nur in einer `create table if not exists`-Definition sind kein idempotenter Existing-Project-Vertrag.
- `MDH-F27`: Eine Funktion kann nicht deterministisch in einem Retention-Artefakt aufgebaut werden, das erst im Folgeschritt angelegt wird.
- `MDH-F28`: Fresh-Project- und Idempotenzfaehigkeit benoetigten ausfuehrbare S5-Nachweise statt nur statischer Behauptungen.
- `MDH-F29`: S4 konnte nicht gleichzeitig nur Doku vorbereiten und bereits den finalen S6-Dokuvertrag als Exit-Kriterium verlangen.

Korrekturen:

- S4 auf zehn Substeps neu sortiert.
- S4.1 auf Guardrails und Event-Schema begrenzt; der Stock-Log bleibt als temporaerer Zwischenvertrag bestehen.
- Alle fuenf Funktionsreferenzen werden in S4.2-S4.4 entfernt.
- Kanonischer Tabellen-Drop und Grants wurden gemeinsam nach S4.5 verschoben.
- S4.1 um idempotente Existing-Project-Konvergenz fuer Spalte und Constraints erweitert.
- `sql/17_Medication_Retention.sql` wird nun in S4.6 vor Funktion und Cron angelegt.
- Cron-Registrierung wurde als eigener S4.7-Substep getrennt.
- Transition wurde nach S4.8 verschoben und um die Bestands-Constraint-Konvergenz ergaenzt.
- Downstream-Review und Gesamt-Review wurden auf S4.9 und S4.10 verschoben.
- Historische Substep-Referenzen im Ergebnisprotokoll wurden auf die neue Nummerierung synchronisiert.
- S5 um leeren Bootstrap, zweiten Lauf, disposable Transition-Fixtures und Rollback-/Lock-Timeout-Nachweise erweitert.
- S4.10 auf SQL-/Grant-/Runtime-Abnahme begrenzt; finale Source-of-Truth-Doku-Abnahme bleibt deterministisch in S6.

#### Gate-Abnahme

- Alle Readiness-Fragen sind nach den Korrekturen mit `PASS` beantwortet.
- S4 hat keine offene Dateistrategie, Abhaengigkeit, Reihenfolge oder Produktentscheidung.
- Jeder S4-Substep besitzt einen klaren Artefaktumfang sowie anschliessenden Code-/SQL- und Contract Review mit Findings-Korrektur.
- Kein P0/P1-Finding ist ohne Umsetzungs- und spaeteren Nachweisschritt.
- Im Readiness Review wurden nur Roadmap-Aenderungen vorgenommen; kein Produktcode, SQL-Artefakt oder produktives Schema wurde geaendert.
- Das Gate ist `PASS`; der naechste erlaubte Schritt ist S4.1.

### Modell- und Reasoning-Review 2026-07-11

Offiziell geprueft und nach der VS-Code-Modellwechselwarnung nachgeschaerft:

- Sol ist das Frontier-Modell der GPT-5.6-Familie fuer komplexe professionelle Arbeit.
- Terra balanciert Intelligenz und Kosten; Luna ist fuer kostenkritische Hochvolumen-Workloads optimiert.
- OpenAI quantifiziert keinen pauschalen Qualitaetsverlust beim Wechsel zwischen diesen Varianten.
- Reasoning-Stufe und Modellwahl sind getrennte Entscheidungen; hoehere Stufen sollen nur verwendet werden, wenn die konkrete Aufgabe davon profitiert.
- Fuer eine lange, validierungsnahe MIDAS-Roadmap ist Modellkontinuitaet wichtiger als ein theoretischer Verbrauchsvorteil durch Variantenwechsel.

Finale Entscheidung fuer diese Roadmap:

- GPT-5.6 Sol bleibt von S1 bis S6 sowie in jedem S4-Substep das feste Modell.
- S1-S4.7, S4.10, S5 und S6 verwenden High, weil Detektivarbeit, Umsetzung und Review jeweils in einem gemeinsamen Schritt gebuendelt sind.
- S4.8 verwendet Extra High wegen destruktiver Transition, Locks, Preconditions, Rebase und projektweitem Drop.
- Nur S4.9 verwendet Medium, weil der Schritt auf deterministische Consumer-Scans und Doku-Vorbereitung begrenzt ist.
- Max und Ultra bleiben Ausnahme-Eskalationen und sind kein regulaerer Roadmap-Schritt.

Contract Review und Korrekturen:

- Sol als durchgaengendes Modell direkt bei S1, S2, S3, Gate, jedem S4-Substep, S5 und S6 eingetragen.
- Reasoning-Stufen nach Arbeitsaufwand, Risiko und Review-Tiefe individuell festgelegt.
- Generellen Auswahl-, Eskalations- und Fallback-Vertrag auf Modellkontinuitaet mit variabler Reasoning-Stufe umgestellt.
- Bestehende S4-Nummerierung und die nach dem Gate tatsaechlichen Risiken verwendet.
- Keine konkrete Tokenersparnis versprochen; Verbrauch bleibt von Modell, Kontextlaenge, Komplexitaet, Tool-Laufzeit und Ausgabelaenge abhaengig.
- Reasoning-Auswahl bleibt manuell und beeinflusst keine fachliche Abnahme.
- Keine Code-, SQL- oder Produktivwirkung.

### S4.1 - Kanonische Bestands- und Event-Guardrails 2026-07-11

Umgesetzt:

- `health_medications.stock_count` besitzt im Fresh-Table-Vertrag den benannten Check `stock_count >= 0`.
- Fuer bestehende Medication-Tabellen wird derselbe Check ueber einen idempotenten Katalog-Guard ergaenzt.
- `health_medication_slot_events.stock_decrement_qty` ist im Fresh-Table-Vertrag als `int not null default 0` enthalten.
- Fuer bestehende Event-Tabellen wird die Spalte idempotent angelegt, sicher mit `0` befuellt und anschliessend auf Default und `not null` konvergiert.
- Der benannte Event-Check erzwingt `0 <= stock_decrement_qty <= qty` fuer Fresh- und Existing-Project-Pfade.
- Der Stock-Log und alle bisherigen Confirm-, Undo-, Adjust-, Set- und Reset-Referenzen bleiben bis zu ihren vorgesehenen Folgeschritten unveraendert.

Code-/SQL- und Contract Review:

- `git diff --check -- sql/12_Medication.sql`: `PASS`.
- Statischer Scope-Scan bestaetigt den weiterhin vorhandenen Stock-Log und dessen bisherigen Writer.
- Fresh-Project-Definition und Existing-Project-Konvergenz wurden getrennt gegen `MDH-F13` und `MDH-F26` geprueft.
- Wiederholung erzeugt weder eine zweite Spalte noch einen zweiten benannten Check; Null-Backfill ist bei Folgelaeufen ein No-op.
- Historische Events erhalten bewusst den neutralen Wert `0`, da die tatsaechlich geklemmte Bestandsreduktion rueckwirkend nicht belastbar rekonstruierbar ist und der produktive Clean Start spaeter alle Alt-Events entfernt.
- Kein produktives SQL wurde ausgefuehrt.

Findings-Korrektur und Schritt-Abnahme:

- `MDH-F13` ist lokal implementiert; der ausfuehrbare Nachweis bleibt S5.
- `MDH-F26` ist lokal implementiert; Bootstrap- und Rerun-Nachweis bleiben S5.
- Im S4.1-Review wurde kein zusaetzliches P0-/P1-Finding gefunden.
- S4.1 ist `DONE`; der naechste erlaubte Schritt ist S4.2.

### S4.2 - Confirm- und Undo-Vertrag 2026-07-11

Umgesetzt:

- `med_confirm_slot_v2` berechnet unter dem bestehenden Medication-/Slot-Row-Lock `stock_decrement_qty = least(vorheriger Bestand, Slot-Dosis)`.
- Das Slot-Event speichert weiterhin die dokumentierte Dosis in `qty` und zusaetzlich die tatsaechliche Bestandsreduktion in `stock_decrement_qty`.
- Der neue Bestand wird exakt um `stock_decrement_qty` reduziert und bleibt dadurch auch bei einem zu niedrigen getrackten Bestand nichtnegativ.
- Der bestehende Unique-/Conflict-Pfad bleibt vor dem Bestandsupdate; ein Doppel-Confirm bleibt ein erfolgreicher No-op.
- `med_undo_slot_v2` liest die gespeicherte Reduktion aus dem gesperrten Event, loescht das Event und stellt nur diesen Wert wieder her.
- Confirm und Undo schreiben nicht mehr in `health_medication_stock_log`.
- Signaturen, Rueckgabetypen, Auth-Pruefungen und Fehlercodes der beiden RPCs bleiben unveraendert.

Code-/SQL- und Contract Review:

- Statische Vertragschecks fuer beide Funktionsbloecke: `PASS`.
- Grenzwerttabelle:
  - Bestand `5`, Dosis `2`: Reduktion `2`, danach `3`, nach Undo wieder `5`.
  - Bestand `1`, Dosis `2`: Reduktion `1`, danach `0`, nach Undo wieder `1`.
  - Bestand `0`, Dosis `2`: Reduktion `0`, danach `0`, nach Undo wieder `0`.
- Doppel-Confirm aktualisiert den Bestand erst nach einem tatsaechlich eingefuegten Event.
- Undo ohne Event erreicht weiterhin vor Event-Loeschung oder Bestandsupdate den Fehler `no slot event to undo for this day`.
- Event- und Bestandsaenderung bleiben innerhalb desselben RPC-Aufrufs und damit derselben Datenbanktransaktion.
- `git diff --check -- sql/12_Medication.sql`: `PASS`.
- Kein lokaler oder produktiver Datenbanklauf wurde in S4.2 ausgefuehrt.

Findings-Korrektur und Schritt-Abnahme:

- `MDH-F19` ist lokal implementiert; der ausfuehrbare Datenbanknachweis bleibt S5.
- Review-Finding: Nach Entfernung des Undo-Log-Writers enthielt der Lock-Select nicht mehr verwendete Eventfelder. Der Select wurde auf die benoetigte `med_id` reduziert; Lock-, Fehler- und Transaktionssemantik bleiben unveraendert.
- Confirm und Undo sind stock-log-frei. Die verbleibenden Writer liegen vertragsgemaess in Adjust und Set; Reset besitzt noch den verbleibenden Delete-Verweis fuer S4.4.
- Im S4.2-Review bleibt kein neues P0-/P1-Finding offen.
- S4.2 ist `DONE`; der naechste erlaubte Schritt ist S4.3.

### S4.3 - Adjust-, Set- und Restock-Vertrag 2026-07-11

Umgesetzt:

- `med_adjust_stock_v2` sperrt den eigenen Medication-Datensatz vor der Zielwertberechnung mit `for update`.
- Der Adjust-Zielbestand wird als `bigint` berechnet, vor dem Write gegen Unterlauf und Integer-Ueberlauf geprueft und erst danach als `int` persistiert.
- Null-Delta und fehlendes Delta bleiben ungueltig; ein Zielbestand unter `0` liefert den fachlichen Fehler `stock target must be >= 0`.
- `med_set_stock_v2` sperrt und liest den vollstaendigen Medication-Datensatz vor dem Vergleich.
- Set auf den vorhandenen Bestand liefert den gesperrten aktuellen Datensatz als erfolgreichen No-op zurueck und fuehrt kein Update aus.
- Fehlender oder negativer Set-Bestand wird vor einem Write klar abgewiesen.
- Adjust, Set und der ueber Adjust laufende Restock erzeugen keine Stock-Historie mehr.
- Die Parameter `p_reason` bleiben ausschliesslich fuer API-Kompatibilitaet in beiden stabilen RPC-Signaturen erhalten.

Code-/SQL- und Contract Review:

- Statische Vertragschecks fuer Adjust und Set: `PASS`.
- Grenzwerte:
  - Bestand `10`, Delta `+5`: Ziel `15`, gueltig.
  - Bestand `10`, Delta `-3`: Ziel `7`, gueltig.
  - Bestand `2`, Delta `-3`: Ziel `-1`, kontrollierter Abbruch vor dem Write.
  - Bestand `2147483647`, Delta `+1`: kontrollierter Integer-Grenzfehler vor dem Write.
- Set-No-op liegt nach Row-Lock und vor dem Update.
- RPC-Namen, Parameter, Defaults, Rueckgabetyp, Auth-Vertrag, `security invoker` und Grants bleiben unveraendert.
- Es verbleibt kein `insert into health_medication_stock_log`; nur der fuer S4.4 vorgesehene Reset-Delete-Verweis ist noch aktiv.
- `git diff --check -- sql/12_Medication.sql`: `PASS`.
- Kein lokaler oder produktiver Datenbanklauf wurde in S4.3 ausgefuehrt.

Findings-Korrektur und Schritt-Abnahme:

- `MDH-F7` ist lokal implementiert; der ausfuehrbare Datenbanknachweis bleibt S5.
- `MDH-F30` wurde durch die kontrollierte `bigint`-Zielberechnung und den expliziten Integer-Grenzcheck korrigiert.
- Review-Finding: Die nun absichtlich ungenutzten `p_reason`-Parameter waren ohne Erklaerung missverstaendlich. Der API-Kompatibilitaetsgrund ist direkt an beiden Funktionen dokumentiert.
- Im S4.3-Review bleibt kein neues P0-/P1-Finding offen.
- S4.3 ist `DONE`; der naechste erlaubte Schritt ist S4.4.

### S4.4 - Reset- und Delete-Vertrag 2026-07-11

Umgesetzt:

- `med_reset_all_data_v2` loescht weiterhin zuerst eigene Slot-Events, danach eigene Schedule-Slots und zuletzt eigene Medication-Stammdaten.
- Variable, Delete-Block und Rueckgabe-Key fuer `health_medication_stock_log` wurden vollstaendig aus Reset entfernt.
- Der Reset-Payload enthaelt exakt `deleted_slot_events`, `deleted_schedule_slots` und `deleted_medications`.
- `med_delete_v2` blieb unveraendert, da die Funktion nur den eigenen Medication-Masterdatensatz loescht und keine direkte Stock-Log-Referenz besitzt.

Code-/SQL- und Contract Review:

- Statischer Reset-/Delete-Vertragscheck: `PASS`.
- Kein aktiver `med_*_v2`-RPC referenziert nach S4.4 noch `health_medication_stock_log`.
- Schedule-Slots und Slot-Events besitzen weiterhin `med_id`-Foreign-Keys mit `on delete cascade` auf `health_medications`.
- Solange die Stock-Log-Tabelle bis S4.5 noch existiert, entfernt ihr eigener `med_id ... on delete cascade` beim Reset oder Einzel-Delete weiterhin zugehoerige Altzeilen.
- Nach dem Tabellen-Drop in S4.5 bleibt `med_delete_v2` ohne Definitionaenderung gueltig.
- Kein aktiver Consumer fuer `deleted_stock_logs` wurde gefunden.
- RPC-Signaturen, Rueckgabetypen, Auth-Vertrag, `security invoker` und Grants bleiben in S4.4 unveraendert.
- `git diff --check -- sql/12_Medication.sql`: `PASS`.
- Kein lokaler oder produktiver Datenbanklauf wurde in S4.4 ausgefuehrt.

Findings-Korrektur und Schritt-Abnahme:

- `MDH-F16` ist lokal implementiert; der ausfuehrbare Reset-Payload-Nachweis bleibt S5.
- `MDH-F2` ist auf RPC-Ebene korrigiert; nur kanonische Tabelle und Grants bleiben fuer S4.5 offen.
- `med_delete_v2` benoetigte nach dem FK- und Drop-Review keine Codeaenderung.
- Im S4.4-Review bleibt kein neues P0-/P1-Finding offen.
- S4.4 ist `DONE`; der naechste erlaubte Schritt ist S4.5.

### S4.5 - Kanonische Stock-Log-Entfernung und Grants 2026-07-11

Umgesetzt:

- Tabellenanlage, Existing-Project-Alter-Pfade, Kommentar, Index, RLS-Aktivierung und drei Policies von `health_medication_stock_log` wurden aus `sql/12_Medication.sql` entfernt.
- Revoke- und Grant-Statements fuer die entfernte Tabelle wurden aus dem Medication-Block von `sql/16_Explicit_Grants.sql` entfernt.
- Die drei verbleibenden Medication-Tabellen behalten `select`, `insert`, `update` und `delete` fuer `authenticated` und `service_role`.
- Alle elf externen `med_*_v2`-RPCs behalten explizites Revoke fuer `anon`, `public`, `authenticated` und `service_role` sowie anschliessendes Execute fuer `authenticated` und `service_role`.

Code-/SQL- und Contract Review:

- Statischer Scan ueber das gesamte aktive `sql/`-Verzeichnis: kein Stock-Log-Verweis, `PASS`.
- Tabellenrechte fuer `health_medications`, `health_medication_schedule_slots` und `health_medication_slot_events`: jeweils Revoke und Grant vorhanden.
- Funktionsrechte fuer alle elf Medication-RPCs: jeweils Revoke und Grant vorhanden.
- `sql/12_Medication.sql` bleibt nach Entfernung des Stock-Log-Blocks syntaktisch zusammenhaengend und endet weiterhin im gemeinsamen Transaktionsrahmen.
- `git diff --check -- sql/12_Medication.sql sql/16_Explicit_Grants.sql`: `PASS`.
- Veraltete Stock-Log-Aussagen im Medication Module Overview bleiben fuer die geplante Doku-Vorbereitung in S4.9 und den finalen S6-Sync sichtbar.
- Kein lokaler oder produktiver Datenbanklauf wurde in S4.5 ausgefuehrt.

Findings-Korrektur und Schritt-Abnahme:

- `MDH-F1`, `MDH-F2`, `MDH-F3`, `MDH-F9` und `MDH-F25` sind lokal implementiert; produktive Nachweise bleiben S5.
- `MDH-F31` korrigiert den Abnahmevertrag: Das einmalige Transition-SQL darf und muss den alten Stock-Log fuer Precondition und Drop referenzieren; kanonisches und operatives SQL, Grants und Runtime bleiben stock-log-frei.
- Im S4.5-Code-/Grant-Review wurde kein weiteres P0-/P1-Finding gefunden.
- S4.5 ist `DONE`; der naechste erlaubte Schritt ist S4.6.

### S4.6 - Retention-SQL und interne Cleanup-Funktion 2026-07-11

Umgesetzt:

- `sql/17_Medication_Retention.sql` wurde als separates, idempotentes und
  user-gated Betriebsartefakt angelegt.
- `pg_cron` wird mit `create extension if not exists` vor jeder Abhaengigkeit
  vom `cron`-Schema aktiviert.
- Der fuehrende Index `idx_medication_slot_events_day` unterstuetzt den
  rollenden Cutoff auf `health_medication_slot_events.day`.
- `med_retention_cleanup_internal()` berechnet den Wiener Kalendertag minus
  ein Kalenderjahr genau einmal und behaelt den Grenztag durch den Vergleich
  `day < cutoff` vollstaendig bei.
- Die Funktion loescht zuerst abgelaufene Slot-Events und danach nur
  Schedule-Slots, deren `end_date` ebenfalls vor dem Cutoff liegt und fuer die
  kein erhaltenes Event mehr existiert.
- Abgeschlossene `cron.job_run_details` werden nur fuer genau einen eindeutig
  gefundenen Job `midas-medication-retention-daily` und nur bei einem Alter von
  mehr als 90 Tagen entfernt.
- Die Rueckgabe dokumentiert Cutoff, Event-, Slot- und Cron-Loeschzaehler sowie
  die Anzahl gleichnamiger Cron-Jobs.
- Die Funktion ist `SECURITY INVOKER`, verwendet den festen `search_path`
  `pg_catalog` und entzieht `EXECUTE` explizit fuer `PUBLIC`, `anon`,
  `authenticated` und `service_role`.
- Die Cron-Registrierung ist bewusst noch nicht enthalten und bleibt S4.7.

Code-/SQL- und Contract Review:

- Reihenfolge Extension, Index, Funktion, Kommentar und Rechteentzug: `PASS`.
- Cutoff-Vertrag mit Wiener Kalenderdatum, strikt kleiner Grenze und einmaliger
  Berechnung: `PASS`.
- Loeschreihenfolge Events vor Slots sowie Schutz erhaltener Event-Referenzen:
  `PASS`.
- Cron-Laufdetails werden weder global noch bei fehlendem oder mehrfach
  vorhandenem Jobnamen bereinigt; nur der eindeutige eigene Job ist betroffen:
  `PASS`.
- Keine direkten Writes auf `cron.job` und noch kein
  `cron.schedule`-/`cron.alter_job`-/`cron.unschedule`-Aufruf: `PASS`.
- Das Artefakt ist transaktional und fuehrt die Cleanup-Funktion bei seiner
  Provisionierung nicht aus.
- Kein lokaler oder produktiver Datenbanklauf wurde in S4.6 ausgefuehrt.

Findings-Korrektur und Schritt-Abnahme:

- `MDH-F4`, `MDH-F8`, `MDH-F14`, `MDH-F22` und `MDH-F27` sind lokal
  implementiert; ausfuehrbare Retention-, ACL- und Idempotenznachweise bleiben
  S5.
- `MDH-F15` ist fuer die Cleanup-Funktion umgesetzt; die Job-Provisionierung
  und damit der vollstaendige Laufhistorienvertrag folgen in S4.7.
- `MDH-F32` korrigiert die missverstaendliche Betriebs-Copy: Das SQL
  provisioniert die Funktion, waehrend Loeschungen erst bei einem spaeteren
  Funktionsaufruf erfolgen.
- Im S4.6-Code-/Security-/Contract-Review bleibt kein neues P0-/P1-Finding
  offen.
- S4.6 ist `DONE`; der naechste erlaubte Schritt ist S4.7.

### S4.7 - Idempotenter Cron-Vertrag 2026-07-11

Umgesetzt:

- `sql/17_Medication_Retention.sql` provisioniert genau den benannten Job
  `midas-medication-retention-daily` mit dem UTC-Cron-Ausdruck
  `15 3 * * *`.
- Der Job ruft ausschliesslich
  `public.med_retention_cleanup_internal()` auf.
- Ein fehlender Job wird mit dem dokumentierten benannten `cron.schedule`-Pfad
  angelegt; ein vorhandener Job desselben Owners wird dabei aktualisiert.
- `cron.alter_job` setzt Schedule, Command und `active = true` anschliessend
  explizit auf den reviewten Vertrag.
- Vor der Jobanlage wird geprueft, dass die ausfuehrende Rolle RLS global
  umgehen und die interne Cleanup-Funktion selbst ausfuehren kann.
- Mehrere gleichnamige Jobs oder ein einzelner Job eines anderen Owners
  brechen die Transaktion mit einer konkreten Diagnose ab.
- Die Nachpruefung beweist Job-ID, Owner, Datenbank, Schedule, Command,
  Aktivstatus und globale Eindeutigkeit; jede Abweichung rollt die gesamte
  Provisionierung zurueck.
- Ein erfolgreicher Lauf meldet Jobname, Job-ID und `03:15 UTC` als Notice.

Code-/SQL- und Contract Review:

- Aktuelle Supabase-Cron-Dokumentation und upstream `pg_cron`-Signaturen fuer
  `cron.schedule` und `cron.alter_job` erneut geprueft: `PASS`.
- Ausschliesslich dokumentierte Cron-Funktionen; keine direkten Writes auf
  `cron.job`: `PASS`.
- Erstlauf, Wiederholung desselben Owners, deaktivierter Bestandsjob,
  Fremd-Owner und unerwartete Duplikate besitzen deterministische Pfade.
- Schedule und Anzeigevertrag entsprechen taeglich `03:15 UTC`; die spaetere
  Cleanup-Funktion berechnet ihren fachlichen Stichtag separat in
  `Europe/Vienna`.
- Der Cron-Job kann nicht als `anon`, `authenticated` oder `service_role`
  provisioniert werden und laeuft nur unter einer berechtigten Datenbankrolle.
- Alle statischen S4.7-Vertragschecks und `git diff --check`: `PASS`.
- `psql` und `sqlfluff` sind lokal nicht verfuegbar; der ausfuehrbare
  Bootstrap-, Rerun- und Cron-Nachweis bleibt deshalb wie geplant S5.
- Kein lokaler oder produktiver Datenbanklauf wurde in S4.7 ausgefuehrt.

Findings-Korrektur und Schritt-Abnahme:

- `MDH-F10`, `MDH-F14` und `MDH-F15` sind lokal vollstaendig implementiert;
  der produktive Nachweis bleibt S5.
- `MDH-F33` korrigiert die im ersten Entwurf zu schwache Owner-Annahme:
  benannte Idempotenz allein beweist keine globale Eindeutigkeit ueber mehrere
  Job-Owner hinweg.
- `MDH-F32` wurde gegen den S5-Bootstrap-Vertrag nachgeschaerft: Nur ein
  bestehendes Projekt verlangt zuvor den Clean Start; ein frischer oder
  disposable Aufbau darf `12 + 16 + 17` in dieser Reihenfolge ausfuehren.
- Der korrigierte Vertrag verlangt RLS-Bypass, prueft Fremd-Owner und globale
  Duplikate sowie das `EXECUTE`-Recht der Job-Rolle vor jeder Anlage.
- Im finalen S4.7-Code-/Security-/Contract-Review bleibt kein neues
  P0-/P1-Finding offen.
- S4.7 ist `DONE`; der naechste erlaubte Schritt ist S4.8.

### S4.8 - Einmalige Clean-Start-Transition 2026-07-11

Umgesetzt:

- `sql/transition_medication_clean_start.sql` wurde als sichtbares,
  destruktives, einmaliges und weiterhin nicht ausgefuehrtes Cutover-Artefakt
  angelegt.
- Der read-only Live-Abgleich bestaetigte den expliziten Zielnutzer
  `67167408-fb63-4432-83c9-33ae7ac6c9ef` mit drei Medication-Stammsaetzen.
- Der Wiener Stichtag wird beim spaeter freigegebenen Lauf genau einmal aus
  `statement_timestamp()` bestimmt und im Ergebnis dokumentiert.
- `lock_timeout = 5s` und `statement_timeout = 60s` gelten lokal in der
  Transition.
- Medication-Stammdaten, Schedule-Slots, Slot-Events und Stock-Log werden in
  dieser festen Reihenfolge mit `ACCESS EXCLUSIVE` gesperrt.
- Nach Lock-Erwerb prueft der finale Preflight:
  - RLS-Bypass der ausfuehrenden Datenbankrolle.
  - unveraenderten Wiener Tag und lokale Uhrzeit vor `10:00`.
  - Existenz des Zielnutzers und des einmaligen Stock-Log-Guards.
  - genau einen gemeinsamen Owner sowie konsistente Medication-, Slot-, Event-
    und Stock-Log-Zuordnungen.
  - keine negativen Bestaende.
  - keinen Confirm und keine persistierte Medication-Push-Zustellung am
    Stichtag.
  - keine mehrdeutige aktuelle Planversion je Medication und `sort_order`.
- Erst danach loescht die Transition die bisherigen Zielnutzer-Events,
  konvergiert `stock_decrement_qty` und beide Bestandsconstraints und ersetzt
  die fuenf finalen RPCs.
- Historische sowie inaktive Altplaene werden entfernt, aktuelle aktive Plaene
  auf den Stichtag rebased und spaeter beginnende Plaene unveraendert erhalten.
- Low-Stock-Acknowledgements werden geleert.
- `health_medication_stock_log` wird genau einmal und ohne `cascade` entfernt;
  `stock_count` wird nicht automatisch veraendert.
- Ergebnisdiagnose umfasst Stichtag, erhaltene Medication-/Zukunftsplan-Zahlen,
  entfernte Stock-Log-, Event- und Altplan-Zahlen, Rebase-Zahl sowie geleerte
  Acknowledgements.

Code-/SQL- und Contract Review:

- Alle fuenf duplizierten RPC-Koerper sind nach Whitespace-Normalisierung exakt
  identisch zu `sql/12_Medication.sql`: `PASS`.
- Vor dem finalen Post-Lock-Preflight existiert kein produktiver
  `insert`-/`update`-/`delete`-Pfad: `PASS`.
- Lock-Reihenfolge, Timeout-Vertrag, Single-Owner-, Push-, Tages- und
  Rebase-Preconditions: `PASS`.
- Events werden vor Slot-Bereinigung geloescht; Schema und RPCs werden vor dem
  Stock-Log-Drop konvergiert: `PASS`.
- Zukuenftige Plaene und Medication-Bestaende werden vor und nach dem Umbau
  ueber Fingerprints verglichen: `PASS`.
- Postconditions beweisen entfernte Altobjekte, vollstaendigen Rebase,
  leere Acknowledgements, vorhandene Constraints und stock-log-freie RPCs.
- Der fehlende Stock-Log ist der dauerhafte Wiederholungs-Guard; jeder Fehler
  oder Timeout rollt die gesamte Transaktion zurueck.
- `drop ... cascade` ist nicht enthalten; unerwartete Abhaengigkeiten bleiben
  ein bewusstes Abbruchsignal.
- Alle statischen S4.8-Vertragschecks und `git diff --check`: `PASS`.
- Kein lokaler oder produktiver Transition-Lauf wurde in S4.8 ausgefuehrt;
  erfolgreiche, fehlschlagende und Lock-Timeout-Fixtures bleiben S5.

Findings-Korrektur und Schritt-Abnahme:

- `MDH-F6`, `MDH-F11`, `MDH-F12`, `MDH-F17`, `MDH-F20`, `MDH-F21`,
  `MDH-F23`, `MDH-F24` und `MDH-F31` sind lokal umgesetzt; ihre ausfuehrbaren
  Nachweise bleiben S5.
- `MDH-F34` verhindert einen veralteten, beim Schreiben fest codierten
  Cutover-Tag. Der runtime-ermittelte Wiener Tag wird nach Lock-Erwerb nochmals
  geprueft und als Resultat ausgegeben.
- Review-Nachschaerfung: Die Zahl der beim Drop entfernten Stock-Log-Zeilen ist
  nun Teil der Ergebnisdiagnose.
- Im finalen S4.8-Code-/SQL-/Security-/Contract-Review bleibt kein neues
  P0-/P1-Finding offen.
- S4.8 ist `DONE`; der naechste erlaubte Schritt ist S4.9.

### S4.9 - Downstream- und Doku-Vorbereitung 2026-07-11

Deterministischer Consumer-Scan:

- PWA Medication und Intake verwenden weiterhin die stabilen
  `med_*_v2`-RPCs, Stammdaten, Schedule-Slots und Slot-Events.
- Assistant/Voice bestaetigt weiterhin nur konkrete Tagesabschnitte ueber die
  bestehende Medication-Modul-API.
- Incident Push liest Medication-Stammdaten, gueltige Schedule-Slots und
  Slot-Events; der entfernte Stock-Log und der geaenderte Reset-Payload werden
  nicht konsumiert.
- Android Widget und Realtime beobachten Stammdaten, Schedule-Slots und
  Slot-Events; kein Stock-Log-Vertrag ist vorhanden.
- Reports und Doctor View besitzen keinen Stock-Log-Reader und keinen
  Medication-Reset-Payload-Consumer.
- Der erneute Scan ueber `app/`, `android/` und `backend/` fand keinen Verweis
  auf `health_medication_stock_log`, `deleted_stock_logs` oder einen sonstigen
  Stock-Log-Vertrag.

Umgesetzt:

- Kein Client-, Backend-, Edge-Function- oder Android-Code wurde geaendert,
  weil alle Runtime-Consumer mit stabilen Tabellen- und RPC-Vertraegen
  kompatibel bleiben.
- Das Medication Module Overview besitzt einen klar markierten Pending-Block:
  - regulaere Abschnitte beschreiben bis S5 weiterhin den produktiven
    Altvertrag.
  - der vorbereitete Zielvertrag nennt drei Tabellen, aktuellen Bestand ohne
    Verlauf, `stock_decrement_qty`, ein Wiener Kalenderjahr und internen Cron.
- Die Future Notes sind als durch die aktive Roadmap entschiedene historische
  Diskussionsgrundlage markiert und enthalten den lokal vorbereiteten
  Zielvertrag sowie die noch offenen S5/S6-Punkte.
- `docs/QA_CHECKS.md` enthaelt einen neuen, vollstaendig unchecked
  `Phase M-DH`-Block fuer:
  - statische und disposable SQL-Nachweise.
  - Snapshot, Cutover und Datenvertrag.
  - RPC-, UI-, Voice-, Widget- und Push-Regression.
  - Retention, Cron, ACL, RLS und Security Advisor.
  - finalen S6-Dokumentationsabschluss.
- Intake-, Push-, Android-Widget-, Reports- und Doctor-Overviews wurden nicht
  veraendert, weil kein Downstream-Vertrag wechselt.

Code-/Contract Review:

- Runtime-Stock-Log-Scan: `PASS`, keine Treffer.
- Aktiver SQL-Scan: Nur das bewusst user-gated Transition-SQL referenziert den
  Legacy-Stock-Log; `PASS`.
- Geaenderte Runtime-Dateien durch S4.9: keine.
- Neue Doku behauptet weder produktiven Cutover noch aktive Retention oder
  abgeschlossene Smokes.
- Neue Markdown-Bereiche sind ohne zusaetzliche Findings ausser akzeptierter
  `MD013`; bestehende dateiweite Markdownlint-Altlasten wurden nicht in diesen
  Scope gezogen.
- `git diff --check` fuer die drei vorbereiteten Dokumente: `PASS`.
- Keine UI-, Reminder-, Push-Cadence- oder Produktlogik wurde eingefuehrt.

Findings-Korrektur und Schritt-Abnahme:

- `MDH-F18` und `MDH-F29` sind fuer S4 vorbereitet; ihre finale produktive
  Source-of-Truth-Abnahme bleibt S6.
- `MDH-F35` korrigiert das Doku-Timing: Das Medication Overview wird vor S5
  nicht faelschlich auf einen noch nicht produktiven Zielzustand umgeschrieben.
- Review-Finding: Neue Unterteilungen im QA-Block verwendeten zuerst das
  bestehende Fettschrift-Muster und haetten weitere `MD036`-Findings erzeugt;
  sie wurden als echte H3-Ueberschriften korrigiert.
- Im finalen S4.9-Code-/Doku-/Contract-Review bleibt kein neues offenes
  P0-/P1-Finding.
- S4.9 ist `DONE`; der naechste erlaubte Schritt ist S4.10.

### S4.10 - Gesamt-Code-/SQL-/Contract-Review 2026-07-11

Deterministisch geprueft:

- Der frische Aufbau erzeugt genau die drei kanonischen Medication-Tabellen,
  aktiviert RLS und enthaelt keinen Stock-Log mehr.
- Der bestehende Aufbau konvergiert beide Bestandsconstraints auf ihre exakte
  Zieldefinition und verlaesst sich nicht nur auf vorhandene Constraint-Namen.
- Confirm persistiert den tatsaechlichen Bestandsabzug je Event; Undo stellt
  exakt diesen Wert wieder her und bleibt innerhalb des Integer-Wertebereichs.
- Adjust, Set und Reset besitzen die vereinbarten Guardrails; Set bleibt bei
  identischem Bestand ein No-op und Reset liefert nur den Drei-Schluessel-
  Vertrag.
- Alle fuenf RPC-Definitionen im kanonischen und im einmaligen Transition-SQL
  sind nach Whitespace-Normalisierung identisch: `PASS`.
- RLS-, Tabellen- und RPC-Grants entsprechen dem Zielvertrag; der entfernte
  Stock-Log besitzt keinen aktiven Grant mehr: `PASS`.
- Retention-Funktion und Cron-Provisionierung bleiben intern, rollenbezogen
  abgesichert und verwenden den Wiener Kalenderstichtag: `PASS`.
- Die Clean-Start-Transition besitzt feste Locks, harte Preconditions,
  Fingerprint-Nachpruefungen, keinen `cascade`-Drop und keine produktiven
  Datenwrites vor dem finalen Preflight: `PASS`.
- Der abschliessende Consumer-Scan bestaetigt weiterhin, dass App, Android,
  Edge Functions und Reports keinen Runtime-Vertrag zum Stock-Log besitzen.
- Dokumentation und QA beschreiben den Zielzustand weiterhin als lokal
  vorbereitet und behaupten keinen bereits erfolgten produktiven Cutover.
- In S4.10 wurde weder lokales noch produktives SQL ausgefuehrt.

Code-/SQL-/Contract-Review und Findings-Korrektur:

- `MDH-F36`: Die bisherigen namensbasierten Constraint-Guards haetten eine
  falsche Definition unter dem erwarteten Namen akzeptiert. Beide Constraints
  werden nun transaktional entfernt und mit der exakten Zieldefinition neu
  angelegt.
- `MDH-F37`: Undo konnte nach einer zwischenzeitlichen manuellen Setzung auf
  den maximalen Integer-Bestand ueberlaufen. Die Addition erfolgt nun als
  `bigint`, besitzt eine explizite Obergrenze und bricht mit SQLSTATE `22003`
  ab; die Event-Loeschung wird dabei durch die Transaktion ebenfalls
  zurueckgerollt.
- Das QA-Protokoll enthaelt fuer diesen Undo-Grenzfall einen eigenen, bis S5
  bewusst unchecked Testfall.
- Ein erster lokaler Grant-Test meldete wegen eines mehrzeiligen SQL-Formats
  und einer falschen Testsignatur einen Fehlalarm. Der Test wurde korrigiert;
  die produktiven SQL-Vertraege waren an dieser Stelle bereits korrekt.
- Alle finalen statischen SQL-, Grant-, Consumer- und Diff-Pruefungen sind
  `PASS`; kein P0-/P1-Finding bleibt in der lokalen S4-Umsetzung offen.

Schritt-Abnahme:

- S4.10 und damit die gesamte lokale S4-Umsetzung sind `DONE`.
- Der naechste erlaubte Schritt ist S5 als Gesamtschritt.
- Clean Start, kanonische SQLs, Retention-Provisionierung und produktive
  Nachweise bleiben bis zur ausdruecklichen S5-Freigabe unausgefuehrt.

### S5 - Lokaler/disposable Test und Live-Preflight 2026-07-11

Werkzeug- und Sicherheitssetup:

- Docker Desktop `4.81.0` mit Engine `29.6.1`, WSL 2, Ubuntu 24.04 und
  `psql 16.14` wurden installiert und verifiziert.
- Die unvollstaendige Supabase-CLI-Installation wurde mit den offiziellen,
  hash-verifizierten v2.109.1-Binaries `supabase.exe` und `supabase-go.exe`
  repariert.
- Der lokale Supabase-Stack laeuft mit PostgreSQL `17.6` im eigenen Docker-
  Netzwerk. Eine Windows-Firewall-Regel blockiert Remote-Inbound fuer die
  lokal publizierten Ports `54320-54329`; Loopback wurde verifiziert.
- Die fehlende `backend/supabase/seed.sql` erzeugt bei `supabase start` nur
  eine Warnung und blockiert den disposable Datenbankaufbau nicht.

Lokale und disposable Nachweise:

- `sql/12_Medication.sql` laeuft auf einer frischen Supabase-Datenbank und
  beim zweiten Lauf fehlerfrei: `PASS`.
- Der exakte Medication-Abschnitt aus `sql/16_Explicit_Grants.sql` laeuft
  zweimal fehlerfrei; das globale Grant-SQL bleibt vertragsgemaess an den
  vollstaendigen MIDAS-Objektbestand gebunden: `PASS`.
- `sql/17_Medication_Retention.sql` laeuft zweimal fehlerfrei und erzeugt
  genau einen aktiven Job `midas-medication-retention-daily` um `03:15 UTC`:
  `PASS`.
- Genau drei kanonische Medication-Tabellen, zwei Zielconstraints und kein
  kanonischer Stock-Log: `PASS`.
- Retention-ACL: kein Execute fuer `anon`, `authenticated` oder
  `service_role`; DB-Operator bleibt berechtigt: `PASS`.
- RPC-Fixture als Rolle `authenticated` mit vollstaendigem Rollback:
  - normaler und geklemmter Confirm persistieren den exakten Bestandsabzug.
  - Doppel-Confirm bleibt No-op.
  - Undo stellt exakt den gespeicherten Abzug wieder her.
  - Restock, Set-No-op, Adjust-Unterlauf und Undo-Integer-Ueberlauf besitzen
    die erwarteten Ergebnisse und Fehlercodes.
- Retention-Fixture mit Wiener Cutoff:
  - Tag vor Cutoff geloescht.
  - Cutoff-Tag erhalten.
  - aktuelle, zukuenftige und durch erhaltenes Event benoetigte Slots erhalten.
  - entbehrlicher alter Slot nach Event-Loeschung entfernt.
- Legacy-Transition-Fixtures:
  - unveraendertes SQL bricht nach `10:00` ohne Teilwirkung ab.
  - disposable Erfolgspfad mit ausschliesslich im Arbeitsspeicher auf `23:59`
    verschobener Testgrenze besteht alle uebrigen Preconditions,
    Datenaenderungen und Postconditions.
  - One-time-Rerun-, Fremd-Owner-, Rebase-Kollisions- und echter
    Fuenf-Sekunden-Lock-Timeout-Pfad rollen vollstaendig zurueck.
  - finale Sequenz Transition, Medication-Grants und Retention/Cron: `PASS`.
- Alle sechs duplizierten RPC-Definitionen sind nach
  Whitespace-Normalisierung identisch: `PASS`.
- Runtime-Consumer- und aktive SQL-Stock-Log-Scans sowie
  `git diff --check`: `PASS`.

Findings und Korrekturen:

- `MDH-F38` bis `MDH-F44` wurden waehrend der echten DB- und Tooltests
  gefunden, korrigiert und lokal nachgeprueft.
- Besonders relevant: `med_upsert_schedule_v2` war wegen des
  `WITH ORDINALITY`-Typs `bigint` produktiv fehlerhaft. Der explizite
  `::int`-Cast ist im kanonischen SQL enthalten und die korrigierte RPC wird
  nun als sechste gezielte Funktion in der Transition ersetzt.
- Der vom Performance Advisor gemeldete fehlende Event-FK-Index ist in Fresh-
  und Transition-Pfad ergänzt und disposable nachgewiesen.

Read-only produktiver Preflight:

- Projekt `M.I.D.A.S.` ist `ACTIVE_HEALTHY` auf PostgreSQL `17.6`.
- Erwarteter Zielnutzer, genau ein Owner, drei Stammsaetze, drei aktuelle
  Slots, keine Zukunftsslots, keine negativen Bestaende und keine
  Rebase-Kollision: `PASS`.
- Produktiver Altbestand am 11.07.2026:
  - `339` Slot-Events.
  - `364` Stock-Log-Zeilen.
  - kein `stock_decrement_qty`.
  - kein produktives `pg_cron`.
- Nur die erwarteten fuenf Legacy-RPCs referenzieren den Stock-Log; keine View
  und kein eingehender Foreign Key blockiert den Drop.
- Die produktive Schedule-RPC besitzt den lokal gefundenen fehlenden
  Ordinality-Cast; die sechste Transition-Ersetzung ist damit erforderlich.
- Security Advisor: nur die bekannte, im Free-Plan nicht aktivierbare
  `auth_leaked_password_protection`-Warnung.
- Performance Advisor Baseline dokumentiert den nun adressierten Event-FK-
  Index und einen Stock-Log-Hinweis, der mit dem Tabellen-Drop entfaellt.

Sicherheitssnapshot:

- Privater Snapshot ausserhalb des Repos:
  `C:\Users\steph\Projekte\Backup\MIDAS\Medication Clean Start\2026-07-11-pre-cutover.json`.
- Enthaltene Zeilen: `3 / 3 / 339 / 364` fuer Stammdaten, Slots, Events und
  Stock-Log.
- SHA-256:
  `C353379DBED92F933882626884DE34087B5B0DB6E5BBBAD09A2ECD613F731167`.
- Vor dem produktiven Cutover wird ein neuer unmittelbarer Snapshot erzeugt.

Aktuelles Gate:

- Um `21:21 Europe/Vienna` existierten am 11.07.2026 bereits drei
  Medication-Events des Tages. Der produktive Cutover ist deshalb heute durch
  Zeit- und Tages-Confirm-Guard korrekt gesperrt.
- Keine produktive SQL-Schreibwirkung wurde am 11.07.2026 ausgefuehrt.
- S5 bleibt `IN_PROGRESS`; naechster Schritt ist der erneute Live-Preflight und
  Snapshot am naechsten Morgen vor Confirm, Push und `10:00`.

### S5 - Produktiver Cutover 2026-07-12

CodeRabbit-Nachpruefung:

- Der gemeldete vermeintlich fehlende Unique-Vertrag fuer den zusammengesetzten
  Event-FK war ein Fehlalarm.
- `uq_medication_schedule_slot_id_med` existiert bereits als eindeutiger Index
  exakt auf `(id, med_id)` und war schon vor dieser Roadmap-Aenderung Teil des
  kanonischen SQLs.
- Kein redundanter zweiter Unique-Constraint wurde angelegt.

Unmittelbarer produktiver Preflight:

- Wiener Stichtag: `2026-07-12`, Ausfuehrung vor `10:00 Europe/Vienna`.
- Erwarteter Zielnutzer und genau ein gemeinsamer Medication-Owner: `PASS`.
- Drei Medication-Stammsaetze, drei aktive Plaene und keine Zukunftsplaene:
  `PASS`.
- Keine negativen Bestaende, keine Rebase-Kollision, kein heutiges
  Medication-Event und keine heutige Medication-Push-Zustellung: `PASS`.
- Stock-Log mit `364` Zeilen, Slot-Events mit `339` Zeilen und genau die fuenf
  erwarteten Legacy-RPC-Referenzen vorgefunden: `PASS`.
- Keine blockierende View und kein eingehender Foreign Key auf den Stock-Log:
  `PASS`.

Unmittelbarer Sicherheitssnapshot:

- Private Ablage ausserhalb des Repos:
  `C:\Users\steph\Projekte\Backup\MIDAS\Medication Clean Start\2026-07-12-064611-pre-cutover.json`.
- Enthaltene Zeilen: `3 / 3 / 339 / 364` fuer Stammdaten, Slots, Events und
  Stock-Log.
- SHA-256:
  `70C8D0F7BD338226CB68CE1884CEEB371D4C98FAA45BA13596430487982569B8`.

Produktive Ausfuehrung:

1. `medication_data_hygiene_clean_start_20260712`: `PASS`.
2. `medication_data_hygiene_explicit_grants_20260712`: `PASS`.
3. `medication_retention_cron_20260712`: `PASS`.

Post-Cutover-Nachweise:

- `health_medication_stock_log` ist entfernt und alle `339` historischen
  Slot-Events wurden geloescht.
- Drei Medication-Stammsaetze und deren Bestands-Fingerprint blieben
  unveraendert.
- Der User hat die erhaltenen Bestaende `133 / 36 / 36` nach PWA-Neustart auf
  Desktop und Android bestaetigt; sie entsprechen den realen Packungsbestaenden.
  Ein redundantes `Bestand setzen` war deshalb nicht erforderlich.
- Die reale Morgeneinnahme wurde am `2026-07-12` in MIDAS bestaetigt.
  Produktiv entstanden exakt drei Tagesevents mit `qty = 1` und
  `stock_decrement_qty = 1`; die Bestaende wechselten erwartungsgemaess auf
  Rosuvastatin `132`, Valsartan `35` und Forxiga `35`.
- Drei aktive Slots wurden auf den Stichtag rebased; keine alte, inaktive oder
  kollidierende Zeile blieb zurueck.
- Low-Stock-Acknowledgements wurden geleert.
- Alle sechs ersetzten RPCs existieren und referenzieren keinen Stock-Log.
- RLS und Grants: `authenticated` und `service_role` besitzen den vorgesehenen
  CRUD-/Execute-Vertrag; `anon` besitzt keinen Medication-Zugriff.
- `pg_cron`, Retention-Funktion und Tagesindex sind vorhanden.
- Genau ein aktiver Job `midas-medication-retention-daily` laeuft unter dem
  DB-Operator mit `15 3 * * *`.
- Cleanup-Execute ist fuer `PUBLIC`, `anon`, `authenticated` und `service_role`
  entzogen; der DB-Operator bleibt berechtigt.
- Autorisierter Cleanup-Smoke mit Cutoff `2025-07-12`: keine aktuelle Zeile
  geloescht.
- Authentifizierter Confirm-/Undo-Smoke: `PASS`; die gesamte Testtransaktion
  wurde zurueckgerollt und der Tageszustand blieb bei null Events.
- Incident-Push-Dry-Run fuer den Stichtag um `12:30 Europe/Vienna`: `PASS`.
  Drei gueltige Morgenslots und drei bestaetigte Events ergeben
  `openSlots = 0`, `section-not-open` und `no-incidents`; kein Push wurde
  versendet oder als Delivery persistiert.
- Android hat die produktiv bestaetigte Morgeneinnahme ohne weiteren Eingriff
  als erledigt uebernommen: `PASS`.
- Security Advisor: nur die bekannte, im Free Plan nicht aktivierbare
  `auth_leaked_password_protection`-Warnung.
- Der neue FK-Index wird unmittelbar nach Anlage erwartungsgemaess noch als
  unbenutzt gemeldet und bleibt als erforderlicher FK-Unterstuetzungsindex
  bestehen.

Abgeschlossenes Runtime-Gate:

- Reale Packungsbestaende gegen MIDAS geprueft; keine Korrektur erforderlich.
- PWA neu geladen sowie Medication-Liste und Tagesstatus geprueft.
- Echten Tages-Slot bestaetigt; Undo und erneutes Confirm wurden zuvor
  produktiv in einer vollstaendig zurueckgerollten Transaktion geprueft.
- Android-Statusuebernahme mit dem produktiven Tagesstatus verglichen.
- Incident-/Push-Verhalten per produktivem Dry-Run geprueft.

Schritt-Abnahme:

- S5 ist `DONE`.
- Der produktive Medication-Cutover ist abgeschlossen und der regulaere
  Tagesbetrieb kann ohne Sondermassnahme fortgesetzt werden.
- Naechster Schritt ist S6; bis dahin noch nicht committen.

### S6 - Doku-Sync und finaler Abschlussreview 2026-07-12

Deterministische Abarbeitung:

- S6.1 Medication Overview vom Pending-Altvertrag auf den produktiven
  Drei-Tabellen-, Bestands-, Event- und Retention-Vertrag umgestellt: `PASS`.
- S6.2 Intake, Push, Android Widget, Reports und Doctor View gegen den neuen
  Vertrag geprueft: `PASS`. Sie nutzen bereits `med_list_v2` oder die drei
  verbleibenden Tabellen; keine Downstream-Umschreibung erforderlich.
- S6.3 Phase M-DH in `docs/QA_CHECKS.md` mit Stichtag und den tatsaechlich
  bestandenen lokalen und produktiven Smokes abgeschlossen: `PASS`.
- S6.4 `sql/HOW_TO.md` um den konkreten Medication-Scriptvertrag sowie interne
  Retention-/Cron-Regeln erweitert: `PASS`.
- S6.5 Future Notes als ersetzt und rein historisch markiert; aktive Source of
  Truth verlinkt: `PASS`.
- S6.6 produktiver Stichtag `2026-07-12`, Snapshot, drei Migrationen,
  Ergebniszaehler, Cron-Vertrag und Runtime-Smokes dokumentiert: `PASS`.

Finaler Contract Review:

- Roadmap vs. SQL: `PASS`.
  - kanonisches SQL kennt drei Medication-Tabellen und keinen Stock-Log.
  - nur das verbrauchte One-time-Transition-SQL dokumentiert und referenziert
    den frueheren Stock-Log.
- SQL vs. Grants/RLS: `PASS`.
  - drei produktive Medication-Tabellen mit RLS.
  - expliziter Zugriff fuer `authenticated` und `service_role`; kein
    anonymer Medication-Zugriff.
- SQL vs. Medication Overview und QA: `PASS`.
  - aktueller Bestand ohne Bewegungsverlauf.
  - `qty` als dokumentierte Dosis und `stock_decrement_qty` als realer Abzug.
  - rollendes Wiener Kalenderjahr und Begriff `nicht dokumentiert`.
- Medication vs. Push/Widget/Realtime: `PASS`.
  - drei echte Tagesevents wurden in PWA und Android korrekt uebernommen.
  - Incident-Dry-Run erkannte alle drei Morgenslots als geschlossen.
- Retention/Cron: `PASS`.
  - genau ein aktiver Job `midas-medication-retention-daily`.
  - interner Operator-Vertrag ohne Execute fuer App-Rollen.
  - produktiver Cleanup-Smoke loeschte keine aktuelle Zeile.
- Cutoff und Copy: `PASS`.
  - Stichtag und Jahres-Cutoff sind Wiener Kalendertage.
  - Bestaende werden erhalten, physisch geprueft und nur bei Abweichung
    korrigiert.

Findings-Korrektur:

- `MDH-F45`: CodeRabbit-FK-Finding als Fehlalarm geschlossen; kein redundanter
  Unique-Constraint hinzugefuegt.
- `MDH-F46`: Pflicht zum grundlosen Neusetzen korrekter Bestaende aus Roadmap
  und Transition-Copy entfernt.
- `MDH-F47`: Pending-/Altvertrag aus Medication Overview, QA und Future Notes
  entfernt beziehungsweise eindeutig historisch eingeordnet.

Abschluss-Abnahme:

- Kein produktiver Stock-Log: `PASS`.
- Clean Start und Beobachtungsbeginn `2026-07-12` dokumentiert: `PASS`.
- Reale Bestaende abgeglichen: `PASS`.
- Genau ein aktiver Retention-Job: `PASS`.
- Keine offenen P0-/P1-Findings: `PASS`.
- Keine ungewollte Downstream-, UI-, Reminder- oder Timing-Aenderung: `PASS`.
- S6 und die gesamte Roadmap sind `DONE`.

Commit-Empfehlung:

```text
refactor(medication): add bounded retention and remove stock history
```

Archiv-Entscheidung:

- Die abgeschlossene Roadmap wird nach
  `docs/archive/MIDAS Medication Data Hygiene Roadmap (DONE).md` verschoben.
