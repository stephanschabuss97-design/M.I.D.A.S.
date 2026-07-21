# MIDAS Push and Medication Data Hygiene Roadmap

## Roadmap-Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Status | `DONE` |
| Modul / Bereich | `Supabase / Push / Profile / Medication / Reports` |
| Owner / Kontext | `Patient, langfristiger MIDAS-Betrieb und Datenbankpflege` |
| Erstellt am | `2026-07-12` |
| Letzter Stand | `2026-07-17, S6 vollständig abgeschlossen und final verifiziert` |
| Aktueller Schritt | `DONE` |
| Betroffene Hauptdateien | `index.html`, `sql/10_User_Profile_Ext.sql`, `sql/18_Push_Data_Hygiene.sql`, `app/modules/profile/index.js`, `app/modules/hub/index.js`, `service-worker.js`, `backend/supabase/functions/midas-monthly-report/index.ts`, `backend/supabase/functions/midas-incident-push/index.ts`, `backend/supabase/functions/midas-incident-push/request-contract.ts`, `backend/supabase/functions/midas-incident-push/request-contract_test.ts` |
| Deploy relevant | `ja, PWA-Frontend, zwei Edge Functions und produktives SQL` |
| Runtime-Smoke relevant | `ja` |
| Archivziel | `docs/archive/MIDAS Push and Medication Data Hygiene Roadmap (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Current Working State / Handoff

- Aktueller Stand:
  - Der produktive Datenbestand wurde am `2026-07-16` erneut read-only
    inventarisiert.
  - `health_events` bleibt bewusst als langfristige klinische Chronik erhalten.
  - Drei konkrete Hygiene-Themen wurden bestätigt:
    - unbegrenzte `push_notification_deliveries`.
    - dauerhaft deaktivierte `push_subscriptions`.
    - aktive und potenziell driftende Doppelwahrheit zwischen
      `user_profile.medications` und `health_medications`.
  - Bis einschließlich S4.8 wurden Profil-Frontend, Range-Arztbericht, Hub,
    Incident-Push, der kanonische Fresh-Setup-SQL-Vertrag und der neue Push-
    Hygiene-Vertrag geändert; produktiv wurde kein Hygiene-SQL ausgeführt.
  - Der fachliche und technische Zielvertrag ist vollständig festgelegt:
    - Deliveries werden nach Wiener Kalendertag streng älter als 90 Tage
      bereinigt.
    - Nur seit mehr als 90 Tagen unveränderte deaktivierte Subscriptions werden
      bereinigt.
    - Der Push-Cleanup erhält einen eigenen internen Cron-Vertrag.
    - Profil, Range-Arztbericht und Hub unterscheiden erfolgreiche Leere von
      einem nicht verfügbaren Medication-Read-Model.
    - Die produktive Legacy-Spalte bleibt nur als ungenutzte
      Kompatibilitätsspalte bestehen.
    - Der Push-Cleanup validiert vor jeder Löschung seine vollständige
      Cron-Identität und verhindert parallele manuelle/Cron-Läufe mit einem
      transaktionalen Advisory Lock.
    - Der aktive Root-Service-Worker erhält beim Frontend-Rollout eine neue
      Cache-Version; `public/sw/service-worker.js` bleibt unverändert, weil er
      nicht registriert wird.
  - S4.1 ist umgesetzt und verifiziert:
    - Das Profil verwendet vier getrennte Medication-Zustände.
    - Legacy-Read, Legacy-Write und editierbarer Fallback sind entfernt.
    - Die fehlende read-only Medication-Anzeige wurde in `index.html` ergänzt.
  - S4.2 ist umgesetzt und verifiziert:
    - Der Range-Arztbericht liest aktive Medikamente und aktuell gültige Slots
      aus dem strukturierten Medication-Modell.
    - Der Monatsbericht bleibt unverändert; Legacy-Profilmedikation wird nicht
      mehr gelesen.
    - Beide privilegierten Reads sind explizit auf `userId` begrenzt und
      schlagen bei Query-Fehlern geschlossen fehl.
    - `midas-monthly-report` ist nach ausdrücklicher Freigabe als Remote-Version
      `47` aktiv; der write-freie `OPTIONS`-Smoke antwortet mit HTTP `200`.
    - Der Owner hat den Range-Bericht anschließend über den Live Server
      erfolgreich getestet.
  - S4.3 ist umgesetzt und verifiziert:
    - Der Hub reicht eine Medication-Liste nur bei erfolgreicher strukturierter
      Projektion weiter; erfolgreiche Leere bleibt `[]`.
    - Fehlende, noch nicht geladene, fehlerhafte oder alte String-Medikation
      wird nicht als leere Liste oder Legacy-Fallback weitergegeben.
    - Assistant und Vision bleiben unverändert tolerant; der aktive Root-
      Service-Worker verwendet für den Rollout Cache-Version `v6`.
  - S4.4 ist umgesetzt und verifiziert:
    - `sql/10_User_Profile_Ext.sql` provisioniert die Legacy-Spalte
      `user_profile.medications` bei Fresh-Setups nicht mehr.
    - Die bestehende produktive Spalte bleibt als vorläufige
      Kompatibilitätsspalte physisch erhalten; es wurde weder ein Spalten-Drop
      angelegt noch SQL produktiv ausgeführt.
    - Das Basisschema und die strukturierten Medication-Tabellen bleiben
      unverändert.
  - S4.5 ist umgesetzt und verifiziert:
    - Die Input-Normalisierung hält mit `nowOverrideProvided` fest, ob ein
      Request die Eigenschaft `now` explizit gesetzt hat.
    - Incident- und Diagnosemodus lehnen jeden solchen Override ohne
      `dry_run = true` vor User-Auflösung, Datenbank-Reads, Push-Sends und
      Writes mit HTTP `400` ab.
    - Der GitHub-Workflow sendet weiterhin kein `now`; reguläre Scheduler- und
      manuelle Runs bleiben kompatibel.
  - S4.6 ist umgesetzt und lokal verifiziert:
    - `sql/18_Push_Data_Hygiene.sql` enthält den getrennten wöchentlichen Push-
      Cleanup einschließlich partiellem Subscription-Index.
    - Der Cleanup verwendet die festgelegten strikten 90-Tage-Grenzen, prüft
      Lock, Function-Owner und vollständige Cron-Identität vor dem ersten
      Delete und bereinigt nur eigene abgeschlossene alte Cron-Laufdetails.
    - App-Rollen besitzen kein `EXECUTE`; genau ein aktiver Job
      `midas-push-hygiene-weekly` wird unter `postgres` provisioniert.
    - Ein einmaliger Smoke in einer wegwerfbaren PostgreSQL-17.6-Instanz mit
      `pg_cron` 1.6.4 war grün. Zweitlauf, Grenz-Fixtures, Lock-Negativtest und
      produktive Ausführung wurden anschließend in S5 erfolgreich bestätigt.
  - S4.7 ist umgesetzt und verifiziert:
    - `docs/QA_CHECKS.md` enthält eine vollständig unchecked Phase P18 mit den
      statischen, disposable, Security-, Runtime-, PWA- und produktiven Owner-
      Gates aus S5.
    - `sql/HOW_TO.md` beschreibt Zweck, Reihenfolge, Cutoffs, Owner-/Cron-
      Vertrag, Ausführungsgrenzen und Rückfallweg von
      `18_Push_Data_Hygiene.sql`.
    - Module Overviews wurden in S4.7 bewusst nicht verändert; ihr finaler Sync
      bleibt hinter dem Runtime-Nachweis in S6.
  - S4.8 ist umgesetzt und verifiziert:
    - Gesamt-Code-, SQL-, Security-, Consumer-, Fresh-Setup-, Bestands- und
      Cache-Review sind ohne offenes P0-/P1-Finding abgeschlossen.
    - Ein Fresh-Setup-Randfall wurde korrigiert: Ein erfolgreicher Medication-
      Snapshot ohne vorhandenen Profil-Datensatz behauptet weder im Profil noch
      im Hub-Kontext fälschlich den Raucherstatus `Nichtraucher`.
    - Der read-only Remote-Abgleich bestätigt `midas-monthly-report` als aktive
      Version `47`; `midas-incident-push` bleibt bis S5 auf Version `16`.
  - S5.1 bis S5.9 sind umgesetzt und verifiziert:
    - Statische, disposable, externe und produktiv read-only Prüfungen sind
      ohne offenes P0-/P1-Finding abgeschlossen.
    - Der produktive Preflight bestätigt die erwarteten Push-, Cron-, ACL-,
      RLS-, Advisor- und Medication-Verträge.
  - S5.10 und S5.11 sind umgesetzt und verifiziert:
    - `midas-incident-push` ist nach Owner-Freigabe als Version `17` aktiv;
      JWT-Verifikation bleibt eingeschaltet.
    - Aktueller und historischer Dry-Run sind remote erfolgreich. Historisches
      `now` ohne Dry-Run wird mit HTTP `400` abgewiesen.
    - Delivery- und Subscription-Bestand sind nach allen Smokes bitgenau
      unverändert; es wurde kein Push versendet.
    - Der bereits vorhandene Range-Bericht vom 16.07.2026 enthält alle aktiven
      strukturierten Medikamente. Ein redundanter neuer Bericht wurde nicht
      geschrieben.
  - S5.12 und S5.13 sind umgesetzt und verifiziert:
    - Der Owner hat Provisionierung und unmittelbar anschließenden manuellen
      Erstlauf nach vollständigem Briefing ausdrücklich freigegeben.
    - Push-Cleanup-Funktion, partieller Index und der aktive Wochenjob wurden
      mit dem kanonischen SQL-Vertrag produktiv provisioniert und vollständig
      post-verifiziert.
    - Der manuelle Erstlauf löschte exakt `8` alte Delivery-Zeilen und `1` alte
      deaktivierte Subscription; alle `3` aktiven Subscriptions blieben
      erhalten.
    - Nach dem Cleanup verbleiben `23` Delivery-Zeilen ohne alte oder
      zukünftige Zeile sowie `5` Subscriptions ohne alte deaktivierte Zeile.
    - Security und Performance Advisor zeigen keine neue Abweichung von der
      bekannten Projekt-Baseline.
  - S5.14 und S5.15 sind umgesetzt und verifiziert:
    - Gesamt-Code-, SQL-, Security-, Consumer-, Live-Schema-, Edge-Status-,
      Cron-, ACL-, RLS-, Advisor- und Roadmap-Review sind ohne offenes
      P0-/P1-Finding abgeschlossen.
    - Vier dauerhafte Incident-Push-Request-Regressionstests bestehen; lokale
      Syntax-, Deno-, Diff- und Roadmap-Lint-Checks sind grün.
    - `DH-F14` bleibt bewusst als separates Reliability-Thema deferred; aus dem
      Hygiene-Erfolg wird keine exakt-einmalige Push-Zustellung abgeleitet.
    - S5 ist technisch commit-bereit, wird wegen der noch offenen
      Source-of-Truth-Dokumentation in S6 aber noch nicht committed.
  - S6 ist vollständig umgesetzt und verifiziert:
    - Module Overviews, QA, SQL-HOW-TO, Owner-Verständnis und Roadmap verwenden
      denselben produktiven Vertrag.
    - Der finale Contract Review fand kein offenes P0-/P1-Finding; `DH-F10`
      und `DH-F14` bleiben bewusst abgegrenzte Watchlists.
    - JavaScript-/Deno-Checks, vier Request-Regressionstests,
      `git diff --check`, zielgerichtete Altvertrags-Scans und Roadmap-
      Markdownlint sind am `2026-07-17` erneut grün.
- Nächster erlaubter Schritt:
  - Owner-Commit und Push mit dem final geprüften Scope.
- Aktuell bekannte Findings:
  - `DH-F1` bis `DH-F18`, siehe Finding-Klassifizierung.
- Aktuell geänderte Dateien:
  - Diese Roadmap, `docs/QA_CHECKS.md`, `sql/HOW_TO.md`, `index.html`,
    `sql/10_User_Profile_Ext.sql`,
    `sql/18_Push_Data_Hygiene.sql`,
    `app/modules/profile/index.js`, `app/modules/hub/index.js`,
    `service-worker.js` und
    `backend/supabase/functions/midas-monthly-report/index.ts`,
    `backend/supabase/functions/midas-incident-push/index.ts`,
    `backend/supabase/functions/midas-incident-push/request-contract.ts` sowie
    `backend/supabase/functions/midas-incident-push/request-contract_test.ts`.
  - Bereits vor S1 vorhandene, bewusst nicht zurückgesetzte Doku-Arbeit:
    `docs/MIDAS Roadmap Template.md`,
    `docs/archive/MIDAS Medication Data Hygiene Roadmap (DONE).md`,
    `docs/modules/Push Module Overview.md` und
    `docs/archive/MIDAS Medication Data Hygiene Lessons Learned.md`.
  - Der geänderte Fresh-Setup-SQL-Vertrag wurde nicht produktiv ausgeführt.
    Beide Edge Functions sind deployt; der Range-Bericht und das produktive
    Push-Hygiene-SQL sind erfolgreich nachgewiesen.
- Offene User-Freigaben:
  - Nur Commit und Push bleiben eine ausdrückliche Owner-Aktion.
- Wichtige Grenzen für den nächsten Chat:
  - S1 bis S3 sind reine Detektiv-, Vertrags- und Risikoarbeit.
  - Kein produktiver Write vor abgeschlossenem S5-Preflight und Owner Briefing.
  - Die Legacy-Spalte `user_profile.medications` wird in dieser Roadmap nicht
    voreilig produktiv gedroppt.
  - Die in S2 festgelegten Cutoffs, Fehlerzustände und Fail-Closed-Regeln sind in
    S3 red-team-geprüft und dürfen in S4 nicht stillschweigend neu
    interpretiert werden.
  - `DH-F14` ist ein abgegrenztes Reliability-Watchlist-Thema und keine
    Behauptung, dass diese Roadmap Push-Zustellung exakt-einmalig macht.

## Ziel (klar und prüfbar)

MIDAS soll langfristig nur Daten dauerhaft speichern, die für den Alltag,
medizinische Verläufe oder den stabilen Betrieb einen echten Wert besitzen.
Operative Push-Dedupe-Daten werden begrenzt, tote Push-Endpunkte werden
bereinigt und aktuelle Medikamentenstammdaten besitzen genau eine aktive
Source of Truth.

Prüfbare Zieldefinition:

- `push_notification_deliveries` enthält nach Cleanup keine Einträge, deren
  Wiener Kalendertag älter als 90 Tage ist.
- Aktive Push-Subscriptions werden niemals altersbasiert gelöscht.
- Nur `disabled = true` und seit mehr als 90 Tagen unveränderte
  Push-Subscriptions werden automatisch gelöscht.
- Ein interner, benannter und idempotent provisionierter `pg_cron`-Job führt
  die Push-Hygiene regelmäßig aus.
- App-Rollen können die interne Cleanup-Funktion nicht ausführen.
- Nicht trockene Incident-Push-Runs können keinen frei gesetzten historischen
  `now`-Zeitpunkt verwenden und dadurch nach abgelaufener Dedupe-Retention alte
  Erinnerungen erneut senden.
- `health_medications` ist die einzige aktive Source of Truth für aktuelle
  Medikamente, Einnahmeplan und Arztbericht.
- Das Profil zeigt Medikamente weiterhin als abgeleitete, schreibgeschützte
  Information, schreibt aber keine zweite Medikamentenliste mehr in
  `user_profile`.
- Der Arztbericht bezieht aktuelle aktive Medikamente direkt aus dem
  Medication-Modell und behält seine bisherige lesbare Ausgabe.
- Assistant und Vision erhalten weiterhin den aktuellen abgeleiteten
  Medikamentenkontext oder lassen ihn bei nicht verfügbarem Medication-Read-
  Model bewusst weg.
- `health_events`, Termine, Trendpilot-Historie, Medication-Retention und
  klinische Auswertungslogik bleiben unverändert.

## Problemzusammenfassung

Der aktuelle Datenbestand ist klein und akut nicht speicherkritisch:

- gesamte produktive Datenbank: rund `21 MB`.
- alle MIDAS-Tabellen im Schema `public`: rund `1,37 MB`.
- `health_events`: `276` Zeilen und rund `488 kB` inklusive Indizes.
- `push_notification_deliveries`: `30` Zeilen ohne Retention.
- `push_subscriptions`: `6` Zeilen, davon `3` aktiv und `3` deaktiviert.
- Die persistierte Legacy-Profilliste enthält `6` Einträge, während
  `health_medications` `3` aktive strukturierte Medikamente enthält. Der
  produktive Count-Vergleich belegt damit bereits reale Drift, ohne sensible
  Medikamenteninhalte offenzulegen.
- Beim erneuerten Audit am `2026-07-16` mit strengem Delivery-Prädikat
  `day < 2026-04-17` wären `8` Delivery-Zeilen und `1` seit mehr als 90 Tagen
  unveränderte deaktivierte Subscription löschbar gewesen. Diese Zahlen sind
  nur eine Baseline und müssen unmittelbar vor produktivem SQL neu bestimmt
  werden.
- Produktiv existiert derzeit genau der Medication-Retention-Job
  `midas-medication-retention-daily`; ein Push-Hygiene-Job existiert noch nicht.

Die Roadmap existiert nicht wegen einer aktuellen Speicherkrise, sondern wegen
des Langzeitvertrags:

- Push-Delivery-Zeilen dienen nur dem tagesbezogenen Remote-Dedupe. Nach einem
  überschaubaren Diagnosefenster besitzen sie keinen fachlichen Langzeitwert.
- Durch Geräte-, Browser- oder PWA-Wechsel können dauerhaft deaktivierte
  Push-Subscriptions als tote Endpunkte bestehen bleiben.
- `user_profile.medications` und `health_medications` können unterschiedliche
  Medikamentenstände enthalten.
- Das Profil überblendet die Legacy-Liste zur Laufzeit bereits mit dem
  Medication-Read-Model. Der Arztbericht liest dagegen weiterhin die
  persistierte Profilspalte und kann dadurch veraltete Medikation ausgeben.
- Ein sofortiger Drop der Legacy-Spalte könnte alte oder noch gecachte PWA-
  Clients brechen, weil deren Profilabfrage die Spalte noch explizit auswählt.
- Die Incident-Push-Edge-Function akzeptiert derzeit einen frei gesetzten
  Auswertungszeitpunkt. Nach dem Löschen alter Dedupe-Zeilen könnte ein
  privilegierter nicht trockener historischer Run alte Pushes erneut senden.

## Entscheidungslog

<!-- markdownlint-disable MD013 -->

| Datum | Entscheidung | Begründung | Betroffene Schritte |
| --- | --- | --- | --- |
| 2026-07-12 | `health_events` bleibt unbegrenzt erhalten. | Klinische Langzeitverläufe besitzen potenziellen Wert für Arztberichte und Graphen; das reale Wachstum ist derzeit gering. | S1-S3, S6 |
| 2026-07-12 | Push-Deliveries erhalten eine 90-Tage-Retention. | Aktuelles Dedupe braucht nur den jeweiligen Tag; 90 Tage liefern ausreichend Diagnosekontext ohne jahrzehntelanges Wachstum. | S2, S4.6, S5 |
| 2026-07-12 | Nur deaktivierte Push-Subscriptions werden nach 90 Tagen gelöscht. | Aktive Endpunkte dürfen unabhängig von ihrem Alter nicht verschwinden; 404/410-deaktivierte Endpunkte sind technisch tot. | S2, S4.6, S5 |
| 2026-07-12 | Push-Hygiene bekommt einen eigenen internen Cron-Vertrag. | Push und Medication bleiben getrennte Verantwortungsbereiche; die Medication-Retention wird nicht fachfremd erweitert. | S2, S4.6 |
| 2026-07-12 | Der Zieljob heißt `midas-push-hygiene-weekly` und läuft sonntags um `03:45 UTC`. | Wöchentliche Pflege reicht für 90-Tage-Grenzen; der Job kollidiert zeitlich nicht mit dem täglichen Medication-Job um `03:15 UTC`. | S2, S4.6, S5 |
| 2026-07-12 | Nicht trockene Runs dürfen keinen überschriebenen historischen Zeitpunkt verwenden. | Abgelaufene Dedupe-Historie darf niemals alte reale Erinnerungen wieder freischalten. | S2, S4.5, S5 |
| 2026-07-12 | `health_medications` wird einzige aktive Medikamentenquelle. | Strukturierte Stammdaten und Slots sind aktueller und bereits operativer Vertrag; eine zweite manuelle JSON-Liste kann driften. | S2, S4.1-S4.4 |
| 2026-07-12 | Die produktive Legacy-Spalte wird zunächst stillgelegt, nicht sofort gedroppt. | Alte gecachte PWA-Clients müssen während des Rollouts weiter funktionieren; semantische Konsolidierung ist wichtiger als ein riskanter Sofort-Drop. | S3, S4.4, S5, S6 |
| 2026-07-12 | Der spätere physische Spalten-Drop bleibt ein expliziter Follow-up-Gate. | Erst nach nachgewiesenem Rollout auf allen relevanten Clients ist die Entfernung risikolos. | S6 / Watchlist |
| 2026-07-16 | Delivery-Retention verwendet `day < Wiener Heute - 90 Tage`. | `day` ist Teil des fachlichen Dedupe-Schlüssels; damit bleiben `-90`, heute und Zukunft erhalten, während `-91` und älter gelöscht werden. | S2.1, S4.6, S5.3 |
| 2026-07-16 | Subscription-Retention verwendet `disabled = true` und `updated_at < Ausführungszeitpunkt - 90 Tage`. | Der vorhandene Trigger macht `updated_at` zum Reaktivierungs- und Zustandsanker; aktive oder nur vorübergehend fehlerhafte Endpunkte bleiben geschützt. | S2.2, S4.6, S5.3 |
| 2026-07-16 | Der Range-Arztbericht verwendet aktive Medikamente und am Wiener Berichtstag gültige Slots. | „Derzeitige Medikation“ ist eine aktuelle Stammdatenangabe und kein historischer Snapshot des gewählten Berichtszeitraums. | S2.5, S2.7, S4.2 |
| 2026-07-16 | Ein strukturierter Medication-Query-Fehler lässt den Range-Arztbericht geschlossen fehlschlagen. | Ein unvollständiger Bericht mit scheinbar leerer Medikation wäre medizinisch irreführender als ein klarer Fehler ohne Persistierung. | S2.7, S4.2, S5.6 |
| 2026-07-16 | Nicht verfügbarer Medication-Kontext wird im Hub ausgelassen; erfolgreiche Leere bleibt eine leere Liste. | So können Assistant und Vision „keine aktiven Medikamente“ von „Kontext nicht geladen“ unterscheiden, ohne auf Legacy-Daten zurückzufallen. | S2.6, S2.8, S4.1, S4.3 |
| 2026-07-16 | Der Push-Cleanup validiert den vollständigen Jobvertrag vor der ersten Löschung und verwendet einen transaktionalen Advisory Lock. | `pg_cron` serialisiert denselben Job, aber keinen parallelen manuellen Funktionsaufruf; Jobdrift oder Parallelität darf keine Löschung unter einem unbekannten Betriebsvertrag auslösen. | S3.5, S4.6, S5.4 |
| 2026-07-16 | Der aktive Root-Service-Worker erhält nach den Frontend-Änderungen eine neue Cache-Version. | Statische JavaScript-Dateien werden cache-first ausgeliefert; ohne neuen Worker kann der erste Client-Aufruf noch alten Profil-/Hub-Code verwenden. | S3.4, S4.3, S5.7 |
| 2026-07-16 | Diese Roadmap verspricht keine exakt-einmalige Push-Zustellung. | Zwischen erfolgreichem Push-Send und anschließendem Delivery-Upsert bleibt bei parallelen Edge-Aufrufen ein bestehendes Duplikatfenster; dessen robuste Behebung gehört in die separate Push-Reliability-Fortsetzung. | S3.2, S6 / Watchlist |

<!-- markdownlint-enable MD013 -->

## Owner-Verständnis: Wie und warum

### Was ändern wir fachlich?

- MIDAS vergisst alte technische Push-Dedupe-Zeilen und tote Push-Endpunkte
  automatisch nach einem klaren Zeitraum.
- Die aktuelle Medikamentenliste kommt fachlich nur noch aus dem Medication-
  Manager und dessen strukturierten Daten.
- Profil, Arztbericht und Assistant-Kontext bleiben sichtbar funktional, lesen
  aber keine eigenständig gepflegte zweite Medikamentenliste mehr.
- Klinische Langzeitdaten wie Blutdruck, Körper, Labor, Aktivität und Berichte
  bleiben vollständig erhalten.
- Der bestehende rollende Einjahresvertrag für Medication-Slot-Events bleibt
  unverändert.
- „Derzeitige Medikation“ bedeutet in Profil und Range-Arztbericht den am
  Wiener Ausführungstag aktiven Stand. Der ausgewählte historische
  Berichtszeitraum ändert diesen Stammdatenanker nicht.
- Ein sauber geladener Stand ohne aktive Medikamente ist ein gültiges Ergebnis.
  Ein technischer Ladefehler ist ein anderer Zustand und wird niemals als
  medizinische Leere dargestellt.

### Warum wählen wir diesen Weg?

- Technische Betriebsdaten und medizinische Verlaufsdaten haben nicht denselben
  Langzeitwert. Darum erhalten sie unterschiedliche Retention-Verträge.
- Der Cleanup läuft in PostgreSQL, weil alle Eingangsdaten und alle
  Löschbedingungen in derselben Datenbank liegen.
- Ein externer GitHub-Workflow wäre für reine SQL-Pflege ein unnötiger weiterer
  Fehlerpfad mit Netzwerk und Secrets.
- Die Medication-Liste wird nicht über Trigger zwischen zwei Tabellen
  synchronisiert. Synchronisierung würde die Doppelwahrheit nur pflegen,
  während eine eindeutige Source of Truth das Grundproblem entfernt.
- Die alte Profilspalte bleibt vorübergehend physisch vorhanden, damit ein
  gecachter Altclient nicht hart ausfällt. Neue aktive Consumer ignorieren sie.

### Welche Werkzeuge brauchen wir warum?

<!-- markdownlint-disable MD013 -->

| Werkzeug | Aufgabe in dieser Roadmap | Wichtige Abgrenzung |
| --- | --- | --- |
| `rg` / PowerShell | Consumer, SQL-Verträge und Altspalten-Referenzen repo-weit finden. | Beweist keine PostgreSQL-Runtime. |
| Git / Diff | Scope und bestehende fremde Änderungen schützen, Patches prüfen. | Ist kein Runtime-Test. |
| Docker Desktop | Disposable Supabase-Container ausführen. | Hat keinen Zugriff auf Produktion und ist keine Deploy-Freigabe. |
| Supabase CLI | Lokalen Supabase-Stack orchestrieren und Hilfe/Status prüfen. | Ein lokaler Erfolg beweist noch keinen produktiven Iststand. |
| `psql` | SQL, Cutoff-Grenzen, ACL, Cron und Rollback gegen echtes PostgreSQL testen. | Ist Client, nicht Datenbankserver. |
| Node | Geänderte Frontend-JavaScript-Dateien syntaktisch prüfen. | Ersetzt keinen Browser-Smoke. |
| Deno | Edge Functions inklusive `jsr:`-Imports prüfen. | Ein Check deployt nichts. |
| Supabase MCP | Produktion read-only inventarisieren und nach Freigabe SQL anwenden. | Verfügbarkeit ist keine automatische Write-Freigabe. |
| Supabase CLI Deploy | Reviewte Edge Functions nach Freigabe deployen. | Kein automatischer Schritt nach lokaler Änderung. |
| Browser / PWA / Android | Profil-, Bericht- und Kontextverhalten real prüfen. | Manuelle Smokes ersetzen nicht SQL- und Security-Checks. |
| CodeRabbit | Optionaler externer Code-/SQL-Review nach S5. | Findings werden bewertet und nicht blind umgesetzt. |

<!-- markdownlint-enable MD013 -->

### Wo arbeiten wir?

- Lokal/disposable:
  - Canonical SQL, Cleanup-Funktion und Cron-Provisionierung zweimal ausführen.
  - Cutoff-Grenzen mit Wegwerfdaten testen.
  - aktive und deaktivierte Subscription-Fixtures testen.
  - Arztbericht-Medikationsformat mit aktiven, inaktiven und leeren Fixtures
    prüfen.
  - Incident-Push-Zeitoverride ohne echte Zustellung prüfen.
- Produktiv read-only:
  - Zeilenzahlen, Altersverteilung, aktive/deaktivierte Subscriptions, Cron-
    Baseline, Rechte und aktuelle Consumer-Annahmen prüfen.
  - unmittelbar vor produktivem SQL die konkret löschbaren Zeilen zählen.
- Produktiv write:
  - Edge Functions deployen.
  - Push-Hygiene-Funktion, Index und Cron-Job provisionieren.
  - nach separater Freigabe den ersten Cleanup einmal manuell unter der
    erwarteten DB-Rolle ausführen.
- User-gated:
  - jeder Edge-Function-Deploy.
  - produktives SQL.
  - erster produktiver Cleanup.
  - echter Report-Smoke mit Write in `health_events`.
  - echter Push-Smoke mit sichtbarer Benachrichtigung.

### Was kann schiefgehen?

- Ein falscher Cutoff löscht aktuelle Dedupe-Zeilen oder aktive Subscriptions.
- Ein ungeschützter historischer Incident-Run sendet alte Erinnerungen erneut.
- Der Arztbericht verliert aktuelle Medikation oder zeigt inaktive Medikamente.
- Das Profil interpretiert einen Ladefehler als leere Medikamentenliste und
  vermittelt falsche Sicherheit.
- Ein sofortiger Spalten-Drop bricht alte PWA-Caches oder noch nicht
  aktualisierte Clients.
- Ein öffentlich ausführbarer Cleanup könnte RLS und den normalen App-Vertrag
  umgehen.
- Ein falsch provisionierter Cron erzeugt Duplikatjobs oder läuft unter einer
  unerwarteten Rolle.
- Ein manueller Cleanup kann mit einem Cron-Lauf überlappen, wenn die Funktion
  keinen eigenen Lock besitzt.
- Ein unveränderter Service Worker kann beim ersten Start nach dem Rollout noch
  alten Profil-/Hub-Code aus dem Runtime-Cache liefern.
- Zwei parallele Incident-Push-Aufrufe können vor dem Delivery-Upsert dasselbe
  Ereignis senden. Diese bestehende Reliability-Lücke wird dokumentiert, aber
  nicht als Teil der Datenhygiene umgebaut.

Stop-Bedingungen:

- Cutoff oder betroffene Produktivzeilen sind nicht exakt bestimmbar.
- aktive Subscriptions würden von der Löschbedingung erfasst.
- neue Clients sind noch von `user_profile.medications` abhängig.
- lokaler/disposable Test, Security Review oder Edge-Function-Check ist rot.
- produktiver Iststand weicht von S1-S3 ab.

Rückfallstrategie:

- Code- und Edge-Änderungen bleiben rückrollbar, solange die Legacy-Spalte
  physisch vorhanden ist.
- Push-Hygiene-SQL wird idempotent und mit eindeutigem Jobnamen gebaut.
- Vor dem ersten produktiven Cleanup werden nur die konkret löschbaren
  technischen Zeilen gezählt und bei Bedarf außerhalb des Repos exportiert.
- Ein fehlgeschlagener SQL-Lauf muss transaktional abbrechen.
- Der Cron-Job kann deaktiviert oder entfernt werden, ohne klinische Daten zu
  verändern.

### Woran erkennen wir den Erfolg?

- Technischer Nachweis:
  - Cutoff-Fixtures bestehen an Tag `-91`, `-90`, heute und Zukunft.
  - aktive Subscriptions bleiben erhalten.
  - genau ein erwarteter Push-Hygiene-Cron ist aktiv.
  - App-Rollen besitzen kein Execute auf die Cleanup-Funktion.
  - ein nicht trockener historischer `now`-Override wird abgewiesen.
  - Arztbericht liest und formatiert aktive Medication-Daten direkt.
- Sichtbarer Nutzer-Nachweis:
  - Profil zeigt dieselbe aktuelle Medikation wie der Medication-Manager.
  - Arztbericht zeigt dieselbe aktuelle Medikation in lesbarer Form.
  - Assistant-/Vision-Kontext enthält weiterhin die aktuelle Medikation.
  - Push und lokale Fallbacks funktionieren nach dem Cleanup unverändert.
- Owner-Anteil:
  - Der Owner bestätigt Profil und Arztbericht auf Desktop/PWA.
  - Ein echter Push-Smoke erfolgt nur nach ausdrücklicher Entscheidung.
  - Der Owner entscheidet nach dem Client-Rollout separat über den späteren
    physischen Drop der Legacy-Spalte.

### Owner Briefing Gates

Vor jedem produktiven Deploy, produktiven SQL oder ersten Cleanup wird dieses
Briefing mit den zu diesem Zeitpunkt realen Zahlen ausgefüllt:

```md
#### Owner Briefing

