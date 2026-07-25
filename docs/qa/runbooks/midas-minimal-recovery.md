# Runbook RB-006 - MIDAS Minimal Recovery

## Zweck und Schutzumfang

Dieses Runbook beschreibt das manuelle Recovery-Bundle für MIDAS. Es ergänzt
GitHub und Supabase um eine unabhängige Kopie auf der zweiten internen SSD.
Es schützt primär gegen Verlust von `C:` oder der Windows-Installation und
liefert einen nachvollziehbaren Rückweg nach Verlust des Supabase-Projekts.

MIDAS ist ein persönliches Single-User-System. Deshalb gelten bewusst:

- GitHub bleibt Source of Truth für Code.
- Supabase bleibt Source of Truth für synchronisierte Produktivdaten.
- Ein verschlüsseltes Bundle wird im Jänner, im Juli und vor destruktivem SQL
  neu erzeugt.
- Es bleiben höchstens zwei geprüfte Generationen erhalten.
- Ein vollständiger Restore in ein zweites Projekt ist nicht Bestandteil
  dieses Vertrags und bleibt unbewiesen.
- Verlust des gesamten PCs einschließlich `C:` und `D:` ist nicht abgedeckt.

## Wirkung und Owner-Gate

- Remote-Datenbank: `read-only`; es werden nur logische Dumps erzeugt.
- Repo: Doku- und Guard-Änderungen, keine Produktänderung.
- `D:`: sensible Klartextdateien entstehen kurzzeitig im Staging und werden
  nach erfolgreicher Archivprüfung gelöscht.

Vor der Bundle-Erzeugung ist eine explizite Owner-Freigabe erforderlich. Der
Owner bestätigt Zielprojekt, Zielpfad und Backupfenster und gibt Datenbank- und
Archivkennwort ausschließlich interaktiv ein. Kennwörter dürfen nie in Chat,
Shell-Argumenten, Skripten, Env-Dateien, Logs, Inventar oder Manifest stehen.
`supabase db dump --dry-run` ist für produktive Recovery-Läufe verboten, weil
die CLI dabei temporäre Login-Credentials in der Konsolenausgabe offenlegt.
Nach erfolgreicher Erzeugung liegt der Wiederzugang im synchronisierten
Microsoft-Kennwortmanager und wird auf einem zweiten Gerät geprüft. Für die
beiden aufbewahrten Generationen wird dasselbe Recovery-Passwort verwendet.
Bei einer bewussten Passwortrotation bleibt der alte Eintrag erhalten, bis
kein damit verschlüsseltes Archiv mehr existiert.

## Kanonische Quellen

<!-- markdownlint-disable MD013 -->

| Bereich | Source of Truth |
| --- | --- |
| Code und Edge Functions | GitHub `main` und `backend/supabase/functions/` |
| Datenbank-Rekonstruktionsquellen | `sql/`, aktueller logischer CLI-Dump |
| Supabase-Kontext | produktives Projekt `jlylmservssinsavlkdi` |
| Arzt-Berichte | `health_events`; manuelle Range-only-Erzeugung über `midas-monthly-report` |
| Cron: Medication Retention | `sql/17_Medication_Retention.sql` |
| Cron: Push Hygiene | `sql/18_Push_Data_Hygiene.sql` |
| Android-Signing | `C:\Users\steph\.android\debug.keystore` |
| Android-OAuth-Callback | `de.schabuss.midas://auth/callback` |
| PWA-Ziel | `https://stephanschabuss97-design.github.io/M.I.D.A.S./` |
| Tooling und lokale Regeln | `docs/DEV_ENVIRONMENT.md` |

<!-- markdownlint-enable MD013 -->

Alte Dateien unter `C:\Users\steph\Projekte\Backup\supabase-local` sind kein
aktueller Wiederherstellungsanker.

## Bundle-Vertrag

Ziel:

```text
D:\MIDAS-Recovery\MIDAS-Recovery_YYYY-MM-DD.7z
D:\MIDAS-Recovery\MIDAS-Recovery_YYYY-MM-DD.7z.sha256
```

