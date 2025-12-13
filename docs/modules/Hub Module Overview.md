# Hub Module – Functional Overview

Dieses Dokument beschreibt das MIDAS-Hub-Modul, den zentralen Einstiegspunkt für das Hero-Interface. Nach dem Umbau (Ringelspiel-Karussell, Quickbar-Swipe, Panel-Lock) dient es als Referenz für Aufbau, Zuständigkeiten und Erweiterungen.

---

## 1. Scope & Entry Points

| Typ            | Datei/Beschreibung |
| -------------- | ------------------ |
| Entry Script   | `app/modules/hub/index.js` – aktiviert Hub-Layout, bindet Carousel/Quickbar, steuert Panels |
| Stylesheet     | `app/styles/hub.css` – Aura/Ring-Layer, Carousel-Slot, Quickbar-Transitions, Panel-Look |
| Markup-Anker   | `<section class="hub" id="captureHub">` in `index.html` mit Carousel-Slot + Panels |

Das Hub ersetzt die klassische Tab-Navigation und dient als Launcher für Intake-, Vitals-, Doctor-Panel sowie künftige KI-Module.

---

## 2. Verantwortlichkeiten

1. **Hero-Aktivierung**
   - Setzt `hub-mode` auf `<body>` (versteckt alte Capture-Header) und verschiebt Intake-Pills in den Hero (`moveIntakePillsToHub`).
2. **Panel-/Carousel-Steuerung**
   - Buttons mit `data-hub-module` öffnen Panels (`hub-panel` Sektionen).
   - `setupCarouselController()` verwaltet das Ringelspiel (ein Icon in der Mitte, Swipe/Key Navigation, Animationsklassen).
   - `setupCarouselGestures()` misst Swipe-Geschwindigkeit und gibt dem Karussell Momentum (max. 1 zusätzlicher Schritt, respektiert `prefers-reduced-motion`).
   - `setupIconBar()` synchronisiert `aria-pressed`, handhabt Click/ESC, schließt Panels sauber.
3. **Quickbar/Vertical Layer**
   - `setupQuickbar()` koppelt Swipe-Up/Down und Buttons (`data-hub-module` + `data-quickbar-action`), animiert per CSS (`--hub-y-offset`, Blur/Scale).
4. **Orbit-Hotspots (Legacy)**
   - `setupOrbitHotspots()` existiert weiterhin, wird aber nur noch aktiv, wenn Buttons mit `data-orbit-pos` versehen sind (derzeit deaktiviert). Dient als Fallback, falls spätere Orbit-Flächen reaktiviert werden.
4. **Datum & Status**
   - Date-Pill bleibt Single Source of Truth (`#date` Input); Vitals zeigt Inline-Datepicker.
   - Intake-Pills zeigen nur Werte (keine Ampelfarben), geliefert vom Capture-Modul.
5. **Modal/Accessibility**
   - Panels behalten Fokus, ESC schließt.
   - Buttons sind echte `<button>`-Elemente mit ARIA-Labels; sichtbare "??" wurden entfernt.

---

## 3. Carousel & Legacy-Orbit

- **Carousel:** Die sichtbaren Module liegen alle im zentralen Slot (`.hub-carousel .hub-icon`). `setupCarouselController` blendet jeweils genau ein Icon ein; Richtungswechsel steuern animierte Klassen (`hub-icon-anim-enter/exit-*`) und lösen das passende Panel aus. Seit V1.7.6 sind die Orbit-Icons deutlich größer (`clamp(288px, 48vw, 576px)`), sodass kein separates „Showtime“-Sprite mehr nötig ist; das Idle-Sprite (`.hub-orb-fg`) blendet aus, sobald das Karussell aktiv ist.
- **Momentum:** Swipe-Gesten über den Orbit messen Distanz/Zeit; schnelle Swipes lösen ein kurzes Nachschwingen (ein zusätzlicher `shiftCarousel`-Schritt) aus. Neue Eingaben oder `prefers-reduced-motion` deaktivieren das Momentum sofort.
- **Legacy-Orbit:** Das Objekt `ORBIT_BUTTONS` und `setupOrbitHotspots` verbleiben als Fallback für verborgene Flächen. Da die Carousel-Buttons keine `data-orbit-pos` mehr besitzen, greift die alte Positionierung nicht mehr – ein versehentliches „Riesenrad“ ist damit ausgeschlossen. Die unsichtbaren Orbit-Schaltflächen bleiben im DOM, sind aber nicht verdrahtet; sie können später wieder aktiviert werden, indem `data-orbit-pos` gezielt gesetzt und `setupOrbitHotspots` reaktiviert wird.

---

## 4. Panel-Verhalten

| Panel        | Markup                                             | Trigger                    | Besonderheit                                  |
| ------------ | -------------------------------------------------- | -------------------------- | --------------------------------------------- |
| Intake       | `<section id="hubIntakePanel" data-hub-panel="intake">` | `data-hub-module="intake"` | Migration des alten Accordions                |
| Vitals       | `data-hub-panel="vitals"`                          | `data-hub-module="vitals"` | Datum + BP/Körper Formulare inline            |
| Doctor       | `data-hub-panel="doctor"`                          | `data-hub-module="doctor"` | Biometrie-Check (`ensureDoctorUnlocked`)      |
| Chart        | `#chart` Panel (SVG)                               | `data-hub-module="chart"`  | Öffnet Doctor-Panel im Chart-Modus            |
| Quickbar     | `<div id="hubQuickbar">`                           | Swipe Up / Buttons         | Mini-Buttons (Ringelspiel-IDs); Touch-Log per Action |
| Legacy Orbit | `disabled` Buttons mit `data-orbit-pos`            | (derzeit unverkabelt)      | Platzhalter für zukünftige kreisförmige Module |

