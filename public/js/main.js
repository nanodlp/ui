var favicon;
var percentage;

$(function(){
	// Run for index page
	if($('#buzzer').length>0){
		display_console_log();
		setInterval(function(){display_console_log();}, 3000);
		update_status();
		update_stat();
		setInterval(function(){update_status();}, 1500);
		setInterval(function(){update_stat();}, 5000);
		$(window).focus(function() {
			update_status();
		});
	}
	tooltip_init();
	setup_toggle_init();
	terminal_init();
	favicon_init();
	inputs_init();
	blackout_image_init();
	preview_init();
	editable_table_init();
	help_init();
	resume_init();
	three_init();
	search_init();
	plate_init();
	confirm_init();
	ajax_post_init();	
});

function ajax_post_init(){
	$(".ajax-post").on("submit",function(e){
		$.post($(this).attr("action"),$(this).serialize());
		e.preventDefault();
	});
}

function confirm_init(){
	$("body").delegate(".ask","click",function(e){
		return confirm($("#"+$(this).data("ask")).text());
	});
}

function plate_init(){
	$("body").delegate("#ZipFile","change",function(e){
		if ($("#Path").val()===""){
			var filename = $('input[type=file]').val().split('\\').pop();
			$("#Path").val(filename.split(".")[0]);
		}
	});
}

function resume_init(){
	$("body").delegate(".resume","click",function(e){
		var t=$(this);
		return confirm(t.data("confirm").replace("[LayerID]",t.parent().find("#appendedtext").val()));
	});
}

