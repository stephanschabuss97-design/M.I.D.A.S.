# Medication Reminder Softening & Push Tuning Roadmap

## Ziel (klar und pruefbar)
Der bestehende Medication-Push-Pfad soll von fruehen, harten Abschnitts-Incidents auf ein ruhigeres, gestaffeltes Reminder-Modell umgebaut werden, damit MIDAS spaeter im Alltag sanft unterstuetzt statt zu frueh Druck aufzubauen.

Pruefbare Zieldefinition:
- Medication wird nicht mehr direkt beim Abschnittsbeginn als harter Incident behandelt.
- Jeder Medication-Abschnitt kennt mindestens zwei fachliche Schwellen:
  - `gentle_reminder_after`
  - `incident_after`
- Die erste Medication-Benachrichtigung ist sprachlich und technisch sanfter als heute.
- Harte Incident-Darstellung bleibt nur fuer spaetere oder klarere Versaeumnisfaelle bestehen.
- Service Worker, lokale Incident-Engine und Doku sprechen denselben Severity-Vertrag.
- BP darf weiterhin strenger bleiben als Medication, wenn das fachlich so beschlossen wird.
- Maximal ein Reminder pro Stufe, Abschnitt und Tag.

## Scope
- Fachliche Neuausrichtung der Medication-Pushes von `Abschnitt beginnt` auf `plausibel verspaetet`.
- Einfuehrung eines gestaffelten Severity-Vertrags fuer Medication:
  - `reminder`
  - `incident`
- Anpassung der lokalen Incident-Engine, Notification-Payloads und Service-Worker-Darstellung.
- Anpassung des externen Incident-Pfads fuer echten Push ohne geoeffnete App:
  - Edge Function `midas-incident-push`
  - GitHub Actions Scheduler fuer Incident-Push
- QA-, Doku- und Vertrags-Sync fuer den neuen Reminder-Charakter.

## Not in Scope
- Voll personalisierbare Reminder-Zeitfenster pro Nutzer oder Medikament.
- Native Mobile-Notification-Features ausserhalb des Web-/PWA-Stacks.
- Komplexe Eskalationsketten mit mehreren Folge-Pings.
- Neue medizinische Fachlogik zur Einnahmebewertung.
- Umbau des gesamten Backends ausserhalb des Incident-Push-Pfads.

## Relevante Referenzen (Code)
- `app/modules/incidents/index.js`
- `service-worker.js`
- `app/core/pwa.js`
- `app/modules/intake-stack/medication/index.js`
- `app/modules/intake-stack/intake/index.js`
- `.github/workflows/incidents-push.yml`
- `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-incident-push/index.ts`

## Relevante Referenzen (Doku)
- `docs/modules/Push Module Overview.md`
- `docs/modules/Medication Module Overview.md`
- `docs/modules/Intake Module Overview.md`
- `docs/QA_CHECKS.md`
- `docs/Medication Daypart Batch & Reminder Roadmap.md`
- `docs/archive/Medication Multi-Dose Implementation Roadmap (DONE).md`

## Guardrails
- MIDAS bleibt ein ruhiges Sicherheitsnetz und kippt nicht in Reminder-Laerm.
- Medication-Reminder sollen spaet genug kommen, um sinnvoll zu sein, aber frueh genug, um echte Drift abzufangen.
- Der erste Push fuer Medication ist eine freundliche Nachfrage, kein strafender Vorwurf.
- Harte Incident-Darstellung wird nicht einfach global abgeschaltet, sondern gezielt auf echte Versaeumnisfaelle begrenzt.
- Service Worker darf Reminder und Incident nicht mehr gleich aggressiv behandeln.
- BP-Reminder duerfen fachlich strenger bleiben als Medication, wenn der Unterschied bewusst dokumentiert ist.
- Kein neuer Mischzustand, in dem Texte, Zeiten und Notification-Verhalten je Modul auseinanderlaufen.

## Architektur-Constraints
- Zeitlogik fuer Medication muss zentral definiert sein; keine driftenden Uhrzeiten zwischen Incident-Engine, UI und Dokumentation.
- Notification-Severity muss im Payload explizit transportiert oder eindeutig ableitbar sein.
- Bestehende Tag-/Abschnittslogik `morning/noon/evening/night` bleibt erhalten.
- Der Umbau darf keine Reminder-Schleifen oder Duplikate pro Abschnitt erzeugen.
- Lokaler und spaeterer Remote-Pfad muessen denselben fachlichen Severity-Vertrag sprechen, auch wenn der Remote-Follow-up ausserhalb dieses Repos liegt.
- Der externe Incident-Pfad darf nicht weiter auf Legacy-Daten wie `health_medication_doses` beruhen, wenn der produktive Medication-Kern bereits slot-basiert arbeitet.
- Scheduler-Zeitpunkte duerfen nicht die einzige fachliche Source of Truth fuer Reminder-Zeiten werden; die eigentliche Fachlogik muss im Incident-Vertrag bzw. in der Funktion leben.

## Tool Permissions
Allowed:
- Bestehende Incident-/Push-/Medication-Dateien lesen und innerhalb Scope aendern.
- Den Incident-Push-Workflow und die Edge Function im Backend-Workspace innerhalb dieses Scopes anpassen.
- Doku, QA und Service-Worker-Vertrag anpassen.
- Lokale Syntaxchecks, Repo-Scans und gezielte Reminder-Smokes vorbereiten.

Forbidden:
- Unverwandte Modul-Refactors.
- Neue Notification-Frameworks oder Dependencies.
- Reminder-Verhalten pro Teilmodul separat neu erfinden.

## Execution Mode
- Sequenziell arbeiten (`S1` bis `S6`).
- `S1` bis `S3` klaeren Ist-Stand, Produktvertrag und Notification-Vertrag.
- `S4` und `S5` ziehen den externen Push-Pfad und den Scheduler-Vertrag gerade.
- Erst `S6` ist der konkrete Umbau in Repo und Backend.
- Nach jedem Schritt Statusmatrix aktualisieren.
- Nach jedem Schritt mindestens ein Check: Contract-Review, Repo-Scan, Syntaxcheck oder Smoke-Definition.
- Jeder Hauptschritt endet mit denselben operativen Pflichtpunkten:
  - Schritt-Abnahme
  - Doku-Sync
  - Commit-Empfehlung

## Vorgeschlagene fachliche Default-Richtung
Medication:
- Abschnittsstart bleibt fachlich erhalten.
- Push aber nicht mehr direkt zum Abschnittsstart.
- Erste Stufe als sanfter Reminder.
- Zweite Stufe als spaeterer Incident.

Hinweis:
- Die folgenden Werte waren der fruehe Startpunkt fuer `S2`.
- Der verbindliche Produktvertrag steht weiter unten in `S2.2`.

Frueher Startpunkt fuer Diskussion:
- `morning`
  - `section_start`: `06:00`
  - `gentle_reminder_after`: `09:30`
  - `incident_after`: `11:30`
- `noon`
  - `section_start`: `11:00`
  - `gentle_reminder_after`: `13:30`
  - `incident_after`: `15:30`
- `evening`
  - `section_start`: `17:00`
  - `gentle_reminder_after`: `19:30`
  - `incident_after`: `21:30`
- `night`
  - `section_start`: `21:00`
  - `gentle_reminder_after`: `22:30`
  - `incident_after`: optional spaeter oder bewusst schwach halten

Diese Fruehwerte sind bewusst nur historischer Ausgangspunkt und nicht mehr der finale Beschluss.

## Statusmatrix
| ID | Schritt | Status | Ergebnis/Notiz |
|---|---|---|---|
| S1 | Ist-Analyse des aktuellen Reminder-/Incident-Verhaltens | DONE | `S1.1` bis `S1.6` abgeschlossen: lokale Medication-Pushes feuern derzeit exakt zum Abschnittsbeginn (`06/11/17/21`) und werden technisch als harte Incidents gebaut; der repo-lokale Remote-Hinweis ist separat und aktuell nur grob anschlussfaehig dokumentiert. |
| S2 | Produktvertrag fuer sanfte Medication-Reminder finalisieren | DONE | `S2.1` bis `S2.8` abgeschlossen: Medication wird fachlich in `reminder` und spaeteren `incident` getrennt, die neuen Abschnitts-Schwellen sind final festgezogen, die Copy ist auf `noch nicht erfasst` statt sofortiges Versaeumnis umgestellt, und BP bleibt bewusst incident-orientierter als Medication. |
| S3 | Notification-/Service-Worker-Vertrag fuer `reminder` vs `incident` festziehen | DONE | `S3.1` bis `S3.7` abgeschlossen: Severity wird explizit ueber `data.severity` transportiert, Typ und Severity werden sauber getrennt, Reminder- und Incident-Tags bekommen eigene Namespaces, der Service Worker reagiert stufenbezogen, und der spaetere Remote-Pfad ist auf denselben Payload-Vertrag festgezogen. |
| S4 | Externen Incident-Push-Vertrag und Datenquelle finalisieren | DONE | `S4.1` bis `S4.7` abgeschlossen: Die aktuelle Edge Function ist als Legacy-Pfad identifiziert, der externe Medication-Read-Vertrag wird slot-/abschnittsbasiert direkt ueber Tabellen und Slot-Events definiert, `med_list_v2` ist fuer den service-role-Pfad bewusst nicht die Source of Truth, und der Remote-Payload wird auf denselben Typ-/Severity-/Tag-Vertrag wie lokal festgezogen. |
| S5 | Scheduler-, Takt- und Dedupe-Strategie fuer echten Off-App-Push festziehen | DONE | `S5.1` bis `S5.8` abgeschlossen: Der Scheduler wird zu einem regelmaessigen UTC-Tick mit lokaler Zeitlogik in der Edge Function, Off-App-Dedupe wird persistent pro `user/day/type/severity/source` abgesichert, Catch-up sendet immer nur die hoechste aktuell faellige Stufe, und Remote wird bei vorhandener Subscription der primaere System-Push-Pfad. |
| S6 | Umbau in Repo, Backend, QA und Doku-Sync umsetzen | DONE | `S6.1` bis `S6.13` abgeschlossen: Remote-Dedupe-/Health-Persistenz ist angelegt, die lokale Incident-Engine arbeitet mit gestaffelten Medication-Schwellen, lokale Medication-Payloads tragen Severity und getrennte Tag-Namespaces, der Service Worker wertet `data.severity` primaer aus, die Edge Function liest Medication slot-/abschnittsbasiert mit persistentem Remote-Dedupe sowie Subscription-Health-Updates, der Workflow liefert den `30`-Minuten-Takt mit `window=all`, lokale Pushes werden nur bei gesundem Remote-Pfad unterdrueckt, und Doku/QA spiegeln jetzt denselben finalen Vertrag. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Wiederkehrende Abschluss-Substeps pro Hauptschritt
Diese Abschluss-Substeps gelten fuer jeden Hauptschritt `S1` bis `S6` und sollen jeweils als letzte Substeps mitgefuehrt werden.

