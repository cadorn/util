

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

var UTIL = require("util");
var FILE = require("file");
var OS = require("os");
var SEMVER = require("./semver");

var Git = exports.Git = function(path) {
    if (!(this instanceof exports.Git))
        return new exports.Git(path);
    this.cache = {};
    this.path = path;
    this.checkInitialized();
}

Git.prototype.checkInitialized = function() {
    this.rootPath = null;
    if(this.path.exists()) {
        try {
            var result = this.runCommand('git rev-parse --git-dir');
            if(result && result.substr(0,27)!="fatal: Not a git repository") {
                this.rootPath = FILE.Path(result).dirname();
                if(this.rootPath.valueOf()==".") {
                    this.rootPath = this.path.join(this.rootPath);
                }
            }
        } catch(e) {}
    }
    return this.initialized();
}

Git.prototype.initialized = function() {
    return (this.rootPath!==null);
}

Git.prototype.getType = function() {
    return "git";
}

Git.prototype.getPath = function() {
    return this.path;
}

Git.prototype.getRootPath = function() {
    if(!this.initialized()) return false;
    return this.rootPath;
}

Git.prototype.getPathPrefix = function() {
    var path = this.getRootPath().join(".").relative(this.getPath()).valueOf();
    if(path.substr(path.length-1,1)=="/") {
        path = path.substr(0, path.length-1);
    }
    return FILE.Path(path);
}

Git.prototype.init = function() {
    if(this.initialized()) {
        throw new Error("Repository already initialized at: " + this.getPath());
    }
    this.getPath().mkdirs();
    this.runCommand("git init");
    if(!this.checkInitialized()) {
        throw new Error("Error initializing repository at: " + this.getPath());
    }
}

Git.prototype.runCommand = function(command) {

    command = "cd " + this.path.valueOf() + "; " + command;
    
    var process = OS.popen(command);
    var result = process.communicate();
    var stdout = result.stdout.read();
    var stderr = result.stderr.read();
    if (result.status === 0 || (result.status==1 && !stderr)) {
        return UTIL.trim(stdout);
    }
    throw new Error("Error running command (status: "+result.status+") '"+command+"' : "+stderr);
}


Git.prototype.getLatestVersion = function(majorVersion, path) {
    if(!this.initialized()) {
        throw new Error("Not initialized!");
    }
    var result = this.runCommand('git tag -l "' + ((path)?path+"/":"") + 'v*"');
    if(!result) {
        return false;
    }
    var versions = UTIL.map(result.split("\n"), function(version) {
        if(path) {
            return UTIL.trim(version).substr(path.length+2);
        } else {
            return UTIL.trim(version).substr(1);
        }
    });
    return SEMVER.latestForMajor(versions, majorVersion);
}


Git.prototype.getLatestRevisionForBranch = function(branch) {
    if(!this.initialized()) {
        throw new Error("Not initialized!");
    }

    var result = this.runCommand('git log --no-color --pretty=format:"%H" -n 1 ' + branch);
    if(!result) {
        return false;
    }
    return UTIL.trim(result);
}

Git.prototype.getFileForRef = function(revision, path) {
    if(!this.initialized()) {
        throw new Error("Not initialized!");
    }
    var path = this.getPathPrefix().join(path);
    if(path.substr(0,1)=="/") path = path.substr(1);
    var result = this.runCommand('git show ' + revision + ':' + path);
    if(!result) {
        return false;
    }
    return result;
}

Git.prototype.getRepositories = function() {
    if(!this.initialized()) {
        throw new Error("Not initialized!");
    }
    if(this.cache.repositories) {
        return this.cache.repositories;
    }
    var result = this.runCommand('git remote show');
    if(!result) {
        return false;
    }
    var remotes = UTIL.trim(result).split("\n"),
        self = this,
        repositories = [];
    remotes.forEach(function(name) {
        result = self.runCommand('git remote show -n ' + name);
        repositories.push(new RegExp("^. remote " + name + "\n  URL: ([^\n]*)\n").exec(result)[1]);
    });
    this.cache.repositories = repositories;
    return repositories;
}

Git.prototype.add = function(path) {
    if(!this.initialized()) {
        throw new Error("Not initialized!");
    }
    var result = this.runCommand("git add " + OS.enquote(path));
    if(result!="") {
        throw new Error("Error adding file at path: " + path);
    }
    return true;
}

Git.prototype.commit = function(message) {
    if(!this.initialized()) {
        throw new Error("Not initialized!");
    }
    var result = this.runCommand("git commit -m " + OS.enquote(message));
    if(!result) {
        throw new Error("Error comitting");
    }
    if(!/\d* files changed, \d* insertions\(\+\), \d* deletions\(-\)/g.test(result)) {
        throw new Error("Error comitting: " + result);
    }
    // TODO: Parse result info
    return true;
}

Git.prototype.remoteAdd = function(name, url) {
    if(!this.initialized()) {
        throw new Error("Not initialized!");
    }
    var result = this.runCommand("git remote add " + OS.enquote(name) + " " + OS.enquote(url));
    if(result!="") {
        throw new Error("Error adding remote");
    }
    return true;
}

Git.prototype.push = function(name, branch) {
    if(!this.initialized()) {
        throw new Error("Not initialized!");
    }
    var result = this.runCommand("git push " + OS.enquote(name) + " " + OS.enquote(branch));
    if(result!="") {
        throw new Error("Error pusing");
    }
    return true;
}

Git.prototype.clone = function(url) {
    if(this.initialized()) {
        throw new Error("Repository already initialized at path: " + this.getPath());
    }
    var result = this.runCommand("git clone " + OS.enquote(url) + " .");
    if(!/^Initialized empty Git repository/.test(result)) {
        throw new Error("Error cloning repository from: " + url);
    }
    if(!this.checkInitialized()) {
        throw new Error("Error verifying cloned repository at: " + this.getPath());
    }
    return true;
}

Git.prototype.getActiveBranch = function() {
    if(!this.initialized()) {
        throw new Error("Not initialized!");
    }
    var result = this.runCommand("git branch"),
        m;
    if(!result) {
        throw new Error("Error listing branches");
    } else
    if(!(m = result.match(/\n?\*\s(\w*)\n?/))) {
        throw new Error("Error parsing active branch");
    }
    return m[1];
}


Git.prototype.getStatus = function() {
    if(!this.initialized()) {
        throw new Error("Not initialized!");
    }
    var result = this.runCommand("git status"),
        m;
    if(!result) {
        throw new Error("Error listing status");
    }
    var info = {
            "ahead": false,
            "dirty": true
        },
        lines = result.split("\n"),
        index = 0;

    if(m = lines[index].match(/^# On branch (.*)$/)) {
        info.branch = m[1];
    }
    index++;

    if(m = lines[index].match(/^# Your branch is ahead of /)) {
        info.ahead = true;
        index += 2;
    }

    if(m = lines[index].match(/^nothing to commit \(working directory clean\)$/)) {
        info.dirty = false;
    }
    
    return info;
}

