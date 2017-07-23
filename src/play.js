const Trooper = require('../libmb/Trooper.js');
const q = require('q');
const _ = require('underscore');

module.exports = function (data, cb) {
        
        var trooperConfig = {
          domain: "com",
          opponent: "nopls",
          name: data.name,
          pass: data.pass || undefined
        };
       
        const trooper = new Trooper(trooperConfig);  
         trooper.auth().then(function(result) {
            console.log(trooper.state);
           if(result.code === 201){
                var fightPromises = [
                    !trooper.state.battles && trooper.makeBattles(), 
                    !trooper.state.mission && trooper.makeMissions(),
                    !trooper.state.raid && trooper.makeRaids()
                ];

                fightPromises = _.compact(fightPromises);
                var fightPromise = q.all(fightPromises);
                fightPromise.then(function(fightResponse){
                    var promise = trooper.getTrooperSkillList(0);
                    promise.then(function(skillList){                     
                    var promise = trooper.upgrade(0);
                    promise.then(result => {
                      _.each(skillList.skills, (skill) => {
                            skill.style = skill.style.replace("url('/img/", "url('/assets/");
                        });
                     if(result === 501) {
                         var promise = trooper.getTrooperUpgradeSkillList(0);
                         promise.then( upgradeSkillList => {                            
                             cb({
                                 fight: fightResponse,
                                 skills: skillList,
                                 upgrade: upgradeSkillList
                                });
                        });
                     }else {
                        cb({
                            fight: fightResponse,
                            skills: skillList,
                            upgrade: null
                        });
                     }
                    });
                  });
                }, () => {
                    connectionError(cb)
                });
           }else {
                console.log('err')
               cb(result);
           }
        }, () => {
            console.log('err')
        });
};

function connectionError(cb) {
               cb({
                   err: -1,
                   msg: 'connection error'
               });
}