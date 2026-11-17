#!/usr/bin/env python3
"""Build the Chinese Soulgold docs dataset.

Inputs:
  - /Users/klx1204/Downloads/soulgold/docs/data   (game data, English)
  - /Users/klx1204/Downloads/soulgold/docs/sprites
  - /Users/klx1204/Downloads/pokemon-dataset-zh    (official Chinese names/descriptions)
  - tools/rom/rom_zh.json                          (extracted from the Chinese ROM)

Outputs:
  - public/data/*.json
  - public/sprites/**
"""
from __future__ import annotations

import json
import re
import shutil
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOUL = Path("/Users/klx1204/Downloads/soulgold")
DATA = SOUL / "docs/data"
SPRITES = SOUL / "docs/sprites"
ZH_DATASET = Path("/Users/klx1204/Downloads/pokemon-dataset-zh/data/pokemon")
ROM_ZH = ROOT / "tools/rom/rom_zh.json"
OUT = ROOT / "public/data"
OUT_SPRITES = ROOT / "public/sprites"

# ---------------------------------------------------------------- locale maps

TYPE_ZH = {
    "TYPE_NONE": "无", "TYPE_NORMAL": "一般", "TYPE_FIGHTING": "格斗",
    "TYPE_FLYING": "飞行", "TYPE_POISON": "毒", "TYPE_GROUND": "地面",
    "TYPE_ROCK": "岩石", "TYPE_BUG": "虫", "TYPE_GHOST": "幽灵",
    "TYPE_STEEL": "钢", "TYPE_FIRE": "火", "TYPE_WATER": "水",
    "TYPE_GRASS": "草", "TYPE_ELECTRIC": "电", "TYPE_PSYCHIC": "超能力",
    "TYPE_ICE": "冰", "TYPE_DRAGON": "龙", "TYPE_DARK": "恶",
    "TYPE_FAIRY": "妖精", "TYPE_STELLAR": "星晶", "TYPE_MYSTERY": "未知",
}

CATEGORY_ZH = {
    "DAMAGE_CATEGORY_PHYSICAL": "物理",
    "DAMAGE_CATEGORY_SPECIAL": "特殊",
    "DAMAGE_CATEGORY_STATUS": "变化",
}

POCKET_ZH = {
    "POCKET_ITEMS": "道具", "POCKET_POKE_BALLS": "精灵球",
    "POCKET_TM_HM": "技能机", "POCKET_BERRIES": "树果",
    "POCKET_KEY_ITEMS": "重要物品", "POCKET_MAIL": "邮件",
    "POCKET_BATTLE_ITEMS": "战斗道具", "POCKET_MEDICINE": "药品",
    "POCKET_MEGASTONES": "超级石",
}

STAT_ZH = {
    "hp": "HP", "atk": "攻击", "def": "防御",
    "spa": "特攻", "spd": "特防", "spe": "速度",
}

# Form suffixes. Order matters: longest first.
FORM_PREFIX = [
    ("MEGA_Z", "超级", "Z"),
    ("MEGA_X", "超级", "X"),
    ("MEGA_Y", "超级", "Y"),
    ("MEGA", "超级", ""),
    ("GMAX", "超极巨化", ""),
    ("ALOLA", "阿罗拉", ""),
    ("GALAR", "伽勒尔", ""),
    ("HISUI", "洗翠", ""),
    ("PALDEA_COMBAT", "帕底亚（斗）", ""),
    ("PALDEA_BLAZE", "帕底亚（炎）", ""),
    ("PALDEA_AQUA", "帕底亚（水）", ""),
    ("PALDEA", "帕底亚", ""),
    ("TOTEM", "霸主", ""),
    ("PRIMAL", "原始", ""),
    ("ORIGIN", "起源", ""),
    ("THERIAN", "灵兽", ""),
    ("INCARNATE", "化身", ""),
    ("ZEN", "达摩", ""),
    ("CROWNED", "王者", ""),
    ("ETERNAL", "永恒", ""),
    ("ETERNAMAX", "无极巨化", ""),
    ("BLADE", "刀剑", ""),
    ("SHIELD", "盾牌", ""),
    ("BLACK", "黑", ""),
    ("WHITE", "白", ""),
    ("RESOLUTE", "觉悟", ""),
    ("ORDINARY", "普通", ""),
    ("SKY", "天空", ""),
    ("DROOPY", "下垂", ""),
    ("POWER_CONSTRUCT", "完全体", ""),
    ("SPIKY_EARED", "刺耳", ""),
    ("STARTER", "伙伴", ""),
    ("HERO", "英雄", ""),
    ("HEAT", "热火", ""),
    ("WASH", "清洗", ""),
    ("FROST", "冰冻", ""),
    ("FAN", "旋转", ""),
    ("MOW", "切割", ""),
]

