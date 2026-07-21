# Runbook RB-004 - Supabase SQL Cutover

## Zweck und Zuständigkeit

Dieses Runbook beschreibt einen kontrollierten SQL-Cutover für `BS-006` bis
`BS-010` und `BS-012`. Es trennt lokalen Beweis, produktive Freigabe, Cutover,
Postchecks und Rollback-Grenzen.

## Voraussetzungen

- Kanonische SQL-Datei, Ausführungsreihenfolge und Zielprojekt sind eindeutig.
- Code-/Contract-Review und SQL-spezifische Preflight-Abfragen sind grün.
- Docker Desktop und Supabase CLI funktionieren für den lokalen Stack.
- Backup oder Export ist vorhanden, wenn der Cutover Daten löscht oder
  irreversibel transformiert.
- Erwartete Grants, RLS-Policies, RPC-ACLs, Cron-Jobs und Postconditions sind
  vor der Ausführung notiert.

## Wirkung

- Lokaler Stack: `disposable`.
- Produktiver SQL-Cutover: `productive`.

## Owner-Gate

Produktives SQL im Supabase SQL Editor oder über eine direkte Verbindung darf
nur nach expliziter Owner-Freigabe ausgeführt werden. Die Freigabe nennt Datei,
Reihenfolge, Zielprojekt und bekannte irreversible Wirkung.

## Ablauf

1. SQL-Datei und [SQL How-To](../../../sql/HOW_TO.md) lesen; kein Snippet aus
   Chat oder Historie als Source of Truth verwenden.
2. Lokalen Stack starten:

   ```powershell
   supabase start --workdir backend
   supabase status --workdir backend
   ```

3. Die von `supabase status --workdir backend` genannte lokale Studio-URL
   öffnen. Im lokalen SQL Editor exakt die reviewte Repo-Datei in der
   vorgesehenen Reihenfolge ausführen; alternativ darf `psql` mit der lokalen
   DB-URL verwendet werden.
4. Idempotenz oder den dokumentierten Rerun-Guard prüfen; Grants, RLS, RPC,
   Cron und Daten-Postconditions gezielt lesen.
5. Lokalen Stack beenden:

   ```powershell
   supabase stop --workdir backend
   ```

6. Produktiven Preflight und Backup-/Export-Nachweis dokumentieren.
7. Owner-Gate einholen und exakt die reviewte Datei im richtigen Zielprojekt
   ausführen.
8. Unmittelbar Postchecks ausführen: Objektbestand, Zeilenzahlen, Constraints,
   Grants/RLS, RPC-ACL, Cron-Vertrag und betroffene App-Smokes.
9. Security Advisor oder RLS Tester nur als ergänzenden Nachweis verwenden;
   sie ersetzen weder Repo-SQL noch fachliche Tests.

## Erwartung

- Lokaler Lauf hinterlässt keinen produktiven Zustand.
- Produktiver Cutover konvergiert auf den dokumentierten Objekt- und Datenstand.
- RLS und explizite Grants bleiben gemeinsam wirksam.
- Named Cron Jobs existieren genau einmal mit geplantem Owner, Schedule und Command.
- App- und Edge-Consumer funktionieren nach dem Cutover unverändert oder wie
  im freigegebenen Vertrag geändert.

## Abbruchbedingungen

- Zielprojekt, SQL-Reihenfolge oder Wirkung ist unklar.
- Backup fehlt bei irreversibler Datenwirkung.
- Lokaler Lauf oder Postcheck ist rot.
- Owner-Freigabe fehlt.
- Produktionsstand weicht vom Preflight ab oder ein Lock-/Timeout-Risiko ist offen.

## Cleanup und Postconditions

Lokalen Stack stoppen; bei reinem Testbedarf optional erst nach separater
Prüfung mit `--no-backup` verwerfen. Produktiv gilt nur der vorab definierte
Rollback. Bereits gelöschte Zeilen lassen sich nicht durch Deaktivieren eines
Cron-Jobs wiederherstellen und benötigen Backup oder Export.

## Evidence

SQL-Datei und Hash/Commit, Zielprojekt als redigierte Kennung, lokaler Lauf,
Owner-Freigabe, Cutover-Zeit, Pre-/Postcounts, ACL-/Cron-Ergebnis und App-Smokes
in Roadmap oder Evidence dokumentieren. Keine Secrets oder Rohzugangsdaten.
