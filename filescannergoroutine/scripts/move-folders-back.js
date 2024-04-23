const fs = require('fs');
const path = require('path');
const outputPath = require('../webpack.config.js').output.path; 

const foldersToKeep = ['css', 'img', 'typescript'];

const tempOutsidePath = path.join(__dirname, '..', '_temp');

foldersToKeep.forEach(folder => {
  const currentFolderPath = path.join(outputPath, folder);
  const tempFolderPath = path.join(tempOutsidePath, folder);

  if (!fs.existsSync(currentFolderPath)) {
    fs.mkdirSync(currentFolderPath, { recursive: true });
  }

  fs.readdirSync(tempFolderPath).forEach(file => {
    const tempFilePath = path.join(tempFolderPath, file);
    const currentFilePath = path.join(currentFolderPath, file);
    fs.copyFileSync(tempFilePath, currentFilePath);
  });

  fs.rmSync(tempFolderPath, { recursive: true });
});

fs.rmSync(tempOutsidePath, { recursive: true });