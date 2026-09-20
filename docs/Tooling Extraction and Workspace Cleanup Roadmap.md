# Tooling Extraction and Workspace Cleanup Roadmap

Status: `MIGRATION_CLOSED / NEXT_WORK_OWNER_AUTHORIZATION_REQUIRED`

## 1. Ziel

Diese Roadmap steuert die kontrollierte Trennung der in MIDAS gewachsenen
KASRKIN-, A.R.G.U.S.- und projektübergreifenden Workflow-Artefakte. MIDAS soll
am Ende wieder ein Produktrepository sein. Eigenständige Lifecycle-Owner dürfen
eigene Project Roots erhalten; Consumer nutzen sie später nur über explizite,
versionierte Integrationspunkte.

W0 begann mit Control Plane und read-only Bestandsaufnahme. W3-W7 haben danach
KASRKIN extrahiert, beide Consumer umgestellt, den ARGUS-Pilot klassifiziert,
das Organisationsarchiv bewiesen und die exakt autorisierten Legacy-Kopien
retiret. Der separate Post-W7 Closure Review ist ebenfalls abgeschlossen und
bestätigt die operative und semantische Schließung der Migration. Future
Thoughts, ARGUS V1 und ein Commit bleiben eigenständige Owner-Entscheidungen.

## 2. Sources of Truth

- Diese Roadmap ist die aktive Status- und Entscheidungsquelle der Migration.
- [Evidence](Tooling%20Extraction%20and%20Workspace%20Cleanup%20Evidence.md)
  belegt ausgeführte Discovery-, Migrations- und Validierungsschritte.
- [Migration Inventory](tooling-extraction/migration-inventory.json) ist das
  maschinenlesbare Artefakt-, Consumer- und Abhängigkeitsregister.
- Der [MIDAS Roadmap Workflow Contract](templates/MIDAS%20Roadmap%20Workflow%20Contract.md)
  bleibt bis zu einem bewiesenen Cutover der aktive Ausführungsvertrag.
- Die aktive KASRKIN-Navigation liegt in der
  [`codex-tools`-Source](../../codex-tools/apps/kasrkin/README.md) und im
  [Integrationsvertrag](../../codex-tools/docs/architecture/KASRKIN%20Integration.md).
- Der [ARGUS-V1-Handoff](tooling-extraction/ARGUS%20V1.0%20Product%20Handoff.md)
  trennt den künftigen Produkt-Lifecycle vom organisatorischen Legacy-Archiv.
- Fingerprintgebundene DONE- und Pilotartefakte bleiben historische Evidence
  und werden nicht rückwirkend umgeschrieben.

## 3. Scope

Im Scope liegen:

- KASRKIN-Quellen, Runtime-Verträge, Tests, Schemas, Konfiguration und
  Consumerbindungen;
- der geschlossene A.R.G.U.S.-Pilot, seine Operatorwerkzeuge, externen
  Stage-/Evidence-Roots und die standalone Console;
- gemeinsame Roadmap-, Evidence-, Review- und Workstation-Verträge;
- alle aktiven Consumer und harten Pfadbindungen, die bei einem späteren
  Cutover umgeschrieben werden müssen;
- die spätere Bereinigung von MIDAS nach bewiesenem Cutover.

Nicht im Scope von W0 lagen Moves, Löschungen, neue Repositories, aktive
Reference-Rewrites, neue Toolfeatures, Benchmarkruns oder Produktänderungen.

## 4. Architekturprinzipien

1. Keine Datei ohne klaren Owner.
2. Kein Contract ohne nachgewiesenen Consumer.
3. Keine zweite aktive KASRKIN-Entscheidungssemantik.
4. Shared Workflow beschreibt, wann Governance konsultiert wird; KASRKIN
   besitzt, wie Governance entscheidet.
5. Source Repository, Installation, Projektintegration, Runtime und Evidence
   bleiben getrennte Rollen.
6. Cross-Repo-Nutzung erfolgt über stabile, versionierte Commands oder Adapter,
   nicht über zufällige relative Pfade.
7. Historische Evidence bleibt bytegleich; Navigation erfolgt über neue
   Provenance Maps oder Indizes.
8. Eine neue Plattform ist nur zulässig, wenn ein realer Consumer sie braucht.
9. Ein unter `C:\Users\steph\Projekte` gefundener Git-Root beweist keine
   Owner- oder Migrationszugehörigkeit. Drittsoftware bleibt beim ursprünglichen
   Autor und wird `EXTERNAL_DO_NOT_TOUCH` klassifiziert.

## 5. Wellen und Gates

| Welle | Zweck | Eingangsgate | Ausgang |
| --- | --- | --- | --- |
| W0 | Control Plane und read-only Discovery | Guard erlaubt Discovery | `OWNER_DECISION_REQUIRED` |
| W1 | Ownership, Target Map und Ownerentscheidungen | W0 vollständig; Owner entscheidet OD-01 bis OD-10 | freigegebene Target Map |
| W2 | Ownerbestätigte Shared Foundations | W1-Entscheidung über Shared Workflow | versionierte gemeinsame Basis oder bewusster Verbleib |
| W3 | KASRKIN Extraction, Installation und projektweiser Cutover | KASRKIN-Target, Installation und Rollback beschlossen | Consumergrün; alter Pfad noch rollbackfähig |
| W4 | A.R.G.U.S.-Pilot geschützt archivieren | Archivziel und Hashstrategie beschlossen | Pilot bytegleich auffindbar |
| W5 | Handoff für ein neues schlankes A.R.G.U.S. V1.0 | Pilotarchiv grün; eigener Ownerauftrag | separate Produkt-Roadmap, keine Nebenbei-Implementierung |
| W6 | AGENTS-, DEV_ENVIRONMENT- und Workflow-Ownership bereinigen | neue Toolintegrationen bewiesen | keine duplizierte Governance-Semantik |
| W7 | MIDAS-Reste entfernen und Abschlussprüfung | alle Consumer cutover- und rollbackgrün | Migration `DONE` und archiviert |

W1 darf erst nach expliziter Ownerentscheidung beginnen. Cross-Repository-
Änderungen werden in späteren Wellen projektweise mit eigenen sicheren
Postconditions ausgeführt, nicht als ein unteilbarer Move.

## 6. W0-Ergebnis

W0 hat folgende Zustände erreicht:

- `CONTROL_SOURCE_READY`
- `CURRENT_INVENTORY_COMPLETE`
- `CURRENT_INVENTORY_FINGERPRINTED`
- `PRODUCERS_AND_CONSUMERS_MAPPED`
- `REWRITE_TARGETS_IDENTIFIED`
- `HISTORICAL_EVIDENCE_PROTECTED`
- `TARGET_OPTIONS_READY`
- `OWNER_DECISION_REQUIRED`
- `NO_FILES_MOVED`
- `NO_ACTIVE_CONTRACT_REWRITTEN`

Die Vollständigkeit bezieht sich auf den definierten migrationsrelevanten
Scope, nicht auf jede Produktdatei unter `C:\Users\steph\Projekte`.

## 7. Findings Register

| ID | Finding | Auswirkung | Disposition | Status |
| --- | --- | --- | --- | --- |
| TEX-W0-001 | KASRKIN-Source und aktive Guard-Bindings liegen in MIDAS. | MIDAS ist derzeit Runtime- und Governance-Owner wider Zielbild. | W3 nach W1-Targetentscheidung | OPEN / OWNER-GATED |
| TEX-W0-002 | H.E.S.T.I.A. besitzt eine eigene Sensor-/Validator-Kopie und eigene Pfadverträge. | Ein KASRKIN-Cutover benötigt Versionierung, Installation und Consumer-Migration; bloßer Move würde H.E.S.T.I.A. brechen. | W3 projektweise | OPEN / OWNER-GATED |
| TEX-W0-003 | Guardsemantik verteilt sich über Workflow Contract, Activation, Config, AGENTS und DEV_ENVIRONMENT. | Unkoordinierte Zerlegung kann eine zweite aktive Policydefinition erzeugen. | Ownership in W1, Rewrite in W6 | OPEN / OWNER-GATED |
| TEX-W0-004 | A.R.G.U.S. verteilt sich über MIDAS, standalone HTML, Stage-/Evidence-Roots und Codex-Provenance. | Archivierung muss Source, Runtime und externe Evidence getrennt behandeln. | W4 | OPEN / OWNER-GATED |
| TEX-W0-005 | A.R.G.U.S.-Tools und Console enthalten harte MIDAS-/Benutzerpfade. | Ein späterer Move ohne Adapter oder Konfiguration ist nicht funktionsfähig. | Target- und Rewrite-Plan W1 | OPEN / OWNER-GATED |
| TEX-W0-006 | Die alten Architekturpapiere teilen gemeinsame Regeln, Guard und Benchmark teilweise demselben `codex-workflow` zu. | Das widerspricht der inzwischen bewiesenen Lifecycle-Trennung. | Nur als Designinput verwenden | CLOSED / SUPERSEDED |
| TEX-W0-007 | Ein eigenständiges `codex-workflow`-Repository ist durch aktuelle Consumer noch nicht zwingend bewiesen. | Vorschnelles Anlegen wäre Plattformaufbau ohne gesicherten Bedarf. | OD-03 | OPEN / OWNER-GATED |
| TEX-W0-008 | Historische ARGUS- und Guard-Artefakte sind fingerprintgebunden. | Inhaltliche Rewrites würden Provenance zerstören. | Bytegleich schützen; neue Navigationsartefakte verwenden | CLOSED / CONTROLLED |
| TEX-W0-009 | Ein neues A.R.G.U.S. ist Produktentwicklung, nicht mechanischer Cleanup. | Umsetzung in W5 dieser Roadmap würde Scope und Risiko vermischen. | W5 nur als Handoff; eigene Roadmap erforderlich | CLOSED / ROADMAP_REFINED |

Keine offenen W0-P0/P1-Findings erlauben eine Migration ohne Ownerentscheid;
die offenen Punkte sind absichtlich W1-gated.

## 8. Decision Log

| ID | Entscheidung | Status |
| --- | --- | --- |
| DL-001 | W0 inventarisiert migrationsrelevante Artefakte und Consumer, nicht jede Produktdatei. | ACCEPTED |
| DL-002 | Verzeichnisse erhalten einen dokumentierten Inventory Digest; externe oder dynamische Roots werden nicht rekursiv gehasht. | ACCEPTED |
| DL-003 | `.codex` bleibt `EXTERNAL_DO_NOT_TOUCH`, auch wenn Sessiondateien historische Provenance liefern. | ACCEPTED |
| DL-004 | KASRKIN und A.R.G.U.S. sind getrennte Lifecycle-Owner; konkrete Roots bleiben bis W1 Optionen. | ACCEPTED |
| DL-005 | Der geschlossene ARGUS-Pilot wird nicht zur Runtimearchitektur eines neuen V1.0. | ACCEPTED |
| DL-006 | Neues ARGUS V1.0 bleibt Codex-only und ohne Modell-API; seine Implementierung erhält einen eigenen Auftrag. | ACCEPTED |
| DL-007 | Bestehende historische Dateien werden bei späteren Pfadänderungen nicht editiert. | ACCEPTED |
| DL-008 | `G915 Chatter Guard` ist Drittsoftware des ursprünglichen Autors; sein lokaler Git-Root ist kein Stephan-/MIDAS-Repository und gehört nicht zur Migration. | OWNER_CLARIFIED |

## 9. Owner Decision Packet für W1

| ID | Entscheidung | Optionen | W0-Empfehlung |
| --- | --- | --- | --- |
| OD-01 | KASRKIN Project Root | eigenes Projekt unter `C:\Users\steph\Projekte`; anderer ownerbestätigter Root | eigenes Projekt; exakter Name/Casing im Owner-Gate |
| OD-02 | Root des neuen A.R.G.U.S. | eigenes Projekt unter `C:\Users\steph\Projekte`; spätere andere Ablage | eigenes Projekt, aber erst nach Pilotarchiv und eigener Roadmap |
| OD-03 | Shared Workflow | vorerst versionierte Quelle bei einem bestehenden Owner; eigenes `codex-workflow`; bewusst verteilte lokale Verträge | kein neues Repo, bis W1 Nutzen und Consumervertrag festschreibt |
| OD-04 | Installierter KASRKIN-Einstieg | versionierter lokaler Command/Shim; expliziter projektlokaler Adapter | stabiler Command mit nachweisbarer Versionsbindung |
| OD-05 | Projekt-Pinning und Updates | Manifest/Lock plus Validator; Installer-Receipt; anderer belegter Vertrag | nur Mechanismus wählen, der Drift und Rollback beweist |
| OD-06 | Runtime-/Evidence-Roots | tool-eigene Roots außerhalb Produktrepos; ownerbestätigte Alternative | je Tool genau ein kanonischer Runtime-/Evidence-Vertrag, Pfad in W1 festlegen |
| OD-07 | ARGUS-Pilotarchiv | eigenes unveränderliches Archiv beim späteren ARGUS-Owner; separates Provenance-Archiv | Ziel nach Hash- und Navigationstest wählen |
| OD-08 | Git-History | History-preserving Extraction; Provenance-copy mit Quellcommit; neue Repos plus Manifest | kleinsten überprüfbaren Weg pro Artefaktklasse wählen; keine pauschale Methode |
| OD-09 | Repository-Namen und Casing | heutige Namen beibehalten; ownerbestätigte Renames wie `midas`, `kasrkin`, `argus` | keine Renames im selben Schritt wie einen funktionalen Cutover erzwingen |
| OD-10 | Cutover-Reihenfolge | KASRKIN zuerst, dann Pilotarchiv, dann Workflow-Cleanup; andere begründete Reihenfolge | KASRKIN zuerst, weil aktive Governance Consumer besitzt; ARGUS danach |

## 10. Rollback- und Invalidation-Vertrag

- W0 selbst erzeugt nur neue Control-Artefakte; Rollback ist deren Entfernung,
  solange W1 nicht begonnen wurde.
- Eine Änderung an einem inventarisierten SHA-256, Directory Digest,
  Producer-/Consumer-Verweis oder Ownerentscheid invalidiert die betroffenen
  W1-Planungen.
- Ein späterer Cutover löscht keine Quelle, bevor installierter Einstieg,
  Consumer, Rollback und Referenzrewrite gemeinsam bewiesen sind.
- `DELETE_AFTER_PROOF` ist keine Löschfreigabe.
- Historische Evidence wird bei Drift nicht repariert; der Widerspruch stoppt
  die betroffene Welle.

## 11. Context Receipt

W0 las vollständig oder fokussiert vollständig die im Auftrag benannten
Sources of Truth, die beiden Desktop-Architekturpapiere, relevante KASRKIN- und
A.R.G.U.S.-Bindings sowie die entdeckten Cross-Project-Consumer. Dateihashes,
Directory Digests, Repository Roots und Referenzfunde sind in der Evidence und
im Inventory gebunden. Sensible Inhalte und `.codex` wurden nicht rekursiv
inventarisiert.

## 12. Statusmatrix

| Bereich | Status | Nächster Gate-Owner |
| --- | --- | --- |
| W0 Control Plane | COMPLETE | keiner |
| KASRKIN Target | OPTIONS_READY | Owner |
| A.R.G.U.S. Pilotarchiv | OPTIONS_READY | Owner |
| Neues A.R.G.U.S. V1.0 | NOT_STARTED | separater Ownerauftrag |
| Shared Workflow | DECISION_REQUIRED | Owner |
| Consumer-Rewrites | NOT_STARTED | W3/W6 |
| Datei-Moves | NONE | W1-Gate |

## 13. Resume Card

- Aktiver Zustand: `W0_COMPLETE / OWNER_DECISION_REQUIRED`.
- Bestehende Dateien: nicht verschoben, gelöscht oder umgeschrieben.
- Neue Artefakte: diese Roadmap, ihre Evidence und das Migration Inventory.
- Nächster exakt erlaubter Schritt: Owner entscheidet OD-01 bis OD-10 und
  autorisiert danach einen getrennten W1-Auftrag zur verbindlichen Target Map.
- Verboten bis dahin: W1 beginnen, Repositories anlegen, Pfade umschreiben,
  KASRKIN/ARGUS verschieben oder alte Kopien löschen.

`OWNER_DECISION_REQUIRED`

---

## 14. W1 Decision Gate — dokumentarischer Entwurf vom 13. September 2026

Dieser Abschnitt ergänzt den unveränderten W0-Stand in Abschnitten 1–13.
Der aktuelle Ownerauftrag autorisiert ausschließlich dieses Decision Packet;
die frühere Startsperre bleibt für verbindliche Targetfreigabe und Migration
bestehen. Die Statusmatrix und Resume Card in Abschnitt 20 sind der aktuelle
Fortsetzungsstand; Abschnitt 12/13 dokumentiert weiterhin den W0-Handoff.

Alle folgenden Empfehlungen tragen `RECOMMENDED`. Kein OD ist
`OWNER_APPROVED`. Jeder neue Owner-, Pfad-, Name-, Repository- oder
Vertragswert ist `PROPOSED`, auch wenn er technisch praktisch eindeutig ist.
Die Entwürfe erlauben keine Anlage, Kopie, Installation, Migration oder Löschung.
Das Inventar bleibt unverändert; W0-Feststellungen werden nicht neu bewertet.

### 14.1 Blockzulassung und sichere Grenze

- Klasse: `BOUNDED_DOCUMENTATION`; Größenprognose `large` wegen vollständiger
  Pflichtlektüre, zehn Entscheidungen, 50 Inventory-Zuordnungen, Abhängigkeiten,
  Migrations-/Rollbackplanung und Abschlussnachweisen; keine Produktumsetzung.
- Ein kohärenter Primärblock einschließlich sämtlicher Postconditions, kein
  Fallback und keine künstliche Teilung.
- Erlaubte Writes: nur additive Ergänzungen dieser Roadmap und ihrer Evidence.
- Checks: Bytebaseline, W0-Fingerprints, ID-/OD-Vollständigkeit, lokale Links,
  Marker, historische Präfixintegrität, Native Contract-/Scope-/Privacy-Review.
- Sichere Postcondition: drei vollständige DRAFTs, offenes Owner-Gate,
  synchronisierte Status-/Resume-Artefakte; keine Migration, unveränderte
  aktiven Verträge und historische Quellen; W2 nicht begonnen.
- Kanonischer Refresh: `2026-09-13T17:02:00.2549619+02:00`;
  `valid=true / status=OK`, 5h `83 %`, Woche `40 %`;
  Resetidentitäten `1789329106 / 1789806057`.
- Budgetband `CONTINUE`; Arbeitszulassung `PRIMARY_ALLOWED`.
  Kein vergleichbarer vollständiger W1-Cost-Receipt in dieser Roadmap:
  empirische Floors und Preferred Reserve `NOT_ESTABLISHED`, keine erfundenen
  Zahlen und keine Owner Boundary. Zulassung anhand statischer Schwellen,
  bekannter Quellen, enger Writegrenze, Reversibilität und sicherer Postcondition.
- Die frühere Ablehnung ist keine Baseline und kein Restricted-Work-Zustand.
  Diese Zulassung begründet einen neuen regulären Fortsetzungsstand.
  Delta zur früheren Session `NOT_USED`.
- Tatsächlich gewählte UI-/Runtime-Reasoning-Stufe `NOT_OBSERVABLE`;
  keine Änderung oder behauptete Verifikation.
- Nach vollständiger Postcondition folgt genau ein finaler kanonischer Refresh.
  Sein Ergebnis steht ausschließlich im Abschlussbericht; danach keine Writes.

### 14.2 Gruppe A — Zielownership und Namen

#### OD-01 — KASRKIN Project Root

- **W0-Ausgangslage:** `kasrkin-source-root` und TEX-W0-001 belegen einen
  eigenständigen Toolkern mit 37 Dateien innerhalb MIDAS; zwei reale
  Produktconsumer sind belegt.
- **Optionen mit Vor-/Nachteilen:** Eigenes direktes Projektverzeichnis erlaubt
  getrennte Releases und klare Verantwortung, braucht aber Installations- und
  Integrationsnachweise. Ein anderer dedizierter lokaler Root ist technisch
  gleichwertig, erhöht jedoch die Abweichung von der bestehenden Projektablage.
  Verbleib als dauerhafte MIDAS-Unterkomponente und Sammelroot sind wegen
  Lifecycle-Trennung und vorgegebener Leitplanken verworfen.
- **Abhängigkeiten:** OD-09 für exakte Schreibweise; OD-08 vor Source-Import;
  OD-04/05 vor Consumerbetrieb. Die Rootwahl selbst braucht keine ARGUS-Wahl.
- **Risiken:** Checkout-Pfad wird versehentlich Runtime-API; Dirty Source wird
  fälschlich nur durch HEAD identifiziert.
- **RECOMMENDED:** `PROPOSED KASRKIN` als Source-Owner mit
  `PROPOSED C:\Users\steph\Projekte\kasrkin` als eigenem Source Repository.
- **Spätere Waves:** W3 bereitet Source und Release vor; alte MIDAS-Quelle bleibt
  bis zu separatem Freigabe-/Rollbacknachweis erhalten.
- **Ownerfrage:** Soll KASRKIN den eigenen Source-Root
  `PROPOSED C:\Users\steph\Projekte\kasrkin` erhalten, oder welchen anderen
  dedizierten absoluten Root möchtest du festlegen?
- **Status:** `RECOMMENDED / PROPOSED / OWNER_DECISION_REQUIRED`.

#### OD-02 — Project Root des neuen A.R.G.U.S.

- **W0-Ausgangslage:** TEX-W0-009 und `argus-overview` trennen den geschlossenen
  Pilot vom noch nicht implementierten V1.0; ein neuer Root existiert nicht.
- **Optionen mit Vor-/Nachteilen:** Eigenes Projekt unter Projekte passt zur
  Lifecycle-Trennung und ist leicht auffindbar; ein anderer dedizierter Root
  ist möglich, benötigt aber eine eigene Bindung. Exakten Root bis zum
  V1.0-Auftrag offenlassen vermeidet vorzeitige Festlegung, verschiebt jedoch
  die abschließende Targetentscheidung. Pilot direkt als V1.0 fortsetzen ist
  aufgrund der geschlossenen Campaign und ihrer Altpfade verworfen.
- **Abhängigkeiten:** OD-09 für Namen; OD-07 muss vor W5 bewiesen sein,
  ist bei separatem Archiv jedoch keine Voraussetzung für die Rootwahl.
- **Risiken:** Pilotdaten werden als neue aktive Campaign oder dessen Console
  als bereits freigegebene V1.0-Architektur behandelt.
- **RECOMMENDED:** `PROPOSED ARGUS_V1` besitzt später
  `PROPOSED C:\Users\steph\Projekte\argus`; bis zum separaten Produktauftrag
  nur Location Contract, kein Verzeichnis und kein Repository anlegen.
- **Spätere Waves:** W5 übergibt nur Provenance und Produktgrenzen. Codex-only,
  keine zusätzlich bezahlte Modell-API; Implementierung bleibt separater Auftrag.
- **Ownerfrage:** Soll das spätere neue A.R.G.U.S. V1.0 den Root
  `PROPOSED C:\Users\steph\Projekte\argus` erhalten oder soll der genaue
  Root ausdrücklich bis zum eigenen V1.0-Auftrag vorläufig bleiben?
- **Status:** `RECOMMENDED / PROPOSED / OWNER_DECISION_REQUIRED`.

#### OD-03 — Shared Workflow / mögliches codex-workflow-Repository

- **W0-Ausgangslage:** TEX-W0-003/007, MIDAS-Templates und
  `hestia-workflow-contract` belegen gemeinsame Anliegen, aber verschiedene
  Projektsemantik; ein notwendiger dritter Lifecycle-Owner ist nicht bewiesen.
- **Optionen mit Vor-/Nachteilen:** Bestehende versionierte Projektverträge
  beibehalten vermeidet Plattformaufbau und erhält HESTIA-Semantik, verlangt
  aber bewusste Pflege. Eine zentrale Quelle bei einem bestehenden Owner mit
  veröffentlichten, gepinnten Kopien reduziert Drift, benötigt einen
  tatsächlich bewiesenen gemeinsamen Vertrag. Eigenes Repository erhöht
  Unabhängigkeit, bringt aktuell unbegründete Release-/Bootstraplast.
- **Abhängigkeiten:** Grundentscheidung unabhängig von OD-01/02; technisches
  Aufräumen hängt an OD-04/05 und bewiesenen Consumerbindungen.
- **Risiken:** Eine MIDAS-Datei wird heimlich globale Policy; Kopien entwickeln
  konkurrierende KASRKIN-Entscheidungsregeln.
- **RECOMMENDED:** `PROPOSED PROJECT_LOCAL_VERSIONED_WORKFLOW`: MIDAS und
  HESTIA behalten eigene versionierte Workflow-/Templatequellen; kein neues
  `PROPOSED codex-workflow`-Repository. Später KASRKIN-Entscheidungssemantik
  explizit vom projektlokalen Konsultations-/Ausführungsvertrag trennen.
- **Spätere Waves:** W2 dokumentiert nach Ownerentscheid den bewussten Verbleib;
  W6 bereinigt erst nach Tool- und Consumerproof. Kein Workflow-Rewrite in W2.
- **Ownerfrage:** Sollen die Workflow-/Templatequellen vorerst bei MIDAS und
  H.E.S.T.I.A. bleiben und ein eigenes codex-workflow-Repository entfallen,
  bis ein zusätzlicher gemeinsamer Release-/Consumerbedarf nachgewiesen ist?
- **Status:** `RECOMMENDED / PROPOSED / OWNER_DECISION_REQUIRED`.

#### OD-09 — Repository-Namen und Casing

- **W0-Ausgangslage:** `repo-midas`, `repo-hestia` und die bekannten Roots
  belegen heutige Namen; KASRKIN-/ARGUS-Repositories existieren nicht.
- **Optionen mit Vor-/Nachteilen:** Neue technische Namen in Kleinbuchstaben
  sind kurze, eindeutige Pfadwerte; Marken-Casing ist optisch konsistent mit
  KASRKIN/A.R.G.U.S., erfordert jedoch sorgfältige Schreibweise. Bestehende
  Produktroots behalten verhindert zusätzliche Pfadinvalidierung; spätere
  einheitliche Renames kosten eigene Proof-/Rollbackarbeit.
- **Abhängigkeiten:** Namenskonvention kann unabhängig entschieden werden;
  konkrete OD-01/02-Pfade werden danach finalisiert.
- **Risiken:** Case-only-Renames auf Windows/Git und unbemerkte absolute
  Verweise; keine Rename-Pflicht parallel zum funktionalen Cutover.
- **RECOMMENDED:** `PROPOSED kasrkin` und `PROPOSED argus` als neue lokale
  Repository-/Rootnamen; bestehende M.I.D.A.S und H.E.S.T.I.A unverändert.
  Anzeigenamen KASRKIN und A.R.G.U.S. bleiben getrennt von technischen Namen.
  Remote-URLs und Sichtbarkeit werden hier nicht festgelegt.
- **Spätere Waves:** Kein Produkt-Rename in W3–W7; ein späterer Rename benötigt
  einen eigenen Auftrag mit allen Pfadconsumern.
- **Ownerfrage:** Möchtest du für neue Repositories die technischen Namen
  `PROPOSED kasrkin` und `PROPOSED argus` verwenden und bestehende
  Produkt-Repositories vorerst unverändert benannt lassen?
- **Status:** `RECOMMENDED / PROPOSED / OWNER_DECISION_REQUIRED`.

### 14.3 Gruppe B — technische Integration

#### OD-04 — Installierter KASRKIN-Einstieg

- **W0-Ausgangslage:** `installed-usage-sensor` ist eine bytegleiche
  Rainmeter-Kopie; MIDAS und HESTIA rufen projektlokale Validatoren auf.
  Der historische ARGUS-Helper besitzt einen relativen MIDAS-Runtimeverweis.
- **Optionen mit Vor-/Nachteilen:** Installierter versionierter Command bietet
  einen stabilen Einstieg unabhängig vom Checkout, benötigt Resolver und
  Installationsreceipt. Ein expliziter Projektadapter ist lokal gut prüfbar,
  kann aber bei doppelter Logik driften. Bloßes PATH-Umbiegen auf einen Checkout
  beweist weder Version noch Projektbindung und wird verworfen.
