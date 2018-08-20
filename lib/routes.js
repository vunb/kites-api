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
                       let handler = baseUtil.asyncWrap(newCtrl[action].bind(newCtrl));
                       kites.logger.debug(`bind route ${ctrlName}: all ${route}`);
                       router.all(route, handler);
                    } else if (tokens.length == 2) {
                        let action2 = baseUtil.getHttpAction(tokens[0]);
                        let route = `/${controller}/` + tokens[1].replace(/^\/+/, '');
                        if (router[action2]) {
                            let handler = baseUtil.asyncWrap(newCtrl[action].bind(newCtrl));
                            kites.logger.debug(`bind route ${ctrlName}: ${action2} ${route}`);
                            router[action2](route, handler);
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
            kites.logger.info(`enable CRUD api for (${ctrlName}) controller`);

            let handleCreate = baseUtil.asyncWrap(newCtrl.create.bind(newCtrl));
            let handleRead = baseUtil.asyncWrap(newCtrl.read.bind(newCtrl));
            let handleReadAll = baseUtil.asyncWrap(newCtrl.findAll.bind(newCtrl));
            let handleUpdate = baseUtil.asyncWrap(newCtrl.update.bind(newCtrl));
            let handleDelete = baseUtil.asyncWrap(newCtrl.remove.bind(newCtrl));

            router.post('/' + ctrlName, handleCreate);
            router.get(`/${ctrlName}/:id`, handleRead);
            router.get('/' + ctrlName, (req, res, next) => {
                if (req.param('id')) {
                    kites.logger.info('find detail by id: ' + req.param('id'));
                    return handleRead(req, res, next);
                } else {
                    kites.logger.info('find all with pagination: ' + ctrlName);
                    return handleReadAll(req, res, next);
                }
            });

            router.put(`/${ctrlName}/:id`, handleUpdate);
            router.delete(`/${ctrlName}/:id`, handleDelete);
        } else {
            kites.logger.debug(`disable curd operations on: (${ctrlName}) controller.`);
        }

        kites.logger.debug(`bind routes for (${ctrlName}) controller is done.`);

    });

    return router;
}