Das Archiv verwendet `7z`, AES-256 und verschlüsselte Dateinamen. Die
Sidecar-Datei liegt neben dem Archiv und enthält ausschließlich dessen
SHA-256. Das Archivkennwort liegt weder im Zielordner noch im Repo.

Interne Struktur:

```text
database/roles.sql
database/schema.sql
database/data.sql
database/report-lifecycle/report-events.jsonl
database/report-lifecycle/report-inventory.json
android/debug.keystore
configuration/recovery-config-inventory.md
runbook/midas-minimal-recovery.md
manifest/recovery-manifest.json
manifest/files.sha256
```

Die beiden Dateien unter `database/report-lifecycle/` sind bei einem
destruktiven Report-Cutover Pflicht. In einem regulären Jänner-/Juli-Bundle
ohne Report-Cutover dürfen sie fehlen; das Manifest nennt diesen Zustand
explizit.

Das Manifest nennt mindestens:

- Erzeugungszeit in `Europe/Vienna`, Projekt-Ref und Git-Commit,
- Supabase-CLI- und PostgreSQL-Version,
- redigierte Tabellen-, View-, Function-, Auth-User- und Cron-Zähler,
- bei einem Report-Cutover Count und SHA-256 der geschützten
  Report-Lifecycle-Dateien, aber keine Reporttexte oder Zeilen-IDs,
- Namen, relative Pfade, Größen und SHA-256 der Payload-Dateien; das Manifest
  selbst wird anschließend durch `manifest/files.sha256` abgesichert,
- den Hinweis `logical dump only; full restore not tested`.

`manifest/files.sha256` enthält Payload-Dateien und Manifest, aber nicht sich
selbst. Dadurch entsteht keine zirkuläre Selbst-Prüfsumme.

### Geschützter Report-Cutover-Extrakt

Vor einem destruktiven Report-Cutover sind zusätzlich zum vollständigen
logischen Dump zwei gezielte Dateien Pflicht:

- `report-events.jsonl` enthält alle
  `health_events/system_comment`-Zeilen mit `payload.subtype` gleich
  `monthly_report` oder `range_report`.
- Jede JSONL-Zeile enthält ausschließlich `id`, `user_id`, `ts`, `type`,
  `ctx`, `payload` und `created_at`.
- Das generierte Feld `day` wird vor dem Export gegen den Wiener Tag von `ts`
  mit `day = (ts AT TIME ZONE 'Europe/Vienna')::date` geprüft, aber nicht als
  Restore-Spalte exportiert.
- `report-inventory.json` enthält Count, sortierte IDs, SHA-256 je
  kanonischer JSONL-Zeile und die Anzahl gefundener `day`-Abweichungen.

Die kanonische JSONL-Zeile ist das UTF-8-Ergebnis von:

```sql
jsonb_build_object(
  'id', id,
  'user_id', user_id,
  'ts', ts,
  'type', type,
  'ctx', ctx,
  'payload', payload,
  'created_at', created_at
)::text
```

Reportzeilen und Inventar sind nach `id::text` aufsteigend sortiert. Der
Zeilenhash ist der kleingeschriebene Hexwert von
`digest(<exakte JSONL-Zeile>, 'sha256')`. Export und Inventar müssen dieselbe
SQL-Ausdrucksdefinition verwenden.

Der Export erfolgt in einer read-only-Transaktion über den lokalen
`psql`-Client. Verbindungsparameter kommen aus dem Supabase-Connect-Dialog;
das Datenbankkennwort wird ausschließlich interaktiv eingegeben. Es darf
weder im Kommando, in einer Env-Datei noch in einer temporären SQL-Datei
stehen. Client-seitiges `\copy` schreibt direkt in das zugriffsgeschützte
Staging unter `database/report-lifecycle/`.

Vor der Archivierung müssen gelten:

