[README.md](https://github.com/user-attachments/files/22867088/README.md)
# Gesundheits-Logger

Der Gesundheits-Logger ist eine offlinefaehige Web-App zur Erfassung, Auswertung und Synchronisation von Gesundheitsdaten. Die Anwendung laeuft komplett im Browser, speichert Daten in IndexedDB und kann optional ueber Supabase mit der Cloud synchronisieren.

---

## Kernfunktionen

- **Capture (Tageserfassung)**
  - Blutdruck Morgens/Abends inkl. Kommentarpflicht bei Grenzwerten.
  - Koerperwerte: Gewicht, Taille sowie optional Prozent Fett und Prozent Muskel.
  - Freitext-Kommentar fuer Tagesereignisse direkt im Body-Panel.
  - Intake-Accordion fuer Wasser, Salz und Protein mit Tages-Pills und Fortschrittsbalken.
  - Trendpilot-Pill im Header verlinkt auf aktuelle Warnungen/Kritik (inkl. Chart-/Doctor-Verknuepfung).

- **Header-Status (v1.6.4 bis v1.7.0)**
  - Intake-Pills und Termin-Badge direkt unter dem Datumsfeld.
  - Vollstaendige ARIA-Labels, fokusierbar, Live-Region fuer Screenreader.
  - Telemetrie misst Render-Zeiten (p50/p90/p95) und schreibt in das Diagnose-Log.

- **Arzt-Ansicht**
  - Tageskarten mit Datum/Cloud-Status, Messungen, Gewicht und Kommentar.
  - Cloud-Loeschung einzelner Tage, Export als JSON.
  - Zugriff nur nach lokalem Unlock (Passkey oder PIN).

- **Diagramm (Daily)**
  - SVG-Chart fuer Blutdruck und Koerperdaten, inklusive Tastatur- und Tooltip-Unterstuetzung.
  - Muskel- und Fettbalken (kg) hinter dem Gewicht-Chart (v1.6.8), per Feature-Flag deaktivierbar.
  - Trendpilot-Baender plus Legenden-Swatches (Warnung/Kritisch).

- **Synchronisation, Diagnostics und Logging**
  - Google OAuth (anon Key) + Supabase REST/Realtime.
  - Diagnosepanel (Touch-Log) zeigt Keys, Fehler und Performance-Metriken.
  - Diagnostics-Layer (`app/diagnostics/{logger,perf,monitor}.js`) mit Feature-Flag `DIAGNOSTICS_ENABLED`.

- **Readiness (Phase 4)**
  - Assistant-Modul vorbereitet (`app/modules/assistant/` + Doc).
  - PWA/TWA-Struktur unter `public/` vorhanden (SW/TWA folgen separat).
  - Capture-Hub V2 Layout (MIDAS UI) per Flag `CAPTURE_HUB_V2` testbar.

- **Export**
  - JSON-Export (gesundheitslog.json) fuer Aerztinnen und Aerzte.

---

## Schnellstart

1. Repository klonen oder ZIP entpacken.
2. `index.html` im Browser oeffnen (kein Build notwendig; Bundle liegt unter `app/`).
3. Daten werden automatisch in IndexedDB gespeichert.
4. Optional Supabase konfigurieren (Konsole → `putConf`):
   - `webhookUrl = https://<project-ref>.supabase.co/rest/v1/health_events`
   - `webhookKey = Bearer <ANON_KEY>` (service_role wird clientseitig blockiert)
5. Mit Google anmelden → Capture- und Termin-Daten synchronisieren sich, Realtime aktualisiert die UI.

### Arzt-Ansicht entsperren

- Beim ersten Wechsel erscheint ein lokales Entsperr-Overlay.
- Empfehlung: Passkey (Windows Hello, Touch ID, Face ID). Alternativ lokale PIN setzen.
- Unlock gilt fuer Arzt-Ansicht, Diagramm und Export; Capture bleibt frei verfuegbar.

---

## Bedienhinweise

- **BP-Kontext Auto-Switch (v1.6.5)**: 00:00 → Morgens, 12:05 → Abends. Manuelle Auswahl bleibt bis Tageswechsel bestehen.
- **Intake-Pills & Termin-Badge**: Screenreader hoeren "Tagesaufnahme: Wasser 1800 ml (Warnung) ..." bzw. "Kein Termin geplant".
- **Koerper-Chart**: Muskel- und Fettbalken erscheinen nur bei vorhandenen kg-Werten. Flag `SHOW_BODY_COMP_BARS` kann deaktiviert werden.
- **Diagnosepanel**: `perfStats` Eintraege (z. B. `header_intake`, `header_appt`, `drawChart`) geben Hinweise auf Performance und QA-Messungen.

---

## Supabase & Sicherheit

- Nur anon Keys erlaubt; service_role wird clientseitig blockiert.
- REST-Aufrufe laufen gegen RLS-geschuetzte Tabellen/Views (`health_events`, `appointments`, `v_events_*`).
- Sessions und Keys verbleiben in IndexedDB; keine sensiblen Daten im Quellcode.
- Keine externen Server ausser Supabase: Die App verarbeitet Daten vollständig im Browser.

---

## Troubleshooting & QA

- Detailierte Testfaelle befinden sich in `QA_CHECKS.md`.
- Typische Hinweise:
  - Badge zeigt "Kein Termin geplant": Done-Button bleibt ausgeblendet (erwartet).
  - Capture-Save bricht ab: Fehlermeldung in `#err` und Diagnosepanel pruefen.
  - Netzwerkprobleme: Telemetrieeintraege und REST-Logs im Diagnosepanel betrachten.

## QA & Smoke-Tests

- **Headless DOM Check:** `msedge --headless --disable-gpu --dump-dom file:///.../index.html`.
- **Static-Server Probe:** `python -m http.server 8765` und `Invoke-WebRequest http://127.0.0.1:8765/app/app.css`.
- **Flag-Checks:** `localStorage.setItem('DIAGNOSTICS_ENABLED','false')` testet den Stub-Modus.
- Weitere Szenarien (Capture, Doctor, Chart, Trendpilot, Offline) siehe `docs/QA_CHECKS.md`.

---

## Versionierung

Semantic Versioning, Highlights:

- **1.7.0** – Integrationspass, A11y/Telemetry, Feature-Freeze.
- **1.6.x** – Arzttermine, Intake-Header, BP-Auto-Switch, Koerper-Komposition.
- **1.5.x** – Panelisierte Capture-Workflows, Intake-Accordion, Resume-/Timeout-Fixes.

Komplette Historie siehe `CHANGELOG.md`.

---

## Beitrag & Feedback

Pull Requests, Issues und Ideen sind willkommen. Bitte ASCII (ae/oe/ue) verwenden und Patches knapp kommentieren. Viel Erfolg mit dem Gesundheits-Logger!

```
M.I.D.A.S
├─ .nojekyll
├─ app
│  ├─ app.css
│  ├─ core
│  │  ├─ boot-flow.js
│  │  ├─ capture-globals.js
│  │  ├─ config.js
│  │  ├─ diag.js
│  │  ├─ pwa.js
│  │  └─ utils.js
│  ├─ diagnostics
│  │  ├─ logger.js
│  │  ├─ monitor.js
│  │  └─ perf.js
│  ├─ modules
│  │  ├─ appointments
│  │  │  └─ index.js
│  │  ├─ assistant-stack
│  │  │  ├─ assistant
│  │  │  │  ├─ actions.js
│  │  │  │  ├─ allowed-actions.js
│  │  │  │  ├─ day-plan.js
│  │  │  │  ├─ index.js
│  │  │  │  ├─ session-agent.js
│  │  │  │  ├─ suggest-store.js
│  │  │  │  └─ suggest-ui.js
│  │  │  ├─ vad
│  │  │  │  ├─ vad-worklet.js
│  │  │  │  └─ vad.js
│  │  │  └─ voice
│  │  │     └─ index.js
│  │  ├─ doctor-stack
│  │  │  ├─ charts
│  │  │  │  ├─ chart.css
│  │  │  │  └─ index.js
│  │  │  ├─ doctor
│  │  │  │  └─ index.js
│  │  │  └─ reports
│  │  │     └─ index.js
│  │  ├─ hub
│  │  │  ├─ hub-aura3d.js
│  │  │  └─ index.js
│  │  ├─ intake-stack
│  │  │  ├─ intake
│  │  │  │  └─ index.js
│  │  │  └─ medication
│  │  │     └─ index.js
│  │  ├─ profile
│  │  │  └─ index.js
│  │  └─ vitals-stack
│  │     ├─ activity
│  │     │  └─ index.js
│  │     ├─ protein
│  │     │  └─ index.js
│  │     ├─ trendpilot
│  │     │  └─ index.js
│  │     └─ vitals
│  │        ├─ body.js
│  │        ├─ bp.js
│  │        ├─ entry.js
│  │        ├─ index.js
│  │        └─ lab.js
│  ├─ styles
│  │  ├─ auth.css
│  │  ├─ base.css
│  │  ├─ capture.css
│  │  ├─ doctor.css
│  │  ├─ hub.css
│  │  ├─ layout.css
│  │  ├─ ui.css
│  │  └─ utilities.css
│  └─ supabase
│     ├─ api
│     │  ├─ intake.js
│     │  ├─ notes.js
│     │  ├─ push.js
│     │  ├─ reports.js
│     │  ├─ select.js
│     │  ├─ system-comments.js
│     │  ├─ trendpilot.js
│     │  └─ vitals.js
│     ├─ auth
│     │  ├─ core.js
│     │  ├─ guard.js
│     │  ├─ index.js
│     │  └─ ui.js
│     ├─ core
│     │  ├─ client.js
│     │  ├─ http.js
│     │  └─ state.js
│     ├─ index.js
│     └─ realtime
│        └─ index.js
├─ assets
│  ├─ img
│  │  ├─ Appointments_v1.png
│  │  ├─ Appointments_v2.png
│  │  ├─ Chart_v1.png
│  │  ├─ Chart_v2.png
│  │  ├─ doctor_view_state.png
│  │  ├─ Doctor_view_v1.png
│  │  ├─ Doctor_view_v2.png
│  │  ├─ Idle_state.png
│  │  ├─ Intakes_state.png
│  │  ├─ Intakes_v1.png
│  │  ├─ Intakes_v2.png
│  │  ├─ midas_background_v1.PNG
│  │  ├─ midas_Logo_complete.avif
│  │  ├─ midas_Logo_complete.png
│  │  ├─ midas_symbol.PNG
│  │  ├─ midas_symbol.webp
│  │  ├─ midas_wordmark.png
│  │  ├─ midas_wordmark.webp
│  │  ├─ Personal_data_v1.png
│  │  ├─ Personal_data_v2.png
│  │  ├─ Text_chat_v1.png
│  │  ├─ Text_chat_v2.png
│  │  ├─ Vitals_state.png
│  │  ├─ Vitals_v1.png
│  │  ├─ Vitals_v2.png
│  │  ├─ Voice_chat_v1.png
│  │  └─ Voice_chat_v2.png
│  └─ js
│     ├─ boot-auth.js
│     ├─ data-local.js
│     ├─ format.js
│     ├─ main.js
│     ├─ ui-errors.js
│     ├─ ui-layout.js
│     ├─ ui-tabs.js
│     └─ ui.js
├─ CHANGELOG.md
├─ docs
│  ├─ assistant
│  │  ├─ Assistant_Actions_Spec.md
│  │  └─ Assistant_Endpoint_Spec.md
│  ├─ assistant-multimodal-polish-roadmap.md
│  ├─ assistant-stack-refactor-roadmap.md
│  ├─ BodyChart-Roadmap.md
│  ├─ carousel_integration.md
│  ├─ Codex Programmandi.docx
│  ├─ db-transition-plan.md
│  ├─ deep-clean-roadmap.md
│  ├─ Device Module Scaling Roadmap.md
│  ├─ Doctor Lab Domain Roadmap.md
│  ├─ Doctor Report Roadmap.md
│  ├─ doctor-range-export-plan.md
│  ├─ dynamic protein spec.md
│  ├─ Encoding-Cleanup-Guide.md
│  ├─ Future Module Overview Template.md
│  ├─ Future Refactors.md
│  ├─ Git Survival Guide für Stephan.md
│  ├─ hub-momentum-showtime-plan.md
│  ├─ Import Inventory.md
│  ├─ Input_Style_Polish_Plan.md
│  ├─ Intake Medication UX Roadmap.md
│  ├─ Layout Alignment.md
│  ├─ lazy-load-roadmap.md
│  ├─ M.I.D.A.S. – Design Guide v1.2.md
│  ├─ M.I.D.A.S._Implementation_Spec_v1.2.yaml
│  ├─ Medication Management Module Spec.md
│  ├─ MIDAS Incidents & Push Roadmap.md
│  ├─ MIDAS Orb Vision.md
│  ├─ MIDAS Sensory Feedback Roadmap.md
│  ├─ MIDAS Ticker Bar Roadmap.md
│  ├─ Milestone.md
│  ├─ Module Update Plan.md
│  ├─ module-consolidation-roadmap.md
│  ├─ modules
│  │  ├─ Activity Module Overview.md
│  │  ├─ Appointments Module Overview.md
│  │  ├─ Assistant Module Overview.md
│  │  ├─ Auth Module Overview.md
│  │  ├─ bootflow overview.md
│  │  ├─ Capture Module Overview.md
│  │  ├─ Charts Module Overview.md
│  │  ├─ CSS Module Overview.md
│  │  ├─ Diagnostics Module Overview.md
│  │  ├─ Doctor View Module Overview.md
│  │  ├─ Hub Module Overview.md
│  │  ├─ Intake Module Overview.md
│  │  ├─ Intent Engine Module Overview.md
│  │  ├─ Main Router Flow Overview.md
│  │  ├─ Medication Module Overview.md
│  │  ├─ Profile Module Overview.md
│  │  ├─ Protein Module Overview.md
│  │  ├─ Reports Module Overview.md
│  │  ├─ State Layer Overview.md
│  │  ├─ Supabase Core Overview.md
│  │  ├─ Trendpilot Module Overview.md
│  │  ├─ Unlock Flow Overview.md
│  │  └─ VAD Module Overview.md
│  ├─ Profile Module – Contact Extension Spe.md
│  ├─ Proteinrechner-Roadmap.md
│  ├─ pwa-implementation-roadmap.md
│  ├─ PWA-TWA Readiness.md
│  ├─ QA_CHECKS.md
│  ├─ QA_Notes.md
│  ├─ Repo Cleanup Roadmap.md
│  ├─ Repo Tree v2.md
│  ├─ Reports-Roadmap.md
│  ├─ Supabase Proxy Refactor Plan.md
│  ├─ Training module spec.md
│  ├─ Trendpilot-Correlation-Notes.md
│  ├─ Trendpilotrefactor.md
│  ├─ twa-implementation-roadmap.md
│  ├─ twa-session-report.md
│  ├─ umlaut-audit-js.txt
│  ├─ Voice Assistant roadmap.md
│  ├─ voice-archive-roadmap.md
│  └─ Zeus Feedback Engine.md
├─ index.html
├─ M.I.D.A.S..code-workspace
├─ offline.html
├─ public
│  ├─ img
│  │  ├─ icons
│  │  │  ├─ icon-192-maskable.png
│  │  │  ├─ icon-192.png
│  │  │  ├─ icon-512-maskable.png
│  │  │  └─ icon-512.png
│  │  └─ screenshots
│  │     ├─ screen-narrow.png
│  │     └─ screen-wide.png
│  ├─ manifest-placeholder.json
│  ├─ manifest.json
│  ├─ sw
│  │  ├─ README.md
│  │  └─ service-worker.js
│  └─ twa
│     └─ Android
│        └─ README.md
├─ README.md
├─ savehandler rework.md
├─ service-worker.js
├─ sql
│  ├─ 00_Tabua Rasa.sql
│  ├─ 01_Health Schema.sql
│  ├─ 02_Admin Checks.sql
│  ├─ 04_Body_Comp.sql
│  ├─ 05_Intake_Rpc.sql
│  ├─ 06_Security.sql
│  ├─ 07_Remove_Day_Flags.sql
│  ├─ 09_Appointments_v2.sql
│  ├─ 10_User_Profile_Ext.sql
│  ├─ 11_Lab_Event_Extension.sql
│  ├─ 12_Medication.sql
│  ├─ 13_Activity_Event.sql
│  ├─ 14_Trendpilot.sql
│  ├─ HOW_TO.md
│  └─ transition_bp_comment.sql
├─ temp.txt
├─ tmp.txt
└─ twa
   ├─ .gradle
   │  ├─ 8.11.1
   │  │  ├─ checksums
   │  │  │  ├─ checksums.lock
   │  │  │  ├─ md5-checksums.bin
   │  │  │  └─ sha1-checksums.bin
   │  │  ├─ executionHistory
   │  │  │  ├─ executionHistory.bin
   │  │  │  └─ executionHistory.lock
   │  │  ├─ expanded
   │  │  ├─ fileChanges
   │  │  │  └─ last-build.bin
   │  │  ├─ fileHashes
   │  │  │  ├─ fileHashes.bin
   │  │  │  ├─ fileHashes.lock
   │  │  │  └─ resourceHashesCache.bin
   │  │  ├─ gc.properties
   │  │  └─ vcsMetadata
   │  ├─ buildOutputCleanup
   │  │  ├─ buildOutputCleanup.lock
   │  │  ├─ cache.properties
   │  │  └─ outputFiles.bin
   │  ├─ file-system.probe
   │  └─ vcs-1
   │     └─ gc.properties
   ├─ android.keystore
   ├─ app
   │  ├─ build
   │  │  ├─ generated
   │  │  │  ├─ ap_generated_sources
   │  │  │  │  └─ release
   │  │  │  │     └─ out
   │  │  │  └─ res
   │  │  │     ├─ pngs
   │  │  │     │  └─ release
   │  │  │     └─ resValues
   │  │  │        └─ release
   │  │  │           └─ values
   │  │  │              └─ gradleResValues.xml
   │  │  ├─ intermediates
   │  │  │  ├─ aapt_proguard_file
   │  │  │  │  └─ release
   │  │  │  │     └─ processReleaseResources
   │  │  │  │        └─ aapt_rules.txt
   │  │  │  ├─ aar_metadata_check
   │  │  │  │  └─ release
   │  │  │  │     └─ checkReleaseAarMetadata
   │  │  │  ├─ annotation_processor_list
   │  │  │  │  └─ release
   │  │  │  │     └─ javaPreCompileRelease
   │  │  │  │        └─ annotationProcessors.json
   │  │  │  ├─ apk_ide_redirect_file
   │  │  │  │  └─ release
   │  │  │  │     └─ createReleaseApkListingFileRedirect
   │  │  │  │        └─ redirect.txt
   │  │  │  ├─ app_integrity_config
   │  │  │  │  └─ release
   │  │  │  │     └─ parseReleaseIntegrityConfig
   │  │  │  ├─ app_metadata
   │  │  │  │  └─ release
   │  │  │  │     └─ writeReleaseAppMetadata
   │  │  │  │        └─ app-metadata.properties
   │  │  │  ├─ assets
   │  │  │  │  └─ release
   │  │  │  │     └─ mergeReleaseAssets
   │  │  │  ├─ binary_art_profile
   │  │  │  │  └─ release
   │  │  │  │     └─ compileReleaseArtProfile
   │  │  │  │        └─ baseline.prof
   │  │  │  ├─ binary_art_profile_metadata
   │  │  │  │  └─ release
   │  │  │  │     └─ compileReleaseArtProfile
   │  │  │  │        └─ baseline.profm
   │  │  │  ├─ bundle_dependency_report
   │  │  │  │  └─ release
   │  │  │  │     └─ configureReleaseDependencies
   │  │  │  │        └─ dependencies.pb
   │  │  │  ├─ bundle_ide_model
   │  │  │  │  └─ release
   │  │  │  │     └─ produceReleaseBundleIdeListingFile
   │  │  │  │        └─ output-metadata.json
   │  │  │  ├─ bundle_ide_redirect_file
   │  │  │  │  └─ release
   │  │  │  │     └─ createReleaseBundleListingFileRedirect
   │  │  │  │        └─ redirect.txt
   │  │  │  ├─ bundle_manifest
   │  │  │  │  └─ release
   │  │  │  │     └─ processApplicationManifestReleaseForBundle
   │  │  │  │        └─ AndroidManifest.xml
   │  │  │  ├─ combined_art_profile
   │  │  │  │  └─ release
   │  │  │  │     └─ compileReleaseArtProfile
   │  │  │  │        └─ baseline-prof.txt
   │  │  │  ├─ compatible_screen_manifest
   │  │  │  │  └─ release
   │  │  │  │     └─ createReleaseCompatibleScreenManifests
   │  │  │  │        └─ output-metadata.json
   │  │  │  ├─ compile_and_runtime_not_namespaced_r_class_jar
   │  │  │  │  └─ release
   │  │  │  │     └─ processReleaseResources
   │  │  │  │        └─ R.jar
   │  │  │  ├─ compressed_assets
   │  │  │  │  └─ release
   │  │  │  │     └─ compressReleaseAssets
   │  │  │  │        └─ out
   │  │  │  ├─ data_binding_layout_info_type_merge
   │  │  │  │  └─ release
   │  │  │  │     └─ mergeReleaseResources
   │  │  │  │        └─ out
   │  │  │  ├─ data_binding_layout_info_type_package
   │  │  │  │  └─ release
   │  │  │  │     └─ packageReleaseResources
   │  │  │  │        └─ out
   │  │  │  ├─ default_proguard_files
   │  │  │  │  └─ global
   │  │  │  │     ├─ proguard-android-optimize.txt-8.9.1
   │  │  │  │     ├─ proguard-android.txt-8.9.1
   │  │  │  │     └─ proguard-defaults.txt-8.9.1
   │  │  │  ├─ dex
   │  │  │  │  └─ release
   │  │  │  │     └─ minifyReleaseWithR8
   │  │  │  │        └─ classes.dex
   │  │  │  ├─ dex_metadata_directory
   │  │  │  │  └─ release
   │  │  │  │     └─ compileReleaseArtProfile
   │  │  │  │        ├─ 0
   │  │  │  │        │  └─ .dm
   │  │  │  │        ├─ 1
   │  │  │  │        │  └─ .dm
   │  │  │  │        └─ dex-metadata-map.properties
   │  │  │  ├─ duplicate_classes_check
   │  │  │  │  └─ release
   │  │  │  │     └─ checkReleaseDuplicateClasses
   │  │  │  ├─ generated_proguard_file
   │  │  │  │  └─ release
   │  │  │  │     └─ mergeReleaseGeneratedProguardFiles
   │  │  │  ├─ incremental
   │  │  │  │  ├─ bundleReleaseResources
   │  │  │  │  ├─ mergeReleaseAssets
   │  │  │  │  │  └─ merger.xml
   │  │  │  │  ├─ mergeReleaseJniLibFolders
   │  │  │  │  │  └─ merger.xml
   │  │  │  │  ├─ mergeReleaseShaders
   │  │  │  │  │  └─ merger.xml
   │  │  │  │  ├─ packageRelease
   │  │  │  │  │  └─ tmp
   │  │  │  │  │     └─ release
   │  │  │  │  │        ├─ dex-renamer-state.txt
   │  │  │  │  │        └─ zip-cache
   │  │  │  │  │           ├─ androidResources
   │  │  │  │  │           └─ javaResources0
   │  │  │  │  ├─ release
   │  │  │  │  │  ├─ mergeReleaseResources
   │  │  │  │  │  │  ├─ compile-file-map.properties
   │  │  │  │  │  │  ├─ merged.dir
   │  │  │  │  │  │  │  ├─ values
   │  │  │  │  │  │  │  │  └─ values.xml
   │  │  │  │  │  │  │  ├─ values-af
   │  │  │  │  │  │  │  │  └─ values-af.xml
   │  │  │  │  │  │  │  ├─ values-am
   │  │  │  │  │  │  │  │  └─ values-am.xml
   │  │  │  │  │  │  │  ├─ values-ar
   │  │  │  │  │  │  │  │  └─ values-ar.xml
   │  │  │  │  │  │  │  ├─ values-as
   │  │  │  │  │  │  │  │  └─ values-as.xml
   │  │  │  │  │  │  │  ├─ values-az
   │  │  │  │  │  │  │  │  └─ values-az.xml
   │  │  │  │  │  │  │  ├─ values-b+sr+Latn
   │  │  │  │  │  │  │  │  └─ values-b+sr+Latn.xml
   │  │  │  │  │  │  │  ├─ values-be
   │  │  │  │  │  │  │  │  └─ values-be.xml
   │  │  │  │  │  │  │  ├─ values-bg
   │  │  │  │  │  │  │  │  └─ values-bg.xml
   │  │  │  │  │  │  │  ├─ values-bn
   │  │  │  │  │  │  │  │  └─ values-bn.xml
   │  │  │  │  │  │  │  ├─ values-bs
   │  │  │  │  │  │  │  │  └─ values-bs.xml
   │  │  │  │  │  │  │  ├─ values-ca
   │  │  │  │  │  │  │  │  └─ values-ca.xml
   │  │  │  │  │  │  │  ├─ values-cs
   │  │  │  │  │  │  │  │  └─ values-cs.xml
   │  │  │  │  │  │  │  ├─ values-da
   │  │  │  │  │  │  │  │  └─ values-da.xml
   │  │  │  │  │  │  │  ├─ values-de
   │  │  │  │  │  │  │  │  └─ values-de.xml
   │  │  │  │  │  │  │  ├─ values-el
   │  │  │  │  │  │  │  │  └─ values-el.xml
   │  │  │  │  │  │  │  ├─ values-en-rAU
   │  │  │  │  │  │  │  │  └─ values-en-rAU.xml
   │  │  │  │  │  │  │  ├─ values-en-rCA
   │  │  │  │  │  │  │  │  └─ values-en-rCA.xml
   │  │  │  │  │  │  │  ├─ values-en-rGB
   │  │  │  │  │  │  │  │  └─ values-en-rGB.xml
   │  │  │  │  │  │  │  ├─ values-en-rIN
   │  │  │  │  │  │  │  │  └─ values-en-rIN.xml
   │  │  │  │  │  │  │  ├─ values-en-rXC
   │  │  │  │  │  │  │  │  └─ values-en-rXC.xml
   │  │  │  │  │  │  │  ├─ values-es
   │  │  │  │  │  │  │  │  └─ values-es.xml
   │  │  │  │  │  │  │  ├─ values-es-rUS
   │  │  │  │  │  │  │  │  └─ values-es-rUS.xml
   │  │  │  │  │  │  │  ├─ values-et
   │  │  │  │  │  │  │  │  └─ values-et.xml
   │  │  │  │  │  │  │  ├─ values-eu
   │  │  │  │  │  │  │  │  └─ values-eu.xml
   │  │  │  │  │  │  │  ├─ values-fa
   │  │  │  │  │  │  │  │  └─ values-fa.xml
   │  │  │  │  │  │  │  ├─ values-fi
   │  │  │  │  │  │  │  │  └─ values-fi.xml
   │  │  │  │  │  │  │  ├─ values-fr
   │  │  │  │  │  │  │  │  └─ values-fr.xml
   │  │  │  │  │  │  │  ├─ values-fr-rCA
   │  │  │  │  │  │  │  │  └─ values-fr-rCA.xml
   │  │  │  │  │  │  │  ├─ values-gl
   │  │  │  │  │  │  │  │  └─ values-gl.xml
   │  │  │  │  │  │  │  ├─ values-gu
   │  │  │  │  │  │  │  │  └─ values-gu.xml
   │  │  │  │  │  │  │  ├─ values-h720dp-v13
   │  │  │  │  │  │  │  │  └─ values-h720dp-v13.xml
   │  │  │  │  │  │  │  ├─ values-hdpi-v4
   │  │  │  │  │  │  │  │  └─ values-hdpi-v4.xml
   │  │  │  │  │  │  │  ├─ values-hi
   │  │  │  │  │  │  │  │  └─ values-hi.xml
   │  │  │  │  │  │  │  ├─ values-hr
   │  │  │  │  │  │  │  │  └─ values-hr.xml
   │  │  │  │  │  │  │  ├─ values-hu
   │  │  │  │  │  │  │  │  └─ values-hu.xml
   │  │  │  │  │  │  │  ├─ values-hy
   │  │  │  │  │  │  │  │  └─ values-hy.xml
   │  │  │  │  │  │  │  ├─ values-in
   │  │  │  │  │  │  │  │  └─ values-in.xml
   │  │  │  │  │  │  │  ├─ values-is
   │  │  │  │  │  │  │  │  └─ values-is.xml
   │  │  │  │  │  │  │  ├─ values-it
   │  │  │  │  │  │  │  │  └─ values-it.xml
   │  │  │  │  │  │  │  ├─ values-iw
   │  │  │  │  │  │  │  │  └─ values-iw.xml
   │  │  │  │  │  │  │  ├─ values-ja
   │  │  │  │  │  │  │  │  └─ values-ja.xml
   │  │  │  │  │  │  │  ├─ values-ka
   │  │  │  │  │  │  │  │  └─ values-ka.xml
   │  │  │  │  │  │  │  ├─ values-kk
   │  │  │  │  │  │  │  │  └─ values-kk.xml
   │  │  │  │  │  │  │  ├─ values-km
   │  │  │  │  │  │  │  │  └─ values-km.xml
   │  │  │  │  │  │  │  ├─ values-kn
   │  │  │  │  │  │  │  │  └─ values-kn.xml
   │  │  │  │  │  │  │  ├─ values-ko
   │  │  │  │  │  │  │  │  └─ values-ko.xml
   │  │  │  │  │  │  │  ├─ values-ky
   │  │  │  │  │  │  │  │  └─ values-ky.xml
   │  │  │  │  │  │  │  ├─ values-land
   │  │  │  │  │  │  │  │  └─ values-land.xml
   │  │  │  │  │  │  │  ├─ values-large-v4
   │  │  │  │  │  │  │  │  └─ values-large-v4.xml
   │  │  │  │  │  │  │  ├─ values-ldltr-v21
   │  │  │  │  │  │  │  │  └─ values-ldltr-v21.xml
   │  │  │  │  │  │  │  ├─ values-lo
   │  │  │  │  │  │  │  │  └─ values-lo.xml
   │  │  │  │  │  │  │  ├─ values-lt
   │  │  │  │  │  │  │  │  └─ values-lt.xml
   │  │  │  │  │  │  │  ├─ values-lv
   │  │  │  │  │  │  │  │  └─ values-lv.xml
   │  │  │  │  │  │  │  ├─ values-mk
   │  │  │  │  │  │  │  │  └─ values-mk.xml
   │  │  │  │  │  │  │  ├─ values-ml
   │  │  │  │  │  │  │  │  └─ values-ml.xml
   │  │  │  │  │  │  │  ├─ values-mn
   │  │  │  │  │  │  │  │  └─ values-mn.xml
   │  │  │  │  │  │  │  ├─ values-mr
   │  │  │  │  │  │  │  │  └─ values-mr.xml
   │  │  │  │  │  │  │  ├─ values-ms
   │  │  │  │  │  │  │  │  └─ values-ms.xml
   │  │  │  │  │  │  │  ├─ values-my
   │  │  │  │  │  │  │  │  └─ values-my.xml
   │  │  │  │  │  │  │  ├─ values-nb
   │  │  │  │  │  │  │  │  └─ values-nb.xml
   │  │  │  │  │  │  │  ├─ values-ne
   │  │  │  │  │  │  │  │  └─ values-ne.xml
   │  │  │  │  │  │  │  ├─ values-night-v8
   │  │  │  │  │  │  │  │  └─ values-night-v8.xml
   │  │  │  │  │  │  │  ├─ values-nl
   │  │  │  │  │  │  │  │  └─ values-nl.xml
   │  │  │  │  │  │  │  ├─ values-or
   │  │  │  │  │  │  │  │  └─ values-or.xml
   │  │  │  │  │  │  │  ├─ values-pa
   │  │  │  │  │  │  │  │  └─ values-pa.xml
   │  │  │  │  │  │  │  ├─ values-pl
   │  │  │  │  │  │  │  │  └─ values-pl.xml
   │  │  │  │  │  │  │  ├─ values-port
   │  │  │  │  │  │  │  │  └─ values-port.xml
   │  │  │  │  │  │  │  ├─ values-pt
   │  │  │  │  │  │  │  │  └─ values-pt.xml
   │  │  │  │  │  │  │  ├─ values-pt-rBR
   │  │  │  │  │  │  │  │  └─ values-pt-rBR.xml
   │  │  │  │  │  │  │  ├─ values-pt-rPT
   │  │  │  │  │  │  │  │  └─ values-pt-rPT.xml
   │  │  │  │  │  │  │  ├─ values-ro
   │  │  │  │  │  │  │  │  └─ values-ro.xml
   │  │  │  │  │  │  │  ├─ values-ru
   │  │  │  │  │  │  │  │  └─ values-ru.xml
   │  │  │  │  │  │  │  ├─ values-si
   │  │  │  │  │  │  │  │  └─ values-si.xml
   │  │  │  │  │  │  │  ├─ values-sk
   │  │  │  │  │  │  │  │  └─ values-sk.xml
   │  │  │  │  │  │  │  ├─ values-sl
   │  │  │  │  │  │  │  │  └─ values-sl.xml
   │  │  │  │  │  │  │  ├─ values-sq
   │  │  │  │  │  │  │  │  └─ values-sq.xml
   │  │  │  │  │  │  │  ├─ values-sr
   │  │  │  │  │  │  │  │  └─ values-sr.xml
   │  │  │  │  │  │  │  ├─ values-sv
   │  │  │  │  │  │  │  │  └─ values-sv.xml
   │  │  │  │  │  │  │  ├─ values-sw
   │  │  │  │  │  │  │  │  └─ values-sw.xml
   │  │  │  │  │  │  │  ├─ values-sw600dp-v13
   │  │  │  │  │  │  │  │  └─ values-sw600dp-v13.xml
   │  │  │  │  │  │  │  ├─ values-ta
   │  │  │  │  │  │  │  │  └─ values-ta.xml
   │  │  │  │  │  │  │  ├─ values-te
   │  │  │  │  │  │  │  │  └─ values-te.xml
   │  │  │  │  │  │  │  ├─ values-th
   │  │  │  │  │  │  │  │  └─ values-th.xml
   │  │  │  │  │  │  │  ├─ values-tl
   │  │  │  │  │  │  │  │  └─ values-tl.xml
   │  │  │  │  │  │  │  ├─ values-tr
   │  │  │  │  │  │  │  │  └─ values-tr.xml
   │  │  │  │  │  │  │  ├─ values-uk
   │  │  │  │  │  │  │  │  └─ values-uk.xml
   │  │  │  │  │  │  │  ├─ values-ur
   │  │  │  │  │  │  │  │  └─ values-ur.xml
   │  │  │  │  │  │  │  ├─ values-uz
   │  │  │  │  │  │  │  │  └─ values-uz.xml
   │  │  │  │  │  │  │  ├─ values-v16
   │  │  │  │  │  │  │  │  └─ values-v16.xml
   │  │  │  │  │  │  │  ├─ values-v17
   │  │  │  │  │  │  │  │  └─ values-v17.xml
   │  │  │  │  │  │  │  ├─ values-v18
   │  │  │  │  │  │  │  │  └─ values-v18.xml
   │  │  │  │  │  │  │  ├─ values-v21
   │  │  │  │  │  │  │  │  └─ values-v21.xml
   │  │  │  │  │  │  │  ├─ values-v22
   │  │  │  │  │  │  │  │  └─ values-v22.xml
   │  │  │  │  │  │  │  ├─ values-v23
   │  │  │  │  │  │  │  │  └─ values-v23.xml
   │  │  │  │  │  │  │  ├─ values-v24
   │  │  │  │  │  │  │  │  └─ values-v24.xml
   │  │  │  │  │  │  │  ├─ values-v25
   │  │  │  │  │  │  │  │  └─ values-v25.xml
   │  │  │  │  │  │  │  ├─ values-v26
   │  │  │  │  │  │  │  │  └─ values-v26.xml
   │  │  │  │  │  │  │  ├─ values-v28
   │  │  │  │  │  │  │  │  └─ values-v28.xml
   │  │  │  │  │  │  │  ├─ values-vi
   │  │  │  │  │  │  │  │  └─ values-vi.xml
   │  │  │  │  │  │  │  ├─ values-watch-v20
   │  │  │  │  │  │  │  │  └─ values-watch-v20.xml
   │  │  │  │  │  │  │  ├─ values-watch-v21
   │  │  │  │  │  │  │  │  └─ values-watch-v21.xml
   │  │  │  │  │  │  │  ├─ values-xlarge-v4
   │  │  │  │  │  │  │  │  └─ values-xlarge-v4.xml
   │  │  │  │  │  │  │  ├─ values-zh-rCN
   │  │  │  │  │  │  │  │  └─ values-zh-rCN.xml
   │  │  │  │  │  │  │  ├─ values-zh-rHK
   │  │  │  │  │  │  │  │  └─ values-zh-rHK.xml
   │  │  │  │  │  │  │  ├─ values-zh-rTW
   │  │  │  │  │  │  │  │  └─ values-zh-rTW.xml
   │  │  │  │  │  │  │  └─ values-zu
   │  │  │  │  │  │  │     └─ values-zu.xml
   │  │  │  │  │  │  ├─ merger.xml
   │  │  │  │  │  │  └─ stripped.dir
   │  │  │  │  │  └─ packageReleaseResources
   │  │  │  │  │     ├─ compile-file-map.properties
   │  │  │  │  │     ├─ merged.dir
   │  │  │  │  │     │  └─ values
   │  │  │  │  │     │     └─ values.xml
   │  │  │  │  │     ├─ merger.xml
   │  │  │  │  │     └─ stripped.dir
   │  │  │  │  └─ release-mergeJavaRes
   │  │  │  │     ├─ merge-state
   │  │  │  │     └─ zip-cache
   │  │  │  │        ├─ 0yppkTOD6Z12p3_61T0IAXlEVlM=
   │  │  │  │        ├─ 3m_u3wwhKdVuG2jhAJX54o6L4uU=
   │  │  │  │        ├─ 3vCwzlYE_zi4idOK9Yp6a7zo1ss=
   │  │  │  │        ├─ 3xgeJAo1I+k1S5f7f1TITkodPrc=
   │  │  │  │        ├─ 5izBHI_5LZKY3RWiRV+pOi2TXkE=
   │  │  │  │        ├─ 5QEouybO3DUKGQcdyGmH80FvZNY=
   │  │  │  │        ├─ 6imwOEpAOa4ZMCUHPb_K0Vaytu0=
   │  │  │  │        ├─ 78FdJ04+YmLEQf_cJzgErS1uLeo=
   │  │  │  │        ├─ 7AtDsLT89IOL5gQAMFolVeUiEZc=
   │  │  │  │        ├─ 8DR1+dkv+ftEENB1BAjeVeanHcY=
   │  │  │  │        ├─ 9ZP1xtslOyVg1TRgXivrksrN52M=
   │  │  │  │        ├─ C0i+5rBqTBKgQXzUR8EJF3EvBaY=
   │  │  │  │        ├─ C3oQyAfm7P+mf90_YtnHuthDwaM=
   │  │  │  │        ├─ cqa7_m7Iq1Zg9h_ZXtWY60uP_2g=
   │  │  │  │        ├─ CxY+YG80MOvmAiQUlhrM1NqG_UU=
   │  │  │  │        ├─ DeBTQujRinBL6E8W9YydTXWciUI=
   │  │  │  │        ├─ FdDb0Qpqp+Pu6pG66gijtRIiZuI=
   │  │  │  │        ├─ FFt_q9KFjIl6Lj55oBa4cpZ7Ngo=
   │  │  │  │        ├─ Ho8xOjNj7irENxDyNjlDINpBbwc=
   │  │  │  │        ├─ IPxIa4+ke2Zhqlo_AOhbjvvsxDg=
   │  │  │  │        ├─ J0Edvq3fSwcjfZQAz3OxnXIpd04=
   │  │  │  │        ├─ jlqdlxDvqp8qYt_ZyAtRmxeKku0=
   │  │  │  │        ├─ LM3bgTiWLqvhbgsbX96AGN8V8n0=
   │  │  │  │        ├─ MpPyvWOND1SIXSJbhFQxd_UKjfg=
   │  │  │  │        ├─ NHou155Fto22LKf9BYmDKyBOjRE=
   │  │  │  │        ├─ NoSsuxcBsR2n8D3mCG8293YsdMc=
   │  │  │  │        ├─ nZzno+QJG8nU5m+2MaxjQqJ8clU=
   │  │  │  │        ├─ OloQzAeUxvFVBlB8g+Tl4oJYfis=
   │  │  │  │        ├─ oxD2reFJemvjxJu0OGaFs7iqnTc=
   │  │  │  │        ├─ oZHitGb6vq8VZKHPWHgkl8nbqIs=
   │  │  │  │        ├─ PrUVbdEb5G0vaN5Za1YgsOsZD9I=
   │  │  │  │        ├─ Q75ZY0MZOYs2sC7fQRYEHHMWMu8=
   │  │  │  │        ├─ RgMwF47NJ0Xi7jcnzWmklRPwWtQ=
   │  │  │  │        ├─ RSwt6lSdVgrS1j3HGAMPrwMtOjo=
   │  │  │  │        ├─ RvvDWU6dGZCTX5p6Vgk309lsg5o=
   │  │  │  │        ├─ SjiPNQl8XoiYftPZ+J5lLSJW+dk=
   │  │  │  │        ├─ Sn8SeUyBPAWtii6L_vM6rfK8yE0=
   │  │  │  │        ├─ TcNI6HpduLFIkeLMisqZwWhG9mY=
   │  │  │  │        ├─ tVMz4Eiu+Cvi3Zb9L_mdPZIc9Ok=
   │  │  │  │        ├─ ueAPr8QHexs8dInpmQ+ht8e_aVA=
   │  │  │  │        ├─ vFCOUXhsvlxgzIsstjJnJ2PzcpE=
   │  │  │  │        ├─ vRi8otInM465eA37vc6yYslApRA=
   │  │  │  │        ├─ WunS5UnHZ3ihUO+D4dBNK4j1EA8=
   │  │  │  │        ├─ xGsl2vg2xWIGchQou8KUiPiquK4=
   │  │  │  │        ├─ XQlMR6kMPq3nDABjCkA_yNj1Dyo=
   │  │  │  │        ├─ Y4n2Do7s19LGTEn8W2mrGVOTIWU=
   │  │  │  │        ├─ Ya5HmnEoR3Hljme1K+yQe7xTxpQ=
   │  │  │  │        ├─ YEjo6ECkuhMZI9R3ALRX0WAneb4=
   │  │  │  │        ├─ ZglLVlH3hdlmNa2wbpl+Xe8ih0A=
   │  │  │  │        ├─ Zlc9w3Pw6Ud7oJ0eno+e8TrfQFA=
   │  │  │  │        └─ zRcFnWZtFFbT_t6Q9LVSk9YGB4Y=
   │  │  │  ├─ intermediary_bundle
   │  │  │  │  └─ release
   │  │  │  │     └─ packageReleaseBundle
   │  │  │  │        └─ intermediary-bundle.aab
   │  │  │  ├─ javac
   │  │  │  │  └─ release
   │  │  │  │     └─ compileReleaseJavaWithJavac
   │  │  │  │        └─ classes
   │  │  │  │           └─ de
   │  │  │  │              └─ schabuss
   │  │  │  │                 └─ midas
   │  │  │  │                    ├─ Application.class
   │  │  │  │                    ├─ DelegationService.class
   │  │  │  │                    └─ LauncherActivity.class
   │  │  │  ├─ linked_resources_binary_format
   │  │  │  │  └─ release
   │  │  │  │     └─ processReleaseResources
   │  │  │  │        ├─ linked-resources-binary-format-release.ap_
   │  │  │  │        └─ output-metadata.json
   │  │  │  ├─ linked_resources_for_bundle_proto_format
   │  │  │  │  └─ release
   │  │  │  │     └─ bundleReleaseResources
   │  │  │  │        └─ linked-resources-for-bundle-proto-format.ap_
   │  │  │  ├─ local_only_symbol_list
   │  │  │  │  └─ release
   │  │  │  │     └─ parseReleaseLocalResources
   │  │  │  │        └─ R-def.txt
   │  │  │  ├─ manifest_merge_blame_file
   │  │  │  │  └─ release
   │  │  │  │     └─ processReleaseMainManifest
   │  │  │  │        └─ manifest-merger-blame-release-report.txt
   │  │  │  ├─ merged_art_profile
   │  │  │  │  └─ release
   │  │  │  │     └─ mergeReleaseArtProfile
   │  │  │  │        └─ baseline-prof.txt
   │  │  │  ├─ merged_java_res
   │  │  │  │  └─ release
   │  │  │  │     ├─ mergeReleaseJavaResource
   │  │  │  │     │  └─ base.jar
   │  │  │  │     └─ minifyReleaseWithR8
   │  │  │  │        └─ base.jar
   │  │  │  ├─ merged_jni_libs
   │  │  │  │  └─ release
   │  │  │  │     └─ mergeReleaseJniLibFolders
   │  │  │  │        └─ out
   │  │  │  ├─ merged_manifest
   │  │  │  │  └─ release
   │  │  │  │     └─ processReleaseMainManifest
   │  │  │  │        └─ AndroidManifest.xml
   │  │  │  ├─ merged_manifests
   │  │  │  │  └─ release
   │  │  │  │     └─ processReleaseManifest
   │  │  │  │        ├─ AndroidManifest.xml
   │  │  │  │        └─ output-metadata.json
   │  │  │  ├─ merged_res
   │  │  │  │  └─ release
   │  │  │  │     └─ mergeReleaseResources
   │  │  │  │        ├─ drawable-anydpi_shortcut_legacy_background.xml.flat
   │  │  │  │        ├─ drawable-hdpi_ic_notification_icon.png.flat
   │  │  │  │        ├─ drawable-hdpi_splash.png.flat
   │  │  │  │        ├─ drawable-mdpi_ic_notification_icon.png.flat
   │  │  │  │        ├─ drawable-mdpi_splash.png.flat
   │  │  │  │        ├─ drawable-xhdpi_ic_notification_icon.png.flat
   │  │  │  │        ├─ drawable-xhdpi_splash.png.flat
   │  │  │  │        ├─ drawable-xxhdpi_ic_notification_icon.png.flat
   │  │  │  │        ├─ drawable-xxhdpi_splash.png.flat
   │  │  │  │        ├─ drawable-xxxhdpi_ic_notification_icon.png.flat
   │  │  │  │        ├─ drawable-xxxhdpi_splash.png.flat
   │  │  │  │        ├─ mipmap-anydpi-v26_ic_launcher.xml.flat
   │  │  │  │        ├─ mipmap-hdpi_ic_launcher.png.flat
   │  │  │  │        ├─ mipmap-hdpi_ic_maskable.png.flat
   │  │  │  │        ├─ mipmap-mdpi_ic_launcher.png.flat
   │  │  │  │        ├─ mipmap-mdpi_ic_maskable.png.flat
   │  │  │  │        ├─ mipmap-xhdpi_ic_launcher.png.flat
   │  │  │  │        ├─ mipmap-xhdpi_ic_maskable.png.flat
   │  │  │  │        ├─ mipmap-xxhdpi_ic_launcher.png.flat
   │  │  │  │        ├─ mipmap-xxhdpi_ic_maskable.png.flat
   │  │  │  │        ├─ mipmap-xxxhdpi_ic_launcher.png.flat
   │  │  │  │        ├─ mipmap-xxxhdpi_ic_maskable.png.flat
   │  │  │  │        ├─ raw_web_app_manifest.json.flat
   │  │  │  │        ├─ values-af_values-af.arsc.flat
   │  │  │  │        ├─ values-am_values-am.arsc.flat
   │  │  │  │        ├─ values-ar_values-ar.arsc.flat
   │  │  │  │        ├─ values-as_values-as.arsc.flat
   │  │  │  │        ├─ values-az_values-az.arsc.flat
   │  │  │  │        ├─ values-b+sr+Latn_values-b+sr+Latn.arsc.flat
   │  │  │  │        ├─ values-be_values-be.arsc.flat
   │  │  │  │        ├─ values-bg_values-bg.arsc.flat
   │  │  │  │        ├─ values-bn_values-bn.arsc.flat
   │  │  │  │        ├─ values-bs_values-bs.arsc.flat
   │  │  │  │        ├─ values-ca_values-ca.arsc.flat
   │  │  │  │        ├─ values-cs_values-cs.arsc.flat
   │  │  │  │        ├─ values-da_values-da.arsc.flat
   │  │  │  │        ├─ values-de_values-de.arsc.flat
   │  │  │  │        ├─ values-el_values-el.arsc.flat
   │  │  │  │        ├─ values-en-rAU_values-en-rAU.arsc.flat
   │  │  │  │        ├─ values-en-rCA_values-en-rCA.arsc.flat
   │  │  │  │        ├─ values-en-rGB_values-en-rGB.arsc.flat
   │  │  │  │        ├─ values-en-rIN_values-en-rIN.arsc.flat
   │  │  │  │        ├─ values-en-rXC_values-en-rXC.arsc.flat
   │  │  │  │        ├─ values-es-rUS_values-es-rUS.arsc.flat
   │  │  │  │        ├─ values-es_values-es.arsc.flat
   │  │  │  │        ├─ values-et_values-et.arsc.flat
   │  │  │  │        ├─ values-eu_values-eu.arsc.flat
   │  │  │  │        ├─ values-fa_values-fa.arsc.flat
   │  │  │  │        ├─ values-fi_values-fi.arsc.flat
   │  │  │  │        ├─ values-fr-rCA_values-fr-rCA.arsc.flat
   │  │  │  │        ├─ values-fr_values-fr.arsc.flat
   │  │  │  │        ├─ values-gl_values-gl.arsc.flat
   │  │  │  │        ├─ values-gu_values-gu.arsc.flat
   │  │  │  │        ├─ values-h720dp-v13_values-h720dp-v13.arsc.flat
   │  │  │  │        ├─ values-hdpi-v4_values-hdpi-v4.arsc.flat
   │  │  │  │        ├─ values-hi_values-hi.arsc.flat
   │  │  │  │        ├─ values-hr_values-hr.arsc.flat
   │  │  │  │        ├─ values-hu_values-hu.arsc.flat
   │  │  │  │        ├─ values-hy_values-hy.arsc.flat
   │  │  │  │        ├─ values-in_values-in.arsc.flat
   │  │  │  │        ├─ values-is_values-is.arsc.flat
   │  │  │  │        ├─ values-it_values-it.arsc.flat
   │  │  │  │        ├─ values-iw_values-iw.arsc.flat
   │  │  │  │        ├─ values-ja_values-ja.arsc.flat
   │  │  │  │        ├─ values-ka_values-ka.arsc.flat
   │  │  │  │        ├─ values-kk_values-kk.arsc.flat
   │  │  │  │        ├─ values-km_values-km.arsc.flat
   │  │  │  │        ├─ values-kn_values-kn.arsc.flat
   │  │  │  │        ├─ values-ko_values-ko.arsc.flat
   │  │  │  │        ├─ values-ky_values-ky.arsc.flat
   │  │  │  │        ├─ values-land_values-land.arsc.flat
   │  │  │  │        ├─ values-large-v4_values-large-v4.arsc.flat
   │  │  │  │        ├─ values-ldltr-v21_values-ldltr-v21.arsc.flat
   │  │  │  │        ├─ values-lo_values-lo.arsc.flat
   │  │  │  │        ├─ values-lt_values-lt.arsc.flat
   │  │  │  │        ├─ values-lv_values-lv.arsc.flat
   │  │  │  │        ├─ values-mk_values-mk.arsc.flat
   │  │  │  │        ├─ values-ml_values-ml.arsc.flat
   │  │  │  │        ├─ values-mn_values-mn.arsc.flat
   │  │  │  │        ├─ values-mr_values-mr.arsc.flat
   │  │  │  │        ├─ values-ms_values-ms.arsc.flat
   │  │  │  │        ├─ values-my_values-my.arsc.flat
   │  │  │  │        ├─ values-nb_values-nb.arsc.flat
   │  │  │  │        ├─ values-ne_values-ne.arsc.flat
   │  │  │  │        ├─ values-night-v8_values-night-v8.arsc.flat
   │  │  │  │        ├─ values-nl_values-nl.arsc.flat
   │  │  │  │        ├─ values-or_values-or.arsc.flat
   │  │  │  │        ├─ values-pa_values-pa.arsc.flat
   │  │  │  │        ├─ values-pl_values-pl.arsc.flat
   │  │  │  │        ├─ values-port_values-port.arsc.flat
   │  │  │  │        ├─ values-pt-rBR_values-pt-rBR.arsc.flat
   │  │  │  │        ├─ values-pt-rPT_values-pt-rPT.arsc.flat
   │  │  │  │        ├─ values-pt_values-pt.arsc.flat
   │  │  │  │        ├─ values-ro_values-ro.arsc.flat
   │  │  │  │        ├─ values-ru_values-ru.arsc.flat
   │  │  │  │        ├─ values-si_values-si.arsc.flat
   │  │  │  │        ├─ values-sk_values-sk.arsc.flat
   │  │  │  │        ├─ values-sl_values-sl.arsc.flat
   │  │  │  │        ├─ values-sq_values-sq.arsc.flat
   │  │  │  │        ├─ values-sr_values-sr.arsc.flat
   │  │  │  │        ├─ values-sv_values-sv.arsc.flat
   │  │  │  │        ├─ values-sw600dp-v13_values-sw600dp-v13.arsc.flat
   │  │  │  │        ├─ values-sw_values-sw.arsc.flat
   │  │  │  │        ├─ values-ta_values-ta.arsc.flat
   │  │  │  │        ├─ values-te_values-te.arsc.flat
   │  │  │  │        ├─ values-th_values-th.arsc.flat
   │  │  │  │        ├─ values-tl_values-tl.arsc.flat
   │  │  │  │        ├─ values-tr_values-tr.arsc.flat
   │  │  │  │        ├─ values-uk_values-uk.arsc.flat
   │  │  │  │        ├─ values-ur_values-ur.arsc.flat
   │  │  │  │        ├─ values-uz_values-uz.arsc.flat
   │  │  │  │        ├─ values-v16_values-v16.arsc.flat
   │  │  │  │        ├─ values-v17_values-v17.arsc.flat
   │  │  │  │        ├─ values-v18_values-v18.arsc.flat
   │  │  │  │        ├─ values-v21_values-v21.arsc.flat
   │  │  │  │        ├─ values-v22_values-v22.arsc.flat
   │  │  │  │        ├─ values-v23_values-v23.arsc.flat
   │  │  │  │        ├─ values-v24_values-v24.arsc.flat
   │  │  │  │        ├─ values-v25_values-v25.arsc.flat
   │  │  │  │        ├─ values-v26_values-v26.arsc.flat
   │  │  │  │        ├─ values-v28_values-v28.arsc.flat
   │  │  │  │        ├─ values-vi_values-vi.arsc.flat
   │  │  │  │        ├─ values-watch-v20_values-watch-v20.arsc.flat
   │  │  │  │        ├─ values-watch-v21_values-watch-v21.arsc.flat
   │  │  │  │        ├─ values-xlarge-v4_values-xlarge-v4.arsc.flat
   │  │  │  │        ├─ values-zh-rCN_values-zh-rCN.arsc.flat
   │  │  │  │        ├─ values-zh-rHK_values-zh-rHK.arsc.flat
   │  │  │  │        ├─ values-zh-rTW_values-zh-rTW.arsc.flat
   │  │  │  │        ├─ values-zu_values-zu.arsc.flat
   │  │  │  │        ├─ values_values.arsc.flat
   │  │  │  │        ├─ xml_filepaths.xml.flat
   │  │  │  │        └─ xml_shortcuts.xml.flat
   │  │  │  ├─ merged_res_blame_folder
   │  │  │  │  └─ release
   │  │  │  │     └─ mergeReleaseResources
   │  │  │  │        └─ out
   │  │  │  │           ├─ multi-v2
   │  │  │  │           │  ├─ mergeReleaseResources.json
   │  │  │  │           │  ├─ values-af.json
   │  │  │  │           │  ├─ values-am.json
   │  │  │  │           │  ├─ values-ar.json
   │  │  │  │           │  ├─ values-as.json
   │  │  │  │           │  ├─ values-az.json
   │  │  │  │           │  ├─ values-b+sr+Latn.json
   │  │  │  │           │  ├─ values-be.json
   │  │  │  │           │  ├─ values-bg.json
   │  │  │  │           │  ├─ values-bn.json
   │  │  │  │           │  ├─ values-bs.json
   │  │  │  │           │  ├─ values-ca.json
   │  │  │  │           │  ├─ values-cs.json
   │  │  │  │           │  ├─ values-da.json
   │  │  │  │           │  ├─ values-de.json
   │  │  │  │           │  ├─ values-el.json
   │  │  │  │           │  ├─ values-en-rAU.json
   │  │  │  │           │  ├─ values-en-rCA.json
   │  │  │  │           │  ├─ values-en-rGB.json
   │  │  │  │           │  ├─ values-en-rIN.json
   │  │  │  │           │  ├─ values-en-rXC.json
   │  │  │  │           │  ├─ values-es-rUS.json
   │  │  │  │           │  ├─ values-es.json
   │  │  │  │           │  ├─ values-et.json
   │  │  │  │           │  ├─ values-eu.json
   │  │  │  │           │  ├─ values-fa.json
   │  │  │  │           │  ├─ values-fi.json
   │  │  │  │           │  ├─ values-fr-rCA.json
   │  │  │  │           │  ├─ values-fr.json
   │  │  │  │           │  ├─ values-gl.json
   │  │  │  │           │  ├─ values-gu.json
   │  │  │  │           │  ├─ values-h720dp-v13.json
   │  │  │  │           │  ├─ values-hdpi-v4.json
   │  │  │  │           │  ├─ values-hi.json
   │  │  │  │           │  ├─ values-hr.json
   │  │  │  │           │  ├─ values-hu.json
   │  │  │  │           │  ├─ values-hy.json
   │  │  │  │           │  ├─ values-in.json
   │  │  │  │           │  ├─ values-is.json
   │  │  │  │           │  ├─ values-it.json
   │  │  │  │           │  ├─ values-iw.json
   │  │  │  │           │  ├─ values-ja.json
   │  │  │  │           │  ├─ values-ka.json
   │  │  │  │           │  ├─ values-kk.json
   │  │  │  │           │  ├─ values-km.json
   │  │  │  │           │  ├─ values-kn.json
   │  │  │  │           │  ├─ values-ko.json
   │  │  │  │           │  ├─ values-ky.json
   │  │  │  │           │  ├─ values-land.json
   │  │  │  │           │  ├─ values-large-v4.json
   │  │  │  │           │  ├─ values-ldltr-v21.json
   │  │  │  │           │  ├─ values-lo.json
   │  │  │  │           │  ├─ values-lt.json
   │  │  │  │           │  ├─ values-lv.json
   │  │  │  │           │  ├─ values-mk.json
   │  │  │  │           │  ├─ values-ml.json
   │  │  │  │           │  ├─ values-mn.json
   │  │  │  │           │  ├─ values-mr.json
   │  │  │  │           │  ├─ values-ms.json
   │  │  │  │           │  ├─ values-my.json
   │  │  │  │           │  ├─ values-nb.json
   │  │  │  │           │  ├─ values-ne.json
   │  │  │  │           │  ├─ values-night-v8.json
   │  │  │  │           │  ├─ values-nl.json
   │  │  │  │           │  ├─ values-or.json
   │  │  │  │           │  ├─ values-pa.json
   │  │  │  │           │  ├─ values-pl.json
   │  │  │  │           │  ├─ values-port.json
   │  │  │  │           │  ├─ values-pt-rBR.json
   │  │  │  │           │  ├─ values-pt-rPT.json
   │  │  │  │           │  ├─ values-pt.json
   │  │  │  │           │  ├─ values-ro.json
   │  │  │  │           │  ├─ values-ru.json
   │  │  │  │           │  ├─ values-si.json
   │  │  │  │           │  ├─ values-sk.json
   │  │  │  │           │  ├─ values-sl.json
   │  │  │  │           │  ├─ values-sq.json
   │  │  │  │           │  ├─ values-sr.json
   │  │  │  │           │  ├─ values-sv.json
   │  │  │  │           │  ├─ values-sw.json
   │  │  │  │           │  ├─ values-sw600dp-v13.json
   │  │  │  │           │  ├─ values-ta.json
   │  │  │  │           │  ├─ values-te.json
   │  │  │  │           │  ├─ values-th.json
   │  │  │  │           │  ├─ values-tl.json
   │  │  │  │           │  ├─ values-tr.json
   │  │  │  │           │  ├─ values-uk.json
   │  │  │  │           │  ├─ values-ur.json
   │  │  │  │           │  ├─ values-uz.json
   │  │  │  │           │  ├─ values-v16.json
   │  │  │  │           │  ├─ values-v17.json
   │  │  │  │           │  ├─ values-v18.json
   │  │  │  │           │  ├─ values-v21.json
   │  │  │  │           │  ├─ values-v22.json
   │  │  │  │           │  ├─ values-v23.json
   │  │  │  │           │  ├─ values-v24.json
   │  │  │  │           │  ├─ values-v25.json
   │  │  │  │           │  ├─ values-v26.json
   │  │  │  │           │  ├─ values-v28.json
   │  │  │  │           │  ├─ values-vi.json
   │  │  │  │           │  ├─ values-watch-v20.json
   │  │  │  │           │  ├─ values-watch-v21.json
   │  │  │  │           │  ├─ values-xlarge-v4.json
   │  │  │  │           │  ├─ values-zh-rCN.json
   │  │  │  │           │  ├─ values-zh-rHK.json
   │  │  │  │           │  ├─ values-zh-rTW.json
   │  │  │  │           │  ├─ values-zu.json
   │  │  │  │           │  └─ values.json
   │  │  │  │           └─ single
   │  │  │  │              └─ mergeReleaseResources.json
   │  │  │  ├─ merged_shaders
   │  │  │  │  └─ release
   │  │  │  │     └─ mergeReleaseShaders
   │  │  │  │        └─ out
   │  │  │  ├─ merged_startup_profile
   │  │  │  │  └─ release
   │  │  │  │     └─ mergeReleaseStartupProfile
   │  │  │  ├─ metadata_library_dependencies_report
   │  │  │  │  └─ release
   │  │  │  │     └─ collectReleaseDependencies
   │  │  │  │        └─ dependencies.pb
   │  │  │  ├─ module_bundle
   │  │  │  │  └─ release
   │  │  │  │     └─ buildReleasePreBundle
   │  │  │  │        └─ base.zip
   │  │  │  ├─ navigation_json
   │  │  │  │  └─ release
   │  │  │  │     └─ extractDeepLinksRelease
   │  │  │  │        └─ navigation.json
   │  │  │  ├─ nested_resources_validation_report
   │  │  │  │  └─ release
   │  │  │  │     └─ generateReleaseResources
   │  │  │  │        └─ nestedResourcesValidationReport.txt
   │  │  │  ├─ optimized_processed_res
   │  │  │  │  └─ release
   │  │  │  │     └─ optimizeReleaseResources
   │  │  │  │        ├─ output-metadata.json
   │  │  │  │        └─ resources-release-optimize.ap_
   │  │  │  ├─ packaged_manifests
   │  │  │  │  └─ release
   │  │  │  │     └─ processReleaseManifestForPackage
   │  │  │  │        ├─ AndroidManifest.xml
   │  │  │  │        └─ output-metadata.json
   │  │  │  ├─ packaged_res
   │  │  │  │  └─ release
   │  │  │  │     └─ packageReleaseResources
   │  │  │  │        ├─ drawable-anydpi-v4
   │  │  │  │        │  └─ shortcut_legacy_background.xml
   │  │  │  │        ├─ drawable-hdpi-v4
   │  │  │  │        │  ├─ ic_notification_icon.png
   │  │  │  │        │  └─ splash.png
   │  │  │  │        ├─ drawable-mdpi-v4
   │  │  │  │        │  ├─ ic_notification_icon.png
   │  │  │  │        │  └─ splash.png
   │  │  │  │        ├─ drawable-xhdpi-v4
   │  │  │  │        │  ├─ ic_notification_icon.png
   │  │  │  │        │  └─ splash.png
   │  │  │  │        ├─ drawable-xxhdpi-v4
   │  │  │  │        │  ├─ ic_notification_icon.png
   │  │  │  │        │  └─ splash.png
   │  │  │  │        ├─ drawable-xxxhdpi-v4
   │  │  │  │        │  ├─ ic_notification_icon.png
   │  │  │  │        │  └─ splash.png
   │  │  │  │        ├─ mipmap-anydpi-v26
   │  │  │  │        │  └─ ic_launcher.xml
   │  │  │  │        ├─ mipmap-hdpi-v4
   │  │  │  │        │  ├─ ic_launcher.png
   │  │  │  │        │  └─ ic_maskable.png
   │  │  │  │        ├─ mipmap-mdpi-v4
   │  │  │  │        │  ├─ ic_launcher.png
   │  │  │  │        │  └─ ic_maskable.png
   │  │  │  │        ├─ mipmap-xhdpi-v4
   │  │  │  │        │  ├─ ic_launcher.png
   │  │  │  │        │  └─ ic_maskable.png
   │  │  │  │        ├─ mipmap-xxhdpi-v4
   │  │  │  │        │  ├─ ic_launcher.png
   │  │  │  │        │  └─ ic_maskable.png
   │  │  │  │        ├─ mipmap-xxxhdpi-v4
   │  │  │  │        │  ├─ ic_launcher.png
   │  │  │  │        │  └─ ic_maskable.png
   │  │  │  │        ├─ raw
   │  │  │  │        │  └─ web_app_manifest.json
   │  │  │  │        ├─ values
   │  │  │  │        │  └─ values.xml
   │  │  │  │        └─ xml
   │  │  │  │           ├─ filepaths.xml
   │  │  │  │           └─ shortcuts.xml
   │  │  │  ├─ r8_art_profile
   │  │  │  │  └─ release
   │  │  │  │     ├─ expandReleaseArtProfileWildcards
   │  │  │  │     │  └─ baseline-prof.txt
   │  │  │  │     └─ minifyReleaseWithR8
   │  │  │  │        └─ baseline-prof.txt
   │  │  │  ├─ r8_metadata
   │  │  │  │  └─ release
   │  │  │  │     └─ minifyReleaseWithR8
   │  │  │  │        └─ r8-metadata.dat
   │  │  │  ├─ runtime_symbol_list
   │  │  │  │  └─ release
   │  │  │  │     └─ processReleaseResources
   │  │  │  │        └─ R.txt
   │  │  │  ├─ sdk_dependency_data
   │  │  │  │  └─ release
   │  │  │  │     └─ sdkReleaseDependencyData
   │  │  │  │        └─ sdkDependencyData.pb
   │  │  │  ├─ signing_config_versions
   │  │  │  │  └─ release
   │  │  │  │     └─ writeReleaseSigningConfigVersions
   │  │  │  │        └─ signing-config-versions.json
   │  │  │  ├─ source_set_path_map
   │  │  │  │  └─ release
   │  │  │  │     └─ mapReleaseSourceSetPaths
   │  │  │  │        └─ file-map.txt
   │  │  │  ├─ stable_resource_ids_file
   │  │  │  │  └─ release
   │  │  │  │     └─ processReleaseResources
   │  │  │  │        └─ stableIds.txt
   │  │  │  ├─ symbol_list_with_package_name
   │  │  │  │  └─ release
   │  │  │  │     └─ processReleaseResources
   │  │  │  │        └─ package-aware-r.txt
   │  │  │  ├─ validate_signing_config
   │  │  │  │  └─ release
   │  │  │  │     └─ validateSigningRelease
   │  │  │  └─ version_control_info_file
   │  │  │     └─ release
   │  │  │        └─ extractReleaseVersionControlInfo
   │  │  │           └─ version-control-info.textproto
   │  │  ├─ outputs
   │  │  │  ├─ apk
   │  │  │  │  └─ release
   │  │  │  │     ├─ app-release-unsigned.apk
   │  │  │  │     ├─ baselineProfiles
   │  │  │  │     │  ├─ 0
   │  │  │  │     │  │  └─ app-release-unsigned.dm
   │  │  │  │     │  └─ 1
   │  │  │  │     │     └─ app-release-unsigned.dm
   │  │  │  │     └─ output-metadata.json
   │  │  │  ├─ bundle
   │  │  │  │  └─ release
   │  │  │  │     └─ app-release.aab
   │  │  │  ├─ logs
   │  │  │  │  └─ manifest-merger-release-report.txt
   │  │  │  ├─ mapping
   │  │  │  │  └─ release
   │  │  │  │     ├─ configuration.txt
   │  │  │  │     ├─ mapping.txt
   │  │  │  │     ├─ seeds.txt
   │  │  │  │     └─ usage.txt
   │  │  │  └─ sdk-dependencies
   │  │  │     └─ release
   │  │  │        └─ sdkDependencies.txt
   │  │  └─ tmp
   │  │     └─ compileReleaseJavaWithJavac
   │  │        └─ previous-compilation-data.bin
   │  ├─ build.gradle
   │  └─ src
   │     └─ main
   │        ├─ AndroidManifest.xml
   │        ├─ java
   │        │  └─ de
   │        │     └─ schabuss
   │        │        └─ midas
   │        │           ├─ Application.java
   │        │           ├─ DelegationService.java
   │        │           └─ LauncherActivity.java
   │        └─ res
   │           ├─ drawable-anydpi
   │           │  └─ shortcut_legacy_background.xml
   │           ├─ drawable-hdpi
   │           │  ├─ ic_notification_icon.png
   │           │  └─ splash.png
   │           ├─ drawable-mdpi
   │           │  ├─ ic_notification_icon.png
   │           │  └─ splash.png
   │           ├─ drawable-xhdpi
   │           │  ├─ ic_notification_icon.png
   │           │  └─ splash.png
   │           ├─ drawable-xxhdpi
   │           │  ├─ ic_notification_icon.png
   │           │  └─ splash.png
   │           ├─ drawable-xxxhdpi
   │           │  ├─ ic_notification_icon.png
   │           │  └─ splash.png
   │           ├─ mipmap-anydpi-v26
   │           │  └─ ic_launcher.xml
   │           ├─ mipmap-hdpi
   │           │  ├─ ic_launcher.png
   │           │  └─ ic_maskable.png
   │           ├─ mipmap-mdpi
   │           │  ├─ ic_launcher.png
   │           │  └─ ic_maskable.png
   │           ├─ mipmap-xhdpi
   │           │  ├─ ic_launcher.png
   │           │  └─ ic_maskable.png
   │           ├─ mipmap-xxhdpi
   │           │  ├─ ic_launcher.png
   │           │  └─ ic_maskable.png
   │           ├─ mipmap-xxxhdpi
   │           │  ├─ ic_launcher.png
   │           │  └─ ic_maskable.png
   │           ├─ raw
   │           │  └─ web_app_manifest.json
   │           ├─ values
   │           │  ├─ colors.xml
   │           │  └─ strings.xml
   │           └─ xml
   │              ├─ filepaths.xml
   │              └─ shortcuts.xml
   ├─ build
   │  └─ reports
   │     └─ problems
   │        └─ problems-report.html
   ├─ build.gradle
   ├─ gradle
   │  └─ wrapper
   │     ├─ gradle-wrapper.jar
   │     └─ gradle-wrapper.properties
   ├─ gradle.properties
   ├─ gradlew
   ├─ gradlew.bat
   ├─ hs_err_pid24308.log
   ├─ keystore.properties
   ├─ keystore.properties.example
   ├─ local.properties
   ├─ manifest-checksum.txt
   ├─ settings.gradle
   ├─ store_icon.png
   └─ twa-manifest.json

```