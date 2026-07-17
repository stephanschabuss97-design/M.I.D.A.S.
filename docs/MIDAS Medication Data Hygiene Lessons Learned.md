# MIDAS Medication Data Hygiene Lessons Learned

## Zweck

Dieses Dokument schließt die persönliche Lernschleife der Medication Data
Hygiene Roadmap ab. Es erklärt nicht nur, **was** geändert wurde, sondern vor
allem:

- warum die Roadmap aufwendiger als frühere Modulpflege war.
- welches Werkzeug an welcher Stelle eingesetzt wurde.
- welchen Beweis jeder Schritt liefern sollte.
- wann dieselbe Vorgehensweise bei zukünftigen MIDAS-Arbeiten sinnvoll ist.

Es ist kein SQL-Runbook und keine aktuelle Architektur-Source-of-Truth.
Verbindlich bleiben:

- [Medication Module Overview](<modules/Medication Module Overview.md>)
- [MIDAS Dev Environment](DEV_ENVIRONMENT.md)
- [SQL How-To](../sql/HOW_TO.md)
- [Medication Data Hygiene Roadmap (DONE)](<archive/MIDAS Medication Data Hygiene Roadmap (DONE).md>)

Stand: `12.07.2026`

## Ausgangslage

Das Medication-Modul funktionierte bereits. Das Problem war nicht eine kaputte
Oberfläche, sondern der Langzeitvertrag:

- Jede Einnahme erzeugte ein Einnahmeevent.
- Zusätzlich entstand eine Bestandsbewegung im Stock-Log.
- Undo, Restock und manuelle Bestandsänderungen erzeugten weitere Logzeilen.
- Diese Historie war weder vollständig genug für einen echten Audit-Trail noch
  langfristig wichtig für Patient oder Arzt.
- MIDAS soll noch in Jahrzehnten funktionieren, ohne unnötige Einzeldaten
  dauerhaft anzusammeln.

Die Aufgabe berührte deshalb gleichzeitig:

- produktive Gesundheitsdaten.
- Tabellen und Constraints.
- mehrere RPC-Funktionen.
- RLS und Data-API-Grants.
- Push, Widget, Intake und Realtime.
- einmalige Datenlöschung.
- zukünftige automatische Retention.

Das machte die Roadmap komplexer als einen normalen UI- oder Code-Fix.

## Ergebnis in einem Satz

MIDAS speichert weiterhin den aktuellen Medikamentenbestand, den Einnahmeplan
und ein Jahr dokumentierte Einnahmen, führt aber keinen dauerhaften Verlauf
jeder einzelnen Bestandsbewegung mehr.

## Das wichtigste mentale Modell

Bei dieser Arbeit gab es vier klar getrennte Ebenen:

<!-- markdownlint-disable MD013 -->

| Ebene | Zweck | Erlaubte Wirkung |
| --- | --- | --- |
| Repo | Vertrag lesen, SQL schreiben, Doku prüfen | Nur lokale Dateien ändern |
| Disposable Supabase | SQL und Migrationen real ausführen | Wegwerfdaten dürfen verändert werden |
| Produktion read-only | Tatsächlichen Iststand beweisen | Keine produktive Schreibwirkung |
| Produktion write | Freigegebenen Cutover ausführen | Geplante produktive Änderung |

<!-- markdownlint-enable MD013 -->

Die Reihenfolge war entscheidend:

1. Vertrag im Repo verstehen.
2. Zielzustand lokal bauen.
3. Zielzustand in einer echten Wegwerfdatenbank beweisen.
4. Produktion ausschließlich lesend gegenprüfen.
5. Snapshot erstellen.
6. Produktivänderung nach ausdrücklicher Freigabe ausführen.
7. Sofort technisch und anschließend im echten Alltag prüfen.

Der zentrale Lerneffekt ist: **Produktive Sicherheit entsteht nicht durch ein
einzelnes Werkzeug, sondern durch diese Reihenfolge von Beweisen.**

## Docker, Supabase Stack und psql

Diese drei Begriffe erfüllen unterschiedliche Aufgaben.

### Docker Desktop

Docker ist die Laufzeit für isolierte Container. Ein Container ist vereinfacht
eine abgegrenzte, reproduzierbare Laufumgebung mit der benötigten Software.

