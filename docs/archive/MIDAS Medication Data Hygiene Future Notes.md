# MIDAS Medication Data Hygiene Future Notes

## Zweck

Dieses Dokument ist keine Roadmap und kein Umsetzungsplan.

Es haelt die Diskussion zur moeglichen Vereinfachung des Medication-Datenmodells fest, damit ein spaeterer Chat die Motivation, Risiken und offenen Fragen schnell versteht. Eine echte Roadmap soll erst entstehen, wenn die Medication-Logik gezielt reviewt wurde.

## Status 2026-07-12 - Ersetzt

Die offene Diskussion dieses Dokuments wurde durch die umgesetzte
`MIDAS Medication Data Hygiene Roadmap` ersetzt. Die folgenden Abschnitte
bleiben als historische Entscheidungsgrundlage erhalten und sind nicht mehr
der aktuelle Ziel- oder Betriebsvertrag.

Aktuelle Source of Truth:

- `docs/modules/Medication Module Overview.md`
- `sql/12_Medication.sql`
- `sql/16_Explicit_Grants.sql`
- `sql/17_Medication_Retention.sql`
- `docs/QA_CHECKS.md`, Phase M-DH

Produktiv umgesetzt:

- `health_medication_stock_log` wird vollstaendig und ohne Ersatzhistorie
  entfernt; auch Restock, Adjust und Set erzeugen keinen Verlauf mehr.
- aktueller Bestand bleibt ausschliesslich in
  `health_medications.stock_count`.
- Slot-Events und Schedule-Slots bleiben wegen Multi-Dose, temporaeren Plaenen,
  Widget und Reminder erhalten.
- Slot-Events werden auf ein rollendes Wiener Kalenderjahr begrenzt.
- Confirm speichert die tatsaechliche Bestandsreduktion im begrenzten
  Slot-Event; Undo stellt exakt diesen Wert wieder her.
- bestehende Medication-Historie erhaelt einen einmaligen, explizit
  user-gated Clean Start.
- Retention laeuft intern in PostgreSQL ueber einen eindeutig benannten
  Supabase-Cron-Job.

Abgeschlossen:

- produktiver Clean Start am `2026-07-12`.
- Abgleich der erhaltenen Bestaende gegen die realen Packungen ohne noetige
  Korrektur.
- produktive Aktivierung und Operator-Smoke der Retention.
- PWA-, Android- und Incident-Push-Smokes.
- finaler Source-of-Truth-Doku-Sync in S6.

## Ausgangspunkt

MIDAS nutzt aktuell ein relativ robustes Multi-Dose-Medication-Modell:

- `health_medications`
  - Stammdaten je Medikament.
  - aktueller Bestand.
  - Low-Stock-Felder.
  - Aktivstatus.
- `health_medication_schedule_slots`
  - geplanter Tagesplan je Medikament.
  - Tagesabschnitte wie `morning`, `noon`, `evening`, `night`.
  - Start-/Enddatum fuer dauerhafte oder temporaere Medikationsplaene.
- `health_medication_slot_events`
  - bestaetigte Einnahmen je Slot und Tag.
  - fachliche Quelle fuer `genommen/offen` pro Tagesabschnitt.
- `health_medication_stock_log`
  - Audit-/Diagnoseverlauf fuer Bestand.
  - aktuell auch fuer automatische `slot_confirm`-/`slot_undo`-Buchungen.

Das Modell wurde offenbar nicht nur fuer den heutigen Zustand gebaut, sondern fuer ein moegliches spaeteres Medikationsbild:

- Morgen-Stack dauerhaft.
- temporaere Antibiotika mittags/abends.
- mehrere Einnahmeabschnitte pro Tag.
- Low-Stock-Logik.
- Reminder-/Incident-Logik.
- Widget-/Assistant-Kontext.

## Heutiger realer Nutzungsstand

Der aktuelle reale MIDAS-Use Case ist deutlich einfacher:

- ein ueberschaubarer Morgen-Stack.
- aktuell keine komplexen mehrfach taeglichen Dauermedikationen.
- Bestandslogik ist praktisch:
  - Bestand `30` wird nach Einnahme `29`.
  - Restock oder manuelles Setzen korrigiert den Bestand.
- Ein ewiger Audit-Trail einzelner Bestandsbewegungen hat keinen praktischen Alltagsnutzen.