# Region-map style names. Keys are Soulgold's English map names.
MAP_ZH = {
    "New Bark Town": "若叶镇",
    "Cherrygrove City": "吉花市",
    "Violet City": "桔梗市",
    "Azalea Town": "桧皮镇",
    "Goldenrod City": "满金市",
    "Ecruteak City": "圆朱市",
    "Olivine City": "浅葱市",
    "Olivine City Port": "浅葱市港口",
    "Cianwood City": "湛蓝市",
    "Mahogany Town": "卡吉镇",
    "Blackthorn City": "烟墨市",
    "Dark Cave South Side": "黑暗洞穴（南侧）",
    "Dark Cave North Side": "黑暗洞穴（北侧）",
    "Sprout Tower 2F": "喇叭芽之塔 2F",
    "Sprout Tower 3F": "喇叭芽之塔 3F",
    "Ruins of Alph B1F": "阿露福遗迹 B1F",
    "Ruins of Alph Outside": "阿露福遗迹（外部）",
    "Union Cave 1F": "互连洞 1F",
    "Union Cave B1F": "互连洞 B1F",
    "Union Cave B2F": "互连洞 B2F",
    "Slowpoke Well B1F": "呆呆兽之井 B1F",
    "Slowpoke Well B2F": "呆呆兽之井 B2F",
    "Ilex Forest": "栎树林",
    "National Park": "自然公园",
    "National Park Bug Contest": "自然公园（捕虫大赛）",
    "Burned Tower 1F": "烧焦塔 1F",
    "Burned Tower B1F": "烧焦塔 B1F",
    "Whirl Islands 1F": "漩涡岛 1F",
    "Whirl Islands B1F": "漩涡岛 B1F",
    "Whirl Islands B2F": "漩涡岛 B2F",
    "Whirl Islands Descent": "漩涡岛（深处）",
    "Cliff Edge Gate": "断崖之门",
    "Cliff Edge Cave": "断崖洞窟",
    "Mt Mortar 1F South": "擂钵山 1F（南）",
    "Mt Mortar 1F North": "擂钵山 1F（北）",
    "Mt Mortar B1F": "擂钵山 B1F",
    "Mt Mortar 2F": "擂钵山 2F",
    "Mt Mortar Depths 1": "擂钵山（深处1）",
    "Lake of Rage": "愤怒之湖",
    "Ice Path 1F": "冰雪小径 1F",
    "Ice Path B1F": "冰雪小径 B1F",
    "Ice Path B2F": "冰雪小径 B2F",
    "Ice Path B3F": "冰雪小径 B3F",
    "Ice Path B4F": "冰雪小径 B4F",
    "Ice Path Depths": "冰雪小径（深处）",
    "Dragon's Den Cavern": "龙之穴",
    "Mt. Silver Outside": "白银山（外部）",
    "Mt. Silver 1F Item Room": "白银山 1F（道具房间）",
    "Mt. Silver 1F Waterfall Room": "白银山 1F（瀑布房间）",
    "Mt. Silver Mountain Side": "白银山（山腰）",
    "Mt. Silver 2F": "白银山 2F",
    "Mt. Silver Snow": "白银山（雪原）",
    "Mt. Silver 3F": "白银山 3F",
    "Tohjo Falls Cavern": "都城瀑布",
    "Tohjo Pass": "都城通道",
    "Victory Road 1F": "冠军之路 1F",
    "Victory Road B1F": "冠军之路 B1F",
    "Victory Road B2F": "冠军之路 B2F",
    "Tin Tower 3F": "铃铛塔 3F",
    "Tin Tower 4F": "铃铛塔 4F",
    "Tin Tower 5F": "铃铛塔 5F",
    "Tin Tower 6F": "铃铛塔 6F",
    "Tin Tower 7F": "铃铛塔 7F",
    "Tin Tower 8F": "铃铛塔 8F",
    "Tin Tower 9F": "铃铛塔 9F",
    "Safari Zone Top Mid": "狩猎地带（上中）",
    "Safari Zone Low Mid": "狩猎地带（下中）",
    "Safari Zone Low Left": "狩猎地带（左下）",
    "Safari Zone Top Left": "狩猎地带（左上）",
    "Safari Zone Low Right": "狩猎地带（右下）",
    "Safari Zone Top Right": "狩猎地带（右上）",
    "Rocket Hideout B1F": "火箭队基地 B1F",
    "Kitakami Border": "北上边境",
    "Kitakami Mountain 1F": "北上山 1F",
    "Kitakami Mountain 2F": "北上山 2F",
    "Kitakami Mountain 3F": "北上山 3F",
    "Kitakami Mountain 4F": "北上山 4F",
    "Kitakami Well B1F": "北上井 B1F",
    "Railway Cave": "铁路洞窟",
    "Railway Cave 2F": "铁路洞窟 2F",
    "Railway Cave 3F": "铁路洞窟 3F",
    "Vajra Desert West": "金刚沙漠（西部）",
    "Vajra Desert East": "金刚沙漠（东部）",
    "Vajra Desert East Cave": "金刚沙漠东洞窟",
    "Vajra Pyramid Floor 1": "金刚金字塔 1F",
    "Vajra Pyramid Floor 2": "金刚金字塔 2F",
    "Vajra Pyramid Floor 3": "金刚金字塔 3F",
    "Vajra Pyramid Floor 4": "金刚金字塔 4F",
    "Snowtop Mountain Outside": "雪顶山（外部）",
    "Snowtop Mountain B1F": "雪顶山 B1F",
    "Lost Woods": "迷失森林",
    "Battle Factory Grounds": "对战工厂",
    "South Johto Sea": "城都南海",
    "South Shore": "南岸",
    "South Johto Sea Underwater": "城都南海（水下）",
    "Route 50 Underwater": "50号道路（水下）",
    "Route 50 Underwater Cave 1": "50号道路水下洞窟1",
    "Nameless Cave 1F": "无名洞窟 1F",
    "Nameless Cave B1F": "无名洞窟 B1F",
    "Nameless Cave B2F": "无名洞窟 B2F",
    "Southern Passage": "南方通道",
    "Southern Sidepath": "南方支路",
    "Abandoned Lab": "废弃研究所",
    "Meteor Island": "流星岛",
    "Faraway Island": "遥远小岛",
    "Rinto Village": "林都村",
    "Sprout Tower": "喇叭芽之塔",
    "Sprout Tower 1F": "喇叭芽之塔 1F",
    "National Park Normal": "自然公园（普通）",
    "Olivine City Port Outside": "浅葱市港口（外部）",
    "Olivine City Port Inside": "浅葱市港口（内部）",
    "Snowtop Mountain": "雪顶山",
    "Faraway Island Jungle": "遥远小岛丛林",
    "Goldenrod Shore": "满金市海岸",
    "Goldenrod City Underground Tunnel": "满金市地下通道",
    "Goldenrod City Underground Storage": "满金市地下仓库",
    "Ecruteak City Theater": "圆朱市舞厅",
    "Rocket Hideout B2F": "火箭队基地 B2F",
    "Rocket Hideout B3F": "火箭队基地 B3F",
    "Goldenrod City Radio Tower 1F": "满金市广播塔 1F",
    "Goldenrod City Radio Tower 2F": "满金市广播塔 2F",
    "Goldenrod City Radio Tower 3F": "满金市广播塔 3F",
    "Goldenrod City Radio Tower 4F": "满金市广播塔 4F",
    "Goldenrod City Radio Tower 5F": "满金市广播塔 5F",
    "Kitakami Temple Battle Room": "北上神殿战斗室",
    "Kitakami Houses": "北上房屋",
    "Pokemon League Wills Room": "宝可梦联盟 阿渡房间",
    "Pokemon League Kogas Room": "宝可梦联盟 阿桔房间",
    "Pokemon League Brunos Room": "宝可梦联盟 希巴房间",
    "Pokemon League Karens Room": "宝可梦联盟 卡伦房间",
    "Pokemon League Champions Room": "宝可梦联盟 冠军房间",
    "Mt. Silver Summit Day": "白银山山顶（白天）",
    "Violet City Trainer School": "桔梗市训练家学校",
    "Bellchime Trail": "铃铛小路",
    "Olivine City Cafe": "浅葱市咖啡厅",
    "Goldenrod Apartment": "满金公寓",
    "Cianwood": "湛蓝市",
    "Dewford": "武斗镇",
    "Dewford Town": "武斗镇",
    "Dewford Town Gym": "武斗镇道馆",
    "Safari Zone Gate": "狩猎地带入口",
    "Lake of Rage House 1": "愤怒之湖民居 1",
    "Ecruteak City House 3": "圆朱市民居 3",
    "Goldenrod City Game Corner": "满金市游戏城",
    "Goldenrod City Burned Tower": "满金市烧焦塔",
    "Goldenrod City Gym": "满金市道馆",
    "Ecruteak City Gym": "圆朱市道馆",
    "Olivine City Gym": "浅葱市道馆",
    "Blackthorn City Gym": "烟墨市道馆",
    "Mahogany Town Gym": "卡吉镇道馆",
    "Azalea Town Gym": "桧皮镇道馆",
    "Violet City Gym": "桔梗市道馆",
    "Violet City Sprout Tower": "桔梗市喇叭芽之塔",
    "Fishing": "钓鱼",
    "Any fishing spot": "任意钓鱼点",
    "Bug Catching Contest": "捕虫大赛",
    "Battle Frontier Battle Factory Lobby": "对战开拓区·对战工厂大厅",
    "Gate Goldenrod City Route 35": "满金市—35号道路门房",
    "Ruins of Alph Puzzle And Reward Chambers": "阿露福遗迹谜题与奖励房间",
    "New Bark Town Lab": "若叶镇研究所",
    "Route 40 House 5": "40号道路民居 5",
    "Mahogany Town Shop": "卡吉镇商店",
    "Kitakami Temple Storage": "北上神殿仓库",
}