Für diese Roadmap bedeutete das:

- Eine lokale PostgreSQL-/Supabase-Umgebung konnte gestartet werden.
- Fehler durften Daten zerstören, weil es nur Wegwerfdaten waren.
- Tests liefen gegen echtes PostgreSQL 17.6 statt gegen eine theoretische
  SQL-Analyse.
- Der lokale Test musste nicht im produktiven Supabase-Projekt stattfinden.

Docker selbst kannte weder MIDAS noch die Medication-Logik. Es stellte nur die
Maschinenräume für den lokalen Supabase-Stack bereit.

### Supabase CLI und lokaler Supabase-Stack

Die Supabase CLI orchestriert die benötigten Docker-Container. Sie startet
nicht nur PostgreSQL, sondern bei Bedarf auch Auth, REST, Realtime und weitere
Supabase-Komponenten.

Vereinfacht:

```text
Docker Desktop = Motor und Container-Laufzeit
Supabase CLI   = Bauplan und Startsteuerung des Supabase-Systems
Supabase Stack = die tatsächlich laufenden lokalen Dienste
```

Verwendeter Grundbefehl:

```powershell
supabase start --workdir backend
```

Der lokale Stack war wichtig, weil Medication nicht nur aus Tabellen besteht.
RPCs, Auth-Kontext, RLS, Grants, Constraints und `pg_cron` mussten gemeinsam
funktionieren.

### psql

`psql` ist ein PostgreSQL-Client. Er ist kein Datenbankserver und kein
Supabase-Ersatz. Er sendet SQL an einen bereits laufenden PostgreSQL-Server und
zeigt dessen Antworten.

In dieser Roadmap diente `psql` für präzise lokale Tests:

- SQL-Dateien ausführen.
- Transaktionen bewusst zurückrollen.
- Tabellen, Constraints und Funktionsrechte prüfen.
- Fehlercodes und tatsächliches PostgreSQL-Verhalten sehen.

Das installierte `psql 16` konnte problemlos mit dem lokalen PostgreSQL-17-
Server sprechen. Client und Server müssen nicht dieselbe Hauptversion haben,
solange der verwendete Funktionsumfang kompatibel ist.

### Supabase MCP

Das Supabase MCP ist die kontrollierte Verbindung zum echten Supabase-Projekt.
Es wurde für produktionsnahe und produktive Aufgaben verwendet:

- Projekt- und Datenbankzustand abfragen.
- Read-only-Preflights ausführen.
- reviewte SQL-Migrationen nach Freigabe anwenden.
- Tabellen, Cron-Vertrag und Funktionsrechte nachprüfen.
- Security und Performance Advisor auslesen.

Der wesentliche Unterschied zum lokalen Stack:

```text
Supabase lokal in Docker = gefahrlose Beweisumgebung mit Wegwerfdaten
Supabase MCP              = Zugriff auf das echte Projekt
```

Dass ein MCP-Werkzeug verfügbar ist, ist keine automatische Freigabe für
produktive Writes. Der Roadmap-Vertrag und die unmittelbare User-Freigabe
blieben die Berechtigungsgrenze.

### REST und Service Role beim Snapshot

Für den privaten Sicherheitssnapshot wurden die vier alten Tabellen unmittelbar
vor dem Cutover über die Supabase REST API gelesen. Der lokal vorhandene
Service-Role-Key wurde nur zur Laufzeit aus der nicht committeten Env-Datei
geladen.

Dabei galten drei Regeln:

- Secret-Wert niemals ausgeben oder in das Repo schreiben.
- Snapshot außerhalb des Repos speichern.
- Inhalt über Zeilenzahlen und SHA-256 verifizieren.

REST war hier kein Ersatz für die Migration. Es war lediglich ein geeigneter
Exportpfad für die unmittelbare Rückfallhilfe.

### Git, rg und Diff-Checks

Nicht jedes wichtige Werkzeug war groß oder neu:

- `rg` fand Tabellen-, RPC-, Consumer- und Doku-Referenzen repo-weit.
- `git status --short` schützte bestehende fremde Änderungen im Dirty Worktree.
- `git diff` machte jeden Substep reviewbar.
- `git diff --check` fand formale Patch- und Whitespace-Probleme.

