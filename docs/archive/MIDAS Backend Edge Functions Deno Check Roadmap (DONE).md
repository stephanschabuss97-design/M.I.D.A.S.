# MIDAS Backend Edge Functions Deno Check Roadmap

## Ziel (klar und pruefbar)

Die MIDAS Supabase Edge Functions im separaten Backend-Workspace sollen systematisch mit Deno geprueft und bei echten Befunden gezielt korrigiert werden.

Pruefbare Zieldefinition:

- Alle bekannten `index.ts`-Dateien unter `C:/Users/steph/Projekte/midas-backend/supabase/functions` wurden inventarisiert.
- Jede Function wurde mindestens mit `deno check` oder einem dokumentierten Ersatzcheck bewertet.
- Findings werden getrennt nach:
  - lokaler Tooling-/Type-Resolver-Befund
  - echter Type-/Syntax-Befund
  - potenzieller Runtime-/Contract-Befund
  - bewusst nicht lokal pruefbarer Integration-Smoke
- Echte Code-Findings werden pro Function separat gefixt und anschliessend erneut geprueft.
- Keine Function wird fachlich umgebaut, wenn nur ein Hygiene- oder Tooling-Befund vorliegt.
- Backend-Aenderungen ausserhalb des MIDAS-Git-Repos werden explizit dokumentiert.

## Problemzusammenfassung

Im Push-Sprint wurde Deno lokal verfuegbar gemacht und die Edge Function `midas-incident-push` erfolgreich mit `deno check` geprueft.

Das legt nahe, die restlichen Backend-Functions ebenfalls kontrolliert zu pruefen. Ohne Roadmap waere das riskant, weil Edge Functions produktive Backend-Vertraege betreffen:

- Assistant, Vision, Transcribe und TTS beruehren Nutzerinteraktion und AI-Flows.
- Trendpilot, Monthly Report und Protein Targets beruehren Auswertungen und Health-Kontext.
- Push ist bereits kritisch fuer Reminder/Incident-Verhalten.
- Der Backend-Workspace liegt ausserhalb des aktuellen MIDAS-Frontend-Git-Repos.

Diese Roadmap soll verhindern, dass aus einem sinnvollen Hygiene-Sweep ein unkontrollierter Backend-Umbau wird.

## Scope

- Inventar aller Supabase Edge Functions im Backend-Workspace.
- Deno-/Type-/Syntax-Checks pro `index.ts`.
- Klassifikation der Findings.
- Kleine, begruendete Fixes fuer echte Type-/Syntax-/Import-/Contract-Befunde.
- Keine fachliche Logikaenderung ohne explizites Finding und Review.
- Dokumentation von nicht lokal ausfuehrbaren Runtime-Smokes.
- Pruefung auf Deploy-Drift zwischen lokal gecheckter Function-Datei und produktiver Supabase-Function, soweit lokal sinnvoll moeglich.
- Optionaler Update von `docs/QA_CHECKS.md`, falls neue dauerhafte Backend-QA-Punkte entstehen.
- Optionaler Doku-Sync betroffener Module Overviews, falls sich ein Vertrag aendert.

## Not in Scope

- Neue Features in Edge Functions.
- Aenderung medizinischer Bewertung, Schwellen oder Grenzwerte.
- Aenderung von Prompting-/AI-Verhalten ohne konkreten Bug.
- SQL-/RLS-/Datenmodell-Aenderungen.
- Supabase-Secrets, VAPID-Keys, OpenAI-Keys oder andere Secrets anzeigen oder committen.
- Automatischer Deploy nach jedem Fix.
- Massenrefactor ueber mehrere Functions ohne isolierten Befund.
- Frontend-Umbau.
- GitHub-Actions-Umbau, ausser ein Function-Contract-Finding beweist Bedarf.
- `.bak`-, Archiv- oder historische Helper-Dateien als produktive Edge Functions behandeln.

## Relevante Referenzen (Code)

Backend-Workspace:

- `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-assistant/index.ts`
- `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-incident-push/index.ts`
- `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-monthly-report/index.ts`
- `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-protein-targets/index.ts`
- `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-transcribe/index.ts`
- `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-trendpilot/index.ts`
- `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-tts/index.ts`
- `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-vision/index.ts`

Frontend-/Repo-Referenzen fuer Contract-Abgleich:

- `.env.supabase.local` (lokal, ignored, keine Secrets in Doku)
- `.github/workflows/incidents-push.yml`
- `.github/workflows/protein-targets.yml`
- `.github/workflows/trendpilot.yml`
- `app/modules/hub/index.js`
- `app/supabase/api/reports.js`
- `app/modules/vitals-stack/protein/index.js`
- `docs/QA_CHECKS.md`
- relevante Module Overviews je Function-Bereich

## Relevante Referenzen (Doku)

- `README.md`
- `docs/MIDAS Roadmap Template.md`
- `docs/modules/Push Module Overview.md`
- `docs/modules/Assistant Module Overview.md`
- `docs/modules/Trendpilot Module Overview.md`
- `docs/modules/Reports Module Overview.md`
- `docs/modules/Doctor View Module Overview.md`
- `docs/modules/Protein Module Overview.md`
- `docs/modules/VAD Module Overview.md`
- `docs/modules/Activity Module Overview.md`
- `docs/QA_CHECKS.md`
- `docs/archive/Push Channel Robustness & Android WebView Boundary Roadmap (DONE).md`
- `docs/archive/MIDAS Touchlog Module & Push Service Extraction Roadmap (DONE).md`

## Guardrails

- MIDAS bleibt single-user und alltagstauglich.
- Backend-Hygiene ist kein Produktfeature.
- Keine medizinische Neubewertung ohne expliziten Scope.
- Keine Prompt-/AI-Verhaltensaenderung ohne konkreten Befund.
- Keine Secrets in Logs, Doku, Git-Diff oder finaler Antwort.
- Keine stillen Deploys ohne ausdrueckliche Abnahme.
- Jede Function wird einzeln betrachtet, damit Findings nicht vermischt werden.
- Ein lokaler Type-Resolver-Befund ist nicht automatisch ein Runtime-Bug.
- `index.ts.bak` und funktionsnahe Roadmap-/Notizdateien sind Referenzmaterial, nicht produktiver Check-Scope.
- Source-of-Truth-Dokus muessen nur aktualisiert werden, wenn sich ein Vertrag real aendert.
- OpenAI-Modell-Env-Vars und Prompt-/Response-Vertraege sind Produktvertrag, kein freier Cleanup-Scope.
- Response-Shapes, Auth-Grenzen und Scheduler-Payloads duerfen nicht als Nebenwirkung eines Type-Fixes geaendert werden.

## Architektur-Constraints

- Supabase Edge Functions laufen in Deno/Supabase Runtime.
- Lokale IDE-/TypeScript-Server koennen `jsr:`- oder `npm:`-Imports anders bewerten als Deno.
- `deno check` prueft statisch, ersetzt aber keinen Runtime-Smoke gegen Supabase, OpenAI, Auth, Storage oder Datenbank.
- Der Backend-Workspace `C:/Users/steph/Projekte/midas-backend` liegt ausserhalb des aktuellen MIDAS-Git-Repos.
- `.env.supabase.local` ist lokal und darf nicht committed werden.
- Deploys muessen bewusst und function-spezifisch erfolgen.
- Ein gruener lokaler `deno check` beweist nicht, dass die produktiv deployte Supabase-Function denselben Stand nutzt.
- Wenn Code geaendert wird, muss S5/S6 explizit zwischen `lokal geprueft`, `deployed` und `Deployment offen` unterscheiden.

## Tool Permissions

Allowed:

- Inventar- und Read-Only-Scans im Backend-Functions-Verzeichnis.
- `deno check` pro Function.
- gezielte `rg`-/`Select-String`-Scans fuer Imports, Env Vars, `Deno.serve`, Response-Vertraege und sensitive Logs.
- Read-only-Abgleich von Begleitdateien wie `voice-assistant-roadmap.md` oder `.bak`, wenn sie konkrete Contract-Hinweise enthalten.
- Kleine Code-Fixes in einzelnen Backend-Functions, wenn S4 den konkreten Befund freigibt.
- Erneuter `deno check` nach Fix.
- Doku-/QA-Updates in diesem Repo, falls neue dauerhafte Checks oder Contract-Aenderungen entstehen.

Forbidden:

- Secrets aus `.env`, Supabase, GitHub oder Logs ausgeben.
- Deploy ohne explizite User-Freigabe.
- Mehrere Functions gleichzeitig refactoren.
- Fachlogik, Prompts, medizinische Schwellen oder Response-Vertraege nebenbei aendern.
- SQL/RLS/Datenmodell als Nebeneffekt aendern.
- Frontend-Code aendern, ausser die Roadmap findet einen harten Contract-Drift und der User gibt es frei.
- `.bak`-Dateien automatisch loeschen oder als Source of Truth behandeln.

## Execution Mode

- Sequenziell arbeiten: `S1` bis `S6`.
- `S1` bis `S3` sind Inventar, Doku-/Contract-Review und Bruchrisikoanalyse.
- `S4` ist der Function-fuer-Function-Check- und Fixblock.
- `S5` ist Review und Testblock.
- `S6` ist Doku-/QA-Sync und Abschluss.
- Pro Function wird ein kurzes Ergebnisprotokoll geschrieben.
- Keine Function gilt als erledigt, ohne:
  - Check-Ergebnis
  - Findings-Klassifikation
  - Fix-Entscheidung
  - Restsmoke-Entscheidung

## Statusmatrix

