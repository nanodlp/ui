var favicon;
var percentage;

$(function(){
	// Run for index page
	display_notification();
	notification_close();
	setInterval(function(){display_notification();}, 8000);
	if($('#buzzer').length>0){
		update_status();
		setInterval(function(){update_status();}, 1500);
		$(window).focus(function() {
			update_status();
		});
		dashboard_init();
	} else {
		update_status();
		setInterval(function () { update_status(); }, 4000);
	}
	// /printer route for logger
	if($('#console').length>0){
		display_console_log();
		setInterval(function () { display_console_log(); }, 3000);
	}
	sortable_table_init();	
	terminal_init();
	favicon_init();
	inputs_init();
	blackout_image_init();
	preview_init();
	editable_table_init();
	help_init();
	jobs_action_init();
	search_init();
	plate_init();
	repair_init();
	plates_init();
	plates_preview_init();
	confirm_init();
	ajax_post_init();
	post_init();
	calibration_init();
	settings_init();	
	profile_settings_init();	
	$('.conditional').conditionize();
	changelog_init();
	wireless_init();	
});

function wireless_init() {
	if ($('#wifi').length > 0) {
		$.get("/wifi/details", function (data) {			
			$('#wifi').html(data.split("<!-- wifi_split -->")[1]);
		});
	}
}

function changelog_init() {
	var t = $("#changelog-display");
	if (t.length==0) return;
	var d=t.data("changelog");
	if (d === undefined) return;
	var cur=t.data("current");
	var beta=t.data("beta");
	var stable=t.data("stable");
	$.each(d,function(k,v){
		if (parseInt(v[0])>cur){
			update_channel_log($("#beta"),v)
		}
		if (parseInt(v[0])>cur&&stable>parseInt(v[0])){
			update_channel_log($("#stable"),v)
		}	
	});
}
function update_channel_log(t,d){
	var txt = "";
	$.each(d[1],function(k,v){
		txt += "<li>"+v[0]+": "+v[1]+"</li>";
	});
	if (txt.length>0){
		t.html(t.html()+txt);
	}	
}

function oem_lock(){
	if ($("#OEMLock").val()!=""){
		$(".i_lock").hide();
		$(".setting-cat").each(function(){
			if ($("."+$(this).data("related")+":not(.i_lock)").length==0){
				$(this).hide()
			}
		});
	}
}

/* Setup page category handling */
function settings_init() {
	if ($("#setup .setup").length==0) return;
	$("body").on("click",".setting-cat",function(e){
		e.preventDefault();
		if ($("#scategory").val()!="") settings_close();
		else settings_open(this);
	});
	$(window).on('popstate', function(event) {
		// Forward
		var page = window.location.hash.substr(1);
		if ($("#scategory").val()==page) return;
		if (window.location.hash.length>2){
			select_setting();
		} else {
			settings_close();
		}
	});
	if (window.location.hash.length>2){
		select_setting();
	}
	axis_height();
	oem_lock();
}

function axis_height(){	
	axis_height_calc();
	$("body").delegate("#ZAxisHeight, #LeadscrewPitch, #MicroStep, #MotorDegree","change keyup",function(e){
		axis_height_calc();
	});
}

function axis_height_calc(){
	var val = $("#ZAxisHeight").val()*($("#LeadscrewPitch").val() * $("#MotorDegree").val() / (360 * $("#MicroStep").val()));	
	$("#axis_in_mm").html(val.toFixed(3));
}

function select_setting(){
	$(".setting-cat").each(function(){
		if ("#"+$(this).data("related")==window.location.hash){
			$(this).trigger("click");
		}
	});
}

function settings_open(t){
	$(".setup-categories").slideUp();
	var cl = $(t).data("related");	
	$("#scategory").val(cl);
	$("."+cl).slideDown();
	window.location = "#"+cl;
	$('.conditional').conditionize();
	$(".selected-cat").html($(t).clone());
	oem_lock();
}

function settings_close(){
	$("#scategory").val("");
	$(".i_option").slideUp();
	window.location = "#";
	$(".setup-categories").slideDown();
	$(".selected-cat").html("");
}

/* Profile page category handling */
function profile_settings_init() {
	$(".setting-cat").each(function(){
		var cl = $(this).data("related");
		if ($("."+cl+"").length==0||$("."+cl).not(".hidden").length==0){
			$(this).hide();
		}	
	});	
	$("body").on("input","input.ticks",function(e){
		$(this).parent("h4").find(".val").html($(this).val());
	});
	if ($("#setup .profiles").length==0) return;
	$("body").on("click",".setting-cat",function(e){
		e.preventDefault();
		$("#options").insertAfter($(this));
		profile_settings_open(this);
	});
}

function profile_settings_open(t){
	$(".i_option").hide();
	var cl = $(t).data("related");
	$("#scategory").val(cl);
	$("."+cl).slideDown();
	window.location = "#"+cl;
	$('.conditional').conditionize();
}


