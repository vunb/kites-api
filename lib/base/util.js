/**
 * HTTP Method Constant
 */
const http_methods = exports.http_methods = {
    create: "post",
    read: "get",
    update: "put",
    delete: "delete"
}

exports.extendsPrototypeController = function (ctrlPrototype) {

}

/**
 * get http action by CRUD definition
 */
exports.getHttpAction = function (action) {
    if (!http_methods[action]) {
        return action;
    } else {
        return http_methods[action];
    }
}

/**
 * Return express middleware function wrapper
 * @param {Function} fn
 */
exports.asyncWrap = fn =>
    function asyncUtilWrap(...args) {
        const fnReturn = fn(...args);
        const next = args[args.length - 1];
        return Promise.resolve(fnReturn).catch(next);
    }
