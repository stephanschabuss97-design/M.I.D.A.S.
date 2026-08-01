# MIDAS QA - Backend and Supabase

Diese Suite besitzt aktuelle, statuslose Regressionstests mit dem Präfix
`BS-`. Der allgemeine Testfall- und Evidence-Vertrag steht im
[QA-Einstieg](README.md).

## Zuständigkeit

- Supabase Core und domänenneutrale Edge-Runtime
- Grants, RLS und Rollenverträge
- Cron-, RPC- und allgemeine Plattformkonfiguration
- technische Request-, Auth- und Fehlerverträge ohne fachliche Domänenlogik

## Abgrenzung

- Fachliches Trendpilot-, Push-, Report- oder Medication-Verhalten bleibt in
  der jeweiligen Domänensuite.
- Ein gemeinsamer Backend-Consumer ist kein Grund, denselben fachlichen
  Testfall unter `BS-` zu kopieren.
- Produktarchitektur bleibt in den zuständigen Module Overviews.

## Testfälle

### BS-001 - Supabase Core aggregiert genau einmal

- Vertrag: [Supabase Core Overview](<../modules/Supabase Core Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: read-only
- Voraussetzung: Supabase-Module können mit gültiger und fehlender Konfiguration
  initialisiert werden.
- Aktion: Core zweimal initialisieren und einen nicht exportierten Wrapper
  anfordern.
- Erwartung: `SupabaseAPI` und `AppModules.supabase` zeigen auf dasselbe Bundle,
  `supabase:ready` feuert einmal und fehlende Exporte werfen sichtbar.
- Invalidiert durch: Supabase-Aggregator, Module Sources, Ready-Event oder Wrapper.

### BS-002 - Supabase Client bleibt kontextsensitiv und singleton

- Vertrag: [Supabase Core Overview](<../modules/Supabase Core Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: read-only
- Voraussetzung: Browser/PWA- und Android-WebView-Kontext sind simulierbar.
- Aktion: Parallele Client-Anforderungen in beiden Kontexten ausführen.
- Erwartung: Der Inflight-Lock erzeugt pro Kontext keinen Mehrfachclient;
  Browser nutzt normale Persistenz, WebView bleibt importierter Mirror statt
  eigenständigem Auth-Owner.
- Invalidiert durch: Client-Factory, Inflight-Lock, Storage oder Android-Erkennung.

### BS-003 - Edge Functions bestehen Deno Source Checks

- Vertrag: [Backend Source README](../../backend/README.md)
- Ebene: static
- Ausführung: automated
- Wirkung: read-only
- Voraussetzung: Deno und der versionierte Backend-Source sind lokal vorhanden.
- Aktion: `deno check` für jede produktive Function-`index.ts` ausführen und
  vorhandene Deno-Tests der betroffenen Function starten.
- Erwartung: Imports, Typen und Tests sind grün; ein Source-Check wird nicht als
  Runtime-Smoke oder Deploy ausgegeben.
- Invalidiert durch: Edge-Function-Code, Imports, Deno-Version oder Tests.
- Runbook: [Edge Function Deploy Smoke](runbooks/edge-function-deploy-smoke.md)

### BS-004 - Edge Request trennt User- und Service-Role-Pfad

- Vertrag: [Backend Source README](../../backend/README.md)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: Gültiger User-Bearer, Service-Role-Caller, fehlende Auth und
  fremde User-ID sind isoliert simulierbar.
- Aktion: Den technischen Auth-Einstieg der betroffenen Function mit allen
  Varianten aufrufen.
- Erwartung: Userpfad bindet an den authentifizierten User, Scheduler braucht
  explizite Zielauflösung, fehlende oder widersprüchliche Identität wird vor
  fachlichen Reads und Writes abgelehnt.
- Invalidiert durch: Edge-Auth, Scheduler-Caller, User-Auflösung oder Service Role.
- Cleanup: Isolierte Auth-, Request- und Datenbankadapter verwerfen.

### BS-005 - Edge Fehler liefern sicheres JSON und CORS

- Vertrag: [Backend Source README](../../backend/README.md)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: read-only
- Voraussetzung: OPTIONS, ungültiges JSON, Validierungsfehler und interner Fehler
  sind kontrolliert auslösbar.
- Aktion: Alle Fehler- und Preflight-Pfade der betroffenen Function aufrufen.
- Erwartung: OPTIONS ist CORS-konform, Clientfehler bleiben 4xx mit klarer JSON-
  Meldung und interne Fehler leaken weder Stack, Secret noch Rohdaten.
- Invalidiert durch: Request-Parser, Response-Helper, CORS oder Error-Redaction.

### BS-006 - Data API Grants sind objektbezogen und explizit

- Vertrag: [SQL How-To](../../sql/HOW_TO.md)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: Frisches isoliertes Schema mit allen von
  `16_Explicit_Grants.sql` erwarteten Objekten ist vorhanden.
- Aktion: Grant-SQL ausführen und ACLs für `anon`, `authenticated`,
  `service_role` sowie `PUBLIC` lesen.
- Erwartung: Kein pauschales Schema-Grant und kein ungeprüftes `grant all` ist
  aktiv; jedes Objekt besitzt nur die dokumentierten Rollenrechte.
- Invalidiert durch: Neues Data-API-Objekt, Grant-SQL, Rollenvertrag oder Schema.
- Cleanup: Isolierten lokalen Stack beziehungsweise Testschema verwerfen.
- Runbook: [Supabase SQL Cutover](runbooks/supabase-sql-cutover.md)

### BS-007 - RLS trennt eigene und fremde Zeilen

- Vertrag: [SQL How-To](../../sql/HOW_TO.md)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: Zwei isolierte Testuser, je eigene Zeilen und die aktuellen
  RLS-Policies sind vorhanden.
- Aktion: SELECT, INSERT, UPDATE und DELETE als beide User sowie kontrolliert als
  Service Role ausführen.
- Erwartung: Authenticated sieht nur eigene Zeilen. Direkte Änderungen sind
  nur erlaubt, wenn der jeweilige Tabellenvertrag Client-DML vorsieht;
  RPC-only-Bereiche wie Activity V2 weisen direkte INSERT/UPDATE/DELETE auch
  für eigene Zeilen ab. Fremde Writes scheitern, während ein expliziter
  Service-Role-Pfad nur seinen vorgesehenen Backendvertrag erfüllt.
- Invalidiert durch: Tabellen, RLS, Policies, Grants oder Service-Role-Nutzung.
- Cleanup: Beide Testuser und alle zugehörigen Fixtures entfernen.
- Runbook: [Supabase SQL Cutover](runbooks/supabase-sql-cutover.md)

### BS-008 - RPC-ACL und Security-Modus sind bewusst

- Vertrag: [SQL How-To](../../sql/HOW_TO.md)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: Aktuelle Data-API-RPCs und Rollen stehen im isolierten Schema bereit.
- Aktion: Funktionssignaturen, Execute-ACL, `security invoker/definer`,
  `search_path` und Aufruf als `anon`, `authenticated` sowie `service_role` prüfen.
- Erwartung: Nur beabsichtigte Rollen dürfen exakt die versionierte Signatur
  aufrufen; privilegierte Funktionen besitzen einen begrenzten internen Vertrag.
- Invalidiert durch: RPC-Signatur, Function-Security, Grants oder Search Path.
- Cleanup: Isoliertes Testschema verwerfen.
- Runbook: [Supabase SQL Cutover](runbooks/supabase-sql-cutover.md)

### BS-009 - Cron-Provisionierung konvergiert auf einen Job

- Vertrag: [SQL How-To](../../sql/HOW_TO.md)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: Lokaler Supabase-Stack mit `pg_cron` und isoliertem Jobnamen ist
  verfügbar.
- Aktion: Ein aktuelles Retention-/Hygiene-SQL zweimal ausführen und Jobname,
  Owner, Datenbank, Schedule, Command, Aktivstatus sowie Execute-ACL lesen.
- Erwartung: Genau ein Job mit identischem Vertrag bleibt aktiv; fremder Owner,
  Duplikat oder Vertragsdrift stoppt sichtbar statt still umgeschrieben zu werden.
- Invalidiert durch: Cron-SQL, Extension, Owner-, Schedule-, Command- oder ACL-Änderung.
- Cleanup: Isolierten Testjob und Fixtures entfernen oder lokalen Stack verwerfen.
- Runbook: [Supabase SQL Cutover](runbooks/supabase-sql-cutover.md)

### BS-010 - Lokaler Supabase-Stack bleibt von Produktion getrennt

- Vertrag: [MIDAS Dev Environment](../DEV_ENVIRONMENT.md)
- Ebene: local-runtime
- Ausführung: manual
- Wirkung: disposable
- Voraussetzung: Docker Desktop, Supabase CLI und lokaler MIDAS-Workdir sind
  verfügbar; keine produktiven Secrets wurden eingespeist.
- Aktion: Lokalen Stack starten, Status und Loopback-Erreichbarkeit prüfen und
  die bekannte fehlende Seed-Datei als Caveat verifizieren.
- Erwartung: Stack läuft nur lokal, Remote-Inbound bleibt blockiert und kein
  erfolgreicher lokaler Check gilt als produktive Freigabe.
- Invalidiert durch: Docker, Supabase CLI, Config, Seed oder Firewall-Regel.
- Cleanup: Lokalen Stack mit `supabase stop --workdir backend` beenden; temporäre
  Testdaten ausschließlich im lokalen Stack belassen oder den Stack verwerfen.
- Runbook: [Supabase SQL Cutover](runbooks/supabase-sql-cutover.md)

### BS-011 - Deploy nutzt den versionierten Backend-Source

- Vertrag: [MIDAS Dev Environment](../DEV_ENVIRONMENT.md)
- Ebene: remote
- Ausführung: manual
- Wirkung: productive
- Voraussetzung: Explizite Owner-Freigabe, grüne Deno-Checks, Supabase-Login und
  Projekt-Referenz sind vorhanden.
- Aktion: Betroffene Function aus dem Repo-Workdir `backend` deployen, Remote-
  Liste prüfen und einen sicheren Smoke ausführen.
- Erwartung: Deploy verwendet `backend/supabase/functions/<name>`, Remote-Funktion
  ist erreichbar und Source-Check, Deploy und Runtime-Smoke bleiben getrennte
  Nachweise.
- Invalidiert durch: Backend-Pfad, Supabase CLI, Function-Code oder Deploy-Config.
- Runbook: [Edge Function Deploy Smoke](runbooks/edge-function-deploy-smoke.md)

### BS-012 - Secrets bleiben außerhalb von Repo und Evidence

- Vertrag: [MIDAS Dev Environment](../DEV_ENVIRONMENT.md)
- Ebene: static
- Ausführung: automated
- Wirkung: read-only
- Voraussetzung: Geänderter Scope, Git-Status und Environment-Dateinamen sind
  bekannt.
- Aktion: Geänderte Dateien und Doku auf Secret-Werte, Tokens, Roh-Endpunkte,
  private Keys und versehentlich getrackte `.env`-Dateien prüfen.
- Erwartung: Nur Variablennamen oder redigierte Metadaten sind dokumentiert;
  Secrets liegen ausschließlich lokal, in Supabase oder GitHub Secrets.
- Invalidiert durch: Env-, Deploy-, Workflow-, Doku- oder Logging-Änderungen.

### BS-013 - Activity V2 besitzt genau eine gehärtete Schreibgrenze

- Vertrag: [Activity Module Overview](<../modules/Activity Module Overview.md>)
- Ebene: local-runtime
- Ausführung: automated
- Wirkung: disposable
- Voraussetzung: `20_Activity_V2.sql`, danach `16_Explicit_Grants.sql`, sind
  in der guarded PostgreSQL-17-Fixture eingerichtet.
- Aktion: Vier Tabellen, zwei exakte RPC-Signaturen, Owner, RLS/Policies,
  ACLs und leere Search Paths prüfen; gültige, ungültige und wiederholte
  Commits sowie Zwei-User-, Anonymous-Claim-, Direkt-DML- und Race-Pfade
  ausführen.
- Erwartung: Katalogversion 1 besitzt exakt 78 aktive Einträge. Nur ein
  permanenter authentifizierter User darf den `postgres`-owned
  `SECURITY DEFINER`-Commit aufrufen; der Commit ist atomar und retry-sicher.
  Tabellen-DML ist für Client- und Service-Rollen entzogen. Lookup und
  History-SELECT bleiben ownergebunden; `anon`, `PUBLIC` und anonyme JWTs
  erhalten keinen Zugriff.
- Invalidiert durch: `20_Activity_V2.sql`, R2-Block in
  `16_Explicit_Grants.sql`, Rollen/Claims, Function-Owner oder PostgreSQL-
  Major-Version.
- Cleanup: Guarded Wegwerf-Datenbank entfernen und lokalen Stack stoppen.
- Runbook: [Supabase SQL Cutover](runbooks/supabase-sql-cutover.md)

### BS-014 - Activity V2 C2 projiziert einen unveränderlichen Katalog v2

- Vertrag: [Activity Module Overview](<../modules/Activity Module Overview.md>),
  [C2 Catalog Contract](<../MIDAS Activity V2 C2 Catalog Version 2 Contract.md>)
  und [C2 Evidence](<../archive/MIDAS Activity V2 C2 Catalog Version 2 Studio Vocabulary Evidence (DONE).md>)
- Ebene: disposable + productive read-only
- Ausführung: automated + owner-gated SQL
- Wirkung: disposable write; produktiver Write ausschließlich am freigegebenen
  C2-Gate, danach read-only
- Voraussetzung: Für den Fresh-/Fixture-Pfad gilt exakt
  `20_Activity_V2.sql -> 21_Activity_V2_Catalog_V2.sql -> 16_Explicit_Grants.sql`.
  Produktiv dürfen R2-Objekte nicht neu provisioniert werden.
- Aktion: Guarded C2-Fixture auf PostgreSQL 17 vollständig ausführen. Fresh-
  Stand, exakten SQL-21-Re-Run, 79er-Teilbestand, 80er-Inhaltsdrift sowie
  v2-Commit/versionsübergreifenden Lookup prüfen. Produktiv nur Zähler,
  vollständige kanonische Repo-Feldhashes, Referenzen und Security-Grenzen
  read-only verifizieren.
- Erwartung: v1 bleibt exakt und vertragsgleich bei 78; v2 ist exakt und
  vertragsgleich bei 80; andere Versionen und v2-Sessionreferenzen sind 0.
  Teilbestand und Inhaltsdrift stoppen vor dem ersten Write, exakter Re-Run ist
  ein No-op. Vier Tabellen/RLS-Flags/SELECT-Policies, zwei RPCs und minimale
  ACLs bleiben unverändert. C2 erzeugt keine Session und aktiviert keine UI.
- Invalidiert durch: SQL 20/21, Grants, C2-Vertrag, Katalogdaten, R2-Tabellen/
  Constraints/RPCs, RLS/Policies/ACLs oder produktive v2-Referenzen.
- Cleanup: C2 selbst löscht produktiv nichts. Jede Bereinigung benötigt null
  v2-Referenzen und ein separates Owner-Gate.
- Runbook: [Supabase SQL Cutover](runbooks/supabase-sql-cutover.md)