- `letzter fachlicher Substep + 1: Schritt-Abnahme`
  - Ergebnis gegen den Ziel-Contract des Schritts pruefen
  - betroffene Dateien auf Reminder-Drift und potenziellen Dead Code pruefen
  - gezielte Contract-/Syntax-/Smoke-Checks fuer den Schritt ausfuehren
- `danach: Doku-Sync`
  - betroffene Modul-Overviews sofort aktualisieren, wenn sich Verhalten oder Guardrails geaendert haben
  - bei Bedarf auch `docs/QA_CHECKS.md` und angrenzende Roadmaps nachziehen
- `danach: Commit-Empfehlung`
  - explizit festhalten, ob nach dem Schritt ein Commit sinnvoll ist
  - wenn `kein Commit`, kurz begruenden, was noch logisch zusammengehoert

## Schritte + Subschritte

### S1 - Ist-Analyse des aktuellen Reminder-/Incident-Verhaltens
- S1.1 Aktuelle Medication-Cutoffs, Trigger und One-shot-Logik in `app/modules/incidents/index.js` exakt mappen.
- S1.2 Service Worker auf heutige Incident-Erkennung und Notification-Schaerfe pruefen.
- S1.3 Lokal vs. Remote sauber trennen:
  - was ist im Repo steuerbar
  - was liegt im externen Scheduler-/Edge-Function-Vertrag
- S1.4 Bestehende Reminder-Texte und ihre Schaerfe aufnehmen.
- S1.5 Schritt-Abnahme:
  - Repo-Scan auf alle Medication-Push-Typen, Zeiten und Incident-Annahmen
  - Ergebnis mit Dateireferenzen und Risikostellen festhalten
- S1.6 Doku-Sync:
  - falls die Push-Doku den Ist-Stand unscharf beschreibt, direkt korrigieren oder markieren
- S1.7 Commit-Empfehlung:
  - festhalten, ob reine Analyse-/Doku-Korrekturen schon commit-wuerdig sind oder mit `S2` gebuendelt werden
- Output: belastbare Karte der aktuellen Push-Schaerfe und aller beteiligten Vertrage.
- Exit-Kriterium: kein unbekannter lokaler Medication-Reminder-Pfad mehr offen.

#### S1 Ergebnisprotokoll (abgeschlossen)

##### S1.1 Aktuelle Medication-Cutoffs, Trigger und One-shot-Logik
- `app/modules/incidents/index.js`
  - Die lokale Incident-Engine kennt feste Abschnitts-Cutoffs:
    - `morning`: `06:00`
    - `noon`: `11:00`
    - `evening`: `17:00`
    - `night`: `21:00`
  - `getCurrentMedicationSection()` leitet den aktiven Abschnitt rein aus der lokalen Uhrzeit ab.
  - `shouldPushMedicationSection(section)` pusht nur dann, wenn:
    - fuer den aktuell aktiven Abschnitt offene Slots existieren
    - derselbe Abschnitt exakt der aktuell laufende Tagesabschnitt ist
  - Konsequenz:
    - offene Morning-Slots gelten ab `06:00` bereits als push-relevant
    - offene Noon-Slots ab `11:00`
    - offene Evening-Slots ab `17:00`
    - offene Night-Slots ab `21:00`
- One-shot-Logik:
  - pro Abschnitt wird ueber `state.sent.medication.{morning,noon,evening,night}` genau ein Push pro Tag verhindert
  - Tageswechsel resettet diese Flags komplett
  - die Engine prueft zusaetzlich minuetlich ueber `setInterval(..., 60 * 1000)`
- Input-Pfade:
  - `medication:changed`
  - `visibilitychange`
  - Initial-Load
  - minuetlicher Tick
- Aktueller Medication-Vertrag:
  - Medication wird lokal nicht als spaete Ueberfaelligkeit behandelt
  - sondern bereits als Incident ab Abschnittsbeginn

##### S1.2 Service Worker: Incident-Erkennung und Notification-Schaerfe
- `service-worker.js`
  - Der Service Worker behandelt folgende Typen als Incident:
    - `medication_morning`
    - `medication_noon`
    - `medication_evening`
    - `medication_night`
    - `medication_daily_open` als Legacy-Fallback
    - `bp_evening`
  - Zusaetzlich gilt jedes Notification-Tag mit Prefix `midas-incident-` als Incident.
- Incident-Darstellung im Worker:
  - wenn kein anderes Payload-Feld gesetzt ist:
    - `silent = false`
    - `vibrate = [300,150,300,150,600]`
    - `requireInteraction = true`
    - Action `Jetzt oeffnen`
- Lokaler Medication-Payload verstaerkt das nochmals:
  - `app/modules/incidents/index.js` baut lokale Notifications bereits explizit mit:
    - `silent: false`
    - `requireInteraction: true`
    - `vibrate`
    - `actions`
- Fazit:
  - Medication ist heute nicht nur zeitlich frueh
  - sondern auch technisch wie ein harter Incident praesentiert

##### S1.3 Lokal vs. Remote: repo-steuerbar und extern getrennt
- Repo-lokal steuerbar:
  - `app/modules/incidents/index.js`
  - `service-worker.js`
  - `app/core/pwa.js`
  - Client-Subscription-Flow im Profil (`push_subscriptions`, Permission, Service-Worker-Ready)
- Externer bzw. nur angebundener Teil:
  - `.github/workflows/incidents-push.yml` triggert eine externe Edge Function ueber `INCIDENTS_PUSH_URL`
  - die eigentliche Edge Function `midas-incident-push` liegt nicht in diesem Repo
- Aktueller Workflow-Hinweis:
  - Cron um `09:00 UTC` fuer `WINDOW=med`
  - Cron um `20:00 UTC` fuer `WINDOW=bp`
  - Kommentar im Workflow referenziert `10:00 Europe/Vienna` bzw. `21:00 Europe/Vienna` als Winterzeit-Approximation
- Konsequenz fuer diese Roadmap:
  - die repo-lokale Push-Schaerfe ist direkt aenderbar
  - der spaetere Remote-Follow-up muss separat mitgezogen werden
  - ist aber fuer `S1` sauber identifiziert und nicht mehr unsichtbar

##### S1.4 Bestehende Reminder-Texte und ihre Schaerfe
- Medication-Copy in `app/modules/incidents/index.js` ist derzeit klar incident-lastig:
  - `Morgen-Medikation offen`
  - `Bitte die offenen Morgen-Einnahmen jetzt bestaetigen.`
  - analog fuer `Mittag`, `Abend`, `Nacht`
- BP-Copy ist ebenfalls direktiv:
  - `Abend-Blutdruck fehlt`
  - `Bitte den Blutdruck fuer heute Abend jetzt messen.`
- Produktwirkung:
  - die Texte klingen nicht wie spaete, freundliche Adherence-Reminder
  - sondern wie klare Incident-/Versaeumnis-Meldungen
- Erkenntnis:
  - das Problem sitzt nicht nur in den Uhrzeiten
  - sondern ebenso in Sprache und Notification-Praesentation

##### S1.5 Schritt-Abnahme: aktuelle Risikostellen
- Hauptbruch fuer Medication:
  - der Abschnittsbeginn ist heute faktisch gleichgesetzt mit Incident-Relevanz
- Notification-Risiko:
  - Service Worker und lokaler Builder behandeln Medication wie BP-artige harte Incidents
- Doku-Risiko:
  - das Push-Overview spricht stellenweise von `sanftem Hinweis` bzw. historisch ruhigen Incidents, waehrend der aktuelle Code bereits hoerbar und persistent ist
