
function import_IWB(data) {
	var dataPos = data.indexOf("<iwb ");
	data = data.substring(dataPos);
	dataPos =  data.indexOf("</iwb>");
	data = data.substring(0, dataPos);
	
	var pages = data.split("<svg:page ");
	var pagesCount = pages.length;
	if(pagesCount > 2) {
		console.log("Multi page: create one slide per page")
	} else {
		console.log("Single page: import to current slide")
	}
	for(var ptr = 1; ptr < pagesCount; ptr++) {
		import_IWB_page(pages[ptr]);
	}
}

function import_IWB_page(data) {
	console.log("---- IMPORT IWB PAGE ----");
	data = data.split("\n");
	var toadd = [];
	var linesCount = data.length;
	for(var ptr = 0; ptr < linesCount; ptr++) {
		if(data[ptr].indexOf("<svg:") > -1) {
			
			var objectHeader = "<" + data[ptr].split("<")[1].split(" ")[0];
			var svgImportElement = false;			
			
			if(objectHeader.substring(0, 5) === "<svg:") {
				var ftag = objectHeader.replace("<svg:", "<") + " ";
				var build = data[ptr];
				var tpos = build.indexOf("translate(");
				var rpos = build.indexOf(")", tpos);
				var txyString = build.substr(tpos, rpos - tpos);
				var txy = txyString.substr(10).split(",");
				var tx = parseFloat(txy[0]);
				var ty = parseFloat(txy[1]);

				if(objectHeader === "<svg:polygon" || objectHeader === "<svg:polyline") {
					var strokeSize = attributeFromString(data[ptr], "stroke-width");
					strokeSize = strokeSize === null ? 0 : parseFloat(strokeSize);
					tx -= strokeSize / 2;
					ty -= strokeSize / 2;
					var originalPoints = attributeFromString(data[ptr], "points");
					var points = originalPoints;
					var minMax = getMinMaxFromPoints(points);
					if(minMax.minx < 0) {
						points = stringMovePoints(points, -minMax.minx, 0);
						tx += minMax.minx;
						minMax = getMinMaxFromPoints(points);
					}
					if(minMax.miny < 0) {
						points = stringMovePoints(points, 0, -minMax.miny);
						minMax = getMinMaxFromPoints(points);
						ty += minMax.miny;
					}
					points = stringMovePoints(points, -minMax.minx + strokeSize / 2, -minMax.miny + strokeSize / 2);
					var w = parseInt(minMax.maxx - minMax.minx) + strokeSize;
					var h = parseInt(minMax.maxy - minMax.miny) + strokeSize;
					var svg = '<svg x="0" y="0" viewBox="0 0 '+w+" "+h+'"><' + build.split("<svg:")[1] + "</svg>";	
					svg = svg.replace("", "");
					svg = svg.replace(txyString + ")", "");
					svg = svg.replace(originalPoints, points);
					svg = svg.replace(ftag, ftag + " style='pointer-events: none;' ");
					if(svg.indexOf("fill=") === -1) {
						svg = svg.replace("<svg ", "<svg fill='none' ");
					}
					svgImportElement = true;
				}
				if(svgImportElement) {
					var element = importSVGdata(currentSlide, svg);
					element.style.zIndex = String(zIndexBase);
					element.setAttribute('movable', "true");
					element.setAttribute('selectable', "true");
					element.setAttribute("removable", "true");
					element.setAttribute('draggable', "false");
					element.setAttribute("eonresize", "imageOnResize(w, h)");
					element.setAttribute("dotid", "dot_camera");
					element.setAttribute("style", "display: block; border: 0px; left:"+tx+"px; top:"+ty+"px; width:"+w+"px; height:"+h+"px; z-index:" + zIndexBase);
					zOrder_bringToFront(element);
				}
			}
		}	
	}
	waitbox_end();
	
}

// ---------------------------------------------------------------------------

function attributeFromString(data, aname) {
	var sign = '"';
	var posStart = data.indexOf(aname + '=' + sign);
	if(posStart === -1) {
		sign = "'";
		posStart = data.indexOf(aname + '=' + sign);
	}
	if(posStart > -1) {
		var posEnd = data.indexOf(sign, posStart + aname.length + 3);
		if(posEnd > -1) {
			return(data.substring(posStart + aname.length + 2, posEnd));
		}
	}
	return null;
}

function getMinMaxFromPoints(points) {
	var minx = 999999;
	var miny = 999999;
	var maxx = 0;
	var maxy = 0;
	points = points.split(" ");
	for(var ptr in points) {
		var duon = points[ptr].split(",");
		minx = minx > parseFloat(duon[0]) ? parseFloat(duon[0]) : minx;
		maxx = maxx < parseFloat(duon[0]) ? parseFloat(duon[0]) : maxx;
		miny = miny > parseFloat(duon[1]) ? parseFloat(duon[1]) : miny;
		maxy = maxy < parseFloat(duon[1]) ? parseFloat(duon[1]) : maxy;
	}
	return( { minx: minx, miny: miny, maxx: maxx, maxy: maxy } );
}

function stringMovePoints(points, x, y) {
	var output = "";
	points = points.split(" ");
	for(var ptr in points) {
		if(points[ptr].indexOf(",") > -1) {
			var duon = points[ptr].split(",");
			output += (output == "" ? "" : " ") + parseFloat((parseFloat(duon[0]) + x).toFixed(2)) + "," + parseFloat((parseFloat(duon[1]) + y).toFixed(2));
		}
	}
	return( output );
}
