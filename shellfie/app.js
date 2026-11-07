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
const CATALOG = window.SHELLFIE_CATALOG;
const META = {};   // id → catalog entry (+ lang, grade): everything the shelves need without loading the book
for (const L of ["en", "es"]) for (const g of Object.keys(CATALOG[L])) for (const e of CATALOG[L][g]) if (e.id) META[e.id] = Object.assign(e, { lang: L, grade: g });
let BOOK = null;   // the one open book's JSON (dropped on teardown)
async function loadBook(id) {
  if (BOOK && BOOK.id === id) return BOOK;
  const r = await fetch(`books/${encodeURIComponent(id)}.json`);
  if (!r.ok) throw new Error("book " + r.status);
  return await r.json();
}
const pcOf = id => META[id]?.pc || [1];

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
    genres: { mckinley: "McKinley Bulldogs", meet: "Meet the Animals", jobs: "When I Grow Up", bedtime: "Bedtime Stories", fairy: "Fairy and Folk Tales", fables: "Fables", animal: "Animal Stories", everyday: "Everyday Life", adventure: "Adventure and Fantasy", poetry: "Poetry and Rhymes", nonfiction: "Nonfiction", seasons: "Seasons and Holidays" },
    soon: "Soon", soonToast: "Coming soon! Shellfie is still learning this book.", allRead: "You read them all!", books: n => `${n} books`,
    yourGrade: "Your grade", picks: "Shellfie picks", picksGo: "Read", resume: "Keep going", page: (a, b) => `Page ${a} of ${b}`,
    ready: "Ready when you are", keepReading: "Keep reading", iTurn: "Keep reading! I'll turn the page for you.", holdSkip: "Grown-ups: hold to skip", waitThis: "Wait, this one!", yourTurn: "Your turn!",
    yourTurnSay: "Your turn!", praise: ["Great job!", "Nice reading!", "You got it!", "Wow!", "Super!"], selfFix: "Nice fix!", tapMode: "Tap any word for help", listeningOff: "Shellfie is listening",
    quiz: "Quick questions", qOf: (a, b) => `Question ${a} of ${b}`, next: "Next", seeAnswer: "Here's the answer:",
    youDidIt: "You did it!", chapterDone: "Chapter done!", shellsEarned: "Shells earned", nailed: "Words you nailed", tricky: "Tricky words to try again",
    readAgain: "Read it again", nextBook: "Next book", nextChapter: "Next chapter", home: "Home", myShells: "My shell collection",
    streak: n => `${n}-day streak`, streakLbl: "Reading streak", shells: n => `${n} shells`, special: "Special shells", pageShells: "Page shells", noneYet: "Read a whole book to win its special shell!",
    keepGoing: "Keep going", chapter: "Chapter", offline: "Couldn't open this book. Check your internet and try again.",
    skippedPart: "Oops! We skipped a part. Start here!", alreadyRead: "Already read!",
    micAgain: "Shellfie can't hear you right now", micTap: "Tap to turn the microphone on", micSkip: "Read without the microphone", micStill: "The microphone is still off. Tap any word for help.",
    micHelp: "Grown-ups: if nothing happens, allow the microphone for this site (Safari: the aA button → Website Settings → Microphone; Chrome: the lock icon → Microphone).", skipped: "Read the skipped pages to win this book's special shell.",
    grownups: "For grown-ups",
    p: {
      report: "Reading report", minutes: "Minutes read", booksDone: "Books finished", pages: "Pages read", acc: "Best accuracy (avg)", wcpm: "Words correct / min",
      booksT: "Books", title: "Title", status: "Status", best: "Best", last: "Last", times: "Times", done: "Finished", inprog: "Reading", quizT: "Comprehension", score: "Score", date: "Date",
      practice: "Words to practice", word: "Word", count: "Times helped", lastSeen: "Last", helped: "What helped", log: "Help log (latest)", step: "Step",
      noData: "Nothing yet. Reading data shows up here after the first page.",
      calm: "Calm reading (fewer animations; best for focus)", say: "Shellfie says the word when helping (the only sound while reading)",
      trouble: "Troubleshooting", troubleHelp: "Something odd happen while reading? Copy the last 30 minutes of Shellfie's notes and paste them into Claude (or send them to whoever is helping).",
      copyRecent: "Copy recent logs (30 min)", settings: "Settings", underline: "Dotted underline on hard words (K–2)", lang: "Language", listen: "Listening", engine: "Engine", voice: "Voice",
      eLocal: "On-device speech recognition. Audio stays on this device.", eCloud: "Browser speech recognition. This browser sends audio to its maker's speech service to turn it into text. Shellfie never stores or uploads recordings.",
      eTap: "Listening is off (no microphone or no speech support). Tap-for-help mode: tapping Next counts a page as read.",
      install: "Download on-device speech", installing: "Downloading…", installed: "On-device speech ready",
      noVoice: "No Mexican Spanish voice found on this device. Install one (iOS/macOS: Settings → Accessibility → Spoken Content → Voices → Spanish (Mexico)) for the best Spanish help.",
      privacy: "Privacy", privacyText: "No ads, no tracking, no accounts. Progress is saved only in this browser (a small cookie plus local storage). Recordings are never stored.",
      tip: "Tip", tipText: "On iPhone or iPad, tap Share → Add to Home Screen. Installed web apps keep their saved progress longer.",
      style: "Reading style", styleAuto: "Automatic", styleNames: { speedy: "Speedy reader", steady: "Steady reader", careful: "Careful reader" },
      styleShort: { speedy: "Speedy", steady: "Steady", careful: "Careful" },
      styleWhy: { speedy: "Reads quickly and smoothly. Shellfie waits a little less before helping with a hard word.", steady: "Reads at a steady pace. Shellfie uses its normal timing.", careful: "Takes time with each word. Shellfie waits much longer before helping, so sounding words out is never interrupted." },
      styleNone: "Not measured yet. Shellfie learns the reading style during the first ~120 words read aloud.",
      styleStats: (w, g, e, n) => `About ${w} words a minute · typical pause ${(g / 1000).toFixed(1)} s · ${e} slips per 100 words · based on ${n} words.`,
      styleWhen: d => `Last updated ${d}.`, styleForce: "Use style", styleForced: "chosen by a grown-up", patterns: "Speech patterns Shellfie accepts as correct",
      patternsHelp: "These are ways of saying words, not reading mistakes. Shellfie turns them on when it hears them often; you can switch any of them on or off.",
      pat: { th: "th sounds (the → de, think → fink or tink)", rw: "r sounds like w (rabbit → wabbit)", lw: "l sounds like w (little → wittle)", rl: "r and l swap (rice → lice)",
             sh: "sh, s and th swaps (ship → sip, sun → thun)", v: "v sounds like w or b (very → wery)", fin: "dropped word endings (walked → walk, hand → han)", nr: "dropped r after vowels (car → cah)" },
      lock: "Keep this profile (don't update it each day)", recheck: "Re-check during the next book", recheckOn: "Shellfie will re-measure during the next book.",
      dev: "Developer", devOn: "Enable developer mode (detailed reading log)", devInfo: n => `${n} log entries from the last 3 days. Older entries are deleted automatically. The log stays on this device until you send it.`,
      devTo: "Send logs to", devMail: "Email log", devCopy: "Copy log", devClear: "Clear log", devCopied: "Log copied", devCopyFail: "Couldn't copy. Use Email log instead.",
      devMailBody: name => `The Shellfie log was saved as ${name} (check Downloads). Please attach it to this email.`,
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
    genres: { mckinley: "Bulldogs de McKinley", meet: "Conoce a los animales", jobs: "Cuando sea grande", bedtime: "Cuentos para dormir", fairy: "Cuentos de hadas y folclor", fables: "Fábulas", animal: "Historias de animales", everyday: "La vida diaria", adventure: "Aventura y fantasía", poetry: "Poesía y rimas", nonfiction: "No ficción", seasons: "Temporadas y fiestas" },
    soon: "Pronto", soonToast: "¡Muy pronto! Shellfie todavía está aprendiendo este libro.", allRead: "¡Los leíste todos!", books: n => `${n} libros`,
    yourGrade: "Tu grado", picks: "Shellfie te recomienda", picksGo: "Leer", resume: "Seguir", page: (a, b) => `Página ${a} de ${b}`,
    ready: "Cuando quieras", keepReading: "Seguir leyendo", iTurn: "¡Sigue leyendo! Yo paso la página.", holdSkip: "Adultos: mantén presionado para saltar", waitThis: "¡Espera, esta!", yourTurn: "¡Ahora tú!",
    praise: ["¡Muy bien!", "¡Qué bien lees!", "¡Lo lograste!", "¡Guau!", "¡Súper!"], selfFix: "¡Bien corregido!", tapMode: "Toca una palabra para recibir ayuda", listeningOff: "Shellfie te escucha",
    quiz: "Preguntas rápidas", qOf: (a, b) => `Pregunta ${a} de ${b}`, next: "Siguiente", seeAnswer: "Esta es la respuesta:",
    youDidIt: "¡Lo lograste!", chapterDone: "¡Terminaste el capítulo!", shellsEarned: "Caparazones ganados", nailed: "Palabras que leíste solito", tricky: "Palabras para practicar",
    readAgain: "Leer otra vez", nextBook: "Otro libro", nextChapter: "Siguiente capítulo", home: "Inicio", myShells: "Mi colección de caparazones",
    streak: n => `${n} días seguidos`, streakLbl: "Racha de lectura", shells: n => `${n} caparazones`, special: "Caparazones especiales", pageShells: "Caparazones de página", noneYet: "¡Lee un libro completo para ganar su caparazón especial!",
    keepGoing: "Seguir", chapter: "Capítulo", offline: "No se pudo abrir este libro. Revisa tu internet e intenta otra vez.",
    skippedPart: "¡Ups! Nos saltamos un pedacito. ¡Empieza aquí!", alreadyRead: "¡Ya lo leíste!",
    micAgain: "Shellfie no te escucha ahora", micTap: "Toca para encender el micrófono", micSkip: "Leer sin micrófono", micStill: "El micrófono sigue apagado. Toca cualquier palabra para recibir ayuda.",
    micHelp: "Adultos: si no pasa nada, permitan el micrófono para este sitio (Safari: botón aA → Configuración del sitio web → Micrófono; Chrome: el candado → Micrófono).", skipped: "Lee las páginas que saltaste para ganar el caparazón especial de este libro.",
    grownups: "Para adultos",
    p: {
      report: "Reporte de lectura", minutes: "Minutos de lectura", booksDone: "Libros terminados", pages: "Páginas leídas", acc: "Mejor precisión (promedio)", wcpm: "Palabras correctas / min",
      booksT: "Libros", title: "Título", status: "Estado", best: "Mejor", last: "Última", times: "Veces", done: "Terminado", inprog: "Leyendo", quizT: "Comprensión", score: "Puntaje", date: "Fecha",
      practice: "Palabras para practicar", word: "Palabra", count: "Veces con ayuda", lastSeen: "Última vez", helped: "Qué ayudó", log: "Registro de ayuda (reciente)", step: "Paso",
      noData: "Todavía no hay datos. Aparecen aquí después de la primera página.",
      calm: "Lectura tranquila (menos animaciones; ideal para concentrarse)", say: "Shellfie dice la palabra al ayudar (el único sonido durante la lectura)",
      trouble: "Solución de problemas", troubleHelp: "¿Pasó algo raro al leer? Copia las notas de Shellfie de los últimos 30 minutos y pégalas en Claude (o envíalas a quien te ayude).",
      copyRecent: "Copiar registros recientes (30 min)", settings: "Configuración", underline: "Subrayado punteado en palabras difíciles (K–2)", lang: "Idioma", listen: "Escucha", engine: "Motor", voice: "Voz",
      eLocal: "Reconocimiento de voz en el dispositivo. El audio no sale de este dispositivo.", eCloud: "Reconocimiento de voz del navegador. Este navegador envía el audio al servicio de voz de su fabricante para convertirlo en texto. Shellfie nunca guarda ni sube grabaciones.",
      eTap: "La escucha está apagada (sin micrófono o sin soporte de voz). Modo de tocar para ayuda: tocar Siguiente cuenta la página como leída.",
      install: "Descargar voz en el dispositivo", installing: "Descargando…", installed: "Voz en el dispositivo lista",
      noVoice: "No se encontró una voz de español de México en este dispositivo. Instala una (iOS/macOS: Configuración → Accesibilidad → Contenido leído → Voces → Español (México)) para la mejor ayuda en español.",
      privacy: "Privacidad", privacyText: "Sin anuncios, sin rastreo, sin cuentas. El progreso se guarda solo en este navegador (una pequeña cookie y almacenamiento local). Nunca se guardan grabaciones.",
      tip: "Consejo", tipText: "En iPhone o iPad, toca Compartir → Agregar a pantalla de inicio. Las apps web instaladas conservan el progreso por más tiempo.",
      style: "Estilo de lectura", styleAuto: "Automático", styleNames: { speedy: "Lector veloz", steady: "Lector constante", careful: "Lector cuidadoso" },
      styleShort: { speedy: "Veloz", steady: "Constante", careful: "Cuidadoso" },
      styleWhy: { speedy: "Lee rápido y con fluidez. Shellfie espera un poco menos antes de ayudar con una palabra difícil.", steady: "Lee a un ritmo constante. Shellfie usa sus tiempos normales.", careful: "Se toma su tiempo con cada palabra. Shellfie espera mucho más antes de ayudar, para no interrumpir cuando separa en sílabas." },
      styleNone: "Todavía no se mide. Shellfie aprende el estilo de lectura durante las primeras ~120 palabras leídas en voz alta.",
      styleStats: (w, g, e, n) => `Unas ${w} palabras por minuto · pausa típica ${(g / 1000).toFixed(1)} s · ${e} errores por cada 100 palabras · con base en ${n} palabras.`,
      styleWhen: d => `Última actualización: ${d}.`, styleForce: "Usar estilo", styleForced: "elegido por un adulto", patterns: "Formas de hablar que Shellfie acepta como correctas",
      patternsHelp: "Son maneras de pronunciar, no errores de lectura. Shellfie las activa cuando las escucha seguido; puedes encender o apagar cualquiera.",
      pat: { s: "s final suave o aspirada (los niños → lo niño)", ado: "-ado → -ao (cansado → cansao)", rl: "r y l se intercambian (puerta → puelta)", fin: "finales de palabra recortados" },
      lock: "Conservar este perfil (no actualizarlo cada día)", recheck: "Volver a medir en el próximo libro", recheckOn: "Shellfie volverá a medir durante el próximo libro.",
      dev: "Desarrollador", devOn: "Activar modo desarrollador (registro detallado de lectura)", devInfo: n => `${n} registros de los últimos 3 días. Los más viejos se borran solos. El registro se queda en este dispositivo hasta que lo envíes.`,
      devTo: "Enviar registros a", devMail: "Enviar registro por correo", devCopy: "Copiar registro", devClear: "Borrar registro", devCopied: "Registro copiado", devCopyFail: "No se pudo copiar. Usa Enviar registro.",
      devMailBody: name => `El registro de Shellfie se guardó como ${name} (revisa Descargas). Adjúntalo a este correo, por favor.`,
      backup: "Respaldo", exp: "Exportar progreso", imp: "Importar progreso", reset: "Borrar todo el progreso", resetQ: "¿Borrar todo el progreso de lectura en este dispositivo?", imported: "Progreso importado", bad: "Ese archivo no es un respaldo de Shellfie",
      scaff: { syl: "sílabas", snd: "sonidos", spell: "deletreo", say: "escuchar la palabra", self: "se corrigió solo" }
    }
  }
};
const GENRE_ORDER = ["mckinley", "meet", "jobs", "bedtime", "fairy", "fables", "animal", "everyday", "adventure", "poetry", "nonfiction", "seasons"];
const GENRE_STYLE = {
  mckinley: ["#8fb8ff", "#1d3f9e", "🐶"], meet: ["#8be3cf", "#0f766e", "🔎"], jobs: ["#ffd36e", "#c2410c", "🧑‍🚒"], bedtime: ["#b4bcff", "#312e81", "🌙"],
  fairy: ["#c3a2ff", "#5b3fc9", "🧚"], fables: ["#ffd27a", "#d9731f", "🦊"], animal: ["#86e8bd", "#1e7a45", "🐾"], everyday: ["#9ddcff", "#2470c9", "🏡"],
  adventure: ["#ffab98", "#c2410c", "🧭"], poetry: ["#ffb3dc", "#c2337a", "🎵"], nonfiction: ["#c4ec7c", "#4b7d18", "🔬"], seasons: ["#ffc387", "#b8452b", "🍂"]
};
const GRADE_GLOW = { K: "#9ff0c8", 1: "#d9f79a", 2: "#b8e6ff", 3: "#ffd8a8", 4: "#ffc4e6", 5: "#d6c8ff" };