- Remote-Risiko:
  - der externe Scheduler-/Edge-Function-Pfad ist nur grob dokumentiert und kann ohne spaeteren Nachzug vom lokalen Severity-Vertrag abdriften
- Repo-Scan-Ergebnis:
  - fuer Medication wurden keine weiteren produktiven lokalen Reminder-Pfade ausser `app/modules/incidents/index.js` plus `service-worker.js` gefunden
  - der lokale Scope fuer den Umbau ist damit klar eingegrenzt

##### S1.6 Doku-Sync
- `docs/modules/Push Module Overview.md`
  - Status-Hinweis bleibt im Kern korrekt:
    - repo-lokal abschnittsbezogene Medication-Incidents
    - externer Remote-Vertrag getrennt
  - Abschnitt `15. Incident Alert Tuning Notiz` war jedoch fachlich veraltet:
    - dort stand noch `Lokale Incidents setzen im Client derzeit silent: true`
    - der aktuelle Code sendet lokal bereits `silent: false`, `requireInteraction: true`, `vibrate` und `actions`
- Durchgefuehrte Korrektur:
  - die Tuning-Notiz wurde auf den realen Ist-Stand korrigiert und markiert jetzt klar, dass Medication aktuell technisch nicht ruhig ausgesteuert ist
- Ergebnis:
  - die Roadmap und die Push-Doku sprechen jetzt denselben Ist-Stand

### S2 - Produktvertrag fuer sanfte Medication-Reminder finalisieren
- S2.1 Festlegen, dass Medication fachlich zwischen `reminder` und `incident` unterscheidet.
- S2.2 Pro Abschnitt die neuen Schwellwerte finalisieren:
  - `section_start`
  - `gentle_reminder_after`
  - `incident_after`
- S2.3 Festlegen, welche Medication-Faelle nur sanft bleiben und welche spaeter incident-scharf werden duerfen.
- S2.4 Reminder-Copy und Incident-Copy fuer Medication trennen.
- S2.5 BP explizit gegen Medication abgrenzen:
  - bleibt strenger
  - oder wird textlich mit angepasst
- S2.6 Schritt-Abnahme:
  - Produktvertrag auf Alltagstauglichkeit, Ruhe und Konsistenz gegen MIDAS-Guardrails pruefen
- S2.7 Doku-Sync:
  - Zielvertrag in dieser Roadmap und bei Bedarf im Push-Overview klar nachziehen
- S2.8 Commit-Empfehlung:
  - festhalten, ob der fachliche Reminder-Vertrag separat commitbar ist
- Output: eindeutiger Produktvertrag fuer sanfte Medication-Erinnerungen.
- Exit-Kriterium: keine offene Fachfrage mehr zu Zeiten, Sprache oder Severity-Stufen.

#### S2 Ergebnisprotokoll (abgeschlossen)

##### S2.1 Fachlicher Severity-Vertrag fuer Medication
- Medication kennt kuenftig zwei fachliche Stufen:
  - `reminder`
  - `incident`
- Produktregel:
  - `reminder` ist die erste, freundliche Nachfrage bei plausibler Verspaetung
  - `incident` ist die spaetere zweite Stufe, wenn derselbe Abschnitt weiterhin offen ist
- Bewusste Abgrenzung:
  - Medication wird nicht mehr schon beim Abschnittsbeginn als Incident interpretiert
  - der Abschnittsbeginn bleibt fachlicher Kontext, aber nicht mehr Push-Schwelle
- MIDAS-Formulierung:
  - `reminder` bedeutet fachlich `noch nicht erfasst / bitte kurz pruefen`
  - `incident` bedeutet fachlich `weiterhin offen / jetzt bewusst nachfassen`

Festlegung:
- Der Medication-Pfad wird von `frueher Incident` auf `gestaffelter Reminder -> spaeterer Incident` umgestellt.

##### S2.2 Finale Schwellwerte pro Abschnitt
- Fuer V1 gelten folgende festen Produktdefaults:
  - `morning`
    - `section_start`: `06:00`
    - `gentle_reminder_after`: `10:00`
    - `incident_after`: `12:00`
  - `noon`
    - `section_start`: `11:00`
    - `gentle_reminder_after`: `14:00`
    - `incident_after`: `16:00`
  - `evening`
    - `section_start`: `17:00`
    - `gentle_reminder_after`: `20:00`
    - `incident_after`: `22:00`
  - `night`
    - `section_start`: `21:00`
    - `gentle_reminder_after`: `22:30`
    - `incident_after`: `23:30`
- Produktlogik:
  - vor `gentle_reminder_after` kein Medication-Push
  - zwischen `gentle_reminder_after` und `incident_after` nur `reminder`
  - ab `incident_after` nur dann `incident`, wenn der Abschnitt weiterhin offen ist

Festlegung:
- Diese Zeiten sind keine UI-Idee mehr, sondern der verbindliche V1-Produktvertrag fuer den kommenden Umbau.

##### S2.3 Welche Medication-Faelle sanft bleiben und welche escalieren duerfen
- Alle vier Medication-Abschnitte duerfen von `reminder` auf `incident` escalieren:
  - `morning`
  - `noon`
  - `evening`
  - `night`
- Es gibt aber bewusst nur eine einzige Eskalationsstufe:
  - maximal ein `reminder`
  - maximal ein spaeterer `incident`
  - keine dritte Eskalation, kein Follow-up-Loop, kein Reminder-Stakkato
- Produktregel:
  - Medication bleibt auch im `incident`-Fall ein Alltags-Auffangnetz
  - nicht ein Alarm- oder Strafsystem

Festlegung:
- V1 fuehrt keine Sonderbehandlung ein, bei der einzelne Abschnitte nur `reminder` und andere immer `incident` waeren.
- Die Unterschiede zwischen `reminder` und `incident` liegen in Timing, Copy und Notification-Schaerfe, nicht in der Existenz der Stufe selbst.

##### S2.4 Reminder-Copy vs. Incident-Copy fuer Medication
- Reminder-Copy darf nicht behaupten, dass die Einnahme sicher versaeumt wurde.
- Der Reminder spricht deshalb ueber Erfassung bzw. offene Bestaetigung, nicht ueber gesichertes Fehlverhalten.

Verbindliche Reminder-Copy:
- Titel-Schema:
  - `Morgenmedikation noch nicht erfasst?`
  - `Mittagmedikation noch nicht erfasst?`
  - `Abendmedikation noch nicht erfasst?`
  - `Nachtmedikation noch nicht erfasst?`
- Body-Schema:
  - `Falls noch offen: bitte kurz bestaetigen.`

Verbindliche Incident-Copy:
- Titel-Schema:
  - `Morgenmedikation weiterhin offen`
  - `Mittagmedikation weiterhin offen`
  - `Abendmedikation weiterhin offen`
  - `Nachtmedikation weiterhin offen`
- Body-Schema:
  - `Bitte jetzt pruefen und bestaetigen.`

Produktregel:
- `reminder` = fragend und entlastend
- `incident` = klarer, aber weiterhin sachlich und nicht strafend

##### S2.5 BP bewusst gegen Medication abgrenzen
- BP bleibt in dieser Roadmap bewusst strenger als Medication.
- V1-Entscheid fuer BP:
  - kein neuer sanfter Vorab-Reminder in diesem Umbau
  - weiterhin ein einzelner abendlicher Incident-orientierter Push
- Zeitvertrag fuer BP bleibt vorerst:
  - `bp_evening` ab `20:00`
- Sprachliche Schaerfung:
  - BP darf klarer bleiben als Medication, soll aber nicht unnoetig aggressiv formuliert sein

Verbindliche BP-Copy fuer den Zielvertrag:
- Titel:
  - `Abend-Blutdruck noch offen`
- Body:
  - `Falls noch ausstehend: bitte heute Abend noch messen.`

Festlegung:
- Medication wird aktiv weicher und spaeter.
- BP bleibt als Tagesabschluss-Signal bewusst incident-orientierter.

##### S2.6 Schritt-Abnahme: Alltagstauglichkeit und Guardrails
- Der Vertrag passt zu den MIDAS-Guardrails:
  - weniger frueher Druck
  - weniger Reminder-Laerm
  - mehr reales Auffangen von Drift statt Alarm beim Abschnittsstart
- Der Vertrag bleibt technisch pragmatisch:
  - keine freie Personalisierung
  - keine komplexen Wochen-/Deadline-Modelle
  - keine neue medizinische Logik
- Der Vertrag bleibt kompatibel mit dem aktuellen Abschnittsmodell:
  - `morning/noon/evening/night` bleiben bestehen
  - pro Abschnitt kann weiterhin auf offene Slots geprueft werden
  - der Umbau liegt jetzt primaer in Severity, Timing, Copy und Service-Worker-Vertrag

Schritt-Abnahme:
- Der neue Medication-Reminder-Vertrag ist alltagstauglich, ruhig und konsistent genug, um `S3` technisch abzuleiten.

##### S2.7 Doku-Sync
- Diese Roadmap ist ab jetzt die kanonische Zielquelle fuer den sanften Medication-Reminder-Vertrag.
- Weitere Modul-Overviews werden in `S2` bewusst noch nicht auf den Zielzustand umgeschrieben.
- Grund:
  - `S2` definiert den kommenden Produktvertrag
  - aendert aber noch nicht den produktiven Laufzeitstand
