# Profile Module â€“ Functional Overview

Kurze Einordnung:
- Zweck: zentrale Pflege persÃ¶nlicher Gesundheits- und Kontaktparameter.
- Rolle: Liefert Stammdaten, Limits und Hausarztkontakt an Charts, Intake/Medication, Assistant.
- Abgrenzung: kein Medical Record; keine Mehrarztverwaltung, keine externen Benachrichtigungen.

---

## 1. Zielsetzung

- Patient:innen pflegen Name, Geburtsdatum, GrÃ¶ÃŸe, Medikation, Limits sowie einen Hausarztkontakt einmalig.
- System nutzt die Daten fÃ¼r BMI/WHtR, Salz-/Proteinwarnungen und Mail-Shortcuts bei Low Stock.
- Nichtziel: Mehrere Ã„rzt:innen, strukturierte Medikationsdatenbank oder Arztzugriff auf Profile.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/profile/index.js` | UI-Bindung, Supabase Sync/Upsert, `profile:changed` Event |
| `app/modules/profile/*` | (derzeit leer) â€“ Erweiterungspotenzial fÃ¼r Helpers |
| `app/modules/hub/index.js` | Ã–ffnet Panel via Orbit, konsumiert Snapshot im Assistant |
| `app/modules/medication/index.js` | Liefert Tagesliste (`loadMedicationForDay`) fÃ¼r das Profil-Snapshot |
| `app/styles/hub.css` | Formular-/Card-Styling |
| `sql/10_User_Profile_Ext.sql` | Tabelle + Spalten (inkl. Hausarztfelder) |
| `docs/modules/Profile Module Overview.md` | Diese Referenz |
| `docs/QA_CHECKS.md` | CRUD & Event TestfÃ¤lle |

---

## 3. Datenmodell / Storage

- Tabelle `public.user_profile` (`user_id` PK/FK `auth.users`).
- Spalten: `full_name`, `birth_date`, `height_cm`, `medications` (jsonb/array), `is_smoker`, `lifestyle_note`, `salt_limit_g`, `protein_target_min/max`, `primary_doctor_name`, `primary_doctor_email`, `updated_at`.
- Constraints: Height Check (120â€“230 cm), `updated_at` Trigger (`set_user_profile_updated_at`).
- RLS: select/insert/update/delete nur fÃ¼r `auth.uid()`.
- Keine Soft Deletes; Upsert ersetzt Datensatz.

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- Modul lÃ¤dt beim DOM Ready; `initProfileModule` ruft `init()`.
- `ensureRefs()` cached Formelemente.
- Wartet auf `supabase:ready`, dann `syncProfile({ reason: 'init' })`.

### 4.2 User-Trigger
- Buttons `profileSaveBtn`, `profileRefreshBtn`.
- InputÃ¤nderungen bleiben lokal bis Save.

### 4.3 Verarbeitung
- `extractFormPayload()` trimmt Strings, parst Zahlen (+1 Stelle fÃ¼r Salz), splittet Medikation per Zeile (wird durch Snapshot Ã¼berschrieben, bleibt aber kompatibel).
- `profileDoctorEmail` nutzt native HTML5 Validation; `form.reportValidity()` blockt Save bei ungÃ¼ltiger Mail.
- CKD-Abzeichen kommt aus `loadLatestLabSnapshot()` (falls vorhanden) und bleibt read-only.
- Medikamenten-Snapshot: `AppModules.medication.loadMedicationForDay(today)` liefert aktive Medikamente, wird formatiert (`- Name (StÃ¤rke, Dose/Tag, Tage Ã¼brig)`) und read-only angezeigt.

### 4.4 Persistenz
- Save: `supabase.from('user_profile').upsert({ ...payload, user_id }, { onConflict: 'user_id' })`.
- Select: `.maybeSingle()`; `null` wenn kein Datensatz existiert.
- Nach erfolgreichem Save/Sync wird State aktualisiert, Overview gerendert, `profile:changed` gefeuert.
- Der Medikamenten-Snapshot wird **nicht** separat gespeichert (Quelle bleibt das Medication-Modul); Profil speichert lediglich den abgeleiteten Text fÃ¼r Historikzwecke.

---

## 5. UI-Integration

- Panel `#hubProfilePanel` im Hub (Orbit Nord-West).
- Formularfelder:
  - `profileFullName`, `profileBirthDate`, `profileHeight` (Input).
  - `profileCkdBadge` (readonly, befÃ¼llt durch Lab-Snapshot).
  - `profileMedications` (Textarea, read-only). Zeigt den aktiven Medikamentensatz aus dem TAB-Modul; Hinweis verweist auf Verwaltung im TAB.
  - `profileDoctorName` / `profileDoctorEmail` (Hausarztkontakt).
  - Limits: `profileSaltLimit`, `profileProteinMax`, Raucherstatus-Dropdown, Lifestyle-Textarea.
- Buttons `profileSaveBtn` / `profileRefreshBtn`.
- Card â€žAktuelle Datenâ€œ (`#profileOverview`) rendert Snapshot (inkl. Medikamentenliste, CKD-Stufe, Zeitstempel).

---

## 6. Arzt-Ansicht / Read-Only Views

- Keine separate ArztoberflÃ¤che.
- Downstream-Module (z.â€¯B. Intake/Medication) lesen Hausarztname/E-Mail, um Mailto-Links fÃ¼r Low-Stock darzustellen.
- CKD-Abzeichen ist read-only; dient zur Information im Patient:innen-Panel.

---

## 7. Fehler- & Diagnoseverhalten

- Save-/Sync-Fehler loggen `[profile] save failed` bzw. `[profile] sync failed`.
- Toaster/Overlay: Formular wird disabled, `setFormDisabled(true)` verhindert doppelte Requests.
- Fehlender Supabase-Client â†’ `Supabase-Konfiguration fehlt` Fehler.
- Ohne Profil-Datensatz zeigt Overview â€žNoch keine Daten gespeichertâ€œ.

---

## 8. Events & Integration Points

- Public API / Entry Points: `AppModules.profile.syncProfile`, `profileSaveBtn`/`profileRefreshBtn`.
- Source of Truth: `user_profile` + Lab snapshot + Medication snapshot.
- Side Effects: emits `profile:changed`, updates Assistant/Charts/Medication.
- Constraints: `user_id` RLS, height range, email validity.
- `profile:changed` (CustomEvent) mit `detail.data` Snapshot. Wird nach Save/Sync dispatcht.
- Konsumenten:
  - Charts (BMI/WHtR Recompute, Pill Updates).
  - Assistant (Persona-Kontext, Limits).
  - Medication Low-Stock (Mailkontakt + Mailto-Body).
- Module hÃ¶ren auf `document.addEventListener('profile:changed', handler)`.

---

## 9. Erweiterungspunkte / Zukunft

- ZusÃ¤tzliche Felder (Blutdruckziel, Allergien) mÃ¶glich â€“ SQL + Form erweitern.
- Validierung: serverseitige Constraints (z.â€¯B. Email check) denkbar.
- Snapshot-Caching/Offline-Fallback steht noch aus.

---

## 10. Feature-Flags / Konfiguration

- Keine Flags; Modul immer aktiv sobald Hub geladen.
- Debug: Diag Logs via `diag.add`.

---

## 11. Status / Dependencies / Risks

- Status: aktiv.
- Dependencies (hard): `user_profile` Tabelle, Supabase Client, Medication-Snapshot, Lab-Snapshot.
- Dependencies (soft): Assistant Kontext.
- Known issues / risks: stale Snapshots; leeres Profil => leere UI; ungueltige Mail blockt Save.
- Backend / SQL / Edge: `sql/10_User_Profile_Ext.sql`.

---

## 12. QA-Checkliste

- Save & Refresh mit/ohne vorhandenes Profil.
- HTML5-Mailvalidierung schlÃ¤gt korrekt an.
- `profile:changed` feuert nach Save; Charts/Assistant reagieren.
- Low-Stock Box aktualisiert Arztkontakt nach Profil-Update.
- Fehlerpfad: Supabase offline â†’ Formular reaktiviert, Logeintrag gesetzt.

---

## 13. Definition of Done

- Profilpanel lÃ¤dt ohne Fehler, Inputs lesen/schreiben Supabase-Daten.
- Keine offenen `diag`-Errors nach Save/Refresh.
- Hausarztkontakt erscheint im Low-Stock-Modul.
- Dokumentation (Overview, SQL, QA) aktuell; QA-Checkliste grÃ¼n.

