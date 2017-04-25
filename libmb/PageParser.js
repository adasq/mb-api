var _ = require('underscore');
var cheerio = require('cheerio'); 

module.exports =  function(){

this.getTrooperInfo = function(b){
var $ = cheerio.load(b, {normalizeWhitespace: true});

var money = $('.money').text().trim();
var needToUpgrade = $("a[class='but_bg b3_bg img']").text().trim();

var items = $('li.on');
var skills = [];
_.each(items, function(val, name){
	var diva = items[name].attribs.onmouseover;
	var style = items[name].attribs.style;

	diva= diva.substr(21, diva.length-21-2).replace(/\\\'/g, "'");
	$ = cheerio.load(diva);

	var title = ( $('.tipcontent h1').text().trim()); 
	var desc = ( $('.s').text().trim()); 
	skills.push({
		style: style,
		title: title,
		desc: desc
	});
});
needToUpgrade = needToUpgrade.split(" ");
needToUpgrade = needToUpgrade[needToUpgrade.length-1];
return {
	skills: skills,
	money: +money,
	needToUpgrade: +needToUpgrade
};
};

this.getTrooperArmyList = function(res){
var items2=[], items = res.match(/i\d+R/g);
var firstTrooperException = res.match(/%01i\d+y13/g);
if(!firstTrooperException){
	return null;
}else{
	firstTrooperException = firstTrooperException[0];
}

firstTrooperException = firstTrooperException.substr(4).slice(0, -3);

items2.push(firstTrooperException);
_.each(items, function(item, i ){
		if(+i%2 !== 0){
			items2.push(item.substr(1).slice(0, -1));
		}	
});
return items2;
};

this.getTrooperDetalis = function(body){
var $ = cheerio.load(body, {normalizeWhitespace: true});
var name=  ($("p.owner").text());
return {
	name: name
};
};

this.getTrooperUpgradeInfo = function(b){
var $ = cheerio.load(b, {normalizeWhitespace: true}),
onclick, matcher, money = $('.money').text().trim(),
needToUpgrade = $("a[class='but_bg b3_bg img']").text().trim(),
//levelskill =  $('.levelskill').text().trim(), 
levelskill= $('div.levelskill'),
availableSkills = [], i=0, items = $('div.box8'), itemsLength= items.length;
for(;i<itemsLength;++i){
	$ = cheerio.load(items.eq(i).html());	
	onclick= items.eq(i)[0].attribs.onclick;
	matcher = onclick.match(/\?skill=\d+&/); 
	onclick = matcher && matcher[0].substr(7).slice(0,-1);
		availableSkills.push({
			style: levelskill.eq(i)[0].attribs.style,
			skillId: onclick,
			name: $('h2').text(),
			description: $('.s').text()
		});		
}
 return availableSkills;
};










};