function dashboard_init() {
	$.get("/info", function (data) {
		$(".nanodlp-content").html("<br>"+data);
	});
	$("html").delegate('#change-preview','click',function(e){
		$(this).parent().toggleClass("toggle");
		last_frame_key="";
		e.preventDefault();
	});
}

function calibration_init() {
	if ($('#axis-height-mm').length > 0) {
		setInterval(function () { calibration_update(); }, 1500);
	}
}

function calibration_update() {
	$.getJSON("/z-axis/info", function (data) {
		$("#current-height-mm").html(data["current-height-mm"]);
		$("#axis-height-mm").html(data["axis-height-mm"]);
		$("#current-height-mm").html(data["current-height-mm"]);
		$("#axis-height-mm").html(data["axis-height-mm"]);
	});
}

function ajax_post_init(){
	$(".ajax-post").on("submit",function(e){
		$.post($(this).attr("action"),$(this).serialize());
		e.preventDefault();
	});
}

function file_size_limit_apply(){
	$(".upload-disable").find('button[type="submit"]').prop('disabled', false);
	$("#largeFile").addClass("hide");
	var file=$("#ZipFile")[0].files[0];
	var file_size=file.size/1024/1024;
	var file_ext=file.name.split('.').pop().toLowerCase();
	var available_mem=$("#ZipFile").data("size");
	var remote_slicing=$("#ZipFile").data("remote")==="True";
	if (remote_slicing) return;
	if (available_mem==0) return;
	if (file_ext!=="stl"&&file_ext!=="obj") return;
	if (file_size>available_mem){
		$(".upload-disable").find('button[type="submit"]').prop('disabled', true);
		$("#largeFile").removeClass("hide");
	}
}

function post_init(){
	$('.upload-disable').submit(function(e) {
		e.preventDefault();
		$(".progress").removeClass("hide");
		setInterval(update_upload_progress,1000)
		$(this).find('button[type="submit"]').prop('disabled', true).addClass("animated");
		var formData = new FormData(this);
        $.ajax({
            url: $(this).attr('action'),
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            complete: function(response) {
                window.location.replace("/plates");
            }
        });
	});
	$('#ZipFile').change(function() {
		file_size_limit_apply();
	});
}

function update_upload_progress(){
	$.get("/api/v1/progress/details/copy",function(d){
		$(".progress-bar-main").css("width",d["Percentage"]+"%");
		if (d["Percentage"]>10){
			$(".progress-bar-main").html(d["Text"]);
		}		
	});
}

function confirm_init(){
	$("body").delegate(".ask","click",function(e){
		return confirm($("#"+$(this).data("ask")).text());
	});
}

function plates_init(){
	$("body").on("change keypress keyup",".resume-id",function(){
		if ($(this).val()>0) $(this).parents("form").find(".resume").removeClass("hide");
		else $(this).parents("form").find(".resume").addClass("hide");
	}).on("click",".print-from-middle",function(e){
		e.preventDefault();
		$(this).parents("td").find("form").removeClass("hide").find("input").focus();
	});
	update_plates_resume();
}

function update_plates_resume(){
	$(".resume-id").each(function(){
		if ($(this).val()>0) $(this).parents("form").find(".resume").removeClass("hide");
		else $(this).parents("form").find(".resume").addClass("hide");
	});
}

function plates_preview_init(){
	setTimeout(replace_plates_previews, 2000);
	setTimeout(replace_plates_previews, 5000);
	setTimeout(replace_plates_previews, 10000);
	setTimeout(replace_plates_previews, 30000);
}

function replace_plates_previews(){
	$(".retry").each(function(){
		var el = $(this);
		$.get(el.attr("src"),function(){
			el.attr("src",el.attr("src")+window.performance.now());
			el.removeClass("retry hide");
		});
	});
}

