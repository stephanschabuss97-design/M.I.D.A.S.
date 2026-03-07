# Intent Engine Follow-ups (DONE)

Kurze Einordnung:
- Zweck: offene Rest-Risiken und spaetere technische Anschlussarbeiten der Intent Engine kompakt festhalten.
- Fokus: nur echte Follow-ups nach Abschluss der V1-Roadmap, keine Wunschliste.
- Stand: abgeschlossen; basiert auf dem abgeschlossenen Implementierungsstand aus `docs/archive/Intent Engine Implementation Roadmap (DONE).md`.

Related docs:
- [Intent Engine Module Overview](c:/Users/steph/Projekte/M.I.D.A.S/docs/modules/Intent%20Engine%20Module%20Overview.md)
- [Intent Engine Implementation Roadmap (DONE)](c:/Users/steph/Projekte/M.I.D.A.S/docs/archive/Intent%20Engine%20Implementation%20Roadmap%20(DONE).md)
- [Assistant Module Overview](c:/Users/steph/Projekte/M.I.D.A.S/docs/modules/Assistant%20Module%20Overview.md)

## 1. Weitere Confirm-Producer

- Thema:
  - `confirm_reject` ist produktiv aktuell nur fuer suggestion-basierte Flows verdrahtet.
- Warum offen:
  - andere kuenftige Confirm-Quellen nutzen den generischen Pending-Intent-Context noch nicht.
- Risiko wenn ignoriert:
  - spaetere Ja/Nein-Flows bauen wieder Einzelloesungen statt denselben Context-Vertrag zu nutzen.
  - stale oder konkurrierende Confirm-Pfade werden wahrscheinlicher.
- Trigger fuer spaeter:
  - neue Confirm-UI
  - Medication-Confirm
  - Termin- oder Arztbrief-Bestaetigungen
- Empfohlener naechster Schritt:
  - jeden neuen Confirm-Producer verpflichtend an denselben Pending-Context-Contract anbinden
  - keine zweite Ja/Nein-Wahrheit neben `pendingIntentContext` erlauben

### 1.1 Confirm-Producer-Inventar

| Producer | Ort | Typ | Aktueller Status | Einordnung |
|------|------|------|------|------|
| Assistant Suggestion Confirm (`Ja, speichern` / `Nein`) | `app/modules/assistant-stack/assistant/suggest-ui.js`, `app/modules/hub/index.js` | konversationeller Confirm-Producer | Bereits an `pendingIntentContext` angebunden | Baseline fuer alle weiteren konversationellen Confirm-Quellen |
| Assistant Text-Intent `ja/nein/speichern/abbrechen` | `app/modules/assistant-stack/intent/*`, `app/modules/hub/index.js` | generischer Confirm-Intent | Produktiv fuer suggestion-basierten Context aktiv | Bereits korrekt auf denselben Context-Vertrag verdrahtet |
| Assistant `ask_confirmation` Action | `app/modules/assistant-stack/assistant/actions.js`, `app/modules/hub/index.js` | konversationeller Confirm-Producer | Produktiv als zweiter Pending-Context-Producer verdrahtet | Nutzt jetzt denselben generischen Confirm-Contract wie der Suggestion-Flow, mit festgezogenem Payload-Contract (`target_action`, `payload_snapshot`) |
| Assistant Meal-Followup `Ja, bitte` / `Nein` | `app/modules/hub/index.js` | expliziter Follow-up-Button | Eigener Button-Flow, kein generischer Pending-Context | Vorerst getrennt lassen; erst anbinden, wenn Text-/Voice-`ja/nein` denselben Pfad steuern sollen |
| Medication Archive/Delete | `app/modules/intake-stack/medication/index.js` | lokaler Destruktiv-Dialog (`global.confirm`) | Rein komponentenlokal | Bewusst getrennt lassen |
| Doctor Reports Delete / Inbox Clear | `app/modules/doctor-stack/reports/index.js` | lokaler Destruktiv-Dialog (`confirmFn` / `global.confirm`) | Rein komponentenlokal | Bewusst getrennt lassen |
| Doctor Trendpilot Delete | `app/modules/doctor-stack/doctor/index.js` | lokaler Destruktiv-Dialog (`global.confirm`) | Rein komponentenlokal | Bewusst getrennt lassen |
| Trendpilot Ack-Dialog | `app/modules/vitals-stack/trendpilot/index.js` | modal geblockter Acknowledge-Dialog | Eigene 1-Button-Ack-Logik | Bewusst getrennt lassen |
| Medication Daily Confirm / Undo | `app/modules/intake-stack/intake/index.js`, `app/modules/intake-stack/medication/index.js` | direkte Domain-Aktion | Kein Ja/Nein-Flow, sondern direkter Toggle/Batch-Confirm | Kein Pending-Context-Producer |

