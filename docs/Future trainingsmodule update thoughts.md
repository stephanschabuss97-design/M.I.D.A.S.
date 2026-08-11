# MIDAS Activity V2 - Masterplan

## Roadmap der Roadmaps für das zukünftige Trainings- und Aktivitätsmodul

Stand: 2026-08-11

Status: Fachliches Zielbild und Planungsquelle. R1, die additive unsichtbare
R2-Datenbankgrundlage, die isolierte R3-Draft-/Shell-Grundlage, C2-
Katalogversion 2, R4-Suche/Last-Performance sowie die isolierten R5-Strength-,
R6-Duration-/Distance-, R7-Recovery- und R8-Commit-Bausteine sind
bereitgestellt. R8 ist mit einer explizit owner-akzeptierten Evidence-Lücke
für den nicht ausgeführten Android-Device-Reclaim und den fehlenden finalen
CodeRabbit-Null-Lauf abgeschlossen. R9 ist das nächste Rolling-Wave-Gate;
sichtbare Activity-Consumer verwenden weiterhin V1.

Cross-Contract-Stand 2026-08-11: `PASS mit dokumentierter R8-Evidence-Lücke`.
R1, R2 und R3 bleiben unverändert
gültig. R3 hält die bewiesene R2-`request_id`, den top-level-Katalogvertrag und
`item_order` ein. C2 ist DONE: v1 bleibt 78, v2 ist ein vollständiger
produktiver 80er-Snapshot und die Studio-Suchmatrix ist grün. R4 ist DONE: die
lokale Suche, lookup-spezifische Semantikinjektion und read-only historische
Snapshotanzeige sind isoliert bewiesen. R5 ist DONE: Draftschema v2,
policy-gesteuerte Strength-Sets, Parser, Validität, Lifecycle und responsive
Harness-Fixtures sind ohne Save oder Produktverdrahtung bewiesen. R6 ist DONE:
Draftschema v3, itemweite Dauer, optionale Distanz und gemeinsame Itemnotiz
sind für alle elf realen Non-Strength-Einträge isoliert bewiesen; Intensität
bleibt bewusst ausgeschlossen. R7 ist DONE: Der unveränderte Draft v3 wird in
einer getrennten Activity-V2-IndexedDB mit vollständigem Token-/Lease-CAS,
serialisiertem Autosave, bewusstem Restore-Gate und Generationstombstone
isoliert abgesichert. Der
C2-Nachreview hat zusätzlich den späteren
Katalog-Rollout als offenen Cross-Roadmap-Vertrag erkannt: R4 muss Suche und
Historien-Lookup versionsagnostisch konsumieren und schließt dafür die
lookup-spezifische Semantikinjektion der R2-Datenzugriffsschicht. Der
Schreibpfad bleibt dabei unverändert. R7 bindet Recovery an die gespeicherte
Draft-Katalogversion, R8 hat die Commit-Kompatibilität zwischen bestehenden
Katalogversionen entschieden und R12 beweist die produktive
Aktivierungsreihenfolge einschließlich gecachter PWA-Clients. R8 ist DONE:
Draft v3 wird unverändert in eine tiefgefrorene R2-Payload projiziert, der
exakte Commit-Intent liegt vor jedem Remoteversuch persistent im Recovery-
Envelope v2, und Known-/Unknown-/Replay-/Cleanup-Pfade sind durch CAS und einen
monotonen Attempt geschützt. SQL 22 ist produktiv ausgeführt und erlaubt den
Commit gegen jede vorhandene unveränderliche Katalogversion statt nur gegen die
höchste. Activity V1, Produkt-PWA und Produktconsumer bleiben unverändert.
Der lokale Android-Debugpfad ist gebaut und isoliert, aber der reale Device-
Prozess-Reclaim wurde auf Owner-Entscheidung nicht ausgeführt.

Dieses Dokument beschreibt, was MIDAS Activity V2 werden soll und in welcher
Reihenfolge die dafür notwendigen Roadmaps entstehen sollen. Es ist keine
einzelne Umsetzungsroadmap und kein Beleg dafür, dass die beschriebenen
Funktionen bereits produktiv existieren.

Bis zum späteren Consumer-Cutover bleiben der reale Code, das aktuelle
`Activity Module Overview` und die produktive Supabase-Struktur die Source of
Truth: Activity V1 ist sichtbar aktiv; Activity V2 R1-R8/C2 stellen nur die
noch unverdrahtete Semantik-, Speicher-, Draft-, Shell-, Katalog-, Such-,
Historien-, Editor-, Recovery- und Commitgrundlage bereit.

---

## 1. Zielbild

MIDAS Activity V2 soll eine flexible, mobile Erfassung von Training und
relevanten sportlichen Aktivitäten ermöglichen.

Die wichtigste Produktidee lautet:

> Eine Session kann leer oder aus einer vorbereiteten Übungsliste beginnen.
> Stephan entscheidet während der Session weiterhin selbst, welche Übung oder
> Aktivität er heute tatsächlich macht.

Der Ablauf soll sich an der guten Session- und Satzerfassung von Liftlog
orientieren, ohne dessen starre Bindung an gespeicherte Trainingspläne zu
übernehmen.

Eine optionale spätere Session-Vorlage darf lediglich Übungsauswahl und
Reihenfolge vorbereiten. Sie ist kein verpflichtender Trainingsplan, enthält
keine Leistungsvorgabe und verändert weder den freien Sessionfluss noch den
Speichervertrag.

Activity V2 soll zwei Hauptprobleme lösen:

1. Übungen und Aktivitäten während einer Session flexibel auswählen und sofort
   sehen, was beim letzten Mal für denselben Eintrag dokumentiert wurde.
2. Alle abgeschlossenen Sessions strukturiert in der eigenen Supabase-Datenbank
   speichern und für Arztberichte sowie maschinenlesbare Analysen exportieren.

Das Modul ist weder eine Fitness-Gamification noch eine autonome
Trainingsberatung. Es liefert belastbare Daten für den Alltag, den Arztkontext
und spätere Analysen mit ChatGPT, Codex oder einem zukünftigen MIDAS-MCP.

### 1.1 MIDAS- und CKD-Kontext

Activity V2 erfasst Training als CKD-relevanten Lebensstil- und
Belastungskontext. Es soll nicht jeden kurzen Spaziergang protokollieren,
sondern für Stephan relevante sportliche Einheiten nachvollziehbar machen.

Die Daten sollen später gemeinsam mit anderen MIDAS-Kontexten betrachtet
werden können:

- Doctor- und Health-Export
- Blutdruckverlauf
- Gewicht und Körperdaten
- relevante Laborwerte
- Intake-Kontext wie Wasser, Salz und Protein
- Medication-Adhärenz
- aktuelle Arzt- und Nephrologie-Befunde

Mögliche externe Analysefragen sind:

- Ist die Trainingsfrequenz über mehrere Monate ausgeglichen?
- Welche Übungen wurden dauerhaft vernachlässigt oder stark gesteigert?
- Passen Kraft- und Ausdaueranteile zum aktuellen Alltag?
- Gibt es Punkte, die wegen Blutdruck, CKD-Kontext, Pressatmung oder
  Regeneration mit Arzt, Nephrologie oder Physiotherapie besprochen werden
  sollten?
- Welche kleine Anpassung ist sinnvoll, ohne einen kompletten Trainingsplan
  automatisch neu zu schreiben?

MIDAS selbst beantwortet diese Fragen nicht medizinisch. Es liefert
strukturierte Fakten. Empfehlungen eines LLM bleiben Denk- und
Diskussionsgrundlagen und ersetzen weder Arzt noch fachliche Leitlinien.

---

## 2. Produktentscheidung in Kurzform

- Keine verpflichtenden Trainingspläne.
- Jede Session ist zunächst eine leere Arbeitsfläche.
- Übungen und Aktivitäten werden über ein Suchfeld hinzugefügt.
- Die Historie hängt am stabilen kanonischen Key des Eintrags, nicht an einem
  Trainingsplan.
- Derselbe Key findet seine Historie unabhängig davon, in welcher früheren
  Session er verwendet wurde.
- Ein Eintrag bestimmt selbst, welche Eingabemaske benötigt wird.
- Kraftübungen verwenden Sätze mit der im Katalog festgelegten Primärmessung:
  Wiederholungen, Satzdauer oder Satzdistanz. Gewicht beziehungsweise
  Unterstützung wird nur gemäß der Entry-Feldpolicy erfasst.
- Ausdauer- und allgemeine Aktivitäten verwenden Dauer sowie bei Bedarf
  Distanz, Intensität oder Notiz.
- Kraft und Ausdauer dürfen in derselben Session vorkommen.
- Hallenfußball, Schwimmen oder Wandern können als Session mit nur einem
  Aktivitäts-Item gespeichert werden.
- Unfertige Sessions bleiben lokale Drafts.
- Supabase speichert abgeschlossene Sessions als historische Wahrheit.
- Der Arztbericht erhält nur eine ruhige Zusammenfassung.
- Der Activity-Export enthält die vollständigen strukturierten Details.

---

## 3. UX-Referenz Liftlog

Liftlog ist die UX-Referenz für den schnellen Trainingsfluss, aber nicht das
Daten- oder Produktmodell von MIDAS.

### 3.1 Was MIDAS übernehmen soll

- kompakte Übungsblöcke
- gut sichtbare Sessiondauer
- schnelle Eingabe von Gewicht und Wiederholungen
- mehrere Sätze pro Übung
- Anzeige der vorherigen Sätze
- Satz hinzufügen und als erledigt markieren
- klare Aktion zum Abschluss der Session
- übersichtliche Zusammenfassung abgeschlossener Sessions
- mobile Bedienbarkeit mit möglichst wenigen Interaktionen

### 3.2 Was MIDAS bewusst nicht übernimmt

- keine Pflicht, zuerst einen Trainingsplan zu erstellen
- keine leeren Planübungen, nur weil sie heute nicht gemacht wurden
- keine Historie, die an einen Plan gebunden ist
- kein Zwang, für eine spontane Übung einen neuen Plan anzulegen
- keine fremde Datenhaltung außerhalb der eigenen MIDAS-Datenbank
- keine Gamification, Streaks oder Trainingszwänge
- keine automatische Trainingsverordnung

### 3.3 MIDAS-Flow

```text
Session starten
-> Aktivität oder Übung suchen
-> kanonischen Eintrag auswählen
-> letzte dokumentierte Ausführung anzeigen
-> passende Eingabemaske ausfüllen
-> weitere Einträge flexibel hinzufügen
-> Session explizit abschließen
-> gesamte Session kontrolliert in Supabase speichern
```

Die Sessionoberfläche wird als fokussierte Vollflächenansicht nach dem Muster
des bestehenden Verlaufs-Panels aufgebaut. Sie ist keine kleine Karte im
Vitals-Formular. Activity V1 bleibt bis zum späteren Consumer-Cutover sichtbar
und unverändert; R3 entwickelt und prüft die neue Shell zunächst isoliert.

---

## 4. Fachliches Session-Modell

Die Session ist der gemeinsame Container für alle Aktivitätsformen.

### 4.1 Beispiel Gym-Session

```text
Session: Gym

- Leg Extensions
  - 12 x 77,5 kg
  - 13 x 77,5 kg
  - 12 x 80 kg

- Seated Leg Curl
  - 11 x 75 kg
  - 12 x 75 kg
  - 10 x 80 kg

- Biceps Curl
  - spontan heute hinzugefügt
  - vorherige Sätze aus der letzten Session sichtbar

- Radfahren
  - 15 Minuten
  - optional Distanz oder Intensität
```

Die Session muss nicht dieselben Übungen wie das vorige Training enthalten.
Nicht ausgeführte Übungen erscheinen nicht als leere Datensätze.

### 4.2 Beispiel Hallenfußball

```text
Session: Hallenfußball

- Hallenfußball
  - Dauer: 60 Minuten
  - optionale Notiz
```

### 4.3 Beispiel Schwimmen

```text
Session: Schwimmen

- Schwimmen
  - Dauer: 45 Minuten
  - optionale Distanz
  - optionale Intensität
```

### 4.4 Gemischte Sessions

Eine Gym-Session darf Kraftübungen und einen Ausdauerabschluss kombinieren.
Deshalb liegt der Tracking-Modus am ausgewählten Session-Item und nicht starr
an der gesamten Session.

Die Sessiondauer beschreibt die reale Gesamtdauer der Einheit. Eine optionale
Itemdauer beschreibt nur den konkreten Aktivitätsblock. Itemdauern werden
nicht ungeprüft zur Sessiondauer addiert, weil sich Zeiträume überschneiden
oder Pausen enthalten können.

