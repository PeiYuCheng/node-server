
var OSID = 9;
var OSdetect = [ "Windows",  "Macintosh", "iPhone", "iPod", "iPad", "Linux", "CrOS", "Android"];
for(var index in OSdetect) {
	if(navigator.appVersion.indexOf(OSdetect[index]) > -1) OSID = index;
}
if(OSID == 7 && navigator.userAgent.indexOf("Mobile Safari") == -1) OSID = 8;

/** Bool **/
var isAndroid = OSID == 7 || OSID == 8;
/** Bool **/
var isWindows = OSID == 0;
/** Bool **/
var isMac = OSID == 1;
/** Bool **/
var isIOS = OSID == 2 || OSID == 3 || OSID == 4;
/** Bool **/
var isChromeOS = OSID == 6;
/** Bool **/
var isLinux = OSID == 5;

var osArray = {
	0:"PC",
	1:"Mac",
	2:"iPhone",
	3:"iPod",
	4:"iPad",
	5:"Linux",
	6:"Chrome OS",
	7:"Android Phone",
	8:"Android Tablet",
	9:"Other"
}

/** Bool **/
var isFirefox = typeof InstallTrigger !== 'undefined';
/** Bool **/
var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
/** Bool **/
var isIE = /*@cc_on!@*/false || !!document.documentMode;
/** Bool **/
var isEdge = !isIE && !!window.StyleMedia;
/** Bool **/
var isChrome = (!!window.chrome && !!window.chrome.webstore) || (navigator.userAgent.indexOf("Chrome"));

var BRID = isIE ? 0 : isEdge ? 1 : isFirefox ? 2 : isSafari ? 3 : isChrome ? 4 : 5;

browserArray = {
	0:"Internet Explorer",
	1:"Microsoft Edge",
	2:"Firefox",
	3:"Safari",
	4:"Chrome",
	5:"Other"
}

/** Current device ID **/
var deviceid = memget("deviceid");
if(deviceid == null) {
	var c0 = 'O', c1 = 'O', c2, c3, c4;
	while(c0 == 'O' || c0 == 'I') c0 = String.fromCharCode(~~(Math.random() * 24) + 65);
	while(c1 == 'O' || c1 == 'I') c1 = String.fromCharCode(~~(Math.random() * 24) + 65);
	var c2 = String.fromCharCode(~~(Math.random() * 8) + 50);
	var c3 = String.fromCharCode(~~(Math.random() * 8) + 50);
	var c4 = String.fromCharCode(~~(Math.random() * 8) + 50);
	deviceid = "A" + c0 + c1 + c2 + c3 + c4 + OSID + BRID + "A";
	memset("deviceid", deviceid);
}

/** ID of the device remote controlling the other devices for the current account **/
var controllerid = userid == "" ? "" : memget("controllerid");
if(controllerid == null) controllerid = "";

/** bool - Set this value to true to disable remote controlled auto-redirects **/
var noRC = false;

function devices_init() {
	var H = "";
	var icon_close = '<svg version="1.1" style="width: 20px; height: 20px;" fill="#606060" width="640" height="640" viewBox="0 0 640 640"><path d="M342.627 336l276.686-276.687c6.249-6.248 6.249-16.379 0-22.627s-16.379-6.249-22.627 0l-276.686 276.687-276.687-276.686c-6.248-6.249-16.379-6.249-22.627 0s-6.249 16.379 0 22.627l276.687 276.686-276.686 276.687c-6.249 6.248-6.249 16.379 0 22.627 3.124 3.124 7.218 4.686 11.313 4.686s8.189-1.562 11.313-4.687l276.687-276.686 276.687 276.687c3.124 3.124 7.218 4.686 11.313 4.686s8.189-1.562 11.313-4.687c6.249-6.248 6.249-16.379 0-22.627l-276.686-276.686z"></path></svg>';

	H += "<div id='DEVICES_ZONE' style='display: none; position: absolute; background-color:#EFF2F6; width:100%; height:100%; z-index: 10000000; font-family:light; font-size: 28px; text-align: center;'>";
		H += "<div id='DIOKD' style='padding: 10px;  z-index: 10000001; text-align: right;' "+clickEventName+"='devices_hide()'>"+icon_close+"</div>";
		H += "<div style='padding-top: 0px;'>Control My Devices</div>";
		H += "<div style='padding-top: 20px; padding-left: 42px; font-size: 20px; font-family: regular; text-align: left;'>";
		H += getSwitchCode("CYD_SWITCH", "Remote Control", "cyd_press()", controllerid == deviceid);
		H += "</div>";
		
		H += "<div style='padding: 20px; font-size: 16px; font-family: regular;' id='DEVICES_AREA'></div>";
	H += "</div>";
	
	DOM("SESSION_PANEL").insertAdjacentHTML('beforeend', H);
}

