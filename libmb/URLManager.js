module.exports = function(config){


	var domain = config.domain;
	var name = config.name;
	var baseUrl = "http://"+name+".minitroopers."+domain+"/";


	this.getBaseUrl= function(){
		return baseUrl+"hq";
	};
	this.getMissionUrl= function(chk){
		return baseUrl+"b/mission?chk="+chk;
	};
		this.getRaidUrl= function(chk){
		return baseUrl+"b/raid?chk="+chk;
	};
	this.getBattleUrl= function(){
		return baseUrl+"b/battle";
	};
	this.getTrooperUpgradeUrl= function(chk, trooper){
		return baseUrl+"t/"+(trooper || 0)+"?levelup="+chk;
	};
	this.getTrooperUpgradePageUrl= function(trooper){
		return baseUrl+"/levelup/"+(trooper || 0);
	};
	this.getMainTrooperUrl= function(){
		return baseUrl+"t/0";
	};
	this.getSubmitSkillSelectionUrl = function(chk, trooper, skillId){	
			return this.getTrooperUpgradePageUrl(trooper)+"?skill="+skillId+"&chk"+chk;
	};
	this.getTrooperUrl= function(trooper){
		return baseUrl+"t/"+trooper;
	};
	this.getLoginUrl = function(){
		return baseUrl+"login";
	};
	this.getTrooperArmyPageList = function(){
		return baseUrl+'load?pos=0;count=222';
	};
	this.getTrooperArmyMemberDetalis = function(armyMemberId){
		return baseUrl+'details?t='+armyMemberId;
	};
	this.getSelectUpgradeSkillUrl = function(chk, trooper, skill){
		return baseUrl+'levelup/'+trooper+'?skill='+skill+'&chk='+chk;
	};

}; 