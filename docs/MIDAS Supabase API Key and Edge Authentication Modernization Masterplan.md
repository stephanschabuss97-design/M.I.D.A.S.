# MIDAS Supabase API Key and Edge Authentication Modernization Masterplan

## Dokumentstatus

- Status: `FUTURE_MASTERPLAN`
- Erstellt: 2026-08-23
- Zielsystem: produktives MIDAS-Supabase-Projekt `M.I.D.A.S.`
- Geplanter Beginn: nach dem Activity-V2-Core-Cutover
- Zeitliche Leitplanke: kontrollierte Umstellung noch 2026
- Produktive Wirkung dieses Dokuments: keine
- Owner: Stephan

Dieses Dokument beschreibt das spätere Modernisierungsprogramm für die
Supabase-API-Schlüssel und die Authentifizierung der MIDAS-Edge-Functions. Es
ist keine ausführbare Roadmap, keine SQL-Freigabe und kein Deployauftrag.

Vor der Umsetzung wird aus dem dann realen Postimage eine konkrete Roadmap nach
`docs/templates/` erstellt. Die dortige Discovery entscheidet, ob eine einzige
Roadmap mit getrennten Cutover-Wellen genügt oder ob zwei eng gekoppelte
Roadmaps für Public Clients und privilegierte Backends sicherer sind.

## Warum dieses Thema existiert

Supabase ersetzt die alten, JWT-basierten API-Schlüssel schrittweise durch ein
neues Schlüsselmodell:

| Legacy | Modern | Typischer Einsatz |
| --- | --- | --- |
| `anon` | `sb_publishable_...` | Browser, PWA, Android, öffentliche Clients |
| `service_role` | `sb_secret_...` | Edge Functions, Server, Worker, Scheduler |

Legacy- und moderne Schlüssel können während einer Migration parallel
existieren. Neue Schlüssel deaktivieren bestehende Legacy-Schlüssel nicht.
Supabase bezeichnet `anon` und `service_role` jedoch ab Ende 2026 als
deprecated und empfiehlt die Migration auf Publishable und Secret Keys.

Die neuen Schlüssel sind nicht mehr selbst JWTs. Das ist der entscheidende
Vertragswechsel:

- Publishable und Secret Keys identifizieren die aufrufende
  Anwendungskomponente.
- Ein Supabase-Auth-Access-Token identifiziert den angemeldeten Benutzer.
- Ein moderner Secret Key wird über `apikey` übertragen und darf nicht als
  Benutzer-JWT ausgegeben werden.
- Ein Secret-Key-Client arbeitet mit der Postgres-Rolle `service_role` und
  umgeht RLS. Das ist beabsichtigt, aber ausschließlich in kontrollierten
  Backendkomponenten zulässig.

MIDAS verwendet derzeit noch das Legacy-Modell. Das funktioniert weiterhin,
vermischt aber an einigen Stellen Anwendungsschlüssel, Benutzeridentität und
privilegierten Datenbankzugriff. R13 macht diesen Altvertrag sichtbar, weil
erstmals ein streng ownergebundener Activity-Snapshot sowohl von angemeldeten
Benutzern als auch von maschinellen Schedulern benötigt wird.

## Begriffe und harte Trennlinien

### API-Schlüssel

Ein API-Schlüssel beantwortet: Welche Anwendungskomponente greift auf das
Supabase-Projekt zu?

- Publishable Key: öffentlich einbettbar, geringe Rechte, durch RLS geschützt.
- Secret Key: nur Backend, erhöhte Rechte, `BYPASSRLS`.
- Legacy-`anon`: JWT-basierter Vorgänger des Publishable Keys.
- Legacy-`service_role`: JWT-basierter Vorgänger des Secret Keys.

### Benutzer-JWT

Der Benutzer-JWT beantwortet: Welcher angemeldete Benutzer greift zu?

Er entsteht erst durch Supabase Auth. In MIDAS ist dies Stephans persönliche
Session. Nur dieser Token darf als Benutzeridentität in
`Authorization: Bearer ...` verwendet werden.

Ein GitHub-Scheduler besitzt keine Stephan-Session und darf weder einen
gespeicherten Refresh-Token verwenden noch einen Benutzer-JWT imitieren.

### Postgres-Rollen und Grants

Die Postgres-Rollen `anon`, `authenticated` und `service_role` bleiben auch
mit dem modernen Schlüsselmodell bestehen. Daher gilt:

- Die Migration eines API-Schlüssels ist keine pauschale SQL-Migration.
- Bestehende Grants an die Datenbankrolle `service_role` sind nicht allein
  wegen des neuen Secret-Key-Formats veraltet.
- RLS, Explicit Grants und API-Key-Authentifizierung bleiben getrennte
  Sicherheitsschichten.