- **Abhängigkeiten:** OD-01/09 definieren Source; OD-05 definiert Auflösung;
  OD-06 trennt Installation vom geschriebenen State.
- **Risiken:** Falscher Command im PATH, stilles latest, versteckter Fallback,
  fehlende HESTIA-Kompatibilität.
- **RECOMMENDED:** `PROPOSED kasrkin` als installierter Command unter
  `PROPOSED %LOCALAPPDATA%\KASRKIN\bin`, Payloads unter
  `PROPOSED %LOCALAPPDATA%\KASRKIN\versions\<release-id>`.
  Expliziter Projektkontext plus Lock bestimmen Payload und Validatorprofil.
  Ein dünner Projektadapter darf ausschließlich diesen Vertrag vermitteln.
- **Spätere Waves:** W3-I beweist Auflösung aus fremdem Arbeitsverzeichnis,
  Version/Hash, JSON-/Exitcodevertrag, Fehlerfälle und Refresh bis zum
  validierten State. Kein Selbstupdate und kein impliziter Profilwechsel.
- **Ownerfrage:** Soll der installierte Command `PROPOSED kasrkin` mit
  versionsgebundenen Payloads und expliziter Projektbindung der kanonische
  Einstieg werden, mit optionalem dünnem Projektadapter?
- **Status:** `RECOMMENDED / PROPOSED / OWNER_DECISION_REQUIRED`.

#### OD-05 — Pinning- und Updatevertrag

- **W0-Ausgangslage:** `kasrkin-activation` bindet Dateien per Hash;
  HESTIAs Validator weicht ab. Ein globales Versionslabel allein genügt nicht.
- **Optionen mit Vor-/Nachteilen:** Projektlock plus Installationsreceipt
  trennt gewünschte und vorhandene Version und erlaubt unabhängige Updates,
  verlangt aber zwei klar definierte Nachweise. Nur Installerreceipt ist
  einfacher, beweist keine Projektabsicht. Vendoring ist reproduzierbar,
  erhält jedoch die zu bereinigenden Quellkopien und deren Wartungsaufwand.
- **Abhängigkeiten:** OD-04 bestimmt Resolver; OD-06 Statekompatibilität;
  OD-08 liefert tatsächliche Releaseprovenance.
- **Risiken:** Ein Tag wird verschoben; Dirty-Dateien fehlen im Quellcommit;
  neuer Sensor bricht den noch alten Consumer am gemeinsamen Runtime-State.
- **RECOMMENDED:** `PROPOSED .kasrkin/lock.json` je Projekt mit unveränderlicher
  Release-ID, Content-Digest, Resolver-/Validatorprofil, Policy-/Schema-Version
  und Projektvertragsfingerprints. `PROPOSED INSTALL_RECEIPT` je Payload
  belegt installierte Bytes. Mismatch oder fehlender Pin: fail closed.
  Updates nur ausdrücklich, projektweise und mit vorgehaltenem alten Payload;
  keine automatische Angleichung von MIDAS und HESTIA.
- **Spätere Waves:** W3 testet getrennte Pins, Hashdrift, fehlende Installation,
  unerlaubte Profilsubstitution und Rückkehr zum alten Lock. Gemeinsamer Sensor
  bleibt während gestaffelter Cutovers kompatibel oder unverändert.
- **Ownerfrage:** Sollen Projektlock plus Installationsreceipt verbindlich sein,
  mit expliziten Einzelprojekt-Updates und ohne automatische latest-Auflösung?
- **Status:** `RECOMMENDED / PROPOSED / OWNER_DECISION_REQUIRED`.

#### OD-06 — Runtime-/Evidence-Roots

- **W0-Ausgangslage:** Live-Usage-State liegt außerhalb der Produktrepos bei
  Rainmeter; ARGUS-Stages und Run-Evidence besitzen eigene externe Roots.
  Diese ARGUS-Daten sind historisch, keine neue V1.0-Runtime.
- **Optionen mit Vor-/Nachteilen:** Den bestehenden KASRKIN-Statepfad vorerst
  als einzigen kanonischen Runtimepfad behalten minimiert Betriebsrisiko,
  erhält aber die Rainmeter-Namenskopplung. Späterer tool-eigener Runtimepfad
  trennt die Rollen besser, benötigt jedoch einen eigenen Writer-/Readercutover.
  Runtime im Source-Checkout wird wegen Checkoutabhängigkeit verworfen.
- **Abhängigkeiten:** OD-04/05 für Installation und Schema; OD-07 für
  historische ARGUS-Evidence; OD-02 erst für neue Produktintegration.
- **Risiken:** Zwei aktive Statewriter, alter Reader auf neuem Schema,
  Runtime wird als unveränderliche Evidence oder Backup missverstanden.
- **RECOMMENDED:** `PROPOSED STAGED_RUNTIME_CONTRACT`: W3 hält
  `usage-state-runtime.currentPath` als einzigen aktiven Statepfad und den
  Rainmeter-Sensor bytegleich. Tool-Evidence künftig
  `PROPOSED %LOCALAPPDATA%\KASRKIN\evidence`, getrennt von Payloads und
  projektlokaler Roadmap-Evidence. Ein eventueller State-Move nach
  `PROPOSED %LOCALAPPDATA%\KASRKIN\runtime` bleibt separater späterer Auftrag.
  ARGUS V1: nur `PROPOSED %LOCALAPPDATA%\ARGUS\runtime` und
  `PROPOSED %LOCALAPPDATA%\ARGUS\evidence` als vorläufige Location Contracts.
- **Spätere Waves:** W3 muss keinen Statepfad ändern; W4 archiviert Pilotdaten.
  Neue ARGUS-Roots entstehen frühestens im separaten V1.0-Auftrag. Retention,
  Backup und Zugriffsschutz müssen vor ihrer ersten Nutzung konkretisiert sein.
- **Ownerfrage:** Soll W3 den vorhandenen Rainmeter-Statepfad unverändert
  behalten, Tool-Evidence getrennt führen und einen State-Move sowie die
  konkreten ARGUS-V1-Runtimeverträge ausdrücklich auf spätere Aufträge vertagen?
- **Status:** `RECOMMENDED / PROPOSED / OWNER_DECISION_REQUIRED`.

#### OD-08 — Git-History-Strategie

- **W0-Ausgangslage:** MIDAS war bereits dirty; zahlreiche relevante Quellen
  sind nicht allein durch HEAD repräsentiert. Pilot und externe Evidence
  besitzen Bytefingerprints, teilweise außerhalb jedes Repository.
- **Optionen mit Vor-/Nachteilen:** History-preserving Extraction erhält
  ausgewählte Commitgeschichte, verlangt Pfadfilter, Datenprüfung und die
  zusätzliche Aufnahme uncommitteter Quellen. Provenance-Import mit
  Quellcommit UND Dateimanifest ist einfach reproduzierbar, übernimmt jedoch
  keine native alte Blame-Historie. Neuer Initialcommit ohne Manifest ist
  unzureichend und wird verworfen.
- **Abhängigkeiten:** OD-01/07 bestimmen Ziele, OD-05 nutzt Releaseidentität.
  Methode kann vor exakten Pfaden beschlossen werden.
- **Risiken:** Pauschaler Historyexport nimmt Gesundheits-/Fremddaten mit;
  Quellcommit-only unterschlägt den Dirty-Stand; Git-Zeilennormalisierung
  verändert archivierte Bytes.
- **RECOMMENDED:** `PROPOSED PROVENANCE_IMPORT` für KASRKIN: vollständiges
  Datei-/Pfad-/SHA-/Dirty-Manifest plus MIDAS-HEAD und Ursprungspfade;
  anschließend eigenständige neue Sourcehistorie. Für Pilot
  `PROPOSED BYTE_PRESERVING_ARCHIVE` mit Manifest und unveränderten Bytes,
  keine vollständige MIDAS-History. Alte Guard-DONE-Artefakte verbleiben
  bytegleich bei MIDAS und werden über Provenance referenziert.
- **Spätere Waves:** W3 beweist Import gegen den freigegebenen Worktree,
  W4 Archiv gegen W0/Preimage; bestehende Repositoryhistorie wird nie rebaset
  oder gefiltert. Rekonstruktionstest statt Vertrauen in Commitlabels.
- **Ownerfrage:** Akzeptierst du einen manifestgebundenen Provenance-Import
  für KASRKIN und ein bytegleiches Pilotarchiv ohne alte native Blame-Historie,
  oder ist deren Erhalt den zusätzlichen selektiven History-Export wert?
- **Status:** `RECOMMENDED / PROPOSED / OWNER_DECISION_REQUIRED`.

### 14.4 Gruppe C — Migration

#### OD-07 — Archivziel des historischen A.R.G.U.S.-Piloten

- **W0-Ausgangslage:** TEX-W0-004/008 und die ARGUS-Inventory-IDs umfassen
  Campaign, 70-Dateien-Benchmarktree, Console, sechs Stages und Run-Evidence;
  die Codex-Session bleibt fremdverwaltete externe Provenance.
- **Optionen mit Vor-/Nachteilen:** Archiv unter dem späteren ARGUS-Owner
  bündelt Navigation, koppelt aber Verfügbarkeit an das neue Projekt.
  Separates Provenancearchiv kann vorher bewiesen werden und trennt
  Lebenszyklen, braucht dafür einen expliziten Index. Verbleib an Altpfaden
  ist eine sichere Übergangslösung, erfüllt langfristig den Cleanup nicht.
- **Abhängigkeiten:** OD-08 für Byte-/Provenancestrategie; OD-06 grenzt Runtime
  ab. Bei separatem Archiv ist OD-02 kein technischer Vorgänger.
- **Risiken:** Historische absolute Links wirken nach Move funktionsfähig,
  obwohl sie alt sind; Console startet versehentlich Pilotaktionen;
  externe Sessionprovenance wird unzulässig mitkopiert.
- **RECOMMENDED:** `PROPOSED ARGUS_PILOT_ARCHIVE` als getrennte Archivrolle in
  `PROPOSED C:\Users\steph\Archives\ARGUS-PILOT\v1.2-v1.6`.
  Herkunftsnamespace MIDAS, Projects, Stage und Evidence getrennt erhalten;
  neuer Navigations-/Provenanceindex außerhalb der unveränderten Payloads.
  Kein neues Archiv-Repository erforderlich; spätere Backup-/Restoreproofs
  sind Pflicht vor Freigabe alter Pfade.
- **Spätere Waves:** W4 archiviert zuerst parallel und beweist Bytes,
  Vollständigkeit, Lesbarkeit und Navigation; W5 referenziert dieses Archiv.
  Historische Operatorwerkzeuge/Console bleiben inaktiv; kein Pfadpatch und
  keine Pilotwiederholung. Externe .codex-Datei bleibt nur Referenz.
- **Ownerfrage:** Soll der Pilot in das getrennte Archiv
  `PROPOSED C:\Users\steph\Archives\ARGUS-PILOT\v1.2-v1.6`
  statt in das spätere ARGUS-V1-Repository gelangen?
- **Status:** `RECOMMENDED / PROPOSED / OWNER_DECISION_REQUIRED`.

#### OD-10 — Cutover-Reihenfolge

- **W0-Ausgangslage:** KASRKIN besitzt aktive MIDAS-/HESTIA-Consumer; ARGUS
  ist geschlossen. Shared-Verträge binden Guardartefakte per Fingerprint.
- **Optionen mit Vor-/Nachteilen:** KASRKIN-Source/Installation zuerst beseitigt
  den aktiven Engpass, braucht früh gute Consumerproofs. Pilot zuerst wäre
  technisch isolierbar, verschiebt aber die aktive Governanceentkopplung.
  Gemeinsamer Cross-Repo-Cutover und paralleler Rename sind wegen Rollback-
  und Semantikrisiko verworfen.
- **Abhängigkeiten:** OD-01/03/04/05/06/08/09 für W3; OD-07 für W4;
  OD-02 nur für W5-Handoff. Abschluss aller verbindlichen OD-Gates bleibt
  Voraussetzung einer späteren migrationsfähigen W1-Freigabe.
- **Risiken:** Installation wird bereits als Consumerproof gewertet; alte
  Pfade werden zu früh gelöscht; W2 zieht die W6-Vertragszerlegung vor.
- **RECOMMENDED:** `PROPOSED SEQUENCE`: W2 bewusster Shared-Verbleib;
  W3-S Source → W3-I Installation → W3-M MIDAS → W3-H HESTIA;
  W4 Pilotarchiv → W5 separater V1-Handoff → W6 Vertragsbereinigung
  projektweise → W7 gesondert freigegebener Cleanup.
- **Spätere Waves:** W3-M und W3-H sind eigene sichere Transaktionen; HESTIA
  darf auf Altstand verbleiben, ohne den grünen MIDAS-Cutover zurückzudrehen.
  W6/W7 warten auf ihre betroffenen Proofs. W5 implementiert nichts.
- **Ownerfrage:** Soll diese Reihenfolge mit MIDAS vor H.E.S.T.I.A., getrennten
  Consumertransaktionen und späterem Workflow-Cleanup gelten?
- **Status:** `RECOMMENDED / PROPOSED / OWNER_DECISION_REQUIRED`.

## 15. DRAFT Dependency Matrix

Alle empfohlenen Abhängigkeiten sind `PROPOSED`. „Vorher“ bedeutet technischer
Vorgänger zur verbindlichen Ausgestaltung, nicht Erlaubnis, offene W1-Gates zu
überspringen. OD-09 benennt; OD-01/02 wenden diese Konvention auf den Root an,
wodurch kein zirkuläres Entscheidungsgate entsteht.

| Entscheidung | Muss vorher entschieden sein | Kann unabhängig entschieden werden von | Kann vorläufig bleiben | Erst für spätere Wave benötigt |
| --- | --- | --- | --- | --- |
| OD-01 | OD-09 für exakten Namen | OD-02, OD-03, OD-07 | alternativer Root bis W1-Targetfreigabe | W3-S konkreter Root |
| OD-02 | OD-09 für exakten Namen | OD-01, OD-03, OD-07 bei separatem Archiv | genauer Root als expliziter Owner-Deferred-Wert | W5-Handoff / eigener V1-Auftrag |
| OD-03 | keiner | OD-01, OD-02, OD-07, OD-08, OD-09 | späterer Zentralisierungsbedarf | W2 Verbleib; W6 semantische Bereinigung |
| OD-09 | keiner | OD-03 bis OD-08, OD-10 | Remote-Namen/URLs; spätere Produktrenames | neue Namen W3; ARGUS-Root später |
| OD-04 | OD-01/09 für konkretes Releaseziel | OD-02, OD-07 | konkrete CLI-Syntax bis W3-Design, nicht vor Installation | W3-I |
| OD-05 | OD-04 Integrationsform | OD-02, OD-03, OD-07, OD-09 als Prinzip | Lock-Schemafelder im Detail bis W3; Mechanismus in W1 | W3-I/M/H |
| OD-06 | OD-04/05 für verbindlichen Betriebsvertrag | OD-08, OD-09; ARGUS getrennt von KASRKIN | ARGUS-V1-Pfade und späterer State-Move | W3 Stateerhalt; neue Runtime erst eigener Auftrag |
| OD-08 | keine für Methode; OD-01/07 für Zielmanifest | OD-02, OD-03, OD-04, OD-06, OD-09 als Methode | selektiver Historyexport nur bei Ownerwahl | W3-S und W4 |
| OD-07 | OD-08 Archivmethode; OD-06 Rollentrennung | OD-01, OD-02, OD-03, OD-04, OD-05, OD-09 | Backupmedium bis W4-Preflight, nicht bis Altpfadfreigabe | W4, vor W5 |
| OD-10 | OD-01/03/04/05/06/08/09 für W3; OD-07 für W4 | OD-02 für W3/W4 | Termine und spätere separate Produktarbeit | W2–W7 |

Technisch praktisch eindeutig sind Lifecycle-Trennung, kein unbelegtes Shared-
Repository, explizite Versionsbindung, getrennte Rollen, Byteerhalt und
projektweise Cutovers. Echte Owner-Trade-offs bleiben konkrete Roots/Casing,
CLI- versus Adapterpräferenz, Zeitpunkt eines State-Moves, Archivablage,
native Git-History versus einfacher Provenance-Import und Consumerpriorität.
Auch die praktisch eindeutigen Empfehlungen sind keine Ownerentscheidung.

## 16. DRAFT Target Map — vollständige Inventory-Zuordnung

Status: `DRAFT / RECOMMENDED`, alle Zielwerte `PROPOSED`.
Jede Inventory-ID ist genau einmal enthalten; bei Root-/Kind-Überlappungen
werden dieselben Bytes später nur einmal übernommen. `currentPath` und
`currentOwner` stammen unverändert aus dem read-only W0-Register.
Disposition ist die ursprüngliche **W0-Planung**, keine Ausführungsfreigabe.
Bei `DECIDE_IN_EXTRACTION` konkretisiert nur der vorgeschlagene Zielvertrag
die Empfehlung. `MOVE` bedeutet später vorbereiteter Parallelimport plus
separat freigegebener Altpfadretire, kein sofortiger Filesystem-Move.

Location Contracts (ausschließlich vorgeschlagen):

| Kürzel | PROPOSED Location Contract / Rolle |
| --- | --- |
| M | `PROPOSED` MIDAS-Source bleibt im bestehenden `C:\Users\steph\Projekte\M.I.D.A.S` |
| H | `PROPOSED` HESTIA-Source bleibt im bestehenden `C:\Users\steph\Projekte\H.E.S.T.I.A` |
| K | `PROPOSED C:\Users\steph\Projekte\kasrkin`, KASRKIN-Source Repository |
| KI | `PROPOSED %LOCALAPPDATA%\KASRKIN\bin` und `PROPOSED %LOCALAPPDATA%\KASRKIN\versions\<release-id>`, Installation ohne Runtimewrites im Payload |
| PM | `PROPOSED` MIDAS-eigener Lock/Adapter/Activation unter `PROPOSED M/.kasrkin/`; lokale Roadmap-/Evidenceverträge bleiben bei MIDAS |
| PH | `PROPOSED` HESTIA-eigener Lock/Adapter/Profil unter `PROPOSED H/.kasrkin/`; keine automatische MIDAS-Semantikübernahme |
| KR | `PROPOSED` W3 erhält ausschließlich den aktuellen `usage-state-runtime.currentPath`; Rainmeter bleibt einziger bestehender Sensorwriter |
| KE | `PROPOSED %LOCALAPPDATA%\KASRKIN\evidence`, künftige Toolreceipts; bestehende Projektevidence verbleibt beim Projekt |
| PA | `PROPOSED C:\Users\steph\Archives\ARGUS-PILOT\v1.2-v1.6`, getrenntes bytegleiches historisches Archiv mit neuem Index außerhalb seiner Payloads |
| CURRENT | `PROPOSED` Verbleib am exakten Current Location der jeweiligen Zeile |
| CURRENT_OWNER | `PROPOSED` keine Ownershipänderung gegenüber Current Owner |
| N/A | Rolle für dieses Artefakt nicht belegt beziehungsweise nicht vorgesehen; keine implizite Kopie |

Runtime, Evidence und Archive sind verschiedene Rollen. Ein Source-Repository
ist weder Installation noch Runtime. Bestehende Guard-DONE-Evidence bleibt im
MIDAS-Archiv; auch Toolinstallation macht sie nicht zur veränderbaren Quelle.
`PM/PH` bedeutet zwei eigene Integrationen, keinen gemeinsamen Transaktionsroot.
Neue Pfadwerte sind keine existierenden Links und werden daher als Code gezeigt.

<!-- markdownlint-disable MD013 -->

