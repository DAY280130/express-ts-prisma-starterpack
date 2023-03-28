import fs from 'fs';
import path from 'path';
import * as url from 'url';
// const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

type PackageJSON = {
  name: string;
  version: string;
  description: string;
  main: string;
  type: string;
  author: string;
  license: string;
  scripts: object;
  dependencies: object;
  devDependencies?: object;
};

const packageJSON = fs.readFileSync(path.join(__dirname, './../package.json'));
// const packageJSON = fs.readFileSync('./../package.json');

const parsedPackageJSON = JSON.parse(packageJSON.toString()) as PackageJSON;

delete parsedPackageJSON.devDependencies;

fs.writeFileSync('./package.json', JSON.stringify(parsedPackageJSON));
