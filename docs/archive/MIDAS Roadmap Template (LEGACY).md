> LEGACY — archiviert am 2026-10-13 auf direkten Ownerauftrag.
> Historischer Nachweis des früheren lokalen Prozessstands; keine aktuelle
> Autoren-/Template-SoT und keine Pflichtlektüre für neue Roadmaps.
> Aktuell: [BLUEPRINT](../../../codex-tools/docs/blueprint/README.md) und
> [Projekt-AGENTS](../../AGENTS.md). Alte Aufträge behalten ihre eingefrorene Gitbasis.

# MIDAS Roadmap — lokale Ergänzungen

KASRKIN ist seit 2026-10-12 durch ausdrückliche Ownerentscheidung entbunden.
Neue und laufende Roadmaps arbeiten ohne KASRKIN-Aufrufe, Usage-Gates, Permits
oder KASRKIN-Checkpointfelder. Fachliche Readiness, Scope, Review, sichere
Postconditions und produktive Ownergates bleiben verbindlich. Diese Entscheidung
überstimmt ältere KASRKIN-Klauseln, auch in unveränderten aktiven Roadmaps.


Die zentrale [Execution](../../../codex-tools/docs/blueprint/EXECUTION_ROADMAP_TEMPLATE.md)
liefert konkrete S1–S6-Führung und Blockfelder. [Rolling Wave](../../../codex-tools/docs/blueprint/ROLLING_WAVE_ROADMAP_TEMPLATE.md)
führt Lieferpakete/Aufträge; [Quick Change](../../../codex-tools/docs/blueprint/QUICK_CHANGE_TEMPLATE.md)
darf bei kleinem eindeutigen risikoarmen Auftrag inline bleiben.
Gemeinsamer Kern: [BLUEPRINT / 2026-10-13](../../../codex-tools/docs/blueprint/ROADMAP_AUTHORING_CONTRACT.md).
Zielrevision: RELEASED / S6-Postchecks BP-EX-01 am 2026-10-13 grün; für neue ausdrücklich übernehmende Aufträge.
Diese erhaltene lokale Datei ergänzt Auftragswerte/Matrizen, keinen zweiten
allgemeinen Ablauf. Nur relevante Zusatzfelder übernehmen; Links am Zielort
anpassen. Ältere Aufträge behalten ihre eingefrorene Basis und Felder;
aktuelle echte Fach-/Security-/Ownergrenzen bleiben wirksam.

## Lokale Auftragsfelder

- [Workflowvertrag](MIDAS%20Roadmap%20Workflow%20Contract%20%28LEGACY%29.md) vollständig lesen;
  AGENTS, Root-README, relevante Module/QA/Runbooks und lokales Overlay nach Bedarf.
- Metadaten: [medizinischer/Produktkontext, R1/R2/R3, Reviewtiefe,
  local-full/gated/manual (Standard gated), maximaler Endpunkt, Arbeitsgröße,
  Discovery-/Implementierungsfreigabe, gekoppelte Aufträge, Evidence-Owner/-Datei,
  produktive Wirkung/Deploy-/Devicegates und Archivziel].
- Erstellung/Initialreview: [GPT-5.6 Sol / Extra High nach lokalem Vertrag];
  Ausführung: [begründete kohärente Reasoning-Wellen; tatsächliche Einstellung
  oder NOT_OBSERVABLE, keine stille Erhöhung]. Expliziter aktueller Ownerauftrag gilt.
- Startkarte: [eigener Ausführungs-Chat, konkrete Freigaben/Operatoraktionen,
  lokale Pflichtreferenzen, sichere Postconditions]. Keine Usagecheckpointpflicht.
- Scope-Freeze S4R: [Features erhalten/entfernen, Datenmodell,
  Lifecycle/Retention, Cleanup, Scheduler, Secrets, externe Automationen,
  kompatible Producer/Consumer]. Offene Grundsatzfrage blockiert betroffenen Block.
- Evidence: [Pflichtfall nach Workflow oder nicht erforderlich]; genau ein
  Evidence-Owner bei gekoppelten produktiven Gates, keine Secret-/sensiblen Rohdaten.
- Live-Kontext/Receipt: [AGENTS, Root-README, aktive Roadmap/Resume/Findings,
  Dirty Boundary/Diff, geänderte Codeflächen/produktive Gates; Quellenidentität
  und vollständige Frageabdeckung, andernfalls Original]. Handoff etwa 35 Zeilen.

## Fachliche Werte zur zentralen Execution

| Phase | Relevante MIDAS-Vertragsfrage / benötigtes Ergebnis | Auftragswert / Nachweis / Exit |
| --- | --- | --- |
| S1 | Modulownership, medizinischer Kontext, reale Daten/Runtime und Producer/Consumer; betroffene/unbetroffene Schichten | [Systemkarte, SoT/Baseline, Fakten/Annahmen, offene IDs] |
| S2 | Medizinische Guardrails, Daten/API, Fehler/Zeit, Security und Copy; fachliche Acceptance | [gewählte Lösung, Kompatibilität, S4-Pflichtpunkte, keine offene Grundsatzfrage] |
| S3 | Stille Ausfälle, falsche Sicherheit/Alarm, Datenverlust, Auth/RLS, Race/Dedupe, Zeit/Cache soweit betroffen | [Bruchrisiko → Wirkung → Konter → T-/EV-ID; Rollback/Stop] |
| S4R | Finale Konsistenz S1–S3, lokale Secret-/Produktivreadiness, ausführbarer Scope-Freeze | [konkrete Blöcke der zentralen Form, volle Autorität, keine offene Pflichtlücke] |
| S4 | Modul-/Produktdelta, direkte Consumer, lokaler Delta/Consumer oder in S4R begründeter Full Review | [pro Block Änderung, Prüfung, Finding/Fix, Restrisiko, Doku-Sync, Status; höchstens sechs Kernpunkte] |
| S5 | Relevante lokale/disposable/Last-Mile-/Runtimechecks, nativer Full Review, lokales externes Budget nur bei Codeänderung | [Testmatrix/EV-IDs, Fix/Invalidation, ehrliche Pflichtgaps; S6 offen] |
| S6 | Reale SoT/QA/HOW-TO, Changelog-Relevanz, Archivlinks/Postchecks und finaler SoT-Review | [Dateien, bewiesene Ergebnisse, Restrisiko, echter Archivpfad; erst danach DONE] |

