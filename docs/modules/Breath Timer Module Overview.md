# Breath Timer Module - Functional Overview

Kurze Einordnung:
- Zweck: Gefuehrte Atemvorbereitung vor der Blutdruckmessung im Vitals/BP-Panel.
- Rolle innerhalb von MIDAS: Vollbild-Overlay mit ruhigem Atemrhythmus (`3s ein`, `4s aus`) zur standardisierten Vorbereitungsphase.
- Abgrenzung: keine Speicherung medizinischer Messwerte, keine Audio-/Haptik-Ausgabe, kein eigener Persistenz-Store.

Related docs:
- [Capture Module Overview](Capture Module Overview.md)
- [Hub Module Overview](Hub Module Overview.md)
- [CSS Module Overview](CSS Module Overview.md)
- [Bootflow Overview](bootflow overview.md)

---

## 1. Zielsetzung

- Problem: Blutdruckmessung soll nach kurzer, reproduzierbarer Ruhephase erfolgen.
- Nutzer: Patient im Vitals/BP-Flow.
- Nicht Ziel: medizinische Auswertung oder automatische Messwerterfassung.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `app/modules/vitals-stack/vitals/breath-timer.js` | Timer-Engine, UI-State-Flow, Cancel-Confirm, Fade-out, Guards |
| `index.html` | Breath-Startbuttons im BP-Panel + Overlay-Markup (`data-breath-*`) |
| `app/styles/hub.css` | Overlay-Layer, Orb-Visual, Fade-/State-Styles, mobile Lesbarkeit |
| `assets/js/main.js` | BP-Flow-Guards (Save/Context-Block waehrend aktivem Breath-UI) |
| `docs/QA_CHECKS.md` | Breath-Timer Regression-Checkliste (Phase F5) |

---

## 3. Datenmodell / Storage

- Kein Backend-Storage.
- Kein lokaler Persistenzzustand fuer Breath-Timer.
- Laufzeitzustand lebt in-memory in `AppModules.breathTimer`.

---

## 4. Ablauf / Logikfluss

### 4.1 Start
- Nutzer klickt im BP-Panel auf `Atemtimer starten`.
- Overlay zeigt zuerst eine Preset-Auswahl (`3 Minuten` / `5 Minuten`).
- Mit Klick auf ein Preset startet direkt der entsprechende Timer.
- Breath-Overlay wird sichtbar und sperrt Interaktionen im BP-Hintergrund.

### 4.2 Running
- Restzeit (`mm:ss`) laeuft herunter.
- Atemphase alterniert deterministisch:
  - `Einatmen` fuer `3000ms`
  - `Ausatmen` fuer `4000ms`
- Orb-Animation wird ueber CSS-Variablen und phase-basierte Styles synchronisiert.
- Der Orb verwendet einen `fluessig` abgestimmten Material-Look mit:
  - vergroesserter Grundflaeche
  - langsamer `360deg` Rotation
  - phase-gekoppelter Glow-Atmung
  - sanftem Material-Crossfade zwischen `Einatmen` und `Ausatmen`

### 4.3 Abbruch
- 1. Tap auf Overlay: `Nochmal tippen zum Abbrechen` (Confirm-Fenster `2500ms`).
- 2. Tap innerhalb des Fensters: Abbruchstatus + Fade-out.
- Kein 2. Tap: Rueckkehr in Running.

### 4.4 Ende
- Bei Restzeit `<= 0`: Status `Vorbereitung abgeschlossen`.
- Kurze Status-Haltezeit, dann sanfter Fade-out und Rueckkehr auf `idle`.

---

## 5. State Machine

- Kernstates:
  - `idle`
  - `preset_select`
  - `running`
  - `cancel_confirm`
  - `completed`
  - `aborted`
  - `fading_out`
- API:
  - `selectPreset(minutes)`
  - `start()`, `startPreset(minutes)`
  - `stop(reason)`, `reset()`
  - `isUiBlocking()`, `getUiMode()`, `getSnapshot()`

---

## 6. UI-Integration

- Markup-Slots:
  - `data-breath-overlay`
  - `data-breath-time`
  - `data-breath-orb`
  - `data-breath-phase-label`
  - `data-breath-feedback`
- Orb-Visual-Contract:
  - Basis-Orb in `app/styles/hub.css`
  - `::before` und `::after` als weiche Material-Layer fuer inhale/exhale
  - `data-breath-phase="inhale"` blendet den inhale-Layer ueber `3000ms` ein
  - `data-breath-phase="exhale"` blendet den exhale-Layer ueber `4000ms` ein
  - Glow und Material reagieren pro Phase gemeinsam, ohne harten Style-Swap
- Event/Binding:
  - `bindDom(...)` fuer DOM-Zuordnung.
  - `breath:state` als CustomEvent fuer externe Beobachter.
  - `onChange(handler)` fuer interne Subscriber.

---

## 7. Guardrails & Regression-Schutz

- Waehren aktivem Breath-UI (`isUiBlocking()`):
  - BP-Save wird blockiert.
  - `#bpContextSel` Wechsel wird verhindert/rollbacked.
  - Vitals-Tab-Wechsel wird blockiert.
  - Panel-Close fuehrt Hard-Reset aus (kein Timer-Orphan).
- Keine Audio/Haptik.
- Kein Auto-Fokus/kein Pflicht-CTA nach Abschluss.

---

## 8. Fehler- & Diagnoseverhalten

- Engine-Events koennen ueber `breath:state` beobachtet werden.
- Fehler in Listenern brechen den Timer nicht (defensives Catching).
- Guards in `main.js` verhindern BP-Regressionspfade waehrend Overlay-Phasen.

---

## 9. QA / Abnahme

- Automatisierbare Checks:
  - `node --check app/modules/vitals-stack/vitals/breath-timer.js`
  - `node --check assets/js/main.js`
  - Harness-Run mit `S7-BREATH-HARNESS: PASS`
- Manuelle Checks:
  - Mobile/Desktop Positionierung des Startbuttons.
  - Lesbarkeit/Flow bei realem Geraet und frueher Tagesumgebung.
  - Orb-Motion/Rotation auf sichtbaren Loop oder zu harte Materialwechsel pruefen.
  - Phasenkopplung von Glow und Material (`3s` inhale / `4s` exhale) visuell gegenpruefen.

---

## 10. Erweiterungspunkte / Zukunft

- Weitere Orb-Polish-Schritte nur vorsichtig und inkrementell (z. B. Intensitaets-Tuning statt neue Effekt-Layer).
- Optionale medizinische Hinweise (rein UI), ohne Messlogik zu veraendern.
