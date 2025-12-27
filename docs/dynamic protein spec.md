# SPEC: Dynamic Protein Targets (Age - Weight - Activity - CKD, Rolling 28d, Quiet Mode)

## 0. Kontext / Ist-Zustand

* Das Profil-Modul speichert Stammdaten + Limits (Salz/Protein) in `user_profile` und feuert `profile:changed`, damit Charts/Assistant sofort reagieren. 
* Der Assistant/Butler-Header zeigt aktuell â€œSalzlimit X g, Proteinlimit Y gâ€ aus dem Profil-Snapshot. 
* Intake/Capture nutzt Limits fÃ¼r Warnungen/Pills und speichert Intake-Totals via RPC. 
* Body-Werte (Gewicht etc.) werden im Capture/Vitals Panel gespeichert und sind damit ein natÃ¼rlicher Triggerpunkt. 

**Problem:** Proteinlimit ist derzeit â€œfixâ€ (z.B. 110g), obwohl medizinisch sinnvoller ist: dynamisch aus Gewicht + Alter + bestÃ¤tigter AktivitÃ¤t â€“ und (optional) leise gedÃ¤mpft durch CKD-Stufe, solange kein Arzt-Lock aktiv ist.

---

## 1. Zielbild (User Story)

MIDAS berechnet einen dynamischen Protein-Zielbereich (Min/Max) basierend auf:

* Alter (aus Profil: `birth_date`)
* KÃ¶rpergewicht (aus Body-Save)
* bestÃ¤tigten AktivitÃ¤ts-Events als Rohdaten in Supabase (Freitext erlaubt)
* **CKD-Stufe (G-Staging) aus letztem Lab-Event** als *sanfter Multiplikator*, **nur wenn Auto-Mode aktiv** 

Rolling Window: letzte 28 Tage, aktualisiert bei jedem Body-Save (Cooldown guard bleibt aktiv).

Das Ergebnis wird:

* in `user_profile` persistiert (derived fields)
* im Profil als dynamischer Bereich angezeigt (read-only, kleines Eyecandy)
* im Intake als Budget/Limit genutzt (Warnlogik & Anzeige) 
* im Assistant-Context verwendet (Header + Vision/Text-Antworten) 

**Wichtig (Dual-Mode, Arzt hoheitsmÃ¤ÃŸig):**

* **AUTO (MIDAS darf rechnen):** Checkbox â€žDoctor-Lockâ€œ = *off* â†’ Edge Function rechnet und schreibt Targets ins Profil.
* **DOCTOR (Edge auf Hold):** Checkbox â€žDoctor-Lockâ€œ = *on* + 2 Felder befÃ¼llt â†’ Edge Function macht **nichts**, MIDAS Ã¼berwacht nur, Assistant/Intake verwenden die Doctor-Targets.

**Modul-Entscheidung:**
Dieses Feature wird als eigenes Modul umgesetzt (analog zu Trendpilot).
Es bekommt einen eigenen Ordner unter `app/modules/vitals-stack/` (z. B. `app/modules/vitals-stack/protein/`).


---

## 2. Non-Goals (bewusst NICHT)

* Kein SchrittzÃ¤hler / kein PAL aus Sensoren.
* Keine Sportwissenschaft (IntensitÃ¤t, VO2max, Makrosplit).
* Keine automatische â€žSport erkanntâ€œ Logik: nur bestÃ¤tigte Events zÃ¤hlen.
* Keine â€žDiskussionâ€œ mit dem Arzt: **Doctor-Mode ist final**.

---

## 3. Datenmodell

### 3.1 `user_profile` (bestehend)

Ist-Felder u.a.: `birth_date`, `salt_limit_g`, bisherige Protein-Felder. 

### 3.2 Erweiterung `user_profile` (neu)

Wir trennen **(a) effektive Targets** von **(b) Berechnungs-Metadaten** und **(c) Doctor-Lock**.

#### A) Effektive Targets (Single Source of Truth fÃ¼r Assistant/Intake)

* `protein_target_min` (INT) â€“ **effektiv**
* `protein_target_max` (INT) â€“ **effektiv**

