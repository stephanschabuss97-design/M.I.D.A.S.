# MIDAS Sensory Feedback Roadmap

Ziel
- Akustisches und haptisches Feedback bestaetigt Aktionen.
- Keine Gamification, keine Dauer-Sounds.
- Stille ist Normalzustand.

Hinweis
- Texte hier sind absichtlich mit ae/oe/ue, du korrigierst spaeter manuell.

Status
- Step 1: pending
- Step 2: pending
- Step 3: pending
- Step 4: pending
- Step 5: pending

Start hier (fuer neue Sessions)
1) Oeffne:
   - `docs/MIDAS Sensory Feedback Roadmap.md`
   - `app/modules/hub/index.js`
   - `app/modules/intake-stack/intake/index.js`
   - `app/modules/vitals-stack/vitals/index.js`
   - `app/modules/appointments/index.js`
2) Zielbild: leises, kurzes Feedback fuer Aktionen (kein Dauer-Sound).
3) Wenn der Status-Block oben "pending" zeigt, starte mit Step 1.

Scope
- Sound nur fuer Interaktionen (Panel, Save, Toggle, Undo).
- Haptic als primaerer Kanal auf Mobile.
- Alles abschaltbar.

Nicht im Scope
- Sounds fuer Trendpilot oder Ziele.
- Laufende Zustandsgeraeusche.
- Emotionale Feedbacks.

Relevante Dateien (Referenz)
- `app/modules/hub/index.js` (Panel-Open/Close, Carousel)
- `app/modules/intake-stack/intake/index.js` (Save/Confirm/Undo)
- `app/modules/vitals-stack/vitals/index.js` (BP/Body/Lab/Activity Saves)
- `app/modules/appointments/index.js` (Appointment Save/Done)
- `app/styles/ui.css` (Tokens/Patterns falls visuelles Feedback kombiniert wird)

Deterministische Steps

Step 1: Events + Mapping
1.1 Liste erlaubter Events (Panel, Save, Confirm, Toggle, Undo).
1.2 Mapping Sound/Haptic je Event definieren.
Output: Event-Matrix.
Exit-Kriterium: erlaubte Events sind fixiert.

Step 2: Sound-Design-Parameter
2.1 Lautstaerke, Dauer, Timbre festlegen (instrumentell).
2.2 Unterschiede zwischen Confirm/Undo minimal, aber wahrnehmbar.
Output: Sound-Parameter.
Exit-Kriterium: Regeln klar dokumentiert.

Step 3: Haptic-Parameter
3.1 Single-Tap, Double-Tap, Light-Click definieren.
3.2 Plattform-Support klaeren (Web Vibration API).
Output: Haptic-Pattern.
Exit-Kriterium: klare Haptic-Matrix.

Step 4: Implementierung
4.1 Zentrale Feedback-Utility (sound + haptic) erstellen.
4.2 Hooks in relevante Aktionen (Hub, Intake, Vitals, etc.).
Output: Feedback arbeitet konsistent.
Exit-Kriterium: keine ueberfluessigen Trigger.

Step 5: QA
5.1 Keine Sounds im Idle.
5.2 Kein Feedback bei Trendpilot-Warnungen.
5.3 Abschaltbarkeit getestet.
Exit-Kriterium: Feedback ist ruhig, funktional, abschaltbar.
