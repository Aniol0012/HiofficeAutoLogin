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
}

const MESSAGE_DURATION: number = 3; // Message duration in seconds

document.addEventListener('DOMContentLoaded', () => {
    const extensionEnabledCheckbox = document.getElementById('extensionEnabled') as HTMLInputElement;
    const targetUrlInput = document.getElementById('targetUrl') as HTMLInputElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const companyInput = document.getElementById('company') as HTMLInputElement;
    const rememberMeCheckbox = document.getElementById('rememberMe') as HTMLInputElement;
    const maxRetriesInput = document.getElementById('maxRetries') as HTMLInputElement;
    // Ensure these IDs match the HTML
    const saveButton = document.getElementById('saveButton') as HTMLButtonElement; // Correct ID
    const clearButton = document.getElementById('clearButton') as HTMLButtonElement; // Correct ID
    const messageDiv = document.getElementById('message') as HTMLDivElement;

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
    // Use chrome.storage.StorageItems which is the return type for .get
    chrome.storage.sync.get(['extensionSettings'], (result) => {
        const settings: ExtensionSettings = result.extensionSettings || {
            enabled: false,
            targetUrl: '',
            credentials: {},
            maxRetries: 3 // Default value for maxRetries
        };

        extensionEnabledCheckbox.checked = settings.enabled;
        targetUrlInput.value = settings.targetUrl || '';
        emailInput.value = settings.credentials.email || '';
        passwordInput.value = settings.credentials.password || '';
        companyInput.value = settings.credentials.company || '';
        rememberMeCheckbox.checked = settings.credentials.rememberMe || false;
        maxRetriesInput.value = (settings.maxRetries || 3).toString();
    });

    saveButton.addEventListener('click', (): void => {
        const credentials: LoginCredentials = {
            email: emailInput.value.trim(),
            password: passwordInput.value,
            company: companyInput.value.trim(),
            rememberMe: rememberMeCheckbox.checked
        };

        const settings: ExtensionSettings = {
            enabled: extensionEnabledCheckbox.checked,
            targetUrl: targetUrlInput.value.trim(),
            credentials: credentials,
            maxRetries: parseInt(maxRetriesInput.value, 10) || 3
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
