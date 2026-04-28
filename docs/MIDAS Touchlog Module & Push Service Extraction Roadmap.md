# MIDAS Touchlog Module & Push Service Extraction Roadmap

## Ziel (klar und pruefbar)

MIDAS soll die nach der Touchlog-Maintenance-Roadmap entstandene Architektur sauber in Code-Modulgrenzen ueberfuehren.

Pruefbare Zieldefinition:

- Touchlog hat ein eigenes Frontend-Modul fuer die sichtbare Maintenance-Surface.
- Push-Opt-in, Browser-Subscription, Remote-Health und Push-Routing-Status liegen nicht mehr fachlich im Profil-Modul.
- Profil bleibt Code- und Doku-seitig Stammdaten-, Limit-, Arztkontakt- und Medication-Snapshot-Modul.
- Touchlog nutzt fuer Push-Wartung eine Push-Service-API, nicht direkt eine Profile-Push-API.
- Incident-Engine nutzt fuer lokale Push-Suppression dieselbe Push-Service-API.
- User-facing Verhalten bleibt unveraendert: Push ist sichtbar nur im Touchlog, Profil bleibt push-frei.
- UI, Layout, Copy, Buttons, Sections und sichtbare Statuslogik bleiben unveraendert.
- Keine Push-Fachlogik, Service-Worker-, Backend-, SQL- oder Android-Native-Aenderung ohne separaten Befund.

## Problemzusammenfassung

Die abgeschlossene Touchlog-Maintenance-Roadmap hat die sichtbare Architektur korrigiert:

- Push-Wartung ist sichtbar im Touchlog.
- Profil ist sichtbar push-frei.
- Touchlog hat ein eigenes Module Overview bekommen.
- Diagnostics-Core und Touchlog-UI sind dokumentarisch getrennt.

Technisch liegt aber noch eine Altlast vor:

- `app/modules/profile/index.js` enthaelt weiterhin Push-Opt-in, Subscription-Sync, Remote-Health-Auswertung und Routing-Status.
- `app/diagnostics/devtools.js` bindet die sichtbare Touchlog-Push-Wartung an diese interne Profile-Push-API.
- `app/modules/incidents/index.js` nutzt weiterhin Profil als Quelle fuer lokale Push-Suppression.

Das ist aktuell dokumentiert und funktional akzeptabel, aber langfristig unsauber:

- Ein Leser erwartet im Profil-Modul keine Push-Service-Verantwortung.
- Touchlog ist inzwischen stark genug, um eine eigene sichtbare Modulgrenze zu rechtfertigen.
- Push ist fachlich ein eigenes technisches Service-Thema, nicht Profil.

Diese Roadmap klaert und setzt deshalb die naechste saubere Modulgrenze um.

## Scope

- Dedizierte Touchlog-Modulgrenze pruefen und umsetzen:
  - sichtbare Maintenance-Surface
  - Push-Wartungsblock
  - lokale Diagnosemodi
  - Hilfsaktionen
  - Log-Stream-Anbindung
- Dediziertes Push-Service-Modul pruefen und umsetzen:
  - `enablePush`
  - `disablePush`
  - `isPushEnabled`
  - `refreshPushStatus`
  - `getPushRoutingStatus`
  - `shouldSuppressLocalPushes`
  - Browser-Subscription-Sync
  - Remote-Health-Auswertung
- Profil-Modul von Push-Service-Verantwortung entkoppeln.
- Touchlog und Incidents auf die neue Push-Service-API umstellen.
- Bestehende User-facing Copy und sichtbare UI beibehalten.
- UI-free Refactor: bestehende Touchlog-/Profil-DOM-Struktur, CSS und Copy bleiben erhalten.
- Module Overviews, QA und Roadmap synchronisieren.

## Not in Scope

- Aenderung der fachlichen Reminder-/Incident-Logik.
- Aenderung der Medication-/BP-Schwellen.
- Service-Worker-Neuarchitektur.
- SQL-/RLS-Aenderungen.
- Edge-Function- oder GitHub-Actions-Aenderungen.
- Native Android-/TWA-Push-Schicht.
- Neues Remote-Monitoring oder Telemetrie.
- Neues sichtbares Produktfeature.
- Sichtbare UI-, Layout-, Copy-, Button- oder Section-Aenderungen.
- Anzeige von Tokens, UIDs, Endpoints, Payloads oder sensiblen Rohdaten.
- Rueckkehr sichtbarer Push-Bedienung ins Profil.

