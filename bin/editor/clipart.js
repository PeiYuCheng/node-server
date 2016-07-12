
var iconData = [];
var clipart_color = "rgb(55, 71, 79)";

var disk_canvas = {};
var disk_image = {};
var disk_div;
var disk_vector = {};
var disk_imageMap;
var disk_canvasMap;
var disk_current = "";
var disk_mapContext;
var clp_colorToIndex = []; // Icon index from color

var clp_singleTouchInteraction = -1;
var clp_startPos = { x: 0, y: 0 }
var clp_startMove = { x: 0, y: 0 }
var clp_interacting = 0;
var clp_angle = 0;
var clp_start_angle = 0;
var first_live_angle = -1;
var firstClpAngle = -1;
var thispos;
var clipWinSize = 640;
var canSlideToHide = true;

var toRender = {  2:"symbol", 0:"object", 1: "nature"  }
var currentRendering = -1;
	
var clipart_initialized = false;

function clipart_init() {
	if(typeof isrc == "undefined") {
		waitbox_start();
		var scrpt = document.createElement('script');
		scrpt.onerror = function() {
			waitbox_end();
			message_start("Please Retry", "Your Internet access may be down")
			window.setTimeout(function() {
				message_end();
			}, 3000);
		}		
		scrpt.onload = function() {
			clipart_init_finalize();
			waitbox_end();
		}
		scrpt.src='rsc/bank.js';
		document.head.appendChild(scrpt);		
	} else {
		clipart_init_finalize();
	}
}
function clipart_init_finalize() {
	disk_div = document.createElement('div');
	disk_div.setAttribute("id", "CLIPART");
	disk_div.setAttribute("class", "clipart_window");
	
	for(var idx = 0; idx < iconsBankCount; idx++) {
		var splitPos = isrc[idx].indexOf("<");
		iconData[idx] = {
			param: isrc[idx].substr(0, splitPos).split(","),
			data: isrc[idx].substr(splitPos)
		}
	}
	clipart_initialized = true;
	rendering_done();
}

function rendering_done() {
	if(++currentRendering < 3) {
		clipart_renderCategory(toRender[currentRendering]);
	} else {
		DOM("ROOT").appendChild(disk_div);
		disk_div.style.right = "-640px";
		disk_div.style.bottom = "-640px";
		disk_div.offsetHeight;
		disk_div.style.transition = "right .8s, bottom .8s";

		update_disk_visibility();
		clipart_show_now();
	}
}

// ------------------------------ Selection -------------------------------------

function clipart_selected() {
	clipart_color = selection.childNodes[0].getAttribute("fill");
/*	if(DOMC("icon icon-check clpcolor") !== null) DOMC("icon icon-check clpcolor").className = "";
	for(var ptr = 0; ptr <= 7; ptr++) {
		var id = "dot_CLPCOLOR_" + ptr;
		if(DOM(id).style.backgroundColor == clipart_color) {
			DOM(id).children[0].className = "icon icon-check clpcolor";
			DOM(id).children[0].style.color = get_visible_color(clipart_color);
		}
	} */
	clipart_colorate_selection();
	DOM("dot_clipart_color").style.backgroundColor = clipart_color;				
	DOM("label_clipart_color").style.fill = get_visible_color(clipart_color);
}

// ------------------------------ Input events -------------------------------------

function clipartMouseWheel(delta) {
	clipart_deltaRotate(-delta * 1);
}

