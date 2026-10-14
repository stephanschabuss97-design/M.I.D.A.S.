# MIDAS Repository Cleanup Follow-up Roadmap

## Startkarte

- ID: MC-QC-02; Owner Stephan; erstellt am 2026-10-13.
- Arbeitsform: kompakter BLUEPRINT Quick Change, Risiko R1, Umfang small.
  Explizite Autorenbasis: `BLUEPRINT / 2026-10-13 / Harmonized`.
- Status: DONE am 2026-10-14; B1–B4 und finale Archivpostchecks PASS.
- Wiedereinstieg am 2026-10-14: Baseline unverändert, keine fremde Dirty-Arbeit.
- G-EXEC ERTEILT am 2026-10-14 durch Stephans ausdrücklichen Auftrag in diesem
  Chat: „Bro, führe MC-QC-02 vollständig aus.“ Freigabe für den festgelegten
  lokalen Scope samt Preimages, Review und Postchecks. Keine Commits oder Pushes.
- Ziel: belegte Doku-/Ablagealtlasten korrigieren und benötigte Artefakte erhalten.
- Baseline: `4e6f9f8e6317afb88e6330ba4b233b508a5d6841`;
  Worktree vor Erstellung dieser Datei sauber, Index leer.
- Autonomie: local-full bis geprüftem lokalem Abschluss.
  Keine Commits, Tags, Pushes oder Deploys.
- Benötigte Reviewtiefe: Consumer für Ablage/Workspace und native
  Vertragsprüfung für Status-/Schutzformulierungen; Einstellung NOT_OBSERVABLE.

Binding: [AGENTS](../../AGENTS.md), [README](../../README.md),
[BLUEPRINT](../../../codex-tools/docs/blueprint/README.md),
[Quick Change](../../../codex-tools/docs/blueprint/QUICK_CHANGE_TEMPLATE.md),
[lokales Overlay](../DEV_ENVIRONMENT.md).
Fachquellen sind die unten benannten aktuellen Modulübersichten.
Keine neue Execution mit künstlichen S1–S6-Mini-Phasen und keine separate Evidence:
alle auftragsbezogenen Belege stehen hier, da nur reversible lokale Dokuarbeit.

## Referenzprüfung und verbindliche Disposition

Prüfstand 2026-10-13: alle versionierten UTF-8-Textdateien einschließlich
historischer Archive gezielt nach Kandidatenpfaden/-namen und relevanten
CLI-/Buildbefehlen durchsucht. Zusätzlich gezielte Referenzsuche in
`.vscode/` und den erhaltenen lokalen `.kasrkin/work/`-MD-/JSON-/YAML-/PS1-Dateien.
Keine pauschale Archivdurchsicht, kein Secretoutput oder Remotezugriff.
Implizite Consumer wie CLI-Arbeitsverzeichnis und Git-Guards mitgeprüft.
Persönliche Editorverwendung, externe Shortcuts und exakte APK-Reproduzierbarkeit
sind damit nicht bewiesen; diese Grenzen begründen KEEP statt Löschung.

<!-- markdownlint-disable MD013 -->

