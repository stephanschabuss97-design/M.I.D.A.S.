# MIDAS Touchlog Module & Push Service Extraction Roadmap

## Ziel (klar und pruefbar)

MIDAS soll die nach der Touchlog-Maintenance-Roadmap entstandene Architektur sauber in Code-Modulgrenzen ueberfuehren.

Pruefbare Zieldefinition:

- Touchlog hat ein eigenes Frontend-Modul fuer die sichtbare Maintenance-Surface.
- `AppModules.push` wird vom temporaeren Facade-/Delegationsmodul zum primaeren Push-Service-Owner ausgebaut.
- Push-Opt-in, Browser-Subscription, Subscription-Kontext, Remote-Health, Diagnose-Health und Push-Routing-Status liegen nicht mehr fachlich im Profil-Modul.
- Profil bleibt Code- und Doku-seitig Stammdaten-, Limit-, Arztkontakt- und Medication-Snapshot-Modul.
- Touchlog nutzt fuer Push-Wartung eine Push-Service-API, nicht direkt eine Profile-Push-API.
- Incident-Engine nutzt fuer lokale Push-Suppression dieselbe Push-Service-API.
- User-facing Verhalten bleibt gegenueber dem Stand nach der Push-Channel-Robustness-Roadmap unveraendert: Push ist sichtbar nur im Touchlog, Profil bleibt push-frei.
- UI, Layout, Copy, Buttons, Sections und sichtbare Statuslogik bleiben auf dem Stand nach dem 28.04.2026 erhalten.
- Keine Push-Fachlogik, Service-Worker-, Backend-, SQL- oder Android-Native-Aenderung ohne separaten Befund.

## Problemzusammenfassung

Die abgeschlossene Touchlog-Maintenance-Roadmap hat die sichtbare Architektur korrigiert:

- Push-Wartung ist sichtbar im Touchlog.
- Profil ist sichtbar push-frei.
- Touchlog hat ein eigenes Module Overview bekommen.
- Diagnostics-Core und Touchlog-UI sind dokumentarisch getrennt.

Die abgeschlossene Push-Channel-Robustness-Roadmap hatte danach den Push-/Android-Vertrag weiter festgezogen:

- Browser/PWA ist Reminder-Push-Master.
- Android-WebView/Shell ist Widget-/Sync-/Auth-Surface, kein verlaesslicher Off-App-Reminder-Push-Kanal.
- `AppModules.push` existierte als temporaere Push-Service-Grenze.
- Touchlog-Push-Wartung nutzte bereits bevorzugt `AppModules.push`.
- Incidents nutzten bereits bevorzugt `AppModules.push` und nur noch Profile als Fallback.
- Diagnose-Push, Subscription-Kontext und `last_diagnostic_*` sind eingefuehrt.

Initial lag technisch noch eine Altlast vor:

- `app/modules/profile/index.js` enthielt weiterhin Push-Opt-in, Subscription-Sync, Remote-Health-Auswertung und Routing-Status.
- `app/modules/push/index.js` delegierte viele operative Funktionen noch an diese interne Profile-Push-API.
- `app/diagnostics/devtools.js` ist fuer die sichtbare Touchlog-Push-Wartung bereits auf `AppModules.push` ausgerichtet, besitzt aber weiterhin viel Touchlog-Surface-Code.
- `app/modules/incidents/index.js` nutzte `AppModules.push`, behielt aber noch einen Profile-Fallback.

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
  - Client-Kontext und Subscription-Metadaten
  - Diagnose-Health-Felder
  - Browser-Subscription-Sync
  - Remote-Health-Auswertung
- Profil-Modul von Push-Service-Verantwortung entkoppeln.
- Touchlog und Incidents auf die neue Push-Service-API umstellen.
- Bestehende User-facing Copy und sichtbare UI aus dem Stand nach der Push-Channel-Robustness-Roadmap beibehalten.
- UI-free Refactor: bestehende Touchlog-/Profil-DOM-Struktur, CSS und Copy bleiben erhalten, ausser ein Finding erzwingt eine separate Entscheidung.
- Module Overviews, QA und Roadmap synchronisieren.

## Not in Scope

- Aenderung der fachlichen Reminder-/Incident-Logik.
- Aenderung der Medication-/BP-Schwellen.
- Service-Worker-Neuarchitektur.
- SQL-/RLS-Aenderungen.
- Edge-Function- oder GitHub-Actions-Aenderungen.
- Native Android-/TWA-Push-Schicht.
- Service-Worker-Aenderungen.
- Aenderung des Diagnose-Push-Vertrags.
- Aenderung des Android-WebView-Grenzvertrags.
- Beruhigung oder Neugestaltung der nervoesen Touchlog-Health-Anzeige als Produkt-/UX-Feature.
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
- `app/modules/push/index.js`
- `app/modules/incidents/index.js`
- `app/styles/auth.css`
- `app/styles/hub.css`
- `service-worker.js`

Potentiell neu oder umzubauen:

- `app/modules/touchlog/index.js`

Bestehende Vertragsreferenzen, nicht primaere Umbauziele:

- `.github/workflows/incidents-push.yml`
- `sql/15_Push_Subscriptions.sql`
- `C:/Users/steph/Projekte/midas-backend/supabase/functions/midas-incident-push/index.ts`

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
- `docs/archive/Push Channel Robustness & Android WebView Boundary Roadmap (DONE).md`

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
- Der sichtbare Referenzzustand ist der Stand nach der Push-Channel-Robustness-Roadmap vom 28.04.2026.
- Push bleibt expliziter User-Intent.
- Kein Push-Spam.
- Keine Reminder-Ketten ohne separaten Entscheid.
- Lokale Push-Suppression bleibt nur bei belastbarem Remote-Health-Nachweis erlaubt.
- Technische Diagnose-Pushes duerfen lokale medizinische Suppression nicht freischalten.
- Android-WebView bleibt abgegrenzt und darf nicht still als gesunder Reminder-Push-Kanal verkauft werden.
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
- `last_diagnostic_*` bleibt technischer Diagnosezustand und darf `remoteHealthy` nicht ersetzen.
- `endpoint_hash`, `client_context`, `client_display_mode`, `client_platform`, `client_browser` und `client_label` bleiben sichere Diagnose-Metadaten ohne Roh-Endpunktanzeige.
- `service-worker.js` bleibt im Scope nur als Referenz, nicht als Umbauziel.
- `diag.add` bleibt Event-Trace und wird nicht zum State Store.
- Touchlog darf Push aktivieren/deaktivieren und Health anzeigen, trifft aber keine Reminder-/Incident-Fachentscheidung.
- Incidents duerfen nur den Push-Routing-Status konsumieren, nicht Touchlog-UI.
- Profil darf nach Abschluss keine sichtbaren oder fachlich primaeren Push-Service-Funktionen mehr besitzen.
- Migration muss rueckwaertskompatibel genug sein, dass bestehende Modul-Initialisierung nicht bricht.

## Tool Permissions

Allowed:

- Neue Datei `app/modules/touchlog/index.js`, falls S1/S2 das bestaetigen.
- Bestehende Datei `app/modules/push/index.js` zum vollwertigen Push-Service ausbauen.
- `app/modules/profile/index.js` fuer Push-Extraktion und Delegation bereinigen.
- `app/diagnostics/devtools.js` fuer Trennung Touchlog vs. Devtools bereinigen.
- `app/modules/incidents/index.js` auf Push-Service-API umstellen.
- `index.html` nur fuer Script-Reihenfolge oder neue Modul-Script-Tags, falls noetig; kein sichtbares Markup aendern.
- Module Overviews, QA und Roadmap aktualisieren.
- Lokale Syntax-, Diff-, rg- und statische Smoke-Checks ausfuehren.

Forbidden:

- Service Worker fachlich umbauen.
- Edge Function, GitHub Actions, SQL oder RLS umbauen.
- Diagnose-Push-Vertrag, `last_diagnostic_*`-Semantik oder fachliche Delivery-Dedupe umbauen.
- Android-WebView-/Widget-Grenzvertrag umbauen.
- Touchlog-Health-Anzeige als neues UX-Feature beruhigen, ohne separaten Entscheid.
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
| S1 | System- und Vertragsdetektivarbeit | DONE | README, Module Overviews, abgeschlossene Push-/Touchlog-Roadmaps und Codepfade gelesen; Ist-Karte fuer Push-Service, Touchlog-Surface, Profile-Backend, Incidents-Konsum und Script-Reihenfolge dokumentiert. |
| S2 | Zielarchitektur und Modulvertrag | DONE | Zielvertraege fuer `AppModules.push`, `AppModules.touchlog`, Profile, Incidents und Diagnostics/Devtools festgelegt; Profile-Fallbacks sind nur noch Migrationsfrage, nicht Zielzustand. |
| S3 | Bruchrisiko-, Initialisierungs- und Migration-Review | DONE | Script-Reihenfolge, Public APIs, Fallbacks, No-UI-Diff, Diagnose-/Suppression-Vertrag, Android-WebView-Grenze, `assistantSurface` und `AppModules.touchlog.add` reviewed; S4/S5-Pflichtpunkte festgelegt. |
| S4 | Umsetzung Touchlog-Modul und Push-Service-Extraktion | DONE | Push-Service ist Owner, Profile ist push-frei, Incidents konsumiert `AppModules.push`, `AppModules.touchlog` besitzt die Surface, `devtools.js` ist Thin Bootstrap; keine sichtbare UI-/Copy-/Layout-Aenderung. |
| S5 | Tests, Code Review und Contract Review | DONE | Syntax-, Diff-, Repo-, Boot-, Touchlog-, Profile-, Push-Control-, Diagnose-, Suppression- und Contract-Checks abgeschlossen; keine offenen P0/P1-Findings, echte Browser-/Android-Smokes bleiben lokale Restchecks. |
| S6 | Doku-Sync, QA-Update und Abschlussreview | DONE | Module Overviews, QA und Roadmap sprechen denselben finalen Touchlog-/Push-Service-Vertrag; keine offenen P0/P1-Findings, optionaler manueller echter Push-Smoke bleibt Beobachtungspunkt. |

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

## Nachtrag Contract Review 28.04.2026

Review-Frage:

- Muss diese Roadmap nach der Push-Channel-Robustness-Roadmap neu bewertet werden?

Entscheidung:

- Ja.
- `AppModules.push` existiert bereits, ist aber noch keine vollstaendige Service-Extraktion.
- Touchlog und Incidents konsumieren bereits bevorzugt `AppModules.push`.
- Profil bleibt trotzdem operativer Besitzer von Subscription, PushManager-Zugriff, Remote-Health und Routing-Status.
- Die naechste Roadmap soll daher nicht "Push-Service neu anlegen", sondern die bestehende Grenze vervollstaendigen.

Zusaetzlicher Vertrag:

- Keine Aenderung am Diagnose-Push-Vertrag aus dem 28.04.2026.
- Keine Aenderung an SQL, Edge Function, GitHub Actions, Service Worker oder Android-WebView-Vertrag ohne neues Finding.
- Der UI-Referenzzustand ist der Touchlog-Push-Wartungsstand nach dem Push-Channel-Robustness-Sprint.
- Eine spaetere ruhigere Push-Pill/Health-Darstellung ist ein eigener UX-Cleanup und nicht automatisch Teil dieser Extraktion.

