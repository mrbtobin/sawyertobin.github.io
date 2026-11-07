// Chromium device emulation, fake audio capture, simulated speech recognition.
const assert = require('node:assert/strict');
const { chromium, devices } = require('playwright');
const base = process.env.BASE || 'http://localhost:8765/shellfie/';
const profiles = [
  ['iPhone portrait', devices['iPhone 13']],
  ['iPhone landscape', devices['iPhone 13 landscape']],
  ['iPad portrait', devices['iPad (gen 7)']],
  ['iPad landscape', devices['iPad (gen 7) landscape']],
  ['Android portrait', devices['Pixel 7']],
  ['Android landscape', devices['Pixel 7 landscape']],
  ['Desktop', {viewport:{width:1280,height:800}}],
  ['Chromebook size', {viewport:{width:1366,height:768}}],
];
(async () => {
  const browser = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {}), args:['--use-fake-device-for-media-stream'] });
  try {
    for (const [name, profile] of profiles) {
      const context = await browser.newContext({...profile, permissions:['microphone']});
      const page = await context.newPage(); const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.addInitScript(() => {
        window.__SHELLFIE_TEST = 1; window.__SHELLFIE_TIMESCALE = .1;
        const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
        navigator.mediaDevices.getUserMedia = async constraints => { const stream = await original(constraints); window.testStream = stream; return stream; };
        class FakeRecognition {
          start() { window.rec = this; setTimeout(() => this.onstart?.(), 5); }
          abort() { setTimeout(() => this.onend?.(), 5); }
        }
        window.SpeechRecognition = window.webkitSpeechRecognition = FakeRecognition;
      });
      await page.goto(base); await page.locator('#letsRead').click();
      await page.waitForFunction(() => window.testStream && !document.querySelector('#grades').hidden, null, {timeout:12000});
      assert.equal(await page.evaluate(() => testStream.getAudioTracks()[0].readyState), 'ended', `${name}: onboarding releases audio`);
      await page.evaluate(() => Shellfie.open('en-k-max-first-day', 0, 0));
      await page.waitForFunction(() => window.rec && !document.querySelector('#reader').hidden);
      await page.waitForTimeout(100);
      await page.evaluate(() => { const words = Shellfie.state().words.slice(0, 4).map(w => w.t).join(' '); const result = Object.assign([{transcript: words, confidence:.9}], {isFinal:true}); window.rec.onresult({resultIndex:0,results:[result]}); });
      await page.waitForFunction(() => Shellfie.state().words.some(w => w.st));
      assert.equal(await page.locator('#micAsk').count(), 0, `${name}: recognition results should reach reader`);
      await page.evaluate(() => rec.onerror({error:'audio-capture'}));
      const retry = page.locator('#micAskBtn'); const skip = page.locator('#micSkipBtn');
      assert.equal(await retry.isVisible(), true, `${name}: retry shown after capture error`);
      assert.equal(await skip.isVisible(), true, `${name}: fallback shown after capture error`);
      const rect = await retry.boundingBox(), viewport = page.viewportSize();
      assert(rect && rect.x >= 0 && rect.y >= 0 && rect.x + rect.width <= viewport.width && rect.y + rect.height <= viewport.height, `${name}: retry is inside viewport`);
      await skip.click(); assert.equal(await page.evaluate(() => Shellfie.state().tap), true, `${name}: fallback works`);
      assert.deepEqual(errors, [], `${name}: no page errors`);
      console.log(`PASS ${name}: fake audio capture, stream cleanup, simulated reading, capture error and fallback`);
      await context.close();
    }
    const denied = await browser.newContext(); const page = await denied.newPage();
    await page.addInitScript(() => { window.SpeechRecognition = window.webkitSpeechRecognition = class {}; });
    await page.goto(base); await page.locator('#letsRead').click();
    await page.locator('#micHint').waitFor({state:'visible',timeout:10000});
    assert.equal(await page.locator('#letsRead').isVisible(), true, 'denial permits continuing');
    await page.locator('#letsRead').click(); assert.equal(await page.locator('#grades').isVisible(), true, 'denial fallback continues');
    console.log('PASS Chromium permission denial onboarding fallback');
    await denied.close();
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
