



var text_align = "left";
var text_bullet = "";
var text_fontSize = "8px";
var text_fontFamily = "";
var text_color = "#202020";

var currentTextEdited = null;
var currentTextRelatedElement = null;

function text_init() {
	text_fontSize = DOM("dot_TEXTSTYLE_7").children[0].style.fontSize;
	text_fontFamily = DOM("dot_TEXTSTYLE_7").children[0].style.fontFamily;
}

function text_edit() {
	selection.setAttribute( 'contenteditable', 'true' );
//	selection.removeAttribute("DEFAULT_BEHAVIOR");
	selection.setAttribute("onkeyup", "textKeyUp(DOM('INFIELD')) ");
	selection.focus();
}

// ------------------------------ Selection -------------------------------------

function text_selected(switchToEdit) {
	if(currentTextRelatedElement !== selection) {
		switchToEdit=true;
	}
	currentTextRelatedElement = selection;
	currentTextEdited = selection;
	// Refresh the dots
	if(DOM("dot_TEXTALIGN_" + selection.style.textAlign)) {
		DOM("dot_text_align").innerHTML = DOM("dot_TEXTALIGN_" + selection.style.textAlign).innerHTML;
	}
	var tcolor = selection.style.color;
	var tbgcolor = selection.style.backgroundColor === "" ? "transparent" : selection.style.backgroundColor;
	var ffamily = selection.style.fontFamily;
	var fsize = selection.style.fontSize;

	DOM("dot_text_color").style.backgroundColor = tcolor;		
	DOM("label_text_color").style.fill = get_visible_color(tcolor);
	//DOM("dot_text_bgcolor").style.backgroundColor = tbgcolor;
	//DOM("label_text_bgcolor").style.fill = get_visible_color(tbgcolor);
	
	if(switchToEdit) {

		if(colorPaletteVisible) palette_hide();
/*
		currentTextEdited = document.createElement("textarea");
		currentTextEdited.setAttribute("DEFAULT_BEHAVIOR", "true");
		currentTextEdited.setAttribute("spellcheck", "false");
		currentTextEdited.setAttribute("onkeyup", "textKeyUp(DOM('INFIELD')) ");

		currentTextEdited.id = selection.id + "INFIELD";
		currentTextEdited.style.position = "absolute";
		currentTextEdited.style.zIndex = 100000;
		currentTextEdited.style.fontSize = selection.style.fontSize;
		currentTextEdited.style.fontFamily = selection.style.fontFamily;
		currentTextEdited.style.color = selection.style.color;
		currentTextEdited.style.backgroundColor = selection.style.backgroundColor;
		currentTextEdited.style.textAlign = selection.style.textAlign;
		currentTextEdited.style.padding = selection.style.padding;
		currentTextEdited.style.overflow = "hidden";
		currentTextEdited.style.border = "0px";
		currentTextEdited.style.webkitUserSelect = "text";
		currentTextEdited.style.userSelect = "text";
		currentTextEdited.style.outline = "0px solid transparent";

//		currentTextEdited.style.backgroundColor = "rgba(128,128,128,.15)";
		currentTextEdited.style.transition = "color .5s, background-color .5s";
		
		currentTextEdited.style.left = selection.style.left;
		currentTextEdited.style.top = selection.style.top;
		currentTextEdited.style.width = selection.style.width;
		currentTextEdited.style.height = selection.style.height;

		var sourceText = selection.innerHTML;
		sourceText = str_replace(sourceText, "&lt;", "<");
		sourceText = str_replace(sourceText, "&gt;", ">");
		sourceText = str_replace(sourceText, "&amp;", "&");
		sourceText = str_replace(sourceText, "&nbsp;", " ");
		currentTextEdited.value = str_replace(sourceText, "<br>", "\n");
		currentSlide.appendChild(currentTextEdited);
		currentTextEdited.focus();
*/		
		text_edit();
		//selection.style.visibility = "hidden";
	}
	
	
}

// ----------------------------------------- Insert ------------------------------

