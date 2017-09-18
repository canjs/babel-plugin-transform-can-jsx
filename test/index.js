var pluginTester = require('babel-plugin-tester');
var plugin = require('../src/babel-plugin-transform-can-jsx');
var path = require('path');

pluginTester({
    plugin,
    fixtures: path.join(__dirname, 'fixtures'),
})
