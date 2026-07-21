# MIDAS QA

Dieser Ordner ist der kanonische Einstieg für aktuelle, wiederverwendbare
MIDAS-Testverträge. Er beschreibt, wie beobachtbares Verhalten geprüft wird.
Er ersetzt weder Produktverträge noch Ausführungsnachweise oder
Release-Historie.

## Leseroute

<!-- markdownlint-disable MD013 -->

| Frage | Ziel |
| --- | --- |
| Wie funktionieren QA-Rollen, IDs und Status? | dieses Dokument |
| Welche Core-, Boot-, Auth- oder Runtime-Verträge gelten? | [Core Runtime](core-runtime.md) |
| Wie werden Gesundheitsdaten, Berichte und Arztansichten geprüft? | [Health Capture and Reports](health-capture-reports.md) |
| Wie werden Intake, Medikation und Retention geprüft? | [Intake and Medication](intake-medication.md) |
| Wie werden Assistant, Voice und Intent geprüft? | [Assistant, Voice and Intent](assistant-voice-intent.md) |
| Wie werden Push und Trendpilot geprüft? | [Push and Trendpilot](push-trendpilot.md) |
| Wie werden Android Shell und Widget geprüft? | [Android and Widget](android-widget.md) |
| Wie werden generische Supabase- und Backend-Verträge geprüft? | [Backend and Supabase](backend-supabase.md) |
| Welche Gates gelten für einen bewussten MIDAS-Release? | [Release Readiness](release-readiness.md) |
| Wie wird ein operativer Check sicher ausgeführt? | zuständiges Runbook unter `runbooks/` |
| Was wurde in einer konkreten Änderung tatsächlich ausgeführt? | aktive Roadmap oder zugehörige Evidence |
| Was wurde früher geprüft oder behauptet? | historisches QA-Archiv unter `docs/archive/qa/` |

<!-- markdownlint-enable MD013 -->

Verfügbare operative Runbooks:

- [Boot Error Smoke](runbooks/boot-error-smoke.md)
- [Push Runtime Smoke](runbooks/push-runtime-smoke.md)
- [Edge Function Deploy Smoke](runbooks/edge-function-deploy-smoke.md)
- [Supabase SQL Cutover](runbooks/supabase-sql-cutover.md)
- [Android Device Smoke](runbooks/android-device-smoke.md)

## Artefaktrollen

<!-- markdownlint-disable MD013 -->

| Artefakt | Beantwortet | Enthält nicht |
| --- | --- | --- |
| Module Overview | Was soll MIDAS fachlich tun? | Testausführung und Release-Chronik |
| Producer, Consumer oder Schema | Was tut der aktuelle Stand tatsächlich? | stillschweigende Änderung des Produktvertrags |
| QA-Suite | Wie wird beobachtbares Verhalten wiederholbar geprüft? | dauerhafte PASS-/FAIL-Ergebnisse |
| Runbook | Wie wird ein technischer oder produktiver Check sicher ausgeführt? | fachliche Produktverträge |
| Release Readiness | Welche bestehenden Checks und Gates gelten für einen Release? | kopierte Testfälle und Detailergebnisse |
| Roadmap oder Evidence | Was wurde in dieser Änderung tatsächlich geprüft? | allgemeine dauerhafte Testdefinitionen |
| `CHANGELOG.md` | Was änderte sich bemerkenswert für Nutzung oder Betrieb? | Commitliste und QA-Evidence |
| Git-Commit oder Tag | Welcher exakte Dateistand gehört dazu? | menschenlesbare Produktzusammenfassung |
| Historisches Archiv | Was wurde früher behauptet, geprüft oder veröffentlicht? | aktueller Produkt- oder QA-Vertrag |

<!-- markdownlint-enable MD013 -->

Ein Widerspruch zwischen Produktvertrag und Ist-Implementierung ist ein
Finding. Keine Quelle überschreibt die andere still.

## Geltung und Status

