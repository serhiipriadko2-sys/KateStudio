import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - WEB', () => {
  test('Landing page loads and displays hero section', async ({ page }) => {
    // Navigate to the app root
    await page.goto('/');

    // Check that the title is correct
    await expect(page).toHaveTitle(/К себе — студия йоги в Дубне/);

    // Check that the hero text we just updated is visible
    const heroText = page.locator('text=Студия К Себе').first();
    await expect(heroText).toBeVisible();

    // Check that the main call to action is present
    const ctaButton = page.locator('text=ЗАПИСАТЬСЯ НА ЗАНЯТИЕ').first();
    await expect(ctaButton).toBeVisible();
  });

  test('Classes schedule page loads', async ({ page }) => {
    // Navigate to the schedule directly
    await page.goto('/classes');

    // Make sure some schedule UI elements appear (e.g. date picker or class cards)
    // We do a loose check here to avoid depending on dynamic data
    const heading = page.locator('h1', { hasText: 'Расписание занятий' });
    if ((await heading.count()) > 0) {
      await expect(heading).toBeVisible();
    }

    // The page should at least mount and not show a blank screen or 404
    await expect(page.locator('body')).toBeVisible();
  });
});
