# Shellfie test cases

This directory is the shared home for Shellfie QA. Keep manual test cases and automated regression tests here, organized by feature (for example, `microphone.md` and `microphone.js`). Existing scripts in `../tools/` still run from there; move or replace them only when their usage and references have been updated.

## Manual test case format

Use a Markdown file named for the feature. Group related cases under clear headings. Give each case a stable, unique ID (for example, `MIC-001`), and use this format:

```markdown
### MIC-001 — Short descriptive title
- **Priority:** Release blocker / high / normal
- **Platforms:** Applicable devices, browsers and orientations
- **Setup:** Starting state, permissions, account and data needed
- **Steps:**
  1. First action.
  2. Second action.
- **Expected:** Observable result, including error or recovery behavior.
```

Describe what a tester can observe, not how the implementation works. Include permission denial, recovery, interruptions and accessibility when relevant. Keep test data free of real children's personal information.

## Automated tests

Place new feature-specific automated tests in this directory, with a descriptive filename and instructions to run them in the feature's Markdown file. Tests should exit nonzero on failure, identify what failed, and clean up resources. Prefer deterministic checks of meaningful behavior; clearly state when a test uses mocks or simulated speech and cannot prove real-device behavior. Document any dependencies and setup. Do not claim a simulated device or browser verifies real microphone access.

## Results and release decisions

Keep cases separate from results. Record each real-device run with the date, tester, device model, OS and browser versions, orientation, case ID, pass/fail/blocked, and issue or evidence reference. Never mark an unrun case as passed. Summarize outstanding blockers and limitations for a release. The existing microphone matrix in `microphone.md` is the starting point for microphone sign-off.

## Current coverage

- [Story and quiz suitability review](content_suitability.md)
- [Microphone cases and device matrix](microphone.md)
- `microphone.js`: automated simulated microphone lifecycle checks
- `microphone_virtual.js`: Chromium layout profiles with fake audio capture and simulated speech
- Additional legacy simulations are listed in [tools/README.md](../tools/README.md).
