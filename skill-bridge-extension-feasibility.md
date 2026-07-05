# Feasibility of a Local-Skill-File Bridge Browser Extension

## Executive summary

Most of what you're describing is buildable today, but it splits into two very different engineering problems that get conflated in the pitch:

1. **Local folder access + skill management UI** — solved. The File System Access API and/or a small native-messaging companion app handle this cleanly.
2. **"Import into any chatbot or IDE-like environment"** — this is really *three* separate integration problems wearing one name, because "chatbot" covers (a) web-based chat UIs like claude.ai/chatgpt.com/gemini.google.com, (b) desktop/CLI agentic tools like Claude Code, Codex CLI, and Cursor, and (c) API-level integrations. A browser extension can only reach (a) directly. For (b) you need a companion mechanism outside the browser sandbox entirely. This distinction determines almost everything else about feasibility, security, and architecture.

The good news: the "skill file" format itself is no longer something you'd have to invent. Anthropic published **Agent Skills** — a folder containing a `SKILL.md` file with YAML frontmatter (`name`, `description`) plus optional `scripts/`, `references/`, and `assets/` directories — as an open, cross-platform standard in December 2025. It's already recognized by Claude Code, Codex CLI, Gemini CLI, and (with manual placement) Cursor, among community tools like Cline and Windsurf. That gives you a real target format to standardize around rather than designing your own.

---

## 1. Can browser extension APIs access local folders like this?

**Yes, with real constraints — and the constraints differ sharply between "web chatbot" and "local agent tool."**