## Vorab Befund `devtools.js` 30.04.2026

Befund:

- `app/diagnostics/devtools.js` ist historisch als Devtools-Modul benannt, traegt aber faktisch bereits grosse Teile der Touchlog-Surface-Verantwortung.
- Das Modul bindet die sichtbaren Touchlog-DOM-Anker:
  - `#devTogglePush`
  - `#devPushStatus`
  - `#devPushDetails`
  - `#devActiveModes`
  - `#devClearLogBtn`
  - lokale Modus-Toggles fuer Sound, Haptik, No Cache und Assistant
- Das Modul rendert Push-Wartung:
  - Statuscopy
  - Detailzeilen
  - Kontext-/Geraeteanzeige
  - Diagnose-Health
  - Endpoint-Hash
  - Android-WebView-Abgrenzung
- Das Modul steuert Touchlog-Aktionen:
  - Push aktivieren/deaktivieren ueber `AppModules.push`
  - aktive lokale Modi anzeigen
  - Touchlog lokal leeren
  - No-Cache-Modus anwenden
  - Assistant-Surface-State setzen

Contract-Folgerung:

- `devtools.js` ist kein reines Diagnostics-/Devtools-Hilfsmodul mehr, sondern aktuell ein historisch benannter Touchlog-Surface-Controller.
- Das bestaetigt den Bedarf fuer `app/modules/touchlog/index.js`.
- S4 soll deshalb voraussichtlich kein neues UI bauen, sondern bestehenden Touchlog-Surface-Code kontrolliert aus `devtools.js` in ein Touchlog-Modul verschieben.
- `devtools.js` soll danach entweder Thin Bootstrap bleiben oder nur noch wirklich lokale Devtools-Helfer enthalten.
- Sichtbares Verhalten, Copy, Layout und DOM bleiben unveraendert.

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
- S1.3 abgeschlossene Touchlog-, Push-Cadence- und Push-Channel-Robustness-Roadmaps lesen.
- S1.4 `profile/index.js` inventarisieren:
  - Push-Funktionen
  - Subscription-Datenfluss
  - Remote-Health-Auswertung
  - Diagnose-Health-Auswertung
  - Subscription-Kontext-Metadaten
  - DOM-Abhaengigkeiten
  - Public API
  - interne Profil-Abhaengigkeiten
- S1.5 `push/index.js` inventarisieren:
  - bestehende Facade-/Delegationsfunktionen
  - Kontext-/Display-Mode-Erkennung
  - Subscription-Metadaten
  - Endpoint-Hashing
  - fehlende Owner-Verantwortungen
- S1.6 `devtools.js` inventarisieren:
  - Touchlog-Bindings
  - Push-Wartungsrendering
  - lokale Diagnosemodi
  - Hilfsaktionen
  - Abhaengigkeit zu `AppModules.push`
  - verbleibende Surface-Verantwortung
- S1.7 `incidents/index.js` inventarisieren:
  - Nutzung von `getPushRoutingStatus`
  - Nutzung von `shouldSuppressLocalPushes`
  - bevorzugter Push-Service-Konsum
  - Fallbacks, falls Push-Status nicht verfuegbar ist
- S1.8 `index.html` und Script-Reihenfolge pruefen.
- S1.9 Ist-Systemkarte dokumentieren:
  - Wer besitzt welche Push-Funktion?
  - Wer rendert welche Touchlog-Flaeche?
  - Wer konsumiert welche API?
- S1.10 Contract Review S1.
- S1.11 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Ist-Karte der Push-Service-Verantwortungen.
- Ist-Karte der Touchlog-UI-Verantwortungen.
- Liste konkreter Migrationsrisiken.

Exit-Kriterium:

- Es ist klar, welche Funktionen verschoben, delegiert oder unveraendert bleiben.

#### S1 Ergebnisprotokoll

##### S1.1 README und Guardrails
- Umsetzung/Review:
  - `README.md` gelesen.
  - Relevante Produktgrenzen bestaetigt:
    - MIDAS bleibt single-user und Alltagssystem.
    - Push bleibt Schutznetz, kein Reminder-Laerm.
    - Modulgrenzen sind ernst gemeint.
    - Android-Huelle bleibt schmale Node/Surface, keine zweite Fachlogik.
- Contract Review:
  - Diese Roadmap passt, weil sie Modulbesitz schaerft und kein neues Verhalten einfuehrt.
- Findings:
  - Keine.

##### S1.2 Module Overviews
- Umsetzung/Review:
  - `docs/modules/Touchlog Module Overview.md`
  - `docs/modules/Diagnostics Module Overview.md`
  - `docs/modules/Profile Module Overview.md`
  - `docs/modules/Push Module Overview.md`
- Ergebnis:
  - Touchlog ist dokumentiert als sichtbare Maintenance-Surface.
  - Diagnostics ist Core/Infrastruktur.
  - Push ist fachlicher Transport-/Health-/Routing-Vertrag.
  - Profile ist sichtbar Stammdatenmodul, besitzt aber vorerst intern noch Push-Backend.
- Findings:
  - Kleines Doku-Finding: `Profile Module Overview` enthielt zwei fast gleiche Saetze zum Push-Opt-in/-Opt-out.
- Korrektur:
  - Saetze zusammengefuehrt: sichtbar ueber Touchlog und UI-Konsumenten ueber `AppModules.push`, intern noch bestehende Profile-Push-API.

##### S1.3 Historische Roadmaps
- Umsetzung/Review:
  - `docs/archive/MIDAS Touchlog Maintenance & Mobile Diagnostics Roadmap (DONE).md`
  - `docs/archive/Push Cadence & Health Visibility Follow-up Roadmap (DONE).md`
  - `docs/archive/Push Channel Robustness & Android WebView Boundary Roadmap (DONE).md`
- Ergebnis:
  - Touchlog-Maintenance-Roadmap hat UI/Surface abgeschlossen.
  - Push-Cadence-Roadmap hat Scheduler/Remote-Health-Vertrag stabilisiert.
  - Push-Channel-Robustness-Roadmap hat PWA/Browser als Push-Master, Android-WebView-Abgrenzung, Diagnose-Push und `AppModules.push`-Vorblock umgesetzt.
- Contract Review:
  - Aktive Roadmap darf diese Vertraege nicht veraendern.
  - Referenzzustand fuer UI/Copy/Layout ist der Stand nach dem 28.04.2026.
- Findings:
  - Keine.

##### S1.4 `profile/index.js` inventarisiert
- Umsetzung/Review:
  - `app/modules/profile/index.js` gelesen.
- Ist-Zustand:
  - Profile besitzt weiterhin operative Push-Funktionen:
    - `enablePush`
    - `disablePush`
    - `isPushEnabled`
    - `refreshPushStatus`
    - `getPushRoutingStatus`
    - `shouldSuppressLocalPushes`
  - Profile besitzt weiterhin Browser-/Service-Worker-/PushManager-Zugriff:
    - `ensurePushSupport`
    - `getPushRegistration`
    - `getCurrentSubscription`
  - Profile schreibt und loescht `push_subscriptions`:
    - `upsertSubscription`
    - `deleteSubscription`
  - Profile liest Remote-/Diagnose-Health:
    - `fetchRemoteSubscriptionHealth`
    - `last_remote_*`
    - `last_diagnostic_*`
    - `endpoint_hash`
    - `client_context`
  - Profile bewertet Remote-Health und lokale Suppression:
    - `isRemoteSubscriptionHealthy`
    - `localSuppressionAllowed = remoteHealthy`
  - Profile enthaelt noch alte Push-DOM-Refs:
    - `#profilePushEnableBtn`
    - `#profilePushDisableBtn`
    - `#profilePushStatus`
    - `#profilePushDetails`
    - Diese sind durch fehlendes sichtbares Profil-Markup aktuell no-op-tolerant.
- Contract Review:
  - Profile ist technisch weiterhin Push-Backend. Das ist exakt die Altlast, die S4 entfernen oder delegierend absichern soll.
  - `last_diagnostic_*` wird nicht fuer `remoteHealthy` oder lokale Suppression genutzt.
- Findings:
  - S1-F1: Profile besitzt noch mehr als nur temporaere Delegation; es ist operativer Push-Owner.
  - S1-F2: Alte Profile-Push-DOM-Refs sind toleriert, aber nach finaler Extraktion Kandidaten fuer Entfernung.

##### S1.5 `push/index.js` inventarisiert
- Umsetzung/Review:
  - `app/modules/push/index.js` gelesen.
- Ist-Zustand:
  - `AppModules.push` existiert und besitzt Kontext-/Diagnose-Helfer:
    - `detectContext`
    - `getContext`
    - `toSubscriptionMetadata`
    - `buildSubscriptionMetadata`
    - `createEndpointHash`
    - `buildClientLabel`
  - Operative Push-API existiert, delegiert aber an Profile:
    - `enablePush`
    - `disablePush`
    - `isPushEnabled`
    - `refreshPushStatus`
    - `getPushRoutingStatus`
    - `shouldSuppressLocalPushes`
  - Ohne Profile liefert Push konservative Fallbacks:
    - nicht enabled
    - nicht suppressen
    - Routing unavailable mit Kontext
- Contract Review:
  - `AppModules.push` ist eine echte Vorgrenze, aber noch kein Owner.
  - S4 muss diese Grenze vervollstaendigen, nicht neu erfinden.
- Findings:
  - S1-F3: `push/index.js` ist derzeit Facade/Delegationsmodul, kein vollstaendiger Push-Service.

##### S1.6 `devtools.js` inventarisiert
- Umsetzung/Review:
  - `app/diagnostics/devtools.js` gelesen.
- Ist-Zustand:
  - Das Modul bindet Touchlog-DOM:
    - `#devTogglePush`
    - `#devPushStatus`
    - `#devPushDetails`
    - `#devActiveModes`
    - `#devClearLogBtn`
  - Es rendert Push-Wartung:
    - Statuscopy
    - Detailzeilen
    - Kontext/Geraet
    - Diagnose-Health
    - Endpoint-Hash
    - Android-WebView-Abgrenzung
  - Es steuert lokale Diagnosemodi:
    - Sound
    - Haptik
    - No Cache
    - Assistant
  - Es besitzt Hilfsaktionen:
    - Touchlog leeren via `diag.clear()`
    - No-Cache CSS Cachebuster
  - Es stellt `AppModules.assistantSurface` bereit.
- Contract Review:
  - `devtools.js` ist faktisch Touchlog-Surface-Controller, nicht nur Diagnostics-Devtools.
  - Der Vorab-Befund vom 30.04.2026 ist bestaetigt.
- Findings:
  - S1-F4: Touchlog-Surface-Code liegt historisch in `app/diagnostics/devtools.js`; S4 sollte kontrolliert in `app/modules/touchlog/index.js` verschieben.
  - S1-F5: `AppModules.assistantSurface` muss bei einer Verschiebung bewusst mitgenommen oder separat abgegrenzt werden.

