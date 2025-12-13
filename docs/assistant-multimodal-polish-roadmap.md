# Assistant – Multimodal & Polish Roadmap

## Zielbild (chat-übergreifend)

Diese Roadmap ist absichtlich so geschrieben, dass wir sie über mehrere Chat-Sessions hinweg verwenden können: Sie erklärt kurz den Ist-Zustand, das gewünschte Zielverhalten und führt dann deterministisch durch die nötigen Schritte.

Wichtige Referenz-Doku (Einordnung, Ist-Flow, Event-Pipeline, Dateien):
- `docs/modules/Assistant Module Overview.md`

Ziel ist ein Assistant-Flow, der sich für Nutzer wie ein „ChatGPT-Chat“ anfühlt, aber mit MIDAS-spezifischer Logik:

1. **Ein Prompt = ein Turn (Compose statt Auto-Run)**  
   Nutzer kann **Text + Foto + Kontext** in *einem* Sendevorgang abschicken. Ein Foto-Upload erzeugt zunächst nur ein Draft/Attachment und löst keine sofortige Analyse aus.
2. **Robuster Save-Flow (Single Confirm)**  
   Nach der Vision-Analyse erscheint **genau eine** Bestätigungsabfrage („Soll ich speichern?“), die beim ersten Klick zuverlässig schließt und exakt einmal speichert.
3. **Smart Follow-up nach Speicherung**  
   Nach erfolgreichem Speichern fragt der Assistant optional, ob er eine **CKD‑freundliche Essensidee** vorschlagen soll – mit Kontext (Uhrzeit, CKD‑Stufe, Tageswerte Salz/Protein, zuletzt gespeicherte Makros).

---

## Phase 0 – Ist-Zustand erfassen (1–2h)

1. **Trigger-Analyse Foto**
   - Identifiziere die Stelle, die beim Foto-Upload aktuell sofort `/midas-vision` auslöst (laut Doku: `handleAssistantPhotoSelected` in `app/modules/hub/index.js`).
   - Notiere: Welche Daten werden gesendet (nur `image_base64`? auch `history`/`context`?).

2. **Confirm-Dialog Bug reproduzieren**
   - Steps exakt dokumentieren: Foto wählen → Analyse → Dialog → Klick „Ja“ → Verhalten.
   - Prüfen, ob Event-Handler doppelt gebunden werden (z. B. bei jedem Render).

3. **Follow-up Ist-Flow**
   - Prüfen, ob nach `intake_save` bereits `runIntakeSaveFollowup()` läuft (siehe `docs/modules/Assistant Module Overview.md`).
   - Notieren, ob und wo man ein zusätzliches Follow-up einklinken kann.

Deliverable: kurze Bugliste + Repro Steps + erwartetes Verhalten.

---

## Phase 1 – Compose-Turn (Text + Foto in einem Prompt)

1. **UI/State: Draft statt Auto-Run**
   - Foto-Upload soll nur ein **Draft Attachment** erzeugen (Thumbnail + „bereit zum Senden“).
   - Text bleibt editierbar, „Senden“ triggert die Analyse gemeinsam.

2. **Payload-Standard**
   - Definiere ein einziges Request-Objekt:
     - `text` (optional)
     - `image_base64` (optional)
     - `context` (Butler Snapshot: Intake Totals, Termine, Profil)
     - `session_id`/`history`

3. **Backend Routing klären**
   - Entscheidung: Wird multimodal über `midas-vision` gelöst (Vision + Kontext) oder über `midas-assistant` erweitert?
   - Ziel: Nur **ein** Netzwerk-Call pro Turn.

4. **Chat History konsolidieren**
   - Stelle sicher, dass genau eine Chat-Bubble pro User-Turn erzeugt wird (Text + Thumbnail).
   - Assistant Response soll als eine Bubble zurückkommen.

Acceptance:
- Foto hochladen triggert *keine* Analyse.
- „Senden“ triggert *genau eine* Analyse/Antwort.

---

## Phase 2 – Save-Dialog fixen (Single Confirm, einmalige Aktion)

1. **Single Source of Truth für Suggestion/Confirm UI**
   - Nur eine Dialog-Instanz/Komponente darf aktiv sein.
   - Beim Render: alte Listener entfernen oder „bind once“-Pattern nutzen.

2. **State Machine definieren**
   - Zustände: `idle` → `analysis_done` → `confirm_open` → `saving` → `saved|error`.
   - Buttons im Zustand `saving` deaktivieren, UI zeigt „speichert…“.

3. **Event-Pipeline audit**
   - Prüfe Events aus Doku:
     - `assistant:suggest-confirm`
     - `assistant:suggest-answer`
     - `assistant:action-success`
   - Sicherstellen: jeder Klick löst nur einen Pfad aus und räumt UI auf.

Acceptance:
- Beim ersten Klick (Ja/Nein) schließt der Dialog zuverlässig.
- Speichern passiert genau einmal; kein „zweiter Klick macht nichts“.

---

## Phase 3 – Follow-up „CKD‑friendly meal suggestion“

1. **Follow-up Hook**
   - Nach erfolgreichem Save (`assistant:action-success` / `runIntakeSaveFollowup`) zusätzliches Follow-up anbieten.

2. **Kontext zusammenstellen**
   - Uhrzeit-Slot: Frühstück/Mittag/Abend.
   - Profil: CKD‑Stufe, Salz-/Protein-Limits (aus Profil; Lab später).
   - Intake Totals: Salz/Protein bisher + zuletzt gespeicherte Werte.

3. **Prompt/Antwortformat**
   - Kurzer Vorschlag (1–3 Optionen) + Why (salz/protein) + nächster Schritt.
   - Optional: „In Intake speichern?“ nur wenn sinnvoll.

Acceptance:
- Nach Speichern erscheint eine klare „Soll ich…?“ Frage.
- Bei „Ja“ kommt ein Vorschlag mit Kontext (Uhrzeit + Tagesbudget + CKD).

---

## Phase 4 – QA & Regression

1. **Happy Path**
   - Text-only
   - Foto-only
   - Text+Foto in einem Turn

2. **Edge Cases**
   - Mehrfach auf „Senden“ klicken
   - Upload abbrechen
   - Netzwerkfehler / 500er
   - `prefers-reduced-motion` (UI sollte trotzdem stabil sein)

3. **Docs aktualisieren**
   - `docs/modules/Assistant Module Overview.md`: Foto-Flow nicht mehr „auto-run“, sondern „draft + send“.

---

## Dateien (Orientierung)

- Frontend Hub: `app/modules/hub/index.js` (Orchestrierung, Foto-Upload, Events)
- Assistant UI: `app/modules/assistant/index.js`
- Suggest/Confirm UI: `app/modules/assistant/suggest-ui.js`
- Actions/Guards: `app/modules/assistant/actions.js`, `app/modules/assistant/allowed-actions.js`
- Follow-up Helper: `app/modules/assistant/day-plan.js`
- Backend: `supabase/functions/midas-assistant/index.ts`, `supabase/functions/midas-vision/index.ts`
