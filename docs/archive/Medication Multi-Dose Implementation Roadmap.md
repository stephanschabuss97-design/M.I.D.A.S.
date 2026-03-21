# Medication Multi-Dose Implementation Roadmap

## Ziel (klar und pruefbar)
Der bestehende Tablettenmanager soll von einem `1 Einnahme pro Medikament pro Tag`-Modell auf ein belastbares Mehrfach-Einnahme-Modell erweitert werden, ohne den heute funktionierenden `1x taeglich`-Flow zu verschlechtern.

Pruefbare Zieldefinition:
- Medikamente koennen mit `1..n` geplanten Einnahme-Slots pro Tag angelegt und bearbeitet werden.
- V1-Slots sind primaer zaehl-/reihenfolgebasiert; Labels wie `Morgen`, `Mittag`, `Abend`, `Nacht` sind erlaubt, harte Uhrzeitlogik ist in V1 nicht erforderlich.
- Der `1x taeglich`-Flow bleibt im IN-Tab weiterhin in `1-2 Taps` erledigbar.
- Der IN-Tab zeigt pro Medikament einen klaren Tagesfortschritt (`0/1`, `1/2`, `2/3` ...) statt nur `taken=true/false`.
- Einzelne Einnahme-Slots koennen bestaetigt und rueckgaengig gemacht werden, ohne den restlichen Tag zu verfaelschen.
- Bestand, `days_left`, `runout_day`, Low-Stock und Push/Incident-Logik basieren auf dem echten Tagesplan und nicht mehr auf einem einzelnen Tages-Boolean.
- Bestehende `1x taeglich`-Medikamente bleiben nach Migration funktional korrekt und muessen nicht manuell neu erfasst werden.
- Historische Legacy-Daten werden nicht kuenstlich in mehrere Slot-Events zerlegt; ihre Semantik bleibt taeglich aggregiert.

## Scope
- Fachlicher Umbau des Medication-Moduls von Tages-Boolean auf Slot-/Schedule-Modell.
- SQL-Erweiterung fuer Einnahmeplaene, Slot-Events und kompatible Migration bestehender Meds.
- Neue/angepasste RPCs fuer Read-, Confirm-, Undo- und CRUD-Pfade.
- IN-Tab-UX fuer Mehrfach-Einnahmen mit kompakter Tagesfortschrittsanzeige.
- TAB-UX fuer Planbearbeitung (`1x taeglich`, `2x taeglich`, `3x taeglich`, benannte Slots in fester Reihenfolge).
- Anpassung von Low-Stock-, Runout- und Push-/Incident-Grundlagen auf Schedule-Basis.
- Doku-, QA- und Changelog-Sync fuer den neuen Produktvertrag.

## Not in Scope
- Vollstaendige klinische Medikationsplanung mit frei komplexen Wochenregeln.
- OCR, Barcode-Scan oder externe Arzneimitteldatenbanken.
- Versand- oder Bestelltracking fuer Rezepte.
- Multi-User-, Caregiver- oder Arzt-Workflows.
- Freie Voice-/LLM-Schreiboperationen fuer Medikamentenplaene.
- Generische Push-Eskalationsketten oder Reminder-Spam.
- Harte uhrzeitgenaue Slot-Reminder oder Slot-Deadline-Logik in V1.
- Rueckwirkende Aufspaltung alter Tagesdaten in vermeintlich echte Multi-Slot-Historie.

## Relevante Referenzen (Code)
- `app/modules/intake-stack/medication/index.js`
- `app/modules/intake-stack/intake/index.js`
- `app/modules/profile/index.js`
- `app/modules/incidents/index.js`
- `app/modules/assistant-stack/intent/rules/medication.js`
- `app/modules/assistant-stack/voice/index.js`
- `app/styles/hub.css`
- `index.html`
- `sql/12_Medication.sql`

## Relevante Referenzen (Doku)
- `docs/archive/Breath Timer Implementation Roadmap (DONE).md` (Vorlagenstruktur)
- `docs/archive/Medication Management Module Spec.md`
- `docs/archive/Intake Medication UX Roadmap.md`
- `docs/modules/Medication Module Overview.md`
- `docs/modules/Intake Module Overview.md`
- `docs/modules/Profile Module Overview.md`
- `docs/modules/Push Module Overview.md`
- `docs/modules/Intent Engine Module Overview.md`
- `docs/QA_CHECKS.md`
- `CHANGELOG.md`

## Guardrails
- MIDAS bleibt ein persoenliches Gesundheits-Betriebssystem, kein klinischer Medikationsplaner.
- `1x taeglich` bleibt der Default und darf UX-seitig nicht schlechter werden.
- Mehrfach-Einnahmen muessen klar, ruhig und deterministisch sein; keine visuelle Ueberladung im IN-Tab.
- V1-Slots sind count-/order-first; Slot-Zeiten sind in V1 keine fachliche Pflicht und keine Incident-Grundlage.
- Push bleibt Incident-orientiert; kein Slot-Spam und keine Alarmflut.
- Voice/Assistant bleibt eng gefuehrt; kein freies Plan-Authoring per Sprache.
- Migration darf bestehende Medikationsdaten nicht stillschweigend falsch uminterpretieren.
- Legacy-Historie bleibt taeglich aggregiert und wird nicht nachtraeglich in mehrere kuenstliche Slot-Events zerlegt.
- Batch-Aktionen duerfen nie implizit alle offenen Slots einer Mehrfach-Medikation bestaetigen.

## Architektur-Constraints
- Stammdaten, Plan und Event-Log muessen getrennt modelliert werden.
- Read-Model fuer den IN-Tab muss kompakt und cachebar bleiben.
- Bestaetigungen muessen atomar und idempotent pro geplantem Slot funktionieren.
- Historische Daily-Events und neue Slot-Events muessen fachlich sauber koexistieren koennen.
- Bestehende Modulgrenzen bleiben bestehen:
  - Medication verwaltet Medikament und Plan.
  - Intake konsumiert Tagesstatus und rendert Daily UX.
  - Push leitet nur aus fachlich eindeutigen offenen Slots Incidents ab.
  - Profile liefert weiterhin nur Kontakt-/Kontextdaten.
- Rueckwaertskompatibilitaet fuer bestehende `1x taeglich`-Datensaetze ist Pflicht.

## Tool Permissions
Allowed:
- Bestehende Medication-/Intake-/Push-/Voice-Dateien lesen und innerhalb Scope aendern.
- SQL-Migrationen, RPCs und zugehoerige Doku/QA-Dokumente erstellen oder erweitern.
- Lokale Smokechecks, Syntaxchecks und gezielte Schema-/Repo-Scans ausfuehren.

Forbidden:
- Unverwandte Module refactoren.
- Neue Dependencies oder Framework-Wechsel einfuehren.
- MIDAS auf generische Multi-User- oder Clinical-Software-Muster umbauen.

## Execution Mode
- Sequenziell arbeiten (`S1` bis `S8`).
- Keine Schritte ueberspringen ohne dokumentierte Begruendung.
- Vor jedem Write-Pfad erst fachlichen Read-/State-Contract fixieren.
- Vor Push-/Voice-Anpassungen muss der slot-basierte Medication-Kern stabil sein.
- Nach jedem Schritt Statusmatrix aktualisieren.
- Nach jedem Schritt mindestens ein Check (Schema, Smoke, Syntax, Contract-Review).
- Jeder Hauptschritt endet mit denselben operativen Pflichtpunkten:
  - Schritt-Abnahme: Umsetzung, Guards und potenzieller Dead Code pruefen
  - Doku-Sync: betroffene Module Overviews und angrenzende Doku sofort aktualisieren, wenn sich der Produktvertrag geaendert hat
  - Commit-Empfehlung: explizit festhalten, ob nach dem Schritt ein Commit sinnvoll ist oder ob noch weiter gebuendelt werden sollte

## Statusmatrix
| ID | Schritt | Status | Ergebnis/Notiz |
|---|---|---|---|
| S1 | Ist-Analyse aktueller Medication-Stack + Regressionsrisiken | DONE | Single-Dose-Annahmen, Tages-Boolean-Vertraege, Downstream-Abhaengigkeiten und Regressionsrisiken fuer den bestehenden `1x taeglich`-Flow vollstaendig gemappt. |
| S2 | Produktvertrag + UX-State fuer Multi-Dose finalisieren | DONE | S2.1 bis S2.8 abgeschlossen: Begriffe, V1-Slot-Striktheit, sichtbares Produktziel, Fortschrittslogik, Edge-Cases, Schritt-Abnahme, Doku-Sync und Commit-Empfehlung fuer Multi-Dose definiert. |
| S3 | Ziel-Datenmodell + Migrationsstrategie festlegen | TODO | Tabellen, Legacy-Backfill, History-Semantik und Rueckwaertskompatibilitaet final spezifizieren. |
| S4 | RPC-/Read-Write-Contract auf Slot-Modell umbauen | TODO | Deterministische RPCs und kompaktes Tages-Read-Model fuer UI und Push festlegen. |
| S5 | TAB-Planeditor fuer Mehrfach-Einnahmen umsetzen | TODO | Medication-Verwaltung kann mehrere Einnahme-Slots pro Tag sauber anlegen und aendern. |
| S6 | IN-Tab Daily UX auf Fortschritt + Slot-Status umbauen | TODO | Intake zeigt slot-based Default-Interaktion und nur explizite Batch-Aktionen. |
| S7 | Low-Stock-, Runout- und Incident-Logik auf Schedule-Basis anpassen | TODO | Bestands- und Incident-Logik folgt echtem Tagesplan mit genau einem aggregierten Tages-Incident. |
| S8 | Assistant/Voice/Fast-Path auf neues Modell absichern | TODO | Medication-Intents bleiben explizit und bestaetigen nie stillschweigend nur Teilmengen. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Wiederkehrende Abschluss-Substeps pro Hauptschritt
Diese Abschluss-Substeps gelten fuer jeden Hauptschritt `S1` bis `S8` und sollen jeweils als letzte Substeps mitgefuehrt werden.

- `letzter fachlicher Substep + 1: Schritt-Abnahme`
  - Umsetzung gegen den Ziel-Contract des Schritts pruefen
  - betroffene Dateien auf regressiven Ballast und potenziellen Dead Code pruefen
  - gezielte Syntax-/Smoke-/Schema-Checks fuer den Schritt ausfuehren
