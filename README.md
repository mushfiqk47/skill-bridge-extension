# Skill Bridge

Skill Bridge is a Chrome/Edge/Firefox browser extension designed to bridge local folders of **Agent Skills** (the open `SKILL.md`-based standard published by Anthropic) with local developer assistants (Claude Code, Codex CLI, Gemini CLI, Cursor) and web-based chat UIs.

It separates its operations into two distinct tiers:
- **Tier 1: Local Sync (Core, deterministic file sync).** Syncs selected skills into the actual, on-disk directories that your CLI tools read from.
- **Tier 2: Chat Injection (Best-effort context pasting).** Injects skill instructions directly into web chat editors on Claude, ChatGPT, and Gemini.

---

## Workspace Layout

```
├── manifest.json              # Extension Manifest
├── vite.config.ts             # Bundler configs for Popup/Options UI
├── build.js                   # Programmatic builder script
├── generate_icons.js          # Generates PNG extension icons using sharp
├── src/
│   ├── background/            # MV3 background worker
│   ├── content/               # Web chat injector & floating widgets
│   ├── popup/                 # Main user popup window
│   ├── options/               # Diagnostics and Settings page
│   ├── components/            # Shared UI and Cmd+K command switcher
│   └── lib/                   # Scanner, YAML parsers, IndexedDB hooks
└── native-host/               # Standalone Node.js native helper
```

---

## Getting Started

### 1. Build the Extension
Ensure you have Node.js installed, then install dependencies, generate the icons, and compile the assets:
```bash
# Install dependencies
npm install

# Generate PNG icons from logo.svg
node generate_icons.js

# Build extension
npm run build
```
This outputs all compiled assets to the `/dist` directory.

### 2. Load the Unpacked Extension in Chrome
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (toggle switch in the top-right corner).
3. Click **Load unpacked** and select the `/dist` folder inside this project.
4. Copy the generated **Extension ID** (e.g. `abcd1234efgh5678...`) from the extension card. You will need it to install the native sync companion.

### 3. Install the Native Messaging Companion
The native messaging companion is a small Node.js script that bridges browser sandboxed requests to local CLI plugin directories on disk.

To install it:
1. Open your terminal in the `/native-host` directory.
2. Run the platform installer:
   - **Windows:** Run `powershell -ExecutionPolicy Bypass ./install.ps1`
   - **macOS / Linux:** Run `chmod +x install.sh && ./install.sh`
3. Paste your copied **Extension ID** when prompted.

---

## Testing

Run unit tests for the regex-based `SKILL.md` parser and validator:
```bash
npm run test
```

---

## Security & Permissions Model

- **IndexedDB Handle Storage:** Skill folders are loaded using the modern File System Access API (`showDirectoryPicker()`). The browser secures these directory handles via structured cloning inside IndexedDB so access permission is preserved without full path exposure.
- **Stateless Native Messaging:** The companion runs locally without running arbitrary shell scripts. It listens on stdio for simple JSON commands and only writes files into pre-authorized CLI directories.
- **Incremental Permissions:** Site permissions for chat page inputs (Tier 2) are fully optional. They are requested dynamically only when you toggle a site's injection adapter inside the Settings page.
