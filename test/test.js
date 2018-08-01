var engine = require('@kites/engine');
var kitesExpress = require('@kites/express');
var kitesApi = require('../index');

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
    var md = kites.db.userClass;
    console.log('ok' + md.name)
});
