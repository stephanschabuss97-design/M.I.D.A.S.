# MIDAS Dev Environment

Dieses Dokument beschreibt die lokale Entwicklungsumgebung fuer MIDAS. Es ist bewusst fuer Stephan und fuer kuenftige LLM-/Coding-Agent-Chats geschrieben: Ein neuer Chat soll schnell erkennen, welche lokalen Werkzeuge vorhanden sind, welche Checks moeglich sind und welche Grenzen gelten.

Dieses Dokument ist kein Produktkonzept und keine vollstaendige Architektur-Doku. Es beschreibt die lokale Werkstatt: verfuegbare Tools, erlaubte Checks, Standardbefehle und klare Grenzen fuer Deploys, Secrets und produktive Runtime-Aktionen.

## Ziel

- Schnell klaeren, welche Tools lokal verfuegbar sind.
- Wiederholbare Checks fuer Frontend, Backend, Supabase Edge Functions und Android ermoeglichen.
- Deploy- und Secret-Grenzen eindeutig halten.
- Neue Chats davor schuetzen, falsche Annahmen ueber externe Backend-Ordner oder fehlende Tools zu treffen.

## Grundvertrag

- MIDAS-Repo: `C:\Users\steph\Projekte\M.I.D.A.S`
- Produktiver Backend-Source: `backend/supabase/...`
- Alter externer Backend-Workspace: entfernt.
- Altes lokales Backup/CLI-Artefakt: `C:\Users\steph\Projekte\Backup\supabase-local`
- Lokale Secrets: `.env.supabase.local`
- `.env.supabase.local` ist lokal vorhanden und per `.gitignore` ausgeschlossen.
- Keine Secret-Werte in Doku, Logs, Commits oder Antworten ausgeben.
- Kein Supabase Deploy ohne ausdrueckliche Freigabe.
- Keine produktiven GitHub-Workflow-Runs ohne ausdrueckliche Freigabe.

## Codex-Startvertrag

Dieser Abschnitt ist der kurze Arbeitsvertrag fuer neue Codex-/LLM-Chats.

- Zuerst `README.md`, dieses Dokument, relevante Module Overviews und aktive
  Roadmaps lesen.
- Bei einer neuen Roadmap werden die in S1 genannten Pflichtreferenzen
  vollständig gelesen.
- Beim Erstellen einer Roadmap
  `docs/templates/README.md` sowie
  `docs/templates/MIDAS Roadmap Workflow Contract.md` vollständig lesen und
  `docs/templates/MIDAS Roadmap Template.md` als projektspezifischen Vertrag
  verwenden.
- Roadmap-Erstellung und initialer Contract Review erfolgen mit
  `GPT-5.6 Sol / Extra High`. Die spätere Ausführung verwendet die in der
  Roadmap risikobasiert festgelegten Reasoning-Stufen.
- In einer Resume-Session den stabilen Workflow-Vertrag nur erneut lesen, wenn
  er seit der letzten Aufnahme geändert wurde oder ein Prozess-Finding besteht.
- Bei der Fortsetzung einer laufenden Roadmap zuerst nur Metadaten, Session
  Resume Card, Entscheidungslog, Findings, aktuellen Schritt und relevanten
  Git-Diff lesen. Abgeschlossene Schritte und historische Referenzen nur bei
  einer konkreten Vertragsfrage erneut öffnen.
- Der Session-Handoff wird verdichtet und ersetzt, nicht über Sessions hinweg
  fortlaufend erweitert.
- Umfangreiche produktive Nachweise werden bei Bedarf nach
  `docs/templates/MIDAS Roadmap Evidence Template.md` als aktive
  Evidence-Datei unter `docs/` angelegt. Die Roadmap enthält dann nur
  Evidence-ID, Ergebnis und Restrisiko.
- Bereits grüne Checks werden nur nach relevanter Code-/Vertragsänderung oder
  im finalen Gesamtcheck wiederholt.
- Normale Syntax-, CSS- und JavaScript-Änderungen benötigen keinen eigenen
  Lernblock. Neue Werkzeuge, Architekturentscheidungen und produktive Wirkung
  werden vorab im Owner Briefing erklärt und bei Bedarf in S6 mit einem kurzen
  Owner Recap in Alltagssprache abgeschlossen.
- Archivierte DONE-Roadmaps, `docs/qa/` und die historischen QA-Archive
  erklären den technischen Verlauf; `docs/QA_CHECKS.md` bleibt nur als
  Kompatibilitätsindex. Der Git-Commit bewahrt die exakte Änderung. Ausführliche
  Lessons-Learned-Dokumente werden nur gezielt gelesen.
