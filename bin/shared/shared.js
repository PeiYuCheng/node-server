
/** Parent frame ID if Ormiboard is running in an iframe **/
var childOf = (window.frameElement !== null && typeof window.frameElement !== "undefined" ? window.frameElement.id : "");
/** Set data to local persistent memory **/
function memset(mkey, mvalue) {
	localStorage.setItem((childOf == "" ? "" : childOf + "-") + mkey, mvalue);
}
/** Get data from local persistent memory **/
function memget(mkey) {
	return localStorage.getItem((childOf == "" ? "" : childOf + "-") + mkey);
}

//* Navigate to next slide if no script in the slide when user click **/
var autonav = true;

/** Ormiboard version **/
var version = 1.59 + (~~(Date.now() / 1000 / 60 / 60) * .000000001); // Hourly update
if(typeof loaded_script_counter == "undefined") var loaded_script_counter = 0;
var loadFileWhenReady = false;
var openSlideWhenReady = false;
/** Uses counter since first use **/
var runCounter = memget("runCounter");
runCounter = parseInt(runCounter == null ? 0 : runCounter)  + (home ? 1 : 0);
memset("runCounter", runCounter);

/** When the document was last published **/
var lastPublicationTimeStamp = 0;

/** Array containing all the users using this computer **/
var users = memget('users') != null && memget('users') != "" ? JSON.parse(memget('users')) : [];

/** Current user ID **/
var userid = memget("userid");
if(userid == null || userid == "null") userid = "";

/** Username **/
var username = memget("username");
if(username == null) username = "";

/** True if a document is in play / interactive mode **/
var playMode = false;
var clickEventName = (home ? "onclick" : "inputpress");

/** The server root URL **/
var ROOT_URL = (document.location.origin ? document.location.origin : window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port: '')) + '/';

/** The server key (domain) **/
var serverKey = String(document.location.hostname);

var hostsplit = serverKey.split("."); var hsip0 = parseInt(hostsplit[0]); var hsip1 = parseInt(hostsplit[1]);
/** True if Ormiboard is running on a local server **/
var localServer = (location.port !== "" || serverKey.replace(".local", "").indexOf(".") == -1 || hsip0 == 10 || (hsip0 == 172 && hsip1 >= 16 && hsip1 <= 31) || (hsip0 == 192 && hsip1 == 168));

var canGoogleSignIn = false;
if(!localServer) {
	var meta = document.createElement('meta');
	meta.setAttribute("name", "google-signin-client_id");            
	meta.setAttribute("content", "472698188618-4huh139rfed570bljt83t5cso575b68r.apps.googleusercontent.com");
	document.getElementsByTagName('head')[0].appendChild(meta);
	
	
	var googh = document.createElement('div');
	googh.innerHTML = "<div style='display:none;'><div class='g-signin2' id='GOOGLESN' data-onsuccess='onGoogleSignIn'></div></div>";
	document.body.appendChild(googh);
	
}

/** Contains the query string variables
Example: queryString.slide **/
var queryString = function () {
	var query_string = {};
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i=0;i<vars.length;i++) {
		var pair = vars[i].split("=");
		if (typeof query_string[pair[0]] === "undefined") {
			query_string[pair[0]] = decodeURIComponent(pair[1]);
		} else if (typeof query_string[pair[0]] === "string") {
			var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
			query_string[pair[0]] = arr;
		} else {
			query_string[pair[0]].push(decodeURIComponent(pair[1]));
		}
	} 
	return query_string;
}();

var openSlideWhenReady = typeof queryString.slide !== "undefined" ? parseInt(queryString.slide) : 0;

/** Author ID of the current document **/
var authorid = "";
var documenturl = String(document.location);
if(documenturl.indexOf("/editor.html?") == -1) {
	documenturl = documenturl.replace("://", "");	
	authorid = documenturl.split("/")[3];
}

var QUERY_URL = ROOT_URL + "bin/shared/query.php";
var FILE_SIZE_LIMIT = 500 * 1024;
/** Maximum size of a document **/
var TOTAL_FILE_SIZE_LIMIT = 20 * 1024 * 1024;

