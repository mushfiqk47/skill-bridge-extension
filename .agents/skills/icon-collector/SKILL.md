---
name: icon-collector
description: Scans a project or codebase to identify, extract, and organize all icon references (icon fonts, SVG files, PNG/JPG files, Base64 encoded icons, icon library imports). Use this skill whenever the user asks to collect, extract, or find icons in a project, organize visual assets, or generate a manifest of icons.
---

# Icon Collector

A skill to automatically scan a project, identify all icon references, extract them, and organize them into a structured output folder with a manifest and report.

## When to use this skill

Use this skill whenever the user says things like:
- "Find all the icons in this codebase and put them in a folder"
- "Extract the SVGs and icon references from my project"
- "Create an inventory of all the icons we use"
- "Pull all the FontAwesome and SVG icons into a single directory"

## How it works

The skill relies on a bundled Python script `scripts/collect_icons.py`. The script will recursively scan the provided directory to find:
1. Physical icon files (`.svg`, `.png`, `.jpg`, `.jpeg`, `.ico`, `.woff`, `.woff2`, `.ttf`)
2. Icons embedded in source code (`.html`, `.css`, `.js`, `.ts`, `.jsx`, `.tsx`) like:
   - `<svg>` tags
   - Base64 encoded image strings
   - CDN links to icons
   - Icon library class names (e.g., FontAwesome `fa-`, Material Icons, etc.)

## Instructions for execution

1. Determine the target directory the user wants to scan. If they haven't specified, use the current working directory.
2. Run the bundled script using Python. The script is located at `<skill-path>/scripts/collect_icons.py`.

Example command:
```bash
python <skill-path>/scripts/collect_icons.py --target <target-directory>
```
*(If `--target` is omitted, it defaults to the current directory).*

3. The script will create a folder named `collected-icons` inside the target directory. It will contain:
   - All physical icon files copied over.
   - Decoded Base64 icons saved as physical files.
   - Downloaded icons from any CDN links found.
   - `manifest.json`: A list of all icons found and their sources.
   - `icon_collection_report.md`: A summary report of the extraction.

4. Once the script finishes, inform the user about the results by briefly summarizing the generated report (e.g., total icons found) and pointing them to the `collected-icons` directory.