- Doku-Regel fuer spaeter:
  - erst mit `S6` werden `Push Module Overview`, `QA_CHECKS` und ggf. angrenzende Medication-/Intake-Doku auf den echten neuen Runtime-Stand gezogen

##### S2.8 Commit-Empfehlung
- Ja, `S1 + S2` waeren gemeinsam als Analyse- plus Produktvertragsblock commit-wuerdig.
- Grund:
  - die Ist-Analyse und der neue Zielvertrag bilden zusammen ein geschlossenes Paket
  - `S3` ist danach ein neuer technischer Ableitungsblock

### S3 - Notification-/Service-Worker-Vertrag fuer `reminder` vs `incident` festziehen
- S3.1 Entscheiden, wie Severity technisch transportiert wird:
  - explizites Feld wie `severity`
  - oder eindeutig ableitbar aus `type`
- S3.2 Festlegen, wie der Service Worker pro Severity reagieren soll:
  - `reminder`: keine harte Incident-Praesentation
  - `incident`: Vibrate, Actions, ggf. `requireInteraction`
- S3.3 Rueckwaertskompatibilitaet fuer bestehende Incident-Typen sauber definieren.
- S3.4 Optionalen Remote-Follow-up-Vertrag dokumentieren, ohne den externen Teil nur zu behaupten.
- S3.5 Schritt-Abnahme:
  - Notification-Vertrag auf Eindeutigkeit, Driftfreiheit und spaetere Remote-Anschlussfaehigkeit pruefen
- S3.6 Doku-Sync:
  - Push-Overview auf den finalen Notification-Vertrag vorbereiten
- S3.7 Commit-Empfehlung:
  - festhalten, ob der technische Payload-/SW-Vertrag separat commitbar ist oder logisch mit `S4`/`S5` zusammengehoert
- Output: klarer Notification-Vertrag fuer Reminder und Incidents.
- Exit-Kriterium: kein offener Interpretationsspielraum mehr, wann eine Medication-Notification sanft oder hart erscheint.

#### S3 Ergebnisprotokoll (abgeschlossen)

##### S3.1 Severity wird explizit transportiert
- Entscheidung:
  - Severity wird nicht mehr indirekt aus `type` geraten
  - sondern explizit im Notification-Payload transportiert
- Verbindlicher Payload-Vertrag:
  - `title`
  - `body`
  - `tag`
  - `data.type`
  - `data.severity`
  - `data.dayIso`
  - `data.source`
- Gueltige Severity-Werte fuer V1:
  - `reminder`
  - `incident`
- Produktregel:
  - `type` beschreibt weiterhin den fachlichen Kontext
  - `severity` beschreibt die Darreichung

Festlegung:
- Medication-Payloads behalten ihren Abschnittstyp, bekommen aber zusaetzlich eine explizite Severity.

##### S3.2 Typ und Severity werden sauber getrennt
- Verbindliche Medication-Typen bleiben:
  - `medication_morning`
  - `medication_noon`
  - `medication_evening`
  - `medication_night`
- Verbindlicher BP-Typ bleibt:
  - `bp_evening`
- Produktregel:
  - derselbe `type` darf in unterschiedlicher `severity` auftreten
  - Beispiel:
    - `data.type = medication_morning`
    - `data.severity = reminder`
    - spaeter am selben Tag:
      - `data.type = medication_morning`
      - `data.severity = incident`
- Grund fuer diese Trennung:
  - die fachliche Auswertung bleibt abschnittsbezogen
  - die Notification-Schaerfe wird nicht ueber proliferierende Typnamen wie `medication_morning_reminder` modelliert
  - der spaetere Remote-Pfad bleibt kompakter und klarer

Festlegung:
- Kein neuer Wildwuchs an Notification-Typen.
- `type` = Fachfall, `severity` = Aussteuerung.

##### S3.3 Tag-Namespace und Anzeigeverhalten
- Der Service Worker soll Reminder und Incident nicht ueber denselben Tag automatisch gleich behandeln.
- Verbindliche Tag-Regel:
  - Reminder:
    - `midas-reminder-<type>-<dayIso>`
  - Incident:
    - `midas-incident-<type>-<dayIso>`
- Beispiele:
  - `midas-reminder-medication_morning-2026-03-27`
  - `midas-incident-medication_morning-2026-03-27`
- Produktwirkung:
  - Reminder und Incident sind technisch sauber unterscheidbar
  - der Service Worker kann Incident-Defaults weiter ueber den Incident-Namespace erkennen
  - ein spaeterer Incident muss nicht dieselbe Darstellung wie ein frueher Reminder erben

Festlegung:
- Tag-Prefix wird Teil des Severity-Vertrags und nicht nur ein kosmetisches Detail.

##### S3.4 Service-Worker-Vertrag pro Severity
- Fuer `reminder` gilt in V1:
  - keine Incident-Defaults
  - `silent` wird nicht zwangsweise auf `false` gezogen
  - keine automatische `vibrate`
  - kein automatisches `requireInteraction`
  - keine automatischen Incident-Actions
- Fuer `incident` gilt in V1:
  - deutlichere Wahrnehmbarkeit ist erlaubt
  - `vibrate` ist zulaessig
  - `requireInteraction` ist zulaessig
  - `actions` sind zulaessig
  - `silent: false` bleibt fuer echte Incidents zulaessig
- Verbindliche Service-Worker-Regel:
  - zuerst auf `data.severity` pruefen
  - nur wenn `severity` fehlt, darf auf Legacy-Heuristiken zurueckgefallen werden

Festlegung:
- `severity` wird die primaere Source of Truth fuer Notification-Schaerfe.
- Typlisten und Tag-Heuristiken werden im neuen Vertrag nur noch als Rueckwaertskompatibilitaet gebraucht.

##### S3.5 Rueckwaertskompatibilitaet
- Bestehende oder externe Payloads ohne `data.severity` muessen weiterhin lesbar bleiben.
- Verbindliche Legacy-Regel:
  - wenn `data.severity` fehlt und
    - `tag` mit `midas-incident-` beginnt
    - oder `type` zu den bekannten Incident-Typen gehoert
  - dann behandelt der Service Worker die Notification weiterhin als `incident`
- Betroffene Legacy-Typen:
  - `medication_morning`
  - `medication_noon`
  - `medication_evening`
  - `medication_night`
  - `medication_daily_open`
  - `bp_evening`
- Produktregel:
  - neue lokale Payloads sollen immer `severity` tragen
  - Legacy-Heuristik ist nur Uebergangs- und Kompatibilitaetspfad

Festlegung:
- Der Umbau bleibt rueckwaertskompatibel, aber der neue Vertrag ist explizit und fuehrt weg von impliziter Incident-Erkennung.

##### S3.6 Optionaler Remote-Follow-up-Vertrag
- Der externe Incident-Pfad liegt nicht in diesem Repo, soll aber denselben Payload-Vertrag sprechen.
- Minimaler Zielvertrag fuer spaetere Remote-Payloads:
  - `title`
  - `body`
  - `tag`
  - `data.type`
  - `data.severity`
  - `data.dayIso`
  - `data.source = remote`
- Produktregel:
  - Remote-Medication-Reminder und Remote-Medication-Incidents muessen dieselben Severity-Regeln verwenden wie lokal
  - der Service Worker darf fuer lokale und Remote-Payloads nicht zwei unterschiedliche Fachvertraege haben
- Bewusste Grenze:
  - diese Roadmap behauptet keine externe Implementierung
  - sie fixiert nur den Vertrag, auf den der externe Pfad spaeter gezogen werden muss

##### S3.7 Schritt-Abnahme, Doku-Sync und Commit-Empfehlung
- Schritt-Abnahme:
  - Der Notification-Vertrag ist eindeutig:
    - `type` fuer Fachfall
    - `severity` fuer Notification-Schaerfe
    - Tag-Namespace passend zur Severity
  - Der Vertrag ist driftarm:
    - lokal und spaeter remote anschlussfaehig
    - Service Worker muss neue Reminder nicht mehr ueber Incident-Heuristiken raten
  - Der Vertrag ist kompatibel:
    - bestehende Incident-Payloads ohne `severity` bleiben lesbar
- Doku-Sync:
  - Diese Roadmap ist jetzt die kanonische Quelle fuer den technischen Severity-Vertrag.
  - Modul-Overviews werden bewusst erst in `S6` auf den echten Laufzeitstand nachgezogen.
- Commit-Empfehlung:
  - Ja, `S1` bis `S3` waeren als Analyse-, Produkt- und Technikvertragsblock gemeinsam commit-wuerdig.
  - Fuer den laufenden Arbeitsmodus bleibt der eigentliche Repo- und Backend-Umbau aber bewusst in `S6` gebuendelt.

### S4 - Externen Incident-Push-Vertrag und Datenquelle finalisieren
- S4.1 Die aktuelle Edge Function `midas-incident-push` gegen den heutigen Medication-Kern pruefen:
  - alte Tages-Boolean-Annahmen
  - alte Typen
  - alte Copy
  - alte Payload-Schaerfe
