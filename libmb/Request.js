

var request = require('request');
var q = require('q');
var Response = require('./Response'); 
var _ = require('underscore'); 
 
module.exports = function(){
	var j = this.jar = request.jar();
	//console.log(this.jar.setCookieSync)
	this.send = function(url){
			var defer= q.defer(); 			
			request({uri: url, jar: j, timeout: 5000, followRedirect: false}, function(e,r,b){
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
			request({uri: url, jar: j, timeout: 5000, followRedirect: true}, function(e,r,b){			
				if(e) {
					defer.reject(e);
				}
				defer.resolve(b);
			});
			return defer.promise;
	};
	this.post = function(url, data){
			var defer= q.defer();
			request.post({form: data, uri: url, jar: j, timeout: 5000, followRedirect: false}, function(e,r,b){
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