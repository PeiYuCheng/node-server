var meta = document.createElement('meta');
meta.setAttribute("name", "google-signin-client_id");            
meta.setAttribute("content", "472698188618-4huh139rfed570bljt83t5cso575b68r.apps.googleusercontent.com");
document.getElementsByTagName('head')[0].appendChild(meta);

//var ROOT_URL = (document.location.origin ? document.location.origin : window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port: '')) + '/';
// ROOT_URL can be remove as declared in the source doc, keep for backward compatibility v1.39
var serverKey = document.location.hostname;

var PEN_MOUSE_ID = 999999;
var touchMap = [];
var lastHitpos = { x: 0, y: 0 };

var editor = false;
var playMode = true;
var activeTool = "dot_play"; // < - - - TO REMOVE

var users = users != "" ? users = JSON.parse(memget('users')) : [];
var userid = memget("userid");
if(userid == null || userid == "null") userid = "";

var starting = true;
var slides_max = 50;
var currentSlide = null;
var slide_index = 0;
var slides_count = 0;
var slides_scale = 0;
var slidesPos = {};
var slides_width = 1920;
var slides_height = 1080;
var preview = false;
var ohref = String(document.location);
var docid = ohref.split(".html")[0];
docid = docid.split("/")[docid.split("/").length - 2];
document.addEventListener("keydown", function (event) { lastUserInteraction = Date.now(); });

var scrpt = new Array;
for(var i = 0; i < 3; i++) scrpt[i] = document.createElement('script');
scrpt[0].src = ROOT_URL + 'bin/shared/message.js?' + version;
scrpt[1].src = ROOT_URL + 'bin/shared/slides.js?' + version;
scrpt[2].src = ROOT_URL + 'bin/shared/physics.js?' + version;
for(var i = 0; i < 3; i++) document.head.appendChild(scrpt[i]);

function scaleX(x) { return ((x - slidesPos.left) / slides_scale); }
function scaleY(y) { return ((y - slidesPos.top) / slides_scale); }

function unscaleX(x) { return (x * slides_scale + slidesPos.left); }
function unscaleY(y) { return (y * slides_scale + slidesPos.top); }

var scr = { w: 0, h: 0 };
var slides;
var silentMode = true;
var loaded = false;

documentSavedOnce = true;

	slides = document.getElementsByClassName("slide");
	slides_count = slides.length;
	for(var i = 0; i < slides_count; i++) {
		slides.item(i).style.display = "none";
		slides.item(i).style.opacity = 0;
		slides.item(i).style.position = "absolute";
	}


window.addEventListener("load", function() {
//alert();		
	/*
	slides = document.getElementsByClassName("slide");
	slides_count = slides.length;
	for(var i = 0; i < slides_count; i++) {
		slides.item(i).style.display = "none";
		slides.item(i).style.opacity = 0;
		slides.item(i).style.position = "absolute";
	}
*/
	//resize();
//	setTimeout(function() {
		var slides = document.getElementsByClassName("slide");
		slides_count = slides.length;
		
		slide_index = parseInt(openSlideWhenReady);
		slide_index = slide_index < 0 ? 0 : (slide_index > slides_count ? slides_count - 1 : slide_index);
		openSlideWhenReady = 0;
		currentSlide = slides.item(slide_index);
		applyBackgroundColor(currentSlide.style.backgroundColor);
		
//		setTimeout(function() {
			currentSlide.style.display = "block";
			loaded = true;
			var slides = document.getElementsByClassName("slide");
			slides_count = slides.length;
			for(var i = 0; i < slides_count; i++) {
				if(currentSlide != slides.item(i)) {
					slides.item(i).style.display = "none";
				}
			}
			resize();
			DOM("waitboxBg").style.opacity = 0;
			
			
			session_initialize();
			window.setTimeout(function() {
				initializeGlobalEvents();
				initializeSlideEvents();
			}, 150);

			currentSlide.style.display = "block";
			currentSlide.style.visibility = "visible";
			
			
			currentSlide.style.opacity = 1;
			
//		}, 500);
		window.addEventListener('orientationchange', rotate);
		window.addEventListener('resize', resize);
		
		//setTimeout(function() { window.scroll(0, 1); }, 650);
		//setTimeout(function() { resize(); }, 250);
		
//	}, 300)
	
});

function rotate() {
	resize();
	setTimeout(function() {
		resize();
		window.scroll(0, 1);
	}, 650);
}

