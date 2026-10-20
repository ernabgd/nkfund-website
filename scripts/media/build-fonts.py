#!/usr/bin/env python3
"""Build the self-hosted WOFF2 subsets in src/assets/fonts/ (developer tool, run once; outputs are committed).

Usage:
    python3 -m venv .venv && .venv/bin/pip install fonttools brotli
    .venv/bin/python scripts/media/build-fonts.py <download-dir> [out-dir]

<download-dir> must contain the original OFL fonts, downloaded from their official repositories:
    noto/NotoSerifGeorgian-VF.ttf   https://github.com/google/fonts/tree/main/ofl/notoserifgeorgian (NotoSerifGeorgian[wdth,wght].ttf)
    firago/FiraGO-<Weight>.ttf      https://github.com/bBoxType/FiraGO/tree/master/Fonts/FiraGO_TTF_1001/Roman

Every output covers Georgian Mkhedruli (+ Mtavruli where the font has it, for text-transform: uppercase),
Basic Latin, Latin-1, general punctuation and the lari sign. The variable Noto font is pinned to the normal
width and limited to the weight range the site uses, which roughly halves their size.
"""
import io
import sys
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

UNICODES = (
    list(range(0x0020, 0x007F))      # Basic Latin
    + list(range(0x00A0, 0x0100))    # Latin-1 Supplement (© « » · é …)
    + [0x0131, 0x0152, 0x0153, 0x02BC, 0x02C6, 0x02DA, 0x02DC]
    + list(range(0x2000, 0x2070))    # General Punctuation („ “ ” ‘ ’ – — … ‹ ›)
    + [0x20AC, 0x20BE, 0x2116, 0x2122, 0x2190, 0x2191, 0x2192, 0x2193, 0x2197, 0x2212, 0xFEFF, 0xFFFD]
    + list(range(0x10D0, 0x1100))    # Georgian Mkhedruli
    + list(range(0x1C90, 0x1CC0))    # Georgian Mtavruli (uppercase forms)
)

FEATURES = ["kern", "liga", "calt", "ccmp", "locl", "mark", "mkmk", "case", "tnum", "lnum", "pnum", "onum", "zero", "frac", "ordn", "sups"]


def subset_font(font: TTFont, out: Path) -> None:
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = FEATURES
    options.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14]  # keep copyright + licence strings (OFL requirement)
    options.name_languages = [0x0409]
    options.notdef_outline = True
    options.hinting = False
    options.desubroutinize = True
    options.drop_tables += ["DSIG"]
    sub = subset.Subsetter(options)
    sub.populate(unicodes=UNICODES)
    sub.subset(font)
    out.parent.mkdir(parents=True, exist_ok=True)
    font.flavor = "woff2"
    font.save(str(out))
    print(f"{out.name:40s} {out.stat().st_size / 1024:7.1f} KB")


def main() -> None:
    src = Path(sys.argv[1])
    out = Path(sys.argv[2] if len(sys.argv) > 2 else "src/assets/fonts")

    # The design uses FiraGO for text and Noto Serif Georgian for headings and quotes (Noto Sans Georgian was dropped).
    for name, wght in (("noto-serif-georgian", (300, 600)),):
        file = "NotoSerifGeorgian-VF.ttf"
        vf = TTFont(str(src / "noto" / file), lazy=False)
        vf = instancer.instantiateVariableFont(vf, {"wdth": 100, "wght": wght}, updateFontNames=False)
        # Round-trip through bytes so the subsetter sees a fully compiled font (avoids stale lazy gvar data).
        buf = io.BytesIO()
        vf.save(buf)
        buf.seek(0)
        subset_font(TTFont(buf, lazy=False), out / f"{name}-var.woff2")

    for weight, num in (("Light", 300), ("Regular", 400), ("Medium", 500), ("SemiBold", 600)):
        font = TTFont(str(src / "firago" / f"FiraGO-{weight}.ttf"))
        subset_font(font, out / f"firago-{num}.woff2")


if __name__ == "__main__":
    main()
