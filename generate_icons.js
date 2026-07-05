const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const iconsDir = path.join(__dirname, 'public', 'icons');
const svgPath = path.join(iconsDir, 'logo.svg');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const sizes = [16, 32, 48, 128];

async function generateIcons() {
  try {
    for (const size of sizes) {
      const outputPath = path.join(iconsDir, `icon-${size}.png`);
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`Created valid ${size}x${size} PNG icon at: ${outputPath}`);
    }
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
