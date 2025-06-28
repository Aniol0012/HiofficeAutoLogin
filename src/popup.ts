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
}

document.addEventListener('DOMContentLoaded', () => {
    const extensionEnabledCheckbox = document.getElementById('extensionEnabled') as HTMLInputElement;
    const targetUrlInput = document.getElementById('targetUrl') as HTMLInputElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const companyInput = document.getElementById('company') as HTMLInputElement;
    const rememberMeCheckbox = document.getElementById('rememberMe') as HTMLInputElement;
    const saveButton = document.getElementById('saveButton') as HTMLButtonElement;
    const clearButton = document.getElementById('clearButton') as HTMLButtonElement;
    const messageDiv = document.getElementById('message') as HTMLDivElement;

    // Function to display messages
    function showMessage(text: string, isError: boolean = false) {
        messageDiv.textContent = text;
        messageDiv.style.backgroundColor = isError ? '#f8d7da' : '#e9f7ef';
        messageDiv.style.color = isError ? '#721c24' : '#28a745';
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }

    // Load saved settings and credentials
    chrome.storage.sync.get(['extensionSettings'], (result) => {
        const settings: ExtensionSettings = result.extensionSettings || {
            enabled: false,
            targetUrl: '',
            credentials: {}
        };

        extensionEnabledCheckbox.checked = settings.enabled;
        targetUrlInput.value = settings.targetUrl || '';
        emailInput.value = settings.credentials.email || '';
        passwordInput.value = settings.credentials.password || '';
        companyInput.value = settings.credentials.company || '';
        rememberMeCheckbox.checked = settings.credentials.rememberMe || false;
    });

    saveButton.addEventListener('click', () => {
        const credentials: LoginCredentials = {
            email: emailInput.value.trim(),
            password: passwordInput.value,
            company: companyInput.value.trim(),
            rememberMe: rememberMeCheckbox.checked
        };

        const settings: ExtensionSettings = {
            enabled: extensionEnabledCheckbox.checked,
            targetUrl: targetUrlInput.value.trim(),
            credentials: credentials
        };

        // Validate fields. Show a message, but don't prevent saving the configuration.
        if (!settings.targetUrl && settings.enabled) {
            showMessage('If the extension is enabled, the Target URL is mandatory for auto-execution on page load.', true);
        }
        if (!settings.credentials.email && settings.enabled) {
            showMessage('If the extension is enabled, the Email is mandatory for auto-execution on page load.', true);
        }

        // Save settings to storage
        chrome.storage.sync.set({extensionSettings: settings}, () => {
            showMessage('Configuration and credentials saved!');
            // NO AUTO_LOGIN message sent from here anymore.
            // The auto-login will now only trigger on page load based on URL matching.
        });
    });

    clearButton.addEventListener('click', () => {
        chrome.storage.sync.get(['extensionSettings'], (result) => {
            const settings: ExtensionSettings = result.extensionSettings || {
                enabled: false,
                targetUrl: '',
                credentials: {}
            };
            settings.credentials = {email: '', password: '', company: '', rememberMe: false};

            chrome.storage.sync.set({extensionSettings: settings}, () => {
                emailInput.value = '';
                passwordInput.value = '';
                companyInput.value = '';
                rememberMeCheckbox.checked = false;
                showMessage('Credentials cleared!');
            });
        });
    });
});