| Logical Source / Artefaktklasse | Inventory ID | Current Owner | Current Location | Proposed Target Owner | Proposed Target Location | Source Repository | Installation | Project Integration | Runtime | Evidence | Historical Archive | W0-Disposition | Notwendige Reference Rewrites | Cutover Wave | Rollback Boundary | OD-Abhängigkeit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PRODUCT_REPOSITORY | `repo-midas` | MIDAS | `C:\Users\steph\Projekte\M.I.D.A.S` | PROPOSED `MIDAS` | PROPOSED `CURRENT` | PROPOSED `M` | N/A | N/A | N/A | N/A | N/A | REMAIN | PROPOSED keiner; Changelog nur späterer additiver Migrationseintrag | PROPOSED W7 | PROPOSED B7 | OD-09 |
| PRODUCT_REPOSITORY | `repo-hestia` | HESTIA | `C:\Users\steph\Projekte\H.E.S.T.I.A` | PROPOSED `HESTIA` | PROPOSED `CURRENT` | PROPOSED `H` | N/A | N/A | N/A | N/A | N/A | REMAIN | PROPOSED keiner | PROPOSED W7 | PROPOSED B7 | OD-09 |
| THIRD_PARTY_SOFTWARE_GIT_ROOT | `repo-g915-chatter-guard` | ORIGINAL_UPSTREAM_AUTHOR | `C:\Users\steph\Projekte\G915 Chatter Guard` | PROPOSED `CURRENT_OWNER` | PROPOSED `CURRENT; EXTERNAL_DO_NOT_TOUCH` | N/A | N/A | N/A | N/A | N/A | N/A | EXTERNAL_DO_NOT_TOUCH | PROPOSED keiner; Session nur externer Provenanceverweis | PROPOSED keine | PROPOSED keine Mutation | keine; feste Ausschlussgrenze |
| DISCOVERY_SCOPE_GROUP | `projects-nonrepository-roots` | MULTIPLE | `C:\Users\steph\Projekte` | PROPOSED `CURRENT_OWNER` | PROPOSED `CURRENT; kein bewiesener Movebedarf` | N/A | N/A | N/A | N/A | N/A | N/A | REMAIN | PROPOSED keiner; Desktoppapiere sind keine aktiven Governancequellen | PROPOSED keine; Designinput bei W1/W6 | PROPOSED keine Mutation | OD-03/09 |
| AGENT_CONTRACT | `midas-agents` | MIDAS | `C:\Users\steph\Projekte\M.I.D.A.S\AGENTS.md` | PROPOSED `MIDAS` | PROPOSED `CURRENT; projektlokaler Vertrag` | PROPOSED `M` | N/A | PROPOSED `PM` | N/A | N/A | N/A | REWRITE_REFERENCE | PROPOSED aktive Aufrufe/Navigation minimal in W3-M; Ownership und Semantik erst W6-M; Activation mitbinden | PROPOSED W3-M minimal; W6-M semantisch | PROPOSED BM/B6M | OD-03/04/05/06/10 |
| PRODUCT_OVERVIEW | `midas-readme` | MIDAS | `C:\Users\steph\Projekte\M.I.D.A.S\README.md` | PROPOSED `MIDAS` | PROPOSED `CURRENT; projektlokaler Vertrag` | PROPOSED `M` | N/A | PROPOSED `PM` | N/A | N/A | N/A | REWRITE_REFERENCE | PROPOSED aktive Aufrufe/Navigation minimal in W3-M; Ownership und Semantik erst W6-M; Activation mitbinden | PROPOSED W3-M minimal; W6-M semantisch | PROPOSED BM/B6M | OD-03/04/05/06/10 |
| PRODUCT_HISTORY | `midas-changelog` | MIDAS | `C:\Users\steph\Projekte\M.I.D.A.S\CHANGELOG.md` | PROPOSED `MIDAS` | PROPOSED `CURRENT` | PROPOSED `M` | N/A | N/A | N/A | N/A | N/A | REMAIN | PROPOSED keiner; Changelog nur späterer additiver Migrationseintrag | PROPOSED W7 | PROPOSED B7 | OD-09 |
| MIXED_WORKSTATION_AND_PROJECT_CONTRACT | `midas-dev-environment` | MIDAS | `C:\Users\steph\Projekte\M.I.D.A.S\docs\DEV_ENVIRONMENT.md` | PROPOSED `MIDAS` | PROPOSED `CURRENT; projektlokaler Vertrag` | PROPOSED `M` | N/A | PROPOSED `PM` | N/A | N/A | N/A | REWRITE_REFERENCE | PROPOSED aktive Aufrufe/Navigation minimal in W3-M; Ownership und Semantik erst W6-M; Activation mitbinden | PROPOSED W3-M minimal; W6-M semantisch | PROPOSED BM/B6M | OD-03/04/05/06/10 |
| WORKFLOW_AND_GOVERNANCE_CONTRACT | `midas-workflow-contract` | MIDAS | `C:\Users\steph\Projekte\M.I.D.A.S\docs\templates\MIDAS Roadmap Workflow Contract.md` | PROPOSED `MIDAS` | PROPOSED `CURRENT; projektlokaler Vertrag` | PROPOSED `M` | N/A | PROPOSED `PM` | N/A | N/A | N/A | DECIDE_IN_EXTRACTION | PROPOSED aktive Aufrufe/Navigation minimal in W3-M; Ownership und Semantik erst W6-M; Activation mitbinden | PROPOSED W3-M minimal; W6-M semantisch | PROPOSED BM/B6M | OD-03/04/05/06/10 |
| TEMPLATE_INDEX | `midas-templates-readme` | MIDAS | `C:\Users\steph\Projekte\M.I.D.A.S\docs\templates\README.md` | PROPOSED `MIDAS` | PROPOSED `CURRENT; projektlokaler Vertrag` | PROPOSED `M` | N/A | PROPOSED `PM` | N/A | N/A | N/A | REWRITE_REFERENCE | PROPOSED aktive Aufrufe/Navigation minimal in W3-M; Ownership und Semantik erst W6-M; Activation mitbinden | PROPOSED W3-M minimal; W6-M semantisch | PROPOSED BM/B6M | OD-03/04/05/06/10 |
| ROADMAP_TEMPLATE | `midas-roadmap-template` | MIDAS | `C:\Users\steph\Projekte\M.I.D.A.S\docs\templates\MIDAS Roadmap Template.md` | PROPOSED `MIDAS` | PROPOSED `CURRENT; projektlokaler Vertrag` | PROPOSED `M` | N/A | PROPOSED `PM` | N/A | N/A | N/A | DECIDE_IN_EXTRACTION | PROPOSED aktive Aufrufe/Navigation minimal in W3-M; Ownership und Semantik erst W6-M; Activation mitbinden | PROPOSED W3-M minimal; W6-M semantisch | PROPOSED BM/B6M | OD-03/04/05/06/10 |
| EVIDENCE_TEMPLATE | `midas-evidence-template` | MIDAS | `C:\Users\steph\Projekte\M.I.D.A.S\docs\templates\MIDAS Roadmap Evidence Template.md` | PROPOSED `MIDAS` | PROPOSED `CURRENT; projektlokaler Vertrag` | PROPOSED `M` | N/A | PROPOSED `PM` | N/A | N/A | N/A | DECIDE_IN_EXTRACTION | PROPOSED aktive Aufrufe/Navigation minimal in W3-M; Ownership und Semantik erst W6-M; Activation mitbinden | PROPOSED W3-M minimal; W6-M semantisch | PROPOSED BM/B6M | OD-03/04/05/06/10 |
| MODULE_OVERVIEW | `kasrkin-overview` | KASRKIN | `C:\Users\steph\Projekte\M.I.D.A.S\docs\modules\KASRKIN Module Overview.md` | PROPOSED `KASRKIN` | PROPOSED `K/docs/<ursprünglicher Dateiname>` | PROPOSED `K` | N/A | N/A | N/A | N/A | N/A | MOVE | PROPOSED neue aktuelle Toolnavigation; historische Passagen bytegleich im Importpreimage erhalten | PROPOSED W3-S; Navigation W6-M | PROPOSED BS | OD-01/08/09 |
| EVOLUTION_HISTORY | `kasrkin-evolution-notes` | KASRKIN | `C:\Users\steph\Projekte\M.I.D.A.S\docs\Codex Usage Guard Evolution Notes.md` | PROPOSED `KASRKIN` | PROPOSED `K/docs/<ursprünglicher Dateiname>` | PROPOSED `K` | N/A | N/A | N/A | N/A | N/A | MOVE | PROPOSED neue aktuelle Toolnavigation; historische Passagen bytegleich im Importpreimage erhalten | PROPOSED W3-S; Navigation W6-M | PROPOSED BS | OD-01/08/09 |
| GUARD_SOURCE_TREE | `kasrkin-source-root` | KASRKIN | `C:\Users\steph\Projekte\M.I.D.A.S\tools\codex-usage` | PROPOSED `KASRKIN` | PROPOSED `K/tools/codex-usage/<relativ zum bisherigen Source-Root>` | PROPOSED `K` | PROPOSED `KI` | PROPOSED `PM/PH` | PROPOSED `KR` | PROPOSED `KE` | N/A | MOVE | PROPOSED Pfad-/Hashbindung und Resolver; keine neue Policysemantik; alte MIDAS-Quelle bis W7 behalten | PROPOSED W3-S/I/M/H | PROPOSED BS/BI/BM/BH | OD-01/04/05/06/08/09/10 |
| USAGE_SENSOR | `kasrkin-sensor-source` | KASRKIN | `C:\Users\steph\Projekte\M.I.D.A.S\tools\codex-usage\GetCodexUsage.ps1` | PROPOSED `KASRKIN` | PROPOSED `K/tools/codex-usage/<relativ zum bisherigen Source-Root>` | PROPOSED `K` | PROPOSED `KI` | PROPOSED `PM/PH` | PROPOSED `KR` | PROPOSED `KE` | N/A | MOVE | PROPOSED Pfad-/Hashbindung und Resolver; keine neue Policysemantik; alte MIDAS-Quelle bis W7 behalten | PROPOSED W3-S/I/M/H | PROPOSED BS/BI/BM/BH | OD-01/04/05/06/08/09/10 |
| USAGE_VALIDATOR | `kasrkin-validator` | KASRKIN | `C:\Users\steph\Projekte\M.I.D.A.S\tools\codex-usage\Test-CodexUsageState.ps1` | PROPOSED `KASRKIN` | PROPOSED `K/tools/codex-usage/<relativ zum bisherigen Source-Root>` | PROPOSED `K` | PROPOSED `KI` | PROPOSED `PM/PH` | PROPOSED `KR` | PROPOSED `KE` | N/A | MOVE | PROPOSED Pfad-/Hashbindung und Resolver; keine neue Policysemantik; alte MIDAS-Quelle bis W7 behalten | PROPOSED W3-S/I/M/H | PROPOSED BS/BI/BM/BH | OD-01/04/05/06/08/09/10 |
| GUARD_POLICY_CONFIG | `kasrkin-policy-config` | KASRKIN | `C:\Users\steph\Projekte\M.I.D.A.S\tools\codex-usage\guard-policy-config.json` | PROPOSED `KASRKIN` | PROPOSED `K/tools/codex-usage/<relativ zum bisherigen Source-Root>` | PROPOSED `K` | PROPOSED `KI` | PROPOSED `PM/PH` | PROPOSED `KR` | PROPOSED `KE` | N/A | MOVE | PROPOSED Pfad-/Hashbindung und Resolver; keine neue Policysemantik; alte MIDAS-Quelle bis W7 behalten | PROPOSED W3-S/I/M/H | PROPOSED BS/BI/BM/BH | OD-01/04/05/06/08/09/10 |
| ACTIVE_POLICY_BINDING | `kasrkin-activation` | KASRKIN | `C:\Users\steph\Projekte\M.I.D.A.S\tools\codex-usage\guard-activation.json` | PROPOSED `KASRKIN` | PROPOSED `K: Releasebasis; PM/PH: neue projektspezifische Bindung` | PROPOSED `K` | PROPOSED `KI` | PROPOSED `PM/PH` | PROPOSED `KR` | PROPOSED `KE` | N/A | MOVE | PROPOSED alte Activation als Preimage bewahren; Releasehashes und lokale Vertragsfingerprints explizit neu binden | PROPOSED W3-S/I/M/H | PROPOSED BS/BI/BM/BH | OD-01/04/05/06/08/09/10 |
| GUARD_SCHEMAS | `kasrkin-schemas` | KASRKIN | `C:\Users\steph\Projekte\M.I.D.A.S\tools\codex-usage\schemas` | PROPOSED `KASRKIN` | PROPOSED `K/tools/codex-usage/<relativ zum bisherigen Source-Root>` | PROPOSED `K` | PROPOSED `KI` | PROPOSED `PM/PH` | PROPOSED `KR` | PROPOSED `KE` | N/A | MOVE | PROPOSED Pfad-/Hashbindung und Resolver; keine neue Policysemantik; alte MIDAS-Quelle bis W7 behalten | PROPOSED W3-S/I/M/H | PROPOSED BS/BI/BM/BH | OD-01/04/05/06/08/09/10 |
| GUARD_TEST_FIXTURES | `kasrkin-fixtures` | KASRKIN | `C:\Users\steph\Projekte\M.I.D.A.S\tools\codex-usage\fixtures` | PROPOSED `KASRKIN` | PROPOSED `K/tools/codex-usage/<relativ zum bisherigen Source-Root>` | PROPOSED `K` | PROPOSED `KI` | PROPOSED `PM/PH` | PROPOSED `KR` | PROPOSED `KE` | N/A | MOVE | PROPOSED Pfad-/Hashbindung und Resolver; keine neue Policysemantik; alte MIDAS-Quelle bis W7 behalten | PROPOSED W3-S/I/M/H | PROPOSED BS/BI/BM/BH | OD-01/04/05/06/08/09/10 |
| GUARD_TEST_SUITE | `kasrkin-guard-tests` | KASRKIN | `C:\Users\steph\Projekte\M.I.D.A.S\tools\codex-usage` | PROPOSED `KASRKIN` | PROPOSED `K/tools/codex-usage/<relativ zum bisherigen Source-Root>` | PROPOSED `K` | PROPOSED `KI` | PROPOSED `PM/PH` | PROPOSED `KR` | PROPOSED `KE` | N/A | MOVE | PROPOSED Pfad-/Hashbindung und Resolver; keine neue Policysemantik; alte MIDAS-Quelle bis W7 behalten | PROPOSED W3-S/I/M/H | PROPOSED BS/BI/BM/BH | OD-01/04/05/06/08/09/10 |
| INSTALLED_SENSOR_COPY | `installed-usage-sensor` | KASRKIN_INSTALLATION | `C:\Users\steph\Documents\Rainmeter\Skins\illustro\Tokens\GetCodexUsage.ps1` | PROPOSED `KASRKIN_INSTALLATION` | PROPOSED `CURRENT; W3 bytegleich` | PROPOSED `K` | PROPOSED `CURRENT; Rainmeter-Sensorkopie` | N/A | PROPOSED `KR` | N/A | N/A | REMAIN | PROPOSED installierten Versionsnachweis ergänzen; kein zweiter Writer | PROPOSED W3-I Proof, kein Sensor-Move | PROPOSED BI | OD-04/05/06 |
| DYNAMIC_USAGE_TELEMETRY | `usage-state-runtime` | KASRKIN_RUNTIME | `C:\Users\steph\Documents\Rainmeter\Skins\illustro\Tokens\UsageState.json` | PROPOSED `KASRKIN_RUNTIME` | PROPOSED `CURRENT; einziger aktiver Statepfad` | N/A | N/A | N/A | PROPOSED `KR` | N/A | N/A | REMAIN | PROPOSED kein aktueller Statepfad-Rewrite | PROPOSED W3 Erhalt; späterer Move eigener Auftrag | PROPOSED BI | OD-06 |
| AGENT_CONTRACT | `hestia-agents` | HESTIA | `C:\Users\steph\Projekte\H.E.S.T.I.A\AGENTS.md` | PROPOSED `HESTIA` | PROPOSED `CURRENT; eigene Semantik bleibt lokal` | PROPOSED `H` | N/A | PROPOSED `PH` | N/A | N/A | N/A | REWRITE_REFERENCE | PROPOSED eigene Aufrufe/Profile, dann lokale Workflowintegration; kein MIDAS-Vertragsimport | PROPOSED W3-H minimal; W6-H semantisch | PROPOSED BH/B6H | OD-03/04/05/06/10 |
| PROJECT_ENVIRONMENT_CONTRACT | `hestia-dev-environment` | HESTIA | `C:\Users\steph\Projekte\H.E.S.T.I.A\docs\DEV_ENVIRONMENT.md` | PROPOSED `HESTIA` | PROPOSED `CURRENT; eigene Semantik bleibt lokal` | PROPOSED `H` | N/A | PROPOSED `PH` | N/A | N/A | N/A | REWRITE_REFERENCE | PROPOSED eigene Aufrufe/Profile, dann lokale Workflowintegration; kein MIDAS-Vertragsimport | PROPOSED W3-H minimal; W6-H semantisch | PROPOSED BH/B6H | OD-03/04/05/06/10 |
| PROJECT_WORKFLOW_CONTRACT | `hestia-workflow-contract` | HESTIA | `C:\Users\steph\Projekte\H.E.S.T.I.A\docs\templates\HESTIA Roadmap Workflow Contract.md` | PROPOSED `HESTIA` | PROPOSED `CURRENT; eigene Semantik bleibt lokal` | PROPOSED `H` | N/A | PROPOSED `PH` | N/A | N/A | N/A | REWRITE_REFERENCE | PROPOSED eigene Aufrufe/Profile, dann lokale Workflowintegration; kein MIDAS-Vertragsimport | PROPOSED W3-H minimal; W6-H semantisch | PROPOSED BH/B6H | OD-03/04/05/06/10 |
| PROJECT_TEMPLATE_SET | `hestia-template-root` | HESTIA | `C:\Users\steph\Projekte\H.E.S.T.I.A\docs\templates` | PROPOSED `HESTIA` | PROPOSED `CURRENT; eigene Semantik bleibt lokal` | PROPOSED `H` | N/A | PROPOSED `PH` | N/A | N/A | N/A | DECIDE_IN_EXTRACTION | PROPOSED eigene Aufrufe/Profile, dann lokale Workflowintegration; kein MIDAS-Vertragsimport | PROPOSED W3-H minimal; W6-H semantisch | PROPOSED BH/B6H | OD-03/04/05/06/10 |
| PROJECT_LOCAL_USAGE_COPY | `hestia-usage-root` | HESTIA | `C:\Users\steph\Projekte\H.E.S.T.I.A\tools\codex-usage` | PROPOSED `KASRKIN_INSTALLATION; HESTIA besitzt Integrationsprofil` | PROPOSED `KI + PH; CURRENT bis separat freigegebenem Retire erhalten` | PROPOSED `K; H für lokales Profil` | PROPOSED `KI` | PROPOSED `PH` | PROPOSED `KR` | PROPOSED `KE; HESTIA-Projektevidence` | N/A | DELETE_AFTER_PROOF | PROPOSED Calls auf gepinntes HESTIA-kompatibles Profil; abweichende Semantik vor Cutover prüfen | PROPOSED W3-H; Retire frühestens W7-H | PROPOSED BH/B7H | OD-04/05/06/08/10 |
| PROJECT_LOCAL_SENSOR_COPY | `hestia-sensor-copy` | HESTIA | `C:\Users\steph\Projekte\H.E.S.T.I.A\tools\codex-usage\GetCodexUsage.ps1` | PROPOSED `KASRKIN_INSTALLATION; HESTIA besitzt Integrationsprofil` | PROPOSED `KI + PH; CURRENT bis separat freigegebenem Retire erhalten` | PROPOSED `K; H für lokales Profil` | PROPOSED `KI` | PROPOSED `PH` | PROPOSED `KR` | PROPOSED `KE; HESTIA-Projektevidence` | N/A | DELETE_AFTER_PROOF | PROPOSED Calls auf gepinntes HESTIA-kompatibles Profil; abweichende Semantik vor Cutover prüfen | PROPOSED W3-H; Retire frühestens W7-H | PROPOSED BH/B7H | OD-04/05/06/08/10 |
| PROJECT_LOCAL_VALIDATOR_COPY | `hestia-validator-copy` | HESTIA | `C:\Users\steph\Projekte\H.E.S.T.I.A\tools\codex-usage\Test-CodexUsageState.ps1` | PROPOSED `KASRKIN_INSTALLATION; HESTIA besitzt Integrationsprofil` | PROPOSED `KI + PH; CURRENT bis separat freigegebenem Retire erhalten` | PROPOSED `K; H für lokales Profil` | PROPOSED `KI` | PROPOSED `PH` | PROPOSED `KR` | PROPOSED `KE; HESTIA-Projektevidence` | N/A | DELETE_AFTER_PROOF | PROPOSED Calls auf gepinntes HESTIA-kompatibles Profil; abweichende Semantik vor Cutover prüfen | PROPOSED W3-H; Retire frühestens W7-H | PROPOSED BH/B7H | OD-04/05/06/08/10 |
| PROJECT_IGNORE_CONSUMER | `hestia-gitignore` | HESTIA | `C:\Users\steph\Projekte\H.E.S.T.I.A\.gitignore` | PROPOSED `HESTIA` | PROPOSED `CURRENT` | PROPOSED `H` | N/A | PROPOSED `PH` | N/A | N/A | N/A | REWRITE_REFERENCE | PROPOSED obsolete Ignore-Regeln erst nach lokalem Retire-Proof | PROPOSED W7-H | PROPOSED B7H | OD-05/06/10 |
| PROJECT_ENVIRONMENT_DOCUMENT | `hd2-dev-environment` | HD2_MOD_UPDATER | `C:\Users\steph\Projekte\Game Mods\HD2 Modding\HD2 Mod Updater\docs\DEV_ENVIRONMENT.md` | PROPOSED `CURRENT_OWNER` | PROPOSED `CURRENT; kein bewiesener Movebedarf` | N/A | N/A | N/A | N/A | N/A | N/A | REMAIN | PROPOSED keiner; Desktoppapiere sind keine aktiven Governancequellen | PROPOSED keine; Designinput bei W1/W6 | PROPOSED keine Mutation | OD-03/09 |
| MODULE_OVERVIEW | `argus-overview` | ARGUS_PILOT | `C:\Users\steph\Projekte\M.I.D.A.S\docs\modules\A.R.G.U.S. Module Overview.md` | PROPOSED `ARGUS_PILOT_ARCHIVE` | PROPOSED `PA/origins/MIDAS/<relativ zum MIDAS-Root>` | PROPOSED `historische MIDAS-Provenance; kein aktiver Source-Import` | N/A | N/A | N/A | N/A | PROPOSED `PA` | MOVE | PROPOSED nur neuer Index/Provenance-Navigation; keinerlei historische Payload-Rewrites | PROPOSED W4; Altpfadretire W7 | PROPOSED B4/B7 | OD-07/08/10 |
| FROZEN_CAMPAIGN_DOCUMENT | `argus-campaign-document` | ARGUS_PILOT | `C:\Users\steph\Projekte\M.I.D.A.S\docs\Codex Model Benchmark V1 Campaign.md` | PROPOSED `ARGUS_PILOT_ARCHIVE` | PROPOSED `PA/origins/MIDAS/<relativ zum MIDAS-Root>` | PROPOSED `historische MIDAS-Provenance; kein aktiver Source-Import` | N/A | N/A | N/A | N/A | PROPOSED `PA` | PRESERVE_HISTORICAL | PROPOSED nur neuer Index/Provenance-Navigation; keinerlei historische Payload-Rewrites | PROPOSED W4; Altpfadretire W7 | PROPOSED B4/B7 | OD-07/08/10 |
| PILOT_CLOSURE_EVIDENCE | `argus-pilot-closure` | ARGUS_PILOT | `C:\Users\steph\Projekte\M.I.D.A.S\docs\benchmark\codex-model-benchmark-v1\pilot-closure.json` | PROPOSED `ARGUS_PILOT_ARCHIVE` | PROPOSED `PA/origins/MIDAS/<relativ zum MIDAS-Root>` | PROPOSED `historische MIDAS-Provenance; kein aktiver Source-Import` | N/A | N/A | N/A | N/A | PROPOSED `PA` | PRESERVE_HISTORICAL | PROPOSED nur neuer Index/Provenance-Navigation; keinerlei historische Payload-Rewrites | PROPOSED W4; Altpfadretire W7 | PROPOSED B4/B7 | OD-07/08/10 |
| FROZEN_CAMPAIGN_MANIFEST | `argus-campaign-manifest` | ARGUS_PILOT | `C:\Users\steph\Projekte\M.I.D.A.S\docs\benchmark\codex-model-benchmark-v1\campaign-manifest.json` | PROPOSED `ARGUS_PILOT_ARCHIVE` | PROPOSED `PA/origins/MIDAS/<relativ zum MIDAS-Root>` | PROPOSED `historische MIDAS-Provenance; kein aktiver Source-Import` | N/A | N/A | N/A | N/A | PROPOSED `PA` | PRESERVE_HISTORICAL | PROPOSED nur neuer Index/Provenance-Navigation; keinerlei historische Payload-Rewrites | PROPOSED W4; Altpfadretire W7 | PROPOSED B4/B7 | OD-07/08/10 |
| CLOSED_PILOT_SOURCE_AND_EVIDENCE_TREE | `argus-benchmark-root` | ARGUS_PILOT | `C:\Users\steph\Projekte\M.I.D.A.S\docs\benchmark\codex-model-benchmark-v1` | PROPOSED `ARGUS_PILOT_ARCHIVE` | PROPOSED `PA/origins/MIDAS/<relativ zum MIDAS-Root>` | PROPOSED `historische MIDAS-Provenance; kein aktiver Source-Import` | N/A | N/A | N/A | N/A | PROPOSED `PA` | PRESERVE_HISTORICAL | PROPOSED nur neuer Index/Provenance-Navigation; keinerlei historische Payload-Rewrites | PROPOSED W4; Altpfadretire W7 | PROPOSED B4/B7 | OD-07/08/10 |
| FROZEN_RUN_VISIBLE_BUNDLE | `argus-run-bundle` | ARGUS_PILOT | `C:\Users\steph\Projekte\M.I.D.A.S\docs\benchmark\codex-model-benchmark-v1\run-bundle` | PROPOSED `ARGUS_PILOT_ARCHIVE` | PROPOSED `PA/origins/MIDAS/<relativ zum MIDAS-Root>` | PROPOSED `historische MIDAS-Provenance; kein aktiver Source-Import` | N/A | N/A | N/A | N/A | PROPOSED `PA` | PRESERVE_HISTORICAL | PROPOSED nur neuer Index/Provenance-Navigation; keinerlei historische Payload-Rewrites | PROPOSED W4; Altpfadretire W7 | PROPOSED B4/B7 | OD-07/08/10 |
| PILOT_ORCHESTRATOR_AND_SCHEMAS | `argus-orchestrator` | ARGUS_PILOT | `C:\Users\steph\Projekte\M.I.D.A.S\docs\benchmark\codex-model-benchmark-v1\orchestrator` | PROPOSED `ARGUS_PILOT_ARCHIVE` | PROPOSED `PA/origins/MIDAS/<relativ zum MIDAS-Root>` | PROPOSED `historische MIDAS-Provenance; kein aktiver Source-Import` | N/A | N/A | N/A | N/A | PROPOSED `PA` | PRESERVE_HISTORICAL | PROPOSED nur neuer Index/Provenance-Navigation; keinerlei historische Payload-Rewrites | PROPOSED W4; Altpfadretire W7 | PROPOSED B4/B7 | OD-07/08/10 |
| PILOT_OPERATOR_TOOLING | `argus-operator-tools` | ARGUS_PILOT | `C:\Users\steph\Projekte\M.I.D.A.S\docs\benchmark\codex-model-benchmark-v1\operator-tools` | PROPOSED `ARGUS_PILOT_ARCHIVE` | PROPOSED `PA/origins/MIDAS/<relativ zum MIDAS-Root>` | PROPOSED `historische MIDAS-Provenance; kein aktiver Source-Import` | N/A | N/A | N/A | N/A | PROPOSED `PA` | PRESERVE_HISTORICAL | PROPOSED nur neuer Index/Provenance-Navigation; keinerlei historische Payload-Rewrites | PROPOSED W4; Altpfadretire W7 | PROPOSED B4/B7 | OD-07/08/10 |
| PILOT_EVALUATOR | `argus-evaluator` | ARGUS_PILOT | `C:\Users\steph\Projekte\M.I.D.A.S\docs\benchmark\codex-model-benchmark-v1\evaluator` | PROPOSED `ARGUS_PILOT_ARCHIVE` | PROPOSED `PA/origins/MIDAS/<relativ zum MIDAS-Root>` | PROPOSED `historische MIDAS-Provenance; kein aktiver Source-Import` | N/A | N/A | N/A | N/A | PROPOSED `PA` | PRESERVE_HISTORICAL | PROPOSED nur neuer Index/Provenance-Navigation; keinerlei historische Payload-Rewrites | PROPOSED W4; Altpfadretire W7 | PROPOSED B4/B7 | OD-07/08/10 |
| STANDALONE_PILOT_OPERATOR_CONSOLE | `argus-console` | ARGUS_PILOT | `C:\Users\steph\Projekte\argus-operator-console.html` | PROPOSED `ARGUS_PILOT_ARCHIVE` | PROPOSED `PA/origins/Projects/argus-operator-console.html` | N/A | N/A | N/A | N/A | N/A | PROPOSED `PA` | DECIDE_IN_EXTRACTION | PROPOSED Console inaktiv bytegleich archivieren; nur neue Indexnavigation; keine V1-Wiederverwendung | PROPOSED W4; Altpfadretire W7 | PROPOSED B4/B7 | OD-07/08/10 |
| PILOT_STAGE_ROOT | `argus-stage-root` | ARGUS_PILOT | `C:\Users\steph\ARGUS-RUN-STAGES` | PROPOSED `ARGUS_PILOT_ARCHIVE` | PROPOSED `PA/origins/ARGUS-RUN-STAGES/<ursprünglicher relativer Pfad>` | N/A | N/A | N/A | N/A | N/A | PROPOSED `PA` | PRESERVE_HISTORICAL | PROPOSED nur Provenanceindex; keine Stage-Reaktivierung oder Fingerprintanpassung | PROPOSED W4; Altpfadretire W7 | PROPOSED B4/B7 | OD-06/07/08/10 |
| PILOT_RUNTIME_EVIDENCE_ROOT | `argus-evidence-root` | ARGUS_PILOT | `C:\Users\steph\ARGUS-RUN-EVIDENCE` | PROPOSED `ARGUS_PILOT_ARCHIVE` | PROPOSED `PA/origins/ARGUS-RUN-EVIDENCE/<ursprünglicher relativer Pfad>` | N/A | N/A | N/A | N/A | PROPOSED `historische Evidence im Archiv PA; nicht neue Runtime` | PROPOSED `PA` | PRESERVE_HISTORICAL | PROPOSED nur Provenanceindex; historische Daten bytegleich | PROPOSED W4; Altpfadretire W7 | PROPOSED B4/B7 | OD-06/07/08/10 |
| CODEX_SESSION_PROVENANCE | `argus-run01-archived-session` | CODEX_RUNTIME | `C:\Users\steph\.codex\archived_sessions\rollout-2026-09-12T19-33-05-01a096ae-1267-7a13-8372-04b6f52ea6c8.jsonl` | PROPOSED `CURRENT_OWNER` | PROPOSED `CURRENT; EXTERNAL_DO_NOT_TOUCH` | N/A | N/A | N/A | N/A | N/A | N/A | EXTERNAL_DO_NOT_TOUCH | PROPOSED keiner; Session nur externer Provenanceverweis | PROPOSED keine | PROPOSED keine Mutation | keine; feste Ausschlussgrenze |
| CODEX_OWNED_RUNTIME_ROOT | `codex-session-root` | CODEX_RUNTIME | `C:\Users\steph\.codex` | PROPOSED `CURRENT_OWNER` | PROPOSED `CURRENT; EXTERNAL_DO_NOT_TOUCH` | N/A | N/A | N/A | N/A | N/A | N/A | EXTERNAL_DO_NOT_TOUCH | PROPOSED keiner; Session nur externer Provenanceverweis | PROPOSED keine | PROPOSED keine Mutation | keine; feste Ausschlussgrenze |
| GLOBAL_AGENT_BOOTSTRAP | `global-codex-agents` | CODEX_RUNTIME | `C:\Users\steph\.codex\AGENTS.md` | PROPOSED `CURRENT_OWNER` | PROPOSED `CURRENT; EXTERNAL_DO_NOT_TOUCH` | N/A | N/A | N/A | N/A | N/A | N/A | EXTERNAL_DO_NOT_TOUCH | PROPOSED keiner; Session nur externer Provenanceverweis | PROPOSED keine | PROPOSED keine Mutation | keine; feste Ausschlussgrenze |
| ARCHITECTURE_DESIGN_INPUT | `architecture-original-workflow` | OWNER_DESKTOP | `C:\Users\steph\Desktop\Zentraler Codex-Workflow fÃ¼r Stephan Projekte.md` | PROPOSED `CURRENT_OWNER` | PROPOSED `CURRENT; kein bewiesener Movebedarf` | N/A | N/A | N/A | N/A | N/A | N/A | DECIDE_IN_EXTRACTION | PROPOSED keiner; Desktoppapiere sind keine aktiven Governancequellen | PROPOSED keine; Designinput bei W1/W6 | PROPOSED keine Mutation | OD-03/09 |
| ARCHITECTURE_DESIGN_INPUT | `architecture-newer-workspace-pitch` | OWNER_DESKTOP | `C:\Users\steph\Desktop\Pitch Stephans Development Worksp.md` | PROPOSED `CURRENT_OWNER` | PROPOSED `CURRENT; kein bewiesener Movebedarf` | N/A | N/A | N/A | N/A | N/A | N/A | DECIDE_IN_EXTRACTION | PROPOSED keiner; Desktoppapiere sind keine aktiven Governancequellen | PROPOSED keine; Designinput bei W1/W6 | PROPOSED keine Mutation | OD-03/09 |

<!-- markdownlint-enable MD013 -->

### 16.1 Ergänzende W0-Klassen außerhalb eigener Inventory-Zeilen

Das W0-Register hat für diese bereits belegten Quellen beziehungsweise künftigen
Rollen keine eigene ID. Sie erhalten hier ausdrücklich keine erfundene Inventory-ID.

| Logical Source / W0-Beleg | Current Location und Owner | PROPOSED Ziel und Rollen | Disposition / Rewrite / Wave / Rollback / OD |
| --- | --- | --- | --- |
| Guard-DONE-Roadmap und Evidence; W0-Evidence Abschnitt 4/9 | MIDAS: `docs/archive/Codex Usage Guard vNext Rolling-Wave Roadmap (DONE).md` und `docs/archive/Codex Usage Guard vNext Rolling-Wave Evidence (DONE).md` | `PROPOSED` gleicher MIDAS-Owner und Pfad; Sourcehistorie/Evidence/Archive bei M; Installation/Runtime/Integration N/A | `PRESERVE_HISTORICAL`; `PROPOSED` nur externe Provenancereferenz in W3/W6; keine Mutation; OD-08 |
| Neues ARGUS V1.0; OD-02 im W0-Register | keine bestehende Source oder Installation | `PROPOSED ARGUS_V1`; Source `PROPOSED C:\Users\steph\Projekte\argus`; Installation noch nicht entworfen; Integration `PROPOSED` eigener Produktvertrag; Runtime/Evidence gemäß OD-06; Historical Archive nur Referenz auf PA | `PROPOSED` nur W5-Handoff, keine Implementierung; B5; OD-02/06/07/09 |
| Neue KASRKIN-Release-/Install-/Projektreceipts; W0-Targets OD-04/05 | noch nicht vorhanden; Vorläufer `kasrkin-activation` | `PROPOSED` K für Releasequelle, KI für Installation, PM/PH für Projektbindung, KE für Toolproof; Archive N/A | `PROPOSED` Neuartefakte erst ownerfreigegeben in W3; BS/BI/BM/BH; OD-04/05/08 |

Der historische ARGUS-Helper bleibt als eingefrorener Consumerverweis im Archiv,
nicht als aktiver Consumer des neuen Commands. Sein relativer MIDAS-Pfad wird
nicht „repariert“. Die neue Indexnavigation beschreibt, wie alte Pfade zu
Archivpayloads aufgelöst werden; sie simuliert keine historische Runtime.

## 17. DRAFT Migration Sequence

Gesamtstatus `DRAFT / RECOMMENDED`; sämtliche folgenden Ausführungsverträge
sind `PROPOSED`. Keine Wave ist mit diesem Packet freigegeben. Nach
Ownerentscheidungen muss eine spätere W1-Targetfreigabe den gewählten Entwurf
fingerprintgebunden festhalten. Jede Ausführungswave erhält dann ihr eigenes
Usage-/Scope-/Owner-Gate und überprüfbares Preimage.