### 1.2 Konkrete Schlussfolgerung

- Es gibt aktuell zwei echte konversationelle Confirm-Producer im produktiven Sinn:
  - der Assistant-Suggestion-Flow
  - Assistant-`ask_confirmation`
- Mehrere andere Confirm-Stellen im Repo sind bewusst:
  - lokal
  - komponentenspezifisch
  - destruktiv oder modalspezifisch
  - und sollten nicht vorschnell in den generischen Pending-Intent-Context gezogen werden

### 1.3 Empfohlener naechster Schnitt

- Ziel:
  - den naechsten echten konversationellen Confirm-Producer nur dann anbinden, wenn er dieselbe `ja/nein/speichern/abbrechen`-Logik wirklich teilen soll
- Nicht Ziel:
  - bestehende `global.confirm`-Dialoge aus Medication/Doctor/Reports in die Intent Engine verschieben
- Begruendung:
  - die Intent Engine soll konversationelle `ja/nein/speichern/abbrechen`-Pfadlogik vereinheitlichen
  - nicht jede lokale UI-Bestaetigung der App absorbieren

## 2. Guarded Local Dispatch fuer `vitals_quick_log`

- Thema:
  - `vitals_quick_log` war fachlich weiter als der produktive Dispatch-Pfad.
- Warum offen:
  - BP brauchte einen expliziten Messkontext (`M`/`A`), Gewicht hing am Body-Panel bisher an der UI-Pflicht fuer `waist_cm`, und fuer Puls existiert weiterhin kein gleichwertiger lokaler Save-Pfad.
- Risiko wenn ignoriert:
  - Parser und produktiver Text-Flow driften fachlich auseinander.
  - Nutzer erwarten bei klaren Vital-Befehlen denselben Fast-Path wie bei Intake.
- Trigger fuer spaeter:
  - sobald weitere vitals-spezifische Save-Contracts sauber festgezogen oder neue Vitals-Intents freigegeben werden
- Empfohlener naechster Schritt:
  - Guardrails und Save-Pfade nur dort erweitern, wo der Persistenz-Contract fachlich explizit und ohne Hidden Defaults formulierbar bleibt
  - `pulse` erst dann lokal freigeben, wenn ein eigener Guarded-Write-Pfad existiert

### 2.1 Aktueller Stand

- Produktiv lokal dispatchbar:
  - `vitals_log_weight`
    - ueber `AppModules.body.saveIntentWeight(...)`
  - `vitals_log_bp`
    - aber nur, wenn der Intent einen expliziten Kontext traegt (`M` / `A`)
    - z. B. `Blutdruck morgens 128 zu 82`
- Weiterhin bewusst nicht lokal dispatchbar:
  - `vitals_log_pulse`
    - kein gleichwertiger lokaler Guarded-Path vorhanden
  - BP ohne expliziten Kontext
    - z. B. `Blutdruck 128 zu 82`
    - faellt kontrolliert an den Assistant-Fallback, um keine Hidden Defaults auf `M`/`A` einzufuehren

### 2.2 Konsequenz

- Follow-up 2 ist nicht mehr komplett offen, sondern teilweise abgearbeitet.
- Offener Rest ist jetzt fachlich enger:
  - `pulse`
  - eventuelle spaetere Erweiterung des BP-Intent-Contracts

## 3. Produktiver Voice-Dispatch / Voice-Bypass

- Thema:
  - Voice soll denselben Fast-Path nicht nur erkennen, sondern fuer freigegebene Intents auch lokal ausfuehren koennen.