Activity V2 erlaubt mehrere abgeschlossene Sessions am selben Kalendertag.
Eine künstliche Ein-Session-pro-Tag-Grenze wird nicht aus Activity V1
übernommen.

Die sichtbare Sessionuhr startet, sobald das erste Item hinzugefügt wird. Sie
zeigt die seit diesem Startzeitpunkt vergangene Zeit und läuft während normaler
Satzpausen weiter. R3 führt weder Pausenmodus noch Satz-Resttimer oder manuelle
Zeitkorrektur ein. Eine spätere Speicherintegration friert die Zeit erst beim
bewussten Abschluss der Session ein.

### 4.5 Vorbereitete Session-Vorlage

Nach dem stabilen Activity-V2-Kern darf Codex aus der Analyse vergangener
Trainings eine kleine JSON-Übungsliste für die nächste Einheit erstellen. Das
mentale Modell ist kein Trainingsplan mit Leistungsvorgaben, sondern ein
vorbereiteter Startzustand:

- Beispiel: `leg_curl` wird in der nächsten Einheit durch
  `romanian_deadlift` ersetzt.
- Die Datei enthält nur Metadaten, `catalog_version`, kanonische `item_key`s
  und deren Reihenfolge.
- Sie enthält keine Zielgewichte, keine vorgegebenen Wiederholungen, keine
  Satzanzahl und keine bereits absolvierten Werte.
- MIDAS validiert jeden Key gegen den tatsächlich geladenen Katalog. Dass
  Codex Zugriff auf die Semantikdateien hatte, ersetzt diese Laufzeitprüfung
  nicht.
- Nach Bestätigung erzeugt der Import denselben normalen Session-Draft wie
  manuelles Hinzufügen. Mit dem ersten übernommenen Item startet dieselbe
  Sessionuhr.
- Für jedes Item lädt R4 weiterhin die letzte vollständige reale Ausführung,
  damit Gewicht und Wiederholungen nicht aus dem Gedächtnis geschätzt werden
  müssen. Die aktuellen Eingabefelder bleiben leer.
- Items dürfen während der Session entfernt, verschoben oder spontan ergänzt
  werden.
- Der atomare Save-Pfad unterscheidet nicht zwischen manuell aufgebautem und
  importiertem Draft. Persistiert wird ausschließlich die tatsächlich
  absolvierte Session.

Ein Import darf einen bereits veränderten Draft niemals still überschreiben.
Fehlende, doppelte, inaktive oder zur angegebenen Katalogversion unpassende
Keys führen zu einem verständlichen Validierungsfehler, bevor Draft oder Uhr
verändert werden. Eine echte Kataloglücke wird zuerst zu Hause über den
kontrollierten Katalogpflegeweg geschlossen und danach in einer neu erzeugten
Vorlage verwendet.

Der minimale maschinenlesbare Vorlagenvertrag wird erst in R13 endgültig
eingefroren.
Als Ausgangspunkt gilt ein Schema wie
`midas.activity-session-template.v1` mit `schema_version`,
`catalog_version`, einem Anzeigenamen und geordneten `items`. R13 benötigt in
der ersten Ausbaustufe weder eine Supabase-Plantabelle noch MCP-Schreibzugriff.

---

## 5. Semantik und Aktivitätskatalog

### 5.1 Grundvertrag

Jede bekannte Übung oder Aktivität besitzt einen stabilen kanonischen Key.

Beispiele:

```text
leg_extension
leg_curl
biceps_curl
lat_pulldown
cycling
swimming
football
hiking
```

Dieser Key ist der historische Anker. Labels und Aliase dürfen später nur in
einer neuen vollständigen Katalogversion gepflegt werden. Ein bereits
produktiver Snapshot bleibt unverändert und der Key bleibt stabil.

Studio, Hersteller, Gerätemodell sowie Geräte-, Hantel- und Griffvarianten
teilen den klassischen generischen Übungskey. Geräte- und kabelbasierte Lasten
werden über `load_comparability: device_relative` gegen falsche
studioübergreifende Vergleiche abgegrenzt, ohne die Historie zu fragmentieren.
Ein eigener Key bleibt fachlich anderen klassischen Bewegungen oder
inkompatibler Messsemantik vorbehalten. Inverse Unterstützung verwendet daher
zum Beispiel `assisted_pull_up` mit `assistance_kg` statt umgedeutetem Gewicht.

### 5.2 Repo-basierte Semantik

Die kontrollierte Basissemantik liegt in einer versionierten Repo-Datei. Sie
definiert mindestens:

- `key`
- `label`
- `aliases`
- `category`
- `tracking_mode`
- `equipment`
- optionale Muskelgruppen- oder Sporttags
- unterstützte Felder
- Einheit und Wertebereich je Feld

Die lokale Suche arbeitet gegen diese Semantik. Supabase wird erst abgefragt,
nachdem ein kanonischer Key ausgewählt wurde.

### 5.3 Tracking-Modi

Für Activity V2 sind zunächst diese Modi vorgesehen:

#### `strength_sets`

Für Maschinen, Kabelzüge, freie Gewichte und ähnliche Kraftübungen.

Der R1-Katalog legt pro Übung exakt eine Primärmessung fest:

- `reps` für Wiederholungssätze
- `duration_sec` für zeitbasierte Sätze wie Planks
- `distance_m` für Carry- oder Sled-Sätze

Zusätzlich darf die Entry-Feldpolicy höchstens eine Lastart vorsehen:

- `weight_kg` als erforderliche oder optionale dokumentierte Last
- `assistance_kg` für inverse Unterstützungssemantik

Nicht zur R1-Katalogsemantik gehören Satzreihenfolge, Satzabschluss oder
Zeitpunktfelder. `set_order` wird im R2-Speichervertrag festgelegt. R5 leitet
Leer-, Teil-, Vollständig- und Ungültigzustand ausschließlich aus Feldpolicy und
aktuellen Eingaben ab; ein separates Abschlussfeld oder `completed_at` existiert
nicht.

#### `duration`

Für Aktivitäten, bei denen primär die Dauer relevant ist.

Felder:

- `duration_min`
- optionale Notiz

#### `duration_distance`

Für Aktivitäten, bei denen Dauer und Distanz sinnvoll sind.

Felder:

- `duration_min`
- optionale `distance_km`
- optionale Intensität
- optionale Notiz

Eine manuelle Cardio-Checkbox ist im Normalfall nicht notwendig. Der gewählte
Katalogeintrag bestimmt den Tracking-Modus und damit die Eingabemaske.

### 5.4 Suche

Die Suche soll lokal und deterministisch erfolgen:

1. normalisierte exakte Übereinstimmung
2. Alias-Übereinstimmung
3. Präfix
4. enthaltene Tokens
5. stabile Ranking-Regel bei mehreren Treffern

Die Suche erzeugt keine Datenbankabfrage pro Tastendruck.

### 5.5 Freigegebener Katalogvertrag

R1 hat entschieden:

- Die erste produktive Activity-V2-Ausbaustufe verwendet ausschließlich den
  kontrollierten Repo-Katalog.
- `catalog_version: 1` enthält eine breite, planunabhängige Baseline mit 78
  aktiven klassischen Übungen und Aktivitäten.
- Persönliche Standard-, Ersatz- oder Studiogeräte begrenzen den Katalog
  nicht. Auch noch nie ausgeführte Einträge sind vor ihrer ersten Nutzung
  lokal suchbar.
- Freie benutzerdefinierte Keys sind nicht erlaubt. Eine echte Lücke wird als
  neuer kontrollierter Entry mit erhöhter Katalogversion ergänzt.

Ein Freitext-Label ohne stabilen Key wäre keine ausreichende Lösung, weil die
Historie dadurch wieder fragmentiert würde.

### 5.6 Verifiziertes Studioinventar und Katalog-v2-Gate

Am 30. Juli 2026 wurde ein reales Geräteinventar anhand von 27 Studiofotos
geprüft:

- lokale Arbeitsquelle:
  `C:\Users\steph\Desktop\Bilder Gym`
- Inventardokument:
  `Fitnessstudio_Geraeteinventar.md`
- Bildbestand:
  20 eindeutig beschriftete Kraftmaschinen und 7 Übersichts- beziehungsweise
  Cardio-/Functional-Aufnahmen
- Ergebnis:
  Das Inventar stimmt mit den sichtbaren Typenschildern und
  Ausstattungsgruppen überein. Insbesondere ist `Glute` der eigenständige
  Gerätename einer geführten einseitigen Hüftstreckung.

Die Quelle ist Inventar- und Suchvokabular, kein Trainingsplan und keine
medizinische Eignungsfreigabe. Hersteller, Studio und konkrete
Gerätegeneration werden nicht zur historischen Identität.

Der durch C2 umgesetzte `catalog_version: 2`-Vertrag löst die drei Klassen so:

<!-- markdownlint-disable MD013 -->

| Klasse | Verifizierte Beispiele | Vertrag |
| --- | --- | --- |
| bereits direkt suchbar | Leg Press, Leg Extension, Leg Curl, Pulldown, Chest Press, Shoulder Press, Rotary Torso, SkiErg, Ruderergometer, Crosstrainer | kein neuer Key |
| klare Alias-Kandidaten | Glute -> `glute_kickback`; Abductor -> `hip_abduction`; Adductor -> `hip_adduction`; Rotary Calf -> `calf_raise`; Pectoral -> `chest_fly`; Delts Machine -> `lateral_raise`; Lower Back -> `back_extension`; Stepmill -> `stair_climber`; Fahrradergometer -> `cycling` | in v2 mit vollständigem Kollisions-/Suchtest umgesetzt |
| Owner-Identitätsentscheidung | Upper Back -> neuer Key `high_row`; Low Row -> `seated_row`; Vertical Traction -> `lat_pulldown`; Abdominal Crunch -> `core_press`; Total Abdominal -> neuer Key `total_abdominal` | abgeschlossen; zwei neue Bewegungsidentitäten, drei Aliase bestehender Keys |

<!-- markdownlint-enable MD013 -->

`Multi Hip` ist kein einzelner Übungskey. Die ausgeführte Bewegung bestimmt
die Identität. Kandidaten sind beispielsweise:

- `Multi Hip Abduction` -> `hip_abduction`
- `Multi Hip Adduction` -> `hip_adduction`
- `Multi Hip Extension` -> `glute_kickback`
- ein neuer Hüftflexions-Key nur bei tatsächlichem Erfassungsbedarf

`catalog_version: 1` und die abgeschlossene R1-Roadmap blieben unverändert.
Die bestehende `semantics.js` wurde nicht still korrigiert. C2 ergänzt additiv
`semanticsV2`, einen vollständigen 80er-Snapshot, 47 Aliasergänzungen an 24
Keys und 58 Suchfälle. 31 der Aliasergänzungen decken zusätzlich praxistaugliche
Kurzhantel-, Langhantel- und Kettlebellbegriffe ab.

Die bereinigte Inventarreferenz liegt dauerhaft unter
`docs/reference/activity-v2/`; Fotos, Trainingsplan und Gesundheitskontext
werden nicht ausgeliefert und sind keine Runtime-Abhängigkeit. Der kleine
versionierte Pflegeweg steht im `Catalog Maintenance Runbook`: CODEX prüft
vor Planvorschlägen den realen Katalog, ergänzt eindeutige Lücken kontrolliert
und mutiert niemals einen bereits produktiven Snapshot.

### 5.7 Katalogpflege im Realbetrieb

C2 muss nicht jede theoretisch mögliche Übung vorwegnehmen. Der erste reale
Studioeinsatz prüft deshalb zugleich Suchvokabular und Bedienbarkeit. Fehlt
eine Übung, gilt dieser Vertrag:

1. Die laufende Session erhält keinen freien oder spontan erfundenen Key.
2. Zu Hause prüft der read-only Katalog-Inspector, ob bereits ein passender
   kanonischer Key oder Alias existiert.
3. Gleiche Bewegungsidentität und Messsemantik ergeben einen Alias; eine
   fachlich andere Bewegung oder inkompatible Messsemantik benötigt einen
   neuen kontrollierten Key.
4. Die Ergänzung erfolgt als nächste vollständige `catalog_version` und bleibt
   Teil von Activity V2. Sie erzeugt weder Activity V3 noch automatisch eine
   neue Großroadmap.
5. Eine kleine Wartung genügt, solange Schema, Tracking-Modi, Security und
   Consumer-Verträge unverändert bleiben.

