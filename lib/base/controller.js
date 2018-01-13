'use strict';
var path = require("path"),
    fs = require('fs')
    // , BaseService = require('../services/BaseModelService')
    ,
    baseUtil = require("./util"),
    rootDir = process.cwd(),
    logger = console;

class BaseController {

    get service() {
        return this.getService()
    }

    get model() {
        return this.getModel()
    }

    getModel(name) {
        return this.kites.model(name || this.controllerName);
    }

    getService(name) {
        return this.kites.service(name || this.controllerName);
    }

    /**
     * Tạo mới một đối tượng quản lý
     * @return: {,}
     */
    create(req, res, next) {
        var data = req.body;

        return this.getService()
            .create(data, req)
            .then((modelInstance) => {
                return res.json(modelInstance);
            }).catch((err) => {
                this.logError("__baseController create error: ", err);
                return res.error(err);
            });
    }

    read(req, res, next) {
        var id = req.params.id;
        this.logInfo("Read data model: " + this.name);
        if (!/^[-0-9a-fA-F]{1,36}$/.test(id)) {
            // Yes, it's not a valid ObjectId, otherwise proceed with `findById` call.
            return res.badRequest("ObjectId is not valid: " + id);
        }

        return this.$getModel()
            .findById(id)
            .then((modelInstance) => {
                return res.ok(modelInstance);
            }).catch((err) => {
                this.logError("__baseController read error: ", err);
                return res.error(err);
            });
    }

    /**
     * Lấy toàn bộ danh mục các đối tượng quản lý
     * pageIndex: thứ tự trang cần lấy dữ liệu (mặc định trang 0)
     * pageSize: Số lượng mục dữ liệu trên 1 trang (mặc định 20)
     * @return: [total, Array]
     */
    findAll(req, res, next) {
        let page = req.param('pageIndex', 0);
        let limit = req.param('pageSize', 20) * 1;
        let skip = page * limit;
        let query = {};
        let qstr = req.param('qstr');

        // allow these conditions
        // abstract search if qstr appears
        for (let q in qstr) {
            if ("true" === qstr[q]) {
                query[q] = true;
            } else if ("false" === qstr[q]) {
                query[q] = false;
            } else if (q) {
                query[q] = qstr[q];
            }
        }

        if (!limit || limit < 1) {
            limit = 20;
        } else if (limit > 1000) {
            limit = 1000;
        }

        this.logger.info(`Pagination: page=${page}, size=${limit}, query=${JSON.stringify(query)}`);
        return this.getModel()
            .find(query)
            .skip(skip)
            .limit(limit)
            .then((results) => {
                let count = this.getModel()
                    .count(query)
                    .then(result => {
                        return result;
                    });
                return [results, count];
            }).spread((results, count) => {
                // return data to user
                return res.json({
                    total: count,
                    List: results
                });
            }).catch((err) => {
                this.logger.error("__baseController findAll error: ", err);
                return res.error(err);
            });
    }

    update(req, res, next) {
        var id = req.param('id');
        var data = req.body;

        if (!/^[-0-9a-fA-F]{1,36}$/.test(id)) {
            // Yes, it's not a valid ObjectId, otherwise proceed with `findById` call.
            return res.badRequest("ObjectId is not valid: " + id);
        }

        return this.getModel()
            .findById(id)
            .then((doc) => {
                doc.__req__ = req;
                ["_id", "__v", "createdAt"].forEach(item => {
                    // must delete versionKey(__v) before update
                    delete data[item];
                });
                for (var attribute in data) {
                    if (data.hasOwnProperty(attribute) && attribute !== this.key) {
                        doc[attribute] = data[attribute];
                    }
                }
                return doc.save();
            })
            .then((doc) => {
                return res.ok(doc);
            }).catch((err) => {
                this.logger.error('update error: ' + id, err);
                return res.error(err);
            });
    }

    remove(req, res, next) {
        var id = req.param('id');

        if (!/^[-0-9a-fA-F]{1,36}$/.test(id)) {
            // Yes, it's not a valid ObjectId, otherwise proceed with `findById` call.
            return res.badRequest("ObjectId is not valid: " + id);
        }

        return this.getModel()
            .findById(id)
            .then((doc) => {
                if (!doc) res.ok('remove ok but not found');
                return doc.remove();
            })
            .then((doc) => {
                return res.ok(doc);
            }).catch((err) => {
                this.logger.error(`remove error: ` + id)
                return res.error(err);
            });
    }

}

module.exports = BaseController;