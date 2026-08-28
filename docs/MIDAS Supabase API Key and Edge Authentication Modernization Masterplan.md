# MIDAS Supabase API Key and Edge Authentication Modernization Masterplan

## Dokumentstatus

- Status: `FUTURE_MASTERPLAN`
- Erstellt: 2026-08-23
- Aktualisiert: 2026-08-28; finales R13- und lokales C3-Postimage integriert
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

### Finale R13-Baseline

R13 ist abgeschlossen, ohne die globale Signing-/Keymigration zu beginnen.
Monthly v61 bleibt `verify_jwt=true`; Protein v31 und Trendpilot v32 laufen
mit `verify_jwt=false` plus bewiesener In-Function-Auth über Supabase Auth und
je einem eigenen Scheduler-Secret. Incident v27 bleibt `verify_jwt=true` und
verwendet den isolierten Caller-Alias. Legacy-Signing und Legacy-Keys bleiben
aktiv; moderne Default-Keys bleiben dormant. Dieses Postimage ist die
Ausgangsbasis einer späteren separaten Modernisierungsroadmap, keine implizite
Freigabe dafür.

### C3-/R14-Grenze

C3 ist lokal `DONE` und hat ausschließlich Web-/PWA-Produktoberflächen
verändert. Der Cachevertrag steht auf v13; Authentifizierung, Supabase-Keys,
SQL, Edge Functions, Scheduler und Workflows blieben unverändert. Activity V1
bleibt der einzige produktive Writer und R14 ist weiterhin das alleinige
Activity-V2-Capture-/Android-Cutover-Gate. Das Modernisierungsprogramm beginnt
unverändert erst nach dem Activity-V2-Core-Cutover.

- [C3 Roadmap (DONE)](<archive/MIDAS Activity V2 C3 Training Product Surface and Protein Context Relocation Roadmap (DONE).md>)

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

Die aktiven MIDAS-Consumer verwenden weiterhin überwiegend das Legacy-Modell.
R13 hat zusätzlich moderne Schlüssel dormant bereitgestellt, ohne die aktiven
Legacy-Caller oder die Benutzer-JWT-Signierung global umzustellen. Der
R13-Cutover machte dadurch zwei bisher leicht verwechselbare Ebenen sichtbar:
Anwendungsschlüssel und Benutzer-JWT-Signierung sind unabhängige Verträge.

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

### JWT-Signing-Topologie

Supabase Auth kann Benutzer-JWTs über zwei voneinander getrennte Systeme
signieren:

- Legacy-JWT-Secret, typischerweise ohne asymmetrischen öffentlichen JWKS-Key
- modernes Signing-Key-System mit eigenständig rotierbaren Signing Keys

Diese Signing-Topologie ist unabhängig vom API-Key-Bestand. Das Anlegen eines
`sb_publishable_...`- oder `sb_secret_...`-Schlüssels erzeugt oder aktiviert
keinen asymmetrischen JWT-Signing-Key. Ein leerer öffentlicher JWKS kann daher
bei weiterhin aktivem Legacy-Signing ein gültiges Projektpostimage sein und
ist nicht automatisch ein Plattformausfall.

Für MIDAS folgt daraus:

- API-Key-Migration und JWT-Signing-Key-Migration sind getrennte Wellen.
- Ein Uservalidator darf `alg`, `kid` und einen öffentlichen JWKS erst
  voraussetzen, wenn die reale Signing-Topologie dies belegt.
- Unter Legacy-Signing ist die serverseitige Validierung über Supabase Auth,
  beispielsweise `auth.getUser(jwt)`, der bevorzugte Kompatibilitätskandidat.
- Der Validierungsmodus wird vor einem Cutover explizit eingefroren. Es gibt
  keinen stillen Laufzeit-Fallback zwischen unterschiedlichen Trust-Modellen.

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

## Letztes belegtes MIDAS-Postimage am 2026-08-24

### Produktives Supabase-Projekt

- Projekt: `M.I.D.A.S.`
- Projekt-Ref: `jlylmservssinsavlkdi`
- Region: `eu-central-1`
- PostgreSQL: 17
- Projektstatus: `ACTIVE_HEALTHY`

Die R13-Evidence belegt am sicheren F45-Freeze:

- Legacy-`anon` und Legacy-`service_role` bleiben aktiv und werden von den
  noch nicht umgestellten Produktcallern weiter benötigt.
