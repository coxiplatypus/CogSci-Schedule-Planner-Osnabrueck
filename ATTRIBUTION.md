# Attribution — Human and LLM Contributions

This project was built collaboratively between a human developer and an LLM (large language model). We believe in being transparent about how AI tools were used in development.

## How this project was made

The planner was developed in an interactive session between a Cognitive Science student at Universität Osnabrück and **Claude** (Anthropic's AI assistant), using **Claude Code** (Anthropic's CLI development tool).

The workflow was conversational: the human described what they needed, reviewed outputs, gave feedback, caught bugs, and made design decisions. The LLM wrote code, suggested architectures, and implemented features based on the human's direction.

## Human contributions

- **Concept and motivation**: Identifying the need for a schedule planner, defining the target audience (CogSci students), and deciding to make it publicly shareable
- **Course data**: Sourcing, verifying, and cross-referencing course information from Stud.IP exports, the official Prüfungsordnung documents, and the university course catalog
- **Design decisions**: Choosing the 4-state status model, the conflict severity levels, the resizable panel layout, the credit import feature, the dual share modes, and many UX details
- **Quality control**: Testing every feature, catching bugs (the white-screen div nesting issue, the share button highlighting bug, the ECTS bar shade issue), and providing visual feedback via screenshots
- **Domain knowledge**: Understanding the PO 2024 and PO 2019/20 rules, ECTS specialization thresholds, module mappings, and how CogSci students actually plan their semesters
- **Data privacy review**: Deciding what personal data to exclude from the public version, designing the two-tier share system (with/without credits)
- **Documentation review**: Reviewing and refining all documentation for accuracy and tone

## LLM contributions (Claude, via Claude Code)

- **Code implementation**: Writing the HTML, CSS, React/JSX code based on human specifications
- **Architecture**: Proposing the single-file React architecture with CDN dependencies (no build step), the state management pattern, the URL-encoded sharing mechanism
- **Data transformation**: Parsing Stud.IP XLS exports and cross-referencing them with existing course data to find missing entries and schedule corrections
- **Feature implementation**: ICS export, XLSX credit import (using SheetJS), floating tooltip, resizable panels with pointer events, mobile responsive CSS, error boundary
- **Bug diagnosis**: Tracing the div nesting issue via bracket counting and Babel transpilation testing
- **Documentation drafting**: Writing README, CONTRIBUTING, CHANGELOG, and this file based on human guidance

## What this means

Neither the human nor the LLM could have built this alone in the same timeframe. The human provided the domain expertise, quality standards, and design taste. The LLM provided fast implementation, broad technical knowledge, and the ability to handle large amounts of code in a single session.

The LLM does not have opinions about CogSci course planning. Every feature exists because a human decided it should. The LLM made implementation suggestions that the human accepted, modified, or rejected.

## Tools used

- **Claude Opus 4** (Anthropic) via **Claude Code** CLI
- No other AI tools were used
- No code was copied from other projects

---

*This attribution reflects the state at v1.0. Future contributions by other humans or tools should be noted in pull requests and commit messages.*
