module.exports =   {
	getCHKByCookie: function(cookie){
		 
		return cookie.substr(47, 6);
	},
	getMessageByCookie: function(cookie){
		var matcher = cookie.match(/:msgy\d+:/);
		var num = matcher[0].substr(5).slice(0,-1);
		return +num;
	},	
	getTextByCookie: function(cookie){
		var matcher = cookie.match(/:texty\d+:/);
		if(!matcher){
			return null;
		}
		var num = matcher[0].substr(6).slice(0,-1);

		return +num;
	}
};