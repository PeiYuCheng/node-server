
/** Interval between all tick events, default is 1000ms. **/
var tickEventPulse = 1000;

// --------------------------------- LIB

// ----------------------------------------- DEPRECIATED
function o(uid) {
	return object(uid);
}
/** Returns the element from the name**/
function object(objectName) {
	if(typeof objectName === "undefined") {
		return(executeAuthorObject);
	} else {
		var element = document.body.querySelector("[uid="+objectName+"]");
		if(element === null) {
			return(executeAuthorObject);
		} else {
			return(element);
		}
	}
}

/** Reference to the iframe in use to embed a content **/
var iframe = null;
var embedBackground = null;
/** URL currently embedded **/
var embeded = null;

/** Show or hide an embeded object. **/ 
function embed_switch(url, x, y, w, h) {
	if(iframe === null) {
		embed(url, x, y, w, h);
	} else {
		embed_end();
	}
}

/** Embed the url as a background. **/
function bg(url) {
	embed(url, {x:0, y:0, w:100, h:100, z:"bg"})
}

/** Embed an url to the specified position.
wywh can be "slide" or { x: 0 , y: 0, w: 100, h: 100, z: "top" } **/
function embed(el, xywh, scale, frameid, showBackground) {
	if(typeof showBackground == "undefined")  showBackground = false;
	if(typeof xywh == "undefined")  xywh = { x:20 , y: 10, w: 60, h: 80, z: "top" }
	if(!exists(scale)) scale = 1;
	closeExisting = false;
		
	if(xywh == "slide")  xywh = { x:0 , y: 0, w: 100, h: 100, z: "bg" }
	if(xywh == "full")  xywh = { x:0 , y: 0, w: 100, h: 100, z: "top" }
	var gxywh;
	if(typeof xywh.ownerDocument !== "undefined") {
		gxywh = { x: xywh.style.left, y: xywh.style.top, w: xywh.style.width, h: xywh.style.height, z: xywh.style.zIndex + 1 }
		if(gxywh.h == "auto" || gxywh.h == "") {
			gxywh.h = (~~(parseInt(xywh.style.width) * xywh.naturalHeight / xywh.naturalWidth)) + "px";
		}
		if(gxywh.w == "") {
			gxywh.w = xywh.naturalWidth;
			gxywh.h = xywh.naturalHeight;
		}
	} else {
		gxywh = xywh;
	}
	var ex = typeof gxywh.x == "undefined" ? "0px" : isNaN(gxywh.x) ? gxywh.x : gxywh.x + "%";
	var ey = typeof gxywh.y == "undefined" ? "0px" : isNaN(gxywh.y) ? gxywh.y : gxywh.y + "%";
	var ew = typeof gxywh.w == "undefined" ? "0px" : isNaN(gxywh.w) ? gxywh.w : gxywh.w + "%";
	var eh = typeof gxywh.h == "undefined" ? "0px" : isNaN(gxywh.h) ? gxywh.h : gxywh.h + "%";
/*	if(showBackground && embedBackground === null) {
		embedBackground = document.createElement("div");
		embedBackground.setAttribute("style", "position: absolute; left: 0px; top: 0px; width: 100%; height: 100%; background-color:rgba(128,128,128,.8);");
		embedBackground.setAttribute("id", "EMBEDED_BG");
		embedBackground.setAttribute("inputstart", "embed_end()");
		currentSlide.appendChild(embedBackground);
		
						embedBackground.style.zIndex = int(slides.item(i).style.zIndex) - 1;
						embedBackground.style.display = "block";
		
	} */
	if(typeof(el) == "string") {
		// ------------- YouTube --------------
		if(el.indexOf("youtu.be/") > -1) { // Short YouTube form
			el = "https://www.youtube.com/embed/" + el.split("youtu.be/")[1];
		}
		if(el.indexOf(".youtube.com/") > -1) {
			el = stringToURL(el);
			if(el.indexOf("/watch?v=") > -1) {
				el = "https://www.youtube.com/embed/" + el.split("/watch?v=")[1];
			}
		}
		var elr = el;
		if(elr.indexOf("?") > -1) elr = elr.split("?")[0];
		var ext = elr.substr(elr.lastIndexOf(".")).toLowerCase();
		switch(ext) {
			case ".mp4":
			case ".webm":
			case ".ogg":
				if(el.indexOf("app/player/?") === -1) {
					el = ROOT_URL + "/app/player/?" + elr;
				}
				break;
		}

		embeded = el;
		if(iframe === null || !closeExisting) {
			iframe = document.createElement("iframe");
			currentSlide.appendChild(iframe);
		}
		iframe.setAttribute("allowfullscreen", "true");
		iframe.style.border = "0px";
		iframe.style.position = "absolute";
		
		iframe.style.left = ex;
		iframe.style.top = ey;
		if(scale !== 1) {
			iframe.style.transformOrigin = "top left";
			iframe.style.webkitTransformOrigin = "top left";
			iframe.style.transform = "scale("+scale+")";
			iframe.style.webkitTransform = "scale("+scale+")";
			iframe.style.width = ew.indexOf("px") > -1 ? (parseInt(ew) / scale) + "px" : ew;
			iframe.style.height = eh.indexOf("px") > -1 ? (parseInt(eh) / scale) + "px" : eh;
		} else {
			iframe.style.width = ew;
			iframe.style.height = eh;			
		}
		if(exists(frameid)) iframe.setAttribute("id", frameid);
		iframe.src = stringToURL(el);
		if(typeof gxywh.z == "undefined") gxywh.z = "top";
		if(gxywh.z == "top") gxywh.z = 10000;
		if(gxywh.z == "bg") gxywh.z = 0;
		iframe.style.zIndex = gxywh.z;
		iframe.style.display = "block";
		return(iframe);
	} else {
		el = parseInt(el > 0 ? el - 1 : el);
		var slides = document.getElementsByClassName("slide");
		if(el < 0 || el > slides.length) {
			alert("Cannot embed a page out of range.")
		} else {
			for(var i = 0; i < slides_count; i++) {
				if(el == i) {
					
					slides.item(i).style.width = 1920;
					slides.item(i).style.height = 1080;
					
					var scale = 1;
					if(ew.indexOf("%") > -1) {
						scale = parseFloat(ew) / 100; 
					}
					if(ew.indexOf("px") > -1) {
						scale = 1080 * parseFloat(ew) / 1920; 
					}
					
					slides.item(i).style.left = ex;
					slides.item(i).style.top =ey;
					
					
					slides.item(i).style.transform = "scale("+scale+"), translate(50%, 50%)";
					slides.item(i).style.display = "block";
					slides.item(i).style.opacity = 1;
				}
			}
		}
	}
}

