const Trooper = require('../../libmb/Trooper.js');

module.exports = function (request, reply) {
        if(!request.payload.name){
            reply({error: true})
        }

        const {name, pass, domain} = request.payload;

        const trooperConfig = {
          domain: domain || "com",
          name: name,
          pass: pass
        };
        console.log(trooperConfig);
        const trooper = new Trooper(trooperConfig);  
        trooper.auth().then(reply, reply);
};