function plate_init(){
	// TODO: Move all WASM DOM stuffs here
	$("body").delegate(".nav-pills a","click",function(e){
		setTimeout(function(){
			if ($("#ZipFile").is(":visible")){
				$("#browser_slice").show();
			} else {
				$("#browser_slice").hide();
			}
		},500);
	});
	$("body").delegate("#ZipFile","change",function(e){
		if ($("#Path").val()===""){
			var filename = $('input[type=file]').val().split('\\').pop();
			$("#Path").val(filename.split(".")[0]);
		}
	});

    // Remember last AutoCenter selection for new uploads
    var autoCenterEl = $("#AutoCenter");
    if (autoCenterEl.length) {
        // Save on change
        $("html").delegate('#AutoCenter','change',function(){
            try { localStorage.setItem('upload-autocenter', $(this).val()); } catch(e) {}
        });

        // Restore only for new plate uploads (no PlateID)
        // Detect "new" robustly: accept presence, true/1 strings, or boolean true
        var newFlagData = autoCenterEl.data('new');
        var newFlagAttr = autoCenterEl.attr('data-new');
        var isNew = false;
        if (typeof newFlagData !== 'undefined') {
            isNew = (newFlagData === true) || (newFlagData === 1) || (newFlagData === '1') || (newFlagData === 'true') || (newFlagData === 'True');
        } else if (typeof newFlagAttr !== 'undefined') {
            // Attribute exists: empty means truthy for our purpose
            isNew = (newFlagAttr === '' || newFlagAttr === '1' || newFlagAttr === 'true' || newFlagAttr === 'True');
        }
        // Also consider page as new upload if there is no hidden USBFile (edit mode adds one)
        var hasHiddenUSBFile = $("input[name='USBFile'][type='hidden']").length > 0;
        var isNewPage = isNew || (!hasHiddenUSBFile && $("#ZipFile").length > 0);
        // Only apply on new page OR when current value is still the default (0)
        var shouldApply = isNewPage || (autoCenterEl.val() === '0');
        if (shouldApply) {
            try {
                var saved = localStorage.getItem('upload-autocenter');
                if (saved !== null && saved !== '') {
                    // Apply saved value if different from server default
                    if (autoCenterEl.val() != saved) {
                        autoCenterEl.val(saved);
                        // Keep Advanced options collapsed by default; do not auto-expand
                    }
                }
            } catch(e) {}
        }
    }

    // Remember last ImageRotate selection for new uploads
    var imageRotateEl = $("#ImageRotate");
    if (imageRotateEl.length) {
        // Save on change
        $("html").delegate('#ImageRotate','change',function(){
            try { localStorage.setItem('upload-image-rotate', $(this).val()); } catch(e) {}
        });

        // Restore only for new plate uploads (no PlateID)
        var rotateNewFlagData = imageRotateEl.data('new');
        var rotateNewFlagAttr = imageRotateEl.attr('data-new');
        var rotateIsNew = false;
        if (typeof rotateNewFlagData !== 'undefined') {
            rotateIsNew = (rotateNewFlagData === true) || (rotateNewFlagData === 1) || (rotateNewFlagData === '1') || (rotateNewFlagData === 'true') || (rotateNewFlagData === 'True');
        } else if (typeof rotateNewFlagAttr !== 'undefined') {
            rotateIsNew = (rotateNewFlagAttr === '' || rotateNewFlagAttr === '1' || rotateNewFlagAttr === 'true' || rotateNewFlagAttr === 'True');
        }
        var rotateHasHiddenUSBFile = $("input[name='USBFile'][type='hidden']").length > 0;
        var rotateIsNewPage = rotateIsNew || (!rotateHasHiddenUSBFile && $("#ZipFile").length > 0);
        var rotateShouldApply = rotateIsNewPage || (imageRotateEl.val() === '0');
        if (rotateShouldApply) {
            try {
                var savedRotate = localStorage.getItem('upload-image-rotate');
                if (savedRotate !== null && savedRotate !== '') {
                    if (imageRotateEl.val() != savedRotate) {
                        imageRotateEl.val(savedRotate);
                        // Keep Advanced options collapsed by default; do not auto-expand
                    }
                }
            } catch(e) {}
        }
    }
}

function repair_init(){
	$("body").delegate(".repair","click",function(e){
		e.preventDefault();
		var t = $(this);
		t[0].disabled=true;
		t.addClass("animated");
		$.get(t.attr("href")).always(function(){
			t.remove();
			update_plates_list();
		});
	});
}

function jobs_action_init(){
	$("body").delegate(".resume","click",function(e){
		var t=$(this);
		return confirm(t.data("confirm").replace("[LayerID]",t.parents("form").find("input").val()));
	}).delegate(".cancel-slicing","click",function(e){
		$.get("/slicer/cancel");
	});
}

function help_init(){
	var response={};
	$('#helpModal').modal({ show: false});
	$("body").delegate(".help","click",function(e){
		var t=$(this);
		if (typeof t.data("files")=="undefined") return true;
		$('#helpModal .modal-title').html(t.parent().html());
		$.get("/help/"+t.data("files"), function(data){
			$('#helpModal .modal-body').html(data);
			$('#helpModal').modal('show');
			if (t.data("run")){
				formula_start(t);
			}
		});
		e.preventDefault();
	});
}

function sortable_table_init(){
	$('#plates th').click(function(){
		var table = $(this).parents('table').eq(0)
		var rows = table.find('tr:gt(0)').toArray().sort(comparer($(this).index()))
		this.asc = !this.asc
		if (!this.asc){rows = rows.reverse()}
		for (var i = 0; i < rows.length; i++){table.append(rows[i])}
	})
}

function comparer(index) {
    return function(a, b) {
        var valA = getCellValue(a, index), valB = getCellValue(b, index)
        return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.toString().localeCompare(valB)
    }
}

