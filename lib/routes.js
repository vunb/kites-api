'use strict';
var express = require('express');
var discover = require('./discover');

module.exports = function (kites, definition) {
    var router = express.Router();
    var modelsDir = kites.defaultPath(definition.options.apiDirectory + '/models');
    var servicesDir = kites.defaultPath(definition.options.apiDirectory + '/services');
    var ctrlsDir = kites.defaultPath(definition.options.apiDirectory + '/controllers');

    // discover models
    kites.logger.debug('preparing register kites models ...');
    kites.models = discover(modelsDir, /.js$/i).map((model) => {
        kites.logger.debug('register model: ' + model);
        return require(model);
    });
    
    // discover services
    kites.logger.debug('preparing register kites services ...');
    kites.services = discover(servicesDir, /service.js/i).map((service) => {
        kites.logger.debug('register service: ' + service);
        return require(service);
    });
    
    // discover controllers
    kites.logger.debug('preparing register kites controllers ...');
    kites.controllers = discover(ctrlsDir, /controller.js/i).map((ctrl) => {
        kites.logger.debug('register controller: ' + ctrl);
        return require(ctrl);
    });

    return router;
}