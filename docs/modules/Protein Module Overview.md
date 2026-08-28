# Protein Module - Functional Overview

## C3-Produktionsstand (2026-08-28)

Protein Target v31 läuft produktiv mit `verify_jwt=false` und strikt
serverseitiger In-Function-Auth: angemeldete Benutzer werden über Supabase
Auth validiert, der Scheduler ausschließlich über seinen eigenen benannten
Secret Key. Die unveränderte v1.3-Formel verwendet genau einen
ownergebundenen 28-Tage-SQL26-Snapshot. Activity V1 bleibt der einzige
Capturewriter.

C3 ist `DONE`: Das Hub-Dashboard zeigt den gespeicherten Protein-Zielbereich
und öffnet einen read-only Kontextdialog. Der Client projiziert ausschließlich
gespeicherte Profil- und Gewichtsdaten; Formel, Schwellen, Modifier und
Persistenz bleiben unverändert im bestehenden Protein-/Profile-Vertrag.

Kurze Einordnung:
- Zweck: dynamische Protein-Ziele aus Profil + Aktivitaet + CKD ableiten und im Profil persistieren.
- Rolle: verbindet Body-Save mit Edge-Berechnung; Assistant/Intake lesen nur effektive Targets.
- Abgrenzung: kein Sensor-Tracking, keine Sportanalyse, Doctor-Lock ist hoheitsmaessig.

Related docs:
- [Bootflow Overview](bootflow overview.md)
- [Activity V2 R12 Roadmap](<../archive/MIDAS Activity V2 R12 Protein Target and Trendpilot Compatibility Roadmap (DONE).md>)
- [Activity V2 R13 Roadmap](<../archive/MIDAS Activity V2 R13 Read-Consumer Activation and V1 Parity Roadmap (DONE).md>)
- [Activity V2 C3 Roadmap](<../archive/MIDAS Activity V2 C3 Training Product Surface and Protein Context Relocation Roadmap (DONE).md>)

---

## 1. Zielsetzung

- Problem: statisches Proteinlimit ist ungenau; Zielbereiche sollen dynamisch aus Gewicht, Alter, Aktivitaet und CKD entstehen.
- Benutzer: Patient (Primary), Assistant/Intake als Konsumenten; Arzt indirekt via Doctor-Lock.
- Nicht-Ziel: keine Intensitaetsbewertung, keine automatische Aktivitaetserkennung, keine Dialyse-Logik.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
| --- | --- |
| `app/modules/vitals-stack/protein/index.js` | Modul-API, Edge-Call Bridge (`recomputeTargets`). |
| `app/modules/vitals-stack/vitals/body.js` | Trigger nach Body-Save. |
| `app/modules/profile/index.js` | Doctor-Lock Felder, Targets lesen/schreiben und gespeicherte Derived Fields für die read-only Projektion liefern. |
| `app/modules/hub/index.js` | Profil-Payload für Assistant sowie read-only Protein-Kontextdialog. |
| `app/modules/assistant-stack/assistant/day-plan.js` | Protein-Limit im Tagesplan (max/min + Fallback). |
| `sql/10_User_Profile_Ext.sql` | Profile-Spalten (Targets, Doctor-Lock, Derived Fields). |
| `sql/13_Activity_Event.sql` | Activity-Events (Count im 28d-Window). |
| `sql/11_Lab_Event_Extension.sql` | CKD-Stufe aus `lab_event`. |
| `backend/supabase/functions/midas-protein-targets/index.ts` | Edge Function (Compute + Write). |
| `backend/supabase/functions/midas-protein-targets/activity-compatibility.ts` | Produktiver purer Adapter für Aktivtage, ACT-Level und Modifier. |

---

## 3. Datenmodell / Storage

- `user_profile`:
  - Effektive Targets: `protein_target_min`, `protein_target_max`.
  - Doctor-Lock: `protein_doctor_lock`, `protein_doctor_factor`, `protein_doctor_min`, `protein_doctor_max`.
  - Derived: `protein_calc_version`, `protein_window_days`, `protein_last_calc_at`,
    `protein_age_base`, `protein_activity_level`, `protein_activity_score_28d`,
    `protein_factor_pre_ckd`, `protein_ckd_stage_g`, `protein_ckd_factor`, `protein_factor_current`.
  - Future idea, nicht aktuelles Schema: `protein_ckd_confirmed_at` fuer spaetere CKD-Staleness-Prompts.
- `health_events`:
  - `activity_event` (Count im 28d-Window).
  - `lab_event` (CKD-Stufe, letzte Messung).
- Beziehungen: Profile ist Single Source of Truth; Events dienen als Input fuer Berechnung.

---

## 3.1 Non-Goals

- Keine Sportanalyse (Intensitaet, VO2max, Minuten).
- Keine automatische Aktivitaetserkennung.
- Keine Dialyse-Logik (nur Doctor-Lock).
- Kein Intake als Input fuer Targets.

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- Modul wird als eigenes Script geladen.
- Aktiv sobald Supabase Auth verfuegbar ist.

