const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  const data = await page.$eval('.section-header', (el) => {
    const label = el.querySelector('.label');
    const group = el.querySelector('.header-group');
    const er = el.getBoundingClientRect();
    const lr = label.getBoundingClientRect();
    const gr = group.getBoundingClientRect();
    return {
      wrapperLeft: er.left,
      wrapperWidth: er.width,
      wrapperCenter: er.left + er.width / 2,
      labelLeft: lr.left,
      labelRight: lr.right,
      labelCenter: lr.left + lr.width / 2,
      labelWidth: lr.width,
      groupLeft: gr.left,
      groupCenter: gr.left + gr.width / 2,
      groupWidth: gr.width,
      style: el.getAttribute('style')
    };
  });
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
