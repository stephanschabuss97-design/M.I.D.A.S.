# MIDAS Sensory Feedback Roadmap

Ziel
- Akustisches und haptisches Feedback bestaetigt Aktionen.
- Keine Gamification, keine Dauer-Sounds.
- Stille ist Normalzustand.

Hinweis
- Texte hier sind absichtlich mit ae/oe/ue, du korrigierst spaeter manuell.

Status
- Step 1: done
- Step 2: done
- Step 3: done
- Step 4: done
- Step 5: done

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

Step 1 Output (Event-Matrix, Draft)

Legende (abstrakt)
- Sound: snd_open / snd_close / snd_confirm / snd_undo / snd_toggle / snd_error
- Haptic: tap_light / tap_double / tap_soft

Erlaubte Events (nur User-Intent, keine Auto-Trigger)
- Hub Panel Open
  - Trigger: User oeffnet Panel (Orbit/Quickbar).
  - Sound: snd_open
  - Haptic: tap_light
- Hub Panel Close
  - Trigger: User schliesst Panel (X/Escape).
  - Sound: snd_close
  - Haptic: tap_soft

- Intake Save (Water/Salt/Protein)
  - Trigger: Save erfolgreich (Button).
  - Sound: snd_confirm
  - Haptic: tap_light
- Intake Combo Save (Salt+Protein)
  - Trigger: Save erfolgreich (Button).
  - Sound: snd_confirm
  - Haptic: tap_light

- Medication Confirm (Batch/Single)
  - Trigger: Einnahme bestaetigt.
  - Sound: snd_confirm
  - Haptic: tap_light
- Medication Undo
  - Trigger: Undo Einnahme.
  - Sound: snd_undo
  - Haptic: tap_double
- Medication Toggle (Selection Checkbox)
  - Trigger: Auswahl toggled (nur UI, kein Save).
  - Sound: snd_toggle (optional, leise)
  - Haptic: tap_soft

- Vitals Save (BP/Body/Lab/Activity)
  - Trigger: Save erfolgreich.
  - Sound: snd_confirm
  - Haptic: tap_light
- Vitals Reset (Panel Reset)
  - Trigger: Reset gedrueckt.
  - Sound: snd_undo
  - Haptic: tap_soft

- Appointments Save
  - Trigger: Termin gespeichert.
  - Sound: snd_confirm
  - Haptic: tap_light
- Appointments Toggle Done/Reset
  - Trigger: Statuswechsel.
  - Sound: snd_toggle
  - Haptic: tap_soft
- Appointments Delete
  - Trigger: Loeschen bestaetigt.
  - Sound: snd_undo (zurueckhaltend)
  - Haptic: tap_double

Nicht erlaubte Events (kein Feedback)
- Automatische Syncs/Refreshes (supabase:ready, refresh, timers).
- Trendpilot/Warnings/Assistants (kein Gamy-Feedback).
- Ticker Updates, Background Hooks.

Step 2: Sound-Design-Parameter
2.1 Lautstaerke, Dauer, Timbre festlegen (instrumentell).
2.2 Unterschiede zwischen Confirm/Undo minimal, aber wahrnehmbar.
Output: Sound-Parameter.
Exit-Kriterium: Regeln klar dokumentiert.

Step 2 Output (Sound-Parameter, Draft)

Global
- Stil: instrumentell, neutral, kurz (keine "Gamification"-Samples).
- Lautstaerke: sehr leise, maximal ~25-30% des Systemvolumens.
- Dauer: 60-140 ms (max 180 ms fuer Undo).
- Envelope: kurzer Attack, weicher Release (kein Click).
- Frequenzbereich: mittig (ca. 400-1200 Hz), keine hohen Pings.

Sound-Signaturen
- snd_open: kurzer, weicher "up" Ton (80-100 ms).
- snd_close: kurzer, weicher "down" Ton (80-100 ms).
- snd_confirm: neutraler, warmer Click/Chime (90-120 ms).
- snd_undo: leicht tiefer/gedaempft als confirm (120-160 ms).
- snd_toggle: sehr leise Mikro-Click (50-70 ms) oder ganz aus.
- snd_error: nur bei echten Fehlern, sehr dezent (max 140 ms, optional).

Regeln
- Kein Sound bei Auto-Refresh, Sync, Timer.
- Keine Loop/kein Ambient.
- Gleiche Events = gleiche Sound-Family (Wiedererkennung).

Step 3: Haptic-Parameter
3.1 Single-Tap, Double-Tap, Light-Click definieren.
3.2 Plattform-Support klaeren (Web Vibration API).
Output: Haptic-Pattern.
Exit-Kriterium: klare Haptic-Matrix.

Step 3 Output (Haptic-Parameter, Draft)

Web Vibration API (baseline)
- tap_light: [12] ms
- tap_soft: [8] ms
- tap_double: [12, 60, 12] ms

Regeln
- Haptic ist primaerer Kanal auf Mobile, Sound kann dort leiser sein.
- Keine Haptics bei Auto-Refresh, Sync, Timer.
- Haptic nur bei User-Intent Events (siehe Step 1).
- Falls API nicht verfuegbar: still (keine Fallback-Sounds erzwingen).

Step 4: Implementierung
4.1 Feedback-Core (neu)
  4.1.1 `app/core/feedback.js`: zentrale API `feedback(event, opts)`
  4.1.2 Settings/Gates: Sound/Haptic aktiv? + "User-Intent" Guard
  4.1.3 Sound-Engine: Mapping (snd_open/close/confirm/undo/toggle/error)
  4.1.4 Haptic-Engine: Mapping (tap_light/soft/double)
  4.1.5 Schutz vor Spam: kurzer Cooldown/Dedupe pro Event (z.B. 300-500ms)

4.2 Hook-Integration (bestehende Module)
  4.2.1 Hub: Panel Open/Close (`app/modules/hub/index.js`)
  4.2.2 Intake: Save/Confirm/Undo/Toggle (`app/modules/intake-stack/intake/index.js`)
  4.2.3 Vitals: Save/Reset (`app/modules/vitals-stack/vitals/index.js`)
  4.2.4 Appointments: Save/Done/Delete (`app/modules/appointments/index.js`)

4.3 QA-Schutz in Code
  4.3.1 Keine Auto-Refresh Trigger
  4.3.2 Keine Trendpilot/Timer
  4.3.3 Fallback: wenn API fehlt -> still
Output: Feedback arbeitet konsistent.
Exit-Kriterium: keine ueberfluessigen Trigger.

Step 5: QA
5.1 Keine Sounds im Idle.
5.2 Kein Feedback bei Trendpilot-Warnungen.
5.3 Abschaltbarkeit getestet.
Exit-Kriterium: Feedback ist ruhig, funktional, abschaltbar.

Follow-up
- Nach Step 5: `docs/Repo Cleanup Roadmap.md` beginnen.