function clp_start(hitid) {
	clp_mouseDown = true;
	var ebag = touchMap[hitid];
	
	ignoreClipAddition = false;
	canSlideToHide = true;
	if(clp_singleTouchInteraction == -1) {
		clp_singleTouchInteraction = hitid;
		// get current rotation
		first_live_angle = -1;
		firstClpAngle = -1;
		var rotationString = DOM("CLIPART_canvas_" + disk_current).style.transform;
		if(typeof rotationString == "undefined" || rotationString == "") {
			clp_start_angle = 0;
		} else {			
			var rs = rotationString.indexOf("rotation(") + 8;
			var rr = rotationString.indexOf("deg)", rs);
			clp_start_angle = ~~rotationString.substr(rs, rr - rs)
		}

		thispos = DOM("CLIPART").getBoundingClientRect();
		clp_startPos.x = ebag.hitpos.x;
		clp_startPos.y = ebag.hitpos.y;
		clp_startMove = {
			x: clp_startPos.x  - (thispos.left + thispos.width / 2 - clipWinSize / 2),
			y: clp_startPos.y  - (thispos.top + thispos.height / 2 - clipWinSize / 2)
		}
		
		var distance = getDistance( 
			{ x: clp_startMove.x, y: clp_startMove.y }, 
			{ x: clipWinSize / 2, y: clipWinSize / 2 } 
		);
		
		clp_interacting = distance > 100 ? 1 : 2; // 1 is rotate, 2 is move
	}
	
	
}
function clp_move(hitid) {
	var ebag = touchMap[hitid];
	
	if(clp_singleTouchInteraction == hitid) {
		if(clp_interacting == 2) {
		/*	var want = ( ebag.hitpos.x -  clp_startMove.x);// ------------------------ TO RESTORE
			if(want < -320) want = -320;
			if(want > scr.w + 320) want = scr.w + 320;
			DOM("CLIPART").style.left = want + "px";
			clipart_refresh();*/
		}
		if(clp_interacting == 1) {
			thispos = DOM("CLIPART").getBoundingClientRect();
			var a = { x: clp_startPos.x, y: clp_startPos.y };
			var b = { x: ebag.hitpos.x, y: ebag.hitpos.y };
			var c = { x: thispos.width / 2 + thispos.left, y: thispos.height / 2 + thispos.top };
			
			clp_angle = Math.atan2(b.x - c.x, - (b.y - c.y) ) * (180/Math.PI); 
			if(first_live_angle == -1) first_live_angle = clp_angle;		
		
			DOM("CLIPART_canvas_"+disk_current).style.transform = "rotate("+ (clp_angle + clp_start_angle - first_live_angle) +"deg)"
			DOM("CLIPART_canvas_"+disk_current).style.webkitTransform = "rotate("+ (clp_angle + clp_start_angle - first_live_angle) +"deg)"
			
			latestClpAngle = clp_angle + clp_start_angle - first_live_angle;
			if(firstClpAngle == -1) firstClpAngle = clp_angle + clp_start_angle - first_live_angle;
			
			var deltaAngle = Math.abs(( clp_start_angle - latestClpAngle ));
			if(deltaAngle < 5 && canSlideToHide) {
				var distance = getDistance( clp_startPos, ebag.hitpos );	
				if(distance > 30 && ebag.hitpos.y > ebag.initialHitpos.y) {
					DOM("CLIPART").style.bottom = (-340 - ebag.hitpos.y -  clp_startMove.y) + "px";
					
					ignoreClipAddition = true;
					
					if(distance > 170) {
						clipart_hide();
						clp_singleTouchInteraction = -1;
						clp_interacting = false;
					}
					
				} else {
					DOM("CLIPART").style.right = "-340px";
					DOM("CLIPART").style.bottom = "-340px";
				}
			} else {
				clipart_refresh()
				canSlideToHide = false;
				DOM("CLIPART").style.right = "-340px";
				DOM("CLIPART").style.bottom = "-340px";
			}
		}
	}
}
var latestClpAngle = 0;
var ignoreClipAddition = false;
function clp_end(hitid) {
	if(clp_interacting == 2) {
		// Click on the center of the disk
	} else {
		var ebag = touchMap[hitid];
		if(clp_singleTouchInteraction == hitid && !ignoreClipAddition) {

			var iconIndex = getIconIndexFromPos(ebag.hitpos);
			if(iconIndex > -1) {
				var deltaAngle = Math.abs(( clp_start_angle - latestClpAngle )); // Prevent adding clipart when rotation is detected	
				if(deltaAngle < 3.5) {
					clipart_insertToSlide( iconIndex );
				}
			}
		}
	}
	clp_interacting = false;
	clp_singleTouchInteraction = -1;
	clp_mouseDown = false;
	clipart_refresh();
}

function clipart_select_disk(tag) {
	disk_current = tag;
	update_disk_visibility();
}

function update_disk_visibility() {
	disk_image["object"].style.display = "none"
	disk_image["nature"].style.display = "none"
	disk_image["symbol"].style.display = "none"
	disk_image[disk_current].style.display = "block"
	clipart_directRotate(0)
}

// Find icon based on rotation and color map
function getIconIndexFromPos(hitpos) {
	var gbound = DOM("CLIPART").getBoundingClientRect;
	// Position based on bottom-right dock
	var x = ~~(hitpos.x - (scr.w - 300));
	var y = ~~(hitpos.y - (scr.h - 300));
	var radians = (Math.PI / 180) * ( latestClpAngle);
	var sz = clipWinSize / 2;
	var arad = (Math.PI / 180) * latestClpAngle;
	var tx = ~~(Math.cos(arad) * (x - sz)) + (Math.sin(arad) * (y - sz)) + sz;
	var ty = ~~(Math.cos(arad) * (y - sz)) - (Math.sin(arad) * (x - sz)) + sz;	
	var disk_mapData = disk_mapContext.getImageData(tx, ty, 1, 1);

	if(disk_mapData.data[0] > 0 && typeof clp_colorToIndex[disk_current][disk_mapData.data[0]] != "undefined") {
		return( clp_colorToIndex[disk_current][disk_mapData.data[0]] );
	} else {
		return(-1);
	}
}

