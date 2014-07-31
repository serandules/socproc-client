var Client = require('./lib/client');

module.exports = function (id, agent, options) {
    return new Client(id, agent, options);
};
