# MIDAS

Medical Incidents (and) Data Analysis Software

MIDAS ist keine generische Health-App und kein offenes Multi-User-Produkt. MIDAS ist eine persoenliche, single-user PWA fuer meinen eigenen medizinischen Alltag: Tageserfassung, Intake-Steuerung, Medikamentenflow, Incident-Pushes, Arztansicht, Reports und eine eng gefuehrte Assistant-/Voice-Oberflaeche.

Wichtiger noch: MIDAS ist kein Hobby-Tracker, sondern mein persoenliches Gesundheits-Betriebssystem. Es existiert, um alltagsrelevante medizinische Verantwortung in ein belastbares, reibungsarmes System zu uebersetzen: weniger vergessen, weniger Drift, weniger Kopfchaos, mehr Klarheit und bessere Umsetzbarkeit im echten Leben.

Diese README ist absichtlich nicht wie eine klassische Open-Source-README geschrieben. Sie ist die zentrale Einstiegskarte fuer:

- mich als Betreiber und einzigen Nutzer
- spaetere Coding-Agents / LLMs
- punktuelle technische Wartung

Die Detailquelle fuer einzelne Bereiche bleibt `docs/modules/*.md`. Die README erklaert das Produkt, die Leitplanken und die Systemkarte.

## Wer bin ich?

Ich bin Stephan. Der Erbauer von MIDAS.
Ich wohne in Tirol in Axams
Ich bin am 15.04.1982 geboren
MIDAS wurde gebaut da ich im Jänner 2025 mit einer CKD diagnostiziert wurde.
Ich habe keine Erfahrung in Sachen Syntax, arbeite aber mit Roadmaps die wir beide zusammen erstellen
MIDAS hab ich als Lebensapp gebaut, sprich es soll mich auch mit 70, 80 und wenn möglich bis über 90 begleiten
Ich verwende in Gesprchen mit einer KI gerne "Bro" als Ansprache an dich, ich erwarte mir dennoch eine fachliche gute Kommunikation
Zukuenftige Chats duerfen mich gerne beim Namen Stephan nennen. Eine persoenlichere Ansprache ist willkommen, solange die fachliche Qualitaet hoch bleibt.
Du darfst mich gerne duzen und ich erwarte mir von dir die Rolle eines begleitenden Developer. Stell dir eine Mischung aus Support, Thinktank und SeniorDev vor.
Am Projekt MIDAS wurde am 10.08.2025 gestartet.
Ich arbeite beruflich in einer Pharmafirma und bin dort fuer die Qualifizierung von Geraeten sowie fuer Software-Validierung zustaendig. Das praegt auch meinen Blick auf meine Projekte: Reproduzierbarkeit, Guardrails, klare Systemgrenzen und belastbares Verhalten sind fuer mich keine Nebensache.

---

## Produktstatus auf einen Blick

| Thema | Stand |
|------|------|
| Nutzerbild | genau 1 Nutzer: ich |
| Produktkern | persoenliches Gesundheits-Betriebssystem fuer meinen CKD-Alltag |
| Produktstatus | produktiv im eigenen Alltag |
| Plattform | Browser-first PWA mit minimalem nativen Android-Node |
| Frontend | statisches HTML/CSS/JS ohne Build-Step |
| Backend | Supabase Auth / DB / Realtime / Edge Functions |
| Voice | Voice V1 produktiv, command-first |
| Push | lokale und remote Incident-Pushes aktiv |
| Android Node | Homescreen-Widget + minimale Launcher-/Sync-Huelle aktiv, nativer OAuth-/Deep-Link-Pfad integriert |
| Arztmodus | Read-only Uebersicht + Reports aktiv |
| Modul-Doku | `docs/modules/*.md` ist Source of Truth |

---

## Warum MIDAS existiert

MIDAS ist aus einer realen gesundheitlichen Notwendigkeit entstanden. Ausgangspunkt war meine CKD-Einordnung Anfang 2025 und die daraus folgende Anforderung, meinen Alltag nicht nur rueckblickend zu dokumentieren, sondern aktiv und verlaesslich zu steuern. Es ging damit nicht mehr nur um "gesund leben" als vages Ideal, sondern um konkrete, wiederkehrende Alltagsfragen:

- Habe ich heute meine Medikation genommen?
- Bin ich bei Wasser, Salz und Protein noch im sinnvollen Bereich?
- Fehlt ein relevanter Wert oder ein wichtiger Tagesabschluss?
- Was soll bei einem Arzttermin nicht untergehen?
- Wie halte ich medizinisch sinnvolle Routinen stabil, ohne daraus einen zweiten Vollzeitjob zu machen?

