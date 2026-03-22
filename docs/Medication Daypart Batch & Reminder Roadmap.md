# Medication Daypart Batch & Reminder Roadmap

## Ziel (klar und pruefbar)
Der bestehende Medication-Mehrfach-Einnahme-Flow soll von einem globalen `alle offenen Einnahmen bestaetigen`-Verhalten auf eine saubere Abschnittslogik umgestellt werden, damit Batch-Aktionen, Push und Incident-Logik dieselbe fachliche Semantik teilen.

Pruefbare Zieldefinition:
- Medikamente koennen weiterhin `1..n` Einnahme-Slots pro Tag haben.
- Sammelbestaetigungen bestaetigen nie mehr den gesamten Tag, sondern nur einen klaren Tagesabschnitt.
- Die App kennt einen gemeinsamen Satz fachlicher Tagesabschnitte:
  - `morning`
  - `noon`
  - `evening`
  - `night`
- Die UI zeigt nur relevante Abschnitts-CTAs wie `Alle Morgen-Medikamente genommen`, wenn fuer diesen Abschnitt offene Slots existieren.
- Multi-Dose-Medikamente bleiben weiterhin einzeln pro Slot bestaetigbar und rueckgaengig machbar.
- Push-/Reminder-, Incident- und Voice-Pfade nutzen dieselbe Abschnittslogik wie der IN-Tab.
- Zeitfenster steuern Sichtbarkeit, Priorisierung und Reminder-Timing, sind aber in V1 keine harte Einnahmesperre.
- Bestehende Slot-Labels wie `Morgen`, `Mittag`, `Abend`, `Nacht` bleiben fuer den Nutzer lesbar, auch wenn intern auf strukturierte Typen umgestellt wird.

## Scope
- Fachlicher Umbau von globaler Batch-Bestaetigung auf abschnittsbasierte Batch-Bestaetigung.
- Vereinheitlichung der Semantik fuer IN-Tab, Push, Incidents, Voice und Reminder.
- Einfuehrung oder Absicherung strukturierter Slot-Typen fuer Tagesabschnitte.
- Anpassung der Reminder-/Push-Konfiguration auf dieselben Zeitfenster.
- Doku-, QA- und Contract-Sync fuer das neue Abschnittsmodell.

## Not in Scope
- Klinische Medikationsplanung mit individuellen Uhrzeiten pro Medikament.
- Harte Sperrfenster, die Einnahmen ausserhalb des Zeitfensters technisch verbieten.
- Komplexe Wochenplaene, Feiertagsregeln oder Schichtarbeitslogik.
- Frei benennbare Batch-Gruppen jenseits von `Morgen`, `Mittag`, `Abend`, `Nacht`.
- Vollstaendige Personalisierung der Zeitfenster in V1.
- Generische Reminder-Eskalationsketten oder Notification-Spam.

## Relevante Referenzen (Code)
- `app/modules/intake-stack/medication/index.js`
- `app/modules/intake-stack/intake/index.js`
- `app/modules/incidents/index.js`
- `app/modules/assistant-stack/intent/rules/medication.js`
- `app/modules/assistant-stack/voice/index.js`
- `service-worker.js`
- `index.html`
- `sql/12_Medication.sql`

## Relevante Referenzen (Doku / Config)
- `docs/archive/Medication Multi-Dose Implementation Roadmap (DONE).md`
- `docs/archive/Medication Management Module Spec.md`
- `docs/modules/Medication Module Overview.md`
- `docs/modules/Intake Module Overview.md`
- `docs/modules/Push Module Overview.md`
- `docs/modules/Intent Engine Module Overview.md`
- `docs/QA_CHECKS.md`
- `docs/M.I.D.A.S._Implementation_Spec_v1.2.yaml`
- `CHANGELOG.md`

## Guardrails
- Eine Batch-Aktion darf nie implizit den gesamten offenen Medication-Tag bestaetigen.
- Abschnittslogik muss in UI, Push, Incidents und Voice denselben Vertrag haben.
- Zeitfenster sind in V1 Produktlogik fuer Sichtbarkeit und Priorisierung, nicht fuer harte Verhinderung.
- `1x taeglich`-Medikamente duerfen durch den Umbau nicht umstaendlicher werden.
- Freitext-Labels duerfen die interne Semantik nicht alleine tragen; fachliche Entscheidungen duerfen nicht an Schreibvarianten haengen.
- Bestehende Slot-Einzelbestaetigungen muessen als sicherer Fallback immer erhalten bleiben.
- Reminder duerfen nicht fuer bereits erledigte oder fachlich unpassende Abschnitte feuern.

## Architektur-Constraints
- Slot-Typ und Slot-Label muessen klar getrennt sein, falls strukturierte Typen eingefuehrt werden.
- Read-Model fuer den IN-Tab muss weiterhin kompakt und cachebar bleiben.
- Abschnitts-CTAs muessen aus denselben Tagesdaten ableitbar sein wie Slot-Buttons und Incidents.
- Zeitfenster sollen zentral definiert werden; keine voneinander driftenden Uhrzeiten in UI, Push und Incident-Logik.
- Rueckwaertskompatibilitaet fuer bestehende Medication-Records ist Pflicht, auch wenn intern neue Abschnittstypen eingefuehrt werden.

## Tool Permissions
Allowed:
- Bestehende Medication-/Intake-/Push-/Voice-Dateien lesen und innerhalb Scope aendern.
- SQL, Read-/Write-Contracts, Reminder-Config und zugehoerige Doku anpassen.
- Lokale Smokechecks, Syntaxchecks und gezielte Repo-Scans ausfuehren.

Forbidden:
- Unverwandte Module refactoren.
- Neue Dependencies oder fremde Scheduling-Frameworks einfuehren.
- Reminder-Logik pro Modul separat neu erfinden, statt eine gemeinsame Source of Truth zu bauen.

## Execution Mode
- Sequenziell arbeiten (`S1` bis `S8`).
- Keine Umsetzung von Reminder- oder Voice-Pfaden, bevor der fachliche Abschnittsvertrag klar ist.
- Vor jedem Write-Pfad erst den Read-/State-Contract des Abschnittsmodells fixieren.
- Nach jedem Schritt Statusmatrix aktualisieren.
- Nach jedem Schritt mindestens ein Check: Contract-Review, Repo-Scan, Syntaxcheck oder Smokecheck.
- Jeder Hauptschritt endet mit denselben operativen Pflichtpunkten:
  - Schritt-Abnahme
  - Doku-Sync
  - Commit-Empfehlung

## Vorgeschlagene Standard-Zeitfenster (V1)
- `morning`: ab `06:00`
- `noon`: ab `11:00`
- `evening`: ab `17:00`
- `night`: ab `21:00`

Diese Zeitfenster sind zunaechst Produktdefaults fuer Sichtbarkeit, Priorisierung und Push-Timing. Ob daraus spaeter echte Fenster (`06:00-10:59` etc.) werden, ist in dieser Roadmap explizit zu klaeren.

## Statusmatrix
| ID | Schritt | Status | Ergebnis/Notiz |
|---|---|---|---|
| S1 | Ist-Analyse Batch-, Slot-, Push- und Incident-Vertrag | DONE | Globale All-Confirm-Pfade, Label-Abhaengigkeiten, Reminder-/Incident-Zeitlogik und Doku-Drift sind mit Dateireferenzen gemappt; die aktuelle Source of Truth fuer Reminder liegt im Code, nicht in der YAML. |
| S2 | Produktvertrag fuer `morning/noon/evening/night` finalisieren | DONE | Begriffe, CTA-Sichtbarkeit, Standard-Zeitfenster, Batch-Grenzen und Regeln fuer `1x..4x taeglich` sind fachlich festgezogen; Zeitfenster sind V1-seitig Priorisierungs- und Reminder-Logik, keine harte Sperre. |
| S3 | Datenmodell- und Slot-Typ-Strategie festlegen | DONE | Strukturierter `slot_type` wird als Pflicht fuer Abschnittslogik eingefuehrt; `med_list_v2` bleibt Read-Model und wird um `slot_type` erweitert. Altbestand wird zuerst ueber Label-Aliase, danach ueber Preset-/Sort-Order-Regeln gemappt. |
| S4 | IN-Tab CTA- und Batch-Verhalten auf Abschnittslogik umbauen | DONE | Der IN-Tab bekommt einen abschnittsbezogenen CTA-Stack statt Tages-Batch: eine priorisierte Hauptaktion fuer den aktuellen offenen Abschnitt plus optionale Sekundaer-CTAs fuer weitere offene Abschnitte; Einzel-Slot-Buttons bleiben immer erhalten. |
| S5 | Push-/Reminder-Config und Incident-Logik angleichen | DONE | Abschnittszeiten werden als gemeinsame Incident-/Reminder-Source of Truth festgezogen; Medication wechselt fachlich von einem aggregierten Tages-Incident zu abschnittsbezogenen Incidents fuer `morning/noon/evening/night`, lokal wie remote. |
| S6 | Voice-/Assistant-Pfade auf Abschnittssemantik absichern | DONE | Der alte globale Intent `medication_confirm_all` wird fachlich durch einen abschnittsbezogenen Confirm-Vertrag ersetzt; direkte Voice-/Text-Writes sind nur noch mit explizitem Abschnitt erlaubt, generische Medikationssaetze werden nicht mehr blind lokal ausgefuehrt. |
| S7 | Migration, Rueckwaertskompatibilitaet und QA definieren | DONE | Altbestand, Label-Mapping, tolerierte Edge-Cases und die verbindliche Smoke-Matrix fuer Abschnitts-CTAs, Push, Voice und Incident-Logik sind festgezogen; offene Migrationen laufen deterministisch ueber `slot_type`-Backfill statt ueber manuelle Neuerfassung. |
| S8 | Umsetzung des Abschnittsmodells + Endvalidierung | DONE | Der repo-lokale Abschnittsumbau ist geschlossen: SQL-/Read-Contract, IN-CTAs, lokale Incident-/Push-Pfade, Voice-/Text-Vertrag, Doku/QA und statische Abnahme sind synchron. Der externe Remote-Scheduler-/Edge-Function-Vertrag bleibt bewusst ausserhalb dieses Repos. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Wiederkehrende Abschluss-Substeps pro Hauptschritt
Diese Abschluss-Substeps gelten fuer jeden Hauptschritt `S1` bis `S8` und sollen jeweils als letzte Substeps mitgefuehrt werden.

