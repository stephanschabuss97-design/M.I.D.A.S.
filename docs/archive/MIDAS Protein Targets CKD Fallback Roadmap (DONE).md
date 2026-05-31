# MIDAS Protein Targets CKD Fallback Roadmap

## Ziel (klar und pruefbar)

Die Protein-Target Edge Function soll fehlende CKD-Informationen nicht mehr still als `G1` interpretieren.

Pruefbare Zieldefinition:

- `midas-protein-targets` nutzt fuer die CKD-G-Stufe eine klare Reihenfolge:
  - letzter `lab_event.payload.ckd_stage`
  - bestehendes `user_profile.protein_ckd_stage_g`
  - kein stiller `G1`-Fallback
- Ein Lab-Event ohne `ckd_stage` darf ein bestehendes `protein_ckd_stage_g = G3a` nicht auf `G1` zuruecksetzen.
- Auto-Berechnung wird bei fehlender CKD-Stufe konservativ blockiert oder bewusst ohne CKD-Write behandelt; sie darf keine falsche Gesundheit annehmen.
- Doctor-Lock bleibt hoheitlich und wird nicht durch Auto-Logik ueberschrieben.
- Die bestehende Protein-Formel, CKD-Faktoren, Activity-Logik und Zielbereich-Formel bleiben unveraendert.
- Doku und QA beschreiben den neuen Fallback-Vertrag.

## Problemzusammenfassung

Beim Review der Edge Function wurde ein fachlich relevanter Drift gefunden:

- `backend/supabase/functions/midas-protein-targets/index.ts` liest `ckd_stage` aus dem letzten `lab_event`.
- Wenn dieser Wert fehlt, setzt die Function aktuell `G1`.
- `lab_event.payload.ckd_stage` ist im SQL-Contract optional.
- Dadurch kann ein neuer Lab-Event ohne CKD-Stufe ein vorher korrekt gespeichertes Profil wie `G3a` faktisch auf `G1` zuruecksetzen.
- Die daraus berechneten Protein-Ziele werden in `user_profile` persistiert und von Profil, Hub, Intake und Assistant konsumiert.

Das widerspricht dem Protein-Modulziel:

- MIDAS soll einen deterministischen Zielbereich aus Gewicht, Alter, bewusster Aktivitaet und CKD ableiten.
- `unbekannt` darf nicht automatisch `gesund/G1` bedeuten.
- Die Function ist ein medizinisch relevanter Schreibpfad und muss konservativ bleiben.

## Scope

- Fix in:
  - `backend/supabase/functions/midas-protein-targets/index.ts`
- Doku-Sync:
  - `docs/modules/Protein Module Overview.md`
  - `docs/QA_CHECKS.md`
  - diese Roadmap
- Lokale Checks:
  - `deno check backend/supabase/functions/midas-protein-targets/index.ts`
  - `git diff --check`
  - gezielte `rg`-/Review-Scans fuer `G1`, `protein_ckd_stage_g`, `ckd_source`, `doctorLock`
- Optional definierte, aber nicht automatisch ausgefuehrte Runtime-Smokes fuer Edge Function.

## Not in Scope

- Keine Aenderung der Protein-Formel.
- Keine Aenderung der CKD-Faktoren:
  - `G1 = 1.00`
  - `G2 = 0.95`
  - `G3a = 0.90`
  - `G3b = 0.85`
  - `G4 = 0.75`
  - `G5 = 0.65`
- Keine Aenderung von Activity-Scoring oder 28-Tage-Window.
- Keine SQL-/RLS-/Datenmodell-Aenderung.
- Kein neuer CKD-Staleness-Prompt.
- Kein Profil-UI-Umbau.
- Kein Assistant-/Intake-Umbau.
- Kein Deploy ohne ausdrueckliche Freigabe.
- Keine GitHub-Actions-Haertung in diesem Fix, obwohl `curl --fail-with-body` als separates Follow-up sinnvoll bleibt.
- Keine `minFactor`-/Doctor-Faktor-Range-Aenderung in diesem Fix; das ist ein separater Formel-Contract.

## Relevante Referenzen (Code)

- `backend/supabase/functions/midas-protein-targets/index.ts`
- `app/modules/vitals-stack/protein/index.js`
- `app/modules/vitals-stack/vitals/body.js`
- `app/modules/vitals-stack/vitals/lab.js`
- `app/modules/profile/index.js`
- `app/modules/vitals-stack/vitals/index.js`
- `app/modules/hub/index.js`
- `app/modules/assistant-stack/assistant/day-plan.js`
- `app/supabase/api/vitals.js`
- `sql/10_User_Profile_Ext.sql`
- `sql/11_Lab_Event_Extension.sql`
- `sql/13_Activity_Event.sql`
- `.github/workflows/protein-targets.yml`, nur als abgegrenzter Watchlist-Kontext

## Relevante Referenzen (Doku)

- `README.md`
- `docs/MIDAS Roadmap Template.md`
- `docs/modules/Protein Module Overview.md`
- `docs/modules/Profile Module Overview.md`
- `docs/modules/Hub Module Overview.md`
- `docs/modules/State Layer Overview.md`
- `docs/QA_CHECKS.md`
- `docs/archive/Proteinrechner-Roadmap.md`
- `docs/archive/MIDAS Backend Edge Functions Deno Check Roadmap (DONE).md`

Regel:

- Erst Protein Module Overview und Proteinrechner-Roadmap lesen.
- Dann Edge Function und Konsumentenpfade lesen.
- Dann S1-S3 Reviews dokumentieren.
- Erst danach Code aendern.

## Guardrails

- MIDAS bleibt single-user und alltagstauglich.
- Keine freie medizinische Diagnose oder neue medizinische Bewertung.
- Keine falsche Sicherheit:
  - fehlende CKD-Stufe darf nicht als `G1` behandelt werden.
- Keine versteckten medizinischen Writes aus einem unsicheren Zustand.
- Doctor-Lock bleibt hoheitlich.
- `user_profile` bleibt Source of Truth fuer effektive Protein-Targets.
- `lab_event` bleibt Input, nicht alleinige Source of Truth fuer persistierte Targets.
- Edge Function schreibt nur nach klarem Rechenvertrag.
- Source-of-Truth-Doku muss am Ende synchron sein.

## Architektur-Constraints

- Supabase Edge Function laeuft in Deno.
- Edge Function nutzt Service Role intern und begrenzt alle Reads/Writes mit `.eq("user_id", userId)`.
- Scheduler kann mit Service Role laufen und braucht `PROTEIN_TARGETS_USER_ID`.
- Frontend-Body-Save sendet aktuell numerisches `weight_kg`.
- Scheduler-Run kann ohne `weight_kg` laufen und zieht dann das letzte Body-Gewicht aus `health_events`.
- `lab_event.payload.ckd_stage` ist optional.
- `user_profile.protein_ckd_stage_g` existiert als persistierte letzte Protein-CKD-G-Stufe.
- `deno check` ist Pflicht, ersetzt aber keinen echten Edge Runtime-Smoke.

## Tool Permissions

Allowed:

- Lesen und Aendern von:
  - `backend/supabase/functions/midas-protein-targets/index.ts`
  - `docs/modules/Protein Module Overview.md`
  - `docs/QA_CHECKS.md`
  - diese Roadmap
- Lesen der referenzierten Frontend-, SQL- und Workflow-Dateien.
- Lokale Checks:
  - `deno check backend/supabase/functions/midas-protein-targets/index.ts`
  - `git diff --check`
  - gezielte `rg`-/Review-Scans.

Forbidden:

- Supabase Deploy ohne ausdrueckliche User-Freigabe.
- Echte Edge Function Runtime-Smokes, die `user_profile` schreiben, ohne ausdrueckliche User-Freigabe.
- SQL-/RLS-/Schema-Aenderungen.
- Protein-Formel-, Faktor- oder Activity-Scoring-Aenderungen.
- UI-/Assistant-/Intake-Umbauten.
- GitHub-Actions-Umbau ohne separaten Auftrag.

## Execution Mode

- S1 bis S3 sind kurz, aber verpflichtend, weil Edge Function und medizinischer Kontext betroffen sind.
- S4 ist die eng begrenzte Umsetzung in `index.ts`.
- S5 prueft lokal und definiert nicht lokal ausgefuehrte Runtime-Smokes.
- S6 synchronisiert Protein-Doku, QA und Roadmap.
- Nach jedem Hauptschritt Statusmatrix aktualisieren.
- Jeder Hauptschritt endet mit:
  - Schritt-Abnahme
  - Doku-Sync-Entscheidung
  - Commit-Empfehlung

## Vorab Contract Review 31.05.2026

Review-Frage:

- Duerfen die gefundenen Protein-Target-Findings korrigiert werden, ohne die Protein-Formel oder den Produktvertrag zu erweitern?

Entscheidung:

- Ja, wenn der Fix auf den CKD-Fallback-Vertrag, kleine Typ-Hygiene und Diagnostik begrenzt bleibt.

Findings:

- CR-PRO-ROAD-F1: `G1` als stiller Default widerspricht dem Ziel `unbekannt != gesund`.
- CR-PRO-ROAD-F2: Ein direkter Fallback auf hardcoded `G3a` waere fuer Stephan konservativ, aber als allgemeiner Modulvertrag weniger sauber als `Lab > Profil > Skip`.
- CR-PRO-ROAD-F3: Doctor-Lock darf nicht durch CKD-Fallback-Logik seine Zielbereich-Hoheit verlieren.
- CR-PRO-ROAD-F4: `minFactor`-Guardrail ist ein separater Formel-Contract und darf nicht nebenbei mitgefixt werden.
- CR-PRO-ROAD-F5: GitHub Workflow `curl --fail-with-body` ist sinnvoll, aber nicht Teil des index.ts-Ziels.
- CR-PRO-ROAD-F6: `weight_kg` String-Toleranz ist Hygiene, kein P1.

Korrekturen am Roadmap-Vertrag:

- `Lab > Profil > Skip` als Zielvertrag festgelegt.
- Formel- und Workflow-Follow-ups explizit aus Scope genommen.
- Doctor-Lock als eigener Review-Punkt in S4/S5 aufgenommen.
- Doku-/QA-Sync in S6 verpflichtend gemacht.

Nachpruefung:

- Keine offenen Contract-Findings fuer den Roadmap-Start.

## Post-Write Contract Review 31.05.2026

Review-Frage:

- Entspricht diese Roadmap den zuvor formulierten Review-Aussagen und dem Protein-Modulziel?

Geprueft:

- Roadmap-Struktur gegen `docs/MIDAS Roadmap Template.md`.
- Ziel gegen `docs/modules/Protein Module Overview.md`.
- Scope gegen die Review-Aussagen:
  - CKD-Fallback ist P1.
  - `weight_kg` Typ ist Hygiene.
  - `minFactor` bleibt ausser Scope.
  - Workflow-Haertung bleibt ausser Scope.
- Guardrails gegen medizinische Schreibpfade und Doctor-Lock.
- Relevante Referenzpfade auf Existenz.
- ASCII-/Encoding-Sauberkeit der neuen Roadmap.

Findings:

- CR-PRO-POST-F1: Die Roadmap musste klarer abgrenzen, dass `G3a` kein generischer Default werden soll.
- CR-PRO-POST-F2: Die Roadmap musste Doctor-Lock plus fehlende CKD-Metadaten explizit als S4/S5-Pruefpunkt aufnehmen.

Korrekturen:

- `Lab > Profil > Skip` wurde als bevorzugter Contract festgelegt.
- Doctor-Lock ist in S4.3 und S5.5 als eigener Review-Punkt enthalten.

Nachpruefung:

