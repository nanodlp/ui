$(function(){
	grid_init();
	grid_draw();
	csv_init();
});

var grid_render_val="";
function grid_render(focus){
	$("#focused_input").val(focus.attr("name"));
	var data = $("#mask_form").serialize();
	if (grid_render_val==data) {
		return;
	}
	grid_render_val=data;
	$.ajax({
  		type:"POST",
  		url:"/mask/grid",
  		data:data
  	}).done(function(){
  		$("#grid-preview").html("<img src='/static/plates/grid.png?"+new Date().getTime()+"' width='100%'>");
	});
	export_grid();
}

function export_grid(){
	var val="";
	$("#mask_grid tr").each(function(){
		$(this).find("input").each(function(i){
			if (i>0) val += ",";
			val += $(this).val();
		});
		val +="\r\n"
	});
	$("#export_csv").val(val);
}

function preview_mask(t,selector){
	selector.fadeOut();
	$.ajax({
  		type:"POST",
  		url:"/mask/generate/"+t,
  		data:$("#mask_form").serialize()
  	}).done(function(){
  		$("#mask-preview").html("<img src='/static/plates/maskPreview.png?"+new Date().getTime()+"' width='100%'>");
  		$("#mask").html("<img src='/static/plates/mask.png?"+new Date().getTime()+"' width='100%'>");
		selector.fadeIn();
  	});
}

function csv_init(){
	$("body").delegate("#mask_csv","change keyup",function(e){
		var csv=$("#mask_csv").val();
		if (csv.length===0) return;
		var rows = csv.split("\n");
		$("#HeightPoints").val(rows.length);
		$("#WidthPoints").val(rows[0].split(",").length).trigger("change");
		$.each(rows,function(r,row){
			var vals = row.split(",");
			$.each(vals,function(c,v){
				if (v>=0&&v<=255) $("table tr:eq("+r+") td:eq("+c+") input").val(v);
			});
		});
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
			grid+="<input class='point form-control' type='number' name='p_"+i+"_"+j+"' min='0' max='255' value='255' required>";
		}
	}
	grid+="</table>";
	$("#mask_grid").html(grid);
}

function grid_init(){
	$("body").delegate(".grid_input","change",function(e){
		grid_draw();
	}).delegate(".point","focus keyup change",function(e){
		grid_render($(this));
	}).delegate("#preview","click",function(e){
		preview_mask("preview",$(this));
		e.preventDefault();
	}).delegate("#export","click",function(e){
	}).delegate("#reset","click",function(e){
		e.preventDefault();
		grid_draw();
	}).delegate("#save","click",function(e){
		preview_mask("preview",$(this));
		preview_mask("save",$(this));
		e.preventDefault();
	});
}

function resume_init(){
	$("body").delegate(".grid","change",function(e){
		var t=$(this);
		return confirm(t.data("confirm").replace("[LayerID]",t.parent().find("#appendedtext").val()));
	});
}