Diese Werkzeuge beantworten die Frage „Was ändere ich eigentlich?“, bevor
Docker oder Supabase die Frage „Funktioniert es wirklich?“ beantworten.

## Warum Docker hier sinnvoll war

Ein reiner Review hätte mehrere echte Fehler nicht zuverlässig gefunden:

- Eine scheinbare Kommentarzeile war syntaktisch kein SQL-Kommentar.
- Das Medication-SQL erwartete versteckt einen Trigger-Helper aus einer
  anderen Datei.
- `WITH ORDINALITY` lieferte `bigint`, eine Hilfsfunktion erwartete aber `int`.
- Ein produktionsrelevanter FK-Index fehlte.
- Die vollständige Transition musste Locks, Rollback, Rebase und Retention als
  Gesamtablauf bestehen.

Diese Fehler wurden sichtbar, weil PostgreSQL den Code tatsächlich ausführte.

Eine nützliche Entscheidungsregel lautet:

> Wenn eine Änderung Tabellen, Constraints, Trigger, RPCs, RLS, Migrationen
> oder echte PostgreSQL-Typen gemeinsam betrifft, reicht Lesen allein nicht.
> Dann ist eine disposable Datenbank der passende nächste Beweisschritt.

Docker wäre übertrieben gewesen für:

- eine Textkorrektur.
- reines CSS-Polishing.
- einen isolierten JavaScript-Syntaxfehler.
- eine Dokuänderung ohne Runtime-Vertrag.

## Welche SQL-Datei welche Rolle hatte

Die vier SQL-Dateien waren bewusst keine austauschbaren Varianten.

### `sql/12_Medication.sql`

Das ist der kanonische Medication-Vertrag.

Er beschreibt, wie eine neue oder frisch aufgebaute MIDAS-Datenbank aussehen
soll:

- drei Medication-Tabellen.
- Constraints und Indizes.
- RLS-Policies.
- Medication-RPCs.
- kein Stock-Log.

Das Skript ist möglichst idempotent. Wiederholtes Ausführen soll denselben
Zielzustand herstellen, ohne bestehende Nutzdaten grundlos zu löschen.

Wichtig: Ein kanonisches Master-SQL ist nicht automatisch die richtige
produktive Migration für eine bereits befüllte Datenbank.

### `sql/transition_medication_clean_start.sql`

Das war die einmalige Brücke vom alten produktiven Zustand zum neuen Modell.

Das Skript durfte bewusst Dinge tun, die ein Master-SQL nicht tun darf:

- alte Einnahmeevents löschen.
- alte Pläne bereinigen und aktuelle Pläne auf den Stichtag setzen.
- RPCs in sicherer Reihenfolge ersetzen.
- den Stock-Log entfernen.
- Low-Stock-Acknowledgements leeren.

Es ist absichtlich kein wiederverwendbares Wartungsskript. Nach erfolgreichem
Cutover muss ein zweiter Lauf geschlossen abbrechen.

### `sql/16_Explicit_Grants.sql`

Diese Datei legt fest, welche Supabase-Rollen Tabellen und RPCs verwenden
dürfen.

Sie beantwortet nicht „Welche Zeile darf Stephan sehen?“. Das regelt RLS.
Sie beantwortet zuerst „Darf diese Rolle das Objekt grundsätzlich über die
Data API verwenden?“.

Für Medication gilt:

- `authenticated`: benötigte App-Rechte, begrenzt durch RLS.
- `service_role`: benötigte Backend-Rechte.
- `anon`: keine Medication-Rechte.

Die Grants wurden nach der Transition erneut angewandt, weil entfernte und neu
definierte Objekte auf den finalen Rollenvertrag gebracht werden mussten.

### `sql/17_Medication_Retention.sql`

Diese Datei richtet den zukünftigen Betrieb ein:

- `pg_cron` aktivieren.
- Retention-Funktion anlegen.
- Execute für App-Rollen entziehen.
- genau einen benannten täglichen Job anlegen oder aktualisieren.
- den benötigten Tagesindex anlegen.

Sie löscht nicht pauschal Daten beim Deploy. Die Cleanup-Funktion entscheidet
bei jedem Lauf anhand des aktuellen Wiener Cutoffs, welche Daten alt genug sind.

### Produktive Reihenfolge