1. Extrakt-Count und Inventar-Count stimmen überein.
2. `day`-Abweichungen sind `0`.
3. Sortierte IDs und Zeilenhashes sind vollständig.
4. Beide Dateien sind in `manifest/files.sha256` enthalten.
5. In Roadmap und Evidence erscheinen nur Count, Dateihash und PASS/FAIL.

Der gezielte Restore ist manuell und owner-gated: JSONL-Zeilen werden erst
nach Schema-, Owner- und Count-Prüfung mit den sieben exportierten Spalten
eingefügt. `day` wird dabei erneut von PostgreSQL generiert. Ohne getestetes
Archiv, gültige Sidecar-Prüfsumme und vollständig bereinigtes
Klartext-Staging darf der Report-Cutover nicht beginnen.

## Redigiertes Konfigurationsinventar

Das Inventar enthält Namen, erwarteten Zustand und Wiederbeschaffungsweg, aber
keine Werte, Digests, Tokens, URLs mit Credentials oder Schlüsselmaterial.

### Edge Functions

Diese acht Functions sind aktuell aktiv und verlangen `verify_jwt=true`:

- `midas-assistant`
- `midas-transcribe`
- `midas-tts`
- `midas-vision`
- `midas-monthly-report` (technischer Name; ausschließlich Range-Berichte)
- `midas-protein-targets`
- `midas-trendpilot`
- `midas-incident-push`

Sie werden aus `backend/supabase/functions/` neu deployed. Ein Dump enthält
weder Function-Deployments noch deren Secret-Werte.

### Installierte PostgreSQL-Erweiterungen

- `pg_cron`
- `supabase_vault`
- `pg_stat_statements`
- `plpgsql`
- `uuid-ossp`
- `pgcrypto`

Vor einem Restore müssen Verfügbarkeit und Version im Zielprojekt geprüft
werden. Erweiterungen werden nicht blind aus einer alten Liste aktiviert.

### Cron-Jobs

<!-- markdownlint-disable MD013 -->

| Job | Schedule | Command | Rekonstruktionsquelle |
| --- | --- | --- | --- |
| `midas-medication-retention-daily` | `15 3 * * *` | `select public.med_retention_cleanup_internal();` | `sql/17_Medication_Retention.sql` |
| `midas-push-hygiene-weekly` | `45 3 * * 0` | `select public.push_data_hygiene_cleanup_internal();` | `sql/18_Push_Data_Hygiene.sql` |

<!-- markdownlint-enable MD013 -->

### Supabase Function-Secrets

App-spezifische Namen:

- `INCIDENTS_TZ`
- `INCIDENTS_USER_ID`
- `OPENAI_API_KEY`
- `PROTEIN_TARGETS_USER_ID`
- `TRENDPILOT_USER_ID`
- `VAPID_PRIVATE_KEY`
- `VAPID_PUBLIC_KEY`
- `VAPID_SUBJECT`

Supabase verwaltet beziehungsweise liefert zusätzlich projektbezogene Namen
wie `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`SUPABASE_DB_URL`, `SUPABASE_JWKS`, `SUPABASE_PUBLISHABLE_KEYS` und
`SUPABASE_SECRET_KEYS`. Diese Werte werden im Zielprojekt neu abgerufen oder
erzeugt und nicht in das Bundle kopiert.

User-ID-Secrets werden aus dem wiederhergestellten Auth-Nutzer neu gesetzt.
`INCIDENTS_TZ` folgt dem fachlichen Zeitzonenvertrag. `OPENAI_API_KEY` wird im
OpenAI-Konto neu bezogen. Da das bestehende VAPID-Private-Key-Material lokal
nicht verfügbar ist, wird im Recovery-Fall ein neues VAPID-Paar erzeugt, der
öffentliche Schlüssel in `app/modules/push/index.js` aktualisiert und Push am
Gerät einmal neu angemeldet.

### GitHub Actions

Das öffentliche Repo benötigt diese GitHub-Secret-Namen:

- `INCIDENTS_PUSH_URL`
- `PROTEIN_TARGETS_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TRENDPILOT_URL`

Function-URLs und Service-Role-Key werden aus dem neuen Supabase-Projekt
bezogen. Werte werden nicht aus Logs oder alten Workflow-Läufen rekonstruiert.
Für Arzt-Berichte existiert kein GitHub-Scheduler und kein Report-URL-Secret;
die weiterhin benötigte Edge Function wird manuell mit User-JWT aufgerufen.
Das gemeinsam genutzte `SUPABASE_SERVICE_ROLE_KEY` bleibt für die übrigen
GitHub Actions erhalten.

### Auth, OAuth und Clients

- Google bleibt der aktiv zu konfigurierende OAuth-Provider.
- Die Google-Konsole benötigt als autorisierten Provider-Callback
  `https://<PROJECT-REF>.supabase.co/auth/v1/callback`; bei neuer Project-Ref
  wird dieser Wert ersetzt.