- Warum offen:
  - der Voice-Pfad war architektonisch vorbereitet, aber funktional noch hinter dem Text-Pfad.
- Risiko wenn ignoriert:
  - Text und Voice entwickeln sich funktional auseinander.
  - bei Voice-Reaktivierung steigt der Druck, schnelle Sonderpfade einzubauen.
- Trigger fuer spaeter:
  - Reaktivierung des Voice-UI
  - Arbeiten an `assistant-stack/voice/index.js`
- Empfohlener naechster Schritt:
  - lokalen Voice-Dispatch nur fuer bereits freigegebene Intent-Actions spiegelbildlich zum Text-Pfad anbinden
  - `needs_confirmation` und unklare Faelle weiter konservativ beim Assistant lassen

### 3.1 Aktueller Stand

- Produktiv im Voice-Modul vorbereitet und verdrahtet:
  - lokaler Direct-Dispatch fuer:
    - `intake_save`
    - `open_module`
    - `vitals_log_weight`
    - `vitals_log_bp` mit explizitem Kontext
  - lokaler Voice-Bypass vor dem Assistant-Roundtrip
  - lokale Kurz-Bestaetigung ueber den bestehenden TTS-Pfad
- Weiterhin bewusst nicht lokal im Voice-Pfad:
  - `confirm_reject`
  - `vitals_log_pulse`
  - `vitals_log_bp` ohne expliziten Kontext

### 3.2 Wichtige Grenze

- Das ist noch keine produktive Voice-Reaktivierung im Hub-UI.
- Der Voice-Button bleibt bewusst geparkt.
- Die neue Logik stellt sicher, dass bei spaeterer Reaktivierung nicht wieder ein rein LLM-basierter Altpfad zurueckkommt.

### 3.3 Offener Rest

- produktive UI-Reaktivierung des Voice-Einstiegs
- Entscheidung, ob und wann `confirm_reject` auch im Voice-Pfad einen echten Pending-Context bekommen soll

## 4. Device-/Node-Provenance und Idempotenz

- Thema:
  - der Adapter-Seam fuer spaetere `device`-Quellen ist vorbereitet, aber noch nicht fachlich ausgebaut.
- Warum offen:
  - kuenftige Nodes wie eine DIY-ESP32-Uhr brauchen eigene Vertrauens-, Quellen- und Dedupe-Regeln.
- Risiko wenn ignoriert:
  - stille Fehlwrites
  - Mehrfacheintraege
  - unklare Herkunft von Daten
- Trigger fuer spaeter:
  - erster echter MIDAS-Node
  - Ingest-Bridge oder Device-Adapter
- Empfohlener naechster Schritt:
  - vor der ersten Device-Integration einen kleinen Source-/Trust-Contract definieren:
    - `source_type`
    - `source_id`
    - `dedupe_key`
    - Idempotenz-Regeln

### 4.1 Aktueller Stand

- Der Adapter-/Parser-Surface fuehrt jetzt explizit:
  - `source_type`
  - `source_id`
  - `dedupe_key`
- Erlaubte Quellen sind aktuell bewusst klein:
  - `text`
  - `voice`
  - `device`
- Unbekannte Quellen fallen kontrolliert auf `text` zurueck, statt parserinterne Sonderpfade zu erzeugen.
- Diese Felder laufen jetzt durch bis in den Parser-Output und sind damit fuer spaetere Adapter, Dedupe und Debug-Auswertung sichtbar.

### 4.2 Was bewusst noch nicht gebaut ist

- kein echter Device-Transport
- kein Node-Adapter-Modul
- keine Trust-Level-Logik
- keine globale Idempotenz-Sperre ueber mehrere Quellen hinweg

### 4.3 Konsequenz

- Schritt 4 ist auf Contract-Ebene jetzt sinnvoll vorbereitet.
- Vor einer echten ESP32-/Node-Anbindung fehlt spaeter nur noch der konkrete Ingest-/Trust-Pfad, nicht mehr der Grundvertrag im Intent-Surface.

## 5. Intent-Fallback-Telemetry

