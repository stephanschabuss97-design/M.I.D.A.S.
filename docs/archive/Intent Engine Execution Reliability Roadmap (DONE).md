# Intent Engine Execution Reliability Roadmap (DONE)

## Ziel (klar und pruefbar)
Der lokale Intent-Fast-Path in Text und Voice soll fuer bereits korrekt erkannte `direct_match`-Intents robust und vorhersagbar ausgefuehrt werden, ohne dass lokale Guard-/Execution-Fehler faelschlich in einen Backend-/LLM-Fallback kippen.

Pruefbare Zieldefinition:
- Ein lokaler `direct_match` darf nur dann an `midas-assistant` weitergereicht werden, wenn der Fall fachlich wirklich semantisch `fallback` ist.
- Lokale Execution-Fehler (`auth-unknown`, `stage-not-ready`, fehlender lokaler Guarded-Path, Helper fehlt) muessen als lokale Execution-States sichtbar werden und duerfen nicht als Assistant-/Modellproblem erscheinen.
- `open_module` wird als `safe_read` fachlich von `guarded_write` getrennt behandelt:
  - kein Auth-Gate
  - keine Supabase-Abhaengigkeit
  - Stage-/UI-Sicherheit bleibt erhalten
- `intake_save` und lokale Vitals-Writes bleiben guard-railed und werden nicht leichtfertig entkoppelt.
- Text und Voice teilen dieselbe fachliche Execution-Logik fuer:
  - `handled`
  - `blocked_local`
  - `unsupported_local`
  - `fallback_semantic`

## Problemzuschnitt
- Der Parser erkennt `direct_match` bereits korrekt.
- Aktuell kippen lokale Dispatch-Fehler in Hub und Voice jedoch oft in denselben Assistant-Fallback wie echte semantische `fallback`-Faelle.
- Folge:
  - irrefuehrende Meldungen wie `Assistant nicht erreichbar.`
  - lokale Guard-/Auth-Probleme wirken wie Backend-/Modellprobleme
  - Text und Voice sind fachlich unnÃ¶tig fragil

## Scope
- Execution-Pfade fuer lokal erkannte Intents in:
  - `app/modules/hub/index.js`
  - `app/modules/assistant-stack/voice/index.js`
- Trennung zwischen:
  - semantischem `fallback`
  - lokalem `blocked_local`
  - lokalem `unsupported_local`
  - erfolgreichem `handled`
- Ein eigener UI-safe Pfad fuer `open_module`
- Lokale Fehlerrueckmeldungen statt blindem Backend-Fallback bei Execution-Fehlern
- Gemeinsame Telemetry-/Diag-Sicht auf diese neuen States
- Smokechecks fuer Text + Voice

## Not in Scope
- Freigabe neuer Intent-Klassen
- Lockern der Write-Guardrails fuer `intake_save` oder Vitals
- Neue Voice-UI-Reaktivierung
- Neuer Persistenzvertrag fuer `pulse-only`
- Umbau von `midas-assistant` oder Aenderung der OpenAI-Modelwahl
- Queue-/Retry-System fuer spaetere Offline- oder Auth-Replays

## Relevante Referenzen (Code)
- `app/modules/hub/index.js`
- `app/modules/assistant-stack/voice/index.js`
- `app/modules/assistant-stack/assistant/allowed-actions.js`
- `app/modules/assistant-stack/assistant/actions.js`
- `app/modules/assistant-stack/intent/index.js`
- `app/modules/assistant-stack/intent/parser.js`
- `app/modules/assistant-stack/intent/validators.js`
- `app/modules/vitals-stack/vitals/bp.js`
- `app/modules/vitals-stack/vitals/body.js`
- `C:\\Users\\steph\\Projekte\\midas-backend\\supabase\\functions\\midas-assistant\\index.ts`

## Relevante Referenzen (Doku)
- `docs/modules/Intent Engine Module Overview.md`
- `docs/modules/Assistant Module Overview.md`
- `docs/modules/Hub Module Overview.md`
- `docs/archive/Intent Engine Implementation Roadmap (DONE).md`
- `docs/QA_CHECKS.md`
- `CHANGELOG.md`

## Verifizierte Ist-Befunde
- `open_module` wird aktuell im lokalen Fast-Path ueber `runAllowedAction(...)` -> `executeAllowedAction(...)` geschickt.
- `executeAllowedAction(...)` blockt aktuell pauschal auf:
  - `stage-not-ready`
  - `auth-unknown`
  - fehlendes Supabase-API-Surface
- `handleOpenModule(...)` selbst ist jedoch fachlich ein UI-Dispatcher und braucht fuer normale Module keine Auth-/Supabase-Abhaengigkeit.
- Hub und Voice behandeln `direct_match && handled !== true` aktuell als Assistant-Fallback.
- Dadurch koennen lokale Execution-Fehler denselben Benutzer-Effekt erzeugen wie ein nicht erreichbarer Assistant-Endpunkt.

## Guardrails
- `guarded_write` bleibt konservativ:
  - kein Auth-Bypass
  - kein Supabase-Bypass
  - keine impliziten Retries
- `safe_read` darf nur dann aus dem Auth-Gate geloest werden, wenn:
  - keine Persistenz
  - keine Berechtigungseskalation
  - kein medizinisch relevanter Write
- Stage-/UI-Readiness bleibt auch fuer `safe_read` erhalten.
- Kein lokaler Execution-Fehler darf als semantischer `fallback` umetikettiert werden.
- Kein neuer Spezialpfad nur fuer Text oder nur fuer Voice, wenn dieselbe Regel fachlich fuer beide gilt.
- Keine Aenderung an Confirm-/Pending-Context-Regeln in dieser Roadmap, ausser sie werden von den neuen Execution-States nur korrekt gespiegelt.

## Architektur-Constraints
- Parser-Contract bleibt unveraendert:
  - `direct_match`
  - `needs_confirmation`
  - `fallback`
