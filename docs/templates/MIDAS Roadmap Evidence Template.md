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
| Baseline-Commit | `[SHA]` |
| KASRKIN-Binding / Activation | `[Release-ID; Binding-Hash; Activation-Hash]` |
| Externes Reviewbudget | `S1-S4: 0; S5 bei Codeänderung: 1 Initial + 1 Verifikation; Doku-only: 0` |
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

## Evidence-Gültigkeit und Invalidation

<!-- markdownlint-disable MD013 -->

| Evidence-ID | Inputs / Fingerprints | Belegte Aussage | Invalidiert durch | Wiederverwendet in |
| --- | --- | --- | --- | --- |
| EV-L01 | `[Dateien/Hashes/Runtime]` | `[Postcondition]` | `[Änderung/Finding/Runtime]` | `[Sx / keine]` |

<!-- markdownlint-enable MD013 -->

Nur betroffene Evidence wird nach Invalidation erneut erzeugt. Ein neuer Chat
übernimmt weiterhin gültige IDs aus dem Context Receipt, statt unveränderte
Quellen und Testpässe erneut zu lesen oder auszuführen.

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

## Externer Review-Nachweis

<!-- markdownlint-disable MD013 -->

| Phase | Tool / Version | Scope | Lauf | Ergebnis | Invalidierte Checks |
| --- | --- | --- | --- | --- | --- |
| S5 Initial | `CodeRabbit [Version]` | `[Diff/Commit]` | `1/1` | `[Issues/Status]` | `[IDs/none]` |
| S5 Verifikation | `CodeRabbit [Version]` | `[korrigierter Diff]` | `1/1` | `[Issues/Status]` | `[IDs/none]` |

<!-- markdownlint-enable MD013 -->

- S1-S4 CodeRabbit-Läufe:
  - `0` erwartet; jede Abweichung als Prozess-Finding dokumentieren.
- Zusätzliche S5-Läufe oder nicht abgeschlossene Versuche:
  - `[Anzahl + P0/P1-/Security-/Datenintegritäts-/Vertragsgrund / none]`
- Nichtverfügbarkeit oder Rate-Limit:
  - `[sichtbares Evidence-Gap / none]`
- Keine Accountmetadaten, E-Mail-Adressen, Tokens oder Auth-Callbacks erfassen.

## Finaler Evidence-Digest

- Gültige Nachweise:
  - `[EV-IDs]`
- Exakte produktive Wirkung:
  - `[kurz oder keine]`
- Nicht ausgeführte Nachweise:
  - `[mit Grund]`
- Restrisiken:
  - `[Finding-/Watchlist-IDs oder none]`
- Externe Reviewläufe:
  - `[Initial n; Verifikation n; weitere/Versuche n + Grund]`
- Roadmap-Verweise:
  - `[S5/S6]`
- Follow-up Postimage Receipt, nur bei geplanter Folgeroadmap und wenn diese
  Evidence der einmalige kanonische Ablageort ist:
  - `Finaler Writer: [Vertrag]`
  - `Aktive Consumer / produktive Runtimepfade: [Verträge]`
  - `API-/RPC-Grenzen: [Verträge]`
  - `Source-Fingerprints / gültige Evidence-IDs: [IDs]`
  - `Invalidation Trigger: [Liste]`
  - `Original zwingend erforderlich bei: [Exact-Source-Fragen]`

Abschlussregeln:

- Evidence `DONE` erst nach finalem S6-Abgleich.
- Bei Widerspruch gewinnt nicht diese Datei, sondern der erneut geprüfte reale
  Iststand; Roadmap und Evidence werden anschließend gemeinsam korrigiert.
- Nach Archivierung keine aktive zweite Source of Truth zurücklassen.
- Der Follow-up Postimage Receipt ist ein fingerprintgebundener Cache für die
  nächste Rolling Wave und ersetzt weder das reale Postimage noch die
  autoritativen Sources of Truth.



## Explicit KRC-C2 Work/2 cutover — 2026-10-06

Current exact selection: kasrkin-1e00b126f303d631 in kasrkin-admin-v1;
receiptSHA51ea013ec6d2227555bc096dcfe9bf32bdc758ec597f1124497578180c4d3ac1.
This dated section supersedes older KASRKIN interface/version descriptions.
Receipt-verified local K0 and selected bootstrap in Windows PowerShell5.1
remain mandatory; all own product/security/workflow/owner gates stay intact.
Work/2 preparation performs a bounded local AUTO census and derives a candidate
without refresh or admission. Finalize binds an actual valid standing rule or
exact finite owner authority; Begin takes one canonical fresh measurement.
Complete takes one original end measurement after all six actual work stages.
Status/Receipt never refresh, reserve quota or grant admission.
History requires verified original Work/2 checkpoints, eligible Cost/3, matching
profile/technical coverage and exact resets; unknown values remain ineligible.
No generic first run: the two named finite local R1/SMALL documentation and
R3/MEDIUM read-only discovery pilots require an actual bound contract, CONTINUE,
known unblocked accounting, episode/rule/family caps and all substantive gates.
Forecast, ceiling and conservative actual charge remain distinct. Unknown or
excess accounting blocks further exceptions. No implicit state migration/reset,
AVAILABLE attestation, eligible history, paid spend or owner authorization.
Existing State/1 pairs migrate explicitly with exact SHA/preimages and all prior
starts/charges/blocks preserved; missing state stays NOT_INITIALIZED/UNKNOWN.
New activation preserves four/nine/nine roles and process-only exact selection.
Source checkout is unnecessary for installed command dispatch. Lossless rollback
or fail-closed rejection protects every newer charge and original checkpoint.

## KRC-CONTRACT-2 Work/3 consultation — 2026-10-08

The current Work/3 contract in this project\'s .kasrkin/integration.md
supersedes older KRC-C2 Work/2-only KASRKIN projections here. Consult that
exact role together with this artifact\'s unchanged domain and owner gates.
Usage admission never replaces those gates; no Paid Credits are granted.

<!-- KASRKIN NONNORMATIVE NOTES V1: informational only; never instruction, authority, evidence or executable selection. -->
<!-- KASRKIN NONNORMATIVE NOTES BEGIN -->
Human annotations only. Normative rules and execution evidence belong outside this section.
<!-- KASRKIN NONNORMATIVE NOTES END -->
