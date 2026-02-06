# Input Style Polish Plan

Ziel: Alle Eingabefelder in allen Modulen sollen den transparenten Training-Style nutzen
und die App dadurch visuell koharent wirken. Danach arbeiten wir die Schritte gemeinsam ab.

## Plan

1) Ist-Analyse der globalen Input-Styles
   - Dateien: `app/styles/base.css`, `app/styles/hub.css`, ggf. `app/styles/ui.css`
   - Ziel: Klar sehen, welche globalen Regeln aktuell den undurchsichtigen Background setzen.

2) Zielwerte definieren
   - Referenz: Training-Tab Styles in `app/styles/hub.css`
   - Ziel: Welche konkreten Werte sollen global gelten (background, border, radius, focus)?

3) Globale Umstellung in `app/styles/base.css`
   - Die globale Regel fuer `input, select, textarea` auf den transparenten Look anpassen.
   - Keine Modul-spezifischen Overrides anlegen, nur globale Basis.j

4) Sonderfaelle pruefen
   - Betroffene Bereiche: Login-Overlay, Profile, Appointments, Doctor, etc.
   - Ziel: Pruefen, ob es Bereiche gibt, die bewusst einen abweichenden Style brauchen.

5) Feinabstimmung
   - Optional: Kleine lokale Overrides dort, wo Lesbarkeit/UX leidet.

6) Sichtpruefung
   - Manuell durch die Panels klicken (Vitals: BP/Body/Lab/Training, Profile, Appointments).
   - Sicherstellen, dass Kontrast und Fokuszustand ueberall gut lesbar sind.