/** The document was saved at least one time, meaning it is available on the server. **/
var documentSavedOnce = false;
/** Age of the document on the server, or 0 if not available **/
var docServerStamp = 0; 
var autoReceiveStamp = 0;
var serverComBusy = false;

var PEN_MOUSE_ID = 999999;

document.body.oncontextmenu = 'return false;'

/** Max number of slides in a document **/
var slides_max = 50;
/** Current slide DOM element **/
var currentSlide = null;
/** Current slide index **/
var slide_index = 0;
/** Number of slides **/
var slides_count = 0;
/** Current scale of the slide to match with the app size **/
var slides_scale = 0;
/** Position of the slides in the app area **/
var slidesPos = {};
var slides_left = 0;
var slides_top = 0;
/** Unscaled slide with **/
var slides_width = 1920;
/** Unscaled slide height **/
var slides_height = 1080;
/** Default background for new slides **/
var defaultBackgroundColor = "#FFFFFF";
/** The eraser is currently active **/
var eraser_on = false;
/** The eraser is enabled **/
var eraser_enable = false;
/** Time in ms ellapsed since last user interaction **/
var lastUserInteraction = 0;
	
// Manage where to insert objects

/** Last element moved or added **/
//var lastPositionedObject = null; 
/** Position of the last element moved or added **/
//var lastPositionedObjectPos = null;
var insertionPointIndex = 0;
var inserstionPointDelta = 40;

var scrpt = new Array;
for(var i = 0; i < 10; i++) {
	scrpt[i] = document.createElement('script');
	scrpt[i].onload = function() { loaded_script_counter++ };
}
scrpt[0].src=ROOT_URL + 'bin/shared/sessions.js?' + version;
scrpt[1].src=ROOT_URL + 'bin/shared/sessions_lib.js?' + version;
scrpt[2].src=ROOT_URL + 'bin/shared/sessions_join.js?' + version;
scrpt[3].src=ROOT_URL + 'bin/shared/sessions_panel.js?' + version;
scrpt[4].src=ROOT_URL + 'bin/shared/sessions_participants.js?' + version;
scrpt[5].src=ROOT_URL + 'bin/shared/sessions_share.js?' + version;
scrpt[6].src=ROOT_URL + 'bin/shared/actions.js?' + version;
scrpt[7].src=ROOT_URL + 'bin/shared/server.js?' + version;
scrpt[8].src=ROOT_URL + 'bin/shared/devices.js?' + version;
if(!localServer) scrpt[9].src= 'https://apis.google.com/js/platform.js';
var att = document.createAttribute("async");
scrpt[9].setAttributeNode(att);
scrpt[9].setAttribute("defer", "");
var scriptMax = scrpt.length;
for(var i = 0; i < scriptMax; i++) document.head.appendChild(scrpt[i]);

/** Returns the position { x, y } where to insert a new element **/
function getInsertionPosition(element) {
	var thisPos = { x: insertionPointIndex * inserstionPointDelta, y: insertionPointIndex * inserstionPointDelta }
//	lastPositionedObject = element;
//	lastPositionedObjectPos = thisPos;
	insertionPointIndex++;
	if(insertionPointIndex * inserstionPointDelta + 40 > slides_height) {
		insertionPointIndex = 0;
	}
	return thisPos;
}
/** Switch between fullscreen and normal modes **/
function fullscreen(mode) {
	if(mode) {
		fullscreen_start();
	} else {
		fullscreen_end();
	}
}
/** Start fullscreen mode **/
function fullscreen_start() {
	var elem = document.body;
	if (elem.requestFullscreen) {
		elem.requestFullscreen();
	} else if (elem.msRequestFullscreen) {
		elem.msRequestFullscreen();
	} else if (elem.mozRequestFullScreen) {
		elem.mozRequestFullScreen();
	} else if (elem.webkitRequestFullscreen) {
		elem.webkitRequestFullscreen();
	}
}
/** Emds fullscreen mode **/
function fullscreen_end() {
	if (document.exitFullscreen) {
		document.exitFullscreen();
	} else if (document.msExitFullscreen) {
		document.msExitFullscreen();
	} else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	} else if (document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
	}	
}

