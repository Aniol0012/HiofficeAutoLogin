"use strict";
const DEFAULT_MAX_LOGIN_ATTEMPTS = 3; // Default value, will be overridden by settings
const SECONDS_DELAY_BETWEEN_ATTEMPTS = 3;
let maxLoginAttempts = DEFAULT_MAX_LOGIN_ATTEMPTS;
let loginAttempts = 0;
let lastKnownUrl = window.location.href; // Stores the URL to detect changes
// Function to fill form fields and attempt login
function fillLoginForm(credentials, attempt = 1) {
    console.log(`Attempting to fill form and log in (Attempt ${attempt}/${maxLoginAttempts}):`, credentials);
    const interval = setInterval(() => {
        const emailInput = document.getElementById('eUsuario');
        const passwordInput = document.getElementById('ePassword');
        const companyInput = document.querySelector('input[placeholder="Empresa"]');
        const rememberMeToggle = document.querySelector('input[type="checkbox"][role="switch"]');
        const loginButton = Array.from(document.querySelectorAll('input[type="submit"]'))
            .find(input => input instanceof HTMLInputElement && input.value.trim().toLowerCase() === 'login');
        if (!emailInput || !passwordInput || !loginButton) {
            console.log('Waiting for login elements to load...');
            return;
        }
        clearInterval(interval);
        if (credentials.email) {
            emailInput.value = credentials.email;
            emailInput.dispatchEvent(new Event('input', { bubbles: true }));
            emailInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (credentials.password) {
            passwordInput.value = credentials.password;
            passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
            passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (credentials.company && companyInput) {
            companyInput.value = credentials.company;
            companyInput.dispatchEvent(new Event('input', { bubbles: true }));
            companyInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (rememberMeToggle && credentials.rememberMe !== undefined) {
            if (rememberMeToggle.checked !== credentials.rememberMe) {
                rememberMeToggle.click();
                rememberMeToggle.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
        const mainFieldsFilled = emailInput.value === credentials.email && passwordInput.value === credentials.password;
        if (loginButton && mainFieldsFilled) {
            loginButton.click();
            setTimeout(() => {
                if (window.location.href === lastKnownUrl && attempt < maxLoginAttempts) {
                    console.warn(`URL has not changed after attempt ${attempt}`);
                    setTimeout(() => fillLoginForm(credentials, attempt + 1), SECONDS_DELAY_BETWEEN_ATTEMPTS * 1000);
                }
                else {
                    if (window.location.href !== lastKnownUrl) {
                        console.log('Login successful! URL has changed.');
                    }
                    else {
                        console.error(`Login failed after ${maxLoginAttempts} attempts. URL did not change`);
                    }
                    loginAttempts = 0;
                }
            }, 1500);
        }
        else {
            console.log('Could not click login button (button not found or fields not filled).');
            console.log('Button status:', loginButton);
            console.log('Main fields filled:', mainFieldsFilled);
        }
    }, 300);
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
            const match = settings.redirectUrls.some((url) => normalizeUrl(url) === currentNormalized);
            if (match) {
                window.location.href = settings.targetUrl;
                console.log("The url has been redirected");
            }
        }
    }
    const step2AcceptSecondsDelay = 1;
    if (settings.targetUrl2) {
        const currentUrl = normalizeUrl(window.location.href);
        const targetUrl2Normalized = normalizeUrl(settings.targetUrl2);
        if (currentUrl === targetUrl2Normalized) {
            const interval = setInterval(() => {
                const userInput = document.querySelector('input[type="text"].field-card-input-fake-auth')
                    || document.querySelector('input[type="text"]');
                const passInput = document.querySelector('input[type="password"].field-card-input-fake-auth')
                    || document.querySelector('input[type="password"]');
                if (!userInput || !passInput) {
                    console.log('Waiting for step 2 input fields...');
                    return;
                }
                // Fill username
                if (settings.step2Username && userInput.value !== settings.step2Username) {
                    userInput.value = settings.step2Username;
                    userInput.dispatchEvent(new Event('input', { bubbles: true }));
                    userInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
                // Fill password
                if (settings.step2Password && passInput.value !== settings.step2Password) {
                    passInput.value = settings.step2Password;
                    passInput.dispatchEvent(new Event('input', { bubbles: true }));
                    passInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
                // Find the Accept button
                const acceptButton = Array.from(document.querySelectorAll('button'))
                    .find((btn) => btn.classList.contains('GreenButton') &&
                    btn.textContent?.trim().toLowerCase() === 'aceptar');
                const fieldsFilled = userInput.value === settings.step2Username && passInput.value === settings.step2Password;
                if (fieldsFilled && acceptButton) {
                    console.log('Step 2 ready. Clicking accept...');
                    setTimeout(() => {
                        acceptButton.click();
                    }, step2AcceptSecondsDelay * 1000);
                    clearInterval(interval);
                }
            }, 300);
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