R4 muss dafür einen neutralen Kein-Treffer-Zustand besitzen und seine Semantik
über eine injizierte beziehungsweise ausgewählte Katalogversion beziehen. Eine
dauerhafte Verdrahtung ausschließlich auf `semanticsV2` wäre kein tragfähiger
Wartungsvertrag.

Der R2-JS-Lookup löst seine Semantik derzeit noch fest über den v1-Namespace
auf. R4 erweitert deshalb ausschließlich `loadLastPerformance` um eine
optionale, explizite Semantikinjektion und behält den bisherigen v1-Aufruf als
rückwärtskompatiblen Fallback. Die Eingabe wird gegen die ausgewählte aktuelle
Semantik geprüft; eine historische Antwort wird anhand ihrer unveränderlichen
Snapshots validiert und darf aus einer älteren Katalogversion stammen.
`commitSession` und dessen heutige Versionsprüfung werden in R4 nicht
verändert. Diese Trennung verhindert, dass eine reine Read-UI vorzeitig den
noch offenen Commit-Rolloutvertrag entscheidet.

Der heutige R2-Commit akzeptiert nur die höchste vorhandene Katalogversion.
C2 ist dadurch noch nicht gefährdet, weil kein produktiver Activity-V2-
Consumer schreibt. Vor einer späteren Katalogversion bindet R7 einen
wiederhergestellten Draft an seinen gespeicherten Katalogsnapshot und R8
entscheidet, welche bereits vorhandenen unveränderlichen Versionen während
eines Rollouts weiter commitfähig bleiben. R12 beweist anschließend
Katalogauswahl, Aktivierungsreihenfolge und das Verhalten gecachter
PWA-Clients. Bis diese Gates geschlossen sind, wird keine weitere höchste
Katalogversion beiläufig produktiv eingefügt.

---

## 6. Historien-Lookup

Nach Auswahl eines kanonischen Keys fragt MIDAS dessen letzte abgeschlossene
Ausführung ab.

R2 stellt dafür bereits den noch nicht produktiv verdrahteten RPC
`public.activity_v2_last_performance(p_item_key text)` bereit. Er liefert für
den permanent authentifizierten Owner den letzten vollständigen Itemblock nach
`started_at desc, session.id desc` oder `null`, wenn noch keine Historie
existiert.

### 6.1 Kraftübung

Für `biceps_curl` liefert der Lookup:

- Datum der letzten abgeschlossenen Session mit diesem Key
- alle damals gespeicherten Sätze
- Gewicht und Wiederholungen je Satz
- optionale Übungsnotiz

Der Lookup liefert die letzte Ausführung des Übungsblocks, nicht beliebige
einzelne Sätze aus mehreren Sessions.

### 6.2 Daueraktivität

Für `swimming` oder `cycling` liefert der Lookup:

- Datum der letzten abgeschlossenen Ausführung
- damalige Dauer
- optionale Distanz
- optionale Notiz

Eine Intensität gehört nicht zum R2-Speicher- oder Lookup-Vertrag. R6 hat O-6
für die erste produktive Activity-V2-Ausbaustufe mit `keine Intensität`
geschlossen; ein späterer neuer Vertrag wird nicht vorweggenommen.

### 6.3 Kein vorheriger Eintrag

Wenn keine Historie existiert, zeigt MIDAS neutral:

`Noch kein vorheriger Eintrag.`

Das ist kein Fehler und blockiert die Erfassung nicht.

---

## 7. Lokaler Draft

Während einer laufenden Session sind alle Eingaben zunächst ein lokaler Draft.

R3 hält diesen Draft bewusst nur im Arbeitsspeicher. Ein normaler Wechsel zu
YouTube, ChatGPT oder einer anderen App darf weder Draft noch Uhr zurücksetzen:
Die Uhr wird aus dem gespeicherten Startzeitpunkt berechnet und nicht durch
gezählte Vordergrund-Ticks bestimmt. Wird der Browserprozess von Android
beendet oder die Seite neu geladen, kann der R3-Draft dagegen noch verloren
gehen.

Die dauerhafte Absicherung gegen Reload, Prozessabbruch und Betriebssystem-
Reclaim wird in R7 zunächst isoliert implementiert und bewiesen. R8 übernimmt
danach dieselbe Recovery in die interne Produktintegration und führt den
Android-PWA-Smoke aus. Activity V2 wird nicht für echte Sessions verwendet,
bevor beide Grenzen grün sind; die produktive Aktivierung bleibt zusätzlich
bis R12 gesperrt. R3 darf das Risiko diagnostisch sichtbar machen, aber keine
halbe IndexedDB-Lösung vorwegnehmen.

Der vollständig ausgebaute Draft ab R7 enthält:

- stabile clientseitige `request_id` als Draft- und spätere Commit-Identität,
  nicht als serverseitige Session-ID
- `catalog_version` des beim Draftstart aktiven Katalogs
- Startzeit
- optionale Sessionnotiz
- ausgewählte Items mit kanonischem `item_key`
- aktuelle Reihenfolge als `item_order`
- eingegebene Sätze oder Aktivitätswerte
- aus der Feldpolicy abgeleiteter Leer-, Teil- oder Vollständigstatus der
  Satzzeilen; kein separates Abschlussfeld und kein Satzzeitpunkt
- Draft-Schema-Version

Der letzte erfolgreiche Autosave-Zeitpunkt ist kein fachliches Draftfeld und
erzwingt deshalb keine Draft-v4-Version. Er gehört ausschließlich in den
versionierten Recovery-Envelope neben den unveränderten vollständigen Draft v3.

IndexedDB dient ausschließlich:

- als Autosave-Speicher
- zur Wiederherstellung nach Reload oder App-Schließen
- zum kontrollierten Verwerfen einer unvollständigen Session

IndexedDB ist weder historische Wahrheit noch primäre Analysequelle.

Für R7 gilt folgender Recovery-Vertrag:

- Activity V2 erhält eine getrennte IndexedDB-Grenze. R7 erhöht weder die
  Version der produktiven `healthlog_db` noch verändert es deren Stores oder
  Bootvertrag.
- MIDAS hält als Single-User-App genau einen logischen Slot pro lokalem
  Browserprofil und Origin für eine aktive Activity-V2-Session. Desktop,
  Android-PWA, ein anderes Browserprofil oder gelöschte Site-Daten teilen
  diesen Slot nicht. Es entsteht weder Cloud-Sync noch ein Draftarchiv oder
  unbegrenztes lokales Wachstum.
- Der gespeicherte Datensatz verwendet einen eigenen versionierten Recovery-
  Envelope und enthält den vollständigen Draft v3 sowie mindestens
  `slot_generation`, eine monotone lokale Schreibsequenz, `request_id`,
  persistierte `revision` und den letzten erfolgreichen Speicherzeitpunkt.
- Gespeichert werden nur fachlich veränderte Drafts. Ein vollständig leerer,
  unberührter Startzustand erzeugt keinen wiederherstellbaren Datensatz.
- Erfolgreiche Draftmutationen stoßen ein serialisiertes, zusammenfassbares
  Autosave an. Es gibt höchstens einen aktiven Schreibpfad. Ein Write darf nur
  auf der zuvor beobachteten Slotgeneration und Schreibsequenz aufsetzen;
  `request_id` und persistierte `revision` müssen ebenfalls zum erwarteten
  Branch passen. Eine lediglich höhere lokale Revision gewinnt nicht, weil
  zwei Tabs denselben Request unabhängig verzweigen können.
- Beim Wechsel in den Hintergrund und bei `pagehide` wird ein ausstehender
  Snapshot bestmöglich sofort geschrieben. Die UI darf dabei nicht auf einen
  langen Netzwerk- oder Speicherablauf warten.
- Eine andere `request_id`, eine ältere Revision oder ein noch laufender Write
  nach bewusstem Verwerfen darf den aktiven Draft niemals still überschreiben
  oder wiederauferstehen lassen.
- Bewusstes Verwerfen invalidiert die beobachtete Slotgeneration atomar und
  entfernt den Draftinhalt. Ein kleiner leerer Generationstombstone darf als
  Konfliktschutz bestehen bleiben; er ist weder ein Draft noch Historie. Kann
  diese Invalidierung nicht bestätigt werden, bleibt die Session geöffnet und
  wird nicht als verworfen behauptet.
- Nach bestätigtem Tombstone wird der verworfene Recoverycontroller terminal
  beendet und nicht erneut verwendet. Eine spätere neue Session erhält einen
  frischen Draft und Controller; ihr Erfolg hängt nicht von einem zweiten,
  potenziell fehlschlagenden Reset des alten RAM-Drafts ab.
- Recovery verwendet die im Draft gespeicherte `catalog_version`. Sie darf
  weder still auf die aktuell höchste Version angehoben noch allein wegen
  ihres Alters verworfen werden.
- Unbekannte Recovery-/Draftschemata, beschädigte Datensätze oder unauflösbare
  Katalogversionen werden nicht still migriert oder gelöscht. MIDAS zeigt
  einen verständlichen, fail-closed Zustand und erlaubt erst danach bewusstes
  Verwerfen.
- Quota-, IndexedDB- und Schreibfehler beenden die In-Memory-Session nicht.
  MIDAS zeigt sichtbar, dass die lokale Wiederherstellung derzeit nicht
  garantiert ist, und versucht bei einer späteren Mutation erneut zu sichern.
- Ein aktiver Draft besitzt kein automatisches Ablaufdatum. Eine ungewöhnlich
  lange verstrichene Sessionzeit wird beim expliziten Fortsetzen sichtbar,
  aber nicht automatisch korrigiert oder gelöscht.

Beim Modulstart mit vorhandenem Draft werden genau diese Optionen angeboten:

- Session fortsetzen
- Session verwerfen

R7 entfernt den aktiven Recovery-Draft nur nach bewusstem, atomar bestätigtem
Verwerfen; der Generationstombstone darf zum Schutz vor stale Writes bestehen
bleiben. R8 ergänzt die zweite zulässige Löschgrenze: erst nach einem
bestätigten erfolgreichen Supabase-Commit. Ein fehlgeschlagener oder unklarer
Commit behält den Draft.

---

## 8. Ziel-Datenmodell

R2 hat die endgültigen Namen und Kernconstraints des additiven Speichervertrags
festgelegt. Er besteht aus der unveränderlichen Katalogprojektion
`health_activity_catalog_entries` und drei Ebenen ownergebundener Historie.

### 8.1 `health_activity_sessions`

Container der abgeschlossenen Session.

Bewiesene Kernfelder:

- `id`
- `user_id`
- `request_id`
- `request_fingerprint`
- `started_at`
- `ended_at`
- `duration_min`
- generierter Vienna-Kalendertag `day`
- optionaler Titel
- optionale Notiz
- `created_at`
- `updated_at`

Supabase speichert in der ersten produktiven Activity-V2-Ausbaustufe nur
abgeschlossene Sessions. Unfertige Drafts bleiben lokal.

### 8.2 `health_activity_session_items`

Ein konkreter Eintrag innerhalb einer Session.

Bewiesene Kernfelder:

- `id`
- `user_id`
- `session_id`
- `catalog_version`
- `item_key`
- `item_label_snapshot`
- `tracking_mode_snapshot`
- `equipment_snapshot`
- `load_comparability_snapshot`
- `field_policy_snapshot`
- `item_order`
- optionale `duration_min`
- optionale `distance_km`
- optionale Notiz
- `created_at`

Der Label-Snapshot erhält die historische Lesbarkeit, falls sich die
Repo-Bezeichnung später ändert.
R2 darf die in R1 festgelegten Messfelder speichern. Ein Intensitätsfeld ist im
R2-Schema nicht vorhanden; R6 hat für die erste produktive Activity-V2-
Ausbaustufe ausdrücklich keine Intensitätssemantik oder Eingabeform ergänzt.

### 8.3 `health_activity_item_sets`

Sätze eines `strength_sets`-Items.

Bewiesene Kernfelder:

- `id`
- `user_id`
- `session_item_id`
- `set_order`
- festes `tracking_mode: strength_sets`
- entry-abhängig exakt eines von `reps`, `duration_sec` oder `distance_m`
- entry-abhängig höchstens eines von `weight_kg` oder `assistance_kg`
- `created_at`

Bewusst nicht vorgesehen sind unklare Felder wie `value_number_1` und
`value_number_2`. Maschinenlesbare Kerndaten benötigen sprechende Feldnamen.
R5 hat den Satzabschluss- und Zeitpunktvertrag entschieden: Status bleibt rein
abgeleitet, und R2 wird nicht durch ein `completed_at` oder ein anderes
Abschlussfeld erweitert.