- Die neuen Execution-States leben in den Call-Sites / Flows, nicht im Parser.
- `allowed-actions.js` bleibt der Guard-Rail-Entry fuer `guarded_write`.
- `open_module` bekommt einen expliziten UI-safe Dispatch-Pfad statt eines pauschalen Auth-/Supabase-Gates.
- Text und Voice sollen dieselbe Outcome-Taxonomie nutzen.

## Tool Permissions
Allowed:
- Lesen und Aendern der betroffenen Hub-/Voice-/Assistant-/Intent-Dateien
- Neue kleine Helper-Dateien innerhalb des bestehenden Assistant-/Hub-Scope, falls die Trennung sonst unsauber wuerde
- Doku-, QA- und Changelog-Updates
- Lokale Syntax- und Runtime-Smokes

Forbidden:
- Neue Dependencies
- Aenderung an `midas-assistant` als Primaerloesung
- Weicher machen der Write-Guardrails nur um lokale Fast-Path-Erfolge zu erzwingen
- UI-Reaktivierung von Voice ohne separaten, bewusst freigegebenen Schritt

## Execution Mode
- Sequenziell arbeiten (`S1` bis `S8`).
- Vor jedem Eingriff Guard-/Risikofall kurz gegen den echten Code abgleichen.
- Nach jedem Schritt mindestens ein Check.

## Statusmatrix
| ID | Schritt | Status | Ergebnis/Notiz |
|---|---|---|---|
| S1 | Execution-Pfade und Failure-Taxonomie finalisieren | DONE | Lokale Pfadtypen, Outcome-Taxonomie und die Trennung zwischen semantischem Fallback und lokalem Execution-Blocker sind final gezogen. Wichtigster Befund: `allowed-actions` liefert aktuell nur `boolean`, daher muessen programmatische `blocked_local`-Grunde im naechsten Schritt explizit geschnitten werden. |
| S2 | UI-safe Dispatcher fuer `open_module` schneiden | DONE | `open_module` laeuft jetzt ueber einen eigenen UI-safe Allowed-Action-Pfad mit Stage-Guard, aber ohne Auth-/Supabase-Zwang. Hub und Voice nutzen diesen Pfad bereits fuer lokale `open_module`-Direct-Matches. |
| S3 | Hub-Execution-States (`handled` / `blocked_local` / `unsupported_local` / `fallback_semantic`) einfuehren | DONE | Hub unterscheidet jetzt fuer `direct_match` sauber zwischen lokal behandelt, lokal blockiert, lokal nicht unterstuetzt und semantischem Fallback. Lokal blockierte/unsupported Faelle kippen nicht mehr blind an `midas-assistant`, sondern erzeugen eine lokale Assistant-Meldung. |
| S4 | Voice auf dieselbe Execution-Taxonomie ziehen | DONE | Voice unterscheidet jetzt ebenfalls zwischen lokal behandelt, lokal blockiert, lokal nicht unterstuetzt und semantischem Fallback. Lokal blockierte/unsupported `direct_match`-Faelle bleiben im Voice-Modul und erzeugen eine lokale TTS-Rueckmeldung statt eines Assistant-Roundtrips. |
| S5 | Lokale Benutzer-Rueckmeldungen fuer blockierte Intents sauber machen | DONE | Text und Voice nutzen jetzt abgestimmte, nicht-technische lokale Meldungen fuer blockierte bzw. lokal nicht unterstuetzte `direct_match`-Faelle. Die Rueckmeldungen unterscheiden zwischen erkannt, aktuell nicht speicherbar und bewusst nicht lokal freigegeben, ohne Auth-/Systeminterna zu leaken. |
| S6 | Telemetry/Diag fuer neue Outcome-Klassen nachziehen | DONE | Der Intent-Snapshot fuehrt jetzt `by_outcome` und speichert `outcome` auch in `recent`. Hub und Voice markieren lokale Blocker explizit mit Outcome/Route statt sie in Assistant-Fallback-Diagnose zu verwischen. |
| S7 | Smokechecks und Guard-Regressionen | DONE | Text, Voice, Confirm-Context, Telemetry und statische Guard-Regressionen gegen den neuen Execution-Contract geprueft; keine offensichtliche Drift zwischen `handled`, `blocked_local`, `unsupported_local` und `fallback_semantic` festgestellt. |
| S8 | Doku-Sync, QA_CHECKS, CHANGELOG | DONE | Module-Overview, Assistant-Overview, QA_CHECKS und CHANGELOG spiegeln jetzt den verifizierten Execution-Reliability-Stand inklusive lokaler `open_module`-/Wasser-Ausfuehrung und klarer lokaler Fehlerpfade. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Schritte + Subschritte

### S1 - Execution-Pfade und Failure-Taxonomie finalisieren
- S1.1 Alle relevanten lokalen `direct_match`-Pfadtypen festziehen:
  - `safe_read`
  - `guarded_write`
  - `confirm_only`
- S1.2 Lokale Ergebnis-Taxonomie definieren:
  - `handled`
  - `blocked_local`
  - `unsupported_local`
  - `fallback_semantic`
- S1.3 Existierende `reason`-Strings gegen diese Taxonomie mappen.
- S1.4 Festziehen, welche `reason`s niemals mehr einen Backend-Fallback ausloesen duerfen:
  - `local-dispatch-failed`
  - `voice-local-dispatch-failed`
  - `bp-context-missing`
  - `pulse-local-dispatch-unsupported`
  - `stage-not-ready`
  - `auth-unknown`
  - Helper-/Dispatcher-missing

