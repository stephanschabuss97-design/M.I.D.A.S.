# Voice Command Semantics

Kurze Einordnung:
- Zweck: produktive, heute freigegebene Sprachformulierungen fuer MIDAS Voice-V1 an einer Stelle festhalten.
- Rolle innerhalb von MIDAS: Pflege- und Betriebsdoku fuer reale Sprachbefehle, nicht zweiter Parserkern.
- Abgrenzung: Diese Datei beschreibt den aktuellen Produktvertrag und typische Beispiele. Die eigentlichen Regeln leben im Code.

Related files:
- `app/modules/assistant-stack/intent/rules.js`
- `app/modules/assistant-stack/intent/normalizers.js`
- `app/modules/assistant-stack/intent/semantics/`
- `app/modules/assistant-stack/intent/slots/extract.js`
- `app/modules/assistant-stack/voice/index.js`

---

## 1. Pflege-Regeln

- Neue produktive Formulierungen werden nicht hier implementiert, sondern in:
  - `app/modules/assistant-stack/intent/rules.js` als Einstieg fuer produktive Match-Regeln
  - `app/modules/assistant-stack/intent/normalizers.js` als Einstieg fuer Surface-/Semantic-Normalisierung
  - darunter je nach Aenderungsart in:
    - `app/modules/assistant-stack/intent/normalizers/`
    - `app/modules/assistant-stack/intent/semantics/`
    - `app/modules/assistant-stack/intent/slots/extract.js`
- Diese Datei wird nachgezogen, wenn sich der produktive Sprachvertrag aendert.
- Ziel ist ein enger, deterministischer Sprachvertrag. Kein freies `Voice fuer alles`.

---

## 2. Produktive Sprachbefehle

### 2.1 Intake: Wasser

Produktiver Vertrag:
- `x ml wasser`
- `x l wasser`

Beispiele:
- `Wasser 500 ml`
- `Trage mir 500 ml Wasser ein`
- `Ich habe 500 ml Wasser getrunken`
- `80 ml Wasser`
- `340 ml Wasser`
- `0.5 l Wasser`

Hinweise:
- Im Betrieb sind Ziffern weiterhin die sicherste Form.
- STT-/Normalisierung soll ausgeschriebene Mengen moeglichst auf Ziffern abbilden.

### 2.2 Intake: Salz

Produktiver Vertrag:
- `x g salz`

Beispiele:
- `Salz 2 g`
- `Trage mir 2 g Salz ein`
- `Ich habe 2 g Salz genommen`
- `0.1 g Salz`

### 2.3 Intake: Protein

Produktiver Vertrag:
- `x g protein`

Beispiele:
- `Protein 30 g`
- `Trage mir 30 g Protein ein`
- `Ich habe 30 g Protein gegessen`
- `1 g Protein`

### 2.4 Medikation

Produktiver Vertrag:
- taegliche Sammelbestaetigung offener Medikation

Beispiele:
- `Medikamente genommen`
- `Tabletten genommen`
- `Meine Medikamente genommen`
- `Alle meine Medikamente genommen`

Enger Follow-up-Spezialfall:
- nur nach erfolgreichem lokalem `medication_confirm_all`
- nur wenn danach im frischen Tageszustand reales `low_stock` vorhanden ist
- kurzer Nachsatz:
  - `Medikation bestaetigt. Medikament ist knapp. Lokalen Rezeptkontakt starten?`
- erlaubte Antwort:
  - `ja`
  - `nein`

Hinweise:
- `ja` startet nur den bestehenden lokalen Mailto-/Rezeptkontakt-Pfad.
- `nein` beendet den Nachsatz ohne weitere Session.
- Kein freier Reorder-Dialog und keine Versand-/Bestellsemantik.

### 2.5 Breath Timer

Produktiver Vertrag:
- `start_breath_timer`
- `3` Minuten als Default
- `5` Minuten nur explizit

Beispiele:
- `Starte Timer`
- `Bitte starte den Timer`
- `Kannst du mir den Timer starten`
- `Starte 5 Minuten Timer`
- `Starte 5-Minuten-Timer`
- `Starte Fuenf-Minuten-Timer`
- `Kannst du mir den 5 Minuten Timer starten`

---

## 3. Compound / Morning Flow

Es gibt derzeit keinen einzelnen magischen Produktbefehl `Morgenbefehl`.

Produktiv ist ein klarer Mehrfachbefehl aus einzelnen freigegebenen Units:
- Wasser
- Salz
- Protein
- Medikation

Beispiele:
- `Wasser 500 ml und 2 g Salz und 30 g Protein und Medikamente genommen`
- `Ich habe 500 ml Wasser getrunken und 2 g Salz und 30 g Protein genommen und meine Medikamente genommen`
- `500 ml Wasser, 2 g Salz, 30 g Protein und Tabletten genommen`

Hinweise:
- Am stabilsten sind klare Einheiten mit `und` oder kurzen Kommas.
- Freie Sammelworte wie `mach meinen Morgenkram` sind derzeit kein produktiver Vertrag.

---

## 4. Nicht Teil des aktuellen Vertrags

- Freie Wellness-/Assistant-Saetze wie `ich sollte kurz runterkommen`
- Vage Intake-Saetze ohne klare Menge und Einheit
- Globale Vitals-/BP-Sprachsteuerung
- Destruktive oder strukturelle Datenoperationen per Voice

---

## 5. Betriebs-Workflow fuer neue Saetze

Wenn im Betrieb ein realer Satz nicht erkannt wird:
1. Touch-Log mit `Transcript` und wenn vorhanden `Normalized Transcript` sichern.
2. Pruefen, ob es ein Normalisierungsproblem oder ein Match-Problem ist.
3. Bei STT-/Oberflaechenproblem:
   - `app/modules/assistant-stack/intent/normalizers.js`
   - und bei tieferem Refactor in `app/modules/assistant-stack/intent/normalizers/`
4. Bei semantischer Alias-/Verb-/Slot-Luecke:
   - `app/modules/assistant-stack/intent/semantics/`
   - `app/modules/assistant-stack/intent/slots/extract.js`
5. Bei enger produktiver Pattern-Regel desselben Fachbefehls:
   - `app/modules/assistant-stack/intent/rules.js`
   - bzw. die zugehoerigen `app/modules/assistant-stack/intent/rules/*.js`
6. Danach diese Datei mit einem kurzen Beispiel nachziehen.

Zusatz fuer produktiven Voice-Betrieb:
- Bei echten `Befehl nicht erkannt`-/`no-rule-match`-Faellen erstellt MIDAS automatisch einen lokalen JSON-Fallback-Report und stoesst einen Browser-Download an.
- Der Report ist als Betriebs-/Pflegehilfe gedacht, besonders fuer reale Mobile-/Android-Nutzung.
- Enthalten sind unter anderem:
  - `raw_transcript`
  - `normalized_transcript`
  - `surface_normalized_transcript`
  - `semantic_normalized_transcript`
  - `slots`
  - `reason`
  - `command_plan_mode`
  - `intent_result`
