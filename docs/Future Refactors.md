# MIDAS – Weitere Ideen aus dem Chat (Zusammenfassung)

Dieses Dokument fasst **alle zusätzlichen Feature-Ideen** zusammen, die im Verlauf dieses Chats **neben dem Medication Management Modul** entstanden sind.  
Es handelt sich ausschließlich um **inhaltliche Ideen**, ohne Bewertung, Priorisierung oder Meta-Kommentare.

---

## 1. Aktivität / Training bei den Vitals

**Ziel:**  
Erfassung von Bewegung als medizinischer Kontext (nicht als Fitness-Tracking).

**Umsetzung:**
- Neuer Button im **Vitals-Bereich**
- Speicherung als **Event**, analog zu BP / Body

**Erfassungsfelder:**
- Aktivität (Dropdown):
  - Fitnessstudio
  - Fußball
  - Laufen
  - Radfahren
  - Spazieren
  - Sonstiges
- Dauer (Minuten)
- Optional: Kommentar

**Arzt-Ansicht:**
- Neuer **4. Tab „Activity“**
- Anzeige:
  - Anzahl Sporteinheiten im Zeitraum
  - Ø Dauer

**Monatsbericht:**
- Eine kompakte Zeile:
  > „Patient hatte X Sporteinheiten im letzten Monat.“

---

## 2. Erweiterter Monatsbericht / Patienten-Summary

**Ziel:**  
Strukturierte Übersicht für Arzttermine, optional vorab versendbar.

**Format:**
- PDF
- Max. 3–4 Seiten

**Inhalt:**
- Blutdruck-Zusammenfassung
- Körperdaten
- relevante CKD-Laborwerte
- Medikamentenstatus
- Aktivitäts-/Trainingsübersicht

**Nutzung:**
- Optional vorab per E-Mail
- Alternativ ausgedruckt zum Termin mitnehmen

---

## 3. Mail-Shortcut (bewusste Aktion)

**Ziel:**  
Vereinfachte Kommunikation mit Arzt oder Apotheke ohne Automatisierung.

**Umsetzung:**
- `mailto:`-Link mit vorgefülltem Text
- Manuelles Abschicken durch den Nutzer

**Einsatzbereiche:**
- Medikamenten-Nachbestellung
- Versand von Monatsberichten

---

## 4. DIY-Uhr (Zukunftsidee)

**Status:**  
Konzeptionell erwähnt, nicht Bestandteil aktueller Umsetzung.

**Idee:**
- Stark reduzierter MIDAS-Umfang auf einer DIY-Uhr
- Fokus auf Kerninformationen

**Mögliche Inhalte:**
- Medikamentenstatus (genommen / offen)
- Basis-Vitals
- Notfall-/Info-Anzeige

---

## 5. Arzt-Register (Nice-to-Have)

**Ziel:**  
Zentrale Verwaltung relevanter Ärzt:innen.

**Inhalt:**
- Name
- Fachrichtung
- E-Mail
- Telefonnummer
- Adresse (optional)

**Verwendung:**
- Referenz bei Medikamenten
- Zieladresse für Mail-Shortcuts

**Wichtig:**
- Kein Live-Zugriff für Ärzt:innen
- Reines Referenz- und Komfort-Feature

---

## 6. Designprinzip: Leiser Kontext

**Kein Feature, sondern Leitlinie**

- Features sollen:
  - passiv funktionieren
  - nicht stören, wenn sie nicht genutzt werden
- Fokus auf:
  - medizinischen Mehrwert
  - Arzt-Tauglichkeit
  - langfristige Nutzbarkeit

---

## 7. KI-Agent zur Interpretation der Inbox-Inhalte

**Ziel:**  
Unterstützung beim Verständnis medizinischer Systemmeldungen ohne Alarmismus oder Diagnose.

**Idee:**
- Ein dedizierter **KI-Agent** analysiert Inhalte der **Arzt-Inbox**.
- Fokus liegt auf:
  - Monatsberichten
  - Trendpilot-Kommentaren
  - systemischen Hinweisen

**Kontext-Berücksichtigung:**
- Bekannte CKD-Situation
- Historische Monatsberichte
- Langfristige Trends statt Einzelwerte

**Ausgabe:**
- Kurze, verständliche Interpretation in natürlicher Sprache
- Einordnung statt Bewertung
- Keine Handlungsanweisung, keine Diagnose

**Wichtig:**
- Der Agent arbeitet **passiv**
- Keine automatischen Pushes
- Nur auf bewusste Anfrage oder beim Öffnen eines Inbox-Eintrags

---

## 8. Räumlicher Panel-Wechsel (Karussell / Gesten-basierte Navigation)

**Ziel:**  
Weiterentwicklung der aktuellen Tab-Navigation (z. B. zwischen Blutdruck, Körper, Labor) hin zu einem **räumlich erlebbaren Wechsel**, der MIDAS stärker als „bewohnbaren Raum“ wahrnehmbar macht – ohne Effizienz oder Klarheit zu verlieren.

**Motivation:**  
Die bestehenden Tabs sind funktional, schnell und sauber, erinnern jedoch noch an das frühere Akkordeon-Paradigma. Langfristig soll MIDAS nicht nur bedient, sondern **erlebt** werden. Subtile Bewegung beim Kontextwechsel erhöht Orientierung, Wertigkeit und emotionale Bindung.

**Grundidee:**  
- Tabs bleiben konzeptionell bestehen (kein Bruch der Informationsarchitektur).  
- Der Wechsel zwischen Tabs kann optional über eine **räumliche Animation** erfolgen (z. B. Karussell-ähnlich, seitliche Rotation, geführtes Sliding).  
- Der Wechsel dauert bewusst minimal länger (~300–400 ms) als ein reiner Klick, um den Kontextwechsel mental zu rahmen.

**Interaktionsprinzip (konzeptionell):**
- Direkte Nutzerinteraktion (Tap / Swipe) triggert die Bewegung.  
- Aktives Panel wird visuell „gegriffen“ (leichte Skalierung / Rahmen).  
- Nach Abschluss rastet das neue Panel klar ein, Animation endet vollständig.  
- Keine Daueranimation, kein Auto-Play.

**Abgrenzung / Guardrails:**
- Nicht für die Arzt-Ansicht (diese bleibt strikt instrumentell).  
- Nur für Nutzer-Panels (Vitals, Intakes, persönliche Module).  
- Animation ist unterstützend, nicht dekorativ.  
- Optional / deaktivierbar denkbar (Zukunft).

**Status:**  
Future / Nice-to-Have  
→ Bewusst nicht Teil der aktuellen Roadmap, sondern Reife-Feature für ein späteres MIDAS-Stadium.

---

**Ende der Zusammenfassung**
