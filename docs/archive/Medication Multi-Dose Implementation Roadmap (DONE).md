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
- SQL-Erweiterung fuer Einnahmeplaene, Slot-Events und klaren Reset-/Neustart des bisherigen Medication-Bestands.
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
- Erhalt oder automatische Migration des bisherigen Medication-Datenbestands; fuer diesen Umbau ist ein bewusster Reset mit manueller Neuerfassung erlaubt.

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
- Wenn Medication-Daten bewusst verworfen werden, dann explizit und vollstaendig; keine halbautomatische Legacy-Uebernahme mit unsauberer Semantik.
- Batch-Aktionen duerfen nie implizit alle offenen Slots einer Mehrfach-Medikation bestaetigen.

## Architektur-Constraints
- Stammdaten, Plan und Event-Log muessen getrennt modelliert werden.
- Read-Model fuer den IN-Tab muss kompakt und cachebar bleiben.
- Bestaetigungen muessen atomar und idempotent pro geplantem Slot funktionieren.
- Historische Daily-Events muessen nur dann koexistieren, wenn sie bewusst erhalten werden; fuer den Medication-Umbau ist auch ein harter Reset des Modulbestands zulaessig.
- Bestehende Modulgrenzen bleiben bestehen:
  - Medication verwaltet Medikament und Plan.
  - Intake konsumiert Tagesstatus und rendert Daily UX.
  - Push leitet nur aus fachlich eindeutigen offenen Slots Incidents ab.
  - Profile liefert weiterhin nur Kontakt-/Kontextdaten.
- Rueckwaertskompatibilitaet fuer bestehende `1x taeglich`-Flows ist Pflicht, nicht aber die technische Weiterfuehrung des bisherigen Medication-Datenbestands.

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
- Sequenziell arbeiten (`S1` bis `S9`).
- Keine Schritte ueberspringen ohne dokumentierte Begruendung.
- Vor jedem Write-Pfad erst fachlichen Read-/State-Contract fixieren.
- Vor Push-/Voice-Anpassungen muss der slot-basierte Medication-Kern stabil sein.
- `S1` bis `S8` definieren den Vertrag; ab `S9` beginnt die volle Umsetzung im Code.
- Innerhalb von `S9` endet jeder Umsetzungsblock `S9.x` mit Code-/Dead-Code-Pruefung, Doku-Nachzug und Commit-Empfehlung.
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
| S3 | Ziel-Datenmodell + Migrationsstrategie festlegen | DONE | S3.1 bis S3.8 abgeschlossen: Zielmodell, Constraints, Reset-Strategie, Planwechsel-Regel, Bestandslogik, Schritt-Abnahme, Doku-Sync und Commit-Empfehlung sind festgezogen. |
| S4 | RPC-/Read-Write-Contract auf Slot-Modell umbauen | DONE | S4.1 bis S4.7 abgeschlossen: Tages-Read-Model, slot-basierte Write-RPCs, Uebergangsstrategie, Atomicity-/Idempotenz-Regeln, Schritt-Abnahme, Doku-Sync und Commit-Empfehlung fuer den neuen Kern definiert. |
| S5 | TAB-Planeditor fuer Mehrfach-Einnahmen umsetzen | DONE | S5.1 bis S5.7 abgeschlossen: Form-Contract, TAB-Form-Erweiterung, Slot-Regeln, Kartenlesbarkeit, Schritt-Abnahme, Doku-Sync und Commit-Empfehlung fuer Mehrfach-Einnahmen definiert. |
| S6 | IN-Tab Daily UX auf Fortschritt + Slot-Status umbauen | DONE | S6.1 bis S6.7 abgeschlossen: Fortschrittskarten, `1x`-Fast-Path, `>1x`-Slotliste, Batch-Vertrag, Schritt-Abnahme, Doku-Sync und Commit-Empfehlung fuer den Daily Flow definiert. |
| S7 | Low-Stock-, Runout- und Incident-Logik auf Schedule-Basis anpassen | DONE | S7.1 bis S7.7 abgeschlossen: Verbrauch, `days_left`/`runout_day`, Low-Stock-Ack, Incident-/Push-Regeln, Schritt-Abnahme, Doku-Sync und Commit-Empfehlung sind fachlich auf das neue Plan-/Progress-Modell gezogen. |
| S8 | Assistant/Voice/Fast-Path auf neues Modell absichern | DONE | S8.1 bis S8.8 abgeschlossen: `medication_confirm_all`, Voice-Guardrails, erlaubte Voice-Semantik, Low-Stock-Follow-up, Intent-/Validator-Vertrag, Schritt-Abnahme, Doku-Sync und Commit-Empfehlung sind fachlich auf das neue Slot-Modell gezogen. |
| S9 | Umsetzung des Multi-Dose-Umbaus | DONE | Der Multi-Dose-Umbau ist technisch und funktional abgeschlossen: Schema, produktive RPCs, Medication-Client, `TAB`, `IN` sowie Downstream-Pfade in Hub, Voice, Incidents, Profile, Push, QA und Modul-Doku sind nachgezogen. SQL-Paritaet auf Supabase ist hergestellt; lokale Syntaxchecks sowie manuelle Smokechecks fuer den aktuellen Produktfluss sind erfolgreich durchlaufen. Der alte `v1`-Medication-Pfad wurde anschliessend aus dem aktiven SQL-Contract entfernt. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Wiederkehrende Abschluss-Substeps pro Hauptschritt
Diese Abschluss-Substeps gelten fuer jeden Hauptschritt `S1` bis `S9` und sollen jeweils als letzte Substeps mitgefuehrt werden.

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
    - kuenftiger Multi-Dose-Vertrag = eigene Roadmap in `docs/archive/Medication Multi-Dose Implementation Roadmap (DONE).md`
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
  - bestehender Medication-Bestand darf fuer den Umbau vollstaendig verworfen werden
  - aktive Medikamente werden unter der neuen Multi-Dose-Logik bewusst neu angelegt
  - kein Pflicht-Backfill auf `legacy default slot`
  - keine automatische Uebernahme alter Tageshistorie in neue Slot-Events
- S3.4 Regel fuer Planwechsel definieren:
  - fuer neu angelegte Medikamente gilt nur noch der neue Multi-Dose-Planvertrag
  - falls Legacy-Reste technisch bestehen bleiben, haben sie keine produktive Relevanz mehr
- S3.5 Low-Stock-/Runout-Berechnung auf taegliche Gesamtmenge aus aktivem Plan umstellen.
- S3.6 Schritt-Abnahme:
  - SQL-Modell auf Migrationskanten, Rueckwaertskompatibilitaet und unnoetige Zeitlogik pruefen
  - potenzielle Redundanzen oder kuenftigen Dead-Path im Schema frueh markieren
- S3.7 Doku-Sync:
  - SQL-/Medication-Spec und Modul-Overviews aktualisieren, sobald der Zielvertrag fuer Datenmodell und Migration steht
- S3.8 Commit-Empfehlung:
  - festhalten, ob Datenmodell + Migrationsdesign als eigener Commit sinnvoll ist oder noch mit S4 zusammenbleiben soll
- Output: finales SQL-Zielmodell plus deterministische Reset-/Neuanlage-Regeln.
- Exit-Kriterium: der Medication-Umbau hat einen eindeutigen Startzustand ohne unsaubere Legacy-Uebernahme.

#### S3.1 Ergebnisprotokoll (abgeschlossen)
- Zielbild fuer das Datenmodell:
  - Das Multi-Dose-Modell wird in drei fachlich getrennte Ebenen geschnitten:
    - Medication-Stammsatz
    - geplanter Tagesplan
    - tatsaechliche Tagesbestaetigungen
  - Damit bleibt der Kern robust gegen spaetere Erweiterungen, ohne den `1x taeglich`-Fall unnoetig aufzublaehen.

- Tabelle A - `health_medications` bleibt die Stammdatenbasis:
  - Diese Tabelle bleibt bestehen.
  - Sie traegt weiterhin:
    - Medikamenten-Identitaet
    - Name / Wirkstoff / Staerke
    - Bestand
    - `low_stock_days`
    - `active`
    - Low-Stock-Ack-Felder
    - allgemeine Metadaten wie `leaflet_url`, `created_at`, `updated_at`
  - Fachliche Rolle in V1:
    - ein `Medication` ist der persistente Container fuer Bestand, Low-Stock-Kontext und den aktuell gueltigen Plan
    - nicht der Ort fuer einzelne Tagesereignisse

- Tabelle B - neue Plan-Tabelle fuer taegliche Einnahme-Slots:
  - Neue Arbeitstabelle:
    - `health_medication_schedule_slots`
  - Empfohlene Kernfelder:
    - `id`
    - `user_id`
    - `med_id`
    - `slot_label`
    - `sort_order`
    - `qty_per_slot`
    - `start_date`
    - `end_date`
    - `active`
    - `created_at`
    - `updated_at`
  - Fachliche Rolle:
    - repraesentiert die geplanten taeglichen Einnahme-Slots einer Medikation
    - ist in V1 count-/order-based
    - darf optionale alltagsnahe Labels wie `Morgen`, `Mittag`, `Abend`, `Nacht` tragen
    - ist kein Reminder-, Alarm- oder Kalenderobjekt
  - Warum eigene Tabelle:
    - ein Medikament kann `1..n` Slots haben
    - Start-/Ende und Planwechsel muessen prospektiv modellierbar bleiben
    - Low-Stock-/Runout-Berechnung braucht den aktiven Tagesplan getrennt vom Stammsatz

- Tabelle C - neue Event-Tabelle fuer tatsaechliche Tagesbestaetigungen:
  - Neue Arbeitstabelle:
    - `health_medication_slot_events`
  - Empfohlene Kernfelder:
    - `id`
    - `user_id`
    - `med_id`
    - `slot_id`
    - `day`
    - `qty`
    - `taken_at`
    - `created_at`
  - Fachliche Rolle:
    - repraesentiert die konkrete Bestaetigung eines geplanten Slots an einem Kalendertag
    - ist die Grundlage fuer:
      - `taken_count`
      - `total_count`
      - `open/partial/done`
      - slotweises Undo
      - echten Tagesverbrauch
  - Guard:
    - Ein Event ist kein freies Notiz-Log und keine neue Historien-Interpretation alter Daten.

- Legacy-Tabelle - `health_medication_doses`:
  - Diese Tabelle ist fuer das neue Zielmodell nicht mehr relevant.
  - Sie ist nicht mehr das Zielmodell fuer neue Multi-Dose-Bestaetigungen.
  - Ihre weitere Behandlung ist jetzt bewusst vereinfacht:
    - sie kann im Rahmen des Umbaus geleert, ersetzt oder ganz entfernt werden
    - sie ist keine Quelle mehr fuer einen verpflichtenden Produkt-Backfill
  - Die genaue Reset-/Abloseregel folgt in `S3.3`

- Stock-Log-Tabelle - `health_medication_stock_log`:
  - Diese Tabelle bleibt bestehen.
  - Sie bleibt die fachliche Audit-/Korrekturspur fuer Bestandsaenderungen.
  - Multi-Dose aendert nicht ihren Grundzweck, sondern nur die Quelle der Verbrauchslogik.

- V1-Zusatzhinweise:
  - Zusatzinfos wie `mit Mahlzeit` gehoeren nicht in die Event-Tabelle.
  - Sie gehoeren fachlich entweder:
    - an `health_medications`, wenn sie medikationsweit gelten
    - oder spaeter an den Planvertrag, wenn sie planbezogen werden muessen
  - Fuer `S3.1` gilt:
    - kein eigenes Mahlzeiten-Subsystem
    - keine neue Tabelle nur fuer Hinweise

- Entscheidung zur Granularitaet:
  - V1 braucht keine separate Tabelle fuer:
    - Reminder
    - verpasste Slots
    - Push-Historie
    - Mahlzeitenkontext
  - Das Zielmodell bleibt damit bewusst schlank:
    - `health_medications`
    - `health_medication_schedule_slots`
    - `health_medication_slot_events`
    - plus bestehende `health_medication_stock_log`
    - optional temporaer plus Legacy-`health_medication_doses` bis zum Reset

- Konsequenz fuer die Folgeschritte:
  - `S3.2` muss jetzt die Unique-/Constraint-Logik zwischen `slot_id`, `med_id` und `day` sauber festziehen.
  - `S3.3` muss definieren, wie der bisherige Medication-Bestand sauber verworfen und durch einen klaren Neu-Start ersetzt wird.
  - `S4` kann spaeter ein kompaktes Read-Model auf genau diesen drei Ebenen aufbauen.

- Check-Ergebnis:
  - Das Zielbild bleibt konsistent mit den S2-Guardrails:
    - kein klinischer Planer
    - kein Zeitlogik-Creep
    - klare Trennung von Stammdaten, Plan und Event-Log
    - `1x taeglich` bleibt als Spezialfall von `genau 1 Slot` voll natuerlich abbildbar.

#### S3.2 Ergebnisprotokoll (abgeschlossen)
- Ziel von `S3.2`:
  - Das neue Modell braucht nicht nur Tabellen, sondern harte Regeln dafuer, dass spaetere Confirm-/Undo-Pfade:
    - atomar
    - idempotent
    - konfliktarm
    - fachlich eindeutig
    bleiben.

- Constraints fuer `health_medications`:
  - Bestehende Owner-/Basisregeln bleiben erhalten:
    - `user_id` Pflicht
    - `stock_count >= 0`
    - `low_stock_days >= 0`
  - `dose_per_day` darf in der Uebergangsphase noch existieren, ist aber nicht mehr die spaetere Source of Truth fuer Multi-Dose.
  - Falls `mit Mahlzeit` spaeter als boolesches Feld auf `health_medications` landet:
    - kein eigener Constraint ausser klarer Default (`false`)
    - keine Koppelung an Slot-Anzahl oder Event-Existenz

- Constraints fuer `health_medication_schedule_slots`:
  - Pflichtfelder:
    - `user_id`
    - `med_id`
    - `sort_order`
    - `qty_per_slot`
  - Basis-Checks:
    - `qty_per_slot > 0`
    - `sort_order >= 0`
    - `start_date <= end_date`, falls `end_date` gesetzt ist
  - Fremdschluessel:
    - `med_id` referenziert `health_medications(id)`
  - Eindeutigkeitsregel fuer Sortierung:
    - `UNIQUE (user_id, med_id, start_date, sort_order)` ist fuer V1 die sauberste Arbeitsannahme
  - Zweck:
    - innerhalb eines aktiven Plans darf ein Slot keine doppelte Position tragen
    - Planwechsel mit neuem `start_date` bleiben prospektiv modellierbar

- Warum kein Unique auf `slot_label`:
  - Labels sind nur alltagsnahe Anzeigehilfe.
  - Die fachliche Identitaet eines Slots ist nicht `Morgen` oder `Abend`, sondern:
    - zu welchem Medikament gehoert er
    - in welchem Plan gilt er
    - an welcher Position steht er
  - Dadurch bleibt das Modell robust gegen:
    - unlabeled Slots
    - doppelte freie Labels
    - spaetere Umbenennungen

- Constraints fuer `health_medication_slot_events`:
  - Pflichtfelder:
    - `user_id`
    - `med_id`
    - `slot_id`
    - `day`
    - `qty`
    - `taken_at`
  - Basis-Checks:
    - `qty > 0`
  - Fremdschluessel:
    - `med_id` referenziert `health_medications(id)`
    - `slot_id` referenziert `health_medication_schedule_slots(id)`
  - Kern-Unique fuer Idempotenz:
    - `UNIQUE (user_id, slot_id, day)`
  - Fachliche Wirkung:
    - pro geplantem Slot darf es pro Kalendertag genau ein Taken Event geben
    - doppeltes Confirm wird technisch blockiert bzw. spaeter per RPC als idempotenter Erfolg behandelt

- Warum nicht nur `UNIQUE (med_id, day)`:
  - Das wuerde wieder in das alte Single-Dose-Modell zurueckkippen.
  - Mehrfach-Einnahmen brauchen bewusst mehrere Tagesereignisse pro Medikation.
  - Die kleinste eindeutige Tages-Unit ist deshalb `slot_id + day`, nicht `med_id + day`.

- Optionale Konsistenzregel zwischen Event und Slot:
  - Fachlich muss ein Event zu genau dem Medikament des referenzierten Slots gehoeren.
  - Diese Konsistenz kann spaeter abgesichert werden ueber:
    - RPC-Logik als Pflichtpfad
    - und optional zusaetzlich ueber Trigger/Constraint-Check
  - Entscheidung fuer V1-Design:
    - die Roadmap verlangt diese Konsistenz fachlich
    - die konkrete technische Durchsetzung wird in `S4`/SQL-Implementierung entschieden
  - Grund:
    - zusammengesetzte FK-/Check-Konstruktionen wuerden `S3.2` unnoetig verkomplizieren
    - wichtiger ist, dass der Write-Pfad nie `slot_id` und fremdes `med_id` mischen darf

- Regel fuer aktive Plaene und Event-Erzeugung:
  - Ein Event darf nur fuer einen an diesem Tag gueltigen Slot entstehen.
  - Das bedeutet fachlich:
    - Tag muss innerhalb `start_date` / `end_date` liegen
    - Slot und Medication muessen aktiv sein
  - Diese Regel ist eher Write-Contract als rohe Tabellen-Constraint und wird deshalb primaer ueber RPCs erzwungen.

- Idempotenz- und Undo-Folgen:
  - Confirm:
    - erster Insert fuer `slot_id + day` erzeugt Event und reduziert Bestand
    - erneuter Confirm auf denselben Slot/Tag darf keinen zweiten Verbrauch erzeugen
  - Undo:
    - entfernt genau dieses eine Event
    - stellt genau diese Slot-Menge wieder her
    - darf keine anderen Slots desselben Tages beruehren
  - Daraus folgt:
    - Slot-Events sind die einzig gueltige technische Einheit fuer Multi-Dose-Undo

- Legacy-Koexistenz:
  - Fuer den geplanten Umbau ist keine dauerhafte Koexistenz zwischen alter Tageshistorie und neuen Slot-Events erforderlich.
  - Das senkt Komplexitaet deutlich:
    - keine Dual-Read-Phase fuer produktive Medication-Daten
    - keine semantische Vermischung von Tages-Boolean und Slot-Events
  - Die exakte Reset-Regel folgt in `S3.3`.

- Bewusst nicht als V1-Constraint modelliert:
  - kein Unique auf Labels
  - kein Pflichtfeld fuer Uhrzeiten
  - kein `missed`-Status-Constraint
  - keine Push-/Reminder-Tabellen
  - keine Mahlzeiten-/Essenskopplung
  - keine erzwungene globale Limitierung auf maximal `4` Slots
  - Grund:
    - Produktvertrag soll reale Faelle bis `4x taeglich` gut tragen
    - Datenmodell soll aber nicht schon in S3 kuenstlich enger sein als der fachliche Vertrag

- Konsequenz fuer die Folgeschritte:
  - `S3.3` kann jetzt auf stabilen technischen Tageseinheiten aufbauen.
  - `S4` bekommt eine klare Grundlage fuer:
    - idempotentes `confirm slot`
    - deterministisches `undo slot`
    - kompakten Tagesfortschritt aus `count(events)` vs `count(active slots)`

- Check-Ergebnis:
  - Die Unique-/Constraint-Entscheidungen stuetzen genau den gewuenschten V1-Vertrag:
    - mehrere Slots pro Medikation und Tag
    - trotzdem genau ein Event pro geplantem Slot und Tag
    - keine Rueckkehr zur alten Tages-Boolean-Grobheit
    - keine vorschnelle Zeitlogik oder klinische Uebermodellierung.

#### S3.3 Ergebnisprotokoll (abgeschlossen)
- Grundentscheidung fuer die Migration:
  - Fuer diesen Umbau wird kein produktiver Legacy-Backfill mehr gebaut.
  - Stattdessen gilt:
    - bisheriger Medication-Bestand darf bewusst komplett verworfen werden
    - Medikamente werden danach unter dem neuen Multi-Dose-Vertrag neu angelegt
  - Diese Entscheidung ist fachlich vertretbar, weil:
    - es aktuell nur sehr wenige Medikamente betrifft
    - du den Bestand selbst kennst
    - die Medikamente unter der neuen Logik ohnehin neu erstellt werden muessen

- Ziel von `S3.3`:
  - kein halbkompatibles Uebergangsmodell bauen
  - kein unsauberes Mischen aus alter Tages-Boolean-Historie und neuem Slot-Modell
  - stattdessen einen eindeutigen Startzustand fuer `S4` bis `S8` definieren

- Reset-Strategie fuer den Medication-Bereich:
  - Der Umbau darf den bisherigen produktiven Medication-Datenbestand bewusst kappen.
  - Betroffen sein duerfen:
    - bestehende Medication-Stammsaetze
    - bestehende taegliche Dose-Eintraege
    - bestehende Low-Stock-Ack-Zustaende
    - bestehende Medication-spezifische Bestandskontexte
  - Danach startet der Bereich mit:
    - neuem Datenmodell
    - leerem Medication-Bestand
    - manueller Neuerfassung der aktuell relevanten Medikamente

- Produktregel fuer den Neustart:
  - Der erste gueltige Multi-Dose-Zustand entsteht nicht durch technische Uebernahme alter Datensaetze, sondern durch bewusste Neuanlage im neuen Planeditor.
  - Damit gilt:
    - keine versteckte Semantik-Alteingabe
    - kein `legacy default slot`
    - keine kuenstlich gerettete Tageshistorie

- Behandlung alter Tabellen und Daten:
  - `health_medications`:
    - darf fuer den Nutzerbestand geleert oder durch ein neues Schema ersetzt werden
  - `health_medication_doses`:
    - darf geleert, ersetzt oder ganz entfernt werden
  - `health_medication_stock_log`:
    - kann ebenfalls geleert werden, wenn sie nur Altbestand betrifft
    - sie ist kein migrationskritischer Langzeitverlauf
  - Wichtiger Guard:
    - kein teilweiser Erhalt einzelner Medication-Reste, wenn dadurch semantische Mischzustaende entstehen

- Reset-Semantik fuer SQL und App:
  - Nach Anwendung des neuen Schemas gilt produktiv:
    - Medication Read-Model erwartet nur noch das neue Slot-/Event-Modell
    - UI rendert nur noch Medikamente, die unter dem neuen Vertrag angelegt wurden
    - Push/Incident, Intake und Voice bauen nicht mehr auf alte Tages-Boolean-Daten
  - Das vermeidet:
    - Dual-Read-Logik
    - Migrationsadapter im Frontend
    - Legacy-Sonderpfade in RPCs

- Was trotzdem stabil bleiben muss:
  - der `1x taeglich`-Flow als Nutzererlebnis
  - die grundsaetzliche Low-Stock-/Runout-Funktion
  - der enge `medication_confirm_all`-Pfad
  - die Modulgrenzen zwischen Medication, Intake, Push, Profile und Voice
  - Das heisst:
    - wir kappen Datenbestand
    - aber nicht die Produktprinzipien

