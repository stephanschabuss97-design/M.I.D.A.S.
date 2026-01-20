# Device Module Scaling Roadmap (Mobile / Tablet / Desktop)

Ziel
- Module nach Hauptgeraet optimieren: Mobile (Intake, Vitals, Appointments, Text-Chat), Tablet-Portrait (Arzt-Ansicht, Charts), Desktop (Profil, Touchlog).
- Einheitliche Layout-Regeln pro Geraeteklasse, ohne Bruch im Rest.

Start hier (fuer neue Sessions)
1) Oeffne:
   - `docs/Device Module Scaling Roadmap.md` (dieses Dokument)
   - `index.html`
   - `app/styles/hub.css`
   - `app/styles/layout.css`
   - `app/styles/utilities.css`
2) Zielbild: Klare Geraete-Prioritaeten pro Modul + feste UI-Regeln je Klasse.
3) Wenn der Status-Block unten "pending" zeigt, starte mit Step 1.

Status
- Step 1: done
- Step 2: done
- Step 3: pending
- Step 4: done
- Step 5: done
- Step 6: done
- Step 7: pending
- Step 8: pending
- Step 9: pending
- Step 10: pending

Scope
- Geraete-Prioritaeten pro Modul (Mobile/Tablet/Desktop).
- Einheitliche Layout-Regeln pro Geraeteklasse (Spacing, Typo, Dichte, Scroll).
- Modul-spezifische Anpassungen nur fuer priorisierte Geraete.
- Dokumentierte Design-Entscheidungen (why/when).

Nicht im Scope
- Komplette Redesigns einzelner Module.
- Neue Datenmodelle oder Backend-Aenderungen.
- Neue Features im Funktionsumfang.

Deterministische Steps

Step 1: Bestandsaufnahme & Prioritaeten fixieren
1.1 Liste aller Hub-Module und ihre Hauptgeraete (Mobile/Tablet/Desktop).
    - Mobile: Intake, Vitals, Appointments, Text-Chat (assistant-text)
    - Tablet-Portrait: Arzt-Ansicht (doctor), Charts (chart)
    - Desktop: Profil (profile), Touchlog (diag)
1.2 Definiere "A-Qualitaet" pro Modul (muss dort sehr gut aussehen).
    - A-Qualitaet (Mobile): Intake, Vitals, Appointments, Text-Chat
    - A-Qualitaet (Tablet-Portrait): Arzt-Ansicht, Charts
    - A-Qualitaet (Desktop): Profil, Touchlog
1.3 Definiere "B-Qualitaet" fuer Nebengeraete (funktional, kompakt).
    - B-Qualitaet (Mobile): Arzt-Ansicht, Charts, Profil, Touchlog
    - B-Qualitaet (Tablet-Portrait): Intake, Vitals, Appointments, Text-Chat, Profil, Touchlog
    - B-Qualitaet (Desktop): Intake, Vitals, Appointments, Text-Chat, Arzt-Ansicht, Charts
Output: Matrix Modul x Geraet + Prioritaeten.
Exit-Kriterium: Klarer Prioritaeten-Plan abgestimmt.

Step 2: Geraete-Layouts definieren
2.1 Lege Breakpoints fest (Mobile, Tablet-Portrait, Desktop).
    - Mobile: <= 640px
    - Tablet-Portrait: 641px - 900px
    - Desktop: >= 901px
2.2 Definiere globale Regeln je Klasse:
    - Spacing/Typo/Controls-Dichte
    - Panel-Scroll-Verhalten
    - Header/Action-Bereiche
    - Mobile: grosse Touch-Zonen, vertikale Flows, kompakte Header, ein Scroll-Container
    - Tablet-Portrait: mehr Datenflaeche, 2-Spalten wo sinnvoll, klare KPI-Module
    - Desktop: hoehere Dichte, Sidebars erlaubt, Formulare mit Mehrspalten
Output: Layout-Regeln als kurze Liste.
Exit-Kriterium: Einheitliche Regeln schriftlich fixiert.

Step 3: Modul-Regeln je Geraet
3.1 Mobile-Optimierung: Intake, Vitals, Appointments, Text-Chat.
    - Intake: nur 1 Spalte, grosse Inputs, Buttons volle Breite, Scroll bis unten ohne Nested-Scrolls
    - Vitals: KPI-Karten gestapelt, Datum/Filter oben fix, Formulare im Akkordeon
    - Appointments: Listen priorisieren, neue Termine als Bottom-Flow, Actions full-width
    - Text-Chat: Eingabe fix unten, Pills/Context einklappbar, Media-Previews kompakt
