# Voice Command Reactivation Roadmap

## Ziel (klar und pruefbar)
In MIDAS soll Voice als deterministische, intent-first Sprachschnittstelle reaktiviert und modernisiert werden. Der primaere Zweck ist schnelle, alltagstaugliche Dateneingabe im Hero Hub per Push-to-talk, insbesondere fuer Intake und Medikation. LLM-Interaktion ist nicht Teil des normalen Voice-Kontrollflusses.

Pruefbare Zieldefinition:
- Im Hero Hub gibt es wieder einen produktiven Push-to-talk Voice-Einstieg.
- Voice V1 verarbeitet haeufige strukturierte Sprachkommandos deterministisch und ohne `midas-assistant` im Normalpfad.
- Voice V1 deckt sowohl Einzelkommandos als auch zusammengesetzte Morning-Befehle ab.
- Nach STT geht Voice standardmaessig in einen lokalen Command-Pfad:
  - `transcript -> command parsing -> intent dispatch -> kurze bestaetigung`
- Wenn ein Befehl nicht sauber erkannt wird, antwortet das System lokal und kurz, statt automatisch in einen LLM-Dialog zu wechseln.
- VAD beendet Sprachsegmente sauber nach Stille.
- Gesprochene Rueckmeldungen bleiben funktional, kurz und nicht-konversationell.
- Wake-word / Always-on bleibt bewusst ausserhalb von V1.

## Scope
- Reaktivierung des bestehenden Voice-Moduls im Hero Hub.
- Produktiver Push-to-talk-Einstieg fuer Voice V1.
- Reaktivierung des MIDAS-Pfeils als permanenter, zentraler Voice-Slot im Hub-Karussell.
- Voice V1 als Command Interface fuer strukturierte Eingaben.
- Intake-first Command-Scope:
  - Wasser
  - Salz
  - Protein
  - Medikation / Tabletteneinnahme
  - relevante Confirm-/Reject-Intents nur fuer explizite Pending-Contexts
- Unterstuetzung fuer:
  - Einzelkommandos
  - zusammengesetzte Morning-Befehle
- VAD-gestuetzter Auto-Stop von Sprachsegmenten.
- Lokaler Command-Orchestrator fuer:
  - Transkript-Normalisierung
  - Segmentierung / Splitten zusammengesetzter Befehle
  - Teil-Intent-Erkennung
  - Batch-Dispatch
  - zusammengefasste Rueckmeldung
- Kurzer TTS-Rueckkanal fuer Confirmations und lokale Fehler-/Blocker-Hinweise.
- QA-Smokes fuer Push-to-talk, Command Orchestration / Parsing, Batch-Dispatch und Confirm-Verhalten.

## Not in Scope
- Conversational Assistant-Voice als V1-Ziel.
- Automatischer LLM-Fallback im normalen Voice-Kontrollfluss.
- Wake-word / Always-on / permanentes Mikrofon-Listening in V1.
- App-weite verstreute Mikrofon-Buttons in allen Modulen.
- Freie sprachliche Vollsteuerung der gesamten App in V1.
- Freie Beratungsfragen per Voice als Pflichtpfad.
- Blutdruck-/Vitals-Steuerung per Voice als V1-Pflicht.
- Terminanlage per Voice als V1-Pflicht.
- Neue externe Speech-/Wake-word-Libraries oder Framework-Wechsel.
- Verlagerung der Voice-Command-Logik ins Backend.
- Native-App-spezifische Audio-Background-Modi.

## Relevante Referenzen (Code)
- `app/modules/assistant-stack/voice/index.js`
- `app/modules/hub/index.js`
- `app/modules/assistant-stack/intent/index.js`
- `app/modules/assistant-stack/intent/parser.js`
- `app/modules/assistant-stack/assistant/actions.js`
- `app/modules/assistant-stack/assistant/allowed-actions.js`
- `app/modules/intake-stack/intake/index.js`
- `index.html`
- `app/styles/hub.css`
- `C:\Users\steph\Projekte\midas-backend\supabase\functions\midas-transcribe\index.ts`
- `C:\Users\steph\Projekte\midas-backend\supabase\functions\midas-tts\index.ts`
- `C:\Users\steph\Projekte\midas-backend\supabase\functions\midas-assistant\index.ts` (nur fuer bewusste Abgrenzung / optionalen Sonderpfad)

## Relevante Referenzen (Doku)
- `docs/modules/Assistant Module Overview.md`
- `docs/modules/Hub Module Overview.md`
- `docs/modules/VAD Module Overview.md`
- `docs/modules/Intent Engine Module Overview.md`
- `docs/archive/Intent Engine Implementation Roadmap (DONE).md` (Vorlagenstruktur)
- `docs/archive/Intent Engine Execution Reliability Roadmap (DONE).md`
- `docs/QA_CHECKS.md`
- `CHANGELOG.md`

## Guardrails
- Voice V1 bleibt push-to-talk; kein verstecktes Always-on in dieser Roadmap.
- Voice ist in V1 kein Chatbot, sondern eine deterministische Kommando-Schnittstelle.
- LLM-Fallback ist nicht Teil des normalen Voice-Kontrollflusses.
- Nicht erkannte Befehle fuehren zu einer kurzen lokalen Rueckmeldung, nicht automatisch zu einem Assistant-Roundtrip.
- Keine Auto-Retry-Loops, keine implizite semantische Uminterpretation und kein versteckter zweiter Parser-Pfad fuer nicht erkannte Befehle.
- Confirm-/Reject-Voice-Intents duerfen nur mit einem aktiven, explizit erzeugten Pending Intent Context mit TTL und Single-Consume-Semantik ausfuehren.
- VAD darf Sessions beenden, aber keine bestaetigten Pending-Contexts unsauber verwerfen.
- Gesprochene Rueckmeldungen muessen kurz und funktional bleiben; keine ausufernden TTS-Antworten.
- Der Morning-Use-Case mit Mehrfachwerten darf nicht still nur teilweise verarbeitet werden.
- Bei zusammengesetzten Befehlen muss jede erkannte Teilaktion entweder ausgefuehrt und rueckgemeldet oder explizit abgelehnt und rueckgemeldet werden; stille Teilverluste sind verboten.
- Einzelbefehle duerfen durch die Unterstuetzung von Mehrfachbefehlen nicht regressiv schlechter oder unzuverlaessiger werden.
- Destruktive oder strukturelle Datenoperationen bleiben ausserhalb von Voice V1.
- Bestehende Auth-/Stage-/Voice-Gates duerfen nicht blind gelockert werden; jede Lockerung braucht eine klar dokumentierte Sicherheitsbegruendung.

## Architektur-Constraints
- Der produktive Voice-Einstieg bleibt zentral im Hero Hub.
- Der MIDAS-Pfeil ist fuer Voice V1 kein einmaliges Intro-Element, sondern ein permanenter Carousel-Slot und der offizielle Push-to-talk-Einstieg.
- Der MIDAS-Pfeil darf nicht nach der ersten Carousel-Bewegung verschwinden; die fruehere Park-/Intro-Sonderlogik ist fuer Voice V1 aufzuheben oder explizit umzubauen.
- `app/modules/assistant-stack/voice/index.js` bleibt der Voice-Adapter; die Intent Engine wird nicht in das Voice-Modul kopiert.
- Der Standardpfad nach STT ist lokal und command-first:
  - `transcript -> command orchestrator -> normalized command units -> intent engine -> allowed action dispatch -> confirmation tts`
- Text und Voice muessen denselben fachlichen Intent-Surface nutzen, aber Voice darf zusaetzlich einen expliziten Compound-Command-Orchestrator haben.
- `midas-transcribe` bleibt reines STT.
- `midas-tts` bleibt Sprach-Ausgabe, nicht Decision-Layer.
- `midas-assistant` ist nicht Teil der produktiven Voice-V1-Ausfuehrung.
- Ein spaeterer Sonderpfad darf hoechstens als Legacy- oder explizit deaktivierte Erweiterung bestehen, aber nicht fuer produktives Command-Handling vorausgesetzt werden.
- VAD bleibt ein Session-Helfer fuer Segmentierung / Auto-Stop, nicht Wake-word-Ersatz.
- Voice V1 braucht eine explizite State-Machine; implizite Statuswechsel zwischen `idle`, `listening`, `thinking`, `speaking`, `error` genuegen nicht als lose Annahmen.
- Hub-Gate, Auth-Gate und Boot-Stage muessen Voice kontrolliert oeffnen bzw. blockieren, ohne zu stillen Fehlzustaenden zu fuehren.
- Zusammengesetzte Voice-Befehle brauchen einen expliziten Aggregations-/Split-Contract:
  - mehrere deterministische Teil-Intents lokal aus einem Transkript ableiten
  - oder bewusst mit klarer lokaler Fehlermeldung ablehnen
  - aber nicht still nur einen Teil des Morning-Befehls verarbeiten

## Tool Permissions
Allowed:
- Bestehende Voice-/Hub-/Intent-/Assistant-Dateien lesen und innerhalb Scope aendern.
- Doku-, QA- und Changelog-Eintraege in bestehenden Ordnern erstellen/aktualisieren.
- Lokale Smokechecks, Syntaxchecks und gezielte Harness-Checks ausfuehren.
- Bestehende Backend-Function-Implementierungen lesen und gegen den geplanten Voice-Pfad abgleichen.

Forbidden:
- Neue Dependencies fuer Wake-word oder Audio-Frameworks einfuehren.
- Voice-Command-Logik in `midas-assistant` als primaeren Parser verschieben.
- Always-on/Wake-word ungeprueft in V1 hineinziehen.
- Unverwandte Module grossflaechig refactoren.

## Execution Mode
- Sequenziell arbeiten (`S1` bis `S8`).
- Keine Schritte ueberspringen ohne dokumentierte Begruendung.
- Nach jedem Schritt Statusmatrix aktualisieren.
- Nach jedem Schritt mindestens ein Check (Smoke/Sanity/Syntax).

## Statusmatrix
| ID | Schritt | Status | Ergebnis/Notiz |
|---|---|---|---|
| S1 | Ist-Analyse Voice/Hub/VAD/Backend-Entry-Points | DONE | Ist-Stand gemappt; command-first Luecken klar markiert |
| S2 | V1-Command-Scope, Single-/Compound-Contract und Antwortpolitik finalisieren | DONE | V1-Command-Vertrag, Medikationspfad und Antwortpolitik festgezogen |
| S3 | Hero-Hub Push-to-talk und Voice-State-Machine schneiden | DONE | Voice-Einstieg reaktiviert, V1-State-Machine aktiv und normaler Assistant-Roundtrip aus dem Voice-Normalpfad entfernt |
| S4 | Local Command Orchestrator und Intent-Preflight auf V1-Flow modernisieren | DONE | S4.1-S4.6 umgesetzt; lokaler Orchestrator, Batch-Dispatch und lokale Reply-Policy aktiv |
| S5 | Medikation, Compound Morning Commands und Confirm-Verhalten stabilisieren | DONE | S5.1-S5.6 umgesetzt; Medikation, Morning-Parsing, Confirm-Vertrag und VAD-/Pending-Haertung sind fuer Voice V1 zusammengezogen |
| S6 | TTS-Rueckkanal und lokale/blockierte Voice-Rueckmeldungen finalisieren | DONE | S6.1-S6.6 umgesetzt; TTS-Antworten sind kuerzer, operative Voice-Fehler sind getrennt und Voice-Outcomes sind jetzt diag-seitig sauber getrennt nachvollziehbar |
| S7 | Smokechecks, Gate-/Command-/Confirm-Regressionen | DONE | S7.1-S7.5 verifiziert; Positivfaelle gruen, Negativfaelle lokal abgelehnt, VAD-/Confirm-Harness und statische Guards sauber |
| S8 | Doku-Sync, QA_CHECKS, CHANGELOG | DONE | Modul-Overviews, QA_CHECKS und CHANGELOG auf finalen Voice-V1-Stand synchronisiert |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Schritte + Subschritte

