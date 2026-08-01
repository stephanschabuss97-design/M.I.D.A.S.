# MIDAS Activity V2 - Masterplan

## Roadmap der Roadmaps für das zukünftige Trainings- und Aktivitätsmodul

Stand: 2026-08-01

Status: Fachliches Zielbild und Planungsquelle. R1, die additive unsichtbare
R2-Datenbankgrundlage und die isolierte R3-Draft-/Shell-Grundlage sind
bereitgestellt; sichtbare Activity-Consumer verwenden weiterhin V1.

Cross-Contract-Stand 2026-08-01: `PASS`. R1, R2 und R3 bleiben unverändert
gültig. R3 hält die bewiesene R2-`request_id`, den top-level-Katalogvertrag und
`item_order` ein. C2 ist der nächste Rolling-Wave-Schritt und bleibt das
zwingende Gate vor R4; Recovery wird in R7 isoliert und in R8 intern auf
Android-PWA bewiesen.

Dieses Dokument beschreibt, was MIDAS Activity V2 werden soll und in welcher
Reihenfolge die dafür notwendigen Roadmaps entstehen sollen. Es ist keine
einzelne Umsetzungsroadmap und kein Beleg dafür, dass die beschriebenen
Funktionen bereits produktiv existieren.

Bis zum späteren Consumer-Cutover bleiben der reale Code, das aktuelle
`Activity Module Overview` und die produktive Supabase-Struktur die Source of
Truth: Activity V1 ist sichtbar aktiv; Activity V2 R1-R3 stellen nur die noch
unverdrahtete Semantik-, Speicher-, Draft- und Shell-Grundlage bereit.

---

## 1. Zielbild

MIDAS Activity V2 soll eine flexible, mobile Erfassung von Training und
relevanten sportlichen Aktivitäten ermöglichen.

Die wichtigste Produktidee lautet:

> Eine Session beginnt ohne starren Trainingsplan. Stephan entscheidet während
> der Session, welche Übung oder Aktivität er heute tatsächlich macht.

Der Ablauf soll sich an der guten Session- und Satzerfassung von Liftlog
orientieren, ohne dessen starre Bindung an gespeicherte Trainingspläne zu
übernehmen.

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

Dieser Key ist der historische Anker. Labels und Aliase dürfen später gepflegt
werden, der Key bleibt stabil.

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
Zeitpunktfelder. `set_order` wird im R2-Speichervertrag festgelegt;
Satzabschluss und ein mögliches `completed_at` bleiben der R5-Roadmap
vorbehalten.

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

Für eine spätere `catalog_version: 2` gelten drei Klassen:

| Klasse | Verifizierte Beispiele | Vertrag |
| --- | --- | --- |
| bereits direkt suchbar | Leg Press, Leg Extension, Leg Curl, Pulldown, Chest Press, Shoulder Press, Rotary Torso, SkiErg, Ruderergometer, Crosstrainer | kein neuer Key |
| klare Alias-Kandidaten | Glute -> `glute_kickback`; Abductor -> `hip_abduction`; Adductor -> `hip_adduction`; Rotary Calf -> `calf_raise`; Pectoral -> `chest_fly`; Delts Machine -> `lateral_raise`; Lower Back -> `back_extension`; Stepmill -> `stair_climber`; Fahrradergometer -> `cycling` | Alias erst mit erhöhter Katalogversion und vollständigem Kollisions-/Suchtest |
| Owner-Identitätsentscheidung | Upper Back, Low Row, Vertical Traction, Abdominal Crunch, Total Abdominal | vor Umsetzung entscheiden, ob Alias eines bestehenden klassischen Keys oder eigenständige klassische Bewegung |

`Multi Hip` ist kein einzelner Übungskey. Die ausgeführte Bewegung bestimmt
die Identität. Kandidaten sind beispielsweise:

- `Multi Hip Abduction` -> `hip_abduction`
- `Multi Hip Adduction` -> `hip_adduction`
- `Multi Hip Extension` -> `glute_kickback`
- ein neuer Hüftflexions-Key nur bei tatsächlichem Erfassungsbedarf

`catalog_version: 1` und die abgeschlossene R1-Roadmap bleiben unverändert.
Die bestehende `semantics.js` wird nicht still korrigiert. Alias- und
Entry-Pflege erfolgt in einer begrenzten Katalog-v2-Wartungsroadmap nach dem
R2-Fundament und zwingend vor der produktnahen R4-Suche.

Vor Beginn dieser Wartungsroadmap muss die derzeit außerhalb des Repos
liegende Referenz kontrolliert verfügbar gemacht werden. S1 entscheidet mit
Owner-Freigabe zwischen einer dokumentierten Repo-Referenz und einer anderen
dauerhaft gesicherten Ablage. Die Fotos werden nicht vom Produkt ausgeliefert
und sind keine Runtime-Abhängigkeit.

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

