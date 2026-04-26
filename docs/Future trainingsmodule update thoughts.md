# MIDAS – Activity / Fitness Module

## Codex-ready Produkt- und Architekturzusammenfassung

## 1. Zielbild

Das Modul soll **nicht nur ein Gym-Tracker**, sondern ein **generisches Activity-Tracking-Modul** für MIDAS sein.

Es muss sowohl klassische Krafttraining-Sessions als auch allgemeine Sport- und Bewegungsaktivitäten unterstützen, z. B.:

* Gym / Maschinen / freie Übungen
* Fußball / Hallenfußball
* Wandern
* Skifahren
* Langlaufen
* spätere weitere Alltags- oder Sportsessions

Das Modul soll dabei:

* im Alltag **schnell und leicht** bedienbar sein
* **dynamische Eingabemasken** je Aktivitätstyp ermöglichen
* **strukturierte Verlaufsdaten** speichern
* einen **sauberen JSON-Export** für frei wählbare Zeiträume unterstützen
* später von mir analysierbar sein, z. B. für 3 oder 6 Monate Trainingsverlauf

Der Fokus ist **nicht** sportwissenschaftlicher Overkill, sondern:
**robuste, flexible, auswertbare Realitätserfassung**.

---

## 1.1 MIDAS-spezifischer Zweck

Das Modul ist nicht als Fitness-Gamification gedacht.

Der eigentliche MIDAS-Zweck ist:

**Training und Bewegung als CKD-relevanten Lebensstil- und Belastungskontext belastbar erfassen.**

Das Ziel ist nicht, jeden kleinen 5-Minuten-Spaziergang als Training zu verbuchen.
Das Ziel ist eine aussagekraeftige Zusammenfassung relevanter sportlicher Aktivitaet:

* Gym / Krafttraining
* Fussball / Hallenfussball
* Wandern
* Skifahren
* Langlaufen
* andere relevante Sport- oder Bewegungseinheiten

Diese Daten sollen spaeter zusammen mit anderen MIDAS-Kontexten auswertbar sein:

* Doctor-/Arztansicht-Export
* Blutdruckverlauf
* Gewicht / Koerperdaten
* relevante Laborwerte
* Intake-Kontext wie Wasser, Salz und Protein
* Medication-Adhaerenz
* aktuelle Nephro-Berichte oder Arztberichte
* absolvierte Trainings- und Aktivitaetsdaten

Der Analysezweck ist, Training alters-, CKD- und alltagsgerecht weiterzuentwickeln.
Ein spaeterer GPT-/LLM-Review soll dadurch nicht auf Bauchgefuehl arbeiten, sondern auf echtem Verlauf.

Beispiele fuer spaetere Analysefragen:

* Passt die Trainingsfrequenz zur aktuellen Belastbarkeit?
* Gibt es Uebungen, die wegen Blutdruckspitzen, Pressatmung oder CKD-Kontext vorsichtiger bewertet werden sollten?
* Sind Muskelgruppen, Ausdauer oder Regeneration unausgewogen?
* Sollte eine Uebung gegen eine alltagstauglichere oder schonendere Alternative getauscht werden?
* Wie passt das Training zu den letzten Nephro-/Labor-/Blutdruckdaten?
* Welche Anpassung ist sinnvoll, ohne aus MIDAS eine Panik- oder Optimierungsmaschine zu machen?

Wichtige Grenze:

MIDAS soll keine autonome medizinische Trainingsverordnung erstellen.
Das Modul liefert sauberen Kontext.
GPT/LLM kann spaeter als Analyse- und Denkpartner Vorschlaege machen, die bei Bedarf mit Arzt, Nephro oder Physiotherapie abgeglichen werden.

Leitstern:

**Nicht mehr Tracking um des Trackings willen, sondern bessere Steuerung fuer ein moeglichst stabiles Leben mit CKD.**

Das erklaerte persoenliche Ziel ist, Dialyse so lange und so gut wie moeglich zu vermeiden.
Das Modul soll dafuer keine Angstmaschine sein, sondern ein ruhiger Datenkontext fuer bessere Entscheidungen.

---

## 2. Produktprinzipien

### 2.1 Grundprinzipien

