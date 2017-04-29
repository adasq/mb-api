const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: process.env.PORT || 5000});

server.route({
    method: 'POST',
    path: '/play',
    handler: require('./routes/play.js')
});

server.route({
    method: 'POST',
    path: '/check',
    handler: require('./routes/check.js')
});

server.route({
    method: 'GET',
    path: '/test',
    handler: (req, res) => res('ok!')
});

function start(cb) {
    server.start((err) => {
        if (err) {
            return cb(err);
        }
        return cb(null);
    });
}

module.exports = {
    start
};