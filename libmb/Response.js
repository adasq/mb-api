module.exports = function(obj, b){
	this.body = b || "";
	this.isRedirect = function(){
		return obj.statusCode === 302;
	};
	this.getHeaders = function(){
		return obj.headers;
	};
	this.getCookies = function(){
		var headers = this.getHeaders();
		if(headers['set-cookie']){
			return headers['set-cookie'][0];
		}else{
			return null;
		}		
	};
};