function clipart_hide_from_cross() {
	switch_root("dot_plus", "dot_clipart");
	if(clipart_initialized) {
		clipart_hide();
	}
}
function clipart_hide() {
	if(clipart_initialized) {
		DOM("CLIPART").style.right = "-640px";
		DOM("CLIPART").style.bottom = "-640px";
		clipart_visibility = false;
		clipart_refresh();
	}
}

var tagWhenShow = "";
function clipart_show(tag) {
	tagWhenShow = tag;
	if(!clipart_initialized) {
		clipart_init();
	} else {
		clipart_show_now();
	}
}
function clipart_show_now() {
	latestClpAngle = 0;
	clipart_visibility = true;
	clipart_refresh();
	DOM("CLIPART").style.right = "-340px";
	DOM("CLIPART").style.bottom = "-340px";

	if(tagWhenShow !== "") {
		clipart_select_disk(tagWhenShow);
		tagWhenShow = "";
	}	
}

// ----------------------------------------- refresh ------------------------------

var clipart_visibility_state = false;
var clipart_visibility = false;

function clipart_refresh() {
	if(!!DOM("CLIPART")) {
		var current = parseInt(DOM("CLIPART").style.left);
		var want = current;
		if(current < -320) want = -320;
		if(current > scr.w + 320) want = scr.w + 320;
		if(want !== current) {
			DOM("CLIPART").style.left = want + "px";
		}
	}
	
	if(clipart_visibility_state != clipart_visibility) {
		clipart_visibility_state = clipart_visibility; 
	}

		
}
function mclick_icon(element, idx) {
	clipart_insertToSlide(idx);
}


function clipart_renderCategory(tag) {
	disk_current = tag;
	var H = "";
	var vectorMap = "";
	var pointer = 0;
	clp_colorToIndex[disk_current] = []

	// Color map for hit tests
	disk_canvasMap = document.createElement('canvas');
	disk_canvasMap.width = 640;
	disk_canvasMap.height = 640;
	if(disk_current == "object") { // We build the color map for object to use it for all
		disk_mapContext = disk_canvasMap.getContext('2d');
	}

	H += "<circle cx='320' cy='320' r='320' fill='#CAD3DF' />";
	H += "<circle cx='320' cy='320' r='318' fill='#FFFFFF' />";
	H += "<circle cx='320' cy='320' r='100' fill='#CAD3DF' />";
	
	var disk_current2 = disk_current;
	if(disk_current == "symbol") disk_current2 = "abstract";
	if(disk_current == "nature") disk_current2 = "people";
	for(var idx = 0; idx < iconsBankCount; idx++) {
		if(itags[idx].indexOf(disk_current) > -1 || itags[idx].indexOf(disk_current2) > -1) {
			pointer++;
			var spacing = -1;
			var radius = 0;
			if(pointer <= 40) {
				spacing = 9;
				radius = 290;
			}
			if(pointer > 40 && pointer <= 70) {
				spacing = 12;
				radius = 240;
				
			}
			if(pointer > 70 && pointer <= 94) {
				spacing = 15;
				radius = 190;
			}
			if(pointer > 94 && pointer <= 112) {
				spacing = 20;
				radius = 140;
			}
			
			if(spacing > -1) {
				var x = Math.sin( pointer * spacing  / 180 * Math.PI) * radius + 320 - 15;
				var y = Math.cos( pointer * spacing  / 180 * Math.PI) * radius + 320 - 15;
				var angle = 360 - pointer * spacing + 180;

				// Icon
				H += "<g transform=' translate("+x+", "+y+") scale(.3)'><g transform='rotate(" + angle + ", 50, 50)' fill='#AAB3BF'>" + iconData[idx].data + "</g></g>"
				
				// Color map
				if(disk_current == "object") {
					disk_mapContext.beginPath();
					disk_mapContext.arc(x + 15, y + 15, 25, 0, 2 * Math.PI, false);
					disk_mapContext.fillStyle = "rgb(" + ~~(pointer * 2) + ",0,0)"
					disk_mapContext.fill();
				}
				
				clp_colorToIndex[disk_current][pointer * 2] = idx;
			}
		}
	}
	
	// TO CANVAS
	// Convert SVG to image for rendering
	disk_vector[disk_current] = '<?xml version="1.0" encoding="utf-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="640" height="640" viewBox="0 0 640 640" fill="rgb(205,205,205)">'+H+'</svg>'
	disk_image[disk_current] = new Image();
	disk_image[disk_current].onload = function () {
		disk_image[disk_current].setAttribute("id", "CLIPART_canvas_"+disk_current);
		disk_image[disk_current].setAttribute("class", "clipart_wcanvas");
		disk_image[disk_current].setAttribute("inputstart", "clp_start(inputId);");
		disk_image[disk_current].setAttribute("inputchange", "clp_move(inputId);");
		disk_image[disk_current].setAttribute("inputend", "clp_end(inputId);");
		disk_image[disk_current].setAttribute("inputwheel", "clipartMouseWheel(delta);");
		disk_div.appendChild(disk_image[disk_current]);
		rendering_done();
	}
	disk_image[disk_current].src = 'data:image/svg+xml,' + escape(disk_vector[disk_current]);
}

