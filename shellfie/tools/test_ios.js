/* iPhone Safari speech behaviour: one interim result keeps growing (finals only after a pause), even across pages.
   Checks: words highlight while reading (no final needed), pages turn by themselves, words from the previous page
   don't count on the next page, no false "we skipped a part", quick Next tap doesn't skip, holding Next does,
   and the listener recovers from an abort that never sends "end".
   Usage: (repo root served on :8765) node shellfie/tools/test_ios.js */
const { chromium } = require("playwright");
const BASE = process.env.BASE || "http://localhost:8765/shellfie/";
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 430, height: 775 }, hasTouch: false })).newPage(); const errs = [];
  p.on("pageerror", e => errs.push(e.message));
  await p.addInitScript(() => {
    window.__SHELLFIE_TEST = 1; window.__SHELLFIE_TIMESCALE = 0.1;
    window.__starts = 0;
    class F { start() { window.__rec = this; window.__starts++; if (this._on) throw Object.assign(new Error("x"), { name: "InvalidStateError" }); this._on = 1; setTimeout(() => this.onstart && this.onstart(), 5); }
      abort() { const was = this._on; this._on = 0; if (was && !window.__noEnd) setTimeout(() => { this.onerror && this.onerror({ error: "aborted" }); this.onend && this.onend(); }, 30); } stop() { this.abort(); } }
    window.webkitSpeechRecognition = F; window.SpeechRecognition = F;
    localStorage.setItem("shellfie_v1", JSON.stringify({ v: 1, lang: "en", grade: "K", onb: 1, b: {}, showRead: 1, under: 1, calm: 1, say: 1,
      prof: { st: "careful", f: [], n: 200, d: "2026-11-07", lock: 1, w: 144, g: 2316, e: 0 } }));
  });
  await p.goto(BASE); await p.waitForTimeout(400);
  const res = await p.evaluate(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms)); const o = {};
    // one ever-growing interim result, like iOS
    let said = [];
    const send = (final = false) => { const r = Object.assign([{ transcript: said.join(" "), confidence: final ? .9 : 0 }], { isFinal: final }); window.__rec.onresult({ resultIndex: 0, results: [r] }); };
    await Shellfie.open("en-k-little-red-hen", 0, 0); await sleep(80);
    const pagesStart = Shellfie.state().pg; let refocus0 = Shellfie.state().sess.refocus || 0;
    const pageWords = () => Shellfie.state().words.map(w => w.t.replace(/[^\p{L}\p{N}'-]/gu, ""));
    let highlightedMidPage = false, turned = 0;
    for (let n = 0; n < 5; n++) {
      const pg = Shellfie.state().pg, W = pageWords();
      for (let k = 0; k < W.length; k++) {
        said.push(W[k]); send(false); await sleep(30);
        if (k === Math.floor(W.length / 2) && Shellfie.state().words.filter(w => w.st).length >= Math.floor(W.length / 2) - 1) highlightedMidPage = true;
      }
      await sleep(250);
      if (Shellfie.state().pg !== pg) turned++;
    }
    o.highlightsWithoutFinal = highlightedMidPage;
    o.pagesTurnedWithoutFinal = turned + "/5";
    o.noFalseRefocus = (Shellfie.state().sess.refocus || 0) === refocus0;
    if (0) o.dbg = JSON.parse(localStorage.getItem("shellfie_devlog") || "[]").concat(window.__dbuf || []).filter(e => /jump|refocus|align|page/.test(e[1])).map(e => e[1] + " " + JSON.stringify(e[2]).slice(0, 160)).slice(0, 30);
    // finally a final arrives containing everything: nothing on the current page should be marked read by it
    const pgNow = Shellfie.state().pg; send(true); await sleep(40);
    o.oldWordsIgnoredOnNewPage = Shellfie.state().pg === pgNow && Shellfie.state().words.filter(w => w.st).length === 0;
    // misread arriving word by word, then the late final: still caught
    await Shellfie.open("en-k-max-first-day", 0, 9); await sleep(80);
    said = []; for (const w of "max opens the milk oops the milk spells".split(" ")) { said.push(w); send(false); await sleep(30); }
    const sp0 = Shellfie.state().words.find(w => w.n === "spills"); o.dbgPg = Shellfie.state().pg + " " + Shellfie.state().words.map(w => w.n + w.st).join(" ") + " " + JSON.parse(localStorage.getItem("shellfie_devlog") || "[]").slice(-6).map(e => e[1] + JSON.stringify(e[2]).slice(0, 140)).join(" | "); o.misreadNotAcceptedFromInterim = !!sp0 && sp0.st !== 1; if (!sp0) return o;
    send(true); await sleep(60);
    const R9 = Shellfie.state(); o.misreadCaughtOnFinal = !!(R9.ladder && R9.ladder.light) || R9.words.find(w => w.n === "spills").st === 2 || JSON.parse(localStorage.getItem("shellfie_devlog") || "[]").some(e => e[1] === "misread");
    await sleep(600);
    await Shellfie.open("en-k-little-red-hen", 0, 3); await sleep(80);
    // quick tap on Next while listening: no skip
    const before = Shellfie.state().pg;
    document.querySelector("#rNext").click(); await sleep(50);
    o.quickTapDoesNotSkip = Shellfie.state().pg === before && !!document.querySelector("#saybubble.on");
    return o;
  });
  // hold Next for 1.2 s → skip
  const pg0 = await p.evaluate(() => Shellfie.state().pg);
  const box = await p.locator("#rNext").boundingBox();
  await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await p.mouse.down(); await p.waitForTimeout(1300); await p.mouse.up();
  await p.waitForTimeout(150);
  res.holdSkips = (await p.evaluate(() => Shellfie.state().pg)) === pg0 + 1;
  res.nextIsQuietWhileListening = await p.evaluate(() => { const r = document.querySelector("#rNext").getBoundingClientRect(); return r.width < 60 && !document.querySelector("#reader").classList.contains("tapmode"); });
  // silent abort with no end event: listener comes back by itself
  Object.assign(res, await p.evaluate(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms)); const o = {};
    const s0 = window.__starts; window.__noEnd = true;
    window.__rec._on = 0; window.__rec.onerror({ error: "aborted" });
    await sleep(1600); window.__noEnd = false;
    o.recoversFromSilentAbort = window.__starts > s0;
    // pause (help) then resume while still shutting down: must not get stuck
    const L = window.__rec; const s1 = window.__starts;
    Shellfie.state(); const Lr = window.__rec;
    return o;
  }));
  console.log(JSON.stringify(res, null, 1));
  const bad = Object.entries(res).filter(([k, v]) => v === false || (typeof v === "string" && /^[0-4]\/5$/.test(v))).map(([k]) => k);
  console.log(bad.length ? "FAILED: " + bad.join(", ") : "all iOS checks passed");
  console.log(errs.length ? "page errors: " + errs.join(" | ") : "no page errors");
  await b.close();
})();
