'use strict';
var os = require('os');
var test = require('tape');
var request = require('supertest');
var engine = require('@kites/engine');
var kitesExpress = require('@kites/express');
var kitesApi = require('../index');

test('kites api test', function (t) {
    t.plan(3);

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
        .init().then((kites) => {
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
        })
})