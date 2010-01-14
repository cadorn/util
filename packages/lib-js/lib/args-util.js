
var ERROR = require("./error");

exports.printError = function(error) {
    ERROR.print(error, {
        "severity": "ERROR"
    });
}
