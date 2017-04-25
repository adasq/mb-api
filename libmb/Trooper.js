var URLManager = require('./URLManager');  
var PageParser = require('./PageParser');  
var Request = require('./Request'); 
var request = require('request');
var CookieMessages= require('./CookieMessages'); 
var CookieManager = require('./CookieManager'); 
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

Trooper.prototype.auth= function(){
var that = this;
var defer= q.defer();
if(this.config.pass){
	var data = {
		login: this.config.name,
		pass: this.config.pass
	};
	promise= this.req.post(this.urlManager.getLoginUrl(), data);
}else{	 
	promise= this.req.send(this.urlManager.getBaseUrl());
}
promise.then(function(response){
var cookie = response.getCookies();
var code = null; 
if(response.isRedirect()){
  	code= CookieManager.getTextByCookie(cookie);
  	if(that.config.pass){
  		that.chk = CookieManager.getCHKByCookie(cookie); 
 		code= code || 201;
  	}else{
  		code= code || 501;
  	} 
}else{
 	that.chk = CookieManager.getCHKByCookie(cookie);  	
 	code= 201;
}
var jar = that.req.jar;
var cookieString= jar.getCookieString('http://minitroopers.com');

 defer.resolve({ao: {cookie: cookieString, 
 	chk: that.chk}, code: code, message: CookieMessages.auth[code]});
}, defer.reject);
return defer.promise;
};

Trooper.prototype.auth2= function(){
var that = this;
var defer= q.defer(); 
if(this.config.pass){
	var data = {
		login: this.config.name,
		pass: this.config.pass
	};
	promise= this.req.post(this.urlManager.getLoginUrl(), data);
}else{	 
	promise= this.req.send(this.urlManager.getBaseUrl());
}
promise.then(function(response){
var cookie = response.getCookies();
var code = null; 
if(response.isRedirect()){
  	code= CookieManager.getTextByCookie(cookie);
  	if(that.config.pass){
  		that.chk = CookieManager.getCHKByCookie(cookie); 
 		code= code || 201;
  	}else{

  		code= code || 501;
  	} 
}else{	
 	that.chk = CookieManager.getCHKByCookie(cookie);  	
 	code= 201; 	
}
var jar = that.req.jar;
var cookieString= jar.getCookieString('http://minitroopers.com');
if(code === 201){	
	if(response.body.indexOf('name="pass"') > -1){
			code = 46;
		   defer.reject({code: code, message: CookieMessages.auth[code]});
	}else{
		 defer.resolve({code: code, message: CookieMessages.auth[code]});
	}
}else{
 defer.reject({code: code, message: CookieMessages.auth[code]});
}
// console.log(response.isRedirect())
// console.log(response.getHeaders())
// console.log(response.getCookies().split(':'), response.getCookies().split(':').length)
}, function(requestErrorCode){
	defer.reject({code: requestErrorCode, message: CookieMessages.auth[requestErrorCode]});
});
return defer.promise;
};

var fs = require('fs');


var writeToFile = function(b){
fs.writeFile("./examle.txt", b, function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("The file was saved!");
    }
}); 
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
			//	detalis.name = Trooper.normalizeName(detalis.name);
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




Trooper.prototype.selectSkill = function(trooperId, skill){
	var trooper = (trooperId || 0), that= this, defer= q.defer(); 
	var promise = this.req.send(this.urlManager.getSelectUpgradeSkillUrl(this.chk, trooper, skill));
	promise.then(function(response){ 
		var headers= response.getHeaders();	
		var location = headers['location'];	
		var cookies= response.getCookies();
		if(cookies){	
			if(headers['location'] === '/hq'){
				defer.resolve('*');
			}else{
				console.log("unexcepted1");
			}	
		 }else{		 	
		 		if(!location){
		 			 defer.resolve(501);
		 		}else{
		 			switch(location){
		 				case ('/t/'+trooper): 
		 					defer.resolve(502);
		 				break;
		 				case '/hq':
		 					defer.resolve(503);
		 				break;
		 				default: 
		 					console.log('unexcepted2');
		 				break;
		 			}
		 		}
		 		defer.resolve(-1);
				
		}
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


var preventAuthChecking = ['auth','auth2','authSync', 'toString', 'generateTrooperFamily'],
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



Trooper.normalizeName = (function(name){

var StringBuf= function() {
	this.b = "";
};

var removeAccentsUTF8 = function(s) {
	var b = new StringBuf();
	var _g1 = 0, _g = s.length;
	while(_g1 < _g) {
		var i = _g1++;
		var c = s.charCodeAt(i);
		switch(c) {
		case 233:case 232:case 234:case 235:
			b.b += "e";
			break;
		case 201:case 200:case 202:case 203:
			b.b += "E";
			break;
		case 224:case 226:case 228:case 225:
			b.b += "a";
			break;
		case 192:case 194:case 196:case 193:
			b.b += "A";
			break;
		case 249:case 251:case 252:case 250:
			b.b += "u";
			break;
		case 217:case 219:case 220:case 218:
			b.b += "U";
			break;
		case 238:case 239:case 237:
			b.b += "i";
			break;
		case 206:case 207:case 205:
			b.b += "I";
			break;
		case 244:case 243:case 246:case 245:
			b.b += "o";
			break;
		case 212:case 211:case 214:
			b.b += "O";
			break;
		case 230:case 198:
			b.b += "a";
			b.b += "e";
			break;
		case 339:case 338:
			b.b += "o";
			b.b += "e";
			break;
		case 231:
			b.b += "c";
			break;
		case 199:
			b.b += "C";
			break;
		case 241:
			b.b += "n";
			break;
		case 209:
			b.b += "N";
			break;
		default:
			b.b += String.fromCharCode(c);
		}
	}
	return b.b;
};

 return function(name) {
 	var host = removeAccentsUTF8(name).toLowerCase(); 
 	host = host.trim();
 host = host.replace(/\s+/g, "-");
 
 			host = host.replace(/[^a-z0-9.-]+/g, "");
 	if(host.length > 16) {
		var parts = host.split("-");
       if(parts[0].length >= 8)
      {host = parts[0];}else{
 				host = host.substring(0, 16);
 		}
 	}
 	return host;
 };

})();





module.exports =  Trooper;