# MIDAS Doctor View Report-First Modernization Roadmap (DONE)

Kompakter Produkt- und Arbeitsvertrag nach
`docs/templates/MIDAS Roadmap Workflow Contract.md`.

---

## Roadmap-Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Status | `DONE` |
| Modul / Bereich | `Doctor View / Reports / Charts / JSON Export` |
| Owner / Kontext | `Stephan; persönliche CKD-Langzeitakte und Arztgespräch` |
| Erstellt am | `2026-07-22` |
| Letzter Stand | `2026-07-25, S1-S6 PASS; Edge Version 50 produktiv und remote/lokal hashgleich` |
| Aktueller Schritt | `abgeschlossen und archiviert` |
| Risikoklasse | `R2` |
| Standard-Reviewtiefe | `Consumer`, an Integrationsgates `Full` |
| Owner-Erklärmodus | `Briefing + S6-Recap` |
| Betroffene Hauptdateien | `index.html`; Doctor-/Reports-/Charts-/Hub-Module; Doctor-/Chart-CSS; Report-APIs; `assets/js/main.js` |
| Deploy relevant | `ja, midas-monthly-report Version 50 produktiv verifiziert` |
| Produktive Schreibwirkung | `ja, nur owner-gated Report-Smoke in S5` |
| Workflow-Vertrag | `docs/templates/MIDAS Roadmap Workflow Contract.md` |
| Evidence-Datei | `nicht erforderlich` |
| Archivziel | `docs/archive/MIDAS Doctor View Report-First Modernization Roadmap (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Session Resume Card

- Ziel:
  - Die Doctor View wird zur ruhigen report-zentrierten Konsultationsansicht.
- Unveränderliche Verträge:
  - Arzt-Bericht primär; Verlauf und Einzelwerte sekundär verfügbar.
  - Keine Änderung an medizinischer Logik, Schema, RLS oder Edge Function.
  - Berichtserzeugung bleibt explizit.
  - Der alte Archivvertrag ist durch die aktive Report-Lifecycle-Roadmap
    superseded; diese Roadmap ändert Backend und Datenbestand nicht selbst.
  - JSON-Export bleibt sichtbarer manueller Fallback.
  - Der Export erhält einen versionierten, atomaren und maschinenlesbaren
    Health-Export-V2-Vertrag ohne erfundene Messzeitpunkte oder Owner-IDs.
  - Alle Pfade bleiben durch den Doctor-Unlock geschützt.
- Erledigter Stand:
  - Read-only Deep Dive und Produktabstimmung abgeschlossen.
  - Zwei initiale Contract Reviews abgeschlossen; Roadmap korrigiert.
  - S1-Systemkarte, Producer-/Consumer-Kette, Zustände und QA-Bezug belegt.
  - S2-Zielvertrag für Hierarchie, Latest, Zustände, Zeiträume und Export belegt.
  - S3-Risiken, Rollback, Stop-Vertrag, S4-Schnitt und Pflichtchecks finalisiert.
  - S4 Readiness Review mit exakten Dateien und fünf Arbeitsblöcken: `PASS`.
  - Export-V2-Follow-up gegen realen JSON-Export und künftigen MCP-Bedarf:
    `PASS`; S4.7 erweitert, MCP und Labor-PDF-Ingest bleiben deferred.
  - S4.1: vollständige Reportnormalisierung, additive Pagination und
    deterministische Latest-Auswahl implementiert; Full Review `PASS`.
  - S4.2: Report-first-Shell, getrennte Datenzustände, lazy 20er-Archiv,
    Lifecycle-Reset und fail-closed Unlock implementiert; Full Review `PASS`.
  - S4.3: expliziter Bereichsbericht mit sicheren Defaults, Clientvalidierung,
    In-flight-Schutz und gezielter Invalidierung implementiert; Full Review
    `PASS`.
  - S4.4: `Anwenden` entfernt; gültige Datumsänderungen laden Live-Daten sofort.
    Request-Version, DOM-Zeitraum und gebundene Fehlerzustände sichern
    Latest-request-wins; Full Review `PASS`.
  - S4.5: BP, Körper, Labor, Training und Trendpilot laden erst beim Öffnen der
    Einzelwerte; Bereichscache, Fehlerzustände und Lifecycle-Clear sind belegt.
  - S4.6: Verlauf übernimmt einen unveränderlichen aktiven Zeitraum-Snapshot,
    startet mit BP und verwirft veraltete Draws sowie Snapshots beim Schließen.
  - S4.7: Der Legacy-Mischexport ist durch den atomaren, deterministischen
    `midas.health-export.v2` ohne synthetische Messzeitpunkte und Owner-ID
    ersetzt.
  - S4.8: Report, Archiv, Details und Verlauf sind auf Mobile, Tablet und
    Desktop überlappungsarm, einspaltig und semantisch konsistent; Fokus-,
    Tastatur- und deutsche Copy-Verträge sind umgesetzt.
  - S4.9: Gesamtdiff gegen `D-1` bis `D-15` und `F-1` bis `F-14` geprüft;
    Layout-, Fokus-Trap-, XSS-, Zustands- und Wartungsfindings korrigiert.
  - S5 T-1 bis T-8: lokale, isolierte, Browser-, Responsive- und
    Health-Export-V2-Prüfungen `PASS`.
  - Das Report-Lifecycle-Follow-up entfernte Monthly und Archiv, etablierte
    produktiv den Range-Singleton und ersetzte den aktuellen Bericht in-place.
  - S5 T-9: Zukunftsvalidierung, Replacement, stabile ID und exakt ein
    aktueller `range_report` sind `PASS`.
  - S5 T-10: CodeRabbit-Findings bewertet; bestätigte Backend-, Paging-,
    Export-, Fehler-, Guard- und Responsive-Findings korrigiert. Der
    vorgeschlagene Live-Abgleich des offenen Charts wurde verworfen, weil er
    den unveränderlichen S4.6-Zeitraum-Snapshot gebrochen hätte.
  - Nachlaufchecks: Deno `22/22`, Check/Lint/Format, Node `10/10`,
    fokussierte Paging-/Range-/Refresh-Harnesses und `git diff --check` grün.
  - Edge Version 50 produktiv deployed; JWT-Schutz, OPTIONS-, Auth- und
    Service-Role-Grenzen sowie Remote-/Local-Hashgleichheit `PASS`.
  - S6-Source-of-Truth-Sync, QA-Verträge, Changelog und Full Contract Review
    abgeschlossen.
- Aktueller Schritt:
  - abgeschlossen.
- Nächster erlaubter Schritt:
  - keine weitere Aktion in dieser Roadmap.
- Offene Findings:
  - Kein offenes In-Scope-Finding; `W-1` bis `W-3` bleiben deferred.
- Geänderte Dateien:
  - `app/supabase/api/select.js`.
  - `app/supabase/api/system-comments.js`.
  - `app/supabase/api/reports.js`.
  - `app/modules/doctor-stack/reports/index.js`.
  - `app/modules/doctor-stack/doctor/index.js`.
  - `app/modules/doctor-stack/charts/index.js`.
  - `app/modules/hub/index.js`.
  - `app/supabase/auth/core.js`.
  - `app/supabase/auth/guard.js`.
  - `app/styles/doctor.css`.
  - `assets/js/main.js`.
  - `backend/supabase/functions/midas-monthly-report/index.ts`.
  - `backend/supabase/functions/midas-monthly-report/report-lifecycle.ts`.
  - `backend/supabase/functions/midas-monthly-report/report-lifecycle_test.ts`.
  - `backend/supabase/functions/midas-monthly-report/request-contract.ts`.
  - `backend/supabase/functions/midas-monthly-report/request-contract_test.ts`.
  - `index.html`.
  - diese Roadmap.
- Gültige Nachweise:
  - S4.1-Syntax-, Normalisierungs-, Paging-, Latest-, Kompatibilitäts- und
    Fehlerfortpflanzungschecks grün; Full Review `PASS`.
  - S4.2-S4.3-Syntax-, DOM-, Renderer-, Validierungs-, Pagination-, Lifecycle-,
    In-flight- und Responsive-Checks grün; gemeinsamer Full Review `PASS`.
  - S4.4-Syntax-, DOM-, Listener-, Validierungs-, Fehlerbindungs- und
    Latest-request-wins-Checks grün; Full Review `PASS`.
  - S4.5-S4.7-Syntax-, Lazy-State-, Chart-Snapshot-, Export-V2-, All-or-error-,
    DOM-ID- und Diff-Hygienechecks grün; gemeinsamer Full Review `PASS`.
  - S4.8-S4.9-Syntax-, DOM-ID-, ARIA-Ziel-, responsive Struktur-, Fokus-,
    Tastatur-, Encoding-, Markdownlint- und Diff-Hygienechecks grün;
    integrierter Full Review `PASS`.
  - Owner-Smokes: Live-Zeitraum-Sync und realer Health Export V2 gegen
    produktive Daten `PASS`; vollständige Randzustands- und Viewportmatrix
    folgt in S5.
- Runtime-/Deploy-Stand:
  - Doctor-View-Frontend benötigt keinen separaten Deploy in dieser Roadmap.
  - Produktiv aktiv ist Edge Version 50 mit
    `monthly_report = 0`, `range_report = 1` und gültigem Singleton-Index.
  - `index.ts`, `request-contract.ts` und `report-lifecycle.ts` sind
    remote/lokal SHA-256-identisch.
- Offene Owner-Freigaben:
  - keine.
- Stop-Bedingungen:
  - keine aktive Stop-Bedingung.

## Zielvertrag

- Nach dem Entsperren erscheint unmittelbar der neueste gültige
  `range_report`, nicht die Rohwertliste.
- Neuester Bericht bedeutet größtes gültiges `period.to`; bei Gleichstand
  entscheidet die neueste aktuelle Erzeugungszeit. Monatsberichte sind nie
  primär.
- Ohne Bereichsbericht erscheint ein ruhiger Leerzustand mit
  `Arzt-Bericht erstellen`.
- Gespeicherte Reportperiode und Erstellungszeit bleiben unveränderliche
  Anzeige. Editierbare Datumsfelder gibt es nur in Erzeugung oder Live-Details.
- `Neuer Bericht` schlägt `letztes period.to -> heute` vor, bleibt editierbar
  und schreibt erst nach expliziter Bestätigung.
- Das in S4 umgesetzte lazy Archiv ist ein temporärer Zwischenstand. Die aktive
  Report-Lifecycle-Roadmap ersetzt es durch genau einen aktuellen
  Arzt-Bericht, entfernt Monatsberichte und den sichtbaren
  `Berichte`-/Inbox-Einstieg vollständig.
- `Weitere Daten` erschließt Verlauf und Einzelwerte als sekundären Kontext.
- Verlauf bleibt ein fokussiertes Vollbild-Overlay mit BP als Default,
  Körper-Umschaltung und aktivem Zeitraum; er wird nicht eingebettet.
- Einzelwerte für BP, Körper, Labor und Training werden erst beim Öffnen geladen.
- Gültige Datumsänderungen synchronisieren Live-Details sofort und
  race-sicher; `Anwenden` entfällt. Dadurch entsteht nie automatisch ein Report.
- `Export JSON` bleibt sichtbar und verwendet nachvollziehbar den aktiven
  Bericht- oder Live-Zeitraum.
- Der Export nutzt genau einen dokumentierten
  `midas.health-export.v2`-Vertrag:
  - Root-Metadaten enthalten Schema-Version, Erstellungszeitpunkt,
    `Europe/Vienna`, Zeitraum, Vollständigkeitsstatus und Domain-Zähler.
  - Blutdruck, Körperdaten, Tagesnotizen, Labor und Aktivitäten sind getrennte,
    deterministisch sortierte Arrays.
  - Aggregierte Tageswerte enthalten `day` und bei Blutdruck einen Daypart,
    aber keine synthetischen Uhrzeiten, UTC-Zeitstempel oder Epoch-Werte.
  - Der Export enthält keine `user_id`; fachlich notwendige stabile Event-IDs
    dürfen für Herkunft und Deduplizierung erhalten bleiben.
  - Eine Datei entsteht nur nach erfolgreichem Abruf aller vorgesehenen Domains.
- Tablet, Desktop und Smartphone zeigen einen einspaltigen, überlappungsfreien
  Bericht für eine ärztliche Erfassung in ungefähr 60 bis 90 Sekunden.
- `Modern` bedeutet Hierarchie, unmittelbares Feedback und progressive
  Offenlegung, nicht dekorativen Redesign-Selbstzweck.

Bewusst unverändert:

- Reporttext, Kennzahlen, Trendpilot, medizinische Schwellen und Rohdaten.
- Schema, RLS, Grants, Edge Function sowie bestehende Offline-Verträge.
- Vorhandene Chart-, Detail- und zulässige Löschfähigkeiten; nur ihre Navigation,
  Hierarchie und Ladeweise ändern sich.
- Der Exportinhalt ändert sich ausschließlich durch den ausdrücklich
  versionierten V2-Vertrag; die zugrunde liegenden Gesundheitsdaten bleiben
  unverändert.

## Problem und Ist-Zustand

- Die Doctor View startet historisch als digitaler Blutdruckzettel mit
  Datumsleiste, Rohwerten und gleichrangigen Aktionen.
- Der inzwischen wichtigste Arzt-Bericht ist erst über `Inbox` erreichbar.
- Im realen Arztgespräch ist der Bericht entscheidend; Chart und Rohwerte sind
  nur bei zusätzlichem Kontext interessant.
- Der globale 90-Tage-Rohdatenzeitraum kann gespeicherte Berichte ausblenden.
- Rohdaten werden früh geladen, `Anwenden` erzeugt Reibung und der
  Exportzeitraum ist nach einem Report-first-Umbau noch nicht eindeutig.
- Der aktuelle JSON-Export mischt Blutdruck, Körperdaten und Tagesnotizen,
  erfindet für aggregierte Tageswerte Uhrzeiten und enthält weder Schema-Version
  noch Vollständigkeitsnachweis. Domainfehler können wie leere Daten aussehen.
- S1 muss abschließend belegen, dass die vorhandenen Report-, Chart- und
  Rohdatenverträge ohne Backendänderung genügen.

## Entscheidungslog

<!-- markdownlint-disable MD013 -->

| ID | Entscheidung | Begründung / Zielschritt |
| --- | --- | --- |
| D-1 | Der Bericht ist die gesamte primäre Doctor View; keine gleichrangigen Haupttabs. | Reale Konsultation; S4.2 |
| D-2 | Latest = größtes gültiges `period.to`, Tie-Break aktuelle Erzeugungszeit; Monatsbericht nie primär. | Deterministische Relevanz; S4.1 und finaler Lifecycle-D-18 |
| D-3 | Superseded: Der ursprünglich umgesetzte Archivvertrag bleibt nur bis zum Report-Lifecycle-Follow-up aktiv. | Owner-Smoke zeigte unnötige persistierte Snapshots; D-16 |
| D-4 | Neuer Report: `letztes period.to -> heute`, editierbar, nie über Vienna-heute und expliziter Write. | Reale Terminroutine; S4.3 |
| D-5 | Datums-Sync betrifft nur Live-Daten und erzeugt nie einen Report. | Read bequem, Write explizit; S4.4 |
| D-6 | Chart bleibt sekundäres Vollbild-Werkzeug ohne Report-Einbettung. | Kontext statt Hauptpfad; S4.6 |
| D-7 | Rohwerte sind sekundär und lazy geladen. | Weniger Last und visuelle Unruhe; S4.5 |
| D-8 | JSON-Export bleibt sichtbar und kontextgebunden; MCP bleibt out of scope. | Aktuelle KI-Schnittstelle und Fallback; S4.7 |
| D-9 | Bericht bleibt einspaltig; Trendpilot wird nicht doppelt gezeigt. | Klinische Leserichtung; S4.2/S4.8 |
| D-10 | Superseded für das finale Ziel: Latest-Read und lazy Archiv-Read waren nur im S4-Zwischenstand getrennt. | Das Lifecycle-Follow-up entfernt den Archiv-Read vollständig; D-17 |
| D-11 | Innerhalb dieser Doctor-UI-Roadmap bleiben Datenmodell, Edge Function und medizinische Logik unverändert. | Backend- und Lifecycle-Änderungen gehören ausschließlich zu D-16; Scope |
| D-12 | Ein Leerzustand setzt einen erfolgreichen Report-Read voraus; Offline-, Read- und Korruptionsfehler bleiben sichtbar getrennt. | Keine falsche Entwarnung; S4.1/S4.2 |
| D-13 | JSON-Export ist atomar: Bei einem Domainfehler entsteht keine Datei. | Keine unbemerkte unvollständige KI-Datengrundlage; S4.7 |
| D-14 | Der bisherige Misch-Export wird durch `midas.health-export.v2` mit Root-Metadaten, getrennten Domains und ohne synthetische Messzeitpunkte oder `user_id` ersetzt. | Eindeutiger Vertrag für ChatGPT und spätere Tool-Consumer; S4.7 |
| D-15 | Ein späterer MCP darf den semantischen V2-Vertrag wiederverwenden; MCP-Transport, direkter Supabase-Zugriff und Labor-PDF-Ingest bleiben außerhalb dieser Roadmap. | Keine vorgezogene Agenten- oder Lab-Architektur; W-2/W-3 |
| D-16 | Report-Lifecycle, Monthly-Entfernung, Singleton-SQL und produktiver Cutover liegen in `docs/archive/MIDAS Report Lifecycle Simplification Roadmap (DONE).md`. | Backend-/SQL-R3-Scope nicht still in diese R2-UI-Roadmap mischen; F-15 |
| D-17 | Finales Ziel nach dem Lifecycle-Follow-up: permanente Hauptfläche für `0..1` aktuellen Arzt-Bericht; kein sichtbares `Berichte`-/Inbox-Overlay und kein Archiv. | Singleton und reale Arzt-Routine benötigen keine zweite Reportebene. |
| D-18 | T-9 verwendet den bereits owner-gated ausgeführten Lifecycle-Write; es wird kein zusätzlicher Bericht nur für diese Roadmap erzeugt. | Derselbe produktive Vorgang belegt Replacement, stabile ID und den finalen Count ohne unnötigen Zusatzwrite. |
| D-19 | Neue Bereichsberichte sind inklusive auf maximal 400 Tage begrenzt. | Deckt Jahreskontrollen mit Terminverschiebung ab und begrenzt gleichzeitig Abfrage-, Speicher- und Payload-Risiko. |
| D-20 | Ein bereits geöffnetes Chart behält seinen beim Öffnen übernommenen Zeitraum-Snapshot. | Verhindert still wechselnde Diagramme; neue Zeiträume gelten nach Schließen und erneutem Öffnen. |

<!-- markdownlint-enable MD013 -->

## Owner-Briefing-Bedarf

- T-9-Briefing abgeschlossen: Der owner-gated Lifecycle-Write ersetzt den
  bestehenden Bericht in-place; Prüfkriterium ist exakt ein Range-Singleton.
- S6-Recap: Latest-Auswahl, Zeitraumzustand, Lazy Loading und expliziter Write.
- Normale HTML-, CSS- und JavaScript-Arbeit wird nicht erneut erklärt.

## Scope und Grenzen

In Scope:

- Report-first-Zustand, Navigation und Report-Erzeugungsdialog; das bereits
  umgesetzte Archiv ist nur ein zu entfernender Zwischenstand.
- Vollständige Normalisierung bestehender Reportfelder.
- Begrenzte Latest-/Legacy-Auswahl bis zum Singleton-Cutover.
- Sofortiger validierter Zeitraum-Sync mit Latest-request-wins.
- Lazy Raw-Data-Drilldown, Chart-Kontext sowie der versionierte
  Health-Export-V2-Vertrag.
- Responsive, Fokus-, Copy- und Accessibility-Politur.
- QA-, Module-Overview- und Changelog-Sync.

Nicht in Scope:

- Neue medizinische Logik, Reportinhalte oder Trendpilot-Regeln.
- Schema, RLS, SQL, Cron, Migration oder Edge-Function-Deploy.
- MCP-Server/-Transport, direkter MCP-Supabase-Zugriff, Labor-PDF-Ingest,
  persistierte Chart-Snapshots oder eingebettete Charts.
- Automatische Report-Erzeugung, automatische Löschung oder Facharzt-Ableitung.
- Allgemeiner Umbau anderer MIDAS-Overlays.

Guardrails:

- Datumsänderungen haben keine produktive Schreibwirkung.
- Latest hängt nicht am 90-Tage-Rohdatenfenster und verursacht keinen
  unbeschränkten Archiv-Vollscan.
- Fehlerhafte Altberichte verdrängen keinen gültigen Primärbericht.
- Späte Antworten älterer Requests überschreiben keinen neueren Zeitraum.
- Monatsberichte, Admin- und Löschaktionen werden nicht primär präsentiert.
- Jeder neue Einstieg respektiert den bestehenden Doctor-Unlock.

## Referenzen

Pflicht in S1:

- `README.md`
- `docs/DEV_ENVIRONMENT.md`
- `docs/templates/MIDAS Roadmap Workflow Contract.md`
- `docs/modules/Doctor View Module Overview.md`
- `docs/modules/Reports Module Overview.md`
- `docs/modules/Charts Module Overview.md`
- `docs/modules/Auth Module Overview.md`
- `docs/modules/Hub Module Overview.md`
- `docs/modules/Trendpilot Module Overview.md`
- `docs/qa/README.md`
- `docs/qa/health-capture-reports.md`
- `index.html`
- `app/modules/doctor-stack/{doctor,reports,charts}/`
- `app/styles/doctor.css`
- `app/supabase/api/system-comments.js`
- `app/supabase/api/reports.js`
- `assets/js/main.js`
- `app/modules/hub/index.js`
- `backend/supabase/functions/midas-monthly-report/index.ts`

Historisch nur bei konkreter Vertragsfrage:

- `docs/archive/Doctor Report Roadmap.md`
- `docs/archive/Reports-Roadmap.md`
- `docs/archive/doctor-range-export-plan.md`
- `docs/archive/BodyChart-Roadmap.md`
- `docs/archive/MIDAS Monthly Report Review Findings Roadmap (DONE).md`

## Tool Permissions und Gates

Allowed:

- In-Scope-Dateien lesen und ändern.
- `rg`, Node-Syntaxchecks, Markdownlint und `git diff --check`.
- Lokaler HTTP-Server und Browser-/Playwright-Smokes ohne produktiven Write.
- Supabase-/Runtime-Verträge bei Bedarf read-only prüfen.

User-gated:

- Produktiven Bereichsbericht erzeugen oder löschen.
- Andere produktive Datenwrites, Remote-Deploys oder Workflow-Starts.

Forbidden:

- Secrets ausgeben oder committen.
- Fremde Worktree-Änderungen zurücksetzen.
- Scope oder Architektur still erweitern.
- Datenbank-, Edge- oder medizinische Logik ändern.
- Automatische Report-Erzeugung oder -Löschung einführen.

## Statusmatrix

<!-- markdownlint-disable MD013 -->

| ID | Schritt | Reasoning | Status | Ergebnis |
| --- | --- | --- | --- | --- |
| S1 | System- und Vertragsdetektivarbeit | `GPT-5.6 Sol / Medium` | DONE | Systemkarte, Zustände, QA und zwölf Findings belegt; Review PASS |
| S2 | Fachlicher/technischer Zielvertrag | `GPT-5.6 Sol / High` | DONE | Hierarchie, Zustände, Zeiträume, Pagination und Export final; Review PASS |
| S3 | Bruchrisiko-, Security- und Umsetzungsreview | `GPT-5.6 Sol / High` | DONE | Risiken, Rollback, Stop-Vertrag und Pflichtchecks final; Review PASS |
| S4R | Readiness Review | `GPT-5.6 Sol / Extra High` | DONE | Dateimatrix, Ownership, Blöcke, Gates und Export V2 final; Full Review PASS |
| S4 | Umsetzung | `je Substep` | DONE | S4.1-S4.9 umgesetzt; integrierter Full Review PASS |
| S5 | Tests und Abschlussreview | `GPT-5.6 Sol / High` | DONE | T-1 bis T-10 PASS; Edge Version 50 produktiv verifiziert |
| S6 | Doku-Sync und Archiv | `GPT-5.6 Sol / Medium` | DONE | Overviews, QA, Changelog, Recap und Full Review PASS |

<!-- markdownlint-enable MD013 -->

## Findings

<!-- markdownlint-disable MD013 -->

| ID | Severity | Typ | Status | Ziel |
| --- | --- | --- | --- | --- |
| F-1 | P1 | Contract/UX | resolved | Rohwert-first durch Report-first ersetzt; S4.2 |
| F-2 | P1 | Code/Contract | resolved | Latest vom 90-Tage-Fenster gelöst; S4.1 |
| F-3 | P1 | Code | resolved | Persistierte `meta`-/Serienfelder vollständig normalisiert; S4.1 |
| F-4 | P1 | UX/Runtime | resolved | `Anwenden` entfernt; gültiges `change`, Request-Version und Zeitraumabgleich verhindern veraltete UI-Antworten; S4.4 |
| F-5 | P1 | Code/Performance | resolved | Einzelwert-Domains laden erst beim Öffnen; Cache-, Fehler- und Lifecycle-Zustände sind gebunden; S4.5 |
| F-6 | P2 | Copy/Code | resolved | Verlauf öffnet als Vollbild mit BP-Default und aktivem Zeitraum-Snapshot; S4.6 |
| F-7 | P1 | UX/Responsive | resolved | Einspaltige Shell, begrenzte Rohwertgrids, umbrechende Langtexte und responsive Chartcontrols umgesetzt; S4.8 |
| F-8 | P1 | Contract/Code | resolved | Export verwendet sichtbare Reportperiode oder den geöffneten Detailzeitraum; S4.7 |
| F-9 | P1 | Security/UX | resolved | Fehlende Unlock-Guard-Funktion verweigert Doctor- und Archivzugriff; Lifecycle-Reset belegt; S4.2 |
| F-10 | P2 | Code/Long-term | resolved | Latest-Read und lazy paginiertes 20er-Archiv getrennt; S4.1/S4.2 |
| F-11 | P1 | Contract/Code | resolved | Ein Domain-, Auth- oder Offlinefehler verhindert den Download vollständig; S4.7 |
| F-12 | P1 | Contract/UX | resolved | Leer-, Lade-, Offline-, Read-, Korruptions- und partielle Zustände getrennt dargestellt; S4.1/S4.2 |
| F-13 | P1 | Contract/UX | resolved | Zukunft aus Latest und Bereichserzeugung ausgeschlossen; S4.1/S4.3 |
| F-14 | P1 | Contract/Data | resolved | Health Export V2 trennt Domains, sortiert deterministisch und enthält weder synthetische Messzeiten noch `user_id`; S4.7 |
| F-15 | P1 | Product/Data | resolved | Lifecycle-Follow-up entfernte Archiv/Monthly, aktivierte Range-Singleton-Replacement und belegte T-9 produktiv |
| F-16 | P1 | Security/Backend | resolved | Update-Nichttreffer wird über `maybeSingle()` als Lifecycle-Fehler behandelt; interne `500`-Details bleiben nur im Log |
| F-17 | P1 | Stability/Contract | resolved | Berichtszeitraum auf inklusive 400 Tage begrenzt; Pagination besitzt Fortschritts- und 50-Seiten-Abbruch |
| F-18 | P1 | Export/Data | resolved | Export validiert nur In-Range-Zeilen; Kalenderfallback, deterministische Sortierung und Refresh-Fehlergrenze korrigiert |
| F-19 | P2 | UX/Responsive | resolved | Logout-, fehlende Guard-/Range- und mobile Create-Action-Zustände geben konsistentes Feedback |
| F-20 | P2 | Contract/Review | resolved | CodeRabbit-Live-Range-Vorschlag für das offene Chart abgelehnt; der geprüfte immutable S4.6-Snapshot bleibt erhalten |
| W-1 | Watchlist | Architektur | deferred | Persistierte Chart-Snapshots bleiben out of scope. |
| W-2 | Watchlist | Architektur | deferred | MCP kann den V2-Vertrag später als Tool-Response wiederverwenden; JSON bleibt manueller Fallback. |
| W-3 | Watchlist | Architektur | deferred | Direkter Labor-PDF-Ingest samt vollständigem Messwert-/Einheiten-/Methodenvertrag gehört in die spätere MCP-/Labor-Arbeit. |

<!-- markdownlint-enable MD013 -->

## Initialer Contract Review

Status: `PASS`, nach zwei Reviews korrigiert.

- Produktvision, Zeitraum, Archiv, Unlock und explizite Schreibwirkung sind
  vollständig abgedeckt.
- Latest-Read und Archiv-Read wurden für Langzeitbetrieb getrennt.
- Reportmetadaten sind unveränderlich; Datumsfelder bleiben kontextgebunden.
- `Modern` wurde als Informationshierarchie statt Dekoration präzisiert.
- Der produktive Smoke prüft eine bestätigte Aktion und UI-Duplikate, ohne
  Backend-Idempotenz für Bereichsberichte zu behaupten.
- Zweiter Review: Roadmap von 952 Zeilen kompaktiert, S4 von zehn auf neun
  Risikogrenzen verdichtet und Reasoning auf die niedrigste belastbare Stufe
  reduziert.
- Briefing findet ausschließlich vor produktiver Wirkung statt.
- Keine spekulative MCP-Abstraktion wird in diesem Scope implementiert.
- Evidence ist nicht erforderlich: kein SQL, Deploy oder umfangreiches
  produktives Runtime-Gate.
- Offene Produktfragen: keine; technische Details werden in S1 bis S3 belegt.

---

## S1 - System- und Vertragsdetektivarbeit

Reasoning: `GPT-5.6 Sol / Medium`.

Deterministisch:

1. Pflichtreferenzen lesen.
2. DOM-Einstiege, Unlock, Hub-Shortcut und Fokuspfade kartieren.
3. Report-Producer, Persistenz, Normalisierung und Consumer kartieren.
4. Latest-/Archiv-Sortierung sowie fehlerhafte Altperioden prüfen.
5. Raw-Data-, Datums-, Chart- und Exportzustände erfassen.
6. Responsive Regeln und bestehende QA-Nachweise zuordnen.
7. Fakten, Annahmen, Findings und Doku-Sync dokumentieren.
8. Full Contract Review durchführen und Findings korrigieren.

### S1-Systemkarte

- Einstieg und Schutz:
  - Hub öffnet Doctor View, Inbox und Chart über getrennte Pfade.
  - `doctor/index.js` prüft den Guard fail-closed; der Hub gibt bei fehlender
    `requireDoctorUnlock`-Funktion derzeit dagegen frei. Der direkte Inbox-Pfad
    kann dadurch ohne wirksamen Guard erreichbar werden (`F-9`).
- Report-Producer und Persistenz:
  - `midas-monthly-report` erzeugt Monats- und Bereichsberichte.
  - Persistenz erfolgt als `health_events` mit `type = system_comment`;
    `payload.period`, `generated_at`, `summary`, `text`, `meta` und Serien sind
    die fachliche Reportquelle.
  - Monatsberichte werden pro Monat aktualisiert; Bereichsberichte werden bei
    jeder bestätigten Erzeugung neu eingefügt.
- Report-Read und Consumer:
  - `app/supabase/api/reports.js` liest Monats- und Bereichsberichte derzeit
    gekoppelt an das aktive Rohdatenfenster.
  - `system-comments.js` normalisiert die gespeicherten `meta`- und Serienfelder
    nicht vollständig; Report-Flags sind für den Consumer faktisch verloren
    (`F-3`).
  - `doctor/index.js` öffnet aktuell Rohwert-Tabs als Primäransicht und die
    Reports-Inbox als separates Overlay.
- Zeiträume und Sekundärwerkzeuge:
  - Ein globales `from`/`to`-Paar steuert Rohwerte, Chart, Export und derzeit
    auch die sichtbaren Reports; `Anwenden` löst den Refresh aus.
  - Chart und JSON-Export lesen dieses Paar direkt. Der Chart ist ein eigener
    Vollbildbereich mit BP als technischer Default; die Doctor-Tab-Auswahl setzt
    seine Metrik nicht.
  - Raw BP, Body, Lab und Training werden bei jedem Doctor-Render eager geladen.
- Langzeit- und Zustandsverträge:
  - `health_events.day` ist bei Reports der Inbox-Anker `period.to`, nicht der
    tatsächliche Erstellungszeitpunkt. Die Latest-Auswahl muss daher den
    validierten Payload und einen Erstellungs-Tie-Break verwenden.
  - Der Select-Wrapper unterstützt `limit`, aber noch keine seitige Pagination.
    Latest-Read und lazy Archiv benötigen deshalb getrennte, begrenzte Verträge.
  - Reports besitzen keinen lokalen Offline-Fallback. `kein Report vorhanden`
    darf nicht mit einem fehlgeschlagenen bzw. offline Read gleichgesetzt werden
    (`F-12`).
  - Der JSON-Export fängt Domainfehler einzeln ab und lädt trotzdem eine Datei
    ohne Partialkennzeichnung herunter. Das kann für spätere KI-Auswertung einen
    unvollständigen Datenstand vortäuschen (`F-11`).

### S1-Nachweise und Abgrenzung

- Sources of Truth:
  - DOM und Einstieg: `index.html`, `app/modules/hub/index.js`.
  - Doctor-Consumer: `app/modules/doctor-stack/doctor/index.js`.
  - Reports: `app/modules/doctor-stack/reports/index.js`,
    `app/supabase/api/reports.js`, `app/supabase/api/system-comments.js` und
    `app/supabase/api/select.js`.
  - Producer: `backend/supabase/functions/midas-monthly-report/index.ts`.
  - Chart/Refresh: `app/modules/doctor-stack/charts/index.js` und
    `assets/js/main.js`.
  - Darstellung: `app/styles/doctor.css` und bestehende Chart-CSS.
- Bestehende QA-Zuordnung:
  - HCR-006 deckt Chart und Trendpilot-Bänder ab.
  - HCR-007 deckt Doctor-Zeitraum und Unlock ab.
  - HCR-008 bis HCR-010 sichern Report-Producer-Verträge.
  - HCR-011 deckt den bisherigen Inbox-Lifecycle ab.
- In S6 zu synchronisieren:
  - Doctor View, Reports, Charts, Hub und wegen `F-9` Auth Overview.
  - HCR-006, HCR-007 und HCR-011 auf Report-first, Fehlertrennung, Lazy Reads,
    Export und Responsive-Verhalten erweitern.
- In S2 aufgelöst:
  - Latest und Archiv werden getrennt in deterministischen 20er-Seiten gelesen.
  - Der Export ist atomar und erzeugt bei Domainfehlern keine Datei.

### S1 Full Contract Review

Status: `PASS`, nach Korrektur.

- Alle DOM-Einstiege, Guards, Producer, Persistenzschichten, Normalizer,
  Consumer, Zeitraumskopplungen und QA-Anker sind belegt.
- `F-9` wurde vom generischen Unlock-Nachweis auf den bestätigten
  Fail-open-Hub-Fallback präzisiert.
- `F-11` ergänzt den stillen partiellen JSON-Export; `F-12` verhindert einen
  falschen Leerzustand bei Offline- oder Readfehlern.
- S4- und Testzuordnung wurden auf `F-1` bis `F-12` korrigiert.
- Keine Produktivabfrage, kein Write, kein Deploy und keine Codeänderung wurden
  für S1 durchgeführt.

Exit: Alle Producer, Consumer, Sources of Truth und Einstiegspfade sind belegt.

## S2 - Fachlicher und technischer Zielvertrag

Reasoning: `GPT-5.6 Sol / Extra High`.

Hinweis: Die folgenden Archiv- und Monthly-Klauseln dokumentieren ausschließlich
den in S4 umgesetzten Zwischenstand. Für den offenen produktiven Abschluss sind
sie durch `D-16`, `D-17`, `F-15` und den finalisierten S2-Vertrag der aktiven
Report-Lifecycle-Roadmap superseded; sie sind keine Zielarchitektur mehr.

Deterministisch:

1. Report-first-Hierarchie und Aktionsreihenfolge finalisieren.
2. Latest, Archiv, Monatsberichte und fehlerhafte Reportdaten definieren.
3. Lade-, Leer-, Fehler- und partiellen Reportzustand definieren.
4. Zeiträume für Bericht, Erzeugung, Details, Chart und Export trennen.
5. Navigation, Fokus, Unlock, Lazy Loading und Race-Schutz festlegen.
6. Copy, Responsive-Vertrag, Scope und S4-Zuordnung finalisieren.
7. Full Contract Review durchführen und Findings korrigieren.

### S2-Produkt- und Anzeigevertrag

- Die entsperrte Doctor View zeigt genau einen Bericht als primären Inhalt:
  standardmäßig den neuesten gültigen `range_report`.
- Sichtbare Aktionsreihenfolge:
  1. `Neuer Bericht` ist die erste klare Schreibaktion, bleibt dem Bericht aber
     visuell untergeordnet.
  2. `Export JSON` bleibt als sichtbare manuelle KI-Schnittstelle erhalten.
  3. `Berichte` öffnet das lazy geladene Archiv.
  4. `Einzelwerte` und `Verlauf` bleiben sekundäre Drilldowns.
- Ein im Archiv gewählter Bericht ersetzt den angezeigten Bericht nur für die
  aktuelle Ansicht. Beim nächsten Öffnen wird wieder Latest bestimmt.
- Monatsberichte erscheinen ausschließlich im Archiv und nie als Hauptbericht.
- Reportperiode und Erstellungszeit des angezeigten Berichts sind read-only;
  Trendpilot-Hinweise werden nicht außerhalb des Berichts dupliziert.

### S2-Latest- und Archivvertrag

- Ein primärer Kandidat ist nur gültig, wenn:
  - `subtype = range_report` gilt;
  - `period.from` und `period.to` gültige ISO-Tage mit `from <= to` sind;
  - `period.to` nicht nach dem aktuellen Vienna-Tag liegt;
  - der persistierte Inbox-Anker `day` mit `period.to` übereinstimmt;
  - ein nichtleerer, darstellbarer Reporttext vorhanden ist.
- Latest wird serverseitig in 20er-Seiten nach `day DESC`, Erstellungszeit
  `DESC` und stabiler ID sortiert gelesen. Seiten werden nur so lange angefordert,
  bis der erste gültige Kandidat deterministisch feststeht oder die Quelle
  erschöpft ist. Das Rohdatenfenster beeinflusst diese Suche nicht.
- Das Archiv wird erst nach `Berichte` geöffnet und ebenfalls in 20er-Seiten
  nachgeladen. Bereichs- und Monatsberichte bleiben visuell getrennte Gruppen.
- Ungültige Zeilen werden nie primär. Wurden Zeilen verworfen, zeigt die Ansicht
  eine neutrale Auswertungswarnung; ausschließlich ungültige Zeilen ergeben
  keinen falschen `Noch kein Bericht`-Zustand.

### S2-Zustandsvertrag

- `loading`: `Arzt-Bericht wird geladen`; keine leere Reportfläche und keine
  veraltete Erfolgsanzeige.
- `success`: Report, unveränderliche Metadaten und zulässige Aktionen sichtbar.
- `empty`: nur nach erfolgreichem, erschöpftem Read ohne gültigen oder
  verworfenen Bereichsbericht; Copy `Noch kein Arzt-Bericht vorhanden` und
  Aktion `Neuer Bericht`.
- `unavailable/error`: `Berichte können derzeit nicht geladen werden` mit
  `Erneut versuchen`; niemals als leer darstellen.
- `partial`: der Bericht bleibt sichtbar, vorhandene persistierte Flags werden
  als `Eingeschränkte Datengrundlage` dargestellt. Es erfolgt keine medizinische
  Neuinterpretation im Client.
- Archivfehler verändern einen bereits sichtbaren Hauptbericht nicht.

### S2-Zeitraum-, Navigation- und Runtime-Vertrag

- Berichtskontext:
  - Der sichtbare gespeicherte Bericht behält seine persistierte Periode.
  - `Export JSON` aus der Hauptansicht nutzt exakt diese Periode.
- Erzeugungskontext:
  - `Neuer Bericht` besitzt eigene editierbare Felder.
  - Vorbelegung ist `letztes gültiges period.to -> Vienna-heute`; ohne Bericht
    bleibt der bestehende sichere Fallback erhalten.
  - Validierung verlangt zusätzlich `to <= Vienna-heute`; zukünftige
    Archivperioden werden nicht still verändert oder gelöscht.
  - Nur die ausdrücklich bestätigte Aktion schreibt einen Bericht.
- Live-Detailkontext:
  - Einzelwerte besitzen ein eigenes `from`/`to`, initial aus der sichtbaren
    Reportperiode oder dem bestehenden Fallback.
  - Ein vollständiges gültiges `change` lädt sofort; es existiert kein
    `Anwenden`-Button und keine Report-Schreibwirkung.
  - Chart und Export übernehmen beim Aufruf aus Details deren aktiven Zeitraum.
- JSON-Export ist All-or-error: Schlägt BP, Body, Lab oder Training fehl, wird
  eine verständliche Fehlermeldung angezeigt und keine Datei heruntergeladen.
- Der erfolgreiche Download ist ein `midas.health-export.v2`:
  - `schema_version`, `generated_at`, `timezone`, `range`, vollständiger
    Domain-Status und Counts machen Herkunft und Vollständigkeit explizit.
  - `blood_pressure`, `body`, `notes`, `labs` und `activities` sind getrennt und
    deterministisch nach Tag sowie fachlichem Sekundärschlüssel sortiert.
  - Für aggregierte BP-/Body-Tageswerte werden keine exakten Uhrzeiten erfunden.
    Blutdruck verwendet den kanonischen Daypart `morning` oder `evening`.
  - Owner-Kennungen wie `user_id` werden nicht exportiert; fachlich benötigte
    Event-IDs bleiben zulässig.
  - Gespeicherte Laborfelder werden wahrheitsgetreu exportiert. Nicht persistierte
    Einheiten, Messmethoden oder zusätzliche PDF-Werte werden nicht geraten.
- Latest-, Archiv-, Detail- und Chart-Requests besitzen getrennte
  Request-Generationen. Nur die Antwort des zuletzt sichtbaren Zustands darf das
  UI aktualisieren.
- Reports und Rohdaten werden lazy geladen; Rückkehr zum Bericht startet keinen
  unnötigen Rohdaten-Read.
- Jeder Hub-, Direkt-, Archiv- und Chart-Einstieg prüft den Unlock fail-closed.
  Beim Schließen kehrt der Fokus zum auslösenden Element zurück.

### S2-Responsive-, Copy- und Scope-Vertrag

- Der Bericht bleibt auf Desktop, Tablet und Mobile einspaltig. Tablet ist der
  priorisierte Arzt-Viewport; Aktionen dürfen umbrechen, aber Inhalte nicht
  überdecken oder horizontal abschneiden.
- Verbindliche Hauptbegriffe: `Arzt-Ansicht`, `Neuer Bericht`, `Export JSON`,
  `Berichte`, `Einzelwerte`, `Verlauf` und `Eingeschränkte Datengrundlage`.
- Chart bleibt ein sekundäres Vollbild-Werkzeug mit BP als Default und
  Körper-Umschaltung; es wird nicht in den Arzt-Bericht eingebettet.
- Bestehende Lösch- und Neuerstellen-Funktionen bleiben im Archiv administrativ
  erreichbar, werden aber nicht als Hauptaktionen beworben.
- Außerhalb des Scopes bleiben Schema, RLS, Edge Function, Reporttext,
  medizinische Grenzwerte, MCP, persistierte Charts und automatische Reports.

### S2 Full Contract Review

Status: `PASS`, nach Korrektur.

- Alle sieben S2-Punkte sind ohne offene Produktentscheidung geschlossen.
- Die globale Latest-Garantie wurde mit Ankerkonsistenz und paginiertem Read
  vereinbar gemacht; ein normaler Start benötigt regelmäßig nur eine Seite.
- `F-11` wurde eindeutig als atomarer All-or-error-Export aufgelöst (`D-13`).
- `F-12` trennt erfolgreichen Leerstand, Korruption und Erreichbarkeitsfehler
  verbindlich (`D-12`).
- `F-13` schließt beim Review bestätigte zukünftige Perioden aus Latest und
  Erzeugung aus; der bestehende Producer selbst bleibt unverändert.
- S4.7 wurde wegen des gesundheitsrelevanten Exportfehlers von `Consumer` auf
  `Full` angehoben.
- Keine Code-, Produktiv- oder Deployänderung wurde in S2 durchgeführt.

Exit: Keine Grundsatzfrage zu Anzeige, Zeitraum, Navigation oder Write bleibt.

## S3 - Bruchrisiko-, Security- und Umsetzungsreview

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. Fehlende, partielle, korrupte und veraltete Reportdaten prüfen.
2. Sortierung, Zeitzonen, ungültige Zeiträume und parallele Requests prüfen.
3. Unlock, direkte Einstiege, Export und versteckte Writes prüfen.
4. Lazy-Load-/Cache-, Rückkehr-, Tablet-, Mobile- und Fokusrisiken prüfen.
5. Rollback, Stop-Bedingungen, S4-Schnitt und S5-Checks finalisieren.
6. Full Contract Review durchführen und Findings korrigieren.

### S3-Risikoregister

- Reportqualität und Auswahl:
  - Fehlende optionale Metadaten machen einen textlich gültigen Altbericht nicht
    ungültig; fehlende Pflichtperiode, leerer Text, Zukunftsperiode oder ein von
    `period.to` abweichender `day`-Anker schließen ihn von Latest aus.
  - Verworfene Zeilen werden gezählt und als Auswertungswarnung sichtbar, aber
    weder gelöscht noch automatisch repariert.
  - Seitengrenzen dürfen Tie-Breaks nicht verändern. Mehrfachsortierung und
    Pagination werden rückwärtskompatibel ergänzt; bestehende `sbSelect`-Caller
    behalten ihr Verhalten.
- Datum und Zeit:
  - ISO-Tage werden als validierte `YYYY-MM-DD`-Werte verglichen, nicht über
    UTC-Mitternacht in lokale Tage konvertiert.
  - Nur `Vienna-heute` wird zeitzonenabhängig bestimmt. Erstellungszeitpunkte
    akzeptieren `Z` und numerische Offsets; ungültige Werte fallen auf stabile
    ID-Sortierung zurück.
- Parallelität und State:
  - Latest, Archiv, Details, Chart und Export teilen keine Requestgeneration.
    Veraltete Antworten dürfen weder Inhalt noch Lade-/Fehlerstatus überschreiben.
  - View-State lebt höchstens für die entsperrte Doctor-Session. Logout, User-
    Wechsel und Panel-Neustart leeren ihn; Report-Create, Delete und Neuerstellen
    invalidieren Latest und betroffene Archivseiten.
  - Wird der gerade betrachtete Archivbericht gelöscht, fällt die Ansicht erst
    nach erfolgreichem Delete auf neu bestimmtes Latest zurück.
- Security und Schreibwirkung:
  - Fehlender oder fehlernder Unlock-Guard bedeutet immer `deny`; das bestätigte
    Hub-Fail-open wird geschlossen (`F-9`).
  - Latest, Archiv, Details, Chart und Export bleiben read-only. Writes existieren
    nur hinter bestätigtem `Neuer Bericht`, `Neu erstellen`, `Löschen` oder
    bestehendem Inbox-Clear; In-flight-Sperren verhindern UI-Doppelaufrufe.
  - JSON-Export schreibt nichts und erzeugt bei Domainfehlern keine Datei.
  - Ein erfolgreicher Export meldet ausschließlich `complete`; ein leerer
    Domain-Array ist nur nach erfolgreichem Read zulässig.
  - Synthetische BP-/Body-Uhrzeiten werden entfernt, nicht in lokale oder UTC-Zeit
    umgedeutet. `generated_at` ist dagegen ein echter UTC-Erstellungszeitpunkt.
  - `user_id` und andere reine Owner-Kennungen verlassen den Export nicht.
    Stable Event-IDs dürfen nur für Deduplizierung und Herkunft verbleiben.
- Rendering, Navigation und Responsive:
  - Der bestehende Report-Renderer escaped persistierte Texte, Attribute,
    Summary und Flags vor `innerHTML`; diese XSS-Grenze bleibt verpflichtend.
  - Lazy Domains besitzen getrennte Lade-, Leer- und Fehlerzustände. Rückkehr zum
    Bericht darf keinen versteckten Read oder Layoutsprung auslösen.
  - Direkte Hub-/Inbox-/Chart-Einstiege, Escape/Zurück, Fokus-Rückgabe und
    einspaltige Darstellung werden auf Desktop, Tablet und Mobile geprüft.

### S3-Rollback und Stop-Vertrag

- Rollback:
  - Der Umbau bleibt auf HTML, CSS, Clientmodule und Client-API beschränkt.
  - Ein Code-Rollback stellt die bisherige Rohwert-first-Ansicht wieder her; kein
    Schema-, RLS-, Edge- oder Datenrollback ist erforderlich.
  - Ein in `T-9` bewusst erzeugter Bereichsbericht bleibt bei Code-Rollback als
    gültiger Datensatz erhalten. Eine Löschung wäre eine separate Owner-Aktion.
- S4 sofort stoppen, wenn:
  - ein vorhandener gültiger Produktionsbericht durch den neuen Normalizer nicht
    mehr renderbar wäre;
  - Latest nur durch Schema-, View- oder Edge-Änderung deterministisch lösbar wäre;
  - ein direkter Einstieg den Unlock nicht fail-closed erzwingen kann;
  - Reporttext oder medizinische Berechnung verändert werden müsste oder der
    Export außerhalb des ausdrücklich beschlossenen V2-Vertrags abweicht;
  - eine Read-Aktion einen Write auslöst oder ein produktiver Write vor `T-9`
    notwendig wird;
  - Tablet/Mobile nur durch Entfernen bestehender Funktionen stabil würden.

### S3-S4-Schnitt und Pflichtchecks

- Abhängigkeiten:
  - `S4.1` schließt Normalisierung, Sortierung und Pagination vor der Shell.
  - `S4.2/S4.3` bauen Hauptansicht, Invalidierung und explizite Writes darauf.
  - `S4.4-S4.7` teilen nur den finalisierten Zeitraumvertrag, nicht denselben
    Request-State.
  - `S4.8/S4.9` folgen erst nach stabilem Verhalten aller Einstiegspfade.
- Ergänzte Pflichtabnahmen:
  - T-2 prüft rückwärtskompatible Select-Caller, tote IDs und Listener.
  - T-3 deckt Tie-Breaks an Seitengrenzen, ungültige Anker, Zukunft, ausschließlich
    korrupte Zeilen sowie Offline-/Readfehler ab.
  - T-7 erzwingt All-or-error, validiert den vollständigen V2-Vertrag und belegt,
    dass bei Domainfehlern kein Download gestartet wird.
  - T-8 prüft alle direkten Unlock-Pfade, Fokus-Rückgabe und drei Viewportklassen.
  - T-9 belegt In-flight-Schutz und genau einen bestätigten produktiven Write.

### S3 Full Contract Review

Status: `PASS`, nach Korrektur.

- Alle sechs S3-Punkte sind deterministisch abgearbeitet.
- Sämtliche Risiken sind bestehenden Findings und S4-Substeps zugeordnet; kein
  zusätzliches Finding war erforderlich.
- Der generische Select-Helper darf nur optional und rückwärtskompatibel
  erweitert werden; ein appweiter Query-Umbau ist nicht Teil dieses Scopes.
- XSS-Schutz, Sessiongrenzen, Cache-Invalidierung und Archivmutation wurden als
  explizite Erhaltungsverträge ergänzt.
- Rollback und Stop-Bedingungen besitzen keine versteckte produktive Wirkung.
- Keine Code-, Produktiv- oder Deployänderung wurde in S3 durchgeführt.

Exit: Risiken sind geschlossen, S4 zugeordnet oder explizit deferred.

## S4 Readiness Review

Reasoning: `GPT-5.6 Sol / High`.

<!-- markdownlint-disable MD013 -->

| Substep | Änderung | Findings | Dateien | Review | Checks | Gate |
| --- | --- | --- | --- | --- | --- | --- |
| S4.1 | Normalisierung, paginiertes Latest und Sortierung | F-2, F-3, F-10, F-12, F-13 | `api/select.js`; `api/system-comments.js`; `doctor-stack/reports/index.js` | Full | T-1, T-2, T-3 | none |
| S4.2 | Report-first-Shell, lazy Archiv und Unlock | F-1, F-7, F-9, F-10, F-12 | `index.html`; Doctor; Reports; Hub; `doctor.css` | Full | T-1, T-3, T-8 | none |
| S4.3 | Expliziter neuer Bereichsbericht | D-3, D-4, F-13 | `index.html`; Doctor; Reports; `doctor.css` | Full | T-1, T-3, T-9 | none; T-9 erst S5 |
| S4.4 | Sofortiger race-sicherer Zeitraum-Sync | F-4 | `index.html`; Doctor; `assets/js/main.js` | Full | T-1, T-4 | none |
| S4.5 | Lazy Einzelwert-Drilldown | F-5 | `index.html`; Doctor; `doctor.css` | Consumer | T-1, T-4, T-6, T-8 | none |
| S4.6 | Kontextgebundenes Vollbild-Chart | F-6 | `index.html`; Charts; Doctor; Hub; Main; `chart.css` | Consumer | T-1, T-5, T-8 | none |
| S4.7 | Sichtbarer atomarer Health Export V2 | F-8, F-11, F-14 | `index.html`; Doctor; Main; `doctor.css` | Full | T-1, T-7, T-8 | none |
| S4.8 | Responsive, Semantik, Fokus und Copy | F-7 | `index.html`; `doctor.css`; `chart.css`; bei Bedarf `hub.css` | Consumer | T-8 | none |
| S4.9 | Integrierter Code- und Contract Review | F-1 bis F-14 | gesamter Doctor-View-Diff | Full | T-1 bis T-8 vorbereitend | none |

<!-- markdownlint-enable MD013 -->

- Pfadkürzel der Matrix:
  - `api/*` = `app/supabase/api/*`.
  - Doctor/Reports/Charts/Hub = jeweiliges `app/modules/*/index.js`.
  - Main = `assets/js/main.js`; `chart.css` liegt im Charts-Modul.
- Gate-Ergebnis: `PASS`; keine blockierenden Risiken und keine offene
  Grundsatzentscheidung.
- Bestätigte technische Ownership:
  - `select.js` erhält nur optionales `offset`; der bestehende `order`-String
    unterstützt bereits `day.desc,ts.desc,id.desc`.
  - `app/supabase/index.js` aggregiert Exporte automatisch und benötigt keine
    Änderung.
  - `system-comments.js` behält die REST-/User-Grenze und normalisiert additive
    Reportfelder einschließlich `payload`, `meta` und Serien.
  - `reports/index.js` besitzt Validierung, Latest-/Archiv-Paging und sicheres
    Report-Rendering; bestehendes Escaping bleibt erhalten.
  - Doctor besitzt sichtbaren Report, Detailzeitraum, Requestgenerationen und
    Lifecycle-Invalidierung. Keine Zustandslogik wandert in den Hub.
  - Charts erhalten beim Öffnen einen expliziten Zeitraum; direkter Hub-Aufruf
    nutzt einen sicheren Fallback statt versteckter globaler Kopplung.
- DOM-/Migrationsgrenze:
  - Bestehende interne Inbox-IDs dürfen für das Archiv weiterverwendet werden;
    sichtbare Copy lautet `Berichte`.
  - `from`/`to` bleiben der Live-Detailzeitraum; `applyRange` entfällt.
  - Der Erzeugungsflow erhält eigene Report-Datumsfelder.
  - Primärreport und Doctor-Shell werden nicht als Karte-in-Karte gestaltet.
  - Der Primärrenderer nutzt denselben escaped Reportpfad ohne administrative
    Lösch-/Neuerstellen-Aktionen; diese bleiben im Archiv.
- Empfohlene S4-Ausführungsblöcke:
  1. `S4.1` allein: Datenform und Paging vor jeder UI-Änderung.
  2. `S4.2-S4.3`: Hauptansicht und expliziter Erzeugungsflow mit gemeinsamem
     Full Review, Ergebnisse weiterhin getrennt dokumentieren.
  3. `S4.4` allein: Race- und Zeitraumzustand mit Extra-High-Reasoning.
  4. `S4.5-S4.7`: sekundäre Consumer auf dem finalen Zeitraumvertrag;
     gemeinsamer Full Review wegen Export.
  5. `S4.8-S4.9`: Responsive Politur und integrierter Full Review.
- Trennungsbegründung:
  - S4.1 verändert eine appweit genutzte API-Grenze und wird isoliert geprüft.
  - S4.4 besitzt eigenständiges Concurrency-Risiko.
  - Kein Owner-Gate liegt innerhalb der S4-Blöcke; T-9 bleibt ausschließlich S5.
- Evidence: nicht erforderlich; kein SQL, Deploy, Schema- oder Remote-Cutover.
- Owner-Gate: nur T-9 nach lokalem und read-only grünem S5 sowie Briefing.
- Readiness-Korrekturen: F-7 um verschachtelte Karten erweitert; Dateimatrix,
  API-Minimalschnitt und Blockempfehlung finalisiert.

### S4R Full Contract Review

Status: `PASS`, nach Korrektur.

- Jede Entscheidung `D-1` bis `D-15` und jedes Finding `F-1` bis `F-14` besitzt
  einen S4-Substep und mindestens einen passenden S5-Check.
- Producer, Consumer, Dateipfade, Zustandsowner, Reviewtiefe und Invalidation
  sind vor dem ersten Codepatch bestimmt.
- Offizielle PostgREST-/Supabase-Verträge bestätigen geordnetes Paging mit
  Mehrfachsortierung und `limit`/`offset`; es ist keine neue Abhängigkeit nötig.
- F-7 wurde um die im aktuellen DOM bestätigte Karte-in-Karte-Struktur ergänzt;
  eine neue Finding-ID war nicht erforderlich.
- Es existiert kein Gate innerhalb von S4. T-9 bleibt nach vollständigem lokalen
  und read-only S5 owner-gated.

### S4R Export-V2-Follow-up Contract Review

Status: `PASS`, nach Korrektur.

- Der reale Exporter und ein vollständiger Beispiel-Export wurden gegen die
  Roadmap geprüft. `bp_body_notes` mischt Domains und erzeugt derzeit pauschale
  `07:00`, `19:00` und `12:00` als scheinbar exakte UTC-Zeitpunkte.
- `D-14` und `F-14` lösen diese Mehrdeutigkeit mit einem einzigen versionierten
  V2-Vertrag. Die Änderung bleibt vollständig in S4.7 und benötigt weder einen
  neuen S4-Substep noch eine eigene Follow-up-Roadmap.
- `D-13` und `F-11` bleiben die Vollständigkeitsgrenze: Ohne erfolgreichen Read
  aller vorgesehenen Domains entsteht keine Datei.
- Der V2-Vertrag trennt Datenbereiche, entfernt Owner-IDs und deklariert
  Erstellungszeit, Zeitzone, Zeitraum, Status und Counts. Er erfindet weder
  Messzeitpunkte noch nicht persistierte Laborsemantik.
- `D-15`, `W-2` und `W-3` verhindern Scope Creep: Ein späterer MCP darf die
  semantische Form wiederverwenden, aber MCP-Transport, direkter Datenzugriff
  und Labor-PDF-Ingest werden hier nicht implementiert.
- S4-Blöcke, Owner-Gates, Deploy-Vertrag und Risikoklasse bleiben unverändert.
- Evidence bleibt entbehrlich, weil kein SQL, Deploy, Schema, RLS oder Remote-
  Cutover geplant ist.
- Roadmap-Markdownlint und Diff-Hygiene sind grün; Produktcode und produktive
  Runtime blieben im Readiness Review unverändert.

Exit: S4 kann ohne neue Grundsatzentscheidung beginnen; Blöcke und Gates sind
bestätigt.

## S4 - Umsetzung

### S4.1 - Reportdaten und Latest-Auswahl

Reasoning: `GPT-5.6 Sol / High`.

- `D-2`, `D-10`, `D-12`, `F-2`, `F-3`, `F-10`, `F-12`, `F-13` umsetzen.
- Persistierte Reportfelder rückwärtskompatibel vollständig normalisieren.
- Mehrfachsortierung und seitiges Lesen im Select-/Report-API ergänzen; Latest
  unabhängig vom Rohdatenfenster in 20er-Seiten bestimmen.
- Generische Select-Erweiterungen ausschließlich optional und kompatibel zu
  allen bisherigen Callern halten.
- Gültigen `range_report` nach `period.to` und Tie-Break bestimmen; ungültige
  Altperioden, Zukunftsperioden oder abweichende `day`-Anker verdrängen ihn nicht.
- Monatsberichte aus der Primärauswahl ausschließen.
- Dateien/Review/Checks: Report-APIs und Consumer; `Full`; `T-1`, `T-2`, `T-3`.

#### Ergebnis S4.1

- Änderung:
  - `sbSelect` unterstützt rückwärtskompatibel einen validierten optionalen
    `offset`; `fetchSystemCommentsBySubtype` reicht ihn additiv weiter.
  - Systemkommentare bewahren nun `payload`, `meta`, Reportmonat/-label,
    Erstellungs-/Generierungszeit sowie alle vier persistierten Serien.
  - `loadLatestRangeReport` liest unabhängige 20er-Seiten, validiert ISO-Tage,
    Vienna-heute, Anker und Berichtstext und bestimmt Latest nach `period.to`,
    Erstellungszeit und stabiler ID.
  - Gleiche Latest-Tage werden über Seitengrenzen vollständig gelesen; ältere
    Seiten werden beendet, sobald sie den Kandidaten nicht mehr verdrängen
    können. Reads unterscheiden `success`, `empty` und `invalid`; HTTP- und
    Datenfehler werden geworfen statt als leer behandelt.
- Prüfung:
  - Node-Syntaxchecks für alle drei Dateien und `git diff --check`: grün.
  - Simulierte Supabase-REST-Normalisierung mit `limit`/`offset`: grün.
  - Latest-Vertrag mit Zukunft, ungültiger Periode, Anker, leerem Text,
    numerischem Zeitzonenoffset, Seitengrenze und ID-Tie-Break: grün.
  - Bestehendes `loadMonthlyReports` sowie Fehlerfortpflanzung: grün.
- Finding:
  - Review-Finding zur Offset-Grenze korrigiert: negative und gebrochene
    Offsets werden vor dem REST-Aufruf abgelehnt.
  - `F-2` und `F-3` geschlossen; Datenanteile von `F-10`, `F-12` und `F-13`
    geschlossen, verbleibende UI-/Erzeugungsanteile bleiben zugeordnet.
- Restrisiko:
  - Browser-/Produktionsdaten-Smokes bleiben bewusst in S5; keine produktive
    Abfrage und keine Schreibwirkung in S4.1.
- Status: `DONE`; Full Code und Contract Review `PASS`; Doku-Sync in S6.

### S4.2 - Report-first-Shell und Archiv

Reasoning: `GPT-5.6 Sol / High`.

- `D-1`, `D-3`, `D-9`, `D-10`, `D-12`, `F-1`, `F-9`, `F-10`, `F-12` umsetzen.
- Lade-, Leer-, Fehler- und partiellen Reportzustand darstellen.
- `kein Bericht vorhanden` und `Berichte nicht erreichbar` niemals gleich
  darstellen.
- Aktionsleiste gemäß S2: `Neuer Bericht` klar, aber dem Report untergeordnet;
  `Export JSON` sichtbar; Archiv, Einzelwerte und Verlauf sekundär.
- Reportmetadaten unveränderlich anzeigen; Trendpilot nicht duplizieren.
- Archiv erst beim Öffnen begrenzt/seitig laden; Monatsberichte sekundär.
- Doctor-State bei Logout, User-Wechsel und neuem Panel-Lifecycle verwerfen.
- Unlock sowie bestehende Lifecycle-/Löschverträge erhalten, aber nicht primär
  präsentieren.
- Dateien/Review/Checks: HTML, Doctor, Reports, CSS; `Full`; `T-1`, `T-3`, `T-8`.

#### Ergebnis S4.2

- Änderung:
  - Die Doctor View startet mit einem einspaltigen, unveränderlichen
    Arzt-Bericht; JSON-Export bleibt sichtbar, Archiv, Einzelwerte und Verlauf
    sind sekundäre Aktionen.
  - Lade-, Leer-, Offline-/Read-, Korruptions- und partielle Datenzustände
    besitzen getrennte UI-Texte. Trendpilot bleibt ohne Primärduplikat im
    explizit geöffneten Einzelwertbereich verfügbar.
  - Das Archiv lädt erst beim Öffnen und danach in 20er-Seiten. Monatsberichte
    bleiben sekundär; bestehende Neuerstellen-, Löschen- und Leeren-Aktionen
    bleiben erhalten.
  - Logout, User-Wechsel und jeder neue Doctor-Panel-Lifecycle verwerfen
    Report-, Archiv- und Formularzustand. Fehlt die Unlock-Guard-Funktion,
    verweigern Doctor- und Archivpfad den Zugriff.
- Prüfung:
  - Syntaxchecks, eindeutige neue DOM-IDs, tote-ID-Suche, Escaping des
    Primärrenderers und `git diff --check`: grün.
  - Simulierter Browser-DOM-Vertrag: Archiv vor Öffnung ohne Read, erster Read
    erst beim Öffnen, weitere Seite nur über `Mehr laden`, Readfehler nicht als
    Leerzustand: grün.
  - Archiv-Close nach vorangegangenem Panel-Lifecycle: `×` und `Escape`
    schließen, lösen den Body-Lock und reichen Escape nicht an das
    darunterliegende Hub-Panel weiter: grün.
  - Desktop-, Tablet- und Mobile-Layout ohne Overflow in Doctor-Panel und
    Report-Shell: grün.
- Finding:
  - Der Review stellte die Trendpilot-Ack-/Löschfähigkeit im sekundären
    Einzelwertbereich wieder her, ohne den Primärbericht zu duplizieren.
  - Ein veralteter Archiv-Read wird über eine Versionsgrenze verworfen.
  - Owner-Smoke-Finding korrigiert: Der Lifecycle-Reset hatte das Archiv-Element
    vor der Handler-Bindung gecached; die frühe Rückgabe verhinderte danach den
    `×`-Handler. Binding und eigener isolierter Escape-Handler sind nun
    unabhängig vom Cache-Zustand garantiert.
  - `F-1`, `F-9`, `F-10` und `F-12` geschlossen; `F-7` bleibt bis zur finalen
    Politur in S4.8 teilweise offen.
- Restrisiko:
  - Signierter Browser-Smoke mit echten Produktivberichten bleibt in S5.
  - Einzelwerte laden bis S4.5 noch eager, obwohl ihr Bereich verborgen ist.
- Status: `DONE`; gemeinsamer Full Code und Contract Review mit S4.3 `PASS`;
  Doku-Sync in S6.

### S4.3 - Expliziter neuer Bereichsbericht

Reasoning: `GPT-5.6 Sol / High`.

- `D-3`, `D-4`, `D-5`, `F-13` umsetzen.
- Kompakten Erzeugungsflow mit `letztes period.to -> Vienna-heute` vorbelegen;
  ohne Bericht sicheren bestehenden Fallback verwenden.
- Datumswerte editierbar halten und `from <= to` vor dem Aufruf validieren.
- `to > Vienna-heute` im Client ablehnen; keine Edge-Function-Änderung.
- Nach Erfolg neuen Bericht auswählen; alte Berichte nicht löschen.
- In-flight-Schutz erhalten und Latest-/Archiv-State nach Create, Neuerstellen
  oder Delete gezielt invalidieren.
- Coding und read-only Review ohne Gate; produktiver Smoke ausschließlich T-9.
- Dateien/Review/Checks: Doctor, Reports, HTML, CSS; `Full`; T-1, T-3, T-9.

#### Ergebnis S4.3

- Änderung:
  - Ein kompakter expliziter Erzeugungsflow wird mit
    `letztes period.to -> Vienna-heute` vorbelegt; ohne gültigen Latest-Bericht
    greift ein validierter bestehender Zeitraum oder Vienna-heute.
  - Der Client validiert echte ISO-Tage, `from <= to` und
    `to <= Vienna-heute`, bevor der Generator erreichbar ist.
  - Ein In-flight- und Lifecycle-Token verhindert Doppel-Submits sowie späte
    UI-Wirkung alter Requests nach Logout, User-Wechsel oder neuem Panel.
  - Nach Erfolg werden Latest und Archiv gezielt invalidiert und der neue
    Latest-Bericht ausgewählt; alte Berichte werden nicht automatisch gelöscht.
- Prüfung:
  - Zukunftsdatum erzeugt null Generatoraufrufe; gültiger Doppel-Submit genau
    einen simulierten Aufruf: grün.
  - Browser-Lifecycle-Test mit zwei überlappenden Requests: Die alte Antwort
    schließt oder entsperrt den neueren Flow nicht; der aktuelle Request
    beendet Formular und Busy-State korrekt.
  - Range-Validierung am Reports-Modul, sichere Vorbelegung und Invalidierung
    nach Create/Neuerstellen/Delete/Archivleeren: grün.
- Finding:
  - Der gemeinsame Review fand und korrigierte einen stale Create-Randfall:
    Ein alter Request hätte nach User-/Lifecycle-Wechsel den Busy- oder
    Fehlerzustand eines neueren Requests überschreiben können.
  - `F-13` vollständig geschlossen.
- Restrisiko:
  - Kein produktiver Bericht wurde in S4.3 erzeugt. Owner-gated
    Produktiv-Smoke und Persistenznachweis bleiben ausschließlich `T-9` in S5.
- Status: `DONE`; gemeinsamer Full Code und Contract Review mit S4.2 `PASS`;
  Doku-Sync in S6.

### S4.4 - Sofortiger race-sicherer Zeitraum-Sync

Reasoning: `GPT-5.6 Sol / Extra High`.

- `D-5`, `F-4` umsetzen und `Anwenden` entfernen.
- Geteilten, klar benannten Zeitraum für sekundäre Live-Daten etablieren.
- Nur vollständige gültige `change`-Ereignisse laden, nie pro Tastenanschlag.
- Ältere parallele Antworten abbrechen oder ignorieren.
- Lade- und Fehlerzustand dem angefragten Zeitraum zuordnen.
- Dateien/Review/Checks: Doctor, Charts, Main, HTML; `Full`; T-1, T-4.

#### Ergebnis S4.4

- Änderung:
  - `Anwenden` und dessen Main-Listener entfernt; die beiden Live-Datumsfelder
    teilen einen klar benannten Zeitraumzustand.
  - Nur vollständige gültige `change`-Ereignisse starten einen Doctor-Read.
    Ungültige oder zukünftige Bereiche bleiben lokal und zeigen einen
    neutralen Fehlerzustand.
  - Request-Version plus aktueller DOM-Zeitraum ignorieren späte Antworten und
    Fehler älterer Bereiche. Lade-, Partial- und Fehlerzustände nennen den
    betroffenen Zeitraum.
  - Ein erfolgreicher primärer Bereichsbericht initialisiert den Live-Zeitraum,
    solange der Owner ihn nicht bewusst geändert hat.
- Prüfung:
  - Doctor und Main bestehen `node --check`; DOM-ID-Check ohne Duplikate.
  - Isolierter Runtime-Check: kein Read bei ungültigem Bereich oder
    Tastenanschlag; sofortiger Read bei gültigem `change`; älterer Fehler
    überschreibt den neuesten Ladezustand nicht.
  - Statischer Concurrency-Check belegt Aktualitätsprüfung nach allen
    asynchronen Domain-Reads und vor dem finalen Renderabschluss.
- Review-Finding:
  - Der erste Fehlerpfad des globalen Refreshs war noch nicht an seine
    Request-Version gebunden und hätte theoretisch einen neueren Ladezustand
    überschreiben können. Korrigiert und erneut geprüft.
- Restrisiko:
  - Kein steuerbarer Browser war in dieser Sitzung gebunden. Der Owner-Smoke
    der vorausgehenden Report-first-Oberfläche ist grün; vollständige
    Browser-/Device-Matrix folgt in S5.
- Status: `DONE`; Full Code und Contract Review `PASS`; Doku-Sync in S6.

### S4.5 - Lazy Einzelwerte

Reasoning: `GPT-5.6 Sol / High`.

- `D-7`, `F-5` umsetzen.
- BP, Körper, Labor und Training erst beim Öffnen laden.
- Bestehende Anzeige, Kommentare und zulässige Aktionen erhalten.
- Wechsel, Rückkehr sowie leere, ladende und fehlerhafte Domains stabilisieren.
- Dateien/Review/Checks: Doctor, HTML, CSS; `Consumer`; T-1, T-4, T-6, T-8.

#### Ergebnis S4.5

- Änderung:
  - Der ausgeblendete Einzelwertbereich löst keine BP-, Körper-, Labor-,
    Trainings- oder Trendpilot-Reads mehr aus.
  - Erst `Einzelwerte` öffnet den Bereich und lädt den gültigen Live-Zeitraum.
    Ein vollständig geladener unveränderter Zeitraum wird beim Wiederöffnen
    wiederverwendet; partielle oder fehlerhafte Reads werden erneut versucht.
  - Datumsänderungen laden nur bei sichtbaren Einzelwerten. Schließen,
    Lifecycle-Wechsel und neue Requests invalidieren veraltete Antworten.
- Prüfung:
  - Isolierter Zustandscheck belegt genau einen Read beim Öffnen, keinen Read
    beim Schließen und keinen versteckten Read nach Datumsänderung.
  - Bestehende Domainrenderer, Kommentare, Tabs und Löschaktionen bleiben
    unverändert im erfolgreichen Renderpfad.
- Finding:
  - Der Full Review entfernte beim User-/Panel-Lifecycle zusätzlich alte
    Einzelwert-DOM-Daten, statt nur den Cachezustand zurückzusetzen.
  - `F-5` geschlossen.
- Restrisiko:
  - Reale leere, partielle und fehlerhafte Supabase-Domains werden in S5 im
    Browser geprüft.
- Status: `DONE`; gemeinsamer Full Code und Contract Review mit S4.6-S4.7
  `PASS`; Doku-Sync in S6.

### S4.6 - Sekundäres Vollbild-Chart

Reasoning: `GPT-5.6 Sol / High`.

- `D-6`, `F-6` umsetzen.
- Verlauf fokussiert mit BP als Default und Körper-Umschaltung öffnen.
- Aktiven Bericht- oder Detailzeitraum korrekt übernehmen.
- Hub-Shortcut und direkte Chartöffnung erhalten.
- Copy ausschließlich an tatsächlich implementiertes Verhalten angleichen.
- Dateien/Review/Checks: Charts, Doctor, Hub, Main, CSS; `Consumer`; T-1, T-5, T-8.

#### Ergebnis S4.6

- Änderung:
  - `Verlauf` öffnet das bestehende echte Vollbild-Panel mit BP als Default;
    Körper bleibt über die vorhandene Auswahl erreichbar.
  - Hauptansicht, Live-Details, direkter Button, Hub-Shortcut und Unlock-Resume
    verwenden denselben aktiven Zeitraumvertrag.
  - Das Chart liest einen eigenen Zeitraum-Snapshot. Neuere Draws verdrängen
    ältere Antworten; Schließen invalidiert Draw und Snapshot.
  - Sichtbare Copy lautet `Verlauf` und zeigt den tatsächlich verwendeten
    Zeitraum; ein Chart-Open löst keinen unnötigen Doctor-Read mehr aus.
- Prüfung:
  - Isolierter Chart-Vertrag belegt BP-Default, Reportzeitraum-Snapshot,
    Zeitraum-Copy und Invalidation beim Schließen.
  - Syntax-, Caller- und DOM-ID-Checks sind grün; Hub startet weiterhin über
    den bestehenden Doctor-Chart-Button.
- Finding:
  - Der Full Review band auch den Unlock-Resume-Pfad an den finalen
    Zeitraumvertrag und verhinderte einen später wiederverwendeten alten
    Snapshot.
  - `F-6` geschlossen.
- Restrisiko:
  - Reale SVG-Darstellung, Fokus, ESC und Körper-Umschaltung folgen in S5 und
    der responsiven Politur S4.8.
- Status: `DONE`; gemeinsamer Full Code und Contract Review mit S4.5/S4.7
  `PASS`; Doku-Sync in S6.

### S4.7 - Health Export V2 und sekundäre Werkzeuge

Reasoning: `GPT-5.6 Sol / High`.

- `D-8`, `D-13`, `D-14`, `D-15`, `F-8`, `F-11`, `F-14`, `W-2`, `W-3`
  umsetzen.
- Export sichtbar halten und aus der Hauptansicht an die ausgewählte
  Reportperiode binden; in Live-Details deren aktiven Zeitraum verwenden.
- Den bisherigen Misch-Export bewusst durch
  `schema_version: "midas.health-export.v2"` ersetzen. Keine parallele
  Legacy-Struktur und keine spekulative MCP-Arbeit hinzufügen.
- Root-Vertrag:
  - `schema_version`, echter UTC-Wert `generated_at`,
    `timezone: "Europe/Vienna"` und aktiver `range`.
  - `completeness.status: "complete"` sowie geladene Domains und Counts.
- Domain-Vertrag:
  - getrennte Arrays `blood_pressure`, `body`, `notes`, `labs`, `activities`;
  - deterministische Sortierung und kanonische englische Feld-/Daypart-Werte;
  - BP verwendet `day`, `daypart`, `systolic_mmhg`, `diastolic_mmhg` und
    `pulse_bpm`; Body verwendet `day`, `weight_kg`, `waist_cm`, `fat_kg` und
    `muscle_kg`; Notes verwendet `day` und `text`;
  - Activities verwendet `id`, tatsächliches `occurred_at`, `day`, `activity`,
    `duration_min` und optional `note`;
  - keine erfundenen BP-/Body-Uhrzeiten, ISO-Zeitpunkte oder Epoch-Werte;
  - keine `user_id`; Stable Event-IDs nur bei fachlichem Nutzen.
- Bestehende Laborwerte ohne erfundene Einheit, Methode oder PDF-Anreicherung
  übernehmen. Vollständiger Labor-PDF-Ingest bleibt deferred.
- Domainfehler dürfen keinen Download erzeugen; den atomaren All-or-error-Vertrag
  mit verständlicher Fehlermeldung umsetzen.
- Admin- und destruktive Aktionen sekundär platzieren.
- Dateien/Review/Checks: Doctor, Reports, HTML, CSS; `Full`; T-1, T-7, T-8.

#### Ergebnis S4.7

- Änderung:
  - Der sichtbare Button exportiert aus der Hauptansicht die Reportperiode und
    aus geöffneten Einzelwerten deren Live-Zeitraum.
  - `midas.health-export.v2` enthält UTC-Erstellungszeit, Vienna-Zeitzone,
    Zeitraum, vollständige Domainliste und Counts sowie getrennte Arrays für
    Blutdruck, Körper, Notizen, Labor und Aktivitäten.
  - Dayparts und Feldnamen sind kanonisch englisch, Arrays deterministisch
    sortiert. BP und Körper enthalten keine erfundenen Uhrzeiten, ISO- oder
    Epoch-Werte; `user_id` wird nicht exportiert.
  - Aktivitäten behalten ihre echte persistierte Zeit und fachliche ID.
    Laborwerte werden ohne erfundene Einheit, Methode oder PDF-Semantik
    übernommen.
  - Alle Domains werden atomar gelesen. Offline, fehlende Session, fehlender
    Loader oder irgendein Domainfehler erzeugen verständlich keine Datei.
- Prüfung:
  - Isolierter V2-Vertrag belegt Schema, UTC-Normalisierung, Zeitraum,
    Sortierung, Counts, echte Aktivitätszeit und verbotene Legacyfelder.
  - Negativchecks für unvollständige Domains und ungültige Zahlenwerte: grün.
  - Simulierter Domainfehler erzeugt null Downloads; vollständige leere Domains
    erzeugen genau einen als `complete` deklarierten Export.
- Finding:
  - Der Full Review ergänzte einen sicheren sichtbaren Fehlerfallback, falls
    der zentrale UI-Error-Hook nicht verfügbar ist.
  - `F-8`, `F-11` und `F-14` geschlossen; `W-2` und `W-3` bleiben bewusst
    deferred.
- Restrisiko:
  - Ein echter Browser-Download mit produktiven Daten und eine manuelle
    Plausibilitätsprüfung des JSON folgen in S5.
- Status: `DONE`; gemeinsamer Full Code und Contract Review mit S4.5-S4.6
  `PASS`; Doku-Sync in S6.

### S4.8 - Responsive und barrierearme Politur

Reasoning: `GPT-5.6 Sol / Medium`.

- `D-9`, `F-7` umsetzen.
- Bericht auf allen Viewports einspaltig halten; Tablet priorisieren, ohne
  Desktop oder Mobile zu degradieren.
- Lange Werte, Medikamentenlisten und Reporttexte überlappungsfrei darstellen.
- Fokus, Dialogsemantik, Zurücknavigation, Tastatur und deutsche Copy prüfen.
- Dateien/Review/Checks: HTML und Doctor-/Chart-CSS; `Consumer`; T-8.

#### Ergebnis S4.8

- Änderung:
  - Bericht und Archiv bleiben auch auf Tablet einspaltig; lange
    Medikamentenlisten, Reporttexte und Metadaten dürfen umbrechen.
  - Rohwertgrids erhalten stabile Mindestbreiten und scrollen auf schmalen
    Viewports horizontal, statt Spalten oder Nachbarinhalte zu überlagern.
  - Chartcontrols, KPIs, Tooltip und SVG-Höhe wurden für Tablet und Mobile
    begrenzt; reduzierte Bewegung wird respektiert.
  - Archiv und Verlauf synchronisieren `hidden`, `inert`, `aria-hidden`,
    Body-Scroll-Lock und Fokus-Trap. Berichtserzeugung gibt den Fokus zurück,
    reagiert auf Escape und publiziert `aria-expanded`.
  - Doctor-Tabs verwenden deutsche Bezeichnungen, Roving-Tabindex sowie
    Pfeil-, Home- und End-Navigation; Archivfilter verwenden `aria-pressed`.
- Prüfung:
  - Statische Viewport-, DOM-, ARIA-, Fokus-, Tastatur-, Copy- und
    Langtextchecks `PASS`.
  - Der bereits ausgeführte Live-Server-Smoke bestätigt den normalen
    Doctor-View-Flow. Visuelle Screenshots aller Zielviewports bleiben T-8.
- Findings:
  - Prozentgrids mit zusätzlichen Gaps konnten horizontal überlaufen.
  - Das Tablet-Archiv brach den Einspaltenvertrag.
  - Chart und Berichtserzeugung kommunizierten ihren Offen-Zustand nicht
    vollständig an assistive Technik.
- Restrisiko:
  - Geräte- und Screenshotprüfung für Desktop, Tablet und Smartphone folgt
    gesammelt in S5/T-8.
- Status: `DONE`; Consumer Review `PASS`; Doku-Sync in S6.

### S4.9 - Integrierter Abschlussreview des Codes

Reasoning: `GPT-5.6 Sol / High`.

- `F-1` bis `F-14` und `D-1` bis `D-15` gegen den Gesamtdiff prüfen.
- Zustände, Navigation, Unlock, Zeiträume, Reports, Chart und Export reviewen.
- Tote Listener/DOM-Referenzen, Duplikate, XSS, Session-Leaks, ungültige Caches
  und Eager Loads prüfen.
- Findings korrigieren und betroffene T-IDs invalidieren.
- S5-Matrix auf den tatsächlichen Diff abgleichen.
- Review/Checks: `Full`; T-1 bis T-8 vorbereitend.

#### Ergebnis S4.9

- Änderung:
  - Gesamtdiff für Report-first-Start, Latest/Archiv, expliziten Write,
    Live-Zeitraum, lazy Details, Chart und Export V2 gegen alle Entscheidungen
    und Findings geprüft.
  - Archivdarstellung von `block` auf den vertraglichen Flex-Dialog korrigiert;
    geschlossene Resetpfade deaktivieren keinen fremden Fokus-Trap mehr.
  - Rohwert-Renderer escapen auch unerwartete nichtnumerische Werte; bestehende
    kontrollierte Report- und Chart-HTML-Sinks wurden auf Escaping geprüft.
  - Irreführende Legacy-Copy und eine korrupte Diagnose-Zeichenfolge bereinigt.
- Prüfung:
  - Node-Syntax für neun geänderte JavaScript-Dateien `PASS`.
  - Eindeutige echte HTML-IDs, neue ARIA-Ziele, Dialogzustände,
    Fokus-Guards, Tabnavigation, Responsive-CSS und Reduced Motion `PASS`.
  - Markdownlint, Encoding-Scan und `git diff --check` `PASS`.
  - Keine aktiven Legacy-IDs, kein `Anwenden`-Listener und kein
    Report-first-Eager-Load gefunden.
- Findings:
  - Alle im Review gefundenen In-Scope-Probleme wurden korrigiert.
  - Das bereits im Ausgangsstand fehlende globale HUB-Ziel `hubTitle` wurde
    nicht durch diesen Umbau eingeführt und bleibt außerhalb des Doctor-Scopes.
- Restrisiko:
  - Browser-Randzustände, echte Viewport-Screenshots, Domainfehler des Exports
    und der owner-gated produktive Report-Write bleiben explizit in S5.
- Status: `DONE`; Full Code und Contract Review `PASS`; Doku-Sync in S6.

Exit: Alle In-Scope-Findings sind umgesetzt oder explizit abgegrenzt.

## S5 - Tests, Runtime-Gates und Abschlussreview

Reasoning: `GPT-5.6 Sol / High`.

<!-- markdownlint-disable MD013 -->

| ID | Ebene | Check | Status |
| --- | --- | --- | --- |
| T-1 | lokal | Node-Syntaxchecks, Markdownlint und `git diff --check` | PASS |
| T-2 | lokal | Rückwärtskompatible Select-Caller; Suche nach alten IDs/Listenern, `Anwenden`, Eager Loads und unvollständiger Normalisierung | PASS |
| T-3 | Browser read-only | Latest über Seiten-/Tie-Grenzen; ungültige Anker, Zukunft und ausschließlich korrupte Daten; getrennte Leer-/Offline-/Fehler-/Partialzustände; lazy Archiv und Monatsberichte | PASS: Contract-Harness plus Owner-Live-Smoke |
| T-4 | Browser read-only | Sofort-Sync, ungültige Bereiche und Latest-request-wins bei schnellen Wechseln | PASS: Race-Harness plus Owner-Live-Smoke |
| T-5 | Browser read-only | Chart BP/Körper, Zeitraum, Fokus und Hub-Shortcut | PASS |
| T-6 | Browser read-only | Lazy BP/Body/Lab/Training und stabile Rückkehr zum Bericht | PASS |
| T-7 | Browser read-only | Health Export V2: Schema/Metadaten/Counts, getrennte und sortierte Domains, keine synthetischen BP-/Body-Zeiten oder `user_id`, richtiger aktiver Zeitraum und kein Download bei Domainfehlern | PASS: Contract-Harness plus realer Owner-Export |
| T-8 | Browser/Responsive | Alle Unlock-Einstiege, Fokus-Rückgabe, Desktop-/Tablet-/Mobile-Screenshots, Copy und keine Überlappung | PASS |
| T-9 | produktiv write | Nach grünem Lifecycle-Follow-up einen Bericht ersetzen, Zukunftsdatum ablehnen und exakt einen aktuellen `range_report` belegen | PASS: Lifecycle-Owner-Smoke und unabhängige DB-Postconditions |
| T-10 | Review | Optional CodeRabbit, danach finaler Consumer-/Full-Review und invalidierte Checks wiederholen | PASS: Findings korrigiert; Edge Version 50 und Runtime-Grenzen verifiziert |

<!-- markdownlint-enable MD013 -->

Reihenfolge: `T-1/T-2` -> `T-3` bis `T-8` -> Owner-Gate `T-9` ->
externer Review/Fixes -> `T-10`.

Hinweis: Die Archiv- und Monthly-Klauseln in `T-3` belegen den damaligen
R2-Zwischenstand. Der finale aktive Vertrag wurde anschließend durch das
Lifecycle-Follow-up ersetzt und ist über `F-15` sowie `T-9` belegt.

### S5-Ergebnis einschließlich externem Review

- Lokale Checks:
  - Node-Syntax für die zehn betroffenen JavaScript-Dateien `PASS`.
  - Markdownlint `0` Findings; `git diff --check` ohne Fehler.
  - 14 Select-Caller verwenden den Objektvertrag; Offset bleibt additiv.
  - Keine aktiven Legacy-IDs, kein `Anwenden`-Listener und kein versteckter
    Report-first-Eager-Load.
- Read-only- und Contract-Harnesses:
  - Latest, Tie-Break, Mehrseitenabfrage, ungültige oder zukünftige Berichte,
    Leer-/Fehlerzustände, Archiv-Pagination und XSS-Escaping `PASS`.
  - Sofort-Sync und Latest-request-wins einschließlich veralteter Antworten
    und ungültiger Bereiche `PASS`.
  - Chart mit BP/Körper, Zeitraumkopie, Fokus-Trap und Hub-Shortcut `PASS`.
  - Geschlossene Einzelwerte verursachen keine Rohdatenreads; Öffnen lädt
    BP/Körper/Labor/Training einmal, erneutes Schließen bleibt lazy `PASS`.
  - Health Export V2 besteht Schema-, Sortier-, Privacy-, Vollständigkeits- und
    All-or-error-Prüfungen. Der reale Owner-Export V2 wurde bestätigt.
- Browser und Responsive:
  - Der Owner bestätigte den normalen Live-Server-Flow einschließlich
    Schließen, Sofort-Sync und Export.
  - Desktop-, Tablet- und Mobile-Screenshots wurden auf Überlappung,
    Abschneiden und Leserichtung geprüft; DOM-, ARIA-, Fokus-, Tastatur-,
    Overflow- und Reduced-Motion-Verträge sind grün.
  - Die automatisierte Browsersteuerung war in dieser Sitzung nicht verbunden;
    Randzustände wurden deshalb isoliert deterministisch statt über einen
    zweiten produktiven Browser geprüft.
- Review:
  - Full Code und Contract Review vor T-9 sowie nach den CodeRabbit-
    Korrekturen `PASS`.
  - Bestätigte Findings wurden korrigiert; der Chart-Zeitraum bleibt
    vertragsgemäß ein unveränderlicher Snapshot.
  - Deno `22/22`, Check/Lint/Format, Node `10/10`, fokussierte
    Paging-/Range-/Refresh-Harnesses und Diff-Hygiene sind grün.
- Produktiver T-9-Nachweis:
  - Das Lifecycle-Follow-up entfernte Monthly und den Archivvertrag und
    aktivierte den partiellen Range-Singleton-Index.
  - Der Owner erzeugte den Bericht über den authentifizierten Live-Server-Flow
    und ersetzte ihn anschließend in-place.
  - Die Datenbank enthält danach null `monthly_report` und genau einen
    `range_report`; ID und Erstzeit blieben stabil, Inhalt und Erzeugungszeit
    wurden aktualisiert.
  - Die Zukunftsgrenze ist durch Clientvertrag und Contract-Harness belegt;
    der produktive Write verwendete einen gültigen Zeitraum.
  - Kein zusätzlicher Bericht wurde nur für T-9 erzeugt.
- Runtime:
  - Edge Version 50 ist JWT-geschützt produktiv aktiv.
  - OPTIONS `200`, fehlende Auth `401` und Service Role `403` sind bestätigt.
  - Die drei produktiven Quelldateien sind remote/lokal SHA-256-identisch.

Exit: T-1 bis T-10 einschließlich produktivem Runtime-Abgleich sind grün.

## S6 - Doku-Sync und Abschluss

Reasoning: `GPT-5.6 Sol / Medium`.

Deterministisch:

1. Doctor View, Reports, Charts, Hub und bei Bedarf Auth Overviews mit dem
   bewiesenen Singleton-/Replacement-Vertrag syncen.
2. `docs/qa/health-capture-reports.md` um bewiesene Report-first-, Singleton-,
   Zeitraum-, Lazy-, Chart-, Health-Export-V2- und Responsive-Abnahmen ergänzen.
3. Nur ausgeführte Runtime-Smokes und Owner-Gates dokumentieren.
4. Kurzen Owner-Recap zu Latest, Zeitraum, Lazy Loading und Write erstellen.
5. Finalen Full Contract Review durchführen und Findings korrigieren.
6. Sichtbare Änderung unter `Unreleased` in `CHANGELOG.md` erfassen.
7. Resume Card abschließen und Committext aus dem realen Diff ableiten.
8. Roadmap als `(DONE)` nach `docs/archive/` verschieben.

### S6-Ergebnis

- Source-of-Truth-Sync:
  - Root-README sowie Doctor View, Reports, Activity, Protein und State Layer
    beschreiben denselben report-first-, Range-only- und Singleton-Vertrag.
  - Charts, Hub und Auth benötigten nach dem Abgleich keine fachliche Änderung.
  - SQL-HOW-TO, Recovery-Runbook und DEV_ENVIRONMENT waren bereits kompatibel.
- QA und Changelog:
  - `HCR-008` und `HCR-011` sind als entfernte Altverträge reserviert.
  - `HCR-015` prüft den atomaren Singleton; `HCR-016` die report-first Doctor
    View mit Lazy Details, Chart-Snapshot und Health Export V2.
  - `CHANGELOG.md` dokumentiert Doctor View, Lifecycle, Export und
    Sicherheitsgrenzen unter `Unreleased`.
- Owner-Recap:
  - Beim Öffnen steht der aktuelle Arztbericht im Mittelpunkt.
  - Ohne Bericht erscheint erst nach erfolgreichem Read ein ruhiger Zero-State.
  - Ein neuer Bericht verwendet einen expliziten Zeitraum bis maximal 400 Tage.
  - Die vollständige Berechnung erfolgt vor jeder Datenbankänderung.
  - Beim Ersetzen bleiben ID und erste Erzeugungszeit stabil.
  - Fehler erhalten den letzten gültigen Bericht.
  - Einzelwerte und Verlauf laden erst nach bewusster Auswahl.
  - Das offene Chart behält seinen gewählten Zeitraum.
  - Der Health Export V2 bleibt der manuelle Maschinenzugang bis zum MCP.
  - Monatsberichte, Inbox und Archiv existieren nicht mehr.
- Finaler Review:
  - Produktvertrag, UI, API, Edge, SQL, QA, Recovery und Changelog sind
    widerspruchsfrei; kein neues In-Scope-Finding offen.

Abschlussfelder:

- Source-of-Truth-Sync / Finaler Review: `PASS`.
- Restrisiken: ausschließlich die dokumentierten Watchlist-Punkte `W-1` bis
  `W-3`.
- Changelog: `Unreleased`, ohne Release-Cut oder Versionssprung.
- Owner-Recap: maximal 10 bis 15 Punkte.
- Archivziel:
  - `docs/archive/MIDAS Doctor View Report-First Modernization Roadmap (DONE).md`.
- Vorläufige Commit-Empfehlung:

```text
feat(doctor): modernize the doctor view around reports
```

Exit: `ERFÜLLT` - Code, UI, QA, Overviews, Changelog und Roadmap beschreiben
denselben report-zentrierten Vertrag.