- `danach: Doku-Sync`
  - betroffene Modul-Overviews sofort aktualisieren, wenn sich Verhalten, Contracts oder Guardrails geaendert haben
  - bei Bedarf auch `docs/QA_CHECKS.md`, `CHANGELOG.md` und angrenzende Roadmap-/Spec-Dokumente nachziehen
- `danach: Commit-Empfehlung`
  - explizit festhalten, ob nach dem Schritt ein Commit sinnvoll ist
  - wenn `kein Commit`, kurz begruenden, was noch zusammengehoert und zuerst mit erledigt werden soll

## Schritte + Subschritte

### S1 - Ist-Analyse aktueller Medication-Stack + Regressionsrisiken
- S1.1 Alle Stellen mappen, die heute `1 Einnahme pro Tag` annehmen.
- S1.2 SQL, RPCs, Frontend-State und IN-Tab-UX auf Tages-Boolean-Vertraege pruefen.
- S1.3 Push-/Voice-/Low-Stock-Abhaengigkeiten aufnehmen.
- S1.4 Regressionsrisiken fuer bestehende `1x taeglich`-Flows dokumentieren.
- S1.5 Schritt-Abnahme:
  - Repo-Scan auf alle Single-Dose-Annahmen, tote Branches und verwaiste Medication-Helfer
  - Ergebnis mit Dateireferenzen und Risikostellen festhalten
- S1.6 Doku-Sync:
  - falls die Ist-Analyse bereits veraltete Modul-Overviews entlarvt, betroffene Overviews direkt korrigieren
- S1.7 Commit-Empfehlung:
  - festhalten, ob die Analyse und eventuelle reine Doku-Korrekturen schon commit-wuerdig sind oder ob sie mit S2 gebuendelt werden sollen
- Output: belastbare Liste aller Single-Dose-Annahmen mit betroffenen Dateien und Guard-Bedarf.
- Exit-Kriterium: kein unbekannter Write-/Read-Pfad mehr offen.

#### S1.1 Ergebnisprotokoll (abgeschlossen)
- SQL / Datenmodell:
  - `sql/12_Medication.sql` modelliert Einnahmen explizit als `max 1 pro Med/Tag`.
  - `health_medication_doses` hat eine Unique-Constraint auf `(user_id, med_id, day)` und verhindert damit mehrere Einnahme-Events pro Tag.
  - `med_confirm_dose(...)` zieht bei einer einzigen Tagesbestaetigung direkt die gesamte `dose_per_day` ab.
  - `med_undo_dose(...)` stellt dieselbe aggregierte Tagesmenge wieder her.
  - `med_list(...)` liefert pro Medikament nur ein Tages-Boolean `taken`, einen Zeitstempel `taken_at` und eine aggregierte `qty`, aber keine Slot-Struktur.

- Medication Client / TAB:
  - `app/modules/intake-stack/medication/index.js` mappt RPC-Daten weiterhin auf `dose_per_day`, `taken`, `taken_at`, `qty`.
  - `confirmMedication(medId, ...)` und `undoMedication(medId, ...)` arbeiten nur medikamentbasiert, nicht slot-basiert.
  - Das TAB-Formular bearbeitet `dose_per_day` als einzelnen Zahlenwert und zeigt in Karten `Dose/Tag`, nicht mehrere Einnahme-Slots.

- Intake / Daily UX:
  - `app/modules/intake-stack/intake/index.js` behandelt Medikamente im Daily Flow als `offen` vs `genommen` auf Basis von `med.taken`.
  - Offene Medikamente werden ueber `.filter((med) => !med?.taken)` bestimmt.
  - Batch- und Status-Toggle-Flow rufen `confirmMedication(medId, ...)` bzw. `undoMedication(medId, ...)` pro Medikament auf und implizieren damit genau einen Tagesabschluss pro Medikation.
  - Bestehende UX- und Statuslogik ist weiterhin auf die Tagessemantik `offen / teilweise / alle genommen` aufgebaut.

- Incidents / Push:
  - `app/modules/incidents/index.js` leitet offene Medikation ebenfalls aus `!med.taken` ab.
  - Damit basiert der Incident-Pfad aktuell auf `Medikament heute noch nicht komplett genommen`, nicht auf mehreren offenen Slots.

- Assistant / Hub / Voice:
  - Text- und Voice-Pfad fuer `medication_confirm_all` laden den Tages-Snapshot und bestaetigen alle Medikamente mit `!med.taken`.
  - Betroffen sind vor allem `app/modules/assistant-stack/voice/index.js` und `app/modules/hub/index.js`.
  - Der produktive Spezialpfad ist damit voll auf Tages-Boolean-Semantik aufgebaut.

- Profil / Read-only Snapshots:
  - `app/modules/profile/index.js` rendert Medication-Snapshots mit `dose_per_day` als `x/Tag`.
  - Auch Profil und Read-only Kontexte lesen derzeit keinen Einnahmeplan, sondern nur aggregierte Tagesdosierung.

- Dokumentation / QA:
  - `docs/modules/Medication Module Overview.md`, `docs/modules/Intake Module Overview.md`, `docs/modules/Profile Module Overview.md` und `docs/modules/Intent Engine Module Overview.md` beschreiben den aktuellen Single-Dose-Vertrag.
  - `docs/QA_CHECKS.md` und mehrere Roadmaps/Specs in `docs/archive/` referenzieren ebenfalls `taken`, `med_confirm_dose`, `med_undo_dose`, `dose_per_day` und den Tagespfad `medication_confirm_all`.

- Vorlaeufiges Fazit fuer S1.1:
  - Die Single-Dose-Annahme sitzt nicht nur im SQL-Schema, sondern durchgaengig in Read-Model, UI-State, Incident-Logik, Voice-/Text-Fast-Path, Profil-Snapshot und Doku.
  - Der Umbau auf Multi-Dose betrifft daher sicher:
    - SQL + RPCs
    - Medication Client
    - Intake Daily UX
    - Incidents
    - Hub/Text-Intent
    - Voice
    - Profile Snapshot
    - Modul-Overviews / QA / archivierte Spezifikationen

- Check-Ergebnis:
  - Repo-Scan via `rg` ueber `app/`, `sql/`, `docs/` und `index.html` abgeschlossen.
  - Kein Hinweis darauf, dass es bereits einen versteckten produktiven Mehrfach-Slot-Pfad gibt; die aktuelle Produktrealitaet ist konsistent single-dose-per-day.

#### S1.2 Ergebnisprotokoll (abgeschlossen)
- SQL-/RPC-Contract:
  - `med_list(p_day)` liefert ein flaches Tagesmodell pro Medikament:
    - Stammdaten
    - `dose_per_day`
    - `days_left`
    - `runout_day`
    - `low_stock`
    - genau ein Tagesstatus `taken`
    - genau ein Tageszeitpunkt `taken_at`
    - genau eine aggregierte Tagesmenge `qty`
  - Die Join-Logik gegen `health_medication_doses` ist auf genau einen Datensatz pro `med_id + day` gebaut.
  - `med_confirm_dose(p_med_id, p_day)` ist semantisch `mark medication done for day`.
  - `med_undo_dose(p_med_id, p_day)` ist semantisch `clear medication done for day`.
  - `med_upsert(...)` speichert keine Planstruktur, sondern nur `dose_per_day` als aggregierten Tageswert.

- Medication Client State-Contract:
  - `mapRpcRow(...)` in `app/modules/intake-stack/medication/index.js` bildet den RPC-Output 1:1 auf ein Flat-Model ab.
  - Der Client kennt aktuell keinen `schedule`, keine `slots`, keinen `taken_count`, keinen `open_count`, keine Event-Liste.
  - `loadMedicationForDay(...)` cached und verteilt genau dieses flache Tagesmodell.
  - `confirmMedication(...)` und `undoMedication(...)` akzeptieren nur `medId + dayIso`; ein Slot-Identifier existiert nicht.
  - Das Export-/API-Surface des Moduls ist damit selbst noch ein Tages-Boolean-Vertrag.

- Intake Daily UI-Contract:
  - `getOpenMedicationIds(data)` definiert `open` rein als `active && !taken`.
  - `syncMedicationSelection(...)` preselectet alle offenen Medikamente, nicht offene Einnahme-Slots.
  - `updateMedicationBatchFooter()` basiert auf `selectedIds.length` bei Medikamenten, nicht auf offenen Slot-Counts.
  - `renderMedicationDaily(...)` rendert pro Medikament genau einen visuellen Status:
    - Karte ist `is-taken` oder nicht
    - Status-Slot toggelt `genommen` vs `offen`
    - kein Zwischenzustand ausser auf Gesamtlistenebene
  - `handleMedicationBatchConfirm()` bestaetigt eine Menge von Medikamenten und nicht eine Menge geplanter Einnahmen.
  - `handleMedicationStatusToggle()` kippt ein Medikament fuer den Tag zwischen `done` und `open`.

- Abgeleitete fachliche Tages-Boolean-Vertraege:
  - `Medication is open` bedeutet heute: es existiert noch kein Einnahmedatensatz fuer den Tag.
  - `Medication is done` bedeutet heute: der Tagesdatensatz existiert und repraesentiert die komplette Tagesmenge.
  - `dose_per_day` ist heute kein Plan mit mehreren Einheiten, sondern die Menge, die beim ersten Confirm komplett verbucht wird.
  - `days_left` und `runout_day` rechnen gegen diese aggregierte Tagesmenge und setzen daher implizit voraus, dass der Tagesverbrauch immer als Block passiert.

- Konkrete Contract-Brueche fuer Multi-Dose:
  - SQL kann heute nicht mehrere Einnahme-Ereignisse am selben Tag pro Medikament ausdruecken.
  - RPC Read-Model kann keine offenen vs bereits genommenen Slots darstellen.
  - Client-State kann keinen Fortschritt wie `1/3` oder `2/3` halten.
  - Intake-UI kann aktuell nur `open` oder `done` pro Medikation, nicht `partial`.
  - Write-API kann keinen einzelnen Slot bestaetigen oder rueckgaengig machen.
  - Batch-UX arbeitet auf der falschen Granularitaet fuer Mehrfach-Einnahmen.

- Vorlaeufiges Fazit fuer S1.2:
  - Der zentrale Tages-Boolean-Vertrag sitzt nicht nur in einzelnen Feldern, sondern in allen drei Schichten gleichzeitig:
    - SQL/RPC
    - Medication Client State
    - Intake Daily UI
  - Genau diese drei Vertraege muessen spaeter gemeinsam ersetzt werden; ein reiner UI-Umbau oder ein reiner SQL-Umbau waere inkonsistent.

