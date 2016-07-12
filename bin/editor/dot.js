
var dot_main_size = 100;
var dot_item_size = 70;

var dot_tools = false;
var dot_float = true;
var playMode = false; // When in play mode from the editor
var slideIndexWhenPlay = 0;

var dot_set = {
	dot_main: [ "dot_main", "dot_page", "", "" ],
	dot_play: [ "dot_play_previous", "dot_play_next", "", "" ],
	dot_page: [ "dot_page_remove", "dot_background", "", "" ],
	dot_page_remove: [ "dot_page_remove_now", "dot_page_remove_cancel", "", "" ],
	dot_background: [ "dot_background", "dot_background", "", "" ],
	dot_plus: [ "dot_eraser", "dot_camera", "", "" ],
	dot_camera: [ "dot_image_sendtoback", "dot_image_add", "", "dot_image_sendtoback,dot_image_bringtofront,dot_image_action" ],
	dot_text: [ "dot_text_sendtoback", "dot_text_color", "", "dot_text_sendtoback,dot_text_bringtofront,dot_text_action" ],
	dot_text_color: [ "dot_text_color", "dot_text_color", "", "" ],
	//dot_text_bgcolor: [ "dot_text_bgcolor", "dot_text_bgcolor", "", "" ],
	dot_text_style: [ "dot_TEXTSTYLE_0", "dot_TEXTSTYLE_7", "", "" ],
	dot_text_align: [ "dot_TEXTALIGN_left", "dot_TEXTALIGN_right", "", "" ],
	dot_eraser: [ "dot_eraser", "dot_eraser", "", "" ],
	dot_flashlight: [ "dot_flashlight", "dot_flashlight", "", "" ],
	dot_draw: [ "dot_pen_sendtoback", "dot_pen_color", "", "dot_pen_sendtoback,dot_pen_bringtofront,dot_pen_action" ],
	dot_pen_add: [ "dot_pen_add", "dot_pen_add", "", "" ],
	dot_pen_line: [ "dot_PENLINE_0", "dot_PENLINE_4", "", "" ],
	dot_pen_color: [ "dot_pen_color", "dot_pen_color", "", "" ],
	dot_shape_6p: [ "dot_shape_sendtoback", "dot_shape_color", "", "dot_shape_sendtoback,dot_shape_bringtofront,dot_shape_action" ],
	dot_shape_5p: [ "dot_shape_sendtoback", "dot_shape_color", "", "dot_shape_sendtoback,dot_shape_bringtofront,dot_shape_action" ],
	dot_shape_4p: [ "dot_shape_sendtoback", "dot_shape_color", "", "dot_shape_sendtoback,dot_shape_bringtofront,dot_shape_action" ],
	dot_shape_3p: [ "dot_shape_sendtoback", "dot_shape_color", "", "dot_shape_sendtoback,dot_shape_bringtofront,dot_shape_action" ],
	dot_shape_2p: [ "dot_shape_sendtoback", "dot_shape_color", "dot_shape_bgcolor", "dot_shape_sendtoback,dot_shape_bringtofront,dot_shape_action" ],
	dot_shape_arrow: [ "dot_shape_sendtoback", "dot_shape_color", "dot_shape_bgcolor", "dot_shape_sendtoback,dot_shape_bringtofront,dot_shape_action" ],
	dot_shape_line: [ "dot_SHAPELINE_0", "dot_SHAPELINE_6", "", "" ],
	dot_shape_color: [ "dot_shape_color", "dot_shape_color", "", "" ],
	dot_shape_bgcolor: [ "dot_shape_bgcolor", "dot_shape_bgcolor", "", "" ],
	dot_clipart_nature: [ "dot_clipart_sendtoback", "dot_clipart_color", "", "dot_clipart_sendtoback,dot_clipart_bringtofront,dot_clipart_action,dot_clipart_color" ],
	dot_clipart_symbol: [ "dot_clipart_sendtoback", "dot_clipart_color", "", "dot_clipart_sendtoback,dot_clipart_bringtofront,dot_clipart_action,dot_clipart_color" ],
	dot_clipart_object: [ "dot_clipart_sendtoback", "dot_clipart_color", "", "dot_clipart_sendtoback,dot_clipart_bringtofront,dot_clipart_action,dot_clipart_color" ],
	dot_clipart: [ "dot_clipart_symbol", "dot_clipart_nature", "", "" ],
	dot_clipart_color: [ "dot_clipart_color", "dot_clipart_color", "", "" ],
	dot_shapes: [ "dot_shape_6p", "dot_shape_arrow", "", "" ]
}

