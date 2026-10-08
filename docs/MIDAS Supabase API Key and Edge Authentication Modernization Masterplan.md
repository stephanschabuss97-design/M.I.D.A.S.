# MIDAS Supabase API Key and Edge Authentication Modernization Masterplan

## Metadaten

| Feld | Festlegung |
| --- | --- |
| ID / Form | `SUPA-KEY-2026 / Rolling Wave mit gezielten S1–S6 Execution Children` |
| Status | `PAUSED_ADMISSION_CAPACITY`; W0 `DONE`, W1-Erstlauf vorbereitet, wegen 5h-Kapazität nicht gestartet; keine S4-Readiness |
| Erstellt / aktualisiert | 2026-08-23 / vollständige Neufassung 2026-10-05; ersetzt die August-Future-Planung im selben Dokument |
| Revision / Freeze | `SUPA-RW-1 / 2026-10-05`; `BLUEPRINT-1 / 2026-09-27` plus fingerprintgebundener MIDAS-Workflow |
| Owner / Consumer | Stephan; `C:\Users\steph\Projekte\M.I.D.A.S` |
| Ziel | Moderne API-Keys, bewiesene Benutzer-/Schedulerauth und sichere Legacy-Ablösung |
| Risiko / Review | `R3`; Planung/integrierter Review nativ `Full`; S4 nur Delta/Consumer |
| Autonomieprofil | `gated` |
| Modell / Reasoning | Lokaler Standard `GPT-5.6 Sol`; Erstellung/Initialreview `Extra High`, ausdrücklich angefordert; tatsächliche UI-/Runtime-Einstellung `NOT_OBSERVABLE` |
| Ausführung | Standard `High`; produktiver Cutover/Rollback/Abschaltung `Extra High`; mechanischer S6-Sync `Medium` als getrennte Grenze, jeweils vor Blockstart festlegen |
| Größe / Zeit | Gesamtprogramm vorläufig `large` wegen Auth, Backend, PWA, Android, Tests, Review, Cutover/Reverse und Doku; S4R dimensioniert Blöcke; kontrolliert noch 2026 |
| Aktuelle Freigabe | G1/W1 und einmaliger Erstlauf 50 Punkte 5h / 15 Weekly samt Serialität erteilt (D11/D12); U3 wegen 5h-Kapazität abgelehnt, kein Permit; D8 bleibt nur W0 |
| Produktwirkung / Git | Keine; kein Commit/Push aus diesem Auftrag |
| Evidence | Heute keine neue Evidence-Datei; bei erstem konkreten Evidencebedarf in W1/Ausführung `MIDAS Supabase API Key and Edge Authentication Modernization Evidence.md` nach lokalem Template erzeugen; Parent ist Owner, Children teilen EV-IDs |
| Archiv | Erst nach W6 und Gesamt-Acceptance mit `(DONE)` nach `docs/archive/` |

Rolling Wave ist verbindlich: Remotezustand, Backend-/Callerwechsel, PWA-Cache,
native Session und Legacy-Abschaltung besitzen unterschiedliche Preconditions
und Owner-Gates. Eine vorab vollständig detaillierte S1–S6-Liste würde diese
Unsicherheit verdecken. S1–S6 bleibt die Ausführungsform der riskanten
Teilumstellungen; keine Child-Datei aus Symmetrie.

## Startkarte

- Eigener Ausführungs-Chat mit diesem Parent; Profil `gated`.
- W0-Dokumentationsauftrag abgeschlossen. Der Folgeauftrag vom 2026-10-05
  („dann machen wir auch gleich weiter“) gibt G1/W1 frei; frische Workzulassung
  U2 war mangels Kostenhistory abgelehnt; konkreter Erstlauf D11/D12 danach
  erteilt, U3 wegen 5h-Kapazität abgelehnt. Keine Live-/Primärdiscovery vor Permit.
  S4, Deploy, SQLwrites, Keys, Geräte, Installation und Paid Credits unfreigegeben.
- Nächster zukünftiger Block: nach G1 und frischer KASRKIN-Zulassung nur W1,
  reales Postimage einfrieren und ersten Child vorbereiten; Ende vor Produktcode.
- Minimalrefresh: `../AGENTS.md` vollständig und `../README.md` gemäß Lesepflicht;
  dann Metadaten, Startkarte, Globaler Vertrag, Context Receipt, Decision Log,
  Findings, Usage, Resume Card und nächste offene Wave. Bei BLUEPRINT-/ATLAS-
  Konsultation ausdrücklich `../../codex-tools/AGENTS.md` lesen.
- Gitstatus/relevanten Diff frisch prüfen. Workflow/BLUEPRINT, ATLAS-Overlay,
  Originalcode/Archive gezielt bei Lesepflicht, Drift, fehlender Abdeckung oder
  der im Receipt benannten Exact-Source-Frage; keine vollständige Neueinarbeitung.
- Capability vor Einsatz prüfen: CLI-Pfad beweist weder Login/Remotezugriff,
  Docker-Daemon noch ein angeschlossenes Gerät.
- KASRKIN-Auswahl nur aus `.kasrkin/command.json`, `binding.json`,
  `activation.json` und gebundenem Installationsreceipt. Keine alten Beispielpfade,
  kein `latest` und keine neue Integration im Projekte-Ordner.
- Expliziter `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe`-5.1-Prozess,
  `-NoProfile -NonInteractive -ExecutionPolicy Bypass`. Receipt-SHA,
  receiptgebundene Proof-/Bootstrapbytes und Binding/Selection/Shim extern
  vor Ausführung verifizieren; dann lokalen Activation-Proof, ausgewählten
  Bootstrap mit MIDAS-ProjectRoot und Commandauswahl prüfen. Aktueller Beleg: U0.
- Workflow-Dispatch, Reporterzeugung, Push und mutierende Functionaufrufe sind
  Runtime-/Owner-Gates, keine „read-only“-Prüfungen. Keine echten Key-/Tokenwerte
  in Ausgaben, Dokumente oder Screenshots.
- Kohärenten Block samt passenden Checks, nativem Review, notwendigen Korrekturen,
  Evidence und Resume schließen; erst danach einmal frisch für den nächsten
  Block messen. Keine Routinebestätigung grüner interner Übergänge.
- `LIMIT / FINAL_RESPONSE_ONLY`: ausschließlich finale Antwort, keine Tools
  und kein nachgeschobener Statuswrite.

## Globaler Vertrag

### Scope und Invarianten

- Öffentliche Konfiguration akzeptiert Publishable und übergangsweise den
  erlaubten Legacy-`anon`-Typ. Publicclients enthalten keinen privilegierten Key.
- `apikey` identifiziert die Anwendung; echter Supabase-Session-JWT im Bearer
  identifiziert den Benutzer. Jeden aktiven Aufrufweg entsprechend umstellen.
- User-only Functions prüfen Benutzer/erlaubten Owner vor Datenzugriff,
  OpenAIaufruf oder Seiteneffekt. API-Key allein genügt nie; kein Adminfallback
  bei Userauthfehlern. Userclients bleiben JWT-/RLS-gebunden.
- Protein/Trend behalten den bewiesenen dualen Vertrag. Incident erhält
  benannten Schedulerkey und servergebundenen Owner. Fremder Body-`user_id`
  wird abgewiesen; Manualdiagnose bleibt auf erlaubten Owner begrenzt.
- Interne privilegierte Clients ebenfalls modernisieren: Callerumstellung
  allein beseitigt `SUPABASE_SERVICE_ROLE_KEY` im Functioncode nicht.
- MIDAS bleibt Stephans Single-User-System; keine generische Benutzerverwaltung,
  kein Multi-Tenant-Gerüst und keine Verallgemeinerung von Ownerparametern.
- Activity V2 bleibt alleiniger produktiver Writer; V1 historische Read-/
  Rollbackquelle. Kein Dual Write oder Datenumbau.
- Medizinische Formeln, Proteinziele, Trends, Incident-Schwellen, Zeitzonen,
  Report-Lifecycle und fachliche Datensätze bleiben unverändert.
- RLS/Grants/RPC-ACLs sowie `anon / authenticated / service_role` behalten ihre
  Fachsemantik. Neue API-Keys erzeugen keine neuen SQL-Rollen.
- Benannte Secrets erleichtern Zuordnung/Rotation, besitzen aber weiterhin
  `service_role`/BYPASSRLS. Keine behauptete per-Key-Datenbankisolation.
- Androids `NativeAuthStore` bleibt Session-Owner, WebView Mirror, Widget
  read-only; PWA-Push bleibt Reminder-Push-Master.
- Browser/PWA, native Stores/OAuth, Widget REST/Realtime, aktive Functions,
  Scheduler/Recovery erhalten passende positive/negative Nachweise;
  Legacy-Deaktivierung erst nach vollständiger Consumerablösung.
- Keine Credentials, echten Tokens, Keywerte oder Gesundheitsdaten in Repo,
  Roadmap, Tests, Logs, QA oder teilbaren Recovery-Artefakten. Testwerte
  synthetisch; reale Werte ausschließlich in sicheren vorgesehenen Stores.

### Non-Scope und Aufwandsgrenze

Keine JWT-Signing-Rotation, kein HS256/JWKS/getClaims-Wechsel aus bloßer
Modernisierungsabsicht, keine OpenAI-Key-/Modellmigration, kein SQLrollen-
Redesign, Postgresupgrade, Scheduler-Jitter-Umbau, UI-Redesign oder pauschales
SDK-Upgrade. Ausgehende OpenAI-`Authorization` ist kein Supabase-Keypfad:
kein globaler Bearer-Replace.

