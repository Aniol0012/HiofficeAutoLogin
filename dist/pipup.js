"use strict";
document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const companyInput = document.getElementById('company');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const saveButton = document.getElementById('saveButton');
    const clearButton = document.getElementById('clearButton');
    const messageDiv = document.getElementById('message');
    // Carregar credencials guardades
    chrome.storage.sync.get(['credentials'], (result) => {
        if (result.credentials) {
            const credentials = result.credentials;
            emailInput.value = credentials.email || '';
            passwordInput.value = credentials.password || '';
            companyInput.value = credentials.company || '';
            rememberMeCheckbox.checked = credentials.rememberMe || false;
        }
    });
    saveButton.addEventListener('click', () => {
        const credentials = {
            email: emailInput.value,
            password: passwordInput.value,
            company: companyInput.value,
            rememberMe: rememberMeCheckbox.checked
        };
        chrome.storage.sync.set({ credentials: credentials }, () => {
            messageDiv.textContent = 'Credencials guardades!';
            setTimeout(() => {
                messageDiv.textContent = '';
            }, 3000);
            // Enviar missatge al content script per fer auto-login
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0] && tabs[0].id) {
                    chrome.tabs.sendMessage(tabs[0].id, { type: 'AUTO_LOGIN', credentials: credentials });
                }
            });
        });
    });
    clearButton.addEventListener('click', () => {
        chrome.storage.sync.remove('credentials', () => {
            emailInput.value = '';
            passwordInput.value = '';
            companyInput.value = '';
            rememberMeCheckbox.checked = false;
            messageDiv.textContent = 'Credencials netejades!';
            setTimeout(() => {
                messageDiv.textContent = '';
            }, 3000);
        });
    });
});
