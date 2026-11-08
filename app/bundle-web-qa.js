const Metro = require('metro');
const { loadConfig } = require('metro-config');
const fs = require('fs');
(async () => {
  const config = await loadConfig({ cwd: __dirname, projectRoot: __dirname, platform: 'web', config: __dirname + '/metro.qa.config.js' });
  console.log('alias keys:', Object.keys(config.resolver.extraNodeModules || {}));
  const out = '/tmp/fittrack-web-qa/bundle.js';
  await Metro.runBuild(config, { entry: 'qa/web-entry.tsx', dev: false, out, minify: false, platform: 'web' });
  console.log('WEB_BUNDLE_OK bytes=' + fs.statSync(out).size);
})().catch((e) => { console.error('WEB_BUNDLE_FAIL', e && e.stack ? e.stack.slice(0, 600) : e); process.exit(1); });