| ID | Kandidat / tatsächliche Referenzen und Befund | Disposition in diesem Auftrag |
| --- | --- | --- |
| F01 | `savehandler rework.md`: keine gefundenen eingehenden Referenzen außerhalb der Datei, auch nicht in lokalen Receipts/Editorconfig. 62 von 64 Detailaufgaben tragen `done`; 10.5.1/10.5.2 nicht. CSS-/Save-Feedback-Verträge leben im CSS Module Overview. | ARCHIVE_LEGACY / DONE: byteidentisch nach `docs/archive/MIDAS CSS and Save Feedback Rework (LEGACY).md`. Offene historische Abnahmeschritte weder ausgeführt noch als DONE umdeklariert. |
| F02 | `M.I.D.A.S..code-workspace:4`: einziges Folderziel `../../Gesundeheitsüberwachung/Test`, aufgelöst `C:\Users\steph\Gesundeheitsüberwachung\Test`, existiert nicht. Keine eingehenden Repo-/lokalen Receiptverweise gefunden; persönliche Nutzung unbekannt. | KEEP_FIX / DONE: ausschließlich `folders[0].path` auf `.` geändert. Workspace erhalten; keine Editor-/Ordneranlage. |
| F03 | Dieselbe veraltete G3/G4-Einleitung steht in fünf Modulübersichten: Supabase Core, Auth, Assistant, Hub und Android Native Auth, jeweils Zeilen 3–8. Die aktuelle Supabase-Restarbeitsreferenz dokumentiert D32/D33. | KEEP_FIX / DONE: Einordnung/Status und Quellenlink synchronisiert. Backend/Web akzeptiert; Native, Legacy und Signingrotation bleiben getrennte Gates. Technische Schutzklauseln erhalten. |
| F04 | `.gitignore:43,62`: `.kasrkin/work/` und `/.kasrkin/work/`. DEV_ENVIRONMENT:3–7 wiederholt den Freezeabsatz in 67–71. Der Abschnitt `KASRKIN-Consumerstatus` hat keine gefundenen eingehenden Ankerverweise, bleibt aber erhalten. | KEEP_FIX / DONE: engeren zweiten Ignoreeintrag entfernt; breitere Schutzregel erhalten. Einleitender Freezeabsatz verlinkt den vollständigen Consumerstatus. Explizite `.env.supabase.local`-Schutzzeile erhalten. |
| F05 | Root-`supabase/`: neun Tempdateien, 322 Bytes, kein getrackter Source. Projektref/Linked-Project stimmen wertfrei mit `backend/supabase/.temp/` überein; zwei Versionscaches unterscheiden sich. Backend-README/Overlay/Recovery nennen `--workdir backend`, aber R8-PWA-Runbook:53–54 nennt `supabase start/status` ohne Workdir. | KEEP_DEFERRED: aktive, ungeklärte Default-CWD-Verwendung. Keine Entfernung oder Stackausführung. Separat disposable Workdir und dessen Readiness klären; nicht aus Projektbinding auf unbenötigte Dateien schließen. |
| F06 | `android/app/build/`: 1.685 Dateien / 187.197.125 Bytes; Debug-APK aktiv referenziert durch Android-Device-Runbook:46 und R8-PWA-Runbook:72. `android/.gradle/`: 18 Dateien / 7.222.718 Bytes, impliziter Buildconsumer. Historische APK-Befehle vorhanden; zielgenaue lokale Receipt-Suche ohne Treffer auf APK/Outputpfad. Kein aktueller Build-/Rollbackreproof. | KEEP: beide Verzeichnisse und APKs erhalten. Größen sind Bestandsaufnahme, kein Beleg gefahrloser Löschbarkeit. Optionaler späterer Speichercleanup braucht eigene Artefakt-/Lock-/Recoveryprüfung. |
| F07 | `local-test-pwa.contract.test.js`: aktiver Leser `tools/activity-v2-r8-isolation.mjs:247`, QA-Einordnung HCR:902–911 und elf lokale historische Receiptdateien. Sieben Testfälle: vier aktuelle, drei invalidierte Snapshots. R8 bindet den Testsource an die feste Baseline und schützt `app/` gegen Änderung. | KEEP: byteidentisch, ebenso Runbook und aktuelle Ersatzguards. Keine Testtrennung/-löschung in diesem Dokuauftrag, kein blindes Rehashen. Spätere Migration braucht eigene Guard-/Deckungsprüfung. |
| F08 | Zusätzlich gefunden: getracktes `android/.kotlin/errors/errors-1775127157434.log`, 40.446 Bytes / 332 Zeilen, Compilerdiagnostik. Keine direkten eingehenden Textreferenzen gefunden. Beide aktuellen Isolationstools schützen jedoch den gesamten getrackten Androidscope. | KEEP_DEFERRED: Entfernen würde aktuell `CURRENT_PROTECTED_DIFF` erzeugen. Kein Guardbypass für einen kleinen Logcleanup; gesonderte Prüfung mit exakt begrenztem Guarddelta nötig. |
| F09 | CSS Module Overview:20 nennt als aktuellen Einstieg den fehlenden Backtickpfad `docs/Device Module Scaling Roadmap.md`. Original liegt bereits unter `docs/archive/Device Module Scaling Roadmap.md` und enthält historisch `Step 3: pending`. | KEEP_FIX / DONE: tatsächliche Archivquelle als Historie verlinkt; heutiger CSS-Einstieg und Regeln erhalten. Keine DONE-Erklärung oder Reaktivierung des alten Scalingplans. |

