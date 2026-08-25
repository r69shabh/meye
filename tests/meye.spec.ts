import { test, expect } from '@playwright/test';

test.describe('Meye App E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Assuming the dev server is running on localhost:5173
    await page.goto('http://localhost:5173');

    // Handle onboarding tour overlay using evaluate to bypass pointer interception
    const skipBtn = page.locator('#btnSkipTour');
    if (await skipBtn.isVisible()) {
      await skipBtn.evaluate((node) => node.click());
      // Tour fades out over 400ms before removing itself; interactions before
      // that race with Composer.open()
      await expect(page.locator('#onboardingPage')).not.toHaveClass(/is-active/, { timeout: 5000 });
    }
  });

  test('should display the main UI elements', async ({ page }) => {
    // Check if the title is present
    await expect(page).toHaveTitle(/meye/i);
    
    // As a smoke test, we verify the app loads without crashing
    await expect(page.locator('body')).toBeVisible();
  });

  test('should allow user to type a task (Sanity)', async ({ page }) => {
    // Click the input pill to open the composer
    const inputPill = page.locator('#inputPill');
    if (await inputPill.isVisible()) {
      await inputPill.evaluate((node) => node.click());

      // Fill the composer input
      const composerInput = page.locator('#composerInput');
      await expect(composerInput).toBeVisible();
      // Dated items only appear on their own day, so keep it dateless
      await composerInput.fill('Buy milk');

      // Click the Add button
      const addBtn = page.locator('#composerAdd');
      await addBtn.evaluate((node) => node.click());

      // Verify the task appears in the list (wait for UI to update)
      await expect(page.locator('text=Buy milk')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should have GitHub Sync option in settings', async ({ page }) => {
    // Click Settings button
    const settingsBtn = page.locator('#btnSettings');
    await settingsBtn.evaluate((node) => node.click());

    // Verify settings page is visible
    await expect(page.locator('#settingsPage')).toBeVisible();

    // Check for GitHub Sync row
    const githubSyncRow = page.locator('#settingsGitHubSync');
    await expect(githubSyncRow).toBeVisible();
  });

  test('should have Exercise Artwork attribution in settings', async ({ page }) => {
    const settingsBtn = page.locator('#btnSettings');
    await settingsBtn.evaluate((node) => node.click());

    await expect(page.locator('#settingsPage')).toBeVisible();
    await expect(page.locator('#settingsExerciseArtwork')).toBeVisible();
  });

  test('should have Speech Language setting in settings', async ({ page }) => {
    const settingsBtn = page.locator('#btnSettings');
    await settingsBtn.evaluate((node) => node.click());

    await expect(page.locator('#settingsPage')).toBeVisible();
    await expect(page.locator('.settings-row[data-setting="speechLang"]')).toBeVisible();
    await expect(page.locator('#sv-speechLang')).toHaveText('English (US)');
  });

  test('should render exercise thumbnails on a routine with exercises', async ({ page }) => {
    // Create an illustrated routine via the composer
    const inputPill = page.locator('#inputPill');
    if (await inputPill.isVisible()) {
      await inputPill.evaluate((node) => node.click());
      const composerInput = page.locator('#composerInput');
      await expect(composerInput).toBeVisible();
      await composerInput.fill('daily workout: squats 3x15, push ups 3x12');
      await page.locator('#composerAdd').evaluate((node) => node.click());

      // Routine card should show matched artwork from the local library
      await expect(page.locator('.card--routine .card-ex-strip img').first()).toBeVisible({ timeout: 5000 });
      const src = await page.locator('.card--routine .card-ex-strip img').first().getAttribute('src');
      expect(src).toMatch(/^\/workouts\/[\w-]+\/frame-1\.png$/);
    }
  });
});