function getCellValue(row, index){ 
	var td = $(row).children('td').eq(index);
	if (td.find(".sort").length>0){
		return td.find(".sort").text();
	}
	return td.text();
}

function editable_table_init(){
	$(".edit-table").delegate(".name","change",function(){
		var empty_is_available = false;
		$(".edit-table .name").each(function(){
			if ($(this).val()==""){
				empty_is_available = true;
				return;
			}
		});
		if (!empty_is_available){
			$(".edit-table tbody").append($(".edit-table tr:last").prop('outerHTML'));
		}
	}).delegate(".remove","click",function(e){
		e.preventDefault();
		$(this).parents("tr").remove();
	}).delegate(".up","click",function(e){
		e.preventDefault();
		var t = $(this).parents("tr");
		if (t.prev().hasClass("thead")) return;
		t.prev().before(t.clone());
		t.remove();
	}).delegate(".down","click",function(e){
		e.preventDefault();
		var t = $(this).parents("tr");
		t.next("tr").after(t.clone());
		t.remove();
	});
}

function inputs_init(){
	$("html").delegate(".image_enlarge",'click',function(){
		$(this).toggleClass('enlarged');
	}).delegate('.calibration a','click',function(e){
		e.preventDefault();
		var t=$(this);
		if (t.data('disabled')) return;
		t.data('disabled',1);
		$.get(t.attr('href')).done(function(data){
			$(".ajax_result").html(data.split('<!--ajax_result-->')[1]);
			t.data('disabled','');
		});
	}).delegate('.calibration_form button','click',function(e){
		e.preventDefault();
		var t=$(this);
		if (t.data('disabled')) return;
		t.data('disabled',1);
		t.parents("form").find("#direction").val(t.val());
		$.ajax({
			type:"GET",
			data:t.parents("form").serialize()
		}).done(function(data){
			$(".ajax_result").html(data.split('<!--ajax_result-->')[1]);
			t.data('disabled','');
		});
	}).delegate('.to_layer_form button','click',function(e){
		e.preventDefault();
		var t=$(this);
		$.ajax({
			url:'move_to_layer',
			type:"GET",
			data:t.parents("form").serialize()
		}).done(function(data){
			$(".ajax_result").html(data.split('<!--ajax_result-->')[1]);
			t.data('disabled','');
		});
	}).delegate("a.ajax","click",function(e){
		e.preventDefault();
		var t = $(this);
		if (!confirm_action(t)) return;
		$.ajax({
			url: t.attr('href')
		}).always(function(d){
			if (t.data("ajax")){
				document.location.href = t.data("ajax");
			}
		});
	});
}

function confirm_action(t){
	if (t.data("confirm")){
		var txt = $("#"+t.data("confirm")).text();
		if (txt=="") txt=t.data("confirm");
		return confirm(txt);
	}
	return true;
}

function favicon_init(){
	favicon=new Favico({
    	animation:'slide',
    	bgColor: '#1C5CB8'
	});
}

var blackout_boxes = [];
function blackout_image_init(){
	blackout_image_init.selector=$('#blackout_image img').imgAreaSelect({
		handles: true,
		instance: true,
		imageWidth:$('#blackout_image').data("width"),
		imageHeight:$('#blackout_image').data("height")
	});
	var tmp = $("#blackout_table").data("blackout");
	if (tmp) {
		blackout_boxes = tmp;
		blackout_table_render();
	}

	$("html").delegate('.add_blackout','click',function(e){
		e.preventDefault();
		var vals=blackout_image_init.selector.getSelection();
		blackout_boxes.push(vals);
		blackout_table_render();
	}).delegate("#blackout_table .remove","click",function(e){
		e.preventDefault();
		blackout_boxes.splice(parseInt($(this).parents("tr").find(".id").text()) - 1, 1);
		$(this).parents("tr").remove();
		blackout_table_render();
	}).delegate("#blackout_table .id","click",function(e){
		e.preventDefault();
		var selection=blackout_boxes[parseInt($(this).text())-1];
		blackout_image_init.selector.cancelSelection(false);
		$('#blackout_image img').imgAreaSelect(selection);
	}).delegate("#range_layer_id, #partial_image","change keypress",function(){
		var addon = '';
		var current_layer = $('#range_layer_id').val();
		$('#current_layer').html(current_layer);
		if ($('#partial_image')[0].checked) addon = '_blackout.png';
		$('#blackout_image img').attr('src', $('#blackout_image img').data('path') + current_layer + '.png' + addon);
	});

}

function blackout_table_render(){
	$("#blackout_table .boxes").remove();
	$("#blackout_input").remove();
	$.each(blackout_boxes,function(k,v){
		$("#blackout_table").append('<tr class=boxes>'+
    			'<td><a class="btn btn-success id" href="#">'+(k+1)+'</a></td>'+
    			'<td><a class="btn btn-danger remove" href="#">Remove</a></td>'+
			'</tr>');
	});
	$("#blackout_table").append("<input name=blackout id=blackout_input value='"+JSON.stringify(blackout_boxes)+"' type='hidden'>");
}

