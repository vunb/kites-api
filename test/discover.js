var os = require('os');
var test = require('tape');
var discover = require('../lib/discover');

test('discover api', function (t) {
    t.plan(1)
    var controllers = discover(__dirname, /controller.js$/);
    t.equal(controllers.length, 2);
    
});