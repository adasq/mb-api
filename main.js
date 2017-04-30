const server = require('./src/server.js');
const nconf = require('nconf');

 nconf.argv()
   .env()
   .file({ file: './config.json' });

server.start(err => {
    if(err) {
        return console.log(err);
    }
    console.log('server started');
});