- `sql/16_Explicit_Grants.sql` darf nicht mechanisch umgeschrieben werden, nur
  weil der aufrufende Schlüssel später `sb_secret_...` statt eines
  `service_role`-JWT ist.

### Edge-Function-Authentifizierung

`verify_jwt=true` kann JWTs prüfen, aber keinen modernen Publishable oder
Secret Key als JWT interpretieren. Bei modernem Secret-Key-Zugriff gilt daher:

- Secret Key ausschließlich im `apikey`-Header.
- Kein Secret Key in `Authorization: Bearer`.
- `verify_jwt=false` nur, wenn die Function im eigenen Code verlässlich
  authentifiziert.
- Fehlende oder fehlerhafte In-Function-Prüfung ist ein Stop-Gate, weil die
  Function sonst offen erreichbar sein könnte.

## Verifizierter MIDAS-Iststand am 2026-08-23

### Produktives Supabase-Projekt

- Projekt: `M.I.D.A.S.`
- Projekt-Ref: `jlylmservssinsavlkdi`
- Region: `eu-central-1`
- PostgreSQL: 17
- Projektstatus: `ACTIVE_HEALTHY`

Die read-only Supabase-Inventur zeigte:

- Ein aktiver öffentlicher Schlüssel ist vorhanden: Legacy-`anon`.
- Ein moderner Publishable Key wurde über die verfügbare Management-API nicht
  gefunden.
- Secret-Key-Werte werden aus Sicherheitsgründen nicht inventarisiert oder
  dokumentiert. Ob bereits moderne benannte Secret Keys existieren, bleibt ein
  späteres Owner-/Dashboard-Gate.
- Alle acht produktiven Edge Functions laufen mit `verify_jwt=true`.
- Alle produktiven Tabellen im Schema `public` haben RLS aktiviert.
- `activity_consumer_snapshot(date,date)` erlaubt Execute nur `postgres` und
  `authenticated`, ausdrücklich nicht `anon` oder `service_role`.
- Der Security Advisor zeigt bekannte Activity-V2-
  `SECURITY DEFINER`-Warnungen und den im Free Plan nicht behebbaren
  Leaked-Password-Hinweis. Diese Findings sind kein API-Key-Migrationsfehler.

### Produktive Edge Functions

| Function | Aktueller Caller-/Datenvertrag | Aktuelle Schlüsselnutzung | Zielklasse |
| --- | --- | --- | --- |
| `midas-assistant` | angemeldeter Benutzer | Plattform-JWT-Prüfung, OpenAI-Key intern | user-only |
| `midas-transcribe` | angemeldeter Benutzer | Plattform-JWT-Prüfung, OpenAI-Key intern | user-only |
| `midas-tts` | angemeldeter Benutzer | Plattform-JWT-Prüfung, OpenAI-Key intern | user-only |
| `midas-vision` | angemeldeter Benutzer | `SUPABASE_ANON_KEY` zur Benutzerauflösung | user-only |
| `midas-monthly-report` | angemeldeter Benutzer | Benutzer-JWT plus internes `SUPABASE_SERVICE_ROLE_KEY` | user plus internes Adminrecht |
| `midas-protein-targets` | Benutzer oder GitHub-Scheduler | Legacy-Service-Role-Bearer plus Owner-Env | dual user/secret |
| `midas-trendpilot` | Benutzer oder GitHub-Scheduler | Legacy-Service-Role-Bearer plus Owner-Env | dual user/secret |
| `midas-incident-push` | GitHub-Scheduler/manueller Workflow | Legacy-Service-Role-Bearer | secret-only |

Die Klassifizierung ist Zielinput für die spätere Discovery, noch kein
Entscheid über eine konkrete SDK- oder Wrapper-Implementierung.

### GitHub Actions

Aktuelle Repository-Secrets, nur als Namen inventarisiert:

- `INCIDENTS_PUSH_URL`
- `PROTEIN_TARGETS_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TRENDPILOT_URL`

Alle drei Scheduler teilen derzeit denselben Legacy-`service_role`-Schlüssel.

- `incidents-push.yml` verwendet bereits `curl --fail-with-body`.
- `protein-targets.yml` und `trendpilot.yml` verwenden nur `curl -sS`; ein
  HTTP-Fehler kann dadurch als erfolgreicher Workflow-Schritt erscheinen.
- Alle drei senden den Schlüssel als `Authorization: Bearer ...`.
- Das Bearer-Muster ist mit einem modernen Secret Key nicht kompatibel.

### Browser/PWA

Die Browserkonfiguration verwendet aktuell:

- UI-Begriff `ANON-Key`
- IndexedDB-/Config-Feld `webhookKey`
- gespeicherte Form `Bearer <legacy-anon>`
- Entfernung des Bearer-Präfixes unmittelbar vor `createClient(...)`
- JWT-Decoding, um einen Legacy-`service_role`-Key im Browser zu blockieren

Der aktuelle Schutz erkennt keinen modernen `sb_secret_...`-Key, weil dieser
kein JWT ist. Ein Secret Key könnte daher im Konfigurationsdialog irrtümlich
angenommen werden, bevor Supabase ihn im Browser mit 401 ablehnt. Die spätere
Migration muss Secret Keys bereits lokal fail-closed zurückweisen.

### Android-Hülle und Widget

Android speichert denselben öffentlichen Schlüssel derzeit unter dem Namen
`anonKey` in verschlüsselten Preferences und reicht ihn an WebView, OAuth und
Widget weiter.

Der Widget-HTTP-Vertrag ist konzeptionell bereits richtig getrennt:

- `apikey`: öffentlicher Anwendungsschlüssel
- `Authorization: Bearer <accessToken>`: Benutzer-JWT

Der Validator blockiert einen JWT-basierten `service_role`-Key, erkennt aber
noch keinen modernen `sb_secret_...`-Key. UI-Texte, Datenklassen,
Konfigurationsmigration und APK-Smokes müssen daher gemeinsam betrachtet
werden. Eine bloße Umbenennung ohne Migration der gespeicherten Konfiguration
könnte Widget und nativen OAuth-Pfad verlieren lassen.

### SQL und Data API

`sql/16_Explicit_Grants.sql` ist weiterhin der zentrale Grantvertrag.

Der produktive read-only Check zeigte für `public`:

- keine Tabelle ohne RLS
- keine Tabellen-Grants für `anon`
- erwartete Grants für `authenticated`
- erwartete erhöhte Grants für die Postgres-Rolle `service_role`

Diese Grants werden vom modernen Secret-Key-Modell weiterhin benötigt. Nicht
der Rollenname ist veraltet, sondern nur der alte API-Schlüssel, der diese
Rolle bisher als langlebiger JWT repräsentiert.

## Problemstatement

MIDAS besitzt aktuell vier miteinander gekoppelte Altverträge:

1. Öffentliche Clients sprechen noch von `anon` und speichern einen
   JWT-basierten Anwendungsschlüssel teilweise mit Bearer-Präfix.
2. Scheduler verwenden einen privilegierten Anwendungsschlüssel zugleich als
   Bearer-JWT und implizite Maschinenidentität.
3. Edge Functions verwenden `SUPABASE_SERVICE_ROLE_KEY` sowohl zur
   Caller-Erkennung als auch für privilegierte Datenbankclients.
4. Drei fachlich unabhängige Scheduler teilen denselben privilegierten
   GitHub-Secretwert.

Das funktioniert im Legacy-Modell, erschwert aber Rotation, Least Privilege,
klare Fehlerdiagnose und die Migration auf moderne Supabase-Schlüssel.

Eine unkontrollierte Komplettumstellung könnte gleichzeitig Login, PWA,
Android-Widget, Arztbericht, Protein Target, Trendpilot und Incident Push
brechen. Deshalb wird nicht global ersetzt, sondern komponentenweise
migriert.

## Zielbild

### Öffentliche Clients

- PWA und Android verwenden einen aktiven Publishable Key.
- Der Schlüssel wird roh und ohne `Bearer` gespeichert.
- Benutzeridentität stammt ausschließlich aus dem Supabase-Auth-JWT.
- Browser und Android blockieren sowohl Legacy-`service_role` als auch
  moderne `sb_secret_...`-Schlüssel vor jeder Clientinitialisierung.
- RLS bleibt die eigentliche Datenautorisierung.

### User-only Edge Functions

- Jeder Aufruf benötigt einen gültigen Benutzer-JWT.
- Ein User-Client arbeitet unter der RLS-Identität des Benutzers.
- Ein eventuell notwendiger Admin-Client ist getrennt und niemals Ersatz für
  die Benutzerautorisierung.
- Ungültige Authentifizierung ergibt 401/403 mit generischer Fehlermeldung.
- Keine Token- oder Schlüsselfragmente gelangen in Logs oder Responses.

### Secret-only Edge Functions

- Jeder Scheduler besitzt einen benannten Secret Key.
- Der Key wird ausschließlich über `apikey` übertragen.
- Die Function prüft den erwarteten benannten Key beziehungsweise verwendet
  eine offiziell unterstützte Secret-Auth-Schicht.
- Der fachliche Owner ist serverseitig festgelegt und kann nicht aus einem
  untrusted Requestbody überschrieben werden.
- Schedulerfehler führen zu einem sichtbar fehlgeschlagenen Workflow.