- Bei SQL, RLS, Auth, Edge Functions, Android, Push, medizinischer Fachlogik
  und Source-of-Truth-Dokus gilt die MIDAS-Roadmap-Arbeitsweise:
  - S1-S3 Detektivarbeit und Contract Review.
  - S4 Umsetzung erst nach Readiness Review.
  - S5 Checks und Smokes.
  - S6 Doku-Sync und Abschlussreview.
- Fuer kleine, risikoarme Fixes darf die Roadmap-Tiefe schlank sein, aber Code
  wird trotzdem erst nach einem kurzen Contract Review geaendert.
- Stephan ist Oesterreicher; sichtbare deutsche UI-/Copy-Texte sollen echte
  Umlaute verwenden:
  - `Flüssigkeit`, `Zurücksetzen`, `Öffnen`, `Ändern`.
  - Keine sichtbaren User-facing Ersatzschreibweisen wie `Fluessigkeit` oder
    `Zuruecksetzen`, ausser es ist technisch unvermeidbar.
- Code-Identifier, Dateinamen, SQL-Namen, Log-Keys und technische Marker bleiben
  bevorzugt ASCII:
  - `fluessigkeit_label`, `zuruecksetzen_action`, `ckd_stage`.
- Doku darf ASCII-Umschreibungen verwenden, wenn die Datei bereits so geschrieben
  ist oder es um technische Vertrage geht.
- Bei sichtbarer Copy im Zweifel kurz im Review markieren, statt eine
  unnatuerliche deutsche Schreibweise einzubauen.
- Produktive Aktionen bleiben user-gated:
  - Supabase SQL Editor
  - Supabase Deploy
  - GitHub Workflow Runs
  - Android APK Build/Install, wenn das Geraet betroffen ist
  - Live-Smokes mit Schreibwirkung

## Agent-Arbeitsregeln

- Standardshell ist PowerShell.
- Vor Code-, Doku-, Deploy- oder Archivarbeiten zuerst den Worktree pruefen:

```powershell
git status --short
```

- Dirty Worktree respektieren und fremde Aenderungen nicht revertieren.
- Keine destruktiven Git-Kommandos wie `git reset --hard` oder `git checkout --` ohne klare Freigabe.
- Deploys, produktive GitHub Workflow-Runs und andere Runtime-Aktionen mit Schreibwirkung nur nach ausdruecklicher Freigabe.
- Vor einem produktiven Runtime-Smoke immer zuerst die Ziel-Datei oder Workflow-Datei lesen.
- Bei Doku-/Code-Aenderungen gezielt patchen und danach mindestens `git diff --check` ausfuehren.
- Bei Backend-Aenderungen immer die relevante Edge Function plus Modul-/Roadmap-Doku gegenlesen.

## Installierte Kernwerkzeuge

Letzter verifizierter Toolchain-Abgleich: 11.07.2026.

| Werkzeug | Verifizierter Stand |
| --- | --- |
| Git | `2.55.0.windows.2` |
| Node.js / npm | `24.18.0` / `11.18.0` |
| ripgrep | `15.1.0` |
| VS Code | `1.127.0` |
| Deno | `2.9.2` |
| Supabase CLI | `2.109.1` |
| Docker Desktop / Engine | `4.81.0` / `29.6.1` |
| WSL / Ubuntu | `2.6.1.0` / `24.04.3 LTS` |
| PostgreSQL Client in WSL | `psql 16.14` |
| GitHub CLI | `2.96.0` |
| Python | `3.14.6` |
| Microsoft OpenJDK | `17.0.19` |
| Android Command-line Tools / ADB | `21.0` / `37.0.0` |
| Playwright | `1.61.1` |

Die Befehle in den jeweiligen Abschnitten bleiben die Source of Truth. Die
Tabelle ist ein datierter Referenzstand und kein Versions-Pin fuer das Repo.

### Git

Vorhanden:

```powershell
git --version
```

Verwendung:

- Status-/Diff-Checks
- Roadmap-/Doku-Archivierung
- Commit-/Branch-Arbeit

Typische Checks:

```powershell
git status --short
git diff --check
git diff --stat
```

### Node.js / npm / npx

Vorhanden:

```powershell
node --version
cmd /c npm --version
cmd /c npx --version
```

Hinweis:

- `node` funktioniert direkt.
- `npm` ist installiert, aber PowerShell kann `npm.ps1` wegen Execution Policy blocken.
- npm bleibt bewusst auf der aktuellen 11er-Linie; ein neues npm-Major wird erst
  nach separater Kompatibilitaetspruefung uebernommen.
- Sicherer Aufruf in PowerShell:

```powershell
cmd /c npm --version
cmd /c npx --version
npm.cmd --version
```

MIDAS hat aktuell kein zentrales `package.json` im Repo-Root. Node wird primaer fuer Syntaxchecks einzelner JS-Dateien genutzt.

Beispiele:

```powershell
node --check app/modules/touchlog/index.js
node --check app/modules/push/index.js
node --check service-worker.js
```

### ripgrep

Vorhanden:

```powershell
rg --version
```

Verwendung:

- Schnelle Code- und Doku-Suche.
- Scope-Scans nach unerwuenschten Pfaden oder Begriffen.
- Contract Reviews gegen konkrete Symbole, Texte und Statusmarker.

Beispiele:

```powershell
rg -n "TODO|BLOCKED|P0|P1" docs
rg --files app backend docs
```

### VS Code / Extensions

VS-Code-CLI ist verfuegbar:

```powershell
code --version
code --list-extensions
```

Fuer MIDAS besonders relevante installierte Extensions:

| Extension | Zweck |
| --- | --- |
| `denoland.vscode-deno` | Deno Language Server fuer Supabase Edge Functions und `jsr:`-Imports |
| `davidanson.vscode-markdownlint` | Markdownlint fuer Roadmaps, Modul-Dokus und Dev-Doku |
| `github.vscode-github-actions` | GitHub Actions Workflow-Ansicht in VS Code |
| `coderabbit.coderabbit-vscode` | CodeRabbit Review-Hinweise in VS Code |
| `yandeu.five-server` | Lokaler Browser-Server fuer einfache PWA-/Frontend-Smokes |
| `mechatroner.rainbow-csv` | Lesbarkeit fuer CSV-/Tabellen-Dateien |
| `openai.chatgpt` | ChatGPT-Erweiterung in VS Code |

Weitere installierte Extensions laut `code --list-extensions`:

```text
donjayamanne.githistory
dotjoshjohnson.xml
ms-dotnettools.csdevkit
ms-dotnettools.csharp
ms-dotnettools.vscode-dotnet-runtime
ms-python.debugpy
ms-python.python
ms-python.vscode-pylance
ms-python.vscode-python-envs
visualstudiotoolsforunity.vstuc
vscjava.vscode-gradle
zhucy.project-tree
```

Wichtig:

- Ein Agent kann die installierten Extensions lokal per `code --list-extensions` abfragen.
- Die Doku bleibt trotzdem hilfreich, weil neue Chats sofort sehen, welche Editor-Werkzeuge erwartet werden duerfen.
- Nach Extension-Installationen oder PATH-Aenderungen VS Code mit `Developer: Reload Window` oder komplettem Neustart aktualisieren.

### Deno

Vorhanden:

```powershell
deno --version
```

Verwendung:

- Pflichtcheck fuer Supabase Edge Functions.
- VS-Code-/TypeScript-Server-Hinweis:
  - Edge Functions nutzen `jsr:`-Imports.
  - Der normale TypeScript-Server versteht diese Imports nicht zuverlaessig.
  - `.vscode/settings.json` aktiviert den Deno Language Server gezielt fuer `backend/supabase/functions`.
  - Keine `@ts-ignore`-/`ts-nocheck`-Workarounds fuer Edge-Function-Imports verwenden.
- `deno --version` ist fuer den realen Stand massgeblich. Nach einem Deno-
  Self-Update kann Winget voruebergehend alte Paketmetadaten anzeigen.
- Fuer ein Winget-Update muss der Deno Language Server die ausfuehrbare Datei
  freigeben; dafuer VS Code bei Bedarf vollstaendig beenden.

Backend-Source-of-Truth:

```text
backend/supabase/functions/<function>/index.ts
```

Standardchecks:

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

### Docker Desktop / WSL

Docker Desktop ist mit dem WSL-2-Backend installiert und wurde mit einem
neutralen `hello-world`-Container verifiziert.

Installationspfade:

```text
C:\Program Files\Docker\Docker\Docker Desktop.exe
C:\Program Files\Docker\Docker\resources\bin\docker.exe
```

Versions- und Daemon-Checks:

```powershell
docker --version
docker version
docker info
docker context show
```

Falls ein bereits offenes VS-Code-Terminal den nach der Installation neuen
PATH noch nicht kennt:

