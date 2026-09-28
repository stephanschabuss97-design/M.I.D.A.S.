# MIDAS Activity V2 – Aktionsplan nach R14

Stand: 2026-09-28
Status: Punkte 1 bis 3 abgeschlossen; Punkt 4 offen

## Zweck und Reihenfolge

Vor C4 und R15 sollen vier Beobachtungen aus der produktiven Activity-V2-Nutzung bearbeitet werden. Die Reihenfolge folgt dem **vermuteten Aufwand**, nicht einer bereits bewiesenen Ursache. Jeder Punkt wird einzeln untersucht, umgesetzt und geprüft. Der Nachweisumfang und aufgeschobene Geräteprüfungen werden beim jeweiligen Punkt festgehalten.

| Nr. | Thema | Vermuteter Aufwand | Status |
| --- | --- | --- | --- |
| 1 | Export-Zeitraum innerhalb von Activity V2 bedienen | eher klein | abgeschlossen; von Stephan auch am Handy akzeptiert |
| 2 | Mobile Sessionansicht vertikal verdichten | mittel | abgeschlossen; Web- und Handyansicht von Stephan akzeptiert |
| 3 | Suche für die nächste Übung am unteren Ende erreichbar machen | mittel bis größer | abgeschlossen; von Stephan am Handy akzeptiert |
| 4 | Sessionabschluss nach längerer Hintergrundphase reparieren | offen, vermutlich am größten | lokaler Fix geprüft; Handytest offen |

## 1. Export bleibt in der Trainingsansicht

**Beobachtung:** Nach „Export“ liegt die Zeitraumsauswahl auf dem Handy offenbar hinter der noch geöffneten Activity-V2-Ansicht. Sie lässt sich erst bedienen, wenn Activity V2 geschlossen wurde. Die Screenshots aus dem Gespräch vom 2026-09-28 dokumentieren den sichtbaren Zustand.

**Ziel:** Zeitraum auswählen, Export laden beziehungsweise herunterladen und zur Session zurückkehren, ohne die Trainingsansicht zu verlassen oder einen laufenden Draft zu verlieren.

**Prüfung:** Den echten mobilen Produktfluss von „Export“ über die Zeitraumsauswahl bis zum Download und zurück durchlaufen. Sichtbarkeit, Bedienbarkeit, Fokus, Scrollen und Draft-Erhalt prüfen. Der bestehende R10-Exportvertrag und seine Zeitraumgrenzen bleiben maßgeblich.

**Detektivbefund 2026-09-28:** Der R10-Export wurde in R14 produktiv eingebunden. `#activityV2ExportHost` liegt direkt unter `body`, bleibt aber im normalen Seitenfluss (`position: static`, `z-index: auto`). Das offene Hub-Panel und seine Hub-Abdeckung liegen als feste Ebenen darüber (`z-index: 40` beziehungsweise `30`). Ein lokaler Edge-/Playwright-CSS-Nachweis bei `390 × 844` traf bei offenem Panel über den Export-Controls die Hub-Ebene; nach dem Schließen traf derselbe Punkt den Export-Button. Der Test verwendete die echte Produkt-CSS und synthetische Controls, aber weder Login noch Export-RPC. Außerdem wird die isolierte R10-Export-CSS produktiv importiert und setzt globale helle `:root`-/`body`-Styles; das erklärt den hellen Bereich unter dem Hauptinhalt und muss beim Fix mitgeprüft werden. R14-Finding F29 hatte die Overlayhosts wegen des transformierten Hub-Panels bewusst unter `body` verlegt. Der Fix soll diese Grenze erhalten und den Export-Host als eigene bedienbare Ebene gestalten; der echte Produktfluss bleibt danach als Nachweis erforderlich.

