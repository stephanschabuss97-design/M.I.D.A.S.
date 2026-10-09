# MIDAS Supabase Modernization — Startpaket für den nächsten Bucket

## Aktueller Wiedereinstieg — D32 / G3/G4 technisch ausgerollt, 2026-10-09

Dieser Stand geht den historischen Karten unten vor. Owner D32 gibt die konkrete Env-/Key-/Store-/Scheduler-/Acht-Function-/Caller-/Webveröffentlichung einschließlich Commit/Push frei. G2 bleibt lokal freigegeben; G3/G4 sind für dieses Paket GRANTED und technisch umgesetzt. G5/G6 NOT_GRANTED, G7 NON_SCOPE. HS256 CURRENT / ES256 STANDBY: keine Signingrotation oder Legacyabschaltung. Android/Widget bleibt außerhalb dieses Fensters.

**Env original geschlossen:** `.env.supabase.local` enthält alle 13 konkret benötigten Felder; fünf vorhandene Werte bewahrt, acht ergänzt. `monthly_report_backend` und `incidents_push_scheduler` einmal angelegt; keine Rotation vorhandener Keys. Echter nicht-anonymer Owner durch serverseitiges SDK2.45.4 `getUser()` belegt. Secretsfreie [Vorlage](templates/MIDAS%20Supabase%20Operator%20Env.example) und [Consumer-/Storezuordnung](MIDAS%20Supabase%20Operator%20Key%20and%20Store%20Map.md). 80 benannte Checks PASS. Original CLOSED / COMPLETED_SUCCESS: 93/34 → 88/34 Rest, Delta 5/0 Prozentpunkte, AccountedCharge 12/3 separat. Null Weeklydelta bei 1-Punkt-Auflösung bedeutet keine Nullkosten. Originalbelege `.kasrkin/work/supa-env-full-resume2-20261009`; eingefrorene Completion/Evidence unverändert.

**Ganzer Cutover:** neues Originalbundle `.kasrkin/work/supa-g3-cutover-resume2-candidate-20261009/bundle.json`; PRIMARY_ALLOWED bei 83/33 Rest, Originalpermit vor Arbeit persistiert. HEURISTIC 18–30 Punkte 5h / 4–8 Weekly, MEDIUM, inklusive Tests, gewöhnlicher Korrekturen, nativem Review, Veröffentlichung, Rückweg und Closure; Reserve 25/10 einmal zusätzlich. Keine vergleichbare Eligible History behauptet.

Frische Runtimepreimages aller acht Functions und ihrer JWT-Flags gesichert. Bestehende drei Schedulerowner stimmen per SHA-256-Storevergleich mit dem echten Owner überein; nicht überschrieben. `MIDAS_OWNER_USER_ID` neu gesetzt. Beide automatisch injizierten Keymaps entsprechen exakt den aktuellen fünf Secretkeys beziehungsweise dem Default-Publishable; keine manuelle SUPABASE-Mapänderung. GitHub `INCIDENTS_PUSH_SECRET_KEY` über stdin gesetzt und Metadaten gelesen; GitHub liefert keinen Klartext-/Digestreadback. Vorhandene URL- und Legacy-Stores bewahrt.

Acht Functions seriell über den vorhandenen API-Deploypfad veröffentlicht. Runtime-Source-Readback: 33/33 Dateien bytegenau. F23 CLOSED / VERIFIED_RUNTIME: ausschließlich `midas-incident-push` verify_jwt true → false, verbunden mit striktem Named-Key-/Fixed-Ownerguard; sieben andere Flags bewahrt. Neue Versionen Assistant 47, Transcribe 34, TTS 35, Vision 46, Monthly 66, Protein 37, Trend 37, Incident 32. Scheduler im asymmetrischen Fenster kontrolliert pausiert, keine laufenden/wartenden Runs; Nach erfolgreicher Caller-Veröffentlichung und Postchecks auf den ursprünglichen aktiven Zustand wiederhergestellt; keine laufenden/wartenden Runs, kein Dispatch.

Live-Smokes: 15 Scheduler-Key-/Bearer-/Nullwirkungstests und 15 User-Negativtests erfolgreich. Sieben echte Owner-Userpfade mit aktivem Authlistener und Authzustand `auth` erreichen ausschließlich ungültige Domaineingaben und stoppen vor Gesundheits-/Provider-/Pushwirkung. SDK-Fixtures bleiben als Fixtures gekennzeichnet: 113 Backendtests, 20 Auth-/Frontendtests sowie 11 gehostete Boot-/Medication-/Auth-/Logout-/cold/warm-PWA-Checks erfolgreich. Bestehende fingerprintgleiche v34-Update-/Report-/Capture-/Hub-/Voice-Belege weiterverwendet. Keine neuen echten Google-OAuth-, Logout-/Refresh-, Fremduser-/Anonymous-, klinischen oder Gerätetests behauptet.

Lokale Adapterkorrekturen vollständig erhalten: fehlendes CLI-Reverseconfig aus frischen Flagmetadaten erzeugt; Testlauncherrechte/VM-Flag/NODE_PATH/WSL-LF korrigiert; leere erfolgreiche Secretantwort per frischem Digestreadback reconciliert, kein zweiter Ownerwrite. Der Browser-Prüfadapter zunächst mit falscher Factorysignatur beziehungsweise zusätzlichem REST-Prefer-Header; anhand der tatsächlichen Consumer korrigiert, keine Produktcodekorrektur daraus. Historische fehlgeschlagene Harnessanläufe nicht in PASS umgeschrieben. Nativer Full-Contract-/Security-/Consumerreview; weiterhin exakt zwei historische S5-CodeRabbitläufe, kein dritter Lauf.

Commit `479bc4f4c6b747af0fff2e9dd6334cbb330be6c4` auf `origin/main`, Pages erfolgreich gebaut; 78/78 Assets exakt gegen Git verifiziert. Eigener Scope veröffentlicht, ausschließlich die fremde Future-Thought-Löschung bleibt dirty. Public-Konfiguration ist per Origin gespeichert; der echte Operatornachweis betrifft `127.0.0.1:5500`, nicht automatisch alte Pages-/Androidstores.

**Acceptance-/Archivgrenze:** technisch ausgerollt ist keine neue klinische Produktacceptance. Frühere Owner-Login-/Arztbericht-/BP-Beobachtungen bleiben gültige historische Belege, ersetzen keinen positiven Report-/Capture-Endpunktnachweis nach diesem Backenddeploy. Positive AI-/Pushwirkung wurde nicht freigegeben und nicht ausgeführt. Parent und Backend/Web-Child bleiben ACTIVE; kein (DONE), kein Archiv ohne Exitkriterien. Parent W4/W5/W6 bleiben offen. Fremde Future-Thought-Löschung bleibt außerhalb des eigenen Commits; Env, Tokens, private Receipts und Preimages außerhalb Git.

Aktueller Context Receipt: `.kasrkin/work/supa-g3-cutover-resume2-20261009/context-receipt.json` plus externer SHA. Originalcomplete folgt erst auf tatsächliche vollständige sichere Closure; End-/Receiptpublikation separat, ohne Änderung eingefrorener Evidence. Aktuelle Ownerangabe: nur dieser Auftrag; technische Attribution, Messoverhead und vollständige Datei-/Toolzählung UNKNOWN/null. Keine historische UNKNOWN-History aufwerten.

**Genau nächster fachlicher Schritt:** Stephan prüft nach dem Backendcutover in seiner normalen Web-/Live-Server-Session erneut die Arzt-Ansicht mit einem benötigten echten Bericht über vorhandene Daten. Keine künstliche BP-Messung oder Provider-/Pushprobe erzeugen. Ergebnis mit Zeitpunkt und verwendeter Oberfläche wertfrei erfassen; erst anhand der tatsächlichen offenen Acceptance-/Exitkriterien einen Child-Abschluss frisch zulassen. Kein Android-/Signing-/Legacycutover aus diesem Erfolg ableiten.


## Aktueller Wiedereinstieg — D29 / G3 freigegeben, Preflight abgeschlossen, 2026-10-09

Owner D29: „Dann los mit G3 … Mach alles sauber und archiviere die roadmap.
Volle freigabe“. Benannter G3-Backend-/Key-/Store-/Incidentcutover beauftragt;
keine erneute allgemeine Freigabefrage. Konkrete aktuelle Readiness und sichere
vollständige Zulassung bleiben vor produktiver Ausführung erforderlich.
Web/Auth v34 bereits veröffentlicht/verifiziert:7cd5a9c + Doku dbb03a1 (D28).
F22 OWNER_CONFIRMED_FIXED; lokale Ownerlogin/Doctor/Report/BP-Nachweise gültig.

G3-Preflight eigenständig PRIMARY_ALLOWED, Originalpermit vor Arbeit;
Start07:05:45+02 VALID48/39 Rest, HEURISTIC8–14/2–4 MEDIUM inklusive Closure,
Reserve25/10 einmal zusätzlich. Acht aktuelle deployed Functionstände samt
Abhängigkeiten/Flags separat frisch gesichert; vorhandene CLI2.109.1,
API-Deploy ohne Docker und acht ausführbare Source-Reversebefehle vorbereitet.
Kein Deploy, Key-/Secretwrite, Dispatch, Push, SQL-/Geräte-/Signing-/Legacyeffekt.

F23/P1 G3_READINESS_OPEN: Incident live verify_jwt=true ist inkompatibel mit
dem vorbereiteten apikey-only Named-Secretcaller. Der nächste volle Cutover
muss die einzige Flagänderung Incident true→false zusammen mit geprüftem
Body-Named-Key-/Ownerguard umfassen; sieben andere Flags unverändert.
Kein offener Handler, keine Authorization-Fallbackfreigabe. Der ältere
Paketvorschlag „alle Flags unverändert“ ist für Incident damit invalidiert.

default Publishable existiert; protein_targets_scheduler/trendpilot_scheduler
existieren. monthly_report_backend/incidents_push_scheduler fehlen;
MIDAS_OWNER_USER_ID fehlt, GitHub INCIDENTS_PUSH_SECRET_KEY fehlt.
Die drei alten Scheduler-Ownerwerte sind über Management nicht lesbar:
Gleichheit UNKNOWN. Authentifizierter nicht-anonymer Owner muss durch echtes
aktuelles getUser bestätigt werden; kein Admin-/Cache-/User-ID-Fallback.
Reservierte SUPABASE_* Maps vorhanden; Inhalt/Runtimepropagation UNKNOWN.
Offizieller Vertrag: automatisch injizierte Maps, nicht manuell überschreiben;
Customsecrets sofort wirksam, Supabase_-Präfix für manuelle Writes gesperrt.
Keytyp+Name gemeinsam auswählen: Publishable und Secret heißen beide default.

Konkreter vollständiger nächster Cutover: HEURISTIC18–30/4–8 MEDIUM,
Reserve25/10 genau einmal, Bedarf55/18. Noch kein produktiver Begin/Permit;
nicht kleiner teilen oder Forecast senken. Storevorbereitung, kontrollierte
Incidents-Schedulerpause/Stillstand, acht Deploys, Callercommit/-push,
Auth-/Nullwirkungspostchecks, Reverse, Review/Doku/Receipt/Closure enthalten.
Eine Pause ist Teil dieses kontrollierten G3-Fensters, kein automatischer Run.
Positive AI-/Gesundheits-/Push-/Gerätetests brauchen realen benannten Testumfang;
Owner-AI bleibt deaktiviert. Keine künstlichen klinischen Daten/Providerkosten.

Preflight original CLOSED / COMPLETED_SUCCESS:48/39 →43/39 Rest,
Delta5/0pp5h/Weekly, Ende2026-10-09T07:13:46+02. Separates Accounting14/4,
keine genaue Auftragskostenmessung; Weeklydelta0 bei1ppSensorauflösung ist
kein Nullkostennachweis. Cost/3 ineligible (Attribution/Overhead/volle Bounds
UNKNOWN).106 tatsächlich erfasste Checks PASS; keine Runtime-Smokes.
Docscommit/-push erfolgt in eigenem vollständig zugelassenem D29-Publikations-
block; dessen Originalbundle/Usage/Context unter
`.kasrkin/work/supa-g3-doc-publish-candidate-20261009` und
`.kasrkin/work/supa-g3-doc-publish-20261009`. Kein neuer produktiver G3-Begin.

