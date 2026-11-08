const { getDefaultConfig } = require('@expo/metro-config');

/** Config de Metro de Expo: añade el resolver de assets (PNGs embebidos). */
module.exports = getDefaultConfig(__dirname);
