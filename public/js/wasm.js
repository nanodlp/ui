var onmessageEvents = function(e) {
    console.log(e.data[0]);
    if (e.data[0]=="layerRenderFinished"){
            finishedLayer++;
            update_progress();
    } else if (e.data[0]=="sliceFinished"){
        nanodlpCore.terminate();
        setInterval(function(){ 
            if (processLayer!=finishedLayer){
                update_progress();
                return;
            }
            $.get('/api/v1/wasm/plate/'+plateID+'/verify',function(){
                window.location.href = "/plates";
            });
        }, 1000);
    } else if (e.data[0]=="renderLayer"){
        processLayer++;
        update_progress();
        nanodlpWorker[processLayer%workerCount].postMessage(["WASMRenderLayer",e.data[1]]);
        //console.log(e.data[1].length)
    } else if (e.data[0]=="console"){
        console.log(e.data);
    } else if (e.data[0]=="plateIDUpdate"){
        plateID=e.data[1];
    } else if (e.data[0]=="sliceProgress"){
        layerCount=e.data[1];
    } else if (e.data[0]=="workerReady"){
        workerReady++;
    }
}
workerReady = 0;
update_slice_button();
var nanodlpCore = new Worker('/s/slicer.js');
update_slice_button();
workerCount = window.navigator.hardwareConcurrency-1;
if (workerCount<1)workerCount=1;
var nanodlpWorker=[];
// TODO: If worker is not available on time some layers may get missing
for (var i=0;i<workerCount;i++){
    nanodlpWorker.push(new Worker('/s/slicer.js'));
    nanodlpWorker[i].onmessage = onmessageEvents;
}
if (document.getElementById('ZipFile')!==null){
    document.getElementById('ZipFile').addEventListener('change', function() {
        update_slice_button();
    });
    document.getElementById('browser_slice').addEventListener('click', function() {
        $("#ZipFile")[0].disabled=true;
        $.post('/api/v1/wasm/plate/add/', $("#browser_slice").parents("form").serialize(), function(data) {
            save_source_file(data["PlateID"]);
            $(".progress").removeClass("hide");
            $("#browser_slice").parents("form").find("input,button").prop("disabled",true);
            var reader = new FileReader();
            reader.onload = function() {
                // TODO: Prevent possible reallocation
                var bytes = new Uint8Array(reader.result);
                nanodlpCore.postMessage(["slice",window.location.origin, JSON.stringify(data), bytes]);
            }
            reader.readAsArrayBuffer(document.getElementById('ZipFile').files[0]);
        });		
    });
}
var processLayer = 0;
var finishedLayer = 0;
var layerCount = 0;
var plateID = 0;
nanodlpCore.onmessage = onmessageEvents;
var current_finished_layer=0;
function update_progress(){
    // Prevent negative progress
    if (current_finished_layer<finishedLayer)current_finished_layer=finishedLayer;
    $(".progress-bar-main").css("width",current_finished_layer*100/layerCount+"%");
}

function update_slice_button(){
    if (document.getElementById('ZipFile')===null) return;
    var filename = document.getElementById('ZipFile').value;
    var ext = filename.substr(filename.length - 3, 3).toLowerCase();
    if ( ext == "stl"&&$("#ZipFile")[0].files[0].size<5000000000&&typeof(nanodlpCore)!=="undefined") { // ||  ext == "obj"
        document.getElementById('browser_slice').disabled=false;
    } else {
        document.getElementById('browser_slice').disabled=true;
    }
}

function save_source_file(plateID){
    $("#ZipFile")[0].disabled=false;
    var form_data = new FormData($("#browser_slice").parents("form")[0]);
    $.ajax({
        method: 'post',
        processData: false,
        contentType: false,
        cache: false,
        data: form_data,
        enctype: 'multipart/form-data',
        url: "/api/v1/wasm/plate/add/source/"+plateID
    });
}

function checkRegenerate(){
    if (document.getElementById('wasm')===null) return;
    if (!window.jQuery || workerReady<workerCount+1) {
        setTimeout(function() { checkRegenerate() }, 50);
        return
    }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', $("#wasm").data("source"), true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function(e) {
      if (this.status == 200) {
        var bytes = new Uint8Array(this.response);
        nanodlpCore.postMessage(["slice",window.location.origin, JSON.stringify($("#wasm").data("options")), bytes]);
      }
    };    
    xhr.send();
}

checkRegenerate();
