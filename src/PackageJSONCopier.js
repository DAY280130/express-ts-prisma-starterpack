import fs from 'fs';
import path from 'path';
import * as url from 'url';
// const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const packageJSON = fs.readFileSync(path.join(__dirname, './../package.json'));

const parsedPackageJSON = JSON.parse(packageJSON.toString());

delete parsedPackageJSON.devDependencies;

parsedPackageJSON.scripts = { start: 'node index.js' };

fs.appendFileSync(path.join(__dirname, './../dist/package.json'), JSON.stringify(parsedPackageJSON));
