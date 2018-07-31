'use strict';
var _ = require('lodash');
var express = require('express');
var baseUtil = require('./base/util');

module.exports = function (kites, definition) {

    var router = express.Router({
        mergeParams: true
    });

    // bind controller routes
    _.each(kites.controllers, (newCtrl) => {

        if (!newCtrl) {
            // invalid controller
            return;
        }

        var ctrlName = newCtrl.controllerName;
        if (newCtrl.actions) {
            kites.logger.debug(`initialize actions for: (${newCtrl.controllerName}) controller ...`)

            let controller = ctrlName;
            let methodNames = Object.keys(newCtrl).concat(newCtrl.propNames).filter((action) => typeof newCtrl[action] === 'function' && action !== 'constructor')
            for(let action of methodNames) {
                kites.logger.debug(`checking action method: ${ctrlName}->${action}`)
                // exclude CRUD actions
                if (['create', 'read', 'update', 'delete', 'findAll'].indexOf(action) < 0) {
                   let tokens = action.split(/[_ ]/) ;  // space or underline
                   if (tokens.length == 1) {
                       let route = `/${controller}/${action.replace(/^\/+/, '')}/:id?`;
                       kites.logger.debug(`bind route ${ctrlName}: all ${route}`);
                       router.all(route, newCtrl[action].bind(newCtrl));
                    } else if (tokens.length == 2) {
                        let action2 = baseUtil.getHttpAction(tokens[0]);
                        let route = `/${controller}/` + tokens[1].replace(/^\/+/, '');
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
        } else {
            kites.logger.debug(`disable curd operations on: (${ctrlName}) controller.`);
        }

        kites.logger.debug(`bind routes for (${ctrlName}) controller is done.`);

    });

    return router;
}
