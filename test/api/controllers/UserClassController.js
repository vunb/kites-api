'use strict';

class UserClassController {

    constructor(kites, options) {
        // kites.logger.info(`hello (${this.name}): `, options);
        this.crud = true;
    }

    'get /:id/profile' (req, res, next) {
        res.ok(this.name);
    }

    findAll (req, res, next) {
        // get user service
        this.logger.info('This name:', this.name);
        var userService = this.kites.service(this.name);

        // get all user
        userService.getAll(req).then((result) => {
            res.ok(result);
        })
    }
}

module.exports = UserClassController;