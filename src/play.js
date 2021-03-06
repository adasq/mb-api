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
    trooper.auth().then(function (result) {
        console.log(data.name, result);
        if (result.code === 201) {
            var fightPromises = [
                trooper.state.battlesAvailable && trooper.makeBattles(),
                trooper.state.missionAvailable && trooper.makeMissions(),
                trooper.state.raidAvailable && trooper.makeRaids()
            ];
            fightPromises = _.compact(fightPromises);
            var fightPromise = q.all(fightPromises);
            fightPromise.then(function (fightResponse) {
                console.log(data.name, 'fightResponse');
                var promise = trooper.getTrooperSkillList(0);
                promise.then(function (skillList) {
                    console.log(data.name, 'skillList');
                    var promise = trooper.upgrade(0);
                    promise.then(result => {
                        console.log(data.name, 'upgrade');
                        _.each(skillList.skills, (skill) => {
                            skill.style = skill.style.replace("url('/img/", "url('/assets/");
                        });
                        if (result === 501) {
                            var promise = trooper.getTrooperUpgradeSkillList(0);
                            promise.then(upgradeSkillList => {
                                cb(null, {
                                    fight: fightResponse,
                                    skills: skillList,
                                    upgrade: upgradeSkillList
                                });
                            }, () => {
                                connectionError(cb);
                            });
                        } else {
                            cb(null, {
                                fight: fightResponse,
                                skills: skillList,
                                upgrade: null
                            });
                        }
                    }, () => {
                        connectionError(cb);
                    });
                }, () => {
                    connectionError(cb)
                });
            }, () => {
                connectionError(cb)
            });
        } else {
            cb(null, result);
        }
    }, () => {
        connectionError(cb)
    });
};

function connectionError(cb) {
    console.log(':X');
    cb('connection error');
}