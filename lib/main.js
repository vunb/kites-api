var fs = require('fs');
var path = require('path');
var routes = require('./routes');
var BaseService = require('./base/service');

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
        var sv = kites.services.find((s) => s.name === name);
        if (!sv) {
            sv = new BaseService(kites, definition.options);
            kites.services[name] = sv;
        }
        return sv;
    }

    kites.controller = function getController(name) {
        return kites.controllers.find((m) => m.name === name);
    }
}