Panels bleiben im DOM; das Hub blendet sie nur ein/aus. Panels öffnen/ schließen mit Zoom-Animation, bleiben bis Animation-Ende sichtbar.

---

## 5. Styling Highlights (hub.css)

- **Background**: freigestelltes PNG `assets/img/midas_background.PNG` in `.hub-orb-bg`; Aura + Gold-Ring laufen als eigenständige Layer.
- **Living Aura Layer**: Ein Canvas (`#hubAuraCanvas`) sitzt zwischen Hintergrund und Foreground. `app/modules/hub/hub-aura3d.js` rendert die Partikel (Three.js) und exponiert `getAuraConfig()`, `configureAura3D(partialConfig)` sowie `resetAuraConfig()`. Damit können Sweep-Impulse, Noise oder Boundary-Dämpfung live feinjustiert oder komplett deaktiviert werden (`configureAura3D({ enabled: false })` stoppt Renderer, `{ enabled: true }` startet ihn erneut).
- **Carousel Slot**: `.hub-carousel .hub-icon` sitzt absolut im Zentrum; Richtungswechsel nutzen Animationsklassen (`hub-icon-anim-enter/exit-left/right/fade`). Die Icons sind groß skaliert (`clamp(288px, 48vw, 576px)`), damit sie das Orb alleine füllen.
- **Quickbar**: Blur-Bubble mit Ease-Out-Transition (Scale + Translate). Swipe-Up verschiebt den gesamten Hub (`--hub-y-offset`) und hält die MIDAS-Kernidentität sichtbar; Buttons liegen auf einer responsiven Grid-Fläche (Mindestens 2 Spalten auf Mobile, mehr Zeilen bei Bedarf) statt eines horizontalen Scrollers.
- **Panel Look**: zentrierte Overlays mit Zoom-In/Out (`hub-panel-zoom-*`), Milchglas-Lock via `body:has(.hub-panel.is-visible)`.
- **Locking & Voice Gate**: Aktiviertes Panel dimmt Orbit, blockt Buttons; Voice-Gate (CSS `body.voice-locked`) zeigt weiterhin den Sicherheitszustand der Sprachsteuerung.

### Voice Safety Gate (Phase 0.4)

- JS (`app/modules/hub/index.js`) stellt `AppModules.hub.getVoiceGateStatus/isVoiceReady/onVoiceGateChange` bereit. Gate ist offen, sobald `bootFlow.isStageAtLeast('IDLE') && supabaseState.authState !== 'unknown'`.
- CSS nutzt `body.voice-locked` + `.hub-core-trigger.is-voice-locked`, um die Nadel zu dimmen, Pointer-Events zu blockieren und den Hinweis „Voice aktiviert sich nach dem Start“ einzublenden.
- Falls Auth während einer Session zurück auf `unknown` fällt, der Gate Listener stoppt Recorder, VAD, Streams und schreibt `[voice] gate locked` in `diag`.

---

## 6. Datenabhängigkeiten

- **Intake State** – Pills & Tageswerte kommen aus dem Capture-Modul (keine extra API).
- **Vitals/Doctor** – Reuse der Module; Hub koordiniert nur UI.
- **Datum** – einziges Input `#date`; Orbit-Pill entfernt, Vitals zeigt Inline-Datepicker.
- **Keine direkten Supabase-Calls** – Hub leitet nur zu bestehenden Modulen weiter.

---

## 7. Erweiterungen & TODOs

1. **Speichen komplettieren** – KI Voice, Training, Termine sollen echte Panels bekommen.  
2. **Spriting/States** – spätere Idle/Thinking/Voice-Sprites können über `.hub-orb-fg` ergänzt werden.  
3. **Konfigurierbare Orbit-Buttons** – z. B. JSON-Config, um Reihenfolge auszutauschen.  
4. **A11y** – Fokus-Ring + ARIA-States für Panels (z. B. `aria-expanded`).  
5. **SVG-Option** – Mit echtem SVG des Logos könnte der Radial-Algorithmus Pfad-Koordinaten nutzen.

---

## 8. Quickstart für Änderungen

1. **Carousel-Button hinzufügen** – in `index.html` neuen `<button class="hub-icon" data-hub-module="...">` innerhalb `.hub-carousel` platzieren (kein `data-orbit-pos` nötig).  
2. **Panel bauen** – neue `<section class="hub-panel" data-hub-panel="...">` anlegen oder bestehendes Panel erweitern.  
3. **Script erweitern** – `setupIconBar` / `CAROUSEL_MODULES` in `hub/index.js` ergänzen (Mapping `id → panel`).  
4. **Quickbar ergänzen** – optional Button mit `data-hub-module` oder `data-quickbar-action` hinzufügen (nutzt dasselbe Handler-Mapping).  
5. **Styles anpassen** – `hub.css` nur für neue Icons/States pflegen (Aura/Carousel/Quickbar nutzen CSS-Variablen statt Inline-Stile).  

Damit ist das Hub-Modul dokumentiert; neue Entwickler finden damit schnell Einstieg und Kontext.
