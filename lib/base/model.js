'use strict';

class BaseModel {
    constructor(kites, options) {
        this.kites = kites;
        this.logger = kites.logger;
        this.options = options;
    }

    /**
     * Get available connections
     */
    get connections() {
        return this.kites.dataSource.connections;
    }

    /**
     * Get current connection associate with this model
     */
    get connection() {
        return this.connections[this.database];
    }

    /**
     * Table or collection name
     */
    get collection() {
        return this.name;
    }

    /**
     * Specify own data source
     */
    get database() {
        this.logger.debug('get database connection: ' + this.options.connection);
        return this.options.connection;
    }

    /**
     * Get schema definition
     */
    get schema() {
        // Need to override
        return '';
    }

    /**
     * Model definition
     */
    define() {
        this.schemaDefinition = this.schema;

        if (!this.schemaDefinition) {
            this.logger.warn(`Schema of model "${this.name}" is missing. Or you need to create and override method "define()" in the model definition.`);
            return this;
        }

         // connection is not ready or unavailable
         if (!this.connection) {
            throw `Data source ${this.database} is not available! Or you need to create and override method "define()" in the model definition.`;
        }

        var model = this.connection.define(this.collection, this.schemaDefinition);
        this.setup(model, this.kites);

        return model;
    }

    // abstract function
    setup(schema, kites) {
        // do nothing.
        this.logger.debug('setup model: ' + this.name);
    }

}

module.exports = BaseModel;