- Guard gegen zu harten Umbau:
  - Reset ist nur fuer den Medication-Bereich akzeptiert.
  - Andere MIDAS-Bereiche wie Intake, Profile, BP, Doctor, Reports oder Termine werden dadurch nicht mitgerissen.
  - Der Reset darf also kein allgemeines Muster fuer andere Module werden, sondern ist eine bewusste Vereinfachung fuer genau diesen Umbau.

- Operative Folge fuer die spaeteren Schritte:
  - `S4` kann RPCs direkt fuer das neue Modell schreiben, ohne Legacy-Kompatibilitaetsfessel.
  - `S5` kann den Planeditor ohne Ruecksicht auf Altformate bauen.
  - `S6` kann den IN-Tab direkt auf Progress-/Slot-States ausrichten.
  - `S7` kann Low-Stock und Runout direkt auf den aktiven Tagesplan rechnen.
  - `S8` kann Voice/Fast-Paths ohne Altsemantik neu absichern.

- Konkrete Startzustands-Regel:
  - Nach dem Umbau ist `kein Medication-Datensatz` ein gueltiger und erwarteter Zwischenzustand.
  - Erst nach manueller Neuerfassung deiner Medikamente wird der Bereich wieder produktiv genutzt.
  - Diese Leere ist fachlich besser als eine halbkorrekte automatische Migration.

- Check-Ergebnis:
  - Die Reset-/Neuanlage-Strategie senkt Komplexitaet, SQL-Risiko und UI-Drift deutlich.
  - Sie passt zu deinem realen Fall besser als eine konservative Legacy-Migration.
  - `S3.4` kann jetzt ohne Legacy-Vertrag nur noch die Planwechsel-Regel innerhalb des neuen Modells festziehen.

#### S3.4 Ergebnisprotokoll (abgeschlossen)
- Ausgangslage:
  - Durch den bewussten Medication-Reset gibt es keine produktive Legacy-Migration mehr.
  - Planwechsel muessen deshalb nur noch innerhalb des neuen Modells sauber geregelt werden.
  - Die Kernfrage ist jetzt nicht mehr:
    - wie alte Tages-Boolean-Daten ueberfuehrt werden
  - sondern:
    - wie ein bestehendes Medikament spaeter von Plan A auf Plan B wechselt, ohne Verlauf und Tageslogik zu verfaelschen

- Grundregel fuer Planwechsel:
  - Planwechsel wirken immer prospektiv.
  - Ein neuer Slot-Plan gilt ab einem klaren Startdatum.
  - Vergangene Tage behalten die Plan- und Event-Semantik, die zum damaligen Zeitpunkt galt.

- Warum diese Regel fuer MIDAS richtig ist:
  - Sie verhindert rueckwirkende Neuinterpretation bereits bestaetigter Einnahmen.
  - Sie haelt Undo, Fortschritt, Bestand und Verlauf logisch stabil.
  - Sie passt zu deinem Alltag:
    - Wenn sich ein Medikament oder Einnahmeschema aendert, aendert sich die Zukunft
    - nicht kuenstlich die Vergangenheit

- Fachliche Definition des Planwechsels:
  - Ein Medication-Stammsatz bleibt dieselbe fachliche Identitaet.
  - Was sich aendert, ist der aktive Satz geplanter Slots.
  - Ein Planwechsel bedeutet daher:
    - bisherige Slots enden spaetestens am Tag vor dem neuen Planstart
    - neue Slots beginnen am definierten neuen Planstart
  - Es gibt nie zwei konkurrierende aktive Plaene fuer dieselbe Medication am selben Tag.

- Gueltigkeitsregel fuer Slot-Plaene:
  - Jeder Slot traegt seine eigene Gueltigkeit ueber:
    - `start_date`
    - optional `end_date`
    - `active`
  - Fuer einen konkreten Kalendertag duerfen nur Slots zaehlen, die an diesem Tag gueltig sind.
  - Das ist die Grundlage fuer:
    - `total_count`
    - offene Slots
    - Tagesverbrauch
    - Low-Stock-/Runout-Berechnung

- Erlaubte Planwechsel-Faelle:
  - `1x taeglich` -> `2x taeglich`
  - `2x taeglich` -> `1x taeglich`
  - `2x taeglich` -> `3x taeglich`
  - Label-Aenderung innerhalb gleicher Frequenz
    - z. B. `Abend` -> `Nacht`
  - temporaerer Medikament-Plan mit Enddatum
  - Reaktivierung oder spaetere Wiedereintragung mit neuem Startdatum

- Nicht erlaubte oder bewusst ausgeschlossene Planwechsel-Semantik:
  - keine rueckwirkende Umschreibung bereits vergangener Tagesereignisse
  - kein automatisches Umpacken alter Slot-Events in einen neuen Plan
  - kein Mischen mehrerer gleichzeitiger aktiver Planversionen fuer denselben Tag
  - keine stillschweigende Plan-Aenderung ohne sichtbares neues Startdatum

- Regel fuer denselben Kalendertag:
  - V1 braucht eine einfache und deterministische Linie.
  - Deshalb gilt:
    - wenn ein Plan geaendert wird, beginnt der neue Plan fruehestens am naechsten sinnvollen Gueltigkeitstag
  - Praeferierte V1-Regel:
    - kein intraday Planwechsel mit geteilter Tageslogik
  - Das heisst praktisch:
    - Tagesereignisse fuer heute laufen gegen den heute gueltigen Plan
    - geaenderte Plaene werden fuer morgen oder ein explizites kuenftiges Startdatum wirksam

- Warum kein intraday Planwechsel in V1:
  - Wuerde sofort neue Spezialfaelle erzeugen:
    - welche offenen Slots von heute zaehlen noch
    - wie verhalten sich bereits bestaetigte Slots
    - wie wird Bestand anteilig neu berechnet
    - was zeigt der IN-Tab bei Planwechsel mitten im Tag
  - Das waere fuer MIDAS unnoetige Komplexitaet ohne echten Alltagsgewinn.

- Beziehung zu temporaeren Medikamenten:
  - Start-/Enddatum bleiben dieselbe Grundmechanik wie beim Planwechsel.
  - Ein Antibiotikum mit begrenzter Laufzeit ist fachlich:
    - Medication + Slot-Plan + Start/Ende
  - kein Sondermodell.

- Konsequenz fuer spaetere SQL-/RPC-Arbeit:
  - `S4` muss Write-Pfade so bauen, dass Plan-Aenderungen:
    - neue Slots mit neuer Gueltigkeit anlegen
    - alte Slots sauber beenden oder deaktivieren
    - keine alten Tagesevents anfassen
  - Read-Model fuer einen Tag darf nur den an diesem Tag gueltigen Plan sehen.

- Konsequenz fuer UI:
  - `S5` braucht im Planeditor ein klares Startdatum fuer neue oder geaenderte Plaene.
  - `S6` muss nicht erklaeren, warum heute ploetzlich halbe Plaene parallel gelten.
  - Das haelt den Tagesflow ruhig.

- Check-Ergebnis:
  - Die Planwechsel-Regel ist jetzt einfach und belastbar:
    - prospektiv
    - ohne Rueckwirkung
    - ohne intraday Mischlogik
    - kompatibel mit temporaeren Medikamenten und spaeteren Plananpassungen.

#### S3.5 Ergebnisprotokoll (abgeschlossen)
- Ziel von `S3.5`:
  - Low-Stock, `days_left` und `runout_day` duerfen im Multi-Dose-Modell nicht mehr aus einem alten Tagesblock `dose_per_day` abgeleitet werden.
  - Stattdessen muessen sie sich aus dem aktuell gueltigen Tagesplan ergeben.

- Neue Grundregel:
  - Die taegliche Sollmenge eines Medikaments ist die Summe aller an diesem Tag gueltigen Slot-Mengen.
  - Formel:
    - `daily_planned_qty = sum(qty_per_slot aller aktiven Slots fuer diesen Tag)`
  - Diese Summe ist die neue fachliche Basis fuer:
    - `days_left`
    - `runout_day`
    - `low_stock`

- Quelle der Wahrheit:
  - Nicht mehr:
    - `health_medications.dose_per_day`
  - Sondern:
    - aktiver Slot-Plan des jeweiligen Medikaments am betrachteten Tag

- Berechnung von `days_left`:
  - V1-Regel:
    - `days_left = floor(stock_count / daily_planned_qty)`
  - Guard:
    - nur wenn `daily_planned_qty > 0`
  - Wenn kein aktiver Plan oder keine aktiven Slots existieren:
    - `days_left` ist fachlich nicht sinnvoll ableitbar
    - Read-Model soll dann keinen normalen Verbrauch vortaeuschen

- Bedeutung von `days_left` im neuen Modell:
  - `days_left` beschreibt nicht mehr eine abstrakte Medikationszahl pro Tag.
  - Es beschreibt:
    - wie viele volle Tage der aktuelle Bestand unter dem aktuell gueltigen Tagesplan noch traegt

- Berechnung von `runout_day`:
  - `runout_day` bleibt ein abgeleiteter Lesewert.
  - Er basiert auf:
    - heutigem Bestand
    - heutigem aktiven Plan
    - heutigem Einnahmestatus
  - V1-Logik:
    - wenn fuer heute bereits Slot-Events bestaetigt wurden, ist der verbleibende Restverbrauch fuer heute kleiner als die volle Tagesmenge
    - dadurch darf `runout_day` nicht so tun, als sei heute noch die volle Sollmenge offen

- Praktische Rechenregel fuer den Tageskontext:
  - `daily_planned_qty = Summe aller aktiven Slot-Mengen fuer heute`
  - `daily_taken_qty = Summe aller heute bestaetigten Slot-Events`
  - `daily_remaining_qty = max(daily_planned_qty - daily_taken_qty, 0)`
  - Daraus folgt:
    - Bestand nach heute = `stock_count - daily_remaining_qty`, wenn fuer die Prognose der noch offene Resttag beruecksichtigt wird
  - Alternativ lesbar:
    - `runout_day` muss progress-aware sein, nicht nur plan-aware

- Warum Progress-Awareness wichtig ist:
  - Sonst wuerde ein `2x taeglich`-Medikament mittags noch so wirken, als waere die volle Tagesmenge offen, obwohl bereits ein Slot bestaetigt wurde.
  - Das waere fachlich falsch fuer:
    - Resttage
    - Aufbrauchdatum
    - Low-Stock-Wahrnehmung

- Low-Stock-Regel im neuen Modell:
  - `low_stock` bleibt ein Medikament-Level-Signal.
  - Es basiert auf:
    - `days_left`
    - user-spezifischem `low_stock_days`
  - V1-Regel:
    - `low_stock = true`, wenn `days_left <= low_stock_days`
  - Das Prinzip bleibt also gleich, aber die Berechnungsbasis ist jetzt der echte aktive Tagesplan.

- Beziehung zu `mit Mahlzeit`:
  - `mit Mahlzeit` hat keinen Einfluss auf `days_left`, `runout_day` oder `low_stock`.
  - Es bleibt ein Hinweisfeld, kein Verbrauchsmultiplikator und keine neue Rechenlogik.

- Sonderfaelle:
  - Kein aktiver Plan:
    - kein normaler `days_left`-/`runout_day`-Wert
    - kein Verbrauchsmodell vortaeuschen
  - Startdatum in der Zukunft:
    - vor Start kein aktiver Tagesverbrauch
    - daher kein aktuelles Low-Stock aus diesem Plan ableiten
  - Enddatum in der Vergangenheit:
    - kein weiterer Verbrauch
    - keine aktuelle Low-Stock-Relevanz

- Guard gegen zu viel Mathematik in V1:
  - V1 rechnet nur gegen den aktuell aktiven Tagesplan.
  - V1 simuliert nicht:
    - wechselnde Zukunftsplaene ueber viele Tage
    - variable Wochenmuster
    - klinische Intervallregime
  - Das heisst:
    - `days_left` und `runout_day` sind alltagstaugliche Prognosewerte fuer den aktuellen Plan
    - nicht ein komplexes Forecast-System

- Konsequenz fuer `S4`:
  - Read-RPCs muessen mindestens liefern oder intern ableiten:
    - `daily_planned_qty`
    - `daily_taken_qty`
    - `daily_remaining_qty`
    - `days_left`
    - `runout_day`
    - `low_stock`
  - Write-RPCs muessen den Bestand pro bestaetigtem Slot veraendern, damit diese Werte live konsistent bleiben.

- Konsequenz fuer `S7`:
  - Incident-/Low-Stock-Logik kann spaeter direkt auf dieser plan- und progress-bewussten Verbrauchsbasis aufsetzen.

- Check-Ergebnis:
  - Die Bestandslogik bleibt im neuen Modell:
    - simpel genug fuer MIDAS
    - korrekt genug fuer Mehrfach-Einnahmen
    - kompatibel mit `1x taeglich`
    - frei von unnötiger Intervall- oder Forecast-Komplexitaet.

#### S3.6 Schritt-Abnahme (abgeschlossen)
- Datenmodell-Abnahme gegen den Produktvertrag:
  - `S3` bleibt voll kompatibel mit dem in `S2` definierten V1-Vertrag:
    - count-/order-based Slots
    - kein klinischer Planner
    - kein Reminder-/Zeitlogik-Creep
    - `1x taeglich` als natuerlicher Spezialfall von `1 Slot`
  - Das Zielmodell stuetzt genau die benoetigte Produktform:
    - Medication-Stammsatz
    - geplanter Tagesplan
    - tatsaechliche Slot-Events

- Migrations-/Reset-Abnahme:
  - Die Entscheidung fuer einen bewussten Medication-Reset ist mit dem restlichen S3-Modell konsistent.
  - Kein Teil von `S3` setzt mehr voraus:
    - Legacy-Backfill
    - Dual-Read
    - `legacy default slot`
    - Rueckrettung alter Tageshistorie
  - Damit ist der Startzustand fuer den Umbau fachlich eindeutig.

- SQL-/Schema-Risiko-Check:
  - Es gibt keine offensichtliche Rueckkehr zur alten Tages-Boolean-Semantik.
  - Die kleinste gueltige Tageseinheit bleibt:
    - `slot_id + day`
  - Die Bestandslogik ist direkt auf Slot-Progress und aktiven Plan ausgerichtet.
  - Planwechsel bleibt prospektiv und ohne intraday Mischlogik.

- Dead-Path-/Ballast-Check:
  - Durch den Reset-Entscheid wurde frueherer Legacy-Ballast aus dem Zielvertrag entfernt.
  - Kein S3-Teil haengt jetzt noch an:
    - konservativem Backfill
    - Legacy-Koexistenz als Pflicht
    - kuenstlicher Slot-Historisierung
  - Das senkt das Risiko spaeterer toter RPC-Aeste und Frontend-Adapter deutlich.

- Offene technische Punkte, aber kein S3-Blocker:
  - exakte SQL-Namensgebung der neuen Tabellen/Felder
  - konkrete FK-/Trigger-Durchsetzung fuer Event-Slot-Med-Konsistenz
  - genaue RPC-Signaturen
  - diese Punkte gehoeren bewusst nach `S4`, nicht mehr in den fachlichen S3-Vertrag

- Check-Ergebnis:
  - `S3` ist als Datenmodell- und Migrationsgrundlage tragfaehig genug, um den RPC-/Read-Write-Umbau in `S4` zu starten.

#### S3.7 Doku-Sync (abgeschlossen)
- Doku-Entscheid:
  - Die S3-Ergebnisse sind ein Zielvertrag fuer Schema und Migration, aber noch kein umgesetzter SQL-/RPC-Zustand.
  - Deshalb bleiben `docs/modules/*` auch nach `S3` weiterhin bewusst beim aktuellen Produktivzustand.

- Durchgefuehrter Doku-Sync:
  - Die Roadmap selbst traegt jetzt den vollstaendigen S3-Vertrag:
    - Zieltabellen
    - Constraints
    - Reset-Strategie
    - Planwechsel-Regel
    - Bestandslogik
  - Zusaetzlich bleibt der bereits gesetzte Dokumentstatus-Hinweis in
    [Medication Management Module Spec.md](c:\Users\steph\Projekte\M.I.D.A.S\docs\archive\Medication%20Management%20Module%20Spec.md)
    weiterhin korrekt:
    - bestehende Spec = Single-Dose-Ist-Zustand
    - neue Roadmap = kuenftiger Multi-Dose-Vertrag

- Produktregel fuer den weiteren Doku-Sync:
  - `docs/modules/Medication Module Overview.md`, `docs/modules/Intake Module Overview.md`, `docs/modules/Push Module Overview.md` und `docs/QA_CHECKS.md` werden erst dann fachlich umgeschrieben, wenn `S4` bis `S8` den jeweiligen Codevertrag real aendern.
  - Damit bleibt die Doku-Hierarchie sauber:
    - Modul-Overviews = Ist-Zustand
    - Roadmap = Umbauvertrag

- Check-Ergebnis:
  - Kein Dokument behauptet vorzeitig einen bereits ausgerollten Multi-Dose-SQL- oder RPC-Stand.

#### S3.8 Commit-Empfehlung (abgeschlossen)
- Empfehlung:
  - Ja, nach `S3` ist wieder ein eigener Commit sinnvoll.

- Begruendung:
  - `S3` schliesst einen eigenstaendigen Architekturblock sauber ab:
    - Datenmodell
    - Constraints
    - Reset-/Neuanlage-Strategie
    - Planwechsel-Regel
    - Bestandslogik
  - Das ist ein sinnvoller Commit-Schnitt vor `S4`, weil ab dort echte API-/RPC- und spaeter Code-Vertraege folgen.

- Warum nicht mit `S4` buendeln:
  - `S4` ist der Uebergang von Architekturvertrag zu konkretem SQL-/RPC-Design.
  - Das ist wieder ein neuer Risikotyp:
    - Funktionssignaturen
    - Read-Model
    - idempotente Write-Pfade
    - Call-Site-Kompatibilitaet
  - Fuer deine Arbeitsweise ist es sauberer, Architektur und API-Umbau zu trennen.

- Empfohlene Commit-Semantik:
  - Fokus des Commits:
    - Medication Multi-Dose Datenmodell und Reset-Strategie fachlich finalisiert
  - Kein Implementierungsclaim:
    - dieser Commit beschreibt Architektur und Migration, nicht die fertige SQL-/Frontend-Umsetzung

- Check-Ergebnis:
  - `S3` ist als abgeschlossener Roadmap-Block commit-wuerdig.
  - Naechster Arbeitsblock startet sauber mit `S4`.

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

#### S4.1 Ergebnisprotokoll (abgeschlossen)
- Ziel von `S4.1`:
  - Das neue Medication-Read-Model muss kompakt genug fuer den IN-Tab bleiben, aber stark genug sein fuer:
    - Progress-UI
    - Slot-Confirm/Undo
    - Low-Stock/Runout
    - aggregierte Incident-Logik
    - engen Voice-/Fast-Path
  - Es darf nicht wieder in einen flachen Tages-Boolean-Vertrag zurueckfallen.

- Grundform des Read-Models:
  - Ein Tages-Read fuer Medication liefert weiterhin eine Liste von Medikationseintraegen fuer genau einen Kalendertag.
  - Jeder Eintrag repraesentiert:
    - den Medication-Stammsatz
    - den fuer diesen Tag gueltigen Plan
    - den heutigen Fortschritt
    - die heutigen Slot-Details

- Empfohlene Top-Level-Struktur pro Medication:
  - `id`
  - `name`
  - `ingredient`
  - `strength`
  - `leaflet_url`
  - `active`
  - `stock_count`
  - `low_stock_days`
  - `low_stock`
  - `days_left`
  - `runout_day`
  - `with_meal`
  - `plan_active`
  - `daily_planned_qty`
  - `daily_taken_qty`
  - `daily_remaining_qty`
  - `total_count`
  - `taken_count`
  - `state`
  - `slots`

- Bedeutung der neuen Top-Level-Felder:
  - `plan_active`
    - zeigt, ob fuer diesen Tag ueberhaupt ein gueltiger Plan existiert
  - `daily_planned_qty`
    - Summe aller aktiven Slot-Mengen fuer den Tag
  - `daily_taken_qty`
    - Summe aller bestaetigten Slot-Mengen fuer den Tag
  - `daily_remaining_qty`
    - noch offene Sollmenge fuer den Tag
  - `total_count`
    - Anzahl geplanter Slots fuer den Tag
  - `taken_count`
    - Anzahl bereits bestaetigter Slots fuer den Tag
  - `state`
    - `open`
    - `partial`
    - `done`

- Warum das Read-Model Progress und Menge gleichzeitig tragen muss:
  - Der IN-Tab braucht vor allem:
    - `taken_count / total_count`
    - Slot-Status
  - Low-Stock/Runout brauchen:
    - Mengenbasis
    - Bestandskontext
  - Push/Voice brauchen:
    - eine kompakte Aussage, ob fuer heute noch offene Einnahmen existieren
  - Deshalb reicht weder nur ein Slot-Array noch nur ein Mengenblock.

- Empfohlene Slot-Struktur pro Eintrag:
  - Jeder Slot in `slots[]` soll mindestens tragen:
    - `slot_id`
    - `label`
    - `sort_order`
    - `qty`
    - `is_taken`
    - `taken_at`
    - `day`
  - Optional spaeter:
    - `start_date`
    - `end_date`
  - V1-Read fuer den IN-Tab braucht diese Gueltigkeitsfelder aber nicht zwingend sichtbar, solange nur die fuer den Tag aktiven Slots ausgeliefert werden.

- Bedeutungsregel fuer `slots[]`:
  - `slots[]` enthaelt nur die fuer den angefragten Tag gueltigen Slots.
  - Nicht enthalten sind:
    - abgelaufene Slots
    - zukuenftige Slots
    - inaktive Planreste
  - Dadurch bleibt das Read-Model fuer den Daily Flow ruhig und direkt nutzbar.

- Empfohlene Ableitungsregel fuer `state`:
  - `open`, wenn `taken_count = 0`
  - `partial`, wenn `0 < taken_count < total_count`
  - `done`, wenn `taken_count = total_count`
  - Wenn `plan_active = false` oder `total_count = 0`:
    - das Medication-Read-Model soll keinen falschen Tagesabschluss vortaeuschen
    - fachlich ist das eher `nicht im heutigen Plan`

- Wichtige Product-Guard-Entscheidung:
  - Das Read-Model soll keine harte Uhrzeit oder Slot-Deadline transportieren.
  - Also bewusst nicht noetig in V1:
    - `scheduled_time`
    - `missed`
    - `due_in_minutes`
    - Reminder-Metadaten

- Read-Contract fuer Push und Voice:
  - Push und Voice sollen nicht ihr eigenes Spezialmodell bekommen.
  - Sie lesen denselben Tages-Contract wie der IN-Tab.
  - Dafuer reicht auf Aggregat-Ebene:
    - `plan_active`
    - `state`
    - `taken_count`
    - `total_count`
  - Daraus koennen sie ableiten:
    - gibt es heute offene Medication
    - ist etwas teilweise erledigt
    - sind alle offenen Einnahmen bereits done