- Check-Ergebnis:
  - Gezielte Contract-Reads fuer `sql/12_Medication.sql`, `app/modules/intake-stack/medication/index.js` und `app/modules/intake-stack/intake/index.js` abgeschlossen.
  - Kein Layer enthaelt bereits eine vorbereitete partielle Tageslogik; `partial` existiert aktuell nur indirekt als Listen-/Batch-Zustand, nicht als Medikamenten- oder Slot-Vertrag.

#### S1.3 Ergebnisprotokoll (abgeschlossen)
- Incidents / Push-Abhaengigkeit:
  - `app/modules/incidents/index.js` reduziert Medication-Status auf genau einen Bool `medsOpen`.
  - `resolveMedicationOpen(payload)` wertet `payload.medications.filter(... !med.taken)` aus.
  - Der Push-Entscheid `shouldPushMed()` kennt keine Slot-Granularitaet, sondern nur:
    - gibt es heute noch irgendein offenes Medikament
    - ist der feste Cutoff `MED_PUSH_HOUR` erreicht
  - Der Notification-Text `Medikation fuer heute offen` bestaetigt ebenfalls den Tagesvertrag.

- Hub / Text-Intent-Abhaengigkeit:
  - `app/modules/hub/index.js` behandelt `medication_confirm_all` als Sammelbestaetigung aller Medikamente mit `!med.taken`.
  - Der Textpfad kennt keine Teilmengen-, Slot- oder Progress-Semantik.
  - Die lokale Erfolgsantwort `Medikation bestaetigt.` ist ebenfalls auf Tagesabschluss und nicht auf Slot-Fortschritt zugeschnitten.

- Voice-Abhaengigkeit:
  - `app/modules/assistant-stack/voice/index.js` nutzt denselben Tages-Snapshot wie der Textpfad.
  - `runVoiceMedicationConfirmAll()` sammelt alle Medikamente mit `!med.taken` und bestaetigt sie gesammelt.
  - Der Voice-Follow-up fuer Low-Stock wird erst nach erfolgreicher Tages-Sammelbestaetigung gegen einen frischen Snapshot geprueft.
  - Damit haengt auch der produktive Voice-Nachsatz indirekt an der Tages-Boolean-Semantik `today fully done / not done`.

- Profile-Abhaengigkeit:
  - `app/modules/profile/index.js` baut den Medication-Snapshot ueber `loadMedicationForDay(today)` auf.
  - `summarizeMedicationRows(...)` formatiert Medikamente als `Name (Staerke, x/Tag)`.
  - Das Profil zeigt damit bewusst eine aggregierte Tagesdosierung und keinen Einnahmeplan mit Slots oder Progress.

- Doku-/QA-Abhaengigkeit:
  - `docs/modules/Medication Module Overview.md` beschreibt den Kernfluss weiterhin als:
    - taegliche Einnahme je Medikament
    - `med_confirm_dose` / `med_undo_dose`
    - Batch-Footer im IN-Tab
    - Voice-Fast-Path `medication_confirm_all`
  - `docs/modules/Intake Module Overview.md` beschreibt den Daily Flow weiterhin ueber `Auswahl bestaetigen`, `Alle genommen`, `med_confirm_dose`, `med_undo_dose`.
  - `docs/modules/Profile Module Overview.md` dokumentiert den Snapshot explizit als read-only Ableitung aus `loadMedicationForDay(...)`.
  - `docs/modules/Intent Engine Module Overview.md`, `docs/Voice Command Semantics.md` und `docs/QA_CHECKS.md` referenzieren den produktiven lokalen Spezialpfad `medication_confirm_all`.

- Abhaengigkeitsbild fuer den Umbau:
  - Downstream haengt nicht nur die UI an Medication, sondern mehrere Produktpfade:
    - Incident-Berechnung
    - Text-Intent-Dispatch
    - Voice-Dispatch + Low-Stock-Follow-up
    - Profile-Snapshot
    - Modul-Overviews / QA / Voice-Semantik-Doku
  - Diese Pfade konsumieren heute denselben flachen Medication-Tages-Snapshot und werden daher bei Multi-Dose nicht nur kosmetisch, sondern vertraglich betroffen sein.

- Vorlaeufiges Fazit fuer S1.3:
  - Die Medication-Semantik ist bereits tief im System verteilt.
  - Der kuenftige Multi-Dose-Umbau darf deshalb nicht als reines Medication-/Intake-Feature betrachtet werden; er hat direkte Downstream-Folgen fuer Incidents, Hub, Voice, Profile und Dokumentation.
  - Besonders kritisch sind:
    - Incident-Trigger ueber `medsOpen`
    - `medication_confirm_all` in Text und Voice
    - Profil-Snapshot `x/Tag`

- Check-Ergebnis:
  - Gezielte Reads fuer `app/modules/incidents/index.js`, `app/modules/hub/index.js`, `app/modules/assistant-stack/voice/index.js`, `app/modules/profile/index.js` sowie die betroffenen Modul-Overviews/QA-Dokumente abgeschlossen.
  - Alle produktiven Downstream-Pfade konsumieren aktuell denselben single-dose-orientierten Tages-Snapshot; es gibt keinen separaten Parallelvertrag fuer mehrfache Einnahmen.

#### S1.4 Ergebnisprotokoll (abgeschlossen)
- Risiko A - `1x taeglich` verliert Frictionless-Charakter:
  - Der heutige Kernnutzen ist `1-2 Taps` fuer die Tagesmedikation.
  - Wenn der Umbau `1x taeglich` kuenstlich in Slot-Editoren, Aufklapp-Listen oder mehrstufige Confirm-Flows zwingt, wird der bewaehrte Alltagsfluss verschlechtert.
  - Guard daraus:
    - `1x taeglich` bleibt kompakt
    - kein Pflicht-Aufklappen
    - kein zusaetzlicher Planungsdialog fuer simple Daily-Meds

- Risiko B - Bestand / Runout driften bei Legacy-Meds:
  - Aktuell zieht ein Confirm die komplette `dose_per_day` ab und `days_left`/`runout_day` rechnen genau dagegen.
  - Wenn Multi-Dose eingefuehrt wird, ohne die Legacy-Semantik sauber zu kapseln, koennen bestehende `1x taeglich`-Meds falsche Bestands- oder Aufbrauchwerte bekommen.
  - Guard daraus:
    - Legacy-Semantik bleibt fuer bestehende Daily-Meds bis zur expliziten Planbearbeitung stabil
    - keine stille Umdeutung historischer Tagesbestaetigungen

- Risiko C - Batch- und Status-UX wird fuer Daily-Meds unklar:
  - Heute sind `Auswahl bestaetigen`, Status-Toggle und Ruecknahme semantisch klar, weil ein Medikament nur `offen` oder `genommen` sein kann.
  - Ein unvorsichtiger Multi-Dose-Umbau kann denselben Tap ploetzlich zu `partial`, `all open`, `next open` oder `slot confirm` machen.
  - Guard daraus:
    - fuer `1x taeglich` bleibt der direkte Status-CTA semantisch unveraendert
    - keine implizite Bedeutungsverschiebung eines bestehenden Daily-Taps

- Risiko D - Incident- und Push-Verhalten verschlechtert sich fuer Daily-Meds:
  - Heute entsteht fuer Medikation maximal ein klarer Incident `Medikation fuer heute offen`.
  - Wenn spaeter Slot-Logik ohne harte Aggregation in den Incident-Pfad sickert, kann selbst bei Daily-Meds Reminder-Laerm oder schwer nachvollziehbares Verhalten entstehen.
  - Guard daraus:
    - Daily-Meds muessen im Incident-System weiterhin wie genau ein Tagesvertrag wirken
    - maximal ein klarer Tages-Incident

- Risiko E - Voice-/Text-Kommandos werden semantisch unsauber:
  - `medication_confirm_all` bedeutet heute fuer dich praktisch `mach meine heutige Medikation fertig`.
  - Wenn der Umbau diesen Pfad fuer Daily-Meds nicht stabil haelt, koennen lokale Sprachbefehle ploetzlich anders wirken als die UI.
  - Guard daraus:
    - Daily-Meds bleiben fuer Text/Voice komplett kompatibel
    - `medication_confirm_all` darf fuer reine `1x taeglich`-Meds nicht an Klarheit verlieren

- Risiko F - Profil- und Read-only-Snapshots werden schlechter statt besser:
  - Heute versteht der Profil-Snapshot sofort `x/Tag`.
  - Ein unbedachter Umbau koennte dort ploetzlich technische Slot-Details zeigen, die fuer den read-only Kontext keinen Mehrwert haben.
  - Guard daraus:
    - Read-only Views bleiben fuer Daily-Meds aggregiert und lesbar
    - keine UI-Leaks interner Slot-Struktur in simplen Kontextelementen

- Risiko G - Doku und QA laufen hinter dem echten Produktvertrag her:
  - Medication-/Intake-Overviews und QA-Checks beschreiben heute sehr klar den Daily-Flow.
  - Wenn der Multi-Dose-Umbau startet, aber diese Doku nicht pro Schritt nachgezogen wird, entsteht Drift genau an den Stellen, an denen spaetere Sessions sich orientieren.
  - Guard daraus:
    - Doku-Sync pro Schritt ist fuer dieses Thema Pflicht, nicht Finale-Kosmetik

- Gesamtbewertung fuer S1.4:
  - Das groesste Risiko des Umbaus ist nicht, dass Mehrfach-Einnahmen technisch schwer sind.
  - Das groesste Risiko ist, dass der bewaehrte `1x taeglich`-Flow an Klarheit, Geschwindigkeit und Verlaesslichkeit verliert.
  - Deshalb muss der Umbau fuer Daily-Meds konservativ und guard-railed bleiben:
    - gleiche oder bessere Geschwindigkeit
    - gleiche oder bessere semantische Klarheit
    - keine stillen Bedeutungswechsel bei bestehenden Actions, Pushes und Voice-Kommandos

- Check-Ergebnis:
  - Regressionsrisiken gegen aktuelle Modul-Overviews, QA-Checks und die produktiven Medication-/Incident-/Voice-Pfade gespiegelt.
  - Keine Hinweise darauf, dass bestehende `1x taeglich`-Flows heute funktional unsauber sind; der Umbau muss also primaer Regression vermeiden, nicht erst einen kaputten Altzustand heilen.

