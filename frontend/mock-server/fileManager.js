import path from 'path';
import fs from 'fs';

export const loadJSON = (pathFile) => {
  const pathToFile = path.resolve('./mock-server/payload', pathFile);
  return JSON.parse(fs.readFileSync(pathToFile, 'utf-8'));
};
