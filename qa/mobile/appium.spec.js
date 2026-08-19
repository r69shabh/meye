describe('Meye Mobile App (Appium)', () => {
    it('should load the app on mobile browser and verify title', async () => {
        // Navigate to the local dev server (if running locally on emulator, 10.0.2.2 points to host localhost)
        await browser.url('http://10.0.2.2:5173');
        
        const title = await browser.getTitle();
        expect(title.toLowerCase()).toContain('meyee');
    });

    it('should dismiss the onboarding tour', async () => {
        // Wait for the skip button and click it
        const skipBtn = await $('#btnSkipTour');
        if (await skipBtn.isExisting() && await skipBtn.isDisplayed()) {
            await skipBtn.click();
        }
    });

    it('should open the task composer', async () => {
        // Click the bottom input pill
        const inputPill = await $('#inputPill');
        await inputPill.waitForDisplayed({ timeout: 5000 });
        await inputPill.click();

        // Verify composer opens
        const composerInput = await $('#composerInput');
        await composerInput.waitForDisplayed({ timeout: 2000 });
        expect(await composerInput.isDisplayed()).toBe(true);
    });
});