- Zweck: Warum ist dieser Schritt jetzt nötig?
- Wirkung: Welche Funktionen, Tabellen, Zeilen oder Jobs ändern sich?
- Risiko: Was könnte konkret schiefgehen?
- Rückfall: Wie wird abgebrochen, deaktiviert oder wiederhergestellt?
- Erfolgsnachweis: Welche Abfrage oder welcher Smoke muss danach grün sein?
```

## Scope

- Push-Hygiene:
  - `push_notification_deliveries`.
  - deaktivierte `push_subscriptions`.
  - interner Cleanup, Index und eigener `pg_cron`-Job.
  - notwendiger Schutz der Incident-Push-Zeitoverride-Logik.
- Medication-Source-of-Truth:
  - Profilprojektion aus `health_medications` und Schedule-Slots.
  - Arztbericht-Medikationsquelle und Formatierung.
  - Assistant-/Vision-/Hub-Kontextprüfung.
  - kanonischer Fresh-Setup-Vertrag für `user_profile`.
  - Deprecation der produktiven Legacy-Spalte ohne Sofort-Drop.
- Tests, Edge-Deploys, produktives SQL, Runtime-Smokes und Source-of-Truth-Doku.
- Dokumentierter Keep-Entscheid für `health_events`.

## Not in Scope

- Keine Retention oder Aggregation für `health_events`.
- Keine Änderung an BP-, Body-, Lab-, Activity-, Intake- oder Report-Historie.
- Keine Änderung an der einjährigen Medication-Slot-Event-Retention.
- Kein Umbau der Medication-Slots, Bestände, Reminder-Zeiten oder Intake-UI.
- Kein Drop von `user_profile.medications` vor nachgewiesenem Client-Rollout.
- Keine allgemeine Datenbank-Archivierungsplattform.
- Keine neue GitHub Action für SQL-Retention.
- Keine Änderung an Trendpilot-Events oder Trendpilot-State.
- Keine Bereinigung erledigter Termine.
- Keine neuen medizinischen Regeln, Diagnosen oder Schwellen.
- Keine Push-Architekturänderung wie native Android Reminder oder per-device ACK.
- Keine Exactly-once-Neukonstruktion für parallele Incident-Push-Aufrufe.

## Relevante Referenzen (Code)

- `sql/01_Health Schema.sql`
- `sql/10_User_Profile_Ext.sql`
- `sql/11_Lab_Event_Extension.sql`
- `sql/12_Medication.sql`
- `sql/13_Activity_Event.sql`
- `sql/15_Push_Subscriptions.sql`
- `sql/16_Explicit_Grants.sql`
- `sql/17_Medication_Retention.sql`
- `sql/HOW_TO.md`
- `app/modules/profile/index.js`
- `app/modules/hub/index.js`
- `app/modules/push/index.js`
- `service-worker.js`
- `app/modules/intake-stack/medication/index.js`
- `backend/supabase/functions/midas-monthly-report/index.ts`
- `backend/supabase/functions/midas-incident-push/index.ts`
- `backend/supabase/functions/midas-assistant/index.ts`
- `backend/supabase/functions/midas-vision/index.ts`
- `.github/workflows/incidents-push.yml`

## Relevante Referenzen (Doku)

- `README.md`
- `docs/DEV_ENVIRONMENT.md`
- `docs/MIDAS Roadmap Template.md`
- `docs/archive/MIDAS Medication Data Hygiene Lessons Learned.md`
- `docs/modules/Profile Module Overview.md`
- `docs/modules/Medication Module Overview.md`
- `docs/modules/Push Module Overview.md`
- `docs/modules/Reports Module Overview.md`
- `docs/modules/Doctor View Module Overview.md`
- `docs/modules/Assistant Module Overview.md`
- `docs/modules/Android Widget Module Overview.md`
- `docs/QA_CHECKS.md`
- `docs/archive/MIDAS Medication Data Hygiene Roadmap (DONE).md`
- `docs/archive/MIDAS Incident Push Review Findings Roadmap (DONE).md`

## Guardrails

- MIDAS bleibt single-user, ruhig und alltagstauglich.
- Medizinische Verlaufsdaten werden nicht wegen theoretischer Speicherangst
  gelöscht.
- Technische Retention darf keine fachliche Historie berühren.
- Aktive Push-Subscriptions werden niemals altersbasiert gelöscht.
- Cleanup-Funktionen sind keine öffentliche App-API.
- Kein realer historischer Push durch Test-Zeitpunkte.
- `health_medications` ist die einzige aktive Medication-Source-of-Truth.
- Ein Medication-Ladefehler darf nicht als „keine Medikamente“ erscheinen.
- Arztbericht und Profil dürfen keine veraltete Medikamentenliste zeigen.
- Alte Clients werden während der Deprecation nicht absichtlich hart gebrochen.
- Keine Secrets, Endpoints oder Push-Keys in Logs, Roadmap oder Snapshot.
- Keine fremden Worktree-Änderungen zurücksetzen.
- Source-of-Truth-Dokus werden erst nach realem Runtime-Nachweis finalisiert.

## Architektur-Constraints

- `push_notification_deliveries` dedupliziert aktuell je
  `user_id/day/type/severity/source`.
- Die Incident-Push-Edge-Function liest Dedupe nur für den ausgewerteten Tag.
- Der Delivery-Upsert erfolgt erst nach mindestens einer erfolgreichen
  Zustellung. Der Unique-Index verhindert doppelte Delivery-Zeilen, aber nicht
  zwingend doppelte Sends aus parallelen Edge-Aufrufen.
- Der Delivery-Cleanup verwendet deshalb denselben Wiener `day`-Vertrag und
  keinen UTC-Zeitstempel als Altersanker.
- `now` kann aktuell per Request überschrieben werden und braucht vor
  Retention einen Non-Dry-Run-Guard.
- Deaktivierung einer Subscription erfolgt bei Web-Push HTTP `404` oder `410`.
- Ein Re-Upsert desselben Endpoints kann `disabled` wieder auf `false` setzen.
- `push_subscriptions.updated_at` wird durch den vorhandenen Trigger gepflegt.
- `push_subscriptions.updated_at` ist damit der Retention-Anker für
  deaktivierte Endpunkte; ein Re-Upsert setzt den Endpunkt wieder aktiv und
  beginnt das Altersfenster neu.
- `pg_cron` läuft unter einer Datenbankrolle, nicht unter einem App-User.
- Die produktive Cron-Zeitzone ist `GMT`; `45 3 * * 0` bedeutet daher Sonntag
  `03:45 UTC`, unabhängig von österreichischer Sommerzeit.
- Interne Cleanup-Funktionen bleiben `security invoker` und für App-Rollen
  nicht ausführbar.
- Der Push-Cleanup validiert seinen vollständigen Jobvertrag vor der ersten
  Löschung und schützt Cron- sowie manuelle Aufrufe zusätzlich mit einem
  transaktionalen Advisory Lock.
- `health_medications` und `health_medication_schedule_slots` enthalten den
  aktuellen Medication-Vertrag.
- Die Profil-UI baut bereits eine Medication-Projektion aus `med_list_v2`.
- Der Range-Arztbericht läuft in der Edge Function mit Service Role und kann
  nicht blind einen auf `auth.uid()` angewiesenen Medication-RPC verwenden.
- Jede direkte Medication- und Slot-Abfrage der Service-Role-Edge-Function
  muss explizit auf den aufgelösten `userId` begrenzt sein.
- Assistant und Vision konsumieren einen vom Hub gelieferten Kontext; sie
  lesen `user_profile.medications` nicht direkt aus Supabase.
- Der Range-Arztbericht schreibt erst nach vollständig erfolgreichen
  Medication- und Slot-Reads in `health_events`; bei einem Query-Fehler gibt es
  keinen teilweise persistierten Bericht.
- PWA-/Service-Worker-Caches können ältere Frontend-Versionen vorübergehend
  weiter ausführen. Der registrierte Root-`service-worker.js` liefert statische
  Module cache-first und braucht für diesen Frontend-Rollout eine neue
  Cache-Version.
- Edge-Function-Source-of-Truth liegt unter `backend/supabase/functions/`.

## Tool Permissions

Allowed:

- Relevante Repo-Dateien read-only untersuchen.
- Roadmap, SQL, Profile-, Hub-, aktiven Root-Service-Worker- und Edge-Function-
  Dateien im bestätigten Scope ändern.
- Node-, Deno-, Git-, Markdown-, SQL- und lokale Supabase-Checks ausführen.
- Docker Desktop und den lokalen Supabase-Stack für disposable Tests nutzen.
- Supabase produktiv read-only inventarisieren.
- Edge Functions und produktives SQL erst nach dem jeweiligen Owner Briefing
  und ausdrücklicher Freigabe ausführen.
- Produktive Postconditions und Advisor-Ergebnisse read-only prüfen.

Forbidden:

- Keine produktiven Writes in S1 bis S4.
- Kein Deploy und kein produktives SQL ohne ausdrückliche Freigabe.
- Kein echter Push als Nebenwirkung eines automatisierten Tests.
- Kein Drop oder Truncate klinischer Tabellen.
- Kein produktiver Drop von `user_profile.medications` in dieser Roadmap.
- Keine Änderung von Medication-Retention, Push-Zeiten oder medizinischen
  Schwellen ohne neues Finding und Roadmap-Korrektur.
- Keine Secrets aus `.env.supabase.local` ausgeben oder committen.

## Deploy- und Runtime-Status

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Lokale Codeänderung | `S4.1 bis S4.8 vollständig umgesetzt und reviewt` |
| Lokale Checks | `S4 bis S6 vollständig grün` |
| Supabase Deploy | `midas-monthly-report v47 und midas-incident-push v17 aktiv; JWT-Verifikation aktiv` |
| GitHub Workflow-Smoke | `optional, offen und user-gated` |
| Browser-/Device-Smoke | `Range-Bericht am Live Server bestanden; freigegebene Runtime-Gates grün` |
| Produktive Schreibwirkung | `Push-Hygiene provisioniert; Erstlauf löschte exakt 8 Deliveries und 1 deaktivierte Subscription` |
| Letzter Remote-Nachweis | `2026-07-17: Edge Functions aktiv; Push-Hygiene-Postconditions und Erstlauf grün` |

<!-- markdownlint-enable MD013 -->

## Execution Mode

- Sequenziell `S1` bis `S6` arbeiten.
- S1 bis S3 jeweils als vollständigen deterministischen Block abarbeiten.
- Nach jedem Hauptschritt Contract Review, Findings-Korrektur, Schritt-Abnahme
  und Doku-Sync-Entscheidung dokumentieren.
- Nach S3 den S4 Readiness Review ausführen und Substeps, Reihenfolge,
  Dateiscope sowie Reasoning erneut bewerten.
- S4 substepweise umsetzen. Jeder Substep endet mit Code-/SQL-/Contract Review
  und Korrektur echter Findings.
- S5 als Gesamtschritt durchführen, aber lokale/disposable, produktiv
  read-only, Deploy, produktives SQL und Runtime-Smokes klar trennen.
- Vor produktivem Deploy, SQL und erstem Cleanup jeweils Owner Briefing.
- Optionaler CodeRabbit Review erfolgt nach lokal grünem S5-Stand und vor
  produktiver Ausführung oder finalem Commit.
- S6 synchronisiert alle Source-of-Truth-Dokus und korrigiert diesen Vertrag
  auf das tatsächlich umgesetzte Ergebnis.
- Commit-Empfehlung erst nach S5 oder S6.

## Modell- und Reasoning-Routing

- Standardmodell: `GPT-5.6 Sol`.
- Reasoning wird je Schritt nach Risiko gewählt.
- Diese Roadmap berührt SQL, Löschwirkung, Cron, Edge-Deploys, PWA-
  Kompatibilität und medizinisch sichtbare Berichte. Daher sind `High` und
  `Extra High` die normalen Stufen.
- `Ultra` ist für den initialen Roadmap- und Red-Team-Contract-Review
  begründet, aber nicht für mechanische Dokumentationsupdates notwendig.

## Statusmatrix

<!-- markdownlint-disable MD013 -->

| ID | Schritt | Reasoning | Status | Ergebnis/Notiz |
| --- | --- | --- | --- | --- |
| S1 | System- und Vertragsdetektivarbeit | `GPT-5.6 Sol / High` | DONE | Live-Schema, Consumer, SQL, Doku und aktuelle Verträge am 2026-07-16 vollständig read-only belegt. |
| S2 | Fachlicher/technischer Contract Review | `GPT-5.6 Sol / Extra High` | DONE | Cutoffs, Cron, Zeitguard, Medication-Quelle, Leer-/Fehlerzustände, Bericht, Hub, Rollout und Rechte final festgelegt. |
| S3 | Bruchrisiko-, Security- und Umsetzungsreview | `GPT-5.6 Sol / Extra High` | DONE | Lösch-, Push-, Cache-, Report-, Cron-, Concurrency- und Rollback-Risiken geschlossen oder eindeutig abgegrenzt. |
| S4R | S4 Readiness Review | `GPT-5.6 Sol / Extra High` | DONE | Consumer, Zustände, Datenformen, Lock, Cache, Tests und Deploy-Reihenfolge final bestätigt. |
| S4 | Umsetzung | `je Substep` | DONE | S4.1 bis S4.8 sind umgesetzt, reviewt und ohne offenes P0-/P1-Finding verifiziert. |
| S5 | Tests, Code Review, Deploy und Runtime-Gates | `GPT-5.6 Sol / Extra High` | DONE | Alle lokalen, disposable, freigegebenen produktiven und finalen Review-Gates sind grün; S5 ist technisch commit-bereit. |
| S6 | Doku-Sync und finaler Abschlussreview | `GPT-5.6 Sol / High` | DONE | Source of Truth, QA, Owner-Verständnis, Contract Review und Archivfreigabe finalisiert. |

<!-- markdownlint-enable MD013 -->

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Finding-Klassifizierung

<!-- markdownlint-disable MD013 -->

| ID | Severity | Typ | Status | Entscheidung / Zielschritt |
| --- | --- | --- | --- | --- |
| DH-F1 | P2 | Datenhygiene | fixed | Der strikte Wiener 90-Tage-Cleanup für `push_notification_deliveries` ist implementiert, mit Grenz-Fixtures geprüft und produktiv mit exakt 8 gelöschten Altzeilen nachgewiesen. |
| DH-F2 | P2 | Datenhygiene | fixed | Nur seit mehr als 90 Tagen unveränderte deaktivierte Push-Subscriptions werden gelöscht; Grenz-Fixtures und der produktive Erstlauf mit exakt einer gelöschten Altzeile bestätigen den Vertrag. |
| DH-F3 | P1 | Contract | fixed | Profil, Range-Bericht und Hub verwenden die Legacy-Spalte nicht mehr; S4.4 entfernt ihre Anlage aus dem Fresh-Setup-SQL. |
| DH-F4 | P1 | Code | fixed | S4.2 liest den aktuellen strukturierten Medication-Vertrag statt der potenziell veralteten Profilspalte. |
| DH-F5 | P0 | Rollout | fixed | Sofortiger produktiver Spalten-Drop ist aus dem Scope entfernt; die Spalte wird zunächst nur stillgelegt und später separat bewertet. |
| DH-F6 | P1 | Push/Runtime | fixed | S4.5 blockiert jeden expliziten `now`-Override ohne `dry_run = true` vor User-Auflösung und Nebenwirkungen. |
| DH-F7 | P1 | Error State | fixed | S4.1 trennt `loading`, `empty`, `ready` und `error`; Lade-/Fehlerzustände liefern keinen Medication-Kontext. |
| DH-F8 | P2 | Security | fixed | Cleanup-Funktion, Owner, App-ACLs, vollständige Cron-Identität, Duplikatjob-Guard und Advisory Lock sind disposable und produktiv nachgewiesen; App-Rollen besitzen weiterhin kein `EXECUTE`. |
| DH-F9 | P2 | Doku | fixed | Profile, Medication, Reports, Doctor View, Push, Assistant und Hub beschreiben nach dem produktiven Runtime-Nachweis denselben strukturierten Medication-, Retention-, Zeitguard- und Fehlerzustandsvertrag. |
| DH-F10 | Watchlist | Retention | deferred | `health_events` bleibt unbegrenzt; Neubewertung erst bei realem Wachstum, etwa ab 100.000 Zeilen oder 100 MB. |
| DH-F11 | P1 | State | fixed | S4.1 hängt die vorhandene Medication-Projektion vor `profile:changed` wieder an und hält die Anzeige read-only. |
| DH-F12 | P0 | Security | fixed | S4.2 begrenzt Medication- und Slot-Read der Service-Role explizit auf `userId`. |
| DH-F13 | P1 | Cache/Rollout | fixed | S4.3 erhöht ausschließlich den aktiven Root-Service-Worker auf Cache-Version `v6`; der reale Update-Flow folgt in S5.7. |
| DH-F14 | Watchlist | Push/Reliability | deferred | Delivery-Dedupe wird erst nach erfolgreichem Send persistiert und garantiert bei parallelen Edge-Aufrufen keine exakt-einmalige Zustellung; außerhalb dieser Hygiene-Roadmap separat behandeln. |
| DH-F15 | P2 | UI/Contract | fixed | `#profileMedications` war nur im Profilcode und der Modulübersicht beschrieben, fehlte aber im DOM; S4.1 ergänzt die read-only Anzeige. |
| DH-F16 | P2 | Datenkorrektheit | fixed | S4.8 leitet den Raucherstatus nur aus einem echten Boolean-Profilwert ab; ein Medication-only Fresh-Setup-Kontext behauptet nicht mehr fälschlich `Nichtraucher`. |
| DH-F17 | P2 | Doku/Bootstrap | fixed | `sql/HOW_TO.md` stellt nun klar, dass Nummern keine blind ausführbare Bootstrap-Kette bilden und `06_Security.sql` als historischer Legacy-Patch nicht zum aktuellen Fresh-Setup gehört. |
| DH-F18 | P2 | Testabdeckung | fixed | Der Incident-Push-Request-Vertrag ist als reiner Helper testbar; dauerhafte Deno-Regressionstests decken Diagnose mit Scheduler-Trigger, `now` ohne `dry_run`, `now` mit `dry_run: true` und den unveränderten Default-Pfad ohne `now` ab. |

<!-- markdownlint-enable MD013 -->

## Initialer Roadmap-Contract-Review 2026-07-12

Review-Gegenstände:

- Erkenntnisse aus dem read-only Produktiv-Audit.
- Push-, Profile-, Medication-, Reports-, Assistant- und Vision-Consumer.
- Medication Data Hygiene Lessons Learned.
- aktueller Cron-, RLS-, Grant-, Edge-Deploy- und PWA-Cache-Vertrag.
- Scope, Reihenfolge, Owner-Verständnis, Tooling und Runtime-Gates.

Gefundene und korrigierte Roadmap-Fehler:

- Eine zunächst referenzierte Profil-API-Datei existiert nicht. Die Referenz
  wurde entfernt; der aktive Profilzugriff liegt direkt in
  `app/modules/profile/index.js`.
- Der produktive Count-Vergleich fehlte zunächst. Die reale Drift von sechs
  Legacy-Listeneinträgen gegenüber drei aktiven strukturierten Medikamenten
  ist nun ohne Offenlegung der Inhalte dokumentiert.
- Der Profil-Save-Pfad war im ersten Entwurf nicht vollständig: Nach dem
  Upsert muss die abgeleitete Medication-Projektion vor `profile:changed`
  erhalten oder neu geladen werden. `DH-F11` und S4.1 wurden ergänzt.
- Der Service-Role-Vertrag des Arztberichts brauchte einen expliziten
  Cross-User-Guard. Jede neue Medication- und Slot-Abfrage muss auf `userId`
  begrenzt werden. `DH-F12`, S4.2 und die Architektur-Constraints wurden
  ergänzt.
- Jobname, Zeitplan und SQL-Dateiname waren zunächst zu offen. Der Zielvertrag
  nennt nun `sql/18_Push_Data_Hygiene.sql`,
  `midas-push-hygiene-weekly` und `45 3 * * 0`.
- Die erste produktive Cleanup-Abnahme war als Wahl zwischen manuellem Lauf
  und unbestimmtem Cron-Warten formuliert. Sie ist nun deterministisch als
  separat freigegebener manueller Erstlauf definiert.
- Ein sofortiger physischer Drop der Legacy-Spalte wäre mit alten PWA-Caches
  nicht verträglich. `DH-F5` wurde durch Deprecation ohne Drop bereits auf
  Roadmap-Ebene geschlossen.

Review-Ergebnis:

- Alle bekannten Findings sind einem Umsetzungs-, Test-, Doku- oder
  Watchlist-Schritt zugeordnet.
- Kein produktiver Write oder Deploy wurde ausgeführt.
- Die Roadmap ist bereit für die deterministische S1-Abarbeitung.

## S1 - System- und Vertragsdetektivarbeit

Empfohlenes Modell / Reasoning: `GPT-5.6 Sol / High`.

Ziel:

- Den exakten Istvertrag beweisen, bevor eine Retention oder Source-of-Truth-
  Änderung geplant wird.

### S1.1 - Projekt- und Arbeitsvertrag lesen

- `README.md`, `docs/DEV_ENVIRONMENT.md`, Roadmap-Template und Medication-
  Lessons-Learned lesen.
- Dirty Worktree und bestehende fremde Änderungen dokumentieren.
- Keine Secrets oder produktiven Writes.

### S1.2 - Betroffene Module Overviews lesen

- Profile, Medication, Push, Reports, Doctor View, Assistant und Android
  Widget lesen.
- Source-of-Truth-Aussagen und bekannte Risiken extrahieren.

### S1.3 - Historische Entscheidungen lesen

- Medication Data Hygiene und Incident Push DONE-Roadmaps lesen.
- Bestehende 7-Tage-Push-Freshness, Medication-Retention und Deploy-Gates
  dokumentieren.

### S1.4 - Produktives Dateninventar read-only erneuern

- Alle `public`-Tabellen, Zeilenzahlen, Größen und Altersbereiche erfassen.
- Delivery-Verteilung und aktive/deaktivierte Subscription-Zahlen prüfen.
- Keine Endpoints, Keys oder Secret-Werte ausgeben.

### S1.5 - Push-Datenfluss vollständig kartieren

- Erzeugung, Dedupe-Abfrage, Upsert, Deaktivierung und Reaktivierung prüfen.
- Alle Consumer von `push_notification_deliveries` und
  `push_subscriptions.disabled` erfassen.
- `now`, `dry_run`, Trigger und Service-Role-Vertrag dokumentieren.

### S1.6 - Medication-Doppelwahrheit vollständig kartieren

- Alle Reads/Writes von `user_profile.medications` erfassen.
- Alle aktuellen Medication-Projektionen aus `health_medications`, Slots und
  `med_list_v2` erfassen.
- Profil, Hub, Arztbericht, Assistant und Vision getrennt bewerten.

### S1.7 - SQL-, RLS-, Grant- und Cron-Baseline erfassen

- `10`, `12`, `15`, `16` und `17` lesen.
- vorhandene Indizes, Trigger, Policies, Funktionsrechte und Cron-Jobs prüfen.
- Frische Datenbank und bestehende Produktion getrennt dokumentieren.