function clipart_colorate_selection() {
	if(selection !== null) {
		selection.childNodes[0].setAttribute("fill", clipart_color);
		DOM("label_clipart_color").style.fill = get_visible_color(clipart_color);
	}
}


// ----------------------------------------- Insert ------------------------------

//var clipartInsertIndex = 0;
function clipart_insertToSlide(idx) {
	var objectSize = 200;
	
	// SVG
	var element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	var thisPos = getInsertionPosition(element, objectSize, objectSize);
	
	element.setAttribute("class", "clipartElement");
	element.style.left = thisPos.x + "px";
	element.style.top = thisPos.y + "px";
	element.style.width = objectSize + "px";
	element.style.height = objectSize + "px";
	element.style.zIndex = String(zIndexBase);
	
	element.setAttribute("precisionselect", "true");
	element.setAttribute("movable", "true");
	element.setAttribute("selectable", "true");
	element.setAttribute("removable", "true");
	element.setAttribute("draggable", "false");
	element.setAttribute("dotid", "dot_clipart"); // To select the tool when the element is selected
	element.setAttribute("eonresize", "shapeOnResize(w, h)");
	element.setAttribute("viewBox",  "-3 -3 106 106");
	element.id = "CLPA_" + Date.now();

	// PATH data
	var pa = iconData[idx].data.indexOf("\"") + 1;
	var pb = iconData[idx].data.indexOf("\"", pa);
	var pathData = iconData[idx].data.substr(pa, pb - pa);
	
	// PATH rendering
	var path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
	path.setAttribute("d", pathData);
	path.setAttribute("fill", clipart_color);
	path.setAttribute("selectable", "true");
	path.setAttribute("class", "renderingPath");
	element.appendChild(path);
	
	currentSlide.appendChild(element);
	zOrder_bringToFront(element);
	
	set_selection(element);
	dotFromSelection();
}
function shapeOnResize(w, h) {
	if((current_snap_grid && !k_CTRL) || (!current_snap_grid && k_CTRL)) {
		var ugWH = unscaleX(grid_size);
		w = ~~(w /  (ugWH)) *  (ugWH);
		h = ~~(h /  (ugWH)) *  (ugWH);
		if(w < ugWH) w = ugWH;
		if(h < ugWH) h = ugWH;
	}
	selection.style.width = (h / slides_scale) + "px";
	selection.style.height = (h / slides_scale) + "px";
	selector_refreshPos();
}


function clipart_directRotate(angle) {
	DOM("CLIPART_canvas_"+disk_current).style.transform = "rotate("+ (angle) +"deg)"
	DOM("CLIPART_canvas_"+disk_current).style.webkitTransform = "rotate("+ (angle) +"deg)"
}
function clipart_deltaRotate(delta) {
	var rotationString = DOM("CLIPART_canvas_"+disk_current).style.transform;
	if(typeof rotationString !== "undefined" && rotationString !== "") {
		var rs = rotationString.indexOf("rotation(") + 8;
		var rr = rotationString.indexOf("deg)", rs);
		var start_angle = ~~rotationString.substr(rs, rr - rs)
		clp_start_angle = start_angle;
		latestClpAngle = start_angle;
		DOM("CLIPART_canvas_"+disk_current).style.transform = "rotate("+ (start_angle + delta) +"deg)"
		DOM("CLIPART_canvas_"+disk_current).style.webkitTransform = "rotate("+ (start_angle + delta) +"deg)"
	}	
}