/** Hide embedded element **/
function embed_end() {
	if(embeded !== null) {
		embeded = null;
		if(iframe !== null) {
			iframe.parentNode.removeChild(iframe);
			iframe = null;
		}
	//	if(embedBackground !== null) {
	//		embedBackground.parentNode.removeChild(embedBackground);
	//		embedBackground = null;
	//	}
	}
}

/** Open a weblink (string), or go to a slide (number).
If a youtube video is specified, the video is embedded.
If the URL to a MP3 file is specified, the sound is played in background.**/
function go(url) {
	el = deCode(url);
	el = /^\d+$/.test(el) ? parseInt(el) : el; // To integer if a string with only digits
	if(isNaN(el)) {
		var done = false;
		el = String(el);
		
		// ------------- YouTube --------------
		if(el.indexOf("youtu.be/") > -1 && !done) { // Short YouTube form
			// Form: https://youtu.be/waGhUVlGYWM
			el = "https://www.youtube.com/embed/" + el.split("youtu.be/")[1];
		}
		if(el.indexOf(".youtube.com/") > -1 && !done) {
			el = stringToURL(el);
			// Convert YouTube URLs to Embed URLs if needed
			// EXPECTED: https://www.youtube.com/embed/waGhUVlGYWM
			// CONVERT: https://www.youtube.com/watch?v=waGhUVlGYWM
			if(el.indexOf("/watch?v=") > -1) {
				el = "https://www.youtube.com/embed/" + el.split("/watch?v=")[1];
			}
			embed(el);
			done = true;
		}
		if(el.toLowerCase() == "previous" && !done) {
			slide_previous();
			done = true;
		}
		if(el.toLowerCase() == "next" && !done) {
			slide_next();
			done = true;
		}
		if(!done) {
			var elr = el;
			if(elr.indexOf("?") > -1) elr = elr.split("?")[0];
			var ext = elr.substr(elr.lastIndexOf(".")).toLowerCase();
			switch(ext) {
				case ".mp4":
				case ".webm":
				case ".ogg":
					document.location = ROOT_URL + "/app/player/?" + elr;
					break;
				case ".mp3":
				case ".wav":
				case ".ogg":
					el = stringToURL(el);
					soundPlayStop(el);
					break;
				default:
					el = stringToURL(el);
					if(editor && el.indexOf(serverKey) == -1) {
						window.open(el, "_blank");
					} else {
						document.location = el;
					}
			}
		}
	} else {
		slide_goto(parseInt(el > 0 ? el - 1 : el));
	}
}

// ------------------------------- Audio

