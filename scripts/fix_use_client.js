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
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    if (content.startsWith("import { useLocalizedRouter } from '@/context/LanguageContext';\n'use client';")) {
      content = content.replace(
        "import { useLocalizedRouter } from '@/context/LanguageContext';\n'use client';",
        "'use client';\nimport { useLocalizedRouter } from '@/context/LanguageContext';"
      );
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Fixed use client in ${filePath}`);
    }
  }
});