* Single-user only
* mobile-first / gym-first UX
* lokal robust, aber serverseitig sauber historisiert
* strukturierte Daten statt Textblob
* Repo-Semantik als Lookup-Quelle
* Supabase als Source of Truth für Historie und Exporte
* IndexedDB nur für Draft-Recovery und lokales Puffern
* kein Overtracking
* keine Gamification von irrelevanter Alltagsbewegung
* Training als relevanter Lebensstil- und Belastungskontext, nicht als Selbstoptimierungs-Spiel
* keine künstlich starren Tabellenstrukturen

### 2.2 Leitgedanke

**Die Semantik-Datei speichert Bedeutung.
Die Datenbank speichert Verlauf.**

Das ist die Kerntrennung.

---

## 3. Warum die Architektur bewusst so gebaut wird

### 3.1 Was wir explizit **nicht** bauen

Wir bauen **keine** Tabelle mit festen Spalten wie:

* exercise_1
* exercise_2
* exercise_3
* …
* exercise_15

Warum nicht?

Weil dieses Modell bei echten Trainingsdaten sehr schnell kaputtgeht:

* künstliche Obergrenze
* variable Satzanzahl pro Übung nicht sauber modellierbar
* andere Sportarten passen nicht hinein
* Auswertungen werden unnötig kompliziert
* JSON-Export wird hässlich
* Historienabfragen werden unflexibel

Das wäre am Anfang bequem, später aber eine reine Strafarbeit.

### 3.2 Was wir stattdessen bauen

Wir bauen ein **normalisiertes, dynamisches Modell** mit:

* `activity_sessions`
* `activity_session_items`
* `activity_item_events`

Das passt zur Stärke von Postgres/Supabase, weil Supabase auf einem vollwertigen Postgres aufsetzt und strukturierte Tabellen, Indizes, Funktionen und JSONB nativ unterstützt. ([Supabase][1])

---

## 4. Semantik-Architektur

## 4.1 Primäre Lookup-Quelle: Repo-Datei

Die Aktivitäts- und Übungsdefinitionen sollen **nicht aus einer DB-Stammdatentabelle**, sondern aus einer **statischen Semantik-Datei im Repo** kommen, analog zum HESTIA-Prinzip.

Diese Datei ist die kontrollierte, versionierbare Lookup-Schicht.

### Verantwortlichkeiten der Semantik-Datei

Sie enthält pro Eintrag mindestens:

* `key`
* `label`
* `aliases`
* `category`
* `tracking_mode`
* `fields`
* optionale Tags wie Muskelgruppe, Equipment, Sporttyp etc.

### Beispielhafte Einträge

* `chest_press`
* `lat_pulldown`
* `football`
* `hiking`
* `cross_country_skiing`

---

## 4.2 Warum Repo-Semantik statt DB-Suche

Die lokale Repo-Datei ist für V1 besser, weil sie:

* deterministisch ist
* keine Query-Kosten / Query-Latenz für die Suche erzeugt
* offline-/schwachnetzfreundlich ist
* versionierbar ist
* Dubletten und Freitext-Chaos besser kontrolliert

Die DB soll hier **nicht Bedeutungen erraten**, sondern erst nach Auswahl eines kanonischen Keys **Verlauf liefern**.

---

## 4.3 Stabiler Schlüssel

Jeder Eintrag bekommt einen **stabilen kanonischen Key**, z. B.:

* `lat_pulldown`
* `chest_press`
* `football`
* `hiking`

Dieser Key ist der eigentliche Anker für Historie, Auswertungen und JSON-Export.

**Wichtig:**
Keys gelten als praktisch unveränderlich.
Labels oder Aliase dürfen gepflegt werden, Keys möglichst nicht.

---

## 5. Tracking-Modi

Die Semantik-Datei muss nicht nur Suchbegriffe liefern, sondern auch sagen, **wie etwas erfasst wird**.

Dafür definieren wir in V1 drei Denkmodi, von denen zunächst zwei aktiv nötig sind:

## 5.1 `sets`

Für klassische Kraftübungen.

Beispiele:

* Chest Press
* Lat Pulldown
* Leg Press
* Seated Row

Erwartete Felder pro Event / Satz:

* `weight_kg`
* `reps`
* `set_completed_at`

---

## 5.2 `session`