- Die PWA leitet nach dem Login zur aktuellen MIDAS-Origin und zum aktuellen
  Pfad zurück; produktiv ist das GitHub-Pages-Ziel aus der Quellentabelle.
- Android benötigt den erlaubten Redirect
  `de.schabuss.midas://auth/callback`.
- Google-Client-ID und -Secret werden in der Google-Konsole neu abgerufen oder
  rotiert und im Supabase-Dashboard gesetzt.
- Site URL und Redirect-Allowlist werden im Supabase-Dashboard gegen PWA und
  Android geprüft; `backend/supabase/config.toml` ist nur lokale Konfiguration
  und kein Beweis für den produktiven Zustand.
- PWA und Android werden mit neuer Supabase-URL und neuem Publishable-/Anon-Key
  konfiguriert. Die Function-Basis in `app/modules/hub/index.js` muss bei einer
  neuen Project-Ref angepasst werden.
- Nach Schlüsselwechseln müssen bestehende Sessions neu authentifiziert
  werden.

## Voraussetzungen vor jeder Erzeugung

1. `git status --short` prüfen und aktuellen Commit notieren.
2. Bestätigen, dass `.gitignore` Dump-, Staging-, Bundle-, Manifest- und
   Keystore-Artefakte abwehrt.
3. `D:` und mindestens einige hundert MB freien Speicher bestätigen.
4. Docker, Supabase CLI und 7-Zip prüfen:

   ```powershell
   docker version
   supabase --version
   supabase db dump --help
   7z i
   ```

5. Mit `supabase projects list` bestätigen, dass MIDAS `ACTIVE_HEALTHY` ist.
6. Prüfen, dass `C:\Users\steph\.android\debug.keystore` existiert.
7. MIDAS während der drei Dump-Aufrufe und eines gezielten Report-Extrakts
   nicht verwenden; keine parallele Schemaänderung oder produktive
   SQL-Ausführung zulassen.
8. Lokale Projektverknüpfung im normalen Owner-Terminal herstellen:

   ```powershell
   supabase link --project-ref jlylmservssinsavlkdi --workdir backend
   ```

   Das Datenbankkennwort nur in der interaktiven Abfrage eingeben. Den Flag
   `--password` nicht verwenden. Danach muss
   `backend/supabase/.temp/project-ref` exakt die MIDAS-Ref enthalten.

Fehlt eine Voraussetzung, wird kein Staging angelegt.

## Bundle-Erzeugung

Diese Phase startet nur nach Owner-Gate.

1. Ziel- und datierten Staging-Pfad bestimmen:

   ```powershell
   $date = Get-Date -Format 'yyyy-MM-dd'
   $target = 'D:\MIDAS-Recovery'
   $staging = Join-Path $target ".staging\$date"
   ```

