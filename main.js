const nconf = require('nconf');

nconf.argv()
    .env()
    .file({ file: './config.json' });

const serviceAccount = require("./credentials.json");
const admin = require("firebase-admin");
const kue = require('kue');
const play = require('./src/play.js');
const selectSkill = require('./src/select-skill.js');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://test-8c34c.firebaseio.com"
});

const queue = kue.createQueue({
    redis: {
        port: 14880,
        host: nconf.get('REDIS_HOST'),
        auth: nconf.get('REDIS_PSWD')
    }
});
kue.app.listen(3000);

const STATE = {
    DEFAULT: 0,
    PLAYING: 1,
    UPGRADE_AVAILABLE: 2,
    UPGRADE_NOT_AVAILABLE: 3,
    SKILL_SELECTING: 4,
    SKILL_SELECTED: 5,
    ERROR: 6
};

queue.process('play', function (job, done) {
    console.log('start playing', job.data);
    console.time(job.id);
    play(job.data, (err, result) => {
        console.timeEnd(job.id);
        if (err) {
            console.log('ERR', job.data.name, err);
            admin.database().ref('results/' + job.data.name).set({
                state: STATE.ERROR,
                error: err
            });
        } else {
            let newResult = {};
            if (result.code) {
                newResult.state = STATE.ERROR;
                newResult.error = result.message;
            } else {
                newResult = result;
                newResult.state = result.upgrade ? STATE.UPGRADE_AVAILABLE : STATE.UPGRADE_NOT_AVAILABLE;
            }
            newResult.lastUpdated = Date.now();
            admin.database().ref('results/' + job.data.name).set(newResult);
        }
        done();
    });
});

queue.process('selectSkill', function (job, done) {
    console.log('start skill selecting', job.data);
    selectSkill(job.data, (result) => {
        let newResult = {};
        console.log(result);

        if (result.code && result.code === 201) {
            newResult = result;
            newResult.state = STATE.SKILL_SELECTED;
        } else {
            newResult.state = STATE.ERROR;
            newResult.error = result.message;
        }

        newResult.lastUpdated = Date.now();
        console.log(newResult);
        admin.database().ref('results/' + job.data.name).set(newResult);
        done();
    })
});

function addPlayJob(data) {
    var job = queue.create('play', data).removeOnComplete( true ).save(function (err) {
        // if( !err ) console.log( job.id );
    });
}
function addSelectSkillJob(data) {
    var job = queue.create('selectSkill', data).removeOnComplete( true ).save(function (err) {
        // if( !err ) console.log( job.id );
    });
}

admin.database().ref('/queue').orderByChild('state').limitToLast(2).endAt().on('child_added', (snapshot) => {
    var upvotesRef = admin.database().ref(`/queue/${snapshot.key}/state`).transaction(function (current_value) {
        if (!current_value) {
            return 'defined';
        } else {
            return;
        }
    }, (err, committed) => {
        if (err) return console.log('err:', err);
        if (committed) {
            addPlayJob({ name: snapshot.key });
        } else {
            console.log('ignoring', snapshot.key);
        }
    });
});

//=============================================

admin.database().ref('/queue2').orderByChild('state').limitToLast(2).endAt().on('child_added', (snapshot) => {
    var upvotesRef = admin.database().ref(`/queue2/${snapshot.key}/state`).transaction(function (current_value) {
        if (!current_value) {
            return 'defined';
        } else {
            return;
        }
    }, (err, committed) => {
        if (err) return console.log('err:', err);
        if (committed) {
            addSelectSkillJob({ name: snapshot.key, skillId: snapshot.val().skillId });
        } else {
            console.log('ignoring', snapshot.key);
        }
    });
});

const server = require('./src/server.js');

server.start(err => {
    if (err) {
        return console.log(err);
    }
    console.log('server started');
});


