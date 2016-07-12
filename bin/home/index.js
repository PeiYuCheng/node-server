
var thisURL = String(document.location);
if(thisURL.indexOf("/www.") > -1) {
	location.replace = thisURL.replace("/www.", "/");
}

var local_ready = false;

var masterSlideWidth = 320;
var masterSlideHeight = 180;
var masterSlideWidth = 390;
var masterSlideHeight = 219;
var slideWidth = masterSlideWidth;
var slideHeight = masterSlideHeight;
var slideRatio = slideWidth / slideHeight;
var server_userList = "";

var localSlides = [];
var hideMenubarAt = false;

var slidesLoadingList = [];
var slidesLoadIndex = 0;

var featuredLoadMax = 0;
var featuredLoadIndex = 0;

var userLoadIndex = 0;
var userLoadMax = 0;

document.addEventListener("keydown", function (event) { lastUserInteraction = Date.now(); });
document.addEventListener("mousemove", function (event) { lastUserInteraction = Date.now(); });

var menuIcon = '<svg style="width: 20px; height: 20px; " fill="#9EAABB" version="1.1" width="512" height="512" viewBox="0 0 512 512"><path d="M192 96c0-35.346 28.654-64 64-64s64 28.654 64 64c0 35.346-28.654 64-64 64s-64-28.654-64-64zM192 256c0-35.346 28.654-64 64-64s64 28.654 64 64c0 35.346-28.654 64-64 64s-64-28.654-64-64zM192 416c0-35.346 28.654-64 64-64s64 28.654 64 64c0 35.346-28.654 64-64 64s-64-28.654-64-64z"></path></svg>';

function previewMenu(mkey, mindex, actionClick, ptitle) {
	if(ptitle === "") {
		return("<div id='MNU_"+mkey+mindex+"' class='previewMenu' "+actionClick+">" + menuIcon + "</div>");
	} else {
		H = "";
		H += "<table id='MNU_"+mkey+mindex+"' "+actionClick+" style='padding-top: 5px; height: 40px; width: 100%;' cellspacing=0 cellpadding=0>";
		H += "<tr>";
		H += "<td  name='shared_title' style='color: #606B7E; line-height: 20px; width: 0px; font-size: 20px; padding-left: 10px; padding-top: 5px; white-space: nowrap; text-overflow: ellipsis;display: block; overflow: hidden;'>" + ptitle + "</td>";
		H += "<td style='text-align: right'>" + menuIcon + "</td>";
		H += "</tr>";
		H += "</table>";
		return(H);
	}
}



// ---------------------------------- LOGIN -----------------------

//var lastChangeValue = localStorage.getItem("lastUpdateStamp");
var lastChangeValue = memget("lastUpdateStamp");
function scanForChanges() { // Changes saved from the editor?
	//var newChangeValue = localStorage.getItem("lastUpdateStamp");
	var newChangeValue = memget("lastUpdateStamp");
	if(lastChangeValue !== newChangeValue) {
		lastChangeValue = newChangeValue;
		server_loadSlidesList();
	}
	setTimeout(function() { scanForChanges(); }, 1000);
}

function list_render() {
	scr = {
		w: document.documentElement.clientWidth,
		h: document.documentElement.clientHeight
	}
	var H = "";

	resize();

	slidesLoadMax = slidesLoadIndex;
	slidesLoadIndex = 0;
	loadNextSlidePreview();

	DOM("PREVIEW_CONTAINER").style.display = "block";
	DOM("PREVIEW_CONTAINER").style.opacity = 1;
}


// -------------------------------------Actions -------------------------

var last_key = "";
var last_uid = "";
var last_ownerId = "";
var last_filename = "";

function newFile() {
	DOM("BT_CREATE").style.backgroundColor = "#F37F43";
	setTimeout(function() {
		document.location = "editor.html?id=" + createId();
		setTimeout(function() {
			DOM("FILE_ADD").style.backgroundColor = "#D32B4F";
		}, 150);
	}, 100);
}

function slide_clone(element) {
	element.style.backgroundColor = "rgb(220, 220, 220)"; 
	setTimeout(function() {
		setTimeout(function() { element.style.backgroundColor = "transparent"; }, 50);
		
		if(last_uid != "") {
			var newId = createId();
			document.location = "editor.html?id="+newId+"&template=" + last_uid + "&owner=" + last_ownerId;
		}
	}, 150);
}

function slide_open(element) {
	element.style.backgroundColor = "rgb(220, 220, 220)"; 
	setTimeout(function() {
		setTimeout(function() { element.style.backgroundColor = "transparent"; }, 50);
		if(last_uid != "") {
			document.location = last_filename;
		}
	}, 150);
}

function slide_edit(element) {
	element.style.backgroundColor = "rgb(220, 220, 220)"; 
	setTimeout(function() {
		setTimeout(function() { element.style.backgroundColor = "transparent"; }, 50);
		if(last_uid != "") {
			document.location = "editor.html?id=" + last_uid;
		}
	}, 150);
}

