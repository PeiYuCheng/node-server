
var groupInputOkToJoin = false;
var shareDocumentAsCopy = false;
var sessionidPretender = "";

function groupInputFieldPress(e) {
	if (!e) e = window.event;

	if(e.keyCode === 27) {
		session_join_sid_btX()
		return;
	}	
	if(e.keyCode === 13) {
		session_join_sid_bt()
		return;
	}
	var value = DOM("GROUP_INPUT_FIELD").value;
	value = value.toUpperCase().substr(0, 5);
	var vlen = value.length;
	var valueOk = true;
	if(vlen > 0 && (value.charCodeAt(0) < 65 || value.charCodeAt(0) > 90))   valueOk = false;
	if(vlen > 1 && (value.charCodeAt(1) < 65 || value.charCodeAt(1) > 90) )  valueOk = false;
	if(vlen > 2 && (value.charCodeAt(2) < 48 || value.charCodeAt(2) > 57))   valueOk = false;
	if(vlen > 3 && (value.charCodeAt(3) < 48 || value.charCodeAt(3) > 57))   valueOk = false;
	if(vlen > 4 && (value.charCodeAt(4) < 65 || value.charCodeAt(4) > 90))   valueOk = false;
	value = str_replace(value, " ", "");
	groupInputOkToJoin = valueOk;
	if(DOM("GROUP_INPUT_FIELD").value != value) DOM("GROUP_INPUT_FIELD").value = value;
	sessionidPretender = value;
	
	DOM("GROUP_INPUT_FIELD").style.backgroundColor = valueOk ? "#FFFFFF" : "#FFA0A0";
}

var joiningSessionDialog = false;
function session_join_bt() {
	DOM("SESS_JOIN").style.backgroundColor = "#EAEAEA";
	setTimeout(function() {
		DOM("SESS_JOIN").style.backgroundColor = "#FFFFFF";
		joiningSessionDialog = true;
		refreshSessionPanel();
		setTimeout(function() {
			DOM("GROUP_INPUT_FIELD").focus();
		}, 50);
	}, 150);
}

function session_join_invalid() {
	DOM("GROUP_INPUT_FIELD").focus();
	DOM("GROUP_INPUT_FIELD").style.backgroundColor = "#FFA0A0";
	setTimeout(function() {
		DOM("GROUP_INPUT_FIELD").style.backgroundColor = "#FFFFFF";
	}, 1000);
}

function session_join_sid_bt() {
	DOM("SESS_JOIN_SID").style.backgroundColor = "#EAEAEA";
	setTimeout(function() {
		
		if(sessionidPretender == "") {
			session_join_invalid();
			DOM("SESS_JOIN_SID").style.backgroundColor = "#FFFFFF";
		} else {
			session_join(sessionidPretender, function() {
				if(DOM("SESS_JOIN_SID") !== null) {
					DOM("SESS_JOIN_SID").style.backgroundColor = "#FFFFFF";
				}
				if(sessionHost != "") {
					locallyClosedSession = "";
					sessionid = sessionidPretender;
					memset("sessionid", sessionid);
					joiningSessionDialog = false;
					//sessionEvent_join();
					refreshSessionPanel();
					session_panel_hide();
				} else {
					session_join_invalid();
				}
			});
		}
	}, 150);
}	
function session_join_sid_btX() {
	DOM("SESS_JOIN_SIDX").style.backgroundColor = "#EAEAEA";
	setTimeout(function() {
		DOM("SESS_JOIN_SIDX").style.backgroundColor = "#FFFFFF";
		joiningSessionDialog = false;
		refreshSessionPanel();
	}, 150);
}

function session_join(sid, callback) {
	sessionLiveData = "";
	memset("liveData", "");
	memset("liveHostName", "");
//	var http = new XMLHttpRequest();
//	http.onreadystatechange = function() {
//		if (http.readyState == XMLHttpRequest.DONE ) {
//			if(http.status == 200) {
//				if(http.responseText == "NOT_FOUND") {
//					sessionHost = "";
//					sessionHostName = "";
//				} else {
//					sessionLiveData = http.responseText;
//					sessionHost = sessionLiveData;
//				}
//			} else {
//				sessionHost = "";
//			}
//			callback();
//		}
//	}
//	http.open("GET", QUERY_URL + "?joinsession=" + sid + "&userid=" + userid + "&nocache=" + Date.now(), true);
//	http.send();

	query("joinsession=" + sid + "&userid=" + userid, function(status, result) {
		if(status) {
			if(result == "NOT_FOUND") {
				sessionHost = "";
				sessionHostName = "";
			} else {
				sessionLiveData = result;
				sessionHost = sessionLiveData;
			}
		} else {
			sessionHost = "";
			sessionHostName = "";
		}
		callback();
	});
}

