# DADA-lite panel, round R1 (Adaptive/MAYA), CountryData atlas

## 1. Debord, The Society of the Spectacle
- Anchor: spectacle as mediated image replacing lived relation; the antidote is showing the apparatus.
- Observed: the hero ("An atlas that shows its own gaps.") is a large editorial slogan, but the page also links the raw file (`data/countries/france.json`) and the strip is computed from the files by the build, not asserted. The headline is a claim; the About table and hatched cells are the proof, one click away.
- Verdict: PASS
- Requested change: none (note: the hero is the loudest thing on the page and the evidence is the quietest; keep the proof visible near the fold, not only on About).
- Andon: no

## 2. Shklovsky, Art as Technique
- Anchor: defamiliarization; art makes the stone stony by prolonging perception.
- Observed: the 12-cell strip (solid black vs hatched dashed cells) makes an absence perceptible, and the 12-tick meter on every list entry repeats it. On index-1440 the meters are tiny (about 60 px wide) and read as texture before they read as data. Device is fresh, form is consistent from list to record to About.
- Verdict: PASS
- Requested change: none (note: the list meters need a one-line key on the home page so the device is decoded, not just felt).
- Andon: no

## 3. Ronald Mace, Universal Design
- Anchor: equitable use, perceptible information, simple intuitive use, tolerance for error, low physical effort.
- Observed: the strip is an `<ul>` with aria-label and sr-only "included / not in this record", so the pattern is not colour-only; hatch plus dashed border plus word. Search has a visible label; layout has no overflow at 390 and 320. Concern: on france-1440 the label "Governme/nt" breaks mid-word in a cell, and the hatched cells carry grey small text on a pale hatch, a perceptibility risk at low vision. The filled-vs-hatched cue also relies on dark vs light contrast.
- Verdict: OBJECT
- Requested change: stop mid-word breaks in strip labels (smaller type, `hyphens:none`, shorter label "Govt." only if the full word is kept in sr text, or let cells be wider); give the hatched-cell label full text contrast over the hatch (solid chip behind the text).
- Andon: no

## 4. Steve Krug, Don't Make Me Think
- Anchor: self-evident pages, scannable, billboard design, the trunk test (where am I, what can I do here).
- Observed: nav shows current page with an underline; the record page has a breadcrumb "Atlas / Europe", the title, "9 of 12 core topics in this record", and a raw JSON link. Home has a labelled "Find a country" field above the continent chips. But the "9 of 12" line names a count without saying what "core topics" are until the cells are read, and the record's contents list has 13 entries (incl. "Economic Outlook 2024", "National Performance Metrics") that differ from the 12 strip topics, so "In this record" and the strip use two vocabularies. Home 390 is a very long single list (about 11,000 px) with only chips to jump.
- Verdict: OBJECT
- Requested change: make the strip cells anchor links to their sections (or hatched cells say "not yet in this record" on tap) so the two vocabularies connect; add a "back to top" or sticky continent jump on the mobile home.
- Andon: no

## 5. Alberto Cairo, The Truthful Art
- Anchor: truthful, functional, beautiful, insightful, enlightening; show the denominator, don't mislead by encoding.
- Observed: About says "198 country records", a topic counts "when the record has a top-level section for it", counts are printed beside bars (190, 175, 198...) and the bars start at zero. This is honest and checkable. Risks: the strip measures presence of a section, not completeness of its content, so "9 of 12" may read as 75% complete when one section could hold a single field; and the 60 continent assignments from a build table are not disclosed on the page (evidence says the table exists). PRC and China both kept, flagged.
- Verdict: OBJECT
- Requested change: on About, state plainly that coverage means "has a section", not "is complete", and that the continent for some records comes from the build's table, not the file; show the bar axis maximum (198) as a visible reference.
- Andon: no

## Summary
PASS 2, OBJECT 3. No Andon. Requested changes: strip label wrapping and hatched-text contrast (Mace); strip cells link to sections and mobile home jump (Krug); About must state what "coverage" and the continent table mean, with the 198 reference (Cairo). Style note: add a key for the list meters (Shklovsky).