> Assistant/Intake lesen **immer** diese beiden Felder.

#### B) Doctor-Lock (2 Felder + Checkbox)

* `protein_doctor_lock` (BOOL, default `false`)
* `protein_doctor_min` (INT, nullable)
* `protein_doctor_max` (INT, nullable)

**Regel:**
Wenn `protein_doctor_lock = true` â†’ `protein_target_*` mÃ¼ssen den Doctor-Werten entsprechen (UI setzt das so), und die Edge Function bleibt still.

#### C) Auto-Calc Derived Fields (Eyecandy + Debug)

* `protein_calc_version` (TEXT, z.B. `"v1.1"`)
* `protein_window_days` (INT, fix 28)
* `protein_last_calc_at` (timestamptz)
* `protein_age_base` (NUMERIC, g/kg)
* `protein_activity_level` (TEXT: `"ACT1"|"ACT2"|"ACT3"`)  *(bewusst nicht A1/A2/A3 â†’ Verwechslungsgefahr mit CKD A1/A2/A3)*
* `protein_activity_score_28d` (NUMERIC)
* `protein_factor_pre_ckd` (NUMERIC, g/kg)
* `protein_ckd_stage_g` (TEXT, z.B. `"G3a"`, nullable)
* `protein_ckd_factor` (NUMERIC, nullable)
* `protein_factor_current` (NUMERIC, g/kg)  *(nach CKD-Multiplikator)*

Backwards-Compatibility (Quickfix-Option):

* Legacy Feld(e) bleiben unangetastet; UI kann spÃ¤ter sauber umbenennen.

---

## 4. AktivitÃ¤t als Rohdaten (Supabase)

### 4.1 Speicherung: `health_events` (empfohlen)

Analog zum etablierten Pattern als neuer Event-Typ in `health_events`. 

**Neuer Event-Typ:** `type = 'activity_event'`

Payload (Minimal, v1 - Freitext first):

```json
{
  "activity": "Gym",
  "duration_min": 45,
  "note": "optional"
}
```

**Wichtig:**

* Nur bestÃ¤tigte, echte AktivitÃ¤t (Button â€žgespeichertâ€œ).
* Monatsbericht darf spaeter einfach ueber `activity` zaehlen (Buckets = normalized activity).

---

## 5. Berechnungslogik (deterministisch, ruhig)

### 5.1 Rolling Window

* Window: letzte 28 Tage (inkl. heute)
* `protein_activity_score_28d` = Anzahl bestaetigter `activity_event` im Window
  *(nur Count, keine Minuten- oder Intensitaetswertung)*

Recompute-Trigger:
* bei jedem Body-Save

Optionaler Guard (falls Body haeufiger gespeichert wird):
* wenn `now - protein_last_calc_at < 7 Tage` und `force != true` -> skipped
* wenn `ckd_stage` unveraendert und `weight_delta < 1.0 kg` -> skipped

### 5.2 Altersbasis (g/kg)

Tabelle (v1):

* 20â€“39 â†’ 0.9
* 40â€“59 â†’ 1.0
* 60â€“69 â†’ 1.1
* 70â€“79 â†’ 1.2
* 80â€“99 â†’ 1.3

Clamp:

* <20 â†’ 0.8
* â‰¥99 â†’ 1.3

### 5.3 Activity Level aus Score (28d)

Schwellen (v1):

* `ACT1`: score < 2
* `ACT2`: 2 â‰¤ score < 6
* `ACT3`: score â‰¥ 6

Modifikator pro Level:

* `ACT1`: +0.1
* `ACT2`: +0.2
* `ACT3`: +0.3

Default: mindestens `ACT1`, auch ohne Daten.

### 5.4 CKD-Faktor (G-Staging, konservativ)

Quelle: letzte `lab_event` Speicherung enthÃ¤lt CKD-Stufe als Single Source of Truth. 

**Warum nur â€žsanftâ€œ?**
Leitlinien empfehlen bei nicht-dialysepflichtiger CKD hÃ¤ufig niedrigere Proteinziele (z.B. ~0.6â€“0.8 g/kg in bestimmten Gruppen bzw. strikter in CKD 3â€“5 unter Bedingungen), aber immer mit Risiko von MangelernÃ¤hrung/Sarkopenie im Hinterkopf. ([PubMed Central][1])