3.2 Tablet-Portrait: Arzt-Ansicht, Charts.
    - Arzt-Ansicht: 2-Spalten-Layout (Inhalt links, Aktionen rechts), Filter oben, Listen mit mehr Zeilenhoehe
    - Charts: groessere Plot-Flaeche, Legenden neben dem Chart, Tooltips fingerfreundlich
3.3 Desktop: Profil, Touchlog.
    - Profil: Mehrspalten-Formular, Sidebar fuer Schnellnavigation, lange Texte voll sichtbar
    - Touchlog: breite Tabelle mit Filter/Sort, fixe Kopfzeile, Statusfarben klar
Output: Pro Modul 3-5 konkrete Anpassungen.
Exit-Kriterium: Modul-spezifische Anforderungen festgelegt.

Step 4: Risikocheck & Abwaegung
4.1 Identifiziere Layout-Risiken (z.B. Doppel-Scroll, Header-Overlaps).
    - Doppel-Scroll (Panel-Scroll vs Body-Scroll)
    - Header/Actions ueberdecken Content auf kleinen Hoehen
    - Zu enge Inputs auf Mobile (Touch-Fail)
    - Charts/Tabellen brechen bei Tablet-Portrait
4.2 Definiere Regression-Checks pro Modul.
    - Intake/Vitals/Appointments: Scroll bis ganz unten, Buttons klickbar, keine abgeschnittenen Footer
    - Text-Chat: Input bleibt sichtbar, neue Messages autoscrollen, Media bleibt im View
    - Arzt/Charts: Filter sichtbar, Chart-Labels lesbar, Tooltips erreichbar
    - Profil/Touchlog: Formulare ohne horizontales Scrollen, Tabellen bleiben lesbar
Output: Liste moeglicher Brueche + Checks.
Exit-Kriterium: Risiko-Liste und Tests sind klar.

Step 5: Umsetzungsreihenfolge
5.1 Reihenfolge nach Impact und Risiko definieren.
    - Phase 1 (Quick Wins): Scroll-Fixes, Spacing-Mobile, Button-Breiten
    - Phase 2: Mobile-Module (Intake, Vitals, Appointments, Text-Chat)
    - Phase 3: Tablet-Module (Arzt, Charts)
    - Phase 4: Desktop-Module (Profil, Touchlog)
5.2 Quick Wins zuerst (z.B. Scroll-Fixes, Spacing).
    - Nach jeder Phase: Mobile/Tablet/Desktop Smoke-Test laut Step 4

Step 6: Phase 1 Umsetzung (Quick Wins)
6.1 Scroll-Container vereinheitlichen (ein Scroll pro Panel). (done)
6.2 Mobile-Spacing und Button-Breiten vereinheitlichen. (done)
Output: Keine abgeschnittenen Inhalte auf Mobile.
Exit-Kriterium: Scroll bis unten in allen Panels.

Step 7: Phase 2 Umsetzung (Mobile-Module)
7.1 Intake/Vitals/Appointments/Text-Chat nach Mobile-Regeln anpassen. (done)
7.2 UI-Kurztest auf Mobile (Touch, Scroll, Lesbarkeit).
Output: Mobile-Module A-Qualitaet.
Exit-Kriterium: Mobile-Regression-Checks gruen.

Step 8: Phase 3 Umsetzung (Tablet-Module)
8.1 Arzt-Ansicht und Charts nach Tablet-Portrait-Regeln anpassen.
8.2 UI-Kurztest auf Tablet-Portrait.
Output: Tablet-Module A-Qualitaet.
Exit-Kriterium: Chart/Filter/Listen ohne Layout-Brueche.

Step 9: Phase 4 Umsetzung (Desktop-Module)
9.1 Profil und Touchlog nach Desktop-Regeln anpassen.
9.2 UI-Kurztest auf Desktop.
Output: Desktop-Module A-Qualitaet.
Exit-Kriterium: Formulare und Tabellen stabil.

Step 10: Abschluss & QA
10.1 Gesamtschau (alle Module/Devices).
10.2 Restlisten / Follow-ups dokumentieren.
Output: Roadmap abgeschlossen.
Exit-Kriterium: Keine kritischen offenen Punkte.
Output: Realistischer Umsetzungsplan mit Reihenfolge.
Exit-Kriterium: Roadmap bereit fuer Umsetzung.

Hinweis
- Texte hier sind absichtlich mit ae/oe/ue, du korrigierst spaeter manuell.
