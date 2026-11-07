// Responsive smoke checks; device profiles are emulated, not real-device certification.
const assert = require('node:assert/strict');
const { chromium, firefox, webkit, devices } = require('playwright');
const engine = process.env.ENGINE || 'chromium';
const base = process.env.BASE || 'http://localhost:8765/shellfie/';
const profiles = [
  ['small phone portrait', {viewport:{width:320,height:568},isMobile:true,hasTouch:true}],
  ['small phone landscape', {viewport:{width:568,height:320},isMobile:true,hasTouch:true}],
  ['iPhone', devices['iPhone 13']], ['iPhone landscape', devices['iPhone 13 landscape']],
  ['Android', devices['Pixel 7']], ['Android landscape', devices['Pixel 7 landscape']],
  ['iPad', devices['iPad (gen 7)']], ['iPad landscape', devices['iPad (gen 7) landscape']],
  ['desktop', {viewport:{width:1366,height:768}}]
];
(async () => {
  const browser = await ({chromium, firefox, webkit})[engine].launch(engine === 'chromium' && process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {});
  try {
    for (const [name, profile] of profiles) {
      const config = engine === 'firefox' ? {viewport: profile.viewport, hasTouch: !!profile.hasTouch} : profile;
      const context = await browser.newContext(config); const page = await context.newPage(); const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(base);
      const box = await page.locator('#letsRead').boundingBox(), size = page.viewportSize();
      assert(box && box.y >= 0 && box.y + box.height <= size.height, `${name}: onboarding button is visible`);
      await page.evaluate(() => { localStorage.setItem('shellfie_v1', JSON.stringify({onb:1,lang:'es',calm:1,b:{}})); });
      await page.reload();
      await page.locator('.grade-tile[data-g="2"]').click();
      await page.locator('[data-browse="genre"]').click();
      assert(await page.locator('#genreChips button').count() > 0, `${name}: genre choices render`);
      await page.locator('.book[data-id]').first().click();
      await page.locator('#reader:not([hidden])').waitFor();
      assert((await page.locator('#pageText').innerText()).trim().length > 0, `${name}: story text renders`);
      const pageBox = await page.locator('#page').boundingBox();
      assert(pageBox && pageBox.x >= 0 && pageBox.y >= 0 && pageBox.x + pageBox.width <= size.width && pageBox.y + pageBox.height <= size.height, `${name}: reading page fits`);
      assert.deepEqual(errors, [], `${name}: no page errors`);
      console.log(`PASS ${name}: onboarding, Spanish browsing and reader`);
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