#### S1.5 Schritt-Abnahme (abgeschlossen)
- Umgesetzte Analyseleistung:
  - Single-Dose-Annahmen in SQL, Medication Client, Intake, Incidents, Hub, Voice, Profile und Doku vollstaendig gemappt.
  - Tages-Boolean-Vertraege je Layer explizit benannt.
  - Regressionsrisiken fuer den bestehenden `1x taeglich`-Flow konkret formuliert.

- Dead-Code-/Ballast-Befund fuer S1:
  - Kein versteckter produktiver Multi-Dose-Pfad gefunden.
  - Kein bestehender Partial-Progress- oder Slot-State gefunden, der reaktiviert statt neu modelliert werden koennte.
  - Relevanter Ballast fuer spaeter:
    - alte Doku-/QA-Referenzen auf `Alle genommen`, `taken`, `dose_per_day` und rein taegliche Semantik
    - diese sind derzeit korrekt fuer den Ist-Zustand, werden aber in spaeteren Schritten bewusst nachgezogen werden muessen

- Abnahmeentscheidung:
  - `S1` ist inhaltlich vollstaendig und belastbar genug abgeschlossen.
  - Der Befund ist ausreichend, um mit `S2` in den finalen Produktvertrag zu gehen.

#### S1.6 Doku-Sync (abgeschlossen)
- Fuer `S1` kein breiter Modul-Overview-Umbau vorgenommen, weil die aktuellen Modul-Overviews den Ist-Zustand korrekt beschreiben.
- Die Roadmap selbst traegt jetzt den vollstaendigen Analyse- und Risiko-Befund fuer `S1.1` bis `S1.4`.
- Konsequenz fuer Folge-Schritte:
  - Ab `S2` muessen `docs/modules/Medication Module Overview.md` und `docs/modules/Intake Module Overview.md` schrittweise auf den neuen Zielvertrag nachgezogen werden.

#### S1.7 Commit-Empfehlung (abgeschlossen)
- Empfehlung:
  - Noch kein eigener Commit nur fuer `S1`.
- Begruendung:
  - Bisher wurden ausschliesslich Analyse- und Roadmap-Inhalte erweitert.
  - Ein sauberer Commit-Schnitt ergibt sich sinnvoller nach `S2`, wenn Analyse plus finaler Produktvertrag gemeinsam dokumentiert sind.

### S2 - Produktvertrag + UX-State fuer Multi-Dose finalisieren
- S2.1 Final definieren, was in MIDAS ein `Medication`, ein `Schedule Slot` und ein `Taken Event` ist.
- S2.2 Slot-Striktheit fuer V1 explizit festlegen:
  - Slots sind primaer zaehl-/reihenfolgebasiert
  - benannte Labels sind erlaubt (`Morgen`, `Mittag`, `Abend`, `Nacht`)
  - harte Uhrzeitbindung ist kein Pflichtbestandteil von V1
  - Incident-/Push-Logik haengt nicht an exakten Slot-Zeiten
- S2.3 Final definieren, wie `1x taeglich`, `2x taeglich`, `3x taeglich`, `4x taeglich` und benannte Slots im Produkt erscheinen.
- S2.4 Fortschrittslogik festlegen:
  - `open`
  - `partial`
  - `done`
  - `missed` nur wenn spaeter fachlich benoetigt, nicht voreilig.
- S2.5 Edge-Cases definieren:
  - temporaere Antibiotika
  - Start-/Enddatum
  - Undo am selben Tag
  - Archivierung bei laufendem Plan
  - alte Meds ohne expliziten Plan
  - Zusatzhinweise wie `mit Mahlzeit` ohne neue Reminder-Semantik
- S2.6 Schritt-Abnahme:
  - finalen Produktvertrag gegen README-Guardrails und Medication-/Intake-Modulgrenzen spiegeln
  - auf Widersprueche, Ueberkomplexitaet und potenziell veraltete Annahmen pruefen
- S2.7 Doku-Sync:
  - `docs/modules/Medication Module Overview.md` und bei Bedarf `docs/modules/Intake Module Overview.md` direkt auf den neuen Produktvertrag ausrichten
- S2.8 Commit-Empfehlung:
  - festhalten, ob Produktvertrag + Doku-Sync einen sauberen Zwischencommit bilden oder ob erst S3 mit hinein soll
- Output: finaler Produkt- und UX-Contract fuer Medication Multi-Dose.
- Exit-Kriterium: UI-Zielbild ist entschieden, bevor SQL und Frontend implementiert werden.

#### S2.1 Ergebnisprotokoll (abgeschlossen)
- `Medication` in MIDAS:
  - Ein `Medication` ist der persistente Stammsatz eines konkreten Medikaments in deinem persoenlichen Alltag.
  - Es repraesentiert nicht eine einzelne Einnahme, sondern den fachlichen Container fuer:
    - Name / Wirkstoff / Staerke
    - Bestand
    - Low-Stock-Kontext
    - Aktiv/Inaktiv-Status
    - den aktuell gueltigen Einnahmeplan
  - Ein `Medication` bleibt damit die zentrale Identitaet, an die Plan, Tagesstatus, Bestand, Low-Stock und Verlauf gebunden sind.

- `Schedule Slot` in MIDAS V1:
  - Ein `Schedule Slot` ist ein geplanter Einnahmepunkt innerhalb eines Kalendertages fuer genau ein `Medication`.
  - Ein Slot ist in V1 primaer count-/order-basiert, nicht uhrzeitpflichtig.
  - Ein Slot kann optional ein alltagsnahes Label tragen, z. B.:
    - `Morgen`
    - `Mittag`
    - `Abend`
    - `Nacht`
  - Ein Slot ist kein Reminder, keine Alarm-Entity und kein freier Kalendertermin.
  - Ein Slot ist die kleinste geplante Daily-Unit, die fuer Fortschritt, Confirm/Undo und spaeteren Tagesverbrauch relevant ist.

- `Taken Event` in MIDAS:
  - Ein `Taken Event` ist die tatsaechliche Bestaetigung, dass ein bestimmter geplanter Slot an einem bestimmten Kalendertag genommen wurde.
  - Ein Taken Event ist damit kein Stammdatum und kein Plan, sondern ein Tagesvollzugsereignis.
  - Es repraesentiert:
    - welcher Slot
    - an welchem Tag
    - wann bestaetigt
    - in welchem Status der Slot fuer diesen Tag ist
  - In V1 ist das Taken Event die kleinste Write-Einheit fuer Mehrfach-Einnahmen.

- Beziehung der drei Begriffe:
  - `Medication` = die dauerhafte fachliche Identitaet.
  - `Schedule Slot` = ein geplanter taeglicher Einnahmepunkt dieser Medikation.
  - `Taken Event` = die konkrete Tagesbestaetigung fuer genau einen solchen Slot.
  - Kurzform:
    - Medication hat `1..n` Slots.
    - Ein Slot kann pro Tag `0..1` Taken Event haben.

- MIDAS-spezifische Abgrenzung:
  - `Medication` ist kein klinischer Verordnungsdatensatz.
  - `Schedule Slot` ist kein exakter medizinischer Uhrzeit-Reminder.
  - `Taken Event` ist kein lueckenloser Medikationsaudit fuer Dritte, sondern ein persoenlicher Vollzugsnachweis fuer den Alltag.
  - Diese Begriffe dienen alltagstauglicher Gesundheitssteuerung, nicht formaler Clinical Documentation.

- Konsequenz fuer den Produktvertrag:
  - Bestand und Low-Stock bleiben am `Medication`.
  - Fortschritt im IN-Tab kommt aus den Slots plus den Taken Events des Tages.
  - Confirm/Undo adressiert kuenftig Taken Events auf Slot-Ebene.
  - `1x taeglich` bleibt ein Spezialfall von `Medication mit genau einem Slot`.

- Guard fuer die Folgeschritte:
  - Keine neue Schicht soll `Medication` und `Taken Event` wieder vermischen.
  - Keine UI darf einen `Schedule Slot` wie einen Push-/Alarmvertrag behandeln, solange V1 count-/order-based bleibt.
  - Daily-Meds bleiben fachlich voll kompatibel, weil `1 Slot pro Tag` genau in dieses Modell passt.

- Check-Ergebnis:
  - Begriffsklaerung gegen README-Produktprinzipien und die aktuellen Medication-/Intake-Overviews gespiegelt.
  - Die Definitionen bleiben eng, single-user-tauglich und alltagsorientiert; kein Drift Richtung klinischer Planner oder generische Health-App-Semantik.

#### S2.2 Ergebnisprotokoll (abgeschlossen)
- V1-Slot-Striktheit, positiv definiert:
  - Ein Slot ist in V1 eine bewusst einfache Daily-Planungseinheit.
  - Der Pflichtvertrag eines Slots ist:
    - gehoert genau zu einem `Medication`
    - ist innerhalb des Tages eindeutig sortierbar
    - kann optional ein alltagsnahes Label tragen
    - kann pro Kalendertag genau `offen` oder `genommen` werden
  - Damit ist ein Slot in V1 ausreichend stark fuer:
    - Tagesfortschritt
    - Confirm/Undo
    - Tagesverbrauch
    - Low-Stock-/Runout-Berechnung
    - einen aggregierten Tages-Incident

- V1-Slot-Striktheit, bewusst nicht Teil des Pflichtvertrags:
  - keine exakte Uhrzeitpflicht
  - keine Minuten-/Zeitfenster-Validierung
  - keine Reminder-Deadline pro Slot
  - keine Slot-spezifische Push-Entscheidung
  - keine Wochen- oder Kalenderlogik pro Slot
  - keine klinischen Zusatzdimensionen wie `mit Essen`, `nuechtern`, `PRN`, `nach Bedarf` in V1

- Zusatzhinweise in V1:
  - Hinweise wie `mit Mahlzeit` sind in V1 keine Slot-Art und kein eigener Timing-Vertrag.
  - Solche Hinweise gehoeren als Zusatzattribut an Medikament oder Plan, nicht als eigener Reminder-Mechanismus in den Slot-Kern.
  - Sie duerfen die Uebersicht ergaenzen, aber nicht den Pflichtvertrag eines Slots aufblasen.

