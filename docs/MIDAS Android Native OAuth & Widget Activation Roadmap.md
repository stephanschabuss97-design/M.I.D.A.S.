# MIDAS Android Native OAuth & Widget Activation Roadmap

## Ziel (klar und pruefbar)
Der Android-Widget-/Shell-Pfad soll so umgebaut werden, dass Google-Login nicht mehr in der eingebetteten `WebView` stattfindet. Stattdessen soll die Android-Huelle eine native OAuth-Anmeldung ueber einen sicheren externen Browser-Kontext durchfuehren, den Callback per Deep Link empfangen, die Session nativ halten und damit das Widget aktivieren koennen.

Pruefbare Zieldefinition:
- Der bestehende Google-OAuth-Pfad der Browser-/PWA-Version bleibt funktional unveraendert.
- Der bestehende Browser-/PWA-Logout-/Session-Clear-Pfad bleibt funktional unveraendert.
- Google-Login wird nicht mehr innerhalb der nativen `WebView` gestartet.
- Die Android-Huelle startet Google-/Supabase-OAuth in einem sicheren externen Browser-Kontext:
  - bevorzugt `Custom Tabs`
  - alternativ externer Standardbrowser
- Android empfaengt den OAuth-Callback ueber einen Deep Link.
- Die native Huelle speichert danach eine gueltige Session lokal.
- Das Widget kann nach diesem einmaligen nativen Login aktiv werden, ohne WebView-Login zu brauchen.
- Die native MIDAS-Huelle kann nach erfolgreichem nativen Login ebenfalls in einen authentifizierten Zustand uebergehen.
- Logout, Session-Verlust oder Token-Invalidierung fuehren in Android und Widget deterministisch zu einem klaren Session-Clear-Zustand.
- Der bisherige Google-Fehler
  - `Zugriff blockiert`
  - `Use secure browsers`
  tritt im neuen Flow nicht mehr auf.

## Problemzusammenfassung
Der aktuelle Android-V1-Pfad ist fuer Widget-Aktivierung fachlich richtig gedacht, aber bei Google-Login technisch am falschen Ort aufgehangen:

- `MidasWebActivity.kt` oeffnet MIDAS in einer eingebetteten `WebView`.
- Die Web-App startet Google-Login heute ueber `supa.auth.signInWithOAuth(...)`.
- In der nativen Huelle laeuft dieser Flow dadurch in der `WebView`.
- Google blockiert diesen Flow, weil Android-WebViews nicht als sicherer Browser fuer Sign-In gelten.

Konsequenz:
- Das Widget kann im aktuellen Zustand mit Google-Login nicht sauber initial aktiviert werden.
- Das Problem ist kein kleiner UI-Fehler, sondern ein Architekturkonflikt zwischen:
  - Browser-first Web-Auth
  - nativer Android-Shell
  - Googles Secure-Browser-Vorgaben

Wichtige neue Erkenntnis:
- Die PWA selbst hat bereits einen stabilen Boot- und Google-Login-Pfad im echten Browser.
- Dieser Pfad soll nicht fuer das Widget "mitrepariert" oder umgebaut werden.
- Der Fix betrifft ausschliesslich den nativen Android-Kontext.
- Browser-/PWA-Auth und nativer Android-Auth duerfen sich unterscheiden, muessen aber in denselben fachlichen MIDAS-Session-Zustand muenden.

## Relevante Evidence (aktueller Repo-Stand)
- `android/app/src/main/java/de/schabuss/midas/web/MidasWebActivity.kt`
  - oeffnet MIDAS in einer `WebView`
  - exportiert Auth-/Snapshot-Daten heute aus der Web-Sitzung per JS-Bridge
- `app/supabase/auth/ui.js`
  - startet Google-Login ueber:
    - `supa.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: ... } })`
- `android/app/src/main/AndroidManifest.xml`
  - besitzt aktuell keinen Deep-Link-Callback fuer OAuth
- `android/app/build.gradle.kts`
  - besitzt aktuell noch keinen nativen Auth-/Custom-Tab-/Supabase-kt-Zuschnitt

## Relevante externe Referenzen
- Google Sign-In supported browsers:
  - Android/iOS-WebViews werden fuer Sign-In nicht unterstuetzt
  - Empfehlung: `Chrome Custom Tabs`
  - https://developers.google.com/identity/siwg/supported-browsers
- Google Secure Browser Policy / Embedded WebViews:
  - eingebettete Android-WebViews sind fuer Google OAuth nicht zulaessig
  - Apps sollen stattdessen Default-Browser oder `Custom Tabs` verwenden
  - https://developers.googleblog.com/en/upcoming-security-changes-to-googles-oauth-20-authorization-endpoint-in-embedded-webviews/
- RFC 8252:
  - Native Apps sollen OAuth ueber externe User-Agents / Browser fahren
  - https://www.rfc-editor.org/rfc/rfc8252
- Supabase Kotlin Auth:
  - Android-OAuth ueber Deep Links
  - `handleDeeplinks(intent)`
  - `ExternalAuthAction.CustomTabs()`
  - https://supabase.com/docs/reference/kotlin/initializing
  - https://supabase.com/docs/reference/kotlin/v2/auth-signinwithoauth

## Finding-Katalog - PWA vs. Android-Boot/Auth

Zweck dieses Katalogs:
- die Unterschiede festhalten, die die Browser-/PWA-Version stabil machen
- Android-Probleme nicht nur als Einzelfehler, sondern als Muster lesen
- spaetere Fixes gegen denselben Root Cause ausrichten statt nur Symptome zu patchen

### F1 - Der Android-WebView-Bootstrap mutiert Auth frueher als der Web-Auth-Core ihn uebernimmt

PWA:
- `ensureSupabaseClient()` baut nur den Client.
- `requireSession()`, `scheduleAuthGrace()`, `finalizeAuthState()` und `watchAuthState()` in `app/supabase/auth/core.js` sind die Stellen, die Auth-Zustand offiziell entscheiden und in UI/Bootflow ueberfuehren.

Android:
- `app/core/android-webview-auth-bridge.js` ruft bereits vor dem normalen Web-Boot:
  - `ensureSupabaseClient()`
  - `client.auth.setSession(...)`
  - und bei fehlenden Tokens sogar `client.auth.signOut()`
- damit wird der Web-Supabase-Client mutiert, bevor der normale Auth-Core den Zustand fuehrt.

Bewertung:
- Die PWA haelt Auth-Entscheidung und Auth-Mutation enger zusammen.
- Android schiebt Auth-Mutation in einen vorgelagerten Bridge-Pfad.
- Das ist ein sehr wahrscheinlicher Loop-Kandidat, weil Bootflow und Auth-Core einen bereits veraenderten Client vorfinden, den sie nicht selbst in diesen Zustand gebracht haben.

F1 Ergebnisprotokoll:
- `app/core/android-webview-auth-bridge.js` staged fuer Android nur noch:
  - Konfiguration (`webhookUrl`, `webhookKey`)
  - native Session-Daten als Bootstrap-State
- Der Bridge-Pfad mutiert den Web-Supabase-Client nicht mehr selbst:
  - kein fruehes `setSession(...)`
  - kein fruehes `signOut()`
- Der eigentliche Session-Import wurde in den offiziellen Web-Auth-Pfad gezogen:
  - `app/supabase/auth/core.js` besitzt jetzt `applyAndroidBootstrapSession()`
  - `assets/js/main.js` ruft diesen Import kontrolliert innerhalb von `AUTH_CHECK` nach `ensureSupabaseClient()` und vor `requireSession()` auf
- Ergebnis:
  - der Android-WebView-Bootstrap liefert nur Vorzustand
  - der MIDAS-Bootflow bleibt der Owner der eigentlichen Auth-Mutation im Web-Kontext

### F2 - Android behandelt "keine nativen Tokens" als aktive Web-Signout-Aktion; die PWA behandelt das nur als Beobachtung

PWA:
- `requireSession()` fragt `sbClient.auth.getSession()` ab.
- Wenn keine Session da ist, faellt der Zustand auf `unauth` oder ueber `unknown`/Grace.
- Die PWA fuehrt beim blossen Fehlen einer Session im Boot nicht automatisch ein zusaetzliches `signOut()` aus.

Android:
- `app/core/android-webview-auth-bridge.js` fuehrt bei vorhandener Config, aber fehlenden nativen Tokens aktiv `client.auth.signOut()` aus.

Bewertung:
- Das ist eine wichtigere Abweichung als es zuerst wirkt.
- Beobachtung (`keine Session`) und Aktion (`signOut`) sind in der PWA bewusst getrennt.
- Android koppelt beides im Bootstrap zusammen und riskiert damit Reentry-/Clear-Schleifen in einem Moment, in dem der Web-Boot eigentlich erst Zustand verstehen sollte.

F2 Ergebnisprotokoll:
- Der Android-WebView-Bootstrap behandelt "Config vorhanden, aber keine nativen Tokens" jetzt explizit als Beobachtung:
  - neuer Bootstrap-Status `session-absent`
- Dadurch gilt im Android-Web-Kontext jetzt derselbe Grundsatz wie in der PWA:
  - fehlende Session wird zuerst als Zustand gelesen
  - nicht sofort als aktive `signOut()`-Mutation eskaliert
- Ergebnis:
  - `session-absent` ist fuer den Bootflow jetzt ein klarer, lesbarer Zustand
  - der Android-Boot koppelt Beobachtung und Logout-Aktion nicht mehr zusammen

### F3 - Dieselbe Web-Client-Konfiguration laeuft im Android-WebView gegen einen anderen Lebenszyklus als in der PWA

Relevanter Client in `app/supabase/core/client.js`:
- `persistSession: true`
- `autoRefreshToken: true`
- `detectSessionInUrl: true`

PWA:
- diese Optionen laufen im nativen Browser-Kontext, fuer den sie gedacht sind
- derselbe Runtime-Kontext startet Login, verarbeitet URL-/Session-Signale und besitzt den Client danach weiter