<!-- markdownlint-enable MD013 -->

Die frühere Empfehlung einer Root-CLI-/Android-Bereinigung wird damit begrenzt.
Die vorherige Linkprüfung betraf navigierbare Links; F09 ist ein zusätzlicher
Code-/Backtickpfad und widerlegt keinen damals geprüften Linknachweis.
Alle F01–F09 sind disponiert; KEEP/DEFERRED zählt nicht als technisch behoben.

## Exakter Umsetzungsumfang und Reihenfolge

1. **Refresh und Preimages:** Gitstatus, relevanten Diff zur Baseline und diese
   Roadmap prüfen. Nur bei Drift betroffene Quellen nachlesen. G-EXEC erfassen.
   Aktuelle Preimages der folgenden Dateien in eigener ignorierter Stagingablage
   sichern; aufgelöste Pfade/Reparsepunkte prüfen und Archivkollision ausschließen.
   Keine fremde Dirty-Arbeit gegen HEAD zurücksetzen.
2. **B1 / DONE – Workspace und Schutzduplikate:**
   `M.I.D.A.S..code-workspace`, `.gitignore`, `docs/DEV_ENVIRONMENT.md`.
   Nur F02/F04 umsetzen. JSON muss genau denselben Inhalt mit Folderpfad `.`
   besitzen; bestehende Ignore-/Secret-/Recoverydeckung muss erhalten bleiben.
   Freeze einmal ausführlich führen und oben auf den erhaltenen Abschnitt linken.
3. **B2 / DONE – Statussync:** die fünf F03-Moduldateien unter
   `docs/modules/` aktualisieren. Einleitende Backend/Web-Gates gegen
   [Restarbeit und Recovery][supabase-recovery]
   abgleichen und dort verlinken. F22-spezifischen Retest nicht pauschal auf PASS
   setzen: D33 bestätigt normale Ownernutzung, nicht jedes Einzelorakel.
   Historische Retestformulierungen datiert einordnen; keine neue Liveprüfung,
   AI-Aktivierung, Native-/Legacy-Abnahme oder Signingrotation behaupten.
4. **B3 / DONE – historisches Rehome:** F01 byteidentisch archivieren,
   anschließend im `docs/modules/CSS Module Overview.md` F09 korrigieren und die
   alte CSS-/Save-Feedback-Arbeit als Historie mit ihren zwei unbestätigten
   Abschlussaufgaben verorten. Beide historischen Originale inhaltlich erhalten.
5. **B4 / DONE – gezielter Abschluss:** untenstehende Checks ausführen,
   jeden B1–B3-Consumer nativ reviewen, Ergebnisse/Findings hier aktualisieren.
   Kein externes CodeRabbitreview für diesen Dokumentationsauftrag.
   Die ausführbare Kurzfolge endet bei geprüften Postconditions, nicht bei Move.

Weitere Lieferdatei ist ausschließlich diese Roadmap. Kein Runtime-/Tool-/Test-/
SQL-/Backend-/Secret-/Geräte-/APK-/Installationsdelta. KASRKIN bleibt entbunden,
ARGUS stillgelegt. F05–F08 sind explizit außerhalb des Mutationsscope.