### 8.4 Fachliche Invarianten

- Eine Session gehört genau dem authentifizierten MIDAS-User.
- Ein Item gehört genau zu einer Session.
- Ein Satz gehört genau zu einem `strength_sets`-Item.
- `item_key` bleibt unabhängig von Session und Reihenfolge stabil.
- Derselbe `item_key` erscheint in der ersten produktiven
  Activity-V2-Ausbaustufe höchstens einmal pro Session; weitere Sätze werden
  demselben Item hinzugefügt.
- Mehrere Sessions pro Kalendertag sind erlaubt.
- Eine leere Session darf nicht abgeschlossen werden.
- Satzreihenfolge ist innerhalb eines Items eindeutig.
- Dauer, Distanzen, Gewicht und Wiederholungen besitzen klare Einheiten und
  Wertebereiche.
- Kein Item benötigt Felder, die nicht zu seinem Tracking-Modus gehören.
- Sessiondauer und Itemdauer besitzen getrennte Semantik und werden in
  Zusammenfassungen nicht doppelt gezählt.

---

## 9. Gemeinsamer Commit-Pfad

Gym, Radfahren, Schwimmen und Hallenfußball enden im selben fachlichen
Speicherpfad.

Der heutige RPC `activity_add` kann diesen Vertrag nicht abbilden. Activity V2
verwendet deshalb den in R2 bereitgestellten atomaren Commit
`public.activity_v2_commit_session(p_request_id uuid, p_payload jsonb)`.

Durch R2 bewiesener serverseitiger Ablauf:

1. Request authentifizieren.
2. Session-Payload vollständig validieren.
3. Session anlegen.
4. Items anlegen.
5. Sätze anlegen.
6. Eigentum und Relationen prüfen.
7. Transaktion vollständig abschließen.
8. kanonische gespeicherte Session zurückgeben.

Die spätere Consumerregel bleibt: Erst nach dieser bestätigten kanonischen
Antwort darf ein lokaler Draft entfernt werden. Dieser UI-/Draft-Schritt ist
noch nicht Teil von R2.

Bei einem Fehler darf keine halbe Session bestehen bleiben.

`request_id` und ein serverseitiger Payload-Fingerprint machen Retries
idempotent: derselbe Request mit identischem Inhalt liefert dieselbe Session,
mit geändertem Inhalt einen Konflikt. Der Browser besitzt keine direkten
Tabellen-Schreibrechte. Die isolierte JS-Datenzugriffsschicht ist vorhanden,
wird aber bis zu einer späteren Consumer-Roadmap nicht produktiv geladen.

---

## 10. Korrektur und Löschung

Fehleingaben müssen korrigierbar sein.

Activity V2 benötigt deshalb:

- Liste abgeschlossener Sessions
- Detailansicht einer Session
- kontrollierte Korrektur von Sessiondaten
- kontrollierte Korrektur von Items und Sätzen
- explizit bestätigte Löschung einer Session

Korrekturen dürfen weder fremde Sessions verändern noch verwaiste Items oder
Sätze hinterlassen.

Der genaue Update-Vertrag wird vor der Feature-Aktivierung festgelegt und
getestet.

---

## 11. Maschinenlesbarer Activity-Export

Der Coaching-Export ist ein primäres Produktziel und kein späteres
Nebenprodukt.

### 11.1 Zweck

Der Export soll unter anderem diese Frage ermöglichen:

> Das waren meine Aktivitäten und Trainings der letzten sechs Monate. Welche
> Anpassungen sind unter Berücksichtigung meines CKD-, Blutdruck-, Körper- und
> Arztkontexts sinnvoll?

MIDAS erstellt keine medizinische Trainingsverordnung. Der Export liefert
strukturierten Kontext für eine nachgelagerte Analyse.

### 11.2 Exportvertrag

Der Export enthält mindestens:

- `schema_version`
- `generated_at`
- `timezone`
- expliziten Zeitraum
- Vollständigkeitsstatus und Zähler
- Sessions
- Items mit stabilen Keys und Label-Snapshots
- Tracking-Modi
- benannte Einheiten
- Sätze mit Wiederholungen, Satzdauer oder Satzdistanz
- dokumentierte Last beziehungsweise inverse Unterstützung gemäß Feldpolicy
- Dauer- und Distanzwerte
- optionale Notizen
- Datenqualitäts- oder Validierungshinweise

Die Struktur ist sessionorientiert und deterministisch sortiert.

### 11.3 Zeitraum

- Standardexport: letzte sechs Monate
- optional drei Monate
- optional freier gültiger Zeitraum

Der Exportzeitraum ist nicht automatisch identisch mit der
Datenaufbewahrungsdauer.

### 11.4 Verhältnis zum Health Export

Der detaillierte Activity-Export darf zunächst eigenständig bleiben.

Der bestehende Health Export enthält weiterhin den medizinischen
Gesamtkontext. Später kann ein Analyse-Bundle beide versionierten Verträge
zusammenführen, ohne Satzdetails in den Arztbericht zu drücken.

### 11.5 Rohdaten und ableitbare Metriken

Gespeicherte Satz- und Sessionwerte bleiben die Source of Truth. Kennzahlen
werden daraus berechnet und nicht als zweite widersprüchliche Wahrheit
parallel gepflegt.

Ableitbar sind unter anderem:

- Volumen pro Satz als `weight_kg * reps`
- Volumen pro Übung und Session
- Anzahl Sätze und Wiederholungen
- letzter Trainingszeitpunkt je `item_key`
- Trainingshäufigkeit und aktive Tage
- Gesamtdauer und durchschnittliche Sessiondauer
- Dauer- und Distanzentwicklung
- Verteilung nach Aktivitäts- oder Muskelgruppentags

Volumenwerte desselben generischen Keys werden bei
`load_comparability: device_relative` nicht unbesehen zwischen Geräten,
Studios oder Kabelzügen verglichen. Key, Equipmentklasse und
Lastvergleichbarkeit sind Teil des fachlichen Kontexts.

---

## 12. Arztansicht und Bericht

Der Arztbericht braucht keine einzelnen Übungen, Satzgewichte oder
Trainingsplanansichten.

Er erhält nur eine fachlich ruhige Zusammenfassung, zum Beispiel:

- Anzahl abgeschlossener Aktivitätssessions
- aktive Tage
- Gesamtdauer auf Basis der Sessiondauer
- durchschnittliche Dauer
- grobe Verteilung von Kraft- und Ausdaueraktivität
- letzter Aktivitätstag
- optional relevante Datenqualitätswarnung

Die Doctor View darf bei Bedarf eine Sessionliste als sekundären Drilldown
anzeigen. Satzdetails bleiben primär im Activity-Modul und im Coaching-Export.

---

## 13. Bestehender Activity-V1-Vertrag

Heute existiert:

- `health_events` mit `type = activity_event`
- genau ein flacher Eintrag pro Tag
- `activity`
- `duration_min`
- optionale Notiz
- RPCs `activity_add`, `activity_list`, `activity_delete`

Produktive Consumer sind mindestens:

- Activity-Capture
- Doctor View
- Health Export
- Arztbericht-Edge-Function
- Protein Targets
- Trendpilot

### 13.1 Migrationsregel

Activity V2 wird parallel aufgebaut.

- keine künstliche Umwandlung alter Freitexteinträge in Übungen oder Sätze
- kein Dual Write neuer Sessions als zusätzliches `activity_event`
- keine Löschung alter Activity-V1-Daten beim V2-Cutover
- Legacy-Daten bleiben als historische Zusammenfassung lesbar
- Consumer werden erst nach bewiesener V2-Parität umgestellt
- Doppelzählung zwischen V1 und V2 ist ausdrücklich zu verhindern

Eine spätere Kompatibilitätsschicht darf V1- und V2-Aktivitäten für
Zusammenfassungen vereinigen, ohne die ursprünglichen Daten umzuschreiben.

---

## 14. Protein Target und Trendpilot

Diese Consumer dürfen nicht still vom neuen Modell abgehängt werden.

Vor dem V2-Cutover ist zu definieren:

- was als aktiver Tag zählt
- ob mehrere Items derselben Session nur einmal zählen
- wie Kraft- und Daueraktivität bewertet werden
- wie V1- und V2-Daten ohne Doppelzählung gemeinsam gelesen werden
- welche Berechnung bewusst unverändert bleibt

Activity V2 liefert Daten. Es darf medizinisch orientierte Faktoren nicht
unbemerkt verändern.

---

## 15. Datenaufbewahrung

Für die erste produktive Activity-V2-Ausbaustufe wird keine automatische
Löschung produktiver Activity-V2-Daten eingeführt.

Begründung:

- reale Datenmenge ist noch unbekannt
- strukturierte Trainingsdaten sind im Verhältnis klein
- eine Pause von mehr als sechs Monaten soll nicht automatisch die letzte
  Vergleichsbasis vernichten
- der sechsmonatige Coaching-Export begrenzt bereits den üblichen
  Analyseumfang

Nach ausreichend realer Nutzung wird separat geprüft:

- tatsächliche Zeilen- und Speicherentwicklung
- Nutzen älterer Vergleichsdaten
- gewünschte Detail-Retention
- mögliche Langzeitaggregate
- Legacy-Bereinigung

Retention wird nicht vorsorglich mit der ersten Implementierung gekoppelt.

---

## 16. Security- und Betriebsvertrag

- MIDAS bleibt eine Single-User-App.
- Single-user bedeutet trotzdem nicht ungeprüfte öffentliche Datenzugriffe.
- Neue Tabellen im exponierten Schema benötigen explizite Grants und RLS.
- Der unpersönliche Katalog ist kontrolliert lesbar; historische Tabellen
  begrenzen ihre Zeilen auf den permanent authentifizierten Owner.
- `authenticated` und `service_role` besitzen auf den vier V2-Tabellen nur
  `SELECT`, aber kein direktes Tabellen-DML.
- Nur `authenticated` darf die beiden Activity-V2-RPCs ausführen; `anon` und
  `PUBLIC` sind ausgeschlossen.
- Der Commit ist ein bewusst gehärteter `security definer` unter Owner
  `postgres` mit leerem `search_path`; der Lookup bleibt `security invoker`.
- Der signierte Claim `is_anonymous` muss explizit `false` sein. Fehlende,
  `null`- oder anonyme Claims scheitern geschlossen.
- `service_role` wird niemals im Browser verwendet.
- Die atomare Commit-Funktion prüft den authentifizierten User und alle
  Relationen.
- Historienabfragen sind begrenzt und deterministisch sortiert.
- Fehlerantworten geben keine unnötigen Datenbankinterna an den Client weiter.
- Draft-Recovery darf keine produktive Supabase-Session vortäuschen.
- Produktive SQL-, Deploy- und Datenwrite-Schritte bleiben Owner-gated.

---

## 17. Nicht-Ziele von Activity V2

- kein verpflichtender Trainingsplan
- keine automatische Übungsauswahl
- keine KI-Abhängigkeit für Suche oder Speicherung
- keine Embedding- oder Vektorsuche in der ersten produktiven
  Activity-V2-Ausbaustufe
- keine Kalorienberechnung als Kernfunktion
- keine Schrittzählung oder Wearable-Integration
- keine Streaks, Abzeichen oder Gamification
- keine autonome CKD-Trainingsverordnung
- keine Diagnose oder Therapieentscheidung
- kein Multi-User- oder Trainerportal
- keine erzwungene Vollständigkeit jeder Alltagstätigkeit

---

## 18. Roadmap-Reihenfolge

Jede Umsetzungsroadmap folgt den Verträgen unter `docs/templates/`.
UI-Roadmaps benötigen einen Live-Server-Smoke. Datenbank-Roadmaps benötigen
zusätzlich disposable SQL-Tests und ein ausdrückliches produktives Gate.

Das Feature bleibt bis zum vollständigen End-to-End-Nachweis einschließlich
der produktiven Consumer verborgen oder deaktiviert.

### 18.1 Rolling-Wave-Vertrag

Dieser Masterplan ist die stabile Abhängigkeits- und Reihenfolgekarte. Er
ersetzt nicht die ausführlichen Arbeitsverträge der einzelnen Roadmaps.

- Nur die jeweils nächste Roadmap wird vollständig und ausführungsreif
  erstellt.
- Die Folgeroadmap wird erst aus dem bewiesenen Abschlussstand ihrer
  Vorgängerin abgeleitet. Maximal eine Roadmap darf als grober Ausblick
  vorbereitet werden.