Die produktive Reihenfolge war:

1. Transition und Clean Start.
2. Explizite Grants herstellen.
3. Retention und Cron aktivieren.

Die Reihenfolge verhinderte Zwischenzustände wie:

- Tabelle entfernt, aber alte RPCs schreiben noch hinein.
- neue RPCs vorhanden, aber App-Rollen dürfen sie nicht aufrufen.
- Cron startet, bevor das Zielmodell vollständig existiert.

## Idempotent ist nicht gleich ungefährlich

`Idempotent` bedeutet: Ein erneuter Lauf führt wieder zum gleichen Zielzustand.
Es bedeutet nicht automatisch:

- frei von Locks.
- frei von Datenänderungen.
- risikolos in Produktion.
- ohne Freigabe ausführbar.

Beispiele:

- `create index if not exists` ist idempotent, kann aber produktiv Last und
  Locks erzeugen.
- Ein Cron-Provisioning kann idempotent sein, verändert aber den Betrieb.
- Das Clean-Start-SQL war absichtlich **nicht** wiederholbar, weil ein zweiter
  destruktiver Lauf keinen fachlichen Sinn hätte.

Die bessere Frage ist daher nicht nur „Ist das SQL idempotent?“, sondern:

> Welche Daten, Locks, Rechte und laufenden Prozesse kann dieses SQL berühren?

## Wie der produktive Cutover abgesichert wurde

### Read-only Preflight

Vor jeder produktiven Änderung wurde geprüft:

- richtiger Supabase-Projektzustand.
- erwarteter Medication-Owner.
- Anzahl von Medikamenten, Plänen und Events.
- keine negativen Bestände.
- keine kollidierenden aktiven Pläne.
- keine heutige Einnahmebestätigung.
- noch keine Medication-Push-Zustellung des Tages.
- Stock-Log und abhängige RPCs im erwarteten Altzustand.
- keine View oder fremder FK blockiert den Drop.

Der Preflight war read-only. Er konnte daher gefahrlos wiederholt werden.

### Snapshot

Unmittelbar vor dem Cutover wurde außerhalb des Repos ein privater JSON-
Snapshot erstellt und mit SHA-256 geprüft.

Der Snapshot war keine neue Backup-Strategie, sondern eine einmalige
Rollback-Hilfe für genau diesen Cutover.

Wichtig war die Reihenfolge:

1. Live-Preflight.
2. Snapshot.
3. Zeilenzahlen gegen den Preflight vergleichen.
4. Erst danach schreiben.

Ein vorhandenes Backup ist nur dann nützlich, wenn geprüft wurde, dass es die
erwarteten Tabellen und Zeilenzahlen wirklich enthält.

### Transaktion

Das Transition-SQL lief innerhalb einer Transaktion:

```sql
begin;
-- Prüfungen und Änderungen
commit;
```

Wenn eine Guardrail scheiterte, sollte PostgreSQL alles zurückrollen. Dadurch
entstand kein halbfertiger Zustand.

### Locks und Timeouts

Die vier alten Medication-Tabellen wurden in fester Reihenfolge exklusiv
gesperrt. Das verhinderte, dass zwischen dem letzten Preflight und dem Löschen
noch parallel eine Einnahme geschrieben wird.

Kurze Timeouts verhinderten, dass das Skript bei konkurrierender Nutzung
unbegrenzt wartet:

- `lock_timeout`: Abbruch, wenn ein Lock nicht rasch verfügbar ist.
- `statement_timeout`: Abbruch, wenn ein Statement unerwartet lange dauert.

Die richtige Reaktion auf einen Lock-Timeout wäre nicht „Timeout erhöhen und
nochmals blind starten“, sondern Ursache prüfen und ein ruhiges Fenster wählen.

### Preconditions nach dem Lock

Ein Preflight vor der Transaktion allein hätte ein Zeitfenster für Race
Conditions gelassen. Deshalb wurden zentrale Bedingungen **nach** dem Lock
nochmals geprüft:

- weiterhin derselbe Wiener Tag.
- weiterhin vor 10:00 Uhr.
- weiterhin kein Confirm des Tages.
- weiterhin keine Medication-Push-Zustellung.
- weiterhin genau der erwartete Owner.
- weiterhin keine Plan-Kollision.