### S1.8 - Health-Events-Keep-Entscheid gegenprüfen

- Typen, Wachstum, Berichts- und Trendconsumer prüfen.
- Belegen, warum keine Retention Teil dieser Roadmap ist.

### S1.9 - Systemkarte und offene Fragen dokumentieren

- Runtime-Flüsse, Datenquellen und Deploy-Abhängigkeiten notieren.
- Ungeklärte Format-, Cache- oder Rollout-Fragen als Findings klassifizieren.

### S1.10 - Contract Review S1 und Findings-Korrektur

- Roadmap-Annahmen gegen Code, SQL, Doku und Live-Schema prüfen.
- Falsche Dateiliste, Consumer-Annahmen und Finding-Severity korrigieren.
- Owner-Verständnis auf den ermittelten Iststand aktualisieren.

### S1.11 - Schritt-Abnahme und Doku-Sync-Entscheidung

Exit-Kriterien:

- Alle aktiven und Legacy-Consumer sind bekannt.
- Produktive Löschkandidaten und Nicht-Kandidaten sind mit Zahlen belegt.
- Keine Grundannahme beruht nur auf Erinnerung oder Screenshot.
- Noch kein Runtime-Code und kein produktives SQL wurde geändert.

### Ergebnisprotokoll S1

#### S1.1 bis S1.3 - Projekt-, Modul- und Historienvertrag

- Umsetzung / Untersuchung:
  - `README.md`, `docs/DEV_ENVIRONMENT.md`, Roadmap-Template und Medication-
    Lessons-Learned wurden gelesen.
  - Profile, Medication, Push, Reports, Doctor View, Assistant und Android
    Widget wurden gegen ihren aktuellen Source-of-Truth-Vertrag geprüft.
  - Die DONE-Roadmaps für Medication Data Hygiene und Incident Push wurden
    gegen die aktuelle Roadmap abgeglichen.
  - Der Dirty Worktree wurde vor jeder Änderung aufgenommen; vorhandene
    Doku-Arbeit wurde nicht zurückgesetzt.
- Bestätigte Altverträge:
  - Medication-Slot-Events besitzen ein rollendes Wiener Einjahresfenster.
  - `midas-medication-retention-daily` läuft täglich um `03:15 UTC` intern in
    PostgreSQL und ist für App-Rollen nicht ausführbar.
  - Lokale Push-Unterdrückung ist nur bei einer echten Remote-Zustellung aus
    den letzten sieben Tagen erlaubt, wenn danach kein neuerer Fehler vorliegt,
    der Failure-Zähler null ist und der Erfolg nicht unplausibel in der Zukunft
    liegt.
  - Diagnose-Pushes zählen nicht als fachliche Remote-Zustellung.
  - Deploys, produktives SQL, produktive Löschwirkung und echte Push-/Report-
    Smokes bleiben getrennte Owner-Gates.
- Findings:
  - Der in der Roadmap behauptete reine Ein-Datei-Worktree war falsch.
  - Profile Overview enthält bereits eine Zielaussage zur abgeleiteten
    Medication, dokumentiert zugleich aber noch Legacy-Spalte und Legacy-
    Formularverarbeitung als Iststand.
- Korrekturen:
  - Current Working State listet den tatsächlichen Doku-Worktree und grenzt
    ihn von unverändertem Runtime-Code und SQL ab.
  - `DH-F9` beschreibt die konkrete Doku-Inkonsistenz und bleibt bis S6 offen.

#### S1.4 - Produktives Dateninventar vom 2026-07-16

Die Abfragen waren read-only. Es wurden keine Endpoints, Push-Keys, Secrets
oder medizinischen Inhalte ausgegeben.

<!-- markdownlint-disable MD013 -->

| Tabelle | Zeilen | Gesamtgröße | Erfasster Altersbereich |
| --- | ---: | ---: | --- |
| `user_profile` | 1 | 32 kB | erstellt 2025-12-05, zuletzt aktualisiert 2026-07-10 |
| `health_events` | 276 | 488 kB | 2024-12-11 bis 2026-07-16 |
| `health_medications` | 3 | 96 kB | erstellt 2026-03-21, zuletzt aktualisiert 2026-07-16 |
| `appointments_v2` | 6 | 64 kB | Termine 2026-01-14 bis 2027-04-07 |
| `trendpilot_events` | 0 | 88 kB | leer |
| `trendpilot_state` | 2 | 48 kB | erstellt/aktualisiert 2026-01-10 |
| `push_subscriptions` | 6 | 176 kB | erstellt 2026-01-27, zuletzt aktualisiert 2026-07-14 |
| `health_medication_schedule_slots` | 3 | 80 kB | aktuelle Startdaten ab 2026-07-12 |
| `health_medication_slot_events` | 15 | 216 kB | 2026-07-12 bis 2026-07-16 |
| `push_notification_deliveries` | 30 | 80 kB | 2026-03-28 bis 2026-07-14 |

<!-- markdownlint-enable MD013 -->

- Datenbank gesamt: rund `21 MB`.
- Tabellen im Schema `public` gesamt: `1368 kB`.
- Push-Subscriptions: `3` aktiv, `3` deaktiviert; `1` deaktivierte Zeile ist
  seit mehr als 90 Tagen unverändert.
- Delivery-Historie: `30` Zeilen, davon `8` bei strengem Prädikat
  `day < 2026-04-17` älter als 90 Wiener Kalendertage.
- Delivery-Verteilung:
  - `19` BP-Abend-Incidents.
  - `5` Medication-Morgen-Incidents.
  - `6` Medication-Morgen-Reminder.
  - alle vorhandenen Zeilen stammen aus Scheduler-Runs.
- Medication-Doppelwahrheit: `6` Legacy-Listeneinträge im Profil gegenüber
  `3` aktiven strukturierten Medikamenten.

#### S1.5 - Push-Systemkarte

```text
GitHub Actions Ticker
  -> midas-incident-push mit Service-Role-Bearer
  -> fachliche Europe/Vienna-Auswertung aus Medication-Read-Model und BP-View
  -> Read nur aktiver push_subscriptions
  -> Web-Push je Subscription
  -> Success/Failure-Health auf push_subscriptions
  -> bei mindestens einer erfolgreichen Zustellung Delivery-Upsert
     auf user_id/day/type/severity/source

Browser/PWA
  -> hält Browser-Subscription
  -> Upsert auf user_id/endpoint setzt disabled = false
  -> liest Health nur für den eigenen aktuellen Endpoint
  -> unterdrückt lokalen Fallback nur bei erfülltem 7-Tage-Freshness-Vertrag
```

- `404` und `410` deaktivieren eine Subscription; andere Fehler erhöhen den
  Failure-Zähler, deaktivieren sie aber nicht automatisch.
- Ein erneuter Browser-Upsert desselben Endpoints reaktiviert die Zeile.
- `push_notification_deliveries` wird im Runtime-Code nur von
  `midas-incident-push` als tagesbezogener Dedupe-State gelesen und nach
  erfolgreicher Zustellung geschrieben. Weitere Treffer liegen in SQL-
  Provisionierung und der abgeschlossenen Medication-Transition, nicht in
  einem zusätzlichen Runtime-Consumer.
- `push_subscriptions.disabled` wird fachlich von der Edge Function und vom
  Browser-/PWA-Push-Modul konsumiert.
- `trigger` unterscheidet Scheduler und manuellen Aufruf; der GitHub-Workflow
  setzt bei Zeitplan `scheduler` und bei Workflow Dispatch `manual`.
- `now` wird derzeit unabhängig von `dry_run` akzeptiert. Der historische
  Non-Dry-Run bleibt deshalb ein reales privilegiertes Replay-Risiko nach
  Ablauf der Delivery-Retention und bestätigt `DH-F6`.
- Ohne explizite `user_id` wird nur `INCIDENTS_USER_ID` verwendet; fehlt auch
  dieser Wert, bricht die Edge Function geschlossen ab.

#### S1.6 - Medication-Systemkarte

```text
health_medications + health_medication_schedule_slots
  -> med_list_v2 / Medication-Modul
  -> Intake, Hub-Fast-Paths, Voice, Incidents und Android Widget
  -> Profil-Snapshot zur Laufzeit

user_profile.medications
  -> Profil-Select, Formular und Profil-Upsert
  -> Range-Arztbericht
  -> Hub-Profilkontext
  -> Assistant/Vision über den vom Hub übergebenen Kontext
```

- Das Profil lädt beide Welten. Nur wenn der strukturierte Snapshot mindestens
  eine Zeile enthält, überschreibt er die Legacy-Anzeige und macht das Feld
  read-only.
- Ein erfolgreicher leerer Medication-Snapshot und ein Ladefehler werden
  derzeit beide als `null`/Fallback behandelt. Das bestätigt `DH-F7`.
- Der Profil-Save schreibt die Legacy-Liste weiter und ersetzt danach den State
  mit der Upsert-Antwort. Dadurch kann die abgeleitete Projektion bis zum
  nächsten Sync verschwinden oder wieder editierbar werden. Das bestätigt
  `DH-F3` und `DH-F11`.
- Der Range-Arztbericht liest `user_profile.medications` direkt mit Service
  Role und formatiert diese Liste. Das bestätigt `DH-F4`.
- Hub besitzt keinen zweiten Datenbank-Read, sondern übernimmt
  `ctx.profile.medications`. Assistant und Vision erhalten diesen Kontext vom
  Hub und lesen die Profilspalte nicht selbst.
- Das Android Widget verwendet das strukturierte Medication-Read-Model und ist
  kein Consumer der Legacy-Profilspalte.

#### S1.7 - SQL-, RLS-, Grant- und Cron-Baseline

- Fresh-Setup:
  - `sql/10_User_Profile_Ext.sql` provisioniert die Legacy-Spalte
    `user_profile.medications` weiterhin.
  - `sql/12_Medication.sql` provisioniert die drei strukturierten Medication-
    Tabellen, RLS, Policies, Indizes und RPCs einschließlich `med_list_v2`.
  - `sql/15_Push_Subscriptions.sql` provisioniert Push-Health, Delivery-Dedupe,
    Trigger, RLS und Policies, aber noch keine Retention.
  - `sql/16_Explicit_Grants.sql` beschränkt Data-API-Rechte explizit;
    authentifizierte Nutzer dürfen Deliveries nur lesen, Service Role darf sie
    für den Scheduler verwalten.
  - `sql/17_Medication_Retention.sql` kapselt die Medication-Retention intern
    und getrennt von Push-Hygiene.
- Produktion:
  - RLS ist auf allen zehn `public`-Tabellen aktiv.
  - Die erwarteten Medication- und Push-Policies sowie expliziten Grants sind
    vorhanden.
  - Der Composite-FK der Slot-Events ist durch den eindeutigen Index
    `uq_medication_schedule_slot_id_med` abgesichert.
  - Der Delivery-Dedupe-Index
    `uq_push_notification_deliveries_event` ist vorhanden.
  - Der Medication-Cleanup ist `SECURITY INVOKER`, besitzt festen
    `search_path=pg_catalog` und ist für `PUBLIC`, `anon`, `authenticated` und
    `service_role` nicht ausführbar.
  - Genau ein aktiver Job `midas-medication-retention-daily` existiert unter
    `postgres` mit `15 3 * * *` und dem erwarteten Command.
  - Es gibt noch keinen Push-Hygiene-Job.
- Advisor:
  - Security meldet nur den bekannten, im Free-Plan nicht aktivierbaren
    Leaked-Password-Schutz.
  - Performance meldet ausschließlich unbenutzte Indizes als Information.
    Bei den kleinen Tabellen und teils absichtlich vorgehaltenen Diagnose-
    oder FK-Zugriffspfaden wird innerhalb dieser Roadmap kein Index entfernt.

#### S1.8 - Health-Events-Keep-Entscheid

- Die `276` Events verteilen sich auf `155` BP-, `47` Body-, `5` Lab-, `58`
  Activity-, `1` Intake-, `2` Note- und `8` System-Comment-Events.
- Der Zeitraum reicht vom `2024-12-11` bis `2026-07-16`; die Tabelle belegt
  inklusive Indizes nur rund `488 kB`.
- Die Daten speisen Arztansicht, Monats-/Range-Berichte, Charts, Trendpilot,
  Protein-Zielberechnung, Incident-BP-Prüfung, Intakes und Systemkommentare.
- Eine Retention würde medizinische Langzeitverläufe und spätere
  Längsschnittgraphen schwächen, während der aktuelle Speichergewinn
  vernachlässigbar wäre.
- `DH-F10` bleibt deshalb bewusst als Watchlist mit erneuter Bewertung erst bei
  realem Wachstum von ungefähr `100.000` Zeilen oder `100 MB` bestehen.

#### S1.9 bis S1.11 - Contract Review, Findings und Abnahme

- Contract Review:
  - Roadmap-Annahmen wurden gegen Code, kanonisches SQL, Live-Schema, RLS,
    Grants, Cron, Advisor und Source-of-Truth-Dokus geprüft.
  - Aktive Consumer, Legacy-Consumer und rein historische SQL-Treffer sind
    voneinander getrennt.
  - Frische Datenbank und bestehende Produktion sind ausdrücklich getrennt.
- Findings:
  - Die Live-Zahlen und Löschkandidaten vom `2026-07-12` waren erwartbar
    veraltet.
  - Der dokumentierte Dirty Worktree war unvollständig.
  - Die Health-Events-Referenzliste enthielt die späteren Lab- und Activity-
    Erweiterungen nicht.
  - Profile Overview beschreibt gleichzeitig Ziel- und Legacy-Vertrag.
  - Keine zusätzliche unbekannte Runtime-Abhängigkeit wurde gefunden.
- Korrekturen:
  - Live-Baseline, Löschkandidaten, Metadaten, Statusmatrix und Handoff wurden
    auf `2026-07-16` aktualisiert.
  - `sql/11_Lab_Event_Extension.sql` und `sql/13_Activity_Event.sql` wurden als
    relevante Health-Events-Referenzen ergänzt.
  - `DH-F9` wurde auf die konkrete Doku-Inkonsistenz präzisiert.
  - S1 ist `DONE`; nächster erlaubter Schritt ist S2.
- Restrisiko:
  - Produktive Counts verändern sich bis S5 weiter und müssen direkt vor jedem
    Write erneut erhoben werden.
  - Web Push bleibt Best Effort; Datenhygiene kann keine sichtbare Zustellung
    garantieren.
  - Die spätere physische Entfernung der Legacy-Spalte bleibt außerhalb dieses
    Scopes und benötigt einen neuen Consumer- und Client-Rollout-Nachweis.
- Doku-Sync-Entscheidung:
  - In S1 wird nur die Roadmap auf den bewiesenen Iststand korrigiert.
  - Module Overviews bleiben bis zum realen Runtime-Nachweis in S6 unverändert.
- Abnahme:
  - S1.1 bis S1.11 sind deterministisch abgeschlossen.
  - Alle Exit-Kriterien sind erfüllt.
  - Es erfolgte kein Runtime-Code-Change, kein SQL-Change, kein Deploy und kein
    produktiver Write.

## S2 - Fachlicher und technischer Zielvertrag

Empfohlenes Modell / Reasoning: `GPT-5.6 Sol / Extra High`.

Ziel:

- Den genauen Zielvertrag für Retention, Source of Truth, Rollout und Rechte
  festlegen.

### S2.1 - Delivery-Retention definieren

- Wiener Cutoff exakt festlegen.
- Grenzsemantik für `-91`, `-90`, heute und Zukunft definieren.
- Diagnosewert und Dedupe-Wert voneinander trennen.

### S2.2 - Subscription-Retention definieren

- Nur `disabled = true` zulassen.
- Altersanker und Reaktivierungsverhalten festlegen.
- Aktive, vorübergehend fehlerhafte und nie erfolgreiche Subscriptions
  explizit schützen.

### S2.3 - Scheduler-Architektur festlegen

- eigenen Push-Hygiene-Job gegen Erweiterung des Medication-Jobs vergleichen.
- Frequenz, Name, Owner, Command und Cron-Run-Details-Retention festlegen.
- Duplikatjob- und falscher-Owner-Verhalten definieren.

### S2.4 - Incident-Push-Zeitvertrag festlegen

- produktive aktuelle Zeit, trockene historische Simulation und diagnostische
  Runs voneinander trennen.
- Non-Dry-Run mit überschriebenem `now` geschlossen ablehnen.
- vorhandene GitHub-Workflows auf Kompatibilität prüfen.

### S2.5 - Medication-Source-of-Truth-Vertrag festlegen

- `health_medications` plus aktuelle Slots als einzige aktive Quelle.
- aktive/inaktive Medikamente und aktuelle Planzeiträume definieren.
- In-Memory-Projektion im Profil von persistierter Profilspalte unterscheiden.

### S2.6 - Profil-Fehler- und Leerzustand definieren

- erfolgreiche leere Medikamentenliste bedeutet „keine aktiven Medikamente“.
- fehlgeschlagenes Read-Model bedeutet „nicht verfügbar“, nicht leer.
- Medication-Feld bleibt abgeleitet und nicht manuell editierbar.

### S2.7 - Arztbericht-Ausgabe definieren

- aktive Medikamente, Stärke und Einnahmeplan lesbar formatieren.
- Bestände, Low-Stock-Status und interne IDs nicht in den Arztbericht nehmen.
- Verhalten ohne Medication-Daten und bei Query-Fehler definieren.

### S2.8 - Assistant-/Vision-Kontext definieren

- aktuellen Hub-Kontext prüfen.
- keine unnötige zweite DB-Abfrage in Assistant oder Vision einführen.
- bei nicht verfügbarem Medication-Kontext lieber weglassen als Legacy-Daten
  verwenden.

### S2.9 - Legacy-Spalten-Rollout definieren

- neue Consumer stoppen Reads und Writes.
- Fresh-Setup-SQL erzeugt die Legacy-Spalte nicht mehr.
- bestehende produktive Spalte bleibt vorerst als ungenutzte
  Kompatibilitätsspalte bestehen.
- physischer Drop erhält ein eigenes späteres User-Gate.

### S2.10 - Security-, Grant- und RLS-Vertrag definieren

- Cleanup bleibt intern und für App-Rollen nicht ausführbar.
- Cron läuft nur unter erwarteter DB-Rolle.
- Tabellen-RLS und bestehende Data-API-Grants werden nicht erweitert.

### S2.11 - Finalen Zielvertrag und S4-Pflichtpunkte dokumentieren

- alle Findings einem S4- oder Watchlist-Schritt zuordnen.
- Scope und Not in Scope gegen Zielvertrag korrigieren.

### S2.12 - Contract Review S2 und Findings-Korrektur

- Zielvertrag gegen MIDAS-Guardrails, Cache-Realität, Arztbericht und Push-
  Sicherheitsnetz prüfen.
- Owner-Verständnis aktualisieren.

### S2.13 - Schritt-Abnahme und Doku-Sync-Entscheidung

Exit-Kriterien:

- Cutoffs, Source of Truth und Fehlerzustände sind eindeutig.
- Rollout-Reihenfolge und spätere Spaltenentfernung sind nicht vermischt.
- Jede produktive Wirkung besitzt ein User-Gate.

### Ergebnisprotokoll S2

#### S2.1 - Delivery-Retention

- Gemeinsamer Bezugswert innerhalb eines Cleanup-Laufs:
  - `v_today := (statement_timestamp() at time zone 'Europe/Vienna')::date`.
  - `v_delivery_cutoff := v_today - 90`.
  - Löschprädikat:
    `push_notification_deliveries.day < v_delivery_cutoff`.
- Grenzvertrag bezogen auf den Wiener Ausführungstag `D`:

<!-- markdownlint-disable MD013 -->

| Fixture | Erwartung | Begründung |
| --- | --- | --- |
| `D - 91` und älter | löschen | Streng älter als 90 Wiener Kalendertage. |
| `D - 90` | behalten | Gehört noch zum 90-Tage-Fenster. |
| `D` | behalten | Aktueller Dedupe-State. |
| Zukunft | behalten und diagnostisch sichtbar machen | Retention korrigiert keine fachlich unplausiblen Zukunftsdaten stillschweigend. |

<!-- markdownlint-enable MD013 -->

- Konkretes Beispiel für `D = 2026-07-16`:
  - Cutoff ist `2026-04-17`.
  - `2026-04-16` und älter werden gelöscht.
  - `2026-04-17` und jünger bleiben erhalten.
- `day` ist der Altersanker, weil derselbe Wiener Tag Teil des aktiven Dedupe-
  Schlüssels ist. `sent_at` und `created_at` entscheiden nicht über Retention.
- Der 90-Tage-Zeitraum dient Diagnose und Betriebsanalyse. Eine Delivery-Zeile
  belegt mindestens eine technisch akzeptierte Remote-Zustellung, aber weder
  Sichtbarkeit am Gerät noch tatsächliche Medikamenteneinnahme.
- Bei wöchentlicher Ausführung kann die älteste Zeile zwischen zwei Läufen
  vorübergehend ungefähr 96 Tage alt sein. Direkt nach jedem erfolgreichen Lauf
  muss das strenge Zielprädikat erfüllt sein.

#### S2.2 - Subscription-Retention

- Gemeinsamer Bezugswert innerhalb eines Cleanup-Laufs:
  - `v_subscription_cutoff := statement_timestamp() - interval '90 days'`.
  - Löschprädikat:
    `disabled = true and updated_at < v_subscription_cutoff`.
- Grenzvertrag:
  - exakt 90 Tage unverändert: behalten.
  - mehr als 90 Tage unverändert und deaktiviert: löschen.
  - `disabled = false`: unabhängig vom Alter behalten.
  - vorübergehende Fehler ohne Deaktivierung: behalten.
  - noch nie erfolgreiche, aber aktive Subscription: behalten.
- `updated_at` ist der Altersanker:
  - `404` oder `410` deaktiviert den Endpunkt und aktualisiert die Zeile.
  - Ein Browser-Re-Upsert desselben Endpoints setzt `disabled` wieder auf
    `false`, aktualisiert die Zeile und reaktiviert den Vertrag.
  - Wurde eine alte deaktivierte Zeile bereits gelöscht, erzeugt ein späterer
    Re-Upsert einen neuen aktiven Datensatz.
- Das Löschen einer Subscription löscht keine Delivery-Historie mit. Deliveries
  referenzieren den User, nicht die Subscription.

#### S2.3 - Scheduler-Architektur

- Push-Hygiene bleibt ein eigener Verantwortungsbereich:
  - kanonische Datei: `sql/18_Push_Data_Hygiene.sql`.
  - interne Funktion:
    `public.push_data_hygiene_cleanup_internal()`.
  - Jobname: `midas-push-hygiene-weekly`.
  - Schedule: `45 3 * * 0`.
  - produktive Cron-Zeitzone: `GMT`.
  - reale Laufzeit: Sonntag `03:45 UTC`, also `04:45` MEZ oder `05:45` MESZ.
  - erwarteter Owner: `postgres`.
  - Command:
    `select public.push_data_hygiene_cleanup_internal();`.
- Der Medication-Job bleibt unverändert. Es gibt keine gemeinsame Cleanup-
  Funktion, keinen gemeinsamen Job und keine gekoppelte Fehlerdomäne.
- Die Funktion läuft `SECURITY INVOKER`, mit festem
  `search_path = pg_catalog` und vollständig qualifizierten Objektnamen.
- Der Funktions-Return liefert mindestens:
  - verwendeten Delivery- und Subscription-Cutoff.
  - gelöschte Deliveries.
  - gelöschte Subscriptions.
  - gelöschte eigene Cron-Run-Details.
- Eigene Cron-Run-Details werden nur gelöscht, wenn:
  - sie zum exakt einen Job `midas-push-hygiene-weekly` gehören.
  - der Lauf abgeschlossen ist.
  - `end_time < statement_timestamp() - interval '90 days'` gilt.
  - laufende oder nicht abgeschlossene Einträge bleiben erhalten.
- Provisionierung und Lauf brechen geschlossen ab, wenn:
  - mehr als ein namensgleicher Job gefunden wird.
  - ein bestehender namensgleicher Job nicht `postgres` gehört.
  - Datenbank, Command oder sonstige Identität nicht dem Zielvertrag
    entsprechen und nicht eindeutig idempotent korrigiert werden können.
- Das SQL darf bei korrektem Iststand wiederholt werden und hinterlässt danach
  weiterhin exakt einen erwarteten Job.

#### S2.4 - Incident-Push-Zeitvertrag

- Der Request-Vertrag unterscheidet drei Fälle:
  - kein `now`: reale aktuelle Zeit; Scheduler, manueller Incident und
    diagnostischer Push bleiben möglich.
  - `now` plus `dry_run = true`: historische Simulation ohne Push- oder
    Datenbankschreibwirkung bleibt möglich.
  - `now` plus `dry_run != true`: Request wird mit Status `400` geschlossen
    abgelehnt.
- Der Guard gilt für Incident- und Diagnosemodus. Er greift nach Auth und
  Input-Validierung, aber vor fachlichen Datenbank-Reads, Push-Sends,
  Subscription-Health-Updates und Delivery-Writes.
- Diagnose bleibt zusätzlich auf `trigger = manual` beschränkt.
- Trockene historische Simulation schreibt weder Delivery-State noch
  Subscription-Health und sendet keinen Push.
- Die bestehenden GitHub-Workflow-Payloads setzen kein `now` und bleiben daher
  kompatibel.

#### S2.5 - Medication-Source-of-Truth

- Einzige aktive Quelle:
  - Medikamentenstamm: `health_medications`.
  - Einnahmeplan: `health_medication_schedule_slots`.
- Aktuelles Medikament:
  - gehört dem aufgelösten User.
  - `active = true`.
- Aktueller Slot am Wiener Bezugsdatum:
  - gehört demselben User und Medikament.
  - `active = true`.
  - `start_date <= Bezugsdatum`.
  - `end_date is null or end_date >= Bezugsdatum`.
- Profil und Range-Arztbericht verwenden als Bezugsdatum den aktuellen Wiener
  Kalendertag ihrer Ausführung. Der historische `from`-/`to`-Zeitraum des
  Berichts ändert „Derzeitige Medikation“ nicht in einen historischen Snapshot.
- Ein aktives Medikament ohne aktuell gültigen Slot bleibt ein aktuelles
  Medikament. Es wird nicht ausgeblendet, sondern mit fehlendem aktuellem
  Einnahmeplan gekennzeichnet.
- Inaktive Medikamente sowie zukünftige, beendete oder deaktivierte Slots
  erscheinen nicht als aktuelle Medikation.
- Das Profil darf `med_list_v2` als authentifizierte Read-Projektion verwenden.
  Der Service-Role-Arztbericht lädt Stammdaten und Slots dagegen direkt und
  begrenzt jede Abfrage explizit auf `userId`.
- `user_profile.medications` ist ab S4 keine aktive Quelle, kein Fallback und
  kein Ziel für neue Writes mehr.

#### S2.6 - Profil-Fehler- und Leerzustand

- Das Profil verwendet einen ausdrücklichen Vier-Zustands-Vertrag:

<!-- markdownlint-disable MD013 -->

| Zustand | Sichtbarer Inhalt | In-Memory-Kontext | Editierbar |
| --- | --- | --- | --- |
| lädt | neutraler Ladezustand | noch keine Medication-Aussage | nein |
| erfolgreich, null aktive Medikamente | `Keine aktiven Medikamente` | `medications: []` | nein |
| erfolgreich, aktive Medikamente | formatierte strukturierte Projektion | aktuelle Projektionszeilen | nein |
| Read-Model fehlgeschlagen | `Medikation derzeit nicht verfügbar` | Medication-Eigenschaft fehlt | nein |

<!-- markdownlint-enable MD013 -->

- Die sichtbaren Statussätze sind UI-Copy und werden nicht als vermeintliche
  Medikamentenzeilen in den Hub-, Assistant- oder Vision-Kontext übernommen.
- Das Feld ist ab Initialisierung des Medication-Reads immer abgeleitet und
  read-only. Ein Fehler schaltet es niemals auf manuelle Legacy-Eingabe zurück.
