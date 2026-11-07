/* Microphone start checks (the "it isn't hearing me at all" bug).
   1. An old saved "tap" engine setting is forgotten: books open listening.
   2. A recognizer that never starts (iOS without a tap) → the big microphone button appears; tapping it starts listening.
   3. "Read without the microphone" → tap-for-help for this book, and no "we skipped a part" refocus in tap mode.
   Usage: (repo root served on :8765) node shellfie/tools/test_mic_start.js */
const { chromium } = require("playwright");
const BASE = process.env.BASE || "http://localhost:8765/shellfie/";
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 932, height: 430 } })).newPage(); const errs = [];
  p.on("pageerror", e => errs.push(e.message));
  await p.addInitScript(() => {
    window.__SHELLFIE_TEST = 1; window.__SHELLFIE_TIMESCALE = 0.1;
    class F { start() { window.__rec = this; if (!window.__silent) setTimeout(() => this.onstart && this.onstart(), 5); } abort() { } stop() { } }
    window.webkitSpeechRecognition = F; window.SpeechRecognition = F;
    localStorage.setItem("shellfie_engine", "tap");   // what older versions saved after a failed mic check
    localStorage.setItem("shellfie_v1", JSON.stringify({ v: 1, lang: "en", grade: "1", onb: 1, b: {}, showRead: 1, under: 1, calm: 1, say: 1,
      prof: { st: "steady", f: [], n: 200, d: "2026-11-07", lock: 1, w: 90, g: 600, e: 1 } }));
  });
  await p.goto(BASE); await p.waitForTimeout(400);
  const res = {};
  Object.assign(res, await p.evaluate(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms)); const o = {};
    o.oldTapSettingCleared = localStorage.getItem("shellfie_engine") === null;
    await Shellfie.open("en-k-max-first-day", 0, 0); await sleep(80);
    o.listeningWithOldSetting = Shellfie.state().tap === false && !!window.__rec;
    window.__silent = true;                                  // next recognizer never starts
    await Shellfie.open("en-k-max-first-day", 0, 1); await sleep(400);   // 4 s real time
    o.micButtonShown = !!document.querySelector("#micAskBtn");
    window.__silent = false;
    return o;
  }));
  if (res.micButtonShown) await p.click("#micAskBtn");
  await p.waitForTimeout(100);
  Object.assign(res, await p.evaluate(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms)); const o = {};
    o.listeningAfterTap = !document.querySelector("#micAsk") && Shellfie.state().tap === false;
    // 3) read without the mic: tap mode, then reach the end with words unread → no refocus
    window.__silent = true;
    await Shellfie.open("en-1-meet-elephant", 0, 1); await sleep(400);
    document.querySelector("#micSkipBtn")?.click(); await sleep(30);
    const R = Shellfie.state(); o.tapModeAfterSkip = R.tap === true && !document.querySelector("#micAsk");
    R.anchor = R.words.length; Shellfie.hear("", true); await sleep(200);
    o.noRefocusInTapMode = (Shellfie.state().sess.refocus || 0) === 0 && !Shellfie.state().focusing;
    window.__silent = false;
    // 4) next book tries the microphone again
    await Shellfie.open("en-1-meet-elephant", 0, 2); await sleep(80);
    o.nextBookListens = Shellfie.state().tap === false;
    o.micLog = JSON.parse(localStorage.getItem("shellfie_devlog") || "[]").filter(e => e[1] === "mic").map(e => e[2].state || e[2].permission).join(" > ");
    return o;
  }));
  console.log(JSON.stringify(res, null, 1));
  const bad = Object.entries(res).filter(([k, v]) => v === false).map(([k]) => k);
  console.log(bad.length ? "FAILED: " + bad.join(", ") : "all mic-start checks passed");
  console.log(errs.length ? "page errors: " + errs.join(" | ") : "no page errors");
  await b.close();
})();
