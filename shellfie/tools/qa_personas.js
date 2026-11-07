/* Shellfie QA reader panel: simulated children reading real Shellfie books aloud, with timing, at every level
   (K–5) in English and Spanish. Each persona turns page text into what a speech recognizer would hear
   (accent / speech sounds / mistakes / pauses) plus everyday recognizer noise (3% dropped, 2% misheard words).

   Modes:  adaptive (default) = a new reader: Shellfie learns the profile over the first ~120 words, then adapts
           fixed              = profile locked to the default "Steady" style with no speech patterns (baseline)
   Reported per run: pages finished, unneeded help per 200 words (help on a word the child was reading fine),
   real stumbles helped, nudges, false skip-refocus, % of time spent in help vs reading, and the profile chosen.

   Usage (repo root served on :8765):  node shellfie/tools/qa_personas.js [--fixed] [--only en|es] [--part i/n]  */
const { chromium } = require("playwright");
const BASE = process.env.BASE || "http://localhost:8765/shellfie/";
const TS = 0.1; // 10× faster than real time; the app scales its timers the same way

const T = {
  speedy:  { label: "Speedy & accurate, stuck on hard words", chunk: [8, 14], gap: [170, 250], hardStuck: .3, stuckMs: 3400, hardMisread: .1 },
  novice:  { label: "Novice: one… word… at… a… time", chunk: [1, 1], gap: [1300, 2600], hardGap: [3200, 5600], soundOut: .35 },
  typical: { label: "Typical, occasional word swaps", chunk: [3, 6], gap: [330, 520], swap: .04, selfFix: .4 },
  aae:     { label: "African American English", chunk: [3, 6], gap: [330, 500], rules: [[/^th/, "d", .8], [/th$/, "f", .7], [/([^aeiou])[tdk]$/, "$1", .5], [/ing$/, "in", .8]] },
  irish:   { label: "Irish accent", chunk: [3, 6], gap: [330, 500], rules: [[/th/g, "t", .8]] },
  boston:  { label: "Boston accent", chunk: [3, 6], gap: [330, 500], rules: [[/([aeiou])r(?![aeiou])/g, "$1h", .9], [/er$/, "a", .8]] },
  chinese: { label: "Chinese American (Mandarin-influenced)", chunk: [3, 6], gap: [360, 560], rules: [[/[^aeiouy]$/, "", .35], [/l/g, "r", .3], [/th/g, "s", .6], [/v/g, "w", .6]] },
  speech:  { label: "Speech-therapy sounds r→w l→w th→f sh→s", chunk: [2, 5], gap: [450, 700], rules: [[/r(?=[aeiou])/g, "w", .9], [/l(?=[aeiou])/g, "w", .6], [/th/g, "f", .7], [/sh/g, "s", .7]] },
  caribe:  { label: "Español caribeño (s aspirada, -ado → -ao)", chunk: [3, 6], gap: [330, 520], rules: [[/s$/, "", .7], [/s(?=[^aeiouáéíóú])/g, "", .6], [/ado$/, "ao", .7]] },
  speechEs:{ label: "Habla: r → l / d (terapia)", chunk: [2, 5], gap: [450, 700], rules: [[/rr/g, "r", .9], [/r(?![aeiouáéíóú])/g, "l", .8], [/^r/, "d", .6], [/(?<=[aeiou])r(?=[aeiou])/g, "l", .5]] }
};
const MATRIX = [
  ["novice", "en", "K"], ["speech", "en", "K"], ["typical", "en", "K"],
  ["novice", "en", "1"], ["typical", "en", "1"], ["aae", "en", "1"],
  ["typical", "en", "2"], ["irish", "en", "2"], ["boston", "en", "2"], ["chinese", "en", "2"],
  ["typical", "en", "3"], ["speedy", "en", "3"],
  ["speedy", "en", "4"], ["typical", "en", "4"],
  ["speedy", "en", "5"], ["aae", "en", "5"],
  ["novice", "es", "K"], ["typical", "es", "K"],
  ["novice", "es", "1"], ["speechEs", "es", "1"],
  ["typical", "es", "2"], ["caribe", "es", "2"],
  ["typical", "es", "3"], ["typical", "es", "4"], ["speedy", "es", "5"]
];

