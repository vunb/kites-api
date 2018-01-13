class BaseModelService {
    constructor(kites, options) {

    }

    getModel() {
        return this.kites.model(this.name);
    }

    create(data) {
        // create a new record
        let doc = new this.getModel()(data);
        return this.getModel()
            .create(doc)
            .then((modelInstance) => {
                return modelInstance;
            });
    }

    read(id) {
        if (!/^[-0-9a-fA-F]{24,36}$/.test(id)) {
            return Promise.reject(new Error("ObjectId is not valid: " + id));
        } else {
            // create data model
            return this.getModel()
                .findById(id)
                .then((modelInstance) => {
                    return modelInstance;
                });
        }
    }
}

module.exports = BaseModelService;