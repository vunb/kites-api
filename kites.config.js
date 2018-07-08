module.exports = {
    name: 'kites-api',
    main: 'lib/main.js',
    options: {
        actions: true,
        crud: true,
        apiDirectory: 'api',
        apiPrefix: '/api',
        connection: 'memory', // default connection
        dataSource: [{
                name: 'mySQL',
                driver: 'mysql', // or mariadb
                host: 'localhost',
                port: '3306',
                username: 'test',
                password: 'test',
                database: 'test',
                active: false, // auto connect to support multiple connections, default: false
                pool: true // optional for use pool directly
            },
            {
                name: 'mongodb',
                driver: 'mongoose', // or mongoose
                host: 'localhost',
                port: '27101',
                username: 'test',
                password: 'test',
                database: 'test',
                rs: false // replication set
            }
        ]
    }
}