# MIDAS Backend Source Integration Roadmap

## Ziel (klar und pruefbar)

Der produktive Supabase-Edge-Function-Source aus `C:/Users/steph/Projekte/midas-backend` soll kontrolliert in das MIDAS-Repo uebernommen werden, ohne lokale Tooling-Artefakte, Backups, Secrets oder Deploy-Binaries mitzucommiten.

Pruefbare Zieldefinition:

- Produktive Edge Functions liegen versioniert im MIDAS-Repo unter `backend/supabase/functions`.
- `backend/supabase/config.toml` ist als Supabase-Konfig im Repo vorhanden, sofern S1/S2 keine Secret-/Artefakt-Bedenken finden.
- Importierte Function-Dateien sind byte-/hash-gleich zum externen Source zum Zeitpunkt des Imports; diese Roadmap ist kein Code-Refactor.
- Nicht-produktive Dateien bleiben draussen:
  - `supabase.exe`
  - `supabase-*.exe.bak`
  - `supabase/.temp/`
  - `.vscode/`
  - generische Supabase-CLI-README
  - leeres/minimales `package-lock.json`
  - `*.bak`
- Deno-Checks laufen gegen die neuen Repo-Pfade.
- Import-Checks beweisen, dass keine Function-Fachlogik durch den Pfadumzug geaendert wurde.
- Aktive Source-of-Truth-Dokus zeigen kuenftig auf relative Repo-Pfade, nicht mehr auf den externen Backend-Workspace.
- Deploy-Vertrag ist dokumentiert, aber kein Deploy wird als Teil dieser Roadmap ohne explizite User-Freigabe ausgefuehrt.

## Problemzusammenfassung

Der Backend-Workspace liegt aktuell ausserhalb des MIDAS-Git-Repos:

- `C:/Users/steph/Projekte/midas-backend`

Das war historisch als separater/backup-naher Arbeitsbereich entstanden. Inzwischen sind die Edge Functions aber produktiver MIDAS-Source-Code:

- Push/Incidents
- Assistant/Voice/Transcribe/TTS/Vision
- Protein Targets
- Monthly/Range Reports
- Trendpilot

Die abgeschlossene Backend-Deno-Roadmap hat alle acht produktiven Edge Functions inventarisiert, geprueft und teilweise minimal gefixt/deployed. Der Nachteil bleibt: Backend-Codeaenderungen sind nicht im MIDAS-Git-Status sichtbar und muessen separat gesichert werden.

Die Voranalyse des externen Ordners ergab:

- Produktiver Source ist klein und klar abgrenzbar: ca. 200 KB Functions plus `supabase/config.toml`.
- Grosse lokale Binaries liegen im Ordner: ca. 190 MB `supabase.exe`/Backup.
- Supabase-Temp-Dateien liegen unter `supabase/.temp/`.
- `midas-vision/index.ts.bak` ist Backup/Altdatei.
- `.vscode/tasks.json` enthaelt nuetzliche Deploy-Tasks, ist aber lokale IDE-Konfiguration und nicht automatisch Repo-Source.
- Wenn `.vscode/tasks.json` nicht importiert wird, muss `backend/README.md` die nuetzlichen Deploy-Hinweise in repo-neutraler Form ersetzen.
- Die externe README ist generische Supabase-CLI-Doku, nicht MIDAS-spezifisch.

Diese Roadmap soll den Import klein und deterministisch halten.

## Scope

- Read-only Inventar des externen Backend-Workspace.
- Import von produktivem Backend-Source in:
  - `backend/supabase/config.toml`
  - `backend/supabase/functions/<function>/index.ts`
- Optional: neues kleines `backend/README.md` fuer:
  - Deno-Checks
  - Deploy-Hinweise
  - Secret-/Artefakt-Grenzen
  - Hinweis, dass `supabase.exe` extern installiert/gelagert bleibt und nicht Teil des Repos ist
- `.gitignore`-Haertung fuer Backend-Artefakte.
- Deno-Checks gegen neue Repo-Pfade.
- Hash-/Content-Vergleich zwischen externen Source-Dateien und importierten Repo-Dateien.
- Secret-/Artefakt-Scan im neuen `backend/`-Tree.
- Doku-/QA-Sync fuer aktive Source-of-Truth-Dateien.

## Not in Scope

- Fachliche Aenderungen an Edge Functions.
- Refactor der Edge Functions.
- Prompt-/AI-Verhaltensaenderungen.
- Medizinische Schwellen, Dedupe, Protein-Formeln, Trend-Gates oder Report-Payloads aendern.
- SQL-/RLS-/Datenmodell-Aenderungen.
- Frontend-Code-Aenderungen.
- GitHub-Actions-Umbau, ausser ein harter Pfad-/Contract-Drift wird in S2/S3 bestaetigt.
- Deploy zu Supabase ohne explizite User-Freigabe.
- Import von lokalen Tooling-/Arbeitsdateien:
  - `.vscode/`
  - `supabase.exe`
  - `supabase-*.exe.bak`
  - `supabase/.temp/`
  - `*.bak`
  - externe generische Supabase-CLI-README
  - leeres/minimales `package-lock.json`

## Relevante Referenzen (Code)

Externer Backend-Workspace:

- `C:/Users/steph/Projekte/midas-backend/supabase/config.toml`
- `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-assistant/index.ts`
- `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-incident-push/index.ts`
- `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-monthly-report/index.ts`
- `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-protein-targets/index.ts`
- `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-transcribe/index.ts`
- `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-trendpilot/index.ts`
- `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-tts/index.ts`
- `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-vision/index.ts`

Aktuelles MIDAS-Repo:

- `.gitignore`
- `.gitattributes`
- `.github/workflows/incidents-push.yml`
- `.github/workflows/monthly-report.yml`
- `.github/workflows/protein-targets.yml`
- `.github/workflows/trendpilot.yml`
- `app/supabase/api/reports.js`
- `app/modules/vitals-stack/protein/index.js`
- `app/modules/hub/index.js`

Nicht produktiv, aber als S1-Referenz:

- `C:/Users/steph/Projekte/midas-backend/.vscode/tasks.json`
- `C:/Users/steph/Projekte/midas-backend/.vscode/settings.json`
- `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-assistant/voice-assistant-roadmap.md`
- `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-vision/index.ts.bak`

## Relevante Referenzen (Doku)

- `README.md`
- `docs/MIDAS Roadmap Template.md`
- `docs/QA_CHECKS.md`
- `docs/modules/Push Module Overview.md`
- `docs/modules/Assistant Module Overview.md`
- `docs/modules/Intent Engine Module Overview.md`
- `docs/modules/VAD Module Overview.md`
- `docs/modules/Trendpilot Module Overview.md`
- `docs/modules/Reports Module Overview.md`
- `docs/modules/Doctor View Module Overview.md`
- `docs/modules/Protein Module Overview.md`
- `docs/modules/Activity Module Overview.md`
- `docs/archive/MIDAS Backend Edge Functions Deno Check Roadmap (DONE).md`
- `docs/archive/Push Channel Robustness & Android WebView Boundary Roadmap (DONE).md`
- `docs/archive/MIDAS Touchlog Module & Push Service Extraction Roadmap (DONE).md`

## Guardrails

- MIDAS bleibt single-user und alltagstauglich.
- Backend-Source-Integration ist Struktur-/Wartungsarbeit, kein Produktfeature.
- Keine Secrets in Git, Doku, Logs oder finaler Antwort.
- Keine `.env`-, CLI-Binary-, Temp-, Backup- oder IDE-Artefakte committen.
- Keine fachliche Edge-Function-Aenderung als Nebeneffekt des Imports.
- Keine Deploys ohne ausdrueckliche User-Freigabe.
- Aktive Dokus sollen kuenftig relative Repo-Pfade verwenden.
- Historische Roadmaps im Archiv muessen nicht rueckwirkend auf relative Pfade umgeschrieben werden.
- Der externe Backend-Ordner darf nach Import nicht automatisch geloescht werden.
- Erst nach Checks entscheiden, ob der externe Ordner nur noch Deploy-/Backup-Workspace bleibt.

