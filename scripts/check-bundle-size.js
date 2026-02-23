#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const MAX_SIZE_KB = 500; // 500KB para todo bundle JS
const DIST_PATH = path.join(__dirname, '..', 'dist', 'assets');

try {
  const files = fs.readdirSync(DIST_PATH);
  const jsFiles = files.filter(f => f.endsWith('.js'));
  
  let totalSize = 0;
  const fileSizes = [];
  
  jsFiles.forEach(file => {
    const filePath = path.join(DIST_PATH, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    totalSize += parseFloat(sizeKB);
    fileSizes.push({ file, sizeKB });
  });
  
  console.log('\n📊 Bundle Size Report\n');
  console.log('File'.padEnd(50), 'Size');
  console.log('─'.repeat(65));
  
  fileSizes
    .sort((a, b) => parseFloat(b.sizeKB) - parseFloat(a.sizeKB))
    .forEach(({ file, sizeKB }) => {
      const icon = parseFloat(sizeKB) > 200 ? '⚠️ ' : '✅ ';
      console.log(`${icon}${file.padEnd(50)} ${sizeKB} KB`);
    });
  
  console.log('─'.repeat(65));
  console.log(`${'Total'.padEnd(50)} ${totalSize.toFixed(2)} KB`);
  console.log(`${'Budget'.padEnd(50)} ${MAX_SIZE_KB} KB`);
  
  if (totalSize > MAX_SIZE_KB) {
    const excess = totalSize - MAX_SIZE_KB;
    console.log(`\n❌ Bundle exceeds budget by ${excess.toFixed(2)} KB\n`);
    process.exit(1);
  } else {
    const remaining = MAX_SIZE_KB - totalSize;
    console.log(`\n✅ Bundle within budget. ${remaining.toFixed(2)} KB remaining\n`);
  }
  
} catch (error) {
  console.error('Error checking bundle size:', error.message);
  process.exit(1);
}