Für allgemeine Sport- oder Ausdaueraktivitäten.

Beispiele:

* Fußball
* Hallenfußball
* Wandern
* Skifahren
* Langlaufen

Typische Felder:

* `duration_min`
* optional `distance_km`
* optional `elevation_m`
* optional `intensity`
* optional `notes`

Nicht jede Session-Aktivität braucht Unter-Items oder Event-Listen.

---

## 5.3 `hybrid`

Optional für später, nicht zwingend V1.

Für Aktivitäten, die aus mehreren Segmenten bestehen könnten oder Mischformen brauchen.
Das sollte in V1 **nicht** Pflicht werden, um Komplexität zu begrenzen.

---

## 6. UX-Modell

## 6.1 Session-Denken

Jede Aktivität beginnt als **Session**.

Beispiele:

* Gym am 22.04.2026
* Hallenfußball am Freitag
* Wanderung am Sonntag

Die Session ist der Container.

---

## 6.2 Draft-first-Ansatz

Während der Eingabe lebt alles zuerst als **lokaler Draft**, nicht sofort als finaler DB-Eintrag.

Das ist wichtig für:

* gute UX
* wenig Reibung im Gym
* flexible Bearbeitung
* Robustheit bei Reload / App-Schließen / schlechtem Netz

---

## 6.3 Gym-Flow

Für `tracking_mode = sets` gilt der besprochene Flow:

1. Session starten
2. Plus drücken
3. neuer Aktivitäts-/Übungsblock erscheint
4. Suchfeld sucht lokal gegen Repo-Semantik
5. User wählt kanonischen Eintrag
6. danach wird **erst dann** Supabase gefragt:

   * wann zuletzt gemacht
   * welche letzten Sets
   * ggf. letztes Datum
7. User gibt Satzdaten ein
8. bei OK/Haken wird ein Satz lokal gespeichert
9. `set_completed_at` wird gesetzt
10. weitere Übung via Plus
11. am Ende „Training abschließen“
12. erst dann Final-Commit

---

## 6.4 Session-Flow für allgemeine Aktivitäten

Für `tracking_mode = session` gilt:

1. Session starten
2. Aktivität über lokale Semantik auswählen
3. UI zeigt passende Felder aus `fields`
4. User füllt Dauer / Distanz / Notiz etc. aus
5. Daten bleiben im lokalen Draft
6. bei Abschluss wird Session final gespeichert

---

## 7. Datenmodell

Jetzt der wichtigste Teil: die Form, in der das Ding später nicht deppert wird.

## 7.1 `activity_sessions`

Der oberste Container.

**Zweck:**
Speichert eine komplette Aktivitätseinheit, egal ob Gym, Fußball, Wandern oder anderes.

**Empfohlene Felder:**

* `id`
* `user_id`
* `activity_type_key`
* `started_at`
* `ended_at`
* `status` (`draft`, `completed`, `aborted`)
* `title` optional
* `notes` optional
* `created_at`
* `updated_at`

**Hinweis:**
`activity_type_key` kann z. B. `gym_workout`, `football`, `hiking` sein.

---

## 7.2 `activity_session_items`

Unterelemente einer Session.

**Zweck:**
Speichert dynamische Bestandteile der Session, z. B. einzelne Übungen innerhalb einer Gym-Session.

**Empfohlene Felder:**

* `id`
* `activity_session_id`
* `item_key`
* `item_label_snapshot`
* `item_type`
* `sort_order`
* `payload_jsonb` optional
* `created_at`

**Beispiele:**

* Bei Gym: `item_key = chest_press`
* Bei Fußball: eventuell kein Item nötig oder ein Segment
* Bei Wandern: oft keine Items nötig, kann leer bleiben

**Wichtig:**
`item_label_snapshot` schützt Historie, falls Labels später geändert werden.

---

## 7.3 `activity_item_events`

Ereignisse innerhalb eines Items.

**Zweck:**
Speichert bei Kraftübungen Sätze oder bei Bedarf andere Event-Typen.

**Empfohlene Felder:**

* `id`
* `activity_session_item_id`
* `event_type`
* `sort_order`
* `value_number_1` optional
* `value_number_2` optional
* `value_text_1` optional
* `event_at`
* `payload_jsonb` optional
* `created_at`

