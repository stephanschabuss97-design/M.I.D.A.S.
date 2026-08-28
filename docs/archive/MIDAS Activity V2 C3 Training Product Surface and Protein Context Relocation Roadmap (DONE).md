# MIDAS Activity V2 C3 Training Product Surface and Protein Context Relocation Roadmap

Diese Roadmap trennt Training als eigene Produktfläche aus Vitals heraus,
ohne den Writer zu wechseln. Activity V1 bleibt während C3 der einzige
produktive Schreibpfad. Gleichzeitig erhält Profile ein eigenes Icon und die
bisher im Training eingeblendete Protein-Berechnungserklärung wandert als
ruhiger, read-only Detaildialog zum Protein-Ziel im Dashboard. C3 wird erst
nach abgeschlossenem R13 ausgeführt und stabilisiert die sichtbare
Produktfläche, bevor R14 dort Activity V2 aktiviert.

---

## Roadmap-Metadaten

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Status | `DONE` |
| Modul / Bereich | `Activity / Hub / Capture / Vitals / Profile / Protein / PWA UI` |
| Owner / Kontext | `Stephan; persönliche Single-User-Gesundheitsanwendung` |
| Chat-Lebenszyklus | `Denkraum -> eigener Ausführungs-Chat nach R13 DONE` |
| Erstellt am | `2026-08-23` |
| Letzter Stand | `2026-08-28; S1-S6 PASS; U8 FINAL_OBSERVATION bei 78 % / 81 %; Roadmap archiviert` |
| Aktueller Schritt | `Abgeschlossen; R14 ist das nächste Core-Gate` |
| Risikoklasse | `R2`; sichtbarer Hub-/Capture-/Dashboard-Umbau über mehrere Consumer, ohne Datenmodell- oder Backendänderung |
| Standard-Reviewtiefe | `Consumer`; Full in S1-S4R, S5 und S6 gemäß Workflow |
| Ausführungsmodell | `GPT-5.6 Sol` |
| Reasoning-Standard | `High` für den gesamten Ausführungs-Chat |
| Reasoning-Ausnahmen | `Roadmap-Erstellung und initialer Red-Team-Contract-Review: Ultra auf Owner-Auftrag; ein späterer R13-Postimage-Widerspruch ist ein Stop-Gate statt stiller Reasoning-Ausweitung` |
| Autonome Discovery Wave | `G0, danach S1-S4R` |
| Autonomieprofil | `local-full nach bestandenem G0` |
| Maximal autonomer Endpunkt | `S6`; nur echte Stop-Bedingungen oder Owner-Gates unterbrechen |
| Geplante Reasoning-Wellen | `G0-S6 gemeinsam High; kein routinemäßiger Stufenwechsel zwischen Discovery, Umsetzung und Review` |
| Erwartete Arbeitsgröße | `medium`; in S4R anhand des R13-Postimages bestätigt |
| Externes Reviewbudget | `S1-S4: 0; S5 bei Codeänderung: 1 Initial + höchstens 1 Verifikation` |
| Owner-Erklärmodus | `Briefing + kurzer S6-Recap` |
| Betroffene Hauptdateien | `index.html; app/modules/hub/index.js; assets/js/main.js; app/modules/vitals-stack/vitals/index.js; app/modules/vitals-stack/protein/index.js; app/styles/hub.css; service-worker.js; assets/img; fokussierte Tests und Doku` |
| Deploy relevant | `ja`; sichtbarer Web-/PWA-Code und Cachevertrag ändern sich, aber Veröffentlichung, Commit und Push bleiben außerhalb von C3 owner-gated |
| Produktive Schreibwirkung | `nein`; der bestehende Activity-V1-Write bleibt semantisch unverändert |
| Workflow-Vertrag | `docs/templates/MIDAS Roadmap Workflow Contract.md` |
| Usage-Continuation | `vollständig erfüllt`; U0-U8 sowie alle dokumentierten Resume-/Follow-up-Gates genau einmal ausgeführt; U8 war reine FINAL_OBSERVATION |
| Evidence-Datei | `nicht erforderlich`; kein SQL, keine Migration, ACL-, Cron-, Workflow- oder Remote-Wirkung und keine Deployaktion innerhalb von C3 |
| Gekoppelte Roadmaps | `R13 muss DONE sein und liefert das reale Reader-Postimage; R14 darf erst nach C3 den Activity-V2-Writer aktivieren` |
| Evidence-Owner | `nicht relevant` |
| Archivziel | `docs/archive/MIDAS Activity V2 C3 Training Product Surface and Protein Context Relocation Roadmap (DONE).md` |

<!-- markdownlint-enable MD013 -->

## Ausführungs-Chat-Startkarte

- Auftrag:
  - `C3 nach bestandenem R13-Postimage-Gate deterministisch und agentisch bis
    S6 abarbeiten. Nur bei einer benannten Stop-Bedingung oder tatsächlich
    erforderlicher Owner-Interaktion pausieren.`
- Modell und Reasoning:
  - `GPT-5.6 Sol / High für den gesamten Ausführungs-Chat.`
- Kontextübergabe aus dem Denkraum:
  - `PASS: Produktfläche, Iconidentitäten, Activity-V1-Grenze,
    Protein-Dialog, Nichtziele und R14-Abhängigkeit sind eingefroren.`
- Verbindliche Lesereihenfolge:
  1. `Diese Startkarte, Roadmap-Metadaten, Session Resume Card und Context
     Receipt`
  2. `AGENTS.md und README.md`
  3. `docs/DEV_ENVIRONMENT.md`
  4. `docs/templates/MIDAS Roadmap Workflow Contract.md`
  5. `docs/Future trainingsmodule update thoughts.md`, nur C3, O-10 und die
     R13-/R14-Grenzen
  6. `finale archivierte R13-Roadmap und R13-Evidence sowie nur der für C3
     relevante R13-Postimage-Diff`
  7. `docs/modules/Activity Module Overview.md`
  8. `docs/modules/Capture Module Overview.md`
  9. `docs/modules/Hub Module Overview.md`
  10. `docs/modules/Profile Module Overview.md`
  11. `docs/modules/Protein Module Overview.md`
  12. `index.html`, Hubrouting, Activity-V1-Save, Vitals-Tablogik,
      Protein/Profile-Producer, betroffene Styles und Service Worker`
  13. `git status --short und nur der relevante Diff`
- Startschritt:
  - `G0 - R13-Postimage-Gate; bei PASS unmittelbar S1.`
- Freigegebener autonomer Block:
  - `G0 sowie S1-S6 unter local-full. G0 darf nur lesen. Nach jedem
    Discovery-Hauptschritt internes Continuation Gate; bei PASS automatisch
    fortfahren.`
- Autonomieprofil und maximaler Endpunkt:
  - `local-full; S6 einschließlich Doku-Sync und Archivierung.`
- Interne Continuation Gates:
  - `S1, S2, S3 und S4R jeweils mit Full Contract Review,
    Findings-Korrektur, Statusmatrix- und Resume-Card-Sync abschließen.`
  - `S4R empfiehlt kohärente S4-Blöcke. Bei small/medium, unverändertem Scope
    und ohne Owner-Gate S4, S5 und S6 automatisch fortsetzen.`
  - `S4 verwendet nur native Delta-/Consumer-Reviews. S5 bündelt die finale
    Testmatrix, den nativen Full Review und CodeRabbit.`
- Usage-Continuation-Gates:
  - `U0 unmittelbar vor G0; danach jeweils nach dem abgeschlossenen Block und
    vor G0->S1, S1->S2, S2->S3, S3->S4R, S4R->Block A, Block A->Block B und
    Block B->S5/S6 gemäß zentralem Workflow-Vertrag.`
  - `Während eines kohärenten Blocks nicht pollen oder usagebedingt
    unterbrechen. Nach Safe Closure keinen neuen Block beginnen; den letzten
    atomaren Zustand, Statusmatrix und Resume Card vollständig sichern.`
- Erlaubte Autonomie:
  - `lokale Reads, Dateiedits, Assetkopie, fokussierte Tests, lokaler
    Live-Server, Browserautomation, Dokumentation und Archivierung.`
  - `Das bereits owner-bestätigte assets/img/Personal_data_v3.png darf
    übernommen und technisch validiert werden; keine erneute Bildfreigabe ist
    nötig, solange das Motiv unverändert bleibt.`
- Owner-Gates:
  - `R13 muss tatsächlich DONE und archiviert sein.`
  - `Neue Produktentscheidung, visuelle Neugestaltung des bestätigten Icons,
    medizinische Semantikänderung, SQL, Remote-Supabase, Workflow, Deploy,
    Deviceaktion, Commit oder Push.`
  - `Wenn weder In-App-Browser noch dokumentierter lokaler Browserfallback die
    sichtbare UI verifizieren können, ist die fehlende UI-Abnahme ein Gate.`
- Stop-Bedingungen:
  - `R13 ist nicht DONE, seine Abschlussquellen fehlen oder das Postimage ist
    widersprüchlich.`
  - `Activity V1 kann nicht ohne neuen Speichervertrag oder doppelten
    sichtbaren Save-Pfad verlagert werden.`
  - `Der Protein-Dialog würde eine neue Formel, einen neuen medizinischen
    Schwellenwert oder einen neuen Backendvertrag benötigen.`
  - `S4R klassifiziert den realen Scope als large oder findet ein ungeklärtes
    P0/P1 beziehungsweise eine ownerpflichtige Produktfrage.`
  - `Ein externer Write, Deploy, Secret, SQL, Workflow oder Devicezugriff wäre
    nötig.`
  - `Das verpflichtende Usage-Gate ergibt SAFE_CLOSURE oder der lokale State
    ist nicht frisch und vollständig; dann Status
    PAUSED_USAGE_SAFE_CLOSURE setzen und vor dem nächsten Block stoppen.`
- Halluzinationsschutz:
  - `Keine R13-Dateien, Profilfelder, Activity-APIs, Datumsregeln oder
    Cacheversionen aus dieser Planung ableiten. G0/S1 prüfen das reale
    Postimage.`
  - `Keine Activity-V2-Skripte oder vorbereiteten R11/R12-Adapter allein wegen
    C3 produktiv aktivieren. R13 und R14 behalten ihre Zuständigkeit.`
  - `Keine gespeicherten Proteinwerte durch Clientberechnungen ersetzen.`
- Startprompt:

```text
Arbeite die Roadmap
`docs/MIDAS Activity V2 C3 Training Product Surface and Protein Context Relocation Roadmap.md`
gemäß ihrer Ausführungs-Chat-Startkarte ab.

Beginne mit U0. Nur bei einer zulässigen Usage-Entscheidung folgt das read-only
Gate G0. Prüfe dort, ob R13 tatsächlich DONE und archiviert ist, lies nur sein
für C3 relevantes Postimage und aktualisiere die Ausführungsbaseline. Ist R13
nicht abgeschlossen oder widersprüchlich, stoppe ohne C3-Codeänderung und
benenne exakt den fehlenden Vertrag.

Bei bestandenem G0 arbeite S1, S2, S3 und S4R deterministisch nacheinander ab.
Schließe jeden Hauptschritt mit Full Contract Review, minimaler Korrektur
berechtigter Findings, Statusmatrix-, Context-Receipt- und Resume-Card-Sync ab
und fahre bei bestandenem internem Continuation Gate ohne Rückfrage fort.

Führe U0 unmittelbar vor G0 und danach jedes in der Roadmap geplante
Usage-Continuation-Gate mit einem frischen lokalen State aus. Trage nur reale
Messwerte und Entscheidungen in die Checkpoint-Tabelle ein. Bei
CONTINUE_WITH_CAUTION beginne höchstens einen kurzen, reversiblen und sicher
resumierbaren Block. Bei SAFE_CLOSURE beginne keinen neuen Block, setze einen
vollständigen Handoff und stoppe ohne Rollback des letzten gültigen Zustands.

Bestätigt S4R weiterhin einen lokalen, reversiblen small/medium Scope ohne
Owner-Gate, führe die empfohlenen S4-Ausführungsblöcke sowie S5 und S6 autonom
bis zur Archivierung aus. S4 erhält nur native Delta-/Consumer-Reviews;
CodeRabbit ist dort verboten und gehört ausschließlich mit einem Initial- und
höchstens einem Verifikationslauf in S5. Nutze für die UI zuerst den
dokumentierten In-App-Browser und sonst den verifizierten lokalen
Browserfallback. Wiederhole nur durch den tatsächlichen Diff invalidierte
Checks.

