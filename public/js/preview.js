var preview_loop;
function preview_init(){
	if ($('#preview img').length==0) return;
	$("body").delegate("#preview img","click",function(e){
		window.open("/plate/preview/image/"+layer_url(),'Image');
	}).delegate("#preview_layer","click",function(e){
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
	}).delegate("#preview_play", "click", function () {
		$("#preview_play").addClass("hide");
		$("#preview_stop").removeClass("hide");
		preview_loop = setInterval(function () {
			t = $("#preview_range");
			if (parseInt(t.val()) + 1 > parseInt(t.attr("max"))){
				$("#preview_stop").trigger("click");
			}
			t.val(parseInt(t.val()) + 1);
			t.trigger("change");
		}, $(".play-delay").val() * 1000);
	}).delegate("#preview_stop", "click", function () {
		$("#preview_play").removeClass("hide");
		$("#preview_stop").addClass("hide");
		clearTimeout(preview_loop);
	}).delegate("#preview_previous","click",function(){
		$("#preview_range").val($("#preview_range").val()-1);
		$("#preview_range").trigger("change");
	}).delegate("#preview_next","click",function(){
		$("#preview_range").val(parseInt($("#preview_range").val())+1);
		$("#preview_range").trigger("change");
	}).delegate(".overhang","click",function(e){
		e.preventDefault();
		$("#preview_range").val($(this).text());
		$("#preview_range").trigger("change");
	}).delegate("#toggle_details","click",function(){
		if ($(this).data("display")){
			$(this).data("display",false);
			$("#details").addClass("hide");
			$("#threed").addClass("hide");
			$("#preview").parent().removeClass("col-md-4").addClass("col-md-12");
			$(".mc_overlay").remove();
			return;
		}
		$(this).data("display",true);
		$("#preview").parent().removeClass("col-md-4").addClass("col-md-4");
		$("#details").removeClass("hide");
		$("#threed").removeClass("hide");
		mc_guide();
		preview_update();
	}).delegate("#toggle_compare","click",function(){
		if ($(this).hasClass("btn-success")){
			$(this).removeClass("btn-success");
		} else {
			$(this).addClass("btn-success");
		}
		preview_update();
	}).delegate("#preview_range","change keypress",function(){
		preview_update();
	});	
	preview_update();	
}

var compareTimer;
function preview_url(){
	var current_layer = $('#preview_range').val();
	return '/plate/preview/'+$('#preview_range').data("plate")+'/'+current_layer;
}

function layer_url(){
	var current_layer = $('#preview_range').val();
	var d = new Date();
	var addon = '?' + d.getTime();
	return $('#preview img').data('path') + current_layer + '.png' + addon;
}

function preview_update(){
	var t = $('#preview_range');
	var current_layer = t.val();
	clearTimeout(compareTimer);
	compareTimer = setTimeout(function(){ 
		compare($('#preview img'),$('#preview img').data('path'),current_layer);
	}, 100);
	
	$('#current_layer').html(current_layer);
	$('#preview img').attr('src', layer_url());
	if (!$("#toggle_details").data("display")) return;
	if ($('#threed img').length==0) $("#threed").html('<img src="'+preview_url()+'" class="two">');	
	else $('#threed img').attr("src",preview_url());
	$.getJSON($('#preview img').data('path')+"info.json").done(function(data) {
		d=data[current_layer-1];
		$.each(d,function(k,v){
			$("#"+k).html(v);
		});
	});
	$.getJSON("/layer/preview/"+t.data("plate")+"/"+current_layer).done(function(data) {
		$.each(data,function(k,v){
			$("#"+k).html(v.replace(/\n/g, "<br>"));
		});
	});
	if (t.data("dynthickness")===null){
		return;
	}
	var thickness = t.data("dynthickness")[current_layer-1]-t.data("dynthickness")[current_layer-2];
	if (isNaN(thickness)) thickness=t.data("dynthickness")[current_layer-1];
	$("#LayerThickness").html(Math.round(thickness*1000)/1000);
}

function mc_guide(){
	var t = $('#preview_range');
	var mc = t.data("mc");
	var cc = t.data("cc");
	if  (mc.Count == 0 || cc.length<2){
		return;
	}
	var pw = t.data("w") / $("#preview").innerWidth();
	var ph = t.data("h") / $("#preview").innerHeight();
	var cure = 0;
	for (i = 0; i < mc.Count; i++){
		cure += cc[i];
		$("#preview").append('<div class="mc_overlay" style="left:'+(mc.X[i]/pw)+'px;top:'+(mc.Y[i]/ph)+'px;">'+cure+'s</div>');
	}
}
// function to retrieve an image
function loadImage(url) {
	return new Promise((fulfill, reject) => {
	  let imageObj = new Image();
	  imageObj.onload = () => fulfill(imageObj);
	  imageObj.src = url;
	});
}

function compare(selector,plate,current_layer){
	if (current_layer<2 || !$("#toggle_compare").hasClass("btn-success")) return;
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');
	context.canvas.width = selector.innerWidth();
	context.canvas.height = selector.innerHeight();
	if (context.canvas.width==0 || context.canvas.height==0) return;
	var d = new Date();
	var addon = '?' + d.getTime();
	Promise.all([		
		loadImage(plate+current_layer+".png"+addon),
		loadImage(plate+(current_layer-1)+".png"+addon),
	  ])
	  .then((images) => {
		context.drawImage(images[0], 0, 0, context.canvas.width, context.canvas.height);
		var c = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
		context.drawImage(images[1], 0, 0, context.canvas.width, context.canvas.height);
		var p = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
	
		for (i = 0; i < c.data.length; i+=4){
			if (c.data[i]>0&&p.data[i]==0){
				c.data[i+1] = 80;
				c.data[i+2] = 80;
			}
		}
		var img = imagedata_to_image(selector,c);
	  })
	  .catch( (e) => alert(e) );
}

function imagedata_to_image(selector,imagedata) {
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = imagedata.width;
	canvas.height = imagedata.height;
	ctx.putImageData(imagedata, 0, 0);

	var image = new Image();
	selector.attr("src",canvas.toDataURL());
	return image;
}
