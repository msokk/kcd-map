// Converts legacy marker JS files into JSON consumed by the React app.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const legacyJs = resolve(here, '../legacy/js');
const outDir = resolve(here, '../src/data');

function evalLegacy(file, exportNames) {
  const code = readFileSync(resolve(legacyJs, file), 'utf8');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  const out = {};
  for (const name of exportNames) out[name] = sandbox[name];
  return out;
}

const { markers, textMarkers } = evalLegacy('markers.js', ['markers', 'textMarkers']);
const { usr_markers } = evalLegacy('usr_markers.js', ['usr_markers']);

writeFileSync(resolve(outDir, 'markers.json'), JSON.stringify(markers, null, 2));
writeFileSync(resolve(outDir, 'textMarkers.json'), JSON.stringify(textMarkers, null, 2));
writeFileSync(resolve(outDir, 'treasureMarkers.json'), JSON.stringify(usr_markers, null, 2));

console.log(`markers: ${markers.length}, textMarkers: ${textMarkers.length}, treasureMarkers: ${usr_markers.length}`);