/** Play a sound. **/
function sound(source, volume, loop) {
	this.source = source;
	this.volume = volume;
	this.loop = loop;
	var son;
	this.son = son;
	this.finish = false;
	this.stop = function() {
		document.body.removeChild(this.son);
	}
	this.play=function() {
		if(this.finish) return false;
		this.son = document.createElement("embed");
		this.son.setAttribute("src",this.source);
		this.son.setAttribute("hidden","true");
		this.son.setAttribute("volume",this.volume);
		this.son.setAttribute("autostart","true");
		this.son.setAttribute("loop",this.loop);
		document.body.appendChild(this.son);
	}
	this.remove=function() {
		document.body.removeChild(this.son);
		this.finish=true;
	}
	this.init=function(volume,loop) {
		this.finish=false;
		this.volume=volume;
		this.loop=loop;
	}
}

var easySoundPlayer = null;
/** Start or stop playing a sound. **/
function soundPlayStop(source, volume, loop) {
	if(easySoundPlayer === null) {
		easySoundPlayer = new sound(source, volume, loop)
		easySoundPlayer.play();
	} else {
		easySoundPlayer.stop();
		easySoundPlayer = null;
	}
}
/** Stop all sounds being played. **/
function soundCloseAll() {
	if(easySoundPlayer !== null) {
		easySoundPlayer.stop();
		easySoundPlayer = null;
	}
}

// ------------------------------- align()

/** Returns true if the element A is inside the element B **/
function isInside(elementA, elementB) {
	var Ax = parseInt(elementA.style.left);
	var Ay = parseInt(elementA.style.top);
	var Aw = parseInt(elementA.style.width);
	var Ah = parseInt(elementA.style.height);
	var Bx = parseInt(elementB.style.left);
	var By = parseInt(elementB.style.top);
	var Bw = parseInt(elementB.style.width);
	var Bh = parseInt(elementB.style.height);
	return(Ax > Bx && Ay > By && Ax + Aw < Bx + Bw && Ah < By + Bh);
}

/** Align the two elements **/
function align(elementA, elementB) {
	var Aw = parseInt(elementA.style.width);
	var Ah = parseInt(elementA.style.height);
	var Bx = parseInt(elementB.style.left);
	var By = parseInt(elementB.style.top);
	var Bw = parseInt(elementB.style.width);
	var Bh = parseInt(elementB.style.height);
	
	elementA.style.transition = "all .3s";
	elementA.offsetHeight;	
	elementA.style.left = (Bx + Bw / 2 - Aw / 2) + "px";
	elementA.style.top = (By + Bh / 2 - Ah / 2) + "px";
	elementA.addEventListener("transitionend", function() { this.style.transition = "none"; }, false);
}

/** Save the position of all elements the user can move, can be restored with restorePosition().
This function is called when the slide is opened. **/
function savePositions() { 
	var all = document.querySelectorAll("[interaction=xy]");
	var count = all.length;
	for(var index = 0; index < count; index++) {
		all[index].originx = all[index].style.left;
		all[index].originy = all[index].style.top
	}
}

/** Restore the position of the current element (#). **/
function restorePosition() {
	o().style.transition = "all .3s";
	o().offsetHeight;
	o().style.left = o().originx;
	o().style.top = o().originy;
	o().addEventListener("transitionend", function() { this.style.transition = "none"; }, false);
}

/** Restore the position of all elements previously saved with savePositions(), or to the original position. **/
function restorePositions() {
	var all = document.querySelectorAll("[interaction=xy]");
	var count = all.length;
	for(var index = 0; index < count; index++) {
		all[index].style.left = all[index].originx;
		all[index].style.top = all[index].originy;
	}
}

// ------------------------------- String to URL

function stringToURL(url) {
	if(url.substr(0, 4) != "http") {
		url = "http://" + url;
	}
	return(url);
}

// --------------------------------- enCode and deCode (the code)

function enCode(tocode) {
	tocode = str_replace(tocode, "\"", "/#@1/");
	tocode = str_replace(tocode, "\n", "/#@2/");
	try {
		tocode = encodeURIComponent(tocode);
	} catch(err) { console.log("Error in enCode: " + tocode) }
	return(tocode);
}
function deCode(tocode) {
	try {
		tocode = decodeURIComponent(tocode);
	} catch(err) { 
		console.log("Error in deCode: " + err.message) 
	tocode = str_replace(tocode, "/#@2/", "\n");
	tocode = str_replace(tocode, "/#@1/", "\"");
		console.log(tocode) 
	}
	tocode = str_replace(tocode, "/#@2/", "\n");
	tocode = str_replace(tocode, "/#@1/", "\"");
	return(tocode);
}

function enCodeStyle(tocode) {
	tocode = str_replace(tocode, "\"", "");
	tocode = str_replace(tocode, "\n", ";");
	tocode = str_replace(tocode, ";;", ";");
	tocode = str_replace(tocode, "; ", ";");
	return(tocode);
}
function deCodeStyle(tocode) {
	tocode = str_replace(tocode, "; ", ";");
	tocode = str_replace(tocode, ";", ";\n");
	return(tocode);
}