### 4.2 User-Trigger
- Body-Save im Vitals/Body Panel.
- Optional: manueller Trigger (Debug/force, aktuell nicht genutzt).

### 4.3 Verarbeitung
- Edge Function liest Profile + Activity-Count (28d) + CKD-Stufe.
- Guards: Cooldown (7 Tage), Gewicht/Faktor unveraendert -> skip.
- Berechnung: Age Base + Activity Modifier, CKD Faktor, Min/Max Target.
- Doctor-Lock: nutzt `protein_doctor_factor` als Source of Truth (wenn aktiv); fehlt der Faktor, wird der Run skipped.
- Activity bleibt Count-basiert (bewusste Sessions, keine Minuten).
- Der in R12 isoliert bewiesene Adapter vereinigt seit R13 dieselben ACT-
  Schwellen auf unterschiedlichen Wiener Aktivtagen aus dem ownergebundenen
  SQL26-Snapshot. Solange R14 den Writer nicht umstellt, stammen produktive
  Aktivitaeten weiterhin ausschließlich aus V1-`activity_event`-Zeilen.
- CKD-Stufe wird konservativ aufgeloest:
  - zuerst letztes `lab_event.payload.ckd_stage`
  - dann bestehendes `user_profile.protein_ckd_stage_g`
  - wenn beides fehlt: Auto-Berechnung skipped mit `ckd_stage_missing`
  - Doctor-Lock mit validem Doctor-Faktor darf ohne CKD weiter Zielwerte schreiben, erfindet aber keine CKD-Metadaten.

### 4.4 Persistenz
- Edge schreibt Targets + Derived Fields in `user_profile`.
- Frontend refresht Profil-Snapshot und feuert `profile:changed`.
- Future idea: eine spaetere CKD-Bestaetigung koennte ein eigenes Staleness-Feld setzen; aktuell gibt es keinen solchen Write.

## 4.5 Berechnungslogik (v1, deterministisch)

- Rolling Window: 28 Tage (inkl. heute, day >= today-27).
- Activity Score: Anzahl `activity_event` im Window (Count).
- Activity Level:
  - ACT1: score < 2
  - ACT2: 2 <= score < 6
  - ACT3: score >= 6
  - Modifier: ACT1 +0.1, ACT2 +0.2, ACT3 +0.3
- Altersbasis (g/kg):
  - <20: 0.8
  - 20-39: 0.9
  - 40-59: 1.0
  - 60-69: 1.1
  - 70-79: 1.2
  - >=80: 1.3
- CKD Faktor (sanft, multiplikativ):
  - G1: 1.00
  - G2: 0.95
  - G3a: 0.90
  - G3b: 0.85
  - G4: 0.75
  - G5: 0.65
- Faktor:
  - `factor_pre_ckd = round(age_base + activity_modifier, 2)`
  - `factor_auto = round(factor_pre_ckd * ckd_factor, 2)`
  - `factor_current = doctor_factor (round 2)` wenn Doctor-Lock aktiv, sonst `factor_auto`
- Targets:
  - `target_max = round(weight_kg * factor_current)` (ganze Gramm)
  - `target_min = round(weight_kg * (factor_current - 0.1))` (ganze Gramm)

---

## 5. UI-Integration

- Profil-Panel:
  - Read-only Anzeige fuer Auto-Faktor (g/kg) + Auto-Targets (min/max).
  - Doctor-Lock Toggle zeigt Doctor-Faktor + Doctor Min/Max nur wenn aktiv.
  - CKD-Stufe und Medikation sind aus der Eingabe entfernt (nur Anzeige im Profil).
  - Activity-Level/CKD-Faktor werden nicht angezeigt.
- Intake/Assistant:
  - nutzen `protein_target_max` bzw. `protein_target_min` als Fallback.
- Assistant-Text:
  - zeigt nur den Zielbereich (kein Faktor).
- Hub-Dashboard:
  - zeigt `PROTEIN-ZIEL` als ruhigen Button mit dem gespeicherten Zielbereich.
  - öffnet einen read-only Dialog mit Zielbereich, letztem gespeicherten
    Gewicht, Altersbasis, Activity-Fenster/-Level/-Score/-Modifier,
    CKD-Kontext, aktuellem Faktor, Calc-Version und letztem Berechnungszeitpunkt,
    soweit die gespeicherten Felder vorhanden sind.
  - unterscheidet `loading`, erfolgreiche Leere, Daten und `error`.
  - ruft weder `recomputeTargets` noch die Edge Function auf und schreibt keine
    Profil- oder Health-Daten.

---

## 6. Arzt-Ansicht / Read-Only Views

- Keine dedizierte Arztansicht.
- Doctor-Lock ist die manuelle Hoheitslogik (UI im Profil).
- Später möglich: Faktor und Zielbereich im aktuellen Arztbericht anzeigen.

---

## 7. Fehler- & Diagnoseverhalten

- Typische Fehler: fehlendes `birth_date`, Edge-Auth, fehlende `protein_doctor_factor` bei aktivem Doctor-Lock, fehlende CKD-Quelle im Auto-Pfad.
- Kontrollierte Skips:
  - `doctor_factor_missing`
  - `ckd_stage_missing`