## Relevante Referenzen (Code)

- `index.html`
- `app/core/diag.js`
- `app/diagnostics/devtools.js`
- `app/modules/profile/index.js`
- `app/modules/incidents/index.js`
- `app/styles/auth.css`
- `app/styles/hub.css`
- `service-worker.js`

Potentiell neu oder umzubauen:

- `app/modules/touchlog/index.js`
- `app/modules/push/index.js`

## Relevante Referenzen (Doku)

- `README.md`
- `docs/MIDAS Roadmap Template.md`
- `docs/modules/Touchlog Module Overview.md`
- `docs/modules/Diagnostics Module Overview.md`
- `docs/modules/Profile Module Overview.md`
- `docs/modules/Push Module Overview.md`
- `docs/QA_CHECKS.md`
- `docs/archive/MIDAS Touchlog Maintenance & Mobile Diagnostics Roadmap (DONE).md`
- `docs/archive/Push Cadence & Health Visibility Follow-up Roadmap (DONE).md`

## Guardrails

- MIDAS bleibt Lebensapp, nicht Debug-Werkbank.
- Touchlog bleibt Maintenance-Surface, kein Produktdashboard.
- Profil bleibt sichtbar push-frei.
- Diese Roadmap ist ein UI-free Refactor:
  - keine neue sichtbare UI
  - keine neue Copy
  - keine Layout-Aenderung
  - keine Button-/Section-Aenderung
  - jede sichtbare Veraenderung ist ein Finding und braucht separaten Entscheid
- Push bleibt expliziter User-Intent.
- Kein Push-Spam.
- Keine Reminder-Ketten ohne separaten Entscheid.
- Lokale Push-Suppression bleibt nur bei belastbarem Remote-Health-Nachweis erlaubt.
- Modulgrenzen werden ernst genommen:
  - Profil: Stammdaten und Kontext.
  - Touchlog: sichtbare Wartung.
  - Push: Subscription, Health, Routing-Status.
  - Incidents: fachliche Reminder-/Incident-Entscheidung.
  - Diagnostics: Core-Log und technische Diagnoseinfrastruktur.
- Source-of-Truth-Dokus muessen am Ende synchron sein.

## Architektur-Constraints

- Der bestehende Browser-/Remote-Push-Vertrag darf nicht fachlich veraendert werden.
- `push_subscriptions` und `push_notification_deliveries` bleiben die bestehenden Remote-Quellen.
- `service-worker.js` bleibt im Scope nur als Referenz, nicht als Umbauziel.
- `diag.add` bleibt Event-Trace und wird nicht zum State Store.
- Touchlog darf Push aktivieren/deaktivieren und Health anzeigen, trifft aber keine Reminder-/Incident-Fachentscheidung.
- Incidents duerfen nur den Push-Routing-Status konsumieren, nicht Touchlog-UI.
- Profil darf nach Abschluss keine sichtbaren oder fachlich primaeren Push-Service-Funktionen mehr besitzen.
- Migration muss rueckwaertskompatibel genug sein, dass bestehende Modul-Initialisierung nicht bricht.

## Tool Permissions

Allowed:

- Neue Datei `app/modules/touchlog/index.js`, falls S1/S2 das bestaetigen.
- Neue Datei `app/modules/push/index.js`, falls S1/S2 das bestaetigen.
- `app/modules/profile/index.js` fuer Push-Extraktion und Delegation bereinigen.
- `app/diagnostics/devtools.js` fuer Trennung Touchlog vs. Devtools bereinigen.
- `app/modules/incidents/index.js` auf Push-Service-API umstellen.
- `index.html` nur fuer Script-Reihenfolge oder neue Modul-Script-Tags, falls noetig; kein sichtbares Markup aendern.
- Module Overviews, QA und Roadmap aktualisieren.
- Lokale Syntax-, Diff-, rg- und statische Smoke-Checks ausfuehren.

Forbidden:

- Service Worker fachlich umbauen.
- Edge Function, GitHub Actions, SQL oder RLS umbauen.
- Medication-/BP-Fachlogik aendern.
- Push-Copy im sichtbaren Produktbereich ausweiten.
- Sichtbares HTML-Markup aendern, ausser zwingend noetige Script-Tags.
- CSS/Layout-Dateien fuer sichtbare UI-Aenderungen anfassen.
- Profil wieder mit sichtbarer Push-UI versehen.
- Produktdaten aus Touchlog oder Push-Service schreiben.
- Sensitive Rohdaten anzeigen.

## Execution Mode

- Sequenziell arbeiten: `S1` bis `S6`.
- `S1` bis `S3` sind Doku-Detektivarbeit, Systemverstaendnis, Risikoanalyse und Contract Reviews.
- `S4` ist der Umsetzungsblock.
- Code-Umsetzung in `S4` substepweise ausfuehren und nach jedem Substep reviewen.
- `S5` ist Tests, Code Review und Contract Review.
- `S6` ist Doku-Sync, QA-Update, finaler Contract Review, Commit-Empfehlung und Archiv-Entscheidung.
- Nach jedem Hauptschritt Statusmatrix aktualisieren.
- Nach jedem Hauptschritt mindestens ein Check oder Review dokumentieren.

## Statusmatrix

| ID | Schritt | Status | Ergebnis/Notiz |
|---|---|---|---|
| S1 | System- und Vertragsdetektivarbeit | TODO | Aktuelle Profile-Push-, Touchlog-, Devtools- und Incident-Abhaengigkeiten vollstaendig erfassen. |
| S2 | Zielarchitektur und Modulvertrag | TODO | Entscheiden, welche Verantwortungen in Touchlog-Modul, Push-Service, Diagnostics, Profile und Incidents liegen. |
| S3 | Bruchrisiko-, Initialisierungs- und Migration-Review | TODO | Script-Reihenfolge, Public APIs, Fallbacks, Copy und Rueckwaertskompatibilitaet pruefen. |
| S4 | Umsetzung Touchlog-Modul und Push-Service-Extraktion | TODO | Neue Modulgrenzen substepweise als UI-free Refactor umsetzen; keine sichtbare UI-/Copy-/Layout-Aenderung. |
| S5 | Tests, Code Review und Contract Review | TODO | Syntax-, Diff-, Smoke-, Push-Control-, Profile-Regression- und Incident-Suppression-Checks. |
| S6 | Doku-Sync, QA-Update und Abschlussreview | TODO | Module Overviews, QA und Roadmap final synchronisieren; Archiv-Entscheidung. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Vorab Contract Review 26.04.2026

Review-Frage:

- Soll diese Roadmap neue sichtbare Touchlog-/Profil-Funktionen bauen?

Entscheidung:

- Nein.
- Die UI ist nach der abgeschlossenen Touchlog-Maintenance-Roadmap fachlich fertig.
- Diese Roadmap ist ausschliesslich ein interner Refactor der Modulgrenzen.

Konkreter Vertrag:

- Keine neue sichtbare UI.
- Keine neue Copy.
- Keine Layout-Aenderung.
- Keine neuen Buttons, Sections oder Statuszustaende.
- Kein Styling-Umbau.
- `index.html` darf nur fuer Script-Reihenfolge oder neue Modul-Script-Tags geaendert werden.
- CSS-Dateien sind fuer diese Roadmap grundsaetzlich nicht Ziel der Umsetzung.
- Jede sichtbare Aenderung gilt als Finding und braucht separaten Entscheid.

Begruendung:

- Touchlog hat bereits den richtigen Platz fuer Push-Wartung.
- Profil ist bereits sichtbar push-frei.
- Der offene Punkt ist nur noch technischer Besitz: Push-Service liegt historisch im Profil-Modul.

## S1 - System- und Vertragsdetektivarbeit

Ziel:

- Bestehende Push- und Touchlog-Abhaengigkeiten verstehen.
- Noch keinen Code aendern.
- Klaeren, ob Touchlog-Modul und Push-Service-Modul getrennt oder anders geschnitten werden sollen.

Substeps:

- S1.1 README und relevante Guardrails lesen.
- S1.2 aktuelle Module Overviews lesen:
  - Touchlog
  - Diagnostics
  - Profile
  - Push