Originalbundle `.kasrkin/work/supa-g3-preflight-v2-candidate-20261009/bundle.json`;
aktueller Context/Originalusage/Source-Reverse/Readiness unter
`.kasrkin/work/supa-g3-preflight-20261009`. End/Receipt ausschließlich Original
Complete; completiongebundene Evidence unverändert, Ableitungen separat.
59 historische Schutzfingerprints plus acht fresh Functionpreimages erhalten;
voller Files-/Toolcallcensus/Attribution/Messoverhead UNKNOWN/null, keine
Eligible History/Nullkosten/übernommenen W1-Obergrenzen/Paid Credits.

Parent/Child/Evidence/Execution Pack ACTIVE. Gesamt-DONE/Archiv erst nach
realen W4-Android-/Widget-, W5-Legacyfrei-/Job-/Abschalt- und W6-Exitnachweisen;
G3-Arbeitsfreigabe ersetzt keine Acceptance. HS256 CURRENT/ES256 STANDBY,
keine Rotation. Fremde Future-Thought-Löschung bewahrt; kein Reset/Stash.
Nächster zulässiger Produktblock: echtes aktuelles Owner-getUser als technischen
Nachweis herstellen, danach frische Zulassung des vollständigen G3-Fensters
mit exakt gebundenen aktuellen Preimages/Stores/Incidentflaggrenze.


## Historischer Wiedereinstieg — D28 / Web-v34 veröffentlicht, 2026-10-09

LOCAL_OWNER_ACCEPTANCE_PASS: Stephan bestätigt echten Login ohne erneutes
Overlay, Doctorunlock und erfolgreiche Reporterstellung01.01.2026–09.10.2026.
Zusätzlich bestätigte BP-Abendmessung08.10.2026 über den damaligen lokalen
Live Server, noch mit Authrace. OWNER_REPORTED/OWNER_SUPPLIED_RECORD, keine
unabhängige DBabfrage; keine Identifikatoren oder Messwerte hier dokumentiert.
F22 OWNER_CONFIRMED_FIXED. Der Backendstand dieser Ownerprüfung war der bestehende
Cloudstand; die neuen Backendguards waren weiterhin nicht deployt.

Owner D28: „Getesteten Web-/Authstand committen und veröffentlichen; offene
Roadmaps aktiv lassen“. G4_WEB_V34_GRANTED umfasst nur die exakt getesteten
Frontend-/Auth-/Webbridge-/Import-/SW-Assets und relevante Tests/Dokumentation,
normalen Commit/Push und Pages main/root. Produktive Backend-/Incidentworkflow-
Änderungen und fremde Löschung außerhalb des Git-/Releaseumfangs.
G3 NOT_GRANTED; übrige G4-Key-/Storewirkungen nicht enthalten; G5/G6 NOT_GRANTED,
G7 NON_SCOPE. HS256 CURRENT / ES256 STANDBY; keine Rotation.
Parent/Child/Evidence/Execution Pack bleiben ACTIVE, kein (DONE)/Archivieren.
W4/W5/W6 und Backend-/Incident-/Legacy-/Storeacceptance bleiben offen.
AI-Funktionen vom Owner standardmäßig deaktiviert; keine positive AIwirkung
in diesem Fenster. Künftige MCP-Ablösung nicht implementiert. Trendpilot und
Push nicht als bestanden gewertet, keine künstlichen klinischen Testdaten.

Whole Work/3 HEURISTIC6–12/1–3 MEDIUM inklusive Postchecks/Rollback/Closure,
Reserve25/10 einmal zusätzlich; neue volle AUTO_LOCAL-Zulassung PRIMARY_ALLOWED,
Originalpermit vor Ausführung persistiert. Nachgewiesene lokale F22/S5-Prüfungen
wiederverwendet; kein dritter CodeRabbit-Lauf. Originale vorbereitende Ablehnungen
und Fehler erhalten. F22-Abschlussevidence exakt gegen gebundenen SHA repariert:
die nachträgliche abgeleitete Veröffentlichung liegt separat, originale Receipt-/
Start-/End-/Completion-/Accountingbytes unverändert, keine Historyaufwertung.
Attribution/Messoverhead/volle Files/Toolcalls UNKNOWN/null, keine Paid Credits.

Publication-Status: WEB_V34_PUBLISHED / VERIFIED_HOSTED; Releasecommit
`7cd5a9c813066affc4313a60e6a4b05cee6a63ad`; Pages-Build `built`, exakt dieser Commit.
Originalbundle
`.kasrkin/work/supa-web-publish-v6-candidate-20261009/bundle.json`.
Aktuelle Evidence/Resume/Context/Originalusage unter
`.kasrkin/work/supa-web-publish-20261009`.
Postchecks:78 ausgelieferte Assets exakt gegen Gitbytes;140 Source-/Served-/
Schutzchecks PASS;11 gehostete Browserchecks PASS, keine Console-/Pageerrors.
Chromium149.0.7827.55, Desktop1366×900/Mobil390×844; kalter und warmer Boot,
aktueller SW, Offlineasset, Medicationtransport, Authlistener und Logout.
Browser-Plugin nicht verfügbar; vorhandenes Playwright1.61.1 verwendet, keine
Installation. SDK/Session/Storage sind isolierte Fixtures; alle nichtstatischen
Transporte lokal abgefangen, keine echten Gesundheits-/AI-/Providerwrites.
Lokale v32→v34-Updatenachweise bei identischen ausgelieferten Gitbytes weiter
verwendet; keine neue echte Google-/Android-/Backend-Acceptance behauptet.
Originale Usage erst bei Complete; Start/End/Receipt unter obigem Workpfad,
keine Schätzung als Messung. Completiongebundene Evidence bleibt unverändert.
Nächster zulässiger Schritt: das vorhandene konkrete G3-Backend-/Store-/
Incident-Cutoverpaket prüfen und benannte Wirkungsfreigabe einholen.
Vor dieser Freigabe keine neue produktive Wirkung.
Keine Supabase-, Key-, Secret-, SQL-, Workflow-Dispatch-, Geräte- oder Signingwirkung.


## Historischer Wiedereinstieg — D27 / F22 LOCAL_FIXED, 2026-10-09

Status: F22 LOCAL_FIXED / READY_FOR_OWNER_LOCAL_RETEST; echte lokale Owner-
Acceptance noch offen. W1/S1–S4R/L1–L3 und S5 historisch lokal abgeschlossen,
F21 LOCAL_FIXED; S6-Historie FINDING_ONLY unverändert. W2/W3 produktiv nicht DONE.
G2 lokal freigegeben; G3–G6 NOT_GRANTED/G7 NON_SCOPE.
HS256 CURRENT / ES256 STANDBY; keine Rotation oder neue Produktwirkung.

Bewiesene Kausalkette: unveränderte gültige Session + INITIAL_SESSION/SIGNED_IN
oder echter TOKEN_REFRESHED während einer Anfrage → aktiver Authlistener leert
Headercache (erneut bei finalizeAuthState) → alte Antwort verworfen → früher
pauschales Login-Overlay. Die Anzeige einer Identität allein berechtigt nicht.
SDK2.45.4 erzeugt beim tatsächlichen Visibility-Recovery erneut SIGNED_IN;
dies und HTTP-Refresh sind mit echtem SDK, synthetischer Session und ausschließlich
lokal abgefangenen Transporten reproduziert. Der genaue Trigger von Stephans
gestrigem Auftreten wurde nicht live instrumentiert; die Fehlerklasse ist bewiesen.

Kleine Korrektur: auth-context-changed bleibt ein abgewiesener Fehler; ausschließlich
eine frische, aktuelle, erfolgreiche Sessionprüfung mit tatsächlich unbrauchbarer
Session öffnet dafür das Login-Overlay. Fehler, Timeout oder weitere Generation-
änderung sind unklar, keine Logoutbeweise. Kein Cachefallback, keine alte Antwort
akzeptiert, kein bereits gesendeter Write wiederholt. Notes unterscheidet unklare
Writeantwort von echter Loginpflicht. Kohärenter Import-/SW-Assetgraph v34.

Verifikation: 24 Frontendgruppen, 8 Workergruppen, 33 verbundene Browserchecks,
12 Echt-SDK-Checks grün. Medication/Incident-Boot, verzögerter med_list_v2,
UI/Identität, ausdrücklicher frischer Read, Logout, Refresh, Client/Konfig/
Timeout/verspätete Antwort; Doctor-Render/Capture/Hub/Voice und cold/warm/update.
113 unveränderte Backendgruppen als fingerprintgebundene frühere Evidence
weiterverwendet, nicht neu ausgeführt. Full Contract/Security/Domain/Consumerreview
nativ; CodeRabbit bleibt genau2 historische S5-Läufe, kein dritter Lauf.

D27 erneuerte vollständige lokale Reparaturautorität und heutige Ownerangabe
„Nein, nur dieser Auftrag.“ an MIDAS/Release/Scope gebunden. Ganzes Work/3
HEURISTIC8–16/2–4 MEDIUM inklusive gewöhnlicher Korrekturen/Closure, Reserve25/10
einmal zusätzlich, Startbedarf41/14. Original Begin PRIMARY_ALLOWED/CONTINUE,
2026-10-09T05:53:54.8428272+02:00 VALID95/47; Permit vor erster Ausführung persistiert.
Originalbundle `.kasrkin/work/supa-bw-f22r2-candidate-20261009/bundle.json`.
Aktuelle Arbeitsbelege/Context Receipt samt SHA:
`.kasrkin/work/supa-bw-f22r2-20261009/context-receipt.json`.
Original F22-R2 CLOSED / COMPLETED_SUCCESS: kanonischer Start95/47 →Ende79/44
Rest, Delta16/3; Ende2026-10-09T06:16:14.4166518+02:00 VALID.
AccountedCharge16/4 separat, keine genaue Kostenmessung.
295 tatsächlich erfasste Prüfinvokationen (218 Source-/Dokumentassertionen und
77 Runtime-/Browser-/SDKchecks); 294 verschiedene benannte Prüfungen.
Forecastcap240 ist kein tatsächlicher Count oder Ownerceiling; Überschreitung
ehrlich im Original-Completion angegeben. Files/Toolcalls/Overhead/Attribution
UNKNOWN/null; eligible=false, eligibleForCalibration=false. Gründe:
ACTUAL_WORK_BOUND_INVALID, ATTRIBUTION_UNCLEAR, COVERAGE_OVERHEAD_UNKNOWN,
COVERAGE_UNPROVEN. Original Start/Permit/Completion/End/Cost-Receipt erhalten.
Nur original abgeleitete Abschlussfelder danach veröffentlicht, keine neue Messung.
Attribution/Messoverhead/volle Files/Toolcalls UNKNOWN/null; aktuelle Parallelnutzung
per Ownerangabe EXCLUDED, keine technische accountweite Reservation oder Eligible History.
Alte abgelehnte F22-Bundles/Handoffs/UNKNOWN-Receipts bleiben unveränderte Historie.

Genau nächster zulässiger Schritt: Stephan öffnet 127.0.0.1:5500, übernimmt den
angebotenen v34-Update/Reload (ohne Speicher/Session zu löschen), meldet sich falls
nötig einmal an und prüft Reload sowie Tabwechsel zurück zu MIDAS. Bei weiterhin
gültiger Session bleibt die Google-Anmeldung geschlossen; Medication ist lesbar.
Ein ausdrücklicher Logout muss die Anmeldung wieder anzeigen. DevTools Network:
http.js?v=34; keine Token-/Keywerte teilen. Bei erneutem Fehler nur Ereignisname,
Zeitpunkt, Requestpfad/Status ohne Daten und sichtbares UI festhalten.
Erst danach konkrete G3/G4-Ownerentscheidung; keine automatische Produktfreigabe.


## Historischer Wiedereinstieg — D25 / F22 OPEN, 2026-10-08

F22/P1: Stephan meldet intermittierendes Login-Overlay auf lokalem Live Server
127.0.0.1:5500 trotz angezeigter angemeldeter Identität. Der tatsächliche Stack
führt über Medication/Incident-Boot zu http.js:198 auth-context-changed und
authFailure:170, das pauschal showLoginOverlay öffnet. Der lokale Sourcepfad ist
belegt; Ursache des Authcontextwechsels, echter SDK-/Bootablauf und Reparatur
noch nicht untersucht/verifiziert. Google-OAuthfehler nicht behauptet.

Status: LOCAL_AUTH_ACCEPTANCE_OPEN / NOT_STARTED_CAPACITY_BLOCKED.
Frühere lokale S5/S6-/F21-Prüfungen und Originalreceipts bleiben Historie;
sie decken dieses neue tatsächliche Auth-/UI-Finding nicht ausreichend ab.
Kein aktuelles READY_FOR_G3_G4: vor Owner-Produktfreigabe und lokalem Retest F22
reparieren. W1/S1–S4R/L1–L3 unverändert; F21 LOCAL_FIXED. G2 lokal freigegeben,
W2/W3 produktiv nicht DONE; G3–G6 NOT_GRANTED/G7 NON_SCOPE.
HS256 CURRENT / ES256 STANDBY; keine neue Signing-/Legacy-/Produktwirkung.

