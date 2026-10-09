# MIDAS Supabase Modernization — zurückgestellte Arbeiten und Recovery

Status: **DEFERRED / NO_ACTIVE_EXECUTION_AUTHORITY**, Owner Stephan, 2026-10-09.
Dies ist der lebende Restarbeits-/Betriebshinweis zum vom Owner beendeten
Modernisierungspaket, kein neuer Implementierungsauftrag oder neuer Produktgate.

Backend/Web ist nach D32 ausgerollt und durch Stephans normale Nutzung und neue
Arztberichte auf Live Server, PC und Android unter D33 akzeptiert. Die vier
Planungs-/Evidence-/Startdokumente liegen im Archiv. Der Backend/Web-Child ist
DONE; der umfassendere Parent ist ein ehrlicher Owner-Teilabschluss.

- [Backend/Web-Abschluss](<archive/MIDAS Supabase Backend and Web Authentication Modernization Roadmap (DONE).md>)
- [Parent und zurückgestellte Waves](<archive/MIDAS Supabase API Key and Edge Authentication Modernization Masterplan (CLOSED).md>)
- [Historische Originalevidence und Owneracceptance](<archive/MIDAS Supabase API Key and Edge Authentication Modernization Evidence (CLOSED).md>)

## Erhaltener Betriebsvertrag

- Web v34; acht D32-Functions mit festen Owner-/Named-Keyguards veröffentlicht.
  Incident verwendet `verify_jwt=false` zusammen mit dem strikten Named-Keyguard;
  die übrigen sieben Flags sind erhalten. Incident-Scheduler wieder aktiv.
- API-Key ausschließlich in `apikey`, aktueller User-JWT in `Authorization`.
  Privilegierte Keys gehören in Operator-/Serverstores, niemals in Publicclients.
- HS256 CURRENT / ES256 STANDBY. **Keine Signingrotation. Legacy-Keys aktiv.**
  Vorhandene Legacy-Stores für kompatible alte Clients und Recovery erhalten.
- AI bleibt deaktiviert; keine Aktivierung, Provider-/Pushprobe oder neue
  Gesundheitsdaten aus diesem Dokument ableiten.
- Lokaler ignorierter Operatorstore: `.env.supabase.local` mit den 13 belegten
  Feldern. [Secretsfreie Vorlage](<templates/MIDAS Supabase Operator Env.example>)
  und [Consumer-/Storezuordnung](<MIDAS Supabase Operator Key and Store Map.md>).
  Private Secrets, Tokens, Preimages und Receipts bleiben außerhalb Git.

## Ausdrücklich zurückgestellte Restarbeit

| Bereich | Tatsächlicher Stand | Grenze vor späterer Ausführung |
| --- | --- | --- |
| W4 / F05 native Seite | Normaler mobiler Report ownerbestätigt; dedizierte native Public-Key-/Store-/Restore-/Widgetmigration nicht umgesetzt oder dadurch technisch bewiesen | Eigenes natives Child-S4R, konkret gebundene G5-Device-/APK-/Storefreigabe und sicherer Rückweg; vor dem nativen Keywechsel alle privilegierten Restorefallbacks prüfen |
| W5 Legacy | Legacy weiterhin aktiv; keine Abschaltung, Rotation oder Revoke | Eigenes Abschalt-Child-S4R/G6; echte Consumer-/Job-/APKpostimages, Beobachtungsfenster, Forward/Reverse und Postchecks unter deaktivierten Legacy-Keys |
| Vollständiger W6 / A1–A8 | Nur das ausgelieferte Backend/Web-Paket abgeschlossen; A6 und native Roll-up-Nachweise nicht erfüllt | Erst nach tatsächlichen W4-/W5-Exitnachweisen vollständiger Programmabschluss |

Owner der zurückgestellten Arbeit und ihrer offenen nativen Securitygrenze ist
Stephan. Das Archiv ist historische Evidence, keine aktive Ausführungsautorität.
Keine aktuelle KASRKIN-Zulassung, Gerätesicherheit, vollständige Storemigration
oder Legacyfreiheit aus dem Owner-Teilabschluss ableiten.

## Recovery und späterer Wiedereinstieg

Bei einem neuen Fehler zuerst den betroffenen Client, Origin, Zeitpunkt und
sichere Fehlerklasse erfassen. Keine Key-/Token-/Gesundheitswerte protokollieren.
Unveränderte Nachweise weiterverwenden; konkrete Drift gezielt prüfen. Aktuelle
Produktbytes und Stores gegen das tatsächlich gewünschte Rückwegspaket binden.
Keine pauschale Rotation, Legacyabschaltung oder automatische Datenkorrektur.

Die D32-Runtime-/Flag-/Store-/Workflowpreimages und Originalreceipts liegen
ignoriert unter `.kasrkin/work/supa-g3-cutover-resume2-20261009/`; zugehöriges
Originalbundle unter `.kasrkin/work/supa-g3-cutover-resume2-candidate-20261009/`.
Diese Pfade sind Evidence-/Recoveryreferenzen, keine neue Befehlsauswahl.
Der frühere Browser-Konfigurationsrückweg ist nicht als vollständig persistiertes
exaktes Preimage belegt; vor einem späteren Origin-/Storewechsel frisch sichern.

Der D33-Dateiabschluss erfolgte auf ausdrücklichen User Override außerhalb der
abgelehnten Work/3-Zulassung. Kein Originalpermit und keine Completion hierfür;
Kosten/Attribution/Parallelismus/Messoverhead UNKNOWN. Private Dokumentpreimages,
Overridebeleg und Context Receipt:
`.kasrkin/work/supa-owner-close-override-20261009/`. Historische Originale nicht
nachträglich aufwerten oder abgelehnte Bundles reaktivieren.
