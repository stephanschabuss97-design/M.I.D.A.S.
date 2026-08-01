# MIDAS Activity V2 – bereinigte Fitnessstudio-Inventarreferenz

## Status und Provenienz

<!-- markdownlint-disable MD013 -->

| Feld | Wert |
| --- | --- |
| Status | `C2-FROZEN` |
| Stand | `2026-08-01` |
| Externe Quelle | `C:\Users\steph\Desktop\Bilder Gym\Fitnessstudio_Geraeteinventar.md` |
| Verifikation | `K-01 bis K-20 und C-01 bis C-06 gegen C2-Roadmap und Owner-Freeze geprüft` |
| Zweck | `Kontrollierte Geräte- und Suchfakten für Katalogversion 2` |
| Nicht enthalten | `Gesundheitsdaten, medizinische Einordnung, Trainingsplanung, Übungsempfehlungen, Sicherheitshinweise, Fotos sowie Hersteller-/Modellannahmen` |

<!-- markdownlint-enable MD013 -->

Diese Referenz übernimmt ausschließlich die für C2 freigegebenen
Inventarbezeichnungen und ihre Katalog-/Suchzuordnung. Sie ist kein
Trainingsplan und keine Aussage über persönliche Nutzung oder Eignung.

## Geführte Kraftmaschinen

`C2-Identität` bezeichnet die fachlich freigegebene Historienidentität. Das
allgemeine Suchergebnis kann wegen des unveränderten R1-Rankings weitere
Token-Treffer enthalten; deshalb werden beide Grenzen getrennt ausgewiesen.

<!-- markdownlint-disable MD013 -->

| ID | Verifizierte Studiobezeichnung | C2-Identität | Erwartetes allgemeines Suchergebnis |
| --- | --- | --- | --- |
| `K-01` | `Leg Press` | `leg_press` | `[leg_press]` |
| `K-02` | `Leg Extension` | `leg_extension` | `[leg_extension]` |
| `K-03` | `Leg Curl` | `leg_curl` | `[leg_curl]` |
| `K-04` | `Glute` | `glute_kickback` | `[glute_kickback, glute_bridge]` |
| `K-05` | `Abductor` | `hip_abduction` | `[hip_abduction]` |
| `K-06` | `Adductor` | `hip_adduction` | `[hip_adduction]` |
| `K-07` | `Multi Hip` | `glute_kickback`; `hip_abduction`; `hip_adduction` | `[glute_kickback, hip_abduction, hip_adduction]` |
| `K-08` | `Rotary Calf` | `calf_raise` | `[calf_raise]` |
| `K-09` | `Upper Back` / `High Row` | `high_row` | `[high_row]` |
| `K-10` | `Low Row` | `seated_row` | `[seated_row]` |
| `K-11` | `Pulldown` | `lat_pulldown` | `[lat_pulldown, straight_arm_pulldown]` |
| `K-12` | `Vertical Traction` | `lat_pulldown` | `[lat_pulldown]` |
| `K-13` | `Chest Press` | `chest_press` | `[chest_press]` |
| `K-14` | `Pectoral` | `chest_fly` | `[chest_fly]` |
| `K-15` | `Shoulder Press` | `shoulder_press` | `[shoulder_press]` |
| `K-16` | `Delts Machine` | `lateral_raise` | `[lateral_raise]` |
| `K-17` | `Abdominal Crunch` | `core_press` | `[core_press]` |
| `K-18` | `Total Abdominal` | `total_abdominal` | `[total_abdominal]` |
| `K-19` | `Rotary Torso` | `torso_rotation` | `[torso_rotation]` |
| `K-20` | `Lower Back` | `back_extension` | `[back_extension]` |

<!-- markdownlint-enable MD013 -->

### Multi-Hip-Grenze

- `Multi Hip Extension` → `glute_kickback`
- `Multi Hip Abduction` → `hip_abduction`
- `Multi Hip Adduction` → `hip_adduction`
- Kein generischer `multi_hip`-Key.
- Kein `hip_flexion`-Key in C2; späterer realer Bedarf erfordert eine neue
  Katalogversion.

## Cardiogeräte und freigegebene Suchbegriffe

Mengenangaben und exakte Hersteller-/Modellidentitäten sind keine
Produktidentitäten. Wo die externe Quelle eine Geräteart nicht eindeutig
bestimmt, bleibt diese Unsicherheit erhalten.

<!-- markdownlint-disable MD013 -->

| ID | Bereinigte Inventarbezeichnung | Freigegebene Suchbegriffe | Erwartetes Suchergebnis |
| --- | --- | --- | --- |
| `C-01` | `Stepmill`; zusätzlich geneigtes Kletter-/Treppengerät mit offener genauer Identität | `Stepmill` | `[stair_climber]` |
| `C-02` | `Ski Trainer / SkiErg` | `SkiErg`; `Ski-Ergometer` | `[ski_erg]` |
| `C-03` | `Ruderergometer` | `Ruderergometer` | `[rowing]` |
| `C-04` | `Ellipsen-/Crosstrainer` | `Crosstrainer`; `Ellipsentrainer` | `[cross_trainer]` |
| `C-05` | `Laufband` | `Laufband` | `[running, walking]` |
| `C-06` | `Fahrradergometer / Indoor Cycle` | `Fahrradergometer` | `[cycling]` |

<!-- markdownlint-enable MD013 -->

## Quellen- und Datenschutzgrenze

Aus der externen Inventardatei wurden ausschließlich IDs, Gerätearten,
Studiobezeichnungen und die oben festgelegten Suchfakten übernommen. Nicht
übernommen wurden:

- persönlicher Gesundheits- oder Befundkontext;
- medizinische Risiko-, Eignungs- oder Sicherheitseinschätzungen;
- Trainingsauswahl, Priorisierung, Reihenfolge oder Belastungsempfehlungen;
- Muskel-, Überschneidungs- oder Planungsmatrizen;
- Foto-, Hersteller- oder Modellannahmen jenseits der freigegebenen Begriffe;
- Inhalte aus Trainingsplan-Markdown oder PDF.

Bei einem späteren Quellenwiderspruch stoppt die betroffene Identitätsgrenze;
diese Referenz wird nicht durch Vermutung ergänzt.
