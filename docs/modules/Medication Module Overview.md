# Medication Module – Functional Overview

Kurze Einordnung:
- Zweck: Tablettenmanager im Intake-Panel (Daily Toggles) und TAB-Panel (Medikationsverwaltung).
- Rolle: Ergänzt Capture um pharmakologische Daten; liefert Events für andere Module.
- Abgrenzung: Eigenständiges Modul; Capture konsumiert es nur über Events/RPCs.

---

## 1. Zielsetzung

- Problem: Tagesbasierte Medikation soll ohne SQL oder manuelle Tabellenpflege funktionieren.
- Benutzer: Primär Patient (IN/TAB), indirekt Arzt via Warnhinweise.
- Nicht-Ziel: Kein Arzt-Workflow, keine externen Benachrichtigungen.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/medication/index.js` | Client-API, RPC Loader, Cache, TAB-UI. |
| `app/modules/capture/index.js` | IN-Toggles, Low-Stock Box, Safety-Hinweis (nutzt `AppModules.medication`). |
| `app/styles/hub.css` | Layout/Styles Tablettenmanager. |
| `sql/12_Medication.sql` | Tabellen + RPCs (`med_list`, `med_upsert`, `med_confirm_dose`, `med_undo_dose`, `med_adjust_stock`, `med_set_stock`, `med_ack_low_stock`, `med_set_active`, `med_delete`). |
| `docs/Medication Management Module Spec.md` | Spezifikation & Roadmap. |
| `docs/QA_CHECKS.md` | QA Pack (Phase E). |

---

## 3. Datenmodell / Storage

- `health_medications`: Stammdaten + Bestände, Low-Stock-Felder, `active` Flag.
- `health_medication_doses`: tägliche Einnahmen je Nutzer/Medikation (unique per day).
- `health_medication_stock_log`: optionaler Verlauf für Bestandskorrekturen.
- Beziehungen: Doses & Log referenzieren `health_medications`.
- Besonderheiten: Low-Stock-Acknowledgements (`low_stock_ack_day/_stock`) verhindern Doppeleinblendung.

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- Modul lädt automatisch über `<script src="app/modules/medication/index.js">`.
- Aktiv sobald Supabase Auth Stage ≥ INIT_MODULES.
- Capture subscribe auf `medication:changed`.

### 4.2 User-Trigger
- IN-Tab Buttons (`med-toggle-btn`, Low-Stock Ack, Safety Goto).
- TAB-Formular Submit/Reset.
- Kartenaktionen: Restock, Set Stock, Toggle Active, Delete.

### 4.3 Verarbeitung
- Client-Validierungen (Name Pflicht, Delta ≠ 0, Stock ≥ 0).
- Cache & Events sichern, dass UI konsistent bleibt.
- Safety-Berechnung: Vortag laden, `med_taken` prüfen.

### 4.4 Persistenz
- RPCs schreiben in `health_medications` & `health_medication_doses`.
- `med_upsert` Upsert; `med_confirm_dose/undo` passen Dosen & Bestände an.
- `med_adjust_stock` und `med_set_stock` loggen in `health_medication_stock_log`.

---

## 5. UI-Integration

- IN-Panel (Capture) unter „Tablettenmanager“.
- TAB-Panel (Intake Subtab „TAB“) mit Formular + Kartenliste.
- Low-Stock-Box + Safety-Hinweis nur sichtbar, wenn Daten vorhanden.

---

## 6. Arzt-Ansicht / Read-Only Views

- Aktuell keine dedizierte Arztansicht; Doctor Panel könnte später `med_list` konsumieren.
- Low-Stock-Box zeigt Arzt-Mail zur Kontaktaufnahme (aus Profil).

---

## 7. Fehler- & Diagnoseverhalten

- Typische Fehler: Nicht authentifiziert, RPC schlägt fehl, fehlende Arzt-Mail.
- Logging: `[capture:med] refresh/confirm/undo/ack/safety` in diag.
- Fallback: Placeholder-Texte, Buttons disabled, kein Silent Failure.
- Fehlende Daten → IN zeigt Hinweis „Bitte anmelden…“ oder „Keine Daten vorhanden“.

---

## 8. Events & Integration Points

- Custom Event `medication:changed { reason, dayIso, data? }`.
- Capture reagiert (IN), Profil-Änderungen triggen Low-Stock-Kontakt Update.
- `AppModules.medication` exportiert API für andere Module (z. B. Trendpilot).

---

## 9. Erweiterungspunkte / Zukunft

- Geplante Komfort-Buttons (+28/+56), Bulk-Aktionen.
- E-Mail/Push-Reminder optional.
- Playwright-Szenarien für UI-Smoke.

---

## 10. Feature-Flags / Konfiguration

- Derzeit keine dedizierten Flags; modul deaktivierbar indem Script entfernt wird.
- Low-Stock-Schwellen user-spezifisch (Feld `low_stock_days`).

---

## 11. QA-Checkliste

- Siehe `docs/QA_CHECKS.md` Phase E (Smoke/Sanity/Regression).
- Fokus: Toggles, Low-Stock Box, Safety, TAB CRUD, Kartenaktionen, Logging.

---

## 12. Definition of Done

- Module lädt ohne Errors.
- Supabase RPCs + RLS aktiv.
- IN/TAB Panels reflekten Änderungen unmittelbar.
- Dokumentation (Spec, Overview, QA) aktuell; Tests durchgeführt.
