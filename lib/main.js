var fs = require('fs');
var path = require('path');
var routes = require('./routes');

module.exports = function (kites, definition) {
    var apiDirectory = kites.defaultPath(definition.options.apiDirectory);

    kites.on('expressConfigure', (app) => {
        var apiPrefix = definition.options.apiPrefix || '/';
        kites.logger.debug('configure kites-api, apiDirectory: ' + apiDirectory);
        app.use(apiPrefix, routes(kites, definition));
    })

    kites.model = function getModel(name) {
        return kites.models.find((m) => m.name === name);
    }
    
    kites.service = function getService(name) {
        return kites.services.find((m) => m.name === name);
    }

    kites.controller = function getController(name) {
        return kites.controllers.find((m) => m.name === name);
    }
}