- `letzter fachlicher Substep + 1: Schritt-Abnahme`
  - Umsetzung gegen den Ziel-Contract des Schritts pruefen
  - betroffene Dateien auf regressiven Ballast und potenziellen Dead Code pruefen
  - gezielte Syntax-/Smoke-/Contract-Checks fuer den Schritt ausfuehren
- `danach: Doku-Sync`
  - betroffene Modul-Overviews sofort aktualisieren, wenn sich Verhalten, Contracts oder Guardrails geaendert haben
  - bei Bedarf auch `docs/QA_CHECKS.md`, `CHANGELOG.md`, YAML/Reminder-Doku und angrenzende Specs nachziehen
- `danach: Commit-Empfehlung`
  - explizit festhalten, ob nach dem Schritt ein Commit sinnvoll ist
  - wenn `kein Commit`, kurz begruenden, was noch logisch zusammengehoert

## Schritte + Subschritte

### S1 - Ist-Analyse Batch-, Slot-, Push- und Incident-Vertrag
- S1.1 Alle Stellen mappen, die heute global `alle offenen Einnahmen` bestaetigen oder so denken.
- S1.2 Intake-UI, Medication-Client und Voice auf implizite Tages- statt Abschnittssemantik pruefen.
- S1.3 Push-/Reminder-Konfiguration und Incident-Logik auf aktuelle Zeitfenster und Trigger untersuchen.
- S1.4 Bestehende Slot-Labels und ihre semantische Verwendbarkeit fuer `morning/noon/evening/night` aufnehmen.
- S1.5 Schritt-Abnahme:
  - Repo-Scan auf globale All-Confirm-Annahmen, Label-Abhaengigkeiten und Reminder-Drift
  - Ergebnis mit Dateireferenzen und Risikostellen festhalten
- S1.6 Doku-Sync:
  - falls bereits veraltete Modul-Overviews oder Reminder-Beschreibungen sichtbar werden, direkt markieren oder korrigieren
- S1.7 Commit-Empfehlung:
  - festhalten, ob reine Analyse-/Doku-Korrekturen schon commit-wuerdig sind oder mit S2 gebuendelt werden
- Output: belastbare Liste aller Stellen, die von Tages- auf Abschnittslogik umgestellt werden muessen.
- Exit-Kriterium: kein unbekannter Batch-/Reminder-/Incident-Pfad mehr offen.

#### S1 Ergebnisprotokoll (abgeschlossen)

##### S1.1 Globale All-Confirm-Annahmen
- `app/modules/intake-stack/medication/index.js`
  - `confirmMedication(medId, ...)` bestaetigt weiterhin alle offenen Slots eines Medikaments fuer den Tag.
  - `confirmAllOpenMedicationSlots(dayIso, ...)` bestaetigt weiterhin alle offenen Slots aller aktiven Medikamente fuer heute.
- `app/modules/hub/index.js`
  - der lokale Text-/Hub-Fast-Path fuer `medication_confirm_all` laedt den Tages-Snapshot und dispatcht danach `confirmAllOpenMedicationSlots(...)`.
- `app/modules/assistant-stack/voice/index.js`
  - der Voice-Fast-Path `runVoiceMedicationConfirmAll()` arbeitet ebenfalls auf `confirmAllOpenMedicationSlots(...)`.
- `app/modules/assistant-stack/intent/rules/medication.js`
  - `medication_confirm_all` ist fachlich weiter auf `scope: all_open_for_day` fest verdrahtet.
- `app/modules/assistant-stack/intent/validators.js`
  - der Validator akzeptiert fuer Medikation nur `scope === all_open_for_day`.

Bewertung:
- Der globale Tages-Sammelpfad ist nicht verschwunden, sondern nur im IN-Tab bereits lokal eingeengt.
- Hub, Voice und Intent-Vertrag denken weiterhin in `alle offenen Einnahmen fuer heute`, nicht in Tagesabschnitten.

##### S1.2 Intake-UI und Medication-Client: implizite Tages- statt Abschnittssemantik
- `app/modules/intake-stack/intake/index.js`
  - der Batch-Footer ist inzwischen korrekt auf batch-confirmable Single-Slot-Medikamente begrenzt.
  - das sichtbare Wording bleibt aber tagesweit: `Offene Einnahmen bestaetigen (...)`.
  - es gibt noch keine CTA-Ebene fuer `Morgen`, `Mittag`, `Abend`, `Nacht`.
  - Multi-Slot-Medikamente werden ausschliesslich ueber einzelne Slot-Buttons gerendert; eine Gruppenbildung nach Tagesabschnitt existiert nicht.
- `app/modules/intake-stack/medication/index.js`
  - das Read-Model liefert `slots[]`, `taken_count`, `total_count`, `state`, aber keine explizite Abschnittssemantik wie `slot_type`.
  - Slot-Entscheidungen sind damit derzeit label- und count-basiert.
- `app/modules/hub/index.js`
  - `getAssistantTimeSlot()` kennt nur `morning`, `noon`, `evening`; ein `night`-Zustand fehlt bisher komplett.
- `app/modules/intake-stack/intake/index.js`
  - es gibt einen `scheduleNoonSwitch()`, aber keine entsprechende section-aware Umschaltung fuer `evening` oder `night`.

Bewertung:
- Die UI ist heute operativ multi-dose-faehig, aber nicht abschnittsfaehig.
- Der bestehende Tagesstatus ist fuer `0/n`, `1/n`, `2/n` gut genug, aber fuer `alle Morgen-Medikamente` noch nicht fein genug.

##### S1.3 Push-/Reminder-Konfiguration und Incident-Logik
- `app/modules/incidents/index.js`
  - Medication arbeitet aktuell als aggregierter Tages-Incident.
  - `MED_PUSH_HOUR = 19` ist ein einzelner harter Cutoff fuer `medication_daily_open`.
  - die Incident-Engine unterscheidet nicht zwischen offenen Morgen-, Mittag-, Abend- oder Nacht-Slots.
- `service-worker.js`
  - Incident-Erkennung kennt weiterhin `medication_daily_open` und noch den alten Legacy-Typ `medication_morning`.
  - daraus ist ersichtlich, dass der Notification-Surface historisch bereits Teilzeit-Semantik hatte, aktuell aber aggregiert arbeitet.
- `docs/M.I.D.A.S._Implementation_Spec_v1.2.yaml`
  - enthaelt keine Medication-/Push-/Reminder-Zeitfenster.
  - die Datei ist eine Design-/Brand-Spec, nicht die operative Reminder-Source-of-Truth.

Bewertung:
- Die aktuelle Reminder-/Incident-Source-of-Truth liegt im Code, primaer in `app/modules/incidents/index.js`, nicht in der YAML.
- Fuer den geplanten Umbau muessen mindestens Incident-Engine, ggf. Remote-Push-Setup und jede lokale Zeitfenster-Hilfe auf denselben Abschnittsvertrag gezogen werden.

##### S1.4 Bestehende Slot-Labels und ihre semantische Verwendbarkeit
- `app/modules/intake-stack/medication/index.js`
  - `DEFAULT_SLOT_LABELS = ['Morgen', 'Mittag', 'Abend', 'Nacht']`
  - `buildScheduleSlotsFromFrequency(...)` erzeugt Presets aus genau diesen Labels.
  - `normalizeSlot(...)` uebernimmt aber nur `label`, nicht `slot_type`.
- `sql/12_Medication.sql`
  - `health_medication_schedule_slots` speichert aktuell `label`, `sort_order`, `qty_per_slot`, `start_date`, `end_date`, aber keinen strukturierten Abschnittstyp.
  - `med_list_v2` gibt `slots[]` ebenfalls nur mit `label`, `sort_order`, `qty`, `is_taken`, `day`, `start_date`, `end_date` zurueck.
- `app/modules/profile/index.js`
  - Profil-Zusammenfassungen lesen die Plan-Semantik heute aus `slots[]` und damit indirekt aus den Labels.

Bewertung:
- `Morgen/Mittag/Abend/Nacht` sind bereits starke UI-Konventionen.
- Fuer produktive Abschnittslogik sind sie aber noch nicht hart genug, weil freie Labels weiterhin moeglich sind und SQL/Read-Model keinen strukturierten `slot_type` tragen.

##### S1.5 Schritt-Abnahme: gemappte Risikostellen
- Fachlicher Hauptbruch:
  - `medication_confirm_all` bedeutet aktuell weiterhin `alle offenen Einnahmen fuer heute`, nicht `alle offenen Einnahmen fuer einen Abschnitt`.
- Datenmodell-Risiko:
  - Abschnittslogik laesst sich ohne strukturierten `slot_type` nur ueber Labels inferieren; das ist anfaellig fuer Schreibvarianten und freie Benennung.
- Reminder-Risiko:
  - Medication-Incidents haben heute genau einen spaeten Tages-Cutoff (`19:00`), aber keine gestaffelten Abschnittsfenster.
- Voice-/Hub-Risiko:
  - Text und Voice wuerden beim Umbau sofort inkonsistent werden, wenn nur der IN-Tab neue Abschnitts-CTAs bekommt.
- Zeitfenster-Risiko:
  - `hub/index.js` kennt bereits `morning/noon/evening`, aber nicht `night`; die App hat also schon fragmentierte Teilzeitlogik.

Schritt-Abnahme:
- Der Repo-Scan deckt die heute relevanten Batch-, Slot-, Push-, Incident- und Assistant-Pfade vollstaendig ab.
- Es bleibt nach aktuellem Stand kein unbekannter produktiver Medication-Write-/Reminder-Pfad fuer dieses Thema offen.

