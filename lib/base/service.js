'use strict';
const _ = require('lodash');
const Promise = require('bluebird');

class BaseModelService {
    constructor(kites, options) {
        this.kites = kites;
        this.logger = kites.logger;
        this.options = options;
        this.useNativeModel = false;
    }

    getModel(useNativeModel) {
        if (typeof useNativeModel === 'undefined') {
            useNativeModel = this.useNativeModel;
        }

        this.logger.debug('from service get model: ' + this.name);
        return this.kites.model(this.name, useNativeModel);
    }

    getNativeModel() {
        return this.kites.model(this.name, true);
    }

    create(data, req) {
        // create a new record
        let Model = this.getModel();
        return new Promise((resolve, reject) => {
            Model.create(data, (err, doc) => {
                if (!err) resolve(doc)
                else reject(err);
            })
        })
    }

    read(id, req) {
        return this.getModel()
            .findById(id)
            .then((modelInstance) => {
                return modelInstance;
            });
    }

    /**
     * Update document data.
     * @param {String} id 
     * @param {Object} data 
     * @param {Request} req 
     */
    update(id, data, req) {
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
                return doc;
            })
    }

    /**
     * Remove document
     * @param {String} id 
     * @param {Request} req 
     */
    remove(id, req) {
        return this.getModel()
            .findById(id)
            .then((doc) => {
                if (!doc) res.ok('remove ok but not found');
                return doc.remove();
            })
            .then((doc) => {
                return doc;
            })
    }


    /**
     * Shortcut: service.read(id)
     * @param {String} id 
     */
    findById(id, req) {
        return this.read(id);
    }

    /**
     * Find all documents
     * @param {Http.Request} req 
     */
    getAll(req) {
        let page = 0;
        let limit = 20;
        let skip = 0;
        let filter = {};
        let qstr = {};

        if (req) {
            page = req.param('pageIndex', 0);
            limit = req.param('pageSize', 20) * 1;
            skip = page * limit;
            qstr = req.param('qstr');
        }

        // allow these conditions
        // abstract search if qstr appears
        for (let q in qstr) {
            if ("true" === qstr[q]) {
                filter[q] = true;
            } else if ("false" === qstr[q]) {
                filter[q] = false;
            } else if (q) {
                filter[q] = qstr[q];
            }
        }

        if (!limit || limit < 1) {
            limit = 20;
        } else if (limit > 1000) {
            limit = 1000;
        }

        this.logger.info(`Pagination: page=${page}, size=${limit}, filter=${JSON.stringify(filter)}`);

        var findAll = new Promise((resolve, reject) => {
            this.getModel().all({
                where: filter,
                limit: limit,
                skip: skip
            }, function (err, results) {
                if (!err) {
                    resolve(results)
                } else {
                    reject(err)
                }
            });
        });

        var countAll = new Promise((resolve, reject) => {
            this.getModel().count(filter, function (err, results) {
                if (!err) {
                    resolve(results)
                } else {
                    reject(err)
                }
            });
        })

        return Promise.all([findAll, countAll])
            .spread((results, count) => {
                // return data to user
                return {
                    total: count,
                    result: results
                };
            });
    }
}

module.exports = BaseModelService;