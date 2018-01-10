var path = require('path');

[
    'discover',
    'kites-api',
    // Always end
    'endTest',
].forEach(script => {
    require(path.join(__dirname, script));
});