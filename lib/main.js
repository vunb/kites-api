'use strict';
var _ = require('lodash');
var path = require('path');
var routes = require('./routes');
var discover = require('./discover');
var BaseModel = require('./base/model');
var BaseService = require('./base/service');
var BaseController = require('./base/controller');
var DataSource = require('./base/dataSource');

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
    });

    kites.on('apiModelRegistered', (kites) => {
        kites.dataSource = new DataSource(kites, definition.options);
        kites.dataSource.createConnection();

        kites.logger.info('<<<<<<<<<<< Data source is ready >>>>>>>>>>>');
        kites.dataSource.isReady = true;

        // Initialize models with schema definition ....
        _.each(kites.models, (e) => {
            // initialize and map it to speficied model.
            e.connections = kites.dataSource.connections;
            kites.logger.debug('init model schema: ' + e.name);
            var schema = e.createSchema();

            e.instance = schema;
            e.setup(schema, kites);
            return schema;
        })

        kites.emit('apiModelInitialized', kites);
    });

    kites.db = new Proxy({}, {
        get (obj, prop) {
            if (typeof prop === 'string') {
                return kites.model(prop);
            } else {
                return obj[prop];
            }
        }
    });

    /**
     * Get database connection
     * @param {String} name connection name
     */
    kites.connection = function (name) {
        if (!kites.dataSource || !kites.dataSource.isReady) {
            return Promise.reject(`Connection "${name}" is not ready!`);
        }
        return Promise.resolve(kites.dataSource.dbs[name]);
    }

    kites.model = function getModel(name, useNativeModel) {

        let options = {
            useNativeModel: false
        }

        if (typeof useNativeModel === 'boolean') {
            _.assign(options, {
                useNativeModel: useNativeModel
            })
        } else if (typeof useNativeModel === 'object') {
            _.assign(options, useNativeModel);
        }

        if (typeof name.toLowerCase === 'function') {
            // normalize name
            name = name.toLowerCase();
        }

        let model = kites.models.find((m) => m.name === name);
        if (!model) throw `Model [${name}] is not defined!`;

        // get native driver model?
        if (options.useNativeModel && model.schema.adapter) return model.schema.adapter.model(name);
        return model.instance;
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

    // discover models
    kites.logger.debug('preparing register kites models ...');
    kites.models = discover(modelsDir, /.js$/i).map((modelFileName) => {
        var modelName = path.basename(modelFileName).replace(/.js$/i, '').toLowerCase();
        kites.logger.debug(`register model (${modelName}): ` + modelFileName);

        var DerivedModel = require(modelFileName);

        Object.setPrototypeOf(DerivedModel.prototype, BaseModel.prototype);
        Object.defineProperties(DerivedModel.prototype, {
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
            modelName: {
                writable: false,
                enumerable: false,
                value: modelName
            },
            modelFileName: {
                writable: false,
                enumerable: false,
                value: modelFileName
            },
            name: {
                writable: true,
                enumerable: false,
                value: modelName
            },
            options: {
                writable: true,
                enumerable: false,
                value: definition.options
            }
        });

        var options = Object.assign({}, definition.options);
        return new DerivedModel(kites, options);
    });

    // init data source connection, after models have initialized
    kites.emit('apiModelRegistered', kites);

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
            },
            useNativeModel: {
                writable: true,
                enumerable: false,
                value: false
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

}