update_status.running = 0;
update_status.problem = 0;
update_status.once = false;
update_status.play_once = false;
function update_status(){
	$.ajax({
		url:'/status',
		dataType: 'json',
		type: 'GET',
		timeout: 1200
	}).done(function(data){
		update_status.problem = 0;
		$('#msg_box').addClass("hide");
		if (update_status.running && data['Printing']==0 && $("audio#buzzer").length>0) {
			$("audio#buzzer")[0].play();
		}
		if (update_status.running != data['Printing'] && update_status.once && $("#plates-list").length>0){
			update_plates_list();
		}
		if (update_status.play_once!=data.play&&data.play!=""){
			new Audio(data.play).play()
			update_status.play_once=data.play
		}
		update_status.once = true
		update_status.running = data['Printing'];
		update_platform_photo(data['Camera']);
		last_value('path',data['Path']);
		if (!data['Printing']){
			last_value('last_location','Not Printing');
			last_value('last_remaining','-');
			last_value('last_height','-');
			last_value('last_eta','-');
			last_value('last_elapsed','-');
			$(".pause-obj,.printing-obj").slideUp();
			$(".idle-obj").slideDown();
			$('.resume-obj').hide();
			if (data['PlateID'] && data['LayerID']>1 && data['LayersCount'] > 1 + data['LayerID']) {
				$('.resume-obj').show();
				$(".dashboard").slideDown();
			} else {
				$(".dashboard").slideUp();
			}
		} else {
			last_value('layer',data['LayerID']);
			last_value('started',data['started']);
			last_value('layers_count',data['LayersCount']);
			last_value('plate_height',data['PlateHeight']);
			last_value('plate',data['PlateID']);
			last_value('layer_time',data['LayerTime']/1000000000);
			$(".idle-obj").slideUp();
			image_display(data['PlateID'],data['LayerID'],data['Covered']);
			if (data['Paused']) {
				$(".pause-obj").slideDown();
				$(".printing-obj").slideUp();
			}else{
				$(".pause-obj").slideUp();
				$(".printing-obj").slideDown();
			}
			layer_progress(data['PrevLayerTime'],data['LayerStartTime']);
			update_stat();
		}
		if ($("#stat").length>0){
			change_stats(data,['proc','disk','mem','uptime','proc_numb','temp', 'resin']);
		}
		var log=$.parseJSON(data["log"]);
		last_value('msg',log['msg']);
		update_timeline();
		current_status_display();
	}).fail(function() {
		update_status.problem++;
		if (update_status.problem>2){
			$('#msg_box').removeClass("hide");
			title_update('Connectivity Problem');
		}
	});
}

async function update_stat(){
	$.ajax({
		url:'/stat',
		dataType: 'json',
		type: 'GET',
		timeout: 1200
	}).done(function(data){
		var total = 0;
		var perc;
		if (data===null) return;
		$.each(data,function(k,v){
			total+=v;
		});
		$.each(data,function(k,v){
			perc=v*100/total;
			$("#"+k).attr("title",$("#"+k).html()+": "+Math.floor(perc)+"% "+Math.floor(v/1000000000)+"s");
			$("#"+k).width(perc+"%");
		});
	});
}

var charts_data=[];

function change_stats(data,keys){
	$.each(keys,function(k,v){
		if (data[v]=="") return;
		if (!charts_data[v]){
			charts_data[v]=[];
		}
		$("#"+v).html(data[v]);
		charts_data[v+"_counter"]++;
		if (parseFloat(data[v]) != charts_data[v][charts_data[v].length-1]||charts_data[v].length<2||charts_data[v+"_counter"]>30){
			charts_data[v+"_counter"]=0;
			charts_data[v].push(parseFloat(data[v]));
			if (charts_data[v].length>120) charts_data[v].shift();
			$("#"+v+"_chart").sparkline(charts_data[v], {"width": '80px',"height":"16px", "fillColor":false,"minSpotColor":false,"maxSpotColor":false,'lineColor':'#5bc0de'});
		}
	});
}

display_notification.prev_data='';
display_notification.modal='';
display_notification.notification='';
function display_notification(){
	if (display_notification.notification==""){
		display_notification.notification=$("#notification-template").html();
		display_notification.modal=$("#modal-template").html();
	}
	$.ajax({
		url:'/notification',
		type: 'GET',
		timeout: 2000
	}).done(function(data){
		var msg="";
		if (data===null) return;
		$.each(data,function(k,v){
			if (v["Type"]=="modal"){
				var el = display_notification.modal;
			} else {
				var el = display_notification.notification;
			}
			msg += el.replace("[[Text]]", v["Text"]).replace("[[Type]]", v["Type"]).replace("[[Timestamp]]", v["Timestamp"]);
		});
		if (msg==display_notification.prev_data) return;
		display_notification.prev_data=msg;
		$(".notification-service").remove();
		$(".navbar").after(msg);
		$('.modal-notification').modal('show')
	});
}