/* ───────────── Tuning (Section 4, starting values; one table per grade) ───────────── */
const TUNE = {
  sim: { easy: .5, normal: .62, unique: .55, hard: .8 },
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
let P = Object.assign({ v: 1, lang: defaultLang, grade: null, browse: "grade", genre: "fairy", showRead: 1, under: 1, calm: 1, say: 1, onb: 0, b: {} }, LS.get("shellfie_v1", {}), readCookie() || {});
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

/* ───────────── Developer log (parent area → developer mode). Rolling 3 days, kept on this device only. ─────────────
   Each entry: [epoch ms, type, data]. Types: session, page, asr, align, miscue-accepted, jump, refocus, hop, hesitate,
   ladder, quick-say, move-along, nudge, complete, skip-next, back, pause, resume, listener, tts, quiz, profile,
   settings, error. "why" fields record the rule the app followed. */
const APP_VERSION = "2026.11.07-g";
const APP_BUILT = "2026-11-07T21:00Z";   // when this version was published
const DEV_KEY = "shellfie_devlog", DEV_DAYS = 3;
let DEVBUF = [], devT = null;
const devOn = () => !!LS.get("shellfie_dev", 0);
function dlog(type, data) {
  DEVBUF.push([Date.now(), type, data || {}]);
  if (!devT) devT = setTimeout(devFlush, 2500);
}
function devFlush() {
  devT = null; if (!DEVBUF.length) return;
  try {
    const arr = LS.get(DEV_KEY, []).concat(DEVBUF); DEVBUF = [];
    const cut = Date.now() - (devOn() ? DEV_DAYS * 864e5 : 30 * 60e3);   // developer mode keeps 3 days; otherwise 30 minutes
    let i = 0; while (i < arr.length && arr[i][0] < cut) i++;
    let keep = arr.slice(i); if (keep.length > 30000) keep = keep.slice(-30000);
    localStorage.setItem(DEV_KEY, JSON.stringify(keep));
  } catch { DEVBUF = []; }
}
addEventListener("pagehide", devFlush);
addEventListener("error", e => dlog("error", { msg: String(e.message), src: e.filename, line: e.lineno, col: e.colno }));
addEventListener("unhandledrejection", e => dlog("error", { msg: "unhandled rejection: " + String(e.reason && (e.reason.stack || e.reason)) }));
function devText(sinceMs) {
  devFlush();
  const arr = LS.get(DEV_KEY, []).filter(e => !sinceMs || e[0] >= Date.now() - sinceMs);
  const pad = n => String(n).padStart(2, "0");
  const fmt = ms => { const d = new Date(ms); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${String(d.getMilliseconds()).padStart(3, "0")}`; };
  const head = [
    "SHELLFIE DEVELOPER LOG", `app ${APP_VERSION} · exported ${fmt(Date.now())} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`,
    `device: ${navigator.userAgent}`, `screen ${screen.width}×${screen.height} · window ${innerWidth}×${innerHeight} · dpr ${devicePixelRatio} · ${matchMedia("(orientation: landscape)").matches ? "landscape" : "portrait"}`,
    `speech recognition: ${SR ? "available" : "none"} · engine ${engineInfo()} · voices ${VOICES.length}`,
    `settings: ${JSON.stringify({ lang: P.lang, grade: P.grade, under: P.under, calm: P.calm, showRead: P.showRead })}`,
    `reader profile: ${JSON.stringify(P.prof || null)} · calibrating: ${CAL ? JSON.stringify({ words: CAL.words }) : "no"}`,
    `progress: ${Object.keys(P.b).length} books touched · ${Math.round(L.sec / 60)} min read · ${L.help.length} help events`,
    `entries: ${arr.length} (${sinceMs ? "last " + Math.round(sinceMs / 60000) + " minutes" : "last " + DEV_DAYS + " days"})`,
    `reading settings: say-the-word ${P.say ? "on" : "off"} · calm ${P.calm ? "on" : "off"} · style ${styleName()}`,
    "For debugging: paste this whole log into Claude and describe what happened and roughly when.", "time | +since previous | type | details", "─".repeat(60)];
  let prev = 0;
  const lines = arr.map(([t, ty, d]) => { const gap = prev ? "+" + ((t - prev) / 1000).toFixed(1) + "s" : ""; prev = t; return `${fmt(t)} ${gap.padStart(8)} ${ty.padEnd(16)} ${JSON.stringify(d)}`; });
  return head.concat(lines).join("\n");
}

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

/* ───────────── Speech patterns: accept how a child talks (accent, dialect, speech-therapy sounds) ─────────────
   Each pattern rewrites the PAGE word into the ways a child might say it. A heard word that matches a rewrite is
   counted as read correctly. Easy/Normal/Unique words accept every pattern; Hard words accept the patterns in the
   reader's profile (so real decoding mistakes on hard words are still noticed). */
const endDrop = w => {
  const o = [];
  if (w.length > 3) {
    o.push(w.replace(/ing$/, "in"), w.replace(/ed$/, ""), w.replace(/(?<=\w)s$/, ""), w.replace(/[^aeiouy]$/, ""), w.replace(/([^aeiouy])[^aeiouy]$/, "$1"));
  }
  return o;
};
const PATTERNS = {
  en: {
    th: w => [w.replace(/^th/, "d"), w.replace(/th/g, "t"), w.replace(/th/g, "f"), w.replace(/th/g, "d"), w.replace(/th/g, "s"), w.replace(/th$/, "f")],
    rw: w => [w.replace(/r(?=[aeiouy])/g, "w")],
    lw: w => [w.replace(/l(?=[aeiouy])/g, "w"), w.replace(/l(?=[aeiouy])/g, "y")],
    rl: w => [w.replace(/r/g, "l"), w.replace(/l/g, "r")],
    sh: w => [w.replace(/sh/g, "s"), w.replace(/ch/g, "sh"), w.replace(/s(?!h)/g, "th")],
    v: w => [w.replace(/v/g, "w"), w.replace(/v/g, "b")],
    fin: endDrop,
    nr: w => [w.replace(/([aeiou])r(?![aeiou])/g, "$1"), w.replace(/([aeiou])r(?![aeiou])/g, "$1h"), w.replace(/er$/, "a")]
  },
  es: {
    s: w => [w.replace(/s$/, ""), w.replace(/s(?=[^aeiouáéíóú])/g, ""), w.replace(/s(?=[^aeiouáéíóú])/g, "j")],
    ado: w => [w.replace(/ado$/, "ao"), w.replace(/ada$/, "á"), w.replace(/ido$/, "ío")],
    rl: w => [w.replace(/r(?![aeiouáéíóú])/g, "l"), w.replace(/rr/g, "r"), w.replace(/^r/, "d")],
    fin: endDrop
  }
};
function variantsOf(w, lang) {
  if (w.vars) return w.vars;
  const P1 = PATTERNS[lang], out = [], seen = new Set([w.n]);
  const add = (v, f) => { if (v && v.length >= 2 && !seen.has(v)) { seen.add(v); out.push([v, f]); } };
  for (const f in P1) for (const v of P1[f](w.n)) {
    add(v, f);
    for (const g in P1) if (g !== f) for (const v2 of P1[g](v)) add(v2, f + "+" + g);
  }
  return (w.vars = out);
}
function patternMatch(hn, w, lang) {
  // returns the pattern name(s) that explain the heard word, or null
  if (!hn || hn.length < 2 || w.n.length < 2 || Math.abs(hn.length - w.n.length) > 4) return null;
  const h0 = hn[0], w0 = w.n[0];
  const okStart = h0 === w0 || (w.n.startsWith("th") && "dtfs".includes(h0)) || (w0 === "r" && "wld".includes(h0)) || (w0 === "l" && "wyr".includes(h0)) ||
    (w0 === "v" && "wb".includes(h0)) || (w0 === "s" && h0 === "t") || (w0 === "c" && h0 === "s");
  if (!okStart) return null;
  const a = lang === "es" ? stripAcc(hn) : hn;
  for (const [v, f] of variantsOf(w, lang)) {
    const b = lang === "es" ? stripAcc(v) : v;
    if (a === b || (b.length >= 5 && ratio(a, b) >= .86)) return f;
  }
  // a dropped ending heard as a clean prefix ("jump" for "jumping")
  if (w.n.startsWith(hn) && hn.length >= 3 && hn.length >= .6 * w.n.length) return "fin";
  return null;
}

/* ───────────── Reader profile (saved in the shellfie_v1 cookie as P.prof) ─────────────
   Measured over the first ~120 words of a new reader, the first reading of each day, or the next book after a
   parent asks for a re-check. It sets a style that tunes wait times and help, plus the speech patterns to accept. */
const STYLES = {
  speedy:  { hes: .85, idle: 1,   fix: .8, wait: 1   },
  steady:  { hes: 1,   idle: 1,   fix: 1,  wait: 1   },
  careful: { hes: 2.4, idle: 2.2, fix: 1.6, wait: 1.6 }
};
const CAL_WORDS = 120, CAL_BY_GRADE = { K: 50, 1: 70, 2: 100, 3: 120, 4: 120, 5: 120 };
const calTarget = () => CAL_BY_GRADE[(R && R.s && R.s.grade) || P.grade || "3"] || CAL_WORDS;
const TSC = () => window.__SHELLFIE_TIMESCALE || 1;
const hesitateMs = g => TUNE.hesitate[g] * STY().hes * TSC();
const idlePause = () => TUNE.idlePause * STY().idle * TSC();
const selfFixMs = g => TUNE.selfFix[g] * STY().fix * TSC();
const todayStr = () => new Date().toISOString().slice(0, 10);
function prof() { return P.prof || null; }
function styleName() { const p = prof(); return (p && p.force) || (p && p.st) || "steady"; }
const LEARNING = { hes: 2.2, idle: 2, fix: 1.4, wait: 1.4 };   // gentle timing until Shellfie knows the reader
function STY() { const p = prof(); if (CAL && !(p && p.force) && !(p && p.st)) return LEARNING; return STYLES[styleName()] || STYLES.steady; }
let CAL = null;   // calibration in progress (kept across books until ~120 words are measured)
function patternOn(f) {
  const p = prof(); if (!p) return false;
  return f.split("+").every(x => (p.fo && x in p.fo) ? !!p.fo[x] : (p.f || []).includes(x));
}
function needsCalibration() { const p = prof(); return !p || !!p.re || (!p.lock && p.d !== todayStr()); }
function finishCalibration(cal, partial) {
  if (!cal || cal.words < (partial ? 40 : calTarget())) return false;
  const mins = Math.max(cal.ms / 60000, .05), wcpm = Math.round(cal.words / mins);
  const gaps = cal.gaps.slice().sort((a, b) => a - b), med = Math.round(gaps.length ? gaps[gaps.length >> 1] : 600);
  const slips = Math.round((cal.subs + cal.helps) / cal.words * 1000) / 10;
  const feats = Object.entries(cal.feat).filter(([, n]) => n >= 2 && n / cal.words * 100 >= 1.2).map(([f]) => f);
  const old = prof();
  let st = wcpm >= 110 && med < 450 ? "speedy" : (wcpm < 50 || med > 1100) ? "careful" : "steady";
  const blend = old && !old.re && old.n >= 50;
  const nw = blend ? Math.round(old.w * .7 + wcpm * .3) : wcpm, ng = blend ? Math.round(old.g * .7 + med * .3) : med;
  if (blend) st = nw >= 110 && ng < 450 ? "speedy" : (nw < 50 || ng > 1100) ? "careful" : "steady";
  P.prof = Object.assign({}, old || {}, {
    st, w: nw, g: ng, e: blend ? Math.round((old.e * .7 + slips * .3) * 10) / 10 : slips,
    f: [...new Set([...(blend ? old.f || [] : []), ...feats])], n: (old?.n || 0) + cal.words, d: todayStr(), re: 0
  });
  saveP();
  return true;
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
  const paras = text.split(/\n\s*\n/); const words = []; let sent = 0, start = true; const html = [];
  let pi = -1;
  for (const para of paras) {
    pi++;
    if (para.startsWith("## ")) { html.push(`<p class="ph">${h(para.slice(3))}</p>`); sent++; start = true; continue; }
    const parts = [];
    const toks = para.replace(/\n/g, " \u2028 ").split(/[ \t]+/).filter(Boolean);
    for (const t of toks) {
      if (t === "\u2028") { parts.push("<br>"); continue; }
      const n = norm(t, lang);
      if (!n) { parts.push(`<span class="pw">${h(t)}</span>`); continue; }
      const w = { t, n, k: key(n, lang), st: 0, sent, i: words.length, para: pi };
      w.tier = tierFor(w, words.length, grade, lang, start);
      start = false;
      parts.push(`<span class="w" data-i="${w.i}">${h(t)}</span>`); words.push(w);
      if (/[.!?…]["”»)]*$/.test(t) || /[.!?]["”»]?$/.test(t)) { sent++; start = true; }
    }
    html.push(`<p>${parts.join(" ").replace(/ <br> /g, "<br>")}</p>`);
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
  if (SCREEN === "reader") return;   // no sound effects while reading
  const c = ac(); if (!c) return; let t = c.currentTime + .01; if (P.calm) vol *= .5;
  for (const f of freqs) { const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .015); g.gain.exponentialRampToValueAtTime(.001, t + dur); o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + .02); t += gap; }
}
const SFX = {
  chirp: () => tone([660, 990, 1320], { type: "triangle", dur: .1, gap: .08 }),
  sparkle: () => tone([1568, 2093, 2637], { type: "triangle", dur: .09, gap: .05, vol: .1 }),
  shell: () => tone([880, 1320], { type: "sine", dur: .18, gap: .1, vol: .14 }),
  yay: () => tone([523, 659, 784, 1047, 1319], { type: "triangle", dur: .16, gap: .09, vol: .14 }),
  soft: () => tone([392, 330], { type: "sine", dur: .14, gap: .1, vol: .1 }),
  flip(back) {
    if (SCREEN === "reader") return;
    const c = ac(); if (!c) return; const len = .38, buf = c.createBuffer(1, c.sampleRate * len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 1.6);
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = buf; f.type = "bandpass"; f.Q.value = .9;
    const t = c.currentTime; f.frequency.setValueAtTime(back ? 700 : 2600, t); f.frequency.exponentialRampToValueAtTime(back ? 2400 : 650, t + len); g.gain.value = .22;
    s.connect(f).connect(g).connect(c.destination); s.start(t);
  }
};
function sayWord(text, opts = {}) {
  // the only audio while reading: Shellfie says the word (parent setting "Shellfie says the word")
  if (!P.say) return sleep((opts.rate && opts.rate < .85 ? 650 : 900) * TSC());
  return speak(text, opts);
}
function showSay(text, ms = 2200) {
  const a = $("#rAvatar"); if (!a) return;
  let b = $("#saybubble"); if (!b) { b = document.createElement("div"); b.id = "saybubble"; b.className = "saybubble"; document.body.appendChild(b); }
  b.textContent = text; b.classList.add("on");
  const r = a.getBoundingClientRect(); b.style.top = (r.bottom + 8) + "px"; b.style.right = Math.max(8, innerWidth - r.right) + "px";
  clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove("on"), ms);
  dlog("prompt", { text });
}
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
    if (window.__SHELLFIE_TEST) return res();
    if (!("speechSynthesis" in window)) return res();
    try {
      const u = new SpeechSynthesisUtterance(text); const v = pickVoice(lang);
      dlog("tts", { text: text.slice(0, 60), voice: v ? v.name + " " + v.lang : "default", rate }); if (v) u.voice = v; u.lang = v ? v.lang : (lang === "es" ? "es-MX" : "en-US"); u.rate = rate; u.pitch = 1.05;
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
    this.alive = now(); this.running = false; this.restarts = 0; this.sessionStart = 0; this.results = 0; this.blocked = false;
    r.onresult = e => { this.fails = 0; this.alive = now(); this.results++; this.onResult(e); };
    r.onspeechstart = () => { this.alive = now(); this.onActivity?.("speech"); };
    r.onaudiostart = () => { this.alive = now(); dlog("listener", { event: "audio-start" }); };
    r.onaudioend = () => dlog("listener", { event: "audio-end", sessionMs: this.sessionStart ? now() - this.sessionStart : 0 });
    r.onnomatch = () => dlog("listener", { event: "no-match" });
    r.onstart = () => { this.starting = false; this.running = true; this.alive = now(); this.sessionStart = now(); this.results = 0; dlog("listener", { event: "start", restarts: this.restarts }); this.onActivity?.("start"); };
    r.onerror = e => { dlog("listener", { event: "error", code: e.error, msg: e.message || "", sinceResultMs: now() - this.alive, ours: !!this.aborting });
      this.starting = false;
      if ((e.error === "aborted" || e.error === "no-speech") && !this.aborting) {
        // iOS sometimes aborts by itself and never sends "end": make sure listening comes back
        const at = now(); this.errAt = at;
        setTimeout(() => { if (this.active && !this.paused && !this.blocked && this.errAt === at && (this.endAt || 0) < at) { dlog("listener", { event: "recover", why: "aborted with no end event" }); this.running = false; this._start(); } }, 1200);
      }
      if (e.error === "not-allowed" || e.error === "service-not-allowed" || e.error === "audio-capture") { this.blocked = true; this.onActivity?.("blocked:" + e.error); } if (e.error === "not-allowed" || e.error === "service-not-allowed") { this.active = false; this.onActivity?.("denied"); } else if (e.error !== "no-speech" && e.error !== "aborted") this.fails++; };
    r.onend = () => { this.running = false; this.starting = false; this.aborting = false; this.endAt = now(); dlog("listener", { event: "end", willRestart: this.active && !this.paused && !this.blocked, sessionMs: this.sessionStart ? now() - this.sessionStart : 0, results: this.results }); this.onActivity?.("end"); if (this.blocked) return; this.restarts++; if (this.active && !this.paused && this.fails < 6) setTimeout(() => { if (this.active && !this.paused) this._start(); }, 120); };
  }
  start(uniqueWords = []) {
    this.active = true;
    // Start synchronously so a retry button retains the browser user gesture.
    this.setPhrases(uniqueWords);
    this._start();
  }
  setPhrases(words) {
    // Some browsers expose phrase biasing but reject it when recognition starts.
    // Recognition without hints is preferable to failing to listen at all.
  }
  _start() {
    if (!this.rec || this.running || this.starting) return;
    this.starting = true;
    try { this.rec.start(); }
    catch (e) {
      this.starting = false; const err = String(e && (e.name || e.message || e));
      dlog("listener", { event: "start-failed", err });
      // still shutting down from the last abort: try again shortly (the end event also restarts it)
      if (/InvalidState/.test(err)) setTimeout(() => { if (this.active && !this.paused && !this.running) this._start(); }, 400);
    }
  }
  restart(why) { dlog("listener", { event: "watchdog-restart", why }); this.aborting = true; try { this.rec.abort(); } catch { } this.running = false; this.starting = false; this.alive = now(); setTimeout(() => { if (this.active && !this.paused) this._start(); }, 250); }
  pause() { this.paused = true; this.aborting = true; try { this.rec.abort(); } catch { } }
  resume() { if (!this.active) return; this.paused = false; this._start(); }
  destroy() { this.active = false; this.paused = true; try { this.rec.onend = this.rec.onresult = this.rec.onerror = this.rec.onstart = this.rec.onspeechstart = this.rec.onaudiostart = this.rec.onaudioend = this.rec.onnomatch = null; this.rec.abort(); } catch { } this.rec = null; }
}
function fmtWhen(d) { try { return new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }); } catch { return String(d); } }
async function showVersion() {
  const el = $("#verLine"); if (!el) return;
  const base = `v${APP_VERSION} · ` + (P.lang === "es" ? "publicada " : "published ");
  el.textContent = base + fmtWhen(APP_BUILT);
  try {   // the server's own date for app.js, when it gives one
    const r = await fetch("app.js", { method: "HEAD", cache: "no-store" }); const lm = r.headers.get("last-modified");
    if (lm && !isNaN(Date.parse(lm))) el.textContent = base + fmtWhen(lm);
  } catch { }
}
function engineInfo() { return SR ? "webspeech" : "tap"; }
// older versions saved "tap" forever after one failed mic check; forget it so the mic is tried again
try { if (localStorage.getItem("shellfie_engine")) { localStorage.removeItem("shellfie_engine"); } } catch { }

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
  if (P.calm && SCREEN === "reader" && el && el.id === "rAvatar") {
    state = state && state.includes("sleeping") ? "sleeping" : (state ? "listening" : "");
    if (t._mood === state) return; t._mood = state;
  } else t._mood = null;
  t.classList.remove("listening", "following", "thinking", "celebrating", "sleeping");
  if (state) { void t.getBoundingClientRect(); t.classList.add(...state.split(" ")); }
}

/* ───────────── UI helpers ───────────── */
let toastT;
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 2600); }
function confetti(n = 46) {
  if (REDUCED) return; if (P.calm) n = Math.min(n, 14); const c = document.createElement("div"); c.className = "confetti";
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
  document.body.classList.toggle("reading", id === "reader");
  document.body.classList.toggle("calm", !!P.calm);
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
function dailyChapter(s) {
  // 365 Bedtime Stories: open on tonight's story (chapter titles start "NOVEMBER 7:")
  const d = new Date(), tag = d.toLocaleString("en-US", { month: "long" }).toUpperCase() + " " + d.getDate() + ":";
  let i = s.chapters.findIndex(c => (c.title || "").toUpperCase().startsWith(tag));
  if (i < 0) { const doy = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5); i = Math.min(s.chapters.length - 1, Math.round(doy / 366 * s.chapters.length)); }
  return i;
}
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
    let ok = false, stream;
    if (navigator.mediaDevices?.getUserMedia) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
        src.disconnect();
      } catch { ok = false; }
      finally { stream?.getTracks().forEach(t => t.stop()); }
    }
    if (!SR || !ok) {
      dlog("mic", { state: "onboarding check failed", recognizer: !!SR, why: !SR ? "no speech recognition in this browser" : "microphone not allowed yet; will ask again when a book opens" });
      $("#micHint").hidden = false; $("#micHint").textContent = !SR ? T().noRec : T().micDenied;
      $("#letsRead").hidden = false; $("#letsRead").onclick = finish; return;
    }
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
  const st = b.id ? bookState(b.id) : null, pc = b.id ? pcOf(b.id) : null;
  const [c1, c2, gi] = GENRE_STYLE[b.g];
  const done = st?.[0] === 2, prog = st?.[0] === 1;
  const cls = ["book", !b.id && "soon", done && "read"].filter(Boolean).join(" ");
  const acc = done && st[3] != null ? st[3] : null;
  const pg = prog ? (() => { let n = 0; for (let ci = 0; ci < st[1] && ci < pc.length; ci++) n += pc[ci]; return n + st[2] + 1; })() : 0;
  return `<button class="${cls}" data-id="${b.id || ""}" data-g="${g}" title="${h(b.t)}">
    <div class="cover" style="--cv:linear-gradient(160deg,${c1},${c2})">
      ${b.star ? `<span class="star">⭐</span>` : ""}${!b.id ? `<span class="tag">${h(T().soon)}</span>` : ""}
      <span class="em">${b.icon || gi}</span><span class="ttl">${h(b.t)}</span></div>
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
let opening = 0;
async function openBook(id, { restart = false, ch: atCh = null } = {}) {
  if (!META[id]) return;
  const ticket = ++opening;
  let s;
  try { s = await loadBook(id); } catch { toast(T().offline); return; }
  if (ticket !== opening) return;
  if (LISTENER) { LISTENER.destroy(); LISTENER = null; }
  $("#micAsk")?.remove();
  BOOK = s;
  const st = bookState(id);
  let ch = 0, pg = 0;
  if (atCh != null) ch = atCh;
  else if (!restart && st && st[0] === 1) { ch = st[1] || 0; pg = st[2] || 0; }
  else if (s.daily) ch = dailyChapter(s);
  if (ch >= s.chapters.length) { ch = 0; pg = 0; }
  if (pg >= s.chapters[ch].pages.length) pg = 0;
  setBook(id, { 0: st?.[0] || 1, 1: ch, 2: pg });
  R = { lenient: new Set(), attempts: {}, s, ch, pg, sub: 0, parts: null, words: [], anchor: 0, tent: new Set(), ladder: null, epoch: 0, processed: -1, lastProg: now(), started: false, completing: false, sentNotified: new Set(),
    tap: engineInfo() === "tap" || !SR, sess: { c: 0, h: 0, shells: 0, sec: 0, nailed: new Set(), helped: [], pages: 0, t0: now() } };
  if (!R.tap && needsCalibration() && !CAL) CAL = { words: 0, ms: 0, gaps: [], subs: 0, helps: 0, feat: {}, started: now() };
  R.cal = R.tap ? null : CAL;
  if (["reader", "quiz", "results"].includes(SCREEN)) history.replaceState({ s: "reader" }, ""); else history.pushState({ s: "reader" }, "");
  show("reader"); mountTurtles($("#reader"));
  $("#rTitle").textContent = s.title; $("#rShells span").textContent = L.shells + L.sp.length;
  $("#rMode").hidden = !R.tap; $("#rMode").textContent = T().tapMode;
  $("#rNext").title = T().holdSkip;
  $("#rMode").onclick = () => { if (R && R.tap && SR) { R.tap = false; showMicAsk(); } };
  dlog("session", { book: id, title: s.title, lang: s.lang, grade: s.grade, ch, pg, chapters: s.chapters.length, tap: R.tap, style: styleName(), profile: P.prof || null, calibrating: !!R.cal, calWords: CAL ? CAL.words : 0, view: `${innerWidth}x${innerHeight}` });
  renderPage();
  if (!R.tap) startListening();
  clearInterval(tickT); tickT = setInterval(tick, Math.max(20, 250 * TSC()));
}
function startListening() {
  try {
    LISTENER = new WebSpeechListener(P.lang, onSpeech, onActivity);
    const current = LISTENER;
    try { navigator.permissions?.query({ name: "microphone" }).then(p => {
      if (LISTENER !== current) return;
      current.permission = p.state; current.permissionSince = now(); dlog("mic", { permission: p.state });
      p.onchange = () => { if (LISTENER === current) { current.permission = p.state; current.permissionSince = current.alive = now(); dlog("mic", { permission: p.state, changed: true }); } };
    }).catch(() => {}); } catch {}
    LISTENER.start(uniqueWords());
    mood($("#rAvatar"), "listening");
    dlog("mic", { state: "starting", engine: "webspeech", recognizer: SR && SR.name, why: "book opened" });
    const L0 = LISTENER;
    setTimeout(() => {
      if (!R || LISTENER !== L0 || R.tap || R.paused) return;
      if (!L0.running && !L0.results && L0.permission !== "prompt") { dlog("mic", { state: "did not start", waitedMs: 2500, why: "no start event from the recognizer; ask for a tap so the browser can turn the microphone on" }); showMicAsk(); }
    }, 2500 * TSC());
  } catch (e) { dlog("mic", { state: "start threw", err: String(e && (e.name || e.message || e)), why: "show the microphone button" }); showMicAsk(); }
}
function uniqueWords() { return R ? R.words.filter(w => w.tier === "unique").map(w => w.t.replace(/[^\p{L}\p{N}'-]/gu, "")) : []; }
function onActivity(kind) {
  if (!R) return;
  if (kind === "start") { R.watchdog = 0; R.epoch = 0; R.processed = -1; R.used = {}; R.resLen = {}; R.sealed = {}; }
  if (kind === "speech") { R.heard = now(); }
  if (kind === "denied" || String(kind).startsWith("blocked")) { dlog("mic", { state: "blocked", why: kind, asks: R.micAsks || 0 }); showMicAsk(); }
}
/* Restart a listener that ended or is stuck starting. Silence while running is normal.
   After repeated unsuccessful restarts, offer the reader a retry. */
function micWatchdog(t) {
  const Lr = LISTENER; if (!Lr || !Lr.active || Lr.paused || Lr.blocked || !R || R.paused) return;
  if (Lr.permission === "prompt") {
    if (t - Lr.permissionSince > 60000 * TSC()) showMicAsk();
    return;
  }
  const quiet = t - Lr.alive;
  // A running recognizer can legitimately be silent while a child thinks.
  if (!Lr.running && quiet > (Lr.starting ? 12000 : 3000) * TSC()) {
    R.watchdog = (R.watchdog || 0) + 1;
    if (R.watchdog > 3) { dlog("mic", { state: "unresponsive", quietMs: quiet, why: "3 restarts with no sign of life" }); showMicAsk(); return; }
    Lr.restart(Lr.starting ? "stuck starting" : "ended and did not restart");
  }
}
function showMicAsk() {
  if (!R || $("#micAsk")) return;
  R.micAsks = (R.micAsks || 0) + 1;
  LISTENER?.pause();
  const d = document.createElement("div"); d.id = "micAsk"; d.className = "r-pause";
  d.innerHTML = `<div class="card">${turtleSVG("listening")}<h3>${h(T().micAgain)}</h3><button class="btn" id="micAskBtn">🎤 ${h(T().micTap)}</button><button class="btn ghost" id="micSkipBtn" style="margin-top:10px">${h(T().micSkip)}</button><p class="hint" style="max-width:420px">${h(T().micHelp)}</p></div>`;
  $("#reader").appendChild(d);
  $("#micAskBtn").onclick = () => {
    // start the recognizer inside the tap itself: iOS Safari only turns the microphone on from a user gesture
    ac(); d.remove();
    if (LISTENER) { LISTENER.destroy(); LISTENER = null; }
    if (!R) return;
    R.watchdog = 0; R.tap = false; $("#rMode").hidden = true; R.lastProg = now();
    dlog("mic", { state: "tapped to start", why: "child tapped the microphone button" });
    startListening();
  };
  $("#micSkipBtn").onclick = () => {
    d.remove(); if (LISTENER) { LISTENER.destroy(); LISTENER = null; }
    if (R) { R.tap = true; $("#rMode").hidden = false; $("#rMode").textContent = T().tapMode; R.lastProg = now(); }
    dlog("mic", { state: "reading without mic", why: "child chose tap-for-help for this book; the microphone is tried again next book" });
  };
}
function teardown() {
  // Release every listening resource: recognizer, mic, audio graph, speech, timers, story data.
  clearInterval(tickT); tickT = null; clearTimeout(hiddenT); $("#micAsk")?.remove();
  if (LISTENER) { LISTENER.destroy(); LISTENER = null; }
  try { speechSynthesis.cancel(); } catch { }
  if (AC) { try { AC.close(); } catch { } AC = null; }
  if (R) { flushTime(); R = null; }
  BOOK = null; opening++;
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
  if (/[^\n]\n[^\n]/.test(full) || fitSize(full) >= floor) return [full];
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
  sealResults();
  const s = R.s, g = s.grade, full = chapterPages()[R.pg];
  const pt = $("#pageText");
  const doFlip = dir !== 0;
  let leaf;
  if (doFlip) {
    leaf = document.createElement("div"); leaf.className = "leaf";
    if (dir > 0) leaf.innerHTML = `<div class="page-text ${pt.className.replace("page-text", "")}" style="${pt.getAttribute("style") || ""}">${pt.innerHTML}</div>`;
  }
  R.parts = splitPage(full, g, s.lang); R.sub = sub === "last" ? R.parts.length - 1 : Math.min(sub, R.parts.length - 1);
  const text = R.parts[R.sub], isPoem = /[^\n]\n[^\n]/.test(text);
  const { words, html } = tokenize(text, g, s.lang);
  pt.className = "page-text" + (isPoem ? " poem" : "") + (P.under && GI(g) <= 2 ? " dots" : "");
  pt.innerHTML = `<div class="inner">${html}</div>`;
  R.words = words; R.anchor = 0; R.jump = null; R.focusing = false; R.tent.clear(); R.pageLadders = 0; R.attempts = {};
  words.forEach(w => { if (R.lenient.has(w.n) && w.tier !== "easy") w.tier = "easy"; }); R.started = false; R.completing = false; R.sentNotified.clear(); R.lastProg = now(); R.pageT0 = now(); R.ladder = null;
  words.forEach(w => w.el = pt.querySelector(`[data-i="${w.i}"]`));
  if (R.s.chapters[R.ch].title && R.pg === 0 && R.sub === 0) pt.querySelector(".inner").insertAdjacentHTML("afterbegin", `<p style="font-size:.6em;font-family:var(--ui);font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--forest-3);margin-bottom:.6em">${h(T().chapter)} ${R.ch + 1} · ${h(R.s.chapters[R.ch].title)}</p>`);
  fitText(pt, g);
  if (doFlip) {
    if (dir < 0) leaf.innerHTML = `<div class="${pt.className}" style="${pt.getAttribute("style") || ""}">${pt.innerHTML}</div>`;
    $("#stage").appendChild(leaf); SFX.flip(dir < 0);
    leaf.classList.add(REDUCED || P.calm ? (dir > 0 ? "slide-f" : "slide-b") : (dir > 0 ? "fwd" : "back"));
    setTimeout(() => leaf.remove(), REDUCED || P.calm ? 360 : 540);
  }
  dlog("page", { ch: R.ch, pg: R.pg, sub: R.sub, parts: R.parts.length, words: words.length, hard: words.filter(w => w.tier === "hard").map(w => w.n), names: words.filter(w => w.tier === "unique").map(w => w.n), lenient: [...R.lenient], font: pt.style.fontSize, dir });
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
  const pend = R.words.find(w => !w.st && !R.tent.has(w.i)); return pend ? pend.i : -1;
}
function updateCursor() {
  if (R) $("#reader").classList.toggle("tapmode", !!R.tap);
  if (!R) return; const c = cursorIndex();
  R.words.forEach(w => {
    w.el.classList.toggle("next", w.i === c);
    w.el.classList.toggle("read", w.st === 1); w.el.classList.toggle("helped", w.st === 2);
    w.el.classList.toggle("tent", !w.st && R.tent.has(w.i));
    w.el.classList.toggle("hard", w.tier === "hard");
    w.el.classList.toggle("pending", !w.st && w.i < R.anchor && (w.tier === "hard" || w.tier === "unique"));
  });
}

/* Alignment (Section 4): match the latest hypothesis words to unread page words. A candidate is scored by how many
   following words also line up (a short Smith–Waterman-style run), so one common word ("the") never drags the cursor
   somewhere wrong, while a run of 3+ matching words anywhere on the page is trusted (skipped line / paragraph).
   Words already read are transparent: after a refocus, reading flows straight past the part read earlier. */
const isReq = w => w.tier === "hard";          // only Hard words are required / corrected
const isName = w => w.tier === "unique";       // names & rare words: accepted generously, never block a page
function matchAt(hyps, i, k, lang) {
  const w = R.words[k];
  // up to 6 pieces: a word sounded out slowly arrives as fragments ("s", "pi", "lls") that belong together
  for (let j = 1; j <= 6 && i + j <= hyps.length; j++) {
    const hw = j === 1 ? hyps[i] : hyps.slice(i, i + j).join("");
    if (j > 1 && hw.length > w.n.length + 2) break;
    if (isDistractor(hw, w, lang)) return null;     // a likely misreading (spells for spills) is not a match
    const s = sim(hw, w, lang);
    if (s >= TUNE.sim[w.tier]) return [s, j];
  }
  // how this child says it (accent, dialect, speech sounds, dropped endings) counts as read
  const f = patternMatch(hyps[i], w, lang);
  if (f && (w.tier !== "hard" || patternOn(f) || R.cal)) return [.8, 1, f];
  return null;
}
/* Sounding out: a heard piece that starts the word ("spi" for "spills"), or a syllable inside it, from a child
   working through the word slowly. Pieces are stitched back together by matchAt; on their own they pause the help timer. */
function isFragment(hn, w, lang) {
  if (!hn || hn === w.n || hn.length >= w.n.length) return false;
  const a = lang === "es" ? stripAcc(hn) : hn, b = lang === "es" ? stripAcc(w.n) : w.n;
  if (b.startsWith(a)) return true;
  if (a.length >= 2 && b.includes(a)) return true;
  return syllables(w.n, lang).some(sy => (lang === "es" ? stripAcc(sy.toLowerCase()) : sy.toLowerCase()) === a);
}
/* Likely misreadings ("distractors"): the same consonants with different vowels (spills/spells, hat/hit), plus
   classic confusions. A child who changes only the vowel is almost always misreading, not being misheard. */
const CONFUSE = {
  en: [["through", "though", "thought", "tough", "throw", "threw"], ["horse", "house"], ["went", "want"], ["where", "were", "wear", "when"], ["then", "than", "them"],
       ["from", "form"], ["saw", "was"], ["quiet", "quite", "quit"], ["lose", "loose"], ["angel", "angle"], ["dairy", "diary"], ["sad", "said"], ["of", "off"], ["now", "own"],
       ["felt", "left"], ["stop", "spot", "pots"], ["girl", "grill"], ["early", "really"], ["every", "very"], ["could", "cloud"], ["trail", "trial"], ["united", "untied"]],
  es: [["pero", "perro"], ["casa", "caza", "cosa"], ["hombre", "hambre"], ["mesa", "misa"], ["peso", "piso", "paso"], ["pato", "palo", "plato"], ["sal", "las"],
       ["mano", "mono"], ["gato", "gota", "goto"], ["coro", "corro", "carro"], ["pelo", "pela", "palo"], ["llama", "lama"], ["dedo", "dado"]]
};
const HOMO = {
  en: [["meet","meat"],["read","red","reed"],["sea","see"],["week","weak"],["peace","piece"],["made","maid"],["tail","tale"],["pail","pale"],["sail","sale"],
       ["hear","here"],["dear","deer"],["bear","bare"],["pair","pear","pare"],["mail","male"],["road","rode"],["heel","heal"],["steel","steal"],["beat","beet"],
       ["flee","flea"],["tea","tee"],["plain","plane"],["rain","rein"],["wait","weight"],["stair","stare"],["fair","fare"],["lead","led"],["been","bin","ben"],
       ["son","sun"],["won","one"],["to","too","two"],["for","four"],["some","sum"],["know","no"],["would","wood"],["flower","flour"],["hole","whole"],["cent","sent","scent"]],
  es: [["casa","caza"],["vaca","baca"],["hola","ola"],["tuvo","tubo"],["vello","bello"]]
};
const VOWELS = { en: ["a", "e", "i", "o", "u", "ee", "ea", "oo", "ai", "oa", "ou", "ow"], es: ["a", "e", "i", "o", "u"] };
function distractorsOf(w, lang) {
  if (w.dis) return w.dis;
  const out = new Set(), base = lang === "es" ? stripAcc(w.n) : w.n;
  const groups = [...base.matchAll(/[aeiou]+/g)];
  for (const m of groups) for (const v of VOWELS[lang]) {
    if (v === m[0]) continue;
    out.add(base.slice(0, m.index) + v + base.slice(m.index + m[0].length));
  }
  for (const g of CONFUSE[lang]) if (g.includes(base)) g.forEach(x => out.add(x));
  out.delete(base);
  // same-sounding spellings are not misreadings (meet/meat, read/red, sea/see…)
  for (const g of HOMO[lang]) if (g.includes(base)) g.forEach(x => out.delete(x));
  // never treat an accepted speech pattern as a misreading
  for (const [v] of variantsOf(w, lang)) out.delete(v);
  return (w.dis = out);
}
function isDistractor(hn, w, lang) {
  if (!hn || w.tier === "easy" || isName(w) || w.n.length < 3) return false;
  const a = lang === "es" ? stripAcc(hn) : hn;
  return a !== (lang === "es" ? stripAcc(w.n) : w.n) && distractorsOf(w, lang).has(a);
}
function handleMisreads(list, hyps) {
  for (const k of list) {
    const w = R.words[k]; if (!w || w.st) continue;
    R.attempts[k] = (R.attempts[k] || 0) + 1;
    dlog("misread", { word: w.n, heard: hyps.join(" "), tier: w.tier, tries: R.attempts[k], action: isReq(w) ? "help-ladder" : "light-prompt", why: "heard a likely misreading (vowel swap / known confusion)" });
    if (R.ladder) { if (R.ladder.idx === k && R.attempts[k] >= 3) R.ladder.giveUp = true; continue; }
    if (isReq(w)) runLadder(k, "listen"); else lightPrompt(k);
    break;
  }
}
async function lightPrompt(idx) {
  // everyday word misread: a quiet underline-blink and a moment to self-correct, then keep reading
  const w = R.words[idx]; if (!w || w.st || R.ladder) return;
  const L0 = R.ladder = { idx, step: 1, light: true };
  R.sess.light = (R.sess.light || 0) + 1;
  w.el.classList.remove("prompt"); void w.el.offsetWidth; w.el.classList.add("prompt");
  const t0 = now();
  while (now() - t0 < selfFixMs(R.s.grade) + 600 * TSC()) { await sleep(100 * TSC()); if (!R || R.ladder !== L0) return; if (L0.fixed || w.st) break; }
  if (!R || R.ladder !== L0) return;
  w.el.classList.remove("prompt");
  const fixed = !!w.st;
  if (!w.st) { w.st = 2; R.sess.h++; logHelp(w.n, R.s.id, 1, "light"); }
  dlog("light-prompt", { word: w.n, end: fixed ? "self-corrected" : "moved on" });
  R.ladder = null; R.lastProg = now(); updateCursor(); checkComplete();
}
function runLen(hyps, i, k, lang, max = 5) {
  // consecutive matches from (hyp i, word k) over unread words; one slip (a skipped or extra word) is allowed
  let n = 0, a = i, b = k, slack = 1; const W = R.words;
  while (a < hyps.length && b < W.length && n < max) {
    if (W[b].st) { b++; continue; }
    const m = matchAt(hyps, a, b, lang);
    if (m) { n++; a += m[1]; b++; continue; }
    if (slack-- > 0) { let nb = b + 1; while (nb < W.length && W[nb].st) nb++; if (nb < W.length && matchAt(hyps, a, nb, lang)) { b = nb; continue; } a++; continue; }
    break;
  }
  return n;
}
function nextUnread(k) { while (k < R.words.length && R.words[k].st) k++; return k; }
function align(hyps, start) {
  const W = R.words, n = W.length, win = TUNE.window[R.s.grade], lang = R.s.lang, marks = [], subs = [], spans = [], feats = [], frags = [], misreads = [];
  let p = nextUnread(start), lastHit = -1, sounding = false;
  for (let i = 0; i < hyps.length; i++) {
    let best = -1, bs = -1, used = 1, feat = null;
    // near: the next `win` unread words from p
    let cnt = 0; const near = new Set();
    for (let k = p; k < n && cnt < win; k++) {
      if (W[k].st || marks.includes(k)) continue; cnt++; near.add(k);
      const m = matchAt(hyps, i, k, lang); if (!m) continue;
      const r = runLen(hyps, i, k, lang);
      const sc = m[0] + .35 * Math.min(r, 4) - (cnt - 1) * .06 - (m[1] - 1) * .02;
      if (sc > bs) { bs = sc; best = k; used = m[1]; feat = m[2]; }
    }
    // sounding out: a piece of the next word ("spi…") is the child working on it, not a mistake
    const cu = nextUnread(p);
    if (best < 0 && W[cu] && isFragment(hyps[i], W[cu], lang)) { frags.push(i); sounding = true; continue; }
    // a likely misreading of the next word (spells for spills, though for through)
    if (best < 0 && W[cu] && !isName(W[cu]) && W[cu].tier !== "easy" && isDistractor(hyps[i], W[cu], lang) && !misreads.includes(cu)) misreads.push(cu);
    // an extra word ("um", a stray "and"): if the next hyp word lines up nearby, just skip this one
    if (best < 0 && i + 1 < hyps.length) {
      let c2 = 0, ok = false;
      for (let k = p; k < n && c2 < win && !ok; k++) { if (W[k].st) continue; c2++; if (matchAt(hyps, i + 1, k, lang) && runLen(hyps, i + 1, k, lang) >= 2) ok = true; }
      if (ok) continue;
    }
    // far: anywhere else on the page (ahead = skipped lines; behind = going back to a skipped part) needs a run of 3
    const need = Math.min(3, hyps.length - i);
    if (need >= 2) for (let k = 0; k < n; k++) {
      if (W[k].st || near.has(k) || marks.includes(k)) continue;
      const m = matchAt(hyps, i, k, lang); if (!m) continue;
      const r = runLen(hyps, i, k, lang); if (r < need || (W[k].tier === "easy" && r < 4 && need >= 3)) continue;
      const sc = m[0] + .35 * Math.min(r, 5) - .75;
      if (sc > bs) { bs = sc; best = k; used = m[1]; feat = m[2]; }
    }
    // a single skipped Hard/Unique word said on its own ("…what was that word? mattresses!")
    if (best < 0) for (let k = 0; k < p; k++) {
      const w = W[k]; if (w.st || !isReq(w) || marks.includes(k)) continue;
      const s = sim(hyps[i], w, lang); if (s >= Math.max(.85, TUNE.sim[w.tier]) && s > bs) { bs = s; best = k; used = 1; }
    }
    if (best >= 0) {
      // substitution on a Hard/Unique word: the child said something else where it belongs, then carried on
      const pu = nextUnread(p);
      if (best > pu && nextUnread(pu + 1) === best && i > 0 && lastHit !== i - 1 && !frags.includes(i - 1) && isReq(W[pu]) && !marks.includes(pu) && sim(hyps[i - 1], W[pu], lang) < .66) subs.push(pu);
      marks.push(best); spans.push([best, i, i + used - 1]); if (feat) feats.push(feat.split("+")[0]); p = best + 1; lastHit = i + used - 1; i += used - 1;
    }
  }
  return { marks: [...new Set(marks)], end: p, subs, spans, feats, sounding, misreads: misreads.filter(k => !marks.includes(k)) };
}
function resWords(r) { return (r[0]?.transcript || "").split(/\s+/).map(w => norm(w, R.s.lang).replace(/(\p{L})\1{2,}/gu, "$1")).filter(Boolean); }
// words already heard in each recognizer result belong to the page they were heard on
function sealResults() { if (!R) return; R.used = R.used || {}; R.sealed = R.sealed || {}; for (const k in (R.resLen || {})) { R.used[k] = Math.max(R.used[k] || 0, R.resLen[k]); R.sealed[k] = R.used[k]; } R.tent?.clear(); }
function onSpeech(e) {
  if (!R) return;
  R.used = R.used || {}; R.resLen = R.resLen || {};
  for (let i = e.resultIndex; i < e.results.length; i++) R.resLen[i] = resWords(e.results[i]).length;
  if (R.completing || R.paused) return;
  const res = e.results; let interim = [];
  if (devOn()) { const last = res[res.length - 1]; if (last && (last.isFinal || !R._lastAsrLog || now() - R._lastAsrLog > 1200)) { R._lastAsrLog = now(); dlog("asr", { final: !!last.isFinal, text: last[0]?.transcript, conf: last[0]?.confidence != null ? Math.round(last[0].confidence * 100) / 100 : null, alts: [...last].slice(1).map(a => a.transcript), idx: res.length - 1 }); } }
  for (let i = Math.max(e.resultIndex, R.epoch); i < res.length; i++) {
    const r = res[i]; const all = resWords(r);
    const used = R.used[i] || 0, OV = 3, from = Math.max((R.sealed && R.sealed[i]) || 0, used - OV);   // a few words of context from this page only
    if (used >= all.length && !r.isFinal) continue;
    if (r.isFinal) { if (i > R.processed) { R.processed = i; const nw = all.slice((R.sealed && R.sealed[i]) || 0); if (all.length > ((R.sealed && R.sealed[i]) || 0)) commit(nw, true); R.used[i] = all.length; } if (!R || R.completing) return; continue; }
    // interim: the last word may still change ("spill" → "spilled"); everything before it is stable enough to count
    const exp = R.words[cursorIndex()]?.n;
    const stableN = all.length - (all[all.length - 1] === exp ? 0 : 1);
    if (stableN > used) {
      const nw = all.slice(from, stableN);
      R.used[i] = stableN; commit(nw, false, true);
      if (!R || R.completing) return;
    }
    interim.push(...all.slice(Math.max(stableN, used)));
  }
  if (!R || R.completing) return;
  // interim results move the highlight optimistically; finals confirm or roll back
  R.tent.clear();
  if (interim.length) { const { marks, sounding } = align(interim, R.anchor); marks.forEach(m => { if (!R.words[m].st) R.tent.add(m); }); if (sounding) R.lastSound = now(); }
  updateCursor();
}
const JUMP_MIN = 4;   // skipping this many unread words or more counts as a jump (1–3 are forgiven, as before)
function commit(hyps, final, stable = false) {
  const before = R.anchor, cur0 = cursorIndex();
  if (R.ladder && R.ladder.yourTurn) {
    const lw = R.words[R.ladder.idx], lang = R.s.lang;
    for (let i = 0; i < hyps.length && !R.saidIt; i++) for (let j = 1; j <= 6 && i + j <= hyps.length; j++) {
      const hw = hyps.slice(i, i + j).join("");
      if (sim(hw, lw, lang) >= Math.min(.8, TUNE.sim[lw.tier]) || patternMatch(hyps[i], lw, lang)) { R.saidIt = now(); break; }
    }
    if (!R.saidIt && hyps.some(x => isFragment(x, lw, lang))) R.lastSound = now();
    dlog("your-turn-heard", { heard: hyps.join(" "), said: !!R.saidIt });
    if (R.saidIt || hyps.every(x => isFragment(x, lw, R.s.lang))) return;
  }
  let { marks, subs, spans, feats, sounding, misreads } = align(hyps, R.anchor);
  if (stable) {
    const ok = new Set(); let last = cur0 < 0 ? R.words.length : cur0 - 1;
    for (const m of [...marks].sort((a, b) => a - b)) { if (R.words[m].st) { ok.add(m); continue; } if (m <= last + 3 && m >= cur0 - 1) { ok.add(m); last = m; } }
    marks = marks.filter(m => ok.has(m)); spans = spans.filter(sp => ok.has(sp[0])); subs = []; misreads = [];
  }
  if (sounding) { R.lastSound = now(); dlog("sounding-out", { heard: hyps.join(" "), word: R.words[cursorIndex()]?.n, why: "pieces of the next word: wait, don't help yet" }); }
  if (misreads.length && final) handleMisreads(misreads, hyps);
  if (!marks.length) return;
  if (R.cal) for (const f of feats) R.cal.feat[f] = (R.cal.feat[f] || 0) + 1;
  const t = now(); let progressed = false;
  // Recognizer drops: page words sitting between two words heard back-to-back (no other word heard in between) are
  // treated as read: an uncertain judgment counts as correct (Section 2). The same at the seam with the last result.
  const implicit = [];
  const gapFill = (a, b) => { const g = []; for (let k = a + 1; k < b; k++) if (!R.words[k].st && !misreads.includes(k)) g.push(k); if (g.length && g.length <= 2) implicit.push(...g); };
  spans.sort((x, y) => x[0] - y[0]);
  const miscues = [];
  for (let j = 1; j < spans.length; j++) {
    const hg = spans[j][1] - spans[j - 1][2] - 1;
    if (spans[j][0] <= spans[j - 1][0]) continue;
    if (hg === 0) gapFill(spans[j - 1][0], spans[j][0]);
    else {
      // something else was said where 1–2 everyday words (or a name) belong: keep reading, don't correct it
      const g = []; for (let k = spans[j - 1][0] + 1; k < spans[j][0]; k++) if (!R.words[k].st) g.push(k);
      if (g.length && g.length <= 2 && hg <= g.length + 1 && g.every(k => !isReq(R.words[k]) && !misreads.includes(k))) { implicit.push(...g); miscues.push(...g.map(k => [R.words[k].n, hyps.slice(spans[j - 1][2] + 1, spans[j][1]).join(" ")])); }
    }
  }
  if (spans.length && spans[0][1] === 0 && before > 0 && R.words[before - 1]?.st && spans[0][0] >= before) gapFill(before - 1, spans[0][0]);
  const sorted = marks.sort((a, b) => a - b);
  // jump detection: the first newly matched word lies well past where the child should be
  const first = sorted.find(m => !R.words[m].st);
  if (first != null && cur0 >= 0 && first > cur0 && !stable && !R.jump && !(R.noJumpUntil && now() < R.noJumpUntil)) {
    const skipped = R.words.slice(cur0, first).filter(w => !w.st), gap = skipped.length;
    const crossesSentence = skipped.length && skipped[0].sent !== skipped[skipped.length - 1].sent;
    if (gap >= JUMP_MIN + 1 || (gap >= JUMP_MIN && crossesSentence)) { R.jump = { from: cur0, at: first, since: 0, t, sent: R.words[first].sent }; dlog("jump", { skipped: gap, from: R.words[cur0].n, to: R.words[first].n, why: `skipped ${gap} unread words (≥ ${JUMP_MIN})` }); }
  }
  // going back into the skipped part on their own cancels the refocus
  if (R.jump && first != null && first >= R.jump.from && first < R.jump.at && !R.jump.refocused) R.jump = null;
  for (const m of sorted) {
    const w = R.words[m]; if (w.st) continue;
    if (R.ladder && R.ladder.idx === m) { if (R.ladder.step === 1) { R.ladder.fixed = true; w.st = 1; selfFix(w); progressed = true; } else R.saidIt = now(); continue; }
    w.st = 1; R.sess.c++; if (isReq(w)) R.sess.nailed.add(w.t.replace(/[^\p{L}\p{N}'-]/gu, ""));
    progressed = true; if (R.jump) R.jump.since++;
    // Easy words between two matched words count as read (implicit)
    for (let k = Math.max(0, m - 2); k < m; k++) { const s = R.words[k]; if (!s.st && s.tier === "easy" && (k === 0 || R.words[k - 1].st || marks.includes(k - 1)) && (!R.jump || k >= R.jump.at || k < R.jump.from)) { s.st = 1; R.sess.c++; } }
    R.anchor = m + 1;
  }
  if (progressed && R.cal) {
    const nNew = sorted.filter(m => R.words[m].st).length || 1;
    if (R.started) { const gap = t - R.lastProg; if (gap < idlePause()) { R.cal.ms += gap / TSC(); R.cal.gaps.push(gap / TSC() / nNew); } }
    R.cal.words += nNew;
    if (final && subs.length) R.cal.subs++;
    if (R.cal.words >= calTarget() && finishCalibration(R.cal)) { dlog("profile", { why: "calibrated", prof: P.prof }); R.cal = CAL = null; }
  }
  if (progressed) {
    if (R.started) { const gap = t - R.lastProg; if (gap < idlePause()) R.sess.sec += gap / 1000; }
    R.started = true; R.lastProg = t; bumpStreak(); mood($("#rAvatar"), "listening following");
  }
  for (const k of implicit) { const w = R.words[k]; if (!w.st && !(R.ladder && R.ladder.idx === k)) { w.st = 1; R.sess.c++; } }
  if (miscues.length) { R.sess.miscues = (R.sess.miscues || 0) + miscues.length; dlog("miscue-accepted", { pairs: miscues, why: "everyday word or name: benefit of the doubt" }); }
  dlog("align", { heard: hyps.join(" "), final, matched: sorted.map(m => R.words[m].n), implicit: implicit.map(k => R.words[k].n), subs: subs.map(k => R.words[k].n), feats, anchor: [before, R.anchor], cursor: cursorIndex() });
  // move along: count tries on a Hard word; after 3 tries Shellfie just gives the word
  for (const k of subs) {
    R.attempts[k] = (R.attempts[k] || 0) + 1;
    if (R.ladder && R.ladder.idx === k && R.attempts[k] >= 3) { R.ladder.giveUp = true; dlog("move-along", { word: R.words[k].n, tries: R.attempts[k] }); }
  }
  hopReadRun();
  if (final && subs.length && !R.ladder && !R.words[subs[0]].st) runLadder(subs[0], "listen");
  updateCursor();
  if (R.jump && !R.jump.refocused) {
    // let them finish the sentence they jumped into (or ~8 words), then bring them back
    const last = R.words[R.anchor - 1], next = R.words[R.anchor];
    const sentDone = !next || (last && next.sent !== last.sent);
    if ((sentDone && R.jump.since >= 3) || R.jump.since >= 8 || R.anchor >= R.words.length) { refocus(); return; }
  }
  if (!R.jump) checkSentenceEnd(before);
  // mid-utterance (iOS interim) the page only turns when every word is read; the forgiving rules wait for a pause
  if (stable && R.words.some(w => !w.st)) return;
  checkComplete();
}
function hopReadRun() {
  // after a refocus, when the child reaches the part they already read, hop the highlight past it
  if (!R.jump || !R.jump.refocused) return;
  if (R.anchor < R.jump.at || !R.words[R.anchor]?.st) { if (R.anchor >= R.jump.at) R.jump = null; return; }
  const startRun = R.anchor; let k = R.anchor; while (k < R.words.length && R.words[k].st) k++;
  R.anchor = k; R.jump = null;
  if (k - startRun >= 3) {
    for (let i = startRun; i < k; i++) { const el = R.words[i].el; el.classList.remove("hop"); void el.offsetWidth; el.classList.add("hop"); }
    bubbleAt(R.words[startRun].el, "✓ " + T().alreadyRead); SFX.sparkle(); dlog("hop", { over: k - startRun, why: "reached the part already read after a refocus" });
  }
}
function bubbleAt(el, text) {
  const r = el.getBoundingClientRect(), st = $("#stage").getBoundingClientRect();
  const b = document.createElement("div"); b.className = "hopbubble"; b.textContent = text;
  b.style.left = Math.max(8, r.left - st.left) + "px"; b.style.top = Math.max(4, r.top - st.top - 44) + "px";
  $("#stage").appendChild(b); setTimeout(() => b.remove(), 2200);
}
async function refocus() {
  if (!R || R.tap) return;
  // zoom back to the first skipped word, in place, so the child sees exactly where to start
  if (!R || !R.jump) return;
  dlog("refocus", { from: R.words[R.jump.from]?.n, at: R.words[R.jump.at]?.n, wordsReadAfterJump: R.jump.since, why: "child skipped ahead; bring them back to the first skipped word" });
  const J = R.jump; J.refocused = true; R.tent.clear(); R.sess.refocus = (R.sess.refocus || 0) + 1;
  R.anchor = J.from; updateCursor();
  const target = R.words[nextUnread(J.from)]; if (!target) { R.jump = null; checkComplete(); return; }
  LISTENER?.pause(); R.focusing = true;
  const stage = $("#stage"); stage.classList.add("focusing"); target.el.classList.add("focus");
  target.el.scrollIntoView?.({ block: "nearest" });
  pointBack(target); mood($("#rAvatar"), "thinking");
  showSay(T().skippedPart, 2600); await sleep(1300 * TSC());
  await sleep(window.__SHELLFIE_TEST ? 30 : REDUCED ? 200 : 700);
  if (!R) return;
  stage.classList.remove("focusing"); target.el.classList.remove("focus"); target.el.classList.add("refocus");
  setTimeout(() => target.el?.classList.remove("refocus"), 4000);
  R.focusing = false; R.lastProg = now(); if (!R.tap) LISTENER?.resume(); mood($("#rAvatar"), "listening");
  R.noJumpUntil = now() + 8000 * TSC();   // the child may reread a bit after coming back; don't treat that as a new skip
  hopReadRun(); updateCursor(); checkComplete();
}
function checkSentenceEnd(before) {
  // after the child finishes a sentence, point back to a skipped Hard/Unique word in it
  if (R.ladder) return;
  const last = R.words[R.anchor - 1]; if (!last) return;
  const sentDone = !R.words[R.anchor] || R.words[R.anchor].sent !== last.sent || R.anchor >= R.words.length;
  if (!sentDone) return;
  const skipped = R.words.find(w => !w.st && w.sent === last.sent && isReq(w) && w.i < R.anchor);
  if (skipped && !R.sentNotified.has(skipped.i) && !R.sentNotified.has("nudged")) {
    R.sentNotified.add("nudged"); dlog("nudge", { word: skipped.n, why: "skipped a Hard word in a finished sentence" });
    R.sentNotified.add(skipped.i); pointBack(skipped); R.sess.nudges = (R.sess.nudges || 0) + 1;
    showSay(T().waitThis);
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
  if (ws.some(w => isReq(w) && !w.st)) return false;
  const rest = ws.filter(w => !isReq(w)); const miss = rest.filter(w => !w.st).length;
  const allowed = Math.max(Math.floor(rest.length * .1), Math.min(2, Math.floor(rest.length / 3)));
  // no unread stretch of 3+ words anywhere (a skipped line must be read), and the page end reached
  let run = 0, maxRun = 0; for (const w of ws) { run = w.st ? 0 : run + 1; maxRun = Math.max(maxRun, run); }
  const endReached = ws[ws.length - 1].st || (ws.length > 1 && ws[ws.length - 2].st);
  return miss <= allowed && maxRun < 4 && endReached;
}
function checkComplete() {
  if (!R || R.completing || R.ladder || R.focusing) return;
  if (!isComplete()) {
    if (R.anchor >= R.words.length && !R.tap) {
      // reached the end with something missing: bring them back to the earliest unread stretch
      let k = R.words.findIndex((w, i) => !w.st && (isReq(w) || [1, 2, 3].every(d => R.words[i + d] && !R.words[i + d].st)));
      if (k >= 0 && !R.sentNotified.has("end" + k)) {
        R.sentNotified.add("end" + k);
        if (!isReq(R.words[k])) { R.jump = { from: k, at: R.words.length, since: 99, refocused: false }; refocus(); }
        else pointBack(R.words[k]);
      }
    }
    return;
  }
  completePage();
}
async function completePage(byTap = false) {
  R.completing = true; R.tent.clear(); updateCursor();
  dlog("complete", { ch: R.ch, pg: R.pg, sub: R.sub, byTap, ms: Math.round((now() - R.pageT0) / TSC()), unread: R.words.filter(w => !w.st).map(w => w.n), helped: R.words.filter(w => w.st === 2).map(w => w.n) });
  if (R.sub < R.parts.length - 1) { SFX.sparkle(); updateProgress(); await sleep((byTap ? 150 : 500) * TSC()); if (R) advance(1); return; }
  markPageRead(R.s.id, R.ch, R.pg); R.sess.pages++;
  L.shells++; R.sess.shells++; saveL(); bumpStreak();
  const sh = $("#rShells"); sh.querySelector("span").textContent = L.shells + L.sp.length; sh.classList.remove("pop"); void sh.offsetWidth; sh.classList.add("pop"); SFX.shell();
  const nx = $("#rNext"); nx.classList.remove("blink"); void nx.offsetWidth; nx.classList.add("blink");
  updateProgress();
  if (!byTap && !P.calm && Math.random() < .35) { mood($("#rAvatar"), "celebrating"); }
  await sleep((byTap ? 150 : 650) * TSC());
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
  if (R) $("#reader").classList.toggle("tapmode", !!R.tap);
  if (!R || R.tap || R.completing || R.paused || R.ladder) return;
  const t = now(), idle = t - Math.max(R.lastProg, R.lastSound || 0);
  micWatchdog(t);
  if (idle > idlePause() && t - R.pageT0 > idlePause()) { pauseReading(); return; }
  if (R.focusing) return;
  if (R.jump && !R.jump.refocused && R.jump.since >= 2 && idle > 2500 * STY().wait * TSC()) { refocus(); return; }
  if (R.started && idle > 1600 * TSC()) mood($("#rAvatar"), "listening thinking");
  if (R.jump) return;
  if (R.started && idle > 1400 * TSC()) {
    const W = R.words, n = W.length, un = W.map((w, i) => w.st ? -1 : i).filter(i => i >= 0);
    if (un.length && un.every(i => i >= n - 2 && !isReq(W[i])) && W[n - 3] && W[n - 3].st) {
      un.forEach(i => { W[i].st = 1; R.sess.c++; });
      dlog("end-of-page", { words: un.map(i => W[i].n), why: "child finished; last everyday words not heard clearly — benefit of the doubt" });
      updateCursor(); checkComplete(); return;
    }
  }
  const c = cursorIndex(); if (c < 0 || !R.started) return;
  const w = R.words[c];
  if ((isReq(w) || isName(w)) && idle > hesitateMs(R.s.grade) && !w.hesitated) {
    w.hesitated = true;
    const quick = isName(w) || (R.pageLadders || 0) >= 2;
    dlog("hesitate", { word: w.n, tier: w.tier, idleMs: Math.round(idle / TSC()), thresholdMs: Math.round(hesitateMs(R.s.grade) / TSC()), style: styleName(), action: quick ? "quick-say" : "help-ladder", pageHelps: R.pageLadders || 0 });
    if (quick) quickSay(c); else runLadder(c, "listen");
  }
}
function pauseReading() {
  if (LISTENER && LISTENER.permission === "prompt" && !LISTENER.running) return;
  if (LISTENER && !LISTENER.running && !R.tap) { if ($("#micAsk")) return; dlog("mic", { state: "dead at idle pause", running: LISTENER.running, watchdog: R.watchdog || 0, why: "no progress and the microphone is not running: ask to turn it back on" }); showMicAsk(); return; }
  dlog("pause", { why: "no progress", idleMs: Math.round((now() - R.lastProg) / TSC()), limitMs: Math.round(idlePause() / TSC()) });
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
  R.pageLadders = (R.pageLadders || 0) + 1; R.sess.ladders = (R.sess.ladders || 0) + 1; (R.sess.ladderIdx = R.sess.ladderIdx || []).push(idx); if (R.cal && from === "listen") R.cal.helps++;
  const helpT0 = now();
  const L0 = R.ladder = { idx, step: from === "tap" ? 2 : 1, how: from === "tap" ? "tap" : "listen", fixed: false };
  const id = R.s.id, lang = R.s.lang, g = R.s.grade;
  const clean = w.t.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
  if (L0.step === 1) {
    w.el.classList.remove("prompt"); void w.el.offsetWidth; w.el.classList.add("prompt"); mood($("#rAvatar"), "listening thinking");
    dlog("ladder", { word: w.n, tier: w.tier, from, step: 1, waitMs: Math.round((selfFixMs(g) + 1200 * TSC()) / TSC()) });
    const t0 = now(); while (now() - t0 < selfFixMs(g) + 1200 * TSC()) { await sleep(120 * TSC()); if (!R || R.ladder !== L0) return; if (L0.fixed || w.st) { dlog("ladder", { word: w.n, end: "self-corrected" }); endLadder(L0); return; } if (L0.giveUp) break; }
    w.el.classList.remove("prompt"); L0.step = 2;
  }
  if (L0.giveUp) L0.skip = false;
  if (!R || R.ladder !== L0) return;
  // Step 2: scaffold (skipped when the child already tried 3 times: just give the word)
  LISTENER?.pause(); mood($("#rAvatar"), "");
  dlog("ladder", { word: w.n, step: L0.giveUp ? 3 : 2, why: L0.giveUp ? "3 tries: give the word" : "scaffold" });
  const syl = syllables(clean, lang);
  const missedBefore = (L.counts[w.n]?.n || 0) > 0;
  let how = lang === "es" ? "syl" : (IRREG.has(w.n) ? "say" : "snd");
  if (lang === "en" && GI(g) >= 3 && missedBefore && clean.length >= 6) how = "spell";
  const help = $("#help"); help.hidden = false;
  help.innerHTML = `<div class="zoom">${syl.map(s => `<span class="syl">${h(s)}</span>`).join('<span class="dot">·</span>')}</div>
    <div class="say">${turtleSVG("listening")}<span id="helpSay"></span></div><button class="btn ghost skip" id="helpSkip">${h(T().keepGoing)} ›</button>`;
  $("#helpSkip").onclick = () => { L0.skip = true; speechSynthesis.cancel(); };
  const sylEls = $$(".syl", help);
  if (L0.giveUp) { /* straight to the model */ }
  else if (how === "syl" || how === "snd") {
    if (syl.length > 1) { for (let i = 0; i < syl.length && !L0.skip; i++) { sylEls.forEach(e => e.classList.remove("on")); sylEls[i].classList.add("on"); await sayWord(syl[i], { rate: .72, lang }); await sleep(120); } }
    sylEls.forEach(e => e.classList.add("on"));
  } else if (how === "spell") {
    $("#helpSay").textContent = clean.split("").join("-");
    if (!L0.skip) await sayWord(clean.split("").join(", "), { rate: .8, lang });
  }
  if (!R || R.ladder !== L0) return;
  // Step 3: model the word, invite the child to say it
  L0.step = 3; sylEls.forEach(e => e.classList.add("on"));
  if (!L0.skip) await sayWord(clean, { rate: .88, lang });
  if (!R || R.ladder !== L0) return;
  $("#helpSay").textContent = T().yourTurn;
  if (!L0.skip && !R.tap) {
    // "Your turn": give the child real time. About 8 s (longer for Careful readers); every sounded-out piece adds 3 s
    // (up to 20 s). It ends when the word itself is heard, the child taps Keep going, or time runs out.
    showSay(T().yourTurn, 2500); await sleep(300 * TSC()); LISTENER?.resume();
    const t0 = now(), cap = t0 + 20000 * TSC(); let deadline = t0 + 8000 * STY().wait * TSC(), lastS = R.lastSound || 0;
    R.saidIt = 0; L0.yourTurn = true;
    dlog("your-turn", { word: w.n, waitMs: Math.round((deadline - t0) / TSC()) });
    while (now() < deadline && !L0.skip) {
      await sleep(120 * TSC()); if (!R || R.ladder !== L0) return;
      if (R.saidIt) { w.el.classList.add("sparkle"); setTimeout(() => w.el?.classList.remove("sparkle"), 900); await sleep(700 * TSC()); break; }
      if ((R.lastSound || 0) > lastS) { lastS = R.lastSound; deadline = Math.min(cap, Math.max(deadline, now() + 3000 * TSC())); }
    }
    dlog("your-turn", { word: w.n, end: R.saidIt ? "said it" : L0.skip ? "tapped keep going" : "time", waitedMs: Math.round((now() - t0) / TSC()) });
  }
  else if (!L0.skip) await sleep(900 * TSC());
  if (!R || R.ladder !== L0) return;
  help.hidden = true; help.innerHTML = "";
  if (!w.st) { w.st = 2; R.sess.h++; R.sess.helped.push(clean); }
  logHelp(w.n, id, L0.step, L0.giveUp ? "say" : how);
  lenient(w.n);
  dlog("ladder", { word: w.n, end: L0.skip ? "child tapped keep going" : "modeled", how });
  if (w.i >= R.anchor) R.anchor = w.i + 1;
  R.ladder = null; R.lastProg = now(); if (!R.tap) LISTENER?.resume(); mood($("#rAvatar"), R.tap ? "" : "listening");
  R.sess.helpMs = (R.sess.helpMs || 0) + (now() - helpT0) / TSC();
  updateCursor(); checkComplete();
}
async function quickSay(idx) {
  // a light touch: say the word once, count it, keep the child reading (names, or after 2 helps on a page)
  if (!R || R.ladder) return;
  const w = R.words[idx]; if (!w || w.st) return;
  const L0 = R.ladder = { idx, step: 3, quick: true }; const qT0 = now();
  R.sess.quick = (R.sess.quick || 0) + 1;
  w.el.classList.add("sparkle");
  LISTENER?.pause();
  showSay(w.t.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""), 1600);
  await sayWord(w.t.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""), { rate: .9, lang: R.s.lang });
  if (!R || R.ladder !== L0) return;
  w.el.classList.remove("sparkle");
  if (!w.st) { w.st = 2; R.sess.h++; }
  lenient(w.n);
  if (w.i >= R.anchor) R.anchor = w.i + 1;
  R.ladder = null; R.lastProg = now(); if (!R.tap) LISTENER?.resume();
  dlog("quick-say", { word: w.n, tier: w.tier }); R.sess.helpMs = (R.sess.helpMs || 0) + (now() - qT0) / TSC() + 1500;
  updateCursor(); checkComplete();
}
function lenient(n) {
  // benefit of the doubt for this word for the rest of the story
  R.lenient.add(n);
  for (const x of R.words) if (x.n === n && !x.st && x.tier !== "easy") x.tier = "easy";
}
function selfFix(w) {
  w.el.classList.remove("prompt"); w.el.classList.add("sparkle"); setTimeout(() => w.el?.classList.remove("sparkle"), 1000); SFX.sparkle();
  R.sess.c++; logHelp(w.n, R.s.id, 1, "self");
}
function endLadder(L0) { if (R && R.ladder === L0) { R.sess.helpMs = (R.sess.helpMs || 0) + 2500; R.ladder = null; R.lastProg = now(); mood($("#rAvatar"), "listening"); updateCursor(); checkComplete(); } }

function bindReader() {
  $("#rHome").onclick = () => history.back();
  const nx = $("#rNext"); let holdT = null, held = false;
  const listeningNow = () => R && !R.tap && !R.completing;
  const endHold = () => { clearTimeout(holdT); holdT = null; nx.classList.remove("holding"); };
  nx.addEventListener("pointerdown", () => {
    held = false; if (!listeningNow() || R.ladder) return;
    nx.classList.add("holding");
    holdT = setTimeout(() => { held = true; endHold(); dlog("skip-next", { held: true, why: "Next held down while listening" }); doSkip(); }, 1100);
  });
  ["pointerup", "pointerleave", "pointercancel"].forEach(ev => nx.addEventListener(ev, endHold));
  nx.addEventListener("contextmenu", e => e.preventDefault());
  nx.onclick = () => {
    if (!R || R.ladder) return; ac();
    if (R.completing) return;
    if (R.tap) { completePage(true); return; } // tap-for-help mode: Next counts the page
    if (held) { held = false; return; }
    // quick tap while Shellfie is listening: encourage reading on instead of skipping
    dlog("next-tap", { read: R.words.filter(w => w.st).length, of: R.words.length, why: "quick tap while listening: keep reading, Shellfie turns the page" });
    showSay(T().iTurn, 2600); mood($("#rAvatar"), "listening following");
    const c = R.words[cursorIndex()]?.el; if (c) { c.classList.remove("nudge"); void c.offsetWidth; c.classList.add("nudge"); }
    nx.classList.remove("hinted"); void nx.offsetWidth; nx.classList.add("hinted");
  };
  function doSkip() {
    if (!R || R.ladder || R.completing) return;
    dlog("skip-next", { ch: R.ch, pg: R.pg, read: R.words.filter(w => w.st).length, of: R.words.length, why: "Next tapped before the page was finished (not counted as read)" });
    advance(1); // skipping does not mark words read and does not count toward completion
  }
  $("#rPrev").onclick = () => { if (!R || R.ladder) return; ac(); advance(-1); };
  $("#pageText").addEventListener("click", e => {
    const el = e.target.closest(".w"); if (!el || !R) return; ac();
    const i = +el.dataset.i; const w = R.words[i];
    if (w.st) { sayWord(w.t.replace(/[^\p{L}\p{N}'-]/gu, ""), { rate: .85, lang: R.s.lang }); return; }
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
  if (!items.length) { Q = null; showResults(); return; }
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
  dlog("quiz", { book: R.s.id, ch: R.ch, q: q.q, chose: q.o[o], right: o === q.a, auto: !!q.auto });
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
  L.quiz.push([R.s.id, R.ch, Q.right, ts36(), Q.items.length]); saveL();
  Q = null; showResults();
}

/* ───────────── Results ───────────── */
function showResults() {
  const s = R.s, t = T(), lastChapter = R.ch >= s.chapters.length - 1;
  if (R.cal && lastChapter && finishCalibration(R.cal, true)) { dlog("profile", { why: "calibrated at end of book", prof: P.prof }); R.cal = CAL = null; }
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
    <div class="shell-grid">${books.map(b => { const got = L.sp.includes(b.id); return `<div class="shell-cell ${got ? "" : "locked"}" title="${h(b.t)}">${got ? `<svg viewBox="0 0 64 64"><use href="#i-shell"/></svg>` : `<span style="position:static;font-size:30px">${b.icon || "📘"}</span>`}<span>${h(b.t)}</span></div>`; }).join("")}</div>`;
}

/* ───────────── Parent panel ───────────── */
function fmtDate(t36) { const d = from36(t36); return d.toLocaleString(P.lang === "es" ? "es-MX" : "en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); }
function titleOf(id) { return META[id]?.t || id; }
async function openParent() {
  const dlg = $("#parent"), t = T(), p = t.p; applyI18n(); mountTurtles(dlg);
  showVersion();
  const ids = Object.keys(P.b).filter(id => META[id]);
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
    <section><h3>${h(p.quizT)}</h3>${L.quiz.length ? `<div class="tbl"><table><tr><th>${h(p.title)}</th><th class="num">${h(p.score)}</th><th>${h(p.date)}</th></tr>${L.quiz.slice(-12).reverse().map(([id, ch, sc, d, n]) => `<tr><td>${h(titleOf(id))}${pcOf(id).length > 1 ? ` · ${h(t.chapter)} ${ch + 1}` : ""}</td><td class="num">${sc}/${n || 3}</td><td>${h(fmtDate(d))}</td></tr>`).join("")}</table></div>` : `<p class="empty">${h(p.noData)}</p>`}</section>
    <section><h3>${h(p.practice)}</h3>${words.length ? `<div class="tbl"><table><tr><th>${h(p.word)}</th><th class="num">${h(p.count)}</th><th>${h(p.lastSeen)}</th><th>${h(p.helped)}</th></tr>${words.map(([w, c]) => `<tr><td><b>${h(w)}</b></td><td class="num">${c.n}</td><td>${h(fmtDate(c.l))}</td><td>${h(topHow(c))}</td></tr>`).join("")}</table></div>` : `<p class="empty">${h(p.noData)}</p>`}</section>
    <section><h3>${h(p.log)}</h3>${L.help.length ? `<div class="tbl"><table><tr><th>${h(p.date)}</th><th>${h(p.word)}</th><th>${h(p.title)}</th><th class="num">${h(p.step)}</th></tr>${L.help.slice(-20).reverse().map(([w, id, d, st]) => `<tr><td>${h(fmtDate(d))}</td><td>${h(w)}</td><td>${h(titleOf(id))}</td><td class="num">${st}</td></tr>`).join("")}</table></div>` : `<p class="empty">${h(p.noData)}</p>`}</section>
    <section><h3>${h(p.settings)}</h3>
      <div class="setting"><span>${h(p.lang)}</span><div class="seg" id="pLang"><button data-l="en" aria-pressed="${P.lang === "en"}">English</button><button data-l="es" aria-pressed="${P.lang === "es"}">Español</button></div></div>
      <div class="setting"><span>${h(p.underline)}</span><button class="toggle" id="pUnder" role="switch" aria-checked="${!!P.under}"><span class="sw"></span></button></div>
      <div class="setting"><span>${h(p.say)}</span><button class="toggle" id="pSay" role="switch" aria-checked="${!!P.say}"><span class="sw"></span></button></div>
      <div class="setting"><span>${h(p.calm)}</span><button class="toggle" id="pCalm" role="switch" aria-checked="${!!P.calm}"><span class="sw"></span></button></div>
      <div class="setting"><span>${h(t.showRead)}</span><button class="toggle" id="pShowRead" role="switch" aria-checked="${!!P.showRead}"><span class="sw"></span></button></div></section>
    ${styleSectionHTML(p)}
    <section><h3>${h(p.listen)}</h3>
      <p><b>${h(p.engine)}:</b> ${h(eng === "tap" ? p.eTap : (localState === "available" ? p.eLocal : p.eCloud))}</p>
      ${eng !== "tap" && (localState === "downloadable") ? `<div class="rowbtns"><button class="btn ghost" id="pInstall">${h(p.install)}</button></div>` : ""}
      <p><b>${h(p.voice)}:</b> ${h(v ? `${v.name} (${v.lang})` : "–")}</p>
      ${P.lang === "es" && !(v && /es[-_](MX|US|419)/i.test(v.lang)) ? `<p class="hint">${h(p.noVoice)}</p>` : ""}</section>
    <section><h3>${h(p.privacy)}</h3><p>${h(p.privacyText)}</p><h3 style="margin-top:12px">${h(p.tip)}</h3><p>${h(p.tipText)}</p></section>
    <section><h3>${h(p.trouble)}</h3><p>${h(p.troubleHelp)}</p><div class="rowbtns"><button class="btn ghost" id="pCopyRecent">📋 ${h(p.copyRecent)}</button></div></section>
    ${devSectionHTML(p)}
    <section><h3>${h(p.backup)}</h3><div class="rowbtns"><button class="btn ghost" id="pExp">⬇ ${h(p.exp)}</button><button class="btn ghost" id="pImp">⬆ ${h(p.imp)}</button><button class="btn ghost" id="pReset" style="color:#b42318">${h(p.reset)}</button></div></section>`;
  bindStyleSection(p); bindDevSection(p);
  $("#pCopyRecent").onclick = async () => {
    const txt = devText(30 * 60e3);
    try { await navigator.clipboard.writeText(txt); toast(p.devCopied); }
    catch { const ta = document.createElement("textarea"); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); toast(p.devCopied); } catch { toast(p.devCopyFail); } ta.remove(); }
  };
  $("#pLang").onclick = e => { const b = e.target.closest("button"); if (!b) return; P.lang = b.dataset.l; saveP(); openParent(); refreshBehind(); };
  $("#pSay").onclick = () => { P.say = P.say ? 0 : 1; saveP(); dlog("settings", { say: P.say }); $("#pSay").setAttribute("aria-checked", !!P.say); };
  $("#pCalm").onclick = () => { P.calm = P.calm ? 0 : 1; saveP(); dlog("settings", { calm: P.calm }); $("#pCalm").setAttribute("aria-checked", !!P.calm); document.body.classList.toggle("calm", !!P.calm); };
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
function styleSectionHTML(p) {
  const pr = prof(), cur = styleName(), auto = !(pr && pr.force);
  const pats = Object.keys(PATTERNS[P.lang]);
  return `<section><h3>${h(p.style)}</h3>
    ${pr && (pr.st || pr.force) ? `<p><b>${h(p.styleNames[cur])}</b>${auto ? "" : ` (${h(p.styleForced)})`}. ${h(p.styleWhy[cur])}</p>` : `<p>${h(p.styleNone)}</p>`}
    ${pr && pr.st ? `<p class="empty">${h(p.styleStats(pr.w, pr.g, pr.e, pr.n))} ${h(p.styleWhen(pr.d))}</p>` : ""}
    ${pr && pr.re ? `<p class="hint">${h(p.recheckOn)}</p>` : ""}
    <div class="setting"><span>${h(p.styleForce)}</span><div class="seg" id="pStyle">${["auto", "speedy", "steady", "careful"].map(k => `<button data-s="${k}" aria-pressed="${k === "auto" ? auto : (!auto && cur === k)}">${h(k === "auto" ? p.styleAuto : p.styleShort[k])}</button>`).join("")}</div></div>
    <h3 style="margin-top:12px">${h(p.patterns)}</h3><p>${h(p.patternsHelp)}</p>
    ${pats.map(f => `<div class="setting"><span>${h(p.pat[f])}</span><button class="toggle" data-pat="${f}" role="switch" aria-checked="${patternOn(f)}"><span class="sw"></span></button></div>`).join("")}
    <div class="setting"><span>${h(p.lock)}</span><button class="toggle" id="pLock" role="switch" aria-checked="${!!(pr && pr.lock)}"><span class="sw"></span></button></div>
    <div class="rowbtns" style="margin-top:10px"><button class="btn ghost" id="pRecheck">↻ ${h(p.recheck)}</button></div></section>`;
}
function bindStyleSection(p) {
  const ensure = () => (P.prof = P.prof || { f: [], n: 0 });
  $("#pStyle").onclick = e => { const b = e.target.closest("button"); if (!b) return; const pr = ensure(); if (b.dataset.s === "auto") delete pr.force; else pr.force = b.dataset.s; saveP(); openParent(); };
  $$("[data-pat]").forEach(b => b.onclick = () => { const pr = ensure(); pr.fo = pr.fo || {}; pr.fo[b.dataset.pat] = !patternOn(b.dataset.pat); saveP(); openParent(); });
  $("#pLock").onclick = () => { const pr = ensure(); pr.lock = pr.lock ? 0 : 1; saveP(); openParent(); };
  $("#pRecheck").onclick = () => { const pr = ensure(); pr.re = 1; pr.lock = 0; saveP(); toast(p.recheckOn); openParent(); };
}
function devSectionHTML(p) {
  const on = devOn(), n = on ? (LS.get(DEV_KEY, []).length + DEVBUF.length) : 0;
  return `<details class="devbox" ${on ? "open" : ""}><summary>${h(p.dev)}</summary>
    <div class="setting"><span>${h(p.devOn)}</span><button class="toggle" id="pDev" role="switch" aria-checked="${on}"><span class="sw"></span></button></div>
    ${on ? `<p class="empty">${h(p.devInfo(n))}</p>
    <div class="setting"><span>${h(p.devTo)}</span><input id="pDevTo" type="email" inputmode="email" autocomplete="email" placeholder="name@example.com" value="${h(LS.get("shellfie_devto", ""))}"></div>
    <div class="rowbtns"><button class="btn ghost" id="pDevMail">✉ ${h(p.devMail)}</button><button class="btn ghost" id="pDevCopy">⧉ ${h(p.devCopy)}</button><button class="btn ghost" id="pDevClear">${h(p.devClear)}</button></div>` : ""}
  </details>`;
}
function bindDevSection(p) {
  $("#pDev").onclick = () => { const on = !devOn(); LS.set("shellfie_dev", on ? 1 : 0); if (on) dlog("settings", { devMode: true, version: APP_VERSION }); openParent(); };
  if (!devOn()) return;
  $("#pDevTo").onchange = e => LS.set("shellfie_devto", e.target.value.trim());
  $("#pDevCopy").onclick = async () => { try { await navigator.clipboard.writeText(devText()); toast(p.devCopied); } catch { toast(p.devCopyFail); } };
  $("#pDevClear").onclick = () => { localStorage.removeItem(DEV_KEY); DEVBUF = []; openParent(); };
  $("#pDevMail").onclick = async () => {
    const txt = devText(), name = `shellfie-log-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}.txt`;
    const to = ($("#pDevTo").value || "").trim(); LS.set("shellfie_devto", to);
    const subject = `Shellfie log ${new Date().toLocaleString()}`;
    const file = new File([txt], name, { type: "text/plain" });
    // iPhone / iPad / Android: the share sheet attaches the file to Mail directly
    if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: subject, text: subject }); return; } catch (e) { if (e && e.name === "AbortError") return; } }
    // elsewhere: download the file, then open an email draft that asks to attach it (with a short summary inline)
    const a = document.createElement("a"); a.href = URL.createObjectURL(file); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    const summary = txt.split("\n").slice(0, 10).join("\n");
    location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(p.devMailBody(name) + "\n\n" + summary)}`;
  };
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
window.Shellfie = { hear(text, final = true) { if (!R) return; const fake = { resultIndex: 0, results: [Object.assign([{ transcript: text }], { isFinal: final })] }; R.epoch = 0; R.processed = -1; R.used = {}; R.resLen = {}; R.sealed = {}; onSpeech(fake); }, state: () => R, syllables, tokenize,
  next() { if (R) advance(1); },
  async open(id, ch = 0, pg = 0) { if (R) teardown(); P.b[id] = [P.b[id]?.[0] || 1, ch, pg, P.b[id]?.[3] ?? null, P.b[id]?.[4] ?? null]; await openBook(id); } };

/* ───────────── Boot ───────────── */
mountTurtles(); bindGrades(); bindShelf(); bindReader(); bindParent(); applyI18n();
history.replaceState({ s: "grades" }, "");
if (!P.onb) initOnboard(); else goGrades();
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then(r => r.update().catch(() => { })).catch(() => { });
}
})();