var dot_tools_activeSet;
var activeTool = "dot_main";
//var activeRootTool = "main";

// ---------------------------------- Init --------------------------------

var orbContainers;
var orbs;
var dot_init_requested = true;

function dot_preinit() {

	var dot_match = {};
	elements = document.querySelectorAll('[orb]');
	elementsCount = elements.length;
	for(var index = 0; index < elementsCount; index++) {
		dot_match[elements[index].id] = index;
	}
	for(var name in dot_set) {
		dot_set[name][0] = dot_match[dot_set[name][0]];
		dot_set[name][1] = dot_match[dot_set[name][1]];
	}
	dot_tools_activeSet = dot_set["dot_main"];
}

function dot_init() {
	DOM("dot_tools").style.left = (document.documentElement.clientWidth / 2 - dot_main_size / 2) + "px";

	var items = DOM("dot_tools").children;
	var items_count = items.length;
	for(var index = 0; index < items_count; index++) {
		items[index].style.display = "none";
		items[index].addEventListener("transitionend", function() { if(this.style.width == "0px" ) this.style.display = 'none'; }, false);
	}

	dot_tools = false;
	//resize();
	dot_refresh(dot_tools);
	DOM("dot_main").style.display = "block";
	
	DOM("dot_main").style.transition = "all .6s";
	DOM("dot_main").offsetHeight;
	setTimeout( function () {
		dot_init_requested = false;
		DOM("dot_tools").style.bottom = "200px";		
		//DOM("dot_tools").style.top = px(scr.h - 200);

		setTimeout( function () {
			dot_tools = true;
			resize();
		}, 800);
	}, 500);
 }

 // ---------------------------------- Refresh dots --------------------------------

