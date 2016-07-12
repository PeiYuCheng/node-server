
// --------------------------------------- Selection Manager ---------------------------------------

var ELE_GENERIC = 0;
var ELE_SHAPE = 1;

var selnode_size = 40;
var selection_type = ELE_GENERIC;

var vectorSelect;

var editorEvents_onSelect = {}; // onselect event for the objects in the editor

function selection_init() {
	// Create the SVG selector
	
	// SVG
	var element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	element.setAttribute("class", "vectorSelectSvg");
	element.setAttribute("draggable", "false");
	element.setAttribute("style", "width: 0px; height: 0px; ");
	element.id = "VECTOR_SELECT";

	// Static PATH rendering
	var pathS = document.createElementNS("http://www.w3.org/2000/svg", 'path');
	pathS.setAttribute("d", "M0 0");
	pathS.setAttribute("class", "vectorSelectPathStatic");
	element.appendChild(pathS);

	// Animated PATH rendering
	var path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
	path.setAttribute("d", "M0 0");
	path.setAttribute("class", "vectorSelectPath");
	element.appendChild(path);
		
	vectorSelect = element;
	DOM("ROOT").appendChild(vectorSelect);
}

function dotFromSelection(clickWhenSelected) {	
		if(colorPaletteVisible) palette_hide();

	var newActiveTool = "";
	if(selection !== null) {
		var targetDot = selection.getAttribute("dotid");
		if(targetDot !== null) {

			if(targetDot == "dot_draw") {
				draw_selected();
			}
			if(targetDot == "pen") {
				newActiveTool = "dot_pen_color";
			} else {
				if(activeTool != targetDot) {
					newActiveTool = targetDot;
				}
			}

			if(targetDot == "dot_clipart") {
				clipart_selected();
				newActiveTool  = "dot_clipart_nature"
			} else {
				clipart_hide();
			}
			
			if(targetDot == "dot_text") {
				//if(currentTextEdited === null) {
			//	if(currentTextRelatedElement !== selection) {
					text_selected(clickWhenSelected);
			//	}
			}
			
		} else {
			clipart_hide();
		}
		if(newActiveTool != "") {
			dot_tools = true;
			switch_root(activeTool, newActiveTool);
			resize();
		} else {
			dot_refresh(true);
		}
	}
}

function set_selection(element) {
	if(typeof element === "undefined") element = null;
	if(colorPaletteVisible) palette_hide();
	if(element === null || element.className !== "slide") {
		if(currentTextEdited !== null) {
			currentTextEndEdit()
		}
		if(element === null) {
			if(action_dialog_isVisible()) {
				action_dialog_show(); // Refresh
			}
		}
		if(selection !== element) {
			selection = element;
			if(action_dialog_isVisible()) {
				action_dialog_show(); // Refresh
			}
			selection_type = ELE_GENERIC;

			DOM("SELECTOR").style.display = "none";
			DOM("SELECTOR_resize").style.display = "none";
			
			// Remove selection paths
			vectorSelect.childNodes[0].setAttribute("d", "M0 0");
			vectorSelect.childNodes[1].setAttribute("d", "M0 0");
			
			shape_unselect();
			
			DOM("VECTOR_SELECT").style.display = element === null ? "none" : "block";
			
			if(selection !== null && selection.id.substr(0, 5) == "SHAPE") {
				selection_type = ELE_SHAPE;
				shape_select();
			}
			selector_refreshPos();
		}
		if(app_ready && element !== null) dot_refresh(true);
	}
}

function cloneSelection(direction) {
	if(selection !== null) {
		if(parseInt(selection.style.left) + 30 < slides_width) {
			var newElement = selection.cloneNode(true);
			var newId = String(selection.id).split("_")[0] + "_" + Date.now();
			newElement.id = newId;
			set_selection(null);
			currentSlide.appendChild(newElement);
			newElement.style.left = (parseInt(newElement.style.left) + 50) + "px"
			setTimeout("set_selection(DOM('" + newId + "'))", 100);
		}
	}
}

var internalSelection = null;
var internalPastePosCount = 0;
var internalSelectionSlide = null;
function internalCopySelection() {
	internalSelection = selection;
	internalSelectionSlide = slide_index;
	internalPastePosCount = 1;
}
function internalPasteSelection() {
	if(internalSelection !== null) {
		var newElement = internalSelection.cloneNode(true);
		var newId = String(internalSelection.id).split("_")[0] + "_" + Date.now();
		newElement.id = newId;
		currentSlide.appendChild(newElement);
		if(slide_index === internalSelectionSlide) {
			var vpx = parseInt(newElement.style.left);
			newElement.style.left = (vpx > 1800 ? vpx - (50 * internalPastePosCount++) : vpx + (50 * internalPastePosCount++)) + "px";
		} else {
			newElement.style.left = parseInt(newElement.style.left) + "px";
			internalPastePosCount = 1;
		}
		internalSelectionSlide = slide_index;
		setTimeout("set_selection(DOM('" + newId + "'))", 100);
	}
}

