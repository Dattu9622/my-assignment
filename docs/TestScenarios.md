Task 1: Top 10 Ranked Test Scenarios

The following matrix outlines the top 10 test scenarios for the Autocomplete web form, prioritized by risk level based on business impact, core functionality, data integrity, and cross-browser usability.
ID	Scenario Summary	Risk Level	Ranking Rationale
TS-01	Validate REST API payload contract integrity upon selecting 'Next'.	Critical	Data persistence failure or schema mismatch breaks core analytics, backend sync, and auditing downstream.
TS-02	Verify submission blocked & error message displayed for invalid input.	High	Allowing invalid, unselected, or malformed user text violates core form validation requirements.
TS-03	Verify default prefix-matching filtering logic (FR-02).	High	Core usability feature; failure prevents users from finding intended auto-complete options efficiently.
TS-04	Verify configurable 'Match Anywhere' filtering logic (FR-03).	High	Critical administrative/configurable backend feature; incorrect behavior causes functional mismatch for users.
TS-05	Validate accurate local timezone ISO timestamps (start_date, end_date) in payload.	Medium	Incorrect timezone offsets or UTC forced conversions distort SLA tracking, reporting, and audit logs.
TS-06	Verify keyboard navigation (Tab, Enter, Escape) across form controls.	Medium	Essential for accessibility (WCAG 2.1) and power-user accessibility compliance.
TS-07	Verify accurate IETF BCP 47 locale format transmission in payload.	Medium	Localization tracking relies on valid locale strings; improper formats break regional user behavior analytics.
TS-08	Verify suggestion_list payload property contains ONLY matching options.	Medium	Ensures backend payload accurately captures filtered options visible during user selection rather than all system suggestions.
TS-09	Verify UI state transition on successful submission (FR-04).	Low	Visual confirmation ensures positive user feedback, preventing duplicate form submissions.
TS-10	Verify suggestion list selection via mouse click / tap interaction.	Low	Basic UI click handler check ensuring input field auto-populates upon visual option selection.




Task 2: Discrepancy & Defect Analysis (FR-05 Breakdown)

Upon completing the form with input 'agile methodology' in an environment configured for India (IST, UTC+05:30) with Chrome language set to English, a GET request returned the API payload below. A thorough comparison against FR-05 backend requirements revealed 4 critical discrepancies:
1. Discrepancy in `start_date` and `end_date` Timezone
• Requirement: FR-05 mandates timestamps in the user's local time.
• Observed Response: "start_date": "2024-03-15T10:30:00Z", "end_date": "2024-03-15T10:32:00Z"
• Impact: The returned timestamps are formatted in UTC (signified by trailing 'Z') rather than ISO 8601 with local timezone offset (+05:30 for India/IST, e.g., '2024-03-15T16:00:00+05:30').
2. Discrepancy in `locale` Format
• Requirement: FR-05 mandates IETF BCP 47 format (e.g., en-IN for English in India).
• Observed Response: "locale": "en"
• Impact: The returned string 'en' is an ISO 639-1 language code, lacking the required ISO 3166-1 alpha-2 region subtag ('en-IN').
3. Discrepancy in `suggestion_list` Filtering Content
• Requirement: FR-05 mandates a comma-separated string of suggestions matching the value entered/selected.
• Observed Response: "suggestion_list": "agile methodology, agile methodology process, agile methodology process testing"
• Impact: When the user selects 'agile methodology', the matching subset for the exact value should be ONLY 'agile methodology'. The response returned all original DOM suggestions unconditionally.
4. Discrepancy in `completed` Data Type
• Requirement: FR-05 mandates a Boolean data type representing response upload status.
• Observed Response: "completed": "true" (String)
• Impact: The API returns a string literal "true" instead of a primitive JSON boolean value `true`. This causes strict type validation failures in frontend client applications.



Task 3: Detailed Test Cases (UI & API)

The following test cases cover both UI behavior and backend API data contract requirements.
TC-UI-01: Verify Suggestion Filtering using Default Prefix Match (FR-01, FR-02)
Field	Details
Preconditions	Navigate to https://test.com/autocomplete-form. Default config active.
Test Data	Input strings: 'agile', 'agile process'
Test Steps	1. Type 'agile' in text input field.
2. Observe rendered suggestion list.
3. Type ' process' (input becomes 'agile process').
4. Observe rendered suggestion list.
Expected Results	1. After typing 'agile', all 3 suggestions remain visible.
2. After typing 'agile process', all suggestions disappear as none start with 'agile process'.

TC-UI-02: Verify Configurable 'Match Anywhere' Filtering Logic (FR-03)
Field	Details
Preconditions	Form configured with 'Match Anywhere' enabled in backend config.
Test Data	Input: 'methodology process'
Test Steps	1. Focus input field.
2. Type 'methodology process'.
3. Inspect visible `<li>` items in `.suggestions` list.
Expected Results	'agile methodology process' and 'agile methodology process testing' remain visible. 'agile methodology' disappears.

