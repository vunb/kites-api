'use strict';

class DisableActionController {

    constructor(kites, options) {
        kites.logger.info(`hello (${this.name}): `, options);
        this.crud = false;
        this.actions = false;
    }

    read (req, res, next) {
        res.ok('A msg');
    }
}

module.exports = DisableActionController;