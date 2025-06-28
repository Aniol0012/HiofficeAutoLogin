# Hioffice Auto Login Extension

![GitHub last commit](https://img.shields.io/github/last-commit/Aniol0012/HiofficeAutoLogin?style=plastic&color=lightgreen)

This project is a browser extension designed to automate the login process for Hioffice web applications.
It autofills the login form fields (email, password, company, and remember me checkbox) and attempts to click the login
button, making the login experience faster and more convenient for the user.

![popup-preview](https://github.com/user-attachments/assets/6b4eeee6-e2fe-4f02-9864-de3fcacef037)


## Author

**Aniol0012** (Aniol Serrano)
> [!IMPORTANT]
> GitHub: [Aniol0012 (Aniol Serrano)](https://github.com/Aniol0012)

## Installation and Compilation

This extension is developed using TypeScript, so you'll need Node.js and npm (or yarn) installed to compile the
TypeScript files into JavaScript.

### Prerequisites

* Node.js (LTS version recommended)
* npm (comes with Node.js) or yarn

### Steps to Get Started

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/Aniol0012/HiofficeAutoLogin.git
   cd HiofficeAutoLogin
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```
   Or if you use yarn
   ```
   yarn install
   ```

3. **Compile TypeScript:**
   This command compiles your TypeScript source files (`.ts`) into JavaScript files (`.js`) in the `dist/` directory.

   ```bash
   npx tsc
   ```

> [!NOTE] 
> You should run this command every time you make changes to your TypeScript files.*

4. **Load the Extension in Your Browser (Edge/Chrome):**

    1. **Open Extension Management:**

        * For **Microsoft Edge**: Go to [`edge://extensions`](edge://extensions)
        * For **Google Chrome**: Go to [`chrome://extensions`](chrome://extensions)

    1. **Enable Developer Mode:** Toggle on "Developer mode" (usually in the top-right corner).

    1. **Load Unpacked Extension:** Click on "Load unpacked" (or "Load temporary add-on" in some browsers).

    1. **Select the Project Directory:** Navigate to your project folder and select the root directory (where
       `manifest.json` is located).

    1. **The extension should now appear** in your list of installed extensions.

## Usage

Once configured and enabled, simply navigate to the specified Hioffice login URL.
The extension will automatically attempt to fill the form and log you in.
Check the browser's developer console (F12, then "Console" tab) on the login page for debugging messages from the
content script.