### S1 - Ist-Analyse Voice/Hub/VAD/Backend-Entry-Points
- S1.1 Produktiven Hero-Hub-Einstieg und aktuellen `VOICE_PARKED`-/Gate-Status in `app/modules/hub/index.js` mappen.
- S1.2 Voice-Modul `app/modules/assistant-stack/voice/index.js` gegen den realen Ist-Stand lesen:
  - Recording
  - STT
  - VAD
  - Intent-Preflight
  - local dispatch
  - TTS
  - conversation-first Altlogik
- S1.3 VAD-Rolle und reale Abhaengigkeit fuer Auto-Stop / Stille / Segmentierung gegen den geplanten Command-Flow abgleichen.
- S1.4 Backend-Funktionen `midas-transcribe`, `midas-tts`, optional `midas-assistant` gegen den command-first Zielpfad abgleichen.
- S1.5 Vorhandene Intent-Engine-Abdeckung gegen den realen Voice-V1-Use-Case (`Wasser`, `Salz`, `Protein`, Medikation, Confirms) mappen.
- S1.6 Pruefen, ob der aktuelle Intent-/Assistant-Stack bereits einen belastbaren Datenvertrag fuer kombinierte Morning-Befehle hat oder ob dafuer ein expliziter Split-/Aggregation-Contract noetig ist.
- S1.7 Markieren, welche Teile des aktuellen Voice-Moduls noch conversation-first sind und fuer V1 vereinfacht oder entfernt werden koennen.

#### S1 Ergebnisprotokoll
- `S1.1` Hero-Hub-Einstieg und Gate-Status in `app/modules/hub/index.js` gegen den realen Code gemappt:
  - der Voice-Einstieg ist weiterhin zentral ueber `assistant-voice` im Hub vorgesehen
  - `VOICE_PARKED = true` blockiert aktuell die produktive Initialisierung des Voice-Moduls
  - der Hub stellt bereits eine geparkte Voice-Fassade mit Gate-/Status-Hooks bereit
  - `getVoiceGateStatus()`, `isVoiceReady()` und `onVoiceGateChange(...)` sind vorhanden
  - Schlussfolgerung:
    - der geplante zentrale Hero-Hub-Einstieg passt zum aktuellen System
    - fuer V1 muss nicht neu verteilt, sondern der bestehende zentrale Einstieg reaktiviert werden
- `S1.2` Voice-Modul `app/modules/assistant-stack/voice/index.js` gegen den realen Ist-Stand gelesen:
  - vorhandene produktive Bausteine:
    - Mikrofonaufnahme / `MediaRecorder`
    - STT ueber `transcribeAudio(...)`
    - VAD-Controller
    - Intent-Preflight
    - lokaler Direct-Dispatch fuer freigegebene Intents
    - lokaler TTS-Rueckkanal
  - weiterhin vorhandene Altlogik:
    - `conversationMode`
    - `conversationEndPending`
    - `scheduleConversationResume()`
    - `END_PHRASES`
    - `handleAssistantRoundtrip(...)`
    - `fetchAssistantReply(...)`
    - `VOICE_FALLBACK_REPLY`
  - Schlussfolgerung:
    - das Modul ist nicht leer oder tot, sondern bereits hybrid
    - fuer Voice V1 muss vor allem conversation-first Verhalten reduziert werden, nicht das gesamte Modul neu erfunden werden
- `S1.3` VAD-Rolle gegen den command-first Zielpfad abgeglichen:
  - VAD ist heute technisch bereits Session-/Silence-Helfer fuer Auto-Stop
  - diese Rolle passt auch fuer Voice V1
  - problematisch ist nicht VAD selbst, sondern seine aktuelle Einbettung in Resume-/Conversation-Annahmen
  - Schlussfolgerung:
    - VAD bleibt in V1 erhalten
    - VAD wird als Segment-Ende-Erkennung fuer Commands gerahmt, nicht als Gespraechshelfer
- `S1.4` Backend-Funktionen gegen den command-first Zielpfad abgeglichen:
  - `midas-transcribe` ist bereits sauber als reines STT geschnitten
  - `midas-tts` ist bereits sauber als reine Sprach-Ausgabe geschnitten
  - `midas-assistant` ist weiterhin conversation-/assistant-first und damit ausserhalb des produktiven Voice-V1-Normalpfads einzuordnen
  - Schlussfolgerung:
    - `midas-transcribe` und `midas-tts` koennen unveraendert in den V1-Pfad passen
    - `midas-assistant` bleibt nur Legacy-/Abgrenzungsreferenz, nicht Ausfuehrungskern von Voice V1
- `S1.5` aktuelle Intent-Abdeckung gegen den realen Voice-V1-Use-Case gemappt:
  - heute produktiv vorhanden im Intent-Kern:
    - `Wasser`
    - `Salz`
    - `Protein`
    - `confirm_reject`
    - enge Navigation (`Oeffne Vitals`, `Gehe zu Medikamente`)
  - heute nicht produktiv vorhanden im Intent-Kern:
    - eigenstaendiger Medikations-Intent
    - sprachlicher Batch-/Morning-Intent
  - gleichzeitig existiert bereits ein produktiver lokaler Medikations-API-Pfad:
    - `AppModules.medication.confirmMedication(...)`
    - Batch-Bestaetigung im Intake-UI ueber `handleMedicationBatchConfirm()`
  - Schlussfolgerung:
    - Medikation ist fuer V1 technisch erreichbar, aber noch nicht als Voice-/Intent-Contract modelliert
    - S5 muss Medikation an einen expliziten Voice-Command-Vertrag anbinden
- `S1.6` Datenvertrag fuer kombinierte Morning-Befehle geprueft:
  - aktueller Intent-Stack ist auf einzelne normalisierte Kommandos ausgelegt
  - es gibt heute keinen expliziten Orchestrator fuer:
    - Splitten eines Transkripts in mehrere Command Units
    - Batch-Dispatch
    - aggregierte Erfolgs-/Fehler-Rueckmeldung
  - es existiert auch kein sichtbarer Vertrag fuer teilweisen Morning-Command-Dispatch mit outcome-sichtbarer Sammelrueckmeldung
  - Schlussfolgerung:
    - der Compound-Morning-Use-Case braucht einen neuen expliziten Split-/Aggregation-Contract
    - diese Luecke ist real und gehoert in S2/S4, nicht in Ad-hoc-Matching
- `S1.7` conversation-first Altteile fuer Vereinfachung/Entfernung markiert:
  - starke Kandidaten fuer Reduktion oder klare Neu-Rahmung:
    - `conversationMode`
    - `conversationEndPending`
    - `scheduleConversationResume()`
    - `END_PHRASES`
    - `VOICE_FALLBACK_REPLY`
    - `handleAssistantRoundtrip(...)`
    - `fetchAssistantReply(...)`
    - `isConversationMode()`
  - beibehaltene Kernteile:
    - Recording
    - STT
    - VAD-Auto-Stop
    - Intent-Preflight
    - lokaler Dispatch
    - lokaler TTS-Rueckkanal
  - Schlussfolgerung:
    - Voice V1 ist primar ein Vereinfachungs- und Umrahmungsprojekt, kein kompletter Rewrite
- Wichtige Gesamtverifikation:
  - der aktuelle Codezustand ist kompatibel mit einem command-first Voice-V1-Schnitt
  - die Hauptarbeit liegt nicht im Backend, sondern in:
    - Scope-Schnitt
    - Orchestrator-Vertrag
    - Medikations-Anbindung
    - Reduktion conversation-first Altlogik
- Durchgefuehrte Checks:
  - Repo-Scan auf Voice-/Intent-/Medication-/Hub-Einstieg durchgefuehrt
  - `node --check app/modules/assistant-stack/voice/index.js` PASS
  - `node --check app/modules/hub/index.js` PASS

### S2 - V1-Command-Scope, Single-/Compound-Contract und Antwortpolitik finalisieren
- S2.1 Voice V1 bewusst auf `Hero Hub + push-to-talk + intake-first + medication-first` festziehen.
- S2.2 Finale Voice-V1-Command-Klassen festziehen:
  - Einzel-Intake
  - Medikation
  - relevante Confirm-/Reject-Intents
  - kombinierte Morning-Befehle als expliziter V1-Pfad
- S2.3 Bewusste Nicht-Ziele eng halten:
  - Termine
  - freie App-Navigation als Pflicht
  - Wake-word
  - Assistant-Dialoge
- S2.4 Single-Command-Contract finalisieren:
  - wie ein einzelner Befehl aussieht
  - welche Parameter Pflicht sind
  - wann abgelehnt wird
- S2.5 Compound-Command-Contract finalisieren:
  - wie mehrere Teilkommandos in einem Satz erkannt werden
  - wann lokal gesplittet wird
  - wie Teilerfolge / Teilfehler zurueckgemeldet werden
- S2.6 Gesprochene Antwortpolitik finalisieren:
  - lokale Treffer kurz
  - lokale Blocker klar
  - nicht erkannte Befehle knapp
  - keine unnötige Konversation
- S2.7 Wake-word / Always-on bewusst als spaeteren Anschlussblock markieren, nicht als implizites V1-Ziel.

#### S2 Ergebnisprotokoll
- `S2.1` Voice V1 bewusst auf den realen Alltagskern festgezogen:
  - zentraler Hero-Hub Push-to-talk
  - intake-first
  - medication-first
  - kein app-weites Sprachsteuerungsversprechen in V1
  - kein konversationeller Assistant-Anspruch in V1
- `S2.2` finale Voice-V1-Command-Klassen festgezogen:
  - `single_intake_command`
    - Wasser
    - Salz
    - Protein
  - `single_medication_command`
    - alltagsnaher Medikationseintrag mit Fokus auf:
      - `ich habe meine medikamente genommen`
      - `ich habe alle meine medikamente genommen`
      - `tabletten genommen`
    - V1-Ziel ist zunaechst die taegliche Sammelbestaetigung vorhandener offener Medikamente, nicht freie Einzelmedikationssprache
  - `confirm_reject_command`
    - nur fuer explizite Pending Contexts
    - `ja`
    - `nein`
    - `speichern`
    - `abbrechen`
  - `compound_morning_command`
    - mehrere Intake-Werte plus optionale Medikation in einem Transkript
    - expliziter V1-Pfad, kein spaeteres Nice-to-have
- `S2.3` bewusste Nicht-Ziele nochmals eng gezogen:
  - keine freie Beratungs-/Dialog-Voice
  - keine Terminanlage als V1-Pflicht
  - keine Blutdruck-/Vitals-Steuerung als V1-Pflicht
  - keine freie Navigation als V1-Pflicht
  - `open_module` darf spaeter moeglicher Utility-Pfad bleiben, ist aber kein Kern-Abnahmekriterium fuer Voice V1