Genau daraus ist MIDAS entstanden.

MIDAS ist fuer mich kein Tracker im klassischen Sinn. Es ist ein Umsetzungswerkzeug. Das Ziel ist nicht Datensammlung um ihrer selbst willen, sondern alltagstaugliche Adhaerenz, Uebersicht und Reibungsreduktion. MIDAS soll mir nicht nur sagen, was war, sondern mir helfen, das Richtige im Alltag konsistent umzusetzen.

Wichtig ist dabei auch mein reales Nutzungsverhalten: MIDAS ist nicht auf lueckenloses Mikrologging bis in jede Kleinigkeit des Abends ausgelegt. Das gilt vor allem fuer Intake-orientierte Tagessteuerung wie Wasser sowie Teile von Salz und Protein. Der praktisch wichtigste Nutzen entsteht dort oft bis zum Nachmittag oder nach dem Mittagessen, wenn eine belastbare Zwischenbilanz fuer Wasser, Salz, Protein, Medikation und Tageslage steht. Abendliches Nachtracking ist moeglich, aber nicht der Kern dieses Intake-Pfads. MIDAS soll hier rechtzeitig Klarheit schaffen, nicht jeden spaeten Snack des Tages kontrollieren.

In der Praxis bedeutet das meist:

- aktive Nutzung vor allem vom Morgen bis etwa `14:00-15:00`
- Fokus auf Fruehstueck, Mittagessen, grobe Intake-Zwischenbilanz und Medikationsstatus
- Nutzung als Tageskompass und Kalibrierung fuer den restlichen Tag, nicht als Vollzeit-Tracking
- nachmittags und abends deutlich weniger aktive Eingabe; dort tragen Routine, Erfahrung und Gefuehl mehr als konsequentes Nachloggen
- Sichtbarkeit und "at a glance"-Orientierung sind oft wertvoller als tiefe Interaktion oder formale Vollstaendigkeit
- Wasser ist dabei eher eine grobe Fuehrungsgroesse, waehrend Salz und Protein trotz Schaetzung fachlich oft relevanter bleiben

Diese Aussage darf nicht falsch verallgemeinert werden: Sie beschreibt primaer den Intake-/Tageskalibrierungs-Charakter von MIDAS. Andere Kernpfade der App werden weiterhin normal und konsequent genutzt, auch unabhaengig von der Uhrzeit, z. B. Abend-BP, Koerperdaten, Termine, Reports oder andere relevante Tagesabschluesse.

Diese Nutzungswahrheit soll kuenftige Produktentscheidungen aktiv begrenzen: Features, die lueckenlose Abendbuchhaltung voraussetzen oder taeglich hohe Eingabefriktion erzeugen, passen eher nicht zu MIDAS als System.

Die App ist deshalb bewusst eng geschnitten. Sie konzentriert sich auf genau die Dinge, die in meinem realen Alltag relevant sind: Intake, Medikationsfluss, Blutdruck, Incidents, Arztkontext, Reports und gefuehrte Interaktion ueber Text und Voice. Nicht maximal viele Features, sondern moeglichst wenig Drift zwischen medizinischer Absicht und taeglicher Umsetzung.

Nach meinem bisherigen Verlauf hat mich dieses System real unterstuetzt: durch bessere Routine, klarere Tagessteuerung, weniger kognitive Last und bessere Vorbereitung fuer Arztkontakte. Parallel dazu haben sich unter Therapie, Lebensstilanpassung und konsequenterem Selbstmanagement Verlauf und nephrologische Befunde stabilisiert bzw. verbessert. Besonders Intake und Assistant haben mir geholfen, Adhaerenz, Ernaehrungsalltag und Tagesroutine verlaesslicher umzusetzen.

Diese Produktrealitaet ist wichtig: MIDAS ist kein Showcase, kein Demo-Stack und kein hypothetisches Startup-Produkt. Die App existiert, weil ich sie selbst brauche.

---

## Die eigentliche Produktwahrheit

MIDAS ist Software aus Selbstverantwortung.

Ich habe MIDAS nicht gebaut, um Gesundheitsdaten zu sammeln, sondern um einen komplexen, medizinisch relevanten Alltag in eine Form zu bringen, die tragfaehig bleibt: klar, schnell, nachvollziehbar und mit moeglichst wenig Reibung. MIDAS soll Denken nicht ersetzen, sondern entlasten. Es soll nicht medizinische Entscheidungen simulieren, sondern helfen, gute Gewohnheiten, Arztkontext und relevante Tagessignale sauber zusammenzuhalten.