- Thema:
  - es gibt bereits Diag-Hooks, aber noch keine gezielte Auswertung von Fehl- oder Fallback-Mustern.
- Warum offen:
  - aktuell ist technisch nachvollziehbar, was passiert, aber noch nicht operativ gebuendelt.
- Risiko wenn ignoriert:
  - haeufige Fast-Path-Misses bleiben zu lange unsichtbar.
  - spaetere Regelverbesserungen werden zu sehr nach Bauchgefuehl gemacht.
- Trigger fuer spaeter:
  - sobald Voice oder Device dazukommen
  - sobald mehr Intent-Klassen produktiv werden
- Empfohlener naechster Schritt:
  - leichte Auswertung von:
    - `decision`
    - `reason`
    - `intent_key`
    - `fallback route`
  - nur Debug-/Diag-basiert, kein schweres Analytics-Feature

### 5.1 Aktueller Stand

- Die Intent Engine fuehrt jetzt einen leichten In-Memory-Telemetry-Snapshot:
  - `recordTelemetry(...)`
  - `getTelemetrySnapshot()`
  - `resetTelemetry()`
- Erfasst werden aktuell:
  - `source_type`
  - `decision`
  - `reason`
  - `intent_key`
  - `target_action`
  - `route`
- Hub und Voice melden jetzt:
  - Preflight
  - Fallback-/Route-Entscheidungen
  - `LLM bypass`

### 5.2 Bewusste Grenze

- kein Persistenz-Store
- kein Analytics-Backend
- keine produktbezogene KPI-Schicht
- nur ein lokaler Debug-/Diag-Snapshot fuer:
  - schnellere Fehlersuche
  - spaetere Regelverbesserung
  - Sichtbarkeit haeufiger Fast-Path-Misses

## 6. Rule Growth Discipline

- Thema:
  - `rules.js` bleibt der wahrscheinlichste spaetere Vermuellungspunkt.
- Warum offen:
  - mit jeder neuen Intent-Klasse waechst die Versuchung, Sonderfaelle direkt in Regeln zu legen.
- Risiko wenn ignoriert:
  - Match, Mapping, Validierung und Domainlogik vermischen sich.
  - spaetere Wartung wird deutlich langsamer und fehleranfaelliger.
- Trigger fuer spaeter:
  - jede neue Intent-Domaene
  - jede Ausnahmebehandlung in `rules.js`
- Empfohlener naechster Schritt:
  - vor jeder Erweiterung aktiv pruefen:
    - gehoert das in `rules.js`?
    - oder in `normalizers.js`, `validators.js`, `context.js` oder in den aufrufenden Flow?

### 6.1 Aktueller Stand

- Die Regelgrenze ist jetzt explizit auch im Code markiert:
  - `rules.js` traegt einen klaren Wartungshinweis, dass dort nur
    - Match-Definitionen
    - und minimales Payload-Mapping
    gehoeren
- Damit ist die Disziplin nicht mehr nur Doku-Absicht, sondern direkt an der sensibelsten Stelle sichtbar.

### 6.2 Bewusste Grenze

- Das ersetzt keine saubere Review.
- Es ist eine Leitplanke, kein technischer Schutzmechanismus.
- Der eigentliche Standard bleibt:
  - keine Validierung in `rules.js`
  - keine Pending-Context-Logik in `rules.js`
  - kein Routing/Persistieren in `rules.js`

## 7. Empfohlene Reihenfolge

1. weitere Confirm-Producer
2. Guarded Local Dispatch fuer `vitals_quick_log`
3. produktiver Voice-Dispatch / Voice-Bypass
4. Device-/Node-Provenance und Idempotenz
5. Intent-Fallback-Telemetry

## 8. Dokumentgrenze

- Die fruehere Negativliste wurde bewusst in die dauerhafte Modulbeschreibung verschoben.
- Referenz jetzt:
  - [Intent Engine Module Overview](c:/Users/steph/Projekte/M.I.D.A.S/docs/modules/Intent%20Engine%20Module%20Overview.md)
- Grund:
  - das ist keine offene Anschlussarbeit
  - sondern eine dauerhafte Scope-Grenze des Moduls
