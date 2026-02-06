# Hub Orbit Momentum & Showtime Plan

## Idee

Die Orbit-Navigation soll zwei Gefühlszustände kommunizieren:
1. **Bewegung & Auswahl** – kleine Buttons rotieren mit klarer Direktion und vermitteln Momentum, wenn der Nutzer swiped oder Tastatur verwendet.
2. **Showtime im Fokus** – sobald ein Modul im Zentrum „einrastet“, wird das Icon groß und lebendig angezeigt, während das kleine Button-Element ausblendet.

So behalten wir die präzise Steuerung der bisherigen UI und geben ihr gleichzeitig mehr Charakter.

---

## Phase 1 – Showtime ohne Momentum

1. **Orb-Sprite-Handling** ✅
   - Buttons erhalten `data-orb-sprite` und optional `data-orb-alt`.
   - Beim Einrasten eines Moduls wird `.hub-orb-fg` auf das Modul-Icon gesetzt, im Idle zurück auf den Standardpfeil.

2. **Aktive Button-Stille**
   - Wenn ein Modul aktiv ist, blendet das kleine `.hub-icon` per CSS (Opacity → 0) aus, damit nur das zentrale Sprite sichtbar bleibt.
   - Beim Start einer neuen Bewegung wird das kleine Icon wieder eingeblendet.

3. **Zoom/Fade Animation**
   - Großes Icon zoomt mit leichtem Scale-Up (z. B. 0.85 → 1.0) und Glow.  
   - Kleiner Button fade-out synchronisieren (z. B. 100–150 ms Delay).

4. **Fallbacks**
   - Wenn ein Modul kein eigenes Sprite besitzt, bleibt alles wie bisher (nur Idle-Sprite sichtbar).

---

## Phase 2 – Momentum & flüssige Rotation (ohne Showtime)

1. **Swipe-Geschwindigkeit auswerten**
   - Pointer-Events speichern Startzeit und Strecke.
   - Nach Loslassen berechnen, wie weit das Rad nachschwingen soll (max. ±2 Schritte).

   1.1 ✅ State erweitern – Im Carousel- bzw. Gesture-Block (rund um setupCarouselGestures) benötigen wir zusätzliche Variablen:
pointerStartX/Y existieren schon; ergänze pointerStartTime und evtl. lastMoveX/lastMoveTime, um Geschwindigkeit zu messen.
Ein Feld im carouselState oder eigener Scope reicht, solange die Daten beim Pointer-End verfügbar sind.

   1.2 ✅ Pointer-Events anpassen – In den Events pointerdown, pointermove, pointerup/cancel:
Beim pointerdown: Startzeit (performance.now()) und Startposition speichern.
Beim pointermove: optional den letzten Move protokollieren (hilft, wenn der Nutzer langsam startet und am Ende beschleunigt).
Beim pointerup: Distanz und Zeitdifferenz berechnen → daraus Geschwindigkeit ableiten.

   1.3 Nachschwung bestimmen – Basierend auf der errechneten Geschwindigkeit (Δx/Δt oder Δy/Δt im Orbit):
Schwellen definieren (z. B. <100px/s → kein Momentum, >300px/s → 2 Schritte).
Ergebnis im shiftCarousel-Aufruf nutzen (z. B. shiftCarousel(1) plus zusätzliche Steps in einer Schleife/Timeouts).

    1.4 Grenzen & Edge Cases – Alles bleibt in app/modules/hub/index.js:
Maximal ±2 Schritte.
Wenn während des Momentums ein neuer pointerdown oder ein Tastenklick passiert, Momentum abbrechen (Flag im State).
prefers-reduced-motion: Beim Initialisieren prüfen und Momentum direkt deaktivieren.

CSS braucht hier nichts, weil das Momentum nur Logik betrifft.

2. **Ease-Out Bewegung**
   - Carousel-Index mehrfach versetzt updaten (immer kleinere Delays), damit ein physischer Schwung entsteht.
   - Die Icons bleiben sichtbar, vergrößern aber nicht weiter – das Rad wirkt dadurch lebendiger.

3. **Ruhestellung erkennen**
   - Momentum beendet → `transitionDir` wieder 0, aktive Klasse bleibt wie gehabt.
   - Idle-Pfeil bleibt ausgeblendet, solange ein Modul aktiv ist.

4. **Edge Cases**
   - Tastatur/Quickbar/Voice-Triggers überspringen Momentum (präzise Navigation).
   - `prefers-reduced-motion`: Momentum automatisch deaktivieren.

---

## Umsetzungsschritte (deterministisch)

1. **Daten erweitern:** `data-orb-sprite`/`data-orb-alt` in `index.html`.
2. **Orb-Sprite-API:** JS-Helper für `applyOrbSprite`, Idle-Fallback.
3. **CSS-States:** Klassen für `is-showtime`, Fade/Zoom-Animationen, aktives Button-Opacity.
4. **Showtime-Trigger:** `applyCarouselUi` erkennt `carouselState.idle === false` und `transitionDir === 0`, startet Animation.
5. **Momentum (optional aktivieren):**
   - Swipe-Handler erweitern (Δ Weg/Δ Zeit).
   - Neuer „momentum queue“ in `carouselState`.
   - `setCarouselActiveIndex` mehrfach aufrufen mit easing.
6. **Tests & Feintuning:**
   - Desktop/Touch, Idle/Active, Panel-Wechsel.
   - Performance beobachten (kein Jank, geringe Layout thrashings).

Damit bleibt die Umsetzung modular: Phase 1 bringt sofort sichtbaren Mehrwert. Phase 2 kann nachgezogen werden, sobald wir Zeit für die Motion-Feinarbeit haben.
