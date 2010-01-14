
exports.testJsonStore = require("./json-store");
exports.testSemver = require("./semver");

if (require.main == module) {
    require("os").exit(require("test").run(exports));
}