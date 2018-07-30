/**
 * Define native model
 */
module.exports = {
    findOne: () => {
        return Promise.resolve({
            userName: 'vunb'
        })
    }
}