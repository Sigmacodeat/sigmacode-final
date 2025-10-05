import { test, expect } from '@playwright/test';

// Helper to inject axe-core from CDN and run it
async function runAxe(page: import('@playwright/test').Page) {
  // Load axe-core from CDN (no extra deps)
  await page.addScriptTag({ url: 'https://unpkg.com/axe-core@4.7.0/axe.min.js' });
  const results = await page.evaluate(async () => {
    // @ts-ignore
    const axe = (window as any).axe;
    if (!axe) return { violations: [{ id: 'axe-not-loaded', description: 'axe-core failed to load' }] };
    // Configure to reduce noise if needed
    return await axe.run(document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa'],
      },
    });
  });
  return results as { violations: Array<{ id: string; description: string; help: string; nodes: any[] }> };
}

const routes = [
  '/de/dashboard',
  '/de/dashboard/agents',
  '/de/dashboard/firewall',
  '/de/dashboard/knowledge',
  '/de/dashboard/models',
  '/de/dashboard/monitoring',
  '/de/dashboard/settings',
  '/de/dashboard/tools',
  '/de/dashboard/chat',
];

for (const route of routes) {
  test(`a11y: ${route}`, async ({ page, baseURL }) => {
    const url = new URL(route, baseURL!).toString();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    // Give Suspense/CSR bits a moment to stabilize
    await page.waitForTimeout(300);
    const { violations } = await runAxe(page);

    // Pretty print violations for easier troubleshooting
    if (violations.length) {
      console.error(`A11y violations on ${route}:`);
      for (const v of violations) {
        console.error(`- ${v.id}: ${v.help} -> ${v.description} (nodes: ${v.nodes.length})`);
      }
    }
    expect(violations, `Found ${violations.length} a11y violations on ${route}`).toEqual([]);
  });
}
