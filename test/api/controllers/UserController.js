/**
 * User Controller
 * Return an literal object or an instance of User class.
 * @param {Kites} kites instance
 * @param {Object} options extension options
 */
module.exports = function (kites, options) {
    kites.logger.debug('hello kites api controller!')
    return {
        'get /:id/profile': function (req, res, next) {
            res.ok({
                name: 'Bao-Vu Nhu',
                about: 'about.me/vunb'
            })
        }
    }
}