#### S1 Ergebnisprotokoll (abgeschlossen)
- S1.1 Befund (relevante lokale Pfadtypen, final):
  - `safe_read`
    - aktuell:
      - `open_module`
    - fachliche Eigenschaft:
      - reiner UI-/Navigationspfad
      - keine Persistenz
      - keine medizinisch relevante Datenaenderung
    - Schlussfolgerung:
      - darf nicht unter dasselbe Auth-/Supabase-Gate fallen wie Writes
  - `guarded_write`
    - aktuell:
      - `intake_save`
      - `vitals_log_weight`
      - `vitals_log_bp` bei explizitem Kontext
    - fachliche Eigenschaft:
      - Persistenz / medizinisch relevante Datenaenderung
      - braucht konservative Guards
    - Schlussfolgerung:
      - bleibt hinter Auth-/Stage-/Supabase-Schutz
  - `confirm_only`
    - aktuell:
      - `confirm_reject` wird im Parser nie `direct_match`, sondern `needs_confirmation`
      - Ausfuehrung liegt in eigenen Confirm-Flows im Hub
    - Schlussfolgerung:
      - gehoert nicht in dieselbe `direct_match`-Execution wie `safe_read` oder `guarded_write`
      - muss aber spaeter dieselbe Outcome-Sprache fuer lokale Blocker spiegeln

- S1.2 Befund (Outcome-Taxonomie, final):
  - `handled`
    - lokaler Intent wurde erfolgreich ausgefuehrt
    - kein Backend-Fallback
    - `LLM bypass` / lokaler Voice-Bypass bleibt korrekt
  - `blocked_local`
    - Intent wurde lokal korrekt erkannt
    - lokale Ausfuehrung ist aber aktuell nicht moeglich
    - Gruende:
      - Guard blockt
      - Kontext fehlt fuer einen guard-railed Write
      - lokaler Helper / Dispatcher fehlt
    - Konsequenz:
      - keine Weitergabe an `midas-assistant`
      - lokale Rueckmeldung / Telemetry / Diag
  - `unsupported_local`
    - Intent wurde lokal korrekt erkannt
    - es gibt bewusst keinen lokalen Ausfuehrungspfad fuer diese Action-Kombination
    - Beispiel:
      - `vitals_log_pulse`
    - Konsequenz:
      - ebenfalls kein Backend-Fallback
      - lokale klare Scope-Meldung
  - `fallback_semantic`
    - nur wenn die Eingabe fachlich nicht deterministisch lokal behandelbar ist
    - Quelle:
      - Parser `decision = fallback`
      - Parser `decision = needs_confirmation`, wenn bewusst noch Assistant-/Confirm-Flow noetig ist
    - Konsequenz:
      - nur diese Faelle duerfen an `midas-assistant`

- S1.3 Befund (Mapping der existierenden `reason`-Strings, final):
  - aktuelle Hub-/Voice-`direct_match`-Reasons:
    - `local-dispatch-failed`
    - `voice-local-dispatch-failed`
    - `local-dispatch-unsupported`
    - `voice-local-dispatch-unsupported`
    - `bp-context-missing`
    - `bp-intent-helper-missing`
    - `body-intent-helper-missing`
    - `bp-save-failed`
    - `body-save-failed`
    - `pulse-local-dispatch-unsupported`
    - `not-vitals-direct-match`
  - Taxonomie-Zuordnung:
    - `handled`
      - `reason = null`
    - `blocked_local`
      - `local-dispatch-failed`
      - `voice-local-dispatch-failed`
      - `bp-context-missing`
      - `bp-intent-helper-missing`
      - `body-intent-helper-missing`
      - `bp-save-failed`
      - `body-save-failed`
    - `unsupported_local`
      - `local-dispatch-unsupported`
      - `voice-local-dispatch-unsupported`
      - `pulse-local-dispatch-unsupported`
      - `not-vitals-direct-match`
    - `fallback_semantic`
      - nicht aus diesen lokalen Execution-Reasons ableiten
      - nur aus Parser-/Confirm-Entscheidung ableiten

- S1.4 Befund (welche Faelle niemals mehr Backend-Fallback ausloesen duerfen, final):
  - Alle bereits lokal semantisch erkannten `direct_match`-Faelle mit:
    - `local-dispatch-failed`
    - `voice-local-dispatch-failed`
    - `bp-context-missing`
    - `bp-intent-helper-missing`
    - `body-intent-helper-missing`
    - `bp-save-failed`
    - `body-save-failed`
    - `pulse-local-dispatch-unsupported`
    - `local-dispatch-unsupported`
    - `voice-local-dispatch-unsupported`
    - `not-vitals-direct-match`
  - Begruendung:
    - Das Problem ist in diesen Faellen nicht semantisch, sondern lokal-exekutiv.
    - Ein Assistant-/Backend-Fallback verschleiert die Ursache und erzeugt irrefuehrende Fehlbilder wie `Assistant nicht erreichbar.`.

- Zusatzbefund (wichtigster technischer Einschnitt fuer S2/S3):
  - `executeAllowedAction(...)` in `app/modules/assistant-stack/assistant/allowed-actions.js` liefert aktuell nur `boolean`.
  - Die eigentlichen Blockgruende (`stage-not-ready`, `auth-unknown`, `supabase-missing`, `dispatcher-missing`) existieren zwar in Diag/Touchlog, sind aber nicht programmatisch als strukturierter Result-Type verfuegbar.
  - Konsequenz:
    - S2/S3 brauchen einen expliziten lokalen Execution-Contract.
    - Nur so kann `blocked_local` spaeter sauber und ohne String-Raten in Hub und Voice entschieden werden.

- Check-Ergebnis:
  - Reale Pfade geprueft in:
    - `app/modules/hub/index.js`
    - `app/modules/assistant-stack/voice/index.js`
    - `app/modules/assistant-stack/assistant/allowed-actions.js`
    - `app/modules/assistant-stack/assistant/actions.js`
  - Kein Widerspruch zwischen Roadmap-Ziel und aktuellem Code identifiziert.
  - Wichtigste Leitplanke fuer S2:
    - `open_module` nur als `safe_read` gezielt aus dem Auth-Gate loesen
    - `guarded_write` unveraendert konservativ halten

### S2 - UI-safe Dispatcher fuer `open_module` schneiden
- S2.1 Pruefen, ob `handleOpenModule(...)` direkt wiederverwendet werden kann oder ein kleinerer UI-safe Helper noetig ist.
- S2.2 `open_module` aus dem pauschalen Auth-/Supabase-Gate loesen.
- S2.3 Stage-/UI-Readiness fuer `open_module` explizit erhalten.
- S2.4 Text und Voice beide auf denselben UI-safe Moduldispatcher ziehen.
- S2.5 Sicherstellen, dass `doctor`-/geschuetzte Panel-Sonderfaelle dadurch nicht versehentlich aufweichen.