- S4.2 Den fachlichen Read-Vertrag fuer den externen Push-Pfad festziehen:
  - keine Nutzung von `health_medication_doses`
  - slot-/abschnittsbasiertes Read-Model
  - BP bleibt eigener Read-Pfad
- S4.3 Festlegen, ob die Edge Function direkt gegen Tabellen liest oder einen bestehenden/neuen SQL-/RPC-Vertrag nutzt.
- S4.4 Den externen Payload-Vertrag auf dieselben Typen, Severity-Werte und Tag-Namespaces wie lokal ziehen.
- S4.5 Schritt-Abnahme:
  - externer Incident-Pfad auf Konsistenz gegen Medication-Modell und lokalen Payload-Vertrag pruefen
- S4.6 Doku-Sync:
  - diese Roadmap um den finalen Backend-Vertrag erweitern; Modul-Doku bleibt bis `S6` noch beim Ist-/Zielmix
- S4.7 Commit-Empfehlung:
  - festhalten, ob der externe Vertragsblock separat commitbar ist oder logisch mit `S5` zusammengehoert
- Output: klarer fachlicher und technischer Vertrag fuer die Edge Function `midas-incident-push`.
- Exit-Kriterium: kein offener Widerspruch mehr zwischen lokalem Medication-Modell und externem Push-Read-/Payload-Pfad.

#### S4 Ergebnisprotokoll (abgeschlossen)

##### S4.1 Ist-Stand der Edge Function gegen den heutigen Medication-Kern
- `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-incident-push/index.ts`
  - Medication wird aktuell nur als ein einziger alter Fernfall behandelt:
    - Typ `medication_morning`
    - Trigger `hour >= 10`
  - Die Funktion liest Medication noch ueber:
    - `health_medications`
    - `health_medication_doses`
  - Das ist fachlich Legacy:
    - `health_medication_doses` gehoert zum alten Tages-Boolean-Modell
    - der aktuelle produktive Medication-Kern arbeitet mit:
      - `health_medication_schedule_slots`
      - `health_medication_slot_events`
      - `slot_type`
  - Remote-Payload ist ebenfalls Legacy:
    - kein `data.severity`
    - nur Incident-Tag
    - `silent: true`
    - Copy noch auf altem Tagesvertrag
- BP ist im Remote-Pfad separat und fachlich noch einfacher:
  - `bp_evening`
  - Trigger `hour >= 20`
  - Read ueber `v_events_bp`

Festlegung:
- Die aktuelle Edge Function ist fuer Medication ein Legacy-Pfad und darf nicht als bereits passender Zielstand behandelt werden.

##### S4.2 Finaler fachlicher Read-Vertrag fuer externen Medication-Push
- Der externe Medication-Pfad liest kuenftig nicht mehr `offener Tagesstatus`, sondern offene Slots je Abschnitt.
- Verbindliche Read-Grundlage:
  - `health_medications`
    - nur `active = true`
  - `health_medication_schedule_slots`
    - nur aktive Slots des Nutzers
    - nur Slots mit:
      - `start_date <= dayIso`
      - `end_date is null or end_date >= dayIso`
  - `health_medication_slot_events`
    - linker Abgleich auf denselben Tag
    - offene Slots sind Slots ohne bestaetigtes Event fuer `dayIso`
- Erforderliches Read-Ergebnis fuer die Funktion:
  - offene Slot-Gruppen je `slot_type`
  - mindestens boolscher Status pro Abschnitt:
    - `morning`
    - `noon`
    - `evening`
    - `night`
- Produktregel:
  - der externe Push-Pfad braucht fuer Reminder-/Incident-Entscheidungen nicht den kompletten UI-Read-Stack
  - aber denselben fachlichen Medication-Zustand wie der lokale Incident-Pfad

Festlegung:
- Extern gilt derselbe fachliche Medication-Zustand wie lokal: `offene Slots pro Abschnitt fuer den konkreten Tag`.

##### S4.3 Direkte Tabellen-Reads statt `med_list_v2`
- Entscheidung:
  - Die Edge Function nutzt fuer Medication keinen direkten Call auf `med_list_v2`.
- Begruendung:
  - `med_list_v2(p_day)` ist auf `auth.uid()` als Laufzeitnutzer gebaut
  - die Edge Function laeuft mit service-role-Kontext und iteriert explizit ueber Zielnutzer
  - fuer diesen Off-App-Pfad ist ein impliziter `auth.uid()`-Vertrag kein sauberer Backend-Read-Contract
- Verbindliche Richtung fuer `S6`:
  - entweder direkte Tabellen-Reads in der Edge Function
  - oder ein neuer expliziter service-role-tauglicher SQL-Vertrag mit `p_user_id`
- V1-Entscheid fuer diese Roadmap:
  - bevorzugt direkte Tabellen-Reads in der Edge Function
  - kein Umbau von `med_list_v2` zur Source of Truth fuer den Scheduler-Pfad

Festlegung:
- `med_list_v2` bleibt UI-/Client-Read-Model.
- Der externe Incident-Pfad bekommt einen eigenen klaren slot-/abschnittsbasierten Backend-Read-Vertrag.

##### S4.4 Externer Payload-Vertrag wird auf lokalen Vertrag gezogen
- Remote-Payloads fuer Medication und BP muessen kuenftig dieselben Kernfelder tragen wie lokal:
  - `title`
  - `body`
  - `tag`
  - `data.type`
  - `data.severity`
  - `data.dayIso`
  - `data.source = remote`
- Medication-Typen bleiben:
  - `medication_morning`
  - `medication_noon`
  - `medication_evening`
  - `medication_night`
- BP-Typ bleibt:
  - `bp_evening`
- Tag-Regel bleibt identisch:
  - Reminder:
    - `midas-reminder-<type>-<dayIso>`
  - Incident:
    - `midas-incident-<type>-<dayIso>`
- Produktregel:
  - Lokal und remote duerfen sich nur in `source`, nicht im fachlichen Payload-Vertrag unterscheiden

Festlegung:
- Der Service Worker soll fuer lokale und externe Payloads denselben Severity- und Tag-Vertrag lesen koennen.

##### S4.5 Copy- und Severity-Vertrag fuer externen Medication-Push
- Der externe Medication-Push uebernimmt dieselbe Copy-Trennung wie lokal:
  - `reminder`
    - Titel:
      - `Morgenmedikation noch nicht erfasst?`
      - `Mittagmedikation noch nicht erfasst?`
      - `Abendmedikation noch nicht erfasst?`
      - `Nachtmedikation noch nicht erfasst?`
    - Body:
      - `Falls noch offen: bitte kurz bestaetigen.`
  - `incident`
    - Titel:
      - `Morgenmedikation weiterhin offen`
      - `Mittagmedikation weiterhin offen`
      - `Abendmedikation weiterhin offen`
      - `Nachtmedikation weiterhin offen`
    - Body:
      - `Bitte jetzt pruefen und bestaetigen.`
- BP bleibt im externen Pfad bewusst eigener Fall:
  - Titel:
    - `Abend-Blutdruck noch offen`
  - Body:
    - `Falls noch ausstehend: bitte heute Abend noch messen.`

Festlegung:
- Externe Pushes duerfen sprachlich keinen alten Tages-Boolean- oder Legacy-Incident-Vertrag mehr transportieren.

##### S4.6 Schritt-Abnahme und Doku-Sync
- Schritt-Abnahme:
  - Der externe Medication-Pfad ist jetzt fachlich sauber an den heutigen Medication-Kern angeschlossen:
    - keine `health_medication_doses`
    - keine Tages-Boolean-Semantik
    - keine Morning-only-Reduktion
  - Der Payload-Vertrag ist deckungsgleich mit dem lokalen Severity-Modell
  - Die offene Restfrage liegt nicht mehr im Daten- oder Payload-Vertrag, sondern in Scheduler-/Dedupe-Strategie
- Doku-Sync:
  - Diese Roadmap ist jetzt auch die kanonische Quelle fuer den externen Incident-Push-Vertrag.
  - Modul-Doku bleibt bewusst bis `S6` beim noch nicht umgesetzten Ist-/Zielmix.

##### S4.7 Commit-Empfehlung
- Ja, `S4` ist fachlich als eigener Vertragsblock commit-wuerdig.
- Fuer den aktuellen Arbeitsmodus ist es aber logisch, `S4` direkt mit `S5` weiterzufuehren, weil erst danach klar ist, wie echter Off-App-Push taktet und Duplikate verhindert.

### S5 - Scheduler-, Takt- und Dedupe-Strategie fuer echten Off-App-Push festziehen
- S5.1 Entscheiden, wie der Scheduler den Push ausserhalb der App wirklich ausloest:
  - feste Einzel-Crons pro Fenster
  - oder regelmaessiger Takt mit Funktionslogik in lokaler Zeitzone
- S5.2 Festlegen, wo die eigentliche Zeitentscheidung lebt:
  - nicht im Workflow allein
  - sondern fachlich nachvollziehbar in der Incident-Logik / Edge Function
- S5.3 Dedupe-Strategie fuer Off-App-Push festziehen:
  - wie verhindert der externe Pfad doppelte Reminder/Incidents pro Abschnitt und Tag
  - wie verhaelt sich das gegen wiederholte Scheduler-Laeufe
