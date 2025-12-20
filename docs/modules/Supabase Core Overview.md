# Supabase Core - Functional Overview

Kurze Einordnung:
- Zweck: zentrale Aggregation aller Supabase-Subsysteme (Auth, API, Realtime, Core).
- Rolle innerhalb von MIDAS: stellt ein einheitliches API-Bundle fuer alle Module bereit.
- Abgrenzung: keine UI, keine Business-Logik, nur Infrastruktur.

---

## 1. Zielsetzung

- Problem: ein einziger, stabiler Zugriffspunkt fuer Supabase-Funktionen.
- Nutzer: System/Module (Capture, Doctor, Hub, Assistant).
- Nicht Ziel: direkte UI- oder Domain-Logik.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/supabase/index.js` | Aggregiert alle Exporte in `SupabaseAPI` |
| `app/supabase/core/state.js` | Runtime State (Auth, Header Cache, Client) |
| `app/supabase/core/client.js` | Supabase Client Initialisierung |
| `app/supabase/core/http.js` | `fetchWithAuth` inkl. Header-Cache/Refresh |
| `app/supabase/auth/index.js` | Auth-Exports (Core, UI, Guard) |
| `app/supabase/realtime/index.js` | Realtime-Setup/Teardown |
| `app/supabase/api/*` | Domain-APIs (Intake, Vitals, Notes, Reports, etc.) |
| `assets/js/main.js` | Wrapper `createSupabaseFn(...)` fuer Zugriff |

---

## 3. Datenmodell / Storage

- `supabaseState` (Runtime): `authState`, `sbClient`, Header-Cache, `lastUserId`.
- Keine persistente Speicherung im Frontend.

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- `app/supabase/index.js` baut `SupabaseAPI` aus `MODULE_SOURCES`.
- `AppModules.supabase = SupabaseAPI` und Legacy-Proxies werden registriert.
- `supabase:ready` Event signalisiert Verfuegbarkeit.

### 4.2 User-Trigger
- Keine direkten User-Trigger; genutzt durch andere Module.

### 4.3 Verarbeitung
- `fetchWithAuth` fuehrt REST calls mit Auth-Headern aus.
- `createSupabaseFn` (main.js) kapselt Zugriff und Fehler bei fehlenden Exports.

### 4.4 Persistenz
- Nur in Supabase; Frontend speichert nur Runtime-State.

---

## 5. UI-Integration

- Keine direkte UI.
- Login-Overlay/Guard lives in Auth-Modul.

---

## 6. Arzt-Ansicht / Read-Only Views

- Supabase liefert Daten, UI liegt in Doctor-Modul.

---

## 7. Fehler- & Diagnoseverhalten

- Konflikte in `MODULE_SOURCES` werden gewarnt.
- `fetchWithAuth` loggt und retried bei 401/Timeout.
- `supabase:ready` feuert nur einmal.

---

## 8. Events & Integration Points

- Public API / Entry Points: `SupabaseAPI` (global), `createSupabaseFn` wrappers.
- Source of Truth: `supabaseState` + aggregated module exports.
- Side Effects: dispatches `supabase:ready`, legacy proxies.
- Constraints: Supabase config required for client init.
- `supabase:ready` (CustomEvent) fuer Boot-Flow.
- `createSupabaseFn` in `assets/js/main.js` als Standard-Entry.

---

## 9. Erweiterungspunkte / Zukunft

- Weitere API-Module an `MODULE_SOURCES` haengen.
- Legacy-Proxies entfernen nach Migration.

---

## 10. Feature-Flags / Konfiguration

- Supabase Config via `getConf` in Auth/UI.
- Keine Supabase-Core Flags (nur Umgebung).

---

## 11. Status / Dependencies / Risks

- Status: aktiv.
- Dependencies (hard): Supabase Config, Core Client/Auth/HTTP, `MODULE_SOURCES`.
- Dependencies (soft): Realtime (optional).
- Known issues / risks: fehlende Config; Header-Cache stale; `supabase:ready` Timing.
- Backend / SQL / Edge: Supabase Projekt.

---

## 12. QA-Checkliste

- `SupabaseAPI` wird global gesetzt.
- `supabase:ready` Event feuert.
- `fetchWithAuth` laeuft fuer REST-Aufrufe.
- `createSupabaseFn` wirft bei fehlenden Exports.

---

## 13. Definition of Done

- Supabase-Core sauber aggregiert.
- Module greifen nur ueber `SupabaseAPI` zu.
- Doku aktuell.

