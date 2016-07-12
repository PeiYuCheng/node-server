
/** touchMap[inputId].id: id
touchMap[inputId].element: element
touchMap[inputId].initialElementRect: { x, y, w, h }
touchMap[inputId].initialHitpos: { x, y}
touchMap[inputId].hitpos: { x, y}
touchMap[inputId].relpos: { x, y}
touchMap[inputId].deltaHit: { x, y }
touchMap[inputId].active: bool
touchMap[inputId].amv: bool
touchMap[inputId].movable: bool
touchMap[inputId].selectable: bool
touchMap[inputId].moveTarget: element
touchMap[inputId].moveCount: integer
touchMap[inputId].moveDistance: integer
**/
var touchMap = [];
/** Position of the last mouse, pen or touch contact **/
var lastHitpos = { x: 0, y: 0 };
/** Text being edited, if any, or null **/
var currentTextEdited = null;

/** Convert the number to the slide hor. scale **/
function scaleX(x) { return ((x - slidesPos.left) / slides_scale); }
/** Convert the number to the slide vert. scale **/
function scaleY(y) { return ((y - slidesPos.top) / slides_scale); }
/** Convert the number from the slide hor.. scale **/
function unscaleX(x) { return (x * slides_scale + slidesPos.left); }
/** Convert the number from the slide vert. scale **/
function unscaleY(y) { return (y * slides_scale + slidesPos.top); }

function userinput_init() {
	window.addEventListener('dblclick', function(e) { e.preventDefault(); } );
	window.addEventListener('contextmenu', function(e) { e.preventDefault(); } );
	
	document.onmousedown = disableRightClick;
}

function disableRightClick(event) {
	if(event.button == 2) return false;    
}

// ------------- Clipboard shortcuts
// document.addEventListener("paste", onPasteFromClipboard );
/*
function onPasteFromClipboard(e) {
//console.log("Paste detected")
	if(typeof event != "undefined") {
		var clipboardData = event.clipboardData;
	} else {
		var clipboardData = e.clipboardData;
	}
	if(typeof clipboardData == "undefined") {
		if(typeof event.originalEvent !== "undefined") clipboardData = event.originalEvent.clipboardData;
	}
	if(typeof clipboardData !== "undefined") {
		var items = clipboardData.items;
	//	console.log("Try to paste: " + e.clipboardData.types);
		if(e.clipboardData.types.indexOf('text/html') > -1){
			var clipdata = e.clipboardData.getData('text/html');
	//		console.log("text/html size: " + clipdata.length)
		}
		if(e.clipboardData.types.indexOf('text/plain') > -1){
			var clipdata = e.clipboardData.getData('text/plain');
	//		console.log("text/plain size: " + clipdata.length)
		}
		if(e.clipboardData.types.indexOf('text/uri-list') > -1){
			var clipdata = e.clipboardData.getData('text/uri-list');
	//		console.log("text/uri-list size: " + clipdata.length)
		}
		if(e.clipboardData.types.indexOf('text/csv') > -1){
			var clipdata = e.clipboardData.getData('text/csv');
	//		console.log("text/csv size: " + clipdata.length)
		}
		if(e.clipboardData.types.indexOf('text/rtf') > -1){
			var clipdata = e.clipboardData.getData('text/rtf');
	//		console.log("text/rtf size: " + clipdata.length)
		}
		if(e.clipboardData.types.indexOf('Files') > -1){
			var clipdata = e.clipboardData.getData('Files');
	//		console.log("Files size: " + clipdata.length)
		}
		for(var index in items) {
			var item = items[index];
	//		console.log(index + ": " + item.kind)
			if (item.kind === 'file') {
				var blob = item.getAsFile();
				var reader = new FileReader();
				reader.onload = function(e) {
					insertImageFromData(e.target.result);
				};
				reader.readAsDataURL(blob);
			}
		}
		var tname = e.target.tagName.toLowerCase();
		if(tname !== "input" && tname != "textarea"  && currentTextEdited === null) {
			e.preventDefault();
		}
	}
}
*/
// ------------- Keyboard shortcuts
document.addEventListener("keydown", function (event) { input_key_down(event); });
document.addEventListener("keyup", function (event) { input_key_up(event); });

