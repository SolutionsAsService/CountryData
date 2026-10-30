"""Build the CountryData site from data/ into site/.

    python _src/build.py

Writes one page per record (site/countries/<slug>.html, site/historical/<slug>.html), the
home page (browse by continent, search), the historical index, the about-the-data page and
a 404, and copies data/ into site/data/ so the deployed site serves the raw JSON too.
Standard library only. Refuses to finish on a dead local link.
"""
import html
import json
import pathlib
import re
import shutil

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
SITE = ROOT / "site"
SRC = ROOT / "_src"
INDEX = json.loads((DATA / "index.json").read_text(encoding="utf-8"))
RECORDS = INDEX["records"]
e = html.escape

CONTINENTS = ["Africa", "Asia", "Europe", "North America", "South America", "Oceania"]
# Browsing only: a continent for records whose own region field is missing or more specific.
CONTINENT_OF = {
    "Afghanistan": "Asia", "Albania": "Europe", "Algeria": "Africa", "Andorra": "Europe", "Angola": "Africa",
    "Antigua and Barbuda": "North America", "Armenia": "Asia", "Austria": "Europe", "Azerbaijan": "Asia",
    "Bahamas": "North America", "Bahrain": "Asia", "Bangladesh": "Asia", "Barbados": "North America", "Belarus": "Europe",
    "Belgium": "Europe", "Belize": "North America", "Benin": "Africa", "Bhutan": "Asia", "Bosnia and Herzegovina": "Europe",
    "Botswana": "Africa", "Brunei": "Asia", "China (second record)": "Asia", "Democratic Republic of the Congo": "Africa",
    "Egypt": "Africa", "Fiji": "Oceania", "Georgia": "Asia", "Tonga": "Oceania", "Palau": "Oceania", "Panama": "North America",
    "Uganda": "Africa", "Zambia": "Africa", "Russia": "Europe", "Rwanda": "Africa", "Saint Kitts and Nevis": "North America",
    "Saint Lucia": "North America", "Saint Vincent and the Grenadines": "North America", "Vietnam": "Asia",
    "South Africa": "Africa", "Sri Lanka": "Asia", "Sudan": "Africa", "Sweden": "Europe", "Syria": "Asia", "Thailand": "Asia",
    "Togo": "Africa", "Transnistria": "Europe", "Trinidad and Tobago": "North America", "Tunisia": "Africa",
    "Turkmenistan": "Asia", "Tuvalu": "Oceania", "Türkiye": "Asia", "Ukraine": "Europe", "United Arab Emirates": "Asia",
    "United Kingdom": "Europe", "United States": "North America", "Uzbekistan": "Asia", "Vanuatu": "Oceania",
    "Vatican City": "Europe", "Venezuela": "South America", "Yemen": "Asia", "Zimbabwe": "Africa",
}
# The core topics a country record can cover, and the key spellings that count for each.
TOPICS = [
    ("Names", r"^(names?|common_?names?|official_?name|commonname|country|alias)"),
    ("Symbols", r"(symbols?|flag|anthem|motto|emblem|coat)"),
    ("Geography", r"(geograph|location|area|borders?|capital)"),
    ("People", r"(demograph|population|ethnic|religion|languages?)"),
    ("Government", r"(government|politic|legislature|head_?of|leaders?)"),
    ("Economy", r"(econom|gdp|currency|trade)"),
    ("History", r"(histor|independence|timeline)"),
    ("Education", r"(educat|literacy)"),
    ("Health", r"(health)"),
    ("Transport", r"(transport|infrastructure)"),
    ("Foreign relations", r"(international|relations|foreign|membership|affiliation)"),
    ("Culture", r"(cultur|cuisine|sport|heritage)"),
]


def continent(rec):
    if rec["name"] in CONTINENT_OF:
        return CONTINENT_OF[rec["name"]]
    r = (rec["region"] or "")
    for c in CONTINENTS:
        if c.lower() in r.lower():
            return c
    if "europe" in r.lower(): return "Europe"
    if "asia" in r.lower(): return "Asia"
    if "central america" in r.lower() or "caribbean" in r.lower(): return "North America"
    if "maghreb" in r.lower(): return "Africa"
    return None