- Aktuelle Suites enthalten statuslose Testdefinitionen.
- PASS, FAIL, TODO, Ausführungsdatum und konkrete Laufresultate gehören in die
  aktive Roadmap oder eine zugehörige Evidence-Datei.
- Ein früherer PASS-Zustand bleibt ausschließlich im historischen Archiv.
- Ein weiterhin gültiger historischer Test erhält eine aktuelle ID, aber nicht
  seinen früheren Status.
- IDs werden nicht umnummeriert oder für eine andere Aussage wiederverwendet.

## Suite- und ID-Vertrag

<!-- markdownlint-disable MD013 -->

| Präfix | Eigentümer-Suite | Primärer Bereich |
| --- | --- | --- |
| `CORE-` | `core-runtime.md` | Boot, Auth, State, Router, Diagnostics und globale Runtime |
| `HCR-` | `health-capture-reports.md` | Gesundheitsdaten, Capture, Berichte und Arztansichten |
| `IM-` | `intake-medication.md` | Intake, Medikation, Bestand und Retention |
| `AVI-` | `assistant-voice-intent.md` | Assistant, Voice, VAD und Intent |
| `PT-` | `push-trendpilot.md` | Push, Scheduler, Incidents und Trendpilot |
| `AW-` | `android-widget.md` | Android Shell, Native Auth und Widget |
| `BS-` | `backend-supabase.md` | domänenneutrale Backend- und Supabase-Plattformverträge |
| `RB-` | `runbooks/*.md` | operativer Ablauf; kein fachlicher Testfall |
| `REL-` | `release-readiness.md` | Release-Gate; kein fachlicher Testfall |

<!-- markdownlint-enable MD013 -->

Ownership gilt pro beobachtbarer Aussage, nicht pauschal pro Datei. Derselbe
ausführliche Testfall besitzt genau eine aktuelle Eigentümer-ID; andere Suites
oder Release-Gates verweisen nur auf diese ID.

## Testfallschema

Aktuelle Testfälle verwenden `PREFIX-NNN` und dieses Pflichtschema:

```text
### PREFIX-NNN - Kurzer beobachtbarer Titel

- Vertrag: Module Overview oder anderer fachlicher Source-of-Truth-Link
- Ebene: static | local-runtime | browser | device | remote
- Ausführung: automated | manual | owner-observation
- Wirkung: read-only | disposable | productive
- Voraussetzung: benötigter Zustand
- Aktion: reproduzierbarer Prüfschritt
- Erwartung: beobachtbares Ergebnis
- Invalidiert durch: Änderungen, nach denen der Test erneut zu prüfen ist
- Runbook: optionaler RB-Link
- Historie: optionaler Archivanker
```

Pflichtfelder werden nicht durch Fließtext oder einen Verweis auf einen alten
PASS-Block ersetzt.

## Smoke- und Evidence-Vertrag

- `static` und lokale read-only Checks dürfen ohne Owner-Gate laufen.
- `manual` beschreibt nur die Ausführungsart, nicht das Risiko.
- `disposable` benötigt isolierte Testdaten, Cleanup und einen Nachweis ohne
  produktiven Restzustand.
- `productive` benötigt ein sichtbares Owner-Gate in der aktiven Roadmap,
  bevorzugt einen Preview- oder Dry-Run und datierte Evidence.
- Remote-read-only-Prüfungen dürfen produktive Daten lesen, aber weder Zustand,
  Scheduler noch Nutzerkommunikation verändern.
- Suite und Runbook bleiben nach einem Lauf unverändert; das konkrete Ergebnis
  steht ausschließlich in Roadmap oder Evidence.

## Pflegevertrag

- Neue Testaussagen werden der fachlich zuständigen Suite zugeordnet.
- Facharchitektur bleibt im Module Overview und wird hier nur referenziert.
- Wiederholbare technische Abläufe werden als Runbook ausgelagert.
- Historische Phasen und damalige Statuswerte bleiben im Archiv.
- Änderungen an Testvertrag, Producer, Consumer oder Schema invalidieren die
  betroffenen Test-IDs.
