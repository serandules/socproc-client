var https = require('https');
var util = require('util');
var io = require('socket.io-client');
var fs = require('fs');
var events = require('events');
var Executor = require('./executor');
var Request = require('./request');

//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

/*var agent = new https.Agent({
 ca: fs.readFileSync('ssl/hub.cert')
 });*/
var requests = [];

var findById = function (id) {
    var request = null;
    requests.every(function (req) {
        if (req.id !== id) {
            return true;
        }
        request = req;
        return false;
    });
    return request;
};

var Client = function (id, agent, options) {
    this.id = id;
    var hub = io('wss://' + options.server + '/socproc-' + id, {
        transports: ['websocket'],
        agent: agent
    });
    var that = this;
    var exec = new Executor(hub);
    //console.log('wss://' + agent.server + '/socproc-' + id);
    hub.once('connect', function (socket) {
        console.log('connected');
        that.emit('connect', exec);
        hub.on('disconnect', function () {
            console.log('disconnect');
            that.emit('disconnect');
        });
        hub.on('start', function (data) {
            console.log('start request : ' + data.id);
            var req = new Request(data.id, hub);
            requests.push(req);
            //console.log(data);
            exec.start(req, data);
        });
        hub.on('data', function (data) {
            console.log(data);
            console.log('data request : ' + data.id);
            var req = findById(data.id);
            req.receive(data);
        });
        /*hub.on('end', function (data) {
         console.log(data);
         var req = findById(data.id);
         requests.splice(requests.indexOf(req), 1);
         exec.emit(data.event, req, data.data);
         });*/
    });
    this.hub = hub;
};

util.inherits(Client, events.EventEmitter);

module.exports = Client;

Client.prototype.receive = function (data) {

};