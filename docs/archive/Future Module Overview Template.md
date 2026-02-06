Future Module Overview Template

# <Module Name> â€“ Functional Overview

Kurze Einordnung:
- Zweck des Moduls
- Rolle innerhalb von MIDAS
- Abgrenzung zu anderen Modulen

---

## 1. Zielsetzung

- Welches Problem lÃ¶st das Modul?
- FÃ¼r wen (User / Arzt / System)?
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
| `sql/..` | ZugehÃ¶rige SQL / Views / RPCs |
| `docs/...` | WeiterfÃ¼hrende Doku / Roadmaps |

---

## 3. Datenmodell / Storage

- Verwendete Tabellen
- Zentrale Felder (KurzÃ¼berblick)
- Beziehungen zu anderen Tabellen
- Besonderheiten (Constraints, JSON Payloads, Flags)

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- Wann wird das Modul geladen?
- Feature-Flag oder immer aktiv?
- AbhÃ¤ngigkeiten zu Auth / State

### 4.2 User-Trigger
- Welche User-Aktionen starten Logik?
- Buttons / Saves / Hooks

### 4.3 Verarbeitung
- Zentrale Berechnungen
- Validierungen
- ZustandsÃ¤nderungen

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

- Welche Informationen sind fÃ¼r Ã„rzt:innen relevant?
- Darstellung (Listen, Pills, Charts, Summary)
- Filter / ZeitrÃ¤ume

---

## 7. Fehler- & Diagnoseverhalten

- Typische Fehlerquellen
- Logging (`diag.add`, console, Toasts)
- Fallback-Verhalten
- Was passiert bei fehlenden Daten?

---

## 8. Events & Integration Points

- Public API / Entry Points:
- Source of Truth:
- Side Effects:
- Constraints:
- Custom Events (`module:changed`)
- AbhÃ¤ngigkeiten zu anderen Modulen
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

## 11. Status / Dependencies / Risks

- Status:
- Dependencies (hard):
- Dependencies (soft):
- Known issues / risks:
- Backend / SQL / Edge:

---

## 12. QA-Checkliste

- Kernfunktion getestet?
- Edge-Cases geprÃ¼ft?
- UI synchron?
- Daten konsistent?

---

## 13. Definition of Done

- Modul lÃ¤dt fehlerfrei
- Keine offenen Logs / Errors
- Dokumentation aktuell
- Integration getestet

