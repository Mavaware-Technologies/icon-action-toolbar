let mix = require('laravel-mix')
const path = require('path');
const fs = require('fs');

require('./nova.mix')
require('mix-tailwindcss')

const novaResourcesPathCandidates = [
    path.resolve(__dirname, '../../vendor/laravel/nova/resources/js'),
    path.resolve(__dirname, 'vendor/laravel/nova/resources/js'),
]
const novaResourcesPath = novaResourcesPathCandidates.find(candidate => fs.existsSync(candidate))

mix.webpackConfig({
    resolve: {
        alias: {
            '@': novaResourcesPath || path.resolve(__dirname, '../../vendor/laravel/nova/resources/js'),
        }
    }
});

console.log('Building Bora Bora Icon Action Toolbar...');

mix
  .setPublicPath('dist')
  .js('resources/js/tool.js', 'js')
  .vue({ version: 3 })
  .postCss('resources/css/tool.css', 'css')
  .tailwind()
  .nova('digital-creative/icon-action-toolbar')