**Lokaler Fix 2026-09-28:** Der Export-Host bleibt unter `body` und liegt geöffnet als dunkle, bildschirmfüllende und eigenständig scrollbare Ebene über dem Hub-Panel. Escape schließt nur den Export; der Fokus bleibt währenddessen in der Exportansicht und kehrt danach zum Exportknopf zurück. Die PWA-Cache-Version wurde für die geänderten Assets auf `v25` gehoben. Im lokalen Edge-Test bei `390 × 844` waren Zeitraumwahl und Rückkehr bei offenem Hub-Panel bedienbar; Escape, Tab-Umlauf und Fokus-Rückgabe funktionierten. Der Test lief mit dem echten Produktcontroller und einem lokalen Fake-Transport, ohne Login oder produktiven Export-RPC. Zum Zeitpunkt dieses lokalen Tests stand der Android-Durchlauf noch aus; der Webfluss wurde anschließend von Stephan akzeptiert.

**Web-Abnahme 2026-09-28:** Stephan hat den Fix auf dem Live Server angesehen und für den Webfluss akzeptiert. Commit `851f73c` ist auf `origin/main`. Android-PWA, echter Download und Draft-Erhalt wurden bei dieser ersten Abnahme nicht gesondert nachgewiesen.

**Geräte-Abnahme 2026-09-28:** Stephan hat Punkt 1 nach der Handyprüfung als grün und abgeschlossen gemeldet. Einzelne Teilschritte des Geräteflusses wurden in dieser Rückmeldung nicht separat protokolliert.

## 2. Mobile Sessionansicht verdichten

**Beobachtung:** Activity V2 beansprucht am Handy zu viel vertikale Fläche. Dadurch sind während einer Session weniger relevante Eingaben gleichzeitig sichtbar.

**Ziel:** Abstände und Informationsanordnung gezielt kompakter gestalten, ohne Eingabefelder, Fehlermeldungen, historische Werte oder Touch-Bedienung unklar zu machen.

**Prüfung:** Reale Session mit Kraft- und Dauer-Item auf schmalen mobilen Viewports ansehen und bedienen. Lesbarkeit, Touchziele, Tastatur, Scrollweg und fehlenden horizontalen Überlauf prüfen. Keine fachlichen Daten oder Eingaberegeln ändern.

### Deep Dive: Card-Dichte, 2026-09-28

**Vergleichsbasis:** Stephans Screenshot der ursprünglichen Trainings-App zeigt eine Übungskarte mit kompaktem Kopf (Name und Gerät), einer gemeinsamen Spaltenüberschrift, drei nebeneinander angeordneten Satzzeilen, kurzem Notiz-Zugang und „Set hinzufügen“ am Kartenende. Im lokalen Edge-Browser wurde die echte Activity-V2-Session-Shell mit dem isolierten `fixture=all`-Harness bei `390 × 844` betrachtet; die Daten sind synthetisch, der eingeloggte Produktfluss wurde hier nicht geöffnet. Die MIDAS-Karte „Ab Wheel Rollout“ maß etwa 1240 px Höhe, „Assisted Dip“ etwa 1467 px. Das sind Messwerte dieses Fixtures, keine Zielgrößen oder Produktmessung. Der erste sichtbare Satz beginnt erst nach Header, Einleitung, Suchkarte, Sessionablauf-Überschrift und eigenem History-Block.

**Vorschläge in sinnvoller Reihenfolge:**

