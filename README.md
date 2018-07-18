# kites-api

Discover API controllers for Kites

[![Join the chat at https://gitter.im/nodevn/kites](https://badges.gitter.im/nodevn/kites.svg)](https://gitter.im/nodevn/kites)
[![npm version](https://img.shields.io/npm/v/@kites/api.svg?style=flat)](https://www.npmjs.com/package/@kites/api)
[![npm downloads](https://img.shields.io/npm/dm/@kites/api.svg)](https://www.npmjs.com/package/@kites/api)

# Features

* Auto Discover: models, services and controllers
* Auto generate RESTful API with basic CRUD operations
* Auto generate user-defined API actions 

Extension Options
=================

* **actions**: Enable auto generate controller actions, default: `true`
* **crud**: Enable auto generate RESTful API with CURD operations on model, default: `true`
* **apiDirectory**: Prefix RESTful API resource, default: `/api`
* **connection**: Default connection used for model, default: `memory`
* **dataSource.[i].name**: Datasource driver name (user defined)
* **dataSource.[i].driver**: Datasource driver name for specifed adapter (eg: `mongoose`)
* **dataSource.[i].host**: Hostname
* **dataSource.[i].port**: Username
* **dataSource.[i].username**: Port
* **dataSource.[i].password**: Password
* **dataSource.[i].database**: Database name
* **dataSource.[i].active**: Allow kites connect at startup
* **dataSource.[i].pool**: Connection pooling

Extension Usage
===============

You can apply this extention manually tho [kites-engine](https://github.com/vunb/kites-engine)

```js
var kites = require('@kites/engine')()
kites.use(require('@kites/api')())
```

Auto discover mode, just install the extension as a dependency:

```bash
npm install @kites/api
```

# License

MIT License

Copyright (c) 2018 Nhữ Bảo Vũ

<a rel="license" href="./LICENSE" target="_blank"><img alt="The MIT License" style="border-width:0;" width="120px" src="https://raw.githubusercontent.com/hsdt/styleguide/master/images/ossninja.svg?sanitize=true" /></a>