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

    // init empty kites api objects.
    kites.models = [];
    kites.services = [];
    kites.controllers = [];
    // kites.adapters = [];

    /**
     * Config event listeners
     */
    kites.on('expressConfigure', (app) => {
        var apiPrefix = definition.options.apiPrefix || '/';
        kites.logger.debug(`configure kites-api: prefix=${apiPrefix}, apiDirectory=${apiDirectory}`);
        app.use(apiPrefix, routes(kites, definition));
    });

    kites.on('apiModelRegistered', (kites) => {
        kites.dataSource = new DataSource(kites, definition.options);
        kites.dataSource.createConnection();

        kites.dataSource.isReady = true;
        kites.logger.info('<<<<<<<<<<< Data source is ready >>>>>>>>>>>');

        if (definition.options.useBaseModel) {

            // Initialize models with schema definition ....
            kites.models = _.filter(kites.models, (e) => {
                if (!e || !(e instanceof BaseModel)) {
                    // invalid --> remove from container
                    return false;
                }
                // initialize and map it to speficied model.
                e.connections = kites.dataSource.connections;
                kites.logger.debug('init model schema: ' + e.name);
                var schema = e.createSchema();

                e.instance = schema;
                e.setup(schema, kites);
                return true;
            })
        }

        kites.emit('apiModelInitialized', kites);
    });

    // Notify
    kites.emit('apiBeforeConfigure', kites);

    /**
     * Alias to quick access models
     */
    kites.db = new Proxy({}, {
        get(obj, prop) {
            if (typeof prop === 'string') {
                return kites.model(prop.toLowerCase());
            } else {
                return obj[prop];
            }
        }
    });

    /**
     * Alias to quick access services
     */
    kites.sv = new Proxy({}, {
        get(obj, prop) {
            var sv = kites.service(prop.toLowerCase());
            if (!sv) {
                // Service is not ready.
                return new Proxy({}, {
                    get() {
                        throw prop + ' is not ready or not defined!'
                    }
                })
            } else {
                return sv;
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

    kites.model = function getModel(name) {

        if (typeof name.toLowerCase === 'function') {
            // normalize name
            name = name.toLowerCase();
        }

        let model = kites.models.find((m) => (m.name === name || m.modelName.toLowerCase() === name));
        if (!model) throw `Model [${name}] is not ready or defined!`;

        return (definition.options.useBaseModel && typeof model.instance != 'undefined') ? model.instance : model;
    }

    kites.service = function getService(name) {
        var sv = kites.services.find((s) => s.name === name);
        // if (!sv) {
        //     sv = new BaseService(kites, definition.options);
        //     sv.name = name;
        //     kites.services[name] = sv;
        // }
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

        if (!DerivedModel) {
            kites.logger.info(`Model definition does not have constructor: [${modelName}]!`);
            return DerivedModel;
        }

        // get model prototype
        var inheritsBaseObj = DerivedModel.prototype;

        if (typeof inheritsBaseObj === 'object' && definition.options.useBaseModel) {
            if (definition.options.useBaseModel) {
                Object.setPrototypeOf(inheritsBaseObj, BaseModel.prototype);
            }
        } else {
            inheritsBaseObj = DerivedModel;
        }

        Object.defineProperties(inheritsBaseObj, {
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
        return (typeof DerivedModel === 'function' && options.useBaseModel) ? new DerivedModel(kites, options) : DerivedModel;
    });

    // init data source connection, after models have initialized
    kites.emit('apiModelRegistered', kites);

    // discover services
    kites.logger.debug('preparing register kites services ...');
    kites.services = discover(servicesDir, /service.js/i).map((serviceFileName) => {
        var serviceName = path.basename(serviceFileName).replace(/service.js$/i, '').toLowerCase();
        var DerivedService = require(serviceFileName);
        kites.logger.debug(`register service (${serviceName}):`, serviceFileName);

        if (!DerivedService) {
            kites.logger.info(`Service definition does not have constructor: [${serviceName}]!`);
            return DerivedService;
        }

        // get service prototype
        var inheritsBaseObj = DerivedService.prototype;

        if (typeof inheritsBaseObj === 'object') {
            // still inherits from base service
            Object.setPrototypeOf(inheritsBaseObj, BaseService.prototype);
        } else {
            inheritsBaseObj = DerivedService;
        }

        Object.defineProperties(inheritsBaseObj, {
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
                value: definition.options.useBaseModel
            }
        });
        var options = Object.assign({}, definition.options);
        return typeof DerivedService === 'function' ? new DerivedService(kites, options) : DerivedService;
    });

    // discover controllers
    kites.logger.debug('preparing register kites controllers ...');
    kites.controllers = discover(ctrlsDir, /controller.js/i).map((ctrlFileName) => {
        // extends base controller
        var ctrlName = path.basename(ctrlFileName).replace(/controller.js$/i, '').toLowerCase();
        var DerivedController = require(ctrlFileName);

        if (!DerivedController) {
            kites.logger.info(`Controller definition does not have constructor: [${ctrlName}]!`);
            return DerivedController;
        }

        // get controller prototype
        var inheritsBaseObj = DerivedController.prototype;

        if (typeof inheritsBaseObj === 'object') {
            // for (curd, actions) still inherits from base controller
            Object.setPrototypeOf(inheritsBaseObj, BaseController.prototype);
        } else {
            inheritsBaseObj = DerivedController;
        }

        var propNames = Object.getOwnPropertyNames(inheritsBaseObj);

        kites.logger.debug(`register controller (${ctrlName}):`, ctrlFileName);

        Object.defineProperties(inheritsBaseObj, {
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
        return typeof DerivedController === 'function' ? new DerivedController(kites, options) : DerivedController;
    });

    kites.emit('apiConfigure', kites);
}
