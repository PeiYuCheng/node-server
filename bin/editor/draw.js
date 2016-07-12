
var pen_color = "";
var pen_size = 0;
var pen_stroke = "";
var pen_index = 2;
var pens = [
	[1.5, ""],
	[3, "5, 10"],
	[5, ""],
	[10, ""],
	[25, ""]
]
var pen_on = [];
var pen_size_max = 0;

var draw_data = [];
var draw_live = [];
var draw_pointer = [];

var startNewDraw = true;
var lastDrawElement = null;

function draw_init() {
	for(var i in pens) pen_size_max = pens[i][0] > pen_size_max ? pens[i][0] : pen_size_max;
	refresh_draw_icons();
}


// ------------------------------ Selection -------------------------------------

function draw_selected() {
	pen_color = selection.childNodes[0].getAttribute("stroke");
	DOM("dot_pen_color").style.backgroundColor = pen_color;
	if(DOMC("icon icon-check pencolor") !== null) DOMC("icon icon-check pencolor").className = "";
	
	var strokeDash = selection.childNodes[0].getAttribute("stroke-dasharray").trim();
	var strokeWidth = parseInt(selection.childNodes[0].getAttribute("stroke-width"));

	for(var ptr = 0; ptr <= 4; ptr++) {
		var id = "dot_PENLINE_" + ptr;
		if(pens[ptr][1] == strokeDash && parseInt(pens[ptr][0]) == strokeWidth) {
			pen_index = ptr;
		}
	}
	refresh_draw_icons();
}

function draw_resize() {
	DOM("SVG_CANVAS").style.display = pen_enable ? "block" : "none";
}

function refresh_draw_icons() {
	pen_size = pens[pen_index][0];
	pen_stroke = pens[pen_index][1];
	pen_color = DOM("dot_pen_color").style.backgroundColor;

	DOM("label_pen_color").style.fill = get_visible_color(pen_color);
	
	for(var index = 0; index < 3; index++) {
		DOM("dot_PENLINE_" + index).innerHTML = svg_svg(svg_path("M15 15 L35 35", "#8493A8", pens[index][0], pens[index][1]), 50, 50);
	}
	DOM("dot_PENLINE_3").innerHTML = svg_svg(svg_path("M18 18 L32 32", "#8493A8", pens[3][0], pens[3][1]), 50, 50);
	DOM("dot_PENLINE_4").innerHTML = svg_svg(svg_path("M25 25 L25 25", "#8493A8", pens[4][0], pens[4][1]), 50, 50);
	
	DOM("active_pen_line").innerHTML = DOM("dot_PENLINE_" + pen_index).innerHTML;
}


//function penmove() {
	//DOM("PEN_CURSOR").style.left = (lastHitpos.x + 4) + "px";
	//DOM("PEN_CURSOR").style.top = (lastHitpos.y + 4) + "px";
//}

// --------------------------------- Ink (mouse & touch) ----------------------------

var subdrawLength = 0;
var activeDrawingPen = -1;
function ink_start(penId)  {
	if(activeDrawingPen == -1) {
		subdrawLength = 0;
		activeDrawingPen = penId;
		ink_pos = { x: touchMap[penId].relpos.x, y: touchMap[penId].relpos.y, a: "M" };
		if(pen_enable) {		
		
			//DOM("PEN_CURSOR").style.display = "block";
			
			pen_on = true;
			
			if(DOM("p" + penId) === null) { // Insert pen render element, to be removed on end
				var svgdiv = document.createElement("div");
				svgdiv.id = "p" + penId;
				svgdiv.style.position = "absolute";
				svgdiv.style.zIndex = 30000;
				svgdiv.style.pointerEvents = "none";
				svgdiv.style.left = "0px";
				svgdiv.style.top = "0px";
				svgdiv.style.right = "0px";
				svgdiv.style.bottom = "0px";
				currentSlide.appendChild(svgdiv);
				var SVG = '<svg height="100%" width="100%">';
				SVG +='<path id="pt'+penId+'" fill="none" stroke="' + pen_color + '" stroke-linecap="round" stroke-dasharray="'+pen_stroke+'" stroke-width="' + pen_size + '" d=\"M0 0\" /></path></svg>';
				DOM("p" + penId).innerHTML = SVG;
			}
			if(startNewDraw || draw_pointer == 0) {
				draw_pointer = 0;
				draw_live = "";
				draw_data = [];
			}
			draw_data[draw_pointer] = ink_pos;
			render_svg(penId);
			ink_add(penId); // Mark when just touch
		}
	}
}

