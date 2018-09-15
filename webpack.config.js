const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const AngularCompilerPlugin = require('@ngtools/webpack').AngularCompilerPlugin;
const pjson = require('./package.json');
const SubresourceIntegrityPlugin = require('webpack-subresource-integrity');

if (process.env.NODE_ENV == null) {
    process.env.NODE_ENV = 'development';
}
const ENV = process.env.ENV = process.env.NODE_ENV;

const extractCss = new ExtractTextPlugin({
    filename: '[name].[hash].css',
    disable: false,
    allChunks: true,
});

const moduleRules = [
    {
        test: /\.ts$/,
        enforce: 'pre',
        loader: 'tslint-loader',
    },
    {
        test: /\.(html)$/,
        loader: 'html-loader',
    },
    {
        test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        exclude: /loading.svg/,
        use: [{
            loader: 'file-loader',
            options: {
                name: '[name].[ext]',
                outputPath: 'fonts/',
            },
        }],
    },
    {
        test: /\.(jpe?g|png|gif|svg)$/i,
        exclude: /.*(fontawesome-webfont)\.svg/,
        use: [{
            loader: 'file-loader',
            options: {
                name: '[name].[ext]',
                outputPath: 'images/',
            }
        }]
    },
    {
        test: /\.scss$/,
        use: extractCss.extract({
            use: [
                { loader: 'css-loader' },
                { loader: 'sass-loader' },
            ],
            publicPath: '../',
        }),
    },
    // Hide System.import warnings. ref: https://github.com/angular/angular/issues/21560
    {
        test: /[\/\\]@angular[\/\\].+\.js$/,
        parser: { system: true },
    },
];

const plugins = [
    new CleanWebpackPlugin([
        path.resolve(__dirname, 'build/*'),
    ]),
    // ref: https://github.com/angular/angular/issues/20357
    new webpack.ContextReplacementPlugin(/\@angular(\\|\/)core(\\|\/)fesm5/,
        path.resolve(__dirname, './src')),
    new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: 'index.html',
        chunks: ['app/polyfills', 'app/vendor', 'app/main'],
    }),
    new HtmlWebpackPlugin({
        template: './src/connectors/duo.html',
        filename: 'duo-connector.html',
        chunks: ['connectors/duo'],
    }),
    new HtmlWebpackPlugin({
        template: './src/connectors/u2f.html',
        filename: 'u2f-connector.html',
        chunks: ['connectors/u2f'],
    }),
    new CopyWebpackPlugin([
        { from: './src/manifest.json' },
        { from: './src/favicon.ico' },
        { from: './src/browserconfig.xml' },
        { from: './src/app-id.json' },
        { from: './src/images', to: 'images' },
        { from: './src/locales', to: 'locales' },
        { from: './src/scripts', to: 'scripts' },
        { from: './node_modules/qrious/dist/qrious.min.js', to: 'scripts' },
        { from: './node_modules/braintree-web-drop-in/dist/browser/dropin.js', to: 'scripts' },
    ]),
    extractCss,
    new webpack.DefinePlugin({
        'process.env': {
            'ENV': JSON.stringify(ENV),
            'SELF_HOST': JSON.stringify(process.env.SELF_HOST === 'true' ? true : false),
            'APPLICATION_VERSION': JSON.stringify(pjson.version),
            'CACHE_TAG': JSON.stringify(Math.random().toString(36).substring(7)),
        }
    }),
    new SubresourceIntegrityPlugin({
        hashFuncNames: ['sha384']
    })
];

if (ENV === 'production') {
    moduleRules.push({
        test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
        loader: '@ngtools/webpack',
    });
    plugins.push(new AngularCompilerPlugin({
        tsConfigPath: 'tsconfig.json',
        entryModule: 'src/app/app.module#AppModule',
        sourceMap: true,
    }));
} else {
    moduleRules.push({
        test: /\.ts$/,
        loaders: ['ts-loader', 'angular2-template-loader'],
        exclude: path.resolve(__dirname, 'node_modules'),
    });
}

let certSuffix = fs.existsSync('dev-server.local.pem') ? '.local' : '.shared';
const serve = {
    https: {
        key: fs.readFileSync('dev-server' + certSuffix + '.pem'),
        cert: fs.readFileSync('dev-server' + certSuffix + '.pem'),
    },
    // host: '192.168.1.9',

    // host client has issues. ref: https://github.com/webpack-contrib/webpack-serve/issues/233
    // hotClient: false,
};

const config = {
    mode: ENV,
    devtool: 'source-map',
    serve: serve,
    entry: {
        'app/polyfills': './src/app/polyfills.ts',
        'app/main': './src/app/main.ts',
        'connectors/u2f': './src/connectors/u2f.js',
        'connectors/duo': './src/connectors/duo.ts',
    },
    externals: {
        'u2f': 'u2f',
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'app/vendor',
                    chunks: (chunk) => {
                        return chunk.name === 'app/main';
                    },
                },
            },
        },
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            jslib: path.join(__dirname, 'jslib/src'),
        },
        symlinks: false,
        modules: [path.resolve('node_modules')],
    },
    output: {
        filename: '[name].[hash].js',
        path: path.resolve(__dirname, 'build'),
        crossOriginLoading: 'anonymous',
    },
    module: { rules: moduleRules },
    plugins: plugins,
};

module.exports = config;
