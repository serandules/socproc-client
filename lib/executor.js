var util = require('util');
var events = require('events');
var childProcess = require('child_process');
var spawn = childProcess.spawn;
var Request = require('./request');

var requests = [];

var Executor = function (hub) {
    this.hub = hub;
    this.on('spawn', function (req, data) {
        console.log('spawn command : ' + req.id);
        console.log(data);
        spown(data.command, data.args, data.options, req);
    });
};

util.inherits(Executor, events.EventEmitter);

module.exports = Executor;

Executor.prototype.start = function(req, data) {
    this.emit(data.event, req, data.data);
};

var spown = function (command, args, options, req) {
    //console.log('spawn request : ' + req.id);
    var child = spawn(command, args);
    child.stdout.on('data', function (data) {
        console.log('data send : ' + req.id);
        req.send('stdout', String(data));
    });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function (data) {
        console.error(data);
        console.log('data err send : ' + req.id);
        req.send('stderr', data);
    });
    req.on('stdin', function (data) {
        console.log('data stdin received : ' + req.id);
        child.stdin.write(data);
    });
    child.on('exit', function (code, signal) {
        console.log('exit child : ' + req.id);
        req.send('exit', {
            code: code,
            signal: signal
        });
    });
    child.on('close', function (code, signal) {
        console.log('close child : ' + req.id);
        req.send('close', {
            code: code,
            signal: signal
        });
    });
    req.send('started', {
        pid: child.pid
    });
};