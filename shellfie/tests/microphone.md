# Microphone and reading QA

## Release matrix

Run the manual cases below on actual devices with current supported OS/browser versions, recording exact versions, date, tester, result and issue link. Test both portrait and landscape on phones and tablets. A simulated browser or viewport does not certify microphone permissions, speech recognition, OS interruptions, or actual device support.

| Platform | Browser | Result |
| --- | --- | --- |
| iPhone | Safari | Not yet tested on device |
| iPhone | Chrome | Not yet tested on device |
| iPad | Safari | Not yet tested on device |
| iPad | Chrome | Not yet tested on device |
| Android phone and tablet | Chrome | Not yet tested on device |
| Mac | Chrome | Not yet tested on device |
| Mac | Safari | Not yet tested on device |
| Windows | Chrome | Not yet tested on device |
| Windows | Edge | Not yet tested on device |
| Classroom Chromebook | Chrome, including managed school account | Not yet tested on device |

Browser support for speech recognition, network access, policy, language and OS microphone permission varies. A browser allowing microphone capture does not guarantee its speech recognition service is available. Record what actually happens; do not mark unsupported combinations as passing listening.

For the initial friends-and-family rollout, prioritize iPhone/iPad and Android tests; desktop Chrome is the next priority. Do not mark a row passed without a real-device run.

## Manual cases

Use the deployed HTTPS site or localhost, with a working microphone, audible reading voice, and a book in the chosen language. Start with a fresh site permission and profile where stated. Repeat each case for every applicable matrix row and orientation. Do not record children or collect their voices for QA without appropriate consent.

1. **First visit, allow:** Clear site data and microphone permission. Start onboarding and allow the browser/OS request. Speak during the meter check, choose a book and read several lines. Expect visible meter movement, recognized words/highlighting and page progress without a false warning. Note whether browser and OS prompts appeared or were previously granted.
2. **Already allowed:** Reload with permission allowed and open a book. Read aloud. Expect recognition without another permission prompt and no enable-mic warning. This specifically covers the reported Mac Chrome issue. Include a book with names, such as “Max Teaches the Thriller Dance,” and check the developer log for `phrases-not-supported`.
3. **Deny and recover:** Deny microphone access in a fresh profile. Expect an understandable way to continue without the mic and instructions to restore access. Enable access in site and OS settings, return and retry (reload if the browser requires it); read aloud and confirm progress.
4. **Skip and retry:** Choose read without microphone, use tap-for-help, then enable listening using the on-screen control or open another book. Expect a working retry and no lost reading state.
5. **Quiet and resumed reading:** Leave the book open quietly for at least a minute, then resume reading. A normal pause may appear, but silence alone must not be reported as a microphone failure. Resume and verify words are recognized.
6. **Interrupted session:** During reading switch tabs/apps briefly, return and continue. Repeat with screen lock, an incoming call or another app using the microphone where feasible. Expect recovery or a clear retry/fallback; no misleading claim that permission alone guarantees recognition.
7. **Disconnect or change input:** Unplug the active microphone or change the OS default input while reading. Restore it and retry. Verify that the app either resumes or offers a usable recovery/fallback and does not keep claiming to listen indefinitely.
8. **Permission revoked:** Revoke site or OS permission while reading. Verify fallback and recovery after restoring permission. Browsers may require a reload; record actual behavior.
9. **Repeated transitions:** Read, request word help (speech playback), resume, turn pages, change books, and leave the reader. Verify listening returns after help and no prior book's listener interferes. Check the OS microphone indicator turns off after leaving.
10. **Language and connectivity:** Read English and Spanish books in their respective languages. Repeat with network disconnected and, for Chromebook, with school filtering/policy applied. Record whether the browser's recognition service works and whether its failure is explained/recoverable; an offline cached book does not imply offline speech recognition.
11. **Unsupported/blocked environment:** Where speech recognition is unavailable or school policy blocks it, confirm tap-for-help remains usable and the adult receives useful guidance.
12. **Layout and accessibility:** At both orientations and common zoom/text sizes, check that permission/retry/fallback controls and instructions remain visible, tappable, keyboard reachable and readable.

## Automated regression checks

From the repository root, install Playwright and its Chromium browser in your development environment, then in separate terminals run:

```sh
python3 -m http.server 8765
node shellfie/tests/microphone.js
node shellfie/tools/test_mic_start.js
node shellfie/tools/test_ios.js
node shellfie/tools/test_feedback.js
```

Set `CHROMIUM_PATH` to an installed Chromium executable if Playwright's browser is unavailable; set `BASE` to override the local URL. These checks simulate recognition events and do not test actual microphone audio or browser speech services. `microphone.js` exits nonzero on failure. The older scripts print their results and must be reviewed for failed checks and browser errors.

13. **Slow permission decision:** On a fresh site permission, wait at least 5 seconds before allowing microphone access. Expect the browser prompt to remain usable without Shellfie interrupting it with a retry screen; then confirm actual reading is recognized.

## Run record

2026-11-07: simulated Chromium on Linux: microphone lifecycle, mic-start, iOS-event, and feedback simulations passed. Device matrix and live audio cases remain open. See the task report for any additional test results and limitations.