- S1.3 abgeschlossene Touchlog- und Push-Cadence-Roadmaps lesen.
- S1.4 `profile/index.js` inventarisieren:
  - Push-Funktionen
  - Subscription-Datenfluss
  - Remote-Health-Auswertung
  - DOM-Abhaengigkeiten
  - Public API
  - interne Profil-Abhaengigkeiten
- S1.5 `devtools.js` inventarisieren:
  - Touchlog-Bindings
  - Push-Wartungsrendering
  - lokale Diagnosemodi
  - Hilfsaktionen
  - Abhaengigkeit zu `AppModules.profile`
- S1.6 `incidents/index.js` inventarisieren:
  - Nutzung von `getPushRoutingStatus`
  - Nutzung von `shouldSuppressLocalPushes`
  - Fallbacks, falls Push-Status nicht verfuegbar ist
- S1.7 `index.html` und Script-Reihenfolge pruefen.
- S1.8 Ist-Systemkarte dokumentieren:
  - Wer besitzt welche Push-Funktion?
  - Wer rendert welche Touchlog-Flaeche?
  - Wer konsumiert welche API?
- S1.9 Contract Review S1.
- S1.10 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Ist-Karte der Push-Service-Verantwortungen.
- Ist-Karte der Touchlog-UI-Verantwortungen.
- Liste konkreter Migrationsrisiken.

Exit-Kriterium:

- Es ist klar, welche Funktionen verschoben, delegiert oder unveraendert bleiben.

## S2 - Zielarchitektur und Modulvertrag

Ziel:

- Zielarchitektur festlegen, bevor Code bewegt wird.
- Oeffentliche APIs und Besitzgrenzen definieren.

Substeps:

- S2.1 Touchlog-Modulvertrag definieren:
  - sichtbare Surface
  - DOM-Bindings
  - Rendering von Push-Wartung
  - aktive Modi
  - Hilfsaktionen
  - Log-Stream-Anbindung
- S2.2 Push-Service-Vertrag definieren:
  - `enablePush`
  - `disablePush`
  - `isPushEnabled`
  - `refreshPushStatus`
  - `getPushRoutingStatus`
  - `shouldSuppressLocalPushes`
  - Fehler-/Fallback-Verhalten
- S2.3 Profile-Vertrag nach Extraktion definieren:
  - keine sichtbare Push-Surface
  - keine primaere Push-Service-Verantwortung
  - nur noch Profil-Stammdaten und Kontext
- S2.4 Incidents-Vertrag definieren:
  - konsumiert Push-Service fuer Suppression
  - keine Touchlog-Abhaengigkeit
- S2.5 Diagnostics-/Devtools-Vertrag definieren:
  - Diagnostics bleibt Core.
  - Devtools bleibt lokale Diagnosemodi oder wird Thin Wrapper.
  - Touchlog-Modul ist sichtbare Maintenance-Surface.
- S2.6 Migrationsstrategie waehlen:
  - Big Bang vermeiden, falls Zwischendelegation sicherer ist.
  - Erst API schaffen, dann Konsumenten umstellen, dann Profil bereinigen.
- S2.7 Contract Review S2.
- S2.8 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Finaler Zielvertrag pro Modul.
- Geplante Public APIs.
- Konkrete S4-Reihenfolge.

Exit-Kriterium:

- Es ist klar, wie die Module nach Abschluss zusammenspielen.

## S3 - Bruchrisiko-, Initialisierungs- und Migration-Review

Ziel:

- Bruchstellen vor der Umsetzung finden.
- Sicherstellen, dass die Migration nicht nur sauber aussieht, sondern bootst.

Substeps:

- S3.1 Script-Reihenfolge und Modul-Registrierung pruefen.
- S3.2 Public-API-Kompatibilitaet pruefen:
  - alte Profile-Push-Aufrufe
  - neue Push-Service-Aufrufe
  - temporare Delegation, falls noetig
- S3.3 Fallback-Verhalten pruefen:
  - Push-Service nicht geladen
  - Profile nicht geladen
  - Supabase nicht bereit
  - Notification API nicht verfuegbar
- S3.4 Copy-/UI-Review:
  - keine neue sichtbare Copy
  - keine Layout-Aenderung
  - keine Markup-Aenderung ausser Script-Tags, falls noetig
  - Profil bleibt push-frei
  - Touchlog bleibt unveraendert verstaendlich
