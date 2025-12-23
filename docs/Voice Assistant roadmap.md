---

# MIDAS â€“ Voice Assistant, Butler & Foodcoach

**Roadmap (Dev View, v6 â€“ Codex-ready)**

**Ziel:**
MIDAS wird ein modularer Gesundheits-Helper, der:

* per **Voice** Panels steuert, Wasser/Protein loggt und ZustÃ¤nde erklÃ¤rt (Butler-Modus)
* per **Text & Foto** Mahlzeiten analysiert und beim Loggen unterstÃ¼tzt (Foodcoach)
* spÃ¤ter sauber als **PWA/TWA** lÃ¤uft â€“ mit stabilem Auth & Persistent Login

**Wichtig fÃ¼r Codex:**
Diese Roadmap beschreibt *Phasen*, keine einzelnen Prompts.  
Jede Phase wird separat umgesetzt (eigener Branch / eigener Prompt).  
Innerhalb einer Phase nur an den explizit genannten Dateien/Modulen arbeiten und keine neuen Features aus anderen Phasen vorziehen.
**Status-Hinweis:** Voice ist derzeit geparkt; das Modul liegt in `app/modules/assistant-stack/voice/index.js`, VAD in `app/modules/assistant-stack/vad/`.

---

## Phase 0 â€“ Core Foundations / Bootstrap Layer

**Ziel:**
Vom Prototyp zur stabilen App: deterministischer Boot, klarer Auth-State, kein â€žhalb initialisiertâ€œ.
**Wichtig:** Kein Persistent Login in dieser Phase, nur die Basis.

| Task                       | Status | Beschreibung |
| -------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------- |
| 0.1 Bootstrap Flow rebuild | OK | Neuer Bootfluss: `BOOT â†’ AUTH_CHECK â†’ INIT_CORE â†’ INIT_MODULES â†’ INIT_UI â†’ IDLE`. UI bleibt geblockt, bis Supabase + Auth + Basis-Konfig bestÃ¤tigt sind. Umsetzung primÃ¤r in `index.html`, `app/core/boot-flow.js`, `assets/js/main.js`. |

Phase 0.1 Dateiliste

index.html:7,572-620 â€“ Body und Script-Loader. OK
- ErgÃ¤nze data-boot-stage + aria-busy auf <body> sowie ein kleines <div id="bootScreen">, das Hub/Forms blockiert, bis Stage IDLE erreicht ist. Der Loader bekommt Platz dicht hinter <body> damit app/styles/base.css ihn per Klassen (body[data-boot-stage="boot"]) dimmen kann.
- Im Script-Block (Zeileâ€¯572ff.) muss app/core/boot-flow.js neu vor allen anderen Bundles eingebunden werden, damit AppModules.bootFlow verfÃ¼gbar ist, bevor hub/index.js, boot-auth.js oder assets/js/main.js loslaufen.

app/styles/base.css (lines 98-111) (+ AnhÃ¤nge in app/styles/auth.css) â€“ Globale Sperr-States. OK
- ZusÃ¤tzlich zu body.auth-locked main brauchst du Selektoren fÃ¼r body[data-boot-stage] (z.â€¯B. body.boot-block main { pointer-events:none; opacity:.25; }) und Stile fÃ¼r #bootScreen (fixe Position, Spinner, Stage-Label). So bleibt der komplette Hub visuell blockiert, bis bootFlow auf IDLE wechselt.
- ErgÃ¤nze Transition-Tokens (z.â€¯B. CSS-Variablen fÃ¼r Statusfarben), damit Stage-Text (â€žBOOTâ€œ, â€žAUTH_CHECKâ€œâ€¦ ) sichtbar wird.

