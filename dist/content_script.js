"use strict";
const DEFAULT_MAX_LOGIN_ATTEMPTS = 3; // Default value, will be overridden by settings
const SECONDS_DELAY_BETWEEN_ATTEMPTS = 3;
let maxLoginAttempts = DEFAULT_MAX_LOGIN_ATTEMPTS;
let loginAttempts = 0;
let lastKnownUrl = window.location.href; // Stores the URL to detect changes
// Function to fill form fields and attempt login
function fillLoginForm(credentials, attempt = 1) {
    console.log(`Attempting to fill form and log in (Attempt ${attempt}/${maxLoginAttempts}):`, credentials);
    // Selectors based on the image IDs/Placeholders
    const emailInput = document.getElementById('eUsuario');
    const passwordInput = document.getElementById('ePassword');
    const companyInput = document.querySelector('input[placeholder="Empresa"]');
    const rememberMeToggle = document.querySelector('input[type="checkbox"][role="switch"]');
    const loginButton = document.querySelector('input[type="submit"][value="Login"]');
    let filledCount = 0;
    let allMainFieldsFilled = false; // Flag to check if email and password are truly filled
    if (emailInput && credentials.email) {
        emailInput.value = credentials.email;
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        emailInput.dispatchEvent(new Event('change', { bubbles: true }));
        filledCount++;
    }
    if (passwordInput && credentials.password) {
        passwordInput.value = credentials.password;
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
        filledCount++;
    }
    if (companyInput && credentials.company) {
        companyInput.value = credentials.company;
        companyInput.dispatchEvent(new Event('input', { bubbles: true }));
        companyInput.dispatchEvent(new Event('change', { bubbles: true }));
        filledCount++;
    }
    if (rememberMeToggle && credentials.rememberMe !== undefined) {
        if (rememberMeToggle.checked !== credentials.rememberMe) {
            rememberMeToggle.click();
            rememberMeToggle.dispatchEvent(new Event('change', { bubbles: true }));
        }
        filledCount++;
    }
    // Check if main fields (email and password) are actually filled
    if (emailInput?.value === credentials.email && passwordInput?.value === credentials.password) {
        allMainFieldsFilled = true;
    }
    // Auto-click the Login button if main fields are filled and button exists
    if (loginButton && allMainFieldsFilled) {
        loginButton.click();
        // After clicking, wait and check if the URL has changed.
        // This is an indicator (not perfect) of whether the login was "successful".
        setTimeout(() => {
            if (window.location.href === lastKnownUrl && attempt < maxLoginAttempts) {
                console.warn(`URL has not changed after attempt ${attempt}`);
                loginAttempts++;
                // If the URL hasn't changed, retry until max attempts are reached
                setTimeout(() => fillLoginForm(credentials, attempt + 1), SECONDS_DELAY_BETWEEN_ATTEMPTS * 1000);
            }
            else {
                if (window.location.href !== lastKnownUrl) {
                    console.log('Login successful! URL has changed.');
                }
                else {
                    console.error(`Login failed after ${maxLoginAttempts} attempts. URL did not change`);
                }
                // Reset attempts regardless of final success/failure
                loginAttempts = 0;
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
    loginAttempts = 0; // Reset attempts on each page load
    lastKnownUrl = window.location.href; // Update reference URL
    const result = await chrome.storage.sync.get(['extensionSettings']);
    const settings = result.extensionSettings || {
        enabled: false,
        targetUrl: '',
        credentials: {},
        maxRetries: 3
    };
    maxLoginAttempts = settings.maxRetries || DEFAULT_MAX_LOGIN_ATTEMPTS;
    const currentUrl = normalizeUrl(window.location.href);
    const targetUrlNormalized = normalizeUrl(settings.targetUrl);
    // This check remains for automatic execution when the page loads,
    // using the saved configuration.
    if (settings.enabled && settings.targetUrl && (currentUrl.startsWith(targetUrlNormalized) || currentUrl === targetUrlNormalized)) {
        if (settings.credentials && settings.credentials.email) {
            fillLoginForm(settings.credentials);
        }
    }
    else {
        if (settings.redirectEnabled && settings.redirectUrls && settings.redirectUrls.length > 0) {
            const currentNormalized = normalizeUrl(window.location.href);
            const match = settings.redirectUrls.some(url => normalizeUrl(url) === currentNormalized);
            if (match) {
                window.location.href = settings.targetUrl;
                console.log("The url has been redirected");
            }
        }
    }
}
// Execute logic when the DOM is fully loaded
if (document.readyState === 'loading') {
    // Avoid memory leaks
    document.removeEventListener('DOMContentLoaded', autoLoginOnPageLoad);
    // Try login
    document.addEventListener('DOMContentLoaded', autoLoginOnPageLoad);
}
else {
    autoLoginOnPageLoad();
}