### Duale Edge Functions

- Manuelle In-App-Aufrufe verwenden einen echten Benutzer-JWT.
- Scheduleraufrufe verwenden einen benannten Secret Key.
- Beide Pfade werden explizit unterschieden und getrennt getestet.
- Der Secret-Pfad imitiert keinen Benutzer-JWT.
- Privilegierter Zugriff ist ownergebunden, minimal und im Code sichtbar.

### Secret-Isolation

Bevorzugtes Ziel sind getrennte benannte Secret Keys mindestens für:

- Protein Target
- Trendpilot
- Incident Push

Damit kann ein einzelner Schlüssel rotiert werden, ohne alle automatischen
MIDAS-Sicherheitsnetze gleichzeitig zu unterbrechen.

Benannte Secret Keys erzeugen keine unterschiedlichen Postgres-Rechte. Sie
verwenden weiterhin die Rolle `service_role`. Die Trennung verbessert
Calleridentität und Rotation; Least Privilege entsteht zusätzlich durch den
Auth-Modus der Function, feste Ownerbindung und minimale RPC-/ACL-Verträge.

## Verbindlicher R13-Vertrag

R13 ist keine globale Schlüssel-Migrationsroadmap. R13 soll die von ihm neu
benötigten Schedulerpfade jedoch bereits nach dem modernen Zielvertrag bauen,
damit Protein Target und Trendpilot später nicht nochmals grundlegend
umgestellt werden müssen.

R13 soll daher:

1. Benutzeraufrufe weiterhin mit echtem Supabase-Auth-JWT autorisieren.
2. Für Protein Target und Trendpilot moderne, getrennte benannte Secret Keys
   vorsehen.
3. Schedulerkeys ausschließlich im `apikey`-Header akzeptieren.
4. Kein `Authorization: Bearer <secret-key>` erzeugen oder akzeptieren.
5. `verify_jwt=false` nur zusammen mit vollständig getesteter In-Function-
   Authentifizierung einsetzen.
6. Den Schedulerzugriff explizit an Stephans serverseitig konfigurierten Owner
   binden.
7. Eine gemeinsame Activity-Snapshot-Semantik verwenden und keine zweite
   V1/V2-Union in TypeScript erfinden.
8. GitHub-Secrets für Protein und Trendpilot trennen, statt den gemeinsamen
   `SUPABASE_SERVICE_ROLE_KEY` weiterzuverwenden.
9. `curl --fail-with-body` oder eine gleichwertige HTTP-Statusprüfung
   verwenden.
10. Die verwendete Auth-Bibliothek beziehungsweise den gemeinsamen
    Auth-Helper versioniert, testbar und später wiederverwendbar halten.
11. Incident Push, Browser/PWA, Android, Vision, Assistant, Transcribe und TTS
    nicht nebenbei migrieren.
12. Legacy-Schlüssel in R13 weder deaktivieren noch löschen.

R13 darf wiederverwendbare Auth-Grundlagen schaffen, aber keine abstrakte
Plattform erfinden. Jede gemeinsame Schicht muss reale Duplikation oder ein
konkretes Sicherheitsrisiko beseitigen.

## Nichtziele des späteren Modernisierungsprogramms

- Kein neues Benutzer- oder Rollenmodell.
- Keine Multi-User-Abstraktion.
- Keine Änderung der medizinischen Fachlogik.
- Keine pauschale Aufweichung von RLS.
- Keine automatischen Grants an `anon`.
- Keine Entfernung der Datenbankrolle `service_role`.
- Kein Speichern von Benutzer-Refresh-Tokens in GitHub.
- Keine künstliche Erzeugung eines Stephan-JWT für Scheduler.
- Keine Speicherung von Secret-Werten in Repo, Doku, Recovery-Bundle oder
  Logs.
- Keine gleichzeitige Migration von HESTIA; das ist ein eigenes Projekt.
- Keine erzwungene Modernisierung geparkter KI-Funktionen zusammen mit dem
  Activity-Cutover.

## Vorgeschlagene Folge-Wellen nach Activity V2

Die Wellen beschreiben Abhängigkeiten. Ob sie später eine oder mehrere
Roadmaps bilden, entscheidet der Readiness Review.

### Welle K0: Revalidierung und Freeze

- Aktuellen Supabase-Keybestand als Namen/Typen/Status inventarisieren.
- Keine Secret-Werte lesen, ausgeben oder persistieren.
- Deployed Functionversionen und `verify_jwt` erfassen.
- GitHub-Secretnamen und Workflowcaller erfassen.
- Alle Browser-, Android-, Edge-, Workflow- und Toolconsumer per `rg`
  inventarisieren.
