# C4 – Vorschlag für eigenständig abschließbare Prüfwellen

Stand: 2026-10-01. **Reviewbarer Entwurf, nicht aktivierter Vertrag und keine Ausführungsroadmap.** Owner: Stephan. Anlass: C4-S5 wurde als integrierte Welle abgelehnt; vorhandene gültige lokale Nachweise sollen erhalten bleiben und sinnvolle Restarbeit soll kontrolliert möglich werden.

## Ausgangslage und Autorität

- C4-S4.3 ist lokal technisch geprüft. Ihre historische Admission-Nachweislücke G-C4-01 bleibt dokumentiert; sie wird nicht rückwirkend geheilt.
- Die gebundene KASRKIN-Release `kasrkin-4f3f71b333dfe784` bleibt unverändert. Source gehört `codex-tools/apps/kasrkin`; installierte Payloads, Resolver, Telemetrie und Consumer-Bindings sind getrennte Rollen.
- Der aktuelle MIDAS-Vertrag sperrt eine abgelehnte `INTEGRATED_REVIEW` als Ganzes. Einzelne Tests daraus sind derzeit kein unabhängiger Fallback.
- Die installierte Policy erlaubt ohne eligible Kostenreceipt unter normalem Continue nur reversible, nicht große bounded Klassen. Ein neues Wochenfenster allein löst den erstmaligen integrierten Einstieg deshalb nicht.
- Stephan hat die Vorbereitung dieses Vorschlags beauftragt. Sein anschließender Override bezieht die Fortsetzung dieser Sitzung auf das 5h-Fenster und verlangt Messung nach jeder Arbeit sowie Stop bei **unter 17 %**. Weekly bleibt beobachtet, ist für diesen Override aber kein Stopgrund. Das ist keine Aktivierung dieses Entwurfs, kein erfundenes Policy-Grün und keine pauschale Freigabe anderer Owner-Gates.
- Reasoning ist `NOT_OBSERVABLE`. Kein Modell-/Reasoningwechsel wird behauptet.

## Empfohlene Vertragsänderung

Eine Roadmap darf die integrierte Verifikation vor ihrem Eintritt als gebundenen Prüfplan mit eigenständigen Abschlussblöcken planen. Die Gesamtabnahme bleibt unverändert. Die ausführbare Zulassung muss KASRKIN selbst besitzen; MIDAS darf sie nicht aus einem erläuternden Text nachbauen.

Ein Prüfblock muss vor seinem Gate festlegen:

1. konkrete Vertragsfrage, Quellen und Source-Fingerprints;
2. vollständige Suite beziehungsweise nachvollziehbare risikobezogene Testgruppe und deren Orakel;
3. erlaubte Tools und Daten-/Transportseams, verbotene Writes und Owner-Gates;
4. Success-, Failure- und sichere Resume-Postcondition;
5. gültige Vorbelege und deren präzise Invalidation Map;
6. Scope-/Runtime-/Harness-Fingerprints, Kostenvergleichbarkeit oder ausdrücklich begrenzte Erstzulassung;
7. Closure einschließlich Evidence, verbrauchter Episode beziehungsweise gültiger Fortsetzungsberechtigung.

Ein fehlgeschlagener Test beendet den Prüfblock mit reproduzierbarem Finding. Er öffnet keine unbegrenzte Diagnose. Fix, Diagnose oder neue Browser-/Remote-Flächen benötigen eine eigene gebundene Zulassung. Bereits laufende atomare Postchecks werden sicher geschlossen.

## Abgrenzung gegen künstliche Aufteilung

Zulässig wäre erst nach Aktivierung ein vorab geprüfter Plan mit fachlich eigenen Ergebnissen, z. B. Filter-/ACL-Verifikation, UI-Lifecycle-Verifikation und Gesamtdiffreview. Unzulässig bleiben:

- eine abgelehnte Welle im selben Gate nachträglich als beliebig viele einzelne Tests umzubenennen;
- nur die billigeren Erfolgsfälle auszuführen und die negativen Orakel auszulassen;
- SQL-Forward von erforderlichen Postchecks/Reverse-Readiness zu trennen;
- produktiven Write, Cleanup und Datenpostcheck voneinander zu lösen;
- den S5-PASS vor dem finalen integrierten Evidence-Abgleich zu behaupten;
- durch Chatwechsel, neuen Auftragsnamen oder einzelne Re-Gates eine Episode neu zu erfinden.

