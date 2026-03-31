const path = require('path')
const fs = require('fs')

const tailwindConfigCandidates = [
    path.resolve(__dirname, '../../vendor/laravel/nova/tailwind.config'),
    path.resolve(__dirname, 'vendor/laravel/nova/tailwind.config'),
]

const novaTailwindConfigPath = tailwindConfigCandidates.find(candidate => fs.existsSync(candidate))

module.exports = {
    ...(novaTailwindConfigPath ? require(novaTailwindConfigPath) : {}),
    important: '.icon-action-toolbar',
}
