const Hapi = require('hapi');
const path = require('path');
const nconf = require('nconf');
const server = new Hapi.Server();
const pkginfo = require('pkginfo');
const muib = pkginfo.read({}, 'muib').package;

server.connection({ port: process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 5000});

const isProd = nconf.get('PRODUCTION');

const DEV_STATICS = path.join(__dirname, '../', 'static');
const PROD_STATICS = path.join(__dirname, '../', 'node_modules/muib');

let STATICS_DIR = path.join(__dirname, '../', 'static2'); //isProd ? PROD_STATICS : DEV_STATICS;


const admin = require("firebase-admin");

// admin.database().ref('/lists').orderByChild('state').limitToLast(2).endAt().on('child_added', (snapshot) => {
//     console.log('snapshot');
//     const data = snapshot.val();
//     console.log(snapshot.key, data);
// });


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
            path: '/api/upload',
            handler: (request, reply) => {
                var newPostRef = admin.database().ref('/lists').push();
                newPostRef.set({
                    list: request.payload
                }).then(() => {
                    reply({err: false, id: newPostRef.key});
                }, () => {
                    reply({err: true});
                });
            }
        });

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
	            uri: 'http://mini-botters.rhcloud.com/{a}'
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





server.route({
    method: 'POST',
    path: '/submit',
    config: {

       payload: {
            output: 'stream',
            allow: 'multipart/form-data' // important
        },

        handler: function (request, reply) {
          
            var data = request.payload;
          
            if (data.file) {
                 
                var name = data.file.hapi.filename;
                console.log(name)
                var path = path.join(__dirname, name);
                var file = fs.createWriteStream(path);
                console.log(path);
                file.on('error', function (err) { 
                    console.error(err) 
                });

                data.file.pipe(file);

                data.file.on('end', function (err) { 
                    var ret = {
                        filename: data.file.hapi.filename,
                        headers: data.file.hapi.headers
                    }
                    reply(JSON.stringify(ret));
                })
            }

        }
    }
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