```powershell
$env:Path = "C:\Program Files\Docker\Docker\resources\bin;$env:Path"
docker version
```

Nach einem Neustart von VS Code sollte kein manueller PATH-Zusatz mehr noetig
sein. Der aktive Docker-Kontext ist `desktop-linux`.

Regeln:

- Docker Desktop darf fuer lokale/disposable Tests gestartet werden.
- Container- oder Volume-Loeschungen sind vor ihrer Ausfuehrung gegen den
  konkreten lokalen Test-Scope zu pruefen.
- Docker-Verfuegbarkeit ist keine Freigabe fuer produktive Supabase-Aktionen.
- Der lokale Supabase-Stack und das produktive Supabase-Projekt sind getrennte
  Umgebungen.

### PostgreSQL Client (`psql`)

Der schlanke PostgreSQL-Client ist in Ubuntu unter WSL installiert. Es wurde
bewusst kein zweiter PostgreSQL-Server als Windows-Dienst angelegt.

Version:

```powershell
wsl -d Ubuntu -- psql --version
```

Verifizierter Stand:

```text
psql (PostgreSQL) 16.14
```

Der Client kann PostgreSQL-17-Server ansprechen. Verbindungsstrings,
Passwoerter und lokale Supabase-Statuswerte duerfen nicht in Doku, Logs oder
Commits uebernommen werden.

### Supabase CLI

Als gepruefte Standalone-Binary user-local installiert:

```powershell
supabase --version
```

Installationspfad:

```text
C:\Users\steph\AppData\Local\Programs\Supabase\supabase.exe
C:\Users\steph\AppData\Local\Programs\Supabase\supabase-go.exe
```

Seit CLI v2.109.1 muessen der Windows-Shim `supabase.exe` und die eigentliche
Go-CLI `supabase-go.exe` gemeinsam im Installationsordner liegen. Ein reiner
`supabase --version`-Check kann eine fehlende Go-Binary uebersehen; deshalb
zusaetzlich einen realen Hilfebefehl pruefen:

```powershell
supabase start --help
```

Falls ein bereits offenes VS-Code-Terminal den PATH noch nicht kennt:

```powershell
$env:Path += ";$env:LOCALAPPDATA\Programs\Supabase"
supabase --version
```

Verwendung:

- Remote Functions listen
- Edge Functions deployen
- Supabase CLI-Hilfe
- lokalen Supabase-Stack ueber Docker verwalten

Beispiele:

```powershell
$env:SUPABASE_PROJECT_REF = (Select-String -Path ".env.supabase.local" -Pattern '^SUPABASE_PROJECT_REF\s*=' | Select-Object -First 1).Line -replace '^SUPABASE_PROJECT_REF\s*=\s*',''
supabase functions list --project-ref $env:SUPABASE_PROJECT_REF
```

Deploy-Form, nur nach expliziter Freigabe:

```powershell
$env:SUPABASE_PROJECT_REF = (Select-String -Path ".env.supabase.local" -Pattern '^SUPABASE_PROJECT_REF\s*=' | Select-Object -First 1).Line -replace '^SUPABASE_PROJECT_REF\s*=\s*',''
supabase functions deploy midas-incident-push --project-ref $env:SUPABASE_PROJECT_REF --workdir backend --use-api
```

Wichtig:

- Der Ordnerumzug allein erfordert keinen Deploy.
- Deploys sind bewusste Runtime-Aktionen, keine Standardfolge von Refactors.
- Wenn Code hash-identisch zum bereits deployed Stand ist, ist ein Deploy normalerweise nicht noetig.
- Fuer die aktuelle Repo-Struktur ist der Supabase-Deploy-Workdir `backend`, weil die CLI darunter `supabase/functions/...` erwartet.
- Nicht `--workdir backend/supabase` verwenden; das erzeugt einen falschen internen Pfad `supabase/functions/...` unterhalb von `backend/supabase`.
- Keine globale npm-Installation von `supabase` verwenden. Fuer MIDAS ist die
  Standalone-Binary am dokumentierten Pfad massgeblich.

### Lokaler Supabase-Stack

Der lokale Supabase-Stack ist kein separates Programm. Die Supabase CLI startet
dafuer mehrere Docker-Container, unter anderem fuer PostgreSQL, Auth, REST,
Realtime und Studio.

Voraussetzungen sind jetzt vorhanden:

- Docker Desktop mit laufendem Linux-Daemon.
- Supabase CLI.
- optionaler `psql`-Client fuer direkte PostgreSQL-Pruefungen.

