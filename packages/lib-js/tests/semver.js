
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

var ASSERT = require("assert");
var SEMVER = require("semver");


exports.testGetMajor = function() {
    
    ASSERT.equal(SEMVER.getMajor("1.0.1"), "1");
    ASSERT.equal(SEMVER.getMajor("1.0.1", true), "1");
    ASSERT.equal(SEMVER.getMajor("1.0.1alpha1", true), "1.0.1alpha");

}

exports.testValidate = function() {

    [
        "0.1.0",
        "0.1.1alpha",
        "1.0.1alpha2",
    ].forEach(function(version) {
        ASSERT.ok(SEMVER.validate(version));
    });

    [
        "0.a.0",
        "0.1a.1alpha",
        "1.0.1al3pha2",
    ].forEach(function(version) {
        ASSERT.ok(!SEMVER.validate(version));        
    });

    [
        "0.1.0",
    ].forEach(function(version) {
        ASSERT.ok(SEMVER.validate(version, {"numericOnly":true}));        
    });

    [
        "0.1.0a",
    ].forEach(function(version) {
        ASSERT.ok(!SEMVER.validate(version, {"numericOnly":true}));        
    });

    [
        "0.1.0a",
    ].forEach(function(version) {
        ASSERT.ok(SEMVER.validate(version, {"withSuffix":true}));        
    });

    [
        "0.1.0",
    ].forEach(function(version) {
        ASSERT.ok(!SEMVER.validate(version, {"withSuffix":true}));        
    });

}

exports.testSort = function() {

    var versions = [],
        result;

    versions = [
        "0.1.0",
        "0.1.1",
        "0.1.1alpha",
        "1.0.0",
        "1.0.1",
        "1.0.1alpha2",
        "1.0.1alpha1",
        "2.0.0",
        "2.0.0rc1",
        "3.0.0beta15",
        "3.0.0beta2",
        "3.0.0alpha1"
    ];
    result = SEMVER.sort(versions);
    ASSERT.deepEqual(result, [
        "0.1.0",
        "0.1.1alpha",
        "0.1.1",
        "1.0.0",
        "1.0.1alpha1",
        "1.0.1alpha2",
        "1.0.1",
        "2.0.0rc1",
        "2.0.0",
        "3.0.0alpha1",
        "3.0.0beta2",
        "3.0.0beta15"
    ]);    
}

exports.testLatestForMajor = function() {
    
    var versions = [],
        version = null,
        result;
    
    result = SEMVER.latestForMajor(versions, version);
    ASSERT.strictEqual(result, false);

    versions = [
        "0.1.0"
    ];
    result = SEMVER.latestForMajor(versions, version);
    ASSERT.equal(result, "0.1.0");
    
    versions = [
        "0.1.0"
    ];
    version = "1.0.0";
    result = SEMVER.latestForMajor(versions, version);
    ASSERT.strictEqual(result, false);
    
    versions = [
        "0.1.0",
        "1.1.0"
    ];
    version = "1.0.0";
    result = SEMVER.latestForMajor(versions, version);
    ASSERT.equal(result, "1.1.0");
    
    versions = [
        "0.1.10",
        "0.1.8",
        "0.1.9"
    ];
    result = SEMVER.latestForMajor(versions);
    ASSERT.equal(result, "0.1.10");
    
    versions = [
        "0.1.0beta",
        "1.1.0"
    ];
    version = "0.1.0";
    result = SEMVER.latestForMajor(versions, version);
    ASSERT.equal(result, false);

    version = "0.1.0alpha";
    result = SEMVER.latestForMajor(versions, version);
    ASSERT.equal(result, "0.1.0beta");

    versions = [
        "0.1.0beta",
        "1.1.0alpha",
        "0.1.0rc2",
        "0.1.0rc1"
    ];
    version = "0.1.0rc1";
    result = SEMVER.latestForMajor(versions, version);
    ASSERT.equal(result, "0.1.0rc2");

    version = "1.0.0a";
    result = SEMVER.latestForMajor(versions, version);
    ASSERT.equal(result, "1.1.0alpha");
}

exports.testLatestForEachMajor = function() {

    var versions = [],
        result;

    versions = [
        "0.1.0",
        "0.1.1",
        "1.0.0",
        "1.0.1",
        "1.0.1alpha"
    ];
    result = SEMVER.latestForEachMajor(versions);
    ASSERT.deepEqual(result, [
        "0.1.1",
        "1.0.1"
    ]);

    versions = [
        "0.1.0",
        "0.1.1alpha",
        "1.0.0",
        "1.0.1alpha2",
        "1.0.1alpha1",
        "2.0.0rc1",
        "2.0.0",
        "3.0.0alpha1",
        "3.0.0beta15",
        "3.0.0beta1"
    ];
    result = SEMVER.latestForEachMajor(versions, true);
    ASSERT.deepEqual(result, [
        "0.1.0",
        "0.1.1alpha",
        "1.0.0",
        "1.0.1alpha2",
        "2.0.0",
        "3.0.0beta15"
    ]);

    versions = [
        "0.3.1beta3",
        "0.3.2beta4"
    ];
    result = SEMVER.latestForEachMajor(versions, true);
    ASSERT.deepEqual(result, [
        "0.3.2beta4"
    ]);

    versions = [
        "0.3.1beta3",
        "0.4.1beta4"
    ];
    result = SEMVER.latestForEachMajor(versions, true);
    ASSERT.deepEqual(result, [
        "0.4.1beta4"
    ]);

    versions = [
        "0.3.1beta3",
        "0.4.1"
    ];
    result = SEMVER.latestForEachMajor(versions, true);
    ASSERT.deepEqual(result, [
        "0.4.1"
    ]);
    
    versions = [
        "0.1.0",
        "0.1.1alpha2",
        "0.1.1beta1"
    ];
    result = SEMVER.latestForEachMajor(versions, true);
    ASSERT.deepEqual(result, [
        "0.1.0",
        "0.1.1beta1"
    ]);    
}

exports.testVersionsForTags = function() {

    var tags = [],
        result;

    tags = [
        "v0.1.0",
        "v0.1.1alpha",
        "v3.0.0alpha1",
        "dd",
        "v3.0.0alpha1dfd"
    ];
    result = SEMVER.versionsForTags(tags);
    ASSERT.deepEqual(result, [
        "0.1.0",
        "0.1.1alpha",
        "3.0.0alpha1"
    ]);
}


if (require.main == module.id)
    require("os").exit(require("test").run(exports));
