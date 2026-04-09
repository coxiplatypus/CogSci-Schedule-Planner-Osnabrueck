#!/usr/bin/env python3
"""Concatenate src/ files into docs/index.html."""
import pathlib

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / "src"

SOURCES = [
    "data/constants.js",
    "data/courses.js",
    "utils/helpers.js",
    "utils/ics.js",
    "utils/xlsx.js",
    "App.jsx",
]

template = (SRC / "template.html").read_text(encoding="utf-8")
parts = [f"// ── {f} ──\n" + (SRC / f).read_text(encoding="utf-8") for f in SOURCES]
html = template.replace("{SCRIPT_CONTENT}", "\n\n".join(parts))
(ROOT / "docs" / "index.html").write_text(html, encoding="utf-8")
print(f"Built docs/index.html ({len(html):,} bytes)")
