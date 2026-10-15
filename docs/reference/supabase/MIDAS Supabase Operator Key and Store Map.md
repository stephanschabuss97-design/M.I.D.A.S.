# MIDAS Supabase Operator Key and Store Map

Status 2026-10-13 (documentation sync): Backend/web was deployed under D32 and
accepted by Stephan under D33 after normal use and reports on live server, PC
and Android. Dedicated native store/restore/widget migration, legacy shutdown
and complete parent acceptance remain deferred. This is no new live credential
or runtime verification. The curated bundle serves actual operator/recovery
consumers and does not mirror every remote secret.

The D32 preparation and verification facts below remain historical. Current
scope and recovery limits are documented in
[Deferred Work and Recovery][ref-1].

## Lokales Operator-Bundle

`.env.supabase.local` im MIDAS-Repo-Root ist der dokumentierte lokale,
per `.gitignore` ausgeschlossene Operatorstore. Die Migration prüft weder
Existenz noch Werte erneut. Die aktuelle Consumer-/Storemap unten führt
dreizehn konkret benötigte Felder; die vier bereits im ursprünglichen Overlay
genannten Namen `SUPABASE_PROJECT_REF`, `SUPABASE_SERVICE_ROLE_KEY`,
`INCIDENTS_PUSH_URL` und `TRENDPILOT_USER_ID` bleiben darin enthalten.
Function Env in Supabase und GitHub Actions Secrets können weitere Werte in
ihren kanonischen Stores enthalten; das kuratierte Bundle ist kein Tresor
oder vollständiger Remote-Secretspiegel.

Nur wenn ein konkreter lokaler Test-, Diagnose-, Deploy- oder Recoveryconsumer
einen Wert benötigt, ist dessen lokale Zuordnung zu begründen. Readinessmatrix,
Blockbereitschaft und Gatebehandlung besitzt
[BLUEPRINT][ref-2].
Vor Storeeintrag, Rotation oder produktiver Nutzung konkrete Ownerautorität;
fehlende Readiness autorisiert keine pauschale Secretkopie.
Niemals Werte/Envdateien in Doku, Logs, Commits, Roadmaps oder Antworten.
Bei separat autorisierter Diagnose nur Namen erfassen, ohne Werte auszugeben:

```powershell
Select-String -Path ".env.supabase.local" `
  -Pattern "^[A-Za-z_][A-Za-z0-9_]*\s*=" |
  ForEach-Object { ($_.Line -split "=",2)[0].Trim() }