- Read-Contract fuer Batch- und Fast-Path:
  - Das Model muss eindeutig genug sein, um spaeter:
    - `alle offenen Einnahmen fuer heute`
    - oder einzelne offene Slots
    sicher zu identifizieren
  - Deshalb ist `slots[]` mit `slot_id` Pflicht und kein optionaler UI-Anhang.

- Bewusst nicht Teil des V1-Read-Models:
  - keine Legacy-Tages-Boolean-Felder wie:
    - `taken`
    - `qty` als kompletter Tagesblock
  - keine Mischform aus altem und neuem Vertrag
  - keine Historienlisten ueber mehrere Tage
  - kein Push-/Incident-Status im Medication-Read selbst
  - kein eigener Voice-Hinweiszustand

- Beispielhafte Leselogik fuer einen Medication-Eintrag:
  - `Rosuvastatin`
    - `stock_count = 28`
    - `daily_planned_qty = 1`
    - `daily_taken_qty = 0`
    - `daily_remaining_qty = 1`
    - `taken_count = 0`
    - `total_count = 1`
    - `state = open`
    - `slots = [Abend]`
  - `Antibiotikum`
    - `stock_count = 10`
    - `daily_planned_qty = 3`
    - `daily_taken_qty = 1`
    - `daily_remaining_qty = 2`
    - `taken_count = 1`
    - `total_count = 3`
    - `state = partial`
    - `slots = [Morgen, Mittag, Abend]`

- Konsequenz fuer `S4.2` und `S4.3`:
  - `S4.2` muss Write-RPCs definieren, die genau diese Slot- und Progress-Felder sauber fortschreiben.
  - `S4.3` muss sicherstellen, dass bestehende Call-Sites nicht mehr auf `taken=true fuer ganzen Tag` bauen.

- Check-Ergebnis:
  - Das neue Tages-Read-Model ist:
    - kompakt genug fuer den IN-Tab
    - voll nutzbar fuer Push und Voice
    - progress-aware
    - bestands-aware
    - frei von harter Zeit- und Reminder-Semantik.

#### S4.2 Ergebnisprotokoll (abgeschlossen)
- Ziel von `S4.2`:
  - Die Write-Seite darf im Multi-Dose-Modell nicht mehr auf `med_id + day = ganzer Tag erledigt` beruhen.
  - Der neue Vertrag muss drei Dinge sauber trennen:
    - Medication-Stammdaten schreiben
    - Slot-Plan schreiben
    - konkrete Tages-Slot-Events schreiben

- Write-Familien im neuen Modell:
  - Medication CRUD
  - Schedule-/Plan-Write
  - Slot-Confirm/Undo
  - Stock-Write
  - Low-Stock-Ack

- RPC A - Medication-Stammdaten upsert:
  - Arbeitstitel:
    - `med_upsert_v2`
  - Zweck:
    - Medikament unter neuem Vertrag anlegen oder bearbeiten
  - Empfohlene Eingaben:
    - `id` optional bei Update
    - `name`
    - `ingredient`
    - `strength`
    - `leaflet_url`
    - `stock_count`
    - `low_stock_days`
    - `active`
    - `with_meal`
  - Guard:
    - dieser RPC schreibt keine Tages-Slot-Events
    - und nicht stillschweigend den kompletten Plan, wenn Planpflege getrennt laeuft

- RPC B - Medication-Plan upsert:
  - Arbeitstitel:
    - `med_upsert_schedule_v2`
  - Zweck:
    - den gueltigen Slot-Plan einer Medication neu anlegen oder prospektiv aendern
  - Empfohlene Eingaben:
    - `med_id`
    - `effective_start_date`
    - `slots[]`
  - Empfohlene Slot-Struktur im Write:
    - `label`
    - `sort_order`
    - `qty`
    - optional spaeter `end_date`, wenn der Editor einzelne Slots abweichend beenden koennen soll
  - Fachliche Wirkung:
    - alte Planversionen werden sauber beendet/deaktiviert
    - neue Planversion beginnt prospektiv ab `effective_start_date`

- Warum Schedule-Write separat von Medication-Write:
  - Stammdaten und Plan haben unterschiedliche Lebenszyklen.
  - Dadurch bleiben spaeter klar moeglich:
    - Name aendern ohne Planwechsel
    - Planwechsel ohne Stammdatenmutation
    - temporaere Plananpassung mit neuem Startdatum

- RPC C - Slot bestaetigen:
  - Arbeitstitel:
    - `med_confirm_slot_v2`
  - Zweck:
    - genau einen geplanten Slot fuer einen Kalendertag bestaetigen
  - Pflichtparameter:
    - `slot_id`
    - `day`
  - Optional:
    - `taken_at`, wenn serverseitig nicht immer `now()` genutzt wird
  - Fachliche Wirkung:
    - idempotenter Insert des Slot-Events
    - Bestandsreduktion genau um die Slot-Menge
    - Rueckgabe des aktualisierten Tageszustands oder zumindest Erfolg + Reload-Trigger

- RPC D - Slot rueckgaengig machen:
  - Arbeitstitel:
    - `med_undo_slot_v2`
  - Zweck:
    - genau ein bestaetigtes Slot-Event fuer einen Kalendertag entfernen
  - Pflichtparameter:
    - `slot_id`
    - `day`
  - Fachliche Wirkung:
    - loescht genau das Event fuer `slot_id + day`
    - stellt genau diese Slot-Menge im Bestand wieder her
    - fasst keine anderen Slots desselben Tages an

- RPC E - Medication archivieren / aktiv setzen:
  - Arbeitstitel:
    - `med_set_active_v2`
  - Zweck:
    - Medication-Level Aktiv/Inaktiv sauber schalten
  - Pflichtparameter:
    - `med_id`
    - `active`
  - Guard:
    - kein Slot-Event-Write
    - keine Historienloeschung

- RPC F - Medication loeschen:
  - Arbeitstitel:
    - `med_delete_v2`
  - Zweck:
    - bewusstes Entfernen eines neu angelegten Medikaments im Reset-Modell
  - Guard:
    - muss deterministisch mit zugehoerigem Planbestand umgehen
    - keine halben Slot-Leichen hinterlassen
  - Konkrete Delete-Semantik wird spaeter in SQL entschieden:
    - hartes Delete
    - oder nur fuer ungenutzte Datensaetze

- RPC G - Stock-Korrektur:
  - Arbeitstitel:
    - `med_adjust_stock_v2`
    - `med_set_stock_v2`
  - Zweck:
    - manueller Restock/Korrekturpfad bleibt erhalten
  - Guard:
    - bleibt klar getrennt vom Einnahme-Event-Write
    - schreibt weiter gegen `health_medication_stock_log`

- RPC H - Low-Stock-Ack:
  - Arbeitstitel:
    - `med_ack_low_stock_v2`
  - Zweck:
    - bestaetigt den aktuellen Low-Stock-Zustand auf Medication-Level
  - Pflichtparameter:
    - `med_id`
    - `day`
    - `stock_snapshot`
  - Guard:
    - kein Slot- oder Plan-Write

- Wichtige Write-Regeln fuer Confirm/Undo:
  - Confirm und Undo arbeiten nur auf Slot-Ebene.
  - Es gibt keinen neuen V2-RPC:
    - `confirm whole medication day`
  - Batch- und Fast-Paths werden spaeter im Client orchestriert, nicht als eigener grober Serververtrag.

- Batch-Flow-Regel fuer spaetere Call-Sites:
  - `alle offenen Einnahmen bestaetigen` bedeutet:
    - mehrfaches Ausfuehren von `med_confirm_slot_v2` fuer alle offenen Slots des Tages
  - nicht:
    - ein versteckter Sammel-RPC mit impliziter Tageskomplettlogik
  - Das haelt den Serververtrag deterministisch und testbar.

- Rueckgabe-Strategie der Write-RPCs:
  - V1-Praeferenz:
    - Write-RPCs geben kompakten Erfolg zurueck
    - danach laedt der Client den Tages-Read neu
  - Warum:
    - einfacher, robuster und konsistenter fuer den Umbau
    - kein Zwang, jede Mutation sofort ein komplexes Vollmodell serverseitig zurueckzugeben
  - Optional spaeter:
    - Write + frischer Tages-Snapshot in einer Antwort

- Bewusst nicht Teil des Write-Vertrags:
  - kein Voice-spezifischer Write-RPC
  - kein Push-spezifischer Write-RPC
  - kein Reminder-/Missed-Write
  - kein Legacy-Adapter fuer alte Tages-Boolean-RPCs im neuen Kernvertrag

- Konsequenz fuer `S4.3`:
  - Die Rueckwaertskompatibilitaet muss jetzt nicht alte Med-Daten retten, sondern nur bestehende Call-Sites sauber auf den neuen Contract umbiegen.
  - Das Ziel bleibt:
    - keine produktive Stelle darf weiter denken in `medication today = taken true/false`

- Check-Ergebnis:
  - Der Write-Contract ist jetzt sauber getrennt nach:
    - Stammdaten
    - Plan
    - Slot-Events
    - Stock
    - Ack
  - Confirm/Undo bleiben atomar und slot-basiert.
  - Batch- und Voice-Faelle koennen spaeter auf denselben deterministischen Kern aufsetzen.

#### S4.3 Ergebnisprotokoll (abgeschlossen)
- Ziel von `S4.3`:
  - Der neue API-Vertrag soll alte Tages-Boolean-Call-Sites sauber ersetzen, aber keine lange Legacy-Doppelwelt erzeugen.
  - Wegen des bewussten Medication-Resets geht es hier nicht um Datenmigration, sondern um Codepfad-Migration.

- Ausgangslage:
  - Bestehende Frontend-Pfade erwarten heute:
    - flaches `taken`
    - flaches `taken_at`
    - flaches `qty`
    - `confirmMedication(medId, day)`
    - `undoMedication(medId, day)`
  - Diese Vertragsform darf im neuen Kern nicht erhalten bleiben.

- Grundregel fuer die Uebergangsstrategie:
  - Neuer SQL-/RPC-Kern zuerst.
  - Danach ein schmaler Client-Adapter.
  - Danach schrittweise Umstellung aller Call-Sites auf den neuen Tagesvertrag.
  - Zielbild:
    - genau ein produktiver Medication-Read-Contract
    - genau ein produktiver slot-basierter Write-Contract

- API-Strategie im Medication-Client:
  - `loadMedicationForDay(day)` darf als oeffentliche Einstiegsmethode bestehen bleiben.
  - Aber:
    - Rueckgabeform wird auf das neue Tages-Read-Model umgestellt
    - kein altes Flat-Mapping mehr auf `taken=true/false`
  - Das ist die wichtigste Rueckwaertskompatibilitaet:
    - stabiler Entry Point
    - neuer Inhalt

- Confirm-/Undo-Strategie:
  - Die bisherigen Client-Methoden
    - `confirmMedication(...)`
    - `undoMedication(...)`
    sind im neuen Modell fachlich zu grob.
  - V1-Empfehlung:
    - neue produktive Methoden einfuehren:
      - `confirmMedicationSlot(slotId, dayIso)`
      - `undoMedicationSlot(slotId, dayIso)`
    - alte Methoden nicht als echten Kernvertrag weiterfuehren

- Wie mit alten Helper-Namen umgehen:
  - Kurzfristig waehrend der Umstellung sind zwei Wege zulaessig:
    - alte Helper sofort entfernen und alle Call-Sites in einem Zug migrieren
    - oder alte Helper sehr kurzzeitig als lokale Adapter halten, die nur noch in klar benannten Uebergangspfaden leben
  - Praeferenz fuer MIDAS:
    - moeglichst schnelle Vollumstellung statt laengerer Adapterphase
  - Grund:
    - bewusster Reset macht lange Rueckwaertskompatibilitaet unnoetig
    - Doppelsemantik erzeugt nur Verwirrung

- Regeln fuer einen eventuellen Kurzzeit-Adapter:
  - Falls alte Helper fuer einen Zwischenschritt bleiben, dann nur mit enger Guard-Semantik:
    - `confirmMedication(medId, dayIso)` darf nicht stillschweigend `alle Slots` bestaetigen
    - er darf hoechstens:
      - bei exakt `1` offenem Slot den neuen Slot-RPC delegieren
      - sonst kontrolliert fehlschlagen oder vom Aufrufer ersetzt werden muessen
  - Damit wird verhindert, dass der alte Name unbemerkt falsche Produktsemantik weitertraegt.

- Call-Site-Migrationsreihenfolge:
  - Prioritaet 1:
    - Medication-Modul eigener State/Mapper
  - Prioritaet 2:
    - Intake Daily Flow
  - Prioritaet 3:
    - Incidents / Push
  - Prioritaet 4:
    - Hub / Text-Fast-Path
  - Prioritaet 5:
    - Voice
  - Prioritaet 6:
    - Profile Snapshot / Read-only Darstellung
  - Warum diese Reihenfolge:
    - erst Source-of-Truth und Haupt-UI
    - dann Downstream-Pfade

- Event-Vertrag:
  - Das bestehende Event `medication:changed` darf als Integrationsereignis bestehen bleiben.
  - Aber:
    - Payload-Semantik wird auf den neuen Tagesvertrag ausgerichtet
    - keine stillschweigende Annahme mehr, dass `data.medications[*].taken` existiert
  - Event bleibt also als Name stabil, aber fachlich modernisiert.

- Read-Compatibility-Regel:
  - Es wird keinen langfristigen Parallel-Output geben von:
    - altem Flat-Model
    - und neuem Slot-Model
  - Wenn ein Uebergangs-Mapping noetig ist, dann nur lokal und kurzlebig in den betroffenen Call-Sites.
  - Nicht im zentralen Read-RPC selbst.

- Warum das wichtig ist:
  - Ein gemischter Read-Contract waere die gefaehrlichste Drift-Stelle:
    - UI nutzt neue Felder
    - Push liest noch `taken`
    - Voice denkt noch in Tages-Boolean
  - Deshalb gilt:
    - lieber wenige kontrollierte Call-Site-Breaks
    - als ein weichgespueltes Mischmodell

- Delete-Strategie fuer Altvertrag:
  - Nach erfolgreicher Umstellung von `S5` bis `S8` sollen alte Tages-Boolean-Helper und Mapping-Felder aktiv entfernt werden.
  - Beispiele fuer spaeteren Abbau:
    - `taken`
    - `taken_at` als Medication-Level-Feld
    - `qty` als ganzer Tagesblock
    - `confirmMedication(medId, dayIso)` als Produkthelper
    - `undoMedication(medId, dayIso)` als Produkthelper

- Konsequenz fuer `S4.4`:
  - Atomicity und Idempotenz muessen auf dem neuen Kern so stark sein, dass die schrittweise UI-Migration kein Zustandslotto erzeugt.

- Check-Ergebnis:
  - Die API-Uebergangsstrategie ist bewusst kurz und entschlossen:
    - stabiler Einstiegspunkt fuer Read
    - neue Slot-Methoden fuer Write
    - keine lange Doppelwelt
    - kein verdecktes Weiterleben des alten Tages-Boolean-Vertrags.

#### S4.4 Ergebnisprotokoll (abgeschlossen)
- Ziel von `S4.4`:
  - Der neue Medication-Kern darf bei Mehrfach-Einnahmen kein Zustandslotto erzeugen.
  - Confirm/Undo muessen deshalb nicht nur fachlich korrekt, sondern auch technisch robust sein:
    - atomar
    - idempotent
    - bestandskonsistent
    - stock-log-konsistent

- Grundregel fuer Confirm:
  - `med_confirm_slot_v2(slot_id, day)` ist genau eine transaktionale Fachaktion:
    - Slot-Gueltigkeit fuer den Tag pruefen
    - pruefen, ob Event fuer `slot_id + day` bereits existiert
    - falls nicht vorhanden:
      - Event anlegen
      - Bestand um die Slot-Menge reduzieren
      - Stock-Log schreiben
    - falls bereits vorhanden:
      - keinen zweiten Verbrauch erzeugen
      - keinen zweiten Log-Eintrag erzeugen

- Grundregel fuer Undo:
  - `med_undo_slot_v2(slot_id, day)` ist ebenfalls genau eine transaktionale Fachaktion:
    - bestaetigtes Event fuer `slot_id + day` finden
    - falls vorhanden:
      - Event loeschen
      - Bestand um genau diese Slot-Menge erhoehen
      - Stock-Log schreiben
    - falls nicht vorhanden:
      - kein Bestandseffekt
      - kein Phantom-Undo

- Atomaritaets-Regel:
  - Event-Write und Bestandsaenderung duerfen nie auseinanderlaufen.
  - Das bedeutet:
    - kein erfolgreiches Slot-Event ohne passende Bestandsaenderung
    - keine Bestandsaenderung ohne passenden Event-Zustand
  - Technisch folgt daraus:
    - Confirm/Undo nur innerhalb einer DB-Transaktion
    - kein clientseitiges Nachziehen des Bestands als separater Schritt

- Idempotenz-Regel fuer Confirm:
  - Zweites Confirm auf denselben `slot_id + day` darf fachlich als no-op gelten.
  - Erlaubte Wirkung:
    - Erfolg ohne neue Mutation
    - oder kontrollierte Information `already confirmed`
  - Nicht erlaubt:
    - zweiter Bestandsabzug
    - zweiter `stock_log`-Eintrag
    - zweites Tagesevent

- Idempotenz-Regel fuer Undo:
  - Zweites Undo auf denselben `slot_id + day` darf ebenfalls nur no-op sein.
  - Nicht erlaubt:
    - zweiter Bestandsanstieg
    - zweiter Undo-Logeintrag

- Slot-Mengen-Regel:
  - Confirm/Undo arbeiten immer gegen die dem Slot zugeordnete Menge.
  - Nicht gegen:
    - eine aggregierte Tagesmenge
    - einen aus dem Client uebergebenen freien Mengenwert
  - Grund:
    - die serverseitige Slotdefinition bleibt Source of Truth
    - damit koennen Clientfehler keine falschen Mengen buchen

- Gueltigkeits- und Aktiv-Checks im Write-Pfad:
  - Confirm darf nur moeglich sein, wenn:
    - Slot existiert
    - Medication existiert
    - Medication aktiv ist
    - Slot fuer den Tag gueltig ist
  - Undo darf nur ein Event rueckgaengig machen, das unter genau diesem Vertrag entstanden ist.
  - Dadurch werden verhindert:
    - Writes auf abgelaufene Plaene
    - Writes auf deaktivierte Medikamente
    - Cross-link-Fehler zwischen Medication und Slot

- Regel fuer konkurrierende Requests:
  - Wenn zwei Confirms fast gleichzeitig auf denselben Slot laufen, darf am Ende trotzdem nur genau ein Event existieren.
  - Grundlage dafuer:
    - `UNIQUE (user_id, slot_id, day)`
    - transaktionaler Write-Pfad
  - Gleiches gilt fuer konkurrierende Undo-/Confirm-Folgen:
    - Endzustand muss dem letzten gueltigen Event-Zustand entsprechen
    - kein doppelter Bestandseffekt

- Rolle von `health_medication_stock_log` im neuen Modell:
  - `stock_log` bleibt die nachvollziehbare Spur fuer Bestandsveraenderungen.
  - Er dokumentiert weiterhin:
    - Confirm-bedingte Verbrauchsreduktion
    - Undo-bedingte Rueckbuchung
    - manuelle Restocks/Korrekturen
  - Multi-Dose aendert also nicht den Zweck des Logs, sondern die Granularitaet seines Ausloesers.

- Log-Semantik im neuen Modell:
  - Empfohlene Log-Reason-Typen:
    - `slot_confirm`
    - `slot_undo`
    - `stock_adjust`
    - `stock_set`
  - Optional zusaetzlich:
    - `slot_id`
    - `day`
    - `note/context`
  - Wichtig:
    - kein unklarer generischer `dose`-Reason mehr fuer Mehrfach-Einnahmen

- Was der Client nicht mehr tun darf:
  - nicht lokal raten, wie viel vom Bestand abzuziehen ist
  - nicht selbst `taken_count` inkrementieren und Bestand separat patchen
  - nicht auf Retry einen zweiten Verbrauch triggern
  - Der Client triggert nur die Fachaktion und laedt danach den Tageszustand neu.

- Fehlerverhalten:
  - Wenn Confirm/Undo fehlschlaegt, bleibt der Zustand unveraendert.
  - Keine Teilmutation darf nach aussen sichtbar werden.
  - Das gilt besonders fuer:
    - Event angelegt, Bestand aber nicht angepasst
    - Bestand angepasst, Event aber nicht angelegt
    - Log geschrieben, aber Fachaktion gescheitert

- Beziehung zu Batch- und Voice-Flows:
  - Batch und Voice duerfen spaeter mehrere Slot-Aktionen ausloesen.
  - Gerade deshalb muss jede Einzelaktion fuer sich voll robust sein.
  - Der Sammelcharakter entsteht im Client-Orchestrator, nicht im DB-Vertrag.

- Konsequenz fuer `S4.5`:
  - Bei der Schritt-Abnahme muessen spaeter gezielt gesucht werden:
    - doppelte Bestandseffekte
    - tote Alt-Logs mit Tages-Boolean-Semantik
    - alte `dose_per_day`-Restannahmen in Confirm/Undo-Pfaden

- Check-Ergebnis:
  - Der neue Write-Kern ist jetzt fachlich so definiert, dass Mehrfach-Einnahmen robust bleiben:
    - ein Slot = eine atomare Aktion
    - ein Undo = genau eine Rueckbuchung
    - kein doppelter Verbrauch
    - kein doppeltes Log
    - kein Client-seitiger Schattenbestand.

#### S4.5 Schritt-Abnahme (abgeschlossen)
- Contract-Abnahme gegen `S2` und `S3`:
  - Der in `S4` definierte Read-/Write-Kern passt voll zum Produktvertrag:
    - Slots bleiben count-/order-based
    - kein Zeit- oder Reminder-Drift
    - keine Rueckkehr zum Tages-Boolean-Modell
    - kein Legacy-Backfill-Zwang
  - `S4` baut konsistent auf den Entscheidungen aus `S3` auf:
    - Reset statt Dual-Read
    - prospektive Planwechsel
    - progress-aware Bestandslogik

- API-Konsistenz-Check:
  - Read und Write greifen jetzt auf derselben kleinsten Einheit:
    - `slot_id + day`
  - Read liefert:
    - Aggregat fuer UI/Push/Voice
    - plus Slot-Details fuer Confirm/Undo
  - Write mutiert:
    - genau einen Slot
    - genau einen Bestandseffekt
    - genau einen zugeordneten Logeffekt
  - Damit ist keine verdeckte Grobsemantik mehr offen.

- Call-Site-Risiko-Check:
  - Die groesste verbleibende Drift-Stelle sitzt nicht mehr im Vertrag, sondern in bestehenden Aufrufern.
  - Kritische Altannahmen, die spaeter aktiv entfernt werden muessen:
    - `taken` als Medication-Level-Bool
    - `taken_at` als alleiniger Tagesstatus
    - `qty` als aggregierter Tagesblock
    - `confirmMedication(medId, day)`
    - `undoMedication(medId, day)`
    - Filter wie `!med.taken`
  - Diese Altpfade sind jetzt klar benannt und damit ab `S5` bis `S8` gezielt abbaubar.

