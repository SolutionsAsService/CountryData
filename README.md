# CountryData

Open JSON data: one file per country, territory and historical state, plus a
generated atlas site that shows what every record covers and what it doesn't yet.

- **198 country records** and **63 historical states**, empires, colonies and mandates.
- **One manifest**, [`data/index.json`](data/index.json), lists every record.
- MIT licensed.

The previous layout (files at the repository root) is on the `legacy-2026-10-29` branch.

## Layout

```
data/
  index.json                       every record: slug, name, kind, group, region,
                                   path, formerly (its old file name), sections
  countries/<slug>.json            one file per country or territory
  historical/<slug>.json           states and empires
  historical/<group>/<slug>.json   possessions, grouped by the power that held them
                                   (british-, dutch-, french-, german-, japanese-,
                                   spanish-, us-possessions, soviet-union)
tools/validate.py                  checks the data (see below)
_src/                              the site generator (build.py, layout.html)
site/                              the generated atlas, deployable as-is
  data/                            a copy of data/, so the site serves the raw JSON
vercel.json                        static deploy, no build step
```

Slugs are kebab-case (`united-states`, `saint-lucia`). Historical slugs inside a group
are prefixed with the group in the manifest (`french-possessions--new-france`).

## Using the data

Read `data/index.json` first, then fetch the files it lists. On GitHub:

```
https://raw.githubusercontent.com/SolutionsAsService/CountryData/main/data/index.json
https://raw.githubusercontent.com/SolutionsAsService/CountryData/main/data/countries/france.json
```

**Two shapes are in use.** Most modern records have top-level sections such as `Name`,
`Symbols`, `Geography`, `Demographics`, `Government`, `Economy` and `History`. Older
records and the historical states use lower-case or camel-case keys (`currency`,
`period`, `predecessors`). Some records wrap everything in one key named after the
country. Both shapes are kept as written; the manifest's `sections` field lists each
record's top-level keys.

## Contributing

Edit or add a file under `data/`, add or update its entry in `data/index.json`, then:

```bash
python tools/validate.py     # every file is valid JSON, listed once, kebab-case, unique slug
python _src/build.py         # rebuild the site into site/
```

Commit both `data/` and `site/`.

## Known gaps

- Coverage is uneven: the atlas's About page counts, for each core topic, how many
  country records include it.
- `china.json` and `china-prc.json` are two separate records for China; they should be
  merged.
- Some countries have no record yet (for example Guinea).
- Two historical files were empty and were removed: `Historical/DutchPossessions/DutchEmpire.json`
  and `Historical/Soviet/SovietEmpire.json`.
- 19 files that were not valid JSON were repaired at the damaged spot, with no data
  invented: Venezuela's `extrajudicial_executions` had no value and is now `null`;
  a truncated `Culture_and_S` key line in the UAE record was removed.

## Renamed files

`Phillipines` → `philippines`, `Granada` → `grenada` (the record is Grenada),
`Turkeye` → `turkiye`, `USPossesions` → `us-possessions`, `UK` → `united-kingdom`,
`PRC` → `china-prc`. Every old name is kept in the manifest's `formerly` field.