- Keine offenen Post-Write-Contract-Findings.

## Statusmatrix

| ID | Schritt | Status | Ergebnis/Notiz |
| --- | --- | --- | --- |
| S1 | System- und Vertragsdetektivarbeit | DONE | Protein-Doku, Roadmap, Edge Function, Frontend-Trigger, Profil/Hub/Assistant-Konsumenten, State-/Profile-/Hub-Doku und SQL-Vertrag gelesen; CKD-Entstehung, Persistenz und Konsumentenpfade dokumentiert. |
| S2 | Fachlicher/technischer Contract Review | DONE | CKD-Vertrag auf `Lab > Profil > Missing` festgelegt; Auto ohne CKD skipped, Doctor-Lock darf Zielbereich ohne CKD-Neuschreibung fortschreiben. |
| S3 | Bruchrisiko- und Umsetzungsreview | DONE | Cooldown, Doctor-Lock, Scheduler, Typ-Hygiene und Diagnose-Metadaten geprueft; S4-Pflichtbranch fuer `missing` festgelegt. |
| S4 | Umsetzung in `index.ts` | DONE | S4.1-S4.7 abgeschlossen; CKD-Fallback korrigiert, Typ-/Response-Hygiene umgesetzt und final reviewed. |
| S5 | Tests, Code Review und Contract Review | DONE | Deno, Diff, Scans, Code Review und Contract Review gruen; Runtime-Smokes bewusst nicht ausgefuehrt, Deploy erfolgte nach S6 auf User-Freigabe. |
| S6 | Doku-Sync, QA-Update und Abschlussreview | DONE | Protein Overview, QA und Roadmap synchronisiert; finaler Contract Review ohne offene P0/P1-Findings. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## S1 - System- und Vertragsdetektivarbeit

Ziel:

- Bestehenden Protein-Target-Vertrag verstehen.
- Klaeren, welche Schichten von der CKD-Fallback-Korrektur betroffen sind.

Substeps:

- S1.1 `docs/modules/Protein Module Overview.md` lesen.
- S1.2 `docs/archive/Proteinrechner-Roadmap.md` lesen.
- S1.3 `backend/supabase/functions/midas-protein-targets/index.ts` lesen.
- S1.4 Frontend-Trigger lesen:
  - `app/modules/vitals-stack/protein/index.js`
  - `app/modules/vitals-stack/vitals/body.js`
- S1.5 Lab-/Profil- und Konsumentenpfade lesen:
  - `app/modules/vitals-stack/vitals/lab.js`
  - `app/modules/profile/index.js`
  - `app/modules/hub/index.js`
  - `app/modules/assistant-stack/assistant/day-plan.js`
- S1.6 SQL-Vertrag lesen:
  - `sql/10_User_Profile_Ext.sql`
  - `sql/11_Lab_Event_Extension.sql`
  - `sql/13_Activity_Event.sql`
- S1.7 Systemkarte und Findings dokumentieren.
- S1.8 Contract Review S1.

Exit-Kriterium:

- Es ist klar, wo CKD-Stufe entsteht, wo sie persistiert wird und wer die Protein-Targets konsumiert.

### S1 Ergebnisprotokoll 31.05.2026

Durchgefuehrt:

- S1.1 `docs/modules/Protein Module Overview.md` gelesen.
- S1.2 `docs/archive/Proteinrechner-Roadmap.md` gelesen.
- S1.3 `backend/supabase/functions/midas-protein-targets/index.ts` gelesen.
- S1.4 Frontend-Trigger gelesen:
  - `app/modules/vitals-stack/protein/index.js`
  - `app/modules/vitals-stack/vitals/body.js`
- S1.5 Lab-/Profil- und Konsumentenpfade gelesen:
  - `app/modules/vitals-stack/vitals/lab.js`
  - `app/modules/profile/index.js`
  - `app/modules/vitals-stack/vitals/index.js`
  - `app/modules/hub/index.js`
  - `app/modules/assistant-stack/assistant/day-plan.js`
  - `app/supabase/api/vitals.js`
- S1.6 SQL-Vertrag gelesen:
  - `sql/10_User_Profile_Ext.sql`
  - `sql/11_Lab_Event_Extension.sql`
  - `sql/13_Activity_Event.sql`
- Ergaenzende Vertragsdokus gelesen:
  - `docs/modules/Profile Module Overview.md`
  - `docs/modules/Hub Module Overview.md`
  - `docs/modules/State Layer Overview.md`
  - `docs/archive/MIDAS Backend Edge Functions Deno Check Roadmap (DONE).md`

Systemkarte:

- CKD-Eingabe entsteht primaer im Lab-Modul:
  - `app/modules/vitals-stack/vitals/lab.js` speichert `payload.ckd_stage`, aber nur wenn der Wert im Formular vorhanden ist.
  - SQL validiert `ckd_stage`, wenn er vorhanden ist; ein Lab-Event ohne CKD-Stufe bleibt erlaubt.
- CKD-Anzeige im Profil ist ein Lab-Snapshot:
  - `app/modules/profile/index.js` liest die sichtbare CKD-Badge-Information ueber `loadLatestLabSnapshot()`.
  - Das sichtbare Profil-Badge ist daher nicht dasselbe wie `user_profile.protein_ckd_stage_g`.
- Protein-Target-Persistenz liegt in `user_profile`:
  - `protein_target_min`, `protein_target_max`, `protein_factor_current`, `protein_ckd_stage_g`, `protein_ckd_factor` und Doctor-Lock-Felder werden dort gehalten.
  - `protein_ckd_stage_g` ist die zuletzt verwendete Protein-Berechnungsbasis, nicht die alleinige medizinische Lab-Quelle.
- Edge Function `midas-protein-targets` ist der schreibende Zielbereichspfad:
  - Auth/Scheduler bestimmt `userId`.
  - Gewicht kommt aus Request oder letztem Body-Event.
  - Profil wird gelesen.
  - neuester `lab_event.payload.ckd_stage` wird gelesen.
  - aktuell wird fehlende CKD mit `G1` ersetzt.
  - Resultat wird in `user_profile` persistiert.
- Trigger:
  - Body-Save ruft `AppModules.protein.recomputeTargets(...)` mit numerischem Gewicht auf.
  - Scheduler kann ohne Request-Gewicht laufen und zieht dann das letzte Body-Gewicht.
- Konsumenten:
  - Protein-/Vitals-UI zeigt die persistierten Protein-Felder.
  - Assistant-Day-Plan nutzt `protein_target_max`/`protein_target_min` als Protein-Orientierung.
  - Hub/Profile konsumieren Profil-Snapshots, ohne selbst Protein-Ziele zu berechnen.

Findings:

- PRO-S1-F1: Der Bug ist real, nicht nur theoretisch.
  - `lab_event.payload.ckd_stage` ist optional.
  - Die Edge Function nutzt aktuell `parseCkdStage(ckdStageRaw) || "G1"`.
  - Ein neuer Lab-Event ohne CKD-Stufe kann dadurch einen vorher korrekten Protein-Kontext auf `G1` verschieben.
- PRO-S1-F2: `user_profile.protein_ckd_stage_g` ist bereits im Function-Select vorhanden.
  - Der Profil-Fallback kann ohne Schema-Aenderung umgesetzt werden.
  - Dafuer muss die Profilvalidierung vor oder innerhalb der CKD-Aufloesung sauber nutzbar sein.
- PRO-S1-F3: Der Profil-Fallback darf nicht mit der sichtbaren Profil-CKD-Anzeige verwechselt werden.
  - Profilanzeige: letzter Lab-Snapshot.
  - Protein-Fallback: letzte persistierte Protein-Berechnungsbasis.
- PRO-S1-F4: Der aktuelle `G1`-Default kann den Cooldown aushebeln.
  - Wenn vorher `protein_ckd_stage_g = G3a` war und der neueste Lab-Event keine CKD-Stufe hat, wird `ckdStage = G1`.
  - `stageUnchanged` wird dadurch falsch `false`.
  - Die Function kann neu schreiben, obwohl fachlich keine neue CKD-Information vorliegt.
- PRO-S1-F5: Doctor-Lock schuetzt den Zielbereich, aber nicht automatisch die CKD-Metadaten.
  - `updatePayload` schreibt weiterhin `protein_ckd_stage_g` und `protein_ckd_factor`.
  - Auch bei Doctor-Lock darf fehlende CKD daher nicht als `G1` persistiert werden.
- PRO-S1-F6: `weight_kg` ist runtime-tolerant gegen Strings, aber der Type erlaubt aktuell nur `number | null`.
  - Das ist ein Hygiene-Finding fuer S4, kein fachlicher P1.
- PRO-S1-F7: Die bestehende Protein-Doku nennt noch den alten `G1`-Fallback.
  - Doku-Sync gehoert in S6, nachdem der neue Vertrag umgesetzt und getestet ist.
- PRO-S1-F8: `protein_ckd_confirmed_at` ist in Diskussionen/Doku als Zukunftsidee vorhanden, aber nicht im aktuellen SQL-Vertrag.
  - Kein S4-Scope; kein neues Feld in diesem Fix.
- PRO-S1-F9: `.github/workflows/protein-targets.yml` bleibt ein Watchlist-Kontext.
  - Workflow-Haertung ist sinnvoll, aber explizit nicht Teil dieses CKD-Fallback-Fixes.

S1 Contract Review:

- Review-Frage:
  - Erfuellt S1 den Roadmap-Vertrag, ohne bereits Umsetzungsentscheidungen oder Produktcode zu veraendern?
- Entscheidung:
  - Ja. S1 klaert die relevanten Entstehungs-, Persistenz- und Konsumentenpfade.
  - Keine Codeaenderung wurde vorgenommen.
  - Die weitere Umsetzung kann auf `Lab > Profil > Skip` fokussiert werden.

Contract-Findings:

- PRO-S1-CR-F1: S1 musste klarer zwischen sichtbarer Profil-CKD und Protein-Fallback-Feld unterscheiden.
- PRO-S1-CR-F2: S1 musste Doctor-Lock-Metadaten ausdruecklich als Risiko nennen.
- PRO-S1-CR-F3: S1 musste das Cooldown-Risiko durch falschen `G1`-Wechsel ausdruecklich dokumentieren.
- PRO-S1-CR-F4: S1 musste festhalten, dass SQL fehlende CKD-Stufen erlaubt und der Fehler daher praktisch erreichbar ist.
- PRO-S1-CR-F5: S1 musste die Out-of-Scope-Findings `minFactor`, Workflow-Haertung und CKD-Staleness-Feld vom eigentlichen Fix trennen.

Korrekturen aus dem Contract Review:

- PRO-S1-CR-F1 korrigiert:
  - Systemkarte trennt Profil-Badge und `user_profile.protein_ckd_stage_g`.
- PRO-S1-CR-F2 korrigiert:
  - PRO-S1-F5 dokumentiert Doctor-Lock-Metadaten als S4/S5-Pruefpunkt.
- PRO-S1-CR-F3 korrigiert:
  - PRO-S1-F4 dokumentiert den Cooldown-Drift.
- PRO-S1-CR-F4 korrigiert:
  - Systemkarte und PRO-S1-F1 dokumentieren den optionalen Lab-CKD-Vertrag.
- PRO-S1-CR-F5 korrigiert:
  - PRO-S1-F6 bis PRO-S1-F9 trennen Hygiene, Doku-Sync und Watchlist explizit vom P1-Fix.

Doku-Sync-Entscheidung:

- Noch keine Protein-Overview- oder QA-Aenderung in S1.
- Doku-Sync folgt in S6, damit Source-of-Truth-Doku erst nach geprueftem Codevertrag geaendert wird.

S1 Exit:

- Erfuellt.
- CKD-Stufe:
  - entsteht als optionaler Lab-Event-Wert.
  - wird fuer Protein-Ziele in `user_profile.protein_ckd_stage_g` persistiert.
  - darf nicht aus fehlendem Lab-Wert still zu `G1` werden.
- Konsumenten:
  - lesen persistierte Targets und rechnen keine eigene CKD-Logik.

S1 Schritt-Abnahme und Commit-Empfehlung:

- Abnahme: S1 abgeschlossen.
- Commit: noch nicht einzeln noetig; sinnvoll nach S3 oder nach komplettem Fix.

## S2 - Fachlicher/technischer Contract Review

Ziel:

- Zielvertrag fuer fehlende CKD-Stufe festlegen.

Substeps:

- S2.1 Optionen vergleichen:
  - `G1` weiterverwenden
  - hardcoded `G3a`
  - `Lab > Profil > Skip`
- S2.2 Doctor-Lock-Verhalten bei fehlender CKD-Stufe festlegen.
- S2.3 Doku- und QA-Auswirkungen klaeren.
- S2.4 S4-Pflichtpunkte festlegen.
- S2.5 Contract Review S2.

Exit-Kriterium:

- Es ist entschieden, ob fehlende CKD-Stufe einen Skip erzeugt oder ob mit Profil-Fallback gerechnet wird.

### S2 Ergebnisprotokoll 31.05.2026

Durchgefuehrt:

- S2.1 Optionen verglichen:
  - `G1` weiterverwenden
  - hardcoded `G3a`
  - `Lab > Profil > Skip`
- S2.2 Doctor-Lock-Verhalten bei fehlender CKD-Stufe festgelegt.
- S2.3 Doku- und QA-Auswirkungen geklaert.
- S2.4 S4-Pflichtpunkte festgelegt.
- S2.5 Contract Review S2 durchgefuehrt.

#### S2.1 Optionenvergleich

Option `G1` weiterverwenden:

- Entscheidung: abgelehnt.
- Grund:
  - `G1` bedeutet fachlich praktisch "keine CKD-Einschraenkung" im aktuellen Faktorvertrag.
  - Ein fehlender Wert darf in MIDAS nicht als gesunder Wert interpretiert werden.
  - Der Fehler ist praktisch erreichbar, weil Lab-CKD optional ist.
  - Persistenz in `user_profile` macht den Drift downstream wirksam.

Option hardcoded `G3a`:

- Entscheidung: abgelehnt.
- Grund:
  - Fuer Stephan waere `G3a` konservativer als `G1`, aber als generischer Modulvertrag waere es trotzdem ein erfundener Gesundheitswert.
  - Der Fix soll die Datenherkunft verbessern, nicht einen anderen Default setzen.
  - MIDAS bleibt zwar single-user, aber die Source-of-Truth-Regel bleibt wertvoll: bekannte Daten schlagen Annahmen.

Option `Lab > Profil > Missing`:

- Entscheidung: angenommen.
- Vertrag:
  - Zuerst wird `latest lab_event.payload.ckd_stage` geparst.
  - Wenn dort keine valide G-Stufe steht, wird `user_profile.protein_ckd_stage_g` geparst.
  - Wenn auch dort keine valide G-Stufe steht, ist CKD fuer diese Berechnung `missing`.
  - Es gibt keinen stillen `G1`-Fallback.
- Begruendung:
  - Lab bleibt primaere medizinische Quelle.
  - Profilwert bleibt die letzte persistierte Protein-Berechnungsbasis und schuetzt gegen neue Lab-Events ohne CKD-Feld.
  - Missing bleibt sichtbar/entscheidbar und wird nicht in eine falsche Stufe uebersetzt.

#### S2.2 Doctor-Lock-Vertrag

Grundsatz:

- Doctor-Lock ist hoheitlich fuer den effektiven Faktor und Zielbereich.
- CKD ist bei aktivem Doctor-Lock nicht die Quelle fuer `factor_current`.
- Trotzdem duerfen CKD-Metadaten auch bei Doctor-Lock nicht falsch auf `G1` gesetzt werden.

Festgelegter Vertrag:

- Wenn Doctor-Lock aktiv ist und `protein_doctor_factor` fehlt oder ungueltig ist:
  - unveraendert skippen mit `doctor_factor_missing`.
- Wenn Doctor-Lock aktiv ist und CKD aus Lab oder Profil valide aufgeloest werden kann:
  - Zielbereich mit Doctor-Faktor berechnen.
  - CKD-Metadaten mit der aufgeloesten Stufe schreiben.
- Wenn Doctor-Lock aktiv ist und CKD sowohl in Lab als auch Profil fehlt:
  - Zielbereich darf mit Doctor-Faktor und Gewicht berechnet werden.
  - CKD-Stufe und CKD-Faktor duerfen nicht erfunden werden.
  - Bestehende CKD-Felder werden nicht auf `G1` gesetzt.
  - Wenn keine valide CKD vorliegt, werden CKD-Metadaten im Update ausgelassen oder unveraendert gelassen.

Abgrenzung:

- Das ist keine neue medizinische Bewertung.
- Der Doctor-Faktor bleibt die manuelle medizinische Hoheitsentscheidung.
- Auto-Berechnung bleibt strenger als Doctor-Lock, weil Auto ohne CKD keinen validen CKD-Faktor hat.

#### S2.3 Doku- und QA-Auswirkungen

Protein Module Overview:

- Der Satz `CKD-Stufe kommt aus letztem lab_event (Fallback G1, falls kein Wert)` muss in S6 ersetzt werden.
- Neuer Vertrag:
  - CKD kommt aus letztem Lab-Event.
  - Fallback ist `user_profile.protein_ckd_stage_g`.
  - Wenn beides fehlt, wird Auto-Berechnung skipped.
  - Doctor-Lock darf bei fehlender CKD mit Doctor-Faktor weiterrechnen, ohne CKD-Felder zu erfinden.

QA_CHECKS:

- S6 soll dauerhafte QA-Punkte ergaenzen:
  - Lab-Event ohne `ckd_stage` und Profil `G3a` darf nicht zu `G1` werden.
  - Lab-Event ohne `ckd_stage` und Profil ohne CKD fuehrt bei Auto zu Skip.
  - Doctor-Lock mit validem Doctor-Faktor und fehlender CKD setzt kein `G1`.
  - `deno check` ist gruen.
  - CKD-Faktoren, Activity-Window und `minFactor` bleiben unveraendert.

Roadmap:

- S2 legt den Zielvertrag fest.
- S3 prueft Bruchrisiken vor der Umsetzung.
- S4 setzt den Vertrag in `index.ts` um.
- S6 synchronisiert Doku/QA erst nach geprueftem Code.

#### S2.4 S4-Pflichtpunkte

Pflichtpunkte fuer die Umsetzung:

- `ProfileRow` muss vor der CKD-Aufloesung validiert/nutzbar sein.
- CKD-Aufloesung muss als klare Prioritaet lesbar sein:
  - `lab` zuerst
  - `profile` danach
  - `missing` danach
- `parseCkdStage(...) || "G1"` muss entfernt werden.
- Der Code darf keinen neuen hardcoded Default `G3a` einfuehren.
- Auto-Berechnung ohne CKD muss skippen, bevor ein Zielbereich geschrieben wird.
- Doctor-Lock mit validem Doctor-Faktor darf ohne CKD weiterrechnen, aber keine CKD-Metadaten erfinden.
- `updatePayload` darf `protein_ckd_stage_g` und `protein_ckd_factor` nur schreiben, wenn eine valide CKD-Stufe aufgeloest wurde.
- Cooldown muss gegen die effektiv aufgeloeste CKD-Stufe pruefen.
- Response-/Diagnose-Metadaten duerfen `ckd_source` enthalten, wenn das ohne Contract-Drift moeglich ist.
- `weight_kg?: number | string | null` darf als Typ-Hygiene angepasst werden.
- CKD-Faktoren, Activity-Scoring, 28-Tage-Window, Doctor-Faktor-Formel und `minFactor` bleiben unveraendert.

#### S2.5 Contract Review

Review-Frage:

- Ist der S2-Vertrag eng genug, um den `G1`-Bug zu korrigieren, ohne Formel, Schema oder UI-Vertrag zu verschieben?

Entscheidung:

- Ja.
- Der Vertrag ist bewusst klein:
  - kein neuer Default
  - kein neues Schema
  - keine Formel-Aenderung
  - keine UI-Aenderung
  - kein Deploy

Contract-Findings:

- PRO-S2-CR-F1: `Lab > Profil > Skip` war fuer Doctor-Lock zu ungenau formuliert.
- PRO-S2-CR-F2: Der Profil-Fallback musste als geparster Protein-Kontextwert definiert werden, nicht als sichtbares Profil-Badge.
- PRO-S2-CR-F3: S2 musste ausdruecklich festlegen, ob `updatePayload` CKD-Felder bei `missing` schreiben darf.
- PRO-S2-CR-F4: S2 musste sicherstellen, dass kein hardcoded `G3a` als Ersatzdefault entsteht.
- PRO-S2-CR-F5: Doku-/QA-Sync durfte nicht vor der Codepruefung in S6 vorgezogen werden.

Korrekturen aus dem Contract Review:

- PRO-S2-CR-F1 korrigiert:
  - Doctor-Lock-Vertrag trennt jetzt validen Doctor-Faktor von fehlender CKD.
- PRO-S2-CR-F2 korrigiert:
  - `user_profile.protein_ckd_stage_g` ist als letzte Protein-Berechnungsbasis definiert.
- PRO-S2-CR-F3 korrigiert:
  - `updatePayload` darf CKD-Felder nur bei valide aufgeloester CKD schreiben.
- PRO-S2-CR-F4 korrigiert:
  - hardcoded `G3a` ist ausdruecklich abgelehnt.
- PRO-S2-CR-F5 korrigiert:
  - Doku-/QA-Aenderungen bleiben S6.

Doku-Sync-Entscheidung:

- Noch keine Doku-/QA-Dateien ausser dieser Roadmap aendern.
- `docs/modules/Protein Module Overview.md` und `docs/QA_CHECKS.md` werden in S6 synchronisiert.

S2 Exit:

- Erfuellt.
- Finale Entscheidung:
  - Auto: `Lab > Profil > Missing`; bei `missing` skip.
  - Doctor-Lock: `Lab > Profil > Missing`; bei `missing` Zielbereich mit Doctor-Faktor erlaubt, aber keine CKD-Neuschreibung.

S2 Schritt-Abnahme und Commit-Empfehlung:

- Abnahme: S2 abgeschlossen.
- Commit: noch nicht einzeln noetig; sinnvoll nach S3 oder nach komplettem Fix.

## S3 - Bruchrisiko- und Umsetzungsreview

Ziel:

- Risiken vor Codeaenderung identifizieren.

Substeps:

- S3.1 Cooldown-Risiko pruefen:
  - `stageUnchanged` darf durch neuen Fallback nicht falsch skippen.
- S3.2 Doctor-Lock-Risiko pruefen:
  - Zielbereich bleibt Doctor-Faktor-basiert.
  - CKD-Metadaten werden nicht falsch auf `G1` gesetzt.
- S3.3 Scheduler-Risiko pruefen:
  - Lauf ohne `weight_kg` zieht letztes Gewicht.
  - fehlende CKD darf keinen stillen Write erzeugen.
- S3.4 Typ-Hygiene pruefen:
  - `weight_kg?: number | string | null`.
- S3.5 Diagnose-/Response-Metadaten pruefen:
  - optional `ckd_source` fuer QA.
- S3.6 Contract Review S3.

Exit-Kriterium:

- S4 kann ohne offene Bruchrisiken starten.