MIDAS ist auch Ausdruck meiner grundsaetzlichen Arbeitsweise: komplexe Realitaet nicht zu romantisieren, sondern in klare, tragfaehige Systeme zu uebersetzen. Ich baue lieber ein belastbares Werkzeug fuer den echten Alltag als eine beeindruckende, aber instabile Feature-Sammlung.

Wenn eine neue Idee beeindruckend wirkt, aber meinen echten Alltag nicht einfacher, sicherer oder klarer macht, dann passt sie wahrscheinlich nicht zu MIDAS.

---

## Was MIDAS heute ist

MIDAS ist heute ein eng geschnittenes persoenliches Gesundheits-Betriebssystem mit diesen produktiven Schwerpunkten:

- Hub als zentraler Einstieg fuer Navigation, Dashboard, Panels und Voice
- Hub-Dashboard mit lokaler Hydration-Orientierung (`WASSER-SOLL`) als ruhigem Referenzwert
- Tageserfassung fuer BP, Body, Lab und Aktivitaet
- Intake fuer Wasser, Salz, Protein und taegliche Medikationsbestaetigung
- Medication-Verwaltung mit Low-Stock-Hinweisen
- Assistant in Textform mit lokalem Intent-Fast-Path und LLM-Fallback
- Voice V1 als command-first Oberflaeche auf demselben Intent-Kern
- Trendpilot fuer mittelfristige Trends und kontextuelle Warnhinweise
- Incident-Pushes nur fuer echte Ereignisse wie offene Medikation oder fehlende Abend-BP
- Arztmodus mit Read-only Zeitraumssicht, Reports-Inbox und Export
- Profilkontext fuer Limits, Hausarztkontakt und persoenliche Parameter
- minimale native Android-Huelle als Widget-/Launcher-Node fuer passive Homescreen-Sichtbarkeit inkl. nativer OAuth-Aktivierung fuer Widget und Shell

---

## Was MIDAS bewusst nicht ist

- kein Multi-User-System
- kein Patientenportal fuer andere Personen
- kein Arzt-Workflow-System
- kein allgemeiner Wellness- oder Lifestyle-Reminder
- keine offene KI fuer freie medizinische Beratung
- keine vollwertige native Mobile-App als Ersatz fuer MIDAS
- kein SaaS-Produkt mit Rollen, Mandanten oder Teamverwaltung

Mehrfach-Pushes, Eskalationsketten, Gamification und breite generische "Health App"-Features sind bewusst nicht das Ziel.

Wichtig:

- Eine kleine native Android-Huelle als Widget-/Launcher-Node ist zulaessig.
- Sie ersetzt MIDAS nicht, verlagert keine Fachlogik und bleibt bewusst eine schmale Surface fuer Homescreen-Sichtbarkeit und Ruecksprung in die PWA.

---

## Produktprinzipien

Diese Prinzipien sind absichtlich hart formuliert. Sie sollen kuenftige Produkt- und Codeentscheidungen begrenzen.

1. Single-user ist keine Zwischenstufe.
   MIDAS wird nicht auf Multi-User generalisiert, wenn es dafuer keinen existenziellen Grund gibt.

2. Alltagstauglichkeit ist wichtiger als Feature-Breite.
   MIDAS soll im echten Leben helfen, nicht in einer Produktdemo beeindrucken. Wenn eine neue Idee den taeglichen Kernfluss vernebelt, mehr Pflegeaufwand erzeugt oder die kognitive Last erhoeht, ist sie wahrscheinlich falsch.

3. Orientierung vor Vollstaendigkeit.
   MIDAS ist besonders im Intake-Bereich primaer ein Tageskompass und Kalibrierungswerkzeug, nicht ein System fuer lueckenlose Abendbuchhaltung. Fruehe Klarheit, geringe Friktion und sichtbare Zwischenstaende sind dort fuer den realen Nutzen oft wichtiger als vollstaendige Datensammlung. Diese Logik gilt nicht pauschal fuer alle App-Bereiche; Pflichtpfade wie relevante Abendwerte oder andere Kernereignisse bleiben normale, konsequente MIDAS-Nutzung.

4. Deterministische lokale Pfade zuerst.
   Besonders im Assistant-/Voice-Bereich sollen haeufige Alltagsaktionen lokal, schnell und guard-railed geloest werden. Das LLM ist Interpretations- und Fallback-Schicht, nicht primaerer Steuerpfad fuer wiederkehrende Kernaufgaben.

5. Push nur bei echten Incidents.
   MIDAS darf nicht in Reminder-Laerm kippen. Pushes sind Schutznetz, nicht Dauerberieselung.