#### S2 Ergebnisprotokoll (abgeschlossen)
- S2.1 Befund (Wiederverwendung, final):
  - `handleOpenModule(...)` in `app/modules/assistant-stack/assistant/actions.js` ist fachlich bereits der richtige UI-safe Kern.
  - Der eigentliche Umbedarf lag nicht in `handleOpenModule(...)`, sondern im Guard-Einstieg davor.
  - Konsequenz:
    - `handleOpenModule(...)` wurde rueckgabefaehig gemacht (`true` / `false`)
    - zusaetzlich wurde ein schmaler Export `dispatchUiSafeAssistantAction(...)` eingefuehrt

- S2.2 Befund (`open_module` aus pauschalem Auth-/Supabase-Gate geloest):
  - Neuer Helper in `app/modules/assistant-stack/assistant/allowed-actions.js`:
    - `executeUiSafeAllowedAction(...)`
  - Dieser Pfad:
    - erlaubt aktuell bewusst nur `open_module`
    - nutzt keinen Auth-Guard
    - nutzt kein Supabase-API-Surface
    - bleibt aber bei unbekannten oder nicht UI-sicheren Actions geschlossen

- S2.3 Befund (Stage-/UI-Readiness bleibt erhalten):
  - `executeUiSafeAllowedAction(...)` prueft weiterhin `isStageReady()`
  - Damit bleibt `open_module` vor frueher UI-/Boot-Phase blockiert
  - Nur das fachlich unnoetige Auth-/Supabase-Gate wurde entfernt

- S2.4 Befund (Hub und Voice auf denselben Dispatcher gezogen):
  - `app/modules/hub/index.js`
    - neuer lokaler Helper:
      - `runUiSafeAction(...)`
    - `dispatchAssistantIntentDirectMatch(...)` nutzt jetzt fuer `open_module` den UI-safe Pfad
  - `app/modules/assistant-stack/voice/index.js`
    - neuer lokaler Helper:
      - `runUiSafeVoiceAction(...)`
    - `dispatchVoiceIntentDirectMatch(...)` nutzt jetzt fuer `open_module` denselben UI-safe Allowed-Action-Pfad
  - `intake_save` bleibt in beiden Faellen unveraendert auf dem konservativen Write-Pfad

- S2.5 Befund (keine unbeabsichtigte Aufweichung geschuetzter Sonderfaelle):
  - `doctor`-Sonderfall bleibt weiterhin im existierenden `handleOpenModule(...)` / `triggerHubModule(...)`-Pfad
  - Die Roadmap-Aussage bleibt damit korrekt:
    - `open_module` wurde nur als `safe_read` vom Auth-/Supabase-Gate getrennt
    - nicht allgemein von allen UI-/Stage-/Flow-Sicherheiten

- Umgesetzte Dateien:
  - `app/modules/assistant-stack/assistant/actions.js`
  - `app/modules/assistant-stack/assistant/allowed-actions.js`
  - `app/modules/hub/index.js`
  - `app/modules/assistant-stack/voice/index.js`

- Durchgefuehrte Checks:
  - Syntax:
    - `node --check app/modules/assistant-stack/assistant/actions.js` PASS
    - `node --check app/modules/assistant-stack/assistant/allowed-actions.js` PASS
    - `node --check app/modules/hub/index.js` PASS
    - `node --check app/modules/assistant-stack/voice/index.js` PASS
  - Statischer Aufrufstellen-Check:
    - `dispatchUiSafeAssistantAction(...)` vorhanden
    - `executeUiSafeAllowedAction(...)` vorhanden
    - Hub nutzt `runUiSafeAction(...)` fuer `open_module`
    - Voice nutzt `runUiSafeVoiceAction(...)` fuer `open_module`
    PASS

- Wichtigste Leitplanke fuer S3:
  - `open_module` ist jetzt technisch sauber getrennt
  - die irrefuehrende Assistant-Fallback-Problematik bleibt fuer `guarded_write`-Blocker aber noch bestehen
  - genau diese Trennung wird in S3 ueber die neue Outcome-Taxonomie im Hub sichtbar gemacht

### S3 - Hub-Execution-States einfuehren
- S3.1 `dispatchAssistantIntentDirectMatch(...)` auf Outcome-Objekt mit Taxonomie umstellen.
- S3.2 `resolveAssistantIntentFallbackRoute(...)` so aendern, dass nur noch echte `fallback_semantic`-Faelle ins Backend gehen.
- S3.3 Lokale Execution-Blocker als lokale Assistant-Message behandeln statt als Backend-Fallback.
- S3.4 Confirm-Pfade gegen die neue Outcome-Logik pruefen.
- S3.5 Bestehende erfolgreichen `LLM bypass`-Pfade unveraendert halten.

#### S3 Ergebnisprotokoll (abgeschlossen)
- S3.1 Befund (Hub-Direct-Match auf Outcome-Objekt umgestellt):
  - `dispatchAssistantIntentDirectMatch(...)` liefert jetzt nicht mehr nur `handled + reason`, sondern:
    - `handled`
    - `outcome`
    - `reason`
  - Aktive Outcomes im Hub:
    - `handled`
    - `blocked_local`
    - `unsupported_local`
    - `fallback_semantic`
  - Das betrifft:
    - `open_module`
    - `intake_save`
    - `vitals_log_weight`
    - `vitals_log_bp`
    - `vitals_log_pulse`

- S3.2 Befund (Fallback nur noch fuer echte semantische Faelle):
  - `resolveAssistantIntentFallbackRoute(...)` behandelt jetzt `direct_match` differenziert:
    - `handled` -> kein Assistant-Call
    - `blocked_local` -> kein Assistant-Call
    - `unsupported_local` -> kein Assistant-Call
    - `fallback_semantic` -> Assistant-Call erlaubt
  - Parser-`fallback` und Parser-`needs_confirmation` bleiben unveraendert semantische Assistant-/Confirm-Faelle

