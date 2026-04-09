# Development guide

This guide is for people who want to **modify the code**, run helper scripts, or contribute to the project. If you just want to **use** the planner, see the [README](README.md).

---

## Table of contents

- [How the app works (no build step)](#how-the-app-works-no-build-step)
- [Prerequisites](#prerequisites)
- [Setting up a Python environment](#setting-up-a-python-environment)
  - [Option A: venv](#option-a-venv-built-into-python-simplest)
  - [Option B: conda](#option-b-conda-if-you-already-use-anacondaminiconda)
- [Avoiding global package installs](#avoiding-global-package-installs)
- [Working with Node.js (optional)](#working-with-nodejs-optional)
- [Does the environment concern apply to JavaScript/React?](#does-the-environment-concern-apply-to-javascriptreact)
- [Navigating the code](#navigating-the-code)

---

## How the app works

The planner's source code lives in `src/` as multiple files. A Python build script (`build.py`) concatenates them into the single deployed file `docs/index.html`. The app loads three libraries from CDNs (no local install needed):

- **React 18** &mdash; UI framework
- **Babel Standalone** &mdash; compiles JSX (React's HTML-like syntax) in the browser
- **SheetJS** &mdash; parses `.xlsx` files for the credit import feature

### Development workflow

1. Edit source files in `src/` (not `docs/index.html` directly)
2. Run the build script: `python build.py` (or `.venv/bin/python build.py`)
3. Open `docs/index.html` in a browser to test
4. Commit both the source files and the generated `docs/index.html`

### Source file structure

```
src/
  template.html          # HTML shell (head, style, CDN scripts, {SCRIPT_CONTENT} placeholder)
  data/
    constants.js         # Days, hours, colors, area definitions, degree configs, status states
    courses.js           # Course database (const C array)
  utils/
    helpers.js           # overlaps(), save(), load(), toURL(), fromURL()
    ics.js               # exportICS() — .ics calendar file generation
    xlsx.js              # parseGradeCalc() — Grade Calculator spreadsheet parser
  App.jsx                # Main App component, sub-components, error boundary, mount
build.py                 # Concatenates src/ into docs/index.html
```

All source files share the global scope of one `<script type="text/babel">` block &mdash; there are no `import`/`export` statements. Source file order matters (constants before utilities before App).

---

## Prerequisites

You need **two things** installed on your computer:

1. **Git** &mdash; for version control
   - Check if you have it: `git --version`
   - Install: [git-scm.com](https://git-scm.com/) (Windows/Mac/Linux)

2. **Python 3.10+** &mdash; for data processing scripts (e.g., parsing Stud.IP exports)
   - Check if you have it: `python3 --version`
   - Install: [python.org](https://www.python.org/downloads/) or via your system package manager

**Optional:**

- **Node.js** &mdash; only needed if you want to use Node-based tools (not required for the app itself)
  - Check: `node --version`
  - Install: [nodejs.org](https://nodejs.org/)

---

## Setting up a Python environment

> **Why an environment?** Python packages (libraries) can be installed globally (for your whole system) or inside an isolated environment (just for this project). You almost always want an isolated environment so that:
> - Different projects can use different versions of the same library
> - You don't accidentally break system tools that depend on specific Python versions
> - You can delete the environment and start fresh without affecting anything else

### Option A: `venv` (built into Python, simplest)

```bash
# 1. Clone the repo and enter it
git clone https://github.com/YOUR_USERNAME/cogsci-schedule-planner.git
cd cogsci-schedule-planner

# 2. Create a virtual environment (this makes a .venv folder)
python3 -m venv .venv

# 3. Activate it
#    On Linux/Mac:
source .venv/bin/activate
#    On Windows (Command Prompt):
.venv\Scripts\activate
#    On Windows (PowerShell):
.venv\Scripts\Activate.ps1

# 4. Your terminal prompt should now show (.venv) at the start.
#    Install packages inside it:
pip install openpyxl xlrd

# 5. When you're done working, deactivate:
deactivate
```

**Every time you open a new terminal** to work on this project, remember to activate the environment again (`source .venv/bin/activate`). If you don't see `(.venv)` in your prompt, you're not in the environment.

### Option B: `conda` (if you already use Anaconda/Miniconda)

```bash
# 1. Create an environment
conda create -n cogsci python=3.12 -y

# 2. Activate it
conda activate cogsci

# 3. Install packages
pip install openpyxl xlrd

# 4. When done:
conda deactivate
```

---

## Avoiding global package installs

Here are the most common mistakes and how to avoid them:

| Mistake | What happens | How to avoid |
|---------|-------------|--------------|
| Running `pip install something` without activating your environment | The package installs globally, possibly conflicting with system packages | Always check your prompt for `(.venv)` or `(cogsci)` before running `pip` |
| Running `sudo pip install` | Installs as root, very hard to undo | Never use `sudo` with `pip`. If pip asks for sudo, you're not in an environment |
| Using `pip` instead of `pip3` outside an environment | Might install for Python 2 on some systems | Inside an activated environment, `pip` always points to the right Python |
| Forgetting to activate after opening a new terminal | You'll install globally or get "module not found" errors | Add a shell alias like `alias cogsci="cd ~/cogsci-schedule-planner && source .venv/bin/activate"` |

**Quick check** &mdash; run this to verify you're in the right place:
```bash
which python    # Should show a path inside .venv/ or your conda env
which pip       # Same — should NOT be /usr/bin/pip or /usr/local/bin/pip
```

---

## Working with Node.js (optional)

If you want to use Node-based tools:

```bash
# Use a local node_modules folder (never install globally with -g)
npm init -y
npm install @babel/standalone    # example — installs to ./node_modules/

# node_modules/ is already in .gitignore, so it won't be committed
```

**Rule of thumb:** prefer `npm install` (local) over `npm install -g` (global). Local installs stay in the project folder and don't affect your system.

---

## Does the environment concern apply to JavaScript/React?

**Short answer:** Not for running this app, but yes if you use Node.js tooling.

This project loads React, Babel, and SheetJS from **CDN `<script>` tags** in the HTML. There's nothing to install &mdash; your browser downloads these libraries fresh each time you open the page. No package manager, no version conflicts, no environment needed.

The global-vs-local concern only applies if you use **Node.js** (for example, to run scripts or use npm packages). In that case, the same rule applies as with Python: always use `npm install` (local, saves to `node_modules/` in your project) and avoid `npm install -g` (global, affects your whole system). The `node_modules/` folder is already in `.gitignore`.

---

## Preserving share links (backward compatibility)

Share URLs encode the user's full plan as base64 in the `?s=` query parameter. If you change how the code reads this data, **every previously shared link breaks** — students lose their saved plans.

**Safe changes** (won't break existing URLs):
- Adding new courses (old URLs just won't have them selected)
- Adding new fields to the save object (old URLs won't have them — use a default)
- Changing course names, ECTS, time slots, or areas (URLs only store the course ID, not the data)
- Changing anything visual (styles, layout, labels)

**Breaking changes** (will invalidate all existing URLs):
- Renaming a key in the state object (e.g. `status` → `plan`)
- Changing a course ID in the `const C` array (e.g. `idl` → `deep-learning`)
- Changing the URL encoding (currently base64 of JSON)
- Removing an old migration path (e.g. the `else if(d.on)` block that converts the old format)

**If you must make a breaking change:**
1. Keep the old loading path as a migration — read the old format and convert it to the new one (see the existing `d.on` → `d.status` migration as an example)
2. Bump the **MAJOR** version (this is what major versions are for)
3. Note it in the changelog so users know their old links may need re-sharing

**Rule of thumb:** never rename existing keys (`ck`, `status`, `pres`, `custom`, `edits`, `baseline`) and never change existing course IDs. Always handle missing fields with defaults.

---
## Navigating the code

Source files in `src/` are concatenated into `docs/index.html` by `build.py`. The generated file has section markers (`// ── filename ──`) to identify boundaries. See the [source file structure](#source-file-structure) above for what lives where.

Key sections in `src/App.jsx`:

| Section | What it contains |
|---------|-----------------|
| State hooks | All React `useState` (plan data, layout, UI) |
| Derived data | Effective course list, visible courses |
| Conflict detection | Hard/soft conflict logic |
| ECTS projection | LP counting split by locked/likely/considering |
| Grid slot map | Maps hour-cells to courses for the schedule grid |
| Share, export, reset | Action handlers |
| Sidebar grouping | Area-based and status-based course groups |
| SlotEditor, CourseRow | Reusable sub-components |
| Onboarding | Help/intro screen |
| Main render | Header, grid, sidebar, conflicts, footer, menus, tooltip |
| Error boundary | Catches errors and shows them instead of a white screen |