function resize() {
	scr = {
		w: window.innerWidth,
		h: window.innerHeight
	}
	var slides = document.getElementsByClassName("slide");
	var slides_count = slides.length;
	if(scr.w / slides_width < scr.h / slides_height) {
		slides_scale = (scr.w / slides_width);
	} else {
		slides_scale = (scr.h / slides_height);
	}

	var slides_left = (scr.w / 2 - (slides_width / 2));
	var slides_top = (scr.h / 2 - (slides_height / 2));

	// Slides
	for(var i = 0; i < slides_count; i++) {
		slides.item(i).style.transform = "scale(" + slides_scale + ")";
		slides.item(i).style.webkitTransform = "scale(" + slides_scale + ")";
		slides.item(i).style.width = slides_width + "px";
		slides.item(i).style.height = slides_height + "px";
		slides.item(i).style.left = slides_left + "px";
		slides.item(i).style.top = slides_top + "px";
	}
	slidesPos.width = slides_width * slides_scale;
	slidesPos.height = slides_height * slides_scale;
	slidesPos.left = (scr.w  /2 - slidesPos.width / 2 );
	slidesPos.top = (scr.h / 2 - slidesPos.height / 2);
	
	if(loaded) physics_resize();
}
resize();

function nextSlide() {
	var slideShown = false;
	var showThisSlide = false;
	var slides = document.getElementsByClassName("slide");
	var slides_count = slides.length;	

	for(var i = 0; i < slides_count && !slideShown; i++) {
		if(showThisSlide) {
			slides.item(i).style.display = "block";
			slides.item(i).style.opacity = 1;
			slideShown = true;
		} else {
			if(slides.item(i).style.display == "block") {
				slides.item(i).style.display = "none";
				slides.item(i).style.opacity = 0;
				
				showThisSlide = true;
			}
		}
	}
	if(!slideShown) {
		slides.item(0).style.display = "block";
		slides.item(i).style.opacity = 1;
	}
}

window.addEventListener('dblclick', function(e) { e.preventDefault(); } );
window.addEventListener('contextmenu', function(e) { e.preventDefault(); } );

// ------------- Mouse

document.addEventListener("mousedown", mousestart_dispatch, false );
document.addEventListener("mousemove", mousemove_dispatch, false );
document.addEventListener("mouseup", mouseend_dispatch, false );
function mousestart_dispatch(event) { if(event.button == 0) input_start(event, PEN_MOUSE_ID, { x: event.clientX, y: event.clientY })}
function mousemove_dispatch(event) { if(event.button == 0) input_move(event, PEN_MOUSE_ID, { x: event.clientX, y: event.clientY })}
function mouseend_dispatch(event) { if(event.button == 0) input_end(event, PEN_MOUSE_ID, { x: event.clientX, y: event.clientY })}

// ------------- Pointer

document.addEventListener("pointerdown", pointerstart_dispatch, false );
document.addEventListener("pointermove", pointermove_dispatch, false );
document.addEventListener("pointerup", pointerend_dispatch, false );
function pointerstart_dispatch(event) { input_start(event, event.pointerId, { x: event.clientX, y: event.clientY })}
function pointermove_dispatch(event) { input_move(event, event.pointerId, { x: event.clientX, y: event.clientY })}
function pointerend_dispatch(event) { input_end(event, event.pointerId, { x: event.clientX, y: event.clientY })}


// ------------- Touch

document.addEventListener("touchstart", touchstart_dispatch, false );
document.addEventListener("touchmove", touchmove_dispatch, false );
document.addEventListener("touchend", touchend_dispatch, false );
function touchstart_dispatch(event) {
	if(typeof event.changedTouches != "undefined") {
		for(var ptr = 0, touchCount = event.changedTouches.length; ptr < touchCount; ptr++) { input_start(event, event.changedTouches[ptr].identifier, { x: ~~event.changedTouches[ptr].clientX, y: ~~event.changedTouches[ptr].clientY })}
	} else { input_start(event, event.pointerId, { x: ~~event.clientX, y: ~~event.clientY })}	
}
function touchmove_dispatch(event) {
	if(typeof event.changedTouches != "undefined") {
		for(var ptr = 0, touchCount = event.changedTouches.length; ptr < touchCount; ptr++) { input_move(event, event.changedTouches[ptr].identifier, { x: ~~event.changedTouches[ptr].clientX, y: ~~event.changedTouches[ptr].clientY })}
	} else { input_move(event, event.pointerId, { x: ~~event.clientX, y: ~~event.clientY })}
}
function touchend_dispatch(event) {
	if(typeof event.changedTouches != "undefined") {
		for(var ptr = 0, touchCount = event.changedTouches.length; ptr < touchCount; ptr++) { input_end(event, event.changedTouches[ptr].identifier, { x: ~~event.changedTouches[ptr].clientX, y: ~~event.changedTouches[ptr].clientY })}
	} else { input_end(event, event.pointerId, { x: ~~event.clientX, y: ~~event.clientY })}		
}

// ----------------------------- input

