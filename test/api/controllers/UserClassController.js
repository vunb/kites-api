'use strict';

class UserClassController {

    constructor(kites, options) {
        // kites.logger.info(`hello (${this.name}): `, options);
        this.crud = true;
    }

    'get /:id/profile' (req, res, next) {
        res.ok(this.name);
    }

    findAll(req, res, next) {
        // get user service
        this.logger.info('This name:', this.name);
        var userService = this.kites.service(this.name);

        // get all user
        userService.getAll(req).then((result) => {
            res.ok(result);
        })
    }

    async await (req, res, next) {
        function resolveAfter2Seconds() {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve('resolved');
                }, 1000);
            });
        }
        var result = await resolveAfter2Seconds();
        res.ok(result);
    }

    async throws (req, res, next) {
        throw 'Async throw!!!';
    }

}

module.exports = UserClassController;