Android-WebView:
- der Login startet nativ ausserhalb der WebView
- die Session wird danach importiert
- trotzdem benutzt der WebView-Client weiterhin dieselbe Browser-Automatik

Bewertung:
- Vor allem `detectSessionInUrl` und Web-Persistenz sind im Android-WebView nicht automatisch falsch, aber wesentlich anfaelliger fuer Drift, weil Login, Callback und Session-Owner ausserhalb dieses Kontexts liegen.
- Die PWA und Android verwenden also aktuell denselben Client-Modus fuer zwei unterschiedliche Auth-Lebenszyklen.

F3 Ergebnisprotokoll:
- `app/supabase/core/client.js` unterscheidet jetzt zwischen:
  - Browser/PWA-Kontext
  - Android-WebView-Kontext
- Browser/PWA bleibt unveraendert:
  - `persistSession: true`
  - `autoRefreshToken: true`
  - `detectSessionInUrl: true`
- Android-WebView bekommt jetzt bewusst einen engeren Auth-Modus:
  - `persistSession: false`
  - `autoRefreshToken: false`
  - `detectSessionInUrl: false`
- Begruendung:
  - im Android-WebView wird Login nicht lokal gestartet
  - die Session wird importiert
  - damit soll der WebView-Client nicht mehr dieselbe Browser-Automatik fahren wie die PWA
- Ergebnis:
  - Browser-/PWA-OAuth bleibt unberuehrt
  - Android-WebView reduziert konkurrierende Auth-Automatik und wird naeher an einen importierten, nicht selbstfuehrenden Session-Kontext gezogen

### F4 - Die PWA hat einen Auth-Owner, Android hat aktuell zwei

PWA:
- ein Supabase-Client in `app/supabase/core/client.js`
- ein Runtime-State in `app/supabase/core/state.js`
- ein Auth-Lebenszyklus in `app/supabase/auth/core.js`

Android:
- native Session in `NativeAuthStore`
- danach zusaetzlicher Session-Import in die MIDAS-WebView ueber `app/core/android-webview-auth-bridge.js`
- damit zwei Auth-Welten:
  - native Android-Session
  - WebView-/Web-Supabase-Session

Bewertung:
- Das ist der groesste strukturelle Unterschied.
- Die PWA muss keinen Session-Handoff zwischen zwei Ownern ueberleben.
- Android muss genau diesen Handoff stabil koennen.

F4 Ergebnisprotokoll:
- Der Android-Pfad bleibt technisch weiter ein Zwei-Kontext-System:
  - native Android-Huelle
  - WebView mit eigenem Web-Supabase-Client
- Die Owner-Hierarchie ist jetzt aber explizit enger gezogen:
  - `NativeAuthStore` bleibt der fuehrende Session-Owner
  - der WebView-Client wird nur noch als Spiegel-/Arbeitskontext behandelt
- Konkret umgesetzt:
  - `app/core/android-webview-auth-bridge.js` markiert den Android-WebView jetzt explizit als `native auth owned`
  - `app/supabase/auth/core.js` nutzt diesen Kontext, um Auth-Entscheidungen gegen den nativen Bootstrap-State zu validieren
  - `requireSession()` behandelt im Android-Kontext `session-absent` direkt als unauth statt still einer moeglichen WebView-Eigensession zu folgen
  - `watchAuthState()` reimportiert im Android-Kontext die native Session, wenn der WebView-Client aus dem auth-Zustand kippt, obwohl die native Session noch vorhanden ist
- Ergebnis:
  - der WebView-Supabase-Client ist nicht mehr gleichrangiger Auth-Owner
  - die native Session ist jetzt der entscheidende Auth-Massstab
  - der WebView wird naeher an einen kontrollierten Mirror-Context herangezogen

### F5 - Die PWA entscheidet Auth innerhalb desselben Bootflows, Android importiert Auth von aussen

PWA:
- `boot-auth.js` setzt frueh den Lock-/Statuspfad
- `assets/js/main.js` fuehrt `AUTH_CHECK` im selben Runtime-Kontext aus
- `waitForAuthDecision()` und `setAuthState()` leben im selben State-Layer

Android:
- OAuth-Callback wird nativ in `MainActivity.kt` verarbeitet
- danach wird Session in den WebView-Kontext importiert
- der Web-Boot bekommt Auth also nicht nativ, sondern als importierten Vorzustand

Bewertung:
- Die PWA loest Auth intern und deterministisch.
- Android muss Auth von ausserhalb des Web-Boots einspeisen.
- Genau dort ist Drift zwischen `native session ok` und `web auth decision noch nicht sauber` am wahrscheinlichsten.

F5 Ergebnisprotokoll:
- Die Android-Bootstrap-Orchestrierung lebt fuer `AUTH_CHECK` nicht mehr in `assets/js/main.js`, sondern im offiziellen Auth-Core:
  - `app/supabase/auth/core.js` besitzt jetzt `prepareAndroidBootstrapAuthCheck()`
- Dieser Einstieg uebernimmt im Auth-Layer:
  - das Warten auf den nativen Android-Bootstrap
  - die Bewertung des Bootstrap-Status
  - den kontrollierten Session-Import bei `session-staged`
- `assets/js/main.js` fragt im Boot jetzt nur noch den Auth-Core:
  - kein eigener Android-Bootstrap-Waiter mehr im Main-Router
  - kein separater Session-Import ausserhalb des Auth-Layers
- Ergebnis:
  - Android bleibt zwar ein nativer Vorzustand vor dem Web-Boot
  - aber die eigentliche Auth-Vorbereitung fuer `AUTH_CHECK` liegt jetzt naeher am selben Auth-Core, der auch den restlichen Web-State fuehrt

### F6 - Die PWA serialisiert Signout/Cleanup im Auth-Core, Android hat mehrere Clear-Akteure

PWA:
- `pendingSignOut`
- `scheduleAuthGrace()`
- `finalizeAuthState(false)`
- ein klarer Cleanup-Pfad in `app/supabase/auth/core.js`

Android:
- nativer Logout ueber `NativeSessionController`
- WebView-Logout ueber `FORCE_LOGOUT_SCRIPT`
- Android-WebView-Bootstrap liefert nur noch Session-/Bootstrap-Zustand an den Web-Boot weiter
- Widget-Worker und Session-Generation-Guard wirken zusaetzlich auf denselben Lebenszyklus ein

Bewertung:
- Die PWA hat einen serialisierten Auth-Clear-Pfad.
- Android hat aktuell mehrere legitime Stellen, die Session-/Logout-Verhalten anstossen.
- Das erhoeht die Gefahr fuer Loops, stale States und schwer sichtbare Race Conditions.

F6 Ergebnisprotokoll:
- Der Android-WebView-Logout schiesst nicht mehr blind `signOut()+reload` ausserhalb des Auth-Cores ab.
- `app/supabase/auth/core.js` besitzt jetzt `handleAndroidNativeSessionCleared()`:
  - markiert den Android-Bootstrap lokal als `session-absent`
  - staged den Signed-Out-Zustand ueber denselben Core-Pfad wie sonstige Logout-Faelle
  - fuehrt `signOut()` im Web-Kontext kontrolliert aus
  - finalisiert ueber `finalizeAuthState(false)`
- `watchAuthState()` nutzt fuer Signed-Out-Faelle jetzt denselben vorbereiteten Cleanup-Pfad statt eine zweite, lokale Logout-Strecke zu bauen.
- `MidasWebActivity` ruft beim nativen Logout zuerst diesen offiziellen Auth-Core-Einstieg auf und faellt nur bei fehlender API auf den alten Minimalpfad zurueck.
- Ergebnis:
  - Android hat fuer den WebView-Kontext jetzt einen naeher am PWA-Core liegenden Clear-Pfad
  - die Zahl konkurrierender Logout-Akteure im Web-Kontext ist reduziert

### F7 - Der Android-WebView-Boot kennt Bootstrap-Status, aber diese Status werden noch nicht als vollwertige Boot-/State-Entscheidung verwertet

Android:
- `app/core/android-webview-auth-bridge.js` liefert Statuswerte wie:
  - `bridge-missing`
  - `empty`
  - `invalid-config`
  - `session-absent`
  - `session-staged`
  - `session-imported`
  - `session-import-error`
  - `error`
- `assets/js/main.js` wartet zwar auf das Promise, behandelt diese Status aber nicht wie einen eigenen, zentralen Auth-/Boot-Entscheid.

PWA:
- Auth-Zustand endet sichtbar und zentral in:
  - `unknown`
  - `auth`
  - `unauth`
- dieser Zustand fliesst direkt in Bootflow, Overlay und Lock Reason.

Bewertung:
- Android hat bereits Bootstrap-Signale, aber noch keinen gleichwertig harten Uebergang von "Bootstrap-Ergebnis" zu "offizieller Auth-/Boot-Entscheidung".
- Dadurch kann derselbe Fehler wie ein diffuses Loop-/Crash-Symptom erscheinen statt wie ein klarer, frueher Bootzustand.

F7 Ergebnisprotokoll:
- Bootstrap-Status werden jetzt im Auth-Core nicht mehr nur geloggt, sondern in einen offiziellen Auth-/Boot-Entscheid uebersetzt.
- `app/supabase/auth/core.js` mappt Android-Bootstrap-Zustaende jetzt auf:
  - offiziellen Auth-State (`unknown` / `unauth`)
  - Boot-Statusnachricht
  - Error-/Info-Ton
- `session-absent`, `invalid-config`, `empty` und Importfehler enden damit nicht mehr als diffuse Folgeeffekte, sondern als klarer unauth-/error-Zustand.
- `session-staged` und `session-imported` werden als offizielle Zwischenzustaende mit Info-Status gefuehrt.
- `app/supabase/core/state.js` traegt dafuer jetzt `authDecisionMeta`, damit Boot-Status und Auth-Entscheid aus demselben Core gelesen werden.
- Ergebnis:
  - Android-Bootstrap-Status haben jetzt einen gleichwertigeren Uebergang in den sichtbaren Auth-/Boot-Layer
  - fruehe Android-Bootprobleme erscheinen weniger als "mystischer Loop", sondern naeher an einem offiziellen Bootzustand