- `S2.4` Single-Command-Contract finalisiert:
  - eine `normalized command unit` repraesentiert genau eine deterministische Aktion
  - Pflicht fuer Intake:
    - klare Metrik
    - klare Zahl
    - klare Einheit
  - Pflicht fuer Medikation:
    - klarer Sammel-/Taken-Befehl ohne Ambiguitaet
  - Ablehnungsgruende fuer Single Commands:
    - fehlende Zahl oder Einheit
    - mehrere fachlich verschiedene Aktionen in einer Unit
    - vage Sprache
    - historische oder editierende Semantik
    - destruktive oder strukturelle Operationen
- `S2.5` Compound-Command-Contract finalisiert:
  - ein Compound-Morning-Befehl wird zuerst durch den Voice Command Orchestrator in mehrere `normalized command units` zerlegt
  - jede Teil-Unit wird danach einzeln an die Intent Engine gegeben
  - jede Teil-Unit muss outcome-sichtbar behandelt werden:
    - ausgefuehrt und rueckgemeldet
    - oder abgelehnt und rueckgemeldet
  - stille Teilverluste sind verboten
  - es gibt keinen versteckten Zweitversuch und kein implizites „den Rest ignorieren“
  - wenn Segmentierung lokal nicht zuverlaessig gelingt, ist die korrekte Reaktion:
    - den gesamten Befehl lokal mit klarer kurzer Rueckmeldung ablehnen
    - nicht teilweise „halb richtig“ speichern
- `S2.5` Morning-V1-Fokus zusaetzlich konkretisiert:
  - Zielbeispiel:
    - `Midas, ich habe 780 Milliliter Wasser getrunken, 0,4 Gramm Salz, 32 Gramm Protein und alle Medikamente genommen`
  - daraus muessen lokal ableitbar sein:
    - ein Wasser-Teilkommando
    - ein Salz-Teilkommando
    - ein Protein-Teilkommando
    - optional ein Medikations-Teilkommando
  - Reihenfolge im Satz ist kein fachlicher Vertrag; entscheidend ist, dass die Teilkommandos explizit und vollstaendig sind
- `S2.6` Antwortpolitik finalisiert:
  - lokale Treffer:
    - kurz
    - funktional
    - nicht dialogisch
  - Beispiele:
    - `300 Milliliter Wasser eingetragen.`
    - `Medikation bestaetigt.`
    - `Wasser, Salz, Protein und Medikation eingetragen.`
  - lokale Blocker:
    - kurz
    - klar
    - ohne interne Technikbegriffe
  - nicht erkannte Befehle:
    - kurze lokale Rueckmeldung
    - kein Assistant-/LLM-Roundtrip
    - keine Auto-Retry-Schleife
    - keine semantische Uminterpretation
- `S2.6` Confirm-/Reject-Politik finalisiert:
  - Confirm-/Reject ist nicht allgemeine Sprachlogik, sondern nur eine Reaktion auf einen aktiven, explizit erzeugten Pending Context
  - Pflichtmerkmale:
    - TTL
    - Single-Consume
    - keine Zombie-States
    - keine Doppeltrigger
- `S2.7` Wake-word / Always-on als spaeterer Anschlussblock markiert:
  - nicht Teil von Voice V1
  - V1 baut nur den command-first Push-to-talk Pfad sauber auf
- Wichtige Gesamtverifikation:
  - die bestehende Intent Engine deckt den Intake-Teil bereits weitgehend ab
  - Medikation braucht fuer Voice V1 einen expliziten Sammelvertrag und lokale Orchestrierung
  - der groesste neue fachliche Vertrag ist nicht STT oder TTS, sondern:
    - `single command unit`
    - `compound morning command`
    - `sichtbarer Outcome je Teilkommando`
- Durchgefuehrte Checks:
  - Abgleich gegen aktuellen Intent-/Hub-/Medication-Stand durchgefuehrt
  - Parser-/Flow-Review bestaetigt:
    - heute kein expliziter Compound-Contract vorhanden
    - heute kein Voice-Medikationsvertrag vorhanden
    - S2-Definition ist damit ein notwendiger neuer Schnitt, keine doppelte Dokumentation

### S3 - Hero-Hub Push-to-talk und Voice-State-Machine schneiden
- S3.1 Den MIDAS-Pfeil im Hero Hub als einzigen produktiven Voice-V1-Einstieg festziehen.
- S3.2 Den MIDAS-Pfeil vom geparkten/introhaften Altverhalten in einen permanenten zentralen Push-to-talk-Trigger ueberfuehren.
- S3.3 Hub-Voice-Gate gegen Boot/Auth/UI-Readiness sauber spezifizieren.
- S3.4 Sichtbare UI-Zustaende fuer Voice am MIDAS-Pfeil / im Hero Hub finalisieren.
- S3.5 Voice-State-Machine fuer den Command-Flow finalisieren:
  - `idle`
  - `listening`
  - `transcribing`
  - `parsing`
  - `executing`
  - `confirming`
  - `error`
- S3.6 Alte conversation-/resume-first Zustandsannahmen gegen den V1-Scope reduzieren.

#### S3.1 Ergebnisprotokoll
- Der MIDAS-Pfeil ist fuer Voice V1 fachlich als einziger produktiver Voice-Einstieg festgezogen.
- Der Einstieg bleibt zentral im Hero Hub und wird nicht auf mehrere Modul-Buttons verteilt.
- Der MIDAS-Pfeil ist damit:
    - permanenter zentraler Voice-Trigger
    - offizieller Push-to-talk-Trigger
    - kein separates "Voice-Modul" im Produktverstaendnis
    - kein nur beim App-Einstieg sichtbares Intro-Relikt
- Der fruehere Parkzustand war im Ist-Stand technisch sichtbar:
    - Voice war noch als altes Carousel-/Intro-Relikt gedacht
    - ein zentraler produktiver Default-Trigger im MIDAS-Orb fehlte noch
- Daraus folgt fuer die Umsetzung:
    - der produktive Voice-V1-Einstieg wird am bestehenden `assistant-voice`-/MIDAS-Pfeil-Anker reaktiviert
    - es wird kein zweiter paralleler Voice-Einstieg in der Quickbar oder in anderen Modulen aufgebaut
    - die Quickbar bleibt fuer Voice V1 ohne eigenen produktiven Mikro-/Voice-Button
- Bereits umgesetzte S3.1-Haertung im Code:
    - `app/modules/assistant-stack/voice/index.js` bindet Voice-Initialisierung jetzt nur noch an `[data-hub-module="assistant-voice"]`
    - der fruehere Fallback auf `[data-hub-module="assistant-text"]` ist entfernt
    - damit gibt es im produktiven Codepfad keinen zweiten stillen Voice-Einstieg mehr
#### S3.2 Ergebnisprotokoll
- `assistant-voice` ist wieder ein echter Carousel-Eintrag auf Position 1.
- Die visuelle Darstellung dieses ersten Carousel-Eintrags ist jetzt der MIDAS-Pfeil statt des alten Voice-Symbols.
- Der Carousel-Startzustand wird direkt auf Position 1 gesetzt; damit ist Voice beim App-Start ohne Swipe bereits sichtbar und klickbar.
- Die Quickbar bleibt bewusst unveraendert:
    - dort wird kein zweiter Voice-Button reaktiviert
    - Voice V1 behaelt genau einen produktiven Einstieg
- Umgesetzte Code-/Markup-Aenderungen:
    - `index.html`
      - `assistant-voice` im Carousel wieder aktiviert
      - Visual auf `assets/img/Idle_state.png` statt altem Voice-Icon umgestellt
    - `app/modules/hub/index.js`
      - `assistant-voice` wieder auf Position 1 in `CAROUSEL_MODULES` gesetzt
      - Carousel-Initialisierung auf aktiven Startzustand mit `assistant-voice`
    - `app/styles/hub.css`
      - keine sichtbare Overlay-Voice-Schicht mehr; der zentrale Voice-Eindruck kommt wieder aus dem aktiven ersten Carousel-Eintrag
- Bewusst noch nicht Teil von `S3.2`:
    - produktive Reaktivierung des Voice-Moduls selbst
    - Aufhebung von `VOICE_PARKED`
    - finale Sichtbarkeits-/State-Inszenierung des MIDAS-Pfeils waehrend `listening/transcribing/...`
    - diese Punkte bleiben fuer die naechsten S3-Substeps
- Durchgefuehrte Checks:
    - `node --check app/modules/hub/index.js` PASS
    - Markup-Check fuer `assistant-voice` als erstes Carousel-Item PASS

#### S3.3 Ergebnisprotokoll
- Das Hub-Voice-Gate ist jetzt explizit auf den sichtbaren ersten Carousel-Eintrag gespiegelt.
- Der `assistant-voice`-Eintrag traegt damit den produktiven Gate-Status des Voice-Facade-Vertrags auch dann sichtbar nach aussen, wenn Voice selbst noch geparkt ist.
- Final festgezogener Gate-Vertrag fuer den Hero-Hub-Einstieg:
    - `voice-parked`
    - `booting`
    - `auth-check`
    - `allowed`
- Der sichtbare Voice-Einstieg ist damit nicht mehr still tot:
    - gesperrte Zustaende werden am Button selbst markiert
    - `aria-disabled` wird gesetzt
    - ein kurzer technischer Label-/Title-Hinweis ist vorhanden
- Umgesetzte Code-/Style-Aenderungen:
    - `app/modules/hub/index.js`
      - Voice-Gate-Labeling fuer den ersten Carousel-Eintrag
      - Sync ueber `getVoiceFacade().getGateStatus()` und `onGateChange(...)`
    - `app/styles/hub.css`
      - dezente Lock-Darstellung fuer `assistant-voice` im Carousel
- Bewusst noch nicht Teil von `S3.3`:
    - produktive Reaktivierung von Voice
    - aktives Triggern von Push-to-talk bei `allowed`
    - finale visuelle Zustandsinszenierung fuer `listening/transcribing/executing`
- Durchgefuehrte Checks:
  - `node --check app/modules/hub/index.js` PASS

#### S3.4 Ergebnisprotokoll
- Die sichtbaren UI-Zustaende fuer Voice am MIDAS-Pfeil sind jetzt als eigener UI-Layer auf den bestehenden Runtime-States vorbereitet.
- Der sichtbare Voice-Einstieg traegt jetzt am ersten Carousel-Eintrag:
  - `data-voice-state`
  - `data-voice-label`
  - `aria-label`
- Sichtbare Rueckmeldung am MIDAS-Pfeil:
  - eine Statuskapsel unter dem Pfeil zeigt den aktuellen Voice-Label-Zustand
  - `listening`, `transcribing`, `parsing`, `executing`, `confirming` und `error` bekommen eigene visuelle Tonalitaeten
  - gesperrte Zustaende uebernehmen weiter den Gate-Hinweis aus `S3.3`
- Wichtige Schnittentscheidung:
  - `S3.4` finalisiert nur die sichtbare UI-Rueckmeldung am Hero-Hub-Einstieg
  - die eigentliche V1-State-Machine mit den Zielzustaenden
    - `transcribing`
    - `parsing`
    - `executing`
    - `confirming`
    folgt bewusst erst in `S3.5`
  - bis dahin nutzt der sichtbare UI-Layer die heute bereits produktiv vorhandenen Runtime-States:
    - `idle`
    - `listening`
    - `thinking`
    - `speaking`
    - `error`
