# Medication Module - Functional Overview

Kurze Einordnung:
- Zweck: Tablettenmanager im Intake-Panel (IN) und TAB-Panel (Medikationsverwaltung).
- Rolle: Verwaltet Medikations-Stammdaten, Tagesplan, Slot-Fortschritt, Bestand und Low-Stock-Hinweise.
- Abgrenzung: Eigenstaendiges Modul; Intake, Hub, Voice und Profile konsumieren es ueber Events und Modul-API.

Related docs:
- [Bootflow Overview](bootflow overview.md)
- [Profile Module Overview](Profile Module Overview.md)
- [Reports Module Overview](Reports Module Overview.md)

## Produktiver Data-Hygiene-Vertrag

Stand `2026-07-12`: Der produktive Clean Start und der Wechsel auf den
langfristig begrenzten Medication-Vertrag sind abgeschlossen:

- drei Medication-Tabellen ohne `health_medication_stock_log`.
- `health_medications.stock_count` als einzige operative Bestandswahrheit ohne
  dauerhaften Bewegungsverlauf.
- `health_medication_slot_events.qty` als dokumentierte Dosis und
  `stock_decrement_qty` als tatsaechlich angewandte Bestandsreduktion.
- exakt invertierbares Confirm/Undo auch bei einem ungenauen niedrigen Bestand.
- ein rollendes Wiener Kalenderjahr Slot-Events; fehlende Events bedeuten
  `nicht dokumentiert`, nicht beweisbar `vergessen`.
- datenbankseitige interne Retention mit genau einem taeglichen Supabase-Cron-
  Job `midas-medication-retention-daily`.
- keine Aenderung an Slot-Abschnitten, UI, Voice, Widget oder Reminder-Zeiten.
- produktiver Beobachtungsbeginn fuer die neue Event-Historie ist der
  `2026-07-12`; fruehere Einzelereignisse wurden bewusst nicht uebernommen.

---

## 1. Zielsetzung

