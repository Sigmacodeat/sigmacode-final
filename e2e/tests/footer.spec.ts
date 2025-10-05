import { test, expect, Page } from '@playwright/test';

// Robust gegen Locale-Prefix (de|en). Wir klicken echte Footer-Links und prüfen, dass keine 404 entsteht.

// Selektoren-Helfer für Footer
const footer = {
  root: () => ({ role: 'contentinfo' as const }),
  // Spaltenüberschriften
  productHeading: 'Produkt',
  resourcesHeading: 'Ressourcen',
  legalHeading: 'Rechtliches',
};

async function clickFooterLink(page: Page, heading: string, linkText: string) {
  const footerRoot = page.getByRole('contentinfo');
  await expect(footerRoot).toBeVisible();
  const column = footerRoot.getByRole('heading', { name: heading });
  await expect(column).toBeVisible();
  const link = footerRoot.getByRole('link', { name: linkText, exact: true });
  await expect(link).toBeVisible();
  await Promise.all([
    page.waitForLoadState('networkidle'),
    link.click(),
  ]);
  await expect(page).not.toHaveURL(/404|not-found/i);
}

// Manche Seiten sind geschützt; hier testen wir nur öffentliche Footer-Ziele
// Public: /firewall, /agents, /analytics, /pricing, /docs, /use-cases, /security, /changelog, /legal/*, /contact

test.describe('Footer Links', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('Produkt-Spalte Links erreichbar', async ({ page }) => {
    await clickFooterLink(page, footer.productHeading, 'Neural Firewall');
    await page.goto('/');
    await clickFooterLink(page, footer.productHeading, 'AI Agents');
    await page.goto('/');
    await clickFooterLink(page, footer.productHeading, 'Analytics');
    await page.goto('/');
    await clickFooterLink(page, footer.productHeading, 'Pricing');
  });

  test('Ressourcen-Spalte Links erreichbar', async ({ page }) => {
    await clickFooterLink(page, footer.resourcesHeading, 'Dokumentation');
    await page.goto('/');
    await clickFooterLink(page, footer.resourcesHeading, 'Use Cases');
    await page.goto('/');
    await clickFooterLink(page, footer.resourcesHeading, 'Security');
    await page.goto('/');
    await clickFooterLink(page, footer.resourcesHeading, 'Changelog');
  });

  test('Rechtliches & Kontakt erreichbar', async ({ page }) => {
    await clickFooterLink(page, footer.legalHeading, 'Impressum');
    await page.goto('/');
    await clickFooterLink(page, footer.legalHeading, 'Datenschutz');
    await page.goto('/');
    await clickFooterLink(page, footer.legalHeading, 'AGB');
    await page.goto('/');
    // Kontakt CTA (unten rechts)
    const contactCta = page.getByRole('link', { name: 'Kontakt' }).last();
    await expect(contactCta).toBeVisible();
    await Promise.all([
      page.waitForLoadState('networkidle'),
      contactCta.click(),
    ]);
    await expect(page).not.toHaveURL(/404|not-found/i);
  });
});
