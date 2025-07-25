interface LoginCredentials {
    email: string;
    password?: string;
    company?: string;
    rememberMe?: boolean;
}

interface ExtensionSettings {
    enabled: boolean;
    targetUrl: string;
    credentials: LoginCredentials;
    maxRetries?: number;
    redirectEnabled?: boolean;
    redirectUrls?: string[];
    step2Username?: string;
    step2Password?: string;
}

const MESSAGE_DURATION: number = 3; // Message duration in seconds

document.addEventListener('DOMContentLoaded', () => {
    const extensionEnabledCheckbox = document.getElementById('extensionEnabled') as HTMLInputElement;
    const targetUrlInput = document.getElementById('targetUrl') as HTMLInputElement;
    const targetUrlInput2 = document.getElementById('targetUrl2') as HTMLInputElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const companyInput = document.getElementById('company') as HTMLInputElement;
    const rememberMeCheckbox = document.getElementById('rememberMe') as HTMLInputElement;
    const maxRetriesInput = document.getElementById('maxRetries') as HTMLInputElement;
    const redirectUrlsContainer = document.getElementById('redirectUrlsContainer') as HTMLElement;
    const redirectEnabledCheckbox = document.getElementById('redirectEnabled') as HTMLInputElement;
    const saveButton = document.getElementById('saveButton') as HTMLButtonElement;
    const clearButton = document.getElementById('clearButton') as HTMLButtonElement;
    const messageDiv = document.getElementById('message') as HTMLDivElement;
    const step2UsernameInput = document.getElementById('step2Username') as HTMLInputElement;
    const step2PasswordInput = document.getElementById('step2Password') as HTMLInputElement;

    // Function to display messages
    function showMessage(text: string, isError: boolean = false): void {
        messageDiv.textContent = text;
        messageDiv.style.backgroundColor = isError ? '#f8d7da' : '#e9f7ef';
        messageDiv.style.color = isError ? '#721c24' : '#28a745';
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, MESSAGE_DURATION * 1000);
    }

    // Load saved settings and credentials
    chrome.storage.sync.get(['extensionSettings'], (result): void => {
        const settings: ExtensionSettings = result.extensionSettings || {
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

    saveButton.addEventListener('click', (): void => {
        const credentials: LoginCredentials = {
            email: emailInput.value.trim(),
            password: passwordInput.value,
            company: companyInput.value.trim(),
            rememberMe: rememberMeCheckbox.checked
        };

        const redirectUrlInputs = document.querySelectorAll('.redirectUrlInput') as NodeListOf<HTMLInputElement>;
        const redirectUrls = Array.from(redirectUrlInputs).map(input => input.value.trim()).filter(Boolean);

        const step2UsernameInput = document.getElementById('step2Username') as HTMLInputElement;
        const step2PasswordInput = document.getElementById('step2Password') as HTMLInputElement;

        const settings: ExtensionSettings = {
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
        let validationMessage: string = '';
        let isValidationError: boolean = false;

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
        chrome.storage.sync.set({extensionSettings: settings}, (): void => {
            if (validationMessage) {
                showMessage(`S'ha guardat la configuració, però: ${validationMessage}`, isValidationError);
            } else {
                showMessage('S\'ha guardat la configuració');
            }
        });
    });

    clearButton.addEventListener('click', (): void => {
        chrome.storage.sync.get(['extensionSettings'], (result): void => {
            const settings: ExtensionSettings = result.extensionSettings || {
                enabled: false,
                targetUrl: '',
                targetUrl2: '',
                credentials: {},
                maxRetries: 3
            };
            settings.credentials = {email: '', password: '', company: '', rememberMe: false};

            // Only clear credentials, not the maxRetries setting
            chrome.storage.sync.set({extensionSettings: settings}, (): void => {
                emailInput.value = '';
                passwordInput.value = '';
                companyInput.value = '';
                rememberMeCheckbox.checked = false;
                showMessage('Credencials netejades!');
            });
        });
    });
});
