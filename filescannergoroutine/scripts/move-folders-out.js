const fs = require('fs');
const path = require('path');
const outputPath = require('../webpack.config.js').output.path;

const foldersToKeep = ['css', 'img', 'typescript'];

const tempOutsidePath = path.join(__dirname, '..', '_temp');

if (!fs.existsSync(tempOutsidePath)) {
  fs.mkdirSync(tempOutsidePath);
}

foldersToKeep.forEach(folder => {
  const currentFolderPath = path.join(outputPath, folder);
  const tempFolderPath = path.join(tempOutsidePath, folder);

  if (!fs.existsSync(tempFolderPath)) {
    fs.mkdirSync(tempFolderPath, { recursive: true });
  }

  fs.readdirSync(currentFolderPath).forEach(file => {
    const currentFilePath = path.join(currentFolderPath, file);
    const tempFilePath = path.join(tempFolderPath, file);
    fs.copyFileSync(currentFilePath, tempFilePath);
  });
});