- Dead-Code-/Ballast-Check auf Vertragsebene:
  - In `S4` ist kein neuer Mischvertrag entstanden aus:
    - altem Flat-Read
    - neuem Slot-Read
  - Es gibt auch keinen neuen Sammel-RPC, der spaeter wieder zur Tageskomplettlogik entgleisen koennte.
  - Das ist wichtig, weil genau solche Zwischenvertraege spaeter fast immer toten Ballast erzeugen.

- Integrations-Check gegen Downstream-Module:
  - Intake kann auf `taken_count / total_count / slots[]` aufsetzen.
  - Push kann auf `plan_active`, `state` und offene Tagesmedikation aufsetzen.
  - Voice/Fast-Path kann offene Slots explizit bestaetigen, ohne Teilmengen zu raten.
  - Profile kann weiterhin einen read-only Snapshot bekommen, nur auf neuer Datenbasis.

- Fehlerrisiko-Check:
  - Die groessten Risiken im spaeteren Code-Umbau liegen jetzt noch bei:
    - halb migrierten Call-Sites
    - zu langen Uebergangsadaptern
    - versehentlicher Wiederverwendung alter Feldnamen mit neuer Bedeutung
  - Diese Risiken sind aber jetzt fachlich sichtbar gemacht und keine blinden Stellen mehr.

- Abnahme-Entscheid:
  - `S4` ist als RPC-/Contract-Grundlage tragfaehig genug, um danach direkt in die UI- und Modulumbauten zu gehen.
  - Es gibt keinen offenen Vertragswiderspruch mehr, der `S5` blockieren wuerde.

- Check-Ergebnis:
  - Der neue Medication-API-Vertrag ist:
    - deterministisch
    - slot-basiert
    - progress-aware
    - bestandskonsistent
    - frei von versteckter Legacy-Grobsemantik.

#### S4.6 Doku-Sync (abgeschlossen)
- Doku-Entscheid:
  - Auch nach `S4` bleibt der neue RPC-/Read-Write-Contract vorerst ein Architektur- und Umbauvertrag.
  - Solange noch keine neue SQL, keine neuen RPCs und kein neuer Frontend-Mapper produktiv im Code liegen, werden die Modul-Overviews nicht vorzeitig auf Multi-Dose umgeschrieben.

- Warum diese Zurueckhaltung hier besonders wichtig ist:
  - `S4` beschreibt bereits sehr konkrete API- und RPC-Semantik.
  - Wenn `docs/modules/*` das jetzt schon als Ist-Zustand behaupten wuerden, waere das irrefuehrender als in `S2` oder `S3`, weil die Begriffe hier direkt nach implementierter API klingen.

- Durchgefuehrter Doku-Sync:
  - Die Roadmap selbst traegt jetzt den vollstaendigen `S4`-Contract:
    - neues Tages-Read-Model
    - slot-basierte Write-RPCs
    - kurze Uebergangsstrategie fuer bestehende Call-Sites
    - Atomicity-/Idempotenz-Regeln
  - Der bereits vorhandene Dokumentstatus-Hinweis in
    [Medication Management Module Spec.md](c:\Users\steph\Projekte\M.I.D.A.S\docs\archive\Medication%20Management%20Module%20Spec.md)
    bleibt weiterhin korrekt und ausreichend:
    - bestehende Spec = aktueller Single-Dose-Ist-Zustand
    - Roadmap = kuenftiger Multi-Dose-Umbauvertrag

- Produktregel fuer die naechsten Schritte:
  - `docs/modules/Medication Module Overview.md`,
    `docs/modules/Intake Module Overview.md`,
    `docs/modules/Push Module Overview.md`,
    `docs/modules/Intent Engine Module Overview.md`
    und `docs/QA_CHECKS.md`
    werden erst dann konkret umgeschrieben, wenn `S5` bis `S8` die jeweiligen produktiven Codevertraege wirklich aendern.

- Spezifische Doku-Ziellinie ab jetzt:
  - Nach SQL-/RPC-Implementierung:
    - Medication Overview
  - Nach Daily-UX-Umbau:
    - Intake Overview
    - QA Checks
  - Nach Incident-/Push-Umbau:
    - Push Overview
  - Nach Voice-/Intent-Umbau:
    - Intent Engine Overview
    - Medication Overview
    - ggf. Voice-Doku

- Check-Ergebnis:
  - Die Doku-Hierarchie bleibt sauber:
    - `docs/modules/*` = aktueller Codezustand
    - `docs/archive/*` = Umbauvertrag und technische Zielarchitektur
  - Kein Dokument behauptet jetzt schon einen existierenden `v2`-RPC-Stand, der im Repo noch nicht umgesetzt ist.

#### S4.7 Commit-Empfehlung (abgeschlossen)
- Empfehlung:
  - Ja, nach `S4` ist erneut ein eigener Commit sinnvoll.

- Begruendung:
  - `S4` schliesst den API-/RPC-Vertrag als eigenen Architekturblock ab:
    - Tages-Read-Model
    - slot-basierte Write-RPCs
    - kurze Call-Site-Uebergangsstrategie
    - Atomicity-/Idempotenz-Regeln
  - Das ist ein klar anderer Schnitt als der naechste Block `S5`, der erstmals direkt in produktive UI- und Modulumbauten hineingeht.

- Warum nicht mit `S5` buendeln:
  - `S5` veraendert die reale Medication-Verwaltung im TAB-Flow.
  - Ab dort beginnen sichtbare Produktaenderungen und spaeter auch echte Code- und SQL-Implementierung.
  - Fuer deine Arbeitsweise ist es sauberer, den finalen Contract-Block vor dem sichtbaren Umbau separat abzuschliessen.

- Empfohlene Commit-Semantik:
  - Fokus des Commits:
    - Medication Multi-Dose API-/RPC-Vertrag fachlich finalisiert
  - Kein Implementierungsclaim:
    - dieser Commit beschreibt noch nicht die echte SQL-/Frontend-Umsetzung
    - sondern den verbindlichen Contract, gegen den `S5` bis `S8` gebaut werden

- Check-Ergebnis:
  - `S4` ist als abgeschlossener Roadmap-Block commit-wuerdig.
  - Naechster Arbeitsblock startet sauber mit `S5`.

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

#### S5.1 Ergebnisprotokoll (abgeschlossen)
- Ziel von `S5.1`:
  - Der TAB-Editor braucht einen klaren Form-Contract, der direkt in den neuen Medication- und Schedule-Vertrag abbildbar ist.
  - Das Formular darf dabei den `1x taeglich`-Fall nicht unnötig aufblasen, muss aber `2x`, `3x`, `4x` und benannte Slots sauber tragen.

- Form-Bereiche im Editor:
  - Medication-Stammdaten
  - Plan/Frequenz
  - temporaere Gueltigkeit
  - Zusatzhinweise

- Bereich A - Medication-Stammdaten:
  - Pflicht:
    - `name`
  - Optional:
    - `ingredient`
    - `strength`
    - `leaflet_url`
  - Operativ:
    - `stock_count`
    - `low_stock_days`
    - `active`

- Bereich B - Plan/Frequenz:
  - Das Formular braucht eine klare Frequenzsteuerung als Einstieg.
  - V1-Presets:
    - `1x taeglich`
    - `2x taeglich`
    - `3x taeglich`
    - `4x taeglich`
    - `benutzerdefiniert`
  - Wirkung der Presets:
    - sie erzeugen eine passende Grundmenge an Slots
    - danach bleiben Labels und Slot-Mengen editierbar

- Slot-Grundstruktur im Formular:
  - jeder Slot traegt:
    - `label`
    - `qty`
    - `sort_order`
  - fuer V1 keine Pflicht im Formular:
    - Uhrzeit
    - Reminder
    - Missed-/Deadline-Semantik

- Empfohlene Default-Labels je Preset:
  - `1x taeglich`:
    - `Abend` als neutraler Default ist moeglich, aber nicht verpflichtend
  - `2x taeglich`:
    - `Morgen`, `Abend`
  - `3x taeglich`:
    - `Morgen`, `Mittag`, `Abend`
  - `4x taeglich`:
    - `Morgen`, `Mittag`, `Abend`, `Nacht`
  - `benutzerdefiniert`:
    - freie Slot-Liste mit stabiler Reihenfolge

- Editierregeln fuer Slots:
  - Labels duerfen angepasst werden.
  - Slot-Mengen duerfen angepasst werden.
  - Reihenfolge muss stabil und sichtbar bleiben.
  - V1 braucht keine freie unendliche Slot-Metalogik, aber der Editor darf mehr als nur starre Presets sein.

- Bereich C - temporaere Gueltigkeit:
  - Felder:
    - `start_date` optional
    - `end_date` optional
  - Zweck:
    - Antibiotika
    - temporaere Zusatzmedikation
    - prospektive Planstarts
  - Produktregel:
    - wenn kein Datum gesetzt ist, gilt das Medikament/der Plan ab sofort als laufend

- Bereich D - Zusatzhinweise:
  - Checkbox/Feld:
    - `mit Mahlzeit`
  - V1-Rolle:
    - Hinweis im Daily- und TAB-Kontext
    - keine neue Planlogik
    - keine neue Rechen- oder Reminderlogik

- Form-Contract fuer Speichern:
  - Der Editor muss fachlich zwei Write-Bloecke erzeugen koennen:
    - Medication-Stammdaten
    - Slot-Plan
  - Das bedeutet:
    - das UI darf wie ein Formular wirken
    - intern muss aber klar sein, welche Felder an `med_upsert_v2` gehen
    - und welche an `med_upsert_schedule_v2`

- Guard gegen Formular-Ueberladung:
  - Der Default-Userflow fuer `1x taeglich` soll moeglichst kurz bleiben:
    - Name
    - Bestand
    - optional Low-Stock-Tage
    - Frequenz `1x`
    - Speichern
  - Komplexere Slot-Bearbeitung erscheint nur, wenn Frequenz oder Custom-Plan es erfordert.

- Nicht Teil des V1-Form-Contracts:
  - keine Uhrzeitfelder
  - keine Wochentage
  - keine Intervallplaene wie `alle 12h`
  - keine Mahlzeiten-Engine
  - keine Voice-Planbearbeitung

- Konsequenz fuer `S5.2`:
  - Das bestehende TAB-Formular kann jetzt gezielt erweitert werden, ohne in freie Clinical-Planer-Komplexitaet abzurutschen.

- Check-Ergebnis:
  - Der Form-Contract ist direkt umsetzbar und bleibt nah an deinem Alltag:
    - einfach fuer `1x taeglich`
    - stark genug fuer Antibiotika und spaetere komplexere Medikation
    - ohne das TAB-Panel in einen klinischen Scheduler zu verwandeln.

#### S5.2 Ergebnisprotokoll (abgeschlossen)
- Ziel von `S5.2`:
  - Das bestehende TAB-Formular soll auf Multi-Dose erweitert werden, ohne dass der heutige einfache Medikament-anlegen-Flow visuell kippt.
  - Die Erweiterung muss daher progressiv sein:
    - kompakt im Default
    - detailreicher nur bei echtem Bedarf

- Sichtbare Formularstruktur in V1:
  - Block 1:
    - Name
    - Wirkstoff
    - Staerke
  - Block 2:
    - Bestand
    - Low-Stock-Tage
    - Aktiv/Inaktiv
  - Block 3:
    - Frequenz
  - Block 4:
    - Slot-Editor
  - Block 5:
    - Startdatum / Enddatum
    - `mit Mahlzeit`

- Default-Verhalten fuer den Basiscase:
  - Neues Medikament startet im Formular mit:
    - `1x taeglich`
    - genau einem Slot
    - minimal sichtbarer Slot-Konfiguration
  - Fuer diesen Basiscase soll der Nutzer nicht das Gefuehl haben, ploetzlich einen Planer bedienen zu muessen.

- Konkrete UI-Regel fuer Frequenz:
  - Frequenz ist ein zentrales sichtbares Steuerfeld.
  - Wenn Frequenz geaendert wird:
    - wird die Slot-Liste deterministisch auf das gewaehlte Preset gesetzt
    - bestehende ungespeicherte Slot-Werte duerfen kontrolliert ersetzt werden
  - Custom-Modus:
    - oeffnet denselben Slot-Editor
    - aber ohne starre Preset-Annahme

- Konkrete UI-Regel fuer den Slot-Editor:
  - Bei `1x taeglich`:
    - genau ein Slot sichtbar
    - schlanke Darstellung
  - Bei `2x` bis `4x`:
    - alle erzeugten Slots direkt sichtbar
    - pro Slot:
      - Label
      - Menge
      - Reihenfolge bleibt stabil
  - Bei `benutzerdefiniert`:
    - Slots koennen hinzugefuegt oder entfernt werden
    - Reihenfolge bleibt explizit

- Guard gegen Ueberfrachtung:
  - Keine freie Slot-Karte mit zu vielen Feldern pro Zeile.
  - Keine zweite Formularwelt fuer "einfach" vs. "erweitert".
  - Stattdessen:
    - ein Formular
    - aber mit kontrollierter Offenlegung je nach Frequenzwahl

- Verhalten von Start-/Enddatum:
  - Diese Felder sollen sichtbar, aber klar als optional lesbar sein.
  - Sie duerfen nicht den Eindruck erzeugen, fuer jedes Medikament Pflicht zu sein.
  - Typischer Alltagspfad:
    - Dauer-Medikation ohne Enddatum
    - Antibiotikum mit Start- und ggf. Enddatum

- Verhalten von `mit Mahlzeit`:
  - Als einfache Checkbox im unteren Formularbereich.
  - Nicht als Slot-Attribut pro Eintrag.
  - Nicht als eigener Modus.
  - Dadurch bleibt die Information sichtbar, ohne die Slot-Bearbeitung zu zerlegen.

- Editierfall vs. Neuerfassung:
  - Beim Editieren muss das Formular einen bestehenden Plan lesbar vorbefuellen:
    - aktuelle Frequenz
    - aktuelle Slots
    - aktuelle Gueltigkeit
    - `mit Mahlzeit`
  - Der Nutzer soll im Edit-Fall nicht erst rekonstruieren muessen, wie das Medikament gerade geplant ist.

- Speichern-/Reset-Verhalten:
  - Formularspeichern bleibt eine klare Hauptaktion.
  - Reset/Abbrechen darf den Planeditor wieder in einen sauberen Grundzustand setzen.
  - Wichtig:
    - kein versteckter Zustand aus frueherer Frequenzwahl darf im Formular kleben bleiben

- Nicht Teil der V1-Form-Erweiterung:
  - keine Drag-and-Drop-Reihenfolge
  - keine Akkordeon-Unterformulare pro Slot
  - keine Kalender-/Wochenlogik
  - keine intelligente Arzneimittelvorschlaege

- Umsetzungskritische Designlinie:
  - Die Form darf in HTML/CSS/JS ohne Build-Step realistisch wartbar bleiben.
  - Deshalb ist die richtige V1-Richtung:
    - einfache Formularsektionen
    - wenige kontrollierte dynamische Bereiche
    - keine UI-Maschine mit zu vielen interdependenten Sonderpfaden

- Konsequenz fuer `S5.3`:
  - Die Validierung und Slot-Sortierung kann jetzt gegen eine klar begrenzte Formularform gebaut werden, statt gegen einen offenen Planner.

- Check-Ergebnis:
  - Die Formularerweiterung bleibt absichtlich pragmatisch:
    - wenig Reibung fuer Daily-Meds
    - genug Struktur fuer Mehrfach-Einnahmen
    - keine visuelle oder technische Explosion des TAB-Panels.

#### S5.3 Ergebnisprotokoll (abgeschlossen)
- Ziel von `S5.3`:
  - Der Slot-Editor darf nicht nur sichtbar sein, sondern muss auch stabil bearbeitbar bleiben.
  - Dafuer braucht V1 klare Regeln fuer:
    - Reihenfolge
    - Validierung
    - Editierverhalten

- Sortierungsregel:
  - Jeder Slot hat eine explizite `sort_order`.
  - Die sichtbare Reihenfolge im Formular und spaeter im IN-Tab folgt immer dieser Reihenfolge.
  - Die Reihenfolge ist damit fachlich Teil des Plans, nicht nur ein UI-Zufall.

- V1-Regel fuer Reihenfolgepflege:
  - Bei Presets wird `sort_order` deterministisch gesetzt.
  - Bei `benutzerdefiniert` bleibt die Reihenfolge stabil ueber:
    - Hinzufuegen
    - Entfernen
    - Bearbeiten
  - V1 braucht dafuer keine komplexe Drag-and-Drop-Logik.
  - Eine einfache kontrollierte Reihenfolge reicht.

- Validierungsregeln fuer Medication-Stammdaten:
  - `name` ist Pflicht.
  - `stock_count` muss `>= 0` sein.
  - `low_stock_days` muss `>= 0` sein.
  - `start_date <= end_date`, wenn beide gesetzt sind.

- Validierungsregeln fuer Slots:
  - Mindestens ein Slot muss vorhanden sein.
  - Jeder Slot braucht:
    - gueltige `sort_order`
    - `qty > 0`
  - Label darf leer oder frei editierbar sein, solange die Reihenfolge stabil bleibt.
  - V1 braucht kein Label-Pflichtfeld, weil das die Formularlast ohne echten Mehrwert erhoehen wuerde.

- Guard gegen stille Ungueltigkeit:
  - Ein Formular darf nicht speicherbar sein, wenn:
    - keine Slots vorhanden sind
    - eine Slot-Menge `<= 0` ist
    - Datumslogik widerspruechlich ist
    - Pflichtfelder fuer Medication fehlen
  - Damit bleibt der Datenvertrag bereits im UI scharf.

- Verhalten beim Frequenzwechsel:
  - Wechsel auf ein Preset darf die Slot-Liste kontrolliert neu aufbauen.
  - Wechsel auf `benutzerdefiniert` darf bestehende Slots uebernehmen und weiter editierbar machen.
  - Wichtiger Guard:
    - Der Nutzer darf nicht unsichtbar in einem alten Slot-Zustand haengen bleiben, der nicht mehr zur sichtbaren Frequenz passt.

- Verhalten beim Editieren bestehender Plaene:
  - Bestehende Slots muessen mit stabiler Reihenfolge geladen werden.
  - Editieren eines Labels oder einer Menge darf die Reihenfolge nicht unnoetig neu mischen.
  - Das verhindert UI-Drift und erleichtert spaeter die Lesbarkeit im IN-Tab.

- Validierungsstil fuer MIDAS:
  - lokal und direkt
  - keine ueberengineerten Fehlersysteme
  - klare Status- oder Inline-Hinweise reichen
  - Ziel:
    - Fehler frueh stoppen
    - aber den Daily-Flow nicht in Formular-Drama verwandeln

- Nicht Teil der V1-Validierung:
  - keine medizinische Plausibilitaetspruefung von Wirkstoff und Frequenz
  - keine Arzneimittelinteraktionslogik
  - keine Zeitintervall-Pruefung
  - keine Pflicht, dass `4x` exakt die Labels `Morgen/Mittag/Abend/Nacht` tragen muss

- Umsetzungskritische Folge:
  - Die Kombination aus:
    - stabiler `sort_order`
    - klarer Slot-Mengenvalidierung
    - deterministischem Frequenzwechsel
    ist die Voraussetzung dafuer, dass `S6` spaeter dieselbe Reihenfolge im Daily Flow ruhig rendern kann.

- Check-Ergebnis:
  - Der Slot-Editor ist jetzt fachlich eng genug definiert, um sauber implementiert zu werden:
    - keine offene Planner-Logik
    - keine instabile Reihenfolge
    - keine stillen Ungueltigkeiten
    - genug Freiheit fuer echte Mehrfach-Einnahmen.

#### S5.4 Ergebnisprotokoll (abgeschlossen)
- Ziel von `S5.4`:
  - Die Kartenliste im TAB-Panel muss nach dem Umbau nicht nur Stammdaten, sondern auch den aktuellen Tagesplan eines Medikaments lesbar machen.
  - Das soll schnell erfassbar bleiben:
    - welche Medikation ist das
    - wie oft wird sie genommen
    - gibt es besondere Hinweise oder temporaere Gueltigkeit

- Kernregel fuer die Kartenliste:
  - Die Karte bleibt eine kompakte Medikamentenkarte.
  - Sie wird nicht zu einer zweiten Vollansicht des Editors.
  - Das heisst:
    - Plan sichtbar
    - aber nicht jeder interne Vertragswert rohdatenartig ausgeschuettet

- Sichtbare Pflichtinformationen pro Karte:
  - Name
  - Wirkstoff / Staerke, wenn vorhanden
  - Bestand
  - `days_left`
  - `runout_day`
  - Aktiv/Inaktiv-Status
  - aktuelle Plan-Zusammenfassung

- Form der Plan-Zusammenfassung:
  - Statt nur `Dose/Tag: n` braucht die Karte kuenftig eine lesbare Planzeile.
  - Beispiele:
    - `Plan: Abend`
    - `Plan: Morgen, Abend`
    - `Plan: Morgen, Mittag, Abend`
    - `Plan: Morgen, Mittag, Abend, Nacht`
  - Bei Custom-Plaenen:
    - Reihenfolge sichtbar halten
    - keine technische Slot-ID-Sprache in der UI

- Umgang mit Slot-Mengen in der Karte:
  - Wenn alle Slots dieselbe Menge haben und der Plan alltagsnah lesbar ist, reicht die Label-Zusammenfassung.
  - Wenn Slot-Mengen voneinander abweichen, muss die Karte differenzierter lesbar sein.
  - V1-taugliche Richtung:
    - `Plan: Morgen (1), Abend (2)`
  - Damit bleiben ungleiche Slotmengen sichtbar, ohne dass die Karte aufbricht.

- Sichtbare Zusatzhinweise:
  - `mit Mahlzeit` soll als knapper Hinweis in der Karte erscheinen, wenn gesetzt.
  - Beispiel:
    - `Hinweis: mit Mahlzeit`
  - Nicht als Badge-Flut, sondern als ruhige Zusatzzeile.

- Sichtbare temporaere Gueltigkeit:
  - Wenn Start-/Enddatum gesetzt sind und fuer den Nutzer relevant sind, soll die Karte das lesbar machen.
  - Beispiele:
    - `Start: 2026-03-22`
    - `Bis: 2026-03-29`
    - oder kompakter `Aktiv von ... bis ...`
  - Dauer-Medikation ohne Enddatum braucht keine auffaellige Datumszeile.

- Lesbarkeitsregel fuer aktive vs. inaktive Medikamente:
  - Aktive Medikamente sollen den aktuellen Plan klar lesbar zeigen.
  - Inaktive/archivierte Medikamente duerfen visuell ruhiger oder abgeschwaecht sein.
  - Wichtig:
    - Archivierung darf die Planlesbarkeit nicht komplett zerstoeren
    - aber aktive Tagesmedikation bleibt optisch priorisiert