Eine nach Ablehnung gewünschte echte Neuplanung ist eine sichtbare Vertragsrevision mit Plan-Fingerprint, nativer Readiness-Prüfung und explizitem Aktivierungsentscheid. Der ursprüngliche Ablehnungsbeleg bleibt erhalten.

## Erstzulassung ohne geeignete Kostenhistorie

Die aktuelle Policy bindet eligible Receipts an Comparison Key, Descriptor, Runtime-/Producer-/Consumer-/Harness-/Oracle-Fingerprints, Topologie, identische Resetfenster, ausgeschlossene Parallelusage, Attribution und erreichte Postcondition. C4-S4.3-Verbrauch darf daher nicht als S5-Kostenreceipt umetikettiert werden.

Empfehlung: KASRKIN erhält einen ausdrücklich ownergebundenen Erstzulassungspfad für **einen konkret benannten nicht produktiven Prüfblock**. Er ist weder allgemeiner Quota-Override noch automatisch auf andere Wellen übertragbar. Die Zulassung bindet Zweck, Plan, Quellen, Zeit-/Resetidentität, Fensterregel, Stopgrenze, Tools und vollständige Closure. Fehlende Messungen bleiben fehlend; keine erfundenen Reservewerte.

Der Erstlauf zeichnet Start/Ende, Resetidentitäten, Ausführungsergebnis und Attribution wahrheitsgemäß auf. Eine Receipt wird erst eligible, wenn alle Vergleichsregeln tatsächlich erfüllt sind. Unbekannte Parallelusage bleibt UNKNOWN und darf nicht zu EXCLUDED erklärt werden. Diese Änderung ist in Source, Schema, Tests und versioniertem Release zu prüfen; sie lässt sich nicht durch ein zusätzliches Feld im heutigen Policy-Input aktivieren.

## Fensterregel und Owner-Override

Normales Verhalten bleibt an alle angebotenen und kalibrierten Fenster gebunden. Ein expliziter Owner-Override für nur das 5h-Fenster muss als separate Ausführungsautorität erkennbar sein:

- authentische Dual-Window-Telemetrie unverändert lesen; Weekly weder löschen noch als NOT_OFFERED ausgeben;
- Beginn, Scope, Gültigkeitsende und gewünschte Stopgrenze dokumentieren;
- nach jedem vollständig geschlossenen Block kanonisch messen;
- bei fehlender/ungültiger/veralteter Telemetrie oder erreichtem Stop sicher beenden;
- bei 5h-Reset nicht still dieselbe Budget-/Kostenhistorie fortschreiben;
- keine Paid-Credit-Ausgabe aus bloßer Verfügbarkeit ableiten;
- nicht den regulären Oracle-Output in ein vorgetäuschtes PRIMARY_ALLOWED umschreiben.

Der aktuelle Ownerauftrag nennt Stop **unter** 17 %, nicht bei 17 %. Er garantiert keinen ausreichenden Abschlussraum für einen beliebigen neuen großen Block. Reserve und produktive Postchecks bleiben eigene Anforderungen. Eine Vorschlagsaktivierung muss außerdem ausdrücklich definieren, wie eine nur durch das ausgenommene Wochenfenster ausgelöste Restricted-Episode behandelt wird; das darf der Consumer nicht improvisieren.

## C4-Anwendung als vorgeschlagener Plan

Diese Tabelle ist ein reviewbarer Plan, **keine aktuelle Ausführungsfreigabe**. Einzelne Zeilen behaupten keinen Gesamterfolg.