- Die R1-R14-Beschreibungen bleiben bis dahin Zielkorridore. Sie dürfen keine
  noch unbewiesenen Tabellen-, API-, UI- oder Migrationsdetails erzwingen.
- Jede Roadmap erhält gemäß `docs/templates/` einen eigenen
  Ausführungs-Chat, eine vollständige Startkarte und einen Fresh-Chat-Test.
- Beim Abschluss synchronisiert S6 nur nachgewiesene Vertragsänderungen in
  diesen Masterplan. Reihenfolge, IDs oder Scope werden nicht still geändert.
- Eine notwendige Umreihung wird mit Ursache, betroffenen Abhängigkeiten und
  neuem Gate im Masterplan dokumentiert, bevor die nächste Roadmap entsteht.
- Source of Truth für eine neue Roadmap sind dieser Masterplan, die
  abgeschlossene Vorgänger-Roadmap, aktuelle Module Overviews und der reale
  Code-/Datenstand. Der lange Denkraum ist keine zusätzliche
  Ausführungsvoraussetzung.

### 18.2 Rebaseline nach R6

Die Reihenfolge ab R7 wurde am 2026-08-09 nach dem bewiesenen R6-Abschluss
erneut gegen Recovery-, Commit-, Consumer- und Coaching-Verträge geprüft.

- Die bisherige R8 wurde wegen unterschiedlicher Risiko- und Testgrenzen in
  R8 `Core Commit and Android Recovery Integration` und R9 `Session History,
  Detail, Correction and Deletion` geteilt.
- Die bisherige R9 wird R10 `Completed Activity Coaching Export V1`.
- Die bisherige R10 wird R11 `Doctor View and Report Integration`.
- Die bisherige R11 wird R12 `Protein Target, Trendpilot, Legacy
  Compatibility and Product Cutover`.
- Der vorbereitete Sessionimport bleibt als R13 bestehen, wird aber eindeutig
  als `Prepared Session Template Import V1` vom R10-Ist-Datenexport getrennt.
- Die bisherige R12 wird als optionale R14 `Retention and Legacy Cleanup` ans
  Ende verschoben und blockiert R13 nicht.

Diese Rebaseline verändert keine abgeschlossene R1-R6-/C2-Implementierung.
Sie trennt den atomaren Write, destruktive Historienoperationen,
maschinenlesbaren Ist-Export, medizinische Consumer und optionalen
Vorlagenimport in eigenständig prüfbare Verträge.

Verbindlichkeit der verbleibenden Folge:

- R7 bis R12 bilden den Core-Pfad. Sie sind für verlustsichere reale Nutzung,
  vollständige V1-Consumer-Parität und den kontrollierten produktiven Cutover
  notwendig.
- R13 ist eine gewünschte Post-Core-Komfortfunktion für den Coaching-
  Kreislauf, aber keine Voraussetzung für den produktiven Activity-V2-Kern.
- R14 ist eine optionale Hygieneentscheidung. Eine eigene R14-Roadmap wird nur
  erstellt, wenn reale Datenmenge, Wartungsaufwand oder Speicherverbrauch
  einen Bedarf belegen.

### R1 - Activity V2 Semantics and Product Contract

Status: `DONE`.

Nachgewiesenes Ergebnis:

- versioniertes Semantik-Schema `midas.activity-catalog.v1`
- `catalog_version: 1` mit 78 aktiven, planunabhängigen Entries
- klassische generische Keys und `device_relative` Lastgrenze
- kontrollierter Repo-Katalog ohne freie benutzerdefinierte Einträge
- drei Tracking-Modi und vollständige Messfeldpolicies
- deterministische lokale Suche und stabiler Browser-/Testvertrag
- Session-/Item-Invarianten als verbindlicher R2-Eingangsvertrag

Nachweise:

- [R1 Catalog Baseline Contract](MIDAS%20Activity%20V2%20R1%20Catalog%20Baseline%20Contract.md)
- [R1 Semantics and Product Contract Roadmap](<archive/MIDAS Activity V2 R1 Semantics and Product Contract Roadmap (DONE).md>)

Warum zuerst:

Alle späteren Tabellen, UI-Komponenten und Historienabfragen benötigen stabile
Keys und eindeutige Feldsemantik.

### R2 - Unified Activity Database and Commit API

Status: `DONE`.

Nachgewiesenes Ergebnis:

- unveränderliche Datenbankprojektion der 78 aktiven R1-Katalogeinträge
- drei normalisierte, ownergebundene historische Tabellen mit Constraints,
  fünf Indizes, vier SELECT-Policies und expliziten Minimalrechten
- gehärteter atomarer und retry-idempotenter Session-Commit als einziger
  Schreibpfad; kein direktes Tabellen-DML für Client- oder Service-Rollen
- ownergebundener Last-Performance-Lookup mit vollständigem Item-/Satzblock
- isolierte JS-Datenzugriffsschicht ohne produktiven Scriptload
- PostgreSQL-17-Fixture für Rerun, Rollback, Race, Zeit, RLS/ACL und Lookup
- produktiver Cutover mit 78 Katalogzeilen und leerer V2-Historie; Activity V1
  und alle sichtbaren Consumer unverändert

Nachweise:

- [R2 Unified Database and Commit API Roadmap](<archive/MIDAS Activity V2 R2 Unified Database and Commit API Roadmap (DONE).md>)
- [R2 Unified Database and Commit API Evidence](<archive/MIDAS Activity V2 R2 Unified Database and Commit API Evidence (DONE).md>)

Warum danach:

Der neue Speichervertrag wird isoliert aufgebaut, bevor sichtbare UI davon
abhängt. Activity V1 bleibt produktiv unverändert.

### R3 - Shared Session Draft and UI Shell

Status: `DONE`.

Nachgewiesenes Ergebnis:

- isolierte, responsive Vollflächen-Shell mit kontrolliertem R1-Katalog-Picker,
  Itemreihenfolge, Notiz, Fokusführung und transaktionalem Cleanup
- flüchtige Draft-Factory mit stabiler R2-`request_id`, aktueller
  `catalog_version`, geschützten Snapshots und deterministischen Mutationen
- leere Session ohne laufende Trainingszeit; zeitstempelbasierter Timerstart
  beim ersten erfolgreich hinzugefügten Item
- gemeinsamer Close-/Escape-Verwerfungs-Guard für geänderte Drafts
- normaler App-/Tab-Wechsel erhält Items, Notiz und fortschreitende Laufzeit
- 50/50 gemeinsame R1-/R2-/R3-Contract-Fälle sowie Edge-Harness bei 1440x900,
  390x844 und 320x800 und 32-Sekunden-Background-Smoke bestanden
- kein Produktload, Netzwerk, Storage, R2-RPC, Save oder Activity-V1-Cutover

Nachweis:

- [R3 Shared Session Draft and UI Shell Roadmap](<archive/MIDAS Activity V2 R3 Shared Session Draft and UI Shell Roadmap (DONE).md>)

Bewusste R3-Grenze:

- Reload oder durch Android beendeter Browserprozess darf den isolierten
  R3-Draft noch verlieren.
- Diese Grenze ist für den produktiven Einsatz nicht akzeptiert. R7 schließt
  den isolierten Storage-/Recovery-Vertrag; R8 beweist ihn anschließend in der
  internen Android-PWA-Integration.
- R3 verändert weder Supabase-Auth-Token noch R2-Daten, ruft keinen
  Commit-/Lookup-RPC auf und ersetzt Activity V1 nicht.

Warum danach:

Der gemeinsame Container muss stabil sein, bevor unterschiedliche
Eingabemasken eingebaut werden. R3 und C2 sind abgeschlossen; R4 darf jetzt
die Such- und Historieninteraktion ergänzen.

### C2 - Catalog Version 2 Studio Vocabulary Maintenance

Status: `DONE` am 2026-08-01.

Typ:

- begrenzte Katalog-Wartungsroadmap außerhalb der funktionalen
  R1-R14-Nummerierung
- Ausführungsfenster nach abgeschlossenem R2/R3 und zwingend vor R4
- R3 ist abgeschlossen; C2 wurde vor R4 abgeschlossen

Ziel:

- verifiziertes Studioinventar kontrolliert als Referenz übernehmen
- klare Alias-Kandidaten freigeben
- offene Identitätsentscheidungen für getrennte Maschinenbewegungen treffen
- vollständige `catalog_version: 2` statt still veränderter Version 1 anlegen
- Semantikartefakt und Tests versioniert fortschreiben sowie einen separaten
  Katalog-v2-Vertrag anlegen; der R1-Baseline-Vertrag bleibt unverändert
- vollständigen Katalogstand in den durch R2 bewiesenen Speichervertrag
  projizieren
- exakte Suchmatrix für alle 20 Kraftmaschinenbezeichnungen sowie die
  relevanten Cardiobezeichnungen nachweisen; `Multi Hip` muss dabei
  deterministisch bewegungsspezifische Kandidaten statt eines erfundenen
  Einzelkeys liefern

Nicht-Ziele:

- kein Trainingsplan
- keine medizinische Übungsempfehlung
- keine Änderung des R2-Datenmodells
- keine Hersteller- oder Studio-ID als Historienidentität
- keine produktive Activity-V2-Aktivierung

Reales Ergebnis:

- bereinigte 20-Kraftmaschinen-/6-Cardio-/Functional-Referenz im Repo
- vollständiger Katalog v2 mit 80 aktiven Entries; v1 bleibt exakt 78
- 47 Aliasergänzungen an 24 bestehenden Keys und zwei neue Keys
  `high_row`/`total_abdominal`
- additive tief eingefrorene `semanticsV2`-API, 58 Suchfälle und read-only
  Katalog-Inspector samt kleinem Wartungsrunbook
- insert-only SQL 21 produktiv PASS; v1/v2 Repo=Produkt vollständig gleich,
  andere Versionen und v2-Sessionreferenzen 0, RLS/Policies/ACL/RPC unverändert
<!-- markdownlint-disable MD013 -->
- [C2 Catalog Contract](<MIDAS Activity V2 C2 Catalog Version 2 Contract.md>),
  [C2 Roadmap](<archive/MIDAS Activity V2 C2 Catalog Version 2 Studio Vocabulary Roadmap (DONE).md>)
  und [C2 Evidence](<archive/MIDAS Activity V2 C2 Catalog Version 2 Studio Vocabulary Evidence (DONE).md>)
<!-- markdownlint-enable MD013 -->

Warum an dieser Stelle:

R2 muss zuerst beweisen, dass vollständige unveränderliche Katalogversionen
gespeichert und referenziert werden können. R4 darf danach nicht mit
synthetischem Vokabular gebaut werden, sondern muss die realen
Maschinenbezeichnungen aus Stephans Studio deterministisch finden.

### R4 - Search and Last-Performance Lookup

Status: `DONE` am 2026-08-08; vollständig isoliert, kein Produktload und kein
SQL-/RPC-/Commit-/Draftschema-Delta.

Roadmap:

- [R4 Search and Last-Performance Lookup Roadmap](<archive/MIDAS Activity V2 R4 Search and Last-Performance Lookup Roadmap (DONE).md>)

Ziel:

- lokale Suche im Semantikkatalog
- freigegebene `catalog_version: 2` und grüne Studio-Suchmatrix als
  Eingangsgate
- kanonische Auswahl
- letzte Ausführung aus Supabase
- neutrale No-History-Anzeige
- begrenztes und deterministisches Query-Verhalten
- versionsagnostischer Semantik-Consumer über eine explizit injizierte oder
  ausgewählte Katalogversion; keine dauerhafte Produktkopplung nur an
  `semanticsV2`
- rückwärtskompatible, ausschließlich lookup-spezifische Semantikinjektion in
  `loadLastPerformance`; historische Snapshotantworten dürfen eine ältere
  `catalog_version` tragen
- keine Änderung an `commitSession`, SQL, RLS, Grants oder dem noch offenen
  Commit-Rolloutvertrag
- neutraler Kein-Treffer-Zustand ohne freien Key und ohne spontane
  Katalogmutation im Studio

Reales Ergebnis:

- `loadLastPerformance(itemKey)` bleibt v1-kompatibel; additiv kann der Lookup
  exakt `{ semantics }` erhalten. Historische Antworten werden unabhängig vom
  heutigen Katalog anhand ihrer gespeicherten Snapshots validiert.
