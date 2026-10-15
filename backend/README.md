# MIDAS Backend Source

Dieses Verzeichnis enthaelt den versionierten MIDAS-Backend-Source fuer
Supabase Edge Functions.

## Source of Truth

Produktiver Backend-Source liegt im Repo unter:

- `backend/supabase/config.toml`
- `backend/supabase/functions/midas-assistant/index.ts`
- `backend/supabase/functions/midas-incident-push/index.ts`
- `backend/supabase/functions/midas-monthly-report/index.ts`
- `backend/supabase/functions/midas-protein-targets/index.ts`
- `backend/supabase/functions/midas-transcribe/index.ts`
- `backend/supabase/functions/midas-trendpilot/index.ts`
- `backend/supabase/functions/midas-tts/index.ts`
- `backend/supabase/functions/midas-vision/index.ts`

Der fruehere externe Workspace `C:/Users/steph/Projekte/midas-backend` war die
Importquelle. Nach dem Import ist dieser Repo-Pfad die technische Source of
Truth fuer Backend-Code. Der alte externe Workspace wurde entfernt;
Legacy-Backup ist kein aktueller Source- oder Wiederherstellungsanker.

## Deno Checks

Jede Function wird lokal einzeln statisch geprueft:

```powershell
deno check backend/supabase/functions/midas-assistant/index.ts
deno check backend/supabase/functions/midas-incident-push/index.ts
deno check backend/supabase/functions/midas-monthly-report/index.ts
deno check backend/supabase/functions/midas-protein-targets/index.ts
deno check backend/supabase/functions/midas-transcribe/index.ts
deno check backend/supabase/functions/midas-trendpilot/index.ts
deno check backend/supabase/functions/midas-tts/index.ts
deno check backend/supabase/functions/midas-vision/index.ts
```

`deno check` ist ein statischer Source-Check. Runtime-Smokes und echte
Supabase-Deploys bleiben separate, bewusst freigegebene Schritte.

Edge Functions verwenden `jsr:`-Imports. Der normale TypeScript-Server versteht
sie nicht zuverlässig; `.vscode/settings.json` aktiviert den Deno Language
Server gezielt für `backend/supabase/functions`. Keine `@ts-ignore`- oder
`ts-nocheck`-Workarounds für diese Imports. Vor Änderungen die betroffene
Function, Modul- und Roadmap-Dokumentation lesen; danach deren `deno check`,
`git diff --check` und `git status --short` ausführen.

Gemeinsame Deno-/Editorfakten stehen in
[ATLAS][ref-1].
Für den tatsächlichen Deno-Stand zählt `deno --version`, nicht gegebenenfalls
veraltete Wingetmetadaten nach Self-Update. Bei separat autorisiertem Update
kann der Deno Language Server die Binary blockieren; VS Code gegebenenfalls
vollständig schließen. Diese Hinweise autorisieren kein Update/Setup.

## Deploy Vertrag

Deploys sind nicht automatisch Teil von Source-Imports oder Roadmap-Checks.
Ein Supabase-Deploy wird nur nach expliziter Freigabe ausgefuehrt.

Die Supabase CLI bleibt extern installiert oder im `PATH`. Es wird keine
`supabase.exe` im Repo versioniert.

Repo-neutrale Deploy-Form aus dem Repository-Root:

```powershell
$line = Get-Content .env.supabase.local |
  Where-Object { $_ -match '^SUPABASE_PROJECT_REF=' } |
  Select-Object -First 1
$projectRef = $line.Split('=', 2)[1].Trim()
supabase functions deploy <function> `
  --project-ref $projectRef --workdir backend --use-api