- Profil-Select und Profil-Upsert enthalten die Legacy-Spalte nicht mehr.
- Nach erfolgreichem Profil-Save wird die vorhandene strukturierte Medication-
  Projektion wieder an `state.data` angehängt oder kontrolliert neu geladen,
  bevor `profile:changed` emittiert wird.
- Ein Profil-Save darf den Zustand `nicht verfügbar` nicht in eine erfolgreiche
  leere Liste umdeuten.

#### S2.7 - Arztbericht-Ausgabe

- Betroffen ist der Range-Arztbericht. Der automatische Monatsbericht besitzt
  derzeit keinen Patient-Medication-Block und bleibt in diesem Punkt
  unverändert.
- Der Range-Arztbericht lädt aktive Medikamente und am aktuellen Wiener
  Berichtstag gültige Slots direkt aus den strukturierten Tabellen.
- Jede Medication- und Slot-Abfrage enthält explizit
  `.eq("user_id", userId)`. Die Verknüpfung der Slots wird zusätzlich auf die
  geladenen Medikamente beschränkt.
- Deterministische Reihenfolge:
  - Medikamente nach normalisiertem Namen und als Tie-Breaker nach ID.
  - Slots nach `sort_order` und als Tie-Breaker nach ID.
- Lesbare Ausgabe enthält:
  - Medikamentenname.
  - Stärke, sofern vorhanden.
  - aktuelle Tagesabschnitte und `qty_per_slot`.
  - `mit Mahlzeit`, sofern dieser strukturierte Vertrag aktiv ist.
- Zielcopy pro Medikament folgt sinngemäß dem Muster
  `Name (Stärke; Morgens: 1, Abends: 1)`. Die finale österreichische Copy wird
  in S3.6 festgelegt und darf keine nicht vorhandene Darreichungsform erfinden.
- Ein aktives Medikament ohne aktuellen Slot erscheint mit
  `Einnahmeplan nicht hinterlegt`.
- Nicht ausgegeben werden:
  - Bestand, Low-Stock-Schwelle, Aufbrauchsdatum oder Bestandsbestätigung.
  - Leaflet-URL, interne IDs oder technische Feldnamen.
  - inaktive Medikamente oder nicht aktuelle Slots.
- Erfolgreich geladene null aktive Medikamente ergeben
  `keine aktiven Medikamente hinterlegt`.
- Schlägt die Medication- oder Slot-Abfrage fehl, schlägt der gesamte Range-
  Bericht mit klarer Fehlerantwort fehl. Es wird kein unvollständiger Bericht
  als `health_event` persistiert und es gibt keinen Legacy-Fallback.
- Die Medication-Abfrage bleibt logisch vom Vorhandensein einzelner optionaler
  Profildaten getrennt. Fehlende Profildetails dürfen einen erfolgreich
  geladenen aktuellen Medication-Stand nicht in Legacy-Daten umleiten.

#### S2.8 - Assistant-, Vision- und Hub-Kontext

- Der Hub bleibt der einzige Kontext-Assembler. Assistant und Vision erhalten
  keine zusätzliche Medication-Datenbankabfrage.
- Der Hub-Vertrag unterscheidet:
  - erfolgreiche Projektion mit Zeilen: `profile.medications` enthält die
    aktuellen formatierten Zeilen.
  - erfolgreiche leere Projektion: `profile.medications` ist `[]`.
  - nicht verfügbarer oder noch nicht geladener Medication-Kontext: Die
    Eigenschaft `profile.medications` wird ausgelassen.
- Der Hub darf `undefined` oder fehlende Medication-Daten nicht automatisch zu
  `[]` normalisieren. Sonst ginge die Unterscheidung zwischen Leere und Fehler
  verloren.
- Assistant und Vision bleiben tolerant gegenüber einer fehlenden optionalen
  Medication-Eigenschaft. Es gibt keinen Legacy-Fallback und keine technische
  Fehlermeldung im normalen Chatkontext.

#### S2.9 - Legacy-Spalten-Rollout

- Neue aktive Consumer:
  - lesen `user_profile.medications` nicht mehr.
  - schreiben `user_profile.medications` nicht mehr.
  - verwenden die Spalte nicht als Fallback.
- `sql/10_User_Profile_Ext.sql` provisioniert die Spalte bei einem neuen MIDAS-
  Setup nicht mehr.
- Die bestehende produktive Spalte bleibt unverändert vorhanden:
  - Alte oder gecachte Clients dürfen sie während des Rollouts weiterhin
    auswählen oder beschreiben, ohne einen Schemafehler auszulösen.
  - Neue Consumer ignorieren ihren möglicherweise driftenden Inhalt.
  - Es gibt kein Leeren, Überschreiben, Synchronisieren oder Drop-SQL in dieser
    Roadmap.
- Ein physischer Drop ist ein eigener späterer Change mit neuem Owner-Gate. Vor
  diesem Gate müssen mindestens nachgewiesen sein:
  - erneuter repo-weiter Consumer-Scan ohne aktive Reads oder Writes.
  - Remote-Edge-Functions entsprechen dem neuen Vertrag.
  - PWA-/Service-Worker-Rollout ist auf allen relevanten Clients praktisch
    bestätigt.
  - ausdrückliche User-Freigabe für den Schema-Drop.
- Es wird kein automatisches Drop-Datum vorgetäuscht. Die Kompatibilitätsspalte
  darf langfristig bestehen bleiben, wenn ihr Entfernen keinen realen Nutzen
  bringt.

#### S2.10 - Security-, Grant-, RLS- und Indexvertrag

- `public.push_data_hygiene_cleanup_internal()` bleibt
  `SECURITY INVOKER` und läuft ausschließlich mit den Rechten des aufrufenden
  `postgres`-Cron-/DB-Kontexts.
- Fester `search_path = pg_catalog`; Tabellen, Funktionen und Cron-Objekte
  werden vollständig qualifiziert.
- `EXECUTE` wird explizit entzogen für:
  - `PUBLIC`.
  - `anon`.
  - `authenticated`.
  - `service_role`.
- Bestehende Tabellen-RLS, Policies und Data-API-Grants werden weder erweitert
  noch aufgeweicht. Es entsteht keine neue App-API.
- Der vorhandene Index
  `idx_push_notification_deliveries_day_type` beginnt mit `day` und deckt den
  Delivery-Cleanup-Vertrag bereits ab. Es wird kein zweiter Delivery-
  Retention-Index angelegt.
- Für den langfristigen Subscription-Cleanup wird ein kleiner partieller Index
  auf `updated_at where disabled = true` vorgesehen. Aktive Endpunkte werden
  dadurch nicht in den Retention-Index aufgenommen.
- Die Cron-Provisionierung prüft Owner, Datenbank, Schedule und Command nach dem
  SQL-Lauf erneut. Ein App-Role-Test muss die Funktionsausführung ablehnen.
- Security und Performance Advisor werden vor und nach produktiver Anwendung
  verglichen; bekannte planbedingte Hinweise werden nicht als neue Findings
  fehlklassifiziert.

#### S2.11 - Finaler Zielvertrag und Finding-Zuordnung

<!-- markdownlint-disable MD013 -->

| Finding | Verbindliche Behandlung |
| --- | --- |
| `DH-F1` | S4.6 implementiert den strengen Wiener Delivery-Cutoff; S5.3 prüft `-91`, `-90`, heute und Zukunft. |
| `DH-F2` | S4.6 löscht ausschließlich alte deaktivierte Subscriptions; S5.3 schützt aktive, transient fehlerhafte und reaktivierte Endpunkte. |
| `DH-F3` | S4.1 stoppt Profil-Reads/-Writes, S4.3 schützt Downstream-Kontext, S4.4 bereinigt Fresh-Setup-SQL. |
| `DH-F4` | S4.2 stellt nur den Range-Arztbericht auf strukturierte aktuelle Medication-Daten um. |
| `DH-F5` | Bleibt auf Roadmap-Ebene `fixed`; produktive Spalte bleibt bestehen, Drop-Gate wird in S6.3 dokumentiert. |
| `DH-F6` | S4.5 erlaubt `now` nur bei explizitem Dry-Run; S5.5 und S5.11 beweisen fehlende Nebenwirkung. |
| `DH-F7` | S4.1 implementiert Lade-, Leer-, Daten- und Fehlerzustand ohne editierbaren Legacy-Fallback. |
| `DH-F8` | S4.6 implementiert internen Funktions-/Jobvertrag; S5.4 und S5.13 beweisen Owner, ACL und genau einen Job. |
| `DH-F9` | Bleibt bis S6 offen; Module Overviews werden erst nach Runtime-Nachweis final synchronisiert. |
| `DH-F10` | Bleibt Watchlist; keine Health-Events-Retention in dieser Roadmap. |
| `DH-F11` | S4.1 erhält oder lädt die Projektion vor `profile:changed` neu; S5.7 prüft den direkten Post-Save-Zustand. |
| `DH-F12` | S4.2 begrenzt jeden privilegierten Medication-/Slot-Read explizit auf `userId`; S5.6 prüft Cross-User-Negativfälle. |

<!-- markdownlint-enable MD013 -->

- Scope und Not in Scope stimmen nach diesem Mapping weiterhin mit dem Ziel
  überein. Es wurde kein neuer Runtime-Consumer und kein zusätzlicher
  produktiver Write-Pfad in S2 entdeckt.

#### S2.12 - Contract Review und Findings-Korrektur

- Review-Gegenstände:
  - S1-Systemkarten und produktive Baseline.
  - Incident-Push-Input-, Dedupe- und Diagnosepfade.
  - Medication-RPC, Profil-State, Hub-Kontext und Service-Role-Arztbericht.
  - kanonische Push-/Medication-SQLs, vorhandene Indizes, RLS und Grants.
  - aktuelle Supabase-Cron- und Service-Role-Dokumentation.
- Gefundene Vertragslücken:
  - „90 Tage“ war ohne exaktes Vergleichsprädikat und Grenztag mehrdeutig.
  - „aktuelle Slots“ besaß für den historischen Range-Bericht noch keinen
    eindeutigen Bezugszeitpunkt.
  - Der Arztbericht-Query-Fehler war nicht zwischen Fallback, Teilergebnis und
    Fail-Closed entschieden.
  - Erfolgreiche Leere und Nichtverfügbarkeit waren für den Hub noch nicht als
    unterschiedliche Payload-Formen festgelegt.
  - Ladezustand und Read-only-Verhalten vor Abschluss des Medication-Reads
    fehlten im Profilvertrag.
  - Funktionsname, exakter Cron-Command und die Grenze für eigene
    `cron.job_run_details` waren noch nicht vollständig festgelegt.
  - S4.2 grenzte den Range-Arztbericht noch nicht ausdrücklich vom automatischen
    Monatsbericht ab.
  - Die ursprüngliche Ergebnisüberschrift von S2.13 wiederholte die
    Schrittüberschrift wortgleich und löste `MD024` aus.
- Korrekturen:
  - S2.1 bis S2.10 enthalten nun exakte Prädikate, Zustände und Fail-Closed-
    Regeln.
  - Entscheidungslog, Owner-Verständnis und Architektur-Constraints wurden auf
    denselben Vertrag gebracht.
  - S4.1 bis S4.6 und S5-Fixtures wurden auf die gefundenen Präzisierungen
    korrigiert.
  - Die Ergebnisüberschrift von S2.13 wurde eindeutig benannt.
  - Es entstand kein neues Runtime-Finding; alle bekannten Findings bleiben
    vollständig zugeordnet.

#### S2.13 - Abnahmeergebnis und Doku-Sync

- Abnahme:
  - S2.1 bis S2.13 sind deterministisch abgeschlossen.
  - Delivery- und Subscription-Cutoffs sind ohne Off-by-one-Spielraum
    festgelegt.
  - Scheduler-Identität, Zeitoverride, Source of Truth, Bericht, Hub,
    Leer-/Fehlerzustände und Legacy-Rollout sind eindeutig.
  - Jede produktive Wirkung bleibt hinter dem bestehenden S5-Owner-Gate.
  - Es erfolgte kein Runtime-Code-Change, kein SQL-Change, kein Deploy und kein
    produktiver Write.
- Checks:
  - `markdownlint-cli2` für diese Roadmap: `0` Fehler.
  - `git diff --check`: bestanden.
- Restrisiko für S3:
  - Löschprädikate, Job-Identität und Query-Reihenfolge müssen noch gegen echte
    PostgreSQL-/Cron-Concurrency red-team-geprüft werden.
  - PWA-Cache-Kompatibilität wird erst durch lokale und reale Rollout-Smokes
    vollständig bewiesen.
  - Der Arztbericht braucht noch finale österreichische Copy- und
    Cross-User-Negativtests.
- Doku-Sync-Entscheidung:
  - In S2 wird ausschließlich diese Roadmap auf den Zielvertrag aktualisiert.
  - Module Overviews und QA bleiben bis zum umgesetzten und geprüften
    Runtime-Vertrag in S6 unverändert.
- Nächster erlaubter Schritt:
  - S3 vollständig und deterministisch abarbeiten.

## S3 - Bruchrisiko-, Security- und Umsetzungsreview

Empfohlenes Modell / Reasoning: `GPT-5.6 Sol / Extra High`.

Ziel:

- Alle relevanten Bruch-, Lösch-, Cache-, Auth- und Runtime-Risiken vor der
  Umsetzung schließen.

### S3.1 - Lösch- und Cutoff-Risiken prüfen

- Off-by-one, Zeitzone, Zukunftsdaten und Nullwerte prüfen.
- aktive Subscriptions als harte Negativbedingung testen.
- Foreign Keys und Kaskaden prüfen.

### S3.2 - Push-Dedupe- und historische Zeitrisiken prüfen

- alte Non-Dry-Runs, Catch-up und manuelle Workflow-Runs prüfen.
- sicherstellen, dass trockene Simulation weiterhin möglich bleibt.
- echte Push-Zustellung in automatischen Tests ausschließen.

### S3.3 - Medication- und Report-Bruchrisiken prüfen

- inaktive Medikamente, mehrere Slots, temporäre Therapien, leere Liste und
  Query-Fehler prüfen.
- bestehende Arztbericht-Copy und Reihenfolge prüfen.
- keine Bestands- oder Low-Stock-Daten als Medikation ausgeben.

### S3.4 - PWA-/Cache-/Rollout-Risiken prüfen

- Altclient-Verhalten bei vorhandener und entfernter Spalte vergleichen.
- bestätigen, dass Deprecation ohne Drop rückwärtskompatibel ist.
- späteres Drop-Gate als Watchlist konkretisieren.

### S3.5 - Cron-, Rechte- und Concurrency-Risiken prüfen

- Security Invoker, Search Path, Execute-Rechte und Cron-Owner prüfen.
- doppelte Jobs, parallele Läufe und idempotente Deletes prüfen.
- Cleanup eigener Cron-Run-Details festlegen.

### S3.6 - User-Facing Copy Review

- „keine Medikamente“ und „Medikation nicht verfügbar“ klar trennen.
- Arztbericht bleibt in österreichischem Deutsch und ohne technische Details.
- keine neue sichtbare Push-Hygiene- oder Wartungswarnung ohne Bedarf.

### S3.7 - Tooling-, Test- und Rollbackplan festlegen

- lokale/disposable Fixtures definieren.
- produktive read-only Preflight-Abfragen definieren.
- Owner Briefings und Runtime-Smokes konkretisieren.

### S3.8 - S4-Substeps und Abhängigkeiten konkretisieren

- Profilprojektion vor Consumer-Abschaltung.
- Arztbericht vor Legacy-Deprecation.
- Zeitguard vor Delivery-Retention.
- lokale Tests vor Deploy und produktivem SQL.

### S3.9 - Contract Review S3 und Findings-Korrektur

- Red-Team-Review gegen Datenverlust, falsche Sicherheit, alte Pushes und
  gecachte Clients.
- S4-Scope, S5-Checks und Reasoning-Empfehlungen korrigieren.

### S3.10 - Schritt-Abnahme und Doku-Sync-Entscheidung

Exit-Kriterien:

- Kein offenes P0-Finding ohne klaren Guard.
- S4 besitzt kleine, sequenzielle und reviewbare Substeps.
- Produktive Tests können keine unbeabsichtigte Benachrichtigung senden.

### Ergebnisprotokoll S3

#### S3.1 - Lösch- und Cutoff-Risiken

- Der Delivery-Cutoff wird pro Funktionslauf einmal aus
  `statement_timestamp()` und `Europe/Vienna` berechnet. Das verbindliche
  Prädikat bleibt `day < Wiener Heute - 90 Tage`:
  - Tag `-91` und älter: löschbar.
  - Tag `-90`: behalten.
  - heute und Zukunft: behalten.
- `push_notification_deliveries.day`, `push_subscriptions.disabled` und
  `push_subscriptions.updated_at` sind im kanonischen Schema `NOT NULL`.
  Nullwerte können die Löschprädikate deshalb nicht still umgehen.
- Der Subscription-Cutoff wird ebenfalls einmal pro Lauf als absoluter
  Zeitstempel berechnet. Gelöscht wird nur bei gleichzeitigem
  `disabled = true` und `updated_at < Ausführungszeitpunkt - 90 Tage`.
- Der vorhandene `updated_at`-Trigger aktualisiert den Anker bei jeder Änderung.
  Eine Reaktivierung setzt `disabled = false` und fällt unabhängig vom Alter
  aus dem Löschset.
- Concurrency-Verhalten der Reaktivierung:
  - gewinnt die Reaktivierung vor dem Delete, muss PostgreSQL das
    Löschprädikat auf dem aktuellen Row-State erneut prüfen und die aktive
    Zeile behalten.
  - gewinnt das Delete zuerst, legt ein späteres Subscription-Upsert über den
    eindeutigen `(user_id, endpoint)`-Vertrag wieder eine aktive Zeile an.
  - S5 prüft beide Zustandsfolgen mit Wegwerfdaten; aktive Zeilen bleiben eine
    harte Negativbedingung.
- Beide Push-Tabellen referenzieren ausschließlich `auth.users(id) on delete
  cascade`. Zwischen Deliveries und Subscriptions existiert kein Foreign Key.
  Der Hygiene-Cleanup kann daher weder die User-Zeile noch die jeweils andere
  Push-Tabelle über eine Kaskade löschen.
- Zukunfts-Deliveries werden nicht automatisch „korrigiert“ oder gelöscht.
  Sie werden im Preflight gezählt und als Anomalie sichtbar gemacht, bleiben
  aber wegen des strengen historischen Cutoffs erhalten.

#### S3.2 - Push-Dedupe und historische Zeit

- Der produktive GitHub-Workflow sendet kein `now`. Auch verzögerte oder
  manuelle Workflow-Läufe werden daher mit dem tatsächlichen
  Edge-Ausführungszeitpunkt bewertet und spielen keine historische Uhrzeit
  nach.
- Der neue Guard prüft die bloße Anwesenheit der `now`-Eigenschaft. Jeder
  explizite Override bei `dry_run != true` wird unabhängig davon abgewiesen,
  ob sein Wert zufällig nahe an der aktuellen Zeit liegt.
- Der Guard liegt nach Authentifizierung und Input-Normalisierung, aber vor
  User-Auflösung, fachlichen Reads, Web-Push-Sends und allen Delivery- oder
  Subscription-Writes.
- Erlaubte Testpfade:
  - aktueller Dry-Run ohne Override.
  - historischer Dry-Run mit Override.
  - automatischer Non-Dry-Negativtest mit Override, weil der Guard vor jeder
    Nebenwirkung abbrechen muss.
- Nicht erlaubter automatischer Testpfad:
  - ein erfolgreicher Remote-Non-Dry-Run, der eine reale Benachrichtigung
    auslösen könnte. Dieser bleibt ein ausdrückliches Owner-Gate.
- Der bestehende Dedupe-Vertrag ist best-effort: Ein Event wird erst nach
  mindestens einer erfolgreichen Zustellung in
  `push_notification_deliveries` upserted. Zwei parallele Edge-Aufrufe können
  deshalb beide vor dem Write denselben fehlenden Delivery-Key sehen.
  `DH-F14` dokumentiert dieses bestehende Duplikatfenster als separates
  Reliability-Thema; diese Roadmap behauptet keine exakt-einmalige Zustellung.

#### S3.3 - Medication und Range-Arztbericht

- Der Range-Arztbericht ermittelt den Wiener Ausführungstag einmal und verwendet
  denselben ISO-Tag für alle Medication-/Slot-Abfragen. Weder UTC-Mitternacht
  noch `range.to` dürfen den aktuellen Medikamentenplan verschieben.
- Medication-Stammdaten werden explizit nach `user_id` und `active = true`
  gefiltert. Aktuelle Slots werden ebenfalls nach `user_id`, `active = true`,
  `start_date <= Berichtstag` sowie leerem oder nicht überschrittenem
  `end_date` gefiltert.
- Bei null aktiven Medikamenten wird kein unnötiger `.in(..., [])`-Slot-Read
  erzeugt; der erfolgreiche Leerzustand wird direkt formatiert.
- Ein aktives Medikament ohne aktuellen Slot bleibt sichtbar und erhält
  `Einnahmeplan nicht hinterlegt`.
- Mehrere Slots und Mengen größer eins werden pro Medikament zusammengeführt.
  Medikamente und Slots erhalten stabile fachliche Sortierung plus ID als
  letzten Tie-Breaker.
- Temporär beendete, zukünftige und inaktive Slots oder Medikamente erscheinen
  nicht als aktueller Plan.
- Der Bericht verwendet nur Name, Wirkstärke, `with_meal` und aktuellen
  Einnahmeplan. Bestand, Low-Stock, interne IDs und technische Felder bleiben
  ausgeschlossen.
- Medication- und Slot-Reads werden Teil desselben vorbereitenden
  `Promise.all`-Gates wie die übrigen Berichtsreads. Jeder Query-Fehler bricht
  vor Narrative und `health_events`-Insert ab; es gibt weder Legacy-Fallback
  noch Teilbericht.
- Der automatische Monatsbericht bleibt unverändert und erhält keine aktuelle
  Medication-Stammdatenprojektion.

#### S3.4 - PWA, Cache und Legacy-Rollout

- Die registrierte Datei ist `/service-worker.js`; das Artefakt
  `public/sw/service-worker.js` erklärt selbst, dass es nicht aktiv ist.
- Der aktive Worker liefert statische JavaScript-Dateien cache-first und
  aktualisiert den Runtime-Cache im Hintergrund. Ohne Worker-Änderung kann der
  erste Start nach einem Frontend-Deploy deshalb noch alten Profil-/Hub-Code
  verwenden.
- `DH-F13` korrigiert den Rollout-Vertrag:
  - S4.3 erhöht nach Abschluss der Profil-/Hub-Änderungen die Cache-Version im
    aktiven Root-Service-Worker.
  - S5.7 prüft Installation, Update-Banner, `SKIP_WAITING`, Controller-Wechsel
    und anschließenden Reload mit neuem Code.
  - das inaktive `public/sw/service-worker.js` wird nicht als vermeintlicher
    Fix mitgeändert.
- Ein Altclient darf während des Rollouts weiterhin die vorhandene produktive
  Legacy-Spalte lesen oder schreiben. Neue Consumer ignorieren den Inhalt.
  Damit ist Deprecation ohne Drop rückwärtskompatibel.
- Das spätere Drop-Gate bleibt getrennt und verlangt weiterhin Consumer-Scan,
  Remote-Edge-Stand, praktisch bestätigten Client-Rollout und neue
  User-Freigabe. Die Spalte darf bei fehlendem Nutzen auch dauerhaft bestehen.

#### S3.5 - Cron, Rechte und Concurrency

- Die Cleanup-Funktion bleibt `SECURITY INVOKER`, besitzt den festen
  `search_path = pg_catalog` und verwendet vollständig qualifizierte Objekte.
- `EXECUTE` wird `PUBLIC`, `anon`, `authenticated` und `service_role` entzogen.
  Der Job läuft unter dem erwarteten `postgres`-DB-Kontext; es entsteht keine
  Data-API-Funktion.
- Vor der ersten Löschung muss die Funktion genau einen aktiven Job mit diesem
  vollständigen Vertrag finden:
  - Name `midas-push-hygiene-weekly`.
  - Owner `postgres`.
  - aktuelle Datenbank.
  - Schedule `45 3 * * 0`.
  - Command `select public.push_data_hygiene_cleanup_internal();`.
- Fehlender Job, Duplikat, falscher Owner, falsche Datenbank, falsches Schedule,
  falscher Command oder inaktiver Job führen vor jeder Löschung zu einem
  transaktionalen Fehler.
- `pg_cron` serialisiert denselben konkreten Job, schützt aber nicht vor einem
  gleichzeitigen manuellen Funktionsaufruf. Die Funktion erhält deshalb einen
  dokumentierten festen transaktionalen Advisory Lock. Kann sie ihn nicht
  sofort erwerben, bricht sie ohne Delete ab.
- Alle Deletes laufen in derselben Transaktion. Ein Fehler rollt Delivery-,
  Subscription- und Cron-Run-Detail-Deletes gemeinsam zurück.
- Gelöscht werden nur abgeschlossene eigene `cron.job_run_details` mit
  `end_time < statement_timestamp() - interval '90 days'`. Laufende, exakt 90
  Tage alte und fremde Jobläufe bleiben bestehen.
- Die Medication-Retention und ihr Job werden nicht geändert oder als
  Implementierungsvorlage ungeprüft kopiert. Push erhält einen eigenständigen,
  strengeren Betriebsvertrag.

#### S3.6 - User-Facing Copy

- Profilzustände:
  - Laden: `Medikation wird geladen ...` oder gleichwertig neutral.
  - erfolgreiche Leere: `Keine aktiven Medikamente`.
  - erfolgreiche Daten: formatierte read-only Zeilen.
  - Read-Fehler: `Medikation derzeit nicht verfügbar`.
- Der Range-Arztbericht verwendet:
  - `Derzeitige Medikation: keine aktiven Medikamente hinterlegt.` bei
    erfolgreicher Leere.
  - `Einnahmeplan nicht hinterlegt` für ein aktives Medikament ohne aktuellen
    Slot.
  - `Morgens`, `Mittags`, `Abends` und `Nachts` als österreichisch lesbare
    Tagesabschnitte.
  - Mengen ohne erfundene Arzneiform, weil das Datenmodell nicht zuverlässig
    zwischen Tabletten, Kapseln oder anderen Formen unterscheidet.
- Query-Fehler erzeugen keine scheinbar beruhigende sichtbare Leere, sondern
  einen klaren technischen Fehler des Report-Aufrufs.
- Cron, Retention, Subscription, IDs, Cleanup-Zähler oder Wartungsstatus werden
  weder im Arztbericht noch im normalen Profiltext sichtbar.

#### S3.7 - Tooling, Tests und Rollback

- Disposable PostgreSQL-/Supabase-Nachweise:
  - Fresh-Setup und zweiter SQL-Lauf.
  - Delivery-Grenztage `-91`, `-90`, heute und Zukunft.
  - alte/junge deaktivierte, aktive und reaktivierte Subscriptions.
  - vollständiger Jobvertrag, Duplikat und falscher Owner.
  - blockierter Advisory Lock durch zwei getrennte DB-Sessions.
  - ACL-Negativtests für alle App-Rollen.
  - ausschließlich eigene abgeschlossene alte Cron-Run-Details.
- Code-/Edge-Nachweise:
  - Node- und Deno-Checks.
  - historischer Dry-Run bleibt erlaubt.
  - historischer Non-Dry-Run wird vor fachlichen Reads und Nebenwirkungen
    abgewiesen.
  - Range-Report-Fixtures für null/ein/mehrere Medikamente, Slot-Zeiträume,
    Mengen, Cross-User und Query-Fehler.
- Produktiver read-only Preflight:
  - Projekt, Rollen, PostgreSQL-Version, Tabellen und Indizes.
  - vollständige Cron-Baseline.
  - exakte Löschkandidaten und separat erhaltene aktive Subscriptions.
  - Advisor-Baseline.
