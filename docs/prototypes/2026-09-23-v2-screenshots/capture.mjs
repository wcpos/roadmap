// Read-only capture of the 2.0 (next-lane) POS on dev-next for the #370 screenshot prototype.
// Opens panels and closes them; never creates orders or saves settings.
import { chromium } from '/Users/kilbot/Projects/monorepo-v2/node_modules/playwright/index.mjs';

const OUT = '/private/tmp/claude-501/-Users-kilbot-Projects-roadmap/a4dc1a55-17af-4f32-b9b4-ff7c52764f56/scratchpad/proto370';
const SITE = 'https://dev-next.wcpos.com';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

await page.goto(`${SITE}/wp-login.php?redirect_to=${encodeURIComponent(SITE + '/pos')}&wcpos=1`);
await page.fill('#user_login', 'demo');
await page.fill('#user_pass', 'demo');
await page.click('#wp-submit');
await page.waitForSelector('[data-testid="pos-products-panel"]', { timeout: 150000 });
await page.waitForFunction(() => {
  const el = document.querySelector('[data-testid="data-table-loaded-count"]');
  return el && parseInt(el.textContent.replace(/\D/g, '') || '0', 10) > 0;
}, null, { timeout: 120000 }).catch(() => console.log('products did not load'));
await page.waitForTimeout(4000);
log('POS loaded', await page.locator('text=/v\\s?1\\.1\\d/').first().textContent().catch(() => 'no version text'));

await page.screenshot({ path: `${OUT}/01-pos.png` });
log('01-pos');

// Test ids present on the page, to find panels without matching (Spanish) copy.
const ids = await page.$$eval('[data-testid]', (els) => [...new Set(els.map((e) => e.getAttribute('data-testid')))]);
log('testids:', ids.slice(0, 80).join(' '));

// Open the cart settings panel, capture, close.
const cartSettings = page.locator('[data-testid="cart-settings-button"]');
if (await cartSettings.count()) {
  await cartSettings.click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT}/03-panel.png` });
  log('03-panel');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
}

// Customise the quick-filter bar (opens a panel/popover), capture, close.
const filterCustomize = page.locator('[data-testid="filter-bar-customize"]');
if (await filterCustomize.count()) {
  await filterCustomize.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/04-filters.png` });
  log('04-filters');
  await page.keyboard.press('Escape');
}

await browser.close();
log('done');