- Kartenaktionen bleiben erhalten, aber mit neuer Semantik:
  - Bearbeiten
  - Bestand anpassen
  - Bestand setzen
  - Aktivieren/Archivieren
  - Loeschen
  - Was entfaellt als Kartenannahme:
    - `Dose/Tag` als alleinige Beschreibung
    - Medication-Day-Confirm als Kernkartenmetrik im TAB-Panel

- Guard gegen Kartenueberladung:
  - Keine Darstellung aller Slots mit vollen Bearbeitungscontrols in der Listenkarte.
  - Keine technische Feldsammlung wie:
    - `taken_count`
    - `daily_planned_qty`
    - `plan_active`
  - Solche Werte gehoeren in Daily Flow oder internen Contract, nicht in die Verwaltungsliste.

- Beziehung zum Editor:
  - Die Karte ist die knappe Lesefassung des Formularzustands.
  - Der Editor bleibt der Ort fuer Aenderung.
  - Die Karte muss also genug zeigen fuer:
    - Orientierung
    - Wiederfinden
    - Kontrolle
  - aber nicht alles doppelt editierbar machen.

- Umsetzungskritische UI-Linie:
  - Nach dem Speichern eines Medikaments muss der Nutzer sofort erkennen koennen:
    - wurde aus `1x taeglich` jetzt `2x taeglich`
    - hat das Medikament ein Enddatum
    - ist `mit Mahlzeit` gesetzt
  - Wenn die Karte das nicht sofort lesbar macht, wird der TAB-Umbau im Alltag zu intransparent.

- Check-Ergebnis:
  - Die Kartenliste bleibt nach dem Umbau kompakt, aber deutlich aussagekraeftiger:
    - nicht mehr nur Bestand + `Dose/Tag`
    - sondern Medikament + lesbarer aktueller Plan
    - ohne in UI- oder Datenmatsch zu kippen.

#### S5.5 Schritt-Abnahme (abgeschlossen)
- Abnahme gegen den Produktvertrag:
  - Der TAB-Planeditor bleibt innerhalb der in `S2` definierten Guardrails:
    - kein klinischer Planner
    - kein Zeitlogik-Creep
    - `1x taeglich` bleibt leicht
    - `2x` bis `4x` und temporaere Medikamente sind alltagstauglich abbildbar
  - Die Form bleibt damit klar MIDAS-konform und driftet nicht in ein generisches Medikationssystem.

- Abnahme gegen `S3` und `S4`:
  - Die Formularfelder passen direkt auf den neuen Daten- und API-Vertrag:
    - Medication-Stammdaten
    - Slot-Plan
    - Start-/Enddatum
    - `with_meal`
  - Es gibt keinen offenen UI-Teil mehr, der implizit wieder `dose_per_day` als alleinige Planquelle voraussetzen wuerde.

- UI-/UX-Abnahme:
  - Der Basiscase bleibt kompakt:
    - Name
    - Bestand
    - Frequenz `1x`
    - Speichern
  - Mehrfach-Einnahmen werden kontrolliert sichtbar, aber nicht ueberfrachtet.
  - Die Kartenliste macht den gespeicherten Plan nach dem Speichern sofort lesbar.

- Validierungs-/Stabilitaets-Abnahme:
  - Reihenfolge, Slot-Mengen und Pflichtfelder sind jetzt eng genug definiert, um spaeter deterministisch umgesetzt zu werden.
  - Kritische Fehlzustaende sind abgefangen:
    - keine Slots
    - Slotmenge `<= 0`
    - ungueltige Datumslogik
    - fehlender Name
  - Damit ist der Editor fachlich stabil genug fuer echten Code.

- Dead-Path-/Ballast-Check:
  - Es ist kein zweites Formularsystem entstanden fuer:
    - einfache Medikation
    - komplexe Medikation
  - Es gibt auch keinen offenen Sondervertrag fuer:
    - `alle 12h`
    - Uhrzeiten
    - Wochentage
    - Mahlzeiten-Engine
  - Das verhindert spaeter tote UI-Aeste und halb genutzte Formfelder.

- Offene Punkte, aber kein S5-Blocker:
  - genaue HTML-Struktur und CSS-Anordnung
  - konkrete Inline-Fehlerdarstellung
  - genaue Plus/Minus-Mechanik fuer Custom-Slots
  - diese Punkte gehoeren in die Implementierung, nicht mehr in den Formvertrag

- Abnahme-Entscheid:
  - `S5` ist als TAB-Editor-Vertrag tragfaehig genug, um im naechsten Block die Daily-UX fuer den IN-Tab darauf aufzubauen.

- Check-Ergebnis:
  - Der TAB-Planeditor ist jetzt fachlich klar genug fuer die Umsetzung:
    - kompakt im Alltag
    - stark genug fuer Multi-Dose
    - frei von unnötigem Planner-Ballast
    - direkt anschlussfaehig an den neuen SQL-/RPC-Vertrag.

#### S5.6 Doku-Sync (abgeschlossen)
- Doku-Entscheid:
  - Auch `S5` beschreibt bislang nur den UI-/Formvertrag des kuenftigen TAB-Editors, nicht den bereits umgesetzten Produktivzustand.
  - Deshalb werden die Modul-Overviews weiterhin noch nicht vorzeitig auf Multi-Dose-TAB-UI umgeschrieben.

- Durchgefuehrter Doku-Sync:
  - Die Roadmap traegt jetzt den vollstaendigen `S5`-Vertrag:
    - Form-Contract
    - konkrete Formularerweiterung
    - Slot-Sortierung und Validierung
    - Kartenlesbarkeit im TAB-Panel
  - Der bestehende Dokumentstatus-Hinweis in
    [Medication Management Module Spec.md](c:\Users\steph\Projekte\M.I.D.A.S\docs\archive\Medication%20Management%20Module%20Spec.md)
    bleibt weiterhin korrekt:
    - bestehende Spec = heutiger Single-Dose-Ist-Zustand
    - Roadmap = kuenftiger Multi-Dose-Umbauvertrag

- Regel fuer spaeteren echten Doku-Sync:
  - Sobald der TAB-Editor wirklich implementiert ist, muessen nachgezogen werden:
    - [Medication Module Overview.md](c:\Users\steph\Projekte\M.I.D.A.S\docs\modules\Medication%20Module%20Overview.md)
    - bei Bedarf [QA_CHECKS.md](c:\Users\steph\Projekte\M.I.D.A.S\docs\QA_CHECKS.md)
  - Vorher bleibt die aktuelle Modul-Doku bewusst beim ausgelieferten Zustand.

- Check-Ergebnis:
  - Kein Dokument behauptet jetzt schon einen produktiven TAB-Multi-Dose-Editor, der im Code noch nicht existiert.

#### S5.7 Commit-Empfehlung (abgeschlossen)
- Empfehlung:
  - Ja, nach `S5` ist erneut ein eigener Commit sinnvoll.

- Begruendung:
  - `S5` schliesst den kompletten TAB-Editor-Vertrag als eigenen Block ab:
    - Formularstruktur
    - Frequenz-/Slot-Modell
    - Validierung
    - Kartenlesbarkeit
  - Der naechste Block `S6` ist klar davon getrennt:
    - Daily UX im IN-Tab
    - Fortschritt
    - Slot-Interaktion
    - Batch-Verhalten

- Warum nicht mit `S6` buendeln:
  - `S6` ist nicht nur eine UI-Fortsetzung, sondern ein anderer Nutzungskontext:
    - Verwaltung vs. taegliche Einnahme
  - Fuer deine Arbeitsweise ist es sauberer, diese beiden UI-Welten nicht in einem Dokumentationscommit zu verschmieren.

- Empfohlene Commit-Semantik:
  - Fokus des Commits:
    - Medication Multi-Dose TAB-Editor fachlich finalisiert
  - Kein Implementierungsclaim:
    - weiterhin nur Roadmap-/Vertragsstand, noch keine reale Code-Umsetzung

- Check-Ergebnis:
  - `S5` ist als abgeschlossener Roadmap-Block commit-wuerdig.
  - Naechster Arbeitsblock startet sauber mit `S6`.

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

#### S6.1 Ergebnisprotokoll (abgeschlossen)
- Ziel von `S6.1`:
  - Die Medication-Card im IN-Tab darf kuenftig nicht mehr auf einem Tages-Boolean `genommen/offen` beruhen.
  - Ihr primaerer Status muss der sichtbare Tagesfortschritt sein:
    - `taken_count / total_count`

- Neue Primärsprache der Card:
  - Nicht mehr:
    - `genommen`
    - `offen`
    - ein einzelner Haken fuer den ganzen Tag
  - Sondern:
    - `0/1`
    - `1/2`
    - `2/3`
    - `4/4`
  - Das ist die kuenftige Hauptlesart fuer Daily Medication.

- Warum der Zaehler die richtige Hauptsprache ist:
  - Er skaliert natuerlich von `1x taeglich` zu Mehrfach-Einnahmen.
  - Er bleibt kompakt.
  - Er braucht keine neue Fachsprache fuer jeden Medikamententyp.
  - Er ist sofort mit dem Slot-Modell kompatibel.

- Pflichtdaten fuer die Card:
  - `name`
  - optional `strength`
  - `taken_count`
  - `total_count`
  - daraus abgeleiteter `state`
  - bei Bedarf knapper Hinweis wie `mit Mahlzeit`

- Ableitungsregel fuer den Card-Zustand:
  - `open`
    - `taken_count = 0`
  - `partial`
    - `0 < taken_count < total_count`
  - `done`
    - `taken_count = total_count`
  - Die Card darf diese States visuell tragen, aber der Zaehler bleibt der primaere Anker.

- Visuelle Grundlinie fuer die Card:
  - Die Karte bleibt eine einzelne ruhige Einheit im bestehenden Intake-Grid.
  - Kein neues Unterpanel, kein Planner-Look.
  - Die Fortschrittsanzeige wird zum sichtbaren Card-Meta-Element:
    - prominent genug fuer Alltag
    - aber ohne grosses Dashboard in der Karte

- Verhalten fuer `1x taeglich`:
  - Die Anzeige `0/1` oder `1/1` ist ausreichend.
  - Der Nutzer soll das weiter fast wie heute lesen koennen:
    - offen
    - erledigt
  - Der Fortschrittszaehler ersetzt hier den alten Tageshaken, ohne neue Reibung zu erzeugen.

- Verhalten fuer `>1x taeglich`:
  - Die Karte zeigt sofort, dass der Tag nur teilweise erledigt sein kann.
  - Beispiele:
    - `1/2`
    - `2/3`
    - `3/4`
  - Das ist der entscheidende Unterschied zum alten Modell:
    - die Card kann jetzt einen echten Zwischenzustand tragen

- Beziehung zu Slot-Details:
  - `S6.1` zieht nur die Card auf Fortschritt um.
  - Die konkrete Slot-Liste folgt erst in spaeteren Substeps.
  - Wichtig ist hier:
    - auch ohne aufgeklappte Slot-Details muss die Karte schon korrekt und alltagstauglich lesbar sein.

- Was aus der alten Card-Semantik raus muss:
  - `taken` als alleiniger Zustand
  - ein globaler Tagesstatus pro Medication ohne Zwischenstufe
  - alle Selektions-/Footer-Annahmen, die nur mit `!med.taken` arbeiten
  - Diese Altannahmen sind ab jetzt fachlich veraltet.

- Beziehung zu Push und Batch:
  - Der Fortschrittszaehler ist nicht nur UI, sondern spaeter die lesbare Oberflaeche desselben neuen Contract-Kerns.
  - Push, Batch und Voice arbeiten dann auf derselben Wahrheit:
    - offene Slots
    - nicht auf einem groben Bool.

- Guard gegen Overdesign:
  - Keine Prozentbalkenpflicht.
  - Keine Timeline.
  - Keine medizinischen Farbsysteme pro Slot-Anzahl.
  - Der Zaehler plus ruhiger Status reicht fuer V1.

- Check-Ergebnis:
  - Die Medication-Card ist jetzt fachlich richtig neu ausgerichtet:
    - `1x taeglich` bleibt natuerlich lesbar
    - Mehrfach-Einnahmen bekommen erstmals einen echten Zwischenzustand
    - der IN-Tab bleibt dabei kompakt statt plannerhaft.

#### S6.2 Ergebnisprotokoll (abgeschlossen)
- Ziel von `S6.2`:
  - Der neue Daily-Flow darf den heutigen `1x taeglich`-Fall nicht mit Multi-Dose-Komplexitaet bestrafen.
  - Genau dieser Basiscase ist der haerteste UX-Guard des gesamten Umbaus.

- Grundregel fuer `1x taeglich`:
  - Ein Medikament mit genau einem aktiven Slot bleibt in der Daily-UX maximal kompakt.
  - Der Nutzer soll weiterhin das Gefuehl haben:
    - sehen
    - tippen
    - fertig

- Sichtbare Form der `1x`-Card:
  - Hauptinhalt:
    - Name
    - optional Staerke
    - Fortschritt `0/1` oder `1/1`
  - Kein Pflicht-Aufklappen.
  - Keine sichtbare Slot-Liste im Default.
  - Kein zusaetzlicher Planner-Block nur fuer den einen Slot.

- Interaktionsregel fuer `1x`:
  - Die Card braucht einen klaren direkten Status-CTA.
  - Dieser CTA steht fuer:
    - den einen offenen Slot bestaetigen
    - oder bei `done` gezielt rueckgaengig machen
  - Damit bleibt der Flow faktisch weiterhin:
    - ein Haupttap fuer Confirm
    - ggf. ein klarer Rueckgaengig-Pfad

- Warum `1x` keine sichtbare Slot-Liste braucht:
  - Bei genau einem Slot wuerde eine explizite Slot-Zeile nur dieselbe Information duplizieren.
  - Das wuerde:
    - Platz kosten
    - UI-Lesen verlangsamen
    - Mehrfach-Einnahme-Komplexitaet auf einen einfachen Fall uebertragen
  - Deshalb gilt fuer V1:
    - `1x` nutzt den Slot-Vertrag intern
    - aber muss ihn nicht voll sichtbar ausstellen

- Verhalten bei Zusatzhinweisen:
  - `mit Mahlzeit` darf bei `1x` als knapper Hinweis sichtbar sein.
  - Aber:
    - nicht als Grund fuer mehr Interaktionsstufen
    - nicht als eigener Unterblock

- Verhalten bei temporaeren Medikamenten:
  - Auch ein temporaeres `1x taeglich`-Medikament bleibt im Daily Flow kompakt.
  - Start-/Enddatum sind kein Grund, die `1x`-Card im Alltag komplizierter zu machen.

- Guard gegen schleichende Reibung:
  - Nicht erlaubt fuer `1x`:
    - Card muss erst aufgeklappt werden
    - Nutzer muss zuerst in einen Slot-Unterbereich
    - separate Slot-Zeile ist Default-Pflicht
    - Batch wird noetig, obwohl nur ein Medikament offen ist
  - Wenn so etwas entsteht, ist die V1-UX fuer MIDAS regressiv.

- Beziehung zu Mehrfach-Einnahmen:
  - Die Multi-Dose-Faehigkeit lebt im Modell und in den Karten fuer `>1x`.
  - `1x taeglich` bleibt bewusst der Sonderfall mit maximal wenig Oberflaechenrauschen.
  - Das ist keine Inkonsistenz, sondern das gewollte Produktverhalten.

- Umsetzungskritische Folge:
  - In der spaeteren Implementierung darf die `1x`-Card intern denselben neuen Slot-Contract nutzen,
    aber muss renderseitig einen Fast-Path haben.
  - Das ist ein echter UX-Fast-Path, kein fachlicher Sondervertrag.

- Check-Ergebnis:
  - Der wichtigste Daily-Guard ist jetzt klar:
    - `1x taeglich` bleibt im neuen System praktisch so schnell wie heute
    - der Mehrfach-Einnahme-Umbau zerstoert nicht den staendig wiederkehrenden Basiscase.

#### S6.3 Ergebnisprotokoll (abgeschlossen)
- Ziel von `S6.3`:
  - Medikamente mit mehr als einem aktiven Tages-Slot brauchen im IN-Tab eine sichtbare Slot-Liste.
  - Diese Liste muss alltagstauglich sein:
    - klar
    - ruhig
    - direkt bedienbar
    - aber ohne Planner- oder Formularcharakter

- Wann die Slot-Liste sichtbar wird:
  - Bei `total_count > 1`.
  - Das ist die zentrale Schwelle:
    - `1x` bleibt kompakt
    - `>1x` zeigt die Daily-Struktur explizit

- Grundform der Multi-Dose-Card:
  - Kopfbereich:
    - Name
    - optional Staerke
    - Fortschritt `taken_count / total_count`
  - Darunter:
    - ruhige Liste der aktiven Slots fuer heute
  - Keine zweite Karte, kein Overlay, kein Unterpanel.

- Inhalt pro Slot-Zeile:
  - Label
  - ggf. Menge, wenn relevant
  - Status:
    - offen
    - genommen
  - Interaktionsmoeglichkeit:
    - Confirm
    - Undo

- Reihenfolge-Regel:
  - Die Slot-Liste folgt exakt der `sort_order` des Plans.
  - Die Daily-UX darf diese Reihenfolge nicht neu interpretieren.
  - Dadurch bleibt die mentale Linie stabil zwischen:
    - TAB-Editor
    - IN-Daily-Card

- Statusdarstellung pro Slot:
  - `offen`
    - klar als noch nicht bestaetigt lesbar
  - `genommen`
    - klar als bestaetigt lesbar
  - V1 braucht pro Slot keine dritte Alltagskategorie wie `missed`.

- Mengenanzeige:
  - Wenn alle Slots dieselbe Menge haben und der Alltag dadurch nicht gewinnt, darf die Darstellung kompakt bleiben.
  - Wenn Mengen abweichen, muss die Daily-Card das sichtbar machen.
  - Beispiel:
    - `Morgen (1)`
    - `Abend (2)`
  - Ziel:
    - keine versteckte Mengendifferenz in einem Medikament mit mehreren Tagespunkten

- Interaktionsregel pro Slot:
  - Jeder sichtbare offene Slot muss direkt bestaetigbar sein.
  - Jeder sichtbare bestaetigte Slot muss gezielt rueckgaengig gemacht werden koennen.
  - Keine Slot-Zeile darf nur Anzeige sein, wenn der Nutzer dort im Alltag eigentlich handeln soll.

- Guard gegen UI-Laerm:
  - Keine Checkbox-Sammlung wie in einem generischen Task-Tool.
  - Keine Tabelle.
  - Keine grossen Aktionsleisten pro Slot.
  - Keine Wiederholung technischer Begriffe.
  - Die Liste soll wie eine ruhige Daily-Staffelung wirken, nicht wie ein Admin-Grid.

- Beziehung zum Card-Status:
  - Der Card-Kopf bleibt das Aggregat:
    - `1/3`
    - `2/4`
  - Die Slot-Liste erklaert dann diesen Fortschritt im Detail.
  - Damit gilt:
    - erst Gesamtfortschritt
    - dann konkrete offene/erledigte Slots

- Verhalten bei temporaeren Medikamenten:
  - Ein `3x taeglich`-Antibiotikum folgt exakt derselben Card-Logik.
  - Der Unterschied ist nicht in der Card-Interaktion, sondern nur im Plan-/Datumsvertrag.

- Guard gegen zu viel Offenlegung:
  - Die Card soll weiterhin im bestehenden Intake-Grid funktionieren.
  - Das heisst:
    - Slot-Liste knapp halten
    - keine zweite Ebene voller Metadaten
    - keine Sichtbarkeit von `start_date`, `end_date`, `slot_id`, `plan_active` im Daily Flow

- Umsetzungskritische Folge:
  - `S6.3` zieht die Grenze zwischen:
    - genug Sichtbarkeit fuer Mehrfach-Einnahmen
    - und zu viel UI-Last im taeglichen Kernflow
  - Diese Grenze ist wichtig, weil genau hier der Umbau sonst in eine ueberschwere Medikamentenliste kippen wuerde.

- Check-Ergebnis:
  - Die `>1x`-Daily-Card ist jetzt fachlich klar definiert:
    - Fortschritt oben
    - ruhige Slot-Liste darunter
    - direkte Slot-Interaktion
    - keine Planner-UI
    - keine versteckte Mengen- oder Reihenfolgedrift.

#### S6.4 Ergebnisprotokoll (abgeschlossen)
- Ziel von `S6.4`:
  - Der Batch-Flow im IN-Tab darf im neuen Modell nicht mehr auf Medikament-Ebene denken.
  - Sonst wuerde er bei Mehrfach-Einnahmen genau die falsche Grobsemantik wieder einfuehren:
    - ein Tap bestaetigt unbemerkt den ganzen Tag

- Neue Grundregel fuer Batch:
  - Batch arbeitet fachlich immer auf offenen Tages-Slots.
  - Nicht auf:
    - Medikamenten-Bools
    - groben Tageskomplettbestaetigungen

- Erlaubter Batch-Fall A - `1x taeglich`:
  - Bei Medikamenten mit genau einem offenen Slot bleibt Batch weiterhin alltagstauglich.
  - Hier ist `Medikation bestaetigen` faktisch identisch mit:
    - den einen offenen Slot bestaetigen
  - Deshalb darf der bisherige Komfort fuer `1x` erhalten bleiben.

- Erlaubter Batch-Fall B - explizite Sammelaktion:
  - Bei Mehrfach-Einnahmen darf es nur eine explizit benannte Sammelaktion geben:
    - `alle offenen Einnahmen bestaetigen`
  - Diese Aktion muss sprachlich klar machen:
    - es geht um mehrere offene Slot-Ereignisse
    - nicht nur um `dieses Medikament abhaken`

- Nicht erlaubte Batch-Semantik:
  - Ein generischer Medikament-Tap oder ein undeutlicher CTA darf nie stillschweigend:
    - alle offenen Slots einer Multi-Dose-Medikation
    - oder alle offenen Slots des ganzen Tages
    bestaetigen, ohne dass die UI das explizit sagt.

- Default-Verhalten im Daily Flow:
  - Default ist slot-basierte Interaktion.
  - Das heisst:
    - offener Slot -> direkt bestaetigen
    - bestaetigter Slot -> gezielt rueckgaengig machen
  - Batch bleibt eine zusaetzliche Komfortaktion, nicht der Kern des Mehrfach-Einnahme-Flows.

- Konsequenz fuer Footer-/Selection-Logik:
  - Die bisherige Selektion `selected medication ids` ist fachlich ueberholt.
  - Kuenftig muss Selection, wenn ueberhaupt, auf offene Slot-Einheiten oder klare `1x`-Faelle bezogen sein.
  - Damit gilt:
    - `selected medications` als Primitiv passt nicht mehr zum neuen Modell

- Verhalten fuer gemischte Tageslage:
  - Beispiel:
    - `Valsartan 0/1`
    - `Antibiotikum 1/3`
  - Batch darf dann nicht so tun, als gaebe es nur `zwei offene Medikamente`.
  - Korrekte Lesart ist:
    - es gibt mehrere offene Einnahmen
  - Genau deshalb muss der Batch-Text im neuen Modell an offenen Slot-Ereignissen orientiert sein.

