class UsersModel {

    /**
     * Table or collection name
     */
    get name() {
        return 'Users';
    }

    /**
     * Specify own data source
     */
    get database() {
        return 'memory';
    }

    /**
     * Get user model schema
     */
    get schema() {
        return {
            firstname: {
                type: 'String'
            },
            lastname: {
                type: 'String'
            },
            username: String,
        }
    }

    /**
     * Setup validation, relationships, or define scope, or custom method.
     * @param {schema} schema instance of user model
     * @param {kites} kites instance of kites will pass to get caminte or other models
     */
    setup(schema, kites) {
        
    }
}

module.exports = UsersModel;