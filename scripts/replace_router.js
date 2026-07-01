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
  if (filePath.endsWith('.tsx') && !filePath.includes('LanguageContext.tsx')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes("useRouter()") || content.includes("useRouter(")) {
      // Import the custom hook
      if (!content.includes("useLocalizedRouter")) {
        content = "import { useLocalizedRouter } from '@/context/LanguageContext';\n" + content;
      }
      // Replace next/navigation useRouter import if we can, or just let it be unused
      content = content.replace(/const router = useRouter\(\);/g, "const router = useLocalizedRouter();");
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Updated router in ${filePath}`);
    }
  }
});
