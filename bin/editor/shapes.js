

var SHAPE_ARROW = 2;
var SHAPE_POLY = 3;

var shapeAddedMargin = 40;  // Space around the SVG to allow drawing special elements as arrow

var shape_color = "";
var shape_bgcolor = "";
var shape_stroke = "";
var shape_line_index = 3;
var shape_lines = [
	[1, "1, 3"],
	[1, ""],
	[2, "3, 8"],
	[3, ""],
	[4, "4,8"],
	[6, ""],
	[10, ""]
]
//var shapeInsertIndex = 0;
var activeDotShape = "";
var shapeEdited = [];

function shapes_init() {
	// Create shape icons
	shape_setIcon("dot_shapes", "M15 30 L22.5 15 L30 30 Z M35 30 L27.5 15", circleI(15, 30) + circleI(22.5, 15) + circleI(27.5, 15) + circleI(30, 30) + circleI(35, 30));
	shape_setIcon("dot_shape_arrow", "M15 35 L35 15 M35 15 L25 17 M35 15 L33 25", circleI(15, 35));
	//shape_setIcon("dot_shape_c", "", circleI(22.5, 22.5, 22.5, "#8493A8", "transparent") + circleI(15, 35) + circleI(35, 15));
	shape_setIcon("dot_shape_2p", "M15 35 L35 15", circleI(15, 35) + circleI(35, 15));
	shape_setIcon("dot_shape_3p", "M15 35 L25 15 L35 35 Z", circleI(15, 35) + circleI(25, 15) + circleI(35, 35));
	shape_setIcon("dot_shape_4p", "M15 15 L35 15 L35 35 L15 35 Z", circleI(15, 15) + circleI(15, 35) + circleI(35, 35) + circleI(35, 15));
	shape_setIcon("dot_shape_5p", "M18 35 L15 22 L25 14 L35 22 L32 35 Z", circleI(18, 35) + circleI(15, 22) + circleI(25, 14) + circleI(35, 22) + circleI(32, 35));
	shape_setIcon("dot_shape_6p", "M25 36 L15 30 L15 20 L25 14 L35 20 L35 30 Z", circleI(25, 36) + circleI(15, 30) + circleI(15, 20) + circleI(25, 14) + circleI(35, 20) + circleI(35, 30));

	shape_color = DOM("dot_shape_color").style.backgroundColor;
	shape_bgcolor = DOM("dot_shape_bgcolor").style.backgroundColor;
	refresh_shape_icons();
}

function refresh_shape_icons() {
	shape_line_stroke = shape_lines[shape_line_index][1];
	
	DOM("label_shape_color").style.fill = get_visible_color(shape_color);
	DOM("label_shape_bgcolor").style.fill = get_visible_color(shape_bgcolor);

	for(var index = 0; index < 7; index++) {
		DOM("dot_SHAPELINE_" + index).innerHTML = svg_svg(svg_path("M16 16 L34 34", "#8493A8", shape_lines[index][0], shape_lines[index][1]), 50, 50);
	}
	DOM("active_shape_line").innerHTML = DOM("dot_SHAPELINE_" + shape_line_index).innerHTML;
}

function shape_setIcon(iconId, path, more) {
	DOM(iconId).childNodes[0].innerHTML = svg_svg(svg_path(path, "#8493A8", .5) + more, 50, 50);
}

function circleI(x, y, r, stroke, fill) {
	r = typeof r == "undefined" ? 1.5 : r;
	stroke = typeof stroke == "undefined" ? "" : " stroke='"+stroke+"' ";
	fill = typeof fill == "undefined" ? "#8493A8" : fill;
	return('<circle ' + stroke + ' fill="' + fill + '" cx="' + x + '" cy="' + y + '" r="' + r + '"/>');
}

function shape_move() {
	shape_refreshPos();
}
function shape_node_move() {
	rebuild_shape_from_selNodes();
	if((current_snap_grid && !k_CTRL) || (!current_snap_grid && k_CTRL)) {
		shape_refreshPos();
	}
	selector_refreshPos();
}

// ------------------------------- SELECTION ---------------------------------------------------------

