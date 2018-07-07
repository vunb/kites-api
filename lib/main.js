'use strict';
var path = require('path');
var routes = require('./routes');
var discover = require('./discover');
var BaseService = require('./base/service');
var BaseController = require('./base/controller');

module.exports = function (kites, definition) {
    var apiDirectory = kites.defaultPath(definition.options.apiDirectory);
    var modelsDir = kites.defaultPath(definition.options.apiDirectory + '/models');
    var servicesDir = kites.defaultPath(definition.options.apiDirectory + '/services');
    var ctrlsDir = kites.defaultPath(definition.options.apiDirectory + '/controllers');

    /**
     * Config event listeners
     */
    kites.on('expressConfigure', (app) => {
        var apiPrefix = definition.options.apiPrefix || '/';
        kites.logger.debug('configure kites-api, apiDirectory: ' + apiDirectory);
        app.use(apiPrefix, routes(kites, definition));
    })

    // discover models
    kites.logger.debug('preparing register kites models ...');
    kites.models = discover(modelsDir, /.js$/i).map((model) => {
        kites.logger.debug('register model: ' + model);
        return require(model);
    });

    // discover services
    kites.logger.debug('preparing register kites services ...');
    kites.services = discover(servicesDir, /service.js/i).map((serviceFileName) => {
        var serviceName = path.basename(serviceFileName).replace(/service.js$/i, '').toLowerCase();
        var DerivedService = require(serviceFileName);
        kites.logger.debug(`register service (${serviceName}):`, serviceFileName);

        Object.setPrototypeOf(DerivedService.prototype, BaseService.prototype);
        Object.defineProperties(DerivedService.prototype, {
            kites: {
                writable: false,
                enumerable: false,
                value: kites
            },
            logger: {
                writable: true,
                enumerable: false,
                value: kites.logger
            },
            serviceName: {
                writable: false,
                enumerable: false,
                value: serviceName
            },
            serviceFileName: {
                writable: false,
                enumerable: false,
                value: serviceFileName
            },
            name: {
                writable: true,
                enumerable: false,
                value: serviceName
            }
        });
        var options = Object.assign({}, definition.options);
        return new DerivedService(kites, options);
    });

    // discover controllers
    kites.logger.debug('preparing register kites controllers ...');
    kites.controllers = discover(ctrlsDir, /controller.js/i).map((ctrlFileName) => {
        // extends base controller
        var ctrlName = path.basename(ctrlFileName).replace(/controller.js$/i, '').toLowerCase();
        var DerivedController = require(ctrlFileName);

        if (!DerivedController.prototype) {
            kites.logger.error('invalid controller: ' + ctrlFileName);
            return null;
        }

        var propNames = Object.getOwnPropertyNames(DerivedController.prototype);

        kites.logger.debug(`register controller (${ctrlName}):`, ctrlFileName);
        Object.setPrototypeOf(DerivedController.prototype, BaseController.prototype);
        Object.defineProperties(DerivedController.prototype, {
            kites: {
                writable: false,
                enumerable: false,
                value: kites
            },
            logger: {
                writable: true,
                enumerable: false,
                value: kites.logger
            },
            controllerName: {
                writable: false,
                enumerable: false,
                value: ctrlName
            },
            controllerFileName: {
                writable: false,
                enumerable: false,
                value: ctrlFileName
            },
            name: {
                writable: true,
                enumerable: false,
                value: ctrlName
            },
            propNames: {
                writable: true,
                enumerable: false,
                value: propNames
            },
            actions: {
                writable: true,
                enumerable: false,
                value: definition.options.actions
            },
            crud: {
                writable: true,
                enumerable: false,
                value: definition.options.crud
            }
        });

        var options = Object.assign({}, definition.options);
        var _newCtrl = new DerivedController(kites, options);
        return _newCtrl;
    });

    kites.model = function getModel(name) {
        return kites.models.find((m) => m.name === name);
    }

    kites.service = function getService(name) {
        var sv = kites.services.find((s) => s.name === name);
        if (!sv) {
            sv = new BaseService(kites, definition.options);
            sv.name = name;
            kites.services[name] = sv;
        }
        return sv;
    }

    kites.controller = function getController(name) {
        return kites.controllers.find((m) => m.name === name);
    }
}