def topics(rec):
    keys = [re.sub(r"[\s-]+", "_", k.lower()) for k in rec["sections"]]
    return [(t, any(re.search(p, k) for k in keys)) for t, p in TOPICS]


def label(key):
    k = re.sub(r"([a-z])([A-Z])", r"\1 \2", str(key)).replace("_", " ").strip()
    return k[:1].upper() + k[1:]


def render(value, depth=0):
    if isinstance(value, dict):
        if not value:
            return '<p class="empty">No entries.</p>'
        rows = "".join(f"<div><dt>{e(label(k))}</dt><dd>{render(v, depth + 1)}</dd></div>" for k, v in value.items())
        return f'<dl class="kv d{min(depth, 3)}">{rows}</dl>'
    if isinstance(value, list):
        if not value:
            return '<p class="empty">None listed.</p>'
        if all(not isinstance(v, (dict, list)) for v in value):
            return '<ul class="tags">' + "".join(f"<li>{render(v, depth + 1)}</li>" for v in value) + "</ul>"
        return '<ol class="items">' + "".join(f"<li>{render(v, depth + 1)}</li>" for v in value) + "</ol>"
    if value is None:
        return '<span class="empty">Not recorded</span>'
    if isinstance(value, bool):
        return "Yes" if value else "No"
    text = str(value)
    if re.match(r"^https?://\S+$", text):
        return f'<a href="{e(text)}" rel="noopener">{e(re.sub(r"^https?://(www\.)?", "", text)[:60])}</a>'
    return e(text)


def page(title, description, body, depth, nav=None):
    up = "../" * depth
    layout = (SRC / "layout.html").read_text(encoding="utf-8")
    out = layout.replace("{{title}}", e(title)).replace("{{description}}", e(description)).replace("{{body}}", body)
    out = out.replace("{{up}}", up)
    for key in ("browse", "historical", "about"):
        out = out.replace("{{cur:%s}}" % key, ' aria-current="page"' if nav == key else "")
    assert "{{" not in out, title
    return out


def record_page(rec):
    data = json.loads((ROOT / rec["path"]).read_text(encoding="utf-8"))
    if isinstance(data, dict) and len(data) == 1 and isinstance(next(iter(data.values())), dict):
        data = next(iter(data.values()))
    cover = topics(rec)
    have = sum(1 for _, ok in cover if ok)
    keys = [re.sub(r"[\s-]+", "_", k.lower()) for k in data]
    pattern = dict(TOPICS)
    def cell(t, ok):
        if not ok:
            return f'<li class="off"><span>{e(t)}</span><small>not yet</small><b class="sr-only">: not in this record</b></li>'
        i = next((n for n, k in enumerate(keys) if re.search(pattern[t], k)), None)
        inner = f'<span>{e(t)}</span>'
        return f'<li class="on"><a href="#s-{i}">{inner}</a></li>' if i is not None else f'<li class="on">{inner}</li>'
    strip = "".join(cell(t, ok) for t, ok in cover)
    where = rec["group"] or continent(rec) or ("Historical" if rec["kind"] == "historical" else "")
    toc = "".join(f'<li><a href="#s-{i}">{e(label(k))}</a></li>' for i, k in enumerate(data))
    sections = "".join(
        f'<section class="sec" id="s-{i}" aria-labelledby="h-{i}"><h2 id="h-{i}">{e(label(k))}</h2>{render(v)}</section>'
        for i, (k, v) in enumerate(data.items()))
    folder = "countries" if rec["kind"] == "country" else "historical"
    body = f'''<header class="rec-head wrap">
  <p class="crumb"><a href="../index.html">Atlas</a> <span aria-hidden="true">/</span> {e(where)}</p>
  <h1>{e(rec["name"])}</h1>
  <div class="coverage">
    <p class="cov-line"><strong>{have} of {len(cover)}</strong> core topics have a section in this record. <a href="../about.html#coverage">What this counts</a></p>
    <ul class="strip" aria-label="Core topics in this record">{strip}</ul>
  </div>
  <p class="raw"><a href="../{e(rec["path"].replace("data/", "data/", 1))}">Raw JSON</a> · <code>{e(rec["path"])}</code></p>
</header>
<div class="wrap rec-body">
  <nav class="toc" aria-label="Sections"><p class="toc-h">In this record</p><ol>{toc}</ol></nav>
  <article class="record">{sections}</article>
</div>'''
    desc = f'{rec["name"]} in CountryData: {", ".join(t for t, ok in cover if ok).lower() or "the record"}. Open data, one JSON file per record.'
    return folder, page(f'{rec["name"]} · CountryData', desc, body, 1)


