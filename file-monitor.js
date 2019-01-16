

function Watcher(watchedDir, processedDir) {
    this.watchedDir = watchedDir;
    this.processedDir = processedDir
}

var events = require('events'),
    util = require('util');

util.inherits(Watcher, events.EventEmitter);

var fs = require('fs');

Watcher.prototype.watch = function() {
    var watcher = this;
    fs.readdir(this.watchedDir, function(err, files) {
        if (err) throw err;
        for(var index in files) {
            watcher.emit('process', files[index]);
        }
    })
}

Watcher.prototype.start = function() {
    var watcher = this;
    fs.watchFile(this.watchedDir, function() {
        watcher.watch();
    });
}

var watcher = new Watcher('/home/bill/tmp', './done');

watcher.on('process', function process(file) {
    var watchFile = this.watchedDir + '/' + file;
    var processedFile = this.processedDir + '/' + file.toLowerCase();
    fs.rename(watchFile, processedFile, function(err) {
        if (err) throw err;
    });
});

watcher.start();