function slide_delete(element) {
	element.style.backgroundColor = "rgb(220, 220, 220)"; 
	setTimeout(function() {
		element.style.backgroundColor = "transparent";
	}, 1000);
	setTimeout(function() {
		if(last_uid != "") {
			hideMenubar();
			hideMenubarAt = Date.now() + 5000;
			var id = last_key + "_" + last_uid;
			var pos = DOM(id).getBoundingClientRect();
			var body = document.body
			var docElem = document.documentElement;
			var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
			var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
			var clientTop = docElem.clientTop || body.clientTop || 0;
			var clientLeft = docElem.clientLeft || body.clientLeft || 0;
			DOM("MENU_DELETE").style.left = (pos.left + scrollLeft - clientLeft) + "px";
			DOM("MENU_DELETE").style.top = (pos.top + pos.height +  scrollTop - clientTop - parseInt(DOM("MENU_DELETE").style.height)) + "px";
			DOM("MENU_DELETE").style.width = pos.width + "px";
			DOM("MENU_DELETE").style.display = "block";			
		}
	}, 100);
}

function deleteNow(element) {
	element.style.backgroundColor = "rgba(0, 0, 0, .2)"; 
	setTimeout(function() {
		setTimeout(function() { element.style.backgroundColor = "transparent"; }, 50);
		//DOM("MENU_DELETE").style.display = "none";
		hideMenubar();
	}, 250);
	setTimeout(function() {
		server_delete(last_uid);
	}, 100);
}

function server_delete(docid) {
	query("delete=" + docid + "&authorid="+userid, function(status, result) {
		server_loadSlidesList();
	});
	/*	var http = new XMLHttpRequest();
	http.onreadystatechange = function() {
		if (http.readyState == XMLHttpRequest.DONE ) {
			server_loadSlidesList();
		}
	}
	http.open("GET", QUERY_URL + "?delete=" + docid + "&authorid="+userid+"&nocache=" + Date.now(), true);
	http.send();	 */
}

function hideCancelbar(element) {
	element.style.backgroundColor = "rgba(0,0,0,.6)"; 
	setTimeout(function() {
		element.style.backgroundColor = "transparent"; 
		DOM("MENU_DELETE").style.display = "none";
	}, 250);
}

var currentMenuKey = "";
function slide_click(index, key, uid, ownerId, filename) {
	if(DOM("MENU").style.display == "block" && index == lastMenuIndex) {
		hideMenubar();
	} else {
		lastMenuIndex = index;
		currentMenuKey = "MNU_" + key + index;
		DOM("MNU_" + key + index).childNodes[0].setAttribute("fill", "#E47876");
		DOM("MENU_DELETE").style.display = "none";
		
		last_key = key;
		last_uid = uid;
		last_ownerId = ownerId;
		last_filename = filename;
		var id = key + "_" + uid;
		var pos = DOM(id).getBoundingClientRect();
		var body = document.body
		var docElem = document.documentElement;
		var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
		var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
		var clientTop = docElem.clientTop || body.clientTop || 0;
		var clientLeft = docElem.clientLeft || body.clientLeft || 0;

		DOM('MENU_COPY').style.display = (userid == "" ? "none" : "block");
		DOM('MENU_EDIT').style.display = (userid == "" || key == "F" ? "none" : "block");
		DOM('MENU_DEL').style.display = (userid == "" || key == "F" ? "none" : "block");
		
		var itemsCount = userid == "" ? 1 : key == "F" ? 2 : 4;

		hideMenubarAt = Date.now() + 4000;
		
		var height = (itemsCount * 40) ;
		DOM("MENU").style.width = "200px";
		DOM("MENU").style.height = height + "px";
		DOM("MENU_SUB").style.width = "200px";
		DOM("MENU_SUB").style.height = height + "px";
		DOM("MENU").style.left = (pos.left + scrollLeft - clientLeft + pos.width - parseInt(DOM("MENU").style.width)) + "px";
		DOM("MENU").style.top = (pos.top + pos.height +  scrollTop - clientTop - parseInt(DOM("MENU").style.height)) + "px";
		
		if(DOM("MENU").style.display == "none") {
			DOM("MENU").style.display = "block";
			DOM("MENU_SUB").style.top = height + "px";
			DOM("MENU_SUB").style.webkitTransition  = "all .25s";
			window.setTimeout(function() {
				DOM("MENU_SUB").style.top = "0px";
			},100)
		}
	}
}

function hideMenubar(animate) {
	animate = typeof animate == "undefined" ? true : animate;
	DOM("MENU_SUB").style.top = DOM("MENU_SUB").style.height;
	if(currentMenuKey != "") {
		DOM(currentMenuKey).childNodes[0].setAttribute("fill", "#7E8A9B");
		currentMenuKey = "";
	}
	DOM("MENU_DELETE").style.display = "none";
	window.setTimeout(function() {
		DOM("MENU").style.display = "none";
	}, animate ? 300 : 0);
}
