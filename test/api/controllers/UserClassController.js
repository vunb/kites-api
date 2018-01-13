'use strict';

class UserClassController {

    constructor(kites, options) {
        kites.logger.info(`hello (${this.name}): `, options);
    }

    'get /:id/profile' (req, res, next) {
        res.ok(this.name);
    }
}

module.exports = UserClassController;