1. **Eine Übung, eine klare Karte.** Den Übungsnamen mit Gerätetyp direkt im Kartenkopf zeigen. Die heute separat umrandeten Bereiche „Letzte Ausführung“ und „Aktuelle Sätze“ visuell in die Übungskarte integrieren. Weniger ineinanderliegende Rahmen, Schatten, Innenabstände und Überschriften schaffen Platz, ohne Inhalte zu entfernen. Die Gerätebezeichnung ist im aktuellen Katalog bereits vorhanden; historische Geräteangaben bleiben als historische Werte erkennbar.
2. **Historie sichtbar lassen.** Datum und letzte Werte bleiben ohne zusätzlichen Klick direkt in jeder Übungskarte lesbar; nur Rahmen und Innenabstände werden gestrafft. Die „Vorher“-Spalte des Beispiels nicht unbesehen übernehmen: Historische und aktuelle Satzanzahl können abweichen, und MIDAS unterscheidet mehrere Feld- und Gerätemodi.
3. **Sätze als gemeinsame mobile Eingabetabelle.** Spaltenbezeichnungen einmal pro Übung statt über jedem Satz; pro Satz eine Zeile mit Nummer und den tatsächlich benötigten Feldern (z. B. Wiederholungen und Gewicht). Die heutigen mobilen Regeln stapeln beide Felder untereinander und geben jedem Satz einen eigenen Rahmen plus eine volle Zeile „Satz entfernen“; im Harness maß ein zweifeldriger Satz etwa 249 px. Ein 44-px-Löschziel kann am Zeilenende bleiben. Bei sehr schmalem Viewport, großen Schriftgrößen oder Feldfehlern muss die Zeile geordnet umbrechen, statt zu quetschen oder horizontal zu scrollen. MIDAS hat keinen gespeicherten „Satz erledigt“-Haken; ein solcher Haken gehört nicht zu diesem Layoutschritt.
4. **Notizen und Kartenaktionen verkürzen.** Leere Itemnotizen als gut erreichbaren „Notiz hinzufügen“-Zugang zeigen, vorhandene Notizen mit kurzem Hinweis und direktem Öffnen/Bearbeiten. „Nach oben“, „Nach unten“ und „Entfernen“ derzeit unter jeder Karte beanspruchen mobil zwei zusätzliche Buttonreihen; ein klar beschriftetes Aktionsmenü im Kartenkopf könnte sie bündeln. Tastaturbedienung, Fokus und die vorhandenen Guards müssen erhalten bleiben.
5. **Oberen Einstieg straffen.** Nach dem ersten Item den dauerhaften Einleitungstext und die doppelte Orientierung „Deine Session“/„Sessionablauf“ reduzieren. Die Suche oben bleibt zunächst bestehen; der daumenerreichbare Zugang am Listenende ist ausschließlich Punkt 3. Sessionnotiz und Abschlussbereich sollten bei diesem Pass auf unnötige Höhe geprüft werden, ohne Commit- oder Notizsemantik zu verändern.

**Dateien für eine spätere Umsetzung:** Hauptsächlich `app/modules/vitals-stack/activity/v2/session-shell.css` (mobile Grids, Abstände, Card-Struktur) und `app/modules/vitals-stack/activity/v2/session-shell.js` (Kartenkopf, History-Vorschau, gemeinsame Satzüberschriften, Notiz- und Aktionszugang). Bei geänderter Interaktion `app/modules/vitals-stack/activity/v2/session-shell.contract.test.js` und der bestehende `session-shell-harness.html` mit seinen Fixtures für schmale Viewports. Für eine produktive PWA-Auslieferung zusätzlich Cache-Referenzen in `app/app.css`, `index.html` und `service-worker.js`. Draft, Semantik, Datenzugriff, SQL und Export brauchen für diese Vorschläge keine Änderung.

**Prüffokus für die Sichtprüfung:** Eine Kraftübung mit und ohne Gewicht, eine Dauer-/Distanzübung, leere und lange Notizen, fehlende oder umfangreiche Historie, Fehlertexte und große Schrift. Ziel ist eine deutlich kürzere Übungskarte bei unverändert großen Touchzielen und gleicher Datenbedeutung.

**Layout-Umsetzung 2026-09-28:** Die vorhandene Session-Shell wurde gezielt verdichtet: Geräteart im Kartenkopf, mobil nebeneinanderliegende Satzfelder mit 44-px-Löschziel, kleinere Innenabstände und eine Reihe für Kartenaktionen. Die letzte Ausführung mit ihren Werten bleibt auf PC und Handy direkt sichtbar; eine zwischenzeitliche Aufklappvariante wurde nach Stephans Rückmeldung wieder entfernt. Nach dem ersten Item entfällt die Einleitung nur auf schmalen Viewports. Bei höchstens 350 px brechen Satznummer und Löschziel in eine eigene Zeile um; Feldfehler bleiben unter den Eingaben. Der bestehende Draft-, Lookup-, Commit- und Datenvertrag wurde nicht geändert. Die PWA-Assetreferenzen wurden auf `v26` gesetzt. Im synthetischen Browser-Harness bei 390 × 844 blieben die letzten Werte direkt sichtbar; die betrachteten Drei-Satz-Karten maßen etwa 810 px statt zuvor 1240 beziehungsweise 1467 px. Bei 320 × 800 trat auch mit langer historischer Notiz kein horizontaler Überlauf auf. Beide Werte sind Harness-Messungen, keine produktiven Sessiondaten. Stephan hat die Webansicht akzeptiert.

