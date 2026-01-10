# Proteinrechner Roadmap

Wichtige Dateien (aktuell)
- `app/modules/vitals-stack/protein/index.js` (Edge-Bridge: recomputeTargets)
- `app/modules/vitals-stack/vitals/body.js` (Trigger nach Body-Save)
- `app/modules/profile/index.js` (Doctor-Lock + Targets lesen/schreiben)
- `app/modules/hub/index.js` (Profil-Context fuer Assistant/Hub)
- `app/modules/assistant-stack/assistant/day-plan.js` (Protein-Limit im Tagesplan)
- `docs/modules/Protein Module Overview.md` (Master-Doku)
- `docs/dynamic protein spec.md` (Spec/Logik)
- `C:\\Users\\steph\\Projekte\\midas-backend\\supabase\\functions\\midas-protein-targets\\index.ts` (Edge Function)
- `sql/10_User_Profile_Ext.sql`, `sql/11_Lab_Event_Extension.sql`, `sql/13_Activity_Event.sql`

Ziel
- Dynamische Protein-Ziele bleiben deterministisch und low-friction.
- Aktivitaet zaehlt als bewusste Sessions (Count), keine Minutenreiterei.
- CKD-Stufe bleibt medizinisch kontextualisiert, aber ohne Dauer-Altlast (Staleness-Check).
- Profil + Assistant zeigen Zielbereich + Faktor transparent an.
- Optional: woechentlicher Recompute als sanfter Zweithebel.

Scope
- CKD-Staleness-Check mit "Bist du noch auf der gleichen Stufe?" Prompt.
- Profil-UI zeigt Faktor/Range + optionaler manueller Recompute.
- Assistant-Text zeigt Faktor/Range.
- Woechentlicher Recompute via GitHub Actions (Do->Fr Nacht).
- Keine Aktivitaets-Minutenwertung; nur Sessions/Count.

Nicht im Scope
- Intake als Input fuer Protein-Targets.
- Diagnosen oder Therapieentscheidungen.
- Sportwissenschaftliche Analyse (Intensitaet, VO2max, Makros).

Annahmen
- Single-User Betrieb.
- `activity_event` wird manuell und bewusst gespeichert.
- CKD-Stufe kommt aus letztem `lab_event` (payload.ckd_stage).
- `user_profile` ist Single Source of Truth fuer Targets.

Deterministische Hauptsteps

1) Doku & Zielbild verankern (done)
  1.1 `docs/modules/Protein Module Overview.md` mit neuen Prinzipien ergaenzen (Count-only, Staleness-Check, Cron-Trigger). (done)
  1.2 `docs/dynamic protein spec.md` als deprecated markieren. (done)

2) CKD-Staleness-Check (Prompt-Flow)
  2.1 Neue Datenbasis definieren: (done)
      - `user_profile.protein_ckd_confirmed_at` (timestamptz) (done)
  2.2 UX-Flow: (done)
      - Trigger-Bedingung:
        - `last_lab_event.day` <= heute-180
        - und (`protein_ckd_confirmed_at` fehlt oder < `last_lab_event.day`)
      - Prompt-Text: "Ist deine CKD-Stufe noch gleich?"
      - Buttons:
        - "Ja, gleich" -> `protein_ckd_confirmed_at = now` (Timer reset)
        - "Nein" -> Profil oeffnen (CKD-Felder sichtbar), kein Auto-Update durch MIDAS
      - Prompt nur einmal pro Session zeigen (dedupe).
  2.3 Confirm-Stage wird bewusst nicht gespeichert (schlankes Modell). (done)
  2.4 Implementierung: (not used: Prompt-Flow aktuell nicht umgesetzt)
      - Prompt als Popup (konsistent mit Trendpilot).
      - Hinweis: Spaeter optional "Nachrichten-Banner" als Alternative erwaegen.
      - "Nein" oeffnet Profil-Panel direkt.
  2.5 Module Overview nachziehen (neu erkannte Regeln/Flow). (not used: Prompt-Flow defered)

3) Profil-UX: Faktor & Zielbereich sichtbar machen
  3.1 Anzeige "Zielbereich" (min/max g) + Faktor (g/kg) im Profil. (done)
      - Activity-Level und CKD-Faktor werden nicht angezeigt.
  3.2 Doctor-Lock Faktor als Source of Truth (Edge berechnet Range):
      3.2.1 DB/Schema: `user_profile.protein_doctor_factor` (numeric) hinzufuegen. (done)
      3.2.2 UI/Profil: Doctor-Lock nimmt Faktor (g/kg) auf; Min/Max sind read-only und abgeleitet. (done)
      3.2.3 Edge Function: Wenn Doctor-Lock aktiv -> Faktor = `protein_doctor_factor`,
            sonst Faktor = auto (CKD/Activity/Weight). (done)
      3.2.4 Range-Berechnung vereinheitlichen: (done)
            - Faktor auf 2 Dezimalstellen runden (nearest).
            - Min/Max = Faktor x Gewicht, Zielwerte auf ganze Gramm runden (nearest).
      3.2.5 Persistenz: speichere `protein_factor_current`, `protein_target_min/max` wie bisher,
            aber Quelle (auto vs doctor) im Payload/Log nachvollziehbar. (done)
      3.2.6 Module Overview nachziehen (Doctor-Lock Faktor-Flow). (done)
  3.3 Optionaler manueller Recompute-Button (force=true) (nach 3.2). (not used)
  3.4 Module Overview nachziehen (UI/Display) (letzter Punkt in 3). (done)

4) Assistant-Text: Faktor & Range
  4.1 Assistant zeigt "Protein X-Y g (Faktor Z.ZZ g/kg)". (not used: Faktor im Assistant nicht benoetigt)
  4.2 Fallback bleibt `protein_target_*` aus Profil; kein neuer Rechenpfad. (not used: keine Aenderung am Assistant)
  4.3 Module Overview nachziehen (Assistant-Text). (not used: keine UI-Anpassung am Assistant)

5) Woechentlicher Recompute (GitHub Actions)
  5.1 Scheduler-Plan: Do->Fr Nacht (UTC beachten). (done)
  5.2 Auth-Strategie definieren:
      - Option A: Service Role Bearer + `PROTEIN_TARGETS_USER_ID` in der Edge-Env. (done)
  5.3 Cron-Call implementieren (nur wenn Auth-Struktur steht). (done)
  5.4 Logger/diag fuer Cron-Runs. (done: Workflow-Logs reichen)
  5.5 Module Overview nachziehen (Cron-Trigger). (done)

6) QA / Validierung
  6.1 Body-Save triggert Recompute (bestehend). (not used: bereits beobachtet)
  6.2 CKD-Staleness Prompt erscheint nach X Tagen ohne Lab-Update. (not used: Prompt-Flow defered)
  6.3 "Ja" setzt Confirm-Timer; "Nein" oeffnet Profil. (not used: Prompt-Flow defered)
  6.4 Profil zeigt Faktor/Range konsistent (Auto vs Doctor-Lock). (done)
  6.5 Assistant-Text zeigt Faktor/Range, keine Regressions. (not used: keine Assistant-Aenderung)
  6.6 Cron-Run schreibt Targets oder skipped sauber. (done)
  6.7 Module Overview nachziehen (QA-Status). (done)

Offene Fragen (vor Implementierung klaeren)
- n/a