SPECIAL_PLACES = {
    "Title Defense": "卫冕战",
    "Battle Cafe": "对战咖啡厅",
    "Battle Factory": "对战工厂",
    "Battle Tower": "对战塔",
    "Battle Hall": "对战舞台",
    "Battle Arcade": "对战轮盘",
    "Battle Castle": "对战城堡",
}


def map_name_zh(en: str) -> str:
    en = (en or "").strip()
    if not en:
        return ""
    if en in MAP_ZH:
        return MAP_ZH[en]
    if en in SPECIAL_PLACES:
        return SPECIAL_PLACES[en]
    m = re.match(r"Route (\d+)$", en)
    if m:
        n = int(m.group(1))
        return f"{n}号水路" if n in (40, 41) else f"{n}号道路"
    for suffix, zh in (
        (" Game Corner", "游戏城"),
        (" Pokemon Center", "宝可梦中心"),
        (" House", "民居"),
        (" Gate", "入口"),
        (" Mart", "商店"),
        (" Gym", "道馆"),
        (" Department Store", "百货大楼"),
        (" Lighthouse", "灯塔"),
        (" Underground Switches", "地下开关"),
    ):
        if en.endswith(suffix):
            return map_name_zh(en[: -len(suffix)]) + zh
    m = re.match(r"(.+) (\dF|B\dF)$", en)
    if m:
        return map_name_zh(m.group(1)) + " " + m.group(2)
    return en


