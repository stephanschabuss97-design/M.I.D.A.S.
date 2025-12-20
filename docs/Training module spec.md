
# Training Module Spec  
**Final Spec & Roadmap**

Dieses Dokument beschreibt das **finale, vollständige Spec Sheet** für das **Aktivitäts- / Trainingsmodul** in MIDAS.  
Der Fokus liegt ausschließlich auf dem Modul selbst: Ziel, Scope, UI, Datenmodell, Logik, APIs, Integration und Roadmap.

Kein Fitness-Tracking.  
Keine Gamification.  
Keine Bewertung.  
Nur medizinisch relevanter Kontext.

---

## 1. Zielsetzung

- **Minimaler Capture-Flow:** Aktivität in wenigen Sekunden erfassen.
- **Bewusst manuell:** Nur bestätigte, echte Muskelaktivität wird gespeichert.
- **Medizinischer Kontext:** Daten dienen Arztansicht, Monatsbericht und Edge-Logiken.
- **Deterministisch & leise:** Keine automatische Interpretation, keine Scores im UI.
- **Zukunftsfähig:** Datenbasis für dynamische Proteinziele, Trendpilot & Reports.
- **Geräteübergreifend:** Vollständig Supabase-basiert.

---

## 2. Scope

### In Scope
- Aktivitäts-Tracking als **medizinisches Event**
- Manuelle Erfassung von:
  - Aktivität (Freitext oder Kategorie)
  - Dauer (Minuten)
  - Datum
- Anzeige in:
  - Capture / Vitals
  - Arztansicht
- Nutzung als Rohdaten für:
  - Dynamic Protein Targets
  - Monatsbericht
  - zukünftige Edge-Functions

### Out of Scope
- Schrittzähler
- Intensitätsmessung
- Kalorienberechnung
- Trainingspläne
- Zielerreichung
- Belohnungen / Badges / Streaks
- Automatische Sport-Erkennung

---

## 3. UI / UX – Capture / Vitals Panel

### 3.1 Einstieg

- Neuer Button im **Vitals / Capture Panel**
  - Label: `Aktivität erfassen`
- Button ist **immer sichtbar**, unabhängig vom Tagesstatus.

---

### 3.2 Activity Capture Dialog

#### Felder

- **Aktivität** (Pflicht)
  - Freitext (`text`)
  - Beispiele:
    - Gym
    - Fußball
    - Krafttraining
    - Wandern
    - Radfahren
- **Dauer (Minuten)** (Pflicht)
  - Number Input
  - Min: `1`
  - Max: frei (kein Hard Limit)
- **Datum**
  - Default: heute
  - Editierbar (z. B. Nachtrag)
- **Notiz** (optional)
  - Freitext
  - Rein dokumentarisch

#### Aktionen
- `Speichern`
- `Abbrechen`

**UX-Prinzip:**  
Eintrag ist **bewusst**, **einmalig**, **nicht spielerisch**.

---

## 4. Datenmodell (Supabase)

### 4.1 Tabelle `health_events` (bestehend)

Das Aktivitätsmodul nutzt die bestehende Event-Struktur.

---

### 4.2 Event-Typ: `activity_event`

#### Pflichtfelder
- `id uuid PK`
- `user_id uuid`
- `type text = 'activity_event'`
- `day date`
- `payload jsonb`
- `created_at timestamptz`

#### Einmaligkeit
- Pro User **max. ein Eintrag pro Tag** (`unique (user_id, day, type)`).

---

### 4.3 Payload Schema (v1)

