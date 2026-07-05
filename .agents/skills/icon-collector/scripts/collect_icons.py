import os
import re
import json
import shutil
import base64
import urllib.request
from urllib.error import URLError, HTTPError
from urllib.parse import urlparse
import argparse
from pathlib import Path
import hashlib

# Regex patterns
URL_REGEX = re.compile(r'https?://[^\s\'"]+\.(?:svg|png|jpg|jpeg|ico|woff|woff2|ttf)')
BASE64_REGEX = re.compile(r'data:image/(?:svg\+xml|png|jpeg|jpg|x-icon);base64,([a-zA-Z0-9+/=]+)')
SVG_TAG_REGEX = re.compile(r'<svg.*?>.*?</svg>', re.IGNORECASE | re.DOTALL)
ICON_CLASS_REGEX = re.compile(r'(?:class|className)=[\'"]([^\'"]*(?:fa-[a-z0-9-]+|material-icons|icon-[a-z0-9-]+)[^\'"]*)[\'"]')

IGNORE_DIRS = {'.git', 'node_modules', 'dist', 'build', 'venv', 'env', '.env', '.idea', '.vscode', 'collected-icons'}
ICON_EXTS = {'.svg', '.png', '.jpg', '.jpeg', '.ico', '.woff', '.woff2', '.ttf'}
SOURCE_EXTS = {'.html', '.css', '.js', '.ts', '.jsx', '.tsx', '.vue', '.svelte'}

def setup_directories(target_dir):
    output_dir = os.path.join(target_dir, 'collected-icons')
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    return output_dir

def hash_content(content):
    return hashlib.md5(content).hexdigest()[:8]

def download_file(url, output_dir):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            content = response.read()
            parsed = urlparse(url)
            filename = os.path.basename(parsed.path)
            if not filename:
                filename = "downloaded_icon"
            
            # Prevent overwriting by appending hash
            name, ext = os.path.splitext(filename)
            unique_filename = f"{name}_{hash_content(content)}{ext}"
            file_path = os.path.join(output_dir, unique_filename)
            
            with open(file_path, 'wb') as f:
                f.write(content)
            return unique_filename, True
    except Exception as e:
        return str(e), False

def extract_base64(b64_string, output_dir, count):
    try:
        content = base64.b64decode(b64_string)
        # Determine extension by inspecting start of string, defaulting to png
        ext = '.png'
        if b'<' in content and b'svg' in content:
            ext = '.svg'
            
        filename = f"base64_icon_{count}{ext}"
        file_path = os.path.join(output_dir, filename)
        with open(file_path, 'wb') as f:
            f.write(content)
        return filename, True
    except Exception as e:
        return str(e), False

