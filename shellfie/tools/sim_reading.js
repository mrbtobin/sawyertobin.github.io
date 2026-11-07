/* Simulated reading tests for Shellfie's listener logic (no microphone needed).
   Usage: node tools/sim_reading.js [baseUrl]   (serve the repo root first, e.g. python3 -m http.server 8765)
   A: normal reading with recognizer noise (dropped / misheard / extra words) → page should complete with no
      false help prompts and no false "you skipped" refocus.
   B: skipping a paragraph → Shellfie should refocus on the first skipped word after the child finishes a
      sentence; after reading the skipped part the child either rereads the part they already read (B1) or
      jumps past it (B2); the page must complete either way with exactly one refocus.
   C: skipping a single sentence inside a paragraph (same expectations as B). */
const { chromium } = require("playwright");
const BASE = process.argv[2] || "http://localhost:8765/shellfie/";
const BOOKS = ["en-2-uncle-wiggily", "en-3-mother-west-wind", "en-3-velveteen", "en-4-oz", "en-4-heidi", "en-5-secret-garden", "en-5-anne", "en-5-black-beauty",
               "en-1-365-bedtime", "es-5-corazon", "es-4-raton-perez", "es-4-menique", "en-3-just-so", "en-4-alice"];

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1024, height: 768 } });
  const p = await ctx.newPage(); const errs = [];
  p.on("pageerror", e => errs.push(e.message));
  await p.addInitScript(() => {
    window.__SHELLFIE_TEST = 1; window.__SHELLFIE_TIMESCALE = 0.1;
    class F { start() { setTimeout(() => this.onstart && this.onstart(), 5); } abort() { } stop() { } }
    window.webkitSpeechRecognition = F; window.SpeechRecognition = F;
    localStorage.setItem("shellfie_v1", JSON.stringify({ v: 1, lang: "en", grade: "3", onb: 1, b: {}, showRead: 1, under: 1, browse: "grade" }));
  });
  await p.goto(BASE); await p.waitForTimeout(400);
  const [DROP0, MIS0, EX0] = (process.env.NOISE || "0.04,0.03,0.02").split(",").map(Number);
  const res = await p.evaluate(async ([BOOKS, DROP, MISHEAR, EXTRA]) => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    let seed = 42; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const out = { A: { pages: 0, done: 0, ladders: 0, refocus: 0, words: 0 }, B1: { n: 0, refocusOnce: 0, refocusRight: 0, done: 0 }, B2: { n: 0, refocusOnce: 0, refocusRight: 0, done: 0 }, C: { n: 0, refocusOnce: 0, done: 0 }, fails: [] };
    const fillers = ["um", "uh", "the", "and"];
    function noisy(words) {
      const o = [];
      for (const w of words) {
        const r = rnd();
        if (r < DROP) continue;                                  // recognizer drops a word
        if (r < DROP + MISHEAR) { o.push(w.length > 4 ? w.slice(0, -2) : w + "s"); continue; } // mishears
        o.push(w);
        if (rnd() < EXTRA) o.push(fillers[Math.floor(rnd() * fillers.length)]); // extra word
      }
      return o;
    }
    async function feed(list, opts = {}) {
      // speak words in result chunks of 3–6 words; stop early if a refocus happens
      let i = 0;
      while (i < list.length) {
        const n = 3 + Math.floor(rnd() * 4); const chunk = list.slice(i, i + n); i += n;
        const R = Shellfie.state(); if (!R || R.completing) return "done";
        const before = R.sess.refocus || 0;
        Shellfie.hear(chunk.join(" "), true);
        await sleep(5);
        const R2 = Shellfie.state();
        if (opts.stopOnRefocus && R2 && (R2.sess.refocus || 0) > before) { await sleep(120); return "refocus"; }
      }
      return "end";
    }
    const pageDone = (R0, pg0, sub0) => { const R = Shellfie.state(); return !R || R.completing || R.pg !== pg0 || R.sub !== sub0; };
    for (const id of BOOKS) {
      await Shellfie.open(id, 0, 0); await sleep(50);
      let R = Shellfie.state(); if (!R) { out.fails.push(id + " did not open"); continue; }
      const book = R.s;
      // pick up to 4 pages per book spread through chapter 0..2
      const cands = [];
      book.chapters.slice(0, 3).forEach((c, ci) => c.pages.forEach((_, pi) => cands.push([ci, pi])));
      const pick = cands.filter((_, k) => k % Math.max(1, Math.floor(cands.length / 6)) === 0).slice(0, 6);
      for (const [ci, pi] of pick) {
        // ── A: normal reading with noise
        await Shellfie.open(id, ci, pi); await sleep(20); R = Shellfie.state();
        const pg0 = R.pg, sub0 = R.sub; const lad0 = R.sess.ladders || 0, ref0 = R.sess.refocus || 0;
        const words = R.words.map(w => w.n); out.A.pages++; out.A.words += words.length;
        await feed(noisy(words));
        await sleep(30);
        let Rn = Shellfie.state();
        if (pageDone(R, pg0, sub0)) out.A.done++;
        else out.fails.push(`A ${id} c${ci}p${pi}: not complete; unread=${Rn.words.filter(w => !w.st).map(w => w.n).join(" ").slice(0, 120)}`);
        out.A.ladders += ((Rn?.sess.ladders) || 0) - lad0; out.A.refocus += ((Rn?.sess.refocus) || 0) - ref0;
        await sleep(700);
        // ── B: skip a whole paragraph (pages with ≥3 real paragraphs)
        for (const mode of ["B1", "B2"]) {
          await Shellfie.open(id, ci, pi); await sleep(20); R = Shellfie.state();
          const paras = [...new Set(R.words.map(w => w.para))];
          const byP = q => R.words.filter(w => w.para === q);
          if (paras.length < 3 || byP(paras[1]).length < 5 || byP(paras[2]).length < 4) continue;
          out[mode].n++;
          const pg1 = R.pg, sub1 = R.sub;
          await feed(byP(paras[0]).map(w => w.n));                         // read paragraph 1
          const skipFirst = byP(paras[1])[0].i;
          const after = R.words.filter(w => w.para >= paras[2]).map(w => w.n);
          const r1 = await feed(after, { stopOnRefocus: true });           // jump to paragraph 3 and keep going
          const Rr = Shellfie.state();
          const ok1 = (Rr.sess.refocus || 0) === 1;
          const right = ok1 && Shellfie.state().anchor <= skipFirst;
          if (ok1) out[mode].refocusOnce++; if (right) out[mode].refocusRight++;
          await feed(byP(paras[1]).map(w => w.n));                         // read the skipped paragraph
          await sleep(20);
          let Rx = Shellfie.state();
          if (!pageDone(Rx, pg1, sub1)) {
            if (mode === "B1") await feed(after);                          // reread what they already read, then go on
            else await feed(Rx.words.filter(w => !w.st && w.i > skipFirst).map(w => w.n)); // go straight to new words
          }
          await sleep(30);
          if (pageDone(null, pg1, sub1)) out[mode].done++;
          else { const Rz = Shellfie.state(); out.fails.push(`${mode} ${id} c${ci}p${pi}: not complete (refocus=${Rz.sess.refocus}); unread=${Rz.words.filter(w => !w.st).map(w => w.n).join(" ").slice(0, 100)}`); }
          await sleep(700);
        }
        // ── C: skip one sentence (≥5 words) in the middle of the page
        await Shellfie.open(id, ci, pi); await sleep(20); R = Shellfie.state();
        const sents = [...new Set(R.words.map(w => w.sent))];
        const bySent = q => R.words.filter(w => w.sent === q);
        const mid = sents.find((q, k) => k >= 1 && k < sents.length - 1 && bySent(q).length >= 5 && bySent(sents[k + 1]).length >= 4);
        if (mid != null) {
          out.C.n++; const pg2 = R.pg, sub2 = R.sub;
          await feed(R.words.filter(w => w.sent < mid).map(w => w.n));
          const rest = R.words.filter(w => w.sent > mid).map(w => w.n);
          await feed(rest, { stopOnRefocus: true });
          if ((Shellfie.state().sess.refocus || 0) === 1) out.C.refocusOnce++;
          await feed(bySent(mid).map(w => w.n));
          await sleep(10);
          if (!pageDone(null, pg2, sub2)) { const Rx = Shellfie.state(); await feed(Rx.words.filter(w => !w.st && w.sent > mid).map(w => w.n)); }
          await sleep(30);
          if (pageDone(null, pg2, sub2)) out.C.done++; else out.fails.push(`C ${id} c${ci}p${pi}: not complete`);
          await sleep(700);
        }
      }
    }
    return out;
  }, [BOOKS, DROP0, MIS0, EX0]);
  console.log(`noise: drop ${DROP0}, mishear ${MIS0}, extra ${EX0}`);
  const A = res.A;
  console.log(`A normal+noise: ${A.done}/${A.pages} pages completed; false help prompts ${A.ladders} (${(A.ladders / A.words * 200).toFixed(2)} per 200 words); false refocus ${A.refocus}`);
  for (const k of ["B1", "B2"]) console.log(`${k} skip paragraph (${k === "B1" ? "rereads" : "jumps past"} the part already read): refocused once ${res[k].refocusOnce}/${res[k].n}, on the right word ${res[k].refocusRight}/${res[k].n}, completed ${res[k].done}/${res[k].n}`);
  console.log(`C skip one sentence: refocused once ${res.C.refocusOnce}/${res.C.n}, completed ${res.C.done}/${res.C.n}`);
  if (res.fails.length) console.log("first failures:\n  " + res.fails.slice(0, 12).join("\n  "));
  console.log(errs.length ? "page errors: " + errs.slice(0, 3).join(" | ") : "no page errors");
  await b.close();
})();