## Checks, Acceptance und Abschluss

Capabilities am 2026-10-13: Git 2.55.0.windows.2, rg 15.2.0, Node v24.18.0,
Python 3.14.6 und bestehende PowerShell durch lokale Verwendung verifiziert.
Gezielte [ATLAS-Karte](../../../codex-tools/environment/DEV_ENVIRONMENT.md)
für Git/PowerShell/Suche/Node/Python gelesen. Vorhandener Markdownlint-Aufruf:

```powershell
$lint = 'C:/Users/steph/AppData/Local/npm-cache/_npx/' +
  '0b2c56f61857d977/node_modules/.bin/markdownlint-cli2.cmd'
& $lint 'docs/MIDAS Repository Cleanup Follow-up Roadmap.md'
```

Markdownlint CLI 0.23.2/Engine 0.41.1 ist lokal verifiziert;
bei fehlendem Cache kein Download
oder Installationsauftrag ableiten. BackendCLI, Docker, ADB und Build sind
NOT_REQUIRED. Vorhandene Tools wurden am 2026-10-14 erfolgreich verwendet;
es gab keine Installationen oder externen Reviewläufe.

<!-- markdownlint-disable MD013 -->

| Check | Erwartung | Aktuelles Ergebnis |
| --- | --- | --- |
| T01 Referenzen/Scope | F01–F09 mit aktiven, historischen und impliziten Consumern disponiert; kein unbewiesener Löschkandidat im Scope | PASS für Planung / 2026-10-13; Source-/Consumerdelta invalidiert nur betroffenen Befund |
| T02 Preimages/Archiv | Ursprüngliche Bytes erhalten; Ziel kollisionsfrei, keine Reparsepunkte; eigener Rückweg | PASS / 2026-10-14: elf Preimages, begrenzte sichere Ziele; LEGACY-Datei byteidentisch zum Preimage, SHA-256 unten |
| T03 Workspace/Ignore | Folderziel ist Repo-Root; übriges JSON gleich. Alle bisher geschützten vorhandenen Dateien bleiben ignoriert; KASRKIN- und Secretrules erhalten | PASS / 2026-10-14: Workspace sonst identisch; alle 15.657 zuvor vorhandenen ignorierten Pfade weiterhin geschützt; Freezeabschnitt vollständig erhalten |
| T04 Dokuverträge | F03/F09 korrigiert; keine Schutz-/Gate-/Retestabschwächung; alle betroffenen Linkziele/Anker erreichbar | PASS / 2026-10-14: 60 lokale Links und elf Anker geprüft; technische Klauseln gegen Preimages erhalten, F22 nur historisch eingeordnet |
| T05 Unveränderte Consumer | F05–F08 sowie produktive Sources, Tests und aktuelle Guards unverändert; R8/R13 `--current` bestehen | PASS / 2026-10-14: beide Guards Exit 0; 603 geschützte getrackte und 1.721 lokale Dateien bytegleich; keine Runtime-/Device-/Testmatrix ausgeführt |
| T06 Markdown/Hygiene | Neue Roadmap ohne Lintfehler; Änderungen an Bestandsdokus ohne neue Fehler gegenüber Preimage, keine globale Altformatierung; UTF-8/Whitespace/`git diff --check` grün | PASS / 2026-10-14: acht Dokumente mit exakter Zeilenzuordnung verglichen; null neue Lintfehler, 280 bestehende Meldungen auf 277 reduziert; Roadmap selbst fehlerfrei. Kein globales Lint-PASS |
| T07 Closure | Alle vier Blöcke geprüft, Dispositionen/Resume synchron, temporäre eigene Stagingablage entfernt, abschließender Scopereview | PASS / 2026-10-14: Roadmap archiviert, sieben relative Verweise rebased und nach Archivierung T04–T06 erneut geprüft; eigene Stagingablage mit 15 temporären Dateien entfernt. Finaler Scopereview ohne offene Findings |

<!-- markdownlint-enable MD013 -->

