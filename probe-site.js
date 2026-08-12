const { chromium } = require('playwright');

const BASE = 'https://chillenge-russia.ru';

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage();

  const errors = [];

  page.on('pageerror', (err) => {
    errors.push({ url: page.url(), type: 'pageerror', message: err.message, stack: (err.stack || '').split('\n').slice(0, 6).join('\n') });
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push({ url: page.url(), type: 'console', message: msg.text() });
    }
  });

  const routes = ['/', '/welcome', '/explore', '/login', '/register'];

  for (const r of routes) {
    try {
      await page.goto(BASE + r, { waitUntil: 'networkidle', timeout: 45000 });
    } catch (e) {
      console.log(`  nav error for ${r}: ${e.message.split('\n')[0]}`);
    }
    await page.waitForTimeout(2000);
    console.log(`[route] ${r} -> final url: ${page.url()} | title: ${await page.title().catch(() => 'n/a')}`);
  }

  console.log('\n=== ERRORS ===');
  if (errors.length === 0) {
    console.log('no errors captured');
  } else {
    errors.forEach((e) => {
      console.log(`\n--- ${e.url} (${e.type}) ---`);
      console.log(e.message);
      if (e.stack) console.log(e.stack);
    });
  }

  await page.screenshot({ path: 'probe-site.png', fullPage: true }).catch(() => {});
  await browser.close();
})();