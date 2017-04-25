const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: process.env.PORT || 5000});


const routeHandler = require('./routes/play.js');

server.route({
    method: 'POST',
    path: '/play',
    handler: routeHandler
});

server.route({
    method: 'GET',
    path: '/test',
    handler: (req, res) => {
        res({
            aa: 2
        })
    }
});

function start(cb) {

server.start((err) => {
    if (err) {
        return cb(err);
    }
    cb(null);
});
}


module.exports = {
    start
}