- Umgesetzte Code-/Style-Aenderungen:
  - `app/modules/hub/index.js`
    - Default-`idle`-/`Bereit`-State am sichtbaren Voice-Einstieg hinterlegt
  - `app/modules/assistant-stack/voice/index.js`
    - Voice-States spiegeln jetzt auch den `aria-label` des MIDAS-Pfeils
  - `app/styles/hub.css`
    - Statuskapsel und state-spezifische Optik fuer den Voice-Eintrag im Carousel
- Durchgefuehrte Checks:
  - `node --check app/modules/hub/index.js` PASS
  - `node --check app/modules/assistant-stack/voice/index.js` PASS

#### S3.5 Ergebnisprotokoll
- Die Voice-State-Machine ist jetzt im produktiven Voice-Code auf den V1-Command-Flow umgeschnitten.
- Final hinterlegte Zielzustaende fuer Voice V1:
  - `idle`
  - `listening`
  - `transcribing`
  - `parsing`
  - `executing`
  - `confirming`
  - `error`
- Umgesetzte Runtime-Zuordnung:
  - Start der Aufnahme:
    - `listening`
  - Stop der Aufnahme / STT-Phase:
    - `transcribing`
  - Intent-Preflight / lokale Command-Pruefung:
    - `parsing`
  - lokaler Dispatch / Legacy-Sonderpfade vor Rueckmeldung:
    - `executing`
  - gesprochene lokale oder Legacy-Bestaetigung:
    - `confirming`
  - Fehlerfaelle:
    - `error`
- Alte Sammelzustaende sind im produktiven Flow ersetzt:
  - `thinking` -> aufgeteilt in `transcribing`, `parsing`, `executing`
  - `speaking` -> auf `confirming` reduziert
- Bewusst noch nicht Teil von `S3.5`:
  - Entfernung der conversation-/resume-first Altlogik
  - Entfernung des Legacy-Assistant-Pfads aus dem Voice-Modul
  - diese Vereinfachung bleibt explizit in `S3.6`
- Umgesetzte Code-/Style-Aenderungen:
  - `app/modules/assistant-stack/voice/index.js`
    - Runtime-State-Uebergaenge auf die V1-States umgestellt
  - `app/styles/hub.css`
    - Hero-Hub- und MIDAS-Pfeil-States auf `transcribing`, `parsing`, `executing`, `confirming` erweitert
- Durchgefuehrte Checks:
  - `node --check app/modules/assistant-stack/voice/index.js` PASS

#### S3.6 Ergebnisprotokoll
- Die conversation-/resume-first Altannahmen sind aus dem produktiven Voice-V1-Flow entfernt bzw. neutralisiert.
- Entfernt oder neutralisiert im produktiven Laufzeitpfad:
  - implizites `conversationMode = true` beim Starten von Push-to-talk
  - Auto-Resume nach lokaler Bestätigung
  - Auto-Resume nach Legacy-Assistant-Antworten
  - transcript-getriebene Endphrasen-Logik fuer den normalen V1-Flow
  - end-action-getriebene Resume-/Session-Annahmen
- Produktive V1-Folge jetzt:
  - Tap
  - Aufnahme
  - VAD/Stop
  - STT
  - Parsing
  - lokaler Dispatch / Legacy-Sonderpfad
  - kurze Bestätigung
  - `idle`
- Wichtige Schnittentscheidung:
  - Der Legacy-Assistant-Pfad bleibt technisch noch im Modul vorhanden, ist aber nicht mehr Träger einer Resume-/Conversation-Session-Logik.
  - Voice V1 verhält sich damit als einzelne, abgeschlossene Command-Session pro Push-to-talk.
- Umgesetzte Code-Aenderungen:
  - `app/modules/assistant-stack/voice/index.js`
    - Resume-/Conversation-Annahmen aus Trigger-, Dispatch- und Feedback-Pfaden entfernt
    - `isConversationMode()` fuer den aktuellen V1-Zuschnitt auf `false` neutralisiert
  - `app/modules/hub/index.js`
    - `VOICE_PARKED` aufgehoben, produktive Voice-Initialisierung wieder aktiviert
  - `index.html`
    - `vad.js` und `voice/index.js` wieder produktiv eingebunden
- Zusaetzlicher S3-Cleanup:
  - normaler `midas-assistant`-Roundtrip aus dem produktiven Voice-V1-Normalpfad entfernt
  - `fallback`- und `needs_confirmation`-Faelle fuehren jetzt zu einer kurzen lokalen Rueckmeldung statt zu einem Assistant-/LLM-Roundtrip
- Durchgefuehrte Checks:
  - `node --check app/modules/assistant-stack/voice/index.js` PASS

### S4 - Local Command Orchestrator und Intent-Preflight auf V1-Flow modernisieren
- S4.1 Voice-Adapter auf den finalen V1-Flow schneiden:
  - `record -> transcribe -> command orchestrator -> normalized command units -> intent engine -> allowed action dispatch -> confirmation tts`
- S4.2 Einen expliziten lokalen Command-Orchestrator fuer Voice spezifizieren und integrieren.
- S4.3 Intent-Preflight fuer Voice gegen den produktiven Text-Contract angleichen.
- S4.4 Lokale Voice-Dispatches auf die freigegebenen V1-Actions begrenzen.
- S4.5 Compound Morning Commands produktiv schneiden:
  - mehrere Intake-/Medikations-Teile aus einem Transkript verarbeiten
  - keine stillen Teilverluste
  - klare lokale Erfolgs-/Fehler-Policy
- S4.6 Standardverhalten fuer nicht erkannte Kommandos finalisieren:
  - lokale Rueckmeldung
  - kein automatischer Assistant-Roundtrip

#### S4.1 Ergebnisprotokoll
- Der produktive Voice-Normalpfad ist jetzt strukturell auf den finalen V1-Flow umgestellt:
  - `record`
  - `transcribe`
  - `command orchestrator`
  - `normalized command units`
  - `intent preflight`
  - `allowed/local dispatch`
  - `confirmation tts`
- Wichtige Schnittentscheidung fuer den behutsamen S4-Einstieg:
  - der neue lokale Command-Orchestrator ist bereits als explizite Laufzeitstufe vorhanden
  - fuer diesen ersten Schnitt arbeitet er bewusst noch deterministisch im Modus `single_unit`
  - Compound-Splitting wird damit nicht halb versteckt vorweggenommen, sondern bleibt bewusst fuer `S4.2`/`S4.5`
- Umgesetzte Runtime-Aenderungen in `app/modules/assistant-stack/voice/index.js`:
  - `processVoiceBlob(...)` baut nach STT zuerst einen expliziten `commandPlan`
  - der `commandPlan` enthaelt bereits `normalized command units`
  - die Intent Engine bekommt nicht mehr nur lose das rohe Transkript, sondern einen expliziten Voice-Adapter-Input pro Command-Unit
  - der lokale Dispatch laeuft jetzt ueber `commandUnit + commandPlan` statt ueber einen impliziten Single-Transcript-Pfad
  - fuer leere/ungueltige Command-Plans gibt es einen klaren lokalen Fallback-Pfad
- Neue Diagnostik-/Debug-Sicht:
  - `voiceCtrl.lastCommandPlan` haelt den letzten lokal erzeugten Voice-Plan
  - `getLastIntentState()` liefert jetzt auch den letzten `commandPlan`
  - Route-/Bypass-Metadaten tragen jetzt zusaetzlich `commandPlanMode` und `commandUnitKind`
- Schlussfolgerung:
  - der Voice-Adapter ist nicht mehr nur logisch, sondern auch strukturell auf den spaeteren lokalen Orchestrator-Vertrag vorbereitet
  - `S4.2` kann jetzt auf einer echten produktiven Schnittstelle aufsetzen statt auf implizitem Direkt-Matching
- Durchgefuehrte Checks:
  - `node --check app/modules/assistant-stack/voice/index.js` PASS

#### S4.2 Ergebnisprotokoll
- Der lokale Voice-Command-Orchestrator ist jetzt als explizite produktive Laufzeitkomponente integriert.
- Finalisierter Orchestrator-Vertrag in `app/modules/assistant-stack/voice/index.js`:
  - Wake-/Anrede-Prefixe werden vor der Planbildung lokal entfernt
  - das Transkript wird konservativ in moegliche Command-Fragmente segmentiert
  - aus jedem Fragment wird eine explizite `normalized command unit`
  - jede Unit traegt bereits:
    - `id`
    - `index`
    - `kind`
    - `normalizedText`
    - `adapterInput`
- Eingefuehrte deterministische Unit-Klassen:
  - `intake_command_unit`
  - `medication_command_unit`
  - `confirm_command_unit`
  - `navigation_command_unit`
  - `vitals_command_unit`
  - `unknown_command_unit`
- Eingefuehrte explizite Planmodi:
  - `single_unit`
  - `multi_unit_pending`
  - `multi_unit_rejected`
- Wichtige Schnittentscheidung fuer den behutsamen Ausbau:
  - der Orchestrator erkennt Mehrfachbefehle jetzt bereits explizit
  - Mehrfachplaene werden aber bis `S4.5` noch nicht still oder halb ausgefuehrt
  - stattdessen fuehrt ein erkannter Mehrfachplan aktuell deterministisch zu einer kurzen lokalen Rueckmeldung
  - damit bleibt der Pfad sicher:
    - kein stiller Teilverlust
    - kein impliziter Teil-Dispatch
    - keine versteckte Compound-Logik hinter dem Ruecken der Roadmap
- Umgesetzte Runtime-Wirkung:
  - Single-Command-Pfade bleiben produktiv und unveraendert priorisiert
  - Compound-Kandidaten werden explizit sichtbar als eigener Planmodus markiert
  - mehrdeutige Segmentierung fuehrt zu `multi_unit_rejected`
  - sauber erkennbare Mehrfachbefehle fuehren vorerst zu `multi_unit_pending`
- Neue Diagnostik-/Debug-Sicht:
  - `lastCommandPlan` enthaelt jetzt neben dem Rohtranskript auch:
    - `strippedTranscript`
    - `mode`
    - `reason`
    - explizite `units`
- Schlussfolgerung:
  - der lokale Orchestrator ist jetzt nicht mehr nur eine abstrakte Huelle, sondern ein echter deterministischer Voice-V1-Planer
  - `S4.5` kann spaeter direkt auf den bereits produktiven `multi_unit`-Planmodi aufsetzen
- Durchgefuehrte Checks:
  - `node --check app/modules/assistant-stack/voice/index.js` PASS

#### S4.3 Ergebnisprotokoll
- Der Voice-Preflight ist jetzt semantisch enger an den produktiven Text-/Intent-Contract angeglichen.
- Wichtige Schnittentscheidung:
  - Voice bekommt keinen parallelen Sonderparser
  - stattdessen baut Voice jetzt denselben expliziten Adapter-Envelope, fuer den die Intent Engine bereits ausgelegt ist
