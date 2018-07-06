'use strict';
var _ = require('lodash');
var util = require("util");
var path = require('path');
var express = require('express');
var discover = require('./discover');
var BaseController = require('./base/controller');
var BaseService = require('./base/service');
var baseUtil = require('./base/util');

module.exports = function (kites, definition) {
    var modelsDir = kites.defaultPath(definition.options.apiDirectory + '/models');
    var servicesDir = kites.defaultPath(definition.options.apiDirectory + '/services');
    var ctrlsDir = kites.defaultPath(definition.options.apiDirectory + '/controllers');
    var router = express.Router({
        mergeParams: true
    });

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
        const newCtrl = _newCtrl;//inherits.inheritsMultipleObjects(_newCtrl, [DerivedController.prototype, BaseController.prototype]);

        if (newCtrl.actions) {
            kites.logger.debug(`initialize actions for: (${newCtrl.controllerName}) controller ...`)

            let controller = ctrlName;
            let methodNames = Object.keys(newCtrl).concat(Object.getOwnPropertyNames(DerivedController.prototype)).filter((action) => typeof newCtrl[action] === 'function' && action !== 'constructor')
            for(let action of methodNames) {
                kites.logger.debug(`checking action method: ${ctrlName}->${action}`)
                // exclude CRUD actions
                if (['create', 'read', 'update', 'delete', 'findAll'].indexOf(action) < 0) {
                   let tokens = action.split(/[_ ]/) ;  // space or underline
                   if (tokens.length == 1) {
                       let route = `/${controller}/${action}/:id?`;
                       kites.logger.debug(`bind route ${ctrlName}: all ${route}`);
                       router.all(route, newCtrl[action].bind(newCtrl));
                    } else if (tokens.length == 2) {
                        let action2 = baseUtil.getHttpAction(tokens[0]);
                        let route = `/${controller}/` + tokens[1].replace(/^\/+/, "");
                        if (router[action2]) {
                            kites.logger.debug(`bind route ${ctrlName}: ${action2} ${route}`);
                            router[action2](route, newCtrl[action].bind(newCtrl));
                        } else {

                            kites.logger.info('invalid action, skip: ' + action);
                        }
                   }
                   
                } else {
                    kites.logger.debug('skip default CURD action: ' + action);
                }
            }
        } else {
            kites.logger.debug(`disable actions on: (${ctrlName}) controller.`);
        }

        if (newCtrl.crud) {
            kites.logger.info(`enable CRUD api for (${ctrlName}) controller`)
            router.post('/' + ctrlName, newCtrl.create.bind(newCtrl));
            router.get(`/${ctrlName}/:id`, newCtrl.read.bind(newCtrl));
            router.get('/' + ctrlName, (req, res, next) => {
                if (req.param('id')) {
                    kites.logger.info('find detail by id: ' + req.param('id'))
                    return newCtrl.read.bind(newCtrl)(req, res, next);
                } else {
                    kites.logger.info('find all with pagination: ' + ctrlName);
                    return newCtrl.findAll.bind(newCtrl)(req, res, next);
                }
            });

            router.put(`/${ctrlName}/:id`, newCtrl.update.bind(newCtrl));
            router.delete(`/${ctrlName}/:id`, newCtrl.remove.bind(newCtrl));
        }

        kites.logger.debug(`bind routes for (${ctrlName}) controller is done.`);

        return newCtrl;
    });

    return router;
}