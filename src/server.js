const Hapi = require('hapi');
const path = require('path');
const nconf = require('nconf');
const server = new Hapi.Server();
server.connection({ port: process.env.PORT || 5000});

const isProd = nconf.get('PRODUCTION');

const DEV_STATICS = path.join(__dirname, '../', 'static');
const PROD_STATICS = path.join(__dirname, '../', 'node_modules/mbui');

let STATICS_DIR = isProd ? PROD_STATICS : DEV_STATICS;

const hapiPlugins = [{
    register: require('inert'),
    options: {}
}];

function start(cb) {
    server.register(hapiPlugins, () => {
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
            path: '/',
            handler: function (request, reply) {
                reply.file(STATICS_DIR + '/index.html');             
            }
        });



        server.route({
            method: 'GET',
            path: '/{param*}',
            handler: {
                directory: {
                    path: STATICS_DIR,
                    listing: true
                }
            }
        })

        server.route({
            method: 'GET',
            path: '/test',
            handler: (req, res) => res('ok!')
        });
        server.start((err) => {
            if (err) {
                return cb(err);
            }
            return cb(null);
        });
    });
}

module.exports = {
    start
};