- Ein Default-Publishable-Key und ein Default-Secret-Key existieren dormant
  und unreferenziert.
- Die benannten Secret Keys `protein_targets_scheduler` und
  `trendpilot_scheduler` existieren dormant. Ihre Werte wurden weder
  dokumentiert noch in Evidence ausgegeben.
- Die Benutzer-JWTs werden weiterhin über das Legacy-JWT-Secret signiert; der
  öffentliche Projekt-JWKS enthielt null Keys.
- SQL26 und Monthly Report sind aktiv und geprüft. Protein Target wurde nach
  dem F45-Authfehler auf den bewiesenen Legacy-Vertrag mit `verify_jwt=true`
  zurückgerollt; Trendpilot, Workflows und Web/PWA-Cutover blieben unberührt.
- Es blieb am Freeze kein unbeabsichtigter produktiver
  `verify_jwt=false`-Zustand zurück.
- Alle produktiven Tabellen im Schema `public` haben RLS aktiviert.
- `activity_consumer_snapshot(date,date)` erlaubt Execute nur `postgres` und
  `authenticated`, ausdrücklich nicht `anon` oder `service_role`.
- Der Security Advisor zeigt bekannte Activity-V2-
  `SECURITY DEFINER`-Warnungen und den im Free Plan nicht behebbaren
  Leaked-Password-Hinweis. Diese Findings sind kein API-Key-Migrationsfehler.

### Edge-Function-Callerklassen und Vor-R13-Planungsbaseline

| Function | Fachliche Callerklasse | Vor R13 belegter Schlüsselvertrag | Zielklasse |
| --- | --- | --- | --- |
| `midas-assistant` | angemeldeter Benutzer | Plattform-JWT-Prüfung, OpenAI-Key intern | user-only |
| `midas-transcribe` | angemeldeter Benutzer | Plattform-JWT-Prüfung, OpenAI-Key intern | user-only |
| `midas-tts` | angemeldeter Benutzer | Plattform-JWT-Prüfung, OpenAI-Key intern | user-only |
| `midas-vision` | angemeldeter Benutzer | `SUPABASE_ANON_KEY` zur Benutzerauflösung | user-only |
| `midas-monthly-report` | angemeldeter Benutzer | Benutzer-JWT plus internes `SUPABASE_SERVICE_ROLE_KEY` | user plus internes Adminrecht |
| `midas-protein-targets` | Benutzer oder GitHub-Scheduler | Legacy-Service-Role-Bearer plus Owner-Env | dual user/secret |
| `midas-trendpilot` | Benutzer oder GitHub-Scheduler | Legacy-Service-Role-Bearer plus Owner-Env | dual user/secret |
| `midas-incident-push` | GitHub-Scheduler/manueller Workflow | Legacy-Service-Role-Bearer | secret-only |

Die Tabelle beschreibt die fachlichen Callerklassen. Versionen, Sourcehashes,
Authflags und aktive Schlüssel werden in K0 erneut aus dem dann realen
Postimage erhoben und niemals nur aus dieser Momentaufnahme übernommen.

### GitHub Actions

Aktive beziehungsweise dormant vorbereitete Repository-Secrets, nur als Namen
inventarisiert:

- `INCIDENTS_PUSH_URL`
- `PROTEIN_TARGETS_SECRET_KEY`
- `PROTEIN_TARGETS_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TRENDPILOT_SECRET_KEY`
- `TRENDPILOT_URL`

Beim R13-Freeze waren die beiden neuen Scheduler-Secrets angelegt, die
zugehörigen Workflowänderungen aber noch nicht produktiv aktiviert oder
ausgeführt. Die aktiven Scheduler bleiben deshalb bis zum kontrollierten
Cutover auf ihrem jeweils bewiesenen Legacy-Vertrag.

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

MIDAS besitzt aktuell fünf miteinander gekoppelte Altverträge:

1. Öffentliche Clients sprechen noch von `anon` und speichern einen
   JWT-basierten Anwendungsschlüssel teilweise mit Bearer-Präfix.
2. Noch nicht migrierte Scheduler verwenden einen privilegierten
   Anwendungsschlüssel zugleich als
   Bearer-JWT und implizite Maschinenidentität.
3. Edge Functions verwenden `SUPABASE_SERVICE_ROLE_KEY` sowohl zur
   Caller-Erkennung als auch für privilegierte Datenbankclients.