- Aktuelle RLS-, ACL- und Function-Owner-Postimages read-only sichern.
- Baseline-Smokes für Login, Widget, Arztbericht, Protein, Trendpilot und Push
  festhalten.
- R13-Postimage als neue Grundlage übernehmen.

Exit: Kein Consumer und kein Secretname ist nur aus Erinnerung bekannt.

### Welle K1: Schlüssel parallel bereitstellen

Owner-Gate im Supabase Dashboard:

- Default Publishable Key anlegen, falls noch nicht vorhanden.
- Benannte Secret Keys nach finalem Komponentenvertrag anlegen.
- Legacy-Schlüssel aktiv lassen.
- Nur die notwendigen Werte in native Secret-Stores eintragen.
- Keine Schlüsselwerte in Chat, Terminalausgabe, Doku oder Git-Diff kopieren.

Empfohlene GitHub-Namen:

- `PROTEIN_TARGETS_SECRET_KEY`
- `TRENDPILOT_SECRET_KEY`
- `INCIDENTS_PUSH_SECRET_KEY`

Die konkreten Namen sind vor Umsetzung gegen bestehende R13-Verträge zu
prüfen. Eine Umbenennung darf nicht still zwischen Edge Env, GitHub und
Recovery-Doku auseinanderlaufen.

Exit: Neue und alte Schlüssel existieren parallel; noch kein Caller wurde
umgeschaltet.

### Welle K2: Gemeinsamen Edge-Auth-Vertrag härten

- Aktuelle Supabase-Empfehlung für `@supabase/server` gegen die reale
  Deno-/Edge-Runtime prüfen.
- Falls verwendet: Version pinnen und Lock-/Importvertrag dokumentieren.
- Alternativ einen kleinen `_shared`-Auth-Helper mit denselben
  Sicherheitsgarantien bauen.
- Auth-Modi `user`, `secret:<name>` und gegebenenfalls duale Modi explizit
  testen.
- User-Client und Admin-Client getrennt halten.
- Token-/Keyvergleich konstantzeitnah beziehungsweise über die offizielle
  Auth-Schicht lösen.
- Fehlerantworten und Logs redigieren.
- `verify_jwt=false` erst zusammen mit dem gehärteten Handler deployen.

Exit: Die Auth-Schicht ist lokal gegen Missing, Invalid, Wrong-Key,
Wrong-Mode, User-JWT, Secret-Key und Body-Owner-Manipulation getestet.
Wiederholte legitime Schedulerrequests sind fachlich idempotent oder besitzen
den bereits vorgesehenen Deduplizierungsvertrag; API Keys selbst liefern
keinen Replay-Schutz.

### Welle K3: User-only Edge Functions kompatibel migrieren

Kandidaten:

- `midas-assistant`
- `midas-transcribe`
- `midas-tts`
- `midas-vision`
- `midas-monthly-report`

Pro Function:

- Callerklasse bestätigen.
- Benutzer-JWT strikt prüfen.
- `SUPABASE_ANON_KEY` auf Publishable-Key-Vertrag umstellen, wo erforderlich.
- Internes `SUPABASE_SERVICE_ROLE_KEY` nur dort durch einen Secret Key
  ersetzen, wo Adminzugriff fachlich nötig und autorisiert ist.
- RLS-User-Client bevorzugen, wenn Adminrechte nicht erforderlich sind.
- Function einzeln deployen, smoke-testen und beobachtbar rückrollen.
- Während der Übergangsphase sowohl den bestehenden Legacy-Public-Client als
  auch den späteren Publishable Client mit echten Benutzer-JWTs unterstützen.

Die KI-Functions dürfen ausgelassen werden, wenn ihr geplanter Rückbau vor der
Migration fachlich beschlossen ist. Ein geparkter Zustand ist jedoch kein
Grund, einen aktiven unsicheren Schlüssel unbegrenzt weiterzuführen.

Exit: Jede aktive User-Function besitzt einen klaren User-/Adminvertrag und
ist für den anschließenden Publishable-Client-Cutover vorbereitet.

### Welle K4: Browser/PWA auf Publishable Key migrieren

- UI-Begriff von `ANON-Key` auf `Publishable Key` ändern.
- Konfiguration akzeptiert während des Übergangs Legacy-`anon` und modernen
  Publishable Key.
- Moderne Secret Keys und Legacy-`service_role` werden fail-closed blockiert.
- Neues Speicherschema ohne Bearer-Präfix definieren.
- Bestehendes `webhookKey` kontrolliert migrieren, nicht still löschen.
- Login, Sessionrefresh, Realtime, REST, Edge-Aufrufe und Logout testen.
- Service-Worker-/Cacheversion nur bei real invalidierter Assetgrenze ändern.
- Rollback auf Legacy-`anon` dokumentieren.

