# Intake Medication UX Roadmap (Checkbox + Batch Save)

Ziel
- Tabletten-Confirmations frictionless machen, ohne Informationsverlust.
- Ein neuer Chat kann direkt anfangen (siehe "Start hier").

Start hier (fuer neue Sessions)
1) Oeffne:
   - `docs/Intake Medication UX Roadmap.md` (dieses Dokument)
   - `index.html`
   - `app/modules/intake-stack/medication/index.js`
   - `app/styles/hub.css`
2) Zielbild: Intake-Panel mit Checkboxen + Batch-Buttons unten.
3) Wenn der Status-Block unten "pending" zeigt, starte mit Step 1.

Status
- Step 1: pending
- Step 2: pending
- Step 3: pending
- Step 4: pending
- Step 5: pending

Scope
- Checkboxen pro Medikament.
- Zwei Buttons im Footer: "Auswahl bestaetigen" + "Alle genommen".
- Nach Klick: Footer wechselt auf Status-Button:
  - "Tabletten genommen" (wenn alle)
  - "Tabletten teilweise genommen" (wenn subset)
- Optional: Undo fuer 5-8s.

Nicht im Scope
- Neue Datenmodelle im Backend.
- Aenderungen an Supabase Tabellen.
- Redesign der gesamten Intake-UI.

Deterministische Steps

Step 1: Datenmodell & Status-Logik klaeren
1.1 Finde, wie Intake-Tabletten aktuell als "bestaetigt" gespeichert werden.
1.2 Definiere:
    - Wann gilt "alle genommen"?
    - Wann gilt "teilweise genommen"?
    - Welche Felder/Events werden geschrieben?
Output: klare Status-Definition (textlich) + Liste der gespeicherten Felder.
Exit-Kriterium: Regeln fuer "alle" vs "teilweise" sind fixiert.

Step 2: UI-Markup erweitern (Checkbox + Footer)
2.1 Medication-Cards bekommen Checkbox (oder Toggle) im Header.
2.2 Footer-Row im Intake-Panel einbauen:
    - Primary: Auswahl bestaetigen (n)
    - Secondary: Alle genommen
2.3 Status-Row fuer nach dem Speichern:
    - "Tabletten genommen" / "Tabletten teilweise genommen"
Output: neues Markup in `index.html`.
Exit-Kriterium: UI zeigt Checkboxen + Footer.

Step 3: JS-Logik (Selection + Batch Save)
3.1 Default: alle offenen Tabletten preselected.
3.2 Klick auf Card/Checkbox toggelt Selection.
3.3 "Auswahl bestaetigen" -> batch save fuer selection.
3.4 "Alle genommen" -> batch save fuer alle offenen.
3.5 Footer swap nach Save (Status-Button).
3.6 Optional: Undo (mit Timeout).
Output: funktionierende Batch-Logik.
Exit-Kriterium: 1 Klick bestaetigt mehrere Tabletten.

Step 4: Styling / Layout
4.1 Checkbox-Stil an globale Patterns anpassen (kein eigener Look).
4.2 Footer-Row als Form-Actions (globales Pattern).
4.3 Status-Button visueller State (success).
Output: konsistenter Look.
Exit-Kriterium: UI passt zu Profil/Termine.

Step 5: QA / Validierung
5.1 Szenarien:
    - Alle offen, "Alle genommen"
    - Teil-Auswahl + "Auswahl bestaetigen"
    - Undo nach Save
5.2 Check:
    - Status-Texte stimmen
    - Keine Doppel-Clicks noetig
Output: UX abgeschlossen.
Exit-Kriterium: frictionless Flow ohne Datenverlust.

Hinweis
- Texte hier sind absichtlich mit ae/oe/ue, du korrigierst spaeter manuell.
