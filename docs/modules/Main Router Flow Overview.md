# Main Router Flow - Functional Overview

Kurze Einordnung:
- Zweck: zentraler Orchestrator fuer Refresh, Events, Guards und Legacy-Router.
- Rolle innerhalb von MIDAS: steuert requestUiRefresh, Modul-Refresh, Global Hooks.
- Abgrenzung: keine eigene UI; orchestriert bestehende Module.

Related docs:
- [Bootflow Overview](bootflow overview.md)

---

## 1. Zielsetzung

- Problem: konsistente Updates (Capture/Doctor/Chart/Trendpilot) nach Actions.
- Nutzer: System/Module (keine direkte UI-Interaktion).
- Nicht Ziel: neue Panels oder direkte Datenpersistenz.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `assets/js/main.js` | Orchestrator (Refresh, Bindings, Guards, Helpers) |
| `assets/js/ui-tabs.js` | Legacy Tab Router (Fallback, Doctor Guard) |
| `assets/js/boot-auth.js` | Boot-Auth Trigger (Supabase ready) |

---

## 3. Datenmodell / Storage

- `uiRefreshState` (Runtime): Flags + Queue fuer Refreshes.
- Kein persistenter Speicher.

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- `ensureModulesReady()` prueft Supabase + Globals.
- `watchAuthState()` wird gebunden, sobald Supabase da ist.

### 4.2 User-Trigger
- Save-Buttons (BP/Body/Lab/Activity) -> `requestUiRefresh`.
- Range/Export Buttons -> Doctor/Chart Refresh.

### 4.3 Verarbeitung
- `requestUiRefresh()` setzt Flags und startet Timer.
- `runUiRefresh()` laeuft sequenziell durch Capture/Doctor/Chart/Trendpilot.
- Helpers: `withBusy`, `uiError`, `maybeRefreshForTodayChange`.

### 4.4 Persistenz
- Keine direkte Persistenz (delegiert an Module/APIs).

---

## 5. UI-Integration

- Bindings auf Buttons/Inputs in `index.html` (Date, Save, Range).
- Legacy `setTab()` bleibt fuer Fallback vorhanden.

---

## 6. Arzt-Ansicht / Read-Only Views

- Doctor-Refresh wird ueber `requestUiRefresh({ doctor: true })` angestossen.
- Doctor-Guard via `requireDoctorUnlock` + `setAuthPendingAfterUnlock`.

---

## 7. Fehler- & Diagnoseverhalten

- `diag.add` fuer Fehlpfade.
- Touch-Log Eintraege: `[ui] refresh start/end`, `[resume] ...`.
- `ensureModulesReady` zeigt Fallback-Fehler bei missing APIs.

---

## 8. Events & Integration Points

- Public API / Entry Points: `requestUiRefresh`, `runUiRefresh`, `ensureModulesReady`.
- Source of Truth: `uiRefreshState` in `assets/js/main.js`.
- Side Effects: triggert Capture/Doctor/Chart Refreshes.
- Constraints: SupabaseAPI muss ready sein.
- `requestUiRefresh` ist das zentrale Integrations-Event.
- `supabase:ready` gate fuer Auth/Refresh.
- `resumeFromBackground` hookt in Refresh.

---

## 9. Erweiterungspunkte / Zukunft

- Router-State/History fuer Panels.
- Feingranulare Refresh-Pipelines (per Modul).

---

## 10. Feature-Flags / Konfiguration

- `DEV_ALLOW_DEFAULTS` fuer Debug/Default-Daten.

---

## 11. Status / Dependencies / Risks

- Status: aktiv.
- Dependencies (hard): `assets/js/main.js`, `ui-tabs.js`, Supabase ready, Capture/Doctor/Charts/Trendpilot.
- Dependencies (soft): weitere Module koennen Refresh hooks nutzen.
- Known issues / risks: Race/Double-Refresh; fehlende Module-Exports -> Errors.
- Backend / SQL / Edge: n/a.

---

## 12. QA-Checkliste

- Refresh-Queue verhindert Doppellauf.
- Save-Buttons triggern passenden Refresh.
- Doctor-Guard blockt ohne Unlock.
- Resume triggert Refresh.

---

## 13. Definition of Done

- Refresh-Pipeline stabil.
- Keine fehlenden Globals.
- Doku aktuell.

