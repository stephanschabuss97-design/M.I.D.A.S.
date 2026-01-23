# MIDAS Ticker Bar Roadmap

Ziel
- Ruhige, passive Statusleiste am unteren Rand.
- Sichtbar nur bei relevanter Information.
- Keine Aktion erforderlich, kein Sound, kein Haptic.

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
   - `docs/MIDAS Ticker Bar Roadmap.md`
   - `app/modules/appointments/index.js`
   - `app/modules/hub/index.js`
   - `index.html`
   - `app/styles/ui.css`
2) Zielbild: ruhige Ticker-Bar unten, sichtbar nur bei Terminen/Erwartungen.
3) Wenn der Status-Block oben "pending" zeigt, starte mit Step 1.

Scope
- Termine ab T-2 Tage sichtbar, verschwinden bei Startzeit.
- Optional: zeitgebundene medizinische Erwartungen (z. B. Abend-BP offen).
- Meldungen werden zu einem Lauftext kombiniert (Separator "•").

Nicht im Scope
- Lifestyle-Ziele (Wasser/Salz/Protein).
- Push, Reminder, Eskalation.
- Persistente Speicherung (nur UI-seitig).

Relevante Dateien (Referenz)
- `index.html` (Ticker-Container/Markup)
- `app/modules/hub/index.js` (globales UI-Update/Events)
- `app/modules/appointments/index.js` (Termine + `appointments:changed`)
- `app/styles/ui.css` (globale Pattern fuer Ticker)
- `app/styles/hub.css` (Hub-Panel Kontext, falls Layout-Override noetig)
- `app/styles/base.css` (Tokens fuer Ticker-Optik)
- `docs/modules/Appointments Module Overview.md` (Termine + Events)

Deterministische Steps

Step 1: Use Cases + Regeln fixieren
1.1 Primare Meldungen (Termine) final definieren.
1.2 Sekundaere Meldungen (Erwartungen) mit Zeitfenstern definieren.
1.3 Prioritaetsreihenfolge fuer Kombi-Text festlegen.
Output: finale Regeln + Beispieltexte.
Exit-Kriterium: Regeln sind eindeutig.

Step 2: Datenquellen & Events
2.1 Welche Module liefern Termine/Erwartungen (z. B. Appointments, Vitals)?
2.2 Welche Events triggern Updates (z. B. appointment:changed)?
Output: Liste Datenquellen + Event-Liste.
Exit-Kriterium: Datenfluss ist fixiert.

Step 3: UI-Placement + Layout
3.1 Position und Layout definieren (z. B. fixed bottom, ruhig).
3.2 Verhalten bei Overflow (Ticker-Text, nicht scrollen).
3.3 Optik: Milchglas-Style basierend auf `--status-glass-*` Tokens (konsistent mit Status-Glow).
Output: Layout-Regeln + CSS-Slots.
Exit-Kriterium: UX-Regeln sind fixiert.

Step 4: Implementierung
4.1 Markup in `index.html` fuer Ticker-Bar.
4.2 JS-Logik fuer Sichtbarkeit, Text-Combine, Hide/Show.
4.3 Styling in `app/styles/ui.css` oder `app/styles/hub.css` (nach Pattern-Regel).
Output: funktionierender Ticker.
Exit-Kriterium: Ticker erscheint nur bei gueltigen Meldungen.

Step 5: QA
5.1 Termine T-2 sichtbar, am Startzeitpunkt weg.
5.2 Erwartung erscheint erst ab Uhrzeit X, verschwindet bei Erfuellung.
5.3 Mehrere Meldungen: richtiger Lauftext.
Exit-Kriterium: keine falschen oder lauten Meldungen.

Follow-up
- Nach Step 5: `docs/MIDAS Incidents & Push Roadmap.md` beginnen.