// ------------------------------------------------------------------------------------

var objectNames = "";
var starting = true;

// Raise init events
function initializeSlideEvents() {
	if(playMode) {
		
		window.setTimeout(function() {
			animations = [];
			initializeRuntimeObjects();
			var inits = currentSlide.querySelectorAll("[ainit]");
			if(inits !== null) {

				var count = inits.length;
				for(var index = 0; index < count; index++) {
					latestInteractObject = inits[index];
					executeActionCode(inits[index], inits[index].id, "Init", preprocessor(inits[index].getAttribute("ainit")));
				}
			}
			var items = currentSlide.querySelectorAll("[atick]");
			tick_items = [];
			tick_count = 0;
			if(items !== null) {
				tick_count = items.length;
				for(var index = 0; index < tick_count; index++) {
					tick_items[index] = items[index];
					items[index].setAttribute("atick", preprocessor(items[index].getAttribute("atick")));
				}
			}		
			
			latestInteractObject = null;
			starting = false;
		}, 150);
	}
}

function initializeGlobalEvents() {
	if(DOMexists("GLOBAL_E") && DOM("GLOBAL_E").hasAttribute("ainit")) {
		executeActionCode(DOM("GLOBAL_E"), "GLOBAL_E", "Global Init", preprocessor(DOM("GLOBAL_E").getAttribute("ainit")));
	}
	tickCanTick = true;
}

function initializeRuntimeObjects() {	
	if(playMode) {
		
		// Scan all objects names (uid)
		
		objectNames = "";
		var uids = document.querySelectorAll("[uid]");
		if(uids !== null) {
			var count = uids.length;
			for(var index = 0; index < count; index++) {
				var uid = uids[index].getAttribute("uid");
				if(uid != "") {
					objectNames += (objectNames == "" ? "" : "*") + uid;
					try {
						eval( uid + " = uids[index]" );
					} catch(e) {
						console.log(e);
					}
				}
			}
		}
		objectNames = objectNames.split("*");
		
		var items = document.querySelectorAll("[runtimevisible]");
		if(items !== null) {
			var count = items.length;
			for(var index = 0; index < count; index++) {
				items[index].style.display = items[index].getAttribute("runtimevisible") == "false" ? "none" : "block";
			}
		}		
		// Scan events to preprocess
		var items = document.querySelectorAll("[amv]");
		if(items !== null) {
			var count = items.length;
			for(var index = 0; index < count; index++) {
				items[index].setAttribute("amv", preprocessor(items[index].getAttribute("amv")));
			}
		}
		var items = document.querySelectorAll("[aclk]");
		if(items !== null) {
			var count = items.length;
			for(var index = 0; index < count; index++) {
				items[index].setAttribute("aclk", preprocessor(items[index].getAttribute("aclk")));
			}
		}
		var items = document.querySelectorAll("[astart]");
		if(items !== null) {
			var count = items.length;
			for(var index = 0; index < count; index++) {
				items[index].setAttribute("astart", preprocessor(items[index].getAttribute("astart")));
			}
		}
		var items = document.querySelectorAll("[aend]");
		if(items !== null) {
			var count = items.length;
			for(var index = 0; index < count; index++) {
				items[index].setAttribute("aend", preprocessor(items[index].getAttribute("aend")));
			}
		}
		var items = document.querySelectorAll("[atick]");
		if(items !== null) {
			var count = items.length;
			for(var index = 0; index < count; index++) {
				items[index].setAttribute("atick", preprocessor(items[index].getAttribute("atick")));
			}
		}		
		savePositions();
	}
}
var tick_count = 0;
var tick_items = [];
var tickCanTick = false;
function globalTick() {
	setTimeout(globalTick, tickEventPulse);
	if(playMode && tickCanTick) {
		if(DOMexists("GLOBAL_E")) {
			executeActionCode(DOM("GLOBAL_E"), DOM("GLOBAL_E").id, "Global Tick", DOM("GLOBAL_E").getAttribute("atick"));
		}
		if(tick_count > 0) {
			for(var index = 0; index < tick_count; index++) {
				latestInteractObject = tick_items[index];
				executeActionCode(tick_items[index], tick_items[index].id, "Tick", tick_items[index].getAttribute("atick"));
			}
		}
	}
}
globalTick();

/** Returns the element under the current element.
This can help to determine if an element reached the target. **/
function hit() {
	var p = getPos(object());
	/*var x = int(object().style.left);
	var y = int(object().style.top);
	var w = int(object().style.width);
	var h = int(object().style.height);
	*/
	if(isNaN(p.h)) p.h = p.w;
//	object().style.display = "none";
	object().style.pointerEvents = "none";
	element = document.elementFromPoint( unscaleX(p.x + p.w / 2), unscaleY(p.y + p.h / 2) );
	object().style.pointerEvents = "all";
//	object().style.display = "block";
	if(element) {
		return(element.getAttribute("uid") === null ? element.parentNode : element);
	} else {
		return null;
	}
}

