# Unlock Flow - Functional Overview

Kurze Einordnung:
- Zweck: Schutz sensibler Bereiche via Passkey/PIN (Doctor-Ansicht, Charts).
- Rolle innerhalb von MIDAS: Guard-Workflow fuer Doctor/Chart, Pending-Actions nach Unlock.
- Abgrenzung: kein Login/Session-Handling (liegt im Auth-Modul).

Related docs:
- [Bootflow Overview](bootflow overview.md)

---

## 1. Zielsetzung

- Problem: sensible Views nur nach Entsperrung anzeigen.
- Nutzer: Patient (entsperrt) und System (Guard-Status).
- Nicht Ziel: Benutzerverwaltung oder Auth-Login.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/supabase/auth/guard.js` | Guard-Flow: `requireDoctorUnlock`, `lockUi`, Passkey/PIN |
| `assets/js/main.js` | Pending-Action Handling (`setAuthPendingAfterUnlock`) |
| `app/modules/hub/index.js` | Hub-Integration (Doctor-Panel Unlock) |
| `assets/js/ui-tabs.js` | Legacy Doctor-Tab Guard |
| `index.html` | Lock-Overlay (`#appLock`) |
| `app/styles/auth.css` | Lock-Overlay Styling |

---

## 3. Datenmodell / Storage

- `authGuardState` (Runtime): `doctorUnlocked`, `pendingAfterUnlock`.
- Kein persistenter Speicher.

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- Guard registriert Button-Handler im Lock-Overlay.
- `authGuardState` wird bereitgestellt.

### 4.2 User-Trigger
- Doctor/Chart-Button -> `requireDoctorUnlock()`.
- Unlock-Overlay zeigt Passkey/PIN Buttons.

### 4.3 Verarbeitung
- Passkey/PIN Flow setzt `doctorUnlocked`.
- `lockUi(true/false)` sperrt UI waehrend Unlock.
- Pending-Action wird nach Erfolg ausgefuehrt.

### 4.4 Persistenz
- Keine Persistenz.

---

## 5. UI-Integration

- Lock-Overlay (`#appLock`) mit Passkey/PIN Buttons.
- Hub zeigt Doctor-Panel erst nach Unlock.

---

## 6. Arzt-Ansicht / Read-Only Views

- Doctor-Ansicht ist der Haupteinsatzfall des Unlocks.

---

## 7. Fehler- & Diagnoseverhalten

- `diag.add` bei Unlock-Fehlern.
- Guard fehlt -> `[hub] doctor unlock bypassed` Log.

---

## 8. Events & Integration Points

- Public API / Entry Points: `requireDoctorUnlock`, `lockUi`, `authGuardState`.
- Source of Truth: `authGuardState` (doctorUnlocked, pending).
- Side Effects: blocks UI via `lockUi`, triggers `requestUiRefresh` after unlock.
- Constraints: requires auth session, overlay must be present.
- `requireDoctorUnlock` wird von Hub/Legacy Router genutzt.
- `requestUiRefresh` nach Unlock (Doctor/Chart).

---

## 9. Erweiterungspunkte / Zukunft

- Timeout-Lock.
- Audit-Log fuer Unlocks.

---

## 10. Feature-Flags / Konfiguration

- Keine dedizierten Flags.

---

## 11. Status / Dependencies / Risks

- Status: aktiv.
- Dependencies (hard): Auth Guard, Lock-Overlay, Hub Integration.
- Dependencies (soft): n/a.
- Known issues / risks: fehlendes Overlay -> Bypass; Pending-Action Verlust; UI-Deadlock.
- Backend / SQL / Edge: n/a.

---

## 12. QA-Checkliste

- Doctor/Chart blockt ohne Unlock.
- Passkey/PIN entsperrt und oeffnet Panel.
- Pending-Action wird ausgefuehrt.

---

## 13. Definition of Done

- Unlock-Flow stabil.
- Keine UI-Deadlocks.
- Doku aktuell.

