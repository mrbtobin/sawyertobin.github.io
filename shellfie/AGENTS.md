# Working on Shellfie

This guide applies to all contributors and coding agents, including Codex and Claude Code. Read it along with `tests/README.md` before changing or testing Shellfie. The user's instructions and any higher-priority repository or environment instructions take precedence.

## Start here

- Check `git status` and the current branch first; preserve work you did not create. Check the latest main branch and existing pull requests before branching, merging, or deploying.
- Shellfie is a static app at `shellfie/`. The entry point is `index.html`, behavior is in `app.js`, styles in `app.css`, and the service worker is `sw.js`. Stories live in `books/` and the catalog is `catalog.js`; `tools/README.md` explains library generation.
- Serve the repository root with `python3 -m http.server 8765` and open `http://localhost:8765/shellfie/`. Microphone APIs require a secure context (HTTPS or localhost). No app account is required by the documented local test setup.
- Prefer small, focused changes. Explain user-facing consequences in plain language. Do not include children’s personal information or audio in test artifacts or logs without appropriate consent.

## Testing and handoff

- Put new test cases and automated checks in `tests/`, following `tests/README.md`. Read `tests/microphone.md` for commands, manual cases, supported-device priorities, and existing evidence. Preserve existing coverage when changing tests. Older scripts in `tools/` report failures in their output and do not reliably exit nonzero; inspect their results.
- Run checks appropriate to the change and report exact outcomes. Separate real-device results from emulated layouts, fake audio, and mocked speech recognition. Browser microphone permission, captured audio, and speech recognition are separate things; success at one does not prove the others.
- Current known gap as of 2026-11-07: real-device speech recognition has not been signed off on iOS or Android; prioritize those devices, then desktop Chrome. A Mac Chrome log showed `phrases-not-supported` followed by a separate session with audio start but no recognized words. Fixes removing optional phrase hints and improving permission/recovery are deployed in version `2026.11.07-g`; the latter symptom still needs live verification. Consult the current code and newer test records before assuming this status is still current.
- Leave a useful handoff: summarize changes, commands and results, remaining failures or untested environments, and relevant commits or PRs. Update shared documentation when workflows or verified status change. Do not claim production readiness from simulated tests alone.

## Coordination and releases

- Use this file as the common source of contributor guidance; `CLAUDE.md` points here so the instructions do not diverge. Project test cases belong in `tests/`, not agent-specific directories.
- Check for concurrent changes before committing or merging. Do not overwrite another contributor's work. Commits, pushing, PRs, merges and deployment should follow the user's instructions and repository protections; a merge to the default branch can publish the site. Confirm actual deployment status when reporting a release.