4. Drei fachlich unabhängige Scheduler teilen denselben privilegierten
   GitHub-Secretwert.
5. Ein neuer API-Key-Bestand sagt nichts darüber aus, wie Supabase Auth die
   Benutzer-JWTs signiert oder wie ein Edge-Validator sie verifizieren muss.

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

## R13-Vorarbeit und bedingte Evidenzquelle

R13 ist keine globale Schlüssel-Migrationsroadmap. Sein Zielvertrag sieht vor,
die von ihm neu benötigten Schedulerpfade bereits nach dem modernen
Zielvertrag zu bauen, damit Protein Target und Trendpilot später nicht nochmals
grundlegend umgestellt werden müssen.

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

### R13 nur bei nachgewiesener Relevanz lesen

Die spätere Modernisierungsroadmap übernimmt nicht pauschal die vollständige
R13-Roadmap als Pflichtlektüre. R13 wird nur herangezogen, wenn die aktuelle
Welle mindestens eine dieser Grenzen berührt:

- `_shared/activity-edge-principal.ts` oder dessen Uservalidator
- SQL26 beziehungsweise den gemeinsamen Activity-Consumer-Snapshot
- Monthly Report, Protein Target oder Trendpilot
- `protein_targets_scheduler` oder `trendpilot_scheduler`
- `PROTEIN_TARGETS_SECRET_KEY` oder `TRENDPILOT_SECRET_KEY`
- den durch R13 vorbereiteten Workflow-, Web- oder PWA-Cutover

Dann genügen zunächst die konkreten R13-Nachweise
`EV-ACT-R13-PRE09`, `EV-ACT-R13-PRE12`, `F-ACT-R13-45` und das finale
R13-Postimage. Die vollständige R13-Roadmap wird nur bei einem
Quellenwiderspruch, fehlender Evidence oder einem tatsächlich betroffenen
Rollbackvertrag geöffnet. Für nicht betroffene Functions oder Clients ist R13
keine zusätzliche Kontextpflicht.

Solange R13 noch pausiert oder unarchiviert ist, beschreibt es keine
allgemeingültige neue Authplattform. Die spätere Discovery verwendet sein
finales Postimage nur, wenn R13 bis dahin abgeschlossen und die betreffende
Quelle unverändert ist.

## Lessons Learned aus R13/F45

F45 war kein Fehler beim Erzeugen moderner API Keys und kein allgemeiner
Supabase-Ausfall. Die Ursache war eine unbewiesene Annahme im neuen
Uservalidator:

1. R13 stellte moderne Publishable und Secret Keys parallel zum Legacybestand
   bereit.
2. Die Benutzer-JWT-Signierung blieb davon unabhängig auf dem Legacy-JWT-
   Secret.
3. Der öffentliche JWKS enthielt deshalb null asymmetrische Keys.
4. Der gepinnte Usermodus verlangte dennoch `alg`, `kid` und erfolgreiche
   JWKS-Verifikation.
5. Lokale Mocktests modellierten diese reale Legacy-Signing-Topologie nicht.
6. Zwei echte User-Smokes scheiterten kontrolliert mit 401; der betroffene
   Proteinpfad wurde auf sein bewiesenes Preimage zurückgerollt.

Daraus gelten für alle späteren Wellen verbindlich folgende Regeln:

- API-Key-Topologie und JWT-Signing-Topologie werden getrennt inventarisiert,
  entschieden, getestet und rückgerollt.
- Eine Bibliothek oder ein Helper wird nicht nach Wunscharchitektur gewählt,
  sondern gegen echte aktuelle Tokens und das reale Supabase-Postimage.
- Mocktests müssen Legacy-Token ohne `kid` und modernen Token mit `kid`
  explizit abbilden. Mocks allein ersetzen keinen kontrollierten echten
  User-Token-Smoke.
- Unter dem aktuellen Legacy-Signing wird ein serverseitig autoritativer
  Auth-Check wie `auth.getUser(jwt)` geprüft und bevorzugt, statt einen leeren
  JWKS künstlich zu umgehen.
- Ein späterer Wechsel auf lokale JWKS- beziehungsweise `getClaims()`-
  Validierung erfolgt erst nach einer eigenständigen Signing-Key-Entscheidung.
