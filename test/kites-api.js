'use strict';
var os = require('os');
var test = require('tape');
var request = require('supertest');
var engine = require('@kites/engine');
var kitesExpress = require('@kites/express');
var kitesApi = require('../index');

test('kites api test', function (t) {
    t.plan(12);

    engine({
            logger: {
                console: {
                    transport: 'console',
                    level: 'debug'
                }
            },
            discover: false,
            appDirectory: __dirname,
            extensionsLocationCache: false
        })
        .use(kitesExpress())
        .use(kitesApi())
        .use((kites) => {
            kites.on('expressConfigure', (app) => {
                app.use(function (err, req, res, next) {
                    if (req.wantsJSON) {
                        res.status(500).json(err);
                    } else {
                        next(err)
                    }
                })
            })
        })
        .ready((kites) => {
            // util
            t.equal(kites.db.user.modelName, 'user', 'Access user model via proxy (db.1)');
            t.equal(kites.db.UserClass.modelName, 'UserClass_TableOrCollectionName', 'Access user model via proxy (db.2)');
            t.equal(kites.sv.uSer.name, 'user', 'Access user service via proxy (sv)');
        })
        .init().then((kites) => {
            // make requests
            request(kites.express.app)
                .get('/api/kites')
                .expect(200)
                .expect(/^kites@\d+.\d+.\d+$/)
                .then(t.pass.bind(t, 'kites info'))
                .catch(t.fail)

            request(kites.express.app)
                .get('/api/ping')
                .expect('Content-Type', /json/)
                .expect(200)
                .then((res) => {
                    t.equal(res.body.msg, 'pong', 'kites ping')
                })
                .catch(t.fail)

            request(kites.express.app)
                .get('/api/user/info')
                .expect('Content-Type', /json/)
                .expect(200)
                .then((res) => {
                    t.equal(res.body, 'user', 'kites user info')
                })
                .catch(t.fail)

            // test kites service
            request(kites.express.app)
                .get('/api/user')
                .expect('Content-Type', /json/)
                .expect(200)
                .then((res) => {
                    t.deepEqual(res.body, [
                        1,
                        2,
                        3
                    ], 'kites service usage (override: User.findAll)')
                })
                .catch(t.fail)

            // create an user
            request(kites.express.app)
                .post('/api/userclass')
                .type('form')
                .send({
                    firstname: 'Vu',
                    lastname: 'Nhu-Bao',
                    username: 'vunb'
                })
                .expect('Content-Type', /json/)
                .expect(200)
                .then((res) => {
                    t.deepEqual(res.body, {
                        firstname: 'Vu',
                        lastname: 'Nhu-Bao',
                        username: 'vunb',
                        id: 1
                    }, 'UserClass.create a new user from base service')
                })
                .catch(t.fail)

            // test kites service
            request(kites.express.app)
                .get('/api/userclass')
                .expect('Content-Type', /json/)
                .expect(200)
                .then((res) => {
                    t.deepEqual(res.body, {
                        total: 1,
                        result: [{
                            firstname: 'Vu',
                            lastname: 'Nhu-Bao',
                            username: 'vunb',
                            id: 1
                        }]
                    }, 'UserClass.findAll from base service')
                })
                .catch(t.fail)

            // get user profile
            request(kites.express.app)
                .get('/api/userclass/vunb/profile')
                .expect(200)
                .then((res) => {
                    t.equal(res.body, 'vunb', 'get user profile')
                })
                .catch(t.fail)

            // Async await
            request(kites.express.app)
                .get('/api/userclass/await')
                .expect(200)
                .then((res) => {
                    t.equal(res.body, 'resolved', 'Async await')
                })
                .catch(t.fail)

            // Async throw
            request(kites.express.app)
                //set header for this test
                .get('/api/userclass/throws')
                .set('Accept', 'json')
                .expect(500)
                .then((res) => {
                    t.equal(res.body, 'Async throw!!!', 'Async throw')
                })
                .catch(t.fail)
        })
})
