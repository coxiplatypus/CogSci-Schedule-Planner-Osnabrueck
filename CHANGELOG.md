# Changelog

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
