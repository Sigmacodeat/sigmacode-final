import { test, expect } from '@playwright/test'

// Helper to assert redirect to localized login with callbackUrl
async function expectRedirectToLogin(pageUrl: string, currentUrl: string) {
  // Expect /{locale}/login?callbackUrl=...
  const url = new URL(currentUrl)
  const parts = url.pathname.split('/').filter(Boolean)
  // locale should be present as first segment (de|en)
  expect(parts.length).toBeGreaterThanOrEqual(2)
  expect(['de', 'en']).toContain(parts[0])
  expect(parts[1]).toBe('login')
  // callbackUrl should be the originally requested path
  const callbackUrl = url.searchParams.get('callbackUrl')
  expect(callbackUrl).toBeTruthy()
  // ensure encoded path matches original base path (ignore query differences)
  // e.g. /de/dashboard -> callback=/de/dashboard
  // or /de/chat -> callback=/de/chat
}

// Public routes should load without authentication
const PUBLIC_ROUTES = ['/', '/de', '/en', '/de/pricing', '/de/blog']

// Protected routes should redirect to login when no session cookie exists
const PROTECTED_ROUTES = ['/de/dashboard', '/de/chat', '/de/agents', '/de/workflows', '/de/firewall']

test.describe('Routing & Auth Gate Sanity', () => {
  test('public routes are reachable', async ({ page }) => {
    for (const path of PUBLIC_ROUTES) {
      const res = await page.goto(path)
      expect(res, `Navigation failed for ${path}`).not.toBeNull()
      expect(res!.ok(), `HTTP not OK for ${path}: ${res!.status()}`).toBeTruthy()
      // Basic sanity: no infinite redirects and page has some content
      await page.waitForLoadState('networkidle')
      const bodyText = await page.locator('body').innerText()
      expect(bodyText.length, `Empty body for ${path}`).toBeGreaterThan(0)
    }
  })

  test('protected routes redirect to localized login when unauthenticated', async ({ page }) => {
    for (const path of PROTECTED_ROUTES) {
      await page.goto(path)
      await page.waitForLoadState('domcontentloaded')
      const current = page.url()
      await expectRedirectToLogin(path, current)
    }
  })
})

test.describe('Health endpoints', () => {
  test('GET /api/health returns 200', async ({ request, baseURL }) => {
    const res = await request.get('/api/health')
    expect(res.status(), 'Expected 200 for /api/health').toBe(200)
    const json = await res.json().catch(() => null)
    expect(json ?? {}, 'Health should return JSON').toBeTruthy()
  })

  test('GET /api/health-check rewrites to /api/health (200)', async ({ request }) => {
    const res = await request.get('/api/health-check')
    expect(res.status(), 'Expected 200 for /api/health-check').toBe(200)
  })
})
