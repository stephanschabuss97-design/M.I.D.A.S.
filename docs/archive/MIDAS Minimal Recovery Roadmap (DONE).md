# MIDAS Minimal Recovery Roadmap

Kompakter projektspezifischer Vertrag. Die allgemeine Arbeitsweise steht in
`docs/templates/MIDAS Roadmap Workflow Contract.md`.

## Roadmap-Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Status | `DONE` |
| Modul / Bereich | Betriebsfähigkeit, Backup und Wiederherstellung |
| Owner / Kontext | Stephan; persönliches Single-User-System ohne kommerziellen Verfügbarkeitsvertrag |
| Erstellt am | `2026-07-21` |
| Letzter Stand | `2026-07-21, S6 abgeschlossen und Roadmap archivbereit` |
| Aktueller Schritt | `Abgeschlossen` |
| Risikoklasse | `R2` |
| Standard-Reviewtiefe | `Full` |
| Owner-Erklärmodus | `Briefing + S6-Recap` |
| Betroffene Hauptdateien | `CHANGELOG.md`, `docs/DEV_ENVIRONMENT.md`, `docs/qa/README.md`, neues Recovery-Runbook, Recovery-Artefakte außerhalb des Repos |
| Deploy relevant | `nein` |
| Produktive Schreibwirkung | `nein`; produktive Daten werden nur gelesen/exportiert |
| Workflow-Vertrag | `docs/templates/MIDAS Roadmap Workflow Contract.md` |
| Evidence-Datei | `nicht erforderlich`; sensible Artefakte und Prüfsummen bleiben außerhalb des Repos |
| Archivziel | `docs/archive/MIDAS Minimal Recovery Roadmap (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Session Resume Card

- Ziel:
  - Einen kleinen, verständlichen Rückweg für Ausfall von System-SSD oder
    Windows-Installation sowie Verlust des Supabase-Projekts schaffen, ohne
    MIDAS zu einem Hochverfügbarkeitssystem auszubauen.
- Unveränderliche Verträge:
  - GitHub bleibt primäre Code-Sicherung; Supabase bleibt primäre
    Betriebsplattform.
  - Gesundheitsdaten-Dumps, Secrets und Keystores werden nie committed.
  - Kein produktiver Restore, Deploy oder Secret-Wechsel in dieser Roadmap.
  - Lokale, noch nicht synchronisierte Browserdaten dürfen bei Geräteverlust
    verloren gehen.
- Erledigter Stand:
  - GitHub `main`, GitHub Pages und lokaler Commit sind identisch.
  - Supabase ist gesund; Free-Plan besitzt kein verfügbares physisches Backup
    und kein PITR.
  - Datenbank, Auth, Edge Functions, Cron, Secrets und Storage sind
    read-only inventarisiert.
  - Android verwendet den Debug-Keystore auf `C:`; eine zweite verschlüsselte
    Kopie liegt im aktuellen Recovery-Bundle auf `D:`.
  - S1 Full Contract Review ist abgeschlossen und seine Findings sind dem
    Zielvertrag zugeordnet.
  - Der minimale Recovery-Vertrag ist auf die zweite interne SSD `D:`,
    AES-verschlüsselte datierte Archive und zwei Generationen festgelegt.
  - Secret-Werte sind in zu bewahrende und wiederbeschaffbare Klassen
    getrennt; nur der Android-Keystore muss als bestehendes Artefakt erhalten
    bleiben.
  - S2 Full Contract Review ist abgeschlossen; F-RCV-13 bis F-RCV-19 sind
    korrigiert.
  - S3 hat Klartext-Staging, Credential-Eingabe, Dump-Zugang und
    Wiederaufbau-Abhängigkeiten abgesichert; F-RCV-20 bis F-RCV-26 sind
    korrigiert.
  - S4 Readiness ist grün: Docker und 7-Zip sind erreichbar, `D:` besitzt
    ausreichend freien Speicher und der Keystore liegt unter
    `C:\Users\steph\.android\debug.keystore`.
  - Der Supabase-CLI-Zugang ist authentifiziert, MIDAS ist remote gesund und
    das lokale Projekt ist mit `jlylmservssinsavlkdi` verknüpft.
  - S4.1 hat `RB-006`, redigiertes Wiederaufbauinventar und konkrete
    Recovery-Guards in `.gitignore` umgesetzt; F-RCV-28 und F-RCV-29 sind
    korrigiert.
  - S4.2 hat das exakte Supabase-Postgres-Image geladen und Rollen-, Schema-
    und Daten-Dumps erfolgreich erzeugt.
  - Das AES-256-Recovery-Bundle und seine Sidecar-Prüfsumme liegen geprüft auf
    `D:`; Klartext-Staging und temporäre Prozesse wurden entfernt.
  - F-RCV-30 bis F-RCV-34 sind korrigiert; Produktion blieb unverändert.
  - S4.3 hat Bundle, Sidecar, Rotation, Cleanup und Secret-Grenzen
    plausibilisiert und das Runbook in QA- und Dev-Dokumentation verlinkt.
  - Der Owner hat den Recovery-Eintrag im synchronisierten
    Microsoft-Kennwortmanager gespeichert und auf einem zweiten Gerät geprüft.
  - S5 hat `T-RCV-01` bis `T-RCV-08` grün abgeschlossen; Remote-Metadaten,
    Archiv-Integrität, Repo-Grenzen und Owner-Trockenlauf stimmen mit dem
    Recovery-Vertrag überein.
  - S6 hat Source-of-Truth-Dokumente und Changelog synchronisiert, den finalen
    Full Contract Review bestanden und den Owner-Recap festgehalten.
- Aktueller Schritt:
  - `Abgeschlossen`.
- Nächster erlaubter Schritt:
  - Commit und Push bleiben Owner-Aktionen.
- Offene Findings:
  - Keine offenen Findings; `F-RCV-01` und `F-RCV-12` bleiben bewusst
    zurückgestellte Watchlist-Punkte.
- Geänderte Dateien:
  - `.gitignore`.
  - `docs/MIDAS Minimal Recovery Roadmap.md`.
  - `docs/DEV_ENVIRONMENT.md`.
  - `docs/qa/README.md`.
  - `docs/qa/runbooks/midas-minimal-recovery.md`.
  - `CHANGELOG.md`.
- Gültige Nachweise:
  - initialer Contract Review vom `2026-07-21`.
  - S1 Read-only-Inventar und Full Contract Review vom `2026-07-21`.
  - S2 Laufwerks-/Werkzeuginventar und Full Contract Review vom `2026-07-21`.
  - S3 Security-/Dependency-Review und Full Contract Review vom `2026-07-21`.
  - S4 Readiness Review und Full Contract Review vom `2026-07-21`.
  - S4.1 Runbook-/Guard-Checks und Full Contract Review vom `2026-07-21`.
  - S4.2 Dump-, Bundle-, Integritäts- und Cleanup-Checks vom `2026-07-21`.
  - S4.3 Plausibilitäts-, Secret- und Doku-Sync-Checks vom `2026-07-21`.
  - S5 Integritäts-, Metadaten- und Owner-Abnahme vom `2026-07-21`.
  - S6 finaler Source-of-Truth- und Full Contract Review vom `2026-07-21`.
- Runtime-/Deploy-Stand:
  - unverändert.
- Offene Owner-Freigaben:
  - Keine.
- Stop-Bedingungen:
  - Keine Dump-, Secret- oder Keystore-Datei im Repo erzeugen.

## Zielvertrag

Prüfbares Endergebnis:

- Der aktuelle GitHub-Stand ist als ausreichende Code-Sicherung bestätigt;
  eine zweite verpflichtende Code-Backup-Pipeline wird nicht gebaut.
- Repo-extern auf `D:` existiert ein AES-verschlüsseltes, datiertes
  Recovery-Bundle mit einem logischen Supabase-Dump für Rollen, Schema und
  Daten sowie Prüfsummen.
- Der aktuell verwendete Android-Keystore ist außerhalb der System-SSD
  gesichert und über eine Prüfsumme identifizierbar.
- Ein versioniertes Runbook nennt die notwendigen Konfigurationen und
  Secret-Namen, aber keine Werte, und beschreibt die Wiederaufbau-Reihenfolge
  vom frischen PC bis zu einer wieder lauffähigen MIDAS-Instanz.
- Bestehende Secret-Werte sind kein verpflichtender Recovery-Anker. Das
  Runbook dokumentiert ihre Wiederbeschaffung oder Rotation; ein vorhandener,
  vom Owner separat verfügbarer nicht rekonstruierbarer Wert dürfte nur im
  geschützten Secret-Teil des Bundles liegen.
- Die Backup-Dateien und der verschlüsselte Archivcontainer bestehen einen
  leichten Plausibilitätscheck. Dieser wird
  ehrlich als Integritätsnachweis, nicht als vollständig bewiesener Restore
  bezeichnet.
- Das Recovery-Bundle wird im Jänner und Juli sowie vor bewusst destruktivem
  SQL manuell erneuert. Die zwei jüngsten Generationen bleiben erhalten. Es
  gibt keine automatische Backup-Pipeline.

Bewusst unverändert:

- PWA-Architektur, Datenmodell, RLS, Auth, Edge Functions, Cron-Jobs,
  GitHub-Workflows und Android-App-Verhalten.
- Supabase bleibt die primäre und im Alltag vertraute Plattform.
- Kein zweites produktives Supabase-Projekt, kein PITR, kein Hot Standby und
  kein industrieller 3-2-1-Backup-Vertrag.
- Keine Migration vom Android-Debug-Keystore auf ein neues Release-Signing.
- Kein Backup lokaler IndexedDB-Zwischenstände und keine Sicherung von
  Supabase Storage, solange MIDAS dort keine Nutzdaten besitzt.

## Problem und Ist-Zustand

- Beobachtung:
  - Repo und produktiver Code sind über GitHub gut rekonstruierbar; eine
    zusätzliche SSD-Kopie ist optional und ersetzt Git nicht.
  - Die PWA kann auf einem neuen Gerät unkompliziert wieder installiert
    werden.
  - Die aktuelle Supabase-Datenbank, Remote-Konfiguration und Android-
    Update-Signatur sind nicht vollständig durch eine Repo-Kopie abgedeckt.
  - Vorhandene lokale Backup-Artefakte sind kein vollständiger aktueller
    Datenbank- und Konfigurationsstand.
- Risiko oder Reibung:
  - Bei gleichzeitigem Verlust der Plattformdaten oder versehentlicher
    Projektlöschung wäre der Code vorhanden, die persönliche Langzeitdatenbank
    aber nicht aus dem Repo rekonstruierbar.
  - Ohne den bisherigen Android-Keystore kann eine neu gebaute APK unter
    Umständen nicht als Update über die installierte App gelegt werden.
  - Secret-Werte sind aus Dashboards nicht in jedem Fall exportierbar; eine
    reine Namensliste stellt sie nicht wieder her.
- Offene Hypothese:
  - Der aktuelle CLI-Dump enthält die für MIDAS erforderlichen Rollen,
    Schemas, Funktionen, Policies, Auth-Daten und Tabelleninhalte in einer
    plausibel wiederherstellbaren Form; S1 und S5 prüfen dies ohne Restore in
    eine zweite produktive Umgebung.

## Entscheidungslog

<!-- markdownlint-disable MD013 -->

| ID | Datum | Entscheidung | Warum | Betrifft |
| --- | --- | --- | --- | --- |
| D-RCV-01 | `2026-07-21` | Supabase und GitHub bleiben Primärschutz | MIDAS ist ein persönliches Single-User-System; parallele Infrastruktur wäre unverhältnismäßig. | Gesamtvertrag |
| D-RCV-02 | `2026-07-21` | Ein manuelles Recovery-Bundle ergänzt den Plattformschutz | Eine unabhängige Kopie schützt vor Bedienfehler, Kontoverlust oder Projektlöschung, ohne den Betrieb zu verkomplizieren. | S4.2 |
| D-RCV-03 | `2026-07-21` | Jänner und Juli plus vor destruktivem SQL reichen | Der Datenumfang und das reale Single-User-Risiko rechtfertigen keine tägliche Automation. Das verbleibende Zeitfenster wird bewusst akzeptiert. | Pflegevertrag |
| D-RCV-04 | `2026-07-21` | Kein vollständiger Hosted-Restore-Test | Ein zweites Projekt, Secret-Rotation und Runtime-Neuaufbau wären für den jetzigen Zweck zu groß. | Nicht-Scope |
| D-RCV-05 | `2026-07-21` | Gesundheitsdaten-Dumps bleiben außerhalb von Git und Cloud-Automation | Das Bundle enthält personenbezogene Gesundheitsdaten und darf nicht versehentlich veröffentlicht werden. | Security |
| D-RCV-06 | `2026-07-21` | Bestehenden Android-Keystore sichern, Signing nicht umbauen | Für Update-Kontinuität genügt derzeit die geschützte Kopie des tatsächlich verwendeten Schlüssels. | Android |
| D-RCV-07 | `2026-07-21` | Kein lokales Browserdaten-Backup | Supabase ist nach erfolgreichem Sync Source of Truth; Katastrophenschutz für ungesyncte Einträge wäre unverhältnismäßig. | Datenvertrag |
| D-RCV-08 | `2026-07-21` | Nur nicht rekonstruierbare Secret-Werte extern bewahren | Wiederbeschaffbare URLs, IDs und Plattformschlüssel benötigen keine zweite Klartextkopie; nicht rekonstruierbare Werte dürfen aber nicht nur als Name inventarisiert sein. | Secret-Vertrag |
| D-RCV-09 | `2026-07-21` | Zweite SSD ist lokaler Fallback, kein Offsite-Backup | Sie schützt vor Ausfall von `C:`, aber nicht vor Diebstahl, Brand oder Verlust des gesamten PCs. Dieses Restrisiko wird für den Single-User-Scope akzeptiert. | Schutzumfang |
| D-RCV-10 | `2026-07-21` | GitHub-`main` bleibt alleinige verpflichtende Code-Sicherung | Lokaler Commit, Remote-`main` und GitHub-Pages-Build zeigen auf denselben Stand; eine zweite Code-Pipeline hätte keinen zusätzlichen Nutzen. | Code-Recovery |
| D-RCV-11 | `2026-07-21` | Der aktuelle logische Dump ist Recovery-Anker für den Datenbankzustand | Das Repo besitzt SQL-Quellen, aber keine vollständige Migration-Historie und kein Seed; diese Lücke wird nicht in dieser Roadmap neu aufgebaut. | Datenbank-Recovery |
| D-RCV-12 | `2026-07-21` | Remote-Konfiguration wird getrennt vom Dump inventarisiert | Google OAuth, Redirects, zwei Cron-Jobs sowie Supabase-/GitHub-Secrets sind nicht vollständig aus Repo oder `.env.supabase.local` ableitbar. | Konfigurations-Recovery |
| D-RCV-13 | `2026-07-21` | Bundle-Ziel ist `D:\MIDAS-Recovery\MIDAS-Recovery_YYYY-MM-DD.7z` | `D:` ist die gesunde zweite interne NVMe-SSD; sie schützt vor Verlust von `C:`. `F:` ist ein externes USB-Laufwerk und für diesen kleinen Vertrag nicht erforderlich. | Speichervertrag |
| D-RCV-14 | `2026-07-21` | Jedes Bundle wird als AES-256-7z-Archiv mit verschlüsselten Dateinamen geschützt | Gesundheitsdaten, VAPID-Werte und Keystore dürfen auch bei unbelegtem BitLocker-Status nicht offen auf `D:` liegen. 7-Zip ist lokal vorhanden. | Security |
| D-RCV-15 | `2026-07-21` | Die zwei jüngsten datierten Bundle-Generationen bleiben erhalten | Ein fehlerhafter oder unvollständiger neuer Dump darf die letzte brauchbare Kopie nicht ersetzen; bei rund `21 MB` Datenbankgröße ist der Platzbedarf vernachlässigbar. | Pflegevertrag |
| D-RCV-16 | `2026-07-21` | Nur der Android-Keystore ist als bestehendes Artefakt zwingend zu bewahren | Er erhält Android-Updatekontinuität und kann nicht gleichwertig neu erzeugt werden. Plattformschlüssel einschließlich VAPID können rotiert und ihre Consumer neu konfiguriert werden. | Secret-/Signing-Vertrag |
| D-RCV-17 | `2026-07-21` | Regelpflege erfolgt im Jänner und Juli sowie unmittelbar vor destruktivem SQL | Feste Monate sind eindeutiger als ein gleitendes „halbjährlich“; Vor-Cutover-Sicherung begrenzt das größte Bedienrisiko. | Pflegevertrag |
| D-RCV-18 | `2026-07-21` | Das Archivkennwort bleibt getrennt von Repo, Archiv und Zielordner im synchronisierten Microsoft-Kennwortmanager | Eine Kennwortdatei neben dem Archiv würde den Schutz aufheben. Der Owner hat die Synchronisierung auf einem zweiten Gerät geprüft. | Zugriffsschutz |
| D-RCV-19 | `2026-07-21` | Ein neues VAPID-Paar plus erneute Push-Anmeldung ist der belegte Recovery-Pfad | Der produktive VAPID-Privatschlüssel ist weder aus Supabase auslesbar noch lokal gesichert. Der öffentliche Schlüssel liegt im Code; ohne passendes Private Key ist er nach Projektverlust nicht weiter nutzbar. | Push-Recovery |
| D-RCV-20 | `2026-07-21` | Klartext-Dumps dürfen nur kurzzeitig in einem zugriffsbeschränkten Staging-Ordner auf `D:` liegen | Der CLI-Dump benötigt Dateien. Nach erfolgreicher Archiv- und Inhaltsprüfung wird das Staging gelöscht; forensische Löschsicherheit wird im persönlichen Single-User-Scope nicht behauptet. | Datenschutz |
| D-RCV-21 | `2026-07-21` | Archivkennwörter werden ausschließlich über eine interaktive Owner-Eingabe gesetzt | Kennwörter dürfen weder in Shell-Argumenten noch in Skripten, Env-Dateien, Logs oder der Roadmap erscheinen. | Credential-Schutz |
| D-RCV-22 | `2026-07-21` | Zum Archiv gehört eine repo-externe `.sha256`-Sidecar-Datei | Der Container kann vor Entschlüsselung auf unveränderte Bytes geprüft werden; die internen Dateihashes bleiben im verschlüsselten Manifest. | Integritätscheck |
| D-RCV-23 | `2026-07-21` | S4.2 startet nur mit laufendem Docker, lokal exakt verknüpftem Projekt und interaktiv verfügbarem Datenbankkennwort | Docker ist im Readiness Review erreichbar; `backend/supabase/.temp/project-ref` fehlt weiterhin. Ein Reset des Datenbankkennworts ist keine still erlaubte Recovery-Aktion. | Tooling-Gate |
| D-RCV-24 | `2026-07-21` | Remote-Konfiguration erhält einen eigenen prüfbaren Wiederaufbau-Block | Der Dump deckt OAuth, API-/JWT-Schlüssel, Functions, Function-Secrets und Storage-Objekte nicht ab. MIDAS benötigt zusätzlich acht Functions mit `verify_jwt=true`, sechs installierte Erweiterungen und zwei benannte Cron-Jobs. | Recovery-Reihenfolge |
| D-RCV-25 | `2026-07-21` | Beide aufbewahrten Bundle-Generationen verwenden dasselbe Recovery-Kennwort | Bei einer bewussten Kennwortrotation bleibt der alte Kennwortmanager-Eintrag erhalten, bis kein Archiv mit dem alten Kennwort mehr aufbewahrt wird. | Kennwortpflege |

<!-- markdownlint-enable MD013 -->

## Owner-Briefing-Bedarf

- Erklärmodus:
  - `Briefing + S6-Recap`.
- Neue oder entscheidungsrelevante Konzepte:
  - Unterschied zwischen Code-Kopie, Datenbank-Dump, Secret-Inventar und
    Android-Signaturschlüssel.
  - Unterschied zwischen Integritätscheck und bewiesenem Voll-Restore.
- Geplante Briefing-Gates:
  - S4.2 vor dem Erzeugen oder Kopieren sensibler Artefakte.
- Nicht erneut zu erklären:
  - normale Git-, Markdown- und Linkprüfungen.

## Scope und Grenzen

In Scope:

- knappe Bestandsprüfung von GitHub, Supabase, Secrets und Android-Signing,
- ein manuell erzeugtes Recovery-Bundle außerhalb des Repos,
- ein kleines, versioniertes Recovery-Runbook,
- leichter Integritäts- und Vollständigkeitscheck,
- Doku- und QA-Sync.

Nicht in Scope:

- Hochverfügbarkeit, automatische Offsite-Backups oder tägliche Jobs,
- bezahlte Supabase-Backupoptionen oder PITR,
- zweites produktives Projekt und vollständiger Hosted-Restore,
- Wiederherstellung realer Secrets durch Offenlegung im Repo,
- Schema-/Migration-Historie vollständig neu aufbauen,
- PWA-, Android-, Edge-Function- oder Datenmodelländerungen,
- Schutz vor Diebstahl, Brand oder gleichzeitigem Verlust aller Laufwerke des
  PCs; dafür wäre später ein geschütztes Offsite-Medium erforderlich.

Roadmap-spezifische Guardrails:

- Der Zielordner muss auf `D:` und damit außerhalb von Repo und System-SSD
  liegen.
- Das Bundle darf nicht in Git, GitHub Actions oder unverschlüsselten
  allgemeinen Cloud-Speicher gelangen.
- In versionierter Doku stehen nur Secret-Namen, Herkunft und
  Wiederbeschaffungsweg, nie Secret-Werte.
- Vor dem ersten Dump müssen `.gitignore`-Guards aktiv sein; Staging ist nur
  unter `D:\MIDAS-Recovery\.staging\<Datum>` zulässig.
- Datenbank- und Archivkennwörter werden interaktiv durch den Owner eingegeben;
  keine Kennwortwerte in CLI-Argumenten, Chat, Skripten oder Dateien.
- Nach erfolgreicher Archivprüfung muss das Klartext-Staging fehlen. Ein
  abgebrochener Lauf hinterlässt kein freigegebenes Bundle und wird vor einem
  Neustart vollständig bereinigt.
- Eine erfolgreiche Dateiprüfung darf nicht als vollständig getesteter
  Disaster-Recovery-Prozess ausgegeben werden.

## Referenzen

Pflicht in S1:

- `README.md`
- `docs/DEV_ENVIRONMENT.md`
- `docs/templates/MIDAS Roadmap Workflow Contract.md`
- `backend/README.md`
- `backend/supabase/config.toml`
- `docs/qa/backend-supabase.md`
- `docs/qa/android-widget.md`
- `docs/qa/release-readiness.md`
- `.github/workflows/*.yml`
- [Supabase: Backup and Restore using the CLI](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)
- [Supabase: Database Backups](https://supabase.com/docs/guides/platform/backups)
- [Supabase: Restore a Platform Project to Self-Hosted](https://supabase.com/docs/guides/self-hosting/restore-from-platform)

Nur bei konkreter Vertragsfrage:

- `docs/qa/runbooks/supabase-sql-cutover.md`
- `docs/qa/runbooks/edge-function-deploy-smoke.md`
- `docs/qa/runbooks/android-device-smoke.md`
- relevante Module Overviews für dort dokumentierte Secret-Namen.

## Tool Permissions und Gates

Allowed:

- lokale read-only Inventare und Checks,
- Supabase-/GitHub-Remoteabfragen ohne Schreibwirkung,
- Dokuänderungen,
- Dump-Erzeugung nach Owner-Freigabe im festgelegten Zielordner auf `D:`,
- lokaler Hash-, Größen-, Struktur- und Secret-Leak-Check.

User-gated:

- Docker-Start und lokale Verknüpfung mit dem produktiven Projekt.
- Interaktive Eingabe des Datenbank- und Archivkennworts.
- Erzeugung und Kopie des sensiblen Recovery-Bundles auf `D:`.

Forbidden:

- Secrets ausgeben oder committen.
- fremde Worktree-Änderungen zurücksetzen.
- Scope, Datenwirkung oder Architektur still erweitern.
- produktiven Restore, Deploy, SQL-Write, Secret-Rotation oder Workflow-Run
  ausführen.
- Datenbank-Dumps oder Keystores im Repo ablegen.

## Statusmatrix

<!-- markdownlint-disable MD013 -->

| ID | Schritt | Reasoning | Status | Kompaktes Ergebnis |
| --- | --- | --- | --- | --- |
| S1 | Recovery-Iststand verifizieren | `GPT-5.6 Sol / High` | DONE | GitHub/Pages, Supabase, Remote-Konfiguration, Backups und Android-Signing inventarisiert; Full Review grün |
| S2 | Minimalen Recovery-Vertrag einfrieren | `GPT-5.6 Sol / High` | DONE | Zweite SSD, AES-Archiv, zwei Generationen, Secret-Klassen und Pflegefenster festgelegt; Full Review grün |
| S3 | Datenschutz, Bruchrisiken und Checks | `GPT-5.6 Sol / High` | DONE | Klartext-, Credential-, Tooling- und Dependency-Risiken begrenzt; Prüfvertrag T-RCV-01 bis T-RCV-08 festgelegt; Full Review grün |
| S4R | S4 Readiness Review | `GPT-5.6 Sol / High` | DONE | S4.1 ist sofort ausführbar; S4.2 bleibt hinter Projektlink-, Kennwort- und Bundle-Gate; Full Review grün |
| S4 | Recovery-Bundle und Runbook | `je Substep` | DONE | Runbook, Repo-Guards, geprüftes AES-Bundle, Passwort-Wiederzugang und Doku-Sync vollständig; Full Review grün |
| S5 | Integritäts- und Abschlussreview | `GPT-5.6 Sol / High` | DONE | T-RCV-01 bis T-RCV-08 grün; lokaler, Remote- und Owner-Nachweis konsistent; Full Review grün |
| S6 | Doku-Sync, Recap und Archiv | `GPT-5.6 Sol / Medium` | DONE | Sources of Truth und Changelog synchronisiert; Owner-Recap und Full Review grün; archivbereit |

<!-- markdownlint-enable MD013 -->

## Findings

<!-- markdownlint-disable MD013 -->

| ID | Severity | Typ | Status | Entscheidung / Zielschritt |
| --- | --- | --- | --- | --- |
| F-RCV-01 | `Watchlist` | Contract | `deferred` | Ein vollständiger Restore bleibt unbewiesen; erst bei höherem Schutzbedarf als eigene Roadmap behandeln. |
| F-RCV-02 | `P2` | Contract | `fixed` | Secret-Namensliste um einen geschützten Bereich im verschlüsselten Bundle für nicht rekonstruierbare Werte ergänzt. |
| F-RCV-03 | `P2` | Contract | `fixed` | Runbook beschreibt die Wiederaufbau-Reihenfolge, behauptet aber keinen getesteten End-to-End-Restore. |
| F-RCV-04 | `P2` | Scope | `fixed` | Separaten Doku-Substep in S4.3 integriert; keine unnötige vierte Umsetzungsphase. |
| F-RCV-05 | `P2` | Scope | `fixed` | Schutzversprechen auf System-SSD-/Windows-Ausfall begrenzt; vollständiger Standortverlust bleibt außerhalb des Scopes. |
| F-RCV-06 | `P2` | Security | `fixed` | S4.1 muss konkrete Recovery-Dump-/Bundle-Muster in `.gitignore` ergänzen; T-RCV-05 prüft den Guard. |
| F-RCV-07 | `P2` | Contract | `fixed` | S4.1 inventarisiert produktiven Google-OAuth-Provider, Web-/Android-Redirects und Wiederbeschaffungsweg; lokale `config.toml` gilt nicht als Remote-Beweis. |
| F-RCV-08 | `P2` | Contract | `fixed` | S2 klassifiziert Remote-Secrets statt `.env.supabase.local` als vollständige Quelle zu behandeln. |
| F-RCV-09 | `P2` | Contract | `fixed` | S4.1 nimmt beide aktiven Cron-Jobs und ihre versionierten SQL-Rekonstruktionsquellen ins Runbook auf. |
| F-RCV-10 | `P1` | Recovery | `fixed` | S4.2 hat aktuelle Rollen-, Schema- und Daten-Dumps im verschlüsselten Recovery-Bundle gesichert. |
| F-RCV-11 | `P1` | Recovery | `fixed` | S4.2 hat den verwendeten Debug-Keystore als zweite, verschlüsselte Kopie auf `D:` gesichert. |
| F-RCV-12 | `Watchlist` | Contract | `deferred` | Fehlende vollständige Migration-Historie und fehlender Seed werden nicht rekonstruiert; D-RCV-11 begrenzt den aktuellen Vertrag auf den logischen Dump. |
| F-RCV-13 | `P2` | Contract | `fixed` | Mehrdeutiges „extern“ durch den exakten repo-externen Zielpfad auf der zweiten internen SSD ersetzt. |
| F-RCV-14 | `P1` | Security | `fixed` | BitLocker-Status war ohne erhöhte Rechte nicht belegbar; D-RCV-14 verlangt deshalb unabhängig davon AES-256-Archivschutz. |
| F-RCV-15 | `P2` | Recovery | `fixed` | Einzelnes überschreibbares Bundle durch zwei datierte Generationen ersetzt. |
| F-RCV-16 | `P1` | Contract | `fixed` | Secret-Namen nach Wiederbeschaffbarkeit klassifiziert; nach S3 ist nur der Android-Keystore zwingend als bestehendes Artefakt zu bewahren. |
| F-RCV-17 | `P2` | Contract | `fixed` | Gleitendes „halbjährlich“ auf feste Pflegetermine im Jänner und Juli präzisiert. |
| F-RCV-18 | `P1` | Contract | `fixed` | S4.1 auf D-RCV-01 bis D-RCV-25 erweitert, damit Zielpfad, Archivschutz, Rotation, Kennworttrennung und Wiederaufbau-Abhängigkeiten verbindlich im Runbook landen. |
| F-RCV-19 | `P2` | Contract | `fixed` | Rotationscheck auf höchstens zwei Generationen präzisiert; beim Erstlauf ist genau ein valides Archiv korrekt. |
| F-RCV-20 | `P1` | Recovery | `fixed` | Kein lokal bewahrter VAPID-Privatschlüssel gefunden; falsches Erhaltungsversprechen durch D-RCV-19 mit Re-Key und erneuter Push-Anmeldung ersetzt. |
| F-RCV-21 | `P1` | Security | `fixed` | Kurzzeitige Klartext-Dumps mit festem Staging-Pfad, Zugriffsbeschränkung, sofortiger Archivierung und geprüftem Löschen begrenzt. |
| F-RCV-22 | `P1` | Security | `fixed` | Datenbank- und Archivkennwörter auf interaktive Owner-Eingabe beschränkt; keine Werte in Argumenten, Dateien oder Chat. |
| F-RCV-23 | `P1` | Tooling | `fixed` | Docker ist nun erreichbar; das Projekt bleibt lokal nicht verknüpft. D-RCV-23 hält Projektlink und DB-Kennwort als S4.2-Precondition fest. |
| F-RCV-24 | `P1` | Recovery | `fixed` | Dump-Abdeckung gegen offizielle Supabase-Doku abgegrenzt; Functions, Secrets, OAuth, Schlüssel, Erweiterungen und Cron erhalten eigene Runbook-Schritte. |
| F-RCV-25 | `P2` | Recovery | `fixed` | Containerintegrität zusätzlich über eine `.sha256`-Sidecar abgesichert; interne Dateien bleiben über das verschlüsselte Manifest prüfbar. |
| F-RCV-26 | `P2` | Contract | `fixed` | Manifest muss Projekt-Ref, Git-Commit, Dump-Zeitpunkt, CLI-/Postgres-Version und redigierte Objektzähler nennen, damit veraltete Bundles erkennbar sind. |
| F-RCV-27 | `P2` | Tooling | `fixed` | Readiness-Pfade präzisiert: 7-Zip ist über `PATH` erreichbar; der tatsächlich verwendete Keystore liegt unter `C:\Users\steph\.android\debug.keystore` und wird von dort gesichert. |
| F-RCV-28 | `P1` | Recovery | `fixed` | Google-OAuth-Recovery um den projektbezogenen Supabase-Callback in der Google-Konsole ergänzt; PWA- und Android-Redirects bleiben separat. |
| F-RCV-29 | `P1` | Security | `fixed` | Staging-Zugriff mit einem prüfbaren `icacls`-Schritt auf den aktuellen Windows-Benutzer begrenzt; ein fehlgeschlagener ACL-Schritt blockiert die Dumps. |
| F-RCV-30 | `P1` | Tooling | `fixed` | Registry-, Proxy- und Image-Diagnose durchgeführt; der exakte Build `17.6.1.025` wurde anschließend regulär geladen und `pg_dump 17.6` darin verifiziert. |
| F-RCV-31 | `P1` | Security | `fixed` | `supabase db dump --dry-run` gibt temporäre Login-Credentials aus; der Modus ist im produktiven Recovery-Runbook ausdrücklich verboten. |
| F-RCV-32 | `P2` | Contract | `fixed` | Zirkuläre Manifest-Prüfsumme vermieden: Das Manifest listet Payload-Dateien, `files.sha256` schützt Payload und Manifest, aber nicht sich selbst. |
| F-RCV-33 | `P1` | Security | `fixed` | Fehleranfällige direkte 7-Zip-Passwortwiederholung durch eine einmalige lokale SecureString-Eingabe ersetzt; Übergabe erfolgt nur flüchtig über `stdin`. |
| F-RCV-34 | `P2` | Security | `fixed` | Repo-Guard um `**/files.sha256` ergänzt, damit auch eine außerhalb von `.staging` kopierte interne Recovery-Prüfsummenliste ignoriert bleibt. |
| F-RCV-35 | `P1` | Recovery | `fixed` | Vager externer Kennwort-Wiederzugang durch einen synchronisierten Microsoft-Kennwortmanager ersetzt und vom Owner auf einem zweiten Gerät geprüft. |
| F-RCV-36 | `P2` | Recovery | `fixed` | Kennwortpflege über zwei Bundle-Generationen präzisiert: Entweder gilt dasselbe Kennwort für beide Archive oder der alte Kennwortmanager-Eintrag bleibt bis zur letzten alten Generation erhalten. |
| F-RCV-37 | `Watchlist` | Doku | `accepted` | Der Full-File-Lint von `DEV_ENVIRONMENT.md` meldet 40 bestehende MD013-Altbefunde außerhalb des Recovery-Blocks. Der neue Block hat keine Zeile über 80 Zeichen; eine globale Formatbereinigung bleibt außerhalb dieses Recovery-Scopes. |
| F-RCV-38 | `P2` | QA | `fixed` | Der erste Remote-Zähler meldete sieben Trigger-Ereigniszeilen, weil ein kombinierter INSERT-/UPDATE-Trigger zweimal erscheint. Der korrigierte Abgleich zählt sechs unterschiedliche Triggernamen und bestätigt den Dump statt einen falschen Drift zu melden. |

<!-- markdownlint-enable MD013 -->

## S1 - Recovery-Iststand verifizieren

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. Pflichtreferenzen und den Read-only-Auditstand lesen.
2. Git-Remote, Branch und veröffentlichbaren Code-Source verifizieren.
3. Supabase-Plan, Backupstatus, Datenbankumfang, Storage-Nutzung und lokale
   Vollbackup-Artefakte read-only prüfen.
4. Edge-Function-, GitHub-Workflow-, OAuth- und Secret-Namen inventarisieren,
   ohne Werte auszugeben.
5. Android-Signingquelle und vorhandene externe Sicherung verifizieren.
6. Contract Review durchführen, Findings korrigieren und S1 abnehmen.

Ergebnis:

- Systemkarte:
  - GitHub-Repo ist öffentlich; lokaler Commit, Remote-`main` und gebautes
    GitHub Pages zeigen auf `62d3fdae9bd83dcab416a11bccadb29229f839bd`.
  - Supabase-Projekt ist `ACTIVE_HEALTHY` auf PostgreSQL 17 im Free-Plan;
    Datenbankgröße `21 MB`, zehn öffentliche Tabellen, sechs Views,
    26 öffentliche Funktionen und ein Auth-Nutzer. Verfügbare physische
    Backups sind `null`, PITR ist deaktiviert.
  - Acht aktive Edge Functions entsprechen der lokalen Funktionsliste;
    37 öffentliche RLS-Policies und zwei aktive Cron-Jobs sind vorhanden.
  - Storage besitzt weder Bucket noch Objekt; dafür ist kein Backuppfad nötig.
  - Remote existieren app-spezifische Function- und fünf GitHub-Workflow-
    Secrets; die lokale Env-Datei enthält nur drei Arbeitswerte.
  - Es gibt keinen aktuellen Voll-Dump und keine zweite Keystore-Kopie; die
    alten Edge-Function-/SQL-Backups sind keine aktuelle Recovery-Quelle.
- Betroffene Schichten:
  - Code/Pages, Supabase DB/Auth/Functions/Cron, GitHub Actions, Google OAuth
    und Android-Signing.
- Belegte Verträge:
  - GitHub genügt für Code; Supabase-Dump, Remote-Konfiguration und Keystore
    bleiben getrennte Recovery-Artefakte.
- Offene Fragen:
  - Ziel-Laufwerk, Schutzform und Klassifikation der nicht rekonstruierbaren
    Secret-Werte werden in S2 entschieden.
- Doku-Sync:
  - S6.

Exit: Die tatsächlich fehlenden Artefakte sind belegt; vorhandene Sicherungen
werden nicht doppelt gebaut. `PASS`.

## S2 - Minimalen Recovery-Vertrag einfrieren

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. Erforderliche Bundle-Bestandteile aus S1 ableiten.
2. Repo-externen Zielort, Schutzart und Namensschema mit dem Owner festlegen.
3. Secret-Inventar in `wiederbeschaffbar` und `zu bewahren` klassifizieren.
4. Halbjahres- und Vor-Cutover-Aktualisierung final bestätigen.
5. Akzeptierte Restverluste und den fehlenden Voll-Restore-Nachweis festhalten.
6. Contract Review durchführen, Findings korrigieren und S2 abnehmen.

Ergebnis:

- Finaler Zielvertrag:
  - Zielordner: `D:\MIDAS-Recovery\` auf der zweiten internen SSD.
  - Namensschema: `MIDAS-Recovery_YYYY-MM-DD.7z`.
  - Schutz: 7z mit AES-256 und verschlüsselten Dateinamen; Kennwort getrennt
    vom Repo, Archiv und Zielordner verwahren.
  - Rotation: die zwei jüngsten datierten Archive behalten.
  - Inhalt je Archiv:
    - `database/roles.sql`, `database/schema.sql` und `database/data.sql`,
    - `android/debug.keystore`,
    - redigiertes Konfigurationsinventar und Recovery-Runbook-Snapshot,
    - Manifest mit Quellenstand, Größen und internen SHA-256-Prüfsummen,
    - repo-externe Sidecar-Datei mit SHA-256 des fertigen Archivs.
- Secret-Klassen:
  - `zu bewahren`: Android-Debug-Keystore. Ein bestehender VAPID-Satz wäre
    optional bewahrenswert, ist aktuell aber nicht lokal verfügbar.
  - `aus Restore ableitbar`: `INCIDENTS_USER_ID`,
    `MONTHLY_REPORT_USER_ID`, `PROTEIN_TARGETS_USER_ID` und
    `TRENDPILOT_USER_ID` aus dem wiederhergestellten Auth-Nutzer;
    `INCIDENTS_TZ` aus dem dokumentierten Vertrag.
  - `neu erzeugbar oder erneut abrufbar`: Supabase-URL und verwaltete
    Supabase-Schlüssel, GitHub-Workflow-URLs und Service-Role-Key,
    `OPENAI_API_KEY`, Google-OAuth-Credentials sowie ein neues VAPID-Paar.
    Provider, Projektbezug, Redirects und Wiederbeschaffungsweg werden ohne
    Werte inventarisiert. Nach VAPID-Rotation wird Push einmal neu angemeldet.
- Pflegevertrag:
  - regulär im Jänner und Juli,
  - zusätzlich unmittelbar vor destruktivem SQL oder einem Daten-Cutover,
  - keine Automation und keine zweite Betriebsumgebung.
- Bewusst akzeptierte Restverluste:
  - Falls Supabase und dessen Plattformschutz gleichzeitig ausfallen, können
    Änderungen seit dem jüngsten manuellen Dump verloren gehen; regulär sind
    das maximal ungefähr sechs Monate.
  - Noch nicht zu Supabase synchronisierte Browser-/PWA-Daten sind nicht
    gesichert.
  - Verlust des gesamten PCs einschließlich `C:` und `D:` ist nicht gedeckt.
  - Zugriff auf GitHub-, Supabase-, Google- und OpenAI-Konten bleibt eine
    Voraussetzung für die Wiederbeschaffung rotierbarer Konfiguration.
  - Dateiintegrität wird geprüft; ein vollständiger Restore bleibt bis zu
    einem späteren echten Bedarf unbewiesen.
- Abgrenzung:
  - `F:` und allgemeine Cloud-Speicher werden nicht Teil dieses Vertrags.
- Doku-Sync:
  - S6.

Exit: Speicherort, Inhalt, Schutz und Pflegeintervall sind eindeutig. `PASS`.

## S3 - Datenschutz, Bruchrisiken und Checks

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. Gesundheitsdaten-, Secret- und Keystore-Leaks prüfen.
2. Falsche Sicherheit durch veralteten oder unvollständigen Dump prüfen.
3. Abhängigkeiten zwischen Auth, Datenbank, Edge Functions, GitHub Actions,
   OAuth und Android-Signing prüfen.
4. Stop-Bedingungen und einen nicht destruktiven Prüfvertrag festlegen.
5. S4-Substeps und sichere Ausführungsblöcke finalisieren.
6. Contract Review durchführen, Findings korrigieren und S3 abnehmen.

Ergebnis:

- Blockierende Risiken:
  - `.gitignore`-Guards fehlen vor der Dump-Erzeugung.
  - Ziel- oder Staging-Pfad liegt nicht unter `D:\MIDAS-Recovery\`.
  - Docker ist nicht erreichbar, der lokale CLI-Kontext zeigt nicht exakt auf
    `jlylmservssinsavlkdi` oder das DB-Kennwort ist interaktiv nicht verfügbar.
  - Ein Kennwort müsste in Chat, Kommandoargument, Skript, Env-Datei oder Log
    geschrieben werden.
  - Archivtest, interne Prüfsummen, Sidecar-Prüfsumme oder Staging-Bereinigung
    schlagen fehl.
- Wiederaufbau-Abhängigkeiten:
  - Dump: Rollen, Schema, Policies, Funktionen, Trigger, Tabelleninhalte und
    `auth.users`.
  - Separat: Google-OAuth/Redirects, neue Plattformschlüssel, acht Edge
    Functions mit `verify_jwt=true`, Function-Secrets und GitHub-Secrets.
  - Erweiterungen: `pg_cron`, `supabase_vault`, `pg_stat_statements`,
    `plpgsql`, `uuid-ossp` und `pgcrypto` sind aktuell installiert.
  - Cron: `sql/17_Medication_Retention.sql` und
    `sql/18_Push_Data_Hygiene.sql` rekonstruieren die zwei aktiven Jobs.
  - Clients: neue Supabase-URL und Publishable-/Anon-Key erneut in PWA und
    Android konfigurieren; hart codierte Function-URL in
    `app/modules/hub/index.js` bei neuer Project-Ref anpassen.
  - Push: neues VAPID-Paar in Function-Secrets und
    `app/modules/push/index.js` eintragen, danach Subscription neu anmelden.
  - Android: bestehende APK mit der gesicherten `debug.keystore` signieren,
    damit Update-Kontinuität erhalten bleibt.
- Rollback-/Stop-Vertrag:
  - Bei jeder Abweichung Lauf stoppen, unfertiges Archiv und Klartext-Staging
    auf `D:` verwerfen und Produktion unverändert lassen.
  - Kein Datenbankkennwort-Reset, Secret-Wechsel, Deploy oder Restore als
    stiller Teil dieser Roadmap.
  - Während der drei Dump-Aufrufe wird MIDAS nicht benutzt; Schemaänderungen
    sind im Backupfenster verboten.
- S5-Pflichtchecks:
  - `T-RCV-01` bis `T-RCV-08`.
- Doku-Sync:
  - S6.

Exit: Das Bundle kann nach Owner-Gate ohne produktive Änderung sicher erzeugt
werden. `PASS`.

## S4 Readiness Review

Reasoning: `GPT-5.6 Sol / High`.

<!-- markdownlint-disable MD013 -->

| Substep | Änderung | Findings | Dateien / Artefakte | Review | Checks | Gate |
| --- | --- | --- | --- | --- | --- | --- |
| S4.1 | Recovery-Runbook, Inventarschema und Repo-Guards erstellen | F-RCV-06 bis F-RCV-09, F-RCV-18, F-RCV-24, F-RCV-27 | `docs/qa/runbooks/midas-minimal-recovery.md`, `.gitignore` | Full | T-RCV-01, T-RCV-05, T-RCV-07 | none |
| S4.2 | Recovery-Bundle auf zweiter SSD erzeugen | F-RCV-10, F-RCV-11, F-RCV-14 bis F-RCV-17, F-RCV-19, F-RCV-21 bis F-RCV-23, F-RCV-25, F-RCV-26 | `.7z`, `.7z.sha256` und temporäres Staging auf `D:` | Full | T-RCV-02 bis T-RCV-05, T-RCV-08 | Owner |
| S4.3 | Bundle plausibilisieren, Pflegeablauf prüfen und Doku verlinken | F-RCV-01, F-RCV-03 bis F-RCV-05 | Runbook, Bundle auf `D:`, `docs/qa/README.md`, `docs/DEV_ENVIRONMENT.md` | Full | T-RCV-01 bis T-RCV-08 | none |

<!-- markdownlint-enable MD013 -->

- Reihenfolge/Abhängigkeiten:
  - bestätigt: S4.1 definiert zuerst Runbook und Repo-Guards; S4.2 erzeugt erst
    danach sensible Artefakte; S4.3 prüft und verlinkt nur das fertige Ergebnis.
- Fehlende Zuordnung:
  - none; alle offenen Findings sind einem S4-Substep oder der Watchlist
    zugeordnet.
- Evidence:
  - keine separate Datei; in der Roadmap stehen nur Datum, Artefaktklassen und
    Prüfergebnis, nie Dump-Inhalte, Secrets oder Keystore-Daten.
- Owner-Gates:
  - vor S4.2: exakte lokale Verknüpfung mit `jlylmservssinsavlkdi`,
    interaktiv verfügbares Datenbank- und Archivkennwort sowie Freigabe zur
    Bundle-Erzeugung. Docker ist bereits grün.
- Empfohlene S4-Ausführungsblöcke:
  - S4.1 separat; S4.2 nach Owner-Gate separat; S4.3 separat.
- Begründung der Trennung:
  - Das Runbook definiert zuerst den Vertrag. Erst danach dürfen sensible
    Artefakte entstehen. S4.2 bleibt wegen Projektlink, zwei interaktiven
    Kennwörtern und Klartext-Staging ein eigener Owner-Gate.
    Prüfung und Doku-Sync besitzen anschließend keine produktive Wirkung.
- Review je Ausführungsblock:
  - jeweils Full Review; Substep-Ergebnisse und Findings bleiben getrennt.
- Readiness-Findings/Korrekturen:
  - F-RCV-27 ergänzt und korrigiert: `7z.exe` ist über `PATH` erreichbar; der
    Keystore liegt unter `C:\Users\steph\.android\debug.keystore`.
  - Docker `29.6.1` ist erreichbar, `D:` besitzt rund `1680 GB` freien
    Speicher und `D:\MIDAS-Recovery` existiert noch nicht.
  - Supabase CLI ist authentifiziert und zeigt MIDAS als `ACTIVE_HEALTHY` mit
    PostgreSQL `17.6.1.025`; der lokale Projektlink fehlt erwartungsgemäß noch.

Exit: S4 kann ohne neue Grundsatzentscheidung beginnen; sichere Einzelgates
und Nachweise sind festgelegt. `PASS`.

## S4 - Recovery-Bundle und Runbook

### S4.1 - Minimales Recovery-Runbook

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - D-RCV-01 bis D-RCV-25.
- Dateien:
  - `docs/qa/runbooks/midas-minimal-recovery.md`, `.gitignore`.
- Umsetzung:
  - Ausgangslage, Bundle-Inhalt, sichere Erstellung, Wiederaufbau-Reihenfolge,
    Secret-Klassen, Android-Signing, Abbruchregeln und Halbjahrespflege
    dokumentieren. Google OAuth/Redirects und beide Cron-Jobs als eigene
    Remote-Konfiguration aufnehmen. Installierte Erweiterungen, acht
    `verify_jwt=true`-Functions, Client-Neukonfiguration und VAPID-Re-Key als
    eigene Wiederaufbau-Schritte aufnehmen; konkrete Dump-, Staging-,
    Keystore-, Manifest- und Bundle-Muster vor S4.2 in `.gitignore` sperren.
- Review:
  - `Full`.
- Gate:
  - `none`.

Exit: Ein neuer Chat und Stephan verstehen, was gesichert wird und warum.

#### Ergebnis S4.1

- Änderung:
  - `RB-006` beschreibt Bundle-Inhalt, redigiertes Remote-Inventar, sichere
    Erzeugung, Abbruchregeln, Pflege und die begrenzte Wiederaufbau-Reihenfolge.
  - `.gitignore` blockiert Recovery-Archive, Sidecars, Staging, Dump-Dateien
    im Bundle-Schema, Manifest und redigiertes Inventar im Repo.
- Prüfung:
  - Runbook gegen D-RCV-01 bis D-RCV-25, acht Remote-Functions, sechs
    Erweiterungen, zwei Cron-Jobs und alle dokumentierten Secret-Namen geprüft.
  - `git check-ignore`, Markdown-/UTF-8-/Whitespace- und Secret-Shape-Scan grün;
    kein Dump, Keystore oder Bundle erzeugt.
- Finding/Korrektur:
  - F-RCV-28: Google-Provider-Callback ergänzt.
  - F-RCV-29: Staging-ACL als deterministischer Windows-Schritt ergänzt.
- Restrisiko:
  - Vollständiger Restore bleibt gemäß F-RCV-01 unbewiesen.
- Doku-Sync:
  - QA- und Dev-Environment-Verlinkung folgt in S4.3.
- Status:
  - `DONE`.

### S4.2 - Recovery-Bundle auf zweiter SSD

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - D-RCV-02, D-RCV-03, D-RCV-05, D-RCV-06, D-RCV-08, D-RCV-09 und
    D-RCV-11 sowie D-RCV-13 bis D-RCV-25.
- Artefakte außerhalb des Repos:
  - Supabase `roles.sql`, `schema.sql` und `data.sql`,
  - Kopie von `C:\Users\steph\.android\debug.keystore`,
  - Secret-/Konfigurationsinventar mit Namen und Wiederbeschaffungswegen,
  - Manifest mit Datum, Project-Ref, Git-Commit, CLI-/Postgres-Version,
    redigierten Objektzählern, Dateigrößen und internen Prüfsummen,
  - Sidecar-Datei mit SHA-256 des verschlüsselten Archivs.
- Umsetzung:
  - Nach grünem Repo-Guard Docker starten und das lokale CLI interaktiv mit
    exakt `jlylmservssinsavlkdi` verknüpfen. Datenbankkennwort nicht als
    Argument oder Datei speichern.
  - MIDAS während des Dumps nicht benutzen. Rollen, Schema und Daten in einem
    zugriffsbeschränkten Staging unter `D:\MIDAS-Recovery\.staging\<Datum>`
    erzeugen und alle weiteren Bundle-Artefakte dort zusammenstellen.
  - Archivkennwort ausschließlich durch den Owner interaktiv setzen. Das
    AES-256-Archiv mit verschlüsselten Dateinamen öffnen und testen, interne
    Prüfsummen sowie Sidecar verifizieren und erst danach Staging löschen.
  - Nur ein vollständig geprüftes Archiv freigeben und anschließend auf
    höchstens zwei datierte Generationen rotieren.
- Review:
  - `Full`.
- Gate:
  - Owner Briefing und Freigabe für Docker-Start, lokalen Projektlink,
    interaktive Kennworteingaben und Bundle-Erzeugung.

Exit: Alle vereinbarten Artefaktklassen liegen geschützt, repo-extern und
datiert auf `D:` vor.

#### Ergebnis S4.2

- Änderung:
  - Aktuelle Rollen-, Schema- und Daten-Dumps, Debug-Keystore, redigiertes
    Konfigurationsinventar, Runbook-Snapshot, Manifest und interne Prüfsummen
    wurden als datiertes Recovery-Bundle auf `D:` gesichert.
- Prüfung:
  - Remote-Inventar: 10 Public-Tabellen, 6 Views, 26 Funktionen, 1 Auth-Nutzer,
    2 Cron-Jobs, 8 aktive JWT-geschützte Edge Functions und 6 dokumentierte
    Erweiterungen.
  - Dump-Struktur: 10 Tabellen, 6 Views, 26 Funktionen, 37 Policies und
    6 Trigger; Auth-Nutzer und erwartete MIDAS-Daten sind enthalten.
  - Das AES-256-Archiv mit verschlüsselten Dateinamen wurde vollständig
    getestet; interne Prüfsummen und Sidecar-SHA-256 stimmen.
- Finding/Korrektur:
  - F-RCV-30 bis F-RCV-34 geschlossen und Runbook beziehungsweise
    `.gitignore` entsprechend präzisiert.
- Restrisiko:
  - Der logische Dump ist plausibilisiert; ein vollständiger Restore bleibt
    gemäß F-RCV-01 bewusst unbewiesen.
- Cleanup:
  - Das Klartext-Staging und temporäre Statusartefakte wurden nach erfolgreicher
    Prüfung entfernt; genau eine gültige Generation bleibt auf `D:` erhalten.
  - Keine produktive Daten-, Secret-, Deploy- oder Konfigurationsänderung.
- Status:
  - `DONE`.

### S4.3 - Plausibilitätscheck und Doku-Sync

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - D-RCV-20 bis D-RCV-25 und F-RCV-01.
- Umsetzung:
  - Dateigrößen, Prüfsummen, erwartete SQL-Strukturen, enthaltene MIDAS-
    Objekte und Bundle-Vollständigkeit prüfen; keine Wiederherstellung in
    Produktion oder ein zweites Hosted-Projekt ausführen. Zusätzlich prüfen,
    dass Staging gelöscht, höchstens zwei Generationen vorhanden und keine
    Kennwörter oder Secret-Werte in Repo, Shell-Historie oder redigierter Doku
    gelandet sind. Runbook anschließend in `docs/qa/README.md` und
    `docs/DEV_ENVIRONMENT.md` verlinken.
- Review:
  - `Full`.
- Gate:
  - `none`.

Exit: Das Bundle ist lesbar und plausibel; die Grenze des Nachweises ist
sichtbar dokumentiert und Recovery ist ohne neue Doku-Monolithen auffindbar.

#### Ergebnis S4.3

- Änderung:
  - Recovery-Runbook in `docs/qa/README.md` und `docs/DEV_ENVIRONMENT.md`
    verlinkt; Dev-Doku um Zielpfad, Pflegeintervall und Sicherheitsgrenzen
    ergänzt.
- Prüfung:
  - Archiv und Sidecar stimmen, genau eine Generation liegt vor und das
    Klartext-Staging fehlt.
  - Repo, geänderte Dokumente und Shell-Historie enthalten keine erkannten
    Dumps, Keystores, Kennwortwerte oder Secret-Werte.
  - Der Owner hat den Kennwortmanager-Eintrag und dessen Synchronisierung auf
    einem zweiten Gerät bestätigt.
  - Roadmap, Runbook und QA-Index sind markdownlint-grün. Der neue Recovery-
    Block in `DEV_ENVIRONMENT.md` ist MD013-konform; F-RCV-37 grenzt den
    bestehenden Full-File-Baselinebefund ab.
- Finding/Korrektur:
  - F-RCV-35 und F-RCV-36 geschlossen; Kennwort-Wiederzugang und Pflege über
    zwei Bundle-Generationen sind konkret dokumentiert.
  - F-RCV-37 als bestehender, nicht recovery-spezifischer Doku-Baselinebefund
    akzeptiert; keine scope-fremde Formatbereinigung durchgeführt.
- Restrisiko:
  - Ein vollständiger Restore bleibt gemäß F-RCV-01 bewusst unbewiesen.
- Status:
  - `DONE`.

## S5 - Integritäts- und Abschlussreview

Reasoning: `GPT-5.6 Sol / High`.

<!-- markdownlint-disable MD013 -->

| ID | Ebene | Check | Status | Nachweis | Invalidiert durch |
| --- | --- | --- | --- | --- | --- |
| T-RCV-01 | lokal | Markdown, Links und `git diff --check` | PASS | Recovery-Dokumente 0 Lintfehler; Links und Diff-Check grün | Dokuänderung |
| T-RCV-02 | `D:`/lokal | Bundle-Manifest nennt alle Artefaktklassen; Archivnamen entsprechen D-RCV-13 und es liegen höchstens zwei Generationen vor | PASS | Acht Artefaktklassen in S4.2 geprüft; ein datiertes Archiv mit unverändertem Hash | Bundle-Änderung |
| T-RCV-03 | `D:`/lokal | Dump-Dateien sind nicht leer und enthalten erwartete MIDAS-Objekte | PASS | S4.2: 10 Tabellen, 6 Views, 26 Funktionen, 37 Policies und 6 Triggernamen | neuer Dump |
| T-RCV-04 | `D:`/lokal | AES-Archiv lässt sich mit getrenntem Kennwort öffnen; Prüfsummen stimmen und Keystore-Kopie ist vorhanden | PASS | S4.2-Inhaltstest grün; aktueller Sidecar-Hash identisch; Kennwortzugang und Keystore bestätigt | Kopie oder Bundle-Änderung |
| T-RCV-05 | lokal | Repo und geänderte Doku enthalten keine Dumps, Keys oder Secrets | PASS | 0 verbotene Recovery-Artefakte; 0 erkannte Secret-Wertformen; Ignore-Proben 10/10 | Dateiänderung |
| T-RCV-06 | Owner | Runbook vom frischen PC bis zum erwarteten Zielzustand trocken durchgehen | PASS | Owner-Abnahme im Chat am 2026-07-21 | Runbook-Änderung |
| T-RCV-07 | remote/lokal | Runbook nennt acht `verify_jwt=true`-Functions, sechs installierte Erweiterungen, zwei Cron-Jobs sowie OAuth-, Client- und VAPID-Re-Key-Schritte | PASS | 8/8 Functions, 6/6 Erweiterungen, 2/2 Cron-Verträge und 11/11 Wiederaufbaumarker | Remote- oder Runbook-Änderung |
| T-RCV-08 | `D:`/lokal | Manifest nennt Project-Ref, Git-Commit, Dump-Zeit, CLI-/Postgres-Version und redigierte Objektzähler; Staging fehlt nach Freigabe | PASS | Manifestfelder in S4.2 geprüft; Sidecar grün; Staging fehlt | neuer Dump oder Bundle-Änderung |

<!-- markdownlint-enable MD013 -->

Ergebnis:

- Grüne Nachweise:
  - `T-RCV-01` bis `T-RCV-08`.
  - Remote-Abgleich: 10 Public-Tabellen, 6 Views, 26 Funktionen, 37 Policies,
    6 unterschiedliche Triggernamen, 1 Auth-Nutzer und 2 aktive Cron-Jobs.
  - Alle acht aktiven Edge Functions verwenden weiterhin `verify_jwt=true`;
    die sechs dokumentierten Erweiterungen sind installiert.
  - Das aktuelle Archiv besitzt `646880` Bytes, seine Sidecar stimmt und genau
    eine Generation liegt ohne Klartext-Staging auf `D:`.
  - Der erfolgreiche AES-Inhaltstest aus S4.2 bleibt durch den unveränderten
    Archivhash gültig; S5 hat kein Kennwort erneut gelesen oder verarbeitet.
- Nicht ausgeführte Smokes:
  - kein produktiver oder Hosted-Restore; F-RCV-01 bleibt sichtbar.
- Produktiver Iststand:
  - unverändert.
- Contract Review:
  - `PASS`; F-RCV-38 korrigiert eine mehrdeutige Triggerzählung.
  - Keine offenen In-Scope-P0/P1-Findings. F-RCV-01, F-RCV-12 und F-RCV-37
    bleiben transparent als bewusst akzeptierte Watchlist-Punkte bestehen.
- Externer Review:
  - optional; Findings werden bewertet, nicht blind übernommen.
- Commit-Entscheidung:
  - erst nach grünen Checks und S6.

Exit: Das minimale Recovery-Bundle ist vollständig und ehrlich bewertet.

## S6 - Doku-Sync und Abschluss

Reasoning: `GPT-5.6 Sol / Medium`.

Deterministisch:

1. Dev Environment, QA-Einstieg und Recovery-Runbook final synchronisieren.
2. Sicherstellen, dass keine sensitiven Artefakte oder Werte im Repo liegen.
3. Owner Recap in Alltagssprache zu Code, Dump, Secrets, Keystore und
   bewusst akzeptierten Restlücken schreiben.
4. Finalen Full Contract Review durchführen.
5. Findings korrigieren; In-Scope-P0/P1 müssen geschlossen sein.
6. Changelog-Relevanz entscheiden, ohne Release-Cut oder Git-Tag.
7. Resume Card und Statusmatrix abschließen.
8. Commit-Empfehlung aus dem realen Diff ableiten.
9. Roadmap mit `(DONE)` nach `docs/archive/` verschieben.

Ergebnis:

- Source-of-Truth-Sync:
  - `docs/DEV_ENVIRONMENT.md`, `docs/qa/README.md`, Recovery-Runbook und
    `CHANGELOG.md` stimmen mit dem bewiesenen Recovery-Vertrag überein.
- Finaler Review:
  - `PASS`; keine offenen In-Scope-P0/P1-Findings.
  - F-RCV-01, F-RCV-12 und F-RCV-37 bleiben bewusst sichtbar und wurden nicht
    still geschlossen.
- Restrisiken:
  - Kein vollständiger Restore-Test; der manuelle Dump kann bis zum nächsten
    Pflegefenster altern und der gleichzeitige Verlust von `C:` und `D:` ist
    nicht abgedeckt.
- Changelog-Relevanz:
  - `ja`; der neue operative Recovery-Vertrag ist unter `Unreleased / Added`
    erfasst. Es erfolgt weder Release-Cut noch Git-Tag.
- Owner Recap:
  1. GitHub bleibt die verlässliche Kopie des MIDAS-Codes.
  2. Supabase bleibt der laufende Hauptspeicher für synchronisierte Daten.
  3. Auf `D:` liegt zusätzlich ein unabhängiges, verschlüsseltes Recovery-
     Archiv.
  4. Das Archiv enthält Rollen, Schema und den aktuellen Datenbestand als
     logische SQL-Dumps.
  5. Der Android-Keystore ist mitgesichert, damit spätere APKs weiterhin als
     Update derselben App installiert werden können.
  6. Secret-Werte werden nicht kopiert; das Inventar erklärt nur, welche Werte
     im Notfall neu beschafft oder neu erzeugt werden müssen.
  7. Das Archivkennwort liegt ausschließlich im synchronisierten
     Microsoft-Kennwortmanager und wurde auf einem zweiten Gerät geprüft.
  8. Ein neues Bundle wird im Jänner, im Juli und vor destruktivem SQL erzeugt.
  9. Höchstens zwei Generationen bleiben erhalten; ein Kennwortwechsel darf
     keine noch aufbewahrte ältere Generation unzugänglich machen.
  10. Nach einem Projektverlust werden OAuth, Edge Functions, Secrets, Cron,
      Clients und Push bewusst neu verbunden; ein Dump erledigt das nicht.
  11. Das aktuelle Bundle wurde vollständig plausibilisiert, aber nicht in ein
      zweites Hosted-Projekt zurückgespielt.
  12. MIDAS selbst, seine produktiven Daten und seine Laufzeit wurden durch
      diese Roadmap nicht verändert.
- Archiv:
  - `docs/archive/MIDAS Minimal Recovery Roadmap (DONE).md`.

Exit: MIDAS besitzt einen kleinen unabhängigen Rückweg, ohne dass sein Betrieb
oder seine Wartung unnötig kompliziert wurde.