Neue Datei app/core/boot-flow.js. OK
- EnthÃ¤lt die Stage-Definition (const STAGES = ['BOOT','AUTH_CHECK','INIT_CORE','INIT_MODULES','INIT_UI','IDLE']), setStage/whenStage/onStageChange APIs sowie DOM-Side-Effects (Body-Dataset, #bootScreen Text, Logging). Binde sie unter window.AppModules.bootFlow.
- ZustÃ¤ndig auch fÃ¼r Timeout/Fehlerhandling (falls Stage hÃ¤ngt â†’ setConfigStatus('Boot hÃ¤ngt', 'error')).

assets/js/main.js (lines 1114-1495). OK
- Zerlege main() nach Stage-Funktionen:
runBoot() (DOM ready, ensureModulesReady, diag.init),
runAuthCheck() (wartet auf waitForSupabaseApi, requireSession, afterLoginBoot, setupRealtime),
initCore() (DB/init, capture state seeds, AppModules.captureGlobals Reset),
initModules() (bind tabs/buttons, watchers, midnight/noon timers, bindAppLockButtons, config fetch),
initUiAndLiftLock() (erster requestUiRefresh, remove overlays, enable inputs).
Jede Phase ruft bootFlow.setStage(...).
- Entferne doppelte DOMContentLoaded-WarteblÃ¶cke (Zeileâ€¯1114-1119, 1483-1495) und ersetze sie durch bootFlow.whenStage.
- Die Failsafe-Schritte (z.â€¯B. Buttons wieder aktivieren, Onlinesync) bleiben, laufen aber nur nach INIT_UI.

assets/js/boot-auth.js (lines 1-40). OK
- Statt sofort initAuth zu callen, registriert das Modul seine Hooks erst, wenn bootFlow.whenStage('AUTH_CHECK', ...) erreicht ist. Im Hook onStatus rufst du bootFlow.setStage('INIT_CORE'), sobald status !== 'unknown' (Supabase hat Auth entschieden). AuÃŸerdem liefert das Modul Status-Text an den Loader (bootFlow.report('PrÃ¼fe Sessionâ€¦')).

app/supabase/auth/core.js (lines 291-320). OK
- Nach supabaseState.booted = true (Zeileâ€¯292) informieren wir den Boot-Flow, dass Auth fertig ist (AppModules.bootFlow?.markAuthReady()), damit INIT_CORE nicht vorzeitig durchlÃ¤uft.
- In finalizeAuthState und requireSession sollte der neue Stage-Manager getriggert werden, wenn authState zu auth/unauth wechselt, damit UI-Block sauber aufgehoben wird und Fehler (kein Supabase-Client) direkt auf dem Bootscreen landen (setConfigStatusSafe + bootFlow.fail('Supabase Client fehlt')).

app/modules/hub/index.js (lines 1500-1504). OK
- Der Hub initialisiert aktuell sofort nach DOM ready. Schieb activateHubLayout() hinter AppModules.bootFlow.whenStage('INIT_UI', activateHubLayout) und fÃ¼ge body[data-boot-stage!="IDLE"]-Checks in allen Orbit-Klick-Handlern hinzu (so bleiben Buttons inaktiv solange Stage < INIT_UI). Optional: BootFlow liefert lockReason â†’ Zeige im Panel-Header â€žHub lÃ¤dtâ€¦â€œ.

app/modules/doctor/index.js & app/modules/capture/index.js. OK
- Beide Module greifen beim Laden bereits auf DOM zu. ErgÃ¤nze am Anfang Guard-Code if (!AppModules.bootFlow?.isStageAtLeast('INIT_MODULES')) return; fÃ¼r Handler, die vom Boot-Overlay aus ausgelÃ¶st werden kÃ¶nnten, und registriere ihre globalen window.AppModules.* APIs erst nach INIT_CORE. Damit kollidiert der Stage-Lock nicht mit Legacy-Tab-Aufrufen.

app/core/config.js & assets/js/ui.js.OK
- config.js erhÃ¤lt optional einen Flag (window.BOOT_STAGE_DEBUG) plus body.dataset.bootStageDebug, womit QA bootFlow zwingen kann, im Loader zu verbleiben.
- ui.js (hier laufen setUnderlayInert, Help-Panel etc.) muss bootFlow.whenStage('INIT_UI', () => bindHelpPanel()) verwenden, damit Modals nicht starten, solange #bootScreen oben ist.

Diese Ãœbersicht liefert dir eine roadmap, welche Stellen fÃ¼r den neuen deterministischen Boot-Prozess angefasst werden mÃ¼ssen. Sobald du loslegen willst, gehen wir Datei fÃ¼r Datei durch und setzen die beschriebenen Anpassungen um.

| 0.2 Cleanup Pass (Light)   | OK  | Erste Runde: alte Logger/Workarounds raus, doppelte Listener/Guards entschÃ¤rfen, dead code entfernen, `/core` minimal entschlacken. Nur offensichtliche Altlasten entfernen, keine tiefen Refactors (die kommen in Phase 6).         |

Hier ist die To-do-Liste fÃ¼r Phaseâ€¯0.2 (â€žCleanup Pass Lightâ€œ) mit konkreten Dateien und Arbeiten â€“ exakt an diese Stellen mÃ¼ssen wir ran, bevor wir neue Features anpacken:

assets/js/main.js OK
- Zeilen ~1500/1536: Es existieren zwei window.addEventListener('focus', â€¦)-Handler (einer triggert Resume, einer maybeRefreshForTodayChange). FÃ¼r den Cleanup mÃ¼ssen wir diese Listener zusammenfÃ¼hren, damit der Fokuswechsel nur genau einen Pfad auslÃ¶st (sonst laufen Resume + Day-Refresh doppelt und erzeugen unnÃ¶tige Logs).
- Im Rahmen desselben Blocks prÃ¼fen wir, ob resumeEventHandler im Hidden-State laufen sollte (jetzt feuert jeder Focus auch mitten im Boot â€“ ggf. eine Stage-PrÃ¼fung hinzufÃ¼gen).
- AuÃŸerdem sollten wir den verbleibenden console.error('Boot failed', err); am Ende nur noch Ã¼ber diag.add loggen, sobald Phaseâ€¯0 fertig ist.

assets/js/boot-auth.js OK
- console.info("Auth status:", status) loggt bei jedem Statuswechsel, was wir laut Cleanup-Plan vermeiden wollen. Ziel: Ã¼ber diag loggen oder nur im Debug-Modus, damit Boot nicht von permanenten console-Spam begleitet wird.
- PrÃ¼fen, ob wir die Stage-Aktualisierung (aktueller Guard advanceStageToInitCore) kommentiert dokumentieren, damit keine Doppel-Transitions passieren.

app/modules/hub/index.js OK
- Zwischen Zeile ~392 und ~1370 finden sich viele console.info-/console.warn-Statements (z.â€¯B. [assistant-chat] setupAssistantChat called, [midas-voice] Assistant reply). FÃ¼r Phaseâ€¯0.2 sollen wir diese offensichtlichen console.*-Spuren entfernen oder hinter einem Debug-Flag verstecken (z.â€¯B. if (AppModules.config?.DEV_ALLOW_DEFAULTS)), und die relevanten Ereignisse lieber an diag.add melden.
- Gleiches Modul hat jetzt Boot-Guards. Wir sollten kontrollieren, dass die console.warn('[hub] Supabase webhookKey missing â€¦') Meldungen weiterhin Sinn ergeben; falls nicht, Ã¼ber diag.

app/modules/assistant-stack/assistant/actions.js OK
- EnthÃ¤lt Ã¼ber 20 console.log-/console.warn-Zeilen (Zeilen 195â€“400, 430ff). FÃ¼r den Cleanup entweder Ã¼ber einen dedizierten assistantLogger laufen lassen oder auf diag.add umbauen. Ziel: Production-Konsole abschalten.
- Gleichzeitig prÃ¼fen, ob verwaiste Actions (z.â€¯B. TransitionToTextChat, ReadTouchlog) doppelt implementiert sind. Alles, was offensichtlich nie aufgerufen wird, markieren.

app/modules/assistant-stack/assistant/index.js OK
- Ã„hnlich wie oben: console.info fÃ¼r Panel-Events â†’ auf diag/Debug umstellen.

assets/js/ui.js OK
- Nach unserem letzten Update muss waitForInitUi sicherstellen, dass auch focusTrap / setUnderlayInert keine Logs werfen. Checken, ob hier noch console.warn (missing panel) sinnvoll oder per diag geloggt werden sollte.

assets/js/main.js (zweiter Punkt) OK
- ensureModulesReady (Zeile ~800) hat noch eine generische DOM-Fehlermeldung. FÃ¼r den Cleanup sollten wir den Text kÃ¼rzen und console.error komplett durch UI-Banner & diag ersetzen, um Boot-Logs sauber zu halten.
- Zudem startBootProcess() ruft main().catch und loggt via console.error â€“ auch hier diag.

app/core/diag.js OK
- EnthÃ¤lt Fallback console.warn / console.info, wenn Diagnostics off sind. Wir sollten dokumentieren, dass das bewusst so bleibt, aber im Cleanup evtl. ein einheitliches Flag (if (global.DIAGNOSTICS_ENABLED)) nutzen und den Rest stumm schalten.

app/modules/capture/index.js & app/modules/doctor/index.js OK
- Beide Dateien haben neue Boot-Guards. FÃ¼r Phaseâ€¯0.2 mÃ¼ssen wir prÃ¼fen, ob es noch alte, ungenutzte Funktionen/Listener gibt (z.â€¯B. bindLifestyle, resetCapturePanels), die nie aufgerufen werden â€“ offensichtliche Dead-Ends rausnehmen oder markieren.
- AuÃŸerdem sicherstellen, dass window.AppModules.capture/doctor keine Legacy-Globals (global.renderDoctor) mehr doppelt registrieren â€“ das war die Quelle vergangener Warnungen.

app/supabase/auth/core.js OK
- console.info wird hier nicht verwendet, aber reportBootStatus()/markFailed() kÃ¶nnte noch console.* werfen, sobald Diagnostics deaktiviert sind. Im Cleanup verifizieren, dass Boot-Status ausschlieÃŸlich Ã¼ber bootFlow.report > setConfigStatus kommuniziert wird.

assets/js/data-local.js OK
- EnthÃ¤lt mehrere console.warn (z.â€¯B. bei fehlenden Indizes). Wir sollen diese nur noch im Dev-Flag ausgeben und sonst Ã¼ber diag/report. PrÃ¼fen, ob ensureDbReady bei Fehlern BootFlow bereits markiert â€“ falls nein, in Phaseâ€¯0.2 hinzufÃ¼gen.

| 0.3 Auth Flow Fix          | OK   | Pre-render Auth Gate: App rendert erst nach Supabase-Entscheid (`auth` / `unauth`). Kein klickbares UI im â€žauth unknownâ€œ. Klare `authState`-ÃœbergÃ¤nge in `app/supabase/auth/core.js` und `assets/js/boot-auth.js`.                     |

Phaseâ€¯0.3 needs a tighter auth gate. Hereâ€™s the file-by-file plan:

assets/js/boot-auth.js OK
Enforce preâ€‘render gate. Right now bootAuth() advances the boot stage as soon as onStatus fires with anything not strictly 'unknown', so the UI can unfreeze while Supabase is still checking. We need to let bootFlow know when status transitions to 'unknown', 'auth', or 'unauth', and only call setStage('INIT_CORE') after the first definite decision. While waiting, keep reporting â€œPrÃ¼fe Session â€¦â€ so the loader stays up, and once a final state arrives, report â€œSession okâ€ or â€œNicht angemeldet â€“ Login erforderlichâ€. Also pass a flag (e.g. bootFlow.lockReason = 'auth-check') so other modules can block interactions until the stage flips.

app/supabase/auth/core.js OK
Normalize authState transitions and UI locking. applyAuthUi only toggles the lock for true/false and skips 'unknown'. We need to treat 'unknown' as a locked state: set body.auth-locked, keep login overlay hidden but render a â€œBitte wartenâ€ message, and surface the lock reason via bootFlow.report. During scheduleAuthGrace the UI should stay inert. Also ensure finalizeAuthState, scheduleAuthGrace, and requireSession all run through a single setAuthState(nextState) helper that notifies bootFlow and boot-auth.js of every state change. That keeps authHooks.onStatus consistent and avoids double transitions.

assets/js/main.js OK
Gate boot stages to auth. runBootPhase currently goes straight from AUTH_CHECK to INIT_CORE once ensureModulesReady passes. Update it so runAuthCheckPhase waits for a resolved auth decision (maybe by awaiting a promise exposed by boot-auth.js or AppModules.supabase.authReady). Only after authState becomes 'auth' or 'unauth' should we call setBootStage('INIT_CORE'). Additionally, when authState is 'unknown', resume handlers and interaction logic should early-return to avoid clicks.

app/styles/base.css / app/styles/auth.css OK
Visual lock for auth gate. Ensure thereâ€™s a style for body.auth-unknown (or reuse auth-locked) that keeps inputs inert and shows a short message on the boot overlay. We already dim via body.auth-locked, but for Phaseâ€¯0.3 we need a distinct class so UX can show â€œSupabase prÃ¼ft Session â€¦â€.

app/modules/hub/index.js, app/modules/capture/index.js, etc.
Honor the new auth gate. Each module that currently checks AppModules.bootFlow?.isStageAtLeast('INIT_UI') should also check supabaseState.authState !== 'unknown' (hooked via a helper exported from app/supabase/auth/core.js). For example, handleCaptureIntake, renderDoctor, hub button handlers, etc., should bail immediately when the new auth gate reports â€œunknownâ€.

docs/Voice Assistant roadmap.md / QA docs OK
Document the new auth gate. Update the roadmap and QA checklist to mention that the app doesnâ€™t render or accept input until Supabase returns auth/unauth, and add test steps (e.g., â€œsimulate slow Supabase; UI stays locked, boot overlay shows statusâ€).

Once these changes are in place, Phaseâ€¯0.3â€™s requirementsâ€”pre-render auth gate, no clickable UI while auth status is unknown, and clarified state transitions in app/supabase/auth/core.js plus assets/js/boot-auth.jsâ€”will be satisfied.

| 0.4 Voice Safety Init      | OK   | Voice-Nadel + VAD warten auf bootFlow=IDLE **und** eine entschiedene Supabase-Auth. Auth-Drops stoppen Aufnahme/TTS sofort, Orbit zeigt den Sperrstatus.          |

Phase 0.4 Abschluss:

- app/modules/hub/index.js : Voice-Gate-API (getVoiceGateStatus, isVoiceReady, onVoiceGateChange) blockt Needle/VAD/Resume solange Boot/Auth offen sind und loggt [voice] gate .... Bei Auth-Drop werden Recorder, Streams und Conversations beendet.
- app/modules/assistant-stack/vad/vad.js  + Worklet checken den Gate vor start() und stoppen sofort mit [vad] stop due to voice gate lock, wenn Auth zur?ck auf unknown f?llt.
- app/modules/assistant-stack/assistant/session-agent.js  beendet Voice-Sessions automatisch, sobald der Gate schlie?t, und schreibt die Systemmeldung ?Voice deaktiviert ? bitte warten?, damit keine neuen Prompts starten.
- app/styles/hub.css liefert body.voice-locked + .hub-core-trigger.is-voice-locked (gedimmte Orbit/Rings, Tooltip ?Voice aktiviert sich nach dem Start?, pointer-events:none).
- assets/js/main.js pr?ft Voice-Gate pro Visibility/PageShow/Focus-Resume und ?berspringt 
esumeFromBackground, solange Voice/Boot/Auth blockiert sind.
- docs/QA_CHECKS.md, dieses Dokument und die Modul-Overviews (Hub, Assistant, VAD) enthalten jetzt die Voice-Safety-Guidelines + QA-Schritte (Slow Supabase, Mid-Session-Logout).

- 0.5: Touchlog Cleanup (Deterministic Event Trace)
Status: TODO
Beschreibung:
Der Touchlog wird bereinigt, dedupliziert und deterministisch gemacht. Ziel: Jeder User-Input wird genau einmal geloggt, in klarer Reihenfolge, ohne Doppel-Events durch parallele Listener oder frÃ¼he/late-Boot-ZustÃ¤nde. Alte Workarounds, doppelte Writes, Ã¼berlagernde Pointer-/Mouse-/Touch-Handler werden entfernt oder vereinheitlicht. Logging lÃ¤uft ausschlieÃŸlich Ã¼ber touchLog.add() mit sauberem Event-Typ (tap, longpress, cancel, dragstart, â€¦). Ergebnis: Ein stabiler, minimaler und nachvollziehbarer Input-Trace, der Debugging & QA deutlich vereinfacht.

| 0.5 Touchlog Cleanup (Deterministic Trace) | TODO | Reduziere Touch-Log auf eindeutige Events: keine doppelten [capture] loadIntakeToday, [conf] getConf, [auth] getUserId oder UI-Refresh-Bl?cke w?hrend Boot/Resume. Konzentriert sich auf Log-Pipeline und Guards, keine Feature-?nderungen. **QA-Hinweis:** In docs/QA_CHECKS.md stehen die neuen Smoke-Schritte (Boot, manuelles Refresh, Resume), die sicherstellen, dass pro Reason genau ein Start/Ende geloggt wird. |

Touchlog Cleanup Fokus:

assets/js/main.js OK
- Boot/Resume Logging ([ui] refresh start/end, startBootProcess) l?uft derzeit mehrfach; f?ge eine Debounce/Guard-Ebene ein, damit jeder Reason nur einmal pro Boot/Resume protokolliert wird.
- Erg?nze einen kleinen Log-Deduper (logOncePerTick(key, message)) f?r Boot-Phase, damit identische Zeilen (z. B. [ui] step start doctor) nicht mehrfach erscheinen.

app/modules/hub/index.js OK
- Debug-Ausgaben ([hub:debug] assistant-chat setup...) feuern in Bl?cken bei jedem init. Halte sie hinter einem Flag oder logge nur beim ersten Setup.
- Click-/State-Logs sollen nur Benutzeraktionen (Needle, Panels) erfassen, nicht Hintergrund-Retries.

app/modules/capture/index.js & app/modules/doctor/index.js OK
- Boot- und Resume-Hooks rufen 
efreshCaptureIntake/
enderDoctor mehrfach; stelle sicher, dass [capture] loadIntakeToday start/done nur ausgegeben wird, wenn der Request tats?chlich anl?uft (kein zweites Mal mit identischem Reason).
- Erg?nze Reason-Tags (boot/resume/manual) und dedupe pro Reason.

app/supabase/auth/core.js OK
- getUserId start/done, conf getConf start/done, [auth] request sbSelect... werden durch parallele Promises doppelt geloggt. F?hre eine in-flight Map ein, die Logs pro Key zusammenfasst (ein Start, ein Done, optional (+N) f?r Re-Runs).

app/core/diag.js OK
- Implementiere Touchlog-Throttling: wenn dieselbe Message innerhalb weniger Millisekunden erneut auftaucht, erh?he einen Z?hler statt eine neue Zeile hinzuzuf?gen ([capture] loadIntakeToday done ... (x3)).

app/core/diag.js OK
- central touchâ€‘log renderer. Expand the throttle window (e.g. sliding 3â€‘5â€¯s per message key), add reason-aware hashing, and support severity tags + per-event IDs so repeats render as (xN) even when spaced apart. Also add a small buffer for â€œsummaryâ€ entries (boot done, resume done) that collapse multiple internal steps.

assets/js/main.js OK
- still orchestrates boot/resume logs. Ensure startBootProcess, runBootPhase, runAuthCheckPhase, and resume handlers emit exactly one â€œstart/endâ€ pair per reason and push a high-level summary instead of step-by-step [ui] step start doctor. Consider moving detailed sub-step logs behind a DEBUG_TOUCHLOG flag.

app/modules/hub/index.js OK
- hub debug spam ([hub:debug] assistant-chat â€¦). Wrap all diagnostic chatter behind a runtime flag (e.g. AppModules.config?.LOG_HUB_DEBUG). Only user-facing actions (needle click, tab switch) should hit the touch log; retries/auto-setup should write to diag only when failing.

app/modules/capture/index.js & app/modules/doctor/index.js OK
- they still log every refresh start/done. Add dedupe caches keyed by {reason, day} and emit a single [capture] refresh reason=boot â€¦ line with (xN) counters when the same refresh fires again before finishing. Similar treatment for doctor view refresh/render logs.

assets/js/data-local.js & app/supabase/auth/core.js OK
- we already dedupe concurrent getConf/getUserId, but sequential reads still print each start. Add a per-boot cache: once a key has been read successfully, skip logging further â€œstartâ€ entries unless a new boot/resume cycle begins.

app/supabase/core/http.js OK
- throttle [auth] request start/end â€¦ lines per tag; multiple identical requests inside boot should collapse into a single entry with (+N) plus timing stats. Include failure details only when statusâ‰ 200.

docs/QA_CHECKS.md & module overview docs OK
- document the new touch-log expectations (one entry per logical action, duplicates collapsed) so QA can verify the enterprise log criteria.
- roadmap.md (dieser Abschnitt) + docs/QA_CHECKS.md: erg?nze QA-Schritte (Boot einmal, Touchlog durchsichten ? keine Duplikate; Trigger manuelles Refresh ? h?chstens ein Log-Paar pro Reason). Aktualisiere ggf. Module Overviews (Capture, Doctor, Auth, Diagnostics) mit Hinweis auf deterministische Logs.

This pass should leave the touch log with concise, high-level events (boot start/end, auth decision, capture refresh reason, voice gate changes) while detailed retries stay hidden unless explicitly enabled for debugging.

**Codex-Hinweis (Phase 0):**

- 0.2: Nur in bereits existierenden Loggern/Guards und offensichtlichen Workarounds aufrÃ¤umen (z. B. doppelte `DOMContentLoaded`-Listener, alte `console.log`-Spams). Keine neuen Features einbauen.
- 0.3: Auth-Flow vereinheitlichen, aber **kein** `persistSession` aktivieren; Persistent Login kommt erst in Phase 7.
- 0.4: Nur Voice/Hub-Modul absichern, keine neuen Voice-Features.

---

## Phase 1 â€“ Frontend Voice Controller (DONE)

**Ziel:**
Voice-State-Machine im Hub: Aufnahme â†’ Transcribe â†’ Assistant â†’ TTS â†’ Playback.

Code-Schwerpunkt: `app/modules/hub/index.js` + zugehÃ¶rige Styles/Skripte.

| Task                       | Status | Beschreibung                                                   |
| -------------------------- | ------ | -------------------------------------------------------------- |
| 1.1 Audio Capture Skeleton | OK      | MediaRecorder, State-Handling, Blob-Logging.                   |
| 1.2 Transcribe Integration | OK      | `/midas-transcribe`, `thinking`-State, Transcript-Logging.     |
| 1.3 Assistant Roundtrip    | OK      | History â†’ `/midas-assistant`; Reply + Actions werden geparst.  |
| 1.4 TTS Playback           | OK      | `/midas-tts`, `<audio>`-Pipeline inkl. Interrupt/Retry.        |
| 1.5 Glow-Ring Animation    | OK      | Idle/Listening/Thinking/Speaking/Error â†’ Ring/Aura.            |
| 1.6 Needle Trigger Feedba. | OK      | Button steuert Session, inkl. Press-Animation.                 |
| 1.7 Auto-stop via VAD      | OK      | 1 s Stille stoppt Aufnahme (Worklet in `app/modules/assistant-stack/vad`). |
| 1.8 Conversation Loop End  | OK      | Phrasen wie â€žnein dankeâ€œ beenden die Session sauber.           |

---

## Phase 2 â€“ Backend â€“ Supabase Edge Functions (DONE)

**Ziel:**
Stabile KI-Funktionen ohne Browser-Keys.

Code-Schwerpunkt: Supabase Edge Functions unter `supabase/functions/*`.

| Task               | Status | Beschreibung                                                                         |
| ------------------ | ------ | ------------------------------------------------------------------------------------ |
| `midas-transcribe` | OK      | Whisper (`gpt-4o-transcribe`), FormData Upload, CORS, Logging.                       |
| `midas-assistant`  | OK      | Responses API, System Prompt, Text & Voice Mode, liefert `{ reply, actions, meta }`. |
| `midas-tts`        | OK      | `gpt-4o-mini-tts` (Voice â€žcedarâ€œ), liefert Base64 oder Raw Audio.                    |
| `midas-vision`     | OK      | Foto-Proxy â†’ `gpt-4.1-mini`, liefert Wasser/Salz/Protein + Empfehlung.               |

**Hinweis:**
In `midas-assistant` ist bereits eine feste System-Persona hinterlegt: MIDAS versteht sich als â€žMedical Incidents and Data Analysis Softwareâ€œ und persÃ¶nlicher Gesundheits-Assistent von Stephan (inkl. Voice/Text-Mode-Unterscheidung).  
SpÃ¤ter greift diese Persona zusÃ¤tzlich auf das Health-Profil aus Phase 4.4 zu (d. h. dort wird nur zusÃ¤tzlicher Kontext + DB-Read ergÃ¤nzt, keine komplette Neuschreibung).

---

## Phase 3 ? Assistant UI ? Textchat & Fotoanalyse

**Ziel:**
Textchat wird zur prim?ren Assistant-Oberfl?che. Beim ?ffnen des Panels l?dt MIDAS automatisch Intakes und Termine, damit jede Antwort ? inklusive Fotoanalysen ? den Tageskontext kennt. Voice bleibt als Long-Press-Shortcut verf?gbar, ist aber kein Hauptfeature mehr. Speichern findet in dieser Phase nicht statt.

UI-Schwerpunkt: pp/modules/hub/index.js (plus optionale Assistant-Templates/Styles).

| Task | Status | Beschreibung |
| --- | --- | --- |
| **3.1 Assistant Text UI** | ? | Hub-Center-Button (Short Press) ?ffnet ssistant-text. Panel l?dt still die heutigen Intake-Totals und (sobald verf?gbar) die n?chsten Termine, zeigt sie im Header und nutzt /midas-assistant f?r Antworten. |

FÃ¼r 3.1 brauchen wir im Wesentlichen zwei StrÃ¤nge: Frontend (Hub/Assistant-Panel) und die bereits vorhandenen Supabase Functions, die Antworten liefern. Hier die Datei- und AufgabenÃ¼bersicht:

index.html (Hub-Panel-Markup) OK
- Panel assistant-text existiert bereits, muss aber um den Butler-Header erweitert werden (Intake-Pills + Termin-Teaser).
- Platz fÃ¼r Suggest/Confirm-Card vorbereiten (auch wenn Phaseâ€¯5 erst speichert, brauchen wir hier die Slots).

app/modules/hub/index.js OK
EnthÃ¤lt schon assistantChatCtrl, Buttons, Camera-Flow, Session-Handling.
Anpassungen:
Beim Ã–ffnen des Panels (openPanelHandler('assistant-text')) still Intake- und Termin-Snapshot laden (z.â€¯B. via AppModules.capture + spÃ¤teres Termin-Modul) und im Header speichern.
Neues renderAssistantHeader() das die Werte in DOM schreibt.
Sicherstellen, dass MIDAS_ENDPOINTS.assistant weiterhin genutzt wird, aber Voice-spezifische Teile nur noch beim Long-Press greifen.
Short/Long-Press-Mapping auf den Center-Button umsetzen (derzeit zwei Buttons [data-hub-module="assistant-text"]/assistant-voice) â€“ nur relevant, falls Voice reaktiviert wird.
Logging/diag-Hooks aktualisieren (Phaseâ€¯0.5 Vorgaben beachten).

app/styles/hub.css / evtl. neue assistant-spezifische CSS OK
Styles fÃ¼r Butler-Header (Pills + Terminliste), Chat-Bubbles, Buttons.
Responsive Verhalten (Panelbreite, Scroll).

assets/js/data-local.js & vorhandene Intake-Helper OK
FÃ¼r den Header brauchen wir einen leichtgewichtigen Helper fetchTodayIntakeTotals() (evtl. bereits in capture-Module) â€“ prÃ¼fen, ob wir vorhandene AppModules.capture.refreshCaptureIntake oder AppModules.captureGlobals anzapfen kÃ¶nnen, ohne zusÃ¤tzliche Requests zu verursachen.

Termin-Daten (Phaseâ€¯4 Vorbereitung) OK
Solange kein Terminmodul existiert, kann ein Platzhalter/Mock (z.â€¯B. AppModules.appointments?.getUpcoming(2)) eingebaut werden. SpÃ¤ter gegen echte API austauschen.

app/modules/assistant-stack/assistant/index.js / actions.js OK
Falls zusÃ¤tzliche Helper fÃ¼r Chat-/Fotoanzeige nÃ¶tig sind (z.â€¯B. Formatierungen, Suggest-Card-Rendering), hier kapseln, damit der Hub-Code nicht weiter anwÃ¤chst.

Supabase Functions (Backend, anderes Repo C:\Users\steph\Projekte\midas-backend\supabase\functions): OK
midas-assistant/index.ts: Schon vorhanden, liefert { reply, actions, meta }. FÃ¼r Phaseâ€¯3.1 genÃ¼gt Endpunkt wie er ist.
midas-vision/index.ts: Fotoanalyse-Endpunkt; Frontend muss nur Base64-Upload â†’ Response darstellen.

Docs/QA (begleitend) OK
docs/modules/Assistant Module Overview.md und docs/QA_CHECKS.md spÃ¤ter anpassen, sobald UI final ist.
Damit haben wir die Ziel-Dateien und To-dos fÃ¼r 3.1 (reines UI/context building, keine SpeichervorgÃ¤nge) im Blick. Sobald wir loslegen, arbeiten wir nacheinander: Markup â†’ Logic (Hub) â†’ Styles â†’ optionale Helpers â†’ QA/Doku.

| **3.2 Foto-Analyse (UI)** | ? | Kamera/File ? Base64 ? /midas-vision ? Anzeige der Analyse (Wasser/Salz/Protein + Empfehlung) im selben Chat inkl. aktueller Intake-Pills. Reine Darstellung, kein Speichern. |

index.html (Assistant Panel) OK
Kamera-/Upload-Button existiert schon (#assistantCameraBtn); prÃ¼fen, ob wir ein zweites Tool fÃ¼r â€žDatei wÃ¤hlenâ€œ brauchen oder ob das bestehende Element beides abdeckt.
Platz fÃ¼r Foto-Previews innerhalb des Chatverlaufs einplanen (z.â€¯B. spezieller Bubble-Typ mit Thumbnail + Status â€žAnalyse lÃ¤uft â€¦â€œ).
Optional: kleine Statuszeile in der Suggest-Card reservieren, falls Vision-Empfehlungen dort landen sollen.

app/styles/hub.css OK
Neue Styles fÃ¼r Foto-Bubbles (Thumbnail, Loading-State, Analyse-Resultbox).
Responsives Verhalten (Thumbnails nicht zu groÃŸ, Buttons bleiben klickbar).
ZustÃ¤nde fÃ¼r Fehler/Retry (z.â€¯B. rote Border, Hinweistext).

app/modules/hub/index.js OK
Bestehenden Kamera-Button (assistantChatCtrl.cameraBtn + verstecktes <input type="file">) verdrahten:
Aufnahme â†’ lesen als Base64 (z.â€¯B. via FileReader).
Request an /api/midas-vision (bereits vorhandener Endpunkt).
WÃ¤hrenddessen Chat-Eintrag mit â€žAnalyse lÃ¤uft â€¦â€œ anzeigen.
Response anzeigen (Texte + Werte), ohne etwas zu speichern.
Fehlerpfad loggen (diag.add('[assistant-vision] â€¦')), UI mit Retry-Option versehen.
Sicherstellen, dass Intake-Pills nicht erneut abgefragt werden (wir nutzen die vorhandenen Snapshot-Helper).

app/modules/assistant-stack/assistant/index.js und/oder actions.js OK
Helfer kapseln, um Vision-Messages in den Chat einzuschieben (z.â€¯B. assistantUi.addPhotoMessage({ imageUrl, status, results })).
Falls wir Formatierungen (z.â€¯B. â€žWasser: 300â€¯mlâ€œ) oder Empfehlungstexte brauchen, hier vorbereiten, damit hub/index.js nur die Daten liefert.
Optional: Handler fÃ¼r Suggest-Card-BefÃ¼llung, falls Vision spÃ¤ter Speicherung triggert (Phaseâ€¯5).

Hilfsfunktionen / Utilities OK
Falls noch nicht vorhanden: Base64-Konverter (kann in app/modules/assistant-stack/assistant/index.js leben oder als kleiner Helper am Dateiende von hub/index.js).
Timeout-/Abort-Handling (z.â€¯B. AbortController) damit AbbrÃ¼che sauber laufen.

Backend-Verweis (separates Repo, keine Ã„nderung nÃ¶tig) OK
supabase/functions/midas-vision/index.ts bleibt wie er ist; nur sicherstellen, dass wir denselben Endpoint wie Phaseâ€¯3.1 nutzen (MIDAS_ENDPOINTS.vision).

Dokumentation / QA OK
docs/modules/Assistant Module Overview.md: Abschnitt â€žFoto-Analyseâ€œ ergÃ¤nzen (Flow, erwartete Werte, keine Speicherung).
docs/QA_CHECKS.md: TestfÃ¤lle aufnehmen (Foto hochladen, Analyse-Ergebnis erscheint im Chat, Fehlerfall zeigt Hinweis).

| **3.3 Diktiermodus (Input only)** | PLANNED | Web Speech API dient als optionaler Eingabehelfer und f?llt nur das Textfeld. Kein Voice-Loop, keine Aktionen. |
| **3.4 Hub Center Mapping** | OK| Center-Button vereint beide Modi: **Short Press** ?ffnet Text, **Long Press (~700?ms)** startet den bestehenden Voice-Loop (Desktop/Touch identisch, inkl. Cancel bei fr?hem mouseup/	ouchend). |
| **3.5 Butler-Panel Header** | OK | Kopfbereich zeigt Wasser/Salz/Protein-Pills und die n?chsten 1?2 Termine (read-only). Werte stammen aus bestehenden Tabellen und liefern Kontext f?r jede Antwort. |

> **Hinweis:** Kein Suggest-/Auto-Save in Phase?3. S?mtliche Schreibaktionen werden in Phase?5 umgesetzt.

## Phase 4 â€“ Domain Features & Utilities

**Ziel:**
MIDAS als Alltags-Tool vollstÃ¤ndig machen, bevor der Butler & Persistent Login kommen.

### 4.1 Vitals & Doctor â€“ Panel-Konsolidierung OK

**Ziel:**
Nur noch **ein** Hub-Entry fÃ¼r Blutdruck/KÃ¶rper, aber schneller Einstieg in Arzt-Ansicht **und** Chart.

**Betroffene Module:**

* Hub-Layout (`app/modules/hub/index.js` oder Hub-Konfiguration).
* Vitals-/Body-Input-Panel (Capture/Vitals-Module, z. B. `app/modules/capture/*`).
* Doctor-View (`app/modules/doctor/index.js` + ggf. Charts-Modul).

**Anpassungen:**

* Hub:

  * **Vitals-Orbit-Button** ersetzt die Doppelstruktur Vitals/Doctor am Hub (ein Icon, ein Entry).

* Vitals-Panel:

  * Eingabe Blutdruck (Morgen/Abend).
  * Eingabe KÃ¶rperdaten.
  * Button **â€žArzt-Ansichtâ€œ**:

    * nutzt bestehende `requireDoctorUnlock()`-Logik.
    * Ã¶ffnet Doctor-Ansicht klassisch (Werteliste, Trendpilot, Export, Delete).

  * Button **â€žDiagrammâ€œ**:

    * ebenfalls `requireDoctorUnlock()` nutzen (falls noch nicht freigeschaltet).
    * lÃ¤dt intern die Doctor-Ansicht, springt aber direkt ins SVG-Chart (z. B. Ã¼ber einen Parameter oder speziellen Initialisierungs-Mode).
    * UX: Klick auf â€žDiagrammâ€œ â†’ Arzt sieht direkt das Chart.
    * SchlieÃŸen (`X`) im Chart â†’ zeigt **Doctor-Ansicht** statt Hub (also im medizinischen Kontext bleiben).

* Ziel-Flows:

  * FÃ¼r den Arzt:

    * â€žEinzelwerte ansehen?â€œ â†’ Button â€žArzt-Ansichtâ€œ.
    * â€žNur Verlauf/Chart?â€œ â†’ Button â€žDiagrammâ€œ.

  * Beide Wege landen im gleichen â€žmedizinischen Raumâ€œ, nur mit unterschiedlichem Einstiegspunkt.

**Codex-Hinweis:**

- Keine neue Tabelle, keine neuen Supabase-Funktionen.
- Nur Routing/Umschalten der bestehenden Panels und Views umbauen.

---

FÃ¼r Phaseâ€¯4.1 greifen wir in drei Bereiche ein:

Hub-Layout (app/modules/hub/index.js) OK
Orbit-Konfiguration anpassen: Vitals-Button wird der einzige Eintrag fÃ¼r Blutdruck/KÃ¶rper; Doctor-Icon entfÃ¤llt.
Handler aktualisieren, damit der Vitals-Button immer das Vitals-/Body-Panel Ã¶ffnet (keine separaten Buttons mehr fÃ¼r Doctor).

Capture/Vitals-Panel (vermutlich app/modules/capture/index.js + zugehÃ¶riges Template) OK
Zwei neue Buttons im Panel-Header oder oberhalb der Eingabefelder:
â€žArzt-Ansichtâ€œ â†’ ruft requireDoctorUnlock() auf und Ã¶ffnet die klassische Doctor-View.
â€žDiagrammâ€œ â†’ ebenfalls Guard, setzt ein Flag bzw. Ã¼bergibt einen Modus, damit Doctor-View direkt im Chart startet.
Logik fÃ¼r die Button-Actions (z.â€¯B. AppModules.capture?.openDoctorView({ startMode: 'list' | 'chart' })).

Doctor-Module (app/modules/doctor/index.js + Chartmodul) OK
Ã–ffnen via Parameter: wenn startMode === 'chart', nach Unlock sofort das Chart zeigen.
SchlieÃŸen (X) eines Chart-Panels sollte zunÃ¤chst die Doctor-Ansicht zeigen (nicht direkt zum Hub springen), sodass der Nutzer im â€žmedizinischen Raumâ€œ bleibt.

### 4.2 Termin- & Arztmodul (Termine + Ãœbersicht) OK

**Ziel:**
EigenstÃ¤ndiges Terminmodul mit Eingabemaske und Ãœbersicht, angelehnt an Doctor-UI, ohne den Hub zu Ã¼berladen.

**Backend:**

* Neue Supabase-Tabelle, z. B. `appointments`:

  * `id`
  * `user_id`
  * `date` (oder `date + time`)
  * `title`
  * `type` (Privat / Arzttermin / Geburtstag / â€¦)
  * `location` (optional)
  * `note` (optional)
  * `created_at`, `updated_at`

* RLS: wie bei anderen user-basierten Tabellen (nur eigener User sieht eigene Termine).

**Frontend:**

* **Termin-Eingabe-Panel (Orbit-Button â€žTermineâ€œ):**

  * Felder:

    * Datum
    * Uhrzeit
    * Titel
    * Typ (Privat / Arzttermin / Geburtstag / â€¦)
    * Ort (optional)
    * Notiz (optional)

  * Button **â€žTermin speichernâ€œ** â†’ schreibt in `appointments`.

  * Unterhalb der Maske:

    * Anzeige der nÃ¤chsten **1â€“2 anstehenden Termine**
      (z. B. â€žSo 08:30 â€“ Geburtstagâ€œ, â€žMo 09:00 â€“ Nephroâ€œ).
    * Button **â€žTerminÃ¼bersicht Ã¶ffnenâ€œ** â†’ Ã¶ffnet Listenansicht.

* **TerminÃ¼bersicht-Panel (Doctor-Style):**

  * Drei-Spalten-Layout:

    1. **Spalte 1:**
       * Datum
       * Uhrzeit
       * LÃ¶sch-Button

    2. **Spalte 2:**
       * Titel
       * Typ
       * Ort
       * (spÃ¤ter) Alarm/Reminder-Info

    3. **Spalte 3 (optional):**
       * Notizen

  * Optional: Von/Bis-Filter Ã¤hnlich Doctor-Ansicht (fÃ¼r spÃ¤ter).

* **Voice- und KI-Integration (Vorbereitung):**

  * Voice-/Text-Queries (Phaseâ€¯5+), z.â€¯B.:

    * â€žWann ist mein nÃ¤chster Termin?â€œ
    * â€žZeig mir meine Arzttermine.â€œ

  * `DoctorRouting`:

    * Deep Links in Maps/Telefon/Notizen fÃ¼r Arzttermine, abgesichert Ã¼ber bestehende Unlocks/Biometrie (nur Vorplanung, Umsetzung kann spÃ¤ter kommen).

  * Assistant-Panel:

    * liefert dieselben Termin-Daten an den Butler-Header (Phaseâ€¯3) und an Kontext-Abfragen des Textchats.

---

### 4.3 Health-Profil & Persona Layer (Supabase) OK

**Ziel**
Pers?nliche Limits, Medikation und Stammdaten zentral pflegen; CKD/Albuminurie wird k?nftig automatisch ?ber Laboreintr?ge gespiegelt.

**1. Tabelle erweitern (user_profile)** OK
- bestehende Tabelle via sql/10_User_Profile_Ext.sql um folgende Spalten erweitern:
  - ull_name text
  - irth_date date
  - height_cm integer
  - medications jsonb
  - is_smoker boolean
  - lifestyle_note text
  - salt_limit_g numeric
  - protein_target_min numeric
  - protein_target_max numeric
  - updated_at timestamptz default now()

**2. Profil-Panel (ersetzt Hilfe)** OK
- Orbit NW ï¿½ffnet neues Panel analog zum Terminmodul (Form + ï¿½bersicht):
  - Felder: Name, Geburtsdatum, Gr??e, Medikation, Salz-/Protein-Limits, Nichtraucher-Flag, Lifestyle-Note.
  - Liste unten zeigt die gespeicherten Werte.
  - Speichern fï¿½hrt Insert/Update auf user_profile aus und feuert profile:changed.

FÃ¼r das Profil-Panel brauchen wir mehrere Bausteine. Ich wÃ¼rde den Umbau so aufteilen:

## Hilfe-Panel in index.html ersetzen OK
section mit id="helpPanel" komplett entfernen.
An derselben Position neues section id="hubProfilePanel" einfÃ¼gen: Aufbau wie Terminpanel (scroll-wrap, header mit Close-Button, Formular + Ãœbersicht).
Formularâ€Felder:
Name (profileFullName)
Geburtsdatum (profileBirthDate)
GrÃ¶ÃŸe (optional readonly, wenn leer Hinweis)
Medikation (Textarea oder Tag-Input profileMedications)
Salzlimit (profileSaltLimit)
Protein-Ziel min/max (profileProteinMin, profileProteinMax)
Nichtraucher (Checkbox profileIsSmoker)
Lifestyle-Note (Textarea)
Buttons: Speichern (profileSaveBtn) und evtl. ZurÃ¼cksetzen/Refresh.
Unterhalb des Formulars ein Abschnitt â€žAktuelle Datenâ€œ (z.â€¯B. <div id="profileOverview">), der nach Save/Synchronisierung befÃ¼llt wird.

## Orbit-Button neu binden OK
Im Hub-Orbit (index.html) statt Hilfe-Button data-hub-module="profile" setzen.
In app/modules/hub/index.js: neuen Button via bindButton('[data-hub-module="profile"]', openPanelHandler('profile'), { sync:false }) registrieren.
Optional: Beim Ã–ffnen AppModules.profile?.sync({ reason: 'panel-open' }).

## Neues Modul app/modules/profile/index.js OK
Analoge Struktur wie app/modules/appointments/index.js: init(), ensureRefs(), loadProfile(), saveProfile().
Supabase via ensureSupabaseClient() + getUserId() nutzen.
saveProfile entscheidet, ob Insert vs Update (wir kÃ¶nnen upsert verwenden .upsert({ user_id, ... }, { onConflict: 'user_id' })).
Nach erfolgreichem Save: Formular reset (oder Werte belassen) + renderOverview().
notifyChange('profile') â†’ CustomEvent profile:changed.

## Styles OK
app/styles/hub.css ggf. um .profile-panel erweitern: Grid fÃ¼r Form, Labels, Liste analog Terminpanel.
Checkbox/Dropdown an Terminpanel-Stil angleichen.

## Weitere Anpassungen OK
app/modules/charts/index.js spÃ¤ter an profile:changed hÃ¤ngen.
FÃ¼r Assistant genÃ¼gt es zunÃ¤chst, wenn wir das Profil-Event zur VerfÃ¼gung haben; die Edge Function wird separat erweitert.

Damit haben wir einen klaren Umbauplan und Wissen, welche Dateien angefasst werden mÃ¼ssen (index.html, app/styles/hub.css, app/modules/hub/index.js, neues app/modules/profile/index.js).


**3. Verbraucher** OK
- pp/modules/charts/index.js holt Grï¿½ï¿½e ausschlieï¿½lich aus user_profile (Fallback 183?cm entfï¿½llt).
- midas-assistant (Edge Function) lï¿½dt Profil via JWT + Service-Key oder erhï¿½lt es als Kontext und injiziert JSON (Limits, Medikation) vor den Chat-Messages.
- Fotoanalyse nutzt Salz-/Protein-Grenzen fï¿½r Hinweise (ï¿½du bist heute bei 4,6?g von 5?gï¿½). Wasserziel bleibt optional/manuell.

**4. Schritte** OK
1. SQL-Skript schreiben/ausfï¿½hren, bestehende RLS-Policies behalten.
2. Hilfe-Panel entfernen, neues Profil-Panel + Modul (pp/modules/profile/index.js) implementieren.
3. Charts/Butler auf Profil-Werte umstellen.
4. Assistant-Request um Profil-Kontext erweitern (Frontend oder Edge Function), damit der Prompt nicht mehr hartcodiert werden muss.

**Hinweise**
- Raucherflag/Geschlecht dienen nur als Kontext (keine medizinische Diagnose).
- Medikation als JSON-Array erlaubt einfache Pflege.
- Bei fehlendem Profil blendet das Panel einen Hinweis ein; Assistant fï¿½llt auf konservative Defaults zurï¿½ck.

### 4.4 Hybrid Panel Animation (Hub Performance Mode) OK
Ziel:
Die Hub-Panels werden fÃ¼r Mobile/Tablet (Performance Mode) und Desktop (cineastisch, aber leicht) optimiert.
Basierend auf der eigenen â€žPanel Animation Performance Roadmapâ€œ.

Inhalt:
Neue Mobile Keyframes (zoom-in-mobile, zoom-out-mobile) â€“ nur opacity + transform.
Media Query <1025px mit Overrides:
kein backdrop-filter auf Mobile
leichtere Panel-Shadows
neue Animationen nur fÃ¼r Mobile
vereinfachter Orbit/Aura-Effekt bei offenen Panels
Desktop â‰¥1025px:
cineastische Animation mit reduzierten Keyframes (Squash-Grow), ohne Shadow-Animation
Glow/Elevation via transition statt Keyframes
Panel-Open/Close Ã¼ber neue Desktop-Keyframes (zoom-in-desktop, zoom-out-desktop)
Zielwirkung:
Mobile: ultrasmooth & performant fÃ¼r Alltag
Desktop: edel, aber ohne teure Shadow-Repaints

## app/styles/hub.css OK
Panels bisher alle via zoom-in/zoom-out Keyframes â†’ neue Sets erzeugen: hub-panel-zoom-in-mobile, hub-panel-zoom-out-mobile (nur opacity + transform: translate3d), sowie hub-panel-zoom-in-desktop, â€¦-desktop (dezente â€œSquash-Growâ€).
Media Query <1025px:
body.is-mobilePerformance (oder direkt @media (max-width:1024px)) remove backdrop-filter, lighten shadows (box-shadow -> klein, rgba).
Setze .hub-panel Animation auf mobile Keyframes, animation-duration kÃ¼rzer (z.B. 180â€¯ms).
Orbit/Aura: .hub.is-panel-open â†’ nur opacity dimmen, keine Glow/Blur.
Desktop (min-width:1025px):
Keyframes auf die cineastische Variante referenzieren, aber ohne Shadow-Animation (Glow/Elevation via transition).
Panelâ€Close Buttons / Backdrop glÃ¤tten (z.B. transition: opacity .3s).

## app/styles/base.css (oder app/styles/hub.css falls alle Backdrop-Regeln dort liegen) OK
Performance-Mode braucht global body/main Flags: body[data-panel-perf="mobile"].
Mobile Mode: #hubBackdrop â†’ opacity only, kein blur. Desktop Mode: backdrop-filter: blur(6px) aber transition statt Keyframe.

## app/modules/hub/index.js OK
Device Detection: beim Boot const isMobilePanelMode = window.matchMedia('(max-width:1024px)').
Toggle document.body.dataset.panelPerf = isMobilePanelMode.matches ? 'mobile' : 'desktop'; Listener auf change.
Optional: bei jedem Panel-Open body.classList.toggle('hub-panel-mobile', ...) damit CSS umschalten kann.
Orbit/Auraâ€Easing: wenn Panel offen und Mobile Mode â†’ setze .hub class (hub--mobile-open) damit CSS die vereinfachten Effekte nutzt.

## app/styles/hub.css â€“ Orbit/Aura spezifisch OK
Neue Klasse .hub--panel-open-mobile â†’ disables @keyframes aura-boost, nur opacity.
Desktop behÃ¤lt die Glow-Animation, aber wechselt auf transition: filter statt Keyframe, um Repaints zu reduzieren.

## QA / Touchlog Bezug (keine Datei, aber Hinweis) OK
Nach CSS/JS Anpassungen sicherstellen, dass Touch-Log keine zusÃ¤tzlichen Meldungen generiert (Animationen laufen rein in CSS; JS Ã¤ndert nur Body-Dataset).
Damit haben wir klar, wo wir Hand anlegen: Schwerpunkt liegt auf app/styles/hub.css, ergÃ¤nzt durch ein kleines Flag in app/modules/hub/index.js (und ggf. app/styles/base.css, falls der Backdrop dort lebt).

---

## Phase 5 â€“ Actions & Flows â€“ Butler Layer

**Status:** In Arbeit (5.1 & 5.2 OK, 5.3ff pending)  
**Ziel:** Aus dem beratenden Assistant wird ein Butler, der nach einer klaren Ja/Nein-BestÃ¤tigung Intakes (und spÃ¤ter weitere Module) aktualisieren kann. Textchat bleibt Hauptpfad, Voice nutzt dieselben Hooks via Long-Press. Alle Ã„nderungen laufen Ã¼ber erlaubte Actions und einen gemeinsamen Confirm-Layer.

---

### 5.1 Suggest & Confirm Layer OK

- [x] **Kontext-Hook:** `assistantSuggestStore` hÃ¤lt Intake/Termin/Profil-Snapshots (Basis `refreshAssistantContext`) fest und liefert sie Suggest-/Follow-up-Modulen.
- [x] **Analyse-Payloads:** Foto-/Text-RÃ¼cklÃ¤ufe (`suggest_intake`, `confirm_intake`) transportieren Wasser/Salz/Protein + Confidence und schreiben die aktive Suggestion in den Store.
- [x] **UI-Card:** Assistant-Panel besitzt eine wiederverwendbare Suggest-Card (Titel, Werte, Empfehlung, Buttons **Ja/Nein** + Dismiss). Voice kann dieselben Events feuern.
- [x] **Confirm-Flow:**  
  - **Ja:** ruft die Allowed Action `intake_save`, loggt deterministisch (Diag + Touchlog) und entlÃ¤dt Suggestion + Chat-Nachricht.  
  - **Nein:** verwirft Suggestion, optional Retry.  
- [x] **Follow-up:** Nach jedem erfolgreichen Intake-Save (egal ob Suggestion, manuell oder Voice) fÃ¼hrt `assistant:action-success` zu einem Kontext-Refresh inkl. Mini-Report (â€žSalzlimit noch 1,2â€¯gâ€œ, â€žTermin morgen 07:45â€œ) per Butler-Nachricht.

### 5.2 Allowed Actions & Guard Rails OK

- [x] Whitelist/Orchestrator (`executeAllowedAction`) kapselt IntakeSave, OpenModule, ShowStatus, Highlight, Suggest/Confirm etc. inkl. Stage/Auth-Gates und zuverlÃ¤ssigem Logging.
- [x] Alle Aktionen loggen Touchlog/Diag deterministisch (`source`, `start/success/blocked`) und brechen sauber ab, falls Boot/Auth nicht ready sind oder Supabase fehlt.
- [x] Kein Intent-Haudrauf: Textchat-Buttons feuern `assistant:action-request`, Voice mappt Long-Press nur auf â€žChat Ã¶ffnenâ€œ bzw. bestÃ¤tigt Suggestion via Allowed Actions; beide Pfade laufen durch den gleichen Helper.

### 5.3 Kontextuelle Empfehlungen OK

- [x] Nach jedem Save erzeugt `generateDayPlan()` einen Mini-Report (â€žNoch 1,2â€¯g Salz, morgen Termin 07:45â€œ).
- [x] Helper `generateDayPlan()` bÃ¼ndelt Uhrzeit, Termine, Limits (Profil) â†’ liefert strukturierte Empfehlungen/Warnungen, die Textchat sowie Voice verwenden kÃ¶nnen.
- [x] Antworten bleiben textbasiert; bei aktiver Voice-Konversation wird die Nachricht zusÃ¤tzlich vorgelesen (gleicher Text).

### 5.4 Optionaler Voice-Handschlag OK

- [x] Long-Press (~650â€¯ms) auf den Assistant-Orbit startet die Sprachaufnahme (`handleVoiceTrigger`), kurzer Tap Ã¶ffnet weiterhin den Textchat. Voice bleibt gesperrt (CSS `body.voice-locked`) solange Stage < INIT_UI oder `authState === 'unknown'`.
- [x] Keine Always-On-/Streaming-Experimente â€“ Voice dient als Eingabehilfe, feuert `assistant:action-request` und nutzt denselben Confirm-Layer wie Text/Foto. Gate wird Ã¼ber `AppModules.hub.getVoiceGateStatus/onVoiceGateChange` + VAD-Stop kontrolliert.

> **Zusammenfassung:** Phaseâ€¯5 fokussiert einen zuverlÃ¤ssigen Suggest/Confirm-Pfad und kontrollierten Allowed-Actions-Einsatz. Voice bleibt sekundÃ¤r, nutzt aber exakt dieselben Mechanismen wie der Textchat.

## Phase 6 â€“ Deep Cleanup & Refactor

**Ziel:**
Wenn alle Kernfeatures stehen, Code so aufrÃ¤umen, dass er langfristig wartbar bleibt.

**Schwerpunkte:**

* Logger konsolidieren (`diag`, `touch-log`, `console`):

  * vereinheitlichte Logging-API, z. B. `diag.log/info/warn/error`.
  * ÃœberflÃ¼ssige `console.log`-Spuren aus Produktivcode entfernen (nur gezielte Debug-Punkte lassen).

* State-Layer weiter entschlacken (`/core/state`, Guards, Flags):

  * ÃœberflÃ¼ssige Flags entfernen.
  * Doppelte State-Pfade zusammenfÃ¼hren.
  * Guards dokumentieren (kurz: â€žwogegen schÃ¼tzt dieser Guard?â€œ).

* Toter Code, verwaiste Helper, alte Experimente entfernen:

  * Nur klar identifizierbare Leichen â€“ der systematische Scan kommt in Phase 6.5.

* Modul-Schnittstellen schÃ¤rfen:

  * Public/Private-Exports in Kernmodulen dokumentieren (kurzer Header-Kommentar).
  * UnnÃ¶tige Exports entfernen.

* Kommentare minimal, aber gezielt mit `// [anchor:...]` als Update-Marker.

**Codex-Hinweis:**

- In dieser Phase explizit **kein** neues Feature bauen.
- Fokus: Lesbarkeit, Konsistenz, kleinere Refactors.


## Neu eventuelle:
- Sollten wir vielleicht ein reanalyse button einbauen? Wenn die geschÃ¤tzten Werte isch falsch anfÃ¼hlen kÃ¶nnten wir da eine reanalyse starten von dem Bild. Was denkst du Ã¼ber diese Idee?

---

## Phase 6.5 â€“ Repo Audit & Dead Code Removal

**Ziel:**
Kompletten Codebaum systematisch auf Altlasten prÃ¼fen und verschlanken, bevor Persistent Login, PWA und TWA kommen.

**Inhalt:**

* VollstÃ¤ndiger Repo-Scan (Ordner fÃ¼r Ordner) mit Fokus auf:

  * ungenutzte Dateien (nie importiert / nie referenziert)
  * ungenutzte Funktionen, Konstanten, Helpers
  * verwaiste Imports
  * alte Prototypen und Monolith-Reste
  * doppelte Utilities / Duplikate
  * Debug-Fragmente, alte Test-Routen
  * dead paths (If-Zweige/Branches, die nie mehr ausgefÃ¼hrt werden)

* Ergebnis: Klassifizierung pro Datei/Funktion:

  * **A â€“ Aktiv:** produktiv genutzt, bleibt.
  * **B â€“ Fraglich:** verdÃ¤chtig, aber evtl. noch referenziert â†’ markieren.
  * **C â€“ Tot:** sicher lÃ¶schbar (keine Referenzen, kein Pfad, kein Import).

**Methode (fÃ¼r Codex):**

* Spezieller â€žRepo Auditâ€œ-Prompt:

  * Keine automatischen CodeÃ¤nderungen.
  * Nur Analyse & Bericht erstellen.
  * Ordnerstruktur durchgehen (z. B. `/core`, `/modules/*`, `/app/styles`, Edge Functions).
  * Pro Ordner eine Liste erstellen, Dateien als A/B/C markieren.
  * Refactor-/LÃ¶sch-Empfehlungen formulieren.

**Output:**

* `REPO_AUDIT.md` mit:

  * Auflistung aller Ordner/Dateien.
  * A/B/C-Klassifizierung.
  * Liste â€žSafe to deleteâ€œ.
  * Liste â€žKandidat fÃ¼r Zusammenlegung/Refactorâ€œ.
  * Hinweisen auf doppelte Muster (z. B. Ã¤hnliche Helpers in mehreren Modulen).

**Warum vor Phase 7â€“9:**

* Persistent Login (Phase 7) profitiert von:

  * weniger alten Auth-/Guard-Resten.
  * weniger versteckten Event-Handlern.
  * weniger Seiteneffekten aus alten Flows.

* PWA/TWA (Phase 8/9) profitieren von:

  * schlankeren Bundles.
  * weniger unnÃ¶tigen Assets.
  * klareren Caching-Grenzen.

---

## Phase 7 â€“ Session & Performance Layer (Persistent Login)

**Ziel:**
Stabile Sessions und gutes Startverhalten im Browser â€“ Vorbereitung fÃ¼r PWA/TWA.

**Code-Schwerpunkt:**  
`app/supabase/auth/core.js`, Bootflow (`boot-flow.js`, `main.js`), Guards im UI.

| Task                      | Status | Beschreibung                                                                                                                                                                                   |
| ------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7.1 Persistent Login Mode | TODO   | `persistSession: true`, Silent Refresh fÃ¼r Google OAuth, Session Restore beim Boot. App Ã¶ffnet eingeloggt, sofern Session gÃ¼ltig â€“ ohne erzwungenen Re-Login.                                  |
| 7.2 Session/Guard QA Pass | TODO   | Sicherstellen, dass `authState`, Guards und Doctor-Unlock deterministisch sind (kein â€žmissing sessionâ€œ, kein Doppel-Login). Resume-/Background-Flow definieren (Tab-Wechsel, Reload, Timeout). |
| 7.3 Performance Pass      | TODO   | Nicht-kritische Module lazy laden. Charts/Vision/Doctor/Trendpilot erst nach Idle oder on-demand booten. Ziel: schneller First Paint, â€žfÃ¼hlt sich wie native App anâ€œ.                          |

### 7.4 Wearable/Remote API Readiness

**Ziel:**
MIDAS so vorbereiten, dass spÃ¤tere Wearables (DIY-Watch, AR-Brille, Kommunikator) sich wie ein schlanker Remote-Client verhalten kÃ¶nnen, ohne die App-Architektur umzubauen.

**Backend-Konzept:**

* Definierte, schmale Endpunkte (z. B. als neue Edge Function oder API-Route):

  * `GET /api/midas-remote-status` â†’ kompakter Snapshot:

    * heutige Intakes (Summen Wasser/Salz/Protein),
    * nÃ¤chster Termin,
    * kurzer Health-Profil-Auszug.

  * `POST /api/midas-remote-intake` â†’ einfacher Intake-Write:

    * Payload nur mit Basisfeldern (`water_ml`, `protein_g`, `salt_g`, `timestamp`).

  * `GET /api/midas-remote-ping` â†’ Healthcheck/Version fÃ¼r Client.

* Auth:

  * token-basiert (z. B. Device-Token oder API-Key, gebunden an Stephans Account).
  * Kein vollstÃ¤ndiger OAuth-Flow am Wearable.

**Verwendung:**

* Externe Clients (z. B. DIY-Uhr) kÃ¶nnen:

  * aktuellen Intake-Status abfragen (â€žwie weit bin ich heute?â€œ),
  * kleine Intakes eintragen (â€ž+20 g Proteinâ€œ, â€ž+300 ml Wasserâ€œ),
  * spÃ¤ter Termine anzeigen (â€žnÃ¤chster Arztterminâ€œ).

**Abgrenzung:**

* Keine KI direkt im Wearable â€“ weiterhin Ã¼ber Edge Functions.
* Kein neues UI in MIDAS selbst in dieser Phase, nur API-Schicht + Doku (`Wearable_API.md`).

---

## Phase 8 â€“ PWA Packaging

**Ziel:**
MIDAS als saubere Progressive Web App bereitstellen â€“ installierbar auf Desktop/Android mit Offline-GrundfunktionalitÃ¤t.

**Files:**  
`manifest.json`, `sw.js`, evtl. PWA-spezifische Notes.

### 8.1 Manifest

* `manifest.json`:

  * `name`, `short_name`, `description`
  * `start_url`, `scope`
  * `display: "standalone"`
  * `theme_color`, `background_color`
  * Icons (mind. 192x192, 512x512)

### 8.2 Service Worker â€“ Basis

* `sw.js`:

  * Install/Activate Events
  * Caching fÃ¼r statische Assets (`app.css`, JS, Icons)
  * Optionale Offline-Fallback-Seite

### 8.3 Caching-Strategie

* `cache-first` fÃ¼r statische Ressourcen
* `network-first` fÃ¼r Supabase/API-Calls
* Cache-Versionierung (z. B. `midas-static-v1`)
* Bewusst: keine sensiblen API-Responses cachen

### 8.4 Installability & UX

* Lighthouse-Check (PWA-Kriterien).
* Optionaler â€žInstallierenâ€œ-Hinweis im Hub, wenn `beforeinstallprompt` mÃ¶glich.
* Tests:

  * Chrome/Edge Desktop
  * Chrome Android (Add to Home Screen)

### 8.5 PWA QA

* Online/Offline-Tests
* App-Start im Offline-Modus
* Verhalten bei Reload im Offline-Zustand
* Dokumentation in `PWA_NOTES.md` (z. B. â€žOhne Internet kein KI-Assistantâ€œ).

### 8.6 Push-Reminder (Vorbereitung)

**Ziel:**
PWA/Service Worker so vorbereiten, dass spÃ¤ter Web-Push fÃ¼r Wasser-/Intake-/Termin-Reminder mÃ¶glich ist.

* Konzept fÃ¼r Web-Push-Benachrichtigungen:

  * Wasser-/Intake-Reminder.
  * Termin-Erinnerungen (z. B. â€žÃœbermorgen Nephro um 09:00â€œ).

* Technische Vorbereitung:

  * KlÃ¤ren, wie Push im Backend angebunden wird (eigener Push-Service oder Browser-Push).
  * Sicherstellen, dass Notifications so gestaltet sind, dass spÃ¤tere Wearables sie als System-Notifications mitnutzen kÃ¶nnen (Uhr liest Handy-Notifications).

> Umsetzung der Push-Logik (ZeitplÃ¤ne, CRON, Notification-Texte) kann spÃ¤ter in eine eigene Phase ausgelagert werden; hier geht es primÃ¤r um PWA-Readiness fÃ¼r Push.

---

## Phase 9 â€“ TWA Packaging (Android-App-HÃ¼lle)

**Ziel:**
MIDAS als Trusted Web Activity fÃ¼r Android bereitstellen, auf Basis der stabilen PWA.

### 9.1 TWA-Projekt

* Bubblewrap oder Android Studio TWA-Projekt erstellen.
* Package-Name festlegen (z. B. `at.schabuss.midas`).
* App-Namen, Icons, Orientation, Theme konfigurieren.

### 9.2 Asset Links / Vertrauensanker

* `assetlinks.json` unter `/.well-known/assetlinks.json` auf deiner Domain.
* TWA so konfigurieren, dass nur deine Origin genutzt wird.

### 9.3 Android Manifest (TWA)

* TWA Activity:

  * Launch-URL = PWA-Start-URL
  * MAIN/LAUNCHER Intent
  * Orientation, Theme

### 9.4 Build & Signing

* Release-Build (AAB/APK) erstellen.
* Keystore anlegen oder bestehenden verwenden, dokumentieren.
* Versionierung (SemVer + Buildnummer) pflegen.

### 9.5 Device-Tests

* Echtes Android-GerÃ¤t:

  * Kaltstart/Warmstart
  * Back-Button-Verhalten
  * Offline-Verhalten (zusammen mit Phase 8)
  * Voice/Mic-Freigabe im TWA-Kontext

### 9.6 Play Store (optional)

* Listing (Titel, Beschreibung, Screenshots, Icon).
* Datenschutzangaben (Supabase/OpenAI/Cloud).
* Interner Test-Track (auch wenn du einziger Nutzer bist).

---

## Laufende Leitplanken

* Jede Phase = eigener Branch + Commit-Gruppe mit:

  * Kurzbeschreibung
  * CHANGELOG-Update
  * Mini-QA (Smoke Tests)

* Feature-Flags fÃ¼r Assistant/Voice beibehalten, um bei Bedarf schnell deaktivieren zu kÃ¶nnen.

* KI-nahe Module (`voice-intent.js`, Assistant-Panel, Edge-Functions) mÃ¶glichst gekapselt halten, damit Codex-Refactors nicht in Boot/Auth/Session eingreifen.

* **Text-Assistant bleibt der primÃ¤re Interaktionsmodus** (Analyse, Foodcoach, VorschlÃ¤ge); der Voice-Butler ist ein ergÃ¤nzender Hands-free-Kanal fÃ¼r Shortcuts, Status & einfache Intakes.

---


