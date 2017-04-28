const Trooper = require('./libmb/Trooper.js');
const q = require('q');
const request = require('request');
const _ = require('underscore');

const server = require('./src/server.js');

server.start(err => {
    if(err){
        return console.log(err);
    }
    console.log('server started');

    request.post({
        url: 'http://localhost:5000/check',
        json: true,
        body: {
            name: 'trooper7',
            pass: 'pass1'
        }
    }, (a, resp, body) => {
        console.log(body);
    });
});