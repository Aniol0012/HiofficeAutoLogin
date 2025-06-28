# Hioffice Auto Login Extension

![Typescript](https://img.shields.io/badge/TypeScript-3178C6?style=plastic&for-the-badge&logo=typescript&logoColor=white)
![GitHub last commit](https://img.shields.io/github/last-commit/Aniol0012/HiofficeAutoLogin?style=plastic&color=lightgreen)

This project is a browser extension designed to automate the login process for Hioffice web applications.
It autofills the login form fields (email, password, company, and remember me checkbox) and attempts to click the login
button, making the login experience faster and more convenient for the user.

![popup-preview](https://github.com/user-attachments/assets/95337105-1117-4aa8-a129-ad03f7ddefe7)

## Author

**Aniol0012** (Aniol Serrano)
> [!IMPORTANT]
> GitHub: [Aniol0012 (Aniol Serrano)](https://github.com/Aniol0012)

## User installation

To use this extension, head up into [releases page](https://github.com/Aniol0012/HiofficeAutoLogin/releases) and use
the latest version or download the project by cloning it.
Then, follow these simple steps:

1. **Go to extensions page on your navigator**:
    - For **Edge** go to: [`edge://extensions`](edge://extensions)
    - For **Chrome** go to: [`chrome://extensions`](chrome://extensions)

1. **Enable Developer Mode:** Toggle on "Developer mode" (usually in the top-right corner).

1. **Load Unpacked Extension:** Click on "Load unpacked" (or "Load temporary add-on" in some browsers).

1. **Select the Project Directory:** Navigate to your project folder and select the root directory (where
   `manifest.json` is located).

1. **The extension should now appear** in your list of installed extensions.

> [!TIP]
> Pin the extension, so it's easier to configure it.

Finally, open the configuration menu on the extension and fill all the fields. 
The extension will automatically attempt to fill the form and log you in.

## How to contribute

#### Prerequisites

Before installing, ensure you have all these prerequisites installed
* Node.js (LTS version recommended)
* npm (comes with Node.js) or yarn

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
> You should run this command every time you make changes to your TypeScript files.

> [!IMPORTANT]
> Each time you modify the source code, the entire extension must be reloaded.
> So reload it via navigator extensions.

4. **Add the extension into your navigator**, as explained on [User installation](#user-installation).
