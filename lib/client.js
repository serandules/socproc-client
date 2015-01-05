var debug = require('debug')('serandules-socproc-client');
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
    var server = io('wss://' + options.server + '/socproc-' + id, {
        transports: ['websocket'],
        agent: agent,
        query: options.query
    });
    var that = this;
    var exec = new Executor(server);
    //debug('wss://' + agent.server + '/socproc-' + id);
    server.once('connect', function (socket) {
        debug('connected');
        that.emit('connect', exec);
        server.on('disconnect', function () {
            debug('disconnect');
            that.emit('disconnect');
        });
        server.on('reconnect', function () {
            that.emit('reconnect', exec);
        });
        server.on('start', function (data) {
            debug('start request : ' + data.id);
            var req = new Request(data.id, server);
            requests.push(req);
            //debug(data);
            exec.start(req, data);
        });
        server.on('data', function (data) {
            debug(data);
            debug('data request : ' + data.id);
            var req = findById(data.id);
            req.receive(data);
        });
        /*hub.on('end', function (data) {
         debug(data);
         var req = findById(data.id);
         requests.splice(requests.indexOf(req), 1);
         exec.emit(data.event, req, data.data);
         });*/
    });
    this.server = server;
};

util.inherits(Client, events.EventEmitter);

module.exports = Client;

Client.prototype.receive = function (data) {

};