#!/usr/bin/env python3
"""Build the Chinese guide set.

- Guides with a hand written Chinese file in content/guides/ are used as-is.
- megaevolutions.md is generated from the English source by mapping links to
  the Chinese names in the built data (it is a pure list, no prose).
"""
from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOUL = Path("/Users/klx1204/Downloads/soulgold")
SRC = SOUL / "docs/src/guides"
CONTENT = ROOT / "content/guides"
DATA = ROOT / "public/data"
OUT_IMAGES = ROOT / "public/guides/images"


def load_json(name):
    return json.loads((DATA / f"{name}.json").read_text(encoding="utf-8"))


def slug_name_map(rows):
    return {r["slug"]: r["name"] for r in rows}


def gen_mega():
    species = slug_name_map(load_json("species"))
    items = slug_name_map(load_json("items"))
    text = (SRC / "megaevolutions.md").read_text(encoding="utf-8")
    body = text.split("---", 2)[-1].strip()

    def link(match):
        label, url = match.group(1), match.group(2)
        m = re.search(r"/(pokedex|items)/([^/)]+)/?", url)
        if not m:
            return f"[{label}]({url})"
        kind, slug = m.group(1), m.group(2)
        name = (species if kind == "pokedex" else items).get(slug, label)
        return f"[{name}](/{kind}/{slug})"

    body = re.sub(r"\[([^\]]+)\]\((https?://[^)]+)\)", link, body)
    body = body.replace("->", "→")
    body = re.sub(r"^# Mega Evolutions$", "# 超级进化", body, flags=re.M)
    body = re.sub(
        r"^Each Pokemon must hold the item shown below and you must have the Mega Ring\.$",
        "每只宝可梦必须携带下方对应的道具，并且你需要持有超级环。",
        body,
        flags=re.M,
    )
    body = re.sub(
        r"## Rayquaza\n- Rayquaza is an exception to the held item rule and can mega evolve by knowing the move \"Dragon Ascent\"\.",
        "## 烈空坐\n- 烈空坐不受携带道具规则的限制，学会招式“画龙点睛”即可超级进化。",
        body,
    )
    header = """---
title: 超级进化列表
summary: 全部超级进化及其所需道具
category: Guide
order: 7
---
"""
    return header + "\n" + body + "\n"


def main():
    CONTENT.mkdir(parents=True, exist_ok=True)
    # generated mega page
    (CONTENT / "megaevolutions.md").write_text(gen_mega(), encoding="utf-8")

    # copy screenshots
    src_img = SRC / "images"
    if src_img.exists():
        OUT_IMAGES.mkdir(parents=True, exist_ok=True)
        for f in src_img.iterdir():
            if f.is_file():
                shutil.copy2(f, OUT_IMAGES / f.name)
        print("images:", len(list(OUT_IMAGES.iterdir())))

    print("guides:", sorted(p.stem for p in CONTENT.glob("*.md")))


if __name__ == "__main__":
    main()
