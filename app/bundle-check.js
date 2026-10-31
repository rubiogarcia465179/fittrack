/** Bundla la app a JS puro con Metro (sin Hermes) para verificar que el
 *  código compila de extremo a extremo en este sandbox (aarch64).
 *  Usa la API pública `Metro.runBuild` (equivalente a `metro build`). */
const Metro = require('metro');
const { loadConfig } = require('metro-config');
const fs = require('fs');

const root = __dirname;
(async () => {
  const config = await loadConfig({
    cwd: root,
    projectRoot: root,
    platform: 'android',
  });
  const out = '/tmp/fittrack_bundle.js';
  await Metro.runBuild(config, {
    entry: 'index.ts',
    dev: false,
    out,
    minify: false,
    platform: 'android',
  });
  const stat = fs.statSync(out);
  console.log('BUNDLE_OK bytes=' + stat.size);
  const code = fs.readFileSync(out, 'utf8');
  // nº de módulos embebidos (marcadores de registro de módulos de Metro)
  const modules = (code.match(/__webpack_require__/g) || []).length;
  console.log('modules~=' + Math.max(0, modules));
})().catch((e) => {
  console.error('BUNDLE_FAIL', e && e.stack ? e.stack.slice(0, 800) : e);
  process.exit(1);
});
