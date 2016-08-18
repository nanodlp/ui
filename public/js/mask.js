$(function(){
	grid_init();
	grid_draw();
});

function grid_render(focus){
	$("#focused_input").val(focus.attr("name"));
	$.ajax({
  		type:"POST",
  		url:"/mask/grid",
  		data:$("#mask_form").serialize()
  	});
}

function preview_mask(t){
	$.ajax({
  		type:"POST",
  		url:"/mask/generate/"+t,
  		data:$("#mask_form").serialize()
  	});
}

function grid_draw(){
	var w=$("#WidthPoints").val();
	var h=$("#HeightPoints").val();
	var grid="<table>";
	for (var i = 0; i < h; i++) {
		grid+="<tr>";
		for (var j = 0; j < w; j++) {
			grid+="<td>";
			grid+="<input class='point' type='number' name='p_"+i+"_"+j+"' value='1'>";
		}
	}
	grid+="</table>";
	$("#mask_grid").html(grid);
}

function grid_init(){
	$("body").delegate(".grid_input","change",function(e){
		grid_draw();
	}).delegate(".point","focus",function(e){
		grid_render($(this));
	}).delegate("#preview","click",function(e){
		preview_mask("preview");
		e.preventDefault();
	}).delegate("#save","click",function(e){
		preview_mask("save");
	});
}

function resume_init(){
	$("body").delegate(".grid","change",function(e){
		var t=$(this);
		return confirm(t.data("confirm").replace("[LayerID]",t.parent().find("#appendedtext").val()));
	});
}