function shape_unselect() {
	var es = DOMN("SELNODE", true);
	var es_count = es.length;
	for(var index = 0; index < es_count; index++) {
		es[index].style.display = "none";
	}
}
function shape_select() {
	shape_edited = {
		type: selection.getAttribute("shape"),
		nodes: []
	}
	var data = selection.childNodes[0].getAttribute("d");
	if(shape_edited.type == SHAPE_POLY) {
		var nodes = (data.substr(1, data.length - 2)).trim().split("L");
	}
	if(shape_edited.type == SHAPE_ARROW) {
		var getNodes = (data.substr(1, data.length)).trim().split("L");
		var nodes = [];
		nodes[0] = getNodes[0];
		var gn = getNodes[1].trim().split(" ");
		nodes[1] = gn[0] + " " + gn[1];
	}
	var nodes_count = nodes.length;

	var selpos = selection.getBoundingClientRect();
	var es = DOMN("SELNODE", true);

	for(var index = 0; index < nodes_count; index++) {
		var xy = nodes[index].trim().split(" ");
		var x = (selpos.left + unscaleX(~~xy[0] - selnode_size / 2))
		var y = (selpos.top + unscaleY(~~xy[1] - selnode_size / 2))
		es[index].style.left = x + "px";
		es[index].style.top = y + "px";
		es[index].style.touchAction = "none";
		es[index].style.display = "block";
		shape_edited.nodes[index] = [x, y];
	}
	activeDotShape = selection.getAttribute("dotid");

	var color = selection.childNodes[0].getAttribute("stroke");
	DOM("dot_shape_color").style.backgroundColor = color;
	DOM("label_shape_color").style.fill = get_visible_color(color);
	
	var bgcolor = selection.childNodes[0].getAttribute("fill");
	DOM("dot_shape_bgcolor").style.backgroundColor = bgcolor;
	DOM("label_shape_bgcolor").style.fill = get_visible_color(bgcolor);

	var strokeDash = selection.childNodes[0].getAttribute("stroke-dasharray").trim();
	var strokeWidth = parseInt(selection.childNodes[0].getAttribute("stroke-width"));
	
	var id = "";
	for(var ptr = 0; ptr <= 4; ptr++) {
		id = "dot_SHAPELINE_" + ptr;
		if(DOM(id).childNodes[0].childNodes[0].getAttribute("stroke-width") == strokeWidth && DOM(id).childNodes[0].childNodes[0].getAttribute("stroke-dasharray") == strokeDash) {
			DOM("active_shape_line").innerHTML = DOM(id).innerHTML;
		}
	}
	
	refresh_shape_icons();
}

function shape_refreshPos() {
	if(selection !== null && selection.hasAttribute("shape")) {
		var type = selection.getAttribute("shape");
		var data = selection.childNodes[0].getAttribute("d");
		if(shape_edited.type == SHAPE_POLY) {
			var nodes = (data.substr(1, data.length - 2)).trim().split("L");
		}
		if(shape_edited.type == SHAPE_ARROW) {
			var getNodes = (data.substr(1, data.length)).trim().split("L");
			var nodes = [];
			nodes[0] = getNodes[0];
			nodes[1] = getNodes[1];
		}
		
		var nodes_count = nodes.length;
		var selpos = selection.getBoundingClientRect();

		var es = DOMN("SELNODE", true);
		
		for(var index = 0; index < nodes_count; index++) {
			var xy = nodes[index].trim().split(" ");
			es[index].style.left = (selpos.left + ~~(xy[0] * slides_scale) - selnode_size / 2) + "px";
			es[index].style.top = (selpos.top + ~~(xy[1] * slides_scale) - selnode_size / 2) + "px";
			es[index].style.display = "block";
		}
	}
}

// ------------------------------- INSERT ---------------------------------------------------------


