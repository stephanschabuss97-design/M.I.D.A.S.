# Trendpilot Refactor Roadmap

Wichtige Dateien (aktuell)
- `app/modules/vitals-stack/trendpilot/data.js` (bestehende Trend-Logik)
- `app/modules/vitals-stack/trendpilot/index.js` (Orchestrator/Trigger)
- `app/supabase/api/system-comments.js` (aktueller Trendpilot-Storage)
- `app/modules/doctor-stack/doctor/index.js` (Arzt-Ansicht Trendpilot-Block)
- `app/modules/doctor-stack/charts/index.js` (Chart + Trendpilot-Bands)
- `app/modules/doctor-stack/charts/chart.css` (Chart-Styles inkl. Trendpilot)
- `app/styles/doctor.css` (Doctor UI)
- `app/styles/ui.css` (Dialog/Overlay Styles)
- `assets/js/main.js` (BP-Save Handler/Trigger)
- `docs/modules/Trendpilot Module Overview.md` (Master-Doku / Source of Truth)

Ziel
- Trendpilot von JS-Logik in eine Edge Function verlagern.
- Eigene Trendpilot-Tabelle in Supabase fuer Warnungen und Korrelationen.
- Arzt-Ansicht bekommt einen Trendpilot-Block mit Akkordeon + Aktionen.
- Datenbasis fuer spaetere Arztberichte und Korrelationslogik schaffen.

Scope
- Neue DB-Tabelle fuer Trendpilot-Events (bp/body/lab/combined).
- Edge Function fuer Einzelchecks + Korrelation.
- Geplanter Supabase Scheduler (woechentlich, Mo->Di 02:00, Zeitzone Wien).
- Supabase API Endpunkte fuer Lesen/Schreiben/Status.
- UI: neuer Trendpilot-Tab in der Arzt-Ansicht + optional Badge-Zaehler.
- Hub-Notification beim App-Start fuer neue Trendpilot-Warnungen.
- Migration von bestehender JS-Logik (Trendpilot im vitals-stack).
- Chart-Overlay aktualisieren (Trendpilot-Bands aus neuer Tabelle).

Nicht im Scope
- Medizinische Diagnosen/Therapieentscheidungen.
- Vollautomatischer Arztbericht (nur Schnittstellen vorbereiten).
- Realtime-Alerts oder Push-Benachrichtigungen.

Annahmen
- Aktuell keine Trendpilot warning/critical Eintraege in der DB.
- BP bleibt erster Datensatz, Body/Lab folgen iterativ.
- Edge Function ist der zentrale, deterministische Evaluationspunkt.
- Trendpilot speichert info/warning/critical (kein pass).
- Datenhaltung: unbegrenzt (keine Retention/Loeschung).
- Single-User Betrieb (keine Multi-User Anforderungen).

Deterministische Hauptsteps

1) SQL / DB Schema (done)
  1.1 Neue Tabellen `trendpilot_events` und `trendpilot_state` definieren. (done)
  1.2 Indizes fuer Events (user_id, type, severity), (user_id, ts), (user_id, type, window_from, window_to) anlegen. (done)
  1.3 Indizes fuer State (user_id, type) anlegen. (done)
  1.4 Constraints fuer erlaubte Werte (type: bp/body/lab/combined, severity: info/warning/critical). (done)
  1.5 Dedup-Constraint (user_id + type + window_from + severity). (done)
  1.6 RLS Policies fuer user_id Zugriff anlegen. (done)
  1.7 View fuer Range-Queries (z.B. `trendpilot_events_range`). (done)

2) Edge Function: Trendpilot Engine (done)
  2.1 Request/Response Schema definieren (input range + datensaetze, output events inkl. window_from/window_to). (done)
  2.2 Einzelchecks pro Typ implementieren (bp, body, lab). (done)
  2.3 Korrelationen implementieren (z.B. weight+bp). (done)
  2.4 Deterministische Upsert-Strategie (idempotent, kein Duplikat-Noise). (done)
  2.5 Logging/diag Hooks fuer Debugging. (done)
  2.6 Warning/critical als Alerts schreiben, info fuer Normalisierung (pass ignorieren). (done)
  2.7 Trend-Logik fuer Start/Ende/Normalisierung:
      - Start: erstes Wochenfenster mit warning/critical -> window_from setzen.
      - Fortsetzung: solange Bedingung erfuellt, window_to woechentlich erweitern.
      - Ende: wenn 2-3 Wochen in Folge keine Bedingung erfuellt, window_to finalisieren.
      - Normalisierung: nach 6 stabilen Wochen Baseline anpassen + info-Event schreiben.
  2.8 Reihenfolge: Einzelchecks -> Events upserten/aktualisieren -> Korrelationen bilden -> combined Event schreiben. (done)