- Umgesetzte Vertragsangleichung:
  - `source = voice` bleibt erhalten
  - Voice setzt jetzt zusaetzlich stabile `source_id`- und `dedupe_key`-Werte pro Command-Plan / Command-Unit
  - Voice reicht planbezogene `meta` an die Engine weiter:
    - `input_mode = voice-v1`
    - `command_plan_mode`
    - `command_unit_kind`
    - `command_unit_index`
  - Voice nutzt fuer den Adapter jetzt denselben `pending_context`-Mechanismus wie Text
- Umgesetzte Runtime-Aenderungen:
  - `app/modules/assistant-stack/voice/index.js`
    - `buildVoiceAdapterInput(...)` baut jetzt einen konsistenten Voice-Adapter-Envelope statt nur rohes Transkript plus loses `ui_context`
    - `preflightVoiceCommandUnit(...)` erzeugt den Adapter-Input jetzt plan-/unit-basiert und nicht mehr implizit
    - `voiceCtrl.lastAdapterInput` wird fuer Diagnosezwecke mitgefuehrt
    - `getLastIntentState()` liefert jetzt auch den letzten `adapterInput`
    - `preflightTranscriptIntent(...)` laeuft jetzt ebenfalls ueber den expliziten Voice-Command-Plan statt ueber einen losen Direktaufruf
  - `app/modules/hub/index.js`
    - der aktive Assistant-/Intent-Pending-Context ist jetzt ueber einen lesbaren Getter fuer Voice verfuegbar
- Praktische Folge fuer den V1-Contract:
  - Confirm-/Reject-Voice-Preflight kann jetzt denselben Pending-Context-Mechanismus nutzen wie Text
  - Voice und Text laufen damit naehr an derselben fachlichen Intent-Oberflaeche
  - der Unterschied liegt weiter im Orchestrator-/Dispatch-Pfad, nicht im grundlegenden Intent-Vertrag
- Durchgefuehrte Checks:
  - `node --check app/modules/assistant-stack/voice/index.js` PASS
  - `node --check app/modules/hub/index.js` PASS

#### S4.4 Ergebnisprotokoll
- Die lokalen produktiven Voice-Dispatches sind jetzt explizit auf den freigegebenen Voice-V1-Scope begrenzt.
- Wichtige Schnittentscheidung:
  - Erkennung und Ausfuehrung werden bewusst getrennt
  - ein Intent darf im Preflight weiterhin erkannt werden, wird aber nur dann lokal ausgefuehrt, wenn er auch zum freigegebenen Voice-V1-Produktvertrag gehoert
- Umgesetzte V1-Dispatch-Allowlist in `app/modules/assistant-stack/voice/index.js`:
  - freigegeben:
    - `intake_save`
    - `open_module` nur fuer den Voice-V1-relevanten Intake-/Medikationskontext
  - nicht mehr produktiv lokal ausfuehrbar:
    - `vitals_log_bp`
    - `vitals_log_weight`
    - `vitals_log_pulse`
    - sonstige direkte Actions ausserhalb des V1-Scope
- Umgesetzte Runtime-Wirkung:
  - erkannte, aber ausserhalb von Voice V1 liegende Direct-Matches fuehren jetzt deterministisch zu `unsupported_local`
  - diese Faelle werden lokal kurz blockiert statt trotzdem ausgefuehrt zu werden
  - damit bleibt der Voice-V1-Pfad enger an Scope, Guardrails und Abnahmekriterien
- Sprachliche Folge:
  - fuer erkannte, aber nicht freigegebene Voice-Direct-Matches gibt es jetzt eine klare lokale Rueckmeldung:
    - `Diesen Befehl unterstuetze ich per Voice im Moment noch nicht.`
- Schlussfolgerung:
  - Voice V1 ist jetzt nicht nur command-first, sondern auch fachlich sauber gegen Scope-Drift abgesichert
  - der spaetere Ausbau fuer Medikation/Compound kann auf dieser harten Scope-Grenze aufsetzen, statt wieder ungeprueft Breite aufzunehmen
- Durchgefuehrte Checks:
  - `node --check app/modules/assistant-stack/voice/index.js` PASS

#### S4.5 Ergebnisprotokoll
- Compound Morning Commands laufen jetzt im produktiven Voice-Pfad nicht mehr in eine pauschale Ablehnung, sondern in einen expliziten lokalen Batch-Dispatch.
- Umgesetzte Runtime-Aenderungen in `app/modules/assistant-stack/voice/index.js`:
  - `multi_unit_pending` fuehrt jetzt in einen echten Compound-Ausfuehrungspfad statt in einen generischen Fallback
  - jede `normalized command unit` wird einzeln:
    - preflighted
    - lokal dispatcht oder explizit blockiert
    - mit sichtbarem Outcome im Batch erfasst
  - die Batch-Ausfuehrung erzeugt danach eine zusammengefasste kurze Voice-Rueckmeldung
- Wichtige Guardrail-Erfuellung:
  - keine stillen Teilverluste
  - kein implizites Ignorieren einzelner Units
  - jede Unit ist entweder:
    - lokal ausgefuehrt
    - oder explizit als noch nicht verarbeitbar markiert
- Aktueller produktiver Compound-Stand:
  - mehrere Intake-Teilkommandos koennen jetzt in einem `multi_unit`-Plan nacheinander lokal verarbeitet werden
  - der Outcome wird aggregiert und als kurze Sammelrueckmeldung gesprochen
  - Beispielrichtung:
    - `Wasser und Protein eingetragen.`
    - `Wasser eingetragen. Salz konnte ich noch nicht verarbeiten.`
- Bewusste Zwischenentscheidung vor `S5`:
  - Medikations-Units in Compound-Plaenen werden aktuell noch nicht still mitgeraten oder halb ausgefuehrt
  - stattdessen fuehren sie aktuell zu einem expliziten blockierten Teil-Outcome
  - damit bleibt der Compound-Pfad schon produktiv nutzbar, ohne den Medikationsvertrag vor `S5` unsauber vorwegzunehmen
- Neue Diagnostik-/Debug-Sicht:
  - `lastIntentBypass` traegt bei Compound-Ausfuehrung jetzt auch die Unit-Outcomes des letzten Batch-Laufs
- Aktuelle Abgrenzung nach dem S4-Cleanup:
  - Compound-Intake ist produktiv im lokalen Voice-Pfad
  - Compound-Medikation bleibt bewusst noch offen fuer `S5`
- Schlussfolgerung:
  - der lokale Orchestrator kann jetzt nicht nur segmentieren, sondern auch deterministisch mehrere Units im produktiven Voice-Pfad verarbeiten
  - fuer die vollstaendige Roadmap-Abnahme von Compound Morning Commands inklusive Medikation bleibt `S5` der naechste fachliche Abschlussblock
- Durchgefuehrte Checks:
  - `node --check app/modules/assistant-stack/voice/index.js` PASS

#### S4.6 Ergebnisprotokoll
- Das Standardverhalten fuer nicht erkannte oder aktuell nicht verarbeitbare Voice-Kommandos ist jetzt im produktiven Pfad sprachlich finalisiert.
- Wichtige Schnittentscheidung:
  - lokale Rueckmeldungen bleiben kurz und funktional
  - Antworten unterscheiden jetzt klarer zwischen:
    - kein klarer Befehl erkannt
    - Mehrfachbefehl nicht eindeutig segmentierbar
    - Befehl erkannt, aber ausserhalb von Voice V1
    - Compound-Teil erkannt, aber fachlich noch nicht produktiv verarbeitet
- Umgesetzte Reply-Politik in `app/modules/assistant-stack/voice/index.js`:
  - leere / unklare Eingaben:
    - `Ich habe gerade keinen klaren Befehl erkannt.`
  - nicht erkannte Einzelbefehle:
    - `Ich konnte den Befehl gerade nicht zuordnen.`
  - erkannte, aber ausserhalb von Voice V1 liegende Befehle:
    - `Diesen Befehl unterstuetze ich per Voice im Moment noch nicht.`
  - nicht sauber segmentierbare Mehrfachbefehle:
    - `Den Mehrfachbefehl konnte ich noch nicht eindeutig aufteilen.`
  - Compound-Medikation vor `S5`:
    - `Medikation im Mehrfachbefehl kann ich gerade noch nicht sicher verarbeiten.`
  - Compound-Bestaetigungen ausserhalb des aktuellen sicheren Pfads:
    - `Bestaetigungen kann ich in diesem Mehrfachbefehl gerade nicht sicher verarbeiten.`
- Umgesetzte Compound-Rueckmeldungen:
  - aggregierte Antworten bleiben kurz und outcome-sichtbar
  - bei Teil-Erfolg / Teil-Blockade wird der erfolgreiche Teil zuerst genannt und der blockierte Teil anschliessend knapp markiert
- Schlussfolgerung:
  - Voice V1 endet jetzt in allen aktuellen S4-Pfaden mit kurzen, lokalen und nicht-konversationellen Rueckmeldungen
  - der lokale command-first Flow ist fuer Intake fachlich sauber, waehrend Compound-Medikation bewusst noch in `S5` stabilisiert wird
- Durchgefuehrte Checks:
  - `node --check app/modules/assistant-stack/voice/index.js` PASS

### S5 - Medikation, Compound Morning Commands und Confirm-Verhalten stabilisieren
- S5.1 Medikation als Voice-V1-Pfad an den bestehenden Daten-/Action-Vertrag anbinden.
- S5.2 Morning-Befehle mit mehreren Werten gegen reale Alltagsphrasen pruefen und stabilisieren.
- S5.3 Pending-Context fuer relevante Voice-Confirms andocken.
- S5.4 Confirm-/Reject-Voice-Verhalten fuer echte Alltagspfade pruefen:
  - `ja`
  - `nein`
  - `speichern`
  - `abbrechen`
- S5.5 Sicherstellen, dass Voice keine stale Pending-Contexts oder Doppeltrigger erzeugt.
- S5.6 Sicherstellen, dass Morning-Befehle mit mehreren Werten nicht durch VAD-/Pause-/Resume-Effekte unvollstaendig verarbeitet werden.

#### S5.1 Ergebnisprotokoll
- Medikation ist jetzt als echter produktiver V1-Pfad an den bestehenden Medikationsvertrag angebunden.
- Umgesetzter fachlicher Schnitt:
  - Voice V1 bestaetigt zunaechst bewusst nur die taegliche Sammelmedikation fuer heute
  - freie Einzelmedikationssprache bleibt weiterhin ausserhalb dieses Substeps
  - die Ausfuehrung nutzt keinen neuen Backend-Sonderpfad, sondern den bestehenden lokalen Vertragsweg
- Umgesetzte Runtime-Anbindung in `app/modules/assistant-stack/intent/rules.js` und `app/modules/assistant-stack/intent/validators.js`:
  - neuer expliziter Intent `medication_confirm_all`
  - enger Guarded-Write-Vertrag mit `scope = all_open_for_day`
  - damit ist Medikation kein Voice-only Regex-Hack, sondern Teil des geteilten Intent-Surface
- Umgesetzte Runtime-Anbindung in `app/modules/assistant-stack/voice/index.js`:
  - `medication_confirm_all` ist jetzt Teil der Voice-V1-Allowlist
  - der lokale Voice-Dispatch laeuft fuer diesen Intent ueber den bestehenden Medikationspfad:
    - `loadMedicationForDay(today)`
    - offene aktive Medikamente bestimmen
    - `confirmMedication(...)` fuer alle offenen Tagesmedikamente
  - wenn keine offene Medikation vorhanden ist, gibt es eine kurze lokale Blocker-Rueckmeldung
  - Compound-Morning-Plaene duerfen Medikations-Units jetzt produktiv mitverarbeiten statt sie pauschal als pending zu blockieren