/** Return the integer value of a number.
Useful to convert a CSS value with px into a number. **/
function int(value) {
	return(parseInt(value)) 
}
/** Returns a CSS string with the value expressed in pixels **/
function px(value) {
	return(parseInt(value) + "px")
}

function preprocessor(line) {
	line = deCode(line);
/*	line = str_replace(line, "#..", "o().style.");
	line = str_replace(line, "#.", "o().");
	line = str_replace(line, "(#,", "(o(),");
	line = str_replace(line, "(#)", "(o())");
	line = str_replace(line, ", #)", ", o())");
	line = str_replace(line, ",#)", ",o())");
	for(var uid in objectNames) {
		line = str_replace(line, "#" + objectNames[uid] + "..", "o(\"" + objectNames[uid] + "\").style.");
		line = str_replace(line, "#" + objectNames[uid], "o(\"" + objectNames[uid] + "\")");
	} */
	return(line)
}

var executeAuthorObject = "";
var errorNeverRaised = true;
function executeActionCode(eventObject, objectName, eventName, code) {
	executeAuthorObject = eventObject;
	try {
		var thisFunction = function() { eval(code) };
		thisFunction.call( eventObject );
	} catch(e) {
		var oname = eventObject.getAttribute("uid");
		if(oname === null) oname = objectName;
		//var mline = exists(e.lineNumber) ? " line "+ e.lineNumber : "";
		//var msg = oname + " event " + eventName + mline + ": " + e.message;
		//console.log(msg);
		//raiseError(oname + " event " + eventName + mline, e.message);
		raiseError(e.message, "JS", e.fileName, docid, (authorid === "" ? userid : authorid), slide_index, oname, eventName, e.lineNumber);
	}
}



// ---------------------------------------------------------

var animations = [];
var animinit = false;
var anistampStart = 0;
var aniwebkit = "";


/** 
Apply an animation to an element, animation can be:
- animateAround
- animateAlive
Ex: animateStart(#, animateAlive, {path: 1, delay: 0, speed: 1});
**/
function animateStart(element, animation, args) {
	
	anistampStart = Date.now();
	
	var id = element.getAttribute("id");
	if(id == null || id == "") {
		id = "ANI_"+createId();
		element.setAttribute("id", id);
	}
	animations[id] = {
		element: element, 
		animation: animation, 
		args: exists(args) ? args : {}, 
		timepos: 0, 
		paused: false
	};
	if(!animinit) {
		aniwebkit = getVendorPrefix() === "webkit-";
		animaloop(0);
		animinit = true;
	}
	animation(null, animations[id].element, animations[id].args);
}

/** Set the animation pause mode. Switch between pause and unpause when the second parameter is not specified. **/
function animatePause(element, pauseMode) {
	var id = element.getAttribute("id");
	animations[id].paused = typeof pauseMode == "undefined" ? !animations[id].paused : pauseMode;
	if(animations[id].paused) animations[id].timeposStart = animationStamp - animations[id].timepos;
	if(!animations[id].paused) animations[id].timepos = animationStamp - animations[id].timeposStart;
}

/** Timestamp for the last rendering **/
var animationStamp = 0;
function animaloop(stamp) {
	animationStamp = stamp;
	
	for(id in animations) {
		if(!animations[id].paused) {
			animations[id].animation(stamp - animations[id].timepos, animations[id].element, animations[id].args)
		}
	}

	if(typeof requestAnimationFrame === "function") {
		requestAnimationFrame(animaloop);
	} else {
		setTimeout(function() {
			animaloop(Date.now() - anistampStart);
		}, 16.6);
	}
}
function animationsGenericInit(element, args) {
	var xywh = getPos(element);
	args.w = xywh.w;
	args.h = xywh.h;
	args.ox = xywh.x;
	args.oy = xywh.y;
	if(!exists(args.w)) args.w = parseInt(element.style.width);
	if(!exists(args.h)) args.h = parseInt(element.style.height);	
}

// ------------------------------------------ animateFloat ------------------------------------------