| ID | Schritt | Status | Ergebnis/Notiz |
|---|---|---|---|
| S1 | Inventar und Referenzcheck | DONE | 8 produktive Functions, 2 Begleitdateien und relevante Modul-/Frontend-/Workflow-Referenzen erfasst. |
| S2 | Contract- und Scope-Review | DONE | Gemeinsamer Edge-Vertrag, function-spezifische No-Gos, Fix-Kriterien und Deploy-Kriterien dokumentiert. |
| S3 | Risiko- und Checkplan | DONE | Check-Reihenfolge, Ergebnislabels, Smoke-Strategie, Secret-/PII-Review und Deploy-Drift-Kriterien festgelegt. |
| S4 | Function-fuer-Function Deno Check und Fixes | DONE | Alle 8 Functions geprueft; S4.1/S4.4/S4.6 gruen ohne Deploy, S4.2/S4.3/S4.5/S4.7/S4.8 minimal gefixt und deployed. |
| S5 | Gesamt-Review und Regression | DONE | Alle Ergebnisse gegen Guardrails, Secrets, Contract-Drift, Deployment-Stand und optionale Runtime-Smokes reviewed; keine offenen P0/P1-Findings. |
| S6 | Doku-/QA-Sync und Abschluss | DONE | QA ergaenzt, Module Overviews reviewed ohne Vertragsaenderung, Roadmap final synchronisiert; kein weiterer Deploy notwendig, Archiv nach User-Abnahme sinnvoll. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Vorab-Inventar 30.04.2026

Gefundene Functions:

| Function | Zeilen ca. | Erste Einschaetzung |
|---|---:|---|
| `midas-tts` | 160 | klein, guter erster Check-Kandidat |
| `midas-transcribe` | 257 | klein, Audio/STT |
| `midas-vision` | 433 | Vision/Food-Analyse, ueberschaubar |
| `midas-assistant` | 556 | Assistant-Backend, produktiv wichtig |
| `midas-protein-targets` | 443 | periodisch/medizinisch relevant |
| `midas-incident-push` | 920 | bereits geprueft/deployed, spaeter Re-Check |
| `midas-monthly-report` | 1128 | gross, Report/Export-Logik |
| `midas-trendpilot` | 1329 | gross, Analyse/Trendpilot |

Vorgeschlagene Reihenfolge:

1. `midas-tts`
2. `midas-transcribe`
3. `midas-vision`
4. `midas-assistant`
5. `midas-protein-targets`
6. `midas-incident-push`
7. `midas-monthly-report`
8. `midas-trendpilot`

Begruendung:

- Kleine, klar abgegrenzte Functions zuerst.
- Bereits bekannte Push-Function als Re-Check, nicht als Startpunkt.
- Grosse Analyse-/Report-Functions zuletzt, weil sie mehr Contract-Risiko tragen.

Begleitdateien im Backend-Functions-Verzeichnis:

- `midas-assistant/voice-assistant-roadmap.md`
  - funktionsnahe historische/planerische Doku
  - nur als Referenz lesen, wenn Assistant-/Voice-Contract betroffen ist
- `midas-vision/index.ts.bak`
  - Backup-/Altdatei
  - nicht als produktive Edge Function pruefen
  - nicht automatisch loeschen oder veraendern

## Vorab Contract Review 30.04.2026

Review-Frage:

- Ist die Roadmap eng genug, um Backend-Hygiene zu erlauben, ohne produktive Edge-Function-Vertraege unbeabsichtigt umzubauen?

Entscheidung:

- Ja, mit folgenden Korrekturen:
  - `.bak`-Dateien sind explizit nicht produktiver Check-Scope.
  - funktionsnahe Roadmap-/Notizdateien sind nur Referenzmaterial.
  - Deploy-Drift muss als eigener Reviewpunkt gefuehrt werden.
  - Module Overviews fuer Reports, Doctor View, Protein und VAD sind relevante Vertragsreferenzen fuer einzelne Functions.

Contract:

- `deno check` ist Pflichtcheck, aber kein Runtime-Beweis.
- Code-Fix ist erlaubt, wenn der Befund echt und isoliert ist.
- Deploy ist nie implizit Teil eines Fixes.
- Produktive AI-, Report-, Trend-, Push- oder Protein-Vertraege duerfen nur bei konkretem Finding veraendert werden.
- Secrets und Rohdaten bleiben ausserhalb von Logs, Roadmap und finaler Antwort.

Findings aus dem Review:

- CR-F1: Backup-/Begleitdateien waren initial nicht sauber abgegrenzt.
- CR-F2: Deploy-Drift zwischen lokalem Backend-Workspace und produktiver Supabase-Function war noch nicht explizit genug.
- CR-F3: Doku-Referenzen sollten die tatsaechlich vorhandenen Module Overviews nennen.

Korrektur:

- CR-F1 bis CR-F3 wurden in Scope, Not in Scope, Guardrails, Architektur-Constraints, Tool Permissions und Referenzen eingearbeitet.

## S1 - Inventar und Referenzcheck

Ziel:

- Backend-Functions vollstaendig erfassen.
- Relevante Frontend-/Doku-Vertraege je Function zuordnen.
- Noch keine Codeaenderung.

Substeps:

- S1.1 README und MIDAS Roadmap Template lesen.
- S1.2 Backend-Functions-Verzeichnis inventarisieren.
- S1.3 Pro Function erfassen:
  - Zweck
  - relevante Env Vars
  - relevante externe APIs
  - relevante Supabase-Tabellen oder Views
  - relevante Frontend-/Workflow-Konsumenten
- S1.4 Begleitdateien klassifizieren:
  - produktiv
  - Referenzmaterial
  - Backup/Altdatei
- S1.5 Relevante Module Overviews zuordnen.
- S1.6 Historische Roadmaps nur bei direktem Bezug lesen.
- S1.7 S1 Contract Review.
- S1.8 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Function-Inventar mit Zweck und Risiko.
- Liste betroffener Dokus.

Exit-Kriterium:

- Der Checkplan kann Function-fuer-Function ausgefuehrt werden, ohne unbekannte Scope-Vermischung.

### S1 Ergebnisprotokoll 30.04.2026

Durchgefuehrt:

- Roadmap, README, Roadmap Template und relevante Module Overviews wurden gelesen.
- Backend-Functions-Verzeichnis wurde read-only inventarisiert.
- Pro Function wurden Imports, Env-Var-Namen, externe APIs, Supabase-Tabellen/Views und Repo-Konsumenten gescannt.
- Begleitdateien wurden klassifiziert.
- S1-Contract-Review wurde durchgefuehrt und Findings wurden in dieser Roadmap korrigiert.

Produktive Edge Functions:

| Function | Zweck / Vertrag | Env Vars (Namen, keine Werte) | Externe APIs | Supabase-Tabellen/Views | Primaere Konsumenten / Doku | Risiko |
|---|---|---|---|---|---|---|
| `midas-tts` | OpenAI TTS fuer Voice-Rueckkanal | `OPENAI_API_KEY` | OpenAI `/v1/audio/speech` | keine | `app/modules/hub/index.js`, Assistant/VAD-Doku | klein, AI-Transport |
| `midas-transcribe` | OpenAI STT fuer Voice-V1 | `OPENAI_API_KEY` | OpenAI `/v1/audio/transcriptions` | keine | `app/modules/hub/index.js`, Assistant/VAD/Intent-Doku | klein, Voice-Contract |
| `midas-vision` | Foto-/Vision-Analyse fuer Assistant/Food-Flow | `OPENAI_API_KEY`, `OPENAI_VISION_MODEL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` | OpenAI `/v1/responses` | keine `.from(...)`-Reads im statischen Scan | `app/modules/hub/index.js`, `app/modules/assistant-stack/assistant/actions.js`, QA Vision Checks | mittel, AI/Auth-Kontext |
| `midas-assistant` | LLM-Fallback fuer freie Sprache, nicht Voice-V1-Hauptpfad | `OPENAI_API_KEY`, `OPENAI_ASSISTANT_MODEL`, `OPENAI_ASSISTANT_MODEL_VOICE` | OpenAI `/v1/responses` | keine | `app/modules/hub/index.js`, `session-agent.js`, Assistant/Intent-Doku | mittel, Prompt-/Response-Vertrag |
| `midas-protein-targets` | Protein-Zielberechnung und Persistenz | `PROTEIN_TARGETS_USER_ID`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL` | keine | `health_events`, `user_profile` | `app/modules/vitals-stack/protein/index.js`, `.github/workflows/protein-targets.yml`, Protein-Doku | hoch, Health-Kontext |
| `midas-incident-push` | Remote Push fuer Medication/BP Reminder/Incidents | `INCIDENTS_TZ`, `INCIDENTS_USER_ID`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`, `VAPID_PRIVATE_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_SUBJECT` | Web Push (`npm:web-push`) | `health_medications`, `health_medication_schedule_slots`, `health_medication_slot_events`, `push_notification_deliveries`, `push_subscriptions`, `v_events_bp` | `.github/workflows/incidents-push.yml`, Push-Doku | hoch, Reminder-/Incident-Vertrag |
| `midas-monthly-report` | Monats-/Range-Report fuer Arzt-/Reports-Inbox | `MONTHLY_REPORT_USER_ID`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL` | keine | `health_events`, `trendpilot_events_range`, `user_profile` | `app/supabase/api/reports.js`, Reports/Doctor/Activity-Doku | hoch, Report-/Export-Vertrag |
| `midas-trendpilot` | Woechentliche Trendanalyse und Event-Erzeugung | `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`, `TRENDPILOT_USER_ID` | keine | `health_events`, `trendpilot_events`, `trendpilot_state` | `.github/workflows/trendpilot.yml`, Trendpilot/Doctor-Doku | hoch, Analyse-/Ack-Vertrag |

Begleitdateien:

| Datei | Klassifikation | S1-Entscheidung |
|---|---|---|
| `midas-assistant/voice-assistant-roadmap.md` | historische/planerische Referenz | nicht produktiv checken; nur bei Assistant-/Voice-Contract-Fragen lesen |
| `midas-vision/index.ts.bak` | Backup-/Altdatei | nicht produktiv checken; nicht loeschen; nicht als Source of Truth verwenden |

Doku-Zuordnung:

- Assistant/Voice/AI: `Assistant Module Overview`, `Intent Engine Module Overview`, `VAD Module Overview`, Hub-Referenzen.
- Push: `Push Module Overview`, Touchlog-/Push-Service-Extraction-Doku, `incidents-push.yml`.
- Reports: `Reports Module Overview`, `Doctor View Module Overview`, `Activity Module Overview`, `app/supabase/api/reports.js`.
- Protein: `Protein Module Overview`, `protein-targets.yml`, Protein-Frontend-Bridge.
- Trendpilot: `Trendpilot Module Overview`, `trendpilot.yml`, Doctor-/Charts-/Capture-Integration.

S1 Contract Review:

- Ergebnis: S1 passt zum Roadmap-Vertrag. Es wurden keine Backend-Codeaenderungen vorgenommen.
- Kein produktiver Scope wurde aus `.bak`- oder historischen Dateien abgeleitet.
- Env-Var-Namen wurden dokumentiert, keine Werte.
- OpenAI-Modell-/Prompt-Verhalten bleibt fuer S2/S4 geschuetzt und wird nicht als Hygiene-Fix behandelt.
- `midas-vision` nutzt Supabase-Env/Auth-Kontext, aber der statische Scan findet keine Tabellenreads; S2 muss diesen Auth-/Anon-Boundary explizit als Contract-Pruefpunkt fuehren.
- `midas-assistant` liest im Backend keine Supabase-Tabellen; S2 muss klaeren, dass Kontextversorgung frontendseitig erfolgt und nicht irrtuemlich als Backend-Fehler gewertet wird.

Findings und Korrektur:

- S1-F1: `Activity Module Overview` fehlte als Report-Referenz, obwohl Activity in Reports aggregiert wird.
  Korrektur: Referenz ergaenzt.
- S1-F2: Frontend-/Workflow-Konsumenten waren zu grob gefasst.
  Korrektur: `hub`, `reports`, `protein`, `protein-targets.yml` und `trendpilot.yml` als Contract-Referenzen ergaenzt.
- S1-F3: OpenAI-Modell-Env-/Prompt-Vertraege waren als Guardrail noch nicht explizit genug.
  Korrektur: Guardrail ergaenzt.

S1 Exit:

- Erfuellt. S2 kann pro Function die nicht zu verletzenden Vertraege definieren.

S1 Schritt-Abnahme und Commit-Empfehlung:

- Abnahme: S1 ist abgeschlossen.
- Commit: noch nicht zwingend; sinnvoller Commit-Scope waere spaeter mindestens S1-S3 gemeinsam, solange nur diese Roadmap betroffen ist.

## S2 - Contract- und Scope-Review

Ziel:

- Pro Function klaeren, welcher Vertrag nicht verletzt werden darf.
- Entscheiden, welche Befunde nur Tooling und welche echte Bugs sind.

Substeps:

- S2.1 Gemeinsamen Edge-Function-Vertrag festlegen:
  - CORS
  - Method Handling
  - Auth/Authorization
  - Env-Var-Validierung
  - Fehler-Responses
  - keine Secret-Leaks
- S2.2 Function-spezifische Vertraege festlegen:
  - Assistant
  - Vision
  - Transcribe/TTS
  - Trendpilot
  - Monthly Report
  - Protein Targets
  - Incident Push
- S2.3 Fix-Kriterien definieren:
  - Was wird sofort gefixt?
  - Was wird nur dokumentiert?
  - Was braucht User-Entscheidung?
- S2.4 Deploy-Kriterien definieren:
  - Wann reicht lokaler Check?
  - Wann ist Deploy noetig?
  - Wann ist ein Runtime-Smoke vor Deploy noetig?
- S2.5 Contract Review S2.
- S2.6 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Check-/Fix-Vertrag.
- No-Go-Liste fuer S4.

Exit-Kriterium:

- Deno-Checks koennen gestartet werden, ohne dass jeder Fehler vorschnell als Codebug behandelt wird.

### S2 Ergebnisprotokoll 30.04.2026

Durchgefuehrt:

- Gemeinsamer Edge-Function-Vertrag wurde aus Roadmap, S1-Inventar und statischem Code-Scan abgeleitet.
- Function-spezifische Produktvertraege wurden gegen die Module Overviews abgegrenzt.
- Fix-Kriterien, Dokumentationskriterien, User-Entscheidungskriterien und Deploy-Kriterien wurden festgelegt.
- S2-Contract-Review wurde durchgefuehrt und Findings wurden in dieser Roadmap korrigiert.

Gemeinsamer Edge-Function-Vertrag:

| Bereich | Vertrag fuer S4 |
|---|---|
| Runtime | Supabase Edge Runtime / Deno bleibt massgeblich; IDE-TypeScript-Fehler sind ohne `deno check` kein Runtime-Beweis. |
| Entry Point | Produktive Functions haben genau einen `Deno.serve(...)`-Entry; keine Neben-Entry-Points durch Cleanup einfuehren. |
| CORS | `OPTIONS`/Preflight und bestehende CORS-Header bleiben erhalten; Deno-Fixes duerfen CORS nicht enger oder breiter machen. |
| Method Handling | Bestehender `POST`-Vertrag bleibt erhalten; keine neue GET-/Debug-Oberflaeche. |
| Auth | Bestehende Auth-Grenzen bleiben erhalten: OpenAI-Proxy-Functions nutzen vorhandene Client-/Bearer-Logik, Service-Role-Functions bleiben Scheduler-/User-ID-gebunden. |
| Env Vars | Fehlende Env Vars duerfen validiert/typisiert werden, aber Env-Namen und Defaults werden nicht ohne konkreten Bug umbenannt. |
| Fehler-Responses | JSON-Fehler bleiben maschinenlesbar; keine Roh-Errors mit Secrets, Tokens, Endpoints oder PII ausgeben. |
| Logging | Logs duerfen technische Ursache zeigen, aber keine Secrets, Roh-Payloads mit sensiblen Gesundheitsdaten oder Auth-Header. |
| Response-Shape | Bestehende Response-Felder bleiben stabil, ausser ein konkreter Contract-Bug wird isoliert gefixt. |
| Deploy | Lokaler Check ist kein Deploy; Deploy bleibt function-spezifisch und braucht User-Freigabe. |

Function-spezifische No-Go-Vertraege:

| Function | Nicht verletzen in S4 |
|---|---|
| `midas-tts` | Keine Aenderung an Voice-Ausgabeformat, Audio-MIME, OpenAI-TTS-Modell oder Text-Cleanup ohne echten Bug. |
| `midas-transcribe` | Keine Aenderung an STT-Modell, `response_format`, Transcript-Shape oder Voice-V1-Transcribe-Vertrag ohne echten Bug. |
| `midas-vision` | Keine Aenderung an Vision-JSON-Schema, Summary-/Payload-Shape, Auth-/Anon-Grenze oder Bildgroessenlimit ohne echten Bug. |
| `midas-assistant` | Keine Prompt-, Modell-, Structured-Output-, Allowed-Action- oder Fallback-Verhaltensaenderung ohne explizites Finding. |
| `midas-protein-targets` | Keine Aenderung an Proteinformel, CKD-Faktoren, Doctor-Lock, Cooldown, Window oder Persistenzfeldern ohne medizinisch/fachlichen Scope. |
| `midas-incident-push` | Keine Aenderung an Reminder-/Incident-Schwellen, Dedupe, Severity, Delivery-Health, Diagnosemodus oder Scheduler-Payload ohne Push-Scope. |
| `midas-monthly-report` | Keine Aenderung an Report-Typen, Range-/Monthly-Idempotenz, `system_comment`-Payload, Narrativ oder Doctor-Read-Only-Vertrag ohne Report-Scope. |
| `midas-trendpilot` | Keine Aenderung an Baseline, Trend-Gates, Severity, Ack, Kontextsaetzen oder Dedupe ohne Trendpilot-Scope. |

Fix-Kriterien fuer S4:

- Sofort fixbar:
  - echte Type-/Syntaxfehler, die `deno check` rot machen und isoliert korrigierbar sind
  - falsche Import-/Typdeklarationen, wenn Runtime-Vertrag unveraendert bleibt
  - offensichtlich unerreichbarer Code oder falsche Typannahmen ohne Fachlogik-Aenderung
  - Secret-Leak-Risiko in Logs, falls im Scan konkret gefunden
- Nur dokumentieren:
  - IDE-/TypeScript-Server-Probleme, die `deno check` nicht bestaetigt
  - Runtime-Smokes, die lokale Secrets, echte OpenAI-Kosten oder Produktdaten brauchen
  - produktiver Deploy-Drift, wenn kein sicherer lokaler Nachweis moeglich ist
- User-Entscheidung erforderlich:
  - jede Prompt-/Modell-/Response-Shape-Aenderung
  - jede medizinische Formel, Schwelle, Severity, Report- oder Trendlogik
  - jede Auth-/Security-Grenzaenderung
  - jeder Deploy
  - jede SQL-/RLS-/Datenmodell-Aenderung

Deploy-Kriterien:

- Lokaler Check reicht vorerst, wenn:
  - keine Backend-Datei geaendert wurde
  - ein Fix rein dokumentarisch ist
  - ein Finding als Tooling-Warnung klassifiziert wurde
- Deploy ist fachlich noetig, wenn:
  - produktiver Backend-Code einer Function geaendert wurde
  - ein Runtime-Bug in produktivem Verhalten behoben werden soll
  - ein Security-/Secret-Leak-Risiko im produktiven Code gefixt wurde
- Runtime-Smoke vor oder nach Deploy ist noetig, wenn:
  - OpenAI-Proxy-Verhalten betroffen ist
  - Service-Role-Schreibpfade betroffen sind
  - Push-/Report-/Trend-/Protein-Persistenz beruehrt wurde
- Deploy bleibt blockiert, wenn:
  - User-Freigabe fehlt
  - benoetigte Secrets nicht sicher verfuegbar sind
  - S4-Fix den Produktvertrag veraendern wuerde, ohne dass S2/S3 das freigegeben haben

No-Go-Liste fuer S4:

- Kein Massenrefactor ueber mehrere Functions.
- Keine kosmetischen Prompt- oder Textaenderungen in Backend-Antworten.
- Keine medizinische Neubewertung.
- Keine Scheduler-/Workflow-Anpassung als Nebenprodukt dieses Sweeps.
- Keine `.bak`-Bereinigung.
- Keine neuen Debug-Endpunkte.
- Keine Secrets oder Roh-Health-Payloads in Protokollen.
- Keine Deploys.

S2 Contract Review:

- Ergebnis: S2 ist konsistent mit README, Module Overviews und Roadmap Template.
- S2 trennt jetzt klar zwischen statischer Deno-Hygiene und produktiven Runtime-Vertraegen.
- Die in S1 gefundenen Sonderfaelle sind abgedeckt:
  - `midas-vision`: Supabase-Auth-/Anon-Grenze wird als Contract behandelt, nicht als Tabellenread-Problem.
  - `midas-assistant`: fehlende Backend-DB-Reads sind kein Fehler; Kontextversorgung bleibt Frontend-/Hub-Vertrag.
  - OpenAI-Modell-/Prompt-Verhalten bleibt geschuetzt.
- S4 darf mit `deno check` starten, aber jedes Ergebnis muss gegen diese No-Go-Liste klassifiziert werden.

Findings und Korrektur:

- S2-F1: Response-Shapes und Scheduler-Payloads waren als Guardrail noch nicht explizit genug.
  Korrektur: Guardrail ergaenzt.
- S2-F2: Deploy-Kriterien mussten feiner zwischen lokal geprueft, deploy-noetig und deploy-blockiert unterscheiden.
  Korrektur: Deploy-Kriterien in S2 dokumentiert.
- S2-F3: AI-/OpenAI-Funktionen brauchen einen haerteren No-Go-Schutz gegen unbeabsichtigte Modell-/Prompt-Aenderungen.
  Korrektur: Function-spezifische No-Go-Vertraege dokumentiert.

S2 Exit:

- Erfuellt. S3 kann daraus die konkrete Check-Reihenfolge, Ergebnislabels, Secret-/PII-Review und Runtime-Smoke-Strategie ableiten.

S2 Schritt-Abnahme und Commit-Empfehlung:

- Abnahme: S2 ist abgeschlossen.
- Commit: weiterhin noch nicht zwingend; sinnvoll ist ein gemeinsamer Roadmap-Commit nach S1-S3, solange nur diese Roadmap betroffen ist.

## S3 - Risiko- und Checkplan

Ziel:

- Konkrete Check-Reihenfolge und Review-Kriterien festlegen.

Substeps:

- S3.1 Deno-Check-Kommando pro Function festlegen:
  - `deno check C:/Users/steph/Projekte/midas-backend/supabase/functions/<function>/index.ts`
- S3.2 Ergebnisformat festlegen:
  - `green`
  - `tooling-warning`
  - `fix-needed`
  - `runtime-smoke-needed`
  - `blocked`
- S3.3 Nicht-lokale Smokes pro Function definieren.
- S3.4 Secret-/PII-Review festlegen.
- S3.5 Deploy-Drift-Review festlegen:
  - lokale Datei geprueft
  - produktiver Deploy-Stand unbekannt
  - produktiver Deploy nach Fix erforderlich
  - produktiver Deploy bewusst nicht erforderlich
- S3.6 Reihenfolge final bestaetigen.
- S3.7 Contract Review S3.
- S3.8 Schritt-Abnahme und Commit-Empfehlung.

Output:

- S4-Pflichtplan.
- Einheitliches Ergebnisprotokoll.

Exit-Kriterium:

- S4 kann deterministisch pro Function starten.

### S3 Ergebnisprotokoll 30.04.2026

Durchgefuehrt:

- S1/S2-Ergebnisse wurden erneut gelesen.
- Check-Reihenfolge wurde bestaetigt.
- `deno check`-Kommandos wurden function-spezifisch festgelegt.
- Ergebnislabels und Entscheidungsregeln wurden definiert.
- Nicht-lokale Smokes, Secret-/PII-Review und Deploy-Drift-Review wurden festgelegt.
- S3-Contract-Review wurde durchgefuehrt und Findings wurden in dieser Roadmap korrigiert.

Finale S4-Reihenfolge:

| S4 | Function | Begruendung |
|---|---|---|
| S4.1 | `midas-tts` | klein, OpenAI-Transport, guter Einstieg |
| S4.2 | `midas-transcribe` | klein, Voice-Input-Vertrag |
| S4.3 | `midas-vision` | mittlere Groesse, Auth-/Anon- und Structured-Output-Grenze |
| S4.4 | `midas-assistant` | AI-Vertrag produktiv wichtig, aber ohne DB-Schreibpfad |
| S4.5 | `midas-protein-targets` | medizinisch relevanter Schreibpfad, nach AI-Transport pruefen |
| S4.6 | `midas-incident-push` | bereits juengst bearbeitet, Re-Check ohne neue Push-Fachlogik |
| S4.7 | `midas-monthly-report` | gross, Report-/Doctor-Vertrag |
| S4.8 | `midas-trendpilot` | groesste Analyse-Function, hoechstes Contract-Risiko |

Deno-Check-Kommandos:

```powershell
deno check "C:\Users\steph\Projekte\midas-backend\supabase\functions\midas-tts\index.ts"
deno check "C:\Users\steph\Projekte\midas-backend\supabase\functions\midas-transcribe\index.ts"
deno check "C:\Users\steph\Projekte\midas-backend\supabase\functions\midas-vision\index.ts"
deno check "C:\Users\steph\Projekte\midas-backend\supabase\functions\midas-assistant\index.ts"
deno check "C:\Users\steph\Projekte\midas-backend\supabase\functions\midas-protein-targets\index.ts"
deno check "C:\Users\steph\Projekte\midas-backend\supabase\functions\midas-incident-push\index.ts"
deno check "C:\Users\steph\Projekte\midas-backend\supabase\functions\midas-monthly-report\index.ts"
deno check "C:\Users\steph\Projekte\midas-backend\supabase\functions\midas-trendpilot\index.ts"
```

Ergebnislabels:

| Label | Bedeutung | S4-Entscheidung |
|---|---|---|
| `green` | `deno check` gruen, keine statischen Findings | dokumentieren, kein Fix |
| `tooling-warning` | lokales Tooling/IDE meldet etwas, `deno check` bestaetigt es nicht | dokumentieren, kein Code-Fix |
| `fix-needed` | `deno check` rot oder statischer Secret-/Type-/Syntax-Befund ist echt und isolierbar | kleinen Fix machen, Re-Check |
| `runtime-smoke-needed` | statisch gruen oder gefixt, aber produktiver Vertrag braucht externen Smoke | Smoke definieren oder nach Freigabe ausfuehren |
| `blocked` | Check/Fix braucht fehlende Secrets, User-Entscheidung, Deploy-Freigabe oder wuerde Produktvertrag veraendern | stoppen und dokumentieren |

Nicht-lokale Smokes pro Function:

| Function | Smoke-Entscheidung |
|---|---|
| `midas-tts` | Nur definieren, falls Code geaendert wird: kurzer TTS-Request ueber produktiven Hub/Voice-Pfad oder sicherer Edge-Smoke mit Testtext. |
| `midas-transcribe` | Nur definieren, falls Code geaendert wird: kurzer STT-Smoke mit kleiner Audiodatei oder Voice-Pfad, ohne medizinische Daten. |
| `midas-vision` | Bei Codeaenderung: Vision-Smoke mit neutralem Testbild; kein Gesundheitsfoto, kein sensibler Payload. |
| `midas-assistant` | Bei Codeaenderung: freier Text-Fallback-Smoke; keine medizinische Beratung und keine Allowed-Action-Ausweitung. |
| `midas-protein-targets` | Bei Codeaenderung: bevorzugt Dry-/Safe-Smoke nur nach User-Freigabe, da `user_profile` geschrieben werden kann. |
| `midas-incident-push` | Bei Codeaenderung: manueller Workflow/Edge-Smoke mit `mode=diagnostic` oder bewusstem Incident-Smoke; keine neue Dedupe-Suppression ohne Review. |
| `midas-monthly-report` | Bei Codeaenderung: Report-Smoke nur nach User-Freigabe, weil `health_events`/Reports geschrieben werden koennen. |
| `midas-trendpilot` | Bei Codeaenderung: Scheduler-/Manual-Smoke nur nach User-Freigabe, weil `trendpilot_events`/State geschrieben werden koennen. |

Secret-/PII-Review:

- Vor jedem S4-Fix gezielt nach folgenden Mustern scannen:
  - `console.log`
  - `console.error`
  - `Authorization`
  - `apiKey`
  - `SERVICE_ROLE_KEY`
  - `OPENAI_API_KEY`
  - `payload`
  - `image_base64`
  - `subscription`
- Erlaubt in Logs:
  - technische Fehlerklasse
  - Statuscode
  - gekuerzte, nicht-sensitive Diagnose
- Nicht erlaubt in Logs:
  - API Keys
  - Bearer Tokens
  - Service Role Key
  - VAPID Private Key
  - Roh-Subscription-Endpoint
  - komplette medizinische Payloads
  - komplette Bilder/Base64

Deploy-Drift-Review:

| Status | Bedeutung |
|---|---|
| `lokal-geprueft` | Lokale Datei wurde gecheckt; produktiver Deploy-Stand bleibt unbekannt. |
| `deploy-unveraendert` | Keine Codeaenderung, kein Deploy noetig. |
| `deploy-offen` | Code wurde geaendert, Deploy ist fachlich noetig, aber noch nicht freigegeben. |
| `deploy-blockiert` | Deploy waere riskant oder braucht noch Smoke/User-Entscheidung. |
| `deployed` | Deploy wurde explizit freigegeben und ausgefuehrt. |

S4 Pflichtablauf pro Function:

- Betroffene Function kurz gegen S2-No-Go-Vertrag lesen.
- `deno check` ausfuehren.
- Ergebnislabel vergeben.
- Falls `fix-needed`: minimalen Fix machen.
- Re-Check ausfuehren.
- Secret-/PII-Scan fuer betroffene Datei.
- Runtime-Smoke-Entscheidung dokumentieren.
- Deploy-Drift-Status dokumentieren.
- Keine naechste Function starten, solange ein unklassifiziertes Finding offen ist.

S3 Contract Review:

- Ergebnis: S3 ist konsistent mit S1/S2 und eng genug fuer den Start von S4.
- Die Reihenfolge minimiert Risiko: kleine OpenAI-Transport-Functions zuerst, grosse Schreib-/Analysepfade zuletzt.
- Runtime-Smokes sind bewusst getrennt von `deno check`, damit statische Hygiene nicht mit produktiven Datenwrites vermischt wird.
- Service-Role-Schreibpfade (`protein`, `push`, `reports`, `trendpilot`) bleiben smoke-/deploy-gated.
- Die S4-Pflichtablauf-Regel verhindert parallele oder vermischte Function-Fixes.

Findings und Korrektur:

- S3-F1: Die S4-Substeps enthielten noch keine explizite Secret-/PII-Scan-Pflicht.
  Korrektur: Secret-/PII-Review und S4-Pflichtablauf ergaenzt.
- S3-F2: Deploy-Drift war als Risiko bekannt, aber fuer Ergebnisprotokolle noch nicht statusfaehig.
  Korrektur: Deploy-Drift-Statuswerte definiert.
- S3-F3: Runtime-Smokes brauchten eine klare Trennung zwischen sicher definierbar und schreibend/riskant.
  Korrektur: Nicht-lokale Smokes pro Function klassifiziert.

S3 Exit:

- Erfuellt. S4 kann deterministisch mit `midas-tts` starten.

S3 Schritt-Abnahme und Commit-Empfehlung:

- Abnahme: S3 ist abgeschlossen.
- Commit: sinnvoller Zwischencommit waere jetzt moeglich, weil S1-S3 als Doku-/Planungsblock abgeschlossen sind. Alternativ kann bis nach S4 gewartet werden.

## S4 - Function-fuer-Function Deno Check und Fixes

Ziel:

- Jede Function einzeln pruefen.
- Echte Findings klein und isoliert fixen.

Substeps:

- S4.1 `midas-tts`
  - `deno check`
  - Findings klassifizieren
  - ggf. Fix
  - Re-Check
- S4.2 `midas-transcribe`
  - `deno check`
  - Findings klassifizieren
  - ggf. Fix
  - Re-Check
- S4.3 `midas-vision`
  - `deno check`
  - Findings klassifizieren
  - ggf. Fix
  - Re-Check
- S4.4 `midas-assistant`
  - `deno check`
  - Findings klassifizieren
  - ggf. Fix
  - Re-Check
- S4.5 `midas-protein-targets`
  - `deno check`
  - Findings klassifizieren
  - ggf. Fix
  - Re-Check
- S4.6 `midas-incident-push`
  - Re-Check des bereits bearbeiteten Push-Backends
  - keine neue Push-Fachlogik
- S4.7 `midas-monthly-report`
  - `deno check`
  - Findings klassifizieren
  - ggf. Fix
  - Re-Check
- S4.8 `midas-trendpilot`
  - `deno check`
  - Findings klassifizieren
  - ggf. Fix
  - Re-Check
- S4.9 Zwischen-Review aller Backend-Aenderungen.
- S4.10 Schritt-Abnahme und Commit-/Deploy-Empfehlung.

Output:

- Pro Function dokumentiertes Check-Ergebnis.
- Isolierte Fixes, falls notwendig.

Exit-Kriterium:

- Alle Functions haben ein klares Ergebnis und keine unklassifizierten Deno-Findings.

#### S4.1 `midas-tts` Ergebnis

- Contract-Abgleich:
  - No-Go aus S2: keine Aenderung an Voice-Ausgabeformat, Audio-MIME, OpenAI-TTS-Modell oder Text-Cleanup ohne echten Bug.
  - Ergebnis: eingehalten; keine Codeaenderung.
- Check:
  - `deno check "C:\Users\steph\Projekte\midas-backend\supabase\functions\midas-tts\index.ts"`
- Ergebnis:
  - `green`
- Findings:
  - Keine Type-/Syntax-/Import-Findings.
  - Secret-/PII-Scan: keine geloggten Keys, keine geloggten Payload-Texte, keine Service-Role-/VAPID-Themen.
  - Beobachtung: bestehender Code loggt und returned OpenAI-Upstream-Fehlerdetails (`err`) sowie unerwartete Fehlerdetails (`String(err)`). Das ist kein unmittelbarer Secret-Leak-Befund aus dem Scan, aber ein Runtime-/Copy-Hinweis fuer S5, falls wir Fehleroberflaechen spaeter haerten wollen.
- Korrektur:
  - keine
- Re-Check:
  - nicht noetig, da kein Fix
- Runtime-Smoke:
  - nicht notwendig fuer S4.1, weil keine Codeaenderung
  - falls spaeter gewuenscht: kurzer TTS-Smoke ueber Hub/Voice oder Edge-Test mit neutralem Text
- Deploy-Drift:
  - `deploy-unveraendert`
- Restrisiko:
  - Produktiver Deploy-Stand bleibt ohne Supabase-Deploy-Abgleich nicht bewiesen.
  - OpenAI-Upstream-Fehlerdetails bleiben bestehendes Verhalten, nicht Teil dieses S4.1-Fixes.

#### S4.2 `midas-transcribe` Ergebnis

- Contract-Abgleich:
  - No-Go aus S2: keine Aenderung an STT-Modell, `response_format`, Transcript-Shape oder Voice-V1-Transcribe-Vertrag ohne echten Bug.
  - Ergebnis: eingehalten; Response-Shape und STT-Vertrag bleiben unveraendert.
- Check:
  - `deno check "C:\Users\steph\Projekte\midas-backend\supabase\functions\midas-transcribe\index.ts"`
- Ergebnis vor Fix:
  - `fix-needed`
- Findings:
  - `TS18047`: `left`/`right` in `parseGermanNumberWord(...)` waren nach rekursivem Parse moeglich `null`.
  - Secret-/PII-Scan: rohe Transkripte wurden in Logs ausgegeben (`raw`, `surface`). Das kann Health-/Intake-Inhalte enthalten und verletzt den S3-Log-Vertrag.
  - Beobachtung: bestehender Code loggt und returned OpenAI-Upstream-Fehlerdetails (`errText`) sowie unerwartete Fehlerdetails (`String(err)`). Wie bei S4.1 ist das ein S5-Haertungshinweis, aber kein isolierter S4.2-Fix, weil es den Fehler-/Response-Vertrag aendern kann.
- Korrektur:
  - `left == null || right == null` Guards vor `Number.isFinite(...)` ergaenzt.
  - Rohtranskript-Logs durch Laengen-/Aenderungsmetadaten ersetzt:
    - `raw_length`
    - `surface_length`
    - `surface_changed`
- Re-Check:
  - `deno check` gruen
- Secret-/PII-Re-Scan:
  - keine Rohtranskript-Logs mehr
  - Audio-Metadaten (`type`, `size`) bleiben sichtbar und gelten als nicht-sensitiv genug fuer technischen Betrieb
  - Response enthaelt weiterhin Transcript-Felder fuer den produktiven Client-Vertrag
- Runtime-Smoke:
  - `runtime-smoke-needed`, falls dieser Fix produktiv deployed wird
  - sicherer Smoke waere eine kurze neutrale Audiodatei ohne Gesundheitsdaten
- Deploy-Drift:
  - `deployed`
  - Deploy: `.\supabase.exe functions deploy midas-transcribe` im Backend-Workspace erfolgreich ausgefuehrt.
  - Projekt: `jlylmservssinsavlkdi`
- Restrisiko:
  - Backend-Workspace ist lokal offenbar kein Git-Repo; Diff ist nur ueber diese Roadmap dokumentiert.
  - Produktiver Deploy-Stand wurde fuer `midas-transcribe` aktualisiert.
  - OpenAI-Upstream-Fehlerdetails bleiben bestehendes Verhalten und werden in S5 gesammelt bewertet.

#### S4.3 `midas-vision` Ergebnis

- Contract-Abgleich:
  - No-Go aus S2: keine Aenderung an Vision-JSON-Schema, Summary-/Payload-Shape, Auth-/Anon-Grenze oder Bildgroessenlimit ohne echten Bug.
  - Ergebnis: eingehalten; Response-Shape, Auth-Grenze, Modell-Default, JSON-Schema und Bildgroessenlimit bleiben unveraendert.
- Check:
  - `deno check "C:\Users\steph\Projekte\midas-backend\supabase\functions\midas-vision\index.ts"`
- Ergebnis vor Fix:
  - `fix-needed`
- Findings:
  - `TS2578`: unbenutztes `@ts-expect-error` vor dem JSR-Import. Deno kann den Import inzwischen korrekt pruefen, daher blockiert die alte Suppression den Check.
  - Secret-/PII-Scan: Logs fuer OpenAI-Fehler und ungueltige OpenAI-JSON-Antworten enthielten Ausschnitte der Upstream-Antwort. Das kann bei Vision theoretisch Analyse-/Mahlzeiteninhalt enthalten.
  - Secret-/PII-Scan: `structured result missing` loggte das komplette `completion`-Objekt. Das kann Modelloutput enthalten.
  - Beobachtung: Response-Felder `details` bei Upstream-/Request-Fehlern bleiben bestehen. Das ist ein S5-Haertungshinweis, aber kein S4.3-Fix, weil es den Fehler-/Response-Vertrag aendern kann.
- Korrektur:
  - unbenutztes `@ts-expect-error` entfernt.
  - OpenAI-Fehlerlog auf technische Metadaten reduziert:
    - `status`
    - `response_length`
  - Invalid-JSON-Log auf `response_length` reduziert.
  - Missing-structured-result-Log auf strukturarme Metadaten reduziert:
    - `output_count`
    - `has_output_text`
- Re-Check:
  - `deno check` gruen
- Secret-/PII-Re-Scan:
  - keine Logs mit Bild/Base64
  - keine Logs mit kompletter Modellantwort
  - keine geloggten Keys oder Bearer Tokens
  - Bilddaten und Prompt-Kontext bleiben nur im OpenAI-Request und im produktiven Response-Vertrag, nicht im Log
- Runtime-Smoke:
  - `runtime-smoke-needed`, falls wir Vision produktiv aktiv testen wollen
  - sicherer Smoke waere ein neutrales Testbild ohne Gesundheits-/Personendaten
- Deploy-Drift:
  - `deployed`
  - Deploy: `.\supabase.exe functions deploy midas-vision` im Backend-Workspace erfolgreich ausgefuehrt.
  - Projekt: `jlylmservssinsavlkdi`
- Restrisiko:
  - Backend-Workspace ist lokal offenbar kein Git-Repo; Diff ist nur ueber diese Roadmap dokumentiert.
  - Response-`details` bei Upstream-/Request-Fehlern bleiben bestehendes Verhalten und werden in S5 gesammelt bewertet.

#### S4.4 `midas-assistant` Ergebnis

- Contract-Abgleich:
  - No-Go aus S2: keine Prompt-, Modell-, Structured-Output-, Allowed-Action- oder Fallback-Verhaltensaenderung ohne explizites Finding.
  - Ergebnis: eingehalten; keine Codeaenderung.
- Check:
  - `deno check "C:\Users\steph\Projekte\midas-backend\supabase\functions\midas-assistant\index.ts"`
- Ergebnis:
  - `green`
- Findings:
  - Keine Type-/Syntax-/Import-Findings.
  - Secret-/PII-Scan: keine geloggten API Keys, keine Service-Role-/VAPID-Themen.
  - Bestehende Logs fuer erfolgreiche Actions enthalten nur Action-Typen, keine Payloads.
  - Beobachtung: OpenAI-Upstream-Fehler werden roh geloggt und als `details` zurueckgegeben.
  - Beobachtung: unerwartete Fehler werden als Message geloggt und als `details` zurueckgegeben.
  - Beobachtung: bei JSON-Parse-Fallback kann roher Modelltext als Reply an den Client gehen. Das ist bestehender Response-/Fallback-Vertrag und kein S4.4-Fix ohne separaten Assistant-Scope.
- Korrektur:
  - keine
- Re-Check:
  - nicht noetig, da kein Fix
- Runtime-Smoke:
  - nicht notwendig fuer S4.4, weil keine Codeaenderung
  - falls spaeter gewuenscht: freier Text-Fallback-Smoke ohne medizinische Beratung und ohne Allowed-Action-Ausweitung
- Deploy-Drift:
  - `deploy-unveraendert`
- Restrisiko:
  - Produktiver Deploy-Stand bleibt ohne Supabase-Deploy-Abgleich nicht bewiesen.
  - Upstream-/Unexpected-Error-`details` und Plain-Text-Fallback bleiben S5-Haertungshinweise, nicht Teil dieses S4.4-Fixes.

#### S4.5 `midas-protein-targets` Ergebnis

- Contract-Abgleich:
  - No-Go aus S2: keine medizinische Formel-, CKD-Faktor-, Doctor-Lock-, Cooldown- oder Persistenz-Aenderung ohne expliziten Fachbefund.
  - Ergebnis: eingehalten; Fix beschraenkt auf lokalen Type-/Tooling-Befund und Log-Hygiene im Fehlerpfad.
- Check:
  - `deno check C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-protein-targets/index.ts`
  - initial: `fix-needed`
  - Finding: `TS2578` durch unbenutztes `@ts-expect-error` vor dem Supabase-JSR-Import.
  - Secret-/PII-Scan: keine geloggten Keys oder Bearer Tokens gefunden.
  - Log-Finding: Catch-Block loggte das rohe Error-Objekt. Das ist unnoetig breit fuer den S3-Log-Vertrag.
- Korrektur:
  - unbenutztes `@ts-expect-error` entfernt.
  - Catch-Block serialisiert den Fehler nun einmal via `serializeError(err)`.
  - Log und Response nutzen denselben serialisierten Message-String:
    - keine rohe Error-Objekt-Ausgabe mehr
    - Response-Shape bleibt `{ error: message }`
- Re-Check:
  - `deno check` gruen.
  - Secret-/PII-Re-Scan: verbleibende Treffer sind erwartete Header-/Env-/DB-/Response-Felder; keine Roh-Token-Logs.
- Runtime-Smoke:
  - nicht lokal ausgefuehrt, weil die Function `user_profile` schreibt.
  - falls gewuenscht: separater Smoke nur mit bewusstem Test-User oder expliziter User-Freigabe.
- Deploy-Drift:
  - `deployed`
  - Deploy ausgefuehrt mit `C:/Users/steph/Projekte/midas-backend/supabase.exe functions deploy midas-protein-targets`.
  - Supabase-Projekt: `jlylmservssinsavlkdi`.
- Restrisiko:
  - Backend-Workspace ist lokal offenbar kein Git-Repo; Diff ist nur ueber diese Roadmap dokumentiert.
  - Fachliche Protein-Zielberechnung wurde nicht per Runtime-Smoke gegen Live-Daten validiert, weil S4.5 nur Hygiene-/Type-Fix war.

#### S4.6 `midas-incident-push` Ergebnis

- Contract-Abgleich:
  - No-Go aus S2: keine Aenderung an Reminder-/Incident-Schwellen, Dedupe, Severity, Delivery-Health, Diagnosemodus oder Scheduler-Payload ohne Push-Scope.
  - Ergebnis: eingehalten; keine Codeaenderung.
- Check:
  - `deno check C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-incident-push/index.ts`
  - Ergebnis: `green`
  - Keine Type-/Syntax-/Import-Findings.
- Secret-/PII-Scan:
  - Treffer fuer Env-Namen, Auth-Header, VAPID-Namen, Subscription-Felder und DB-Felder sind erwartete produktive Push-Struktur.
  - Kein Roh-Secret, kein Bearer Token, kein roher Endpoint und kein Subscription-Key wird geloggt.
  - Fokussierter Log-Check: keine `console.log`/`console.error`-Treffer.
  - Fehlerpfade nutzen `formatSafePushError(...)`.
  - Diagnose-Output verwendet kompakten `endpointHash`, nicht den Roh-Endpoint.
- Korrektur:
  - keine
- Re-Check:
  - nicht noetig, da kein Fix
- Runtime-Smoke:
  - nicht ausgefuehrt, weil keine Codeaenderung.
  - Falls spaeter noetig: manueller Workflow/Edge-Smoke mit `mode=diagnostic` oder bewusstem Incident-Smoke, aber keine neue Dedupe-Suppression ohne Review.
- Deploy-Drift:
  - `deploy-unveraendert`
- Restrisiko:
  - Produktiver Deploy-Stand bleibt ohne erneuten Deploy-Abgleich nicht neu bewiesen.
  - Push-Fachlogik wurde nur statisch gegen den aktuellen Backend-Stand geprueft; keine Scheduler-/Android-/Delivery-Runtime neu getestet.

#### S4.7 `midas-monthly-report` Ergebnis

- Contract-Abgleich:
  - No-Go aus S2: keine Aenderung an Report-Typen, Range-/Monthly-Idempotenz, `system_comment`-Payload, Narrativ oder Doctor-Read-Only-Vertrag ohne Report-Scope.
  - Ergebnis: eingehalten; Fix beschraenkt auf lokalen Type-/Tooling-Befund und Log-Hygiene im Fehlerpfad.
- Check:
  - `deno check C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-monthly-report/index.ts`
  - initial: `fix-needed`
  - Finding: `TS2578` durch unbenutztes `@ts-expect-error` vor dem Supabase-JSR-Import.
  - Secret-/PII-Scan: keine geloggten Keys oder Bearer Tokens gefunden.
  - Log-Finding: Catch-Block loggte das rohe Error-Objekt. Das ist fuer einen Report-/Health-Kontext unnoetig breit.
- Korrektur:
  - unbenutztes `@ts-expect-error` entfernt.
  - Catch-Block serialisiert den Fehler nun einmal via `serializeError(err)`.
  - Log und Response nutzen denselben serialisierten Message-String:
    - keine rohe Error-Objekt-Ausgabe mehr
    - Response-Shape bleibt `{ error: message }`
  - Keine Aenderung an Report-Payload, `system_comment`-Persistenz, Monats-/Range-Idempotenz, Narrativ oder Datenabfragen.
- Re-Check:
  - `deno check` gruen.
  - Secret-/PII-Re-Scan: verbleibende Treffer sind erwartete Header-/Env-/DB-/Report-Felder; keine Roh-Token-Logs.
- Runtime-Smoke:
  - nicht lokal ausgefuehrt, weil die Function `health_events`/Reports schreiben kann.
  - falls gewuenscht: separater Report-Smoke nur mit expliziter User-Freigabe.
- Deploy-Drift:
  - `deployed`
  - Deploy ausgefuehrt mit `C:/Users/steph/Projekte/midas-backend/supabase.exe functions deploy midas-monthly-report`.
  - Supabase-Projekt: `jlylmservssinsavlkdi`.
- Restrisiko:
  - Backend-Workspace ist lokal offenbar kein Git-Repo; Diff ist nur ueber diese Roadmap dokumentiert.
  - Report-/Doctor-Vertrag wurde statisch abgesichert, aber nicht per Live-Report-Smoke validiert.

#### S4.8 `midas-trendpilot` Ergebnis

- Contract-Abgleich:
  - No-Go aus S2: keine Aenderung an Baseline, Trend-Gates, Severity, Ack, Kontextsaetzen oder Dedupe ohne Trendpilot-Scope.
  - Ergebnis: eingehalten; Fix beschraenkt auf lokalen Type-/Tooling-Befund und Log-Hygiene im Fehlerpfad.
- Check:
  - `deno check C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-trendpilot/index.ts`
  - initial: `fix-needed`
  - Finding: `TS2578` durch unbenutztes `@ts-expect-error` vor dem Supabase-JSR-Import.
  - Secret-/PII-Scan: keine geloggten Keys oder Bearer Tokens gefunden.
  - Log-Finding: Catch-Block loggte das rohe Error-Objekt. Das ist fuer einen Trend-/Health-State-Kontext unnoetig breit.
- Korrektur:
  - unbenutztes `@ts-expect-error` entfernt.
  - Catch-Block serialisiert den Fehler nun einmal via `serializeError(err)`.
  - Log und Response nutzen denselben serialisierten Message-String:
    - keine rohe Error-Objekt-Ausgabe mehr
    - Response-Shape bleibt `{ ok: false, error: message }`
  - Keine Aenderung an Baselines, Trend-Gates, Severity, Ack-Erhalt, Kontextpayload, Dedupe oder Upsert-Keys.
- Re-Check:
  - `deno check` gruen.
  - Secret-/PII-Re-Scan: verbleibende Treffer sind erwartete Header-/Env-/DB-/Trend-/State-Felder; keine Roh-Token-Logs.
- Runtime-Smoke:
  - nicht lokal ausgefuehrt, weil die Function `trendpilot_events` und `trendpilot_state` schreiben kann.
  - falls gewuenscht: separater Scheduler-/Manual-Smoke nur mit expliziter User-Freigabe.
- Deploy-Drift:
  - `deployed`
  - Deploy ausgefuehrt mit `C:/Users/steph/Projekte/midas-backend/supabase.exe functions deploy midas-trendpilot`.
  - Supabase-Projekt: `jlylmservssinsavlkdi`.
- Restrisiko:
  - Backend-Workspace ist lokal offenbar kein Git-Repo; Diff ist nur ueber diese Roadmap dokumentiert.
  - Trendpilot-Analysevertrag wurde statisch abgesichert, aber nicht per Live-Trendpilot-Smoke validiert.

#### S4.9 Zwischen-Review aller Backend-Aenderungen

- Sammelcheck:
  - `midas-tts`: `deno check` gruen
  - `midas-transcribe`: `deno check` gruen
  - `midas-vision`: `deno check` gruen
  - `midas-assistant`: `deno check` gruen
  - `midas-protein-targets`: `deno check` gruen
  - `midas-incident-push`: `deno check` gruen
  - `midas-monthly-report`: `deno check` gruen
  - `midas-trendpilot`: `deno check` gruen
- Backend-Aenderungsklassen:
  - echte Type-/Tooling-Fixes: unbenutzte `@ts-expect-error`-Direktiven entfernt
  - Log-Hygiene-Fixes: rohe Error-Objekte oder rohe Modell-/Upstream-Antworten reduziert, wo S4 einen konkreten Befund hatte
  - keine SQL-/RLS-/Datenmodell-Aenderung
  - keine Frontend-Aenderung
  - keine medizinische Schwelle, Formel, Severity, Dedupe-, Prompt-, Report-, Trend- oder Push-Fachlogik geaendert
- Scan-Ergebnis:
  - kein verbleibender `@ts-expect-error` in produktiven `index.ts`-Dateien
  - keine Roh-Key-/Bearer-Token-Logs gefunden
  - bekannte S5-Haertungshinweise bleiben fuer AI-Proxy-Fehleroberflaechen bestehen, wo ein Fix den Response-Vertrag beruehren wuerde
- Deploy-Stand:
  - unveraendert/no deploy: `midas-tts`, `midas-assistant`, `midas-incident-push`
  - deployed nach minimalem Fix: `midas-transcribe`, `midas-vision`, `midas-protein-targets`, `midas-monthly-report`, `midas-trendpilot`
- Nicht ausgefuehrte Runtime-Smokes:
  - OpenAI-/Vision-/Voice-Smokes bleiben optional, weil sie externe Runtime/Kosten/Inputs brauchen
  - Protein/Report/Trendpilot-Smokes bleiben optional und user-gated, weil sie produktive Schreibpfade beruehren koennen
  - Push-Smoke war in S4.6 nicht noetig, weil keine Codeaenderung

#### S4.10 Schritt-Abnahme und Commit-/Deploy-Empfehlung

- S4-Abnahme:
  - S4 ist abgeschlossen.
  - Alle 8 produktiven Edge Functions haben ein dokumentiertes Ergebnis.
  - Keine unklassifizierten Deno-Findings offen.
  - Keine offenen P0/P1-Risiken aus S4.
- Contract Review:
  - S4 bleibt innerhalb der S2-No-Go-Liste.
  - Alle Fixes sind isolierte Tooling-/Log-Hygiene-Fixes.
  - Fachvertraege bleiben unveraendert.
- Deploy-Empfehlung:
  - Kein weiterer Deploy aus S4 notwendig.
  - Bereits deployte Functions sind in den jeweiligen S4-Protokollen markiert.
  - Weitere Deploys nur, falls S5/S6 neue Findings oder explizite User-Entscheidung ergeben.
- Commit-Empfehlung:
  - MIDAS-Repo: Roadmap-Datei committen, sobald S5/S6 abgeschlossen oder bewusst als Zwischenstand gesichert werden soll.
  - Backend-Workspace: liegt ausserhalb des MIDAS-Git-Repos; geaenderte Backend-Dateien separat beachten/sichern.

## S5 - Gesamt-Review und Regression

Ziel:

- Sicherstellen, dass Backend-Hygiene keine Produktvertraege verschoben hat.

Substeps:

- S5.1 Alle ausgefuehrten `deno check`-Ergebnisse zusammenfassen.
- S5.2 Backend-Diff reviewen:
  - keine Secret-Leaks
  - keine unbeabsichtigte Fachlogik
  - keine Prompt-/AI-Verhaltensaenderung ohne Finding
  - keine SQL-/RLS-/Datenmodell-Aenderung
- S5.3 Function-spezifische Runtime-Smokes definieren oder ausfuehren, soweit sicher.
- S5.4 Contract Review gegen Module Overviews und README.
- S5.5 Deployment-Review:
  - Welche Functions muessen deployed werden?
  - Welche bleiben nur lokal geprueft?
  - Welche Deploys brauchen User-Freigabe?
- S5.6 Backup-/Begleitdateien-Review:
  - keine `.bak`-Datei versehentlich als produktiver Fix behandelt
  - keine funktionsnahe Roadmap als aktueller Source of Truth missverstanden
- S5.7 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Gesamtbefund.
- Deploy-/Nicht-Deploy-Entscheidungsvorschlag.
- Liste offener manueller Smokes.

Exit-Kriterium:

- Keine offenen P0/P1-Backend-Findings.

### S5 Ergebnis

Status: DONE

#### S5.1 `deno check` Gesamtbefund

- Alle 8 produktiven Edge Functions wurden mit Deno geprueft.
- Ergebnis: alle produktiven `index.ts`-Dateien sind nach S4 gruen.
- Reststand:
  - keine offenen Type-/Syntax-Fehler
  - keine verbleibenden `@ts-expect-error`-Direktiven
  - keine unklassifizierten Deno-Findings

Gepruefte Functions:

- `midas-tts`
- `midas-transcribe`
- `midas-vision`
- `midas-assistant`
- `midas-protein-targets`
- `midas-incident-push`
- `midas-monthly-report`
- `midas-trendpilot`

#### S5.2 Backend-Diff Review

- Scope der Codeaenderungen:
  - `midas-transcribe`: Null-Guards im Zahlwort-Parser, Log-Hygiene fuer Transcript-Metadaten.
  - `midas-vision`: unnoetige TypeScript-Unterdrueckung entfernt, Raw-OpenAI-/JSON-Logs reduziert.
  - `midas-protein-targets`: unnoetige TypeScript-Unterdrueckung entfernt, Catch-Logging vereinheitlicht.
  - `midas-monthly-report`: unnoetige TypeScript-Unterdrueckung entfernt, Catch-Logging vereinheitlicht.
  - `midas-trendpilot`: unnoetige TypeScript-Unterdrueckung entfernt, Catch-Logging vereinheitlicht.
- Nicht veraendert:
  - keine SQL-/RLS-/Datenmodell-Aenderung
  - keine Prompt-/AI-Verhaltensaenderung
  - keine medizinische Fachlogik
  - keine Push-Severity-/Dedupe-Logik
  - keine Report-/Trendpilot-/Protein-Vertraege
  - keine Frontend-Integration
- Secret-/PII-Review:
  - keine neuen Secret-Ausgaben
  - keine Bearer-/API-Keys in Logs
  - keine Roh-Push-Endpoints in produktiven Logs
  - Log-Hygiene wurde an mehreren Stellen verbessert

#### S5.3 Runtime-Smokes

- In S5 wurden keine weiteren Runtime-Smokes ausgefuehrt.
- Grund: Die S4-Fixes waren Type-/Log-Hygiene-Fixes und die sicheren `deno check`-Rechecks sind gruen.
- Optional definierte Smokes:
  - `midas-tts`, `midas-transcribe`, `midas-vision`, `midas-assistant`: nur bei Bedarf, weil OpenAI-/Voice-/Vision-Runtime externe Inputs und ggf. Kosten beruehrt.
  - `midas-protein-targets`: nur mit bewusstem Testkontext, weil der Pfad `user_profile` schreiben kann.
  - `midas-incident-push`: kein Smoke aus S5 noetig, weil keine Codeaenderung; Diagnose-/Incident-Smoke bleibt bei Push-Themen moeglich.
  - `midas-monthly-report`: nur mit bewusstem Testkontext, weil Reports in `health_events` geschrieben/aktualisiert werden.
  - `midas-trendpilot`: nur mit bewusstem Testkontext, weil `trendpilot_events`/`trendpilot_state` geschrieben werden.

#### S5.4 Contract Review gegen README und Module Overviews

- README/Produktvertrag:
  - MIDAS bleibt ein persoenliches Single-User Health OS.
  - Der Sweep war technische Hygiene, keine Produkt- oder Feature-Erweiterung.
- Push Module:
  - Browser/PWA bleibt Master fuer Push.
  - Edge Function/GitHub Actions bleiben Scheduler-/Remote-Push-Schicht.
  - Reminder/Incident, Dedupe, Diagnosemodus und Kontextdiagnose wurden nicht veraendert.
- Assistant/Voice:
  - Keine Assistant-Fachlogik, Persistenz, Intent- oder Prompt-Vertraege wurden veraendert.
  - Bestehende Upstream-Error-Detailausgaben bleiben als moegliche spaetere Hardening-Notiz klassifiziert, aber nicht als S4/S5-Blocker.
- Protein:
  - Doctor-Lock, Cooldown, CKD-/Sport-/Sickday-Guards und Persistenzvertrag bleiben unveraendert.
- Reports/Doctor View:
  - Reports bleiben `health_events` mit `type = system_comment` und Subtypes `monthly_report`/`range_report`.
  - Monthly bleibt idempotenter Upsert; Range bleibt eigener Report pro Zeitraum.
  - Doctor View bleibt Read-only-Uebersicht mit Report-Triggern, keine Editierlogik.
- Trendpilot:
  - Event-/State-Vertrag, Dedupe, Severity, Acknowledgement und Context-Payload bleiben unveraendert.

#### S5.5 Deployment Review

- Bereits nach S4 deployed:
  - `midas-transcribe`
  - `midas-vision`
  - `midas-protein-targets`
  - `midas-monthly-report`
  - `midas-trendpilot`
- Nicht deployed, weil keine Codeaenderung:
  - `midas-tts`
  - `midas-assistant`
  - `midas-incident-push`
- S5-Entscheid:
  - kein weiterer Deploy notwendig
  - weitere Deploys nur bei neuen Findings oder expliziter User-Entscheidung

#### S5.6 Backup-/Begleitdateien-Review

- Produktive Function-Verzeichnisse vorhanden:
  - `midas-assistant`
  - `midas-incident-push`
  - `midas-monthly-report`
  - `midas-protein-targets`
  - `midas-transcribe`
  - `midas-trendpilot`
  - `midas-tts`
  - `midas-vision`
- Begleitdateien:
  - `midas-assistant/voice-assistant-roadmap.md` ist historische/funktionsnahe Doku, kein produktiver Code.
  - `midas-vision/index.ts.bak` existiert als Backup-Datei und wurde nicht als produktiver Fix behandelt.
- Finding:
  - `index.ts.bak` ist fuer den Sweep nicht kritisch, kann aber spaeter separat geloescht oder archiviert werden, wenn sicher nicht mehr benoetigt.

#### S5.7 Schritt-Abnahme und Commit-Empfehlung

- S5-Abnahme:
  - keine offenen P0/P1-Backend-Findings
  - keine unkontrollierten Deploys
  - keine unklassifizierten Runtime-Smoke-Pflichten
  - bekannte optionale Smokes sind user-gated dokumentiert
- Commit-Empfehlung:
  - MIDAS-Repo: Roadmap nach S6 committen.
  - Backend-Workspace: Codeaenderungen liegen ausserhalb des MIDAS-Git-Repos und muessen separat beachtet/gesichert werden.

## S6 - Doku-/QA-Sync und Abschluss

Ziel:

- Ergebnisse in MIDAS-Doku und QA nachvollziehbar machen.
- Roadmap abschliessen oder bewusst offen lassen.

Substeps:

- S6.1 `docs/QA_CHECKS.md` um Backend-Deno-Sweep ergaenzen, falls sinnvoll.
- S6.2 Module Overviews nur aktualisieren, falls sich ein Function-Vertrag geaendert hat.
- S6.3 Diese Roadmap mit Ergebnisprotokollen aktualisieren.
- S6.4 Finaler Contract Review:
  - Roadmap vs. Checks
  - Roadmap vs. Doku
  - Roadmap vs. Backend-Diff
  - Roadmap vs. MIDAS-Guardrails
- S6.5 Abschluss-Abnahme:
  - keine offenen P0/P1-Risiken
  - bekannte Restrisiken dokumentiert
  - Deploy-Entscheid dokumentiert
- S6.6 Commit-Empfehlung:
  - MIDAS-Repo-Doku/QA
  - Backend-Workspace-Code separat beachten
- S6.7 Archiv-Entscheidung.

Output:

- Dokumentierter Backend-Hygiene-Sweep.
- Klare Trennung zwischen lokalem Check, gefixtem Code und optionalem Deploy.

Exit-Kriterium:

- Jede Edge Function hat einen dokumentierten Status.

### S6 Ergebnis 01.05.2026

Status: DONE

#### S6.1 QA-Sync

- `docs/QA_CHECKS.md` wurde um `Phase P13 - Backend Edge Functions Deno Check Sweep (2026-05-01)` ergaenzt.
- Dauerhaft dokumentiert sind:
  - alle acht `deno check`-Kommandos
  - keine offenen Type-/Syntax-/Import-Findings
  - keine verbleibenden `@ts-expect-error`-Direktiven in produktiven Edge-Function-Dateien
  - keine SQL-/RLS-/Datenmodell-Aenderung
  - keine Frontend-Aenderung
  - keine medizinische Schwellen-, Formel-, Dedupe-, Prompt-, Report-, Trendpilot- oder Push-Fachlogik-Aenderung
  - Deploy-Stand und optionaler Runtime-Smoke-Status

#### S6.2 Module-Overview-Review

- Gelesen/reviewed:
  - `docs/modules/Push Module Overview.md`
  - `docs/modules/Assistant Module Overview.md`
  - `docs/modules/Intent Engine Module Overview.md`
  - `docs/modules/VAD Module Overview.md`
  - `docs/modules/Trendpilot Module Overview.md`
  - `docs/modules/Reports Module Overview.md`
  - `docs/modules/Doctor View Module Overview.md`
  - `docs/modules/Protein Module Overview.md`
  - `docs/modules/Activity Module Overview.md`
- Ergebnis:
  - keine Module-Overview-Aenderung notwendig.
  - Die Edge-Function-Fixes haben keinen Produktvertrag verschoben.
  - Bestehende Dokus beschreiben weiterhin die relevanten Runtime-Vertraege fuer Push, Assistant/Voice, Protein, Reports/Doctor, Activity und Trendpilot.

#### S6.3 Roadmap-Sync

- Statusmatrix korrigiert:
  - S5 von `TODO` auf `DONE`
  - S6 auf `DONE`
- S6-Ergebnisprotokoll ergaenzt.
- S5 bleibt als erledigter Gesamt-Review stehen.

#### S6.4 Finaler Contract Review

- Roadmap vs. Checks:
  - Alle acht produktiven Edge Functions wurden erneut mit `deno check` geprueft.
  - Re-Check am 01.05.2026 war gruen fuer:
    - `midas-tts`
    - `midas-transcribe`
    - `midas-vision`
    - `midas-assistant`
    - `midas-protein-targets`
    - `midas-incident-push`
    - `midas-monthly-report`
    - `midas-trendpilot`
- Roadmap vs. Doku:
  - QA dokumentiert den Backend-Sweep.
  - Module Overviews brauchen keine Anpassung, weil kein Funktionsvertrag geaendert wurde.
- Roadmap vs. Backend-Diff:
  - Fixes bleiben isolierte Type-/Tooling-/Log-Hygiene-Fixes.
  - Keine Fachlogik-, Prompt-, Report-, Trendpilot-, Protein-, Push- oder SQL-Vertragsaenderung.
- Roadmap vs. MIDAS-Guardrails:
  - MIDAS bleibt single-user.
  - Backend-Hygiene bleibt kein Produktfeature.
  - keine Secrets wurden dokumentiert oder ausgegeben.
  - keine stillen Deploys aus S5/S6.

#### S6.5 Abschluss-Abnahme

- Keine offenen P0/P1-Risiken.
- Bekannte Restrisiken sind dokumentiert:
  - produktiver Deploy-Stand der unveraenderten Functions bleibt ohne separaten Supabase-Deploy-Abgleich nicht neu bewiesen.
  - Runtime-Smokes fuer OpenAI-/Voice-/Vision- und schreibende Protein-/Report-/Trendpilot-Pfade bleiben optional und user-gated.
  - Backend-Workspace liegt ausserhalb des MIDAS-Git-Repos und muss separat gesichert/beachtet werden.
- Deploy-Entscheid:
  - kein weiterer Deploy aus S6 notwendig.
  - Bereits deployte Functions bleiben wie in S4/S5 dokumentiert.

#### S6.6 Commit-Empfehlung

- MIDAS-Repo:
  - Roadmap und QA zusammen committen, z. B. `docs(backend): document edge function deno sweep`.
- Backend-Workspace:
  - Codeaenderungen liegen ausserhalb dieses Repos.
  - Separat sichern/committen, falls dort ein Git- oder Deploy-Prozess gefuehrt wird.

#### S6.7 Archiv-Entscheidung

- Roadmap ist fachlich abgeschlossen.
- Archivierung mit `(DONE)` ist nach User-Abnahme sinnvoll.

## Ergebnisprotokoll-Format

```md
#### S4.x `<function-name>` Ergebnis

