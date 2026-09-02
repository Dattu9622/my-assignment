import { test, expect } from '@playwright/test';
import { AutocompletePage } from '../pages/AutocompletePage';

test.describe('Autocomplete Form UI Automation Suite', () => {
    let autoPage: AutocompletePage;

    test.beforeEach(async ({ page }) => {
        autoPage = new AutocompletePage(page);
        await autoPage.navigate();
    });

    test('1. Tab Navigation - Navigate between form elements using Tab key', async ({ page }) => {
        await page.keyboard.press('Tab');
        await expect(autoPage.inputField).toBeFocused();

        await page.keyboard.press('Tab');
        await expect(autoPage.nextButton).toBeFocused();
    });

    test('2. Keyboard Interaction - Submit via Enter and Clear via Escape', async ({ page }) => {
        await autoPage.inputField.focus();
        await autoPage.typeInput('agile methodology');
        
        // Escape clears input
        await page.keyboard.press('Escape');
        await expect(autoPage.inputField).toHaveValue('');

        // Enter submits form
        await autoPage.selectSuggestion('agile methodology');
        await page.keyboard.press('Enter');
        await expect(autoPage.successContainer).toBeVisible();
    });

    test('3. Suggestion Filtering - Prefix Match verification', async () => {
        await autoPage.typeInput('agile');
        let visible = await autoPage.getVisibleSuggestions();
        expect(visible.length).toBe(3);

        await autoPage.typeInput('agile methodology process');
        visible = await autoPage.getVisibleSuggestions();
        expect(visible).toContain('agile methodology process');
    });

    test('4. Suggestion Selection - Click populates input field', async () => {
        await autoPage.typeInput('agile');
        await autoPage.selectSuggestion('agile methodology process testing');
        await expect(autoPage.inputField).toHaveValue('agile methodology process testing');
    });

    test('5. Form Submission - Success vs Error Display', async () => {
        // Invalid Submission
        await autoPage.typeInput('invalid query');
        await autoPage.clickNext();
        await expect(autoPage.errorMessage).toBeVisible();

        // Valid Submission
        await autoPage.typeInput('agile');
        await autoPage.selectSuggestion('agile methodology');
        await autoPage.clickNext();
        await expect(autoPage.successContainer).toBeVisible();
    });
});
