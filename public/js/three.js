var scene, camera, renderer;

function three_init() {
	if ($("#view_3d").length===0){
		return;
	}
	scene = new THREE.Scene();
	var width = $("#view_3d").innerWidth(),height = 700;
	renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.setSize(width, height);
	document.getElementById('view_3d').appendChild(renderer.domElement);

	// Position camera
	camera = new THREE.PerspectiveCamera(-25, width / height, 0.1, 20000);
	camera.position.set(0,140,40);
	scene.add(camera);

	// Window resize handler
	window.addEventListener('resize', function() {
		var width = $("#view_3d").innerWidth(),height = 700;
		renderer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	});

	renderer.setClearColor(0x2b3e50, 1);

	// Add light
	var light = new THREE.PointLight(0xffffff);
	light.position.set(-100,200,100);
	scene.add(light);

	// Add Axis
	axes = new THREE.AxisHelper(100);
	scene.add(axes);

	// Load STL file
	var loader = new THREE.STLLoader();
	loader.load($("#view_3d").data("file"), function(geometry){
		var material = new THREE.MeshLambertMaterial({color: 0x63B655});
		var mesh = new THREE.Mesh(geometry, material);
		geometry.center();
		scene.add(mesh);
	});

	// Activate mouse
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	redraw();
}

function redraw() {
	requestAnimationFrame(redraw);
	renderer.render(scene, camera);
	controls.update();
}	