| Block | Eigenes vollständiges Ergebnis | Wiederverwendung / Invalidation |
| --- | --- | --- |
| V1 Vertrags-/Filterintegration | T-C4-01/03/05-Orakel verbinden: Default, ausgeschlossener/mischter Wiener Tag, Principal/ACL, Score und ungefilterte Consumer; Fingerprint- und Evidence-Abgleich | EV-C4-L01 unverändert übernehmen; nur durch Edge-/Adapteränderung invalidierte Checks neu |
| V2 UI-/Lifecycleintegration | T-C4-02/04: Save/Correction/Delete bis Protein-Transport, sichtbarer Fehler/Retry, Auth-/Remount-/Reloadgrenzen, Desktop und mobiles Viewport; Cache konsistent | EV-C4-L02/L03 wiederverwenden; gezielte neue Gesamtpfad-Lücken prüfen |
| V3 Gesamtdiffreview | nativer vollständiger Code-/Contract-/Security-/Scope-Review; Findings gesammelt und begrenzt | Keine unveränderten Tests erneut; neue Findings erhalten Invalidation/Resume |
| V4 Externes Review | ein initialer kanonischer CodeRabbit-Lauf, Bewertung und höchstens eine begründete Verifikation | S5 bleibt alleiniger Owner dieses externen Reviews; Doku-only bekommt keinen Lauf |
| V5 Integrierte Closure | T-C4-01–05 und Reviews auf denselben aktuellen Vertragsstand beziehen; offene Findings und produktive Gates konkret briefen | Erst hier lokaler integrierter S5-PASS, nie aus Teil-PASS ableiten |

Produktive SQL-/Edge-/Pages-/Testdaten-/Android-/Commit-/Push-Gates bleiben danach getrennt. S6 folgt dem belegten Postimage; dieser Entwurf führt S6 nicht vorzeitig aus.

## Notwendige Entscheidungsfälle für eine spätere Implementierung

Die spätere KASRKIN-Roadmap muss mindestens nachweisen:

- default Dual-Window/Caution/Consumed bleiben unverändert ohne explizite neue Autorisierung;
- fremder Scope, abgelaufene Autorisierung oder veränderte Fingerprints werden abgelehnt;
- erstmaliger Lauf ohne Receipt erhält kein normales empirisches Grün;
- ausgewähltes Fenster wird nur durch ausdrücklichen Ownerauftrag begrenzt, niemals durch verfälschte Telemetrie;
- Fehler/Invalidation erzeugen keinen automatischen Folgelauf oder offene Diagnose;
- produktive Owner-Gates bleiben wirksam;
- Reset-/Parallelusage-/Attributionsgrenzen erzeugen keine synthetischen Kostenbelege;
- unvollständige Teilwellen reichen nicht für die integrierte Acceptance;
- Source-Test, Release-Identität, Installation und jede Consumer-Aktivierung werden separat bewiesen.

## Konkreter Aktivierungsentscheid

Der Entwurf empfiehlt eigenständige Verifikationsblöcke plus einen eng gebundenen Erstzulassungspfad. Für eine dauerhafte Umsetzung benötigt er einen eigenen KASRKIN-Auftrag mit governing Roadmap, Environment Capability Preflight, Risiko-/Readinessreview und späterem versioniertem Release-/Consumer-Cutover. Eine Freigabe dieses Entwurfs allein installiert nichts.

Für **heutige C4-S5-Ausführung** bleibt neben Weekly ein anderer Punkt offen: `INTEGRATED_REVIEW` ohne eligible Kostenhistory. Der aktuelle 5h-only-Override nennt keine ausdrückliche Erstzulassung für diesen vollständigen Block. Diese Grenze darf nicht still als mitfreigegeben behandelt werden. Der Owner kann konkret entscheiden, ob eine einmalige, vollständig benannte lokale S5-Kostenmesswelle samt Review und Closure zusätzlich zugelassen wird; produktive Writes bleiben dabei ausgeschlossen. Ohne diesen Entscheid bleibt der vorliegende Vorschlag das reviewbare Ergebnis.

## Lokaler Review dieses Entwurfs

Bekannte Quellen fokussiert gelesen: MIDAS-Resume/S5/Workflow; `codex-tools/AGENTS.md`, Root-/KASRKIN-README und Integration; exakt installierte Policy Admission-/Receipt-Branches. Readstatus `FOCUSED_COMPLETE`; breite Suchtreffer nur als Navigation. Der Text enthält keine operative Policyformel und schreibt keine aktive Autorität um. Er nennt die zwei getrennten Zulassungslücken, erhält alle medizinischen und externen Gates und behauptet keinen installierten Capability-/Releasebeweis. Kein CodeRabbit für diesen Doku-only-Entwurf.