2. Vor dem Anlegen prüfen, dass beide aufgelösten Pfade unter
   `D:\MIDAS-Recovery\` liegen. Dann Verzeichnisse für `database`, `android`,
   `configuration`, `runbook` und `manifest` anlegen und den Staging-Ordner
   auf den aktuellen Windows-Benutzer beschränken:

   ```powershell
   $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
   New-Item -ItemType Directory -Force $staging | Out-Null
   icacls $staging /inheritance:r /grant:r "${currentUser}:(OI)(CI)F"
   ```

   `icacls` muss erfolgreich enden. Erst danach die fünf Unterordner anlegen.
3. Drei separate Dumps aus dem verknüpften Projekt erzeugen:

   ```powershell
   supabase db dump --linked --workdir backend `
     --file "$staging\database\roles.sql" --role-only
   supabase db dump --linked --workdir backend `
     --file "$staging\database\schema.sql"
   supabase db dump --linked --workdir backend `
     --file "$staging\database\data.sql" --data-only --use-copy
   ```

4. Vor einem destruktiven Report-Cutover den geschützten Report-Extrakt und
   sein Inventar gemäß dem Report-Cutover-Vertrag über eine read-only-
   `psql`-Sitzung erzeugen. Counts, sortierte IDs, Zeilenhashes und
   `day`-Prüfung innerhalb des geschützten Stagings vergleichen.
5. Keystore und Runbook-Snapshot kopieren. Redigiertes Inventar und Manifest
   erstellen. Das Manifest listet die Payload-Dateien auf. Danach
   `manifest/files.sha256` für Payload-Dateien und Manifest erzeugen; die
   Prüfsummenliste selbst bleibt ausgenommen.
6. Prüfen, dass alle drei SQL-Dateien nicht leer sind und erwartete MIDAS-
   Objekte enthalten. Bei einem Report-Cutover zusätzlich beide
   Report-Lifecycle-Dateien und ihre Inventarübereinstimmung prüfen. Keine
   Dump- oder Reportinhalte in Roadmap, Chat oder Logs kopieren.
7. Den Inhalt des Staging-Ordners über eine sichtbare lokale PowerShell als
   `MIDAS-Recovery_YYYY-MM-DD.7z` archivieren. 7-Zip muss das Kennwort direkt
   in seiner interaktiven Konsole abfragen:
   - Archivformat `7z`,
   - Verschlüsselung `AES-256`,
   - `Dateinamen verschlüsseln` aktiv,
   - ein nicht leeres ASCII-Kennwort verwenden,
   - `7z a ... -mhe=on -p` ohne Kennwort hinter `-p` ausführen,
   - das Kennwort ausschließlich am sichtbaren 7-Zip-Prompt eingeben,
   - Kennwort niemals als Kommandozeilenwert, Datei, Umgebungsvariable,
     PowerShell-String oder Log speichern.
8. Unmittelbar danach `7z t -p <Archiv>` ebenfalls direkt in der sichtbaren
   Konsole ausführen und dasselbe Kennwort am neuen 7-Zip-Prompt eingeben.
   Nur Exit Code `0` gilt als bestandener Archivtest. Dateiliste, interne
   Prüfsummen und Keystore-Kopie müssen vor der Archivierung bestätigt sein.
9. SHA-256-Sidecar erzeugen und unmittelbar gegen das Archiv verifizieren:

   ```powershell
   $archive = Join-Path $target "MIDAS-Recovery_$date.7z"
   $sidecar = "$archive.sha256"
   (Get-FileHash $archive -Algorithm SHA256).Hash |
     Set-Content -Encoding ASCII $sidecar
   $expected = (Get-Content -Raw $sidecar).Trim()
   $actual = (Get-FileHash $archive -Algorithm SHA256).Hash
   if ($actual -ne $expected) { throw 'Recovery archive hash mismatch' }
   ```