- Problem: Medikation soll im Alltag mit `1x` bis `nx` taeglich ohne externe Planungssoftware funktionieren.
- Benutzer: Primaer Patient (IN/TAB), indirekt Arzt ueber Hinweise und Read-only-Kontexte.
- Nicht-Ziel: Kein klinischer Medikationsplaner, kein externer Bestell- oder Arzt-Workflow.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/intake-stack/medication/index.js` | Client-API, `v2`-RPC Loader, Slot-Helper, Cache, TAB-UI. |
| `app/modules/intake-stack/intake/index.js` | IN-Slot-Aktionen, abschnittsbezogene Batch-CTAs, Low-Stock Box (nutzt `AppModules.medication`). |
| `app/modules/hub/index.js` | lokaler Text-/Hub-Fast-Path fuer `medication_confirm_section`. |
| `app/modules/assistant-stack/voice/index.js` | Voice-Fast-Path fuer `medication_confirm_section` plus Low-Stock-Follow-up. |
| `app/modules/profile/index.js` | Read-only-Zusammenfassung fuer Medikation im Profil. |
| `backend/supabase/functions/midas-monthly-report/index.ts` | Liest aktive Medikamente und am Wiener Berichtstag gueltige Slots fuer den Range-Arztbericht. |
| `app/modules/incidents/index.js` | gestaffelte lokale Medication-Reminder/Incidents pro Abschnitt (`morning/noon/evening/night`). |
| `app/styles/hub.css` | Layout/Styles fuer Medication-Karten, Slot-Liste und TAB-Editor. |
| `sql/12_Medication.sql` | Tabellen plus produktive RPCs fuer Slot-/Progress-Modell und den bereinigten Medication-Contract. |
| `sql/16_Explicit_Grants.sql` | Expliziter Data-API-Rollenvertrag fuer Medication-Tabellen und RPCs. |
| `sql/17_Medication_Retention.sql` | Interne Jahres-Retention und taeglicher Supabase-Cron-Job. |
| `sql/transition_medication_clean_start.sql` | Einmaliges, bereits produktiv ausgefuehrtes Clean-Start-Artefakt; nicht erneut ausfuehren. |
| `docs/qa/intake-medication.md` | Medication-QA (`IM-006` bis `IM-013`) |

---

## 3. Datenmodell / Storage

- `health_medications`: Stammdaten, Bestaende, `with_meal`, Low-Stock-Felder, `active`.
- `health_medication_schedule_slots`: geplanter Tagesplan pro Medication mit `slot_type`, `sort_order`, `qty_per_slot`, `start_date`, `end_date`.
- `health_medication_slot_events`: bestaetigte Slot-Einnahmen je
  Nutzer/Medication/Tag. `qty` dokumentiert die Dosis;
  `stock_decrement_qty` speichert den tatsaechlich angewandten Bestandsabzug.
- Es gibt keinen dauerhaften Bestandsbewegungsverlauf. Operative
  Bestandswahrheit ist ausschliesslich `health_medications.stock_count`.
- `med_list_v2` ist das operative Read-Model fuer Medication im Frontend.
- `health_medications` und `health_medication_schedule_slots` sind zugleich die
  strukturierte aktuelle Quelle fuer Profil und Range-Arztbericht. Die
  produktiv noch vorhandene Profil-Legacy-Spalte ist keine aktive Medication-
  Quelle mehr.

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- Modul laedt ueber `app/modules/intake-stack/medication/index.js`.
- Aktiv sobald Supabase Auth Stage `INIT_MODULES` erreicht ist.
- Intake hoert auf `medication:changed`.

### 4.2 User-Trigger
- IN-Tab: offene Abschnitts-CTAs bestaetigen nur `Morgen`, `Mittag`, `Abend` oder `Nacht`.
- `1x taeglich` bleibt als kompakter Status-Button im Kartenkopf erhalten.
- Mehrfach-Medikation zeigt direkte Slot-Buttons plus abschnittsbezogene Sammel-CTAs.
- Low-Stock Ack im IN-Tab.
- TAB-Formular mit Frequenz-Presets, Slot-Liste, `Mit Mahlzeit`, `Startdatum`, Submit/Reset.
- Kartenaktionen: Restock, Set Stock, Toggle Active, Delete.

### 4.3 Verarbeitung
- Client-Validierungen: Name Pflicht, Delta ungleich `0`, Stock `>= 0`.
- Slot-Validierung vor dem Speichern: mindestens ein Slot, gueltige Mengen, stabile Reihenfolge.
- Cache und Events sichern, dass UI konsistent bleibt.

### 4.4 Persistenz
- `med_list_v2` liefert Medication, Progress (`taken_count`, `total_count`, `state`) und `slots[]` inklusive `slot_type`.
- `med_upsert_v2` speichert Stammdaten; `med_upsert_schedule_v2` schreibt den aktiven Slot-Plan inklusive normalisiertem `slot_type`.
- `med_confirm_slot_v2` bucht genau einen Slot, reduziert den Bestand nie unter
  `0` und speichert den realen Abzug im Event.
- `med_undo_slot_v2` entfernt das Event und stellt exakt dessen
  `stock_decrement_qty` wieder her.
- `med_adjust_stock_v2` und `med_set_stock_v2` aendern nur den aktuellen
  Bestand und erzeugen keine Historie.
- `med_ack_low_stock_v2`, `med_set_active_v2`, `med_delete_v2` bilden die restlichen Write-Pfade im neuen Vertrag.
- clientseitig existiert zusaetzlich `confirmMedicationSection(...)` fuer abschnittsbezogene Sammelbestaetigung offener Slots.

### 4.5 Retention

- `med_retention_cleanup_internal()` loescht Slot-Events vor dem rollenden
  Wiener Jahres-Cutoff.
- Alte beendete Schedule-Slots werden erst entfernt, wenn sie ebenfalls vor
  dem Cutoff liegen und kein erhaltenes Event mehr auf sie verweist.
- `midas-medication-retention-daily` fuehrt die Bereinigung taeglich um
  `03:15 UTC` direkt in PostgreSQL aus.
- Die Funktion ist intern: kein Execute fuer `PUBLIC`, `anon`,
  `authenticated` oder `service_role`.
- Laufdetails des eigenen Cron-Jobs werden nach 90 Tagen bereinigt.
- Das Fehlen eines Events bedeutet fachlich `nicht dokumentiert`, nicht sicher
  `vergessen`.

---

## 5. UI-Integration

- IN-Panel mit Progress-Anzeige, Slot-Buttons bei `>1x` und Batch-Footer als CTA-Stack fuer offene Tagesabschnitte.
- TAB-Panel mit Frequenz-/Slot-Editor, `Mit Mahlzeit`, `Startdatum` und Kartenliste.
- Low-Stock-Box sichtbar, wenn Daten vorhanden.

---

## 6. Arzt-Ansicht / Read-Only Views

- Der Range-Arztbericht liest aktive Medication-Stammdaten direkt aus
  `health_medications` und die am einmalig berechneten Wiener Berichtstag
  gueltigen Plaene aus `health_medication_schedule_slots`.
- Der Read ist explizit auf den Report-User begrenzt. Medication- oder Slot-
  Fehler brechen die Report-Erzeugung geschlossen ab, statt eine falsche leere
  Medikation zu persistieren.
- Low-Stock-Box zeigt Arzt-Mail zur Kontaktaufnahme aus dem Profil.
- Profil-Snapshot rendert bereits lesbare Plan-Zusammenfassungen aus `slots[]`.
- Historische Einzel-Einnahmen sind bewusst nur fuer das rollende
  Beobachtungsjahr verfuegbar; es gibt keinen lebenslangen Stock-Audit-Trail.

---

## 7. Fehler- & Diagnoseverhalten

- Typische Fehler: nicht authentifiziert, RPC schlaegt fehl, fehlende Arzt-Mail, ungueltiger Slot-Plan.
- Logging: `[capture:med] refresh/confirm/undo/ack` in `diag`.
- Fallback: Placeholder-Texte, disabled Buttons, kein Silent Failure.
- Fehlende Daten fuehren zu klaren Hinweisen statt stummer Teil-UI.

---

## 8. Events & Integration Points

- Custom Event `medication:changed { reason, dayIso, data }`.
- Intake reagiert im Daily Flow; Profil-Aenderungen aktualisieren Low-Stock-Kontaktpfade und den Push-Routing-Stand.
- `AppModules.medication` exportiert Slot- und Sammel-Helper fuer andere Module.
- Das Push-Modul liest denselben Slot-/Abschnittsvertrag fuer Reminder und spaetere Incidents.

---

## Intent / Voice Integration

- Status:
  - Produktiver lokaler Medikations-Fast-Path ist abschnittsbezogen eingeengt.
- Unterstuetzte Intents:
  - `medication_confirm_section`
- Voice Entry Points:
  - Produktiv ueber Hero-Hub Push-to-talk und den gemeinsamen Intent-Surface.
- Allowed Actions:
  - Keine generische Allowed-Action fuer das Modul.
  - Produktiv existiert ein enger lokaler Spezialpfad fuer `medication_confirm_section`, der ueber `loadMedicationForDay(...)` und `confirmMedicationSection(...)` aufloest.
- Nicht erlaubte Operationen:
  - Kein freier Medikations-Write per Voice.
  - Kein Restock, `set_stock`, Aktivieren/Archivieren oder Loeschen per Voice-Fast-Path.
  - Keine freie Slot-Auswahl, kein globaler Tages-Write und keine Teilmengen-Sprache ausserhalb der vier Abschnitte.
- Hinweise:
  - Low-Stock-Reorder bleibt lokal, guard-railed und UI-confirmed.
  - Voice kann nach erfolgreichem `medication_confirm_section` einen engen ephemeren Low-Stock-Follow-up tragen.
  - Direkte lokale Writes sind nur mit explizitem Abschnitt (`Morgen/Mittag/Abend/Nacht`) erlaubt.

---

## 9. Erweiterungspunkte / Zukunft

- Plan-Editor weiter haerten (`custom`, Start-/Ende-Logik, Edit-Kanten).
- Komfort-Buttons (+28/+56) fuer Bestand.
- Nutzerindividuelle Reminder-Zeitfenster optional.
- Playwright-Szenarien fuer UI-Smokes.

---

## 10. Feature-Flags / Konfiguration

- Derzeit keine dedizierten Flags; Modul deaktivierbar, indem das Script nicht geladen wird.
- Low-Stock-Schwellen bleiben nutzerspezifisch (`low_stock_days`).

---

## 11. QA-Checkliste

- Siehe `docs/qa/intake-medication.md`, insbesondere `IM-006` bis
  `IM-013`. Historische Phasen M-DH und E bleiben unter
  `docs/archive/qa/` erhalten.
- Fokus: `1x`-Fast-Path, `>1x`-Slot-Confirm/Undo, exakter Bestandsabzug,
  Jahres-Retention, Low-Stock Box, TAB CRUD, Kartenaktionen und Logging.

---

## 12. Definition of Done

- Modul laedt ohne Errors.
- `v2`-RPCs und RLS sind aktiv.
- IN/TAB spiegeln Aenderungen unmittelbar.
- Dokumentation, QA, Downstream-Read-Pfade und Push-Vertrag sprechen denselben Slot-/Progress-Vertrag.
