'use strict';

/*
    To demonstrate to myself the use of EventEmitters and Promises.
    Note that I tried to use 'async function' to wrap the response in a Promise, but it didn't work as expected.
 */

require('es6-promise').polyfill();
var events = require('events'),
    util = require('util');
var fs = require('fs');

function DirWatcher(watchedDir) {
    this.watchedDir = watchedDir;
}

util.inherits(DirWatcher, events.EventEmitter);

DirWatcher.prototype.getFiles = function () {
    return new Promise((resolve, reject) => {
        fs.readdir(this.watchedDir, (err, files) => {
            if (err) reject(err); else resolve(files);
        })
    })
};

DirWatcher.prototype.start = function () {
    console.log('Watching ' + this.watchedDir);
    let watcher = this;
    fs.watchFile(this.watchedDir, function () {
        watcher.emit('get-files');
    })
};

const watcher = new DirWatcher('/home/bill/tmp');

watcher.on('get-files', function () {
    watcher.getFiles().then(files => {
        console.log(files);
    });
});

watcher.start();
