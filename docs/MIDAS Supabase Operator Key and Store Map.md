# MIDAS Supabase Operator Key and Store Map

Status 2026-10-09: D32 local operator bundle complete; eight backend Functions deployed and strict auth/null-effect paths verified. The Incident caller is published in the controlled scheduler window. Clinical acceptance and Parent Android/legacy exits remain open. This is a curated bundle for actual modernisation/deploy/postcheck/recovery consumers, not a mirror of every remote secret.

The ignored `.env.supabase.local` holds thirteen required fields. Existing five values were matched against the same project/current API keys and preserved byte-for-byte. The eight missing fields were added. An actual SDK2.45.4 `auth.getUser()` server request in the existing Edge profile verified a nonanonymous session; no user-ID/cache/admin fixture substituted authentication. The private token-free nonce-bound proof remains in ignored work artifacts; no tokens or key values appear here.

| Field | Concrete consumer | Canonical store | Locally needed |
|---|---|---|---|
| SUPABASE_PROJECT_REF / SUPABASE_URL | Target binding for operator/API/deploy/postchecks | local operator bundle | yes |
| SUPABASE_PUBLISHABLE_KEY | Web public config and current Auth/User smoke | public Web config; local operator bundle | yes |
| SUPABASE_SERVICE_ROLE_KEY | Exact legacy rollback/preimage verification only | existing legacy key; local operator bundle | yes; preserve until separately approved retirement |
| PROTEIN_TARGETS_SECRET_KEY | protein_targets_scheduler caller and local guard smoke | GitHub caller store; injected named Secret map | yes |
| TRENDPILOT_SECRET_KEY | trendpilot_scheduler caller and local guard smoke | GitHub caller store; injected named Secret map | yes |
| MONTHLY_REPORT_BACKEND_SECRET_KEY | monthly_report_backend internal admin/guard verification | automatically injected SUPABASE_SECRET_KEYS map | yes for local readiness/recovery checks |
| INCIDENTS_PUSH_SECRET_KEY | incidents_push_scheduler caller and guard smoke | GitHub INCIDENTS_PUSH_SECRET_KEY; injected named Secret map | yes |
| INCIDENTS_PUSH_URL | Bound incident transport endpoint | GitHub caller configuration; local operator bundle | yes |
| MIDAS_OWNER_USER_ID | Fixed authenticated nonanonymous MIDAS owner | Supabase custom secret; local operator bundle | yes |
| PROTEIN_TARGETS_USER_ID / TRENDPILOT_USER_ID / INCIDENTS_USER_ID | Scheduler fixed-owner agreement | Supabase custom secrets; local operator bundle | yes for binding/postchecks |

`monthly_report_backend` and `incidents_push_scheduler` were created once under the existing G3 key authority. They are active credentials with no new caller binding in this preparation block. Existing default, protein and trend keys were reused without rotation. API key selection requires both type and name.

Local readiness alone does not prove remote binding. D32 cutover separately proved the three existing scheduler owners against the actual authenticated owner using the SHA-256 digests returned by the Management API; existing owners were not overwritten. The new `MIDAS_OWNER_USER_ID` passed the same readback. Both injected key maps matched the exact current keys by digest; named-key live requests and actual owner JWT requests reached input validation. GitHub `INCIDENTS_PUSH_SECRET_KEY` was set through stdin and checked through metadata; GitHub does not provide secret-value readback. The existing Incident URL store is retained, with a caller check rejecting any destination outside the fixed project before transmitting its key. Supabase reserves `SUPABASE_*`: never manually overwrite the injected key dictionaries.

No provider keys, signing secrets, user access/refresh tokens or database passwords are added speculatively. Existing Supabase CLI/Windows Credential Manager authentication stays in its canonical store. The secrets-free shape is [Operator Env example](templates/MIDAS%20Supabase%20Operator%20Env.example). Never copy this example's empty values into a live credential store.

F23 is CLOSED / VERIFIED_RUNTIME: Incident `verify_jwt true -> false` is coupled to strict named-key/fixed-owner checks; seven other flags were preserved. D32 preparation itself made no deploy/store/publication/scheduler effect; these belong to its separately admitted whole cutover. No dispatch, clinical/provider/device/signing or legacy shutdown was performed. Parent Android/legacy/consolidated exits remain open. Public configuration is stored per browser origin; the actual operator proof concerns `127.0.0.1:5500`, not every existing Pages tab or native store.