## Architektur-Constraints

- Supabase Edge Functions laufen in Deno/Supabase Runtime.
- `deno check` bleibt der lokale statische Pflichtcheck fuer Functions.
- Supabase CLI kann lokal als externes Tool bestehen bleiben; sie muss nicht ins Repo.
- `backend/supabase/config.toml` kann lokale Supabase-Defaults enthalten, darf aber keine echten Secret-Werte enthalten.
- `backend/supabase/config.toml` dokumentiert CLI-/Local-Stack-Defaults und ist nicht automatisch ein Beweis, dass ein vollstaendiger lokaler Supabase-Stack im MIDAS-Repo startbereit ist.
- Falls `config.toml` relative Seeds/Migrations referenziert, muessen fehlende Dateien als nicht genutzter Local-Stack-Teil dokumentiert werden, statt im Import still neue SQL-/Seed-Dateien zu erfinden.
- Supabase-Projekt-Secrets bleiben in Supabase/GitHub Secrets/lokaler `.env`, nicht im Repo.
- GitHub Actions referenzieren aktuell Remote-Function-URLs und Service-Role-Secrets; sie muessen fuer den Source-Import nicht zwingend geaendert werden.
- Deploy-Kommandos muessen nach Import bewusst mit neuem Workdir geprueft werden, bevor sie als Standard gelten.

## Tool Permissions

Allowed:

- Read-only-Scans im externen Backend-Workspace.
- Kopieren produktiver Source-Dateien nach `backend/supabase/...`.
- Erstellen von `backend/README.md`.
- `.gitignore` ergaenzen.
- Deno-Checks gegen `backend/supabase/functions/*/index.ts`.
- Hash-/Content-Vergleich gegen `C:/Users/steph/Projekte/midas-backend/supabase/functions/*/index.ts`.
- Secret-/Artefakt-Scans gegen `backend/`.
- Doku-/QA-Updates fuer aktive Source-of-Truth-Dateien.

Forbidden:

- Secrets anzeigen oder committen.
- `supabase.exe`, `*.exe.bak`, `.temp`, `.vscode`, `*.bak`, generische externe README oder leeres `package-lock.json` importieren.
- Externe Backend-Dateien loeschen.
- Importierte Function-Dateien im selben Schritt fachlich editieren.
- Edge-Function-Fachlogik aendern.
- SQL/RLS/Datenmodell aendern.
- GitHub Actions deployen oder Supabase Functions deployen ohne explizite User-Freigabe.
- Historische Archiv-Roadmaps massenhaft umschreiben.

## Execution Mode

- Kompakt, aber sequenziell: `S1` bis `S6`.
- S1/S2/S3 duerfen kurz bleiben, weil der Backend-Deno-Sweep gerade abgeschlossen wurde.
- S4 ist der eigentliche Importblock und wird substepweise umgesetzt.
- S5 prueft neue Repo-Pfade, Gitignore, Secret-/Artefakt-Grenzen und Deno.
- S6 synchronisiert Doku/QA und entscheidet Archiv/Commit.

## Vorab Contract Review 01.05.2026

Review-Frage:

- Ist die Roadmap eng genug, um den Backend-Source ins Repo zu holen, ohne daraus einen Backend-Refactor, Secret-Risiko oder Deploy-Umbau zu machen?

Entscheidung:

- Ja, mit folgenden Schaerfungen:
  - Importierte `index.ts`-Dateien muessen gegen den externen Source per Hash oder Bytevergleich verifiziert werden.
  - `supabase/config.toml` wird nur als CLI-/Local-Stack-Konfiguration importiert; fehlende lokale Seeds/Migrations duerfen nicht als stiller SQL-Scope ergaenzt werden.
  - Da `.vscode/tasks.json` nicht importiert wird, muss `backend/README.md` die relevanten Deploy-Hinweise repo-neutral dokumentieren.
  - S4 darf kopieren, aber nicht im selben Schritt Edge-Function-Fachlogik editieren.
  - S5 muss bestaetigen, dass keine Binaries, `.temp`, `.bak`, `.env` oder IDE-Dateien im Import gelandet sind.

Findings:

- CR-F1: Byte-/Hash-Gleichheit war als Check noch nicht explizit genug.
- CR-F2: `config.toml` koennte als vollstaendiger lokaler Supabase-Stack missverstanden werden.
- CR-F3: Ausschluss von `.vscode/tasks.json` entfernt lokale Deploy-Hilfen; Ersatzdokumentation in `backend/README.md` ist noetig.
- CR-F4: S4 brauchte eine explizite Sperre gegen gleichzeitige Fachlogik-Edits.

Korrektur:

- CR-F1 bis CR-F4 wurden in Zieldefinition, Scope, Architektur-Constraints, Tool Permissions, S2, S4 und S5 eingearbeitet.

## Statusmatrix

| ID | Schritt | Status | Ergebnis/Notiz |
|---|---|---|---|
| S1 | Inventar und Import-Vertrag | DONE | Importvertrag abgeschlossen: acht Function-`index.ts` plus `supabase/config.toml`; Artefakte, Temp, IDE, Backups und generische Root-Dateien ausgeschlossen. |
| S2 | Zielstruktur und Guardrail Review | DONE | Zielstruktur, Backend-Gitignore-Regeln, Deno-/Deploy-Vertrag und Doku-Pfadstrategie festgelegt. |
| S3 | Bruchrisiko- und Umsetzungsreview | DONE | Secret-/Artefakt-/Pfad-/Content-/Deploy-Risiken geprueft; S4/S5-Auftraege konkretisiert. |
| S4 | Import und Strukturumsetzung | DONE | Backend-Source copy-only importiert, README/Gitignore angelegt, Artefaktgrenzen und Hash-Gleichheit bestaetigt. |
| S5 | Checks und Contract Review | DONE | Deno, Hash-/Content-Vergleich, Secret-/Artefakt-Scan, Diff Review und Deploy-Nichtausfuehrung geprueft. |
| S6 | Doku-/QA-Sync und Abschluss | DONE | Aktive Overviews/QA synchronisiert, finaler Contract Review gruen, Roadmap commit-/archivbereit. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Vorab-Inventar 01.05.2026

Externer Backend-Workspace:

| Kategorie | Dateien | Groesse / Hinweis | Entscheidungsvorschlag |
|---|---:|---:|---|
| `supabase/functions` produktiver Source | 8 `index.ts` + 2 Begleitdateien | ca. 200 KB | `index.ts` importieren |
| `supabase/config.toml` | 1 | ca. 13 KB | nach Secret-Review importieren |
| `.vscode` | 3 | ca. 3 KB | nicht importieren; hoechstens README-Hinweise ableiten |
| CLI-Binaries | 2 | ca. 190 MB | nicht importieren |
| `supabase/.temp` | 8 | klein, lokal/projektbezogen | nicht importieren |
| externe README/LICENSE/package-lock | 3 | generisch/leer | nicht importieren |
| `midas-vision/index.ts.bak` | 1 | Backup/Altdatei | nicht importieren |

Produktive Functions:

| Function | Zeilen ca. | Zielpfad |
|---|---:|---|
| `midas-assistant` | 556 | `backend/supabase/functions/midas-assistant/index.ts` |
| `midas-incident-push` | 920 | `backend/supabase/functions/midas-incident-push/index.ts` |
| `midas-monthly-report` | 1128 | `backend/supabase/functions/midas-monthly-report/index.ts` |
| `midas-protein-targets` | 443 | `backend/supabase/functions/midas-protein-targets/index.ts` |
| `midas-transcribe` | 262 | `backend/supabase/functions/midas-transcribe/index.ts` |
| `midas-trendpilot` | 1329 | `backend/supabase/functions/midas-trendpilot/index.ts` |
| `midas-tts` | 160 | `backend/supabase/functions/midas-tts/index.ts` |
| `midas-vision` | 442 | `backend/supabase/functions/midas-vision/index.ts` |