- Authfehler bleiben fail-closed. Ein Validator darf nicht still zwischen
  Trust-Modellen wechseln oder bei Fehlern in einen schwächeren Modus fallen.
- Der produktive Cutover wird erst nach einem echten User-Smoke fortgesetzt;
  Public-, Secret- und Mock-Smokes allein reichen nicht.
- Eine JWT-Signing-Key-Migration ist kein versteckter Unterpunkt der
  API-Key-Migration und wird nie zur Nebenwirkung einer Functionumstellung.

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
- Davon getrennt die aktuelle Benutzer-JWT-Signing-Topologie erfassen:
  Legacy oder Signing-Key-System, beobachtete Tokenheader, JWKS-Keyanzahl und
  aktiver Validierungsweg. Keine Tokenwerte oder Claims dokumentieren.
- Keine Secret-Werte lesen, ausgeben oder persistieren.
- Deployed Functionversionen und `verify_jwt` erfassen.
- GitHub-Secretnamen und Workflowcaller erfassen.
- Alle Browser-, Android-, Edge-, Workflow- und Toolconsumer per `rg`
  inventarisieren.
- Aktuelle RLS-, ACL- und Function-Owner-Postimages read-only sichern.
- Baseline-Smokes für Login, Widget, Arztbericht, Protein, Trendpilot und Push
  festhalten.
- Einen kontrollierten echten User-Token-Smoke für den aktuellen
  Validierungsweg definieren; Mocktests gelten nicht als Ersatz.
- Das finale R13-Postimage nur für die unter „R13 nur bei nachgewiesener
  Relevanz lesen“ genannten Grenzen übernehmen.

Exit: Kein Consumer, Secretname, Signing-Modus oder User-Validierungsweg ist
nur aus Erinnerung bekannt.

### Welle K1: Schlüssel parallel bereitstellen

Owner-Gate im Supabase Dashboard:

- Default Publishable Key anlegen, falls noch nicht vorhanden.
- Benannte Secret Keys nach finalem Komponentenvertrag anlegen.
- Bereits aus R13 vorhandene und weiterhin dormant gültige Keys
  wiederverwenden; keine Ersatzkeys nur wegen einer neuen Roadmap erzeugen.
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

- Aktuelle Supabase-Empfehlung für Authserver-, `getClaims()`- und
  JWKS-Validierung gegen die reale Deno-/Edge-Runtime und Signing-Topologie
  prüfen.
- Unter Legacy-Signing den autoritativen Authserver-Weg, insbesondere
  `auth.getUser(jwt)`, als primären Kompatibilitätsmodus prüfen.
- Lokale JWKS-Validierung nur zulassen, wenn ein realer aktiver Signing Key,
  `alg`, `kid` und der erwartete JWKS-Postimage belegt sind.
- Falls verwendet: Version pinnen und Lock-/Importvertrag dokumentieren.
- Alternativ einen kleinen `_shared`-Auth-Helper mit denselben
  Sicherheitsgarantien bauen.
- Den Validierungsmodus explizit konfigurieren und fail-closed behandeln; kein
  opportunistisches „JWKS versuchen, dann still auf etwas anderes fallen“.
- Auth-Modi `user`, `secret:<name>` und gegebenenfalls duale Modi explizit
  testen.
- User-Client und Admin-Client getrennt halten.
- Token-/Keyvergleich konstantzeitnah beziehungsweise über die offizielle
  Auth-Schicht lösen.
- Fehlerantworten und Logs redigieren.
- `verify_jwt=false` erst zusammen mit dem gehärteten Handler deployen.
- Vor dem ersten betroffenen Functioncutover einen echten User-JWT aus der
  aktuellen MIDAS-Session kontrolliert prüfen, ohne Token oder Claims in
  Evidence zu übernehmen.

Exit: Die Auth-Schicht ist lokal gegen Missing, Invalid, Wrong-Key,
Wrong-Mode, Legacy-User-JWT, gegebenenfalls Signing-Key-User-JWT, Secret-Key,
Authserver-Ausfall und Body-Owner-Manipulation getestet. Der reale User-Smoke
ist grün.
Wiederholte legitime Schedulerrequests sind fachlich idempotent oder besitzen
den bereits vorgesehenen Deduplizierungsvertrag; API Keys selbst liefern
keinen Replay-Schutz.

### Optionales separates Owner-Gate: JWT-Signing-Key-Migration

