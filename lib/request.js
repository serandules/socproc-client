var util = require('util');
var events = require('events');
var uuid = require('node-uuid');

var requests = [];

var Request = function (id, hub) {
    this.id = id;
    this.hub = hub;
};

util.inherits(Request, events.EventEmitter);

module.exports = Request;

Request.prototype.send = function (event, data) {
    this.hub.emit('data', {
        id: this.id,
        event: event,
        data: data
    });
    requests.push(this);
};

Request.prototype.receive = function (data) {
    console.log(data);
    requests.splice(requests.indexOf(this), 1);
    this.emit(data.event, data.data);
};

Request.prototype.end = function (event, data) {

};