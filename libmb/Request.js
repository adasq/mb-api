

var request = require('request');
var q = require('q');
var Response = require('./Response'); 
var _ = require('underscore'); 
 
module.exports = function(){
	var j = this.jar = request.jar();
	//console.log(this.jar.setCookieSync)
	this.send = function(url){
			var defer= q.defer(); 			
			request({uri: url, jar: j, followRedirect: false}, function(e,r,b){
				
				if(e){										
					defer.reject(-111);
				}else{
				var response = new Response(r, b);
				defer.resolve(response);
				}
				
			});
			return defer.promise;
	};
	this.get = function(url){
			var defer= q.defer(); 	
			request({uri: url, jar: j, followRedirect: true}, function(e,r,b){			
				defer.resolve(b);
			});
			return defer.promise;
	};
	this.post = function(url, data){
			var defer= q.defer();
			// var x = j._jar.store.idx['minitroopers.com']['/'].ssid;		
			// var d = +new Date();
			// d = d - d%1000;
			// console.log(x.value)
			// x.value = x.value.replace(/lastCheckd[0-9]+y13/, 'lastCheckd'+d+'y13');
			// console.log(x.value)
			request.post({form: data, uri: url, jar: j, followRedirect: false}, function(e,r,b){
if(e){

					defer.reject(-111);
				}else{
				var response = new Response(r);
				defer.resolve(response);
				}
			});
			return defer.promise;
	};
};