D25 tatsächlicher Ownerauftrag: „Dann lass uns das fixen - so kann ich natürlich
nichts testen und freigeben“. Lokale Diagnose/Reparatur/Regression/nativer Full
Review/Evidence/Docs/Closure autorisiert; keine Reserveausnahme oder Paid Credits.
Ganzer Reparaturblock HEURISTIC5–10/1–3 MEDIUM, Reserve25/10 einmal, Startbedarf
35/13. Original frischer Begin2026-10-08T22:29:11.0095564+02:00 VALID34/49:
CAUTION/PRIMARY_REJECTED_FOR_RESERVE, CAPACITY_INSUFFICIENT:fiveHour, Permit=null.
Keine Diagnose/Tests/Reparatur nach Ablehnung, kein Originalstart/Complete oder
Costreceipt erfunden. Abgelehnter Bundle und Originalausgabe bleiben erhalten:
`.kasrkin/work/supa-bw-f22r1-candidate-20261008/bundle.json`,
`.kasrkin/work/supa-bw-f22r1-20261008/admission-output.txt`/`admission-result.json`.

Dieser eigene vollständige Dokumentationsabschluss aktualisiert nur vier aktive
Handoffs, Finding/Status/Evidence/Fingerprints/Resume; keine Teilreparatur oder
Forecastsenkung. Original PRIMARY_ALLOWED/CAUTION22:34:18.9392784+02:00 bei31/49,
HEURISTIC0,5–2/0,25–1 MEDIUM +Reserve25/10 einmal, Startbedarf27/11.
Bundle `.kasrkin/work/supa-bw-f22-handoff-v2-candidate-20261008/bundle.json`.
Aktueller Context Receipt samt SHA:
`.kasrkin/work/supa-bw-f22-handoff-20261008/context-receipt.json`.
Attribution/Messoverhead/volle Files/Toolcalls UNKNOWN/null. Kein kalibrierbarer
Kostenbeleg oder Nullkosten aus dem abgelehnten Reparaturversuch.

Genau nächster zulässiger Schritt: bei ausreichender kanonisch beobachteter
Kapazität den ganzen F22-Reparaturblock mit neuen Bundle-IDs frisch Prepare/Begin
zulassen. Kein abgelehntes Bundle reaktivieren, kein Legacy-/Endphase-Retry,
kein automatisches Warten. Danach wirklichen Session-/Boot-/SDK-/UI-Verlauf
mit lokal abgefangenen Transporten prüfen: veraltete Antworten weiter ablehnen,
gültige aktuelle Anmeldung nicht als Logout darstellen; echten Logout/Session-
verlust weiterhin sichtbar behandeln. Keine automatische Wiederholung bereits
abgesandter Gesundheitswrites. Bestehende echte Auth-/Browser-/SW-Consumerchecks
und kohärenter Import-/Cachegraph gehören in denselben vollständigen Block.
Native Reparaturprüfung; CodeRabbit bleibt genau2 historische S5-Läufe.
Erst nach grüner Repairclosure lokaler Owner-Retest und G3/G4-Entscheidungspaket.


## Historischer Wiedereinstieg — D24 / F21-R1, 2026-10-08

W1 und Child S1–S4R, lokale L1–L3 sowie integriertes S5 sind abgeschlossen.
F21 ist im eigenen zugelassenen Reparaturblock LOCAL_FIXED; die verbleibende
lokale S6-Finalverifikation ist grün: READY_FOR_G3_G4, weiterhin undeployt.
Original S6 bleibt CLOSED/FINDING_ONLY (59/53 →49/52, Delta10/1), ebenso bleibt
L2 ursprünglich FINDING_ONLY. Kein historisches Receipt wird aufgewertet.
W2/W3 produktiv nicht DONE; G3–G6 NOT_GRANTED/G7 NON_SCOPE.
HS256 CURRENT / ES256 STANDBY; Import war keine Rotation oder Abschaltung.

Aktueller Source-/Evidence-/Resume-Receipt:
`.kasrkin/work/supa-bw-f21r1-resume2-20261008/context-receipt.json` samt SHA.
Originalbundle: `.kasrkin/work/supa-bw-f21r1-resume2-candidate-20261008/bundle.json`.
PRIMARY_ALLOWED/CONTINUE, Originalstart22:12:28.9806312+02:00 bei44/51 Rest;
HEURISTIC3–6/1–2 MEDIUM, Reserve25/10 einmal zusätzlich (Startbedarf31/12).
Original CLOSED/COMPLETED_SUCCESS:Ende39/50, Delta5/1, accountedCharge6/2
separat; Receipt nicht eligible/kalibrierbar. Attribution/Messoverhead/volle Files/Toolcalls
UNKNOWN/null; aktuelle Ownerangabe „Nein, nur dieser Auftrag.“ Keine Paid Credits.

Genau nächster zulässiger Schritt nach grüner Originalclosure: Stephan prüft
das konkrete G3/G4-Entscheidungspaket im Backend/Web-Child. Vor Freigabe der
benannten Key-/Store-/Function-/Workflow-/Pageswirkungen stoppen. Kein Commit,
Push, Deploy, Dispatch, SQLwrite, Geräteaufruf oder Signing-/Legacyeffekt.
Die älteren Karten/Startanweisungen unten bleiben historische Checkpoints.


## Geltung und tatsächlicher Stand

NB-1 / 2026-10-08. Verbindliche Ergänzung zum [Backend/Web-Child](<MIDAS Supabase Backend and Web Authentication Modernization Roadmap.md>), [Parent](<MIDAS Supabase API Key and Edge Authentication Modernization Masterplan.md>) und [Evidence](<MIDAS Supabase API Key and Edge Authentication Modernization Evidence.md>). Kein neues Produktprogramm.

W1/JP1/S1–S4R original geschlossen; BW-S4R-1 READY_LOCAL und G2 LOCAL_GRANTED.
Historisch unter D23: L1–L3 VERIFIED_LOCAL, S5 damals nächster vollständiger Block.
Die folgenden NB-1-Startanweisungen sind Historie; aktueller Resume am Ende.
Historisch S4/L1 DONE_LOCAL; L2 damals nächster Block. Historischer L1-Begin12:36 wurde bei38/75 Rest regulär ohne Permit
abgelehnt;14/4 obere Spanne plus Reserve25/10 erfordert39/14. Historie bewahren.
Owner D22 verschiebt jetzt die restliche Umsetzung ausdrücklich auf den
nächsten wieder vollen 5h-Bucket und beauftragt bis dahin Vorbereitung samt
Bruchrisiken. D21 bleibt lokale Autorität, D22 steuert den Zeitpunkt.
Kein automatisches Polling/Warten/Starten und keine Produktwirkung in NB-1.

NB-1 ist ein eigenständiges überprüfbares Vorbereitungsresultat, kein
verkleinertes L1. Eigener Work/3-Begin12:46:04+02, PRIMARY_ALLOWED34/74;
HEURISTIC3–8/0,5–2 MEDIUM mit gewöhnlichen Korrekturen/Verifikation/nativem
Full Review/Evidence/Dokumentation/Closure; Reserve25/10 genau einmal.
Originalbundle `.kasrkin/work/supa-bw-nextbucket-prep-20261008/bundle.json`.

## Start nach dem tatsächlichen Reset

1. Ownerfortsetzung in neuem Chat/Turn; dieses Paket, Parent/Child Resume und
   Context Receipt benutzen. AGENTS/README-Lesepflicht und fingerprintgebundene
   Governance/Modulquellen beachten. Kein kompletter Projekt-/Logscan.
2. Gitstatus/HEAD sowie protected Source-/Harnessfingerprints vergleichen.
   Fremde Löschung `docs/KASRKIN Future Thought - Artifact Lifecycle and Cost Learning.md`
   schützen; eigene drei Roadmapdocs plus dieses Paket sind Auftragsänderungen.
   Kein Reset/Stash/Commit/Push. Fremde Überschneidung zuerst sauber abgrenzen.
3. Lokale command.json/binding, extern gepinnter Receipt-SHA und K0-Proofbytes,
   Bootstraprolle/-bytes und ausgewählter Shim in explizitem PS5.1 verifizieren.
   Vorhandener Wrapper `Invoke-Verified.ps1` im W1-Workbereich bleibt nutzbar
   nur bei unverändertem überprüftem Hash/Binding; kein latest/reactivate/PATHfix.
4. Tatsächlichen D21+D22-Auftrag an genau MIDAS/Release/Scope binden, neue
   Vorbereitung/finale Bundle-IDs und aktuelle Dokumentfingerprints. Alte
   abgelehnte Bundles/Ownercharges/UNKNOWN bleiben erhalten; keine automatische
   State-/Authoritymigration oder erneuerte Quote aus Reset ableiten.
5. Vollständiges L1 unverändert neu Prepare-binden; keine vorbereitende
   validate-Messung. Frischer Begin misst den aktuellen Bucket und Reset-IDs.
   D22: Umsetzung erst beim wieder vollen neuen 5h-Fenster. Eine Chatangabe100%
   ersetzt keine kanonische Beobachtung. Nicht gestartet/Permit=null bedeutet
   keine Arbeit, keine Completion und keine Legacy-Endphase-Retrykette.
6. Erst PRIMARY_ALLOWED und original persistiertes Permit: ganze L1-Kette
   umsetzen, verifizieren, Delta/Consumerreview, gewöhnliche lokale Fehler
   korrigieren, Evidence/docs/sicherer Endzustand, originales Complete.
7. L2 → L3 → L4/S5 → lokale S6-Bereitschaft jeweils aus tatsächlichem Ergebnis
   neu dimensionieren/frisch zulassen. Keine alte Prozentmessung oder dieses
   Startpaket als nächste Zulassung. LIMIT/FINAL_RESPONSE_ONLY final-only.

Kein Versprechen, dass alles in einen Bucket passt: lokale Summe laut S4R
40–76/11–21 HEURISTIC, keine gemessenen Kosten; Reserve/Weekly/Review und
tatsächliche Korrekturen können ein weiteres Fenster erfordern. Kein Tokenburn.

## L1 — konkrete lokale Datei-/API-/Testgrenze

Genau vier gemeinsame Code-/Testdateien sind geplant:

- Neu `_shared/edge-auth.ts`: lokale moderne Map-/Legacyübergangsauswahl,
  fester `MIDAS_OWNER_USER_ID`, serverseitiger Ownergleichlauf, GetUser und
  striktes `is_anonymous === false`, sanitisiertes Fehlerorakel; keine
  generische Benutzerverwaltung oder Veränderung medizinischer Semantik.
- Neu `_shared/edge-auth_test.ts`: synthetische positive/negative Corefälle
  plus tatsächliche Protein/Trend-Handlerkette mit echtem Principal und
  kontrollierter GetUser-/Query-/RPCfixture; keine Netz-/AI-/Pushwirkungen.
- Änderung `_shared/activity-edge-principal.ts`: gemeinsamen Guard/Keyleser
  verwenden, Schema/Exports/RPC-Kontext erhalten. Userclient bleibt RLS-JWT;
  Secretpfad bleibt exakt zielbenannt und nur ohne Userbearer.
- Änderung `_shared/activity-edge-principal_test.ts`: Userfixtures mit
  explizitem Anonymousfeld, erlaubter fester Owner und konsistente Scheduler-
  Owner; fremde IDs separat als Negative. Bestehende Cross-key/failed-bearer-
  und Sanitizationfälle erhalten/erweitern.

Keine Änderung an Protein-/Trendberechnung, SQL/RPCrollen, Bodyweight-/Range-
oder Cooldown-/Doctorlock-Semantik. Die beiden Handler sind direkte Consumer-
Review- und Integrationstestziele. Neue notwendige Änderung außerhalb dieser
Grenze zuerst als tatsächliches Delta bewerten; nicht still hineinschreiben.

Konkrete Negativorakel: missing/malformed/invalid/expired JWT, User=null,
fremder oder anonymous User, fehlendes/falsches Anonymousfeld, GetUserexception/
Authserverfehler, fehlender/ungültiger fester Owner, Schedulerownerdrift,
public/wrong-name/legacy/sb_secret-in-Bearer, malformed/empty/missing selected
Mapeintrag. Authfehler401, sichere Serverkonfig-/Authverfügbarkeit500. Keine
Secret-/Owner-/Token-/Fehlerdetails im öffentlichen Resultat/Log.

