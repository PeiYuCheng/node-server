
// -------------------- Tell & Ask

var tellAskAutoClose = -1;

/** Display an information message, autoClose after 15s if not set **/
function tell(title, message, autoClose) {
	
	if(tellAskAutoClose === -1) {
		tellAskAutoClose = typeof autoClose === "undefined" ? 0 : (autoClose ? 15 : 0);

		tellAndAskInit();
		var H = "";
		H += "<div style='text-align: left; padding: 30px; font-family: bold; color: #F47F43;'>"+title+"</div>";
		H += "<div style='text-align: left; padding-left: 30px;'>"+message+"</div>";
		H += "<div id='TELL_ASK_BT' style='position: absolute; left: 150px; top: 230px; width: 300px; line-height:80px; height: 80px; color: #FFFFFF; background-color:#F47F43; text-align: center;'>Ok<span id='TELL_ASK_TIMER' style='font-family: light;'></span></div>";
		
		DOM("TELL_ASK_BOX").innerHTML = H;
		DOM("TELL_ASK_BT").setAttribute(clickEventName, "tell_ok_touch()");
		tellAndAskShow();
	}
}

function tellAskTick() {
	if(tellAskAutoClose > 0) {
		tellAskAutoClose--;
		if(tellAskAutoClose == 0) {
			tellAndAskHide();
			if(askCB !== "") {
				askCB("B"); // default button is B for ask
				askCB = "";
			}
			tellAskAutoClose = -1;
		}
		if(tellAskAutoClose < 10) {
			DOM("TELL_ASK_TIMER").innerHTML = " ("+tellAskAutoClose+"s)";
		}
	}
	setTimeout(function() { tellAskTick() }, 1000);
}

function tell_ok_touch() {
	DOM("TELL_ASK_BT").style.backgroundColor = "#D32B4F";
	setTimeout(function() {
		DOM("TELL_ASK_BT").style.backgroundColor = "#F47F43";
		setTimeout(function() {
			tellAndAskHide();
			tellAskAutoClose = -1;
		}, 50);
	}, 150);
}

var askCB = "";
var asking = false;
/** Ask a question with two possible responses, autoClose after 15s if not set **/
function ask(title, message, textButtonA, textButtonB, ask_callback, autoClose) {
	if(tellAskAutoClose === -1 ) {
		askCB = (typeof ask_callback == "undefined" ? "" : ask_callback);
		tellAskAutoClose = typeof autoClose === "undefined" ? 0 : (autoClose ? 15 : 0);
		
		tellAndAskInit();
		
		var H = "";
		H += "<div style='text-align: left; padding: 30px; font-family: bold; color: #F47F43;'>"+title+"</div>";
		H += "<div style='text-align: left; padding-left: 30px;'>"+message+"</div>";
		
		H += "<div id='TELL_ASK_BTA' style='position: absolute; left: 30px; top: 230px; width: 260px; line-height:80px; height: 80px; color: #FFFFFF; background-color:#AAAAAA; text-align: center;'>"+textButtonA+"</div>";
		H += "<div id='TELL_ASK_BTB' style='position: absolute; left: 310px; top: 230px; width: 260px; line-height:80px; height: 80px; color: #FFFFFF; background-color:#F47F43; text-align: center;'>"+textButtonB+"<span id='TELL_ASK_TIMER' style='font-family: light;'></span></div>";
		
		DOM("TELL_ASK_BOX").innerHTML = H;
		
		DOM("TELL_ASK_BTA").setAttribute(clickEventName, "ask_touch('A')");
		DOM("TELL_ASK_BTB").setAttribute(clickEventName, "ask_touch('B')");
		
		tellAndAskShow();
	}
}

function ask_touch(getv) {
	DOM("TELL_ASK_BT" + getv).style.backgroundColor = "#D32B4F";
	setTimeout(function() {
		DOM("TELL_ASK_BT" + getv).style.backgroundColor = "#F47F43";
		setTimeout(function() {
			//tellAskAutoClose = -1;
			tellAndAskHide();
			tellAskAutoClose = -1;
			if(askCB !== "") {
				askCB(getv);
				ascCB = "";
			}
		}, 50);
	}, 150);
}

