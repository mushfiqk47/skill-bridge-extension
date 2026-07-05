const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i];
    crc ^= byte;
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (~crc) >>> 0;
}

function createPng(width, height) {
  // Signature
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  
  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  
  const ihdr = Buffer.concat([
    Buffer.from([0, 0, 0, 13]),
    Buffer.from('IHDR'),
    ihdrData,
    Buffer.alloc(4)
  ]);
  ihdr.writeUInt32BE(crc32(ihdr.slice(4, 21)), 21);
  
  // Pixel data (RGBA)
  const rowSize = width * 4;
  const rawData = Buffer.alloc(height * (rowSize + 1));
  let offset = 0;
  
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // filter type 0
    for (let x = 0; x < width; x++) {
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxRadius = (width / 2) - 1;
      
      // Cal.com styled logo: dark ink (#111111) circle with a clean white inner dot
      if (dist < maxRadius) {
        const inInnerDot = (dist < maxRadius * 0.35);
        if (inInnerDot) {
          rawData[offset++] = 255; // R
          rawData[offset++] = 255; // G
          rawData[offset++] = 255; // B
          rawData[offset++] = 255; // A
        } else {
          rawData[offset++] = 0x11; // R
          rawData[offset++] = 0x11; // G
          rawData[offset++] = 0x11; // B
          rawData[offset++] = 255;  // A
        }
      } else {
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
      }
    }
  }
  
  const compressed = zlib.deflateSync(rawData);
  const idat = Buffer.concat([
    Buffer.alloc(4),
    Buffer.from('IDAT'),
    compressed,
    Buffer.alloc(4)
  ]);
  idat.writeUInt32BE(compressed.length, 0);
  idat.writeUInt32BE(crc32(idat.slice(4, 8 + compressed.length)), 8 + compressed.length);
  
  // IEND
  const iend = Buffer.concat([
    Buffer.from([0, 0, 0, 0]),
    Buffer.from('IEND'),
    Buffer.from([0xae, 0x42, 0x60, 0x82])
  ]);
  
  return Buffer.concat([sig, ihdr, idat, iend]);
}

const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const sizes = [16, 32, 48, 128];
sizes.forEach(size => {
  const buf = createPng(size, size);
  const filePath = path.join(iconsDir, `icon-${size}.png`);
  fs.writeFileSync(filePath, buf);
  console.log(`Created valid ${size}x${size} PNG icon at: ${filePath}`);
});

console.log('All icons generated successfully!');
