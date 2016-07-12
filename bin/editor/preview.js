
var preview_canvas;
var preview_context;
var preview_scale = .1;

var previewSlide = null;
var previewWidth = null;

function build_preview(get_slide, get_previewWidth) {
	previewSlide = get_slide;
	previewWidth = get_previewWidth;
	if(typeof canvg == "undefined") {
		canvg_load1();
	} else {
		build_preview_now();
	}
}

// ------------------------------------------------ Load canvg library ----------------------------

function canvg_load1() {
	var scrpt = document.createElement('script');
	scrpt.onerror = function() {
		waitbox_end();
		message_start("Please Retry", "Your Internet access may be down")
		window.setTimeout(function() {
			message_end();
		}, 3000);
	}
	scrpt.onload = function() {
		canvg_load2();
	}
	scrpt.src= 'rsc/libs/svgtocanvas/canvg.min.js';
	document.head.appendChild(scrpt);
}

function canvg_load2() {
	var scrpt = document.createElement('script');
	scrpt.onerror = function() {
		waitbox_end();
		message_start("Please Retry", "Your Internet access may be down")
		window.setTimeout(function() {
			message_end();
		}, 3000);
	}
	scrpt.onload = function() {
		canvg_load3();
	}
	scrpt.src='rsc/libs/svgtocanvas/rgbcolor.js';
	document.head.appendChild(scrpt);
}

function canvg_load3() {
	var scrpt = document.createElement('script');
	scrpt.onerror = function() {
		waitbox_end();
		message_start("Please Retry", "Your Internet access may be down")
		window.setTimeout(function() {
			message_end();
		}, 3000);
	}
	scrpt.onload = function() {
		build_preview_now();
	}
	scrpt.src='rsc/libs/svgtocanvas/StackBlur.js';
	document.head.appendChild(scrpt);
}

//  ------------------------------------------------------------ Build preview ----------------------------

function build_preview_now() {
	//previewSlide.style.display = "none";
	//previewSlide.style.opacity = "0";
	
	preview_scale = previewWidth / slides_width;
	
	preview_canvas = document.getElementById("canvas_preview");
	preview_context = preview_canvas.getContext("2d");	
	
	preview_canvas.width = ~~(slides_width * preview_scale);
	preview_canvas.height = ~~(slides_height * preview_scale);
	preview_canvas.style.width = ~~(slides_width * preview_scale) + "px";
	preview_canvas.style.height = ~~(slides_height * preview_scale) + "px";
	preview_context.clearRect(0, 0, ~~(slides_width * preview_scale), ~~(slides_height * preview_scale));
	
	// Background color
	preview_context.fillStyle = previewSlide.style.backgroundColor;
	preview_context.fillRect(0, 0, slides_width * preview_scale, slides_height * preview_scale)
	preview_context.stroke();

	cleanup_zIndexes();
	
	// Elements
	var elements = previewSlide.querySelectorAll("[removable]");
	var elementsCount = elements.length;

	var elementsDone = 0;
	zMM = zOrder_findMinMax(previewSlide);
	for(var currentZ = zMM.min; currentZ <= zMM.max && elementsDone < elementsCount; currentZ++) {
		for(var index = 0; index < elementsCount; index++) {
			if(elements[index].parentNode === previewSlide) {
				var z = parseInt(elements[index].style.zIndex);
				if(z === currentZ) {
					if(elements[index].getAttribute("previewvisible") !== "false") {
						preview_draw(elements[index]);
					}
					elementsDone++;
				}
			}
		}
	}
	
//	try {
		var imageData = preview_canvas.toDataURL("image/jpeg", .97);
//	} catch(e) {
//		console.log("Preview error: " + e);
//	}
	preview_built(imageData);
}

function preview_draw(element) {
	var type = element.getAttribute("class").split("_")[0];
	switch(type) {
		case "clipartElement":
		case "shapeElement":
		case "drawElement":
		case "svgElement":
			clipart_preview(element);
			break;
		
		case "textElement":
			text_preview(element);
			break;
		
		case "imageElement":
			image_preview(element);
			break;
	}
}