function selector_refreshPos() {
	if(selection == null) {
		DOM("SELECTOR").style.display = "none";
		DOM("SELECTOR_resize").style.display = "none";
	} else {
		if(selection_type == ELE_SHAPE) {
			if(latestInteractObject.id == "" || latestInteractObject.id.substr(0,4) == "SLID") {
				shape_refreshPos();
			}
		} else {
			var selpos = selection.getBoundingClientRect();
			DOM("SELECTOR").style.left = selpos.left + "px";
			DOM("SELECTOR").style.top = selpos.top + "px";
			DOM("SELECTOR").style.width = selpos.width + "px";
			DOM("SELECTOR").style.height = selpos.height + "px";
			DOM("SELECTOR").style.display = "block";
			if(selection_type == ELE_GENERIC) {
				DOM("SELECTOR_resize").style.left = ~~(selpos.left + selpos.width - selnode_size / 2) + "px";
				DOM("SELECTOR_resize").style.top = ~~(selpos.top + selpos.height - selnode_size / 2) + "px";
				DOM("SELECTOR_resize").style.display = "block";
				//DOM("SELECTOR_resize").style.touchAction = "none";
			}
		}
		
		if(selection_type == ELE_SHAPE) {
			if(selection.childNodes[0].tagName == "path") {
		
				var selpos = selection.getBoundingClientRect();
				selpos.left = parseInt(selection.style.left)
				selpos.top = parseInt(selection.style.top)
				var pathData = selection.childNodes[0].getAttribute("d");
				vectorSelect.childNodes[0].setAttribute("d", pathData == "" ? "M0 0" : pathData);
				vectorSelect.childNodes[1].setAttribute("d", pathData == "" ? "M0 0" : pathData);
				
				var spe = false;
				if(selection.getAttribute("class") == "drawElement") {
					var sw = parseInt(selection.childNodes[0].getAttribute("stroke-width"));
					vectorSelect.childNodes[0].setAttribute("stroke-width", sw + 10);
					vectorSelect.childNodes[1].setAttribute("stroke-width", sw + 10);
					spe = true;
				}
				if(selection.getAttribute("class") == "shapeElement") {
					var sw = parseInt(selection.childNodes[0].getAttribute("stroke-width"));
					vectorSelect.childNodes[0].setAttribute("stroke-width", sw + 10);
					vectorSelect.childNodes[1].setAttribute("stroke-width", sw + 10);
					spe = true;
				}
				if(!spe) {
					vectorSelect.childNodes[0].setAttribute("stroke-width", 5);
					vectorSelect.childNodes[1].setAttribute("stroke-width", 5);
				}

				DOM("VECTOR_SELECT").style.zIndex = selection.style.zIndex - 1;
				DOM("VECTOR_SELECT").style.left = selpos.left + "px";
				DOM("VECTOR_SELECT").style.top = selpos.top +  "px";
				DOM("VECTOR_SELECT").style.width = selpos.width + "px";
				DOM("VECTOR_SELECT").style.height = selpos.height + "px";
				DOM("VECTOR_SELECT").style.pointerEvents = "none";
				DOM("VECTOR_SELECT").style.touchAction = "none";
				DOM("VECTOR_SELECT").style.touchAction = "none";
				DOM("VECTOR_SELECT").setAttribute("viewBox", selection.getAttribute("viewBox"));
			}
		}

	}
}

function selector_resize(inputId) {
	if(selection != null) {
		var rszpos = DOM("SELECTOR_resize").getBoundingClientRect();
		var x = rszpos.left + selnode_size / 2;
		var y = rszpos.top + selnode_size / 2;
		var selpos = DOM("SELECTOR").getBoundingClientRect();
		var sizew = x - selpos.left;
		if(sizew < 20) sizew = 20;
		var sizeh = y - selpos.top;
		if(sizeh < 20) sizeh = 20;
		if(selection.hasAttribute("eonresize")) {
			eval ( "w=" + sizew + "; h=" + sizeh + "; "+ selection.getAttribute("eonresize"));
		}
		selector_refreshPos();
	}
}