Das ist ein übertragbares Muster für produktive Datenmigrationen:

> Erst grob read-only prüfen, dann sperren, dann die kritischen Bedingungen
> innerhalb der geschützten Transaktion erneut prüfen.

## Warum ein PostgreSQL-Cron-Job verwendet wird

Die Retention hängt ausschließlich von Daten in PostgreSQL und einem Datum ab:

- Ist ein Event älter als ein Wiener Kalenderjahr?
- Ist ein beendeter Plan alt und wird nicht mehr referenziert?
- Ist ein eigener abgeschlossener Cron-Lauf älter als 90 Tage?

Diese Aufgabe braucht:

- keine Benutzeroberfläche.
- keinen eingeloggten Nutzer.
- keine Edge Function.
- keinen externen Webdienst.

Darum läuft sie direkt dort, wo die Daten liegen.

Der Job `midas-medication-retention-daily` startet täglich um `03:15 UTC` und
ruft die interne Cleanup-Funktion auf. Im österreichischen Sommer ist das
05:15 Uhr, im Winter 04:15 Uhr.

Die Funktion ist für App-Rollen nicht aufrufbar. Sie gehört zum internen
Datenbankbetrieb, nicht zur öffentlichen Medication-API.

## Warum keine GitHub Action verwendet wird

Eine GitHub Action wäre technisch möglich, aber sie würde für diese Aufgabe
zusätzliche bewegliche Teile einführen:

- Supabase-Secrets müssten in GitHub hinterlegt werden.
- GitHub müsste nach Zeitplan verfügbar sein.
- Der Workflow müsste eine API, Edge Function oder SQL-Funktion aufrufen.
- Fehler könnten zwischen GitHub, Netzwerk und Supabase entstehen.
- Eine rein interne Datenbankaufgabe würde von einem externen Scheduler
  abhängen.

GitHub Actions sind passend, wenn ein Ablauf außerhalb der Datenbank nötig ist,
zum Beispiel:

- Edge Function über HTTP auslösen.
- Repository-Code bauen oder testen.
- externe Dienste koordinieren.
- Workflow-Logs als Betriebsoberfläche nutzen.

PostgreSQL Cron ist passend, wenn:

- alle Eingangsdaten in PostgreSQL liegen.
- die Aktion nur SQL benötigt.
- kein externer Kontext erforderlich ist.
- die Wartung unabhängig von App, GitHub und Benutzerlogin laufen soll.

Die Wahl lautet also nicht „Cron ist besser als GitHub Actions“, sondern:

> Der Scheduler soll möglichst nahe an der Aufgabe sitzen und nur so viele
> Systeme wie notwendig einbeziehen.

## Welche Tests welche Frage beantworteten

<!-- markdownlint-disable MD013 -->

| Teststufe | Beantwortete Frage |
| --- | --- |
| `rg` und Code-Review | Wo wird der Stock-Log wirklich verwendet? |
| `git diff --check` | Enthält der Patch formale Diff-/Whitespace-Fehler? |
| Disposable Bootstrap | Kann eine frische Datenbank aus dem kanonischen SQL entstehen? |
| Zweiter Bootstrap-Lauf | Sind die wiederverwendbaren SQL-Dateien tatsächlich idempotent? |
| RPC-Fixtures | Stimmen Confirm, Undo, Restock und Grenzfälle fachlich? |
| Transition-Fixtures | Funktionieren Erfolg, Rollback, Owner-, Kollisions- und Lock-Guards? |
| Produktiver Preflight | Entspricht die echte Datenbank unseren Annahmen? |
| Snapshot-Prüfung | Existiert eine verwertbare unmittelbare Rückfallhilfe? |
| Post-Cutover SQL | Wurde exakt der erwartete Zielzustand erreicht? |
| PWA-Smoke | Funktioniert der reale Nutzerpfad? |
| Android-Smoke | Wird der neue Status auf dem zweiten Client übernommen? |
| Incident-Dry-Run | Bleibt ein bestätigter Abschnitt für Push wirklich geschlossen? |
| Security Advisor | Hat die Schemaänderung neue Sicherheitswarnungen erzeugt? |
| Doku-Contract-Review | Beschreiben Roadmap, SQL, QA und Overview dasselbe System? |

<!-- markdownlint-enable MD013 -->