function ink_add(penId) {
	
	if(penId == activeDrawingPen) {
		
		ink_pos = { x: ~~touchMap[penId].relpos.x, y: ~~touchMap[penId].relpos.y, a: "L" };
		
		if( pen_enable && pen_on ) {
			
			if(ink_pos.x / scaleX < 0 || ink_pos.y / scaleX < 0 || ink_pos.x / scaleX > scr.w || ink_pos.y / scaleX > scr.h) {
				ink_end(penId, ink_pos)
			} else {
				draw_data[++draw_pointer] = ink_pos;
				render_svg(penId);
			}
			subdrawLength++;
		}
	}
	//penmove();
}

function ink_end(penId) {
	if(penId == activeDrawingPen) {
		activeDrawingPen = -1;
		
		ink_pos = { x: touchMap[penId].relpos.x, y: touchMap[penId].relpos.y, a: "L" };
		
		if( pen_enable && pen_on ) {
			draw_data[++draw_pointer] = ink_pos;
			if(subdrawLength == 1) draw_data[++draw_pointer] = ink_pos;
			render_svg(penId);
			
			if(DOM("p" + penId) !== null) { // Remove pen render element
				currentSlide.removeChild(DOM("p" + penId));
			}
			
			if(!startNewDraw && lastDrawElement !== null) {
				currentSlide.removeChild(lastDrawElement);
				lastDrawElement = null;
			}
			lastDrawElement = draw_insertToSlide(penId);
			startNewDraw = false;
		}
		pen_on = false;
	}
}

// --------------------------- SVG Manipulation ----------------------------------


function render_svg(penId) {
	var pointCount = draw_data.length - 1;
	draw_live += draw_data[pointCount].a + draw_data[pointCount].x + " " + draw_data[pointCount].y + " ";
	DOM("pt" + penId).setAttribute("d", draw_live);
}


// ----------------------------------------- Insert ------------------------------

