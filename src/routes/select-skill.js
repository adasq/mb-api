const Trooper = require('../../libmb/Trooper.js');
const _ = require('underscore');

module.exports = function (request, reply) {
        if(!_.isObject(request.payload.trooper)){
            reply({error: true})
        }

        const { name, pass, domain } = request.payload.trooper;
        const { skillId } = request.payload;

        const trooperConfig = {
          domain: domain || 'com',
          name: name,
          pass: pass
        };
        console.log(trooperConfig, skillId);
        const trooper = new Trooper(trooperConfig);  
        trooper.auth().then(result => {
           if (result.code === 201) {
              trooper.selectSkill(0, skillId).then(
                (result) => {
                  console.log(result);
                  reply(result);
                },
                (err) => {
                  reply(err);
                }
              );
           }else {
             reply(result);
           }
        }, reply);
};