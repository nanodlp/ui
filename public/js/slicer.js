$(function(){
	if ($(".plate").length>0) setInterval(function(){slicer_progress();}, 1000);
});

function slicer_progress(){
	$.ajax({
		url: '/slicer',
		dataType: 'json',
		type: 'GET',
		timeout: 1000
	}).done(function(data){
		if (data["url"]!==""){
			$.ajax({
				url: data["url"]+'/slicer',
				dataType: 'json',
				type: 'GET',
				timeout: 1000
			}).done(function(d){
				data["layerID"]=d["layerID"];
				data["percentage"]=d["percentage"];
				data["running"]=1;
				update_slicer_progress(data);
			});
		} else {
			update_slicer_progress(data);
		}
	});
}

function update_slicer_progress(data){
	if (data["running"]==0){
		$(".plate .details").addClass("hide");
		$(".slicing").removeClass("slicing");
		return;
	}
	$(".plate").each(function(){
		var t=$(this);
		if ($(this).data("plate")==data["plateID"]){
			t.parents("tr").addClass("plate-processed").addClass("slicing")
			t.find(".details").removeClass("hide");
			t.find(".progress").show();
			t.find(".progress-bar").css("width",data["percentage"]+"%");
		} else {
			t.find(".details").addClass("hide");
			t.parents("tr").removeClass("slicing");
		}
	});
}