Die API-Key-Modernisierung setzt keine automatische Migration der
Benutzer-JWT-Signierung voraus. Wenn Stephan später auch vom Legacy-JWT-Secret
auf das Signing-Key-System wechseln möchte, erhält diese Änderung einen
eigenen Scope innerhalb einer Roadmap oder eine eigene kleine Roadmap mit:

- aktueller Supabase-Dokumentation und vollständigem Caller-Inventar
- Standby-Key, Rotation, Übergangszeit und Revocation als getrennten Gates
- Nachweis aller lokalen JWT-Validatoren und `verify_jwt`-Einstellungen
- echten alten und neuen User-Token-Smokes während der Parallelphase
- Berücksichtigung von JWKS- und Clientcaches
- eigenständigem Rollback vor jeder irreversiblen Löschung

Ohne dieses ausdrückliche Owner-Gate bleibt Legacy-Signing aktiv und der
Edge-Auth-Vertrag muss es sicher unterstützen. Das ist kein Blocker für die
Migration von Legacy-`anon`/`service_role` auf Publishable/Secret API Keys.

### Welle K3: User-only Edge Functions kompatibel migrieren

Kandidaten:

- `midas-assistant`
- `midas-transcribe`
- `midas-tts`
- `midas-vision`
- `midas-monthly-report`

Pro Function:

- Callerklasse bestätigen.
- Benutzer-JWT strikt über den in K2 eingefrorenen, zur realen Signing-
  Topologie passenden Modus prüfen.
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

### P1: Verwechslung von API-Key- und JWT-Signing-Topologie

Moderne API Keys können vorhanden sein, während Supabase Auth weiterhin
Legacy-JWTs ohne asymmetrischen JWKS-Key ausstellt. Ein ausschließlich auf
`alg`/`kid`/JWKS ausgelegter Validator sperrt dann legitime Benutzer aus. Ein
stiller Fallback könnte umgekehrt eine Authlücke erzeugen.

Guard:

- API Keys und Signing Keys in getrennten Inventaren und Gates führen.
- Validierungsmodus aus dem realen Postimage einfrieren, nicht aus Keypräfixen
  oder Wunscharchitektur ableiten.
- Legacy- und Signing-Key-Tokenformen in Tests modellieren.
- Vor jedem betroffenen produktiven Cutover einen echten User-Smoke verlangen.
- Signing-Key-Rotation und Validatorwechsel getrennt rückrollbar halten.

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
- Legacy-User-JWT ohne `kid` bei leerem öffentlichen JWKS
- sofern aktiviert: Signing-Key-User-JWT mit `alg`/`kid` und passendem JWKS
- autoritative Authserver-Validierung mit `auth.getUser(jwt)` oder dem dann
  offiziell empfohlenen Äquivalent
- abgelaufener, manipulierter und projektfremder User-JWT
- Authserver-/Netzwerkfehler endet fail-closed und wird nicht als anonymer oder
  privilegierter Zugriff fortgesetzt
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
- JWT-Signing-System, JWKS-Keyanzahl und aktiven Validierungsmodus read-only
  inventarisieren; keine Token-, Claim- oder Schlüsselwerte sichern
- Functionversion und `verify_jwt` vor/nach Deploy sichern
- GitHub-Secretnamen ohne Werte prüfen
- kontrollierter echter User-Token-Smoke vor dem ersten betroffenen Cutover
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
- JWT-Signing-Key importieren, erzeugen, rotieren, widerrufen oder löschen
- produktiven User-Validierungsmodus zwischen Authserver und lokaler
  Signing-Key-/JWKS-Prüfung ändern
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
- API-Key- und JWT-Signing-Migration besitzen getrennte Preimages, Gates und
  Rollbacks.
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

1. Welcher offiziell unterstützte User-Validierungsweg passt zum dann realen
   Signing-Postimage: Authserver, `getClaims()` oder lokale JWKS-Prüfung?
2. Soll die optionale JWT-Signing-Key-Migration nach der API-Key-Migration
   erfolgen oder bewusst als eigener späterer Zukunftsscope verbleiben?
3. Wird `@supabase/server` für alle aktiven Edge Functions eingeführt, nur für
   duale Authpfade oder durch einen kleineren bewiesenen Helper ersetzt?
4. Wird Incident Push in derselben Cutover-Roadmap oder in einer eigenen
   kleinen Welle migriert?