| Reihenfolge / Wave | PROPOSED Schritte und Reference-Rewrite-Reihenfolge | PROPOSED Zwischenzustand und Proof Gate |
| --- | --- | --- |
| 1 / W2 | Bewussten Verbleib der Shared-Quellen bei den bestehenden Projekten dokumentieren. Kein Repository, kein Contractsplit. | Ownerentscheid OD-03 und W1-Freigabe; keine technische Foundationänderung erforderlich. B2. |
| 2 / W3-S | KASRKIN-Source aus freigegebenem Dirty-Preimage manifestgebunden in K importieren, Ursprungspfade/HEAD/Dateihashes erfassen; Releaseidentität und Payload erstellen. Zuerst sourceinterne Auflösung und Releasebindungen vorbereiten. | Alter MIDAS-Tree bleibt aktive Quelle; neuer Stand ist Kandidat. Vollständigkeit, Parser-/Regression-/Contracttests und Provenance-Rekonstruktion beweisen. BS. |
| 3 / W3-I | Versionspayload nach KI installieren, Installreceipt erzeugen und Resolver separat beweisen. Sensor und State bleiben am Altpfad byte-/vertragsgleich; keinen zweiten Refreshwriter aktivieren. | Altinstallation/Altconsumer laufen weiter. Command aus fremdem CWD, expliziter Projektpin, Hashprüfung, Validatorprofil, Status/Exitcode und Fehlerfälle grün; Aufruf bis tatsächlichem State belegen. BI. |
| 4 / W3-M | Nur MIDAS: Projektlock und Adapter/Activation vorbereiten. Danach minimal aktive Aufrufstellen in DEV_ENVIRONMENT/Workflow/AGENTS binden, betroffene Fingerprints zuletzt neu schließen. Kein semantischer Shared-Split. | MIDAS nutzt bewiesenen Payload; HESTIA unverändert. Reale kanonische Invocation → Resolver → Pin/Hash → Refresh → State → Validator → gültige Envelope und Guardkonsultation beweisen. BM. |
| 5 / W3-H | Separat HESTIA: eigene Validator-/Workflowabweichungen lesen, kompatibles Profil beweisen, eigenen Lock setzen, nur dessen Aufrufe binden. Keine Übernahme von MIDAS-Grenzwerten ohne eigenen Vertrag. | MIDAS bleibt grün, HESTIA kann bei Fehlschlag vollständig auf Altstand bleiben. Eigenes Ende-zu-Ende-Orakel einschließlich Fehler-/Driftfällen; kein gemeinsamer Repo-Rollback. BH. |
| 6 / W4 | Pilotpayloads zuerst parallel nach PA archivieren: Campaign/Benchmarktree, Overview, Console, Stage- und Evidence-Roots mit Herkunftsnamespaces. Danach neuen Provenanceindex und aktuelle Navigation vorbereiten. Historische Links/Bytes nicht ändern. | Beide Ablagen existieren parallel. W0-/Preimage-Digests, Dateizahlen, Herkunftspfadzuordnung, Indexnavigation, Lesbarkeit und Wiederherstellbarkeit grün. .codex bleibt externe Referenz. B4. |
| 7 / W5 | Nach Archivproof lediglich Handoff für eigene ARGUS-V1-Roadmap: Pilotstatus, bewahrte Invarianten, Codex-only, keine bezahlte Modell-API, eigener Lifecycle. | Kein V1-Root, kein Code und kein Benchmarkrun durch diese Wave. Separater Ownerauftrag nötig. B5. |
| 8 / W6-M | Erst jetzt MIDAS-Verträge semantisch bereinigen: eine KASRKIN-Detailquelle und projektspezifische Konsultation eindeutig binden; Tool-/Produktnavigation nachführen. Neue Bindungen prüfen, dann aktive Verweise konsistent umstellen. | Alte vollständige Verträge als Rollbackpreimage sichern, keine zweite aktive Semantik. Aktivierungs-, Link-, Consumer- und Gleichwertigkeitsnachweise grün. B6M. |
| 9 / W6-H | HESTIA unabhängig mit eigenem Profil/Workflowvertrag bereinigen; Templateverweise und Projektdokumentation nachführen. | Kein Zwang zum gleichzeitigen MIDAS-Update. Eigene Vertrags-/Activation-/Consumerproofs grün. B6H. |
| 10 / W7 | Exaktes kandidatenbezogenes Retire-Manifest erstellen. Erst nach expliziter Lösch-/Retirefreigabe alte KASRKIN-Kopien und Pilotaltablagen einzeln behandeln; Ignore-/Navigationsreste danach prüfen. | Alle betroffenen Consumer grün, Wiederherstellung bewiesen, keine aktiven Altpfadabhängigkeiten, historischer Inhalt geschützt. B7/B7H. Ohne Freigabe bleiben alte Dateien liegen. |

„Move-Reihenfolge“ ist damit: sichere Parallelquelle → Installation →
einzelner Consumer → Archivkopie/Proof → aktive Navigation → eigener
freigegebener Retire. Kein Copy-/Move-Schritt wird jetzt ausgeführt.
Innerhalb eines aktiven Consumerwechsels gehören Aufruf, Lock, Profil und
Fingerprintbindung zur selben projektlokalen Transaktion.

### 17.1 Verbindlich zu beweisende spätere Consumerketten

Diese Orakel sind `PROPOSED`, keine bereits ausgeführten Tests:

- **MIDAS:** dokumentierter Operator-/Agentenaufruf erreicht tatsächlich den
  aktiven Resolver, den MIDAS-Pin, den erwarteten Validator und den bestehenden
  Refresh-/Statepfad; Schema, Exitcode, Freshness und Hashdrift verhalten sich
  vertragsgleich. Eine erfolgreiche Payload-Unit-Test-Suite ersetzt das nicht.
- **HESTIA:** dieselbe echte Aufrufkette mit dessen eigener Ausgabe-/Fehler-
  und Workflowsemantik. Abweichungen werden vor dem Cutover explizit
  klassifiziert; gemeinsamer Sensor darf Alt-/Neuleser nicht brechen.
- **Rainmeter:** vorhandener Einstieg/Sensor und dessen einziger Statewriter
  bleiben nachweisbar erreichbar; keine ungeplante Sensorinstallation.
- **Historischer ARGUS-Pilot:** Lesbarkeit, Hashidentität und Navigation sind
  das Orakel. Der eingefrorene Operatorpfad wird nicht ausgeführt. Alle 21
  W0-Kanten bleiben nachvollziehbar; historische Laufzeitkanten werden
  ausdrücklich inaktiv, nicht als neue funktionale Abhängigkeit übernommen.

W3 ist abgeschlossen erst nach Source-, Installation- und beiden unabhängigen
Consumerproofs. Ein grünes W3-M darf bestehen bleiben, während W3-H pausiert;
W6-H und HESTIA-Retire bleiben dann gesperrt. W4 braucht keine neue ARGUS-
Produktimplementierung. W5 wartet auf W4. Ein späterer Namenswechsel ist
kein Teil dieser funktionalen Sequenz.

## 18. DRAFT Rollback Plan

Alle Grenzen und Abläufe sind `PROPOSED / RECOMMENDED`.
Vor jeder späteren Mutation werden Preimagebytes, Pfade, Konfiguration,
Projekt-HEAD UND Dirty-Dateien sowie erforderliche Restoremedien gebunden.
Historische Evidence wird niemals zurückgeschrieben oder „korrigiert“.

| Boundary / Wave | Preimage | Neue/temporäre Parallelstruktur | Abbruchkriterium | Minimale sichere Postcondition | Reverse-Schritte | Consumer-/Pfadchecks | Wann Altstand nicht mehr als Rollback benötigt wird |
| --- | --- | --- | --- | --- | --- | --- | --- |
| B2 / W2 | freigegebene W1-Entscheidung, unveränderte Projektverträge | ausschließlich neuer Entscheidungsrecord | unbewiesener Shared-Owner oder vorgezogener Rewrite | aktive Verträge unverändert | neuen Record als zurückgezogen ergänzen, keine alte Evidence ändern | W0-Quellen/Links unverändert | W2 hat keinen zu löschenden Runtimealtstand |
| BS / W3-S | kompletter MIDAS-KASRKIN-Tree, Dokumentation, Hashmanifest, HEAD plus Dirty-Stand | neuer Sourcekandidat und Release; Altquelle weiter aktiv | Import-, Hash-, Umfangs- oder Regressionfehler | alle alten Consumer weiter funktionsfähig; Kandidat nicht aktiv | Kandidatenbindung deaktivieren; Altquelle beibehalten; Kandidat nicht ungefragt löschen | Altvalidator und gebundene Verträge/Quelle erreichbar | beide Consumer, Installation, Release-Restore und W6-Proofs grün; Retire erst W7 mit Freigabe |
| BI / W3-I | bisherige Commandauflösung, Sensorkopie/Statevertrag und Installkonfiguration | versionierter Payload plus noch nicht produktiver Resolver | falsche Version, Shadowing, geänderter Writer, unzulässiges Fallback | Altaufrufe und einziger Statewriter funktionieren | Resolver-/PATH-/Shimänderung aus Preimage zurücknehmen; alten Einstieg wiederbinden; neuen Payload inaktiv lassen | Aufruf aus tatsächlichem Kontext, Sensorhash, genau ein Writer, alte Validatoren lesen gültigen State | Releaseinstallation und Wiederherstellung plus beide Consumerproofs; kein vorzeitiges Payloadretire |
| BM / W3-M | MIDAS-Aufrufstellen, Lock/Adapterzustand, Activation und Vertragsbytes; alter Tree | MIDAS-Neubindung; HESTIA komplett alt | reale Kette oder Hash-/Semantiknachweis scheitert | MIDAS wieder vollständig am alten funktionierenden Einstieg; HESTIA unverändert | MIDAS-Lock/Adapter/Aufrufe und Activation gemeinsam aus Preimage zurücksetzen; Altpfad nutzen | echte MIDAS-Kette bis gültiger Envelope, Fingerprints, HESTIA-Bindung unverändert | W3-M/W6-M grün und MIDAS-Restoreübung erfolgreich; alter gemeinsamer Source erst nach HESTIA-Proof freigebbar |
| BH / W3-H | HESTIA eigener Validator, Sensor, Verträge, Ignore-/Lockzustand | HESTIA-Neubindung neben bereits grünem MIDAS | Profil-/Workflowabweichung ungeklärt oder echte Invocation scheitert | HESTIA alt funktional, MIDAS grün unverändert | nur HESTIA-Verträge, Pin, Adapter und Aufrufe zurücksetzen; keinen MIDAS-Rollback auslösen | HESTIA-Ende-zu-Ende-Orakel, eigener Fehlervertrag, gemeinsamer Sensor kompatibel, MIDAS-Pin unverändert | HESTIA-W3/W6 und Restoreprobe grün; dann eigene W7-H-Freigabe |
| B4 / W4 | alle historischen Payloads/Hashes, externe Stage-/Evidence-Inventare und ursprüngliche Navigation | PA mit bytegleichen Payloads plus neuem separaten Index; Originale bleiben | Byte-/Mengenabweichung, fehlende Herkunft, defekte Navigation oder fehlender Restoreproof | vollständige Originale weiterhin lesbar; keine falsche Archivfreigabe | neue aktive Navigation auf Altziele zurücksetzen; fehlerhaften Archivkandidaten inaktiv kennzeichnen; keine historischen Bytes ändern | alle Archivklassen und externen Provenanceverweise auflösbar; keine Console-/Runausführung | vollständiger Archiv-/Index-/Restore-/Backupproof plus W5-Handoff und separate Altpfadfreigabe; Originalbytes bleiben im Archiv erhalten |
| B5 / W5 | grün bewiesenes Archiv und offene V1-Produktgrenzen | nur Handoffdokumentation | Handoff suggeriert vollständigen Pilot oder autorisierte V1-Umsetzung | Archiv bleibt grün; kein neues Produkt begonnen | Handoff additiv korrigieren/zurückziehen; Archiv nicht ändern | Archivlinks, Closed-Incomplete-Status, Codex-only und API-Grenze | kein Runtimealtstand; Archiv bleibt dauerhaft Provenance |
| B6M / W6-M | komplette MIDAS-Vertrags-/Activationbytes des grünen W3-M | neue lokale Konsultationsverträge und gepinnte Tooldetailquelle | doppelte Semantik, neue Lücke, Activation-/Consumerfehler | grüner W3-M mit ursprünglichem lokalem Vertrag wieder aktiv | alle MIDAS-Verträge und Hashbindungen gemeinsam aus Preimage wiederherstellen | Normativitätskette, Links, Pin/Activation und reale MIDAS-Invocation | neue Governancekette und Restoreprobe grün; historisches Preimage nicht vernichten |
| B6H / W6-H | HESTIA-eigener grüner Vertrags-/Profilstand | bereinigte eigene Workflow-/Templatebindungen | Verlust eigener Semantik oder implizite MIDAS-Kopplung | HESTIA grüner Vorzustand; MIDAS unberührt | nur HESTIA-Vertrags-/Profilbindungen zurücksetzen | eigene Konsultation, Profil, Links und tatsächlicher Einstieg | HESTIA-spezifischer Proof plus Restoreprobe; keine globale Rollbackfreigabe |
| B7/B7H / W7 | exakt freigegebenes kandidatenbezogenes Retiremanifest; wiederherstellbare Bytes und ursprüngliche Pfade | neue Source/Installation/Archive vollständig vorhanden; Altbestand zunächst noch da | aktiver Altpfadconsumer, fehlendes Backup, Hashdrift oder fehlende Löschfreigabe | kein unersetzlicher Inhalt entfernt; alle Consumer funktionsfähig | bei bereits freigegebenem Retire betroffene Bytes aus verifiziertem Restorepreimage an geprüfte Originalpfade zurückstellen; lokale Referenzen zurückbinden | projektspezifische echte Ketten, Altpfadscan mit historischen Ausnahmen, Archivhashes/Links, unveränderte Drittsoftware | eindeutiger Retireproof pro Kandidat plus ausdrückliche Freigabe; historischer Payload bleibt dauerhaft erhalten |

Eine spätere gescheiterte produktive Probe endet zuerst mit Reverse und
Postchecks. Ursachenanalyse ist ein neuer Block mit eigenem Usage-Gate.
Alte und neue Source-/Payloadstrukturen dürfen zeitweise parallel existieren;
zwei konkurrierende aktive Statewriter oder Governanceautoritäten dürfen es
nicht. `DELETE_AFTER_PROOF` bleibt ausschließlich Planungsdisposition.

## 19. Entscheidungskarte für den Owner

Alle zehn Detailfragen stehen in Abschnitt 14; eine Zustimmung muss die
gewählten Optionen beziehungsweise Abweichungen ausdrücklich benennen.
Vorschläge dürfen einzeln angenommen, geändert oder bei dafür vorgesehenen
späteren Details ausdrücklich vertagt werden. Ein Schweigen bestätigt nichts.

| ID | RECOMMENDED Vorschlag — alle Zielwerte PROPOSED | Noch offener Ownerpunkt |
| --- | --- | --- |
| OD-01 | eigener Source-Root K | exakter absoluter Root |
| OD-02 | eigener späterer ARGUS-Root | vorgeschlagener Root oder ausdrücklich vorläufig |
| OD-03 | projektlokal versionierte Workflows; kein neues Shared-Repo | bewusster Verbleib und spätere Bedarfsschwelle |
| OD-04 | installierter versionsgebundener Command | Command-/Adapterform und Installationscontract |
| OD-05 | Projektlock plus Installreceipt, explizite Updates | Pinning-/Updatevertrag |
| OD-06 | W3-Statepfad behalten; Tool-Evidence getrennt | Etappierung und spätere Runtime-Details |
| OD-07 | separates unveränderliches Pilotarchiv PA | Archivziel und Archivrolle |
| OD-08 | Provenance-Import mit Dirty-Manifest | Verzicht auf native Alt-Blame-Historie oder selektiver Export |
| OD-09 | neue Namen kasrkin/argus; alte Namen behalten | exaktes Casing, keine Produktrenames |
| OD-10 | Source → Installation → MIDAS → HESTIA → Archiv → Handoff → Workflow → Retire | Reihenfolge und getrennte Transaktionen |

## 20. Aktuelle W1-Statusmatrix und Resume Card

Dieser Abschnitt ist der neue Decision-Gate-Fortsetzungsstand.
Alle früheren W0-Statusangaben bleiben als historischer Stand bytegleich.

| Bereich | Aktueller belegter Zustand | Nächstes Gate |
| --- | --- | --- |
| W0 | W0_COMPLETE; unveränderte Evidence | keines |
| W1 Decision Packet | W1_DECISION_PACKET_READY | Ownerfragen OD-01 bis OD-10 |
| Target Map | TARGET_MAP_DRAFT_READY | Ownerentscheid und spätere verbindliche Targetfreigabe |
| Migration Sequence | MIGRATION_SEQUENCE_DRAFT_READY | Ownerentscheid; spätere wavebezogene Ausführungsgates |
| Rollback Plan | ROLLBACK_PLAN_DRAFT_READY | konkrete Preimages/Restoreproofs vor Ausführung |
| W1 insgesamt | W1_NOT_COMPLETE | OWNER_DECISION_REQUIRED |
| Dateien/Verträge | NO_FILES_MOVED / NO_ACTIVE_CONTRACT_REWRITTEN | keine Migration autorisiert |
| W2 | W2_NOT_STARTED | spätere ownerfreigegebene W1-Target Map |

**Resume Card**

- Aktiver Scope: ausschließlich das abgeschlossene dokumentarische
  Decision Packet; W1 als Entscheidungs-/Freigabewave bleibt unvollständig.
- Quellen: W0-Inventar weiterhin read-only; 50 IDs/21 Kanten; neue Evidence
  ausschließlich im abgegrenzten W1-Abschnitt der Evidence-Datei.
- Letzte blockzulassende Messung: `2026-09-13T17:02:00.2549619+02:00`,
  `83 % / 40 %`, Resets `1789329106 / 1789806057`,
  `CONTINUE / PRIMARY_ALLOWED`. Kein historisches Delta rekonstruiert.
- Finaler Refresh: erst nach sicherer Postcondition, Ergebnis nur im
  Abschlussbericht; keine Dateimutationen nach dieser Messung.
- Nächster exakt erlaubter fachlicher Schritt: Owner beantwortet OD-01 bis
  OD-10. Erst danach darf ein gesonderter Auftrag die verbindliche Target Map
  aus den gewählten Optionen ableiten; vor neuem Arbeitsblock frisches
  kanonisches Usage-Gate. Keine Empfehlung gilt automatisch als angenommen.
- Gesperrt: W1-Abschluss, Root-/Repoanlage, Source-/Runtime-/Archivmigration,
  Installation, Consumerwechsel, aktive Vertragsrewrites, W2 und spätere
  Ausführung, Commit/Push/Deploy sowie externe Writes.
- Kein erneutes breites W0-Discovery ohne konkrete Invalidation; Fingerprints
  und Read Receipt der W1-Evidence als gezielten Einstieg verwenden.

```text
W1_DECISION_PACKET_READY
TARGET_MAP_DRAFT_READY
MIGRATION_SEQUENCE_DRAFT_READY
ROLLBACK_PLAN_DRAFT_READY
OWNER_DECISION_REQUIRED
W1_NOT_COMPLETE
NO_FILES_MOVED
NO_ACTIVE_CONTRACT_REWRITTEN
W2_NOT_STARTED
```

`OWNER_DECISION_REQUIRED`
`STOP`

---

## 21. W1 Owner Decision Binding — verbindlicher Planungsstand

Status: `W1_COMPLETE / W2_NOT_STARTED / NEXT_WAVE_OWNER_AUTHORIZATION_REQUIRED`.

Dieser Abschnitt und die Abschnitte 22–26 sind der aktuelle gebundene
Planungsstand. Abschnitte 1–13 bleiben W0-Provenance; Abschnitte 14–20 bleiben
das ursprüngliche W1 Recommendation / Draft Packet. Dessen
`RECOMMENDED`-/`PROPOSED`-Aussagen und damalige Stops bleiben bytegleich
nachvollziehbar, sind jedoch keine offenen Entscheidungen des aktuellen W1.
Es gibt drei getrennte Ebenen: historischer Entwurf, ausdrückliche
Ownerentscheidung und daraus abgeleiteter ownergebundener Target State.

Die nachstehende Entscheidungstabelle ist zugleich das aktuelle Decision Log.
Receipt `W1-OD-BIND-01` bindet den ausdrücklichen Ownerauftrag
„W1 — OWNER DECISION BINDING + FINALIZATION“ an das bestehende Packet:
Roadmap-Preimage SHA-256
`73e549551d236c5b63673946834a44b3e5fa7f5412cacb1744af6bc99b2f4ccf`,
Evidence-Preimage SHA-256
`68af1ee97ecd15944d3c56079cfca75faaa1b3ff66e8578f0e28f57785c3d153`,
Inventory SHA-256
`d252e9bae2f2f0e6ef07d1d61c0fca7ffbd24cb4901ba41b0263a128dc359775`.

### 21.1 Ownerentscheidungen / Decision Log

| Decision ID | Status | Gebundene Ownerentscheidung |
| --- | --- | --- |
| OD-01 | OWNER_APPROVED | KASRKIN erhält einen eigenen Lifecycle und den Project Root `C:\Users\steph\Projekte\kasrkin`. |
| OD-02 | OWNER_APPROVED | Der spätere ARGUS-Project-Root ist `C:\Users\steph\Projekte\argus`. Der Pfad ist entschieden; Anlage von Repository/Projektstruktur ausschließlich im separat freigegebenen ARGUS-V1.0-Produktauftrag. |
| OD-03 | OWNER_APPROVED | Vorerst kein eigenes `codex-workflow`-Repository. Shared Workflow bleibt bei den bestehenden verantwortlichen Quellen, bis realer gemeinsamer Consumer-, Release- oder Lifecyclebedarf ein eigenes Repository rechtfertigt. |
| OD-04 | OWNER_APPROVED | Installierter, versionsgebundener Command `kasrkin`, unabhängig vom Source-Checkout. Dünne projektlokale Adapter nur bei nachgewiesenem Bedarf eines konkreten Consumers. |
| OD-05 | OWNER_APPROVED | Projektlock beziehungsweise explizite Versionsbindung, Installationsreceipt, validierbare Driftprüfung und ausdrücklich ausgelöste projektweise Updates. Keine automatische latest-Auflösung. |
| OD-06 | OWNER_APPROVED | Bestehender Rainmeter-Statepfad bleibt während W3; kein gleichzeitiger State-Move beim funktionalen Cutover. KASRKIN-Evidence getrennt und tool-owned. Möglicher späterer State-Move und konkrete ARGUS-V1.0-Runtime-/Evidence-Verträge: DEFERRED_TO_LATER_LIFECYCLE; keine offenen W1-Entscheidungen. |
| OD-07 | OWNER_APPROVED | Historisches Pilotarchiv `C:\Users\steph\Archives\ARGUS-PILOT\v1.2-v1.6`, unabhängig vom späteren ARGUS-Repository; historische fingerprintgebundene Evidence bytegleich. |
| OD-08 | OWNER_APPROVED | Nachweisbarer Provenance-Import mit Source-Herkunft, relevanter Source-Commit-Identität, erforderlichem Dirty-Dateimanifest, Fingerprints und Provenance-Receipts. ARGUS-Pilotartefakte bytegleich. Keine zusätzliche vollständige native alte Blame-Historie ohne nachgewiesenen konkreten technischen Bedarf. |
| OD-09 | OWNER_APPROVED | Neue technische Projekt-/Repository-Namen `kasrkin` und `argus`. Bestehende Produktnamen und bestehendes Casing anderer Projekte unverändert. Keine Repository-/Produktrenames gleichzeitig mit funktionalem Cutover. |
| OD-10 | OWNER_APPROVED | KASRKIN-Source → versionsgebundene Installation beweisen → MIDAS separat → HESTIA separat → historischen Pilot beweisbar archivieren → separater ARGUS-V1.0-Handoff → Shared-Workflow-Ownership/Referenzen bereinigen → nur nach Proof freigegebene Altartefakte bereinigen. Eigene Proof Gates/Rollbackfähigkeit pro Consumer; DELETE_AFTER_PROOF bleibt spätere beweispflichtige Disposition. |

### 21.2 Zulassung und Grenze