Die bestehenden `handler-integration_test.ts` beider Consumer injizieren
`createPrincipalFactory`. Ihre Geschäfts-/RPC-/Ownerfilterorakel sind gültige
Vorarbeit; sie beweisen nicht die neue Authprüfung. Deshalb im neuen gemeinsamen
Test echte `createActivityEdgePrincipal` → `createProteinTargetsHandler` und
`createTrendpilotHandler` verwenden. GetUser kontrolliert beantworten; denselben
angeschlossenen Client/Fetchspy/RPCcounter beobachten. Negative müssen vor
Daten/AI/Push enden. Ein unverbundener Fakeclient mit0 Calls wäre kein Beweis.

## Bruchrisikomatrix und verpflichtende Orakel

| ID | Konkreter Bruchpunkt | Gegenmaßnahme / Nachweis vor betroffenem Exit |
| --- | --- | --- |
| B01 | API-Key-only passiert laut aktuellem Headervertrag möglicherweise den Gatewaycheck; verify_jwt allein ist keine Userautorität | GetUser + Owner + Anonymous vor jedem Dateneffekt; alle acht Handlernegative mit zero-effect Orakel, Flags nicht pauschal ändern |
| B02 | MIDAS_OWNER_USER_ID neu; vorhandene Schedulerowner könnten fehlen/abweichen | typgültigen festen Owner verlangen, alle drei Serverowner auf denselben Wert binden; fehlend/drift fail closed500. Lokale Fixtures heute, tatsächliches Storebinding erst G3 |
| B03 | Moderne Map vorhanden aber leer/kaputt/ohne selected/default; stiller Fallback verschleiert Konfigfehler | Presence von Inhalt trennen; vorhandene defekte Map nie auf Legacy/Singular/anderen Mapkey umleiten. Expliziten Zielnamen/default verlangen und Negativfälle testen |
| B04 | SDK1.4.1 besitzt eigene tolerant-parsende Map-/Singular-/first-entry-Fallbacks | eigene strikte Vorvalidierung/ausdrückliche Envübergabe vor SDK-Kontext. SDK Named-secret bindet supabaseAdmin tatsächlich an auth.keyName; User-/defaultkontext darf keinen impliziten ersten Key wählen |
| B05 | Neuer Mapclient verwechselt Publickey/Session oder caller secret mit eigener interner Adminalias | Userclient apikey public + JWT Authorization, kein Adminfallback. Monthlyintern exakt monthly_report_backend; Incident exakt incidents_push_scheduler. Keine per-Key-SQL-Isolation behaupten |
| B06 | Ungültiger Userbearer zusammen mit gültigem Schedulerkey wird zum Secretcaller | vorhandene Bearergrenze priorisiert: jeder vorhandene Bearer bleibt Userpfad, Fehler endet401/500; schedulerCalls=0 beweisen |
| B07 | Alte Tabs/APKs schicken weiterhin Key-Bearer | Caller-Productload mit Legacy-public + Session zuerst bereitstellen, dann gegatete Backendguards; alte Caller fail closed mit Reload/Login/Updatepfad. Native Umsetzung eigener W4-Gate |
| B08 | Neuer Client, alter Inflightgetter, Headercache und SDKlistener liefern fremde alte Generation | Konfiguration/Client/Sessiongeneration prüfen, alle Caches invalidieren, alte Completion darf neuen State nicht publizieren; race-Tests Key/Projekt/Sessionwechsel/Logout/Refresh/Timeout |
| B09 | Konfigspeicherung ersetzt Client, aber neuer Authlistener fehlt oder alter läuft weiter | alte Subscription gezielt unsubscribe, neue genau einmal binden; Listener an eigenen Client binden. Deferred callback außerhalb SDKauth-Lock erhalten. Keine doppelte Boot-/Writeaktion |
| B10 | Preflight blockiert Serviceworker; PWA alte Imports können trotzdem wirksam bleiben | S5 eigenes SW-aktives Harness, echte Cacheversion/Imports/CORE_ASSETS gemeinsam; kalt/warm/Waiting-SW/SKIP_WAITING/controllerchange/alterTab/offline/resume. v32 heute nur Preimage, nächste Version erst frisches L3-Preimage |
| B11 | Browser-Restore/Nativebridge bringt privilegierten Key in IndexedDB oder überspringt UIprüfung | sämtliche tatsächlichen Reader/Client/Header fail closed; gegenwärtige Web-Writer UI und Androidbridge belegt. Native Validator/Store/Widgetpersistenz bleibt W4, Webfilter ersetzt dessen Abnahme nicht |
| B12 | Incident-Function erwartet neuen Key, cron läuft noch mit Legacy-Authorization | Function/Secret/GitHubstore/Action gemeinsam unter G3 samt kontrolliertem Jobfenster und Reverse. Kein Dispatch heute; Scheduler-/Manualdiagnosevalidierung und Europe/Vienna-Schwellen bewahren |
| B13 | Importieren eines heutigen AI/Monthly/Incidenthandlers startet Server oder scheitert an top-level Env/VAPID | L2 testbare Handlerfactory + import.meta.main passend vorhandener Dualhandler, produktives Serve erhalten; Fakeenv/Fetch/VAPID strikt vor Seiteneffekt. Keine Generics-/Algorithmusrefaktorisierung |
| B14 | SDK-/Gatewaydoku oder Release/Sources/Host/Ownerauftrag driften nach Reset | genaue betroffene Fingerprints/verwendete Primärquelle refreshen. Unveränderte W1/JP1-Beweise reuse; Scope/Readiness bei echter Vertragsdrift gezielt invalidieren |

SDK1.4.1 aus bereits vorhandenem Deno-Cache fokussiert gelesen:
`create-supabase-context-tDtxd9x2.mjs` setzt im Secretmodus
`createAdminClient({auth:{keyName:auth.keyName}})`; dieser explizite Name hat
keinen first-entry-Fallback. Ohne Namen benutzen Admin-/Contextclient dagegen
default und gegebenenfalls ersten Mapeintrag. `resolveKeys` priorisiert nur
truthy plural, dann Singular; `parseKeys` liefert bei defektem JSON leere Map.
Unser strikter Presence-/selected-entry-Vertrag darf nicht delegiert werden.
Diese Klarstellung ergänzt BW-S4R-1, kein SDKupgrade oder Produkt-PASS.

## Reproduzierbare lokale Prüfwege

Vorhandene Deno-Flags am installierten2.9.7 per help überprüft. Im L1:

```powershell
deno test --cached-only --no-lock --allow-env=SUPABASE_URL,SUPABASE_PUBLISHABLE_KEYS,SUPABASE_SECRET_KEYS,SUPABASE_PUBLISHABLE_KEY,SUPABASE_SECRET_KEY,SUPABASE_JWKS,SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,MIDAS_OWNER_USER_ID,PROTEIN_TARGETS_USER_ID,TRENDPILOT_USER_ID backend/supabase/functions/_shared/edge-auth_test.ts backend/supabase/functions/_shared/activity-edge-principal_test.ts backend/supabase/functions/midas-protein-targets/handler-integration_test.ts backend/supabase/functions/midas-trendpilot/handler-integration_test.ts
deno check --cached-only --no-lock backend/supabase/functions/_shared/edge-auth.ts backend/supabase/functions/_shared/activity-edge-principal.ts backend/supabase/functions/midas-protein-targets/index.ts backend/supabase/functions/midas-trendpilot/index.ts
git diff --check
```

Die zwei neuen Dateien existieren heute noch nicht. Diese Commands sind ein
vorbereiteter Prüfvertrag, kein ausgeführter PASS. Kein --no-check/allow-net/
allow-all/Download/Installation. Fixtures setzen Env nur synthetisch und stellen
Preimages im finally wieder her; Produktionswerte nicht lesen/dumpen. Bei
fehlendem cached Import konkreten Bedarf/Gate melden, keine Installation.
L2 ergänzt nur tatsächlich benötigte fake OPENAI-/VAPID-/Incidentenvs.

Vorhandener Browser-Preflight unverändert hashgebunden im Workbereich kopiert:
`harness-preflight.cjs`, SHA256
`556e46661184796e0b50d0f5659f1c68d9b8bf4c30f3e97d0ebeaee53e88644d`.
Mit process-only NODE_PATH `C:/Users/steph/AppData/Roaming/npm/node_modules`
und `node <kopierter Harness>` reproduzierbar; root MIDAS, eigener localhost-
Port/Browserkontext. Temporäre QAartefakte außerhalb Git. Kein CUA-Dashboard-
Navigationsauftrag aus diesem Test und keine neue Installation.

Baseline: vollständige reale index.html, echter Konfiglistener/IndexedDB,
Reload/IDLE, Carouselgesture, PINunlock, Doctorcreate/formsubmit, Reports-
Fassade/Header/Transport bis sichtbarem synthetischen Fehler. Alle Remote-
Requests lokal erfüllt; auch automatische lokale RPC-/DELETEfixtures erreichen
keine echte Produktion. Die Stub-SDK liefert keine echte JWTverifikation.
Heute nicht erneut ausgeführt, da unveränderte Sources/Harness exakt belegt.

L3/L4 erweitern unter eigenem Permit: positive Reportantwort mit echtem
Render/read-back/Reportlifecyclefixture; produktive Capturegeste durch aktiven
Listener; reale Hubtext-/Voiceheaderquelle; Refresh/401retry/Logout/races;
SW-aktives PWAupdate. Assertions müssen Routing/Sources/Listener/Effectcounts
verbunden beobachten, nicht durch isolierte Testbuttons oder direkte Handler-
Funktionsaufrufe die produktive UIkette ersetzen.

## Produktfenster — reviewbare Vorbedingungen, keine Wirkung heute

| Fenster | Fehlender konkreter Eingang / Forward / Reverse |
| --- | --- |
| G3 Owner-/Keystores | ohne Werteausgabe echten MIDAS-User/Projektref und Gleichheit der drei Serverowner bestätigen, MIDAS_OWNER_USER_ID binden; fehlende Namen incidents_push_scheduler/monthly_report_backend und GH INCIDENTS_PUSH_SECRET_KEY konkret bereitstellen. Existierende Default-/Protein-/Trendkeys nicht neu anlegen. Sichere Referenzen/preimages, keine Secretwerte in Artefakten |
| G4 Caller-Productload | exakt lokaler/main-/Pages-/SW-/Importpreimage; finaler S5-Gesamtdiff vorher grün. Commit/Push/Pageswirkung konkret freigeben. Legacy-public kompatibel zuerst, Authsession/Reload-Pfad beweisen; Reverse exakt eigenes Release, keine fremden Writes überschreiben |
| G3 Functions/Incident | frische Versions-/Flags-/Source-/Secretnamen-/Storebindingpreimages; einzelne Function-/AIcost-/Push-/Dispatchsmokes konkret freigeben. Incidentaction und Function zusammen; negative/sichere Smokes vor kostenden Effekten. Reverse Source/Flags/Action/Bindings, kein blindes Folgeexperiment |
| G4 Publishable/PWA | W2-Authacceptance und alterTab/APKgrenze, aktueller Publictyp/Projektbinding, Store/Clientcache/SW/importpreimage; Publishable/Postchecks/Reverse ohne Signingwechsel |
| W4/G5 | eigenes natives S4R und Variante/Device/Session-/Store-/Widgetpostimage; keine Standard-APK-/Deviceannahme aus Webpreflight |
| W5/W6 | alle wirklichen Caller/Stores/Scheduler/Web/native akzeptiert, dann konkrete Legacydisable-/Reversefreigabe; Roll-up nur mit echter Acceptance, kein DONE aus Planung |

Wenn ein Pflichtsmoke fehlschlägt: originalen produktiven Block zuerst atomar
reversen/postchecken/finding/closure, dann Diagnose separat neu zulassen.
Gewöhnliche lokale autorisierte Korrekturen im originalen lokalen Block beheben.
CodeRabbit ausschließlich gemeinsames S5: ein Initiallauf/maximal ein
begründeter Verifikationslauf, kein Review jetzt oder je Produktteilfenster.

## Nachweise, Review und Fortsetzung

EV-NB-01–05: actual Owner D22/Work3, gezielte Test-/Consumer-/SDK-/Cache-
Risikoüberprüfung, dauerhafter Harnessreceipt/Quellpreimages, nativer Full
Contract/Security/Scope/Recoveryreview und konsistentes vier-Dokument-Handoff.
NB-1 Context-/Verification-/Originalcompletion unter
`.kasrkin/work/supa-bw-nextbucket-20261008/`. UNKNOWN Attribution/Parallelusage/
Overhead/volle tatsächliche Counts bleibt ineligible. Keine neue Liveinventory,
kein geänderter Produktcode, keine neue Produktabnahme oder Freigabe aus NB-1.