- Label-Vertrag fuer V1:
  - Labels sind in V1 vor allem Lesbarkeits- und Ordnungshelfer.
  - Typische Labels sind:
    - `Morgen`
    - `Mittag`
    - `Abend`
    - `Nacht`
  - Labels sind hilfreich, aber nicht fachlich ueberkritisch:
    - ein Slot bleibt auch ohne harte Uhrzeit gueltig
    - die Reihenfolge ist wichtiger als die exakte Zeit

- Reihenfolge-Vertrag fuer V1:
  - Slots muessen fuer dieselbe Medikation stabil sortierbar sein.
  - Die Sortierung ist der primare technische Ordnungsanker in V1.
  - Falls spaeter eine Uhrzeit optional gespeichert wird, darf sie in V1 hoechstens UI- oder Sortierhilfe sein, aber keine neue Incident- oder Reminder-Semantik erzwingen.

- Incident-/Push-Vertrag fuer V1:
  - Push bleibt auf Tagesebene aggregiert.
  - Ein offener Slot ist in V1 nur ein Beitrag zum Tagesfortschritt, nicht automatisch ein eigener Incident.
  - Der Push-Vertrag bleibt deshalb:
    - maximal ein aggregierter Medication-Incident pro Tag
    - keine Slot-Pushes
    - keine Slot-Eskalationskette

- Voice-/Intent-Vertrag fuer V1:
  - Slot-Striktheit darf lokale Fast Paths nicht in freie Planungslogik ziehen.
  - Voice darf daher in V1:
    - offene Tageseinnahmen gesammelt bestaetigen, wenn das explizit so benannt ist
  - Voice darf in V1 nicht:
    - freie Slots erzeugen
    - Slots frei umbauen
    - auf unklare Zeitformulierungen hin implizite Slot-Auswahl treffen

- Guard gegen Zeitlogik-Creep:
  - Wenn ein Feld spaeter wie eine Uhrzeit aussieht, darf daraus in V1 nicht automatisch ein Reminder-, Incident- oder Deadline-Vertrag abgeleitet werden.
  - MIDAS bleibt in V1 bewusst ein alltagstauglicher Tablettenmanager und kein exakter klinischer Medikationskalender.

- Konsequenz fuer die Folgeschritte:
  - `S2.3` und `S5` muessen Slots als benannte, geordnete Daily-Units zeigen, nicht als Kalendertermine.
  - `S3` und `S4` duerfen den Datenvertrag nicht staerker machen als den Produktvertrag.
  - `S7` muss auf Tagesaggregation bleiben.
  - `S8` darf keine slot-time-basierte Voice-Semantik einziehen.

- Check-Ergebnis:
  - Slot-Striktheit gegen README-Produktprinzipien, Push-Overview und den bestehenden Medication-/Intake-Kontext gespiegelt.
  - Die Definition bleibt absichtlich konservativ:
    - stark genug fuer Mehrfach-Einnahmen
    - eng genug, um Push-Spam, UI-Overload und Planner-Drift zu vermeiden.

#### S2.3 Ergebnisprotokoll (abgeschlossen)
- Zielbild im TAB-Panel:
  - `1x taeglich`
    - erscheint als einfacher Plan `1 Einnahme pro Tag`
    - optional mit einem alltagsnahen Label wie `Morgen` oder `Abend`
    - bleibt visuell der simpelste Fall
  - `2x taeglich`
    - erscheint als zwei geordnete Slots
    - bevorzugt mit klaren Labels, z. B. `Morgen` + `Abend`
    - keine komplexe Zeit- oder Kalenderlogik sichtbar
  - `3x taeglich`
    - erscheint als drei geordnete Slots
    - bevorzugt `Morgen` + `Mittag` + `Abend`
  - `4x taeglich`
    - erscheint als vier geordnete Slots
    - bevorzugt nur dort, wo der reale Alltag es braucht
    - Sichtbarmachung bleibt ruhig, z. B. ueber Fortschritt `0/4` plus geordnete Slotliste
  - benannte Slots
    - erscheinen als geordnete Daily-Einheiten, nicht als exakte Uhrtermine
    - Reihenfolge und Lesbarkeit sind wichtiger als technische Zeitdaten

- Zielbild im IN-Tab fuer `1x taeglich`:
  - Eine Daily-Medikation mit genau einem Slot bleibt visuell fast so kompakt wie heute.
  - Die Karte zeigt:
    - Medikamentenname
    - knappen Sekundaertext (z. B. Wirkstoff / Staerke)
    - Tagesstatus als `0/1` oder `1/1`
    - einen klaren direkten Status-CTA
  - Kein Pflicht-Aufklappen.
  - Kein zusaetzlicher Planungsballast fuer den Daily-Basiscase.

- Zielbild im IN-Tab fuer `2x taeglich`:
  - Die Karte zeigt auf der ersten Ebene:
    - Medikamentenname
    - Tagesfortschritt `0/2`, `1/2`, `2/2`
    - ggf. knappen Status wie `1 Slot offen`
  - Unterhalb oder im aufgeklappten Kartenbereich erscheinen zwei klar lesbare Slots:
    - `Morgen`
    - `Abend`
  - Jeder Slot ist einzeln bestaetigbar und ruecknehmbar.
  - Die Karte bleibt dennoch eine Karte und zerfaellt nicht in zwei unverbundene Listenobjekte.

- Zielbild im IN-Tab fuer `3x taeglich`:
  - Die Karte zeigt zuerst nur den kompakten Fortschritt `0/3`, `1/3`, `2/3`, `3/3`.
  - Der Detailbereich zeigt drei geordnete Slots:
    - `Morgen`
    - `Mittag`
    - `Abend`
  - Auch hier gilt:
    - Progress zuerst
    - Slot-Details erst im klaren Zusammenhang derselben Karte

- Zielbild im IN-Tab fuer `4x taeglich`:
  - Die Karte zeigt auf erster Ebene nur den kompakten Fortschritt `0/4`, `1/4`, `2/4`, `3/4`, `4/4`.
  - Der Detailbereich zeigt vier geordnete Slots.
  - Dieser Fall bleibt bewusst moeglich, aber nicht der visuelle Default fuer das Modul.
  - Auch bei `4x taeglich` gilt:
    - dieselbe Karte
    - dieselbe Progress-Logik
    - keine plannerartige Tabellen-UI in V1

- Zielbild fuer benannte Slots:
  - Benutzerdefinierte benannte Slots duerfen sichtbar sein, wenn der Standardfall nicht reicht.
  - Im IN-Tab sollen sie aber wie bekannte Tagesanker lesbar bleiben, nicht wie technische Datensaetze.
  - Bevorzugte Darstellung:
    - Label zuerst
    - Status direkt daneben oder darunter
    - keine uhrzeitlastige oder tabellarische Darstellung in V1

- Zielbild fuer Zusatzhinweise wie `mit Mahlzeit`:
  - `mit Mahlzeit` ist in V1 kein eigener Slot-Typ, sondern ein klar sichtbares Zusatzattribut.
  - Der Hinweis wird bereits bei der Medikamenten-/Plan-Erstellung gesetzt, z. B. als Checkbox.
  - In der Uebersicht erscheint er als knapper Info-Hinweis an derselben Medikation, nicht als eigener Reminder oder eigener Fortschrittszaehler.
  - Beispielhafte Wirkung:
    - Karte zeigt `0/4`
    - darunter oder daneben steht knapp `mit Mahlzeit`
  - Der Hinweis soll Orientierung geben, aber den Daily-Flow nicht blockieren oder verkomplizieren.

- Zielbild fuer Fortschritt:
  - Fortschritt wird im Produkt primaer als Zaehler sichtbar:
    - `0/1`
    - `1/2`
    - `2/3`
  - Dieser Fortschritt ist die zentrale neue Semantik fuer den Nutzer.
  - Er ersetzt nicht nur `taken=true/false`, sondern macht Mehrfach-Einnahmen visuell sofort verstehbar.

- Zielbild fuer Batch und Direct Actions:
  - `1x taeglich`
    - direkte Einzelaktion bleibt vollwertig
    - Batch bleibt fuer mehrere Daily-Meds sinnvoll
  - `2x` / `3x taeglich`
    - direkte Actions adressieren standardmaessig einzelne Slots
    - eine Sammelaktion darf nur explizit `alle offenen Einnahmen bestaetigen` heissen
    - keine implizite Sammelbestaetigung durch einen generischen Medikamenten-Tap

- Zielbild fuer TAB-Karten / Read-only Zusammenfassung:
  - Medication-Karten im TAB-Panel sollen nicht mehr nur `Dose/Tag: n` zeigen.
  - Stattdessen soll die Karten-Meta den Plan lesbar zusammenfassen, z. B.:
    - `Plan: Morgen`
    - `Plan: Morgen, Abend`
    - `Plan: Morgen, Mittag, Abend`
    - `Plan: Morgen, Mittag, Abend, Nacht`
  - Zusatzhinweise koennen dort knapp ergaenzt werden, z. B.:
    - `Hinweis: mit Mahlzeit`
  - Fuer simple Daily-Meds bleibt die Zusammenfassung bewusst kurz.

- Produktregel fuer Kompaktheit:
  - `1x taeglich` ist der Basiscase und bekommt die kompakteste Darstellung.
  - Zusetzliche visuelle Dichte steigt nur dort, wo sie fuer `2x` oder `3x` wirklich noetig ist.
  - `4x taeglich` bleibt moeglich, wird aber nicht zum gestalterischen Default hochgezogen.
  - Zusatzhinweise wie `mit Mahlzeit` bleiben sekundaere Informationslayer und werden nicht zu eigener Interaktionslogik.
  - Mehrfachplaene sollen sich wie eine Erweiterung des heutigen Flows anfuehlen, nicht wie ein neues Unterprodukt.

- Konsequenz fuer die Folgeschritte:
  - `S5` muss den Planeditor an genau diese sichtbaren Produktformen koppeln.
  - `S6` muss `progress-first` rendern und Slot-Details nur kontrolliert erweitern.
  - `S4` braucht ein Read-Model, das sowohl kompakte Fortschrittsdaten als auch geordnete Slot-Details liefern kann.

- Check-Ergebnis:
  - Zielbild gegen den aktuellen Intake-Kartenaufbau und die heutige TAB-Karten-Meta gespiegelt.
  - Das Ergebnis bleibt eng am bestehenden MIDAS-Look:
    - Karte als primare Einheit
    - kompakte Daily-Lesbarkeit
    - mehr Details nur bei echter Mehrfach-Einnahme.