- S3.3 Befund (lokale Blocker als lokale Assistant-Meldung):
  - Neuer lokaler Reply-Builder im Hub:
    - `buildAssistantLocalIntentBlockedReply(...)`
  - Blockierte oder bewusst nicht lokal unterstuetzte `direct_match`-Faelle erzeugen jetzt:
    - lokale Assistant-Nachricht
    - keine irrefuehrende rote Assistant-Fallback-Meldung
  - Beispiele:
    - `open_module` blockiert -> lokale Oeffnen-Meldung
    - `intake_save` blockiert -> lokale Speichern-Meldung
    - `vitals_log_pulse` -> klare Scope-Meldung statt Backend-Fallback
    - `vitals_log_bp` ohne Kontext -> lokaler Hinweis auf fehlenden Morgen/Abend-Kontext

- S3.4 Befund (Confirm-Pfade gegen neue Outcome-Logik geprueft):
  - Bestehende Confirm-Pfade (`resolveAssistantConfirmIntent(...)`) bleiben funktional intakt.
  - Sie laufen weiterhin vor dem Direct-Match-Dispatch.
  - Der generische Confirm-Execution-Pfad nutzt intern noch den alten booleschen `runAllowedAction(...)`-Vertrag.
  - Konsequenz:
    - keine Regression in S3
    - aber Confirm-Execution ist noch nicht auf die neue Outcome-Taxonomie gehoben
    - das bleibt bewusst ausserhalb von S3

- S3.5 Befund (`LLM bypass` bleibt unveraendert):
  - Erfolgreich lokal behandelte `direct_match`-Faelle behalten:
    - `recordAssistantIntentLlmBypass(...)`
    - lokale Erfolgsnachricht
  - Nur blockierte / unsupported lokale Faelle verlieren jetzt den falschen Assistant-Fallback

- Umgesetzte Dateien:
  - `app/modules/hub/index.js`

- Durchgefuehrte Checks:
  - Syntax:
    - `node --check app/modules/hub/index.js` PASS
  - Statischer Flow-Check:
    - `dispatchAssistantIntentDirectMatch(...)` liefert `outcome`
    - `resolveAssistantIntentFallbackRoute(...)` gate't `direct_match` jetzt differenziert
    - `buildAssistantLocalIntentBlockedReply(...)` vorhanden
    - `sendAssistantChatMessage(...)` bricht bei lokal blockierten `direct_match`-Faellen vor `fetchAssistantTextReply(...)` ab
    PASS

- Wichtigste Leitplanke fuer S4:
  - Voice muss jetzt denselben Outcome-Vertrag erhalten
  - sonst driftet Text gegenueber Voice erneut auseinander

### S4 - Voice auf dieselbe Execution-Taxonomie ziehen
- S4.1 `dispatchVoiceIntentDirectMatch(...)` auf dieselbe Outcome-Struktur ziehen.
- S4.2 Nur semantische Fallbacks an den Assistant-Roundtrip geben.
- S4.3 Lokale Blocker mit kurzer lokaler Voice-Rueckmeldung behandeln.
- S4.4 Sicherstellen, dass die geparkte Voice-Fassade dieselbe Shape weiter liefern kann.

#### S4 Ergebnisprotokoll (abgeschlossen)
- S4.1 Befund (Voice-Direct-Match auf Outcome-Struktur umgestellt):
  - `dispatchVoiceIntentDirectMatch(...)` liefert jetzt dieselbe Outcome-Taxonomie wie der Hub:
    - `handled`
    - `blocked_local`
    - `unsupported_local`
    - `fallback_semantic`
  - Betroffen:
    - `open_module`
    - `intake_save`
    - `vitals_log_weight`
    - `vitals_log_bp`
    - `vitals_log_pulse`

- S4.2 Befund (nur semantische Fallbacks gehen weiter):
  - Der Voice-Einstieg nach STT wertet jetzt zuerst:
    - Preflight
    - lokaler Direct-Match-Dispatch
    - finale Route via `resolveVoiceIntentRoute(...)`
  - Nur wenn `shouldCallAssistant === true`, geht der Pfad weiter in `handleAssistantRoundtrip(transcript)`
  - Lokal blockierte oder bewusst nicht lokal unterstuetzte `direct_match`-Faelle bleiben damit im Voice-Modul

- S4.3 Befund (lokale Voice-Blocker mit lokaler Rueckmeldung):
  - Neuer Reply-Builder:
    - `buildVoiceLocalIntentBlockedReply(...)`
  - Neuer Abschluss-Pfad:
    - `finalizeVoiceIntentBlocked(...)`
  - Dieser Pfad:
    - spricht die lokale Rueckmeldung ueber den vorhandenen TTS-Kanal
    - behandelt den Fall analog zum lokalen Voice-Bypass
    - startet Conversation-Resume nur dort, wo der bestehende Voice-Flow es ohnehin erlaubt

- S4.4 Befund (Voice-Fassade / Shape):
  - Die geparkte Voice-Fassade im Hub musste fuer S4 nicht strukturell geaendert werden
  - Relevanter Punkt:
    - das Voice-Modul selbst fuehrt jetzt bereits denselben fachlichen Execution-Vertrag wie der Hub
    - die UI-seitige Voice-Reaktivierung bleibt weiterhin ausserhalb dieses Schritts

- Umgesetzte Dateien:
  - `app/modules/assistant-stack/voice/index.js`

- Durchgefuehrte Checks:
  - Syntax:
    - `node --check app/modules/assistant-stack/voice/index.js` PASS
  - Statischer Flow-Check:
    - `resolveVoiceIntentRoute(...)` nutzt jetzt `localDispatch`
    - `dispatchVoiceIntentDirectMatch(...)` liefert `outcome`
    - `finalizeVoiceIntentBlocked(...)` vorhanden
    - blockierte/unsupported `direct_match`-Faelle brechen vor `handleAssistantRoundtrip(transcript)` ab
    PASS

