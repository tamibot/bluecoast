// Automated visual + structural verification (no manual browser needed).
// Loads the built site headlessly, checks console errors + horizontal overflow
// at several widths, and writes full-page screenshots that the agent can read.
import puppeteer from 'puppeteer';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const ROOT = new URL('../site/', import.meta.url).pathname;
const TYPES = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript',
  '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.webp':'image/webp' };

const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p === '/') p = '/index.html';
    const buf = await readFile(join(ROOT, p));
    res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' });
    res.end(buf);
  } catch { res.writeHead(404); res.end('nf'); }
});

await new Promise((r) => server.listen(0, r));
const port = server.address().port;
const base = `http://localhost:${port}/`;

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const widths = [
  { name: 'desktop', w: 1440, h: 900 },
  { name: 'tablet',  w: 768,  h: 1024 },
  { name: 'mobile',  w: 390,  h: 844 },
  { name: 'mobile-sm', w: 360, h: 760 },
];

const report = {};
for (const { name, w, h } of widths) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  await page.goto(base, { waitUntil: 'networkidle0', timeout: 30000 });
  // settle animations + remove intro overlay
  await page.evaluate(() => { const i = document.getElementById('intro'); if (i) i.remove(); document.body.classList.add('hero-ready'); });
  await new Promise((r) => setTimeout(r, 700));
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    bodyH: document.body.scrollHeight,
  }));
  // find overflow culprits if any
  const culprits = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth, out = [];
    document.querySelectorAll('body *').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 30 && (r.right > vw + 1.5 || r.left < -1.5)) {
        out.push(`${el.tagName}.${(typeof el.className==='string'?el.className:'').split(' ')[0]} [${Math.round(r.left)}→${Math.round(r.right)} w${Math.round(r.width)}]`);
      }
    });
    return out.slice(0, 6);
  });
  await page.screenshot({ path: `/tmp/bc-${name}.png`, fullPage: true });
  report[name] = { ...metrics, errors: errors.slice(0, 5), culprits };
  await page.close();
}

await browser.close();
server.close();
console.log(JSON.stringify(report, null, 2));
