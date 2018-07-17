'use strict';
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

        this.logger.info('get model: ' + this.name);
        return this.kites.model(this.name, useNativeModel);
    }

    create(data, req) {
        // create a new record
        let Model = this.getModel(false);
        let doc = Model(data);
        return this.getModel()
            .create(doc)
            .then((modelInstance) => {
                return modelInstance;
            });
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
        //TODO: check req, if it is not presented
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
                return {
                    total: count,
                    result: results
                };
            });
    }
}

module.exports = BaseModelService;