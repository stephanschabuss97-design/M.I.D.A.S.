# MIDAS Roadmap Templates

Owner: MIDAS / Stephan. Gemeinsamer Autorenkern und die zwei Dokumentformen:
[BLUEPRINT](../../../codex-tools/docs/blueprint/README.md), Revision BLUEPRINT-1 / 2026-09-27.
Neue Roadmaps übernehmen diese Revision ausdrücklich; bestehende Roadmaps und
historische Evidence werden nicht rückwirkend geändert.

1. AGENTS, README und [lokales Environment-Overlay](../DEV_ENVIRONMENT.md) lesen.
2. BLUEPRINT-Routing wählen und den
   [MIDAS-Workflowvertrag](MIDAS%20Roadmap%20Workflow%20Contract.md) vollständig lesen.
3. Relevante Module, QA-Suites und Runbooks gezielt konsultieren.
4. Zentrale Form mit den [MIDAS-Ergänzungen](MIDAS%20Roadmap%20Template.md)
   ausfüllen: medizinische/Daten-/Security-Grenzen, S1–S6, Readiness und Ownergates.
5. Vor READY Capability-Preflight, Contract Review und Fresh-Chat-Test abschließen.
   Fehlende/inkompatible Tools verlangen eine Ownerentscheidung, keine Installation.
6. [Evidence-Vorlage](MIDAS%20Roadmap%20Evidence%20Template.md) nur bei lokalem
   Pflichtfall verwenden. Evidence-Owner eindeutig benennen; keine Duplikate.

Erstellung/Initialreview folgen GPT-5.6 Sol / Extra High. Die lokalen
Reasoning-, Discovery-, S4R-, S5-/CodeRabbit-, Usage- und S6-Regeln stehen im
Workflowvertrag; BLUEPRINT hebt keine davon auf. Kein CodeRabbit für Doku-only.
KASRKIN bleibt alleinige ausführbare Policyautorität; Bindings/Activation bleiben
projektlokal. Nicht beobachtbare Reasoning-Einstellungen nicht als geprüft ausgeben.

Aktive Roadmaps/Evidence liegen unter docs/, Vorlagen unter docs/templates/.
Nach grünem S6 folgt das lokale (DONE)-Archiv; Changelog-Relevanz wird entschieden.
Commit/Push bleiben separat gated. Normale Produktdokumentation und QA sind
lebende SoT, keine Templatekopien. Resume nach Startkarte und gültigem Receipt;
bei Invalidation gezielt rehydrieren statt die ganze Historie zu lesen.