##### S1.6 Doku-Sync
- `docs/modules/Intake Module Overview.md`
  - Batch-Footer-Wording auf den realen Stand korrigieren: aktuell nur noch fuer batch-confirmable Single-Slot-Medikamente, nicht fuer beliebige offene Multi-Slot-Medikation.
- `docs/modules/Medication Module Overview.md`
  - IN-Trigger und Voice-/Intent-Semantik auf den realen Ist-Stand praezisieren:
    - IN ist bereits enger als frueher.
    - Hub/Voice/Intent sind noch global tagesbezogen.

##### S1.7 Commit-Empfehlung
- Noch kein eigener Commit nur fuer `S1` empfohlen.
- Grund:
  - die Analyse ist wertvoll, aber eng mit dem jetzt folgenden fachlichen Vertrag aus `S2` verknuepft.
  - sinnvoller ist ein gebuendelter Commit aus `S1 + S2`, sobald Abschnittsbegriffe, Zeitfenster und Slot-Typ-Strategie festgezogen sind.

### S2 - Produktvertrag fuer `morning/noon/evening/night` finalisieren
- S2.1 Fachbegriffe final festlegen: interne Typen vs. sichtbare Labels.
- S2.2 Sichtbarkeitslogik fuer Abschnitts-CTAs definieren.
- S2.3 Zeitfenster festziehen: nur Startzeiten oder echte Fenster.
- S2.4 Klarstellen, dass Zeitfenster V1-seitig UI-/Reminder-Logik sind und keine harte Einnahmesperre.
- S2.5 Regeln fuer `1x taeglich`, `2x taeglich`, `3x taeglich`, `4x taeglich` im neuen Modell formulieren.
- S2.6 Schritt-Abnahme:
  - Produktvertrag auf Widerspruchsfreiheit gegen bestehendes Slot-Modell pruefen
- S2.7 Doku-Sync:
  - Spezifikationsdokumente und Modul-Overviews bei veraenderter Semantik nachziehen
- S2.8 Commit-Empfehlung:
  - festhalten, ob der fachliche Vertrag separat commitbar ist
- Output: eindeutiger Produktvertrag fuer Abschnittslogik.
- Exit-Kriterium: keine offene Fachfrage mehr zu Begriffen, CTA-Sichtbarkeit oder Zeitfenstern.

#### S2 Ergebnisprotokoll (abgeschlossen)

##### S2.1 Fachbegriffe: interne Typen vs. sichtbare Labels
- Interne fachliche Typen fuer Medication-Abschnitte sind:
  - `morning`
  - `noon`
  - `evening`
  - `night`
- Sichtbare Default-Labels in der UI bleiben:
  - `Morgen`
  - `Mittag`
  - `Abend`
  - `Nacht`
- Produktregel:
  - Fachliche Entscheidungen laufen kuenftig auf dem internen Typ.
  - Labels sind Anzeige- und Editierwerte, aber nicht mehr alleinige Source of Truth fuer Reminder, Batch oder Incident.

Festlegung:
- `morning/noon/evening/night` sind der kanonische Produktvertrag.
- Deutsche Labels bleiben die Primaeroberflaeche fuer den Nutzer.

##### S2.2 Sichtbarkeitslogik fuer Abschnitts-CTAs
- Der globale CTA `Offene Einnahmen bestaetigen` wird fachlich ersetzt durch abschnittsbezogene CTAs.
- Zulaessige CTA-Typen:
  - `Alle Morgen-Medikamente genommen`
  - `Alle Mittag-Medikamente genommen`
  - `Alle Abend-Medikamente genommen`
  - `Alle Nacht-Medikamente genommen`
- Ein CTA wird nur gezeigt, wenn fuer den entsprechenden Abschnitt mindestens ein offener Slot existiert.
- Ein Abschnitts-CTA bestaetigt nur offene Slots dieses Abschnitts, nie eines anderen Abschnitts.
- Einzel-Slot-Buttons bleiben immer der sichere Fallback.

Festlegung:
- Abschnitts-CTAs sind additive Schnellaktionen, kein Ersatz fuer Einzel-Slots.
- Es gibt keine tagesweite Medication-Sammelbestaetigung mehr im Zielmodell.

##### S2.3 Zeitfenster: Startzeiten vs. echte Fenster
Fachlicher V1-Entscheid:
- Fuer die erste Ausbaustufe werden feste Standard-Startzeiten verwendet:
  - `morning`: `06:00`
  - `noon`: `11:00`
  - `evening`: `17:00`
  - `night`: `21:00`
- Diese Werte definieren zunaechst Priorisierung, CTA-Sichtbarkeit und Reminder-Timing.
- Ob spaeter echte Fenster wie `06:00-10:59` oder `11:00-15:59` modelliert werden, bleibt ein spaeterer Ausbau und ist fuer V1 nicht erforderlich.

Festlegung:
- V1 arbeitet mit Startzeiten als Produktdefaults.
- Keine komplexen Fensterdefinitionen als Voraussetzung fuer die erste Umsetzung.

##### S2.4 Keine harte Einnahmesperre
- Zeitfenster sind in V1 keine technische Sperre.
- Ein Nutzer darf einen offenen Morgenslot weiterhin auch spaeter am Tag einzeln bestaetigen.
- Ein Abschnitts-CTA darf nach seiner Startzeit sichtbar bzw. priorisiert sein, aber offene Slots anderer Abschnitte nicht unbedienbar machen.

Festlegung:
- Zeitfenster = Sichtbarkeit, Priorisierung, Reminder, Incident-Kontext.
- Zeitfenster != medizinische Deadline oder technischer Lock.

##### S2.5 Regeln fuer `1x`, `2x`, `3x`, `4x taeglich`
- `1x taeglich`
  - bekommt genau einen Abschnittstyp.
  - Default in V1: `morning`.
  - der schnelle `1x`-Flow bleibt erhalten.
- `2x taeglich`
  - Default-Preset: `morning`, `evening`.
- `3x taeglich`
  - Default-Preset: `morning`, `noon`, `evening`.
- `4x taeglich`
  - Default-Preset: `morning`, `noon`, `evening`, `night`.

Produktregel:
- Diese Presets sind die kanonischen V1-Defaults.
- Custom-Slots dürfen im Editor weiter moeglich bleiben, muessen aber fachlich einem Abschnittstyp zuordenbar sein, sobald das Datenmodell dafuer bereit ist.

##### S2.6 Schritt-Abnahme: Widerspruchsfreiheit gegen bestehendes Slot-Modell
- Der Vertrag bleibt kompatibel mit dem heutigen Multi-Dose-Kern:
  - Slots existieren bereits
  - `1..n` pro Tag existiert bereits
  - `Morgen/Mittag/Abend/Nacht` sind heute schon starke Presets
- Der Vertrag widerspricht aber bewusst dem noch bestehenden Tages-Fast-Path:
  - `medication_confirm_all`
  - `confirmAllOpenMedicationSlots(...)`
  - `scope: all_open_for_day`

Schritt-Abnahme:
- Der neue fachliche Vertrag ist konsistent mit dem bestehenden Slot-Modell.
- Der noetige Umbau liegt nicht in der Produktdefinition, sondern in Datenmodell-Schaerfung und Downstream-Pfaden.

##### S2.7 Doku-Sync
- `docs/archive/Medication Management Module Spec.md`
  - Dokumentstatus ergaenzen: die naechste geplante Ausbaustufe fuer Medication ist die Abschnittslogik gemaess `docs/Medication Daypart Batch & Reminder Roadmap.md`.
- In den Modul-Overviews ist noch kein weiterer Ist-Stand-Aenderungsbedarf notwendig, weil `S2` einen Zielvertrag definiert, aber noch kein produktives Verhalten aendert.

##### S2.8 Commit-Empfehlung
- Ja, `S1 + S2` sind jetzt gemeinsam commit-wuerdig.
- Grund:
  - die Ist-Analyse und der neue fachliche Vertrag bilden zusammen ein stabiles Paket.
  - ab `S3` beginnt die eigentliche Modellentscheidung; das ist ein neuer logischer Block.

### S3 - Datenmodell- und Slot-Typ-Strategie festlegen
- S3.1 Entscheiden, ob Freitext-Labels genuegen oder strukturierte `slot_type`-Werte eingefuehrt werden.
- S3.2 Falls `slot_type` kommt: Mapping-Regeln fuer bestehende Slots definieren.
- S3.3 Fallback-Strategie fuer unklare oder freie Labels festlegen.
- S3.4 Read-Contract von `med_list_v2` bzw. Nachfolger auf Abschnittsdaten pruefen.
- S3.5 Batch-Read-Model definieren: welche offenen Slots zaehlen je Abschnitt.
- S3.6 Schritt-Abnahme:
  - Modell gegen SQL-Vertrag, bestehende Daten und Edge-Cases pruefen
- S3.7 Doku-Sync:
  - Medication-Overview, Spec und Roadmap-Notizen aktualisieren
- S3.8 Commit-Empfehlung:
  - festhalten, ob Modell- und Mapping-Entscheidungen getrennt commitbar sind
- Output: belastbares Daten- und Mapping-Modell fuer Abschnittslogik.
- Exit-Kriterium: keine ungeklaerte Abhaengigkeit zwischen Slot-Label und Slot-Semantik.

#### S3 Ergebnisprotokoll (abgeschlossen)

##### S3.1 Entscheidung: Freitext-Labels reichen nicht, `slot_type` wird eingefuehrt
Ist-Befund:
- SQL speichert heute nur `label`, `sort_order`, `qty_per_slot`, `start_date`, `end_date`.
- `med_list_v2` liefert `slots[]` heute ebenfalls nur label-basiert.
- Frontend-Presets verwenden zwar `Morgen/Mittag/Abend/Nacht`, aber das ist aktuell nur eine UI-Konvention.

