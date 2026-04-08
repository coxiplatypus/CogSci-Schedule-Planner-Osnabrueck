# CogSci Schedule Planner

An interactive course schedule planner for the **Cognitive Science** program at **Universit&auml;t Osnabr&uuml;ck**, built for **Summer Semester 2026**.

This is an unofficial student tool. It is not affiliated with or endorsed by the university.

**[Try the live version &rarr;](https://coxiplatypus.github.io/CogSci-Schedule-Planner-Osnabrueck/)**

---

## Table of contents

- [What it does](#what-it-does)
- [Quick start](#quick-start)
- [How to host on GitHub Pages](#how-to-host-on-github-pages)
- [Project structure](#project-structure)
- [Contributing](#contributing)
- [Versioning](#versioning)
- [Disclaimer](#disclaimer)
- [License](#license)

---

## What it does

- Browse **66+ courses** across BSc and MSc, PO 2019/20 and PO 2024
- Plan your semester with a **visual weekly grid** showing time conflicts
- Set course status: **Considering**, **Likely**, **Locked**, or **Dropped**
- Track **ECTS per focus area** with specialization thresholds and caps
- **Import your past credits** from the official Grade Calculator spreadsheet (.xlsx)
- **Export** your schedule as an `.ics` calendar file (works with Google Calendar, Outlook, Apple Calendar)
- **Share** your plan with classmates via a link
- **Add custom courses** not in the catalog
- **Edit any course** data (times, ECTS, area) if something is wrong
- Works on **desktop and mobile**

No server, no account, no tracking. Everything runs in your browser and is saved locally.

> **Tip &mdash; Moving your plan between devices:** Since there are no accounts, your data only exists in your current browser. To transfer your plan to another device (or browser), use the **Share** button to copy your link, then open it on the other device. This loads your full plan there. It's also a good way to back up your progress.

---

## Quick start

### Option 1: Use the hosted version (easiest)

Visit the GitHub Pages link above. No installation needed.

### Option 2: Run locally

1. Download or clone this repository
2. Open `docs/index.html` in your browser
3. That's it &mdash; no build step, no dependencies, no server needed

The file is fully self-contained: HTML + CSS + JavaScript in a single file, using CDN-hosted React and Babel.

### Option 3: Modify the code

See [DEVELOPMENT.md](DEVELOPMENT.md) for a beginner-friendly guide to setting up a local environment (Python, Node.js, virtual environments).

---

## How to host on GitHub Pages

If you want to host your own copy:

1. **Create a GitHub account** at [github.com](https://github.com) if you don't have one
2. **Create a new repository** (click the `+` button &rarr; "New repository")
   - Give it a name like `cogsci-schedule-planner`
   - Set it to **Public**
   - Do **not** initialize with README (we already have one)
3. **Push this code** to GitHub:
   ```bash
   cd path/to/this/folder
   git remote add origin https://github.com/YOUR_USERNAME/cogsci-schedule-planner.git
   git branch -M main
   git push -u origin main
   ```
4. **Enable GitHub Pages**:
   - Go to your repo on GitHub &rarr; **Settings** &rarr; **Pages**
   - Under "Source", select **Deploy from a branch**
   - Branch: `main`, Folder: `/docs`
   - Click **Save**
5. Wait 1-2 minutes. Your site will be live at:
   ```
   https://YOUR_USERNAME.github.io/cogsci-schedule-planner/
   ```

### Updating the site

Any time you push changes to `main`, GitHub Pages automatically rebuilds. Just:
```bash
git add -A && git commit -m "description of changes" && git push
```

---

## Project structure

```
docs/
  index.html          The complete planner app (single self-contained file)

README.md             This file
DEVELOPMENT.md        Dev setup guide (Python, Node.js, virtual environments)
CONTRIBUTING.md       How to contribute, versioning guide, fork for future semesters
CHANGELOG.md          Version history
ATTRIBUTION.md        Human vs. LLM contribution transparency
LICENSE               MIT License
.gitignore            Files excluded from the repository
```

The `docs/` folder is the deployment target for GitHub Pages. Everything needed to run the app is in `index.html`.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to:
- Report or fix incorrect course data
- Add features
- Adapt the tool for a future semester
- Fork the project

---

## Versioning

This project uses [semantic versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`). See the [versioning guide in CONTRIBUTING.md](CONTRIBUTING.md#versioning-and-changelogs) for when and how to bump versions, update the changelog, and create git tags. The current version is in [CHANGELOG.md](CHANGELOG.md).

---

## Disclaimer

This tool was created by students, not by the university. Course times, ECTS values, and module mappings may be incorrect or incomplete. **Always verify against [Stud.IP](https://studip.uni-osnabrueck.de) and your Pr&uuml;fungsordnung.**

The live version of this tool for the summer semester 2026 will be taken down no later than **November 30, 2026**.

---

## License

[MIT](LICENSE) &mdash; free to use, modify, and share.