function help_init(){
	var response={};
	$('#helpModal').modal({ show: false});
	$("body").delegate(".help","click",function(e){
		var t=$(this);
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
		if ($(this).hasClass('enlarged')) {
			$(this).removeClass('enlarged');
		} else {
			$(this).addClass('enlarged');
		}
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
	}).delegate("#toggle_log","click",function(e){
		e.preventDefault();
		$("#console_wrapper").toggle();
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
function update_status(){
	$.ajax({
		url:'status',
		dataType: 'json',
		type: 'GET',
		timeout: 1200
	}).done(function(data){
		update_status.problem = 0;
		$('#msg_box').addClass("hide");
		if (update_status.running && data['Printing']==0 && $("audio#buzzer").length>0) {
			$("audio#buzzer")[0].play();
		}
		update_status.running = data['Printing'];
		update_platform_photo(data['Camera']);
		if (!data['Printing']){
			last_value('last_location','Not Printing');
			last_value('last_remaining','-');
			$("#running,#pause,.Printing,.progress").slideUp();
			$("#idle,.Idle").slideDown();
			$('#resume').hide();
			if (data['PlateID'] && data['LayerID']>1 && data['LayersCount'] > 1 + data['LayerID']) {
				$('#resume').show();
				$("#resume").attr('onclick',
					$("#resume").attr('onclick').replace('[[last_layer]]', data['LayerID']).replace('[[plate]]', data['Path'])
					);
			}
		} else {
			last_value('layer',data['LayerID']);
			last_value('layers_count',data['LayersCount']);
			last_value('plate_height',data['PlateHeight']);
			last_value('plate',data['PlateID']);
			last_value('path',data['Path']);
			last_value('layer_time',data['LayerTime']/1000000000);
			$("#idle,.Idle").slideUp();
			image_display(data['PlateID'],data['LayerID'],data['Covered']);
			if (data['Pause']) {
				$("#pause").slideDown();
				$("#running,.Printing,.progress").slideUp();
			}else{
				$("#running,.Printing,.progress").slideDown();
			}
		}
		change_stats(data,['proc','disk','mem','uptime','proc_numb','temp']);
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

function update_stat(){
	$.ajax({
		url:'stat',
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

display_console_log.prev_data='';
function display_console_log(){
	if ($("#console")[0].getBoundingClientRect()['y']<0) return;
	var last_time=-1;
	var table='';
	var image='';
	var d = new Date();
	//var n = d.getTime();
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

function update_timeline(){
	var current_layer_id = last_value('layer');
	if (!current_layer_id) current_layer_id = 0;
	last_value('last_location','Not Printing');
	last_value('last_remaining','-');
	last_value('last_plate','-');
	last_value('last_path','-');
	var current_percentage = Math.ceil(current_layer_id * 100 / last_value('layers_count'));
	if (update_status.running){
		var plate_height=last_value('plate_height');
		var current_height=plate_height/last_value('layers_count')*current_layer_id;
		last_value('last_location', current_layer_id + " of " +last_value('layers_count')+" ("+Math.round(current_height*10)/10+"/"+plate_height+"mm)");
		var remaining_time = Math.round((last_value('layers_count')-current_layer_id)*last_value('layer_time')/60);
		var total_time = Math.round(last_value('layers_count')*last_value('layer_time')/60);
		var est = new Date();
		est.setMinutes(est.getMinutes() + remaining_time);
		var eta=("0" + est.getHours()).slice(-2) + ":" + ("0" + est.getMinutes()).slice(-2);
		last_value('last_remaining', format_date(remaining_time) + " of " + format_date(total_time) + " (ETA " + eta+")");
		if (percentage!=current_percentage) {
			favicon.badge(current_percentage);
			percentage=current_percentage;
		}
	} else {
		favicon.reset();
	}
	$(".progress-bar").css("width",percentage+"%");
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
		var img = '<img src="/static/plates/' + path + '/' +layer_id+'.png">';
		if (blackout) blackout = '<img src="/static/plates/' + path + '/' +layer_id+'.png_blackout.png?" id="blackout_overlay">';
		else blackout = '';
		// onerror="setTimeout(function(){broken_image()},1000)"
		$("#image_wrapper").html(img+blackout);
		last_frame_key = layer_id;
	}
}

function body_render(row){
	var other='',formated='';
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
	$("#camera").show();
	$("#photo_wrapper").slideDown();
	$("#photo_wrapper").html('<img src="/static/shot.jpg?'+key+'">');
	$('img').error(function(){
		$(this).slideUp().remove();
   	});
}

function tooltip_init(){
	xOffset = -40;
	yOffset = 50;
	$('body').delegate('.tip','mouseenter',function(e){
		$("#tip").remove();
		var selector=$(this);
		var data=selector.data("tip");
		if (!data) return;
		$("body").append("<p id='tip'>"+ data +"</p>");
		var timeout=new Date().getTime();
		$("#tip").data("timeout",timeout);
		setTimeout(
			function(){
				tooltip_display(selector,timeout);
			},100);
	}).delegate('.tip','mouseleave',function(e){
		$("#tip").remove();
	}).delegate('.tip','mousemove',function(e){
		$("#tip").css({"top":(e.pageY - xOffset) + "px","left":(e.pageX + yOffset) + "px"});
	});
}

function tooltip_display(selector,timeout){
	if ($("#tip").data("timeout")!=timeout) return;
	$("#tip").css({"top":(selector.pageY - xOffset) + "px","left":(selector.pageX + yOffset) + "px"}).fadeIn("fast");
}

function setup_toggle_init(){
	setup_toggle();
	$("html").delegate('#setup select','change',function(e){
		setup_toggle();
	});
}

function setup_toggle(){
	$("select").each(function(){
		var select=$(this).attr("id");
		var related=select+"_toggle";
		if ($("."+related).length>0){
			if ($("#"+select).val()==0){
				$("."+related).slideUp();
			} else {
				$("."+related).slideDown();
			}
		}
	});
}

function terminal_init(){
	if ($('#terminal').length==0) return;
	$("html").delegate('.terminal a','click',function(e){
		e.preventDefault();
		$.post("/term-io",{"gcode":$("#gcode").val()});
		$("#gcode").val("").focus();
	});
	setInterval(function(){terminal_fetch();}, 1000);
}

function terminal_fetch(){
	$.get("/term-io").done(function(data){
		if (data=="") return;
		$("#terminal").append(data);
		$('#terminal').scrollTop($('#terminal')[0].scrollHeight);
	});
}

function search_init(){
	$("html").delegate('#search','change keyup',function(e){
		var needle = $(this).val().toLowerCase();
		$("table tr").removeClass("hide");
		$("table tr").each(function(){
			var t = $(this);
			if (t.text().toLowerCase().indexOf(needle)===-1){
				t.addClass("hide");
			}
		});
	});
}