10. Erst nach allen grünen Prüfungen das Klartext-Staging löschen. Vor einem
   rekursiven Löschen den aufgelösten Pfad erneut gegen
   `D:\MIDAS-Recovery\.staging\` prüfen.
11. Nur das geprüfte Archiv freigeben. Erst danach ältere Generationen so
    rotieren, dass höchstens die zwei jüngsten Archive samt Sidecars bleiben.
    Bei einer Passwortrotation den alten Passwortmanager-Eintrag erst nach
    dem letzten damit geschützten Archiv entfernen.

## Abbruch- und Rollback-Regeln

Sofort stoppen, wenn:

- Projekt-Ref, Zielpfad oder Backupfenster unklar ist,
- Docker, Link, Datenbankzugang oder ein Dump fehlschlägt,
- ein Kennwort nicht interaktiv eingegeben werden kann,
- eine SQL-Datei leer oder offensichtlich unvollständig ist,
- Archivtest, interne Prüfsumme oder Sidecar-Prüfung fehlschlägt,
- Secret-Werte in Inventar, Manifest, Repo oder Shell-Historie auftauchen,
- Staging nicht sicher unter dem festgelegten Pfad bereinigt werden kann.

Bei Abbruch wird kein Bundle freigegeben. Unfertiges Archiv und Staging werden
nach verifiziertem Pfadcheck entfernt; Produktion bleibt unverändert. Kein
Datenbankkennwort-Reset, Secret-Wechsel, Deploy oder Restore erfolgt still als
Fehlerbehebung.

## Wiederaufbau-Reihenfolge

Diese Reihenfolge ist ein Runbook, kein getesteter End-to-End-Nachweis:

1. Windows und Werkzeuge gemäß `docs/DEV_ENVIRONMENT.md` bereitstellen.
2. Repo klonen und den im Manifest genannten Commit prüfen.
3. Neues Supabase-Projekt mit kompatibler PostgreSQL-Version anlegen.
4. Benötigte Erweiterungen prüfen beziehungsweise aktivieren.
5. Rollen, Schema und Daten in dieser Reihenfolge wiederherstellen. Offizielle
   Supabase-Restore-Anleitung und ein isoliertes Ziel verwenden; niemals in
   das beschädigte Produktivprojekt zurückspielen.
6. Tabellen, RLS, Funktionen, Trigger, `auth.users` und Kern-Zeilenzahlen
   prüfen. Storage benötigt aktuell keinen Objekttransfer.
7. Google OAuth, Site URL, PWA- und Android-Redirects konfigurieren.
8. Edge Functions aus dem Repo mit `verify_jwt=true` deployen und ihre Secrets
   neu setzen. `midas-monthly-report` wird trotz seines technischen Namens
   ausschließlich als manuell aufgerufene Range-only-Function rekonstruiert.
9. Beide Cron-Verträge aus den versionierten SQL-Dateien rekonstruieren und
   auf genau einen aktiven Job je Name prüfen.
10. GitHub-Action-Secrets für Incident Push, Protein und Trendpilot
    aktualisieren. Kein Monthly-Report-Workflow und kein `REPORTS_URL`-Secret
    werden rekonstruiert.
11. PWA- und Android-Client auf neue URL und Schlüssel konfigurieren;
    hart codierte Project-Ref-/Function-URL-Consumer korrigieren.
12. Neues VAPID-Paar ausrollen, PWA erneut anmelden und Push prüfen.
13. Android mit dem gesicherten Keystore bauen und die Updatekontinuität auf
    dem Gerät prüfen.
14. Auth-, Daten-, Edge-, Cron-, PWA-, Push- und Android-Smokes aus den
    zuständigen QA-Suites ausführen.

## Pflege und Evidence

- Reguläre Erzeugung: Jänner und Juli.
- Zusätzliche Erzeugung: unmittelbar vor destruktivem SQL oder Daten-Cutover.
- Nachweis in aktiver Roadmap oder Evidence: Datum, Commit, Projekt-Ref,
  Dateigrößen, redigierte Zähler, Hash-Ergebnis, Staging-Cleanup und Anzahl der
  Generationen.
- Nie dokumentieren: Kennwörter, Secret-Werte, vollständige Dumps,
  Authorization-Header oder Keystore-Inhalte.
- Ein grüner Lauf beweist Dateivollständigkeit und Plausibilität, aber keinen
  vollständigen Restore.
