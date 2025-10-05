import { test, expect } from '@playwright/test';

// Verifiziert, dass der Premium-Hero mit Trust Badges auf der Startseite gerendert wird
// Erwartet, dass die App mit Locale-Routing läuft (z. B. /de)

test.describe('Landing Premium Hero', () => {
  test('zeigt Premium-Hero mit Trust Badges und CTAs', async ({ page, baseURL }) => {
    const url = new URL(baseURL || 'http://localhost:3100');
    // Standardmäßig auf Deutsch testen
    url.pathname = '/de';

    await page.goto(url.toString());

    // Headline und Badge
    await expect(page.getByText('Quantum Neural Shield')).toBeVisible();
    await expect(page.getByText('Firewall‑Powered')).toBeVisible();
    await expect(page.getByText('AI‑Agents & Workflows')).toBeVisible();

    // CTAs
    await expect(page.getByRole('link', { name: 'Kostenlos starten' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Demo buchen' })).toBeVisible();

    // Trust Badges (Titel)
    await expect(page.getByText('SOC 2 Type II')).toBeVisible();
    await expect(page.getByText('ISO 27001')).toBeVisible();
    await expect(page.getByText('99.9% Uptime')).toBeVisible();
    await expect(page.getByText('<50ms Latenz')).toBeVisible();
  });
});