function notification_close(){
	$("body").delegate('.notification-service button','click', function (e) {
		$.get("/notification/disable/"+$(this).parents(".notification-service").data("notification"));
	});
}

display_console_log.prev_data='';
function display_console_log(){
	var table='';
	$.ajax({
		url:'/log',
		type: 'GET',
		timeout: 2000
	}).done(function(data){
		if (data==display_console_log.prev_data||!data) update_timeline();
		display_console_log.prev_data=data;
		var rows=data.split("\n");
		var formated='';
		var unformated='';
		$.each(rows,function(k,v){
			formated='';
			unformated='';
			var parts=v.split(" ");
			var time = parts[0]+" "+parts[1];
			parts.splice(parts, 1);
			parts.splice(parts, 1);
			var action = parts.join(" ").trim();
			try{
				var row=$.parseJSON(action);
				row['time']=time;
			} catch(err){
				var row=v.split("");
			}
			if (row['time']) {
				last_value('module',row['module']);
				last_value('msg',row['msg']);
				row['msg']=(row['msg']).replace(/\u21B5$/,"");
				formated+='<td>'+row['level']+'</td>';
				formated+='<td>'+row['Layer']+'</td>';
				formated+='<td>'+last_value('time',row['time'])+'</td>';
				formated+='<td>'+row['module']+'</td>';
				formated+='<td>'+(row['msg']).replace(/\u21B5/g,"<br>")+'</td>';
				table='<tr class="log">'+formated+'</tr>'+table;
			} else if (v.length>10){
				table='<tr class="log raw"><td>UNKNOWN</td><td colspan=6>'+v+'</td></tr>'+table;
			}
		});
		if (table) {
			$("#console .log").remove();
			$('#console .search_target tr:last').after(table);
		}
	});
}

function layer_progress(layerTime, startTime) {
	const progressBarElem = $(".progress-bar-layer");
	if (progressBarElem.data("layer-id") == last_value('layer') || layerTime == 0) return;
	const layerTimeInMs = layerTime / 1000000;
	const startTimeInMs = startTime / 1000000

	progressBarElem.data("layer-id", last_value('layer'));
	progressBarElem.stop(true, false).fadeOut(400, function () {
		const date = new Date().getTime();
		const spentTime = date - startTimeInMs - 500;
		progressBarElem.css("width", 0).show().animate({"width": "100%"}, layerTimeInMs - spentTime);
	});
}

function update_timeline() {
	let current_layer_id = last_value('layer');
	if (!current_layer_id) current_layer_id = 0;
	last_value('last_location', 'Not Printing');
	last_value('last_height', '-');
	last_value('last_remaining', '-');
	last_value('last_elapsed', '-');
	last_value('last_eta', '-');
	last_value('last_plate', '-');
	last_value('last_path', '-');
	let current_percentage = Math.ceil(current_layer_id * 100 / last_value('layers_count'));
	if (update_status.running) {
		let plate_height = last_value('plate_height');
		let current_height = plate_height / last_value('layers_count') * current_layer_id;
		last_value('last_location', current_layer_id + " of " + last_value('layers_count'));
		last_value('last_height', Math.round(current_height * 100) / 100 + " of " + plate_height + "mm");
		let remaining_time = Math.round((last_value('layers_count') - current_layer_id) * last_value('layer_time') / 60);
		let total_time = Math.round(last_value('layers_count') * last_value('layer_time') / 60);
		let est = new Date();
		est.setMinutes(est.getMinutes() + remaining_time);
		last_value('last_remaining', format_date(remaining_time) + " of " + format_date(total_time));
		last_value('last_eta', ("0" + est.getHours()).slice(-2) + ":" + ("0" + est.getMinutes()).slice(-2));
		let min = Math.floor((Date.now() / 1000 - last_value("started")) / 60);
		let hour = Math.floor(min / 60);
		min = min - hour * 60;
		last_value('last_elapsed', ("0" + hour).slice(-2) + ":" + ("0" + min).slice(-2));
		if (percentage != current_percentage) {
			favicon.badge(current_percentage);
			percentage = current_percentage;
			$('.print-progress-text').text(current_percentage + "%")
		}
	} else {
		favicon.reset();
	}
	$(".progress-bar-main").css("width", percentage + "%");
}

function format_date(mins) {
	var h = Math.floor(mins / 60);
	var m = mins % 60;
	h = h < 10 ? '0' + h : h;
	m = m < 10 ? '0' + m : m;
	return h + ':' + m;
}

