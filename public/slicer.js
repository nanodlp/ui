importScripts("wasm_exec.js")
const go = new Go();
WebAssembly.instantiateStreaming(fetch("/s/nanodlp.wasm?1"), go.importObject).then((result) => {
  go.run(result.instance);
});

function updatePlateID(plateID){
	postMessage(["plateIDUpdate",plateID]);
}

function updateLayerCount(percentage){
	postMessage(["sliceProgress",percentage]);
}

function post_render(data){
	postMessage(["renderLayer",data]);
}

function WASMIsReady(){
	postMessage(["workerReady"]);
}

onmessage = function(e) {
	console.log(e.data[0],e.data[1])
	if (e.data[0]=="slice"){
		// window.location.origin, JSON.stringify(data), bytes
		BrowserSliceUpload(e.data[1], e.data[2], e.data[3]);
		postMessage(["sliceFinished"]);
	} else if (e.data[0]=="WASMRenderLayer"){
		WASMRenderLayer(e.data[1]);
		postMessage(["layerRenderFinished"]);
	}
}