Kein einzelner Test hätte alle Fragen beantwortet.

## Was durch echtes Ausführen gelernt wurde

### Tool installiert bedeutet nicht Tool einsatzbereit

Die Supabase CLI meldete eine Version, obwohl die eigentliche
`supabase-go.exe` fehlte. Erst ein realer Hilfs- und Startbefehl zeigte den
unvollständigen Zustand.

Übertragbare Regel:

> Nach einer Installation nicht nur `--version`, sondern mindestens einen
> echten, ungefährlichen Funktionsbefehl testen.

### Ein Modul sollte seine notwendigen Grundlagen selbst provisionieren

`12_Medication.sql` erwartete einen Trigger-Helper aus einer anderen SQL-Datei.
Das funktionierte nur bei einer bestimmten globalen Ausführungsreihenfolge.

Der lokale Fresh-Bootstrap deckte diese versteckte Abhängigkeit auf. Der Helper
wurde idempotent in den Medication-Vertrag aufgenommen.

Übertragbare Regel:

> Ein modulares Master-SQL sollte entweder seine Voraussetzungen selbst
> herstellen oder sie sichtbar und testbar als Vorbedingung deklarieren.

### PostgreSQL-Typen sind Teil des Vertrags

`WITH ORDINALITY` liefert `bigint`. Eine Hilfsfunktion erwartete `int`.
JavaScript- oder Textreview allein hätte diesen echten Laufzeitvertrag leicht
übersehen.

Übertragbare Regel:

> Bei SQL sind Rückgabetypen von Funktionen, Aggregaten und Sprachkonstrukten
> genauso wichtig wie die sichtbaren Tabellenfelder.

### Externe Reviews sind Hinweise, keine Befehle

CodeRabbit meldete später einen vermeintlich fehlenden Unique-Constraint für
den zusammengesetzten FK. Die Prüfung zeigte, dass bereits ein passender
eindeutiger Index auf exakt `(id, med_id)` existierte.

Ein blindes Anwenden hätte einen redundanten Index erzeugt.

Übertragbare Regel:

1. Finding lokalisieren.
2. Tatsächlichen Code und Datenbankvertrag prüfen.
3. Reproduzierbaren Nachweis suchen.
4. Erst dann ändern oder begründet schließen.

### Technisch korrekt kann sprachlich trotzdem falsch sein

Der Cutover erhielt die Bestände absichtlich unverändert. Die Doku sagte
zunächst trotzdem, sie müssten zwingend neu gesetzt werden.

Nach dem physischen Abgleich waren die Bestände bereits korrekt. Die richtige
Anweisung lautete daher: prüfen und nur bei Abweichung korrigieren.

Übertragbare Regel:

> Abnahme-Copy ist Teil des Produktvertrags. Sie darf keine unnötige Handlung
> verlangen und muss das tatsächliche Systemverhalten beschreiben.

### Lokale Infrastruktur hat ebenfalls eine Angriffsfläche

Docker veröffentlichte die lokalen Supabase-Ports auf Host-Interfaces. Für die
Medication-Tests wäre nur Loopback nötig gewesen. Eine Firewall-Regel blockiert
deshalb Remote-Inbound für den lokalen Portbereich.

Übertragbare Regel:

> „Nur lokal zum Testen“ ist eine Absicht, kein technischer Beweis. Bindings,
> Ports und Netzwerkzugriff müssen geprüft werden.

## Wann verwende ich künftig welches Werkzeug?

<!-- markdownlint-disable MD013 -->

