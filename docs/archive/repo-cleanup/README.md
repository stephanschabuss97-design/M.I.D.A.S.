# Historische Repository- und Toolingnachweise

ARGUS und Benchmark bleiben auf Ownerentscheid stillgelegt. Dieses Archiv
enthält Provenienz, keine aktive Ausführungsroadmap oder Startfreigabe.

- Toolingmigration: `../tooling-extraction/` mit allen 15 Originaldateien.
- Activity-Releasewerkzeuge: `activity-v2-tools/` mit neun Originaldateien.
- Studioinventar: `../reference/activity-v2/Fitnessstudio_Geraeteinventar.md`.
- C4-Vertragsvorschlag:
  `../MIDAS C4 Independent Verification Waves Contract Proposal (LEGACY).md`.
- Alle Originalbytes sind erhalten; interne Tooling-Closurelinks bleiben gültig.

## Reproduktion und Grenzen

Die Skripte und ihre `$PSScriptRoot`-/`import.meta.url`-Annahmen gehören zur
ursprünglichen Ablage und jeweiligen historischen Gitbaseline. Sie sind nach
Rehome keine aktuellen ausführbaren Werkzeuge. Keinen alten W7- oder V1-
Rollback im heutigen Produktstand starten. Die Originalquelle dieses
Bereinigungsauftrags ist Gitcommit
`c2e147ef046764d5428f16b71332d4e4d1965356`.

Receipts, JSONhashes und damalige Rohpfade wurden nicht umgeschrieben.
Der historische W3-Prüfer im Nachbar-Repo erwartet den damaligen MIDAS-
Inventarpfad; Reproduktion benötigt dessen ursprüngliche isolierte Baseline.
Externe ARGUS-Archive und codex-tools-Dokumente wurden hier nicht verändert.

Aktuelle R8-/R13-Guards, Kataloginspektor und CodeRabbitshim bleiben unter
`tools/`. Runbook, Vorlagenschema/-beispiel und Supabase-Betriebsunterlagen
bleiben erhalten. Details zum tatsächlichen Abschluss stehen in der
[Execution Roadmap](<../MIDAS Repository Cleanup Execution Roadmap (DONE).md>)
und [Evidence](<../MIDAS Repository Cleanup Execution Evidence (DONE).md>).

## Ergänzung: thematische Ablage am 2026-10-13

Auftrag und Autorität: Stephan möchte nach MC-EX-01 keine lose liegenden
Altunterlagen im `docs/`-Root. Weiterhin benötigte Dokumente dürfen ausdrücklich
in passende Modulordner. Lokaler reversibler Quick Change nach
`BLUEPRINT / 2026-10-13 / Harmonized`; keine Wiedereröffnung von MC-EX-01.
Status: DONE nach Consumer-, Integritäts- und Dokumentationspostchecks.

- [Activity-Masterplan](<../../reference/activity-v2/MIDAS Activity V2 Masterplan.md>):
  weiterhin gültige Modulverträge; keine neue DONE-Erklärung.
- [Supabase-Restarbeit und Recovery][supabase-recovery]:
  DEFERRED bleibt erhalten, Native und Legacy bleiben offen.
- [Operatorvorlage](<../../reference/supabase/MIDAS Supabase Operator Env.example>):
  unveränderte Originalbytes, alle 13 Werte leer.
- [Key-/Storezuordnung][supabase-stores]:
  weiterhin benötigte Betriebsreferenz, Status unverändert.
- [Programmierhandbuch](<../../reference/development/Codex Programmandi.docx>):
  allgemeines Nachschlagewerk, unveränderte Originalbytes.

Im Root verbleiben `DEV_ENVIRONMENT.md`, `QA_CHECKS.md` und
`MIDAS Activity V2 R14 Repair Findings.md`. Alle fünf Zielpfade wurden auf
Workspacegrenze, Kollision und Reparsepunkte geprüft. Vor der Mutation wurden
23 betroffene Dateipreimages und der aktuelle Git-/Dateistand gesichert.
Rückweg während der Durchführung: fünf Umbenennungen umkehren und nur eigene
Änderungen aus diesen Preimages zurücknehmen. Nach Abschluss sind die
temporären Preimages entfernt; der begrenzte Pfad-/Navigationsdiff und die
obigen fünf Zielzuordnungen beschreiben den inversen Schritt. Keine Rücksetzung
gegen HEAD.

Links wurden relativ zum neuen Ort korrigiert. Historische Rohpfade, Befehle,
Dispositionen und damalige Hashnachweise in archivierter Evidence bleiben
historische Fakten; diese Ergänzung dokumentiert die spätere Ablageänderung.
Im R8-Prüfer und seinem direkten Contract-Test ändert sich ausschließlich
der aktuelle Masterplanpfad. Schutzassertionen und Runtime bleiben erhalten.
Native Consumerprüfung: `node tools/activity-v2-r8-isolation.mjs --current`
PASS sowie die zwei `T-ACT-R11-09`-Contract-Tests PASS, kein Fail.
Native Delta-/Consumerreview: keine offenen Findings; alle Änderungen an
Tool/Test sind exakt auf einen Pfadstring begrenzt. 70 betroffene Links sind
erreichbar; darunter kein geänderter Anker. Encoding-/Whitespaceprüfung PASS.
590 andere Dateien sind bytegleich zum unmittelbar gesicherten Vorzustand;
R14 Repair Findings, QA-Einstieg und Runtime bleiben geschützt.
Markdownlint CLI 0.23.2/Engine 0.41.1: diese Archivkarte ohne Fehler.
18 betroffene Markdowndateien gegen ihre Preimages mit exakter Zeilenzuordnung
geprüft: keine neuen Lintfehler, 1.031 vorhandene Baseline-Meldungen erhalten.
Das ist kein globales Markdownlint-PASS. Git-HEAD und Index sind unverändert.
Kein weiterer externer Review: Quick Change ohne gesonderten CodeRabbitauftrag.
Keine Commits, Tags, Pushes oder produktive Wirkung.

[supabase-recovery]: ../../reference/supabase/MIDAS%20Supabase%20Modernization%20Deferred%20Work%20and%20Recovery.md
[supabase-stores]: ../../reference/supabase/MIDAS%20Supabase%20Operator%20Key%20and%20Store%20Map.md
