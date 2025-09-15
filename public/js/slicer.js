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
		// Backend now handles remote slicing status internally
		update_slicer_progress(data);
	});
}

function update_slicer_progress(data) {
	if ((data["running"] == 0&&running==1) || (data["running"] == 0 && $(".job-not-processed").length>0)) {
		update_plates_list();
	}
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