## S1 - Inventar und Import-Vertrag

Ziel:

- Externen Backend-Workspace final klassifizieren.
- Importliste und Ausschlussliste bestaetigen.
- Noch keine produktiven Dateien kopieren.

Substeps:

- S1.1 README und relevante Backend-Deno-Roadmap lesen.
- S1.2 Externen Backend-Workspace scannen.
- S1.3 Produktiven Source identifizieren.
- S1.4 Ausschlussliste fuer Artefakte bestaetigen.
- S1.5 `supabase/config.toml` auf Secret-/Projektwert-Risiko reviewen.
- S1.6 S1 Contract Review.
- S1.7 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Finale Import-/Exclude-Liste.

Exit-Kriterium:

- Es ist klar, was nach `backend/` kopiert wird und was nicht.

### S1 Ergebnisprotokoll 01.05.2026

Durchgefuehrt:

- S1.1 Roadmap, referenzierte Backend-Deno-Check-Roadmap und externe Backend-Quellen erneut gelesen.
- S1.2 Externen Workspace `C:/Users/steph/Projekte/midas-backend` gescannt.
- S1.3 Produktiven Source von Tooling-/Cache-/Backup-Dateien getrennt.
- S1.4 Ausschlussliste gegen Ist-Zustand abgeglichen.
- S1.5 `supabase/config.toml` auf Secret- und Projektwert-Risiken geprueft.
- S1.6 Contract Review fuer S1 durchgefuehrt.
- S1.7 Schritt-Abnahme und Commit-Empfehlung dokumentiert.

Finale S1-Importliste fuer S4:

- `supabase/config.toml` nach `backend/supabase/config.toml`, sofern S2 die Zielstruktur-/Guardrail-Regeln unveraendert bestaetigt.
- `supabase/functions/midas-assistant/index.ts` nach `backend/supabase/functions/midas-assistant/index.ts`.
- `supabase/functions/midas-incident-push/index.ts` nach `backend/supabase/functions/midas-incident-push/index.ts`.
- `supabase/functions/midas-monthly-report/index.ts` nach `backend/supabase/functions/midas-monthly-report/index.ts`.
- `supabase/functions/midas-protein-targets/index.ts` nach `backend/supabase/functions/midas-protein-targets/index.ts`.
- `supabase/functions/midas-transcribe/index.ts` nach `backend/supabase/functions/midas-transcribe/index.ts`.
- `supabase/functions/midas-trendpilot/index.ts` nach `backend/supabase/functions/midas-trendpilot/index.ts`.
- `supabase/functions/midas-tts/index.ts` nach `backend/supabase/functions/midas-tts/index.ts`.
- `supabase/functions/midas-vision/index.ts` nach `backend/supabase/functions/midas-vision/index.ts`.

Import-Vertrag:

- S4 darf die produktiven Dateien nur strukturell ins Repo uebernehmen; keine funktionalen Edits an den Functions im selben Schritt.
- S5 muss die importierten `index.ts` und `config.toml` gegen den externen Source per Hash oder gleichwertigem Inhaltsvergleich bestaetigen.
- Falls beim Import Pfad-, Encoding- oder Zeilenendungsabweichungen entstehen, muessen sie im Contract Review sichtbar dokumentiert werden.

Finale Ausschlussliste:

- `supabase.exe` und `supabase-2.62.5.exe.bak`: lokale CLI-Binaries, nicht repo-faehig.
- `supabase/.temp/*`: lokale Supabase-Projekt-/Pooler-/Version-Metadaten, nicht importieren und keine Werte dokumentieren.
- `.vscode/*`: lokale IDE-Konfiguration; `tasks.json` nur als Quelle fuer README-Hinweise auswerten.
- Externe Root-Dateien `README.md`, `LICENSE`, `package-lock.json`: generisch bzw. nicht produktiver MIDAS-Source.
- `supabase/functions/midas-assistant/voice-assistant-roadmap.md`: Referenz-/Arbeitsdokument, nicht Teil des Backend-Imports.
- `supabase/functions/midas-vision/index.ts.bak`: Backup/Altdatei, nicht importieren.

`config.toml` Review:

- Es wurden keine realen Secret-Werte gefunden; Secret-nahe Felder verwenden `env(...)`-Platzhalter oder kommentierte Beispielwerte.
- `project_id = "midas-backend"` ist ein lokaler Supabase-Projektname, kein Produktions-Secret.
- Die Datei enthaelt lokale Ports und Supabase-Defaults; Import bedeutet daher nur "Backend-Source liegt im Repo", nicht "vollstaendiger lokaler Supabase-Stack ist startklar".
- `sql_paths = ["./seed.sql"]` referenziert eine Seed-Datei, die im externen Workspace nicht vorhanden ist. S2/S4 muessen das im README als lokalen CLI-Caveat dokumentieren; es wird keine Seed-Datei erfunden.

Findings und Korrektur:

- S1-F1: `supabase/.temp` enthaelt lokale Projektmetadaten. Korrektur: bleibt ausgeschlossen und wird spaeter per `.gitignore` abgesichert.
- S1-F2: externe Root-README/LICENSE/package-lock liefern keinen MIDAS-Backend-Vertrag. Korrektur: nicht importieren; stattdessen eigenes `backend/README.md` in S4.
- S1-F3: `config.toml` hat eine fehlende Seed-Referenz. Korrektur: als Caveat in S2/S4 aufnehmen, keine Datei nachbauen.
- S1-F4: `.vscode/tasks.json` enthaelt nutzbare Deploy-Hinweise. Korrektur: nicht importieren, aber README-Hinweise daraus ableiten.
- S1-F5: Die erste S1-Fassung enthielt noch keinen expliziten Byte-for-byte-/Hash-Vertrag fuer den Import. Korrektur: S4 bleibt Copy-only, S5 muss den Inhaltsvergleich gegen den externen Source bestaetigen.

S1 Contract Review:

- S1 blieb read-only gegen den externen Backend-Source; es wurden keine Backend-Dateien kopiert.
- Keine Secrets, Temp-Werte, Binaries, Backups oder IDE-Dateien wurden in die Importliste aufgenommen.
- Die Zielstruktur fuer produktiven Source ist eindeutig und kann in S2/S4 ohne Scope-Ausweitung umgesetzt werden.
- Die `config.toml` ist aus S1-Sicht importierbar, bleibt aber bis S2 an die finalen Guardrail-Regeln fuer Zielstruktur, Gitignore und README-Caveat gebunden.
- Der Import wird als Quelltext-Integration behandelt, nicht als Backend-Logik-Refaktor.

S1 Abschluss:

- S1 ist abgeschlossen.
- Commit-Empfehlung: noch kein separater Commit noetig; sinnvoller Commit nach S2/S3 oder nach dem eigentlichen Import in S4.

## S2 - Zielstruktur und Guardrail Review

Ziel:

- Zielstruktur und Tooling-Vertrag festlegen.

Substeps:

- S2.1 Zielstruktur `backend/supabase/...` bestaetigen.
- S2.2 `.gitignore`-Regeln fuer Backend-Artefakte definieren.
  - `backend/supabase/.temp/`
  - `backend/**/*.env`
  - `backend/**/*.exe`
  - `backend/**/*.bak`
  - `backend/**/signing_keys*.json`
  - `backend/**/*.pem`
  - `backend/**/*.key`
- S2.3 Deno-Check-Kommandos fuer neue Pfade definieren.
- S2.4 Deploy-Hinweis entscheiden:
  - kein Deploy in dieser Roadmap ohne explizite Freigabe.
  - moegliche spaetere Workdir-Form dokumentieren.
  - keine Abhaengigkeit von importierter `.vscode/tasks.json`.
- S2.5 Doku-Pfadstrategie festlegen:
  - aktive Dokus auf relative Repo-Pfade.
  - historische Archivdokus nicht massenhaft anfassen.
- S2.6 S2 Contract Review.
- S2.7 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Belastbarer Importvertrag.

Exit-Kriterium:

- S4 kann importieren, ohne Grundsatzfragen offen zu lassen.