- Konsistenzschnitt in `app/modules/hub/index.js`:
  - derselbe Intent ist jetzt auch im textbasierten Direct-Dispatch lokal ausfuehrbar
  - damit bleibt der fachliche Intent-Surface zwischen Text und Voice konsistent
- Bewusste Guardrails:
  - keine freie Auswahl einzelner Medikamente per Voice
  - keine stillen Teilverluste
  - keine neue Assistant-/LLM-Abhaengigkeit
- Durchgefuehrte Checks:
  - `node --check app/modules/assistant-stack/voice/index.js` PASS
  - `node --check app/modules/assistant-stack/intent/rules.js` PASS
  - `node --check app/modules/assistant-stack/intent/validators.js` PASS
  - `node --check app/modules/hub/index.js` PASS

#### S5.2 Ergebnisprotokoll
- Die Compound-Morning-Verarbeitung ist jetzt gegen realere Alltagsphrasen stabilisiert.
- Umgesetzte fachliche Haertung im geteilten Intent-Surface:
  - `app/modules/assistant-stack/intent/rules.js` akzeptiert Intake-Kommandos jetzt nicht mehr nur in der knappen Form
  - zusaetzlich produktiv unterstuetzt:
    - `ich habe 780 ml wasser getrunken`
    - `0.4 g salz`
    - `32 g protein`
  - damit bleibt die eigentliche fachliche Erkennung weiterhin auf demselben Intent-Contract fuer Text und Voice
- Umgesetzte Parser-Haertung im Voice-Orchestrator:
  - `app/modules/assistant-stack/voice/index.js` extrahiert strukturierte Morning-Teilkommandos jetzt auch ohne starre Komma-Segmentierung
  - mehrere Intake-/Medikations-Teile koennen lokal ueber erkannte Messmuster in Reihenfolge zerlegt werden
  - der Orchestrator bleibt dabei bewusst konservativ:
    - wenn zwischen den erkannten Strukturen bedeutungsvolle Resttexte liegen, wird nicht still halb gesplittet
    - nur fillerartige Luecken wie `ich habe`, `und` oder `heute` werden toleriert
- Praktische Folge:
  - Morning-Saetze wie
    - `ich habe 780 ml wasser getrunken, 0.4 g salz, 32 g protein und alle medikamente genommen`
    - `780 ml wasser 0.4 g salz 32 g protein und alle medikamente genommen`
    - `wasser 300 ml und protein 24 g`
    werden jetzt robuster in deterministische Teil-Units zerlegt
- Durchgefuehrte Checks:
  - lokale Harness-Pruefung fuer reale Morning-Beispiele PASS
  - lokale Harness-Pruefung fuer natuerliche Intake-Phrasen gegen den Intent-Parser PASS
  - `node --check app/modules/assistant-stack/voice/index.js` PASS
  - `node --check app/modules/assistant-stack/intent/rules.js` PASS

#### S5.3 Ergebnisprotokoll
- Relevante Voice-Confirms sind jetzt an den bestehenden Pending-Context-Vertrag angedockt.
- Umgesetzter Schnitt:
  - `confirm_reject` im Single-Command-Voice-Pfad laeuft nicht mehr nur in einen lokalen Fallback
  - stattdessen wird der bestehende Assistant-/Intent-Pending-Context gezielt aufgeloest
  - Voice nutzt dabei denselben Guard-/Consume-Pfad wie Text:
    - usable pending context
    - in-flight guard
    - consumed guard
    - TTL-/expired-Semantik aus dem Intent-Stack
- Umgesetzte Runtime-Aenderungen:
  - `app/modules/hub/index.js`
    - `resolveAssistantConfirmIntent(...)` ist jetzt generisch fuer Text und Voice nutzbar
    - der Resolver kann kurze Rueckmeldungen fuer Voice liefern, ohne einen separaten Voice-Sondermechanismus einzufuehren
    - der Resolver ist ueber die Hub-API fuer Voice exponiert
  - `app/modules/assistant-stack/voice/index.js`
    - `confirm_reject` wird im Single-Command-Pfad jetzt ueber den Hub-Resolver lokal verarbeitet
    - erfolgreiche oder inert behandelte Voice-Confirms fuehren zu einer kurzen lokalen Rueckmeldung
    - fehlende oder bereits verbrauchte Pending-Contexts fuehren deterministisch zu kurzen lokalen Antworten statt zu einem Assistant-Fallback
- Bewusste Guardrail-Entscheidung:
  - Compound-Confirms bleiben weiterhin bewusst blockiert
  - `S5.3` dockt nur den relevanten, expliziten Pending-Context fuer den Single-Command-Voice-Pfad an
  - die Alltagssicherheit bleibt damit vor Geschwindigkeit priorisiert
- Durchgefuehrte Checks:
  - `node --check app/modules/hub/index.js` PASS
  - `node --check app/modules/assistant-stack/voice/index.js` PASS

#### S5.4 Ergebnisprotokoll
- Das Voice-Confirm-/Reject-Verhalten ist jetzt fuer die alltagsrelevanten Triggerwoerter fachlich geglaettet:
  - `ja`
  - `nein`
  - `speichern`
  - `abbrechen`
- Umgesetzte fachliche Wirkung:
  - positive Confirm-Werte (`ja`, `speichern`) nutzen denselben Pending-Context-Resolver und fuehren bei aktivem Context deterministisch zur bestaetigten Aktion
  - negative Confirm-Werte (`nein`, `abbrechen`) verwerfen den aktiven Pending Context deterministisch und geben eine kurze lokale Rueckmeldung
  - fehlende, bereits verbrauchte oder gerade in Verarbeitung befindliche Pending Contexts fuehren nicht in generische Blocker, sondern in kurze alltagstaugliche Antworten
- Umgesetzte Runtime-Aenderungen:
  - `app/modules/hub/index.js`
    - fehlgeschlagene Confirm-Ausfuehrungen liefern jetzt auch ueber den generischen Resolver eine kurze konkrete Rueckmeldung statt eines stillen oder generischen Fehlerpfads
  - `app/modules/assistant-stack/voice/index.js`
    - der Voice-Blocked-Pfad kann fuer Confirm-Faelle jetzt gezielt den vom Resolver gelieferten Reply-Text verwenden
- Wichtige Guardrail:
  - `S5.4` erweitert nicht den Scope der bestaetigbaren Dinge
  - Compound-Confirms bleiben weiterhin bewusst ausserhalb des produktiven Pfads
- Durchgefuehrte Checks:
  - `node --check app/modules/hub/index.js` PASS
  - `node --check app/modules/assistant-stack/voice/index.js` PASS

#### S5.5 Ergebnisprotokoll
- Pending Contexts und Guard-States sind jetzt gegen stale Zustande und Doppeltrigger gehaertet.
- Umgesetzte Runtime-Haertung in `app/modules/hub/index.js`:
  - beim Setzen eines neuen Pending Contexts werden moegliche alte Guard-Eintraege fuer denselben Guard-Key bewusst geloest
  - beim Clear eines aktiven Pending Contexts wird ein eventuell offener `inFlight`-Lock fuer diesen Context ebenfalls geloest
  - konsumierte Guard-Eintraege werden jetzt mit begrenzter Retention gepflegt statt unbegrenzt liegen zu bleiben
- Umgesetzte Lifecycle-Bereinigung:
  - es gibt jetzt einen zentralen `getUsableAssistantPendingIntentContext()`-Pfad
  - abgelaufene oder bereits konsumierte Pending Contexts werden beim Zugriff aktiv bereinigt
  - Text-Preflight, Voice-Zugriff ueber die Hub-API und Confirm-Aufloesung greifen damit nicht mehr auf rohe, moeglicherweise stale Contexts zu
- Praktische Folge:
  - Voice erzeugt keine bestaetigbaren Zombie-Contexts aus abgelaufenen Zustanden
  - frisch neu gesetzte bestaetigbare Aktionen werden nicht von alten Consumed-/InFlight-Resten desselben Guard-Keys blockiert
  - Wiederholungs-Trigger bleiben weiter durch den Guard geblockt, aber ohne dass alte Locks unnoetig haengen bleiben
- Durchgefuehrte Checks:
  - `node --check app/modules/hub/index.js` PASS
  - `node --check app/modules/assistant-stack/voice/index.js` PASS

#### S5.6 Ergebnisprotokoll
- Morning-Befehle mit mehreren Werten sind jetzt besser gegen zu fruehen VAD-Auto-Stop bei natuerlichen Sprechpausen gehaertet.
- Umgesetzte Runtime-Haertung in `app/modules/assistant-stack/voice/index.js`:
  - VAD-Auto-Stop nutzt nicht mehr nur ein starres globales Stillefenster
  - stattdessen wird die Auto-Stop-Toleranz dynamisch erweitert fuer:
    - mehrere erkannte Sprach-Bursts
    - laengere laufende Sprachsegmente
  - sehr kurze Ansprachen werden nicht mehr sofort nach der ersten kurzen Pause abgeschnitten
- Umgesetzte Zustandsdaten:
  - `recordingStartedAt`
  - `hasDetectedSpeech`
  - `speechBurstCount`
  - `lastVadState`
  - daraus wird ein explizites Auto-Stop-Budget fuer den aktuellen Sprachlauf berechnet
- Praktische Folge:
  - kurze Pausen in Morning-Saetzen fuehren seltener zu einem zu fruehen Segment-Ende
  - der produktive Push-to-talk-Pfad bleibt weiter klar segmentiert
  - es wurde bewusst keine neue Resume-/Conversation-Logik eingefuehrt
- Durchgefuehrte Checks:
  - `node --check app/modules/assistant-stack/voice/index.js` PASS

### S6 - TTS-Rueckkanal und lokale/blockierte Voice-Rueckmeldungen finalisieren
- S6.1 Kurze TTS-Antworten fuer lokale Treffer finalisieren.
- S6.2 Kurze Sammel-Bestaetigungen fuer Compound-Commands finalisieren.
- S6.3 Lokale Blocker-Meldungen sprachlich finalisieren.
- S6.4 Nicht erkannte Befehle sprachlich finalisieren.
- S6.5 Fehlerfaelle im Voice-Pfad so behandeln, dass sie nicht wie Intent-/Backend-Verwechslungen wirken.
- S6.6 Telemetry/Diag fuer Voice-Outcomes nachziehen.

#### S6.1 Ergebnisprotokoll
- Die gesprochenen Erfolgsantworten fuer lokale Voice-Treffer sind jetzt gezielt auf kurze, funktionale TTS-Formen reduziert.
- Umgesetzter Schnitt in `app/modules/assistant-stack/voice/index.js`:
  - getrennte sprachoptimierte Reply-Builders fuer lokal erfolgreich behandelte Treffer
  - TTS nutzt bei `handled` jetzt bewusst kuerzere Formen als der generische Debug-/Reply-Surface
- Beispiele fuer den produktiven TTS-Pfad:
  - `300 Milliliter Wasser eingetragen.`
  - `24 Gramm Protein eingetragen.`
  - `Tageserfassung geoeffnet.`
  - `Medikation bestaetigt.`
  - generisch: `Erledigt.`
