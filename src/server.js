const Hapi = require('hapi');
const path = require('path');
const nconf = require('nconf');
const server = new Hapi.Server();
const pkginfo = require('pkginfo');
const muib = pkginfo.read({}, 'muib').package;

server.connection({ port: process.env.PORT || 5000});

const isProd = nconf.get('PRODUCTION');

const DEV_STATICS = path.join(__dirname, '../', 'static');
const PROD_STATICS = path.join(__dirname, '../', 'node_modules/muib');

let STATICS_DIR = isProd ? PROD_STATICS : DEV_STATICS;





console.log('STATICS_DIR: ', STATICS_DIR);

const hapiPlugins = [{
    register: require('inert'),
    options: {}
}, {
    register: require('h2o2'),
    options: {}
}]

function start(cb) {
    server.register(hapiPlugins, () => {
        server.route({
            method: 'POST',
            path: '/api/play',
            handler: require('./routes/play.js')
        });
	server.route({
	    method: 'GET',
	    path: '/tension/{a}',
	    handler: {
	        proxy: {
	            uri: 'http://mini2-botters.rhcloud.com/{a}'
	        }
	    }
	});
        server.route({
            method: 'POST',
            path: '/api/select-skill',
            handler: require('./routes/select-skill.js')
        });        

        server.route({
            method: 'GET',
            path: '/api/version',
            handler: function (request, reply) {
                reply({
                    ui: muib.version
                });             
            }
        });

        server.route({
            method: 'POST',
            path: '/api/check',
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