def scan_project(target_dir, output_dir):
    manifest = []
    stats = {
        'physical_files': 0,
        'cdn_links': 0,
        'base64': 0,
        'inline_svg': 0,
        'icon_classes': 0,
        'errors': 0
    }
    
    b64_count = 0
    inline_svg_count = 0
    
    for root, dirs, files in os.walk(target_dir):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        
        for file in files:
            file_path = os.path.join(root, file)
            ext = os.path.splitext(file)[1].lower()
            rel_path = os.path.relpath(file_path, target_dir)
            
            # 1. Handle physical icon files
            if ext in ICON_EXTS:
                dest_filename = f"{os.path.splitext(file)[0]}_{hash_content(file_path.encode())}{ext}"
                dest_path = os.path.join(output_dir, dest_filename)
                try:
                    shutil.copy2(file_path, dest_path)
                    manifest.append({
                        'type': 'physical_file',
                        'source': rel_path,
                        'destination': dest_filename,
                        'status': 'success'
                    })
                    stats['physical_files'] += 1
                except Exception as e:
                    manifest.append({
                        'type': 'physical_file',
                        'source': rel_path,
                        'status': 'error',
                        'error': str(e)
                    })
                    stats['errors'] += 1
            
            # 2. Handle source code files
            if ext in SOURCE_EXTS:
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                        # Find CDN Links
                        urls = URL_REGEX.findall(content)
                        for url in urls:
                            filename, success = download_file(url, output_dir)
                            manifest.append({
                                'type': 'cdn_link',
                                'source': rel_path,
                                'url': url,
                                'destination': filename if success else None,
                                'status': 'success' if success else 'error',
                                'error': None if success else filename
                            })
                            if success: stats['cdn_links'] += 1
                            else: stats['errors'] += 1
                                
                        # Find Base64
                        b64s = BASE64_REGEX.findall(content)
                        for b64 in b64s:
                            b64_count += 1
                            filename, success = extract_base64(b64, output_dir, b64_count)
                            manifest.append({
                                'type': 'base64',
                                'source': rel_path,
                                'destination': filename if success else None,
                                'status': 'success' if success else 'error',
                                'error': None if success else filename
                            })
                            if success: stats['base64'] += 1
                            else: stats['errors'] += 1
                                
                        # Find Inline SVGs
                        svgs = SVG_TAG_REGEX.findall(content)
                        for svg in svgs:
                            inline_svg_count += 1
                            filename = f"inline_svg_{inline_svg_count}.svg"
                            dest_path = os.path.join(output_dir, filename)
                            with open(dest_path, 'w', encoding='utf-8') as svg_f:
                                svg_f.write(svg)
                            manifest.append({
                                'type': 'inline_svg',
                                'source': rel_path,
                                'destination': filename,
                                'status': 'success'
                            })
                            stats['inline_svg'] += 1
                            
                        # Find Icon Classes (FontAwesome, Material, etc.)
                        classes = ICON_CLASS_REGEX.findall(content)
                        for cls in classes:
                            # Just extract the specific icon parts
                            words = cls.split()
                            icon_words = [w for w in words if 'fa-' in w or 'icon-' in w or 'material-icons' in w]
                            if icon_words:
                                manifest.append({
                                    'type': 'icon_class',
                                    'source': rel_path,
                                    'class_name': " ".join(icon_words),
                                    'status': 'logged'
                                })
                                stats['icon_classes'] += 1
                                
                except UnicodeDecodeError:
                    pass # Skip non-utf8 files
                except Exception as e:
                    pass
                    
    return manifest, stats

def generate_report(output_dir, stats, manifest):
    report_path = os.path.join(output_dir, 'icon_collection_report.md')
    total_extracted = stats['physical_files'] + stats['cdn_links'] + stats['base64'] + stats['inline_svg']
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("# Icon Collection Report\n\n")
        f.write("## Summary\n")
        f.write(f"- **Total Icons Extracted to Files**: {total_extracted}\n")
        f.write(f"- **Physical Icon Files Copied**: {stats['physical_files']}\n")
        f.write(f"- **CDN Hosted Icons Downloaded**: {stats['cdn_links']}\n")
        f.write(f"- **Base64 Icons Decoded**: {stats['base64']}\n")
        f.write(f"- **Inline SVGs Extracted**: {stats['inline_svg']}\n")
        f.write(f"- **Icon CSS Classes Found**: {stats['icon_classes']} (Logged in manifest only)\n")
        f.write(f"- **Errors**: {stats['errors']}\n\n")
        
        f.write("## Details\n")
        f.write("Please see `manifest.json` for a detailed mapping of where each icon was found and its destination filename.\n")
        
    manifest_path = os.path.join(output_dir, 'manifest.json')
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Collect icons from a project")
    parser.add_argument("--target", default=".", help="Target directory to scan")
    args = parser.parse_args()
    
    target = os.path.abspath(args.target)
    print(f"Scanning project for icons in: {target}")
    
    output_dir = setup_directories(target)
    manifest, stats = scan_project(target, output_dir)
    generate_report(output_dir, stats, manifest)
    
    print(f"Done! Collected icons saved to: {output_dir}")
    print(f"Check the report at {os.path.join(output_dir, 'icon_collection_report.md')} for details.")