#### S2.4 Ergebnisprotokoll (abgeschlossen)
- Pflicht-States fuer V1:
  - `open`
    - kein Slot der Medikation wurde fuer den Tag bestaetigt
    - Beispiele:
      - `0/1`
      - `0/2`
      - `0/4`
  - `partial`
    - mindestens ein Slot ist bestaetigt, aber nicht alle
    - Beispiele:
      - `1/2`
      - `2/3`
      - `3/4`
  - `done`
    - alle geplanten Slots fuer den Tag sind bestaetigt
    - Beispiele:
      - `1/1`
      - `2/2`
      - `4/4`

- Bedeutung der States im Produkt:
  - `open`
    - zeigt: diese Medikation ist heute noch komplett offen
    - ist relevant fuer Daily-CTA, Fortschritt und aggregierten Incident
  - `partial`
    - zeigt: die Medikation ist heute bereits begonnen, aber noch nicht fertig
    - ist relevant fuer Fortschritt, Slot-Details und spaeter fuer vorsichtige Incident-Aggregation
  - `done`
    - zeigt: diese Medikation ist fuer heute vollstaendig erledigt
    - ist relevant fuer das Ende der Daily-Interaktion und fuer `medication_confirm_all`

- Ableitungsregel aus Slot-Count:
  - `total_count = Anzahl geplanter Slots fuer den Tag`
  - `taken_count = Anzahl bestaetigter Slots fuer den Tag`
  - State-Ableitung:
    - `open`, wenn `taken_count = 0`
    - `partial`, wenn `0 < taken_count < total_count`
    - `done`, wenn `taken_count = total_count`

- Sichtbare Produktdarstellung:
  - Der primaere Nutzerindikator ist der Zaehler:
    - `0/1`
    - `1/2`
    - `2/3`
    - `4/4`
  - Der semantische State ist der logische Unterbau hinter diesem Zaehler.
  - Die UI darf optional knappe Sprache nutzen wie:
    - `offen`
    - `teilweise erledigt`
    - `fertig`
  - Aber der Zaehler bleibt die Hauptsprache des Produkts.

- Warum `partial` in V1 Pflicht ist:
  - Ohne `partial` koennte MIDAS Mehrfach-Einnahmen nur als `offen` oder `fertig` zeigen.
  - Das wuerde den eigentlichen Alltagsnutzen von `2x`, `3x`, `4x` taeglich sofort untergraben.
  - `partial` ist deshalb kein Nice-to-have, sondern Kernbestandteil des Multi-Dose-Vertrags.

- Warum `missed` in V1 bewusst noch kein Pflicht-State ist:
  - `missed` klingt einfach, zieht aber sofort neue Fachlogik nach:
    - ab wann genau gilt ein Slot als verpasst
    - braucht es dafuer Uhrzeiten oder Zeitfenster
    - wie verhaelt sich `missed` zu Push, Voice und Undo
    - was passiert bei spaeterer Nachbestaetigung
  - Da V1 bewusst keine harte Uhrzeit-/Deadline-Logik traegt, waere `missed` in V1 fachlich unsauber oder kuenstlich.
  - Deshalb gilt in V1:
    - `missed` ist hoechstens ein spaeterer Erweiterungspunkt
    - kein Pflicht-State fuer SQL, UI oder Incident-Logik

- Guard gegen falsche State-Nutzung:
  - `partial` darf nicht wie ein eigener Incident behandelt werden.
  - `partial` darf nicht automatisch `missed` implizieren.
  - `done` darf erst gelten, wenn wirklich alle Slots bestaetigt sind.
  - `1x taeglich` bleibt voll kompatibel, weil:
    - `0/1` = `open`
    - `1/1` = `done`
    - `partial` tritt dort nicht auf

- Konsequenz fuer die Folgeschritte:
  - `S4` braucht im Read-Model mindestens:
    - `taken_count`
    - `total_count`
    - slotweise Statusdaten
  - `S6` muss `partial` visuell als normalen Zwischenzustand tragen koennen, ohne die Karte zu ueberladen.
  - `S7` darf Incident-/Push-Logik nicht vorschnell von `partial` auf `missed` hocheskalieren.
  - `S8` muss bei `medication_confirm_all` klar zwischen `partial` und `done` unterscheiden koennen.

- Check-Ergebnis:
  - Fortschrittslogik gegen V1-Slot-Striktheit, Push-Overview und den bestehenden Daily-Medication-Flow gespiegelt.
  - Das Ergebnis bleibt konsistent:
    - stark genug fuer Mehrfach-Einnahmen
    - vorsichtig genug, um keine kuenstliche Deadline-Logik einzuschmuggeln.

#### S2.5 Ergebnisprotokoll (abgeschlossen)
- Edge-Case A - temporaere Medikamente wie Antibiotika:
  - Temporaere Medikamente sind in MIDAS V1 ein normaler `Medication`-Stammsatz mit begrenzter Geltung, kein Sondermodul.
  - Sie duerfen denselben Planvertrag nutzen wie dauerhafte Medikamente:
    - `1x`
    - `2x`
    - `3x`
    - `4x`
    - benannte Slots
  - Der Unterschied liegt in der zeitlichen Gueltigkeit, nicht in einer anderen Medication-Logik.

- Edge-Case B - Startdatum:
  - Ein Medikament oder Plan kann ein Startdatum haben.
  - Vor dem Startdatum gilt:
    - keine offenen Slots
    - kein Fortschritt fuer diesen Tag
    - kein Incident aus diesem Plan
    - keine Low-Stock-Logik aus noch nicht aktivem Tagesverbrauch
  - Das ist wichtig fuer Antibiotika-Starts, Umstellungen und prospektive Planwechsel.

- Edge-Case C - Enddatum:
  - Ein Medikament oder Plan kann ein Enddatum haben.
  - Nach dem Enddatum gilt:
    - keine offenen Slots mehr
    - kein Fortschritt mehr
    - kein Incident mehr
    - kein weiterer Tagesverbrauch aus diesem Plan
  - Das Medikament darf fuer Historik und Verlauf erhalten bleiben, ohne weiterhin als aktive Tagesmedikation zu gelten.

- Edge-Case D - Undo am selben Tag:
  - Ein bestaetigter Slot darf am selben Tag wieder rueckgaengig gemacht werden.
  - Undo wirkt in V1 nur auf den konkreten Slot bzw. das konkrete Taken Event dieses Tages.
  - Undo darf:
    - Fortschritt korrekt zuruecksetzen
    - Bestand korrekt zuruecksetzen
    - `done` wieder zu `partial` oder `open` machen
  - Undo darf nicht:
    - andere Slots derselben Medikation mit veraendern
    - alte Tage rueckwirkend anfassen

- Edge-Case E - Archivierung bei laufendem Plan:
  - `Archivieren` bleibt eine Medication-Ebene-Aktion, kein Slot-State.
  - Eine archivierte Medikation ist fuer den aktuellen Tagesfluss nicht mehr aktiv.
  - Guard fuer V1:
    - Archivierung soll nicht heimlich Historie loeschen
    - bereits vorhandene Tagesereignisse bleiben historisch lesbar
    - fuer aktuelle und kuenftige Tage erzeugt eine archivierte Medikation keine offenen Slots mehr
  - Falls am Tag der Archivierung bereits Slots bestaetigt wurden, bleiben diese bestaetigten Tagesereignisse Teil des Verlaufs.

- Edge-Case F - alte Meds ohne expliziten Plan:
  - Bestehende Medikamente ohne neuen Slot-Plan bleiben in V1 ueber einen `legacy default slot` kompatibel.
  - Dadurch gilt fuer Altbestand:
    - kein Re-Setup-Zwang
    - gleiche Daily-Semantik wie bisher
    - gleiche Bestandslogik bis zur expliziten Planbearbeitung
  - Erst wenn ein Medikament bewusst bearbeitet oder in den neuen Plan ueberfuehrt wird, darf es echte Mehrfach-Slots bekommen.

- Edge-Case G - Planwechsel bei bestehendem Medikament:
  - Ein Planwechsel wirkt prospektiv ab Startdatum des neuen Plans.
  - Vergangene Tage behalten ihre alte Semantik.
  - Das verhindert Drift zwischen:
    - alter Daily-Historie
    - neuem Multi-Dose-Plan

- Edge-Case H - Zusatzhinweise wie `mit Mahlzeit`:
  - `mit Mahlzeit` ist in V1 ein Zusatzhinweis, kein eigener Slot und kein Remindervertrag.
  - Es wird idealerweise bei Erstellung/Bearbeitung als Checkbox oder einfacher Flag gepflegt.
  - Sichtbare Wirkung:
    - Hinweis in TAB-Zusammenfassung
    - knapper Info-Hinweis in der Daily-Uebersicht
  - Nicht erlaubte Wirkung in V1:
    - kein eigener Incident
    - kein eigener Fortschrittszaehler
    - keine Blockade, wenn ein Slot bestaetigt wird ohne Essenskontext nachzuweisen

- Edge-Case I - Low-Stock-Ack bei laufendem Plan:
  - Low-Stock-Ack bleibt an `Medication` und aktuellen Bestandszustand gebunden, nicht an einzelne Slots.
  - Planwechsel, Start/Ende oder Undo duerfen den Ack-Zustand nur dann beruehren, wenn sich der relevante Bestands-/Tageskontext fachlich wirklich aendert.
  - Dadurch bleibt die Low-Stock-UI ruhig und kippt nicht in Doppeleinblendungen.

- Produktregel fuer Edge-Cases:
  - Edge-Cases duerfen keine neue V1-Grundkomplexitaet erzeugen.
  - Sie muessen sich in denselben Kernvertrag einfuegen:
    - Medication
    - Slots
    - Taken Events
    - Tagesfortschritt
  - Spezialfaelle werden daher ueber Start/Ende, Aktiv-Status und Zusatzhinweise modelliert, nicht ueber neue parallele Subsysteme.

- Konsequenz fuer die Folgeschritte:
  - `S3` braucht Plan-Gueltigkeit fuer Start/Ende sowie klare Legacy-/Planwechsel-Regeln.
  - `S4` braucht Undo auf Slot-Ebene und ein Read-Model, das aktive vs. inaktive Gueltigkeit korrekt abbildet.
  - `S5` braucht im Planeditor einfache Felder fuer:
    - Aktiv/Inaktiv
    - optional Startdatum
    - optional Enddatum
    - Zusatzhinweis wie `mit Mahlzeit`
  - `S6` muss Historie, Archivierung und laufende Tagesaktion sauber trennen.
  - `S7` darf fuer abgelaufene oder noch nicht gestartete Plaene keine Incidents erzeugen.

