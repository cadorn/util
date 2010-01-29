
const INCLUDE_NOTES = false;

var STREAM = require('term').stream;
var UTIL = require("util");


exports.print = function(error, options) {

    options = options || {};
    options.severity = options.severity || "LOG";

    var color = (options.severity=="ERROR")?
                    "red" :
                    (options.severity=="WARN")?
                        "orange":"white";    
    
    STREAM.print("  \0"+color+"(* "+options.severity+" ***************************************************************************\0)");
    STREAM.print("  \0"+color+"(*\0) Error: \0"+color+"(\0bold(" + ((typeof error.message !="undefined")?error.message:error) + "\0)\0)");
    STREAM.print("  \0"+color+"(*\0) File : \0cyan(\0bold(" + error.fileName + "\0)\0)");    
    STREAM.print("  \0"+color+"(*\0) Line : \0yellow(\0bold(" + error.lineNumber + "\0)\0)");
    if(error.stack) {
        STREAM.print("  \0"+color+"(*\0) Stack:");
        UTIL.forEach(error.stack.split("\n"), function(line) {
            STREAM.print("  \0"+color+"(*\0)        " + line);
        });
    }

    if(error.rhinoException) {
        STREAM.print("  \0"+color+"(*\0) Rhino Exception:");
        UTIL.forEach(error.rhinoException.getScriptStackTrace().split("\n"), function(line) {
            STREAM.print("  \0"+color+"(*\0)        " + line);
        });
    }

    if(INCLUDE_NOTES && error.notes) {
        STREAM.print("  \0"+color+"(*\0) Notes:");
        
        // TODO: Use better dumper to catch circular references etc...
        var dump = JSDUMP.parse(error.notes);
        
        UTIL.forEach(dump.split("\n"), function(line) {
            STREAM.print("  \0"+color+"(*\0)        " + line);
        });
    }
    
    STREAM.print("  \0"+color+"(* "+options.severity+" ***************************************************************************\0)");    
    
}