Stoppe nur bei den benannten Stop-Bedingungen. Führe kein SQL, keinen
Remote-Supabase-Write, keinen Deploy, keinen Workflowlauf, keine Deviceaktion,
keinen Commit und keinen Push aus. Activity V1 bleibt in C3 der einzige
Writer; Activity V2 bleibt bis R14 als Capture verborgen.
```

## Session Resume Card

- Ziel:
  - `Training als eigene Hub-Produktfläche mit unverändertem Activity-V1-
    Writer etablieren und die Protein-Erklärung read-only ins Dashboard
    verlagern.`
- Unveränderliche Verträge:
  - `Activity V1 bleibt alleiniger produktiver Writer; kein Dual Write.`
  - `Activity-V1-RPC, Persistenz, Historie und Doctor-Consumer bleiben
    unverändert.`
  - `Vitals enthält danach nur Blutdruck, Körper und Labor.`
  - `Der Protein-Dialog berechnet nichts neu und verändert weder Formel noch
    Doctor-Lock.`
  - `R13 aktiviert Reader; R14 aktiviert später den V2-Capture.`
- Erledigter Stand:
  - `C3/O-10 sind im Masterplan als verpflichtendes Core-UI-Gate eingefroren.`
  - `Personal_data_v3.png ist owner-bestätigt, aber nicht produktiv verdrahtet.`
  - `Initialer C3-Contract-Review und G0 sind PASS; R13-Roadmap/Evidence sind
    DONE archiviert, F-ACT-C3-09 ist geschlossen.`
  - `S1-S6 sind PASS. README, fünf Module Overviews, Activity-Masterplan,
    Auth-Modernisierungsgrenze, HCR-032 und Changelog bilden dasselbe C3-
    Postimage ab; finaler Source-of-Truth-, Contract-, Scope- und Linkreview
    ist grün.`
- Aktueller Schritt:
  - `S4 inklusive UI-Follow-up vollständig PASS. UR-S5-02 ergab CONTINUE.
    S5 ist lokal vollständig geprüft: finale Contract-/Smoke-Matrix, eine
    gebündelte Edge-Browsersession für 1440x900, 390x844 und 320x800 sowie der
    native Full Contract/Security/Scope Review sind PASS. Zwei dabei gefundene
    responsive/accessibility Deltas wurden minimal behoben und nur die
    invalidierten Prüfungen wiederholt. Der initiale CodeRabbit-Aufruf
    scheiterte vor Reviewstart, weil die CLI den isolierten Git-Worktree nicht
    als Repository erkannte; gemäß Ein-Lauf-Vertrag wurde nicht wiederholt.
    Der Owner lieferte anschließend den manuellen initialen CodeRabbit-Review:
    ein berechtigtes Fokus-Finding wurde minimal behoben und live verifiziert;
    der Gewicht-Cache-Hinweis widersprach der belegten Save-Reihenfolge und
    wurde nicht umgesetzt. Ein Verifikationslauf ist nicht erforderlich. S5
    ist vollständig PASS. UR-S6-01 erlaubte nach dem 5h-Reset S6; die
    vollständigen S6-Postconditions sind PASS. U8 wurde danach genau einmal
    als FINAL_OBSERVATION ausgeführt und C3 ist `DONE`.`
  - `Owner schließt die Session am 2026-08-27 ausdrücklich ab. Der goldene
    Proteinwert ist vorläufig akzeptiert; eine spätere Änderung auf Weiß ist
    nur eine optionale visuelle Geschmacksentscheidung und kein offenes
    Finding.`
- Nächster erlaubter Schritt:
  - `Keiner innerhalb C3. R14 darf auf dem archivierten C3-Postimage planen und
    bleibt das einzige Activity-V2-Capture-/Android-PWA-Cutover-Gate.`
- Offene Findings:
  - `none; F-ACT-C3-19/-20 sind geschlossen, F-ACT-C3-21 wurde nach belegter
    Writer-/Sync-Reihenfolge als nicht berechtigt verworfen.`
- Geänderte Dateien:
  - `Owner-/Planungsdirty: AGENTS.md, docs/DEV_ENVIRONMENT.md,
    docs/Future trainingsmodule update thoughts.md, Auth-Masterplan,
    Roadmap-Templates, Usage-Tooling und weitere neue Doku.`
  - `C3-owned: Roadmap, index.html, Hub/Vitals/Main/Hub-CSS,
    Profile/Protein, App-CSS, Service Worker, direkt invalidierte
    v13-Consumerorakel,
    Activity_v2.png und fokussierter C3-Contracttest. Personal_data_v3.png
    bleibt owner-bestätigt/untracked und bytegleich.`
  - `S6-owned: README, Activity/Capture/Hub/Profile/Protein Overviews,
    Activity-Masterplan, Auth-Modernisierungsgrenze, HCR-032 und Changelog;
    zusätzlich vier bereits veraltete R1-/C2-Archivlinks minimal korrigiert.`
- Gültige Nachweise:
  - `EV-ACT-R13-L03/L07/C45/R06/R07; R13-DONE-Fingerprints im Context Receipt;
    Masterplan C3/O-10/R14, aktuelles V1-Writer-Orakel und S4R-Scope-Freeze.`
- Context Receipt:
  - `Ausführungsbaseline 557a219c; G0-Fingerprints und Dirty Boundary aktuell.`
- Autonomieprofil / aktuelle Welle:
  - `local-full nach G0; G0-S6 High; maximal S6.`
- Letzter Usage-Checkpoint / Entscheidung:
  - `U8 2026-08-28T11:58:02+02:00: 5h 78 %, Woche 81 %; gültige Telemetrie,
    FINAL_OBSERVATION nach vollständigen S6-Postconditions. Keine neue Arbeit
    autorisiert und DONE nicht zurückgesetzt.`
- Runtime-/Deploy-Stand:
  - `R13 produktiv DONE; C3 lokal implementiert, S1-S6 vollständig PASS und
    als DONE archiviert, aber nicht deployed. Activity V1 ist lokal alleiniger
    Writer; V2-Capture/Productload bleibt verborgen.`
- Offene Owner-Freigaben:
  - `none im lokalen C3-Scope.`
- Stop-Bedingungen:
  - `G0 nicht überspringen; keine neue Backend-, Medizin-, V2-Capture- oder
    Deploywirkung; kein neuer Block nach SAFE_CLOSURE.`

## Usage-Continuation-Checkpoints

Die Gate-Logik, Freshness- und Schwellenregeln stehen ausschließlich im
zentralen Workflow-Vertrag. C3 protokolliert hier nur reale Messungen und
Entscheidungen; keine Planwerte, Schätzungen oder vollständigen JSON-Snapshots.

Geplante kohärente Grenzen:

- `U0`: vor G0.
- `U1`: nach G0 und vor S1.
- `U2`: nach S1 und vor S2.
- `U3`: nach S2 und vor S3.
- `U4`: nach S3 und vor S4R.
- `U5`: nach S4R und vor Block A (`S4.1-S4.2`).
- `U6`: nach Block A und vor Block B (`S4.3-S4.4`).
- `U7`: nach Block B und vor dem gemeinsamen S5-/S6-Abschlussblock.
- `UR1`: Resume-Gate nach Owner-Fortsetzung und vor S5; einmal ausgeführt.
- `UF1`: einmaliger Gate vor dem ownergerichteten kurzen UI-Korrekturblock.
- `UF2`: Abschlussbeobachtung nach diesem UI-Korrekturblock; autorisiert bei
  SAFE_CLOSURE keine weitere Arbeit.
- `UR2`: nur nach vollständigem S5 und vor S6, gemäß Ownerweisung vom
  `2026-08-27`.
- `UR-S6-01`: neuer Resume-Gate unmittelbar vor S6 nach dem ownergemeldeten
  5h-Reset; genau einmal ausgeführt.
- `U8`: nach vollständig erfüllten S6-Postconditions als reine
  `FINAL_OBSERVATION`, unmittelbar bevor die Roadmap archiviert wird. U8 ist
  kein Continuation Gate, autorisiert keine neue Arbeit und kann einen bereits
  bewiesenen DONE-Stand nicht zurückstufen.

<!-- markdownlint-disable MD013 -->

| ID | Grenze / nächster Block | Messzeit | 5h Rest / Reset | Woche Rest / Reset | Verbrauch 5h / Woche | Ereignis | Entscheidung |
| --- | --- | --- | --- | --- | --- | --- | --- |
| U0 | vor G0 | `2026-08-27T07:43:09+02:00` | `95 % / 1787827317` | `25 % / 1788275350` | `Baseline / Baseline` | `BASELINE` | `CONTINUE` |
| U1 | nach G0 / vor S1 | `2026-08-27T07:45:15+02:00` | `90 % / 1787827317` | `25 % / 1788275350` | `5 / 0 Prozentpunkte` | `NORMAL` | `CONTINUE` |
| U2 | nach S1 / vor S2 | `2026-08-27T07:49:27+02:00` | `75 % / 1787827317` | `22 % / 1788275350` | `15 / 3 Prozentpunkte` | `NORMAL` | `CONTINUE` |
| U3 | nach S2 / vor S3 | `2026-08-27T07:51:15+02:00` | `71 % / 1787827317` | `22 % / 1788275350` | `4 / 0 Prozentpunkte` | `NORMAL` | `CONTINUE` |
| U4 | nach S3 / vor S4R | `2026-08-27T07:54:18+02:00` | `64 % / 1787827317` | `21 % / 1788275350` | `7 / 1 Prozentpunkte` | `NORMAL` | `CONTINUE` |
| U5 | nach S4R / vor Block A | `2026-08-27T07:55:13+02:00` | `62 % / 1787827317` | `20 % / 1788275350` | `2 / 1 Prozentpunkte` | `CAUTION; Reserve 22.5 / 4.5, projiziert 39.5 / 15.5` | `CONTINUE_WITH_CAUTION; genau Block A` |
| U6 | nach Block A / vor Block B | `2026-08-27T08:01:55+02:00` | `53 % / 1787827318` | `19 % / 1788275350` | `RESET_CROSSED / 1 Prozentpunkt` | `RESET_CROSSED 5h; CAUTION; Wochenreserve 4.5, projiziert 14.5` | `CONTINUE_WITH_CAUTION; genau Block B` |
| U7 | nach Block B / vor S5/S6 | `2026-08-27T08:11:10+02:00` | `34 % / 1787827317` | `16 % / 1788275350` | `RESET_CROSSED / 3 Prozentpunkte` | `RESET_CROSSED 5h; CAUTION; kein kurzer ungeteilter S5/S6-Block` | `SAFE_CLOSURE; keinen Abschlussblock beginnen` |
| UR1 | Resume vor S5 | `2026-08-27T13:40:25+02:00` | `99 % / 1787848709` | `15 % / 1788275350` | `RESET_CROSSED / 1 Prozentpunkt` | `RESET_CROSSED 5h; Woche CAUTION; S5 nicht kurz` | `SAFE_CLOSURE; S5 nicht beginnen` |
| UF1 | vor kurzem UI-Korrekturblock | `2026-08-27T13:55:27+02:00` | `81 % / 1787848709` | `12 % / 1788275350` | `18 / 3 Prozentpunkte` | `CAUTION; genau ein kurzer, lokaler, reversibler Fixblock` | `CONTINUE_WITH_CAUTION; nur Profile/Protein-Sichtbarkeit und direkt invalidierte Checks` |
| UF2 | nach UI-Korrekturblock / vor weiterer Arbeit | `2026-08-27T14:07:50+02:00` | `43 % / 1787848709` | `6 % / 1788275350` | `38 / 6 Prozentpunkte` | `LOW; Wochenreserve unter 10 %` | `SAFE_CLOSURE; keinen neuen Block beginnen` |
| UR-S5-02 | Resume unmittelbar vor S5 | `2026-08-28T06:39:48+02:00` | `99 % / 1787909976` | `100 % / 1788496776` | `RESET_CROSSED / RESET_CROSSED` | `RESET_CROSSED 5h und Woche; frische vollständige Telemetrie` | `CONTINUE; S5 beginnen` |
| UR-S5-FX-01 | vor kurzem S5-Fokuskorrekturblock | `2026-08-28T07:41:19+02:00` | `33 % / 1787909976` | `89 % / 1788496776` | `66 / 11 Prozentpunkte seit UR-S5-02` | `CAUTION; genau ein kurzer lokaler reversibler Fokusfix` | `CONTINUE_WITH_CAUTION; nur Findingbewertung, Fokusfix und invalidierte Checks` |
| UR2 | nach vollständigem S5 / vor S6 | `2026-08-28T07:54:05+02:00` | `3 % / 1787909976` | `85 % / 1788496776` | `30 / 4 Prozentpunkte seit UR-S5-FX-01` | `LOW; 5h-Reserve unter 25 %` | `SAFE_CLOSURE; S6 nicht beginnen` |
| UR-S6-01 | Resume unmittelbar vor S6 | `2026-08-28T11:46:57+02:00` | `99 % / 1787928412` | `84 % / 1788496776` | `RESET_CROSSED / 1 Prozentpunkt seit UR2` | `RESET_CROSSED 5h; gültige vollständige Telemetrie` | `CONTINUE; S6 beginnen` |
| U8 | nach vollständigen S6-Postconditions / vor Archiv | `2026-08-28T11:58:02+02:00` | `78 % / 1787928412` | `81 % / 1788496776` | `21 / 3 Prozentpunkte seit UR-S6-01` | `FINAL_OBSERVATION; gültige vollständige Telemetrie` | `DONE bleibt bewiesen; keine neue Arbeit autorisiert` |

<!-- markdownlint-enable MD013 -->

Pro Gate wird genau eine reale Zeile ergänzt; die Resume Card übernimmt nur
die zuletzt eingetragene Entscheidung.

## Context Receipt

- Planungsbaseline-Commit:
  - `e3029629e088d850464bde7e09df999f9e394e28`
- Ausführungsbaseline:
  - `557a219ca65f2b34874600b18a301f037cbef182; origin/main identisch.`
- Dirty Boundary bei G0:
  - `Owner-/Prozessdirty außerhalb C3: AGENTS.md, docs/DEV_ENVIRONMENT.md,
    docs/Future trainingsmodule update thoughts.md, Auth-Masterplan,
    Roadmap-Template/Workflow, Usage-Tooling und neue Doku.`
  - `Owner-Asset: assets/img/Personal_data_v3.png untracked und bestätigt.`
  - `C3-owned: diese aktive Roadmap; produktiver C3-Code noch unverändert.`
  - `Nach Block A C3-owned: index.html, Hub/Vitals/Main/Hub-CSS,
    assets/img/Activity_v2.png und
    tools/activity-v2-c3-training-surface.contract.test.mjs. Ownerdirty bleibt
    unberührt.`
  - `Nach Block B zusätzlich C3-owned: Profile/Protein, service-worker.js,
    aktuelle R13-Produkt-/Isolationstests und Product-Smoke. Keine
    historische Frozen-Datei, Ownerdirty oder externe Quelle verändert.`
  - `Ownergerichtetes UI-Follow-up: index.html und Hub-CSS nur für Tooltip,
    Kontrast, Profilgröße und optische Vertikalposition; app/app.css und
    service-worker.js für den versionierten Hub-CSS-Cache v9; ausschließlich
    direkt invalidierte aktuelle Tests angepasst. Personal_data_v3.png bleibt
    mit SHA256 4FFE900B...A5B56AE bytegleich.`
  - `S5-Deltas: Hub-CSS korrigiert mobilen dekorativen Overflow und hebt die
    betroffenen Close-/Action-/Tab-/Copy-Touchziele auf mindestens 44 px;
    app/app.css, service-worker.js und aktuelle Consumerorakel zunächst auf v11
    aktualisiert. Owner-/Prozessdirty blieb unberührt.`
  - `S5-CodeRabbit-Follow-up: Hub-Dialog erhält Tab-Außenfokus-Rückholung plus
    dokumentweiten focusin-Guard. Der Hub-Scriptpfad ist mit v13 versioniert;
    Shell und aktuelle Cacheorakel sind monoton v13. Keine Änderung am
    Protein-Gewicht-Cache, weil recomputeTargets ausschließlich nach lokalem
    addEntry und erfolgreichem remote syncWebhook aufgerufen wird.`
- Gelesene Sources of Truth:
  - `AGENTS.md, README.md, Roadmap-Templates, Masterplan C3/O-10,
    Activity/Capture/Hub/Profile/Protein Overviews und reale Pre-R13-
    Produktquellen.`
  - `S1-Ausführungsstand: Activity 127F7A39...30875, Capture D93829F4...C2185,
    Hub 58B67D14...AF6F0, Profile 13C6E418...96A63 und Protein
    4741C814...56874; direkte R13-Produktquellen kartiert.`
- Gültige Evidence-/Test-IDs:
  - `R12 DONE und frühere Activity-V2-Nachweise bleiben nur für ihre
    unveränderten isolierten Verträge gültig.`
  - `R13: EV-ACT-R13-L03/L07/C45/R06/R07 bleiben gültig. Roadmap SHA256
    3F99EF29...ED4345, Evidence SHA256 CCDD3EC4...438A5.`
- Invalidation-Bedingungen:
  - `R13 änderte für C3 index.html, service-worker.js und doctor-scoped
    app/app.css; Hub, Main, Vitals, Protein und Profile blieben bytegleich.
    C3 muss Productload/SW v7 sowie Doctor-CSS als direkte Consumer schützen.`
  - `Änderung an Activity-V1 addActivity oder activity_add -> Save-Parität und
    Datumsvertrag erneut prüfen.`
  - `Änderung an Protein/Profile-Payload -> Dialog-Keyset und Empty-/Lock-
    Zustände erneut prüfen.`
  - `Profile-select/getData oder Latest-Weight-Lesehilfe -> T06/T07 und
    read-only-/stale-/error-Orakel erneut prüfen.`
  - `S4R bestätigt diese Map ohne neue Consumer: Block A invalidiert nur
    Routing/Writer/Vitals/Assets; Block B Protein/Profile/Dialog/CSS/SW. Die
    vollständige gebündelte Matrix bleibt S5 vorbehalten.`
- Tool-/Runtime-Status:
  - `Git 2.55.0, Node 24.18.0, Playwright 1.61.1 und CodeRabbit 0.7.5/auth
    verfügbar; In-App-Browser-Skill verfügbar und S5-first. Kein Tool oder
    Dependency installiert; ImageMagick ist keine Voraussetzung.`
  - `Historischer kurzer Desktop-Vorabpass über den Browser-Skill: Profil
    518 px bei CSS-Ziel 520 px und 14 px Versatz; Protein-Ziel kontrastreich,
    Klickdialog read-only, Escape mit Fokusrückgabe. Die nachfolgende
    S5-Vollmatrix ist separat protokolliert.`
  - `S5: In-App-Browser zuerst versucht, aber Runtime iab nicht verfügbar;
    dokumentierter lokaler Edge-Fallback verwendet. Eine zusammenhängende
    Session prüfte 1440x900, 390x844 und 320x800 ohne finalen horizontalen
    Overflow; Dialogzustand, Fokusfalle, Escape/Fokusrückgabe, Maus, sichtbarer
    Pointer-Tap, Tastatur, Training-Lifecycle, Vitals-Tabs und Profile PASS.`
  - `S5 lokale Matrix PASS: C3-Contract, R13-Readerisolation, Doctor-Contract
    4/4, Activity-V2-Isolation 5/5, Product-Smoke 5/5 inklusive v9→v13,
    Personal_data_v3.png SHA256 4FFE900B...A5B56AE und git diff --check.`
  - `CodeRabbit 0.7.5 war authentifiziert. Der exakt eine initiale Aufruf
    gegen den isolierten C3-Diff endete vor Reviewstart mit „Git repository not
    found“, weil die CLI den verknüpften Worktree nicht erkannte. Kein
    Ersatz-, Installations- oder Verifikationslauf ausgeführt.`
  - `Ownerseitiger manueller CodeRabbit-Initialreview lieferte zwei Hinweise:
    Fokusfalle berechtigt und als F-ACT-C3-20 behoben; Gewicht-Cache als
    F-ACT-C3-21 nach realem Writer-/Sync-Kontrollfluss verworfen. Kein
    Verifikationslauf: der einzige Fix ist durch Contracttest, v13-Smoke und
    den realen Edge-Fokuspfad ausreichend verifiziert.`
  - `S6 synchronisierte README, fünf Module Overviews, Activity-Masterplan,
    Auth-Modernisierungsgrenze, HCR-032 und Changelog. Der native finale
    Source-of-Truth-/Contract-/Security-/Scope-Review fand kein offenes P0/P1;
    git diff --check ist grün. Nach der Archivierung lösen alle relevanten
    lokalen Links einschließlich des C3-(DONE)-Ziels auf.`
  - `U8 FINAL_OBSERVATION: Sensor v3.1.0, 5h 78 %, Woche 81 %, Reset-Epochen
    1787928412 / 1788496776. Das bereits bewiesene DONE-Postimage blieb
    unverändert; anschließend wurde nur die geplante Archivierung vollzogen.`

## Zielvertrag

Prüfbares Endergebnis:

- Im Hub-Karussell steht unmittelbar nach Vitals ein eigenes Modul
  `Training`; dieselbe Produktfläche ist über die Quickbar erreichbar.
- Training verwendet ein dediziertes Activity-Asset, das bytegleich aus dem
  bisherigen `Personal_data_v2.png` kopiert wird. Profile verwendet das
  owner-bestätigte `Personal_data_v3.png`. Kein Dateipfad besitzt zwei
  Modulidentitäten.
- Die bestehende Activity-V1-Form befindet sich genau einmal in einem eigenen
  Training-Hub-Panel. Sie speichert über denselben `AppModules.activity`
  Vertrag und dieselben RPCs wie zuvor.
- Die Trainingsfläche besitzt einen sichtbaren eigenen Trainingstag. Dieser
  ist die einzige Datumsquelle für den Activity-V1-Save, startet pro
  Dokumentlauf mit dem Wiener aktuellen Tag, bleibt beim Öffnen/Schließen
  erhalten und wird nach erfolgreichem Save nicht still geändert.
- Reset löscht Aktivität, Dauer und Notiz, nicht den ausgewählten Trainingstag.
  Schließen und erneutes Öffnen bewahrt ungespeicherte Formularwerte innerhalb
  desselben Dokumentlaufs wie bisher; Reload-Recovery wird in C3 nicht
  erfunden.
- Vitals zeigt nur noch Blutdruck, Körper und Labor. Es existiert weder ein
  versteckter Training-Tab noch ein zweiter sichtbarer Activity-V1-Save-Pfad.
- Das Dashboard-Protein-Ziel ist per Klick, Tap und Tastatur ein
  Dialog-Trigger. Der Dialog besitzt Fokusführung, Escape-/Close-Verhalten und
  verständliche Loading-, Empty- und Fehlerzustände.
- Der Dialog zeigt ausschließlich bestehende gespeicherte oder bereits
  read-only geladene Ableitungsdaten: Zielbereich, Altersbasis,
  Aktivitätsfenster/-stufe beziehungsweise Score, Vor-CKD-Faktor, CKD-Faktor,
  aktuellen Gesamtfaktor, Berechnungszeitpunkt, Doctor-Lock und die bereits
  verwendete letzte Gewichtsbasis, soweit vorhanden.
- Ein nicht separat gespeicherter Aktivitätsmodifier wird nicht erneut im
  Client aus Schwellen berechnet. Fehlende Felder erscheinen neutral als
  nicht verfügbar; der Dialog löst niemals eine Neuberechnung aus.
- Carousel-, Quickbar-, Panel-, Close-/Escape-, Fokus-, Responsive- und
  Service-Worker-Verträge sind synchron. Desktop sowie 390x844 und 320x800
  sind ohne Überlappung oder horizontalen Overflow bedienbar.
- R13-Reader bleiben aktiv und unverändert. Activity V2 bleibt als Capture,
  History und Coaching-Download bis R14 aus der Produktnavigation verborgen.

Bewusst unverändert:

- Activity-V1-Datenmodell, `activity_add/list/delete`, vorhandene Historie,
  Doctor View und Berichte.
- Proteinformel, CKD-Faktoren, ACT-Schwellen, Doctor-Lock und gespeicherte
  Zielwerte.
- Activity-V2-Draft, Recovery, Commit, History und Coaching-Export.
- Supabase, SQL, RLS, ACL, Edge Functions, Workflows, Android-APK und Deploys.

## Problem und Ist-Zustand

- Training ist fachlich ein eigenes Daily-Driver-Modul, liegt sichtbar aber
  als vierter Tab unter Vitals.
- Das stilisierte Körpermotiv wird heute ausschließlich als Profile-Icon
  verwendet, passt fachlich künftig jedoch besser zu Activity. Profile besitzt
  deshalb bereits ein neues, owner-bestätigtes, noch unverdrahtetes Icon.
- Activity V1 liest seinen Tag aus `#date` im Vitals-Panel. Eine reine
  DOM-Verschiebung würde eine unsichtbare Datumsabhängigkeit erhalten.
