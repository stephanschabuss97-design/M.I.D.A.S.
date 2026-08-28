# Codex Usage Guard VS Code Extension Future Notes

Stand: 2026-08-26  
Status: `FUTURE_CONCEPT`  
Arbeitstitel: `Codex Usage Guard`

## Ausgangslage

Lange agentische Coding-Aufgaben können an ein Usage-Limit stoßen, obwohl ein
zusammenhängender Arbeitsblock noch nicht sauber abgeschlossen ist. Bei der
MIDAS-Roadmap R13 trat dieses Risiko besonders deutlich auf: Der Agent arbeitete
an Auth-, Supabase-, Secret- und Cutover-Verträgen, während das kleine 5h-Fenster
keinen verlässlichen Graceful Stop an einer fachlich sicheren Grenze
garantierte.

Ein harter Abbruch während Discovery ist meist nur lästig. Ein Abbruch während
einer Datenbankmigration, Secretmutation, eines Deployments oder eines
mehrteiligen Cutovers kann dagegen einen schwer verständlichen Zwischenstand
erzeugen. Die Lösung ist nicht, einen laufenden atomaren Block anhand einer
Tankanzeige hektisch abzubrechen. Der riskante Block soll bei unzureichender
Reserve gar nicht erst beginnen.

Für MIDAS existiert dafür bereits ein funktionierender lokaler Prototyp:

- Ein authentifizierter lokaler Sensor liest das 5h- und Wochenfenster.
- Ein persistenter JSON-State speichert beide Fenster und Resetidentitäten.
- Ein kanonischer Validator prüft Hash, Schema, Sensorversion, Status,
  Zahlenbereiche, Resetwerte und Freshness.
- Roadmaps messen ausschließlich an sicheren Blockgrenzen.
- `CONTINUE`, `CONTINUE_WITH_CAUTION` und `SAFE_CLOSURE` begrenzen den nächsten
  erlaubten Arbeitsblock.
- Die Resume Card hält bei Safe Closure den eindeutigen Wiedereinstieg fest.
- Rainmeter ist nur das menschliche Cockpit und nicht die Entscheidungsschicht.

Diese Logik könnte als private VS-Code-Extension komfortabler werden und später
eventuell auch anderen Menschen bei langen Codex-Arbeiten helfen.

## Zielbild

Die Extension zeigt die verfügbare Codex-Usage direkt in VS Code und bietet
einen reproduzierbaren Preflight vor langen agentischen Aufgaben. Sie soll
sichtbar machen, ob ein neuer Arbeitsblock mit realistischer Reserve begonnen
werden kann, und bei knapper oder ungültiger Telemetrie einen sauberen Handoff
statt eines riskanten Starts fördern.

Der Guard ist ein lokales Sicherheits- und Orientierungswerkzeug. Er ist weder
ein Quotenmanager noch ein Mechanismus zum Umgehen von Limits.

## Kernfunktionen

### Statusleiste

- kompakte Anzeige für 5h- und Wochenrest,
- klare Zustände für valide, knapp werdende, veraltete und fehlerhafte Daten,
- Resetzeit im Tooltip,
- keine Anzeige erfundener Ersatzwerte.

Beispiel:

```text
Codex 5h 72 % | Woche 36 %
```

### Detailansicht

- beide Usage-Fenster mit Fortschrittsbalken,
- letzter erfolgreicher Refresh,
- Resetzeit und Resetidentität,
- technischer Sensorstatus,
- aktuelle Guard-Entscheidung,
- verständliche Begründung bei `CONTINUE_WITH_CAUTION` oder `SAFE_CLOSURE`.

### Befehle

- `Codex Usage Guard: Aktualisieren`
- `Codex Usage Guard: Gate prüfen`
- `Codex Usage Guard: Details öffnen`
- optional `Codex Usage Guard: Safe-Closure-Handoff vorbereiten`

Die letzte Funktion darf nur eine Vorlage oder Checkliste bereitstellen. Sie
darf keine Roadmap eigenmächtig verändern und keinen laufenden Codex-Turn als
erfolgreich abgeschlossen markieren.