function current_status_display(){
	title_update(last_value('last_location').replace(" of ", "/"));
	$(".last_location").html(last_value('last_location'));
	$(".last_remaining").html(last_value('last_remaining'));
	$(".last_height").html(last_value('last_height'));
	$(".last_eta").html(last_value('last_eta'));
	$(".last_elapsed").html(last_value('last_elapsed'));
	$(".last_action").html(last_value('msg'));
	$(".last_module").html(last_value('module'));
	$(".last_time").html(last_value('time'));
	$(".last_plate").html(last_value('plate'));
	$(".last_path").html(last_value('path'));
}

function title_update(title){
	document.title = title + ' - ' + $('title').text().split('-')[1];
}

var last_frame_key='';
function image_display(path,layer_id,blackout){
	if (last_frame_key != layer_id) {
		last_frame_key = layer_id;
		var frame_src='/static/plates/' + path + '/' + layer_id + '.png?' + Math.floor(Date.now() / 1000);
		var preview_src='/plate/preview/'+path+'/'+layer_id;
		if ($("#image_wrapper div").html()=='') {
			var d = ' style="aspect-ratio: calc(('+$(".layer_details").data("ratio")+'));" ';
			$("#image_wrapper div").html('<img src="'+frame_src+'" class="two"'+d+'loading=lazy>');			;
			$.get('/static/plates/' + path + '/3d.png',function(){
				$("#image_wrapper div").html($("#image_wrapper div").html()+'<img src="'+preview_src+'" class="three" loading=lazy>');
			}).fail(function() {
				$("#image_wrapper #change-preview").remove();
				$("#image_wrapper").addClass("toggle");
			});
			return;			
		}
		if ($("#image_wrapper").hasClass("toggle")) {
			$(".two").attr("src",frame_src);
		} else {
			$(".three").attr("src",preview_src);
		}		
		//if (blackout) blackout = '<img src="/static/plates/' + path + '/' +layer_id+'.png_blackout.png?" id="blackout_overlay" class="two">';	else blackout = '';
	}
}

function body_render(row){
	var formated='';
	formated+='<td>'+last_value('last_processed_layer',row['layer'])+'</td>';
	if (typeof row !='object') return formated+'<td>'+row+'</td>';
	last_value('plate',row['plate']);
	formated+='<td>'+get_commands(row)+'</td>';
	return formated;
}

function get_commands(row){
	var text='';
	var not_use={"msg":1,"module":1};
	$.each(row,function(key,val){
		if (!(key in not_use)) {
			if (typeof val =='object') text+=get_commands(val);
			else text+="<b>"+key+":</b> "+val+"<br>";
		}
	});
	return text;
}

function last_value(key,val){
	if (!last_value.values) last_value.values={};
	if (!last_value.values[key]) last_value.values[key]='';
	if (val) last_value.values[key]=val;
	return last_value.values[key];
}

var last_platform_photo_key=''; 
function update_platform_photo(camera_frequency){
	if (camera_frequency==0) return;
	var key = last_value('layer');
	if (update_status.running==0){
		key = Math.floor(Date.now() / 1000);		
	}
	$("#camera").parent().removeClass("hide");
	$("#photo_wrapper").slideDown();
	$("#photo_wrapper div").html('<img src="/static/shot.jpg?'+key+'">');
	$('img').error(function(){
		$(this).slideUp().remove();
   	});
}

function tooltip_display(selector,timeout){
	if ($("#tip").data("timeout")!=timeout) return;
	$("#tip").css({"top":(selector.pageY - xOffset) + "px","left":(selector.pageX + yOffset) + "px"}).fadeIn("fast");
}

function terminal_init(){
	if ($('#terminal').length==0) return;
	$("html").delegate('.terminal a','click',function(e){
		e.preventDefault();
		$.post("/term-io",{"gcode":$("#gcode").val()});
		$("#gcode").val("").focus();
		$('#terminal').scrollTop($('#terminal')[0].scrollHeight);
	});
	setInterval(function(){terminal_fetch();}, 1000);
}

function terminal_fetch(){
	$.get("/term-io").done(function(data){
		if (data=="") return;
		if (data==$("#terminal").html()) return;
		var currentBottom=$('#terminal').scrollTop()+$('#terminal').outerHeight()==$('#terminal')[0].scrollHeight;
		$("#terminal").html(data);
		if (currentBottom) $('#terminal').scrollTop($('#terminal')[0].scrollHeight);
	});
}