### F8 - Die PWA nutzt ein Runtime-/Persistenzmodell, Android muss Stores zwischen nativer Huelle und WebView ueberbruecken

PWA:
- Browser-Session + Browser-Persistenz
- Web-Konfiguration via `getConf` / `putConf`
- ein einheitlicher Supabase-Runtime-Kontext

Android:
- nativer Secure Store (`NativeAuthStore`, `NativeAuthConfigStore`)
- WebView-/MIDAS-Konfiguration via `putConf('webhookUrl'/'webhookKey')`
- WebView-Supabase-Session wird zusaetzlich ueber `setSession(...)` gesetzt

Bewertung:
- Android muss Konfiguration und Session ueber Store-Grenzen hinweg spiegeln.
- Die PWA hat dieses Problem nicht.
- Jeder Bug in diesem Spiegelpfad wirkt sofort wie ein Boot-/Login-Loop, obwohl die eigentliche Fachlogik intakt sein kann.

F8 Ergebnisprotokoll:
- Der Android-Bootstrap fuehrt Konfiguration und Session jetzt konsistenter zusammen:
  - `NativeWebViewAuthBridge` bevorzugt fuer `restUrl`/`anonKey` jetzt den expliziten `NativeAuthConfigStore`
  - Tokens und User-Session kommen weiter aus `NativeAuthStore`
- `NativeAuthConfigStore.save(...)` synchronisiert geaenderte Android-Konfiguration jetzt in einen vorhandenen nativen Auth-State mit hinein.
  - Dadurch driften `NativeAuthConfigStore` und `NativeAuthStore` bei spaeteren Konfig-Aenderungen nicht mehr still auseinander.
- Der WebView-Bootstrap traegt jetzt zusaetzliche Spiegel-Metadaten:
  - `supabaseUrl`
  - `sessionGeneration`
  - `updatedAt`
  - `configSource`
- `app/supabase/auth/core.js` nutzt `sessionGeneration`, damit ein bereits importierter nativer Session-Spiegel nicht blind erneut als neuer Import behandelt wird.
- Ergebnis:
  - Android-Konfiguration und Session-Spiegel sind naeher an einem kontrollierten Brueckenvertrag
  - der Store-Uebergang zwischen nativer Huelle und WebView ist weniger drift-anfaellig

### F9 - Die PWA hat keinen Activity-/Intent-Lebenszyklus, Android schon

PWA:
- ein Browser-Tab
- ein URL-/Session-Kontext
- kein Deep-Link-Reentry zwischen zwei Activities

Android:
- `MainActivity`
- `MidasWebActivity`
- OAuth-Browser/Custom-Tab
- Deep-Link-Reentry
- stale Intent-/Callback-Risiken

Bewertung:
- Einige Android-Fehler sind keine Auth-Fachfehler, sondern Activity-/Intent-Lebenszyklusfehler.
- Diese Fehlerklasse existiert in der PWA praktisch nicht.

F9 Ergebnisprotokoll:
- `MainActivity` ist fuer Launcher + OAuth-Callback jetzt expliziter als Reentry-Owner geschnitten:
  - Android-Manifest nutzt dafuer jetzt `launchMode="singleTask"`.
- Dadurch landet der Deep-Link-Callback eher auf einer bestehenden `MainActivity`, statt still weitere Instanzen desselben Einstiegspunkts aufzubauen.
- `openMidas()` in `MainActivity.kt` startet `MidasWebActivity` jetzt mit:
  - `FLAG_ACTIVITY_CLEAR_TOP`
  - `FLAG_ACTIVITY_SINGLE_TOP`
- Ergebnis:
  - der Rueckweg `Browser -> Callback -> MainActivity -> MIDAS-WebView` ist naeher an einem einzelnen Android-Task-Pfad
  - stale Reentry-/Stack-Effekte zwischen mehreren `MainActivity`-/`MidasWebActivity`-Instanzen werden reduziert

### F10 - Die PWA besitzt einen sichtbaren, zentralen Boot-Fehlerpfad; Android hat noch keinen gleichwertigen On-Device-Diagnosepfad

PWA:
- `bootFlow.reportError(...)`
- `BOOT_ERROR`
- Error-History
- Fallback-Overlay
- Touch-Log / Diag

Android:
- Toaster/Meldungen
- Systemdialog `App enthaelt einen Fehler`
- bislang kein gleichwertiger on-device Crash-/Boot-Diag-Pfad fuer den nativen Node

Bewertung:
- Die PWA ist leichter zu debuggen, weil Bootfehler sichtbar und zentralisiert sind.
- Android fuehlt sich aktuell instabiler an, weil derselbe Fehler schnell als Loop/Crash erscheint, ohne dass der eigentliche Bootpunkt klar sichtbar ist.

F10 Ergebnisprotokoll:
- Android hatte bereits JSON-Trace-/Crash-Dateien, aber keinen gleichwertig sichtbaren On-Device-Hinweis innerhalb der App.
- `AndroidBootTrace` persistiert jetzt zusaetzlich eine kleine Zusammenfassung des letzten Trace-/Crashpunkts.
- `MainActivity` zeigt diesen Diagnosepfad jetzt direkt an:
  - statischer Pfad zur JSON im Download-Ordner
  - letzte bekannte Trace-Zeile als Kurzsummary
- Ergebnis:
  - Android-Diagnostik ist nicht mehr nur "Datei irgendwo im Speicher"
  - der native Node besitzt jetzt einen sichtbareren, zentraleren On-Device-Diagnosepfad als zuvor

## Vorlaeufige Gesamtschlussfolgerung aus dem Finding-Katalog

Der staerkste Stabilitaetsvorteil der PWA ist nicht "der Browser an sich", sondern:
- ein Supabase-Client
- ein Auth-Owner
- ein Bootflow
- ein serialisierter Clear-Pfad

Der Android-Pfad ist aktuell dort am empfindlichsten, wo er genau von diesem Modell abweicht:
- nativer Session-Owner plus WebView-Session-Import
- Browser-/Web-Auth-Automatik im importierten WebView-Kontext
- mehrere Clear-/Reentry-Akteure statt eines einzigen linearen Auth-Lebenszyklus

Arbeitsregel fuer weitere Fixes:
- nicht nur einzelne Callback-/Redirect-Bugs patchen
- sondern Android schrittweise naeher an den PWA-Grundsatz ziehen:
  - moeglichst ein Auth-Owner pro aktivem Runtime-Kontext
  - moeglichst ein klarer, serialisierter Boot-/Clear-Pfad
  - moeglichst wenig konkurrierende Session-Automatik im WebView-Kontext

## Scope
- Analyse und Ersatz des aktuellen WebView-basierten Google-Login-Pfads.
- Explizite Wahrung des bestehenden Browser-/PWA-OAuth-Pfads.
- Explizite Wahrung des bestehenden Browser-/PWA-Bootflow- und Logout-Vertrags.
- Festlegung eines nativen Android-OAuth-Vertrags fuer:
  - Start des Logins
  - Callback
  - Session-Persistenz
  - Session-Clear / Logout
  - Widget-Aktivierung
- Manifest-/Deep-Link-/Gradle-Anpassungen fuer den nativen Auth-Flow.
- Entscheidung, wie die native Session in die MIDAS-WebView gespiegelt wird.
- Entscheidung, welche externen Konfigurationsschritte wirklich noetig sind:
  - Android Deep Link
  - Supabase Redirect-Allowlist
  - nur bei echtem Bedarf weitere Provider-/Google-Konfiguration
- Festlegung, wie native Session-Tokens sicher gespeichert werden.
- Doku-, QA- und Vertrags-Sync fuer den neuen Auth-Pfad.

## Not in Scope
- Vollstaendige Neuschreibung des Android-Nodes.
- Wechsel des Widget-Datenmodells.
- Groesserer Homescreen-Redesign-Block.
- Play-Store-Verteilung.
- Neue Provider ausserhalb des bereits genutzten Google-/Supabase-Pfads.

## Guardrails
- Der bestehende Browser-/PWA-Google-Login bleibt unangetastet, solange kein zwingender gemeinsamer Fix nachgewiesen ist.
- Der bestehende Browser-/PWA-Bootflow bleibt unangetastet, solange kein zwingender gemeinsamer Fix nachgewiesen ist.
- Google-Login darf nicht mehr in der eingebetteten `WebView` stattfinden.
- Das Widget bleibt read-only.
- MIDAS bleibt Hauptsystem und Source of Truth.
- Native Android-Auth darf keine fachliche Drift gegen die Web-App erzeugen.
- Session-Import in die WebView darf nicht als spaetes "nachtraegliches Geradebiegen" nach einem bereits falsch gelaufenen `AUTH_CHECK` verstanden werden.
- Kein halbgarer Workaround ueber manuelles Token-Kopieren, Cookie-Scraping oder unsaubere Browser-Hacks.
- Wenn ein Schritt nur das Widget aktiviert, aber die native MIDAS-Huelle danach unauthentisch/kaputt zuruecklaesst, ist der Vertrag noch nicht sauber geschlossen.

## Architektur-Constraints
- Browser-/PWA-Auth und nativer Android-Auth sind zwei getrennte Entry-Pfade.
- Beide Pfade muessen jedoch in denselben fachlichen MIDAS-Session-Vertrag muenden:
  - gueltige Supabase-Session
  - korrekter `authState`
  - normaler MIDAS-Boot nach erfolgreicher Anmeldung