6. Arztmodus ist read-only orientiert.
   Die Doctor View dient Uebersicht, Export und Berichten, nicht der taeglichen Dateneingabe.

7. Modulgrenzen sind ernst gemeint.
   Hub orchestriert. Capture schreibt. Doctor liest. Push entscheidet nicht fachlich. Profile liefert Kontext. Diese Grenzen sollen erhalten bleiben.

---

## Aktuelle Produktoberflaeche

### 1. Hub

Der Hub ist der zentrale Einstieg in MIDAS. Er orchestriert:

- Carousel / Orbit Navigation
- obere Dashboard-Reveal-Flaeche
- Quickbar
- Panel-Oeffnung
- Assistant-Textfluss
- Voice-Gate und Voice-State
- Pending-Context-Resolver fuer Confirm-Flows

Der Hub ist bewusst keine Fachlogik-Zentrale. Er ist Orchestrator, nicht Source of Truth fuer Gesundheitsdaten.

### 2. Capture

Capture ist die taegliche Erfassungsflaeche fuer:

- Blutdruck Morgen / Abend
- Koerperwerte
- Laborwerte
- Aktivitaet / Training

Diese Datenbasis speist Doctor View, Reports, Trendpilot und Teile des Assistant-Kontexts.

### 3. Intake und Medication

Das Intake-Modul ist einer der praktisch wichtigsten Teile von MIDAS. Es verbindet:

- Wasser
- Salz
- Protein
- taegliche Medikationsbestaetigung
- Low-Stock-Warnungen

Medication ist kein isoliertes CRUD-Modul, sondern in den Tagesflow eingebettet. Genau dieser Zuschnitt ist fuer meinen realen Nutzen zentral.

### 4. Assistant und Voice

MIDAS hat keinen "AI-first" Charakter. Der Assistant ist absichtlich eng gefuehrt:

- lokale Intents zuerst
- bestaetigte Allowed Actions
- Pending-Context-Guards fuer Confirms
- LLM-Fallback nur fuer freie Sprache

Voice V1 nutzt denselben fachlichen Kern wie Text. Ziel ist nicht freie Unterhaltung, sondern schnelle, belastbare Alltagskommandos.

### 5. Doctor View und Reports

Die Arztansicht konsolidiert Zeitraumdaten read-only und bildet die Bruecke zu:

- Zeitraumssichten fuer BP / Body / Lab / Training
- Trendpilot-Eintraegen
- Monatsbericht
- Arztbericht fuer explizite Ranges
- Export / Inbox-Verwaltung

### 6. Trendpilot und Incidents

MIDAS unterscheidet bewusst zwischen:

- Trendpilot: mittel- bis langfristige Muster und Warnhinweise
- Incidents / Push: akute Alltagsversaeumnisse, die nicht untergehen sollen

Trendpilot ist keine Diagnostik. Incidents sind keine Reminder-Kette.

---

## Architektur in Kurzform

MIDAS ist ein browser-first System ohne Build-Step. Die Architektur laesst sich in wenigen Schichten lesen:

1. `index.html` + `app/styles/*`
   UI-Flaechen, Panels, Hub-Slots, Overlay-Struktur

2. `app/modules/*`
   Produktmodule und fachnahe UI-Logik

3. `app/core/*`
   Boot, Konfiguration, PWA, Diagnostics, Shared Helpers

4. `app/supabase/*`
   Auth, API, Realtime, Core-Client

5. `sql/*`
   Datenmodell, Tabellen, Views, RPCs, Policies

6. `service-worker.js` + `.github/workflows/*`
   PWA-Flaeche, Caching, Push, Scheduler-Anbindung

Wichtige Architekturentscheidung: MIDAS ist nicht als SPA mit Build-Pipeline aufgesetzt. Es ist eine direkte, modulare Browser-Anwendung mit enger Kopplung an ihren realen Nutzkontext.

---

## Daten- und Betriebsmodell

MIDAS arbeitet je nach Bereich mit unterschiedlichen Datenquellen. Auf hoher Ebene gilt:

- `health_events` ist der zentrale Event-Speicher fuer BP, Body, Lab, Activity und report-nahe Eintraege
- `user_profile` liefert persoenlichen Kontext, Limits und Hausarztkontakt
- `trendpilot_events` und `trendpilot_state` tragen Trendpilot
- `push_subscriptions` verwaltet Web-Push-Abos
- bestimmte Incident- und UI-States leben nur im Speicher, bewusst ohne Persistenz

