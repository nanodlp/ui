function preview_init(){
	if ($('#preview img').length==0) return;
	$("body").delegate("#preview_layer","click",function(e){
		e.preventDefault();
		var t=$("#preview_range");
		if (t.data("clicked")){
			t.data("clicked",false);
			$(this).text("Preview");
			$.get("/projector/blank");
		} else {
			if (confirm_action($(this))) {
				$.get("/projector/display/"+"plates***"+t.data("plate")+"***"+t.val()+".png");
				t.data("clicked",true);
				$(this).text("Close");
			}
		}
	}).delegate("#preview_previous","click",function(){
		$("#preview_range").val($("#preview_range").val()-1);
		$("#preview_range").trigger("change");
	}).delegate("#preview_next","click",function(){
		$("#preview_range").val(parseInt($("#preview_range").val())+1);
		$("#preview_range").trigger("change");
	}).delegate("#toggle_details","click",function(){
		if ($(this).data("display")){
			$(this).data("display",false);
			$("#details,#preview").removeClass("split");
			return;
		}
		$(this).data("display",true);
		$("#details,#preview").addClass("split");
		preview_update();
	}).delegate("#preview_range","change keypress",function(){
		preview_update();
	});
	preview_update();
}

function preview_update(){
	var d = new Date();
	var addon = '?' + d.getTime();
	var current_layer = $('#preview_range').val();
	$('#current_layer').html(current_layer);
	$('#preview img').attr('src', $('#preview img').data('path') + current_layer + '.png' + addon);
	if (!$("#toggle_details").data("display")) return;

	$.getJSON($('#preview img').data('path')+"info.json").done(function(data) {
		d=data[current_layer-1];
		$.each(d,function(k,v){
			$("#"+k).html(v);
		});
	});
	$.getJSON("/layer/preview/"+$('#preview_range').data("plate")+"/"+current_layer).done(function(data) {
		$.each(data,function(k,v){
			$("#"+k).html(v);
		});
	});
}