- Wichtigste Leitplanke fuer S5:
  - Text und Voice verhalten sich jetzt fachlich gleich
  - die Benutzer-Rueckmeldungen fuer blockierte lokale Intents koennen daher im naechsten Schritt gezielt auf Verstaendlichkeit und Vorsicht nachgeschaerft werden

### S5 - Lokale Benutzer-Rueckmeldungen fuer blockierte Intents sauber machen
- S5.1 Text:
  - klare lokale Meldungen fuer `blocked_local`
  - keine misleading `Assistant nicht erreichbar.`-Effekte mehr
- S5.2 Voice:
  - kurze lokale TTS-Hinweise fuer blockierte lokale Ausfuehrung
- S5.3 Nachrichten vorsichtig halten:
  - keine Auth-/Systeminterna leaken
  - aber korrekt zwischen `erkannt` und `ausfuehrbar` unterscheiden

#### S5 Ergebnisprotokoll (abgeschlossen)
- S5.1 Befund (Text-Rueckmeldungen geschaerft):
  - `buildAssistantLocalIntentBlockedReply(...)` wurde sprachlich nachgeschaerft
  - Ziel:
    - erkennbar machen, dass der Befehl verstanden wurde
    - aber keine technischen Detailgruende wie `auth`, `stage`, `supabase` oder `dispatcher` offenlegen
  - Finaler Stil:
    - ruhig
    - knapp
    - ohne irrefuehrende Backend-/Assistant-Implikation

- S5.2 Befund (Voice-Rueckmeldungen gespiegelt):
  - `buildVoiceLocalIntentBlockedReply(...)` fuehrt jetzt dieselben Kernformulierungen wie Text
  - Dadurch bleiben Text und Voice fachlich und sprachlich im selben Contract
  - Die lokale TTS-Rueckmeldung fuer blockierte / unsupported `direct_match`-Faelle bleibt damit fuer spaetere Live-Nutzung bereits brauchbar

- S5.3 Befund (Meldungen vorsichtig gehalten):
  - keine Leaks von:
    - `auth-unknown`
    - `stage-not-ready`
    - `supabase-missing`
    - `dispatcher-missing`
  - Stattdessen klare Nutzerlogik:
    - `open_module`:
      - Modul ist gerade noch nicht bereit
    - `intake_save` / `vitals_log_weight` / `vitals_log_bp`:
      - erkannt, aber aktuell noch nicht speicherbar
    - `vitals_log_bp` ohne Kontext:
      - explizite Rueckfrage nach `morgens` / `abends`
    - `vitals_log_pulse`:
      - bewusst als aktuell nur zusammen mit Blutdruck lokal verarbeitbar kommuniziert

- Umgesetzte Dateien:
  - `app/modules/hub/index.js`
  - `app/modules/assistant-stack/voice/index.js`

- Durchgefuehrte Checks:
  - Syntax:
    - `node --check app/modules/hub/index.js` PASS
    - `node --check app/modules/assistant-stack/voice/index.js` PASS
  - Statischer Abgleich:
    - Text und Voice verwenden dieselben Kernformulierungen fuer:
      - `open_module`
      - BP-Kontext-Hinweis
      - `pulse`-Scope-Grenze
    PASS

- Wichtigste Leitplanke fuer S6:
  - Die UX fuer lokale Blocker ist jetzt klar genug
  - im naechsten Schritt muessen Telemetry und Diag diese neuen Outcome-Klassen ebenso klar abbilden

### S6 - Telemetry/Diag fuer neue Outcome-Klassen nachziehen
- S6.1 Neue Outcome-States in Intent-Telemetry aufnehmen.
- S6.2 Hub-/Voice-Diag so erweitern, dass lokale Blocker klar von Assistant-Fallbacks unterscheidbar sind.
- S6.3 Pruefen, ob bestehende Event-Namen reichen oder ein minimaler zusaetzlicher Hook noetig ist.

#### S6 Ergebnisprotokoll (abgeschlossen)
- S6.1 Befund (Intent-Telemetry erweitert):
  - `app/modules/assistant-stack/intent/index.js`
    - Telemetry fuehrt jetzt zusaetzlich:
      - `by_outcome`
    - `recent`-Eintraege enthalten jetzt ebenfalls:
      - `outcome`
  - Damit sind z. B. sauber unterscheidbar:
    - `handled`
    - `blocked_local`
    - `unsupported_local`
    - `pending-local-execution`

- S6.2 Befund (Hub-/Voice-Diag sauberer getrennt):
  - Hub:
    - lokale `direct_match`-Blocker schreiben jetzt explizit:
      - `outcome`
      - `reason`
      - `route`
    - `assistantChatCtrl.lastIntentFallback` wird fuer lokale Blocker ebenfalls mit `outcome` befuellt
    - echte Assistant-Fallbacks bleiben weiter nur dort, wo `shouldCallAssistant === true`
  - Voice:
    - `recordVoiceIntentRoute(...)` fuehrt jetzt `outcome`
    - `voiceCtrl.lastIntentRoute` fuehrt jetzt `outcome + reason`
    - Preflight, lokale Blocker und lokaler Bypass lassen sich damit sauber unterscheiden

- S6.3 Befund (keine neuen globalen Events noetig):
  - Bestehende Hooks reichen fuer diesen Schritt aus
  - Neue globale Events waren nicht noetig, weil:
    - Telemetry-Snapshot
    - Diag-Log
    - bestehende lokale Statusobjekte
    bereits genug Trennschaerfe liefern

- Umgesetzte Dateien:
  - `app/modules/assistant-stack/intent/index.js`
  - `app/modules/hub/index.js`
  - `app/modules/assistant-stack/voice/index.js`