- Der native Session-Owner braucht einen expliziten Clear-Vertrag:
  - Logout
  - Token-Invalidierung
  - Refresh-Fehler
  - Widget darf in diesen Faellen nicht mit alten Tokens oder scheinbar gueltigen Daten weiterlaufen
  - laufende Android-Worker duerfen nach Logout keine alten Snapshot-/Auth-Daten mehr committen
- Die Android-Huelle braucht einen echten Deep-Link-Callback im Manifest.
- Die Android-Huelle braucht einen nativen Auth-Owner:
  - Session wird nativ erzeugt und gehalten
  - nicht mehr primaer aus der WebView abgegriffen
- Der OAuth-Start muss ueber sicheren externen Browser-Kontext laufen:
  - `Custom Tabs` bevorzugt
  - externer Browser als sauberer Fallback
- PKCE ist fuer den nativen OAuth-Pfad mitzudenken.
- Die bestehende Widget-Sync-Logik darf auf nativen Tokens weiterarbeiten, muss aber nicht mehr von WebView-Login abhaengen.
- Die WebView bleibt MIDAS-Surface, aber nicht mehr Auth-Source of Truth.
- Der Session-Import in die WebView muss deterministisch mit dem MIDAS-Bootflow zusammenspielen:
  - kein spaetes Importieren nach bereits festgeschriebenem `unauth`-Boot
  - bevorzugt vor oder waehrend des relevanten Auth-/Boot-Handshakes
  - keine doppelten Auth-Refresh-Kaskaden durch konkurrierende Session-Owner
- Nach erfolgreichem nativen Login muss die WebView entweder:
  - die native Session importieren
  - oder in einen ebenso sauberen authentifizierten Zustand ueberfuehrt werden
  - andernfalls bleibt die Shell fachlich inkonsistent
- Externe Konfiguration ist so klein wie moeglich zu halten:
  - primaer Android Deep Link + Supabase Redirect-Allowlist
  - Google-/Provider-Konsole nur dann anfassen, wenn fuer den neuen nativen Redirect-Pfad wirklich erforderlich
- Der Android-Build darf nicht still von einem rechnerlokalen Java-8-Shim oder aehnlichen PATH-Zufaellen abhaengen:
  - JDK-Anforderungen fuer das Android-Teilprojekt muessen bewusst und reproduzierbar dokumentiert bleiben
- Wenn die native Session der Auth-Owner wird, ist sichere Speicherung Teil des Zielvertrags:
  - plain `SharedPreferences` sind fuer den finalen nativen OAuth-Zustand kein stillschweigender Endzustand
- `NativeAuthStore` und bestehender `WidgetAuthStore` duerfen nur als Zwischenzustand nebeneinander existieren:
  - vor Abschluss von `S4`/`S5` braucht der Android-Pfad einen klaren Source of Truth fuer Auth-Daten
- Fuer Android-Worker gilt derselbe Grundgedanke wie im PWA-Auth-State:
  - nicht harte Request-Cancellation als primaerer Schutz
  - sondern ein klarer Session-/Auth-Entscheidungszustand, gegen den spaete Ergebnisse validiert werden
  - praktikable Android-V1-Richtung: `sessionGeneration` / Generation-Guard vor jedem Auth-/Snapshot-Write

## Vorgeschlagene fachliche Default-Richtung
Empfohlene Richtung fuer V1.1 / Follow-up:

- Der bestehende Browser-/PWA-Google-Login bleibt wie heute erhalten.
- Der bestehende Browser-/PWA-Logout- und Bootflow bleibt wie heute erhalten.
- Native Android-Auth wird als eigener kleiner Layer eingefuehrt.
- Google-/Supabase-OAuth startet aus Android ueber `Custom Tabs`.
- Der OAuth-Callback landet ueber Deep Link wieder in der App.
- Die Session wird nativ gespeichert.
- Logout / Session-Clear werden nativ explizit behandelt und loeschen Android-Auth-Zustand deterministisch.
- Das Widget nutzt danach direkt diese native Session fuer Refresh und Aktivierung.
- Die MIDAS-WebView importiert nach erfolgreichem nativen Login dieselbe Session, damit Launcher und Widget nicht auseinanderlaufen.

Kurz gesagt:
- `PWA-Browser-Auth` bleibt bestehen
- `PWA-Bootflow` bleibt bestehen
- `WebView` bleibt MIDAS-Anzeige
- `Browser + Deep Link` wird Login-Pfad
- `native Session` wird Aktivierungsbasis fuer Widget und Shell

## Tool Permissions
Allowed:
- Android-Manifest, Gradle-Dependencies, Activities und Auth-Store anpassen.
- Deep-Link- und nativen OAuth-Pfad einfuehren.
- Doku, QA und Modul-Overview nachziehen.
- Web-App nur dort anfassen, wo sie sauber mit dem nativen Session-Import zusammenspielen muss.
- Bestehenden Browser-/PWA-Login ausdruecklich nicht unnoetig anfassen.

Forbidden:
- Google-Login weiter ueber eingebettete `WebView` "reparieren".
- Widget in diesem Zuge fachlich aufblasen.
- Android-/Auth-Workarounds ohne klaren Session-Vertrag einbauen.

## Execution Mode
- Sequenziell arbeiten (`S1` bis `S5`).
- `S1` verifiziert den aktuellen Fehler- und Policy-Kontext.
- `S2` fixiert den Produkt- und Auth-Vertrag fuer den neuen nativen Login-Pfad.
- `S3` fixiert Architektur-, Deep-Link- und Session-Vertrag.
- `S4` ist die eigentliche Android-/MIDAS-Implementierung.
- `S5` schliesst Doku, QA und finalen Abnahmeblock.

## Statusmatrix
| ID | Schritt | Status | Ergebnis/Notiz |
|---|---|---|---|
| S1 | Fehlerbild, Repo-Evidence und externe OAuth-Policy verifizieren | DONE | WebView-Login-Pfad, PWA-Google-OAuth, fehlender Deep-Link-Callback und Google-Policy sind belastbar verifiziert. |
| S2 | Produktvertrag fuer nativen Android-Login und Widget-Aktivierung finalisieren | DONE | Android-Login ist als separater nativer Entry, nicht als WebView-Login, festgezogen; PWA-Auth bleibt unveraendert. |
| S3 | Architektur-, Deep-Link- und Session-Vertrag festziehen | DONE | `supabase-kt`, package-spezifischer Deep Link, native Session als Owner und Android-gateter WebView-Import sind festgezogen. |
| S4 | Umsetzung in Android-Huelle und MIDAS-Auth-Anbindung | DONE | S4.1 bis S4.12 erledigt: Deep-Link-Callback, native OAuth-Dependencies, nativer Login-Start, native Session-Uebernahme, Widget-Auth-Integration, auth-konsistenter WebView-Boot, nativer Logout-/Session-Clear, Secure-Storage-Haertung, Entkopplung des alten WebView-Google-Login-Pfads, lokaler Abnahmeblock, Doku-Sync und Commit-Empfehlung sind abgeschlossen. |
| S5 | Doku, QA, Abnahme und Abschluss-Sync | DONE | README, Android-Doku, QA-Phase und Commit-Scope sind nachgezogen; der formale Roadmap-Block ist damit geschlossen. |

Status-Legende: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

## Schritte + Subschritte

### S1 - Fehlerbild, Repo-Evidence und externe OAuth-Policy verifizieren
- S1.1 Den aktuellen WebView-Auth-Pfad in `MidasWebActivity.kt` exakt mappen.
- S1.2 Den aktuellen Google-OAuth-Start in `app/supabase/auth/ui.js` exakt mappen.
- S1.3 Den aktuellen Android-Manifest-Stand auf fehlende Deep-Link-Callbacks pruefen.
- S1.4 Den Google-Blocker gegen offizielle Quellen verifizieren:
  - WebViews nicht unterstuetzt
  - Secure Browser / Custom Tabs
- S1.5 Schritt-Abnahme:
  - repo-seitig und policy-seitig ist klar dokumentiert, warum der bestehende Flow scheitert
- S1.6 Doku-Sync:
  - nur falls Android-Modul-Overview den alten WebView-Auth-Pfad missverstaendlich als tragfaehig beschreibt
- S1.7 Commit-Empfehlung
- S1 Ergebnisprotokoll:
  - `MidasWebActivity.kt` startet MIDAS aktuell in einer eingebetteten `WebView` und exportiert Auth-/Snapshot-Daten erst nach erfolgreicher Web-Session ueber `window.MidasAndroidWidget`.
  - `app/supabase/auth/ui.js` startet Google-Login im Web-Kontext ueber `signInWithOAuth(...)` mit Web-Redirect zur aktuellen MIDAS-URL; dieser Pfad ist fuer Browser/PWA korrekt und soll nicht fuer Android verbogen werden.
  - `AndroidManifest.xml` enthaelt aktuell keinen nativen OAuth-Callback-/Deep-Link-Intent-Filter; Android hat damit keinen policy-konformen Rueckweg fuer nativen Login.
  - Offizielle Grundlage ist verifiziert:
    - Google blockiert Sign-In in eingebetteten WebViews und verlangt sichere Browser.
    - RFC 8252 stuetzt fuer native Apps externe User-Agents statt eingebetteter WebViews.
- S1 Abnahme/Notiz:
  - Repo- und Policy-Evidence zeigen denselben Bruchpunkt: nicht MIDAS-Google-OAuth selbst ist kaputt, sondern der Android-WebView-Container ist fuer Google-Login fachlich und policy-seitig der falsche Ort.
- S1 Doku-Sync:
  - kein weiterer Doku-Nachzug noetig; `Android Widget Module Overview` beschreibt die `WebView` bereits nur noch als MIDAS-Surface und nicht als tragfaehigen finalen Google-Login-Container.
- S1 Commit-Empfehlung:
  - noch kein eigener Commit sinnvoll; `S1` bildet die Grundlage fuer `S2`/`S3` und sollte logisch mit dem finalen Auth-Vertrag gebuendelt bleiben.
