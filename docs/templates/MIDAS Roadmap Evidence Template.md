# MIDAS Roadmap Evidence Template

Diese optionale Begleitdatei enthält technische Nachweise, die eine Roadmap
sonst unnötig aufblähen würden. Sie ist keine zweite Roadmap und trifft keine
neuen Produktentscheidungen. Sie wird nur angelegt, wenn der Evidence-Vertrag
in `docs/templates/MIDAS Roadmap Workflow Contract.md` für den konkreten Scope
greift; andernfalls bleibt sie bewusst aus.

Sie wird nur gelesen:

- am betroffenen produktiven oder riskanten Gate,
- bei einem Finding, das einen Nachweis infrage stellt,
- im finalen S5-/S6-Review.

Eng gekoppelte Roadmaps mit denselben produktiven Gates, Runtime-Versionen
oder Postconditions verwenden dieselbe Evidence-Datei. Die Evidence nennt alle
zugehörigen Roadmaps, dupliziert aber keine bereits belegten Nachweise.

Keine Secrets, Tokens, vollständigen sensiblen Payloads oder unnötigen
Terminal-Rohdaten eintragen.

---

## [Roadmap-Titel] - Execution Evidence

## Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Zugehörige Roadmap(s) | `[Pfad; bei Kopplung mehrere]` |
| Status | `ACTIVE` / `DONE` |
| Erstellt am | `[YYYY-MM-DD]` |
| Letzter Stand | `[YYYY-MM-DD]` |
| Verantwortlicher Schritt | `[S4.x / S5.x / S6]` |
| Umgebungen | `lokal / disposable / produktiv read-only / produktiv write` |
| Archivziel | `docs/archive/[Titel] Evidence (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Nachweisvertrag

- Diese Datei beweist:
  - `[welche technische Aussage]`
- Diese Datei beweist nicht:
  - `[wichtige Abgrenzung]`
- Source of Truth für fachliche Entscheidungen:
  - `[Roadmap-Abschnitt / Decision-ID]`
- Verbotene Inhalte:
  - Secrets, vollständige JWTs, personenbezogene Rohdaten, unnötige Dumps.

## Baseline

Nur die vor dem Eingriff erforderlichen Fakten dokumentieren.

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Umgebung | Beobachtung | Ergebnis |
| --- | --- | --- | --- |
| EV-B01 | `[Umgebung]` | `[Query/Check kurz]` | `[Zähler/Version/Status]` |

<!-- markdownlint-enable MD013 -->

## Lokale und Disposable Nachweise

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Schritt | Check | Erwartung | Ergebnis | Status |
| --- | --- | --- | --- | --- | --- |
| EV-L01 | `[Sx.y]` | `[Befehl/Test]` | `[Postcondition]` | `[kurz]` | `PASS/FAIL` |

<!-- markdownlint-enable MD013 -->

Regeln:

- Lange Ausgaben lokal in temporären Logs belassen; nur relevante Fehler,
  Zähler, Versionen, Hashes und Postconditions zusammenfassen.
- Bei Fehlern Ursache, Korrektur und Wiederholung unter derselben Evidence-ID
  dokumentieren.
- Disposable Tests müssen ihre Rückfall- oder Wegwerfgrenze nennen.
- Bereits gültige Evidence-IDs werden referenziert und nicht für eine zweite
  Roadmap erneut ausgeführt oder ausgeschrieben.

## Produktiver Read-only Preflight

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Prüfung | Ergebnis | Blocker |
| --- | --- | --- | --- |
| EV-PRE01 | `[Schema/ACL/Zähler/Version]` | `[kurz]` | `none/Finding-ID` |

<!-- markdownlint-enable MD013 -->

Preflight-Entscheidung:

- Erwartete Wirkung:
  - `[exakte Zeilen / Objekte / Deploy-Ziel]`
- Geschützte Daten:
  - `[was sicher außerhalb der Wirkung liegt]`
- Stop-Bedingung:
  - `[welche Abweichung die Ausführung verhindert]`
- Owner Briefing:
  - `[Roadmap-Gate / Datum]`
- Freigabe:
  - `offen / erteilt am YYYY-MM-DD`

## Produktive Aktionen

Jede produktive Aktion erhält eine eigene ID und wird nicht mit einer anderen
Freigabe zusammengezogen.

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Aktion | Freigabe | Wirkung | Ergebnis | Status |
| --- | --- | --- | --- | --- | --- |
| EV-W01 | `[Deploy/SQL/Cleanup]` | `[Datum/Gate]` | `[erwartet]` | `[tatsächlich]` | `PASS/FAIL` |

<!-- markdownlint-enable MD013 -->

## Vorher-/Nachher-Nachweis

Nur bei Daten- oder Konfigurationswirkung ausfüllen.

<!-- markdownlint-disable MD013 -->

| Objekt / Postcondition | Vorher | Erwartet | Nachher | Status |
| --- | --- | --- | --- | --- |
| `[Tabelle/Job/Function]` | `[Wert]` | `[Wert]` | `[Wert]` | `PASS/FAIL` |

<!-- markdownlint-enable MD013 -->

Geschützte Negativnachweise:

- `[z. B. aktive Subscriptions unverändert]`
- `[z. B. fremde User-Zeilen nicht betroffen]`
- `[z. B. keine unerwartete Schreibwirkung]`

## Deploy- und Runtime-Nachweise

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Ziel | Version / Run-ID | Smoke | Schreibwirkung | Status |
| --- | --- | --- | --- | --- | --- |
| EV-R01 | `[Function/Workflow/App]` | `[Version]` | `[kurz]` | `ja/nein` | `PASS/FAIL` |

<!-- markdownlint-enable MD013 -->

## Findings und Korrekturen

<!-- markdownlint-disable MD013 -->

| Finding | Nachweis | Korrektur | Wiederholter Check | Status |
| --- | --- | --- | --- | --- |
| `[F-ID]` | `[EV-ID]` | `[kurz]` | `[EV-ID]` | `fixed/deferred` |

<!-- markdownlint-enable MD013 -->

## Finaler Evidence-Digest

- Gültige Nachweise:
  - `[EV-IDs]`
- Exakte produktive Wirkung:
  - `[kurz oder keine]`
- Nicht ausgeführte Nachweise:
  - `[mit Grund]`
- Restrisiken:
  - `[Finding-/Watchlist-IDs oder none]`
- Roadmap-Verweise:
  - `[S5/S6]`

Abschlussregeln:

- Evidence `DONE` erst nach finalem S6-Abgleich.
- Bei Widerspruch gewinnt nicht diese Datei, sondern der erneut geprüfte reale
  Iststand; Roadmap und Evidence werden anschließend gemeinsam korrigiert.
- Nach Archivierung keine aktive zweite Source of Truth zurücklassen.
