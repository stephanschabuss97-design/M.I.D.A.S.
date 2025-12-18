# Profile Module – Contact Extension Spec  
**Primary Doctor Contact (Final Spec)**

Dieses Dokument beschreibt die **deterministische Erweiterung** des bestehenden Profile-Moduls um **primäre Arzt-Kontaktinformationen**.  
Ziel ist die Bereitstellung einer **zentralen, read-only nutzbaren Kontaktadresse** für andere Module (z. B. Medication Management).

Kein Meta, keine Alternativen, keine Diskussion.

---

## 1. Zielsetzung

- **Single Source of Truth** für primäre ärztliche Kontaktinformationen.
- **Read-only Nutzung** durch andere Module (z. B. Medication Manager).
- **Kein eigenes Arzt-Register**, sondern bewusst minimal.
- **Saubere Entkopplung**: Profile hält Beziehungen, Fachmodule reagieren auf Bedarf.
- **Geräteübergreifend & Supabase-basiert**.

---

## 2. Scope

### In Scope
- Pflege eines **Hausarztes** im User-Profil
- Speicherung von:
  - Arztname (frei)
  - Arzt-E-Mail (Pflichtfeld)
- Bereitstellung per Profil-Snapshot
- Event-basierte Aktualisierung (`profile:changed`)

### Out of Scope
- Mehrere Ärzte
- Rollen / Priorisierung
- Live-Zugriff für Ärzte
- Automatischer Mailversand
- Validierung medizinischer Zuständigkeit

---

## 3. UI / UX – Profile Panel

### 3.1 Positionierung

- Erweiterung des bestehenden **Profil-Formulars**
- Neuer Abschnitt: **„Primary Doctor“**
- Platzierung:
  - Unter Stammdaten
  - Vor Lifestyle / Notizen

---

### 3.2 Formularfelder

#### A) Primary Doctor
- **Doctor Name**
  - Input (Text)
  - Optional
- **Doctor E-Mail**
  - Input (E-Mail)
  - Pflichtfeld, wenn genutzt
  - HTML5 `type="email"` Validierung

#### B) Hinweise
- Kurzer Infotext:
  > „Diese E-Mail-Adresse wird für manuelle Kontaktaktionen (z. B. Medikamenten-Nachbestellung) verwendet.“

---

### 3.3 Buttons

- Bestehende Buttons:
  - `profileSaveBtn`
  - `profileRefreshBtn`
- Kein zusätzlicher Button notwendig

---

## 4. Datenmodell (Supabase)

### 4.1 Tabelle `user_profile` (Erweiterung)

Neue Spalten:
- `primary_doctor_name text`
- `primary_doctor_email text`

**Eigenschaften:**
- Nullable
- Keine Foreign Keys
- Keine Validierungslogik auf DB-Ebene (Frontend validiert)

---

## 5. Data Flow & Events

### 5.1 Save Flow

1. User klickt `Speichern`
2. `saveProfile()`:
   - validiert E-Mail-Feld (wenn befüllt)
   - inkludiert Arztfelder im Upsert-Payload
3. `supabase.from('user_profile').upsert(...)`
4. Erfolg:
   - Toast
   - Overview-Refresh
   - `profile:changed` Event mit aktualisiertem Snapshot

---

### 5.2 Read Flow (Consumers)

- Andere Module (z. B. Medication):
  - greifen **read-only** auf Profil-Snapshot zu
  - lesen:
    - `primary_doctor_email`
    - optional `primary_doctor_name`

Kein direkter DB-Zugriff außerhalb des Profile-Moduls.

---

## 6. Frontend Modul (`app/modules/profile/index.js`)

### Erweiterungen

#### A) State / Snapshot
- Snapshot enthält zusätzlich:
  - `primary_doctor_name`
  - `primary_doctor_email`

#### B) `renderOverview()`
- Anzeige:
  - „Primary Doctor: Name“
  - „E-Mail: …“ (maskiert oder vollständig, je nach Design)

#### C) `notifyChange()`
- Event `profile:changed`
- Payload enthält aktualisierte Arztfelder

---

## 7. Consumer-Verhalten (Integration)

### Medication Management Modul
- Nutzt `primary_doctor_email` für:
  - `mailto:` Link in Low-Stock MessageBox
- Verhalten:
  - E-Mail fehlt → Button deaktiviert oder Hinweis anzeigen
- Kein Fallback, keine automatische Logik

---

## 8. Security / RLS

- Zugriff ausschließlich auf `auth.uid()`
- Keine zusätzlichen Policies notwendig
- Felder unterliegen denselben RLS-Regeln wie restliches Profil

---

## 9. Fehlerverhalten

- Ungültige E-Mail:
  - Frontend blockiert Save
  - Inline-Hinweis
- Save-Fehler:
  - Toast „Profil konnte nicht gespeichert werden“
  - `[profile] save failed` im Diagnostics-Log
- Fehlendes Profil:
  - Snapshot `null`
  - Consumer müssen defensiv reagieren

---

## 10. QA-Checkliste (Auszug)

- Profil speichern mit Arzt-E-Mail → Persistiert
- Profil refresh → Felder korrekt geladen
- `profile:changed` feuert bei Änderung
- Medication-Modul liest E-Mail korrekt
- Mail-Button deaktiviert, wenn keine E-Mail vorhanden
- Keine Regression bei Charts / Assistant

---

## 11. Dateien

### Modified
- `app/modules/profile/index.js`
- `sql/10_User_Profile_Ext.sql`
- `docs/modules/Profile Module Overview.md` (Abschnitt ergänzen)

---

**End of Spec**
