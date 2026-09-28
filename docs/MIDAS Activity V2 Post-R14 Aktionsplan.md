# MIDAS Activity V2 – Aktionsplan nach R14

Stand: 2026-09-28
Status: offen; Arbeitsliste für einzelne, getrennt prüfbare Änderungen

## Zweck und Reihenfolge

Vor C4 und R15 sollen vier Beobachtungen aus der produktiven Activity-V2-Nutzung bearbeitet werden. Die Reihenfolge folgt dem **vermuteten Aufwand**, nicht einer bereits bewiesenen Ursache. Jeder Punkt wird einzeln untersucht, umgesetzt und geprüft. Ein Abschluss wird erst nach einem Nachweis im tatsächlichen Produktfluss eingetragen.

| Nr. | Thema | Vermuteter Aufwand | Status |
| --- | --- | --- | --- |
| 1 | Export-Zeitraum innerhalb von Activity V2 bedienen | eher klein | lokal umgesetzt und geprüft; Gerät offen |
| 2 | Mobile Sessionansicht vertikal verdichten | mittel | offen |
| 3 | Suche für die nächste Übung am unteren Ende erreichbar machen | mittel bis größer | offen |
| 4 | Sessionabschluss nach Fensterwechsel oder Neustart reparieren | offen, vermutlich am größten | offen |

## 1. Export bleibt in der Trainingsansicht

**Beobachtung:** Nach „Export“ liegt die Zeitraumsauswahl auf dem Handy offenbar hinter der noch geöffneten Activity-V2-Ansicht. Sie lässt sich erst bedienen, wenn Activity V2 geschlossen wurde. Die Screenshots aus dem Gespräch vom 2026-09-28 dokumentieren den sichtbaren Zustand.

**Ziel:** Zeitraum auswählen, Export laden beziehungsweise herunterladen und zur Session zurückkehren, ohne die Trainingsansicht zu verlassen oder einen laufenden Draft zu verlieren.

**Prüfung:** Den echten mobilen Produktfluss von „Export“ über die Zeitraumsauswahl bis zum Download und zurück durchlaufen. Sichtbarkeit, Bedienbarkeit, Fokus, Scrollen und Draft-Erhalt prüfen. Der bestehende R10-Exportvertrag und seine Zeitraumgrenzen bleiben maßgeblich.

**Detektivbefund 2026-09-28:** Der R10-Export wurde in R14 produktiv eingebunden. `#activityV2ExportHost` liegt direkt unter `body`, bleibt aber im normalen Seitenfluss (`position: static`, `z-index: auto`). Das offene Hub-Panel und seine Hub-Abdeckung liegen als feste Ebenen darüber (`z-index: 40` beziehungsweise `30`). Ein lokaler Edge-/Playwright-CSS-Nachweis bei `390 × 844` traf bei offenem Panel über den Export-Controls die Hub-Ebene; nach dem Schließen traf derselbe Punkt den Export-Button. Der Test verwendete die echte Produkt-CSS und synthetische Controls, aber weder Login noch Export-RPC. Außerdem wird die isolierte R10-Export-CSS produktiv importiert und setzt globale helle `:root`-/`body`-Styles; das erklärt den hellen Bereich unter dem Hauptinhalt und muss beim Fix mitgeprüft werden. R14-Finding F29 hatte die Overlayhosts wegen des transformierten Hub-Panels bewusst unter `body` verlegt. Der Fix soll diese Grenze erhalten und den Export-Host als eigene bedienbare Ebene gestalten; der echte Produktfluss bleibt danach als Nachweis erforderlich.

**Lokaler Fix 2026-09-28:** Der Export-Host bleibt unter `body` und liegt geöffnet als dunkle, bildschirmfüllende und eigenständig scrollbare Ebene über dem Hub-Panel. Escape schließt nur den Export; der Fokus bleibt währenddessen in der Exportansicht und kehrt danach zum Exportknopf zurück. Die PWA-Cache-Version wurde für die geänderten Assets auf `v25` gehoben. Im lokalen Edge-Test bei `390 × 844` waren Zeitraumwahl und Rückkehr bei offenem Hub-Panel bedienbar; Escape, Tab-Umlauf und Fokus-Rückgabe funktionierten. Der Test lief mit dem echten Produktcontroller und einem lokalen Fake-Transport, ohne Login oder produktiven Export-RPC. Ein Durchlauf auf Stephans Android-Gerät samt echtem Download und Draft-Erhalt steht noch aus; erst danach Punkt 1 als abgeschlossen markieren.