- Die isolierte Shell nutzt lokale Suche mit Limit acht, kanonische Auswahl,
  optionale Lookup-Injektion, vier eindeutige Historienzustände, vollständige
  read-only Satzblöcke sowie flüchtigen Cache, Retry und Lifecycle-Raceguards.
- 65/65 Activity-V2-Contracttests, Katalogcheck `v2 / 80 / 47 / 58`, drei
  Browserviewports und ein 32-Sekunden-Backgroundcheck sind grün. CodeRabbit
  endete nach einer berechtigten Testhärtung mit 0 Issues.
- Historische Werte bleiben ausschließlich Gedächtnisstütze und erzeugen keine
  aktuellen Eingaben oder Draftmutation. Activity V1 und der Produktload sind
  unverändert; R5 baut auf diesem Displayvertrag auf.

Warum danach:

Das ist der zentrale Mehrwert gegenüber starren Trainingsplänen.

### R5 - Strength Set Editor

Status: `DONE` am 2026-08-08; vollständig isoliert, ohne Save, Supabase-Write,
IndexedDB-Recovery oder produktive Aktivierung.

Roadmap:

- [R5 Strength Set Editor Roadmap](<archive/MIDAS Activity V2 R5 Strength Set Editor Roadmap (DONE).md>)

Ziel:

- Übungskarte nach Liftlog-Grundidee
- Anzeige vorheriger Sätze ausschließlich read-only als Orientierung; keine
  Vorbefüllung aktueller Eingaben
- feldpolicy-gesteuerte Primärmessung aus R1: `reps`, `duration_sec` oder
  `distance_m`
- dokumentierte Last als `weight_kg` oder inverse Unterstützung als
  `assistance_kg` nur gemäß Entry-Policy
- bei jeder Strength-Übung genau drei leere Satzzeilen als praktischer
  Standard, ohne besondere Semantik für den dritten Satz
- Satz hinzufügen, bearbeiten und entfernen; Hinzufügen und Entfernen hält
  `set_order` lückenlos
- Satzabschluss wird automatisch aus den policy-gültigen Eingaben abgeleitet;
  es gibt weder Abschlusscheckbox noch Satzzeitpunkt
- vollständig leere nachlaufende Satzzeilen bleiben UI-Platzhalter;
  Teilzeilen und Lücken sind sichtbar ungültig und blockieren den späteren Save
- deutsche Dezimaleingabe mit Komma wird kontrolliert normalisiert
- stabile mobile Bedienung

Bewusst nicht Teil von R5:

- Pausentimer, 1RM-Feld, RPE, Warm-up-Markierung, Dropsets und Supersets
- Progressions-, Last- oder Wiederholungsempfehlungen sowie Trainingsplanlogik
- Save, Supabase-Write, IndexedDB-Recovery oder produktive Aktivierung

Die Session dokumentiert ausschließlich die tatsächlich ausgeführte Leistung.
Ein späteres LLM kann 1RM oder Progression aus den gespeicherten Rohdaten
ableiten, ohne dass R5 zusätzliche Trainingswissenschaft in den Editor einbaut.

Reales Ergebnis:

- `midas.activity-session-draft.v2` ergänzt pro Item vollständige Setrecords und
  die drei Methoden `addSet`, `removeSet` und `setSetField`; Strength startet mit
  drei leeren Zeilen, Non-Strength mit `sets: []`.
- Alle acht realen R1-Strength-Policykombinationen bestimmen exakt sichtbare
  Felder, Grenzen und Ganzzahl-/Dezimalregeln. Rohtext bleibt bis zum späteren
  Commit erhalten; Empty/Partial/Complete/Invalid sind ausschließlich
  abgeleitete UI-Zustände.
- Sets bleiben innerhalb `1..50` lückenlos, revisionsgenau und tief
  eingefroren. Reorder, Remove/Re-Add, Close/Discard, Lookup-, Timer- und
  Backgroundraces bewahren Draft, Fokus und read-only Historygrenze.
- Vier lokale Harness-Fixtures decken Empty, acht Policies und alle
  Historyzustände ab. `81/81` Activity-V2-Contracttests, Katalog
  `v2 / 80 / 47 / 58`, Syntax `10/10`, drei Viewports und zwei
  31-Sekunden-Other-Tab-Smokes sind grün; der finale CodeRabbit-Lauf meldete
  `0` Issues.
- Activity V1, `index.html`, R2-Commit/API, SQL/RPC/RLS/Grants, Supabase,
  Storage und produktive Navigation blieben unverändert.

Warum danach:

Der komplexeste Item-Typ wurde auf dem bewiesenen Session- und
Historienvertrag aufgebaut. R6 hat darauf Duration- und Distance-Editoren
ergänzt, ohne den R5-Strength-Vertrag umzudeuten.

### R6 - Duration and Distance Editor

Status: `DONE` am 2026-08-09; vollständig isoliert, ohne Save, Supabase-Write,
IndexedDB-Recovery oder produktive Aktivierung.

Roadmap:

- [R6 Duration and Distance Editor Roadmap](<archive/MIDAS Activity V2 R6 Duration and Distance Editor Roadmap (DONE).md>)

Ziel:

- itemweite Dauer für alle `duration`- und `duration_distance`-Einträge
- optionale Distanz ausschließlich für `duration_distance`
- gemeinsame optionale Itemnotiz
- gemischte Sessions ohne Umdeutung der R5-Strength-Sätze
- keine Intensität in der ersten produktiven Activity-V2-Ausbaustufe

Reales Ergebnis:

- `midas.activity-session-draft.v3` besitzt pro Item exakt `item_key`,
  `item_order`, `duration_min`, `distance_km`, `note` und `sets`; die elfte
  Methode `setItemField` mutiert ausschließlich policy-erlaubte Itemfelder.
- Vier reale `duration`-Entries verlangen Dauer und verbieten Distanz. Sieben
  reale `duration_distance`-Entries verlangen Dauer und erlauben Distanz
  optional. Beide Modi behalten `sets: []`.
- `duration_min` folgt exakt `1..1440` als Integer; `distance_km` folgt
  `0.01..1000` mit höchstens zwei Dezimalstellen. Itemnotizen bewahren bis 500
  Codepoints Rohtext; `''` wird als `null` geführt.
- Sessionuhr und manuelle Itemdauer bleiben unabhängige Wahrheiten. Die
  read-only R4-Historie befüllt aktuelle Werte nie vor; R5-Strength-Sätze samt
  `duration_sec` und `distance_m` bleiben unverändert.
- Mixed Sessions, vollständige Snapshot-Rebuilds, abgeleitete Itemzustände,
  Fokus-, Close-, Background- und Raceguards sowie responsive Darstellung sind
  isoliert bewiesen.
- `85/85` Activity-V2-Contracttests, Katalog `v2 / 80 / 47 / 58`, Syntax
  `10/10`, statische Isolation, `12/12` Harnesskombinationen, ein 41-Sekunden-
  Backgroundlauf und CodeRabbit mit `0 issues` sind grün.
- Activity V1, `index.html`, R2-Commit/API, SQL/RPC/RLS/Grants, Supabase,
  Netzwerk, Storage/IndexedDB und produktive Navigation blieben unverändert.

Warum danach:

Beide Tracking-Modusgruppen besitzen nun eine gemeinsame finale flüchtige
Draftform. R7 kann Recovery gegen genau diesen v3-Vertrag bauen, ohne einen
separaten Speicherweg für Non-Strength-Items zu erzeugen.

### R7 - IndexedDB Draft Recovery

Status: `DONE` am 2026-08-09; vollständig isoliert, ohne Supabase-Commit,
Produktload, Deploy oder Android-Prozess-Reclaim.

Roadmap und Evidence:

- [R7 IndexedDB Draft Recovery Roadmap](<archive/MIDAS Activity V2 R7 IndexedDB Draft Recovery Roadmap (DONE).md>)
- [R7 IndexedDB Draft Recovery Evidence](<archive/MIDAS Activity V2 R7 IndexedDB Draft Recovery Evidence (DONE).md>)

Bewiesener Iststand:

- Der fachliche Draft bleibt `midas.activity-session-draft.v3`; Restore bindet
  exakt die gespeicherte `catalog_version` und migriert weder Draft noch
  Katalog still.
- Die feste lokale DB `midas_activity_v2_recovery` v1 besitzt ausschließlich
  Store `session_recovery` und Slot `active_session`; `healthlog_db` bleibt
  unverändert.
- Der Recovery-Envelope v1 hält Generation, Schreibsequenz, UUID-Lease-Token,
  Request-ID, persistierte Revision, Savezeit und Draft oder `null`.
- Save und Discard vergleichen die vollständige geschützte Observation und
  bestätigen Erfolg erst nach Transaktionscommit. Autosave serialisiert einen
  aktiven Write und koalesziert nur den neuesten Pending-Snapshot.
- Bewusstes Verwerfen rotiert Token und Generation. Der leere Tombstone wehrt
  alte Tabs ab; ein persistenter Discardfehler lässt die RAM-Session offen.
- Das separate Recovery-Gate und die optionale Shellintegration beweisen
  Save/Reload/Continue, Discard/Reload, stale Writer, Conflict, Lifecycle,
  Degradation, Fokus und responsive Darstellung in realer Edge-IndexedDB.
- Final grün: Draft `24/24`, Recovery `28/28`, Shell `38/38`, vollständig
  `119/119`, Katalog `v2 / 80 / 47 / 58`, Syntax `12/12`, statische Isolation,
  Full Review und CodeRabbit-Re-Review `0 Findings`.

Ziel:

- getrennte Activity-V2-IndexedDB ohne Änderung der produktiven
  `healthlog_db`
- genau ein logischer Slot je Browserprofil und Origin für die aktive
  Single-User-Session; kein Cross-Device-Sync, Draftarchiv oder Retention
- versionierter Recovery-Envelope für den unveränderten vollständigen Draft v3;
  Autosavezeit und Konfliktmetadaten bleiben außerhalb des Draftschemas
- serialisiertes und zusammenfassbares Autosave nach erfolgreichen Mutationen
  sowie bestmögliches Flush bei `visibilitychange: hidden` und `pagehide`
- explizites Wiederherstellen oder Verwerfen; kein stilles Resume und keine
  automatische Löschung
- transaktionaler Compare-and-Swap-Vertrag über UUID-Lease-Token,
  Slotgeneration, Schreibsequenz, `request_id`, persistierte `revision` und die
  vollständige geschützte Observation, einschließlich Schutz vor verzweigten
  Same-Request-Drafts, stale Writes, Mehrtab-Konflikten und Wiederauferstehen
  nach Verwerfen
- atomarer Generationstombstone nach Verwerfen; bei fehlgeschlagener
  Invalidierung bleibt die In-Memory-Session geöffnet
- Wiederherstellung mit der im Draft gespeicherten `catalog_version`; ein
  Versionswechsel darf einen gültigen älteren Draft nicht still gegen den
  aktuellen Katalog rehydrieren oder unverständlich verwerfen
- fail-closed Verhalten für unbekannte Schemata, beschädigte Records und nicht
  auflösbare Katalogversionen; keine stille Migration
- Fehler- und Quota-Verhalten, bei dem die In-Memory-Session bedienbar bleibt
  und das verlorene Recovery-Versprechen sichtbar wird
- deterministische Contracttests mit kontrollierbarem Storage, Zeitgeber und
  Scheduler sowie realer IndexedDB-Browsernachweis für Save, Reload, Resume,
  Verwerfen, Lifecycle-Flush, Konflikte und Fehlerfälle
- noch kein Supabase-Commit und kein Android-Prozess-Reclaim-Nachweis; diese
  Grenzen bleiben R8 vorbehalten. Die produktive Feature-Aktivierung bleibt
  bis R12 gesperrt

Warum danach:

Recovery ist gegen die finalen Draft-Formen beider Tracking-Modi bewiesen. R8
kann nun denselben isolierten Controller an Commit und Android-PWA-Smokes
anbinden, ohne den R7-Speichervertrag umzudeuten.

### R8 - Core Commit and Android Recovery Integration

Status: `DONE_WITH_OWNER_ACCEPTED_EVIDENCE_GAP`.

- [R8 Roadmap](<archive/MIDAS Activity V2 R8 Core Commit and Android Recovery Integration Roadmap (DONE).md>)
- [R8 Evidence](<archive/MIDAS Activity V2 R8 Core Commit and Android Recovery Integration Evidence (DONE).md>)

Nachgewiesenes Ergebnis:

- atomarer R2-End-to-End-Commit aus unverändertem Draft v3 mit einmalig
  gebildeten `started_at`, `ended_at` und ganzzahlig bestätigter
  `duration_min`;