/** True if SHIFT key is pressed **/
var k_SHIFT = false;
/** True if CTRL key is pressed **/
var k_CTRL = false;

function input_key_down(event) {
	lastUserInteraction = Date.now();
	var key = event.keyCode;
	var tname = event.target.tagName.toLowerCase();
	if (key === 9) { // TAB
		if(tname === "textarea") {
			insertAtCaret(event.target.id, "    ");
			event.preventDefault();
		}
	}
	if(k_CTRL && key === 83) { // CTRL + S
		event.preventDefault();
	}	
	if(tname !== "input" && tname != "textarea"  && currentTextEdited === null) {
		if (key === 8) {
			event.preventDefault();
		}
	}
	if(key === 17) { // CTRL
		k_CTRL = true;
		event.preventDefault();
	}
	if(k_CTRL && key === 68) {
		event.preventDefault();
	}
	if(key === 16) {
		k_SHIFT = true;
	}
	//console.log("Key-down: " + key);
}

function input_key_up(event) {
	var key = event.keyCode;
//console.log("Key-up: " + key);
	
	if(k_CTRL && key === 83) { // CTRL + S
		cloud_save();
		event.preventDefault();
	}
	
	var tname = event.target.tagName.toLowerCase();
	if(selection !== null && selection.getAttribute("movable") == "true") {
		if(k_CTRL && key === 68) { // CTRL + D
			cloneSelection("ALL");
			event.preventDefault();
		}
	}
	if(tname !== "input" && tname != "textarea" && currentTextEdited === null) {
		if(k_CTRL && key === 86) { // CTRL + V
			internalPasteSelection();
			event.preventDefault();
		}
		if(selection !== null && selection.getAttribute("movable") == "true") {
			if(k_CTRL && key === 67) { // CTRL + C
				internalCopySelection();
				event.preventDefault();
			}
			
			//if(!k_CTRL && !k_SHIFT) {
				if(key == 38) { // UP
					selection.style.top = ~~(parseInt(selection.style.top) - 1 * (k_CTRL ? 10 : 1)) + "px";
					selector_refreshPos();
				}
				if(key == 40) { // DOWN
					selection.style.top = ~~(parseInt(selection.style.top) + 1 * (k_CTRL ? 10 : 1)) + "px";
					selector_refreshPos();
				}				
				if(key == 37) { // RIGHT
					selection.style.left = ~~(parseInt(selection.style.left) - 1 * (k_CTRL ? 10 : 1)) + "px";
					selector_refreshPos();
				}
				if(key == 39) { // LEFT
					selection.style.left = ~~(parseInt(selection.style.left) + 1 * (k_CTRL ? 10 : 1)) + "px";
					selector_refreshPos();
				}
				event.preventDefault();
			//}
		//}

			if(key == 46 || key == 8) { // DELETE
				erase_element(selection.id);
				set_selection(null);
				switch_root("dot_plus", activeTool);
				resize();
			}
		}

		if(selection === null) {
			if(key == 39) { // LEFT
				if(document.activeElement.tagName.toLowerCase() != 'input' && document.activeElement.tagName.toLowerCase() != 'textarea') {
					if(!playMode) slide_next();
				}
			}
			if(key == 37) { // RIGHT
				if(document.activeElement.tagName.toLowerCase() != 'input' && document.activeElement.tagName.toLowerCase() != 'textarea') {
					if(!playMode) slide_previous();
				}
			}
		}
	}
	
	if(key === 17) k_CTRL = false;
	if(key === 16) k_SHIFT = false;
}


// ------------- Mouse Wheel

