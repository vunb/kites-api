function inheritsObject(baseObject, superObject) {
    Object.setPrototypeOf(baseObject, superObject);
}

function inheritsMultipleObjects(baseObject, superObjects) {
    return new Proxy(
        baseObject, {
            get(target, key) {
                if (Reflect.ownKeys(target).includes(key)) {
                    return Reflect.get(target, key);
                }
                const parent = superObjects.find(
                    _parent => Reflect.has(_parent, key)
                );
                if (parent !== undefined) {
                    return Reflect.get(parent, key);
                }
                return undefined;
            },
            has(target, key) {
                if (Reflect.ownKeys(target).includes(key)) {
                    return true;
                }
                const parentHasKey = superObjects.some(
                    _parent => Reflect.has(_parent, key)
                );
                if (parentHasKey) {
                    return true;
                }
                return false;
            }
        }
    );
}

exports.inheritsObject = inheritsObject;
exports.inheritsMultipleObjects = inheritsMultipleObjects;