- persistierter tiefgefrorener Commit-Intent vor jedem Remoteversuch;
  Unknown sperrt Mutation und Discard und erlaubt nur identische
  `request_id`-/Payload-Wiederholung;
- Recovery-Envelope v2 mit v1-Lesekompatibilität, Intent-/Attempt-CAS,
  One-Promise-Koordination und Generationstombstone erst nach bestätigtem
  Commit oder Replay;
- SQL 22 produktiv bestätigt: jede vorhandene unveränderliche
  Katalogversion bleibt commitfähig, auch wenn später eine höhere Version
  existiert; Tabellen, Katalogsnapshots, RLS, ACL und Activity V1 bleiben
  unverändert;
- lokale/disposable/Browser-Matrix einschließlich Unknown-Retry, Reload,
  Offline, Races und drei Viewports grün; debug-only Android-App-ID,
  localhost-PWA und Releaseisolation gebaut und geprüft;
- kein Produktload, Dual-Write oder produktiver Activity-V2-Cutover.

Akzeptierte Abschlussgrenze:

- Der Owner beendete die S5-Langläufer am 2026-08-11 nach grüner
  technischer Kernmatrix. Der echte Android-Device-Prozess-Reclaim wurde
  mangels verbundenem ADB-Gerät nicht ausgeführt; der finale
  CodeRabbit-Null-Lauf blieb nach Korrektur aller 19 S5-Findings rate-limitiert.
  Beides ist keine behauptete PASS-Evidence und wird nicht auf R9 übertragen.

Warum danach:

Erst jetzt kann eine reale Session ohne Verlust lokal überleben und atomar in
Supabase abgeschlossen werden. Destruktive Historienoperationen bleiben aus
diesem Write- und Device-Sicherheitsgate herausgelöst.

### R9 - Session History, Detail, Correction and Deletion

Status: `NEXT_ROLLING_WAVE_GATE`.

Ziel:

- deterministisch paginierte Activity-V2-Sessionliste
- read-only Detailansicht aus den unveränderlichen Session-, Item- und
  Satzsnapshots
- bewusste Entscheidung des O-5-Korrekturvertrags: atomarer Ersatz einer
  vollständigen Session oder klar begrenzte gezielte Mutation
- Korrektur ohne Änderung kanonischer Katalogidentitäten oder Erfindung neuer
  Historiensemantik
- kontrollierte Löschung mit Ownership-, RLS-, Bestätigungs- und
  Wiederholungsnachweis
- konsistente Reaktion von Historie und Last-Performance-Lookup auf Korrektur
  oder Löschung
- keine produktive Feature-Aktivierung

Warum danach:

Commit und Device-Recovery müssen stabil sein, bevor bereits abgeschlossene
Daten angezeigt, verändert oder gelöscht werden. R9 isoliert die destruktive
Lebenszykluslogik vom R8-Save-Gate.

R9 darf den bewiesenen Commit-/Tombstonevertrag wiederverwenden, aber weder
den nicht ausgeführten Android-Device-Smoke als PASS voraussetzen noch Activity
V2 produktiv aktivieren. Produktcutover und finaler Android-PWA-Smoke bleiben
R12.

### R10 - Completed Activity Coaching Export V1

Ziel:

- eigenständiges versioniertes Export-Schema für tatsächlich abgeschlossene
  Activity-V2-Sessions
- drei und sechs Monate sowie freier Zeitraum
- deterministische Sortierung
- Vollständigkeits- und Qualitätsmetadaten
- vollständige Ist-Daten für Coaching einschließlich Session-, Item-, Satz-,
  Dauer- und Distanzwerten, soweit sie im gespeicherten Vertrag existieren
- keine Importsemantik und keine Umdeutung historischer Ist-Werte zu
  Zielwerten oder Trainingsvorgaben
- JSON-Smokes mit realistischen Strength-, Duration-, Distance- und Mixed-
  Sessions
- bis R12 weiterhin verborgen oder testgebunden; kein vorgezogener
  produktiver Activity-V2-Cutover

Warum danach:

Der Export wird auf dem final gespeicherten Datenvertrag aufgebaut und ist
danach sofort für Coaching-Analysen nutzbar.

### R11 - Doctor View and Report Integration

Ziel:

- ruhige Aktivitätszusammenfassung
- optionaler Session-Drilldown
- keine Satzdetails im Arztbericht
- V1-/V2-Kompatibilität ohne Doppelzählung
- einen gemeinsamen read-only V1-/V2-Kompatibilitätsvertrag auf
  Event-/Session-Zusammenfassungsebene vorbereiten, den R12 für Protein Target
  und Trendpilot wiederverwendet; die konkrete View-/RPC-/Helper-Form wird
  erst in R11 nach Readiness Review festgelegt
- bestehendes Report-first-Design der Doctor View beibehalten; Activity V2
  verändert die Datenquelle und Zusammenfassung, nicht die
  Informationshierarchie
- bestehende Arztberichte bleiben gespeicherte Snapshots; erst ein neu
  erzeugter Bericht verwendet die kompatible V1-/V2-Auswertung
- Health Export nur über einen expliziten Schema- und
  Rückwärtskompatibilitätsvertrag erweitern; der vollständige R10-Coaching-
  Export bleibt ein eigenständiges Artefakt
- Integration bis R12 verborgen beziehungsweise feature-gated halten; noch
  kein produktiver Activity-V2-Cutover

Warum danach:

Der medizinische Consumer erhält erst bewiesene, stabil gespeicherte
Activity-V2-Daten.

### R12 - Protein Target, Trendpilot, Legacy Compatibility and Product Cutover

Ziel:

- gemeinsamer V1-/V2-Aktivtagvertrag: unterschiedliche aktive Kalendertage im
  relevanten Zeitraum zählen; mehrere Sessions oder Items desselben Tages
  erhöhen den Count nicht mehrfach
- den in R11 bewiesenen read-only Kompatibilitätsvertrag wiederverwenden und
  keine zweite unabhängige V1-/V2-Union pro Consumer erfinden
- Protein Target vereinigt V1 und V2 über aktive Tage, behält das bestehende
  28-Tage-Fenster sowie ACT1-/ACT2-/ACT3-Schwellen und medizinische Formel
  unverändert und leitet nichts aus Sätzen, Gewichten oder Volumen ab
- Trendpilot verwendet einen kompatiblen Aktivitätskontext ohne
  Doppelzählung; neue medizinische Aussagen oder Schwellwerte sind kein Ziel
- R11-Doctor-/Report-Integration kontrolliert aktivieren
- stabiler produktiver Selektor für die aktuelle Katalogversion und bewiesene
  Rollout-Reihenfolge für Snapshot, Runtime, Consumer und gecachte PWA-Clients
- kontrollierter Cutover des alten Activity-Capture-Pfads
- bestehende Activity-V1-Daten und ihre historische Lesbarkeit erhalten; kein
  Dual Write neuer V2-Sessions und keine Migration erfundener Detaildaten
- finaler Android-PWA-Smoke
- kontrollierte produktive Feature-Aktivierung

Warum danach:

Diese Consumer besitzen fachliche Wirkung und werden getrennt vom
Darstellungsumbau geprüft. Erst R12 macht Activity V2 für reale Sessions
produktiv sichtbar.

### R13 - Prepared Session Template Import V1

Status: `POST-CORE`; erst nach stabilem Activity-V2-Kern und realer Nutzung
planen. R13 hängt fachlich von R4, R7-R9 und dem produktiven R12-Cutover ab,
nicht von einer bestimmten Retention-Entscheidung in R14. R10 liefert den
Coaching-Ist-Export, ist aber nicht dasselbe Schema und kein direkter
Importvertrag.

Ziel:

- kleines versioniertes Schema für eine vorbereitete Session-Vorlage
- JSON-Datei auf Desktop und Android-PWA kontrolliert auswählen
- exakte Validierung von Schema, `catalog_version`, `item_key` und Reihenfolge
- keine Zielgewichte, Zielwiederholungen, Satzvorgaben oder vorbefüllten
  Ist-Leistungen importieren
- nach Bestätigung einen gewöhnlichen Activity-V2-Draft erzeugen und den
  bestehenden R4-Historienlookup je Item verwenden
- vorhandenen veränderten Draft niemals still überschreiben
- freie Änderung der importierten Übungsliste während der Session
- identischer R7-Recovery-, R8-Commit- und R9-Historien-/Korrekturpfad wie bei
  einer manuell aufgebauten Session
- klarer Fehlerpfad für fehlende oder veraltete Katalogeinträge mit Verweis auf
  den kontrollierten Pflegeweg

Nicht-Ziele der ersten R13-Ausbaustufe:

- keine Trainingsplanverwaltung in Supabase
- keine automatische Leistungsprogression
- keine medizinische Trainingsentscheidung in MIDAS
- kein direkter MCP-Write als Voraussetzung
- kein zweiter Session- oder Speicherpfad

Warum als Post-Core-Erweiterung:

Die Funktion reduziert Reibung zwischen Codex-Analyse und realem Training,
ohne den planfreien Kern umzubauen. Erst reale Nutzung des produktiven
R12-Flows zeigt, ob Dateiimport, UI-Wording und Android-Dateiauswahl tatsächlich
bequem genug sind.

### R14 - Optional Retention and Legacy Cleanup

Status: `OPTIONAL`; blockiert weder den produktiven R12-Cutover noch R13.

Ziel:

- reale Datenmenge und tatsächliches Wachstum nach längerer Nutzung auswerten
- Retention bewusst entscheiden statt vorsorglich löschen
- mögliche Langzeitaggregate nur bei nachgewiesenem Bedarf
- nicht mehr benötigte Legacy-Codepfade nach bewiesener Consumer-Parität
  entfernen, ohne Activity-V1-Historie zu vernichten

Warum zuletzt:

Löschung und Bereinigung benötigen reale Nutzungserfahrung und dürfen weder
den Aufbau noch den Coaching- und Vorlagenfluss vorzeitig verkomplizieren. R14
kann dauerhaft aufgeschoben werden, solange kein realer Hygiene- oder
Speicherdruck besteht.

---

## 19. Roadmap-übergreifende Gates

- Kein produktiver V2-Cutover vor erfolgreichem Abschluss von R12.
- Keine Entfernung von Activity V1 vor bewiesener Consumer-Parität.
- Keine produktive SQL-Wirkung ohne Owner Briefing und Freigabe.
- Jede UI-Roadmap endet mit einem Live-Server-Smoke.
- Vor Feature-Aktivierung ist ein finaler echter Android-PWA-Smoke
  erforderlich.
- Keine reale Activity-V2-Sessionnutzung vor bewiesener persistenter
  Draft-Recovery aus R7 und grünem internen Android-PWA-Integrationssmoke aus
  R8; normales Backgrounding muss bereits in R3 ohne Zustands- oder
  Zeitverlust funktionieren.
- Ein Commit erfolgt erst nach den für die jeweilige Roadmap festgelegten
  grünen Nachweisen.
- Externe Findings werden bewertet und nicht blind umgesetzt.
- Neue Grundsatzfragen werden in der verursachenden Roadmap entschieden und
  nicht still in späteren Roadmaps erfunden.
- Ändert eine späte Owner-Entscheidung einen bereits geprüften Vertrag, pausiert
  das aktuelle Gate. Betroffene Ziel-, Readiness-, Implementierungs- und
  Testverträge werden sichtbar neu validiert, bevor die Roadmap fortgesetzt
  wird. Das erzwingt nicht automatisch eine neue Roadmap.
- R2 wird durch das Studioinventar nicht erweitert oder blockiert.
- Das R4-Eingangsgate ist erfüllt: C2 hat Katalogversion 2, alle
  Maschinenidentitäten und die exakte Studio-Suchmatrix nachgewiesen. R4 darf
  beginnen, ohne bereits produktive Activity-V2-Nutzung zu aktivieren.
- Vor dem R12-Cutover muss bewiesen sein, dass eine neue Katalogversion weder
  einen gültigen älteren Draft noch einen gecachten PWA-Client allein durch den
  Wechsel der höchsten Version bei Recovery oder Commit blockiert.
- R13 darf weder Katalogvalidierung noch R7-Recovery, R8-Commit oder den
  normalen R9-Historien-/Korrekturpfad umgehen.
  Importierte Vorlagen dürfen nur Auswahl und Reihenfolge vorbereiten; alle
  gespeicherten Leistungswerte müssen aus der realen Session stammen.
