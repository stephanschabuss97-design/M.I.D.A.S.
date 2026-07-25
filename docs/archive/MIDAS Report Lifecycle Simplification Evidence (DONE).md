# MIDAS Report Lifecycle Simplification - Execution Evidence (DONE)

Diese Datei enthält nur kompakte technische Nachweise zur zugehörigen
Roadmap. Fachliche Entscheidungen stehen ausschließlich in der Roadmap.

## Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Zugehörige Roadmap | `docs/archive/MIDAS Report Lifecycle Simplification Roadmap (DONE).md` |
| Status | `DONE` |
| Erstellt am | `2026-07-25` |
| Letzter Stand | `2026-07-25, Cutover und Edge Version 50 PASS; T-6 owner-deferred` |
| Verantwortlicher Schritt | `S6 Abschluss` |
| Umgebungen | `lokal / disposable / produktiv read-only / produktiv write` |
| Archivziel | `docs/archive/MIDAS Report Lifecycle Simplification Evidence (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Nachweisvertrag

- Diese Datei beweist:
  - Report-Zähler und Cutover-Preconditions.
  - lokale und disposable Code-/SQL-Verträge.
  - einzeln freigegebene produktive Workflow-, Deploy-, SQL-, Report- und
    Secret-Aktionen.
  - exakte Postconditions des Range-only-Singletons.
- Diese Datei beweist nicht:
  - medizinische Richtigkeit des Reportinhalts.
  - Wiederherstellbarkeit gelöschter Zeilen ohne das geprüfte Recovery-Bundle
    und seinen geschützten Report-Extrakt.
  - Zuverlässigkeit anderer GitHub-Workflows oder Edge Functions.
- Source of Truth für fachliche Entscheidungen:
  - Entscheidungslog der zugehörigen Roadmap.
- Verbotene Inhalte:
  - Secrets, vollständige JWTs, personenbezogene Reporttexte,
    Gesundheits-Rohdaten und unnötige Terminal-Dumps.

## Baseline

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Umgebung | Beobachtung | Ergebnis |
| --- | --- | --- | --- |
| EV-B01 | lokal | UI/API erzeugen Monthly und Range; Edge persistiert Monthly per Monats-Update und Range per Insert; Workflow und Recovery rekonstruieren Monthly | PASS |
| EV-B02 | produktiv read-only | Monthly `7`/ein User; Range `0`; gültig/korrupt/zukünftig jeweils `0`; kein Canonical; potenzielles Cleanup `7` Monthly und `0` Range | PASS |
| EV-B03 | produktiv read-only | PostgreSQL 17.6; RLS aktiv; Owner-Policies und erwartete Grants vorhanden; kein Report-Singleton-Index; Edge Version 47 aktiv/JWT-geschützt | PASS |
| EV-B04 | GitHub/Supabase read-only | Monthly-Workflow aktiv; letzte fünf Scheduler-Jobs endeten prozessseitig erfolgreich, beweisen wegen `curl -sS` ohne Fail-Flag aber keinen HTTP-2xx; nächster nomineller Lauf `2026-08-01 01:00 UTC`; relevante Secret-Namen exklusiv zugeordnet | PASS |
| EV-B05 | produktiv read-only | `health_events`: 283 Zeilen, davon 7 Reportzeilen; Heap 64 kB, Indexe 240 kB, Gesamtgröße 496 kB; `pgcrypto` 1.3 verfügbar | PASS |
| EV-B06 | GitHub read-only | Workflow-ID `222635705`, Remote-State `active`, aktuell `0` queued und `0` in-progress Runs | PASS |
| EV-RDY01 | lokal/read-only | S4-Dateieigentum, Keep-/Remove-Grenze, fokussierte Deno-/SQL-Testartefakte, vier Ausführungsblöcke, Invalidation und S5-Grenze vollständig zugeordnet; keine produktive Wirkung | PASS |

<!-- markdownlint-enable MD013 -->

## Lokale und Disposable Nachweise

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Schritt | Check | Erwartung | Ergebnis | Status |
| --- | --- | --- | --- | --- | --- |
| EV-L01 | S4/S5 | Syntax, Lint, Altpfadscan und Diff | keine Fehler oder tote Monthly-Pfade | T-12: Node `10/10`; Deno Check/Lint/Format grün; Monthly-Workflow lokal entfernt; drei unabhängige Workflows erhalten; Roadmap/Evidence ohne Markdownlint-Finding; `git diff --check` grün. | PASS |
| EV-L02 | S4.2/S5 | Edge-Contract-Tests | Range-only, User-Scope, Zeitfelder, Fehlererhalt, Singleton und begrenzter Concurrency-Retry grün | Post-Review: Deno `22/22`; zusätzlich Update-Nichttreffer, 400-Tage-Grenze, Wiener Tagesgrenze und öffentliche Fehlergrenze grün; Check/Lint/Format PASS. | PASS |
| EV-L03 | S4.3/S5 | Disposable PostgreSQL-Fixtures | Strict Canonical, Lock/Drift, Cleanup, Transaktionsrollback, exakter Index, RLS/ACL und Zweitlauf grün | T-12: isolierte PostgreSQL-17-Fixture Exit `0`/`PASS`; Zero-State, Monthly-only, Duplikatabbruch, synthetische Ownership-Isolation, Invaliddaten, Tie-Break, Drift, erzwungener Rollback, Index-Scope, RLS/ACL/Nicht-Report-Erhalt und Zweitlauf grün. | PASS |
| EV-L04 | S4.1/S4.5/S5 | Browser-/DOM-Smoke | Permanente Current-/Zero-State-Fläche ohne sichtbares Berichte-Overlay, Monthly oder Archiv | Owner bestätigte am Live Server Anmeldung, Doctor View, aktuellen Bericht, Neuer-Bericht-Flow, Einzelwerte, Verlauf und Health Export V2. Exportdatei als valides `midas.health-export.v2` geparst. | PASS |

<!-- markdownlint-enable MD013 -->

## Produktiver Read-only Preflight

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Prüfung | Ergebnis | Blocker |
| --- | --- | --- | --- |
| EV-PRE01 | Bestand, Report-Inventar, Nicht-Report-Fingerprint, Canonical-ID und exakte Löschmengen | Sieben Monthly-, null Range-Berichte; Canonical-Auswahl und Löschmengen eindeutig; Nicht-Report-Fingerprint vor dem Cutover geschützt erfasst | keiner |
| EV-PRE02 | Schema, RLS, ACL, Index und Advisor | RLS, vier Owner-Policies und explizite ACL vorhanden; Singleton-Index vor Cutover nicht vorhanden; bekannte planbedingte Auth-Warnung | keiner |
| EV-PRE03 | Edge-Version, Workflow und Secret-Verwendungen | Edge 47 aktiv/JWT-geschützt; Monthly-Workflow aktiv und ohne aktive Runs; exklusive und gemeinsam genutzte Secret-Namen getrennt | keiner |

<!-- markdownlint-enable MD013 -->

Preflight-Entscheidung:

- Erwartete Wirkung:
  - Nach aktueller Baseline werden sieben Monthly-Zeilen und keine
    Range-Duplikate gelöscht; die Zähler werden unmittelbar vor dem Cutover
    erneut erhoben.
  - Genau ein partieller Unique-Index wird angelegt.
- Geschützte Daten:
  - Alle Nicht-Report-Zeilen in `health_events`.
  - Medication, Trendpilot, Profil, Appointments und Push.
  - Gemeinsam genutzte Secrets und andere Workflows.
- Stop-Bedingung:
  - Zähler, ID-/Hash-Inventar, Nicht-Report-Fingerprint, Canonical-Auswahl,
    User-Scope, Schema oder Workflow-Zustand weichen vom freigegebenen Briefing
    ab.
- Owner Briefing:
  - `G-1` bis `G-6`, jeweils separat.
- Freigabe:
  - Owner-Freigaben `G-1` bis `G-6` erteilt. `G-1/T-6` wurde nach dem
    fehlgeschlagenen Archivtest bewusst auf einen separaten Termin verschoben.

## Produktive Aktionen

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Aktion | Freigabe | Wirkung | Ergebnis | Status |
| --- | --- | --- | --- | --- | --- |
| EV-W01 | Frisches RB-006-Bundle samt Report-Extrakt, Rollback-Inventar und Prüfsummen erzeugen | erteilt, danach Owner-Deferred | read-only DB; ACL-geschütztes Staging und Rollback-Kontext vorhanden; neues verschlüsseltes Archiv nicht abgeschlossen | Vorheriges Archiv samt Sidecar gültig; aktuelles Staging geschützt erhalten; temporärer Helper entfernt | DEFERRED |
| EV-W02 | Monthly-Workflow remote deaktivieren und aktive Runs ausschließen | erteilt | keine weiteren Scheduler-Runs; Report-Inventar unverändert | Remote `disabled_manually`; queued/in-progress jeweils null; Inventar unverändert | PASS |
| EV-R01 | Range-only-Edge deployen | erteilt | produktiver Report-Endpoint geändert | Edge aktiv, JWT-geschützt und write-frei über OPTIONS, fehlende Auth und Service-Role-Ablehnung geprüft | PASS |
| EV-W03 | Inventar unter Write-Lock revalidieren; Transition-Cleanup und regulären Unique-Index atomar ausführen | erteilt | Reportzeilen gelöscht, Schema ergänzt | Monthly null, Range-Singleton und exakter Index atomar verifiziert; Nicht-Reports unverändert | PASS |
| EV-W04 | Bei Zero-State Arzt-Bericht anlegen und anschließend dieselbe Zeile ersetzen | erteilt | genau eine Range-Zeile mit stabiler ID | Owner-Smoke erzeugte und ersetzte dieselbe Zeile; ID/Erstzeit stabil, Inhalt/Erzeugungszeit aktualisiert | PASS |
| EV-W05 | Tote Monthly-Secret-Namen entfernen | erteilt | GitHub-/Supabase-Konfiguration bereinigt | Nur `REPORTS_URL` und `MONTHLY_REPORT_USER_ID` entfernt; Shared Secrets erhalten | PASS |

<!-- markdownlint-enable MD013 -->

## Vorher-/Nachher-Nachweis

<!-- markdownlint-disable MD013 -->

| Objekt / Postcondition | Vorher | Erwartet | Nachher | Status |
| --- | --- | --- | --- | --- |
| `monthly_report`-Zeilen | `7` | `0` | `0` | PASS |
| `range_report` für den produktiven Owner | `0` | `0..1` | `1` | PASS |
| Singleton-Index | nicht vorhanden | vorhanden und gültig | exakt, eindeutig, gültig und bereit | PASS |
| Monthly-Workflow remote | aktiv | deaktiviert/nicht vorhanden | `disabled_manually` | PASS |
| `MONTHLY_REPORT_USER_ID` | vorhanden | entfernt | entfernt | PASS |
| `REPORTS_URL` | vorhanden | entfernt | entfernt | PASS |
| gemeinsam genutzte Secrets | vorhanden und mehrfach verwendet | unverändert | vorhanden | PASS |
| Monthly-Runs `queued`/`in_progress` | `0`/`0` | `0`/`0` | `0`/`0` | PASS |
| Nicht-Report-Fingerprint | vor Cutover geschützt erhoben | unverändert | unverändert | PASS |

<!-- markdownlint-enable MD013 -->

Geschützte Negativnachweise:

- Count und DB-seitiger Fingerprint aller Nicht-Report-Zeilen in
  `health_events` sind unverändert; keine Rohdaten werden in Evidence kopiert.
- Kein anderer GitHub-Workflow wurde deaktiviert.
- `SUPABASE_SERVICE_ROLE_KEY` wurde nicht entfernt.
- Privilegierte Edge-Reads/Writes waren auf die authentifizierte `user_id`
  begrenzt.
- Fehler-Smoke verändert den gültigen Arzt-Bericht nicht.

## Deploy- und Runtime-Nachweise

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Ziel | Version / Run-ID | Smoke | Schreibwirkung | Status |
| --- | --- | --- | --- | --- | --- |
| EV-R01 | `midas-monthly-report` | Version 49 beim Cutover | OPTIONS 200; ohne Auth 401; Service Role 403; drei Produktionsdateien waren vor dem CodeRabbit-Nachlauf remote/lokal hashgleich | nein | PASS |
| EV-R02 | Report-Lifecycle | produktiver Singleton | Zero-State-Create, Replacement, stabile ID/created_at, Count und Failure Preserve | ja | PASS |
| EV-R03 | `midas-monthly-report` | Version 50 | OPTIONS 200; ohne Auth 401; Service Role 403; drei Produktionsdateien remote/lokal SHA-256-identisch | nein | PASS |
| EV-F01 | Gesamtvertrag | S6 Final Review | Advisor, Datenbank, Workflow, Secrets, Browser, Edge und lokale/disposable Checks grün; EV-W01 bewusst deferred | nein | PASS* |

<!-- markdownlint-enable MD013 -->

## Findings und Korrekturen

<!-- markdownlint-disable MD013 -->

| Finding | Nachweis | Korrektur | Wiederholter Check | Status |
| --- | --- | --- | --- | --- |
| S1-F1: Produktiver Bestand besitzt keinen Range-Bericht; ein einzelner Replacement-Smoke würde nur Insert prüfen. | EV-B02 | T-10/EV-W04 auf kontrollierte Erstanlage plus Replacement mit stabiler ID erweitert. | Roadmap-/Evidence-Contract Review | PASS |
| S2-F1: `0..1`-Singleton und sichtbares Berichte-/Inbox-Archiv standen noch nebeneinander. | S2/D-17 | Eigenständige Reportebene entfernt; permanente Hauptfläche zeigt Current oder verifizierten Zero-State. | S2 Full Contract Review | PASS |
| S2-F2: In-place-Replacement hatte keinen eindeutigen Vertrag für `created_at` und `generated_at`. | S2/D-18 | Erstmalige Erzeugung bleibt erhalten; aktuelle Neuberechnung und sichtbare Zeit verwenden `generated_at`. | S2 Full Contract Review | PASS |
| S2-F3: Stabiler Endpoint konnte fälschlich als Kompatibilität für Monthly-Defaults verstanden werden. | S2/D-19 | Nur Endpointname bleibt; Request und Client werden explizit Range-only. | S2 Full Contract Review | PASS |
| S3-F1: Workflow-Disable beweist nicht, dass ein bereits gestarteter oder gequeueter Run beendet ist. | EV-B06/D-24 | G-2 verlangt Remote-Disable, null aktive Runs und erneuten Inventarvergleich. | S3 Full Contract Review | PASS |
| S3-F2: Read-only Preflight und Cleanup konnten zwischenzeitlich driften. | EV-B05/D-22/D-23 | Snapshot-Inventar wird in kurzer Transaktion unter Write-Lock vor dem Delete erneut geprüft. | S3 Full Contract Review | PASS |
| S3-F3: Isolierte Rollbacks konnten alte Edge und neuen Singleton-Index mischen. | D-25 | Geschütztes Rollback-Inventar und gekoppelte Wiederherstellungsreihenfolge ergänzt. | S3 Full Contract Review | PASS |
| S3-F4: Count-only hätte Updates an Nicht-Report-Zeilen übersehen. | D-27 | Vorher-/Nachher-Vertrag auf Count plus DB-seitigen Fingerprint erweitert. | S3 Full Contract Review | PASS |
| S3-F5: `IF NOT EXISTS` könnte einen gleichnamigen falschen Index verdecken. | D-26 | Exakte Katalogprüfung von Name, Unique-Flag, Schlüssel und Prädikat vorgeschrieben. | S3 Full Contract Review | PASS |
| S3-F6: GitHub-Run `success` wurde zu stark als erfolgreicher Endpoint-Aufruf gelesen. | EV-B04 | Nachweis auf Shell-Prozess begrenzt; Produktiv-Smokes prüfen HTTP-Vertrag separat. | S3 Full Contract Review | PASS |
| S4R-F1: Hub-API und gemeinsam genutzte System-Comment-Consumer fehlten in der UI-Dateigrenze. | EV-RDY01/F-19 | Exakte Keep-/Remove-Liste ergänzt; S4.1 auf Full Review angehoben. | S4R Full Contract Review | PASS |
| S4R-F2: „Fokussierte Deno-Tests“ benannte weder Testseam noch Dateien. | EV-RDY01/F-20 | Env-freie Request-/Lifecycle-Module und zugehörige Deno-Tests festgelegt. | S4R Full Contract Review | PASS |
| S4R-F3: S4.4 und S6 beanspruchten dieselben Dokumente. | EV-RDY01/F-21 | S4.4 auf Workflow-/Recovery-Source begrenzt; Produkt-, QA- und Runtime-Sync S6 zugeordnet. | S4R Full Contract Review | PASS |
| S4R-F4: Der Hauptbericht teilt Renderer-CSS mit dem zu löschenden Archiv. | EV-RDY01/F-22 | Archivselektoren werden selektiv entfernt; Hauptreport-Stile und Responsive-Smoke bleiben Pflicht. | S4R Full Contract Review | PASS |
| S4R-F5: Der erste S4.2-Vertrag nannte die Generated Column `health_events.day` als direktes Updatefeld. | EV-RDY01/F-23 | Nur `ts` wird geschrieben; der daraus abgeleitete Wiener Tag wird anschließend geprüft. | S4R Full Contract Review | PASS |
| S4.1-F1: Archivexklusive Tag-/Gruppenklassen lagen zusätzlich in `app/styles/utilities.css`, das im Readiness-Ownership fehlte. | EV-L01 | Datei in den S4.1-Scope aufgenommen, tote Klassen entfernt und globalen Altpfadscan wiederholt. | S4.1 Full Code/Contract Review | PASS |
| S4.2-F1: BP-Leertext und Aktivitätsanalyse enthielten noch tote Monats-/Vormonatssemantik. | EV-L01/EV-L02 | Beide Pfade auf reinen Zeitraumvertrag reduziert; globaler Monthly-Altpfadscan wiederholt. | S4.2 Full Code/Contract Review | PASS |
| S4.2-F2: Deno meldete eine unsichere Supabase-Typkonvertierung und drei `require-await`-Lintfehler in Test-Mocks. | EV-L01 | Typgrenze explizit gemacht, Mocks auf echte Promise-Rückgaben umgestellt; Check/Lint/Format erneut grün. | S4.2 Full Code/Contract Review | PASS |
| S4.2-F3: Build-before-write war im Adapter angeordnet, aber nicht durch einen fokussierten Negativtest belegt. | EV-L02/F-20 | Produktiv verwendete Build-/Persist-Orchestrierung extrahiert; Build-Fehler-Test beweist null Repository-Zugriffe. | S4.2 Full Code/Contract Review | PASS |
| S4.3-F1: `pg_catalog.coalesce(...)` ist keine gültige Qualifizierung der PostgreSQL-Spezialsyntax. | EV-L03/F-24 | Alle betroffenen Transition-/Fixture-Stellen auf `coalesce(...)` korrigiert. | PostgreSQL-17-Fixture erneut Exit `0`/`PASS` | PASS |
| S4.3-F2: Das Fixture verwendete den produktiven Inventar-Helper vor seiner Erzeugung; `NULL`-Subtypen konnten aus dem Nicht-Report-Fingerprint fallen. | EV-L03/F-25 | Unabhängigen Fixture-Oracle ergänzt und Report-Klassifikation mit `coalesce(..., false)` nullsicher gemacht. | Drift-, Rollback- und Nicht-Report-Erhalt erneut grün | PASS |
| S4.3-F3: Die Transition verließ sich für Schemafehler auf spätere SQL-Fehler und fixierte keine Fingerprint-Zeitzone. | EV-L03/F-26 | Frühen RLS-/Spaltenvertrag sowie `SET LOCAL timezone = 'UTC'` ergänzt. | Vollständiges Fixture und Lock-Test erneut grün | PASS |
| S4.3-F4: Fresh-Setup-Duplikatabbruch und Monthly-only waren nicht als eigene Fixture-Phasen belegt. | EV-L03/F-27 | Beide Pfade mit expliziten Postconditions ergänzt. | Beide Fixture-Phasen PASS | PASS |
| S4.3-F5: Per-User-Formulierungen konnten fälschlich als Multi-User-Produktvertrag gelesen werden. | D-29/F-28 | Produktvertrag auf genau einen MIDAS-Nutzer präzisiert; `user_id` und synthetische Owner-IDs ausschließlich als technische Sicherheits- beziehungsweise Testgrenzen dokumentiert. | Root-README und S4.3-Artefakte gegengeprüft | PASS |
| S4.4-F1: Der erste Recovery-Text definierte weder die kanonische JSONL-Zeile und ihren Hash noch eindeutig die Pflichtgrenze regulärer Bundles. | D-30/F-29 | Exakten `jsonb_build_object(...)::text`-Vertrag, ID-Sortierung, Zeilenhash, `day`-Prüfung und Cutover-only-Pflicht ergänzt. | Runbook-Contract Review und Markdownlint | PASS |
| S4.5-F1: Der Edge-Catch gab interne Datenbank-, Build- und Lifecycle-Fehler als HTTP `400` aus. | F-30/EV-L02 | Statusauflösung extrahiert: nur Requestfehler bleiben `4xx`, alle internen Fehler werden `500`; fokussierten Test ergänzt. | Deno Check/Lint/Format und `22/22` Tests | PASS |
| S5-F1: Der dokumentierte `Read-Host`-/stdin-Pfad übergab das Archivkennwort an 7-Zip nicht reproduzierbar; ein nachfolgender Helper wertete zusätzlich erfolgreichen 7-Zip-Output fälschlich als Fehler. | EV-W01/F-31 | Runbook auf direkte interaktive 7-Zip-Prompts umgestellt. Kein ungeprüftes Archiv als PASS gewertet; aktuelles Staging geschützt erhalten und Abschluss durch Owner verschoben. | Runbook-Contract Review; neuer Archivtest bewusst nicht ausgeführt | DEFERRED |
| S5-F2: Der finale Remote-Stand war nach dem letzten Deploy inzwischen Edge Version 49 statt der früher notierten 48. | EV-R01 | Remote-Version neu erhoben und alle drei Produktionsdateien gegen lokal verglichen. | Dateinamen und SHA-256 pro Produktionsdatei identisch | PASS |
| S5-F3: CodeRabbit fand nach dem produktiven Cutover einen möglichen Update-Nichttreffer, interne `500`-Details und einen unbegrenzten Request-Zeitraum. | F-32/EV-L02/EV-R03 | `maybeSingle()` plus expliziter Lifecycle-Fehler, generische öffentliche `500`-Meldung und inklusive 400-Tage-Grenze ergänzt. | Deno `22/22`, Check/Lint/Format und Edge Version 50 Runtime PASS | PASS |

<!-- markdownlint-enable MD013 -->

## Finaler Evidence-Digest

- Gültige Nachweise:
  - `EV-L01` bis `EV-L04`, `EV-PRE01` bis `EV-PRE03`, `EV-W02` bis
    `EV-W05`, `EV-R01` bis `EV-R03` und `EV-F01`.
- Exakte produktive Wirkung:
  - sieben Monthly-Zeilen entfernt, genau einen Range-Bericht etabliert,
    partiellen Singleton-Index angelegt, Monthly-Workflow deaktiviert, Edge
    aktualisiert und zwei tote Monthly-Secrets entfernt.
- Nicht ausgeführte Nachweise:
  - `EV-W01` besitzt keinen neuen verschlüsselten Archiv- und `7z t`-Nachweis.
- Restrisiken:
  - `W-1` technischer Legacy-Endpunktname.
  - `F-31` aktuelles Recovery-Staging noch nicht als neues Archiv getestet.
- Roadmap-Verweise:
  - `S5` und `S6`.

Abschlussregeln:

- Evidence ist nach finalem S6-Abgleich auf `DONE` gesetzt.
- Keine produktive Aktion teilt ihre Freigabe mit einer anderen Evidence-ID.
- Bei Widerspruch wird der reale Iststand erneut geprüft und Roadmap sowie
  Evidence gemeinsam korrigiert.