- S3.5 PII-/Security-Review.
- S3.6 Testplan fuer S5 konkretisieren.
- S3.7 Contract Review S3.
- S3.8 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Bruchrisikoliste.
- Pflichtchecks fuer S4/S5.
- Entscheidung ueber Rueckwaertskompatibilitaet oder harte Migration.

Exit-Kriterium:

- Die Umsetzungsreihenfolge ist klar und risikoarm.

## S4 - Umsetzung Touchlog-Modul und Push-Service-Extraktion

Ziel:

- Modulgrenzen real im Code herstellen.
- Sichtbares Verhalten moeglichst unveraendert lassen.

Substeps:

- S4.1 Push-Service-Modul anlegen.
  - Bestehende Push-State-Struktur aus Profil extrahieren.
  - Browser-Subscription-Funktionen uebernehmen.
  - Remote-Health-Auswertung uebernehmen.
  - Public API unter `AppModules.push` bereitstellen.
- S4.2 Profil als Push-Service-Owner entkoppeln.
  - sichtbare Profil-Funktionalitaet unveraendert lassen.
  - Push-Funktionen aus Profil entfernen oder nur temporaer delegieren.
  - Profil-DOM darf keine Push-IDs erwarten.
- S4.3 Incidents auf Push-Service umstellen.
  - `getPushRoutingStatus` aus `AppModules.push`.
  - `shouldSuppressLocalPushes` aus `AppModules.push`.
  - Fallback unveraendert konservativ.
- S4.4 Touchlog-Modul anlegen.
  - DOM-Bindings fuer `#diag`-Maintenance-Surface uebernehmen.
  - Push-Wartung ueber `AppModules.push`.
  - lokale Diagnosemodi und aktive Modi sauber besitzen.
  - `Touchlog leeren` ueber `diag.clear()`.
- S4.5 `devtools.js` bereinigen.
  - nur noch lokale Devtools-/Diagnostics-Funktionen oder Thin Bootstrap.
  - keine Profile-Push-Direktabhaengigkeit.
- S4.6 Script-Reihenfolge und Initialisierung anpassen.
- S4.7 No-UI-Diff-Review:
  - keine neue Copy
  - keine sichtbare Markup-Aenderung
  - keine CSS-/Layout-Aenderung
  - Touchlog und Profil sehen aus wie vor dem Refactor
- S4.8 Zwischen-Contract-Review.
- S4.9 Korrektur eventueller Findings.

Output:

- `AppModules.touchlog` fuer sichtbare Touchlog-Surface.
- `AppModules.push` fuer Push-Service.
- Profil ohne Push-Service-Besitz.
- Incidents und Touchlog konsumieren Push-Service.

Exit-Kriterium:

- App bootet, Touchlog funktioniert, Profil bleibt push-frei, Push-Control bleibt im Touchlog nutzbar.

## S5 - Tests, Code Review und Contract Review

Ziel:

- Alles lokal Moegliche pruefen.
- Externe Push-Smokes klar definieren oder ausfuehren.

Substeps:

- S5.1 `node --check` fuer betroffene JS-Dateien.
- S5.2 `git diff --check`.
- S5.3 Repo-Scan:
  - keine sichtbare Profil-Push-Surface
  - keine verbliebene direkte Profile-Push-Abhaengigkeit in Touchlog/Incidents, ausser bewusst delegiert
  - keine sensiblen Rohdaten sichtbar
  - keine ungeplanten UI-/Copy-/CSS-Aenderungen
- S5.4 Boot-Smoke:
  - App laedt
  - Module registrieren in richtiger Reihenfolge
  - keine Console-/Touchlog-Fehler durch fehlende APIs
- S5.5 Touchlog-Smoke:
  - oeffnen/schliessen
  - Push-Wartung sichtbar
  - aktive Modi sichtbar
  - Log leeren lokal
- S5.6 Profile-Regression:
  - Profil oeffnet
  - keine Push-Section
  - Stammdaten/Arzt/Limits/Medication-Snapshot intakt