### Roadmap-Modus

Für entsprechend strukturierte Repositories könnte die Extension zusätzlich:

- einen Preflight vor dem ersten Roadmap-Block anbieten,
- Checkpoints an bereits dokumentierten Blockgrenzen unterstützen,
- nur validierte Prozentwerte, Resetidentitäten und Entscheidungen zum Kopieren
  bereitstellen,
- auf eine fehlende oder veraltete Resume Card hinweisen,
- niemals selbst fachliche PASS-, DONE- oder Owner-Gate-Entscheidungen treffen.

## Bewiesener MIDAS-Prototyp

Die aktuelle lokale Referenz besteht aus:

- `tools/codex-usage/GetCodexUsage.ps1`
- `tools/codex-usage/Test-CodexUsageState.ps1`
- installiertem Rainmeter-Sensor unter Stephans Benutzerprofil,
- `UsageState.json` im Schema v3,
- dem Usage-Vertrag in `AGENTS.md`, `docs/DEV_ENVIRONMENT.md` und
  `docs/templates/MIDAS Roadmap Workflow Contract.md`.

Aktuell bewiesen sind:

- Sensorversion `3.1.0`,
- bytegleiche installierte und kanonische Sensorkopie,
- atomarer State-Write,
- Prozessserialisierung über einen Windows-Mutex,
- zwei parallele Refreshes ohne State-Kollision,
- Fail-closed-Verhalten bei veraltetem oder formal ungültigem State,
- ein gebündelter `-Refresh`- und Validierungsbefehl,
- echte `SAFE_CLOSURE`-Entscheidung vor Beginn eines neuen Roadmap-Blocks.

## Technische Architektur einer ersten Extension

### Private V1 für Stephan

Die erste Version sollte die bestehende Logik nicht neu implementieren. Sie
ruft den kanonischen PowerShell-Validator auf und verarbeitet ausschließlich
dessen kompakte JSON-Ausgabe.

```text
lokal authentifizierter Codex-App-Server
                    |
              Usage-Sensor
                    |
             UsageState.json
              /           \
     Rainmeter-Sync     Validator
                            |
                   VS-Code-Extension
```

Vorteile:

- nur eine fachliche Sensor- und Validierungslogik,
- kein Drift zwischen Rainmeter, Roadmaps und Extension,
- geringer Implementierungsumfang,
- der bestehende Prototyp bleibt direkt vergleichbar,
- Fehler bleiben fail-closed.

### Spätere portable Version

Eine für andere Menschen geeignete Extension darf keine festen MIDAS-Pfade,
keine Stephanspezifischen Roadmapregeln und keine reine Windows-Annahme
enthalten. Dafür wäre eine kleine Provider-Grenze nötig:

- `CodexUsageProvider` liest die lokale Usage-Quelle,
- `UsageStateValidator` erzeugt einen stabilen validierten Vertrag,
- `GuardPolicy` wendet konfigurierbare Schwellen an,
- `StatusBarController` und `DetailView` stellen nur validierte Daten dar,
- ein optionaler `WorkspacePolicyProvider` kann repositoryeigene Regeln lesen.

PowerShell könnte für die private Windows-Version erhalten bleiben. Für eine
veröffentlichbare Cross-Platform-Version müsste geprüft werden, ob der Sensor
portabel in TypeScript umgesetzt werden kann und welche lokale Codex-
Schnittstelle offiziell unterstützt wird.

## Sicherheits- und Datenschutzvertrag

- Keine API-Keys, Sessiontokens oder Zugangsdaten in Extension-Settings,
  Logs, Telemetrie oder Repositorydateien speichern.
- Keine rohe Authantwort oder vollständige App-Server-Nachricht anzeigen.
- Standardmäßig keine externe Telemetrie der Extension.
- Keine vollständigen Usage-State-Snapshots in Roadmaps schreiben.
- Lokale Dateien nur mit minimal notwendigen Rechten lesen.
- Workspaceänderungen nur nach explizitem Befehl und nie automatisch aufgrund
  eines Prozentwerts ausführen.