### S2 Ergebnisprotokoll 01.05.2026

Durchgefuehrt:

- S2.1 Zielstruktur `backend/supabase/...` bestaetigt.
- S2.2 bestehende `.gitignore`-Regeln gelesen und backend-spezifische Erweiterungen definiert.
- S2.3 Deno-Check-Kommandos fuer neue Repo-Pfade festgelegt.
- S2.4 Deploy-Hinweis aus externer `.vscode/tasks.json` ausgewertet und repo-neutral entschieden.
- S2.5 Doku-Pfadstrategie fuer aktive und historische Dokumente festgelegt.
- S2.6 Contract Review fuer S2 durchgefuehrt.
- S2.7 Schritt-Abnahme und Commit-Empfehlung dokumentiert.

Zielstruktur-Vertrag:

- `backend/supabase/config.toml`
- `backend/supabase/functions/midas-assistant/index.ts`
- `backend/supabase/functions/midas-incident-push/index.ts`
- `backend/supabase/functions/midas-monthly-report/index.ts`
- `backend/supabase/functions/midas-protein-targets/index.ts`
- `backend/supabase/functions/midas-transcribe/index.ts`
- `backend/supabase/functions/midas-trendpilot/index.ts`
- `backend/supabase/functions/midas-tts/index.ts`
- `backend/supabase/functions/midas-vision/index.ts`
- `backend/README.md`

Gitignore-Vertrag fuer S4:

- Die bestehende `.gitignore` schuetzt bereits `.env`, `.env.*`, `.env.supabase.local`, Root-`supabase/.temp/`, `.vscode/`, `.idea/`, `*.tmp` und Keystore-Dateien.
- S4 muss backend-spezifisch ergaenzen:
  - `backend/supabase/.temp/`
  - `backend/**/*.env`
  - `backend/**/*.exe`
  - `backend/**/*.bak`
  - `backend/**/signing_keys*.json`
  - `backend/**/*.pem`
  - `backend/**/*.key`
- Die Regeln sind bewusst enger als ein pauschales `backend/**`, damit produktiver Source unter `backend/supabase/functions/**/index.ts` versionierbar bleibt.

Deno-Check-Vertrag fuer S5:

- Pflichtcheck je Function:
  - `deno check backend/supabase/functions/<function>/index.ts`
- Erwartete Functions:
  - `midas-assistant`
  - `midas-incident-push`
  - `midas-monthly-report`
  - `midas-protein-targets`
  - `midas-transcribe`
  - `midas-trendpilot`
  - `midas-tts`
  - `midas-vision`
- S5 darf bekannte Runtime-/Remote-Deploy-Fragen nicht als lokalen Deno-Check ersetzen; lokaler Check ist nur statische Absicherung.

Deploy-Vertrag:

- Kein Deploy ist Teil dieser Roadmap ohne explizite User-Freigabe.
- Die externe `.vscode/tasks.json` wird nicht importiert.
- Das spaetere `backend/README.md` muss die repo-neutrale Form dokumentieren:
  - Supabase CLI bleibt extern installiert oder im PATH, nicht im Repo.
  - Deploy-Workdir ist nach Import `backend/supabase`.
  - Beispiel-Form: `supabase functions deploy <function>` aus `backend/supabase`.
  - Alternativ kann lokal ein absoluter/externer CLI-Pfad genutzt werden; dieser Pfad gehoert nicht in die Repo-Doku als Pflichtwert.
- GitHub Actions rufen derzeit produktive Function-URLs per `curl` und Secrets auf. Fuer den Source-Import ist kein Workflow-Umbau noetig.

Doku-Pfadstrategie:

- Aktive Source-of-Truth-Dokumente duerfen nach S4/S6 auf relative Repo-Pfade wie `backend/supabase/functions/.../index.ts` zeigen.
- Historische Archiv-Roadmaps werden nicht massenhaft umgeschrieben.
- Der externe Pfad `C:/Users/steph/Projekte/midas-backend` bleibt in dieser Roadmap als Importquelle dokumentiert, ist aber nach erfolgreichem Import nicht mehr produktiver Source-of-Truth.
- `backend/README.md` wird der technische Einstieg fuer Backend-Source, Checks, Deploy-Grenzen und Artefakt-Ausschluesse.

`config.toml` Guardrail:

- S2 bestaetigt den Import von `supabase/config.toml` unter dem S1-Caveat: Die Datei ist CLI-/Local-Stack-Konfiguration, kein Beweis fuer einen vollstaendig startklaren lokalen Supabase-Stack.
- Die fehlende `seed.sql` wird nicht erzeugt. Sie wird im `backend/README.md` als nicht importierter Local-Stack-Teil/Caveat dokumentiert.

Findings und Korrektur:

- S2-F1: Die bestehende `.gitignore` schuetzt Root-`supabase/.temp/`, aber noch nicht `backend/supabase/.temp/`. Korrektur: backend-spezifische Ignore-Regeln fuer S4 festgelegt.
- S2-F2: Externe `.vscode/tasks.json` nutzt `.\supabase.exe` und Workspace-Root des externen Backend-Ordners. Korrektur: keine IDE-Datei importieren; README beschreibt CLI/Workdir repo-neutral.
- S2-F3: `config.toml` kann wegen `seed.sql`-Referenz als kompletter Local-Stack missverstanden werden. Korrektur: README-Caveat fuer S4 verpflichtend.
- S2-F4: GitHub Actions koennten faelschlich als Teil des Imports betrachtet werden. Korrektur: kein Workflow-Umbau in S2/S4; Actions bleiben URL-/Secret-Caller.

S2 Contract Review:

- S2 erzeugt keine Backend-Dateien und fuehrt keinen Deploy aus.
- S4 hat jetzt genug Vertrag, um Copy-only zu importieren, `.gitignore` gezielt zu erweitern und `backend/README.md` ohne Grundsatzfragen anzulegen.
- S5 hat klare Checkpflichten: Deno pro Function, Hash-/Content-Vergleich, Artefakt-/Secret-Scan.
- Keine S2-Entscheidung erweitert den Scope auf Fachlogik, SQL, RLS, Frontend oder GitHub-Actions-Umbau.

S2 Abschluss:

- S2 ist abgeschlossen.
- Commit-Empfehlung: weiterhin kein separater Commit noetig; naechster sinnvoller Commit nach S3 oder S4.

## S3 - Bruchrisiko- und Umsetzungsreview

Ziel:

- Risiken vor dem Kopieren abfangen.

Substeps:

- S3.1 Secret-Risiko pruefen:
  - `.env`
  - Key-Dateien
  - Tokens
  - CLI-Temp/Project-Ref
- S3.2 Artefakt-Risiko pruefen:
  - `.exe`
  - `.bak`
  - `.temp`
  - `.vscode`
- S3.3 Pfad-Drift-Risiko pruefen:
  - aktive Module Overviews
  - QA
  - Workflows
- S3.4 Content-Drift-Risiko pruefen:
  - Import darf keine fachlichen Diffs erzeugen.
  - Hash-/Content-Vergleich wird Pflichtcheck in S5.
- S3.5 Deploy-Verwirrung vermeiden:
  - neue Source-of-Truth-Pfade klar dokumentieren.
  - kein automatischer Deploy.
- S3.6 S4-Substeps konkretisieren.
- S3.7 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Risiko-Checkliste fuer S4/S5.

Exit-Kriterium:

- Import kann ohne versehentlichen Artefakt-/Secret-/Deploy-Schaden erfolgen.

### S3 Ergebnisprotokoll 01.05.2026

Durchgefuehrt:

- S3.1 Secret-Risiko gegen externen Backend-Tree geprueft.
- S3.2 Artefakt-Risiko gegen externe Datei- und Ordnerstruktur geprueft.
- S3.3 Pfad-Drift in aktiven Dokus, QA und Workflows gescannt.
- S3.4 Content-Drift-Risiko fuer Copy-only-Import bewertet.
- S3.5 Deploy-Verwirrung gegen Workflows und externe VS-Code-Tasks abgegrenzt.
- S3.6 S4-Substeps konkretisiert.
- S3.7 Schritt-Abnahme und Commit-Empfehlung dokumentiert.

