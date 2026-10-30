# Evidence, DADA-lite round R1 (whole artifact)

Repo: H:/UBM/_cd (SolutionsAsService/CountryData). Open JSON data: one file per country and historical state. Revamp + reorganisation.

Before: 198 country JSON files loose at the repo root, 63 historical files in inconsistently named folders (e.g. "USPossesions"), misspelled file names (Phillipines, Granada for Grenada, Turkeye), 19 files that were not valid JSON (pasted chat text "json / Copy code", a typing cursor character, comments, an unquoted value "5.47 km", truncated keys, a list used as an object), 2 empty files, and a one-page viewer that fetched raw GitHub URLs plus a third-party GeoJSON whose names did not match the file names.

After:
- data/countries/<slug>.json and data/historical/[<group>/]<slug>.json, kebab-case; data/index.json manifest (slug, name, kind, group, region, path, formerly, sections); tools/validate.py checks every file parses, every file is listed once, slugs unique (passes: 261 files).
- All 19 broken files repaired at the damaged spot without inventing data (a missing value became null; a truncated key line removed); 2 empty files removed. PRC.json and China.json are both kept (two records for China) and flagged.
- A generated multi-page site in site/ (265 pages): home (browse by continent, live filter), one page per record, historical index grouped by the power that held them, About the data (coverage table), 404. site/data/ serves the same JSON.
- Bold move: "an atlas that shows its own gaps". Every record page has a 12-cell coverage strip (filled = the record has a top-level section for that core topic, hatched = not yet), and every list entry a 12-tick meter; About shows coverage per topic across all 198 country records. Counted from the files by the build.
- Continent for browsing comes from the record's own region field, or a table in the build for 60 records whose region is missing or more specific (the data files are untouched).

Screenshots: H:/UBM/_cd/panel/shots/index-1440-light-fold.png, index-1440-light.png, index-390-light.png, about-1440-light.png, france-1440.png, france-390.png.
Measured: no horizontal overflow on index/about/404 and 8 sample record pages at 1440/390 (strip checked at 320 too); no text below WCAG minimum on index/about/404 in light and dark; filter "guin" → 3 matches, no script errors.