```

Der CLI-Workdir ist `backend`, nicht `backend/supabase`. Die Projekt-Referenz
wird aus der lokalen, nicht versionierten Environment-Datei gelesen und nicht
in Logs oder Dokumentation ausgegeben.

Falls lokal ein absoluter CLI-Pfad genutzt wird, ist das lokale
Maschinenkonfiguration und kein Repo-Vertrag.

GitHub Actions in diesem Repo rufen produktive Function-URLs per Secret auf.
Sie sind Scheduler/Caller, nicht der lokale Backend-Source-Pfad.

Nicht `--workdir backend/supabase` verwenden: Die CLI würde darunter erneut
`supabase/functions` suchen. Ordnerumzug/Refactor allein erfordert keinen
Deploy; hash-identischer bereits deployter Source normalerweise ebenfalls
nicht. Optionaler Remote-Status, mit wertfrei geladenem Projectref aus dem
lokalen Operatorstore:

```powershell
supabase functions list --project-ref $env:SUPABASE_PROJECT_REF
```

Status, Sourcecheck, Deploy und Runtime-Smoke sind getrennt.
Der konkrete Ablauf steht im
[Deploy-Runbook](../docs/qa/runbooks/edge-function-deploy-smoke.md).
Gemeinsame Standalone-CLI und Hilfebefehl in
[ATLAS][ref-2],
keine globale npm-Installation als Ersatz. CLI-Hilfe startet keinen Stack.

## Secrets und Artefakte

Nicht ins Repo gehoeren:

- `.env` oder andere lokale Environment-Dateien
- Supabase `.temp`-Dateien
- `supabase.exe` oder andere CLI-Binaries
- `*.bak`
- `.vscode` oder andere lokale IDE-Konfiguration
- private Keys, PEM-Dateien oder `signing_keys*.json`

Secrets bleiben in Supabase, GitHub Secrets oder lokaler Maschinenkonfiguration.
Konkrete Consumer und kanonische Stores besitzt die wertfreie
[Operatorzuordnung][ref-3].

## Supabase Config Caveat

`backend/supabase/config.toml` ist CLI-/Local-Stack-Konfiguration. Die Datei
beweist nicht, dass ein vollstaendiger lokaler Supabase-Stack aus dem Repo
sofort startklar ist.

Die importierte Config referenziert:

```toml
sql_paths = ["./seed.sql"]
```

`backend/supabase/seed.sql` ist nicht Teil des freigegebenen Imports und wurde
nicht erzeugt. Diese Seed-Referenz bleibt ein lokaler Supabase-CLI-Caveat, bis
ein eigener SQL-/Migration-Scope definiert wird.

## Lokaler Supabase-Stack

Die CLI startet Dockercontainer für PostgreSQL, Auth, REST, Realtime und Studio;
der Stack ist kein separates Programm. Voraussetzungen: Docker Desktop mit
laufendem Linux-Daemon, Standalone-Supabase-CLI, optional WSL-`psql` für direkte
Checks. Kein Daemon oder Docker-Kontext wird aus Installation vorausgesetzt.
Kein zusätzlicher Windows-Datenbankserver ist erforderlich. Gemeinsame
[Client-/Dockerfakten][ref-4]
bleiben ATLAS.

Kontext ist `backend/supabase/config.toml`. Vom MIDAS-Repo-Root
`C:\Users\steph\Projekte\M.I.D.A.S`:

```powershell
supabase start --workdir backend
```

Nur bei bewusstem lokalem/disposable Testbedarf verwenden. Container- und
Volume-Löschungen vorab gegen den konkreten lokalen Testscope prüfen.
Start/Reset/Stop/Volume-Bereinigung vor Nutzung mit
`supabase <command> --help` gegen die installierte CLI prüfen.

- Die Config referenziert `./seed.sql`; die Datei wurde bewusst nicht erzeugt.
  Der dokumentierte Start warnt und läuft ohne Seed; `supabase db reset` vor
  Verwendung separat prüfen. Edgechecks/Deploys bleiben davon unabhängig.
- Historischer Nachweis 11.07.2026: PostgreSQL `17.6` erfolgreich für disposable
  SQL-/RPC-/Transition-/Retention-/Lock-Timeout-Tests verwendet; WSL-`psql`
  sprach den PostgreSQL-17-Server an. Keine neue Live-/Kompatibilitätsprüfung.
- Docker Desktop publiziert die lokalen Ports auf allen Windows-Hostinterfaces.
  Die Regel `MIDAS Local Supabase - Block Remote Inbound` blockiert Remote-
  Inbound TCP `54320-54329`; Loopback `127.0.0.1` blieb erlaubt und wurde damals
  per `psql` geprüft. Die Firewall ist Voraussetzung, kein heutiger Statusbeleg.
- Analytics/Vector ist für Medication-Datenbanktests nicht erforderlich.
  Docker Desktop dafür niemals unsicher auf `tcp://localhost:2375` exponieren.