function search_init(){
	// Restore filter value from localStorage on page load
	var savedFilter = localStorage.getItem('plates-profile-filter');
	if (savedFilter) {
		$('#plates-profile-search').val(savedFilter);
	}
	
	// Restore search value from localStorage on page load
	var savedSearch = localStorage.getItem('plates-search-text');
	if (savedSearch) {
		$('#search').val(savedSearch);
	}
	
	// Apply both filters if they exist
	if (savedFilter || savedSearch) {
		// Use setTimeout to ensure DOM is fully loaded
		setTimeout(function() {
			applyAllFilters(savedFilter, savedSearch);
		}, 100);
	}
	
	$("html").delegate('#plates-profile-search','change',function(e){
		var v = $('#plates-profile-search').val();
		// Store the filter value in localStorage
		if (v) {
			localStorage.setItem('plates-profile-filter', v);
		} else {
			localStorage.removeItem('plates-profile-filter');
		}
		applyAllFilters(v, $('#search').val());
	});
	
	// Clear filter button handler
	$("html").delegate('#clear-profile-filter','click',function(e){
		$('#plates-profile-search').val('');
		localStorage.removeItem('plates-profile-filter');
		applyAllFilters('', $('#search').val());
	});
	
	// Clear search button handler
	$("html").delegate('#clear-search','click',function(e){
		$('#search').val('');
		localStorage.removeItem('plates-search-text');
		applyAllFilters($('#plates-profile-search').val(), '');
	});
	
	// Clear all filters button handler
	$("html").delegate('#clear-all-filters','click',function(e){
		$('#plates-profile-search').val('');
		$('#search').val('');
		localStorage.removeItem('plates-profile-filter');
		localStorage.removeItem('plates-search-text');
		applyAllFilters('', '');
	});
	
	$("html").delegate('#search','change keyup',function(e){
		var needle = $(this).val().toLowerCase();
		// Store the search value in localStorage
		if (needle) {
			localStorage.setItem('plates-search-text', needle);
		} else {
			localStorage.removeItem('plates-search-text');
		}
		applyAllFilters($('#plates-profile-search').val(), needle);
	});
}

// Helper function to apply both profile filter and search filter together
function applyAllFilters(profileFilter, searchText) {
	// First show all rows
	$("#plates tr").show();
	$("#clear-profile-filter").addClass("hide");
	$("#clear-search").addClass("hide");
	// Apply profile filter
	if (profileFilter && profileFilter !== "") {
		$("#clear-profile-filter").removeClass("hide");
		$("#plates tr:not(:first)").each(function(){
			if ($(this).data("profile") != profileFilter) {
				$(this).hide();
			}
		});
	}
	
	// Apply search filter (only to visible rows)
	if (searchText && searchText !== "") {
		$("#clear-search").removeClass("hide");
		$("#plates tr:not(:first):visible").each(function(){
			var t = $(this);
			if (t.text().toLowerCase().indexOf(searchText) === -1) {
				t.hide();
			}
		});
	}
}

// Helper function to apply profile filter
function applyProfileFilter(filterValue) {
	if (filterValue == "") {
		$("#plates tr").show();
		return;
	}
	$("#plates tr:not(:first)").each(function(){
		if ($(this).data("profile") != filterValue) {
			$(this).hide();
		} else {
			$(this).show();
		}
	});
}

// Helper function to apply search filter
function applySearchFilter(searchText) {
	$("table tr").removeClass("hide");
	$("table tr").each(function(){
		var t = $(this);
		if (t.text().toLowerCase().indexOf(searchText)===-1){
			t.addClass("hide");
		}
	});
}

// Initialize filters when document is ready
$(document).ready(function() {
	// Small delay to ensure all elements are loaded
	setTimeout(function() {
		var savedFilter = localStorage.getItem('plates-profile-filter');
		var savedSearch = localStorage.getItem('plates-search-text');
		if (savedFilter || savedSearch) {
			applyAllFilters(savedFilter, savedSearch);
		}
	}, 200);
	// Mobile sidebar toggle
	$('.navbar-toggle').click(function() {
		$('.sidebar').toggleClass('open');
	});
	
	// Close sidebar when clicking outside on mobile
	$(document).click(function(e) {
		if ($(window).width() <= 991) {
			if (!$(e.target).closest('.sidebar, .navbar-toggle').length) {
				$('.sidebar').removeClass('open');
			}
		}
	});
	
	// Set active menu item based on current page
	var currentPath = window.location.pathname;
	
	// Handle root path "/" for Dashboard
	if (currentPath === '/' || currentPath === '') {
		$('.sidebar-nav a[href="/"]').parent().addClass('active');
	} else {
		$('.sidebar-nav a[href="' + currentPath + '"]').parent().addClass('active');
	}	
});

$('#expertModeCheckbox').click(function(e) {
	e.preventDefault();
	$.ajax({url: '/printer/view/toggle',type: 'GET',dataType: 'json'}); 
	window.location.reload(true);
});

function update_plates_list(){
	$.get("/plates/list",function(d){
		$("#plates-list").html(d+"</table>");
		update_plates_resume();
		
		// Reapply filters after list update
		var currentFilter = $('#plates-profile-search').val();
		var currentSearch = $('#search').val();
		if (currentFilter || currentSearch) {
			setTimeout(function() {
				applyAllFilters(currentFilter, currentSearch);
			}, 100);
		}
	});
}
