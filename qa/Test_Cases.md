# Meye Test Scenarios & Cases

This document outlines the testing strategy and key test cases for the Meye application, covering functional, regression, smoke, and sanity testing.

## 1. Smoke Testing (Build Verification)
**Objective:** Verify that the critical functionalities of the application are working fine in the new build.

| Test Case ID | Scenario | Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| ST_01 | App Launch | 1. Open the application (Web/Mobile) | App loads without crashing and displays the home screen. | Pass |
| ST_02 | GitHub Login | 1. Click "Login with GitHub" | Redirects to GitHub OAuth, authenticates, and returns to the app. | Pass |
| ST_03 | Main UI Rendering | 1. Log in to the app | The main dashboard, task list, and input fields are visible. | Pass |

## 2. Sanity Testing
**Objective:** After a minor code drop, verify that the bugs have been fixed and no further issues are introduced in the related areas.

| Test Case ID | Scenario | Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| SAN_01 | Task Creation via NLP | 1. Type "Remind me to call John tomorrow at 5 PM" in input field.<br>2. Press Enter. | Task is created and parsed correctly for "tomorrow at 5 PM". | Pass |
| SAN_02 | Local Storage Sync | 1. Create a task.<br>2. Refresh the page/app. | The task persists and is fetched correctly from `localStorage`. | Pass |

## 3. Functional Testing
**Objective:** Verify the software system against the functional requirements/specifications.

| Test Case ID | Scenario | Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| FT_01 | Speech Recognition | 1. Click the microphone icon.<br>2. Speak "Add milk to groceries". | The text "Add milk to groceries" appears in the input field. | Untested |
| FT_02 | Complete a Task | 1. Click the checkbox next to an active task. | The task is marked as complete and moved to the completed section (or crossed out). | Pass |
| FT_03 | Delete a Task | 1. Swipe left / click delete on a task. | The task is removed from the UI and `localStorage`. | Pass |
| FT_04 | Invalid OAuth State | 1. Attempt OAuth with an invalid `state` parameter. | The `github-auth.js` API rejects the request or gracefully handles the error. | Pass |

## 4. Regression Testing
**Objective:** Verify that recent code changes have not adversely affected existing features.

| Test Case ID | Scenario | Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| RT_01 | Offline Mode | 1. Turn off internet connection.<br>2. Add a new task.<br>3. Turn connection back on. | Task is created successfully offline. (Requires local DB/storage check). | Pass |
| RT_02 | Cross-device UI | 1. Open app on iPhone screen size.<br>2. Open app on Desktop screen size. | UI elements scale correctly; no overlapping or hidden buttons. | Pass |

