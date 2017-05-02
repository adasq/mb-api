var URLManager = require('./URLManager');  
var PageParser = require('./PageParser');  
var Request = require('./Request'); 
var request = require('request');
var CookieMessages= require('./CookieMessages'); 
var CookieManager = require('./CookieManager'); 
var NameValidator = require('./NameValidator'); 
var _ = require('underscore');
var q = require('q');


var Trooper = function(config, ao){

	this.urlManager = new URLManager(config);
	var promise, that= this;
	this.req = new Request();	
	this.config = _.extend({}, config);	
};
Trooper.prototype.authSync = function(ao){
		this.chk = ao.chk;
		var newCookie = request.cookie(ao.cookie);
		newCookie.domain = 'minitroopers.com'	
		newCookie.path = '/';
		newCookie.hostOnly= false; 
		this.req.jar.setCookie(newCookie, 'http://minitroopers.com');
};

const AUTH = {
	SUCCESS: 201,
	NOT_EXISTS: 501,
	WRONG_PASSWORD: 21,
	NO_PASSWORD_SET: 46,
	INVALID_NAME: 66,
	REQUEST_ERROR: -111
};

Trooper.prototype.auth = function() {
	let promise;
	return new Promise((resolve, reject) => {
		const {pass, name} = this.config;
		if(pass){
			promise = this.req.post(this.urlManager.getLoginUrl(), {
				login: name, pass
			});
		} else {	 
			promise = this.req.send(this.urlManager.getBaseUrl());
		}
		promise.then(response => {
			let cookie = response.getCookies();
			let code = null;
			if(response.isRedirect()){
				code= CookieManager.getTextByCookie(cookie);
				if(pass){
					if(response.getHeaders().location.indexOf(name) != -1) {
						this.chk = CookieManager.getCHKByCookie(cookie); 
						code= code || AUTH.SUCCESS;
					}else {
						code= AUTH.NOT_EXISTS;
					}
				}else{
					code= code || AUTH.NOT_EXISTS;
				} 
			}else{
				this.chk = CookieManager.getCHKByCookie(cookie);  	
				code = AUTH.SUCCESS;
			}
			if(code === AUTH.SUCCESS && containsPasswordField(response.body)) {
				code = AUTH.NO_PASSWORD_SET;
			}
			resolve({code: code, message: CookieMessages.auth[code]});
		}, (requestErrorCode) => {
			const isValidName = NameValidator.isValid(name);
			if(isValidName) {
				resolve({code: requestErrorCode, message: CookieMessages.auth[requestErrorCode]});
			} else {
				code = AUTH.INVALID_NAME;
				resolve({
					code, 
					payload: NameValidator.host(name),
					message: CookieMessages.auth[code]
				});
			}
		});
	});//promise

	function containsPasswordField(body){
		return body.indexOf('name="pass"') > -1;
	}
};

//==========================================================
Trooper.prototype.getArmyList = function(){ 
	var armyMembersList=[], promiseList= [], list, promise, that=this, parser= new PageParser(), defer= q.defer();

promise = this.req.get(this.urlManager.getTrooperArmyPageList());
promise.then(function(body){
list = parser.getTrooperArmyList(body);
if(!list){
	defer.reject(-66);
}else{
	_.each(list, function(trooperId){
promise = that.req.get(that.urlManager.getTrooperArmyMemberDetalis(trooperId));
promiseList.push(promise);
});
q.all(promiseList).then(function(pages){
	_.each(pages, function(trooperArmyMemberPage){
		 var detalis = parser.getTrooperDetalis(trooperArmyMemberPage);			 
		 armyMembersList.push(detalis);		 
	});
	defer.resolve(armyMembersList);
});
}
}, defer.reject);
return defer.promise;
};
//==========================================================
Trooper.prototype.getTrooperSkillList = function(trooperId){
var parser= new PageParser(), trooper = (trooperId || 0), that= this, defer= q.defer(); 
var promise = this.req.get(this.urlManager.getTrooperUrl(trooper));
promise.then(function(body){ 
	var trooperInfo = parser.getTrooperInfo(body);
	defer.resolve(trooperInfo);
});
		return defer.promise;	
};
//==========================================================


Trooper.prototype.getTrooperUpgradeSkillList = function(trooperId){
var parser= new PageParser(), trooper = (trooperId || 0), that= this, defer= q.defer(); 

var promise = this.req.get(this.urlManager.getTrooperUrl(trooper));
promise.then(function(body){ 
	var availableSkills = parser.getTrooperUpgradeInfo(body);
	defer.resolve(availableSkills);
}); 


		return defer.promise;	
};

//==========================================================

Trooper.prototype.makeBattle = function(opponent){
		var that= this, defer= q.defer(); 
		var data = {
			chk: that.chk,
			friend: opponent || that.config.opponent,
		};
		var promise= this.req.post(this.urlManager.getBattleUrl(), data);
		promise.then(function(response){

			var cookies= response.getCookies();		
			
			if(cookies){
				var msg = null;
				try{
					msg= CookieManager.getMessageByCookie(cookies);
					defer.resolve(msg);
				}catch(err){ 
					defer.resolve(CookieManager.getTextByCookie(cookies));
				};		
			}else{
				defer.resolve(-1);
			}
		}, function(){ 
			console.log("not catched err");
		});
		return defer.promise;	
};

Trooper.prototype.makeRaid = function(){
		var defer= q.defer(); 	
		var promise= this.req.send(this.urlManager.getRaidUrl(this.chk));
		promise.then(function(response){		
			var cookies= response.getCookies();	
			var headers = response.getHeaders();
			if(cookies){
					try{
					msg= CookieManager.getMessageByCookie(cookies);
					defer.resolve(msg);
				}catch(err){ 
					defer.resolve(CookieManager.getTextByCookie(cookies));
				}	
			}else{
				defer.resolve(-174);
			}
		}, function(){ 
			console.log("not catched err");
		});
		return defer.promise;
};
 