3) Scheduler / Trigger
  3.1 GitHub Actions Cron: woechentlich Di 02:00 (Europa/Wien, UTC-Shift beachten). (done)
  3.2 Edge Function Trigger entkoppeln vom BP-Save (BP-Hook entfernt). (done)
  3.3 Range-Logik fuer Wochenfenster definieren. (done)

4) Supabase API Layer
  4.1 Neue API Funktionen: fetchTrendpilotEventsRange, setTrendpilotAck. (done)
  4.2 REST Endpoints und Filter (type, severity, range, order). (done)
  4.3 Alte system_comment Pfade fuer Trendpilot deaktivieren oder auf neue Tabelle lenken. (done)

5) App Integration (Notification/Ack)
  5.1 App-Start: neue Trendpilot-Events laden. (done)
  5.2 Hub-Popup anzeigen (warning/critical), Bestaetigung erforderlich. (done)
  5.3 Ack nur beim ersten Auftreten speichern (ack + ack_at). (done)
  5.4 Event Emission `trendpilot:latest` an neue Datenquelle binden. (done)
  5.5 Begruendungstexte im Hub: rule_id -> Textbausteine (fuer Arzt erklaerbar). (done)
  5.6 Lifecycle-Toast (Start/Ende) mit Dedupe. (done)
  5.7 Hub-Glow schaltet auf rot bei aktivem Trend. (done)

6) Arzt-Ansicht UI
  6.1 Trendpilot-Akkordeon in doctor view. (done)
  6.2 Liste der Trendpilot-Events (info/warning/critical). (done)
  6.3 Aktionen: Ack/Bestätigt + Loeschen. (done)
  6.4 Default-Status: geschlossen, wenn alle bestaetigt. (done)

7) Charts Integration
  7.1 Trendpilot-Ranges aus neuer Tabelle laden (window_from/window_to). (done)
  7.2 Eigene Trendpilot-Lane unten an der X-Achse rendern. (done)
  7.3 Filter auf typ-spezifisch + warning/critical beibehalten. (done)
  7.4 Tooltip am Band zeigt Trendpilot-Kommentar. (done)

8) Migration / Cleanup
  8.1 Alte JS Trendpilot-Logik schrittweise entfernen. (done)
  8.2 System_comment Trendpilot Pfade deaktivieren. (done)
  8.3 Dokumentation aktualisieren (Trendpilot Module Overview, DB Plan). (done)

9) QA / Validierung
  9.1 Edge Function: deterministisch, idempotent, keine Duplikate. (done)
  9.2 Scheduler feuert zu korrekter Zeit (Wien, 02:00). (done)
  9.3 App-Popup + Ack funktioniert End-to-End. (done)
  9.4 Arzt-Block zeigt info/warning/critical, Popup nur warning/critical. (done)
  9.5 Chart-Bands korrekt im Zeitraum. (done)
  9.6 Keine Regression bei BP/Body/Lab Tabs. (done)
  9.7 Doku-Update Liste:
      - `docs/modules/Trendpilot Module Overview.md` (Master)
      - `docs/Trendpilotrefactor.md`
  (done)
  9.8 Begruendungstexte decken alle rule_id Kombinationen ab. (done)

Offene Fragen (vor Start klaeren)
- Finales Tabellen-Schema (payload Struktur, typed fields vs JSON).
- Genaues Input-Format fuer Edge Function (wie werden Rohdaten geliefert).
- Wie Arztbericht spaeter auf Trendpilot-Events zugreift (API/Export).
- Payload minimal halten (rule_id/version, Kennzahlen, kurze Gruende; keine Rohdaten-Dumps).
- Severity-Definitionen werden in `docs/modules/Trendpilot Module Overview.md` gepflegt.