//var drawInsertIndex = 0;
function draw_insertToSlide(penId) {
	var pointCount = draw_data.length;
	
	// Simplify the path
	var newPath = [];
	var newPathIndex = 0;
	var partial = [];
	var partialIndex = 0;
	var svg_compression_level = 1.5;
	for(var svg_pointer = 0; svg_pointer < pointCount - 1; svg_pointer++ ) {
		if(draw_data[svg_pointer].a == "M") {
			if(svg_pointer > 0) {
				partial = simplify(partial, svg_compression_level, true);
				newPath[newPathIndex++] = { x: partial[0].x, y: partial[0].y, a: "M" };
				var partialCount = partial.length;
				for(var loopIndex = 1; loopIndex < partialCount; loopIndex++) {
					newPath[newPathIndex++] = { x: ~~partial[loopIndex].x, y: ~~partial[loopIndex].y, a: "L" };
				}
				partial = [];
				partialIndex = 0;
			} else {
				partial[partialIndex++] = { x: ~~draw_data[svg_pointer].x, y: ~~draw_data[svg_pointer].y, a: "M" }
			}
		} else {
			partial[partialIndex++] = { x: ~~draw_data[svg_pointer].x, y: ~~draw_data[svg_pointer].y, a: "L" }
		}
	}
	
	if(partial.length > 0) {
		partial = simplify(partial, svg_compression_level, true);
		newPath[newPathIndex++] = { x: partial[0].x, y: partial[0].y, a: "M" };
		var partialCount = partial.length;
		for(var loopIndex = 1; loopIndex < partialCount; loopIndex++) {
			newPath[newPathIndex++] = { x: ~~partial[loopIndex].x, y: ~~partial[loopIndex].y, a: "L" };
		}
		newPath[newPathIndex] = newPath[newPathIndex] - 1;
	}	
	
	// console.log("PEN Original: "+(draw_data.length)+" nodes, compressed: "+(newPath.length)+" nodes")	
	
	// Analyse the size
	var minx = 100000000;
	var maxx = 0;
	var miny = 100000000;
	var maxy = 0;
	var pointCount = newPath.length;
	for(var svg_pointer = 0; svg_pointer < pointCount - 1; svg_pointer++) {
		minx = minx > newPath[svg_pointer].x ? newPath[svg_pointer].x : minx;
		miny = miny > newPath[svg_pointer].y ? newPath[svg_pointer].y : miny;
		maxx = maxx < newPath[svg_pointer].x ? newPath[svg_pointer].x : maxx;
		maxy = maxy < newPath[svg_pointer].y ? newPath[svg_pointer].y : maxy;
	}
	minx -= pen_size_max;
	miny -= pen_size_max;
	maxx += pen_size_max;
	maxy += pen_size_max;
	var sizex = maxx - minx;
	var sizey = maxy - miny;
	
	// Build SVG
	var SVG = "";
	//SVG += 'M' + ( draw_data[penId][0].x - minx ) + ' ' + ( draw_data[penId][0].y - miny ) + ' ';
	for(var svg_pointer = 0; svg_pointer < pointCount - 1; svg_pointer++ ) {
		SVG += newPath[svg_pointer].a + ( newPath[svg_pointer].x - minx ) + ' ' + ( newPath[svg_pointer].y - miny ) + ' ';
	}
	
	var element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	
	// SVG
	element.style.left = minx + "px";
	element.style.top = miny + "px";
	element.style.width = sizex + "px";
	element.style.height = sizey + "px";
	
	element.setAttribute("class", "drawElement");
	element.setAttribute("precisionselect", "true");
	element.setAttribute("removable", "true");
	element.setAttribute("movable", "true");
	element.setAttribute("draggable", "false");
	element.setAttribute("viewBox", "0 0 " + sizex + " " + sizey);
	element.setAttribute("eonresize", "inkOnResize(w, h)");
	element.setAttribute("dotid", "dot_draw"); // To select the tool when the element is selected
	element.id = "DRW_" + Date.now();
	
	// PATH
	
	var path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
	path.setAttribute("stroke", pen_color);
	path.setAttribute("stroke-dasharray", pen_stroke);
	path.setAttribute("stroke-width", pen_size);
	path.setAttribute("fill", "none");
	path.setAttribute("vector-effect", "non-scaling-stroke");
	path.setAttribute("d", SVG);
	path.setAttribute("class", "drawPath");
	path.setAttribute("selectable", "true");
	element.appendChild(path);

	currentSlide.appendChild(element);
	element.style.zIndex = String(zIndexBase);
	zOrder_bringToFront(element);

	return element;
}

function inkOnResize(w, h) {
	if((current_snap_grid && !k_CTRL) || (!current_snap_grid && k_CTRL)) {
		var ugWH = unscaleX(grid_size);
		w = ~~(w /  (ugWH)) *  (ugWH);
		h = ~~(h /  (ugWH)) *  (ugWH);
		if(w < ugWH) w = ugWH;
		if(h < ugWH) h = ugWH;
	}
	selection.style.width = (w / slides_scale) + "px";
	selection.style.height = (h / slides_scale) + "px";	
	selector_refreshPos();
}