Supabase ist heute fuer die meisten produktiven Datenpfade der zentrale Backend-Layer. Browserseitige Laufzeit- und Fallback-States existieren weiterhin, aber MIDAS ist nicht mehr treffend als "nur lokaler Gesundheits-Logger" beschrieben.

---

## Modulkarte

### Primaere Produktmodule

| Modul | Zweck | Hauptdatei | Overview |
|------|------|------|------|
| Hub | zentraler Einstieg, Navigation, Dashboard, Voice-Gate | `app/modules/hub/index.js` | [`docs/modules/Hub Module Overview.md`](docs/modules/Hub%20Module%20Overview.md) |
| Capture | Tageserfassung fuer BP, Body, Lab, Aktivitaet | `app/modules/vitals-stack/vitals/index.js` | [`docs/modules/Capture Module Overview.md`](docs/modules/Capture%20Module%20Overview.md) |
| Intake | Wasser, Salz, Protein, Tages-Medikationsflow | `app/modules/intake-stack/intake/index.js` | [`docs/modules/Intake Module Overview.md`](docs/modules/Intake%20Module%20Overview.md) |
| Medication | Medikamentenverwaltung, Tagesstatus, Low-Stock | `app/modules/intake-stack/medication/index.js` | [`docs/modules/Medication Module Overview.md`](docs/modules/Medication%20Module%20Overview.md) |
| Assistant | Text-Assistant, lokale Actions, LLM-Fallback | `app/modules/assistant-stack/assistant/index.js` | [`docs/modules/Assistant Module Overview.md`](docs/modules/Assistant%20Module%20Overview.md) |
| Intent Engine | Intent-Surface fuer Text und Voice | `app/modules/assistant-stack/intent/index.js` | [`docs/modules/Intent Engine Module Overview.md`](docs/modules/Intent%20Engine%20Module%20Overview.md) |
| Profile | Limits, Hausarztkontakt, Personenparameter | `app/modules/profile/index.js` | [`docs/modules/Profile Module Overview.md`](docs/modules/Profile%20Module%20Overview.md) |
| Push / Incidents | Incident-Logik und Push-Transport | `app/modules/incidents/index.js` | [`docs/modules/Push Module Overview.md`](docs/modules/Push%20Module%20Overview.md) |
| Doctor View | Zeitraumssicht, Read-only Konsolidierung | `app/modules/doctor-stack/doctor/index.js` | [`docs/modules/Doctor View Module Overview.md`](docs/modules/Doctor%20View%20Module%20Overview.md) |
| Reports | Monats- und Arztberichte | `app/modules/doctor-stack/reports/index.js` | [`docs/modules/Reports Module Overview.md`](docs/modules/Reports%20Module%20Overview.md) |
| Trendpilot | Wochenfenster, Trends, Warnhinweise | `app/modules/vitals-stack/trendpilot/index.js` | [`docs/modules/Trendpilot Module Overview.md`](docs/modules/Trendpilot%20Module%20Overview.md) |

### Unterstuetzende Module und Infrastruktur

| Bereich | Zweck | Overview |
|------|------|------|
| Hydration Target | lokaler Dashboard-Referenzwert fuer `WASSER-SOLL` | [`docs/modules/Hydration Target Module Overview.md`](docs/modules/Hydration%20Target%20Module%20Overview.md) |
| Auth | Login, Session, Doctor-Unlock | [`docs/modules/Auth Module Overview.md`](docs/modules/Auth%20Module%20Overview.md) |
| Supabase Core | einheitlicher API-/Auth-/Realtime-Einstieg | [`docs/modules/Supabase Core Overview.md`](docs/modules/Supabase%20Core%20Overview.md) |
| Charts | Visualisierung fuer Arztansicht und Trends | [`docs/modules/Charts Module Overview.md`](docs/modules/Charts%20Module%20Overview.md) |
| Diagnostics | Logs, Perf, Diagnoseflaechen | [`docs/modules/Diagnostics Module Overview.md`](docs/modules/Diagnostics%20Module%20Overview.md) |
| VAD | Sprachsegment-Ende fuer Voice V1 | [`docs/modules/VAD Module Overview.md`](docs/modules/VAD%20Module%20Overview.md) |
| Appointments | Terminverwaltung und Tageskontext | [`docs/modules/Appointments Module Overview.md`](docs/modules/Appointments%20Module%20Overview.md) |
| Breath Timer | Messvorbereitung vor BP | [`docs/modules/Breath Timer Module Overview.md`](docs/modules/Breath%20Timer%20Module%20Overview.md) |
| State Layer | globale Zustandsmuster / Basiskontext | [`docs/modules/State Layer Overview.md`](docs/modules/State%20Layer%20Overview.md) |
| Bootflow | Start- und Initialisierungssequenz | [`docs/modules/bootflow overview.md`](docs/modules/bootflow%20overview.md) |
| Android Widget | nativer Android-Node fuer Homescreen-Snapshot, Sync und minimalen Launcher | [`docs/modules/Android Widget Module Overview.md`](docs/modules/Android%20Widget%20Module%20Overview.md) |

