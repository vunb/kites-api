const http_methods = exports.http_methods = {
    create: "post",
    read: "get",
    update: "put",
    delete: "delete"
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