function dot_refresh(dot_status) {
	
	var items = DOM("dot_tools").children;
	var items_count = items.length;

	if(app_ready && !dot_init_requested) {
		var dotpos = DOM("dot_tools").getBoundingClientRect();
		if(dotpos.left < 0) DOM("dot_tools").style.left = "0px";
		if(dotpos.top < 0) DOM("dot_tools").style.top = "0px";
		if(dotpos.left + 100 > scr.w) DOM("dot_tools").style.left = (scr.w - 100) + "px";
		if(dotpos.top + 100 > scr.h) DOM("dot_tools").style.top = (scr.h - 100) + "px";
	}
	
	if(colorPaletteVisible) palette_refresh();

//console.log(dot_tools_activeSet)	
	var disabledElements = dot_tools_activeSet[2];
	if(selection === null && dot_tools_activeSet[3] != "") disabledElements += "," + dot_tools_activeSet[3];
	var disabledElementsCount = disabledElements == "" ? 0 : disabledElements.split(",").length;


	
//-----------------------------------------
	
	var dots_count = 0;
	if(dot_status) {
		for(var index = 0; index < items_count; index++) {
			if(items[index].className == "dotItem" || items[index].className == "dotItemActive") {
				if(index >= dot_tools_activeSet[0] && index <= dot_tools_activeSet[1] && disabledElements.indexOf(items[index].id) == -1) {
					dots_count ++;
				}
			}
		}
	}
	
	var localIndex = 0;
	for(var index = 0; index < items_count; index++) {
		var size = dot_status ? (dot_tools_activeSet[1] - dot_tools_activeSet[0] > 8 ? dot_item_size * .8 : dot_item_size) : 0;
		
		if(items[index].className == "dotItem" || items[index].className == "dotItemActive") {
			if(dot_status) {
				
				if(index >= dot_tools_activeSet[0] && index <= dot_tools_activeSet[1] && disabledElements.indexOf(items[index].id) == -1) {
					//var localIndex = index - (dot_tools_activeSet[0] == 0 ? 1 : dot_tools_activeSet[0]);
					var rotatingStep = .642;
					var radius = dot_main_size; 
					var pivot = 25;
					
					items[index].style.transition = "all .6s"
					items[index].style.display = "block";
					
					//pivot =  (dot_tools_activeSet[1] - (dot_tools_activeSet[0] == 0 ? 1 : dot_tools_activeSet[0]) - disabledElementsCount) * size * rotatingStep / 2;
					pivot =  ((dots_count == 0 ? 1 : dots_count) - 1) * size * rotatingStep / 2;
					
					// Calculate position
					var x = sin(180- (localIndex * size * rotatingStep - pivot) ) * radius + ( dot_main_size - size ) / 2;
					var y = cos(180- (localIndex * size * rotatingStep - pivot) ) * radius + ( dot_main_size - size ) / 2;

					if(typeof items[index].children[1] != "undefined" && typeof items[index].children[1].childNodes[0] != "undefined") {
						orb_label_show(items[index]);
					}
					localIndex++					
					
				
				// Not visible
				} else {
					var x = dot_main_size / 2;
					var y = dot_main_size / 2;
					size = 0;
					if(typeof items[index].children[1] != "undefined") {
						orb_label_hide(items[index]);
					}
				} 
				
			// Not visible
			} else {
				var x = dot_main_size / 2;
				var y = dot_main_size / 2;
				size = 0
				if(typeof items[index].children[1] != "undefined") {
					orb_label_hide(items[index]);
				}
			}
			DOM_posAsync(items[index], x, y, size, size, size * .4);
 		} else {
			items[index].style.transition = "all .6s";
			if(typeof items[index].children[1] != "undefined") {
				orb_label_hide(items[index]);
			}
		}
		if(items[index].className.substr(0, 7) == "dotRoot") {
			DOM_posAsync(items[index], 0, 0, dot_main_size, dot_main_size, dot_main_size * .4);
			if(dot_main_size > 0) {
				items[index].style.display = "block";
				if(typeof items[index].children[1] != "undefined") {
					orb_label_hide(items[index]);
				}
			}
		}
		
	}
}

function orb_label_show(element) {
	if(typeof element.children[1] != "undefined") {
		element.children[1].style.display = "block"; // Labels
		setTimeout("if(typeof DOM('"+element.id+"').children[1] != 'undefined') DOM('"+element.id+"').children[1].style.opacity = 1", 10);
	}
}
function orb_label_hide(element) {
	if(typeof element.children[1] != "undefined") {
		element.children[1].style.opacity = 0;
		element.children[1].style.display = "none";
	}
}


// ---------------------------------- Interaction --------------------------------

var dot_acceptedAction = false;

function dot_down(element) {

	if(busy) {
		dot_acceptedAction = false;
	} else {
		dot_acceptedAction = true;
	
		if(element.className == "dotItem") {
			element.className = "dotItemSelected";
		} else {
			
			if(element.className.substr(0, 7) == "dotRoot") {
				var elements = DOMC("orb_SVG", true);
				var elements_count = elements.length;
				for(var index = 0; index < elements_count; index++) {
					elements[index].style.display = "none";
					elements[index].style.opacity = 0;
				}
			}
		}
	}
}

function dot_downCancel(element) {
	dot_acceptedAction = false;
	if(element.className == "dotItemSelected") {
		element.className = "dotItem";
	}
	resize();
}

