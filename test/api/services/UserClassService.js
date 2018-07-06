'use strict';

class UserClassService {

    constructor(kites, options) {
        kites.logger.info(`hello (${this.name}): `, options);
    }

    getAll() {
        return Promise.resolve([
            1,
            2,
            3
        ])
    }
}

module.exports = UserClassService;