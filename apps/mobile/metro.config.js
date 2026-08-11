const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro resolve packages exclusively from root node_modules to guarantee single React instance
config.resolver.nodeModulesPaths = [
  path.resolve(workspaceRoot, 'node_modules'),
  path.resolve(projectRoot, 'node_modules'),
];

// 3. Pin React and React Native to root node_modules
config.resolver.extraNodeModules = {
  react: path.resolve(workspaceRoot, 'node_modules/react'),
  'react-dom': path.resolve(workspaceRoot, 'node_modules/react-dom'),
  'react-native': path.resolve(workspaceRoot, 'node_modules/react-native'),
};

const { transformer, resolver } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
};

config.resolver.assetExts = resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...resolver.sourceExts, 'svg'];

module.exports = config;
