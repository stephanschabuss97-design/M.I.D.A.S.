# Trendpilot Correlation Notes (Brainstorming)

Ziel
- Detaillierte Sammlung moeglicher Korrelationen/Guidelines fuer den Trendpilot.
- Enthaelt: aktuelle Datenbasis, was schon aktiv ist, und wie Erweiterungen sauber eingeflochten werden koennen.
- Fokus: Kontext liefern, keine kausalen Aussagen oder Diagnosen.

---

## 1) Aktueller Stand (was bereits umgesetzt ist)

### 1.1 Datenquellen / Storage
- `health_events` (BP, Body, Intake, Lab, Activity)
  - BP: `type = bp`, Payload `sys`, `dia`, optional `pulse`, `ctx` (Morgen/Abend).
  - Body: `type = body`, Payload `kg`, `cm`, optional `fat_pct`, `muscle_pct`.
  - Intake: `type = intake`, Payload `water_ml`, `salt_g`, `protein_g`.
    - Hinweis: Intake wird taeglich um 0 Uhr auf 0 zurueckgesetzt und nicht langfristig gespeichert.
    - Konsequenz: Intake ist bewusst eine Tages-UI und bleibt dauerhaft ohne Trendpilot-Korrelationen.
  - Activity: `type = activity_event`, Payload `activity`, `duration_min`, optional `note`.
  - Lab: `type = lab_event`, Payload `egfr`, `creatinine`, etc.
- Trendpilot Events: `trendpilot_events` (info/warning/critical, window_from/to, payload, ack).
- Trendpilot State: `trendpilot_state` (Baseline und Normalisierung je Typ).

### 1.2 Trendpilot Engine (Edge Function)
- Wochenfenster, Deltas, Baselines, dedupe-idempotent.
- Events: warning/critical (Alerts), info (Baseline-Reset).
- Combined (BP/Weight) wird gebildet, wenn Gewichtsdelta gross genug ist.

### 1.3 UI / App
- Popup bei warning/critical (modal, nur "Zur Kenntnis genommen" ack).
- Arzt-Ansicht: Akkordeon, Ack/Loeschen, listet Events.
- Chart: Trendpilot-Band unten an X-Achse (BP only), Tooltip mit Kommentar.
- Hub-Glow: ongoing Trend, warning = gelb, critical = rot.

---

## 2) Leitprinzipien fuer neue Korrelationen

1) Korrelationen sind Kontext, keine Diagnose.
2) Keine neuen Severity-Warnings nur wegen Kontext.
3) Korrelationen nur, wenn die Daten verlaesslich sind.
4) Kurzer Zeithorizont (2-4 Wochen) fuer Kontext.
5) Einfache Texte, klare Sprache, keine Schuldzuweisung.
6) Zeitaufloesung muss passen: Trendpilot arbeitet in Wochenfenstern, Kontext muss ebenfalls in Wochen/4-Wochen aggregiert sein.
7) Idempotenz/Dedupe bleibt unberuehrt: Kontext erweitert nur Payload, erzeugt keine neuen Event-Keys.

---

## 3) Moegliche Korrelationen (basierend auf vorhandenen Daten)

### 3.1 Gewicht <-> Aktivitaet

Fall A: Gewicht steigt + Aktivitaet niedrig
- Kontext: "geringe Aktivitaet kann die Gewichtszunahme mit beeinflussen".
- Keine Aussage "zu wenig Training".
  - Beispiel-Definition (nach Gate): niedrig = <= 3 Sessions / 4 Wochen.

Fall B: Gewicht steigt + Aktivitaet hoch + Muskelmasse steigt
- Kontext: "Zunahme kann trainingsbedingt (Muskel) sein".
  - Beispiel-Definition (nach Gate): hoch = >= 8 Sessions / 4 Wochen.

Fall C: Gewicht steigt + Aktivitaet hoch + Fettmasse steigt
- Kontext: "Zunahme spricht eher fuer Energieueberschuss".

Fall D: Gewicht steigt + Aktivitaet hoch + Body-Comp fehlt
- Kontext: "Aktivitaet hoch; ohne Body-Comp keine sichere Einordnung".

### 3.2 BP <-> Gewicht

Fall A: BP-Trend hoch + Gewicht steigt
- Kontext: "Gewichtszunahme kann BP mit beeinflussen".
Fall B: BP-Trend hoch + Gewicht stabil
- Kontext: "Gewicht eher konstant; andere Faktoren moeglich".

### 3.3 Body <-> Bauchumfang