**Keine geplante SQL-Serie und kein obligatorischer Fullstack-/Dockerstart.**
Header-/Validatorarbeit zuerst mit Node-/Deno-/Handler-/Browsertests im kleinsten
belastbaren Aufbau. Neue SQL/RLS-Arbeit nur bei konkret belegtem Auth-/ACLbedarf
mit eigenem Scope-/Ownerentscheid, Forward/Reverse und disposable DB-Fixture.
Bestehende Grenzen zuerst nachweisen. `--use-api` kann Edge-Bundling ohne Docker
erlauben, ersetzt aber keine Runtimeverifikation.

## Sources of Truth und Context Receipt

Erhebung 2026-10-05; HEAD `ef07949544c59fe42ec0fd34a84517c47c234b71`.
Bereits dirty und geschützt: `.gitignore`; fünf KASRKIN-Dateien
(`Test-MidasKasrkinActivation.ps1`, `activation.json`, `binding.json`,
`command.json`, `integration.md`); `AGENTS.md`; `docs/DEV_ENVIRONMENT.md`;
vier lokale Template-/Workflowdateien. Diese zwölf Dateien nicht korrigieren,
zurücksetzen oder committen. Masterplan-Preimage außerhalb des Repos
bytegetreu gesichert; Abschluss prüft geschützte Datei-Hashes.

`COMPLETE` = vollständig gelesen; `FOCUSED_COMPLETE` = vollständige Abdeckung
der benannten Frage, keine behauptete volle Datei-/Archivlektüre.
`PATH_ONLY` ist kein Inhalts-/Runtimebeweis. Fingerprints: SHA-256-Präfixe
mit 16 Hexstellen für Drift, keine Sicherheitsattestierung; KASRKIN-Proof
verwendet volle Receipt-Hashes. Archive nur am betroffenen Gate lesen.

| ID / Quelle (relativ zu docs/) | SHA-256-Präfix / Coverage | Vertrag / Exact-Source bei Drift |
| --- | --- | --- |
| G01: [AGENTS.md](<../AGENTS.md>) | `81b5ff9036a329b3 / COMPLETE` | MIDAS Scope/Lesepflicht/Review/KASRKIN |
| G02: [AGENTS.md](<../../codex-tools/AGENTS.md>) | `ec2c811a2afa1921 / COMPLETE` | Werkstatt/Cross-Repo-Regeln |
| G03: [MIDAS Roadmap Workflow Contract.md](<templates/MIDAS Roadmap Workflow Contract.md>) | `c5c1b6dc1da2e95b / COMPLETE` | S1-S6/R3/Evidence/Usage/Reasoning |
| G04: [ROADMAP_AUTHORING_CONTRACT.md](<../../codex-tools/docs/blueprint/ROADMAP_AUTHORING_CONTRACT.md>) | `d2bf138563449bc9 / COMPLETE` | BLUEPRINT-1/Routing/READY/Child/Freeze |
| G05: [ROLLING_WAVE_ROADMAP_TEMPLATE.md](<../../codex-tools/docs/blueprint/ROLLING_WAVE_ROADMAP_TEMPLATE.md>) | `8381862a65cd389b / COMPLETE` | Parent/Wave/Review/Resume |
| G06: [MIDAS Roadmap Template.md](<templates/MIDAS Roadmap Template.md>) | `3004494c4a02990b / FOCUSED_COMPLETE` | Pflichtfelder/S1/S2/S5/S6; weitere Phasen durch Workflow |
| G07: [MIDAS Roadmap Evidence Template.md](<templates/MIDAS Roadmap Evidence Template.md>) | `dc1b08e3280e853e / FOCUSED_COMPLETE` | Metadaten/Evidencevertrag; Runtimematrix bei Bedarf |
| G08: [README.md](<templates/README.md>) | `db575b068d911244 / COMPLETE` | Overlay und Templatezustaendigkeit |
| G09: [DEV_ENVIRONMENT.md](<DEV_ENVIRONMENT.md>) | `9887e90a04f3bb99 / FOCUSED_COMPLETE` | Aktuelle Activation/Git/Edge/Browser/Android/bedingte DB |
| G10: [DEV_ENVIRONMENT.md](<../../codex-tools/environment/DEV_ENVIRONMENT.md>) | `c6c8df065c9b3fff / FOCUSED_COMPLETE` | Relevante ATLAS CLI/Browser/Android/KASRKIN-Bereiche |
| G11: [README.md](<../README.md>) | `cb45a8a4ff8f2657 / FOCUSED_COMPLETE` | Produkt/V2/Auth/Ownership/Architektur/Betrieb |
| B01: [MIDAS Activity V2 R13 Read-Consumer Activation and V1 Parity Evidence (DONE).md](<archive/MIDAS Activity V2 R13 Read-Consumer Activation and V1 Parity Evidence (DONE).md>) | `ccdd3ec4a242c84d / FOCUSED_COMPLETE` | PRE09/PRE12/F45/F48/Finaldigest 394-420 |
| B02: [MIDAS Activity V2 R14 Capture Cutover and Android PWA Validation Roadmap (DONE).md](<archive/MIDAS Activity V2 R14 Capture Cutover and Android PWA Validation Roadmap (DONE).md>) | `00fd13710fb2a695 / FOCUSED_COMPLETE` | DONE-Metadaten/Startkarte/D-ACT-R14-17 |
| B03: [Supabase Core Overview.md](<modules/Supabase Core Overview.md>) | `9b6e98456f4a536e / FOCUSED_COMPLETE` | R13-Auth/Scheduler/native Grenze |
| B04: [Auth Module Overview.md](<modules/Auth Module Overview.md>) | `0c331f0246335c22 / FOCUSED_COMPLETE` | User/Session/Header/Doctor/native Auth |
| B05: [Android Native Auth Module Overview.md](<modules/Android Native Auth Module Overview.md>) | `38428f6b13ff1e6c / FOCUSED_COMPLETE` | Komponenten/Stores/Owner/OAuth/Bridge/Logout |
| S01: [client.js](<../app/supabase/core/client.js>) | `1978e684bd21add5 / COMPLETE` | Publicfilter/createClient/Android-Mirror |
| S02: [http.js](<../app/supabase/core/http.js>) | `e971e0033683b25c / COMPLETE` | Headercache/Refresh/Transport |
| S03: [ui.js](<../app/supabase/auth/ui.js>) | `c9db2e151cb1dde0 / FOCUSED_COMPLETE` | Configsave/Bearerpraefix/Keytypfilter |
| S04: [main.js](<../assets/js/main.js>) | `0b7fa07d01646371 / FOCUSED_COMPLETE` | Config/980-1088 Header/JWT |
| S05: [index.js](<../app/modules/hub/index.js>) | `0fb16e2874bec6a6 / FOCUSED_COMPLETE` | Endpoint/Proxywahl/Header/direkte AIcaller |
| S06: [android-webview-auth-bridge.js](<../app/core/android-webview-auth-bridge.js>) | `a2bdc9ff5a04d988 / FOCUSED_COMPLETE` | Bootstrap/anonKey-Normalisierung/Configpersistenz |
| S07: [activity-edge-principal.ts](<../backend/supabase/functions/_shared/activity-edge-principal.ts>) | `520f5ca048011ced / COMPLETE` | GetUser/named Secret/Serverowner/Imports |
| S08: [index.ts](<../backend/supabase/functions/midas-monthly-report/index.ts>) | `e7bf04bb10682c55 / FOCUSED_COMPLETE` | GetUser/User-RPC/interne Legacyclients/Env |
| S09: [index.ts](<../backend/supabase/functions/midas-incident-push/index.ts>) | `90c84baffcea2e41 / FOCUSED_COMPLETE` | Caller/Adminalias/Guard/Owner/VAPID |
| S10: [index.ts](<../backend/supabase/functions/midas-assistant/index.ts>) | `8c31f1bf35f100f8 / FOCUSED_COMPLETE` | Env/OpenAIauth/Handler-Userguardfrage |
| S11: [index.ts](<../backend/supabase/functions/midas-transcribe/index.ts>) | `2372e717d638b10e / FOCUSED_COMPLETE` | Env/OpenAIauth/Handler-Userguardfrage |
| S12: [index.ts](<../backend/supabase/functions/midas-tts/index.ts>) | `5738928736078039 / FOCUSED_COMPLETE` | Env/OpenAIauth/Handler-Userguardfrage |
| S13: [index.ts](<../backend/supabase/functions/midas-vision/index.ts>) | `1314689457749148 / FOCUSED_COMPLETE` | Optionale getUser-Aufloesung ohne Pflichtguard |
| S14: [auth-contract_test.ts](<../backend/supabase/functions/midas-incident-push/auth-contract_test.ts>) | `6afcebc3726b103b / COMPLETE` | Statischer Alias-Test, kein Runtimeauthbeweis |
| S15: [config.toml](<../backend/supabase/config.toml>) | `ab8b7ba94595a565 / FOCUSED_COMPLETE` | Functionflag-Overrides/workdir |
| S16: [protein-targets.yml](<../.github/workflows/protein-targets.yml>) | `6570099a05058942 / COMPLETE` | Named apikey/HTTPfail/Weeklycron |
| S17: [trendpilot.yml](<../.github/workflows/trendpilot.yml>) | `2d37862ff61e2dd5 / COMPLETE` | Named apikey/HTTPfail/Weeklycron |
| S18: [incidents-push.yml](<../.github/workflows/incidents-push.yml>) | `3d549f8fb1bb41d0 / COMPLETE` | Legacy-Bearer/Manual/UTC-Ticks/HTTPfail |
| S19: [NativeAuthBootstrapValidator.kt](<../android/app/src/main/java/de/schabuss/midas/auth/NativeAuthBootstrapValidator.kt>) | `7495c8cfc1ea8982 / COMPLETE` | Bootstrap-Typfilter |
| S20: [NativeAuthConfigResolver.kt](<../android/app/src/main/java/de/schabuss/midas/auth/NativeAuthConfigResolver.kt>) | `c07646ff11066a7a / COMPLETE` | Restorefallback ohne denselben Filter |
| S21: [WidgetSyncRepository.kt](<../android/app/src/main/java/de/schabuss/midas/widget/WidgetSyncRepository.kt>) | `f9f2c94c43f84d26 / FOCUSED_COMPLETE` | REST apikey/User-Bearer |
| S22: [build.gradle.kts](<../android/app/build.gradle.kts>) | `08f996cf324ce012 / FOCUSED_COMPLETE` | BOM/Ktor/Buildvarianten |
| S23: [index.html](<../index.html>) | `109f2fc0c8e60206 / FOCUSED_COMPLETE` | SDK-CDN/Config-UI/Importversion |
| S24: [service-worker.js](<../service-worker.js>) | `4b9710e80c0085e4 / FOCUSED_COMPLETE` | Rootcache v32/Cutover |
| S25: [26_Activity_Consumer_Runtime_Activation.sql](<../sql/26_Activity_Consumer_Runtime_Activation.sql>) | `71faf1865bb33fe7 / FOCUSED_COMPLETE` | 417-491 auth.uid-/Serviceowner-Wrapper/ACL |