LOCATION_SOURCE_ZH = {
    "Hidden item": "隐藏道具",
    "Item ball": "道具球",
    "Mart": "商店",
    "Gift": "赠礼",
    "Trade": "交换",
    "Pickup": "捡拾",
    "Starter": "初始宝可梦",
    "NPC": "NPC赠送",
    "Game Corner": "游戏城",
    "Prize": "奖品",
}


def source_zh(s: str) -> str:
    return LOCATION_SOURCE_ZH.get(s or "", s or "")


# ------------------------------------------------------------------ utilities

_paren = re.compile(r"[（(].*?[）)]")


def norm_name(s: str) -> str:
    s = unicodedata.normalize("NFKD", s or "")
    s = "".join(c for c in s if not unicodedata.combining(c)).strip().lower()
    s = s.replace("♀", "-f").replace("♂", "-m")
    s = re.sub(r"[\s\-_.':’]", "", s)
    return s


def clean_text(s: str) -> str:
    if not s:
        return ""
    s = s.replace("ゥ", "。").replace("ャ", "，").replace("ェ", "～").replace("ォ", "、")
    s = s.replace("ゾ", "？").replace("…", "……")
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\n{2,}", "\n", s)
    return s.strip()


# --------------------------------------------------------------- Chinese data


def load_rom_zh():
    return json.loads(ROM_ZH.read_text(encoding="utf-8"))


def load_zh_pokemon():
    """English name -> official Chinese info from pokemon-dataset-zh."""
    out = {}
    for f in ZH_DATASET.glob("*.json"):
        try:
            d = json.loads(f.read_text(encoding="utf-8"))
        except Exception:
            continue
        en = d.get("name_en") or ""
        key = norm_name(en)
        if not key:
            continue
        forms = d.get("forms") or []
        base = forms[0] if forms else {}
        out[key] = {
            "zh": d.get("name_zh") or base.get("name") or "",
            "desc": (d.get("description") or "").strip(),
            "category": (base.get("category") or "").strip(),
            "profile": (base.get("profile") or "").strip(),
            "forms": [f.get("name") for f in forms],
            "file": f.name,
        }
    return out


def form_prefix(constant: str):
    """Return (prefix, suffix) for a form constant, or None."""
    body = constant.replace("SPECIES_", "")
    for suffix, prefix, tail in FORM_PREFIX:
        if body.endswith("_" + suffix):
            return prefix, tail
    return None