Fall A: Gewicht steigt + Bauchumfang steigt
- Kontext: "Zunahme wirkt zentral (Bauchumfang)".
Fall B: Gewicht steigt + Bauchumfang stabil
- Kontext: "Zunahme ohne Bauchumfang-Aenderung (z. B. Wasser/Muskel moeglich)".

### 3.4 Lab <-> Trends

Lab ist selten. Nur als Kontext:
- eGFR sinkt + BP hoch -> "BP-Phase parallel zu eGFR-Abfall".
- Nur wenn Lab zeitlich nahe am Trendfenster liegt (z. B. innerhalb der betroffenen Wochen).
- Keine neue Severity, nur Hinweis.

---

## 4) Datenqualitaet / Verlaesslichkeit

Korrelationen nur, wenn:
- Activity (4W): >= 2 Wochen mit Eintrag oder >= 4 Sessions insgesamt.
- Activity Level wird nur dann berechnet, wenn das Gate erfuellt ist; andernfalls ist Level = "unknown".
- Activity hoch (4W): >= 8 Sessions insgesamt.
- Body-Comp: >= 2 Messungen im Zeitraum und mind. 14 Tage Abstand.
- Intake (4W): entfällt, da Intake bewusst nicht persistiert wird.

Wenn Daten fehlen:
- Kein Kontext, oder "keine ausreichenden Daten fuer Kontext".
- Missingness-Bias: fehlende Daten niemals als "niedrig" werten.

Deterministische Activity-Levels (nur wenn Gate erfuellt):
- high: >= 8 Sessions / 4 Wochen
- low: <= 3 Sessions / 4 Wochen
- ok: sonst
- unknown: Gate nicht erfuellt

---

## 5) Vorschlag fuer Payload-Kontext (strukturiert)

Kontext als Objekt im Payload (statt vieler Flags), z. B.:

```
context: {
  context_window_weeks: 4,
  context_window_to: "YYYY-MM-DD",
  activity: { level: "low|ok|high|unknown", sessions_4w: 3, weeks_with_entries_4w: 2 },
  bodycomp: { muscle_trend: "up|flat|unknown", fat_trend: "up|flat|unknown", samples: 2 },
  weight: { trend: "up|flat|unknown", waist_trend: "up|flat|unknown" },
  lab: { egfr_trend: "down|flat|unknown", days_from_window: 7 }
}
```

Regel: nur befuellen, wenn Datenqualitaet ok; sonst "unknown".

Hinweis: Prioritaet fuer Kontextsatz sollte explizit sein (siehe Abschnitt 6.1).

---

## 6) Text-Map Idee (Beispiel)

Primaertext bleibt unveraendert (z. B. "Gewicht ueber Baseline ...").
Ein Zusatzsatz wird optional angehaengt, z. B.:
- "Kontext: geringe Aktivitaet in den letzten 4 Wochen."
- "Kontext: Muskelmasse ist in der gleichen Phase gestiegen."
- "Kontext: Bauchumfang ist in der gleichen Phase gestiegen."

Wichtig: Kontexte nur, wenn Daten solide.
Limit: max. 1 Kontext-Satz pro Event. Wenn mehrere zutreffen -> priorisieren.

### 6.1 Kontext-Prioritaet (Vorschlag)
1) Gewicht + Bauchumfang
2) Gewicht + Aktivitaet niedrig
3) Gewicht + Aktivitaet hoch + Muskelmasse
4) Gewicht + Aktivitaet hoch + Fettanteil
5) Gewicht + Aktivitaet hoch, Body-Comp fehlt
6) Lab-Naehe (eGFR ruecklaeufig)

---

## 7) Erweiterungs-Scoping (realistisch)

Kurzfristig (wenn gewollt):
- Gewicht + Activity Kontext (nur wenn Activity-Daten vorhanden).
- Gewicht + Bauchumfang Kontext.

Mittelfristig:
- Body-Comp-gestuetzte Interpretation (Muskel/Fett).
- Lab nur als Zusatzkontext.

Langfristig:
- Optional: Urinteststreifen 1x pro Monat (nach aerztlicher Abklaerung).

---

## 8) Risiken / Hinweise

- Kontext darf nicht wie Diagnose wirken.
- Ohne gute Datenqualitaet lieber schweigen.
- Neue Kontexte sollten nie Severity erhoehen.
- Wenn Nutzer Aktivitaet bewusst nicht tracked, darf kein Kontext daraus entstehen.
- Fehlende Daten nie als "niedrig" interpretieren (Missingness-Bias).

## 9) Zusammenfassung

- Trendpilot bleibt ein Trend-Signal (warning/critical).
- Korrelationen sind Kontexte und nur eine Zusatzzeile im Text.
- Die Logik bleibt deterministisch, mit klaren Gates fuer Datenqualitaet.