- Die Protein-Berechnungserklärung liegt unter der Activity-V1-Form, obwohl
  sie zum Dashboard-Protein-Ziel gehört.
- Die alte Erklärung berechnet den Aktivitätsmodifier zusätzlich im Client.
  Das widerspricht dem Ziel, nur gespeicherte Backend-/Profilableitungen zu
  erklären.
- C3 darf den späteren R14-Cutover nicht vorwegnehmen und muss deshalb die
  bekannte V1-Erfassung exakt erhalten.

## Entscheidungslog

<!-- markdownlint-disable MD013 -->

| ID | Datum | Entscheidung | Warum | Betrifft |
| --- | --- | --- | --- | --- |
| D-ACT-C3-01 | 2026-08-23 | C3 ist ein verpflichtendes Core-UI-Gate zwischen R13 und R14. | Readeraktivierung, Produktfläche und Writer-Cutover bleiben getrennt rückrollbar. | Gesamtscope |
| D-ACT-C3-02 | 2026-08-23 | Activity V1 bleibt während C3 der einzige Writer. | C3 ist eine Produktflächenmigration, kein Daten- oder Capture-Cutover. | S2/S4/S5 |
| D-ACT-C3-03 | 2026-08-23 | Training erscheint unmittelbar nach Vitals im Karussell und zusätzlich in der Quickbar. | Ein eigenständiges Daily-Driver-Modul braucht konsistente primäre und schnelle Navigation. | Hubrouting |
| D-ACT-C3-04 | 2026-08-23 | Profile verwendet `Personal_data_v3.png`; `Personal_data_v2.png` wird bytegleich als `Activity_v2.png` kopiert. | Fachliche Assetidentitäten werden getrennt, ohne das bewährte Körpermotiv neu zu erzeugen. | Assets/UI |
| D-ACT-C3-05 | 2026-08-23 | Das owner-bestätigte Profilmotiv wird nicht neu generiert. | C3 validiert Format und Darstellung, verändert aber nicht die freigegebene Gestaltung. | Assets/S5 |
| D-ACT-C3-06 | 2026-08-23 | Training erhält einen eigenen sichtbaren Datumsinput. | Kein neuer eigener Hub-Bereich darf heimlich vom Vitals-Datum abhängen. | Activity V1 |
| D-ACT-C3-07 | 2026-08-23 | Die Migration ist atomar: neuer Pfad beweisen, alten Tab im selben Block entfernen, nie zwei sichtbare Save-Pfade ausliefern. | Verhindert Doppelbedienung und unklare Source of Truth. | S4.2 |
| D-ACT-C3-08 | 2026-08-23 | Der Protein-Dialog ist read-only und verwendet bestehende Profil-/Body-Daten. | Medizinische Berechnung bleibt im Backendvertrag. | Protein/Hub |
| D-ACT-C3-09 | 2026-08-23 | Ein nicht gespeicherter Modifier wird im Dialog nicht clientseitig rekonstruiert. | Keine zweite Schwellenlogik und kein künftiger Drift. | Protein |
| D-ACT-C3-10 | 2026-08-23 | Hover ist nur optional; Klick, Tap und Tastatur sind Pflicht. | Mobile und zugängliche Bedienung müssen gleichwertig sein. | Dashboard |
| D-ACT-C3-11 | 2026-08-23 | Activity bleibt fachlich eigenes Modul; Capture bleibt der Architektur-Owner für Writes, Vitals nur BP/Body/Lab. | Modulgrenzen werden präzisiert, nicht neu erfunden. | Doku/Ownership |
| D-ACT-C3-12 | 2026-08-23 | R13-Postimage wird in G0 geprüft, nicht aus dem Planungsstand angenommen. | R13 berührt dieselben Productload- und Consumerflächen. | Gate/Invalidation |
| D-ACT-C3-13 | 2026-08-23 | Lokale Browserautomation ersetzt routinemäßige Zwischenfreigaben. | Sichtbare Qualität wird geprüft, ohne den agentischen Ablauf unnötig zu unterbrechen. | S5 |
| D-ACT-C3-14 | 2026-08-27 | Nach der Usage-Pause werden S5 und S6 durch einen eigenen frischen Resume-Gate getrennt. | Der Owner erlaubt S5 nur bei ausreichender Reserve und verlangt danach eine neue Usage-Entscheidung vor S6; Scope und Reviewtiefe bleiben unverändert. | UR1/UR2/S5/S6 |
| D-ACT-C3-15 | 2026-08-27 | Ein einmaliger kurzer UI-Follow-up-Block darf unter UF1-Caution Profilposition und Protein-Ziel-Sichtbarkeit korrigieren. | Ownerfeedback betrifft zwei lokale, reversible Darstellungsfehler; Asset, medizinische Semantik, Writergrenze und S5-Reviewumfang bleiben unverändert. | UF1/UF2/S4-Follow-up |
| D-ACT-C3-16 | 2026-08-27 | Die goldene Hervorhebung des Proteinwerts bleibt für den Wiedereinstieg bestehen. | Der Owner akzeptiert den aktuellen Stand; Weiß bleibt eine spätere optionale Geschmacksanpassung und blockiert S5 nicht. | Resume/S5 |