##### S1.7 `incidents/index.js` inventarisiert
- Umsetzung/Review:
  - `app/modules/incidents/index.js` gelesen.
- Ist-Zustand:
  - Incident-Engine bleibt fachlicher Push-/Notification-Konsument.
  - Lokale Suppression nutzt bevorzugt:
    - `appModules.push`
  - Fallback bleibt:
    - `appModules.profile`
  - Suppression bleibt konservativ:
    - stale Routing wird refreshbar.
    - `shouldSuppressLocalPushes()` entscheidet.
    - ohne Modul oder ohne Remote-Health wird lokal nicht unterdrueckt.
- Contract Review:
  - Incidents ist bereits weitgehend auf den neuen Vertrag ausgerichtet.
  - Profile-Fallback ist Migrationssicherung, aber nach vollstaendigem Push-Service-Owner optional entfernbar.
- Findings:
  - S1-F6: Profile-Fallback in Incidents ist bewusst sicher, aber finaler Zielvertrag muss in S2 entscheiden, ob und wann er entfernt wird.

##### S1.8 `index.html` und Script-Reihenfolge
- Umsetzung/Review:
  - Touchlog-Markup und Script-Reihenfolge in `index.html` geprueft.
- Ist-Zustand:
  - Touchlog-DOM-Anker sind vorhanden.
  - Script-Reihenfolge relevant:
    - `app/core/diag.js`
    - `app/modules/push/index.js`
    - Diagnostics logger/perf/monitor
    - `app/diagnostics/devtools.js`
    - `app/modules/profile/index.js`
    - spaeter `app/modules/incidents/index.js`
  - `devtools.js` laedt aktuell vor `profile/index.js`.
  - `AppModules.push` ist zu diesem Zeitpunkt vorhanden, aber operational nur dann voll, wenn Profile spaeter geladen ist.
- Contract Review:
  - Script-Reihenfolge ist ein zentrales S3/S4-Risiko.
  - Ein neues Touchlog-Modul muss so einsortiert werden, dass es `AppModules.push` sieht und nicht dauerhaft auf einen noch nicht initialisierten Profile-Backend-Zustand einfriert.
- Findings:
  - S1-F7: Initialisierungs-/Refresh-Timing zwischen Touchlog, Push-Facade und Profile-Backend muss in S3 explizit geprueft werden.

##### S1.9 Ist-Systemkarte
- Push-Service-Besitz heute:
  - Kontext, Label, Hash, sichere Metadaten: `AppModules.push`.
  - Operative Subscription/Permission/Remote-Health: `AppModules.profile`.
  - Facade/Delegation fuer neue Konsumenten: `AppModules.push`.
- Touchlog-Surface-Besitz heute:
  - Markup: `index.html`.
  - Layout: `app/styles/auth.css`.
  - Surface-Bindings/Rendering/Aktionen: `app/diagnostics/devtools.js`.
  - Log-Core: `app/core/diag.js`.
- Profil-Besitz heute:
  - Sichtbar: Stammdaten, Limits, Arztkontakt, Medication-Snapshot.
  - Unsichtbar/technisch: Push-Backend und Routing-State.
- Incidents-Besitz heute:
  - Fachliche Reminder-/Incident-Entscheidung.
  - Lokale Notification.
  - Suppression-Konsum bevorzugt ueber Push-Service, Profile als Fallback.

##### S1.10 Contract Review S1
- Ergebnis:
  - S1 besteht den Contract Review.
  - Die Roadmap ist weiterhin korrekt geschnitten:
    - kein UI-Feature
    - keine Push-Fachlogik
    - keine SW-/SQL-/Edge-/Android-Aenderung
    - Modulbesitz sauberziehen
  - Der wichtigste technische Startpunkt ist nicht Neubau, sondern Vervollstaendigung:
    - `AppModules.push` vom Facade-/Delegationsmodul zum Owner.
    - `devtools.js` vom Surface-Controller zum Thin Bootstrap oder echten Devtools-Helfer.
    - `profile/index.js` von Push-Backend entlasten.
- Findings:
  - S1-F1 bis S1-F7 dokumentiert.
  - Keine P0/P1-Blocker.
  - Pflicht fuer S2/S3:
    - exakte Ziel-API von `AppModules.push`
    - Umgang mit Profile-Fallbacks
    - Umgang mit `AppModules.assistantSurface`
    - Script-Reihenfolge/Initialisierung
    - No-UI-Diff-Vertrag

##### S1.11 Schritt-Abnahme und Commit-Empfehlung
- Abnahme:
  - Roadmap, Guardrails, Doku und Codepfade sind gelesen.
  - Ist-Karte liegt vor.
  - S1-Findings sind dokumentiert.
  - Ein kleines Doku-Finding wurde korrigiert.
- Doku-Sync:
  - `Profile Module Overview` wurde minimal bereinigt.
  - Weitere Source-of-Truth-Doku bleibt fuer S6.
- Commit-Empfehlung:
  - Kein separater Commit nur fuer S1 noetig, wenn S2 direkt folgt.
  - Falls pausiert wird: `docs(touchlog): document push service extraction S1 findings`.

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
  - `buildSubscriptionMetadata` oder aequivalenter interner Kontextvertrag
  - Endpoint-Hashing
  - Remote-Health vs. Diagnose-Health
  - Android-WebView-Abgrenzung
  - Fehler-/Fallback-Verhalten
- S2.3 Profile-Vertrag nach Extraktion definieren:
  - keine sichtbare Push-Surface
  - keine primaere Push-Service-Verantwortung
  - optional nur temporaere/deprecated Delegation, falls S3 das fuer die Migration braucht
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
  - Profile-Fallback in Incidents erst entfernen, wenn `AppModules.push` vollstaendig stabil ist.
- S2.7 Contract Review S2.
- S2.8 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Finaler Zielvertrag pro Modul.
- Geplante Public APIs.
- Konkrete S4-Reihenfolge.

Exit-Kriterium:

- Es ist klar, wie die Module nach Abschluss zusammenspielen.

#### S2 Ergebnisprotokoll

##### S2.1 Touchlog-Modulvertrag
- Umsetzung/Review:
  - Finaler Besitzer der sichtbaren Touchlog-Surface wird `app/modules/touchlog/index.js`.
  - `AppModules.touchlog` besitzt nach S4:
    - DOM-Bindings fuer `#diag`-Maintenance-Surface
    - Push-Wartungsrendering
    - lokale Diagnosemodi
    - aktive Modus-Pills
    - Hilfsaktion `Touchlog leeren`
    - Log-Stream-Anbindung ueber Diagnostics-Core
    - Android-WebView-Hinweis und bestehende Diagnosezeilen
  - Public API minimal:
    - `init()`
    - `refreshPushStatus(reason?)` oder aequivalenter interner Refresh-Hook
    - optional `updateActiveModes()`, falls fuer Tests/Bootstrap nuetzlich
- Contract Review:
  - Touchlog-Modul darf UI binden und rendern, aber keine Push-Fachlogik besitzen.
  - Touchlog konsumiert `AppModules.push`; kein direkter Profile-Push-Zugriff.
  - Touchlog darf `diag.clear()` ausloesen, aber keine Produktdaten schreiben oder loeschen.
  - UI-free-Vertrag bleibt hart: bestehendes Markup, Copy, Layout und Statuslogik bleiben sichtbar unveraendert.
- Findings:
  - S2-F1: `AppModules.assistantSurface` liegt aktuell in `devtools.js`; Zielvertrag: Es darf mit ins Touchlog-Modul, weil der sichtbare Assistant-Toggle Teil der Touchlog-Surface ist. S3 muss pruefen, ob externe Konsumenten timing-sensitiv auf `AppModules.assistantSurface` warten.

##### S2.2 Push-Service-Vertrag
- Umsetzung/Review:
  - Finaler Besitzer von Push-Service-Verantwortung wird `app/modules/push/index.js`.
  - `AppModules.push` wird vom Facade-/Delegationsmodul zum primaeren Owner.
  - Public API:
    - `detectContext()`
    - `getContext()`
    - `toSubscriptionMetadata(context?)`
    - `buildSubscriptionMetadata({ subscription, context? })`
    - `createEndpointHash(endpoint)`
    - `buildClientLabel(context)`
    - `hasOperationalPushApi()`
    - `enablePush()`
    - `disablePush()`
    - `isPushEnabled()`
    - `refreshPushStatus(options?)`
    - `getPushRoutingStatus()`
    - `shouldSuppressLocalPushes()`
  - Push-Service besitzt nach S4:
    - Browser-/Service-Worker-/PushManager-Zugriff
    - Browser-Subscription lesen/erstellen/entfernen
    - Supabase `push_subscriptions` Upsert/Delete/Health-Read
    - Subscription-Kontext und Endpoint-Hashing
    - Remote-Health-Auswertung
    - Diagnose-Health-Auswertung als Anzeigezustand
    - Routing-State inklusive konservativer Fallbacks
- Contract Review:
  - `remoteHealthy` darf nur aus echten Remote-Health-Feldern entstehen:
    - `last_remote_success_at`
    - `last_remote_failure_at`
    - `disabled`
    - `consecutive_remote_failures`
  - `last_diagnostic_*` darf angezeigt, aber niemals fuer lokale medizinische Suppression genutzt werden.
  - Ohne operativen Push-Service bleibt `shouldSuppressLocalPushes()` konservativ `false`.
  - Android-WebView bleibt nicht empfohlener Reminder-Push-Kontext; Push-Service darf diesen Kontext erkennen, aber nicht aufwerten.
  - Keine SQL-/Edge-/Workflow-/Service-Worker-Aenderung in dieser Roadmap.
- Findings:
  - Keine neuen Findings; S1-F1/S1-F3 werden durch diesen Zielvertrag adressiert.

##### S2.3 Profile-Vertrag nach Extraktion
- Umsetzung/Review:
  - Profile wird nach S4 wieder reines Stammdaten-/Kontextmodul:
    - Stammdaten
    - Limits
    - Arztkontakt
    - Medication-Snapshot
    - `profile:changed`
  - Finaler Zielzustand:
    - keine sichtbare Push-Surface
    - keine Push-DOM-Refs
    - keine primaere Push-Service-Verantwortung
    - keine operative `enablePush`/`disablePush`/`refreshPushStatus`-Ownership
  - Erlaubt nur als Migrationsmittel:
    - temporaere/deprecated Delegation von alten Profile-Push-API-Namen zu `AppModules.push`, falls S3 eine harte Entfernung als Initialisierungsrisiko bewertet.
- Contract Review:
  - Zielzustand ist nicht "Profile delegiert dauerhaft", sondern "Profile besitzt Push nicht mehr".
  - S3 muss per Repo-Scan klaeren, ob alte `AppModules.profile.*Push*`-Konsumenten nach Umstellung noch existieren.
- Findings:
  - S2-F2: Alte Profile-Push-DOM-Refs sollen in S4 entfernt werden, wenn S3 bestaetigt, dass kein sichtbares Markup mehr existiert und keine no-op-Kompatibilitaet gebraucht wird.

