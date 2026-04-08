# Contributing

Thank you for your interest in improving the CogSci Schedule Planner! This guide explains how you can help.

## Ways to contribute

### Report a problem

If you find incorrect course data (wrong time, wrong ECTS, wrong area mapping), please [open an issue](https://github.com/YOUR_USERNAME/cogsci-schedule-planner/issues) with:

- The course name and what's wrong
- The correct information (ideally with a link to the Stud.IP page)

### Fix course data

The course data lives inside `docs/index.html` in a JavaScript array called `const C = [...]`. Each course looks like this:

```javascript
{
  id: "idl",                    // Short unique identifier
  name: "Intro to Deep Learning: Theory & Practice",
  short: "IntDL",               // Abbreviation shown in grid
  ects: 8,                      // Credit points
  nr: "830.111",                // Course number from Stud.IP
  deg: "both",                  // "both", "msc", or "bsc"
  cat: "course",                // "course", "sp", "colloquium", or "bsc-core"
  a24: "AI/ML",                 // PO 2024 focus area
  a19: "AI",                    // PO 2019/20 area
  slots: [                      // Weekly time slots (empty array = block/no fixed time)
    { day: 0, start: 14, end: 16 },  // Monday 14:00-16:00
    { day: 4, start: 10, end: 12 }   // Friday 10:00-12:00
  ]
}
```

Days are numbered 0-4 (Monday-Friday). Times are in 24h format (integers).

To fix a course: edit the entry in the `const C` array, test by opening the file in a browser, then submit a pull request.

### Add a feature

The entire app is a single HTML file with inline React (JSX transpiled by Babel in the browser). There's no build step — just edit the file and refresh.

**Tech stack:**
- React 18 (via CDN)
- Babel Standalone (via CDN, transpiles JSX in-browser)
- SheetJS (via CDN, for XLSX import)
- No other dependencies

If you're new to React: the app is one big `function App()` component in `docs/index.html`. State is managed with `useState` hooks. The UI is built with inline styles (no CSS framework). The code has section-level comments (`// ──`) to help you navigate.

**Before submitting a feature PR:**
1. Make sure the file still opens correctly in a browser (no white screen)
2. Check the browser console for errors (F12 → Console)
3. Test on both desktop and a narrow window (mobile simulation)

### Adapt for a different semester

To create a version for a future semester:
1. Update the course data in `const C = [...]`
2. Update the semester dates in the `exportICS` function (the `FD` array with first-day dates)
3. Update the title and text references to "SoSe 2026"
4. Update the sunset notice date

### How to get course data from Stud.IP

You need a Stud.IP account (all enrolled students have one).

1. Go to [studip.uni-osnabrueck.de](https://studip.uni-osnabrueck.de) and sign in
2. Click **Search** in the top navigation bar
3. Switch to the **Course directory** tab
4. Navigate: Universit&auml;t Osnabr&uuml;ck &rarr; Veranstaltungen &rarr; **Cognitive Science**
5. You'll see Bachelor-Programm and Master-Programm listed
6. **Open Bachelor and Master in separate browser tabs**
7. Make sure the correct semester is selected on the left sidebar
8. On the left sidebar, under **Suchergebnis gruppieren** (group results by), select **Area** &mdash; this groups courses by their module abbreviation (e.g. CS24-MWP-NI-x), which tells you which focus area each course belongs to
9. Under "Actions" on the left sidebar, click **Download des Ergebnisses** &mdash; this downloads an `.xls` file with all courses
10. Do this for both Bachelor and Master tabs

The `.xls` files contain: course name, course number, schedule, and instructors. When grouped by area, the module abbreviations are included. You'll still need to add ECTS values manually &mdash; check the Pr&uuml;fungsordnung or the module directory in Stud.IP (Course directory &rarr; Module index).

### Module abbreviations reference (MSc PO 2024)

> **Note:** This table is for **MSc PO 2024** only. If you're working with BSc or PO 2019/20, you'll need to find the equivalent module mappings in the relevant Pr&uuml;fungsordnung.

**AI/ML** (planner abbreviations: NI, AI, NAI, CL, CV)

| Stud.IP code | Planner | Module |
|-------------|---------|--------|
| CS24-MWP-NI-x | NI | Neuroinformatics |
| CS24-MWP-AI-x | AI | Artificial Intelligence |
| CS24-MWP-NAI-x | NAI | NeuroAI |
| CS24-MWP-CL-x | CL | Computational Linguistics |
| CS24-MWP-CV-x | CV | Computer Vision |

**Psych/Lang** (planner abbreviations: CMP, CBC, LING)

| Stud.IP code | Planner | Module |
|-------------|---------|--------|
| CS24-MWP-CMP-x | CMP | Cognitive Modeling and Psychology |
| CS24-MWP-CBC-x | CBC | Comparative Bio-Cognition |
| CS24-MWP-LING-x | LING | Theoretical and Experimental Linguistics |

**Neuroscience** (planner abbreviation: CNS)

| Stud.IP code | Planner | Module |
|-------------|---------|--------|
| CS24-MWP-CNS-x | CNS | (Computational) Neuroscience |

**Ethics/Mind** (planner abbreviations: EAI, PHIL)

| Stud.IP code | Planner | Module |
|-------------|---------|--------|
| CS24-MWP-EAI-x | EAI | Ethics of Artificial Intelligence |
| CS24-MWP-PHIL-x | PHIL | Philosophy of Mind and Cognition |

**Methods** (planner abbreviation: MCS, max 4 ECTS)

| Stud.IP code | Planner | Module |
|-------------|---------|--------|
| CS24-MWP-MCS | MCS | Methods of Cognitive Science |

Specialization: &ge;20 ECTS in one focus area. Cap: &le;32 ECTS per focus area.

---

## Versioning and changelogs

This section explains how version numbers and changelogs work. If you've never done this before, don't worry — it's simpler than it sounds.

### Version numbers

We use **semantic versioning** (semver): `MAJOR.MINOR.PATCH`, for example `1.2.3`.

| Part | When to bump | Example |
|------|-------------|---------|
| **PATCH** (1.0.0 &rarr; 1.0.**1**) | Bug fixes, corrected course data, typos | Fixed wrong time for NDyn |
| **MINOR** (1.0.0 &rarr; 1.**1**.0) | New features that don't break existing share links or saved data | Added dark mode, added new courses for next semester |
| **MAJOR** (1.0.0 &rarr; **2**.0.0) | Breaking changes — old share links or saved data stop working | Changed the state format so old URLs can't be loaded |

**Rules of thumb:**
- If you only fixed data or text &rarr; bump **PATCH**
- If you added something new and everything old still works &rarr; bump **MINOR**
- If you changed something so old links/saves break &rarr; bump **MAJOR**
- Multiple small fixes can be batched into one version bump
- You don't need a new version for every single commit — bump when you're ready to "release" a set of changes

### When to update the changelog

Update [CHANGELOG.md](CHANGELOG.md) whenever you bump the version. Add a new section at the **top** of the file (newest first) like this:

```markdown
## v1.1.0 — 2026-05-15

### Added
- Dark mode toggle
- Two new courses: XYZ, ABC

### Fixed
- NDyn schedule was showing wrong day
```

Use these categories as needed: **Added**, **Changed**, **Fixed**, **Removed**.

### How to create a version tag

After committing your changes and updating the changelog:

```bash
# Create an annotated tag
git tag -a v1.1.0 -m "v1.1.0: description of what changed"

# Push the tag to GitHub
git push origin v1.1.0
```

Tags mark specific points in history. On GitHub, tags show up under "Releases" and make it easy to see what changed between versions.

### Do I need to bump the version right now?

No. It's fine to make several commits without bumping the version. Bump it when you have a meaningful set of changes that you'd want others to know about — for example, before sharing an updated link or announcing a new feature.

---

## Licensing of contributions

By submitting a pull request or otherwise contributing code to this project, you agree that your contribution is licensed under the same [MIT License](LICENSE) as the rest of the project. This means:

- Your code can be freely used, modified, and redistributed by anyone
- You cannot later revoke this permission or claim exclusive rights over contributed code
- You confirm that you have the right to submit the code (it's your own work or compatible open-source code)

This is standard practice for open-source projects and protects both you and the maintainers.

---

## Code of conduct

Be kind. This is a student project made to help fellow students. All contributions and discussions should be respectful and constructive.

---

## Forking for future semesters

This tool is built for SoSe 2026 and will be taken down by November 2026. If you want to create a version for a future semester, **you are welcome and encouraged to fork this repository**. You don't need permission — the MIT license allows it.

A fork gives you your own complete copy of the code that you can modify freely. To fork:

1. Click the **Fork** button at the top right of the GitHub repository page
2. Update the course data, semester dates, and any text references (see "Adapt for a different semester" above)
3. Host it on your own GitHub Pages

If the original maintainer is no longer active, a fork is the intended way for the project to continue. If you do create a version for a future semester, consider opening an issue on the original repo to let others know — so students can find the current version.

---

## Questions?

Open an issue on GitHub or reach out through the CogSci student channels at Uni Osnabrück.