- Check-Ergebnis:
  - Edge-Cases gegen bestehende Medication-/Profile-/Push-Vertraege und die konservative V1-Strategie gespiegelt.
  - Das Ergebnis bleibt alltagstauglich:
    - Antibiotika und andere temporaere Medikamente passen hinein
    - Legacy-Meds bleiben stabil
    - Zusatzhinweise bleiben Hinweise und wachsen nicht zu eigener Fachlogik aus.

#### S2.6 Schritt-Abnahme (abgeschlossen)
- README-/Produkt-Guardrail-Check:
  - Der definierte Multi-Dose-Vertrag bleibt innerhalb der README-Leitplanken:
    - kein klinischer Medikationsplaner
    - kein Multi-User-Drift
    - kein AI-first-Verhalten
    - kein Push-/Reminder-Laerm
    - Alltagstauglichkeit vor Feature-Breite
  - Besonders wichtig:
    - `1x taeglich` bleibt der produktische Default
    - `partial` fuehrt keine versteckte Deadline-Semantik ein
    - `4x taeglich` ist erlaubt, aber nicht als neue Standard-Komplexitaet gedacht

- Modulgrenzen-Check:
  - Der S2-Vertrag bleibt kompatibel mit den dokumentierten Modulrollen:
    - Medication bleibt Source of Truth fuer Medikament, Plan und Tagesfortschritt
    - Intake bleibt Daily-Consumer und rendert Fortschritt/Slot-Status
    - Push bleibt nur Aggregator fuer echte offene Tagesmedikation
    - Profile bleibt read-only Kontext fuer Kontakt-/Snapshot-Darstellung
    - Hub/Assistant/Voice bleiben Orchestrator bzw. enger Fast-Path, nicht Plan-Authoring-Oberflaeche
  - Damit verletzt S2 keine bestehende Modulgrenze aus README oder Modul-Overviews.

- Komplexitaets- und Drift-Check:
  - Die gewaehlte V1-Striktheit ist ausreichend fuer reale CKD-/Alltagsfaelle:
    - `1x`
    - `2x`
    - `3x`
    - `4x`
    - benannte Slots
    - Zusatzhinweise wie `mit Mahlzeit`
  - Gleichzeitig bleibt bewusst ausserhalb von V1:
    - harte Intervalllogik wie `alle 12h`
    - slotgenaue Reminder/Pushes
    - `missed` als verpflichtender System-State
    - eigene Mahlzeiten- oder Snack-Subsysteme
  - Das verhindert, dass der Produktvertrag schon in S2 in klinische Planer-Komplexitaet kippt.

- Dead-Contract-/Ballast-Check:
  - Zwischen S2.1 bis S2.5 ist kein widerspruechlicher Parallelvertrag offen geblieben.
  - `Medication`, `Schedule Slot`, `Taken Event`, `open/partial/done`, Legacy-Slot, Start/Ende und `mit Mahlzeit` greifen konsistent ineinander.
  - Es gibt in S2 keinen offensichtlichen Konzept-Ballast, der spaeter nur zu toten UI- oder SQL-Aesten fuehren wuerde.

- Abnahme-Entscheid:
  - S2 ist fachlich tragfaehig und eng genug definiert, um in `S3` als verbindlicher Produktvertrag fuer Datenmodell und Migration verwendet zu werden.
  - Offene Restpunkte fuer S2 sind jetzt nur noch:
    - `S2.7 Doku-Sync`
    - `S2.8 Commit-Empfehlung`

- Check-Ergebnis:
  - Gegen `README.md`, `docs/modules/Medication Module Overview.md`, `docs/modules/Intake Module Overview.md` und `docs/modules/Push Module Overview.md` gespiegelt.
  - Kein Widerspruch gefunden, der vor `S3` noch einen fachlichen Rueckbau des Produktvertrags erzwingen wuerde.

#### S2.7 Doku-Sync (abgeschlossen)
- Modul-Overview-Entscheid:
  - `docs/modules/*` bleiben an dieser Stelle bewusst unveraendert.
  - Grund:
    - sie sind laut README Source of Truth fuer den aktuellen Ist-Zustand
    - der Multi-Dose-Vertrag ist in `S2` fachlich definiert, aber noch nicht in SQL, RPCs oder UI umgesetzt
  - Eine vorgezogene Umschreibung der Modul-Overviews wuerde deshalb den laufenden Codezustand verfaelschen.

- Durchgefuehrter Doku-Sync:
  - `docs/archive/Medication Management Module Spec.md` traegt jetzt einen expliziten Dokumentstatus-Hinweis:
    - aktueller Inhalt = bestehender Single-Dose-Vertrag
    - kuenftiger Multi-Dose-Vertrag = eigene Roadmap in `docs/archive/Medication Multi-Dose Implementation Roadmap.md`
    - Modul-Overviews werden erst mit den realen Umsetzungs-Schritten nachgezogen

- Produktregel fuer die weitere Doku:
  - Vor `S3` bis `S8` wird Doku nur dort vorgezogen, wo sie keinen falschen Ist-Zustand behauptet.
  - `docs/modules/Medication Module Overview.md`, `docs/modules/Intake Module Overview.md`, `docs/modules/Push Module Overview.md` und `docs/QA_CHECKS.md` werden deshalb erst zusammen mit den echten Code-/Contract-Aenderungen aktualisiert.

- Check-Ergebnis:
  - Doku-Hierarchie bleibt konsistent:
    - `docs/modules/*` = aktueller Codevertrag
    - `docs/archive/*` = Roadmap, Historie und kuenftiger Umbauvertrag
  - Kein Dokument behauptet jetzt vorzeitig, dass Multi-Dose bereits produktiv umgesetzt sei.

#### S2.8 Commit-Empfehlung (abgeschlossen)
- Empfehlung:
  - Ja, nach `S2` ist jetzt ein eigener Commit sinnvoll.

- Begruendung:
  - `S1` und `S2` bilden zusammen einen sauberen, abgeschlossenen Dokument-/Analyse-Schnitt:
    - Ist-Zustand und Regressionsrisiken sind vollstaendig aufgenommen
    - der kuenftige Produktvertrag fuer Multi-Dose ist fachlich entschieden
    - die Doku-Hierarchie ist geklaert und vorzeitigem Doku-Drift wurde bewusst vorgebeugt
  - Dieser Stand ist stabil genug, um spaetere SQL-/RPC-/UI-Arbeit in `S3` bis `S8` klar dagegen zu entwickeln.

- Warum nicht weiter buendeln bis `S3`:
  - `S3` fuehrt vom Produktvertrag in konkrete Schema- und Migrationsentscheidungen.
  - Das ist ein neuer Arbeitstyp mit eigenem Risiko:
    - SQL-Zielmodell
    - Legacy-Backfill
    - Planwechsel-Semantik
    - Low-Stock-/Runout-Basis
  - Fuer Live-Server-Arbeit ist deshalb der sauberere Commit-Schnitt:
    - Commit A: Analyse + finaler Produktvertrag
    - Commit B: Datenmodell + Migration

- Empfohlene Commit-Semantik:
  - Fokus des Commits:
    - Medication Multi-Dose Roadmap fachlich finalisiert
    - bestehende Medication-Spec mit Dokumentstatus-Hinweis abgesichert
  - Kein Release- oder Produktiv-Claim:
    - dieser Commit dokumentiert Planung und Vertrag, nicht die Umsetzung

- Check-Ergebnis:
  - `S2` ist damit als abgeschlossener Roadmap-Schritt commit-wuerdig.
  - Naechster Arbeitsblock startet sauber mit `S3`.

### S3 - Ziel-Datenmodell + Migrationsstrategie festlegen
- S3.1 Zieltabellen spezifizieren:
  - `health_medications` als Stammdatenbasis
  - neue Schedule-Tabelle fuer geplante Einnahme-Slots
  - neue Event-Tabelle fuer tatsaechliche Slot-Bestaetigungen
- S3.2 Constraints und Unique-Regeln festlegen:
  - eindeutiger Event pro geplantem Slot und Tag
  - idempotentes Confirm/Undo pro geplantem Slot
- S3.3 Backfill-Regel fuer bestehende Medikamente definieren:
  - bestehende Medikamente erhalten genau einen `legacy default slot`
  - dieser Legacy-Slot traegt die bisherige Tagesmenge (`dose_per_day`) als aggregierte Slot-Menge
  - bestehende historische Tagesdaten bleiben taeglich aggregiert und werden nicht in mehrere kuenstliche Slot-Events explodiert
  - erst neu angelegte oder explizit bearbeitete Medikamente erhalten echte Mehrfach-Slot-Plaene
- S3.4 Regel fuer Planwechsel definieren:
  - Wechsel von Legacy-Slot auf echten Multi-Slot-Plan wirkt prospektiv ab Planstart
  - alte Tage behalten ihre bisherige Semantik
- S3.5 Low-Stock-/Runout-Berechnung auf taegliche Gesamtmenge aus aktivem Plan umstellen.
- S3.6 Schritt-Abnahme:
  - SQL-Modell auf Migrationskanten, Rueckwaertskompatibilitaet und unnoetige Zeitlogik pruefen
  - potenzielle Redundanzen oder kuenftigen Dead-Path im Schema frueh markieren
- S3.7 Doku-Sync:
  - SQL-/Medication-Spec und Modul-Overviews aktualisieren, sobald der Zielvertrag fuer Datenmodell und Migration steht
- S3.8 Commit-Empfehlung:
  - festhalten, ob Datenmodell + Migrationsdesign als eigener Commit sinnvoll ist oder noch mit S4 zusammenbleiben soll
- Output: finales SQL-Zielmodell plus deterministische Migrationsregeln.
- Exit-Kriterium: alle Legacy-Daten haben einen eindeutigen Zielzustand.

### S4 - RPC-/Read-Write-Contract auf Slot-Modell umbauen
- S4.1 Neues Tages-Read-Model fuer Medication definieren:
  - Medikament-Stammdaten
  - Tagesfortschritt
  - offene/erledigte Slots
  - Low-Stock-Status
