# MIDAS Activity V2 Catalog Maintenance Runbook

## Zweck

Dieses Runbook hält fehlende Übungsnamen klein und kontrolliert. Eine neue
Katalogversion ist keine neue Activity-Modulversion: `catalog_version: 3` wäre
weiterhin ein Snapshot für Activity V2 und kein „Activity V3“.

Der Katalog bleibt repo-kontrolliert. Freie, ungeprüfte Übungsnamen in der App
sind nicht vorgesehen, weil Tippfehler und Synonyme sonst die Historie
fragmentieren. CODEX kann einen fehlenden Begriff dagegen zu Hause als kleinen
Katalog-Wartungschange ergänzen.

## Vor einem Planvorschlag

Zuerst gegen den realen maschinenlesbaren Vertrag suchen:

```powershell
node tools/activity-catalog.mjs search "Romanian Deadlift"
node tools/activity-catalog.mjs describe romanian_deadlift
```

Exitcode `0` bedeutet mindestens einen Treffer. Exitcode `2` bedeutet, dass
kein Suchtreffer oder Key vorhanden ist. Die Trefferreihenfolge ist dieselbe
deterministische Rangfolge wie in der Activity-V2-Semantik.

Ein LLM oder Coding-Agent soll keine Übung in einen Plan schreiben, ohne zuvor
mindestens Suchtreffer, kanonischen Key und Feldvertrag geprüft zu haben.

## Alias oder neuer Key

Alias:

- gleiche klassische Bewegung und gleiche Primärmessung;
- nur anderer deutscher/englischer Name, Hanteltyp, Griff, Studio- oder
  Gerätebegriff;
- Beispiele: `Kettlebell Deadlift` -> `deadlift`,
  `Kurzhantel-Rudern` -> `bent_over_row`.

Neuer Key:

- fachlich andere Bewegung mit eigener letzter Leistung; oder
- inkompatible Primärmessung, etwa Sekunden statt Wiederholungen; oder
- inverse Unterstützung statt bewegter Last.

Bei unklarer Bewegungsidentität, Lastsemantik oder Muskelzuordnung stoppen und
eine Owner-Entscheidung dokumentieren. Keine Identität raten.

## Versionsregel

- Noch nicht produktiv geschriebener Snapshot: nach expliziter Owner-
  Entscheidung darf der aktuelle Snapshot korrigiert werden; alle dadurch
  invalidierten Checks werden wiederholt.
- Bereits produktiv vorhandener Snapshot: niemals ändern, aktualisieren oder
  löschen. Den vollständigen Snapshot in die nächste `catalog_version` klonen
  und nur dort Aliase oder Keys ergänzen.
- Jede Version bleibt vollständig; sie ist kein Delta.
- Das produktive Einfügen einer neuen höchsten Version ändert sofort die vom
  R2-Commit akzeptierte Katalogversion und bleibt deshalb owner-gated.
- Bis R7 die versionsgebundene Draft-Recovery, R8 den
  Commit-Kompatibilitätsvertrag und R11 den produktiven Aktivierungsablauf
  bewiesen haben, darf eine nach C2 vorbereitete neue höchste Version lokal
  vollständig gebaut und getestet, aber nicht beiläufig produktiv eingefügt
  werden.

## Kleine Wartung statt neuer Großroadmap

Ein kompakter Katalog-Wartungschange reicht, wenn alle folgenden Bedingungen
gelten:

- Schema, Taxonomien und Feldtypen bleiben unverändert;
- keine Activity-V1-, RLS-, ACL-, RPC- oder Produkt-UI-Änderung;
- Alias oder neue Identität sind fachlich eindeutig;
- alte Katalogversionen bleiben unverändert;
- vollständiger Runtime-/SQL-/Search-/Disposable-Nachweis ist möglich;
- der im Masterplan O-8 definierte Rolloutvertrag wird eingehalten;
- produktiver Write erhält ein eigenes Owner Briefing und eine ausdrückliche
  Freigabe.

Eine eigene Roadmap ist erst nötig, wenn Schema, Messmodell, UI, Migration,
Löschung, Security, unklare Identität oder mehrere Consumer geändert werden.

## Dateien und Reihenfolge

1. Maschinenlesbaren Versionvertrag als Source of Truth erstellen oder ändern.
2. Versionierte Semantik ausschließlich daraus projizieren.
3. Contract-Test und Search-Cases ergänzen.
4. Insert-only SQL als vollständigen Snapshot aktualisieren.
5. Disposable Fixture auf Zähler, Re-Run, Drift-Fail und R2-Commit prüfen.
6. Betroffene Roadmap/Evidence nur mit realen Ergebnissen aktualisieren.

Für den aktuellen Katalog v2 sind die gekoppelten Dateien:

- `docs/MIDAS Activity V2 C2 Catalog Version 2 Contract.md`
- `app/modules/vitals-stack/activity/v2/semantics-v2.js`
- `app/modules/vitals-stack/activity/v2/semantics-v2.contract.test.js`
- `sql/21_Activity_V2_Catalog_V2.sql`
- `sql/tests/21_Activity_V2_Catalog_V2_fixture.sql`

Eine spätere Version erhält eigene versionierte Vertrags-, Runtime-, SQL- und
Fixture-Artefakte sowie einen expliziten aktuellen Katalogselektor. Die oben
genannten v2-Dateien bleiben unverändert und reproduzierbar.

## Pflichtchecks

```powershell
node tools/activity-catalog.mjs check
node --check app/modules/vitals-stack/activity/v2/semantics-v2.js
node --check tools/activity-catalog.mjs
node --test app/modules/vitals-stack/activity/v2/semantics-v2.contract.test.js
git diff --check
```

`activity-catalog.mjs check` beweist für den aktuellen Vertrag:

- gültigen Katalog und erlaubte, kollisionsfreie Alias-/Key-Transition;
- vollständige Search-Matrix;
- Gleichheit von Vertrag, Runtime und SQL-Snapshot.

SQL-Fixture und produktive Gates folgen zusätzlich der aktiven Roadmap und
`docs/DEV_ENVIRONMENT.md`. Der Inspector führt niemals SQL aus und liest keine
Secrets.

## Bewusste Grenze

Hantel- und Gerätevarianten teilen weiterhin den klassischen Key. Ein Alias
verbessert die Suche, speichert aber nicht automatisch die tatsächlich
verwendete Hantelart. Die spätere Eingabe- und Lastkonvention gehört in den
Strength-Editor-/Planvertrag und wird nicht durch immer neue Alias-Keys
vorweggenommen.