**Rückfallpunkt:** Der lokale Git-Branch `backup/activity-v2-pre-compact-cards` zeigt auf `851f73c`, den Stand vor diesem Layoutentwurf. Vor einer Rücknahme nur die geänderten Code- und Assetdateien gegen diesen Branch prüfen und gezielt wiederherstellen; der Aktionsplan und andere unbeteiligte lokale Änderungen bleiben erhalten. Der Rückfallpunkt bleibt lokal; die Umsetzung wurde als `642bc23` auf `main` veröffentlicht.

**Nativer Review:** Ein schmaler Ein-Feld-Satz bekam im ersten Entwurf zu wenig Eingabebreite; im 320-px-Fallback nutzt er jetzt die verfügbare Breite. Die PWA-Referenzen für CSS/JS sind auf `v26` abgestimmt. Der History-Block nutzt wieder den vorherigen, stets sichtbaren Lesepfad. Die reale Android-PWA und persönliche Sessiondaten wurden dafür nicht verwendet.

**Geräte-Abnahme 2026-09-28:** Stephan hat die veröffentlichte Ansicht am Handy geprüft und bestätigt, dass sie gut aussieht. Punkt 2 ist damit abgeschlossen.

## 3. Nächste Übung ohne Rückscrollen hinzufügen

**Beobachtung:** Am Ende einer längeren Session muss Stephan für die nächste Übung zurück zum Suchfeld am Anfang scrollen.

**Ziel:** Solange die ursprüngliche Suchkarte sichtbar ist, bleibt der heutige Einstieg bestehen. Sobald sie beim Abwärtsscrollen aus dem sichtbaren Bereich verschwindet, erscheint rechts ein mit dem Daumen erreichbarer Zugang. Er holt das Suchfeld für die nächste Übung herein; es entsteht kein Karussell und kein zweiter fachlicher Such- oder Draftpfad.

**Prüfung:** Ein- und Ausblendung beim Scrollen, Suche und kanonische Auswahl am Listenende, Tastatur und Fokus, Rückkehr zur Session sowie Verhalten bei kurzem Viewport und offenem Dialog prüfen. Punkt 2 bildet die Layoutgrundlage.

**Lokale Umsetzung 2026-09-28:** Auf schmalen Ansichten erscheint nach dem Herausscrollen der oberen Suchkarte rechts unten „Übung hinzufügen“. Der Button blendet dieselbe Suchkarte als kleines Panel über der Session ein; Suche und Draft-Auswahl bleiben dieselben. Schließen oder Escape bringt den Fokus zum Button zurück, eine Auswahl schließt das Panel vor dem Fokuswechsel zum Item. Ohne Sichtbarkeits-API bleibt der Button mobil ständig verfügbar. Rückfallpunkt ist der lokale Branch `backup/activity-v2-pre-quick-add` auf `30168bb`. Im isolierten Edge-Harness funktionierten Ein-/Ausblendung, Auswahl und Escape bei 390 × 844 und 320 × 600 ohne horizontalen Überlauf oder Konsolenfehler; bei acht Treffern scrollt das Panel intern. Schließen ließ die Scrollposition unverändert, auf Desktop blieb der Button verborgen, und der Fallback ohne Sichtbarkeits-API wurde geprüft. 60 gezielte Contract-Tests bestanden. Zum Zeitpunkt dieser lokalen Prüfung standen die produktive Android-Ansicht und der eingeloggte Produktfluss noch zur Sichtprüfung aus.