MIDAS-Kontext:

```text
backend/supabase/config.toml
```

Die CLI muss vom Repo-Root mit dem Workdir `backend` aufgerufen werden, weil
dort der Ordner `supabase/` liegt:

```powershell
supabase start --workdir backend
```

Wichtig:

- Der lokale Stack wurde am 11.07.2026 mit PostgreSQL `17.6` erfolgreich
  gestartet und fuer disposable SQL-, RPC-, Transition-, Retention- und
  Lock-Timeout-Tests verwendet.
- Vor einem Reset ist die bestehende Seed-Konfiguration zu pruefen:
  `backend/supabase/config.toml` referenziert `./seed.sql`, die Datei ist im
  Repo derzeit nicht vorhanden. `supabase start` meldet dies als Warnung,
  startet den Stack aber ohne Seed; `supabase db reset` bleibt vor Verwendung
  gesondert zu pruefen.
- Docker Desktop publiziert die lokalen Supabase-Ports unter Windows trotz
  eigenem Docker-Netzwerk auf allen Host-Interfaces. Die Windows-Firewall-Regel
  `MIDAS Local Supabase - Block Remote Inbound` blockiert deshalb Remote-
  Inbound fuer TCP `54320-54329`; Loopback auf `127.0.0.1` bleibt erlaubt und
  wurde mit `psql` verifiziert.
- Die lokale Analytics-/Vector-Komponente ist fuer die Medication-Datenbank-
  tests nicht erforderlich. Docker Desktop muss dafuer nicht unsicher auf
  `tcp://localhost:2375` exponiert werden.
- Ein lokaler Stack darf niemals mit produktiven Secrets oder einem
  produktiven Datenbank-Passwort gespeist werden.
- Start, Reset, Stop und Volume-Bereinigung werden vor Verwendung immer ueber
  `supabase <command> --help` gegen die installierte CLI-Version geprueft.
- Ein erfolgreicher lokaler Stack ist keine Freigabe fuer einen produktiven
  Cutover.

### Supabase SQL Editor / Security Advisor / RLS Tester

Supabase Dashboard SQL Editor, Security Advisor und RLS Tester sind produktive
oder produktionsnahe Werkzeuge.

Regeln:

- Produktives SQL nur nach expliziter Freigabe ausfuehren.
- Vor produktivem SQL immer die betroffene SQL-Datei und den Roadmap-/Contract
  Review lesen.
- SQL-Ausgaben und Dashboard-Screenshots duerfen keine Secret-Werte enthalten.
- Der RLS Tester ist ein Pruefwerkzeug; er ersetzt keine Policies im Repo.

MIDAS-Grant-Vertrag:

- `sql/16_Explicit_Grants.sql` ist das zentrale Nachzieh-/Provisioning-SQL fuer
  explizite Supabase Data API Grants.
- Das SQL wird erst nach Anlage der referenzierten Tabellen, Views und RPCs
  ausgefuehrt.
- `pg_graphql_anon_table_exposed` im Security Advisor ist fuer private MIDAS-
  Objekte ein harter Befund.
- `pg_graphql_authenticated_table_exposed` ist nicht automatisch ein Fehler,
  wenn das Objekt ein erwarteter authentifizierter MIDAS-Data-API-Pfad ist und
  durch RLS/Policies kontrolliert wird.
- `auth_leaked_password_protection` ist Supabase-Auth-Dashboard-Hygiene und kein
  SQL-Grant-Thema.
- GraphQL wird von MIDAS aktuell nicht aktiv genutzt; `pg_graphql` ist im
  produktiven Projekt bewusst deaktiviert. Eine Reaktivierung braucht einen
  eigenen Contract- und Security-Review.

### GitHub CLI

Systemweit installiert und direkt im `PATH` verfuegbar:

```powershell
gh --version
```

Primaerer Installationspfad:

```text
C:\Program Files\GitHub CLI\gh.exe
```

Ein synchronisierter user-lokaler Fallback ist ebenfalls vorhanden:

```text
C:\Users\steph\AppData\Local\Programs\GitHub CLI\bin\gh.exe
```

Direkter Fallback ohne `PATH`:

```powershell
& "$env:LOCALAPPDATA\Programs\GitHub CLI\bin\gh.exe" --version
```

Login pruefen oder bei neuer Maschine einrichten:

```powershell
gh auth status
gh auth login
```

Aktueller MIDAS-Stand:

- `gh auth status` ist auf diesem Rechner eingerichtet.
- Account: `stephanschabuss97-design`.
- Relevante Scopes fuer Repo-/Actions-Arbeit sind vorhanden, inklusive `repo` und `workflow`.
- Tokens oder Secret-Werte werden nicht in Doku, Logs oder Commits uebernommen.

Verwendung:

- GitHub Auth pruefen
- PR-/Issue-/Actions-Arbeit
- CI-Logs und Workflow-Status inspizieren
- GitHub Actions Workflows manuell starten und beobachten

Workflow-Smokes:

```powershell
gh workflow list
gh workflow view "Trendpilot Weekly"
gh run list --workflow "Trendpilot Weekly" --limit 5
gh workflow run "Trendpilot Weekly" --ref main
gh run watch <run-id> --exit-status
gh run view <run-id> --log
```

Wichtig:

- `gh workflow run` kann produktive Schreibwirkung haben, je nach Workflow.
- Diese Regel gilt fuer alle manuellen GitHub Actions Runs, nicht nur fuer Trendpilot.
- Vor einem manuellen Workflow-Smoke immer zuerst die Workflow-Datei pruefen.
- `Trendpilot Weekly` ruft produktiv die Edge Function ohne `dry_run` auf.
- Der Workflow-Smoke ist daher bewusst als Runtime-Aktion zu behandeln, nicht als reiner Lint-/Statuscheck.
- Der Run gilt nur dann als fachlich plausibel, wenn neben `success` auch die Logs eine erwartete Edge-Function-Response zeigen, z. B. `{"ok":true,...}`.

### Python

Vorhanden:

```powershell
python --version
```

Verwendung:

- Nur bei Bedarf fuer kleine lokale Hilfsskripte.
- Fuer einfache Dateioperationen bevorzugt PowerShell/Repo-Tools verwenden.

## Android / Native Shell

MIDAS hat eine schmale Android-Huelle im Ordner:

```text
android/
```

### JDK / Gradle

Das systemweite `JAVA_HOME` zeigt auf Microsoft OpenJDK 17:

```powershell
[Environment]::GetEnvironmentVariable("JAVA_HOME", "Machine")
```

Wichtig:

- Der ungequalifizierte Befehl `java -version` kann wegen alter Oracle-PATH-
  Eintraege noch Java 8 finden.
- Fuer Android sind das systemweite `JAVA_HOME` und die JVM-Ausgabe des Gradle-
  Wrappers massgeblich.
- `android/gradle.properties` darf keinen absoluten, versionsgebundenen
  `org.gradle.java.home`-Pfad enthalten.

Gradle wird aus dem Android-Arbeitsordner ueber den Repo-Wrapper verwendet, nicht
systemweit:

```powershell
Push-Location android
.\gradlew.bat --version
Pop-Location
```

Kein systemweites Gradle notwendig.

### Android SDK / ADB

Projektlokales Android SDK:

```text
android/.tools/android-sdk
```

Verifizierter SDK-Vertrag:

- `cmdline-tools/latest` ist Version 21.0.
- `platform-tools` / ADB ist Version 37.0.0.
- `build-tools;34.0.0` und `platforms;android-34` bleiben projektgebunden.
- Gradle, Android Gradle Plugin, Kotlin und SDK-Level werden nicht im Zuge einer
  allgemeinen Toolpflege angehoben.

ADB liegt hier:

```text
android/.tools/android-sdk/platform-tools/adb.exe
```

Der ADB-Pfad ist im User-`PATH` eingetragen. Nach VS-Code-Neustart sollte funktionieren:

```powershell
adb devices
```

Falls das aktuelle Terminal den PATH noch nicht kennt:

```powershell
& "android/.tools/android-sdk/platform-tools/adb.exe" devices
```

Verwendung:

- Android-Geraete erkennen
- Widget-/Shell-Smokes vorbereiten
- Logs bei Bedarf inspizieren

## Browser / PWA

MIDAS ist Browser-first PWA ohne Root-Build-Step.

Relevante Dateien:

- `index.html`
- `service-worker.js`
- `public/sw/service-worker.js`
- `public/manifest.json`
- `app/**/*.js`
- `app/styles/*.css`

Browser-/PWA-Smokes sind oft manuell sinnvoller als schweres Testtooling.

### Playwright

Global installiert, bewusst nicht als MIDAS-Projektdependency:

```powershell
playwright.cmd --version
```

Aktueller Stand:

- `playwright@1.61.1`
- Chromium ist installiert.
- Globaler Node-Modulpfad:

```text
C:\Users\steph\AppData\Roaming\npm\node_modules
```

Wichtig:

- Playwright ist als repo-uebergreifendes Smoke-Test-Werkzeug fuer MIDAS und HESTIA gedacht.
- Keine Playwright-Dateien, `package.json`-Aenderungen oder Test-Dependencies automatisch ins Repo schreiben.
- Playwright erst fest einbauen, wenn bewusst Browser-Screenshot-/Regressionstests aufgebaut werden.
- Fuer CLI-Aufrufe reicht:

```powershell
playwright.cmd --version
```

- Fuer Node-Skripte mit `require('playwright')` muss in PowerShell ggf. `NODE_PATH` auf den globalen npm-Root gesetzt werden:

```powershell
$env:NODE_PATH = npm.cmd root -g
```

Minimaler lokaler Start fuer Browser-Smokes:

```powershell
python -m http.server 8765
```

Danach Playwright-Skripte gegen:

```text
http://127.0.0.1:8765
```

## Lokale Env-Dateien

Vorhanden:

```text
.env.supabase.local
```

Bekannte Variablennamen koennen geprueft werden, ohne Werte auszugeben:

```powershell
Select-String -Path ".env.supabase.local" -Pattern "^[A-Za-z_][A-Za-z0-9_]*\s*=" | ForEach-Object { ($_.Line -split "=",2)[0].Trim() }
```

Bekannte Nutzung:

- `SUPABASE_PROJECT_REF`
- `SUPABASE_SERVICE_ROLE_KEY`
- `INCIDENTS_PUSH_URL`
- `TRENDPILOT_USER_ID`

Hinweis:

- `.env.supabase.local` enthaelt lokale Arbeitswerte, aber nicht zwingend alle Remote-Secrets.
- Supabase Function Env und GitHub Actions Secrets koennen zusaetzliche Werte im jeweiligen Dashboard enthalten.

Regeln:

- Keine Werte aus `.env.supabase.local` ausgeben.
- Keine `.env`-Datei committen.
- Keine Secrets in Roadmaps oder finalen Antworten dokumentieren.

## Backend / Edge Functions

Produktiver Source:

```text
backend/supabase/config.toml
backend/supabase/functions/midas-assistant/index.ts
backend/supabase/functions/midas-incident-push/index.ts
backend/supabase/functions/midas-monthly-report/index.ts
backend/supabase/functions/midas-protein-targets/index.ts
backend/supabase/functions/midas-transcribe/index.ts
backend/supabase/functions/midas-trendpilot/index.ts
backend/supabase/functions/midas-tts/index.ts
backend/supabase/functions/midas-vision/index.ts
```

Backend README:

```text
backend/README.md
```

Supabase-Config-Caveat:

- `backend/supabase/config.toml` ist CLI-/Local-Stack-Konfiguration, kein Beweis fuer einen vollstaendig startklaren lokalen Supabase-Stack.
- Die Config referenziert aktuell `./seed.sql`.
- `backend/supabase/seed.sql` ist nicht Teil des importierten Backend-Sources und wurde bewusst nicht erzeugt.
- Edge-Function-Checks und Deploys sind trotzdem moeglich, weil sie auf `backend/supabase/functions/...` zielen.

Standard-Review bei Backend-Aenderungen:

```powershell
deno check backend/supabase/functions/<function>/index.ts
git diff --check
git status --short
```

Optionaler Remote-Status:

```powershell
$env:SUPABASE_PROJECT_REF = (Select-String -Path ".env.supabase.local" -Pattern '^SUPABASE_PROJECT_REF\s*=' | Select-Object -First 1).Line -replace '^SUPABASE_PROJECT_REF\s*=\s*',''
supabase functions list --project-ref $env:SUPABASE_PROJECT_REF
```

Deploy nur nach Freigabe:

```powershell
supabase functions deploy <function> --project-ref $env:SUPABASE_PROJECT_REF --workdir backend --use-api
```

## Minimal Recovery

Kanonischer Ablauf:

- [MIDAS Minimal Recovery](qa/runbooks/midas-minimal-recovery.md)

Repo-externer Zielvertrag:

```text
D:\MIDAS-Recovery\MIDAS-Recovery_YYYY-MM-DD.7z
D:\MIDAS-Recovery\MIDAS-Recovery_YYYY-MM-DD.7z.sha256
```

Regeln:

- Das Bundle enthaelt logische Supabase-Dumps, den Android-Keystore,
  redigierte Konfiguration und Integritaetsnachweise.
