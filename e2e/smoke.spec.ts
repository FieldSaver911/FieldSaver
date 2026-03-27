import { test, expect } from '@playwright/test';

test.describe('FieldSaver — Smoke Tests', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/FieldSaver/i);
  });

  test('health endpoint responds', async ({ request }) => {
    const res = await request.get('http://localhost:3001/health');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });
});

test.describe('Authentication', () => {
  test('login page is accessible', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('can login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-btn"]');
    await page.waitForURL('/builder');
    await expect(page.locator('[data-testid="form-builder"]')).toBeVisible();
  });
});

test.describe('Form Builder', () => {
  test.beforeEach(async ({ page }) => {
    // Log in first
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-btn"]');
    await page.waitForURL('/builder');
  });

  test('can create a new form', async ({ page }) => {
    await page.click('[data-testid="new-form-btn"]');
    await expect(page.locator('[data-testid="form-canvas"]')).toBeVisible();
    await expect(page.locator('[data-testid="form-name-input"]')).toHaveValue('Untitled Form');
  });

  test('can add a field to the canvas', async ({ page }) => {
    await page.click('[data-testid="new-form-btn"]');
    // Drag text field from palette to canvas
    await page.dragAndDrop(
      '[data-testid="palette-field-text"]',
      '[data-testid="canvas-drop-zone"]',
    );
    await expect(page.locator('[data-testid="field-card"]')).toBeVisible();
  });

  test('field settings panel opens on click', async ({ page }) => {
    await page.click('[data-testid="new-form-btn"]');
    await page.dragAndDrop(
      '[data-testid="palette-field-text"]',
      '[data-testid="canvas-drop-zone"]',
    );
    await page.click('[data-testid="field-card"]');
    await expect(page.locator('[data-testid="field-settings-panel"]')).toBeVisible();
  });

  test('can open library browser', async ({ page }) => {
    await page.click('[data-testid="new-form-btn"]');
    await page.click('[data-testid="libraries-btn"]');
    await expect(page.locator('[data-testid="library-browser"]')).toBeVisible();
    await expect(page.locator('text=NEMSIS v3.5')).toBeVisible();
  });

  test('can open preview modal', async ({ page }) => {
    await page.click('[data-testid="new-form-btn"]');
    await page.click('[data-testid="preview-btn"]');
    await expect(page.locator('[data-testid="preview-modal"]')).toBeVisible();
  });
});
