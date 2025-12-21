# Medication Module â€“ Functional Overview

Kurze Einordnung:
- Zweck: Tablettenmanager im Intake-Panel (Daily Toggles) und TAB-Panel (Medikationsverwaltung).
- Rolle: ErgÃ¤nzt Capture um pharmakologische Daten; liefert Events fÃ¼r andere Module.
- Abgrenzung: EigenstÃ¤ndiges Modul; Capture konsumiert es nur Ã¼ber Events/RPCs.

---

## 1. Zielsetzung

- Problem: Tagesbasierte Medikation soll ohne SQL oder manuelle Tabellenpflege funktionieren.
- Benutzer: PrimÃ¤r Patient (IN/TAB), indirekt Arzt via Warnhinweise.
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

- `health_medications`: Stammdaten + Bestaende, Low-Stock-Felder, `active` Flag.
- Tagesstatus ohne Verlauf: `last_taken_day` + `last_taken_qty` direkt in `health_medications`.
- Besonderheiten: Low-Stock-Acknowledgements (`low_stock_ack_day/_stock`) verhindern Doppeleinblendung.

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- Modul lÃ¤dt automatisch Ã¼ber `<script src="app/modules/medication/index.js">`.
- Aktiv sobald Supabase Auth Stage â‰¥ INIT_MODULES.
- Capture subscribe auf `medication:changed`.

### 4.2 User-Trigger
- IN-Tab Buttons (`med-toggle-btn`, Low-Stock Ack, Safety Goto).
- TAB-Formular Submit/Reset.
- Kartenaktionen: Restock, Set Stock, Toggle Active, Delete.

### 4.3 Verarbeitung
- Client-Validierungen (Name Pflicht, Delta â‰  0, Stock â‰¥ 0).
- Cache & Events sichern, dass UI konsistent bleibt.
- Safety-Berechnung: Vortag laden, `med_taken` prÃ¼fen.

### 4.4 Persistenz
- RPCs schreiben nur in `health_medications`.
- `med_upsert` Upsert; `med_confirm_dose/undo` setzen Tagesstatus + passen Bestaende an.
- `med_adjust_stock` und `med_set_stock` passen nur Bestaende an (keine Historie).

---

## 5. UI-Integration

- IN-Panel (Capture) unter â€žTablettenmanagerâ€œ.
- TÃ¤gliche Medikationskarten teilen sich das Intake-Card-Layout: dreizeilige Kacheln (Name, Button, Resttage) in einer responsiven `.intake-card-grid` (1 Spalte mobile, 2 Spalten Desktop), damit Wasser/Salz/Protein und Medikamente wie ein gemeinsamer Satz wirken.
- TAB-Panel (Intake Subtab â€žTABâ€œ) mit Formular + Kartenliste.
- Low-Stock-Box + Safety-Hinweis nur sichtbar, wenn Daten vorhanden.

---

## 6. Arzt-Ansicht / Read-Only Views

- Aktuell keine dedizierte Arztansicht; Doctor Panel kÃ¶nnte spÃ¤ter `med_list` konsumieren.
- Low-Stock-Box zeigt Arztkontakt aus dem Profil (Name + E-Mail) einmalig im Header und bietet einen gemeinsamen Mail-Shortcut, der alle betroffenen Medikamente auflistet.

---

## 7. Fehler- & Diagnoseverhalten

- Typische Fehler: Nicht authentifiziert, RPC schlÃ¤gt fehl, fehlende Arzt-Mail.
- Logging: `[capture:med] refresh/confirm/undo/ack/safety` in diag.
- Fallback: Placeholder-Texte, Buttons disabled, kein Silent Failure.
- Fehlende Daten â†’ IN zeigt Hinweis â€žBitte anmeldenâ€¦â€œ oder â€žKeine Daten vorhandenâ€œ.

---

## 8. Events & Integration Points

- Public API / Entry Points: `AppModules.medication` RPC helpers, IN/TAB Buttons.
- Source of Truth: `health_medications` (inkl. Tagesstatus).
- Side Effects: feuert `medication:changed`, Intake/Low-Stock UI refresh.
- Constraints: RPCs erfordern Auth, Tagesstatus ist nur fuer den aktuellen Tag.
- Custom Event `medication:changed { reason, dayIso, data? }`.
- Capture reagiert (IN), Profil-Ã"nderungen triggen Low-Stock-Kontakt Update.
- `AppModules.medication` exportiert API fÃ¼r andere Module (z. B. Trendpilot).

---

## 9. Erweiterungspunkte / Zukunft

- Geplante Komfort-Buttons (+28/+56), Bulk-Aktionen.
- E-Mail/Push-Reminder optional.
- Playwright-Szenarien fÃ¼r UI-Smoke.

---

## 10. Feature-Flags / Konfiguration

- Derzeit keine dedizierten Flags; modul deaktivierbar indem Script entfernt wird.
- Low-Stock-Schwellen user-spezifisch (Feld `low_stock_days`).

---

## 11. Status / Dependencies / Risks

- Status: aktiv.
- Dependencies (hard): `health_medications` + RPCs, Capture/Intake Panel.
- Dependencies (soft): Profil-Hausarztkontakt; moegliche Doctor-Ansicht.
- Known issues / risks: Stock-Fehleingaben; Low-Stock Ack kann Warnung verstecken; keine Verlaufshistorie.
- Backend / SQL / Edge: `sql/12_Medication.sql`.

---

## 12. QA-Checkliste

- Siehe `docs/QA_CHECKS.md` Phase E (Smoke/Sanity/Regression).
- Fokus: Toggles, Low-Stock Box, Safety, TAB CRUD, Kartenaktionen, Logging.

---

## 13. Definition of Done

- Module lÃ¤dt ohne Errors.
- Supabase RPCs + RLS aktiv.
- IN/TAB Panels reflekten Ã„nderungen unmittelbar.
- Dokumentation (Spec, Overview, QA) aktuell; Tests durchgefÃ¼hrt.

