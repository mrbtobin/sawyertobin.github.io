// Simulated recognition lifecycle regression checks; see microphone.md for device tests.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const page = await browser.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => {
    window.__SHELLFIE_TEST = 1; window.__SHELLFIE_TIMESCALE = .1;
    window.instances = [];
    class FakeRecognition {
      constructor() { window.instances.push(this); }
      start() { this.starts = (this.starts || 0) + 1; if (this.phrases?.length) { setTimeout(() => { this.onerror?.({error:"phrases-not-supported"}); this.onend?.(); }, 5); return; } if (!window.silentStart) setTimeout(() => this.onstart?.(), 5); }
      abort() { this.aborted = true; }
    }
    // An unresolved availability check must not prevent start in a user gesture.
    FakeRecognition.available = () => new Promise(() => {});
    window.SpeechRecognitionPhrase = class { constructor(phrase) { this.phrase = phrase; } };
    window.SpeechRecognition = window.webkitSpeechRecognition = FakeRecognition;
    localStorage.setItem('shellfie_v1', JSON.stringify({v:1,lang:'en',grade:'1',onb:1,b:{},showRead:1,under:1,calm:1,say:1,prof:{st:'steady',f:[],n:200,d:'2026-11-07',lock:1,w:90,g:600,e:1}}));
  });
  await page.goto(process.env.BASE || 'http://localhost:8765/shellfie/');
  await page.evaluate(() => Shellfie.open('en-k-max-first-day', 0, 0));
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(() => instances[0].starts), 1, 'starts without waiting for availability');
  assert.equal(await page.evaluate(() => instances[0].phrases?.length || 0), 0, 'does not request unsupported phrase hints');
  await page.waitForTimeout(5500); // more than three scaled watchdog intervals of silence
  assert.equal(await page.locator('#micAsk').count(), 0, 'silence while running is not a microphone failure');
  assert.equal(await page.evaluate(() => instances[0].starts), 1, 'does not restart a running listener for silence');
  await page.evaluate(() => Shellfie.open('en-4-max-thriller', 0, 0));
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(() => instances[0].aborted && instances[0].onerror === null), true, 'old listener released on book switch');
  assert.equal(await page.evaluate(() => instances.at(-1).phrases?.length || 0), 0, 'book with names starts without unsupported phrase hints');
  assert.equal(await page.evaluate(() => instances.at(-1).starts), 1, 'book with names does not enter a retry loop');
  await page.evaluate(() => instances.at(-1).onerror({error:'audio-capture'}));
  assert.equal(await page.locator('#micAsk').count(), 1, 'capture failure offers retry');
  await page.click('#micAskBtn');
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(() => instances.at(-1).starts), 1, 'retry starts immediately');
  assert.equal(await page.locator('#micAsk').count(), 0, 'retry dismisses prompt');
  await page.evaluate(() => instances.at(-1).onerror({error:'not-allowed'}));
  assert.equal(await page.locator('#micAsk').count(), 1, 'denial offers recovery');
  await page.click('#micSkipBtn');
  assert.equal(await page.evaluate(() => Shellfie.state().tap), true, 'reader can continue without mic');
  // A reader may take longer than the startup timeout to answer a permission prompt.
  await page.evaluate(() => {
    window.permission = {state:'prompt', onchange:null};
    Object.defineProperty(navigator, 'permissions', { configurable:true, value:{query: async () => window.permission} });
    window.silentStart = true;
  });
  await page.evaluate(() => Shellfie.open('en-k-max-first-day', 0, 0));
  await page.waitForTimeout(1800);
  assert.equal(await page.locator('#micAsk').count(), 0, 'does not interrupt a pending permission prompt');
  await page.evaluate(() => { window.permission.state = 'granted'; window.permission.onchange(); window.instances.at(-1).onstart(); });
  await page.waitForTimeout(400);
  assert.equal(await page.locator('#micAsk').count(), 0, 'accepts permission granted after startup timeout');
  assert.deepEqual(errors, [], 'no browser exceptions');
  await browser.close();
  console.log('Microphone lifecycle checks passed');
})().catch(e => { console.error(e); process.exitCode = 1; });