### S3 Ergebnisprotokoll 31.05.2026

Durchgefuehrt:

- S3.1 Cooldown-Risiko geprueft.
- S3.2 Doctor-Lock-Risiko geprueft.
- S3.3 Scheduler-Risiko geprueft.
- S3.4 Typ-Hygiene geprueft.
- S3.5 Diagnose-/Response-Metadaten geprueft.
- S3.6 Contract Review S3 durchgefuehrt.

#### S3.1 Cooldown-Risiko

Ist-Zustand:

- Cooldown prueft innerhalb von 7 Tagen:
  - Gewichtsdifferenz kleiner 1 kg.
  - Faktor unveraendert.
  - bei Auto: `stageUnchanged`.
  - bei Doctor-Lock: `doctorLock || stageUnchanged`.
- Aktuell wird `ckdStage` vor dem Cooldown auf `G1` defaulted.

Risiko:

- Ein Lab-Event ohne CKD-Stufe kann `ckdStage = G1` erzeugen.
- Wenn vorher `protein_ckd_stage_g = G3a` war, wird `stageUnchanged = false`.
- Dadurch kann der Cooldown unnoetig nicht greifen und ein falscher `G1`-Write passieren.

S4-Vorgabe:

- `stageUnchanged` darf nur gegen eine normalisierte, valide aufgeloeste CKD-Stufe pruefen.
- Profil-Fallback muss vor der Cooldown-Entscheidung stehen.
- Wenn CKD bei Auto `missing` ist, muss vor Zielbereich und vor Update geskippt werden.
- Bei Doctor-Lock darf der Cooldown weiterhin ueber `doctorLock` greifen, auch wenn CKD `missing` ist, solange Gewicht und Doctor-Faktor unveraendert sind.

#### S3.2 Doctor-Lock-Risiko

Ist-Zustand:

- Doctor-Lock nutzt `protein_doctor_factor` als `factor_current`.
- Der Zielbereich wird aus Doctor-Faktor und Gewicht berechnet.
- Trotzdem werden aktuell `protein_ckd_stage_g` und `protein_ckd_factor` immer geschrieben.

Risiko:

- Doctor-Lock schuetzt den Zielbereich, aber nicht automatisch die CKD-Metadaten.
- Bei fehlender CKD wuerde aktuell trotzdem `G1` und Faktor `1.00` persistiert.
- Wenn CKD komplett `missing` ist, darf auch `factor_auto` nicht aus einem erfundenen CKD-Faktor berechnet werden.

S4-Vorgabe:

- Doctor-Lock mit ungueltigem oder fehlendem Doctor-Faktor bleibt unveraendert `doctor_factor_missing`.
- Doctor-Lock mit validem Doctor-Faktor:
  - Zielbereich bleibt Doctor-Faktor-basiert.
  - `protein_factor_current` darf Doctor-Faktor schreiben.
  - `protein_factor_pre_ckd` darf weiter geschrieben werden, weil er CKD-unabhaengig ist.
  - `protein_ckd_stage_g` und `protein_ckd_factor` duerfen nur bei valide aufgeloester CKD geschrieben werden.
  - `factor_auto` darf bei CKD `missing` in der Response `null` sein oder ausgelassen werden; es darf nicht aus `G1` abgeleitet werden.

#### S3.3 Scheduler-Risiko

Ist-Zustand:

- GitHub Workflow sendet `{"trigger":"scheduler"}` ohne `weight_kg`.
- Edge Function zieht dann das letzte Body-Gewicht aus `health_events`.
- Wenn kein Gewicht gefunden wird, bleibt das bestehende `weight_kg fehlt oder ist ungueltig.`-Verhalten erhalten.

Risiko:

- Scheduler ist ein schreibender, automatischer Pfad.
- Ohne CKD-Fix kann ein Wochenlauf einen falschen `G1`-Zustand schreiben.
- Workflow nutzt `curl -sS` ohne `--fail-with-body`; das ist ein bekanntes Follow-up, aber nicht S4-Scope.

S4-Vorgabe:

- Scheduler-Gewichts-Fallback bleibt unveraendert.
- Scheduler-Auto ohne CKD muss mit `ok: true`, `skipped: true`, `reason: "ckd_stage_missing"` enden.
- In diesem Skip-Fall darf kein `user_profile`-Update passieren.
- Doctor-Lock-Scheduler mit validem Doctor-Faktor darf Zielbereich schreiben, aber keine CKD-Stufe erfinden.

#### S3.4 Typ-Hygiene

Ist-Zustand:

- `ProteinTargetInput.weight_kg` ist als `number | null` typisiert.
- `normalizeInput(...)` akzeptiert runtime bereits `number` und `string`.

Risiko:

- Kein akuter Runtime-Bug, aber der Type beschreibt den Contract ungenau.
- Ein spaeter strengerer Type-Check kann daraus ein vermeidbares Finding machen.

S4-Vorgabe:

- Typ zu `weight_kg?: number | string | null` erweitern.
- Keine Aenderung am bestehenden Parsing-Verhalten.
- Kein neuer Frontend-Contract noetig; Frontend sendet weiter numerisch.

#### S3.5 Diagnose-/Response-Metadaten

Ist-Zustand:

- Erfolg liefert `computed.ckd_stage_g` und `computed.ckd_factor`.
- Cooldown-Skip liefert keine CKD-Diagnose.
- Doctor-Faktor-Skip liefert keine CKD-Diagnose.

Risiko:

- Ohne Diagnose ist spaeter schwer zu pruefen, ob Lab, Profil oder Missing verwendet wurde.
- Ein DB-Schema-Feld waere zu gross fuer diesen Fix.

S4-Vorgabe:

- Response darf ein nicht persistiertes Diagnosefeld enthalten:
  - `ckd_source: "lab" | "profile" | "missing"`
- Erfolg:
  - `computed.ckd_source` aufnehmen.
  - `computed.ckd_stage_g` und `computed.ckd_factor` nur valide Werte oder `null`.
- Skip wegen fehlender CKD:
  - `reason: "ckd_stage_missing"`.
  - `ckd_source: "missing"`.
- Cooldown-Skip:
  - `ckd_source` aufnehmen, wenn ohne groben Umbau verfuegbar.
- Kein neues DB-Feld.
- Keine UI-Aenderung.

#### S3.6 Contract Review

Review-Frage:

- Reicht S3 aus, damit S4 ohne offene Bruchrisiken in `index.ts` starten kann?

Entscheidung:

- Ja, mit den unten korrigierten S4-Pflichten.

Contract-Findings:

- PRO-S3-CR-F1: S3 musste explizit festlegen, dass `ckdFactorFor(...)` bei `missing` nicht mit einem erfundenen Wert aufgerufen wird.
- PRO-S3-CR-F2: S3 musste klaeren, wie Doctor-Lock bei `missing` mit `factor_auto` in der Response umgeht.
- PRO-S3-CR-F3: S3 musste klarstellen, dass Auto-`missing` vor jedem Update skipped.
- PRO-S3-CR-F4: S3 musste Scheduler-Verhalten von Workflow-Haertung trennen.
- PRO-S3-CR-F5: S3 musste Diagnose-Metadaten als nicht-persistierte Response-Diagnostik begrenzen.

Korrekturen aus dem Contract Review:

- PRO-S3-CR-F1 korrigiert:
  - S4 muss CKD-Resolution, Auto-Skip und Doctor-Lock-Branch vor `ckdFactorFor(...)` sauber trennen.
- PRO-S3-CR-F2 korrigiert:
  - `factor_auto` darf bei Doctor-Lock und CKD `missing` `null` sein oder ausgelassen werden.
- PRO-S3-CR-F3 korrigiert:
  - Auto-`missing` ist ein Skip ohne `user_profile`-Update.
- PRO-S3-CR-F4 korrigiert:
  - Scheduler-Gewichtslogik bleibt Scope, `curl --fail-with-body` bleibt Watchlist.
- PRO-S3-CR-F5 korrigiert:
  - `ckd_source` ist Response-Diagnostik, kein Schema- oder UI-Feld.

Doku-Sync-Entscheidung:

- Noch keine Aenderung an `docs/modules/Protein Module Overview.md` oder `docs/QA_CHECKS.md`.
- Die S3-Erkenntnisse werden in S6 in Doku/QA uebernommen, nachdem S4/S5 geprueft sind.

S3 Exit:

- Erfuellt.
- S4 kann starten, wenn die Umsetzung folgende Reihenfolge einhaelt:
  - Profil validieren.
  - CKD aus Lab/Profile aufloesen.
  - Auto bei `missing` vor Update skippen.
  - Doctor-Lock bei `missing` ohne CKD-Metadaten weiterrechnen.
  - CKD-Faktor nur bei valider CKD-Stufe berechnen.
  - Update-Payload CKD-Felder nur bei valider CKD befuellen.

S3 Schritt-Abnahme und Commit-Empfehlung:

- Abnahme: S3 abgeschlossen.
- Commit: sinnvoller Zwischencommit waere jetzt moeglich; pragmatischer bleibt ein Commit nach S4/S5 oder nach komplettem Fix.

## S4 - Umsetzung in `index.ts`

Ziel:

- Findings eng in der Edge Function korrigieren.

Substeps:

- S4.1 Baseline pruefen:
  - `deno check` vor Codeaenderung.
  - `rg`-Scan fuer `|| "G1"` und CKD-Schreibpfade.
- S4.2 `profileRow` vor CKD-Aufloesung validieren.
- S4.3 CKD-Aufloesung implementieren:
  - `parseCkdStage(lab)`
  - fallback `parseCkdStage(profileRow.protein_ckd_stage_g || "")`
  - kein stiller `G1`-Fallback
  - bei fehlender CKD und Auto-Berechnung vor jedem Update skippen
  - Doctor-Lock bei fehlender CKD mit Doctor-Faktor erlauben, aber CKD-Felder nicht schreiben
  - `ckdFactorFor(...)` nur mit valider CKD-Stufe aufrufen.
- S4.4 Typ-Hygiene:
  - `weight_kg?: number | string | null`.
- S4.5 Optionales Diagnosefeld:
  - `ckd_source: "lab" | "profile" | "missing"` im Response-Block, falls ohne Contract-Drift sinnvoll.
  - kein neues DB- oder UI-Feld.
- S4.6 Kein `minFactor`- oder Faktorformel-Umbau.
- S4.7 Code Review und Contract Review S4.

Exit-Kriterium:

- `index.ts` enthaelt keinen stillen `G1`-Fallback mehr und bleibt formelgleich.

### S4.1 Ergebnisprotokoll 31.05.2026

Durchgefuehrt:

- `deno check backend/supabase/functions/midas-protein-targets/index.ts`
- `rg`-Scan fuer:
  - `|| "G1"`
  - `parseCkdStage`
  - `ckdFactorFor`
  - `protein_ckd_stage_g`
  - `protein_ckd_factor`
  - `updatePayload`
  - `doctorLock`
  - `stageUnchanged`
  - `minFactor`
  - `activityLevelFor`
- `rg`-Scan fuer `weight_kg`-Typ und Runtime-String-Toleranz.
- Diff-Check gegen `backend/supabase/functions/midas-protein-targets/index.ts`.

Check-Ergebnis:

- `deno check`: gruen.
- Kein Produktcode-Diff in `backend/supabase/functions/midas-protein-targets/index.ts` vor S4.2.
- Baseline ist syntaktisch stabil; die Findings sind Contract-/Runtime-Findings, keine aktuellen Type-Blocker.

Baseline-Findings:

- PRO-S4.1-F1: Stiller `G1`-Fallback ist vorhanden.
  - Fundstelle: `const ckdStage = parseCkdStage(ckdStageRaw) || "G1";`
  - Folge: fehlende Lab-CKD wird als `G1` interpretiert.
  - Korrekturpfad: S4.2/S4.3.
- PRO-S4.1-F2: `ckdFactorFor(...)` wird direkt nach dem Default aufgerufen.
  - Folge: bei fehlender CKD wird Faktor `1.00` fuer `G1` berechnet.
  - Korrekturpfad: S4.3 muss `missing` vor Faktorberechnung behandeln.
- PRO-S4.1-F3: `profileRow` wird erst nach der aktuellen CKD-Aufloesung validiert.
  - Folge: `profileRow.protein_ckd_stage_g` kann in der aktuellen Struktur nicht als sauberer Fallback dienen.
  - Korrekturpfad: S4.2.
- PRO-S4.1-F4: Cooldown prueft `prevStage === ckdStage` gegen den bereits defaulteten Wert.
  - Folge: ein fehlender Lab-Wert kann `G3a` -> `G1` als scheinbare Aenderung behandeln.
  - Korrekturpfad: S4.3/S4.5 Review.
- PRO-S4.1-F5: CKD-Felder werden im `updatePayload` immer geschrieben.
  - Fundstellen: `protein_ckd_stage_g: ckdStage`, `protein_ckd_factor: ckdFactor`.
  - Folge: auch Doctor-Lock kann falsche CKD-Metadaten persistieren.
  - Korrekturpfad: S4.3.
- PRO-S4.1-F6: `weight_kg` akzeptiert runtime Strings, der Input-Type sagt aber nur `number | null`.
  - Folge: Typ-Hygiene-Finding ohne akuten Runtime-Blocker.
  - Korrekturpfad: S4.4.
- PRO-S4.1-F7: `minFactor`, Activity-Schwellen und CKD-Faktoren sind klar lokalisierbar und duerfen nicht mitgeaendert werden.
  - Korrekturpfad: S4.6/S5-Scans.

Code Review S4.1:

- Positiv:
  - Auth/User-Grenze bleibt mit `.eq("user_id", userId)` konsistent.
  - Scheduler-Gewichts-Fallback ist isoliert vor `normalizeInput`.
  - `parseCkdStage(...)` kann kombinierte Werte wie `G3a A1` auf die G-Stufe reduzieren.
  - `deno check` ist vor Codeaenderung gruen.
- Kritisch:
  - Die aktuelle Reihenfolge koppelt CKD-Default, CKD-Faktor, Auto-Faktor, Cooldown und Update-Payload zu frueh.
  - S4.3 muss deshalb nicht nur eine Zeile ersetzen, sondern den Kontrollfluss fuer `lab`, `profile` und `missing` sauber trennen.

Contract Review S4.1:

- Review-Frage:
  - Ist die Baseline stabil genug und sind die Findings eng genug auf S4.2-S4.5 abbildbar?
- Entscheidung:
  - Ja.
  - Keine zusaetzlichen Scope-Erweiterungen noetig.
  - Kein Code-Fix in S4.1, weil S4.1 explizit Baseline und Lokalisierung ist.

Contract-Findings:

- PRO-S4.1-CR-F1: S4.1 musste klar festhalten, dass `deno check` gruen ist und der Bug deshalb kein Syntax-/Type-Blocker ist.
- PRO-S4.1-CR-F2: S4.1 musste `ckdFactorFor(...)` als Teil des Kontrollflussrisikos markieren, nicht nur `|| "G1"`.
- PRO-S4.1-CR-F3: S4.1 musste jedes Baseline-Finding einem konkreten S4-Folgeschritt zuordnen.
- PRO-S4.1-CR-F4: S4.1 musste klarstellen, dass in diesem Substep kein Produktcode geaendert wird.

Korrekturen aus dem Contract Review:

- PRO-S4.1-CR-F1 korrigiert:
  - Check-Ergebnis dokumentiert `deno check` als gruen.
- PRO-S4.1-CR-F2 korrigiert:
  - PRO-S4.1-F2 dokumentiert `ckdFactorFor(...)` als eigenes Risiko.
- PRO-S4.1-CR-F3 korrigiert:
  - Jedes Baseline-Finding enthaelt einen Korrekturpfad.
- PRO-S4.1-CR-F4 korrigiert:
  - S4.1 dokumentiert ausdruecklich keinen Produktcode-Diff.

S4.1 Exit:

- Erfuellt.
- S4.2 kann mit der Profilvalidierung vor der CKD-Aufloesung starten.

### S4.2 Ergebnisprotokoll 31.05.2026

Ziel:

- `profileRow` vor der CKD-Aufloesung validieren, damit S4.3 den Profilwert `protein_ckd_stage_g` als Fallback nutzen kann.

Umsetzung:

- `const profileRow = profile as ProfileRow | null` direkt nach dem Profil-Select gesetzt.
- Fehlendes Profil wird direkt nach `profileErr` mit `Profil fehlt (user_profile).` abgebrochen.
- Die alte Profilvalidierung nach der aktuellen CKD-Aufloesung wurde entfernt.

Code-Diff:

- Geaendert:
  - `backend/supabase/functions/midas-protein-targets/index.ts`
- Nicht geaendert:
  - CKD-Aufloesung
  - `parseCkdStage(ckdStageRaw) || "G1"`
  - `ckdFactorFor(...)`
  - Doctor-Lock-Logik
  - Cooldown-Logik
  - Formel, CKD-Faktoren, Activity-Schwellen, `minFactor`

Checks:

- `deno check backend/supabase/functions/midas-protein-targets/index.ts`
  - Ergebnis: gruen.

Code Review S4.2:

- Ergebnis: kein neues Code-Finding.
- Die Aenderung ist eng begrenzt und macht `profileRow` fuer S4.3 vor der CKD-Aufloesung verfuegbar.
- Das Fehlerverhalten bei fehlendem Profil bleibt fachlich gleich, bricht aber frueher ab und vermeidet unnoetige Activity-/Lab-Reads.
- Der bekannte `G1`-Fallback bleibt bewusst offen, weil er erst in S4.3 ersetzt wird.

Contract Review S4.2:

- Review-Frage:
  - Erfuellt S4.2 die Roadmap-Pflicht, ohne den eigentlichen CKD-Fallback vorzugreifen?
- Entscheidung:
  - Ja.
  - `profileRow.protein_ckd_stage_g` ist nun fuer S4.3 vor der CKD-Aufloesung verfuegbar.
  - Es wurde kein neuer Fallback, kein neuer Default und keine Formel-Aenderung eingefuehrt.

Contract-Findings:

- PRO-S4.2-CR-F1: S4.2 musste klar dokumentieren, dass der `G1`-Fallback absichtlich noch nicht entfernt wurde.
- PRO-S4.2-CR-F2: S4.2 musste pruefen, ob die fruehere Profilvalidierung ein unerwuenschtes Verhalten aendert.

Korrekturen aus dem Contract Review:

- PRO-S4.2-CR-F1 korrigiert:
  - Code-Diff und Code Review markieren den `G1`-Fallback als bewusst offen fuer S4.3.
- PRO-S4.2-CR-F2 korrigiert:
  - Code Review dokumentiert, dass der Fehler bei fehlendem Profil gleich bleibt, aber frueher aussteigt.

S4.2 Exit:

- Erfuellt.
- S4.3 kann die CKD-Aufloesung mit `Lab > Profil > Missing` implementieren.

### S4.3 Ergebnisprotokoll 31.05.2026

Ziel:

- CKD-Aufloesung auf `Lab > Profil > Missing` umstellen.
- Stillen `G1`-Fallback entfernen.
- Auto-Berechnung bei fehlender CKD vor jedem `user_profile`-Update skippen.
- Doctor-Lock bei fehlender CKD mit Doctor-Faktor erlauben, aber keine CKD-Felder erfinden.

Umsetzung:

- Lab-CKD wird separat geparst:
  - `const ckdStageLab = parseCkdStage(ckdStageRaw)`
- Profil-Fallback wird separat geparst:
  - `const ckdStageProfile = parseCkdStage(profileRow.protein_ckd_stage_g || "")`
- Effektive CKD-Stufe:
  - `const ckdStage = ckdStageLab || ckdStageProfile`
- Diagnosequelle:
  - `ckdSource = "lab" | "profile" | "missing"`
- CKD-Faktor:
  - wird nur berechnet, wenn `ckdStage` valide ist.
  - bei `missing` bleibt `ckdFactor = null`.
- Auto ohne CKD:
  - returns `ok: true`, `skipped: true`, `reason: "ckd_stage_missing"`.
  - kein `user_profile`-Update.
- Doctor-Lock:
  - validiert Doctor-Faktor unveraendert.
  - nutzt bei validem Doctor-Faktor weiterhin den Doctor-Faktor fuer `factor_current`.
  - darf bei CKD `missing` Zielbereich schreiben.
  - schreibt CKD-Felder nur, wenn eine valide CKD-Stufe vorhanden ist.
- Cooldown:
  - `stageUnchanged` prueft nur noch gegen eine valide aufgeloeste CKD-Stufe.
  - Cooldown-Response enthaelt `ckd_source`.
- Update-Payload:
  - `protein_ckd_stage_g` und `protein_ckd_factor` werden nur gesetzt, wenn `ckdStage` und `ckdFactor` valide sind.

Checks:

- `deno check backend/supabase/functions/midas-protein-targets/index.ts`
  - Ergebnis: gruen.
- `git diff --check -- backend/supabase/functions/midas-protein-targets/index.ts`
  - Ergebnis: sauber.
- `rg`-Scan:
  - kein `|| "G1"` mehr in `index.ts`.
  - `G1` kommt nur noch in der CKD-Faktor-Switch-Tabelle vor.
  - `minFactor`, Activity-Schwellen und CKD-Faktorwerte bleiben unveraendert.

Code Review S4.3:

- Ergebnis: keine offenen Code-Findings.
- Der eigentliche `G1`-Bug ist entfernt.
- `ckdFactorFor(...)` wird nicht mehr mit einem erfundenen Default aufgerufen.
- Auto-`missing` kann kein `user_profile`-Update mehr schreiben.
- Doctor-Lock bleibt Zielbereich-Source-of-Truth.
- CKD-Metadaten werden nicht mehr bedingungslos geschrieben.

Code-Findings und Korrektur:

- PRO-S4.3-CODE-F1: Zwei neue Zuweisungen waren zu lang und der bestehende Cooldown-Return war im beruehrten Block schlecht eingerueckt.
  - Korrektur: Zeilen umbrochen und Cooldown-Return sauber eingerueckt.
  - Re-Check: `deno check` und `git diff --check` gruen.

Contract Review S4.3:

- Review-Frage:
  - Erfuellt S4.3 den Vertrag aus S2/S3, ohne Formel, Faktoren, Activity oder UI zu verschieben?
- Entscheidung:
  - Ja.

Contract-Abgleich:

- `G1` weiterverwenden:
  - abgelehnt und entfernt.
- hardcoded `G3a`:
  - nicht eingefuehrt.
- `Lab > Profil > Missing`:
  - umgesetzt.
- Auto bei `missing`:
  - skipped ohne Update.
- Doctor-Lock bei `missing`:
  - Zielbereich mit Doctor-Faktor erlaubt.
  - CKD-Felder werden nicht neu geschrieben.
- Formel:
  - `targetMax = weight_kg * factorCurrent` bleibt unveraendert.
  - `targetMin = weight_kg * (factorCurrent - 0.1)` bleibt unveraendert.
- Scope:
  - keine SQL-/RLS-/Schema-Aenderung.
  - keine UI-Aenderung.
  - kein Deploy.
  - keine GitHub-Workflow-Aenderung.