- Output: belastbare technische und externe Grundlage, warum der aktuelle Google-Login-Pfad ersetzt werden muss.

### S2 - Produktvertrag fuer nativen Android-Login und Widget-Aktivierung finalisieren
- S2.1 Final festziehen:
  - Widget-Aktivierung darf nicht von WebView-Login abhaengen
  - erste Aktivierung ueber nativen Login ist akzeptiert
- S2.2 Final festziehen:
  - WebView ist nicht mehr Login-Surface
  - WebView ist MIDAS-Anzeige
- S2.3 Final festziehen:
  - der bestehende Browser-/PWA-OAuth-Pfad bleibt wie heute erhalten
  - Android bekommt einen separaten Login-Entry
- S2.4 Festziehen, was nach erfolgreichem Login gelten muss:
  - Widget aktivierbar / sync-faehig
  - nativer Session-Store gefuellt
  - MIDAS-Shell nicht in unauth-Drift zurueckgelassen
- S2.5 Festziehen:
  - beide Login-Pfade muenden in denselben fachlichen Session-Zustand
- S2.6 Logout-/Clear-Vertrag festziehen:
  - nativer Logout leert Android-Session deterministisch
  - WebView und Widget bleiben nach Logout nicht in einem scheinbar gueltigen Zustand
  - bestehender Browser-/PWA-Logout bleibt unveraendert
- S2.7 Guardrails textlich finalisieren:
  - kein Token-Hack
  - kein Cookie-Trick
  - kein "funktioniert nur halb"
- S2.8 Schritt-Abnahme:
  - kein Produktstreit mehr ueber Rolle von Browser, WebView und nativer Session
- S2.9 Doku-Sync
- S2.10 Commit-Empfehlung
- S2 Ergebnisprotokoll:
  - Der bestehende Browser-/PWA-Google-Login bleibt der alleinige Web-Standardpfad und wird fuer das Widget nicht umgebaut.
  - Android bekommt einen separaten nativen Login-Entry, weil die Widget-Aktivierung nicht an einem in WebViews geblockten Login haengen darf.
  - Die `WebView` verliert fachlich die Rolle als Login-Surface und bleibt MIDAS-Anzeige bzw. spaeterer authentifizierter Surface-Container.
  - Nach erfolgreichem nativen Login muessen drei Dinge gleichzeitig gelten:
    - das Widget ist aktivierbar / sync-faehig
    - der native Session-Store ist gueltig
    - die native MIDAS-Huelle darf nicht in einen falschen unauth- oder Zwischenzustand kippen
  - Browser-/PWA-Login und nativer Android-Login sind zwei getrennte Starts, muenden aber in denselben fachlichen Zielzustand:
    - gueltige Supabase-Session
    - korrekter Auth-State
    - normaler MIDAS-Boot
  - Logout und Session-Clear sind Teil desselben Produktvertrags:
    - nativer Logout leert Android und Widget deterministisch
    - Browser-/PWA-Logout bleibt wie heute unveraendert
- S2 Abnahme/Notiz:
  - Der Produktstreit ist geschlossen: Android braucht keinen "Login in MIDAS", sondern einen policy-konformen nativen Login, der MIDAS danach in denselben fachlichen Session-Zustand bringt.
- S2 Doku-Sync:
  - kein weiterer Nachzug noetig; `Auth Module Overview` und `Android Widget Module Overview` spiegeln die Browser-/Android-Trennung bereits korrekt.
- S2 Commit-Empfehlung:
  - noch kein eigener Commit sinnvoll; `S2` sollte mit dem Architekturvertrag aus `S3` gebuendelt bleiben.
- Output: finaler Produktvertrag fuer den neuen nativen Login-Pfad.

### S3 - Architektur-, Deep-Link- und Session-Vertrag festziehen
- S3.1 Entscheiden, ob der native Auth-Layer ueber:
  - `supabase-kt`
  - oder einen bewusst manuellen nativen OAuth-/PKCE-Pfad
  umgesetzt wird.
- S3.2 Deep-Link-Vertrag festziehen:
  - Scheme
  - Host
  - Manifest-Intent-Filter
  - Redirect-URL in Supabase/Auth-Konfiguration
- S3.3 Browser-Vertrag festziehen:
  - `Custom Tabs` als primaerer Pfad
  - externer Browser als Fallback
- S3.4 Session-Vertrag festziehen:
  - native Session ist Owner
  - Widget-Sync liest gegen nativen Session-Store
  - Refresh-/Persistenz-Verhalten dokumentieren
- S3.5 Session-Clear-Vertrag festziehen:
  - wie Android Logout / Token-Verlust / Refresh-Fehler behandelt
  - wann Widget-Snapshot stehenbleiben darf und wann Auth-Zustand aktiv geloescht werden muss
- S3.6 WebView-Import-Vertrag festziehen:
  - wie die native Session nach Login in die MIDAS-WebView uebergeht
  - z. B. `setSession(...)`-Import
- S3.7 Bootflow-/Timing-Vertrag festziehen:
  - wann die WebView die Session bekommt
  - wie das mit `AUTH_CHECK` zusammenspielt
  - wie `authState`-/Refresh-Doppelwege vermieden werden
- S3.8 Browser-Vertrag explizit gegen PWA absichern:
  - bestehender `signInWithOAuth(...)`-Pfad im Browser bleibt unveraendert
  - keine Regression fuer den bestehenden PWA-Bootflow
- S3.9 Externe Konfigurationsgrenze festziehen:
  - zuerst Android Deep Link + Supabase Redirect-Allowlist
  - weitere Provider-/Google-Konfiguration nur, wenn wirklich technisch noetig
- S3.10 Secure-Storage-Vertrag festziehen:
  - welcher Store fuer native Session-Tokens zulaessig ist
  - wie der bestehende V1-Widget-Store dabei migriert oder ersetzt wird
- S3.11 Schritt-Abnahme:
  - kein offener Architekturstreit mehr ueber Deep Link, PKCE, Session-Owner oder WebView-Rolle
- S3.12 Doku-Sync
- S3.13 Commit-Empfehlung
- S3 Ergebnisprotokoll:
  - Der native Auth-Layer wird ueber `supabase-kt` umgesetzt, nicht ueber einen bewusst manuellen PKCE-/Token-Pfad.
    - Begruendung:
      - offizieller Supabase-Kotlin-OAuth-/Deep-Link-Support ist vorhanden
      - weniger proprietaere MIDAS-Sonderlogik
      - geringeres Risiko, den stabilen Browser-/PWA-Auth-Vertrag fuer Android nachzubauen oder zu verbiegen
  - Deep-Link-Vertrag:
    - package-spezifischer nativer Callback statt Web-Redirect
    - aktuelle Default-Richtung:
      - Scheme: `de.schabuss.midas`
      - Host: `auth`
      - Path: `/callback`
    - daraus folgt ein nativer Redirect wie `de.schabuss.midas://auth/callback`
  - Browser-Vertrag:
    - `Custom Tabs` ist der primaere Android-Login-Pfad
    - externer Browser ist der Fallback
    - eingebettete `WebView` ist fuer Google-Login ausgeschlossen
  - Session-Vertrag:
    - die native Android-Session ist der Owner fuer:
      - nativen Login-Zustand
      - Widget-Aktivierung
      - Widget-Sync
    - der Widget-Sync liest nicht mehr aus einer WebView-Session, sondern aus dem nativen Session-Store
- Session-Clear-Vertrag:
    - expliziter nativer Logout, `invalid_grant`, unrettbarer Refresh-Fehler oder klarer Session-Verlust loeschen:
      - nativen Auth-Zustand
      - Widget-Auth-Daten
      - den sichtbaren Widget-Snapshot zurueck auf Platzhalter
    - reine Netzwerkfehler ohne Session-Verlust duerfen den letzten Snapshot kurz stehen lassen, gelten aber nicht als gueltige Auth-Bestaetigung
    - fuer laufende Android-Worker gilt zusaetzlich:
      - Ergebnisse duerfen nur dann Auth-/Snapshot-Zustand schreiben, wenn ihre beim Start gelesene `sessionGeneration` noch aktuell ist
      - damit wird der gleiche Schutzgedanke wie im PWA-Auth-State auf Android angewandt:
        - spaete Arbeit darf nach Logout nicht mehr als gueltig committen
  - WebView-Import-Vertrag:
    - die native Session wird Android-gatet in die MIDAS-WebView importiert, bevorzugt ueber einen expliziten `setSession(...)`-Pfad gegen `sbClient.auth`
    - dieser Import ist ein Android-spezifischer Bootstrap-Pfad und veraendert den Browser-/PWA-Login nicht
  - Bootflow-/Timing-Vertrag:
    - die WebView darf nicht einfach normal in einen unauth-`AUTH_CHECK` laufen und spaeter "geradegezogen" werden
    - entweder bekommt die WebView die Session vor dem normalen auth-relevanten UI-Fortschritt
    - oder die native Huelle haelt die WebView hinter einem Android-seitigen Loading-Gate, bis Session-Import und erste Auth-Entscheidung konsistent sind
    - entscheidend ist:
      - kein Login-Overlay-Flicker
      - kein doppelter Auth-Refresh
      - keine unauth-Drift nach erfolgreichem nativen Login
  - Browser-/PWA-Schutzvertrag:
    - der bestehende `signInWithOAuth(...)`-Pfad im Browser bleibt unveraendert
    - `SITE_URL`, Web-Redirect und bisherige Browser-Login-Semantik werden fuer Android nicht umgeschnitten
  - Externe Konfigurationsgrenze:
    - zuerst:
      - Android-Intent-Filter
      - Supabase Redirect-Allowlist fuer den nativen Callback
    - Google-/Provider-Konsole nur dann anfassen, wenn der native Browser-/Deep-Link-Pfad ohne weiteren Provider-Eintrag technisch nachweislich nicht ausreicht
  - Secure-Storage-Vertrag:
    - plain `SharedPreferences` bleiben fuer den aktuellen V1-Widget-Store nur Altlast / Zwischenstand
    - der finale native OAuth-Zustand braucht einen Keystore-gestuetzten bzw. anderweitig ausreichend gesicherten nativen Store
    - der bestehende `WidgetAuthStore` wird dafuer migriert oder ersetzt