function image_preview(element) {
	var nw = element.naturalWidth > 0 ? element.naturalWidth : element.width;
	var nh = element.naturalHeight > 0 ? element.naturalHeight : element.height;
	//var nh = element.naturalHeight;
//console.log("----------" + nw + ", " + nh)

	var x = parseInt(element.style.left);
	var y = parseInt(element.style.top);
	var w = parseInt(element.style.width == "" ? element.naturalWidth : element.style.width);
	var h = parseInt(nh / nw * w );
	try {
		preview_context.drawImage(element, 0, 0, nw, nh, ~~(x * preview_scale), ~~(y * preview_scale), ~~(w * preview_scale), ~~(h * preview_scale));
	} catch(e) { 
		//console.log("ERROR image_preview("+element.getAttribute("id")+"): " + e.message) 
 raiseError(e.message, scriptLg, e.fileName, docid, authorid, cSlideIndex, element.getAttribute("aid"), "previewImageBuilder", e.lineNumber);
		raiseError("image_preview", "Image ID: "+element.getAttribute("id")+" - " + e.message);
	}
}

function clipart_preview(element) {
	var extractor = document.createElement('div');
	var clone = element.cloneNode(true);
	clone.removeAttribute("amv");
	clone.removeAttribute("astart");
	clone.removeAttribute("aend");
	clone.removeAttribute("aclk");
	clone.removeAttribute("aclke");
	clone.removeAttribute("atick");
	clone.removeAttribute("ainit");
	extractor.appendChild(clone);
	
	var svgString = extractor.innerHTML;
	var c = document.createElement('canvas');
	var ctx = c.getContext('2d');
	var x = parseInt(element.style.left);
	var y = parseInt(element.style.top);
	var w = parseInt(element.style.width);
	var h = parseInt(element.style.height);
	canvg(c, svgString, {log: true});
	preview_context.drawImage(c, 0, 0, w, h, ~~(x * preview_scale), ~~(y * preview_scale), ~~(w * preview_scale), ~~(h * preview_scale));
}

function text_preview(element) {
	var size = parseInt(element.style.fontSize);
	var family = element.style.fontFamily;
	var color = element.style.color;
	var backgroundColor = element.style.backgroundColor;
	var text = element.innerHTML;
	var x = int(element.style.left);
	var y = int(element.style.top);
	var w = int(element.style.width)
	var h = int(element.style.height)
	var maxw = w + 10;
	var lineHeight = size * 1.2 + 2;
	
	if(backgroundColor !== "") {
		preview_context.fillStyle = backgroundColor;
		preview_context.fillRect(x * preview_scale, (y + 20) * preview_scale, w * preview_scale, h * preview_scale);
	}
	
	preview_context.fillStyle = color;
	preview_context.baseline = "top";
	preview_context.textAlign = "left";
	var t_align = 0;
	switch(element.style.textAlign) {
		case "left": t_align = 0; break;
		case "center": t_align = 1; break;
		case "right": t_align = 2; break;
	}
	preview_context.font = ~~(size * preview_scale) + "px " + family;
	
	text = str_replace(text, "</div><div>", "<br>");
	text = str_replace(text, "<div>", "<br>");
	text = str_replace(text, "</div>", "<br>");
	text = str_replace(text, "&nbsp;", " ");
	var lines = text.split("<br>");
	var penx = x;
	var peny;
	
	var targetText = "";
	var textLine = "";
	for (var linesindex in lines) {
		var words = lines[linesindex].split(" ");
		for(var wordsindex in words) {
			var len = (preview_context.measureText(words[wordsindex] + " ").width / preview_scale);
			var textW = (penx - x + len);
			if(textW > maxw && textLine != "") {
				targetText += (targetText == "" ? "" : "<br>") + textLine;
				textLine = "";
				penx = x;
			}
			textLine += (textLine == "" ? "" : " ") + words[wordsindex];
			penx += len;
		}
		targetText +=  (targetText == "" ? "" : "<br>") + textLine;
		textLine = "";
		penx = x;
	}
	
	lines = targetText.split("<br>");
	penx = x;
	peny = y + lineHeight;

	
	var textLine = "";
	for (var linesindex in lines) {
		
		var words = lines[linesindex].split(" ");
		for(var wordsindex in words) {
			var len = (preview_context.measureText(words[wordsindex] + " ").width / preview_scale);
			textLine += (textLine == "" ? "" : " ") + words[wordsindex];
			penx += len;
		}
		var tx;
		var textW = (penx - x);
		switch(t_align) {
			case 0: tx = ~~(x * preview_scale); break;
			case 1: tx = ~~( ( x + (w / 2 - textW / 2) ) * preview_scale); break;
			case 2: tx = ~~((x + w - textW) * preview_scale); break;
		}

		preview_context.fillText(textLine, tx, ~~(peny * preview_scale));
		
		textLine = "";
		penx = x;
		peny += lineHeight;
			
	}
}
