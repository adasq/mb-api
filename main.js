const server = require('./src/server.js');

server.start(err => {
    if(err) {
        return console.log(err);
    }
    console.log('server started');
});