var cancelInput = false;
var latestInteractObject = null;
function input_start(event, inputId, hitpos) {
	if(!event.target.hasAttribute("DEFAULT_BEHAVIOR")) {
		latestInteractObject = event.target;
		cancelInput = false;
		var relpos = { x: scaleX(hitpos.x), y: scaleY(hitpos.y) }

		event.preventDefault();

		lastHitpos = hitpos;
		
		var proximitySelectable = false;
		
		// Determine the element to interact with
		var id = event.target.getAttribute("id");
		var classn = event.target.getAttribute("class");
		
		if(classn == "slide" || id == "VECTOR_SELECT") { // Proximity discovery (selectable)
			var hit = findElementAround(hitpos.x, hitpos.y);
			if(hit) {
				id = hit.parentNode.id;
				proximitySelectable = true;
			}
		} else { // Direct hit
			
			var seek = event.target;
			while((seek.tagName === "path" || seek.tagName === "g") && typeof seek.parentNode !== "undefined") {
				seek = seek.parentNode;
				id = seek.id;
			}
			
			if(id === null && typeof event.target.parentNode !== "undefined" && typeof event.target.parentNode.getAttribute !== "undefined") {
				id = event.target.parentNode.getAttribute("id");
				if(id === null && typeof event.target.parentNode.parentNode !== "undefined") {
					id = event.target.parentNode.parentNode.getAttribute("id");
				}
			}
			
		}
		
		var element = DOM(id);
		if(element !== null) {
			var gbcr = element.getBoundingClientRect();
			
			// Information related to the input event
			touchMap[inputId] = {
				id: id,
				element: element,
				initialElementRect: gbcr,
				initialHitpos: hitpos,
				hitpos: hitpos,
				relpos: relpos,
				deltaHit: { x: hitpos.x - gbcr.left, y: hitpos.y - gbcr.top },
				active: true,
				amv: false,
				movable: element.getAttribute("interaction") == "xy",
				selectable: proximitySelectable || element.getAttribute("selectable") == "true" ||  element.getAttribute("selectable") == "text" || element.getAttribute("precisionselect") == "true",
				moveTarget: typeof element.getAttribute("movetarget") == "string" ? DOM(element.getAttribute("movetarget")) : element,
				moveDistance: 0
			}

			if( touchMap[inputId].moveTarget.hasAttribute("inputstart")) {
				eval ( "inputId = " + inputId + "; " + touchMap[inputId].moveTarget.getAttribute("inputstart") );
			}
			
			if(touchMap[inputId].moveTarget.hasAttribute("amv") ) {
				touchMap[inputId].amv = touchMap[inputId].moveTarget.getAttribute("amv");
			}
			if(touchMap[inputId].moveTarget.hasAttribute("astart") ) {
				executeActionCode(touchMap[inputId].moveTarget, "Touch Start", touchMap[inputId].id, touchMap[inputId].moveTarget.getAttribute("astart"));
			}
		}
	}
}

function input_move(event, inputId, hitpos) {
	lastUserInteraction = Date.now();
	
	if(event.target && !event.target.hasAttribute("DEFAULT_BEHAVIOR")) {
		event.preventDefault();
		lastHitpos = hitpos;
		
		var ebag = touchMap[inputId];

		if(!cancelInput && ebag) {
			if(ebag.active) {

				ebag.relpos = { x: scaleX(hitpos.x), y: scaleY(hitpos.y) }

				ebag.hitpos = hitpos;
				ebag.moveDistance = getDistance ( ebag.initialHitpos, hitpos );
				if(ebag.movable) {
					var pid = ebag.element.parentNode.id;
					if(pid == "dot_tools" || pid == "ROOT") { // No scale
						var targetX = (hitpos.x - ebag.deltaHit.x);
						var targetY = (hitpos.y - ebag.deltaHit.y);
						if(targetX < -ebag.initialElementRect.width / 2) targetX = -ebag.initialElementRect.width / 2;
						if(targetY < -ebag.initialElementRect.height / 2) targetY = -ebag.initialElementRect.height / 2;
						if(targetX > scr.w - ebag.initialElementRect.width / 2) targetX = scr.w - ebag.initialElementRect.width / 2;
						if(targetY > scr.h - ebag.initialElementRect.height / 2) targetY = scr.h - ebag.initialElementRect.height / 2;
					
					} else { // With scale
						var targetX = (ebag.relpos.x - (ebag.deltaHit.x / slides_scale));
						var targetY = (ebag.relpos.y - (ebag.deltaHit.y / slides_scale));
						if(targetX < scaleX(-ebag.initialElementRect.width / 2)) targetX = scaleX(-ebag.initialElementRect.width / 2);
						if(targetY < scaleY(-ebag.initialElementRect.height / 2)) targetY = scaleY(-ebag.initialElementRect.height / 2);
						if(targetX > scaleX(scr.w - ebag.initialElementRect.width / 2)) targetX = scaleX(scr.w - ebag.initialElementRect.width / 2);
						if(targetY > scaleY(scr.h - ebag.initialElementRect.height / 2)) targetY = scaleY(scr.h - ebag.initialElementRect.height / 2);
						
					}
					
					ebag.moveTarget.style.left = targetX + "px";
					ebag.moveTarget.style.top = targetY + "px";
				}
				
				if( ebag.moveTarget.hasAttribute("inputchange")) {
					eval ( "inputId = " + inputId + "; " + ebag.moveTarget.getAttribute("inputchange") );
				}
				
				if(ebag.amv !== false) {
					executeActionCode(ebag.moveTarget, "Touch Move", ebag.id, ebag.amv);
				}
			}
		}
	}
}

