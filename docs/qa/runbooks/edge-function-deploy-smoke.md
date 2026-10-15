# Runbook RB-003 - Edge Function Deploy Smoke

## Zweck und Zuständigkeit

Dieses Runbook beschreibt Source-Check, bewussten Deploy und Remote-Smoke einer
Supabase Edge Function für `BS-003`, `BS-004`, `BS-005` und `BS-011`.
Fachliche Erwartungen bleiben in der jeweiligen Domänensuite.

## Voraussetzungen

- Betroffene Function und fachliche Suite sind eindeutig benannt.
- `deno`, Supabase CLI und Supabase-Login sind funktionsfähig.
- `.env.supabase.local` enthält lokal `SUPABASE_PROJECT_REF`.
- Source-/Code-/Contract-Review und Function-Tests sind grün.
- Ein sicherer, functionspezifischer Remote-Smoke ist vorab definiert.

## Wirkung

- Source- und Remote-Statuschecks: `read-only`.
- Deploy und nachfolgender Runtime-Aufruf: `productive`.

## Owner-Gate

Vor dem Deploy ist eine explizite Owner-Freigabe erforderlich. Ein optionaler
GitHub-Workflow-Smoke benötigt eine eigene Freigabe, wenn der Workflow produktiv
schreibt oder Nutzerkommunikation auslöst.

## Ablauf

1. Function lokal prüfen:

   ```powershell
   $functionName = "midas-incident-push" # betroffene Function einsetzen
   deno check "backend/supabase/functions/$functionName/index.ts"
   git diff --check
   ```

2. Projekt-Referenz laden und Remote-Status lesen, ohne den Wert auszugeben:

   ```powershell
   $line = Select-String -Path ".env.supabase.local" `
     -Pattern '^SUPABASE_PROJECT_REF\s*=' | Select-Object -First 1
   $env:SUPABASE_PROJECT_REF = $line.Line `
     -replace '^SUPABASE_PROJECT_REF\s*=\s*',''
   supabase functions list --project-ref $env:SUPABASE_PROJECT_REF
   ```

3. Deploy-Scope und Owner-Freigabe dokumentieren.
4. Function aus dem Repo-Root deployen:

   ```powershell
   supabase functions deploy $functionName `
     --project-ref $env:SUPABASE_PROJECT_REF `
     --workdir backend --use-api
   ```

5. Remote-Liste erneut lesen und den vorab definierten sicheren Smoke ausführen.
   Dry-Run oder Diagnosemodus verwenden, sofern die Function ihn besitzt; keinen
   universellen Dry-Run annehmen.
6. Optional nur nach separater Freigabe den zugehörigen GitHub-Workflow lesen,
   starten und dessen Edge-Response bewerten.

## Erwartung

- Lokaler Source-Check, Deploy-Erfolg und Runtime-Smoke sind drei getrennte
  Nachweise.
- Deploy verwendet ausschließlich `backend/supabase/functions/<function>`.
- Remote-Smoke bestätigt Auth-, CORS-/JSON- und fachlichen Vertrag ohne Secrets.
- Ein Scheduler-Job gilt erst mit plausibler Edge-Response als fachlich grün.

## Abbruchbedingungen

- Function, Projekt-Referenz oder fachlicher Smoke ist nicht eindeutig.
- Tests oder Review sind nicht grün.
- Owner-Freigabe fehlt.
- Der geplante Smoke hat ungeklärte Schreib- oder Benachrichtigungswirkung.

## Cleanup und Postconditions

Ein Deploy besitzt keinen automatischen Cleanup. Bei Regression nur nach neuer
Freigabe den vorherigen belegten Source-Stand erneut deployen. Temporäre
Testdaten nach dem zuständigen Domänenvertrag entfernen; produktive Evidence
nicht still löschen.

## GitHub-Workflow-Smokes

Gemeinsame CLI-/Zugriffs-/Authnachweisgrenzen stehen in
[ATLAS][ref-1].
Vor authentifizierter Projektarbeit nötigen Zugriff prüfen; keine Account-,
Scope- oder Tokenwerte als dauerhafte Toolwahrheit speichern. Login braucht
passende eigene Autorität, kein automatisches Login aus einem Reviewbedarf.
Mögliche Commands, nur innerhalb des konkret freigegebenen Auftrags:

```powershell
gh workflow list
gh workflow view "Trendpilot Weekly"
gh run list --workflow "Trendpilot Weekly" --limit 5
gh workflow run "Trendpilot Weekly" --ref main
gh run watch <run-id> --exit-status
gh run view <run-id> --log
```

Vor jedem manuellen Workflow-Smoke zuerst die Workflowdatei prüfen; alle
manuellen Runs können produktive Wirkung haben und behalten ihr Owner-Gate.
`Trendpilot Weekly` ruft die produktive Edge Function ohne `dry_run` auf.
Der Run ist Runtime-Aktion, kein Lint-/Statuscheck. `success` allein reicht
nicht: Logs müssen eine erwartete fachliche Edge-Response zeigen, etwa
`{"ok":true,...}`, ohne Secretwerte oder vollständige Gesundheits-/Authpayloads.

## Ausführungsevidence

Function, Commit, lokale Checks, Deploy-Zeit, Remote-Version/-Status,
Smokekategorie und Ergebnis in Roadmap oder Evidence festhalten. Secrets und
vollständige Authorization-Header bleiben ausgeschlossen.

[ref-1]: ../../../../codex-tools/apps/atlas/docs/WORKSTATION_CAPABILITIES.md#github-cli