FORM_NAME_OVERRIDE = {
    "SPECIES_OGERPON_TEAL": "厄诡椪（碧草面具）",
    "SPECIES_OGERPON_WELLSPRING": "厄诡椪（水井面具）",
    "SPECIES_OGERPON_HEARTHFLAME": "厄诡椪（火灶面具）",
    "SPECIES_OGERPON_CORNERSTONE": "厄诡椪（础石面具）",
    "SPECIES_OGERPON_TEAL_TERA": "厄诡椪（碧草面具·太晶）",
    "SPECIES_OGERPON_WELLSPRING_TERA": "厄诡椪（水井面具·太晶）",
    "SPECIES_OGERPON_HEARTHFLAME_TERA": "厄诡椪（火灶面具·太晶）",
    "SPECIES_OGERPON_CORNERSTONE_TERA": "厄诡椪（础石面具·太晶）",
    "SPECIES_URSHIFU_SINGLE_STRIKE": "武道熊师（一击流）",
    "SPECIES_URSHIFU_RAPID_STRIKE": "武道熊师（连击流）",
    "SPECIES_TOXTRICITY_AMPED": "颤弦蝾螈（高调）",
    "SPECIES_TOXTRICITY_LOW_KEY": "颤弦蝾螈（低调）",
    "SPECIES_MEOWSTIC_M": "超能妙喵（雄性）",
    "SPECIES_MEOWSTIC_F": "超能妙喵（雌性）",
    "SPECIES_INDEEDEE_M": "爱管侍（雄性）",
    "SPECIES_INDEEDEE_F": "爱管侍（雌性）",
    "SPECIES_BASCULEGION_M": "幽尾玄鱼（雄性）",
    "SPECIES_BASCULEGION_F": "幽尾玄鱼（雌性）",
    "SPECIES_FLOETTE_ETERNAL": "花叶蒂（永恒之花）",
    "SPECIES_FLABEBE_RED": "花蓓蓓（红花）",
    "SPECIES_FLABEBE_YELLOW": "花蓓蓓（黄花）",
    "SPECIES_FLABEBE_ORANGE": "花蓓蓓（橙花）",
    "SPECIES_FLABEBE_BLUE": "花蓓蓓（蓝花）",
    "SPECIES_FLABEBE_WHITE": "花蓓蓓（白花）",
    "SPECIES_FLOETTE_RED": "花叶蒂（红花）",
    "SPECIES_FLOETTE_YELLOW": "花叶蒂（黄花）",
    "SPECIES_FLOETTE_ORANGE": "花叶蒂（橙花）",
    "SPECIES_FLOETTE_BLUE": "花叶蒂（蓝花）",
    "SPECIES_FLOETTE_WHITE": "花叶蒂（白花）",
}


def display_species_name(constant: str, en: str, zh_base: str) -> str:
    if constant in FORM_NAME_OVERRIDE:
        return FORM_NAME_OVERRIDE[constant]
    fp = form_prefix(constant)
    if not fp:
        return zh_base
    prefix, tail = fp
    return f"{prefix}{zh_base}{tail}"