- UI-Regel fuer den Batch-CTA:
  - Batch muss eindeutig benennen, was bestaetigt wird.
  - Gute Richtung in V1:
    - `Alle offenen Einnahmen bestaetigen`
  - Schlechte Richtung:
    - `Alle genommen`
    - wenn darunter auch mehrere Slots pro Medikation liegen koennen

- Undo-Regel fuer Batch:
  - V1 braucht keinen neuen globalen Batch-Undo-Vertrag als fachliche Pflicht.
  - Wichtiger ist:
    - jeder bestaetigte Slot bleibt individuell rueckgaengig machbar
  - Falls spaeter ein Batch-Undo bleibt, darf er nur die konkret im letzten Batch bestaetigten Slots rueckgaengig machen.
  - Nicht:
    - eine ganze Medikation oder den ganzen Tageszustand ungezielt zurueckkippen

- Guard gegen Vertrauenbruch:
  - Der Nutzer darf nie den Eindruck haben:
    - "ich habe nur dieses Medikament bestaetigt"
    - waehrend das System intern alle offenen Slots dieses Medikaments geschlossen hat
  - Genau dieser Vertrauensbruch waere im Medication-Kontext besonders schaedlich.

- Beziehung zu Voice/Fast-Path:
  - Dieselbe Semantik muss spaeter fuer `medication_confirm_all` gelten:
    - explizit alle aktuell offenen Einnahmen fuer heute
  - Damit bleiben UI, Text und Voice in derselben Logik.

- Check-Ergebnis:
  - Der Batch-Vertrag ist jetzt sauber neu geschnitten:
    - `1x` bleibt komfortabel
    - Mehrfach-Einnahmen bleiben standardmaessig slot-basiert
    - Sammelaktionen bleiben moeglich, aber nur explizit und semantisch ehrlich
    - kein stilles Zurueckrutschen in Tageskomplett-Logik.

#### S6.5 Schritt-Abnahme (abgeschlossen)
- Abnahme gegen Produkt- und UX-Guardrails:
  - `S6` bleibt innerhalb der Kernregeln aus `S2`:
    - `1x taeglich` wird nicht verschlechtert
    - Mehrfach-Einnahmen werden sichtbar, aber nicht plannerhaft
    - keine versteckte Zeit- oder Reminderlogik
    - kein stilles `confirm all`
  - Damit ist der Daily-Flow weiter klar MIDAS und kippt nicht in ein generisches Medication-Board.

- Abnahme gegen `S4`-Contract:
  - Die Daily-UX benutzt jetzt dieselbe kleinste Einheit wie der API-Vertrag:
    - offene/bestaetigte Slots
  - Fortschritt, Slotliste und Batch sind konsistent mit:
    - `taken_count / total_count`
    - `slots[]`
    - slot-basiertem Confirm/Undo
  - Es gibt keinen offenen Daily-UX-Teil mehr, der einen globalen Tages-Bool wirklich braucht.

- Regressions-Check fuer `1x taeglich`:
  - Der Basiscase bleibt klar abgesichert:
    - keine Pflicht-Slotliste
    - kein Pflicht-Aufklappen
    - direkter Status-CTA
  - Das ist der wichtigste Nicht-Regressionspunkt des gesamten Umbaus und in `S6` jetzt sauber gehalten.

- Regressions-Check fuer Mehrfach-Einnahmen:
  - Mehrfach-Einnahmen sind jetzt in der Daily-UX voll abbildbar:
    - sichtbarer Zwischenzustand
    - sichtbare Reihenfolge
    - direkter Slot-Confirm/Undo
  - Batch ist explizit genug definiert, um keinen Vertrauensbruch zu erzeugen.

- Dead-Path-/Ballast-Check:
  - Fachlich veraltet und spaeter aktiv abzubauen sind jetzt klar markiert:
    - `taken` als Hauptstatus
    - `!med.taken`-Selektion
    - Medikament- statt Slot-Batchlogik
    - `Alle genommen` als unscharfer CTA
  - `S6` hat diese Altpfade nicht weiter legitimiert, sondern sichtbar entkernt.

- Offene Punkte, aber kein S6-Blocker:
  - exakte Card-HTML-Struktur
  - konkrete Button-/Status-Texte
  - Feinheiten von Spacing, Collapse und Touch-Zielen
  - das sind jetzt Implementierungsfragen, keine offenen UX-Vertragsluecken

- Abnahme-Entscheid:
  - `S6` ist als Daily-UX-Vertrag tragfaehig genug, um die verbleibenden Downstream-Bloecke `S7` und `S8` darauf aufzusetzen.

- Check-Ergebnis:
  - Der neue IN-Tab-Flow ist fachlich geschlossen:
    - kompakt fuer `1x`
    - klar fuer `>1x`
    - ehrlich im Batch-Verhalten
    - direkt anschlussfaehig an den neuen Read-/Write-Contract.

#### S6.6 Doku-Sync (abgeschlossen)
- Doku-Entscheid:
  - Auch `S6` bleibt bis zur echten Implementierung ein Umbauvertrag und kein bereits ausgerollter Daily-Produktzustand.
  - Deshalb werden `docs/modules/*` auch hier noch nicht auf den neuen IN-Flow umgeschrieben.

- Durchgefuehrter Doku-Sync:
  - Die Roadmap traegt jetzt den vollstaendigen `S6`-Vertrag:
    - Fortschrittskarten
    - `1x`-Fast-Path
    - `>1x`-Slotliste
    - neuer Batch-Vertrag
  - Der Dokumentstatus-Hinweis in
    [Medication Management Module Spec.md](c:\Users\steph\Projekte\M.I.D.A.S\docs\archive\Medication%20Management%20Module%20Spec.md)
    bleibt weiterhin passend.

- Regel fuer spaeteren echten Doku-Sync:
  - Sobald der IN-Flow real umgebaut ist, muessen nachgezogen werden:
    - [Intake Module Overview.md](c:\Users\steph\Projekte\M.I.D.A.S\docs\modules\Intake%20Module%20Overview.md)
    - [Medication Module Overview.md](c:\Users\steph\Projekte\M.I.D.A.S\docs\modules\Medication%20Module%20Overview.md)
    - [QA_CHECKS.md](c:\Users\steph\Projekte\M.I.D.A.S\docs\QA_CHECKS.md)

- Check-Ergebnis:
  - Kein Dokument behauptet vorzeitig einen bereits implementierten Multi-Dose-Daily-Flow.

#### S6.7 Commit-Empfehlung (abgeschlossen)
- Empfehlung:
  - Ja, `S6` ist als eigener Roadmap-Block commit-wuerdig.

- Begruendung:
  - `S6` schliesst den letzten grossen Daily-UX-Vertrag vor den verbleibenden Downstream-Bloecken ab.
  - Danach bleiben vor dem Coding im Kern nur noch:
    - `S7` Low-Stock/Runout/Incidents
    - `S8` Assistant/Voice/Fast-Path
  - Der IN-Flow ist dabei ein ausreichend eigenstaendiger Schnitt fuer einen Commit.

- Check-Ergebnis:
  - `S6` ist als abgeschlossener Roadmap-Block commit-wuerdig.
  - Naechster Block kann sauber mit `S7` starten.

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

#### S7.1 Ergebnisprotokoll (abgeschlossen)
- Ziel von `S7.1`:
  - Der Verbrauch eines Medikaments darf im neuen Modell nicht mehr aus einem pauschalen Tageswert `dose_per_day` abgeleitet werden.
  - Er muss aus dem fuer den konkreten Tag aktiven Slot-Plan entstehen.

- Neue Grundregel:
  - Verbrauchsgrundlage ist nicht mehr:
    - `dose_per_day`
  - sondern:
    - Summe der fuer diesen Tag gueltigen Slot-Mengen
  - Formel:
    - `daily_planned_qty = sum(qty_per_slot aller aktiven Slots fuer diesen Tag)`

- Warum das fachlich notwendig ist:
  - Ein Medikament kann jetzt:
    - `1x`
    - `2x`
    - `3x`
    - `4x`
    taeglich geplant sein
  - Die Tagesmenge ist deshalb nicht mehr stabil in einem Stammdatenfeld aufgehoben, sondern ergibt sich aus dem aktuellen Plan.

- Welche Faktoren in den Verbrauch einfliessen:
  - aktive Medication
  - aktive Slots
  - `start_date`
  - `end_date`
  - `qty_per_slot`
  - konkreter Tageskontext
  - Nicht relevant fuer die Verbrauchsableitung:
    - `with_meal`
    - Label wie `Morgen` oder `Abend`
    - Voice-/Push-Zustand

- Verbrauchsarten im neuen Modell:
  - Planverbrauch:
    - was fuer den Tag laut aktivem Plan vorgesehen ist
  - Ist-Verbrauch:
    - was fuer den Tag bereits bestaetigt wurde
  - Restverbrauch:
    - was fuer heute noch offen ist

- Ableitungen:
  - `daily_planned_qty`
    - Summe aller aktiven Slot-Mengen fuer heute
  - `daily_taken_qty`
    - Summe aller bestaetigten Slot-Events fuer heute
  - `daily_remaining_qty`
    - `max(daily_planned_qty - daily_taken_qty, 0)`

- Warum diese Dreiteilung wichtig ist:
  - Low-Stock und Runout brauchen den Planverbrauch.
  - Die konkrete Tageswahrheit braucht den Ist-Verbrauch.
  - Push/Incidents brauchen den offenen Rest, nicht nur den Tagesplan.

- Guard gegen alte Denkfehler:
  - Ein Confirm darf nicht mehr implizit den kompletten Tagesverbrauch eines Medikaments ausloesen.
  - Jede Bestaetigung reduziert den Bestand nur um die dem Slot zugeordnete Menge.
  - Dadurch wird aus Verbrauch wieder das, was er fachlich sein muss:
    - slotweise
    - planbezogen
    - progress-aware

- Sonderfaelle:
  - kein aktiver Plan am Tag:
    - kein normaler Tagesverbrauch
    - keine kuenstliche Ableitung aus Altfeldern
  - zukuenftiger Planstart:
    - vor Start kein Verbrauch
  - abgelaufener Plan:
    - nach Ende kein Verbrauch
  - temporaeres Medikament:
    - gleicher Verbrauchsvertrag, nur zeitlich begrenzt

- Beziehung zu `dose_per_day`:
  - `dose_per_day` ist im neuen Modell keine operative Verbrauchsquelle mehr.
  - Falls das Feld waehrend des Umbaus technisch noch existiert, dann nur als Altbestand oder Hilfsrest, nicht mehr als fachliche Source of Truth.

- Konsequenz fuer spaetere Implementierung:
  - SQL-Read und Client-State muessen Tagesverbrauch aus den aktiven Slots ableiten.
  - Confirm/Undo muessen den Bestand pro Slot-Menge veraendern.
  - Low-Stock/Runout und Incident-Logik duerfen nie wieder auf ein einzelnes Tagesstammdatenfeld zurueckfallen.

- Check-Ergebnis:
  - Die Verbrauchslogik ist jetzt sauber auf den echten Tagesplan gezogen:
    - kein pauschales `dose_per_day`
    - kein versteckter Tagesblockverbrauch
    - korrekte Grundlage fuer Low-Stock, Runout und offene Tagesmedikation.

#### S7.2 Ergebnisprotokoll (abgeschlossen)
- Ziel von `S7.2`:
  - `days_left` und `runout_day` duerfen im Multi-Dose-Modell nicht mehr wie statische Stammdaten-Ableitungen wirken.
  - Sie muessen sich aus zwei Dingen gemeinsam ergeben:
    - dem aktiven Tagesplan
    - dem bereits erreichten Tagesfortschritt

- Neue Grundregel:
  - `days_left` und `runout_day` basieren nicht nur auf `daily_planned_qty`, sondern auch auf `daily_taken_qty`.
  - Damit werden sie progress-aware statt nur plan-aware.

- `days_left` im neuen Modell:
  - Kernidee:
    - `days_left` beschreibt, wie viele volle Tage der aktuelle Bestand unter dem heute gueltigen Plan noch traegt.
  - V1-Basisformel:
    - `days_left = floor(stock_count / daily_planned_qty)`
  - Diese Formel ist nur sinnvoll, wenn:
    - ein aktiver Plan existiert
    - `daily_planned_qty > 0`

- Warum `days_left` trotzdem progress-aware gelesen werden muss:
  - Der heute bereits bestaetigte Verbrauch ist im Bestand schon enthalten.
  - Deshalb ist `stock_count` nach einem Slot-Confirm bereits ein echter Zwischenstand.
  - Das heisst:
    - `days_left` bleibt auf der Basis des aktuellen Bestands korrekt
    - solange Confirm/Undo den Bestand wirklich slotweise mitziehen

- `runout_day` im neuen Modell:
  - `runout_day` ist die alltagsnahe Kalenderlesung derselben Logik.
  - Es soll nicht nur sagen:
    - wie viele Tagesmengen noch theoretisch da sind
  - sondern:
    - an welchem Kalendertag der Bestand unter dem aktuellen Plan aufgebraucht waere

- Progress-Awareness bei `runout_day`:
  - Der Rest des heutigen Tages darf nicht als volle Tagesmenge behandelt werden, wenn bereits Slots bestaetigt wurden.
  - Deshalb gilt fachlich:
    - fuer heute zaehlt nur `daily_remaining_qty`
    - fuer Folgetage zaehlt wieder `daily_planned_qty`

- Lesbare Denkregel:
  - Heute:
    - offener Restverbrauch = `daily_remaining_qty`
  - Ab morgen:
    - normaler Tagesverbrauch = `daily_planned_qty`
  - Daraus folgt:
    - `runout_day` wird nicht durch einen bereits teilweise erledigten Tag kuenstlich zu pessimistisch

- Beispiel:
  - Medikament `2x taeglich`, je Slot `1`
  - heutiger Bestand nach Morgeneinnahme: `5`
  - fuer heute gilt noch `daily_remaining_qty = 1`
  - ab morgen gilt wieder `daily_planned_qty = 2`
  - Ein altes Tagesblock-Modell wuerde hier zu grob rechnen; das neue Modell liest den Tag korrekt als bereits teilweise erledigt.

- Sonderfaelle:
  - kein aktiver Plan:
    - kein valider `days_left`-/`runout_day`-Wert
  - `daily_planned_qty = 0`:
    - keine normale Verbrauchsprognose
  - Startdatum in der Zukunft:
    - vor Start kein aktueller Verbrauch und damit keine normale Runout-Prognose aus diesem Plan
  - Enddatum in der Vergangenheit:
    - kein weiterer Verbrauch

- Guard gegen zu viel Forecast-Komplexitaet:
  - V1 simuliert nicht:
    - wechselnde Zukunftsplaene
    - Wochenmuster
    - Intervallregime
    - probabilistische Restprognosen
  - `days_left` und `runout_day` bleiben bewusst einfache, alltagstaugliche Werte unter dem aktuell gueltigen Plan.

- Beziehung zu Low-Stock:
  - Low-Stock darf spaeter auf genau diesen Werten aufsetzen.
  - Wenn `days_left` und `runout_day` schon progress-aware sind, kann Low-Stock ruhig und fachlich sauber bleiben.

- Konsequenz fuer die spaetere Implementierung:
  - SQL und Client duerfen `runout_day` nicht mehr wie einen bloessen `today + floor(stock/dose_per_day)`-Wert berechnen.
  - Der Tagesrest muss im Modell sichtbar oder serverseitig korrekt eingerechnet sein.
  - Confirm/Undo muessen deshalb den Bestand immer unmittelbar aktuell halten.

- Check-Ergebnis:
  - `days_left` und `runout_day` sind jetzt fachlich sauber neu gezogen:
    - vom Tagesplan abgeleitet
    - vom Tagesfortschritt beeinflusst
    - einfach genug fuer MIDAS
    - deutlich korrekter als das alte Tagesblock-Modell.

#### S7.3 Ergebnisprotokoll (abgeschlossen)
- Ziel von `S7.3`:
  - Der Low-Stock-Ack-Vertrag soll im neuen Modell weiter ruhig und alltagstauglich bleiben.
  - Er darf aber nicht mehr still an alter Tages-Boolean- oder `dose_per_day`-Logik haengen.

- Grundregel:
  - Low-Stock-Ack bleibt ein Medication-Level-Vertrag.
  - Er ist nicht an einzelne Slots gebunden.
  - Er bestaetigt:
    - diesen kritischen Bestandszustand habe ich gesehen
  - Nicht:
    - einzelne Einnahmen
    - einzelne Slot-Risiken
    - einen Versand- oder Nachbestellnachweis

- Warum Medication-Level richtig bleibt:
  - Low-Stock ist weiterhin ein Bestandsproblem, kein Slot-Problem.
  - Auch bei `3x taeglich` ist nicht jeder offene Slot ein eigener Low-Stock-Kontext.
  - Das haelt die UI ruhig und verhindert Signalverdopplung.

- Ausloeser des Ack-Kontexts:
  - Low-Stock entsteht im neuen Modell aus:
    - aktuellem Bestand
    - aktivem Tagesplan
    - progress-aware `days_left`
  - Der Ack bestaetigt genau diesen daraus entstandenen kritischen Zustand.

- Empfohlene Ack-Basis fuer V1:
  - `med_id`
  - `day`
  - `stock_snapshot`
  - Optional spaeter:
    - `days_left_snapshot`
  - V1 braucht aber keinen slot-bezogenen Ack-Schluessel.

- Was sich gegenueber dem alten Modell aendert:
  - Nicht mehr ein Ack gegen einen impliziten Tagesverbrauch aus `dose_per_day`.
  - Sondern ein Ack gegen einen kritischen Zustand, der aus dem echten aktiven Plan abgeleitet wurde.
  - Die Ack-Semantik bleibt ruhig, aber die Berechnungsbasis darunter wird korrekt.

- Ack-Verhalten bei Plan- oder Bestandsaenderung:
  - Ein bestehender Ack soll nur so lange unterdruecken, wie derselbe relevante Low-Stock-Kontext fachlich noch gilt.
  - Wenn sich der relevante Kontext aendert, darf der Hinweis wieder erscheinen.

- Relevante Kontextaenderungen sind:
  - Bestand hat sich geaendert
    - z. B. Restock
    - Confirm/Undo mit echtem Bestandswechsel
  - aktiver Plan hat sich geaendert
    - andere Frequenz
    - andere Slot-Mengen
    - Start/Ende
  - Medication wurde deaktiviert/reaktiviert

- Warum Planwechsel den Ack beruehren darf:
  - Wenn ein Medikament ploetzlich statt `1x` jetzt `3x` taeglich verbraucht wird, ist derselbe numerische Bestand fachlich ein anderer Low-Stock-Zustand.
  - Ein alter Ack darf diesen neuen Risikokontext nicht unsichtbar machen.

- Was der Ack nicht tun darf:
  - kein stilles Verknuepfen an einzelne Slot-IDs
  - kein Unterdruecken offener Slot-Interaktion
  - kein Einfluss auf Confirm/Undo
  - kein eigener Push- oder Reminder-Zustand

- V1-Grenze:
  - Low-Stock-Ack bleibt bewusst schlicht:
    - gesehen
    - fuer diesen Medication-Kontext vorerst ausgeblendet
  - Keine Wiedervorlage-Engine
  - Keine Snooze-Matrix
  - Keine getrennten Acks fuer verschiedene Slots desselben Medikaments

- Konsequenz fuer die spaetere Implementierung:
  - `med_ack_low_stock_v2` bleibt Medication-zentriert.
  - Die Pruefung, ob ein Ack noch gueltig ist, muss gegen den neuen Bestands-/Plan-Kontext laufen.
  - Die Low-Stock-UI darf dadurch ruhig bleiben, aber nicht blind fuer echte Kontextwechsel werden.

- Check-Ergebnis:
  - Der Low-Stock-Ack-Vertrag bleibt im neuen Modell:
    - einfach
    - medication-zentriert
    - kompatibel mit Mehrfach-Einnahmen
    - sensibel fuer echte Plan- oder Bestandsaenderungen
    - frei von Slot-Spam oder neuer Reminder-Komplexitaet.

#### S7.4 Ergebnisprotokoll (abgeschlossen)
- Ziel von `S7.4`:
  - Die Incident-/Push-Logik muss das neue Mehrfach-Einnahme-Modell korrekt lesen, ohne den Charakter von MIDAS zu verlieren.
  - Sie darf also:
    - offene Tagesmedikation erkennen
  - aber nicht:
    - pro Slot nerven
    - in Reminder-Ketten kippen

- Grundregel fuer Medication-Incidents:
  - Auch im Multi-Dose-Modell gibt es maximal einen aggregierten Medication-Incident pro Kalendertag.
  - Dieser Incident fragt nicht:
    - welcher einzelne Slot ist offen
  - sondern:
    - ist die heutige Medikation am spaeten Schwellenwert noch nicht vollstaendig erledigt

- Neue Incident-Basis:
  - Nicht mehr:
    - `exists med where !taken`
  - Sondern:
    - `exists medication where plan_active = true and state != done`
  - Praktisch lesbar:
    - es gibt heute noch mindestens eine offene Einnahme im aktiven Medication-Plan

- Warum kein Slot-Push:
  - Ein `3x taeglich`-Antibiotikum darf nicht drei verschiedene Push-Kontexte am Tag erzeugen.
  - Das waere fuer MIDAS:
    - zu laut
    - zu nah an klassischer Reminder-App-Logik
    - kontraproduktiv fuer Vertrauen und Alltag

- Trigger-Regel fuer V1:
  - Push/Incident wird nur relevant, wenn:
    - heute aktive Medikation existiert
    - und diese am festen spaeten Tages-Schwellenwert noch nicht `done` ist
  - Kein Trigger:
    - direkt beim einzelnen offenen Slot
    - nach jeder Teilbestaetigung
    - beim Wechsel von `open` auf `partial`

- Rolle von `partial`:
  - `partial` ist fuer die UI wichtig.
  - Fuer Push ist `partial` aber kein eigener Incident-Typ.
  - Fuer Incident-Entscheidung gilt nur:
    - am Schwellenwert noch nicht vollstaendig erledigt = Incident-relevant

- Re-Trigger-Regel:
  - Maximal ein Medication-Incident pro Kalendertag.
  - Keine Schleife fuer:
    - neuen offenen Slot
    - zwischenzeitliche Teilbestaetigung
    - erneuten App-Fokus
  - Das bestehende ruhige Incident-Prinzip bleibt damit erhalten.

- Notification-Sprache im neuen Modell:
  - Die Sprache darf weiter aggregiert und ruhig bleiben.
  - Gute Richtung:
    - `Medikation fuer heute noch offen`
  - Nicht notwendig in V1:
    - Push nennt einzelne Slots
    - Push nennt jede betroffene Medikation
  - Der Lockscreen ist Schutznetz, nicht Daily-Detailansicht.