// ------------------------------------------------------------------------------------

/** Set a new color for the slide background **/
function applyBackgroundColor(newColor)	{
	if(editor) {
	/*	if(DOMC("icon icon-check bgcolor") !== null) {
			DOMC("icon icon-check bgcolor").className = ""; 
		}
		for(var index = 0; index <= 6; index++) {
			var element = DOM("dot_BGCOLOR_" + index)
			if(element.style.backgroundColor == newColor) {
				element.children[0].className = "icon icon-check bgcolor";
				element.children[0].style.color = get_visible_color(newColor);
			}
		}*/
	}
	currentSlide.style.backgroundImage = "none";
	currentSlide.style.backgroundColor = newColor;
	
	var c = colorToArray(currentSlide.style.backgroundColor);
	document.body.style.backgroundColor = "rgb(" + ~~(parseInt(c.r) * .8) + "," + ~~(parseInt(c.g) * .8) + "," + ~~(parseInt(c.b) * .8) + ")";
	if(DOMexists("ROOT")) {
		DOM("ROOT").style.backgroundColor = document.body.style.backgroundColor;
	}
}

/** Switch UI element: get the state **/
function getSwitchState(id) {
	return(DOM(id + "_SWITCH").className == "switch_on");
}
/** Switch UI element: get HTML code **/
function getSwitchCode(id, label, inputpress, val) {
	var H = "";
	H += "<table id='"+id+"_SWITCH_CONTAINER' "+clickEventName+"=\""+inputpress+"\" cellspacing=0 cellpadding=0 "+(val ? "switch_text_on" : "switch_text_off")+" style='pointer-events: all; '>";
		H += "<tr><td "+clickEventName+"=\""+inputpress+"\">";
			H += "<div class='"+(val ? "switch_on" : "switch_off")+"' id='"+id+"_SWITCH' "+clickEventName+"=\""+inputpress+"\">";
				H += "<div class='"+(val ? "switch_inner_on" : "switch_inner_off")+"' id='"+id+"_SWITCH_INNER' "+clickEventName+"=\""+inputpress+"\">&nbsp;</div>";
			H += "</div>";
		H += "</td><td "+clickEventName+"=\""+inputpress+"\">";
			H += "<span "+clickEventName+"=\""+inputpress+"\" id='"+id+"_ACTION_INTERACTION' style='padding-top: 5px; cursor:default; padding-left:10px; height:20px; line-height:20px;'>" + label + "</span>";
		H += "</td>";
		H += "</tr>";
	H += "</table>";
	return(H);
}
/** Switch UI element: set the state **/
function setSwitchState(id, val) {
	if(DOM(id + "_SWITCH") != null) {
		DOM(id + "_SWITCH").className = (val ? "switch_on" : "switch_off");
		DOM(id + "_SWITCH_INNER").className = (val ? "switch_inner_on" : "switch_inner_off");
		DOM(id + "_SWITCH_CONTAINER").className = (val ? "switch_text_on" : "switch_text_off");
	}
}

// ----------------------- GENERIC --------------------------------

/** Returns true if the element with the specified id exists **/
function DOMexists(id) {
	return(document.getElementById(id) !== null);
}
/** Returns element with the specified id exists **/
function DOM(id, returnAll) {
	if(id[0] == ".") {
		return(returnAll === true ? document.getElementsByClassName(id.substr(1)) : document.getElementsByClassName(id.substr(1))[0]);
	} else {
		return(document.getElementById(id));
	}
}

/** Distance between two coordinates {x, y}  **/
function getDistance( a, b ) {
	var xs = b.x - a.x, ys = b.y - a.y;
	return Math.sqrt( xs * xs + ys * ys );
}

/** Create a unique id, based on the system timestamp, plus incremental value **/
var lastCreatedId = "";
function createId() {
	var id = Date.now();
	if(id <= lastCreatedId) id = lastCreatedId + 1;
	lastCreatedId = id;
	return(id);
}

