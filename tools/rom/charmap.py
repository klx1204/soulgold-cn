"""Decode/encode GBA Chinese text from the rh-hideout-chinese charmap."""
import re
from pathlib import Path

CHARMAP_PATH = Path("/Users/klx1204/Downloads/pokeemerald-expansion/charmap.txt")

# Control codes that appear inside text but are not printable characters.
CONTROL_NAMES = {
    0x00: "",       # padding
    0xFE: "\n",
    0xFB: "\n",
    0xFA: "",       # player name placeholder handled separately
    0xF9: "",
    0xF8: "",
}

CODE_TO_CHAR = {}
CHAR_TO_CODE = {}


def _load():
    if CODE_TO_CHAR:
        return
    pat = re.compile(r"^\s*'(.*)'\s*=\s*([0-9A-Fa-f ]+)\s*$")
    for line in CHARMAP_PATH.read_text(encoding="utf-8").splitlines():
        m = pat.match(line)
        if not m:
            continue
        raw = m.group(1)
        code = bytes.fromhex(m.group(2).replace(" ", ""))
        CODE_TO_CHAR.setdefault(code, raw)
        CHAR_TO_CODE.setdefault(raw, code)


def decode(data, start=0, maxlen=None, stop_at_ff=True):
    _load()
    out = []
    i = start
    end = len(data) if maxlen is None else min(len(data), start + maxlen)
    while i < end:
        b = data[i]
        if b == 0xFF:
            if stop_at_ff:
                break
            i += 1
            continue
        if b == 0x00:
            i += 1
            continue
        hit = False
        for size in (2, 1):
            ch = CODE_TO_CHAR.get(data[i:i + size])
            if ch is not None:
                out.append(ch)
                i += size
                hit = True
                break
        if not hit:
            i += 1
    return "".join(out)


def encode(text):
    _load()
    out = bytearray()
    for ch in text:
        code = CHAR_TO_CODE.get(ch)
        if code is None:
            raise KeyError(f"no charmap entry for {ch!r}")
        out += code
    return bytes(out)


def read_ptr(data, offset):
    """Read a GBA pointer stored at offset and return the ROM file offset."""
    raw = int.from_bytes(data[offset:offset + 4], "little")
    if 0x08000000 <= raw < 0x0A000000:
        return raw - 0x08000000
    if 0x02000000 <= raw < 0x03000000:
        return None  # RAM pointer, not resolvable statically
    return None


def read_string_at_ptr(data, ptr_offset, limit=80):
    off = read_ptr(data, ptr_offset)
    if off is None:
        return None
    return decode(data, off, limit)
