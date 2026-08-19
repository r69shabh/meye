# Jira-Style Bug Reports

This document contains examples of bug tracking documentation, reflecting the ability to identify, reproduce, document, and track bugs.

---

## BUG-101: Speech Recognition Fails on iOS Devices in Noisy Environments

**Summary:** The speech recognition module (using `@capacitor-community/speech-recognition`) occasionally throws a timeout error on iOS devices when there is significant background noise, instead of returning partial results.

**Environment:**
- **Device:** iPhone 13 Pro
- **OS:** iOS 16.5
- **App Version:** 0.1.0
- **Connection:** Wi-Fi

**Steps to Reproduce:**
1. Open the application on an iOS device.
2. Ensure there is moderate background noise (e.g., street noise or a fan).
3. Tap the microphone icon to initiate speech recognition.
4. Speak a command like "Schedule a meeting for tomorrow".
5. Wait for the parsing to complete.

**Expected Result:**
The app should capture the spoken text, or at least return a partial string. If it fails, it should display a user-friendly error message (e.g., "Could not hear you clearly").

**Actual Result:**
The app hangs for 10 seconds and then silently fails. The microphone icon remains in the "recording" state, and no error message is displayed to the user.

**Severity:** Major
**Priority:** High

**Attachments:**
- `ios_console_log.txt` (simulated)
- `screen_recording.mp4` (simulated)

---

## BUG-102: GitHub OAuth Callback Fails when State Parameter is Missing

**Summary:** If the GitHub OAuth callback is triggered without the `state` parameter, the backend API (`api/github-auth.js`) throws an unhandled server error instead of a graceful 400 Bad Request.

**Environment:**
- **Component:** Backend API (`/api/github-auth`)
- **Environment:** Production (Vercel)

**Steps to Reproduce:**
1. Manually navigate to `https://meyee.vercel.app/api/github-auth?code=12345` (omitting the `state` query parameter).
2. Observe the server response.

**Expected Result:**
The server should validate the request, recognize the missing `state` parameter, and return a `400 Bad Request` with a JSON payload: `{"error": "Missing state parameter"}`.

**Actual Result:**
The server returns a `500 Internal Server Error` and logs an undefined reference exception in the Vercel console.

**Severity:** Minor
**Priority:** Medium