- Sensor- oder Vertragsfehler ergeben `UNKNOWN` beziehungsweise
  `SAFE_CLOSURE`, niemals einen optimistischen Ersatzwert.
- Das Werkzeug darf keine Codex-Limits umgehen, manipulieren oder verschleiern.

## Wichtige Systemgrenzen

### Abgrenzung zu Validated Context Reuse

Der Usage Guard entscheidet ausschließlich, ob genügend Reserve für den
nächsten kohärenten Block vorhanden ist. Die getrennte Prozessidee, bereits
validierten und unveränderten Source-Kontext fingerprintgebunden
wiederzuverwenden, steht in
`docs/MIDAS Validated Context Reuse Future Notes.md`. Keine der beiden
Mechaniken darf die Entscheidung der anderen übernehmen.

### Kein garantierter Graceful Stop

Die Extension kann vor riskanten Starts warnen und eigene Befehle sperren. Sie
kann einen bereits laufenden Codex-Turn jedoch nicht zuverlässig an einer
fachlichen Grenze stoppen, solange dafür kein offiziell unterstützter
Lifecycle-Hook existiert.

Der Guard bleibt daher präventiv:

1. messen,
2. validieren,
3. nächsten Block klassifizieren,
4. erst danach starten.

### Keine Garantie durch Prozentwerte

Auch ein hoher Restwert garantiert nicht, dass ein ungewöhnlich großer Block
fertig wird. Roadmaps benötigen weiterhin:

- kleine kohärente Ausführungsblöcke,
- definierte Postconditions,
- sichere Resume-Grenzen,
- aktuelle Resume Cards,
- Owner-Gates für produktive oder irreversible Aktionen.

### Lokale Codex-Schnittstelle als Watchlist

Der heutige Sensor verwendet eine lokal beobachtete Codex-App-Server-
Schnittstelle. Diese Abhängigkeit wird nicht von MIDAS kontrolliert und kann
sich ändern. Vor einer öffentlichen Bereitstellung muss geklärt werden:

- ob es dafür eine offiziell unterstützte Schnittstelle gibt,
- ob deren Nutzung durch Drittanbieter-Extensions vorgesehen ist,
- welche Plattformen und Codex-Installationsarten unterstützt werden,
- wie Versionsdrift zuverlässig erkannt wird.

Bis dahin bleibt der Sensor ein bewusst fail-closed arbeitender privater
Adapter.

## Nutzen für andere Menschen

Der allgemeine Mehrwert wäre nicht die konkrete MIDAS-Schwelle, sondern das
Arbeitsmuster:

- keine große Migration mit fast leerem 5h-Fenster beginnen,
- teure Reviews und Browsermatrizen an sinnvollen Grenzen bündeln,
- Agenten bei knapper Reserve zu einem reproduzierbaren Handoff führen,
- reale Blockkosten statt bloßes Bauchgefühl beobachten,
- Dirty Stops bei langen Coding-Sessions seltener machen.

Für eine Veröffentlichung müssten MIDAS-spezifische Verträge durch
konfigurierbare Policies ersetzt werden. Die Extension sollte mit vernünftigen
Defaults arbeiten, aber Nutzern erlauben, eigene Caution- und Stopgrenzen sowie
Blocktypen zu definieren.

## Mögliche Entwicklungsstufen

### P0 - Lokaler Sensorbetrieb

Status: `PROVEN`

- Rainmeter-Cockpit,
- versionierter Sensor,
- kanonischer Validator,
- Usage-aware Roadmap-Vertrag,
- erste reale Checkpointdaten sammeln.

### P1 - Private VS-Code-Extension

Status: `FUTURE`

- Windows und Stephans Rechner,
- vorhandenen Validator aufrufen,
- Statusleiste und Detailansicht,
- manuelle Refresh- und Gate-Befehle,
- keine automatische Workspaceänderung.

### P2 - Portabler lokaler Guard

Status: `FUTURE_RESEARCH`

