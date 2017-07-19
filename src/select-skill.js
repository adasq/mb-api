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
        const { skillId } = data;

        const trooper = new Trooper(trooperConfig);  
        trooper.auth().then(result => {
           if (result.code === 201) {
              trooper.selectSkill(0, skillId).then(
                (result) => {
                  cb(result);
                },
                (err) => {
                  cb(err);
                }
              );
           }else {
             cb(result);
           }
        }, cb);
};