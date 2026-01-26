# MIDAS Ticker Bar Roadmap

Ziel
- Ruhige, passive Statusleiste am unteren Rand.
- Sichtbar nur bei relevanter Information.
- Keine Aktion erforderlich, kein Sound, kein Haptic.

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
   - `docs/MIDAS Ticker Bar Roadmap.md`
   - `app/modules/appointments/index.js`
   - `app/modules/hub/index.js`
   - `index.html`
   - `app/styles/ui.css`
2) Zielbild: ruhige Ticker-Bar unten, sichtbar nur bei Terminen/Erwartungen.
3) Wenn der Status-Block oben "pending" zeigt, starte mit Step 1.

Scope
- Termine ab T-2 Tage sichtbar, verschwinden bei Startzeit.
- Nur Termine (Appointments) in der ersten Version.
- Meldungen werden zu einem Lauftext kombiniert (Separator " | ").

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
1.2 Sekundaere Meldungen (Erwartungen) sind vorerst ausgesetzt.
1.3 Prioritaetsreihenfolge fuer Kombi-Text festlegen (nur Termine).
Output: finale Regeln + Beispieltexte.
Exit-Kriterium: Regeln sind eindeutig.

Step 1 Output (Draft)
Regeln (nur Appointments)
- Sichtbarkeit: Termin erscheint ab T-2 Tage (inklusive) und verschwindet exakt zum Startzeitpunkt.
- Status: nur geplante Termine (done/abgesagt tauchen nicht auf).
- Textformat: ruhig, kurz, ohne Imperativ, ohne Ausrufezeichen.
- Reihenfolge: nach Startzeit sortiert, fruehester zuerst.
- Mehrere Termine: zu einem Lauftext zusammenfassen, Separator " | ".

Beispieltexte
- "Heute 14:00 Zahnarzt, Praxis Berger"
- "Morgen 08:30 Blutabnahme, Labor Nord"
- "Fr 16:00 Kardiologie, Klinik Mitte"
- "Heute 14:00 Zahnarzt, Praxis Berger | Morgen 08:30 Blutabnahme, Labor Nord"

Step 2: Datenquellen & Events
2.1 Welche Module liefern Termine/Erwartungen (z. B. Appointments, Vitals)?
2.2 Welche Events triggern Updates (z. B. appointment:changed)?
Output: Liste Datenquellen + Event-Liste.
Exit-Kriterium: Datenfluss ist fixiert.

Step 2 Output (Draft)
Datenquellen
- Appointments Modul (Upcoming-Termine)

Events
- `appointments:changed` -> triggert Ticker-Update

Step 3: UI-Placement + Layout
3.1 Position und Layout definieren (z. B. fixed bottom, ruhig).
3.2 Verhalten bei Overflow (Ticker-Text, nicht scrollen).
3.3 Optik: Milchglas-Style basierend auf `--status-glass-*` Tokens (konsistent mit Status-Glow).
Output: Layout-Regeln + CSS-Slots.
Exit-Kriterium: UX-Regeln sind fixiert.

Step 3 Analysis (Home Screen / Hub Kontext)
Beobachtung aus Home Screen (Hub):
- Fokus liegt visuell im Zentrum (Emblem), Rest ist sehr ruhig und dunkel.
- Keine Panels offen, daher viel Negativraum und klare Kanten.
- Der untere Bereich ist frei von UI-Elementen; ideal fuer eine ruhige Ticker-Leiste.

Layout-Regeln (Ticker-Bar)
- Position: fixed bottom, zentriert, untergeordnet zum zentralen Emblem.
- Breite: folgt Panel-Breite-Logik (max width) mit seitlichem Gap, damit es wie ein System-Element wirkt.
- Hoehe: kompakt (eine Zeile), kein vertikales Wachstum.
- Sichtbarkeit: default hidden, nur bei Terminen einblenden.

Overflow-Regeln
- Einzeilig, kein Wrap, kein Scrollen.
- Falls zu lang: Text kuerzen oder sanft ausblenden (visuell ruhig, kein Marquee).

Milchglas-Optik (Best Practice im MIDAS-Kontext)
- Hintergrund: `--status-glass-*` Tokens fuer Glas (keine neuen Farben).
- Leichter Blur, geringe Opazitaet, klare Lesbarkeit (Kontrast vor Effekt).
- Keine starken Glows, keine harten Schatten.
- Safe-Area beachten (Mobile bottom inset).

Step 4: Implementierung
4.1 Markup in `index.html` fuer Ticker-Bar.
4.2 JS-Logik fuer Sichtbarkeit, Text-Combine, Hide/Show.
4.3 Styling in `app/styles/ui.css` oder `app/styles/hub.css` (nach Pattern-Regel).
Output: funktionierender Ticker.
Exit-Kriterium: Ticker erscheint nur bei gueltigen Meldungen.

Step 5: QA
5.1 Termine T-2 sichtbar, am Startzeitpunkt weg.
5.2 Erwartungen: n/a (spaeter, nicht in der ersten Version).
5.3 Mehrere Meldungen: richtiger Lauftext.
Exit-Kriterium: keine falschen oder lauten Meldungen.

Follow-up
- Nach Step 5: `docs/MIDAS Incidents & Push Roadmap.md` beginnen.