function shape_insertToSlide(id) {
	var objectSize = 200;
	
	var type = "";

	if(id == "dot_shape_6p") {
		shape_edited = {
			type: SHAPE_POLY,
			nodes: [ [80, 0], [160,40], [160,120], [80,160], [0,120], [0,40] ]
		}		
	}	
	
	if(id == "dot_shape_5p") {
		shape_edited = {
			type: SHAPE_POLY,
			nodes: [ [80, 0], [160,80], [120,160], [40,160], [0,80] ]
		}		
	}
	
	if(id == "dot_shape_4p") {
		shape_edited = {
			type: SHAPE_POLY,
			nodes: [ [160, 0], [160,160], [0,160], [0,0] ]
		}		
	}
	
	if(id == "dot_shape_3p") {
		shape_edited = {
			type: SHAPE_POLY,
			nodes: [ [80, 0], [0,160], [160,160] ]
		}
	}

	if(id == "dot_shape_2p") {
		shape_edited = {
			type: SHAPE_POLY,
			nodes: [ [0, 0], [160,160] ]
		}		
	}
	
	//if(id == "dot_shape_c") {
	//	shape_edited = {
	//		type: SHAPE_POLY,
	//		nodes: [ [80, 80], [160,160] ]
	//	}		
	//}
	
	if(id == "dot_shape_arrow") {
		shape_edited = {
			type: SHAPE_ARROW,
			nodes: [ [0, 0], [160,160] ]
		}		
	}
	for(var ptr in shape_edited.nodes) {
		shape_edited.nodes[ptr][0] = shape_edited.nodes[ptr][0];
		shape_edited.nodes[ptr][1] = shape_edited.nodes[ptr][1];
	}		

	var lineSize = shape_lines[shape_line_index][0];
	var lineStyle = shape_lines[shape_line_index][1];
	
	var objectSizeWM = objectSize + (shapeAddedMargin * 2);
	
	// SVG
	var element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	var thisPos = getInsertionPosition(element, objectSizeWM, objectSizeWM);
	
	element.setAttribute("class", "shapeElement");
	element.style.left = (thisPos.x + shapeAddedMargin) + "px";
	element.style.top = (thisPos.y + shapeAddedMargin) + "px";
	element.style.width = (objectSizeWM) + "px";
	element.style.height = (objectSizeWM) + "px";
	element.style.zIndex = String(zIndexBase);
	
	element.setAttribute("precisionselect", "true");
	element.setAttribute("shape", shape_edited.type);	
	element.setAttribute("draggable", "false");
	element.setAttribute("selectable", "true");
	element.setAttribute("removable", "true");
	element.setAttribute("movable", "true");

	element.setAttribute("viewBox", "0 0 "+ objectSizeWM +" " + objectSizeWM);
	element.setAttribute("dotid", id); // To select the tool when the element is selected
	element.id = "SHAPE_" + Date.now();
	
	// PATH rendering
	var path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
	path.setAttribute("d", shapeNodesToSVG(shape_edited));
	path.setAttribute("selectable", "true");
	path.setAttribute("class", "renderingPathShape");
	path.setAttribute("selectable", "true");
	path.setAttribute("stroke", shape_color);
	path.setAttribute("stroke-linecap", "round");
	path.setAttribute("fill", shape_bgcolor);
	path.setAttribute("stroke-width", lineSize);
	path.setAttribute("stroke-dasharray", lineStyle);
	element.appendChild(path);
	//element.style.backgroundColor = "rgba(0,0,0,.1)";	
	currentSlide.appendChild(element);
	zOrder_bringToFront(element);
	set_selection(element);
	
	rebuild_shape_from_selNodes()	
}

