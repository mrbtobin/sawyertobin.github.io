/* Shellfie — bilingual read-aloud buddy (K–5).
   Milestones covered: reader shell (i18n, grade selector, bookshelf, paged reader, flips, tap-for-help ladder)
   + Listener v1 (Web Speech backend, alignment, tiers, page completion, teardown) + progress & parent report. */
(() => {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const h = (s) => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const now = () => Date.now();
const ts36 = () => Math.floor(Date.now() / 1000).toString(36);
const from36 = (s) => new Date(parseInt(s, 36) * 1000);
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const GRADES = ["K", "1", "2", "3", "4", "5"];
const GI = (g) => GRADES.indexOf(g);
const STORIES = Object.fromEntries(window.SHELLFIE_STORIES.map(s => [s.id, s]));
const CATALOG = window.SHELLFIE_CATALOG;

/* ───────────── Strings (two complete language worlds) ───────────── */
const STR = {
  en: {
    arcTop: "READ ALOUD", arcBot: "WITH SHELLFIE", letsRead: "Let's read!",
    tagline: "Read out loud. I'll follow along and help with tricky words.",
    micCheck: "Say hi to Shellfie!", micDenied: "I can't hear you yet, so tap any word and I'll help. Grown-ups: allow the microphone in the browser's site settings to turn on listening.",
    noRec: "This browser can't listen yet, so tap any word and I'll help. Grown-ups: Chrome, Edge or Safari can listen.",
    pickGrade: "Pick your grade", pickGradeSub: "Then pick a story and read it out loud!",
    gradeShort: { K: "K", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5" },
    gradeLong: { K: "Kindergarten", 1: "1st grade", 2: "2nd grade", 3: "3rd grade", 4: "4th grade", 5: "5th grade" },
    shelfTitle: g => `${STR.en.gradeLong[g]} bookshelf`, genreTitle: g => STR.en.genres[g],
    holdGate: "Grown-ups: press and hold", showRead: "Show books I've read", byGrade: "Grade → Genre", byGenre: "Genre → Grade",
    genres: { fairy: "Fairy and Folk Tales", fables: "Fables", animal: "Animal Stories", everyday: "Everyday Life", adventure: "Adventure and Fantasy", poetry: "Poetry and Rhymes", nonfiction: "Nonfiction", seasons: "Seasons and Holidays" },
    soon: "Soon", soonToast: "Coming soon! Shellfie is still learning this book.", allRead: "You read them all!", books: n => `${n} books`,
    yourGrade: "Your grade", picks: "Shellfie picks", picksGo: "Read", resume: "Keep going", page: (a, b) => `Page ${a} of ${b}`,
    ready: "Ready when you are", keepReading: "Keep reading", waitThis: "Wait, this one!", yourTurn: "Your turn!",
    praise: ["Great job!", "Nice reading!", "You got it!", "Wow!", "Super!"], selfFix: "Nice fix!", tapMode: "Tap any word for help", listeningOff: "Shellfie is listening",
    quiz: "Quick questions", qOf: (a, b) => `Question ${a} of ${b}`, next: "Next", seeAnswer: "Here's the answer:",
    youDidIt: "You did it!", chapterDone: "Chapter done!", shellsEarned: "Shells earned", nailed: "Words you nailed", tricky: "Tricky words to try again",
    readAgain: "Read it again", nextBook: "Next book", nextChapter: "Next chapter", home: "Home", myShells: "My shell collection",
    streak: n => `${n}-day streak`, streakLbl: "Reading streak", shells: n => `${n} shells`, special: "Special shells", pageShells: "Page shells", noneYet: "Read a whole book to win its special shell!",
    keepGoing: "Keep going", chapter: "Chapter", skipped: "Read the skipped pages to win this book's special shell.",
    grownups: "For grown-ups",
    p: {
      report: "Reading report", minutes: "Minutes read", booksDone: "Books finished", pages: "Pages read", acc: "Best accuracy (avg)", wcpm: "Words correct / min",
      booksT: "Books", title: "Title", status: "Status", best: "Best", last: "Last", times: "Times", done: "Finished", inprog: "Reading", quizT: "Comprehension", score: "Score", date: "Date",
      practice: "Words to practice", word: "Word", count: "Times helped", lastSeen: "Last", helped: "What helped", log: "Help log (latest)", step: "Step",
      noData: "Nothing yet. Reading data shows up here after the first page.",
      settings: "Settings", underline: "Dotted underline on hard words (K–2)", lang: "Language", listen: "Listening", engine: "Engine", voice: "Voice",
      eLocal: "On-device speech recognition. Audio stays on this device.", eCloud: "Browser speech recognition. This browser sends audio to its maker's speech service to turn it into text. Shellfie never stores or uploads recordings.",
      eTap: "Listening is off (no microphone or no speech support). Tap-for-help mode: tapping Next counts a page as read.",
      install: "Download on-device speech", installing: "Downloading…", installed: "On-device speech ready",
      noVoice: "No Mexican Spanish voice found on this device. Install one (iOS/macOS: Settings → Accessibility → Spoken Content → Voices → Spanish (Mexico)) for the best Spanish help.",
      privacy: "Privacy", privacyText: "No ads, no tracking, no accounts. Progress is saved only in this browser (a small cookie plus local storage). Recordings are never stored.",
      tip: "Tip", tipText: "On iPhone or iPad, tap Share → Add to Home Screen. Installed web apps keep their saved progress longer.",
      backup: "Backup", exp: "Export progress", imp: "Import progress", reset: "Erase all progress", resetQ: "Erase all reading progress on this device?", imported: "Progress imported", bad: "That file isn't a Shellfie backup",
      scaff: { syl: "syllables", snd: "sound it out", spell: "spelling", say: "hearing the word", self: "self-corrected" }
    }
  },
  es: {
    arcTop: "LEE EN VOZ ALTA", arcBot: "CON SHELLFIE", letsRead: "¡A leer!",
    tagline: "Lee en voz alta. Yo te sigo y te ayudo con las palabras difíciles.",
    micCheck: "¡Saluda a Shellfie!", micDenied: "Todavía no te escucho; toca cualquier palabra y te ayudo. Adultos: permitan el micrófono en la configuración del sitio del navegador para activar la escucha.",
    noRec: "Este navegador todavía no puede escuchar; toca cualquier palabra y te ayudo. Adultos: Chrome, Edge o Safari sí pueden escuchar.",
    pickGrade: "Elige tu grado", pickGradeSub: "¡Luego elige un cuento y léelo en voz alta!",
    gradeShort: { K: "K", 1: "1.º", 2: "2.º", 3: "3.º", 4: "4.º", 5: "5.º" },
    gradeLong: { K: "Kínder", 1: "1.er grado", 2: "2.º grado", 3: "3.er grado", 4: "4.º grado", 5: "5.º grado" },
    shelfTitle: g => `Librero de ${STR.es.gradeLong[g]}`, genreTitle: g => STR.es.genres[g],
    holdGate: "Adultos: mantengan presionado", showRead: "Mostrar libros leídos", byGrade: "Grado → Género", byGenre: "Género → Grado",
    genres: { fairy: "Cuentos de hadas y folclor", fables: "Fábulas", animal: "Historias de animales", everyday: "La vida diaria", adventure: "Aventura y fantasía", poetry: "Poesía y rimas", nonfiction: "No ficción", seasons: "Temporadas y fiestas" },
    soon: "Pronto", soonToast: "¡Muy pronto! Shellfie todavía está aprendiendo este libro.", allRead: "¡Los leíste todos!", books: n => `${n} libros`,
    yourGrade: "Tu grado", picks: "Shellfie te recomienda", picksGo: "Leer", resume: "Seguir", page: (a, b) => `Página ${a} de ${b}`,
    ready: "Cuando quieras", keepReading: "Seguir leyendo", waitThis: "¡Espera, esta!", yourTurn: "¡Ahora tú!",
    praise: ["¡Muy bien!", "¡Qué bien lees!", "¡Lo lograste!", "¡Guau!", "¡Súper!"], selfFix: "¡Bien corregido!", tapMode: "Toca una palabra para recibir ayuda", listeningOff: "Shellfie te escucha",
    quiz: "Preguntas rápidas", qOf: (a, b) => `Pregunta ${a} de ${b}`, next: "Siguiente", seeAnswer: "Esta es la respuesta:",
    youDidIt: "¡Lo lograste!", chapterDone: "¡Terminaste el capítulo!", shellsEarned: "Caparazones ganados", nailed: "Palabras que leíste solito", tricky: "Palabras para practicar",
    readAgain: "Leer otra vez", nextBook: "Otro libro", nextChapter: "Siguiente capítulo", home: "Inicio", myShells: "Mi colección de caparazones",
    streak: n => `${n} días seguidos`, streakLbl: "Racha de lectura", shells: n => `${n} caparazones`, special: "Caparazones especiales", pageShells: "Caparazones de página", noneYet: "¡Lee un libro completo para ganar su caparazón especial!",
    keepGoing: "Seguir", chapter: "Capítulo", skipped: "Lee las páginas que saltaste para ganar el caparazón especial de este libro.",
    grownups: "Para adultos",
    p: {
      report: "Reporte de lectura", minutes: "Minutos de lectura", booksDone: "Libros terminados", pages: "Páginas leídas", acc: "Mejor precisión (promedio)", wcpm: "Palabras correctas / min",
      booksT: "Libros", title: "Título", status: "Estado", best: "Mejor", last: "Última", times: "Veces", done: "Terminado", inprog: "Leyendo", quizT: "Comprensión", score: "Puntaje", date: "Fecha",
      practice: "Palabras para practicar", word: "Palabra", count: "Veces con ayuda", lastSeen: "Última vez", helped: "Qué ayudó", log: "Registro de ayuda (reciente)", step: "Paso",
      noData: "Todavía no hay datos. Aparecen aquí después de la primera página.",
      settings: "Configuración", underline: "Subrayado punteado en palabras difíciles (K–2)", lang: "Idioma", listen: "Escucha", engine: "Motor", voice: "Voz",
      eLocal: "Reconocimiento de voz en el dispositivo. El audio no sale de este dispositivo.", eCloud: "Reconocimiento de voz del navegador. Este navegador envía el audio al servicio de voz de su fabricante para convertirlo en texto. Shellfie nunca guarda ni sube grabaciones.",
      eTap: "La escucha está apagada (sin micrófono o sin soporte de voz). Modo de tocar para ayuda: tocar Siguiente cuenta la página como leída.",
      install: "Descargar voz en el dispositivo", installing: "Descargando…", installed: "Voz en el dispositivo lista",
      noVoice: "No se encontró una voz de español de México en este dispositivo. Instala una (iOS/macOS: Configuración → Accesibilidad → Contenido leído → Voces → Español (México)) para la mejor ayuda en español.",
      privacy: "Privacidad", privacyText: "Sin anuncios, sin rastreo, sin cuentas. El progreso se guarda solo en este navegador (una pequeña cookie y almacenamiento local). Nunca se guardan grabaciones.",
      tip: "Consejo", tipText: "En iPhone o iPad, toca Compartir → Agregar a pantalla de inicio. Las apps web instaladas conservan el progreso por más tiempo.",
      backup: "Respaldo", exp: "Exportar progreso", imp: "Importar progreso", reset: "Borrar todo el progreso", resetQ: "¿Borrar todo el progreso de lectura en este dispositivo?", imported: "Progreso importado", bad: "Ese archivo no es un respaldo de Shellfie",
      scaff: { syl: "sílabas", snd: "sonidos", spell: "deletreo", say: "escuchar la palabra", self: "se corrigió solo" }
    }
  }
};
const GENRE_ORDER = ["fairy", "fables", "animal", "everyday", "adventure", "poetry", "nonfiction", "seasons"];
const GENRE_STYLE = {
  fairy: ["#c3a2ff", "#5b3fc9", "🧚"], fables: ["#ffd27a", "#d9731f", "🦊"], animal: ["#86e8bd", "#1e7a45", "🐾"], everyday: ["#9ddcff", "#2470c9", "🏡"],
  adventure: ["#ffab98", "#c2410c", "🧭"], poetry: ["#ffb3dc", "#c2337a", "🎵"], nonfiction: ["#c4ec7c", "#4b7d18", "🔬"], seasons: ["#ffc387", "#b8452b", "🍂"]
};
const GRADE_GLOW = { K: "#9ff0c8", 1: "#d9f79a", 2: "#b8e6ff", 3: "#ffd8a8", 4: "#ffc4e6", 5: "#d6c8ff" };

/* ───────────── Tuning (Section 4, starting values; one table per grade) ───────────── */
const TUNE = {
  sim: { easy: .5, normal: .62, unique: .72, hard: .8 },
  hesitate: { K: 4000, 1: 3700, 2: 3400, 3: 3000, 4: 2700, 5: 2500 },
  window: { K: 6, 1: 6, 2: 10, 3: 10, 4: 15, 5: 15 },
  selfFix: { K: 3000, 1: 3000, 2: 3000, 3: 2000, 4: 2000, 5: 2000 },
  hardSyl: { K: 3, 1: 3, 2: 4, 3: 4, 4: 5, 5: 5 },
  hardLen: { K: 7, 1: 7, 2: 9, 3: 9, 4: 11, 5: 11 },
  idlePause: 15000,
  font: { K: [44, 72, 1.5], 1: [34, 56, 1.55], 2: [28, 44, 1.6], 3: [24, 36, 1.6], 4: [21, 30, 1.65], 5: [19, 26, 1.6] }
};

/* ───────────── Storage: cookie shellfie_v1 (+ localStorage mirror) and a localStorage log ───────────── */
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } }
};
function readCookie() {
  try { const m = document.cookie.match(/(?:^|;\s*)shellfie_v1=([^;]+)/); return m ? JSON.parse(decodeURIComponent(m[1])) : null; } catch { return null; }
}
const defaultLang = (navigator.language || "en").toLowerCase().startsWith("es") ? "es" : "en";
let P = Object.assign({ v: 1, lang: defaultLang, grade: null, browse: "grade", genre: "fairy", showRead: 1, under: 1, onb: 0, b: {} }, LS.get("shellfie_v1", {}), readCookie() || {});
function saveP() {
  LS.set("shellfie_v1", P);
  try { document.cookie = "shellfie_v1=" + encodeURIComponent(JSON.stringify(P)) + ";max-age=31536000;path=/;SameSite=Lax" + (location.protocol === "https:" ? ";Secure" : ""); } catch { }
}
let L = Object.assign({ help: [], counts: {}, sec: 0, quiz: [], shells: 0, sp: [], streak: { d: "", n: 0 }, pr: {}, wc: {}, runs: {} }, LS.get("shellfie_log", {}));
function saveL() {
  if (L.help.length > 2000) L.help = L.help.slice(-2000); // older entries already rolled into per-word counts
  LS.set("shellfie_log", L);
}
const T = () => STR[P.lang];