S1, S2, S3, S4R und S6 behalten ihren lokalen Full Contract Review;
vollständiger betroffener Vertrag, kein allgemeiner Repo-Neuread.
Gemeinsame Schritte/Exits nicht erneut kopieren. Doku-Sync grundsätzlich S6,
vorher nur zwingende blockierende SoT-Korrektur. Fachliche Tiefe nach tatsächlichem Risiko.

### Fach-/Daten-/Fehlervertrag, wenn betroffen

| Producer / API / Datenfeld | Input / Output / Consumer | Medizinische/Daten-/Security-Invariant | Fehler-/Zeit-/Dedupe-/Recovery-Verhalten | Acceptance / Check |
| --- | --- | --- | --- | --- |
| [konkret] | [Form/Einheit/Zeitbasis] | [Guardrail/Ownergate] | [beobachtbar] | [T-/EV-ID] |

### S4R: technische Readiness und Fehlergrenzen

- Kohärenz/Atomarität je Block: [welcher Zustand nicht teilbar ist, sichere
  Resume-Postcondition; Zusammenlegung nur bei kompatibler Wirkung/Reviewtiefe].
- Aufwand: [small/medium/large, Dateien/Runtime/SQL/Backend, Context/Tools,
  Browser/Device, teure Tests, externe Reviews, Fehlersuche, Doku/Evidence/Closure,
  Reasoning-Wellen/Gates; bei large Owner-Briefing].
- Last-Mile-Orakel bei produktivem UI-Write: [DOM-Geste → aktiver Listener →
  Shell/Lifecycle → Commit/Recovery → Data Access → Transport; T-/EV-ID].
- Zielpostimage-Precheck: [aktuelle/Forward-/Rollbackkonfiguration,
  Productload/Cacheversion, günstiges Orakel vor teurer Fullmatrix].
- Produktiver Pflichtfehler: [vorbereiteter Rollback + Daten-/Runtimepostcheck
  atomar; erst danach Diagnose unter gültiger Readiness/Scope-/Ownerfreigabe].
- Diagnose falls nötig: [Reproduktion → minimaler Fix → Last-Mile-Orakel →
  invalidierte Fullmatrix/Review; sichere Zwischenzustände und erlaubte Quellen].
- Invalidation und Reviewbudget: [IDs, S4-Full-Ausnahme mit begründeter Grenze,
  Evidence/Invalidation und in S5 wiederverwendetem Prüfanteil].

Bei Secret-/Scheduler-/Workflow-/Edge-/produktiver Authwirkung:

| Secretname | Consumer | Kanonischer Speicherort | Lokal nötig? | Vorhandenseinsnachweis / Ownergate |
| --- | --- | --- | --- | --- |
| [Name, niemals Wert] | [Vertrag] | [Ort nach lokalem Overlay] | [Bedarf] | [vor Cutover belegt / BLOCKED] |

Keine pauschale Spiegelung aller Remote-Secrets als Readinessersatz.

### S5: zusätzliche lokale Prüfwerte

| ID | Ebene / Vertragsfrage / Orakel | Erwartung | Status / Nachweis | Invalidation / Gate |
| --- | --- | --- | --- | --- |
| [T-ID] | [lokal/disposable/Browser/Device/produktiver Preflight/Runtime falls nötig] | [beobachtbar] | [NOT_RUN/PASS/FAIL/GAP; EV-ID] | [Delta/Owner] |

Codeänderungen: ein CodeRabbit-Initiallauf nur in S5, nach berechtigten Fixes
höchstens eine Verifikation; weitere Läufe ausschließlich mit neuem explizitem
Ownerauftrag. Doku-only: null externe Läufe. Kanonischer `coderabbit`-Aufruf;
Ausfall/Budgetgap ehrlich, keine Installation oder erfundene PASS-Evidence.
Nur relevante Tests/Produktivschritte, kein DB-/Browser-/Deployzwang aus Vorlage.

### S6: lokale Abschlusswerte

- Changelog: [bemerkenswert → Unreleased in CHANGELOG.md / nicht bemerkenswert:
  Begründung]; kein Produktrelease/Tag durch Eintrag.
- Finaler Review und Restrisiken: [PASS/Findings; In-Scope-P0/P1 geschlossen;
  Out-of-Scope-P0/P1 nur mit explizitem Owner/Folgeartefakt/wirksamem Gate].
- Owner Recap: [nicht nötig / kurzer Alltagstext, ungefähr höchstens 10–15 Punkte].
- Falls Folgeroadmap geplant: [einmaliger Postimage Receipt in Roadmap oder
  vorhandener Evidence: finaler Writer, aktive Consumer/Runtimepfade, API/RPC,
  Fingerprints/EV-IDs, Invalidation, Exact-Source-Fragen]; keine Zusatzdatei.
- Archiv: [Roadmap und vorhandene Evidence nach docs/archive/ mit (DONE),
  tatsächliche Links/Postchecks; bei offenem S6 sicheren S5-Handoff bewahren].
- Git: [Empfehlung aus tatsächlichem Diff; Commit/Push nur bei eigenem Auftrag].