function shapeNodesToSVG(shape) {
	var DATA = "";
	if(shape.type == SHAPE_ARROW) {
		var p1x = ~~shape.nodes[0][0];
		var p1y = ~~shape.nodes[0][1];
		var p2x = ~~shape.nodes[1][0];
		var p2y = ~~shape.nodes[1][1];
		var a = Math.atan2(p2y - p1y, p2x - p1x);
		
		var arrowAngle = 35 / 180 * Math.PI;
		var arrowSize = 25;
		var aconst = 270 / 180 * Math.PI  - a;
		
		var px1 = Math.sin(aconst - arrowAngle) * arrowSize + p2x; 
		var py1 = Math.cos(aconst - arrowAngle) * arrowSize + p2y; 
		var px2 = Math.sin(aconst + arrowAngle) * arrowSize + p2x; 
		var py2 = Math.cos(aconst + arrowAngle) * arrowSize + p2y; 
		
		DATA = "M" + shape.nodes[0][0] + " " + shape.nodes[0][1] + " ";
		DATA += "L" + shape.nodes[1][0] + " " + shape.nodes[1][1] + " ";
		DATA += "M" + shape.nodes[1][0] + " " + shape.nodes[1][1] + " ";
		DATA += "L" + px1 + " " + py1 + " ";
		DATA += "M" + shape.nodes[1][0] + " " + shape.nodes[1][1] + " ";
		DATA += "L" + px2 + " " + py2 + " ";
	}
	if(shape.type == SHAPE_POLY) {
		DATA = "M" + (shape.nodes[0][0]) + " " + (shape.nodes[0][1]) + " ";
		var nodesCount = shape.nodes.length;
		var gs = grid_size;
		for(var nodeIndex = 1; nodeIndex < nodesCount; nodeIndex++) {
			Px = ~~shape.nodes[nodeIndex][0];
			Py = ~~shape.nodes[nodeIndex][1];
			DATA += "L" + Px + " " + Py + " ";
		}
		DATA += "Z";
	}
	return(DATA);
}

function rebuild_shape_from_selNodes() {
	var type = selection.getAttribute("shape");
	var shape = {
		type: type,
		nodes: []
	};
	var selpos = selection.getBoundingClientRect();
	var minx = 99999999;
	var maxx = 0;
	var miny = 99999999;
	var maxy = 0;
	var domnodes = DOMN("SELNODE", true);
	var nodes_count = shape_edited.nodes.length;
	
	var mdelta = selnode_size / 2 / slides_scale;
	for(var index = 0; index < nodes_count; index++) {
		var nodepos = domnodes[index].getBoundingClientRect();

		var nx = parseInt(domnodes[index].style.left);
		var ny = parseInt(domnodes[index].style.top);
		
		nx = scaleX(nx);
		ny = scaleY(ny);
		minx = minx > nx + mdelta ? ~~(nx + mdelta) : minx;
		maxx = maxx < nx + mdelta ? ~~(nx  + mdelta) : maxx;
		miny = miny > ny + mdelta ? ~~(ny + mdelta) : miny;
		maxy = maxy < ny + mdelta ? ~~(ny + mdelta) : maxy;
	}
	if((current_snap_grid && !k_CTRL) || (!current_snap_grid && k_CTRL)) {
		minx = ~~((minx+20) /  grid_size) *  grid_size;
		miny = ~~((miny+20) /  grid_size) *  grid_size;
	}

	for(var index = 0; index < nodes_count; index++) {
		var nodepos = domnodes[index].getBoundingClientRect();
		
		var nx = scaleX(parseInt(domnodes[index].style.left))
		var ny = scaleY(parseInt(domnodes[index].style.top))
		
		
		nx = (nx + mdelta - minx + shapeAddedMargin)
		ny = (ny + mdelta - miny + shapeAddedMargin)
		if((current_snap_grid && !k_CTRL) || (!current_snap_grid && k_CTRL)) {
			nx = ~~((nx+20) /  grid_size) *  grid_size;
			ny = ~~((ny+20) /  grid_size) *  grid_size;
		}	
		shape.nodes[index] = [ nx, ny ];
	}
	
	var shape_data = shapeNodesToSVG(shape);

	selection.style.left = (minx - shapeAddedMargin) + "px"
	selection.style.top = (miny - shapeAddedMargin) + "px"
	
	var sizex = maxx - minx;
	var sizey = maxy - miny;
	var scalledMargin = shapeAddedMargin;
	selection.style.width = (sizex + scalledMargin*2 )  + "px";
	selection.style.height = (sizey + scalledMargin*2 ) + "px";
	selection.setAttribute("viewBox", "0 0 "  + (sizex + scalledMargin * 2) + " " + (sizey + scalledMargin * 2));	
	selection.childNodes[0].setAttribute("d", shape_data);	
	
}




