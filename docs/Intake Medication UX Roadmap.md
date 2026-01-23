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
- Step 1: completed
- Step 2: completed
- Step 3: completed
- Step 4: completed
- Step 5: completed

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

Definition (Status)
- Alle genommen: alle aktiven Medikamente fuer den Tag haben `taken=true`.
- Teilweise genommen: mindestens ein aktives Medikament hat `taken=true`, aber nicht alle.
- Offen: kein aktives Medikament hat `taken=true`.

Speicher-Logik (aktuell)
- RPC `med_confirm_dose(p_med_id, p_day)` setzt Dosis bestaetigt fuer den Tag.
- RPC `med_undo_dose(p_med_id, p_day)` nimmt die Bestaetigung zurueck.
- UI liest pro Medikament: `taken`, `taken_at`, `dose_per_day`, `qty` (aus `med_list`).

Step 2: UI-Markup erweitern (Checkbox + Footer)
2.1 Medication-Cards bekommen Checkbox (oder Toggle) im Header.
2.2 Footer-Row im Intake-Panel einbauen:
    - Primary: Auswahl bestaetigen (n)
    - Secondary: Alle genommen
2.3 Status-Row fuer nach dem Speichern:
    - "Tabletten genommen" / "Tabletten teilweise genommen"
Output: neues Markup in `index.html`.
Exit-Kriterium: UI zeigt Checkboxen + Footer.

Status-Update
- Footer-Markup fuer Batch-Buttons + Status-Row in `index.html` gesetzt.

Step 3: JS-Logik (Selection + Batch Save)
3.1 Default: alle offenen Tabletten preselected.
3.2 Klick auf Card/Checkbox toggelt Selection.
3.3 "Auswahl bestaetigen" -> batch save fuer selection.
3.4 "Alle genommen" -> batch save fuer alle offenen.
3.5 Footer swap nach Save (Status-Button).
3.6 Optional: Undo (mit Timeout).
Output: funktionierende Batch-Logik.
Exit-Kriterium: 1 Klick bestaetigt mehrere Tabletten.

Status-Update
- Batch-Selection + Save/Undo in `app/modules/intake-stack/intake/index.js` implementiert.

Step 4: Styling / Layout
4.1 Checkbox-Stil an globale Patterns anpassen (kein eigener Look).
4.2 Footer-Row als Form-Actions (globales Pattern).
4.3 Status-Button visueller State (success).
Output: konsistenter Look.
Exit-Kriterium: UI passt zu Profil/Termine.

Status-Update
- Footer-Layout + Checkbox-Header Styling in `app/styles/hub.css` angelehnt an globale Patterns.

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

QA-Status
- Logik-Review der Szenarien (alle/teilweise/undo) anhand der neuen Batch-Handler erledigt.

Hinweis
- Texte hier sind absichtlich mit ae/oe/ue, du korrigierst spaeter manuell.

---

# Intake Medication UX Roadmap (Status-Pfeil + Glow)

Ziel
- Pro Medikament klares, ruhiges Status-Feedback (Pfeil/Check hinter Milchglas + Glow).
- Kein Ausgrauen/Timeout-Lock, Status bleibt logisch und reversibel.
- Visuelle Basis global nutzbar (Design-Token-Ansatz).

Status
- Step 6: completed
- Step 7: completed
- Step 8: completed
- Step 9: completed
- Step 10: completed

Scope
- Status-Icon rechts an der Karte (SVG, Glasflaeche, softer Glow).
- Removal des Timeout-Locks (kein Auto-Reset).
- Reversibel pro Medikament (genommen <-> offen).
- Globaler Glow-Style als Pattern (spaeter fuer Save/States nutzbar).

Nicht im Scope
- Neue Backend-Modelle.
- Vollstaendiges Redesign des Intake-Panels.
- Neue Supabase RPCs.

Deterministische Steps