function tellAndAskRefresh() {
	DOM("TELL_ASK_OVERLAY").style.display = "block";
	var scale = 1;
	if(scr.w < 600 || scr.h < 300) {
		var scalew = scr.w / 600;
		var scaleh = scr.h / 300;
		if(scalew < scaleh) {
			scale = scalew;
		} else {
			scale = scaleh;
		}
	}
	DOM("TELL_ASK_BOX").style.transform = "scale("+scale+")";
	DOM("TELL_ASK_BOX").style.webkitTransform = "scale("+scale+")";
}

function tellAndAskShow() {	
	asking = true;
	tellAndAskRefresh();
	DOM("TELL_ASK_BOX").style.display = "block";
	setTimeout(function() {
		DOM("TELL_ASK_OVERLAY").style.opacity = 1;
		DOM("TELL_ASK_BOX").style.top = "50%";
	}, 50);
}
function tellAndAskHide() {
	asking = false;
	DOM("TELL_ASK_OVERLAY").style.opacity = 0;
	DOM("TELL_ASK_BOX").style.top = "65%";
	setTimeout(function() {
		DOM("TELL_ASK_OVERLAY").style.display = "none";	
		DOM("TELL_ASK_BOX").style.display = "none";
	}, 750);
}
function tellAndAskInit() {
	if(!DOMexists("TELL_ASK_OVERLAY")) {
		var H = "";
		H += "<div id='TELL_ASK_OVERLAY' class='tellAskOverlay'>";
			H += "<div id='TELL_ASK_BOX' class='tellAskBox'>";
				//H += "</div>";
			H += "</div>";
		H += "</div>";
		document.body.insertAdjacentHTML("afterend", H);
		tellAskTick();
	}
}


// -------------------- Message

function message_init() {
	if(!DOMexists("MESSAGE")) {
		var H = "";
		H += "<div id='MESSAGE' class='message'>";
			H += "<div id='MESSAGE_inner' class='message_inner'>";
				H += "<div id='MESSAGE_sub' class='message_sub'></div>";
				H += "<div id='MESSAGE_main' class='message_main'></div>";
				H += "<div id='MESSAGE_bar' class='message_bar'>";
					H += "<div id='MESSAGE_bar_inner' class='message_bar_inner'>&nbsp;</div>";
				H += "</div>";
			H += "</div>";
		H += "</div>";
		document.body.insertAdjacentHTML("afterend", H);
	}
}

/** Displays a fullscreen message for maximum user attention **/
function message_start(infotext, infomore) {
	message_init();

	DOM("waitboxBg").style.marginTop = "-110px";
	message_update(infotext, infomore);
	DOM("MESSAGE_bar").style.height = "0px";

	DOM("MESSAGE").style.display = "table";
	DOM("MESSAGE").style.top = "0px";
	DOM("MESSAGE").style.opacity = 0;
	DOM("MESSAGE_bar_inner").offsetHeight; // Force change with no transition
	DOM("MESSAGE_bar_inner").setAttribute("class", "message_bar_inner");
	window.setTimeout(function() {
		DOM("MESSAGE").style.opacity = 1;
	}, 25);
}

/** Update the fullscreen message currently displayed **/
function message_update(infotext, infomore) {
	if(infotext) DOM("MESSAGE_main").innerHTML = infotext;
	DOM("MESSAGE_sub").innerHTML = infomore ? infomore : "";
	DOM("waitboxBg").style.marginTop = infomore ? "-130px" : "-110";
}

/** Hide the fullscreen message **/
function message_end() {
	if(DOMexists("MESSAGE")) {
		DOM("MESSAGE").style.opacity = 0;
		setTimeout(function() {
			message_end_transition();
		}, 1000);
		message_progress_hide();
	}
}

function message_end_transition() {
	DOM("MESSAGE").style.display = "none";
}

/** Show a progress bar in the fullscreen message **/
function message_progress(current, max) {
	DOM("waitboxBg").style.marginTop = "-130px";
	var position = ~~(current * 240 / max);
	DOM("MESSAGE_bar_inner").style.width = (position < 28 ? 28 : position) + "px";
	
	DOM("MESSAGE_bar").style.height = "28px";
	DOM("MESSAGE_bar").style.opacity = 1;
}

/** Hide the fullscreen message progress bar **/
function message_progress_hide() {
	DOM("MESSAGE_bar").style.height = "0px";
	DOM("MESSAGE_bar").style.opacity = 0;
}