function animateFloat(stamp, element, args) {
	if(stamp === null) { // init
		args.speed = exists(args.speed) ? args.speed : 1;
		args.ampx = exists(args.ampx) ? args.ampx : 100;
		args.ampy = exists(args.ampy) ? args.ampy : 100;
		args.path = exists(args.path) ? args.path : 1;
		args.multx = 1; args.multy = 1;
		if(args.path === 1) { args.multx = .8; args.multy = 1.2; }
		if(args.path === 2) { args.multx = 1.2; args.multy = .8; }
		if(args.path === 3) { args.multx = 1.5; args.multy = .5; }
		if(args.path === 4) { args.multx = .5; args.multy = 1.5; }
		animationsGenericInit(element, args);
	} else {
		var thisP = animateFloatCalc(stamp, args);
		var prevP = animateFloatCalc(stamp - 50, args);
	
		element.style.left = (args.ox + ~~thisP.x) + "px";
		element.style.top = (args.oy + ~~thisP.y) + "px";
	}
}
function animateFloatCalc(stamp, args) {
	return( {
		x: (sin(stamp / 10 / 2 * args.speed * args.multx) * (args.ampx / 2) + args.ampx / 2),
		y: (cos(stamp / 10 / 3 * args.speed * -args.multy + 150) * (args.ampy / 2) + args.ampy / 2)
	})
}

// ------------------------------------------ animateAround ------------------------------------------

function animateAround(stamp, element, args) {
	if(stamp === null) { // init
		var xywh = getPos(element);
		args.w = xywh.w;
		args.h = xywh.h;

		args.radiusx = exists(args.radiusx) ? args.radiusx : slides_width;
		args.radiusy = exists(args.radiusy) ? args.radiusy : slides_height;
		args.centerx = exists(args.centerx) ? args.centerx : slides_width / 2;
		args.centery = exists(args.centery) ? args.centery : slides_height / 2;
		animationsGenericInit(element, args);
	} else {
		var thisP = animateAroundCalc(stamp, args);
		var prevP = animateAroundCalc(stamp - 50, args);
		
		element.style.left = ~~thisP.x + "px";
		element.style.top = ~~thisP.y + "px";
		
		var a = pointsToDirection(prevP, thisP)
		if(aniwebkit) {
			element.style.webkitTransform = "rotate(" + ( a - 270  ) + "deg)";
		} else {
			element.style.transform = "rotate(" + ( a - 270  ) + "deg)";
		}
	}
}
function animateAroundCalc(stamp, args) {
	return( {
		x: (sin(stamp / 20) * (args.radiusx) + args.centerx),
		y: (cos(stamp / 20) * (args.radiusy) + args.centery)
	})
}

// ------------------------------------------ animateAlive ------------------------------------------

var animateAlivePaths = [];
animateAlivePaths[0] = [ 14, 17, 2, 3, 4, 6 ];
animateAlivePaths[1] = [ 17, 14, 3, 2, 6, 4 ];
animateAlivePaths[2] = [ 10, 15, 4, 3, 5, 3 ];
animateAlivePaths[3] = [ 15, 12, 2, 4, 3, 5 ];
animateAlivePaths[4] = [ 18, 16, 5, 6, 7, 8 ];
animateAlivePaths[5] = [ 20, 19, 2, 8, 4, 5 ];

function animateAlive(stamp, element, args) {
	if(stamp === null) { // init
		args.speed = exists(args.speed) ? args.speed : 1;
		args.delay = exists(args.delay) ? args.delay : 0;
		args.path = exists(args.path) ? args.path : 0;
		animationsGenericInit(element, args);
	} else {
		var thisP = animateAliveCalc(stamp, args);
		var prevP = animateAliveCalc(stamp - 10, args);
		element.style.left = ~~thisP.x + "px";
		element.style.top = ~~thisP.y + "px";

		var a = pointsToDirection(prevP, thisP)
		if(aniwebkit) {
			element.style.webkitTransform = "rotate(" + ( a - 270  ) + "deg)";
		} else {
			element.style.transform = "rotate(" + ( a - 270  ) + "deg)";
		}
		return;
	}
}
function animateAliveCalc(stamp, args) {
	stamp =  args.speed * stamp / 2 - args.delay;
	return( {
		x: (sin(stamp / 10000 + stamp / animateAlivePaths[args.path][0]) * (slides_width /  animateAlivePaths[args.path][2] - args.w) + sin(stamp /  animateAlivePaths[args.path][4]) * ( args.w / 3) + slides_width / 2 - args.w / 2),
		y: (cos(stamp / 10000 + stamp / animateAlivePaths[args.path][1]) * (slides_height /  animateAlivePaths[args.path][3] - args.h) + cos(stamp /  animateAlivePaths[args.path][5] ) * ( args.h / 4) + slides_height / 2 - args.h / 2)
	})
}

// ---------------------------------------------

/** Returns the angle and degree between two points **/
function pointsToDirection(p1, p2) {
	return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
}

/*** Returns the CSS vendor prefix string, ex: webkit- ***/
function getVendorPrefix() {
	if(isAndroid) {
		return("webkit-");
	} else {
		var regex = /^(Moz|webkit|Khtml|O|ms|Icab)(?=[A-Z])/;
		var someScript = document.getElementsByTagName('script')[0];
		for(var prop in someScript.style) if(regex.test(prop)) return prop.match(regex)[0] + "-";
		return '';
	}
}