| Aufgabe | Erstes Werkzeug | Wann mehr nötig ist |
| --- | --- | --- |
| Text oder Doku ändern | Editor, `rg`, `git diff --check` | Contract Review bei Source-of-Truth-Änderung |
| Frontend-JavaScript ändern | Node `--check` | Browser-/Playwright-Smoke bei UI-Verhalten |
| Edge Function ändern | Deno `check` | lokaler/Remote-Dry-Run und freigegebener Deploy |
| Android-Code ändern | Gradle Wrapper | APK, Gerätetest und ADB bei Runtime-Fragen |
| Einzelnes SQL lesen | `rg`, Review, PostgreSQL-Doku | echte DB bei Typ-, Constraint- oder RPC-Fragen |
| Schema/RPC/Trigger ändern | lokaler Supabase-Stack in Docker | Fixtures, RLS-/Grant- und Rerun-Tests |
| Produktiven Iststand prüfen | Supabase read-only SQL/MCP | Snapshot, wenn später destruktiv geschrieben wird |
| Produktivschema ändern | reviewtes SQL plus explizite Freigabe | Preflight, Snapshot, Postconditions und Runtime-Smoke |
| Wiederkehrende reine DB-Wartung | PostgreSQL `pg_cron` | GitHub nur bei externem Ablauf nötig |
| Externen HTTP-/Repo-Ablauf planen | GitHub Actions | Secrets, Logs und Fehlermodus gesondert prüfen |
| Review-Finding erhalten | Code und Vertrag reproduzierbar prüfen | Nur bestätigte Findings implementieren |

<!-- markdownlint-enable MD013 -->

## Ein wiederverwendbarer Entscheidungsbaum

### Frage 1: Kann die Änderung produktive Daten verändern?

- Nein: normaler lokaler Review- und Testpfad.
- Ja: Roadmap, Guardrails und explizite Freigabe einplanen.

### Frage 2: Ist es nur Anwendungscode oder auch Datenbankverhalten?

- Nur Anwendungscode: passendes Sprachtool und UI-Smoke.
- Datenbankverhalten: echte PostgreSQL-Testumgebung verwenden.

### Frage 3: Kann ein Fehler lokal mit Wegwerfdaten reproduziert werden?

- Ja: zuerst Docker/Supabase lokal.
- Nein: produktiv zunächst ausschließlich read-only diagnostizieren.

### Frage 4: Ist die produktive Änderung reversibel?

- Voll reversibel: Rollback-Pfad trotzdem prüfen.
- Datenlöschung oder einmalige Migration: unmittelbaren Snapshot und
  transaktionale Guards verlangen.

### Frage 5: Muss etwas regelmäßig laufen?

- Reines SQL auf DB-Daten: `pg_cron` prüfen.
- HTTP, Repository oder externer Dienst: GitHub Action oder anderer externer
  Scheduler prüfen.

### Frage 6: Wer kann den echten Alltag beweisen?

- Codex kann Struktur, SQL, Rechte und Dry-Runs beweisen.
- Der User beweist reale Packungsbestände, echte Einnahme, sichtbare PWA und
  Android-Verhalten.
- Beide Nachweise gehören zusammen.

## Empfohlener Ablauf für ähnliche Roadmaps

1. **S1 - Iststand ermitteln**
   - Source of Truth und echte Consumer finden.
   - Produktion nur read-only betrachten.
2. **S2 - Zielvertrag festlegen**
   - Was bleibt, was entfällt, wie lange werden Daten benötigt?
3. **S3 - Risiken bestimmen**
   - Datenverlust, RLS, Locks, Concurrency, Push und Downstream-Pfade.
4. **Readiness Gate**
   - S4-Substeps anhand der Erkenntnisse neu bewerten.
5. **S4 - Lokal implementieren**
   - Kleine Substeps, jeweils Code- und Contract Review.
6. **S5 - Beweise und produktiver Cutover**
   - statisch, disposable, read-only produktiv, Snapshot, Freigabe, Write,
     Postconditions, echter Runtime-Smoke.
7. **S6 - Dokumente synchronisieren**
   - Overview, QA, Betriebsdoku, Findings, Archiv und Commit.

## Welche Fragen ich als Owner künftig stellen kann

Vor einer ähnlichen Arbeit helfen diese Fragen:

- Was ist die aktuelle Source of Truth?
- Welche Daten sind fachlich wertvoll und welche nur technische Nebenwirkung?
- Welche Consumer lesen oder schreiben das Objekt wirklich?
- Kann ich den Zielzustand in einer Wegwerfdatenbank beweisen?
- Was genau würde ein zweiter SQL-Lauf tun?
- Welche produktiven Preconditions müssen unmittelbar vor dem Write gelten?
- Brauche ich einen Snapshot, und habe ich seinen Inhalt geprüft?
- Welche Bedingung führt automatisch zu Rollback?
- Welche Teile kann Codex beweisen und welche muss ich real am Gerät prüfen?
- Muss der wiederkehrende Job in der Datenbank oder außerhalb laufen?
- Welche Doku wäre nach erfolgreichem Deploy sonst noch falsch?

