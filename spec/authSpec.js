const Trooper = require('../libmb/Trooper.js');
const { assert, expect } = require('chai');
const nconf = require('nconf');

 nconf.argv()
   .env()
   .file({ file: './config.json' });
   
const NOT_EXISTS_NAME = nconf.get('NOT_EXISTS_NAME');
const PROTECTED_NAME = nconf.get('PROTECTED_NAME');
const PROTECTED_PSWD = nconf.get('PROTECTED_PSWD');
const NOT_PROTECTED_NAME = nconf.get('NOT_PROTECTED_NAME');

function createTrooper(trooperConfig){
    return new Trooper(trooperConfig);  
}

describe('auth()', function() {
   describe('501 for non existing account', () => {
        let expectedResult;
        beforeEach(() => {
            expectedResult = {
                code: 501,
                message: 'Trooper does not exists'
            };
        })
        it('w/o password', () => {
            const trooper = createTrooper({
                domain: 'com',
                name: NOT_EXISTS_NAME
            });
            return trooper.auth().then((result) => {
                expect(result).to.deep.equal(expectedResult);
            });
        });
        it('with password', () => {
            const trooper = createTrooper({
                domain: 'com',
                name: NOT_EXISTS_NAME,
                pass: 'test'
            });
            return trooper.auth().then((result) => {
                expect(result).to.deep.equal(expectedResult);
            });
        });
        it('with valid long name', () => {
            const trooper = createTrooper({
                domain: 'com',
                name: 'this-is-a-too-long-name-with-37-signs'
            });
            return trooper.auth().then((result) => {
                expect(result).to.deep.equal(expectedResult);
            });
        });
        it('with valid long name with pass', () => {
            const trooper = createTrooper({
                domain: 'com',
                name: 'this-is-a-too-long-name-with-37-signs',
                pass: ':)'
            });
            return trooper.auth().then((result) => {
                expect(result).to.deep.equal(expectedResult);
            });
        });            
    });
    describe('201 for successfull authorized', () => {
        let expectedResult;
        beforeEach(() => {
            expectedResult = {
                code: 201,
                message: 'Successfully authorized'
            };
        });
        it('existing with password', () => {
            const trooper = createTrooper({
                domain: 'com',
                name: PROTECTED_NAME,
                pass: PROTECTED_PSWD
            });
            return trooper.auth().then(result => {
                expect(result).to.deep.equal(expectedResult);
            });
        });
        it('existing w/o password', () => {
            const trooper = createTrooper({
                domain: 'com',
                name: NOT_PROTECTED_NAME
            });
            return trooper.auth().then(result => {
                expect(result).to.deep.equal(expectedResult);
            });
        });
    });
    describe('21 for wrong password', () => {
        let expectedResult;
        beforeEach(() => {
            expectedResult = {
                code: 21,
                message: 'Wrong Password'
            };
        });
        it('existing with wrong password', () => {
            const trooper = createTrooper({
                domain: 'com',
                name: PROTECTED_NAME,
                pass: ':)'
            });
            return trooper.auth().then(result => {
                expect(result).to.deep.equal(expectedResult);
            });
        });
    });
    describe('46 for password required', () => {
        let expectedResult;
        beforeEach(() => {
            expectedResult = {
                code: 46,
                message: 'You need to authorize'
            };
        });
        it('w/o password', () => {
            const trooper = createTrooper({
                domain: 'com',
                name: PROTECTED_NAME
            });
            return trooper.auth().then(result => {
                expect(result).to.deep.equal(expectedResult);
            });
        });
    });
    describe('66 for invalid name', () => {
        let expectedResult;
        beforeEach(() => {
            expectedResult = {
                code: 66,
                message: 'Name is invalid'
            };
        });
        it('w/o password', () => {
            const trooper = createTrooper({
                domain: 'com',
                name: 'this is a too long name with 37 signs'
            });
            return trooper.auth().then((result) => {
                expect(result).to.deep.equal({
                    payload: 'this-is-a-too-lo',
                    code: expectedResult.code,
                    message: expectedResult.message
                });
            });
        });
        it('with password', () => {
            const trooper = createTrooper({
                domain: 'com',
                name: 'this is a too long name with 37 signs',
                pass: ':)'
            });
            return trooper.auth().then((result) => {
                expect(result).to.deep.equal({
                    payload: 'this-is-a-too-lo',
                    code: expectedResult.code,
                    message: expectedResult.message
                });
            });
        });        
    });
});