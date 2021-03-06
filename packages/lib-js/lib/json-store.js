

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

var UTIL = require("util");
var JSON = require("json");

var JsonStore = exports.JsonStore = function(file) {
    if (!(this instanceof exports.JsonStore))
        return new exports.JsonStore(file);

    this.file = file;
}

JsonStore.prototype.exists = function() {
    return this.file.exists();
};

JsonStore.prototype.getFile = function() {
    return this.file;
}

JsonStore.prototype.init = function() {
    if(this.exists()) {
        throw new JsonStoreError("Store exists. Cannot initialize store at: " + this.file);
    }
    this.data = {};
    this.save(true);
};

JsonStore.prototype.set = function() {
    if(arguments.length==1) {
        this.data = arguments[0];
    } else
    if(arguments.length==2) {
        var data = this.get(arguments[0], true, true);
        data[0][data[1]] = arguments[1];
    } else {
        throw new JsonStoreError("Invalid argument count: " + arguments.length);
    }
    this.dirty = true;
    this.save();
};

JsonStore.prototype.remove = function(keysPath) {
    var data = this.get(keysPath, false, true);
    if(!data) {
        return false;
    }
    delete data[0][data[1]];
    this.dirty = true;
    this.save();
    return true;
};

JsonStore.prototype.get = function(keysPath, createObjects, returnWithKey) {
    this.load();
    if(!keysPath) {
        return this.data;
    }
    var keys = [];
    UTIL.forEach(keysPath, function(key) {
        if(UTIL.isArrayLike(key)) {
            keys.push(key.join(""));
        } else {
            keys.push(key);
        }
    });
    var data = this.data,
        key;
    while(true) {
        if(keys.length==1 && returnWithKey===true) {
            return [data, keys.shift()];
        }
        if(keys.length==0) break;
        key = keys.shift();
        if(!data[key]) {
            if(createObjects===true) {
                data[key] = {};
            } else {
                return null;
            }
        }
        data = data[key];
    }
    return data;
};

JsonStore.prototype.has = function(keysPath) {
    return (this.get(keysPath)!==null);
};


JsonStore.prototype.hasFileChanged = function() {
    if(!this.exists()) return false;
    return !(""+this.fileMtime == ""+this.file.mtime());
}

JsonStore.prototype.load = function(force) {
    if(this.dirty && !force) {
        throw new JsonStoreError("Cannot load store. Unsaved data present.");
    }
    if(!this.exists()) {
        throw new JsonStoreError("Cannot load store. Store does not exist on disk at: " + this.file);
    }
    if(this.hasFileChanged()) {
        try {
            this.data = JSON.decode(this.file.read());
        } catch(e) {
            throw new JsonStoreError("Error parsing JSON from file: " + this.file);
        }
        this.fileMtime = this.file.mtime();
    }
    this.dirty = false;
};

JsonStore.prototype.save = function(force) {
    if(!this.exists() && !force) {
        throw new JsonStoreError("Cannot save store. Store does not exist on disk at: " + this.file);
    }
    if(this.hasFileChanged() && !force) {
        throw new JsonStoreError("Cannot save store. Data changed on disk: "+this.file);
    }
    if(!this.dirty && !force) return;
    if(!this.file.dirname().exists()) this.file.dirname().mkdirs();
    this.file.write(JSON.encode(this.data, null, '    '));
    this.fileMtime = this.file.mtime();
    this.dirty = false;
};




var JsonStoreError = exports.JsonStoreError = function(message) {
    this.name = "JsonStoreError";
    this.message = message;

    // this lets us get a stack trace in Rhino
    if (typeof Packages !== "undefined")
        this.rhinoException = Packages.org.mozilla.javascript.JavaScriptException(this, null, 0);
}
JsonStoreError.prototype = new Error();