- Check:
  - `deno check ...`
- Ergebnis:
  - `green` / `tooling-warning` / `fix-needed` / `runtime-smoke-needed` / `blocked`
- Findings:
  - [...]
- Korrektur:
  - [...]
- Re-Check:
  - [...]
- Runtime-Smoke:
  - lokal ausgefuehrt / definiert / nicht notwendig
- Restrisiko:
  - [...]
```

## Smokechecks / Regression

- `deno check` pro Function ist gruen oder Finding ist klassifiziert.
- Keine Secrets wurden ausgegeben oder committed.
- Keine Function wurde deployed ohne explizite Freigabe.
- Keine medizinische Fachlogik wurde nebenbei geaendert.
- Keine AI-Prompt-/Response-Vertraege wurden ohne Finding geaendert.
- Nicht lokal ausfuehrbare Runtime-Smokes sind dokumentiert.
- Backend-Workspace-Aenderungen sind als ausserhalb des MIDAS-Git-Repos markiert.

## Abnahmekriterien

- Alle 8 bekannten Edge Functions haben einen dokumentierten Checkstatus.
- Echte Type-/Syntax-Findings sind gefixt oder bewusst als offen/blockiert dokumentiert.
- Tooling-Findings sind nicht mit Runtime-Bugs vermischt.
- QA/Doku ist nur dort aktualisiert, wo der Sweep dauerhafte Relevanz hat.
- Commit-/Deploy-Empfehlung ist eindeutig.

## Commit-Empfehlung

Nach Abschluss geeignet:

- MIDAS-Repo, falls nur Roadmap/QA/Doku betroffen:
  - `docs(backend): add edge function deno check roadmap`
- Backend-Workspace, falls Code-Fixes entstehen:
  - pro sinnvoller Function-Gruppe separat committen, falls dort ein Git-Repo oder Commitprozess besteht.