---

## Dokumentationshierarchie

Wenn README und Modul-Overview sich widersprechen, gilt in der Regel:

1. `docs/modules/*.md`
2. Laufender Code
3. README
4. `docs/archive/*.md`

`docs/archive` enthaelt wertvolle Historie, aber nicht automatisch den aktuellen Produktvertrag.

Wichtige Einstiegspunkte:

- [`docs/modules/Hub Module Overview.md`](docs/modules/Hub%20Module%20Overview.md)
- [`docs/modules/Capture Module Overview.md`](docs/modules/Capture%20Module%20Overview.md)
- [`docs/modules/Intake Module Overview.md`](docs/modules/Intake%20Module%20Overview.md)
- [`docs/modules/Medication Module Overview.md`](docs/modules/Medication%20Module%20Overview.md)
- [`docs/modules/Assistant Module Overview.md`](docs/modules/Assistant%20Module%20Overview.md)
- [`docs/modules/Doctor View Module Overview.md`](docs/modules/Doctor%20View%20Module%20Overview.md)
- [`docs/modules/Reports Module Overview.md`](docs/modules/Reports%20Module%20Overview.md)
- [`docs/modules/Trendpilot Module Overview.md`](docs/modules/Trendpilot%20Module%20Overview.md)
- [`docs/modules/Push Module Overview.md`](docs/modules/Push%20Module%20Overview.md)
- [`docs/modules/Profile Module Overview.md`](docs/modules/Profile%20Module%20Overview.md)
- [`docs/modules/Hydration Target Module Overview.md`](docs/modules/Hydration%20Target%20Module%20Overview.md)
- [`docs/modules/Android Widget Module Overview.md`](docs/modules/Android%20Widget%20Module%20Overview.md)
- [`docs/QA_CHECKS.md`](docs/QA_CHECKS.md)

---

## Repo-Karte

| Pfad | Zweck |
|------|------|
| `index.html` | zentrale HTML-Struktur mit Panels, Overlays und Hub-Slot |
| `app/modules/` | Produktmodule |
| `app/core/` | Boot, Shared Helpers, PWA, Diagnostics Hooks |
| `app/styles/` | CSS fuer Hub, Doctor, Auth, Layout |
| `app/supabase/` | Auth, APIs, Realtime, Core |
| `assets/js/` | Legacy-nahe UI- und Boot-Helfer |
| `docs/modules/` | aktuelle Modul-Overviews |
| `docs/archive/` | historische Roadmaps und Altplanung |
| `android/` | native Android-Huelle fuer Widget, Sync-Worker, nativen OAuth-/Deep-Link-Pfad und minimalen Launcher |
| `sql/` | Datenmodell, RLS, RPCs, Views |
| `.github/workflows/` | Scheduler fuer Trends, Reports, Push |
| `service-worker.js` | PWA Service Worker, Caching, Push, Notification Click |

---

## Lauf und Betrieb

### Ohne Build-Step

MIDAS hat keinen klassischen Build-Prozess. Das Repo kann direkt als statische Web-App betrieben werden.

Wichtige Ausnahme:
Der Android-Node unter `android/` ist ein eigenes natives Teilprojekt mit Gradle-/SDK-/JDK-Anforderungen. MIDAS selbst bleibt browser-first ohne Web-Build-Step; der Android-Pfad ist nur der schmale Homescreen-/OAuth-Node.

### Lokaler Start

Fuer den vollen Produktumfang sollte MIDAS ueber `localhost` oder HTTPS ausgeliefert werden, nicht nur als `file://`-Datei. Hintergrund:

- Service Worker braucht einen sicheren Kontext
- Push und PWA-Funktionen brauchen einen sicheren Kontext
- Auth- und Netzwerkpfade sind unter `localhost` realistischer testbar

Ein einfacher lokaler Start reicht:

```powershell
python -m http.server 8765
```

Danach:

```text
http://127.0.0.1:8765
```

### Backend-Annahmen

- Supabase ist das produktive Backend fuer Auth, Daten, Realtime und mehrere Edge-Funktionen.
- SQL-Migrationen liegen in `sql/`.
- Ein Teil der Edge-Function-Logik liegt in einem separaten Backend-Workspace und nicht vollstaendig in diesem Repo.