Modellentscheidung:
- Fuer die Abschnittslogik wird ein strukturierter `slot_type` Pflicht.
- Zulaessige Werte:
  - `morning`
  - `noon`
  - `evening`
  - `night`

Begruendung:
- Batch, Push, Incident und Voice duerfen nicht von Schreibweisen wie `Morgens`, `Frueh`, `zu Mittag` oder freien Labels abhaengen.
- Das Datenmodell braucht eine fachlich stabile Achse, auf der Abschnitts-CTAs und Reminder sicher arbeiten koennen.

Festlegung:
- `label` bleibt bestehen als sichtbarer Text.
- `slot_type` wird die operative Source of Truth fuer Abschnittslogik.

##### S3.2 Mapping-Regeln fuer bestehende Slots
Ziel:
- Vorhandene Daten sollen deterministisch auf `slot_type` gezogen werden, ohne manuelle Neuerfassung zu erzwingen.

Primäre Mapping-Stufe: Label-Aliase
- `morning`
  - `morgen`
  - `morgens`
  - `morning`
  - `frueh`
  - `früh`
- `noon`
  - `mittag`
  - `mittags`
  - `noon`
- `evening`
  - `abend`
  - `abends`
  - `evening`
- `night`
  - `nacht`
  - `nachts`
  - `night`

Sekundaere Mapping-Stufe: bekannte Presets nach Slot-Anzahl und `sort_order`
- `1x`:
  - `0 -> morning`
- `2x`:
  - `0 -> morning`
  - `1 -> evening`
- `3x`:
  - `0 -> morning`
  - `1 -> noon`
  - `2 -> evening`
- `4x`:
  - `0 -> morning`
  - `1 -> noon`
  - `2 -> evening`
  - `3 -> night`

Tertiaere Mapping-Stufe: deterministischer Fallback fuer unklare Custom-Slots
- Wenn weder Label noch Preset eindeutig greifen:
  - `sort_order = 0 -> morning`
  - `sort_order = 1 -> noon`
  - `sort_order = 2 -> evening`
  - `sort_order >= 3 -> night`

Bewusste Produktregel:
- Mehrere Slots duerfen denselben `slot_type` tragen.
- Das ist wichtig fuer spaetere Custom-Faelle oder hoehere Slot-Zahlen.

##### S3.3 Fallback-Strategie fuer unklare oder freie Labels
- Freie Labels bleiben als Anzeige moeglich.
- Ein freies Label ohne klaren Alias blockiert die Migration nicht.
- In diesem Fall wird der Abschnittstyp ueber die Fallback-Logik aus `sort_order` gesetzt.

Produktregel:
- `slot_type` entscheidet die Fachlogik.
- `label` darf frei formuliert sein, solange ein valider `slot_type` vorliegt.

Konsequenz fuer spaeter:
- Der TAB-Editor muss kuenftig nicht nur `label`, sondern auch `slot_type` sauber verwalten.

##### S3.4 Read-Contract: `med_list_v2` bleibt und wird erweitert
Modellentscheidung:
- `med_list_v2` bleibt das zentrale Medication-Read-Model.
- Es wird nicht fuer die Abschnittslogik ersetzt, sondern erweitert.

Minimal erforderliche Erweiterung in `slots[]`:
- `slot_id`
- `label`
- `slot_type`
- `sort_order`
- `qty`
- `start_date`
- `end_date`
- `is_taken`
- `taken_at`
- `day`

Bewusste Entscheidung:
- In V1 werden keine zusaetzlichen Top-Level-Daypart-Aggregate Pflicht.
- Abschnitts-CTAs, Batch-Auswahl und offene Gruppen koennen zunaechst sicher aus `slots[]` plus `slot_type` clientseitig abgeleitet werden.

##### S3.5 Batch-Read-Model definieren
Regel fuer einen offenen Abschnitt:
- Ein Abschnitt ist offen, wenn es fuer den aktuellen Tag mindestens einen gueltigen Slot mit passendem `slot_type` und `is_taken = false` gibt.

Regel fuer einen Abschnitts-CTA:
- CTA `morning` bestaetigt nur offene Slots mit `slot_type = morning`.
- CTA `noon` bestaetigt nur offene Slots mit `slot_type = noon`.
- CTA `evening` bestaetigt nur offene Slots mit `slot_type = evening`.
- CTA `night` bestaetigt nur offene Slots mit `slot_type = night`.

Wichtige Modellfolge:
- Abschnitts-Batch arbeitet kuenftig auf Slot-Menge je `slot_type`, nicht auf Medikament-ID oder globalem Tagesrest.

##### S3.6 Schritt-Abnahme: Modell gegen SQL, Daten und Edge-Cases
SQL-Kompatibilitaet:
- `health_medication_schedule_slots` ist der richtige Ort fuer `slot_type`.
- `health_medication_slot_events` muss keinen eigenen `slot_type` tragen, weil die fachliche Zuordnung ueber `slot_id -> schedule_slot.slot_type` erhalten bleibt.
- `med_list_v2` ist der richtige Ort fuer die Daypart-Ausgabe in `slots[]`.

Edge-Case-Kompatibilitaet:
- `1x taeglich` bleibt einfach, weil der einzige Slot `slot_type = morning` tragen kann.
- `2x/3x/4x` werden durch Presets eindeutig.
- Custom-Slots bleiben moeglich, weil mehrere Slots denselben `slot_type` teilen duerfen.

Schritt-Abnahme:
- Das Zielmodell ist mit dem bestehenden Multi-Dose-Schema kompatibel.
- Der notwendige Umbau ist additiv und bricht weder Slot-Events noch den bestehenden Medication-Kern.

##### S3.7 Doku-Sync
- Kein weiterer Ist-Stand-Sync in Modul-Overviews noetig.
- Grund:
  - `S3` ist eine Architektur- und Modellentscheidung, aber noch kein produktiver Laufzeitstand.
  - Die aktuellen Modul-Overviews sollen bis zur Implementierung bewusst den Ist-Zustand beschreiben.
- Die Roadmap selbst ist damit die kanonische Dokumentation der Modellentscheidung.

##### S3.8 Commit-Empfehlung
- Ja, `S1 + S2 + S3` sind jetzt gemeinsam sehr gut commit-wuerdig.
- Grund:
  - Analyse, Fachvertrag und Zielmodell bilden zusammen einen abgeschlossenen Architekturblock.
  - Ab `S4` beginnt die konkrete UX-/Read-Contract-Umsetzung auf diesem Modell.

### S4 - IN-Tab CTA- und Batch-Verhalten auf Abschnittslogik umbauen
- S4.1 Globalen All-Confirm-Pfad durch abschnittsbezogene CTAs ersetzen.
- S4.2 CTA-Sichtbarkeit nur fuer relevante offene Abschnitte herstellen.
- S4.3 Aktuellen Tagesabschnitt priorisieren, ohne andere offene Slots unzugaenglich zu machen.
- S4.4 Einzel-Slot-Bestaetigung als Fallback erhalten.
- S4.5 Sicherstellen, dass Multi-Dose-Medikamente nur im passenden Abschnitt gesammelt bestaetigt werden.
- S4.6 Schritt-Abnahme:
  - IN-Tab auf UX-Klarheit, Regressionsrisiken und Batch-Sicherheit pruefen
- S4.7 Doku-Sync:
  - Intake- und Medication-Overview auf neue CTA-Semantik ziehen
- S4.8 Commit-Empfehlung:
  - festhalten, ob UI-Vertrag und eigentliche Implementierung zusammen oder getrennt committen
- Output: klarer Abschnitts-CTA-Vertrag fuer den IN-Tab.
- Exit-Kriterium: keine Batch-Aktion kann fachlich unpassende Slots bestaetigen.

#### S4 Ergebnisprotokoll (abgeschlossen)

##### S4.1 Globalen All-Confirm-Pfad fachlich ersetzen
- Der bisherige Tages-CTA `Offene Einnahmen bestaetigen` verschwindet im Zielmodell aus dem IN-Tab.
- Er wird ersetzt durch abschnittsbezogene CTAs:
  - `Alle Morgen-Medikamente genommen`
  - `Alle Mittag-Medikamente genommen`
  - `Alle Abend-Medikamente genommen`
  - `Alle Nacht-Medikamente genommen`

Festlegung:
- Kein IN-CTA bestaetigt mehr den gesamten offenen Tag.
- Abschnitts-Batch arbeitet ausschliesslich auf offenen Slots des jeweiligen `slot_type`.

##### S4.2 CTA-Sichtbarkeit nur fuer relevante offene Abschnitte
- Ein Abschnitts-CTA wird nur gezeigt, wenn fuer diesen Abschnitt mindestens ein offener Slot existiert.
- Es gibt keine leeren oder deaktivierten Platzhalter fuer Abschnitte ohne offene Slots.
- Wenn fuer heute gar keine offenen Slots existieren:
  - es gibt keinen Batch-CTA
  - nur der normale Tagesstatus bleibt sichtbar

Festlegung:
- CTA-Sichtbarkeit folgt immer dem tatsaechlich offenen Abschnittsbestand im Read-Model.

##### S4.3 Priorisierung des aktuellen Tagesabschnitts
V1-Entscheidung:
- Der IN-Tab zeigt einen CTA-Stack mit:
  - genau einer primaeren Hauptaktion
  - optional zusaetzlichen kompakten Sekundaer-CTAs fuer weitere offene Abschnitte

Regel fuer die Hauptaktion:
- Wenn der aktuelle Tagesabschnitt offene Slots hat, wird dessen CTA die Hauptaktion.
- Wenn der aktuelle Tagesabschnitt keine offenen Slots hat, wird der frueheste noch offene Abschnitt des Tages die Hauptaktion.

Reihenfolge der Abschnitte:
- `morning`
- `noon`
- `evening`
- `night`

Beispiele:
- 08:30, offene `morning`-Slots:
  - Hauptaktion: `Alle Morgen-Medikamente genommen`