function devices_show() {
	if(!DOMexists("DEVICES_ZONE")) {
		devices_init();
	}
	DOM("DEVICES_ZONE").style.display = "block";
	refreshDevicesArea();
}

function devices_hide() {
	DOM("DEVICES_ZONE").style.display = "none";
}

var cyd_press_inproc = false;
var cyd_controller = "";
function cyd_press() {
	if(!cyd_press_inproc) {
		
		DOM("DEVICES_AREA").innerHTML = "Applying...";
		
		cyd_press_inproc = true;
		if(getSwitchState("CYD_SWITCH")) { // To false
			cyd_controller = "";
		} else { // To true
			cyd_controller = deviceid;
		}
		setSwitchState("CYD_SWITCH", cyd_controller != "");
			
		query("setcontroller&did=" + cyd_controller + "&userid=" + userid, function(status, result) {
			if(status) {
				controllerid = cyd_controller;
				memset("controllerid", controllerid);
				refreshDevicesArea();
				remote_overlay_refresh();
			}
			setSwitchState("CYD_SWITCH", controllerid != "");
			refreshDevicesArea();
			cyd_press_inproc = false;
		});
	}
}

function refreshDevicesArea() {
	if(DOMexists("DEVICES_AREA")) {
		var H = "";
		if(controllerid == "") {
			H = "Remote control is disabled.";
			setSwitchState("CYD_SWITCH", false);
		} else {
			if(controllerid == deviceid) {
				H = "This device remote controls the navigation of all your devices running Ormiboard.";
				setSwitchState("CYD_SWITCH", true);
			} else {
				var fab = controllerid.split("");
				H = "This device is remote controlled<br>by one of your devices:<div style='font-family:bold; padding-top: 10px;'>" + osArray[parseInt(fab[6])] + " (" + browserArray[parseInt(fab[7])] + ")</div>";
				setSwitchState("CYD_SWITCH", false);
			}
		}
		DOM("DEVICES_AREA").innerHTML = H;
	}
}

function remoteControlled_action(data) {
	if(!noRC) {
		var ctx = data.split("~");
		
		if(!home && ctx[0] == "HOME") {
			document.location = ROOT_URL + "?instanceid=" + ctx[6];
		}
		
		if(ctx[0] == "READ") {
			var newDocIdArray = ctx[1].split("_");
			var newDocId =newDocIdArray[0];
			var newSlideIndex =newDocIdArray[1];
			var newAuthorId = ctx[2];
			if(newDocId != docid || newAuthorId != authorid) {
				var golink = "data/users/" + newAuthorId + "/boards/" + newDocId + "/board.html";
				serverFileExists(golink, function() {
					document.location = ROOT_URL + golink + "?slide=" + newSlideIndex + "&instanceid=" + ctx[6];
				});
			} else {
				if(getSlideIndex(currentSlide) != newSlideIndex) {
					slide_goto(newSlideIndex, false);
				}
			}
		}
		
		if(ctx[0] == "EDIT") {
			var thisdoc = ctx[1].split("_");
			if(thisdoc[0] !== "" && (thisdoc[0] !== docid || authorid !== ctx[5])) {
				document.location = ROOT_URL + "editor.html?id=" + thisdoc[0] + "&slide=" + thisdoc[1] + (ctx[5] == "" ? "" : "&owner=" + ctx[5]);
			}
		}
	}
}


function remoteControlDialog() {
	var fab = controllerid.split("");
	var deviceName = osArray[parseInt(fab[6])] + " " + browserArray[parseInt(fab[7])];
	if(controllerid === deviceid) {
		ask("Remote control", "This device remote controls your other devices. You can disable remote control, or continue with remote control enabled.", "Disable R-C", "Continue", remoteControlDialogAction, true);
	} else {
		ask("This device is remote controlled", "This device is remote controlled from "+deviceName+". You can disable remote control, or continue with remote control enabled.", "Disable R-C", "Continue", remoteControlDialogAction, true);
	}
}

function remoteControlDialogAction(choice) {
	if(choice === "A") {
		disableRemoteController();
	}
}

/** Disable remote control **/
function disableRemoteController(callback) {
	query("setcontroller&did=&userid=" + userid, function(status, result) { 
		if(status) {
			controllerid = "";
			memset("controllerid", controllerid);
			remote_overlay_refresh();
			refreshDevicesArea();
			if(typeof callback !== "undefined") {
				callback();
			}
		}
	});
}


//function RC(actionString) {
//	if(userid !== "" && controllerid === deviceid) {
//		query("setdevicedata&did=&userid=" + userid + "&did=" + deviceid + "&data=" +  actionString);
//	}
//}

