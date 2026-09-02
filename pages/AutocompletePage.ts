import { Page, Locator, expect } from '@playwright/test';

export class AutocompletePage {
    readonly page: Page;
    readonly inputField: Locator;
    readonly suggestionList: Locator;
    readonly suggestions: Locator;
    readonly nextButton: Locator;
    readonly errorMessage: Locator;
    readonly successContainer: Locator;

    constructor(page: Page) {
        this.page = page;
        this.inputField = page.locator('#input-field');
        this.suggestionList = page.locator('.suggestions');
        this.suggestions = page.locator('.suggestions li');
        this.nextButton = page.locator('#next-button');
        this.errorMessage = page.locator('.error-message');
        this.successContainer = page.locator('.success-container');
    }

    async navigate() {
        await this.page.goto('https://test.com/autocomplete-form');
    }

    async typeInput(text: string) {
        await this.inputField.fill(text);
    }

    async selectSuggestion(text: string) {
        await this.suggestions.filter({ hasText: text }).first().click();
    }

    async clickNext() {
        await this.nextButton.click();
    }

    async getVisibleSuggestions(): Promise<string[]> {
        return await this.suggestions.filter({ has: this.page.locator('visible') }).allTextContents();
    }
}
