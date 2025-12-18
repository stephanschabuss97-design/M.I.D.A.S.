# Medication Management Module Spec  
**Final Spec & Roadmap**

Dieses Dokument beschreibt das **finale, vollständige Spec Sheet** für das Medication-Management-Modul in MIDAS.  
Der Fokus liegt ausschließlich auf dem Modul selbst: Ziel, Scope, UI, Datenmodell, Logik, APIs, Integration und Roadmap.  

Kein Meta, keine Alternativen, keine Hypothesen.

---

## 1. Zielsetzung

- **Minimaler Daily Flow:** Einnahme mit einem Klick bestätigen (2–3 Sekunden).
- **Automatisches Bestandsmanagement:** Jede bestätigte Einnahme reduziert den Bestand.
- **Leise Warnlogik:** Hinweise nur, wenn der Bestand kritisch wird.
- **Sicher & deterministisch:** Schutz vor Doppel-Einnahme.
- **Zukunftsfähig:** Medikamente können vollständig **in der App** angelegt, geändert oder entfernt werden – **keine Codeänderungen** nötig.
- **Geräteübergreifend:** Vollständig Supabase-basiert.
- **Saubere Trennung:** Kontaktinformationen liegen im User-Profil, nicht im Medication-Modul.

---

## 2. Scope

### In Scope
- Sub-Tabs **IN / TAB** im Intake-Panel
- Dynamische Medikamentenverwaltung (CRUD)
- Tagesbestätigung pro Medikament
- Automatische Bestandsreduktion
- Bestandskorrektur & Restock
- Low-Stock-Warnung mit Acknowledge
- Mail-Shortcut (`mailto:`) über im User-Profil hinterlegte Arzt-E-Mail

### Out of Scope
- OS-Wecker / Systemalarme
- Push Notifications
- Externe Arzt-Bearbeitung von Daten
- Automatischer Versand von E-Mails

---

## 3. UI / UX – Intake Panel

### 3.1 Sub-Tabs
- `IN` → tägliche Einnahme & Übersicht
- `TAB` → Medikamentenverwaltung

---

### 3.2 IN-Tab (Daily Use)

#### A) Medication Toggles
- Pro aktivem Medikament **ein Toggle**
- Zustände:
  - **OFF:** Einnahme heute noch nicht bestätigt
  - **ON (locked):** Einnahme bestätigt, Zeitstempel sichtbar
- Klicklogik:
  - OFF → bestätigt Einnahme
  - ON → Dialog:
    - Text: „Heute bereits bestätigt um HH:MM“
    - Aktionen:
      - `Abbrechen`
      - `Rückgängig` (Undo)

#### B) Low-Stock MessageBox
- Sichtbar nur bei `days_left <= low_stock_threshold`
- Inhalt:
  - Medikamentenname
  - Resttage
  - Voraussichtliches Aufbrauchdatum
- Aktionen:
  - `Mail an hinterlegten Arzt vorbereiten`
  - `Erledigt` (Acknowledge für aktuellen Tag)

**Mail-Quelle:**  
- Die Zieladresse wird **read-only** aus dem **User-Profil** geladen (`primary_doctor_email`).

#### C) Safety-Hinweis
- Wenn für den Vortag keine Einnahme bestätigt wurde:
  - Non-blocking Hinweis
  - Aktion: `Zu gestern wechseln`

---

### 3.3 TAB-Tab (Verwaltung)

#### A) Create / Edit Form
- Name (Pflicht)
- Wirkstoff (optional)
- Stärke (optional)
- Dosis pro Tag (Default: 1)
- Aktueller Bestand
- Low-Stock-Threshold (Tage, Default: 7)
- Beipackzettel-Link (optional)
- Aktiv / Inaktiv
- Buttons:
  - `Speichern`
  - `+28`
  - `+56`
  - `+Custom`

**Hinweis:**  
Low-Stock-Mails verwenden die im **User-Profil** hinterlegte Arzt-E-Mail.

---

#### B) Medikamenten-Karten
- Anzeige:
  - Name
  - Wirkstoff / Stärke
  - Bestand
  - Resttage
  - Aufbrauchdatum
- Aktionen:
  - Einnahme bestätigen / Undo (für aktuellen Tag)
  - Restock
  - Bestand setzen
  - Archivieren
  - Löschen (Danger)

---

## 4. Datenmodell (Supabase)