Langzeitperspektive:

- MIDAS ist als Langzeitsystem gedacht.
- In Jahrzehnten waeren alte automatische `-1`-Stock-Logs vermutlich Datenmuell.
- Ein Log-Eintrag wie `slot_confirm` vom 24.11.2066 wird kaum jemals zur Arztkommunikation oder Selbststeuerung gebraucht.
- Supabase-Speicher ist nicht unendlich; Datenhygiene ist daher ein valider Produktaspekt.

## Wichtige fachliche Trennung

Nicht alle Medication-Daten sind gleich wertvoll.

Fachlich wahrscheinlich wertvoll:

- heutiger Einnahmestatus.
- offene Tagesabschnitte.
- Low-Stock-Status.
- kurzfristige Erinnerung/Incident-Logik.
- aktuelle Medikamentenliste.
- aktueller Bestand.
- temporaere Medikationsplaene.

Langfristig fraglich:

- automatischer `-1`-Stock-Log pro normaler Einnahme.
- automatischer `+1`-Stock-Log pro Undo.
- jahrealte Bestandstransaktionen ohne Auswertung.

Wichtiger als Stock-Logs:

- `health_medication_slot_events`, weil diese die Einnahmehistorie pro Tag/Slot abbilden.

Wahrscheinlich am ehesten vereinfachbar:

- `health_medication_stock_log`, weil es aktuell viele automatische Bestandsbewegungen erzeugt, die spaeter wenig Nutzen haben.

## Vorlaeufige Hypothese

Das bestehende Modell ist nicht grundsaetzlich falsch.

Es ist:

- robust fuer Mehrfach-Slots.
- geeignet fuer Widget, Reminder und Incident-Logik.
- geeignet fuer temporaere Medikationsplaene.
- aber fuer den heutigen einfachen Morgen-Stack wahrscheinlich zu datenintensiv.

Die groesste Vereinfachung mit geringem Funktionsverlust waere vermutlich:

- `slot_events` beibehalten.
- `schedule_slots` beibehalten.
- `stock_count` in `health_medications` beibehalten.
- automatische Stock-Log-Eintraege bei normaler Einnahme reduzieren oder entfernen.
- Stock-Log nur noch fuer manuelle Bestandseingriffe nutzen.

## Moeglicher Zielzustand

Ein spaeterer schlankerer Vertrag koennte so aussehen:

- Normale Einnahme:
  - schreibt weiter ein `health_medication_slot_events`-Event.
  - reduziert `health_medications.stock_count`.
  - schreibt keinen automatischen `health_medication_stock_log`-Eintrag mit `reason = slot_confirm`.
- Undo einer Einnahme:
  - loescht weiter das passende `slot_event`.
  - erhoeht `stock_count` wieder.
  - schreibt optional keinen automatischen `stock_log`-Eintrag mit `reason = slot_undo`.
- Manuelle Korrekturen:
  - `med_adjust_stock_v2`
  - `med_set_stock_v2`
  - Restock aus der UI
  - bleiben im `health_medication_stock_log`, weil sie echte erklaerungsbeduerftige Bestandseingriffe sind.
- Alte automatische Stock-Logs:
  - koennten optional geloescht, archiviert oder per Retention-Regel bereinigt werden.

## Nicht sofort entscheiden

Noch keine Entscheidung ohne Code-/Datenfluss-Review:

- Ob `stock_log` komplett bleiben soll.
- Ob automatische `slot_confirm`-/`slot_undo`-Logs entfernt werden.
- Ob alte Logs geloescht oder nur nicht weiter erzeugt werden.
- Ob eine Retention-Regel sinnvoll ist.
- Ob `slot_events` langfristig aggregiert werden sollten.
- Ob Medication V3 ein neues Modell braucht.

## Spaeter zu pruefende Fragen

Vor einer Roadmap muss geprueft werden:

- Wo wird `health_medication_stock_log` gelesen?
- Nutzt die UI Stock-Logs direkt?
- Nutzt das Widget Stock-Logs?
- Nutzen Push/Incident/Reminder Stock-Logs?
  - Aktueller erster Scan-Hinweis: `midas-incident-push` liest `health_medication_slot_events`, nicht `health_medication_stock_log`.