Exit: Browser und installierte PWA funktionieren mit Publishable Key; der
Legacy-`anon` bleibt vorerst aktiv.

### Welle K5: Android und Widget auf Publishable Key migrieren

- `anonKey`-Benennung fachlich auf `publishableKey` überführen oder einen
  klaren kompatiblen Aliasvertrag definieren.
- Verschlüsselte Preference-Daten migrationssicher lesen und neu schreiben.
- WebView-Bootstrap und Native-OAuth-Konfiguration synchron halten.
- Widget behält `apikey` plus separaten Benutzer-JWT.
- Legacy-Service-Role-JWT und moderne Secret Keys lokal blockieren.
- Unit-, Gradle-, APK- und Device-Smokes durchführen.
- Kein Verlust bestehender Session oder Widgetkonfiguration ohne klare
  Re-Login-Anweisung.

Exit: PWA, Android-Hülle, OAuth und Widget arbeiten mit demselben Publishable-
Key-Vertrag.

### Welle K6: Verbleibende Scheduler migrieren

Nach R13 verbleibt voraussichtlich mindestens Incident Push.

- Eigenen benannten Incident-Secret-Key verwenden.
- GitHub sendet nur `apikey`.
- Function validiert ausschließlich den vorgesehenen Secretmodus.
- Owner- und Inputguards bleiben unverändert streng.
- `curl --fail-with-body` beibehalten.
- Diagnose- und Incidentmodus getrennt prüfen.
- Workflow-Jitter oder GitHub-Scheduler-Zuverlässigkeit nicht mit der
  Authmigration vermischen.

Exit: Kein produktiver GitHub-Workflow verwendet den gemeinsamen Legacy-
`SUPABASE_SERVICE_ROLE_KEY`.

### Welle K7: SQL-, RLS- und Grant-Nachweis

- `sql/16_Explicit_Grants.sql` gegen das finale Objektinventar prüfen.
- Keine automatischen Änderungen nur aufgrund neuer Keynamen.
- RLS auf allen exponierten Tabellen bestätigen.
- Ownerprädikate für `authenticated` bestätigen.
- Privilegierte Functions, insbesondere `SECURITY DEFINER`, separat
  begründen und ACLs minimieren.
- Absichtlich `service_role`-freie RPCs wie SQL24/SQL25 nicht still öffnen.
- Neue ownergebundene Scheduler-RPCs nur mit explizitem Contract und
  disposable PostgreSQL-Fixture zulassen.
- Security Advisor nach jedem DDL-Cutover prüfen.

Exit: Der moderne Keyvertrag und der bestehende Datenbankrollenvertrag sind
nachweislich kompatibel.

### Welle K8: Recovery, Dokumentation und Legacy-Abschaltung

- `docs/DEV_ENVIRONMENT.md` aktualisieren.
- Betroffene Module Overviews aktualisieren.
- GitHub-Secretinventar im Recovery-Runbook aktualisieren.
- Edge-Deploy- und Minimal-Recovery-Runbooks aktualisieren.
- Recovery-Bundle enthält weiterhin keine Schlüsselwerte.
- Baseline-Smokes vollständig wiederholen.
- Legacy-`service_role` zunächst deaktivieren, nicht sofort löschen.
- Mindestens die vereinbarten Schedulerzyklen und manuellen Smokes beobachten.
- Danach Legacy-`anon` deaktivieren und PWA/Android erneut prüfen.
- Löschen erst nach eigener Owner-Freigabe und stabiler Beobachtungsphase.

Exit: Kein aktiver MIDAS-Consumer benötigt Legacy-`anon` oder
Legacy-`service_role`; Recovery kann die modernen Schlüsselverträge ohne
Secretweitergabe rekonstruieren.

## Sicherheits- und Bruchrisiken

### P0: Offene Function durch falsches `verify_jwt`

`verify_jwt=false` ohne funktionierende In-Function-Authentifizierung könnte
einen privilegierten Endpoint öffentlich machen.

Guard:

- Deployblocker bei fehlendem Missing-/Invalid-Key-Test.
- Kein produktiver Deploy ohne read-only Remote-Preflight und Owner-Gate.
- Functionauth vor jeder Bodyverarbeitung.

### P0: Secret im öffentlichen Client

Ein moderner Secret Key darf nie in Browser, PWA, Android-APK oder WebView
gelangen.

Guard:

- Prefix- und Typprüfung vor Speicherung.
- Secret-Scan von Git-Diff, Buildartefakten und Logs.
- Keine Secretwerte in Screenshots oder Evidence.

### P0: Falscher Owner im Scheduler