def main():
    rom = load_rom_zh()
    zh_pokemon = load_zh_pokemon()

    species_raw = json.loads((DATA / "species.json").read_text(encoding="utf-8"))
    moves_raw = json.loads((DATA / "moves.json").read_text(encoding="utf-8"))
    abilities_raw = json.loads((DATA / "abilities.json").read_text(encoding="utf-8"))
    items_raw = json.loads((DATA / "items.json").read_text(encoding="utf-8"))

    # constant -> Chinese move/ability/item name + description
    # Soulgold's master move list inserted MOVE_DARK_AERO (Shadow Blast) at
    # index 178 relative to the v1.2.1 ROM, so align moves by position.
    rom_moves = rom["moves"]
    move_zh = {}
    for i, constant in enumerate(moves_raw.keys()):
        if i < 178:
            r = rom_moves[i]
        elif i == 178:
            r = None
        else:
            r = rom_moves[i - 1]
        if r:
            move_zh[constant] = (r["zh"], clean_text(r["desc"]))
    # Shadow Blast is not in the v1.2.1 ROM; use a descriptive translation.
    move_zh.setdefault("MOVE_DARK_AERO", ("暗影爆破", "释放暗影冲击攻击对手。容易击中要害。"))
    ability_zh = {r["constant"]: (r["zh"], clean_text(r["desc"])) for r in rom["abilities"]}
    item_zh_by_id = {r["id"]: (r["zh"], clean_text(r["desc"])) for r in rom["items"]}

    # ---- species -------------------------------------------------------
    zh_desc_by_name = {v["zh"]: v["desc"] for v in zh_pokemon.values() if v.get("zh") and v.get("desc")}

    species = []
    for s in species_raw:
        en = s["name"]
        z = zh_pokemon.get(norm_name(en), {})
        zh_base = z.get("zh") or en
        name_zh = display_species_name(s["constant"], en, zh_base)
        abilities = []
        for a in s.get("abilities", []):
            az, ad = ability_zh.get(a, ("", ""))
            abilities.append({"constant": a, "name": az or a.replace("ABILITY_", "").replace("_", " ").title()})
        species.append({
            "slug": s["slug"],
            "dex": s.get("dex"),
            "constant": s["constant"],
            "name": name_zh,
            "nameEn": en,
            "types": list(dict.fromkeys(TYPE_ZH.get(t, t) for t in s.get("types", []))),
            "typesRaw": s.get("types", []),
            "stats": s.get("stats", {}),
            "bst": s.get("bst", 0),
            "abilities": abilities,
            "hiddenAbilities": [ability_zh.get(a, (a,))[0] for a in s.get("hiddenAbilities", [])],
            "innates": [ability_zh.get(a, (a,))[0] for a in s.get("innates", [])],
            "sprite": s.get("sprite"),
            "description": z.get("desc") or zh_desc_by_name.get(re.sub(r"（.*?）", "", name_zh), "") or "",
            "category": z.get("category", ""),
            "isForm": form_prefix(s["constant"]) is not None,
        })

    # ---- moves ---------------------------------------------------------
    moves = []
    for constant, m in moves_raw.items():
        zh, desc = move_zh.get(constant, (m["name"], ""))
        if constant == "MOVE_NONE":
            continue
        moves.append({
            "slug": m["slug"],
            "constant": constant,
            "name": zh or m["name"],
            "nameEn": m["name"],
            "type": TYPE_ZH.get(m.get("type", ""), m.get("type", "")),
            "typeRaw": m.get("type", ""),
            "category": CATEGORY_ZH.get(m.get("category", ""), m.get("category", "")),
            "categoryRaw": m.get("category", ""),
            "power": m.get("power") or 0,
            "accuracy": m.get("accuracy") or 0,
            "pp": m.get("pp") or 0,
            "priority": m.get("priority") or 0,
            "description": desc,
        })
    moves.sort(key=lambda x: x["nameEn"])

    # ---- abilities -----------------------------------------------------
    abilities = []
    for constant, a in abilities_raw.items():
        if constant == "ABILITY_NONE":
            continue
        zh, desc = ability_zh.get(constant, (a["name"], ""))
        abilities.append({
            "slug": a["slug"],
            "constant": constant,
            "name": zh or a["name"],
            "nameEn": a["name"],
            "description": desc,
        })
    abilities.sort(key=lambda x: x["nameEn"])

    # ---- items ---------------------------------------------------------
    items = []
    for it in items_raw:
        zh, desc = item_zh_by_id.get(it["id"], (it["name"], ""))
        items.append({
            "slug": it["slug"],
            "id": it["id"],
            "constant": it["constant"],
            "name": zh or it["name"],
            "nameEn": it["name"],
            "description": desc,
            "pocket": POCKET_ZH.get(it.get("pocket", ""), it.get("pocket", "")),
            "pocketRaw": it.get("pocket", ""),
            "icon": it.get("itemIcon"),
            "locations": [
                {"map": loc.get("map"), "mapZh": map_name_zh(loc.get("map", "")), "source": source_zh(loc.get("source"))}
                for loc in it.get("locations", [])
            ],
        })
    items.sort(key=lambda x: x["id"])

    # ---- machines ------------------------------------------------------
    machines_raw = json.loads((DATA / "machines.json").read_text(encoding="utf-8"))
    machines = []
    for m in machines_raw:
        mv_zh = move_zh.get(m.get("move", ""), (m.get("moveName", ""), ""))
        machines.append({
            "slug": m["slug"],
            "kind": m["kind"],
            "number": m["number"],
            "label": m.get("label"),
            "name": f"{m.get('label')} {mv_zh[0]}",
            "moveName": mv_zh[0],
            "moveSlug": m.get("moveSlug"),
            "type": TYPE_ZH.get(m.get("type", ""), m.get("type", "")),
            "typeRaw": m.get("type", ""),
            "category": CATEGORY_ZH.get(m.get("category", ""), m.get("category", "")),
            "power": m.get("power") or 0,
            "accuracy": m.get("accuracy") or 0,
            "pp": m.get("pp") or 0,
            "locations": [
                {"map": loc.get("map"), "mapZh": map_name_zh(loc.get("map", "")), "source": loc.get("source")}
                for loc in m.get("locations", [])
            ],
        })
    machines.sort(key=lambda x: (x["kind"] != "TM", x["number"]))

    # ---- encounter tables ---------------------------------------------
    METHOD_ZH = {
        "land_mons": "草丛/陆地",
        "water_mons": "冲浪",
        "fishing_mons": "钓鱼",
        "rock_smash_mons": "碎岩",
    }
    TIME_ZH = {"Day": "白天", "Night": "夜晚", "Morning": "早晨"}
    species_by_const = {x["constant"]: x for x in species}
    encounters_raw = json.loads((DATA / "encounters.json").read_text(encoding="utf-8"))
    encounters = []
    for m in encounters_raw:
        variants = []
        for v in m.get("variants", []):
            methods = []
            for me in v.get("methods", []):
                mons = []
                for mon in me.get("mons", []):
                    sp = species_by_const.get(mon.get("species"), {})
                    mons.append({
                        "constant": mon.get("species"),
                        "name": sp.get("name") or mon.get("name"),
                        "nameEn": mon.get("name"),
                        "slug": sp.get("slug"),
                        "types": sp.get("types", []),
                        "sprite": mon.get("sprite"),
                        "minLevel": mon.get("minLevel"),
                        "maxLevel": mon.get("maxLevel"),
                        "rate": mon.get("rate"),
                    })
                methods.append({
                    "key": me.get("key"),
                    "method": METHOD_ZH.get(me.get("key"), me.get("method")),
                    "mons": mons,
                })
            variants.append({
                "time": v.get("time"),
                "timeZh": TIME_ZH.get(v.get("time"), v.get("time")),
                "methods": methods,
            })
        map_override = {
            "MAP_FOGGY_SHORE": "雾岸",
            "MAP_ROUTE33SOUTH_2": "城都南海（深处）",
            "MAP_METEOR_CAVE1": "流星岛洞窟 1",
            "MAP_METEOR_CAVE2": "流星岛洞窟 2",
        }
        encounters.append({
            "map": m.get("map"),
            "name": m.get("name"),
            "nameZh": map_override.get(m.get("map"), map_name_zh(m.get("name", ""))),
            "hasTimeVariants": m.get("hasTimeVariants"),
            "variants": variants,
        })

    # ---- trainers ------------------------------------------------------
    NATURE_ZH = {
        "Hardy": "勤奋", "Lonely": "孤僻", "Brave": "勇敢", "Adamant": "固执",
        "Naive": "天真", "Bold": "大胆", "Docile": "坦率", "Relaxed": "悠闲",
        "Impish": "淘气", "Lax": "乐天", "Timid": "胆小", "Hasty": "急躁",
        "Serious": "认真", "Jolly": "爽朗", "Modest": "内敛", "Mild": "慢吞吞",
        "Quiet": "冷静", "Bashful": "害羞", "Rash": "马虎", "Calm": "温和",
        "Gentle": "温顺", "Sassy": "自大", "Careful": "慎重", "Quirky": "浮躁",
    }
    DIFFICULTY_ZH = {"Normal": "普通", "Hard": "困难"}
    move_by_en = {x["nameEn"].lower(): x for x in moves}
    ability_by_en = {x["nameEn"].lower(): x for x in abilities}
    item_by_en = {x["nameEn"].lower(): x for x in items}
    trainers_raw = json.loads((DATA / "trainers.json").read_text(encoding="utf-8"))
    trainer_name = {r["constant"]: r["zh"] for r in rom.get("trainers", []) if r.get("zh")}
    trainers = []
    for t in trainers_raw:
        party = []
        for mon in t.get("party", []):
            sp = species_by_const.get(mon.get("constant"), {})
            mv = []
            for name in mon.get("moves", []):
                mm = move_by_en.get((name or "").lower())
                mv.append(mm["name"] if mm else name)
            ab = ability_by_en.get((mon.get("ability") or "").lower())
            it = item_by_en.get((mon.get("itemName") or "").lower())
            party.append({
                "species": sp.get("name") or mon.get("displayName") or mon.get("name"),
                "slug": sp.get("slug"),
                "level": mon.get("level"),
                "sprite": mon.get("sprite"),
                "types": sp.get("types", []),
                "ability": ab["name"] if ab else (mon.get("ability") or ""),
                "item": it["name"] if it else (mon.get("itemName") or ""),
                "itemIcon": mon.get("itemIcon"),
                "moves": mv,
                "nature": NATURE_ZH.get(mon.get("nature"), mon.get("nature") or ""),
                "ivs": mon.get("ivs") or {},
                "evs": mon.get("evs") or {},
            })
        trainers.append({
            "constant": t.get("constant"),
            "name": trainer_name.get(t.get("constant"), t.get("displayName") or t.get("name")),
            "nameEn": t.get("displayName") or t.get("name"),
            "difficulty": DIFFICULTY_ZH.get(t.get("difficulty"), t.get("difficulty")),
            "difficultyRaw": t.get("difficulty"),
            "avgLevel": t.get("averageLevel"),
            "sprite": t.get("sprite"),
            "locations": [{"map": l, "mapZh": map_name_zh(l)} for l in t.get("locations", [])],
            "party": party,
        })

    # ---- battle frontier sets -----------------------------------------
    item_by_const = {x["constant"]: x for x in items}
    ability_by_const = {x["constant"]: x for x in abilities}
    move_by_const = {x["constant"]: x for x in moves}
    frontier_raw = json.loads((DATA / "frontier.json").read_text(encoding="utf-8"))
    frontier_sets = []
    for row in frontier_raw["sets"]:
        key, sp_const, item_const, ab_const, nature, mvs, evs, ivs = row
        sp = species_by_const.get(sp_const, {})
        frontier_sets.append({
            "key": key,
            "species": sp.get("name") or sp_const,
            "speciesEn": sp.get("nameEn") or sp_const,
            "slug": sp.get("slug"),
            "sprite": (frontier_raw.get("species", {}).get(sp_const) or {}).get("sprite"),
            "types": sp.get("types", []),
            "item": (item_by_const.get(item_const) or {}).get("name", item_const),
            "ability": (ability_by_const.get(ab_const) or {}).get("name", ab_const),
            "nature": NATURE_ZH.get(nature, nature),
            "moves": [(move_by_const.get(mv) or {}).get("name", mv) for mv in mvs],
            "evs": evs,
            "ivs": ivs,
        })

    # ---- guides --------------------------------------------------------
    guides_raw = json.loads((DATA / "guides.json").read_text(encoding="utf-8"))
    guide_zh_dir = ROOT / "content/guides"
    guides = []
    for g in guides_raw:
        zh_file = guide_zh_dir / f"{g['slug']}.md"
        title, summary, content = g["title"], g["summary"], g["content"]
        if zh_file.exists():
            text = zh_file.read_text(encoding="utf-8")
            if text.startswith("---"):
                _, fm, body = text.split("---", 2)
                meta = {}
                for line in fm.strip().splitlines():
                    if ":" in line:
                        k, v = line.split(":", 1)
                        meta[k.strip()] = v.strip()
                title = meta.get("title", title)
                summary = meta.get("summary", summary)
                content = body.strip()
            else:
                content = text
        guides.append({
            "slug": g["slug"],
            "title": title,
            "summary": summary,
            "category": g["category"],
            "order": g["order"],
            "content": content,
        })

    # ---- per-move learners & per-species learnsets --------------------
    LEARN_KIND_ZH = {"levelUp": "升级", "eggMoves": "遗传", "tutorMoves": "教学", "tmMoves": "技能机"}
    move_by_slug = {x["slug"]: x for x in moves}
    learners_dir = DATA / "move-learners"
    learners_out: dict[str, list] = {}
    species_moves: dict[str, list] = {}
    for f in learners_dir.glob("*.json"):
        slug = f.stem
        mv = move_by_slug.get(slug)
        if not mv:
            continue
        try:
            ld = json.loads(f.read_text(encoding="utf-8"))
        except Exception:
            continue
        rows = []
        for kind, consts in ld.items():
            if not isinstance(consts, list):
                continue
            for c in consts:
                sp = species_by_const.get(c)
                if not sp:
                    continue
                rows.append(sp["slug"])
                species_moves.setdefault(c, {}).setdefault(LEARN_KIND_ZH.get(kind, kind), []).append(slug)
        rows.sort()
        learners_out[slug] = rows
    species_moves_out: dict[str, dict] = {}
    order = ["升级", "技能机", "教学", "遗传"]
    for c, groups in species_moves.items():
        sp = species_by_const.get(c)
        if not sp:
            continue
        species_moves_out[sp["slug"]] = {
            k: sorted(groups[k]) for k in order if k in groups
        }
    (OUT / "learners.json").write_text(
        json.dumps(learners_out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )
    (OUT / "species-moves.json").write_text(
        json.dumps(species_moves_out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )
    print(f"learners: {len(learners_out)}, species-moves: {len(species_moves_out)}")

    # ---- write ---------------------------------------------------------
    OUT.mkdir(parents=True, exist_ok=True)
    payload = {
        "species": species,
        "moves": moves,
        "abilities": abilities,
        "items": items,
        "machines": machines,
        "encounters": encounters,
        "trainers": trainers,
        "frontier": frontier_sets,
        "guides": guides,
    }
    for key, rows in payload.items():
        (OUT / f"{key}.json").write_text(json.dumps(rows, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        print(f"{key}: {len(rows)}")

    # copy sprites once
    if not OUT_SPRITES.exists():
        shutil.copytree(SPRITES, OUT_SPRITES)
        print("sprites copied")


if __name__ == "__main__":
    main()
