#!/usr/bin/env python3
import sys
import os
import re
import xml.etree.ElementTree as ET

def optimize_svg(input_path, output_path=None):
    if not os.path.exists(input_path):
        print(f"Error: File not found: {input_path}")
        return False
        
    try:
        # Register namespaces to prevent namespace prefixing issues in output
        ET.register_namespace('', 'http://www.w3.org/2000/svg')
        
        tree = ET.parse(input_path)
        root = tree.getroot()
        
        # Remove namespace prefixes from tags if parsed improperly
        if not root.tag.endswith('svg'):
            print("Error: Input file does not appear to be an SVG.")
            return False
            
        # Get width and height attributes
        width = root.attrib.get('width')
        height = root.attrib.get('height')
        viewbox = root.attrib.get('viewBox')
        
        # Parse dimensions to establish viewBox if missing
        if not viewbox and width and height:
            # Strip non-numeric characters (px, em, etc.)
            w_val = re.sub(r'[^\d\.]', '', width)
            h_val = re.sub(r'[^\d\.]', '', height)
            if w_val and h_val:
                root.attrib['viewBox'] = f"0 0 {w_val} {h_val}"
                print(f"Created viewBox attribute: 0 0 {w_val} {h_val}")
                
        # Remove fixed width and height to enforce fluid responsiveness
        if 'width' in root.attrib:
            del root.attrib['width']
        if 'height' in root.attrib:
            del root.attrib['height']
            
        # Clean SVG attributes
        for attr in list(root.attrib.keys()):
            # Remove editor metadata attributes
            if 'sketch' in attr or 'inkscape' in attr or 'sodipodi' in attr:
                del root.attrib[attr]
                
        # Write to file
        out_path = output_path if output_path else input_path
        tree.write(out_path, encoding='utf-8', xml_declaration=False)
        
        print(f"Successfully optimized SVG saved to: {out_path}")
        return True
        
    except Exception as e:
        print(f"Failed to optimize SVG: {e}")
        return False

def main():
    if len(sys.argv) < 2:
        print("Usage: python optimize_svg.py <input_file.svg> [output_file.svg]")
        sys.exit(1)
        
    in_file = sys.argv[1]
    out_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    success = optimize_svg(in_file, out_file)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