- S5.4 DST-/Zeitzonen-Regel fuer `Europe/Vienna` dokumentieren:
  - Workflow darf UTC-basiert laufen
  - die fachliche Bewertung muss trotzdem lokale Zeit korrekt lesen
- S5.5 BP-Remote-Fenster gegen Medication-Fenster abgrenzen:
  - keine versehentliche Vermischung von Medication- und BP-Windows
- S5.6 Schritt-Abnahme:
  - Scheduler-Strategie auf Zuverlaessigkeit, geringe Drift und echten Push ohne App-Open pruefen
- S5.7 Doku-Sync:
  - Workflow-/Backend-Vertrag in dieser Roadmap klar nachziehen
- S5.8 Commit-Empfehlung:
  - festhalten, ob Scheduler- und Dedupe-Vertrag separat commitbar sind oder mit `S6` zusammengehoeren
- Output: belastbare Strategie fuer echten Push ohne geoeffnete App.
- Exit-Kriterium: klarer Plan, wann und wie Reminder/Incidents off-app gesendet werden, ohne in Duplikate oder UTC-Drift zu kippen.

#### S5 Ergebnisprotokoll (abgeschlossen)

##### S5.1 Scheduler-Modell: regelmaessiger Tick statt Fenster-Crons
- Entscheidung:
  - Der Workflow wird nicht in viele einzelne Fach-Crons pro Reminder-/Incident-Fenster zerlegt.
  - Stattdessen laeuft der externe Incident-Pfad ueber einen regelmaessigen Tick.
- Verbindliche V1-Richtung:
  - GitHub Actions Scheduler laeuft alle `30` Minuten.
  - Der Scheduler ruft die Edge Function standardmaessig mit `window = all`.
- Begruendung:
  - alle aktuell beschlossenen Schwellwerte liegen auf `:00` oder `:30`
  - damit ist ein `30`-Minuten-Tick fachlich ausreichend
  - die Workflow-Datei muss nicht fuer Sommer-/Winterzeit oder neue einzelne Fenster aufgefaltet werden
  - die eigentliche Fachentscheidung bleibt in der Edge Function und nicht in Cron-Kommentaren

Festlegung:
- Der Scheduler ist Taktgeber, nicht Fachlogik.
- Der `30`-Minuten-Tick ist ein bewusster Produkt-Tradeoff:
  - geringe Workflow-Komplexitaet
  - aber tolerierter Zustell-Jitter von bis zu knapp `30` Minuten

##### S5.2 Zeitentscheidung lebt in der Edge Function
- Verbindliche Regel:
  - die Edge Function bewertet alle Medication- und BP-Faelle in `Europe/Vienna`
  - der Workflow entscheidet nicht, welcher Reminder fachlich faellig ist
- Die Funktion benutzt:
  - `INCIDENTS_TZ`
  - den lokalen Tag `dayIso`
  - die lokale Uhrzeit `hour` plus `minute`
- Die S2-Schwellen fuer Medication werden in der Funktion bzw. ihrem gemeinsamen Incident-Vertrag abgebildet:
  - `morning`
    - reminder `10:00`
    - incident `12:00`
  - `noon`
    - reminder `14:00`
    - incident `16:00`
  - `evening`
    - reminder `20:00`
    - incident `22:00`
  - `night`
    - reminder `22:30`
    - incident `23:30`
- BP bleibt separat:
  - `bp_evening` ab `20:00`

Festlegung:
- Cron liefert nur Ticks.
- Die fachliche Due-Entscheidung lebt zentral im Incident-Backend-Pfad.

##### S5.3 Catch-up-Regel: immer nur die hoechste aktuell faellige Stufe
- Problem:
  - Bei Scheduler-Jitter, Ausfaellen oder verspaeteten Laeufen kann die Funktion erstmals erst nach `incident_after` laufen.
  - Dann duerfen nicht rueckwirkend `reminder` und `incident` nacheinander in derselben Runde gesendet werden.
- Verbindliche Catch-up-Regel:
  - pro `type` und Tag wird immer nur die hoechste aktuell faellige, noch nicht gesendete Severity gesendet
- Beispiele:
  - `medication_morning` ist um `12:10` noch offen und es wurde bisher nichts gesendet
    - Ergebnis: nur `incident`
    - kein nachtraeglicher `reminder`
  - `medication_evening` war um `20:00` offen und Reminder wurde bereits gesendet; um `22:00` noch offen
    - Ergebnis: `incident`
- Produktwirkung:
  - kein Stau alter Benachrichtigungen
  - kein Doppelping wegen verspaetetem Tick

Festlegung:
- Off-App-Catch-up sendet nie Reminder-Backlog plus Incident-Backlog gleichzeitig fuer denselben Abschnitt.

##### S5.4 Persistente Dedupe-Strategie fuer Remote-Push
- Es existiert aktuell kein persistenter Push-Log fuer den externen Incident-Pfad.
- Verbindliche V1-Richtung:
  - fuer Remote-Push wird ein eigener persistenter Dedupe-/Delivery-State eingefuehrt
- Zielvertrag fuer die neue Persistenz:
  - eine Zeile pro erfolgreich ausgelieferter Remote-Notification auf Benutzer-Ereignis-Ebene
  - eindeutiger Schluessel:
    - `user_id`
    - `day`
    - `type`
    - `severity`
    - `source = remote`
- Minimalfelder:
  - `id`
  - `user_id`
  - `day`
  - `type`
  - `severity`
  - `source`
  - `tag`
  - `trigger`
  - `sent_at`
- Produktregel:
  - Dedupe ist pro Nutzer-Ereignis, nicht pro Endpoint
  - dieselbe Notification kann an mehrere aktive Subscriptions gesendet werden, zaehlt aber fachlich als ein Event

Festlegung:
- Remote-Dedupe wird persistent und nicht nur ueber Notification-Tag oder In-Memory simuliert.
- Diese Persistenz ist Pflichtbestandteil des spaeteren SQL-/Backend-Umbaus in `S6`.

##### S5.5 Erfolgs- und Fehlerregel pro Subscription
- Verbindliche Sendelogik:
  - die Funktion versucht die faellige Notification an alle aktiven Push-Subscriptions des Nutzers zu senden
  - der Dedupe-Eintrag wird erst geschrieben, wenn mindestens eine Subscription erfolgreich beliefert wurde
- Fehlerregel:
  - wenn alle Subscriptions fehlschlagen:
    - kein Dedupe-Eintrag
    - der naechste Tick darf erneut versuchen zu senden
  - wenn einzelne Subscriptions mit permanentem Push-Fehler antworten:
    - z. B. `404` / `410`
    - sollen diese Subscriptions im Umbaupfad als deaktivierbar betrachtet werden
- Produktwirkung:
  - temporäre Push-Fehler blockieren keine spaetere Zustellung
  - erfolgreiche Zustellung an mindestens ein Geraet verhindert Duplikate auf spaeteren Ticks

Festlegung:
- Remote-Push gilt als fachlich `gesendet`, sobald mindestens ein aktiver Endpoint erfolgreich beliefert wurde.
- Endpoint-Health muss im Umbaupfad sichtbar gemacht werden:
  - entweder direkt auf `push_subscriptions`
  - oder ueber einen eng gekoppelten Delivery-/Health-State

##### S5.6 Rollenverteilung zwischen lokalem und externem Push
- Der externe Push-Pfad wird fuer echte System-Notifications der primaere Transport, sobald eine aktive Push-Subscription existiert.
- Lokaler Pfad:
  - bleibt fachlicher Incident-/Reminder-Rechner im Frontend
  - kann als Fallback ohne Remote-Setup oder fuer lokale Entwicklung bestehen bleiben
- Verbindliche Zielregel fuer den spaeteren Umbau:
  - Medication-System-Notifications duerfen lokal nicht allein wegen der Existenz irgendeiner `push_subscriptions`-Zeile unterdrueckt werden
  - lokale Suppression ist erst zulaessig, wenn mindestens ein gesunder Remote-Push-Pfad fuer den Nutzer feststellbar ist
- Grund:
  - sonst drohen Doppelbenachrichtigungen:
    - lokal beim App-Open oder waehrend die App offen ist
    - plus remote durch Scheduler/Edge Function
  - umgekehrt droht sonst auch ein stiller Ausfall:
    - Subscription-Zeile vorhanden
    - Remote-Delivery aber faktisch kaputt
    - lokaler Pfad trotzdem unterdrueckt

Verbindliche Healthy-Remote-Regel fuer V1:
- `healthy remote push path` bedeutet:
  - mindestens eine nicht deaktivierte Subscription
  - und mindestens ein nachvollziehbarer Erfolgsindikator im Remote-Delivery-/Health-State
- Bis dieser Health-State in `S6` real existiert, bleibt lokale Suppression nur ein Zielvertrag und kein stillschweigend erlaubter Shortcut.

Festlegung:
- Remote ist der primaere Push-Transport.
- Lokal bleibt Fallback- und UI-State-Pfad, nicht ko-primaerer Delivery-Kanal.

##### S5.7 DST-, Zeitzonen- und Window-Regeln
- Der Workflow darf UTC-basiert laufen.
- Die fachliche Bewertung muss immer lokale Zeit in `Europe/Vienna` lesen.
- Dadurch gilt:
  - Sommer-/Winterzeit wird in der Edge Function sauber aufgeloest
  - die Workflow-Datei braucht keine saisonalen Sonderkommentare als Fachvertrag
