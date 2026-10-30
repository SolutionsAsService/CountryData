"""Check CountryData: every file is valid JSON, data/index.json lists every file exactly once,
slugs are unique kebab-case, and every listed path exists.

    python tools/validate.py
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
problems = []

files = {p.relative_to(ROOT).as_posix() for p in DATA.rglob("*.json") if p.name != "index.json"}
for rel in sorted(files):
    try:
        json.loads((ROOT / rel).read_text(encoding="utf-8"))
    except Exception as err:
        problems.append(f"{rel}: invalid JSON ({err})")
    if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", pathlib.Path(rel).stem):
        problems.append(f"{rel}: file name is not kebab-case")

index = json.loads((DATA / "index.json").read_text(encoding="utf-8"))
listed = [r["path"] for r in index["records"]]
slugs = [r["slug"] for r in index["records"]]
for path in sorted(set(listed) - files):
    problems.append(f"index lists a missing file: {path}")
for path in sorted(files - set(listed)):
    problems.append(f"file not in data/index.json: {path}")
for slug in sorted({s for s in slugs if slugs.count(s) > 1}):
    problems.append(f"duplicate slug: {slug}")
if index.get("count") != len(index["records"]):
    problems.append("index count does not match its records")

if problems:
    sys.exit("\n".join(problems))
print(f"ok: {len(files)} files, all valid JSON and all listed once in data/index.json")
