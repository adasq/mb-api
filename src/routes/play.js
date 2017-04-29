const Trooper = require('../../libmb/Trooper.js');
const q = require('q');
const _ = require('underscore');




module.exports = function (request, reply) {
        console.log(request.payload.name);

        var trooperConfig = {
          domain: "com",
          opponent: "nopls",
          name: request.payload.name,
          pass: request.payload.pass || undefined
        };

        console.log(trooperConfig);

        const trooper = new Trooper(trooperConfig);  
         trooper.auth().then(function(result){
           if(result.code === 201){
            var fightPromises = [trooper.makeBattles(), 
                trooper.makeMissions(),
                trooper.makeRaids()];
                var fightPromise = q.all(fightPromises);
                fightPromise.then(function(fightResponse){
                    var promise = trooper.getTrooperSkillList(0);
                    promise.then(function(skillList){                     
                    console.log('skillList', skillList);
                    var promise = trooper.upgrade(0);
                    promise.then(result => {
                      _.each(skillList.skills, (skill) => {
                            skill.style = skill.style.replace("url('/img/", "url('/assets/");
                        });
                     if(result === 501){
                         var promise = trooper.getTrooperUpgradeSkillList(0);
                         promise.then( upgradeSkillList => {                            
                             reply({
                                 fight: fightResponse,
                                 skills: skillList,
                                 upgrade: upgradeSkillList
                                });
                        });
                     }else {
                        reply({
                            fight: fightResponse,
                            skills: skillList,
                            upgrade: null
                        });
                     }
                    });
                  });
                }, () => {
                    connectionError(reply)
                });
           }else {
               reply(result);
           }
        });
};

function connectionError(reply) {
               reply({
                   err: -1,
                   msg: 'connection error'
               });
}