- S4.2 Slot-basierte Write-RPCs definieren:
  - confirm slot
  - undo slot
  - upsert medication
  - upsert schedule
  - archive/delete medication
- S4.3 Rueckwaertskompatible API-Strategie festlegen:
  - alte Helper nicht abrupt brechen
  - bestehende Call-Sites schrittweise migrieren
- S4.4 Atomicity, Idempotenz und Logging (`stock_log`) absichern.
- S4.5 Schritt-Abnahme:
  - RPCs, Client-Adapter und Read-Model gegen echte Call-Sites pruefen
  - veraltete Helper, tote Mapping-Felder und Daily-Boolean-Reste identifizieren
- S4.6 Doku-Sync:
  - Medication Module Overview, API-/Spec-Doku und QA-Hinweise direkt nachziehen
- S4.7 Commit-Empfehlung:
  - festhalten, ob Read-/Write-Contract stabil genug fuer einen Commit ist oder ob erst S5/S6 folgen sollen
- Output: stabiler RPC- und Client-Contract fuer UI, Push und Voice.
- Exit-Kriterium: kein Frontend-Code muss mehr auf `taken=true fuer ganzen Tag` vertrauen.

### S5 - TAB-Planeditor fuer Mehrfach-Einnahmen umsetzen
- S5.1 Form-Contract fuer Planbearbeitung festlegen:
  - Frequenz-Presets
  - benannte Slots in stabiler Reihenfolge
  - Start-/Enddatum fuer temporaere Medikamente
- S5.2 Bestehendes TAB-Formular erweitern, ohne den Basiscase zu ueberladen.
- S5.3 Sortierung, Validierung und Editierbarkeit mehrerer Slots sauber umsetzen.
- S5.4 Bestehende Kartenliste so erweitern, dass Medikament plus Tagesplan lesbar bleiben.
- S5.5 Schritt-Abnahme:
  - TAB-UI auf CRUD-Vollstaendigkeit, regressiven Ballast und verwaiste Form-/Renderpfade pruefen
  - gezielte Syntax- und Save-Smokes fuer Medication-Verwaltung ausfuehren
- S5.6 Doku-Sync:
  - Medication Module Overview und ggf. QA_CHECKS direkt fuer den neuen TAB-Planeditor aktualisieren
- S5.7 Commit-Empfehlung:
  - festhalten, ob der TAB-Planeditor als abgeschlossener Teil commit-wuerdig ist oder mit S6 gekoppelt bleiben soll
- Output: Medication-Verwaltung kann stabile Mehrfachplaene anlegen und pflegen.
- Exit-Kriterium: Antibiotika-artige `mehrmals pro Tag`-Medikamente lassen sich sauber erfassen.

### S6 - IN-Tab Daily UX auf Fortschritt + Slot-Status umbauen
- S6.1 Medication-Cards auf Tagesfortschritt umstellen (`taken_count / total_count`).
- S6.2 `1x taeglich` kompakt halten:
  - ein klarer Status-CTA
  - kein unnoetiges Aufklappen
- S6.3 `>1x taeglich` mit ruhiger Slot-Liste rendern:
  - Label/Reihenfolge
  - offen/genommen
  - Confirm/Undo pro Slot
- S6.4 Batch-Flow neu definieren:
  - Default ist immer slot-basiertes Confirm/Undo
  - Batch ist fuer `1x taeglich` weiter zulaessig
  - bei Mehrfach-Einnahmen ist Batch nur als explizite Aktion `alle offenen Einnahmen bestaetigen` erlaubt
  - generische Medikament-Taps duerfen nie stillschweigend alle offenen Slots einer Mehrfach-Medikation bestaetigen
- S6.5 Schritt-Abnahme:
  - IN-Tab auf echte Bedienlogik, Regressionsfreiheit und tote Daily-Boolean-UI pruefen
  - gezielte Smokes fuer `1x taeglich`, `2x taeglich`, Partial-Progress und Undo ausfuehren
- S6.6 Doku-Sync:
  - Intake Module Overview, Medication Module Overview und QA_CHECKS sofort aktualisieren, wenn der Daily Flow steht
- S6.7 Commit-Empfehlung:
  - festhalten, ob der neue Daily-Flow fuer Live-Server-Arbeit als Commit-Schnitt taugt oder ob erst S7 mit hinein soll
- Output: Daily UX bildet Mehrfach-Einnahmen ab, ohne die Intake-Oberflaeche zu zerstoeren.
- Exit-Kriterium: `1x taeglich` bleibt schnell, `mehrfach taeglich` bleibt klar.

### S7 - Low-Stock-, Runout- und Incident-Logik auf Schedule-Basis anpassen
- S7.1 Verbrauch aus aktiven Tages-Slots ableiten statt aus einfachem `dose_per_day`.
- S7.2 `days_left` und `runout_day` gegen echten Tagesverbrauch neu berechnen.
- S7.3 Low-Stock-Ack-Vertrag pruefen und ggf. auf neues Modell anpassen.
- S7.4 Incident-/Push-Regeln definieren:
  - kein Push pro kleinem Slot
  - genau ein aggregierter Medication-Incident pro Kalendertag
  - Trigger nur, wenn Medikation am festen spaeten Tages-Schwellenwert noch nicht vollstaendig ist
  - keine Re-Trigger-Schleife am selben Tag
- S7.5 Schritt-Abnahme:
  - Low-Stock-, Runout- und Incident-Pfade auf Drift, Spam-Risiko und tote Legacy-Branches pruefen
  - gezielte Smokes fuer Bestand, Aufbrauch und Incident-Trigger ausfuehren
- S7.6 Doku-Sync:
  - Medication-, Intake- und Push-Module-Overviews sowie QA_CHECKS direkt nachziehen
- S7.7 Commit-Empfehlung:
  - festhalten, ob die fachliche Logik jetzt einen eigenen Commit verdient oder ob Voice-Anpassungen noch dazugenommen werden sollen
- Output: Bestands- und Incident-Logik bleibt leise, aber fachlich korrekt.
- Exit-Kriterium: Mehrfachplaene fuehren nicht zu Push-Spam oder falschem Runout.

### S8 - Assistant/Voice/Fast-Path auf neues Modell absichern
- S8.1 Bestehenden `medication_confirm_all`-Pfad auf `alle aktuell offenen Einnahmen fuer heute` umstellen.
- S8.2 Guardrails fuer Voice beibehalten:
  - kein freies Plan-Editing
  - keine generischen Slot-Manipulationen ohne engen Vertrag
  - keine implizite Logik wie `hab alles genommen`, wenn dabei unklar ist, ob ein Slot oder alle offenen Slots gemeint sind
- S8.3 Voice-Semantik explizit halten:
  - `confirm_all_open` ist erlaubt, wenn die Oberflaeche/Antwort genau das sagt
  - `confirm_next_open` bleibt hoechstens Future Hook, nicht V1-Pflicht
- S8.4 Low-Stock-Follow-up und bestehende lokale Spezialpfade gegen neues Read-Model pruefen.
- S8.5 Intent-/Validator-Vertraege aktualisieren, falls sich Slot-/Progress-Semantik aendert.
- S8.6 Schritt-Abnahme:
  - Voice-/Intent-Pfade auf implizite Teilmengenlogik, tote Validator-Aeste und Regressionsrisiken pruefen
  - gezielte Smokes fuer `medication_confirm_all` und relevante Follow-ups ausfuehren
- S8.7 Doku-Sync:
  - Assistant-, Intent Engine-, Medication- und Push-Overviews sowie QA_CHECKS/CHANGELOG bei Bedarf direkt aktualisieren
- S8.8 Commit-Empfehlung:
  - festhalten, ob der Medication-Multi-Dose-Umbau nach Voice-Absicherung commit- und releasefaehig ist oder ob noch Restarbeit gebuendelt werden muss
- Output: Voice bleibt eng, korrekt und kompatibel mit dem neuen Medication-Kern.
- Exit-Kriterium: bestehende produktive Voice-Faelle brechen nicht.

## Smokechecks / Regression (Definition)
- Bestehendes `1x taeglich`-Medikament bleibt vor und nach Migration in `1-2 Taps` bestaetigbar.
- Bestehende Legacy-Historie bleibt taeglich aggregiert und wird nicht in mehrere Schein-Slots uminterpretiert.
- `2x taeglich`-Medikament zeigt `0/2`, `1/2`, `2/2` korrekt und erlaubt Undo einzelner Slots.
- `3x taeglich`-Medikament reduziert Bestand nur fuer bestaetigte Slots.
- Ein generischer Medikament-Tap bestaetigt bei Mehrfach-Medikation nie stillschweigend alle offenen Slots.
- Low-Stock erscheint bei gleichem Bestand konsistent zum echten Tagesverbrauch.
- Incident-/Push-Logik erzeugt keine Slot-Flut und maximal einen aggregierten Medication-Incident pro Tag.
- `medication_confirm_all` arbeitet explizit mit allen aktuell offenen Einnahmen fuer heute.
- TAB-Planeditor speichert, editiert und archiviert Mehrfachplaene ohne Drift.

## Abnahmekriterien
- MIDAS kann Medikamente mit mehreren Einnahmen pro Tag stabil abbilden.
- Der `1x taeglich`-Basiscase bleibt schneller oder mindestens gleich reibungsarm wie heute.
- V1 bleibt count-/order-based und fuehrt keine harte Uhrzeitpflicht oder Slot-Reminder-Logik ein.
- Datenmodell, RPCs und UI sind auf denselben Slot-/Progress-Vertrag ausgerichtet.
- Low-Stock, Runout, Push und Voice verhalten sich konsistent mit dem neuen Modell.
- Migration bestehender Medikamente fuehrt nicht zu stillen Fehlinterpretationen.
- Dokumentation und QA-Checks sind vollstaendig aktualisiert.

## Risiken
- Zu fruehe UI-Komplexitaet kann den heute guten `1x taeglich`-Flow verschlechtern.
- Halbherzige Migration kann Bestands- oder Runout-Berechnungen verfaelschen.
- Zeitlogik-Creep kann MIDAS unnoetig in Richtung klinischer Planner treiben.
- Push kann ohne harte Guardrails in Mehrfach-Einnahme-Spam kippen.
- Voice/Fast-Paths koennen still regressieren, wenn sie weiter auf Tages-Boolean basieren.
- Zu breite Slot-Flexibilitaet kann MIDAS unnoetig in Richtung klinischer Planungssoftware ziehen.