- Wichtige Guardrail:
  - `S6.1` aendert nur den gesprochenen Erfolgsrueckkanal
  - Blocker-, Fallback- und Compound-Texte bleiben bewusst fuer die naechsten S6-Substeps getrennt
- Durchgefuehrte Checks:
  - `node --check app/modules/assistant-stack/voice/index.js` PASS

#### S6.2 Ergebnisprotokoll
- Sammel-Bestaetigungen fuer Compound-Commands haben jetzt einen eigenen kurzen spoken Surface fuer TTS.
- Umgesetzter Schnitt in `app/modules/assistant-stack/voice/index.js`:
  - der bisherige Compound-Reply-Builder bleibt als ausfuehrlicherer Diagnose-/Bypass-Text erhalten
  - zusaetzlich gibt es jetzt einen kuerzeren spoken Compound-Reply fuer die TTS-Ausgabe
- Beispiele fuer den gesprochenen Compound-Pfad:
  - `Wasser und Protein eingetragen.`
  - `Wasser, Salz, Protein und Medikation verarbeitet.`
  - `Wasser verarbeitet. Protein offen.`
  - `Bestaetigung bitte separat sagen.`
- Wichtige Guardrail:
  - nur der gesprochene Rueckkanal wurde verkuerzt
  - der ausfuehrlichere Reply-Surface fuer Diagnose und Intent-Bypass bleibt erhalten
- Durchgefuehrte Checks:
  - `node --check app/modules/assistant-stack/voice/index.js` PASS

#### S6.3 Ergebnisprotokoll
- Lokale Blocker-Meldungen haben jetzt einen eigenen kurzen spoken Surface fuer TTS.
- Umgesetzter Schnitt in `app/modules/assistant-stack/voice/index.js`:
  - der bisherige Blocker-Reply-Builder bleibt als ausfuehrlicherer Diagnose-/Bypass-Text erhalten
  - zusaetzlich gibt es jetzt kuerzere gesprochene Blocker-Texte fuer den produktiven Voice-Pfad
- Beispiele fuer den gesprochenen Blocker-Pfad:
  - `Diesen Befehl unterstuetze ich per Voice noch nicht.`
  - `Heute ist keine Medikation offen.`
  - `Eintrag gerade nicht moeglich.`
  - `Modul gerade nicht bereit.`
  - generisch: `Das geht gerade nicht.`
- Wichtige Guardrail:
  - nur der gesprochene Blocker-Surface wurde verkuerzt
  - der ausfuehrlichere Reply-Surface fuer Diagnose und Intent-Bypass bleibt erhalten
- Durchgefuehrte Checks:
  - `node --check app/modules/assistant-stack/voice/index.js` PASS

#### S6.4 Ergebnisprotokoll
- Nicht erkannte oder nicht sauber verarbeitbare Befehle haben jetzt einen eigenen kurzen spoken Fallback-Surface fuer TTS.
- Umgesetzter Schnitt in `app/modules/assistant-stack/voice/index.js`:
  - der bisherige Fallback-Reply-Builder bleibt als ausfuehrlicherer Diagnose-/Bypass-Text erhalten
  - zusaetzlich gibt es jetzt kuerzere gesprochene Fallback-Texte fuer den produktiven Voice-Pfad
- Beispiele fuer den gesprochenen Fallback-Pfad:
  - `Keinen klaren Befehl erkannt.`
  - `Mehrere Befehle erkannt.`
  - `Mehrfachbefehl nicht eindeutig.`
  - `Befehl nicht erkannt.`
  - `Aktuell nichts zu bestaetigen.`
- Wichtige Guardrail:
  - nur der gesprochene Fallback-Surface wurde verkuerzt
  - der ausfuehrlichere Reply-Surface fuer Diagnose und Intent-Bypass bleibt erhalten
- Durchgefuehrte Checks:
  - `node --check app/modules/assistant-stack/voice/index.js` PASS

#### S6.5 Ergebnisprotokoll
- Operative Voice-Fehler werden jetzt klarer vom normalen Intent-/Fallback-Pfad getrennt.
- Umgesetzter Schnitt in `app/modules/assistant-stack/voice/index.js`:
  - zentraler Helper fuer operative Voice-Error-Labels
  - spezifische UI-Fehlermeldungen fuer:
    - Mikrofon nicht verfuegbar
    - Voice-Konfiguration fehlt
    - Sprachdienst nicht erreichbar
    - Sprache konnte gerade nicht verarbeitet werden
    - Sprachverarbeitung gerade nicht moeglich
  - generische Catch-Blöcke ueberschreiben einen bereits gesetzten spezifischen Voice-Fehler nicht mehr
- Praktische Folge:
  - Infrastruktur-/Audio-/STT-Probleme wirken im UI nicht mehr wie normale Intent- oder Parser-Fehler
  - nicht erkannte Befehle bleiben weiter im lokalen Fallback-Surface, waehrend echte Betriebsfehler sichtbar getrennt sind
- Durchgefuehrte Checks:
  - `node --check app/modules/assistant-stack/voice/index.js` PASS

#### S6.6 Ergebnisprotokoll
- Voice-Outcomes sind jetzt diag-seitig klarer nachvollziehbar, ohne die bestehende Intent-Telemetry semantisch zu vermischen.
- Umgesetzter Schnitt in `app/modules/assistant-stack/voice/index.js`:
  - eigener `recordVoiceOutcome(...)`-Helper fuer Voice-spezifische Laufzeit-Outcomes
  - Snapshot fuer:
    - operative Runtime-Fehler
    - lokale Erfolgsantworten
    - lokale Blocker
    - lokale Fallbacks
    - Compound-Replies
    - abgeschlossene TTS-Wiedergabe
  - `getLastIntentState()` liefert jetzt zusaetzlich den letzten `outcome`-Snapshot
- Praktische Folge:
  - Voice laesst sich fuer `S7` deutlich gezielter gegen konkrete Outcome-Klassen pruefen
  - TTS-/Fallback-/Runtime-Fehler sind nicht mehr nur indirekt ueber verstreute Einzelzustande sichtbar
  - die parser-/intent-zentrierte Telemetry bleibt frei von zusaetzlichen Runtime-Outcome-Events
- Durchgefuehrte Checks:
  - `node --check app/modules/assistant-stack/voice/index.js` PASS

### S7 - Smokechecks, Gate-/Command-/Confirm-Regressionen
- S7.1 Positive Intake-V1-Beispiele pruefen:
  - `Wasser 300 ml`
  - `Protein 24 Gramm`
  - `Salz 1,2 Gramm`
  - `Ich habe alle meine Medikamente genommen`
  - `Ich habe 780 ml Wasser getrunken, 0,4 g Salz, 32 g Protein und alle Medikamente genommen`
- S7.2 Negative / Ablehnungs-Beispiele pruefen:
  - freie Beratungsfragen
  - vage Aussagen
  - ausserhalb von V1 liegende Voice-Eingaben
- S7.3 Push-to-talk + VAD-Auto-Stop im Hero Hub pruefen.
- S7.4 Confirm-/Pending-Context im Voice-Pfad pruefen.
- S7.5 Syntaxchecks und gezielte statische Guards ausfuehren.

#### S7.1 Ergebnisprotokoll
- Die positiven Intake-/Medication-/Morning-Beispiele sind lokal gegen den produktiven Voice-Orchestrator-, Intent- und Dispatch-Vertrag verifiziert.
- Gepruefte Beispiele:
  - `Wasser 300 ml`
  - `Protein 24 Gramm`
  - `Salz 1,2 Gramm`
  - `Ich habe alle meine Medikamente genommen`
  - `Ich habe 780 ml Wasser getrunken, 0,4 g Salz, 32 g Protein und alle Medikamente genommen`
- Verifizierte Produktwirkung:
  - Single-Commands fuer Wasser, Protein und Salz laufen als `single_unit`
  - Medikation laeuft als `single_unit` mit `medication_confirm_all`
  - der Morning-Mehrfachbefehl laeuft als `multi_unit_pending` mit vier deterministischen Teil-Units
  - alle geprueften Teil-Units werden als `direct_match` erkannt und lokal `handled`
- Waehren des Smokes gefundene und behobene Drift:
  - der Voice-Orchestrator normalisierte Dezimal-Kommas bisher nicht selbst
  - dadurch wurden `Salz 1,2 Gramm` und `0,4 g Salz` im Compound-Satz falsch segmentiert
  - `normalizeVoiceCommandText(...)` zieht Dezimal-Kommas jetzt wie der Intent-Kern auf Punkt-Notation
- Durchgefuehrte Checks:
  - lokaler Node-Harness gegen produktive Voice-Hooks:
    - Planbildung
    - Intent-Preflight
    - lokaler Dispatch
  - `node --check app/modules/assistant-stack/voice/index.js` PASS

#### S7.2 Ergebnisprotokoll
- Die negativen bzw. ausserhalb von Voice V1 liegenden Beispiele sind lokal gegen den produktiven Voice-Orchestrator-, Intent- und Dispatch-Vertrag geprueft.
- Gepruefte Negativklassen:
  - freie Beratungsfragen
  - vage Aussagen
  - ausserhalb von V1 liegende Voice-Eingaben
  - gemischte Command-/Freitext-Eingaben ohne sicheren Compound-Vertrag
- Gepruefte Beispiele:
  - `Was soll ich heute essen?`
  - `Ich habe etwas getrunken`
  - `Oeffne Vitals`
  - `Gewicht 82`
  - `Wasser 300 ml und wie ist das Wetter`
- Verifizierte Produktwirkung:
  - freie Beratung und vage Aussagen enden lokal in `fallback_semantic`
  - V1-fremde, aber parserseitig erkennbare Targets wie `Oeffne Vitals` oder `Gewicht 82` enden lokal in `unsupported_local`
  - der gesprochene Rueckkanal bleibt kurz und lokal:
    - `Befehl nicht erkannt.`
    - `Diesen Befehl unterstuetze ich per Voice noch nicht.`
  - gemischte Command-/Freitext-Eingaben werden konservativ als Gesamt-Fallback behandelt statt teilweise ausgefuehrt
- Wichtige Einordnung:
  - `Wasser 300 ml und wie ist das Wetter` wurde bewusst nicht als `multi_unit_rejected`, sondern als einzelner Fallback behandelt
  - das ist fuer V1 fachlich akzeptabel, weil keine Teilausfuehrung und kein stiller Teilverlust entsteht
- Durchgefuehrte Checks:
  - lokaler Node-Harness gegen produktive Voice-Hooks:
    - Planbildung
    - Intent-Preflight
    - lokaler Dispatch

#### S7.3 Ergebnisprotokoll
- Push-to-talk und VAD-Auto-Stop sind lokal gegen den produktiven Voice-Runtime-Vertrag geprueft.
- Verifizierte Runtime-Wirkung:
  - der Hero-Hub-Trigger geht bei offenem Gate in `listening`
  - der VAD-Controller wird beim Start der Aufnahme angebunden
  - nach erkannter Sprache und anschliessender Stille beendet VAD den Sprachlauf kontrolliert
  - Recorder, Stream und VAD werden beim Auto-Stop sauber geloest
  - der Status verlaesst `listening` danach wieder kontrolliert
