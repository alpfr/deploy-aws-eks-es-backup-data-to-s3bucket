import fs from 'fs';
import { parseCSV } from './csv-parser.js';

const text = fs.readFileSync('test.csv', 'utf8');
const result = parseCSV(text);
console.log(JSON.stringify(result, null, 2));