<!-- markdownlint-enable MD013 -->

## Owner-Briefing-Bedarf

- Erklärmodus:
  - `Briefing + S6-Recap`
- Neue oder entscheidungsrelevante Konzepte:
  - `Atomare Verlagerung eines bestehenden Writers in eine neue
    Produktfläche; keine Datenmigration.`
  - `Protein-Dialog als Projektion statt zweite Berechnung.`
- Geplante Briefing-Gates:
  - `nur bei Stop-Bedingung; im erwarteten Scope none.`
- Nicht erneut zu erklären:
  - `normale HTML-/CSS-/JavaScript-Verdrahtung, Assetkopie und lokaler
    Browsersmoke.`

## Scope und Grenzen

In Scope:

- Hub-Karussell, Quickbar, Panelrouting und neue Training-Produktfläche.
- Bytegleiche Activity-Assetkopie und Verdrahtung des bestätigten Profile-
  Assets.
- Verlagerung der bestehenden Activity-V1-Form samt Save-, Reset-, Feedback-
  und Datumsvertrag.
- Entfernung des alten Training-Tabs und der Protein-Metriken aus Vitals.
- Read-only Protein-Erklärmodell und zugänglicher Dashboard-Dialog.
- Responsive-, Fokus-, Escape-, Cache- und Browserverträge.
- Fokussierte Contracttests, S5-Gesamtprüfung, Module Overviews, QA,
  Masterplan, README und Changelog.

Nicht in Scope:

- Activity-V2-Session-Shell, Writer, History, Coaching-Download oder Import.
- Änderung, Migration oder Löschung von Activity-V1-Daten.
- Doctor View, Arztbericht oder Health Export fachlich umbauen.
- Proteinformel, Grenzwerte, Doctor-Lock oder Edge-Persistenz ändern.
- SQL, Supabase, RLS, ACL, Edge Functions, GitHub Workflows, Deploy oder APK.
- Neues Iconmotiv erzeugen oder das bestätigte Profilmotiv gestalterisch
  überarbeiten.
- Genereller Hub-, Vitals- oder Dashboard-Redesign.

Roadmap-spezifische Guardrails:

- Zu jeder Zeit existiert im finalen DOM genau ein Activity-V1-Formular und
  genau ein sichtbarer Activity-V1-Save-Pfad.
- Der neue Trainingstag wird explizit an `addActivity` übergeben; kein
  Fallback auf `#date` im Vitals-Panel.
- Öffnen des Protein-Dialogs verursacht keinen Write und keinen Recompute-
  Request.
- Fehlende Profil- oder Gewichtsdaten sind ein neutraler UI-Zustand, kein
  Anlass für erfundene Werte.
- R13-Produktloads werden nur dann geändert, wenn C3-Routing oder C3-Consumer
  dies direkt erfordert; die Readersemantik bleibt unverändert.

## Scope-Freeze vor S4

- Bestehende Features:
  - `Activity V1 wird verlagert, nicht erweitert; Vitals-Training und alter
    Proteinblock werden nach bewiesener Zieloberfläche entfernt.`
- Datenmodell, Lifecycle und Retention:
  - `vollständig unverändert.`
- Cleanup, Scheduler, Secrets und externe Automationen:
  - `nicht betroffen.`
- Kompatible Producer und Consumer:
  - `AppModules.activity.addActivity/loadActivities/deleteActivity,
    activity_add/list/delete, Activity-V1-Events, R13-Reader, Profile-Snapshot,
    Protein-Target-Producer und Hub-Dashboard.`
- Offene Grundsatzfragen:
  - `none; nur R13-Postimage ist als G0-Fakt zu prüfen.`
- Umgang mit späterem Scope-Wechsel:
  - `gezielte S2/S3/S4R-Korrektur nur bei unverändertem C3-Ziel; sonst
    Owner-Gate oder Follow-up statt stiller Erweiterung.`

## Referenzen

Pflicht in G0/S1:

- `AGENTS.md`
- `README.md`
- `docs/DEV_ENVIRONMENT.md`
- `docs/templates/MIDAS Roadmap Workflow Contract.md`
- `docs/Future trainingsmodule update thoughts.md`, C3/O-10/R13/R14
- `docs/modules/Activity Module Overview.md`
- `docs/modules/Capture Module Overview.md`
- `docs/modules/Hub Module Overview.md`
- `docs/modules/Profile Module Overview.md`
- `docs/modules/Protein Module Overview.md`
- finale R13-DONE-Roadmap und -Evidence
- reale direkte Produktquellen und betroffene Tests

Nur bei konkreter Vertragsfrage:

- archivierte R11-/R12-Roadmaps und Evidence für eine tatsächlich durch C3
  invalidierte Readeraussage.
- `docs/qa/health-capture-reports.md` für bestehende Activity-/Protein-
  Verbraucher und den neuen C3-Abschlussnachweis.
- `docs/archive/Training module spec.md` nur bei historischem
  Activity-V1-Widerspruch.

## Tool Permissions und Gates

Allowed:

- lokale Reads und Edits im C3-Scope.
- `git status`, `git diff`, `rg`, Syntax-/Contracttests und `git diff --check`.
- lokale Assetkopie und read-only Bildmetadatenprüfung.
- lokaler statischer Server und Browserautomation an 1440x900, 390x844 und
  320x800.
- `coderabbit` ausschließlich in S5 mit dem festgelegten Budget.
- Doku-Sync und Roadmaparchivierung nach grünem S6.

User-gated:

- produktive oder externe Wirkung jeglicher Art.
- neue Bildgenerierung oder sichtbare Abweichung vom bestätigten Profilmotiv.
- Akzeptanz eines fehlenden Browser- oder CodeRabbit-Nachweises, wenn der
  dokumentierte Fallback ebenfalls nicht verfügbar ist.

Forbidden:

- Secrets ausgeben oder committen.
- fremde Worktree-Änderungen zurücksetzen.
- Scope, Datenwirkung oder Architektur still erweitern.
- SQL, Remote-Supabase, Edge-/Webdeploy, Workflowlauf, Deviceaktion, Commit
  oder Push.
- Activity V2 als Produkt-Capture laden oder Activity V1 vor R14 deaktivieren.
- Proteinwerte oder Modifier aus neuen Clientschwellen berechnen.
- CodeRabbit außerhalb S5 installieren, ersetzen oder mehrfach aus Gewohnheit
  ausführen.

## Statusmatrix

<!-- markdownlint-disable MD013 -->

| ID | Schritt | Reasoning | Status | Kompaktes Ergebnis |
| --- | --- | --- | --- | --- |
| G0 | R13-Postimage-Gate | `High` | PASS | R13 DONE/archiviert; HEAD 557a219c, Web 4aa97f92, SW v7; V1 alleiniger Writer, R14 alleiniger Cutover. |
| S1 | System- und Vertragsdetektivarbeit | `High` | PASS | Ein Writer/Form/Listener, Vitals-Tab und alte Proteinprojektion exakt kartiert; Assets, Cache v7, R13-Loads, Tooling und Testlücken belegt. |
| S2 | Fachlicher/technischer Zielvertrag | `High` | PASS | Exakte IDs, V1-Datumsquelle, Dialogzustände, Whitelist-Projektion, Fokus-/Gesten- und Ownershipgrenzen eingefroren. |
| S3 | Bruchrisiko-, Security- und Umsetzungsreview | `High` | PASS | Writer-/Datum-/Dialog-/XSS-/Lifecycle-/Cache-/R14-Risiken und blockweise Orakel geschlossen; rein lokaler Rollback. |
| S4R | S4 Readiness Review | `High` | PASS | Reales Postimage ergibt lokalen reversiblen medium Scope; High reicht aus, A/B sind sicher resumierbar, kein Owner-Gate oder blockierendes Finding. |
| S4 | Umsetzung | `High` | PASS | S4.1-S4.4 plus ownergerichtetes UI-Follow-up PASS; Training/Writer, read-only Dialog, Accessibility, Profilposition, sichtbares Protein-Ziel und v9-Cache lokal belegt. |
| S5 | Tests, Runtime-Gates und Abschlussreview | `High` | PASS | T01-T12 PASS; manueller CodeRabbit-Initialreview bewertet, Fokusfix/v13 verifiziert, Gewicht-Hinweis verworfen, kein Verifikationslauf erforderlich. |
| S6 | Doku-Sync und Archiv | `High` | PASS | Sources of Truth, HCR-032 und Changelog synchron; Full Review und U8 grün; Roadmap als `(DONE)` archiviert. |

<!-- markdownlint-enable MD013 -->

