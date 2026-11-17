"""Extract Chinese names/descriptions from the Soulgold v1.2.1 Chinese ROM.

Run:  python3 extract.py
Writes rom_zh.json next to this script.
"""
import json
import re
from pathlib import Path

from charmap import decode, read_ptr, read_string_at_ptr

ROM = Path("/Users/klx1204/Library/Mobile Documents/com~apple~CloudDocs/ROM/GBA/宝可梦 魂金 v1.2.1汉化版 by 埋葬_official.gba")
OUT = Path(__file__).with_name("rom_zh.json")

# Layout discovered by anchoring known strings and pointer scans.
SPECIES_BASE = 0x8732CB
SPECIES_STEP = 0x120
SPECIES_NAME_LEN = 16

MOVES_BASE = 0x811944
MOVES_STEP = 0x48

ABILITIES_BASE = 0xF9DAA0
ABILITIES_STEP = 0x20
ABILITY_NAME_LEN = 16

# const struct ItemInfo gItemsInfo[] : 0x2C bytes each,
# name at +0x0C, description at +0x04.
ITEMS_BASE = 0x7EF444
ITEMS_STEP = 0x2C
ITEMS_COUNT = 935

# gTrainers: 0x34 bytes each, trainerName inline at +0.
TRAINERS_BASE = 0x542AB7
TRAINERS_STEP = 0x34

# Soulgold constants in enum order (from docs/data JSON keys).
SOUL = Path("/Users/klx1204/Downloads/soulgold/docs/data")
REPO = Path("/Users/klx1204/Downloads/soulgold")


def load_enum_order(path, key="constant"):
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    if isinstance(data, dict):
        # preserve insertion order, which follows constant order
        return [(k, v.get("name")) for k, v in data.items()]
    return [(v[key], v.get("name")) for v in data]


def main():
    d = ROM.read_bytes()
    species_order = load_enum_order(SOUL / "species.json")
    # species.json is a list already in enum order but starts at SPECIES_NONE?
    moves_order = load_enum_order(SOUL / "moves.json")
    abilities_order = load_enum_order(SOUL / "abilities.json")

    species = []
    for i in range(len(species_order)):
        # species.json starts at Bulbasaur; gSpeciesInfo[0] is SPECIES_NONE.
        off = SPECIES_BASE + SPECIES_STEP * (i + 1)
        name = decode(d, off, SPECIES_NAME_LEN)
        species.append({"constant": species_order[i][0], "en": species_order[i][1], "zh": name})

    moves = []
    for i in range(len(moves_order)):
        off = MOVES_BASE + MOVES_STEP * i
        name = read_string_at_ptr(d, off, 40)
        desc = read_string_at_ptr(d, off + 4, 200)
        moves.append({"constant": moves_order[i][0], "en": moves_order[i][1], "zh": name or "", "desc": desc or ""})

    abilities = []
    for i in range(len(abilities_order)):
        off = ABILITIES_BASE + ABILITIES_STEP * i
        name = decode(d, off, ABILITY_NAME_LEN)
        desc = read_string_at_ptr(d, off + 0x14, 200)
        abilities.append({"constant": abilities_order[i][0], "en": abilities_order[i][1], "zh": name, "desc": desc or ""})

    # Dump every item slot; items.json only needs a subset but machines and
    # trainers also reference item constants.
    items = []
    for idx in range(ITEMS_COUNT):
        off = ITEMS_BASE + ITEMS_STEP * idx
        name = read_string_at_ptr(d, off + 0x0C, 40)
        desc = read_string_at_ptr(d, off + 0x04, 200)
        items.append({"id": idx, "zh": name or "", "desc": desc or ""})

    # trainers: map TRAINER_ constants to their enum value, then read names.
    opp_path = REPO / "include/constants/opponents.h"
    opp_ids = {
        m.group(1): int(m.group(2))
        for m in re.finditer(r"#define\s+(TRAINER_[A-Z0-9_]+)\s+(\d+)", opp_path.read_text(encoding="utf-8"))
    }
    trainers_raw = json.loads((SOUL / "trainers.json").read_text(encoding="utf-8"))
    trainers = []
    for row in trainers_raw:
        idx = opp_ids.get(row["constant"])
        name = ""
        if idx is not None:
            off = TRAINERS_BASE + TRAINERS_STEP * idx
            # 0xFD introduces a dynamic name placeholder such as {RIVAL};
            # it has no fixed Chinese text, so leave it empty.
            if d[off:off + 2] != b"\xfd\x06":
                name = decode(d, off, 12)
        trainers.append({"constant": row["constant"], "en": row["displayName"], "zh": name})

    result = {"species": species, "moves": moves, "abilities": abilities, "items": items, "trainers": trainers}
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=1), encoding="utf-8")

    for key, rows in result.items():
        missing = [r for r in rows if not r["zh"] or r["zh"].strip("?") == ""]
        print(f"{key}: {len(rows)} rows, {len(missing)} empty")
        print("  first:", [(r.get("en", r.get("id")), r["zh"]) for r in rows[:5]])
        print("  empty count only")


if __name__ == "__main__":
    main()