Trooper.prototype.upgrade = function(trooper){

		var defer= q.defer(); 	 
		var promise= this.req.send(this.urlManager.getTrooperUpgradeUrl(this.chk, trooper));
		promise.then(function(response){	
			var headers = response.getHeaders();
			var cookies= response.getCookies();	
		 if(cookies){
				var code = CookieManager.getTextByCookie(cookies);
				defer.resolve(code);
			}else{
				switch(headers['location']){
				case ('/levelup/'+(trooper || 0)):				
					defer.resolve(501);
				break;
				case  ('/t/'+(trooper || 0)):
					defer.resolve(503);
				break;
				case  '/hq':
					defer.resolve(504);
				break;
			}
			}			
		}, function(){ 
			console.log("not catched err");
		});
		return defer.promise;
};


Trooper.prototype.makeMission = function(){
		var defer= q.defer(); 	
		var promise= this.req.send(this.urlManager.getMissionUrl(this.chk));
		promise.then(function(response){		
			var cookies= response.getCookies();
			if(cookies){
					try{
					msg= CookieManager.getMessageByCookie(cookies);
					defer.resolve(msg);
				}catch(err){ 
					defer.resolve(CookieManager.getTextByCookie(cookies));
				}	
			}else{
				defer.resolve(-1);
			}
		}, function(){ 
			console.log("not catched err");
		});
		return defer.promise;
};

Trooper.prototype.makeRaids= function(){	 
		var results = [], that= this, defer= q.defer(); 	
		var makeRaid = function(){
			that.makeRaid().then(function(result){ 
				results.push(result);
				if(result === 142){
					defer.resolve(results);
				}else if(result === 46){
					defer.resolve(results);
				}else{
					makeRaid();
				}
			});
		};
		makeRaid();
		return defer.promise;
};

Trooper.prototype.makeBattles= function(){
		var promise= q.all([
		this.makeBattle(),
		this.makeBattle(),
		this.makeBattle()
		]);
		return promise;
};


Trooper.prototype.generateTrooperFamily = function(){
	//=================================================
var generateArmyList = function(trooperConfig2){
  var armyPromise = q.defer(),
  currentTrooper = new Trooper(trooperConfig2),
  authPromise = currentTrooper.auth();
  authPromise.then(function(res){ 
  		if(res.code === 201){
         var promise = currentTrooper.getArmyList();   
          promise.then(armyPromise.resolve, function(){
          armyPromise.resolve([]);
        });    
  		}else{
  			armyPromise.resolve([])
  		}
       
  }, function(){
    armyPromise.resolve([])
  }); 
  return armyPromise.promise;
};
var generateArmyFamily = function(trooperConfig, parent){
  var armyPromise = q.defer();
generateArmyList(trooperConfig).then(function(list){
  if(list.length === 0){
      armyPromise.resolve([]);
  }else{
    var promises= _.map(list, function(army){
      var newTrooperConfig = _.clone(trooperConfig); 
      newTrooperConfig.pass= undefined;
      newTrooperConfig.name= army.name;
      var armyObject = {name: army.name, children: [] };   
      parent.children.push(armyObject); 
      return generateArmyFamily(newTrooperConfig, armyObject);
  });  
    q.all(promises).then(function(){
      armyPromise.resolve(list);
    });
  }
}, function(){
  console.log('eh2')
});
  return armyPromise.promise;
};
//=================================================

  var armyResultPromise = q.defer();
var army = {name: this.config.name, children: []};
generateArmyFamily(this.config, army).then(function(){
	armyResultPromise.resolve(army)
}, armyResultPromise.reject);
return armyResultPromise.promise;
}

Trooper.prototype.selectSkill = function(trooperId, skill) {
	var trooper = (trooperId || 0), that= this, defer= q.defer(); 
	var promise = this.req.send(this.urlManager.getSelectUpgradeSkillUrl(this.chk, trooper, skill));
	promise.then(function(response) {
		var headers= response.getHeaders();	
		var location = headers['location'];	
		var cookies= response.getCookies();
		let code = 510;
		if(cookies) {
			if(headers['location'] === '/hq'){
				code = 201;
			}
		 } else {
		 		if(!location){
		 			 code = 501;
		 		}else{
		 			switch(location){
		 				case ('/t/'+trooper): 
						 	code = 502;
		 				break;
		 			}
		 		}
		}
		defer.resolve({
			code,
			message: CookieMessages.skillSelection[code]
		});
	}, (err) => {
		defer.resolve(err);
	});
	return defer.promise;
};

Trooper.prototype.makeMissions= function(){
		var promise= q.all([
		this.makeMission(),
		this.makeMission(),
		this.makeMission()
		]);
		return promise;
};

Trooper.prototype.toString= function(){
	return "chk: "+this.chk;
};


var preventAuthChecking = ['auth','authSync', 'toString', 'generateTrooperFamily'],
checkAuth = function(){	 
	return !!this.chk;
};
 
_.each(Trooper.prototype, function(val, name){	
	if(_.isFunction(Trooper.prototype[name]) && !_.contains(preventAuthChecking, name)){
		var oldFunction = Trooper.prototype[name];
		Trooper.prototype[name] = function(){	
			var isAuthorized= checkAuth.call(this);
			if(isAuthorized){
				return oldFunction.apply(this, arguments);
			}else{
				throw "You need to authorize, in order to call "+name+"() method.";
			}		 
			
		};
	}	
});

module.exports =  Trooper;