def card(rec, depth):
    have = sum(1 for _, ok in topics(rec) if ok)
    folder = "countries" if rec["kind"] == "country" else "historical"
    return (f'<li class="card" data-name="{e(rec["name"].lower())}"><a href="{"../" * depth}{folder}/{rec["slug"]}.html">'
            f'<span class="nm">{e(rec["name"])}</span><span class="meter" aria-label="{have} of {len(TOPICS)} core topics">'
            f'<i style="--n:{have}"></i></span></a></li>')


def main():
    if SITE.joinpath("data").exists():
        shutil.rmtree(SITE / "data")
    shutil.copytree(DATA, SITE / "data")
    for folder in ("countries", "historical"):
        (SITE / folder).mkdir(parents=True, exist_ok=True)
        for old in (SITE / folder).glob("*.html"):
            old.unlink()
    written = []
    for rec in RECORDS:
        folder, text = record_page(rec)
        (SITE / folder / f'{rec["slug"]}.html').write_text(text, encoding="utf-8", newline="\n")
        written.append(f'{folder}/{rec["slug"]}.html')

    countries = [r for r in RECORDS if r["kind"] == "country"]
    hist = [r for r in RECORDS if r["kind"] == "historical"]
    by = {c: [] for c in CONTINENTS}
    for r in countries:
        by.setdefault(continent(r) or "Unplaced", []).append(r)
    cont_nav = "".join(f'<li><a href="#{c.lower().replace(" ", "-")}">{c} <span>{len(by[c])}</span></a></li>' for c in by if by[c])
    groups = "".join(
        f'<section class="cont" id="{c.lower().replace(" ", "-")}" aria-labelledby="c-{i}"><div class="cont-h"><h2 id="c-{i}">{e(c)} <span class="count">{len(rs)}</span></h2><a class="top" href="#main">Back to top</a></div>'
        f'<ul class="cards">{"".join(card(r, 0) for r in sorted(rs, key=lambda r: r["name"]))}</ul></section>'
        for i, (c, rs) in enumerate(by.items()) if rs)
    total_topics = sum(sum(1 for _, ok in topics(r) if ok) for r in countries)
    home = f'''<header class="hero wrap">
  <p class="kicker">Open data · {len(countries)} countries · {len(hist)} historical states</p>
  <h1>An atlas that shows<br>its own gaps.</h1>
  <p class="lede">CountryData is one JSON file per country, territory and historical state. Each page shows what its record covers, and what it doesn't yet.</p>
  <form class="search" role="search" onsubmit="return false"><label for="q">Find a country</label><input id="q" type="search" placeholder="Type a name" autocomplete="off" data-filter><p class="search-n" data-filter-count aria-live="polite"></p></form>
  <p class="key"><span class="meter" aria-hidden="true"><i style="--n:8"></i></span> The bar beside each name shows how many of the {len(TOPICS)} core topics its record has a section for.</p>
  <ul class="cont-nav">{cont_nav}<li><a href="historical/index.html">Historical <span>{len(hist)}</span></a></li></ul>
</header>
<div class="wrap">
{groups}
</div>'''
    (SITE / "index.html").write_text(page("CountryData · An open atlas of every country", f"{len(countries)} countries and {len(hist)} historical states as open JSON, one file each, with what every record covers.", home.replace("../", ""), 0, "browse"), encoding="utf-8", newline="\n")

    hgroups = {}
    for r in hist:
        hgroups.setdefault(r["group"] or "States and empires", []).append(r)
    hbody = f'''<header class="hero wrap small">
  <p class="kicker">Historical · {len(hist)} records</p>
  <h1>States that are gone.</h1>
  <p class="lede">Empires, colonies, mandates and states that no longer exist, grouped by the power that held them.</p>
</header>
<div class="wrap">''' + "".join(
        f'<section class="cont" aria-labelledby="g-{i}"><h2 id="g-{i}">{e(g)} <span class="count">{len(rs)}</span></h2><ul class="cards">{"".join(card(r, 1) for r in sorted(rs, key=lambda r: r["name"]))}</ul></section>'
        for i, (g, rs) in enumerate(sorted(hgroups.items(), key=lambda kv: (kv[0] != "States and empires", kv[0])))) + "</div>"
    (SITE / "historical" / "index.html").write_text(page("Historical states · CountryData", f"{len(hist)} historical states, empires and colonies in CountryData.", hbody, 1, "historical"), encoding="utf-8", newline="\n")

    rows = "".join(
        f'<tr><th scope="row">{e(t)}</th><td class="num">{sum(1 for r in countries if dict(topics(r))[t])}</td><td class="bar"><i style="--p:{sum(1 for r in countries if dict(topics(r))[t]) / len(countries) * 100:.0f}%"></i></td></tr>'
        for t, _ in TOPICS)
    about = f'''<header class="hero wrap small">
  <p class="kicker">About the data</p>
  <h1>Open, uneven, honest about it.</h1>
  <p class="lede">The records were written over time, in more than one shape. This page says how they're organised and how complete they are.</p>
</header>
<div class="wrap about">
  <section class="sec" id="coverage"><h2>How complete it is</h2>
    <p>For each core topic, how many of the <strong>{len(countries)}</strong> country records have a top-level section for it. A section counts whether it holds one line or fifty, so this measures what is <em>there</em>, not how complete it is. Counted from the files by <code>_src/build.py</code>.</p>
    <table class="cov"><thead><tr><th scope="col">Topic</th><th scope="col">Records (of {len(countries)})</th><th scope="col"><span class="sr-only">Share</span></th></tr></thead><tbody>{rows}</tbody></table>
    <p>On average a country record covers {total_topics / len(countries):.1f} of {len(TOPICS)} topics.</p>
  </section>
  <section class="sec"><h2>Using the files</h2>
    <ul class="plain">
      <li><code>data/index.json</code> lists every record: <code>slug</code>, <code>name</code>, <code>kind</code>, <code>group</code>, <code>region</code>, <code>path</code>, the file's former name in <code>formerly</code>, and its top-level <code>sections</code>.</li>
      <li>Country files are in <code>data/countries/&lt;slug&gt;.json</code>; historical ones in <code>data/historical/</code>, grouped by the power that held them.</li>
      <li>This site serves the same files: <a href="data/index.json">data/index.json</a>.</li>
      <li>Continents on the browse page come from each record's own region field. For {sum(1 for r in countries if r["name"] in CONTINENT_OF)} records whose region is missing or more specific (for example "Maghreb" or "Southeast Europe"), the site assigns a continent from a table in <code>_src/build.py</code>; the data files are not changed.</li>
      <li>Two shapes are in use: most modern records use sections like <code>Name</code>, <code>Geography</code> and <code>Government</code>; older and historical ones use lower-case keys. Both are kept as written.</li>
    </ul>
  </section>
  <section class="sec"><h2>Contributing</h2><p>Corrections and new records are welcome as pull requests on <a href="https://github.com/SolutionsAsService/CountryData" rel="noopener">GitHub</a>. Run <code>python tools/validate.py</code> before you open one.</p></section>
</div>'''
    (SITE / "about.html").write_text(page("About the data · CountryData", "How CountryData is organised, how complete each topic is, and how to use the files.", about, 0, "about"), encoding="utf-8", newline="\n")
    nf = '''<header class="hero wrap small"><p class="kicker">404</p><h1>Not on this map.</h1><p class="lede">That page isn't part of the atlas.</p><p><a class="btn" href="index.html">Browse the atlas</a></p></header>'''
    (SITE / "404.html").write_text(page("Not found · CountryData", "That page isn't part of the atlas.", nf, 0), encoding="utf-8", newline="\n")
    written += ["index.html", "historical/index.html", "about.html", "404.html"]

    dead = []
    for rel in written:
        p = SITE / rel
        for ref in re.findall(r'(?:href|src)="([^"#?]+)', p.read_text(encoding="utf-8")):
            if re.match(r"[a-z]+:|//", ref):
                continue
            if not (p.parent / ref).resolve().is_file():
                dead.append(f"{rel}: {ref}")
    assert not dead, "dead links:\n  " + "\n  ".join(dead[:20])
    print(f"built {len(written)} pages into site/")


if __name__ == "__main__":
    main()
