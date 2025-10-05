import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// Header-Gruppen und erwartete Einträge (Labels wie im Header.tsx)
const desktopGroups: Array<{ label: string; items: string[] }> = [
  {
    label: 'Produkte',
    items: ['Dashboard', 'Analytics', 'Chat', 'Agents', 'Workflows', 'MAS'],
  },
  {
    label: 'Use Cases',
    items: ['Übersicht', 'Firewall‑Powered Agents', 'Workflows', 'MAS'],
  },
  {
    label: 'Security',
    items: ['Neural Firewall', 'Neural Firewall Monitor', 'Security Overview', 'Security Features'],
  },
  {
    label: 'Ressourcen',
    items: ['Docs', 'Changelog', 'Integrations'],
  },
  {
    label: 'Company',
    items: ['Pricing', 'Kontakt'],
  },
];

// Wichtige Seitenrouten, die existieren müssen
const pageRoutes = [
  '/',
  '/dashboard',
  '/analytics',
  '/chat',
  '/agents',
  '/mas',
  '/use-cases',
  '/firewall',
  '/dashboard/firewall/monitor',
  '/security',
  '/docs',
  '/changelog',
  '/contact',
  '/login',
  '/signup',
  '/workflows',
];

// Hash‑Anker, die auf der Startseite vorhanden sind
const hashAnchors = ['#features', '#integrations', '#workflow', '#pricing'];

// Hilfsfunktion: prüft, dass Navigation keine 404 lädt
async function expectOkNavigation(page: Page, path: string) {
  const res = await page.goto(path);
  expect(res, `Navigation to ${path} returned no response`).toBeTruthy();
  expect(res!.ok(), `Navigation to ${path} returned status ${res?.status()}`).toBeTruthy();
}

// Öffnet ein Desktop-Dropdown im Header und klickt einen Eintrag (scoped auf Desktop-Navigation)
async function openGroupAndClick(page: Page, groupLabel: string, itemLabel: string) {
  const desktopNav = page.getByRole('navigation', { name: 'Hauptnavigation' });
  await expect(desktopNav).toBeVisible();
  const groupBtn = desktopNav.getByRole('button', { name: groupLabel, exact: true });
  await expect(groupBtn).toBeVisible();
  await groupBtn.hover();
  const menu = page.getByRole('menu');
  await expect(menu).toBeVisible();
  const menuItem = menu.getByRole('menuitem', { name: itemLabel, exact: true });
  await expect(menuItem).toBeVisible();
  await menuItem.click();
}

test.describe('Header Links', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Stelle sicher, dass Desktop-Navigation sichtbar ist
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.getByRole('banner')).toBeVisible();
  });

  test('alle Desktop-Gruppen und Einträge sind erreichbar', async ({ page }) => {
    const BASE = process.env.BASE_URL || 'http://localhost:3000';
    for (const group of desktopGroups) {
      for (const item of group.items) {
        // Zur Startseite zurückkehren, Menü neu öffnen
        await page.goto(BASE + '/');
        await openGroupAndClick(page, group.label, item);
        // Bei hash-basierten Einträgen bleibt die URL auf der gleichen Seite, daher keine 404-Prüfung nötig
        // Bei Seitenwechsel prüfen wir, dass kein 404 kommt
        const url = new URL(page.url());
        if (!url.hash) {
          // Wir sind auf einer Seite ohne Hash; prüfen sichtbaren Content grob
          await expect(page).not.toHaveURL(/.*404/i);
          // Zurück, um das nächste Item zu testen
        } else {
          // Hash sichtbar: das Ziel‑Element sollte im DOM existieren
          const id = url.hash.replace('#', '');
          await expect(page.locator(`[data-testid="${id}-section"]`)).toBeVisible();
        }
      }
    }
  });

  test('CTA Buttons funktionieren', async ({ page }) => {
    // Login
    await page.getByRole('link', { name: 'Login' }).click();
    await expect(page).not.toHaveURL(/.*404/i);
    // zurück
    await page.goto('/');

    // Jetzt starten (hash -> #pricing)
    await page.getByRole('link', { name: 'Jetzt starten' }).first().click();
    await expect(page.locator('#pricing')).toBeVisible();

    // Sign up
    await page.getByRole('link', { name: 'Sign up' }).first().click();
    await expect(page).not.toHaveURL(/.*404/i);
  });

  test('Seitenrouten liefern HTTP 200', async ({ page }) => {
    for (const route of pageRoutes) {
      const res = await page.goto(route);
      expect(res, `No response for ${route}`).toBeTruthy();
      expect(res!.ok(), `${route} status ${res?.status()}`).toBeTruthy();
    }
  });

  test('Hash‑Anker funktionieren auf der Startseite', async ({ page }) => {
    await page.goto('/');
    for (const hash of hashAnchors) {
      await page.goto('/' + hash);
      const id = hash.replace('#', '');
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
  });
});
