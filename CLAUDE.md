# CLAUDE.md — CogSci Schedule Planner

Workflow guide for Claude Code (and human contributors) working in this repo.

## What this is

A React single-page app bundled as a single static HTML file at [docs/index.html](docs/index.html), served via GitHub Pages from `/docs` on `main`. **No Node toolchain** — React, Babel Standalone, and SheetJS all load from CDNs, and the only build step is a Python script that concatenates the `src/**` files into the HTML template.

## Hard rules

1. **Edit under [src/](src/), never hand-edit [docs/index.html](docs/index.html).** That file is generated — any manual change will be overwritten on the next build.
2. **After any `src/**` edit, run the build before committing:**
   ```sh
   .venv/bin/python build.py
   ```
   Commit both the `src/` changes and the regenerated `docs/index.html` in the same commit.
3. **Always use the local venv Python.** Use `.venv/bin/python` (or `.venv/bin/python3`, `.venv/bin/pip`) — never the system `python3`. The venv lives at [.venv/](.venv/). If packages are missing: `.venv/bin/pip install <pkg>`.
4. **Don't break share-URL or localStorage compatibility.** Plans are stored as base64-encoded JSON in URLs (`?s=…`) and in `localStorage[cogsci-pub-v1]`. When you rename a state field, keep a migration branch (see the `d.on` → `d.status` pattern in [src/App.jsx](src/App.jsx)). Never break an existing shared link without a migration.
5. **Bump the version in [CHANGELOG.md](CHANGELOG.md) for any user-visible change** and follow the existing format: `## vMAJOR.MINOR.PATCH — YYYY-MM-DD` with `### Added / Changed / Fixed / Removed` sections. PATCH = bug fix, MINOR = new feature, MAJOR = breaking change (see [CONTRIBUTING.md](CONTRIBUTING.md) for details).

## Source layout

[build.py](build.py) concatenates these files, in this order, into the `{SCRIPT_CONTENT}` placeholder of [src/template.html](src/template.html):

1. [src/data/constants.js](src/data/constants.js) — `DAYS`, `HOURS`, `RH`, `SK`, `DEFAULT_SLOT`, `PR`, `CL`, `A24*`, `A19`, `CFGS`, `ST`, `ST_ORDER`
2. [src/data/courses.js](src/data/courses.js) — `const C = […]` course catalog
3. [src/utils/helpers.js](src/utils/helpers.js) — `overlaps`, `save`/`load`, `toURL`/`fromURL`, `parseTime`/`fmtTime`/`fmtTimeShort`
4. [src/utils/ics.js](src/utils/ics.js) — `exportICS`
5. [src/utils/xlsx.js](src/utils/xlsx.js) — `parseGradeCalc` (Grade Calculator `.xlsx` import)
6. [src/App.jsx](src/App.jsx) — the `App` component + everything else

All files share a single `<script type="text/babel">` global scope — functions and consts defined in one file are visible in the next. No ES modules, no imports.

## Data model essentials

- **Slot times are decimal hours**: `start: 14.25` = 14:15, `end: 15.75` = 15:45. Integer values (`start: 14`) continue to work and mean `HH:00`. The default new slot is `DEFAULT_SLOT = {day:0, start:14.25, end:15.75}` (German c.t.). Use `fmtTime`/`fmtTimeShort`/`parseTime` from [src/utils/helpers.js](src/utils/helpers.js) for display and input handling — never format times by hand.
- **Rooms**: `sl.room` is per-slot and is the primary place to set a room. `c.room` is a course-level fallback kept for backward compatibility. The tooltip, ICS export, and right-click menu all resolve with the chain `sl.room → c.room → blank`.
- **Slot mutations for built-in courses** go through the `edits[id] = {…}` overlay, not by mutating the `C` array. Custom courses (`custom-*` id prefix) live in the `custom` state array and are mutated directly.

## React gotcha — do not reintroduce

**Do not define React components inside the `App` function.** Every parent render creates a new function identity, which React treats as a new type → unmount → remount → `<input>` elements lose focus mid-keystroke. If you need a reusable render block, write a lowercase `renderFoo(...)` function and call it with `{renderFoo(args)}` inside JSX. The pattern is already used for `renderSlotEditor` and `renderCourseRow` in [src/App.jsx](src/App.jsx) — follow it.

## Verifying changes locally

```sh
.venv/bin/python build.py
python3 -m http.server 8000 --directory docs
# open http://localhost:8000
```

Check that:
- The room and time fields in the edit and add-course forms accept continuous typing.
- The grid positions course blocks correctly for both integer-hour slots (legacy) and :15/:30/:45 slots.
- The right-click menu on a grid block offers attendance and a per-slot room input.
- Share → open in incognito → state round-trips (tests `toURL`/`fromURL`).
- ICS export opens in a calendar app and shows correct times and `LOCATION`.

## Commits

Follow the existing style (see `git log`). Use HEREDOC for multi-line commit bodies. Tag user-visible releases with `git tag vX.Y.Z` matching the CHANGELOG entry.
