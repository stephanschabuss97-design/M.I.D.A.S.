# Repo Cleanup Roadmap

Ziel
- Unbenutzte UI-Elemente, Event-Handler und JS-Pfade entfernen.
- Fokus auf JS-Logik, nur offensichtliche UI-Duplikate in HTML.
- Kein Deep Dive in CSS, keine Aenderungen in md/txt/doc.

Scope
- In Scope: `app/modules/**`, `app/core/**`, `app/supabase/**`, `app/diagnostics/**`, `app/styles/**`, `index.html`
- Out of Scope: `docs/**`, `*.md`, `*.txt`
- Fokus: tote Buttons, ungenutzte IDs, nicht erreichbare Codepfade.

Arbeitsweise
- Ordner fuer Ordner, Datei fuer Datei.
- Pro Datei: Liste "sicher tot" vs. "verdaechtig".
- Entfernen nur, wenn "sicher tot".

Start hier (fuer neue Sessions)
1) Oeffne: `docs/Repo Cleanup Roadmap.md`
2) Oeffne: `index.html`
3) Starte mit Step 1.

Status
- Step 1: pending
- Step 2: pending
- Step 3: pending
- Step 4: pending
- Step 5: pending
- Step 6: pending
- Step 7: pending
- Step 8: pending

Deterministische Steps

Step 1: Inventar Intake-Stack
1.1 `app/modules/intake-stack/**` scannen (IDs, Buttons, Handler).
1.2 In `index.html` die Intake-Sektion matchen.
Output: Liste "sicher tot" + "verdaechtig".
Exit-Kriterium: Liste ist komplett.

Step 2: Inventar Vitals-Stack
2.1 `app/modules/vitals-stack/**` scannen.
2.2 `index.html` Vitals-UI matchen.
Output: Liste "sicher tot" + "verdaechtig".
Exit-Kriterium: Liste ist komplett.

Step 3: Inventar Hub
3.1 `app/modules/hub/**` scannen.
3.2 `index.html` Hub-Panel/Carousel matchen.
Output: Liste "sicher tot" + "verdaechtig".
Exit-Kriterium: Liste ist komplett.

Step 4: Inventar Appointments
4.1 `app/modules/appointments/**` scannen.
4.2 `index.html` Appointments-UI matchen.
Output: Liste "sicher tot" + "verdaechtig".
Exit-Kriterium: Liste ist komplett.

Step 5: Globales UI Glue
5.1 `index.html` globale IDs/Buttons gegen JS referenzen pruefen.
5.2 Offensichtliche UI-Duplikate markieren.
Output: Liste "sicher tot" + "verdaechtig".
Exit-Kriterium: Liste ist komplett.

Step 6: Inventar Core
6.1 `app/core/**` scannen (boot flow, globals, utils).
6.2 Calls in `assets/js/**` und `app/modules/**` matchen.
Output: Liste "sicher tot" + "verdaechtig".
Exit-Kriterium: Liste ist komplett.

Step 7: Inventar Supabase + Diagnostics
7.1 `app/supabase/**` scannen (api, auth, core, realtime).
7.2 `app/diagnostics/**` scannen (logger/monitor/perf).
Output: Liste "sicher tot" + "verdaechtig".
Exit-Kriterium: Liste ist komplett.

Step 8: Cleanup-Runde
8.1 "Sicher tot" entfernen (JS + HTML).
8.2 Ruecktest: kein gebrochener Flow.
Output: Bereinigter Stand.
Exit-Kriterium: keine toten Pfade mehr in geprueften Ordnern.