- Rückfall und Irreversibilität:
  - Code und Edge Functions können auf den vorherigen Stand redeployt werden.
  - der neue Cron kann deaktiviert oder entfernt werden.
  - DDL ist idempotent und transaktional provisioniert.
  - bereits gelöschte technische Zeilen entstehen durch Rollback nicht wieder;
    Wiederherstellung wäre nur aus einem zuvor bewusst erzeugten Export oder
    Backup möglich. Deshalb sind Preflight-Zahlen und separates Cleanup-Gate
    verpflichtend.

#### S3.8 - S4-Abhängigkeiten und Rollout-Reihenfolge

- Die S4-Reihenfolge bleibt fachlich korrekt:
  1. Profilprojektion und Save-State.
  2. Range-Arztbericht.
  3. Hub-/Assistant-Kontext plus aktiver Service-Worker-Cachewechsel.
  4. Fresh-Setup-Profil-SQL ohne Legacy-Spalte.
  5. Incident-Push-Zeitguard.
  6. Push-Hygiene-SQL und Cron.
  7. QA-/Doku-Vorbereitung.
  8. Gesamt-Review.
- S4.3 wird um `service-worker.js` erweitert. S4.6 erhält die vollständige
  Pre-Delete-Jobprüfung und den Advisory Lock.
- Produktive Reihenfolge in S5:
  1. statische und disposable Checks.
  2. CodeRabbit optional und Findings-Korrektur.
  3. produktiver read-only Preflight.
  4. `midas-incident-push` deployen und Zeitguard remote beweisen.
  5. `midas-monthly-report` deployen und nur nach Freigabe schreiben lassen.
  6. Push-Hygiene-SQL provisionieren.
  7. ersten Cleanup nach neuem Briefing separat manuell ausführen.
- Kein produktives Push-Hygiene-SQL darf vor dem bewiesenen Incident-Zeitguard
  Löschwirkung erhalten.

#### S3.9 - Contract Review und Findings-Korrektur

- Review-Gegenstände:
  - kanonische Push- und Medication-Schemas.
  - Incident-Push Send-/Dedupe-Reihenfolge und GitHub-Workflow-Payload.
  - Range-Arztbericht, Profil-State und Hub-Kontext.
  - aktiver PWA-Service-Worker und Update-Controller.
  - Supabase-Cron-, Rollen- und PostgreSQL-Advisory-Lock-Vertrag.
- Gefundene Vertragslücken:
  - Der Cleanup prüfte seine vollständige Jobidentität noch nicht zwingend vor
    der ersten Löschung.
  - `pg_cron`-Serialisierung deckt einen parallelen manuellen Aufruf nicht ab.
  - Der aktive cache-first Root-Service-Worker fehlte im Dateiscope und im
    Rollout-Test.
  - Der Berichtstag war fachlich Wiener Zeit, aber die einmalige Berechnung und
    Wiederverwendung war noch nicht ausdrücklich verlangt.
  - Leere Medication-IDs konnten zu einem unnötigen oder fehlerhaften Slot-Read
    führen.
  - Bereits ausgeführte Deletes waren im Rückfalltext zu stark als
    „rückrollbar“ formuliert.
  - Die bestehende Send-vor-Dedupe-Lücke war nicht als Reliability-Grenze der
    Roadmap sichtbar.
  - Deploy-Metadaten und Tool-Permissions führten den durch `DH-F13` neu
    verpflichtenden PWA-/Service-Worker-Rollout noch nicht vollständig.
  - Die österreichischen Tagesabschnitte waren als Copy definiert, aber noch
    nicht ausdrücklich an das kanonische `slot_type` statt ein freies
    Slot-Label gebunden.
  - Der Jobowner war festgelegt; der Function-Owner fehlte noch als explizite
    Postcondition.
- Korrekturen:
  - S4.6 und S5.4 enthalten nun Job-Precheck, Advisory Lock und
    Concurrency-Nachweis.
  - `service-worker.js` wurde in Dateiscope, S4.3 und S5.7 aufgenommen;
    `DH-F13` wurde ergänzt.
  - S4.2 und S5.6 verlangen einen einmaligen Wiener Berichtstag, leere-ID-
    Behandlung und stabile Sortierung.
  - Owner-Verständnis und S5-Briefing benennen die Irreversibilität bereits
    gelöschter technischer Zeilen.
  - `DH-F14` grenzt exakt-einmalige Push-Zustellung bewusst als separate
    Reliability-Arbeit ab.
  - Metadaten, Tool-Permissions, S4.1-S4.3, S4.6 und S5.4 wurden auf PWA-Scope,
    kanonische Slot-Copy und beide Owner-Postconditions korrigiert.

#### S3.10 - Abnahme und Doku-Sync

- S3.1 bis S3.10 sind deterministisch abgeschlossen.
- Kein P0-Finding ist ohne Guard. Alle offenen P0-/P1-Findings besitzen einen
  konkreten S4- und S5-Nachweis.
- Produktive Tests senden ohne ausdrückliches Owner-Gate keine
  Benachrichtigung.
- S4 bleibt in kleinen reviewbaren Substeps; der nachfolgende Readiness Review
  bestätigt deren endgültige Startfähigkeit.
- In S3 wurde ausschließlich diese Roadmap geändert. Runtime-Code, SQL, Module
  Overviews und QA bleiben bis zu ihren vorgesehenen Schritten unverändert.
- Nächster erlaubter Schritt:
  - S4 Readiness Review vollständig und deterministisch abarbeiten.

## S4 Readiness Review - Gate nach S3, vor S4

Empfohlenes Modell / Reasoning: `GPT-5.6 Sol / Extra High`.

Deterministisch prüfen:

- Sind alle Consumer von `user_profile.medications` klassifiziert?
- Muss eine Edge Function oder ein Frontend-Pfad zusätzlich geändert werden?
- Ist die Arztbericht-Datenform vollständig definiert?
- Ist der Profil-Leer-/Fehlerzustand umsetzbar, ohne Legacy-Fallback?
- Blockiert der Incident-Push-Guard jeden realen historischen Sendepfad?
- Sind 90-Tage-Cutoffs und Indizes mit den echten Spaltentypen kompatibel?
- Bleibt der Push-Cron vollständig getrennt von Medication-Retention?
- Ist die physische Legacy-Spaltenentfernung weiterhin außerhalb des Scopes?
- Decken S5-Fixtures alle neuen Code-, SQL- und Runtime-Verträge ab?
- Sind Deploy- und Write-Gates für den Owner verständlich?
- Ist der aktive Root-Service-Worker eindeutig identifiziert und sein
  Cache-Versionswechsel erst nach allen Frontend-Änderungen eingeplant?
- Prüft der Cleanup Jobidentität und Advisory Lock vor jedem Delete?
- Ist `DH-F14` klar als separate Reliability-Watchlist und nicht als
  erfülltes Exactly-once-Versprechen dokumentiert?

Ergebnis dokumentieren:

- S4-Substeps bestätigen, umsortieren, teilen oder ergänzen.
- Betroffene Dateien und Tool Permissions korrigieren.
- Findings ohne S4-Zuordnung schließen.
- Reasoning-Stufe je Substep final bestätigen.
- Owner-Verständnis gegen den ermittelten Zielvertrag aktualisieren.

Exit-Kriterium:

- S4 kann ohne offene Reihenfolge-, Scope-, Consumer- oder Testfrage starten.

### Readiness-Ergebnis 2026-07-16

#### Consumer- und Dateiscope

- Aktive direkte Consumer der Legacy-Spalte:
  - `app/modules/profile/index.js` liest, schreibt, formatiert und persistiert
    `user_profile.medications`. Vollständig S4.1 zugeordnet.
  - `backend/supabase/functions/midas-monthly-report/index.ts` liest die Spalte
    ausschließlich für den Range-Arztbericht. Vollständig S4.2 zugeordnet.
  - `sql/10_User_Profile_Ext.sql` provisioniert die Spalte für Fresh-Setups.
    Vollständig S4.4 zugeordnet.
- Indirekte Consumer:
  - `app/modules/hub/index.js` erhält die Profilprojektion und normalisiert eine
    fehlende Medication-Eigenschaft derzeit zu `[]`. Änderung in S4.3 nötig.
  - `midas-assistant` und `midas-vision` akzeptieren bereits eine optionale
    `medications`-Eigenschaft und lesen keine Profilspalte aus Supabase. Keine
    Edge-Änderung nötig, sofern der Hub-Vertrag in S4.3 eingehalten wird.
- Geprüfte Nicht-Consumer:
  - Doctor-Charts liest aus `user_profile` nur `height_cm`.
  - Protein-Targets liest und schreibt ausschließlich Protein-/CKD-Felder.
  - Intake, Incidents und das Android Widget verwenden das strukturierte
    Medication-Modell beziehungsweise dessen Snapshot.
- Zusätzlicher Rollout-Pfad:
  - Der registrierte Root-`service-worker.js` ist wegen cache-first JavaScript-
    Auslieferung S4.3 zugeordnet.
  - `public/sw/service-worker.js` ist kein aktiver Runtime-Pfad und bleibt
    außerhalb der Umsetzung.
- Ergebnis:
  - Der Dateiscope in den Roadmap-Metadaten ist vollständig. Keine zusätzliche
    Edge Function und kein weiteres Frontend-Modul muss geändert werden.

#### Profil-State und Kontextvertrag

- Der vorhandene Zustand `medicationSummary: null` ist vor S4 nicht ausreichend,
  weil er erfolgreiche Leere, Ladezustand und Fehler vermischt.
- S4.1 verwendet deshalb einen expliziten vierwertigen Medication-Status und
  ein diskriminiertes Loader-Ergebnis.
- Das Medication-Feld bleibt in allen vier Zuständen read-only:
  - `loading`: neutrale Ladeanzeige, Kontext-Eigenschaft ausgelassen.
  - `empty`: `Keine aktiven Medikamente`, Kontextwert `[]`.
  - `ready`: formatierte Zeilen, Kontextwert mit diesen Zeilen.
  - `error`: `Medikation derzeit nicht verfügbar`, Kontext-Eigenschaft
    ausgelassen.
- `fillForm()`, `extractFormPayload()`, Profil-Upsert und Post-Upsert-Select
  werden so getrennt, dass kein Legacy-Wert das Feld erneut editierbar macht
  oder in die Datenbank schreibt.
- `getData()` und `profile:changed` liefern denselben Statusvertrag. Ein vorher
  erfolgreicher Medication-Wert darf bei einem späteren Ladefehler nicht als
  scheinbar aktueller Kontext weitergereicht werden.
- Nach Profil-Save wird die vorhandene strukturierte Projektion wieder
  angehängt oder kontrolliert neu geladen, bevor `profile:changed` emittiert
  wird.
- Ergebnis:
  - `DH-F3`, `DH-F7` und `DH-F11` sind in S4.1 ohne Legacy-Fallback umsetzbar.

#### Range-Arztbericht-Datenform

- Profilstammdaten und aktuelle Medication werden getrennt geladen.
- Verbindliche Medication-Felder:
  - `health_medications`: `id`, `name`, `strength`, `with_meal`.
  - `health_medication_schedule_slots`: `id`, `med_id`, `slot_type`, `label`,
    `sort_order`, `qty_per_slot`.
- Filter:
  - beide Abfragen explizit auf `userId`.
  - Medikamente nur `active = true`.
  - Slots nur aktiv und am einmalig ermittelten Wiener Ausführungstag gültig.
- Nicht selektierte Felder:
  - Bestand, Low-Stock, interne ACK-Daten, Leaflet-URL und operative
    Medication-Metadaten.
- Der Monatsbericht bleibt unverändert. Beim Range-Bericht werden Medication-
  und Slot-Query in das bestehende Pre-Narrative-Gate aufgenommen; ein Fehler
  erreicht keinen `health_events`-Write.
- Kanonisches `slot_type` steuert Reihenfolge und österreichische Copy. Freies
  `label` ist nur kontrollierter Fallback.
- Ergebnis:
  - Die Datenform ist vollständig definiert; `DH-F4` und `DH-F12` besitzen
    eindeutige Implementierungs- und Negativtests.

#### Incident-Zeitguard

- `normalizeInput()` muss zusätzlich zum geparsten Datum festhalten, ob der
  Request die Eigenschaft `now` überhaupt enthielt.
- Guard-Bedingung:
  - `nowOverrideProvided && !dryRun` führt zu einem klaren 400-Fehler.
  - die Prüfung erfolgt nach Auth/Input-Validierung und vor User-Auflösung,
    fachlichen Reads, Push-Sends oder Writes.
- GitHub Scheduler und reguläre manuelle Workflows senden kein `now` und bleiben
  kompatibel.
- Historische Dry-Runs bleiben möglich; historische Non-Dry-Negativtests sind
  sicher, weil sie vor Nebenwirkungen abbrechen.
- Ergebnis:
  - `DH-F6` besitzt einen eindeutigen Codepfad und einen produktiv sicheren
    Remote-Negativtest.

#### Retention-, Cron- und Security-Readiness

- Echte Spaltentypen und bestehende Indizes sind kompatibel:
  - Delivery-Cutoff arbeitet auf `date` und verwendet den vorhandenen mit
    `day` beginnenden Index.
  - Subscription-Cutoff arbeitet auf `timestamptz` und erhält den geplanten
    partiellen Index für `disabled = true`.
- Push und Medication bleiben getrennt:
  - eigene SQL-Datei, Funktion, Lock, Jobname, Schedule und Run-Detail-Cleanup.
  - keine Änderung an `med_retention_cleanup_internal()` oder dessen Job.
- Festes Concurrency-Primitiv:
  - `pg_catalog.pg_try_advisory_xact_lock(1296647233, 1347769160)`.
  - beide Schlüssel bilden gemeinsam den dauerhaften MIDAS-Push-Lock und werden
    in SQL-Kommentar, Funktion und S5-Test identisch verwendet.
- Vor jedem Delete müssen Lock und vollständige Jobidentität grün sein.
- Function-Owner und Job-Owner sind `postgres`; App-Rollen erhalten kein
  `EXECUTE`.
- Ergebnis:
  - `DH-F1`, `DH-F2` und `DH-F8` sind implementier- und testbar, ohne RLS,
    Medication-Retention oder eine App-API zu verändern.

#### Cache-, Deploy- und Rückfallreadiness

- S4.3 erhöht die Cache-Version erst, nachdem Profil- und Hub-Code final sind.
- S5 prüft den Worker-Wechsel lokal über HTTP. Der reale GitHub-Pages-Rollout
  erfolgt erst durch den finalen Commit/Push nach S6.
- Diese zeitliche Trennung ist für den aktuellen Change sicher:
  - Die produktive Legacy-Spalte bleibt physisch bestehen.
  - alte Clients können weiter lesen oder schreiben.
  - neue Consumer ignorieren den Legacy-Inhalt nach ihrem Rollout.
- Ein realer Client-Rollout ist weiterhin Pflicht für einen späteren
  Spalten-Drop, aber kein Blocker für den DONE-Status dieser Deprecation-ohne-
  Drop-Roadmap.
- Edge-/Write-Reihenfolge:
  1. Incident-Push deployen und Zeitguard beweisen.
  2. Monthly-Report deployen und nach Owner-Freigabe prüfen.
  3. Push-Hygiene-SQL provisionieren.
  4. ersten Cleanup nach neuem Owner Briefing separat ausführen.
- Bereits gelöschte technische Zeilen sind nur aus einem vorherigen Export oder
  Backup wiederherstellbar. Job-Deaktivierung stoppt künftige Löschungen, macht
  vergangene Deletes aber nicht rückgängig.

#### Substep- und Reasoning-Entscheidung

- S4.1 bleibt ein einzelner Substep, wird wegen der vier Zustände und des
  Post-Save-Kontexts aber von `High` auf `Extra High` angehoben.
- S4.2 bleibt `Extra High`: Service Role, medizinisch sichtbarer Bericht und
  Fail-Closed-Write-Gate.
- S4.3 bleibt `High`: Hub-Vertrag und zugehöriger PWA-Cachewechsel sind derselbe
  Frontend-Rollout.
- S4.4 bleibt `High`: Fresh-Setup-SQL ohne produktiven Drop.
- S4.5 und S4.6 bleiben `Extra High`: Push-Nebenwirkungen, Security, Löschung,
  Cron und Concurrency.
- S4.7 bleibt `Medium`: ausschließlich unchecked QA/HOW-TO-Vorbereitung; Module
  Overviews bleiben bis S6 unverändert.
- S4.8 bleibt `Extra High`: Gesamt-Red-Team-Review.
- Die acht Substeps bleiben klein genug und müssen nicht geteilt oder
  umsortiert werden.

#### Readiness Contract Review und Korrekturen

- Gefundene Lücken:
  - Der Profilvertrag verlangte vier Zustände, definierte aber noch keine
    interne diskriminierte Repräsentation.
  - Der Arztbericht nannte fachliche Felder, aber noch keine minimale konkrete
    Select-Projektion.
  - Der Incident-Guard verlangte Property-Presence, ohne das dafür nötige
    Normalisierungsflag ausdrücklich festzulegen.
  - Der Advisory Lock war als „fest“ beschrieben, aber ohne konkretes
    Schlüsselpaar.
  - S4.7 hätte Module Overviews vor Runtime-Nachweis als Pending ändern können
    und damit die Source of Truth unnötig verwässert.
  - Der lokale Service-Worker-Smoke und der erst nach S6 mögliche produktive
    GitHub-Pages-Rollout waren noch nicht sauber getrennt.
- Korrekturen:
  - S4.1 enthält Statusmodell, Loader-Vertrag, `fillForm()`-, Payload-,
    `getData()`- und Cache-Verhalten.
  - S4.2 enthält minimale Medication-/Slot-Projektionen.
  - S4.5 enthält `nowOverrideProvided` oder ein gleichwertiges explizites Flag.
  - S4.6 und S5.4 verwenden das feste Lock-Paar
    `(1296647233, 1347769160)`.
  - S4.7 lässt Module Overviews bis S6 unverändert.
  - S5.7, S5.15 und S6.8 trennen lokalen Worker-Test, finalen Commit-Deploy und
    späteres Drop-Gate.
- Finding-Zuordnung:
  - Kein neues Finding nötig; die Lücken konkretisieren `DH-F6`, `DH-F7`,
    `DH-F8`, `DH-F11`, `DH-F12` und `DH-F13`.
  - `DH-F14` bleibt unverändert deferred und außerhalb des S4-Scopes.

#### Gate-Entscheidung

- Alle Consumer sind klassifiziert.
- Dateiscope, Datenformen, Zustände, Lock, Tests und Deploy-Reihenfolge sind
  eindeutig.
- Kein offenes P0-/P1-Finding besitzt eine ungeklärte Umsetzung oder Abnahme.
- Kein Runtime-Code, SQL, Deploy oder produktiver Write wurde im Readiness
  Review ausgeführt.
- Das S4 Readiness Gate ist **GO**.
- Nächster erlaubter Schritt:
  - S4.1 einzeln umsetzen, Code-/Contract-Review durchführen und Findings
    korrigieren.

## S4 - Umsetzung

### S4.1 - Profil auf eine abgeleitete Medication-Quelle umstellen

Empfohlenes Modell / Reasoning: `GPT-5.6 Sol / Extra High`.

- Ladezustand, erfolgreiche Leere, erfolgreiche Daten und Read-Fehler als vier
  getrennte Zustände umsetzen.
- Dafür einen expliziten internen Medication-Status wie
  `loading | empty | ready | error` verwenden; `null` darf nicht zugleich
  „leer“, „nicht geladen“ und „Fehler“ bedeuten.
- Der Medication-Loader liefert ein diskriminiertes Ergebnis. Eine erfolgreiche
  Antwort mit `rows: []` bleibt `empty`; fehlendes Modul, Auth- oder Query-Fehler
  werden `error` und nicht erfolgreiche Leere.
- Medication-Feld ab Beginn des Reads immer abgeleitet und read-only behandeln,
  auch bei null aktiven Medikamenten oder einem Read-Fehler.
- `fillForm()` darf das Medication-Feld nicht mehr implizit editierbar machen;
  die Anzeige wird ausschließlich aus dem Medication-Status gerendert.
- `user_profile.medications` nicht mehr auswählen oder schreiben.
- `extractFormPayload()`, Upsert-Payload und Post-Upsert-Select enthalten keine
  Medication-Eigenschaft mehr.
- Nach erfolgreichem Profil-Upsert die vorhandene Medication-Projektion wieder
  an `state.data` hängen oder einen kontrollierten Profil-/Medication-Resync
  ausführen, bevor `profile:changed` emittiert wird.
- In-Memory-Kontext für Hub/Assistant weiterhin aus dem Medication-Read-Model
  bereitstellen.
- Tagesabschnitte aus dem kanonischen `slot_type` in `Morgens`, `Mittags`,
  `Abends` und `Nachts` übersetzen; freie Slot-Labels nicht ungeprüft als
  User-Facing Standardcopy übernehmen.
- Bei erfolgreicher Leere `medications: []` bereitstellen; bei Lade- oder
  Fehlerzustand die Medication-Eigenschaft aus dem Kontext weglassen.
- `getData()` muss denselben Vertrag liefern und darf bei `loading` oder
  `error` keine zuvor gecachte Medication-Liste weiterreichen.
- Node-, Code- und Contract Review; Findings korrigieren.

#### S4.1 Umsetzungsnachweis 2026-07-16

Umgesetzt:

- `app/modules/profile/index.js` verwendet ein diskriminiertes
  Medication-Read-Model mit `loading`, `empty`, `ready` und `error`.
- Der Loader behandelt ein fehlendes Medication-Modul, fehlende Authentifizierung,
  ungültige Snapshots und Query-/RPC-Fehler als `error`.
- Erfolgreiche Leere liefert `medications: []`; Lade- und Fehlerzustände lassen
  die Eigenschaft in `getData()` und `profile:changed` aus.
- Das Profil selektiert und persistiert `user_profile.medications` nicht mehr.
- Ein erfolgreicher Profil-Save hängt die vorhandene strukturierte Projektion
  wieder an, bevor `profile:changed` emittiert wird.
- Tagesabschnitte werden ausschließlich aus `slot_type` als `Morgens`,
  `Mittags`, `Abends` oder `Nachts` formatiert. Freie Slot-Labels werden nicht
  als Standardcopy übernommen.
- `index.html` enthält wieder die vom Profilcode erwartete
  `#profileMedications`-Anzeige. Sie ist bereits im Markup und zusätzlich im
  Runtime-Code dauerhaft read-only.

Code- und Contract-Review:

- Finding: Die Roadmap, der Profilcode und das Profile Module Overview gingen
  von `#profileMedications` aus, im aktiven DOM fehlte das Element jedoch.
  Korrektur: read-only Anzeige ergänzt und `index.html` in den Dateiscope
  aufgenommen (`DH-F15`).
- Finding: Der Post-Save-Datensatz musste neben der Medication-Projektion auch
  die bereits geladene CKD-Stufe im In-Memory-Kontext erhalten.
  Korrektur: `ckd_stage` wird vor der Projektion wieder angehängt.
- Finding: Ein fehlendes Medication-Modul war als Fehler klassifiziert, aber
  diagnostisch nicht sichtbar.
  Korrektur: eindeutiger Profil-Diagnoseeintrag ergänzt.
- Ergebnis: `DH-F7`, `DH-F11` und `DH-F15` sind geschlossen. `DH-F3` bleibt bis
  zur Umstellung von Range-Bericht und Fresh-Setup-SQL offen.

Verifikation:

- `node --check app/modules/profile/index.js`: PASS.
- Isolierter Node-Zustandsharness:
  - `ready`, `empty` und `error`: PASS.
  - kein Durchreichen einer vorherigen Liste nach einem Read-Fehler: PASS.
  - kanonische österreichische Slot-Copy statt freiem Backend-Label: PASS.
- Isolierter Node-Save-Harness:
  - kein `medications`-Feld im Upsert-Payload: PASS.
  - Projektion und `ckd_stage` bleiben nach Save im Kontext: PASS.
  - `profile:changed` entspricht `getData()`: PASS.
- Kein Supabase-Write, kein Deploy und kein produktiver Runtime-Smoke in S4.1.

S4.1 Status: **DONE**.

### S4.2 - Arztbericht auf strukturierte Medication-Daten umstellen

Empfohlenes Modell / Reasoning: `GPT-5.6 Sol / Extra High`.

- Nur den Range-Arztbericht umstellen; der automatische Monatsbericht bleibt in
  diesem Punkt unverändert.
- den aktuellen Wiener Berichtstag einmal pro Request ermitteln und für alle
  Medication-/Slot-Abfragen wiederverwenden.
- aktive Medication-Stammdaten und an diesem Berichtstag gültige Slots direkt
  laden.
- Medication-Projektion auf `id`, `name`, `strength` und `with_meal` begrenzen;
  Slot-Projektion auf `id`, `med_id`, `slot_type`, `label`, `sort_order` und
  `qty_per_slot` begrenzen.
- jede Service-Role-Abfrage explizit mit `.eq("user_id", userId)` begrenzen.
- bestehende Ausgabe fachlich gleichwertig oder besser lesbar formatieren.
- inaktive Medikamente, mehrere Slots, Mengen, leere Liste und Query-Fehler
  deterministisch behandeln.
- aktives Medikament ohne aktuellen Slot mit
  `Einnahmeplan nicht hinterlegt` ausgeben.
- Tagesabschnitte aus dem kanonischen `slot_type` in österreichisch lesbare
  Copy übersetzen und freie Slot-Labels nur als kontrollierten Fallback
  verwenden.
- bei null aktiven Medication-IDs keinen leeren `.in(...)`-Slot-Read senden.
- Medikamente und Slots mit stabilen Tie-Breakern deterministisch sortieren.
- Bei Medication- oder Slot-Query-Fehler den Bericht vor jedem
  `health_events`-Write geschlossen abbrechen; kein Legacy-Fallback und kein
  Teilbericht.
- keine Bestands-, Low-Stock- oder internen IDs ausgeben.
- Deno-, Code- und Contract Review; Findings korrigieren.

#### S4.2 Umsetzungsnachweis 2026-07-16

Umgesetzt:

- `backend/supabase/functions/midas-monthly-report/index.ts` lädt ausschließlich
  für den Range-Arztbericht aktive Medication-Stammdaten sowie am einmalig
  bestimmten Wiener Berichtstag gültige aktive Slots.
- Die Select-Projektionen sind auf die vereinbarten fachlichen Felder begrenzt.
  Beide Service-Role-Reads enthalten explizit `.eq("user_id", userId)`.
- Bei null Medication-IDs wird der Slot-Read vor `.in(...)` beendet. Query-
  Fehler werden geworfen und brechen den Report vor dem `health_events`-Write
  ohne Legacy-Fallback oder Teilbericht ab.
- Medikamente werden nach Name und ID, Slots nach `sort_order` und ID stabil
  sortiert. Tagesabschnitte stammen primär aus `slot_type`; freie Labels dienen
  nur als kontrollierter Alias-Fallback.
- Die Ausgabe enthält Name, optionale Stärke, jeden Tagesabschnitt mit Menge
  sowie optional `mit Mahlzeit`. Fehlende Pläne und erfolgreiche Leere besitzen
  eigene eindeutige Copy.
- `user_profile.medications` und dessen Legacy-Formatter wurden aus der Edge
  Function entfernt. Der automatische Monatsbericht erzeugt weiterhin keinen
  Patient-/Medication-Block und führt keinen strukturierten Medication-Read aus.

Code- und Contract-Review:

- Finding: Die erste Formatierung ließ `qty_per_slot = 1` weg und erfüllte damit
  den vereinbarten Mengenvertrag nicht vollständig.
  Korrektur: Jeder Slot wird nun beispielsweise als `Morgens: 1` ausgegeben.
- Finding: Der erfolgreiche Leerzustand war nur als `keine` formuliert und
  entsprach nicht der in S3 festgelegten eindeutigen Arztbericht-Copy.
  Korrektur: `keine aktiven Medikamente hinterlegt.` wird ausgegeben.
- Ergebnis: `DH-F4` und `DH-F12` sind geschlossen. `DH-F3` bleibt bis zur
  Fresh-Setup-Bereinigung in S4.4 offen.

Verifikation:

- `deno check backend/supabase/functions/midas-monthly-report/index.ts`: PASS.
- `deno lint backend/supabase/functions/midas-monthly-report/index.ts`: PASS.
- `git diff --check`: PASS.
- Statische Contract-Assertions:
  - Range-only Read, exakte Projektionen und null-ID-Guard: PASS.
  - zwei explizite `userId`-Scopes und beide Fail-Closed-Pfade: PASS.
  - kein Legacy-Formatter und kein `profile.medications`-Read: PASS.
- Isolierte Deno-Formatter-Fixtures:
  - stabile Medikament-/Slot-Reihenfolge und Mengen `1`/`2`: PASS.
  - fehlender Einnahmeplan, erfolgreiche Leere und kontrollierter
    Label-Fallback: PASS.
- Nach ausdrücklicher User-Freigabe vorgezogenes Deploy:
  - `midas-monthly-report` Remote-Version `47`, Status `ACTIVE`: PASS.
  - JWT-Verifikation weiterhin aktiv: PASS.
  - write-freier Remote-`OPTIONS`-Smoke, HTTP `200`: PASS.
- Kein schreibender POST-Smoke und kein neuer `health_events`-Write in S4.2.

S4.2 Status: **DONE**.

### S4.3 - Assistant-, Vision- und Hub-Kontext absichern

Empfohlenes Modell / Reasoning: `GPT-5.6 Sol / High`.

- Downstream-Consumer gegen die neue Profilprojektion prüfen.
- Nur notwendige Änderungen durchführen.
- Bei nicht verfügbarem Medication-Kontext keine Legacy-Liste verwenden.
- Erfolgreiche Leere als `medications: []` weitergeben; bei Lade- oder
  Fehlerzustand die optionale Medication-Eigenschaft weglassen und nicht im Hub
  zu einer leeren Liste normalisieren.
- nach Abschluss aller Profil-/Hub-Änderungen die Cache-Version ausschließlich
  im aktiven Root-`service-worker.js` erhöhen; das inaktive
  `public/sw/service-worker.js` nicht als Rollout-Fix ändern.
- Node-, PWA-, Code- und Contract Review; Findings korrigieren.

#### S4.3 Umsetzungsnachweis 2026-07-16

Umgesetzt:

- `app/modules/hub/index.js` besitzt einen eigenen Profil-Kontext-Assembler.
  `profile.medications` wird nur gesetzt, wenn die Profilprojektion tatsächlich
  ein Array liefert.
- Aktuelle formatierte Zeilen werden bereinigt weitergegeben; eine erfolgreich
  leere Projektion bleibt als `medications: []` unterscheidbar.
- Fehlende Medication-Daten und alte String-Werte lassen die optionale
  Eigenschaft vollständig weg. Es gibt keinen Legacy-Parser oder Fallback.
- Vor jedem Text-, Vision- oder internen Snapshot-Payload wird der aktuelle
  Profilstand über `profile.getData()` gelesen. Ein älterer Hub-Snapshot kann
  dadurch bei `loading` oder `error` keine zuvor erfolgreiche Liste senden.
- `midas-assistant` und `midas-vision` bleiben unverändert: Ihre Typen führen
  `medications` bereits optional und ihre Summary-Logik verwendet sie nur bei
  tatsächlich vorhandenen Einträgen.
- Ausschließlich der registrierte Root-`service-worker.js` wurde von Cache-
  Version `v5` auf `v6` erhöht. `public/sw/service-worker.js` bleibt auf `v2`
  und unverändert.

Code- und Contract-Review:

- Finding: Der bisherige Hub-Assembler normalisierte fehlende Daten und alte
  Stringwerte zu `[]`. Dadurch waren technische Nichtverfügbarkeit,
  Legacy-Daten und echte leere Medikation nicht unterscheidbar.
  Korrektur: Nur ein Array erzeugt die optionale Payload-Eigenschaft.
- Finding: Der interne Hub-Kontext konnte während eines neuen Profil-Reads noch
  einen älteren erfolgreichen Snapshot enthalten.
  Korrektur: Der Outbound-Assembler fragt unmittelbar vor der Payload-Erzeugung
  den aktuellen Profilvertrag ab und verwendet einen Fallback nur, wenn das
  Profilmodul keine `getData()`-Schnittstelle besitzt.
- Ergebnis: Der S2.8-Kontextvertrag ist umgesetzt und `DH-F13` ist geschlossen.
  `DH-F3` bleibt ausschließlich bis zur Fresh-Setup-SQL-Bereinigung in S4.4
  offen.

Verifikation:

- `node --check app/modules/hub/index.js`: PASS.
- `node --check service-worker.js`: PASS.
- `deno check` für `midas-assistant` und `midas-vision`: PASS.
- Isolierte Assistant-Profil-Kontext-Fixtures:
  - aktuelle bereinigte Zeilen: PASS.
  - erfolgreiche Leere bleibt `[]`: PASS.
  - fehlende Medication-Eigenschaft bleibt ausgelassen: PASS.
  - Legacy-String wird nicht übernommen: PASS.
- Statische PWA-/Contract-Assertions:
  - aktueller Profil-Read vor Payload-Erzeugung: PASS.
  - kein String-Parser im Hub-Assembler: PASS.
  - Root-Worker `v6`, inaktiver Public-Worker weiterhin `v2`: PASS.
- `git diff --check`: PASS.
- Kein Edge-Deploy, Supabase-Write oder produktiver PWA-Update-Smoke in S4.3;
  der reale Worker-Update-Flow bleibt S5.7.

S4.3 Status: **DONE**.

### S4.4 - Kanonischen Profil-SQL-Vertrag bereinigen

Empfohlenes Modell / Reasoning: `GPT-5.6 Sol / High`.

- Fresh-Setup darf `user_profile.medications` nicht mehr als aktive Spalte
  provisionieren.
- bestehende Produktion behält die Legacy-Spalte vorerst physisch.
- keine Migration mit produktivem Spalten-Drop anlegen.
- SQL-, Rollout- und Contract Review; Findings korrigieren.

Umsetzung:

- `sql/10_User_Profile_Ext.sql` legt `user_profile.medications` nicht mehr an.
- Der veraltete Butler-/Foto-Kommentar wurde auf den neutralen fachlichen
  Profil- und Zielwertvertrag korrigiert.
- Es wurde keine Drop-Migration angelegt und kein SQL produktiv ausgeführt.

Code-, SQL- und Contract Review:

- Finding: Der einzige aktive DDL-Pfad für die Legacy-Spalte lag in
  `sql/10_User_Profile_Ext.sql`; `sql/01_Health Schema.sql` legt nur die
  Profil-Basistabelle an.
  Korrektur: Die einzelne Spaltenanlage wurde aus dem kanonischen
  Fresh-Setup-Vertrag entfernt.
- Finding: Der Dateikopf band den Profilvertrag noch an den historischen
  Butler-/Foto-Kontext.
  Korrektur: Der Kommentar beschreibt jetzt dauerhaft die fachlichen Profil-
  und Zielwertfelder.
- Rollout-Review: Eine Änderung einer kanonischen Setup-Datei verändert keine
  bestehende Datenbank. Die produktive Legacy-Spalte bleibt daher bewusst
  erhalten und schützt ältere gecachte Clients.
- Scope-Review: Das strukturierte Medication-Schema in
  `sql/12_Medication.sql` und alle übrigen Profilfelder bleiben unverändert.

Verifikation:

- Repo-weite DDL-Suche: keine Anlage und kein Drop von
  `user_profile.medications` mehr vorhanden.
- Contract-Assertion auf `sql/10_User_Profile_Ext.sql`: PASS.
- Strukturierte Tabellen `health_medications`,
  `health_medication_schedule_slots` und `health_medication_slot_events`
  weiterhin im kanonischen Medication-SQL vorhanden: PASS.
- `git diff --check -- sql/10_User_Profile_Ext.sql`: PASS.
- Kein Supabase-Write, kein SQL-Deploy und keine produktive Schemaänderung in
  S4.4.

S4.4 Status: **DONE**.

### S4.5 - Incident-Push gegen reale historische Zeitoverrides härten

Empfohlenes Modell / Reasoning: `GPT-5.6 Sol / Extra High`.

- überschriebenes `now` nur für `dry_run = true` zulassen.
- Bei der Input-Normalisierung ein eigenes Flag wie `nowOverrideProvided`
  erhalten; nicht durch Vergleich des geparsten Datums mit der aktuellen Uhr
  erraten, ob ein Override vorhanden war.
- Guard für Incident- und Diagnosemodus nach Auth/Input-Validierung, aber vor
  fachlichen Reads, Push-Sends und allen Subscription-/Delivery-Writes setzen.
- reguläre Scheduler-Runs ohne Override unverändert lassen.
- Diagnosemodus und GitHub-Workflow-Kompatibilität prüfen.
- User-Facing Fehlerantwort klar und ohne Secret-Details halten.
- Deno-, Security-, Code- und Contract Review; Findings korrigieren.

Umsetzung:

- `NormalizedInput` enthält jetzt `nowOverrideProvided` als explizites
  Anwesenheitsflag.
- `normalizeInput()` setzt das Flag ausschließlich über `hasOwn(raw, "now")`
  und parst einen vorhandenen Wert weiterhin vollständig.
- Nach Authentifizierung und Input-Normalisierung lehnt der Handler
  `nowOverrideProvided && !dryRun` mit HTTP `400` ab.
- Die bestehende Diagnose-Trigger-Prüfung wurde vor den Guard und vor
  `resolveUserIds()` gezogen; die fachliche Regel `diagnostic` nur mit
  `trigger = manual` bleibt unverändert.

Code-, Security- und Contract Review:

- Finding: Der normalisierte Input hielt bisher nur das resultierende Datum,
  aber nicht die bloße Anwesenheit des Request-Feldes fest.
  Korrektur: Eigenes Boolean-Flag ergänzt; es findet kein fehleranfälliger
  Zeitvergleich statt.
- Finding: Die Diagnose-Trigger-Prüfung lag bisher erst nach User-Auflösung.
  Korrektur: Semantische Input-Prüfung vor den Zeitguard gezogen, damit beide
  Ablehnungspfade garantiert vor fachlichen Reads und Nebenwirkungen enden.
- Security Review: Der Fehlertext enthält weder Secret-, User-, Endpoint- noch
  Push-Daten und unterscheidet den erlaubten Dry-Run klar vom blockierten Run.
- Workflow Review: `.github/workflows/incidents-push.yml` setzt kein `now` und
  bleibt für Scheduler- und manuelle Aufrufe unverändert kompatibel.
- Scope Review: Push-Regeln, Zeitfenster, Dedupe, Subscription-Health und
  Delivery-Persistierung wurden nicht verändert.

Verifikation:

- `deno check backend/supabase/functions/midas-incident-push/index.ts`: PASS.
- `deno lint backend/supabase/functions/midas-incident-push/index.ts`: PASS.
- Guard-Reihenfolge von Input über semantische Validierung und Zeitguard bis
  vor `resolveUserIds()` und erstem fachlichen Read: PASS.
- Workflow-Assertion auf fehlendes `now`: PASS.
- `git diff --check`: PASS.
- `deno fmt --check` bleibt wegen des bereits vor S4.5 unformatierten
  Gesamtbestands der Datei rot; ein fachfremdes Vollformatieren wurde bewusst
  vermieden. Die neu geänderten Blöcke folgen dem aktuellen Deno-Format.
- Kein Edge-Deploy, kein Remote-Smoke, kein Push und kein Supabase-Write in
  S4.5; Deploy und Runtime-Nachweise bleiben hinter dem S5-Owner-Gate.

S4.5 Status: **DONE**.

### S4.6 - Push-Hygiene-SQL und Cron-Vertrag umsetzen

Empfohlenes Modell / Reasoning: `GPT-5.6 Sol / Extra High`.

- `sql/18_Push_Data_Hygiene.sql` als kanonische Datei anlegen.
- partiellen Index auf `push_subscriptions(updated_at) where disabled = true`
  anlegen; vorhandenen Delivery-`day`-Index wiederverwenden.
- Delivery-Cutoff als Wiener Datum mit strengem `<` und Subscription-Cutoff als
  absoluten Zeitstempel mit strengem `<` implementieren.
- `public.push_data_hygiene_cleanup_internal()` als `SECURITY INVOKER` mit
  Löschzählern und Cleanup ausschließlich abgeschlossener eigener alter Cron-
  Run-Details implementieren.
- unmittelbar nach Funktionsbeginn einen dokumentierten festen
  transaktionalen Advisory Lock über
  `pg_catalog.pg_try_advisory_xact_lock(1296647233, 1347769160)` erwerben; die
  beiden Integer bilden gemeinsam den dokumentierten MIDAS-Push-Lock. Bei
  belegtem Lock vor jedem Delete geschlossen abbrechen.
- vor dem ersten Delete genau einen aktiven Job mit erwartetem Namen, Owner
  `postgres`, aktueller Datenbank, Schedule und Command verlangen; jede
  Abweichung transaktional ablehnen.
- Funktionsowner und Jobowner als `postgres` post-verifizieren.
- Execute für `PUBLIC`, `anon`, `authenticated` und `service_role` entziehen.
- genau einen Job `midas-push-hygiene-weekly` mit `45 3 * * 0` unter
  `postgres` und Command
  `select public.push_data_hygiene_cleanup_internal();` idempotent
  provisionieren.
- Duplikatjob, falschen Owner und nicht eindeutig korrigierbare Jobidentität
  geschlossen ablehnen.
- SQL-, ACL-, RLS-, Cron-, Concurrency- und Contract Review; Findings
  korrigieren.

#### Ergebnisprotokoll S4.6

- Umsetzung / Untersuchung:
  - `sql/18_Push_Data_Hygiene.sql` als bewusst user-gated und nicht automatisch
    gebootstrapptes Hygiene-SQL angelegt.
  - Partiellen Index
    `idx_push_subscriptions_disabled_updated_at` ausschließlich für
    `disabled = true` ergänzt; der vorhandene Delivery-`day`-Index wird
    wiederverwendet.
  - `public.push_data_hygiene_cleanup_internal()` als `SECURITY INVOKER` mit
    fixiertem `search_path = pg_catalog`, einheitlichem
    `statement_timestamp()` und JSON-Löschzählern implementiert.
  - Delivery-Cutoff als Wiener Kalendertag `Heute - 90` mit strengem `<` und
    Subscription-Cutoff als absoluter Zeitstempel `Ausführung - 90 Tage` mit
    strengem `<` umgesetzt.
  - Den festen Advisory Lock `(1296647233, 1347769160)` unmittelbar zu
    Funktionsbeginn gesetzt. Lock-, Owner- und vollständige Jobprüfung liegen
    vor dem ersten Delete.
  - Cleanup auf alte Deliveries, alte deaktivierte Subscriptions und
    abgeschlossene alte Laufdetails genau des eigenen Push-Hygiene-Jobs
    begrenzt. Zukunfts-Deliveries werden gezählt, aber niemals gelöscht.
  - Funktionseigentümer und Jobowner auf `postgres` festgelegt beziehungsweise
    vor und nach Provisionierung geprüft; `EXECUTE` ist für `PUBLIC`, `anon`,
    `authenticated` und `service_role` entzogen.
  - Genau einen aktiven Job `midas-push-hygiene-weekly` mit Schedule
    `45 3 * * 0`, aktueller Datenbank und dem exakten freigegebenen Command
    idempotent provisioniert. Duplikate und fremde Owner brechen geschlossen ab.
- Contract Review:
  - SQL Review: Beide Löschgrenzen entsprechen S2 ohne Off-by-one-Abweichung;
    alle Löschzähler und Diagnosewerte stammen aus demselben Ausführungszeitpunkt.
  - ACL-/RLS-Review: Die Cleanup-Funktion ist kein `SECURITY DEFINER`; App-Rollen
    erhalten kein Execute. Bestehende Tabellen-RLS und Policies werden nicht
    geändert. Der Owner-gebundene Cron-Lauf besitzt weiterhin die erforderliche
    Datenbankberechtigung.
  - Cron Review: Name, Owner, Datenbank, Schedule, Command und Aktivstatus werden
    vor Löschwirkung vollständig validiert und nach Provisionierung erneut
    geprüft. Nicht eindeutig auflösbare Jobzustände werden nicht automatisch
    repariert.
  - Concurrency Review: Der transaktionale Advisory Lock serialisiert manuelle
    und geplante Funktionsaufrufe; ein belegter Lock beendet den Lauf vor jeder
    Löschwirkung mit SQLSTATE `55P03`.
  - Scope Review: Medication-Retention, Delivery-RLS, Incident-Regeln und
    bestehender Delivery-Index bleiben unverändert.
- Checks:
  - Statischer Contract-Scan auf Funktionstyp, `search_path`, Lock, Guard-
    Reihenfolge, Cutoffs, Cron-Command, Owner, ACLs und verbotene
    `SECURITY DEFINER`-/Execute-Grant-Muster: PASS.
  - Einmaliger Fresh-Smoke in wegwerfbarer PostgreSQL-17.6-Instanz mit
    `pg_cron` 1.6.4: SQL-Transaktion, Extension, Index, Funktion und Job: PASS.
  - Post-Smoke: Function-Owner `postgres`, `SECURITY INVOKER`,
    `search_path=pg_catalog`, App-Execute jeweils `false`, Owner-Execute `true`,
    exakt ein aktiver Job mit erwartetem Vertrag und korrekter partieller
    Indexdefinition: PASS.
  - Leerer Cleanup-Aufruf unter korrektem lokalen Jobvertrag: PASS mit allen
    Löschzählern `0`.
  - Wegwerfbarer Docker-Container nach dem Check entfernt: PASS.
  - Kein produktives SQL, kein produktiver Cleanup und kein Edge-Deploy in
    S4.6.
- Findings:
  - SQL-Syntax-Finding: `COALESCE` war im ersten Entwurf fälschlich als
    `pg_catalog.coalesce(...)` qualifiziert, obwohl es PostgreSQL-Sondersyntax
    ist.
  - Supabase-Rollen-Finding: `cron.alter_job(..., username := 'postgres')`
    verlangt klassische Superuser-Rechte. Die Supabase-`postgres`-Rolle darf
    diesen Parameter trotz bereits korrektem Jobowner nicht setzen.
- Korrekturen:
  - Beide `COALESCE`-Vorkommen unqualifiziert geschrieben und den SQL-Smoke
    wiederholt.
  - Den unnötigen `username`-Mutationsparameter aus `cron.alter_job` entfernt.
    Der Owner wird stattdessen vorab geschlossen geprüft, neue Jobs entstehen
    unter dem verpflichtenden `current_user = postgres`, und der Owner wird
    danach erneut verifiziert.
- Restrisiko:
  - Zweitlauf-Idempotenz, Grenz-Fixtures, fremder/duplizierter Job, App-Rollen-
    Aufruf, gehaltenes Advisory Lock und Cron-Run-Detail-Grenzen werden erst in
    den vorgesehenen S5-Tests vollständig bewiesen.
  - Der produktive Bestand und der reale Cron-Scheduler wurden in S4.6 nicht
    verändert.
- Doku-Sync-Entscheidung:
  - Nur Roadmap und kanonisches SQL werden aktualisiert. `HOW_TO.md`, QA und
    Module Overviews folgen gemäß Vertrag in S4.7 beziehungsweise S6.
- Nächster erlaubter Schritt:
  - S4.7 einzeln umsetzen, Doku-/QA-Contract-Review durchführen und Findings
    korrigieren.

S4.6 Status: **DONE**.

### S4.7 - QA- und Doku-Vorbereitung

Empfohlenes Modell / Reasoning: `GPT-5.6 Sol / Medium`.

- neue unchecked QA-Phase für Push-/Medication-Hygiene vorbereiten.
- Module Overviews bis zum Runtime-Nachweis in S6 unverändert lassen; Pending-
  Änderungen ausschließlich in Roadmap und unchecked QA festhalten.
- SQL-HOW-TO für neue Datei und Ausführungsgrenzen vorbereiten.
- Markdown- und Contract Review; Findings korrigieren.

#### Ergebnisprotokoll S4.7

- Umsetzung / Untersuchung:
  - In `docs/QA_CHECKS.md` die neue Phase P18 für Push- und Medication-
    Datenhygiene angelegt.
  - Alle 58 P18-Prüfpunkte bleiben bewusst unchecked. S4.7 bereitet Nachweise
    vor, nimmt aber keine S5-Runtime- oder Produktivabnahme vorweg.
  - QA deckt statische Checks, Fresh-Setup und Zweitlauf, beide Retention-
    Grenzen, Reaktivierung, ACL, Owner, Jobdrift, Advisory Lock, Incident-
    Zeitguard, Medication-Quelle, Range-Bericht, PWA-Cache und produktive Owner-
    Gates ab.
  - `sql/HOW_TO.md` um den kanonischen Vertrag für
    `18_Push_Data_Hygiene.sql` erweitert: getrennte Verantwortung, SQL-
    Reihenfolge, Cutoffs, Cron-/Owner-Vertrag, Advisory Lock, Deploy-
    Voraussetzung, User-Gates und Rückfallgrenze.
  - Module Overviews nicht verändert. Der bestehende nicht abgeschlossene
    Arbeitsstand in `docs/modules/Push Module Overview.md` wurde weder
    zurückgesetzt noch durch S4.7 erweitert.
- Contract Review:
  - QA-Review: Jeder S5-Nachweis besitzt einen auffindbaren unchecked QA-Punkt;
    produktive Writes, Pushes und Cleanup-Wirkung bleiben ausdrücklich hinter
    separaten Owner-Freigaben.
  - SQL-Doku-Review: Fresh/disposable und bestehende Produktion sind getrennt.
    Der Incident-Push-Zeitguard muss vor produktiver Dedupe-Bereinigung deployt
    und verifiziert sein.
  - Security Review: App-ACLs, `SECURITY INVOKER`, Owner `postgres`, exakte
    Jobidentität, Advisory Lock und unveränderte Tabellen-RLS sind dokumentiert.
  - Retention Review: Delivery-Tag, Subscription-Zeitstempel und eigene
    abgeschlossene Cron-Laufdetails verwenden jeweils den in S2 festgelegten
    eigenen Vertrag.
  - Rollback Review: Job-Deaktivierung stoppt künftige Läufe, stellt bereits
    gelöschte technische Zeilen aber nicht ohne Export oder Backup wieder her.
  - Scope Review: Kein Module-Overview-Sync, kein Runtime-Code, kein SQL-Deploy,
    kein produktiver Write und kein Push in S4.7.
- Checks:
  - P18-Checkbox-Scan: `58` unchecked, `0` checked: PASS.
  - P18-Contract-Anker für SQL-Datei, Jobname, Advisory Lock, HTTP-Guard,
    Medication-Quelle, Cache-Version und `DH-F14`: PASS.
  - Gezielter Zeilenlängen- und Whitespace-Check der neu eingefügten QA- und
    HOW-TO-Blöcke: PASS.
  - `git diff --check`: PASS.
  - Vollständiger Markdownlint-Lauf ist für diese beiden historischen Dateien
    kein grünes Gate: `QA_CHECKS.md` besitzt bereits vor P18 keine H1-Struktur,
    wiederverwendete Unterüberschriften und zahlreiche Altzeilen über 80
    Zeichen; `sql/HOW_TO.md` verwendet historisch mehrere H1 und alte
    Listenformate. Ein fachfremder Vollumbau wurde bewusst vermieden.
- Findings:
  - QA-Contract-Finding: Im ersten Entwurf fehlten die exakt 90 Tage alte
    deaktivierte Subscription, beide Reaktivierungs-Zustandsfolgen, die UTC-/
    Wien-Mitternachtsgrenze und der Schutz vor leerem `.in(...)`-Slot-Read.
  - HOW-TO-Finding: Der feste Advisory Lock und die Aussage, dass Push-Tabellen-
    RLS, Policies und Grants unverändert bleiben, waren noch nicht explizit.
  - Tooling-Finding: Ein pauschaler Markdownlint-Lauf vermischt neue Änderungen
    mit einem großen historischen Baseline-Bestand und wäre als S4.7-
    Abnahmekriterium irreführend.
- Korrekturen:
  - Fehlende QA-Grenz- und Negativfälle ergänzt.
  - Advisory-Lock-Paar und unveränderten RLS-/Grant-Scope im HOW-TO ergänzt.
  - Neue Blöcke gezielt auf Zeilenlänge, Whitespace, Checkbox-Status und
    Contract-Anker geprüft; die globale Markdownlint-Baseline transparent als
    Restrisiko dokumentiert.
- Restrisiko:
  - Alle neuen QA-Punkte sind bis S5 bewusst offen.
  - Die historische Markdown-Struktur von `QA_CHECKS.md` und `sql/HOW_TO.md`
    bleibt ein separates Doku-Hygiene-Thema ohne Einfluss auf den fachlichen
    Runtime-Vertrag dieser Roadmap.
- Doku-Sync-Entscheidung:
  - Roadmap, unchecked QA und SQL-HOW-TO sind synchronisiert.
  - Profile-, Medication-, Push- und Reports-Overviews bleiben bis zum grünen
    Runtime-Nachweis in S6 unverändert.
- Nächster erlaubter Schritt:
  - S4.8 einzeln umsetzen, Gesamt-Code-/SQL-/Security-/Contract-Review
    durchführen und Findings korrigieren.

S4.7 Status: **DONE**.

### S4.8 - Gesamt-Code-/SQL-/Security-/Contract-Review

Empfohlenes Modell / Reasoning: `GPT-5.6 Sol / Extra High`.

- alle Findings `DH-F1` bis `DH-F16` gegen Umsetzung prüfen; `DH-F9` bleibt bis
  S6 dokumentarisch offen, `DH-F10` und `DH-F14` bleiben bewusst deferred.
- Consumer-Scan wiederholen.
- Fresh-Setup, bestehende Produktion und Cache-Kompatibilität getrennt prüfen.
- Löschprädikate, Zeitguard, ACL und Cron red-team-reviewen.
- keine offenen P0-/P1-Findings vor S5 akzeptieren.

#### Ergebnisprotokoll S4.8

- Umsetzung / Untersuchung:
  - Alle S4-Diffs gegen Zielvertrag, Finding-Matrix und tatsächliche Consumer
    erneut gelesen; Assistant und Vision konsumieren weiterhin ausschließlich
    den vom Hub gelieferten Kontext.
  - Der wiederholte Consumer-Scan findet keinen aktiven direkten Read oder
    Write von `user_profile.medications` in Frontend oder Edge Functions.
    Verbleibende Treffer beschreiben ausschließlich Roadmap, QA und spätere
    Doku-/Drop-Gates.
  - Fresh-Setup, bestehende Produktion und Cache-Kompatibilität getrennt
    geprüft: Fresh-Setup legt die Legacy-Spalte nicht an, die Produktion behält
    sie vorläufig, und Cache-Version `v6` rollt den neuen Profil-/Hub-Vertrag
    aus, ohne alte Bestandsclients durch einen Sofort-Drop zu brechen.
  - Den produktiven Edge-Status read-only mit der Supabase CLI abgeglichen:
    `midas-monthly-report` ist `ACTIVE` als Version `47`, während der lokale
    Incident-Zeitguard noch nicht in der aktiven Remote-Version `16` steckt.
- Code- und Contract Review:
  - Profilzustände `loading`, `empty`, `ready` und `error` bleiben getrennt;
    nur erfolgreiche Daten oder erfolgreiche Leere erzeugen Medication-Kontext.
  - Range-Arztbericht liest Medication und Slots mit explizitem `userId`,
    überspringt den Slot-Read bei leerer ID-Liste und erreicht seinen
    `health_events`-Write erst nach vollständig erfolgreichen Reads.
  - Der Incident-Zeitguard liegt nach Auth/Input-Validierung, aber vor
    User-Auflösung und jedem fachlichen Read, Push oder Write.
  - Delivery-, Subscription- und Cron-Löschprädikate entsprechen den strikten
    90-Tage-Grenzen; Lock, Function-Owner, vollständige Jobidentität und ACL
    werden vor dem ersten Delete geprüft.
  - Offizielle Supabase-Cron-Dokumentation erneut gegengeprüft: Jobs und
    Laufdetails liegen in `cron.job` beziehungsweise `cron.job_run_details`,
    Jobänderungen erfolgen über `cron.schedule`/`cron.alter_job`, und Cron-
    Beispiele verwenden GMT. Der implementierte Vertrag bleibt damit
    kompatibel.
