

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var UTIL = require("util");
var URI = require("uri");
var FILE = require("file");
var STREAM = require('term').stream;


exports.validate = function(type, value, options) {

    options = options || {};
    
    value = UTIL.trim(value);

    if(typeof options["throw"] == "undefined") options["throw"] = true;
    
    if(type=="url") {
        if(typeof value != "string") {
            if(!options["throw"]) return false;
            throw new ValidationError("Not a string!");
        }
        
        var uri = URI.parse(value);

        if(!uri.scheme) {
            if(!options["throw"]) return false;
            throw new ValidationError("No URL scheme set!");
        }
        if(!uri.authority) {
            if(!options["throw"]) return false;
            throw new ValidationError("No URL domain[:port] set!");
        }
        if(options["require"]) {
            UTIL.forEach(options["require"], function(info) {
                var name = info,
                    rOptions = {};
                if(UTIL.isArrayLike(info)) {
                    name = info[0];
                    rOptions = info[1];
                }
                if(name=="path") {
                    if(!uri.path) {
                        if(!options["throw"]) return false;
                        throw new ValidationError("No URL path set!");
                    }
                    if(rOptions.trailingSlash && uri.path.substr(uri.path.length-1,1)!="/") {
                        if(!options["throw"]) return false;
                        throw new ValidationError("URL path does not have a trailing slash!");
                    }
                }
            });
        }
        
        if(options["return"]=="uri") {
            return uri;
        }
        return value;
    } else
    if(type=="email") {
        if(!/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(value)) {
            if(!options["throw"]) return false;
            throw new ValidationError("Invalied email address!");
        }
        return value;
    } else
    if(type=="string") {
        if(value=="") {
            if(!options["throw"]) return false;
            throw new ValidationError("String is empty!");
        }
        return value;
    } else
    if(type=="path") {
        if(!value) {
            if(!options["throw"]) return false;
            throw new ValidationError("No path provided!");
        }
        if(options["dropTrailingSlash"] && value.substr(value.length-1,1)=="/") {
            value = value.substr(0,value.length-1);
        }
        return value;
    } else
    if(type=="directory") {
        if(!value) {
            if(!options["throw"]) return false;
            throw new ValidationError("No path provided!");
        }
        var file = FILE.Path(value);
        if(options.makeAbsolute && !FILE.isAbsolute(file)) {
            file = FILE.Path(FILE.cwd()).join(file);
        }
        if(!file.exists()) {
            if(!options["throw"]) return false;
            throw new ValidationError("Path does not exist!");
        }
        if(!file.isDirectory()) {
            if(!options["throw"]) return false;
            throw new ValidationError("Path is not a directory!");
        }
        if(options["return"]=="FILE.Path") {
            return file;
        }
        return value;
    }
}

var ValidationError = exports.ValidationError = function(message) {
    this.name = "ValidationError";
    this.message = message;

    // this lets us get a stack trace in Rhino
    if (typeof Packages !== "undefined")
        this.rhinoException = Packages.org.mozilla.javascript.JavaScriptException(this, null, 0);
}
ValidationError.prototype = new Error();


function getDefault(options, defaultValue) {
    if(typeof options["default"] != "undefined") return options["default"];
    return defaultValue;
}