TC-UI-03: Verify Form Submission Success with Valid Selection (FR-01, FR-04)
Field	Details
Preconditions	User is on autocomplete form.
Test Data	Selected suggestion: 'agile methodology'
Test Steps	1. Type 'agile'.
2. Click suggestion 'agile methodology'.
3. Click 'Next' button.
4. Observe UI container updates and network response.
Expected Results	REST API POST returns HTTP 200 OK. Success container displays 'Success! Your response has been recorded.' Error span hidden.

TC-UI-04: Verify Error Display on Invalid Text Input Submission (FR-04)
Field	Details
Preconditions	User is on autocomplete form.
Test Data	Input: 'invalid custom input'
Test Steps	1. Type 'invalid custom input' (not in suggestion list).
2. Click 'Next' button.
3. Observe UI elements.
Expected Results	REST API returns error/400. Span `.error-message` displays 'Error: Invalid input. Please select a valid suggestion.' Success container hidden.

TC-UI-05: Verify Keyboard Tab Navigation and Submission (Task 4 Req)
Field	Details
Preconditions	User lands on https://test.com/autocomplete-form.
Test Data	Keyboard sequence: Tab -> Type -> Tab -> Enter
Test Steps	1. Press 'Tab' key to focus input field.
2. Type 'agile methodology'.
3. Press 'Tab' to focus 'Next' button.
4. Press 'Enter' key.
Expected Results	Focus highlights input field, then moves seamlessly to 'Next' button. Pressing Enter triggers form submission successfully.

TC-API-01: Validate Timestamps Local Offset and ISO 8601 Format (FR-05)
Field	Details
Preconditions	Form submitted by user in India timezone (IST, UTC+05:30).
Test Data	Endpoint: GET /api/response/{id}
Test Steps	1. Execute GET request to fetch response object.
2. Validate regex pattern for `start_date` and `end_date`.
3. Verify timezone offset equals '+05:30'.
Expected Results	Timestamps match `YYYY-MM-DDTHH:mm:ss+05:30`. Offset is local offset (+05:30), NOT UTC 'Z'.

TC-API-02: Validate IETF BCP 47 Locale Field Structure (FR-05)
Field	Details
Preconditions	Browser configured with English (India) - 'en-IN'.
Test Data	Browser locale: en-IN
Test Steps	1. Submit form with valid response.
2. Perform GET request to retrieve API response.
3. Validate `locale` property value against IETF BCP 47 pattern.
Expected Results	API response property `locale` strict equals 'en-IN' (language-REGION format).

TC-API-03: Validate `suggestion_list` and `completed` Data Types (FR-05)
Field	Details
Preconditions	Form response submitted successfully.
Test Data	Selected text: 'agile methodology'
Test Steps	1. Perform GET request to retrieve persisted response object.
2. Assert `typeof completed === 'boolean'`.
3. Assert `suggestion_list` contains only matching elements.
Expected Results	`completed` is boolean `true` (unquoted). `suggestion_list` equals 'agile methodology'.




Task 6: AI Reflection & Methodology

a. Tools Used
ChatGPT (GPT-4o) and Claude 3.5 Sonnet were utilized during this assignment for test case drafting, code scaffolding, and schema regex generation.
b. Usage Areas
1. Generating initial boilerplate for Playwright TypeScript Page Object Model (POM).
2. Scaffolding JSON schema validation assertions for API test suites.
3. Brainstorming edge cases for autocomplete suggestion filtering.
c. Modifications Made (Specific Examples)
Example 1 (Timezone Validation Correction):
• AI Output: Generated standard ISO timestamp validation accepting UTC trailing 'Z' (`2024-03-15T10:30:00Z`).
• Modification: Refactored the regular expression to enforce local timezone offsets (`+05:30`) as explicitly required by FR-05 for IST users.
• Reasoning: Accepting 'Z' (UTC) missed the exact defect present in the sample response GET output.

Example 2 (Type Strictness Correction in API Assertion):
• AI Output: Recommended `expect(data.completed).toBeTruthy()`.
• Modification: Replaced with strict type assertion `expect(typeof data.completed).toBe('boolean')`.
• Reasoning: `toBeTruthy()` evaluates the string `"true"` as truthy, masking the severe backend data type mismatch bug.
d. AI Limitations & Oversights
• Oversights Identified: The AI failed to catch that `completed: "true"` in the GET response was a string primitive rather than a boolean. Because JavaScript loosely evaluates `"true"` as truthy in boolean checks, AI-generated code initially marked the defect as passing. Manual inspection and strict type enforcement were necessary to surface this discrepancy.