- 14:00, `morning` noch offen und `noon` offen:
  - Hauptaktion: `Alle Mittag-Medikamente genommen`
  - Sekundaer: `Morgen erledigen`
- 22:00, `evening` offen und `night` offen:
  - Hauptaktion: `Alle Nacht-Medikamente genommen`
  - Sekundaer: `Abend erledigen`

Festlegung:
- Der IN-Tab priorisiert den aktuellen Abschnitt, blendet aeltere offene Abschnitte aber nicht aus.

##### S4.4 Einzel-Slot-Bestaetigung bleibt immer der Fallback
- Jede Medikamentenkarte behaelt ihre direkten Slot-Buttons.
- Abschnitts-CTAs sind nur Komfortaktionen fuer Gruppenbestaetigung.
- Wenn ein Nutzer einzelne Medikamente oder einzelne Slots separat bestaetigen will, bleibt das immer moeglich.

Festlegung:
- Kein Abschnitts-CTA ersetzt die Einzel-Slot-Bedienbarkeit.
- Undo bleibt weiterhin slot-basiert und nicht gruppenbasiert.

##### S4.5 Batch-Semantik fuer Multi-Dose-Medikamente
- Ein Abschnitts-CTA darf mehrere Medikamente gleichzeitig betreffen.
- Er darf aber nur die offenen Slots mit passendem `slot_type` bestaetigen.
- Ein Medikament mit `morning`, `noon`, `evening`, `night` wird also bei `Alle Morgen-Medikamente genommen` nur im `morning`-Slot bestaetigt.

Festlegung:
- Batch arbeitet auf der offenen Slot-Menge je Abschnitt.
- Medikament-IDs sind nur noch Trager der Karten-UI, nicht mehr die eigentliche Batch-Einheit.

##### S4.6 Schritt-Abnahme: UX-Klarheit und Regressionssicherheit
Klarheitsentscheidung fuer den IN-Tab:
- Checkbox-Selektion auf Medikament-Ebene wird im Zielmodell nicht weiter ausgebaut.
- Der Abschnitts-CTA-Stack ersetzt die bisherige Batch-Checkbox-Denke.
- Multi-Slot-Medikation wird damit nicht mehr ueber eine halbpassende Karten-Selektion modelliert, sondern ueber fachlich klare Abschnittsgruppen.

`1x taeglich`-Regel:
- `1x`-Medikation bleibt schnell:
  - direkter Kartenbutton weiterhin moeglich
  - zusaetzlich kann sie in einem passenden Abschnitts-CTA mitlaufen

Schritt-Abnahme:
- Das Zielverhalten ist UX-seitig klarer als die bisherige Mischung aus Slot-Buttons plus Rest-Batch.
- Es gibt im Zielmodell keinen Batch-Pfad mehr, der fachlich unpassende Slots bestaetigen kann.

##### S4.7 Doku-Sync
- Noch kein weiterer Ist-Stand-Sync in `docs/modules/*`.
- Grund:
  - `S4` beschreibt den Zielvertrag fuer die kuenftige IN-UX, nicht den bereits produktiven Runtime-Stand.
  - Die Roadmap bleibt bis zur Implementierung die kanonische Quelle fuer diese neue CTA-Semantik.

##### S4.8 Commit-Empfehlung
- Noch kein eigener Commit nur fuer `S4` notwendig.
- Sinnvoller Paket-Schnitt:
  - `S1 + S2 + S3 + S4` als kompletter Analyse-/Vertrags-/UX-Block
  - danach `S5` als Reminder-/Incident-Vertrag

### S5 - Push-/Reminder-Config und Incident-Logik angleichen
- S5.1 Gemeinsame Source of Truth fuer Abschnittszeiten definieren.
- S5.2 Reminder-/Push-Konfiguration auf dieselben Zeitfenster ziehen.
- S5.3 Incident-Logik auf offene Abschnitte statt unscharfe Tages-Offenheit umstellen.
- S5.4 Klaeren, ob YAML, Code oder SQL die kanonische Reminder-Quelle ist.
- S5.5 Schritt-Abnahme:
  - Reminder und Incidents gegen denselben Abschnittsvertrag pruefen
- S5.6 Doku-Sync:
  - Push-Overview, YAML-Doku und QA-Checks aktualisieren
- S5.7 Commit-Empfehlung:
  - festhalten, ob Reminder-/Incident-Aenderungen gemeinsam committen
- Output: synchronisierte Reminder- und Incident-Semantik.
- Exit-Kriterium: kein Drift mehr zwischen sichtbarem CTA-Fenster und Push-/Incident-Zeitlogik.

#### S5 Ergebnisprotokoll (abgeschlossen)

##### S5.1 Gemeinsame Source of Truth fuer Abschnittszeiten
Ist-Befund:
- lokale Medication-Incidents nutzen heute `MED_PUSH_HOUR = 19` in `app/modules/incidents/index.js`
- BP nutzt dort separat `BP_PUSH_HOUR = 20`
- remote Medication-/BP-Schedules liegen parallel in `.github/workflows/incidents-push.yml`
- YAML ist nicht die Reminder-Quelle

Vertragsentscheidung:
- Es gibt kuenftig genau eine fachliche Medication-Zeitdefinition fuer Abschnittslogik:
  - `morning`: `06:00`
  - `noon`: `11:00`
  - `evening`: `17:00`
  - `night`: `21:00`

Produktregel:
- Diese 4 Zeiten sind der gemeinsame Medication-Zeitvertrag fuer:
  - CTA-Priorisierung im IN-Tab
  - lokale Incident-Pruefung
  - remote Incident-Scheduler
  - spaetere Voice-/Assistant-Kontextlogik

##### S5.2 Reminder-/Push-Konfiguration auf dieselben Zeitfenster ziehen
Vertragsentscheidung:
- Medication hat kuenftig keine einzige aggregierte Tages-Reminder-Zeit mehr.
- Stattdessen gibt es bis zu vier Medication-Abschnittsfenster pro Tag:
  - `medication_morning`
  - `medication_noon`
  - `medication_evening`
  - `medication_night`

Sichtbare Produktlogik:
- Ein Reminder-/Push-Fenster wird nur dann relevant, wenn fuer diesen Abschnitt noch offene Slots existieren.
- Bereits erledigte Abschnitte erzeugen weder lokale noch remote Pushes.
- Mehrere offene Abschnitte an einem Tag sind fachlich moeglich; jeder Abschnitt bleibt aber ein eigener Incident-Kontext.

Festlegung:
- `medication_daily_open` wird fachlich durch abschnittsbezogene Medication-Incidents ersetzt.
- `medication_morning` als alter Spezialfall wird nicht wieder einzeln-legacy weitergezogen, sondern Teil eines einheitlichen Vierer-Modells.

##### S5.3 Incident-Logik: offene Abschnitte statt Tages-Offenheit
Aktuelle Logik:
- heute gilt Medication offen, sobald irgendein Medikament `state !== 'done'` hat
- daraus folgt ein spaeter aggregierter Tages-Incident

Zielvertrag:
- Ein Medication-Incident entsteht je Abschnitt, nicht je Tag.
- Ein Abschnitts-Incident ist aktiv, wenn:
  - der Abschnitt sein Zeitfenster erreicht hat
  - fuer diesen Abschnitt mindestens ein offener Slot existiert
- Ein Abschnitts-Incident ist inaktiv, wenn:
  - alle Slots des Abschnitts erledigt sind
  - der Tag wechselt

Bewusste Produktregel:
- Es gibt maximal einen Push pro Abschnitt und Tag.
- Es gibt keine Eskalationskette innerhalb eines Abschnitts in V1.

##### S5.4 Kanonische Quelle fuer Reminder-Zeiten
Entscheidung:
- Die kanonische Reminder-Zeitquelle liegt nicht in der YAML.
- Sie soll kuenftig in einem produktiven Code-/Config-Vertrag liegen, den lokale Incident-Engine und remote Scheduler gemeinsam nutzen koennen.

Pragmatische V1-Festlegung:
- Bis zur technischen Vereinheitlichung ist die Roadmap die fachliche Source of Truth.
- Bei der Umsetzung muessen mindestens diese Stellen synchronisiert werden:
  - `app/modules/incidents/index.js`
  - `.github/workflows/incidents-push.yml`
  - eventuell Edge-Function-/Window-Dispatch-Logik, falls dort Medication-Fenster unterschieden werden
  - `service-worker.js` Incident-Typ-Erkennung

##### S5.5 Schritt-Abnahme: Driftfreiheit zwischen UI, lokal und remote
Erforderliche End-Semantik:
- Wenn der IN-Tab `Alle Abend-Medikamente genommen` priorisiert, dann muss:
  - derselbe Abschnitt in der Incident-Engine existieren
  - derselbe Abschnitt remote adressierbar sein
  - derselbe Abschnitt im Push-Typ wiedererkennbar sein

Konkrete Zieltypen:
- `medication_morning`
- `medication_noon`
- `medication_evening`
- `medication_night`
- `bp_evening` bleibt separat und unveraendert ausserhalb dieses Medication-Vertrags

Schritt-Abnahme:
- Das Zielmodell beendet den bisherigen Drift zwischen:
  - tagesweitem Medication-Incident
  - altem Legacy-Typ `medication_morning`
  - neuem Abschnittsvertrag im IN-Tab

##### S5.6 Doku-Sync
- `docs/modules/Push Module Overview.md`
  - Dokumentstatus ergaenzen: die naechste geplante Medication-Ausbaustufe ersetzt den aggregierten Tages-Incident durch abschnittsbezogene Medication-Incidents gemaess dieser Roadmap.
- Keine YAML-Doku-Anpassung noetig, weil die YAML nicht die operative Reminder-Spec ist.
- `docs/QA_CHECKS.md` bleibt bis zur Implementierung bewusst beim Ist-Zustand.