Native Planprüfung: Referenzabdeckung, Reihenfolge, Exact-Scope, Schutzgates,
Rollback und Fresh-Chat-Verständlichkeit geprüft; keine offenen Scope-P0/P1.
Ungeklärte Artefaktnutzung ist durch KEEP wirksam abgegrenzt, kein Lösch-PASS.
Acceptance verlangt T02–T07 tatsächlich PASS und erhaltene F05–F08, nicht deren
Beseitigung. Changelog: kleine Doku-/Editorhygiene, kein neuer Produkt-/Betriebs-
oder Securityvertrag; daher kein zusätzlicher Changelogeintrag nötig.
README/AGENTS, QA/Runbooks, BLUEPRINT/ATLAS und sql/HOW_TO bleiben unverändert.

Nach bewiesenem lokalen Abschluss diese Datei als
`docs/archive/MIDAS Repository Cleanup Follow-up Roadmap (DONE).md` ablegen,
ihre relativen Links neu auflösen und finale Link-/Encoding-/Whitespace-/Lint-
Postchecks ausführen. Erst danach Gesamt-DONE; Gitwirkung separat.
Bei geplantem Zielkollision-/Encoding-/Consumerfehler ausschließlich eigenen
Block aus den gesicherten Preimages zurücknehmen; unabhängige Arbeit erhalten.

## Ausführungsnachweis und Resume

B1–B4 am 2026-10-14 umgesetzt und nativ auf Delta/Consumer/Scope geprüft.
F01 archiviert; F02/F03/F04/F09 korrigiert; F05–F08 ausdrücklich erhalten.
Keine offenen ausführungsrelevanten Findings. Ein erster B2-Pfadaufruf auf
`Supabase Core Module Overview.md` scheiterte vor jeder Mutation; danach wurde
der tatsächliche Pfad `Supabase Core Overview.md` verwendet und geprüft.
Ein Listenabstand im geänderten CSS-Einstieg wurde nach Lintdelta korrigiert.
Die vorigen Fehlversuche sind kein PASS; T02–T06 beschreiben die danach
vollständig geprüften Ergebnisse.

F01 SHA-256, identisch vor/nach der Archivierung:

```text
dc27fa9c0e46a066be739256727382c6ac78dbbe9c60840c98dc023457306741
```

Roadmap und LEGACY-Datei liegen an den festgelegten Archivzielen; alle
Postchecks nach Linkrebase sind PASS. Die eigene temporäre Stagingablage
`.tmp/repo-cleanup/MC-QC-02-20261014-01/` wurde nach Integritätsvergleich
vollständig entfernt, ebenso ausschließlich leere eigene Elternordner.
MC-QC-02 ist lokal abgeschlossen. HEAD und Index sind unverändert; der Worktree
enthält die zehn betroffenen getrackten Pfade und die zwei neuen Archivdateien.
Fremde Arbeit wurde nicht festgestellt. Es bleibt keine offene Pflichtaktion;
Zum lokalen Abschluss war die Commit-/Pushfreigabe noch OFFEN.
Es gab keine produktive oder externe Wirkung.

## Nachfolgender Gitauftrag am 2026-10-14

Nach lokalem DONE erteilte Stephan in diesem Chat ausdrücklich den Auftrag:
„Dann commit und push bitte“. G-GIT ist damit für den abgeschlossenen
MC-QC-02-Dateiumfang auf `main` nach `origin/main` ERTEILT.
Die vorstehenden Angaben zu HEAD, Index und Worktree dokumentieren den lokalen
Abschluss vor diesem Gitauftrag. Der tatsächliche Commit, Push und abgeglichene
Remote-Endstand werden in der anschließenden Chatantwort bestätigt.
Der Gitauftrag erweitert keinen fachlichen Scope und enthält keinen Deploylauf.

[supabase-recovery]: ../reference/supabase/MIDAS%20Supabase%20Modernization%20Deferred%20Work%20and%20Recovery.md