- S3 Abnahme/Notiz:
  - Der Architekturstreit ist geschlossen: Android bekommt keinen halbmanuellen Spezial-Auth, sondern einen nativen Supabase-/Deep-Link-Pfad mit eigener Session-Hoheit und Android-gatetem WebView-Import.
- S3 Doku-Sync:
  - noch kein weiterer Nachzug noetig; der finale Architekturvertrag wird in `S5` auf Auth-, Supabase-, Bootflow- und Android-Widget-Overview gespiegelt.
- S3 Commit-Empfehlung:
  - noch kein eigener Commit sinnvoll; `S3` ist die letzte Vertragsstufe vor `S4` und sollte logisch mit der spaeteren Umsetzung zusammenbleiben.
- Output: finaler technischer Vertrag fuer nativen Login, Callback und Session-Uebergabe.

### S4 - Umsetzung in Android-Huelle und MIDAS-Auth-Anbindung
- S4.1 Android-Manifest fuer Deep-Link-Callback erweitern.
- S4.2 Notwendige Android-Dependencies / Auth-Bausteine einfuehren.
- S4.3 Nativen Login-Start ueber `Custom Tabs` oder externen Browser implementieren.
- S4.4 OAuth-Callback in Android entgegennehmen und Session importieren.
- S4.5 Native Session in bestehenden Widget-Auth-/Sync-Pfad integrieren.
  - Source of Truth zwischen `NativeAuthStore` und `WidgetAuthStore` explizit festziehen
  - keine dauerhafte Drift durch doppelte Auth-Speicher zulassen
- S4.6 MIDAS-WebView nach nativer Anmeldung in einen authentifizierten Zustand ueberfuehren.
- S4.7 Nativen Logout-/Session-Clear-Pfad implementieren:
  - Android-Session loeschen
  - Widget-Auth-Zustand loeschen
  - WebView-Zustand sauber nachziehen
- S4.8 Sicheren nativen Session-Store implementieren oder den bisherigen Store sauber migrieren.
  - lokaler JDK-/Build-Tradeoff fuer das Android-Projekt dokumentarisch sauber einordnen
  - finalen Zielzustand fuer `NativeAuthStore` vs. `WidgetAuthStore` technisch schliessen
- S4.9 Alten/brechenden WebView-Google-Login-Pfad entfernen oder sauber entkoppeln.
- S4.10 Schritt-Abnahme:
  - Build
  - Login-Smoketest
  - Logout-/Session-Clear-Smoke
  - Widget-Aktivierung
  - keine Google-WebView-Blockseite mehr
- S4.11 Doku-Sync
- S4.12 Commit-Empfehlung
- Output: Android-Widget-/Shell-Pfad kann sich sauber authentifizieren und das Widget aktivieren.

#### S4 Checkpoint A - Deep-Link-Callback im Manifest vorbereitet

- `MainActivity` akzeptiert jetzt einen nativen OAuth-Rueckweg ueber:
  - Scheme: `de.schabuss.midas`
  - Host: `auth`
  - Path: `/callback`
- Der Android-Pfad besitzt damit erstmals einen policy-konformen Callback-Einstiegspunkt im Manifest.
- Bewusst noch nicht umgesetzt:
  - Deep-Link-Auswertung in Kotlin
  - Session-Import
  - Weiterleitung in Widget-/WebView-Auth
- Bewertung:
  - `S4.1` ist sauber abgeschlossen.
  - `S4.4` bleibt der eigentliche Punkt, an dem der Callback verarbeitet und in eine native Session ueberfuehrt wird.

#### S4 Checkpoint B - Native OAuth-Dependencies und Auth-Basis vorbereitet

- In `android/build.gradle.kts` ist das Android-Teilprojekt fuer die nativen OAuth-Bausteine auf die passende Kotlin-/Serialization-Linie angehoben.
- In `android/app/build.gradle.kts` sind jetzt die tragenden Android-/Auth-Bausteine vorhanden:
  - `androidx.browser`
  - `supabase-kt` Auth-Modul
  - `ktor-client-okhttp`
- Neue Android-Auth-Basis unter `android/app/src/main/java/de/schabuss/midas/auth/`:
  - `AndroidAuthContract.kt`
  - `NativeAuthState.kt`
  - `NativeAuthStore.kt`
- Wichtig:
  - das ist noch keine fertige Login-Implementierung
  - der aktuelle `NativeAuthStore` ist nur die vorbereitende Basis und noch nicht der finale Secure-Storage-Endzustand aus `S4.8`
- Verifikation:
  - `:app:compileDebugKotlin` gruen
  - `clean :app:assembleDebug` gruen
- Bewertung:
  - `S4.2` ist sauber abgeschlossen.
  - `S4.3` kann jetzt auf einer realen nativen Auth-Basis starten, statt erst noch Gradle-/Kotlin-/Dependency-Drift zu klaeren.

#### S4 Checkpoint C - Nativer Login-Start ueber sicheren Browser-Kontext vorbereitet

- `MainActivity` besitzt jetzt einen eigenen nativen Google-Login-Entry:
  - `Mit Google anmelden`
  - getrennt vom bisherigen `MIDAS oeffnen`
- Der Android-Pfad erzeugt fuer den Login-Start jetzt einen echten nativen Supabase-Auth-Client:
  - `NativeAuthConfigResolver.kt`
  - `NativeAuthBootstrapConfig.kt`
  - `NativeAuthConfigStore.kt`
  - `NativeAuthBootstrapValidator.kt`
  - `NativeAuthClientProvider.kt`
  - `NativeOAuthStarter.kt`
- Wichtiger technischer Punkt:
  - der native Supabase-Client wird bewusst als Android-seitiger Singleton gehalten
  - damit bleibt der fuer PKCE relevante Auth-/Verifier-Kontext fuer den spaeteren Deep-Link-Callback aus `S4.4` erhalten
- Der Login-Start laeuft jetzt policy-konform ueber sicheren externen Browser-Kontext:
  - primaer `Custom Tabs`
  - Fallback externer Browser
- Bewusste Guardrails im aktuellen Zwischenstand:
  - der Startpfad erfindet keine neue PWA-Konfiguration
  - Android besitzt jetzt einen eigenen config-only Bootstrap-Pfad fuer frische Installationen:
    - REST-Endpoint `/rest/v1/health_events`
    - ANON-Key
    - lokales Speichern vor dem nativen Login
  - wenn diese Konfiguration fehlt oder ungueltig ist, scheitert der Start sauber mit explizitem Config-Hinweis statt mit einem halben OAuth-Workaround
- Verifikation:
  - `:app:compileDebugKotlin` gruen
  - `:app:assembleDebug` gruen
- Bewertung:
  - `S4.3` ist sauber abgeschlossen.
  - Der eigentliche Session-Rueckweg bleibt bewusst in `S4.4`:
    - Deep-Link entgegennehmen
    - Session importieren
    - nativen Auth-Zustand fuellen
  - Offener technischer Verifikationspunkt fuer `S4.4`:
    - Prozess-Tod / Rueckkehr nach Browserwechsel darf den fuer PKCE relevanten nativen Auth-Kontext nicht still verlieren

#### S4 Checkpoint D - OAuth-Callback wird nativ entgegengenommen und in Android-Session ueberfuehrt

- `MainActivity` erkennt jetzt den nativen OAuth-Rueckweg ueber:
  - Scheme `de.schabuss.midas`
  - Host `auth`
  - Path `/callback`
- Der Callback wird nicht nur erkannt, sondern direkt nativ verarbeitet:
  - Autorisierungscode aus Deep Link lesen
  - `exchangeCodeForSession(...)` gegen den nativen Supabase-Client ausfuehren
  - resultierende Session in `NativeAuthStore` schreiben
- Guardrails im aktuellen Zwischenstand:
  - Fehlerhafte Callback-Parameter (`error`, fehlender `code`, fehlender nativer Client, fehlender `userId`) werden explizit abgefangen
  - derselbe Callback-Intent wird nicht blind mehrfach verarbeitet
  - Browser-/PWA-OAuth bleibt weiter unangetastet
- Verifikation:
  - `:app:compileDebugKotlin` gruen
  - `:app:assembleDebug` gruen
- Bewertung:
  - `S4.4` ist sauber abgeschlossen.
  - Offene Folgepunkte bleiben bewusst fuer spaetere Substeps:
    - `S4.5` native Session in Widget-/Sync-Pfad integrieren
    - `S4.6` MIDAS-WebView nach nativer Anmeldung auth-konsistent booten

#### S4 Checkpoint E - Native Session ist jetzt Source of Truth fuer Widget-Auth und Sync

- Der bestehende Widget-Auth-Pfad ist jetzt explizit auf die native Session ausgerichtet:
  - `WidgetAuthStore` liest primaer aus `NativeAuthStore`
  - alte `midas_widget_auth`-Payloads werden nur noch als Legacy-Fallback gelesen und bei Zugriff in den nativen Store migriert
  - neue Saves laufen nicht mehr in einen dauerhaft separaten Widget-Auth-Speicher
- Damit ist der Android-Auth-Source-of-Truth fuer den laufenden Pfad klar:
  - `NativeAuthStore` = fuehrende Session-Quelle
  - `WidgetAuthStore` = Kompatibilitaetsadapter fuer bestehende Widget-/Sync-Klassen
- Nach erfolgreichem nativen OAuth-Callback wird jetzt direkt:
  - die native Session gespeichert
  - periodischer Widget-Sync sichergestellt
  - ein sofortiger Widget-Sync angefordert
  - das Widget zur direkten Neurenderung angestossen