### Beispiel Kraftsatz

* `event_type = set`
* `value_number_1 = 55` → Gewicht
* `value_number_2 = 12` → Reps
* `event_at = set_completed_at`

### Warum JSONB nur optional?

Weil Postgres für JSON/JSONB `jsonb` fast immer empfiehlt, aber nur dort, wo flexible Zusatzfelder wirklich sinnvoll sind; die Kernstruktur sollte trotzdem in klaren Spalten liegen. ([Supabase][2])

---

## 8. Warum dieses Modell besser ist als „alles in einer Textzeile“

Weil es gleichzeitig drei Dinge schafft:

### 8.1 Menschlich sinnvolle Eingabe

Die UI kann sich leicht und fast textartig anfühlen.

### 8.2 Maschinenfreundliche Speicherung

Die Daten bleiben strukturierbar und auswertbar.

### 8.3 JSON-Export ohne Verrenkung

Du kannst 3 oder 6 Monate sauber exportieren, und ich kann darauf später ordentlich arbeiten.

---

## 9. Supabase-Rolle im Modell

## 9.1 Was Supabase tun soll

Supabase/Postgres ist hier zuständig für:

* finale Speicherung abgeschlossener Sessions
* Historie
* Abfragen auf letzte Aktivitäten / letzte Sets
* JSON-Export
* langfristige Konsistenz
* RLS / User-bezogene Datenisolation, falls nötig

Supabase ist dabei kein exotischer Spezialdienst, sondern ein dünner CRUD-/REST-Layer auf Postgres mit direkter Nutzung von Tabellen, Filtern und Funktionen. ([Supabase][3])

---

## 9.2 Was Supabase **nicht** tun soll

Nicht die primäre Übungssuche in V1.

Die Suchlogik soll lokal gegen die Repo-Semantik-Datei laufen.
Supabase wird erst gefragt, wenn ein kanonischer Key bereits feststeht.

Das spart unnötige Queries und hält die UX deterministisch.

---

## 9.3 Welche DB-Funktionen hier realistisch nützlich sind

Supabase erlaubt Postgres-Funktionen / RPC-Aufrufe, was für komplexere oder atomische Serverlogik sinnvoll ist. Das ist vor allem relevant für:

* finalen Session-Commit
* serverseitige Konsistenzlogik
* späteren Export
* ggf. „letzte Werte“-Zusammenfassungen

Supabase dokumentiert dafür Datenbankfunktionen und RPC explizit. ([Supabase][4])

---

## 10. Such- und Query-Strategie

## 10.1 Lokale Suche

Die Suche nach Aktivität oder Übung läuft im Client lokal gegen die Repo-Datei.

Empfohlene Matching-Stufen:

* Normalisierung
* exact alias match
* prefix match
* token contains / ranking

Das ist kontrollierbarer als eine frühe DB- oder Embedding-Suche.

---

## 10.2 Historien-Query nach Auswahl

Erst nach der Auswahl des Keys wird Supabase gefragt:

### Kraftübung

* letzte abgeschlossene Session mit `item_key = chest_press`
* letzte Sätze
* letztes Datum

### Session-Aktivität

* letzte Aktivität dieses Typs
* ggf. letzte Dauer / Distanz / Notizen

Die JS-Client-API unterstützt dafür einfache Filter, `ilike`, Limits, Orderings und Pagination. Außerdem begrenzt Supabase standardmäßig Rückgabemengen, was versehentliche Monsterantworten reduziert. ([Supabase][5])

---

## 10.3 Warum wir V1 noch **keine** echte semantische Embedding-Suche brauchen

Supabase kann mit pgvector / Embeddings umgehen, auch automatisiert. Aber das ist für V1 unnötig schweres Gerät. Für deine Aktivitätssuche reicht die Repo-Semantik mit Aliases klar aus. Embeddings wären eher Phase 2/3, nicht Pflicht für einen funktionalen, robusten ersten Wurf. ([Supabase][6])

---

## 11. Lokaler Draft und IndexedDB

## 11.1 Rolle von IndexedDB

IndexedDB ist **nicht** die Hauptsuchschicht und **nicht** die historische Wahrheit.

Sie ist nur:

* lokales Sicherheitsnetz
* Autosave-Speicher
* Recovery-Ort für unvollständige Sessions
* optional kleiner Cache für zuletzt verwendete Einträge

---

## 11.2 Draft-Philosophie

Während der aktiven Session liegen Daten zuerst lokal:

* Session-Metadaten
* hinzugefügte Items
* bereits bestätigte Events / Sets
* Dirty State
* letzter Autosave

Erst bei **explizitem Abschluss** wird final committed.

---

## 11.3 Recovery-Verhalten

Beim Modulstart soll geprüft werden:

* gibt es einen unvollständigen Draft?
* wenn ja:

  * wiederherstellen
  * verwerfen
  * ggf. als abgebrochen markieren

---

## 12. Commit-Strategie

## 12.1 Fachlich richtig

Eine Session gilt erst dann als abgeschlossen, wenn der User aktiv **„Training abschließen“** oder sinngemäß **„Aktivität abschließen“** drückt.

---

## 12.2 Technisch sauber

Der finale Commit soll möglichst atomisch bzw. kontrolliert erfolgen.

Idealerweise:

* Session anlegen
* Items anlegen
* Events anlegen
* Status auf `completed` setzen
* Draft löschen / archivieren

Wenn es dafür eine serverseitige DB-Funktion gibt, ist das oft sauberer als viele lose Client-Schreibvorgänge hintereinander. Supabase/Postgres-Funktionen eignen sich genau für solche Fälle. ([Supabase][4])

---

## 13. Ableitbare Metriken

Aus dem Modell kann MIDAS später eine Menge ableiten, ohne V1 aufzublasen.

### Für Krafttraining

* Volumen pro Satz = Gewicht × Reps
* Volumen pro Übung
* Volumen pro Session
* letzter Trainingszeitpunkt
* Satzabstände
* grobe Dauer pro Übung

### Für allgemeine Aktivitäten

* Häufigkeit
* Dauer
* Distanz
* Intensität
* Regelmäßigkeit

Diese Metriken müssen nicht sofort alle in der UI auftauchen, sollen aber aus dem Datenmodell sauber ableitbar sein.

---

## 14. JSON-Export-Ziel

Das System muss einen sauberen Zeitraum-Export unterstützen, z. B.:

* letzte 3 Monate
* letzte 6 Monate
* freier Zeitraum

Exportformat:

* session-orientiert
* mit eingebetteten Items und Events
* mit stabilen Keys
* maschinenlesbar
* ohne proprietäre Verrenkungen

Genau dafür ist das normalisierte Modell gedacht.

---

## 15. Guardrails

Das sind die Regeln, die Codex **nicht** übersehen darf:

* keine festen Übungsspalten pro Session
* keine Kernspeicherung als Textblob
* Repo-Semantik ist primäre Suchquelle
* Supabase ist primäre Verlaufsquelle
* IndexedDB ist nur Draft-Recovery
* keine Query pro Keypress ohne Debounce, falls später doch Online-Suche dazu kommt
* keine Pflichtfelder, die den Gym-Flow stören
* keine instabilen Keys
* keine frühe Embedding-/AI-Abhängigkeit
* keine Annahme, dass jede Aktivität denselben Feldsatz hat

---

## 16. Offene Entscheidungen, die vor Codex noch fixiert werden sollten

Hier sind die Punkte, die noch festgezogen gehören, bevor man loscodet:

### 16.1 Semantik-Datei

* genauer Pfad im Repo
* konkretes JSON-Schema
* Versionierung / Pflegeprozess

### 16.2 Suchlogik

* exakte Ranking-Regeln
* Mindestlänge für Suche
* wie Mehrdeutigkeiten dargestellt werden

### 16.3 Felddefinitionen

* erlaubte Feldtypen
* Pflicht vs. optional
* Dezimalwerte bei Gewicht / Distanz
* Ganzzahl nur für Reps?

### 16.4 Session-Sonderfälle

* leere Session abschließbar oder nicht?
* Session-Notiz ja/nein?
* Activity ohne Items direkt speicherbar?
* Abbruch-Flow

### 16.5 Custom-Einträge

* dürfen neue Custom Activities/Exercises angelegt werden?
* nur aus Repo-Datei wählbar oder später erweiterbar?