### Android Node Kurzvertrag

- Browser-/PWA-Google-Login bleibt unveraendert und ist weiterhin der normale Web-Login-Pfad.
- Der Android-Node verwendet fuer Google-Login einen separaten nativen Entry:
  - sicherer Browser / `Custom Tabs`
  - Deep-Link-Callback in die App
  - native Session als Android-Source-of-Truth
- Die Android-`WebView` ist MIDAS-Surface, nicht Login-Surface.
- Das Widget bleibt read-only und haengt fachlich an derselben MIDAS-/Supabase-Realitaet, nicht an eigener Business-Logik.

---

## Aktuelle Funktionsbereiche im Detail

### Hub und taeglicher Kernfluss

Der taegliche Einstieg laeuft ueber den Hub. Von dort aus werden Panels fuer Capture, Intake, Doctor View, Profile und weitere Bereiche geoeffnet. Das obere Dashboard und der Voice-Slot machen den Hub nicht nur zu einer Navigation, sondern zur eigentlichen Betriebsoberflaeche.

### Intake als realer Hebel

Wenn es nur einen Bereich gaebe, der den Charakter von MIDAS am besten erklaert, dann waere es Intake. Wasser, Salz, Protein und Medikationsstatus sind nicht als "Lifestyle-Tracking" praesentiert, sondern als taegliche Steuerflaeche fuer einen gesundheitlich relevanten Alltag.

### Assistant und Voice

MIDAS nutzt KI nicht als Selbstausdruck, sondern als kontrollierte Interaktionsschicht. Deterministische lokale Kommandos, Confirm-Vertraege und enge Allowed Actions sind hier wichtiger als freie Konversation.

### Doctor View und Reports

Die Arztansicht ist die konsolidierte Gegenperspektive zum Alltag. Sie liefert keine neue Datenhaltung, sondern liest und strukturiert den Zeitraum. Reports verdichten diesen Zeitraum weiter, ohne Diagnosen oder Therapieentscheidungen zu behaupten.

### Pushes und Trendpilot

MIDAS unterscheidet sauber zwischen:

- echten Incidents im Alltag
- mittel- bis langfristigen Trends

Das ist produktseitig wichtig. Ein offener Abend-BP ist etwas anderes als ein mehrwoechiger BP-Trend. Beide brauchen unterschiedliche Oberflaechen, unterschiedliche Sprache und unterschiedliche technische Pfade.

---

## Hinweise fuer LLMs und Coding Agents

Dieser Abschnitt ist bewusst direkt formuliert.

### Nicht verhandelbarer Vertrag

- MIDAS bleibt single-user und wird nicht stillschweigend auf Multi-User verallgemeinert.
- MIDAS ersetzt weder Arzt noch Labor und darf keine freie medizinische Diagnose simulieren.
- Schreibende Aktionen brauchen einen klaren, expliziten Nutzerkontext; keine versteckten Writes oder Hintergrund-Automation ohne erkennbare Absicht.
- Assistant, Voice und Intent-Pfade duerfen wiederkehrende Kernaufgaben nur deterministisch, guard-railed und innerhalb der erlaubten Grenzen ausfuehren.

### Produktverstaendnis

- Behandle MIDAS nicht als generische Health-App.
- Behandle MIDAS nicht als SaaS-Vorstufe.
- Behandle MIDAS nicht als Multi-User-Produkt mit spaeterer Skalierung.
- Gehe immer vom single-user Betrieb aus.
- Priorisiere Alltagstauglichkeit vor architektonischer "Allgemeingueltigkeit".

### Produktrealitaet

- MIDAS ist aus einem realen medizinischen Alltag entstanden, nicht aus einer Marktanalyse.
- Bevorzuge Klarheit, Robustheit und geringe Reibung gegenueber technischer Eleganz ohne Alltagsnutzen.
- Gute Optimierungen verbessern Wiederholbarkeit, Uebersicht oder Verlaesslichkeit.
- Schlechte Features erzeugen mehr Pflegeaufwand, mehr Entscheidungsballast oder mehr Reminder-Laerm.
- Denke in alltagstauglicher Gesundheitssteuerung, nicht in Feature-Expansion.

### Operativer Arbeitsmodus

