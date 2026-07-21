# Runbook RB-001 - Boot Error Smoke

## Zweck und Zuständigkeit

Dieses Runbook führt den manuellen Browser-Smoke für `CORE-006` und
`CORE-007` aus. Es prüft Sichtbarkeit, Diagnoseweg und Begrenzung der lokalen
Bootfehler-Historie, nicht die fachlichen MIDAS-Module.

## Voraussetzungen

- MIDAS läuft lokal oder auf einem bewusst gewählten Teststand.
- Browser-DevTools mit Console und Elements sind geöffnet.
- `window.AppModules.bootFlow` ist vorhanden.
- Der Lauf verwendet keine produktiven Gesundheitsdaten.

## Wirkung

- Klasse: `disposable`
- Verändert nur lokale Bootfehler-Historie und sichtbaren Fehlerzustand.
- Keine Remote-Schreibwirkung, kein Deploy und keine Nutzerkommunikation.

## Owner-Gate

Keines. Bei einem produktiven Webstand darf der Lauf trotzdem nur mit
bewusster Zustimmung erfolgen, weil er vorübergehend einen Fehlerzustand zeigt.

## Ablauf

1. Vorhandene Historie optional mit
   `window.AppModules.bootFlow.clearErrorHistory?.()` leeren.
2. Folgendes Script in der Browser-Console ausführen:

   ```js
   (() => {
     const api = window.AppModules?.bootFlow;
     if (!api) throw new Error('bootFlow missing');

     api.clearErrorHistory?.();
     api.reportError?.(
       {
         message: 'QA_BOOT_ERROR',
         detail: 'manual browser smoke',
         phase: 'BOOT',
       },
       { reason: 'qa-boot-smoke' },
     );

     console.log({
       panelVisible: !document.getElementById('bootErrorPanel')?.hidden,
       earlyFallback: Boolean(document.getElementById('earlyBootErrorFallback')),
       history: api.getErrorHistory?.() || [],
     });
   })();
   ```

3. Prüfen, dass Boot-Error-Panel oder Early-Fallback sichtbar und bedienbar ist.
4. `Touch-Log öffnen` ausführen und den Diagnose- oder Fallback-Log prüfen.
5. Drei weitere unterschiedliche Fehler melden und verifizieren, dass höchstens
   drei Historieneinträge erhalten bleiben.
6. Die Historie leeren, Seite neu laden und den normalen Boot kontrollieren.

## Erwartung

- Der Fehlerzustand bleibt sichtbar, scrollbar und bedienbar.
- Der neueste Eintrag enthält Message und Timestamp.
- Die Historie bleibt auf drei Einträge begrenzt und ist lokal leerbar.
- Nach Reload sind Boot-Error-Panel und Early-Fallback ohne aktiven Fehler weg.

## Abbruchbedingungen

- `bootFlow` fehlt oder besitzt die benötigten APIs nicht.
- Das Script würde auf einem nicht freigegebenen produktiven Stand laufen.
- Der Fehlerzustand blockiert Zugriff auf DevTools oder normalen Reload.

## Cleanup und Postconditions

`window.AppModules.bootFlow.clearErrorHistory?.()` ausführen und MIDAS neu
laden. Anschließend muss der normale Boot ohne dauerhaften Fehlerzustand laufen.

## Evidence

Datum, Teststand, Browser und Beobachtung zu `CORE-006`/`CORE-007` ausschließlich
in der aktiven Roadmap oder ihrer Evidence-Datei dokumentieren.