Ein vollständiger `BOUNDED_DOCUMENTATION)-Block: Bindung aller zehn ODs,
Target Map, Dependencies, Sequence, Rollback, Evidence und Abschlusschecks.
Gesamtumfang `large`; bekannte Quellen und zwei erlaubte Append-Ziele,
keine neue Discovery oder Produktumsetzung. Sichere Postcondition ist der
konsistente W1-Abschluss bei unveränderten Bestandsbytes und gesperrtem W2.

Frischer kanonischer Validator mit `-Refresh`:
`2026-09-13T21:53:08.0524958+02:00`, `valid=true / status=OK`,
5h `98 %`, Woche `31 %`, Resets `1789347189 / 1789806057`.
Budgetband `CONTINUE`; konkrete Zulassung `PRIMARY_ALLOWED`.
Die frühere Entwurfserstellung ist kein fachlich/operativ gleicher
Finalisierungsblock; keine numerische empirische Reserve daraus übertragen.
Vergleichbarer Finalisierungs-Cost-Receipt `NOT_ESTABLISHED`; Zulassung über
Band, begrenzte Writeflächen, Reversibilität und sichere Postcondition.
Keine Owner Boundary und keine künstliche Fragmentierung.

5h-Reset gegenüber dem früher dokumentierten Checkpoint:
`RESET_CROSSED`; kein Delta über diese Grenze. Frühere Prozentstände sind
keine aktuelle Baseline. Keine Restricted-Work-Sperre aus Chattext
rekonstruiert; `CONTINUE / PRIMARY_ALLOWED` begründet die reguläre Zulassung.
UI-/Runtime-Reasoning-Level `NOT_OBSERVABLE`, nicht verändert.

Ownerfreigabe für **Planungsentscheidungen und W1-Finalisierung**, nicht für
Migration. Kein Root, Repository, Payload, Adapter, Runtimepfad oder Archiv
wird angelegt. Keine aktive Referenz und kein Governancevertrag wird geändert.
W2 benötigt einen eigenen Ausführungsauftrag und ein neues Usage-Gate.

## 22. Ownergebundene Target Map

Status: `W1_TARGET_MAP_READY / OWNER_BOUND_PLAN`.
Die vollständige Map wird verlustfrei aus der ursprünglichen 17-Spalten-Map
in Abschnitt 16, den **ersetzenden Rollenverträgen hier** und der folgenden
50-ID-Bindung gebildet. Jede ID bezeichnet dieselbe Inventarzeile; Current Owner,
Current Location, Artefaktklasse und W0-Disposition werden unverändert
übernommen. Keine W0-Disposition ist eine Move-/Löschfreigabe.

Für alle sechs Zielrollen und alle Zielpfade gilt ausschließlich die folgende
aktuelle Auflösung; die früheren Aliasdefinitionen sind Entwurfsprovenance.
Die ID-Tabelle ersetzt je Zeile Target Owner/Location und bestätigt Wave,
Rollback Boundary und OD-Bindung. Die Reference-Rewrite-Pläne aus Abschnitt 16
bleiben technische Planungsanforderungen für die jeweilige spätere Wave,
mit der Einschränkung „Adapter nur bei konkretem Consumerbedarf“.
Keine aktuell gebundene, durch OD entschiedene Größe bleibt ein Vorschlag.

### 22.1 Rollenvertrag und bewusst spätere Details

| Rolle / Alias | Ownergebundener Target State | Nicht mitgenehmigte Detailwerte / zuständiger Lifecycle |
| --- | --- | --- |
| Source Repository M/H | MIDAS und HESTIA bleiben in ihren bestehenden Project Roots, Namen und eigener Projektownership | kein Renameauftrag |
| Source Repository K | KASRKIN; `C:\Users\steph\Projekte\kasrkin`; technischer Name `kasrkin`; Provenance-Import gemäß OD-08 | interne Source-/Dokumentablage: DEFERRED_TO_LATER_LIFECYCLE, KASRKIN-W3-Design vor Import |
| Installation KI | KASRKIN besitzt installierten versionsgebundenen Command `kasrkin`, unabhängig vom Checkout; Installationsreceipt und Driftprüfung verpflichtend | konkrete Installationsverzeichnisse, Payloadlayout, CLI-Details: DEFERRED_TO_LATER_LIFECYCLE, KASRKIN W3-I vor Installation |
| Project Integration PM/PH | je Projekt explizite Versionsbindung und eigenes Update; MIDAS-/HESTIA-Semantik getrennt; Adapter ausschließlich bei konkretem Bedarf | exakte Lock-/Adapterdateinamen und Schemaausgestaltung: DEFERRED_TO_LATER_LIFECYCLE, W3-I/M/H vor Consumerwechsel |
| Runtime KR | während W3 genau der bestehende Rainmeter-Statepfad `C:\Users\steph\Documents\Rainmeter\Skins\illustro\Tokens\UsageState.json`; kein gleichzeitiger State-Move | späterer State-Move: DEFERRED_TO_LATER_LIFECYCLE, eigener KASRKIN-Auftrag |
| Evidence KE | getrennte tool-owned KASRKIN-Evidence; projektlokale Roadmap-Evidence bleibt beim Projekt; keine Source-/Installationsrolle | konkreter Tool-Evidencepfad, Retention/Backup: DEFERRED_TO_LATER_LIFECYCLE, zuständiger KASRKIN-Auftrag vor Nutzung |
| Historical Archive PA | ARGUS_PILOT_ARCHIVE unter `C:\Users\steph\Archives\ARGUS-PILOT\v1.2-v1.6`; unabhängig vom neuen Produkt; Byteerhalt und Provenance | interne Archivablage/Index und Backupmedium: DEFERRED_TO_LATER_LIFECYCLE, W4 vor Archiv-/Restoreproof |
| Neues ARGUS V1.0 | eigener späterer Source-Root `C:\Users\steph\Projekte\argus`, technischer Name `argus`; kein Pilotfortsatz | Erstellung und sämtliche neuen Runtime-/Evidence-/Installationsverträge: DEFERRED_TO_LATER_LIFECYCLE, separater V1.0-Produktauftrag |
| CURRENT | unveränderter Current Location der betreffenden Inventory-ID | keine stillschweigende Zielanlage |
| N/A | unverändert nicht anwendbare Rolle aus Abschnitt 16 | keine implizite zusätzliche Kopie |

Insbesondere sind die alten Entwurfswerte `%LOCALAPPDATA%\KASRKIN\bin`,
`versions/<release-id>`, `.kasrkin/lock.json`,
`%LOCALAPPDATA%\KASRKIN\evidence` und die ARGUS-AppData-Pfade
**nicht** durch die Ownerentscheidung als konkrete Implementierungswerte
bestätigt. Sie bleiben ausschließlich historische Designvorschläge; die
jeweiligen aktuellen Details sind `DEFERRED_TO_LATER_LIFECYCLE`.
Der entschiedene ARGUS-Source-Root selbst ist hingegen ausdrücklich nicht vertagt.

### 22.2 Vollständige ID-Bindung

`OWNER_BOUND_PLAN` bestätigt Ownership, Zielrolle und Reihenfolge; konkrete
nachgelagerte Ausführung braucht weiterhin Preflight, Proof und Ownerauftrag.
Interne Pfadlayouts sind wie oben vertagt. Root-/Kind-Überlappungen bezeichnen
dieselben Bytes und erlauben keinen doppelten Import.

| Inventory ID | Gebundener Target Owner / Target Location Contract | Wave | Rollback Boundary | Ownerentscheidungen |
| --- | --- | --- | --- | --- |
| `repo-midas` | MIDAS; CURRENT | W7 | B7 | OD-09 |
| `repo-hestia` | HESTIA; CURRENT | W7 | B7 | OD-09 |
| `repo-g915-chatter-guard` | ORIGINAL_UPSTREAM_AUTHOR; CURRENT; EXTERNAL_DO_NOT_TOUCH | keine | keine Mutation | keine; feste Ausschlussgrenze |
| `projects-nonrepository-roots` | MULTIPLE; CURRENT; kein bewiesener Movebedarf | keine; Designinput bei W1/W6 | keine Mutation | OD-03/09 |
| `midas-agents` | MIDAS; CURRENT; projektlokaler Vertrag | W3-M minimal; W6-M semantisch | BM/B6M | OD-03/04/05/06/10 |
| `midas-readme` | MIDAS; CURRENT; projektlokaler Vertrag | W3-M minimal; W6-M semantisch | BM/B6M | OD-03/04/05/06/10 |
| `midas-changelog` | MIDAS; CURRENT | W7 | B7 | OD-09 |
| `midas-dev-environment` | MIDAS; CURRENT; projektlokaler Vertrag | W3-M minimal; W6-M semantisch | BM/B6M | OD-03/04/05/06/10 |
| `midas-workflow-contract` | MIDAS; CURRENT; projektlokaler Vertrag | W3-M minimal; W6-M semantisch | BM/B6M | OD-03/04/05/06/10 |
| `midas-templates-readme` | MIDAS; CURRENT; projektlokaler Vertrag | W3-M minimal; W6-M semantisch | BM/B6M | OD-03/04/05/06/10 |
| `midas-roadmap-template` | MIDAS; CURRENT; projektlokaler Vertrag | W3-M minimal; W6-M semantisch | BM/B6M | OD-03/04/05/06/10 |
| `midas-evidence-template` | MIDAS; CURRENT; projektlokaler Vertrag | W3-M minimal; W6-M semantisch | BM/B6M | OD-03/04/05/06/10 |
| `kasrkin-overview` | KASRKIN; K; Source-/Dokumentablage DEFERRED_TO_LATER_LIFECYCLE (W3) | W3-S; Navigation W6-M | BS | OD-01/08/09 |
| `kasrkin-evolution-notes` | KASRKIN; K; Source-/Dokumentablage DEFERRED_TO_LATER_LIFECYCLE (W3) | W3-S; Navigation W6-M | BS | OD-01/08/09 |
| `kasrkin-source-root` | KASRKIN; K; Source-/Dokumentablage DEFERRED_TO_LATER_LIFECYCLE (W3) | W3-S/I/M/H | BS/BI/BM/BH | OD-01/04/05/06/08/09/10 |
| `kasrkin-sensor-source` | KASRKIN; K; Source-/Dokumentablage DEFERRED_TO_LATER_LIFECYCLE (W3) | W3-S/I/M/H | BS/BI/BM/BH | OD-01/04/05/06/08/09/10 |
| `kasrkin-validator` | KASRKIN; K; Source-/Dokumentablage DEFERRED_TO_LATER_LIFECYCLE (W3) | W3-S/I/M/H | BS/BI/BM/BH | OD-01/04/05/06/08/09/10 |
| `kasrkin-policy-config` | KASRKIN; K; Source-/Dokumentablage DEFERRED_TO_LATER_LIFECYCLE (W3) | W3-S/I/M/H | BS/BI/BM/BH | OD-01/04/05/06/08/09/10 |
| `kasrkin-activation` | KASRKIN; K: Releasebasis; PM/PH: neue projektspezifische Bindung | W3-S/I/M/H | BS/BI/BM/BH | OD-01/04/05/06/08/09/10 |
| `kasrkin-schemas` | KASRKIN; K; Source-/Dokumentablage DEFERRED_TO_LATER_LIFECYCLE (W3) | W3-S/I/M/H | BS/BI/BM/BH | OD-01/04/05/06/08/09/10 |
| `kasrkin-fixtures` | KASRKIN; K; Source-/Dokumentablage DEFERRED_TO_LATER_LIFECYCLE (W3) | W3-S/I/M/H | BS/BI/BM/BH | OD-01/04/05/06/08/09/10 |
| `kasrkin-guard-tests` | KASRKIN; K; Source-/Dokumentablage DEFERRED_TO_LATER_LIFECYCLE (W3) | W3-S/I/M/H | BS/BI/BM/BH | OD-01/04/05/06/08/09/10 |
| `installed-usage-sensor` | KASRKIN_INSTALLATION; CURRENT; W3 bytegleich | W3-I Proof, kein Sensor-Move | BI | OD-04/05/06 |
| `usage-state-runtime` | KASRKIN_RUNTIME; CURRENT; einziger aktiver Statepfad | W3 Erhalt; späterer Move eigener Auftrag | BI | OD-06 |
| `hestia-agents` | HESTIA; CURRENT; eigene Semantik bleibt lokal | W3-H minimal; W6-H semantisch | BH/B6H | OD-03/04/05/06/10 |
| `hestia-dev-environment` | HESTIA; CURRENT; eigene Semantik bleibt lokal | W3-H minimal; W6-H semantisch | BH/B6H | OD-03/04/05/06/10 |
| `hestia-workflow-contract` | HESTIA; CURRENT; eigene Semantik bleibt lokal | W3-H minimal; W6-H semantisch | BH/B6H | OD-03/04/05/06/10 |
| `hestia-template-root` | HESTIA; CURRENT; eigene Semantik bleibt lokal | W3-H minimal; W6-H semantisch | BH/B6H | OD-03/04/05/06/10 |
| `hestia-usage-root` | KASRKIN_INSTALLATION; HESTIA besitzt Integrationsprofil; KI + PH; CURRENT bis separat freigegebenem Retire erhalten | W3-H; Retire frühestens W7-H | BH/B7H | OD-04/05/06/08/10 |
| `hestia-sensor-copy` | KASRKIN_INSTALLATION; HESTIA besitzt Integrationsprofil; KI + PH; CURRENT bis separat freigegebenem Retire erhalten | W3-H; Retire frühestens W7-H | BH/B7H | OD-04/05/06/08/10 |
| `hestia-validator-copy` | KASRKIN_INSTALLATION; HESTIA besitzt Integrationsprofil; KI + PH; CURRENT bis separat freigegebenem Retire erhalten | W3-H; Retire frühestens W7-H | BH/B7H | OD-04/05/06/08/10 |
| `hestia-gitignore` | HESTIA; CURRENT | W7-H | B7H | OD-05/06/10 |
| `hd2-dev-environment` | HD2_MOD_UPDATER; CURRENT; kein bewiesener Movebedarf | keine; Designinput bei W1/W6 | keine Mutation | OD-03/09 |
| `argus-overview` | ARGUS_PILOT_ARCHIVE; PA; bytegleicher Provenance-Import; internes Layout DEFERRED_TO_LATER_LIFECYCLE (W4) | W4; Altpfadretire W7 | B4/B7 | OD-07/08/10 |
| `argus-campaign-document` | ARGUS_PILOT_ARCHIVE; PA; bytegleicher Provenance-Import; internes Layout DEFERRED_TO_LATER_LIFECYCLE (W4) | W4; Altpfadretire W7 | B4/B7 | OD-07/08/10 |
| `argus-pilot-closure` | ARGUS_PILOT_ARCHIVE; PA; bytegleicher Provenance-Import; internes Layout DEFERRED_TO_LATER_LIFECYCLE (W4) | W4; Altpfadretire W7 | B4/B7 | OD-07/08/10 |
| `argus-campaign-manifest` | ARGUS_PILOT_ARCHIVE; PA; bytegleicher Provenance-Import; internes Layout DEFERRED_TO_LATER_LIFECYCLE (W4) | W4; Altpfadretire W7 | B4/B7 | OD-07/08/10 |
| `argus-benchmark-root` | ARGUS_PILOT_ARCHIVE; PA; bytegleicher Provenance-Import; internes Layout DEFERRED_TO_LATER_LIFECYCLE (W4) | W4; Altpfadretire W7 | B4/B7 | OD-07/08/10 |
| `argus-run-bundle` | ARGUS_PILOT_ARCHIVE; PA; bytegleicher Provenance-Import; internes Layout DEFERRED_TO_LATER_LIFECYCLE (W4) | W4; Altpfadretire W7 | B4/B7 | OD-07/08/10 |
| `argus-orchestrator` | ARGUS_PILOT_ARCHIVE; PA; bytegleicher Provenance-Import; internes Layout DEFERRED_TO_LATER_LIFECYCLE (W4) | W4; Altpfadretire W7 | B4/B7 | OD-07/08/10 |
| `argus-operator-tools` | ARGUS_PILOT_ARCHIVE; PA; bytegleicher Provenance-Import; internes Layout DEFERRED_TO_LATER_LIFECYCLE (W4) | W4; Altpfadretire W7 | B4/B7 | OD-07/08/10 |
| `argus-evaluator` | ARGUS_PILOT_ARCHIVE; PA; bytegleicher Provenance-Import; internes Layout DEFERRED_TO_LATER_LIFECYCLE (W4) | W4; Altpfadretire W7 | B4/B7 | OD-07/08/10 |
| `argus-console` | ARGUS_PILOT_ARCHIVE; PA; bytegleicher Provenance-Import; internes Layout DEFERRED_TO_LATER_LIFECYCLE (W4) | W4; Altpfadretire W7 | B4/B7 | OD-07/08/10 |
| `argus-stage-root` | ARGUS_PILOT_ARCHIVE; PA; bytegleicher Provenance-Import; internes Layout DEFERRED_TO_LATER_LIFECYCLE (W4) | W4; Altpfadretire W7 | B4/B7 | OD-06/07/08/10 |
| `argus-evidence-root` | ARGUS_PILOT_ARCHIVE; PA; bytegleicher Provenance-Import; internes Layout DEFERRED_TO_LATER_LIFECYCLE (W4) | W4; Altpfadretire W7 | B4/B7 | OD-06/07/08/10 |
| `argus-run01-archived-session` | CODEX_RUNTIME; CURRENT; EXTERNAL_DO_NOT_TOUCH | keine | keine Mutation | keine; feste Ausschlussgrenze |
| `codex-session-root` | CODEX_RUNTIME; CURRENT; EXTERNAL_DO_NOT_TOUCH | keine | keine Mutation | keine; feste Ausschlussgrenze |
| `global-codex-agents` | CODEX_RUNTIME; CURRENT; EXTERNAL_DO_NOT_TOUCH | keine | keine Mutation | keine; feste Ausschlussgrenze |
| `architecture-original-workflow` | OWNER_DESKTOP; CURRENT; kein bewiesener Movebedarf | keine; Designinput bei W1/W6 | keine Mutation | OD-03/09 |
| `architecture-newer-workspace-pitch` | OWNER_DESKTOP; CURRENT; kein bewiesener Movebedarf | keine; Designinput bei W1/W6 | keine Mutation | OD-03/09 |

Für die in Abschnitt 16.1 ergänzten Klassen gilt dieselbe Bindung:
Guard-DONE-Roadmap/-Evidence bleiben bytegleich bei MIDAS; neue
Release-/Installationsreceipts gehören K/KI, Projektbindungen PM/PH und
Toolproof KE. Ihre konkrete Dateiform wird erst in W3 festgelegt.
Das neue ARGUS-V1.0 erhält den entschiedenen Root, aber weder dessen Anlage
noch Produktimplementierung gehört zu dieser Migration.

`repo-g915-chatter-guard`, `codex-session-root`,
`global-codex-agents` und `argus-run01-archived-session` bleiben
`EXTERNAL_DO_NOT_TOUCH`. Der historische ARGUS-Helper und die Console
werden bytegleich/inaktiv archiviert, nicht zum installierten Command
umgeschrieben. Historische Pfadtexte erhalten spätere externe Provenance-
Navigation, keine rückwirkende Laufzeitbedeutung.

## 23. Gebundene Dependency Matrix

Alle OD-01 bis OD-10 sind entschieden; keine frühere Ownerfrage ist offen.
Die technischen Dependencies bleiben als **Ausführungsvoraussetzungen**
erhalten. Vertagte Detailausgestaltung blockiert W1 nicht, muss aber vor der
betroffenen späteren Ausführung abgeschlossen werden.

| OD | Technischer Vorgänger / jetzt gebunden | Unabhängigkeit | DEFERRED_TO_LATER_LIFECYCLE | Spätere Wave |
| --- | --- | --- | --- | --- |
| OD-01 | OD-09 Name entschieden | ARGUS und Archiv | interne Sourceablage | W3-S |
| OD-02 | OD-09 Name entschieden | KASRKIN und separates Archiv | Erstellung/Produktstruktur, nicht Root | W5-Handoff; separater V1-Auftrag |
| OD-03 | kein Vorgänger; bestehende Quellen bestätigt | Toolroots/Archiv | neuer Shared-Owner nur bei realem Bedarf | W2 Verbleib; W6 Bereinigung |
| OD-04 | OD-01/09 Source gebunden | ARGUS/Archiv | Installationslayout und CLI-Details | W3-I |
| OD-05 | OD-04 Einstieg entschieden | ARGUS/Archiv | konkretes Lockschema, benötigte Adapter | W3-I/M/H |
| OD-06 | OD-04/05 Betriebsprinzip gebunden | History/Casing | späterer State-Move, konkrete Tool-Evidence-/ARGUS-Verträge | W3 Stateerhalt; zuständige spätere Aufträge |
| OD-07 | OD-08 Provenance und OD-06 Rollentrennung entschieden | ARGUS-V1-Root/Erstellung | Archivlayout/Index/Backupausgestaltung | W4 vor W5 |
| OD-08 | OD-01/07 Ziele entschieden | Projektworkflow | konkrete Import-/Restoremanifestform; weitere History nur bei Bedarf | W3-S/W4 |
| OD-09 | kein Vorgänger; beide neuen Namen entschieden | technische Integration | etwaige Remote-URLs; spätere Renames nur eigener Auftrag | W3; separater ARGUS-Auftrag |
| OD-10 | alle erforderlichen ODs entschieden | ARGUS-Erstellung ist keine W3/W4-Voraussetzung | Termine und ausführungsbezogene Preflights | W2–W7 jeweils ownergated |

## 24. Gebundene Migration Sequence und Rollback Boundaries

Status: `MIGRATION_SEQUENCE_READY / ROLLBACK_PLAN_READY`.
Die folgende Reihenfolge setzt OD-10 um. W2 ist lediglich die vorgelagerte
Bestätigung des bewussten Shared-Verbleibs aus OD-03, keine technische
Extraction und kein vorgezogener Workflow-Rewrite. Auch W2 startet hier nicht.

| Wave | Gebundene spätere Sequenz / Proof Gate | Rollback Boundary |
| --- | --- | --- |
| W2 | Nach gesondertem Auftrag bewussten Shared-Verbleib dokumentieren; keine technische Foundationmigration | B2 |
| W3-S | Source/Provenance mit Commitidentität UND erforderlichem Dirty-Manifest vorbereiten; Import-/Hash-/Regressionproof vor weiterer Aktivierung | BS |
| W3-I | checkoutunabhängigen versionsgebundenen Command, Installreceipt und Driftprüfung beweisen; bestehender Sensor-/Statepfad bleibt | BI |
| W3-M | MIDAS allein cutovern; explizite Versionsbindung, benötigte Activation und Adapter nur bei konkretem Bedarf; reale Invocation bis validierter Envelope beweisen | BM |
| W3-H | HESTIA allein mit eigener Validator-/Workflowsemantik cutovern; eigenes Ende-zu-Ende-Orakel und Rollback; MIDAS unberührt | BH |
| W4 | Pilot am entschiedenen PA-Ziel zunächst parallel bytegleich archivieren; vollständige Hash-/Navigation-/Restoreproofs, keine Pilotreaktivierung | B4 |
| W5 | Erst nach Archivproof Handoff für den separaten ARGUS-V1.0-Auftrag; Root entschieden, keine Anlage/Implementierung in dieser Wave | B5 |
| W6-M, danach W6-H | Shared-Workflow-Ownership und aktive Referenzen projektweise bereinigen; Tool-/Consumerproofs müssen vorliegen, keine zweite aktive Governanceautorität | B6M, B6H |
| W7 | Nur kandidatenbezogen nach Proof UND separater Freigabe Altartefakte bereinigen; DELETE_AFTER_PROOF ist keine Löschfreigabe | B7/B7H |

### 24.1 Verbindliche Übernahme der Rollbackdetails

Die vollständigen **Preimage-, Parallelstruktur-, Abbruch-, Postcondition-,
Reverse-, Consumer-/Pfadcheck- und Altstandfreigabe-Spalten** der zehn
Boundary-Zeilen in Abschnitt 18 werden in diesen ownergebundenen Plan
übernommen. Deren frühere Vorschlagsstatus sind historische Provenance;
die aktuelle Übernahme gilt mit den folgenden ausdrücklich bindenden
Auflösungen und Präzisierungen:

| Boundary | Aktuelle Bindung / sichere Rückkehr |
| --- | --- |
| B2 | Projektverträge unverändert; nur spätere administrative W2-Dokumentation rücknehmbar |
| BS | Sourceziel K ist entschieden; alter vollständiger Tree bleibt aktiv/rollbackfähig, bis alle betroffenen Consumer- und Restoreproofs vorliegen |
| BI | Command kasrkin ist entschieden; Installationsdetails gemäß Abschnitt 22.1 später festlegen; alter Sensor/State und alter Einstieg bleiben wiederherstellbar |
| BM | Nur MIDAS-Bindungen, Activation und tatsächlich benötigte Adapter gemeinsam rückführen; keine HESTIA-Änderung |
| BH | Nur HESTIA-Bindungen/Profil rückführen; grüner MIDAS-Zustand bleibt unabhängig erhalten |
| B4 | Archivziel PA ist entschieden; Originale bis Archiv-/Restoreproof und eigener Retirefreigabe erhalten; historische Bytes niemals reparieren |
| B5 | Handoff additiv korrigierbar, Archiv unverändert; ARGUS-Rootwahl wird durch Handoff-Rollback nicht wieder unentschieden |
| B6M | MIDAS-Vertrags-/Activationpreimage gemeinsam wiederherstellen; keine neue zweite aktive Detailpolicy |
| B6H | Eigenen HESTIA-Vertrags-/Profilstand wiederherstellen, ohne MIDAS zurückzudrehen |
| B7/B7H | Exakte freigegebene Kandidaten und geprüfte Restorepfade; bei fehlendem Proof/Ownerauftrag kein Retire; historische Payloads dauerhaft erhalten |

K/KI/PM/PH/KR/KE/PA werden in allen übernommenen Rollbackdetails ausschließlich
nach Abschnitt 22.1 aufgelöst. Kein alter Installations-/Runtimepfadvorschlag
wird dadurch nachträglich bestätigt. Preimages und Restoreproofs sind
Pflichten späterer Waves, keine bereits ausgeführten Nachweise.

Die realen Consumerketten aus Abschnitt 17.1 bleiben die gebundenen
späteren Proof-Orakel. Erst installierter Einstieg **und** Projektpin
**und** aktiver Listener/Aufrufpfad **und** Refresh/State/Validator ergeben
Consumerproof. Historischer Pilot benötigt Lesbarkeit/Byteerhalt/Navigation,
keinen erneuten Run. Bei fehlgeschlagener produktiver Probe zuerst Reverse
und Postchecks, danach Diagnose nur als neuer usagegeprüfter Block.

## 25. W1-Abschlussstatus

| Bereich | Gebundener Status |
| --- | --- |
| OD-01 bis OD-10 | OWNER_DECISIONS_RECORDED; alle OWNER_APPROVED |
| Target Map | W1_TARGET_MAP_READY |
| Migration Sequence | MIGRATION_SEQUENCE_READY |
| Rollback Plan | ROLLBACK_PLAN_READY |
| W1 | W1_COMPLETE |
| Bestandsdateien / aktive Verträge | NO_FILES_MOVED / NO_ACTIVE_CONTRACT_REWRITTEN |
| W2 | W2_NOT_STARTED |
| Spätere Ausführung | NEXT_WAVE_OWNER_AUTHORIZATION_REQUIRED |

W1 ist abgeschlossen, weil alle Ownerentscheidungen gebunden, alle
Inventory-IDs abgedeckt und nachgelagerte Detailentscheidungen eindeutig
ihren späteren Lifecycle-Ownern zugeordnet sind. Kein vertagter Wert wird
als implizite W1-Entscheidung oder Ausführungserlaubnis behandelt.

## 26. Aktuelle Resume Card — nach Ownerbindung

- Verbindlicher Einstieg: Abschnitte 21–26 und Evidence
  `W1-OD-BIND-01`. W0 und ursprüngliches W1-Packet bleiben historische
  Planungs-/Prüfprovenance; ihre damaligen offenen Ownerfragen sind erledigt.
- Aktueller Zustand: `W1_COMPLETE`, `W2_NOT_STARTED`.
- Ownerentscheidungen gelten weiter bei unverändertem gebundenem Scope;
  keine erneute Bestätigung derselben OD-Werte verlangen.
- Nächster Schritt: gesonderte Ownerautorisierung für die nächste Wave
  (W2-Verbleib gemäß OD-03). Vor Beginn deren vollständigen Scope und
  Postcondition bestimmen und einen frischen kanonischen Usage-Check ausführen.
- Keine Migration, Installation, Source-/Archivkopie, Rootanlage,
  Consumerumschaltung, Vertragsänderung, Commit/Push/Deploy autorisiert.
- Bewusst spätere Details stehen in Abschnitt 22.1 als
  `DEFERRED_TO_LATER_LIFECYCLE`; zuständiger Owner/Wave und Fälligkeitsgrenze
  sind dort benannt. ARGUS-Source-Root ist bereits entschieden.
- Letzte blockzulassende Messung:
  `2026-09-13T21:53:08.0524958+02:00`, `98 % / 31 %`,
  Resets `1789347189 / 1789806057`,
  `CONTINUE / PRIMARY_ALLOWED`. Keine alten Werte als neue Baseline verwenden.
- Nach vollständigem Postimagecheck abschließender kanonischer Refresh;
  Ergebnis nur im Benutzerbericht. Danach keine Dateiänderung/neue Arbeit.

```text
OWNER_DECISIONS_RECORDED
W1_TARGET_MAP_READY
MIGRATION_SEQUENCE_READY
ROLLBACK_PLAN_READY
W1_COMPLETE
NO_FILES_MOVED
NO_ACTIVE_CONTRACT_REWRITTEN
W2_NOT_STARTED
NEXT_WAVE_OWNER_AUTHORIZATION_REQUIRED
```

`W1_COMPLETE`
`W2_NOT_STARTED`
`OWNER_AUTHORIZATION_REQUIRED`
`STOP`

## 27. W2 Shared Workflow Boundary Freeze

Status: `W2_COMPLETE / W3_NOT_STARTED / NEXT_WAVE_OWNER_AUTHORIZATION_REQUIRED`.

### 27.1 Decision Record — W2-SWB-FREEZE-01

Der Ownerauftrag „W2 — SHARED WORKFLOW BOUNDARY FREEZE“ bindet ausschließlich
den bereits mit `OD-03 / OWNER_APPROVED` entschiedenen bewussten Verbleib der
Shared-Workflow-Artefakte bei ihren heutigen Projekt-Ownern. OD-03 wird nicht
erneut geöffnet. Auch OD-01 bis OD-10 bleiben unverändert `OWNER_APPROVED`;
keine Entscheidung wird als offen oder erneut bestätigungspflichtig geführt.

W2 ist eine kleine administrative `BOUNDED_DOCUMENTATION`-Wave. Es wurde keine
technische Shared Foundation aufgebaut, kein Repository angelegt, keine Datei
verschoben oder kopiert und kein aktiver Vertrag umgeschrieben. Die in
Abschnitt 22.1 vertagten Details bleiben vollständig
`DEFERRED_TO_LATER_LIFECYCLE`.

### 27.2 Verbindlicher Shared-Workflow-Boundary-Vertrag

| Grenze | Verbindlicher W2-Zustand |
| --- | --- |
| MIDAS | `AGENTS.md`, `docs/DEV_ENVIRONMENT.md` und die MIDAS-Templates bleiben bei MIDAS. Sie bleiben bis zu den jeweils erforderlichen W3-/W6-Proofs die aktiven projektlokalen Verträge. W2 ändert weder Inhalt noch Pfad. |
| H.E.S.T.I.A. | H.E.S.T.I.A.s AGENTS-, DEV_ENVIRONMENT- und Workflow-/Template-Verträge bleiben bei H.E.S.T.I.A. Ihre eigene Semantik wird in W2 weder vereinheitlicht noch überschrieben. Die spätere KASRKIN-Integration bleibt eine getrennte W3-H-Wave. |
| KASRKIN | KASRKIN besitzt die Governance-Entscheidungssemantik, insbesondere Policy, Admission, `SAFE_CLOSURE`, `LIMIT`, Floors, Restricted Episodes und Guard-Evidence. Bis zum bewiesenen Cutover bleibt deren heutige aktive, an MIDAS gebundene Source am bestehenden MIDAS-Pfad aktiv und rollbackfähig. Die technische Source- und Installationsmigration beginnt frühestens in W3. |
| Shared Workflow | Shared Workflow darf festlegen, wann Governance konsultiert wird, aber KASRKINs Entscheidungsemantik nicht duplizieren. In W2 entstehen weder `codex-workflow`-Repository noch Shared-Owner, Releaseprozess, Installer oder Distributionsmechanismus. Semantische Bereinigung erfolgt erst projektweise in W6-M und W6-H, nachdem der jeweilige KASRKIN-Consumerproof grün ist. |
| Externe Grenzen | `C:\Users\steph\.codex` bleibt `EXTERNAL_DO_NOT_TOUCH`. G915 Chatter Guard bleibt Drittsoftware des ursprünglichen Autors und vollständig außerhalb der Migration. Desktop-Architekturpapiere bleiben Designinput und werden nicht zu aktiven Runtimeverträgen. |

Damit existiert keine zweite aktive Guarddefinition außerhalb KASRKINs
Governance-Semantik. Der heutige MIDAS-Vertrag ist bis zum bewiesenen Cutover
die projektgebundene aktive Quelle dieser Semantik, nicht eine zusätzliche
Shared-Workflow-Autorität.

### 27.3 B2-Rollbackgrenze

- Aktive Projektverträge bleiben unverändert; es wurde keine technische
  Foundation erzeugt, kein Consumer umgestellt und keine Runtime verändert.
- Es wurde kein Repository angelegt. W2 besitzt keinen technischen
  Parallelstand und keinen zu löschenden Runtimealtstand.
- Ein fehlerhafter W2-Eintrag wird ausschließlich durch einen späteren
  additiven Korrektur- oder Withdrawal-Record berichtigt.
- W0-/W1-Roadmap- und Evidence-Inhalte werden nicht rückwirkend editiert.
- W3 und W3-S bleiben gesperrt, bis ein gesonderter Ownerauftrag vorliegt.

Status: `B2_ROLLBACK_READY`.

### 27.4 W2-Statusmatrix

| Bereich | Gebundener Status |
| --- | --- |
| OD-01 bis OD-10 | `OWNER_DECISIONS_RECORDED`; unverändert `OWNER_APPROVED` |
| W1 / Target Map / Sequenz / Rollbackplan | `W1_COMPLETE / W1_TARGET_MAP_READY / MIGRATION_SEQUENCE_READY / ROLLBACK_PLAN_READY` |
| W2 | `W2_COMPLETE` |
| Shared Workflow | `SHARED_WORKFLOW_REMAINS_WITH_EXISTING_PROJECT_OWNERS` |
| Repository / Foundation | `NO_CODEX_WORKFLOW_REPOSITORY / NO_SHARED_FOUNDATION_MIGRATION` |
| Guard-Semantik | `KASRKIN_REMAINS_SINGLE_GUARD_SEMANTIC_OWNER` |
| Dateien / aktive Verträge | `NO_FILES_MOVED / NO_ACTIVE_CONTRACT_REWRITTEN` |
| B2 | `B2_ROLLBACK_READY` |
| W3 / W3-S | `W3_NOT_STARTED`; Ownerautorisierung erforderlich |

### 27.5 Resume Card — nach W2

- Verbindlicher Einstieg: Roadmap Abschnitte 21–27 und Evidence-Receipts
  `W1-OD-BIND-01` sowie `W2-SWB-FREEZE-01`.
- Aktueller Zustand: `W2_COMPLETE`, `W3_NOT_STARTED`.
- Aktive Projektverträge, Consumer, Runtime und Bestandsdateipfade sind durch
  W2 unverändert. Keine technische Migration wurde behauptet oder begonnen.
- OD-01 bis OD-10 bleiben ownerbestätigt und werden nicht erneut geöffnet.
- Nächster exakt erlaubter Schritt ist ausschließlich ein separater
  Ownerauftrag für `TOOLING EXTRACTION & WORKSPACE CLEANUP — W3-S — KASRKIN
  SOURCE + PROVENANCE PREFLIGHT` mit eigenem frischem Usage-Gate.
- Ohne diesen Auftrag bleiben W3, W3-S, Repositoryanlage, Installation,
  Consumer-Cutover und Vertragsrewrite gesperrt.
- W2-Startcheckpoint: `2026-09-13T22:12:52.5835786+02:00`, `valid=true`,
  `status=OK`, 5h `65 %`, Woche `26 %`, Resets
  `1789347189 / 1789806057`, `CONTINUE / PRIMARY_ALLOWED`.
- Der kanonische Abschlusscheckpoint wird nach vollständig grünem Postimage
  ausschließlich im Benutzerbericht geführt; danach erfolgt keine Mutation
  und keine neue Arbeit.

```text
W2_COMPLETE
SHARED_WORKFLOW_REMAINS_WITH_EXISTING_PROJECT_OWNERS
NO_CODEX_WORKFLOW_REPOSITORY
NO_SHARED_FOUNDATION_MIGRATION
KASRKIN_REMAINS_SINGLE_GUARD_SEMANTIC_OWNER
B2_ROLLBACK_READY
NO_FILES_MOVED
NO_ACTIVE_CONTRACT_REWRITTEN
W3_NOT_STARTED
NEXT_WAVE_OWNER_AUTHORIZATION_REQUIRED
```


### 33.5 Post-S4R usage decision and safe pause

The mandatory post-S4R refresh at 2026-09-19T11:48:28.0133360+02:00 was
valid with schema 3, sensor 3.1.0, status OK, 37 percent 5h and 90 percent
weekly remaining. Reset identities were 1789825365 / 1790412165.

This is CONTINUE_WITH_CAUTION. W3-M is medium-to-large and its project binding,
active contract references, activation fingerprints, real invocation and BM
postcondition form one indivisible consumer transaction. It is therefore
PRIMARY_REJECTED_FOR_RESERVE in this band. The transaction was not started and
the new restricted-work episode remains AVAILABLE; closure documentation does
not consume it.

Safe state:

W3_M_OWNER_AUTHORIZED
W3_M_S4R_COMPLETE
W3_M_CUTOVER_NOT_STARTED
MIDAS_CONSUMER_UNCHANGED
HESTIA_CONSUMER_UNCHANGED
RESTRICTED_WORK_EPISODE_AVAILABLE
RESUME_AFTER_FRESH_CONTINUE_GATE
NO_COMMIT_AUTHORIZED

Exact resume: after a fresh canonical result in CONTINUE, revalidate the
installed release, command, binding target and five bound preimages. Then
execute the complete W3-M binding-plus-activation transaction through the real
consumer proof or full BM rollback. Do not begin W3-H, W6 or retirement.

## 33. W3-M MIDAS Consumer Cutover — S4R

Status: W3_M_OWNER_AUTHORIZED / W3_M_S4R_COMPLETE /
CUTOVER_NOT_STARTED.

### 33.1 Owner authorization and scope

On 19 September 2026 the owner explicitly authorized continuation after the
green W3-I installation. This authorization opens W3-M only. It does not
authorize a commit, W3-H, W6 semantic cleanup, old-source retirement, ARGUS
work, runtime-state migration or any external action.

The pre-S4R canonical refresh at 2026-09-19T11:45:37.2792728+02:00 was valid
with schema 3, sensor 3.1.0, status OK, 44 percent 5h and 91 percent weekly
remaining. Reset identities were 1789825365 / 1790412165.

### 33.2 Minimal implementation scope

The live reference scan found one active MIDAS operator path in
docs/DEV_ENVIRONMENT.md and one technical ownership statement in the workflow
contract. AGENTS.md already delegates to those contracts but requires a small
explicit command binding. README.md still describes KASRKIN as located in the
MIDAS workspace and requires one navigation correction.

The bounded mutation set is:

- add .kasrkin/binding.json with the exact installed release, fingerprint,
  payload digest and receipt hash;
- bind AGENTS.md to the stable kasrkin command while retaining the documented
  local rollback path;
- change docs/DEV_ENVIRONMENT.md from direct checkout invocation to
  kasrkin validate -Refresh and document the unchanged state path;
- change only the workflow contract's technical implementation location, not
  its guard-vnext/1 semantics, floors or state transitions;
- update the single KASRKIN row in README.md;
- update only the affected AGENTS, DEV and workflow hashes in the existing
  guard-activation.json after their final bytes are known;
- add a MIDAS-owned W3-M consumer receipt and synchronize Roadmap/Evidence.

No thin adapter is needed. Benchmark/ARGUS files retain their historical local
path and are outside W3-M. Template files without an active KASRKIN invocation
remain unchanged. The old tools/codex-usage tree stays present as the BM
rollback source and for consumers not yet migrated.

### 33.3 Real proof oracle and BM

The required last-mile chain is:

documented MIDAS invocation -> Get-Command kasrkin -> stable shim -> resolver ->
MIDAS project binding -> receipt and installed-file hashes -> exact release ->
refresh -> existing Rainmeter UsageState.json -> validator -> valid compact
state and telemetry envelope -> unchanged guard consultation.

The proof also requires an installed policy invocation, canonical JSON and exit
codes, an unbound/drift failure case in a disposable MIDAS-equivalent context,
zero H.E.S.T.I.A. change, no second writer and unchanged runtime state.

BM binds preimages for every changed MIDAS file. On any productive failure,
remove the MIDAS binding, restore AGENTS/README/DEV/workflow/activation
together, prove the old direct validator path and leave H.E.S.T.I.A. untouched.
The successful postimage keeps the old files in place; no deletion is part of
W3-M.

### 33.4 S4R forecast

W3-M is medium-to-large, local and reversible: five active contract/navigation
files, one binding, one consumer receipt and the two control documents, plus
real command/envelope/policy tests, activation regressions, source integrity
checks and a BM restore proof. It is one coherent consumer transaction and
must not be split between binding and activation. No comparable full W3-M cost
receipt exists, so no numeric reserve is invented.

A new canonical usage gate is mandatory after this S4R and before the first
cutover mutation.

## 32. W3-I Versioned Installation and Command

Status: W3_I_COMPLETE / KASRKIN_VERSIONED_INSTALLATION_READY /
KASRKIN_COMMAND_AVAILABLE.

### 32.1 Final candidate and admission

The final installed source candidate is source-candidate-a57d05e3aab820a1,
with source inventory digest
a57d05e3aab820a1001ebed4599300fbebddcfb01543503d60b4e9da8969a2fa.
Its candidate-manifest SHA-256 is
8dc7caee00a1a398a3abee77a9b9ee1aa7cb86fb6215f9dfd62c2a37ac66dec9,
the source-import manifest is
bb9a283bd55cf20dfd34707a5ecb4868f52dc9f0422b6aa2c5a23740ae4d34de
and the nine-adjustment manifest is
dc37b3b3911bf21291fd752fb4fe2ee79cda1ddb29462a84e2f61126d4e6f3ab.

The authoritative final pre-install refresh at
2026-09-19T11:25:55.8574543+02:00 was valid with schema 3, sensor 3.1.0,
status OK, 59 percent 5h and 94 percent weekly remaining. Reset identities were
1789825365 / 1790412165. This was CONTINUE / PRIMARY_ALLOWED and did not depend
on the historical usage exception.

The pre-install correction cycle found and closed foreign-root ownership,
partial-install cleanup, release-fingerprint reconstruction and an invalid
path-traversal regular expression. Test-harness handling for expected native
errors, successful JSON objects and internally consistent unknown versions was
also corrected. Every source change regenerated the candidate and reran the
standalone and W3-S proofs before the next install attempt.

### 32.2 Installed release

| Field | Value |
| --- | --- |
| Release ID | kasrkin-2a0d185b0b04a93f |
| Release fingerprint | 2a0d185b0b04a93f9794da885e5f200ba5cc6aacbd82063c44c6d115b9fd5658 |
| Payload digest | c51e6b3ab528c528b44669992fd3a2fc112e4094ba09c3c04e7750523bb2137b |
| Install root | C:\Users\steph\.local\share\kasrkin |
| Release root | C:\Users\steph\.local\share\kasrkin\releases\kasrkin-2a0d185b0b04a93f |
| Stable command | C:\Users\steph\.local\bin\kasrkin.cmd |
| Receipt | C:\Users\steph\.local\share\kasrkin\receipts\kasrkin-2a0d185b0b04a93f.json |
| Receipt SHA-256 | 1abdce21dd17c9a0ce9fda9cd86db0de71cb13b799515351040a16b362f96187 |
| Payload / installed files | 18 / 19 |
| Project binding | kasrkin-project-binding/1; concrete release only; no latest fallback |

The archived receipt under component provenance is byte-identical. Its release
proof has SHA-256
6318a1b40ab1d5906218b0fd197789bb4fdf000737bbb83eb9d680a84904b2dc;
the BI rollback plan has SHA-256
069f934dde944b2dadd09a4ba6a20ce518db9f031008b125c4ce99c9f0afabea.

### 32.3 Proof and safe postcondition

The disposable synthetic matrix passed 26/26 and removed its installation,
shim and project context. It covers foreign ownership, partial rollback,
binding formats, concrete and unknown versions, fingerprint contradictions,
receipt and payload drift, missing files, metadata drift, foreign-CWD
invocation and BI from a foreign CWD.

The real command resolves as an Application to the expected stable shim.
Without a project binding it returns exit 2 and
KASRKIN_PROJECT_BINDING_MISSING. A temporary bound project from a foreign CWD
resolved the exact release, ran the installed validator with refresh and was
then removed. No binding was created in MIDAS or H.E.S.T.I.A.

All installed hashes, the payload digest, release fingerprint and release ID
were independently reconstructed without drift. The final source proof passes
106/106 guard cases and the W3-S proof passes 14/14. There are no scheduled
KASRKIN or UsageState writers. MIDAS, Rainmeter and the installed release use
the same sensor bytes and the same authoritative state path.

Current safe state:

W3_S_COMPLETE
W3_T_DISCOVERY_COMPLETE
W3_T_REHOME_COMPLETE
KASRKIN_SOURCE_CANDIDATE_READY
KASRKIN_SOURCE_PROVENANCE_BOUND
BYTE_IDENTICAL_REHOME_PROVEN
W3_I_COMPLETE
KASRKIN_VERSIONED_INSTALLATION_READY
KASRKIN_COMMAND_AVAILABLE
CHECKOUT_INDEPENDENT_INVOCATION_PROVEN
INSTALLATION_RECEIPT_VALID
RELEASE_AND_PAYLOAD_FINGERPRINTS_VALID
SYNTHETIC_PROJECT_PINNING_PROVEN
DRIFT_DETECTION_PROVEN
BI_ROLLBACK_READY
OLD_KASRKIN_ROOT_RETAINED
OLD_MIDAS_SOURCE_STILL_ACTIVE
MIDAS_CONSUMER_UNCHANGED
HESTIA_CONSUMER_UNCHANGED
RAINMETER_STATE_PATH_UNCHANGED
NO_SECOND_INDEPENDENT_USAGE_WRITER
NO_ACTIVE_POLICY_CHANGE
MIGRATION_INVENTORY_UNCHANGED
W3_M_NOT_STARTED
W3_H_NOT_STARTED
NEXT_WAVE_OWNER_AUTHORIZATION_REQUIRED

Do not begin W3-M or W3-H, create product bindings, remove either old source,
or move runtime state. The next allowed execution wave requires a new owner
decision and a fresh canonical usage gate.

### 31.9 Final corrected-candidate gate before installation

The renewed candidate is source-candidate-c8c8741f4194fffb with source inventory
digest c8c8741f4194fffbe2e2065e7fc0bcd1cde527d61bd8ca35da40ca0a70795a0e.
Its candidate-manifest SHA-256 is
e639bf122a517c30eb06cf1a12e1be86b278127b56f126900437338e5b8a8026,
the import manifest is e6b763ef8b4ee58a59b5b6da46e0b143ada9e307ff7f8ffdef0d01601a06ea20
and the nine-adjustment manifest is
95ef32fd11bcfb401c5b1cee802fb2a213509a703e366d449dbd3ee410ebbc9f.
The regenerated standalone and W3-S proofs pass.

The required post-correction canonical refresh at
2026-09-19T11:21:15.0497535+02:00 is valid (schema 3, sensor 3.1.0, status OK,
age 0.9 seconds) with 65 percent 5h and 95 percent weekly remaining, reset
identities 1789825365 / 1790412165. The unchanged W3-I install-or-BI block
remains PRIMARY_ALLOWED.

### 31.8 W3-I usage gate after rehome

The canonical refresh at 2026-09-19T11:16:21.6709061+02:00 is valid
(schema 3, sensor 3.1.0, status OK, age 1.2 seconds) with 71 percent 5h and
95 percent weekly remaining; reset identities are 1789825365 / 1790412165.
This is CONTINUE and exceeds both static CONTINUE floors. The earlier
W3I-USAGE-EXCEPTION-01 is not needed for this admission. No complete comparable
W3-I cost receipt exists, so no empirical reserve is invented. The unchanged
W3-I block is atomic through a verified installation or full BI rollback and
is PRIMARY_ALLOWED, subject to the renewed fail-closed preflight.

### 31.7 W3-TR completion

W3-TR is complete. The minimal Git repository now exists at
C:\Users\steph\Projekte\codex-tools with root README, AGENTS contract,
.gitignore and docs/architecture/README.md. No commit or remote exists and no
speculative component directory was created.

KASRKIN was copied to apps/kasrkin without deleting or changing the old root.
The transfer covered 53 files with zero differences and transfer inventory
digest 45bf123671d4d174660c84c9c955fbdf1142a844cd5bf298ae70537594e574dc.
The non-circular transfer manifest has SHA-256
3abe5bbda23dce300f63df97854949b561f653e0f2ff769e261ddd513c279d46;
the rehome receipt has SHA-256
9aeab9e699dcbf06dbb2ea5e6e3d7c80664a9905b423935f736979ff1c20080e.

The preserved candidate remains source-candidate-2c264ced0d6645f1 with
candidate-manifest SHA-256
bddf59504a41e92ac4d8043685ab186d38e3a45621e92f20e03a73810d27df61.
The standalone candidate proof passed with 47 source files, 39 imports, six
adjustments and 106 guard cases. The final W3-S proof passed 14/14, including
22 parser files, 30 JSON files, zero import drift, immutable migration
inventory, unchanged consumers and the installed old MIDAS sensor.

W3_T_REHOME_COMPLETE is the current safe postcondition. The retained old root
is the rollback source; its removal is not authorized. No installation,
command binding, runtime move or consumer cutover occurred. The next coherent
block is W3-I from the new component root, after a fresh canonical usage gate
and renewed installer/resolver hardening review.

### 31.6 W3-TR usage gate

The canonical refresh at 2026-09-19T11:10:40.3399554+02:00 is valid
(schema 3, sensor 3.1.0, status OK, age 0.9 seconds) with 76 percent 5h and
96 percent weekly remaining; reset identities are 1789825365 / 1790412165.
This is CONTINUE. No comparable complete rehome block exists, so no empirical
reserve is invented. W3-TR is classified as a medium, local, reversible and
fully resumable source-topology block with the old root retained throughout.
The block is PRIMARY_ALLOWED.

`W2_COMPLETE`
`W3_NOT_STARTED`
`OWNER_AUTHORIZATION_REQUIRED`
`STOP`

## 28. W3-S KASRKIN Source + Provenance

Status: `W3_S_COMPLETE / W3_I_NOT_STARTED / USAGE_GATE_REQUIRED`.

### 28.1 Zulassung, Scope und Baseline

Der Ownerauftrag „W3-S + conditional W3-I — KASRKIN Source, Provenance and
Versioned Installation“ autorisiert W3-S sowie W3-I ausschließlich nach grüner
W3-S-Postcondition und neuem Usage-Gate. W3-M, W3-H und alle Consumer-Cutover
bleiben gesperrt. W3-S wurde als `large / BOUNDED_LOCAL`, lokal, reversibel und
inaktiv klassifiziert. UI-/Runtime-Reasoning bleibt `NOT_OBSERVABLE`.

Der frische `POST_REHYDRATION_BASELINE` vom
`2026-09-13T22:51:43.8133874+02:00` war valide (`schemaVersion=3`,
`sensorVersion=3.1.0`, `status=OK`), 5h `42 %`, Woche `23 %`, Resetidentitäten
`1789347189 / 1789806057`: `CONTINUE / PRIMARY_ALLOWED`. Mangels vergleichbarem
W3-S-Cost-Receipt wurde keine numerische Reserve erfunden. Zulassungsgrund waren
der vollständig gebundene Scope, die Reversibilität, die explizite
Ownerautorisierung und die zwingende sichere Postcondition.

Preimage: MIDAS HEAD `52010c7b778e24018975e4dd0e1a9fd2a60fd690`, Branch
`main`, 127 per `--untracked-files=all` aufgelöste Dirty-Einträge. Der neue Root
`C:\Users\steph\Projekte\kasrkin` war vor W3-S nicht vorhanden. H.E.S.T.I.A.
war auf HEAD `f7335e3190550f6e2da024f33d9de959e5d97de7` clean. Der installierte
Rainmeter-Sensor und die MIDAS-Source waren bytegleich
`3d8f8601d67e33193566cc4273faf517ed32915d8b758d4a5c5c60e08037c8d1`.

### 28.2 Source Candidate und Rollen

Der neue, lokal mit Git initialisierte, aber weder committete noch getaggte
Project Root besitzt das minimale Layout:

- `tools/codex-usage/`: unveränderte Guard-Runtime, Policy, Validator, Schemas,
  Fixtures und bestehende Testmatrizen;
- `tools/kasrkin/`: Source-/Release-/Installations-/Resolver-/Rollbackwerkzeuge;
- `docs/`: KASRKIN Overview und nichtnormative Evolution Notes;
- `provenance/`: Import-, Dirty-, Dependency-, Adjustment- und
  Source-Candidate-Manifeste;
- `README.md`: minimale Navigation ohne Policyduplikation.

Der finale Candidate lautet `source-candidate-2d8563c405e63f28`, umfasst 46
Source-Dateien und besitzt den Source-Inventory-Digest
`2d8563c405e63f289e568daea9b478fe67dce2539b9bd4d3167204f08e87628f`.
Das MIDAS-Aktivierungsmanifest liegt bytegleich ausschließlich als historisches
Preimage unter `provenance/preimages/`; dieser Candidate ist nicht aktiv.

MIDAS-Workflow, MIDAS-AGENTS, MIDAS-DEV_ENVIRONMENT, Guard-vNext-DONE-Evidence,
Rainmeter-State, Codex-Runtime, ARGUS-Pilot und H.E.S.T.I.A.-Consumer wurden
nicht als KASRKIN-Source vereinnahmt. Ihre Rolle, Pfade, Begründung und spätere
Wave stehen in `provenance/external-dependencies.json`.

### 28.3 Import, Anpassungen und BS

Der Import umfasst 39 Dateien. Jede Zeile bindet Quellpfad, Gitstatus,
Quell-SHA-256, initialen Zielpfad, Import-SHA-256 und Kopiermethode; alle
Importpaare waren unmittelbar nach Kopie byteidentisch. Das vollständige
Dirty-Manifest bindet 127 Einträge mit Status, Worktree-Existenz, Bytezahl,
SHA-256 und vorhandenem Index-Objekt. Historische MIDAS-Preimages blieben
unverändert.

Genau zwei importierte Dateien erhielten explizite Candidate-Anpassungen:

| Datei | Pre-Hash | Post-Hash | Kausaler Grund |
| --- | --- | --- | --- |
| `tools/codex-usage/Test-CodexUsageGuardActivation.ps1` | `bd265418179e206583ba0947096005c60711a05a85f469d7f77b2b7e377f64d9` | `934a9bfca52ab210b0aa9e0435d5ffb382217482553c02d5c3e921278a6a3185` | Aktivierungsregression ohne versteckte MIDAS-Checkout-Abhängigkeit; internes Payload und deklarierte externe Vertragsfingerprints werden getrennt geprüft. |
| `docs/modules/KASRKIN Module Overview.md` | `af19104bda6ca5c284733d5c82c92483ec7393b6284cd760c7759961f5e32f78` | `b699a815a83e821bca9941888ae9ee75d521a121b08aac2ccca1d9574f76482e` | Reale Standalone-Candidate-Navigation und explizite externe MIDAS-Ownership statt gebrochener lokaler Links. |

Beide Records binden Regression und unveränderte Guardsemantik. Policy,
Config, Sensor, Validator, Module und Schemas wurden nicht semantisch geändert.

BS ist bereit: Der Candidate ist inaktiv und vollständig vom weiter aktiven
MIDAS-Pfad getrennt. Bei Fehler kann ausschließlich der neue Root als
unbrauchbar markiert oder kontrolliert entfernt werden; MIDAS-Quelle,
Rainmeter-Sensor/-State und Consumer benötigen keinen Reverse.

### 28.4 W3-S Postcondition und Resume Card

Source Proof: 21 PowerShell-Dateien parsergrün, 28 JSON-Dateien parsebar,
39/39 Imports rekonstruierbar, 106/106 Guard-Fälle grün, 14/14 W3-S-Checks
grün, keine gebrochenen lokalen Links, keine Secretmuster, kein Trailing
Whitespace, keine versteckte MIDAS-Runtimeabhängigkeit. MIDAS `git diff
--check` ist grün; die vorhandene Autocrlf-Warnung für README ist kein
Whitespace-Finding. Die alte MIDAS-Aktivierung bleibt 10/10 grün.

```text
W3_S_COMPLETE
KASRKIN_SOURCE_CANDIDATE_READY
KASRKIN_SOURCE_PROVENANCE_BOUND
BYTE_IDENTICAL_IMPORT_PROVEN
CANDIDATE_ADJUSTMENTS_EXPLICITLY_BOUND
DIRTY_SOURCE_MANIFEST_COMPLETE
SOURCE_INVENTORY_FINGERPRINTED
SOURCE_TESTS_GREEN
OLD_MIDAS_SOURCE_STILL_ACTIVE
MIDAS_CONSUMER_UNCHANGED
HESTIA_CONSUMER_UNCHANGED
NO_CONSUMER_CUTOVER
NO_RUNTIME_STATE_MOVE
MIGRATION_INVENTORY_UNCHANGED
BS_ROLLBACK_READY
W3_I_NOT_STARTED
USAGE_GATE_REQUIRED
```

Nächster exakt erlaubter Schritt: ein neuer kanonischer Usage-Check. W3-I darf
nur bei vollständiger Zulassung des ganzen Installationsblocks beginnen.

## 29. Gate W3-S → W3-I und Usage Safe Closure

Der vorgeschriebene frische Check nach vollständig grüner W3-S-Postcondition
lief am `2026-09-13T23:07:45.1730238+02:00` valide mit `status=OK`, 5h
`21 %`, Woche `19 %`, Resetidentitäten `1789347189 / 1789806057`.
Gegenüber der W3-S-Startbaseline mit denselben Resetidentitäten beträgt der
reale W3-S-Verbrauch 5h `21` und Woche `4` Prozentpunkte.

Das Budgeturteil ist `SAFE_CLOSURE`, weil das 5h-Fenster unter `25 %` liegt.
Der vollständige, erstmalige und große W3-I-Installations-/Pinning-/Driftblock
ist `PRIMARY_REJECTED_FOR_RESERVE`; er wird nicht fragmentiert und wurde nicht
begonnen. Es besteht kein fachlicher W3-S-Blocker und kein offenes P0/P1.

Status: `PAUSED_USAGE_SAFE_CLOSURE`.

Exakter Resume-Punkt: Nach Reset oder validierter Anpassung erneut genau einen
kanonischen Validatorlauf mit `-Refresh` ausführen. W3-I darf erst bei
`CONTINUE` (mindestens 5h `41 %` und Woche `21 %`) und weiter unveränderten
W3-S-Fingerprints/Preimages als gesamter Block erneut auf Zulassung geprüft
werden. Der nächste technische Einstieg ist
`C:\Users\steph\Projekte\kasrkin\tools\kasrkin\Install-Kasrkin.ps1`; vor
Ausführung sind Source-Candidate-, Inventory-, Consumer-, Rainmeter- und
Installations-Preimages erneut gezielt zu validieren.

```text
W3_S_COMPLETE
W3_I_NOT_STARTED
PAUSED_USAGE_SAFE_CLOSURE
RESUME_AFTER_FRESH_CONTINUE_GATE_AND_UNCHANGED_W3S_FINGERPRINTS
W3_M_NOT_STARTED
W3_H_NOT_STARTED
```

## 34. W3-M Attempt 01 — BM Safe Closure

Status: `W3_M_ATTEMPT_ROLLED_BACK / MIDAS_CONSUMER_UNCHANGED /
DIAGNOSIS_NOT_STARTED`.

The fresh canonical start gate at `2026-09-19T15:43:00.6702094+02:00` was
valid with schema 3, sensor 3.1.0, status OK, 5h `100 %` and weekly `89 %`.
The five bound preimages, installed release, receipt, stable command and absent
MIDAS binding were confirmed before mutation.

The atomic transaction created the exact project binding, rewrote the four
bounded MIDAS references and updated only the three affected activation hashes.
Release resolution from the project root was green. The productive proof then
stopped at the disposable drift-case error-code assertion. No diagnosis or fix
was appended to the failed transaction.

BM restored AGENTS, README, DEV, workflow and activation to their exact bound
preimage hashes and removed the binding and temporary proof script. The
disposable root was removed. Activation is green 10/10 and the old direct
validator path is green. No consumer receipt was emitted, H.E.S.T.I.A. was not
changed, the installed KASRKIN release remains available and the old MIDAS
source remains active.

Exact resume: after a fresh canonical usage gate, run a separate read-only,
disposable diagnosis block that captures the resolver's actual drift code and
compares it with the installed resolver contract. Do not mutate MIDAS in that
diagnosis block. A later full W3-M retry requires its own fresh gate and must
again reach either the complete consumer postimage or full BM rollback.

```text
W3_I_COMPLETE
W3_M_OWNER_AUTHORIZED
W3_M_S4R_COMPLETE
W3_M_ATTEMPT_01_ROLLED_BACK
BM_ROLLBACK_COMPLETE
MIDAS_CONSUMER_UNCHANGED
HESTIA_CONSUMER_UNCHANGED
OLD_MIDAS_SOURCE_STILL_ACTIVE
DIAGNOSIS_NOT_STARTED
W3_H_NOT_STARTED
NO_COMMIT_AUTHORIZED
```

### 34.1 Separate diagnosis result

The separately gated diagnosis started from a valid `CONTINUE` measurement at
`2026-09-19T15:50:32.2025766+02:00` with 5h `92 %` and weekly `88 %`.
No MIDAS consumer mutation was made.

The installed, receipt-bound resolver at SHA-256
`221bdbbfdf777413abc9ed41c998eb2f3e6e274f0c21b0f99e7b213c93b81197`
defines the altered-receipt-hash failure as
`KASRKIN_BINDING_RECEIPT_HASH_MISMATCH`. Attempt 01's disposable proof harness
expected the wrong literal `KASRKIN_INSTALLATION_RECEIPT_DRIFT`. This was a
test-oracle error, not a resolver, release, policy or MIDAS contract defect.

The diagnosis block is closed. A complete W3-M retry may start only after a new
canonical gate and must use the resolver's exact bound error code.

### 34.2 W3-M Attempt 02 — BM Safe Closure

Attempt 02 started from a valid canonical gate at
`2026-09-19T15:51:27.5890808+02:00` with 5h `90 %` and weekly `88 %`.
All five preimages matched before the identical cutover postimage was applied.

Release resolution, foreign-CWD resolution, installed refresh, telemetry
envelope, installed policy invocation, activation regression, legacy BM
validator, unbound failure and the corrected drift failure all passed. The
temporary proof harness then failed only while building its report because it
read a nonexistent top-level `decision` property under StrictMode.

BM was nevertheless executed in full. All five files again match their exact
preimages; the binding, harness and temporary root are absent; activation is
green 10/10 and the legacy validator is green. MIDAS and H.E.S.T.I.A. remain
unchanged consumers. A separately gated diagnosis must inspect only the policy
output shape before any further retry.

### 34.3 Separate output-shape diagnosis

The diagnosis gate at `2026-09-19T15:55:03.7333768+02:00` was valid with 5h
`86 %` and weekly `87 %`. The unchanged policy constructor defines
`primaryAdmission` as the top-level admission field; no top-level `decision`
field exists. The retry harness must therefore report
`policy.primaryAdmission`. No consumer mutation occurred in this diagnosis.

The diagnosis is closed. A further productive retry requires a new canonical
gate and otherwise retains the exact Attempt-02 proof contract.

## 35. W3-M Complete — MIDAS Consumer Cutover

Status: `W3_M_COMPLETE / MIDAS_KASRKIN_CONSUMER_BOUND /
BM_ROLLBACK_READY`.

Attempt 03 started from the fresh canonical gate at
`2026-09-19T15:55:34.1372502+02:00`, valid with schema 3, sensor 3.1.0,
status OK, 5h `85 %` and weekly `87 %`. It recreated the deterministic
postimage already fingerprinted by the two prior rolled-back attempts.

MIDAS now binds release `kasrkin-2a0d185b0b04a93f` through
`.kasrkin/binding.json`. The stable `kasrkin` command resolves the exact
release fingerprint and validates the installation receipt, metadata and every
payload file before dispatch. The active MIDAS operator path is
`kasrkin validate -Refresh`; the old local source remains intact only as the BM
rollback path and is not retired in this wave.

The final proof is green for project-root and foreign-CWD resolution, installed
refresh, canonical telemetry envelope, activation 10/10, legacy BM validator,
unbound failure and binding-receipt drift failure. The installed policy proof
from Attempt 02 is reused because binding and all five postimage fingerprints
are byte-identical. The disposable fixture and harness are absent.

The MIDAS-owned receipt is
`docs/tooling-extraction/w3-m-midas-consumer-receipt.json`, SHA-256
`f62edfc12b02760b74a52b2bda81571abf945408727858f14f0851315213d46f`.
It binds release, payload, installation receipt, project binding, all changed
pre-/postimages, runtime state, fail-closed proofs and BM.

H.E.S.T.I.A. remains unchanged and unbound. The Rainmeter state path and sensor
bytes are unchanged, no second scheduled writer exists, active Guard-vNext
semantics and config are unchanged, and `migration-inventory.json` remains
byte-identical. No commit, tag, push, deploy, external write or retirement was
performed.

```text
W3_I_COMPLETE
W3_M_COMPLETE
MIDAS_KASRKIN_CONSUMER_BOUND
KASRKIN_VERSION_PINNED
CHECKOUT_INDEPENDENT_INVOCATION_PROVEN
MIDAS_CONSUMER_RECEIPT_VALID
DRIFT_DETECTION_PROVEN
BM_ROLLBACK_READY
OLD_MIDAS_SOURCE_STILL_PRESENT
HESTIA_CONSUMER_UNCHANGED
RAINMETER_STATE_PATH_UNCHANGED
NO_SECOND_INDEPENDENT_USAGE_WRITER
NO_ACTIVE_POLICY_CHANGE
MIGRATION_INVENTORY_UNCHANGED
W3_H_NOT_STARTED
NO_COMMIT_AUTHORIZED
NEXT_WAVE_OWNER_AUTHORIZATION_REQUIRED
```

Exact next step: no further migration wave may start without a separate owner
authorization and fresh usage gate. W3-H, W6 and old-source retirement remain
locked.

## 36. W3-H H.E.S.T.I.A. Consumer Cutover — S4R

Status: `W3_H_OWNER_AUTHORIZED / W3_H_S4R_COMPLETE /
HESTIA_CUTOVER_NOT_STARTED`.

### 36.1 Authorization and baseline

On 19 September 2026 the owner authorized continuation into W3-H. The fresh
canonical start gate through the bound MIDAS KASRKIN consumer at
`2026-09-19T16:04:08.5812566+02:00` was valid with schema 3, sensor 3.1.0,
status OK, 5h `76 %` and weekly `86 %`. The reset identities were
`1789843380 / 1790412165`.

This authorization opens W3-H only. W6, old-source retirement, W4/W5, commit,
tag, push, deploy, network, Supabase, SQL and device work remain outside scope.
The green MIDAS consumer postimage is a protected cross-repository precondition
and must not be changed by BH or W3-H.

### 36.2 Focused discovery and compatibility

H.E.S.T.I.A. is clean at HEAD
`f7335e3190550f6e2da024f33d9de959e5d97de7`. Its active usage integration is
limited to AGENTS.md, docs/DEV_ENVIRONMENT.md, the HESTIA workflow contract and
the two local files under tools/codex-usage. No KASRKIN reference exists in its
README.

The local sensor SHA-256
`3d8f8601d67e33193566cc4273faf517ed32915d8b758d4a5c5c60e08037c8d1`
is byte-identical to Rainmeter and the installed release. The HESTIA validator
SHA-256 `357c4227e613ba78bf652173aadc24eaf14281719143c7d89284b4cc36bccf6e`
differs from the installed validator only because the installed version adds
the optional standard telemetry-envelope path. Its default legacy JSON
validation and exit-code behavior are preserved. No adapter, source correction
or policy change is required.

### 36.3 Bounded mutation and BH

The atomic W3-H mutation set is:

- add `.kasrkin/binding.json` with the exact installed release identity;
- bind HESTIA AGENTS.md to the stable `kasrkin` command;
- replace the direct checkout invocation in docs/DEV_ENVIRONMENT.md with
  `kasrkin validate -Refresh` while preserving the state path;
- identify the bound KASRKIN release as the technical implementation in the
  HESTIA workflow contract without changing its project-owned workflow rules;
- add a HESTIA-owned W3-H consumer receipt;
- synchronize this Roadmap and Evidence.

No README, template, product, `.gitignore`, local usage source, runtime state,
MIDAS consumer or installed KASRKIN file is changed. The old HESTIA sensor and
validator remain in place solely for BH until a separately authorized retire
wave.

BH removes the HESTIA binding and receipt and restores AGENTS, DEV and workflow
together to these exact preimages:

- AGENTS `a5cd11cbbe30d7e0a02f1bb4e03e02bb0d8da7a1bc25ee54321d344169f1a6a3`;
- DEV `f0fcf4c3a888d30d2544bcb25d7b6c908a08f562d9b12166d844958add6ff036`;
- workflow `9e6f7436ed0fa561a6298a5f24bd97e50ad31701a18c866104b596f212010db9`.

BH must prove the old direct HESTIA validator and must leave the green MIDAS
binding, activation and receipt byte-identical.

### 36.4 S4R forecast and proof oracle

W3-H is medium, local and reversible: three active HESTIA contracts, one
binding, one consumer receipt and the two central control documents. Binding,
contract rewrite and last-mile proof form one indivisible consumer transaction.

The proof chain is documented HESTIA invocation -> stable command -> resolver
-> HESTIA binding -> installation receipt and payload hashes -> installed
validator -> unchanged Rainmeter state -> compact legacy JSON and envelope ->
unchanged HESTIA workflow decision. It also compares installed and old HESTIA
legacy outputs, proves foreign-CWD resolution, unbound/drift failures, BH,
zero second writers, unchanged MIDAS and unchanged inventory.

A new canonical usage gate is mandatory after this S4R and before the first
H.E.S.T.I.A. mutation.

## 37. W3-H Complete — H.E.S.T.I.A. Consumer Cutover

Status: `W3_H_COMPLETE / HESTIA_KASRKIN_CONSUMER_BOUND /
BH_ROLLBACK_READY / W3_COMPLETE`.

The post-S4R gate at `2026-09-19T16:06:21.1129950+02:00` was valid with schema
3, sensor 3.1.0, status OK, 5h `72 %` and weekly `85 %`. The HESTIA and MIDAS
preimages all matched before the atomic cutover.

H.E.S.T.I.A. now binds release `kasrkin-2a0d185b0b04a93f` through its own
`.kasrkin/binding.json`. AGENTS, DEV and the HESTIA workflow contract point to
the stable command while retaining HESTIA-owned workflow rules. The old local
sensor and validator remain byte-identical to their preimages and are retained
only for BH; no removal is part of W3-H.

The real proof is green for root and foreign-CWD resolution, installed refresh,
standard telemetry envelope, semantic equality with the old HESTIA legacy
validator, missing binding and altered receipt-hash failures, preserved BH
sources and a byte-identical MIDAS consumer. The temporary fixture and harness
are absent.

The HESTIA-owned receipt is
`C:\Users\steph\Projekte\H.E.S.T.I.A\docs\tooling-extraction\w3-h-hestia-consumer-receipt.json`,
SHA-256
`669b74d0329f4f21ef52f7c1cb0effbd2be97adbde50f3f0fd9ed1f7d4a58688`.

Both consumers are now pinned to the same exact installed release. Runtime
state, Rainmeter sensor, active project workflow semantics, product code,
inventory and installation remain unchanged. No second scheduled writer,
commit, tag, push, deploy or external action was introduced.

```text
W3_COMPLETE
W3_I_COMPLETE
W3_M_COMPLETE
W3_H_COMPLETE
MIDAS_KASRKIN_CONSUMER_BOUND
HESTIA_KASRKIN_CONSUMER_BOUND
KASRKIN_VERSION_PINNED
CHECKOUT_INDEPENDENT_INVOCATION_PROVEN
MIDAS_CONSUMER_RECEIPT_VALID
HESTIA_CONSUMER_RECEIPT_VALID
DRIFT_DETECTION_PROVEN
BM_ROLLBACK_READY
BH_ROLLBACK_READY
OLD_MIDAS_SOURCE_STILL_PRESENT
OLD_HESTIA_SOURCE_STILL_PRESENT
RAINMETER_STATE_PATH_UNCHANGED
NO_SECOND_INDEPENDENT_USAGE_WRITER
NO_ACTIVE_POLICY_CHANGE
MIGRATION_INVENTORY_UNCHANGED
W4_NOT_STARTED
W6_NOT_STARTED
W7_NOT_STARTED
NO_COMMIT_AUTHORIZED
NEXT_WAVE_OWNER_AUTHORIZATION_REQUIRED
```

Exact next step: a separate owner-authorized W4 gate for the protected ARGUS
pilot archive. W6 semantic cleanup and W7 source retirement remain downstream;
neither may be folded into W3-H.

## 31. W3-T Rebaselining — Codex Tools Source Monorepo

Status: W3_T_DISCOVERY_COMPLETE / SOURCE_MONOREPO_SELECTED /
REHOME_NOT_STARTED.

### 31.1 Owner direction and admission

On 19 September 2026 the owner authorized the revised extraction direction and
gave an explicit go to proceed autonomously as far as the usage contract
permits. The canonical start refresh at
2026-09-19T11:00:39.4016844+02:00 was valid with schema 3, sensor 3.1.0,
status OK, 88 percent 5h remaining and 98 percent weekly remaining. Reset
identities were 1789825365 / 1790412165.

The addendum
C:\Users\steph\Desktop\Addendum — Codex Tools Monorepo, Shared Workstation
Tooling & Revised Extraction Direction.md was read completely. Its SHA-256 is
981ee6702a4a0eeef356e94753e48f798798db59a8a6eb9ea9fa81000bf313e0.
The preceding steelman and premortem remain decision input; they do not replace
the live topology evidence below.

### 31.2 Focused topology discovery

The focused discovery result is recorded in
docs/tooling-extraction/codex-tools-topology-inventory.json, SHA-256
bf478bac2fa0a6627ed279aedaebfbcfdc15945f506346073fb6d08ebd9b687e.
It is additive; migration-inventory.json remains immutable.

| Root | Live finding | Disposition |
| --- | --- | --- |
| M.I.D.A.S / H.E.S.T.I.A. | Independent product repositories and current consumers | Remain independent; no consumer cutover in W3-T |
| kasrkin | Proven source candidate, no installation and no command binding | First source-only monorepo component |
| HD2 Modding | Domain workspace; 8,126 files and 43,483,237,157 bytes; tools subtree about 1.83 GiB | Domain data stays local; portable payload assessment belongs to a later program |
| HD2 Mod Updater | Distinct local desktop product | No move in this roadmap |
| X4 Modding | Domain workspace; 7,337 files and 1,252,276,300 bytes | Later separate discovery |
| Hydro Rush | Product workspace | Not workstation tooling |
| G915 and Backup | External upstream / backup | Excluded |
| Gladius | Predominantly environment material; no proved shared-tool source | No move without separate evidence |
| Projekte\docs | Three legacy cross-project context documents | Preserve and classify later |

The target root C:\Users\steph\Projekte\codex-tools does not yet exist. The
current KASRKIN source root and all protected consumer/runtime preimages remain
unchanged.

### 31.3 Owner-delegated architecture decision

The selected model is ADOPT_CODEX_TOOLS_SOURCE_MONOREPO_NOW:

- Create a source-only repository at C:\Users\steph\Projekte\codex-tools.
- Rehome KASRKIN first at apps/kasrkin by byte-preserving parallel copy and
  proof before any old-root removal.
- Keep installed releases, mutable runtime state, caches, large binaries and
  portable third-party payloads outside Git.
- Keep component ownership explicit. Root policy may provide repository-wide
  safety and navigation, but no root-level shared semantic or workflow
  authority is introduced.
- Do not create speculative empty component directories for ARGUS, desktop
  companions, HD2/X4 tooling or Blender.
- Keep the current MIDAS roadmap limited to W3-T, KASRKIN, ARGUS and the
  MIDAS/H.E.S.T.I.A. consumer boundary. Broader workstation-tooling work will
  require its own codex-tools program and evidence.

Fallback models remain documented but are not selected: a thin workspace hub
with independent repositories, or deferral of the rehome.

### 31.4 Contract amendments

- W3T-OD-01 approves the source-only codex-tools monorepo and its ownership
  boundary.
- W3T-OD-02 supersedes only the earlier KASRKIN checkout location. Existing
  candidate identity, provenance and proofs must be preserved or explicitly
  regenerated from a documented byte delta.
- W3T-OD-03 changes only the future planned ARGUS source location. It does not
  authorize ARGUS creation, extraction or consumer cutover now.
- W3T-OD-04 reaffirms OD-03 and W2-SWB-FREEZE-01: shared source location does
  not imply shared workflow, policy or runtime authority.
- W3T-OD-05 separates source checkout, versioned installation, mutable runtime
  state, external payloads, product bindings and evidence as distinct roles.
- W3T-OD-06 inserts W3-T before W3-I. W3-M and W3-H remain locked.

No historical W0/W1/W2 record is rewritten. The misplaced heading 30.3 before
heading 30 is retained as a historical formatting erratum; this section is the
additive correction.

### 31.5 Revised execution waves and resume

1. W3-TD — focused topology discovery and architecture decision: complete.
2. W3-TR — create the minimal repository, copy KASRKIN byte-identically, bind
   the rehome receipt and rerun invalidated source proofs: next.
3. W3-I — harden, install and prove the versioned command from the new source
   root.
4. W3-M and W3-H — still owner-locked and not started.
5. W4-W7 — remain downstream and must be re-estimated after W3-I.

A second historical W3-I gate on 14 September 2026 observed a valid 85 percent
5h / 16 percent weekly state and did not start installation. That observation
is evidence only and is not a current baseline.

Before W3-TR, run a new canonical refresh and validator. If admitted, complete
the rehome as one coherent block through byte-identity proof, updated
provenance, documentation and a safe postcondition. Do not install KASRKIN,
change consumers, move runtime state, remove the old source root, commit, tag
or push during W3-TR.

### 30.3 Korrigierter Source Candidate vor Installation

Die drei Preflight-Blocker wurden ausschließlich im KASRKIN-Root geschlossen.
Installer und Resolver verwenden nun dieselbe explizite `payloadFiles`-Menge
für den Payloaddigest; `release-metadata.json` bleibt als separat hashgeprüfte
installierte Datei gebunden. Das Receipt bindet außerdem Resolver, Shim und
den mitinstallierten Uninstaller jeweils mit absolutem Pfad, Bytezahl und
SHA-256. Projektbindings binden zusätzlich den SHA-256 des Receipts. BI verlangt
diesen erwarteten Receipt-Hash und prüft alle absoluten Ownership-Grenzen.

Vier bestehende KASRKIN-Bootstrap-/Navigationsdateien besitzen explizite neue
Pre-/Post-Hash-Records; `Test-KasrkinInstallation.ps1` ist als neue
KASRKIN-eigene W3-I-Proofdatei inventarisiert. Der neu erzeugte Candidate ist
`source-candidate-2c264ced0d6645f1`, umfasst 47 Dateien und besitzt den
Source-Inventory-Digest
`2c264ced0d6645f1a743b6ac59aede70ae47729774f92ab6808b8edf15d2d743`.
Das Candidate-Manifest hat SHA-256
`bddf59504a41e92ac4d8043685ab186d38e3a45621e92f20e03a73810d27df61`,
das aktualisierte Importmanifest
`957f6f97c56dd8b1d4057587b85e587445e739606457a0440eac2a19e93181c7`
und das Adjustment-Manifest
`6c2e7992bc011b865251ab767ef8ef4769825ad0b90db7809ad3986c574992bf`.
Dirty- und External-Dependency-Manifeste blieben unverändert.

Der vollständige invalidierte Source-Proof ist erneut grün: 22
PowerShell-Dateien parsergrün, 28 JSON-Dateien parsebar, 39/39 Imports ohne
Drift, 106/106 Guardfälle und 14/14 W3-S-Checks. Der Installationsroot, Shim und
Command sind weiterhin abwesend. Vor der ersten synthetischen oder realen
Installation ist jetzt der vorgeschriebene zweite kanonische Usage-Gate fällig.

## 30. W3-I Owner-Usage-Ausnahme und Preflight

Status: `W3_I_PREFLIGHT_ADMITTED / INSTALLATION_NOT_STARTED`.

### 30.1 W3I-USAGE-EXCEPTION-01

Der Owner hat nach W3-S einmalig und scopespezifisch entschieden, dass ein
frischer valider 5h-Wert im `CONTINUE`-Bereich den vollständigen W3-I-Block
auch bei einem Weekly-Restwert unter der zuvor dokumentierten Grenze von
21 Prozent zulässt. Die zunächst auf mindestens 19 Prozent Weekly gebundene
Ausnahme wurde am 14.09.2026 ausdrücklich auf den kanonisch validierten
Startwert von 95 Prozent 5h und 18 Prozent Weekly erweitert. Der Owner
akzeptiert das verbleibende Full-Closure-Risiko.

Der zugehörige kanonische `-Refresh` vom
`2026-09-14T18:03:36.5012162+02:00` war valide (`schemaVersion=3`,
`sensorVersion=3.1.0`, `status=OK`, Alter 1 Sekunde), mit 5h `95 %`, Woche
`18 %` und Resetidentitäten `1789419652 / 1789806057`. Dieser Wert ist die
ownergebundene W3-I-Startbaseline. Die Ausnahme ändert keine allgemeine
Guard-Policy, keinen Floor und keine Configdatei. W3-M, W3-H, Consumer-Cutover
und alte Sourceentfernung bleiben gesperrt; W3-I darf nicht künstlich
fragmentiert werden und muss bis zu einer sicheren Installations- oder
BI-Rollback-Postcondition geführt werden.

### 30.2 Preflight-Befund vor Installation

Die W3-S-Fingerprints und geschützten Preimages wurden live unverändert
bestätigt. Der eigenständige Source-Proof ist mit 106/106 Guardfällen und der
W3-S-Proof mit 14/14 Checks grün. Der geplante Installationsroot
`%USERPROFILE%\.local\share\kasrkin` existiert nicht, `%USERPROFILE%\.local\bin`
liegt bereits im User- und Prozess-PATH, und `kasrkin` ist nicht belegt.

Die statische Installer-/Resolverprüfung fand vor jeder Installation drei
Blocker im neuen KASRKIN-Bootstrap: Der Installer berechnet den Payloaddigest
ohne `release-metadata.json`, während der Resolver diese Datei einbezieht; der
im Receipt vorbereitete Uninstallerpfad ist checkoutgebunden; Resolver und
Command-Shim sind nicht mit eigenen Hashes im Receipt gebunden. Diese Punkte
werden ausschließlich in KASRKIN-eigenen Dateien als zusätzliche explizite
Candidate-Anpassung mit Pre-/Post-Hashes korrigiert. Danach werden alle
abhängigen Source-Fingerprints und invalidierten W3-S-Proofs erneuert und vor
der eigentlichen Installation ein weiterer kanonischer Usage-Gate ausgeführt.

```text
W3_S_COMPLETE
W3I-USAGE-EXCEPTION-01_BOUND
W3_I_PREFLIGHT_ADMITTED
INSTALLATION_NOT_STARTED
MIDAS_CONSUMER_UNCHANGED
HESTIA_CONSUMER_UNCHANGED
W3_M_NOT_STARTED
W3_H_NOT_STARTED
```

## 38. W4 A.R.G.U.S. Pilot Archive — S4R

Status: `W4_S4R_COMPLETE / ARCHIVE_NOT_STARTED`.

### 38.1 Owner scope and start admission

The owner authorized continuation after confirming that the existing ARGUS
V1.2–V1.6 files are legacy and that a later ARGUS V1.0 will be designed as a
new product from the separate pitch. This authorization opens W4 only. It does
not authorize creation of `C:\Users\steph\Projekte\argus`, implementation of
the V1.0 pitch, a benchmark run, retirement of originals, W6, W7 or a commit.

The canonical W4 start refresh at
`2026-09-19T16:14:20.4259526+02:00` was valid with schema 3, sensor 3.1.0,
status OK, 5h `61 %`, weekly `83 %` and reset identities
`1789843380 / 1790412165`. This admitted the focused W4 discovery and S4R.
A fresh gate remains mandatory before the archive transaction.

### 38.2 Contract review and exact archive boundary

The complete ARGUS V1.0 pitch was read as design context. It confirms that the
closed-incomplete pilot is historical provenance only. The later V1.0 starts a
new lifecycle, imports lessons, invariants and failure classes, and does not
inherit the old runtime, copy/paste orchestration or MIDAS path assumptions.

The owner-bound W4 payload is exactly:

- the historical ARGUS overview and frozen campaign document from MIDAS;
- the complete 70-file benchmark tree, including its empty `run-responses`
  directory;
- the standalone historical operator console;
- the complete 122-file stage root and 2-file run-evidence root.

This is 197 files and 1,707,140 bytes. Nested benchmark classes are proof
subsets, not duplicate archive copies. The exact archived Codex session remains
`CODEX_RUNTIME / EXTERNAL_DO_NOT_TOUCH`: W4 records its existing path, byte
count and SHA-256 but does not copy, modify or recursively inspect `.codex`.

All W0 fingerprints were reproduced live. There are no reparse points. The
target `C:\Users\steph\Archives\ARGUS-PILOT\v1.2-v1.6` and its parent ARGUS
archive directory are absent, so no foreign content can be overwritten.

### 38.3 Archive layout, proof oracle and B4

The archive uses one copy of every payload byte under:

```text
origins/MIDAS/...
origins/Projects/argus-operator-console.html
origins/ARGUS-RUN-STAGES/...
origins/ARGUS-RUN-EVIDENCE/...
```

New archive-owned metadata consists of a human-readable index, a deterministic
manifest, an integrity validator and a restore-to-disposable-root helper. The
manifest binds source path, archive-relative path, byte count and SHA-256 for
every payload file, records empty directories and external references, and
computes a non-circular payload digest from sorted
`archiveRelativePath|byteLength|sha256` records. Metadata files are bound by
the MIDAS W4 receipt rather than included in their own payload digest.

The archive is built in a unique staging directory below the approved archive
parent, fully validated, restore-proven in a unique disposable root and only
then renamed to the final target. Every copy is no-overwrite. B4 removes only a
verified W4-owned staging candidate if the transaction fails; no historical
source is removed or repaired. After successful publication, all originals
remain in place until a separate W7 retire authorization.

W4 is green only when source and archive inventories, all file hashes, archive
navigation, external-reference observation, parser/JSON checks and the
disposable restore proof pass; the migration inventory and both KASRKIN
consumer bindings must remain unchanged.

### 38.4 S4R forecast and exact resume

The archive transaction is `medium`: 197 small local files, about 1.7 MiB,
bounded deterministic metadata, one disposable restore exercise and central
documentation synchronization. No product runtime, network, device, database
or benchmark work is involved. The block must not be split after archive
creation; it runs through final publication and proof or complete B4 safe
closure.

Exact resume: run one fresh canonical usage refresh. At `CONTINUE`, recheck
the protected preimages and absent target, then execute the complete W4 archive
transaction. Otherwise leave `W4_S4R_COMPLETE / ARCHIVE_NOT_STARTED` and stop
at the validator-defined boundary.

## 39. W4 Complete — Protected A.R.G.U.S. Pilot Archive

Status: `W4_COMPLETE / ARGUS_PILOT_ARCHIVED / ORIGINALS_RETAINED`.

### 39.1 Final admission and archive identity

The post-S4R canonical gate at `2026-09-19T16:21:25.9308700+02:00` was
valid with schema 3, sensor 3.1.0, status OK, 5h `51 %`, weekly `82 %` and
reset identities `1789843380 / 1790412165`. It admitted the complete atomic
W4 archive transaction.

The protected archive is now published at
`C:\Users\steph\Archives\ARGUS-PILOT\v1.2-v1.6`. Its identity is:

| Field | Value |
| --- | --- |
| Archive ID | `argus-pilot-v1.2-v1.6` |
| Payload | 197 files / 1,707,140 bytes / one empty directory |
| Payload digest | `b991822dfc4976a7dca17df03e1cb16c2bd6910f1306e1f233cd600804a3fc16` |
| Manifest | `39b2ad43fe61d1ac249e87e02b21b197d53239d0a76f50bbc404c1d14cd872fc` |
| Proof | `98c53dbb469197e0a23d781a3239978da8873af77f9c3dc5b66a9b946cadf0de` |
| MIDAS receipt | `0aeb7bc4945211eb038c350a2d487701277a92bcc77d0d5ad0249e9491c0be29` |

The payload exists once under the approved origin namespaces. The exact Codex
session remains outside the archive as a hash-bound
`CODEX_RUNTIME / EXTERNAL_DO_NOT_TOUCH` reference. No `.codex` content was
copied.

### 39.2 Proof and safe postcondition

The staging archive passed complete file-count, byte-count and per-file hash
validation before publication. Both archive scripts are parser-clean and both
JSON metadata files are parseable. A complete restore into a new disposable
root reproduced all 197 files with no missing, extra or drifted payload. The
restore root and all staging roots were removed after exact containment checks.
Final validation also passed from `C:\Windows\Temp`, including the external
session observation.

All source preimages were revalidated after copying and remain byte-identical.
The historical helper and console were not executed. One newly generated
README had malformed Markdown escapes during the first metadata render; only
that new archive-owned index was corrected before receipt binding. Historical
payload, manifest, digest and restore result were unaffected.

MIDAS current navigation now points to the W4 receipt while retaining the
historical overview link. The overview, campaign, benchmark tree, standalone
console, stage root and evidence root remain at their original paths. The
migration inventory remains byte-identical. MIDAS and H.E.S.T.I.A. retain the
same exact KASRKIN binding and release; activation remains 10/10 with no side
effects and no additional scheduled usage writer exists.

### 39.3 Boundary and resume

B4 is ready: the immutable archive and reproducible restore path are proven,
while original retirement remains forbidden without the separate W7 owner
authorization. The later ARGUS V1.0 project root was not created and no pitch
implementation, benchmark run, runtime migration or product cutover occurred.

The exact next wave is W5: an additive handoff for a separate ARGUS V1.0
product roadmap using the archived pilot only as provenance. W5 must not create
the product root or implement V1.0 and requires its own owner-authorized gate.
W6 and W7 remain downstream.

```text
W3_COMPLETE
W4_COMPLETE
ARGUS_PILOT_ARCHIVE_READY
ARGUS_PILOT_PAYLOAD_BYTE_IDENTICAL
ARGUS_PILOT_RESTORE_PROVEN
ARGUS_PILOT_ORIGINALS_RETAINED
CODEX_RUNTIME_EXTERNAL_REFERENCE_ONLY
B4_ROLLBACK_READY
MIDAS_KASRKIN_CONSUMER_UNCHANGED
HESTIA_KASRKIN_CONSUMER_UNCHANGED
MIGRATION_INVENTORY_UNCHANGED
ARGUS_V1_NOT_STARTED
W5_NOT_STARTED
W6_NOT_STARTED
W7_NOT_STARTED
NO_COMMIT_AUTHORIZED
NEXT_WAVE_OWNER_AUTHORIZATION_REQUIRED
```

## 40. W5 Complete — A.R.G.U.S. V1.0 Product Handoff

Status: `W5_COMPLETE / ARGUS_V1_HANDOFF_READY / PRODUCT_NOT_STARTED`.

### 40.1 Owner authorization and restricted admission

The owner explicitly authorized W5. The canonical start refresh at
`2026-09-19T16:34:39.3754451+02:00` was valid with schema 3, sensor 3.1.0,
status OK, 5h `32 %`, weekly `79 %` and reset identities
`1789843380 / 1790412165`.

The usage decision was `CONTINUE_WITH_CAUTION`. W5 was admitted as the single
`BOUNDED_DOCUMENTATION` block of this Restricted-Work Episode: one additive
handoff, one machine-readable receipt, current MIDAS navigation and central
Roadmap/Evidence closure. Product source, runtime, installation, archive,
consumer and monorepo files were prohibited. The episode is now `CONSUMED`;
no further bounded or primary block may begin before a contract-valid new
episode.

### 40.2 Bound handoff and superseding source target

The complete unchanged product pitch is bound at SHA-256
`45884afea39df16c7baf8116ea1a9ff1664cb05546f0119c7ebb7b87e227ddfc`.
The green W4 archive is bound through receipt
`0aeb7bc4945211eb038c350a2d487701277a92bcc77d0d5ad0249e9491c0be29`,
manifest `39b2ad43fe61d1ac249e87e02b21b197d53239d0a76f50bbc404c1d14cd872fc`
and payload digest
`b991822dfc4976a7dca17df03e1cb16c2bd6910f1306e1f233cd600804a3fc16`.

W3T-OD-03 supersedes the earlier standalone source-root proposal. The current
planned V1.0 component root is
`C:\Users\steph\Projekte\codex-tools\apps\argus`, not
`C:\Users\steph\Projekte\argus`. Both candidate roots remain absent. The
existing monorepo stays source-only and supplies no shared ARGUS workflow or
runtime authority.

The human-readable handoff is
`docs/tooling-extraction/ARGUS V1.0 Product Handoff.md`, 7,863 bytes, SHA-256
`26cc81ec8bd868466530fb2370bc28217e823e0a80375777ce09647ec94d294c`.
Its receipt is
`docs/tooling-extraction/w5-argus-v1-handoff-receipt.json`, 2,818 bytes,
SHA-256
`062abb1247bd6e4a36c85171ac6ed9b31986c5a338cb964687272d1a75a45737`.

### 40.3 Product boundary and deferred decisions

The handoff binds the new product as local, personal, Codex-specific and free
of separately billed model API calls. V1.0 starts from version 1.0 and imports
only pilot lessons, invariants and failure classes. It does not inherit old
runtime roots, copy/paste orchestration, MIDAS path assumptions, historical
console code or an invented benchmark result.

Controller/UI separation, frozen campaign and scoring bundles, explicit role
separation, prebound session identity, immutable raw evidence, distinct run
integrity/task performance/qualitative judgment/usage eligibility, honest
replicate interpretation, fixture-only dry runs and the narrow KASRKIN
consumer interface are mandatory inputs to the later product roadmap.

Physical data root, release/install contract, first UI technology, corpus,
scoring, history schema, owner-action protocol and exact KASRKIN interface
remain intentionally deferred to that roadmap. W5 decides none of them.

### 40.4 B5, finding and resume

B5 is documentation-only and additive. A later correction may supersede the
handoff or remove its current README navigation, but must not change the W4
archive or undo W3T-OD-03. No pilot byte, KASRKIN consumer, runtime state,
scheduled writer, migration inventory or H.E.S.T.I.A. file changed.

`TEX-W5-001 / P2`: the `codex-tools` root README still says KASRKIN consumer
cutover has not started, although W3-M and W3-H are complete. This stale
navigation does not affect installed releases or consumers and is outside the
restricted W5 write set. Route it to W6 documentation/ownership cleanup; do
not expand W5.

Current migration-track next step: W6-M semantic ownership and reference
cleanup, under a fresh gate and separate atomic boundary; W6-H follows
independently. ARGUS product-track next step: a separate owner-authorized V1.0
product roadmap whose first work is focused contract/discovery. Neither may
start in the consumed Restricted-Work Episode. W7 remains downstream.

```text
W3_COMPLETE
W4_COMPLETE
W5_COMPLETE
ARGUS_V1_HANDOFF_READY
ARGUS_V1_PRODUCT_NOT_STARTED
ARGUS_COMPONENT_ROOT_ABSENT
PILOT_ARCHIVE_UNCHANGED
B5_ROLLBACK_READY
MIDAS_KASRKIN_CONSUMER_UNCHANGED
HESTIA_KASRKIN_CONSUMER_UNCHANGED
MIGRATION_INVENTORY_UNCHANGED
RESTRICTED_WORK_EPISODE_CONSUMED
W6_NOT_STARTED
W7_NOT_STARTED
NO_COMMIT_AUTHORIZED
FRESH_USAGE_GATE_REQUIRED
```

## 41. W6-M Complete — MIDAS Ownership and Reference Cleanup

Status: `W6_M_COMPLETE / MIDAS_GOVERNANCE_CHAIN_PROVEN`.

### 41.1 Admission and focused S4R

The owner authorized W6-M only. The canonical start refresh at
`2026-09-19T20:43:11.9958512+02:00` was valid with schema 3, sensor 3.1.0,
status OK, 5h `100 %` and weekly `76 %`. The decision was
`CONTINUE / PRIMARY_ALLOWED`.

Focused S4R classified W6-M as a medium, local and reversible
documentation/integration block. It required no release, policy, runtime,
writer, archive, ARGUS or H.E.S.T.I.A. mutation. The complete green W3-M
contract and activation bytes formed B6M; the installed release and project
binding remained fixed.

### 41.2 Final ownership chain

The exact release selected by `.kasrkin/binding.json` is the sole executable
KASRKIN detail source. KASRKIN owns decision semantics; MIDAS owns when to
consult that oracle and how admitted work is executed, rolled back and closed.
The existing detailed prose in the MIDAS workflow contract is explicitly a
consumer projection and cannot override the release. Any mismatch is
`CONTRACT_DRIFT` and blocks new work.

`.kasrkin/activation.json` binds the release, MIDAS consultation contracts,
the current codex-tools integration contract and the read-only proof script.
The former `tools/codex-usage/guard-activation.json` is byte-identical at
`50f93f15f9698c433b30c883dae7b5e5b64ee93e93a946ede0ac11ccef744af3`,
inactive and retained only as B6M/BM rollback evidence. No second active policy
authority exists.

Current cross-project navigation is
`C:\Users\steph\Projekte\codex-tools\docs\architecture\KASRKIN Integration.md`.
The KASRKIN source-candidate files remain immutable release-source provenance;
the standalone source proof is still green. `TEX-W5-001` is `CLOSED` because
the codex-tools root now records both proven consumer cutovers.

### 41.3 Proof, B6M and resume

The machine-readable receipt is
`docs/tooling-extraction/w6-m-midas-ownership-receipt.json`, 6,380 bytes,
SHA-256 `c494acbfe4814a8f265e4d1a3a92b33a2115510ee80bde9186069ba77796a413`.
The active proof resolves the pinned release from `docs` as a foreign CWD,
validates eight consultation artifacts and reads a valid stored usage state.
The KASRKIN source proof remains green with 47 files, seven suites and 106
cases. Binding, installed payload, policy, runtime state and writer topology
are unchanged.

B6M restores the six MIDAS contract preimages together, removes only the new
MIDAS activation/proof, restores the two codex-tools navigation preimages and
removes the W6 integration document. The legacy activation was 10/10 green
immediately before mutation; its postimage hash mismatch is expected while it
is inactive and proves that partial rollback is forbidden. Binding, installed
release, Rainmeter state, legacy source, H.E.S.T.I.A. and pilot archive are
preserved.

The migration track resumes only at independently authorized W6-H after a
fresh gate. W7, ARGUS V1.0 and commit remain blocked.

```text
W3_COMPLETE
W4_COMPLETE
W5_COMPLETE
W6_M_COMPLETE
MIDAS_GOVERNANCE_CHAIN_PROVEN
MIDAS_KASRKIN_ACTIVATION_PROVEN
KASRKIN_VERSIONED_RELEASE_UNCHANGED
TEX_W5_001_CLOSED
B6M_ROLLBACK_READY
HESTIA_KASRKIN_CONSUMER_UNCHANGED
PILOT_ARCHIVE_UNCHANGED
ARGUS_V1_PRODUCT_NOT_STARTED
ARGUS_COMPONENT_ROOT_ABSENT
MIGRATION_INVENTORY_UNCHANGED
W6_H_NOT_STARTED
W7_NOT_STARTED
NO_COMMIT_AUTHORIZED
NEXT_WAVE_OWNER_AUTHORIZATION_REQUIRED
```

## 42. W6-H Complete — H.E.S.T.I.A. Ownership and Reference Cleanup

Status: `W6_COMPLETE / HESTIA_GOVERNANCE_CHAIN_PROVEN`.

### 42.1 Admission and focused S4R

The owner separately authorized W6-H. The canonical start refresh at
`2026-09-19T21:02:32.1981877+02:00` was valid with schema 3, sensor 3.1.0,
status OK, 5h `72 %` and weekly `71 %`. The decision was `CONTINUE`.

Focused S4R classified W6-H as a medium, local and reversible
documentation/integration block. The green W3-H consumer state formed the
B6H preimage: binding and consumer receipt, three already adapted contracts,
three untouched template files, the installed release and both legacy
rollback sources were hash-bound before mutation. MIDAS, codex-tools, W4/W5,
ARGUS, runtime state and the migration inventory were protected inputs.

### 42.2 Final H.E.S.T.I.A. ownership chain

The exact release selected by H.E.S.T.I.A.'s `.kasrkin/binding.json` is the
sole executable KASRKIN decision source. H.E.S.T.I.A. owns when to consult it
and how an admitted result is applied to its own execution, rollback, product
and owner gates. The detailed table in the H.E.S.T.I.A. workflow contract is
now explicitly a consumer projection and cannot override the release.

`.kasrkin/activation.json` binds the release, the unchanged cross-project
integration contract and seven H.E.S.T.I.A.-local consultation/proof
artifacts. The local `tools/codex-usage/` sensor and validator remain unchanged,
inactive rollback sources. No MIDAS contract import and no second active policy
authority were created.

### 42.3 Proof, B6H and resume

The machine-readable receipt is
`C:\Users\steph\Projekte\H.E.S.T.I.A\docs\tooling-extraction\w6-h-hestia-ownership-receipt.json`,
5,564 bytes, SHA-256
`392d76979fd9a3e7eeb88f7901a8ba543dc643ab531dd2a5485136315821582e`.
The active proof resolves `kasrkin-2a0d185b0b04a93f` from `H.E.S.T.I.A/docs`,
validates eight consultation artifacts and reads a valid stored state. A
disposable mirror passed in the valid case and failed closed with exit 1 when
one consultation artifact was absent; it was then removed.

The standalone KASRKIN source-candidate proof remains green with 47 files,
seven suites and 106 cases. The older W3-S aggregate proof is intentionally
invalidated because it asserts the pre-cutover consumer fingerprints and an
unchanged H.E.S.T.I.A. worktree; it is historical evidence, not the active
post-W6 consumer oracle.

B6H restores the six H.E.S.T.I.A. contract/template preimages together and
removes only the W6-H activation/proof. Binding, W3-H receipt, installed
release, Rainmeter state, legacy rollback sources and the complete MIDAS
consumer remain in place. Partial rollback is invalid.

W6 is complete. The migration track stops at the W7 owner boundary. W7 may
begin only after explicit owner authorization, a fresh canonical usage gate
and an exact candidate-specific retirement manifest. ARGUS V1.0 and commit
remain separate and blocked.

```text
W3_COMPLETE
W4_COMPLETE
W5_COMPLETE
W6_COMPLETE
W6_M_COMPLETE
W6_H_COMPLETE
MIDAS_GOVERNANCE_CHAIN_PROVEN
HESTIA_GOVERNANCE_CHAIN_PROVEN
MIDAS_KASRKIN_ACTIVATION_PROVEN
HESTIA_KASRKIN_ACTIVATION_PROVEN
KASRKIN_VERSIONED_RELEASE_UNCHANGED
TEX_W5_001_CLOSED
B6M_ROLLBACK_READY
B6H_ROLLBACK_READY
PILOT_ARCHIVE_UNCHANGED
ARGUS_V1_PRODUCT_NOT_STARTED
ARGUS_COMPONENT_ROOT_ABSENT
MIGRATION_INVENTORY_UNCHANGED
W7_NOT_STARTED
NO_COMMIT_AUTHORIZED
NEXT_WAVE_OWNER_AUTHORIZATION_REQUIRED
```

## 43. W7 Owner Authorization and S4R — Revised Archive Rehome

Status: `W7_OWNER_AUTHORIZED / W7_S4R_COMPLETE / W7_MUTATION_NOT_STARTED`.

### 43.1 Owner-bound target and meaning

The owner authorizes the complete conditional W7 transaction. The proven W4
archive remains the only current archive until its successor passes every
proof. Its permanent organizational successor is:

`C:\Users\steph\Projekte\Backup\Old\ARGUS-PILOT\v1.2-v1.6`

This target is an `ORGANIZATIONAL_LEGACY_ARCHIVE` on the same physical C:
drive, not independent disaster recovery. Do not create `codex-tools/archive`
or `apps/argus-legacy`. W4 manifest, proof, receipt and W5 handoff/receipt are
immutable historical evidence and must not be rewritten to disguise their
original path.

### 43.2 Authorized transaction and destructive boundary

W7 first creates an immutable candidate manifest. It then copies all 202 W4
archive files through a unique no-overwrite staging root, proves complete-tree
and 197-file payload identity, validates the archive from a foreign CWD and
performs a disposable restore. Only after green publication at the new target
may the former W4 root become a retirement candidate.

The same owner authorization conditionally permits retirement of the exact
manifested legacy copies after their independent successor/consumer proofs:

- MIDAS `tools/codex-usage`, KASRKIN module overview and guard evolution notes;
- H.E.S.T.I.A. `tools/codex-usage` and its obsolete ignore/reference residue;
- the MIDAS ARGUS overview, frozen campaign and complete benchmark tree;
- `C:\Users\steph\Projekte\argus-operator-console.html`;
- `C:\Users\steph\ARGUS-RUN-STAGES` and `C:\Users\steph\ARGUS-RUN-EVIDENCE`;
- the former W4 archive root, last and only after the new archive is proven.

Before deletion, resolve every absolute target, reject reparse points and
unknown/extra content, compare it to the candidate manifest and verify that it
stays inside the explicitly authorized root. Failure before publication removes
only a verified staging root. Failure after any retirement restores the exact
candidate from its proven successor/preimage before diagnosis continues.

Never retire the installed KASRKIN release, stable shim, Rainmeter sensor/state,
project bindings/activations, W3-W6 receipts, W5 handoff, migration inventory,
Codex runtime session or new archive. Activations and active contracts must be
updated from legacy rollback-source bindings to the proven retired state before
the corresponding source tree is removed. ARGUS V1.0 implementation and commit
remain outside W7.

### 43.3 S4R result and exact resume

The start gate at `2026-09-19T21:28:52.3047072+02:00` was valid at 45 percent
5h / 67 percent weekly. S4R proved all 197 original ARGUS files exact against
W4, both consumer activations green, the KASRKIN source candidate green with 47
files / seven suites / 106 cases, no target collision and no reparse points.

The mandatory post-S4R gate at `2026-09-19T21:32:28.1066190+02:00` was valid at
36 percent 5h / 66 percent weekly and therefore
`CONTINUE_WITH_CAUTION`. W7 is a large destructive transaction and was not
started. This owner authorization remains valid and must not be requested
again.

Exact resume: perform one fresh canonical gate. Only `CONTINUE` with adequate
full-closure reserve admits the entire W7 block, beginning with the immutable
candidate manifest and ending at either the complete green postcondition or
full B7/B7H rollback. Do not split W7 merely to fit a low bucket.

```text
W7_OWNER_AUTHORIZED
W7_S4R_COMPLETE
W7_MUTATION_NOT_STARTED
ARGUS_ARCHIVE_REHOME_NOT_STARTED
NO_LEGACY_SOURCE_REMOVED
FRESH_CONTINUE_GATE_REQUIRED
```

## 44. Post-W7 Migration Closure Review — Planned, Not W8

Status: `POST_W7_CLOSURE_REVIEW_PLANNED / NOT_STARTED`.

This section preserves the planning state at the W7 boundary. The completed
current state is recorded in section 46.

The one-time empirical closure review is specified in
[`docs/tooling-extraction/Post-W7 Migration Closure Review.md`](tooling-extraction/Post-W7%20Migration%20Closure%20Review.md).
It is not a KASRKIN Future Thought and not an operational W8. W7 remains the
last operational migration wave.

The review may begin only after W7 is fully green, no destructive migration
work remains and a fresh canonical usage gate admits its separate read-mostly
block. It does not inherit W7 execution authorization and must not start
automatically. Its allowed result is one compact closure report and any
explicitly authorized closure-documentation sync; it may not implement
KASRKIN, ARGUS V1, another migration, a release or a commit.

The registered YouTube input is hypothesis material only. It is classified as
`EXTERNAL_INPUT / NOT_AUTHORITATIVE_SPECIFICATION /
NOT_PROOF_OF_UNDOCUMENTED_MODEL_BEHAVIOR`. Historical or allegedly leaked
system-prompt claims are not authoritative evidence.

Current execution order:

```text
W7_OPERATIONAL_CLOSURE
-> POST_W7_CLOSURE_REVIEW_OWNER_BOUNDARY
-> FUTURE_THOUGHTS_OR_PRODUCT_ROADMAPS
```

```text
POST_W7_CLOSURE_REVIEW_PLANNED
POST_W7_CLOSURE_REVIEW_NOT_STARTED
POST_W7_CLOSURE_REVIEW_CONTRACT_BOUND
W7_REMAINS_FINAL_OPERATIONAL_WAVE
NO_REVIEW_RESULT_PREDECLARED
NO_AUTOMATIC_FUTURE_WORK
```

## 45. W7 Complete — Archive Rehome and Manifested Retirement

Status: `W7_COMPLETE`.

### 45.1 Admission and immutable candidate

Phase A began at `2026-09-20T06:23:20.0821866+02:00` with a valid
100 percent 5h / 63 percent weekly `CONTINUE` gate. After the planned
Post-W7 contract was bound, the destructive W7 boundary was admitted at
`2026-09-20T06:26:44.9324104+02:00` with 95 percent 5h / 63 percent weekly.

The immutable candidate manifest is
`docs/tooling-extraction/w7-retirement-candidate-manifest.json`, SHA-256
`6770c2a59a9466f8e6a32e946df935e7e387998dfd541329eb9e543369df559b`.
It binds eleven exact retirement candidates, 440 candidate file instances and
13 editable contract preimages. No reparse points or unexplained drift were
present.

### 45.2 Permanent archive

The 202-file complete W4 tree was copied without overwrite and published at:

`C:\Users\steph\Projekte\Backup\Old\ARGUS-PILOT\v1.2-v1.6`

The complete-tree digest remains
`b5bca7bc2ecffeaa9a82a3a32574a56753e50cebdf2a49b3ace0f936d5d030b9`.
The 197-file / 1707140-byte payload digest remains
`b991822dfc4976a7dca17df03e1cb16c2bd6910f1306e1f233cd600804a3fc16`.
Foreign-CWD validation, external-session validation and a disposable restore
all passed; the disposable restore was removed.

This is an organizational same-drive Legacy archive, not disaster recovery.
Historical W4/W5 evidence continues to describe the original W4 path.

### 45.3 Retirement and active consumers

After exact pre-delete validation and byte-identical rollback staging, W7
retired the two duplicated local KASRKIN trees, their obsolete MIDAS/H.E.S.T.I.A.
references, the two MIDAS KASRKIN bridge documents, all manifested ARGUS pilot
working copies and the former W4 archive. The former W4 root was deleted last.

MIDAS and H.E.S.T.I.A. activations now bind the legacy source status
`RETIRED_W7` and prove the same installed release
`kasrkin-2a0d185b0b04a93f`. Both foreign-CWD activation suites pass. KASRKIN
Source Candidate remains green with 47 files, seven suites and 106 cases.

The installed release, stable shim, Rainmeter state path, bindings, W3-W6
receipts, W5 handoff, external Codex session and immutable migration inventory
remain unchanged. No second writer, active policy change, ARGUS V1 component,
commit, tag, push or deploy was introduced.

The final machine-readable receipt is
`docs/tooling-extraction/w7-retirement-receipt.json`. B7/B7H exact rollback
staging remained available through the final proof boundary and was removed
only after the green postcondition; permanent recovery is provided by the
new byte-identical ARGUS archive and the proven KASRKIN source/release chain.

### 45.4 Next boundary

The operational migration is finished. The separately specified Post-W7
Closure Review remains `PLANNED / NOT_STARTED` and requires its own fresh gate
and owner boundary. Do not begin it, Future Thought work, ARGUS V1 or a commit
automatically.

```text
W3_COMPLETE
W4_COMPLETE
W5_COMPLETE
W6_COMPLETE
W7_COMPLETE
ARGUS_ARCHIVE_REHOME_COMPLETE
ARGUS_LEGACY_RETIREMENT_COMPLETE
KASRKIN_DUPLICATED_LOCAL_SOURCES_RETIRED
MIDAS_KASRKIN_CONSUMER_PROVEN
HESTIA_KASRKIN_CONSUMER_PROVEN
NEW_ARCHIVE_READ_AND_RESTORE_PROVEN
FORMER_W4_ARCHIVE_RETIRED_LAST
MIGRATION_INVENTORY_UNCHANGED
ARGUS_V1_PRODUCT_NOT_STARTED
NO_COMMIT_AUTHORIZED
POST_W7_CLOSURE_REVIEW_OWNER_BOUNDARY
```

## 46. Post-W7 Migration Closure Review Complete

Status: `POST_W7_CLOSURE_REVIEW_COMPLETE / MIGRATION_CLOSED`.

Der separate read-mostly Review wurde bei einem frischen, validen
`CONTINUE`-Gate von 65 Prozent 5h / 58 Prozent Weekly ausgeführt. Sein einziges
Ergebnisdokument ist der
[Post-W7 Migration Closure Report](tooling-extraction/Post-W7%20Migration%20Closure%20Report.md).
W7 bleibt die letzte operative Migrationswelle; es wurde kein W8 erzeugt.

Der Review bestätigt den finalen KASRKIN-, Consumer- und Archivzustand. Es gibt
keine offenen P0/P1-Migrationsfindings und keine operativen oder semantischen
Migrationsreste. Der bekannte W6-H-Lauf eines bereits invalidierten W3-S-
Orakels wird als unnötiger Doppelbeweis klassifiziert. Destruktive und
betriebliche Zustände behalten starke Grenzen; Markdown, Navigation und
rekonstruierbare Legacy-Dokumentation erhalten künftig nur risikoproportionale
Absicherung.

Der Instruction-Audit fand keinen belegten aktiven Dirty Stop. Der MIDAS-
Vertrag unterscheidet bereits interne Fortsetzung, echte Owner-Grenzen und
informative Fortschrittsmeldungen; bestehende fingerprintgebundene Freigaben
werden nicht erneut erfragt. Behauptungen des registrierten Videos zu geleakten
Prompts oder undokumentiertem Modellverhalten bleiben nicht autoritative
externe Aussagen.

Der nächste Schritt ist keine weitere Migrationswelle. Future-Thought-Arbeit,
eine KASRKIN-Verbesserungsroadmap, ARGUS V1, Desktop-Avatare und ein Commit
benötigen jeweils einen neuen Scope und Ownerauftrag.

```text
MIGRATION_CLOSED
POST_W7_CLOSURE_REVIEW_COMPLETE
NO_MIGRATION_LEFTOVERS
NO_UNRESOLVED_P0_P1
W7_REMAINS_FINAL_OPERATIONAL_WAVE
ARGUS_V1_PRODUCT_NOT_STARTED
NO_COMMIT_AUTHORIZED
NEXT_WORK_OWNER_AUTHORIZATION_REQUIRED
```