document.addEventListener("mousewheel", mousewheel_event, false);
document.addEventListener("DOMMouseScroll", mousewheel_event, false);

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
function pointerstart_dispatch(event) {  input_start(event, event.pointerId, { x: event.clientX, y: event.clientY })}
function pointermove_dispatch(event) { input_move(event, event.pointerId, { x: event.clientX, y: event.clientY })}
function pointerend_dispatch(event) { input_end(event, event.pointerId, { x: event.clientX, y: event.clientY })}

// ------------- Touch

document.addEventListener("touchstart", touchstart_dispatch, false );
document.addEventListener("touchmove", touchmove_dispatch, false );
document.addEventListener("touchend", touchend_dispatch, false );
function touchstart_dispatch(event) {
//console.log("TSTART: " + event.target.id)
	if(typeof event.changedTouches != "undefined") {
		for(var ptr = 0, touchCount = event.changedTouches.length; ptr < touchCount; ptr++) { input_start(event, event.changedTouches[ptr].identifier, { x: ~~event.changedTouches[ptr].clientX, y: ~~event.changedTouches[ptr].clientY })}
	} else { input_start(event, event.pointerId, { x: ~~event.clientX, y: ~~event.clientY })}	
}
function touchmove_dispatch(event) {
//console.log("TMOVE: " + event.target.id)
	if(typeof event.changedTouches != "undefined") {
		for(var ptr = 0, touchCount = event.changedTouches.length; ptr < touchCount; ptr++) { input_move(event, event.changedTouches[ptr].identifier, { x: ~~event.changedTouches[ptr].clientX, y: ~~event.changedTouches[ptr].clientY })}
	} else { input_move(event, event.pointerId, { x: ~~event.clientX, y: ~~event.clientY })}
}
function touchend_dispatch(event) {
//console.log("TEND: " + event.target.id)	
	if(typeof event.changedTouches != "undefined") {
		for(var ptr = 0, touchCount = event.changedTouches.length; ptr < touchCount; ptr++) { input_end(event, event.changedTouches[ptr].identifier, { x: ~~event.changedTouches[ptr].clientX, y: ~~event.changedTouches[ptr].clientY })}
	} else { input_end(event, event.pointerId, { x: ~~event.clientX, y: ~~event.clientY })}		
}


// ---------------------------- Reaction to events

function mousewheel_event(event) {
	lastUserInteraction = Date.now();
	var hit = document.elementFromPoint(lastHitpos.x, lastHitpos.y);
	if(hit && hit.hasAttribute("id")) {
		var id = hit.getAttribute("id");
		if( DOM(id).hasAttribute("inputwheel") ) {
			delta = (event.detail < 0 || event.wheelDelta > 0) ? 1 : -1;
			eval ( "delta = " + delta + "; " + DOM(id).getAttribute("inputwheel") );
		}
	}
}

/** Reference to the last object in interaction with the user **/
var latestInteractObject = null;
function input_start(event, inputId, hitpos) {
	// event.target.className !== "svgcanvas" && 
	if(event.target.hasAttribute && !event.target.hasAttribute("DEFAULT_BEHAVIOR")) {	
		latestInteractObject = event.target;
		
		 if(!event.target.hasAttribute("contentEditable")) event.preventDefault();
		
		var relpos = { x: scaleX(hitpos.x), y: scaleY(hitpos.y) }
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
			if(id === null && typeof event.target.parentNode !== "undefined") {
				id = event.target.parentNode.getAttribute("id");
				if(id === null && typeof event.target.parentNode.parentNode !== "undefined") {
					id = event.target.parentNode.parentNode.getAttribute("id");
				}
			}
	
		}
		if(id !== null) {
			var element = DOM(id);
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
				movable: (((id.substr(0, 3) == "dot" || !playMode) && element.getAttribute("movable") == "true") || element.getAttribute("interaction") == "xy") && (element.getAttribute("editlock") != "true" || playMode),
				selectable: proximitySelectable || element.getAttribute("selectable") == "true" ||  element.getAttribute("selectable") == "text" || element.getAttribute("precisionselect") == "true",
				moveTarget: typeof element.getAttribute("movetarget") == "string" ? DOM(element.getAttribute("movetarget")) : element,
				moveCount: 0,
				moveDistance: 0
			}
			if(touchMap[inputId].moveTarget.hasAttribute("inputstart")) {
				eval ( "inputId = " + inputId + "; " + touchMap[inputId].moveTarget.getAttribute("inputstart") );
			}
			
			if(playMode) {
				if(touchMap[inputId].moveTarget.hasAttribute("amv") ) {
					touchMap[inputId].amv = touchMap[inputId].moveTarget.getAttribute("amv");
				}
				if(touchMap[inputId].moveTarget.hasAttribute("astart") ) {
					executeActionCode(touchMap[inputId].moveTarget, "Touch Start", touchMap[inputId].id, touchMap[inputId].moveTarget.getAttribute("astart"));
				}
			}			
			
			if(id.substr(0, 3) == "dot") {
				dot_down(element);
			}
		
		}
	} else {
		touchMap[inputId] = null;
	}
}