```

Diese Dokumentmigration liest keine Secretdatei. Die
[secretsfreie Vorlage](MIDAS%20Supabase%20Operator%20Env.example) ist Formhilfe,
ihre Leerwerte niemals in Live-Stores kopieren. CLI-/Credential-Managerstores
und Provider-/Signing-/Token-/DBpasswordgrenzen bleiben maßgeblich wie unten.

## Dokumentierter D32-/D33-Betriebsstand

The ignored `.env.supabase.local` holds thirteen required fields. Existing five
values were matched against the same project/current API keys and preserved
byte-for-byte. The eight missing fields were added. An actual SDK2.45.4
`auth.getUser()` server request in the existing Edge profile verified a
nonanonymous session; no user-ID/cache/admin fixture substituted authentication.
The private token-free nonce-bound proof remains in ignored work artifacts; no
tokens or key values appear here.

- **SUPABASE_PROJECT_REF / SUPABASE_URL**
  - Concrete consumer: Target binding for operator/API/deploy/postchecks
  - Canonical store: local operator bundle
  - Locally needed: yes

- **SUPABASE_PUBLISHABLE_KEY**
  - Concrete consumer: Web public config and current Auth/User smoke
  - Canonical store: public Web config; local operator bundle
  - Locally needed: yes

- **SUPABASE_SERVICE_ROLE_KEY**
  - Concrete consumer: Exact legacy rollback/preimage verification only
  - Canonical store: existing legacy key; local operator bundle
  - Locally needed: yes; preserve until separately approved retirement

- **PROTEIN_TARGETS_SECRET_KEY**
  - Concrete consumer: protein_targets_scheduler caller and local guard smoke
  - Canonical store: GitHub caller store; injected named Secret map
  - Locally needed: yes

- **TRENDPILOT_SECRET_KEY**
  - Concrete consumer: trendpilot_scheduler caller and local guard smoke
  - Canonical store: GitHub caller store; injected named Secret map
  - Locally needed: yes

- **MONTHLY_REPORT_BACKEND_SECRET_KEY**
  - Concrete consumer: monthly_report_backend internal admin/guard verification
  - Canonical store: automatically injected SUPABASE_SECRET_KEYS map
  - Locally needed: yes for local readiness/recovery checks

- **INCIDENTS_PUSH_SECRET_KEY**
  - Concrete consumer: incidents_push_scheduler caller and guard smoke
  - Canonical store: GitHub INCIDENTS_PUSH_SECRET_KEY; injected named Secret map
  - Locally needed: yes

- **INCIDENTS_PUSH_URL**
  - Concrete consumer: Bound incident transport endpoint
  - Canonical store: GitHub caller configuration; local operator bundle
  - Locally needed: yes

- **MIDAS_OWNER_USER_ID**
  - Concrete consumer: Fixed authenticated nonanonymous MIDAS owner
  - Canonical store: Supabase custom secret; local operator bundle
  - Locally needed: yes

- **PROTEIN_TARGETS_USER_ID / TRENDPILOT_USER_ID / INCIDENTS_USER_ID**
  - Concrete consumer: Scheduler fixed-owner agreement
  - Canonical store: Supabase custom secrets; local operator bundle
  - Locally needed: yes for binding/postchecks

`monthly_report_backend` and `incidents_push_scheduler` were created once under
the existing G3 key authority. They are active credentials with no new caller
binding in this preparation block. Existing default, protein and trend keys were
reused without rotation. API key selection requires both type and name.

Local readiness alone does not prove remote binding. D32 cutover separately
proved the three existing scheduler owners against the actual authenticated
owner using the SHA-256 digests returned by the Management API; existing owners
were not overwritten. The new `MIDAS_OWNER_USER_ID` passed the same readback.
Both injected key maps matched the exact current keys by digest; named-key live
requests and actual owner JWT requests reached input validation. GitHub
`INCIDENTS_PUSH_SECRET_KEY` was set through stdin and checked through metadata;
GitHub does not provide secret-value readback. The existing Incident URL store
is retained, with a caller check rejecting any destination outside the fixed
project before transmitting its key. Supabase reserves `SUPABASE_*`: never
manually overwrite the injected key dictionaries.

No provider keys, signing secrets, user access/refresh tokens or database
passwords are added speculatively. Existing Supabase CLI/Windows Credential
Manager authentication stays in its canonical store. The secrets-free shape is
[Operator Env example](MIDAS%20Supabase%20Operator%20Env.example). Never copy
this example's empty values into a live credential store.

F23 is CLOSED / VERIFIED_RUNTIME: Incident `verify_jwt true -> false` is coupled
to strict named-key/fixed-owner checks; seven other flags were preserved. D32
preparation itself made no deploy/store/publication/scheduler effect; these
belong to its separately admitted whole cutover. No dispatch,
clinical/provider/device/signing or legacy shutdown was performed. Parent
Android/legacy/consolidated exits remain open. Public configuration is stored
per browser origin; the actual operator proof concerns `127.0.0.1:5500`, not
every existing Pages tab or native store.

[ref-1]: MIDAS%20Supabase%20Modernization%20Deferred%20Work%20and%20Recovery.md
[ref-2]: ../../../../codex-tools/docs/blueprint/ROADMAP_AUTHORING_CONTRACT.md#auftragsfelder-und-technische-readiness
