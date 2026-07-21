# Runbook RB-002 - Push Runtime Smoke

## Zweck und Zuständigkeit

Dieses Runbook prüft den produktiven Runtime-Pfad von `midas-incident-push`
für `PT-004` bis `PT-010`. Es trennt Diagnosezustellung, Incident-Logik,
lokale Suppression und Scheduler-Erfolg.

## Voraussetzungen

- `deno check` und zugehörige Tests der Function sind grün.
- `gh auth status` ist grün und die Workflow-Datei
  `.github/workflows/incidents-push.yml` wurde gelesen.
- PWA-Push ist auf dem kontrollierten Owner-Gerät aktiv.
- Kein Secret wird in Console, Evidence oder Screenshot ausgegeben.

## Wirkung

- Diagnosemodus: `productive`, weil eine echte Testbenachrichtigung zugestellt
  werden kann.
- Incident-Modus: `productive`, weil echte Incident-Prüfung, Zustellung und
  Delivery-Evidence möglich sind.

## Owner-Gate

Vor jedem `gh workflow run` ist eine explizite Owner-Freigabe erforderlich.
Incident-Modus benötigt eine zweite, ausdrückliche Freigabe; Diagnosefreigabe
deckt ihn nicht ab.

## Ablauf

1. Statisch prüfen:

   ```powershell
   deno check backend/supabase/functions/midas-incident-push/index.ts
   gh auth status
   gh workflow view "Incidents Push"
   ```

2. Nach Owner-Freigabe den isolierten Diagnosepfad starten:

   ```powershell
   gh workflow run "Incidents Push" --ref main `
     -f mode=diagnostic -f window=all
   gh run list --workflow "Incidents Push" --limit 5
   gh run watch <run-id> --exit-status
   gh run view <run-id> --log
   ```

3. Zustellung am Owner-Gerät und Touchlog-Einordnung prüfen.
4. Sicherstellen, dass der Diagnosepfad keine fachliche Incident-Delivery als
   erfolgreichen Medication- oder BP-Incident wertet.
5. Incident-Modus nur bei separater Freigabe und fachlich kontrolliertem
   Zeitfenster ausführen:

   ```powershell
   $window = "all" # alternativ: med oder bp
   gh workflow run "Incidents Push" --ref main `
     -f mode=incidents -f "window=$window"
   ```

6. Workflow-Erfolg und Edge-Response gemeinsam bewerten; ein grüner GitHub-Job
   allein ist kein Beleg für fachliche Zustellung.

## Erwartung

- Diagnose liefert eine sichtbare Testzustellung ohne fachliche Incident-Wirkung.
- Incident-Modus respektiert Zeitfenster, Dedupe, Freshness und Partial Delivery.
- Touchlog unterscheidet Remote-Erfolg, lokale Suppression und Fehler ruhig.
- Logs enthalten keine Subscription-Endpunkte, Tokens oder andere Secrets.

## Abbruchbedingungen

- Workflow-Inhalt, Function-Stand oder Projektziel ist unklar.
- Owner-Freigabe fehlt.
- Ein Secret erscheint in Ausgabe oder Evidence.
- Diagnosemodus würde fachliche Zustände schreiben oder fremde Geräte erreichen.

## Cleanup und Postconditions

Diagnosebenachrichtigung am Testgerät verwerfen. Produktive Delivery-Zeilen
nicht manuell löschen; sie sind Evidence des freigegebenen Laufs. Bei
unerwarteter Wirkung keine Wiederholung starten, sondern den Lauf dokumentieren.

## Evidence

Datum, Commit, Workflow-Run-ID, Modus, Window, Edge-Response-Kategorie und
Gerätebeobachtung in Roadmap oder Evidence erfassen. Keine Roh-Secrets kopieren.