Step 6: Interaktionsmodell fixieren
6.1 Definiere, wie Auswahl/Bestaetigung ohne Checkbox funktioniert (Tap-Zone, Status-Toggle, Footer-CTA).
6.2 Definiere Status-States (neutral/offen vs genommen) + Reversibel-Regel.
6.3 Entscheide, ob "Alle genommen" entfernt oder als Option fuer leere Auswahl bleibt.
Output: klare Interaktionsregeln (Text) + finale Button-Liste.
Exit-Kriterium: UX-Regeln sind fixiert.

6.1 Entwurf (Interaktionsmodell)
- Default: alle offenen Medikamente sind im Batch-Selection State (subtiler Rahmen/Glow).
- Tap auf Karte toggelt Selection (ohne Checkbox sichtbar).
- Primary CTA: "Auswahl bestaetigen (n)" bestaetigt nur selektierte Karten.
- Status-Indicator (Pfeil/Check + Glow) erscheint erst nach bewusstem Save.
- Revert: Tap auf Status-Indicator toggelt genommen <-> offen (kein Timeout).

6.2 Entwurf (Status-States + Reversibel)
- Zustand "offen": kein Status-Icon, neutrale Karte (kein Grau).
- Zustand "genommen": Status-Pfeil erscheint (Glas + Glow).
- Reversibel: Tap auf Status-Pfeil setzt wieder "offen" (RPC `med_undo_dose`).
- Direktes Toggle: keine Sperrfrist, keine Auto-Resets.

6.3 Entscheidung (Buttons)
- "Alle genommen" wird entfernt.

Step 7: Globale Glow-Basis
7.1 Tokens in `app/styles/base.css` (Farbe/Blur/Shadow fuer Status-Glow).
7.2 Pattern in `app/styles/ui.css` (z. B. `.status-glow`, Varianten ok/neutral).
Output: wiederverwendbare Glow-Basis.
Exit-Kriterium: Glow-Pattern ist global und modulunabhaengig.

Status-Update
- Tokens in `app/styles/base.css` + Pattern in `app/styles/ui.css` angelegt.

Step 8: Markup fuer Status-Pfeil
8.1 Karten-Markup ergaenzen (Status-Container rechts, SVG-Icon, Glasflaeche).
8.2 Checkbox-Elemente entfernen oder als Hidden-State ersetzen (je nach Step 6).
Output: neues Markup in `index.html`.
Exit-Kriterium: Karte hat Status-Slot fuer Icon/Glow.

Status-Update
- Status-Slot pro Karte in `app/modules/intake-stack/intake/index.js` + "Alle genommen" aus Footer entfernt in `index.html`.

Step 9: JS-Logik (Status Toggle + No Timeout)
9.1 Timeout-Reset entfernen.
9.2 Status-Icon zeigt taken/offen pro Medikament.
9.3 Reversibel: pro Karte toggelbar (Undo ohne Zeitfenster).
9.4 Footer-CTA an neues Modell anpassen (Label/States).
9.5 CTA nur anzeigen, wenn mindestens ein Medikament "offen" ist (sonst ausblenden oder Status-Pill).
Output: funktionierende Status-Logik ohne Lock.
Exit-Kriterium: taken/offen ist jederzeit logisch aenderbar.

Status-Update
- Auto-Reset/Timeout nach Batch-Save entfernt (kein Lock).
- Status-Icon Slot + Toggle-Handling fuer taken/offen eingebaut.
- Reversibel per Status-Icon (med_confirm_dose/med_undo_dose).
- Footer-CTA wird ausgeblendet, wenn keine offenen Medikamente vorhanden sind.
- Auswahl-Info unter dem CTA entfernt.

Step 10: Styling / Feinschliff
10.1 Glasflaeche + Glow auf Status-Slot (ruhig, kein Neon).
10.2 Karte bleibt visuell stabil (kein Ausgrauen).
10.3 Mobile-Layout pruefen (Icon rechts gut lesbar).
Output: konsistenter Look (MIDAS-Style).
Exit-Kriterium: Status ist peripher gut erkennbar, ohne zu dominieren.

Status-Update
- Checkboxen reduziert, Status-Slot verfeinert, Detailtext lesbarer (Mobile).
