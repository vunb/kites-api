'use strict';
/**
 * User Controller
 * Return an literal object or an instance of User class.
 * @param {Kites} kites instance
 * @param {Object} options extension options
 */
module.exports = function (kites, options) {
    this.actions = true;
    this.crud = true;

    this.logger.debug('hello kites api controller!', this.name, options)

    // define HTTP GET (advanced)
    this['get /:id/profile'] = function (req, res, next) {
        res.ok({
            name: 'Bao-Vu Nhu',
            about: 'about.me/vunb'
        })
    }

    // define HTTP POST (advanced)
    this['post /:id/profile'] = function (req, res, next) {
        res.ok('post ok!')
    }

    // define HTTP update
    this['put /:id/'] = function (req, res, next) {
        var user_id = req.param('id')
        res.ok('update id ok: ' + user_id)
    }

    // define HTTP GET (simple)
    // result: http://localhost:8889/api/user/info
    this.info = function (req, res, next) {
        // get model from this controller
        res.ok(this.controllerName)
    }

}