var actionDialogWhenPlay = false;
function dot_up(element) {
	//setAsBusy(100);
	if(dot_acceptedAction) {
		dot_acceptedAction = false;
		//setAsBusy(500);
		
		var noResize = false;
		var action = element.id;
		var act = action.split("_");
		var do_clipart_hide = true;
		
		if(colorPaletteVisible) palette_hide();
		
		if(element.className == "dotItemSelected") {
			element.className = "dotItem";
		}
		
		switch(action) {
			
			case "dot_main":
				dot_tools = !dot_tools;
				break;

			case "dot_flashlight":
				flashlight_enable = activeTool != "dot_flashlight";
				switch_root("dot_play", "dot_flashlight");
				if(flashlight_enable) flashmove(lastHitpos);
				break;
			
			case "dot_clipart_color":
				if(activeTool != "dot_clipart_color") {
					palette_show(function(color) {
						DOM("dot_clipart_color").style.backgroundColor = color;
						if(selection && selection.id.substr(0, 3) === "CLP") {
							clipart_color = color;
							clipart_colorate_selection();
						}
					});
				}
				switch_root("dot_clipart", "dot_clipart_color");				
				break;
				
			case "dot_clipart_nature":
				switch_root("dot_clipart", "dot_clipart_nature");
				if(activeTool == "dot_clipart_nature") {
					clipart_show('nature');
					do_clipart_hide = false;
				}
				break;
			
			case "dot_clipart_object":
				switch_root("dot_clipart", "dot_clipart_object");
				if(activeTool == "dot_clipart_object") {
					clipart_show('object');
					do_clipart_hide = false;
				}
				break;

			case "dot_clipart_symbol":
				switch_root("dot_clipart", "dot_clipart_symbol");
				if(activeTool == "dot_clipart_symbol") {
					clipart_show('symbol');
					do_clipart_hide = false;
				}
				break;

			case "dot_clipart":
				set_selection(null);
				switch_root("dot_clipart", "dot_plus");
				break;
				
			case "dot_plus":
				switch_root("dot_main", "dot_plus");
				break;
				
			case "dot_publish":
				if(userid == null) {
					message_start("Please sign-in");
					setTimeout(function() {
						message_end();
					}, 3000);
				} else {
					cloud_save();
				}
				break;
				
			// ------------ Image ---------------
				
			case "dot_camera":
				set_selection(null);
				switch_root("dot_plus", "dot_camera");
				break;
				
			case "dot_image_add":
				browse_picture();
				break;
				

			// ------------ Text ---------------
			
			case "dot_text":
				set_selection(null);
				switch_root("dot_plus", "dot_text");
				break;

			case "dot_text_color":
				if(activeTool != "dot_text_color") {
					palette_show(function(color) {
						DOM("dot_text_color").style.backgroundColor = color;
						if(selection && selection.id.substr(0, 3) === "TXT") {
							selection.style.color = color;
						}
					});
				}
				switch_root("dot_text", "dot_text_color");				
				break;
			/*	
			case "dot_text_bgcolor":
				if(activeTool != "dot_text_bgcolor") {
					palette_show(function(color) {
						DOM("dot_text_bgcolor").style.backgroundColor = color;
						if(selection && selection.id.substr(0, 3) === "TXT") {
							selection.style.backgroundColor = color;
						}
					});
				}
				switch_root("dot_text", "dot_text_color");				
				break;
			*/	
			case "dot_text_style":
				switch_root("dot_text_style", "dot_text");
				break;
				
			case "dot_text_align":
				switch_root("dot_text_align", "dot_text");
				break;
				
			case "dot_text_add":
				textbox_insertToSlide();
				break;

			// ------- Generic tools ---------
			
			case "dot_text_action":
			case "dot_image_action":
			case "dot_pen_action":
			case "dot_shape_action":
			case "dot_clipart_action":
			case "dot_settings":
				action_dialog_show();
				break;
				
			case "dot_text_bringtofront":
			case "dot_image_bringtofront":
			case "dot_pen_bringtofront":
			case "dot_shape_bringtofront":
			case "dot_clipart_bringtofront":
				zOrder_bringToFront( selection );
				break;

			case "dot_text_sendtoback":
			case "dot_image_sendtoback":
			case "dot_pen_sendtoback":
			case "dot_shape_sendtoback":
			case "dot_clipart_sendtoback":
				zOrder_sendToBack( selection );
				break;
				

							
			// ------------ Pen ---------------
				
			case "dot_draw":
				set_selection(null);
				switch_root("dot_draw", "dot_plus");
				break;
				
			case "dot_pen_add":
				clipart_hide();
				startNewDraw = true;
				switch_root("dot_draw", "dot_pen_add");
				
				set_selection(null);
				break;
			
			case "dot_pen_color":
				if(activeTool != "dot_pen_color") {
					palette_show(function(color) {
						pen_color = color;
						DOM("dot_pen_color").style.backgroundColor = color;
						if(selection && selection.id.substr(0, 3) === "DRW") {
							selection.childNodes[0].setAttribute("stroke", color);
						}
					});
				}
				switch_root("dot_draw", "dot_pen_color");
				break;

			case "dot_pen_line":
				switch_root("dot_draw", "dot_pen_line");
				break;

			// ------------ Shapes ---------------
			
			case "dot_shapes":
				set_selection(null);
				switch_root("dot_plus", "dot_shapes");
				break;
				
			case "dot_shapeAdd":
				set_selection(null);
				shape_insertToSlide(activeDotShape);
				break;
				
			case "dot_shape_color":
				if(activeTool != "dot_shape_color") {
					palette_show(function(color) {
						DOM("dot_shape_color").style.backgroundColor = color;
						if(selection && selection.id.substr(0, 5) === "SHAPE") {
							selection.childNodes[0].setAttribute("stroke", color);
						}
					});
				}
				switch_root(activeDotShape, "dot_shape_color");				
				break;
				
			case "dot_shape_bgcolor":
				if(activeTool != "dot_shape_bgcolor") {
					palette_show(function(color) {
						DOM("dot_shape_bgcolor").style.backgroundColor = color;
						if(selection && selection.id.substr(0, 5) === "SHAPE") {
							selection.childNodes[0].setAttribute("fill", color);
						}
					});
				}
				switch_root(activeDotShape, "dot_shape_bgcolor");				
				break;
			
			// Bg color
			case "dot_background":
				if(activeTool != "dot_background") {
					palette_show(function(color) {
						applyBackgroundColor(color);
					});
				}
				switch_root("dot_page", "dot_background");				
				break;

			// ------------ Eraser ---------------

			case "dot_eraser":
				set_selection(null);
				if(activeTool != "dot_eraser") {
					eraser_start();
				} else {
					eraser_end();
				}
				switch_root("dot_plus", "dot_eraser");
				break;

			// ------------ Presentation ---------------
			
			case "dot_play_stop":
				tickCanTick = false;
				switch_root("dot_main", "dot_main");
				playMode = false;
				soundCloseAll();
				embed_end();
				slides_loadFromLocal();
				slide_goto(slideIndexWhenPlay);
				fullscreen_end();
				resize();
				if(actionDialogWhenPlay) action_dialog_show();
				break;
			
			case "dot_play":
				clipart_hide();
				set_selection(null);
				
				if(activeTool != "dot_play") {
					actionDialogWhenPlay = action_dialog_isVisible();
					action_dialog_hide();
					slideIndexWhenPlay = slide_index;
					switch_root("dot_main", "dot_play");
					dot_tools = false;
					playMode = true;
					starting = true;
					slides_saveToLocal();
					initializeGlobalEvents();
					slide_goto(0);
					fullscreen_start();

				} else {
					dot_tools = !dot_tools;
				}
				break;
				
			// ------------ Page ---------------
						
			case "dot_page":
				switch_root("dot_main", "dot_page");
				break;
				
			case "dot_page_next":
			case "dot_play_next":
				slide_next();
				break;
				
			case "dot_page_previous":
			case "dot_play_previous":
				slide_previous();
				break;
				
			case "dot_page_remove":
				switch_root("dot_page", "dot_page_remove");
				break;
				
			case "dot_page_remove_cancel":
				switch_root("dot_page_remove", "dot_page");
				break;
				
			case "dot_page_remove_now":
				set_selection(null);
				slide_remove();
				switch_root("dot_page_remove", "dot_page");
				break;
				
			case "dot_page_add":
				slide_add(false);
				//pick_slide_template();
				break;
							
			case "dot_page_clone":
				slide_add(true);
				break;
				
			// ------------ Float ---------------

			case "dot_float_main":
				dot_float = !dot_float;
				break;
		}

		if(do_clipart_hide) {
			clipart_hide();
		}
		
		
		switch(act[1]) {
			case "TEXTSTYLE":
				DOM("dot_text_style").innerHTML = element.innerHTML;
				text_fontSize = element.children[0].style.fontSize;
				text_fontFamily = element.children[0].style.fontFamily;
				if(selection && selection.id.substr(0, 5) == "TXTCT") {
					selection.style.fontSize = text_fontSize;
					selection.style.fontFamily = text_fontFamily;
					if(currentTextEdited !== null) {
						currentTextEdited.style.fontSize = text_fontSize;
						currentTextEdited.style.fontFamily = text_fontFamily;
						textRefreshSelectionFromInput();
					}
				}
				if(!selection || selection.id.substr(0, 5) != "TXTCT") {
					switch_root("dot_text_style", "dot_text");
				}
				break;
			
			case "TEXTALIGN":
				DOM("dot_text_align").innerHTML = element.innerHTML;
				switch(act[2]) {
					case "left":
					case "right": 
					case "center":
						text_align = act[2];
						break;
				}
				if(selection && selection.id.substr(0, 5) == "TXTCT") {
					selection.style.textAlign = text_align;
					if(currentTextEdited !== null) currentTextEdited.style.textAlign = text_align;
				}				
				if(!selection || selection.id.substr(0, 5) != "TXTCT") {
					switch_root("dot_text_align", "dot_text");
				}
				break;
			
			case "shape":
				if(activeTool == action && act.length == 3 && action != "dot_shape_color" && action != "dot_shape_bgcolor") {
					if(action == "dot_plus") set_selection(null);
					if(activeDotShape == action) {
						switch_root("dot_shapes", action);
					} else {
						switch_root(activeDotShape, action);
					}
					break;
				}

				if(activeTool == "dot_shapes" && act.length == 3) {
					if(action != "dot_shapes") activeDotShape = action;
					switch_root("dot_shapes", action);
					break;
				}

				if(action == "dot_shape_line") {
					switch_root(activeDotShape, "dot_shape_line");
					break;
				}

				break;

			case "SHAPELINE":
				shape_line_index = ~~(act[2]);
				DOM("active_shape_line").innerHTML = element.innerHTML;
				if(!selection || selection.id.substr(0, 5) != "SHAPE") {
					switch_root(activeDotShape, "dot_shape_line");
				}
				
				if(selection && selection.id.substr(0, 5) == "SHAPE") {
					selection.childNodes[0].setAttribute("stroke-width", shape_lines[shape_line_index][0])
					selection.childNodes[0].setAttribute("stroke-dasharray", shape_lines[shape_line_index][1])
				}				
				
				break;
			
			case "PENLINE":
				pen_index = ~~(act[2]);
				refresh_draw_icons();
				if(!selection || selection.id.substr(0, 3) != "DRW") {
					switch_root("dot_draw", "dot_pen_line");
				}

				if(selection && selection.id.substr(0, 3) == "DRW") {
					selection.childNodes[0].setAttribute("stroke-dasharray", pens[pen_index][1]);
					selection.childNodes[0].setAttribute("stroke-width", pens[pen_index][0]);
				}

				break;
		}

		eraser_enable = activeTool == "dot_eraser";
		pen_enable = activeTool == "dot_pen_add";
		
		if(!noResize) resize();
	}
}

function switch_root(set_source, set_target) {
	setAsBusy(400);
	DOM(activeTool).setAttribute("movable", "false");
	DOM(activeTool).className = "dotItem";
	
	if(dot_tools_activeSet == dot_set[set_target]) {
		dot_tools_activeSet = dot_set[set_source];
		activeTool = set_source;
		DOM(set_source).setAttribute("movable", "true");
		DOM(set_source).className = set_source == "dot_main" ? "dotRoot" : "dotRootSub";
	} else {
		dot_tools_activeSet = dot_set[set_target];
		activeTool = set_target;
		DOM(set_target).setAttribute("movable", "true");
		DOM(set_target).className = set_target == "dot_main" ? "dotRoot" : "dotRootSub";
	}
}
