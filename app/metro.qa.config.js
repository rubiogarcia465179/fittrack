// QA solo: build web de la app con alias nativos (Metro 0.87: hook resolver.resolveRequest).
const path = require('path');
const RNW = path.join(__dirname, 'node_modules/react-native-web');
const ALIASES = {
  'react-native': 'react-native-web',
  '@react-native-async-storage/async-storage': path.join(__dirname, 'qa/async-storage-shim.js'),
  'expo-status-bar': path.join(__dirname, 'qa/status-bar-shim.js'),
  'missing-asset-registry-path': path.join(RNW, 'dist/cjs/exports/AssetRegistry/index.js'),
};
module.exports = async function (ctx) {
  const { getDefaultConfig } = require('metro-config');
  const defaults = await getDefaultConfig(ctx);
  return {
    ...defaults,
    projectRoot: __dirname,
    resolver: {
      ...defaults.resolver,
      extraNodeModules: ALIASES,
      resolveRequest: (context, specifier, platform) => {
        if (ALIASES[specifier]) {
          if (ALIASES[specifier].startsWith('.')) {
            return context.resolveRequest(context, ALIASES[specifier], platform);
          }
          return { type: 'sourceFile', resolvedModule: ALIASES[specifier] };
        }
        return context.resolveRequest(context, specifier, platform);
      },
    },
  };
};