### Getrennte Baselines

| Ebene | Belegter Stand | Konsequenz |
| --- | --- | --- |
| Historisches R13 | Finaldigest: SQL26/F48-ACL; Monthly v61/`true`, Protein v31/`false`, Trend v32/`false`, Incident v27/`true`; getrennte Scheduler; Legacy-Signing erhalten | Historischer Runtimebeleg, kein frisch bestätigtes Oktoberpostimage |
| R14 / Sourcevertrag | `DONE` 2026-09-09; V2 alleiniger Writer; Android `D-ACT-R14-17` owner-deferred | Activitycutover erfüllt; Device nicht als PASS übernehmen |
| Heutiger Productloadsource | Root-SW `v32`, produktive Modulimports `?v=29`, Browser-SDK `supabase-js 2.45.4` | C3-v13-/R14-v24-Cachezahlen sind keine heutige Baseline |
| Heutige Workflows | Protein/Trend: benannter Secretkey in `apikey` und `curl --fail-with-body` vorhanden; Incident: Legacy-Service-Key im Bearer | Protein/Trend nicht neu bauen; Incident bleibt Callerumbau |
| Heutiger Sharedhelper | `auth.getUser(jwt)` im Userpfad; `@supabase/server@1.4.1` für zielgebundenen Secretmodus | R13 weiterverwenden, F45-JWKS-/alg-/kid-Fehler vermeiden |
| Lokale Functionflags | Monthly `verify_jwt=true`, Protein/Trend `false`; übrige ohne expliziten lokalen Override | Keine deployed Flags behaupten, W1 inventarisiert aktiv |
| Heutiger Androidsource | Supabase BOM `3.2.1`, Ktor `3.2.1`; `anonKey`-Stores, nativer Owner/Bridge | SDK-/Session-/Gerätekompatibilität nicht als bewiesen übernehmen |
| Aktuelles Liveprojekt | `NOT_VERIFIED`: Keys, Signing, Secrets, Functions, Actions, Grants/RLS nicht live gelesen | W1-Pflicht vor S4/Cutover, kein erfundener Live-PASS |

R13-Default-Keys waren historisch dormant, benannte Protein-/Trend-Secrets aktiv.
Bestand vor Neuanlage prüfen; Default-/Public-/Schedulerkeys trennen.
Heutiger Dokumentationsauftrag erlaubt keine Liveprojektinspektion.
Historische Evidence bei passenden Fingerprints wiederverwenden, sie ersetzt
kein aktuelles Deploymentpostimage.

### Konkrete Sourcefragen

- `client.js` und Main-`validateWebhookKey` blockieren Legacy-`service_role`
  durch JWT-Payloadprüfung, nicht `sb_secret_`. `auth/ui.js` persistiert den Key
  mit Bearerpräfix. Publicfilter an Eingabe, Restore, Client und Header erfassen.
- Hub-`getSupabaseFunctionHeaders` sendet im direkten Supabasepfad den gespeicherten
  Anwendungsschlüssel zugleich als Bearer und `apikey`. Main-REST-Header verwenden
  bereits Session-JWT plus API-Key; beide Callerwege berücksichtigen.
- Assistant/Transcribe/TTS besitzen im untersuchten Source keinen verbindlichen
  In-Function-Userguard vor OpenAI; Vision löst User-ID optional auf.
  Bestätigter Sourcebefund, **kein nachgewiesener produktiver Exploit**:
  aktive Deployments/Gatewaybedingungen bleiben offen.
- Monthly und Shared-Userhelper lesen `SUPABASE_ANON_KEY`, Monthly/Incident
  besitzen interne Legacy-Serviceclients. Auch diese Abhängigkeiten ablösen.
- `NativeAuthBootstrapValidator` erkennt bisher nur alten privilegierten JWT;
  `NativeAuthConfigResolver` baut Konfiguration aus Restorestores ohne dieselbe
  Typprüfung. `anonKey` steckt in Storeformat, Clientfingerprint und Bridgepayload.
  Kompatibler Restore/Sessionerhalt zuerst; Umbenennung kein Selbstzweck.
- Incident prüft `INCIDENTS_PUSH_LEGACY_KEY` getrennt vom internen Serviceclient;
  Source akzeptiert expliziten Bodyowner vor `INCIDENTS_USER_ID`.
  Neuer Schedulervertrag bindet Auth, Client und erlaubten Owner zusammen;
  bestehende erlaubte Manualdiagnose nicht entfernen.

## Aktueller Supabase-Vertrag und Zielmatrix

Primärdokumentation geprüft 2026-10-05. Moderne und Legacy-Keys können parallel
bestehen. Supabase kündigt Legacy-Deprecation für Ende 2026 an; kein hier
bewiesener automatischer Löschtermin und kein Signingrotationsauftrag.
[Migration](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys)