/** Get the text of an element (SVG or other) **/
function getText(element) {
	return(setText(element));
}

/** Set or get the text of an element (SVG or other) **/
function setText(element, value) {
	if(element.getAttribute("class") === "textElement") {
		if(typeof value == "undefined") {
			return(element.value);
		} else {
			element.innerHTML = value;
		}			
	} else {
		if(typeof value == "undefined") {
			return(element.getElementsByTagName('text')[0].textContent);
		} else {
			element.getElementsByTagName('text')[0].textContent = value;
		}
	}
}


/** Set the size of an element (SVG) **/
function setText(element, value) {
	if(element.getAttribute("class") === "textElement") {
		if(typeof value == "undefined") {
			return(element.innerHTML);
		} else {
			element.innerHTML = value;
		}			
	} else {
		if(typeof value == "undefined") {
			return(element.getElementsByTagName('text')[0].textContent);
		} else {
			element.getElementsByTagName('text')[0].textContent = value;
		}
	}
}

/** Set the size (in pixels) of the element **/
function setSize(element, w, h) {
	if(exists(w)) {
		element.style.width = w + "px";
		element.setAttribute("width", w);
	}
	if(exists(h)) {
		element.style.height = h + "px";
		element.setAttribute("height", h);
	}
}
/** Set the pos (in pixels) of the element **/
function setPos(element, x, y, w, h) {
	if(exists(x)) {
		element.style.left = x + "px";
	}
	if(exists(y)) {
		element.style.top = y + "px";
	}
	if(exists(w) || exists(h)) {
		setSize(element, w, h);
	}
}
/** Get the pos array (x, y, w, h) of the element **/
function getPos(element) {
	var w = int(element.style.width);
	var h = int(element.style.height);
	if(isNaN(h)) {
		var eid = element.getAttribute("id");
		if(eid !== null) {
			var type = eid.split("_")[0];
			if(type === "IMG") {		
				h = ~~(element.naturalHeight * w / element.naturalWidth);
				element.style.height = h + "px";
			}
		}
	}
	return( { 
		x: int(element.style.left), 
		y: int(element.style.top), 
		w: w, h: h
	});
}

function exists(element) {
	return(typeof element !== "undefined" && element !== null);
}

// depreciated
function createElement(tagId, tagName, defaultStyle) {
	createObject(tagId, tagName, defaultStyle);
}
/** Add an new generic DOM element to the current slide */
function createObject(tagId, tagName, defaultStyle) {

	tagId = typeof tagId == "undefined" ? "T_" + createId() : tagId;
	tagName = typeof tagName == "undefined" ? "div" : tagName;
	var element = document.createElement(tagName);
	element.setAttribute("class", "generic");
	element.setAttribute("id", tagId);
	element.setAttribute("movable", "true");
	element.setAttribute("selectable", "true");
	element.setAttribute("removable", "true");
	element.setAttribute("draggable", "false");
	if(exists(defaultStyle)) element.setAttribute("style", defaultStyle);
	currentSlide.appendChild(element);
	return(element);
}

/** Make a text area editable at runtime **/
function editable(element, value) {
	currentTextRelatedElement = element;
	
	currentTextEdited = document.createElement("textarea");
	currentTextEdited.setAttribute("DEFAULT_BEHAVIOR", "true");
	currentTextEdited.setAttribute("spellcheck", "false");

	currentTextEdited.id = element.id + "INFIELD";
	
	copyStyle(element, currentTextEdited);
	
	currentTextEdited.style.webkitUserSelect = "text";
	currentTextEdited.style.userSelect = "text";
	currentTextEdited.style.position = "absolute";
	currentTextEdited.style.outline = "0px solid transparent";
	currentTextEdited.style.zIndex = 10001;	
	

	var sourceText = element.innerHTML;
	sourceText = str_replace(sourceText, "&lt;", "<");
	sourceText = str_replace(sourceText, "&gt;", ">");
	sourceText = str_replace(sourceText, "&amp;", "&");
	sourceText = str_replace(sourceText, "&nbsp;", " ");
	currentTextEdited.value = str_replace(sourceText, "<br>", "\n");
	currentSlide.appendChild(currentTextEdited);
	element.style.visibility = "hidden";
	currentTextEdited.style.visibility = "visible";
	currentTextEdited.focus();
	return(currentTextEdited);
}