- Waehren des Smokes gefundene und behobene Runtime-Drift:
  - der VAD-Min-Speech-/Recheck-Pfad konnte nach kurzer Sprache im Zustand `listening` haengen bleiben
  - Ursache:
    - rekursive Silence-Rechecks liefen mit noch gesetztem `vadSilenceTimer`
    - der Min-Speech-Guard rechnete nicht ueber eine stabile `firstSpeechAt`-Basis
  - behobene Code-Aenderungen in `app/modules/assistant-stack/voice/index.js`:
    - `firstSpeechAt` als explizite Zustandsbasis eingefuehrt
    - Silence-Rechecks ueber einen Helper mit sauberem Timer-Clear vor dem Ruecksprung vereinheitlicht
    - Min-Speech-Guard auf `now - firstSpeechAt` statt auf ein driftendes Zwischenmass gezogen
- Wichtige Einordnung:
  - dies war ein lokaler Runtime-Harness mit Fake-Mikrofon, Fake-Recorder und Fake-VAD
  - ein echter Browser-/Device-Mikrofonlauf bleibt fuer `S8` bzw. spaetere Live-QA weiter sinnvoll
- Durchgefuehrte Checks:
  - lokaler Node-Harness gegen produktive Voice-Hooks:
    - Trigger
    - Aufnahme-Start
    - VAD-Speech
    - VAD-Silence
    - Auto-Stop
  - `node --check app/modules/assistant-stack/voice/index.js` PASS

#### S7.4 Ergebnisprotokoll
- Confirm-/Pending-Context-Verhalten im Voice-Pfad ist lokal gegen den produktiven Resolver- und Guard-Vertrag geprueft.
- Gepruefte Voice-Confirm-Faelle:
  - `ja` ohne Pending Context
  - `ja` mit aktivem Pending Context
  - `speichern` mit aktivem Pending Context
  - `nein` mit aktivem Pending Context
  - `abbrechen` mit aktivem Pending Context
  - `ja` bei `inFlight`-Lock
  - `ja` bei `consumed`-Lock
- Verifizierte Produktwirkung:
  - ohne brauchbaren Pending Context bleiben Voice-Confirms inert und antworten lokal mit `Es gibt aktuell nichts zu bestaetigen.`
  - positive Voice-Confirms (`ja`, `speichern`) fuehren den bestaetigten Target-Action-Pfad aus und clearen den Pending Context
  - negative Voice-Confirms (`nein`, `abbrechen`) verwerfen den Pending Context deterministisch
  - `inFlight`- und `consumed`-Guards liefern kurze lokale Antworten statt Doppeltrigger
- Waehren des Smokes gefundene und behobene Drift:
  - erfolgreich bestaetigte Voice-Confirms liefen im Allowed-Action-Pfad noch mit `source = intent-confirm:text`
  - der Hub nutzt dafuer jetzt kanalabhaengig `intent-confirm:voice` bzw. `intent-confirm:text`
- Durchgefuehrte Checks:
  - lokaler Node-Harness gegen produktive Hub-/Intent-Resolver:
    - Pending-Context-Set/Clear
    - Confirm-Resolver mit `channel = voice`
    - Guard-Zustaende `missing`, `inFlight`, `consumed`
  - `node --check app/modules/hub/index.js` PASS

#### S7.5 Ergebnisprotokoll
- Syntaxchecks und gezielte statische Guards fuer den produktiven Voice-V1-Pfad sind gruen.
- Durchgefuehrte Syntaxchecks:
  - `node --check app/modules/assistant-stack/voice/index.js`
  - `node --check app/modules/hub/index.js`
  - `node --check app/modules/assistant-stack/intent/index.js`
  - `node --check app/modules/assistant-stack/intent/parser.js`
  - `node --check app/modules/assistant-stack/intent/rules.js`
- Durchgefuehrte statische Guards:
  - kein normaler Assistant-/LLM-Roundtrip mehr im produktiven Voice-V1-Pfad
  - keine conversation-/resume-first Altpfade mehr im Voice-Adapter
  - keine alten `voice-llm-bypass`-/Legacy-Telemetry-Begriffe mehr im Voice-Adapter
  - Voice-V1-Dispatch bleibt auf lokale Guard-Reasons wie `voice-v1-action-not-allowed` und `voice-v1-open-module-not-allowed` begrenzt
- Waehren des Guards gefundene und bereinigte Reststruktur:
  - `VOICE_PARKED = false` im Hub war nach der produktiven Reaktivierung nur noch ein statischer Alt-Guard
  - der Hub initialisiert das Voice-Modul jetzt direkt ohne diese tote Zwischenkonstante
- Durchgefuehrte Checks:
  - gezielte `rg`-Scans auf Legacy-Assistant-/Conversation-/Bypass-Reste
  - `node --check app/modules/hub/index.js` PASS
  - `node --check app/modules/assistant-stack/voice/index.js` PASS

### S8 - Abschluss, Doku-Sync, Changelog
- S8.1 Statusmatrix finalisieren.
- S8.2 `docs/modules/Assistant Module Overview.md` auf Ist-Stand nachziehen.
- S8.3 `docs/modules/Hub Module Overview.md` bei geaendertem Voice-Einstieg nachziehen.
- S8.4 `docs/modules/VAD Module Overview.md` bei geaenderter Rolle/Schneidung nachziehen.
- S8.5 `docs/modules/Intent Engine Module Overview.md` bei relevanten Voice-Integrationspunkten nachziehen.
- S8.6 `docs/QA_CHECKS.md` um Voice-Command-Regression erweitern.
- S8.7 `CHANGELOG.md` unter `Unreleased` ergaenzen.
- S8.8 Rest-Risiken und spaetere Wake-word-/Always-on-Follow-ups dokumentieren.

#### S8.1 Ergebnisprotokoll
- Die Statusmatrix ist finalisiert.
- `S1` bis `S8` stehen jetzt konsistent auf dem realen Implementierungsstand.

#### S8.2 Ergebnisprotokoll
- `docs/modules/Assistant Module Overview.md` ist auf den finalen Voice-V1- und Confirm-Stand nachgezogen.
- Dokumentiert sind jetzt insbesondere:
  - produktiver command-first Voice-Pfad
  - Spoken-/Reply-/Error-Surface-Trennung
  - gemeinsamer Pending-Context-Vertrag fuer Text und Voice

#### S8.3 Ergebnisprotokoll
- `docs/modules/Hub Module Overview.md` ist auf den produktiven Hero-Hub-Voice-Einstieg nachgezogen.
- Dokumentiert sind jetzt insbesondere:
  - `assistant-voice` als permanenter produktiver MIDAS-Slot
  - direkte Voice-Initialisierung ohne geparkten Alt-Guard
  - kanalbewusster Confirm-Resolver fuer Text und Voice

#### S8.4 Ergebnisprotokoll
- `docs/modules/VAD Module Overview.md` ist auf die aktuelle Segment-Ende-Rolle nachgezogen.
- Dokumentiert sind jetzt insbesondere:
  - dynamische Auto-Stop-Toleranz
  - `firstSpeechAt`-/Silence-Recheck-Haertung
  - klare Abgrenzung gegen Wake-word und Conversation-Resume-Logik

#### S8.5 Ergebnisprotokoll
- `docs/modules/Intent Engine Module Overview.md` ist auf die aktuelle Text-/Voice-Integration nachgezogen.
- Dokumentiert sind jetzt insbesondere:
  - gemeinsamer Adapter-Contract
  - `medication_confirm_all`
  - Dezimal-Komma-/Morning-Formen
  - `unsupported_local` fuer parserseitig erkennbare, aber Voice-V1-fremde Targets

#### S8.6 Ergebnisprotokoll
- `docs/QA_CHECKS.md` ist um `Phase F8 - Voice Command Reactivation Regression` erweitert.
- Abgedeckt sind jetzt:
  - positive Voice-V1-Beispiele
  - negative / ausserhalb von V1 liegende Beispiele
  - Push-to-talk + VAD-Auto-Stop
  - Pending-Context-/Confirm-Verhalten
  - statische Guards fuer den produktiven Voice-V1-Pfad

#### S8.7 Ergebnisprotokoll
- `CHANGELOG.md` ist unter `Unreleased` um die produktive Voice-Reaktivierung erweitert.
- Nachgezogen sind insbesondere:
  - Hero-Hub Push-to-talk
  - command-first Voice-V1-Flow
  - Compound Morning Commands und Medikation
  - Voice-/Text-Confirm-Vertrag
  - Voice-Doku- und QA-Sync

#### S8.8 Ergebnisprotokoll
- Rest-Risiken und spaetere Follow-ups bleiben bewusst dokumentiert.
- Weiterhin ausserhalb des aktuellen produktiven Scopes:
  - Wake-word / Always-on
  - freie Beratungs-/Assistant-Voice
  - app-weite freie Sprachsteuerung
- Damit bleibt die Roadmap fachlich sauber auf den produktiven Voice-V1-Kern begrenzt.

## Smokechecks / Regression (Definition)
- Hero-Hub Push-to-talk startet und beendet eine Voice-Interaktion kontrolliert.
- Klare Intake-Voice-Befehle werden lokal ueber die Intent Engine erkannt.
- Einzelbefehle und kombinierte Morning-Befehle verhalten sich konsistent und nachvollziehbar.
- Lokale Voice-Treffer fuehren zu keinem unnoetigen `midas-assistant`-Call.
- Nicht erkannte Befehle fuehren zu einer kurzen lokalen Rueckmeldung, nicht zu einem stillen Fallback.
- Confirm-/Reject-Voice-Intents bleiben ohne Pending Context inert.
- VAD beendet kurze Sprachsegmente sauber, ohne die Session unbrauchbar zu machen.
- TTS-Antworten bleiben kurz, stabil und passend zum Use Case.

## Abnahmekriterien
- Push-to-talk im Hero Hub funktioniert produktiv und stabil.
- Voice V1 reduziert Klicks fuer die haeufigen Intake-Eingaben real messbar.
- Voice V1 deckt den realen Morning-Use-Case fuer mehrere Intake-Werte plus Medikation vernuenftig ab.
- Intent Engine und Voice nutzen denselben fachlichen Contract.
- Nicht erkannte Kommandos fuehren deterministisch zu einer kurzen lokalen Rueckmeldung ohne Assistant-/LLM-Roundtrip.
- Assistant-/LLM-Logik ist nicht mehr Teil des normalen Voice-V1-Kontrollflusses.
- Dokumentation und QA sind mit dem Implementierungsstand synchron.

## Risiken
- Voice-Reaktivierung driftet in Richtung „Voice fuer alles“, bevor Intake-first stabil ist.
- Browser-/Permission-/Background-Grenzen koennen den Voice-State unzuverlaessig machen.
- Zu komplexe Resume-/Conversation-Logik kann fuer V1 mehr Schaden als Nutzen anrichten.
- Lokale Voice-Blocker koennen wieder wie Backend-/Assistant-Fehler wirken, wenn die Outcome-Trennung unsauber ist.
- Zusammengesetzte Morning-Befehle koennen zu Teilverarbeitung oder stillen Teilverlusten fuehren, wenn kein expliziter Split-/Aggregation-Contract definiert ist.
- Confirm-/Reject im Voice-Pfad ist heikel, sobald Timeouts, VAD und Pending Context gleichzeitig greifen.
- Zu lange TTS-Antworten machen den Alltagspfad langsam und nervig.
- Wake-word/Always-on kann spaeter Druck erzeugen, V1-Guardrails aufzuweichen.