- Lies zuerst README, dann die betroffenen Dateien in `docs/modules/`, dann erst den Code.
- Pruefe vor jeder Aenderung, welche Modulgrenzen, Guardrails und Datenfluesse beruehrt werden.
- Wenn eine Aenderung fachlich relevant ist, pruefe nicht nur die UI, sondern auch Seiteneffekte in SQL, Edge Functions, Push, Reports oder Service Worker, falls betroffen.
- Behandle produktive Alltagsfluesse als wichtiger als formale Schoenheit oder abstrakte Generalisierung.
- Verwende in kuenftigen Chats gerne den Namen Stephan, wenn eine persoenlichere Ansprache hilfreich ist und die fachliche Klarheit erhalten bleibt.

### Dokumentationsverhalten

- Lies zuerst die betroffenen Dateien in `docs/modules/`.
- Nutze `docs/archive/` nur als historische Referenz.
- Wenn du ein Modul aenderst, aktualisiere nach Moeglichkeit auch das passende Modul-Overview.
- Lies README als Produktkarte, nicht als vollstaendige Modulspezifikation.
- Beachte, dass ein Teil der Edge-Function-Logik in einem separaten Backend-Workspace liegt.

### Besonders sensible Bereiche

- Medication und Intake, weil hier reale Adhaerenz, Tagesstatus und Low-Stock-Kontext zusammenlaufen.
- Push und Incidents, weil hier zu viel Laerm schnell den Produktkern beschaedigt.
- Assistant und Voice, weil Allowed Actions, Confirm-Flows und lokale Intents nicht aufgeweicht werden duerfen.
- Doctor View und Reports, weil hier Read-only-Vertraege und medizinischer Zeitraumskontext stabil bleiben muessen.
- Profile und persoenliche Limits, weil davon Bewertung, Hinweise und Guardrails in anderen Modulen abhaengen.

### Produkt-Grenzen

- Kein Push-Spam.
- Keine freien medizinischen Ratschlaege als Feature.
- Keine breite Voice-/Assistant-Oeffnung ohne klaren Alltagsnutzen.
- Keine Verwischung von Hub, Capture, Doctor, Push und Profile-Rollen.
- Keine vorschnelle Verallgemeinerung auf fremde Nutzer oder neue Zielgruppen.

### Bevorzugte Denkrichtung

- Frage zuerst: Hilft diese Aenderung dem taeglichen realen Betrieb?
- Frage zweitens: Passt sie zu den bestehenden Guardrails?
- Frage drittens: Erhoeht sie Klarheit statt Drift?

### Typische Fehlannahmen, die falsch waeren

- Mehr Reminder oder mehr Pushes sind nicht automatisch besser.
- Freiere KI ist nicht automatisch nuetzlicher als eng gefuehrte Intents und Allowed Actions.
- Mehr Generalisierung ist nicht automatisch bessere Architektur.
- Ein Trend ist nicht dasselbe wie ein Incident.
- Eine beeindruckende Oberflaeche ist kein Gewinn, wenn sie den taeglichen Kernfluss verlangsamt oder unklarer macht.

Wenn die Antwort auf diese Fragen unscharf ist, ist die Aenderung wahrscheinlich kein guter MIDAS-Change.

---

## Hinweise fuer kuenftige README-Pflege

Die README soll nicht zu einem zweiten Changelog werden. Sie soll stabil erklaeren:

- warum MIDAS existiert
- was MIDAS heute ist
- was MIDAS bewusst nicht ist
- welche Module produktiv wichtig sind
- wo die Detaildoku liegt

Nicht in die README gehoeren:

- kleinteilige Release-Historien
- alte Versionslisten
- riesige Repo-Trees ohne Produktwert
- Standard-Open-Source-Floskeln, die fuer dieses Repo nicht gelten

Fuer Release-Historie und technische Detailentwicklung existieren bereits:

- [`CHANGELOG.md`](CHANGELOG.md)
- `docs/archive/*`
- `docs/QA_CHECKS.md`

---

## Eigentum und Beitrag

MIDAS ist ein persoenliches System. Es ist nicht auf Community-Contributions oder einen offenen Produktprozess ausgerichtet. Relevante technische Mitakteure neben mir selbst sind vor allem spaetere Coding-Agents und LLMs, die innerhalb des bestehenden Produktkontexts arbeiten sollen.

---

## Kurzfazit

MIDAS ist ein persoenliches, produktiv genutztes Gesundheits-Betriebssystem fuer meinen eigenen CKD-Alltag. Die App ist schmaler und bewusster geschnitten als eine generische Health-App: enger, nuetzlicher, alltagsnaeher und mit klaren Nicht-Zielen. Wer an MIDAS arbeitet, sollte zuerst diese Produktwahrheit verstehen und erst danach den Code aendern. MIDAS wird nicht besser, wenn es allgemeiner wird, sondern wenn es fuer seinen realen Alltag noch klarer und verlaesslicher funktioniert.