- Beziehung zu Low-Stock:
  - Low-Stock bleibt ein eigener stiller UI-/Kontextpfad.
  - Er wird nicht zu einem eigenen Medication-Push pro Slot oder pro Planwechsel.
  - Damit bleiben:
    - Adhaerenz-Warnung
    - Bestandswarnung
    fachlich getrennt.

- Incident-Quelle im neuen Read-Contract:
  - Incident-Logik soll denselben Tagesvertrag lesen wie UI und Voice.
  - Minimal benoetigt:
    - `plan_active`
    - `state`
    - optional `taken_count` / `total_count` fuer Diagnose oder Future Debugging
  - Kein eigenes Spezialmodell noetig.

- Sonderfaelle:
  - kein aktiver Plan:
    - kein Medication-Incident
  - Startdatum in der Zukunft:
    - kein heutiger Incident
  - Enddatum in der Vergangenheit:
    - kein heutiger Incident
  - deaktiviertes Medikament:
    - kein Incident

- Guard gegen Push-Drift:
  - Nicht erlaubt in V1:
    - Push pro offenem Slot
    - Push nach jedem Slotzeitpunkt
    - Push-Eskalationsketten
    - Push auf Basis von `mit Mahlzeit`
    - unterschiedlicher Incident-Typ fuer `partial`

- Konsequenz fuer die spaetere Implementierung:
  - `app/modules/incidents/index.js` muss von `!med.taken` auf den neuen Tagesvertrag umgestellt werden.
  - Die lokale und spaeter ggf. remote Incident-Entscheidung muss denselben Aggregat-Trigger nutzen.
  - Bestehende Tagesgrenzen und ruhige Einmaligkeit bleiben erhalten.

- Check-Ergebnis:
  - Die Incident-/Push-Regel bleibt auch im Multi-Dose-Modell klar MIDAS-konform:
    - ein aggregierter Tages-Incident
    - keine Slot-Flut
    - kein Reminder-Charakter
    - korrekt gegen offene Tagesmedikation statt gegen alten Tages-Bool.

#### S7.5 Schritt-Abnahme (abgeschlossen)
- Abnahme gegen `S3` und `S4`:
  - `S7` bleibt voll konsistent mit:
    - aktivem Tagesplan statt `dose_per_day`
    - slotweiser Bestandsmutation
    - progress-aware Tageszustand
    - Medication-Level Low-Stock-Ack
  - Es gibt keinen offenen Logikteil mehr, der fuer Low-Stock, Runout oder Incident wieder den alten Tages-Boolean-Vertrag braeuchte.

- Abnahme gegen Produkt-Guardrails:
  - Die Logik bleibt ruhig und MIDAS-konform:
    - kein Reminder-Spam
    - kein Push pro Slot
    - kein `partial`-Alarmismus
    - kein Mahlzeiten- oder Zeitlogik-Creep
  - Damit ist `S7` fachlich deutlich staerker, ohne das Produkt lauter zu machen.

- Drift-/Ballast-Check:
  - Fachlich veraltete Altannahmen sind jetzt klar markiert:
    - `dose_per_day` als operative Verbrauchsquelle
    - `!med.taken` als Incident-Trigger
    - Low-Stock-Ack auf Basis eines alten Tagesblocks
  - `S7` hat diese Altpfade nicht weiter legitimiert, sondern sauber entkernt.

- Risiko-Check:
  - Die verbleibenden Risiken liegen jetzt nicht mehr in der Logik selbst, sondern spaeter in der Umsetzung:
    - falsche Berechnung von `daily_remaining_qty`
    - halbe Umstellung der Incident-Quelle
    - Bestandsdrift bei Confirm/Undo
  - Diese Risiken sind aber jetzt klar sichtbar und testbar.

- Abnahme-Entscheid:
  - `S7` ist als letzter grosser Logikblock vor Voice/Assistant tragfaehig genug abgeschlossen.

- Check-Ergebnis:
  - Bestands-, Runout-, Low-Stock- und Incident-Logik sind jetzt fachlich sauber auf das neue Multi-Dose-Modell gezogen.

#### S7.6 Doku-Sync (abgeschlossen)
- Doku-Entscheid:
  - Auch `S7` bleibt bis zur realen Implementierung ein Umbauvertrag.
  - Deshalb werden `docs/modules/Medication Module Overview.md`, `docs/modules/Intake Module Overview.md`, `docs/modules/Push Module Overview.md` und `docs/QA_CHECKS.md` noch nicht vorzeitig umgeschrieben.

- Durchgefuehrter Doku-Sync:
  - Die Roadmap traegt jetzt den vollstaendigen `S7`-Vertrag:
    - Verbrauch aus aktivem Tagesplan
    - progress-aware `days_left` / `runout_day`
    - Medication-Level Low-Stock-Ack
    - aggregierter Tages-Incident
  - Der bereits gesetzte Dokumentstatus-Hinweis in
    [Medication Management Module Spec.md](c:\Users\steph\Projekte\M.I.D.A.S\docs\archive\Medication%20Management%20Module%20Spec.md)
    bleibt weiterhin ausreichend und korrekt.

- Regel fuer spaeteren echten Doku-Sync:
  - Nach echter Implementierung von `S9.6` muessen nachgezogen werden:
    - [Medication Module Overview.md](c:\Users\steph\Projekte\M.I.D.A.S\docs\modules\Medication%20Module%20Overview.md)
    - [Intake Module Overview.md](c:\Users\steph\Projekte\M.I.D.A.S\docs\modules\Intake%20Module%20Overview.md)
    - [Push Module Overview.md](c:\Users\steph\Projekte\M.I.D.A.S\docs\modules\Push%20Module%20Overview.md)
    - [QA_CHECKS.md](c:\Users\steph\Projekte\M.I.D.A.S\docs\QA_CHECKS.md)

- Check-Ergebnis:
  - Kein Dokument behauptet vorzeitig eine bereits ausgerollte neue Low-Stock-/Incident-Logik.

#### S7.7 Commit-Empfehlung (abgeschlossen)
- Empfehlung:
  - Ja, `S7` ist als eigener Roadmap-Block commit-wuerdig.

- Begruendung:
  - `S7` schliesst die komplette Bestands- und Incident-Logik als eigenstaendigen Fachblock ab.
  - Danach bleibt vor der Umsetzung nur noch `S8` als letzter Downstream-Vertrag fuer Assistant/Voice/Fast-Path.
  - Das ist ein sauberer Commit-Schnitt zwischen:
    - Kernlogik
    - Voice-/Intent-Absicherung

- Check-Ergebnis:
  - `S7` ist als abgeschlossener Roadmap-Block commit-wuerdig.
  - Naechster Block kann sauber mit `S8` starten.

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

#### S8.1 Ergebnisprotokoll (abgeschlossen)
- Ziel von `S8.1`:
  - Der bestehende Fast-Path `medication_confirm_all` darf im neuen Modell nicht mehr als Sammelbestaetigung "aller offenen Medikamente" verstanden werden.
  - Er muss fachlich sauber heissen:
    - bestaetige alle aktuell offenen Einnahmen fuer heute

- Neue Kernsemantik:
  - `medication_confirm_all` arbeitet nicht mehr auf Medikament-Ebene.
  - Er arbeitet auf:
    - allen heute offenen Slot-Ereignissen
  - Das ist dieselbe Wahrheit wie im neuen IN-Flow.

- Warum diese Umstellung zwingend ist:
  - Im alten Modell war:
    - ein offenes Medikament = eine offene Tagesbestaetigung
  - Im neuen Modell kann ein Medikament aber:
    - `1/3`
    - `2/4`
    - `0/2`
    sein
  - Deshalb waere `alle offenen Medikamente bestaetigen` fachlich zu grob und potentiell irrefuehrend.

- Neue Lesart fuer den Intent:
  - Wenn `medication_confirm_all` ausgefuehrt wird, dann bedeutet das:
    - finde alle offenen Slots aus dem heutigen aktiven Medication-Plan
    - bestaetige sie
  - Nicht:
    - schliesse alle Medikamente irgendwie auf Tagesebene

- Beziehung zur UI:
  - Diese Semantik muss identisch sein zu dem expliziten Batch-CTA im IN-Tab:
    - `alle offenen Einnahmen bestaetigen`
  - Damit bleiben:
    - UI
    - Text
    - Voice
    auf derselben Fachwahrheit

- Guard gegen Teilmengen-Drift:
  - `medication_confirm_all` darf nicht implizit heissen:
    - bestaetige nur das naechste offene Medikament
    - bestaetige nur das erste offene Slot-Fragment pro Medikation
    - bestaetige irgendwie "genug"
  - Entweder:
    - alle offenen Einnahmen fuer heute
  - oder:
    - nichts

- Verhalten bei `1x taeglich`:
  - Fuer Daily-Meds bleibt der Intent alltagstauglich, weil ein offenes Medikament dort genau einem offenen Slot entspricht.
  - Dadurch bleibt die alte Alltagserwartung fuer einfache Medikation weitgehend erhalten.

- Verhalten bei Mehrfach-Einnahmen:
  - Der Intent ist bewusst stark.
  - Wenn ein Medikament heute `1/3` ist, dann umfasst `confirm_all` auch die restlichen offenen Slots dieser Medikation.
  - Genau deshalb muss die Oberflaechen- und Spoken-Sprache das explizit sagen.

- Nicht Aufgabe von `medication_confirm_all`:
  - keine Auswahl einzelner Medikamente
  - keine Auswahl einzelner Slots
  - keine semantische Interpretation von "hab schon einiges genommen"
  - kein stilles Safety-Net fuer unklare Transkripte

- Konsequenz fuer die spaetere Implementierung:
  - Hub/Text/Voice muessen den Tages-Read laden und daraus offene Slots ableiten.
  - Die Ausfuehrung erfolgt dann slotweise ueber den neuen Write-Kern.
  - Die Erfolgsantwort muss dieselbe Semantik tragen:
    - nicht `Medikation bestaetigt`
    - sondern sinngemaess `offene Einnahmen fuer heute bestaetigt`

- Check-Ergebnis:
  - `medication_confirm_all` ist jetzt fachlich sauber an das neue Modell angeschlossen:
    - explizit
    - slot-basiert
    - gleich zur UI
    - ohne versteckte Teilmengenlogik oder Rueckfall in Tages-Boolean-Sprache.

#### S8.2 Ergebnisprotokoll (abgeschlossen)
- Ziel von `S8.2`:
  - Der neue Slot-Vertrag darf die Voice-Oberflaeche nicht in Richtung freier Medikationssteuerung aufweichen.
  - Voice muss unter Multi-Dose nicht breiter, sondern nur praeziser werden.

- Grundregel:
  - Voice bleibt eng gefuehrt.
  - Multi-Dose fuehrt nicht zu:
    - freiem Plan-Editing per Sprache
    - generischer Slot-Manipulation
    - offener Medikamentenverwaltung ueber Transkript

- Guardrail 1 - kein Plan-Authoring per Voice:
  - Nicht erlaubt:
    - Medikament anlegen
    - Frequenz aendern
    - Slots umbenennen
    - Start-/Enddaten setzen
    - `mit Mahlzeit` setzen
  - Diese Dinge bleiben im TAB-Editor.

- Guardrail 2 - keine freie Slot-Auswahl ohne engen Vertrag:
  - Nicht erlaubt in V1:
    - `bestaetige nur Abend`
    - `mach Mittag rueckgaengig`
    - `nimm den zweiten Slot`
  - Grund:
    - das wuerde sofort neue Ambiguitaet in Sprache, Matching und Safety erzeugen
    - ohne echten Alltagsgewinn fuer V1

- Guardrail 3 - keine implizite Teilmengenlogik:
  - Sprachsaetze wie:
    - `hab alles genommen`
    - `bin fertig`
    - `passt schon`
    duerfen nicht auf unklare Teilmengen gemappt werden.
  - Entweder ein Intent ist klar genug fuer:
    - alle offenen Einnahmen bestaetigen
  - oder er bleibt geblockt / faellt kontrolliert nicht in den produktiven Fast-Path.

- Guardrail 4 - kein Medication-Reorder-Drift:
  - Der bestehende enge Low-Stock-Follow-up bleibt lokal und guard-railed.
  - Multi-Dose ist kein Anlass fuer:
    - breitere Nachbestelllogik
    - neue Versand- oder Statusdialoge
    - freie Folgekonversation ueber Medikamente

- Warum diese Enge fuer MIDAS richtig ist:
  - Je komplexer das Medikamentenmodell wird, desto wichtiger wird es, den Sprachpfad nicht aufzublasen.
  - Die sichere Richtung ist:
    - komplexeres Datenmodell
    - aber weiterhin enge, explizite Sprachoberflaeche

- Erlaubte Voice-Richtung unter diesen Guardrails:
  - bestaetige alle offenen Einnahmen fuer heute
  - Low-Stock-Follow-up im bestehenden engen lokalen Rahmen
  - keine breitere Medication-Kommandosprache in V1

- Beziehung zur UI:
  - Die UI darf mehr Detail zeigen als Voice.
  - Das ist hier bewusst richtig:
    - Daily-Card kann Slots sichtbar machen
    - Voice bleibt auf wenige sichere Sammelaktionen begrenzt
  - Das ist keine Inkonsistenz, sondern ein gewollter Safety-Schnitt.

- Konsequenz fuer die spaetere Implementierung:
  - Intent-Regeln und Voice-Orchestrator muessen enger filtern, nicht breiter.
  - Der neue Slot-Contract wird im Voice-Pfad intern genutzt,
    aber nicht in offene sprachliche Freiheitsgrade uebersetzt.

- Check-Ergebnis:
  - Die Voice-Guardrails bleiben unter Multi-Dose stabil:
    - kein freies Medication-Authoring
    - keine freie Slot-Navigation
    - keine unklare Teilmengenbestaetigung
    - weiterhin enger, sicherer Fast-Path statt offener Sprachsteuerung.

#### S8.3 Ergebnisprotokoll (abgeschlossen)
- Ziel von `S8.3`:
  - Unter dem neuen Slot-Modell muss klar sein, welche Medication-Semantik Voice produktiv ueberhaupt tragen darf.
  - Die Regel dafuer ist:
    - lieber wenig und eindeutig
    - als viel und sprachlich unsauber

- Erlaubte Kernsemantik in V1:
  - `confirm_all_open`
  - Fachliche Bedeutung:
    - bestaetige alle aktuell offenen Einnahmen fuer heute
  - Das ist die einzige starke Sammelaktion, die unter Multi-Dose produktiv sauber tragfaehig bleibt.

- Anforderungen an diese erlaubte Semantik:
  - Die Oberflaechenantwort muss dieselbe Bedeutung tragen wie die Ausfuehrung.
  - Das heisst:
    - wenn intern alle offenen Slots bestaetigt werden
    - dann muss auch die Rueckmeldung genau das sagen
  - Keine weichgespuelte Sprache wie:
    - `Medikation bestaetigt`
    wenn tatsaechlich mehrere offene Einnahmen geschlossen wurden.

- Nicht als eigene V1-Semantik freigeben:
  - `confirm_next_open`
  - `confirm_evening_slot`
  - `undo_last_medication`
  - `confirm_partial_medication`
  - Grund:
    - jede dieser Semantiken wuerde neue Mehrdeutigkeit und zusaetzliche Safety-Faelle oeffnen

- Rolle von `confirm_next_open`:
  - Kann als spaetere Future Hook konzeptionell bestehen bleiben.
  - Ist aber keine V1-Pflicht und kein produktiver Fast-Path fuer diesen Umbau.
  - Warum:
    - "naechste offene Einnahme" ist fuer Nutzer sprachlich intuitiv
    - aber technisch und fachlich in V1 noch unnoetig riskant

- Sprachliche Konsequenz:
  - Produktive Voice-Saetze muessen semantisch so eng sein, dass sie klar auf `confirm_all_open` mappen.
  - Gute Richtung:
    - `ich habe alle meine Medikamente genommen`
    - nur dann, wenn das Produkt wirklich `alle offenen Einnahmen fuer heute` bestaetigt
  - Schlechte Richtung:
    - vage Teilmengen-Sprache mit unklarer Reichweite

- Beziehung zu Text/Fast-Path:
  - Dieselbe Semantik gilt nicht nur fuer Voice, sondern auch fuer den lokalen Text-Fast-Path.
  - Das Ziel bleibt:
    - ein gemeinsamer Intent-Kern
    - keine abweichende Medication-Bedeutung je Surface

- Warum diese Enge wichtig ist:
  - Multi-Dose fuehrt sonst sehr schnell zu falschen mentalen Modellen:
    - Nutzer meint `alles`, System meint `nur heute offen`
    - oder Nutzer meint `einen Teil`, System bestaetigt den Rest mit
  - Genau deshalb muss `S8.3` die erlaubte V1-Semantik scharf halten.

- Konsequenz fuer spaetere Implementierung:
  - Intent-Matching und Voice-Antworten muessen auf diese erlaubte Semantik abgestimmt werden.
  - Alles, was nicht klar `confirm_all_open` ist, bleibt:
    - geblockt
    - inert
    - oder faellt nicht in den produktiven lokalen Medication-Fast-Path

- Check-Ergebnis:
  - Die erlaubte Voice-Semantik ist jetzt bewusst eng und eindeutig:
    - produktiv nur `confirm_all_open`
    - keine Pflicht fuer `confirm_next_open`
    - keine versteckte Teilmengen- oder Slot-Einzelsemantik in V1.

#### S8.4 Ergebnisprotokoll (abgeschlossen)
- Ziel von `S8.4`:
  - Der bestehende Low-Stock-Follow-up und andere enge lokale Medication-Spezialpfade muessen auf das neue Read-Model passen.
  - Dabei gilt:
    - neues Modell lesen
    - aber keine neue Produktbreite erfinden

- Ausgangslage:
  - Der heutige Voice-/Medication-Fast-Path haengt an einem frischen Tages-Snapshot.
  - Nach erfolgreichem `medication_confirm_all` kann ein enger lokaler Low-Stock-Follow-up kommen.
  - Dieser Pfad soll bleiben, aber auf neuer Datenbasis.

- Neue Lesebasis fuer den Follow-up:
  - Nicht mehr:
    - altes Flat-Model mit `taken`, `qty`, `dose_per_day`
  - Sondern:
    - neues Tages-Read-Model mit:
      - `low_stock`
      - `days_left`
      - `runout_day`
      - `state`
      - `plan_active`
  - Der Follow-up liest also denselben Medication-Zustand wie UI und Push.

- Produktregel fuer den Low-Stock-Follow-up:
  - Er bleibt ein enger Nachsatz nach erfolgreichem `confirm_all_open`.
  - Er ist nicht:
    - ein eigener offener Dialog
    - eine neue Medication-Konversation
    - ein freies Reorder-System

- Trigger-Regel im neuen Modell:
  - Follow-up nur, wenn nach erfolgreicher Bestaetigung weiterhin ein echter frischer `low_stock`-Zustand vorliegt.
  - Nicht triggern wegen:
    - offener Slots allein
    - `partial`
    - Planwechsel
    - Slot-Anzahl

- Warum das im Multi-Dose-Modell wichtig ist:
  - Ein Medikament kann heute mehrere Slots haben und trotzdem nach `confirm_all_open` erstmals in einen klaren Low-Stock-Zustand kippen.
  - Der Follow-up darf das sehen.
  - Er darf aber nicht mit jeder Teilbestaetigung oder jedem offenen Restslot anspringen.

- Guard gegen neue Spezialpfade:
  - Nicht erlaubt in V1:
    - Follow-up pro Medikation mit offener Slot-Liste
    - Follow-up fuer einzelne Slots
    - Follow-up fuer temporaere Plaene als eigener Zweig
    - Follow-up auf Basis von `mit Mahlzeit`
  - Der bestehende Reorder-nahe Spezialpfad bleibt genau so eng wie bisher, nur auf neuer Datenbasis.

- Beziehung zu `confirm_all_open`:
  - Reihenfolge bleibt logisch:
    - erst offene Einnahmen bestaetigen
    - dann, falls relevant, lokaler Low-Stock-Nachsatz
  - Kein parallel laufender Mischdialog.

- Beziehung zu Text und Hub:
  - Dieselbe enge Logik gilt fuer Text-/Hub-nahe Spezialpfade, nicht nur fuer Voice.
  - Das Ziel bleibt:
    - gemeinsamer Medication-Zustand
    - wenige eng gefuehrte Folgeaktionen

- Umsetzungskritische Folge:
  - Nach dem Umbau muessen bestehende Medication-Follow-up-Reads aktiv auf Altfelder geprueft werden.
  - Alles, was heute noch `taken` oder alte Tagesblock-Semantik erwartet, muss auf den neuen Snapshot wechseln.

- Check-Ergebnis:
  - Der Low-Stock-Follow-up bleibt im neuen Modell:
    - lokal
    - eng
    - guard-railed
    - auf neuer Datenbasis korrekt
    - ohne neue Spezialdialoge oder Medication-Drift.

#### S8.5 Ergebnisprotokoll (abgeschlossen)
- Ziel von `S8.5`:
  - Der gemeinsame Intent-Kern fuer Text und Voice muss die neue Medication-Semantik verstehen.
  - Gleichzeitig darf diese Umstellung nicht zu einer breiteren oder freieren Medikamentensprache fuehren.

- Neue Anforderung an den Intent-Kern:
  - Medication-Intents duerfen nicht mehr implizit auf einem Tages-Boolean beruhen.
  - Sie muessen gegen den neuen Contract denken in:
    - offene Einnahmen
    - Slot-basierter Tagesfortschritt
    - `confirm_all_open`

- Was Validatoren kuenftig absichern muessen:
  - dass ein Medication-Fast-Path nur dann greift, wenn die beabsichtigte Aktion semantisch klar ist
  - dass unklare Teilmengen-Sprache nicht in einen produktiven Confirm kippt
  - dass keine alte Annahme wie `medication today = done/offen` im Intent-Kern weiterlebt

- Konkrete Guard-Richtung fuer Validatoren:
  - erlauben:
    - klare Sammelbestaetigung aller offenen Einnahmen
  - blocken oder nicht-produktiv behandeln:
    - unklare Teilmengenformeln
    - freie Slot-Auswahl
    - vage Selbstberichte ohne sichere Reichweite

- Beziehung zu Pending-/Confirm-Kontext:
  - Falls bestaetigende Sprachwoerter wie `ja`, `speichern`, `ok` im Medication-Kontext benutzt werden, muss der Pending-Kontext kuenftig dieselbe neue Medication-Semantik tragen.
  - Das heisst:
    - wenn ein Pending-Kontext fuer Medication existiert, dann bezieht er sich nicht mehr auf einen alten Tages-Bool
    - sondern auf die explizite Sammelaktion oder den engen Follow-up-Kontext

- Was aus dem alten Intent-Vertrag raus muss:
  - alte stillschweigende Gleichsetzung:
    - `Medikation offen` = `!taken`
  - alte Erfolgssemantik:
    - `Medikation bestaetigt`
    wenn intern eigentlich mehrere offene Einnahmen bestaetigt wurden
  - alte Validator-Annahme:
    - Tagesabschluss sei eine einzige Medikament-Aktion