- Das Archiv verwendet AES-256 und verschluesselte Dateinamen.
- Das Archivkennwort liegt getrennt im synchronisierten Passwortmanager und
  nie im Repo, in `.env.supabase.local` oder neben dem Archiv.
- Beide aufbewahrten Generationen verwenden dasselbe Recovery-Passwort. Bei
  einer bewussten Rotation bleibt der alte Passwortmanager-Eintrag erhalten,
  bis das letzte damit verschluesselte Archiv geloescht ist.
- `supabase db dump --dry-run` ist fuer produktive Recovery-Laeufe verboten,
  weil die CLI temporaere Login-Credentials ausgeben kann.
- Das Bundle wird im Januar und Juli erneuert; hoechstens zwei gepruefte
  Generationen bleiben erhalten.
- Das Klartext-Staging unter `D:\MIDAS-Recovery\.staging\` muss nach einem
  erfolgreichen oder abgebrochenen Lauf vollstaendig entfernt sein.
- Der aktuelle Nachweis ist ein plausibilisierter logischer Dump. Ein
  vollstaendiger Restore wurde bewusst nicht getestet.

## Backup / Legacy

Der alte externe Backend-Workspace wurde entfernt.

Backup liegt hier:

```text
C:\Users\steph\Projekte\Backup\supabase-local
```

Inhalt:

- `supabase.exe` als altes lokales CLI-Artefakt
- `backups/edge-functions-2026-05-01/...` mit altem Edge-Function-Backup

Dieses Backup ist nicht Source of Truth.

Source of Truth ist:

```text
backend/supabase/...
```

## Typische Agent-Checklisten

### Vor Code-Aenderungen

```powershell
git status --short
```

- Dirty Worktree respektieren.
- Keine fremden Aenderungen revertieren.
- Betroffene Modul-Overview lesen.
- Bei Backend: `backend/README.md` und relevante Edge Function lesen.

### Nach Frontend-JS-Aenderungen

```powershell
node --check <datei.js>
git diff --check
```

Bei mehreren Dateien gezielt alle geaenderten JS-Dateien pruefen.

### Nach Edge-Function-Aenderungen

```powershell
deno check backend/supabase/functions/<function>/index.ts
git diff --check
```

Optional:

```powershell
supabase functions list --project-ref $env:SUPABASE_PROJECT_REF
```

Kein Deploy ohne Freigabe.

### Nach Android-Aenderungen

```powershell
Push-Location android
.\gradlew.bat --version
.\gradlew.bat :app:assembleDebug
Pop-Location
adb devices
```

Falls `adb` im aktuellen Terminal nicht erkannt wird:

```powershell
& "android/.tools/android-sdk/platform-tools/adb.exe" devices
```

### Nach Doku-/Roadmap-Aenderungen

```powershell
git diff --check
rg -n "TODO|BLOCKED|P0|P1" docs/<betroffene-datei>.md
```

## Bekannte Eigenheiten

- VS Code muss nach PATH-Aenderungen komplett neu gestartet werden.
- `npm.ps1` kann in PowerShell durch Execution Policy blockiert sein; `npm.cmd` oder `cmd /c npm ...` verwenden.
- `gh` ist eingerichtet; bei neuem Terminal oder neuer Maschine mit `gh auth status` pruefen und nur bei Bedarf `gh auth login` ausfuehren.
- Nach einem JDK-Update koennen ein bereits offenes Terminal und laufende Gradle-
  Daemons noch den alten `JAVA_HOME`-Pfad halten. VS Code neu starten und bei
  Bedarf im Ordner `android/` einmal `.\gradlew.bat --stop` ausfuehren.
- Android SDK ist projektlokal, nicht zwingend systemweit.
- Historische Archivdokus koennen alte Pfade enthalten; aktive Dokus sollen neue Repo-Pfade nutzen.

## Aktueller Stand

Diese Toolchain reicht fuer die normale MIDAS-Arbeit:

- Frontend-Syntaxchecks mit Node.
- Edge-Function-Checks mit Deno.
- Supabase Remote-Status und Deploys mit Supabase CLI.
- GitHub-Arbeit mit GitHub CLI nach Auth-Pruefung.
- Android-Smokes mit Gradle Wrapper und ADB.
- Git-/Diff-/Doku-Reviews mit lokalen Repo-Tools.

Damit kann ein neuer LLM-/Coding-Agent die meisten MIDAS-Aufgaben lokal pruefen, ohne externe Annahmen ueber den alten Backend-Workspace zu machen.