function input_end(event, inputId, hitpos) {
	if(!event.target.hasAttribute("DEFAULT_BEHAVIOR")) {
		event.preventDefault();
		lastHitpos = hitpos;
		var ebag =  touchMap[inputId];
		if(!cancelInput && ebag) {
			ebag.relpos = { x: scaleX(hitpos.x), y: scaleY(hitpos.y) }
		
			if( ebag.moveTarget.hasAttribute("inputend")) {
				eval ( "inputId = " + inputId + "; " + ebag.moveTarget.getAttribute("inputend") );
			} else {
				if(playMode && ebag.moveTarget.hasAttribute("aend") ) {
					executeActionCode(ebag.moveTarget, "Touch", ebag.id, ebag.moveTarget.getAttribute("aend"));
				}
				if( touchMap[inputId].moveDistance < 10) { 
			
					var disableAutoNext = false;
					if(ebag.moveTarget.hasAttribute("autozoom")) {
						disableAutoNext = true;
						autozoom(ebag.moveTarget);
					}

					
					if( ebag.moveTarget.hasAttribute("inputpress")) {
						eval ( "inputId = " + inputId + "; " + ebag.moveTarget.getAttribute("inputpress") );
					} else {
						if(currentSlide.querySelector("[ainit]") === null && 
							currentSlide.querySelector("[aclk]") === null && 
							currentSlide.querySelector("[aclke]") === null && 
							currentSlide.querySelector("[astart]") === null &&
							currentSlide.querySelector("[amv]") === null &&
							currentSlide.querySelector("[aend]") === null
						) { // No custom behavior: go to next slide
							if(autonav && !disableAutoNext) slide_next();
						} else {
							if( ebag.moveTarget.hasAttribute("aclk") ) { // interactive mode
								executeActionCode(ebag.moveTarget, ebag.id, "Action", ebag.moveTarget.getAttribute("aclk"));
							}
							if(ebag.moveTarget.hasAttribute("aclke") ) { // interactive mode (easy)
								executeActionCode(ebag.moveTarget, ebag.id, "Action", 'go("' + ebag.moveTarget.getAttribute("aclke") + '")');
							}
						}
					}
				}
			}
			touchMap[inputId].active = false;
		}
	}
}


// ---------------------------------------------------------------------------------


var FINDELEM_MAX_STEPS = 36;
var FINDELEM_PRECISION = 1;

function findElementAround(x, y) {
	var found = false;
	var hit = document.elementFromPoint(x, y);
	if(hit !== null && (hit.getAttribute("selectable") == "true" || hit.getAttribute("selectable") == "text" || hit.getAttribute("precisionselect") == "true")) { // Found SVG
		found = hit;
	}
	for(var angle = 0; angle < FINDELEM_MAX_STEPS && !found; angle++) {
		var es = (FINDELEM_MAX_STEPS - angle+5) * (FINDELEM_MAX_STEPS - angle+5) * FINDELEM_PRECISION;
		var r = (0 + angle * 2 + (FINDELEM_MAX_STEPS - angle) /10) / 4;
		var ex = Math.sin(es / 180 * Math.PI) * r + x;
		var ey = Math.cos(es / 180 * Math.PI) * r + y; 
		hit = document.elementFromPoint(ex, ey);
		if(hit !== null && (hit.getAttribute("selectable") == "true" || hit.getAttribute("selectable") == "text" || hit.getAttribute("precisionselect") == "true")) { // Found SVG
			found = hit;
		}
	}
	return(found);
}

// -----------------------------------------------------------------------------------------------

function DOM(strx, returnAll) {
	if(strx && typeof strx !== "undefined") {
		if(strx !== "") {
			if(strx[0] == ".") {
				return(returnAll === true ? document.getElementsByClassName(strx.substr(1)) : document.getElementsByClassName(strx.substr(1))[0]);
			} else {
				return(document.getElementById(strx));
			}
		}
	}
	return(null);
}

// Distance between two points
function getDistance( a, b ) {
	var xs = b.x - a.x, ys = b.y - a.y;
	return Math.sqrt( xs * xs + ys * ys );
}



