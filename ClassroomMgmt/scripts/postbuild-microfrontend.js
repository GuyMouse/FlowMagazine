/**
 * Post-build script: generates microfrontend.json for host/container consumption.
 * Run after build:instructor or build:student so the host can discover entry points and base path.
 *
 * Usage: node scripts/postbuild-microfrontend.js <buildDir> <basePath> <name>
 * Example: node scripts/postbuild-microfrontend.js build-instructor /instructor classroom-instructor
 */

const fs = require('fs');
const path = require('path');

const buildDir = process.argv[2];
const basePath = process.argv[3];
const name = process.argv[4];

if (!buildDir || !basePath || !name) {
  console.error('Usage: node postbuild-microfrontend.js <buildDir> <basePath> <name>');
  process.exit(1);
}

const manifestPath = path.join(process.cwd(), buildDir, 'asset-manifest.json');
const outputPath = path.join(process.cwd(), buildDir, 'microfrontend.json');

let assetManifest;
try {
  assetManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (err) {
  console.error('Failed to read asset-manifest.json:', err.message);
  process.exit(1);
}

const base = basePath.replace(/\/$/, '') || '';
const entrypoints = assetManifest.entrypoints || [];
const files = assetManifest.files || {};
const prefix = (p) => (p && !p.startsWith('http') && !p.startsWith(base) ? base + (p.startsWith('/') ? '' : '/') + p : p);
const mainJsRaw = files['main.js'] || (entrypoints.find((e) => e.endsWith('.js')) || 'static/js/main.js');
const mainCssRaw = files['main.css'] || (entrypoints.find((e) => e.endsWith('.css')) || '');
const mainJs = prefix(mainJsRaw);
const mainCss = mainCssRaw ? prefix(mainCssRaw) : null;

const microfrontend = {
  name,
  basePath: base || '/',
  version: process.env.npm_package_version || '0.1.0',
  entry: mainJs,
  styles: mainCss ? [mainCss] : [],
  entrypoints: entrypoints.map((e) => (e.startsWith(base) ? e : base + (e.startsWith('/') ? e : '/' + e))),
  files: Object.fromEntries(Object.entries(files).map(([k, v]) => [k, prefix(v)])),
};

fs.writeFileSync(outputPath, JSON.stringify(microfrontend, null, 2), 'utf8');
console.log('Wrote', outputPath);