##### S5.7 Commit-Empfehlung
- Ja, `S1` bis `S5` sind jetzt gemeinsam als Architektur-/Produktvertragsblock commit-wuerdig.
- Grund:
  - Analyse, Fachvertrag, Datenmodell, IN-UX und Incident-/Reminder-Vertrag sind jetzt geschlossen und konsistent.
  - `S6` startet den separaten Assistant-/Voice-Block.

### S6 - Voice-/Assistant-Pfade auf Abschnittssemantik absichern
- S6.1 Voice-Kommandos fuer abschnittsbezogene Bestaetigung definieren.
- S6.2 Globale `confirm all`-Semantik fuer den Medication-Tag abschaffen oder eng begrenzen.
- S6.3 Intent-Regeln und Guards auf Abschnittslogik ziehen.
- S6.4 Sicherstellen, dass Voice nie stillschweigend den ganzen Tag bestaetigt.
- S6.5 Schritt-Abnahme:
  - Voice-/Assistant-Vertrag gegen Produkt- und UI-Semantik pruefen
- S6.6 Doku-Sync:
  - Intent- und Voice-Doku nachziehen
- S6.7 Commit-Empfehlung:
  - festhalten, ob Voice/Assistant separat oder mit S5/S8 gebuendelt werden
- Output: abgesicherte Voice-/Assistant-Semantik fuer Tagesabschnitte.
- Exit-Kriterium: kein Voice-Pfad kann implizit fachlich zu viel bestaetigen.

#### S6 Ergebnisprotokoll (abgeschlossen)

##### S6.1 Voice-Kommandos fuer abschnittsbezogene Bestaetigung
Neuer Zielvertrag:
- Produktiv wird Medikation nicht mehr ueber `medication_confirm_all` gedacht, sondern ueber einen abschnittsbezogenen Confirm-Intent.

Empfohlener produktiver Intent:
- `medication_confirm_section`

Minimaler Payload-Vertrag:
- `scope: open_for_section`
- `section: morning | noon | evening | night`

Beispielphrasen fuer direkten Write:
- `Morgenmedikamente genommen`
- `Mittagmedikamente genommen`
- `Abendmedikamente genommen`
- `Nachtmedikamente genommen`
- `Meine Tabletten heute Morgen genommen`
- `Abendtabletten erledigt`

Festlegung:
- Ein direkter lokaler Write ist nur zulaessig, wenn der Abschnitt explizit genannt oder semantisch eindeutig im Input enthalten ist.

##### S6.2 Globale `confirm all`-Semantik fuer den Tag abschaffen
Aktueller Problemfall:
- `medication_confirm_all`
- `scope: all_open_for_day`
- lokaler Dispatch ueber `confirmAllOpenMedicationSlots(...)`

Zielvertrag:
- Der globale Tages-Write wird produktiv beendet.
- `medication_confirm_all` darf kuenftig nicht mehr heissen:
  - `bestaetige alles, was heute noch offen ist`

Zulaessiger Uebergang:
- Der alte Intent kann waehrend des Umbaus noch technisch existieren, darf aber nicht mehr als automatischer Tages-Write weiterleben.
- Entweder:
  - vollstaendig entfernen
  - oder nur noch in einen bestaetigungsbeduerftigen Klärungszustand laufen

Festlegung:
- Kein produktiver direkter Local-Dispatch mehr fuer tagesweite Sammelbestaetigung.

##### S6.3 Intent-Regeln und Guards auf Abschnittslogik ziehen
Neue Regel fuer den Intent-Kern:
- Medication braucht kuenftig einen expliziten Abschnitts-Slot im semantischen Modell.
- Beispiele:
  - `MORNING_SECTION`
  - `NOON_SECTION`
  - `EVENING_SECTION`
  - `NIGHT_SECTION`

Validator-Vertrag:
- direkter Write nur gueltig, wenn:
  - `target_action = medication_confirm_section`
  - `payload.scope = open_for_section`
  - `payload.section` in `morning|noon|evening|night`

Konsequenz:
- Die aktuelle Validator-Regel `scope === all_open_for_day` wird fachlich abgeloest.

##### S6.4 Keine stillschweigende Ganz-Tages-Bestaetigung mehr
Produktregel:
- Generische Aussagen wie
  - `Ich habe meine Medikamente genommen`
  - `Tabletten erledigt`
  - `Medikation bestaetigt`
  duerfen nicht mehr als direkter Write laufen.

Zulaessiges Verhalten fuer solche Inputs:
- `fallback`
- oder `needs_confirmation` / Rueckfrage
- aber kein blinder Local-Write

Pragmatische V1-Entscheidung:
- Wenn der Abschnitt nicht explizit ist, wird nicht direkt geschrieben.
- Das ist strenger, aber fachlich sicherer.

##### S6.5 Voice-/Text-Hub-Vertrag angleichen
- Die Regel gilt identisch fuer:
  - Voice-Orchestrator
  - Text-Intent-Dispatch im Hub
  - Intent-Validatoren

Produktregel:
- Text und Voice muessen denselben Medikamenten-Schreibvertrag sprechen.
- Es darf keinen Fall geben, in dem Text noch den ganzen Tag bestaetigt, waehrend Voice schon auf Abschnitte begrenzt ist oder umgekehrt.

Low-Stock-Follow-up:
- Ein enger Low-Stock-Follow-up bleibt weiter zulaessig.
- Er haengt kuenftig an erfolgreicher Abschnittsbestaetigung, nicht an einem globalen Tages-Write.

##### S6.6 Doku-Sync
- `docs/modules/Intent Engine Module Overview.md`
  - Statushinweis ergaenzen: Medication wird in der naechsten Ausbaustufe von `medication_confirm_all` auf abschnittsbezogene Confirm-Semantik umgestellt.
- Weitere Modul-Overviews bleiben bis zur Implementierung bewusst beim Ist-Stand.

##### S6.7 Commit-Empfehlung
- Ja, `S1` bis `S6` sind jetzt gemeinsam als kompletter Produktvertragsblock commit-wuerdig.
- Grund:
  - IN, Push, Incident, Datenmodell und Assistant/Voice sprechen jetzt im Zielvertrag dieselbe Abschnittslogik.
  - `S7` und `S8` sind danach klar die Bruecke in Migration, QA und technische Umsetzung.

### S7 - Migration, Rueckwaertskompatibilitaet und QA definieren
- S7.1 Bestehende Medication-Slots auf eindeutige Abschnittstypen pruefen.
- S7.2 Migrationsstrategie fuer unklare oder freie Labels festlegen.
- S7.3 Edge-Cases sammeln:
  - offene Morgen-Slots am Nachmittag
  - mehrere offene Abschnitte gleichzeitig
  - `1x taeglich` ohne expliziten Tagesabschnitt
- S7.4 Smokechecks fuer UI, Batch, Push, Voice und Incident definieren.
- S7.5 Schritt-Abnahme:
  - Testmatrix auf reale Multi-Dose-Flows und Regressionsrisiken pruefen
- S7.6 Doku-Sync:
  - `docs/QA_CHECKS.md` und angrenzende Modul-Doku aktualisieren
- S7.7 Commit-Empfehlung:
  - festhalten, ob QA-/Migrationsdoku separat commitbar ist
- Output: belastbare Migrations- und QA-Grundlage.
- Exit-Kriterium: alle risikoreichen Edge-Cases sind testbar beschrieben.

#### S7 Ergebnisprotokoll (abgeschlossen)

##### S7.1 Bestehende Medication-Slots auf eindeutige Abschnittstypen pruefen
Migrationsgrundlage:
- Bestehende Medication-Daten bleiben erhalten.
- Der Umbau erfolgt nicht ueber Modul-Reset, sondern ueber einen deterministischen `slot_type`-Backfill auf den vorhandenen Schedule-Slots.

Pruefregel:
- Jeder bestehende aktive Slot muss nach der Migration genau einen gueltigen `slot_type` tragen.
- Gueltige Werte:
  - `morning`
  - `noon`
  - `evening`
  - `night`

Erfolgskriterium:
- Nach der Migration darf es keinen aktiven Slot ohne `slot_type` geben.

##### S7.2 Migrationsstrategie fuer unklare oder freie Labels
Verbindliche Reihenfolge fuer den Backfill:
1. Label-Alias-Mapping
2. Preset-Mapping nach Slot-Anzahl + `sort_order`
3. Fallback-Mapping nur ueber `sort_order`

Bewusste Produktregel:
- Die Migration scheitert nicht an freien Labels.
- Freie oder uneindeutige Labels werden nicht verworfen, sondern nur fachlich auf einen `slot_type` normalisiert.

Wenn ein Slotlabel fachlich "komisch" bleibt:
- `label` bleibt als Nutzertext erhalten
- `slot_type` uebernimmt die funktionale Semantik

##### S7.3 Verbindliche Edge-Cases
Diese Faelle muessen explizit unterstuetzt und getestet werden:

- Offene Morgen-Slots am Nachmittag
  - `morning` bleibt einzeln bestaetigbar
  - `noon` wird als Haupt-CTA priorisiert, falls ebenfalls offen
- Mehrere offene Abschnitte gleichzeitig
  - genau ein Haupt-CTA
  - optionale Sekundaer-CTAs fuer weitere offene Abschnitte
- `1x taeglich` ohne manuell gesetzten Abschnitt
  - wird auf `morning` gemappt
- `2x/3x/4x` aus alten Presets
  - werden deterministisch auf die Default-Abschnitte gemappt
- Custom-Slots mit freien Labels
  - behalten ihren Labeltext
  - erhalten einen funktionalen `slot_type`
- Mehrere Slots mit demselben Abschnitt
  - bleiben erlaubt
  - CTA bestaetigt alle offenen Slots dieses Abschnitts
- Bereits erledigter frueher Abschnitt + offener spaeter Abschnitt
  - nur der offene spaetere Abschnitt bleibt CTA-relevant
- Voice-/Text-Eingabe ohne Abschnitt
  - kein direkter Write
  - nur Fallback oder Rueckfrage
- Tagwechsel
  - alle Abschnitts-Incidents resetten
  - offene Slots des neuen Tages werden neu bewertet

