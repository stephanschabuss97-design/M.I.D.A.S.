# Hydration Target Module - Functional Overview

Kurze Einordnung:
- Zweck: ruhiger, zeitbasierter Referenzwert fuer einen sinnvollen Trinkverlauf direkt im Hub-Dashboard.
- Rolle innerhalb von MIDAS: liefert eine lokale Orientierung `wo sollte ich ungefaehr stehen`, ohne Bewertungs- oder Reminder-Charakter.
- Abgrenzung: kein Intake-Istwert, keine medizinische Regel, kein Reminder, kein Incident, keine Persistenz.

Related docs:
- [Hub Module Overview](Hub Module Overview.md)
- [Intake Module Overview](Intake Module Overview.md)

---

## 1. Zielsetzung

- Problem: Der Nutzer soll im Dashboard auf einen Blick sehen, wo ein sinnvoller Wasserstand im Tagesverlauf ungefaehr liegen koennte, ohne erst das Intake-Panel oeffnen zu muessen.
- Nutzer: Patient.
- Nicht Ziel: Defizitlogik, Warnung, medizinische Bewertung oder sanfte Push-/Reminder-Steuerung in `V1`.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/hub/index.js` | gekapselter Hydration-Helper, Dashboard-Render und leichter Refresh-Takt |
| `index.html` | Dashboard-Pill `WASSER-SOLL` im bestehenden Pill-Block |
| `app/styles/hub.css` | traegt den zusaetzlichen Pill-Eintrag ueber den bestehenden Hub-/Assistant-Pill-Vertrag |
| `docs/QA_CHECKS.md` | spaetere Smokechecks fuer Hydration Target |

---

## 3. Datenmodell / Storage

- Kein eigenes Storage.
- Keine Persistenz.
- Keine Backend-Tabelle.
- Keine Supabase-Abhaengigkeit.
- Source of Truth ist lokal:
  - feste Stuetzpunkt-Tabelle
  - lokale Geraetezeit

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- Das Feature lebt im Hub-Kontext.
- Beim Setup des Hub-Dashboards wird der `WASSER-SOLL`-Pill-Ref aufgebaut.
- Der lokale Hydration-Helper steht im Hub als gekapselte Berechnungsfunktion bereit.

### 4.2 User-/Runtime-Trigger
- Dashboard-Open
- normale Intake-Refreshes
- `visibilitychange -> visible`
- leichter Minutentakt waehrend offenem Dashboard

### 4.3 Verarbeitung
- `V1` basiert auf einem persoenlichen Referenzwert:
  - Tagesziel `2000 ml`
  - Start `07:00`
  - Ziel erreicht `19:30`
- Vor `07:00`:
  - `0 ml`
- Ab `19:30`:
  - `2000 ml`
- Dazwischen:
  - feste Stuetzpunkt-Tabelle
  - lineare Interpolation nur zwischen benachbarten Stuetzpunkten
  - keine zusaetzliche Glaettung
- Ausgabe:
  - ganze `ml`

### 4.4 Persistenz
- Keine Persistenz.
- Der Wert wird bei Bedarf neu berechnet.

---

## 5. UI-Integration

- Platzierung:
  - im bestehenden Dashboard-Pill-Block `#hubDashboardIntakePills`
  - direkt nach `WASSER`
  - vor `SALZ`
- Darstellung:
  - normale `assistant-pill`
  - Label `Wasser-Soll`
  - Wert in `ml`
- Ausdruecklich nicht Teil von `V1`:
  - Balken
  - Ampel
  - Sekundaertext
  - Delta zum Ist-Wert

---

## 6. Arzt-Ansicht / Read-Only Views

- Keine eigene Arztansicht.
- Kein Report-Feld.
- Kein Export-Feld.
- Das Feature ist bewusst nur ein lokaler Dashboard-Orientierungswert.

---

## 7. Fehler- & Diagnoseverhalten

- Das Feature soll auch ohne Intake-Snapshot stabil bleiben, weil der Sollwert rein zeitbasiert ist.
- Fehler wuerden lokal im Hub-Kontext bleiben und duerfen keinen harten User-Error erzeugen.
- Kein eigener Diagnose- oder Toast-Pfad fuer `V1`.

---

## 8. Events & Integration Points

- Konsumiert den bestehenden Hub-/Assistant-Refresh-Kontext fuer Dashboard-Aktualisierung.
- Nutzt keine eigenen Custom Events.
- Haengt fachlich neben dem Wasser-Istwert, bleibt aber technisch ein eigener lokaler Referenzpfad.

---

## 9. Erweiterungspunkte / Zukunft

- Konfigurierbares Tagesziel statt hart codierter `2000 ml`.
- Personalisierbare Start-/Endzeit.
- Moegliche `V2` als Grundlage fuer sehr sanfte Trinkhinweise.
- Assistant-Bezug oder spaetere Text-Einordnung, falls gewuenscht.

---

## 10. Feature-Flags / Konfiguration

- Keine dedizierten Feature-Flags in `V1`.
- Tagesziel und Stuetzpunkte sind aktuell bewusst fest im lokalen Helper definiert.

---

## 11. Status / Dependencies / Risks

- Status: aktiv, lokal im Hub-Dashboard.
- Dependencies (hard):
  - Hub-Dashboard
  - lokaler Hub-Refresh-Pfad
- Dependencies (soft):
  - Wasser-Istwert im Dashboard als inhaltlicher Nachbar
- Known risks:
  - zu mathematische Wirkung, wenn der Tabellencharakter spaeter aufgeweicht wird
  - unbeabsichtigte Wertung durch spaetere UI-Ausbauten
  - Drift, falls spaeter Reminder-Logik auf derselben Basis entsteht, ohne den `V1`-Charakter sauber zu bewahren

---

## 12. QA-Checkliste

- `WASSER-SOLL` sitzt direkt nach `WASSER` im bestehenden Pill-Block.
- Vor `07:00` zeigt der Wert `0 ml`.
- Um `19:30` zeigt der Wert `2000 ml`.
- Zwischenwerte folgen der Stuetzpunkt-Tabelle ohne Spruenge.
- Das Dashboard bleibt auf Desktop und Mobile ruhig und ohne Layoutbruch.
- Keine Warntexte, Farben oder Reminder-Nebenwirkungen entstehen.

---

## 13. Definition of Done

- Das Dashboard zeigt `WASSER-SOLL` als ruhigen lokalen Orientierungseintrag.
- Berechnungslogik, UI und Doku sprechen denselben Vertrag.
- Das Feature bleibt rein lokal, ohne Persistenz und ohne Reminder-/Incident-Charakter.
