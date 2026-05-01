# MIDAS Backend Source

Dieses Verzeichnis enthaelt den versionierten MIDAS-Backend-Source fuer Supabase Edge Functions.

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

Der fruehere externe Workspace `C:/Users/steph/Projekte/midas-backend` war die Importquelle. Nach dem Import ist dieser Repo-Pfad die technische Source of Truth fuer Backend-Code.

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

`deno check` ist ein statischer Source-Check. Runtime-Smokes und echte Supabase-Deploys bleiben separate, bewusst freigegebene Schritte.

## Deploy Vertrag

Deploys sind nicht automatisch Teil von Source-Imports oder Roadmap-Checks. Ein Supabase-Deploy wird nur nach expliziter Freigabe ausgefuehrt.

Die Supabase CLI bleibt extern installiert oder im `PATH`. Es wird keine `supabase.exe` im Repo versioniert.

Repo-neutrale Deploy-Form:

```powershell
Set-Location backend/supabase
supabase functions deploy <function>
```

Falls lokal ein absoluter CLI-Pfad genutzt wird, ist das lokale Maschinenkonfiguration und kein Repo-Vertrag.

GitHub Actions in diesem Repo rufen produktive Function-URLs per Secret auf. Sie sind Scheduler/Caller, nicht der lokale Backend-Source-Pfad.

## Secrets und Artefakte

Nicht ins Repo gehoeren:

- `.env` oder andere lokale Environment-Dateien
- Supabase `.temp`-Dateien
- `supabase.exe` oder andere CLI-Binaries
- `*.bak`
- `.vscode` oder andere lokale IDE-Konfiguration
- private Keys, PEM-Dateien oder `signing_keys*.json`

Secrets bleiben in Supabase, GitHub Secrets oder lokaler Maschinenkonfiguration.

## Supabase Config Caveat

`backend/supabase/config.toml` ist CLI-/Local-Stack-Konfiguration. Die Datei beweist nicht, dass ein vollstaendiger lokaler Supabase-Stack aus dem Repo sofort startklar ist.

Die importierte Config referenziert:

```toml
sql_paths = ["./seed.sql"]
```

`backend/supabase/seed.sql` ist nicht Teil des freigegebenen Imports und wurde nicht erzeugt. Diese Seed-Referenz bleibt ein lokaler Supabase-CLI-Caveat, bis ein eigener SQL-/Migration-Scope definiert wird.
