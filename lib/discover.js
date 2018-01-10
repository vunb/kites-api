var fs = require('fs');
var path = require('path');

var walkSync = function (rootPath, fileName, exclude) {
    var results = [];
    var queue = [];
    var next = rootPath;
    var pattern = typeof fileName === 'string' ? `^${fileName}$` : fileName;
    var regex = new RegExp(pattern, 'i');

    function dirname(f) {
        var parts = path.dirname(f).split(path.sep);
        return parts[parts.length - 1];
    }

    while (next) {
        try {
            let list = fs.readdirSync(next);
            list.forEach(function (i) {
                var item = path.join(next, i);

                if (item.indexOf(exclude) > -1) {
                    return;
                }

                try {
                    if (fs.statSync(item).isDirectory()) {
                        queue.push(item)
                        return;
                    }
                } catch (e) {

                }

                if (regex.test(i)) {
                    var fileDirectoryName = dirname(item)
                    var alreadyListedConfig = results.filter(function (f) {
                        return fileDirectoryName === dirname(f)
                    })

                    if (!alreadyListedConfig.length) {
                        results.push(item)
                    }
                }
            })
        } catch (e) {

        }

        next = queue.shift()
    }

    return results
}

module.exports = walkSync;