- Nutzen Reports oder Doctor View Stock-Logs?
- Braucht `med_undo_slot_v2` den Stock-Log oder reicht:
  - `slot_event` loeschen.
  - Bestand wieder erhoehen.
- Sind Restock und manuelle Korrektur weiterhin nachvollziehbar genug?
- Welche `reason`-Werte existieren produktiv?
  - `slot_confirm`
  - `slot_undo`
  - `card:restock`
  - manuelle Adjust-/Set-Gruende
- Welche Alt-Datenmenge existiert bereits?
- Welche `reason`-Verteilung hat `health_medication_stock_log` aktuell?
  - z. B. Anzahl `slot_confirm`, `slot_undo`, `card:restock`, manuelle Korrekturen.
- Wie stark waere die Datenreduktion, wenn automatische `slot_confirm`-/`slot_undo`-Logs wegfallen?
- Wie viele automatische Logs entstehen pro Jahr bei aktuellem und moeglichem zukuenftigem Medikationsplan?
- Gibt es regulatorisch oder medizinisch einen echten Grund fuer einen ewigen Stock-Audit-Trail?
- Koennte eine Loeschung alter Logs Nebenwirkungen auf Low-Stock oder UI-Anzeige haben?

## Moegliche spaetere Roadmap

Wenn dieses Thema umgesetzt werden soll, sollte daraus eine eigene Roadmap entstehen, z. B.:

```text
MIDAS Medication Data Hygiene Roadmap
```

Voraussichtliche Arbeitsweise:

- S1:
  - Medication-Modul, SQL, RPCs, UI und Downstream-Consumer lesen.
  - `health_medication_stock_log`-Nutzung inventarisieren.
  - Live-Daten nur nach Freigabe strukturell zaehlen:
    - Gesamtzahl Stock-Logs.
    - Anzahl pro `reason`.
    - aeltester/neuster automatischer Log.
    - Anteil automatischer Logs an allen Medication-Zeilen.
- S2:
  - Zielvertrag festlegen:
    - Stock-Log nur fuer manuelle Eingriffe?
    - Retention?
    - Alt-Datenbereinigung?
- S3:
  - Bruchrisiken pruefen:
    - Undo.
    - Low-Stock.
    - Widget.
    - Push/Incident.
    - Reports.
- S4:
  - Umsetzung substepweise.
- S5:
  - SQL-/RPC-/UI-Smokes.
  - optional Supabase-Live-Pruefung.
- S6:
  - Medication Overview, QA und Roadmap final synchronisieren.

## Vorlaeufige Empfehlung

Nicht in die Supabase Explicit Grants Roadmap mischen.

Fuer die Grants-Roadmap gilt:

- Das aktuelle Medication-Modell wird als Ist-System behandelt.
- Es bekommt passende Grants fuer den bestehenden Vertrag.
- Keine Modellvereinfachung im Grant-Scope.

Fuer einen spaeteren Medication-Datenhygiene-Scope gilt:

- Erster Review-Fokus sollte `health_medication_stock_log` sein.
- Wahrscheinlich beste erste Vereinfachung:
  - keine automatischen Stock-Log-Zeilen fuer normale Einnahmen mehr.
  - Stock-Log nur fuer Restock, Set Stock und manuelle Adjustments.
- `slot_events` und `schedule_slots` sollten nicht vorschnell entfernt werden, weil sie Mehrfach-Slots, Widget und Reminder-/Incident-Logik tragen.

## Offene Entscheidung

Noch nicht entschieden:

- Roadmap erstellen oder nur Future Note behalten.
- Alt-Daten loeschen oder nur kuenftige automatische Logs reduzieren.
- Retention-Zeitraum, falls Logs bereinigt werden.
- Ob `health_medication_stock_log` dauerhaft fuer manuelle Eingriffe behalten wird.

Aktueller Stand:

- Future Note erstellt.
- Erster statischer Scan zeigt:
  - `med_confirm_slot_v2` schreibt `reason = slot_confirm`.
  - `med_undo_slot_v2` schreibt `reason = slot_undo`.
  - `med_adjust_stock_v2` und `med_set_stock_v2` schreiben manuelle Bestandseingriffe.
  - `midas-incident-push` liest `health_medication_slot_events`.
- Keine Code- oder SQL-Aenderung.
- Thema bleibt bewusst fuer spaeter geparkt.