### 4.1 Tabelle `health_medications`
- `id uuid PK`
- `user_id uuid`
- `name text`
- `ingredient text`
- `strength text`
- `leaflet_url text`
- `dose_per_day int DEFAULT 1`
- `stock_count int`
- `low_stock_days int DEFAULT 7`
- `active boolean`
- `low_stock_ack_day date`
- `low_stock_ack_stock int`
- `created_at timestamptz`
- `updated_at timestamptz`

---

### 4.2 Tabelle `health_medication_doses`
- `id uuid PK`
- `user_id uuid`
- `med_id uuid FK`
- `day date`
- `qty int`
- `taken_at timestamptz`

**Unique Constraint:**  
`(user_id, med_id, day)`  
→ verhindert Doppel-Einnahme

---

### 4.3 Optional: `health_medication_stock_log`
- `id uuid`
- `med_id uuid`
- `delta int`
- `reason text`
- `created_at timestamptz`

---

## 5. User-Profil (Abhängigkeit)

### Relevante Felder
- `primary_doctor_name`
- `primary_doctor_email`

**Verwendung:**  
- Read-only Zugriff durch Medication-Modul
- Zieladresse für `mailto:` bei Low-Stock-Warnungen

---

## 6. Security / RLS

- Zugriff ausschließlich auf `auth.uid()`
- Alle RPCs arbeiten **ohne user_id Parameter**
- Owner-basierte Policies auf allen Tabellen

---

## 7. RPC Contracts

### `med_list(day date)`
Liefert:
- Medikamentenliste
- Einnahmestatus für `day`
- `days_left`
- `runout_day`
- `low_stock`

---

### `med_upsert(...)`
- Create / Update Medikament

---

### `med_confirm_dose(med_id, day)`
- Insert Dose
- Bestand −1
- Atomic

---

### `med_undo_dose(med_id, day)`
- Entfernt Einnahme
- Bestand +1

---

### `med_adjust_stock(med_id, delta)`
- Restock / Korrektur

---

### `med_set_stock(med_id, new_stock)`
- Absolutes Setzen

---

### `med_ack_low_stock(med_id, day, stock_snapshot)`
- Acknowledge Low-Stock-Warnung

---

## 8. Client-Modul

**Pfad:**  
`app/modules/medication/index.js`

### Exports
- `loadMedicationForDay(day)`
- `confirmMedication(medId, day)`
- `undoMedication(medId, day)`
- `upsertMedication(data)`
- `adjustStock(medId, delta)`
- `setStock(medId, stock)`
- `ackLowStock(medId, day, stock)`

**Events**
- `medication:changed`

---

## 9. Kernlogik

### Days-Left Berechnung
days_left = floor(stock_count / dose_per_day)

markdown
Code kopieren

### Runout-Datum
- Heute bestätigt → `today + days_left − 1`
- Heute nicht bestätigt → `today + days_left`

### Low-Stock Trigger
- `days_left <= low_stock_days`
- Anzeige nur, wenn nicht für Tag + Bestand acknowledged

---

## 10. Fehlerverhalten

- RPC-Fehler → UI unverändert
- Toast + Diagnostics-Log
- Kein Silent-Fail

---

## 11. Roadmap / Phasen

### Phase 0 – SQL
- Tabellen
- RPCs
- RLS
- Supabase-Tests

### Phase 1 – Modul Scaffold
- `app/modules/medication/index.js`
- Read-Path (`med_list`)

### Phase 2 – IN-Tab
- Sub-Tabs
- Toggles
- Confirm / Undo

### Phase 3 – TAB-Tab
- CRUD UI
- Restock
- Korrekturen

### Phase 4 – Alerts
- Low-Stock MessageBox
- Ack-Flow
- Safety-Hinweise

### Phase 5 – QA & Docs
- Module Overview
- QA-Checkliste
- Edge-Cases

---

## 12. QA-Checkliste (Auszug)

- Neue Med → Toggle erscheint sofort
- Bestätigung → Bestand −1
- Doppel-Klick → blockiert
- Undo → Bestand +1
- Low-Stock → Warnbox
- Ack → Warnung bleibt weg
- Restock → Warnung verschwindet

---

## 13. Dateien

### New
- `app/modules/medication/index.js`
- `sql/09_Medication.sql`
- `docs/modules/Medication Module Overview.md`

### Modified
- `app/modules/capture/index.js`
- optional Styles

---

**End of Spec**