Contract-Findings:

- PRO-S4.3-CR-F1: S4.3 musste belegen, dass `G1` nicht durch einen anderen hardcoded Default ersetzt wurde.
- PRO-S4.3-CR-F2: S4.3 musste pruefen, dass Doctor-Lock bei CKD `missing` keine CKD-Felder schreibt.
- PRO-S4.3-CR-F3: S4.3 musste festhalten, dass die Response-Diagnose `ckd_source` kein DB-/UI-Vertrag ist.
- PRO-S4.3-CR-F4: S4.3 musste pruefen, dass `minFactor`, Activity und CKD-Faktorwerte unveraendert bleiben.

Korrekturen aus dem Contract Review:

- PRO-S4.3-CR-F1 korrigiert:
  - `rg`-Scan dokumentiert keinen `|| "G1"`-Default; kein `G3a`-Default eingefuehrt.
- PRO-S4.3-CR-F2 korrigiert:
  - Update-Payload schreibt CKD-Felder nur bei valider CKD.
- PRO-S4.3-CR-F3 korrigiert:
  - `ckd_source` ist in S4.3 als Response-Diagnostik dokumentiert; kein Persistenzfeld.
- PRO-S4.3-CR-F4 korrigiert:
  - Checkliste dokumentiert unveraenderte Formel-/Faktor-/Activity-Bereiche.

S4.3 Exit:

- Erfuellt.
- S4.4 kann mit der `weight_kg`-Typ-Hygiene starten.

### S4.4 Ergebnisprotokoll 31.05.2026

Ziel:

- `ProteinTargetInput.weight_kg` an das bestehende Runtime-Verhalten anpassen.

Umsetzung:

- `weight_kg?: number | null` wurde zu `weight_kg?: number | string | null`.
- `normalizeInput(...)` bleibt unveraendert:
  - `number` wird direkt verwendet.
  - `string` wird per `Number(...)` geparst.
  - ungueltige Werte erzeugen weiterhin `weight_kg fehlt oder ist ungueltig.`

Checks:

- `deno check backend/supabase/functions/midas-protein-targets/index.ts`
  - Ergebnis: gruen.

Code Review S4.4:

- Ergebnis: kein offenes Code-Finding.
- Die Aenderung ist reine Type-Hygiene.
- Kein neuer Request-Contract wird eingefuehrt; der vorhandene Runtime-Code hat Strings bereits akzeptiert.
- Frontend-Body-Save sendet weiterhin numerische Werte.

Contract Review S4.4:

- Review-Frage:
  - Beschreibt der Type jetzt das bestehende Verhalten, ohne Parsing, Formel oder Scheduler-Contract zu veraendern?
- Entscheidung:
  - Ja.

Contract-Findings:

- PRO-S4.4-CR-F1: S4.4 musste klarstellen, dass String-Akzeptanz nicht neu eingefuehrt, sondern nur typisiert wird.
- PRO-S4.4-CR-F2: S4.4 musste pruefen, dass kein Frontend- oder Scheduler-Vertrag geaendert wird.

Korrekturen aus dem Contract Review:

- PRO-S4.4-CR-F1 korrigiert:
  - Umsetzung dokumentiert, dass `normalizeInput(...)` unveraendert bleibt.
- PRO-S4.4-CR-F2 korrigiert:
  - Code Review dokumentiert numerisches Frontend-Verhalten und unveraenderten Scheduler-Contract.

S4.4 Exit:

- Erfuellt.
- S4.5 kann die optionale Response-Diagnostik abschliessend reviewen.

### S4.5 Ergebnisprotokoll 31.05.2026

Ziel:

- `ckd_source` als nicht-persistierte Diagnose in sinnvollen Response-Pfaden bereitstellen.
- Keine DB-, UI- oder Formel-Aenderung.

Umsetzung:

- Bereits aus S4.3 vorhanden:
  - Auto-`missing` Skip:
    - `reason: "ckd_stage_missing"`
    - `ckd_source: "missing"`
  - Cooldown-Skip:
    - `ckd_source`
  - Success-Response:
    - `computed.ckd_source`
- In S4.5 ergaenzt:
  - Doctor-Faktor-Skip:
    - `reason: "doctor_factor_missing"`
    - `ckd_source`

Nicht umgesetzt:

- Kein neues DB-Feld.
- Kein neues UI-Feld.
- Kein `updatePayload.ckd_source`.
- Keine Aenderung am Response-Statuscode.
- Keine Aenderung an Berechnung, Cooldown-Entscheidung oder Doctor-Lock-Logik.

Checks:

- `deno check backend/supabase/functions/midas-protein-targets/index.ts`
  - Ergebnis: gruen.
- `git diff --check -- backend/supabase/functions/midas-protein-targets/index.ts`
  - Ergebnis: sauber.
- `rg`-Review:
  - `ckd_source` existiert in:
    - `doctor_factor_missing`
    - `ckd_stage_missing`
    - `cooldown_unchanged`
    - `computed`
  - `ckd_source` existiert nicht als persistiertes `updatePayload`-Feld.

Code Review S4.5:

- Ergebnis: kein offenes Code-Finding.
- Die Diagnose wird erst nach CKD-Aufloesung genutzt und bleibt dadurch konsistent.
- Doctor-Faktor-Skip bekommt nun dieselbe CKD-Herkunftsinformation wie die anderen kontrollierten Response-Pfade.
- Keine Exception-/Error-Responses wurden erweitert, weil dort keine kontrollierte Fachentscheidung zur CKD-Quelle kommuniziert wird.

Code-Findings und Korrektur:

- PRO-S4.5-CODE-F1: `doctor_factor_missing` hatte nach S4.3 bereits Zugriff auf `ckdSource`, gab ihn aber noch nicht aus.
  - Korrektur: `ckd_source: ckdSource` in den `doctor_factor_missing` Response aufgenommen.
  - Re-Check: `deno check` und `git diff --check` gruen.

Contract Review S4.5:

- Review-Frage:
  - Bleibt `ckd_source` reine Response-Diagnostik, ohne Persistenz-, UI- oder medizinischen Contract zu verschieben?
- Entscheidung:
  - Ja.

Contract-Abgleich:

- `ckd_source` ist nur Response-Metadatum.
- `ckd_source` wird nicht gespeichert.
- `ckd_source` erzeugt keine neue User-facing UI.
- `ckd_source` aendert keine Zielbereichsberechnung.
- `ckd_source` aendert keine Skip-Entscheidung.

Contract-Findings:

- PRO-S4.5-CR-F1: S4.5 musste pruefen, dass `ckd_source` nicht in `updatePayload` landet.
- PRO-S4.5-CR-F2: S4.5 musste klaeren, ob Doctor-Faktor-Skip ebenfalls Diagnose tragen soll.
- PRO-S4.5-CR-F3: S4.5 musste Fehler-Responses bewusst ausklammern.

Korrekturen aus dem Contract Review:

- PRO-S4.5-CR-F1 korrigiert:
  - `rg`-Review und Nicht-Umsetzung dokumentieren kein persistiertes `ckd_source`.
- PRO-S4.5-CR-F2 korrigiert:
  - Doctor-Faktor-Skip wurde um `ckd_source` ergaenzt.
- PRO-S4.5-CR-F3 korrigiert:
  - Code Review dokumentiert, dass Exception-/Error-Responses nicht erweitert werden.

S4.5 Exit:

- Erfuellt.
- S4.6 kann den No-Change-Review fuer `minFactor` und Formel/Faktoren abschliessen.

### S4.6 Ergebnisprotokoll 31.05.2026

Ziel:

- Sicherstellen, dass `minFactor`, Zielbereichsformel, CKD-Faktorwerte, Age-Basis und Activity-Schwellen nicht nebenbei veraendert wurden.

Umsetzung:

- Keine weitere Codeaenderung in S4.6.
- S4.6 ist ein expliziter No-Change-Review gegen den S2/S3-Vertrag.

Gepruefte Codepunkte:

- CKD-Faktoren:
  - `G1 = 1.0`
  - `G2 = 0.95`
  - `G3a = 0.9`
  - `G3b = 0.85`
  - `G4 = 0.75`
  - `G5 = 0.65`
- Age-Basis:
  - Altersgrenzen und Werte bleiben unveraendert.
- Activity-Schwellen:
  - `score >= 6` -> `ACT3`, `+0.3`
  - `score >= 2` -> `ACT2`, `+0.2`
  - sonst `ACT1`, `+0.1`
- Formel:
  - `factorPreCkd = roundTo(ageBase + activityMeta.modifier, 2)`
  - Auto mit valider CKD: `factorAuto = roundTo(factorPreCkd * ckdFactor, 2)`
  - Doctor-Lock: `factorCurrent = doctorFactor`
  - Auto: `factorCurrent = factorAuto`
  - `targetMax = Math.round(weight_kg * factorCurrent)`
  - `targetMin = Math.round(weight_kg * roundTo(factorCurrent - 0.1, 2))`

S4.6-Befund:

- Die Formel ist fachlich unveraendert.
- `minFactor` bleibt `factorCurrent - 0.1`.
- CKD-Faktorwerte sind unveraendert.
- Activity-Schwellen sind unveraendert.
- Der einzige fachliche Unterschied aus S4.3 bleibt der Guard:
  - Auto rechnet nur noch mit valider CKD.
  - Doctor-Lock kann ohne CKD weiter mit Doctor-Faktor rechnen.

Checks:

- `deno check backend/supabase/functions/midas-protein-targets/index.ts`
  - Ergebnis: gruen.
- `rg`-Review fuer:
  - `ckdFactorFor`
  - `activityLevelFor`
  - `score >=`
  - `factorPreCkd`
  - `factorAuto`
  - `factorCurrent`
  - `minFactor`
  - `targetMax`
  - `targetMin`
  - Ergebnis: keine unerwarteten Formel-/Faktor-/Activity-Aenderungen.

Code Review S4.6:

- Ergebnis: kein offenes Code-Finding.
- Die S4.3-Aenderung hat den Input-Guard vor die Formel gesetzt, aber nicht die Formel selbst veraendert.
- Der zuvor markierte `factorAuto`-Kontrollfluss wurde in S4.7 durch einen expliziten `factorCurrent === null` Guard abgesichert.

Contract Review S4.6:

- Review-Frage:
  - Bleibt der Fix innerhalb des CKD-Fallback-Vertrags, ohne die Protein-Formel oder Grenzwerte zu veraendern?
- Entscheidung:
  - Ja.

Contract-Findings:

- PRO-S4.6-CR-F1: S4.6 musste ausdruecklich als No-Change-Review dokumentiert werden, damit keine fehlende Umsetzung missverstanden wird.
- PRO-S4.6-CR-F2: S4.6 musste festhalten, dass der Auto-Guard kein Formelumbau ist.
- PRO-S4.6-CR-F3: S4.6 musste den `factorAuto`-Kontrollfluss als Abschlussreview-Punkt markieren.

Korrekturen aus dem Contract Review:

- PRO-S4.6-CR-F1 korrigiert:
  - Umsetzung dokumentiert "Keine weitere Codeaenderung in S4.6".
- PRO-S4.6-CR-F2 korrigiert:
  - S4.6-Befund trennt Formel von CKD-Input-Guard.
- PRO-S4.6-CR-F3 korrigiert:
  - Code Review markierte den Kontrollfluss; S4.7 hat ihn durch einen expliziten Guard bereinigt.

S4.6 Exit:

- Erfuellt.
- S4.7 kann den abschliessenden S4-Code- und Contract-Review durchfuehren.

### S4.7 Ergebnisprotokoll 31.05.2026

Ziel:

- Gesamten S4-Code-Diff reviewen.
- Contract gegen S2/S3 pruefen.
- Offene S4-Review-Findings korrigieren.
- S4 bei sauberem Ergebnis abschliessen.

Durchgefuehrt:

- `deno check backend/supabase/functions/midas-protein-targets/index.ts`
- `git diff --check -- backend/supabase/functions/midas-protein-targets/index.ts docs/MIDAS Protein Targets CKD Fallback Roadmap.md`
- Fokus-Scans fuer:
  - `|| "G1"`
  - `parseCkdStage`
  - `ckdFactorFor`
  - `ckd_stage_missing`
  - `doctor_factor_missing`
  - `cooldown_unchanged`
  - `ckd_source`
  - `factorAuto`
  - `factorCurrent`
  - `protein_ckd_stage_g`
  - `protein_ckd_factor`
  - `updatePayload`
  - `minFactor`
  - `activityLevelFor`

S4 Gesamtbefund:

- `G1` wird nicht mehr als stiller Default verwendet.
- CKD-Aufloesung ist:
  - Lab
  - Profil
  - Missing
- Auto-`missing` skipped ohne `user_profile`-Update.
- Doctor-Lock mit validem Doctor-Faktor kann ohne CKD weiterrechnen.
- CKD-Felder werden nur bei valider CKD geschrieben.
- `ckd_source` bleibt reine Response-Diagnostik.
- `weight_kg` Typ beschreibt nun das bestehende Runtime-Verhalten.
- Formel, `minFactor`, CKD-Faktorwerte, Age-Basis und Activity-Schwellen bleiben unveraendert.

Code-Findings und Korrektur:

- PRO-S4.7-CODE-F1: Auto-`missing` wurde vor der bestehenden `birth_date`-Validierung geskippt.
  - Risiko: Ein fehlendes `birth_date` waere bei CKD `missing` nicht mehr sichtbar geworden.
  - Korrektur: Auto-`missing`-Skip nach `birth_date`- und `ageYears`-Validierung verschoben.
  - Ergebnis: bestehende Profilvalidierung bleibt sichtbar; Auto-`missing` schreibt weiterhin nichts.
- PRO-S4.7-CODE-F2: `factorCurrent` nutzte einen abgesicherten, aber unnoetigen `factorAuto as number`-Cast.
  - Risiko: Kontrollfluss war fuer spaetere Reviews weniger explizit.
  - Korrektur: `factorCurrent` wird als `doctorFactor | factorAuto` gesetzt und danach mit `factorCurrent === null` defensiv geprueft.
  - Ergebnis: kein Cast mehr, kein Formel- oder Contract-Drift.

Re-Check nach Korrektur:

- `deno check`: gruen.
- `git diff --check`: sauber.
- Fokus-Scan:
  - kein `|| "G1"` in `index.ts`.
  - kein `factorAuto as number` oder `doctorFactor as number`.
  - `ckd_source` nicht im `updatePayload`.
  - `minFactor` bleibt `factorCurrent - 0.1`.
  - Activity-Schwellen bleiben `>= 6` und `>= 2`.

Code Review S4.7:

- Ergebnis: keine offenen Code-Findings.
- Kontrollfluss ist jetzt:
  - Auth/User
  - Gewicht
  - Profilvalidierung
  - Activity-/Lab-Read
  - CKD-Aufloesung
  - Doctor-Faktor-Validierung
  - Birthdate-/Age-Validierung
  - Auto-`missing` Skip
  - Faktor-/Target-Berechnung
  - Cooldown
  - bedingter Update-Payload
- Keine neuen DB-Schreibpfade ausserhalb `user_profile`.
- Keine neue Tabelle, kein neues Feld, keine SQL-Aenderung.

Contract Review S4.7:

- Review-Frage:
  - Erfuellt S4 vollstaendig den Roadmap-Vertrag, ohne Out-of-Scope-Arbeit einzuschleppen?
- Entscheidung:
  - Ja.

Contract-Abgleich:

- Scope eingehalten:
  - nur `backend/supabase/functions/midas-protein-targets/index.ts` als Produktcode geaendert.
  - Roadmap dokumentiert.
- Nicht in Scope bleibt eingehalten:
  - keine SQL-/RLS-/Schema-Aenderung.
  - kein UI-/Assistant-/Intake-Umbau.
  - keine GitHub-Actions-Haertung.
  - kein Deploy.
  - kein Runtime-Smoke mit Schreibwirkung.
  - keine `minFactor`-/Doctor-Faktor-Range-Aenderung.
- Fachvertrag eingehalten:
  - `Lab > Profil > Missing`.
  - kein hardcoded `G3a`.
  - kein stiller `G1`.
  - Doctor-Lock bleibt hoheitlich.
  - Auto ohne CKD skipped konservativ.

Contract-Findings:

- PRO-S4.7-CR-F1: Auto-`missing` Skip durfte bestehende Profilvalidierung nicht verdecken.
- PRO-S4.7-CR-F2: Der abgesicherte Faktor-Cast sollte vor S4-Abschluss explizit aufgeloest werden.
- PRO-S4.7-CR-F3: S4 musste als abgeschlossen markiert werden, aber S5/S6 bleiben offen.

Korrekturen aus dem Contract Review:

- PRO-S4.7-CR-F1 korrigiert:
  - Auto-`missing` Skip liegt jetzt nach `birth_date`-/`ageYears`-Validierung.
- PRO-S4.7-CR-F2 korrigiert:
  - Expliziter `factorCurrent === null` Guard ersetzt den Cast.
- PRO-S4.7-CR-F3 korrigiert:
  - Statusmatrix setzt S4 auf `DONE`; S5 und S6 bleiben `TODO`.

S4 Exit:

- Erfuellt.
- Keine offenen S4-Code- oder Contract-Findings.
- S5 kann mit Gesamtchecks und Regression starten.

## S5 - Tests, Code Review und Contract Review

Ziel:

- Lokal pruefen, dass der Fix syntaktisch und vertraglich sauber ist.

Lokal ausfuehrbare Checks:

- S5.1 `deno check backend/supabase/functions/midas-protein-targets/index.ts`
- S5.2 `git diff --check`
- S5.3 `rg`-Scans:
  - kein `parseCkdStage(...) || "G1"`
  - keine Aenderung an CKD-Faktoren
  - keine Aenderung an Activity-Schwellen
  - keine Aenderung an `minFactor`
- S5.4 Code Review:
  - Auto-Fall
  - Profil-Fallback-Fall
  - fehlende CKD
  - Doctor-Lock
  - Cooldown
  - Scheduler
- S5.5 Contract Review gegen Protein Overview, diese Roadmap und Review-Aussagen.

Nicht automatisch ausfuehrbar ohne Freigabe:

- echter Edge Runtime-Smoke, weil `user_profile` geschrieben werden kann.
- Supabase Deploy.
- GitHub Workflow-Smoke.

Definierte Runtime-Smokes fuer spaeter:

- Latest lab hat `G3a A1`, Profil leer -> schreibt `G3a`.
- Latest lab ohne `ckd_stage`, Profil `G3a` -> bleibt `G3a`, kein `G1`.
- Latest lab ohne `ckd_stage`, Profil leer, Auto -> skipped `ckd_stage_missing`.
- Doctor-Lock aktiv, Profil `G3a`, latest lab leer -> Doctor-Ziele bleiben aus Doctor-Faktor; CKD-Metadaten werden nicht auf `G1` gesetzt.
- Doctor-Lock aktiv, Profil leer, latest lab leer -> Doctor-Ziele duerfen aus Doctor-Faktor entstehen; CKD-Metadaten bleiben unveraendert und werden nicht auf `G1` gesetzt.
- Cooldown bei unveraendertem Profil-Fallback skippt korrekt.

Exit-Kriterium:

- Keine offenen P0/P1-Findings nach lokalem Review.

### S5 Ergebnisprotokoll 31.05.2026

Status: DONE

#### S5.1 `deno check`

Command:

```text
deno check backend/supabase/functions/midas-protein-targets/index.ts
```

Ergebnis:

- gruen.
- Keine Type-/Syntax-/Import-Findings offen.

#### S5.2 `git diff --check`

Command:

```text
git diff --check -- backend/supabase/functions/midas-protein-targets/index.ts docs/MIDAS Protein Targets CKD Fallback Roadmap.md
```

Ergebnis:

- sauber.
- Keine Whitespace- oder Patch-Format-Findings.

#### S5.3 `rg`-Scans

Geprueft:

- kein `parseCkdStage(...) || "G1"`.
- kein `|| "G1"` in `index.ts`.
- CKD-Faktoren:
  - `G1 = 1.0`
  - `G2 = 0.95`
  - `G3a = 0.9`
  - `G3b = 0.85`
  - `G4 = 0.75`
  - `G5 = 0.65`
- Activity-Schwellen:
  - `score >= 6`
  - `score >= 2`
- `minFactor`:
  - `roundTo(factorCurrent - 0.1, 2)`
- Response-/Skip-Pfade:
  - `doctor_factor_missing`
  - `ckd_stage_missing`
  - `cooldown_unchanged`
- Persistenz:
  - kein `updatePayload.ckd_source`.

Ergebnis:

- Kein stiller `G1`-Default mehr.
- Faktorwerte, Activity-Schwellen und `minFactor` bleiben unveraendert.
- `ckd_source` bleibt nicht-persistierte Response-Diagnostik.

#### S5.4 Code Review

Auto-Fall:

- Wenn Lab-CKD valide ist:
  - `ckdStageLab` gewinnt.
  - `ckdFactorFor(ckdStage)` wird mit valider Stufe aufgerufen.
  - `factorAuto` wird wie bisher aus `factorPreCkd * ckdFactor` berechnet.
  - `protein_ckd_stage_g` und `protein_ckd_factor` werden geschrieben.
- Wenn Lab-CKD fehlt, aber Profil-CKD valide ist:
  - `ckdStageProfile` wird genutzt.
  - Kein `G1`-Reset.
  - Cooldown vergleicht gegen die normalisierte Profil-Stufe.
- Wenn Lab und Profil fehlen:
  - nach Profil-/Birthdate-/Age-Validierung `ckd_stage_missing`.
  - kein `user_profile`-Update.

Profil-Fallback-Fall:

- `profileRow` ist vor CKD-Aufloesung validiert.
- `profileRow.protein_ckd_stage_g` wird ueber `parseCkdStage(...)` normalisiert.
- Sichtbares Profil-CKD-Badge bleibt davon getrennt; es gibt keine UI-Aenderung.

Fehlende CKD:

- Auto:
  - skipped.
  - kein medizinischer Write.
- Doctor-Lock:
  - mit validem Doctor-Faktor erlaubt.
  - schreibt Zielbereich und Doctor-Felder.
  - schreibt keine CKD-Felder, wenn CKD `missing` ist.

Doctor-Lock:

- Fehlender/ungueltiger Doctor-Faktor bleibt `doctor_factor_missing`.
- Valider Doctor-Faktor bleibt Source of Truth fuer `factorCurrent`.
- CKD beeinflusst bei Doctor-Lock nicht den Zielbereich.

Cooldown:

- Auto-Cooldown kann nur ueber `stageUnchanged` gehen, wenn eine valide CKD-Stufe vorhanden ist.
- Doctor-Lock-Cooldown bleibt ueber `doctorLock` erlaubt.
- Cooldown-Response enthaelt `ckd_source`.

Scheduler:

- Scheduler ohne `weight_kg` zieht weiterhin das letzte Body-Gewicht.
- Scheduler-Auto ohne CKD skipped mit `ckd_stage_missing`.
- Kein Deploy oder GitHub-Workflow-Smoke in S5.

Code Review Ergebnis:

