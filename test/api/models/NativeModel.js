/**
 * Define native model
 */
module.exports = {
    findOne: () => {
        return Promise.resolve({
            userName: 'vunb'
        })
    },
    define: function() {
        this.kites.logger.info('Custom native model definition!');
        return this;
    }
}