##### S2.4 Incidents-Vertrag
- Umsetzung/Review:
  - Incidents bleibt fachlicher Reminder-/Incident-Entscheider.
  - Incidents konsumiert Push-Routing und Suppression ueber `AppModules.push`.
  - Incidents hat keine Touchlog-Abhaengigkeit.
  - Zielzustand:
    - kein direkter `AppModules.profile`-Fallback mehr, sobald `AppModules.push` vollstaendig owner-faehig und vor Incidents geladen ist.
- Contract Review:
  - Suppression-Fachlogik bleibt unveraendert:
    - lokale Suppression nur bei echtem `remoteHealthy`.
    - Diagnose-Health schaltet keine lokale Suppression frei.
    - ohne Push-Service oder ohne Remote-Health wird nicht suppressiert.
  - S3 muss entscheiden, ob der Profile-Fallback in S4 entfernt werden darf oder fuer eine Uebergangsphase bleibt.
- Findings:
  - S2-F3: Finaler Zielvertrag entfernt Profile-Fallback; S3 muss Timing und Boot-Risiko pruefen.

##### S2.5 Diagnostics-/Devtools-Vertrag
- Umsetzung/Review:
  - Diagnostics bleibt Core/Infrastruktur:
    - `diag.add`
    - `diag.show`
    - `diag.hide`
    - `diag.clear`
    - logger/perf/monitor
  - Touchlog-Surface-Code wandert aus `app/diagnostics/devtools.js` in `app/modules/touchlog/index.js`.
  - Ziel fuer `devtools.js`:
    - entweder Thin Bootstrap fuer Rueckwaertskompatibilitaet
    - oder nur noch wirklich diagnostics-nahe Helfer, falls nach Verschiebung welche bleiben
  - Lokale Diagnosemodi gehoeren sichtbar zum Touchlog-Modul, auch wenn ihre Flags weiterhin lokale Dev-/QA-Flags sind.
- Contract Review:
  - Diagnostics-Core darf durch diese Roadmap nicht zum Surface-Owner werden.
  - `devtools.js` darf nach S4 keine direkte Profile-Push-Abhaengigkeit mehr haben.
- Findings:
  - S2-F4: S3 muss klaeren, ob `devtools.js` als Script bestehen bleibt und nur `AppModules.touchlog.init()` bootstrapped oder ob `index.html` direkt das neue Touchlog-Modul laedt. Keine sichtbare Markup-Aenderung.

##### S2.6 Migrationsstrategie
- Entscheidung:
  - Kein Big Bang ueber mehrere Schichten ohne Zwischenreview.
  - S4-Reihenfolge wird konkretisiert:
    1. `AppModules.push` zum operativen Owner ausbauen.
    2. Profile auf Stammdaten/Kontext zurueckschneiden; alte Push-APIs nur bei S3-Bedarf temporaer delegieren.
    3. Incidents auf finalen Push-Service-Konsum haerten und Profile-Fallback entfernen, falls S3 freigibt.
    4. `AppModules.touchlog` anlegen und bestehende Surface aus `devtools.js` verschieben.
    5. `devtools.js` als Thin Bootstrap oder Rest-Devtools bereinigen.
    6. Script-Reihenfolge nur fuer neue Modul-Script-Tags anpassen.
    7. No-UI-Diff-Review.
- Contract Review:
  - Diese Reihenfolge minimiert Risiko:
    - erst Service-Besitz herstellen,
    - dann Konsumenten sicher umhaengen,
    - danach historische Module bereinigen.
  - UI-free-Vertrag bleibt pruefbarer Pflichtpunkt.
- Findings:
  - S2-F5: S3 muss entscheiden, ob `AppModules.touchlog` vor oder nach `profile/index.js` initialisiert wird. Da Push-Service final ohne Profile funktionieren soll, darf Touchlog nicht mehr auf Profile-Ladezeit angewiesen sein.

##### S2.7 Contract Review S2
- Ergebnis:
  - S2 besteht den Contract Review.
  - Alle S1-Findings haben einen Zielvertrag:
    - S1-F1/S1-F3: `AppModules.push` wird Owner.
    - S1-F2: Profile-Push-DOM-Refs werden entfernbare Altlast, S3 prueft.
    - S1-F4: Touchlog-Surface wandert in `AppModules.touchlog`.
    - S1-F5: `AppModules.assistantSurface` wird bewusst im Touchlog-Vertrag mitgefuehrt oder in S3 separat bewertet.
    - S1-F6: Profile-Fallback in Incidents ist kein Zielzustand.
    - S1-F7: Script-/Initialisierungs-Timing wird S3-Pflichtpunkt.
- Guardrail Review:
  - Keine UI-/Copy-/Layout-Aenderung.
  - Keine Push-Fachlogik-Aenderung.
  - Keine Service-Worker-, SQL-, Edge-, Workflow- oder Android-Aenderung.
  - Diagnose-Push bleibt getrennt.
  - Android-WebView bleibt abgegrenzt.
- Findings:
  - Keine P0/P1-Findings.
  - S2-F1 bis S2-F5 sind S3-/S4-Pflichtpunkte, keine Blocker.

##### S2.8 Schritt-Abnahme und Commit-Empfehlung
- Abnahme:
  - Zielarchitektur steht.
  - Public APIs sind benannt.
  - Migrationsreihenfolge ist konkret.
  - Profile-Fallbacks sind als Migrationsfrage, nicht als Zielzustand klassifiziert.
  - No-UI-Diff bleibt harter Vertrag.
- Doku-Sync:
  - Weitere Source-of-Truth-Doku bleibt fuer S6.
- Commit-Empfehlung:
  - Kein separater Commit nur fuer S2 noetig, wenn S3 direkt folgt.
  - Falls pausiert wird: `docs(touchlog): define push service extraction contract`.

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
  - bestehende Subscriptions ohne Kontextfelder
  - Android-WebView-Kontext
- S3.4 Copy-/UI-Review:
  - keine neue sichtbare Copy gegenueber dem Stand 28.04.2026
  - keine Layout-Aenderung
  - keine Markup-Aenderung ausser Script-Tags, falls noetig
  - Profil bleibt push-frei
  - Touchlog bleibt unveraendert verstaendlich
- S3.5 Diagnose-/Suppression-Review:
  - `last_diagnostic_*` darf `remoteHealthy` nicht ersetzen.
  - Diagnose-Push darf keine fachliche Delivery-Dedupe schreiben.
  - lokale Suppression bleibt nur bei echtem Remote-Health-Nachweis.
- S3.6 Android-WebView-/Widget-Review:
  - WebView bleibt kein Push-Master.
  - Widget bleibt kein Reminder-System.
- S3.7 PII-/Security-Review.
- S3.8 Testplan fuer S5 konkretisieren.
- S3.9 Contract Review S3.
- S3.10 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Bruchrisikoliste.
- Pflichtchecks fuer S4/S5.
- Entscheidung ueber Rueckwaertskompatibilitaet oder harte Migration.

Exit-Kriterium:

- Die Umsetzungsreihenfolge ist klar und risikoarm.

#### S3 Ergebnisprotokoll

##### S3.1 Script-Reihenfolge und Modul-Registrierung
- Umsetzung/Review:
  - `index.html` Script-Reihenfolge geprueft.
- Ist-Zustand:
  - Reihenfolge aktuell:
    - `app/core/diag.js`
    - `app/core/feedback.js`
    - `app/core/pwa.js`
    - `app/modules/push/index.js`
    - Diagnostics logger/perf/monitor
    - `app/diagnostics/devtools.js`
    - Assistant Voice
    - Hub/appointments/profile
    - Incidents spaeter
  - `devtools.js` laedt vor `profile/index.js`.
  - `AppModules.push` laedt vor `devtools.js`, ist zu diesem Zeitpunkt aber noch Facade ohne Profile-Backend.
  - Hub und Voice konsumieren `AppModules.assistantSurface`; diese API kommt aktuell aus `devtools.js`.
- Contract Review:
  - Neues `app/modules/touchlog/index.js` muss frueh genug laden, damit `AppModules.assistantSurface` vor Hub/Voice verfuegbar ist.
  - Touchlog darf nicht dauerhaft auf Profile-Ladezeit angewiesen sein.
  - `AppModules.push` muss nach S4 ohne Profile operativ sein, damit die fruehe Touchlog-Initialisierung stabil bleibt.
- Findings:
  - S3-F1: Touchlog-Modul muss in der Script-Reihenfolge an die bisherige Stelle von `devtools.js` oder davor, sofern es `assistantSurface` besitzt.
  - S3-F2: `devtools.js` kann als Thin Bootstrap bleiben, darf aber nicht die einzige Quelle fuer `assistantSurface` bleiben, wenn Surface-Code nach Touchlog wandert.

##### S3.2 Public-API-Kompatibilitaet
- Umsetzung/Review:
  - Repo-Scan nach Profile-Push-API-Konsumenten und `AppModules.push`-Konsumenten.
- Ergebnis:
  - Direkte neue `AppModules.profile.enablePush/disablePush/...`-Konsumenten ausserhalb Profile wurden nicht gefunden.
  - `incidents/index.js` nutzt bereits bevorzugt `appModules.push`, mit `appModules.profile` als Fallback.
  - `devtools.js` nutzt bereits `AppModules.push`.
  - `appModules.touchlog?.add` wird in Hub-/Assistant-Pfaden optional konsumiert, obwohl noch kein Touchlog-Modul existiert.
- Contract Review:
  - Alte Profile-Push-API kann in S4 entfernt werden, wenn S3/S4-Scan bestaetigt, dass nur `AppModules.push` konsumiert wird.
  - `AppModules.touchlog.add` sollte im neuen Touchlog-Modul als kompatibler Logger-Entry-Point bereitgestellt werden, damit vorhandene optionale Konsumenten nicht dauerhaft no-op bleiben.
- Findings:
  - S3-F3: `AppModules.touchlog.add` ist ein erwarteter optionaler API-Name; S4 muss ihn entweder als Proxy auf `diag.add` bereitstellen oder die Konsumenten bewusst anders behandeln.
  - S3-F4: Profile-Push-APIs koennen Zielzustand entfernt werden; temporaere Delegation nur, wenn S4 beim finalen Scan unbekannte Konsumenten findet.

##### S3.3 Fallback-Verhalten
- Umsetzung/Review:
  - Fallbacks fuer fehlenden Push-Service, fehlendes Profile, Supabase nicht bereit, Notification API, alte Subscriptions und Android-WebView geprueft.
- Ergebnis:
  - `AppModules.push` liefert ohne Profile aktuell konservative Fallbacks:
    - `isPushEnabled() === false`
    - `shouldSuppressLocalPushes() === false`
    - Routingstatus unavailable plus Kontext
  - Profile behandelt Supabase-/Health-Read-Fehler als `healthRefreshError`, nicht als gesund.
  - Incidents suppressen ohne verwertbaren Push-Status nicht lokal.
  - Android-WebView wird in Touchlog blockiert und als Chrome/PWA-Empfehlung dargestellt.
- Contract Review:
  - Zielzustand muss diese konservativen Fallbacks behalten.
  - `enablePush()` darf ohne operativen Service nicht still Erfolg melden.
- Findings:
  - Keine neuen Findings.

##### S3.4 Copy-/UI-Review
- Umsetzung/Review:
  - Touchlog-Markup, CSS-Scope und sichtbare Copy-Vertraege geprueft.
