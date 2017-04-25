const Trooper = require('./libmb/Trooper.js');
const q = require('q');
const _ = require('underscore');

const server = require('./src/server.js');

server.start(err => {
    if(err){
        return console.log(err);
    }
    console.log('server started');
});

return;

const start = +new Date();
play((err, result) => {
    if(err)return console.log(err);
    console.log(result);
    console.log( ((+new Date()) - start)/1000 );
});

function play(cb){
        var trooperConfig = {
          domain: "com",
          opponent: "nopls",
          name: "ziemniaki5"
        };

        const trooper = new Trooper(trooperConfig);  
         trooper.auth().then(function(result){
           if (result.code === 201) {
            var fightPromises = [trooper.makeBattles(), 
                trooper.makeMissions(),
                trooper.makeRaids()];
                var fightPromise = q.all(fightPromises);
                fightPromise.then(function(fightResponse){
                    var promise = trooper.getTrooperSkillList(0);
                    promise.then(function(skillList){                     
                    var promise = trooper.upgrade(0);
                    promise.then(result => {
                      _.each(skillList.skills, (skill) => {
                            skill.style = skill.style.replace("url('/img/", "url('/assets/");
                        });
                     if(result === 501){
                         var promise = trooper.getTrooperUpgradeSkillList(0);
                         promise.then( upgradeSkillList => {                            
                             cb(null, {
                                 fight: fightResponse,
                                 skills: skillList,
                                 upgrade: upgradeSkillList
                                });
                        });
                     }else{
                        cb(null, {
                            fight: fightResponse,
                            skills: skillList
                        });
                     }
                    });
                  });
                });
           }else{
                console.log('err', result, result.message);
           }
        });
}