Ein Secret-Key-Client umgeht RLS. Ein manipulierbarer `user_id`-Body könnte
dadurch fremde Daten lesen oder schreiben.

Guard:

- Owner ausschließlich aus serverseitiger Env oder einem gehärteten
  ownergebundenen RPC.
- Request-`user_id` ignorieren oder strikt gegen den Owner prüfen.
- Single-User-Produktvertrag ausdrücklich beibehalten.

### P1: Teilcutover zwischen Workflow und Edge Function

Ein neuer `apikey`-Workflow gegen eine alte JWT-Function oder ein alter
Bearer-Workflow gegen eine neue Secret-Function führt zu 401.

Guard:

- Parallelvertrag oder genau dokumentierte Deployreihenfolge.
- Manueller Workflow-Smoke vor Schedulerfreigabe.
- Unabhängiger Rollback je Function und Workflow.

### P1: PWA-/Service-Worker-Keydrift

Eine installierte PWA kann alten JavaScriptcode mit neuer gespeicherter
Konfiguration kombinieren.

Guard:

- Cache- und Konfigurationsschema versionieren.
- Upgrade- und Cold-Start-Smoke.
- Keine irreversible Configlöschung beim ersten Fehler.

### P1: Android-Konfigurationsverlust

Eine Feldumbenennung kann OAuth, Widget oder WebView trennen.

Guard:

- Dual-Read/Single-Write-Migration der Preferences.
- Reale APK- und Widget-Smokes.
- Rollback kennt das alte Speicherschema.

### P1: Verdeckte Schedulerfehler

`curl -sS` schlägt bei HTTP 401/500 nicht zwingend als GitHub-Step fehl.

Guard:

- `--fail-with-body` oder explizite Statuscodeprüfung.
- Keine Schlüssel oder Rohantworten im Log.

### P1: Verwechslung von API-Key- und SQL-Rollenmigration

Ein pauschales Entfernen von `service_role`-Grants würde legitime Secret-Key-
Backends brechen.

Guard:

- Grants ausschließlich anhand des fachlichen Datenzugriffs prüfen.
- API-Key-Namen nie als mechanischen SQL-Migrationsgrund verwenden.

## Test- und Evidence-Vertrag

Die spätere ausführbare Roadmap soll mindestens vorsehen:

### Statische Prüfungen

- vollständiges Key-/Header-/Env-Inventar per `rg`
- Secret-Scan im Git-Diff
- Deno Check, Lint und Tests
- JavaScript-Syntax- und Contracttests
- Android-Unit- und Gradlechecks
- YAML-/Workflowprüfung

### Lokale Integration

- disposable Supabase-/PostgreSQL-17-Tests für neue RPCs oder ACLs
- User-JWT-, Publishable- und Secret-Key-Negativmatrix
- falscher benannter Key
- fehlender Key
- Secret im Authorization-Header
- User-JWT im `apikey`-Header
- Owner-Manipulation
- RLS- und BOLA-Nachweis

### Browser und PWA

- frischer Browser
- bestehende installierte PWA
- bestehende Legacy-Konfiguration
- neue Publishable-Konfiguration
- Login, Tokenrefresh, Realtime und Logout
- Offline-/Cache-Update ohne Schlüsselverlust

### Android

- Preference-Migration
- Native OAuth
- WebView-Bootstrap
- Widget-Sync
- Appneustart und Sessionrefresh
- reale Device-/ADB-Prüfung, sofern verfügbar

### Remote und produktiv

- Schlüsseltypen und Status read-only inventarisieren
- Functionversion und `verify_jwt` vor/nach Deploy sichern
- GitHub-Secretnamen ohne Werte prüfen
- manueller Workflow-Smoke
- Edge-Logs auf 401/403/500 prüfen
- Security Advisor
- kein Tabellen- oder Ownerdrift

### Reviewbudget

- Native Reviews in S4 nur delta- und risikobezogen.
- In S5 genau ein CodeRabbit-Initiallauf und maximal ein geplanter
  Verifikationslauf nach berechtigten Korrekturen.
- Keine Wiederholung unveränderter Baselines ohne Invalidation.

## Owner-Gates

Folgende Aktionen bleiben zwingend manuell beziehungsweise ausdrücklich
freizugeben:

- neue Publishable oder Secret Keys erzeugen
- Secretwerte in Supabase oder GitHub eintragen
- `verify_jwt` einer produktiven Function ändern
- Edge Function deployen
- GitHub Workflow produktiv/manuell ausführen
- produktives SQL oder ACL-Änderungen ausführen
- PWA-Cacheversion produktiv umstellen
- Android-APK bauen/installieren, sofern Devicewirkung entsteht
- Legacy-Schlüssel deaktivieren
- Legacy-Schlüssel endgültig löschen