Aktuelle offizielle Quellen gezielt geprüft: [Header/Gateway](https://supabase.com/docs/guides/functions/auth-headers), [Authmodi](https://supabase.com/docs/guides/functions/auth), [Env-Maps](https://supabase.com/docs/guides/functions/secrets), [Changelog](https://supabase.com/changelog).
Index vom8. Oktober: Frameworkadapterdeprecation vom5. Oktober berührt den
verwendeten Coreaufruf nicht; kein automatisches SDKupgrade daraus. JWKS-
Standby/HS256current aus JP1 bleibt separate Signingrealität.

Nächster Schritt nach originaler NB-1-Closure: Umsetzung gemäß D22 im nächsten
vollen Bucket, minimaler Receipt-/Git-/Trustrefresh, vollständiges L1 mit
aktuellen fingerprints frisch Prepare/Begin. Nicht automatisch heute starten.


## NB-1 Originalclosure und damaliger Resume (Historie; aktuell D23/L1)

NB-1 DONE_PREPARATION / CLOSED / COMPLETED_SUCCESS,
2026-10-08T12:55:58.4586175+02:00. Tatsächliche sechs Aktivitäten abgeschlossen;
Originale start/end/receipt desselben Work/3-Bundles erhalten. Start34/74 →
Ende25/73 Rest, kanonisches Delta9/1; accountedCharge9/2 separat.
FORECAST_OVERRUN:5h9 statt Oberprognose8, advisory; sichere Closure erfüllt,
kein tatsächlicher numerischer Ownerceiling verletzt/erfunden. Reserve25/10
nicht zweimal verrechnet, kein zusätzlicher Refresh/weiterer Block.
LOWER_BOUND_UNKNOWN_EXCESS / ACCOUNTING_ATTRIBUTION_UNKNOWN; Bounds/Attribution/
Overhead/Parallelusage UNKNOWN und Receipt nicht eligible/kalibrierbar.

Implementierung bleibt gemäß D22 bis zum nächsten aufgefüllten Bucket
aufgeschoben. Kein Code/Deploy/Produkt-PASS aus Vorbereitung. Nächster
zulässiger Schritt: Ownerfortsetzung, minimaler NB-1-Receipt/Git/Trustrefresh,
ganzen L1-Scope an aktuelle Fingerprints neu Prepare-binden und mit kanonischem
frischem Begin zulassen; erst PRIMARY_ALLOWED/persistiertes Permit umsetzen.
Keine automatische Warteschleife oder heutige weitere Arbeit.


## D23 / L1 — erneuerte Fortsetzung, Receipt-Ziel und lokaler Authkern

Ownerfortsetzung 2026-10-08 im neuen Bucket erneuert die lokale stehende
MIDAS-/Release-/Scopeautorität. Kein W1-50/15-Transfer, keine Paid Credits,
geschützte Reserve25/10 einmal. Aktuelle Ownerangabe: während dieses Laufs
nur dieser Auftrag; serielle Agentarbeit ohne Subagents. Keine technische
accountweite Reservation oder bewiesene Attribution aus dieser Aussage.

L1 DONE_LOCAL nach frischem PRIMARY_ALLOWED und persistiertem Originalstart:
2026-10-08T16:01:17.5295714+02:00, VALID,94/70 Rest,
Reset-IDs1791485786/1792036156. Originalbundle
`.kasrkin/work/supa-bw-l1-resume1-candidate-20261008/bundle.json`;
Auftrag/Boundary/Tests/Ledger/Completion im zugehörigen resume1-Workbereich.
HEURISTIC8–14/2–4 MEDIUM enthält gewöhnliche Korrekturen, Tests, native
Delta-/Consumerreviews, Receipt-Dokumentation und sichere Originalclosure.

Vier lokale Code-/Testdateien: gemeinsamer edge-auth-Kern, echter
Activityprincipaladapter und beide gemeinsamen Tests. Fester MIDAS-Owner,
explizit nicht-anonymer GetUser-User, zielgebundener Schedulerowner,
strikte moderne Map-/default-/named-entry-Auswahl. Vorhandene leere/defekte
Maps fallen nicht auf Legacy/Singular/first-entry zurück. Typgültiger
Legacy-Envfallback nur bei fehlender moderner Map für interne Clientauswahl;
Legacy/Publickey im Scheduler-Caller bleibt401. Userclient bleibt Publickey und
Session-JWT/RLS, kein Adminfallback nach Bearerfehler.

EV-L1-01–06:30 Deno-Tests bestanden/0 fehlgeschlagen, cached-only/no-lock,
ohne Netzfreigabe; vier produktive Quellen typechecked, vier Authdateien
formatgeprüft und scoped whitespace-PASS. Neue Tests verbinden den echten
Principal mit Protein-/Trendhandlern:38 einzelne Negativfixtures ohne
Daten/RPC/Write/Remoteeffekt und vier positive User-/Schedulerketten mit
ownergebundenem Daten-/RPCpfad. Auth-Transportfixture beobachtet tatsächlich
Public-apikey und User-JWT. Alte13 Handlerfachtests bleiben grün; keine
Formel-/Cooldown-/Report-/SQL-/RLS-/Schedulersemantik geändert.

Gewöhnliche Fixturekorrekturen im selben Block: erlaubte Inputkeys und
bestehende unterschiedliche Antwortschemas. SDK1.4.1-Korrektur: null-JWKS
fällt per nullish override auf zusätzliche Envreads zurück. Ausschließlich
named-secret-Kontext erhält explizit leere Keymenge; Userauth bleibt GetUser,
keine Signing-/Gatewayflag-/JWKS-Produktmigration daraus.

F16 ist LOCAL_FIXED_L1 mit synthetischen Owner-/Anonymousnegativen;
Produktacceptance/echte Storebindung und Real-JWT-Smokes bleiben G3.
F04/F05/F07 und übrige Caller/Handler sind L2/L3 noch offen. W2/W3 nicht DONE,
kein Deploy/Key/Secret/SQL/Dispatch/Device/Commit/Push,0 CodeRabbitläufe.

Ausdrückliches Receipt-Lernziel: Originale Bundle/Start/Permit/Completion/
End/Receipt mit Fingerprints, Profil und exakten Resets erhalten. Tatsächliche
benannte Testchecks und operational ausgeführte Toolaufrufe werden vor
Complete geloggt; Caps sind keine Counts. Vollständiger File-/transitiver
Toolingzugriffszensus und Messoverhead sind nicht nachgewiesen. Aktuelle
Owner-Serialität als deklarierte Betriebskontrolle belegen, technische
Attribution/Coverage weiterhin UNKNOWN. Keine Eligible History aus bloßer
Closure oder nachträgliche Aufwertung früherer UNKNOWN-Receipts.

Context Receipt: Governance/Modul-/Produktpreimages exakt gegen NB-1-Receipt
und dessen originale Closurepublication geprüft; Drift nur in drei erwarteten
Roadmap-Postimages. Root AGENTS/README und Supabase-Skill vollständig gelesen,
anfangs abgeschnittene benötigte Inhalte fokussiert nachgelesen. Aktuelle
offizielle Header-/Envverträge und Changelogindex gezielt geprüft; kein
relevanter Adapterwechsel für diesen Core. Future Thought ist separat bereits
abgelegt, unverändert und keine KASRKIN-Policyfreigabe.

### Aktueller Resume / L1-Closure

Native Delta-/Consumer-/Security-/Scope-/Recoveryreview grün; keine offene
betroffene lokale P1. L1 Originalcompletion nach sicherer Evidence-/Dokument-
Closure; Originalend separat publizieren, keine zweite Messung für Status.
Genau nächster vollständiger Block: L2 aus diesem tatsächlichen Ergebnis
dimensionieren und frisch Prepare/Begin zulassen. G3–G6 bleiben konkret gated.


### L1 Originalabschluss und gültige Fortsetzung

L1 CLOSED / COMPLETED_SUCCESS, originales Complete desselben Bundles:
2026-10-08T16:24:49.9104263+02:00, VALID. Start94/70 → Ende82/68 Rest;
kanonisches Delta12/2, konservative accountedCharge14/4 separat,
LOWER_BOUND_UNKNOWN_EXCESS / ACCOUNTING_ATTRIBUTION_UNKNOWN. Beide Reset-IDs
unverändert1791485786/1792036156. Kein neuer Refresh zur Veröffentlichung.

Completion actualBounds:39 tatsächlich abgeschlossene unterschiedliche
benannte Checks,33 protokollierte operative Toolinvokationen einschließlich
Fehlversuche; File-/transitiver Toolingzensus null, Attribution/Overhead UNKNOWN.
ParallelUsage EXCLUDED stützt sich auf aktuelle gebundene Ownerangabe und
serielle Ausführung, keine technische Kontingentreservation. Receipt nicht
eligible/kalibrierbar; historische UNKNOWN bleiben unverändert.

Erster Complete-Aufruf wurde vor Endmessung wegen WORK_FROZEN_EVIDENCE_DRIFT
abgewiesen: Child war gleichzeitig eingefrorener G2-Beleg und Dokumentationsziel.
Exakter eigener Child-Preimage für Originalclosure wiederhergestellt; geprüfter
neuer Childstand danach ausschließlich als ursprüngliche Abschlussveröffentlichung
abgelegt. Originalrequest/-bundle/-start unverändert, kein zweiter Begin/Reset.
Künftige Gatebelege vor Beginn unveränderlich im Workbereich binden.

Aktueller Resume: L1 DONE_LOCAL, L2/L3/S5/S6 offen; G2 lokal erneuert unter D23,
Produkt-W2/W3 nicht DONE. Genau nächster Block L2 komplett dimensionieren und
frisch Prepare/Begin; erst PRIMARY_ALLOWED/persistiertes Originalpermit arbeiten.
G3–G6 konkrete Produktwirkungen weiter gated; keine neue Produktfreigabe aus Closure.


## D23 / L2 — lokale Handlergrenze mit B14-Verifikationsfinding

Original Work/3 L2 PRIMARY_ALLOWED, frischer Start75/67 Rest,
Reset-IDs1791485786/1792036156; HEURISTIC10–20/3–5 MEDIUM, Reserve25/10
einmal. Originalbundle `.kasrkin/work/supa-bw-l2-resume1-candidate-20261008/bundle.json`.
Aktuelle Owner-Serialität bleibt deklariert, Attribution/Messoverhead UNKNOWN.
Keine alten W1-Obergrenzen übertragen, keine Paid Credits.

Vier AIhandler prüfen zwingend GetUser, festen Owner und is_anonymous=false
vor OpenAIzugriff. Vision hat keinen optionalen Authfallback mehr. Monthly
nutzt denselben verifizierten Userclient für RLS-Activity-RPC und den exakt
ausgewählten internen monthly_report_backend; vorhandene ungültige Maps
fallen nicht auf Legacy-/Schedulerkeys zurück. Incident akzeptiert nur
incidents_push_scheduler in apikey, niemals Authorization/User/Legacycaller.
INCIDENTS_USER_ID muss MIDAS_OWNER_USER_ID entsprechen; optionaler Bodyowner
darf diesen nicht ersetzen. Auth-/Inputguards laufen vor Daten/VAPID/Push.
Lokaler Incidentworkflow sendet den named Key aus INCIDENTS_PUSH_SECRET_KEY.
Tatsächliche Env-/GitHubstorebindung, Callerrollout und Deploy bleiben G3/G4.
Manualdiagnose/now/dry_run, Wienzeit, Schwellen, Medical-/Reportalgorithmen
und Lifecycle unverändert. Requestlokale Clientadapter vermeiden globale
Clientänderung zwischen Requests; produktives Serve bleibt import.meta.main.

EV-L2-01–06: neue18 verbundene Runtime-Testgruppen PASS mit75 User-/15
Incident-Negativfixtures, zero domain effects; positive AI-/RLS-/Report-/
Incidenttransporte vollständig lokal abgefangen, kein Netzrecht. Gesamt
92 Deno-Gruppen PASS/1 FAIL. L1regression, Request/Lifecycle/Activity/Incident-
Fachtests grün. Sechs Entry-Typechecks, neun Formatchecks, scoped whitespace,
echte Bashdrysyntax und nativer Security-/Consumer-/Domainreview PASS.
ECE_KEYLOG im einzelnen Testprozess auf0 gesetzt, kein Debug-Keylogging.

B14 OPEN: alter Activity-Handler-Quelltexttest verlangt direktes
SUPABASE_ANON_KEY und createUserActivityPrincipal(token,userId). Neuer
wirklicher Guard→RLS-RPC→Reportwrite-Test besteht. Die alte Assertion ist
keine neue medizinische Regression, aber kein Gesamt-PASS. Ihr Testpfad
war nicht Teil der eingefrorenen Schreibgrenze; nicht still erweitert.
L2 ist LOCAL_IMPLEMENTED_WITH_FINDING, Originalabschluss FINDING_ONLY;
kein L3start vor eigenständig zugelassener begrenzter B14-Testkorrektur
und tatsächlich grüner, dadurch invalidierter Verifikation.

Gewöhnliche lokale Fehler im selben Permit korrigiert: SDK-Typbrücke,
abgewiesenes Patchformat, scoped ECE_ENV-Testrecht und LF im extrahierten
Bashfixture. Fehlversuche im Ledger erhalten; keine Aktivitäten als PASS.
Keine Key-/Secret-/SQL-/Deploy-/Dispatch-/Geräte-/Signing-/Gitwirkung,
0 CodeRabbitläufe. G3–G6 NOT_GRANTED, JWT HS256 CURRENT/ES256 STANDBY.

Receipts bleiben Lernmaterial: Originale Bundle/Start/Permit/Completion/
End/Receipt, reale Check-/Toolledger und Sourcefingerprints erhalten.
105 abgeschlossene benannte Checks enthalten den echten FAIL, keine Caps.
Transitive Datei-/Toolingabdeckung und Messoverhead bleiben UNKNOWN/null;
keine Eligible History oder nachträglich aufgewertete UNKNOWN-Belege.


## D23 / B14 — begrenzte Testkorrektur und L2 VERIFIED_LOCAL

Original L2 bleibt unverändert CLOSED/FINDING_ONLY: Endmessung
2026-10-08T16:54:21.7347656+02:00,64/65 Rest, Start-Enddelta11/2,
konservative accountedCharge20/5, gleiche Reset-IDs1791485786/1792036156.
Receipt nicht kalibrierbar: fehlende vollständige Bounds/Attribution/
Coverage/Overhead und EXECUTION_NOT_SUCCESS; kein historisches Upgrade.

Eigenständiger vollständiger B14-Reparaturblock mit exakt ergänztem Testpfad:
HEURISTIC2–5/1–2 MEDIUM plus Reserve25/10 einmal, actual Owner-/MIDAS-/
Releasebindung, frischer PRIMARY_ALLOWED-Start59/65 und Originalpermit.
Bundle `.kasrkin/work/supa-bw-l2-b14-repair-candidate-20261008/bundle.json`.
Prepare-Schemareparaturen ohne Messung/Permit; ein kanonischer Begin,
kein validate-Doppelrefresh/Legacyretry. Fehlernachweise erhalten.

Eine alte Quelltext-Assertion durch tatsächlichen Monthly-Handlertransport
ersetzt: GetUser mit Public-apikey/User-JWT, fester nicht-anonymer Owner,
genau ein User-RLS-Activitysnapshot ohne Adminowner-RPC, danach genau ein
ownergebundener Reportwrite. Übrige Fachseams/Nonmigration-Invarianten
bewahrt. Vollständige betroffene Deno-Suite93 PASS/0 FAIL, cached-only/no-lock,
alle externen Transporte abgefangen/kein Netzrecht. Testformat/scoped
Whitespace, nativer Security-/Consumerreview und Schutzfingerprints PASS.
Eine gewöhnliche Test-Readreferenz im selben Reparaturpermit korrigiert;
kein Produktcode/Domain-/SQL-/Store-/Deploy-/Dispatch-/Device-/Signingdiff.

B14 LOCAL_FIXED. L1/L2 DONE_LOCAL/VERIFIED_LOCAL; L3/S5/S6 NOT_STARTED.
W2/W3 produktiv nicht DONE, G3–G6 NOT_GRANTED,0 CodeRabbitläufe.
Genau nächster zulässiger Block ist vollständiges L3 nach frischer Zulassung
mit12–22/3–6 HEURISTIC/MEDIUM und Reserve25/10 einmal. Kein bereits
zugelassenes L3 aus diesem Reparaturabschluss ableiten.

Originalreceipts dienen dem ausdrücklich erneuerten KASRKIN-Lernziel.
Aktuelle Owner-Serialität ist deklariert, technische Attribution/Overhead/
transitiver Dateizensus UNKNOWN/null. Counts sind reale abgeschlossene
Checks/operational aufgerufene Tools, keine Forecast-Caps oder PASS-Stages.
Die erfolgreiche lokale Korrektur wird getrennt vom ursprünglichen FAIL
bewahrt. Context Receipt bindet die aktuellen Source-/Test-/Docpostimages.


## D23 / L3 — aktueller lokaler Stand und Resume

L1 und L2 VERIFIED_LOCAL; B14 LOCAL_FIXED mit eigenem Originalabschluss.
B14 kanonisch Start59/65 → Ende56/64 Rest, 2026-10-08T17:04:14.797+02:00;
Delta3/1, accountedCharge5/2 getrennt, Reset-IDs1791485786/1792036156.
Historischer L2-FINDING_ONLY-Receipt bleibt unverändert.

L3 DONE_LOCAL / VERIFIED_LOCAL: gemeinsamer strikter Public-Keyleser,
apikey ausschließlich roh public; Authorization nur aktuelle nicht-anonyme
Session. Hub/Voice/REST/Report teilen dieselbe Headerquelle. Konfigurations-
wechsel, Restore und Web-Nativewriter sperren Teilzustände; alte Clients,
Listener, Ownerabfragen und verspätete Session-/Headerantworten gelten nicht
für die neue Generation. Kein Header-/User-ID-Timeoutfallback aus Cache.
Vollständiger lokaler Importgraph und SW-Assetpaket v33 einschließlich Bridge.
Keine APK-/Geräte-, medizinische oder Datenmodelländerung.

EV-L3-01–05: tatsächliche ESM-Sources in Node-VM,17 Gruppen PASS/0 FAIL;
29 JS-Syntaxchecks, geschützte Sourcefingerprints und Import-/SW-Graph PASS.
Genuine lokale Configsave→IndexedDB→Reload/IDLE→Carousel/Doctor/PIN→
Reportformular→Facade/Header/Transport→sichtbarer synthetischer Fehler PASS.
Privilegierte/user Restoretypen blockiert; Legacy-ANON normalisiert;
tatsächliche Hub→Voice-Init-Abhängigkeit beobachtet, native Teilwritefence
und ungültiger Bootstrap geprüft. Alle externen Transporte lokal abgefangen.
Browserpageerrors0; Screenshots visuell geprüft, Fixture-Intakefehlermeldung
und fehlendes abgefangenes Three-CDN sind kein produktiver Akzeptanzbeleg.
Native Delta-/Consumer-/Security-/Domainreviews PASS; CodeRabbit weiterhin0.

Original L3-Bundle `.kasrkin/work/supa-bw-l3-resume1-v2-candidate-20261008/bundle.json`;
PRIMARY_ALLOWED-Start50/63 Rest, HEURISTIC12–22/3–6 MEDIUM plus Reserve25/10
einmal. Originale Closure und Messwerte im selben Workbereich; kanonischer
Endstand wird nach Complete unverändert veröffentlicht. Preparationfehler
und fehlender Bridge-Coreasset im selben Block korrigiert und belegt.
Keine zweite Begin-/validate-Messung oder Legacyretry.

Receipt-Lernziel ausdrücklich beibehalten: originale Bundle/Start/Permit/
Completion/End/Receipt, echte Check-/Toolledger und Sourcepostimages erhalten.
190 benannte Checks umfassen17 Runtimegruppen,29 Syntaxprüfungen sowie
einzeln gebundene Fingerprint-/Import-/Browser-/Reviewassertionen; keine190
Runtime-Tests. Forecast-Bounds150 sind keine Counts und wurden überschritten.
Filezensus/Attribution/Messoverhead UNKNOWN/null; Owner-deklarierte aktuelle
Serialität ist keine technische Accountreservation. Keine Eligible History
oder aufgewerteten historischen UNKNOWN. Tatsächliche Modell-/Reasoning-
UIeinstellung bleibt NOT_OBSERVABLE.

Context Receipt: `.kasrkin/work/supa-bw-l3-resume1-20261008/context-receipt.json`
bindet aktuellen Scope/postimages und unveränderte Schutzquellen. Ältere
Receipts decken geänderte L1–L3-Sources nicht mehr ab; unveränderte Governance/
Module bleiben exakt fingerprintgebunden wiederverwendbar. Trunkierte
kombinierte Reads wurden für notwendige Fragen fokussiert ergänzt.

Genau nächster zulässiger vollständiger Block: L4/S5, frisches Prepare/Begin,
HEURISTIC7–14/2–4 MEDIUM plus Reserve25/10 einmal. Integrierte Full-Deno-/
Browseracceptance mit positivem Reportreadback, echter Capturegeste, Hub/
Voice-Pfaden und aktiver cold/warm/update-PWA/SW-Matrix, nativer Fullreview,
ein CodeRabbitinitiallauf/maximal eine begründete Verifikation, gewöhnliche
Korrekturen, G3/G4-Entscheidungspaket, Evidence und sichere Closure. Diese
Matrix bleibt OPEN; keine alleinige Komponentenprüfung als S5-PASS.
S6 danach eigener vollständiger lokaler Abschluss, kein Überspringen von S5.
W2/W3 produktiv nicht DONE; G3–G6 NOT_GRANTED, G7 NON_SCOPE; HS256 CURRENT/
ES256 STANDBY, Import ist keine Rotation. Kein Secret/SQL/Deploy/Dispatch/
Device/Signing/Gitwrite, keine Paid Credits und keine automatische Warteschleife.


### L3 Originalclosure — kanonische Messung

Original Work/3 CLOSED / COMPLETED_SUCCESS, VALID-Endmessung
2026-10-08T17:42:05.7191651+02:00. Start50/63 → Ende34/61 Rest;
Delta16/2, konservative accountedCharge22/6 separat, Reset-IDs unverändert
1791485786/1792036156. Completion:190 benannte Checks,48 protokollierte
operative Toolinvokationen inklusive Fehlversuchen, Filezensus null.
Originalreceipt eligible=false/eligibleForCalibration=false:
ACTUAL_WORK_BOUND_INVALID (vollständige Counts/Dateiabdeckung nicht belegt,
Checkzahl über Forecast), ATTRIBUTION_UNCLEAR, COVERAGE_OVERHEAD_UNKNOWN,
COVERAGE_UNPROVEN. Reale Beobachtung, keine kalibrierbare Kostenbehauptung.
Messaufruf/Polls und diese minimale Abschlussveröffentlichung nicht als
operative Workcounts ausgegeben; Overhead bleibt UNKNOWN.
Genau nächster Block S5 ist noch nicht zugelassen. Historische 7–14/2–4
S4R-Planung wird für die tatsächliche Restmatrix frisch überprüft; Reserve
nicht zur Prognose addieren oder zweimal verrechnen. Kein Endphase-Retry.


### Historischer Stop vor D24 — S5 resume1

S5 NOT_STARTED / PRIMARY_REJECTED_FOR_RESERVE, originales Begin-Ergebnis
2026-10-08T17:47:17.5746676+02:00: VALID,30/60 Rest, CAUTION;
CAPACITY_INSUFFICIENT:fiveHour. Forecast7–14/2–4 HEURISTIC/MEDIUM plus
Reserve25/10 einmal: Startbedarf39/14. permit=null, kein start.json,
keine S5-Arbeit, kein CodeRabbitlauf, keine Completion/End-/Costreceipt erfunden.
Originale Vorbereitung/Bundle/Messungsentscheidung erhalten unter
`.kasrkin/work/supa-bw-s5-resume1-20261008/admission-result.json` und
`.kasrkin/work/supa-bw-s5-resume1-candidate-20261008/bundle.json`.
L3 bleibt original CLOSED/COMPLETED_SUCCESS. Zwischen L3-Ende34/61 und
S5-Zulassungsbeobachtung30/60 liegt unzugeordnetes Delta4/1; das ist kein
S5-Arbeitskostenbeleg. Mess-/Vorbereitungsoverhead weiter UNKNOWN.
Keine Legacy-Endphase-Retrykette, Forecastabsenkung, S5-Teilung, S6 vor S5,
neuer Produktgate oder automatische Warteschleife.
Nächster zulässiger Schritt bei sicher passender Kapazität: minimaler
fingerprintgebundener Refresh und vollständiges unverändertes S5 mit neuen
aktuell gebundenen Bundle-IDs frisch Prepare/Begin; abgelehntes altes Bundle
nicht reaktivieren. Erst PRIMARY_ALLOWED/persistiertes Originalpermit arbeiten.
Diese minimale Originalentscheidungs-/Resumeveröffentlichung ist Teil des
lokalen Handoffs; sie erklärt keine S5-Stages oder neue Durchführung als PASS.


## D24 / S5 resume2 — aktuelle Zulassung und Reviewstand

Der erneuerte Ownerauftrag bindet ausschließlich MIDAS und den ausgewählten
Work/3-Release. Aktuelle Ownerangabe: nur dieser Auftrag; technisch belegte
Attribution/Messoverhead und vollständiger Tool-/Dateizensus UNKNOWN/null.
Alte W1-Ceilings50/15 nicht übertragen, keine Paid Credits/Accountreservation.
PRIMARY_ALLOWED/CONTINUE, kanonischer Start2026-10-08T21:01:32.7525046+02:00,
92/58 Rest; Reset-IDs1791503807/1792036156. Originalpermit persistiert im
Bundle `.kasrkin/work/supa-bw-s5-resume2-candidate-20261008/bundle.json`.
HEURISTIC12–24/3–7 MEDIUM für den ganzen tatsächlichen Restumfang inklusive
gewöhnlicher Korrekturen, Fullreview, Evidence und Closure; Reserve25/10 einmal.
Altes abgelehntes S5-Bundle unverändert, nicht reaktiviert.

Aktuelle lokale Regression:113 eindeutige Deno-Prüfgruppen PASS,17 Node-
Vertragsgruppen PASS, acht Edge-Entry-Typechecks PASS,154 benannte Syntax/
Fingerprint/Import-/SW-/Gitassertionen PASS. Die erste Gesamtinvokation hatte
94 PASS und drei Module mit fehlendem exaktem Fixture-Leserecht; nur diese
drei invalidierten Module mit eng erweitertem Leserecht wiederholt:19 PASS.
Kein einzelner ursprünglicher Gesamtaufruf nachträglich als grün ausgegeben.
Aktive echte Chromium-Matrix:19 benannte Browserchecks PASS; positive Doctor/
PIN/Formular/Transport/read-back/Render, Capture-Klick/Listener/Domain/IndexedDB/
REST/Feedback, Hubtext und Voice-Aufnahme/Transcribe/TTS, Refresh/fehlende
Session/Generation sowie cold/warm/offline und echtes altes Workerpaket→
Updatebanner-Klick→controllerchange→Reload/current v33. Alle externen Transporte
lokal fulfilled; User/SDK/Media/Responsefixtures synthetisch. Kein Live-,
klinischer, Geräte- oder Providerkostenbeweis. Browser-Pageerrors0, finale
Consoleerrors0; frühe Fixturefehler und ihre Originalausgaben bleiben erhalten.

F-S5-SW1 LOCAL_FIXED: gecachte Offlineantwort erzeugte zuvor eine unbehandelte
Rejection des Hintergrundfetches. service-worker.js behandelt den Fehler bei
vorhandenem Cache, erhält den uncached Fehler und bindet Hintergrundcachearbeit
an event.waitUntil. Aktive SW-Matrix nach Korrektur PASS, Cacheversionv33.
Cold-Testhülle wartet vor Configgesten auf den tatsächlichen ersten Controller-
Reload; Testhüllenparse, Audiofixture und REST-Responseform im selben Block
repariert, kein dadurch behaupteter Produktfehler oder neuer Begin.

Canonical CodeRabbit0.7.6 authentifiziert: Initiallauf EXIT0/review_completed,
5 issues (2 major,3 minor), kompletter tracked/untracked Modernisierungsdiff.
Minor: VM-Teststartflag/klare Voraussetzung und aktuelle Status-/Resume-
Inkonsistenzen korrigiert. Historische Starts, Ablehnungen und L2 FINDING_ONLY
bleiben erhalten. Major Incident: Vorschlag Legacy-Service-Bearer abgelehnt;
named incidents_push_scheduler apikey ist der eingefrorene Zielvertrag.
Workflow unveröffentlicht und zwingend zusammen mit Store/Backend hinter G3.
Major HTTP: generelle Wiederzulassung alter Token-/Headergeneration abgelehnt;
fail-closed nach Logout/Refresh/Configwechsel ist expliziter Cache-/Racvertrag,
17 Vertragsgruppen und aktive Browsergeneration prüfen ihn. Kein P1-Defekt
aus einem Vorschlag zur Lockerung des freigegebenen Vertrags abgeleitet.
CLI-Updatehinweis ist advisory; keine Installation/Upgrade ausgeführt.
Genau ein begründeter Verifikationslauf nach den drei Minor-Korrekturen ist
zulässig; kein dritter Lauf und keine Paid-Credits-Option. S5 bleibt bis zur
Review-/Evidence-/Originalclosure IN_PROGRESS. G3–G6 NOT_GRANTED/G7 NON_SCOPE.


## D24 / S5 lokaler Abschluss — EV-S5-01–06 und aktueller Resume

S5 VERIFIED_LOCAL, gewöhnliche Korrekturen/Verifikation/native Fullreview/
Evidence und sichere lokale Closure abgeschlossen; Originalcomplete vorbereitet,
kanonischer Endstand wird ausschließlich aus demselben Originalbundle publiziert.
L1–L3 VERIFIED_LOCAL/undeployt; S6 ist der nächste eigene vollständige lokale
Block. W2/W3 produktiv nicht DONE. G3–G6 NOT_GRANTED/G7 NON_SCOPE;
HS256 CURRENT/ES256 STANDBY. Keine produktive Wirkung oder Gitveröffentlichung.

EV-S5-01 Backend:113 eindeutige Runtime-Prüfgruppen aus17 Modulen PASS;
früher fehlendes Fixture-Leserecht eng repariert,94 PASS plus19 betroffene
Gruppen, keine nachträgliche Umdeutung des ersten fehlgeschlagenen Aufrufs.
EV-S5-02 Frontend:17 Vertragsgruppen PASS; nach VM-Testheaderänderung nur13
betroffene Authgruppen erneut PASS, vier Privacygruppen unverändert gültig.
Fehlendes --experimental-vm-modules wird mit eindeutiger Voraussetzung abgelehnt.
EV-S5-03 Browser:final21/21 PASS, Page-/Consoleerrors0; reale Produktgesten
und Lifecycle einschließlich positiver Report-/Capturekette, Hub/Voice,
aktiver Session-/Refresh-/Generation, SW cold/warm/offline/update. SDK/User/
Media/Transporte ausschließlich lokale Fixtures, kein produktiver Acceptancebeweis.
EV-S5-04 statisch:154 benannte Syntax/Fingerprint/Import-/SW/Gitchecks PASS,
acht Edge-Typechecks; nur geänderte UI-/Testsyntax danach erneut geprüft.
EV-S5-05 Review:canonical CodeRabbit Initial5 issues (2 major/3 minor), genau
ein Verifikationslauf1 minor, beide EXIT0/review_completed. Drei Minorfixes
zunächst umgesetzt, zwei konträr zum Freeze stehende Majorvorschläge begründet
NOT_ACCEPTED_CONTRACT. Letzter Minor F20 nativ korrigiert: Configpair vor Write
gesichert, Key zuerst invalidieren/zuletzt schreiben; bei Fehler alter Pair
wiederherstellen, bei gescheitertem Rückweg kein gemischtes gültiges Konfigurationspaar.
Frühe Writerfence und aktuelle Clientinvalidierung, sanitisiertes UIerror.
Echte UI-Klicktests für einmaligen und dauerhaften Speicherfehler PASS.
Kein dritter externer Review; dieser letzte Fix ist nativ verifiziert, nicht
als extern erneut freigegeben behauptet. F19/F20 LOCAL_FIXED.
Native Fullreview:exakte Header-/Owner-/Scheduler-/RLS-/Modul-/Medizin-/
Consumer-/Fehler-/Rollbackgrenzen erhalten; geänderte Consumer explizit geprüft,
unveränderte sourcegebundene L1–L3-Reviews plus integrierte Regression genutzt.
EV-S5-06 konkretes G3/G4-Entscheidungspaket im Child:gestufte Publishinggrenze,
frischer read-only Preflight, Store-/Key-/Incidentzeitplanfreigaben, echter
Smokeumfang, exakte Reverse/Postchecks; keine Freigabe aus lokaler Closure.

Originale, Fehlversuche und Testhüllen unter
`.kasrkin/work/supa-bw-s5-resume2-20261008`; Bundle/Start/Permit/End/Receipt
unter `.kasrkin/work/supa-bw-s5-resume2-candidate-20261008`.
Context Receipt `.kasrkin/work/supa-bw-s5-resume2-20261008/context-receipt.json`
bindet aktuelle Postimages/Schutzquellen/EV-IDs, eigenen externen SHA und
Invalidation Trigger. Älteres L3-Receipt deckt die geänderten UI-/SW-/Test-/
Docbytes nicht ab; unveränderte Fingerprints bleiben gezielt wiederverwendbar.
Trunkierte notwendige Reads durch fokussierte Folgefragen geschlossen;
keine behauptete vollständige Rohlektüre unveränderter großer Sources.

KASRKIN-Lernziel:Originale bewusst erhalten. Benannte finale Checks separat
von Activities und Fehlversuchen; keine Forecast-Caps als Counts. Schlanke
Toolliste ist unvollständig, vollständige Tool-/Dateiabdeckung daher null.
Technische Attribution/Messoverhead UNKNOWN; owner-deklarierte Serialität
EXCLUDED ohne technische Reservation. Kein Eligible-Historybeleg erfunden,
historisches L2 FINDING_ONLY und UNKNOWN-Receipts unverändert.
Genau nächster zulässiger Schritt nach grüner Originalclosure:vollständiges
lokales S6 (Module-SoT/QA/Changelog/vier Handoffs/Receipt/nativer Finalreview/
Closure) frisch Prepare/Begin bei sicher passender Kapazität. Keine produktive
Fortsetzung ohne konkrete G3/G4-Freigabe; keine automatische Warteschleife.


### S5 resume2 Originalclosure — kanonisch CLOSED / COMPLETED_SUCCESS

Original Work/3 erfolgreich geschlossen, VALID-Endmessung
2026-10-08T21:46:33.6244089+02:00. Start92/58 → Ende64/54 Rest;
Delta28/4. AccountedCharge28/7 ist konservativ und separat, keine genaue
Arbeitskostenmessung. Reset-IDs1791503807/1792036156 unverändert.
FORECAST_OVERRUN:28 statt oberer5h-Prognose24, advisory; kein erfundener
Ownerceiling. Sichere Originalclosure erfüllt, keine Folgeexception abgeleitet.
Receipt eligible=false/eligibleForCalibration=false:ACTUAL_WORK_BOUND_INVALID,
ATTRIBUTION_UNCLEAR, COVERAGE_OVERHEAD_UNKNOWN, COVERAGE_UNPROVEN.
307 tatsächlich benannte finale Checks (nicht307 Runtime-Tests), vollständige
Files/Toolcalls null. Partialledger, Attribution/Messoverhead UNKNOWN bleiben
ehrlich; Originale und historische UNKNOWN nicht aufgewertet.
Genau nächster zulässiger Schritt:ganzer lokaler S6-SoT/QA/Changelog-/Handoff-
Abschluss frisch Prepare/Begin, tatsächlichen Restumfang neu schätzen. G3–G6
NOT_GRANTED/G7 NON_SCOPE, keine produktive Fortsetzung aus S5-Closure.


## D24 / S6 Doc-Synchronisierung vor F21 — historischer Zwischenstand

S1–S4R sowie L1–L3 und S5/S6 lokal abgeschlossen/verifiziert;
READY_FOR_G3_G4. Produktive W2/W3 ausdrücklich nicht DONE, kein Archivieren.
G3–G6 NOT_GRANTED/G7 NON_SCOPE; HS256 CURRENT/ES256 STANDBY, Import keine
Rotation. Kein Commit/Push, Deploy, Key-/Secret-/SQL-/Dispatch-/Gerätewrite.

S6 synchronisiert sieben betroffene Module Overviews, fünf eigene bestehende
QA-Suites und Security unter CHANGELOG Unreleased. Neuer lokale Targetvertrag
ist klar von historischen produktiven R13-/Legacy-Stores getrennt. QA enthält
statuslose CORE-012–014, BS-015–016, HCR-036–037, AVI-013 und PT-017;
CORE-002/BS-004/PT-010 präzisiert. Keine PASS-Ergebnisse in neue Definitionen
kopiert. EV-S5-01–06 bleiben Originalnachweise, keine unnötige Runtimewiederholung.
Changelogrelevanz: bemerkenswerter Security-/Recoveryvertrag, kein Releasecut.
Native finaler SoT-/Scope-/Consumer-/Security-/Gate-/Link-/Encodingreview,
geschützte Produkt-/Governancebytes, Gitgrenze und Docchecks vor Completion.
Gewöhnlicher Prepare-Profilfehler vor Messung korrigiert; originale Fehlfassung
und Ausgabe erhalten. Keine KASRKIN-Implementierung oder State-Reaktivierung.

S6 PRIMARY_ALLOWED/CONTINUE, Originalstart2026-10-08T21:51:47.3402126+02:00
59/53 Rest; HEURISTIC5–10/1–3 MEDIUM, kompletter17-Docscope plus Review/
Korrekturen/Evidence/Closure, Reserve25/10 einmal. Originalbundle
`.kasrkin/work/supa-bw-s6-resume2-candidate-20261008/bundle.json`;
Completion vorbereitet, tatsächlicher Endstand wird original publiziert.
Context Receipt `.kasrkin/work/supa-bw-s6-resume2-20261008/context-receipt.json`
bindet aktuelle SoT-/QA-/Produktpostimages, EV-IDs, Arbeitsprofil und Quellen-
grenzen; separater SHA. Writer:Capture unverändert; Hub orchestriert, Doctor
liest, Profile liefert Kontext, Push bleibt Sicherheitsnetz. User-RPC bleibt
RLS/User-JWT, Reportintern monthly_report_backend; aktive Produktpfade bleiben
bis realer G3/G4-Acceptance am früheren Deploymentstand. Runtime-/Serving-/
Owner-/Store-/Caller-/Signing-/Cache-/Source-Drift invalidiert den betroffenen
Nachweis und erfordert gezielten Exact-Source-Refresh vor Wirkung.

Receipts gesammelt, vollständige Files/Toolcalls und technische Attribution/
Messoverhead weiter UNKNOWN/null; keine Eligible History. Modell-/Reasoning-
UIeinstellung NOT_OBSERVABLE. Alte UNKNOWN und L2 FINDING_ONLY unverändert.
Genau nächster zulässiger Schritt nach Originalclosure:Ownerreview des
konkreten G3/G4-Wirkungs-/Store-/Zeitplan-/Smoke-/Rollbackpakets im Child;
vor konkreter fehlender Freigabe stoppen. W4/W5 erst aus echten produktiven
Eingangsergebnissen/Child-S4R konkretisieren. Kein künstlicher Quota-Verbrauch
oder automatisches weiteres Produktwindow aus erfolgreichem lokalem Abschluss.


### F21 / S6-Finding — echte Cachewritefehler, nächste eigenständige Reparatur

S6 DOC_SYNC_WITH_FINDING / Originalabschluss FINDING_ONLY vorbereitet;
S6-Finalgate ist nicht grün. Die138 Doc-/Schema-/Link-/Schutzchecks sind PASS,
aber keine allgemeine Produkt-Fullreview-Acceptance. Native tatsächliche SW-
Sourceprobe reproduziert F21/P1:neuer ungecachter Asset kommt mit HTTP200 an,
synthetischer Cachequota-Putfehler lässt dessen Antwort ablehnen. Der S5-Fix
awaitet Cachepersistenz vor Response; fehlgeschlagene Persistenz darf einen
erfolgreichen Netzabruf nicht verlieren. Probe EXIT2/FINDING, kein PASS oder
produktiver Versuch. Scopeabhängiger neuer Befund, kein externer Majorhinweis.

Dieser S6-Block besitzt nur17 Docwritepfade, Produktbytes sind geschützt und
unverändert. Kein Codefix über diese Grenze; gewöhnliche Dokument-/BOM-/
Linkfehler im selben Block behoben, fremde Löschung und HEAD bewahrt.
Historische S5-Originalclosure/21 Browserchecks bleiben ihre damaligen Belege;
kein nachträglicher allgemeiner Cachequotanachweis oder Upgrade von UNKNOWN.
Vollständiger lokaler Abschluss ist bis F21-Reparatur offen; G3/G4 weiter gated.
Owner Stephan; konkreter Folgeblock F21-R1 unter derselben erneuerten lokalen
Roadmapautorität frisch binden/zulassen:Worker-Netzantwort von Cachewritefehler
entkoppeln, actual-SW-Fixtures für Cache-/Netzfehler, aktive cold/warm/offline/
update-Matrix, nativer Consumer-/Securityreview, betroffene SoT/QA/Changelog/
vier Handoffs und sichere Originalclosure. Keine dritte CodeRabbitinvokation,
keine produktive Wirkung. Das ist ein tatsächlich neuer eigenständiger
Reparatur-/Abschlussblock nach sicherer ursprünglicher Findingclosure,
keine künstliche Teilung oder Forecastsenkung zur Zulassungsumgehung.


### S6 original CLOSED / FINDING_ONLY — tatsächliche Endbeobachtung

Original2026-10-08T22:04:37.0960958+02:00, VALID:Start59/53 → Ende49/52,
Delta10/1; accountedCharge10/3 separat, keine genaue Arbeitskostenmessung.
EXECUTION_FINDING/ACCOUNTING_ATTRIBUTION_UNKNOWN; Safe Closure grün,
kein S6-PASS oder nachträgliches Receiptupgrade.138 Docchecks PASS und
native F21-Probe FINDING getrennt. Receipt nicht eligible/kalibrierbar;
Attribution/Messoverhead/volle Files/Toolcalls UNKNOWN/null.
Nächster ganzer zulässiger lokaler Block:F21-R1-Workerreparatur samt
restlicher Finalverifikation/Docs/Closure frisch Prepare/Begin. G3–G6 bleiben
NOT_GRANTED; keine Wiederverwendung/Reaktivierung des geschlossenen Permits.


## D24 / F21-R1 — tatsächliche lokale Reparatur und Finalverifikation

- EV-F21-01: neue tatsächliche Worker-Source-VM-Regression reproduziert vor
  Korrektur4 PASS/4 FAIL einschließlich unbehandeltem Navigationscachefehler;
  nach Korrektur8 PASS/0 FAIL. Alte fehlgeschlagene Ausgabe bleibt erhalten.
  HTTP200 bleibt bei Cache-put/-open/-lookup-Fehlern nutzbar; Navigation bindet
  Hintergrundwrites an waitUntil und behandelt Ablehnung. Cached-offline,
  ungecachter Netzfehler, verzögerter Cachewrite sowie GET/Origin-Grenzen geprüft.
- EV-F21-02: vollständige betroffene aktive Browsermatrix erneut21 PASS/0 FAIL,
  keine uncaught page-/console-Fehler; reales Doctor/Report-render/read-back,
  Capturelistener/Transport, Hub-/Voicepfade, Auth-/Refresh-/Logout-/Race und
  aktiver Worker cold/warm/offline/update. Alle Fremdtransporte lokal erfüllt;
  SDK/User/Medien/Provider synthetisch, keine Live-/Geräte-/Datenwirkung.
  Report- und mobile Screenshots visuell gelesen. Originale S5-Ausgaben bewahrt.
- EV-F21-03: nativer Full-Delta-/Contract-/Security-/Domain-/Consumerreview:
  Workerfehler werden ausschließlich als optionale Cachefehler konsumiert;
  Netzfehler ohne Cache bleiben Fehler, Method/Origin/Assetguards unverändert.
  Cacheversion und Precache-/Importgraph bleiben v33; neuer Node-VM-Test ist
  kein produktiver Import. Keine Änderung an Auth, RLS, Medizin oder Ownership.
  Exakte unveränderte Backend113-/Frontend17-Gruppenbelege weiter gültig.
  CodeRabbit bleibt bei genau2 originalen S5-Läufen (Initial5 Hinweise,
  Verifikation1 Minor); Reparatur nativ geprüft, keine externe Neuabnahme.
- EV-F21-04: vier aktive Handoffs, betroffene Core-SoT/QA/Changelog, Fingerprints,
  Schutzgrenze, Links/UTF8/Schema und Resume synchron. Alle17 S6-Docpostimages
  sind im aktuellen Context Receipt enthalten. Produktive Grenzen bleiben offen.

F19/F20/F21 lokal geschlossen; F04/F05/F07/F16 benötigen weiterhin konkrete
produktive Acceptance, F05 zusätzlich unverändertes natives APK-/Restorefenster.
Lokale S6-Abschlussbereitschaft ist kein Parent-W6 oder Programm-DONE. Kein
Archivieren vor vollständiger produktiver Gesamt-Acceptance. Originale Bundle-,
Start-, Permit-, Completion-, End- und Costreceipts mit SHA erhalten; UNKNOWN
bleibt UNKNOWN, keine Eligible History oder Nullkosten erfinden.


### F21-R1 original CLOSED / COMPLETED_SUCCESS — gemessener Endcheckpoint

Original2026-10-08T22:19:15.8792357+02:00, VALID:Start44/51 →Ende39/50 Rest;
Delta5/1 Prozentpunkte. AccountedCharge6/2 separat, keine genaue Arbeitskosten-
messung; ACCOUNTING_ATTRIBUTION_UNKNOWN/LOWER_BOUND_UNKNOWN_EXCESS. ResetIDs
1791503807/1792036156 unverändert.182 benannte Prüfungen, nicht182 Runtimefälle;
Attribution/Messoverhead/volle Files/Toolcalls UNKNOWN/null. Receipt nicht
eligible/kalibrierbar (ACTUAL_WORK_BOUND_INVALID, ATTRIBUTION_UNCLEAR,
COVERAGE_OVERHEAD_UNKNOWN, COVERAGE_UNPROVEN); keine Eligible History erzeugt.
Die kleine Veröffentlichung dieses Originalergebnisses erfolgt nach Endmessung,
ohne neue Messung oder Nullkostenbehauptung. Original S6 bleibt FINDING_ONLY.

Lokaler Endzustand: S5 VERIFIED_LOCAL, F21 LOCAL_FIXED, lokale S6-Finalisierung
READY_FOR_G3_G4, W2/W3 weiterhin undeployt/nicht DONE. Genau nächster zulässiger
Schritt: Ownerprüfung des konkreten G3/G4-Pakets im Backend/Web-Child; keine
produktive Wirkung vor deren konkreter Freigabe. G3–G6 NOT_GRANTED/G7 NON_SCOPE.


### EV-F22-01/02 — Owner-Runtime-Finding und ursprüngliche Admission

Owner-Console/Screenshot aus diesem Chat: Legacy showLoginOverlay über HTTP198
auth-context-changed nach Boot-Medication-RPC; gleichzeitig angemeldete Identität.
Focused-complete lokale Sourcefrage HTTP158–208, Authlistener724–795, UI170–181;
kein Session-/Tokenwert gelesen/ausgegeben. Timing-/SDK-Ursache bleibt UNKNOWN,
keine Runtime-PASS-Angabe. Three.js/PWA-/Five-Serverwarnungen getrennt, keine
CSPlockerung oder SDKinstallation/Upgrade. Produktbytes exakt unverändert.

Originalrepair5–10/1–3 bleibt unverändert abgelehnt ohne Permit; keine Kosten-
messung des nicht gestarteten Repairs. Eigenständiger Docabschluss enthält
keinen Repairtest oder Repairfragment. Originale fehlgeschlagene Doc-Prepare-
Artefakte (Authorityscope fehlte neuer Belegpfad, danach immutabler Bundle bereits
vorhanden) erhalten; vor neuer ID/Prepare korrigiert, ohne Messung/Blindstart.


### F22 Finding-Handoff original CLOSED — Dokumentation, keine Reparatur

Original2026-10-08T22:37:27.3033258+02:00 VALID:Start31/49 →Ende28/48,
Delta3/1; accountedCharge3/1 separat, keine genaue Arbeitskostenmessung.
FORECAST_OVERRUN (3>2, advisory)/ACCOUNTING_ATTRIBUTION_UNKNOWN; ehrlicher
Dokumentationsabschluss COMPLETED_SUCCESS, F22 unverändert OPEN/P1 und der
eigentliche Reparaturlauf NOT_STARTED ohne Permit.108 Dokument-/Sourcechecks
PASS, keine neuen Runtimeprüfungen oder Produktbytes. Receipt nicht eligible/
kalibrierbar; Attribution/Messoverhead/Files/Toolcalls UNKNOWN/null. Keine Paid
Credits, Reserve erhalten, kein nachträgliches Forecast- oder Historyupgrade.
Die kleine Publikation erfolgt nach Endmessung ohne zusätzliche Messung oder
Nullkostenbehauptung. Nächster Schritt: ganzer F22-Reparaturblock mit neuen IDs
frisch zulassen, sobald seine vollständige Spanne plus Reserve hineinpasst.
