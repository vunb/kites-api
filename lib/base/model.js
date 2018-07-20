'use strict';

class BaseModel {
    constructor(kites, options) {
        this.kites = kites;
        this.logger = kites.logger;
        this.options = options;
        this.connections = kites.db.connections;
    }

    get database() {
        this.logger.debug('get database connection: ' + this.options.connection);
        return this.options.connection;
    }

    createSchema() {
        this.checkProperties();
        this.instance = this.connections[this.database].define(this.name, this.schema);
        return this.instance;
    }

    checkProperties() {
        if (!this.schema) {
            this.logger.warn(`Schema of model "${this.name}" is missing.`);
        }
    }

    // abstract function
    setup(schema, kites) {
        // do nothing.
        this.logger.debug('setup model: ' + this.name);
    }
    
}

module.exports = BaseModel;