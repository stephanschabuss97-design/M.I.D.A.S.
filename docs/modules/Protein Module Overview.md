# Protein Module - Functional Overview

Kurze Einordnung:
- Zweck: dynamische Protein-Ziele aus Profil + Aktivitaet + CKD ableiten und im Profil persistieren.
- Rolle: verbindet Body-Save mit Edge-Berechnung; Assistant/Intake lesen nur effektive Targets.
- Abgrenzung: kein Sensor-Tracking, keine Sportanalyse, Doctor-Lock ist hoheitsmaessig.

---

## 1. Zielsetzung

- Problem: statisches Proteinlimit ist ungenau; Zielbereiche sollen dynamisch aus Gewicht, Alter, Aktivitaet und CKD entstehen.
- Benutzer: Patient (Primary), Assistant/Intake als Konsumenten; Arzt indirekt via Doctor-Lock.
- Nicht-Ziel: keine Intensitaetsbewertung, keine automatische Aktivitaetserkennung, keine Dialyse-Logik.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/protein/index.js` | Modul-API, Edge-Call Bridge (`recomputeTargets`). |
| `app/modules/capture/body.js` | Trigger nach Body-Save. |
| `app/modules/profile/index.js` | Doctor-Lock Felder, Targets lesen/schreiben. |
| `app/modules/hub/index.js` | Profil-Payload fuer Assistant/Context. |
| `app/modules/assistant-stack/assistant/day-plan.js` | Protein-Limit im Tagesplan (max/min + Fallback). |
| `sql/10_User_Profile_Ext.sql` | Profile-Spalten (Targets, Doctor-Lock, Derived Fields). |
| `sql/13_Activity_Event.sql` | Activity-Events (Count im 28d-Window). |
| `sql/11_Lab_Event_Extension.sql` | CKD-Stufe aus `lab_event`. |
| `docs/dynamic protein spec.md` | Spec + deterministische Umsetzungsschritte. |
| `C:\\Users\\steph\\Projekte\\midas-backend\\supabase\\functions\\midas-protein-targets\\index.ts` | Edge Function (Compute + Write). |

---

## 3. Datenmodell / Storage

- `user_profile`:
  - Effektive Targets: `protein_target_min`, `protein_target_max`.
  - Doctor-Lock: `protein_doctor_lock`, `protein_doctor_min`, `protein_doctor_max`.
  - Derived: `protein_calc_version`, `protein_window_days`, `protein_last_calc_at`,
    `protein_age_base`, `protein_activity_level`, `protein_activity_score_28d`,
    `protein_factor_pre_ckd`, `protein_ckd_stage_g`, `protein_ckd_factor`, `protein_factor_current`.
- `health_events`:
  - `activity_event` (Count im 28d-Window).
  - `lab_event` (CKD-Stufe, letzte Messung).
- Beziehungen: Profile ist Single Source of Truth; Events dienen als Input fuer Berechnung.

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- Modul wird als eigenes Script geladen.
- Aktiv sobald Supabase Auth verfuegbar ist.

### 4.2 User-Trigger
- Body-Save im Vitals/Body Panel.
- Optional: manueller Trigger (Debug/force).

### 4.3 Verarbeitung
- Edge Function liest Profile + Activity-Count (28d) + CKD-Stufe.
- Guards: Doctor-Lock, Cooldown, CKD/Weight unveraendert.
- Berechnung: Age Base + Activity Modifier, CKD Faktor, Min/Max Target.

### 4.4 Persistenz
- Edge schreibt Targets + Derived Fields in `user_profile`.
- Frontend refresht Profil-Snapshot und feuert `profile:changed`.

---

## 5. UI-Integration

- Profil-Panel:
  - Doctor-Lock Toggle + Doctor Min/Max.
  - Read-only Anzeige fuer Auto-Targets (min/max).
- Intake/Assistant:
  - nutzen `protein_target_max` bzw. `protein_target_min` als Fallback.

---

## 6. Arzt-Ansicht / Read-Only Views

- Keine dedizierte Arztansicht.
- Doctor-Lock ist die manuelle Hoheitslogik (UI im Profil).

---

## 7. Fehler- & Diagnoseverhalten

- Typische Fehler: fehlendes `birth_date`, Edge-Auth, fehlende Lab-Daten.
- Logging: `[protein]` im diag, Edge logs `[midas-protein-targets]`.
- Fallback: Targets bleiben unveraendert, Intake nutzt Default-Fallback.

---

## 8. Events & Integration Points

- Public API: `AppModules.protein.recomputeTargets(...)`.
- Source of Truth: `user_profile` Targets.
- Side Effects: `profile.syncProfile` + `profile:changed`.
- Constraints: Doctor-Lock blockt Edge; Cooldown verhindert Spam.
- Externe Inputs: Body-Save, Activity-Count, CKD aus Lab.

---

## 9. Erweiterungspunkte / Zukunft

- Aktivitaetspunkte feiner gewichten (Minuten/Typen).
- Albuminurie als optionaler Faktor.
- Dialyse-Modus nur via Doctor-Lock.

---

## 10. Feature-Flags / Konfiguration

- Keine Flags.
- Cooldown und Window (28d) sind in der Edge Function verankert.

---

## 11. Status / Dependencies / Risks

- Status: aktiv (im Aufbau).
- Dependencies (hard): `user_profile` Spalten, `activity_event`, `lab_event`, Edge Function.
- Dependencies (soft): Profil-UI, Intake/Assistant Anzeige.
- Known issues / risks: fehlendes `birth_date`, falsches Gewicht, stale CKD, Doctor-Lock ohne Min/Max.
- Backend / SQL / Edge: `sql/10_User_Profile_Ext.sql`, `sql/13_Activity_Event.sql`, `sql/11_Lab_Event_Extension.sql`, Edge `midas-protein-targets`.

---

## 12. QA-Checkliste

- Body-Save triggert Edge Function.
- Doctor-Lock -> skipped.
- Activity-Count beeinflusst ACT1/ACT2/ACT3.
- CKD-Stufe beeinflusst Faktor.
- Profil-Targets aktualisieren Intake/Assistant.

---

## 13. Definition of Done

- Modul laeuft ohne Errors.
- Targets werden bei Body-Save aktualisiert.
- Doctor-Lock wird respektiert.
- Dokumentation aktuell.
