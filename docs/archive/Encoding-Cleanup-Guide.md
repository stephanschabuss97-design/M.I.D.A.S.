# Encoding Cleanup Guide (Mojibake)

Ziel
- Schnell alle Encoding-Artefakte finden (z.B. "LÃ¶schen", "verf?gbar").
- Aenderungen manuell durch Stephan, Codex liefert nur die Fundstellen.
- Fokus: nur nicht-generierte Dateien (keine Build-Artefakte).

Begriffe
- "Mojibake" = kaputte Umlaut-Darstellung (Ã¶, Ã¤, Ã¼, ?, \uFFFD).
- Ziel: echte Umlaut-Buchstaben nutzen, Artefakte beseitigen.

Regeln
- Keine Auto-Fixes durch Codex, nur Liste mit Datei:Zeile.
- Docs/ optional ueberspringen (nur wenn explizit gewuenscht).
- Build-Ordner immer ausschliessen (z.B. twa/app/build, node_modules).

Standard-Scan (JS/TS)
1) Mojibake (UTF-8 falsch decodiert)
   - Command:
     rg -n "Ã.|\\uFFFD" --glob "*.js" --glob "*.ts"
2) Fragezeichen-Artefakte (L?sch, verf?gbar)
   - Command:
     rg -n "L\\?schen|f\\?r|r\\?ck|K\\?r|w\\?hlen|verf\\?gbar|Aktivit\\?t|best\\?t|best\\?tigt" --glob "*.js" --glob "*.ts"

Rest-Repo (ohne docs, ohne JS/TS/CSS, ohne Build)
- Command:
  rg -n "\\uFFFD|Ã.|\\?[A-Za-z]" \
    --glob "!docs/**" \
    --glob "!*.js" \
    --glob "!*.ts" \
    --glob "!*.css" \
    --glob "!twa/app/build/**" \
    --glob "!twa/app/.firebase/**" \
    --glob "!twa/app/node_modules/**" \
    --glob "!tmp.txt"

Optional: nur bestimmte Dateitypen
- SQL/JSON/HTML/YML:
  rg -n "\\uFFFD|Ã.|\\?[A-Za-z]" \
    --glob "*.sql" --glob "*.json" --glob "*.html" --glob "*.yml" \
    --glob "!docs/**" \
    --glob "!twa/app/build/**"

Auswertung
- Codex listet alle Treffer als:
  - `path:line` + kurzer Auszug
- Stephan korrigiert manuell (UTF-8 Umlaut setzen).
- Danach optional nochmal scannen, um "clean" zu bestaetigen.

Benennung fuer die Aktion
- "Encoding Cleanup"
- "Mojibake Sweep"
- "Umlaut-Audit"