## 2. Mobile Sessionansicht verdichten

**Beobachtung:** Activity V2 beansprucht am Handy zu viel vertikale Fläche. Dadurch sind während einer Session weniger relevante Eingaben gleichzeitig sichtbar.

**Ziel:** Abstände und Informationsanordnung gezielt kompakter gestalten, ohne Eingabefelder, Fehlermeldungen, historische Werte oder Touch-Bedienung unklar zu machen.

**Prüfung:** Reale Session mit Kraft- und Dauer-Item auf schmalen mobilen Viewports ansehen und bedienen. Lesbarkeit, Touchziele, Tastatur, Scrollweg und fehlenden horizontalen Überlauf prüfen. Keine fachlichen Daten oder Eingaberegeln ändern.

## 3. Nächste Übung ohne Rückscrollen hinzufügen

**Beobachtung:** Am Ende einer längeren Session muss Stephan für die nächste Übung zurück zum Suchfeld am Anfang scrollen.

**Ziel:** Solange die ursprüngliche Suchkarte sichtbar ist, bleibt der heutige Einstieg bestehen. Sobald sie beim Abwärtsscrollen aus dem sichtbaren Bereich verschwindet, erscheint rechts ein mit dem Daumen erreichbarer Zugang. Er holt das Suchfeld für die nächste Übung herein; es entsteht kein Karussell und kein zweiter fachlicher Such- oder Draftpfad.

**Prüfung:** Ein- und Ausblendung beim Scrollen, Suche und kanonische Auswahl am Listenende, Tastatur und Fokus, Rückkehr zur Session sowie Verhalten bei kurzem Viewport und offenem Dialog prüfen. Punkt 2 bildet die Layoutgrundlage.

## 4. Sessionabschluss nach Unterbrechung

**Beobachtung:** Ein durchgehend geöffneter Draft lässt sich abschließen. Nach Fensterwechsel oder App-Neustart und erneutem Öffnen der laufenden Session misslingt der Abschluss. Ein „Sessiontoken-Bug“ ist eine Vermutung, keine Diagnose.

**Ziel:** Auch ein fortgesetzter Draft lässt sich zuverlässig und genau einmal abschließen. Bei unklarer Serverantwort bleiben derselbe Commit-Intent und dieselbe Request-ID für einen kontrollierten Retry erhalten.

**Prüfung:** Den Fehler zuerst im produktnahen Ablauf reproduzieren und die Grenze zwischen Draft, IndexedDB-Recovery, Auth/Lifecycle, Commit und UI bestimmen. Danach Fensterwechsel, Reload/Neustart, Fortsetzen, Abschluss, Unknown Outcome und History-Eintrag als vollständige Kette prüfen. Keine spekulative Änderung an Token-, SQL- oder Commitlogik.

## Arbeitsgrenzen

- Dieser Aktionsplan ist eine Merkliste und noch keine freigegebene Implementierungsroadmap. Vor jedem Punkt gelten die aktuellen MIDAS-Verträge, der relevante Code- und Produktstand sowie die erforderlichen Gates.
- Activity V2 bleibt der einzige produktive Writer. Activity V1 bleibt historisch lesbar. Kein Dual Write und keine Änderung an medizinischen Consumern durch UI-Polishing.
- C4 (Protein-Relevanz) und R15 (Vorlagenimport) sind eigene Folgearbeiten. Ihre Verträge werden durch diese Liste nicht vorweggenommen.
- Die frühere Katalogfrage „Delts Machine / Upper Back“ ist gestrichen: Beide Suchbegriffe sind bereits im Katalog v2 vorhanden.

## Kontext

- [Activity-V2-Masterplan](Future%20trainingsmodule%20update%20thoughts.md)
- [Activity Module Overview](modules/Activity%20Module%20Overview.md)
- [R14 Repair Findings](MIDAS%20Activity%20V2%20R14%20Repair%20Findings.md)