**MIDAS-Mapping (v1.1, sanft, multiplikativ):**

* G1 â†’ `1.00`
* G2 â†’ `0.95`
* G3a â†’ `0.90`
* G3b â†’ `0.85`
* G4 â†’ `0.75`
* G5 â†’ `0.65`

Hinweise:

* Albuminurie-Kategorie (A1/A2/A3) wird in v1.1 **nicht** als Faktor verwendet (nur Anzeige im CKD-Badge).
* Dialyse wird in Auto-Mode **nicht** modelliert (Doctor-Lock empfohlen). (Dialyse-Proteinziele sind je nach Setting oft hÃ¶her.) ([National Kidney Foundation][2])

### 5.5 Protein-Faktor & Zielbereich

1. Vor-CKD:

* `protein_factor_pre_ckd = protein_age_base + activity_modifier`

2. CKD-Anwendung (nur AUTO-Mode):

* `protein_factor_current = protein_factor_pre_ckd * protein_ckd_factor`

3. Range-Logik (v1):

* `maxFactor = protein_factor_current`
* `minFactor = protein_factor_current - 0.1` *(kein fixer Unterrand)*

4. Gramm-Ziele:

* `raw_max_g = round(weight_kg * maxFactor)`
* `raw_min_g = round(weight_kg * minFactor)`

5. Persistieren:

* **AUTO:** schreibe `protein_target_min/raw_min_g` und `protein_target_max/raw_max_g`
* **DOCTOR:** Edge macht nichts; Targets kommen aus Doctor-Feldern (UI setzt `protein_target_* = protein_doctor_*`)

---

## 6. Edge Function Design

### 6.1 Name / Endpoint

* Function: `midas-protein-targets`
* Endpoint: `/functions/v1/midas-protein-targets`

### 6.2 Auth

* Requires user JWT (Bearer)
* Supabase client nutzt Request-Headers â†’ RLS bleibt aktiv.

### 6.3 Request Body (JSON)

```json
{
  "trigger": "body_save" | "manual",
  "weight_kg": 90.0,
  "dayIso": "2025-12-17",
  "force": false
}
```

### 6.4 Processing Steps (deterministisch)

1. Auth prÃ¼fen (`user_id`)
2. Profil laden (`user_profile`) inkl.:

   * `birth_date`
   * `protein_doctor_lock`, `protein_doctor_*`
   * `protein_last_calc_at`, letzte Metadaten
3. **Doctor-Lock Guard (Hard):**

   * wenn `protein_doctor_lock === true` â†’ return `{ ok:true, skipped:true, reason:'doctor_locked' }`
4. Cooldown-Guard (wenn nicht force):

   * wenn `last_calc_at < 7 Tage` und `weight_delta < 1kg` und `ckd_stage` unverÃ¤ndert â†’ skipped
5. Alter berechnen (jahrgenau)
6. `age_base` bestimmen
7. AktivitÃ¤t query (letzte 28d):

   * `health_events` where `type='activity_event'` und `day >= today-27`
   * score = count(events)
8. CKD-Stufe laden:

   * latest `lab_event` (payload.ckd_stage) â†’ `G*`
   * fallback `G1` wenn fehlt
9. Faktoren rechnen (pre_ckd, ckd_factor, current)
10. Targets (min/max) rechnen
11. Profil updaten:

* `protein_target_min`, `protein_target_max`
* alle derived fields + `protein_last_calc_at`

12. Response senden

### 6.5 Response Body (JSON)

```json
{
  "ok": true,
  "skipped": false,
  "reason": null,
  "computed": {
    "age": 43,
    "age_base": 1.0,
    "activity_level": "ACT2",
    "activity_score_28d": 2,
    "window_days": 28,
    "weight_kg": 90.0,
    "ckd_stage_g": "G3a",
    "ckd_factor": 0.9,
    "factor_pre_ckd": 1.2,
    "factor_current": 1.08,
    "target_min": 99,
    "target_max": 108,
    "version": "v1.1"
  }
}
```

