'use strict';
const _ = require('lodash');
const caminte = require('caminte');

const Schema = caminte.Schema;

/**
 * Data source manager
 */
class DataSource {
    constructor(kites, options) {
        this.kites = kites;
        this.logger = kites.logger;
        this.options = options;

        this.kites.caminte = caminte;
        this.connections = {};
        this.availableDb = [
            'memory',
            'mongodb',
            'mongoose',
            'mysql',
            'mariadb'
        ];
    }

    createConnection() {
        _.each(this.options.dataSource,
            (ds) => {
                if (_.indexOf(this.availableDb, ds.driver) < 0) {
                    this.logger.warn(`Driver "${ds.driver}" currently does not support, please contact maintainers for support.`)
                    return;
                } else if (ds.active) {
                    this.logger.debug(`Connection "${ds.name}" is disabled!`);
                    return;
                }

                const connection = new Schema(ds.driver, ds);
                this.connections[ds.name] = connection;
                this.logger.info(`Connection ${ds.name} is created`);
            }
        )
    }

    get dbs() {
        return this.connections;
    }

}

module.exports = DataSource;