function textbox_insertToSlide() {
console.log("textbox_insertToSlide");
	currentTextEndEdit();
	
	var idKey = Date.now();
		
	element = document.createElement("div");
	element.setAttribute("id", "TXTCT_"+idKey);
	//element.innerHTML = "Text";
	
	element.setAttribute("class", "textElement");
	element.setAttribute("dotid", "dot_text");
	element.setAttribute("movable", "true");
	element.setAttribute("removable", "true");
	element.setAttribute("selectable", "text");
	element.setAttribute("eonresize", "textOnResize(w, h)");

	var thisPos = getInsertionPosition(element, 50, 50, true);

	DOM_pos(element, thisPos.x, thisPos.y);
	
	element.style.fontSize = text_fontSize;
	element.style.fontFamily = text_fontFamily;
	element.style.color = text_color;
	element.style.textAlign = text_align;
	element.style.padding = "0px";
	element.style.overflow = "hidden";
	element.style.width = "800px";
	element.style.height = text_fontSize + 24;
	element.style.zIndex = String(zIndexBase);

	currentSlide.appendChild(element);
	if(element) {
		zOrder_bringToFront(element);
		
		
		
		set_selection(element);
		text_selected();
		textRefreshSelectionFromInput();
	}
}

function textKeyUp(element) {
	textRefreshSelectionFromInput();
}

// When text size changes
function textRefreshSelectionFromInput() {
//console.log("textRefreshSelectionFromInput");
	var ts = selection.getBoundingClientRect();
	var neww = ~~(ts.width / slides_scale + 1);
/*	var value = str_replace(currentTextEdited.value, "\n", "<br>");
	value = str_replace(value, "  ", "&nbsp;&nbsp;");
	currentTextRelatedElement.innerHTML = value;
*/	
	var padding = int(selection.style.paddingLeft);
	selection.style.width =  (neww - padding * 2) + "px";
	selection.style.height = (currentTextEdited.scrollHeight - padding * 2) + "px";
	
	//selection.style.width = parseInt(currentTextEdited.style.width) + "px";
	//selection.style.height = (currentTextEdited.scrollHeight - padding * 2) + "px";
	
	selector_refreshPos();
	textAutoColumns(selection);
}

// When selector is resized
function textOnResize(w, h) {
	var padding = int(selection.style.paddingLeft);
	if((current_snap_grid && !k_CTRL) || (!current_snap_grid && k_CTRL)) {
		var ugWH = unscaleX(grid_size);
		w = ~~(w /  (ugWH)) *  (ugWH);
		h = ~~(h /  (ugWH)) *  (ugWH);
		if(w < ugWH) w = ugWH;
		if(h < ugWH) h = ugWH;
	}	
	
	w = (w / slides_scale - padding * 2);
	h = (h / slides_scale - padding * 2);
	selection.style.width = w + "px";
	selection.style.height = h + "px";
	textAutoColumns(selection);
}

function textAutoColumns(textObject) {
	if(textObject.style.columnCount !== "") {
		var ccount = ~~((int(textObject.style.width) / int(textObject.style.fontSize) ) / 12);
		textObject.style.columnCount = ccount < 2 ? 2 : ccount;
	}	
}

function currentTextEndEdit() {
console.log("currentTextEndEdit");
	if(currentTextEdited !== null) {
		window.getSelection().removeAllRanges();
//		if(lastPositionedObject == currentTextEdited) {
//			lastPositionedObject = null;
//			lastPositionedObjectPos = null;
//		}
	/*	var remove_currentTextEdited = currentTextEdited;
		currentTextEdited = null;
		var value = str_replace(remove_currentTextEdited.value, "\n", "<br>");
		value = str_replace(value, "  ", "&nbsp;&nbsp;");
		
		if(value == null) {
			set_selection(null);
			erase_element(currentTextRelatedElement.id); 
		} else {
			currentTextRelatedElement.innerHTML = value;
			currentTextRelatedElement.style.visibility = "visible";
		}
		remove_currentTextEdited.parentNode.removeChild(remove_currentTextEdited);
		currentTextRelatedElement = null; */
		
		//set_selection(currentTextEdited);
		currentTextEdited.removeAttribute("contentEditable");
		currentTextEdited.removeAttribute("onkeyup");
		currentTextEdited = null;
		
	}
}
