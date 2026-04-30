# Touchlog Module - Functional Overview

Kurze Einordnung:
- Zweck: sichtbare Maintenance- und Diagnoseoberflaeche fuer MIDAS.
- Rolle innerhalb von MIDAS: zentrale lokale Wartungsflaeche fuer Push-Zustand, lokale Diagnosemodi, Hilfsaktionen und Log-Stream.
- Abgrenzung: kein Produktdashboard, keine medizinische Fachlogik, keine produktiven Datenaktionen.

Related docs:
- [Diagnostics Module Overview](Diagnostics Module Overview.md)
- [Push Module Overview](Push Module Overview.md)
- [Profile Module Overview](Profile Module Overview.md)

---

## 1. Zielsetzung

- Der Touchlog macht lokale Diagnose und Wartung auf Desktop und Mobile bedienbar.
- Push-Wartung ist sichtbar nur im Touchlog verfuegbar, nicht im Profil.
- Maintenance-Zustand, lokale Diagnosemodi, Hilfsaktionen und Log-Stream sind visuell getrennt.
- Push-Kontextdiagnose unterscheidet Browser/PWA, PWA-Standalone und Android-WebView, damit die Android-Shell nicht mit dem produktiven Reminder-Push-Kanal verwechselt wird.
- Nicht-Ziel: Remote-Monitoring, Analytics, Developer-Dashboard oder Produktdatenverwaltung.

---

## 2. Kernkomponenten & Dateien

| Datei | Zweck |
|------|------|
| `index.html` | Touchlog-Markup, Maintenance-Sektionen, Log-Stream |
| `app/core/diag.js` | Diagnostics-Core, sichtbarer Log-Stream, `diag.clear()` |
| `app/diagnostics/devtools.js` | Touchlog-Bindings, Push-Wartung, lokale Diagnosemodi, Hilfsaktionen |
| `app/modules/push/index.js` | Push-Kontext, sichere Subscription-Diagnose und bevorzugte Push-Service-Grenze |
| `app/modules/profile/index.js` | interne Push-API und Push-Routing-Status fuer Touchlog/Incidents |
| `app/styles/auth.css` | Touchlog-Layout, Mobile-Panel, Maintenance-Sektionen |
| `app/styles/hub.css` | Profil-Styles; enthaelt keine sichtbare Profile-Push-Surface mehr |
| `docs/QA_CHECKS.md` | Touchlog-v2-Smokes |

---

## 3. Datenmodell / Storage

- Der Touchlog besitzt keine eigene produktive Persistenz.
- Log-Zeilen und Summary-Indizes liegen im Diagnostics-Core im RAM.
- Lokale Diagnosemodi nutzen bestehende lokale Flags, bleiben aber Dev-/QA-Kontext.
- `diag.clear()` leert nur die lokale Log-Anzeige und lokale Log-Indizes.
- Push-Health liest bestehende Browser-/Remote-Zustaende; der Touchlog speichert keine neue Push-Wahrheit.

---

## 4. Ablauf / Logikfluss

### 4.1 Initialisierung
- `diag.init()` bindet das Panel und den Log-Stream.
- `devtools.js` bindet die sichtbaren Touchlog-Controls, wenn die DOM-Elemente vorhanden sind.
- Push-Wartung nutzt bevorzugt `AppModules.push` als technische Quelle:
  - `enablePush`
  - `disablePush`
  - `isPushEnabled`
  - `refreshPushStatus`
  - `getPushRoutingStatus`
- `AppModules.profile` bleibt temporaeres technisches Backend hinter `AppModules.push`.

### 4.2 User-Trigger
- Touchlog oeffnen/schliessen.
- Push-Benachrichtigungen aktivieren/deaktivieren.
- Lokale Diagnosemodi setzen:
  - Sound
  - Haptik
  - No Cache
  - Assistant
- Touchlog lokal leeren.

### 4.3 Verarbeitung
- Push-Control delegiert an `AppModules.push`.
- Push-Status wird als Maintenance-Zustand gerendert, nicht als Log-Spam.
- Android-WebView-Kontext blockiert die Push-Aktivierung im Touchlog und empfiehlt Chrome/PWA fuer Reminder.
- Aktive lokale Diagnosemodi werden als Status-Pills angezeigt.
- Log-Stream bleibt Event-Trace aus `diag.add`.

### 4.4 Persistenz
- Keine eigene Persistenz im Touchlog.
- Push-Opt-in/-Opt-out schreibt weiterhin ueber die bestehende Push-Subscription-Logik.
- Keine Produktdaten werden aus dem Touchlog geschrieben, geloescht oder zurueckgesetzt.

---

## 5. UI-Integration

- Panel `#diag` mit Titel `Touch-Log`.
- Struktur:
  - Push-Wartung
  - Lokale Diagnosemodi
  - Hilfsaktionen
  - Log-Stream
- Wichtige DOM-Anker:
  - `devTogglePush`
  - `devPushStatus`
  - `devPushDetails`
  - `devActiveModes`
  - `devClearLogBtn`
  - `diagLog`
- Mobile:
  - einspaltig
  - Header/Close erreichbar
  - Maintenance vor Log
  - Log separat scrollbar
  - keine horizontale Ueberbreite
- Push-Details:
  - Kontext
  - Geraet
  - Berechtigung
  - Browser-Abo
  - Remote
  - Diagnose
  - gekuerzter Endpoint-Hash
  - letzte Remote-/Diagnose-Zeitpunkte
  - Pruefzeit

---

## 6. Profil-Abgrenzung

