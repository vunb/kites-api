'use strict';

class UserService {

    constructor(kites, options) {
        kites.logger.info(`hello (${this.name}): `, options);
        this.useNativeModel = true;
    }

    getAll() {
        return Promise.resolve([
            1,
            2,
            3
        ])
    }
}

module.exports = UserService;