**Handy-Abnahme und kleine Nachbesserung 2026-09-28:** Stephan ist mit Punkt 3 auf dem Handy zufrieden und erklärt ihn für abgeschlossen. Sein Screenshot zeigte den unteren Button über fast die ganze Breite. Ursache war die mobile globale `button { width: 100%; }`-Regel der produktiv importierten Export-CSS; der isolierte Harness lud diese CSS nicht. Der Quick-Add-Button und der Schließen-Button des Suchpanels erhalten deshalb in der Session-CSS ausdrücklich Inhaltsbreite. Der Check mit der gesamten Produkt-CSS zeigte wieder einen kompakten Button rechts; die PWA-Assetversion wurde auf `v28` gesetzt. Die optische Nachbesserung wurde noch nicht erneut auf Android angesehen.

## 4. Sessionabschluss nach Unterbrechung

**Beobachtung:** Beim ersten Training blieb der Abschluss nach längerer Nutzung anderer Android-Apps bei „Session wird gespeichert …“ stehen. Nach Schließen und Neustart von MIDAS ließ sich derselbe erhaltene Draft abschließen. Ein kurzer Zwei-Minuten-Test mit mehreren Fensterwechseln funktionierte. Damit ist eine längere Hintergrundphase oder eine Token-Erneuerung verdächtig; der konkrete Geräteauslöser ist noch nicht bewiesen.

**Ziel:** Auch ein fortgesetzter Draft lässt sich zuverlässig und genau einmal abschließen. Bei unklarer Serverantwort bleiben derselbe Commit-Intent und dieselbe Request-ID für einen kontrollierten Retry erhalten.

**Prüfung:** Den Abschluss nach längerer Hintergrundphase und abgewiesenem Access Token prüfen. Danach Fensterwechsel, Reload/Neustart, Fortsetzen, Abschluss, Unknown Outcome und History-Eintrag als vollständige Kette prüfen. Commit-Intent, Request-ID, SQL und medizinische Consumer bleiben unverändert.

**Lokaler Befund und Fix 2026-09-28:** Der Edge-Harness mit dem echten `fetchWithAuth` zeigte zwei Fehler: Ein hängendes `refreshSession()` ließ den Abschluss über den zehnsekündigen Request-Timeout hinaus warten; nach erfolgreichem Refresh verwendete der zweite Request erneut den alten Header und erhielt 401. Ein separater kontrollierter Auth-Callback-Harness reproduzierte den dokumentierten Supabase-Deadlock: Der bisherige asynchrone Callback wartete auf Realtime-Arbeit, die ihrerseits auf die Auth-Erneuerung wartete. Lokal sind Auth-Callbacks nun synchron mit nachgelagerter Arbeit; verspätete Ereignisse dürfen neuere Auth-Zustände nicht überschreiben. Der Refresh ist begrenzt und der Header wird danach frisch aufgebaut. Für die PWA-Auslieferung wurden Supabase-Importgraph und Service Worker gemeinsam auf v29 gesetzt. Die lokalen Harnessfälle für Refresh, hängenden Refresh, Logout während hängendem Realtime-Aufbau, Activity-Reauth, Recovery und Unknown/Retry sowie die frische v29-Cache-Installation bestanden. Die ursprüngliche Android-Situation wurde damit noch nicht auf dem Gerät reproduziert; Punkt 4 bleibt bis zum Praxistest offen.

## Arbeitsgrenzen

- Dieser Aktionsplan ist eine Merkliste und noch keine freigegebene Implementierungsroadmap. Vor jedem Punkt gelten die aktuellen MIDAS-Verträge, der relevante Code- und Produktstand sowie die erforderlichen Gates.
- Activity V2 bleibt der einzige produktive Writer. Activity V1 bleibt historisch lesbar. Kein Dual Write und keine Änderung an medizinischen Consumern durch UI-Polishing.
- C4 (Protein-Relevanz) und R15 (Vorlagenimport) sind eigene Folgearbeiten. Ihre Verträge werden durch diese Liste nicht vorweggenommen.
- Die frühere Katalogfrage „Delts Machine / Upper Back“ ist gestrichen: Beide Suchbegriffe sind bereits im Katalog v2 vorhanden.

## Kontext

- [Activity-V2-Masterplan](Future%20trainingsmodule%20update%20thoughts.md)
- [Activity Module Overview](modules/Activity%20Module%20Overview.md)
- [R14 Repair Findings](MIDAS%20Activity%20V2%20R14%20Repair%20Findings.md)