## Findings

<!-- markdownlint-disable MD013 -->

| ID | Severity | Typ | Status | Entscheidung / Zielschritt |
| --- | --- | --- | --- | --- |
| F-ACT-C3-01 | P1 | Contract | fixed | Eigener sichtbarer Trainingstag ersetzt die versteckte Abhängigkeit vom Vitals-Datum. |
| F-ACT-C3-02 | P1 | Runtime | fixed | Atomare Verlagerung und DOM-Orakel verhindern zwei sichtbare V1-Save-Pfade. |
| F-ACT-C3-03 | P1 | Medical/Code | fixed | Nicht gespeicherter Activity-Modifier wird nicht clientseitig rekonstruiert. |
| F-ACT-C3-04 | P1 | Integration | fixed | Carousel, Quickbar, Panelmapping, Fokus, Escape und Cache werden als gemeinsamer Vertrag geprüft. |
| F-ACT-C3-05 | P2 | Asset | fixed | Zwei dedizierte Pfade; Activity-Asset bytegleich, Profilmotiv technisch validieren statt neu generieren. |
| F-ACT-C3-06 | P1 | Scope | fixed | Activity bleibt eigenes Modul, Capture bleibt Writer-Grenze, Vitals wird auf BP/Body/Lab präzisiert. |
| F-ACT-C3-07 | P1 | QA | fixed | Automatisierter Live-Server-Browsersmoke ist Pflicht und nicht bloß optionale Owner-Sichtprüfung. |
| F-ACT-C3-08 | P1 | Lifecycle | fixed | V1-Formwerte bleiben bei Panelwechsel erhalten; Reset und Save ändern den Trainingstag nicht. |
| F-ACT-C3-09 | P1 | Dependency | fixed | G0 bestätigt archivierte DONE-Quellen, finales R13-Postimage und unveränderte V1-/R14-Grenze. |
| F-ACT-C3-10 | P1 | Source of Truth | fixed | Masterplan zeigt R13 als DONE, verlinkt Roadmap und Evidence im Archiv und führt C3 als nächstes Core-Gate. |
| F-ACT-C3-11 | P1 | Operations | fixed | C3 ist als später deploy-relevanter Web-/PWA-Umbau markiert; Deploy, Commit und Push bleiben dennoch owner-gated außerhalb der Roadmap. |
| F-ACT-C3-12 | P1 | Consumer | fixed | Bestehende `protein_calc_version` und `protein_window_days` read-only im Profilselect und expliziten Dialog-Keyset; kein Save-/Schema-Delta. |
| F-ACT-C3-13 | P1 | Cache/QA | fixed | Root-SW v8; aktuelle Produkt-/Isolation-/Smokes gezielt auf v8 und v7→v8 aktualisiert, historische Frozen-Orakel unberührt. |
| F-ACT-C3-14 | P1 | Runtime | fixed | Expliziter lokaler In-Flight-Guard blockiert Enter/programmatic Doppelsubmit; RPC und Persistenz bleiben unverändert. |
| F-ACT-C3-15 | P2 | Visual | fixed | Profile-Asset per CSS von 576 auf maximal 520 px verkleinert und um maximal 14 px optisch abgesenkt; freigegebene PNG-Bytes unverändert. |
| F-ACT-C3-16 | P1 | Accessibility/Cache | fixed | Protein-Ziel erhält expliziten Hell-/Goldkontrast, Tooltip und unveränderten Klick-/Tap-/Tastaturdialog; versionierter Hub-CSS-Import und Shell v9 verhindern stale Styles. |
| F-ACT-C3-17 | P2 | Responsive | fixed | Dekorativer Hub-Hintergrund erzeugte bei 390 px vier Pixel horizontalen Overflow; App-Viewport clippt nun ausschließlich horizontal, finale 390-/320-Orakel sind grün. |
| F-ACT-C3-18 | P1 | Accessibility | fixed | Training-/Vitals-/Dashboard-Aktionsziele lagen mobil bei 36–40 px; die betroffenen Ziele sind jetzt in allen drei Viewports mindestens 44 px. |
| F-ACT-C3-19 | P1 | External Review Evidence | fixed | Owner lieferte den manuellen initialen CodeRabbit-Review; beide Hinweise wurden gegen den finalen Kontrollfluss bewertet. |
| F-ACT-C3-20 | P1 | Accessibility | fixed | Fokus konnte den aria-modalen Dialog verlassen; Tab-Rückholung und focusin-Guard halten Außenfokus, Tab und Shift+Tab nun im Dialog. |
| F-ACT-C3-21 | P1 | Read-only Semantics | rejected | Cache-vor-Edge ist korrekt: Beide Aufrufer warten auf addEntry und erfolgreichen syncWebhook, bevor recomputeTargets läuft; der Wert ist beim Proteinfehler bereits gespeichert. |
| F-ACT-C3-22 | P2 | Documentation Links | fixed | Vier veraltete aktive R1-/C2-Links zeigen wieder auf ihre realen `(DONE)`-Archivquellen; das C3-Archivziel wurde unmittelbar nach U8 materialisiert. |

<!-- markdownlint-enable MD013 -->

## Initialer Roadmap Contract Review

Reviewdatum: `2026-08-23`.

Geprüft wurden:

- MIDAS-Single-User- und Modulgrenzen aus `AGENTS.md` und `README.md`.
- C3/O-10 sowie die R13-/R14-Verantwortung im Masterplan.
- realer Pre-R13-Hub, Carousel, Quickbar, Panelrouting und PWA-Cache.
- realer Activity-V1-Save einschließlich `day: getCaptureDayIso()`.
- reale Vitals-Tablogik und einziger Activity-V1-Formpfad.
- reale Profile-/Protein-Felder und der alte clientseitige Modifierhelper.
- Roadmap-Workflow, Autonomie, Reviewbudget und UI-Smoke-Vertrag.

Korrigierte Findings:

- Ein eigener Trainingstag wurde als zwingender Produktvertrag ergänzt.
- Quickbar, Service Worker, Fokus und genau-ein-Save-Pfad wurden vom
  vermeintlichen Detail zum Pflichtscope erhoben.
- Der Protein-Dialog darf nur gespeicherte oder bereits read-only geladene
  Werte projizieren; der alte clientseitige Modifierhelper wird nicht
  übernommen.
- R13 wurde als echtes vorgeschaltetes Postimage-Gate eingefroren.
- Der sichtbare UI-Nachweis wurde automatisierbar gemacht; eine manuelle
  Zwischenabnahme ist im grünen Standardpfad nicht nötig.
- Der Masterplan wurde nach R13-DONE auf das produktiv bewiesene Reader-
  Postimage, die archivierten Abschlussquellen und C3 als nächstes Core-Gate
  synchronisiert.
- Die spätere Veröffentlichungswirkung des sichtbaren PWA-Umbaus wurde von
  der bewusst nicht freigegebenen Deployaktion getrennt.

Ergebnis:

- `PASS - roadmap ready; G0-Postimage-Verifikation bleibt vor S1 verpflichtend.`

---

## G0 - R13-Postimage-Gate

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch und read-only:

1. Prüfen, dass R13-Roadmap und R13-Evidence als `(DONE)` archiviert sind.
2. R13-Abschluss-SHA, finalen Productload, Cacheversion sowie die tatsächlich
   geänderten C3-Consumer erfassen.
3. Nur den relevanten R13-Diff gegen C3-Zielvertrag und Invalidation Map
   prüfen; S1-S4R von R13 nicht wiederholen.
4. Sicherstellen, dass Activity V1 weiterhin alleiniger Writer ist und R14
   weiterhin alleiniger V2-Capture-Cutover bleibt.
5. Planungsbaseline durch Ausführungsbaseline ersetzen; Dirty Boundary
   aktualisieren und fremde Änderungen bewahren.
6. F-ACT-C3-09 schließen oder mit präzisem Widerspruch stoppen.

Exit:

- R13-Postimage ist stabil und C3 kann ohne Neuplanung mit S1 beginnen.

Ergebnis G0 (`2026-08-27`):

- `PASS`: R13-Roadmap und -Evidence sind als `(DONE)` archiviert und melden
  S5.7/S5.8/S6 vollständig grün.
- Abschlussbaseline ist `557a219ca65f2b34874600b18a301f037cbef182`;
  der relevante Web-/PWA-Commit ist `4aa97f92`, der Service Worker steht auf
  `v7`.
- Der C3-relevante R13-Codediff betrifft `index.html`, `service-worker.js` und
  doctor-scoped Regeln in `app/app.css`; Hub, Main, Vitals, Protein und Profile
  blieben unverändert.
- `index.html` lädt weiterhin Activity V1; der einzige Write läuft über
  `AppModules.activity.addActivity` zu `activity_add`. Die neuen V2-Loads sind
  ausschließlich die R13-Read-Consumer.
- EV-ACT-R13-L03/L07/C45/R06/R07 bleiben bis zu ihrer dokumentierten
  Invalidation gültig; R14 bleibt im Masterplan alleiniger V2-Capture-Cutover.
- F-ACT-C3-09 ist geschlossen; keine Neuplanung, Reasoning-Ausweitung oder
  Owner-Entscheidung erforderlich.

## S1 - System- und Vertragsdetektivarbeit

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. Pflichtreferenzen in der Startkartenreihenfolge gezielt lesen.
2. Hubmodule, HTML-Panels, Carousel-/Quickbar-IDs, Panelmapping,
   Open-/Close-/Escape-Lifecycle und Cachekette kartieren.
3. Activity-V1-Form, `getCaptureDayIso`, `AppModules.activity`, RPCs,
   Savefeedback, Reset, Events und direkte Consumer kartieren.
4. Vitals-Tabs, gemeinsames Datum und alle Stellen erfassen, die
   `data-vitals-tab="activity"`, `data-vitals-panel="activity"` oder die
   Activity-Form-IDs voraussetzen.
5. Dashboard-Protein-Producer, Profile-Snapshot, bestehende Protein-
   Berechnungsfelder, alte Weight-Abfrage und R13-Postimage kartieren.
6. Profile-/Activity-Assets, Bildformat, Dateigröße, Transparenz,
   Browserdarstellung und Service-Worker-Verhalten erfassen. Keine
   Neugenerierung.
7. Relevante bestehende Tests und noch fehlende fokussierte C3-Orakel
   bestimmen. Weiterhin gültige R13-Nachweise per ID übernehmen.
8. Context Receipt, Invalidation Map und Findings aktualisieren.
9. Full Contract Review, minimale Findings-Korrektur und internen
   Continuation Gate durchführen.

Ergebnis:

- Systemkarte:
  - `exakte Producer-/Consumer-/DOM-/Cachekarte des R13-Postimages.`
- Betroffene Schichten:
  - `Hub, Vitals/Capture, Activity V1, Protein/Profile-Projektion, CSS,
    Assets, Service Worker und Doku.`
- Belegte Verträge:
  - `ein Writer, ein Formular, expliziter Tag, read-only Dialog und keine
    Activity-V2-Capturewirkung.`
- Offene Fragen:
  - `none oder Finding mit Stop-Entscheid.`
- Doku-Sync:
  - `S6; jetzt nur bei blockierender Source-of-Truth-Korrektur.`

Exit: Alle C3-Producer, Consumer und R13-Überlappungen sind eindeutig.

Ergebnis S1 (`2026-08-27`):

- Systemkarte: `CAROUSEL_MODULES` und DOM bilden sieben normale Module plus den
  Voice-Surface-Sonderfall; Quickbar delegiert per `data-hub-module` an das
  jeweilige Carousel; Panels bleiben im DOM und teilen Close/Escape/Inert.
- Activity V1 besitzt genau ein `#activityForm`, einen Submitlistener und einen
  Aufruf von `AppModules.activity.addActivity`; der RPC-Vertrag bleibt
  `activity_add/list/delete`, das aktuelle Datum kommt noch aus `#date`.
- Vitals besitzt genau einen Activity-Tab/-Panelzweig. Der neue Trainingstag
  kann deshalb ohne ID-Duplikat als lokale `todayStr()`-Initialisierung
  eingeführt und explizit an V1 übergeben werden.
- Proteinwerte kommen aus `AppModules.profile.getData()`. Der alte
  `activityModifierFor` berechnet clientseitig neu; Latest Weight nutzt eine
  deduplizierte read-only `v_events_body`-Abfrage. Beides ist exakt für S4.3
  abgrenzbar; F-ACT-C3-12 ergänzt zwei bereits vorhandene Profilfelder.
- Assets sind transparente ARGB-PNGs: `Personal_data_v2.png` 1024²/
  SHA256 `82B70D15...40923`, `Personal_data_v3.png` 1254²/
  `4FFE900B...5B56AE`; beide renderbar, keine Transformation nötig.
