"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let MAX_LOGIN_ATTEMPTS = 3; // Default value, will be overridden by settings
let loginAttempts = 0;
let lastKnownUrl = window.location.href; // Stores the URL to detect changes
// Function to fill form fields and attempt login
function fillLoginForm(credentials, attempt = 1) {
    console.log(`Attempting to fill form and log in (Attempt ${attempt}/${MAX_LOGIN_ATTEMPTS}):`, credentials);
    // Selectors based on the image IDs/Placeholders
    const emailInput = document.getElementById('eUsuario');
    const passwordInput = document.getElementById('ePassword');
    const companyInput = document.querySelector('input[placeholder="Empresa"]');
    const rememberMeToggle = document.querySelector('input[type="checkbox"][role="switch"]');
    // Login Button: Robust selection by button text
    const loginButton = document.querySelector('input[type="submit"][value="Login"]');
    let filledCount = 0;
    let allMainFieldsFilled = false; // Flag to check if email and password are truly filled
    if (emailInput && credentials.email) {
        emailInput.value = credentials.email;
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        emailInput.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('Email field filled.');
        filledCount++;
    }
    if (passwordInput && credentials.password) {
        passwordInput.value = credentials.password;
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('Password field filled.');
        filledCount++;
    }
    if (companyInput && credentials.company) {
        companyInput.value = credentials.company;
        companyInput.dispatchEvent(new Event('input', { bubbles: true }));
        companyInput.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('Company field filled.');
        filledCount++;
    }
    if (rememberMeToggle && credentials.rememberMe !== undefined) {
        if (rememberMeToggle.checked !== credentials.rememberMe) {
            rememberMeToggle.click();
            rememberMeToggle.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('Remember Me toggle adjusted.');
        }
        filledCount++;
    }
    // Check if main fields (email and password) are actually filled
    if (emailInput?.value === credentials.email && passwordInput?.value === credentials.password) {
        allMainFieldsFilled = true;
    }
    // Auto-click the Login button if main fields are filled and button exists
    if (loginButton && allMainFieldsFilled) {
        console.log('Main fields filled. Attempting to click login button...');
        loginButton.click();
        console.log('Login button clicked.');
        // After clicking, wait and check if the URL has changed.
        // This is an indicator (not perfect) of whether the login was "successful".
        setTimeout(() => {
            if (window.location.href === lastKnownUrl && attempt < MAX_LOGIN_ATTEMPTS) {
                console.warn(`URL has not changed after attempt ${attempt}. Retrying in 3 seconds...`);
                loginAttempts++;
                // If the URL hasn't changed, retry until max attempts are reached.
                setTimeout(() => fillLoginForm(credentials, attempt + 1), 3000); // 3 seconds delay
            }
            else {
                if (window.location.href !== lastKnownUrl) {
                    console.log('Login successful! URL has changed.');
                }
                else {
                    console.error(`Login failed after ${MAX_LOGIN_ATTEMPTS} attempts. URL did not change.`);
                }
                loginAttempts = 0; // Reset attempts regardless of final success/failure
            }
        }, 1500); // Wait 1.5 seconds after click to check URL
    }
    else {
        console.log('Could not click login button (button not found or fields not filled).');
        console.log('Button status:', loginButton); // Check if loginButton is null
        console.log('Main fields filled:', allMainFieldsFilled);
    }
}
// Function to normalize URLs for better comparison
// Used for auto-execution on page load
function normalizeUrl(url) {
    try {
        const urlObj = new URL(url);
        urlObj.hash = ''; // Remove fragments
        urlObj.search = ''; // Remove query parameters
        let path = urlObj.pathname;
        if (path.length > 1 && path.endsWith('/')) {
            path = path.substring(0, path.length - 1);
        }
        urlObj.pathname = path;
        return urlObj.toString();
    }
    catch (e) {
        console.error("Error normalizing URL:", url, e);
        return url;
    }
}
// Main function that executes when the document is ready (for auto-login on page load)
async function autoLoginOnPageLoad() {
    console.log('Content script loaded.');
    loginAttempts = 0; // Reset attempts on each page load
    lastKnownUrl = window.location.href; // Update reference URL
    const result = await chrome.storage.sync.get(['extensionSettings']);
    const settings = result.extensionSettings || {
        enabled: false,
        targetUrl: '',
        credentials: {},
        maxRetries: 3
    };
    MAX_LOGIN_ATTEMPTS = settings.maxRetries || 3; // Set MAX_LOGIN_ATTEMPTS from stored settings
    const currentUrl = normalizeUrl(window.location.href);
    const targetUrlNormalized = normalizeUrl(settings.targetUrl);
    // This check remains for automatic execution when the page loads,
    // using the saved configuration.
    if (settings.enabled && settings.targetUrl && (currentUrl.startsWith(targetUrlNormalized) || currentUrl === targetUrlNormalized)) {
        console.log('Auto-login enabled for this URL on page load.');
        if (settings.credentials && settings.credentials.email) {
            fillLoginForm(settings.credentials);
        }
        else {
            console.log('No saved credentials for auto-login on page load.');
        }
    }
    else {
        console.log('Auto-login disabled or URL does not match on page load.');
    }
}
// Execute logic when the DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoLoginOnPageLoad);
}
else {
    autoLoginOnPageLoad().then(_ => {
    });
}
