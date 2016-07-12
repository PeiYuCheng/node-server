
function browse_picture() {
	DOM("PICTURE_IMPORT").innerHTML = "<input type='file' accept='image/*;capture=camcorder' id='camera' onchange='picture_ready()' multiple style='display: none; position: absolute;'>";
	imageLoadedCount = 0;
	fireEvent(DOM("camera"), "click");
}

var imageFilesCount = 0;
var imageFileIndex = 0;

function picture_ready() {
	if (DOM("camera").files && DOM("camera").files[0]) {
		waitbox_start();
		imageFilesCount = DOM("camera").files.length;
		imageFileIndex = 0;
		setTimeout(function() {
			picture_process_next();
		}, 250);
	}
}
		
function picture_process_next() {		
	var reader = new FileReader();
	var insertImportFormat = null;
	var insertAsText = false;
	reader.onload = function (e) {
		insertImageFromData(e.target.result, insertAsText, insertImportFormat);
	}
	
	var itype = DOM("camera").files[imageFileIndex].type;
//console.log("ITYPE: " + itype + "("+DOM("camera").files[imageFileIndex].name+")");
	insertImportFormat = null;
	
	var sname = DOM("camera").files[imageFileIndex].name;
	var fileex = sname.substr(sname.lastIndexOf(".") + 1);
	if(fileex === "iwb") {
		insertImportFormat = fileex;
		insertAsText = true;
		reader.readAsText(DOM("camera").files[imageFileIndex]);			
	}
	
	if(insertImportFormat === null) {
		if(itype == "image/svg+xml") {
			insertAsText = true;
			reader.readAsText(DOM("camera").files[imageFileIndex]);
		} else {
			insertAsText = false;
			reader.readAsDataURL(DOM("camera").files[imageFileIndex]);
		}
	}
}

function insertImageFromData(data, insertAsText, insertImportFormat) {
	if(insertImportFormat === null) {
		var element;
		if(insertAsText) {
			element = importSVGdata(currentSlide, data);
			setTimeout(function() {
				imageLoaded(element, insertAsText);
			}, 10);
		} else {
			element = document.createElement("IMG");
			
			currentSlide.appendChild(element);
			element.id = "IMG_" + createId();
			element.setAttribute('src', data);
			element.setAttribute("class", "imageElement");
		}	
		var thisPos = getInsertionPosition(element);	
		element.style.zIndex = String(zIndexBase);
		element.setAttribute('movable', "true");
		element.setAttribute('selectable', "true");
		element.setAttribute("removable", "true");
		element.setAttribute('draggable', "false");
		element.setAttribute("eonresize", "imageOnResize(w, h)");
		element.setAttribute("dotid", "dot_camera");
		element.setAttribute("onload", "imageLoaded(this, "+insertAsText+", '"+insertImportFormat+"')");
		element.setAttribute("style", "display: none; border: 0px; left:"+(thisPos.x)+"px; top:"+(thisPos.y)+"px; z-index:" + zIndexBase);
		zOrder_bringToFront(element);
		if(imageLoadedCount * 20 < slides_width - 50 && imageLoadedCount * 20 < slides_height - 50) {
			imageLoadedCount++; // Don't increment position if out of slide
		}
	} else {
		import_IWB(data);
	}
}

function importSVGdata(target, data) {
	target.insertAdjacentHTML("beforeEnd", data);
	var elements = currentSlide.getElementsByTagName("svg");
	var lastIndex = 0;
	for(var index = 0; index < elements.length; index++) { 
		lastIndex = index;
	}
	element = elements[lastIndex];
	if(exists(element)) {
		element.id = "IMG_" + createId();
		element.removeAttribute("x");
		element.removeAttribute("y");
		element.setAttribute("class", "svgElement");
		var svgrect = element.getBBox();
		var w = ~~(svgrect.width > slides_width / 2 ? slides_width : svgrect.width);
		var h = ~~(svgrect.height > slides_height / 2 ? slides_height : svgrect.height);
		element.style.width = w + "px";
		element.style.height = h + "px";
		element.setAttribute("width", w)
		element.setAttribute("height", h)
	}
	return(element);
}

var imageLoadedCount = 0;
function imageLoaded(image, insertAsText) {
	window.scroll(0, 1);
	if(!insertAsText) {
		var w = ~~image.naturalWidth;
		var h = ~~image.naturalHeight;
		var imagewantw = w;
		var imagewanth = h;
		
		var ratio = w / h;
		
		if(imagewantw > scr.w) {
			imagewantw = ~~(scr.w);
			imagewanth = ~~(imagewantw / ratio);
		}
		if(imagewanth > scr.h) {
			imagewanth = ~~(scr.h);
			imagewantw = ~~(imagewanth * ratio);
		}
	

		var imageType = image.src.substr(0, image.src.indexOf(";"));
		if(imageType.indexOf("/") > -1) {
			imageType = imageType.split("/")[1];

			// Resample & set compress
			var canvas = document.createElement("canvas");
			canvas.width = imagewantw;
			canvas.height = imagewanth;
			var canvas_cx = canvas.getContext("2d");
			canvas_cx.drawImage(image, 0, 0, w, h, 0, 0, imagewantw, imagewanth);
			if(image.src.length > 500 * 1024) {
				imageType = "image/jpeg";
			}
			image.src = canvas.toDataURL(imageType, 0.5);
			image.style.width = imagewantw + "px";
			
			image.onload = function() {
				image_done_now_next(image);
			};
		}
	} else {
		image_done_now_next(image);
	}
	window.scroll(0, 1);
}

function image_done_now_next(image) {
	image.style.display = "block";
	if(image.hasAttribute("onload")) image.removeAttribute("onload");
	if(++imageFileIndex < imageFilesCount) {
		picture_process_next();
	} else {
		waitbox_end();
		set_selection(image);
	}
}

function imageOnResize(w, h) {
	var pos = getPos(selection);
	w = (w / slides_scale);
	
	if((current_snap_grid && !k_CTRL) || (!current_snap_grid && k_CTRL)) {
		w = ~~(w / grid_size) * grid_size;
		if(w < grid_size) w = grid_size;
	}
	
	selection.style.width = w + "px";
	if(selection.getAttribute("class") == "imageElement") {
		var nh = ~~((w * selection.naturalHeight / selection.naturalWidth));
		if((current_snap_grid && !k_CTRL) || (!current_snap_grid && k_CTRL)) {
			nh = ~~((nh + grid_size / 2) /  grid_size) *  grid_size;
			if(nh < grid_size) nh = grid_size;
		}
		selection.style.height = nh + "px";
	} else {		
		h = ~~(h / slides_scale);
		if((current_snap_grid && !k_CTRL) || (!current_snap_grid && k_CTRL)) {
			h = ~~(h /  grid_size) *  grid_size;
			if(h < grid_size) h = grid_size;
		}
		selection.style.height = h + "px";	
	}
}