- Durchgefuehrte Checks:
  - Syntax:
    - `node --check app/modules/assistant-stack/intent/index.js` PASS
    - `node --check app/modules/hub/index.js` PASS
    - `node --check app/modules/assistant-stack/voice/index.js` PASS
  - Runtime-Smoke:
    - `recordTelemetry(...)` mit `blocked_local` und `handled`
    - `getTelemetrySnapshot()` liefert korrekt:
      - `by_outcome`
      - `recent[*].outcome`
    PASS

- Wichtigste Leitplanke fuer S7:
  - Die Outcome-Taxonomie ist jetzt nicht nur im Verhalten, sondern auch in Telemetry/Diag sichtbar
  - Damit koennen die Smokechecks in S7 jetzt gezielt zwischen semantischem Fallback und lokalem Blocker unterscheiden

### S7 - Smokechecks und Guard-Regressionen
- S7.1 `open_module`
  - bei stabilem Auth-State
  - bei `auth-unknown`
  - bei fruehem Stage-State
- S7.2 `intake_save`
  - bei stabilem Auth-State
  - bei `auth-unknown`
  - keine LLM-Fallback-Verdeckung lokaler Guard-Probleme
- S7.3 Voice
  - lokaler Direct-Match handled
  - lokaler Blocker
  - semantischer Fallback
- S7.4 Confirm-/Pending-Pfade auf unveraenderte Guard-Disziplin pruefen.
- S7.5 Syntaxchecks und gezielte statische Guards.

#### S7 Ergebnisprotokoll (abgeschlossen)
- S7.1 Befund (`open_module` und parsernahe Positivfaelle):
  - Gegen den aktuellen Intent-Surface geprueft:
    - `Oeffne Vitals`
    - `Wasser 300 ml`
    - `Trage mir 300 ml Fluessigkeit ein`
    - `Gewicht 78,4`
    - `Blutdruck morgens 128 zu 82`
  - Ergebnis:
    - alle Faelle liefern lokal weiterhin `decision = direct_match`
    - `open_module` bleibt ueber den neuen UI-safe Pfad von Write-Guarding getrennt
    - `intake_save` / `vitals_log_weight` / `vitals_log_bp` bleiben semantisch korrekt im `direct_match`, ohne am Parservertrag zu aendern
  - Wichtige Verifikationsaussage:
    - Die neue Execution-Reliability-Schicht hat den semantischen Intent-Kern nicht aufgeweicht.

- S7.2 Befund (`guarded_write` / lokale Blocker statt Assistant-Fallback):
  - Gegen den aktuellen Outcome-Vertrag statisch geprueft:
    - `blocked_local`
    - `unsupported_local`
    - `fallback_semantic`
  - Hub:
    - `dispatchAssistantIntentDirectMatch(...)` liefert jetzt explizit `outcome`
    - `resolveAssistantIntentFallbackRoute(...)` mappt `blocked_local` und `unsupported_local` auf `shouldCallAssistant = false`
    - `sendAssistantChatMessage(...)` bricht fuer solche lokalen `direct_match`-Faelle vor `fetchAssistantTextReply(...)` ab
  - Wichtige Verifikationsaussage:
    - Lokal erkannte, aber blockierte Ausfuehrungen werden im Text-Pfad nicht mehr als Backend-/Assistant-Problem maskiert.

- S7.3 Befund (Voice-Execution-Vertrag gespiegelt):
  - Gegen den aktuellen Voice-Pfad geprueft:
    - lokaler `direct_match`
    - lokaler Blocker
    - semantischer Fallback
  - Voice:
    - `dispatchVoiceIntentDirectMatch(...)` liefert denselben `outcome`-Vertrag wie Hub
    - `resolveVoiceIntentRoute(...)` haelt `blocked_local` / `unsupported_local` lokal
    - `finalizeVoiceIntentBlocked(...)` liefert eine lokale TTS-Rueckmeldung statt `handleAssistantRoundtrip(...)`
  - Wichtige Verifikationsaussage:
    - Text und Voice driften im Execution-Vertrag nicht mehr auseinander.

- S7.4 Befund (Confirm-/Pending-Guard-Disziplin unveraendert):
  - Parser-/Context-Harness mit gueltigem Pending Context geprueft fuer:
    - `ja`
    - `nein`
    - `speichern`
    - `abbrechen`
  - Ergebnis:
    - alle vier Faelle liefern weiterhin:
      - `decision = needs_confirmation`
      - `reason = pending-context-confirmable`
      - `context_state.usable = true`
  - Wichtige Verifikationsaussage:
    - Die Execution-Reliability-Aenderungen haben den bestehenden Confirm-/Pending-Contract nicht regressiv veraendert.

- S7.5 Befund (Telemetry / Syntax / statische Guards):
  - Intent-Telemetry-Harness geprueft:
    - `recordTelemetry(...)`
    - `getTelemetrySnapshot()`
  - Ergebnis:
    - `by_outcome` zaehlt korrekt u. a.:
      - `handled`
      - `blocked_local`
    - `recent[*].outcome` wird korrekt ausgegeben
  - Syntaxchecks:
    - `app/modules/assistant-stack/intent/normalizers.js`
    - `app/modules/assistant-stack/intent/rules.js`
    - `app/modules/assistant-stack/intent/validators.js`
    - `app/modules/assistant-stack/intent/context.js`
    - `app/modules/assistant-stack/intent/parser.js`
    - `app/modules/assistant-stack/intent/index.js`
    - `app/modules/assistant-stack/assistant/actions.js`
    - `app/modules/assistant-stack/assistant/allowed-actions.js`
    - `app/modules/hub/index.js`
    - `app/modules/assistant-stack/voice/index.js`
    - alle `node --check` PASS
  - Zusaetzlicher statischer Guard-Abgleich:
    - `executeUiSafeAllowedAction(...)`
    - `dispatchUiSafeAssistantAction(...)`
    - `buildAssistantLocalIntentBlockedReply(...)`
    - `buildVoiceLocalIntentBlockedReply(...)`
    - `resolveAssistantIntentFallbackRoute(...)`
    - `resolveVoiceIntentRoute(...)`
    - `assistant:intent-llm-bypass`
    - alle erwarteten Contracts vorhanden

