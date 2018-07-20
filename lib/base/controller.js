'use strict';
var path = require('path'),
    fs = require('fs')
    // , BaseService = require('../services/BaseModelService')
    ,
    baseUtil = require('./util'),
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
                this.logger.error('kites.__baseController create error: ', err);
                return res.error(err);
            });
    }

    read(req, res, next) {
        var id = req.params.id;
        this.logInfo('Read data model: ' + this.name);
        if (!/^[-0-9a-fA-F]{1,36}$/.test(id)) {
            // Yes, it's not a valid ObjectId, otherwise proceed with `findById` call.
            return res.badRequest('ObjectId is not valid: ' + id);
        }

        return this.getService()
            .findById(id, req)
            .then((result) => {
                return res.ok(result);
            }).catch((err) => {
                this.logger.error('kites.__baseController read error: ', err);
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
        return this.getService()
            .getAll(req)
            .then((result) => {
                return res.ok(result);
            }).catch((err) => {
                this.logger.error('kites.__baseController findAll error: ', err);
                return res.error(err);
            });
    }

    update(req, res, next) {
        var id = req.param('id');
        var data = req.body;

        if (!/^[-0-9a-fA-F]{1,36}$/.test(id)) {
            // Yes, it's not a valid ObjectId, otherwise proceed with `findById` call.
            return res.badRequest('ObjectId is not valid: ' + id);
        }

        return this.getService()
            .update(id, data, req)
            .then((result) => {
                return res.ok(result);
            }).catch((err) => {
                this.logger.error('update error: ' + id, err);
                return res.error(err);
            });
    }

    remove(req, res, next) {
        var id = req.param('id');

        if (!/^[-0-9a-fA-F]{1,36}$/.test(id)) {
            // Yes, it's not a valid ObjectId, otherwise proceed with `findById` call.
            return res.badRequest('ObjectId is not valid: ' + id);
        }

        return this.getService()
            .remove(id, req)
            .then((doc) => {
                return res.ok(doc);
            }).catch((err) => {
                this.logger.error(`remove error: ` + id)
                return res.error(err);
            });
    }

}

module.exports = BaseController;