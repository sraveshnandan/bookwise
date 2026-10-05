#!/usr/bin/env node
/**
 * Generate app icons for all platforms
 * Run: pnpm generate:icons
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ICON_SIZES = {
  ios: [
    { size: 20, idiom: 'iphone', scale: '2x', filename: 'Icon-20@2x.png' },
    { size: 20, idiom: 'iphone', scale: '3x', filename: 'Icon-20@3x.png' },
    { size: 29, idiom: 'iphone', scale: '1x', filename: 'Icon-29.png' },
    { size: 29, idiom: 'iphone', scale: '2x', filename: 'Icon-29@2x.png' },
    { size: 29, idiom: 'iphone', scale: '3x', filename: 'Icon-29@3x.png' },
    { size: 40, idiom: 'iphone', scale: '2x', filename: 'Icon-40@2x.png' },
    { size: 40, idiom: 'iphone', scale: '3x', filename: 'Icon-40@3x.png' },
    { size: 60, idiom: 'iphone', scale: '2x', filename: 'Icon-60@2x.png' },
    { size: 60, idiom: 'iphone', scale: '3x', filename: 'Icon-60@3x.png' },
    { size: 20, idiom: 'ipad', scale: '1x', filename: 'Icon-20.png' },
    { size: 20, idiom: 'ipad', scale: '2x', filename: 'Icon-20@2x.png' },
    { size: 29, idiom: 'ipad', scale: '1x', filename: 'Icon-29.png' },
    { size: 29, idiom: 'ipad', scale: '2x', filename: 'Icon-29@2x.png' },
    { size: 40, idiom: 'ipad', scale: '1x', filename: 'Icon-40.png' },
    { size: 40, idiom: 'ipad', scale: '2x', filename: 'Icon-40@2x.png' },
    { size: 76, idiom: 'ipad', scale: '1x', filename: 'Icon-76.png' },
    { size: 76, idiom: 'ipad', scale: '2x', filename: 'Icon-76@2x.png' },
    { size: 83.5, idiom: 'ipad', scale: '2x', filename: 'Icon-83.5@2x.png' },
    { size: 1024, idiom: 'ios-marketing', scale: '1x', filename: 'Icon-1024.png' },
  ],
  android: [
    { size: 36, density: 'ldpi', folder: 'mipmap-ldpi', filename: 'ic_launcher.png' },
    { size: 48, density: 'mdpi', folder: 'mipmap-mdpi', filename: 'ic_launcher.png' },
    { size: 72, density: 'hdpi', folder: 'mipmap-hdpi', filename: 'ic_launcher.png' },
    { size: 96, density: 'xhdpi', folder: 'mipmap-xhdpi', filename: 'ic_launcher.png' },
    { size: 144, density: 'xxhdpi', folder: 'mipmap-xxhdpi', filename: 'ic_launcher.png' },
    { size: 192, density: 'xxxhdpi', folder: 'mipmap-xxxhdpi', filename: 'ic_launcher.png' },
  ],
  web: [
    { size: 16, filename: 'favicon-16.png' },
    { size: 32, filename: 'favicon-32.png' },
    { size: 48, filename: 'favicon-48.png' },
    { size: 72, filename: 'icon-72.png' },
    { size: 96, filename: 'icon-96.png' },
    { size: 128, filename: 'icon-128.png' },
    { size: 144, filename: 'icon-144.png' },
    { size: 152, filename: 'icon-152.png' },
    { size: 192, filename: 'icon-192.png' },
    { size: 384, filename: 'icon-384.png' },
    { size: 512, filename: 'icon-512.png' },
  ],
};

async function generateIcons() {
  const sourceIcon = path.join(__dirname, '../assets/images/icon.png');
  const outputDir = path.join(__dirname, '../assets/images/generated');

  if (!fs.existsSync(sourceIcon)) {
    console.error('Source icon not found at:', sourceIcon);
    process.exit(1);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Generating icons from:', sourceIcon);

  // Generate iOS icons
  for (const icon of ICON_SIZES.ios) {
    const outputPath = path.join(outputDir, 'ios', icon.filename);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    
    await sharp(sourceIcon)
      .resize(icon.size * (icon.scale === '2x' ? 2 : icon.scale === '3x' ? 3 : 1))
      .png()
      .toFile(outputPath);
    
    console.log(`Generated iOS: ${icon.filename} (${icon.size}x${icon.scale})`);
  }

  // Generate Android icons
  for (const icon of ICON_SIZES.android) {
    const outputPath = path.join(outputDir, 'android', icon.folder, icon.filename);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    
    await sharp(sourceIcon)
      .resize(icon.size)
      .png()
      .toFile(outputPath);
    
    console.log(`Generated Android: ${icon.folder}/${icon.filename} (${icon.size}x${icon.size})`);
  }

  // Generate Web icons
  for (const icon of ICON_SIZES.web) {
    const outputPath = path.join(outputDir, 'web', icon.filename);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    
    await sharp(sourceIcon)
      .resize(icon.size)
      .png()
      .toFile(outputPath);
    
    console.log(`Generated Web: ${icon.filename} (${icon.size}x${icon.size})`);
  }

  console.log('\nAll icons generated in:', outputDir);
  console.log('Remember to update app.json with the new icon paths!');
}

generateIcons().catch(console.error);