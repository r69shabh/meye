import { test, expect } from '@playwright/test';

test.describe('Meye App E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Assuming the dev server is running on localhost:5173
    await page.goto('http://localhost:5173');

    // Handle onboarding tour overlay using evaluate to bypass pointer interception
    const skipBtn = page.locator('#btnSkipTour');
    if (await skipBtn.isVisible()) {
      await skipBtn.evaluate((node) => node.click());
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
      await composerInput.fill('Buy milk tomorrow');

      // Click the Add button
      const addBtn = page.locator('#composerAdd');
      await addBtn.evaluate((node) => node.click());

      // Verify the task appears in the list (wait for UI to update)
      // Note: The NLP parser will strip "tomorrow" from the text
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
});