/* ───────────── Text tools: normalize, phonetic keys, syllables, tiers ───────────── */
const NUMW = {
  en: "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty".split(" "),
  es: "cero uno dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince dieciséis diecisiete dieciocho diecinueve veinte".split(" ")
};
const CONTR = { "don't": "do not", "can't": "cannot", "won't": "will not", "i'm": "i am", "it's": "it is", "i'll": "i will", "let's": "let us", "didn't": "did not", "isn't": "is not", "you're": "you are", "we'll": "we will", "she's": "she is", "he's": "he is", "that's": "that is", "what's": "what is", "there's": "there is", "couldn't": "could not", "wasn't": "was not" };
function norm(w, lang) {
  w = w.toLowerCase().replace(/[’‘`]/g, "'").replace(/[^\p{L}\p{N}']/gu, "").replace(/^'+|'+$/g, "");
  if (/^\d+$/.test(w) && +w <= 20) return NUMW[lang][+w];
  return w.replace(/'/g, "");
}
function stripAcc(w) { return w.normalize("NFD").replace(/[̀-ͯ]/g, ""); }
function keyEn(w) {
  w = w.replace(/[^a-z]/g, ""); if (!w) return "";
  w = w.replace(/^kn|^gn|^pn|^wr/, m => m[1]).replace(/tch/g, "ch").replace(/ph/g, "f").replace(/ck/g, "k").replace(/c(?=[eiy])/g, "s").replace(/c/g, "k")
    .replace(/q/g, "k").replace(/x/g, "ks").replace(/z/g, "s").replace(/dg/g, "j").replace(/gh(?![aeiou])/g, "").replace(/wh/g, "w").replace(/sh/g, "X").replace(/th/g, "0");
  return (w[0] + w.slice(1).replace(/[aeiouyhw]/g, "")).replace(/(.)\1+/g, "$1");
}
function keyEs(w) {
  w = stripAcc(w).replace(/[^a-z]/g, ""); if (!w) return "";
  w = w.replace(/ch/g, "X").replace(/h/g, "").replace(/qu/g, "k").replace(/gu(?=[ei])/g, "G").replace(/g(?=[ei])/g, "j").replace(/G/g, "g").replace(/ll/g, "y").replace(/v/g, "b")
    .replace(/z/g, "s").replace(/c(?=[ei])/g, "s").replace(/c/g, "k").replace(/rr/g, "r").replace(/y$/, "i");
  return w.replace(/(.)\1+/g, "$1");
}
const key = (w, lang) => lang === "es" ? keyEs(w) : keyEn(w);
function lev(a, b) {
  if (a === b) return 0; const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i), cur = new Array(n + 1);
  for (let i = 1; i <= m; i++) { cur[0] = i; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); [prev, cur] = [cur, prev]; }
  return prev[n];
}
const ratio = (a, b) => 1 - lev(a, b) / Math.max(a.length, b.length, 1);
function sim(hn, w, lang) {
  if (!hn || !w.n) return 0;
  if (hn === w.n) return 1;
  const a = lang === "es" ? stripAcc(hn) : hn, b = lang === "es" ? stripAcc(w.n) : w.n;
  if (a === b) return 1;
  if (b.length <= 2 || a.length <= 2) return 0;
  const k = key(hn, lang);
  return Math.max(ratio(a, b), k && w.k ? ratio(k, w.k) * .95 : 0);
}

/* Syllables. Spanish rules are regular; English is a heuristic split (vowel groups, blends and digraphs kept together). */
const ES_V = "aeiouáéíóúü", ES_STRONG = "aeoáéíóú", ES_INSEP = ["pl", "bl", "fl", "cl", "gl", "pr", "br", "fr", "cr", "gr", "tr", "dr", "kl", "kr"];
function sylEs(word) {
  const lw = word.toLowerCase(); const units = []; // [text, isVowel]
  for (let i = 0; i < word.length; i++) {
    const two = lw.slice(i, i + 2);
    if (two === "ch" || two === "ll" || two === "rr") { units.push([word.slice(i, i + 2), 0]); i++; continue; }
    if (two === "qu" || (two === "gu" && "eéií".includes(lw[i + 2] || ""))) { units.push([word.slice(i, i + 2), 0]); i++; continue; }
    units.push([word[i], ES_V.includes(lw[i]) ? 1 : (/\p{L}/u.test(lw[i]) ? 0 : 2)]);
  }
  const out = []; let cur = "", i = 0;
  while (i < units.length) {
    cur += units[i][0];
    if (units[i][1] === 1) {
      let j = i + 1; while (j < units.length && units[j][1] === 1) {
        const a = units[j - 1][0].toLowerCase(), b = units[j][0].toLowerCase();
        if (ES_STRONG.includes(a) && ES_STRONG.includes(b)) break; // hiatus
        cur += units[j][0]; j++;
      }
      if (j < units.length && units[j][1] === 1) { out.push(cur); cur = ""; i = j; continue; }
      let k = j; while (k < units.length && units[k][1] === 0) k++;
      const cons = units.slice(j, k).map(u => u[0]); const hasNextV = k < units.length && units[k][1] === 1;
      if (!hasNextV) { cur += units.slice(j).map(u => u[0]).join(""); out.push(cur); cur = ""; break; }
      let keep = 0; const n = cons.length, pair = (a, b) => ES_INSEP.includes((a + b).toLowerCase());
      if (n === 0) keep = 0; else if (n === 1) keep = 0; else if (n === 2) keep = pair(cons[0], cons[1]) ? 0 : 1;
      else if (n === 3) keep = pair(cons[1], cons[2]) ? 1 : 2; else keep = 2;
      cur += cons.slice(0, keep).join(""); out.push(cur); cur = cons.slice(keep).join(""); i = j + cons.length; continue;
    }
    i++;
  }
  if (cur) { if (out.length) out[out.length - 1] += cur; else out.push(cur); }
  return out.filter(Boolean);
}
const EN_BLEND = ["bl", "br", "cl", "cr", "dr", "fl", "fr", "gl", "gr", "pl", "pr", "sc", "sk", "sl", "sm", "sn", "sp", "st", "sw", "tr", "tw", "ch", "sh", "th", "ph", "wh", "qu", "wr", "kn"];
function sylEn(word) {
  const w = word.toLowerCase(); const isV = (c, i) => "aeiou".includes(c) || (c === "y" && i > 0);
  const groups = []; let i = 0;
  while (i < w.length) { if (isV(w[i], i)) { let j = i; while (j < w.length && isV(w[j], j)) j++; groups.push([i, j]); i = j; } else i++; }
  if (groups.length > 1) { const lg = groups[groups.length - 1]; if (lg[0] === w.length - 1 && w.endsWith("e") && !/[^aeiou]le$/.test(w) && lg[1] - lg[0] === 1) groups.pop(); }
  if (/[^aeiouy]ed$/.test(w) && !/[td]ed$/.test(w) && groups.length > 1) groups.pop();
  if (groups.length <= 1) return [word];
  const cuts = [];
  for (let g = 0; g < groups.length - 1; g++) {
    const a = groups[g][1], b = groups[g + 1][0]; const cons = w.slice(a, b); let cut;
    if (cons.length <= 1) cut = a;
    else if (cons.length === 2) cut = cons === "ck" ? b : (EN_BLEND.includes(cons) ? a : a + 1);
    else cut = EN_BLEND.includes(cons.slice(-2)) ? b - 2 : a + 1;
    if (/[^aeiou]le$/.test(w) && g === groups.length - 2) cut = w.length - 3;
    cuts.push(cut);
  }
  const out = []; let p = 0; for (const c of cuts) { if (c > p && c < w.length) { out.push(word.slice(p, c)); p = c; } } out.push(word.slice(p));
  return out.filter(Boolean);
}
const syllables = (word, lang) => lang === "es" ? sylEs(word) : sylEn(word);

const EASY = {
  en: new Set("a an and the i to is it in on of he she we me my you was for at his her they be but not all so up do go no can will with this that had as by are have from or one look see get did big little run come here there out down what who him them then into like said yes am if us our your its were has went too".split(" ")),
  es: new Set("el la los las un una unos unas y a de en con por que se su sus no es lo le les me mi te tu yo al del muy más pero como para ya sí hay era fue dijo todo todos día él ella mamá papá casa sol luna o ni este esta eso esa son va voy ver así bien mal".split(" "))
};
const IRREG = new Set("said was were what where eight the one two once some come done does of you your they there their who could would should through though thought laugh friend again any many people island answer beautiful enough busy sure heart touch young school great break eye ocean".split(" "));

function tierFor(w, idx, grade, lang, sentStart) {
  const raw = w.t.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
  if (!w.n) return "easy";
  if (EASY[lang].has(w.n)) return "easy";
  const cap = /^\p{Lu}/u.test(raw), allCaps = raw.length > 1 && raw === raw.toUpperCase() && /\p{L}/u.test(raw);
  if ((cap && !sentStart && raw !== "I") || /-/.test(raw) || allCaps) return "unique";
  const syl = syllables(raw, lang).length;
  if (syl >= TUNE.hardSyl[grade] || raw.length >= TUNE.hardLen[grade] || (lang === "en" && GI(grade) <= 2 && IRREG.has(w.n) && raw.length >= 5)) return "hard";
  if (w.n.length <= 3 && syl === 1) return "easy";
  return "normal";
}

/* Tokenize a page into lines of words with tiers and sentence ids */
function tokenize(text, grade, lang) {
  const lines = text.split("\n"); const words = []; let sent = 0, start = true; const html = [];
  for (const line of lines) {
    const toks = line.split(/\s+/).filter(Boolean); const parts = [];
    for (const t of toks) {
      const n = norm(t, lang);
      if (!n) { parts.push(`<span class="pw">${h(t)}</span>`); continue; }
      const w = { t, n, k: key(n, lang), st: 0, sent, i: words.length };
      w.tier = tierFor(w, words.length, grade, lang, start);
      start = false;
      parts.push(`<span class="w" data-i="${w.i}">${h(t)}</span>`); words.push(w);
      if (/[.!?…]["”»)]*$/.test(t) || /[.!?]["”»]?$/.test(t)) { sent++; start = true; }
    }
    html.push(`<p>${parts.join(" ")}</p>`);
  }
  // cap Hard words at ~8% of the page; demote the least hard
  const hard = words.filter(w => w.tier === "hard");
  const cap = Math.max(1, Math.round(words.length * .08));
  if (hard.length > cap) hard.sort((a, b) => syllables(b.t, lang).length - syllables(a.t, lang).length || b.n.length - a.n.length).slice(cap).forEach(w => w.tier = "normal");
  return { words, html: html.join("") };
}

/* ───────────── Audio: one AudioContext (unlocked by a tap), UI sounds, speech synthesis ───────────── */
let AC = null;
function ac() { if (!AC || AC.state === "closed") { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch { AC = null; } } if (AC && AC.state === "suspended") AC.resume(); return AC; }
function tone(freqs, { type = "sine", dur = .12, gap = .07, vol = .18 } = {}) {
  const c = ac(); if (!c) return; let t = c.currentTime + .01;
  for (const f of freqs) { const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .015); g.gain.exponentialRampToValueAtTime(.001, t + dur); o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + .02); t += gap; }
}
const SFX = {
  chirp: () => tone([660, 990, 1320], { type: "triangle", dur: .1, gap: .08 }),
  sparkle: () => tone([1568, 2093, 2637], { type: "triangle", dur: .09, gap: .05, vol: .1 }),
  shell: () => tone([880, 1320], { type: "sine", dur: .18, gap: .1, vol: .14 }),
  yay: () => tone([523, 659, 784, 1047, 1319], { type: "triangle", dur: .16, gap: .09, vol: .14 }),
  soft: () => tone([392, 330], { type: "sine", dur: .14, gap: .1, vol: .1 }),
  flip(back) {
    const c = ac(); if (!c) return; const len = .38, buf = c.createBuffer(1, c.sampleRate * len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 1.6);
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = buf; f.type = "bandpass"; f.Q.value = .9;
    const t = c.currentTime; f.frequency.setValueAtTime(back ? 700 : 2600, t); f.frequency.exponentialRampToValueAtTime(back ? 2400 : 650, t + len); g.gain.value = .22;
    s.connect(f).connect(g).connect(c.destination); s.start(t);
  }
};
let VOICES = [];
function loadVoices() { try { VOICES = speechSynthesis.getVoices() || []; } catch { VOICES = []; } }
if ("speechSynthesis" in window) { loadVoices(); speechSynthesis.addEventListener?.("voiceschanged", loadVoices); }
function pickVoice(lang) {
  const want = lang === "es" ? ["es-MX", "es-US", "es-419"] : ["en-US"];
  const good = /natural|neural|premium|enhanced|paulina|mónica|monica|dalia|jorge|samantha|google/i;
  const score = v => { const l = v.lang.replace("_", "-"); let s = 0; const ix = want.findIndex(x => l.toLowerCase() === x.toLowerCase()); if (ix < 0) return -1; s += (3 - ix) * 10; if (v.localService) s += 3; if (good.test(v.name)) s += 4; return s; };
  let best = null, bs = -1; for (const v of VOICES) { const s = score(v); if (s > bs) { bs = s; best = v; } }
  if (!best && lang === "es") best = VOICES.find(v => /^es[-_]/i.test(v.lang) && !/es[-_]ES/i.test(v.lang)) || null; // never es-ES
  return best;
}
function speak(text, { rate = .9, lang = P.lang } = {}) {
  return new Promise(res => {
    if (!("speechSynthesis" in window)) return res();
    try {
      const u = new SpeechSynthesisUtterance(text); const v = pickVoice(lang); if (v) u.voice = v; u.lang = v ? v.lang : (lang === "es" ? "es-MX" : "en-US"); u.rate = rate; u.pitch = 1.05;
      let done = false; const fin = () => { if (!done) { done = true; res(); } };
      u.onend = fin; u.onerror = fin; setTimeout(fin, 1800 + text.length * 140 / rate);
      speechSynthesis.speak(u);
    } catch { res(); }
  });
}

/* ───────────── Listener: one interface, swappable backends (Web Speech now; Vosk slot later) ───────────── */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
class WebSpeechListener {
  constructor(lang, onResult, onActivity) {
    this.lang = lang; this.onResult = onResult; this.onActivity = onActivity; this.active = false; this.paused = false; this.fails = 0; this.local = false;
    const r = this.rec = new SR(); r.lang = lang === "es" ? "es-MX" : "en-US"; r.continuous = true; r.interimResults = true; r.maxAlternatives = 3;
    r.onresult = e => { this.fails = 0; this.onResult(e); };
    r.onspeechstart = () => this.onActivity?.("speech");
    r.onstart = () => this.onActivity?.("start");
    r.onerror = e => { if (e.error === "not-allowed" || e.error === "service-not-allowed") { this.active = false; this.onActivity?.("denied"); } else if (e.error !== "no-speech" && e.error !== "aborted") this.fails++; };
    r.onend = () => { this.onActivity?.("end"); if (this.active && !this.paused && this.fails < 6) setTimeout(() => { if (this.active && !this.paused) this._start(); }, 120); };
  }
  async start(uniqueWords = []) {
    this.active = true;
    try {
      if (SR.available) {
        const st = await SR.available({ langs: [this.rec.lang], processLocally: true });
        if (st === "available") { this.rec.processLocally = true; this.local = true; }
      }
    } catch { }
    this.setPhrases(uniqueWords);
    this._start();
  }
  setPhrases(words) {
    // Bias only Unique words (names, rare nouns). Never Hard words: biasing would "hear" them even when misread.
    try { if (window.SpeechRecognitionPhrase && words.length) this.rec.phrases = words.slice(0, 40).map(w => new SpeechRecognitionPhrase(w, 3)); } catch { }
  }
  _start() { try { this.rec.start(); } catch { } }
  pause() { this.paused = true; try { this.rec.abort(); } catch { } }
  resume() { if (!this.active) return; this.paused = false; this._start(); }
  async destroy() { this.active = false; this.paused = true; try { this.rec.onend = null; this.rec.onresult = null; this.rec.abort(); } catch { } this.rec = null; }
}
function engineInfo() {
  if (!SR) return "tap";
  const e = LS.get("shellfie_engine", null);
  return e || "webspeech";
}

/* ───────────── Mascot ───────────── */
function turtleSVG(cls = "") {
  return `<svg class="turtle ${cls}" viewBox="-16 0 232 158" aria-hidden="true">
  <path class="wave w1" d="M16 84Q5 100 16 116"/><path class="wave w2" d="M3 74Q-12 100 3 126"/>
  <path class="wave w1" d="M184 84Q195 100 184 116"/><path class="wave w2" d="M197 74Q212 100 197 126"/>
  <path class="foot" d="M50 112V134a12 12 0 0 0 24 0V112"/><path class="foot" d="M126 112V134a12 12 0 0 0 24 0V112"/>
  <path class="shell" d="M30 118A70 90 0 0 1 170 118Z"/>
  <path class="ln" d="M69.2 95.6L36.4 80.3M84.6 79.7L64.5 40.3M115.4 79.7L135.5 40.3M130.8 95.6L163.6 80.3"/>
  <g class="head"><circle class="face" cx="100" cy="110" r="34"/>
    <g class="eyes"><line class="eye" x1="89" y1="99" x2="89" y2="108"/><line class="eye" x1="111" y1="99" x2="111" y2="108"/></g>
    <path class="ln eyes-closed" d="M82 104q7 6 14 0M104 104q7 6 14 0" style="stroke-width:6"/>
    <circle class="cheek" cx="78" cy="118" r="6"/><circle class="cheek" cx="122" cy="118" r="6"/>
    <path class="mouth" d="M88 116Q100 120 112 116Q109 133 100 133Q91 133 88 116Z"/></g>
  <g class="bubble"><rect x="150" y="2" width="56" height="30" rx="15" fill="#fff" stroke="#10221a" stroke-width="5"/><circle cx="166" cy="17" r="4" fill="#10221a"/><circle cx="178" cy="17" r="4" fill="#10221a"/><circle cx="190" cy="17" r="4" fill="#10221a"/></g>
  <g class="zz" font-family="Fredoka,sans-serif" font-weight="700" fill="#1e5a2b"><text x="150" y="40" font-size="26">z</text><text x="170" y="22" font-size="34">Z</text></g>
</svg>`;
}
function mountTurtles(root = document) {
  $$("[data-turtle]", root).forEach(el => { if (!el.firstChild) el.innerHTML = turtleSVG(el.dataset.turtle === "sleep" ? "sleeping" : ""); });
}
function mood(el, state) {
  const t = el?.querySelector?.(".turtle") || el; if (!t) return;
  t.classList.remove("listening", "following", "thinking", "celebrating", "sleeping");
  if (state) { void t.getBoundingClientRect(); t.classList.add(...state.split(" ")); }
}

/* ───────────── UI helpers ───────────── */
let toastT;
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 2600); }
function confetti(n = 46) {
  if (REDUCED) return; const c = document.createElement("div"); c.className = "confetti";
  for (let i = 0; i < n; i++) {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg"); s.setAttribute("viewBox", "0 0 64 64");
    s.innerHTML = '<use href="#i-shell"/>'; const el = document.createElement("i"); el.appendChild(s);
    el.style.left = Math.random() * 100 + "vw"; el.style.setProperty("--dx", (Math.random() * 30 - 15) + "vw"); el.style.setProperty("--rot", (Math.random() * 720 - 360) + "deg");
    el.style.animationDuration = 1.8 + Math.random() * 1.6 + "s"; el.style.animationDelay = Math.random() * .5 + "s"; el.style.transform = `scale(${.6 + Math.random() * .8})`; c.appendChild(el);
  }
  document.body.appendChild(c); setTimeout(() => c.remove(), 4200);
}
function applyI18n() {
  document.documentElement.lang = P.lang === "es" ? "es-MX" : "en";
  $$("[data-i18n]").forEach(el => { const v = T()[el.dataset.i18n]; if (typeof v === "string") el.textContent = v; });
}
let SCREEN = null;
function show(id) {
  $$(".screen").forEach(s => s.hidden = s.id !== id); SCREEN = id;
  const sc = $("#" + id + " .scroll"); if (sc && id !== "shelf") sc.scrollTop = 0;
}

/* Parent gate: press and hold 1.2 s */
function bindGate(gate) {
  const btn = gate.querySelector("[data-gate]"); let t = null;
  const start = e => { e.preventDefault(); gate.classList.add("holding"); t = setTimeout(() => { gate.classList.remove("holding"); openParent(); }, 1200); };
  const stop = () => { if (t) { clearTimeout(t); t = null; } gate.classList.remove("holding"); };
  btn.addEventListener("pointerdown", start); ["pointerup", "pointerleave", "pointercancel"].forEach(ev => btn.addEventListener(ev, stop));
  btn.addEventListener("click", e => { e.preventDefault(); gate.classList.add("tip"); setTimeout(() => gate.classList.remove("tip"), 1800); });
  btn.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openParent(); } });
}

/* ───────────── Progress helpers ───────────── */
const bookState = id => P.b[id] || null;           // [status 1=reading 2=done, chapter, page, best, last]
function setBook(id, patch) { const b = P.b[id] || [1, 0, 0, null, null]; Object.entries(patch).forEach(([k, v]) => b[+k] = v); P.b[id] = b; saveP(); }
function pagesRead(id) { return L.pr[id] || (L.pr[id] = {}); }
function markPageRead(id, ch, pg) { const pr = pagesRead(id); (pr[ch] = pr[ch] || []); if (!pr[ch].includes(pg)) pr[ch].push(pg); saveL(); }
function storyComplete(s) { const pr = L.pr[s.id] || {}; return s.chapters.every((c, ci) => (pr[ci] || []).length >= c.pages.length); }
function firstUnread(s) { const pr = L.pr[s.id] || {}; for (let ci = 0; ci < s.chapters.length; ci++) for (let pi = 0; pi < s.chapters[ci].pages.length; pi++) if (!(pr[ci] || []).includes(pi)) return [ci, pi]; return [0, 0]; }
function bumpStreak() {
  const d = new Date(); const today = d.toISOString().slice(0, 10); if (L.streak.d === today) return;
  const y = new Date(d - 864e5).toISOString().slice(0, 10); L.streak.n = L.streak.d === y ? L.streak.n + 1 : 1; L.streak.d = today; saveL();
}
function streakNow() { const today = new Date().toISOString().slice(0, 10), y = new Date(Date.now() - 864e5).toISOString().slice(0, 10); return (L.streak.d === today || L.streak.d === y) ? L.streak.n : 0; }
function logHelp(word, id, step, how) {
  const t = ts36(); L.help.push([word, id, t, step, how]);
  const c = L.counts[word] || (L.counts[word] = { n: 0, f: t, l: t, how: {} }); c.n++; c.l = t; c.how[how] = (c.how[how] || 0) + 1; saveL();
}

/* ───────────── Onboarding ───────────── */
function initOnboard() {
  show("onboard"); mood($("#onboard [data-turtle]"), "");
  $("#letsRead").onclick = async () => {
    ac(); SFX.chirp(); // the tap unlocks audio playback
    try { navigator.storage?.persist?.(); } catch { }
    const lvl = $(".miclevel"), bar = lvl.querySelector("i"), hero = $("#onboard [data-turtle]");
    let ok = false;
    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        ok = true; lvl.hidden = false; $("#letsRead").hidden = true; mood(hero, "listening");
        $("#onboard p").textContent = T().micCheck;
        const c = ac(), src = c.createMediaStreamSource(stream), an = c.createAnalyser(); an.fftSize = 512; src.connect(an);
        const data = new Uint8Array(an.fftSize); const t0 = now(); const eyes = hero.querySelector(".eyes");
        await new Promise(res => {
          const tick = () => {
            an.getByteTimeDomainData(data); let s = 0; for (const v of data) s += (v - 128) ** 2; const rms = Math.sqrt(s / data.length) / 50;
            const l = Math.min(1, rms * 2.2); bar.style.width = (l * 100) + "%"; eyes.style.transform = `translateY(${-l * 6}px)`;
            if (now() - t0 < 3000) requestAnimationFrame(tick); else res();
          }; tick();
        });
        stream.getTracks().forEach(t => t.stop()); src.disconnect();
      } catch { ok = false; }
    }
    if (!SR || !ok) {
      LS.set("shellfie_engine", "tap");
      $("#micHint").hidden = false; $("#micHint").textContent = !SR ? T().noRec : T().micDenied;
      $("#letsRead").hidden = false; $("#letsRead").onclick = finish; return;
    }
    LS.set("shellfie_engine", "webspeech");
    finish();
  };
  function finish() { P.onb = 1; saveP(); SFX.yay(); goGrades(); }
}

/* ───────────── Grade selector ───────────── */
function goGrades(push = true) {
  applyI18n(); show("grades");
  const sw = $("#langSwitch"); sw.classList.toggle("es", P.lang === "es");
  $$("button", sw).forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === P.lang));
  $("#gradeGrid").innerHTML = GRADES.map(g => {
    const cnt = (CATALOG[P.lang][g] || []).filter(b => b.id && bookState(b.id)?.[0] === 2).length;
    return `<button class="grade-tile" data-g="${g}" style="--c:${GRADE_GLOW[g]}" aria-label="${h(T().gradeLong[g])}">
      ${P.grade === g ? `<span class="ribbon">★</span>` : ""}<span class="num">${h(T().gradeShort[g])}</span><span class="lbl">${h(T().gradeLong[g])}</span>
      ${cnt ? `<span class="chip" style="position:relative">✓ ${cnt}</span>` : ""}</button>`;
  }).join("");
  const special = L.sp.length;
  $("#statsRow").innerHTML = `<button class="stat" id="toShells"><svg class="ico"><use href="#i-shell"/></svg>${h(T().shells(L.shells + special))}</button>` +
    (streakNow() ? `<span class="stat"><svg class="ico"><use href="#i-flame"/></svg>${h(T().streak(streakNow()))}</span>` : "");
  $("#toShells").onclick = () => { ac(); goCollection(); };
  mountTurtles($("#grades"));
}
function bindGrades() {
  $("#langSwitch").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b || b.dataset.lang === P.lang) return;
    P.lang = b.dataset.lang; saveP(); ac(); SFX.chirp(); goGrades();
  });
  $("#gradeGrid").addEventListener("click", e => {
    const b = e.target.closest(".grade-tile"); if (!b) return; ac(); SFX.soft();
    P.grade = b.dataset.g; saveP(); history.pushState({ s: "shelf" }, ""); goShelf();
  });
}

/* ───────────── Bookshelf ───────────── */
const MONTH = () => new Date().getMonth();
const SEASON_MONTHS = { halloween: [9, 10], muertos: [9, 10], thanksgiving: [10], diwali: [9, 10], winter: [11], reyes: [0], lunar: [0, 1], spring: [2, 3, 4], fall: [8, 9, 10], independencia: [8] };
const inSeason = s => (SEASON_MONTHS[s] || []).includes(MONTH());
function coverHTML(b, g) {
  const st = b.id ? bookState(b.id) : null, story = b.id ? STORIES[b.id] : null;
  const [c1, c2, gi] = GENRE_STYLE[b.g];
  const done = st?.[0] === 2, prog = st?.[0] === 1;
  const cls = ["book", !b.id && "soon", done && "read"].filter(Boolean).join(" ");
  const acc = done && st[3] != null ? st[3] : null;
  const pg = prog ? (() => { let n = 0; for (let ci = 0; ci < st[1]; ci++) n += story.chapters[ci].pages.length; return n + st[2] + 1; })() : 0;
  return `<button class="${cls}" data-id="${b.id || ""}" data-g="${g}" title="${h(b.t)}">
    <div class="cover" style="--cv:linear-gradient(160deg,${c1},${c2})">
      ${b.star ? `<span class="star">⭐</span>` : ""}${!b.id ? `<span class="tag">${h(T().soon)}</span>` : ""}
      <span class="em">${story?.icon || gi}</span><span class="ttl">${h(b.t)}</span></div>
    ${done ? `<svg class="badge" viewBox="0 0 48 48"><circle cx="24" cy="24" r="21" fill="#fff" stroke="#10221a" stroke-width="3"/>
      ${acc != null ? `<circle cx="24" cy="24" r="17" fill="none" stroke="#f5b72e" stroke-width="4" stroke-dasharray="${(acc * 106.8).toFixed(1)} 200" transform="rotate(-90 24 24)" stroke-linecap="round"/>` : ""}
      <use href="#i-shell" x="11" y="10" width="26" height="26"/><path d="M30 33l3 3 6-7" fill="none" stroke="#1e7a45" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ""}
    ${prog ? `<span class="ribbon">${pg}</span>` : ""}
    <div class="by">${h(b.a)}</div></button>`;
}
function sortShelf(list) {
  return list.map((b, i) => [b, i]).sort((x, y) => {
    const sa = x[0].s && inSeason(x[0].s) ? 0 : 1, sb = y[0].s && inSeason(y[0].s) ? 0 : 1;
    if (sa !== sb) return sa - sb;
    const ra = x[0].id ? 0 : 1, rb = y[0].id ? 0 : 1; if (ra !== rb) return ra - rb;
    return x[1] - y[1];
  }).map(x => x[0]);
}
function shelfRow(title, list, g, extra = "") {
  let books = sortShelf(list);
  if (!P.showRead) books = books.filter(b => !(b.id && bookState(b.id)?.[0] === 2));
  const inner = books.length ? books.map(b => coverHTML(b, g)).join("") : `<div class="all-read">${turtleSVG("celebrating")}${h(T().allRead)}</div>`;
  return `<section class="shelf"><h3 ${extra}>${h(title)} <span class="count">${h(T().books(list.length))}</span></h3><div class="row">${inner}</div></section>`;
}
function picksFor(g) {
  const list = (CATALOG[P.lang][g] || []).filter(b => b.id);
  return list.find(b => bookState(b.id)?.[0] === 1) || list.find(b => b.s && inSeason(b.s) && bookState(b.id)?.[0] !== 2) || list.find(b => bookState(b.id)?.[0] !== 2) || list[0];
}
function goShelf() {
  applyI18n(); show("shelf"); const t = T(), g = P.grade || "K";
  $$("#browseSeg button").forEach(b => { b.textContent = b.dataset.browse === "grade" ? t.byGrade : t.byGenre; b.setAttribute("aria-pressed", P.browse === b.dataset.browse); });
  $("#showReadToggle").setAttribute("aria-checked", !!P.showRead);
  const chips = $("#genreChips"); chips.hidden = P.browse !== "genre";
  let html = "";
  const pick = picksFor(g);
  if (pick && P.browse === "grade") {
    const st = bookState(pick.id);
    html += `<button class="picks" data-id="${pick.id}">${turtleSVG()}<div><small>${h(t.picks)}</small><strong>${h(pick.t)}</strong></div><span class="btn go" style="min-height:46px;font-size:17px;padding:0 18px">${h(st?.[0] === 1 ? t.resume : t.picksGo)}</span></button>`;
  }
  if (P.browse === "grade") {
    $("#shelfTitle").textContent = t.shelfTitle(g);
    const books = CATALOG[P.lang][g] || [];
    for (const gn of GENRE_ORDER) { const list = books.filter(b => b.g === gn); if (list.length) html += shelfRow(t.genres[gn], list, g); }
  } else {
    chips.innerHTML = GENRE_ORDER.map(gn => `<button data-genre="${gn}" aria-pressed="${P.genre === gn}">${GENRE_STYLE[gn][2]} ${h(t.genres[gn])}</button>`).join("");
    $("#shelfTitle").textContent = t.genres[P.genre];
    const order = [g, ...GRADES.filter(x => x !== g)];
    for (const gr of order) {
      const list = (CATALOG[P.lang][gr] || []).filter(b => b.g === P.genre); if (!list.length) continue;
      html += shelfRow(t.gradeLong[gr], list, gr, gr === g ? `class="mine" data-mine="${h(t.yourGrade)}"` : "");
    }
  }
  const sc = $("#shelfScroll"); sc.innerHTML = html;
}
function bindShelf() {
  $("#shelfBack").onclick = () => history.back();
  $("#browseSeg").onclick = e => { const b = e.target.closest("button"); if (!b) return; P.browse = b.dataset.browse; saveP(); goShelf(); };
  $("#showReadToggle").onclick = () => { P.showRead = P.showRead ? 0 : 1; saveP(); goShelf(); };
  $("#genreChips").onclick = e => { const b = e.target.closest("button"); if (!b) return; P.genre = b.dataset.genre; saveP(); goShelf(); };
  $("#shelfScroll").addEventListener("click", e => {
    const b = e.target.closest(".book,.picks"); if (!b) return; ac();
    if (!b.dataset.id) { SFX.soft(); toast(T().soonToast); return; }
    openBook(b.dataset.id);
  });
}

/* ───────────── Reader ───────────── */
let R = null, LISTENER = null, tickT = null, hiddenT = null;
function openBook(id, { restart = false, ch: atCh = null } = {}) {
  const s = STORIES[id]; if (!s) return;
  const st = bookState(id);
  let ch = 0, pg = 0;
  if (atCh != null) ch = atCh;
  else if (!restart && st && st[0] === 1) { ch = st[1] || 0; pg = st[2] || 0; }
  if (ch >= s.chapters.length) { ch = 0; pg = 0; }
  if (pg >= s.chapters[ch].pages.length) pg = 0;
  setBook(id, { 0: st?.[0] || 1, 1: ch, 2: pg });
  R = { s, ch, pg, sub: 0, parts: null, words: [], anchor: 0, tent: new Set(), ladder: null, epoch: 0, processed: -1, lastProg: now(), started: false, completing: false, sentNotified: new Set(),
    tap: engineInfo() === "tap" || !SR, sess: { c: 0, h: 0, shells: 0, sec: 0, nailed: new Set(), helped: [], pages: 0, t0: now() } };
  if (["reader", "quiz", "results"].includes(SCREEN)) history.replaceState({ s: "reader" }, ""); else history.pushState({ s: "reader" }, "");
  show("reader"); mountTurtles($("#reader"));
  $("#rTitle").textContent = s.title; $("#rShells span").textContent = L.shells + L.sp.length;
  $("#rMode").hidden = !R.tap; $("#rMode").textContent = T().tapMode;
  renderPage();
  if (!R.tap) startListening();
  clearInterval(tickT); tickT = setInterval(tick, 250);
}
function startListening() {
  try {
    LISTENER = new WebSpeechListener(P.lang, onSpeech, onActivity);
    LISTENER.start(uniqueWords());
    mood($("#rAvatar"), "listening");
  } catch { R.tap = true; $("#rMode").hidden = false; }
}
function uniqueWords() { return R ? R.words.filter(w => w.tier === "unique").map(w => w.t.replace(/[^\p{L}\p{N}'-]/gu, "")) : []; }
function onActivity(kind) {
  if (!R) return;
  if (kind === "start") { R.epoch = 0; R.processed = -1; }
  if (kind === "speech") { R.heard = now(); }
  if (kind === "denied") { R.tap = true; LS.set("shellfie_engine", "tap"); $("#rMode").hidden = false; mood($("#rAvatar"), ""); }
}
function teardown() {
  // Release every listening resource: recognizer, mic, audio graph, speech, timers, story data.
  clearInterval(tickT); tickT = null; clearTimeout(hiddenT);
  if (LISTENER) { LISTENER.destroy(); LISTENER = null; }
  try { speechSynthesis.cancel(); } catch { }
  if (AC) { try { AC.close(); } catch { } AC = null; }
  if (R) { flushTime(); R = null; }
  $("#help").hidden = true; $("#help").innerHTML = ""; $("#rPause").hidden = true; $("#pageText").innerHTML = "";
}
function flushTime() { if (!R) return; L.sec += Math.round(R.sess.sec); R.sess.sec = 0; saveL(); }

function chapterPages() { return R.s.chapters[R.ch].pages; }
function totalPages() { return R.s.chapters.reduce((a, c) => a + c.pages.length, 0); }
function pageNumber() { let n = 0; for (let i = 0; i < R.ch; i++) n += R.s.chapters[i].pages.length; return n + R.pg; }
function splitPage(full, g, lang) {
  // Auto-fit (Section 11): if a page only fits a small screen below the grade's size floor, split it at sentence boundaries.
  const pt = $("#pageText"), floor = TUNE.font[g][0] * .85;
  const fitSize = txt => { pt.className = "page-text"; pt.innerHTML = `<div class="inner">${tokenize(txt, g, lang).html}</div>`; fitText(pt, g); return parseFloat(pt.style.fontSize); };
  if (full.includes("\n") || fitSize(full) >= floor) return [full];
  const sents = full.match(/[^.!?…]+[.!?…]+["”»]?\s*|[^.!?…]+$/g) || [full];
  for (let k = 2; k <= sents.length; k++) {
    const per = full.split(/\s+/).length / k, parts = []; let cur = "", n = 0;
    for (const s of sents) { const wc = s.trim().split(/\s+/).length; if (cur && n + wc / 2 > per && parts.length < k - 1) { parts.push(cur.trim()); cur = ""; n = 0; } cur += s; n += wc; }
    if (cur.trim()) parts.push(cur.trim());
    if (parts.every(p => fitSize(p) >= floor)) return parts;
  }
  return sents.map(x => x.trim()).filter(Boolean);
}
function renderPage(dir = 0, sub = 0) {
  const s = R.s, g = s.grade, full = chapterPages()[R.pg];
  const pt = $("#pageText");
  const doFlip = dir !== 0;
  let leaf;
  if (doFlip) {
    leaf = document.createElement("div"); leaf.className = "leaf";
    if (dir > 0) leaf.innerHTML = `<div class="page-text ${pt.className.replace("page-text", "")}" style="${pt.getAttribute("style") || ""}">${pt.innerHTML}</div>`;
  }
  R.parts = splitPage(full, g, s.lang); R.sub = sub === "last" ? R.parts.length - 1 : Math.min(sub, R.parts.length - 1);
  const text = R.parts[R.sub], isPoem = text.includes("\n");
  const { words, html } = tokenize(text, g, s.lang);
  pt.className = "page-text" + (isPoem ? " poem" : "") + (P.under && GI(g) <= 2 ? " dots" : "");
  pt.innerHTML = `<div class="inner">${html}</div>`;
  R.words = words; R.anchor = 0; R.tent.clear(); R.started = false; R.completing = false; R.sentNotified.clear(); R.lastProg = now(); R.pageT0 = now(); R.ladder = null;
  words.forEach(w => w.el = pt.querySelector(`[data-i="${w.i}"]`));
  if (R.s.chapters[R.ch].title && R.pg === 0 && R.sub === 0) pt.querySelector(".inner").insertAdjacentHTML("afterbegin", `<p style="font-size:.6em;font-family:var(--ui);font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--forest-3);margin-bottom:.6em">${h(T().chapter)} ${R.ch + 1} · ${h(R.s.chapters[R.ch].title)}</p>`);
  fitText(pt, g);
  if (doFlip) {
    if (dir < 0) leaf.innerHTML = `<div class="${pt.className}" style="${pt.getAttribute("style") || ""}">${pt.innerHTML}</div>`;
    $("#stage").appendChild(leaf); SFX.flip(dir < 0);
    leaf.classList.add(REDUCED ? (dir > 0 ? "slide-f" : "slide-b") : (dir > 0 ? "fwd" : "back"));
    setTimeout(() => leaf.remove(), REDUCED ? 360 : 540);
  }
  updateCursor(); updateProgress();
  $("#rPrev").disabled = R.ch === 0 && R.pg === 0 && R.sub === 0;
  LISTENER?.setPhrases(uniqueWords());
  setBook(R.s.id, { 1: R.ch, 2: R.pg });
}
function fitText(pt, g) {
  // phone → tablet: the range's min size on a ~380px phone, its max on a ~1000px tablet; shrink only if the page overflows
  const [min, max, lh] = TUNE.font[g]; const k = Math.min(1, Math.max(0, (Math.min(innerWidth, innerHeight * 1.4) - 380) / 620));
  let lo = Math.round(min * .75), hi = Math.round(min + (max - min) * k); pt.style.lineHeight = lh;
  const fits = sz => { pt.style.fontSize = sz + "px"; return pt.scrollHeight <= pt.clientHeight + 1 && pt.firstElementChild.scrollWidth <= pt.clientWidth + 1; };
  if (fits(hi)) return;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (fits(mid)) lo = mid; else hi = mid; }
  if (!fits(lo)) { let z = lo; while (z > 12 && !fits(z)) z--; }
}
function updateProgress() { const frac = (R.sub + (R.completing ? 1 : 0)) / (R.parts?.length || 1); $("#rProg").style.width = ((pageNumber() + frac) / totalPages() * 100) + "%"; }
function cursorIndex() {
  // the next word to read: first unread word at/after the anchor; pending Hard/Unique words before it pulse
  for (let i = R.anchor; i < R.words.length; i++) if (!R.words[i].st && !R.tent.has(i)) return i;
  const pend = R.words.find(w => !w.st && (w.tier === "hard" || w.tier === "unique")); return pend ? pend.i : -1;
}
function updateCursor() {
  if (!R) return; const c = cursorIndex();
  R.words.forEach(w => {
    w.el.classList.toggle("next", w.i === c);
    w.el.classList.toggle("read", w.st === 1); w.el.classList.toggle("helped", w.st === 2);
    w.el.classList.toggle("tent", !w.st && R.tent.has(w.i));
    w.el.classList.toggle("hard", w.tier === "hard");
    w.el.classList.toggle("pending", !w.st && w.i < R.anchor && (w.tier === "hard" || w.tier === "unique"));
  });
}

/* Alignment: match hypothesis words into a lookahead window from the anchor (tier-weighted), with a whole-page fallback for skipped lines. */
function align(hyps, start) {
  const words = R.words, win = TUNE.window[R.s.grade], lang = R.s.lang, marks = [], subs = [];
  let p = start;
  // pending Hard/Unique words before the anchor (child went back to a skipped word)
  const pend = words.filter(w => !w.st && w.i < start && (w.tier === "hard" || w.tier === "unique"));
  for (let i = 0; i < hyps.length; i++) {
    let best = -1, bs = 0, used = 1;
    for (const w of pend) { const s = sim(hyps[i], w, lang); if (s >= TUNE.sim[w.tier] && s > bs) { best = w.i; bs = s; } }
    if (best >= 0) { marks.push(best); continue; }
    for (let k = p; k < Math.min(words.length, p + win); k++) {
      for (let j = 1; j <= 3 && i + j <= hyps.length; j++) {
        const hw = j === 1 ? hyps[i] : hyps.slice(i, i + j).join("");
        const s = sim(hw, words[k], lang);
        if (s >= TUNE.sim[words[k].tier]) { const sc = s - (k - p) * .05 - (j - 1) * .02; if (sc > bs) { bs = sc; best = k; used = j; } }
      }
    }
    if (best < 0 && i + 1 < hyps.length) { // skipped a line? look across the page for two consecutive matches
      for (let k = p + win; k < words.length - 1; k++) {
        if (sim(hyps[i], words[k], lang) >= TUNE.sim[words[k].tier] && sim(hyps[i + 1], words[k + 1], lang) >= TUNE.sim[words[k + 1].tier]) { best = k; break; }
      }
    }
    if (best >= 0) {
      // substitution on a Hard/Unique word: hyp[i-1] said instead of words[best-1]
      if (best === p + 1 && i > 0 && !words[p].st && (words[p].tier === "hard" || words[p].tier === "unique") && sim(hyps[i - 1], words[p], lang) < .66 && !marks.includes(p)) subs.push(p);
      for (let u = 0; u < used; u++) marks.push(best); p = best + 1; i += used - 1;
    }
  }
  return { marks: [...new Set(marks)], end: p, subs };
}
function onSpeech(e) {
  if (!R || R.completing || R.paused) return;
  const res = e.results; let interim = [];
  for (let i = Math.max(e.resultIndex, R.epoch); i < res.length; i++) {
    const r = res[i]; const words = (r[0]?.transcript || "").split(/\s+/).map(w => norm(w, R.s.lang)).filter(Boolean);
    if (r.isFinal) { if (i > R.processed) { R.processed = i; commit(words, true); } }
    else interim.push(...words);
  }
  // interim results move the highlight optimistically; finals confirm or roll back
  R.tent.clear();
  if (interim.length) { const { marks } = align(interim, R.anchor); marks.forEach(m => { if (!R.words[m].st) R.tent.add(m); }); }
  updateCursor();
}
function commit(hyps, final) {
  const before = R.anchor;
  const { marks, subs } = align(hyps, R.anchor);
  if (!marks.length) return;
  const t = now(); let progressed = false;
  for (const m of marks.sort((a, b) => a - b)) {
    const w = R.words[m]; if (w.st) continue;
    if (R.ladder && R.ladder.idx === m) { if (R.ladder.step === 1) { R.ladder.fixed = true; w.st = 1; selfFix(w); progressed = true; } else R.heard = now(); continue; }
    w.st = 1; R.sess.c++; if (w.tier === "hard" || w.tier === "unique") R.sess.nailed.add(w.t.replace(/[^\p{L}\p{N}'-]/gu, ""));
    progressed = true;
    if (m >= R.anchor) {
      // Easy words between two matched words count as read (implicit)
      for (let k = R.anchor; k < m; k++) { const s = R.words[k]; if (!s.st && s.tier === "easy" && (k === 0 || R.words[k - 1].st || marks.includes(k - 1))) { s.st = 1; R.sess.c++; } }
      R.anchor = m + 1;
    }
  }
  if (progressed) {
    if (R.started) { const gap = t - R.lastProg; if (gap < TUNE.idlePause) R.sess.sec += gap / 1000; }
    R.started = true; R.lastProg = t; bumpStreak(); mood($("#rAvatar"), "listening following");
  }
  if (final && subs.length && !R.ladder) runLadder(subs[0], "listen");
  updateCursor();
  checkSentenceEnd(before);
  checkComplete();
}
function checkSentenceEnd(before) {
  // after the child finishes a sentence, point back to a skipped Hard/Unique word in it
  if (R.ladder) return;
  const last = R.words[R.anchor - 1]; if (!last) return;
  const sentDone = !R.words[R.anchor] || R.words[R.anchor].sent !== last.sent || R.anchor >= R.words.length;
  if (!sentDone) return;
  const skipped = R.words.find(w => !w.st && w.sent === last.sent && (w.tier === "hard" || w.tier === "unique") && w.i < R.anchor);
  if (skipped && !R.sentNotified.has(skipped.i)) {
    R.sentNotified.add(skipped.i); pointBack(skipped);
    LISTENER?.pause(); speak(T().waitThis, { rate: 1 }).then(() => LISTENER?.resume());
  }
}
function pointBack(w) {
  const r = w.el.getBoundingClientRect(), st = $("#stage").getBoundingClientRect();
  const a = document.createElement("div"); a.className = "backarrow"; a.textContent = "➜";
  a.style.left = (r.right - st.left + 6) + "px"; a.style.top = (r.top - st.top + r.height / 2 - 22) + "px"; a.style.transform = "scaleX(-1)";
  $("#stage").appendChild(a); setTimeout(() => a.remove(), 3200);
}
function isComplete() {
  const ws = R.words; if (!ws.length) return true;
  if (ws.some(w => (w.tier === "hard" || w.tier === "unique") && !w.st)) return false;
  const rest = ws.filter(w => w.tier !== "hard" && w.tier !== "unique"); const miss = rest.filter(w => !w.st).length;
  const allowed = Math.max(Math.floor(rest.length * .1), Math.min(2, Math.floor(rest.length / 3)));
  return miss <= allowed && R.anchor >= ws.length - 1;
}
function checkComplete() {
  if (!R || R.completing || R.ladder) return;
  if (!isComplete()) {
    if (R.anchor >= R.words.length) { const p = R.words.find(w => !w.st && (w.tier === "hard" || w.tier === "unique")); if (p && !R.sentNotified.has("end" + p.i)) { R.sentNotified.add("end" + p.i); pointBack(p); } }
    return;
  }
  completePage();
}
async function completePage(byTap = false) {
  R.completing = true; R.tent.clear(); updateCursor();
  if (R.sub < R.parts.length - 1) { SFX.sparkle(); updateProgress(); await sleep(byTap ? 150 : 500); if (R) advance(1); return; }
  markPageRead(R.s.id, R.ch, R.pg); R.sess.pages++;
  L.shells++; R.sess.shells++; saveL(); bumpStreak();
  const sh = $("#rShells"); sh.querySelector("span").textContent = L.shells + L.sp.length; sh.classList.remove("pop"); void sh.offsetWidth; sh.classList.add("pop"); SFX.shell();
  const nx = $("#rNext"); nx.classList.remove("blink"); void nx.offsetWidth; nx.classList.add("blink");
  updateProgress();
  if (!byTap && Math.random() < .35) { mood($("#rAvatar"), "celebrating"); }
  await sleep(byTap ? 150 : 650);
  if (!R) return;
  advance(1);
}
function advance(dir) {
  const pages = chapterPages();
  if (dir > 0) {
    if (R.sub < R.parts.length - 1) { renderPage(1, R.sub + 1); }
    else if (R.pg < pages.length - 1) { R.pg++; renderPage(1); mood($("#rAvatar"), R.tap ? "" : "listening"); }
    else endChapter();
  } else {
    if (R.sub > 0) { renderPage(-1, R.sub - 1); }
    else if (R.pg > 0) { R.pg--; renderPage(-1, "last"); }
    else if (R.ch > 0) { R.ch--; R.pg = R.s.chapters[R.ch].pages.length - 1; renderPage(-1, "last"); }
  }
}
function endChapter() {
  LISTENER?.pause(); clearInterval(tickT);
  confetti(); SFX.yay(); mood($("#rAvatar"), "celebrating");
  setTimeout(() => { if (R) startQuiz(); }, REDUCED ? 300 : 1300);
}
function tick() {
  if (!R || R.tap || R.completing || R.paused || R.ladder) return;
  const t = now(), idle = t - R.lastProg;
  if (idle > TUNE.idlePause && t - R.pageT0 > TUNE.idlePause) { pauseReading(); return; }
  if (R.started && idle > 1600) mood($("#rAvatar"), "listening thinking");
  const c = cursorIndex(); if (c < 0 || !R.started) return;
  const w = R.words[c];
  if ((w.tier === "hard" || w.tier === "unique") && idle > TUNE.hesitate[R.s.grade] && !w.hesitated) { w.hesitated = true; runLadder(c, "listen"); }
}
function pauseReading() {
  R.paused = true; LISTENER?.pause(); flushTime();
  $("#rPause").hidden = false; mood($("#rAvatar"), "sleeping");
}
function resumeReading() {
  if (!R) return; ac(); R.paused = false; R.lastProg = now(); R.pageT0 = now(); $("#rPause").hidden = true; LISTENER?.resume(); mood($("#rAvatar"), "listening");
}

/* Correction ladder: 1 prompt (underline + blink, wait) → 2 scaffold (zoom + syllables + audio) → 3 model ("Your turn!"). Max ~10 s. */
async function runLadder(idx, from) {
  if (!R || R.ladder || R.completing) return;
  const w = R.words[idx]; if (!w || w.st) return;
  const L0 = R.ladder = { idx, step: from === "tap" ? 2 : 1, how: from === "tap" ? "tap" : "listen", fixed: false };
  const id = R.s.id, lang = R.s.lang, g = R.s.grade;
  const clean = w.t.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
  if (L0.step === 1) {
    w.el.classList.remove("prompt"); void w.el.offsetWidth; w.el.classList.add("prompt"); mood($("#rAvatar"), "listening thinking");
    const t0 = now(); while (now() - t0 < TUNE.selfFix[g] + 1200) { await sleep(120); if (!R || R.ladder !== L0) return; if (L0.fixed || w.st) { endLadder(L0); return; } }
    w.el.classList.remove("prompt"); L0.step = 2;
  }
  if (!R || R.ladder !== L0) return;
  // Step 2: scaffold
  LISTENER?.pause(); mood($("#rAvatar"), "");
  const syl = syllables(clean, lang);
  const missedBefore = (L.counts[w.n]?.n || 0) > 0;
  let how = lang === "es" ? "syl" : (IRREG.has(w.n) ? "say" : "snd");
  if (lang === "en" && GI(g) >= 3 && missedBefore && clean.length >= 6) how = "spell";
  const help = $("#help"); help.hidden = false;
  help.innerHTML = `<div class="zoom">${syl.map(s => `<span class="syl">${h(s)}</span>`).join('<span class="dot">·</span>')}</div>
    <div class="say">${turtleSVG("listening")}<span id="helpSay"></span></div><button class="btn ghost skip" id="helpSkip">${h(T().keepGoing)} ›</button>`;
  $("#helpSkip").onclick = () => { L0.skip = true; speechSynthesis.cancel(); };
  const sylEls = $$(".syl", help);
  if (how === "syl" || how === "snd") {
    if (syl.length > 1) { for (let i = 0; i < syl.length && !L0.skip; i++) { sylEls.forEach(e => e.classList.remove("on")); sylEls[i].classList.add("on"); await speak(syl[i], { rate: .72, lang }); await sleep(120); } }
    sylEls.forEach(e => e.classList.add("on"));
  } else if (how === "spell") {
    $("#helpSay").textContent = clean.split("").join("-");
    if (!L0.skip) await speak(clean.split("").join(", "), { rate: .8, lang });
  }
  if (!R || R.ladder !== L0) return;
  // Step 3: model the word, invite the child to say it
  L0.step = 3; sylEls.forEach(e => e.classList.add("on"));
  if (!L0.skip) await speak(clean, { rate: .88, lang });
  if (!R || R.ladder !== L0) return;
  $("#helpSay").textContent = T().yourTurn;
  if (!L0.skip && !R.tap) { await speak(T().yourTurn, { rate: 1, lang }); LISTENER?.resume(); const t0 = now(); R.heard = 0; while (now() - t0 < 3000 && !L0.skip) { await sleep(120); if (R?.heard) { await sleep(900); break; } } }
  else if (!L0.skip) await sleep(900);
  if (!R || R.ladder !== L0) return;
  help.hidden = true; help.innerHTML = "";
  if (!w.st) { w.st = 2; R.sess.h++; R.sess.helped.push(clean); }
  logHelp(w.n, id, L0.step, how);
  if (w.i >= R.anchor) R.anchor = w.i + 1;
  R.ladder = null; R.lastProg = now(); if (!R.tap) LISTENER?.resume(); mood($("#rAvatar"), R.tap ? "" : "listening");
  updateCursor(); checkComplete();
}
function selfFix(w) {
  w.el.classList.remove("prompt"); w.el.classList.add("sparkle"); setTimeout(() => w.el?.classList.remove("sparkle"), 1000); SFX.sparkle();
  R.sess.c++; logHelp(w.n, R.s.id, 1, "self");
}
function endLadder(L0) { if (R && R.ladder === L0) { R.ladder = null; R.lastProg = now(); mood($("#rAvatar"), "listening"); updateCursor(); checkComplete(); } }

function bindReader() {
  $("#rHome").onclick = () => history.back();
  $("#rNext").onclick = () => {
    if (!R || R.ladder) return; ac();
    if (R.completing) return;
    if (R.tap) { completePage(true); return; } // tap-for-help mode: Next counts the page
    advance(1); // skipping does not mark words read and does not count toward completion
  };
  $("#rPrev").onclick = () => { if (!R || R.ladder) return; ac(); advance(-1); };
  $("#pageText").addEventListener("click", e => {
    const el = e.target.closest(".w"); if (!el || !R) return; ac();
    const i = +el.dataset.i; const w = R.words[i];
    if (w.st) { speak(w.t.replace(/[^\p{L}\p{N}'-]/gu, ""), { rate: .85, lang: R.s.lang }); return; }
    runLadder(i, "tap");
  });
  $("#rResume").onclick = resumeReading;
  $("#rAvatar").onclick = () => { if (R?.paused) resumeReading(); };
  document.addEventListener("visibilitychange", () => {
    if (!R) return;
    if (document.hidden) { LISTENER?.pause(); flushTime(); hiddenT = setTimeout(() => { if (document.hidden && R) { teardown(); goShelfAfterReader(); } }, 60000); }
    else { clearTimeout(hiddenT); if (R && !R.paused && !R.ladder && !R.tap) LISTENER?.resume(); }
  });
  addEventListener("pagehide", () => { if (R) teardown(); });
  addEventListener("keydown", e => {
    if (SCREEN !== "reader" || !R) return;
    if (e.key === "ArrowRight") $("#rNext").click(); else if (e.key === "ArrowLeft") $("#rPrev").click();
  });
  let rzT; addEventListener("resize", () => { clearTimeout(rzT); rzT = setTimeout(() => { if (R && SCREEN === "reader" && !R.ladder && !R.completing) renderPage(0, 0); }, 250); });
}
function goShelfAfterReader() { show("shelf"); goShelf(); }

/* ───────────── Quiz ───────────── */
let Q = null;
function startQuiz() {
  const chap = R.s.chapters[R.ch];
  const items = chap.quiz.map(q => { const ord = q.o.map((_, i) => i).sort(() => Math.random() - .5); return { ...q, ord }; });
  Q = { items, i: 0, right: 0 };
  history.replaceState({ s: "quiz" }, ""); show("quiz"); $("#quizTitle").textContent = T().quiz; renderQ();
}
function renderQ() {
  const q = Q.items[Q.i], t = T(), small = GI(R.s.grade) <= 1;
  $("#quizBody").innerHTML = `<div class="qcard"><div class="qn">${Q.items.map((_, i) => `<i class="${i <= Q.i ? "on" : ""}"></i>`).join("")}</div>
    <h2><button class="speak" id="qSpeak" aria-label="Read aloud"><svg><use href="#i-speak"/></svg></button><span>${h(q.q)}</span></h2></div>
    <div class="opts">${q.ord.map((oi, k) => `<button class="opt" data-o="${oi}"><span class="k">${"ABCD"[k]}</span><span>${h(q.o[oi])}</span></button>`).join("")}</div>
    <div id="qAfter"></div>`;
  const readAll = async () => { await speak(q.q, { lang: R.s.lang }); if (small) for (const oi of q.ord) { if (!Q || Q.items[Q.i] !== q || q.answered) break; await speak(q.o[oi], { lang: R.s.lang }); } };
  $("#qSpeak").onclick = () => { speechSynthesis.cancel(); readAll(); };
  if (small) readAll(); // K–1: read the question and options automatically
  $$(".opt").forEach(b => b.onclick = () => answer(+b.dataset.o));
}
function answer(o) {
  const q = Q.items[Q.i]; if (q.answered) return; q.answered = true; speechSynthesis.cancel();
  const ok = o === q.a; if (ok) Q.right++;
  $$(".opt").forEach(b => { const v = +b.dataset.o; b.disabled = true; if (v === q.a) b.classList.add("right"); else if (v === o) b.classList.add("wrong"); });
  if (ok) { SFX.sparkle(); speak(T().praise[Math.floor(Math.random() * T().praise.length)], { rate: 1, lang: R.s.lang }); setTimeout(nextQ, 1300); }
  else {
    SFX.soft();
    // gently show the right answer with the supporting sentence highlighted
    const pageText = R.s.chapters[R.ch].pages.find(p => p.includes(q.ev)) || q.ev;
    const sentRe = /[^.!?]*[.!?]+["”»]?\s*/g; const sents = pageText.match(sentRe) || [pageText];
    const hit = sents.find(s => s.includes(q.ev) || q.ev.includes(s.trim())) || q.ev;
    const showTxt = sents.length > 3 ? (() => { const i = sents.indexOf(hit); return sents.slice(Math.max(0, i - 1), i + 2).join(""); })() : pageText;
    $("#qAfter").innerHTML = `<div class="qcard" style="margin-top:4px"><p style="margin:0 0 10px;font-weight:600">${h(T().seeAnswer)}</p>
      <div class="ev">${h(showTxt).replace(h(hit.trim()), `<mark>${h(hit.trim())}</mark>`)}</div>
      <div style="display:flex;justify-content:flex-end;margin-top:14px"><button class="btn" id="qNext">${h(T().next)} ›</button></div></div>`;
    $("#qNext").onclick = nextQ; $("#qAfter").scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "nearest" });
  }
}
function nextQ() {
  if (!Q) return; Q.i++;
  if (Q.i < Q.items.length) { renderQ(); return; }
  L.quiz.push([R.s.id, R.ch, Q.right, ts36()]); saveL();
  Q = null; showResults();
}

/* ───────────── Results ───────────── */
function showResults() {
  const s = R.s, t = T(), lastChapter = R.ch >= s.chapters.length - 1;
  flushTime();
  const words = R.sess.c + R.sess.h; const acc = words ? R.sess.c / words : null;
  let gotSpecial = false, complete = false;
  if (lastChapter) {
    complete = storyComplete(s);
    const st = bookState(s.id) || [1, 0, 0, null, null];
    const best = acc != null ? Math.max(acc, st[3] ?? 0) : st[3];
    if (complete) { setBook(s.id, { 0: 2, 1: 0, 2: 0, 3: best, 4: acc ?? st[4] }); if (!L.sp.includes(s.id)) { L.sp.push(s.id); gotSpecial = true; } }
    else { const [c, p] = firstUnread(s); setBook(s.id, { 0: 1, 1: c, 2: p, 3: best, 4: acc ?? st[4] }); }
    const run = L.runs[s.id] || (L.runs[s.id] = { n: 0, wcpm: 0 }); run.n++;
    const min = (now() - R.sess.t0) / 60000; const active = Math.max(R.sess.sec / 60, .1);
    if (R.sess.c > 10) run.wcpm = Math.max(run.wcpm, Math.round(R.sess.c / active)); run.min = Math.round(min);
    saveL();
  } else setBook(s.id, { 0: bookState(s.id)?.[0] === 2 ? 2 : 1, 1: R.ch + 1, 2: 0 });
  const nailed = [...R.sess.nailed].slice(0, 8), tricky = [...new Set(R.sess.helped)].slice(0, 3);
  history.replaceState({ s: "results" }, "");
  show("results");
  const shells = R.sess.shells + (gotSpecial ? 1 : 0);
  $("#resBody").innerHTML = `<div class="res-hero">${turtleSVG("celebrating")}<h1>${h(lastChapter ? t.youDidIt : t.chapterDone)}</h1><p style="margin:0;color:var(--ink-2);font-size:18px">${h(s.title)}</p></div>
    <div class="res-grid">
      <div class="res-tile"><small>${h(t.shellsEarned)}</small><div class="big"><svg><use href="#i-shell"/></svg>+${shells}</div>${gotSpecial ? `<div class="chip" style="margin-top:6px">⭐ ${h(t.special)}</div>` : ""}</div>
      <div class="res-tile"><small>${h(t.nailed)}</small>${nailed.length ? `<div class="wordpills">${nailed.map(w => `<button data-say="${h(w)}">${h(w)}</button>`).join("")}</div>` : `<div class="big">${R.sess.c}</div>`}</div>
      ${tricky.length ? `<div class="res-tile"><small>${h(t.tricky)}</small><div class="wordpills">${tricky.map(w => `<button data-say="${h(w)}">🔊 ${h(w)}</button>`).join("")}</div></div>` : ""}
    </div>
    ${lastChapter && !complete ? `<p class="hint" style="margin:0 auto">${h(t.skipped)}</p>` : ""}
    <div class="res-actions">
      ${lastChapter ? `<button class="btn ghost" id="resAgain">↻ ${h(t.readAgain)}</button><button class="btn" id="resNext">${h(t.nextBook)} ›</button>`
                    : `<button class="btn ghost" id="resHome">${h(t.home)}</button><button class="btn" id="resNextCh">${h(t.nextChapter)} ›</button>`}
    </div>`;
  if (lastChapter) { confetti(30); }
  $$("[data-say]", $("#resBody")).forEach(b => b.onclick = () => speak(b.dataset.say, { rate: .85, lang: s.lang }));
  const id = s.id;
  $("#resAgain") && ($("#resAgain").onclick = () => { teardown(); openBook(id, { restart: true }); });
  $("#resNext") && ($("#resNext").onclick = () => {
    teardown(); const list = (CATALOG[P.lang][P.grade || s.grade] || []).filter(b => b.id && b.id !== id);
    const nb = list.find(b => bookState(b.id)?.[0] !== 2) || list[0]; if (nb) openBook(nb.id); else history.back();
  });
  $("#resHome") && ($("#resHome").onclick = () => history.back());
  $("#resNextCh") && ($("#resNextCh").onclick = () => { const ch = R.ch + 1; teardown(); openBook(id, { ch }); });
}

/* ───────────── Shell collection ───────────── */
function goCollection() {
  history.pushState({ s: "collection" }, ""); applyI18n(); show("collection"); const t = T();
  const books = Object.values(CATALOG[P.lang]).flat().filter(b => b.id);
  $("#colBody").innerHTML = `<div class="res-grid"><div class="res-tile"><small>${h(t.pageShells)}</small><div class="big"><svg><use href="#i-shell"/></svg>${L.shells}</div></div>
      <div class="res-tile"><small>${h(t.special)}</small><div class="big">⭐ ${L.sp.length}</div></div>
      <div class="res-tile"><small>${h(t.streakLbl)}</small><div class="big"><svg><use href="#i-flame"/></svg>${streakNow()}</div></div></div>
    ${L.sp.length ? "" : `<p class="hint" style="margin:0">${h(t.noneYet)}</p>`}
    <div class="shell-grid">${books.map(b => { const got = L.sp.includes(b.id); return `<div class="shell-cell ${got ? "" : "locked"}" title="${h(b.t)}">${got ? `<svg viewBox="0 0 64 64"><use href="#i-shell"/></svg>` : `<span style="position:static;font-size:30px">${STORIES[b.id].icon}</span>`}<span>${h(b.t)}</span></div>`; }).join("")}</div>`;
}

/* ───────────── Parent panel ───────────── */
function fmtDate(t36) { const d = from36(t36); return d.toLocaleString(P.lang === "es" ? "es-MX" : "en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); }
function titleOf(id) { return STORIES[id]?.title || id; }
async function openParent() {
  const dlg = $("#parent"), t = T(), p = t.p; applyI18n(); mountTurtles(dlg);
  const ids = Object.keys(P.b).filter(id => STORIES[id]);
  const done = ids.filter(id => P.b[id][0] === 2);
  const accs = done.map(id => P.b[id][3]).filter(v => v != null);
  const pages = Object.values(L.pr).reduce((a, c) => a + Object.values(c).reduce((x, y) => x + y.length, 0), 0);
  const words = Object.entries(L.counts).sort((a, b) => b[1].n - a[1].n || parseInt(b[1].l, 36) - parseInt(a[1].l, 36)).slice(0, 25);
  const eng = engineInfo(); const v = pickVoice(P.lang);
  let localState = "";
  try { if (SR?.available) localState = await SR.available({ langs: [P.lang === "es" ? "es-MX" : "en-US"], processLocally: true }); } catch { }
  const pct = x => x == null ? "–" : Math.round(x * 100) + "%";
  const topHow = c => { const e = Object.entries(c.how || {}).sort((a, b) => b[1] - a[1])[0]; return e ? (p.scaff[e[0]] || e[0]) : "–"; };
  $("#parentBody").innerHTML = `
    <section><h3>${h(p.report)}</h3><div class="kpis">
      <div class="kpi"><b>${Math.round(L.sec / 60)}</b><span>${h(p.minutes)}</span></div><div class="kpi"><b>${done.length}</b><span>${h(p.booksDone)}</span></div>
      <div class="kpi"><b>${pages}</b><span>${h(p.pages)}</span></div><div class="kpi"><b>${accs.length ? pct(accs.reduce((a, b) => a + b, 0) / accs.length) : "–"}</b><span>${h(p.acc)}</span></div>
      <div class="kpi"><b>${streakNow()}</b><span>🔥 ${h(t.streak(streakNow()).replace(/^\d+-?\s?/, ""))}</span></div></div></section>
    <section><h3>${h(p.booksT)}</h3>${ids.length ? `<div class="tbl"><table><tr><th>${h(p.title)}</th><th>${h(p.status)}</th><th class="num">${h(p.best)}</th><th class="num">${h(p.last)}</th><th class="num">${h(p.wcpm)}</th><th class="num">${h(p.times)}</th></tr>
      ${ids.map(id => { const b = P.b[id], r = L.runs[id] || {}; return `<tr><td>${h(titleOf(id))}</td><td>${h(b[0] === 2 ? p.done : p.inprog)}</td><td class="num">${pct(b[3])}</td><td class="num">${pct(b[4])}</td><td class="num">${r.wcpm || "–"}</td><td class="num">${r.n || 0}</td></tr>`; }).join("")}</table></div>` : `<p class="empty">${h(p.noData)}</p>`}</section>
    <section><h3>${h(p.quizT)}</h3>${L.quiz.length ? `<div class="tbl"><table><tr><th>${h(p.title)}</th><th class="num">${h(p.score)}</th><th>${h(p.date)}</th></tr>${L.quiz.slice(-12).reverse().map(([id, ch, sc, d]) => `<tr><td>${h(titleOf(id))}${STORIES[id]?.chapters.length > 1 ? ` · ${h(t.chapter)} ${ch + 1}` : ""}</td><td class="num">${sc}/3</td><td>${h(fmtDate(d))}</td></tr>`).join("")}</table></div>` : `<p class="empty">${h(p.noData)}</p>`}</section>
    <section><h3>${h(p.practice)}</h3>${words.length ? `<div class="tbl"><table><tr><th>${h(p.word)}</th><th class="num">${h(p.count)}</th><th>${h(p.lastSeen)}</th><th>${h(p.helped)}</th></tr>${words.map(([w, c]) => `<tr><td><b>${h(w)}</b></td><td class="num">${c.n}</td><td>${h(fmtDate(c.l))}</td><td>${h(topHow(c))}</td></tr>`).join("")}</table></div>` : `<p class="empty">${h(p.noData)}</p>`}</section>
    <section><h3>${h(p.log)}</h3>${L.help.length ? `<div class="tbl"><table><tr><th>${h(p.date)}</th><th>${h(p.word)}</th><th>${h(p.title)}</th><th class="num">${h(p.step)}</th></tr>${L.help.slice(-20).reverse().map(([w, id, d, st]) => `<tr><td>${h(fmtDate(d))}</td><td>${h(w)}</td><td>${h(titleOf(id))}</td><td class="num">${st}</td></tr>`).join("")}</table></div>` : `<p class="empty">${h(p.noData)}</p>`}</section>
    <section><h3>${h(p.settings)}</h3>
      <div class="setting"><span>${h(p.lang)}</span><div class="seg" id="pLang"><button data-l="en" aria-pressed="${P.lang === "en"}">English</button><button data-l="es" aria-pressed="${P.lang === "es"}">Español</button></div></div>
      <div class="setting"><span>${h(p.underline)}</span><button class="toggle" id="pUnder" role="switch" aria-checked="${!!P.under}"><span class="sw"></span></button></div>
      <div class="setting"><span>${h(t.showRead)}</span><button class="toggle" id="pShowRead" role="switch" aria-checked="${!!P.showRead}"><span class="sw"></span></button></div></section>
    <section><h3>${h(p.listen)}</h3>
      <p><b>${h(p.engine)}:</b> ${h(eng === "tap" ? p.eTap : (localState === "available" ? p.eLocal : p.eCloud))}</p>
      ${eng !== "tap" && (localState === "downloadable") ? `<div class="rowbtns"><button class="btn ghost" id="pInstall">${h(p.install)}</button></div>` : ""}
      <p><b>${h(p.voice)}:</b> ${h(v ? `${v.name} (${v.lang})` : "–")}</p>
      ${P.lang === "es" && !(v && /es[-_](MX|US|419)/i.test(v.lang)) ? `<p class="hint">${h(p.noVoice)}</p>` : ""}</section>
    <section><h3>${h(p.privacy)}</h3><p>${h(p.privacyText)}</p><h3 style="margin-top:12px">${h(p.tip)}</h3><p>${h(p.tipText)}</p></section>
    <section><h3>${h(p.backup)}</h3><div class="rowbtns"><button class="btn ghost" id="pExp">⬇ ${h(p.exp)}</button><button class="btn ghost" id="pImp">⬆ ${h(p.imp)}</button><button class="btn ghost" id="pReset" style="color:#b42318">${h(p.reset)}</button></div></section>`;
  $("#pLang").onclick = e => { const b = e.target.closest("button"); if (!b) return; P.lang = b.dataset.l; saveP(); openParent(); refreshBehind(); };
  $("#pUnder").onclick = () => { P.under = P.under ? 0 : 1; saveP(); $("#pUnder").setAttribute("aria-checked", !!P.under); };
  $("#pShowRead").onclick = () => { P.showRead = P.showRead ? 0 : 1; saveP(); $("#pShowRead").setAttribute("aria-checked", !!P.showRead); refreshBehind(); };
  $("#pInstall") && ($("#pInstall").onclick = async e => { const b = e.currentTarget; b.textContent = p.installing; try { const ok = await SR.install({ langs: [P.lang === "es" ? "es-MX" : "en-US"], processLocally: true }); b.textContent = ok ? p.installed : p.install; } catch { b.textContent = p.install; } });
  $("#pExp").onclick = () => {
    const blob = new Blob([JSON.stringify({ shellfie: 1, P, L }, null, 1)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `shellfie-progress-${new Date().toISOString().slice(0, 10)}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  $("#pImp").onclick = () => $("#importFile").click();
  $("#pReset").onclick = () => { if (confirm(p.resetQ)) { const lang = P.lang; localStorage.removeItem("shellfie_log"); P = { v: 1, lang, grade: null, browse: "grade", genre: "fairy", showRead: 1, under: 1, onb: 1, b: {} }; L = { help: [], counts: {}, sec: 0, quiz: [], shells: 0, sp: [], streak: { d: "", n: 0 }, pr: {}, wc: {}, runs: {} }; saveP(); saveL(); openParent(); refreshBehind(); } };
  if (!dlg.open) dlg.showModal();
}
function refreshBehind() { applyI18n(); if (SCREEN === "grades") goGrades(); else if (SCREEN === "shelf") goShelf(); }
function bindParent() {
  $("#parentClose").onclick = () => $("#parent").close();
  $("#parent").addEventListener("click", e => { if (e.target === $("#parent")) $("#parent").close(); });
  $("#importFile").onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try { const d = JSON.parse(await f.text()); if (!d.shellfie || !d.P || !d.L) throw 0; P = Object.assign(P, d.P); L = Object.assign(L, d.L); saveP(); saveL(); toast(T().p.imported); openParent(); refreshBehind(); }
    catch { toast(T().p.bad); }
    e.target.value = "";
  };
  $$(".gate").forEach(bindGate);
}

/* ───────────── Routing (browser back triggers teardown) ───────────── */
addEventListener("popstate", e => {
  const s = e.state?.s;
  if (["reader", "quiz", "results"].includes(SCREEN)) { teardown(); Q = null; }
  if (s === "shelf" || (["reader", "quiz", "results"].includes(SCREEN) && P.grade)) { goShelf(); if (s !== "shelf") history.replaceState({ s: "shelf" }, ""); return; }
  if (s === "collection") return goCollection();
  if (P.onb) goGrades(); else initOnboard();
});
$("#colBack").onclick = () => history.back();
$("#quizHome").onclick = () => history.back();

/* For testing the listener without a microphone: Shellfie.hear("the little red hen", true) */
window.Shellfie = { hear(text, final = true) { if (!R) return; const fake = { resultIndex: 0, results: [Object.assign([{ transcript: text }], { isFinal: final })] }; R.epoch = 0; R.processed = -1; onSpeech(fake); }, state: () => R, syllables, tokenize,
  next() { if (R) advance(1); },
  open(id, ch = 0, pg = 0) { if (R) teardown(); P.b[id] = [P.b[id]?.[0] || 1, ch, pg, P.b[id]?.[3] ?? null, P.b[id]?.[4] ?? null]; openBook(id); } };

/* ───────────── Boot ───────────── */
mountTurtles(); bindGrades(); bindShelf(); bindReader(); bindParent(); applyI18n();
history.replaceState({ s: "grades" }, "");
if (!P.onb) initOnboard(); else goGrades();
if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(() => { });
})();