- R14 ist optional und darf weder R12 noch R13 blockieren. Activity-V1-Daten
  werden nicht allein wegen des V2-Cutovers gelöscht.

---

## 20. Entscheidungen und zuständige Roadmap

### O-1 Benutzerdefinierte Einträge

Entschieden durch R1:

- Die erste produktive Activity-V2-Ausbaustufe verwendet ausschließlich den
  breiten kontrollierten Repo-Katalog.
- Freie benutzerdefinierte Einträge sind nicht erlaubt; echte Lücken werden
  versioniert im Repo ergänzt.

### O-2 Basiskatalog

Entschieden durch R1:

- Die freigegebene `catalog_version: 1` besitzt 78 breite,
  planunabhängige Entries.
- Stephans Plan, bisherige Historie und aktuelles Studio sind Beispiele, aber
  keine Kataloggrenze.
- Geräte-, Hantel- und Griffvarianten teilen den klassischen Key;
  `device_relative` begrenzt unzulässige Lastvergleiche.

### O-3 Satzabschluss

Entschieden und umgesetzt durch R5:

- Es gibt keine Checkbox pro Satz.
- Der Status `leer`, `teilweise` oder `vollständig` wird ausschließlich aus der
  R1-Feldpolicy und den aktuellen Eingaben abgeleitet.
- Vollständig leere nachlaufende Standardzeilen sind keine ausgeführten Sätze.
- Teilweise befüllte Zeilen und Lücken zwischen vollständigen Sätzen sind
  ungültig und müssen vor einem späteren Save korrigiert oder entfernt werden.
- Ein Satz erhält weder `completed_at` noch ein anderes Zeitpunktfeld.
- Drei leere Satzzeilen sind der UI-Standard; weitere Zeilen können hinzugefügt
  und nicht benötigte Zeilen entfernt werden. Der dritte Satz besitzt keine
  technische Sonderrolle.

Zuständig:

- R5 implementiert und beweist diesen UI- und Interaktionsvertrag; R6 darf ihn
  nur als bestehenden Mixed-Session-Consumer verwenden.

### O-4 Sessiontimer

Entschieden für R3:

- Die Uhr startet automatisch mit dem ersten hinzugefügten Item.
- Normale Satzpausen zählen zur Sessionzeit.
- Die Anzeige wird aus Startzeitpunkt und aktueller Zeit berechnet, damit
  Browser-Throttling im Hintergrund keine Zeit verliert.
- Es gibt in R3 keinen Pausemodus, keinen separaten Resttimer und keine
  manuelle Zeitkorrektur.
- Die spätere Speicherintegration beendet die Uhr mit dem bewussten
  Sessionabschluss; R3 persistiert noch nicht.

Zuständig:

- R3 implementiert und beweist diesen Timer- und In-Memory-Draft-Vertrag.
- R7 ergänzt die dauerhafte Draft-Recovery, ohne die Timersemantik zu ändern.

### O-5 Korrekturvertrag

Zu klären:

- komplette Session atomar ersetzen
- gezielte Item-/Satzupdates
- Änderungsgrenzen nach Abschluss

Zuständig:

- R9 entscheidet den produktiven Korrektur- und Löschvertrag.

### O-6 Intensität

Entschieden für die erste produktive Activity-V2-Ausbaustufe:

- keine Intensität
- kein RPE, keine kontrollierte Skala und kein Intensitätsfreitext
- kein Intensitätsfeld in Draft, UI, R2-Schema, Commit oder Lookup
- eine mögliche spätere Einführung benötigt einen eigenen versionierten
  Daten-, Commit-, Lookup-, Export- und UI-Vertrag

Zuständig und Ergebnis:

- R6 hat O-6 geschlossen, ohne Persistenz- oder Produktintegration vorzuziehen.

### O-7 Verifiziertes Studioinventar

Entschieden:

- Die 27 Fotos und das Inventardokument sind verifizierte Referenzen für
  reales Studio-Vokabular und Geräteverfügbarkeit.
- Die Quelle begrenzt den breiten Repo-Katalog nicht und erzeugt keinen
  Trainingsplan.
- `catalog_version: 1`, die R1-Roadmap und der R2-Speichervertrag werden nicht
  rückwirkend verändert.
- Klare Gerätenamen werden frühestens in `catalog_version: 2` als Aliase
  gepflegt.
- Upper Back, Low Row, Vertical Traction, Abdominal Crunch und Total
  Abdominal wurden in C2 entschieden: `high_row` und `total_abdominal` sind
  neue Keys; Low Row, Vertical Traction und Abdominal Crunch sind Aliase von
  `seated_row`, `lat_pulldown` und `core_press`.
- Multi Hip wird nach ausgeführter Bewegung und nicht als ein einziger
  generischer Gerätekey erfasst.

Zuständig und Ergebnis:

- C2 hat die Katalog-v2-Pflege nach R2 und vor R4 vollständig umgesetzt.
- Spätere klare Lücken folgen dem kleinen versionierten Wartungsrunbook; ein
  bereits produktiver Snapshot bleibt unveränderlich.

### O-8 Katalog-Rollout und ältere PWA-Clients

Ausgangslage nach dem C2-Nachreview:

- Der R2-Commit akzeptierte vor SQL 22 ausschließlich die höchste vorhandene
  `catalog_version`.
- Nach produktiver Aktivierung können ein vorhandener Draft oder ein gecachter
  PWA-Client noch eine ältere, weiterhin unveränderliche Katalogversion tragen.
- Eine neue höchste Version darf deshalb nicht produktiv eingefügt werden,
  bevor der Rolloutvertrag feststeht.

Zuständig:

- R4-Verantwortung `DONE`: Suche, UI und read-only Last-Performance-Lookup sind
  durch explizite Semantikinjektion versionsagnostisch; der bestehende v1-
  Aufruf bleibt rückwärtskompatibel und der Commitpfad wurde nicht geöffnet
  oder umgedeutet.
- R7-Verantwortung `DONE`: persistente Recovery ist exakt an die im Draft
  gespeicherte Katalogversion gebunden.
- R8-Verantwortung `DONE`: SQL 22 akzeptiert beim Neuschreiben jede im
  unveränderlichen Katalog vorhandene Payloadversion; identischer Replay wird
  weiterhin vor Katalog-/Aktivprüfung aufgelöst. Die produktive Postcondition
  ist v1=78, v2=80, andere=0 und V2-Historie 0/0/0.
- R12 definiert den produktiven Katalogselektor, die Aktivierungsreihenfolge
  und den finalen Android-PWA-Smoke.

Ziel:

- Spätere klare Kataloglücken bleiben kleine kontrollierte Wartung ohne freie
  Historienkeys oder Activity V3, verursachen aber auch keinen Commit-Ausfall
  für einen noch gültigen älteren PWA-Draft.

R1 hat ausschließlich O-1, O-2 und die für Semantik, Suche und spätere
Schemafähigkeit notwendigen Grundinvarianten eingefroren. O-3 ist durch R5
entschieden und umgesetzt. O-4 ist für R3 entschieden; O-6 ist durch R6 mit
`keine Intensität` für die erste produktive Ausbaustufe geschlossen. O-5 bleibt
bis R9 bewusst offen und darf nicht vorweggenommen werden. O-7 hat keine stille
R1-Korrektur erzeugt, sondern wurde durch C2 als versionierter Pflegepfad
umgesetzt. O-8 ist für R4, R7 und R8 geschlossen. Offen bleibt ausschließlich
das R12-Gate für Produktselektor, Aktivierungsreihenfolge, gecachte PWA-Clients
und finalen Android-Smoke; es muss vor dem produktiven Cutover geschlossen
sein.

### O-9 Vorbereitete Session-Vorlage

Entschieden für die spätere R13:

- Codex darf aus einer gemeinsamen Trainingsanalyse eine JSON-Übungsliste für
  die nächste Einheit erstellen.
- Die Vorlage enthält ausschließlich gültige Katalogidentitäten,
  Katalogversion, Reihenfolge und harmlose Anzeigenmetadaten.
- Keine Zielgewichte, Zielwiederholungen, Satzanzahl oder Ist-Leistung werden
  importiert.
- Der Import erzeugt nach Laufzeitvalidierung einen gewöhnlichen Draft. R4
  liefert weiterhin die letzte reale Ausführung als Gedächtnisstütze.
- Die Session bleibt vollständig editierbar und verwendet denselben
  Recovery-, Korrektur- und Save-Pfad wie ein manuell aufgebauter Draft.
- Eine Kataloglücke wird vor Erstellung der finalen Vorlage über das
  Wartungsrunbook geschlossen; es gibt keinen freien Fallback-Key.

Zuständig:

- R13 friert Dateischema, Import-UX, Fehlermeldungen und Desktop-/Android-PWA-
  Smokes ein. Ein späterer MCP darf dasselbe Schema transportieren, ist aber
  keine Voraussetzung.

---

## 21. Finales Akzeptanzbild

Activity V2 ist fachlich erfolgreich, wenn Stephan:

1. auf dem Handy eine leere Session starten kann,
2. spontan Biceps Curl statt einer geplanten anderen Übung auswählen kann,
3. sofort die letzte abgeschlossene Ausführung mit allen damaligen Sätzen
   sieht,
4. aktuelle Sätze schnell erfassen kann,
5. in derselben Session optional Radfahren oder eine andere Daueraktivität
   hinzufügen kann,
6. Hallenfußball oder Schwimmen ohne künstliche Satzlogik speichern kann,
7. eine unterbrochene Session wiederherstellen kann,
8. die gesamte Session genau einmal und vollständig in Supabase speichern
   kann,
9. Fehler nachträglich kontrolliert korrigieren kann,
10. einen sauberen sechsmonatigen Activity-Export für ChatGPT oder Codex
    erzeugen kann,
11. im Arztbericht nur eine verständliche Aktivitätszusammenfassung sieht,
12. bestehende Legacy-Aktivitäten weiterhin korrekt und ohne Doppelzählung
    berücksichtigt bekommt,
13. eine später fehlende Übung zu Hause kontrolliert ergänzen lassen kann,
    ohne freien Historienkey, neue Activity-Generation oder Recovery-/Commit-
    Ausfall für einen weiterhin gültigen älteren PWA-Draft,
14. eine von Codex vorbereitete JSON-Übungsliste laden, frei verändern und über
    denselben normalen Draft- und Save-Pfad als tatsächlich absolvierte Session
    dokumentieren kann.

---

## 22. Kurzfassung für spätere Roadmap-Chats

MIDAS Activity V2 verbindet den schnellen Session- und Satzfluss von Liftlog
mit freier Übungsauswahl, planunabhängiger Historie und eigener strukturierter
Supabase-Datenhaltung.

Die Session ist der gemeinsame Container. Jedes ausgewählte Item besitzt einen
stabilen kanonischen Key und einen Tracking-Modus. Kraftübungen verwenden
benannte Satzdaten; Daueraktivitäten verwenden itemweite Dauer, optionale
Distanz und Notiz. R6 bearbeitet diese Werte ausschließlich im flüchtigen
Draft. Die Historie wird nach Key und nicht nach Trainingsplan gesucht. R7
sichert unfertige Sessions im isolierten Harness als IndexedDB-Draft ab; R8
soll abgeschlossene Sessions atomar in Supabase integrieren. R9 ergänzt
Historie, Details, Korrektur und Löschung. Arztbericht und Doctor View erhalten in R11 nur
Zusammenfassungen; der versionierte R10-Activity-Export liefert die
vollständigen Details für spätere Coaching-Analysen. R12 aktiviert die neue
Erfassung und alle produktiven Consumer kontrolliert.

Fehlt später eine Übung, wird sie nicht im Studio als freier Key erfunden,
sondern zu Hause über den Katalog-Inspector als Alias oder neue kontrollierte
Identität in einer vollständigen neuen Katalogversion ergänzt. R4 hält die
Consumer dafür versionsagnostisch. R7 hat versionsgebundene Recovery bewiesen;
R8 und R12 müssen vor dem produktiven Cutover noch beweisen, dass der
Versionswechsel keinen gültigen älteren PWA-Draft beim Commit oder in einem
gecachten produktiven Client blockiert.

Als optionale Post-Core-Erweiterung kann R13 eine von Codex vorbereitete
JSON-Übungsliste als normalen Session-Draft laden. Sie enthält nur Katalogkeys
und Reihenfolge, keine Leistungsvorgaben oder vorgetäuschten Ist-Werte. Letzte
Leistung, freie Bearbeitung, Recovery und Save bleiben exakt dieselben wie bei
einer manuell gestarteten Session.
