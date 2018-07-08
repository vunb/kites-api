'use strict';

class BaseModel {
    constructor(kites, options) {
        this.kites = kites;
        this.logger = kites.logger;
        this.options = options;
        this.connections = kites.db.connections;

        // initialize model.
        var schema = this.createSchema();
        this.setup(schema, kites);
        return schema;
    }

    get database() {
        return this.options.connection;
    }

    createSchema() {
        this.checkProperties();
        return this.connections[this.database].define(this.name, this.schema);
    }

    checkProperties() {
        if (!this.schema) {
            this.logger.warn(`Schema of model "${this.name}" is missing.`);
        }
    }

    // abstract function
    setup(schema, kites) {
        // do nothing.
    }
    
}

module.exports = BaseModel;