Secret-Risiko:

- Es wurden im externen Importscope keine `.env`, `.pem`, `.key` oder `signing_keys*.json`-Dateien gefunden.
- Die Functions verwenden erwartete Runtime-Secrets via `Deno.env.get(...)`, z. B. Supabase-, OpenAI- und VAPID-/Scheduler-Werte. Das ist produktiver Codevertrag, kein Secret-Leak.
- `supabase/config.toml` nutzt Secret-nahe Werte als `env(...)`-Platzhalter oder kommentierte Beispiele.
- `supabase/.temp/project-ref` und `supabase/.temp/pooler-url` existieren und werden nicht importiert; Werte werden nicht dokumentiert.

Artefakt-Risiko:

- Externe Artefakte sind vorhanden und bleiben ausgeschlossen:
  - `supabase.exe`
  - `supabase-2.62.5.exe.bak`
  - `supabase/.temp/*`
  - `.vscode/*`
  - `supabase/functions/midas-vision/index.ts.bak`
  - externe Root-Dateien `README.md`, `LICENSE`, `package-lock.json`
  - `supabase/functions/midas-assistant/voice-assistant-roadmap.md`
- Im MIDAS-Repo existiert aktuell kein `backend/`-Ordner; S4 legt ihn neu und kontrolliert an.

Pfad-Drift-Risiko:

- Aktive Dokus mit externen oder alten Function-Pfaden:
  - `docs/QA_CHECKS.md`
  - `docs/modules/Doctor View Module Overview.md`
  - `docs/modules/Reports Module Overview.md`
  - `docs/modules/Push Module Overview.md`
  - `docs/modules/Protein Module Overview.md`
  - `docs/modules/Trendpilot Module Overview.md`
- Workflows `.github/workflows/incidents-push.yml`, `monthly-report.yml`, `protein-targets.yml` und `trendpilot.yml` rufen Remote-URLs per Secret auf und referenzieren keinen lokalen Backend-Source-Pfad. Kein Umbau fuer S4 erforderlich.
- Pfad-Drift wird in S6 fuer aktive Dokus korrigiert; historische Archivdokus bleiben unveraendert.

Content-Drift-Risiko:

- S4 darf importierte `index.ts` und `config.toml` nicht fachlich bearbeiten.
- S5 muss Hash-/Content-Gleichheit zwischen externem Source und Repo-Import pruefen.
- `.gitattributes` erzwingt LF fuer Text; falls Git Zeilenendungen normalisiert, muss S5 entweder nach Working-Tree-Inhalt vergleichen oder eine dokumentierte Normalisierungsabweichung ausweisen.

Deploy-Verwirrung:

- Externe `.vscode/tasks.json` deployt bisher ueber `.\supabase.exe` aus dem externen Workspace.
- S4 importiert keine Task-Datei und keine CLI-Binary.
- `backend/README.md` muss spaetere Deploys als bewusste manuelle Aktion dokumentieren; kein Deploy wird in S4/S5/S6 ohne explizite User-Freigabe ausgefuehrt.

Konkretisierte S4-Reihenfolge:

1. Vor dem Kopieren bestaetigen, dass kein unerwarteter `backend/`-Inhalt ueberschrieben wird.
2. `.gitignore` um die in S2 festgelegten Backend-Artefaktregeln erweitern.
3. `backend/supabase/functions/<function>/` fuer alle acht Functions anlegen.
4. Acht freigegebene `index.ts`-Dateien copy-only uebernehmen.
5. `supabase/config.toml` copy-only nach `backend/supabase/config.toml` uebernehmen.
6. `backend/README.md` erstellen und die S2/S3-Caveats dokumentieren.
7. Direkt nach dem Kopieren per Dateiliste pruefen, dass keine ausgeschlossenen Artefakte im `backend/`-Tree liegen.
8. Keine importierten Function-Dateien im selben Schritt fachlich editieren.

Findings und Korrektur:

- S3-F1: `.temp` enthaelt lokale Projekt-/Pooler-Metadaten. Korrektur: bleibt ausgeschlossen; S4/S5 pruefen explizit, dass kein `.temp` im Backend-Tree landet.
- S3-F2: Aktive Dokus verweisen noch auf externe Backend-Pfade. Korrektur: S6 muss diese aktiven Source-of-Truth-Dokus nach Import auf relative Repo-Pfade umstellen.
- S3-F3: Git-Zeilenendungsnormalisierung kann Bytevergleich irritieren. Korrektur: S5 muss Hash-/Content-Vergleich bewusst als Working-Tree-/Inhaltsvergleich dokumentieren oder Normalisierungsabweichungen sichtbar machen.
- S3-F4: Externe Deploy-Tasks enthalten workspace- und binary-spezifische Annahmen. Korrektur: keine Task-Datei importieren; README beschreibt nur repo-neutrale Deploy-Form und Deploy-Verbot ohne Freigabe.

S3 Contract Review:

- S3 hat keine produktiven Backend-Dateien kopiert und keinen Deploy ausgefuehrt.
- Es wurden keine Secrets oder `.temp`-Werte in die Roadmap uebernommen.
- S4 ist als mechanischer Import ohne Fachlogik-Edit vorbereitet.
- S5/S6 haben klare Folgeauftraege fuer Inhaltsgleichheit, Artefaktgrenzen, Deno und Doku-Pfade.

S3 Abschluss:

- S3 ist abgeschlossen.
- Commit-Empfehlung: weiterhin kein separater Commit noetig; sinnvoller Commit nach S4/S5, wenn der Import und die Checks zusammen sichtbar sind.

## S4 - Import und Strukturumsetzung

Ziel:

- Produktiven Backend-Source in das MIDAS-Repo aufnehmen.

Substeps:

- S4.0 Vor dem Kopieren bestaetigen, dass kein unerwarteter `backend/`-Inhalt ueberschrieben wird.
- S4.1 `backend/supabase/functions` anlegen.
- S4.2 Acht produktive `index.ts`-Dateien kopieren.
- S4.3 `backend/supabase/config.toml` kopieren, falls S1/S2 freigegeben.
  - Falls `config.toml` lokale Seeds/Migrations referenziert, aber diese nicht importiert werden, im README/Protokoll als nicht genutzter Local-Stack-Teil dokumentieren.
- S4.4 `backend/README.md` erstellen:
  - Source-of-Truth
  - Deno-Checks
  - Deploy-Hinweise
  - Secret-/Artefakt-Grenzen
  - CLI bleibt extern; keine `supabase.exe` im Repo
  - Ersatz fuer relevante `.vscode/tasks.json`-Deploy-Hinweise ohne IDE-Abhaengigkeit
- S4.5 `.gitignore` fuer Backend-Artefakte haerten.
- S4.6 Keine `.bak`, `.temp`, `.exe`, `.vscode` oder externen generischen Root-Dateien importieren.
- S4.7 Keine fachlichen Edits in importierten `index.ts`-Dateien vornehmen.
- S4.8 S4 Contract Review.
- S4.9 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Backend-Source ist versionierbar im MIDAS-Repo vorhanden.

Exit-Kriterium:

- `backend/` enthaelt nur freigegebenen produktiven Source und ggf. kleine Projektdoku.

### S4.1 Ergebnisprotokoll 01.05.2026

Durchgefuehrt:

- S4.0 geprueft: Vor S4.1 existierte weder `backend/` noch `backend/supabase/functions`.
- S4.1 umgesetzt: `backend/supabase/functions` wurde angelegt.
- Es wurden noch keine Backend-Source-Dateien kopiert.
- Es wurden keine Platzhalterdateien wie `.gitkeep` angelegt; die Ordner werden ab S4.2/S4.3 durch echte Source-Dateien versionierbar.

Review S4.1:

- Kein bestehender `backend/`-Inhalt wurde ueberschrieben.
- Keine `.temp`, `.vscode`, `.exe`, `.bak`, `.env` oder externen Root-Dateien wurden importiert.
- S4.1 bleibt innerhalb des Vertrags: reine Zielstruktur-Vorbereitung, kein Code-Import, kein Deploy.

Findings und Korrektur:

- S4.1-F1: Leere Ordner sind in Git nicht sichtbar. Korrektur: Kein kuenstlicher Platzhalter; S4.2/S4.3 machen die Struktur durch produktive Dateien sichtbar.

### S4.2 Ergebnisprotokoll 01.05.2026

Durchgefuehrt:

- S4.2 umgesetzt: acht freigegebene produktive `index.ts`-Dateien wurden copy-only importiert.
- Zielpfade:
  - `backend/supabase/functions/midas-assistant/index.ts`
  - `backend/supabase/functions/midas-incident-push/index.ts`
  - `backend/supabase/functions/midas-monthly-report/index.ts`
  - `backend/supabase/functions/midas-protein-targets/index.ts`
  - `backend/supabase/functions/midas-transcribe/index.ts`
  - `backend/supabase/functions/midas-trendpilot/index.ts`
  - `backend/supabase/functions/midas-tts/index.ts`
  - `backend/supabase/functions/midas-vision/index.ts`
- Nicht importiert:
  - `supabase/functions/midas-assistant/voice-assistant-roadmap.md`
  - `supabase/functions/midas-vision/index.ts.bak`
  - sonstige externe Root-/Tooling-/Temp-Dateien

Review S4.2:

- Dateiliste unter `backend/supabase/functions` enthaelt genau die acht erwarteten `index.ts`.
- SHA256-Vergleich gegen den externen Source ist fuer alle acht Functions identisch.
- Artefakt-Scan gegen `backend/` fand keine `.bak`, `.env`, `.exe`, `.pem`, `.key`, `.temp` oder `.vscode`.
- Es wurden keine fachlichen Edits an den importierten Functions vorgenommen.
- Es wurde kein Deploy ausgefuehrt.

Findings und Korrektur:

- Keine offenen Findings in S4.2.

### S4.3 Ergebnisprotokoll 01.05.2026

Durchgefuehrt:

- S4.3 umgesetzt: `supabase/config.toml` wurde copy-only nach `backend/supabase/config.toml` importiert.
- Die in S1/S2 freigegebene Guardrail bleibt aktiv: `config.toml` ist CLI-/Local-Stack-Konfiguration, kein Nachweis fuer einen vollstaendig startklaren lokalen Supabase-Stack.
- Es wurde keine `seed.sql` erzeugt.

Review S4.3:

- SHA256-Vergleich gegen den externen Source ist fuer `config.toml` identisch.
- `backend/supabase/config.toml` enthaelt erwartete `env(...)`-Platzhalter und kommentierte Beispielwerte, aber keine neu eingefuegten Secret-Dateien.
- `sql_paths = ["./seed.sql"]` ist weiterhin vorhanden; `backend/supabase/seed.sql` existiert nicht. Das ist der bekannte Local-Stack-Caveat und wird in S4.4 im README dokumentiert.
- Artefakt-Scan gegen `backend/` fand keine `.bak`, `.env`, `.exe`, `.pem`, `.key`, `.temp` oder `.vscode`.
- Es wurde kein Deploy ausgefuehrt.

Findings und Korrektur:

- S4.3-F1: `config.toml` referenziert weiterhin `./seed.sql`, aber die Datei ist nicht Teil des externen freigegebenen Imports. Korrektur: keine Seed-Datei erzeugen; Caveat in S4.4-README aufnehmen.

### S4.4 Ergebnisprotokoll 01.05.2026

Durchgefuehrt:

- S4.4 umgesetzt: `backend/README.md` wurde erstellt.
- Dokumentiert wurden:
  - Source-of-Truth fuer `backend/supabase/config.toml` und alle acht Functions.
  - Deno-Check-Kommandos fuer alle acht neuen Repo-Pfade.
  - Deploy-Vertrag: kein Deploy ohne explizite Freigabe.
  - Supabase CLI bleibt extern oder im `PATH`; keine `supabase.exe` im Repo.
  - Repo-neutrale Deploy-Form aus `backend/supabase`.
  - Secret-/Artefakt-Grenzen.
  - `seed.sql`-/Local-Stack-Caveat aus `config.toml`.

Review S4.4:

- `backend/README.md` ersetzt die relevanten Hinweise aus externer `.vscode/tasks.json`, ohne IDE- oder Binary-Abhaengigkeit zu importieren.
- Der `seed.sql`-Caveat aus S4.3 ist dokumentiert; es wurde weiterhin keine `seed.sql` erzeugt.
- Artefakt-Scan gegen `backend/` fand keine `.bak`, `.env`, `.exe`, `.pem`, `.key`, `.temp` oder `.vscode`.
- `git diff --check` fuer `backend/README.md` ist sauber.
- Es wurde kein Deploy ausgefuehrt.

Findings und Korrektur:

- Keine offenen Findings in S4.4.

### S4.5 Ergebnisprotokoll 01.05.2026

Durchgefuehrt:

- S4.5 umgesetzt: `.gitignore` wurde um Backend-Supabase-Artefaktregeln erweitert.
- Ergaenzte Regeln:
  - `backend/supabase/.temp/`
  - `backend/**/*.env`
  - `backend/**/*.exe`
  - `backend/**/*.bak`
  - `backend/**/signing_keys*.json`
  - `backend/**/*.pem`
  - `backend/**/*.key`

Review S4.5:

- `git check-ignore` bestaetigt, dass typische Backend-Artefakte ignoriert werden:
  - `backend/supabase/.temp/project-ref`
  - `backend/local.env`
  - `backend/supabase/supabase.exe`
  - `backend/supabase/functions/midas-vision/index.ts.bak`
  - `backend/supabase/signing_keys.json`
  - `backend/supabase/cert.pem`
  - `backend/supabase/private.key`
- `git check-ignore` ignoriert produktiven Source nicht:
  - `backend/supabase/functions/midas-vision/index.ts`
  - `backend/supabase/config.toml`
  - `backend/README.md`
- Artefakt-Scan gegen `backend/` fand keine `.bak`, `.env`, `.exe`, `.pem`, `.key`, `.temp` oder `.vscode`.
- Es wurde kein Deploy ausgefuehrt.

Findings und Korrektur:

- S4.5-F1: `git diff --check` meldet lokal eine Zeilenendungswarnung fuer `.gitignore` (`LF`/`CRLF`). Korrektur: kein inhaltlicher Fehler; `.gitattributes` erzwingt fuer Textdateien `eol=lf`, S5 beobachtet den finalen Diff weiter.
- Keine offenen funktionalen Findings in S4.5.

### S4.6 Ergebnisprotokoll 01.05.2026

Durchgefuehrt:

- S4.6 umgesetzt: aktueller `backend/`-Tree wurde gegen verbotene Importklassen geprueft.
- Gepruefte Ausschluesse:
  - `.bak`
  - `.temp`
  - `.exe`
  - `.vscode`
  - `.env`
  - `.pem`
  - `.key`
  - externe Root-Dateien `LICENSE` und `package-lock.json`
  - externe Begleitdateien `voice-assistant-roadmap.md` und `midas-vision/index.ts.bak`

Review S4.6:

- `backend/` enthaelt exakt die freigegebenen zehn Dateien:
  - `backend/README.md`
  - `backend/supabase/config.toml`
  - acht `backend/supabase/functions/<function>/index.ts`
- Geschärfter Artefakt-Scan gegen `backend/` fand keine verbotenen Dateien oder Ordner.
- `backend/LICENSE`, `backend/package-lock.json`, `backend/supabase/functions/midas-assistant/voice-assistant-roadmap.md` und `backend/supabase/functions/midas-vision/index.ts.bak` existieren nicht.
- Es wurde kein Deploy ausgefuehrt.

Findings und Korrektur:

- S4.6-F1: Ein erster breiter Root-Datei-Scan markierte `backend/README.md`, weil externe Root-README-Dateien generell ausgeschlossen sind. Korrektur: als False Positive bewertet; `backend/README.md` ist explizit freigegebene Projektdoku aus S4.4.
- Keine offenen funktionalen Findings in S4.6.

### S4.7 Ergebnisprotokoll 01.05.2026

Durchgefuehrt:

- S4.7 umgesetzt: Import-Drift der acht `index.ts`-Dateien wurde geprueft.
- Es wurden keine importierten Function-Dateien editiert.
- Es wurde kein Deploy ausgefuehrt.

Review S4.7:

- SHA256-Vergleich gegen den externen Source ist weiterhin fuer alle acht importierten `index.ts` identisch.
- `git diff -- backend/supabase/functions` zeigt keine nachtraeglichen inhaltlichen Edits an bestehenden Function-Dateien; die Dateien sind neue copy-only Imports.
- Die bisherigen Aenderungen nach S4.2 betreffen nur `backend/supabase/config.toml`, `backend/README.md`, `.gitignore` und Roadmap-Doku, nicht die Function-Fachlogik.

Findings und Korrektur:

- Keine offenen Findings in S4.7.

### S4.8 Contract Review 01.05.2026

Review-Frage:

- Erfuellt der S4-Import den Roadmap-Vertrag, ohne Artefakte, Secrets, Deploys oder Fachlogik-Edits einzuschleppen?

Ergebnis:

- Ja.

Geprueft:

- `backend/` enthaelt exakt zehn erlaubte Dateien:
  - `backend/README.md`
  - `backend/supabase/config.toml`
  - acht `backend/supabase/functions/<function>/index.ts`
- Alle acht importierten Function-`index.ts` sind SHA256-identisch mit dem externen Source.
- `backend/supabase/config.toml` ist SHA256-identisch mit dem externen Source.
- `backend/README.md` dokumentiert Source-of-Truth, Deno-Checks, Deploy-Vertrag, externe Supabase CLI, Secret-/Artefaktgrenzen und den `seed.sql`-Caveat.
- `.gitignore` ignoriert typische Backend-Artefakte:
  - `backend/supabase/.temp/`
  - `backend/**/*.env`
  - `backend/**/*.exe`
  - `backend/**/*.bak`
  - `backend/**/signing_keys*.json`
  - `backend/**/*.pem`
  - `backend/**/*.key`
- `.gitignore` ignoriert produktiven Backend-Source nicht:
  - `backend/supabase/functions/midas-vision/index.ts`
  - `backend/supabase/config.toml`
  - `backend/README.md`
- Geschärfter Artefakt-Scan gegen `backend/` fand keine verbotenen Dateien oder Ordner.
- Es wurde kein Deploy ausgefuehrt.
- Es wurden keine fachlichen Edits an importierten Functions vorgenommen.

Findings und Korrektur:

- S4.8-F1: `git diff --check` meldet weiterhin eine lokale `.gitignore`-Zeilenendungswarnung (`LF`/`CRLF`). Korrektur: kein funktionaler S4-Blocker; `.gitattributes` erzwingt `eol=lf`, S5 prueft den finalen Diff weiter.
- Keine offenen funktionalen Findings in S4.8.

### S4.9 Abschluss 01.05.2026

Abnahme:

- S4 ist abgeschlossen.
- S4.0 bis S4.8 sind erledigt und dokumentiert.
- Der eigentliche Backend-Source liegt jetzt versionierbar im Repo unter `backend/supabase/...`.
- Der externe Backend-Workspace wurde nicht geloescht oder veraendert.
- Kein Commit wurde erstellt; Commit-Entscheidung bleibt fuer spaeter nach S5/S6 offen.

Naechster Schritt:

- S5 prueft den Import technisch: Deno-Checks, Hash-/Content-Vergleich, Secret-/Artefakt-Scan, Diff Review und Deploy-Nichtausfuehrung.

## S5 - Checks und Contract Review

Ziel:

- Import technisch und vertraglich pruefen.

Substeps:

- S5.1 `deno check` fuer alle acht neuen Repo-Pfade.
- S5.2 Hash-/Content-Vergleich:
  - externe `index.ts`-Dateien gegen importierte `backend/.../index.ts`
  - erwartetes Ergebnis: identisch
- S5.3 Secret-/Artefakt-Scan:
  - keine Secret-Werte
  - keine `.env`
  - keine `.exe`
  - keine `.bak`
  - keine `.temp`
- S5.4 `git diff --check`.
- S5.5 Git-Status reviewen:
  - erwartete neue `backend/`-Dateien
  - erwartete Doku-/QA-Dateien
  - keine Binaries
- S5.6 Contract Review:
  - keine Function-Fachlogik geaendert
  - keine Deploys
  - keine SQL-/Frontend-Aenderung
- S5.7 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Gepruefter Import.

Exit-Kriterium:

- Keine offenen P0/P1-Import-Findings.

### S5 Ergebnisprotokoll 01.05.2026

Durchgefuehrt:

- S5.1 `deno check` fuer alle acht neuen Repo-Pfade ausgefuehrt.
- S5.2 Hash-/Content-Vergleich fuer `config.toml` und alle acht `index.ts` ausgefuehrt.
- S5.3 Secret-/Artefakt-Scan gegen `backend/` ausgefuehrt.
- S5.4 `git diff --check` ausgefuehrt.
- S5.5 Git-Status und Diff-Umfang reviewed.
- S5.6 Contract Review durchgefuehrt.
- S5.7 Schritt-Abnahme und Commit-Empfehlung dokumentiert.

S5.1 Deno:

- Gruen:
  - `deno check backend/supabase/functions/midas-assistant/index.ts`
  - `deno check backend/supabase/functions/midas-incident-push/index.ts`
  - `deno check backend/supabase/functions/midas-monthly-report/index.ts`
  - `deno check backend/supabase/functions/midas-protein-targets/index.ts`
  - `deno check backend/supabase/functions/midas-transcribe/index.ts`
  - `deno check backend/supabase/functions/midas-trendpilot/index.ts`
  - `deno check backend/supabase/functions/midas-tts/index.ts`
  - `deno check backend/supabase/functions/midas-vision/index.ts`

S5.2 Hash-/Content:

- SHA256 identisch gegen externen Source:
  - `backend/supabase/config.toml`
  - `backend/supabase/functions/midas-assistant/index.ts`
  - `backend/supabase/functions/midas-incident-push/index.ts`
  - `backend/supabase/functions/midas-monthly-report/index.ts`
  - `backend/supabase/functions/midas-protein-targets/index.ts`
  - `backend/supabase/functions/midas-transcribe/index.ts`
  - `backend/supabase/functions/midas-trendpilot/index.ts`
  - `backend/supabase/functions/midas-tts/index.ts`
  - `backend/supabase/functions/midas-vision/index.ts`

S5.3 Secret-/Artefakt-Scan:

- Keine verbotenen Artefaktdateien gefunden:
  - keine `.env`
  - keine `.exe`
  - keine `.bak`
  - keine `.temp`
  - keine `.vscode`
  - keine `.pem`
  - keine `.key`
  - keine `signing_keys*.json`
- Keine privaten Schluessel oder erkannten literal API-/Service-Role-Token gefunden.
- Treffer auf `Deno.env.get(...)`, `env(...)`, `Authorization` und `Bearer` sind erwartete Runtime-Secret-Zugriffe im produktiven Source, keine eingecheckten Secret-Werte.

S5.4 Diff Check:

- `git diff --check` ist nach Korrektur gruen.

S5.5 Git-Status Review:

- Erwartet:
  - neuer `backend/`-Tree mit zehn freigegebenen Dateien.
  - `.gitignore` erweitert um Backend-Artefaktregeln.
  - Roadmap aktualisiert.
  - bereits vorhandene QA-/Archiv-Doku aus dem vorherigen Backend-Deno-Abschluss bleibt im Arbeitsstand.
- Kein unerwarteter App-/Frontend-/SQL-Dateistatus sichtbar.
- Keine Binaries im Git-Status.

