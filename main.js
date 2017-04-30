const nconf = require('nconf');

 nconf.argv()
   .env()
   .file({ file: './config.json' });

const server = require('./src/server.js');

server.start(err => {
    if(err) {
        return console.log(err);
    }
    console.log('server started');
});