- Durchgefuehrte Checks:
  - Sammel-`node --check` ueber Intent-/Assistant-/Hub-/Voice-Scope PASS
  - Runtime-Harness ueber `createAdapterInput(...)` + `parseAdapterInput(...)` fuer:
    - Positivfaelle
    - Negativ-/Fallback-Faelle
    - Confirm-Kontext
    PASS
  - Runtime-Harness fuer Intent-Telemetry (`handled`, `blocked_local`) PASS
  - Statischer Guard-/Route-Abgleich fuer Hub + Voice PASS

### S8 - Abschluss, Doku-Sync, QA, Changelog
- S8.1 Statusmatrix finalisieren.
- S8.2 `docs/modules/Intent Engine Module Overview.md` auf den neuen Execution-Contract ziehen.
- S8.3 `docs/modules/Assistant Module Overview.md` / `Hub Module Overview.md` bei Bedarf nachziehen.
- S8.4 `docs/QA_CHECKS.md` um Execution-Reliability-Regressions erweitern.
- S8.5 `CHANGELOG.md` unter `Unreleased` ergaenzen.
- S8.6 Rest-Risiken dokumentieren:
  - spaeterer Retry-/Queue-Entscheid
  - Voice-Confirm-Pending-Context

#### S8 Ergebnisprotokoll (abgeschlossen)
- S8.1 Befund (Statusmatrix finalisiert):
  - `S1` bis `S8` stehen jetzt auf dem tatsaechlich erreichten Execution-Reliability-Stand.
  - Die Roadmap dokumentiert damit auch die spaeter verifizierten Runtime-Fixes fuer:
    - lokale `open_module`-Ausfuehrung
    - lokalen `intake_save`-Refresh im Assistant-Kontext
    - lokale Fehlerkommunikation statt irrefuehrender Backend-Meldung

- S8.2 Befund (Intent-Engine-Overview nachgezogen):
  - `docs/modules/Intent Engine Module Overview.md`
    - fuehrt jetzt den expliziten Execution-Contract mit:
      - `handled`
      - `blocked_local`
      - `unsupported_local`
      - `fallback_semantic`
    - dokumentiert den UI-safe Pfad fuer `open_module`
    - dokumentiert die jetzt verifizierten natuerlichen Intake-Formen:
      - `Trage 300ml Wasser ein`
      - `Trage 300 ml Wasser ein`
      - `Trage mir 300 ml Wasser ein`
    - dokumentiert, dass `Ã–ffne Vitals` und `Oeffne Vitals` lokal normalisiert werden

- S8.3 Befund (Assistant-Overview nachgezogen):
  - `docs/modules/Assistant Module Overview.md`
    - trennt den Assistant-Flow jetzt klarer in:
      - lokale erfolgreiche Ausfuehrung
      - lokaler Blocker
      - semantischer Assistant-Fallback
    - ergaenzt den UI-safe `open_module`-Pfad und die lokale Fehlerabgrenzung gegenueber `Assistant nicht erreichbar.`

- S8.4 Befund (QA erweitert):
  - `docs/QA_CHECKS.md`
    - neue Phase fuer Execution-Reliability-Regression ergaenzt
    - deckt ab:
      - `open_module`
      - natuerliche Wasser-Formen
      - lokale Blocker statt Backend-Fallback
      - Telemetry-Outcome-Trennung
      - `statusEl`-/Refresh-Regression im Intake-Header

- S8.5 Befund (CHANGELOG ergaenzt):
  - `CHANGELOG.md`
    - `Changed`/`Fixed` spiegeln jetzt:
      - UI-safe `open_module`
      - Outcome-Taxonomie fuer lokale Intent-Ausfuehrung
      - robuste Normalisierung fuer `Ã–ffne` und zusammengezogene Einheiten wie `300ml`
      - Fixes fuer Hub-Scope und Intake-Refresh im Assistant

- S8.6 Befund (Rest-Risiken dokumentiert):
  - offen bleiben weiterhin nur bewusst ausgesparte Themen:
    - spaetere Retry-/Queue-Entscheidung fuer lokal blockierte Writes
    - produktiver Pending-Context fuer Voice-Confirms

## Smokechecks / Regression (Definition)
- `direct_match` + lokaler Execution-Fehler erzeugt keine irrefuehrende Backend-Fehlermeldung mehr.
- `open_module` funktioniert lokal auch dann, wenn Auth noch nicht stabil ist, solange UI/Stage bereit ist.
- `guarded_write` bleibt blockiert, wenn Auth/Stage/Supabase nicht bereit sind.
- Blockierte lokale Writes werden lokal sauber kommuniziert, nicht an `midas-assistant` verschoben.
- Text und Voice unterscheiden beide sauber zwischen:
  - semantischem Fallback
  - lokalem Blocker
  - erfolgreichem lokalen Bypass

## Abnahmekriterien
- Die Ursache eines fehlgeschlagenen lokalen Intents ist im Verhalten und in der Diagnose klar erkennbar.
- `open_module` ist als `safe_read` technisch vom Write-Guarding getrennt, ohne neue Sicherheitsluecke.
- `intake_save` und lokale Vitals-Writes bleiben konservativ guard-railed.
- Text und Voice verwenden denselben fachlichen Execution-Contract.
- Dokumentation und QA spiegeln die neue Trennung zwischen Parser-Entscheidung und lokaler Ausfuehrung.

## Risiken
- `open_module` zu frueh zu breit aus dem Guard loesen koennte implizit geschuetzte UI-Pfade aufweichen.
- Zu viele spezielle `reason`-Strings ohne zentrale Taxonomie fuehren wieder zu Drift.
- Wenn `blocked_local`-Nachrichten zu technisch werden, wird die UX unnÃ¶tig hart.
- Wenn `blocked_local`-Faelle doch noch teilautomatisch ins Backend kippen, bleibt die eigentliche Verwirrung bestehen.
- Voice kann leicht von Text abdriften, wenn dieselbe Outcome-Taxonomie nicht strikt gespiegelt wird.