- Window-Regel fuer V1:
  - Scheduler-Calls laufen standardmaessig mit `window = all`
  - `window` bleibt fuer manuelle Tests und enge Diagnose nutzbar:
    - `med`
    - `bp`
    - `all`
- Produktregel:
  - `window` ist Test-/Betriebsfilter
  - nicht die primaere fachliche Due-Definition

Festlegung:
- Lokale Zeitzone entscheidet, nicht UTC-Cron-Kommentarlogik.

##### S5.8 Schritt-Abnahme, Doku-Sync und Commit-Empfehlung
- Schritt-Abnahme:
  - Off-App-Push hat jetzt einen belastbaren Betriebsvertrag:
    - regelmaessiger Tick
    - lokale Zeitlogik in der Funktion
    - persistente Dedupe-Strategie
    - Catch-up ohne Backlog-Doppelping
    - klare Rollenverteilung lokal vs. remote
  - Die offene Umsetzung liegt jetzt nicht mehr im Betriebskonzept, sondern nur noch in Code, SQL und Workflow-Aenderungen in `S6`
- Doku-Sync:
  - Diese Roadmap ist jetzt auch die kanonische Quelle fuer Scheduler-, Takt- und Dedupe-Vertrag.
  - Modul-Doku bleibt bis `S6` bewusst beim noch nicht umgesetzten Zielzustand.
- Commit-Empfehlung:
  - Ja, `S5` ist fachlich als eigener Betriebsvertragsblock commit-wuerdig.
  - Fuer den aktuellen Arbeitsmodus gehoert `S5` aber logisch direkt vor `S6`, damit Umsetzung und Betriebspfad ohne Drift gebaut werden.

### S6 - Umbau in Repo, Backend, QA und Doku-Sync umsetzen
- S6.1 SQL-/Persistenzvertrag fuer Remote-Dedupe und Endpoint-Health umsetzen:
  - persistenter Delivery-/Dedupe-State fuer Remote-Push
  - Health-Signal fuer Remote-Subscriptions
  - keine reine In-Memory- oder Workflow-Dedupe-Loesung
- S6.2 `app/modules/incidents/index.js` auf das neue gestaffelte Medication-Modell umbauen.
- S6.3 Medication-Reminder-Texte und Severity-Payloads im lokalen Pfad umstellen.
- S6.4 `service-worker.js` auf severity-aware Darstellung umbauen:
  - Reminder ruhiger
  - Incident klarer
- S6.5 Die Edge Function `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-incident-push/index.ts` auf den neuen Read-, Dedupe-, Health- und Payload-Vertrag umbauen.
- S6.6 Den Workflow `.github/workflows/incidents-push.yml` auf die beschlossene Scheduler-Strategie ziehen.
- S6.7 Lokale-vs.-Remote-Suppression sauber absichern:
  - lokal nicht blind abschalten
  - nur bei gesundem Remote-Pfad unterdruecken
- S6.8 Rueckwaertskompatibilitaet fuer bestehende Payloads bewusst absichern.
- S6.9 `docs/modules/Push Module Overview.md`, relevante Modul-Overviews und `docs/QA_CHECKS.md` auf den neuen Vertrag ziehen.
- S6.10 Syntaxchecks und gezielte Smoke-Matrix vorbereiten bzw. ausfuehren:
  - Morning nicht schon ab `06:00` hart
  - echter Push auch ohne geoeffnete App
  - Reminder nur bei offenen Slots
  - maximal ein Reminder pro Stufe/Abschnitt/Tag
  - spaeterer Incident nur wenn weiter offen
  - lokale Suppression nur bei gesundem Remote-Pfad
  - BP-Verhalten konsistent zum beschlossenen Vertrag
- S6.11 Schritt-Abnahme:
  - Code-/Dead-Code-Pruefung, Reminder-Drift-Pruefung und statische Validierung
- S6.12 Doku-Sync:
  - Roadmap, Push-Doku und QA auf finalen Repo-Stand bringen
- S6.13 Commit-Empfehlung:
  - finalen Commit-/Merge-Vorschlag dokumentieren
- Output: lokaler und externer Medication-Push sind konsistent umgebaut und liefern echten Push auch ohne geoeffnete App.
- Exit-Kriterium: MIDAS erinnert bei Medication spaeter, freundlicher und gestaffelt und kann diese Reminder auch off-app verlaesslich senden.

#### S6 Checkpoint A - SQL-/Persistenzvertrag repo-lokal umgesetzt
- Status:
  - `S6.1` ist im Repo umgesetzt.
  - `S6.2` bis `S6.13` bleiben bewusst offen.
- Umgesetzt in `sql/15_Push_Subscriptions.sql`:
  - `push_subscriptions` traegt jetzt Remote-Health-Felder:
    - `last_remote_attempt_at`
    - `last_remote_success_at`
    - `last_remote_failure_at`
    - `last_remote_failure_reason`
    - `consecutive_remote_failures`
  - neuer persistenter Delivery-/Dedupe-State:
    - `push_notification_deliveries`
  - Dedupe-Key auf Benutzer-Ereignis-Ebene:
    - `user_id`
    - `day`
    - `type`
    - `severity`
    - `source`
  - Delivery-State speichert zusaetzlich:
    - `tag`
    - `trigger`
    - `delivered_subscription_count`
    - `sent_at`
- Bewusste Grenze:
  - Die Edge Function nutzt diese Persistenz noch nicht.
  - Der Workflow ist noch nicht auf den neuen Takt gezogen.
  - Lokale Suppression ist noch nicht an den neuen Health-State gekoppelt.
- Validierungsstand:
  - SQL ist repo-lokal nachgezogen.
  - Eine echte Ausfuehrung gegen Supabase wurde in diesem Schritt noch nicht vorgenommen.

#### S6 Checkpoint B - Lokale Incident-Engine auf gestaffelte Medication-Schwellen gezogen
- Status:
  - `S6.2` ist im Repo umgesetzt.
  - `S6.3` bis `S6.13` bleiben bewusst offen.
- Umgesetzt in `app/modules/incidents/index.js`:
  - feste Medication-Schwellen wurden von Abschnittsbeginn auf gestaffelte Due-Stufen umgestellt:
    - `morning`: reminder `10:00`, incident `12:00`
    - `noon`: reminder `14:00`, incident `16:00`
    - `evening`: reminder `20:00`, incident `22:00`
    - `night`: reminder `22:30`, incident `23:30`
  - lokale Medication-Sendeflags sind jetzt getrennt nach:
    - Abschnitt
    - `reminder`
    - `incident`
  - die lokale Engine bewertet Medication nicht mehr ueber `aktueller Abschnitt = sofortiger Incident`, sondern ueber die neue Severity-Stufe je offenem Abschnitt
  - die hoechste aktuell faellige Stufe eines offenen Abschnitts wird lokal als Triggerbasis verwendet
- Bewusste Grenze:
  - lokale Copy ist noch nicht auf `reminder` vs `incident` getrennt
  - lokale Notification-Payloads tragen die neue Severity noch nicht explizit
  - der Service Worker ist noch nicht severity-aware umgestellt
- Validierungsstand:
  - `node --check app/modules/incidents/index.js` ist gruen.

#### S6 Checkpoint C - Lokale Medication-Copy und Severity-Payloads umgestellt
- Status:
  - `S6.3` ist im Repo umgesetzt.
  - `S6.4` bis `S6.13` bleiben bewusst offen.
- Umgesetzt in `app/modules/incidents/index.js`:
  - Medication-Copy ist jetzt getrennt nach:
    - `reminder`
      - `noch nicht erfasst?`
      - `Falls noch offen: bitte kurz bestaetigen.`
    - `incident`
      - `weiterhin offen`
      - `Bitte jetzt pruefen und bestaetigen.`
  - lokale Medication-Payloads tragen jetzt explizit:
    - `data.severity`
    - `data.source = local`
  - lokale Medication-Tags sind getrennt nach Severity:
    - `midas-reminder-<type>-<dayIso>`
    - `midas-incident-<type>-<dayIso>`
  - lokale Notification-Optionen unterscheiden bereits Medication-Reminder vs. Medication-Incident:
    - Reminder ohne `vibrate`, ohne `actions`, ohne `requireInteraction`
    - Incident weiter deutlich wahrnehmbar
- Bewusste Grenze:
  - der Service Worker selbst wertet `data.severity` noch nicht als primaere Source of Truth aus
  - Legacy-Heuristiken im Worker sind noch unveraendert
  - BP-Copy bleibt in diesem Schritt noch unangetastet
- Validierungsstand:
  - `node --check app/modules/incidents/index.js` ist gruen.

#### S6 Checkpoint D - Service Worker auf Severity-Vertrag gezogen
- Status:
  - `S6.4` ist im Repo umgesetzt.
  - `S6.5` bis `S6.13` bleiben bewusst offen.