##### S7.4 Verbindliche Smoke-Matrix
Die folgende Matrix ist vor Abschluss von `S8` Pflicht:

IN-Tab:
- `1x taeglich`
  - Kartenbutton
  - Abschnitts-CTA `morning`
- `2x taeglich`
  - `morning` einzeln
  - `evening` einzeln
  - jeweilige CTAs getrennt
- `3x taeglich`
  - `morning/noon/evening` einzeln und als passende Gruppen
- `4x taeglich`
  - `morning/noon/evening/night` einzeln und als passende Gruppen
- mehrere Medikamente im selben Abschnitt
  - CTA bestaetigt nur diesen Abschnitt ueber mehrere Karten hinweg
- mehrere offene Abschnitte gleichzeitig
  - Haupt-CTA + Sekundaer-CTA-Verhalten pruefen

Push / Incidents:
- `medication_morning` feuert nur, wenn `morning` offen ist und das Zeitfenster erreicht wurde
- `medication_noon` feuert nur fuer `noon`
- `medication_evening` feuert nur fuer `evening`
- `medication_night` feuert nur fuer `night`
- kein Push fuer bereits erledigte Abschnitte
- maximal ein Push pro Abschnitt und Tag

Voice / Text:
- explizite Abschnittsphrase -> direkter Write erlaubt
- generische Medikationsphrase -> kein direkter Write
- Low-Stock-Follow-up nur nach erfolgreicher Abschnittsbestaetigung

Migration:
- bestehende Daten mit klaren Labels mappen sauber
- bestehende Daten mit freien Labels mappen deterministisch
- Profil-/Hub-/Medication-Snapshot bleiben lesbar

##### S7.5 Schritt-Abnahme: reale Testbarkeit
Abnahme-Regel:
- Jeder risikoreiche Produktfall aus `S1` bis `S6` muss als testbarer Fall in `S7` wieder auftauchen.

Abgedeckte Risikoachsen:
- Batch bestaetigt nicht mehr den ganzen Tag
- Reminder und CTAs driften nicht auseinander
- Voice schreibt nicht zu breit
- Custom-Slots bleiben funktional
- `1x taeglich` bleibt schnell

Schritt-Abnahme:
- Die Migrations- und QA-Grundlage ist konkret genug, um `S8` ohne Interpretationsspielraum umzusetzen und abzunehmen.

##### S7.6 Doku-Sync
- `docs/QA_CHECKS.md` wird fuer den Moment bewusst noch nicht erweitert.
- Grund:
  - `S7` definiert die Ziel-Smokes, aber der produktive Laufzeitstand ist noch nicht umgesetzt.
  - Die kanonische Quelle fuer die neue QA-Matrix bleibt bis `S8` diese Roadmap.
- In `S8` muss die neue Abschnitts-Smoke-Matrix dann in `docs/QA_CHECKS.md` uebernommen werden.

##### S7.7 Commit-Empfehlung
- Ja, `S1` bis `S7` sind jetzt gemeinsam als vollstaendiger Analyse-, Vertrags-, Migrations- und QA-Block commit-wuerdig.
- Grund:
  - vor `S8` sind jetzt Produktvertrag, Datenmodell, CTA-Logik, Reminder-Semantik, Voice-Grenzen und Testgrundlage geschlossen.

### S8 - Umsetzung des Abschnittsmodells + Endvalidierung
- S8.1 Daten-/Read-Contract technisch umsetzen.
- S8.2 IN-Tab-CTAs und Batch-Handling implementieren.
- S8.3 Reminder-/Push-/Incident-Pfade technisch angleichen.
- S8.4 Voice-/Assistant-Pfade absichern.
- S8.5 Doku, YAML, QA und Changelog synchron nachziehen.
- S8.6 Schritt-Abnahme:
  - Code-/Dead-Code-Pruefung, Syntaxchecks und manuelle Smokechecks
- S8.7 Doku-Sync:
  - alle betroffenen Modul-Overviews, Specs und diese Roadmap auf finalen Stand bringen
- S8.8 Commit-Empfehlung:
  - finalen Commit-/Merge-Vorschlag dokumentieren
- Output: produktiv konsistentes Abschnittsmodell ueber UI, Push, Incident und Voice.
- Exit-Kriterium: Code, Config, Reminder, Doku und Smokechecks sind auf demselben Endstand.

#### S8 Checkpoint A - Datenmodell + Medication-Client abgeschlossen
- Status:
  - `S8.1` ist technisch umgesetzt.
  - `S8.2` bis `S8.5` bleiben bewusst offen.
- Umgesetzt:
  - `sql/12_Medication.sql`
    - `health_medication_schedule_slots` traegt jetzt `slot_type`.
    - bestehende Slots werden deterministisch ueber Alias-, Preset- und `sort_order`-Fallback auf einen gueltigen `slot_type` gezogen.
    - `med_list_v2(...)` liefert `slot_type` in `slots[]`.
    - `med_upsert_schedule_v2(...)` akzeptiert und normalisiert `slot_type`.
  - `app/modules/intake-stack/medication/index.js`
    - der Medication-Client liest, normalisiert und schreibt `slot_type`.
    - Preset-Slots (`1x..4x`) erzeugen jetzt kanonische Abschnittstypen statt nur Labels.
    - der TAB-Editor fuehrt `slot_type` pro Slot intern mit, auch bei Add/Remove und Save.
- Validierung:
  - `node --check app/modules/intake-stack/medication/index.js` ist gruen.
- Bewusster Stopp:
  - keine neuen IN-CTAs
  - keine Push-/Incident-Aenderungen
  - keine Voice-/Assistant-Aenderungen
- Grund:
  - Damit ist zuerst der gemeinsame technische Unterbau stabil, bevor Batch-, Reminder- oder Assistant-Pfade umgestellt werden.

#### S8 Checkpoint B - IN-Tab-CTAs + Abschnitts-Batch abgeschlossen
- Status:
  - `S8.1` und `S8.2` sind technisch umgesetzt.
  - `S8.3` bis `S8.5` bleiben bewusst offen.
- Umgesetzt:
  - `app/modules/intake-stack/intake/index.js`
    - der bisherige Tages-CTA `Offene Einnahmen bestaetigen` wurde fachlich entfernt.
    - der IN-Tab priorisiert jetzt offene Abschnittsgruppen als CTA-Stack:
      - primaerer CTA fuer den aktuell passenden oder naechstfruehen offenen Abschnitt
      - sekundaere CTAs fuer weitere offene Abschnitte desselben Tages
    - Batch-Handling arbeitet jetzt auf offenen `slot_id`s je `slot_type`, nicht mehr auf global selektierten Medikament-IDs.
    - Multi-Dose-Medikamente bleiben dadurch korrekt: Batch bestaetigt nur den gewaelten Abschnitt, nie mehr den ganzen Tag.
    - die Einzel-Slot-Buttons bleiben der manuelle Fallback fuer jede Einnahme.
    - die alte Checkbox-/Selektionslogik wurde aus dem IN-Tab entfernt.
  - `app/styles/hub.css`
    - CTA-Footer ist fuer einen primaeren Abschnitts-CTA plus kompakte Sekundaer-CTAs aufbereitet.
- Validierung:
  - `node --check app/modules/intake-stack/intake/index.js` ist gruen.
- Bewusster Stopp:
  - keine Reminder-/Push-Aenderungen
  - keine Incident-Aenderungen
  - keine Voice-/Assistant-Aenderungen
  - keine YAML-Aenderungen
- Grund:
  - Damit ist der IN-Tab fachlich schon auf echtes Abschnittsverhalten umgestellt, ohne den Reminder-/Incident-/Assistant-Vertrag vorschnell halb mitzuziehen.

#### S8 Checkpoint C - Lokale Incidents + Service Worker auf Abschnittstypen gezogen
- Status:
  - `S8.1` und `S8.2` sind technisch umgesetzt.
  - der repo-lokale Teil von `S8.3` ist umgesetzt.
  - Remote-Scheduler-/Edge-Function-Follow-up bleibt separat offen.
- Umgesetzt:
  - `app/modules/incidents/index.js`
    - der alte globale Medication-Incident `medication_daily_open` ist lokal ersetzt durch abschnittsbezogene Typen:
      - `medication_morning`
      - `medication_noon`
      - `medication_evening`
      - `medication_night`
    - die lokale Incident-Engine liest offene Medication-Slots jetzt ueber `slot_type`.
    - pro Abschnitt gilt genau ein eigener Tages-Cutoff:
      - `06:00` morning
      - `11:00` noon
      - `17:00` evening
      - `21:00` night
    - gesendet wird lokal nur noch fuer den aktuell aktiven Abschnitt, nie mehr als globaler Tages-Reminder.
    - Push-Flags werden jetzt pro Abschnitt und Tag statt global fuer Medication gefuehrt.
  - `service-worker.js`
    - neue Medication-Incident-Typen werden als Incident-Notifications erkannt.
    - der alte Typ `medication_daily_open` bleibt im Service Worker nur noch als Rueckwaertskompatibilitaet lesbar.
    - Cache-Version wurde erhoeht, damit der geaenderte Worker sicher neu ausgerollt wird.
- Validierung:
  - `node --check app/modules/incidents/index.js` ist gruen.
- Bewusster Stopp:
  - `.github/workflows/incidents-push.yml` wurde in diesem Stopp nicht geaendert.
  - die eigentliche Edge Function hinter `INCIDENTS_PUSH_URL` liegt nicht in diesem Repo.
- Grund:
  - Damit ist der lokale Reminder-/Incident-Pfad hier im Frontend sauber auf den neuen Vertrag gezogen, ohne den externen Backend-Scheduler blind gegen einen noch nicht im Workspace verifizierbaren Payload-Vertrag zu brechen.

#### S8 Checkpoint D - Voice-/Text-Intent auf Abschnittsbestaetigung gezogen
- Status:
  - `S8.1` bis `S8.4` sind repo-lokal umgesetzt.
  - `S8.5` bleibt offen.