- Verifikation:
  - `:app:compileDebugKotlin` gruen
  - `:app:assembleDebug` gruen
- Bewertung:
  - `S4.5` ist sauber abgeschlossen.
  - Offene Folgepunkte bleiben:
    - `S4.6` auth-konsistenter MIDAS-WebView-Boot nach nativer Anmeldung
    - `S4.7` expliziter nativer Logout-/Session-Clear ueber alle Android-/Widget-Pfade

#### S4 Checkpoint F - MIDAS-WebView bootet nach nativer Anmeldung auth-konsistent

- Die MIDAS-WebView besitzt jetzt einen expliziten Android-gateten Bootstrap-Pfad:
  - `app/core/android-webview-auth-bridge.js`
  - wird in `index.html` vor `boot-auth.js` geladen
  - laeuft nur, wenn die Android-Bridge vorhanden ist
- Dieser Bootstrap staged fuer den WebView-Kontext fruehzeitig:
  - `webhookUrl`
  - `webhookKey`
  - sowie, falls vorhanden, die native Session als Bootstrap-Payload
- `assets/js/main.js` wartet im `AUTH_CHECK` jetzt bewusst auf diesen Android-Bootstrap-Pfad, bevor die normale Web-Sessionpruefung greift.
  - der eigentliche Web-Session-Import passiert danach kontrolliert im Web-Auth-Core
  - Damit wird genau die Drift vermieden, die der Vertrag ausgeschlossen hat:
    - kein spaetes "Geradebiegen" nach bereits festgelaufenem unauth-Boot
    - deutlich geringeres Risiko fuer Login-Overlay-Flicker oder unauth-Drift nach nativer Anmeldung
- Die Android-WebView selbst ist jetzt haerter eingegrenzt:
  - nativer Auth-Bridge-Zugriff ueber `MidasAndroidAuth`
  - Navigation bleibt auf MIDAS-Origin beschraenkt
  - externe Ziele werden sauber an den Standardbrowser uebergeben
- Verifikation:
  - `:app:compileDebugKotlin` gruen
  - `:app:assembleDebug` gruen
- Bewertung:
  - `S4.6` ist sauber abgeschlossen.
  - Offene Folgepunkte bleiben jetzt:
    - `S4.7` expliziter nativer Logout-/Session-Clear ueber Android, Widget und WebView
    - `S4.8` Secure-Storage-/Store-Haertung

#### S4 Checkpoint G - Nativer Logout-/Session-Clear laeuft jetzt ueber einen gemeinsamen Android-Pfad

- Der Android-Pfad besitzt jetzt einen expliziten gemeinsamen Session-Clear-Controller:
  - `NativeSessionController.kt`
  - loescht:
    - `NativeAuthStore`
    - `WidgetAuthStore`
    - `WidgetSnapshotStore`
    - den nativen Auth-Client-Cache
  - stoppt zusaetzlich den Widget-Sync-Scheduler und refresht das Widget direkt auf Platzhalter
- Native Logout ist jetzt konkret ausloesbar:
  - in `MainActivity` ueber einen eigenen Logout-Button
  - in `MidasWebActivity` ueber einen eigenen Toolbar-Logout
- Die MIDAS-WebView wird dabei nicht nur spaeter beim naechsten Boot "hoffentlich" unauth, sondern aktiv nachgezogen:
  - offene `MidasWebActivity`-Instanzen werden ueber `notifyNativeSessionCleared()` explizit zum Web-Logout und Reload angestossen
  - der Android-WebView-Bootstrap fuehrt bei fehlender nativer Session keine zusaetzliche defensive Web-Signout-Mutation mehr aus
- Wichtiger Lifecycle-Effekt:
  - nach nativer Abmeldung bleibt das Widget nicht mit alten Werten stehen
  - der Worker retryt ohne Auth nicht endlos weiter
  - die WebView driftet nicht still im auth-Zustand weiter
  - laufende Worker sind zusaetzlich ueber einen leichten `sessionGeneration`-Guard abgesichert:
    - Login und Logout schalten die Generation weiter
    - ein Worker darf Snapshot-/Auth-Writes nur committen, wenn seine Start-Generation noch aktuell ist
    - damit wird das bekannte Race "Logout waehrend laufendem Sync" ohne harte Netz-Cancellation deutlich entschaerft
- Verifikation:
  - `:app:assembleDebug` gruen
  - `git diff --check` sauber, nur normale LF/CRLF-Warnungen ausserhalb dieses Blocks
- Bewertung:
  - `S4.7` ist sauber abgeschlossen.
  - Offene Folgepunkte bleiben jetzt:
    - `S4.8` Secure-Storage-/Store-Haertung
    - `S4.9` alten/brechenden WebView-Google-Login-Pfad sauber entfernen oder entkoppeln

#### S4 Checkpoint H - Native Auth-Daten liegen jetzt in einem abgesicherten Store mit Migration

- Der native Android-Pfad nutzt fuer Auth-/Bootstrap-Daten jetzt einen abgesicherten Persistenzpfad statt plain `SharedPreferences`:
  - `androidx.security:security-crypto-ktx`
  - `EncryptedSharedPreferences`
  - `MasterKey`
- Neue zentrale Hilfsstelle:
  - `SecurePreferencesFactory.kt`
- Umgestellt wurden:
  - `NativeAuthStore`
  - `NativeAuthConfigStore`
- Wichtiger Migrationsvertrag:
  - vorhandene Plaintext-Payloads aus dem bisherigen V1-Stand werden beim ersten Zugriff in den verschluesselten Store uebernommen
  - danach werden die alten Plaintext-Eintraege geloescht
  - damit bleibt der bestehende Android-/Widget-Pfad benutzbar, ohne alte Auth-Daten als finalen Zustand weiterzufuehren
- Source-of-Truth bleibt dabei unveraendert:
  - `NativeAuthStore` bleibt fuehrende Session-Quelle
  - `WidgetAuthStore` bleibt nur Kompatibilitaetsadapter
- Verifikation:
  - `:app:assembleDebug` gruen
- Bewertung:
  - `S4.8` ist sauber abgeschlossen.
  - Offener Folgepunkt bleibt jetzt vor allem:
    - `S4.9` den alten/brechenden WebView-Google-Login-Pfad sauber entfernen oder endgueltig entkoppeln

#### S4 Checkpoint I - Der alte WebView-Google-Login-Pfad ist im Android-Kontext entkoppelt

- Der gemeinsame Login-Overlay-Button bleibt fuer Browser/PWA unveraendert der bestehende Web-Pfad.
- Im Android-WebView wird derselbe Button jetzt jedoch bewusst auf den nativen Login umgelenkt:
  - kein `signInWithOAuth(...)` mehr innerhalb der eingebetteten `WebView`
  - stattdessen nativer Start ueber `MidasAndroidAuth.requestNativeGoogleLogin()`
  - damit wird der alte, von Google geblockte WebView-Login-Pfad im Android-Kontext faktisch entfernt, ohne die PWA anzufassen
- Das Login-Overlay unterscheidet die Kontexte jetzt explizit:
  - Browser/PWA:
    - unveraenderter Google-Login-Button
    - unveraenderte erweiterte Konfiguration
  - Android-WebView:
    - Hinweis auf sicheren Browser-Login
    - umbenannter Buttontext
    - Web-Konfigurationsbereich ausgeblendet, weil Android-Konfiguration und nativer Login-Owner bereits ausserhalb der WebView liegen
- Der Callback-Vertrag nutzt jetzt den Entry `webview` aktiv:
  - nativer Login aus der WebView startet mit `entry=webview`
  - nach erfolgreichem Callback oeffnet `MainActivity` MIDAS wieder direkt
  - damit bleibt die Shell nicht auf dem Launcher haengen, wenn der Login aus der WebView kam
- Verifikation:
  - `:app:compileDebugKotlin` gruen
  - `:app:assembleDebug` gruen
  - `git diff --check` sauber, nur normale LF/CRLF-Warnungen ausserhalb dieses Blocks
- Bewertung:
  - `S4.9` ist sauber abgeschlossen.
  - Der brechende Google-Login-Pfad lebt fuer Browser/PWA weiter dort, wo er hingehort: im echten Browser.
  - Im Android-WebView ist er jetzt nicht mehr der aktive Pfad.

#### S4 Checkpoint J - Lokaler Abnahmeblock fuer Build und Auth-Lebenszyklus ist geschlossen

- Der formale `S4.10`-Abnahmeblock ist lokal gegen den aktuellen Desktop-Stand gefahren worden:
  - `:app:compileDebugKotlin` gruen
  - `:app:assembleDebug` gruen
- Der lokale Code-/Vertragsstand deckt die entscheidenden Smoke-Punkte jetzt ab:
  - nativer Login-Start laeuft nicht mehr ueber `WebView`, sondern ueber sicheren Browser-Kontext
  - OAuth-Callback kehrt nativ zurueck und fuellt die Android-Session
  - Widget-Sync haengt an nativer Session statt an WebView-Login
  - Logout-/Session-Clear ziehen Android, Widget und WebView gemeinsam nach
  - der alte geblockte Google-WebView-Pfad ist im Android-Kontext entkoppelt
- Wichtig fuer die Ehrlichkeit des Abnahmeblocks:
  - echter Geraete-Smoke fuer
    - nativen Google-Login
    - echten Deep-Link-Rueckweg
    - sichtbare Widget-Aktivierung
    - expliziten Logout-Lebenszyklus auf dem Handy
    bleibt ausserhalb des lokalen Desktop-Checks weiterhin ein notwendiger manueller Test
  - dieser Geraete-Smoke ist kein offener Architekturstreit mehr, sondern der verbleibende reale End-to-End-Check
- Bewertung:
  - `S4.10` ist sauber abgeschlossen.
  - Der Android-OAuth-/Widget-Aktivierungspfad ist technisch soweit geschlossen, dass `S4.11` jetzt nur noch Doku-/Vertrags-Sync ist.

