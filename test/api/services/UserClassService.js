'use strict';

class UserClassService {

    constructor(kites, options) {
        // kites.logger.info(`hello (${this.name}): `, options);
        this.useNativeModel = false;
    }

    /*
     * Use getAll(req) from base Service
     * DO NOT OVERRIDE!
     * */
    // getAll() {
    //     return Promise.resolve([
    //         1,
    //         2,
    //         3
    //     ])
    // }
}

module.exports = UserClassService;