- Umgesetzt:
  - `app/modules/assistant-stack/intent/slots/extract.js`
    - Medication-Tagesabschnitte werden jetzt als semantische Slots erkannt:
      - `morning`
      - `noon`
      - `evening`
      - `night`
  - `app/modules/assistant-stack/intent/rules/medication.js`
    - der alte globale Intent `medication_confirm_all` ist ersetzt durch `medication_confirm_section`.
    - direkter Medication-Write matcht nur noch, wenn eine explizite Abschnittsangabe erkannt wurde.
  - `app/modules/assistant-stack/intent/validators.js`
    - validiert jetzt `scope: open_for_section` plus gueltigen `section`-Wert.
  - `app/modules/intake-stack/medication/index.js`
    - neuer Helper `confirmMedicationSection(...)` bestaetigt nur offene Slots eines Abschnitts.
  - `app/modules/assistant-stack/voice/index.js`
    - Voice verarbeitet Medication nicht mehr als Tages-Write, sondern nur noch abschnittsbezogen.
    - generische Medication-Commands ohne Abschnitt fuehren damit nicht mehr zu einem direkten lokalen Write.
    - Spoken Replies und Blocked Replies sprechen jetzt explizit ueber `Morgen/Mittag/Abend/Nacht`.
  - `app/modules/hub/index.js`
    - derselbe Abschnittsvertrag gilt jetzt fuer Text-Intent-Dispatch im Hub.
    - Text-Intent und Voice-Intent teilen damit denselben Medication-Schreibpfad.
- Validierung:
  - `node --check app/modules/assistant-stack/intent/slots/extract.js` ist gruen.
  - `node --check app/modules/assistant-stack/intent/rules/medication.js` ist gruen.
  - `node --check app/modules/assistant-stack/intent/validators.js` ist gruen.
  - `node --check app/modules/assistant-stack/voice/index.js` ist gruen.
  - `node --check app/modules/hub/index.js` ist gruen.
  - `node --check app/modules/intake-stack/medication/index.js` ist gruen.
- Bewusster Stopp:
  - keine Modul-Overview-Doku aktualisiert
  - keine QA-Checklist aktualisiert
  - kein externer Assistant-/Backend-Action-Vertrag ausserhalb dieses Repos angepasst
- Grund:
  - Damit ist der lokale Intent-/Voice-/Text-Schreibvertrag jetzt konsistent und sicher eingeengt, bevor der finale Doku-, QA- und Release-Nachzug passiert.

#### S8 Checkpoint E - Doku-/QA-Sync repo-lokal abgeschlossen
- Status:
  - `S8.1` bis `S8.5` sind repo-lokal umgesetzt.
  - `S8.6` bis `S8.8` bleiben offen.
- Umgesetzt:
  - `docs/modules/Intake Module Overview.md`
    - dokumentiert jetzt den Abschnitts-CTA-Stack im IN-Tab statt Tages-Checkbox-/Global-Batch-Logik.
  - `docs/modules/Medication Module Overview.md`
    - beschreibt `slot_type`, abschnittsbezogene Batch-CTAs und den neuen lokalen Schreibpfad `medication_confirm_section`.
  - `docs/modules/Push Module Overview.md`
    - trennt jetzt sauber zwischen repo-lokalem Abschnittsmodell und weiterhin separatem Remote-Scheduler-/Backend-Vertrag.
  - `docs/modules/Intent Engine Module Overview.md`
    - fuehrt `medication_confirm_section` als produktiven Medication-Fast-Path.
  - `docs/Voice Command Semantics.md`
    - Medication ist jetzt als abschnittsbezogener Sprachvertrag dokumentiert.
    - generische Tagessaetze ohne Abschnitt sind explizit nicht mehr write-faehig.
  - `docs/QA_CHECKS.md`
    - Medication-QA, Voice-QA und Follow-up-QA sprechen jetzt denselben Abschnittsvertrag wie Code und UI.
- Bewusste Grenze:
  - `.github/workflows/incidents-push.yml` und die Edge Function hinter `INCIDENTS_PUSH_URL` wurden in `S8.5` nicht geaendert.
  - Die YAML ist hier nicht die verifizierte produktive Source of Truth fuer den Remote-Reminder-Vertrag.
- Grund:
  - Damit sind Code, lokale Doku und QA im Repo auf demselben Stand, ohne externen Reminder-/Backend-Vertrag nur scheinbar mitgezogen zu haben.

#### S8 Checkpoint F - Repo-lokale Schritt-Abnahme durchgefuehrt
- Status:
  - der repo-lokale technische Teil von `S8.6` ist abgeschlossen.
  - echte Browser-/Device-Smokes bleiben vor dem finalen Abschluss weiter offen.
- Validiert:
  - `node --check` ist gruen fuer:
    - `app/modules/intake-stack/medication/index.js`
    - `app/modules/intake-stack/intake/index.js`
    - `app/modules/incidents/index.js`
    - `app/modules/assistant-stack/voice/index.js`
    - `app/modules/hub/index.js`
    - `app/modules/assistant-stack/intent/slots/extract.js`
    - `app/modules/assistant-stack/intent/rules/medication.js`
    - `app/modules/assistant-stack/intent/validators.js`
    - `service-worker.js`
  - Legacy-/Dead-Code-Drift fuer das alte Tagesmodell wurde im produktiven Runtime-Code gesucht:
    - keine produktiven Verweise mehr auf `medication_confirm_all`
    - keine produktiven Verweise mehr auf `all_open_for_day`
    - keine Checkbox-/Selektionsreste fuer den alten Tages-Batch im IN-Tab
    - `service-worker.js` liest `medication_daily_open` nur noch bewusst rueckwaertskompatibel
  - ein toter Legacy-Helper wurde entfernt:
    - `app/modules/intake-stack/medication/index.js`
    - `confirmAllOpenMedicationSlots(...)` hatte keinen produktiven Aufrufer mehr
- Statische Smoke-Befunde:
  - IN-Tab:
    - CTA-Markup fuer `medicationBatchFooter` / `medicationBatchActions` ist vorhanden.
    - Gruppierung und Priorisierung laufen ueber `slot_type` und den aktuellen Tagesabschnitt.
  - Incident-Pfad:
    - dieselben Abschnittstypen `morning/noon/evening/night` werden mit festen Cutoffs `06/11/17/21` ausgewertet.
  - Text-/Voice-Pfad:
    - direkter Medication-Write ist nur noch mit explizitem Abschnitt moeglich.
    - Hub und Voice filtern beide auf offene Slots des exakt angeforderten `slot_type`.
- Offene Grenze:
  - echte manuelle Browser-/Device-Smokes konnten im Shell-Workspace nicht ausgefuehrt werden.
  - insbesondere Push, Service-Worker-Rollout, reale Voice-Eingabe und Live-UI-Verhalten muessen vor `S8.8` noch praktisch abgenommen werden.
- Grund:
  - Damit ist die repo-lokale technische Abnahme ehrlich abgeschlossen, ohne Live-Smokes oder externe Reminder-Pfade nur zu behaupten.

#### S8 Checkpoint G - Finaler Doku-Schlussstand hergestellt
- Status:
  - `S8.7` ist abgeschlossen.
  - `S8.8` bleibt nur noch als Commit-Empfehlung offen.
- Umgesetzt:
  - `docs/modules/*` beschreiben den aktuellen repo-lokalen Medication-Runtime-Stand konsistent.
  - `docs/Voice Command Semantics.md` und `docs/QA_CHECKS.md` sprechen denselben Abschnittsvertrag wie Code und UI.
  - `docs/archive/Medication Management Module Spec.md` ist jetzt explizit als historischer Spec-Stand markiert und verweist sauber auf die heutigen Referenzen.
  - diese Roadmap fuehrt `S8` jetzt auf den realen Endstand des Repo-Umbaublocks.
- Bewusste Grenze:
  - kein Schein-Sync der externen Remote-Scheduler-/Edge-Function-Doku ausserhalb dieses Repos.
  - keine nachtraegliche Behauptung realer Browser-/Device-Smokes.
- Grund:
  - Damit ist die schriftliche Orientierung fuer Alt- und Neustand sauber getrennt: historische Specs bleiben historisch, laufende Runtime-Doku beschreibt den echten Codezustand.

#### S8 Checkpoint H - Commit-Empfehlung
- Status:
  - `S8.8` ist abgeschlossen.
- Empfehlung:
  - Ja, der Commit ist jetzt sinnvoll.
- Grund:
  - Der repo-lokale Umbau ist logisch geschlossen:
    - Datenmodell / `slot_type`
    - IN-Tab-CTA-Stack
    - lokale Incident-/Service-Worker-Anpassung
    - Voice-/Text-Intent auf Abschnittsbestaetigung
    - Doku-/QA-Sync
    - statische Schritt-Abnahme
  - Es gibt keinen halbfertigen Tages-/Abschnitts-Mischzustand mehr im produktiven Repo-Code.
  - Der verbleibende Remote-Scheduler-/Edge-Function-Punkt ist ein separater externer Vertrag und kein Grund, den repo-lokalen Abschluss weiter offen zu lassen.
- Empfohlene Commit-Stossrichtung:
  - `feat(medication): switch batch, incidents and voice to daypart-based confirmation`
- Empfohlener Commit-Inhalt:
  - Medication fuehrt `slot_type` als Abschnittsvertrag ein.
  - IN-Tab bestaetigt Batch nur noch pro `Morgen/Mittag/Abend/Nacht`.
  - lokale Incidents und Service Worker sprechen denselben Abschnittsvertrag.
  - Text/Voice nutzen `medication_confirm_section` statt globalem Tages-Write.
  - Doku und QA sind auf den neuen Medication-Vertrag gezogen.
- Resthinweis nach dem Commit:
  - reale Browser-/Device-Smokes fuer Service-Worker-Rollout, Voice und Live-UI bleiben direkt danach weiterhin empfehlenswert.
