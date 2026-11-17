#!/usr/bin/env python3
"""Emit a static HTML shell for every detail route.

GitHub Pages serves index.html for `/` but returns 404 for unknown nested
paths. Copying the built index.html into each route directory makes deep links
return 200 and gives every page its own title/description for link previews.
Client side rendering still handles the actual content.
"""
from __future__ import annotations

import html
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
DATA = ROOT / "public/data"

SITE = "魂金图鉴 · Soulgold 中文资料站"


def load(name):
    return json.loads((DATA / f"{name}.json").read_text(encoding="utf-8"))


def routes():
    out = [
        ("pokedex", "宝可梦图鉴", "宝可梦魂金图鉴：属性、种族值、特性、可学招式与中文图鉴说明。"),
        ("moves", "招式列表", "魂金全部招式：属性、物理/特殊/变化分类、威力、命中与 PP。"),
        ("abilities", "特性列表", "魂金全部特性及中文说明。"),
        ("items", "道具列表", "魂金道具：分类、效果说明与获取地点。"),
        ("encounters", "野外遇敌", "魂金 132 个地点的野生宝可梦分布，含时段与钓竿、冲浪、碎岩。"),
        ("machines", "技能机 / 秘传机", "魂金 TM/HM 一览及获取地点。"),
        ("trainers", "训练家", "魂金训练家队伍与配置。"),
        ("frontier", "开拓区", "魂金开拓区对战配置。"),
        ("guides", "攻略指南", "魂金中文攻略：FAQ、传说宝可梦、隐藏洞窟、闪光、超级进化等。"),
        ("search", "搜索", "搜索宝可梦、招式、特性、道具，支持中英文与拼音。"),
    ]
    for s in load("species"):
        out.append((f"pokedex/{s['slug']}", f"{s['name']} {s.get('nameEn','')}".strip(),
                    f"{s['name']}（{s.get('nameEn','')}）属性：{'/'.join(s['types'])}。种族值、特性与可学招式。"))
    for m in load("moves"):
        out.append((f"moves/{m['slug']}", f"{m['name']} {m.get('nameEn','')}".strip(),
                    f"{m['name']}（{m.get('nameEn','')}）{m['type']}属性 {m['category']}招式。{m.get('description','')}"))
    for a in load("abilities"):
        out.append((f"abilities/{a['slug']}", f"{a['name']} {a.get('nameEn','')}".strip(),
                    f"{a['name']}：{a.get('description','')}"))
    for i in load("items"):
        out.append((f"items/{i['slug']}", f"{i['name']} {i.get('nameEn','')}".strip(),
                    f"{i['name']}：{i.get('description','')}"))
    for e in load("encounters"):
        out.append((f"encounters/{e['map'].lower()}", f"{e['nameZh']} 遇敌", f"{e['nameZh']}（{e['name']}）野生宝可梦分布。"))
    for t in load("trainers"):
        out.append((f"trainers/{t['constant']}", f"{t['name']} 训练家", f"训练家 {t['name']} 的队伍配置。"))
    for g in load("guides"):
        out.append((f"guides/{g['slug']}", g["title"], g["summary"]))
    return out


def main():
    if not DIST.exists():
        raise SystemExit("dist/ not found, run vite build first")
    tpl = (DIST / "index.html").read_text(encoding="utf-8")
    made = 0
    for path, title, desc in routes():
        target = DIST / path / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        page = tpl
        page = re.sub(r"<title>.*?</title>", f"<title>{html.escape(title)} · {SITE}</title>", page, count=1)
        page = re.sub(
            r'<meta name="description" content="[^"]*"',
            f'<meta name="description" content="{html.escape(desc[:150])}"',
            page,
            count=1,
        )
        target.write_text(page, encoding="utf-8")
        made += 1
    (DIST / "404.html").write_text(tpl, encoding="utf-8")
    print(f"static shells: {made}")


if __name__ == "__main__":
    main()