### The File System Access API
This is the modern, standards-track way for a webpage or extension UI to read/write local files:
- `window.showDirectoryPicker()` lets the user pick a folder; you get a `FileSystemDirectoryHandle` you can enumerate recursively to list every `SKILL.md`-containing subfolder.
- It's user-initiated per origin — the user explicitly grants access to *that specific folder* by clicking a native OS picker. There's no way to silently enumerate arbitrary parts of the filesystem.
- Permission can be persisted (stored as a handle in IndexedDB) so the user doesn't need to re-pick every session, but the browser may still ask them to reconfirm periodically or after long idle periods, especially for write access.
- This API works in an extension's own UI surfaces (popup, options page, or a full extension "app" page) in Chromium-based browsers and, increasingly, Firefox. It does **not** work from a content script injected into someone else's page (e.g., you can't call it from code running on `claude.ai`) — the picker has to be triggered from your extension's own page context.

### Chrome's legacy extension-specific filesystem APIs
- `chrome.fileSystem` (requestFileSystem, retainEntry/restoreEntry) exists but is scoped to **kiosk/ChromeOS platform apps**, not general Manifest V3 extensions — not useful for a mainstream consumer extension.
- `chrome.fileSystemProvider` lets an extension *mount* a virtual filesystem visible to ChromeOS's Files app. It's powerful but ChromeOS-specific and overkill for this use case.

### Manifest V3 restrictions that matter here
- MV3 forbids remote code execution and dynamic `eval`-style script loading — good for your users' safety, but it also means you can't casually "download and run" arbitrary skill scripts inside the extension itself.
- `host_permissions` gate which sites your content scripts can run on and which origins you can `fetch()` — you'll need explicit host permissions (ideally `optional_host_permissions`, requested at runtime) for each chatbot site you support, and Chrome/Firefox will show users a permission prompt naming those sites.
- Regular `file://` URL access (as opposed to the File System Access API) requires the user to flip on "Allow access to file URLs" for your extension manually in `chrome://extensions` — this is a deliberate friction point browsers added to limit filesystem-scraping extensions.

**Bottom line for point 1:** reading a user-chosen folder and listing skill files from an extension's own UI is fully supported. Reaching into that folder *from within a loaded chatbot webpage* is not directly possible — the extension has to broker the data itself (read the files in its own context, then hand the content to a content script that talks to the page).

---

## 2. Technologies, permissions, and workarounds needed

### Core stack
| Capability | Technology |
|---|---|
| Pick and persist a skill folder | File System Access API (`showDirectoryPicker`, stored `FileSystemDirectoryHandle` in IndexedDB) |
| Scan for skills | Recursive directory walk (`handle.values()`), matching folders containing `SKILL.md`, parsing YAML frontmatter with a small JS YAML parser |
| Settings UI | Extension options page (HTML/CSS/JS or a small React bundle) |
| Detect and interact with a chat UI | Content script + `MutationObserver` to find the input box/contenteditable, `chrome.scripting` for programmatic injection |
| Cross-context messaging | `chrome.runtime.sendMessage` / `chrome.tabs.sendMessage` between popup, background service worker, and content scripts |
| Local storage of metadata (skill index, last-synced state) | `chrome.storage.local` (not `localStorage` inside content scripts touching page origins) |
| Reaching non-browser tools (Claude Code, Codex CLI, Cursor) | **Native messaging** (a small companion executable/daemon your extension talks to via `chrome.runtime.connectNative`), or simply writing files directly into the tool's known skills directory if the browser process has that access |

### Permissions you'd declare
- `"permissions": ["storage", "scripting"]`
- `"optional_host_permissions": ["https://claude.ai/*", "https://chatgpt.com/*", "https://gemini.google.com/*", ...]` requested incrementally so users see exactly which sites you're asking to touch, rather than a blanket `<all_urls>` (which triggers scarier install warnings and is exactly the kind of over-broad permission request that gets flagged in store review and by security-conscious users).
- `"nativeMessaging"` if you build a companion app for CLI/IDE integration.
- No `file://` bulk access needed if you rely on File System Access API instead of raw `file://` reads — this is both cleaner and less alarming to users.

### The necessary workaround for anything outside the browser
Chrome/Firefox extensions are sandboxed away from the general filesystem and from other applications' internals by design. To reach **Claude Code, Codex CLI, or Cursor**, which are not webpages, you have two realistic options:
1. **Native messaging host**: ship a small local process (Node/Python/Go binary) that the browser launches and communicates with over stdio using a JSON-based protocol. This process *can* have full filesystem access (subject to OS permissions) and can write skill folders into `~/.claude/skills/`, `~/.codex/skills/`, `.cursor/rules` (or wherever the target tool expects them), or invoke that tool's CLI.
2. **Direct filesystem write via the File System Access API**, if you have the user grant access to the *specific* target directory (e.g., ask them to also pick their `~/.claude/skills` folder). This avoids native messaging entirely for "copy this skill folder from A to B" but doesn't let you *invoke* a CLI tool or watch for changes system-wide — it's copy-only, not integration.

For most of the desktop/CLI tools in your list, there is no in-browser "install this skill" hook to call — the extension's job there is really just **file management**: making sure the right SKILL.md-containing folder exists in the right place on disk. The CLI tool itself already knows how to discover and load skills from that location once they're there (that's exactly the point of the open standard).

---

## 3. How would the extension interface with different chatbot environments? Are there existing protocols?

This splits cleanly into two categories, and it's the most important distinction in your whole design.

### A. Web-based chat UIs (claude.ai, chatgpt.com, gemini.google.com, etc.)
There is **no formal API or protocol** for a third-party extension to "install a skill" into these consumer web UIs. They're just React/Vue single-page apps with a text input. The only integration surface available to an extension is:
- DOM injection: find the chat input (`textarea`, `contenteditable`, or a custom editor component) and programmatically set its value/text, then dispatch synthetic input events so the site's JS framework picks up the change and enables the send button.
- This is exactly what existing "prompt library" extensions already do (see section 4) — they don't "import a skill," they paste the skill's *content* into the prompt as context, or paste a system-prompt-style instruction block ahead of the user's message.
- **This is inherently a paste/inject mechanism, not a true "load the skill into the model's tool system."** You cannot make claude.ai's web UI treat your imported file the way Claude Code treats a real Skill folder — the model-level progressive disclosure, on-demand file loading, and script execution that make Agent Skills powerful are the product of that specific application's backend/tool-use architecture, not something a browser extension can replicate from the outside on a site you don't control.
- Reliability is a real, documented pain point: these sites are React apps with dynamically generated class names and frequently changing DOM structure, and some (ChatGPT's in particular) have been reported as actively hostile to reliable injection, requiring frequent selector maintenance.
- Where a platform *does* expose real "custom instructions," "projects/knowledge," or a documented file-upload/attachment flow (e.g., claude.ai's Skills settings, custom GPT knowledge files, Gemini's Gems), you could automate the browser UI to click through that flow and upload the file — this is UI automation, not an API, and it's fragile to redesigns, but it does at least land the content somewhere the platform is designed to treat as reference material.

### B. Local/CLI/IDE agent tools (Claude Code, Codex CLI, Cursor, Gemini CLI)
Here, a real, growing standard exists: **Agent Skills / SKILL.md**. Each tool defines a conventional directory:
- Claude Code: `~/.claude/skills/<name>/SKILL.md` (personal) or `.claude/skills/` (project-scoped)
- Codex CLI: its own skills directory, with an optional `openai.yaml` for tool-specific metadata
- Gemini CLI: supports the same core SKILL.md format
- Cursor: doesn't have native skill *discovery* — you place the skill and invoke it manually

Because these tools watch or read from known folders on disk, **your extension's real job here is just: verify the target directory exists, copy/symlink the chosen skill folder into it, and (optionally) shell out to a "reload" command** if the tool supports one (e.g., Claude Code's `/reload-plugins`). This is filesystem plumbing, not protocol integration, and it's the part of your idea that's most solid and most standard.

### C. Model Context Protocol (MCP) — worth distinguishing from Skills
MCP is Anthropic's separate open protocol for connecting an agent to *tools and data sources* (e.g., a database, a ticketing system) over a defined client-server interface. Skills and MCP are complementary but not the same thing: MCP gives an agent capabilities/tools; Skills give it procedural knowledge about *how* to use them. If part of your goal is "let the chatbot call out to my local files as a live tool" rather than "paste this text as instructions," MCP (with a local MCP server your extension manages) is the more correct protocol to look at — but that's a different, heavier architecture than a browser extension, and it doesn't help with web-based chat UIs that don't support MCP client connections from arbitrary browser extensions.

---

## 4. Existing projects and prior art

Nothing does exactly what you're describing end-to-end, but the pieces exist separately:

- **Universal Prompt Library** (open-source Chrome extension) — detects chat inputs across ChatGPT, Claude, Gemini, Perplexity, HuggingChat, and generic text areas, and injects saved prompt content into them with a "native setter hack" for React-controlled inputs. This is the closest existing analog to your "inject into any chatbot" requirement, minus the local-folder-of-skill-files sourcing.
- **Gemini Folders / AI Folders / gemini-voyager** — Chrome/Firefox extensions that build prompt libraries, folder organization, and one-click injection specifically for Gemini (and, in the "AI Folders" variant, across multiple platforms including Claude, ChatGPT, Copilot, Grok, Perplexity). Notably built strictly on MV3 constraints (no remote code, no dynamic script execution) and open-sourced for auditability — a good template for the trust story you'll need.
- **Mem0 / OpenMemory-style extensions** — inject a "memory layer" across multiple AI sites by intercepting the input box and prepending retrieved context; same DOM-injection pattern, different data source (semantic memory API instead of local skill folders).
- **Anthropic's `anthropics/skills` GitHub repository and agentskills.io** — the actual open standard and reference implementation for the skill file format itself; this is what your extension should read/write to, rather than inventing a competing format.
- **Claude Code's plugin/marketplace system** — shows the "target side" of the integration: a `.claude-plugin/plugin.json` alongside a skill folder lets it be distributed and loaded as a plugin, including bundled MCP servers — a useful model if you want your extension to also package skills as installable plugins for Claude Code specifically.

There's a clear gap in the market for "read a local Agent-Skills-formatted folder and push copies of chosen skills into every locally-installed CLI/IDE agent's expected directory, plus best-effort inject-as-context into web chat UIs." That's a legitimate, buildable niche tool; it just needs to be marketed and engineered as *two* features (a real file-sync utility for CLI tools, and a much more limited prompt-injection convenience for web chat UIs), not one seamless "universal skill loader."

---

## 5. High-level development roadmap

**Phase 0 — Scope and format decision**
- Adopt Agent Skills / `SKILL.md` as your canonical format rather than designing your own. Write a strict parser/validator (YAML frontmatter with `name` + `description` required; reject files using reserved names or disallowed characters in frontmatter, mirroring the constraints the standard already imposes).

**Phase 1 — Local skill management (the solid, buildable core)**
1. Build the options/settings page with `showDirectoryPicker()` to select the skills root folder.
2. Recursively walk the directory, identify subfolders containing `SKILL.md`, parse frontmatter, and render a list/table UI (name, description, source path, size, last modified).
3. Persist the directory handle (IndexedDB) and re-verify permission on load; handle the "permission revoked/folder moved" case gracefully.
4. Add a file-watch-like refresh (there's no native filesystem watch API for extensions, so poll on a timer or on popup-open, and let the user manually "rescan").

**Phase 2 — CLI/IDE tool integration (native messaging)**
1. Build a small native messaging host (Node.js is easiest to distribute cross-platform via a signed installer or an npm-installed global binary) registered via a native messaging manifest per browser.
2. Implement commands: `list_targets` (detect installed tools by checking for `~/.claude/`, `~/.codex/`, `.cursor/`, etc.), `install_skill(path, target)` (copy or symlink into the right location, respecting each tool's expected structure), `remove_skill`, and optionally `reload(target)` where the tool supports a reload hook.
3. Surface target detection and install/remove actions in the extension UI, with clear before/after confirmation (this is filesystem mutation — treat it with the same care as any tool that writes outside its own sandbox).

**Phase 3 — Web chat UI "injection" (the fragile, best-effort layer)**
1. Build per-site content-script adapters (start with 2–3 major sites) that locate the input element and implement a robust text-setting routine (native setter + input event dispatch, as used by existing prompt-library extensions, since naive `.value =` assignment is silently ignored by React-controlled inputs).
2. Provide a picker UI (popup or in-page floating button) listing available skills; clicking one either (a) inserts the skill's content as a preamble to the user's next message, or (b) where the platform has an actual "custom instructions / project knowledge / file upload" surface, automates that upload flow instead of raw text injection.
3. Explicitly document to users that this layer is best-effort and will break when sites redesign their DOM — set expectations rather than promising true "skill loading" parity with CLI tools.
4. Add a lightweight per-site adapter registry so community contributions/fixes for broken selectors are easy to ship without a full extension update cycle (e.g., a remotely-updatable selector config — but be careful: MV3 forbids remote *code*, not necessarily remote *data* like a JSON selector map, though you should still validate/sanitize anything fetched remotely).

**Phase 4 — Polish and trust**
1. Open-source the extension (or at least be fully transparent about permissions and network calls) — this is the single biggest trust lever, as seen in the analogous prompt-library extensions that lead their marketing with "open source and auditable."
2. Zero unnecessary network calls; keep everything local unless the user explicitly opts into cloud sync.
3. Add export/import (plain files/JSON) so users aren't locked into your tool.

### Key challenges and mitigations
| Challenge | Mitigation |
|---|---|
| No stable API for web chat UIs | Treat as best-effort injection, not true integration; invest more engineering in the CLI/IDE side where a real standard exists |
| DOM/selector breakage on chatbot redesigns | Modular per-site adapters, community-updatable selector data, automated smoke tests against live sites |
| Filesystem permission fatigue / re-prompting | Cache directory handles, only ask for write access when actually writing, batch operations |
| Trust concerns (an extension that reads local files and touches multiple AI accounts) | Open source, minimal permissions requested incrementally, no telemetry, clear native-messaging-host code review path |
| Cross-tool skill compatibility | Stick to the "portable core" of SKILL.md (plain frontmatter + markdown); warn users when a skill uses tool-specific extensions (e.g., Claude Code's `context: fork`) that won't work elsewhere |

---

## 6. Cross-platform, security, and performance considerations

**Cross-platform (OS and browser):**
- File System Access API support is solid in Chromium browsers; Firefox support has been catching up but historically lagged and has had a narrower feature set — test explicitly rather than assuming parity.
- Native messaging manifests differ in format/location between Chrome, Firefox, and Edge, and per OS (Windows registry vs. a JSON file in a specific directory on macOS/Linux) — plan for an installer that registers correctly on each.
- Target directories for CLI tools (`~/.claude/skills`, etc.) may differ on Windows (`%USERPROFILE%`) vs. macOS/Linux (`~`) — abstract this in your native host rather than the browser code.

**Security:**
- Skills can bundle executable scripts. Anthropic's own guidance for Skills is blunt: only use skills from trusted sources, because a malicious skill can direct an agent to run code or access data in ways that don't match its stated purpose. Your extension, as a *distributor* of skills into multiple tools, inherits that responsibility — at minimum, show users the skill's raw content before install and never auto-execute anything yourself.
- Minimize `host_permissions` and request them incrementally (`optional_host_permissions` + `permissions.request()`) rather than declaring broad access up front — this is both better security practice and better for user trust/store review.
- A native messaging host is a meaningfully larger attack surface than a pure-browser extension (it's a local process with real filesystem access) — sign your binaries, avoid running arbitrary shell commands based on skill content, and keep the host's command set to a small, fixed, well-audited list of file operations.
- Never inject page content back into your own storage without sanitization if you ever add a "capture a skill from a chatbot's response" feature — treat all page-derived text as untrusted.

**Performance:**
- Directory scans should be incremental/cached, not full re-walks on every popup open, especially if users have large skill libraries with many reference files.
- Avoid loading full skill content into memory for the "list" view — read only frontmatter (first few KB of each `SKILL.md`) until the user actually opens/injects a specific skill, mirroring the progressive-disclosure philosophy the Skills format itself is built around.
- Content-script injection work (MutationObserver watching for input elements) should be scoped narrowly and torn down when not needed, to avoid degrading performance on heavy React-based chat sites.

---

## 7. Other insights and recommendations

- **Reframe the product**: what you're really building is (a) a genuinely useful, standards-based **local skill manager/synchronizer for CLI and IDE agent tools**, plus (b) a **best-effort prompt/context injector** for web chat UIs, marketed honestly as two different tiers of integration. Trying to sell it as one uniform "works everywhere identically" bridge will set expectations you can't meet on the web-UI side.
- **Don't reinvent the skill format.** Building on the Agent Skills open standard means your tool is immediately compatible with an ecosystem that already includes Claude Code, Codex CLI, Gemini CLI, and community tools, and it means skills your users already have (from `anthropics/skills` or elsewhere) work unmodified.
- **The CLI/IDE side is your actual differentiator.** Web chat prompt injectors are a crowded, low-moat space (multiple existing extensions already do this). A well-built cross-tool skill *syncer* for local agent tools — with a clean UI, validation, and safe install/uninstall — is a more defensible and more genuinely useful product, and it's the part of your spec that maps onto real, documented, stable interfaces rather than reverse-engineered DOM structure.
- **Consider MCP as a stretch goal, not phase 1.** If you later want live, two-way tool access (not just static file copying), building a local MCP server that your extension manages — which any MCP-capable client (including some chatbot integrations) could connect to — is the more architecturally correct next step, but it's a materially bigger undertaking than the file-bridge described here.
- **Be explicit with users about what "import" means on each platform** in your own UI copy — e.g., "Copied to Claude Code" (real, persistent, will be picked up automatically) vs. "Inserted into this chat" (one-time, not remembered, may need to be re-added next session). Conflating these is the most likely source of user confusion and disappointment.