- Full Contract/Scope/Security Review: PASS. Kein Backend-/SQL-/Writerbedarf,
  keine offene Produktfrage und kein blockierendes P0/P1; Doku-Sync bleibt S6.

## S2 - Fachlicher und technischer Zielvertrag

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. Produktfläche einfrieren:
   - Carousel-ID, Panel-ID und Quickbar-ID `training`.
   - Reihenfolge unmittelbar nach `vitals`.
   - eigenes Panel mit gemeinsamer Hub-Close-/Escape-Mechanik.
2. Assetvertrag einfrieren:
   - `assets/img/Activity_v2.png` als bytegleiche Kopie von
     `Personal_data_v2.png`.
   - Profile verweist auf `Personal_data_v3.png`.
   - keine stillen Bildtransformationen; technische Normalisierung nur bei
     belegtem Browser-/Performanceproblem und ohne Motivänderung.
3. Activity-V1-Datumsvertrag einfrieren:
   - eigener sichtbarer ISO-Tag im Training-Panel.
   - Initialwert Wiener heutiger Tag über bestehende lokale Datumshelpers.
   - kein Fallback auf Vitals-`#date`.
   - Save/Reset/Close-/Reopen-Verhalten gemäß Zielvertrag.
   - keine neue Future-/Past-Regel; bestehende `activity_add`-Akzeptanz bleibt.
4. Migrationsvertrag einfrieren:
   - Form und IDs werden verlagert, nicht dupliziert.
   - Zielrouting und Save werden im selben kohärenten Block aktiviert.
   - alter Vitals-Tab, Panelmarkup und ausschließlich dafür benötigte CSS-/JS-
     Zweige werden erst nach lokalem Zielorakel entfernt.
5. Protein-Erklärvertrag einfrieren:
   - Hub besitzt Trigger/Dialog-Lifecycle.
   - Proteinmodul besitzt read-only Projektion und gegebenenfalls die bereits
     bestehende Latest-Weight-Lesehilfe.
   - striktes erlaubtes Keyset aus realem R13-Profilpostimage.
   - keine Formel, Schwelle, Recompute-Funktion oder Writeaktion.
   - fehlende Werte, Doctor-Lock und veralteter/fehlender Berechnungszeitpunkt
     erhalten klare neutrale Copy.
6. Accessibility-/Responsivevertrag einfrieren:
   - Button statt nur hoverfähigem Container.
   - Dialogtitel, `aria-haspopup`, `aria-expanded`/Dialogbezug, Fokus hinein
     und zurück, Escape und explizites Close.
   - keine Überlappung mit Dashboardgesten oder anderen Hub-Panels.
7. Modulownership und S6-Zieldokus einfrieren.
8. Full Contract Review, minimale Findings-Korrektur und internen
   Continuation Gate durchführen.

Ergebnis:

- Finaler Zielvertrag:
  - `ein eigenständiges Training-Modul mit V1-Writer und ein read-only
    Protein-Dialog ohne medizinische Neuberechnung.`
- Gewählte Lösung:
  - `atomare UI-Verlagerung auf bestehender Architektur, keine neue Plattform
    oder Datenabstraktion.`
- Abgrenzung:
  - `R13-Reader unverändert; R14-Writer-Cutover unberührt.`
- S4-Pflichtpunkte:
  - `D-ACT-C3-03 bis D-ACT-C3-12.`
- Doku-Sync:
  - `S6.`

Exit: Kein Produkt-, Datums-, Dialog-, Asset- oder Ownershipentscheid bleibt
offen.

Ergebnis S2 (`2026-08-27`):

- Produkt-IDs sind exakt `training`, `hubTrainingPanel`, `hubTrainingTitle`
  und `trainingDate`; Carousel und Quickbar stehen direkt nach `vitals`.
- `trainingDate` ist required, wird einmal pro Dokumentlauf mit `todayStr()`
  initialisiert und ist die einzige Savequelle. Leer/ungültig blockiert lokal;
  es gibt keinen Fallback auf `#date`, Vitals-State oder RPC-Default.
- Form-IDs und der bestehende Submitlistener werden verlagert, nicht kopiert.
  Save und Reset leeren nur Aktivität, Dauer, Notiz und Status; Datum sowie
  ungespeicherte Werte über Close/Reopen bleiben DOM-lokal erhalten.
- Dashboardtrigger/Dialog heißen `hubProteinTargetButton` und
  `hubProteinContextDialog`. Zustände sind `loading`, `empty`, `error` und
  `data`; Close/Escape schließen zuerst den Dialog, Fokus kehrt zum Trigger
  zurück, Tab bleibt im Dialog und Pointergesten propagieren nicht zum Reveal.
- Erlaubte Projektion: Targets, Calc-Version/-Zeit, 28-Tage-Fenster,
  Altersbasis, gespeicherte Activity-Stufe/aktive Tage, Vor-CKD-/CKD-/aktueller
  Faktor, CKD-Stufe, Doctor-Lock und letztes gespeichertes Gewicht. Fehlendes
  bleibt `Nicht verfügbar`; Werte gelangen ausschließlich per `textContent`
  ins DOM.
- Profile erweitert nur den read-only Select und einen kompakten
  `loading/ready/empty/error`-Syncstatus. Protein besitzt Projektion und die
  deduplizierte Weight-Lesehilfe; Hub besitzt Dialog/Lifecycle. Kein
  `recomputeTargets`, Write, Modifierhelper oder neue Schwelle ist zulässig.

## S3 - Bruchrisiko-, Security- und Umsetzungsreview

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. Doppelte IDs, zwei Save-Listener, zwei sichtbare Formulare und verwaiste
   Vitals-Tabselektoren red-teamen.
2. Falschen Trainingstag, leeren Tag, Vitals-Datumsänderung, Savefehler,
   Doppelklick, Reset, Panelwechsel und Reload-Grenze prüfen.
3. R13-Reader, Activity-V1-Events, Doctor-/Report-Consumer und V2-Isolation
   gegen unbeabsichtigte Invalidation prüfen.
4. Dashboarddialog gegen stale Profile-Snapshots, fehlende Auth/Profile-
   Daten, fehlendes Gewicht, Doctor-Lock, XSS, doppeltes Öffnen, Fokusverlust,
   Escape-Races und Gestenkonflikte prüfen.
5. Sicherstellen, dass der Dialog keine Rohfehler, Secrets, User-ID oder
   interne Payloads zeigt und keine Neuberechnung auslöst.
6. Assetpfade, Dateinamen, Groß-/Kleinschreibung, Transparenz, Ladefehler,
   Layoutshift und Cache-Stale-State prüfen.
7. Carousel-/Quickbarreihenfolge, Panelbuttonzustand, Close, Back/Escape,
   Bootready, Login/Logout und mobilen Overflow prüfen.
8. Rollback einfrieren:
   - lokale C3-Dateideltas zurücknehmen stellt die R13-Produktfläche mit V1
     unter Vitals wieder her.
   - keine Daten- oder Backend-Rückabwicklung nötig.
9. Fokussierte Testorakel und Invalidation je S4-Block festlegen; teure
   Browserläufe für S5 bündeln.
10. Full Security/Contract/Scope Review, Findings-Korrektur und internen
    Continuation Gate durchführen.

Ergebnis:

- Blockierende Risiken:
  - `none oder präzise Finding-ID.`
- Rollback-/Stop-Vertrag:
  - `rein lokaler UI-/Asset-/Cache-Rollback; keine Datenwirkung.`
- S4-Schnitt:
  - `S4.1 Routing/Assets, S4.2 atomare V1-Verlagerung, S4.3 Protein-Dialog,
    S4.4 Integration/Politur/Cache.`
- S5-Pflichtchecks:
  - `T-ACT-C3-01 bis T-ACT-C3-12.`
- Doku-Sync:
  - `S6.`

Exit: Runtime-, Daten-, Accessibility-, Cache- und Rollbackrisiken sind
geschlossen oder exakt zugeordnet.

Ergebnis S3 (`2026-08-27`):

- Writer-/Datum: genau ein Formular/Listener bleibt Pflicht; `trainingDate`
  wird vor dem Aufruf streng als realer ISO-Kalendertag validiert. Ein lokaler
  In-Flight-Guard schließt Doppelklick, Enter und programmatic submit gemeinsam.
- Lifecycle: Panelclose entfernt keine Formularwerte. Reset/Success verändern
  den Trainingstag nicht; Vitals-Datumswechsel, BP-/Body-/Lab-Reset und Reload
  besitzen keine neue Kopplung. Reload-Recovery bleibt bewusst außerhalb C3.
- Dialog/Security: Während `loading` ist erneutes Öffnen idempotent; ein
  Sequenz-Token verwirft stale Resultate. XSS wird durch feste Labels plus
  `textContent`, strikt gelistete numerische/Stringwerte und generische
  Fehlermeldung verhindert; User-ID, Rohpayload, Secret und Rohfehler bleiben
  ausgeschlossen.
- Fokus/Gesten: Dialog-Escape hat Vorrang vor Dashboard/Panel-Escape, Tab wird
  zwischen seinen fokussierbaren Elementen gehalten, Close liefert Fokus nur
  an einen noch verbundenen Trigger zurück; Pointerereignisse erreichen den
  Dashboard-Reveal nicht.
- Cache/R13/R14: Root-SW steigt monoton v7→v8. Aktuelle R13-Produktconsumer
  werden auf v8/v7→v8 nachgeführt; read-only Productorder und Doctor-CSS bleiben
  geschützt. V2-Session/Commit/History/Recovery/Coaching bleiben null Loads.
- Rollback bleibt die reine Rücknahme lokaler C3-Deltas plus Entfernen der
  Assetkopie; keine Daten-, SQL-, Edge-, Workflow-, Device- oder Remoteaktion.
  Full Security/Contract/Scope Review PASS, kein offenes blockierendes P0/P1.

## S4 Readiness Review

Reasoning: `GPT-5.6 Sol / High`.

<!-- markdownlint-disable MD013 -->

| Substep | Änderung | Findings | Erwartete Dateien | Review | Checks | Gate |
| --- | --- | --- | --- | --- | --- | --- |
| S4.1 | Hubrouting, Panelgerüst und dedizierte Assets | F-ACT-C3-04/05/06 | `index.html`, Hub, Assets, fokussierter Contracttest | nativer Consumer | T-ACT-C3-01/02 | none |
| S4.2 | Activity-V1-Form atomar verlagern, eigener Tag, Vitals bereinigen | F-ACT-C3-01/02/08 | `index.html`, `assets/js/main.js`, Vitals JS/CSS, Contracttest | nativer Consumer | T-ACT-C3-03/04/05 | none |
| S4.3 | Protein-Projektion und zugänglicher Dashboarddialog | F-ACT-C3-03/07/12 | Protein-/Profilmodul, Hub, HTML/CSS, Contracttest | nativer Consumer | T-ACT-C3-06/07/08 | none |
| S4.4 | Responsive-, Lifecycle-, Service-Worker- und Integrationspolitur | F-ACT-C3-04/07 | Hub CSS/JS, `service-worker.js`, finale fokussierte Tests | nativer Consumer | T-ACT-C3-09/10 | none |

<!-- markdownlint-enable MD013 -->

- Reihenfolge/Abhängigkeiten:
  - `S4.1 schafft Zielroute und Assets. S4.2 führt den Writer atomar um. S4.3
    ist fachlich unabhängig, folgt aber auf stabile DOM-Struktur. S4.4
    schließt Integration und Cache.`
- Fehlende Zuordnung:
  - `none bei unverändertem R13-Postimage.`
- Evidence:
  - `separate Datei nicht erforderlich; kompakte Ergebnisse in Roadmap und QA.`
- Scope-Freeze:
  - `PASS: medium. Keine neue Datenbank-, RPC-, medizinische, V2-Capture- oder
    Remote-Wirkung. High ist fachlich ausreichend; keine höhere Reasoning-Stufe
    und keine Owner-Entscheidung erforderlich.`
  - `Block A ist atomar auf Routing, dedizierte Assets und die Verlagerung des
    einzigen Activity-V1-Form-/Listener-/RPC-Pfads begrenzt. Er endet erst mit
    genau einem erreichbaren Writer und grünem lokalem Consumerorakel.`
  - `Block B ist atomar auf gespeicherte read-only Protein-/Profildaten,
    Dashboarddialog, Accessibility/Responsive, SW v8 und aktuelle direkt
    invalidierte Consumerorakel begrenzt. Er erzeugt keinen neuen Write.`
- Gültig übernommene Nachweise:
  - `nur nicht invalidierte finale R13-IDs; keine routinemäßige Wiederholung
    von R11/R12-Gesamtmatrizen.`
- Invalidation Map:
  - `index.html/Hubrouting -> T01/T02/T09/T10/T11.`
  - `Activity-Form/main/vitals -> T03/T04/T05/T09/T11.`
  - `Protein/Profile/Hubdialog -> T06/T07/T08/T09/T11.`
  - `CSS/Assets/Service Worker -> T02/T09/T10/T11.`