### 16.6 Export

* direkt aus Client
* oder über serverseitige Exportfunktion / RPC

---

## 17. Meine klare Empfehlung für V1 Defaults

Damit Codex nicht in Entscheidungssuppe ersäuft, würde ich für V1 folgendes setzen:

* Repo-basierte Semantik-Datei ist Pflicht
* keine DB-basierte Übungskatalogsuche in V1
* `sets` und `session` sind die einzigen aktiven Tracking-Modi in V1
* Gewichte und Distanzen dürfen decimal sein
* Reps sind integer
* `set_completed_at` ist der Satz-Zeitpunkt
* keine Pflicht-Warm-up-Logik in V1
* Session darf nicht leer abgeschlossen werden
* Recovery-Dialog bei vorhandenem Draft
* JSON-Export über definierbaren Zeitraum ist vorgesehen
* finale Speicherung nur bei explizitem Abschluss
* serverseitige Commit-/Exportfunktion ist erlaubt und wahrscheinlich sinnvoll

---

## 18. Codex-ready Kurzfassung

Hier die kompakte Fassung, die du direkt in eine Roadmap oder einen Prompt kippen kannst:

**Build the MIDAS activity module as a generic single-user activity tracking system, not just a gym logger. Use a repo-based semantics file as the primary lookup layer for canonical activity and exercise keys, aliases, tracking modes, and field definitions. Support at least two tracking modes in V1: `sets` for strength exercises and `session` for general sports or movement activities such as football, hiking, skiing, and cross-country skiing. Store active sessions first as local drafts with autosave recovery, using IndexedDB only as a local safety layer. Use Supabase/Postgres as the source of truth for completed sessions, historical lookups, and JSON exports. Persist data in a normalized structure with `activity_sessions`, `activity_session_items`, and `activity_item_events`, and avoid fixed exercise columns or unstructured text blobs. Query Supabase only after a canonical key has been selected locally from the semantics layer, mainly to retrieve recent history and to commit completed sessions. Keep keys stable, labels flexible, and use JSONB only for optional flexible payloads—not as a replacement for core relational structure.**

MIDAS-specific addition:

**The module should treat training and relevant movement as CKD-relevant lifestyle and load context, not as gamified fitness tracking. It should capture enough structured history to later combine activity data with doctor-view exports, blood pressure, body data, intake context, medication adherence, lab values, and nephrology reports. The goal is to support age-, CKD-, and life-context-aware training review with GPT/LLM assistance, while avoiding autonomous medical prescriptions or panic-driven recommendations.**

---

## 19. Schlussfazit

Unterm Strich ist das jetzt ein ziemlich sauberes Modell:

* **Bedeutung** liegt im Repo
* **Verlauf** liegt in Supabase
* **Sicherheit** liegt lokal im Draft
* **Struktur** bleibt normalisiert
* **Flexibilität** kommt über Tracking-Modi und Felddefinitionen
* **spätere Analyse** wird durch den JSON-Export möglich

Oder anders gesagt:
nicht zu klein gedacht, nicht unnötig futuristisch aufgeblasen — genau in dem Bereich, wo es später noch Spaß macht, statt nur Wartungsschmerzen.

Wenn du willst, mache ich dir daraus als nächsten Schritt ein wirklich formales **Roadmap-Dokument mit Goal / Scope / Not in Scope / Architecture / Data Model / UX Flow / Edge Cases / Guardrails / Open Decisions**.

[1]: https://supabase.com/docs/guides/database/overview?utm_source=chatgpt.com "Database | Supabase Docs"
[2]: https://supabase.com/docs/guides/database/json?utm_source=chatgpt.com "Managing JSON and unstructured data | Supabase Docs"
[3]: https://supabase.com/docs/guides/api?utm_source=chatgpt.com "Data REST API | Supabase Docs"
[4]: https://supabase.com/docs/guides/database/functions?utm_source=chatgpt.com "Database Functions | Supabase Docs"
[5]: https://supabase.com/docs/reference/javascript/using-filters?utm_source=chatgpt.com "JavaScript: Using filters"
[6]: https://supabase.com/docs/guides/database/extensions/pgvector?utm_source=chatgpt.com "pgvector: Embeddings and vector similarity"
