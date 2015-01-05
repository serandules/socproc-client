var debug = require('debug')('serandules:socproc-client');
var util = require('util');
var events = require('events');

var requests = [];

var Request = function (id, server) {
    this.id = id;
    this.server = server;
};

util.inherits(Request, events.EventEmitter);

module.exports = Request;

Request.prototype.send = function (event, data) {
    this.server.emit('data', {
        id: this.id,
        event: event,
        data: data
    });
    requests.push(this);
};

Request.prototype.receive = function (data) {
    debug(data);
    requests.splice(requests.indexOf(this), 1);
    this.emit(data.event, data.data);
};

Request.prototype.end = function (event, data) {

};