- Ergebnis:
  - No-UI-Diff-Vertrag bleibt realistisch, wenn S4 nur Script-Tags und JS-Besitz verschiebt.
  - Profil-Push-Markup ist weiterhin nicht sichtbar.
  - Profile enthaelt nur noch alte no-op Push-Refs im JS.
- Contract Review:
  - Kein sichtbares Markup aendern.
  - Keine CSS/Layout-Datei fuer UI-Aenderungen anfassen.
  - Keine neue Copy; Android-WebView-Hinweis und Diagnose-Zeilen muessen erhalten bleiben.
- Findings:
  - S3-F5: S5 muss explizit gegen unerwuenschte UI-/Copy-/CSS-Diffs scannen.

##### S3.5 Diagnose-/Suppression-Review
- Umsetzung/Review:
  - `last_diagnostic_*`, `remoteHealthy`, `localSuppressionAllowed`, `shouldSuppressLocalPushes` und `push_notification_deliveries` geprueft.
- Ergebnis:
  - Diagnose-Health wird angezeigt, aber nicht fuer `remoteHealthy` verwendet.
  - `localSuppressionAllowed` ist weiterhin exakt an echten `remoteHealthy` gebunden.
  - `push_notification_deliveries` bleibt fachliche Dedupe-/Delivery-Tabelle.
  - Diagnose-Push ist als separater technischer Pfad dokumentiert und darf Suppression nicht freischalten.
- Contract Review:
  - S4 darf diese Semantik beim Verschieben nach `AppModules.push` nicht veraendern.
  - Ein Code Review muss sicherstellen, dass `lastDiagnosticSuccessAt` nie als Suppression-Grund genutzt wird.
- Findings:
  - Keine neuen Findings.

##### S3.6 Android-WebView-/Widget-Review
- Umsetzung/Review:
  - Android-WebView- und Widget-Grenze aus Roadmap/Doku gegen aktuelle Touchlog-Logik geprueft.
- Ergebnis:
  - Android-WebView ist kein Push-Master.
  - Touchlog blockiert Push-Toggle im Android-WebView-Kontext.
  - Chrome/PWA bleibt empfohlener Reminder-Push-Kanal.
  - Widget bleibt kein Reminder-System.
- Contract Review:
  - S4 darf die WebView-Grenze nicht aufweichen.
  - Keine Android-, TWA-, FCM- oder Widget-Aenderung.
- Findings:
  - Keine.

##### S3.7 PII-/Security-Review
- Umsetzung/Review:
  - Endpoint-Hash, Client-Metadaten und sichtbare Pushdetails geprueft.
- Ergebnis:
  - Sichtbar ist nur gekuerzter Endpoint-Hash, nicht Roh-Endpoint.
  - Client-Kontext ist normalisiert:
    - Kontext
    - Plattform
    - Browser
    - Display-Mode
    - Label
  - Keine Tokens, Keys, UID oder Payloads sollen sichtbar sein.
- Contract Review:
  - S4 muss Roh-Endpunkte weiterhin im Push-Service intern halten, aber nicht in Touchlog anzeigen.
- Findings:
  - Keine neuen Findings.

##### S3.8 Testplan fuer S5 konkretisiert
- Pflichtchecks S5:
  - `node --check` fuer:
    - `app/modules/push/index.js`
    - `app/modules/touchlog/index.js`
    - `app/diagnostics/devtools.js`
    - `app/modules/profile/index.js`
    - `app/modules/incidents/index.js`
  - `git diff --check`.
  - Repo-Scans:
    - keine sichtbare Profil-Push-Surface
    - keine neuen direkten Profile-Push-Konsumenten
    - keine ungeplanten UI-/Copy-/CSS-Aenderungen
    - keine Service-Worker-/SQL-/Edge-/Workflow-Aenderung
    - `last_diagnostic_*` nicht fuer Suppression
  - Static HTTP-Probe fuer `index.html` und neue Scriptpfade.
  - Boot-Smoke:
    - `AppModules.push`
    - `AppModules.touchlog`
    - `AppModules.assistantSurface`
    - `AppModules.touchlog.add`
  - Touchlog-Smoke und Profile-Regression wie Roadmap.
- Findings:
  - S3-F6: S5 muss `assistantSurface` und `touchlog.add` explizit pruefen, nicht nur Push.

##### S3.9 Contract Review S3
- Ergebnis:
  - S3 besteht den Contract Review.
  - S4 kann starten, wenn folgende Pflichtpunkte beachtet werden:
    - `AppModules.push` zuerst owner-faehig machen.
    - `AppModules.touchlog` frueh genug fuer Hub/Voice bereitstellen.
    - `AppModules.assistantSurface` mitnehmen oder stabil separat bereitstellen.
    - `AppModules.touchlog.add` kompatibel bereitstellen.
    - Profile-Fallbacks nur behalten, wenn finaler S4-Scan sie erzwingt.
    - No-UI-Diff strikt pruefen.
    - Diagnose-/Suppression-Semantik unveraendert lassen.
- Findings:
  - S3-F1 bis S3-F6 dokumentiert.
  - Keine P0/P1-Blocker.

##### S3.10 Schritt-Abnahme und Commit-Empfehlung
- Abnahme:
  - Bruchrisiken sind identifiziert.
  - S4-Reihenfolge ist ausreichend risikoarm.
  - S5-Pflichtchecks sind konkret.
- Doku-Sync:
  - S4/S5-Substeps wurden um `AppModules.touchlog.add` und `assistantSurface` ergaenzt.
  - Weitere Module Overviews bleiben fuer S6.
- Commit-Empfehlung:
  - Kein separater Commit nur fuer S3 noetig, wenn S4 direkt folgt.
  - Falls pausiert wird: `docs(touchlog): document migration risk review`.

## S4 - Umsetzung Touchlog-Modul und Push-Service-Extraktion

Ziel:

- Modulgrenzen real im Code herstellen.
- Sichtbares Verhalten moeglichst unveraendert lassen.

Substeps:

- S4.1 Bestehendes Push-Service-Modul vervollstaendigen.
  - Bestehende Push-State-Struktur aus Profil extrahieren.
  - Browser-Subscription-Funktionen uebernehmen.
  - Remote-Health-Auswertung uebernehmen.
  - Diagnose-Health-Auswertung uebernehmen.
  - Subscription-Kontext und Endpoint-Hashing im Push-Service halten.
  - Public API unter `AppModules.push` als primaere API bereitstellen.
- S4.2 Profil als Push-Service-Owner entkoppeln.
  - sichtbare Profil-Funktionalitaet unveraendert lassen.
  - Push-Funktionen aus Profil entfernen.
  - temporaere/deprecated Delegation zu `AppModules.push` nur, wenn S3 das als Boot-/Kompatibilitaetsrisiko freigibt.
  - Profil-DOM darf keine Push-IDs erwarten.
- S4.3 Incidents auf Push-Service umstellen.
  - `getPushRoutingStatus` aus `AppModules.push`.
  - `shouldSuppressLocalPushes` aus `AppModules.push`.
  - Fallback unveraendert konservativ.
  - Profile-Fallback entfernen, wenn S3 bestaetigt, dass `AppModules.push` vor Incidents stabil verfuegbar ist.
- S4.4 Touchlog-Modul anlegen.
  - DOM-Bindings fuer `#diag`-Maintenance-Surface uebernehmen.
  - Push-Wartung ueber `AppModules.push`.
  - bestehende Kontext-/Geraet-/Diagnose-/Endpoint-Hash-Zeilen erhalten.
  - lokale Diagnosemodi und aktive Modi sauber besitzen.
  - `Touchlog leeren` ueber `diag.clear()`.
  - `AppModules.assistantSurface` bewusst mitnehmen oder nach S3-Entscheid separat abgrenzen.
  - `AppModules.touchlog.add` als kompatiblen Logger-Entry-Point bereitstellen, falls vorhandene Konsumenten diesen optionalen Pfad nutzen.
- S4.5 `devtools.js` bereinigen.
  - nur noch Thin Bootstrap oder wirklich diagnostics-nahe Helfer.
  - keine Profile-Push-Direktabhaengigkeit.
- S4.6 Script-Reihenfolge und Initialisierung anpassen.
- S4.7 No-UI-Diff-Review:
  - keine neue Copy gegenueber Stand 28.04.2026
  - keine sichtbare Markup-Aenderung
  - keine CSS-/Layout-Aenderung
  - Touchlog und Profil sehen aus wie im Referenzzustand nach dem 28.04.2026
  - Android-WebView-Hinweis und Diagnose-Zeilen bleiben erhalten
- S4.8 Zwischen-Contract-Review.
- S4.9 Korrektur eventueller Findings.

Output:

- `AppModules.touchlog` fuer sichtbare Touchlog-Surface.
- `AppModules.push` fuer Push-Service.
- Profil ohne Push-Service-Besitz.
- Incidents und Touchlog konsumieren Push-Service.

Exit-Kriterium:

- App bootet, Touchlog funktioniert, Profil bleibt push-frei, Push-Control bleibt im Touchlog nutzbar.

#### S4.1 Ergebnisprotokoll

Status: DONE am 30.04.2026.

Umsetzung:

- `app/modules/push/index.js` wurde vom reinen Kontext-/Facade-Modul zum operativen Browser-Push-Service erweitert.
- `AppModules.push` besitzt nun selbst:
  - Push-State und Routing-Snapshot
  - Browser-Support-Pruefung
  - Service-Worker-/PushManager-Subscription-Zugriff
  - Browser-Opt-in und Opt-out
  - Supabase-Subscription-Upsert/Delete
  - Remote-Health-Abfrage
  - Diagnose-Health-Felder
  - Subscription-Kontext
  - Endpoint-Hashing
  - lokale Suppression nur bei `remoteHealthy`
- Die bisherige Legacy-Delegation von `AppModules.push` an `AppModules.profile` wurde entfernt.
- Profile selbst wurde in S4.1 noch nicht entkoppelt; das bleibt bewusst S4.2.
- Incidents wurde in S4.1 noch nicht angepasst; der Profile-Fallback bleibt bewusst S4.3.
- Touchlog-/Devtools-Code wurde in S4.1 noch nicht verschoben; das bleibt bewusst S4.4/S4.5.

Contract Review:

- Syntax:
  - `node --check app/modules/push/index.js`
  - `node --check app/modules/profile/index.js`
  - `node --check app/diagnostics/devtools.js`
  - `node --check app/modules/incidents/index.js`
- Diff:
  - `git diff --check -- app/modules/push/index.js "docs/MIDAS Touchlog Module & Push Service Extraction Roadmap.md"`
  - Ergebnis: keine Whitespace-Fehler; nur bestehender LF/CRLF-Hinweis.
- API:
  - `AppModules.push` bietet weiterhin die in S2 definierte Public API.
  - `hasOperationalPushApi()` ist nun service-eigen und nicht mehr von Profile abhaengig.
  - `last_diagnostic_*` wird weiterhin nur gelesen/angezeigt und nicht fuer lokale Suppression genutzt.
  - `remoteHealthy` bleibt aus Remote-Erfolg/-Fehler/disabled/consecutive failures abgeleitet.

