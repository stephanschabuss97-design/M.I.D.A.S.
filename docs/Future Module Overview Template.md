Future Module Overview Template

# <Module Name> – Functional Overview

Kurze Einordnung:
- Zweck des Moduls
- Rolle innerhalb von MIDAS
- Abgrenzung zu anderen Modulen

---

## 1. Zielsetzung

- Welches Problem löst das Modul?
- Für wen (User / Arzt / System)?
- Was ist explizit **nicht** Ziel dieses Moduls?

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/<module>/index.js` | Orchestrierung / Public API |
| `app/modules/<module>/...` | Sublogik (Berechnung, UI, Helpers) |
| `app/supabase/api/...` | Supabase API / RPC Wrapper |
| `assets/js/...` | Hooks / Event-Integration |
| `app/styles/...` | Modul-spezifische Styles |
| `sql/..` | Zugehörige SQL / Views / RPCs |
| `docs/...` | Weiterführende Doku / Roadmaps |

---

## 3. Datenmodell / Storage

- Verwendete Tabellen
- Zentrale Felder (Kurzüberblick)
- Beziehungen zu anderen Tabellen
- Besonderheiten (Constraints, JSON Payloads, Flags)

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- Wann wird das Modul geladen?
- Feature-Flag oder immer aktiv?
- Abhängigkeiten zu Auth / State

### 4.2 User-Trigger
- Welche User-Aktionen starten Logik?
- Buttons / Saves / Hooks

### 4.3 Verarbeitung
- Zentrale Berechnungen
- Validierungen
- Zustandsänderungen

### 4.4 Persistenz
- Welche Daten werden gespeichert?
- Insert / Update / Upsert
- Zeitpunkt der Speicherung

---

## 5. UI-Integration

- Wo erscheint das Modul?
- Welche Views / Tabs / Panels?
- Dynamische UI-Elemente
- Sichtbarkeit (wann sichtbar / wann nicht)

---

## 6. Arzt-Ansicht / Read-Only Views

- Welche Informationen sind für Ärzt:innen relevant?
- Darstellung (Listen, Pills, Charts, Summary)
- Filter / Zeiträume

---

## 7. Fehler- & Diagnoseverhalten

- Typische Fehlerquellen
- Logging (`diag.add`, console, Toasts)
- Fallback-Verhalten
- Was passiert bei fehlenden Daten?

---

## 8. Events & Integration Points

- Custom Events (`module:changed`)
- Abhängigkeiten zu anderen Modulen
- Reaktion auf externe Events (z. B. Date-Change)

---

## 9. Erweiterungspunkte / Zukunft

- Was ist bewusst offen gehalten?
- Wo kann das Modul erweitert werden?
- Welche Felder / APIs sind vorbereitet?

---

## 10. Feature-Flags / Konfiguration

- Flags (falls vorhanden)
- Default-Werte
- Debug-Optionen

---

## 11. QA-Checkliste

- Kernfunktion getestet?
- Edge-Cases geprüft?
- UI synchron?
- Daten konsistent?

---

## 12. Definition of Done

- Modul lädt fehlerfrei
- Keine offenen Logs / Errors
- Dokumentation aktuell
- Integration getestet
