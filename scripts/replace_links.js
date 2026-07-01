const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx') && !filePath.includes('LocalizedLink.tsx')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes("import Link from 'next/link';")) {
      content = content.replace(/import Link from 'next\/link';/g, "import Link from '@/components/LocalizedLink';");
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Updated ${filePath}`);
    }
  }
});