#### S4 Checkpoint K - Modul-Doku spiegelt den finalen Android-Auth-Vertrag jetzt sauber

- Die finalen Trennlinien sind jetzt in den relevanten Overviews gespiegelt:
  - `Android Widget Module Overview`
  - `Auth Module Overview`
  - `Supabase Core Overview`
  - `bootflow overview`
- Wichtige Doku-Synchronisation:
  - Browser-/PWA-Google-Login bleibt stabil und unveraendert
  - Android besitzt nativen OAuth ueber sicheren Browser + Deep Link
  - `NativeAuthStore` ist Android-Source-of-Truth
  - `WidgetAuthStore` ist nur noch Adapter
  - `WebView` ist MIDAS-Surface, nicht Login-Surface
  - Android-WebView-Boot ist auth-gatet und driftet nicht blind gegen den Browser-Bootflow
- Bewertung:
  - `S4.11` ist sauber abgeschlossen.

#### S4 Checkpoint L - Commit-Scope fuer den Android-OAuth-Nachzug ist klar geschnitten

- Empfohlener Commit-Scope fuer diesen Block:
  - `android/`
  - `app/core/android-webview-auth-bridge.js`
  - `app/supabase/auth/ui.js`
  - `assets/js/main.js`
  - `index.html`
  - `docs/modules/Android Widget Module Overview.md`
  - `docs/modules/Auth Module Overview.md`
  - `docs/modules/Supabase Core Overview.md`
  - `docs/modules/bootflow overview.md`
  - `docs/MIDAS Android Native OAuth & Widget Activation Roadmap.md`
- Empfohlene Commit-Richtung:
  - ein gemeinsamer Architektur-Commit fuer nativen Android-OAuth + Widget-Aktivierung
  - kein Aufsplitten in kleine Zwischen-Commits, weil Manifest, nativer Auth-Start, Callback, Store-Haertung, WebView-Import und Clear-Pfade fachlich zusammengehoeren
- Bewertung:
  - `S4.12` ist sauber abgeschlossen.
  - `S4` ist damit als Implementierungsblock abgeschlossen; offen bleibt nur noch `S5` fuer globalen Doku-/QA-/Abschluss-Sync.

### S5 - Doku, QA, Abnahme und Abschluss-Sync
- S5.1 README / Android-Widget-Overview / Widget-Contract nachziehen.
  - Android-Buildvoraussetzungen inkl. JDK-Vertrag sauber dokumentieren
- S5.2 `docs/QA_CHECKS.md` um nativen OAuth-/Deep-Link-Smoke erweitern.
- S5.3 `docs/modules/Auth Module Overview.md`, `docs/modules/Supabase Core Overview.md` und ggf. `docs/modules/bootflow overview.md` auf den finalen Trennvertrag ziehen.
  - finalen Auth-Source-of-Truth zwischen nativer Session und Widget-Store explizit dokumentieren
- S5.4 Finalen Build-/Login-/Widget-Abnahmeblock fahren:
  - nativer Login
  - nativer Logout
  - PWA-Login bleibt intakt
  - PWA-Logout bleibt intakt
- S5.5 Commit-Empfehlung dokumentieren.
- Output: neuer Android-Auth-Vertrag ist sauber dokumentiert und testbar.

#### S5 Checkpoint A - README und Android-Node-Doku spiegeln den finalen Auth-Vertrag

- `README.md` beschreibt den Android-Node jetzt nicht mehr nur als Widget-/Launcher-Huelle, sondern explizit als schmalen nativen OAuth-/Deep-Link-Node.
- `android/README.md` enthaelt jetzt:
  - nativen OAuth-Vertrag
  - Trennung zwischen Browser-/PWA-Login und Android-Login
  - Build-Hinweis zu Android-SDK / JDK 17
- `android/docs/Widget Contract.md` enthaelt jetzt zusaetzlich:
  - nativen Auth-/Shell-Vertrag
  - Logout-/Clear-Vertrag
- Bewertung:
  - `S5.1` ist sauber abgeschlossen.

#### S5 Checkpoint B - QA enthaelt jetzt den nativen Android-OAuth-Lebenszyklus

- `docs/QA_CHECKS.md` besitzt jetzt mit `Phase A8 - Android Native OAuth & Widget Activation` einen expliziten manuellen QA-Block fuer:
  - nativen Login-Start
  - Deep-Link-Callback
  - Widget-Aktivierung
  - WebView-Boot nach nativer Session
  - nativen Logout-/Session-Clear
  - Browser-/PWA-Regression
- Bewertung:
  - `S5.2` ist sauber abgeschlossen.

#### S5 Checkpoint C - Abschluss-Sync und Commit-Empfehlung sind geschlossen

- Die finalen Auth-, Supabase-, Bootflow- und Android-Overviews sprechen jetzt denselben Android-Vertrag.
- Die Roadmap enthaelt einen klar geschnittenen Commit-Scope fuer den gesamten Android-OAuth-Nachzug.
- Wichtiger Restpunkt bleibt bewusst ausserhalb der formalen Roadmap:
  - echter Geraete-Smoke fuer nativen Google-Login / Deep Link / Widget-Aktivierung
- Bewertung:
  - `S5.3` bis `S5.5` sind damit als Abschlussblock geschlossen.
  - Die Roadmap ist fachlich fertig und kann nach dem Commit wie ueblich auf `(DONE)` gezogen und archiviert werden.

## Follow-up - Widget Refresh Ergonomics

Ziel:
- den Android-Widget-Pfad ohne Push-/FCM-Infrastruktur alltagstauglicher machen
- den direkten Android-Einstieg fuer Widget-Aktualitaet staerken
- die Gefahr reduzieren, Browser-PWA und Android-MIDAS unnoetig parallel zu oeffnen

Guardrails:
- kein Push / FCM / serverseitiger Weckpfad
- Browser-/PWA bleibt Hauptsystem
- Android bleibt read-mostly Node mit pragmatischen Catch-up-Mechanismen
- Long-Press-Kontextmenues gehoeren primaer dem Launcher und werden nicht als eigener Produktvertrag missbraucht

Follow-up-Punkte:
- FU1 App-Start-Catch-up:
  - Beim Start der Android-App wird bei vorhandener nativer Session direkt ein Widget-Sync angestossen.
- FU2 Wake-/Unlock-Catch-up:
  - Solange der Android-Prozess lebt, wird bei `USER_PRESENT` / Unlock ein gedrosselter Catch-up-Sync versucht.
  - Das ist bewusst nur best effort und kein Ersatz fuer Push oder einen gekillten Prozess.
- FU3 Manueller Widget-Sync:
  - Ein kurzer Tap auf das Widget startet einen nativen Sync statt MIDAS direkt zu oeffnen.
  - Der explizite harte MIDAS-Einstieg bleibt ueber den Launcher bestehen.

Bewertung:
- Dieser Follow-up-Block ist bewusst ein UX-/Refresh-Nachzug und kein neuer Architekturstrang.
- Er soll den Widget-Alltag verbessern, ohne die bestehende PWA-/Android-Trennung oder die Plattform-Guardrails aufzubrechen.

## Smokechecks / Regression (Definition)
- Der bestehende Browser-/PWA-Google-Login funktioniert unveraendert weiter.
- Der bestehende Browser-/PWA-Logout funktioniert unveraendert weiter.
- Google-Login startet nicht mehr in der eingebetteten `WebView`.
- Login startet in `Custom Tabs` oder externem Browser.
- OAuth-Callback kehrt sauber in die App zurueck.
- Nach erfolgreichem Login wird das Widget aktiv.
- Das Widget zeigt danach echte Werte statt Platzhalter.
- Nativer Logout oder Session-Verlust leert den Android-Auth-Zustand deterministisch.
- Die native MIDAS-Huelle bleibt nach Login nicht in einem falschen unauth-Zustand haengen.
- Die native MIDAS-Huelle bleibt nach Logout nicht in einem falschen auth-Zustand haengen.
- Session-Import in die WebView erzeugt keinen Bootflow-/`AUTH_CHECK`-Drift.
- Kein `Zugriff blockiert` / `Use secure browsers` mehr.

## Abnahmekriterien
- Das Widget kann mit Google-/Supabase-Login sauber aktiviert werden.
- Der Login-Pfad ist policy-konform fuer native Android-Apps.
- MIDAS-WebView und nativer Session-Store driften nicht auseinander.
- Logout, Session-Verlust und Widget-Aktivierung sind als kompletter Lebenszyklus sauber geschlossen.
- Der Fix fuehlt sich wie ein sauberer Architektur-Nachzug an, nicht wie ein Workaround.

## Risiken
- Deep-Link-/Redirect-Konfiguration kann an Supabase-/Google-Konsole haengen und externe Nachpflege noetig machen.
- Ein zu impliziter Android-Buildpfad (z. B. lokaler JDK-Shim statt dokumentiertem JDK-Vertrag) koennte spaetere Builds auf anderen Rechnern wieder instabil machen.
- Ein zu spaeter Session-Import in die WebView koennte Bootflow-/`AUTH_CHECK`-Drift, Overlay-Flicker oder doppelte Refresh-Kaskaden ausloesen.
- Ein nativer Session-Owner ohne sauberen WebView-Import wuerde Widget und Shell auseinanderlaufen lassen.
- Parallele Stores (`NativeAuthStore` / `WidgetAuthStore`) koennten ohne klare Konsolidierung zu stale Auth-Zustaenden oder Widget-Drift fuehren.
- Ein nativer Session-Owner ohne sauberen Logout-/Clear-Vertrag wuerde alte Tokens oder irrefuehrende Widget-Zustaende hinterlassen.
- Ein zu manueller OAuth-Pfad koennte unnoetige PKCE-/Callback-Komplexitaet erzeugen, wenn `supabase-kt` die sauberere Wahl ist.