/** Returns the elements with the specified class name **/
function DOMC(eH, returnAll) {
	var col = document.getElementsByClassName(eH);
	return(returnAll === true ? (col.length > 0 ? col : null) : (col.length > 0 ? col[0] : null));
}

/** Returns the elements with the specified name **/
function DOMN(eH, returnAll) { // scan result with ...item(index)
	var col = document.getElementsByName(eH);
	return(returnAll === true ? (col.length > 0 ? col : null) : (col.length > 0 ? col[0] : null));
}

/** Raise an event **/
function fireEvent(el, etype) {
	if (el.fireEvent) {
		el.fireEvent('on' + etype);
	} else {
		var evObj = document.createEvent('MouseEvent');
		evObj.initEvent(etype, true, false);
		el.dispatchEvent(evObj);
	}
}

/** Set the position of an element async **/
function DOM_posAsync(e, x, y, w, h, f) {
	setTimeout("DOM_pos(DOM('"+e.id+"'), "+x+","+y+","+w+","+h+","+f+")");
}

/** Set the position of an element  **/
function DOM_pos(e, x, y, w, h, f) {	
	if(typeof e == "string") e = document.getElementById(e);
	if(typeof x != "undefined" && x !== null) e.style.left = x + "px";
	if(typeof y != "undefined" && y !== null) e.style.top = y + "px";
	if(typeof w != "undefined" && w !== null) e.style.width = w + "px";
	if(typeof h != "undefined" && h !== null) e.style.height = h + "px";
	if(typeof f != "undefined" && f !== null) e.style.fontSize = f + "px";
}

/** Select the content of the specified element  **/
function DOM_selectAll(containerid) {
        if (document.selection) {
		var range = document.body.createTextRange();
		range.moveToElementText(document.getElementById(containerid));
		range.select();
        } else if (window.getSelection) {
		var range = document.createRange();
		range.selectNode(document.getElementById(containerid));
		window.getSelection().addRange(range);
        }
}

/** Sinus for an angle in degree **/
function sin(angle) {
	return Math.sin(angle * (Math.PI / 180));
}
/** Cosinus for an angle in degree **/
function cos(angle) {
	return  Math.cos(angle * (Math.PI / 180));
}
/** Random number **/
function rnd(min, max) {
	return parseInt(Math.random() * (max - min) + min);
}


// ----------------------------------------- COLORS ----------------------------------------------------

/** Returns #000000 or #FFFFFF for maximum contrast with the specified color **/ 
function get_visible_color(RGB) {
	RGB = RGB.substr(4, RGB.indexOf(")") - 4).split(",");
	var lumix = (0.299 * RGB[0] + 0.587 * RGB[1] + 0.114 * RGB[2]);
	return ( lumix > 200 ? "#000000" : "#FFFFFF");
}

// ----------------------------------------- SVG ----------------------------------------------------

/** Returns an SVG path tag **/
function svg_path(SVG, color, strokeWidth, strokeDashArray, transform, fillColor) {
	var dashArray = (typeof strokeDashArray != "undefined" ? ' stroke-dasharray="' +strokeDashArray+ '" ' : "");
	var fillString = (typeof fillColor == 'undefined' ? 'fill="none"' : 'fill="'+ fillColor +'"');
	transform = typeof transform == 'undefined' ? '' : 'transform="'+transform+'"';
	return('<path '+ transform +' '+ fillString +' stroke="' + color + '"'+dashArray+ ' stroke-linecap="round" stroke-width="' + strokeWidth + '" d=\"' + SVG + '\"></path>');
}
/** Returns an SVG tag **/
function svg_svg(SVG, width, height) {	
	return("<svg draggable='false' style='pointer-events: none; -moz-user-select: none;'  viewbox = '0 0 "+ width+" "+ height +"'>" + SVG + "</svg>");
}

// ------------------------ COLORS --------------------