Findings:

- S4.1-F1: `app/modules/profile/index.js` enthaelt weiterhin operative Push-Kopie. Das ist erwartet und wird in S4.2 entfernt oder delegiert.
- S4.1-F2: `app/modules/incidents/index.js` enthaelt weiterhin den Profile-Fallback. Das ist erwartet und wird in S4.3 entfernt, sofern der finale Scan keine unbekannten Konsumenten findet.
- S4.1-F3: `app/diagnostics/devtools.js` enthaelt noch historischen Kommentar zur temporaeren Profile-Backend-Rolle. Das ist fuer Laufzeit nicht kritisch und wird in S4.5 mit der Devtools-Bereinigung korrigiert.

#### S4.2 Ergebnisprotokoll

Status: DONE am 30.04.2026.

Umsetzung:

- `app/modules/profile/index.js` wurde als Push-Service-Owner entkoppelt.
- Entfernt aus Profile:
  - Push-Selectors und Push-Refs (`profilePush*`)
  - Push-State (`pushSyncing`, `pushRouting`)
  - VAPID-/Subscription-Helfer
  - Browser-Subscription-Zugriff
  - Supabase-Zugriff auf `push_subscriptions`
  - Remote-Health-Auswertung
  - Diagnose-Health-Auswertung
  - `enablePush`, `disablePush`, `isPushEnabled`, `refreshPushStatus`, `getPushRoutingStatus`, `shouldSuppressLocalPushes`
  - Init-Refresh fuer Push bei DOM Ready und `supabase:ready`
- `AppModules.profile` exportiert nur noch Profil-API:
  - `init`
  - `sync`
  - `getData`
- Sichtbare Profilfunktionalitaet wurde nicht geaendert.
- `docs/modules/Profile Module Overview.md` wurde auf den neuen Zielzustand aktualisiert: Profile besitzt keine Push-Service-API mehr; Push gehoert zu `AppModules.push` und zur Touchlog-Wartung.

Contract Review:

- Syntax:
  - `node --check app/modules/profile/index.js`
- Profile-Scan:
  - keine Push-DOM-Refs
  - keine `profilePush*`-IDs
  - keine Push-State-Variablen
  - keine VAPID-/Service-Worker-/PushManager-Logik
  - kein Zugriff auf `push_subscriptions`
  - keine Profile-Push-API-Exports
- Doku-Scan:
  - Profile Overview beschreibt Push nicht mehr als interne Profile-Verantwortung.
- Diff:
  - `git diff --check -- app/modules/profile/index.js "docs/modules/Profile Module Overview.md"`
  - Ergebnis: keine Whitespace-Fehler; nur bestehender LF/CRLF-Hinweis.

Findings:

- S4.2-F1: `app/modules/incidents/index.js` enthaelt weiterhin `appModules.push || appModules.profile || null`. Das ist jetzt ein harmloser, aber toter Profile-Fallback, weil Profile keine Push-API mehr exportiert. Entfernung folgt in S4.3.
- S4.2-F2: `app/diagnostics/devtools.js` enthaelt noch den Kommentar, dass Profile temporaeres Backend sei. Das ist durch S4.1/S4.2 fachlich veraltet und wird in S4.5 bereinigt.

#### S4.3 Ergebnisprotokoll

Status: DONE am 30.04.2026.

Umsetzung:

- `app/modules/incidents/index.js` konsumiert fuer lokale Push-Suppression nur noch `AppModules.push`.
- Der tote Profile-Fallback `appModules.push || appModules.profile || null` wurde entfernt.
- Die bestehende konservative Logik bleibt erhalten:
  - Wenn `AppModules.push` oder `getPushRoutingStatus` fehlt, wird nicht lokal unterdrueckt.
  - Bei stale Routing-State versucht Incidents weiterhin `AppModules.push.refreshPushStatus({ reason: 'incidents-routing-check' })`.
  - Lokale Suppression erfolgt weiterhin nur ueber `AppModules.push.shouldSuppressLocalPushes()`.
- `docs/modules/Push Module Overview.md` und `docs/modules/Touchlog Module Overview.md` wurden auf den neuen Zielzustand aktualisiert:
  - Profile ist kein Push-Backend.
  - Profile ist kein Fallback-Pfad.
  - `AppModules.push` exportiert den Push-Routing-Stand fuer Incidents und Touchlog.

Contract Review:

- Syntax:
  - `node --check app/modules/incidents/index.js`
  - `node --check app/modules/push/index.js`
  - `node --check app/modules/profile/index.js`
- Repo-Scan:
  - keine `appModules.profile ||` Push-Fallbacks mehr
  - keine direkten `AppModules.profile.*Push*`-Konsumenten
  - keine veralteten Doku-Aussagen zu Profile als temporaerem Push-Backend
- Suppression-Vertrag:
  - `last_diagnostic_*` bleibt im Push-Service Diagnoseanzeige und wird nicht von Incidents fuer lokale Suppression verwendet.
  - `shouldSuppressLocalPushes()` haengt weiter an `localSuppressionAllowed`, das im Push-Service nur aus `remoteHealthy` entsteht.
- Diff:
  - `git diff --check -- app/modules/incidents/index.js "docs/modules/Push Module Overview.md" "docs/modules/Touchlog Module Overview.md"`
  - Ergebnis: keine Whitespace-Fehler; nur bestehender LF/CRLF-Hinweis.

Findings:

- Keine S4.3-Findings offen.
- S4.2-F1 ist erledigt.
- S4.2-F2 bleibt fuer S4.5: `app/diagnostics/devtools.js` enthaelt noch veralteten Kommentar zur temporaeren Profile-Backend-Rolle.

#### S4.4 Ergebnisprotokoll

Status: DONE am 30.04.2026.

Umsetzung:

- Neues Modul `app/modules/touchlog/index.js` angelegt.
- Bestehende Touchlog-Surface-Verantwortung aus `app/diagnostics/devtools.js` nach `app/modules/touchlog/index.js` verschoben:
  - DOM-Bindings fuer `#devTogglePush`, `#devPushStatus`, `#devPushDetails`
  - Push-Wartung ueber `AppModules.push`
  - Kontext-/Geraet-/Diagnose-/Endpoint-Hash-Zeilen
  - Android-WebView-Hinweis
  - lokale Diagnosemodi Sound, Haptik, No Cache, Assistant
  - aktive Modi als Pills
  - `Touchlog leeren` ueber `diag.clear()`
- `AppModules.assistantSurface` wird nun im Touchlog-Modul bereitgestellt.
- `AppModules.touchlog` wird bereitgestellt mit:
  - `init()`
  - `refreshPushStatus(reason?)`
  - `updateActiveModes()`
  - `add(...)`
- `AppModules.touchlog.add(...)` ist als kompatibler Entry-Point vorhanden und leitet auf `diag.add(...)`.
- `app/diagnostics/devtools.js` ist jetzt ein Thin Bootstrap fuer `AppModules.touchlog.init()`.
- `index.html` laedt `app/modules/touchlog/index.js` direkt vor `app/diagnostics/devtools.js`, also an der bisherigen fruehen Touchlog-/Assistant-Surface-Position.
- Dokumentation aktualisiert:
  - `docs/modules/Touchlog Module Overview.md`
  - `docs/modules/Diagnostics Module Overview.md`
  - `docs/modules/Sensory Feedback Module Overview.md`

Contract Review:

- Syntax:
  - `node --check app/modules/touchlog/index.js`
  - `node --check app/diagnostics/devtools.js`
  - `node --check app/modules/push/index.js`
  - `node --check app/modules/incidents/index.js`
  - `node --check app/modules/profile/index.js`
- Boot-/API-Scan:
  - `app/modules/touchlog/index.js` laedt vor Hub und Voice.
  - `AppModules.assistantSurface` ist weiterhin vor Hub-/Voice-Konsum verfuegbar.
  - `AppModules.touchlog.add` ist fuer bestehende Hub-Konsumenten vorhanden.
  - `touchlog.init()` ist idempotent und plant waehrend `document.loading` nur ein DOMContentLoaded-Binding.
- Profile-Abgrenzung:
  - Touchlog-Modul enthaelt keine direkte Profile-Abhaengigkeit.
  - `devtools.js` enthaelt keine Profile-Push-Rolle mehr.
- Diff:
  - `git diff --check -- app/diagnostics/devtools.js index.html "docs/modules/Touchlog Module Overview.md" "docs/modules/Diagnostics Module Overview.md" "docs/modules/Sensory Feedback Module Overview.md"`
  - Ergebnis: keine Whitespace-Fehler; nur bestehender LF/CRLF-Hinweis.
  - Fuer die neue Datei `app/modules/touchlog/index.js`: `node --check` erfolgreich und kein trailing whitespace per `Select-String`.

Findings:

- Keine S4.4-Findings offen.
- S4.2-F2 ist durch den Thin-Bootstrap erledigt; `devtools.js` beschreibt Profile nicht mehr als temporaeres Backend.
- S4.5 bleibt als Rest-Bereinigung/Review bestehen, ist aber durch S4.4 bereits weitgehend vorbereitet.

#### S4.5 Ergebnisprotokoll

Status: DONE am 30.04.2026.

Umsetzung:

- `app/diagnostics/devtools.js` wurde als Thin Bootstrap bestaetigt:
  - keine Touchlog-DOM-Bindings
  - keine Push-Wartungslogik
  - keine lokale Diagnosemodus-Logik
  - keine `assistantSurface`-Implementierung
  - keine Profile- oder Profile-Push-Abhaengigkeit
  - einzige Aufgabe: `AppModules.touchlog.init()` nach DOM-Bereitschaft aufrufen
- Rest-Doku bereinigt:
  - `docs/modules/Push Module Overview.md` nennt `app/modules/touchlog/index.js` als sichtbare Push-Wartung und `devtools.js` nur noch als Thin Bootstrap.
  - `docs/modules/Touchlog Module Overview.md` entfernt `Profile-Push-Backend` aus Dependencies/Risiken und verweist auf `AppModules.push`.

Contract Review:

- Syntax:
  - `node --check app/diagnostics/devtools.js`
  - `node --check app/modules/touchlog/index.js`
- Devtools-Scan:
  - keine `devToggle*`-/`devPush*`-DOM-Bindings
  - kein `AppModules.push`
  - kein `AppModules.profile`
  - kein `Notification`, `PushManager`, `serviceWorker`
  - kein `localStorage`
  - kein `diag.add` oder `diag.clear`
- Doku-Scan:
  - keine aktuellen Aussagen mehr, dass `devtools.js` die sichtbare Push-Wartung besitzt.
  - keine aktuellen Aussagen mehr, dass Profile temporaeres Push-Backend ist.
  - Treffer wie `Profile ist kein Push-Backend` sind korrekt.
- Diff:
  - `git diff --check -- app/diagnostics/devtools.js "docs/modules/Push Module Overview.md" "docs/modules/Touchlog Module Overview.md"`
  - Ergebnis: keine Whitespace-Fehler; nur bestehender LF/CRLF-Hinweis.

Findings:

- Keine S4.5-Findings offen.
- S4.1-F3 und S4.2-F2 sind erledigt.