- Findings und Korrekturen:
  - `DH-F16`: Ein Medication-Snapshot konnte ohne vorhandenen Profil-Datensatz
    ein Objekt mit ausschließlich `medications` erzeugen. Hub und
    Profilübersicht interpretierten den fehlenden Boolean danach fälschlich als
    `Nichtraucher`. Beide Ausgaben prüfen nun explizit auf Boolean und lassen
    unbekannten Raucherstatus weg.
  - Der neue Randfall war noch nicht als deterministischer QA-Negativtest
    erfasst. S5.6 und die vollständig unchecked P18-Phase enthalten ihn jetzt.
  - Der globale Deploy-/Runtime-Status war nach dem vorgezogenen, freigegebenen
    Report-Deploy noch auf `geplant`. Statusblock, Handoff und S5-Übergabe wurden
    auf den belegten Iststand korrigiert.
- Verifikation:
  - `node --check` für Profil, Hub und aktiven Root-Service-Worker: PASS.
  - `deno check` für Monthly Report und Incident Push: PASS.
  - gemeinsamer `deno lint` für beide Edge Functions: PASS.
  - Consumer-, Legacy-Spalten-, Cache-, SQL-Guard- und ACL-Scans: PASS.
  - Roadmap-Markdownlint: PASS mit `0` Fehlern.
  - P18 bleibt mit `59` unchecked und `0` fälschlich abgehakten QA-Punkten
    vollständig für S5 offen.
  - `git diff --check`: PASS.
- Restrisiko / bewusste Restarbeit:
  - Vollständige Fresh-/Idempotenz-, Grenz-, Rollen-, Owner-, Lock- und Cron-
    Fixtures bleiben S5 und wurden durch diesen Review nicht vorgetäuscht.
  - `DH-F9` bleibt bis zum finalen Doku-Sync in S6 offen; `DH-F10` und
    `DH-F14` bleiben unveränderte Watchlists.
  - Kein neues P0-/P1-Finding ist offen.
- Doku-Sync-Entscheidung:
  - Roadmap-Status und S5-Übergabe sind synchronisiert. Module Overviews bleiben
    vertragsgemäß bis zum grünen Runtime-Nachweis in S6 unverändert.
- Nächster erlaubter Schritt:
  - S5 als vollständigen Test-, Deploy- und Runtime-Gate-Schritt durchführen.

S4.8 Status: **DONE**.

S4 Exit-Kriterium:

- Lokale Umsetzung ist vollständig und reviewt.
- Der vorgezogene, ausdrücklich freigegebene Report-Deploy ist dokumentiert;
  kein weiterer produktiver Deploy und kein produktives SQL ohne S5-Gate.

## S5 - Tests, Code Review, Deploy und Runtime-Gates

Empfohlenes Modell / Reasoning: `GPT-5.6 Sol / Extra High`.

### S5.1 - Lokale statische Checks

- `node --check` für alle geänderten Frontend-JavaScript-Dateien.
- `deno check` für beide geänderten Edge Functions.
- SQL- und Consumer-Scans.
- `git diff --check` und gezielter Dirty-Worktree-Review.
- Markdownlint beziehungsweise vorhandene Markdown-Checks.

### S5.2 - Disposable Fresh-Setup und Idempotenz

- lokalen Supabase-Stack gemäß `DEV_ENVIRONMENT.md` starten.
- relevante kanonische SQL-Dateien in korrekter Reihenfolge ausführen.
- neues Push-Hygiene-SQL zweimal ausführen.
- genau einen Cron-Job und keine Duplikate nachweisen.

### S5.3 - Disposable Push-Retention-Fixtures

- Deliveries an `-91`, `-90`, heute und Zukunft anlegen.
- aktive, deaktivierte alte, deaktivierte junge und reaktivierte Subscription
  anlegen.
- Cleanup in Transaktion testen und Fixture vollständig zurückrollen.
- erwartete Löschzähler, erhaltene Zeilen und Indizes nachweisen.
- exakte 90-Tage-Grenze für deaktivierte Subscriptions sowie Zukunfts-
  Deliveries prüfen.
- Reaktivierung vor und nach einem simulierten Cleanup in getrennten
  Zustandsfolgen prüfen; keine aktive Subscription darf im Löschset bleiben.

### S5.4 - Disposable Rechte-, Owner- und Cron-Tests

- Cleanup als App-Rollen ablehnen.
- Ausführung als erwartete Cron-/DB-Rolle erlauben.
- Function-Owner und Job-Owner `postgres` nachweisen.
- falschen Job-Owner und Duplikatjob geschlossen behandeln.
- fehlenden, inaktiven oder in Schedule/Command/Datenbank abweichenden Job vor
  jedem Delete geschlossen behandeln.
- Advisory Lock `(1296647233, 1347769160)` in einer zweiten DB-Session halten
  und nachweisen, dass der Cleanup ohne Löschwirkung abbricht.
- eigene alte Cron-Run-Details begrenzen, fremde Jobs nicht berühren.
- laufende, nicht abgeschlossene und exakt 90 Tage alte eigene Run-Details
  behalten.

### S5.5 - Edge-Function- und Zeitguard-Tests

- regulärer aktueller Dry-Run bleibt kompatibel.
- historischer Dry-Run mit `now` bleibt möglich.
- historischer Non-Dry-Run wird vor jeder Zustellung und jedem Delivery-Write
  abgewiesen.
- Diagnosemodus und Workflow-Payload bleiben kompatibel.
- denselben Override-Guard im Incident- und Diagnosemodus prüfen und beweisen,
  dass die Ablehnung vor jedem fachlichen Read oder Write erfolgt.
- automatisierte Remote-Tests auf Dry-Run oder garantierte Pre-Read-Ablehnung
  begrenzen; kein erfolgreicher Non-Dry-Push ohne separates Owner-Gate.

### S5.6 - Medication-/Profil-/Report-Fixtures

- null, ein und mehrere aktive Medikamente.
- inaktive Medikamente ausgeschlossen.
- ein und mehrere aktuelle Slots sowie Mengen größer eins.
- temporär beendete oder zukünftige Slots nicht als aktueller Plan ausgeben.
- aktives Medikament ohne aktuellen Slot bleibt sichtbar.
- Wiener Berichtstag auch nahe einer UTC-/Wien-Mitternachtsgrenze korrekt und
  innerhalb eines Requests konsistent verwenden.
- null aktive Medication-IDs ohne leeren `.in(...)`-Slot-Read behandeln.
- Profil unterscheidet Ladezustand, leere Liste, Daten und nicht verfügbares
  Read-Model; alle vier Zustände bleiben read-only.
- erfolgreicher Medication-Snapshot ohne Profilzeile erzeugt weder im Profil
  noch im Hub einen erfundenen Raucherstatus.
- Arztbericht behält österreichische, lesbare Copy.
- Report-Queries mit fremder `user_id` liefern keine Daten.
- Medication- oder Slot-Query-Fehler erzeugt weder Teilbericht noch
  `health_events`-Write.

### S5.7 - Browser-, PWA- und Kontext-Smokes

- Profil und Medication-Manager vergleichen.
- Profil speichern und prüfen, dass kein Legacy-Medication-Write erfolgt.
- Direkt nach dem Speichern prüfen, dass Medication-Projektion, Read-only-
  Zustand und `profile:changed`-Kontext erhalten bleiben.
- Hub-/Assistant-/Vision-Kontext prüfen.
- Erfolgreiche leere Medication-Liste und ausgelassenen nicht verfügbaren
  Medication-Kontext als unterschiedliche Payloads prüfen.
- Range-Arztbericht lokal oder kontrolliert remote erzeugen und Medikation
  vergleichen.
- alter Client bleibt wegen vorhandener Legacy-Spalte vorerst kompatibel.
- aktiven Root-Service-Worker lokal über HTTP mit neuer Cache-Version
  installieren, Update-Banner bestätigen, Update anwenden und nach Controller-
  Wechsel/Reload den neuen Profil-/Hub-Vertrag prüfen.
- nachweisen, dass `public/sw/service-worker.js` nicht registriert wird.

### S5.8 - Optionaler CodeRabbit Review

- Review nach lokal grünem Stand durchführen.
- Findings zuerst bewerten.
- echte Findings korrigieren und alle betroffenen Checks wiederholen.
- Fehlalarme mit Beleg dokumentieren.

#### S5.1 bis S5.8 - Ausführung, Review und Abnahme 2026-07-16

- S5.1 lokale statische Checks: **PASS**.
  - `node --check` für Profil, Hub und Root-Service-Worker ist grün.
  - `deno check` und gemeinsamer `deno lint` für Monthly Report und Incident
    Push sind grün.
  - SQL-, Consumer-, Legacy-Spalten-, Cache-, ACL- und Guard-Scans sowie
    `git diff --check` und Roadmap-Markdownlint sind grün.
- S5.2 Fresh-Setup und Idempotenz: **PASS**.
  - Der relevante kanonische SQL-Satz lief im disposable Supabase-Stack auf
    PostgreSQL 17.6 erfolgreich durch.
  - `18_Push_Data_Hygiene.sql` lief zweimal und hinterließ exakt einen aktiven
    Job mit dem vereinbarten Owner-, Datenbank-, Schedule- und Command-Vertrag.
- S5.3 Push-Retention-Fixtures: **PASS**.
  - `-91`, `-90`, heute, Zukunft, aktive, junge deaktivierte und reaktivierte
    Datensätze verhielten sich exakt gemäß den strikten Cutoffs.
  - Alle Fixtures und simulierten Cleanup-Folgen wurden zurückgerollt.
- S5.4 Rechte-, Owner-, Cron- und Lock-Fixtures: **PASS**.
  - App-Rollen wurden abgewiesen; Owner, Jobidentität, Fail-closed-Driftfälle,
    Duplikat-/Fremdowner, Advisory Lock und begrenzte eigene Run-History wurden
    nachgewiesen.
- S5.5 lokaler Edge-Zeitguard: **PASS**.
  - Aktueller und historischer Dry-Run sowie Scheduler-Payload blieben
    kompatibel.
  - Historischer Non-Dry-Run wurde im Incident- und Diagnosemodus mit HTTP 400
    vor User-Auflösung, fachlichem Read, Push und Write abgewiesen.
  - Es entstand kein Delivery-Write.
- S5.6 Medication-/Profil-/Report-Fixtures: **PASS**.
  - Null, ein, mehrere, inaktive, fremde und slotlose Medikamente sowie
    aktuelle, beendete und zukünftige Slots wurden geprüft.
  - Unbekannter, negativer und positiver Raucherstatus blieben fachlich
    getrennt; Query-Fehler erzeugte keinen Teilbericht und keinen Event-Write.
  - Wiener Sommer-/Winter-Mitternachtsfälle und der einmalige Berichtstag pro
    Request sind grün.
- S5.7 Browser-, PWA- und Kontext-Smokes: **PASS**.
  - Headless Playwright bestätigte `loading`, erfolgreiche Leere, Daten und
    Fehler, Read-only-Projektion, Save ohne Legacy-Write sowie erhaltenen
    `profile:changed`-Kontext.
  - Hub, Assistant und Vision übernehmen denselben aktuellen Profil-Snapshot;
    `[]` und ausgelassener Medication-Kontext bleiben unterscheidbar.
  - Der Range-Bericht nutzt die strukturierten Medication-Tabellen und den
    einmal berechneten Wiener Berichtstag.
  - Der reale Root-Service-Worker installierte `midas-shell-v6` und
    `midas-runtime-v6`; Update-Banner, `SKIP_WAITING`, Controller-Listener,
    Reload/Control und der Ausschluss von `public/sw/service-worker.js` wurden
    geprüft.
- S5.8 CodeRabbit: **PASS**.
  - Der Owner führte den Review über die VS-Code-Erweiterung nach dem lokal
    grünen Stand aus.
  - Das erste Finding schlug vor, bei `profile.getData() === null` auf den
    älteren `ctx.profile`-Snapshot zurückzufallen.
  - Das Finding wurde als Fehlalarm abgegrenzt: Bei vorhandenem Profil bleiben
    Stammdaten in `loading` und `error` erhalten, während nur die optionale
    Medication-Eigenschaft ausgelassen wird. Ein Fallback auf `ctx.profile`
    könnte dagegen eine ältere erfolgreiche Medication-Liste erneut an
    Assistant oder Vision senden und würde den S2.8-/S4.3-Vertrag verletzen.
  - Keine Source-Änderung war erforderlich.
  - Der zweite Hinweis verlangte dauerhafte Regressionstests für den
    Incident-Push-Request-Vertrag. Das Finding war berechtigt: Die temporären
    Runtime-Smokes aus S5.5 belegten das Verhalten, waren aber nicht im Repo
    wiederholbar.
  - Parser und Guards wurden deshalb ohne Verhaltensänderung nach
    `request-contract.ts` extrahiert. Vier Deno-Tests prüfen echte Request-
    Bodies für Diagnose mit nicht-manuellem Trigger, `now` ohne `dry_run`,
    `now` mit `dry_run: true` sowie den Default-Pfad ohne `now`.
  - `deno check`, `deno lint` und `deno test` sind nach der Korrektur grün;
    vier von vier Regressionstests bestehen.
- Findings und Korrektur:
  - `DH-F17`: Der erste Fresh-Versuch zeigte, dass `06_Security.sql` noch die
    retired Legacy-Tabelle `public.appointments` voraussetzt. Der Code-/SQL-
    Zielvertrag war nicht betroffen; `sql/HOW_TO.md` grenzt den historischen
    Patch nun ausdrücklich vom aktuellen Fresh-Bootstrap ab.
  - Zwei zwischenzeitliche Playwright-Abbrüche waren ausschließlich Fehler im
    temporären Test-Harness (Unicode-Erwartung und verstecktes Mock-Feld). Nach
    Harness-Korrektur liefen dieselben Produktverträge grün; kein Source-Fix
    war erforderlich.
  - `DH-F18`: Der bisher nur temporär geprüfte Request-Guard besitzt nun eine
    dauerhafte, schnelle Deno-Regressionstest-Suite. Die fachliche Guard-
    Reihenfolge und alle Response-Texte blieben unverändert.
- Contract Review:
  - Alle lokal und disposable prüfbaren Anforderungen aus S5.1 bis S5.7 sind
    mit realen Checks oder transaktionalen Fixtures belegt.
  - Keine produktive Supabase-Änderung, kein Remote-Deploy und kein
    erfolgreicher Non-Dry-Push wurde in diesem Block ausgeführt.
  - S5 bleibt `IN_PROGRESS`; S5.9 bis S5.15 sind die getrennten produktiven
    Owner-Gates und dürfen erst nach dem nächsten ausdrücklichen Auftrag
    beginnen.

### S5.9 - Produktiver read-only Preflight

- Projekt, PostgreSQL-Version und erwartete Tabellen prüfen.
- exakte Anzahl der älter als 90 Tage löschbaren Deliveries und deaktivierten
  Subscriptions bestimmen.
- aktive Subscriptions explizit außerhalb des Löschsets nachweisen.
- bestehende Cron-Jobs, Rollen, ACL und Advisor-Baseline prüfen.
- aktuelle Medication-Stammdaten und Legacy-Profilspalte vergleichen, ohne
  medizinische Werte in die Roadmap zu kopieren.

#### Ergebnisprotokoll S5.9 - 2026-07-17

- Projekt und Schema: **PASS**.
  - Das eindeutig zugeordnete Projekt `M.I.D.A.S.` ist `ACTIVE_HEALTHY` in
    `eu-central-1`.
  - Die Datenbank läuft produktiv auf PostgreSQL `17.6.1.025`; die Abkündigung
    von PostgreSQL 14 betrifft MIDAS nicht.
  - Push-Delivery, Push-Subscription, Medication-Stammdaten, Medication-Slots,
    Slot-Events und `user_profile` sind vorhanden und RLS-geschützt.
- Exaktes Push-Löschset zum Wiener Stichtag `2026-07-17`: **PASS**.
  - Delivery-Cutoff ist exklusiv `2026-04-18`: Von `31` Deliveries sind `8`
    älter und damit löschbar; `0` liegen exakt am Cutoff und `0` in der Zukunft.
  - Von `6` Subscriptions sind `3` aktiv und `3` deaktiviert. Genau `1` alte,
    weiterhin deaktivierte Subscription erfüllt das Löschprädikat.
  - Alle `3` aktiven Subscriptions liegen außerhalb des Löschsets und bleiben
    erhalten.
- Cron-, Rollen-, ACL- und Index-Baseline: **PASS**.
  - Genau ein bestehender Cron-Job ist aktiv: die unveränderte tägliche
    Medication-Retention als `postgres` in der erwarteten Datenbank.
  - Push-Hygiene-Funktion, partieller Disabled-Subscription-Index und Job
    `midas-push-hygiene-weekly` fehlen vor S5.13 erwartungsgemäß.
  - `anon` besitzt keine Tabellenrechte auf die beiden Push-Tabellen.
    `authenticated` besitzt nur die vorgesehenen App-Rechte; alle fünf
    Push-Policies besitzen einen `auth.uid()`-Eigentümerguard und die Update-
    Policy besitzt `USING` und `WITH CHECK`.
  - `service_role` und `postgres` besitzen die für Backend beziehungsweise
    Owner erforderlichen Rechte. Die spätere interne Cleanup-Funktion erhält
    ihre restriktive Function-ACL erst bei der produktiven Provisionierung.
- Advisor-Baseline: **PASS mit bekannter Abgrenzung**.
  - Security meldet weiterhin genau die auf dem Free-Plan nicht aktivierbare
    Warnung `Leaked Password Protection Disabled`; keine weitere Security-
    Warnung ist vorhanden.
  - Performance meldet sechs reine `INFO`-Hinweise zu bisher ungenutzten
    Indizes. Kein Index wird vor einem ausreichend langen Nutzungszeitraum nur
    aufgrund dieser Statistik entfernt.
- Medication-vs.-Legacy-Vergleich: **PASS**.
  - Es existieren `3` aktive strukturierte Medication-Stammsätze und `3`
    aktuell gültige Slots. Die Legacy-Profilspalte enthält `6` freie Strings.
  - Alle `3` aktiven Medikamente sind in den Legacy-Strings repräsentiert; die
    Formate sind bewusst nicht identisch. Aktive Consumer verwenden weiterhin
    ausschließlich `health_medications` und die Legacy-Spalte bleibt nur als
    befristete Rollout-Kompatibilität bestehen.
- Contract Review und Findings-Korrektur:
  - Sämtliche Abfragen waren read-only und gaben nur technische Aggregate oder
    Vertragsmetadaten aus; keine Endpoints, Schlüssel, Medikamentennamen oder
    Profilwerte wurden dokumentiert.
  - Die zuerst generisch geprüfte Medication-Jobbezeichnung wurde gegen den
    realen Vertrag `midas-medication-retention-daily` korrigiert und danach mit
    exakt einem aktiven Job bestätigt.
  - Die abweichende Anzahl von Legacy-Strings wurde nicht als Datenverlust
    fehlklassifiziert: Ein zweiter strukturblinder Vergleich bestätigte, dass
    alle aktuellen Medikamente in der Legacy-Darstellung vorkommen.
  - Kein neues P0-/P1-Finding und keine produktive Schreibwirkung entstanden.
    S5.9 ist **DONE**; nächster Schritt ist das Owner-Briefing S5.10.

### S5.10 - Owner Briefing für Edge-Deploys

- `midas-monthly-report` und `midas-incident-push` getrennt erklären.
- Den bereits aktiven `midas-monthly-report` v47 nur erneut deployen, wenn sich
  sein Source nach S4.2 noch ändert; andernfalls Remote-Status und Runtime-Smoke
  verifizieren.
- `midas-incident-push` zuerst deployen und seinen Zeitguard beweisen; erst
  danach darf das Push-Hygiene-SQL Löschwirkung erhalten.
- Deploy erst nach ausdrücklicher Freigabe.
- Remote-Status und Deno-Stand unmittelbar danach prüfen.

#### S5.10 Owner-Briefing 2026-07-17

- `midas-monthly-report`:
  - Remote-Version `47` ist `ACTIVE`, JWT-Verifikation ist aktiv.
  - Der normalisierte lokale und remote heruntergeladene Source sind
    inhaltsgleich. Ein erneuter Deploy hat daher keinen fachlichen Nutzen und
    wird ausgelassen.
  - Ein echter POST-Smoke des Range-Berichts schreibt bestimmungsgemäß einen
    neuen Bericht in `health_events`. Dieser Test bleibt ein separates
    produktives Write-Gate und benötigt eine ausdrückliche Freigabe.
- `midas-incident-push`:
  - Remote-Version `16` ist `ACTIVE`, JWT-Verifikation ist aktiv, enthält aber
    den lokalen Zeitguard aus S4.5 noch nicht.
  - Der lokale Source unterscheidet sich deshalb erwartungsgemäß von Remote und
    muss einmal deployt werden. Der relative Runtime-Import
    `request-contract.ts` wird durch den Supabase-Bundler mitgeführt.
  - Der Deploy ersetzt nur den Function-Code. Er sendet selbst keinen Push und
    schreibt oder löscht keine Tabellenzeile.
  - Die CLI behält JWT-Verifikation standardmäßig bei; der sicherheitsmindernde
    Schalter `--no-verify-jwt` wird nicht verwendet.
- Unmittelbare Remote-Nachweise nach Freigabe:
  1. Incident-Push deployen und `ACTIVE`, neue Version sowie
     `verify_jwt = true` prüfen.
  2. aktuellen Dry-Run ausführen; kein Push und kein Write.
  3. historischen Dry-Run mit explizitem `now` ausführen; weiterhin kein Push
     und kein Write.
  4. historischen Non-Dry-Run mit `now` kontrolliert vor User-Auflösung,
     fachlichen Reads, Push und Write mit HTTP `400` abweisen lassen.
  5. Delivery- und Subscription-Zähler vor und nach den Smokes read-only
     vergleichen.
- Lokaler Deploy-Preflight:
  - `deno check`: PASS.
  - `deno lint`: PASS.
  - Request-Contract-Tests: `4/4` PASS.
- Nicht Teil dieser Freigabe:
  - kein produktives Push-Hygiene-SQL.
  - kein manueller Cleanup und keine Löschung.
  - kein erfolgreicher Non-Dry-Run und keine Testbenachrichtigung.
  - kein schreibender Arztbericht-Smoke ohne gesonderte Freigabe.

#### S5.10 Deploy-Nachweis 2026-07-17

- Der Owner erteilte die ausdrückliche Deploy- und Smoke-Freigabe.
- `midas-incident-push` wurde mit `--use-api`, ohne `--no-verify-jwt`, deployt.
- Der Upload enthielt `index.ts` und die relative Runtime-Abhängigkeit
  `request-contract.ts`.
- Remote-Postconditions:
  - Status `ACTIVE`.
  - Version `17`.
  - `verify_jwt = true`.
- Unmittelbarer lokaler Post-Deploy-Nachweis:
  - `deno check`: PASS.
  - `deno lint`: PASS.
  - Request-Contract-Tests: `4/4` PASS.

S5.10 Status: **DONE**.

### S5.11 - Produktiver Edge-Runtime-Smoke

- Incident-Push Remote-Dry-Run mit aktueller Zeit.
- historischer Dry-Run erlaubt.
- historischer Non-Dry-Run kontrolliert abgewiesen, ohne Push oder Write.
- Arztbericht-Smoke nur nach User-Freigabe, da er `health_events` schreibt.
- sichtbare Medikation im Bericht durch Owner bestätigen.

#### S5.11 Runtime-Nachweis 2026-07-17

- Incident-Push:
  - aktueller manueller Incident-Dry-Run ohne `now`: HTTP `200`, `ok = true`,
    `dryRun = true`, Status `no-incidents`.
  - historischer Dry-Run für den 13.07.2026 mit explizitem `now`: HTTP `200`,
    `ok = true`, `dryRun = true`, Status `no-incidents`.
  - historischer Non-Dry-Run mit demselben `now`: HTTP `400` mit dem erwarteten
    Zeitguard-Fehler vor User-Auflösung, fachlichen Reads, Push und Write.
  - Vorher-/Nachher-Abgleich:
    - `push_notification_deliveries`: weiterhin `31` Zeilen und identischer
      vollständiger Inhalts-Fingerprint.
    - `push_subscriptions`: weiterhin `6` Zeilen und identischer vollständiger
      Inhalts-Fingerprint.
  - Es wurde kein erfolgreicher Non-Dry-Run und kein Test-Push ausgeführt.
- Range-Arztbericht:
  - Remote-Version `47` ist unverändert aktiv und inhaltsgleich zum lokalen
    Source; kein erneuter Deploy nötig.
  - Der bereits nach S4.2 erzeugte Range-Bericht vom 16.07.2026 wurde read-only
    geprüft: Medication-Abschnitt vorhanden, `3/3` aktive strukturierte
    Medikamente dargestellt.
  - Der vorhandene Live-Server-Smoke und der Datenbanknachweis erfüllen das
    Runtime-Gate. Es wurde kein redundanter neuer `health_events`-Eintrag
    erzeugt.
- Contract Review und Findings-Korrektur:
  - Der erste lokale Smoke-Versuch wurde wegen eines unter Windows PowerShell 5
    nicht unterstützten Parameters vor jedem Netzwerkaufruf abgebrochen. Der
    Aufruf wurde kompatibel neu ausgeführt; daraus entstand keine Remote-Wirkung.
  - Status-, Guard-, Auth-, No-Write- und Medication-Vertrag sind erfüllt.
  - Kein neues P0-/P1-Finding.

S5.11 Status: **DONE**.

### S5.12 - Owner Briefing für produktives Push-Hygiene-SQL

- reale Preflight-Zahlen nennen.
- erwartete DDL-, Cron- und spätere Löschwirkung erklären.
- Rückfall über Job-Deaktivierung und SQL-Rollback erklären und ausdrücklich
  festhalten, dass bereits gelöschte technische Zeilen nur aus einem vorherigen
  Export oder Backup wiederherstellbar wären.
- produktives SQL erst nach ausdrücklicher Freigabe.

#### S5.12 Owner-Briefing 2026-07-17

- Produktiver read-only Preflight um `2026-07-17 04:20 UTC`:
  - Wiener Kalendertag: `2026-07-17`.
  - strikter Delivery-Cutoff: `2026-04-18`.
  - `31` Delivery-Zeilen gesamt, davon `8` strikt älter und beim ersten
    Cleanup löschbar.
  - `0` Delivery-Zeilen exakt am Cutoff und `0` Zukunftszeilen.
  - `6` Subscription-Zeilen gesamt: alle `3` aktiven bleiben erhalten.
  - Von `3` deaktivierten Subscriptions ist `1` seit mehr als 90 Tagen
    unverändert und löschbar; `2` jüngere deaktivierte Zeilen bleiben erhalten.
  - Push-Cleanup-Funktion, partieller Index und benannter Push-Cron-Job sind
    erwartungsgemäß noch nicht vorhanden.
  - `pg_cron` ist wegen Medication-Retention bereits aktiv; genau ein aktiver
    Medication-Retention-Job bleibt separat bestehen.
  - Die produktive SQL-Ausführungsrolle ist `postgres` in Datenbank `postgres`
    und erfüllt damit den Owner-Vertrag.
- Wirkung der Provisionierung durch `18_Push_Data_Hygiene.sql`:
  - legt den partiellen Index für alte deaktivierte Subscriptions an.
  - legt die interne `SECURITY INVOKER`-Cleanup-Funktion unter Owner `postgres`
    an und entzieht `PUBLIC`, `anon`, `authenticated` und `service_role` das
    Ausführungsrecht.
  - legt genau einen aktiven Job `midas-push-hygiene-weekly` an oder bringt ihn
    idempotent auf den geprüften Vertrag.
  - Zeitplan: sonntags `03:45 UTC`, im Juli `05:45` Wiener Sommerzeit und im
    Winter `04:45` Wiener Zeit.
  - nächster möglicher automatischer Lauf nach aktueller Provisionierung:
    `2026-07-19 03:45 UTC`.
  - die Provisionierung selbst führt die Cleanup-Funktion nicht aus und löscht
    daher noch keine Push-Zeile.
