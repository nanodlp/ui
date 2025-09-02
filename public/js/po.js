$(function(){
	var lang = $("body").data("lang");
	if (lang.length===0||lang=="en") {
		update_tooltip_title();
		$('.tip').tooltip();
		return;
	}
	$.get("/static/lang/"+lang+".po",function(data){
		var lang = parse(data);
		replace_lang(lang);
	});
	$('.tip').tooltip();
});

function replace_lang(lang){
	$("[translate],translate").each(function(k,i){
		var t = $(i);
		var v = lang[t.html()];
		if (typeof v !== "undefined") t.html(v);
	});
	$("[placeholder]").each(function(k,i){
		var t = $(i);
		var v = lang[t.attr("placeholder")];
		t.attr("placeholder",v);
	});
	update_tooltip_title();
}

function update_tooltip_title(){
	$(".tip").each(function(k,i){
		var t = $(i)
		t.attr("title",t.find("translate.hide").html());
	});
}

function parse(d){
	var k;
	var lang={};
	d = d.replace(/\r\n/g, '\n');
	d.split(/\n/).forEach(function(line){
		var i = line.indexOf(' ');
		var key = line.slice(0,i);
		var val = line.slice(i+1).slice(1, -1);
		if (key === "msgid") k = val;
		if (key === "msgstr" && val.length>0) {
			lang[k]=val;
		}
	});
	return lang;
}