```json
{
  "activity": "Gym",
  "duration_min": 45,
  "note": "Beine & Rücken"
}
````

**Hinweise:**

* `activity` ist **bewusst Freitext**
* `duration_min` ist Pflicht (>= 1)
* Keine Normalisierung, keine Klassifikation
* Arzt darf interpretieren, MIDAS nicht

---

## 5. Kernlogik

### 5.1 Erfassungsprinzip

* **Eintrag = bewusste Muskelaktivität**
* Kein Eintrag → keine Aktivität
* Max. ein Eintrag pro Tag
* Keine Nachkorrektur durch Logik

---

### 5.2 Änderbarkeit

* Einträge können:

  * gelöscht
  * neu angelegt
* Kein Edit nach Speicherung (v1)

  * verhindert „Nachschleifen“

---

### 5.3 Rolle im System

Aktivitätsdaten sind **Rohdaten** für:

* Dynamische Proteinberechnung
* Arztansicht
* Monatsbericht

**Keine direkte Auswertung im Aktivitätsmodul selbst.**

---

## 6. RPC / API Contracts

### `activity_list(from date, to date)`

Liefert:

* Liste aller `activity_event` im Zeitraum
* Sortiert nach Datum (DESC)

---

### `activity_add(day date, payload jsonb)`

* Insert neuer `activity_event`
* Ownership via RLS
* Kein `user_id` Parameter

---

### `activity_delete(event_id uuid)`

* Löscht Event
* Nur eigener Datensatz

---

## 7. Client-Modul

**Pfad:**
`app/modules/activity/index.js`

### Exports

* `loadActivities(from, to)`
* `addActivity(data)`
* `deleteActivity(id)`

### Events

* `activity:changed`

---

## 8. Integration

### 8.1 Capture / Vitals

* Nach `activity_add`:

  * Dispatch `activity:changed`
  * Optionaler Trigger für Edge-Functions (v2)

---

### 8.2 Arztansicht

* Eigener Abschnitt:

  * Tabelle:

    * Datum
    * Aktivität
    * Dauer
    * Notiz
* Keine Aggregation
* Keine Bewertung
* Zeitraumfilter

---

### 8.3 Monatsbericht

* Aggregation auf Berichtsebene:

  * Anzahl Aktivitäten
  * Gesamtminuten
  * Deskriptive Liste nach Aktivität

---

## 9. Security / RLS

* Zugriff ausschließlich auf `auth.uid()`
* Events strikt usergebunden
* Keine Cross-User-Abfragen
* Keine öffentlichen Views

---

## 10. Fehlerverhalten

* RPC-Fehler → UI unverändert
* Toast + Diagnostics-Log
* Kein Silent-Fail
* Kein automatischer Retry

---

## 11. Roadmap / Phasen

### Phase 0 – SQL

* Nutzung bestehender `health_events`
* Optionaler Index auf `(user_id, type, day)`

---

### Phase 1 – Modul Scaffold

* `app/modules/activity/index.js`
* Read / Write RPCs

---

### Phase 2 – Capture UI

* Activity Dialog
* Save / Cancel
* Event Dispatch

---

### Phase 3 – Arztansicht

* Tabellenansicht
* Zeitraumfilter
* Read-only Darstellung

---

### Phase 4 – Integration

* Hook für Dynamic Protein Targets
* Hook für Monatsbericht

---

### Phase 5 – QA & Docs

* Module Overview
* QA-Checkliste
* Edge-Cases

---

## 12. QA-Checkliste (Auszug)

* Aktivität speichern → erscheint sofort
* Leerer Aktivitätstext → blockiert
* Dauer ≤ 0 → blockiert
* Löschen → sofort entfernt
* Reload → Daten konsistent
* Arztansicht zeigt vollständige Historie
* Monatsbericht-Button erzeugt Vormonat (Europe/Vienna)
* Arzt-Bericht nutzt aktuellen Zeitraum (von/bis)
* Inbox-Filter (Alle/Monatsberichte/Arzt-Berichte) filtert korrekt
* Report-Header zeigt Typ + Zeitraum eindeutig
* Activity-Aggregation im Report: Anzahl + Gesamtminuten + Delta sichtbar

---

## 13. Dateien

### New

* `app/modules/activity/index.js`
* `docs/modules/Activity Module Overview.md`

### Modified

* `app/modules/capture/index.js`
* optionale Styles

```
---

## 14. Implementierungsplan (deterministisch)

### Hauptstep 1: Datenbank/RPCs vorbereiten ✅
1. `health_events` Typ `activity_event` verifizieren (Typ-Whitelist/RLS/Trigger).
2. RPCs anlegen oder erweitern:
   - `activity_add(day, payload)` insert mit RLS.
   - `activity_list(from, to)` select, sortiert nach `day DESC`.
   - `activity_delete(event_id)` delete nur eigener Datensatz.
3. Optionalen Index `(user_id, type, day)` erstellen, falls Query-Last.

### Hauptstep 2: Client-Modul implementieren ✅
1. Datei `app/modules/activity/index.js` anlegen.
2. Funktionen implementieren:
   - `loadActivities(from, to)` ruft `activity_list`.
   - `addActivity(data)` ruft `activity_add`.
   - `deleteActivity(id)` ruft `activity_delete`.
3. Event `activity:changed` dispatchen nach add/delete.
4. Fehlerpfade: Toast + `diag.add`, kein Silent-Fail.

### Hauptstep 3: Capture/Vitals UI integrieren ✅
1. Button `Aktivität erfassen` im Vitals/Capture-Panel platzieren.
2. Dialog/Overlay bauen:
   - Pflichtfelder validieren (Aktivität, Dauer > 0).
   - Datum default heute, editierbar.
3. Speichern-Flow:
   - `addActivity` aufrufen.
   - Dialog schließen, Felder resetten.
   - `activity:changed` auslösen.
4. Abbrechen-Flow: Dialog schließen, keine Änderung.

### Hauptstep 4: Arztansicht ergänzen ✅
1. Liste in Arztansicht integrieren (Datum, Aktivität, Dauer, Notiz).
2. Zeitraumfilter an `activity_list` anbinden.
3. Read-only Darstellung ohne Aggregation.

### Hauptstep 5: Monatsbericht/Integration 
1. Monatsbericht (Jour fixe) festlegen:
   - Vormonat (Europe/Vienna) als fixer Zeitraum.
   - Report-Typ kennzeichnen (`monthly_report`).
2. Zeitraum-Bericht (Arzt-Bericht) definieren:
   - Nutzt explizit gewaehlten Range.
   - Report-Typ kennzeichnen (`range_report`).
3. Edge-Function-Logik deterministisch splitten:
   - Monatsbericht ignoriert Range-Inputs und nutzt Vormonat.
   - Arzt-Bericht nutzt Range-Inputs ohne Monats-Override.
4. Inbox-UI erweitern:
   - Button fuer Monatsbericht + Button fuer Arzt-Bericht.
   - Filter (Alle / Monatsberichte / Arzt-Berichte) oberhalb der Liste.
5. Report-Header standardisieren:
   - Monatsbericht: "Monatsbericht · Monat Jahr" + Zeitraum.
   - Arzt-Bericht: "Arzt-Bericht · Zeitraum" + Zeitraum.
6. Activity-Aggregation erweitern:
   - Anzahl Eintraege, Gesamtminuten, Vergleich zum Vormonat (Delta).
7. Optional: Hooks fuer Dynamic Protein Targets definieren (v2), sobald Proteinrechner integriert ist.

### Hauptstep 6: QA & Doku
1. QA-Checkliste vollständig gegen UI/Flows testen.
2. `docs/modules/Activity Module Overview.md` ergänzen.
3. Spec aktualisieren, falls Abweichungen entstanden sind.