/** Returns {r,g,b} from any color **/
function colorToArray(color) {
	if(color.indexOf('rgb(') == -1) {
		return hexToRGB(color);
	} else {
		var ar = color.split("(")[1].split(")")[0].split(",");
		return { r:parseInt(ar[0]), g:parseInt(ar[1]), b:parseInt(ar[2])};
	}
}
hexToRGBString = function(hex){
	if(hex.substr(0, 4) == 'rgb(') return(hex); // already rgb...
	var rgb = hexToRGB(hex);
	return("rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")");
}
hexToRGB = function(hex){
	if(hex[0] == '#') hex = hex.substr(1);
	hex = parseInt(hex, 16);
	var r = hex >> 16;
	var g = hex >> 8 & 0xFF;
	var b = hex & 0xFF;
	return {r:r,g:g,b:b};
}
/** RGB color to HEX color **/
RGBToHex = function(r,g,b){
	var bin = r << 16 | g << 8 | b;
	return (function(h){
		return new Array(7-h.length).join("0")+h
	})(bin.toString(16).toUpperCase());
}

/** Replaces a string with another **/
function str_replace(strsrc, strold, strnew) {return((strsrc + "").split(strold).join(strnew))}

// --- checksum ---

/** Returns the checksum of a string **/
function checksum(s) {
	var chk = 0x12345678;
	for (var i = 0; i < s.length; i++) {
		chk += (s.charCodeAt(i) * (i + 1));
	}
	return chk;
}

function waitbox_start() {
	DOM("waitboxBg").style.display = "block"; 
	window.setTimeout(function() {
		DOM("waitboxBg").style.opacity = 1;
		DOM("waitboxBg").style.marginTop = "-110px";
	}, 25);
}

function waitbox_end() {
	setTimeout(function() {
		waitbox_end_transition();
	}, 700);
	DOM("waitboxBg").style.opacity = 0;
	DOM("waitboxBg").style.marginTop = "-300px";
}

function waitbox_end_transition() {
	DOM("waitboxBg").style.display = "none";
}

function query(sQueryString, sQueryCallback, sQueryTimeout) {

//console.log("query >>>> " + sQueryString)
	var http = new XMLHttpRequest();
	http.onreadystatechange = function() {
		if (http.readyState == XMLHttpRequest.DONE) {
//console.log("<<<<<<<< " + http.responseText)
			if(typeof sQueryCallback !== "undefined") {
				sQueryCallback(http.status == 200, http.responseText);
			}
		}
	}
	http.open("GET", QUERY_URL + "?" + sQueryString + "&nocache=" + Date.now(), true);
	http.setRequestHeader("Cache-Control", "no-cache");
	http.timeout = (typeof sQueryTimeout === "undefined" ? 10000 : sQueryTimeout);
	http.send();
}

window.onerror = function(msg, srcFile, line, col, error) {
//	raiseError(source + " line " + line, message);
	raiseError(msg, "JS", srcFile, docid, authorid, slide_index, "", "", line);
}

/** Report an error to the tracking system **/
function err(msg, sourceFile, cObjName) {
	raiseError(msg, "JS", "", home? "HOME" : docid, home ? userid : authorid, home ? "" : slide_index, cObjName, sourceFile, "");
}
function raiseError(msg, scriptLg, srcFile, cDocId, cAuthorId, cSlideIndex, cObjName, cEventName, lineNbr) {
	var args = msg + "~*~" + scriptLg + "~*~" + srcFile + "~*~" + cDocId + "~*~" + cAuthorId + "~*~" + cSlideIndex + "~*~" + cObjName + "~*~" + cEventName + "~*~" + lineNbr + "~*~";
	var errdata = "~*~" + userid + "~*~" + sessionid + "~*~" + deviceid + "~*~"+ osArray[OSID]+"~*~"+ browserArray[BRID] +"~*~" + controllerid + "~*~" + playMode + "~*~" + childOf + "~*~" + args + "~@@~";
	console.log("ERROR: " + errdata);
	query("errlog=" + errdata, function(status, result) { console.log("Reporting response: "+result)} );
}
