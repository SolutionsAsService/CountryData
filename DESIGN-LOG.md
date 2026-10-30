# DESIGN-LOG — CountryData revamp (DADA-lite)

The previous layout is on branch `legacy-2026-10-29`.

## Plan
- **Brief:** a full revamp and reorganisation of an open-data repository: clean, valid, findable data, and a site that presents it.
- **Mode:** Adaptive (MAYA): data users and curious readers. Lite run: inline premortem, one panel round (one sub-agent, five seats), per `dada-lite/references/lessons.md`.
- **Seed:** stance `How to Use Graphic Design to Sell Things, Explain Things, Make Things Look Better (Michael Bierut)`; rules `Don't Make Me Think (Steve Krug)`, `WCAG 2.2 Contrast and Perceivability (W3C)`; breaker `Beautiful Evidence (Edward Tufte)` (the atlas charts its own completeness); counterpoint `MAYA: Most Advanced Yet Acceptable (Raymond Loewy)`.
- **Premortem (inline):** 198 country files loose at the root, misspelled names (Phillipines, Granada for Grenada, Turkeye, USPossesions), 19 invalid JSON files (pasted "json / Copy code", a cursor character, comments, unquoted values, truncated keys), 2 empty files, a viewer depending on raw GitHub URLs and a third-party map file whose names didn't match.

## Moves
- **M1** KEEP. Repair before anything else: the 19 broken files fixed at the damaged spot, nothing invented (one missing value → `null`, one truncated key line removed); the 2 empty files removed. `tools/validate.py` guards it.
- **M2** KEEP. Reorganise: `data/countries/`, `data/historical/[group/]`, kebab-case slugs, misspellings fixed, every old name kept in `data/index.json` → `formerly`.
- **M3** KEEP. A generated multi-page site (265 pages): browse by continent with a live filter, one page per record with a section index, a historical index grouped by power, About the data, 404; `site/data/` serves the raw JSON. Newsreader + IBM Plex, paper/ink/atlas red, dark mode.
- **M4** BREAK. "An atlas that shows its own gaps": every record page leads with a 12-cell coverage strip (solid = the record has a section for that core topic and links to it; hatched = "not yet"), every list entry carries a 12-tick meter, and About tallies coverage per topic across the 198 country records.

## Panel R1 (`panel/R1/panel.md`)
| Seat | Verdict | Resolution |
|---|---|---|
| Debord | PASS: the claim's proof is one click away (raw JSON, computed strip, About table) | — |
| Shklovsky | PASS (note: key the list meters) | Applied: one-line key under the search. |
| Mace | OBJECT: "Governme/nt" breaks mid-word; hatched labels low contrast | Mid-word break was already fixed (the panel's screenshot predated it; re-captured). Hatched labels now sit on a solid chip. |
| Krug | OBJECT: two vocabularies (section list vs strip); very long phone list | ADAPT: strip cells link to their sections; "not yet" on empty cells; "Back to top" on every continent. |
| Cairo | OBJECT: "9 of 12" counts sections, not completeness; continent table undisclosed | ADAPT: record pages say "have a section"; About explains what is counted, shows "of 198", and discloses the continent table. |

## Final measurements (after the last edit)
- `tools/validate.py`: 261 files, all valid JSON, all listed once.
- Build: 265 pages, no dead local links.
- Index, About, 404 at 1440/390 in light and dark: no overflow, no text below WCAG minimum. Nine page types at 1440/390/320: no overflow, every strip link resolves, no strip cell overflows.

## Open items
- Merge the two China records (`china`, `china-prc`); add missing countries (e.g. Guinea).
- One shape for every record (modern and historical shapes coexist).