`apikey` trägt den Anwendungsschlüssel, Bearer den echten Session-JWT.
Aktuelle Headerdocs beschreiben Migrationstoleranz für moderne Keys an beiden
Headern, auch unter `verify_jwt`. Weder garantierte Abweisung moderner
Bearerkeys noch Benutzeridentität aus bloßer Gatewayakzeptanz ableiten.
Die Migrationsseite enthält daneben strengere Kompatibilitätsaussagen:
W1 friert den echten Plattformvertrag ein. Kanonische Header und
In-Function-Identitätsprüfung bleiben unabhängig davon Pflicht.
[Authheaders](https://supabase.com/docs/guides/functions/auth-headers)

`auth.getUser(jwt)` validiert über den Authserver. Dieser vorhandene MIDAS-Pfad
bleibt Ausgangspunkt. Kein stiller Fallback zu JWT-Decoding/leerem JWKS.
Anderer Verifier nur mit Bedarf, passendem Signing-/SDK-Vertrag und
Real-Token-Smoke; Signingmigration bleibt Non-Scope.
[getUser](https://supabase.com/docs/reference/javascript/auth-getuser)

| Consumer | Zielcaller / Handler | Gate / Kompatibilitätsgrenze |
| --- | --- | --- |
| Browser/PWA | Publishable roh in `apikey`, Session-JWT im Bearer; Publicfilter/User-RLS | Caller normalisieren → Edgeguards beweisen → Public-Key-Cutover |
| Android/Widget/WebView | Publishablekonfiguration, JWT vom nativen Owner; Eingabe-/Restore-/Bridgefilter | Stores/Clientneubau/Upgrade/Reentry und reales Gerät |
| Monthly | User-only; GetUser/Owner/RLS vor Report; nötiger interner Adminclient benannt/isoliert | `verify_jwt=true` zunächst erhalten, echte User-/Negativsmokes |
| Assistant/Transcribe/TTS/Vision | User-only sofern live aktiv, verpflichtender Guard vor OpenAI/Wirkung | Hubcaller/Guard zusammen planen; aktiv/geparkt nicht aus August ableiten |
| Protein/Trend Userpfad | Vorhandener GetUser-/RLS-Vertrag, kein Bodyowner | Bestehende duale `verify_jwt=false`-Handler gezielt nachweisen |
| Protein/Trend Scheduler | Passender `apikey`-Key / `secret:<name>`, exakter Modus/Name/Serverowner, Service-RPC | Bestehende Implementation revalidieren, Fremdkey/Ownerfehler ablehnen |
| Incident Scheduler/Manual | Vorgesehen `secret:incidents_push_scheduler`, Serverowner/benannter interner Client | Function-/Action-/Secret-Cutover mit Reverse, Flag erst nach Guard |
| Inaktive/externe/Proxycaller | W1 bestimmt tatsächlichen Bestand | Modernisieren oder explizit stilllegen, nicht still aus Matrix streichen |

User-only Flags grundsätzlich aktiv lassen; Secret-only/duale Functions können
`false` benötigen. Jeden Flag am Caller-/Handlerpostimage beweisen, kein
globales `--no-verify-jwt`. Neue Keynamen sind Vorschläge, keine behaupteten Secrets.

Typprüfung und Projektzuordnung getrennt nachweisen: Präfix/JWT-Payload kann
Public-/Secretform unterscheiden, beweist aber weder Gültigkeit noch Herkunft
eines opaken Publishable Keys. Festgehaltenes Zielprojekt plus kontrollierter
Auth-/API-Smoke bindet den Key an MIDAS; keine erfundene lokale Projektdekodierung.
Auch ein echter JWT einer anonymen Supabase-Auth-Session ist kein zulässiger
MIDAS-User. Negative Owner-/Anonymous-Fälle gehören zum Userguard-Orakel.

### Secret-Readiness ohne Werte

| Name / Store | Consumer / lokaler Bedarf | Nachweis / Voraussetzung |
| --- | --- | --- |
| `SUPABASE_PUBLISHABLE_KEYS` | Edge-JSONmap/PWA/native Publickonfiguration | Plattformvertrag; W1 Name/Mapformat/Bestand/SDKzugriff |
| `SUPABASE_SECRET_KEYS` | Edge-JSONmap, passende benannte Backendclients | Bestand/Bindings offen; fehlende/malformed Map fail closed, Mocktests ohne reale Werte |
| `protein_targets_scheduler / PROTEIN_TARGETS_SECRET_KEY` | Supabase-Keyname / GitHub Actionsecret | R13/heutiger Workflow; live revalidieren, nicht unnötig neu anlegen |
| `trendpilot_scheduler / TRENDPILOT_SECRET_KEY` | Supabase-Keyname / GitHub Actionsecret | R13/heutiger Workflow; live revalidieren |
| `incidents_push_scheduler / INCIDENTS_PUSH_SECRET_KEY` | Vorgesehener Supabase-Keyname / GitHubsecret | Kein Oktoberbestandbeleg; G2/G3 binden Caller/internen Client |
| `monthly_report_backend` | Vorgesehener benannter interner Range-Report-Client | Adminbedarf/Namen W1 bestätigen, G2/G3 |
| `PROTEIN_TARGETS_USER_ID / TRENDPILOT_USER_ID / INCIDENTS_USER_ID` | Serverowner, synthetische Test-ID | Source vorhanden, Livewerte nicht gelesen; Präsenz/Zuordnung maskiert belegen |
| `INCIDENTS_PUSH_LEGACY_KEY / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY` | Übergang/Reverse, Actions/Edgeenv | Bis Ablösung erhalten, kein implizites Löschen |
| OpenAI-/VAPID-Secrets | Bestehende AI-/Pushfunctions | Unverändert; kosten-/pushwirksame Smokes eigenes Gate |

Unabhängige Schedulerrotation bedeutet unterschiedliche Keys mit gleicher
privilegierter Rolle. Sichere vorhandene Stores nutzen, keine Keywerte als
S4R-Evidence verlangen.

## Capability-Receipt nach ATLAS

Gezielter Preflight 2026-10-05. Frische lokale Versionsbelege haben bei Drift
Vorrang vor älteren ATLAS-Ständen; heute kein ATLAS-Update/Toolsetup.

| Capability / ATLAS-Bereich | Bedarf | Status / Nachweis | Weitere Readiness |
| --- | --- | --- | --- |
| Git/Suche/Python/Dateien | W0/W1-Refresh | `AVAILABLE_VERIFIED`: Git 2.55.0.windows.2, Status/rg/Python ausgeführt | Relevanter Diff/Drift |
| PS5.1/KASRKIN | Kanonische Zulassung | `AVAILABLE_VERIFIED`: expliziter Prozess, K0/Bootstrap/Work-Begin ausgeführt | Zulassung je Hauptblock, aktuelle Bindingidentität |
| Node | JS-/Contractchecks | `AVAILABLE_VERIFIED`: v24.18.0 | Existierende Dateitests; kein Root-`package.json`/`npm test` |
| Deno | Type-/Handlerchecks | `AVAILABLE_VERIFIED`: 2.9.7 / TS 6.0.3 | Permissions/Mocks/Dependencyauflösung, heute keine Produkttests |
| Supabase CLI | Discovery/Einzeldeploys | `AVAILABLE_VERIFIED` nur CLI: 2.109.1, `functions deploy --help`, benötigte Flags vorhanden | Login/Projekt/Rechte/Livezustand `AVAILABLE_UNVERIFIED_OR_STALE` |
| GitHub CLI/Actions | Action-/Secretbinding | `AVAILABLE_VERIFIED` nur CLI: gh 2.96.0 | Auth/Repo/Binding `AVAILABLE_UNVERIFIED_OR_STALE` |
| Browser/Playwright | PWA/Cache/Last Mile | `AVAILABLE_UNVERIFIED_OR_STALE`: ATLAS 1.61.1, Payload/Produktzugriff nicht frisch geprüft | Vor relevantem Childtest verifizieren |
| Android JDK/Gradle/SDK/ADB | W4 Build/Device | `AVAILABLE_UNVERIFIED_OR_STALE`: Machine-JAVA_HOME JDK17-Pfad, Wrapper/ADB vorhanden; nicht ausgeführt | Versionen, Variante/Signierung/Upgradeweg und Device-/Installfreigabe |
| CodeRabbit | Künftiger Code-S5 | `NOT_REQUIRED` W0; Commandpfad vorhanden, Version/Auth/Budget ungeprüft | Child-S5 Preflight, höchstens 1 Initial + 1 Verifikation |
| Docker/disposable Postgres | Belegter SQL-/ACLbedarf | `NOT_REQUIRED` W0/Key-/Headertests; Docker CLI 29.8.1, Daemon ungeprüft | Bedarf vor Start/Setup |
| MCP/Dashboard | Alternative Live-Discovery | `NOT_REQUIRED` W0; Verbindungen/Rechte nicht geprüft | W1 kleinste bestehende read-only Alternative |

Readiness heute gilt nur Dokumentation/lokales Discoverydesign, nicht W1-Live,
S4 oder Cutover. `AVAILABLE_UNVERIFIED_OR_STALE` bei benötigter Fähigkeit
ist kein READY. Missing/Incompatible blockiert mit
`OWNER_TOOLING_DECISION_REQUIRED`, keine implizite Installation.

## Decision Log und Owner-Gates

| ID | Entscheidung | Wirkung |
| --- | --- | --- |
| D1 | Rolling Wave; W0 Dokumentation | Unsicherheit/Ownergrenzen gestaffelt, spätere Waves erst am realen Input detaillieren |
| D2 | R13/R14 reuse, Augustbaseline ersetzt | Kein neuer Activitycutover/Protein-/Trendschedulerbau; historische Belege bleiben historisch |
| D3 | Authserver-Userpfad als Ausgangspunkt | F45 nicht mit unbelegtem JWKS-/Signingwechsel wiederholen |
| D4 | Kein globales Authframework/SDKupgrade | Helper bei Bedarf, Upgrade bei belegter Inkompatibilität |
| D5 | Ein Parent/eine Programmevidence | W2/W3 Backend/Web-Child; W4 natives Child; W5 Abschalt-Child wegen eigener R3-Reversegrenze; heute keine leeren Artefakte |
| D6 | Signingmigration Non-Scope | API-Keyablösung/JWTsignierung getrennt |
| D7 | SQL/Docker nur bei belegtem Bedarf | Bestehende Grenzen zuerst nachweisen |
| D8 | Dokumentationsausnahme ausdrücklich erteilt | Owner: „Ja, diese Dokumentationsausnahme freigeben“; nur fehlende lokale Kostenbelege für diesen Deep-Dive/Update/Review/Korrekturauftrag, keine Paid Credits |
| D9 | Keine spätere Produkt-/Ausführungsfreigabe | D8 ist keine KASRKIN-PASS-Ausgabe, kein Floor-/Cap-/Eligibility-Override oder Deploy-/Deviceauftrag |
| D10 | Folgeauftrag W1 / G1 erteilt | Owner will W1 fortsetzen; W1 läuft im Parent, erster S1–S6-Child für W2/W3 erst aus realer Discovery. Keine Erweiterung von D8 impliziert |
| D11 | Konkreter FIRST_RUN_BUDGET erteilt | Owner am 2026-10-05: 50 Prozentpunkte 5h / 15 Weekly für vollständigen W1-INTEGRATED_REVIEW/LARGE/R3/Full-Block; ein Start, enforcing beide Fenster, Reserven 25/10 unverändert, kein Paid Spend; kein empirischer Kostenbeleg |
| D12 | Kontrollierte Serialität bestätigt | Owner: „Ja, während W1 läuft nur dieser Codex-Auftrag“; serielle Consumerarbeit ohne Subagents, keine technische accountweite Reservation behauptet |

| Gate | Konkrete Entscheidung | Stand |
| --- | --- | --- |
| G0 | Masterplan verfassen/reviewen/korrigieren plus D8 | `GRANTED` nur W0 |
| G1 | W1-Auftrag inkl. zielgebundener Live-Read-only-Inspektion plus frische KASRKIN-Zulassung | Owner-Scope und D11/D12 `GRANTED`; U3 `ENDPHASE_START_REJECTED:CAPACITY_INSUFFICIENT:fiveHour`, keine Ausführung |
| G2 | W1-Zielvertrag/aktive Caller/Ownerpolitik und Child-S4R/lokale Ausführungsgrenzen, bei large Briefing | `NOT_GRANTED` |
| G3 | Benannte Keyanlage/Rotation/Storebindung, Function-/Action-Cutover und Runtime-Smokes samt Reverse | `NOT_GRANTED`; je konkretem Fenster |
| G4 | PWA-Productload/Cache-/Pages-Cutover, deployauslösender Commit/Push und Reverse | `NOT_GRANTED` |
| G5 | APK/Buildvariant, Device/Installation, reale Login-/Widget-/Push-/Write-Smokes und Testdatenbehandlung | `NOT_GRANTED` |
| G6 | Legacy-Deaktivierung mit Plattformgranularität/Preimage/Wiederaktivierung/Postchecks | `NOT_GRANTED` |
| G7 | Endgültige Löschung/Signingrotation/irreversible Erweiterung | `NON_SCOPE`; eigener Auftrag |

Produktives Briefing: Zweck, Wirkung, Risiko, Rückfall, Erfolgsnachweis,
benötigte Freigabe. Gültige fingerprintgebundene Gates nicht erneut erfragen;
Drift von Scope/Preimage/Reverse/Capability invalidiert betroffenen Anteil.
Operatoraktion einmal präzise anleiten, wenn nur Stephan sie ausführen kann.

## Usage-Checkpoint

| Ereignis | Echter Nachweis |
| --- | --- |
| U0/W0-Begin | 2026-10-05 17:07:48 +02:00; `VALID`, gemessen 17:07:46; 5h 93 % übrig/Woche 38 % übrig; Reset-IDs `1791229931 / 1791617806` |
| Entscheidung | `CONTINUE`, aber `PRIMARY_REJECTED_FOR_RESERVE / NO_COMPARABLE_COST_HISTORY`; Confidence `NONE`, Modus `CLOSURE_ONLY`, Arbeit `NOT_STARTED` |
| Admission | Evaluation `a22c19551d2848278fb0d1f6f8bbdef9`; `.kasrkin/work/supa-plan-20261005-v2/admission.json`; Bundle `.kasrkin/work/midas-supa-plan-20261005-v2/bundle.json` |
| Ausnahme | D8 nach Ablehnung; `OWNER_DOCUMENTATION_EXCEPTION`, kein behauptetes `PRIMARY_ALLOWED` |
| Release | `kasrkin-13f9d3ee8dd2c629`; volle Receipt-SHA `2c94dc50621558a044fcaa29b3ecd1b8e74c3a9f9771236212d1e964a42f56d3`; Shim `C:\Users\steph\.local\share\kasrkin-admin-v1\bin\kasrkin.cmd` |
| Kosten/Complete | Kein erfolgreicher Work-Begin, kein erfundener Work-Complete-/Cost-Receipt; Fortschritt im Parent, Admission unverändert |
| U1 / FINAL_OBSERVATION | 2026-10-05T18:02:04.1308620+02:00; kanonischer validate-Envelope: 5h 70 % / Woche 34 % übrig; Fenster ACTIVE, Reset-IDs `1791229931 / 1791617806`; keine neue Work-Zulassung/kein Cost Receipt |
| U2 / W1-Begin | 2026-10-05T18:11:28.4175431+02:00; VALID, gemessen 18:11:26; 5h 66 % / Woche 34 % übrig; Reset-IDs `1791229931 / 1791617805`; CONTINUE, aber `PRIMARY_REJECTED_FOR_RESERVE / NO_COMPARABLE_COST_HISTORY`; CLOSURE_ONLY, NOT_STARTED |
| U2 Beleg / Grenze | Evaluation `f3d6e626d1cd470497caca9da3e606fe`; `.kasrkin/work/supa-w1-20261005/admission.json`; frozen Bundle `.kasrkin/work/midas-supa-w1-20261005/bundle.json`; Scopefingerprint `fb8fe267b6ab8bdd3988143de73a2a604f9cf17fcea1f63e559564da327ce364`; keine Kosten-/Ownerausnahme für W1 behauptet |
| U3 / W1-Erstlauf-Begin | Nativer Work-Begin mit Endphase/Owneradapter: `ENDPHASE_START_REJECTED:CAPACITY_INSUFFICIENT:fiveHour`; Exit 5, kein Startrecord/Permit, keine W1-Livearbeit |
| U3 kanonischer Checkpoint | Unmittelbar danach nur gecachte kanonische VALID-Validierung ohne Refresh: gemessen 2026-10-05T18:49:57.7419964+02:00, 5h 55 % / Weekly 32 %, Reset-IDs `1791229932 / 1791617806`; keine neu behauptete Zulassung |
| U3 Owner-/Planbeleg | `.kasrkin/work/supa-w1-first-run-20261005/{owner-evidence.md,owner-authorization.json,admission.json,authorization-provenance.json}`; Budget 50/15, Startcap 1, Gültigkeit 18:49:33.8568958–20:49:33.8568958 +02:00; tatsächlicher Admissionfehler, kein erfundenes allowed-Ergebnis |
| U3 Freeze-/Kostenstatus | Native Prepare-Artefakte unverändert erhalten; Owneradapter in neuen `endphase-plan-authorized.json`/`bundle-authorized.json`. Parent-Closure ändert das Sourcepreimage: vor späterem Start neu einfrieren und exakt binden, keine alten Dateien überschreiben. Kein erfolgreicher Begin/Complete, kein W1-Kostenbeleg |
| Fortsetzung | Vor W1/Child-Hauptblock beide Fenster/Reserve/Episode/Scope/Fachgates frisch; U0/D8 nicht wiederverwenden |

Fehlerhafte erste Episodevorbereitung verworfen; v2 benutzte echte kanonische
Resetidentitäten, keine daraus erfundene Kostenhistorie/Episodefreigabe.
5h-Reset ersetzt Weekly-/Fachgates nicht. Keine Quota-Verhandlung/automatische
Warteschleife. Deltas nur aus echten Messpaaren mit identischen Reset-IDs;
keine Schätzung als Cost Receipt.

## Wave-Status und Reihenfolge

| Wave | Ziel / Abhängigkeit | Status | Startgate / Child |
| --- | --- | --- | --- |
| W0 | Deep Dive, Parent, nativer Review/Korrektur | `DONE`; V1–V6 | G0/D8, kein Child |
| W1 | Aktuelles Source-/Remote-/Capabilitypostimage/Zielvertrag | `NOT_STARTED / ADMISSION_BLOCKED_CAPACITY`; G1/D11/D12 erteilt, U3 abgelehnt | Frische Kapazität für 50/15 plus Reserve 25/10; gültige exakt gebundene Ownerautorität und Permit, Discovery im Parent |
| W2 | Authenticated Caller, Edgeguards, interne Secrets/Incident | `PLANNED_COARSE`, nach W1 | G2/Child-S4R; produktiv G3/G4; Backend/Web-Child |
| W3 | PWA-Publishable/Cache-/Sessionvertrag | `PLANNED_COARSE`, nach W2-Auth-Acceptance | Derselbe Backend/Web-Child, G4 |
| W4 | Android/Widget Publishable, Restore/OAuth/Device | `PLANNED_COARSE`, nach Backend/Web | Natives Child-S4R/G5, ggf. G3 |
| W5 | Gesamtmatrix/Recovery/Legacy-Deaktivierung | `PLANNED_COARSE`, nach W2–W4 | Abschalt-Child-S4R/G6, ggf. G3/G5 |
| W6 | Belegte Doku/QA/Changelog/Roll-up/Archiv | `PLANNED_COARSE`, nach W5 | Frische Zulassung, Acceptance erfüllt; kein Child |

W1 → W2 → W3 → W4 → W5 → W6. Keine parallelen produktiven Cutover mit unklarer
Repo-/Conversationzuordnung. W2/W3 besitzen unterschiedliche Acceptancegrenzen
im selben Child. Erst vor Start IDs/Namen/gegenseitige Parentlinks anlegen;
heute keine leeren Children/Links auf nicht existente Dateien.

### W0 — Autorenergebnis

- Scope: lokale gezielte Sources/Archive/Tools, Primärdocs, vollständige Neufassung
  ausschließlich dieses Masterplans; Non-Scope alle Produkt/Remote/Setup/Gitwrites.
- Schritte: Routing/Baseline → Vertrags-/Gate-/Receiptupdate → nativer Full
  Review/Korrekturen → Link-/Diff-/Dirty-/Fresh-Chat-Checks.
- Acceptance: ehrliche Baselines/Capabilities, eindeutiger W1-Start, vollständige
  Reviewdisposition und Dirty-Vorarbeit unverändert.
- Stop: unentscheidbarer Scopekonflikt, notwendige Live-/Produktaktion,
  invalidierte Ausnahme oder LIMIT.
- Evidence/Closure: W0-Prüfregister/Resume im Parent, keine neue Evidence oder
  Implementierungsroadmap nur zur heutigen Dokumentation.

### W1 — Revalidierung und nächster Scope-Freeze

Reasoning `High` als kohärenter Discoveryblock, keine Produktumsetzung.

1. Minimalrefresh/Git-/Fingerprintdelta, frisch admitted Usageblock; Projekt/Repo
   eindeutig identifizieren, keine Secretwerte/breite Logs.
2. Unter G1 live read-only Functions/Versionen/Flags, aktive User-/Scheduler-/
   Proxy-/Recoverycaller, Keynamen/Status, Signing, Secret-/Ownerpräsenz/Actions
   prüfen. `--workdir backend`, nicht `backend/supabase`; Zielbezug frisch.
   GitHubsecretnamen beweisen keine Wertgleichheit.
3. R13/R14-Receipt abgleichen: F45/vorhandene Scheduler/Device-Deferral. Legacy-
   Deaktivierungsgranularität/Wiederaktivierung read-only bestätigen;
   unabhängiges anon-/service_role-Toggling nicht voraussetzen.
4. Header-/Key-/Owner-/Service-Zielmatrix konkretisieren; alte PWA-Tabs/Caches,
   installierte APKs/indirekte Caller/benötigte Defaultenvs einbeziehen.
   Sourceinferenz von aktiver Produktion trennen.
5. Nötige Capabilities, genaue Dependencyauflösung, Testharnesses/Secret-Readiness
   prüfen; Browser 2.45.4/Kotlin 3.2.1/Serverhelper nicht blind upgraden.
   Versionsänderung nur bei bewiesener Inkompatibilität.
6. Scope/Blöcke inkl. Tests/Review/Runtime/Device/Rehydration/Doku/Reverse
   prognostizieren, keine Tokenkosten erfinden. Backend/Web-Child vorbereiten;
   gültige Discovery reuse statt nochmals breit scannen.
7. Full Review/Korrekturen, W1-Status/Receipt/Findings/Resume schließen;
   W2 erst nach eigenem grünen Child-S4R und G2.

Acceptance: nächste S4-Grenze mit aktuellen Caller-/Key-/Flag-/Owner-/Signing-
Nachweisen, reproduzierbarem Preimage, benötigten Fähigkeiten/Childblöcken.
Kein NOT_VERIFIED an benötigter Grenze; Nichtbenötigtes darf abgegrenzt bleiben.
Ende vor Produktcode. STOP bei Livezugriffslücke, Widerspruch, ungeklärtem
Caller, Tool-/Produktentscheidung oder Scopeausweitung. Ergebnis reviewbar
schließen; kein spontanes Setup/Deploy/Reparaturblock.

### W2 — Backendauth und verbleibende privilegierte Caller

Vor Start anhand W1 detaillieren. Backend/Web-Child besitzt abgeschlossene
S1/S2/S3/S4R-Hauptblöcke; konkrete Scope-/Gate-/Reasoninggrenzen festhalten.
S4 erst unter freigegebener Readiness.

- Consumer: Monthly/aktive AIfunctions, Protein/Trend/Incident, interne Clients,
  Hub/Actions. Legacy-/Publishablekompatible env-/Publicauswahl, verbindliche
  User-/Single-User-Guards, zielgebundene Secrets/Serverowner.
- Bestehende Protein-/Trendimplementation revalidieren; Incidentcaller im
  `apikey`-Format, interne Legacyclients ebenfalls ablösen.
- Kompatibilitätsfolge: zuerst Hub/Usercaller mit Session-JWT im weiterhin
  Legacy-Key-kompatiblen Productload bereitstellen und prüfen; dann Guards/
  Backendcutover. Alte Cache-/APKcaller vorab berücksichtigen; kompatible
  Teilreleases oder atomar gegatetes Fenster mit beiden Seiten/Reverse.
  API-Key-only-KIcaller enden danach fail closed mit Login/Reload/Updatepfad,
  keine anonyme Authumgehung als Rückfall.
- Alle lokalen W2/W3-Codeänderungen vor dem ersten produktiven Teilfenster
  im finalen Gesamtdiff vorbereiten und S5-lokal/integrated reviewen.
  Anschließend kompatible Releases/Konfigurationsschritte unter separaten
  Runtimegates; W2-Abschluss belegt nur Auth-Acceptance, Child-S6 erst nach W3.
  Kein neuer CodeRabbit-Initiallauf je Teilfenster. Neues Codefinding invalidiert
  betroffene Tests/Reviews; keine geplante Erweiterung nach Review als „Cutover“ tarnen.
- Flagwechsel einzeln nach grünem Guard. Incident besitzt zusammengehöriges
  Function-/Secret-/Actionfenster mit reversefähigem Legacyalias.
- Acceptance: zulässiger Realuser funktioniert; ungültiger/fehlender JWT,
  API-Key-only/Fremdowner/-secret verursachen keine Daten-/OpenAI-/Pushwirkung.
  Interner Servicekontext funktioniert ohne Legacy-Keyabhängigkeit.
- Non-Scope: PWA-Publishable W3/native Storemigration W4; Signing-/SQLrollen-/
  Fach-/globale SDKänderung. STOP/Closure: erster Pflichtfehler → Reverse/
  Postcheck/Finding/Resume, Diagnose getrennt frisch zulassen.

### W3 — PWA-Publishable und Cache

- W2-Auth-Acceptance/Productload vor Start prüfen; derselbe Child,
  keine zweite Discovery-/Evidencekopie.
- Publicfilter an UI/`webhookKey`/Restore/Client/Hub-/REST-Header/Cache;
  bloßes Label genügt nicht. Bestehende Feldnamen dürfen bleiben.
- Idempotente Konfiguration, Client-/Headercache nach Keywechsel invalidieren,
  Session/Refresh erhalten; kein ungeplantes Logout/doppelter Boot.
- SW/Productload/Imports am echten Preimage gemeinsam fortschreiben,
  keine vorab erfundene nächste Versionsnummer.
- Acceptance: PWA/Browser Login/Reload/Warmtab/Offline/Resume/Cacheupdate/
  Keywechsel/Refresh/REST/RPC/Realtime/aktive Hub-/Reportpfade mit Publishable;
  privilegierte Keys auf allen Publicpfaden abgelehnt.
- Non-Scope: UI-Design/Fachwerte/Device/Legacyabschaltung. G4 für Pages/Deploy/
  Reverse; echte Wirkungen weiterhin G3/G5. Pflichtfehler → Rollbackgrenze.

### W4 — Android und Widget

- Natives Child aus W2/W3; JDK/Gradle/SDK/Device, Variante/Signierung/Upgradeweg
  frisch; keine vorausgesetzte Standard-APK. R14-Device-Deferral kein Nachweis.
- Bootstrapvalidator **und** Resolver-/Storefallbacks absichern; Publickey
  kompatibel in Config-/NativeAuthStore/Widgetadapter/Clientfingerprint/
  Bridgepayload überführen; nativen Owner/Sessiongeneration erhalten.
- OAuth/Custom-Tab/Deep Link, Refresh/Logout/Mirror/Worker-Catch-up,
  Widget REST/Realtime nachweisen; kein zweiter Auth-Owner/Pushmaster.
- Acceptance: bestehende Config/Session überleben APKupdate, Keywechsel/
  Clientneubau/Kaltstart/Reentry; Login/Refresh/Logout/Widget funktionieren,
  späte Worker schreiben nicht nach Logout. Secrets auch aus Restore abwehren.
- Nur reale Harnesses/nötige Verhaltensfälle; kein nachgewiesenes Androidunit-
  Testset heute. Build kein Device-PASS; reales Gerät ist Abschlussgate.
- Non-Scope: native Features/Signingrotation. G5 vor Device/Installation/Wirkung;
  geprüfter APK-/Store-Rückfall. Sessionverlust/Fremdowner = STOP.

### W5 — Integrierter Nachweis und Legacy-Abschaltung

- Eigener R3-Abschalt-Child aus grünen Consumerpostimages: S4R/Preimage/
  Forward/Reverse/Briefing/G6, keine S6-Aufräumaktion.
- Legacyabhängigkeiten in Source/deployed Functions/Actions/Config/Recovery,
  alten Tabs/Caches/installierten APKs/indirekten Callern schließen.
  Defaultenvs dürfen existieren; kein aktiver Consumer benötigt sie.
- Gesamtmatrix/echte User-/Schedulerbelege und gezielte named Rotation ohne
  Fremdconsumerbruch. Keine Pflichtrotation aller Keys aus Symmetrie;
  konkrete Tests mit G3/Wirkungsgrenze.
- Beobachtungsfenster aus realen Weeklyruns/Incidentticks/PWA-/APKupdate
  einfrieren. HTTP-Smoke ersetzt keinen Weeklyjob; alternativ freigegebene
  manuelle Runs mit repräsentativem Trigger, Writes/Testdatenbehandlung.
- Grants/RLS/RPC/Owner read-only/relevant getestet; neue SQL nur nach
  gesonderter Bedarfsentscheidung.
- Nach bewiesener Plattformgranularität Legacy deaktivieren und Postchecks
  **unter deaktivierten Legacy-Keys**. Signing nicht rotieren, nichts löschen.
- Acceptance: produktive Chain ohne Legacyabhängigkeit, korrekte Identität/
  Rechte/Recovery. Fehler → Wiederaktivierung/Postchecks, ggf. Function-/Action-/
  Productload-Rückfall wie vorab festgelegt, dann STOP.
- Ohne G6 konkret reviewbares `READY_FOR_OWNER_DECISION`;
  keine DONE-Behauptung mit aktiven Legacy-Keys.

### W6 — Dokumentation und Gesamtclosure

- Gültige Childacceptance/Evidence zusammenführen; unveränderte Checks nicht
  mehrfach wiederholen, Drift entscheidet.
- Auth/Supabase/Android-/Widget-Overviews, QA/HOW-TO/Recovery gezielt synchron:
  Namen/Stores/Rotation/Wiederanlauf ohne Keys/Token.
- Changelogentscheidung: tatsächliche Migration voraussichtlich bemerkenswert;
  W0 heute reine Planung, deshalb kein `CHANGELOG.md`-Write.
- Native Full-Abschlussreview, Acceptance/Findings/Reverse, finales Postimage-
  Receipt, Child-S6/Parentstatus/Resume konsistent; erst danach Archiv.
- Kein automatischer Commit/Push. STOP bei fehlenden Smokes/offenem W5,
  In-Scope-P0/P1/ungeklärtem Postimage, kein kosmetischer Abschluss.

## Prüfmatrix und Evidence-Vertrag

Heute nur W0-Prüfregister. Folgende Tests sind **künftige Pflichten, keine
ausgeführten PASS-Ergebnisse**. Child-S4R friert Commands/Fixtures/Versionen/
Wirkungen/Orakel ein; Evidence Outputs/EV-IDs, Parent nur Resultat/Restrisiko.

| ID | Ebene / Orakel | Consumer / Invalidation |
| --- | --- | --- |
| T1 | Gültiges Publishable/erlaubtes Legacy-anon; secret/service_role/malformed/empty fail closed; fremdes Projekt über Runtimebinding abweisen, keine Wertlogs | UI/Client/Header/native Eingabe/Restore/Bridge; Validator/Store/env |
| T2 | Fehlender JWT/API-Key-only auf beiden Headern/ungültig/abgelaufen/falsches Projekt/anonyme Auth-Session/unzulässiger Owner/Authserverfehler: zero side effects | Aktive Userfunctions; Handler/Gateway/Signing/SDK |
| T3 | Erlaubter Real-JWT, unverändertes Signing; Authserver/RLS-Userclient/End-to-End-Caller | Monthly/Protein/Trend/AI; Mockpass kein Real-Token-Smoke |
| T4 | Richtiger named Secret/Serverowner; falscher Modus/Name/publishable/Fremdkey/Bodyowner/missing oder malformed Map abgelehnt | Scheduler; Secretbinding/SDK/Ownerenv/Handler |
| T5 | Caller → Function → interner Client → RPC/DB; HTTPfail/Trigger/Manualdiagnose/Fachidempotenz | Scheduler/Incident/Report; Action/Flag/RPC |
| T6 | Benutzerereignis → UI-Binding → Config/Session → Data Access/Transport → Antwort/Persistenz/read-back; Callzahl/kein Doppelwrite | Geänderte produktive UI-Schreibpfade als zusammenhängendes Last-Mile-Orakel |
| T7 | PWA Kalt/Warm/alter Tab/Cache/Offline/Resume/Keywechsel/Refresh/Login/Logout/REST/RPC/Realtime/Voice/Report | Client/Hub/SW/Auth; echte AIkosten nur gated |
| T8 | Android bestehender Store/Neuinstallation/OAuth/Deep Link/Generation/Refresh/Logout/Bridge/Widget/Reentry/Worker | Native SDK/Store/Bridge/Variant, echtes Devicegate |
| T9 | Keine Secrets in Publicartefakten/APK/Repo/Doku/Logs/Recovery; RLS/Grants/ACL, anon ohne Gesundheitsdaten/Service-RPC | Auth/env/build; SQL26-Fixture nur bei Invalidation/Bedarf |
| T10 | Keyzuordnung/Rotation/Weekly-/Incidentbelege/Legacy deaktiviert/Forward/Reverse/Recovery | Live-Key/Action/Runtime/Client |

S4: passende lokale Checks und nativer Delta/Consumerreview, keine externen
Reviews. S5: günstiger Zielpostimage-Precheck → vollständige relevante lokale/
Browsermatrix/Last-Mile-Orakel → nativer Full Review → bei Codeänderungen
ein CodeRabbit-Initiallauf → berechtigte Findings gebündelt korrigieren/
invalidierte Checks → höchstens ein Verifikationslauf → produktives Read-only-
Preflight → Owner-Gate → Cutover/Real-Smokes, ggf. atomarer Reverse/Postcheck.
Weitere externe Läufe nur neues P0/P1-/Security-/Daten-/Vertragsrisiko oder
Ownerauftrag. Nicht verfügbarer Review kein PASS; Abschlussfolge nach Vertrag/
Owner, keine externe Dauerschleife.

Jeder Child hat S1/S2/S3/S4R/S4/S5/S6-Status und kurzen Resume. W1-Reuse
ersetzt weder Child-S3 noch S4R. Der gemeinsame W2/W3-Child hat einen
finalen Gesamtdiff, einen integrierten S5/S6 und insgesamt höchstens 1 Initial-
plus 1 Verifikationslauf. Vor erstem Teilcutover vollständige lokale Test-/Review-
kette; danach je Teilfenster aktueller Precheck, Owner-Gate, betroffene reale
Smokes und Reverse. Gültiges Codereview nicht ohne Invalidation wiederholen.
Gemeinsame Evidence ab erstem konkreten Bedarf. Heute CodeRabbit `0`,
keine Produkt-/Deno-/Browser-/SQL-/Android-/Remote-Smokes.

## Findings und Disposition

`CORRECTED_IN_PLAN` ist ein behobener Planungsbefund, **kein Produktcodefix**.
`EXECUTION_BLOCKER` sperrt die konkrete technische Grenze. Owner Stephan;
Folgeartefakt dieser Parent mit genannter Wave/Child.

| ID / Priorität | Befund | Disposition |
| --- | --- | --- |
| F01 / P1 Planung | Augustbaseline R14 offen/V1 Writer/Cache v13 veraltet | `CORRECTED_IN_PLAN`: heutige/historische Baselines getrennt, V2 und Source v32/v29 |
| F02 / P1 Planung | Moderne Protein-/Trendcaller als Neubau, alte R13-Zwischenstände | `CORRECTED_IN_PLAN`: finaler Digest/heutige Workflows, gezielte Revalidierung |
| F03 / P1 Planung | Gatewayakzeptanz/Bearerkompatibilität mit Useridentität verwechselt | `CORRECTED_IN_PLAN`: Docswiderspruch/Header/Handler/Real-Token-Smoke |
| F04 / P0 Ausführungsrisiko | AIhandler ohne verpflichtende Identity, Hub API-Key-Bearer | `EXECUTION_BLOCKER` W2/G2/G3/G4: Caller/Guard gemeinsam, kein behaupteter Liveexploit |
| F05 / P0 Ausführungsrisiko | Moderne Secretabwehr/native Restorefallbacks fehlen | `EXECUTION_BLOCKER` W2–W4: alle Publicgrenzen/T1/T8 vor jeweiligem Public-Key-Cutover |
| F06 / P1 Planung | Interne Legacyclients/envs trotz modernem Caller übersehen | `CORRECTED_IN_PLAN`: Secret-/Zielmatrix, W2/W5 technischer Nachweis |
| F07 / P0 Ausführungsrisiko | Incident akzeptiert Bodyowner vor Serverdefault | `EXECUTION_BLOCKER` W2: erlaubte Manual-/Serverowner einfrieren/T4, keine Multiuserlogik |
| F08 / P1 Planung | Live-/Tool-/Devicebelege fehlen, R14-Deferral kein Ersatztest | `CORRECTED_IN_PLAN`: W1/Child-S4R/W4, keine S4-READY-Behauptung |
| F09 / P1 Planung | Legacy-Togglegranularität/Reverse/Jobfenster vorausgesetzt | `CORRECTED_IN_PLAN`: W1 Plattform/W5 konkreter Reverse/Caller-/Jobnachweis |
| F10 / P1 Prozess | Kein vergleichbarer LARGE-Kostenbeleg | Reale Ablehnung bleibt, D8 nur W0; künftige Blöcke frisch zulassen |
| F11 / P1 Review | Teilcutover im gemeinsamen W2/W3-Child ließ Zeitpunkt/Geltung des externen Reviews offen | `CORRECTED_IN_PLAN`: finaler Gesamtdiff/volle lokale S5-Kette vor erstem Fenster; ein Reviewbudget pro Child, Runtimegates getrennt |
| F12 / P2 Umfang | Unnötige SQL-/Docker-/SDK-/Signingmodernisierung | `CORRECTED_IN_PLAN`: Non-Scope/Bedarf/gezielte Children |
| F13 / P1 Review | Publictypfilter könnte als Keygültigkeits-/Projektbeweis missverstanden werden; Anonymous-Sessionfall fehlte | `CORRECTED_IN_PLAN`: Projektbinding/Real-Smoke getrennt, T1/T2 und verpflichtender Userguard |
| F14 / P2 Dokument | Erstes Schreibverfahren ließ Formatmarker/Zeichensatzfehler im Draft | `CORRECTED_IN_DOCUMENT`: UTF-8-Fassung, echte Markdown-Codezeichen, Endprüfung ohne Marker/Mojibake |
| F15 / P1 Zulassung | U2 Kostenhistory fehlte; passender vollständiger INTEGRATED_REVIEW-Erstlauf mit D11/D12 vorbereitet, U3 wegen 5h-Kapazität abgelehnt | `BLOCKED_BEFORE_START_CAPACITY`; Checkpoint 55/32, Startminimum für 50/15 inkl. Reserve 75/25; keine Liveabfrage, kein Permit oder W1-Kostenbeleg; kein kleineres Budget ohne neuen Ownerentscheid und keine Retry-/Warteschleife |

F04/F05/F07 vor jeweiliger produktiver Grenze beheben/beweisen; heute keine
Codefixes. Offene Live-/Tool-/Devicegates sperren Ausführung, nicht ehrliches
Discoverydesign. Gesamt-DONE erlaubt keine offenen In-Scope-P0/P1.

## Cross-Wave Acceptance

Programm-DONE nur mit gültiger Evidence für A1–A8:

- A1: Aktive Publicclients Publishable; privilegierte Keys abgewehrt,
  Config/Session erhalten.
- A2: Usercaller echter JWT plus Function-/Ownerprüfung; keine API-Key-only-
  Daten-/Kostenwirkung.
- A3: Protein/Trend/Incident passende unabhängig rotierbare named Secrets,
  Serverowner/moderner Servicekontext; keine per-Key-SQL-Isolation.
- A4: RLS/Grants/ACL, V2-only-Writer, Medizin-/Report-/Pushvertrag/native
  Sessionowner erhalten.
- A5: PWA/Realdevice/Widget/Realtime/Report/AI/Incident/Scheduler relevante
  Smokes bewiesen, nicht ausgeführte Tests nicht grün.
- A6: Legacy unter G6 deaktiviert und produktive Chain ohne sie; JWTsignierung
  unverändert. Endgültige Löschung kein Abschlusskriterium.
- A7: Namen/Stores/Rotation/Recovery/Forward/Reverse ohne Credentials dokumentiert.
- A8: Child-S6/Parent-W6 erfüllt, In-Scope-P0/P1 geschlossen, Status/Evidence/
  Resume/Changelog synchron; anschließend Archiv.

## Invalidation, Rollback und Closure

| Änderung | Invalidiert / gezielter Refresh |
| --- | --- |
| Governance/Releasebinding | Betroffene Regeln/Gates neu, historische Roadmaps nicht still umschreiben |
| Authhelper/Header/Validator/SDK | T1–T4/Caller, geteilter Securitypfad braucht integrierten Fullnachweis |
| SW/Productload/Store/Bridge | T6–T8, echte Cache-/Upgrade-/Sessionpostconditions |
| Live-Key/Secret/Owner/Function/Flag/Action | Betroffenes Preimage/T2–T5/T10/Gates |
| SQL/RLS/RPC | T9/Wrapperfixtures/konkreter Forward-/Reverse-/DBbedarf |
| Caller/Scope | Matrix/Routing/Größe/Reserve/Gates neu reviewen |
| Resetwechsel/Telemetriefehler | Usage/Reserve/Episode frisch, keine alten Verbrauchsdeltas |

W0-Reverse nur dieses Dokument aus gesichertem Preimage, Dirty-Vorarbeit
unberührt. Jeder spätere Cutover mit Config-/Daten-/Runtime-/Secret-/APKpreimage,
Reverse/Postchecks; Legacy bis W5 Rückfall. Revoke/Löschen/Signingrotation ist
keine leicht reversible Aufräumaktion.

Erster produktiver Pflichtfehler: atomaren Block an definierter Rollback-/
Postcheckgrenze schließen, Finding/tatsächliches Postimage/Resume sichern.
Diagnose/Reparatur scopegedeckt/frisch admitted als separater Block,
keine Retry-Kette. Budgetstopp: keine neue Wave, kohärenter Stand
`PAUSED_USAGE_SAFE_CLOSURE`. LIMIT sperrt auch Closure-Tools.

## Nativer Contract Review und W0-Prüfregister

2026-10-05; nativ `Full`, CodeRabbit `0`, keine delegierten Reviews.
Prüfumfang: Auftrag/Routing, Quellen/Baselines/Consumer, Scope/Non-Scope,
Capabilities, R3/Secret/Owner/Reverse, Reviewfolge/Evidence/Invalidation/Fresh Chat.
Augustreview-PASS gilt ausschließlich für damaligen Diff.

| Check | Status / Ergebnis |
| --- | --- |
| V1 Auftrag/Routing/Regelbasis | `PASS`: Rolling Wave, gezielte S1–S6-Grenzen, Blueprintfreeze/lokaler Vertrag, Scope und Reasoning ehrlich |
| V2 Source/Baseline/Consumer/Authvertrag | `PASS`: R13/R14/current Source getrennt, alle bekannten Caller und internen Clients, F01–F09/F13 verarbeitet; Liveprüfungen offen |
| V3 Gates/Readiness/Reverse/Evidence/Reviewbudget | `PASS`: Keine implizite Produktfreigabe; F11 korrigiert, Programmevidence/Child-Roll-up und erste Fehlergrenze klar |
| V4 Fresh-Chat-Test | `PASS` W0-Review; Closuredelta: W0 fertig, W1 zuerst, G1/D11/D12 erteilt, U3 kapazitätsgesperrt; keine Live-/Produktwirkung ohne gültiges Permit |
| V5 Markdownlinks/Sourcefingerprints/Diff | `PASS`: 41 Quellen/Links existent, Fingerprints gültig; UTF-8/Formatkorrektur und `git diff --check` geprüft |
| V6 Geschützte Vorarbeit/Schreibscope | `PASS`: Zwölf vorbestehende Dirty-Dateien bytegleich; einziger zusätzlicher getrackter Diff dieser Masterplan |

Urteil `PASS` für die W0-Dokumentation nach Korrektur F11/F13/F14 und Endprüfung.

Nativer Vorbereitungs-/Closurereview 2026-10-05: Request-Schema und Profilshape
bestanden; vollständiger LARGE/R3/Full/remote-Scope erhalten. D11/D12 bindet
50/15 und Serialität, U3 bleibt ehrliche Startablehnung. W1-Ausführungsreview
und Acceptance nicht durchgeführt; kein W1-DONE/Produkt-PASS behauptet.
Quelle/Vertrag, Freigaben, Usage, F15 und Resume auf diesen Stop synchronisiert.
Keine offenen Planungsreview-Findings. Technische Folgeblocker F04/F05/F07
und nicht erteilte Runtimegates bleiben sichtbar, ohne Produkt-PASS zu behaupten.
W0 `DONE`; Parent `AWAITING_EXECUTION_AUTHORIZATION`, nicht S4-READY/DONE.

## Offizielle Referenzen

Gezielt geprüft 2026-10-05; bei Zeit/API/SDKdrift vor Implementation revalidieren.
Changelog auf Relevanz gesichtet; Postgres-/Selfhoständerungen erweitern Scope nicht.

- [API Keys/Rollen](https://supabase.com/docs/guides/getting-started/api-keys)
- [Keymigration/Parallelbetrieb/Edge-Env-Maps](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys)
- [User-/Secret-/benannte Edge-Authmodi](https://supabase.com/docs/guides/functions/auth)
- [Header-/Gatewayvertrag](https://supabase.com/docs/guides/functions/auth-headers)
- [JWTsignierung separat](https://supabase.com/docs/guides/auth/signing-keys)
- [Authserververifikation getUser](https://supabase.com/docs/reference/javascript/auth-getuser)
- [Supabase Changelog](https://supabase.com/changelog)

## Resume Card

- Parent `SUPA-KEY-2026`, Revision `SUPA-RW-1 / 2026-10-05`, Profil `gated`.
- W0 DONE: Deep Dive, Neufassung, nativer Full Review/Korrekturen V1–V6;
  W1 NOT_STARTED / ADMISSION_BLOCKED_CAPACITY, keine W1-Liveabfrage.
- G1 plus D11 FIRST_RUN_BUDGET 50 Punkte 5h / 15 Weekly und D12 Serialität
  erteilt. Zusätzliche Reserven 25/10, ein Start, kein Paid Spend.
- U3-Begin abgelehnt: ENDPHASE_START_REJECTED:CAPACITY_INSUFFICIENT:fiveHour.
  Kanonischer Checkpoint 18:49:57 +02:00: 55 % / 32 % Rest, Reset-IDs
  `1791229932 / 1791617806`; kein Startrecord/Permit oder Kostenbeleg.
- Konkrete Belege `.kasrkin/work/supa-w1-first-run-20261005/`; ursprüngliche
  Factorybundles erhalten, explizite Owneradapter als neue unveränderliche Dateien.
- Nächster zulässiger Schritt: nach ausreichender frischer Kapazität (50/15 plus
  Reserve verlangt 75/25) den vollständigen W1-Block gegen aktuellen Parent
  neu einfrieren/binden und zulassen. Kein alter Snapshot/Permit als Zulassung.
- Ownerbeleg läuft 2026-10-05 20:49:33.8568958 +02:00 ab; danach neue finite
  Ownerautorität nötig. Keine automatische Erneuerung, Verkleinerung oder Warte-/Retrykette.
- W1 im Parent; Backend/Web-Child S1–S6 erst aus realer Discovery vorbereiten,
  S4/W2 bleiben G2-gated. Liveprojekt/Caller/Legacy-Reverse NOT_VERIFIED.
- F15 Kapazitätsblocker; F04/F05/F07 Folgeblocker W2–W4, keine Codefixes.
- R13 reuse; R14 DONE/V2 Writer, Device deferred; Source SW v32/v29.
- Zwölf Dirty-Dateien geschützt; kein SQL/Deploy/Key/Device/Install/Commit/
  Paid Spend. Signingrotation Non-Scope; Modell-/Reasoning-Runtime NOT_OBSERVABLE.
- Minimalrefresh gemäß Startkarte/Receipt, Originale nur bei Abdeckungslücke/Drift.