Eine mögliche Intensität gehört noch nicht zum R2-Speicher- oder
Lookup-Vertrag. R6 entscheidet diese spätere Erweiterung.

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
bis R11 gesperrt. R3 darf das Risiko diagnostisch sichtbar machen, aber keine
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
- Abschlussstatus einzelner Sätze
- letzten Autosave-Zeitpunkt
- Draft-Schema-Version

IndexedDB dient ausschließlich:

- als Autosave-Speicher
- zur Wiederherstellung nach Reload oder App-Schließen
- zum kontrollierten Verwerfen einer unvollständigen Session

IndexedDB ist weder historische Wahrheit noch primäre Analysequelle.

Beim Modulstart mit vorhandenem Draft werden genau diese Optionen angeboten:

- Session fortsetzen
- Session verwerfen

Ein Draft wird erst nach bestätigtem erfolgreichem Supabase-Commit entfernt.

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
R2 darf die in R1 festgelegten Messfelder speichern, legt aber weder
Intensitätssemantik noch deren Eingabeform vor R6 fest. Ein Intensitätsfeld ist
im R2-Schema noch nicht vorhanden.

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
Der konkrete Satzabschluss- und Zeitpunktvertrag wird erst in R5 entschieden
und darf von R2 nicht still durch ein vorweggenommenes `completed_at` festgelegt
werden.

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
- Die R1-R12-Beschreibungen bleiben bis dahin Zielkorridore. Sie dürfen keine
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
Eingabemasken eingebaut werden. R3 ist abgeschlossen; C2 ist jetzt der nächste
Rolling-Wave-Schritt, bevor R4 die Such- und Historieninteraktion ergänzt.

### C2 - Catalog Version 2 Studio Vocabulary Maintenance

Typ:

- begrenzte Katalog-Wartungsroadmap außerhalb der funktionalen
  R1-R12-Nummerierung
- Ausführungsfenster nach abgeschlossenem R2/R3 und zwingend vor R4
- R3 ist abgeschlossen; C2 ist der nächste Rolling-Wave-Schritt

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

Warum an dieser Stelle:

R2 muss zuerst beweisen, dass vollständige unveränderliche Katalogversionen
gespeichert und referenziert werden können. R4 darf danach nicht mit
synthetischem Vokabular gebaut werden, sondern muss die realen
Maschinenbezeichnungen aus Stephans Studio deterministisch finden.

### R4 - Search and Last-Performance Lookup

Ziel:

- lokale Suche im Semantikkatalog
- freigegebene `catalog_version: 2` und grüne Studio-Suchmatrix als
  Eingangsgate
- kanonische Auswahl
- letzte Ausführung aus Supabase
- neutrale No-History-Anzeige
- begrenztes und deterministisches Query-Verhalten

Warum danach:

Das ist der zentrale Mehrwert gegenüber starren Trainingsplänen.

### R5 - Strength Set Editor

Ziel:

- Übungskarte nach Liftlog-Grundidee
- Anzeige vorheriger Sätze
- feldpolicy-gesteuerte Primärmessung aus R1: `reps`, `duration_sec` oder
  `distance_m`
- dokumentierte Last als `weight_kg` oder inverse Unterstützung als
  `assistance_kg` nur gemäß Entry-Policy
- Satz hinzufügen, bearbeiten, erledigen und entfernen
- stabile mobile Bedienung

Warum danach:

Der komplexeste Item-Typ wird auf dem bereits bewiesenen Session- und
Historienvertrag aufgebaut.

### R6 - Duration and Cardio Editor

Ziel:

- Daueraktivitäten
- optionale Distanz
- optionale Notiz
- Intensität nur nach expliziter O-6-Entscheidung; bei Aufnahme zuerst
  versionierten Datenbank-, Commit-, Lookup- und Exportvertrag erweitern
- gemischte Sessions
- Hallenfußball, Schwimmen, Radfahren und ähnliche Aktivitäten

Warum danach:

Der zweite Item-Typ nutzt denselben Sessionpfad, ohne einen separaten
Speicherweg zu erzeugen.

### R7 - IndexedDB Draft Recovery

Ziel:

- Autosave
- Wiederherstellen
- Verwerfen
- Draft-Schema-Version
- Fehler- und Quota-Verhalten
- isolierter Browser-/Recovery-Nachweis ohne produktive Feature-Aktivierung

Warum danach:

Recovery wird gegen die finalen Draft-Formen beider Tracking-Modi gebaut.

### R8 - Core Commit Integration, History and Correction

Ziel:

- vollständiger atomarer End-to-End-Commit
- eindeutige Abbildung der R3-Uhr auf `started_at`, `ended_at` und die
  ganzzahlige bestätigte `duration_min` einschließlich Rundungsregel
- Draft erst nach bestätigtem Commit entfernen
- Sessionliste und Detailansicht
- Korrektur und Löschung
- interner bzw. testgebundener Android-PWA-Smoke
- noch keine produktive Feature-Aktivierung

