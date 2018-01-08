var path = require('path');

[
    'kites-api',
    // Always end
    'endTest',
].forEach(script => {
    require(path.join(__dirname, script));
});