- Profil enthaelt keine sichtbare Push-Wartung mehr.
- Profil enthaelt keine `Push & Erinnerungen`-Section.
- Profil enthaelt keine Push-Buttons.
- Profil enthaelt keinen Push-Kurzstatus und keine Push-Health-Details.
- Das Profil-Modul darf technisch weiterhin Push-API und Push-Routing-Status bereitstellen, solange daraus keine sichtbare Profil-Surface folgt.

---

## 7. Fehler- & Diagnoseverhalten

- Statuscopy bleibt konservativ:
  - `Push: nicht aktiv`
  - `Push: Browser-Abo fehlt`
  - `Push: aktiv - remote gesund`
  - `Push: aktiv - bereit, wartet`
  - `Push: Android-WebView - Chrome/PWA empfohlen`
  - `Push: Zustellung pruefen`
  - `Push: unbekannt ...`
- `Health-Check offen` ist kein harter Fehler, wenn noch kein echter Remote-Push faellig war.
- `Health-Check offen` ist auch kein automatischer Transportfehler, wenn mehrere oder alte Subscriptions die Zuordnung noch unscharf machen.
- Realer Transport wird ueber Systemnotification, Edge-Function-Result und persistierte Remote-/Diagnosefelder bewertet.
- Keine Tokens, UIDs, Endpoints, Payloads oder Roh-Fehlergruende sichtbar anzeigen.
- Touchlog darf einen gekuerzten Endpoint-Hash anzeigen, aber niemals den Roh-Endpoint.
- Boot-Error-Fallback nutzt weiterhin den Diagnostics-Core und die bestehenden Touchlog-IDs.

---

## 8. Events & Integration Points

- Public Touchlog-Entry-Points:
  - `diag.show()`
  - `diag.hide()`
  - `diag.add(...)`
  - `diag.clear()`
- Push-Wartung nutzt intern `AppModules.push`; `AppModules.profile` bleibt vorerst Backend/Fallback.
- Incident-Engine bleibt Konsument des Push-Routing-Status; der Touchlog trifft keine fachliche Reminder-Entscheidung.
- Source of Truth:
  - Diagnostics-Core fuer Log
  - Profile-/Push-Subscription-Status fuer Push-Wartung
  - lokale Dev-Flags fuer Diagnosemodi

---

## 9. Erweiterungspunkte / Zukunft

- Separater Push-Service statt interner Profile-Push-API, falls spaeter gewuenscht.
- Weitere eng begrenzte lokale Hilfsaktionen, sofern sie keine Produktdaten veraendern.
- Ruhigere Push-Health-Komprimierung, z. B. kompakte Push-Pill plus Detailzeilen, falls die aktuelle Health-Karte bei mehreren/alten Subscriptions zu technisch oder nervoes wirkt.

---

## 10. Feature-Flags / Konfiguration

- `DIAGNOSTICS_ENABLED` kann den Diagnostics-Core stubben.
- Lokale Dev-/QA-Modi:
  - Sound
  - Haptik
  - No Cache
  - Assistant
- Push-Benachrichtigungen sind kein lokaler Dev-Modus, sondern echte Push-Wartung.

---

## 11. Status / Dependencies / Risks

- Status: aktiv.
- Dependencies (hard): Diagnostics-Core, Touchlog-Markup, Push-Service-Boundary, Profile-Push-Backend, Browser Notification/Service Worker.
- Dependencies (soft): Remote-Push-Health aus `push_subscriptions`.
- Known risks:
  - Remote-Health kann `Health-Check offen` bleiben, wenn kein echter faelliger Remote-Push gelaufen ist.
  - Remote-/Diagnose-Health kann bei mehreren oder alten Subscriptions irritierend wirken, obwohl Push transportseitig funktioniert.
  - Interne Push-API liegt vorerst noch im Profil-Modul; das ist bewusst technische Quelle, keine sichtbare Profil-Verantwortung.
  - Mobile-Textfit muss bei neuen Statuswerten weiter mitgeprueft werden.
- Backend / SQL / Edge: keine eigene Touchlog-Schicht.

---

## 12. QA-Checkliste

- Touchlog oeffnet und schliesst auf Desktop.
- Touchlog oeffnet und schliesst auf Android; Close bleibt erreichbar.
- Push-Wartung zeigt Browser-Berechtigung, Browser-Abo, Remote-Status, letzte Remote-Zeitpunkte und Pruefzeit ohne Rohdaten.
- Push-Wartung zeigt Kontext, Geraet, Diagnose-Status und gekuerzten Endpoint-Hash ohne Roh-Endpunkte.
- Android-WebView zeigt Chrome/PWA-Empfehlung und darf nicht als gesunder Reminder-Push-Master erscheinen.
- Push aktivieren/deaktivieren ist nur im Touchlog sichtbar.
- Profil bleibt sichtbar push-frei.
- Aktive lokale Diagnosemodi erscheinen als Status, nicht als Log-Spam.
- `Touchlog leeren` leert nur den sichtbaren/localen Log.
- Keine horizontale Ueberbreite auf Mobile.
- `Health-Check offen` wird nicht als harter Fehler behandelt, solange kein echter faelliger Remote-Push gelaufen ist.
- Bei real empfangenem Push, aber nervoeser Health-Anzeige wird das als Touchlog-UX-/Mapping-Restpunkt bewertet, nicht automatisch als Push-Transportfehler.

---

## 13. Definition of Done

- Touchlog ist die einzige sichtbare Push-Wartungsflaeche.
- Diagnostics-Core und Touchlog-UI sind dokumentarisch getrennt.
- Profil bleibt fachlich und sichtbar push-frei.
- Keine sensiblen Push-Rohdaten werden angezeigt.
- QA deckt Desktop, Mobile, Push-Control, Push-Health und Log-Leeren ab.