- Owner-Gates:
  - `none im erwarteten lokalen Scope.`
- Empfohlene S4-Ausführungsblöcke:
  - `Block A: S4.1-S4.2 gemeinsam, weil Routing und Writerverlagerung keine
    Zwischenversion mit zwei Save-Pfaden hinterlassen dürfen.`
  - `Block A ist trotz medium Gesamtscope ein kurzer, lokaler, reversibler und
    nach seinen gemeinsamen Postconditions sicher resumierbarer Delta-Block;
    U5-Caution darf genau diesen einen Block autorisieren.`
  - `Block B: S4.3-S4.4 gemeinsam, weil Dialog, Accessibility, Responsive und
    Cache über dieselbe finale DOM-Struktur geprüft werden.`
- Kohärenz-/Atomaritätsgrenzen:
  - `Block A endet erst, wenn Zielroute und genau ein sichtbarer
    Activity-V1-Save-Pfad gemeinsam funktionieren; keine Zwischenpause mit
    doppeltem oder unerreichbarem Writer.`
  - `Block B endet erst, wenn Protein-Dialog, Accessibility, Responsive-
    Verhalten, Lifecycle und Cachevertrag gemeinsam ihre Postconditions
    erfüllen.`
- Usage-Gates zwischen Ausführungsblöcken:
  - `U5 vor Block A; U6 nach Block A/vor Block B; U7 nach Block B/vor dem
    gemeinsamen S5-/S6-Abschlussblock.`
- Review je Ausführungsblock:
  - `gemeinsamer nativer Consumer-Review; Ergebnisse bleiben S4.1-S4.4
    einzeln zugeordnet.`
- Reviewbudget:
  - `S4 nur Delta/Consumer und invalidierte günstige Checks; keine
    Browser-Gesamtmatrix und kein CodeRabbit. S5 übernimmt den finalen Diff.`
- Aufwandsprognose:
  - `Größenklasse: erwartbar medium.`
  - `Runtimeflächen: statisches Web/PWA-Frontend; kein Backend/SQL.`
  - `Browser: ein gebündelter S5-Pass mit drei Viewports.`
  - `Device/produktive Gates: none; finaler Android-PWA-Cutover bleibt R14.`
  - `Externer Review: genau ein Initial- und höchstens ein Verifikationslauf in
    S5.`
  - `Autonome Welle: S4-S6 High nach grünem S4R.`
  - `Usage-Reserve: vor Block A nur reale vergleichbare Checkpoints verwenden;
    fehlen sie, keine Schätzung, sondern statische Schwellen plus
    medium-/Resumierbarkeitsurteil. Vor Block B dieselbe Prüfung erneut.`
- Readiness-Findings/Korrekturen:
  - `F-ACT-C3-12/-13/-14 sind vollständig ihren S4-Substeps und Orakeln
    zugeordnet. Kein weiteres P0/P1, keine fehlende Datei- oder Consumerklasse.`
  - `Full Contract Review PASS: Zielvertrag, R13/R14-Grenze, Invalidation Map,
    atomare Postconditions, Rollback und Reviewbudget sind konsistent.`

Exit: S4 kann ohne neue Grundsatzentscheidung beginnen; sichere Blöcke,
Invalidation und Browsernachweis sind bestätigt.

## S4 - Umsetzung

S4 implementiert ausschließlich. Pro Block werden nur direkt invalidierte
Checks und native Delta-/Consumer-Reviews ausgeführt. CodeRabbit und die
gebündelte Browser-Gesamtmatrix bleiben S5 vorbehalten.

### S4.1 - Hubrouting und dedizierte Assets

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-ACT-C3-03 bis D-ACT-C3-05.`
- Dateien:
  - `index.html`, `app/modules/hub/index.js`, `assets/img/Activity_v2.png`,
    `assets/img/Personal_data_v3.png`, fokussierter Contracttest.
- Umsetzung:
  - Training-Carouselbutton und Quickbarbutton unmittelbar nach Vitals.
  - Training-Panelgerüst in der bestehenden Hubstruktur.
  - Carousel- und Panelmapping sowie Buttonbinding ergänzen.
  - `Personal_data_v2.png` bytegleich nach `Activity_v2.png` kopieren.
  - Profile-Icon auf das bestätigte `Personal_data_v3.png` umstellen.
- Review:
  - `nativer Consumer; IDs, Reihenfolge, Panelmapping, Assetpfade und keine
    V2-Produktloads.`
- Invalidation:
  - `T-ACT-C3-01/02.`
- Gate:
  - `none, solange das bestätigte Motiv unverändert bleibt.`

#### Ergebnis S4.1

- Änderung:
  - `Training steht in Carousel und Quickbar unmittelbar nach Vitals, besitzt
    hubTrainingPanel/-Title und ist in Hubrouting/Panelmapping gebunden.`
  - `Activity_v2.png ist eine bytegleiche Kopie des bisherigen Profilmotivs;
    Profile verwendet das unveränderte bestätigte Personal_data_v3.png.`
- Prüfung:
  - `C3-Contracttest PASS; SHA256 Activity_v2/Personal_data_v2 jeweils
    82B70D15...F40923, Personal_data_v3 4FFE900B...A5B56AE.`
  - `Nativer Consumer-Review: Reihenfolge, IDs, Panelmapping, Quickbar-Delegation
    und null V2-Capture-Produktloads PASS.`
- Finding/Korrektur:
  - `none; bestätigtes Asset nicht transformiert.`
- Restrisiko:
  - `Visuelles Responsive-Orakel bleibt gebündelt für S5.`
- Doku-Sync:
  - `S6.`
- Status:
  - `PASS.`

### S4.2 - Activity V1 atomar verlagern und Vitals bereinigen

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-ACT-C3-02, D-ACT-C3-06 und D-ACT-C3-07.`
- Dateien:
  - `index.html`, `assets/js/main.js`,
    `app/modules/vitals-stack/vitals/index.js`, `app/styles/hub.css`,
    fokussierte Contracttests.
- Umsetzung:
  - Activity-V1-Form genau einmal in das Training-Panel verschieben.
  - eigenen sichtbaren Trainingstag mit bestehender lokaler Datumssemantik
    initialisieren und im Save explizit übergeben.
  - Reset/Save/Close-/Reopen-Verhalten erhalten.
  - Activity-V1-API, RPC, Events, Feedback und Validierung unverändert nutzen.
  - alten Vitals-Training-Tab, Panelzweig, Proteinmetriken und tote
    Activity-in-Vitals-Selektoren entfernen.
  - Vitals-Default und BP/Body/Lab-Datum unverändert lassen.
- Review:
  - `nativer Consumer; genau ein Formular, genau ein Listener, korrekter Tag,
    keine V1-/V2- oder Doctor-Regression.`
- Invalidation:
  - `T-ACT-C3-03/04/05.`
- Gate:
  - `none; bei neuem Speicherbedarf sofort stoppen.`

#### Ergebnis S4.2

- Änderung:
  - `Das einzige Activity-V1-Formular liegt im Training-Panel; Vitals enthält
    nur BP, Body und Lab. Alte Proteinmetriken und Modifier-/Weight-Helper sind
    dort entfernt.`
  - `trainingDate wird einmal mit lokaler todayStr-Semantik initialisiert, als
    echter ISO-Kalendertag validiert und ohne Fallback an V1 addActivity
    übergeben. Reset/Save leeren den Tag nicht.`
  - `Ein lokaler In-Flight-Guard verhindert Doppelsubmit; V1-API, RPC,
    Persistenz, Event und Doctor-Reader bleiben unverändert.`
- Prüfung:
  - `Node-Syntax Main/Hub/Vitals/Test PASS; C3-Contracttest PASS; git diff
    --check für alle Block-A-Textdateien PASS.`
  - `Statisches Orakel: je ein Form/Save/Listener/addActivity, keine
    Vitals-Activity-Tabs/-Panels, kein data-protein-value und kein V2-Writerload.`
- Finding/Korrektur:
  - `F-ACT-C3-14 fixed durch expliziten In-Flight-Guard.`
- Restrisiko:
  - `Runtime-/Browser- und Cacheintegration bleiben planmäßig S5 bzw. Block B.`
- Doku-Sync:
  - `S6.`
- Status:
  - `PASS.`