async function run(browser, type, lang, grade, mode) {
  const P = T[type];
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const page = await ctx.newPage(); const errs = [];
  page.on("pageerror", e => errs.push(e.message));
  await page.addInitScript(([mode, grade, lang, TS]) => {
    window.__SHELLFIE_TEST = 1; window.__SHELLFIE_TIMESCALE = TS;
    class F { start() { setTimeout(() => this.onstart && this.onstart(), 5); } abort() { } stop() { } }
    window.webkitSpeechRecognition = F; window.SpeechRecognition = F;
    const today = new Date().toISOString().slice(0, 10);
    const base = { v: 1, lang, grade, onb: 1, b: {}, showRead: 1, under: 1, calm: 1, browse: "grade" };
    if (mode === "fixed") base.prof = { st: "steady", f: [], n: 0, d: today, lock: 1, w: 0, g: 0, e: 0 };
    if (!sessionStorage.getItem("seeded")) { localStorage.setItem("shellfie_v1", JSON.stringify(base)); localStorage.setItem("shellfie_dev", "1"); sessionStorage.setItem("seeded", "1"); }
  }, [mode, grade, lang, TS]);
  await page.goto(BASE); await page.waitForTimeout(300);
  const res = await page.evaluate(async ([P, TS, seedKey, lang, grade]) => {
    const rules = (P.rules || []).map(([re, to, p]) => [new RegExp(re.source, re.flags), to, p]);
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    let seed = 1234 + seedKey.length * 97; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const between = ([a, b]) => a + rnd() * (b - a);
    const speakAs = w => { let t = w; for (const [re, to, p] of rules) if (rnd() < p) t = t.replace(re, to); return t; };
    const asr = t => { const r = rnd(); if (r < .03) return null; if (r < .05 && t.length > 4) return t.slice(0, -2); return t; };
    const out = { pages: 0, done: 0, words: 0, falseHelp: 0, intended: 0, caught: 0, quick: 0, nudges: 0, refocus: 0, readMs: 0, helpMs: 0, profile: null, unfinished: [] };
    // books: readable ones at this level (prefer 3+ pages), 2 books × up to 4 pages
    const books = window.SHELLFIE_CATALOG[lang][grade].filter(e => e.id && e.pc && e.pc[0] >= 3).map(e => e.id);
    const pickBooks = books.length > 2 ? [books[0], books[Math.floor(books.length / 2)], books[books.length - 1]] : books;
    for (const id of pickBooks) for (let pgWant = 0; pgWant < 4; pgWant++) {
      await Shellfie.open(id, 0, pgWant); await sleep(30);
      let R = Shellfie.state(); if (!R || R.pg !== pgWant) continue;
      const pg0 = R.pg, sub0 = R.sub, words = R.words.slice();
      const intended = new Set(); let buf = [];
      const flush = () => { if (buf.length) { Shellfie.hear(buf.join(" "), true); buf = []; } };
      const say = t => { const h = asr(t); if (h) buf.push(h); };
      let chunk = Math.round(between(P.chunk));
      out.pages++; out.words += words.length;
      const t0 = performance.now();
      for (let i = 0; i < words.length; i++) {
        const w = words[i]; const hard = w.tier === "hard" || w.tier === "unique";
        let R2 = Shellfie.state(); if (!R2 || R2.completing || R2.pg !== pg0 || R2.sub !== sub0) break;
        if (R2.words[i] && R2.words[i].st) continue;   // Shellfie already counted it (e.g. after help)
        if (R2.ladder) { flush(); let t = 0; while (Shellfie.state()?.ladder && t < 600) { await sleep(10); t++; if (Shellfie.state()?.ladder?.step === 3 && !Shellfie.state().ladder.quick) Shellfie.hear(w.n, true); } }
        if (P.hardStuck && hard && rnd() < P.hardStuck) { flush(); intended.add(w.i); await sleep(P.stuckMs * TS); }
        if (P.hardMisread && hard && rnd() < P.hardMisread) { intended.add(w.i); say(w.n.slice(0, -2) + "x"); flush(); await sleep(900 * TS); }
        if (P.swap && !hard && w.tier === "normal" && rnd() < P.swap) {
          const other = words.find(x => x.n !== w.n && Math.abs(x.n.length - w.n.length) <= 1 && x.tier !== "easy");
          if (other) { say(other.n); if (rnd() < P.selfFix) say(w.n); }
          else say(speakAs(w.n));
        } else if (P.soundOut && w.n.length >= 6 && rnd() < P.soundOut) {
          flush(); await sleep(between(P.hardGap || P.gap) * TS * .5);
          say(w.n.slice(0, Math.ceil(w.n.length / 2))); flush(); await sleep(700 * TS); say(w.n);
        } else say(speakAs(w.n));
        if (buf.length >= chunk) { flush(); chunk = Math.round(between(P.chunk)); }
        const nx = words[i + 1];
        const gap = (P.hardGap && nx && (nx.tier === "hard" || nx.tier === "unique")) ? between(P.hardGap) : between(P.gap);
        if (gap > 900) flush();
        await sleep(gap * TS);
      }
      flush();
      let t = 0; while (t < 300) { const Rz = Shellfie.state(); if (!Rz || Rz.completing || Rz.pg !== pg0 || Rz.sub !== sub0) break; if (Rz.ladder) { await sleep(10); continue; } await sleep(10); t++; }
      const Rz = Shellfie.state();
      const finished = !Rz || Rz.completing || Rz.pg !== pg0 || Rz.sub !== sub0;
      if (finished) out.done++; else out.unfinished.push(`${id} p${pgWant}: ` + Rz.words.filter(x => !x.st).map(x => x.n).join(" ").slice(0, 70));
      const S = (Rz || R).sess, lad = S.ladderIdx || [];
      const full = lad.length, quick = S.quick || 0;
      out.intended += intended.size; out.caught += lad.filter(k => intended.has(k)).length; out.falseHelp += lad.filter(k => !intended.has(k)).length;
      out.quick += quick; out.nudges += S.nudges || 0; out.refocus += S.refocus || 0;
      out.readMs += (performance.now() - t0) / TS; out.helpMs += full * 6500 + quick * 1500 + (S.nudges || 0) * 1500 + (S.refocus || 0) * 3000;
      if (Rz) { Rz.sess.ladderIdx = []; Rz.sess.nudges = 0; Rz.sess.refocus = 0; Rz.sess.quick = 0; }
      await sleep(900 * TS);
    }
    const pr = JSON.parse(localStorage.getItem("shellfie_v1")).prof;
    out.profile = pr ? `${pr.force || pr.st || "?"}${pr.f && pr.f.length ? " + " + pr.f.join(",") : ""} (${pr.w} wpm, gap ${pr.g} ms, ${pr.n} w)` : "learning…";
    return out;
  }, [{ ...P, rules: (P.rules || []).map(([re, to, p]) => [{ source: re.source, flags: re.flags }, to, p]) }, TS, type + lang + grade, lang, grade]);
  await ctx.close();
  res.errs = errs;
  return res;
}