5. Werden geparkte KI-Functions modernisiert oder vorher kontrolliert
   stillgelegt?
6. Wie lange bleiben deaktivierte Legacy-Schlüssel vor endgültigem Löschen
   bestehen?
7. Reicht eine Roadmap mit owner-gateten Wellen oder erzwingt die Kombination
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
- alle aktiven User-Functions diese JWTs über einen dokumentierten, zur realen
  Signing-Topologie passenden und mit echtem User-Token geprüften Weg
  validieren
- kein Secret Key in Browser, Android, Repo, Doku, Logs oder Recovery liegt
- alle Edge Functions eine dokumentierte Callerklasse besitzen
- `verify_jwt` und In-Function-Auth nachweislich zusammenpassen
- Protein, Trendpilot und Incident Push unabhängig rotierbar sind
- RLS, Grants und Function-ACLs weiterhin dem Single-User-Vertrag entsprechen
- PWA, Android, Widget, Arztbericht, Push und Scheduler grün getestet sind
- Recovery die Konfiguration über Namen und Schritte rekonstruieren kann
- Legacy-`anon` und Legacy-`service_role` ohne Produktbruch deaktiviert sind

Eine Migration der Benutzer-JWT-Signierung auf das moderne Signing-Key-System
ist für diese API-Key-Abschlusskriterien nicht zwingend. Wird sie vom Owner in
den Programmscope aufgenommen, besitzt sie eigene zusätzliche
Abschlusskriterien für Rotation, Parallelvertrauen, Cachefenster, Revocation
und reale alte/neue User-Token-Smokes.

## Contract Review der F45-Ergänzung

Reviewdatum: 2026-08-24

Geprüft wurden der dokumentierte R13-Freeze, die konkrete Evidence zu
`EV-ACT-R13-PRE09`, `EV-ACT-R13-PRE12` und `F-ACT-R13-45`, die aktuellen
Supabase-Verträge für API Keys, JWT Signing Keys und `auth.getUser(jwt)` sowie
der MIDAS-Single-User- und Owner-Gate-Vertrag.

Korrigierte Findings:

- Der bisherige Iststand behauptete fälschlich, moderne Keys seien noch nicht
  vorhanden. Das dormant R13-Postimage ist nun dokumentiert.
- API-Key- und JWT-Signing-Migration waren nicht klar genug getrennt. Sie sind
  nun eigenständige Inventare, Gates, Tests und Rollbacks.
- R13 war als pauschale künftige Grundlage formuliert. Es ist nun nur bei
  konkreter Consumer-, Auth-, SQL- oder Schedulerrelevanz zu lesen.
- Mocktests konnten eine reale Legacy-Signing-Topologie übersehen. Ein echter
  User-Token-Smoke ist nun verpflichtend.
- Eine spätere Signing-Key-Migration war implizit mitgedacht. Sie ist jetzt ein
  optionaler, ausdrücklich owner-gateter Scope und kein versteckter
  API-Key-Nebeneffekt.

Ergebnis: `PASS`. Der Masterplan bleibt ein Future-Dokument ohne produktive
Freigabe und setzt keine Änderung an R13 voraus.

## Offizielle Referenzen

- [Supabase: Understanding API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Supabase: Migrating to publishable and secret API keys](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys)
- [Supabase: JWT Signing Keys](https://supabase.com/docs/guides/auth/signing-keys)
- [Supabase JavaScript: `auth.getUser(jwt)`](https://supabase.com/docs/reference/javascript/auth-getuser)
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

Nur bei nachgewiesener R13-Relevanz zusätzlich, solange R13 aktiv ist:

- `docs/MIDAS Activity V2 R13 Read-Consumer Activation and V1 Parity Evidence.md`
- `docs/MIDAS Activity V2 R13 Read-Consumer Activation and V1 Parity Roadmap.md`
- zunächst ausschließlich `EV-ACT-R13-PRE09`, `EV-ACT-R13-PRE12`,
  `F-ACT-R13-45` und das finale Postimage

Nach dem R13-Abschluss werden stattdessen die gleichnamigen `(DONE)`-Quellen in
`docs/archive/` verwendet. Aktive und archivierte Fassungen werden nicht
gleichzeitig als konkurrierende Source of Truth gelesen.

Archivierte Roadmaps werden nur über konkrete Evidence-IDs oder bei einem
nachgewiesenen Quellenwiderspruch erneut gelesen.