- Keine offenen Code-Findings.
- Die S4.7-Korrekturen haben die zwei relevanten Review-Findings bereits behoben:
  - Auto-`missing` verdeckt keine Birthdate-/Age-Validierung mehr.
  - `factorCurrent` nutzt keinen unnoetigen `factorAuto as number` Cast mehr.

#### S5.5 Contract Review

Gegen Protein Overview:

- Produktvertrag bleibt:
  - Doctor-Lock ist hoheitsmaessig.
  - `user_profile` bleibt Source of Truth fuer effektive Protein-Targets.
  - Assistant/Intake konsumieren Targets, rechnen nicht selbst.
- Dokumentarischer Drift erkannt:
  - Protein Overview nennt noch `Fallback G1`.
  - Known Risks nennen noch `CKD-Fallback (G1)`.
  - Das ist erwarteter S6-Scope, kein S5-Code-Finding.

Gegen diese Roadmap:

- S2-Vertrag erfuellt:
  - `Lab > Profil > Missing`.
  - kein `G1`-Default.
  - kein hardcoded `G3a`.
  - Auto-`missing` skipped.
  - Doctor-Lock mit validem Doctor-Faktor darf ohne CKD weiterrechnen.
- S3-Risiken geprueft:
  - Cooldown.
  - Doctor-Lock.
  - Scheduler.
  - Typ-Hygiene.
  - Response-Diagnostik.

Gegen Review-Aussagen:

- GPT-Kritik zum `G1`-Fallback war berechtigt und ist korrigiert.
- `weight_kg` Type-Hygiene ist korrigiert.
- `minFactor`-Guardrail bleibt bewusst nicht umgesetzt, weil separater Formel-Contract.

Nicht ausgefuehrt:

- Kein echter Edge Runtime-Smoke, weil der Pfad `user_profile` schreiben kann.
- Kein Supabase Deploy.
- Kein GitHub Workflow-Smoke.

S5 Findings:

- Keine offenen P0/P1-Findings.
- S5-DOC-F1: Protein Overview und QA muessen in S6 noch auf den neuen CKD-Fallback-Vertrag synchronisiert werden.
  - Korrektur: als S6-Pflicht bestaetigt, keine vorgezogene Doku-Aenderung in S5.

S5 Exit:

- Erfuellt.
- Keine offenen S5-Code-Findings.
- S6 kann mit Doku-/QA-Sync und Abschlussreview starten.

## S6 - Doku-Sync, QA-Update und Abschlussreview

Ziel:

- Doku, QA und Roadmap sprechen denselben Protein-Target-Vertrag.

Substeps:

- S6.1 `docs/modules/Protein Module Overview.md` aktualisieren:
  - kein `G1`-Fallback mehr.
  - neuer CKD-Fallback-Vertrag.
  - Known Risks aktualisieren.
- S6.2 `docs/QA_CHECKS.md` um CKD-Fallback-Smokes ergaenzen.
- S6.3 Roadmap-Ergebnisprotokolle aktualisieren.
- S6.4 Finaler Contract Review:
  - Roadmap vs. Code
  - Roadmap vs. Protein Overview
  - Roadmap vs. QA
  - Roadmap vs. medizinische Guardrails
- S6.5 Abschluss-Abnahme:
  - keine offenen P0/P1-Risiken
  - Deploy-Status explizit dokumentiert
  - Runtime-Smokes offen oder ausgefuehrt dokumentiert
- S6.6 Commit-Empfehlung.
- S6.7 Archiv-Entscheidung nach User-Abnahme.

Exit-Kriterium:

- Roadmap ist commit- oder archivbereit.

### S6 Ergebnisprotokoll 31.05.2026

Status: DONE

#### S6.1 Protein Overview Sync

Geaendert:

- `docs/modules/Protein Module Overview.md`

Inhaltliche Updates:

- Alter Satz `CKD-Stufe kommt aus letztem lab_event (Fallback G1, falls kein Wert)` entfernt.
- Neuer CKD-Vertrag dokumentiert:
  - letztes `lab_event.payload.ckd_stage`
  - bestehendes `user_profile.protein_ckd_stage_g`
  - Auto bei fehlender CKD skipped mit `ckd_stage_missing`
  - Doctor-Lock mit validem Doctor-Faktor darf ohne CKD weiter Zielwerte schreiben, erfindet aber keine CKD-Metadaten.
- Fehler-/Diagnoseverhalten erweitert:
  - `doctor_factor_missing`
  - `ckd_stage_missing`
  - `ckd_source` als nicht-persistierte Response-Diagnostik.
- Known Risks aktualisiert:
  - kein `CKD-Fallback (G1)` mehr.
  - fehlende CKD-Quelle im Auto-Pfad erzeugt Skip statt stillen Write.
- QA-Checkliste im Modul um CKD-Fallback-Smokes ergaenzt.
- `protein_ckd_confirmed_at` als Future-Idea markiert, nicht als aktuelles Schemafeld oder aktueller Write.

#### S6.2 QA Update

Geaendert:

- `docs/QA_CHECKS.md`

Ergaenzt:

- `Phase P14 - Protein Targets CKD Fallback (2026-05-31)`

Dokumentiert:

- Statische/lokale Checks:
  - `deno check`
  - `git diff --check`
  - kein `parseCkdStage(...) || "G1"`
  - kein `|| "G1"`
  - kein persistiertes `ckd_source`
  - CKD-Faktorwerte unveraendert
  - Activity-Schwellen unveraendert
  - `minFactor` unveraendert
- Runtime-/Deployment-gated Smokes:
  - Lab `G3a A1` -> schreibt `G3a`
  - Lab ohne CKD + Profil `G3a` -> kein `G1`
  - Lab/Profile CKD missing + Auto -> `ckd_stage_missing`
  - Doctor-Lock mit/ohne CKD -> Doctor-Faktor bleibt hoheitlich
  - Cooldown mit Profil-Fallback
- Regression:
  - Body-Save
  - Scheduler-Gewichtsfallback
  - Doctor-Faktor-Skip
  - Intake/Assistant-Konsum
  - kein Deploy ohne Freigabe

#### S6.3 Roadmap-Sync

- Statusmatrix aktualisiert:
  - S6 von `TODO` auf `DONE`
- Dieses S6-Ergebnisprotokoll ergaenzt.
- S1 bis S6 sind dokumentiert.

#### S6.4 Finaler Contract Review

Roadmap vs. Code:

- Roadmap fordert `Lab > Profil > Missing`.
- Code setzt um:
  - `ckdStageLab`
  - `ckdStageProfile`
  - `ckdStage = ckdStageLab || ckdStageProfile`
  - `ckdSource = lab | profile | missing`
- Kein `|| "G1"` im Code.
- Auto bei `missing` skipped mit `ckd_stage_missing`.
- CKD-Felder werden nur bei valider CKD in `updatePayload` gesetzt.
- `ckd_source` wird nicht persistiert.

Roadmap vs. Protein Overview:

- Protein Overview beschreibt keinen `G1`-Fallback mehr.
- Protein Overview beschreibt Auto-Skip und Doctor-Lock-Verhalten konsistent zum Code.
- Protein Overview markiert `protein_ckd_confirmed_at` als Zukunftsidee, nicht als aktuelles Schema.

Roadmap vs. QA:

- QA enthaelt lokale Checks fuer genau die S5/S6-Kriterien.
- QA enthaelt manuelle Runtime-Smokes als deployment/runtime-gated.
- QA behauptet keinen ausgefuehrten Deploy und keinen ausgefuehrten Runtime-Smoke.

Roadmap vs. medizinische Guardrails:

- Fehlende CKD wird nicht als gesund/G1 interpretiert.
- Kein neuer medizinischer Default wie hardcoded `G3a`.
- Doctor-Lock bleibt hoheitlich.
- Kein neuer UI-/Assistant-/Intake-Umbau.
- Kein SQL-/RLS-/Schema-Umbau.
- Kein Deploy ohne Freigabe.

Finale Contract-Findings:

- PRO-S6-CR-F1: Protein Overview enthielt noch den alten `Fallback G1`.
- PRO-S6-CR-F2: Protein Overview enthielt `protein_ckd_confirmed_at` zu stark als aktuelles Optionalfeld/Write.
- PRO-S6-CR-F3: QA hatte noch keinen dauerhaften CKD-Fallback-Checkblock.
- PRO-S6-CR-F4: Roadmap musste S6 und die finale Nicht-Deploy-/Smoke-Entscheidung explizit dokumentieren.

Korrekturen:

- PRO-S6-CR-F1 korrigiert:
  - `Fallback G1` aus Protein Overview entfernt und durch `Lab > Profil > Missing` ersetzt.
- PRO-S6-CR-F2 korrigiert:
  - `protein_ckd_confirmed_at` als Future-Idea ohne aktuelles Schema/Write dokumentiert.
- PRO-S6-CR-F3 korrigiert:
  - QA Phase P14 ergaenzt.
- PRO-S6-CR-F4 korrigiert:
  - S6-Protokoll dokumentiert Deploy-/Runtime-Smoke-Status.

#### S6.5 Abschluss-Abnahme

- Keine offenen P0/P1-Risiken.
- Keine offenen Code-Findings.
- Keine offenen Contract-Findings in den bearbeiteten Dokumenten.
- Deploy-Status:
  - deployed nach User-Freigabe.
  - Command: `supabase functions deploy midas-protein-targets --use-api --project-ref jlylmservssinsavlkdi --workdir "C:/Users/steph/Projekte/M.I.D.A.S/backend"`.
  - Supabase meldete `midas-protein-targets` als `ACTIVE`, Version `17`, `UPDATED_AT (UTC) 2026-05-31 17:23:38`.
- Runtime-Smokes:
  - nicht ausgefuehrt.
  - als QA-Smokes fuer spaeter dokumentiert, weil sie `user_profile` schreiben koennen.

#### S6.6 Commit-Empfehlung

Empfohlen:

```text
fix(protein): prevent default CKD stage from resetting targets
```

#### S6.7 Archiv-Entscheidung

- Roadmap ist fachlich abgeschlossen und commitbereit.
- Archivierung mit `(DONE)` ist nach User-Abnahme sinnvoll.

S6 Exit:

- Erfuellt.
- Roadmap ist commitbereit.

## Smokechecks / Regression

- Body-Save mit Gewicht triggert Protein-Edge-Aufruf weiterhin.
- Scheduler ohne `weight_kg` zieht letztes Body-Gewicht weiterhin.
- Bestehender `lab_event.ckd_stage` wird korrekt geparst:
  - `G3a A1` -> `G3a`
  - `G3b A2` -> `G3b`
- Fehlendes `lab_event.ckd_stage` nutzt vorhandenes `profile.protein_ckd_stage_g`.
- Fehlendes Lab und fehlendes Profil erzeugt keinen stillen `G1`-Write.
- Doctor-Lock bleibt Source of Truth fuer `factor_current`.
- `protein_target_min/max` bleiben Formel:
  - `weight_kg * factor_current`
  - `weight_kg * (factor_current - 0.1)`
- Activity-Level-Schwellen bleiben unveraendert.
- `profile:changed` und Profil-Sync bleiben unveraendert.

## Abnahmekriterien

- Kein fehlender CKD-Wert wird als `G1` interpretiert.
- Ein bestehender Profil-CKD-Wert wird als konservativer Fallback genutzt.
- Ohne CKD-Quelle gibt es keinen stillen medizinischen Write im Auto-Pfad.
- Doctor-Lock bleibt stabil.
- Doku und QA beschreiben den neuen Vertrag.

## Commit-Empfehlung

Nach Umsetzung geeignet:

```text
fix(protein): prevent default CKD stage from resetting targets
```