- Was bewusst nicht dazukommt:
  - keine neue offene Medication-Slot-Grammatik
  - keine sprachliche Freigabe fuer:
    - `nur Abend`
    - `nur die restlichen`
    - `mach Antibiotika fertig`
  - keine freie Plan- oder Mengensteuerung ueber den Intent-Kern

- Konsequenz fuer die spaetere Implementierung:
  - Intent-Regeln, Validatoren und lokale Erfolgs-/Blockertexte muessen an dieselbe neue Medication-Semantik angepasst werden.
  - Dabei gilt:
    - gemeinsamer Intent-Kern fuer Text und Voice
    - aber weiterhin enger Medication-Scope

- Check-Ergebnis:
  - Der Intent-/Validator-Vertrag ist jetzt mit dem neuen Slot-/Progress-Modell kompatibel:
    - ohne Tages-Boolean-Reste
    - ohne neue Sprachbreite
    - ohne implizite Teilmengenbestaetigung
    - konsistent zwischen Text, Voice und UI.

#### S8.6 Schritt-Abnahme (abgeschlossen)
- Abnahme gegen die bisherigen Vertraege:
  - `S8` bleibt voll konsistent mit:
    - neuem IN-Flow aus `S6`
    - aggregierter Incident-Logik aus `S7`
    - Read-/Write-Contract aus `S4`
  - Voice/Text bestaetigen damit nicht mehr eine andere Medication-Wahrheit als UI oder Push.

- Safety-Abnahme:
  - Die Medication-Semantik bleibt im Sprachpfad eng genug:
    - kein freies Authoring
    - keine freie Slot-Navigation
    - keine implizite Teilmengenlogik
    - kein offener Medication-Dialog
  - Das ist fuer den komplexeren Multi-Dose-Kern der entscheidende Sicherheitsanker.

- Drift-/Ballast-Check:
  - Fachlich veraltet und spaeter aktiv zu entfernen sind jetzt klar benannt:
    - Medication-Fast-Paths auf Basis von `!taken`
    - alte Success-Copy wie `Medikation bestaetigt`
    - Validator-Annahmen, die noch einen Tagesblock statt offener Einnahmen meinen
  - `S8` hat keine neue Mischsemantik erzeugt, sondern den Sprachpfad auf einen engen sauberen Kern reduziert.

- Abnahme-Entscheid:
  - `S8` ist als letzter Downstream-Vertragsblock tragfaehig genug abgeschlossen.
  - Danach bleibt keine offene Grundsatzluecke mehr, die `S9` fachlich blockieren wuerde.

- Check-Ergebnis:
  - Text, Voice, Intent und Follow-up-Pfade sind jetzt fachlich konsistent mit dem neuen Medication-Modell.

#### S8.7 Doku-Sync (abgeschlossen)
- Doku-Entscheid:
  - Auch `S8` bleibt bis zur realen Implementierung ein Umbauvertrag.
  - Deshalb werden Assistant-/Intent-/Medication-/Push-Overviews noch nicht vorzeitig auf einen produktiven Multi-Dose-Voice-Stand umgeschrieben.

- Durchgefuehrter Doku-Sync:
  - Die Roadmap traegt jetzt den vollstaendigen `S8`-Vertrag:
    - `confirm_all_open`
    - enge Voice-Guardrails
    - begrenzte Voice-Semantik
    - Low-Stock-Follow-up auf neuem Read-Model
    - Intent-/Validator-Anpassung
  - Der bestehende Dokumentstatus-Hinweis in
    [Medication Management Module Spec.md](c:\Users\steph\Projekte\M.I.D.A.S\docs\archive\Medication%20Management%20Module%20Spec.md)
    bleibt weiterhin korrekt.

- Regel fuer spaeteren echten Doku-Sync:
  - Nach echter Implementierung von `S9.7` muessen nachgezogen werden:
    - [Medication Module Overview.md](c:\Users\steph\Projekte\M.I.D.A.S\docs\modules\Medication%20Module%20Overview.md)
    - [Push Module Overview.md](c:\Users\steph\Projekte\M.I.D.A.S\docs\modules\Push%20Module%20Overview.md)
    - [Intent Engine Module Overview.md](c:\Users\steph\Projekte\M.I.D.A.S\docs\modules\Intent%20Engine%20Module%20Overview.md)
    - relevante Assistant-/Voice-Doku
    - [QA_CHECKS.md](c:\Users\steph\Projekte\M.I.D.A.S\docs\QA_CHECKS.md)

- Check-Ergebnis:
  - Kein Dokument behauptet vorzeitig einen bereits umgebauten Medication-Voice-/Intent-Produktivzustand.

#### S8.8 Commit-Empfehlung (abgeschlossen)
- Empfehlung:
  - Ja, `S8` ist als eigener Roadmap-Block commit-wuerdig.

- Begruendung:
  - `S8` schliesst den letzten offenen Vertragsblock vor `S9` ab.
  - Danach ist die Vorbereitungsphase beendet:
    - Produktvertrag
    - Datenmodell
    - API-/RPC-Vertrag
    - TAB-Editor-Vertrag
    - Daily-UX-Vertrag
    - Bestands-/Incident-Logik
    - Assistant/Voice/Fast-Path
  - `S9` ist damit nicht mehr ein weiterer Theorieblock, sondern die explizite Umsetzung.

- Check-Ergebnis:
  - `S8` ist als abgeschlossener Roadmap-Block commit-wuerdig.
  - Nach diesem Punkt beginnt der echte Umsetzungsmodus in `S9`.

### S9 - Umsetzung des Multi-Dose-Umbaus
- S9-Prinzip:
  - `S9` ist kein weiterer Vertragsblock.
  - Ab hier wird die Roadmap real im Repo umgesetzt.
  - Jeder `S9.x`-Block endet deshalb mit:
    - Code-/Dead-Code-Pruefung
    - Doku-Nachzug
    - Commit-Empfehlung

- S9.1 SQL-/Schema-Umsetzung
  - S9.1.1 Bestehendes `sql/12_Medication.sql` auf das neue Zielmodell umbauen:
    - Schedule-Slot-Tabelle anlegen
    - Slot-Event-Tabelle anlegen
    - bestehende Medication-Stammdatenstruktur auf den neuen Vertrag ausrichten
  - S9.1.2 Reset-/Neustart-Regel technisch umsetzen:
    - alter Medication-Bestand darf kontrolliert verworfen werden
    - keine produktive Dual-Read-Phase
    - keine Legacy-Backfill-Logik im Live-Pfad
  - S9.1.3 Constraints, Unique-Regeln und FK-/Konsistenzlogik fuer Slots und Events implementieren
  - S9.1.4 `stock_log`-Semantik auf `slot_confirm` / `slot_undo` / `stock_adjust` / `stock_set` umstellen
  - S9.1.5 SQL-Smokes:
    - `1x`, `2x`, `3x`, `4x`
    - Confirm/Undo
    - Reset-Neustart
  - S9.1.6 Code-/Schema-Pruefung:
    - SQL auf tote Legacy-Aeste, ungenutzte Felder und Reset-Drift pruefen
  - S9.1.7 Doku-Nachzug:
    - Medication-Spec / SQL-nahe Roadmap-Hinweise aktualisieren, wenn die Schemastruktur final steht
  - S9.1.8 Commit-Empfehlung:
    - festhalten, ob SQL-/Schema-Arbeit schon einen sauberen Commit bildet

- S9.2 RPC-Umsetzung
  - S9.2.1 Neues Tages-Read-Model serverseitig implementieren
  - S9.2.2 Slot-basierte Write-RPCs implementieren:
    - confirm slot
    - undo slot
    - upsert medication
    - upsert schedule
    - set active
    - delete
    - adjust/set stock
    - ack low stock
  - S9.2.3 Idempotenz und Atomaritaet im echten Write-Pfad absichern
  - S9.2.4 RPC-Smokes gegen echte DB-Zustaende ausfuehren
  - S9.2.5 Code-/Contract-Pruefung:
    - RPC-Signaturen, Rueckgaben, tote Helper und Altvertrag-Reste pruefen
  - S9.2.6 Doku-Nachzug:
    - Medication-Overview und ggf. QA-Hinweise fuer den neuen RPC-Vertrag nachziehen
  - S9.2.7 Commit-Empfehlung:
    - festhalten, ob RPC-Stand stabil genug fuer einen eigenen Commit ist

- S9.3 Medication-Client umsetzen
  - S9.3.1 `app/modules/intake-stack/medication/index.js` auf neues Read-Model umbauen
  - S9.3.2 Neue Slot-Helper einfuehren:
    - `confirmMedicationSlot(...)`
    - `undoMedicationSlot(...)`
  - S9.3.3 Alte Tages-Boolean-Mappings und Alt-Helper kontrolliert entfernen oder eng uebergangsweise absichern
  - S9.3.4 `medication:changed`-Payload auf den neuen Contract ausrichten
  - S9.3.5 Code-/Dead-Code-Pruefung:
    - alte Flat-Mappings, tote Medication-Helper und nicht mehr benoetigte Felder entfernen
  - S9.3.6 Doku-Nachzug:
    - Medication-Overview aktualisieren, wenn der Client wirklich auf neuem Contract laeuft
  - S9.3.7 Commit-Empfehlung:
    - festhalten, ob Client-Umbau als sauberer Zwischenstand commit-wuerdig ist

- S9.4 TAB-Editor wirklich bauen
  - S9.4.1 Formular in `app/modules/intake-stack/medication/index.js`, `index.html` und `app/styles/hub.css` fuer Frequenz, Slots, Start/Ende und `mit Mahlzeit` implementieren
  - S9.4.2 Presets `1x/2x/3x/4x/custom` mit deterministischer Slot-Erzeugung bauen
  - S9.4.3 Slot-Validierung und stabile `sort_order` im UI umsetzen
  - S9.4.4 Kartenliste auf lesbare Plan-Zusammenfassung umbauen
  - S9.4.5 Saves gegen neue Medication-/Schedule-RPCs verdrahten
  - S9.4.6 Code-/UI-Pruefung:
    - verwaiste Formpfade, tote Buttons, Altfelder und regressiven CSS-/HTML-Ballast pruefen
  - S9.4.7 Doku-Nachzug:
    - Medication-Overview und QA-Hinweise fuer den neuen TAB-Editor aktualisieren
  - S9.4.8 Commit-Empfehlung:
    - festhalten, ob der TAB-Umbau als eigener Implementierungscommit taugt

- S9.5 IN-Daily-Flow wirklich bauen
  - S9.5.1 Medication-Cards in `app/modules/intake-stack/intake/index.js` und `app/styles/hub.css` auf `taken_count / total_count` umstellen
  - S9.5.2 `1x taeglich`-Fast-Path rendern, ohne Pflicht-Slotliste
  - S9.5.3 `>1x taeglich` mit ruhiger Slot-Liste und direktem Confirm/Undo rendern
  - S9.5.4 Batch-Flow auf `alle offenen Einnahmen bestaetigen` neu schneiden
  - S9.5.5 Alte Daily-Boolean-Selektionslogik aktiv abbauen
  - S9.5.6 Code-/UX-Pruefung:
    - tote Daily-Boolean-Branches, Footer-Drift und Regressionsrisiken fuer `1x` pruefen
  - S9.5.7 Doku-Nachzug:
    - Intake-Overview, Medication-Overview und QA-Smokes fuer den Daily-Flow aktualisieren
  - S9.5.8 Commit-Empfehlung:
    - festhalten, ob der IN-Umbau als eigener Commit-Schnitt sinnvoll ist

- S9.6 Low-Stock, Runout und Incidents wirklich bauen
  - S9.6.1 Verbrauch auf Basis des aktiven Tagesplans serverseitig und clientseitig konsistent machen
  - S9.6.2 `days_left`, `runout_day` und `low_stock` auf progress-aware Logik umstellen
  - S9.6.3 Low-Stock-Ack auf dem neuen Medication-Level-Vertrag halten
  - S9.6.4 Incident-/Push-Logik auf offenen Tages-Slots mit genau einem aggregierten Tages-Incident umbauen
  - S9.6.5 Spam- und Re-Trigger-Smokes ausfuehren
  - S9.6.6 Code-/Logic-Pruefung:
    - Bestandsdrift, falsche Trigger, tote Incident-Branches und Altannahmen auf `!med.taken` pruefen
  - S9.6.7 Doku-Nachzug:
    - Medication-, Intake- und Push-Overview sowie QA-Smokes aktualisieren
  - S9.6.8 Commit-Empfehlung:
    - festhalten, ob Low-Stock-/Incident-Umbau als eigener Commit tragfaehig ist

- S9.7 Assistant, Hub und Voice wirklich bauen
  - S9.7.1 `medication_confirm_all` auf `alle aktuell offenen Einnahmen fuer heute` umstellen
  - S9.7.2 Hub-/Text-Fast-Path auf den neuen Medication-Contract umbauen
  - S9.7.3 Voice-Flow und Low-Stock-Follow-up gegen das neue Read-Model absichern
  - S9.7.4 Alte implizite Teilmengenlogik aktiv entfernen
  - S9.7.5 Code-/Intent-Pruefung:
    - tote Validator-Aeste, Altcopy, Tages-Boolean-Reste und Voice-Drift pruefen
  - S9.7.6 Doku-Nachzug:
    - Intent Engine Overview, Medication-/Push-Doku, Voice-Semantik und QA-Smokes aktualisieren
  - S9.7.7 Commit-Empfehlung:
    - festhalten, ob Assistant-/Voice-Umbau als eigener Commit-Schnitt sinnvoll ist

- S9.8 Read-only-Kontexte und Restpfade nachziehen
  - S9.8.1 Profile-Snapshot auf lesbare neue Plan-/Medication-Zusammenfassung anpassen
  - S9.8.2 verbleibende Medication-Read-Pfade im Repo auf Altannahmen pruefen und umstellen
  - S9.8.3 tote Felder, Helper und Branches des alten Tages-Boolean-Modells entfernen
  - S9.8.4 Code-/Dead-Code-Pruefung:
    - Repo-weit auf verwaiste Medication-Altpfade, Felder und UI-Reste scannen
  - S9.8.5 Doku-Nachzug:
    - Profile-Overview und angrenzende Medication-Doku final nachziehen
  - S9.8.6 Commit-Empfehlung:
    - festhalten, ob dieser Cleanup-/Read-only-Block separat commit-wuerdig ist

- S9.9 Finale QA, Doku und Endabnahme
  - S9.9.1 `docs/modules/Medication Module Overview.md` aktualisieren
  - S9.9.2 `docs/modules/Intake Module Overview.md` aktualisieren
  - S9.9.3 `docs/modules/Push Module Overview.md` und relevante Assistant-/Intent-Doku aktualisieren
  - S9.9.4 `docs/QA_CHECKS.md` auf Multi-Dose-Smokes erweitern
  - S9.9.5 finale Repo-Smokes und Regression gegen `1x`, `2x`, `3x`, `4x`, temporaere Meds, Low-Stock, Voice und Push fahren
  - S9.9.6 Code-/Repo-Pruefung:
    - gesamtes Repo auf offene Drift zwischen Roadmap-Vertrag und Umsetzung, verbliebenen Dead Code und Altvertrag-Reste pruefen
  - S9.9.7 Doku-Nachzug:
    - alle betroffenen Modul-Overviews, QA-Doku und ggf. CHANGELOG final nachziehen
  - S9.9.8 Commit-/Release-Empfehlung:
    - festhalten, ob der Umbau commit-, merge- und produktiv einsatzfaehig ist
- Output: der in `S1` bis `S8` definierte Multi-Dose-Umbau ist real im Repo umgesetzt.
- Exit-Kriterium: MIDAS bildet Mehrfach-Einnahmen produktiv ab, ohne den `1x taeglich`-Basiscase zu verschlechtern.

#### S9 Zwischenstand (nachgezogen)
- `S9.1 SQL-/Schema-Umsetzung`:
  - technisch umgesetzt in `sql/12_Medication.sql`
  - auf Supabase ausgefuehrt
  - enthalten:
    - `health_medication_schedule_slots`
    - `health_medication_slot_events`
    - `with_meal` in `health_medications`
    - `slot_id` / `day` im `health_medication_stock_log`
    - `med_reset_all_data_v2()`
    - FK-/Constraint-Absicherung fuer `(slot_id, med_id)`
    - finaler Cleanup:
      - `health_medication_doses` entfernt
      - `health_medications.dose_per_day` entfernt
      - alte `v1`-Medication-RPCs entfernt
      - `public._med_today()` mit fixem `search_path` abgesichert

- `S9.2 RPC-Umsetzung`:
  - technisch umgesetzt in `sql/12_Medication.sql`
  - enthalten:
    - `med_list_v2`
    - `med_upsert_v2`
    - `med_upsert_schedule_v2`
    - `med_confirm_slot_v2`
    - `med_undo_slot_v2`
    - `med_adjust_stock_v2`
    - `med_set_stock_v2`
    - `med_ack_low_stock_v2`
    - `med_set_active_v2`
    - `med_delete_v2`
  - der alte `v1`-Pfad wurde im finalen Cleanup aus dem aktiven SQL-Contract entfernt

- `S9.3 Medication-Client`:
  - technisch umgesetzt in `app/modules/intake-stack/medication/index.js`
  - aktueller Stand:
    - `loadMedicationForDay(...)` liest `med_list_v2`
    - Mapping fuer `slots`, `taken_count`, `total_count`, `state`, `with_meal` ist eingebaut
    - Slot-Helper `confirmMedicationSlot(...)` und `undoMedicationSlot(...)` existieren
    - `upsertMedication(...)` schreibt bereits gegen `med_upsert_v2` plus `med_upsert_schedule_v2`
    - Stock-/Ack-/Active-/Delete-Pfade sprechen `v2`
  - Reststand:
    - produktive Medication-Reads/Writes laufen auf dem neuen Contract
    - keine direkten `v1`-Medication-RPC-Calls mehr im Laufzeitcode gefunden
    - kein produktiver `dose_per_day`-Fallback mehr im Medication-Client

- `S9.4 TAB-Editor`:
  - technisch umgesetzt
  - aktueller Stand:
    - `Mit Mahlzeit`-Checkbox in `index.html`
    - Frequenz-Presets und Slot-Liste sind im Formular sichtbar
    - Speichern laeuft gegen neuen Medication-/Schedule-Write-Pfad
    - Kartenliste zeigt bereits lesbare Plan-Zusammenfassung statt nur `Dose/Tag`
  - Reststand:
    - aktueller Save-/Edit-Flow wurde gegen den realen Produktstand erfolgreich geprueft

- `S9.5 IN-Daily-Flow`:
  - technisch umgesetzt
  - aktueller Stand:
    - Fortschritt `taken_count / total_count` wird gerendert
    - `>1x`-Medikationen zeigen Slot-Liste mit direkten Slot-Aktionen
    - Footer spricht jetzt in offenen Einnahmen statt nur Tages-Boolean-Auswahl
    - Single-Slot-Status-Toggle nutzt Slot-IDs
    - direkte Downstream-Pfade in Hub, Voice und Incidents lesen bereits `state !== done`
  - Abnahme:
    - manuelle Smokes fuer den aktuellen Daily-Flow wurden erfolgreich durchgefuehrt

- `S9.6` bis `S9.9`:
  - formal abgeschlossen
  - aktueller Stand:
    - Low-Stock / Runout / Incidents sind fachlich auf dem neuen Read-Model angekommen
    - Hub / Voice / Assistant nutzen den engen Slot-Sammelpfad
    - Profile / Read-only-Kontexte und Modul-Doku sind weitgehend nachgezogen
    - finale QA / Repo-Cleanup / Endabnahme sind nachgezogen

- Zusatzfortschritt nach letztem Sync:
  - `S9.7` ist teilweise angelaufen:
    - Hub-/Text-Fast-Path und Voice `medication_confirm_all` nutzen jetzt den expliziten Slot-Sammelpfad `confirmAllOpenMedicationSlots(...)`
  - `S9.8` ist teilweise angelaufen:
    - Profile-Snapshot liest jetzt lesbare Plan-Zusammenfassungen aus `slots[]` statt nur aggregiert `x/Tag`
  - `S9.6` ist ebenfalls angelaufen:
    - Incident-Logik liest `state !== done`
    - Medication-Incident ist jetzt als spaeter aggregierter Tages-Incident modelliert statt als frueher `medication_morning`-Push
    - QA-Hinweise fuer Multi-Dose-/Incident-Smokes wurden bereits erweitert
  - `S9.9` ist ebenfalls angelaufen:
    - `docs/modules/Medication Module Overview.md` und `docs/modules/Intake Module Overview.md` wurden auf den neuen Slot-/Progress-Vertrag nachgezogen
    - `docs/modules/Push Module Overview.md` und `docs/modules/Profile Module Overview.md` wurden ebenfalls auf den neuen Medication-/Incident-Stand nachgezogen
  - SQL-Paritaet:
    - der lokal erweiterte `sql/12_Medication.sql`-Stand inklusive `start_date` und `end_date` in `med_list_v2.slots[]` wurde auch auf Supabase nachgezogen
    - der finale Legacy-Cleanup wurde ebenfalls auf den aktiven SQL-Contract angewendet
  - Validierungsstand:
    - keine direkten `v1`-Medication-RPC-Calls mehr im Laufzeitcode gefunden
    - Syntaxchecks fuer Medication-, Intake-, Hub-, Voice-, Incidents-, Profile- und Service-Worker-Dateien sind gruen
    - sichtbare Profil-Placeholder-/Encoding-Kanten im geaenderten Stand wurden bereinigt
    - manuelle Smokechecks wurden erfolgreich durchgefuehrt; der aktuelle Flow scheint stabil zu funktionieren
    - verbleibendes `health_medication_stock_log` ist jetzt ein bewusster optionaler Audit-/Diagnosepfad, kein Legacy-Zwang

## Smokechecks / Regression (Definition)
- Nach Reset und Neuerfassung bleibt ein `1x taeglich`-Medikament in `1-2 Taps` bestaetigbar.
- Der Medication-Neustart erzeugt keinen Mischzustand aus alten Tages-Boolean-Daten und neuem Slot-Modell.
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
- Der Medication-Reset und die manuelle Neuerfassung erzeugen keinen stillen Mischzustand mit Altsemantik.
- Dokumentation und QA-Checks sind vollstaendig aktualisiert.

## Risiken
- Zu fruehe UI-Komplexitaet kann den heute guten `1x taeglich`-Flow verschlechtern.
- Halbherziger Reset oder vermischte Alt-/Neudaten koennen Bestands- oder Runout-Berechnungen verfaelschen.
- Zeitlogik-Creep kann MIDAS unnoetig in Richtung klinischer Planner treiben.
- Push kann ohne harte Guardrails in Mehrfach-Einnahme-Spam kippen.
- Voice/Fast-Paths koennen still regressieren, wenn sie weiter auf Tages-Boolean basieren.
- Zu breite Slot-Flexibilitaet kann MIDAS unnoetig in Richtung klinischer Planungssoftware ziehen.