## Rollback-Grundsätze

- Legacy- und moderne Schlüssel bleiben während der Migration parallel aktiv.
- Jeder Consumer wird einzeln umgestellt und einzeln rückrollbar gehalten.
- Schlüssel werden nicht als erste Maßnahme gelöscht.
- Workflow und Edge Function besitzen eine dokumentierte kompatible
  Übergangsreihenfolge.
- Ein Authfehler darf keine medizinischen Werte, Reports, Trendpilot-Events
  oder Pushzustände teilweise schreiben.
- Bei Snapshot- oder Authfehler bleibt der letzte gültige Zustand erhalten.
- Rollback bedeutet Rückkehr zum vorher bewiesenen Caller-/Functionvertrag,
  nicht Aufweichung von RLS oder Authprüfungen.

## Offene Entscheidungen für die spätere Roadmap

1. Wird `@supabase/server` für alle aktiven Edge Functions eingeführt oder nur
   für neue beziehungsweise duale Authpfade?
2. Wird Incident Push in derselben Cutover-Roadmap oder in einer eigenen
   kleinen Welle migriert?
3. Werden geparkte KI-Functions modernisiert oder vorher kontrolliert
   stillgelegt?
4. Wie lange bleiben deaktivierte Legacy-Schlüssel vor endgültigem Löschen
   bestehen?
5. Reicht eine Roadmap mit owner-gateten Wellen oder erzwingt die Kombination
   aus PWA und Android zwei getrennte Roadmaps?

Diese Entscheidungen werden nicht aus dem heutigen Zustand erfunden. Sie
werden nach Activity V2 aus dem realen Postimage und der dann aktuellen
Supabase-Dokumentation getroffen.

## Abschlusskriterien des Gesamtprogramms

Das Modernisierungsprogramm ist erst abgeschlossen, wenn:

- alle aktiven öffentlichen MIDAS-Clients Publishable Keys verwenden
- alle aktiven privilegierten Backendkomponenten benannte Secret Keys verwenden
- kein Workflow einen API-Key als Bearer-JWT ausgibt
- Benutzeridentität ausschließlich aus echten Supabase-Auth-JWTs stammt
- kein Secret Key in Browser, Android, Repo, Doku, Logs oder Recovery liegt
- alle Edge Functions eine dokumentierte Callerklasse besitzen
- `verify_jwt` und In-Function-Auth nachweislich zusammenpassen
- Protein, Trendpilot und Incident Push unabhängig rotierbar sind
- RLS, Grants und Function-ACLs weiterhin dem Single-User-Vertrag entsprechen
- PWA, Android, Widget, Arztbericht, Push und Scheduler grün getestet sind
- Recovery die Konfiguration über Namen und Schritte rekonstruieren kann
- Legacy-`anon` und Legacy-`service_role` ohne Produktbruch deaktiviert sind

## Offizielle Referenzen

- [Supabase: Understanding API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Supabase: Migrating to publishable and secret API keys](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys)
- [Supabase: Securing Edge Functions](https://supabase.com/docs/guides/functions/auth)
- [Supabase: Authorization headers](https://supabase.com/docs/guides/functions/auth-headers)

Diese Referenzen sind vor der späteren Umsetzung erneut zu prüfen, da sich
Supabase-Schlüssel- und Edge-Auth-Verträge weiterentwickeln können.

## MIDAS-Quellen für die spätere Discovery

- `README.md`
- `AGENTS.md`
- `docs/DEV_ENVIRONMENT.md`
- `docs/templates/README.md`
- `docs/templates/MIDAS Roadmap Workflow Contract.md`
- `docs/modules/Supabase Core Overview.md`
- `docs/modules/Auth Module Overview.md`
- `docs/modules/Android Native Auth Module Overview.md`
- `docs/modules/Android Widget Module Overview.md`
- `docs/modules/Protein Module Overview.md`
- `docs/modules/Trendpilot Module Overview.md`
- `docs/modules/Push Module Overview.md`
- `docs/modules/Reports Module Overview.md`
- `docs/qa/backend-supabase.md`
- `docs/qa/push-trendpilot.md`
- `docs/qa/runbooks/edge-function-deploy-smoke.md`
- `docs/qa/runbooks/midas-minimal-recovery.md`
- `.github/workflows/*.yml`
- `backend/supabase/config.toml`
- `backend/supabase/functions/`
- `app/supabase/`
- `app/core/android-webview-auth-bridge.js`
- `android/app/src/main/`
- `sql/16_Explicit_Grants.sql`
- `sql/HOW_TO.md`

Archivierte Roadmaps werden nur über konkrete Evidence-IDs oder bei einem
nachgewiesenen Quellenwiderspruch erneut gelesen.