- Umgesetzt in `service-worker.js`:
  - `data.severity` ist jetzt die primaere Source of Truth fuer Notification-Schaerfe
  - Tag-Namespaces werden explizit ausgewertet:
    - `midas-reminder-...`
    - `midas-incident-...`
  - Legacy-Erkennung bleibt als Fallback erhalten fuer Payloads ohne `severity`:
    - bekannte alte Incident-Typen
    - alte `midas-incident-...`-Tags
  - Incident-Defaults werden nur noch dann automatisch gesetzt, wenn die Notification fachlich als `incident` aufgeloest wird
  - Cache-Version wurde erhoeht, damit der neue Worker sauber neu ausrollt
- Bewusste Grenze:
  - die Edge Function liefert den neuen Severity-Vertrag noch nicht
  - der Workflow ist noch nicht auf den neuen Off-App-Takt gezogen
  - lokale-vs.-remote-Suppression ist noch nicht angebunden
- Validierungsstand:
  - `node --check service-worker.js` ist gruen.

#### S6 Checkpoint E - Edge Function auf neuen Read-, Dedupe-, Health- und Payload-Vertrag gezogen
- Status:
  - `S6.5` ist im Repo umgesetzt.
  - `S6.6` bis `S6.13` bleiben bewusst offen.
- Umgesetzt in `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-incident-push/index.ts`:
  - Medication liest nicht mehr ueber `health_medication_doses`, sondern ueber:
    - `health_medications`
    - `health_medication_schedule_slots`
    - `health_medication_slot_events`
  - offene Medication wird extern jetzt abschnittsbasiert ausgewertet:
    - `morning`
    - `noon`
    - `evening`
    - `night`
  - Catch-up-Regel ist umgesetzt:
    - pro Typ/Tag nur die hoechste aktuell faellige Severity
    - kein nachtraeglicher Reminder-Backlog, wenn bereits `incident` faellig ist
  - Remote-Dedupe nutzt jetzt `push_notification_deliveries`
  - Remote-Payloads tragen jetzt:
    - `data.type`
    - `data.severity`
    - `data.dayIso`
    - `data.source = remote`
    - getrennte Tag-Namespaces fuer Reminder und Incident
  - Subscription-Health wird jetzt pro Sendepfad aktualisiert:
    - Success -> Success-Zeitpunkt und Failure-Counter reset
    - Failure -> Failure-Zeitpunkt, Grund und Failure-Counter
    - `404/410` koennen eine Subscription deaktivieren
  - deaktivierte Endpoints werden innerhalb desselben Laufs nicht erneut fuer weitere Events verwendet
- Bewusste Grenze:
  - der Workflow selbst ist noch nicht auf den neuen `30`-Minuten-Tick gezogen
  - lokale-vs.-remote-Suppression ist noch nicht angebunden
  - eine echte TypeScript-Pruefung via `deno check` konnte hier lokal nicht ausgefuehrt werden, weil `deno` auf dieser Maschine nicht verfuegbar ist
- Validierungsstand:
  - Repo-Read gegen den geaenderten Code ist erfolgt
  - `deno check` konnte mangels installiertem `deno` nicht ausgefuehrt werden

#### S6 Checkpoint F - Workflow auf den neuen Off-App-Takt gezogen
- Status:
  - `S6.6` ist im Repo umgesetzt.
  - `S6.7` bis `S6.13` bleiben bewusst offen.
- Umgesetzt in `.github/workflows/incidents-push.yml`:
  - der Workflow laeuft jetzt als regelmaessiger Tick:
    - `*/30 * * * *`
  - der Workflow entscheidet nicht mehr ueber fachliche Fenster via UTC-Stundenlogik
  - Standardfall fuer Scheduler-Laeufe ist jetzt:
    - `window = all`
  - `workflow_dispatch` mit optionalem `window` bleibt fuer manuelle Tests und Diagnose erhalten
- Produktwirkung:
  - der Workflow ist jetzt nur noch Taktgeber
  - die eigentliche Reminder-/Incident-Entscheidung liegt voll in der Edge Function in `Europe/Vienna`
- Validierungsstand:
  - der YAML-Stand wurde repo-lokal geprueft
  - ein echter GitHub-Actions-Lauf wurde in diesem Schritt nicht ausgefuehrt

#### S6 Checkpoint G - Lokale-vs.-Remote-Suppression, Doku- und QA-Nachzug finalisiert
- Status:
  - `S6.7` bis `S6.13` sind abgeschlossen.
  - `S6` ist damit komplett `DONE`.
- Umgesetzt in `app/modules/profile/index.js`:
  - das Profil liest jetzt neben der Browser-Subscription auch den Remote-Health-Stand der passenden `push_subscriptions`-Zeile
  - `remote gesund` gilt nur, wenn:
    - eine passende aktive Subscription existiert
    - bereits mindestens eine erfolgreiche Remote-Zustellung belegt ist
    - kein spaeterer Failure-Stand darueber liegt
  - der Profil-Status unterscheidet jetzt:
    - `aktiv (warte auf Remote-Bestaetigung)`
    - `aktiv (lokales Fallback)`
    - `aktiv (remote gesund)`
  - das Modul exportiert den Routing-Stand fuer andere Module:
    - `refreshPushStatus()`
    - `getPushRoutingStatus()`
    - `shouldSuppressLocalPushes()`
- Umgesetzt in `app/modules/incidents/index.js`:
  - lokale Notification-Suppression greift jetzt nur bei gesundem Remote-Pfad
  - ohne verifizierten Remote-Health-Stand bleibt lokal bewusst der Fallback aktiv
- Rueckwaertskompatibilitaet (`S6.8`) ist bewusst abgesichert:
  - `service-worker.js` behandelt `data.severity` primaer
  - bekannte Legacy-Incident-Typen und alte `midas-incident-*` Tags bleiben aber lesbar
  - `type`-Namen wie `medication_morning` oder `bp_evening` wurden nicht gebrochen
- Doku-/QA-Sync (`S6.9`, `S6.12`) ist erfolgt:
  - `docs/modules/Push Module Overview.md`
  - `docs/modules/Medication Module Overview.md`
  - `docs/modules/Intake Module Overview.md`
  - `docs/modules/Profile Module Overview.md`
  - `docs/QA_CHECKS.md`
- Checks / Abnahme (`S6.10`, `S6.11`) auf Repo-Ebene:
  - `node --check app/modules/incidents/index.js` erfolgreich
  - `node --check app/modules/profile/index.js` erfolgreich
  - `node --check service-worker.js` war bereits in `S6.4` erfolgreich
  - echter Off-App-Push ueber GitHub Actions / Edge Function ist fachlich vorbereitet, aber nicht voll repo-lokal simulierbar
- Commit-Empfehlung (`S6.13`):
  - jetzt ist ein gemeinsamer finaler Umbau-Commit sinnvoll, weil Vertrag, Runtime, Workflow, SQL und Doku zusammen geschlossen sind

## Smokechecks / Regression (Definition)
- Offene Morning-Slots erzeugen vor `gentle_reminder_after` keinen harten Medication-Push.
- Ein offener Morning-Slot erzeugt zuerst nur den sanften Reminder.
- Ein spaeterer Medication-Incident feuert nur, wenn derselbe Abschnitt weiterhin offen ist.
- Reminder und Incident werden nicht beide mehrfach fuer denselben Abschnitt am selben Tag gesendet.
- Bereits erledigte Abschnitte erzeugen weder Reminder noch Incident.
- BP-Reminder verhalten sich gemass dem in `S2` final beschlossenen Vertrag.
- Service Worker behandelt `reminder` sichtbar ruhiger als `incident`.
- Der externe Push-Pfad sendet Medication-Reminder auch ohne geoeffnete App.
- Die Edge Function liest Medication nicht mehr ueber `health_medication_doses`, sondern ueber den aktuellen slot-/abschnittsbasierten Vertrag.
- Workflow und Edge Function erzeugen keinen doppelten Off-App-Push fuer denselben Abschnitt und dieselbe Severity am selben Tag.
- Lokale Medication-Pushes werden nicht allein wegen einer vorhandenen Subscription-Zeile unterdrueckt.
- Lokale Suppression greift nur, wenn der Remote-Pfad fuer den Nutzer als gesund verifizierbar ist.

## Abnahmekriterien
- Medication fuehlt sich nicht mehr wie ein frueher Alarm, sondern wie ein spaeteres Auffangnetz an.
- Zeiten, Texte und Notification-Schaerfe sprechen denselben Produktvertrag.
- Der Service Worker unterscheidet Reminder und Incident technisch sauber.
- Lokaler und externer Push-Pfad sprechen denselben Read-, Timing- und Payload-Vertrag.
- MIDAS kann Medication-Reminder auch ohne geoeffnete App verlaesslich senden.
- Die Rollenverteilung lokal vs. remote fuehrt weder zu Doppelpushes noch zu stillen Ausfaellen.
- Doku und QA beschreiben denselben Endstand wie der Code.

## Risiken
- Zu milde Schwellen koennen echte Alltagsdrift zu spaet auffangen.
- Zu harte Incident-Darstellung in der zweiten Stufe kann den positiven Effekt des sanften ersten Reminders wieder abschwaechen.
- Lokaler und externer Push-Pfad koennen auseinanderdriften, wenn der Severity-Vertrag nicht sauber dokumentiert wird.
- Scheduler- oder Dedupe-Fehler koennen Off-App-Duplikate oder ausbleibende Pushes erzeugen.
- Unklare Copy kann fachlich mehr behaupten als MIDAS sicher weiss.
