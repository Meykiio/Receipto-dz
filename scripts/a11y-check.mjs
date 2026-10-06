/**
 * Accessibility gate for public routes.
 *
 * Runs axe-core against the built app and exits non-zero on any serious or
 * critical violation, so CI actually blocks a regression. Lighthouse was removed
 * because it shipped 14 unfixable dev-only advisories and its thresholds were
 * all "warn" (it never failed a build).
 *
 * Scope: public routes only. Checking authenticated screens would require a
 * seeded database in CI, which is out of scope here.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const PORT = 4180;
const BASE = `http://127.0.0.1:${PORT}`;
const DIST = path.resolve('dist');

const ROUTES = [
  { path: '/', name: 'Landing' },
  { path: '/auth', name: 'Auth' },
  { path: '/privacy-policy', name: 'Privacy policy' },
  { path: '/terms-of-service', name: 'Terms of service' },
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.woff2': 'font/woff2',
};

/** Minimal static server with SPA fallback, so no extra dev dependency is needed. */
const serveStatic = () =>
  new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      let filePath = path.join(DIST, urlPath);

      if (!existsSync(filePath) || urlPath === '/' || !path.extname(filePath)) {
        filePath = path.join(DIST, 'index.html');
      }

      try {
        const body = await readFile(filePath);
        res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
        res.end(body);
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('not found');
      }
    });
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });

const run = async () => {
  if (!existsSync(DIST)) {
    console.error('dist/ not found — run `npm run build` first.');
    process.exit(1);
  }

  const server = await serveStatic();
  const browser = await chromium.launch();
  let failures = 0;

  try {
    for (const route of ROUTES) {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto(`${BASE}${route.path}`, { waitUntil: 'networkidle' });

      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();

      const blocking = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');

      if (blocking.length === 0) {
        console.log(`PASS  ${route.path} (${route.name}) — no serious/critical violations`);
      } else {
        failures += blocking.length;
        console.log(`FAIL  ${route.path} (${route.name}) — ${blocking.length} blocking violation(s)`);
        for (const v of blocking) {
          console.log(`        [${v.impact}] ${v.id}: ${v.help}`);
          for (const node of v.nodes.slice(0, 3)) console.log(`          - ${node.target.join(' ')}`);
        }
      }

      await page.close();
      await context.close();
    }
  } finally {
    await browser.close();
    server.close();
  }

  if (failures > 0) {
    console.error(`\nAccessibility gate failed: ${failures} blocking violation(s).`);
    process.exit(1);
  }
  console.log('\nAccessibility gate passed.');
};

run().catch((error) => {
  console.error('Accessibility check crashed:', error);
  process.exit(1);
});