function input_move(event, inputId, hitpos) {
	lastUserInteraction = Date.now();
	lastHitpos = hitpos;
	var ebag = touchMap[inputId];
	if(ebag) {
		event.preventDefault();
		
		if(ebag.active) {
			var pid = ebag.element.parentNode.id;
/*
			if(pid !== "dot_tools" && current_snap_grid && !playMode) {
				hitpos.x = ~~(hitpos.x /  unscaleX(grid_size)) *  unscaleX(grid_size);
				hitpos.y = ~~(hitpos.y /  unscaleX(grid_size)) *  unscaleX(grid_size);
			}
			*/
			ebag.relpos = { x: scaleX(hitpos.x), y: scaleY(hitpos.y) }
			ebag.hitpos = hitpos;
			ebag.moveDistance = getDistance ( ebag.initialHitpos, hitpos );
			ebag.moveCount++;
			if(ebag.movable) {
				if(pid == "dot_tools" || pid == "ROOT" ) {  // No scale
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
					
/*					if(k_CTRL) { // Move with grid
						targetX = (~~(targetX / 192 / .25) * 192 * .25);
						targetY = (~~(targetY / 108 / .25) * 108 * .25);
					}
*/					
					if(!playMode) {
						if((current_snap_grid && !k_CTRL) || (!current_snap_grid && k_CTRL)) {
							targetX = ~~(targetX /  (grid_size)) *  (grid_size);
							targetY = ~~(targetY /  (grid_size)) *  (grid_size);
						}
					}

					
				}
				
				
				
				ebag.moveTarget.style.left = targetX + "px";
				ebag.moveTarget.style.top = targetY + "px";
				
				//if(colorPaletteVisible && pid == "dot_tools") 
				palette_refresh();
			}
			
			if( ebag.moveTarget.hasAttribute("inputchange")) {
				eval ( "inputId = " + inputId + "; " + ebag.moveTarget.getAttribute("inputchange") );
			}	
			
			if(ebag.amv !== false) {
				executeActionCode(ebag.moveTarget, "Touch Move", ebag.id, ebag.amv);
			}
			
			if(ebag.moveTarget == selection) {
				selector_refreshPos();
			}
		}
	}
	if( typeof flashlight_enable !== 'undefined' && flashlight_enable ) {
		flashmove(hitpos);
	}
	if( typeof eraser_enable !== 'undefined' && eraser_enable) {
		erasermove();
	}
	//if( typeof pen_enable !== 'undefined' && pen_enable) {
	//	penmove();
	//}		
	
}

