/* Targeted checks: misread distractors, slow sounding-out, microphone watchdog, recent-log copy.
   Usage: (repo root served on :8765) node shellfie/tools/test_feedback.js */
const { chromium } = require("playwright");
const BASE = process.env.BASE || "http://localhost:8765/shellfie/";
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1024, height: 768 }, permissions: ["clipboard-read", "clipboard-write"] });
  const p = await ctx.newPage(); const errs = [];
  p.on("pageerror", e => errs.push(e.message));
  await p.addInitScript(() => {
    window.__SHELLFIE_TEST = 1; window.__SHELLFIE_TIMESCALE = 0.1;
    class F { start() { window.__rec = this; if (window.__micBroken) throw new Error("InvalidStateError"); setTimeout(() => this.onstart && this.onstart(), 5); } abort() { } stop() { } }
    window.webkitSpeechRecognition = F; window.SpeechRecognition = F;
    if (!sessionStorage.getItem("s")) { sessionStorage.setItem("s", 1);
      localStorage.setItem("shellfie_v1", JSON.stringify({ v: 1, lang: "en", grade: "1", onb: 1, b: {}, showRead: 1, under: 1, calm: 1, say: 1,
        prof: { st: "steady", f: [], n: 200, d: new Date().toISOString().slice(0, 10), lock: 1, w: 90, g: 600, e: 1 } })); }
  });
  await p.goto(BASE); await p.waitForTimeout(400);
  const out = await p.evaluate(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms)); const res = {};
    const logTypes = () => JSON.parse(localStorage.getItem("shellfie_devlog") || "[]").map(e => e[1]);
    // 1) misread: "spells" for "spills" (K: Max's First Day, page 10 "Max opens the milk. Oops! The milk spills.")
    await Shellfie.open("en-k-max-first-day", 0, 9); await sleep(60);
    let R = Shellfie.state(); res.page1 = R.words.map(w => w.n + ":" + w.tier).join(" ");
    Shellfie.hear("max opens the milk oops the milk spells", true); await sleep(40);
    R = Shellfie.state();
    const sp = R.words.find(w => w.n === "spills");
    res.misreadCaught = !!(R.ladder && R.ladder.light) || (sp && sp.st === 2);
    res.spillsStateRightAfter = sp ? sp.st : "?";
    Shellfie.hear("spills", true); await sleep(80);   // child self-corrects
    res.selfCorrected = JSON.parse(localStorage.getItem("shellfie_devlog") || "[]").concat(window.__dbuf || []).some(e => e[1] === "light-prompt") || Shellfie.state().words.find(w => w.n === "spills")?.st === 1 || Shellfie.state().completing || Shellfie.state().pg !== 9;
    await sleep(400);
    // 2) correct reading of the same page: no prompt at all
    await Shellfie.open("en-k-max-first-day", 0, 9); await sleep(60);
    Shellfie.hear("max opens the milk oops the milk spills", true); await sleep(60);
    R = Shellfie.state(); res.correctNoPrompt = !R.ladder && (R.sess.light || 0) === 0;
    await sleep(400);
    // 3) slow sounding-out of a Hard word, longer than the hesitation window: no help, then it counts
    let found = null;
    for (const id of ["en-1-meet-elephant", "en-1-meet-octopus", "en-1-meet-sloth", "en-1-be-astronaut"]) {
      for (let pg = 0; pg < 6 && !found; pg++) { await Shellfie.open(id, 0, pg); await sleep(40); const W = Shellfie.state().words; const k = W.findIndex(w => w.tier === "hard" && w.n.length >= 7 && W.indexOf(w) > 2); if (k > 0) found = { id, pg, k, word: W[k].n }; }
      if (found) break;
    }
    res.soundOutWord = found && found.word;
    if (found) {
      await Shellfie.open(found.id, 0, found.pg); await sleep(40);
      R = Shellfie.state();
      Shellfie.hear(R.words.slice(0, found.k).map(w => w.n).join(" "), true); await sleep(30);
      const syl = Shellfie.syllables(found.word, "en");
      const lad0 = R.sess.ladders || 0;
      for (const piece of syl) { Shellfie.hear(piece, true); await sleep(250); Shellfie.hear(piece + piece.slice(-1).repeat(3), false); await sleep(250); }  // stretched sounds too
      res.soundOutLadders = (Shellfie.state().sess.ladders || 0) - lad0;
      res.soundOutWaitedMs = syl.length * 500 * 10;  // real-time equivalent
      Shellfie.hear(syl.join(" "), true); await sleep(60);   // blends it (as pieces)
      res.soundOutAccepted = Shellfie.state().words[found.k].st === 1;
    }
    // 3b) "Your turn": tap a word for help; Shellfie must wait (silence 5 s), keep waiting while sounding out, end when said
    await Shellfie.open("en-1-meet-elephant", 0, 2); await sleep(60);
    R = Shellfie.state(); const tw = R.words.find(w => w.n.length >= 6 && !w.st);
    tw.el.click();
    let t = 0; while (!(Shellfie.state().ladder && Shellfie.state().ladder.yourTurn) && t < 200) { await sleep(10); t++; }
    res.yourTurnStarted = !!Shellfie.state().ladder?.yourTurn;
    await sleep(500);                                   // 5 s of silence (time runs 10x)
    res.stillWaitingAfter5s = !!Shellfie.state().ladder;
    const sy = Shellfie.syllables(tw.n, "en");
    for (const piece of sy) { Shellfie.hear(piece, true); await sleep(250); }   // sounds it out slowly
    res.stillWaitingWhileSoundingOut = !!Shellfie.state().ladder;
    Shellfie.hear(tw.n, true); await sleep(250);
    res.endedWhenSaid = !Shellfie.state().ladder;
    res.yourTurnLog = JSON.parse(localStorage.getItem("shellfie_devlog") || "[]").concat([]).filter(e => e[1] === "your-turn").map(e => JSON.stringify(e[2])).slice(-2).join(" ");
    // 4) microphone dies: watchdog restarts it, then asks the child to tap
    await Shellfie.open("en-1-meet-elephant", 0, 0); await sleep(60);
    Shellfie.hear("meet ellie", true); await sleep(30);
    window.__micBroken = true;
    window.__rec.onend && window.__rec.onend();
    await sleep(2500);
    res.micAskShown = !!document.querySelector("#micAsk");
    window.__micBroken = false;
    const types = logTypes();
    res.watchdogRestarts = JSON.parse(localStorage.getItem("shellfie_devlog") || "[]").filter(e => e[1] === "listener" && e[2].event === "watchdog-restart").length;
    res.logTypes = [...new Set(types)].join(",");
    return res;
  });
  console.log(JSON.stringify(out, null, 1));
  // 5) copy recent logs from the parent area
  await p.evaluate(() => { document.querySelector("#micAsk")?.remove(); history.back(); });
  await p.waitForTimeout(500);
  await p.evaluate(() => { const g = document.querySelector("#gateShelf [data-gate]") || document.querySelector("#gateGrades [data-gate]"); g.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })); });
  await p.waitForTimeout(500);
  await p.click("#pCopyRecent"); await p.waitForTimeout(300);
  const clip = await p.evaluate(() => navigator.clipboard.readText());
  console.log("copied log:", clip.split("\n").length, "lines; head:\n" + clip.split("\n").slice(0, 12).join("\n") + "\n...\n" + clip.split("\n").filter(l => /misread|light-prompt|sounding-out|watchdog|mic /.test(l)).slice(0, 6).join("\n"));
  console.log(errs.length ? "page errors: " + errs.join(" | ") : "no page errors");
  await b.close();
})();
