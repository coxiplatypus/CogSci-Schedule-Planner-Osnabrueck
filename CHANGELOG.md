# Changelog

## v1.3.0 — 2026-04-10

### Added
- Quarter-hour time slots: start and end times now support any minute (default 14:15–15:45 following the German c.t. convention). Slots are entered via a native time picker that snaps to 15-minute steps but accepts arbitrary minutes when typed.
- Right-click a grid course block → set that specific slot's room directly from the attendance menu (room row below the presence toggles; press Enter to save, Escape to cancel).
- `CLAUDE.md` workflow guide at the repo root — documents the `.venv/bin/python build.py` flow, source layout, and the "don't define components inside components" React gotcha that caused the room-input focus bug.
- `parseTime` / `fmtTime` / `fmtTimeShort` helpers in `src/utils/helpers.js`, and a `DEFAULT_SLOT` constant in `src/data/constants.js`.

### Changed
- Per-slot rooms are now the primary model; the course-level `room` field is relabelled "Default room" and kept as a legacy fallback (existing data in `src/data/courses.js` and old share URLs keep working).
- Default new time slot is 14:15–15:45 instead of 10:00–12:00.
- Time display unified across the grid tooltip, edit form, conflict list, and right-click menu via the `fmtTime*` helpers.
- SlotEditor replaces its two hour-select dropdowns with native `<input type="time" step="900">` pickers.
- Grid block positioning now uses fractional top offsets so 14:15 slots start a quarter-row below the 14:00 gridline.

### Fixed
- Room input (per-slot and course-level) lost focus after every keystroke because `SlotEditor` and `CourseRow` were defined inside the `App` component, so every parent render gave them a new function identity and React unmounted/remounted the inputs. They're now module-scope render functions (`renderSlotEditor`, `renderCourseRow`) called inline, so inputs stay mounted across renders.

---

## v1.2.0 — 2026-04-09

### Added
- Right-click context menu on grid course blocks to set attendance mode (In-person / Not known / Remote possible)
- Per-slot room assignments: each time slot can have its own room (course-level room serves as fallback)
- Room field in the slot editor (edit and add-course forms)
- LOCATION field in ICS calendar export (uses slot-level room with course-level fallback)
- Python build script (`build.py`) for modular source code

### Changed
- Attendance mode is now per time slot instead of per course — right-click targets a specific slot, sidebar button cycles all slots together
- Conflict detection respects per-slot attendance: setting one slot to remote only excludes that slot's overlaps
- Right-click attendance menu header now shows the targeted slot (e.g. "NDyn (Tu 10–12) — Attendance")
- Source code refactored from single `docs/index.html` into modular `src/` structure (data, utils, App)
- Ethics/Mind and Philosophy area color changed from amber (`#d97706`) to orange-red (`#c2410c`) to avoid confusion with soft conflict warning color
- Attendance mode labels updated: "Unclear" → "Not known", "Remote OK" → "Remote possible"
- Tooltip now shows per-slot rooms when they differ across slots
- Developers edit `src/` files and run `python build.py` instead of editing `docs/index.html` directly
- ECTS panel: area bar LP now shows only this semester's LP (imported baseline visible in bar segment only)
- ECTS panel: summary boxes renamed — "WP" → "Compulsory Electives", "LP total" → "LP this semester"
- ECTS panel: added tooltip on Compulsory Electives box explaining Wahlpflichtbereich and PO assignment
- ECTS panel: added note below summary (PO 2024 only) that focus area assignments are preliminary

---

## v1.1.0 — 2026-04-08

### Added
- Room field in edit and add-course forms, shown in floating tooltip
- Click a course in the timetable grid to set its status via a popup menu (Not selected / Considering / Likely / Locked / Dropped)
- Stud.IP data acquisition guide in CONTRIBUTING.md (step-by-step with screenshots workflow)
- MSc PO 2024 module abbreviation reference table in CONTRIBUTING.md

### Changed
- Edit and add-course form font sizes increased from 9px to 12px
- Sidebar can now be dragged up to 2/3 of viewport width (was capped at 600px)

### Fixed
- "Collapse all" button now works correctly

---

## v1.0.1 — 2026-04-08

### Fixed
- "Collapse all" button now works correctly (groups were staying open because missing keys defaulted to open)

---

## v1.0.0 — 2026-04-08

First public release of the CogSci Schedule Planner for SoSe 2026.

### Features

- **66 courses** from the SoSe 2026 catalog (MSc and BSc, PO 2024 and PO 2019/20)
- **Visual weekly grid** with 5-day view and single-day focus mode
- **4-state course planning**: Considering (?), Likely (~), Locked (✓), Dropped (✕)
  - Segmented controls for direct status selection (no cycling)
  - Dropped courses stay visible but greyed out to avoid re-evaluation
- **Conflict detection** with two severity levels:
  - Hard conflicts (red): locked/likely vs locked/likely
  - Soft conflicts (orange): likely vs likely
  - Presence toggle (in-person / unclear / remote) controls which overlaps count
- **ECTS tracking** per focus area with:
  - Specialization threshold markers (20 LP, green)
  - Cap markers (32 LP, red)
  - Separate bar segments for locked (dark) vs likely (medium) vs considering (faint)
- **Credit import** from the official Grade Calculator spreadsheet (.xlsx from cs-mentoring@uos.de)
  - Also supports manual entry per area
  - Baseline shown as darkest bar segment
  - Two share modes: with or without imported credits
- **ICS calendar export** for Google Calendar / Outlook / Apple Calendar
  - Weekly recurring events from Apr 7 – Jul 11, 2026
- **Custom courses**: add your own courses with multiple time slots
- **Edit any course**: hover → click ✎ to correct name, ECTS, area, or schedule
- **Shareable URLs**: full plan state encoded in the link
  - Context-aware sharing message (local file vs hosted version)
- **Two grouping modes**: By Area (collapsible focus areas) or By Status (locked/likely/considering/dropped)
- **Block course separation**: weekly courses shown first, block/no-time courses after a divider
- **Resizable panels**: draggable splitters between sidebar ↔ grid and ECTS panel ↔ course list
  - Corner drag handle for simultaneous resize
  - Double-click any splitter to reset to defaults
  - Mobile: vertical splitter between grid and sidebar
- **Mobile responsive**: grid on top, sidebar below on narrow screens
- **Floating tooltip**: course details follow the cursor on hover
- **Comprehensive help**: expandable reference docs via the ? button
- **Data management**: "Clear course plan" (keeps credits) vs "Delete all data" (nuclear reset with confirmation)
- **Sunset notice**: tool will be taken down no later than November 30, 2026

### Technical

- Single self-contained HTML file (no build step)
- React 18 + Babel Standalone + SheetJS (all via CDN)
- localStorage persistence with URL state sharing
- Viewport-height layout (no page scrolling)
- Error boundary for graceful failure display

---

## Development history (pre-v1.0)

The planner was developed iteratively. Early prototypes (not included in the public repo) went through:

1. Course selector with presets and ECTS bars (React artifact)
2. Schedule grid with basic conflict detection
3. Side-by-side overlap rendering, presence toggle, day filter
4. localStorage persistence
5. Standalone hostable HTML with PO selection and URL export
6. BSc/MSc toggle, English UI
7. Complete course catalog, collapsible areas, colloquium/study project categories
8. Feature additions and refinements leading to v1.0

---

## Attribution

See [ATTRIBUTION.md](ATTRIBUTION.md) for details on human vs. LLM contributions.
