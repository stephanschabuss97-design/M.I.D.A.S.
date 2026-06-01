# MIDAS Dev Environment

Dieses Dokument beschreibt die lokale Entwicklungsumgebung fuer MIDAS. Es ist bewusst fuer Stephan und fuer kuenftige LLM-/Coding-Agent-Chats geschrieben: Ein neuer Chat soll schnell erkennen, welche lokalen Werkzeuge vorhanden sind, welche Checks moeglich sind und welche Grenzen gelten.

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

## Installierte Kernwerkzeuge

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

### Deno

Vorhanden:

```powershell
deno --version
```

Verwendung:

- Pflichtcheck fuer Supabase Edge Functions.

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

### Supabase CLI

Systemweit/user-local installiert:

```powershell
supabase --version
```

Installationspfad:

```text
C:\Users\steph\AppData\Local\Programs\Supabase\supabase.exe
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

Beispiele:

```powershell
$env:SUPABASE_PROJECT_REF = (Select-String -Path ".env.supabase.local" -Pattern '^SUPABASE_PROJECT_REF\s*=' | Select-Object -First 1).Line -replace '^SUPABASE_PROJECT_REF\s*=\s*',''
supabase functions list --project-ref $env:SUPABASE_PROJECT_REF
```

Deploy-Form, nur nach expliziter Freigabe:

```powershell
$env:SUPABASE_PROJECT_REF = (Select-String -Path ".env.supabase.local" -Pattern '^SUPABASE_PROJECT_REF\s*=' | Select-Object -First 1).Line -replace '^SUPABASE_PROJECT_REF\s*=\s*',''
supabase functions deploy midas-incident-push --project-ref $env:SUPABASE_PROJECT_REF --workdir backend/supabase --use-api
```

Wichtig:

- Der Ordnerumzug allein erfordert keinen Deploy.
- Deploys sind bewusste Runtime-Aktionen, keine Standardfolge von Refactors.
- Wenn Code hash-identisch zum bereits deployed Stand ist, ist ein Deploy normalerweise nicht noetig.

### GitHub CLI

User-local installiert, aber je nach Terminal-Start eventuell noch nicht direkt im aktuellen `PATH`:

```powershell
gh --version
```

Installationspfad:

```text
C:\Users\steph\AppData\Local\Programs\GitHub CLI\bin\gh.exe
```

Falls ein offenes VS-Code-Terminal den PATH noch nicht kennt, VS Code neu starten oder temporaer:

```powershell
$env:Path += ";$env:LOCALAPPDATA\Programs\GitHub CLI\bin"
gh --version
```

Direkter Fallback ohne `PATH`:

```powershell
& "$env:LOCALAPPDATA\Programs\GitHub CLI\bin\gh.exe" --version
```

Login ist nach Installation eventuell noch offen:

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

`JAVA_HOME` zeigt auf JDK 17:

```powershell
$env:JAVA_HOME
```

Gradle wird ueber den Repo-Wrapper verwendet, nicht systemweit:

```powershell
android\gradlew.bat --version
```

Kein systemweites Gradle notwendig.

### Android SDK / ADB

Projektlokales Android SDK:

```text
android/.tools/android-sdk
```

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

- `playwright@1.60.0`
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
supabase functions deploy <function> --project-ref $env:SUPABASE_PROJECT_REF --workdir backend/supabase --use-api
```

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
android\gradlew.bat --version
android\gradlew.bat :app:assembleDebug
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
- `gh` muss ggf. noch mit `gh auth login` verbunden werden.
- Android SDK ist projektlokal, nicht zwingend systemweit.
- Historische Archivdokus koennen alte Pfade enthalten; aktive Dokus sollen neue Repo-Pfade nutzen.

## Aktueller Stand

Diese Toolchain reicht fuer die normale MIDAS-Arbeit:

- Frontend-Syntaxchecks mit Node.
- Edge-Function-Checks mit Deno.
- Supabase Remote-Status und Deploys mit Supabase CLI.
- GitHub-Arbeit mit GitHub CLI nach Login.
- Android-Smokes mit Gradle Wrapper und ADB.
- Git-/Diff-/Doku-Reviews mit lokalen Repo-Tools.

Damit kann ein neuer LLM-/Coding-Agent die meisten MIDAS-Aufgaben lokal pruefen, ohne externe Annahmen ueber den alten Backend-Workspace zu machen.