Findings und Korrektur:

- S5-F1: Ein erster Secret-Regex war unter PowerShell falsch gequotet und brach den Scan ab. Korrektur: Scan mit robusteren Einzelmustern und `Select-String` wiederholt; keine literal Secrets gefunden.
- S5-F2: `.gitattributes` war als UTF-16 gespeichert und wurde von Git nicht als Attributdatei ausgewertet. Korrektur: `.gitattributes` mechanisch auf ASCII/UTF-8-kompatiblen Text normalisiert; Git erkennt jetzt `text=auto eol=lf`.
- S5-F3: `.gitignore` hatte gemischte Zeilenenden. Korrektur: `.gitignore` mechanisch auf LF normalisiert; `git diff --check` ist danach sauber.
- S5-F4: `docs/QA_CHECKS.md` hatte nach aktivierter `.gitattributes` noch CRLF/BOM-Normalisierung. Korrektur: Datei mechanisch auf UTF-8 ohne BOM und LF normalisiert; `git diff --check` ist danach sauber.

S5 Contract Review:

- Keine Function-Fachlogik wurde geaendert.
- Kein Deploy wurde ausgefuehrt.
- Keine SQL-/RLS-/Datenmodell-Aenderung wurde vorgenommen.
- Keine Frontend-Datei wurde geaendert.
- Importierte Backend-Dateien bleiben content-identisch zum externen Source.
- Secret-/Artefaktgrenzen sind eingehalten.
- Keine offenen P0/P1-Import-Findings.

S5 Abschluss:

- S5 ist abgeschlossen.
- Commit-Empfehlung: weiterhin noch kein Commit notwendig; sinnvoller Commit nach S6, wenn aktive Dokus/QA final auf den neuen Backend-Repo-Pfad synchronisiert sind.

## S6 - Doku-/QA-Sync und Abschluss

Ziel:

- Source-of-Truth-Dokus auf den neuen Repo-Stand bringen.

Substeps:

- S6.1 Aktive Module Overviews aktualisieren, wo sie absolute externe Backend-Pfade enthalten:
  - Push
  - Reports
  - Doctor View
  - Protein
  - Trendpilot, falls noetig
- S6.2 `docs/QA_CHECKS.md` auf neue relative `backend/...`-Deno-Checks ergaenzen oder korrigieren.
- S6.3 Roadmap-Ergebnisprotokolle aktualisieren.
- S6.4 Finaler Contract Review:
  - Roadmap vs. importierter Source
  - Roadmap vs. QA
  - Roadmap vs. Module Overviews
  - Roadmap vs. README-Guardrails
- S6.5 Abschluss-Abnahme:
  - keine offenen P0/P1-Risiken
  - externe Backend-Workspace-Rolle dokumentiert
  - keine Deploys offen, ausser bewusst als optional markiert
- S6.6 Commit-Empfehlung:
  - `chore(backend): vendor edge function source into repo`
- S6.7 Archiv-Entscheidung.

Output:

- Backend-Source, Doku, QA und Roadmap sprechen denselben neuen Repo-Vertrag.

Exit-Kriterium:

- Roadmap ist commit- oder archivbereit.

### S6 Ergebnisprotokoll 01.05.2026

Durchgefuehrt:

- S6.1 aktive Module Overviews auf neue relative Backend-Pfade aktualisiert.
- S6.2 `docs/QA_CHECKS.md` auf neue relative `backend/...`-Deno-Checks aktualisiert.
- S6.3 Roadmap-Ergebnisprotokolle aktualisiert.
- S6.4 finaler Contract Review durchgefuehrt.
- S6.5 Abschluss-Abnahme dokumentiert.
- S6.6 Commit-Empfehlung dokumentiert.
- S6.7 Archiv-Entscheidung dokumentiert.

Aktualisierte aktive Dokus:

- `docs/modules/Push Module Overview.md`
- `docs/modules/Reports Module Overview.md`
- `docs/modules/Doctor View Module Overview.md`
- `docs/modules/Protein Module Overview.md`
- `docs/modules/Trendpilot Module Overview.md`
- `docs/QA_CHECKS.md`

Doku-Sync:

- Alte externe Backend-Pfade wurden aus aktiven Module Overviews und `docs/QA_CHECKS.md` entfernt.
- Neue Source-of-Truth-Pfade zeigen auf:
  - `backend/supabase/functions/midas-incident-push/index.ts`
  - `backend/supabase/functions/midas-monthly-report/index.ts`
  - `backend/supabase/functions/midas-protein-targets/index.ts`
  - `backend/supabase/functions/midas-trendpilot/index.ts`
  - weitere Deno-Check-Pfade unter `backend/supabase/functions/...`
- Historische Archivdokus wurden nicht rueckwirkend umgeschrieben.

Finaler Contract Review:

- Roadmap vs. importierter Source:
  - `backend/` enthaelt zehn freigegebene Dateien.
  - `config.toml` und alle acht `index.ts` sind SHA256-identisch zur externen Importquelle.
- Roadmap vs. QA:
  - `docs/QA_CHECKS.md` dokumentiert die Deno-Checks jetzt mit relativen `backend/...`-Pfaden.
- Roadmap vs. Module Overviews:
  - aktive Overviews referenzieren Backend-Functions ueber `backend/supabase/functions/...`.
- Roadmap vs. README-Guardrails:
  - `backend/README.md` dokumentiert Source-of-Truth, Checks, Deploy-Grenzen, CLI extern, Secret-/Artefaktgrenzen und `seed.sql`-Caveat.

Checks:

- `deno check` fuer alle acht Functions: gruen.
- Hash-/Content-Vergleich gegen externen Source: gruen.
- Secret-/Artefakt-Scan gegen `backend/`: gruen.
- Alte externe Pfade in aktiven Overviews/QA: keine Treffer.
- `git diff --check`: gruen.
- Kein Deploy wurde ausgefuehrt.
- Externer Backend-Workspace wurde nicht geloescht oder veraendert.

Findings und Korrektur:

- S6-F1: Die angefassten Module Overviews hatten nach der Pfadumstellung CRLF-Warnungen. Korrektur: mechanisch auf UTF-8 ohne BOM und LF normalisiert; `git diff --check` ist danach sauber.
- Keine offenen P0/P1-Risiken.

Abschluss-Abnahme:

- Backend-Source, `backend/README.md`, aktive Module Overviews, QA und Roadmap sprechen denselben neuen Repo-Vertrag.
- Die Roadmap ist commitbereit.
- Archiv-Entscheidung: noch nicht automatisch verschoben; nach User-Freigabe kann die Roadmap mit `(DONE)` nach `docs/archive/` verschoben werden.

Commit-Empfehlung:

- `chore(backend): vendor edge function source into repo`

## Ergebnisprotokoll-Format

```md
#### Sx Ergebnisprotokoll

##### Sx.y [Name]
- Umsetzung/Review:
  - [...]
- Contract Review:
  - [...]
- Checks:
  - [...]
- Findings:
  - [...]
- Korrekturen:
  - [...]
- Restrisiko:
  - [...]
```

## Smokechecks / Regression

- `deno check backend/supabase/functions/<function>/index.ts` ist fuer alle acht Functions gruen.
- Importierte `index.ts`-Dateien sind hash-/content-identisch zum externen Source.
- `backend/` enthaelt keine `.env`, `.exe`, `.bak`, `.temp` oder `.vscode`.
- `git status` zeigt keine grossen Binaries.
- Aktive Dokus zeigen auf relative Backend-Pfade.
- Kein Deploy wurde als Nebenwirkung ausgefuehrt.
- Externer Backend-Workspace bleibt unangetastet.

## Abnahmekriterien

- Produktiver Backend-Source ist im MIDAS-Repo versionierbar.
- Import ist klein und artefaktfrei.
- Alle lokal moeglichen Checks sind gruen.
- Doku/QA ist synchron.
- Commit-Empfehlung ist eindeutig.

## Commit-Empfehlung

Nach Abschluss geeignet:

- `chore(backend): vendor edge function source into repo`
