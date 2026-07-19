import fs from 'fs';
import path from 'path';

const copyDir = (src, dest) => {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  fs.readdirSync(src).forEach(file => {
    const sPath = path.join(src, file);
    const dPath = path.join(dest, file);
    if (fs.statSync(sPath).isDirectory()) {
      copyDir(sPath, dPath);
    } else {
      fs.copyFileSync(sPath, dPath);
    }
  });
};

copyDir('src/data', 'dist/data');
copyDir('src/assets', 'dist/src/assets');
console.log('[Build] Static data and assets copied successfully to dist folder.');