---

## 7. Trigger / Integration im Frontend

### 7.1 Body Save Hook (Primary)

Im Body-Save Flow (Capture / Vitals) nach erfolgreichem Save:

* call Edge Function `midas-protein-targets` mit `trigger='body_save'` + `weight_kg`
* bei jedem Body-Save aufrufen
* Cooldown in der Edge verhindert doppelte Runs, falls schnell hintereinander gespeichert wird

Danach:

* Profile Snapshot refresh:

  * `profile.syncProfile({ reason: 'protein-recompute' })`
  * `profile:changed` dispatch
    Assistant reagiert und aktualisiert Header.

### 7.2 Activity Save Hook (v1)

* kein Trigger in v1. Activity-Events werden nur im 28d-Window gezaehlt.

## 8. UI/UX Anpassungen (Eyecandy, aber leise)

### 8.1 Profil Panel

**Sektion â€žProteinâ€œ:**

1. **Checkbox:** â€žDoctor-Lock (Arztwert fix)â€œ
2. **Zwei Felder (nur relevant wenn Lock an):**

   * â€žDoctor Min (g/Tag)â€œ
   * â€žDoctor Max (g/Tag)â€œ
3. **Read-only Eyecandy (nur wenn Lock aus):**

   * â€žAktueller Zielbereich: **minâ€“max g/Tag**â€œ
   * klein darunter: â€žFaktor: X.XX g/kg â€¢ ACT2 â€¢ 28d â€¢ CKD G3a (Ã—0.90)â€œ
4. **Wenn Lock an:**

   * zeige â€žAktueller Zielbereich: **Doctor Minâ€“Max g/Tag**â€œ
   * Auto-Details einklappen oder ausgrauen (â€žAuto-Berechnung pausiertâ€œ)

Profil feuert bei Save `profile:changed`. 

### 8.2 Intake / Pills / Warnungen

Warnlogik & Budget nehmen bevorzugt:

* `protein_target_max` (effektiv)
* fallback: default 110g (wie bisher)

Intake reagiert ohnehin auf `profile:changed`. 

### 8.3 Assistant Context

Butler Header zeigt kÃ¼nftig:

* Auto: â€žProtein 99â€“108 gâ€œ
* Doctor-Lock: â€žProtein (Doctor) 90â€“110 gâ€œ

Assistant-Kontext bezieht Snapshot aus Profil/Intake.

---

## 9. Migration Plan (DB)

### Phase M1: SQL Migration

* Add neue Spalten in `user_profile` (Doctor-Lock + Derived + CKD-Derived)
* Default: `protein_doctor_lock = false`
* Backfill optional:

  * wenn legacy vorhanden: `protein_target_max` initial setzen
  * derived bleiben NULL bis erster Compute

### Phase M2: App Compatibility

* Profile UI ergÃ¤nzt Checkbox + 2 Felder
* Intake/Assistant lesen nur `protein_target_*` (effektiv)

---

## 10. QA / Testcases (DoD)

### Functional

* **Doctor-Lock ON:** Edge Call â†’ `skipped=true, reason=doctor_locked`; Targets bleiben Doctor-Werte.
* **Doctor-Lock OFF:** Body save â†’ Targets werden neu gerechnet und gespeichert.
* **Keine AktivitÃ¤t:** score=0 â†’ `ACT1` â†’ Zielbereich berechenbar.
* **2 Events in 28d:** `ACT2`.
* **â‰¥6 Events:** `ACT3`.
* **CKD-Stufe fehlt:** fallback `G1`, `ckd_factor=1.0`.
* **CKD-Stufe G3a:** `ckd_factor=0.90`, Targets entsprechend gedÃ¤mpft.
* **Cooldown:** 2. Call <7d und Î”Gewicht <1kg und CKD unverÃ¤ndert â†’ skipped.

### UX

* Butler Header aktualisiert sich nach Body-Save/Profile-Save. 
* Lock an/aus ist sofort sichtbar (keine Popups, kein LÃ¤rm).

