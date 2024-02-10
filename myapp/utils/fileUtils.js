// utils/fileUtils.js
const fs = require('fs');

function readJSONFile(filePath) {
  const fileData = fs.readFileSync(filePath);
  return JSON.parse(fileData);
}

function deleteFile(filePath) {
  fs.unlinkSync(filePath);
}

module.exports = { readJSONFile, deleteFile };
