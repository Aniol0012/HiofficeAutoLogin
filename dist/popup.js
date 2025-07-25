"use strict";
const MESSAGE_DURATION = 3; // Message duration in seconds
document.addEventListener('DOMContentLoaded', () => {
    const extensionEnabledCheckbox = document.getElementById('extensionEnabled');
    const targetUrlInput = document.getElementById('targetUrl');
    const targetUrlInput2 = document.getElementById('targetUrl2');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const companyInput = document.getElementById('company');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const maxRetriesInput = document.getElementById('maxRetries');
    const redirectUrlsContainer = document.getElementById('redirectUrlsContainer');
    const redirectEnabledCheckbox = document.getElementById('redirectEnabled');
    const saveButton = document.getElementById('saveButton');
    const clearButton = document.getElementById('clearButton');
    const messageDiv = document.getElementById('message');
    const step2UsernameInput = document.getElementById('step2Username');
    const step2PasswordInput = document.getElementById('step2Password');
    // Function to display messages
    function showMessage(text, isError = false) {
        messageDiv.textContent = text;
        messageDiv.style.backgroundColor = isError ? '#f8d7da' : '#e9f7ef';
        messageDiv.style.color = isError ? '#721c24' : '#28a745';
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, MESSAGE_DURATION * 1000);
    }
    // Load saved settings and credentials
    chrome.storage.sync.get(['extensionSettings'], (result) => {
        const settings = result.extensionSettings || {
            enabled: false,
            targetUrl: '',
            targetUrl2: '',
            credentials: {},
            maxRetries: 3,
            redirectUrls: [],
        };
        extensionEnabledCheckbox.checked = settings.enabled;
        targetUrlInput.value = settings.targetUrl || '';
        targetUrlInput2.value = settings.targetUrl2 || '';
        emailInput.value = settings.credentials.email || '';
        passwordInput.value = settings.credentials.password || '';
        companyInput.value = settings.credentials.company || '';
        rememberMeCheckbox.checked = settings.credentials.rememberMe || false;
        maxRetriesInput.value = (settings.maxRetries || 3).toString();
        redirectEnabledCheckbox.checked = settings.redirectEnabled || false;
        step2UsernameInput.value = settings.step2Username || '';
        step2PasswordInput.value = settings.step2Password || '';
        if (settings.redirectUrls && settings.redirectUrls.length > 0 && redirectUrlsContainer) {
            redirectUrlsContainer.innerHTML = '';
            settings.redirectUrls.forEach(url => {
                const row = document.createElement('div');
                row.className = 'redirect-url-row';
                row.innerHTML = `<input type="text" class="redirectUrlInput" value="${url}" placeholder="https://localhost:8000/">`;
                redirectUrlsContainer.appendChild(row);
            });
        }
    });
    // Event listener to ensure a value is always present for maxRetriesInput
    maxRetriesInput.addEventListener('blur', () => {
        // If the input is empty or invalid after losing focus, set it to the minimum allowed value (1)
        if (!maxRetriesInput.value || parseInt(maxRetriesInput.value, 10) < 1 || isNaN(parseInt(maxRetriesInput.value, 10))) {
            maxRetriesInput.value = '1'; // Ensure minimum of 1 retry
            showMessage('El número màxim de reintents no pot ser inferior a 1.', true);
        }
    });
    saveButton.addEventListener('click', () => {
        const credentials = {
            email: emailInput.value.trim(),
            password: passwordInput.value,
            company: companyInput.value.trim(),
            rememberMe: rememberMeCheckbox.checked
        };
        const redirectUrlInputs = document.querySelectorAll('.redirectUrlInput');
        const redirectUrls = Array.from(redirectUrlInputs).map(input => input.value.trim()).filter(Boolean);
        const step2UsernameInput = document.getElementById('step2Username');
        const step2PasswordInput = document.getElementById('step2Password');
        const settings = {
            enabled: extensionEnabledCheckbox.checked,
            targetUrl: targetUrlInput.value.trim(),
            targetUrl2: targetUrlInput2.value.trim(),
            credentials: credentials,
            maxRetries: parseInt(maxRetriesInput.value, 10) || 3,
            redirectEnabled: redirectEnabledCheckbox.checked,
            redirectUrls: redirectUrls,
            step2Username: step2UsernameInput.value.trim(),
            step2Password: step2PasswordInput.value.trim()
        };
        // Validate fields for a better user experience, but allow saving empty fields
        // if extension is not enabled, or if user wants to save partially.
        // The content script will handle the actual validation for auto-login.
        let validationMessage = '';
        let isValidationError = false;
        if (settings.enabled) {
            if (!settings.targetUrl) {
                validationMessage += 'Si l\'extensió està activada, l\'URL de la pàgina de login és obligatòria. ';
                isValidationError = true;
            }
            if (!settings.credentials.email) {
                validationMessage += 'Si l\'extensió està activada, l\'Email és obligatori. ';
                isValidationError = true;
            }
        }
        // Save settings to storage
        chrome.storage.sync.set({ extensionSettings: settings }, () => {
            if (validationMessage) {
                showMessage(`S'ha guardat la configuració, però: ${validationMessage}`, isValidationError);
            }
            else {
                showMessage('S\'ha guardat la configuració');
            }
        });
    });
    clearButton.addEventListener('click', () => {
        chrome.storage.sync.get(['extensionSettings'], (result) => {
            const settings = result.extensionSettings || {
                enabled: false,
                targetUrl: '',
                targetUrl2: '',
                credentials: {},
                maxRetries: 3
            };
            settings.credentials = { email: '', password: '', company: '', rememberMe: false };
            // Only clear credentials, not the maxRetries setting
            chrome.storage.sync.set({ extensionSettings: settings }, () => {
                emailInput.value = '';
                passwordInput.value = '';
                companyInput.value = '';
                rememberMeCheckbox.checked = false;
                showMessage('Credencials netejades!');
            });
        });
    });
});