- Diagnose-Responses koennen `ckd_source` enthalten (`lab`, `profile`, `missing`) zur Diagnose; dieser Wert wird nicht in `user_profile` persistiert.
- Logging: `[protein]` im diag, Edge logs `[midas-protein-targets]`.
- Fallback: Targets bleiben unveraendert, Intake nutzt Default-Fallback.

---

## 8. Events & Integration Points

- Public API: `AppModules.protein.recomputeTargets(...)` für den bestehenden
  Body-Save-Pfad sowie `AppModules.protein.loadStoredContext(profile)` für die
  rein lesende Hub-Projektion.
- Source of Truth: `user_profile` Targets.
- Side Effects: `profile.syncProfile` + `profile:changed`.
- Constraints: Doctor-Lock nutzt Doctor-Faktor; fehlt der Faktor, wird der Run skipped. Cooldown verhindert Spam.
- Externe Inputs: Body-Save, Activity-Count, CKD aus Lab.
- Optional: manueller Recompute (force=true, aktuell nicht genutzt).
- Optional: woechentlicher Recompute via GitHub Actions (Do->Fr Nacht, Service Role Bearer).

---

## 9. Erweiterungspunkte / Zukunft

- CKD-Staleness-Check mit "Noch gleiche Stufe?" Prompt (Ja = Timer reset, Nein = Profil oeffnen).
- Manueller Recompute-Button im Profil (aktuell nicht genutzt).
- Woechentlicher Cron-Run (separat von Trendpilot).
- Aktivitaetspunkte feiner gewichten (nur wenn Minutes spaeter gewuenscht).
- Albuminurie als optionaler Faktor.
- Dialyse-Modus nur via Doctor-Lock.
- R13 aktiviert den bewiesenen R12-Aktivtagadapter, erhöht dabei die Calc-
  Version auf `v1.3-*` und prüft die sichtbare Bedeutung von
  `protein_activity_score_28d`; R12 selbst ändert weder Profil noch Targets.

---

## 10. Feature-Flags / Konfiguration

- Keine Flags.
- Cooldown und Window (28d) sind in der Edge Function verankert.
- Env (Edge): `PROTEIN_TARGETS_USER_ID` fuer Cron-Run.
- GitHub Secrets: `PROTEIN_TARGETS_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

---

## 11. Status / Dependencies / Risks

- Status: aktiv; R13-Consumer und C3-Hub-Projektion produktiv verdrahtet.
- Dependencies (hard): `user_profile` Spalten, `activity_event`, `lab_event`, Edge Function.
- Dependencies (soft): Profil-UI, Intake/Assistant Anzeige.
- Known issues / risks: fehlendes `birth_date`, falsches Gewicht, fehlender Doctor-Faktor trotz Lock, fehlende CKD-Quelle im Auto-Pfad erzeugt Skip statt stillen Write.
- R13-Stand: Der in R12 bewiesene Adapter ist produktiv im Edge-Handler aktiv;
  Activity V1 bleibt bis R14 der einzige Capturewriter. C3 hat Formel,
  Scheduler, Profilfelder, Calc-Version und Persistenz nicht veraendert.
- Backend / SQL / Edge: `sql/10_User_Profile_Ext.sql`, `sql/13_Activity_Event.sql`, `sql/11_Lab_Event_Extension.sql`, Edge `midas-protein-targets`, Workflow `protein-targets.yml`.

---

## 12. QA-Checkliste

- Body-Save triggert Edge Function.
- Doctor-Lock nutzt Doctor-Faktor; wenn fehlt -> skipped.
- Activity-Count beeinflusst ACT1/ACT2/ACT3.
- CKD-Stufe beeinflusst Faktor.
- Lab ohne CKD-Stufe nutzt `protein_ckd_stage_g` als Fallback.
- Auto ohne Lab- und Profil-CKD skipped mit `ckd_stage_missing`.
- Doctor-Lock ohne CKD schreibt keine erfundenen CKD-Metadaten.
- Profil-Targets aktualisieren Intake/Assistant (Range-only).
- Hub-Dashboard und Dialog projizieren gespeicherte Werte korrekt in Lade-,
  Leer-, Daten- und Fehlerzustand, ohne Recompute oder Write.
- Dialogfokus bleibt modal gebunden und wird beim Schliessen wiederhergestellt.
- R12-Adapter: aktive Tage 0/1/2/5/6 ergeben unverändert ACT1/ACT1/ACT2/
  ACT2/ACT3 und Modifier 0.1/0.1/0.2/0.2/0.3; mehrere Einheiten desselben
  Wiener Tages zählen einmal. (done, isoliert)

---

## 13. Definition of Done

- Modul laeuft ohne Errors.
- Targets werden bei Body-Save aktualisiert.
- Doctor-Lock wird respektiert.
- Der Hub-Dialog bleibt read-only und führt keine zweite Proteinberechnung ein.
- Dokumentation aktuell.