function input_end(event, inputId, hitpos) {
	lastHitpos = hitpos;
	var ebag =  touchMap[inputId];
	
	if(ebag) {
		event.preventDefault();
		ebag.relpos = { x: scaleX(hitpos.x), y: scaleY(hitpos.y) }
		
		if( ebag.moveTarget.hasAttribute("inputend")) {
			eval ( "inputId = " + inputId + "; " + ebag.moveTarget.getAttribute("inputend") );
		}
		if(playMode && ebag.moveTarget.hasAttribute("aend") ) {
			executeActionCode(ebag.moveTarget, "Touch", ebag.id, ebag.moveTarget.getAttribute("aend"));
		}
		
		if( touchMap[inputId].moveCount < 10) {
			if(ebag.moveTarget.hasAttribute("inputpress")) {
				eval ( "inputId = " + inputId + "; " + ebag.moveTarget.getAttribute("inputpress") );
			}
			if(playMode) {
				var disableAutoNext = false;
				if(ebag.moveTarget.hasAttribute("autozoom")) {
					disableAutoNext = true;
					autozoom(ebag.moveTarget);
				}
				if(ebag.moveTarget.hasAttribute("aclke")) { // interactive mode (easy)
					executeActionCode(ebag.moveTarget, "Action", ebag.id, 'go("' + ebag.moveTarget.getAttribute("aclke") + '")');
				} else {
					if(ebag.moveTarget.hasAttribute("aclk") ) { // interactive mode
						executeActionCode(ebag.moveTarget, "Touch", ebag.id, ebag.moveTarget.getAttribute("aclk"));
					} else {
						if(currentSlide.querySelector("[ainit]") === null && 
							currentSlide.querySelector("[aclk]") === null && 
							currentSlide.querySelector("[aclke]") === null && 
							currentSlide.querySelector("[astart]") === null &&
							currentSlide.querySelector("[amv]") === null &&
							currentSlide.querySelector("[aend]") === null
						) { // No custom behavior: go to next slide
							if(ebag.element.id.substr(0, 3) != "dot") {
								if(autonav && !disableAutoNext) slide_next();
							}
						}
						
					}
				}
			}				

			if(ebag.id.substr(0, 3) == "dot") {
				dot_up( ebag.element );
			} else {
				if(ebag.selectable && !playMode) {
					if( eraser_enable ) {
						erase_element( ebag.id );
					} else {
						if(selection != ebag.moveTarget) {
							currentTextEndEdit();
							set_selection( ebag.moveTarget );
							dotFromSelection(false);
						} else {
							dotFromSelection(true);
						}
					}
					
				}
				
			}

		} else {
			if(ebag.id.substr(0, 3) == "dot") {
				dot_downCancel( ebag.element );
			}
		}
		touchMap[inputId].active = false;
	}
	if(eraser_enable) {
		erasermove();
	}
	//if(pen_enable) {
	//	penmove();
	//}
	if( flashlight_enable ) {
		flashmove(hitpos);
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


// ------------------------------------------------------------------------------------------------

function insertAtCaret(areaId,text) {
    var txtarea = document.getElementById(areaId);
    var scrollPos = txtarea.scrollTop;
    var strPos = 0;
    var br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ? 
        "ff" : (document.selection ? "ie" : false ) );
    if (br == "ie") { 
        txtarea.focus();
        var range = document.selection.createRange();
        range.moveStart ('character', -txtarea.value.length);
        strPos = range.text.length;
    }
    else if (br == "ff") strPos = txtarea.selectionStart;

    var front = (txtarea.value).substring(0,strPos);  
    var back = (txtarea.value).substring(strPos,txtarea.value.length); 
    txtarea.value=front+text+back;
    strPos = strPos + text.length;
    if (br == "ie") { 
        txtarea.focus();
        var range = document.selection.createRange();
        range.moveStart ('character', -txtarea.value.length);
        range.moveStart ('character', strPos);
        range.moveEnd ('character', 0);
        range.select();
    }
    else if (br == "ff") {
        txtarea.selectionStart = strPos;
        txtarea.selectionEnd = strPos;
        txtarea.focus();
    }
    txtarea.scrollTop = scrollPos;
}