## Persönliche Lessons Learned

### Der enge Korridor war kein Hindernis

Die Roadmap verlangsamte einzelne Schritte, machte aber produktive Autonomie
möglich. Codex durfte viel ausführen, weil Scope, Reihenfolge, Stop-Bedingungen
und Freigaben vorher feststanden.

Das ist ein wichtiger Unterschied:

```text
Freie Hand ohne Vertrag  = schwer kontrollierbares Risiko
Autonomie mit Guardrails = schneller, aber nachvollziehbarer Vollzug
```

### Mehr Autonomie braucht bessere Beobachtbarkeit

Je mehr ein Agent selbst ausführt, desto wichtiger werden:

- kurze Zwischenstände.
- explizite Gates.
- gespeicherte Ergebnisprotokolle.
- Read-only-Nachweise.
- klare Trennung zwischen Test und Produktion.
- ein realer User-Smoke am Ende.

Nicht jeder Terminalbefehl muss im Detail verstanden werden. Verstanden werden
sollten aber immer:

- Zweck des Werkzeugs.
- erwartete Wirkung.
- mögliche Schadenswirkung.
- Stop-Bedingung.
- Beweis für Erfolg.

### Die Lernschleife endet nicht beim grünen Test

Die vollständige Schleife lautet:

1. Problem beobachten.
2. Zielvertrag formulieren.
3. Risiken verstehen.
4. Werkzeug bewusst auswählen.
5. Änderung beweisen.
6. Ergebnis im Alltag prüfen.
7. erklären können, warum genau dieser Weg gewählt wurde.

Dieses Dokument ist der siebte Schritt dieser Medication-Roadmap.

## Konsequenz für zukünftige Roadmaps

Das MIDAS Roadmap Template enthält nun einen eigenen Block
`Owner-Verständnis: Wie und warum`.

Er hält kompakt fest:

- was fachlich geändert wird.
- warum dieser Weg gewählt wurde.
- welches Werkzeug welche Aufgabe übernimmt.
- was lokal und was produktiv geschieht.
- welche Risiken und Stop-Bedingungen gelten.
- woran Technik und Owner den Erfolg erkennen.

Vor neuen Werkzeugen, Architekturentscheidungen, produktiven Writes, Deploys
oder irreversiblen Aktionen kommt zusätzlich ein kurzes Owner Briefing mit
Zweck, Wirkung, Risiko, Rückfall und Erfolgsnachweis. Kleine Syntax- und
Standardcheck-Schritte brauchen dieses Briefing nicht.

Die abgeschlossene Medication Data Hygiene Roadmap enthält diesen Block
rückwirkend mit den tatsächlich verwendeten Werkzeugen und den drei zentralen
Briefing-Gates für Docker, produktiven Clean Start und Cron-Aktivierung.

## Kurzfassung zum Merken

- **Docker**: sichere Wegwerf-Laufumgebung für echte lokale Systeme.
- **Supabase CLI**: startet und steuert den lokalen Supabase-Stack.
- **psql**: spricht direkt mit PostgreSQL und führt präzise SQL-Tests aus.
- **Master-SQL**: beschreibt den dauerhaften Zielzustand.
- **Transition-SQL**: bringt eine bestehende Datenbank einmalig dorthin.
- **Grants**: erlauben Rollen grundsätzlich den Data-API-Zugriff.
- **RLS**: begrenzt innerhalb dieses Zugriffs die sichtbaren Zeilen.
- **Preflight**: beweist vor dem Write, dass die Annahmen noch stimmen.
- **Snapshot**: unmittelbare Rückfallhilfe vor destruktiven Änderungen.
- **Transaktion und Locks**: verhindern halbe Migrationen und parallele Writes.
- **PostgreSQL Cron**: regelmäßige reine Datenbankwartung direkt bei den Daten.
- **GitHub Action**: externer Scheduler für HTTP-, Repo- oder Systemabläufe.
- **Runtime-Smoke**: beweist, dass der technische Zielzustand auch im Alltag
  funktioniert.
- **Doku-Sync**: verhindert, dass der nächste Chat auf einem alten Vertrag
  weiterarbeitet.