- Erwartete Wirkung des separat freizugebenden ersten manuellen Cleanups:
  - voraussichtlich `8` alte Delivery-Zeilen löschen und `23` erhalten.
  - voraussichtlich `1` alte deaktivierte Subscription löschen und `5`
    Subscription-Zeilen erhalten, darunter alle `3` aktiven.
  - mangels bisherigem Push-Hygiene-Job keine alten eigenen Run-Details
    löschen.
  - die Zahlen werden unmittelbar vor der Wirkung erneut read-only geprüft;
    natürliche Änderungen zwischen Briefing und Ausführung werden dokumentiert.
- Sicherheits- und Fail-Closed-Vertrag:
  - Provisionierung läuft vollständig in einer Transaktion.
  - fremder Owner, doppelter Jobname, abweichender Jobvertrag oder fehlendes
    Owner-Execute brechen die Provisionierung ab.
  - jeder Cleanup prüft Owner, exakte aktive Jobidentität und Advisory Lock vor
    dem ersten Delete.
  - Medication-Retention, aktive Subscriptions, RLS, Policies und bestehende
    Tabellengrants werden nicht verändert.
- Rückfallweg:
  - den Job deaktivieren oder gezielt unschedulen, um künftige Läufe zu stoppen.
  - Cleanup-Funktion und partiellen Index bei Bedarf separat entfernen.
  - `pg_cron` nicht entfernen, weil der Medication-Retention-Job davon abhängt.
  - bereits gelöschte technische Zeilen werden dadurch nicht wiederhergestellt;
    dafür wäre ein vorheriger Export oder ein vorhandenes Datenbank-Backup
    nötig.
  - Ein separater Export der toten Push-Subscription würde Endpoint- und
    Schlüsseldaten vervielfältigen und ist für den vereinbarten technischen
    Datenmüll nicht vorgesehen.
- Contract Review und Findings-Korrektur:
  - Finding: Die Provisionierung aktiviert den Job sofort, während der erste
    Cleanup ein eigenes Freigabe-Gate besitzt. Längeres Warten nach der
    Provisionierung könnte den ersten Lauf ungeplant dem Sonntag-Cron überlassen.
  - Korrektur: Zwei ausdrückliche Freigaben werden gemeinsam vorab eingeholt:
    **A** für die Provisionierung und **B** für den unmittelbar anschließenden
    ersten manuellen Cleanup. Nach A werden alle Postconditions geprüft; bei
    jeder Abweichung wird der neue Job sofort deaktiviert und trotz B vor dem
    Cleanup hart gestoppt.
  - Kein produktiver Write und kein Delete wurden im Briefing ausgeführt.

S5.12 Status: **DONE**. Der Owner hat Freigabe A und B nach dem vollständigen
Briefing ausdrücklich erteilt.

### S5.13 - Produktives SQL und erster Cleanup

- SQL idempotent provisionieren.
- Postconditions für Funktion, Index, ACL, Jobname, Owner, Schedule und Command
  prüfen.
- ersten Cleanup nach separater Freigabe einmal manuell unter der erwarteten
  DB-Rolle ausführen; nicht auf einen unbestimmten ersten Cron-Lauf warten.
- Vorher-/Nachher-Zähler und erhaltene aktive Subscriptions dokumentieren.
- Security und Performance Advisor erneut prüfen.

#### S5.13 Produktivnachweis 2026-07-17

- Unmittelbarer read-only Preflight vor der Wirkung:
  - `31` Delivery-Zeilen gesamt, davon `8` nach Vertrag löschbar.
  - `6` Subscription-Zeilen gesamt, davon `3` aktiv und `1` alte deaktivierte
    Zeile löschbar.
  - Push-Cleanup-Funktion, partieller Index und benannter Job waren noch nicht
    vorhanden; die Ausführungsrolle war vertragsgemäß `postgres`.
- Produktive Provisionierung:
  - `sql/18_Push_Data_Hygiene.sql` wurde als eine Transaktion erfolgreich
    ausgeführt.
  - Ein erster Transportversuch enthielt vor dem eigentlichen SQL die lokale
    Shell-Ausgabe `Exit code: 0` und wurde deshalb von PostgreSQL bereits in
    Zeile 1 als Syntaxfehler abgewiesen. Der SQL-Body wurde nicht begonnen und
    es entstand keine DDL-, Schreib- oder Löschwirkung. Anschließend wurde nur
    der kanonische SQL-Block ab seinem Dateimarker übertragen.
  - Die Funktion existiert genau einmal unter Owner `postgres`, ist
    `SECURITY INVOKER` und verwendet `search_path = pg_catalog`.
  - `PUBLIC`, `anon`, `authenticated` und `service_role` besitzen kein
    `EXECUTE`; die Owner-Rolle `postgres` darf die Funktion ausführen.
  - Der partielle Index existiert mit dem geprüften Prädikat.
  - Genau ein aktiver Job `midas-push-hygiene-weekly` existiert unter
    `postgres` in Datenbank `postgres`, mit Schedule `45 3 * * 0` und Command
    `select public.push_data_hygiene_cleanup_internal();`.
  - Der bestehende Medication-Retention-Job blieb unverändert und aktiv.
  - Eine erste read-only ACL-Prüfung verwendete `PUBLIC` fälschlich als
    konkrete Rolle und wurde ohne Wirkung abgewiesen. Die korrigierte Prüfung
    über `aclexplode` bestätigte den vorgesehenen ACL-Vertrag.
- Separat freigegebener manueller Erstlauf:
  - Auswertungszeit: `2026-07-17T04:27:21.455685+00:00`.
  - Wiener Kalendertag: `2026-07-17`; Delivery-Cutoff: `2026-04-18`.
  - gelöschte Delivery-Zeilen: exakt `8`.
  - gelöschte alte deaktivierte Subscriptions: exakt `1`.
  - gelöschte eigene Cron-Run-Details: `0`.
  - erkannte zukünftige Delivery-Zeilen: `0`.
- Nachher-Nachweis:
  - `23` Delivery-Zeilen verbleiben; davon `0` alt und `0` zukünftig.
  - `5` Subscription-Zeilen verbleiben; alle `3` aktiven sind erhalten und
    `0` alte deaktivierte Zeilen verbleiben.
  - `recorded_cron_runs = 0` belegt, dass der Erstlauf manuell und nicht durch
    einen zwischenzeitlichen Cron-Lauf ausgeführt wurde.
  - Der neue partielle Index wurde bei den Nachweisen bereits verwendet.
- Advisor- und Contract Review:
  - Security Advisor zeigt weiterhin ausschließlich die bekannte, im Free-Plan
    nicht aktivierbare Leaked-Password-Protection-Warnung.
  - Performance Advisor zeigt weiterhin ausschließlich die sechs bekannten
    INFO-Hinweise zu bislang ungenutzten Indizes; der neue Hygiene-Index wird
    nicht als ungenutzt gemeldet.
  - RLS blieb auf beiden Push-Tabellen aktiv. Aktive Subscriptions,
    Medication-Retention und klinische Daten wurden nicht verändert.
  - Ergebnis und Löschzahlen entsprechen exakt dem freigegebenen Vertrag; es
    besteht kein offenes P0-/P1-Finding aus S5.13.

S5.13 Status: **DONE**.

### S5.14 - Gesamt-Code- und Contract Review

- Roadmap gegen Code, SQL, Live-Schema und Runtime-Ergebnisse prüfen.
- keine offenen P0-/P1-Findings.
- bekannte Watchlist einschließlich `DH-F14` explizit dokumentieren und keine
  exakt-einmalige Push-Garantie ableiten.

#### Ergebnisprotokoll S5.14

- Umsetzung / Untersuchung:
  - Der gesamte Roadmap-Scope wurde erneut gegen den realen Diff, die
    kanonischen SQL-Dateien, die abgeschlossenen S5-Nachweise und das produktive
    Supabase-Projekt geprüft.
  - `node --check` besteht für Profil, Hub und Root-Service-Worker.
  - `deno check` besteht für Monatsbericht und Incident-Push; `deno lint`
    besteht für beide Edge Functions sowie Request-Helper und Tests.
  - Alle vier dauerhaften Incident-Push-Request-Regressionstests bestehen.
  - `git diff --check` und Roadmap-Markdownlint sind grün.
- Code- und Consumer-Review:
  - Profil, Hub und Range-Bericht lesen die produktive Legacy-Spalte
    `user_profile.medications` nicht mehr und schreiben sie nicht.
  - Die verbleibenden `profile.medications`-Treffer in Hub, Assistant und Vision
    verarbeiten ausschließlich die abgeleitete strukturierte Projektion.
  - Der im CodeRabbit-Review vorgeschlagene Fallback auf den älteren
    `ctx.profile`-Snapshot bleibt bewusst verworfen: Er könnte bei einem
    aktuellen Lade-/Fehlerzustand eine veraltete Medication-Liste erneut
    übertragen und würde den Fehlerzustandsvertrag verletzen.
  - Die produktive Legacy-Spalte ist erwartungsgemäß noch vorhanden, bleibt
    aber eine ungenutzte Kompatibilitätsspalte bis zu einem separaten späteren
    Drop-Gate.
- Live-Schema- und Runtime-Review um `2026-07-17 04:35 UTC`:
  - `midas-monthly-report` ist als Version `47` und `midas-incident-push` als
    Version `17` aktiv; JWT-Verifikation bleibt bei beiden eingeschaltet.
  - Cleanup-Funktion und partieller Index existieren jeweils genau einmal.
  - Function-Owner, `SECURITY INVOKER`, `search_path`, Owner-Execute und
    App-Rollen-Revokes entsprechen dem SQL-Vertrag.
  - Genau ein aktiver Push-Hygiene-Job besitzt Owner, Datenbank, Schedule und
    Command des freigegebenen Vertrags. Der Medication-Retention-Job ist
    unverändert aktiv.
  - Es verbleiben `23` Deliveries, davon `0` strikt alte und `0` zukünftige,
    sowie `5` Subscriptions mit allen `3` aktiven und `0` exakt nach
    Timestamp-Cutoff alten deaktivierten Zeilen.
  - RLS bleibt auf beiden Push-Tabellen aktiv.
- Advisor-Review:
  - Security enthält nur die bekannte Free-Plan-Warnung zur deaktivierten
    [Leaked-Password-Protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
  - Performance enthält weiterhin nur die sechs bekannten INFO-Hinweise zu
    [bislang ungenutzten Indizes](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).
  - Der neue partielle Push-Hygiene-Index ist nicht Teil dieser Hinweise.
- Contract Review:
  - Produktive Löschwirkung, Retention-Grenzen, aktive Subscriptions,
    Medication-Quelle, Zeitoverride-Guard, Cron, ACL, RLS und Rollback-Grenzen
    stimmen mit Roadmap und QA überein.
  - `DH-F14` bleibt ausdrücklich deferred: Der erfolgreiche Cleanup verbessert
    Datenhygiene, garantiert aber keine exakt-einmalige Push-Zustellung bei
    parallelen Edge-Aufrufen.
  - `DH-F9` bleibt bis zum finalen Module-Overview-Sync in S6 offen.
- Findings und Korrekturen:
  - P2-Dokumentationsfinding: Die beiden neuen dauerhaften Request-Contract-
    Dateien fehlten im Handoff-Dateiscope.
  - Korrektur: `request-contract.ts` und `request-contract_test.ts` wurden in
    Metadaten und aktuellem Dateiscope ergänzt.
  - Kein Produktcode-Finding und kein offenes P0-/P1-Finding.
- Restrisiko:
  - `DH-F10` und `DH-F14` bleiben die bewusst abgegrenzten Watchlists.
  - Die reale PWA-Client-Aktualisierung erfolgt erst nach finalem Commit/Push;
    die erhaltene Legacy-Spalte verhindert bis dahin einen harten Altclient-
    Bruch.

S5.14 Status: **DONE**.

### S5.15 - Schritt-Abnahme und Commit-Entscheidung

- Bei offenen Source-of-Truth-Dokus: `noch nicht committen, S6 offen`.
- Technische Commit-Bereitschaft nur bei vollständig grünen Checks.
- Der produktive PWA-/GitHub-Pages-Rollout erfolgt erst mit dem finalen
  Commit/Push nach S6. Der lokale Service-Worker-Smoke ist S5-Pflicht; die reale
  Client-Aktualisierung wird nach dem Commit beobachtet und bleibt wegen der
  weiterhin vorhandenen Legacy-Spalte kein riskanter Sofort-Drop.

#### Ergebnisprotokoll S5.15

- Schritt-Abnahme:
  - Alle lokal möglichen Checks und alle freigegebenen Runtime-Gates sind
    bestanden.
  - Die produktive Löschwirkung stimmt exakt mit dem Zielvertrag überein.
  - Profil, Medication-Manager und der bereits geprüfte Range-Arztbericht
    verwenden denselben aktuellen strukturierten Medication-Stand.
  - Der optionale GitHub-Workflow-Smoke wurde nicht erneut ausgelöst. Das ist
    kein Blocker: Payload ohne `now`, Default-Request-Pfad, Remote-Dry-Run und
    historischer Ablehnungs-Guard sind bereits separat nachgewiesen; ein echter
    Push war für dieses Hygiene-Gate ausdrücklich nicht erforderlich.
- Commit-Entscheidung:
  - Der technische Scope ist commit-bereit.
  - Noch nicht committen: `DH-F9`, finale Module Overviews, QA-Abschluss,
    Owner-Verständnis und Archivierung werden erst in S6 geschlossen.
  - Commit und Push bleiben eine ausdrückliche Owner-Aktion nach S6.
- Nächster erlaubter Schritt:
  - S6 vollständig und deterministisch abarbeiten.

S5.15 Status: **DONE**.

S5 Status: **DONE**.

S5 Exit-Kriterium:

- Alle lokal möglichen Checks und freigegebenen Runtime-Gates sind bestanden.
- Produktive Löschwirkung stimmt exakt mit dem Zielvertrag überein.
- Profil und Arztbericht zeigen dieselbe aktuelle Medikation.

Das S5 Exit-Kriterium ist vollständig erfüllt.

## S6 - Doku-Sync, QA-Update und finaler Abschlussreview

Empfohlenes Modell / Reasoning: `GPT-5.6 Sol / High`.

### S6.1 - Module Overviews synchronisieren

- Profile: Medication ist abgeleitete Information aus dem Medication-Modell;
  Legacy-Spalte nicht mehr aktive Source of Truth.
- Medication: einzige aktive Source of Truth für aktuelle Medikamente.
- Reports/Doctor View: aktuelle Medikation kommt aus strukturierten Tabellen.
- Push: 90-Tage-Delivery-Retention, Disabled-Subscription-Retention,
  Zeitoverride-Guard und Cron-Vertrag.
- Assistant/Vision nur ändern, wenn ihr tatsächlicher Kontextvertrag betroffen
  war.

#### Ergebnisprotokoll S6.1

- Profile dokumentiert vier Medication-Zustände, Save ohne Legacy-Feld,
  strukturierte Projektion und die physisch erhaltene, aber inaktive
  Kompatibilitätsspalte.
- Medication dokumentiert sich als einzige aktive Source of Truth für Profil
  und Range-Arztbericht einschließlich fail-closed User-/Slot-Reads.
- Reports und Doctor View dokumentieren aktive Medication-Stammdaten und am
  Wiener Berichtstag gültige Slots statt Profil-Legacy-Medikation.
- Push dokumentiert Edge-Version `17`, den `now`-/`dry_run`-Guard, 90-Tage-
  Retention, ACL/Owner/Cron und die fehlende exakt-einmalige Garantie.
- Assistant und Hub wurden gezielt ergänzt, weil ihr realer Profilkontext
  betroffen ist. Bei Lade-/Fehlerzustand wird keine ältere Medication-Liste
  rekonstruiert. Eine separate Vision-Overview existiert nicht.

S6.1 Status: **DONE**.

### S6.2 - QA und SQL-HOW-TO synchronisieren

- alle tatsächlich bestandenen lokalen und produktiven Checks markieren.
- neue SQL-Datei, Reihenfolge, User-Gates und Cron-Wartung dokumentieren.
- keine nicht ausgeführten Smokes als bestanden darstellen.

#### Ergebnisprotokoll S6.2

- Phase P18 in `docs/QA_CHECKS.md` ist nach allen lokalen, Runtime-, Owner- und
  Dokumentations-Gates als `Completed 2026-07-17` abgeschlossen.
- `sql/HOW_TO.md` beschreibt weiterhin die korrekte bestehende/fresh
  Reihenfolge, den getrennten Medication-/Push-Cron-Vertrag, Owner-Gates,
  Cutoffs und Rückfallweg.
- Der optionale GitHub-Workflow-Smoke wurde korrekt nicht als neuer S5-Lauf
  behauptet; seine Nichtwiederholung ist in S5.15 begründet.

S6.2 Status: **DONE**.

### S6.3 - Legacy-Spalten-Follow-up dokumentieren

- produktive Spalte als ungenutzte Kompatibilitätsspalte kennzeichnen.
- späteres Drop-Gate mit Client-Rollout, Consumer-Scan und User-Freigabe
  dokumentieren.
- keinen automatischen Termin für den Drop vortäuschen.
- aktiven Root-Service-Worker-Rollout als Pflichtnachweis für ein späteres
  Drop-Gate festhalten.

#### Ergebnisprotokoll S6.3

- `user_profile.medications` bleibt produktiv physisch vorhanden, wird aber von
  Profil, Hub und Range-Bericht weder gelesen noch geschrieben.
- `sql/10_User_Profile_Ext.sql` legt die Spalte in Fresh-Setups nicht mehr an.
- Ein späterer physischer Drop benötigt weiterhin einen separaten Consumer-
  Scan, bewiesenen Client-/Service-Worker-Rollout und ausdrückliche
  Owner-Freigabe. Es gibt bewusst keinen automatischen Drop-Termin.

S6.3 Status: **DONE**.

### S6.4 - Owner-Verständnis auf Ist-Ergebnis korrigieren

- tatsächliche Werkzeuge, Deploy-Reihenfolge, Cutoffs und Cleanup-Zähler
  erklären.
- Abweichungen vom initialen Plan dokumentieren.
- klar erklären, warum klinische Daten behalten und technische Daten begrenzt
  wurden.

#### Ergebnisprotokoll S6.4 - Was sich künftig wie verhält

- Klinische `health_events` bleiben unbefristet, weil sie den langfristigen
  Gesundheitsverlauf und spätere Arztgrafiken tragen können. Diese Roadmap
  verändert oder verdichtet sie nicht.
- Push-Deliveries sind dagegen technische Dedupe-Belege. Nach mehr als 90
  Wiener Kalendertagen verlieren sie ihren Betriebsnutzen und werden
  automatisch gelöscht.
- Deaktivierte Push-Subscriptions werden erst nach mehr als 90 Tagen ohne
  Zustandsänderung entfernt. Aktive, junge oder reaktivierte Geräte bleiben
  geschützt.
- PostgreSQL-Cron ist hier passend, weil der Cleanup ausschließlich Daten in
  derselben Datenbank bewertet. Er benötigt weder GitHub-Verfügbarkeit noch
  HTTP, Function Secrets oder eine laufende App. GitHub Actions bleibt nur der
  ungenaue Taktgeber für fachliche Off-App-Push-Prüfungen.
- Medication-Retention und Push-Hygiene bleiben zwei getrennte Cron-Jobs, weil
  sie andere Tabellen, Fristen, Risiken und Rückfallwege besitzen.
- Der Edge-Zeitguard erlaubt historische Uhrzeiten nur im Dry-Run. Dadurch
  können Tests alte Situationen simulieren, aber niemals versehentlich einen
  echten historischen Push oder Delivery-Write auslösen.
- Aktuelle Medikation stammt nur aus den strukturierten Medication-Tabellen.
  Profil und Arztbericht zeigen daher denselben Stand; Lade-/Read-Fehler werden
  nicht als medizinische Leere ausgegeben.
- Der kontrollierte Erstlauf entfernte `8` alte Deliveries und `1` alte
  deaktivierte Subscription. `23` Deliveries, `5` Subscriptions und alle `3`
  aktiven Subscriptions blieben erhalten.
- Der Hygiene-Cleanup macht Push wartbarer, aber nicht exakt-einmalig. Das
  parallele Send-/Upsert-Fenster bleibt als `DH-F14` ein eigenes späteres
  Reliability-Projekt.

S6.4 Status: **DONE**.

### S6.5 - Finaler Contract Review

- Roadmap vs. Code.
- Roadmap vs. SQL und produktives Schema.
- Roadmap vs. Cron, ACL, RLS und Advisor.
- Roadmap vs. Module Overviews und QA.
- Profil vs. Medication-Manager vs. Arztbericht.
- Incident-Push vs. Delivery-Retention.
- README- und MIDAS-Guardrails.

#### Ergebnisprotokoll S6.5

- Roadmap, Code, SQL, produktives Schema, Cron, ACL, RLS, Edge-Status,
  Advisor-Baseline, QA und Module Overviews wurden gegeneinander geprüft.
- Profil, Medication-Manager und Range-Arztbericht verwenden denselben
  strukturierten Medication-Vertrag.
- Incident-Push-Zeitguard und Delivery-Retention bleiben getrennte, aber
  kompatible Schutzschichten.
- README-Guardrails bleiben erfüllt: kein Arzt-Ersatz, keine Diagnose, keine
  Änderung medizinischer Schwellen und keine Löschung klinischer Historie.
- Gezielt gescannte veraltete Aussagen zu Profil-Legacy-Medikation,
  Incident-Push-Version `16`, späterer Arztansicht und zu starker Dedupe-
  Garantie sind entfernt.
- Die älteren Module Overviews besitzen weiterhin bekannte globale
  Markdownlint-Altschulden. Diese Roadmap hat keine neue inhaltliche oder
  Whitespace-Altschuld erzeugt; `git diff --check` ist grün.

S6.5 Status: **DONE**.

### S6.6 - Findings-Korrektur und Abschluss-Abnahme

- keine offenen P0-/P1-Findings.
- P2-Findings behoben oder bewusst begründet abgegrenzt.
- `health_events` unverändert.
- aktive Push-Subscriptions unverändert.
- Medication-Slot-Retention unverändert.
- Legacy-Spalte nicht voreilig entfernt.
- `DH-F14` bleibt als separates Push-Reliability-Thema sichtbar und wird nicht
  durch den erfolgreichen Hygiene-Cleanup als geschlossen fehlklassifiziert.

#### Ergebnisprotokoll S6.6

- Kein offenes P0-/P1-Finding.
- `DH-F9` wurde durch den finalen Source-of-Truth-Sync geschlossen.
- Ein S6-Doku-Finding wurde korrigiert: Push Overview stand noch auf Edge-
  Version `16` und Profile/Reports beschrieben teilweise die Legacy-
  Medication-Quelle. Alle betroffenen Overviews verwenden nun den produktiven
  Vertrag.
- `health_events`, aktive Push-Subscriptions, Medication-Slot-Retention und die
  produktive Legacy-Kompatibilitätsspalte blieben unverändert.
- `DH-F10` und `DH-F14` bleiben bewusst deferred und sichtbar.

S6.6 Status: **DONE**.

### S6.7 - Commit-Empfehlung

- Commit-Scope erst aus dem realen Diff ableiten.
- Beispiel nur bei entsprechendem finalem Scope:

```text
refactor(data): add push retention and unify medication source
```

#### Ergebnisprotokoll S6.7

- Der reale Diff umfasst Medication-Source-of-Truth, Range-Bericht,
  Incident-Zeitguard, Push-Retention, dauerhafte Regressionstests und den
  vollständigen Doku-/QA-Sync.
- Finale Commit-Empfehlung:

```text
refactor(data): add push retention and unify medication source
```

S6.7 Status: **DONE**.

### S6.8 - Archiv-Entscheidung

- Roadmap erst bei vollständigem S6-Abschluss mit `(DONE)` markieren.
- Nach `docs/archive/` verschieben.
- Nicht ausgeführte produktive Gates verhindern den DONE-Status, sofern sie
  nicht bewusst aus dem finalen Scope entfernt wurden.
- Der erst durch den finalen Commit/Push ausgelöste PWA-Rollout wird als
  Post-Commit-Beobachtung und Pflichtnachweis eines späteren Spalten-Drop-Gates
  dokumentiert; er blockiert den aktuellen DONE-Status nicht, weil die
  produktive Kompatibilitätsspalte bestehen bleibt.

#### Ergebnisprotokoll S6.8

- Alle S1- bis S6-Verträge und alle freigegebenen produktiven Gates sind
  abgeschlossen.
- Der erst nach Commit/Push sichtbare PWA-Rollout bleibt Post-Commit-
  Beobachtung und späteres Pflichtgate für einen physischen Legacy-Spalten-
  Drop; er blockiert den aktuellen Abschluss nicht.
- Die Roadmap darf mit `(DONE)` nach `docs/archive/` verschoben werden.

S6.8 Status: **DONE**.

S6 Status: **DONE**.

S6 Exit-Kriterium:

- Code, SQL, Produktion, QA, Module Overviews und Owner-Verständnis beschreiben
  denselben finalen Vertrag.

Das S6 Exit-Kriterium ist vollständig erfüllt.

## Ergebnisprotokoll-Format

Jeder Hauptschritt und jeder S4-Substep verwendet:

```md
#### Ergebnisprotokoll [Schritt]

- Umsetzung / Untersuchung:
  - ...
- Contract Review:
  - ...
- Checks:
  - ...
- Findings:
  - ...
- Korrekturen:
  - ...
- Restrisiko:
  - ...
- Doku-Sync-Entscheidung:
  - ...
- Nächster erlaubter Schritt:
  - ...
```

## Check- und Review-Katalog

- `node --check app/modules/profile/index.js`
- `node --check app/modules/hub/index.js`, falls geändert.
- `node --check service-worker.js`, falls geändert.
- `deno check backend/supabase/functions/midas-monthly-report/index.ts`
- `deno check backend/supabase/functions/midas-incident-push/index.ts`
- gezielte `rg`-Scans auf `user_profile.medications` und
  `push_notification_deliveries`.
- `git diff --check`.
- lokaler Supabase-Fresh-Bootstrap und Zweitlauf.
- SQL-Fixtures in Transaktionen mit Rollback.
- Cron-, ACL-, RLS- und Index-Abfragen.
- Advisory-Lock- und Jobidentitäts-Negativtests in getrennten DB-Sessions.
- Supabase Security und Performance Advisor.
- Edge-Function Remote-Dry-Runs.
- Browser-/PWA-/Android-Smoke.
- Arztbericht-Sichtprüfung.
- optionaler CodeRabbit Review.
- finaler Doku-Contract-Review.

## User-Facing Copy Review

Pflichtpunkte:

- `Keine aktiven Medikamente` darf nur nach erfolgreichem leerem Read-Model
  erscheinen.
- `Medikation derzeit nicht verfügbar` oder ein gleichwertiger neutraler
  Zustand darf keinen medizinischen Leerstand behaupten.
- Arztbericht verwendet österreichische Schreibweise und lesbare
  Tagesabschnitte.
- Keine technischen Begriffe wie RPC, Cron, Retention oder Subscription im
  Arztbericht oder normalen Profilstatus.
- Cleanup erzeugt keine neue sichtbare Warnung, solange der Betrieb gesund ist.

## Abschlussregeln

- Roadmap erst nach S6 als abgeschlossen betrachten.
- Produktive Datenlöschung braucht unmittelbar vorher ein Owner Briefing.
- Ein lokaler SQL-Erfolg ist keine produktive Freigabe.
- Ein Deploy ist erst vollständig, wenn Remote-Status und passender Runtime-
  Smoke grün sind.
- Physischer Drop der Legacy-Profilspalte bleibt außerhalb dieses Abschlusses.
- Module Overviews sind finale Source of Truth.
- Archiv erst nach abgeschlossenem Contract Review.