(async () => {
  const args = process.argv.slice(2);
  const mode = args.includes("--fixed") ? "fixed" : "adaptive";
  const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
  let rows = MATRIX.filter(r => !only || r[1] === only);
  if (args.includes("--part")) { const [i, n] = args[args.indexOf("--part") + 1].split("/").map(Number); rows = rows.filter((_, k) => k % n === i - 1); }
  const browser = await chromium.launch();
  for (const [type, lang, grade] of rows) {
    const r = await run(browser, type, lang, grade, mode);
    const per200 = (r.falseHelp / Math.max(1, r.words) * 200).toFixed(2);
    const helpPct = Math.round(r.helpMs / Math.max(1, r.readMs + r.helpMs) * 100);
    console.log(`${lang} ${grade} ${T[type].label.padEnd(42)} ${mode.padEnd(8)} finished ${r.done}/${r.pages}  unneeded help ${r.falseHelp} (${per200}/200w)  stumbles helped ${r.caught}/${r.intended}  quick-says ${r.quick}  nudges ${r.nudges}  refocus ${r.refocus}  help time ${helpPct}%  profile: ${mode === "fixed" ? "(fixed)" : r.profile}`);
    if (r.unfinished.length) console.log("     unfinished: " + r.unfinished.slice(0, 2).join(" | "));
    if (r.errs.length) console.log("     page errors: " + r.errs.slice(0, 2).join(" | "));
  }
  await browser.close();
})();