#### S4.6 Ergebnisprotokoll

Status: DONE am 30.04.2026.

Umsetzung:

- Keine weitere Codeaenderung noetig; die benoetigte Script-Reihenfolge wurde bereits in S4.4 hergestellt und in S4.6 verifiziert.
- Aktuelle Reihenfolge in `index.html`:
  - `app/modules/push/index.js`
  - `app/modules/touchlog/index.js`
  - `app/diagnostics/devtools.js`
  - `app/modules/assistant-stack/voice/index.js`
  - `app/modules/hub/index.js`
  - `app/modules/incidents/index.js`
- Damit gilt:
  - `AppModules.push` ist vor Touchlog verfuegbar.
  - `AppModules.touchlog` und `AppModules.assistantSurface` sind vor Voice und Hub verfuegbar.
  - `AppModules.touchlog.add` ist vor den Hub-Konsumenten verfuegbar.
  - Incidents startet nach dem Push-Service und nutzt keinen Profile-Fallback mehr.

Contract Review:

- Syntax:
  - `node --check app/modules/touchlog/index.js`
  - `node --check app/diagnostics/devtools.js`
  - `node --check app/modules/push/index.js`
  - `node --check app/modules/assistant-stack/voice/index.js`
  - `node --check app/modules/hub/index.js`
  - `node --check app/modules/incidents/index.js`
- Script-Reihenfolge:
  - `push`: `index.html:1762`
  - `touchlog`: `index.html:1766`
  - `devtools`: `index.html:1767`
  - `voice`: `index.html:1769`
  - `hub`: `index.html:1780`
  - `incidents`: `index.html:1821`
- Initialisierung:
  - `touchlog.init()` ist idempotent (`state.bound`).
  - waehrend `document.loading` wird nur ein DOMContentLoaded-Bind geplant (`state.initScheduled`).
  - `devtools.js` ruft nur `AppModules.touchlog.init()` auf und kann keine eigene Surface-Doppelbindung erzeugen.
- API-Vertrag:
  - Hub/Voice koennen `AppModules.assistantSurface` konsumieren.
  - Hub kann `AppModules.touchlog.add` konsumieren.
  - Incidents konsumiert `AppModules.push`.
- Diff:
  - `git diff --check -- index.html app/modules/touchlog/index.js app/diagnostics/devtools.js "docs/MIDAS Touchlog Module & Push Service Extraction Roadmap.md"`
  - Ergebnis: keine Whitespace-Fehler; nur bestehender LF/CRLF-Hinweis.

Findings:

- Keine S4.6-Findings offen.

#### S4.7 Ergebnisprotokoll

Status: DONE am 30.04.2026.

Umsetzung:

- Keine Codeaenderung noetig; S4.7 war ein No-UI-Diff-Review.
- Sichtbarer Zustand bleibt auf dem Referenzstand nach dem 28.04.2026:
  - kein neues Markup ausser einem Script-Tag fuer `app/modules/touchlog/index.js`
  - keine CSS-/Layout-Aenderung
  - keine neue sichtbare Touchlog-Copy
  - keine sichtbare Profile-Push-Surface
  - Touchlog bleibt die einzige sichtbare Push-Wartungsflaeche

Contract Review:

- `index.html`:
  - Diff enthaelt nur den neuen Script-Tag `app/modules/touchlog/index.js` vor `app/diagnostics/devtools.js`.
  - Touchlog-Markup unveraendert.
  - Profil-Markup unveraendert.
- Styles:
  - kein Diff in `app/styles`, `app/app.css`, `assets/css` oder `assets/js`.
- Touchlog-Copy:
  - sichtbare Push-Status-/Detailtexte wurden aus dem alten `app/diagnostics/devtools.js` nach `app/modules/touchlog/index.js` verschoben.
  - Strings wie `Push: Android-WebView - Chrome/PWA empfohlen`, `Push: Browser-Abo fehlt`, `Push: aktiv - remote gesund`, `Health-Check offen`, Endpoint-Hash-/Diagnose-Zeilen und Android-WebView-Hinweis bleiben erhalten.
- Profile:
  - kein `profilePush*`
  - kein `Push & Erinnerungen`
  - keine `Push aktivieren`-/`Push deaktivieren`-Buttons im Profil
  - `Push-Wartung` und `Push-Benachrichtigungen` existieren nur im Touchlog-Markup.
- Diff:
  - `git diff --check -- index.html app/diagnostics/devtools.js "docs/MIDAS Touchlog Module & Push Service Extraction Roadmap.md"`
  - Ergebnis: keine Whitespace-Fehler; nur bestehender LF/CRLF-Hinweis.
  - Neue Datei `app/modules/touchlog/index.js`: kein trailing whitespace per `Select-String`.

Findings:

- Keine S4.7-Findings offen.

#### S4.8 Ergebnisprotokoll

Status: DONE am 30.04.2026.

Umsetzung:

- Zwischen-Contract-Review fuer S4.1 bis S4.7 durchgefuehrt.
- Keine Codeaenderung in S4.8 noetig.

Contract Review:

- Syntax:
  - `node --check app/modules/push/index.js`
  - `node --check app/modules/profile/index.js`
  - `node --check app/modules/incidents/index.js`
  - `node --check app/modules/touchlog/index.js`
  - `node --check app/diagnostics/devtools.js`
  - `node --check app/modules/assistant-stack/voice/index.js`
  - `node --check app/modules/hub/index.js`
- Diff-/Whitespace:
  - `git diff --check`
  - Ergebnis: keine Whitespace-Fehler; nur bestehende LF/CRLF-Hinweise.
  - Neue Datei `app/modules/touchlog/index.js` separat per `Select-String` auf trailing whitespace geprueft.
- Scope:
  - keine Aenderungen an Service Worker, SQL, GitHub Actions, Android oder externem Backend.
  - keine Style-Diffs.
  - `index.html` enthaelt nur den neuen Script-Tag fuer `app/modules/touchlog/index.js`.
- Script-Reihenfolge:
  - `push` vor `touchlog`
  - `touchlog` vor `devtools`
  - `touchlog` vor `voice` und `hub`
  - `incidents` nach `push`
- Profile-/Push-Abgrenzung:
  - keine Profile-Push-API-Exports mehr in `app/modules/profile/index.js`
  - keine direkten `AppModules.profile.*Push*`-Konsumenten
  - kein `appModules.profile ||` Fallback mehr
  - `AppModules.push` ist operativer Push-Service-Owner
  - Incidents konsumiert `AppModules.push`
  - Touchlog konsumiert `AppModules.push`
- Touchlog-/Diagnostics-Abgrenzung:
  - `app/modules/touchlog/index.js` besitzt die sichtbare Surface.
  - `app/diagnostics/devtools.js` ist Thin Bootstrap.
  - `AppModules.assistantSurface` und `AppModules.touchlog.add` sind vor Hub/Voice verfuegbar.
- UI-Vertrag:
  - kein neues sichtbares Markup ausser Script-Tag.
  - keine CSS-/Layout-Aenderung.
  - keine sichtbare Profile-Push-Surface.
  - sichtbare Touchlog-Copy wurde nur aus `devtools.js` nach `touchlog/index.js` verschoben.

Findings:

- Keine S4.8-Findings offen.

#### S4.9 Ergebnisprotokoll

Status: DONE am 30.04.2026.

Umsetzung:

- S4.9 war die Korrekturphase fuer Findings aus S4.8.
- Da S4.8 keine Findings ergeben hat, war keine Codekorrektur notwendig.

Contract Review:

- S4.8-Pruefungen bleiben gueltig.
- Keine neuen Aenderungen durch S4.9.

Findings:

- Keine S4.9-Findings offen.

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
  - keine unbeabsichtigten Edge-/SQL-/Workflow-/Service-Worker-Aenderungen
  - keine direkten neuen `AppModules.profile.*Push*`-Konsumenten
  - `AppModules.touchlog.add`-Konsumenten laufen nicht ins Leere
- S5.4 Boot-Smoke:
  - App laedt
  - Module registrieren in richtiger Reihenfolge
  - keine Console-/Touchlog-Fehler durch fehlende APIs
  - `AppModules.assistantSurface` ist vor Hub-/Voice-Konsum verfuegbar
  - `AppModules.touchlog.add` ist vorhanden oder vorhandene optionalen Konsumenten bleiben sicher no-op
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
  - Android-WebView bleibt blockiert und verweist auf Chrome/PWA
  - Diagnose-Health bleibt von Remote-Health getrennt
- S5.8 Incident-Suppression-Smoke:
  - konservativer Fallback ohne Remote-Health
  - Suppression nur bei remoteHealthy
- S5.9 Diagnose-/Regression-Smoke:
  - `last_diagnostic_success_at` loest keine lokale Suppression aus.
  - technischer Diagnose-Push bleibt kein fachliches Delivery-Event.
  - bestehende Subscription-Kontextfelder bleiben sicher und ohne Rohdatenanzeige.
- S5.10 Code Review gegen Modulgrenzen.
- S5.11 UI-free Contract Review:
  - kein sichtbarer UI-Diff
  - keine neue Copy
  - keine Layout-Aenderung
  - keine neue Nutzerfuehrung
- S5.12 Contract Review gegen Guardrails.
- S5.13 Korrektur eventueller Findings.
- S5.14 Schritt-Abnahme und Commit-Empfehlung.

Output:

- Getestete Modulgrenze.
- Dokumentierte Restsmokes, falls echter Remote-Push nicht lokal erzwingbar ist.
- Dokumentierter Umgang mit dem akzeptierten Restpunkt "Touchlog-Health kann bei alten/mehreren Subscriptions nervoes wirken".

Exit-Kriterium:

- Keine offenen P0/P1-Findings.
- Sichtbares Verhalten entspricht dem Zustand nach der abgeschlossenen Push-Channel-Robustness-Roadmap.

### S5 Ergebnisprotokoll 30.04.2026

Umsetzung:

- S5.1 Syntax-Check abgeschlossen:
  - `node --check` fuer `app/modules/push/index.js`
  - `node --check` fuer `app/modules/profile/index.js`
  - `node --check` fuer `app/modules/incidents/index.js`
  - `node --check` fuer `app/modules/touchlog/index.js`
  - `node --check` fuer `app/diagnostics/devtools.js`
  - `node --check` fuer relevante Konsumenten (`assistant-stack/voice`, `hub`, `diag`, `feedback`)
- S5.2 Diff-Check abgeschlossen:
  - `git diff --check` ohne Whitespace-Fehler.
  - Neues untracked Touchlog-Modul separat auf trailing whitespace geprueft.
- S5.3 Repo-Scan abgeschlossen:
  - keine sichtbare Profil-Push-Surface im App-Code.
  - keine direkte neue `AppModules.profile.*Push*`-Abhaengigkeit.
  - Touchlog zeigt nur `Endpoint-Hash`, keine rohen Subscription-Secrets.
  - keine Service-Worker-, SQL-, GitHub-Actions-, Android- oder CSS-/Style-Diffs.
