# Profile Module – Functional Overview

Kurze Einordnung:
- Zweck: zentrale Pflege persönlicher Gesundheits- und Kontaktparameter.
- Rolle: Liefert Stammdaten, Limits und Hausarztkontakt an Charts, Intake/Medication, Assistant.
- Abgrenzung: kein Medical Record; keine Mehrarztverwaltung, keine externen Benachrichtigungen.

---

## 1. Zielsetzung

- Patient:innen pflegen Name, Geburtsdatum, Größe, Medikation, Limits sowie einen Hausarztkontakt einmalig.
- System nutzt die Daten für BMI/WHtR, Salz-/Proteinwarnungen und Mail-Shortcuts bei Low Stock.
- Nichtziel: Mehrere Ärzt:innen, strukturierte Medikationsdatenbank oder Arztzugriff auf Profile.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/profile/index.js` | UI-Bindung, Supabase Sync/Upsert, `profile:changed` Event |
| `app/modules/profile/*` | (derzeit leer) – Erweiterungspotenzial für Helpers |
| `app/modules/hub/index.js` | Öffnet Panel via Orbit, konsumiert Snapshot im Assistant |
| `app/modules/medication/index.js` | Liefert Tagesliste (`loadMedicationForDay`) für das Profil-Snapshot |
| `app/styles/hub.css` | Formular-/Card-Styling |
| `sql/10_User_Profile_Ext.sql` | Tabelle + Spalten (inkl. Hausarztfelder) |
| `docs/modules/Profile Module Overview.md` | Diese Referenz |
| `docs/QA_CHECKS.md` | CRUD & Event Testfälle |

---

## 3. Datenmodell / Storage

- Tabelle `public.user_profile` (`user_id` PK/FK `auth.users`).
- Spalten: `full_name`, `birth_date`, `height_cm`, `medications` (jsonb/array), `is_smoker`, `lifestyle_note`, `salt_limit_g`, `protein_target_min/max`, `primary_doctor_name`, `primary_doctor_email`, `updated_at`.
- Constraints: Height Check (120–230 cm), `updated_at` Trigger (`set_user_profile_updated_at`).
- RLS: select/insert/update/delete nur für `auth.uid()`.
- Keine Soft Deletes; Upsert ersetzt Datensatz.

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- Modul lädt beim DOM Ready; `initProfileModule` ruft `init()`.
- `ensureRefs()` cached Formelemente.
- Wartet auf `supabase:ready`, dann `syncProfile({ reason: 'init' })`.

### 4.2 User-Trigger
- Buttons `profileSaveBtn`, `profileRefreshBtn`.
- Inputänderungen bleiben lokal bis Save.

### 4.3 Verarbeitung
- `extractFormPayload()` trimmt Strings, parst Zahlen (+1 Stelle für Salz), splittet Medikation per Zeile (wird durch Snapshot überschrieben, bleibt aber kompatibel).
- `profileDoctorEmail` nutzt native HTML5 Validation; `form.reportValidity()` blockt Save bei ungültiger Mail.
- CKD-Abzeichen kommt aus `loadLatestLabSnapshot()` (falls vorhanden) und bleibt read-only.
- Medikamenten-Snapshot: `AppModules.medication.loadMedicationForDay(today)` liefert aktive Medikamente, wird formatiert (`- Name (Stärke, Dose/Tag, Tage übrig)`) und read-only angezeigt.

### 4.4 Persistenz
- Save: `supabase.from('user_profile').upsert({ ...payload, user_id }, { onConflict: 'user_id' })`.
- Select: `.maybeSingle()`; `null` wenn kein Datensatz existiert.
- Nach erfolgreichem Save/Sync wird State aktualisiert, Overview gerendert, `profile:changed` gefeuert.
- Der Medikamenten-Snapshot wird **nicht** separat gespeichert (Quelle bleibt das Medication-Modul); Profil speichert lediglich den abgeleiteten Text für Historikzwecke.

---

## 5. UI-Integration

- Panel `#hubProfilePanel` im Hub (Orbit Nord-West).
- Formularfelder:
  - `profileFullName`, `profileBirthDate`, `profileHeight` (Input).
  - `profileCkdBadge` (readonly, befüllt durch Lab-Snapshot).
  - `profileMedications` (Textarea, read-only). Zeigt den aktiven Medikamentensatz aus dem TAB-Modul; Hinweis verweist auf Verwaltung im TAB.
  - `profileDoctorName` / `profileDoctorEmail` (Hausarztkontakt).
  - Limits: `profileSaltLimit`, `profileProteinMax`, Raucherstatus-Dropdown, Lifestyle-Textarea.
- Buttons `profileSaveBtn` / `profileRefreshBtn`.
- Card „Aktuelle Daten“ (`#profileOverview`) rendert Snapshot (inkl. Medikamentenliste, CKD-Stufe, Zeitstempel).

---

## 6. Arzt-Ansicht / Read-Only Views

- Keine separate Arztoberfläche.
- Downstream-Module (z. B. Intake/Medication) lesen Hausarztname/E-Mail, um Mailto-Links für Low-Stock darzustellen.
- CKD-Abzeichen ist read-only; dient zur Information im Patient:innen-Panel.

---

## 7. Fehler- & Diagnoseverhalten

- Save-/Sync-Fehler loggen `[profile] save failed` bzw. `[profile] sync failed`.
- Toaster/Overlay: Formular wird disabled, `setFormDisabled(true)` verhindert doppelte Requests.
- Fehlender Supabase-Client → `Supabase-Konfiguration fehlt` Fehler.
- Ohne Profil-Datensatz zeigt Overview „Noch keine Daten gespeichert“.

---

## 8. Events & Integration Points

- `profile:changed` (CustomEvent) mit `detail.data` Snapshot. Wird nach Save/Sync dispatcht.
- Konsumenten:
  - Charts (BMI/WHtR Recompute, Pill Updates).
  - Assistant (Persona-Kontext, Limits).
  - Medication Low-Stock (Mailkontakt + Mailto-Body).
- Module hören auf `document.addEventListener('profile:changed', handler)`.

---

## 9. Erweiterungspunkte / Zukunft

- Zusätzliche Felder (Blutdruckziel, Allergien) möglich – SQL + Form erweitern.
- Validierung: serverseitige Constraints (z. B. Email check) denkbar.
- Snapshot-Caching/Offline-Fallback steht noch aus.

---

## 10. Feature-Flags / Konfiguration

- Keine Flags; Modul immer aktiv sobald Hub geladen.
- Debug: Diag Logs via `diag.add`.

---

## 11. QA-Checkliste

- Save & Refresh mit/ohne vorhandenes Profil.
- HTML5-Mailvalidierung schlägt korrekt an.
- `profile:changed` feuert nach Save; Charts/Assistant reagieren.
- Low-Stock Box aktualisiert Arztkontakt nach Profil-Update.
- Fehlerpfad: Supabase offline → Formular reaktiviert, Logeintrag gesetzt.

---

## 12. Definition of Done

- Profilpanel lädt ohne Fehler, Inputs lesen/schreiben Supabase-Daten.
- Keine offenen `diag`-Errors nach Save/Refresh.
- Hausarztkontakt erscheint im Low-Stock-Modul.
- Dokumentation (Overview, SQL, QA) aktuell; QA-Checkliste grün.
