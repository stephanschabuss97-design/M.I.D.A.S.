# Profile Module - Functional Overview

Kurze Einordnung:
- Zweck: zentrale Pflege persoenlicher Gesundheits- und Kontaktparameter.
- Rolle: liefert Stammdaten, Limits, Hausarztkontakt, read-only Medication-Snapshot und vorerst intern das technische Push-Backend fuer Subscription/Routing.
- Abgrenzung: kein Medical Record, keine Mehrarztverwaltung, keine eigene Notification-Engine.

Related docs:
- [Bootflow Overview](bootflow overview.md)
- [Touchlog Module Overview](Touchlog Module Overview.md)
- [Push Module Overview](Push Module Overview.md)

---

## 1. Zielsetzung

- Nutzer pflegen Name, Geburtsdatum, Groesse, Limits und einen Hausarztkontakt einmalig.
- System nutzt die Daten fuer BMI/WHtR, Salz-/Proteinwarnungen und Mail-Shortcuts bei Low-Stock.
- Nicht-Ziel: mehrere Aerzte, strukturierte Medikationsdatenbank oder Arztzugriff auf Profile.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/profile/index.js` | UI-Bindung, Supabase Sync/Upsert, `profile:changed` Event |
| `app/modules/push/index.js` | bevorzugte Push-Service-Grenze fuer neue Konsumenten, delegiert temporaer an Profile |
| `app/modules/hub/index.js` | oeffnet Panel via Orbit, konsumiert Snapshot im Assistant |
| `app/modules/intake-stack/medication/index.js` | liefert Tagesliste (`loadMedicationForDay`) fuer den Medication-Snapshot |
| `app/styles/hub.css` | Formular- und Card-Styling |
| `sql/10_User_Profile_Ext.sql` | Tabelle plus Spalten inklusive Hausarztfelder |
| `sql/15_Push_Subscriptions.sql` | Push-Subscriptions, Remote-Health und Delivery-State |
| `docs/QA_CHECKS.md` | CRUD- und Event-Testfaelle |

---

## 3. Datenmodell / Storage

- Tabelle `public.user_profile` (`user_id` als PK/FK auf `auth.users`).
- Spalten: `full_name`, `birth_date`, `height_cm`, `medications`, `is_smoker`, `lifestyle_note`, `salt_limit_g`, `protein_target_min/max`, `primary_doctor_name`, `primary_doctor_email`, `updated_at`.
- Constraints: Height-Check, `updated_at` Trigger.
- RLS: select/insert/update/delete nur fuer `auth.uid()`.
- Keine Soft Deletes; Upsert ersetzt den Datensatz.

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- Modul laedt beim DOM Ready.
- `ensureRefs()` cached Formelemente.
- Wartet auf `supabase:ready`, dann `syncProfile({ reason: 'init' })`.
- Initialisiert intern auch den Push-Routing-Status fuer Browser-Subscription und Remote-Health.
- Stellt Push-Subscription-Upsert und Remote-Health noch technisch bereit, wird aber fuer neue Konsumenten ueber `AppModules.push` gekapselt.

### 4.2 User-Trigger
- Buttons `profileSaveBtn`, `profileRefreshBtn`.
- Input-Aenderungen bleiben lokal bis Save.

### 4.3 Verarbeitung
- `extractFormPayload()` trimmt Strings, parst Zahlen und splittet Legacy-Medikationstext nur noch kompatibel mit.
- `profileDoctorEmail` nutzt native HTML5-Validation.
- CKD-Abzeichen kommt aus `loadLatestLabSnapshot()` und bleibt read-only.
- Medication-Snapshot: `AppModules.medication.loadMedicationForDay(today)` liefert aktive Medikamente und wird als lesbare Plan-Zusammenfassung gerendert.
- Interner Push-Routing-Status:
  - liest die aktuelle Browser-Subscription
  - gleicht sie mit `push_subscriptions` ab
  - bewertet `remote gesund` nur bei nachgewiesen erfolgreicher Remote-Zustellung ohne spaeteren Failure
  - behandelt `Backend-Subscription vorhanden, aber noch kein echter Push faellig` als neutralen Bereit-Zustand
  - liest sichere Kontext-/Diagnosefelder wie `endpoint_hash`, `client_context`, `client_display_mode`, `client_platform`, `client_browser`, `client_label` und `last_diagnostic_*`
  - nutzt `last_diagnostic_*` nicht fuer lokale medizinische Suppression

### 4.4 Persistenz
- Save: `supabase.from('user_profile').upsert({ ...payload, user_id }, { onConflict: 'user_id' })`.
- Select: `.maybeSingle()`.
- Nach erfolgreichem Save/Sync wird State aktualisiert, Overview gerendert und `profile:changed` gefeuert.
- Der Medication-Snapshot wird nicht separat gespeichert; Quelle bleibt das Medication-Modul.
- Push-Opt-in/-Opt-out wird sichtbar ueber den Touchlog ausgeloest und nutzt intern weiter die bestehende Profile-Push-API.
- Push-Opt-in/-Opt-out wird sichtbar ueber den Touchlog ausgeloest und laeuft fuer UI-Konsumenten ueber `AppModules.push`.

---

## 5. UI-Integration

- Panel `#hubProfilePanel` im Hub.
- Formularfelder:
  - `profileFullName`, `profileBirthDate`, `profileHeight`
  - `profileCkdBadge` (read-only aus Lab-Snapshot)
  - `profileMedications` (Textarea, read-only)
  - `profileDoctorName`, `profileDoctorEmail`
  - Limits und Lifestyle-Felder