- S5.4 Boot-Smoke abgeschlossen:
  - Node-VM-Smoke registriert `AppModules.push`, `AppModules.touchlog`, `AppModules.assistantSurface`.
  - `AppModules.touchlog.add` ist vorhanden.
  - `devtools.js` bleibt Thin Bootstrap und wirft beim Mock-Boot keinen Fehler.
- S5.5 Touchlog-Smoke statisch abgeschlossen:
  - Touchlog-Container, Close-Button, Push-Wartung, aktive Modi und Clear-Log-API sind verdrahtet.
  - Visuelles Oeffnen/Schliessen und Log-Leeren bleiben lokaler Browser-Smoke.
- S5.6 Profile-Regression statisch abgeschlossen:
  - Profil-Stammdaten, Arztfelder, Limits und Medication-Snapshot bleiben vorhanden.
  - Profil enthaelt keine Push-Section und keine Push-Buttons.
- S5.7 Push-Control-Smoke statisch abgeschlossen:
  - Touchlog nutzt `AppModules.push.enablePush`, `disablePush`, `isPushEnabled`, `refreshPushStatus` und `getPushRoutingStatus`.
  - Android-WebView-Block/Hinweis bleibt im Touchlog-Kontext.
  - Echtes Permission-/Subscription-Verhalten bleibt lokaler Browser-/Android-Smoke.
- S5.8 Incident-Suppression-Smoke abgeschlossen:
  - Fallback ohne Remote-Health bleibt konservativ.
  - Suppression greift nur bei echter `remoteHealthy`-Ableitung.
- S5.9 Diagnose-/Regression-Smoke abgeschlossen:
  - `last_diagnostic_success_at` loest keine lokale Suppression aus.
  - technischer Diagnose-Push bleibt getrennt von Remote-Delivery-Health.
- S5.10 Code Review gegen Modulgrenzen abgeschlossen:
  - Push-Service besitzt Push-Kontext, Subscription, Routing und Health.
  - Touchlog besitzt sichtbare Wartungsflaeche.
  - Profile ist push-frei.
  - Incidents konsumiert Push ueber `AppModules.push`.
- S5.11 UI-free Contract Review abgeschlossen:
  - `index.html` erhaelt nur die notwendige Script-Einbindung fuer `app/modules/touchlog/index.js`.
  - keine CSS-/Layout-/Copy-Aenderung als Teil von S5.
- S5.12 Guardrail Contract Review abgeschlossen:
  - keine Edge-/SQL-/Workflow-/Service-Worker-/Android-Native-Aenderung.
  - Browser/PWA bleibt Push Master, Android WebView bleibt nicht der Reminder-Push-Kanal.
- S5.13 Findings-Korrektur:
  - keine P0/P1-Findings offen.
  - keine Codekorrektur durch S5.13 notwendig.
- S5.14 Schritt-Abnahme:
  - S5 ist abgeschlossen.
  - Commit-Empfehlung: nach S6 zusammen mit Doku-Sync und Abschlussreview committen, damit Refaktor und Dokumentation als ein zusammenhaengender Abschluss landen.

Contract Review:

- Der Refaktor bleibt UI-frei.
- Die sichtbare Push-Wartung bleibt im Touchlog.
- Profile bleibt frei von Push-Bedienung und Push-Zustandsanzeige.
- Diagnose-Health und echte Remote-Health bleiben getrennt.
- Der akzeptierte Restpunkt bleibt dokumentiert: Touchlog-Health kann bei alten oder mehreren Subscriptions kurz nervoes wirken; das ist kein Blocker, solange lokale Suppression konservativ bleibt.

Lokale Restsmokes:

- Browser/PWA: App laden, Touchlog oeffnen/schliessen, Log leeren, aktive Modi toggeln. Status: vom User lokal abgenommen.
- Browser/PWA: Push im Touchlog aktivieren/deaktivieren und Status nach Refresh pruefen. Status: vom User lokal abgenommen.
- Profil: oeffnen, speichern/refreshen, bestaetigen dass keine Push-Section sichtbar ist. Status: vom User lokal abgenommen.
- Android WebView: bestaetigen, dass Push geblockt bleibt und auf Chrome/PWA verweist. Status: vom User lokal abgenommen.
- Optionaler Real-Smoke: manuellen Scheduler/Push ausloesen und pruefen, dass echte Remote-Health erst nach echtem Delivery-Erfolg gesund wird. Status: offen/optional, nicht blockierend.

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
  - Remote-Health vs. Diagnose-Health nach finaler Extraktion
- S6.3 `docs/modules/Profile Module Overview.md` aktualisieren:
  - Profil hat keine Push-Service-Verantwortung mehr oder nur dokumentierte temporaere Delegation.
- S6.4 `docs/modules/Diagnostics Module Overview.md` aktualisieren:
  - Devtools/Touchlog/Diagnostics-Abgrenzung aktualisieren.
- S6.5 `docs/modules/Android Widget Module Overview.md` und `docs/modules/Android Native Auth Module Overview.md` nur aktualisieren, falls die Extraktion den heute dokumentierten Android-/Widget-Vertrag beruehrt.
- S6.6 `docs/QA_CHECKS.md` aktualisieren.
- S6.7 Diese Roadmap mit Ergebnisprotokollen aktualisieren.
- S6.8 Finaler Contract Review:
  - Code vs. Roadmap
  - Code vs. Module Overviews
  - QA vs. bekannte Risiken
  - README-/MIDAS-Guardrails
- S6.9 Abschluss-Abnahme:
  - keine offenen P0/P1-Risiken
  - Restrisiken dokumentiert
  - nicht betroffene Schichten bleiben unberuehrt
- S6.10 Commit-Empfehlung.
- S6.11 Archiv-Entscheidung.

Output:

- Dokumentierte und abgeschlossene Modulgrenzen-Migration.

Exit-Kriterium:

- Code, Doku, QA und Roadmap sprechen denselben finalen Touchlog-/Push-Service-Vertrag.

### S6 Ergebnisprotokoll 30.04.2026

Umsetzung:

- S6.1 `docs/modules/Touchlog Module Overview.md` final synchronisiert:
  - `app/modules/touchlog/index.js` ist als eigenes Touchlog-Code-Modul dokumentiert.
  - Touchlog nutzt `AppModules.push` und besitzt die sichtbare Maintenance-Surface.
  - Zukunftsabschnitt korrigiert: Push-Service-Extraktion ist nicht mehr Zukunft, sondern erledigter Vertrag.
- S6.2 `docs/modules/Push Module Overview.md` final synchronisiert:
  - `AppModules.push` ist Push-Service-Owner fuer Subscription, Routing, Remote-Health und Diagnose-Health.
  - Touchlog und Incidents sind Konsumenten.
  - `last_diagnostic_*` bleibt technische Diagnose und ersetzt keine echte Remote-Health.
  - Zukunftsabschnitt korrigiert: weitere Push-Service-Erweiterungen bleiben in `AppModules.push`; Profile bleibt push-frei.
- S6.3 `docs/modules/Profile Module Overview.md` reviewed:
  - Profil ist Stammdaten-/Kontextmodul.
  - keine Push-Service-API, keine Push-Wartung, keine lokale Suppression im Profil.
- S6.4 `docs/modules/Diagnostics Module Overview.md` reviewed:
  - Diagnostics-Core und Touchlog-Surface sind getrennt dokumentiert.
  - `devtools.js` ist Thin Bootstrap fuer historische Touchlog-Initialisierung.
- S6.5 Android-Dokus reviewed:
  - keine Aenderung notwendig, da die Roadmap keine Android-Native-/Widget-Schicht veraendert.
  - Android-WebView-Grenze bleibt in Push-/Touchlog-Doku und QA dokumentiert.
- S6.6 `docs/QA_CHECKS.md` aktualisiert:
  - neue Phase P12 fuer Touchlog Module & Push Service Extraction.
  - lokale User-Abnahme eingetragen; optionaler manueller echter Push-Smoke bleibt offen/nicht blockierend.
- S6.7 Roadmap aktualisiert:
  - S5-Abnahme mit lokalen Smokes ergaenzt.
  - S6-Protokoll und finaler Status gesetzt.
- S6.8 Finaler Contract Review abgeschlossen:
  - Code vs. Roadmap: konsistent.
  - Code vs. Module Overviews: konsistent.
  - QA vs. bekannte Risiken: konsistent.
  - README-/MIDAS-Guardrails: keine Abweichung gefunden.
- S6.9 Abschluss-Abnahme:
  - keine offenen P0/P1-Risiken.
  - Live-Server-Smoke vom User abgenommen: alles funktioniert.
  - optionaler echter manueller Push-Smoke bleibt Beobachtungspunkt, aber kein Roadmap-Blocker.
  - nicht betroffene Schichten bleiben unberuehrt.
- S6.10 Commit-Empfehlung:
  - `refactor(touchlog): extract push service from profile`
- S6.11 Archiv-Entscheidung:
  - Roadmap ist fachlich abgeschlossen.
  - Archivieren ist nach finalem Git-Review sinnvoll.

Contract Review:

- Keine sichtbare UI-/Copy-/Layout-Aenderung wurde durch S6 eingefuehrt.
- Push-Wartung bleibt sichtbar im Touchlog.
- Profile bleibt push-frei.
- Browser/PWA bleibt Push Master; Android-WebView bleibt abgegrenzt.
- Service Worker, Backend, SQL, GitHub Actions und Android Native bleiben von dieser Roadmap unberuehrt.

Findings:

- Keine P0/P1-Findings offen.
- Doku-Drift in zwei Zukunftsabschnitten wurde korrigiert.

Abnahme:

- Live Server funktioniert laut User-Abnahme.
- Roadmap ist abgeschlossen und archivfaehig.

Restrisiko:

- Optionaler manueller echter Push-Smoke steht noch aus, ist aber nicht blockierend, weil lokale Suppression weiterhin konservativ bleibt und Diagnose-Health keine medizinische Suppression freischaltet.

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
- UI, Layout und Copy bleiben gegenueber Stand 28.04.2026 unveraendert.
- Push aktivieren/deaktivieren bleibt im Touchlog erreichbar.
- Push-Routing-Status bleibt fuer Incidents verfuegbar.
- Lokale Suppression bleibt konservativ.
- Diagnose-Push bleibt von medizinischer Delivery-Dedupe und lokaler Suppression getrennt.
- Android-WebView bleibt abgegrenzt und wird nicht als Push-Master verkauft.
- Keine sensiblen Push-Rohdaten sichtbar.
- Kein Service-Worker-, Backend-, SQL- oder Android-Umbau.
- Doku beschreibt dieselben Modulgrenzen wie der Code.

## Abnahmekriterien

- `AppModules.touchlog` besitzt die sichtbare Touchlog-Surface.
- `AppModules.push` besitzt Push-Service, Subscription-Kontext, Remote-Health, Diagnose-Health und Routing-Health.
- `AppModules.profile` besitzt keine sichtbare oder primaere Push-Verantwortung mehr.
- `AppModules.incidents` konsumiert Push-Routing ueber Push-Service.
- User-facing Verhalten bleibt gegenueber dem Stand nach der Push-Channel-Robustness-Roadmap stabil.

## Commit-Empfehlung

Nach Abschluss geeignet:

- `refactor(touchlog): extract push service from profile`
