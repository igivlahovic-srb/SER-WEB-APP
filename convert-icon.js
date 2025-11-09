/* eslint-disable no-undef */
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function convertSvgToPng() {
  const svg = fs.readFileSync('./assets/icon.svg', 'utf-8');

  // Create different sizes
  const sizes = [
    { size: 1024, name: 'icon.png' },
    { size: 512, name: 'adaptive-icon.png' },
    { size: 192, name: 'favicon.png' }
  ];

  for (const { size, name } of sizes) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Convert SVG to data URL
    const svgDataUrl = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');

    const img = await loadImage(svgDataUrl);
    ctx.drawImage(img, 0, 0, size, size);

    // Save PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`./assets/${name}`, buffer);
    console.log(`Created ${name} (${size}x${size})`);
  }
}

convertSvgToPng().catch(console.error);