- S5.7 Push-Control-Smoke:
  - aktivieren/deaktivieren im Touchlog
  - Status nach Refresh konsistent
  - `Health-Check offen` bleibt neutral, wenn kein echter Push faellig war
- S5.8 Incident-Suppression-Smoke:
  - konservativer Fallback ohne Remote-Health
  - Suppression nur bei remoteHealthy
- S5.9 Code Review gegen Modulgrenzen.
- S5.10 UI-free Contract Review:
  - kein sichtbarer UI-Diff
  - keine neue Copy
  - keine Layout-Aenderung
  - keine neue Nutzerfuehrung
- S5.11 Contract Review gegen Guardrails.
- S5.12 Korrektur eventueller Findings.
- S5.13 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Getestete Modulgrenze.
- Dokumentierte Restsmokes, falls echter Remote-Push nicht lokal erzwingbar ist.

Exit-Kriterium:

- Keine offenen P0/P1-Findings.
- Sichtbares Verhalten entspricht dem Zustand nach der abgeschlossenen Touchlog-Roadmap.

## S6 - Doku-Sync, QA-Update und Abschlussreview

Ziel:

- Source-of-Truth-Dokus synchronisieren.
- Roadmap abschliessen.

Substeps:

- S6.1 `docs/modules/Touchlog Module Overview.md` aktualisieren:
  - neues Code-Modul
  - Abhaengigkeit zu Push-Service
  - Verantwortungsgrenzen
- S6.2 `docs/modules/Push Module Overview.md` aktualisieren:
  - `AppModules.push`
  - Subscription-/Health-/Routing-Status als Push-Service
  - Touchlog und Incidents als Konsumenten
- S6.3 `docs/modules/Profile Module Overview.md` aktualisieren:
  - Profil hat keine Push-Service-Verantwortung mehr oder nur dokumentierte temporaere Delegation.
- S6.4 `docs/modules/Diagnostics Module Overview.md` aktualisieren:
  - Devtools/Touchlog/Diagnostics-Abgrenzung aktualisieren.
- S6.5 `docs/QA_CHECKS.md` aktualisieren.
- S6.6 Diese Roadmap mit Ergebnisprotokollen aktualisieren.
- S6.7 Finaler Contract Review:
  - Code vs. Roadmap
  - Code vs. Module Overviews
  - QA vs. bekannte Risiken
  - README-/MIDAS-Guardrails
- S6.8 Abschluss-Abnahme:
  - keine offenen P0/P1-Risiken
  - Restrisiken dokumentiert
  - nicht betroffene Schichten bleiben unberuehrt
- S6.9 Commit-Empfehlung.
- S6.10 Archiv-Entscheidung.

Output:

- Dokumentierte und abgeschlossene Modulgrenzen-Migration.

Exit-Kriterium:

- Code, Doku, QA und Roadmap sprechen denselben finalen Touchlog-/Push-Service-Vertrag.

## Ergebnisprotokolle

Jeder Hauptschritt bekommt nach Bearbeitung ein Ergebnisprotokoll.

Format:

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

- App bootet ohne neue Modulfehler.
- Touchlog oeffnet und schliesst.
- Touchlog-Push-Wartung bleibt sichtbare Push-Surface.
- Profil bleibt push-frei.
- UI, Layout und Copy bleiben unveraendert.
- Push aktivieren/deaktivieren bleibt im Touchlog erreichbar.
- Push-Routing-Status bleibt fuer Incidents verfuegbar.
- Lokale Suppression bleibt konservativ.
- Keine sensiblen Push-Rohdaten sichtbar.
- Kein Service-Worker-, Backend-, SQL- oder Android-Umbau.
- Doku beschreibt dieselben Modulgrenzen wie der Code.

## Abnahmekriterien

- `AppModules.touchlog` besitzt die sichtbare Touchlog-Surface.
- `AppModules.push` besitzt Push-Service und Routing-Health.
- `AppModules.profile` besitzt keine sichtbare oder primaere Push-Verantwortung mehr.
- `AppModules.incidents` konsumiert Push-Routing ueber Push-Service.
- User-facing Verhalten bleibt gegenueber der abgeschlossenen Touchlog-Maintenance-Roadmap stabil.

## Commit-Empfehlung

Nach Abschluss geeignet:

- `refactor(touchlog): extract push service from profile`