### S4.3 - Read-only Protein-Erklärung im Dashboard

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-ACT-C3-08 bis D-ACT-C3-10.`
- Dateien:
  - `index.html`, `app/modules/hub/index.js`,
    `app/modules/vitals-stack/protein/index.js`, `app/modules/profile/index.js`,
    Entfernung obsoleter Helper aus `app/modules/vitals-stack/vitals/index.js`,
    `app/styles/hub.css`, fokussierte Contracttests.
- Umsetzung:
  - Protein-Ziel als semantischen Button/Trigger ausführen.
  - read-only Protein-Erklärmodell mit strikt erlaubtem Keyset aus dem realen
    Profilpostimage bereitstellen.
  - bestehende Spalten `protein_calc_version` und `protein_window_days`
    read-only in den Profil-Snapshot aufnehmen; kein Schema- oder Save-Delta.
  - bestehende Latest-Weight-Lesehilfe kontrolliert verlagern oder
    wiederverwenden; keine zusätzliche Abfrage pro Render und kein Write.
  - nicht gespeicherten Modifierhelper entfernen statt zu duplizieren.
  - Dialog mit neutralen Werten, Doctor-Lock, Berechnungszeitpunkt,
    Fokusführung, Escape und explizitem Close implementieren.
  - Öffnen des Dialogs darf `recomputeTargets` niemals auslösen.
- Review:
  - `nativer Consumer inklusive Profilkeyset, XSS-sicherer DOM-Erzeugung,
    Fehler-/Emptyzuständen und Null-Write-Orakel.`
- Invalidation:
  - `T-ACT-C3-06/07/08.`
- Gate:
  - `neues Profilfeld, neue medizinische Ableitung oder neuer Backendvertrag
    stoppt.`

#### Ergebnis S4.3

- Änderung:
  - `Das Dashboard-Protein-Ziel ist der semantische Trigger für einen
    read-only Dialog mit Loading/Empty/Error/Data und ausschließlich explizit
    erlaubten gespeicherten Profil-/Gewichtswerten.`
  - `Profile liest calc_version/window_days und publiziert kompakten
    Syncstatus; Protein kapselt die gecachte Latest-Weight-Leseprojektion.
    Weder Dialog noch Projektion rufen recomputeTargets oder einen Write auf.`
  - `Hub rendert nur per textContent, schützt vor stale Antworten, priorisiert
    Dialog-Escape, fängt Tab-Fokus und schirmt Pointergesten ab.`
- Prüfung:
  - `C3-Contracttest PASS: exakte IDs/Zustände, Profilfelder,
    v_events_body-Select, Null-Write/Null-Recompute, textContent,
    Fokus-/Escape-/Gestenorakel.`
  - `Node-Syntax für Hub/Profile/Protein PASS; nativer Security-/Consumer-
    Review ohne zusätzlichen Payloadkey, Formel, Schwelle oder Modifier PASS.`
- Finding/Korrektur:
  - `F-ACT-C3-12 fixed; generische Fehleranzeige und Sequenzguard verhindern
    Rohfehler- beziehungsweise stale Projektion.`
- Restrisiko:
  - `Sichtbarer Fokus/Overflow und echte Dialogzustände bleiben im gebündelten
    S5-Browserpass.`
- Doku-Sync:
  - `S6.`
- Status:
  - `PASS.`

### S4.4 - Lifecycle-, Responsive- und Cacheintegration

Reasoning: `GPT-5.6 Sol / High`.

- Vertrag:
  - `D-ACT-C3-03, D-ACT-C3-10 und D-ACT-C3-13.`
- Dateien:
  - final betroffene Hub-/Main-/Vitals-/Protein-/CSS-Dateien,
    `service-worker.js`, fokussierte Contracttests.
- Umsetzung:
  - Training-Panel und Protein-Dialog auf Desktop und Mobile stabilisieren.
  - Hub-Buttonzustand, Close/Escape, Fokus, Gesten und Login/Logout prüfen.
  - Touchziele, Textfluss und Overflow absichern.
  - Service-Worker-Version monoton vom realen R13-Postimage erhöhen; keine
    harte vorab erfundene Versionsnummer.
  - tote C3-Selektoren/Styles entfernen, ohne generelles CSS-Cleanup.
- Review:
  - `nativer Consumer; Lifecycle, Responsive, Cache und Scope.`
- Invalidation:
  - `T-ACT-C3-09/10.`
- Gate:
  - `none.`

#### Ergebnis S4.4

- Änderung:
  - `Dialog und Training besitzen mobile Einspaltenlayouts, 44px-Ziele,
    begrenzten Scrollbereich und Overflowschutz; Root-SW ist monoton v7→v8
    gestiegen und cached beide neuen Assetpfade.`
  - `Nur aktuelle R13-Produkt-/Isolation-/SW-Orakel wurden auf v8/v7→v8
    nachgeführt; historische R11/R12/R13-Frozen-Fingerprints blieben bestehen.`
- Prüfung:
  - `C3-Contracttest PASS; direkt invalidierte Node-Contracttests 9/9 PASS;
    R13-Isolationsguard PASS mit product_read_loads=6, cache_version=8,
    r14_product_loads=0 und v1_capture=1.`
  - `Git diff --check für den gesamten S4-Textdelta PASS; nativer
    Lifecycle-/Cache-/Scope-Consumer-Review PASS.`
- Finding/Korrektur:
  - `F-ACT-C3-13 fixed; keine weitere berechtigte S4-Korrektur.`
- Restrisiko:
  - `Browsermatrix, Service-Worker-Runtime und integrierter Full Review bleiben
    bewusst im einmaligen S5-Abschlussblock.`
- Doku-Sync:
  - `S6.`
- Status:
  - `PASS.`

Exit: Alle C3-Findings sind implementiert; noch keine externe Review- oder
Deploywirkung.

## S5 - Tests, Runtime-Gates und Abschlussreview

Reasoning: `GPT-5.6 Sol / High`.

Deterministische Reihenfolge:

1. Nur die durch den finalen C3-Diff invalidierten statischen, Contract- und
   Browserchecks ausführen; weiterhin gültige R13-Nachweise referenzieren.
2. Lokalen statischen Server einmal für den gebündelten Browserpass starten.
3. Mit In-App-Browser, sonst dokumentiertem lokalen Browserfallback Desktop,
   390x844 und 320x800 in einer zusammenhängenden Session prüfen.
4. Nativen Full Code, Contract, Security, Medical, Accessibility, Scope und
   Cache Review des finalen Gesamtdiffs durchführen.
5. Genau einen initialen `coderabbit`-Lauf gegen denselben finalen Diff
   ausführen. Findings gesammelt bewerten; nichts blind korrigieren.
6. Berechtigte Findings minimal gebündelt korrigieren und nur invalidierte
   Checks wiederholen.
7. Genau einen CodeRabbit-Verifikationslauf ausführen. Keine weitere Schleife
   für gewöhnliche Nitpicks.
8. Finalen Source-of-Truth- und Dirty-Worktree-Check durchführen.

Externes Reviewbudget:

- S1-S4: `0`.
- S5 Initial: `1`.
- S5 Verifikation: `höchstens 1` nach berechtigten Korrekturen.
- Schlägt der kanonische Aufruf fehl, keine Neuinstallation oder Ersatzroute
  improvisieren. Native Reviews bleiben gültig; Akzeptanz der externen
  Evidence-Lücke ist ein Owner-Gate vor DONE.

<!-- markdownlint-disable MD013 -->

| ID | Ebene | Check / Smoke | Status | Nachweis | Invalidiert durch |
| --- | --- | --- | --- | --- | --- |
| T-ACT-C3-01 | lokal | Carousel-/Quickbarreihenfolge, Panelmapping und genau eine Training-Route | PASS | C3-Contract und Browser-DOM | `index.html`, Hub |
| T-ACT-C3-02 | lokal | Activity-Asset bytegleich; Profile-Asset vorhanden, quadratisch, transparent und renderbar | PASS | Hash/Metadaten/Browser | Assets/HTML |
| T-ACT-C3-03 | lokal | Genau ein Activity-V1-Formular, ein Submitlistener und kein Vitals-Training-Tab | PASS | C3-Contract | HTML/Main/Vitals |
| T-ACT-C3-04 | lokal | Activity-V1-Saveparität: Text, Dauer, Notiz, eigener Tag, Fehler, Reset und kein V2-Write | PASS | C3-Contract/R13-Isolation | Main/Activity |
| T-ACT-C3-05 | lokal | Vitals BP/Body/Lab und gemeinsames Vitals-Datum unverändert | PASS | C3-Contract/Browser | HTML/Vitals/Main |
| T-ACT-C3-06 | lokal | Protein-Erklärmodell akzeptiert nur erlaubte gespeicherte/read-only Felder und berechnet keinen Modifier | PASS | C3-Contract/nativer Review | Protein/Profile |
| T-ACT-C3-07 | lokal | Dialog Loading/Empty/Data/Doctor-Lock/Error, XSS-sicher und ohne Recompute/Write | PASS | C3-Contract/Product-Smoke/Browser | Hub/Protein |
| T-ACT-C3-08 | lokal | Fokus hinein/zurück, Escape, Close, Tastatur und kein Dashboard-Gestenkonflikt | PASS | Browser/Contract | Hub/HTML |
| T-ACT-C3-09 | Browser | 1440x900, 390x844, 320x800: Karussell, Training, Vitals und Protein-Dialog | PASS | gebündelte Edge-Session/Screenshots/Assertions | gesamter UI-Diff |
| T-ACT-C3-10 | Browser | kein horizontaler Overflow, keine Überlappung, Touchziele und Icons korrekt | PASS | finale Pixel-/DOM-Assertions nach F-ACT-C3-17/-18 | CSS/Assets |
| T-ACT-C3-11 | lokal | Service-Worker-/Productload-/Activity-V2-Isolation und monotone Cacheversion | PASS | R13-Isolation, Doctor 4/4, V2 5/5, Smoke 5/5, v13 | SW/HTML/scripts |
| T-ACT-C3-12 | Review | finaler nativer Full Review, CodeRabbit-Budget und `git diff --check` | PASS | nativer Full Review/diff-check PASS; manueller Initialreview bewertet, Fokusfix gezielt verifiziert | finaler Diff |

<!-- markdownlint-enable MD013 -->

Browser-Szenario:

1. App lokal laden, Auth-/Bootzustand bis zur bedienbaren Huboberfläche
   erreichen.
2. Karussellreihenfolge und Quickbar-Training prüfen.
3. Training öffnen, heutigen Tag bestätigen, Aktivität/Dauer/Notiz füllen,
   Panel schließen und wieder öffnen; Werte müssen erhalten bleiben.
4. Vitals-Datum ändern und zurück zu Training wechseln; der Trainingstag darf
   nicht heimlich folgen.
5. Save mit kontrolliertem Testadapter oder bestehendem sicheren lokalen
   Harness beweisen; kein produktiver Activity-Write allein für den Smoke.
6. Vitals öffnen und ausschließlich BP/Body/Lab prüfen.
7. Dashboard öffnen, Protein-Ziel per Maus, Tap und Tastatur auslösen;
   Dialoginhalt, Fokus, Escape und Close prüfen.
8. Profile öffnen und beide Icons im Karussellwechsel visuell prüfen.
9. Browserkonsole, Netzwerkorakel und DOM auf Fehler, Recompute- oder V2-
   Captureaufrufe prüfen.

Ergebnis:

- Grüne Nachweise:
  - `T-ACT-C3-01 bis -12 PASS. Finale lokale Contract-/Smoke-Matrix, drei
    Viewports in einer Edge-Session, nativer Full Review, Assethash und
    git diff --check sind grün.`
  - `CodeRabbit-Fokusfix: Außenfokus wird auf hubProteinContextClose
    zurückgeholt; Tab und Shift+Tab bleiben im Dialog. C3-Contract, R13-
    Isolation, Doctor 4/4, V2-Isolation 5/5 und Product-Smoke 5/5 mit v13
    erneut PASS.`
- Wiederverwendete, nicht invalidierte Nachweise:
  - `EV-ACT-R13-L03/L07/C45/R06/R07 gemäß G0/Context Receipt.`
- Nicht ausgeführte Smokes:
  - `Android/ADB/APK und produktiver Deploy; bewusst R14 beziehungsweise
    Owneraufgabe.`
- Produktiver Iststand:
  - `kein C3-Deploy; lokaler C3-Stand ist funktional, nativ und extern geprüft
    und als S5 PASS freigegeben.`
- Externer Review:
  - `Der lokale Aufruf scheiterte vor Reviewstart am isolierten Worktree. Der
    Owner lieferte anschließend einen manuellen initialen CodeRabbit-Review mit
    zwei Hinweisen; F-ACT-C3-20 fixed, F-ACT-C3-21 rejected. Kein
    Verifikationslauf erforderlich oder ausgeführt.`
- Offene Findings:
  - `none; keine offene In-Scope-P0/P1-Codeabweichung.`
- Commit-Entscheidung:
  - `S5 PASS, S6 offen; kein Commit ausgeführt.`

Exit: PASS. C3 ist lokal vollständig sichtbar, funktional, zugänglich,
cachekonsistent sowie nativ und extern geprüft; keine offene In-Scope-P0/P1.

## S6 - Doku-Sync und Abschluss

Reasoning: `GPT-5.6 Sol / High`.

Deterministisch:

1. `README.md` aktualisieren:
   - Hub führt Activity/Training als eigenes Modul.
   - Capture/Vitals beschreibt BP/Body/Lab; Capture bleibt Write-Grenze.
2. `docs/modules/Activity Module Overview.md` aktualisieren:
   - eigene Training-Produktfläche, V1-Writer in C3, R14-V2-Cutover offen.
3. `docs/modules/Capture Module Overview.md` aktualisieren:
   - Vitals-UI BP/Body/Lab; Activity-Capture über eigenständige
     Trainingfläche.
4. `docs/modules/Hub Module Overview.md` aktualisieren:
   - Carousel-/Quickbarreihenfolge, Training-Panel und Protein-Dialog.
5. `docs/modules/Profile Module Overview.md` aktualisieren:
   - neues dediziertes Profilasset.
6. `docs/modules/Protein Module Overview.md` aktualisieren:
   - Dashboard-Erklärung als read-only Projektion, keine zweite Formel.
7. `docs/Future trainingsmodule update thoughts.md` auf reales C3-DONE-
   Postimage und R14 als nächstes Core-Gate synchronisieren.
8. Relevanten HCR-Nachweis in `docs/qa/health-capture-reports.md` ergänzen;
   keine große Testmatrix duplizieren.
9. `CHANGELOG.md` unter `Unreleased` ergänzen, weil C3 eine bemerkenswerte
   sichtbare Produktänderung ist.
10. Finalen Source-of-Truth-, Contract-, Scope- und Linkreview durchführen;
    Findings minimal korrigieren.
11. U8 gemäß zentralem Workflow-Vertrag ausschließlich als
    `FINAL_OBSERVATION` erfassen und Resume Card auf DONE setzen. Ist der
    Sensor nicht valide, `FINAL_OBSERVATION_UNAVAILABLE` dokumentieren; keine
    neue Arbeit daraus ableiten.
12. Commit-Empfehlung aus realem Diff ableiten und Roadmap mit `(DONE)`
    archivieren.
13. Kein Commit oder Push ausführen.

Ergebnis:

- Source-of-Truth-Sync:
  - `PASS: README, fünf Module Overviews, Activity-Masterplan, Auth-
    Modernisierungsgrenze, HCR-032 und Changelog.`
- Finaler Review:
  - `PASS: Source of Truth, Product-/Security-/Scope-Verträge, relevante
    lokale Links und git diff --check; kein offenes P0/P1.`
- Restrisiken:
  - `finaler Android-PWA- und Activity-V2-Capture-Cutover bleibt R14.`
- Changelog-Relevanz:
  - `Unreleased aktualisiert.`
- Owner Recap:
  - `kurz erklären: Produktfläche verlagert, Daten nicht migriert, Protein
    nur erklärt, V2 weiterhin nicht aktiviert.`
- Archiv:
  - `docs/archive/MIDAS Activity V2 C3 Training Product Surface and Protein Context Relocation Roadmap (DONE).md`
- Commit-Empfehlung:

```text
feat(activity): establish standalone training surface
```

Exit: Produktcode, Cache, UI, QA, Module Overviews, Masterplan und Changelog
beschreiben denselben C3-Vertrag; R14 kann auf einer stabilen Trainingfläche
planen.

## Finales Akzeptanzbild

C3 ist erfolgreich, wenn Stephan im Hub ein eigenes Training-Modul direkt
neben Vitals sieht, dort weiterhin exakt denselben einfachen Activity-V1-
Eintrag mit einem sichtbaren Trainingstag speichern kann und Vitals nur noch
Blutdruck, Körper und Labor enthält. Das bisherige Körpermotiv kennzeichnet
Training; Profile besitzt das neue goldene Profilmotiv. Das Protein-Ziel im
Dashboard öffnet eine ruhige, verständliche Erklärung der bereits
gespeicherten Berechnungsbestandteile, ohne selbst medizinisch zu rechnen.
R13-Reader funktionieren weiter, Activity V2 bleibt als Writer verborgen und
R14 kann später ausschließlich den Capture-Pfad innerhalb dieser stabilen
Produktfläche austauschen.
