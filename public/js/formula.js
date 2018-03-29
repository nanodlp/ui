$(function(){
	formula_init();
});

function formula_start(t){
	$("#pre_formula").data("selector",t.parent().next());
	$("#pre_formula").val(t.parent().next().val());
	formula_updated();
}

function formula_updated(){
	formula_keywords();
	var result = replace_keywords();
	$.post("/formula",{"str":result},function(data){
		$("#post_formula").val(data);
	});
}

function formula_init(){
	$("body").delegate("#pre_formula, .formula_keyword","change keyup",function(e){
		formula_updated();
	});
	$("body").delegate("#formula_save","click",function(e){
		var t = $("#pre_formula").data("selector");
		t.val($("#pre_formula").val());
		$('#helpModal').modal({ show: false});
	});
}

function formula_keywords(){
	var val = $("#pre_formula").val();
	$(".formula_keyword").each(function(){
		if (val.indexOf($(this).data("type"))===-1){
			$(this).hide();
		} else {
			$(this).show();
		}
	});
}

function replace_keywords(){
	var val = $("#pre_formula").val();
	$(".formula_keyword").each(function(){
		val = val.split("[["+$(this).data("type")+"]]").join($(this).find("input").val());
	});
	return val;
}