- Lokaler Stack und produktives Projekt bleiben getrennt. Keine produktiven
  Secrets oder produktiven Datenbankkennwörter einspeisen. Verbindungsstrings,
  Passwörter und lokale Supabase-Statuswerte nicht in Doku, Logs oder Git.
- Dockerverfügbarkeit/lokaler PASS erteilt keine produktive Supabase- oder
  Cutoverfreigabe. Orakel und Cleanup gehören
  [BS-010][ref-5].

## Produktive SQL- und Workflowgrenzen

SQL Editor, Security Advisor und RLS Tester sind produktiv/produktionsnah.
Produktives SQL braucht explizite Ownerfreigabe; vorher SQL-Datei und Roadmap-/
Contractreview lesen. SQL-Ausgaben/Dashboardscreenshots ohne Secretwerte.
Der RLS Tester ersetzt keine versionierten Policies. Konkrete Grants und
Advisorinterpretation bleiben im
[SQL HOW-TO](../sql/HOW_TO.md#explicit-data-api-grants)
und [SQL-Cutover-Runbook](../docs/qa/runbooks/supabase-sql-cutover.md).
`auth_leaked_password_protection` ist Auth-Dashboardhygiene, kein
SQL-Grantthema.
GraphQL wird nicht aktiv genutzt; `pg_graphql` ist im dokumentierten produktiven
Projekt bewusst deaktiviert. Reaktivierung braucht eigenen Contract-/Security-
Review. Keine neue Runtimeverifikation durch diese Dokumentmigration.

Alle manuellen produktiven GitHub-Workflow-Runs sind owner-gated; vor dem
Smoke Workflowdatei lesen. Aufruf und fachliche Edge-Responseprüfung stehen im
[Deploy-Runbook][ref-6].

## Backup und Legacy

`C:\Users\steph\Projekte\Backup\supabase-local` enthält als datiertes Legacy-
Material eine alte `supabase.exe` und `backups/edge-functions-2026-05-01/...`.
Das ist keine Source of Truth oder aktuelle CLI-Auswahl. Produktiver Source
bleibt `backend/supabase/...`; der externe Backendworkspace wurde entfernt.
Recovery besitzt das
[Minimal-Recovery-Runbook](../docs/qa/runbooks/midas-minimal-recovery.md).
Offene native Migration und Legacyabschaltung bleiben
[zurückgestellt][ref-7].

[ref-1]: ../../codex-tools/apps/atlas/docs/WORKSTATION_CAPABILITIES.md#python-und-deno
[ref-2]: ../../codex-tools/apps/atlas/docs/WORKSTATION_CAPABILITIES.md#supabase-cli
[ref-3]: ../docs/reference/supabase/MIDAS%20Supabase%20Operator%20Key%20and%20Store%20Map.md
[ref-4]: ../../codex-tools/apps/atlas/docs/WORKSTATION_CAPABILITIES.md#docker-wsl-und-postgresql-client
[ref-5]: ../docs/qa/backend-supabase.md#bs-010---lokaler-supabase-stack-bleibt-von-produktion-getrennt
[ref-6]: ../docs/qa/runbooks/edge-function-deploy-smoke.md#github-workflow-smokes
[ref-7]: ../docs/reference/supabase/MIDAS%20Supabase%20Modernization%20Deferred%20Work%20and%20Recovery.md
