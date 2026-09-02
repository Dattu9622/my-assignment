import axios from 'axios';

const BASE_URL = 'https://test.com/api';

describe('API Data Contract Validation Suite - FR-05', () => {

    test('a. Validate response schema and data contract', async () => {
        const response = await axios.get(`${BASE_URL}/response/98765`);
        expect(response.status).toBe(200);
        
        const data = response.data;
        expect(data).toHaveProperty('account_id');
        expect(data).toHaveProperty('account_email');
        expect(data).toHaveProperty('start_date');
        expect(data).toHaveProperty('end_date');
        expect(data).toHaveProperty('locale');
        expect(data).toHaveProperty('text');
        expect(data).toHaveProperty('suggestion_list');
        expect(data).toHaveProperty('completed');
    });

    test('b. Verify correct data types (Boolean for completed, ISO Timestamps)', async () => {
        const response = await axios.get(`${BASE_URL}/response/98765`);
        const { completed, start_date, end_date } = response.data;

        // Strict Boolean validation
        expect(typeof completed).toBe('boolean');

        // ISO 8601 with local offset (+05:30) validation
        const isoLocalRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+05:30$/;
        expect(start_date).toMatch(isoLocalRegex);
        expect(end_date).toMatch(isoLocalRegex);
    });

    test('c. Validate IETF BCP 47 locale format', async () => {
        const response = await axios.get(`${BASE_URL}/response/98765`);
        // IETF BCP 47 regex (e.g., en-IN, en-US)
        const bcp47Regex = /^[a-z]{2,3}(-[A-Z]{2})?$/;
        expect(response.data.locale).toMatch(bcp47Regex);
        expect(response.data.locale).toBe('en-IN');
    });

    test('d. Confirm suggestion_list contains ONLY matching suggestions', async () => {
        const response = await axios.get(`${BASE_URL}/response/98765`);
        const { text, suggestion_list } = response.data;

        const suggestionsArray = suggestion_list.split(',').map((s: string) => s.trim());
        suggestionsArray.forEach((suggestion: string) => {
            expect(suggestion.toLowerCase()).toContain(text.toLowerCase());
        });
        expect(suggestionsArray).toEqual(['agile methodology']);
    });

    test('e. Negative Case 1: Submit form with missing required fields', async () => {
        try {
            await axios.post(`${BASE_URL}/submit`, { account_id: "98765" });
        } catch (error: any) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.error).toContain('Missing required parameters');
        }
    });

    test('e. Negative Case 2: Submit form with unselected / invalid input text', async () => {
        try {
            await axios.post(`${BASE_URL}/submit`, {
                account_id: "98765",
                text: "completely random unlisted text"
            });
        } catch (error: any) {
            expect(error.response.status).toBe(422);
            expect(error.response.data.error).toBe('Invalid input. Please select a valid suggestion.');
        }
    });
});