- feste MIDAS-Pfade entfernen,
- Provider- und Policy-Grenze etablieren,
- Windows/macOS/Linux prüfen,
- Installation und Fehlerdiagnose vereinfachen,
- offiziellen Supportstatus der Codex-Schnittstelle klären.

### P3 - Teilbare Extension

Status: `OPTIONAL`

- eigenes Repository und Lizenz,
- Datenschutz- und Security-Review,
- verständliche Konfiguration,
- Tests gegen fehlende, alte, partielle und korrupte States,
- keine Cloudpflicht,
- klare Dokumentation der Graceful-Stop-Grenze.

### P4 - Optionale tiefere Codex-Integration

Status: `BLOCKED_BY_OFFICIAL_CAPABILITY`

Erst relevant, falls eine offiziell unterstützte Codex-API oder ein
Lifecycle-Hook verfügbar wird. Dann könnte geprüft werden, ob ein Guard einen
Taskstart direkt blockieren oder einen sicheren Handoff anfordern darf. Diese
Stufe wird nicht vorweg simuliert.

## Erfolgskriterien

Eine erste private Extension ist erfolgreich, wenn:

- Rainmeter und VS Code denselben validierten Zustand anzeigen,
- kein eigener zweiter Usage-Vertrag entsteht,
- ein ungültiger oder alter State klar und fail-closed dargestellt wird,
- Statusbar und Detailansicht ohne spürbare Entwicklungsunterbrechung helfen,
- die Extension keine Secrets liest oder protokolliert,
- ein Agent weiterhin nur an sicheren Roadmap-Grenzen entscheidet.

Eine teilbare Version ist erst erfolgreich, wenn zusätzlich:

- keine MIDAS- oder Stephan-spezifischen Pfade verbleiben,
- Plattform- und Codex-Abhängigkeiten explizit unterstützt oder sauber
  abgelehnt werden,
- Installation und Deinstallation keine Codex- oder Workspacekonfiguration
  beschädigen,
- die Extension ihre präventive Grenze ehrlich kommuniziert.

## Lessons Learned aus R13

- Usage ist ein Ausführungsrisiko und kein bloßes Abrechnungsthema.
- Große Tool- und Deploymentblöcke brauchen Reserve vor dem Start.
- Eine sichtbare Prozentzahl allein ist kein Vertrag.
- Sensor, Validator, Policy und Anzeige müssen getrennte Verantwortungen haben.
- Fail-closed ist bei fehlender Telemetrie sicherer als optimistische
  Schätzung.
- Ein guter Handoff verhindert Kontextverlust besser als ein hektischer
  Teilabschluss.
- Ein echter Graceful Stop wäre weiterhin wertvoll; der Guard reduziert bis
  dahin das Risiko, ersetzt ihn aber nicht.

## Noch offene Fragen

- Bleibt der lokale Codex-App-Server langfristig als Usage-Quelle verfügbar?
- Gibt es künftig eine offiziell unterstützte Usage- oder Lifecycle-API?
- Soll die private Extension nur anzeigen oder auch einen Roadmap-Startbefehl
  mit verpflichtendem Preflight anbieten?
- Welche Teile der MIDAS-Policy sind allgemeingültig und welche müssen
  konfigurierbar werden?
- Ist eine Cross-Platform-Version den zusätzlichen Wartungsaufwand wert?
- Soll Rainmeter langfristig parallel bestehen bleiben oder nur das
  unabhängige menschliche Cockpit bilden?

## Empfehlung

Die Idee bleibt festgehalten, wird aber nicht vor C3 und R14 umgesetzt. Der
vorhandene Sensor erfüllt bereits den Sicherheitszweck und soll zunächst reale
Blockkosten sammeln. Danach kann eine kleine private VS-Code-Extension als
komfortable Oberfläche gebaut werden.

Erst wenn sich diese private Version im Alltag bewährt und eine belastbare
Codex-Schnittstelle verfügbar ist, wird über eine eigenständige,
veröffentlichbare Extension für andere Nutzer entschieden.
