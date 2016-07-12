
var PHcallback;
var mouseConstraint;

function physics_start(get_PHcallback) {
	PHcallback = get_PHcallback;
	if(typeof Matter === "undefined") {
		waitbox_start();
		var scrpt = document.createElement('script');
		scrpt.onload = function() {
			physics_start_now();
		}

		scrpt.src = ROOT_URL + 'rsc/libs/matter/matter.min.js';
		document.head.appendChild(scrpt);
	} else {
		physics_start_now();
	}
}

function physics_resize() {
	if(typeof Matter !== "undefined") {
		Matter.Mouse.setScale(mouseConstraint.mouse, {x: 1 / slides_scale, y: 1 / slides_scale});
	}
}

var phEngine;
function physics_start_now() {
	phEngine = Matter.Engine.create(currentSlide, { 
		render: {
			options: {
				wireframes: false,
				width: int(currentSlide.style.width),
				height: int(currentSlide.style.height)
			}
		}
	});

	mouseConstraint = Matter.MouseConstraint.create(phEngine);
	Matter.World.add(phEngine.world, mouseConstraint);
	Matter.Engine.run(phEngine);
	
	phEngine.render.canvas.width = 1920;
	phEngine.render.canvas.height = 1080;
	phEngine.render.canvas.style.left = "0px";
	phEngine.render.canvas.style.top = "0px";
	
	physics_resize();
	waitbox_end();
	PHcallback();
}
