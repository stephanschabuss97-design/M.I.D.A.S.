# Supabase Core - Functional Overview

## Lokaler Supabase-Modernisierungsvertrag — produktive Gates offen

Der folgende Vertrag beschreibt den lokal implementierten Repositorystand.
Die produktive Backend-/Pages-Übernahme benötigt G3/G4; lokale Prüfungen
ersetzen keine Live-Acceptance. Android/APK, aktive Signingrotation und
Legacyabschaltung benötigen ihre eigenen Gates. Keine zusätzliche Modulrolle.

- `core/public-key.js` trennt moderne Publishable-Keys und strukturelle Legacy-
  ANON-Keys von Secret-/Service-/Usertoken. Typprüfung beweist kein Projektbinding.
- Konfiguration vor jedem gecachten Clientzugriff validieren; Client-/Header-
  Generation, Inflight und Listener an exakte Konfigurationsidentität binden.
- `getSessionHeaders` liefert rohen Publickey ausschließlich als `apikey` und
  eine aktuelle nicht-anonyme, nicht abgelaufene User-Session als Authorization.
  Cache/Timeout berechtigen keinen Transport. `fetchWithAuth` prüft vor jedem
  Versuch und verwirft verspätete Antworten nach Context-/Tokenwechsel.
- `_shared/edge-auth.ts` prüft GetUser/festen MIDAS_OWNER_USER_ID vor Wirkung.
  User-RPC bleibt User-JWT/RLS; Named-secret-Clients werden strikt ausgewählt.
  Vorhandene ungültige plural-Maps dürfen nicht auf Legacy-Env zurückfallen;
  nur fehlende Maps erlauben den dokumentierten internen Übergang.
- SW-Paket v34 enthält den vollständigen Authimportgraph. Offlinecacheantworten
  konsumieren fehlgeschlagene Revalidation; Hintergrundcachearbeit bleibt an
  Worker-Lifecycle gebunden. Cache-lookup/-open/-put-Fehler dürfen eine erfolgreiche
  Netzantwort nicht verwerfen; Navigationscachewrites sind ebenfalls behandelt
  und an waitUntil gebunden. Ungecachte Netzfehler bleiben Fehler. Keine
  Supabase-/Gesundheitsresponse wird gecacht.
- F22: eine abgewiesene alte Antwort ist kein Logoutnachweis. Der HTTP-Recheck
  öffnet Login dafür nur bei frischer aktueller erfolgreicher Prüfung mit
  unbrauchbarer Session. Fehler/Timeout/weitere Kontextänderung bleiben unklar,
  ohne Cacheautorisierung, ohne alte Antwort und ohne Writewiederholung. Notes
  fordert bei unklarer Writeantwort eine Prüfung des Speicherstands. Echte
  Sessionverluste und definitive Authfehler bleiben gesperrt. Owner-Retest offen.



## Historische produktive R13-Baseline (2026-08-26)

SQL26 stellt einen kanonischen privaten Snapshotkern sowie getrennte User- und
Servicewrapper bereit. Monthly bleibt Gateway-JWT-geschützt; Protein und
Trendpilot validieren Legacy-Signing-Benutzer serverseitig über Supabase Auth
und akzeptieren Scheduler nur über je einen benannten Secret Key. Incident
Push verwendet den isolierten Alias `INCIDENTS_PUSH_LEGACY_KEY` ausschließlich
für den Callervergleich. Die globale Signing-/Keymigration wurde bewusst nicht
begonnen; moderne Default-Keys bleiben dormant.

Kurze Einordnung:
- Zweck: zentrale Aggregation aller Supabase-Subsysteme (Auth, API, Realtime, Core).
- Rolle innerhalb von MIDAS: stellt ein einheitliches API-Bundle fuer alle Module bereit.
- Abgrenzung: keine UI, keine Business-Logik, nur Infrastruktur.

Related docs:
- [Bootflow Overview](bootflow overview.md)
- [Android Native Auth Module Overview](Android Native Auth Module Overview.md)

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
| `app/supabase/core/http.js` | aktuelle Sessionheader, Generation, `fetchWithAuth` und Refresh |
| `app/supabase/core/public-key.js` | gemeinsamer Public-/Session-Typfilter |
| `backend/supabase/functions/_shared/edge-auth.ts` | fester serverseitiger Owner und strikte Named-secret-Auswahl |
| `app/supabase/auth/index.js` | Auth-Exports (Core, UI, Guard) |
| `app/supabase/realtime/index.js` | Realtime-Setup/Teardown |
| `app/supabase/api/*` | Domain-APIs (Intake, Vitals, Notes, Reports, etc.) |
| `assets/js/main.js` | Wrapper `createSupabaseFn(...)` fuer Zugriff |

---

## 3. Datenmodell / Storage

- `supabaseState` (Runtime): `authState`, `sbClient`, Header-Cache, `lastUserId`, `authDecisionMeta`.
- Session wird durch Supabase Auth im Browser persistent gespeichert; Runtime-Status liegt in `supabaseState`.
- Wichtig:
  - MIDAS ist browser-first.
  - Ein nativer Android-Node kann einen separaten Session-Owner haben.
  - Entscheidend ist nicht identischer Login-Start, sondern identischer fachlicher Session-Vertrag nach erfolgreicher Anmeldung.
  - Im aktuellen Android-Vertrag ist dieser Session-Owner der native Android-Store; die `WebView` importiert Session nur abgeleitet.

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
- `ensureSupabaseClient` erstellt den Client pro gültiger Konfigurationsidentität einmal (Inflight-Lock); ungültige Konfiguration oder neue Identität invalidiert alte Clients.
- `ensureSupabaseClient` laeuft inzwischen kontextsensitiv:
  - Browser/PWA behaelt die normalen Supabase-Defaults
  - Android-WebView nutzt einen engeren Client-Modus, weil die Session importiert statt lokal gestartet wird

### 4.4 Persistenz
- Persistente Session im Browser (Supabase Auth); Frontend haelt zusaetzlich Runtime-State.

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
- Ein nativer Android-Node darf am Supabase-Vertrag andocken, ohne den stabilen Browser-/PWA-Login-Start selbst umzuschneiden.
- Der Android-Pfad darf dieselben Reads und denselben fachlichen Session-Vertrag nutzen, aber keinen zweiten fachlich abweichenden Auth-Zustand neben Browser/PWA erzeugen.
- Im Android-WebView darf `SupabaseAPI` nicht wieder still der Auth-Owner werden:
  - native Session bleibt fuehrend
  - WebView-Client bleibt Mirror-/Arbeitskontext

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
- Known issues / risks: fehlende Config; Header-Cache stale; `supabase:ready` Timing; Browser- und Native-Auth duerfen nicht in zwei fachlich unterschiedliche Session-Zustaende auseinanderlaufen; Android-WebView darf Browser-Client-Defaults nicht wieder unkritisch wie die PWA behandeln.
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

