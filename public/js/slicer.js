$(function () {
	if ($(".plate").length > 0) setInterval(function () { slicer_progress(); }, 1000);
});

var running = 0;
var counter = 0;
function slicer_progress() {	
	counter++;
	if (running == 0 && counter<6) return; 
	counter=0;
	$.ajax({
		url: '/slicer',
		dataType: 'json',
		type: 'GET',
		timeout: 1000
	}).done(function (data) {
		// Remote slicing
		if (data["url"] !== "") {
			$.ajax({
				url: data["url"] + '/slicer',
				dataType: 'json',
				type: 'GET',
				timeout: 1000
			}).done(function (d) {
				data["layerID"] = d["layerID"];
				data["percentage"] = d["percentage"];
				data["running"] = 1;
				update_slicer_progress(data);
			});
		} else {
			update_slicer_progress(data);
		}
	});
}

function update_slicer_progress(data) {
	running = data["running"];
	if (data["running"] == 0) {
		$(".plate .details").addClass("hide");
		$(".slicing").removeClass("slicing");
		return;
	}
	$(".plate").each(function () {
		var t = $(this);
		if ($(this).data("plate") == data["plateID"]) {
			t.parents("tr").addClass("plate-processed").addClass("slicing")
			t.find(".details").removeClass("hide");
			t.find(".progress").show();
			t.find(".progress-bar").css("width", data["percentage"] + "%");
		} else {
			t.find(".details").addClass("hide");
			t.parents("tr").removeClass("slicing");
		}
	});
}
