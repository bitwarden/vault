const AngularCompilerPlugin = require('@ngtools/webpack').AngularCompilerPlugin;

const webpackConfig = require('../webpack.config');

webpackConfig.entry['app/main'] = './bitwarden_license/src/app/main.ts';
webpackConfig.plugins[webpackConfig.plugins.length -1] = new AngularCompilerPlugin({
    tsConfigPath: 'tsconfig.json',
    entryModule: 'bitwarden_license/src/app/app.module#AppModule',
    sourceMap: true,
});

module.exports = webpackConfig;