Warum danach:

Erst jetzt ist der Activity-V2-Kern vollständig und fehlertolerant genug für
die nachfolgenden Export- und Consumer-Integrationen.

### R9 - Machine-Readable Activity Export Schema V1

Ziel:

- versioniertes Export-Schema
- drei und sechs Monate sowie freier Zeitraum
- deterministische Sortierung
- Vollständigkeits- und Qualitätsmetadaten
- JSON-Smokes mit realistischen Sessions

Warum danach:

Der Export wird auf dem final gespeicherten Datenvertrag aufgebaut und ist
danach sofort für Coaching-Analysen nutzbar.

### R10 - Doctor View and Report Integration

Ziel:

- ruhige Aktivitätszusammenfassung
- optionaler Session-Drilldown
- keine Satzdetails im Arztbericht
- V1-/V2-Kompatibilität ohne Doppelzählung
- Integration bis R11 verborgen beziehungsweise feature-gated halten; noch
  kein produktiver Activity-V2-Cutover

Warum danach:

Der medizinische Consumer erhält erst bewiesene, stabil gespeicherte
Activity-V2-Daten.

### R11 - Protein Target, Trendpilot and Legacy Compatibility

Ziel:

- Aktivtag- und Zählvertrag
- V1-/V2-Lesepfad
- keine Doppelzählung
- unveränderte medizinische Guardrails
- kontrollierter Cutover des alten Activity-Capture-Pfads
- finaler Android-PWA-Smoke
- kontrollierte produktive Feature-Aktivierung

Warum danach:

Diese Consumer besitzen fachliche Wirkung und werden getrennt vom
Darstellungsumbau geprüft.

### R12 - Optional Retention and Legacy Cleanup

Ziel:

- reale Datenmenge auswerten
- Retention bewusst entscheiden
- mögliche Langzeitaggregate
- nicht mehr benötigte Legacy-Pfade entfernen

Warum zuletzt:

Löschung und Bereinigung benötigen reale Nutzungserfahrung und dürfen den
Aufbau nicht vorzeitig verkomplizieren.

---

## 19. Roadmap-übergreifende Gates

- Kein produktiver V2-Cutover vor erfolgreichem Abschluss von R11.
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
- R2 wird durch das Studioinventar nicht erweitert oder blockiert.
- R4 bleibt blockiert, bis C2 die Katalogversion 2, die offenen
  Maschinenidentitäten und die exakte Studio-Suchmatrix nachgewiesen hat.

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

Zu klären:

- Checkbox pro Satz
- automatischer Abschluss nach gültiger Eingabe
- Rolle des Satzzeitpunkts

Zuständig:

- R5 entscheidet diesen UI- und Interaktionsvertrag.

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

- R8 entscheidet den produktiven Korrektur- und Löschvertrag.

### O-6 Intensität

Zu klären:

- kontrollierte Skala
- optionaler Freitext
- in der ersten produktiven Activity-V2-Ausbaustufe ganz weglassen

Zuständig:

- R6 entscheidet diesen Feld- und UI-Vertrag.

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
  Abdominal benötigen vor C2-S4 eine Owner-Entscheidung über Alias oder
  eigenständige klassische Bewegungsidentität.
- Multi Hip wird nach ausgeführter Bewegung und nicht als ein einziger
  generischer Gerätekey erfasst.

Zuständig:

- C2 entscheidet und implementiert die Katalog-v2-Pflege nach R2 und vor R4.

R1 hat ausschließlich O-1, O-2 und die für Semantik, Suche und spätere
Schemafähigkeit notwendigen Grundinvarianten eingefroren. O-3 bis O-6 bleiben
bis zu ihrer zuständigen Roadmap bewusst offen und dürfen durch frühere
Implementierung nicht vorweggenommen werden. O-7 ergänzt keine stille
R1-Korrektur, sondern definiert den späteren versionierten Pflegepfad.

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
    berücksichtigt bekommt.

---

## 22. Kurzfassung für spätere Roadmap-Chats

MIDAS Activity V2 verbindet den schnellen Session- und Satzfluss von Liftlog
mit freier Übungsauswahl, planunabhängiger Historie und eigener strukturierter
Supabase-Datenhaltung.

Die Session ist der gemeinsame Container. Jedes ausgewählte Item besitzt einen
stabilen kanonischen Key und einen Tracking-Modus. Kraftübungen speichern
benannte Satzdaten; Daueraktivitäten speichern passende Sessionwerte. Die
Historie wird nach Key und nicht nach Trainingsplan gesucht. Unfertige Sessions
bleiben als IndexedDB-Draft lokal. Abgeschlossene Sessions werden atomar in
Supabase gespeichert. Arztbericht und Doctor View erhalten nur
Zusammenfassungen; ein versionierter Activity-Export liefert die vollständigen
Details für spätere Coaching-Analysen.