### Logging/Diag

* Edge logs: `[protein-targets] start | skipped:doctor_locked | computed | write ok/fail`
* Client logs reason tags: `body_save/manual`

---

## 11. Versioning / Future-Proofing

* `protein_calc_version = "v1.1"` speichern
  â†’ erlaubt spÃ¤ter v2 (z.B. feinere AktivitÃ¤tswertung, Albuminurie-Einfluss, Dialyse-Mode *nur* mit Doctor-Freigabe) ohne Chaos.

## 12. Umsetzungsschritte (deterministisch)

1) Datenmodell (SQL) âœ…
   a) `sql/10_User_Profile_Ext.sql` erweitern um:
      - effektive Targets: `protein_target_min`, `protein_target_max` *(bereits vorhanden, beibehalten)*
      - Doctor-Lock: `protein_doctor_lock`, `protein_doctor_min`, `protein_doctor_max`
      - Derived-Felder: `protein_calc_version`, `protein_window_days`, `protein_last_calc_at`,
        `protein_age_base`, `protein_activity_level`, `protein_activity_score_28d`,
        `protein_factor_pre_ckd`, `protein_ckd_stage_g`, `protein_ckd_factor`, `protein_factor_current`
   b) Defaults setzen: `protein_doctor_lock = false`
   c) Migration in Supabase ausfuehren (idempotent, keine Datenverluste)

2) Prereqs verifizieren (bereits vorhanden, aber sicherstellen) âœ…
   a) `sql/13_Activity_Event.sql` deployed (type `activity_event`, RPCs `activity_add/list/delete`)
   b) `sql/11_Lab_Event_Extension.sql` deployed (CKD-Stufe `ckd_stage` im `lab_event`)

3) Edge Function implementieren (Backend) âœ…
   a) Neues Function-Verzeichnis: `C:\Users\steph\Projekte\midas-backend\supabase\functions\midas-protein-targets`
   b) Inputs: `trigger`, `weight_kg`, `dayIso`, `force`
   c) Reads:
      - `user_profile` (birth_date, doctor lock, last_calc, targets)
      - `health_events` count fuer `activity_event` (letzte 28 Tage)
      - latest `lab_event` (payload.ckd_stage)
   d) Writes:
      - `protein_target_min`, `protein_target_max`
      - alle Derived-Felder + `protein_last_calc_at`
   e) Guards:
      - doctor_lock -> skipped
      - cooldown/gewicht/ckd unchanged -> skipped

4) Frontend Trigger (Body Save) âœ…
   a) Neues Modul anlegen: `app/modules/vitals-stack/protein/` (init, API, Edge-call)
   b) In `app/modules/vitals-stack/vitals/body.js` nach erfolgreichem Save das Modul rufen
   c) Bei jedem Body-Save ausloesen
   d) Nach Response `profile.syncProfile({ reason: 'protein-recompute' })` aufrufen

5) Profile UI / State âœ…
   a) Markup in `index.html` (Profil-Panel):
      - Doctor-Lock Toggle
      - Doctor-Min/Max Inputs
      - Read-only Anzeige fuer Auto-Targets
   b) Styles in `app/styles/hub.css` fuer neue Felder (gleicher globaler Input-Style)
   c) `app/modules/profile/index.js`:
      - Select-Query erweitert um neue Felder
      - Save-Payload nimmt Doctor-Lock + Doctor-Min/Max auf
      - Wenn Lock an: `protein_target_min/max` auf Doctor-Werte setzen

6) Intake + Assistant âœ…
   a) `app/modules/hub/index.js` und `app/modules/assistant-stack/assistant/day-plan.js` nutzen `protein_target_min/max`
   b) Fallback bleibt `DEFAULTS.proteinMax` falls Targets fehlen

7) QA / Testcases
   a) Doctor-Lock on/off (skipped vs computed)
   b) Body-Save triggert Berechnung (bei jedem Save)
   c) Activity-Count beeinflusst ACT1/ACT2/ACT3
   d) CKD-Stufe beeinflusst Faktor
   e) Cooldown/Skipped Pfade pruefen

