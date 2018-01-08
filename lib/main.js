var fs = require('fs');
var path = require('path');

module.exports = function (kites, definition) {
    var apiDirectory = kites.defaultPath(definition.options.apiDirectory);

    kites.on('expressConfigure', (app) => {
        kites.logger.debug('configure kites-api, apiDirectory: ' + apiDirectory);
    })
}