- Medication-Snapshot zeigt aktive Medikamente mit lesbarer Plan-Zusammenfassung aus `slots[]`, optional `mit Mahlzeit` und Restbestand.
- Keine sichtbare Push-Section im Profil.
- Keine Push-Buttons im Profil.
- Kein Profil-Push-Kurzstatus und keine Push-Health-Details im Profil.
- Sichtbare Push-Wartung gehoert in den Touchlog.
- Keine Dev-Toggles im Profil.

---

## 6. Arzt-Ansicht / Read-Only Views

- Keine separate Arztoberflaeche.
- Downstream-Module lesen Hausarztname/E-Mail fuer Mailto-Links bei Low-Stock.
- CKD-Abzeichen und Medication-Snapshot sind read-only.

---

## 7. Fehler- & Diagnoseverhalten

- Save-/Sync-Fehler loggen `[profile] save failed` bzw. `[profile] sync failed`.
- Push-Fehler loggen `[profile] push enable failed`, `[profile] push disable failed` oder einen ausgelassenen Health-Refresh.
- Push-Health-Texte werden sichtbar im Touchlog gerendert und duerfen `noch keine echte Zustellung` nicht als Fehler darstellen.
- Lokale Push-Suppression bleibt nur erlaubt, wenn `remoteHealthy` wahr ist.
- `remoteHealthy` darf nur aus echten Remote-Health-Feldern entstehen:
  - `last_remote_success_at`
  - `last_remote_failure_at`
  - `disabled`
  - `consecutive_remote_failures`
- Technische Diagnosefelder (`last_diagnostic_*`) duerfen den medizinischen Suppression-Vertrag nicht freischalten.
- Formular wird waehrend Requests disabled.
- Fehlender Supabase-Client fuehrt zu einem klaren Fehler.
- Ohne Profil-Datensatz zeigt die Overview einen leeren Initialzustand.

---

## 8. Events & Integration Points

- Public API / Entry Points: `AppModules.profile.sync`, `AppModules.profile.refreshPushStatus`, `AppModules.profile.getPushRoutingStatus`, `AppModules.profile.enablePush`, `AppModules.profile.disablePush`, `profileSaveBtn`, `profileRefreshBtn`.
- Neuer Push-Konsum soll bevorzugt ueber `AppModules.push` laufen; direkte neue Profile-Push-Abhaengigkeiten sind nur als temporaere Delegation zulaessig.
- Source of Truth: `user_profile`, `push_subscriptions`, Lab-Snapshot und Medication-Snapshot.
- Side Effects: `profile:changed`, Updates fuer Assistant, Charts, Medication-Low-Stock und lokale Push-Suppression.
- Konsumenten:
  - Charts
  - Assistant
  - Medication Low-Stock / Mailto
  - Touchlog Push-Wartung
  - Incident-Engine fuer lokale Push-Suppression

---

## 9. Erweiterungspunkte / Zukunft

- Zusaetzliche Felder wie Blutdruckziel oder Allergien.
- Staerker serverseitige Validation.
- Snapshot-Caching und Offline-Fallback.
- Spaetere vollstaendige Migration der internen Push-API in ein eigenes Push-Service-Modul, damit Profile wieder rein Stammdaten-/Kontextmodul wird.

---

## 10. Feature-Flags / Konfiguration

- Keine Flags; Modul immer aktiv sobald der Hub geladen wird.
- Debug ueber `diag.add`.

---

## 11. Status / Dependencies / Risks

- Status: aktiv.
- Dependencies (hard): `user_profile`, Supabase Client, Medication-Snapshot, Lab-Snapshot.
- Dependencies (soft): Assistant-Kontext.
- Known issues / risks: stale Snapshots, leeres Profil, ungueltige Mail blockt Save, Remote-Health muss zuerst erfolgreich belegt werden bevor lokal unterdrueckt werden darf.
- Die interne Push-API liegt vorerst weiterhin im Profil-Modul; sichtbar ist Push aber ausschliesslich im Touchlog und neue Konsumenten sollen `AppModules.push` nutzen.
- Known issue: Touchlog-Health kann bei mehreren/alten Subscriptions temporaer `Health-Check offen` anzeigen, obwohl der Push-Transport funktioniert. Das ist ein Maintenance-/Mapping-Restpunkt, kein Profil-Fachproblem.
- Backend / SQL / Edge: `sql/10_User_Profile_Ext.sql`, `sql/15_Push_Subscriptions.sql`.

---

## 12. QA-Checkliste

- Save und Refresh mit und ohne vorhandenes Profil.
- HTML5-Mailvalidierung schlaegt korrekt an.
- `profile:changed` feuert nach Save; Charts und Assistant reagieren.
- Low-Stock Box aktualisiert Arztkontakt nach Profil-Update.
- Medication-Snapshot zeigt `1x` und `>1x` Medikation mit lesbarer Plan-Zusammenfassung.
- Profil zeigt keine sichtbare Push-Section, keine Push-Buttons und keinen Push-Kurzstatus.
- Interner Push-Routing-Status unterscheidet weiterhin:
  - kein Browser-Abo
  - Backend-Subscription vorhanden, aber noch keine echte faellige Zustellung
  - echter Remote-Failure
  - gesunder Remote-Pfad
- Diagnose-Health (`last_diagnostic_*`) wird angezeigt, aber nicht als `remoteHealthy` gewertet.
- Lokale Suppression bleibt bei `bereit (wartet auf erste Erinnerung)` aus.

---

## 13. Definition of Done

- Profilpanel laedt ohne Fehler; Inputs lesen und schreiben Supabase-Daten.
- Keine offenen `diag`-Errors nach Save oder Refresh.
- Hausarztkontakt erscheint im Low-Stock-Modul.
- Dokumentation, SQL und QA sind aktuell.
