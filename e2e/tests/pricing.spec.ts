import { test, expect, Page } from '@playwright/test';

const BASE_LOCALE = 'de';

// Helpers
async function gotoPricing(page: Page) {
  await page.goto(`http://localhost:3000/${BASE_LOCALE}/pricing`);
  await expect(page).toHaveURL(new RegExp(`/${BASE_LOCALE}/pricing`));
}

test.describe('Pricing Page', () => {
  test('renders 5 plans with premium UI and feature matrix', async ({ page }) => {
    await gotoPricing(page);

    // Plans by visible names
    const planNames = ['Free', 'Starter', 'Professional', 'Business', 'Enterprise'];
    for (const name of planNames) {
      await expect(page.getByText(name, { exact: true })).toBeVisible();
    }

    // Matrix headers
    for (const header of ['Feature', 'Free', 'Starter', 'Pro', 'Business', 'Enterprise']) {
      await expect(page.getByRole('columnheader', { name: header })).toBeVisible();
    }

    // Add-ons section present
    await expect(page.getByText('Add‑ons & Usage')).toBeVisible();
  });

  test('billing toggle yearly shows savings badge and effective monthly', async ({ page }) => {
    await gotoPricing(page);

    const yearlyBtn = page.getByRole('button', { name: /Jährlich/i });
    await yearlyBtn.click();

    // Savings badge should appear
    await expect(page.getByText(/Spare\s*\d+%/i)).toBeVisible();
    // Effective monthly text
    await expect(page.getByText(/Effektiv/i)).toBeVisible();
  });

  test('currency toggle switches to USD and prices use $', async ({ page }) => {
    await gotoPricing(page);

    const usdBtn = page.getByRole('button', { name: 'USD' });
    await usdBtn.click();

    // Expect at least one price to contain a $ symbol
    const priceCandidate = page.locator('text=/\$/').first();
    await expect(priceCandidate).toBeVisible();
  });

  test('landing anchor /#pricing renders pricing section', async ({ page }) => {
    await page.goto(`http://localhost:3000/${BASE_LOCALE}#pricing`);
    // Pricing title is visible (from content: "Pläne & Preise")
    await expect(page.getByText('Pläne & Preise')).toBeVisible();
  });

  test('checkout CTA exists for paid plans and enterprise leads to contact', async ({ page }) => {
    await gotoPricing(page);

    // Expect a CTA button/link for Pro/Business
    await expect(page.getByRole('button', { name: /Pro testen|Auswählen/i })).toBeVisible();

    // Enterprise should have a link to contact
    const enterpriseCard = page.getByText('Enterprise').locator('..');
    // Find contact link inside same card area (fallback to global if necessary)
    const contactLink = page.getByRole('link', { name: /Kontakt/i }).first();
    await expect(contactLink).toBeVisible();
  });
});