/** Copy computed style from an element to another **/
function copyStyle(sourceStyle, targetStyle) {
	targetStyle.style.zIndex = sourceStyle.style.zIndex;	
	targetStyle.style.position = sourceStyle.style.position;
	targetStyle.style.fontSize = sourceStyle.style.fontSize;
	targetStyle.style.fontFamily = sourceStyle.style.fontFamily;
	targetStyle.style.color = sourceStyle.style.color;
	targetStyle.style.textAlign = sourceStyle.style.textAlign;
	targetStyle.style.padding = sourceStyle.style.padding;
	targetStyle.style.margin = sourceStyle.style.margin;
	targetStyle.style.overflow = sourceStyle.style.overflow;
	targetStyle.style.border = sourceStyle.style.border;
	targetStyle.style.borderRadius = sourceStyle.style.borderRadius;
	targetStyle.style.background = sourceStyle.style.background;
	targetStyle.style.left = sourceStyle.style.left;
	targetStyle.style.top = sourceStyle.style.top;
	targetStyle.style.width = sourceStyle.style.width;
	targetStyle.style.height = sourceStyle.style.height;
	targetStyle.style.lineHeight = sourceStyle.style.lineHeight;
	targetStyle.style.border = sourceStyle.style.border;
}


/** Returns the number of words in a string **/
function wordsCount(str) {
	str = str.split("\n").join(" ").split(".").join(" ");
	while(str.indexOf("  ") > -1) str = str.split("  ").join(" ");
	return(str.split(" ").length); 
}


// ----------------------------------- zIndex for editable objects should be between 1 000 and 99 999
var zIndexBase = 1000;
var zIndexLimit = 99999;

function zOrder_findMinMax(localSlide) {
	localSlide = typeof localSlide === "undefined" ? currentSlide : localSlide;
	cleanup_zIndexes()
	var min = zIndexLimit;
	var max = 0;
	elements = localSlide.querySelectorAll('[removable="true"]');
	elementsCount = elements.length;
	for(var index = 0; index < elementsCount; index++) {
		var zIndex = parseInt(elements[index].style.zIndex);
		if(zIndex < zIndexBase) {
			zIndex = zIndexBase;
			elements[index].style.zIndex = String(zIndex);
		}
		if(zIndexLimit > zIndexLimit) {
			zIndex = zIndexLimit;
			elements[index].style.zIndex = String(zIndex);
		}
		min = min < zIndex ? min : ~~zIndex;
		max = max > zIndex ? max : ~~zIndex;
	}
	return({ min: min, max: max });
}

/** Send element to back **/
function zOrder_sendToBack( element ) {
	var zOrders = zOrder_findMinMax();
	if(zOrders.min <= zIndexBase) {
		var delta = zIndexBase - zOrders.min + 1;
		elements = currentSlide.querySelectorAll('[removable="true"]');
		elementsCount = elements.length;
		for(var index = 0; index < elementsCount; index++) {
			elements[index].style.zIndex = String(parseInt(elements[index].style.zIndex) + delta);
		}
	}
	element.style.zIndex = String(zIndexBase);
	if(typeof selection !== "undefined" && selection != null) {
		selector_refreshPos()
	}
}

/** Bring element to front **/
function zOrder_bringToFront( element ) {
	var zOrders = zOrder_findMinMax();
	element.style.zIndex = String(zOrders.max + 1);
	if(typeof selection !== "undefined" && selection != null) {
		selector_refreshPos()
	}
}

function cleanup_zIndexes() {	
	elements = currentSlide.querySelectorAll('[removable="true"]');
	elementsCount = elements.length;
	for(var index = 0; index < elementsCount; index++) {
		var z = parseInt(elements[index].style.zIndex);
		if(z < zIndexBase) elements[index].style.zIndex = String(zIndexBase);
		if(z > zIndexLimit) elements[index].style.zIndex = String(zIndexLimit);
	}
}

var autozoommem = [];
function autozoom(zoomobject) {
	zOrder_bringToFront(zoomobject);
	var p = getPos(zoomobject);
	if(typeof(autozoommem[zoomobject.id]) === "undefined" || autozoommem[zoomobject.id] === null) {
		autozoommem[zoomobject.id] = p;
		zoomobject.style.transition = "left .25s, top .25s, width .25s, height .25s";
		setTimeout(function() {
			if(p.w / p.h > 1920 / 1080) {
				var ratio = 1920 / p.w;
			} else {
				var ratio = 1080 / p.h;
			}
			var w = p.w * ratio; 
			var h = p.h * ratio; 
			
			if(typeof zoomobject.naturalWidth !== "undefined") {
				if(w > zoomobject.naturalWidth * 4 || h > zoomobject.naturalHeight * 4) {
					w = zoomobject.naturalWidth * 4;
					h = zoomobject.naturalHeight * 4;
				}
			}
			
			setPos(zoomobject, 1920 / 2 - w / 2, 1080 / 2 - h / 2, w, h);
		}, 25);
	} else {
		setPos(zoomobject, autozoommem[zoomobject.id].x, autozoommem[zoomobject.id].y, autozoommem[zoomobject.id].w, autozoommem[zoomobject.id].h);
		autozoommem[zoomobject.id] = null;
	}
}
