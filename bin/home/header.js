

// ----------------------------- Header info -------------------------

sessionidPretender = "";
var currentInputToJoin = false;

function refreshGroupDisplay() {
	grid_init();
	if(pingOnceOk || userid == "") {
		DOM("ACTIVE_SESSION").innerHTML = sessionid == null ? "" : sessionid;
		DOM("ACTIVE_HOST").innerHTML = sessionHostName == "" ? "" : "This session is supervised by <span  style='font-family: regular;'>"+sessionHostName+"</span>.";

		DOM("GROUP_CREATE_OR_JOIN").style.display = "none";
			
		DOM("GROUP_QUIT").style.display = "none";
		DOM("GROUP_HOST").style.display = "none";
		DOM("GROUP_ACTIVE").style.display = "none";
		DOM("GROUP_LOGIN").style.display = "none";
		
		DOM("PREVIEW_CONTAINER").style.display = "block";
		DOM("PREVIEW_CONTAINER").style.opacity = 1;
		//DOM("FOOTER").style.display = "block";
		
		if(DOMexists("GCLASSROOM")) {
			DOM("GCLASSROOM").style.display = isSessionManager ? "block" : "none";
		}

		
		if(userid == "") {
			DOM("GROUP_LOGIN").style.display = "block";
			//DOM("TITLE_LOCAL").style.display = "none";
			//DOM("FILES_LOCAL").style.display = "none";
		} else {
			//DOM("TITLE_LOCAL").style.display = "block";
			//DOM("FILES_LOCAL").style.display = "block";
			if(!currentInputToJoin) {
				if(sessionid == "" || sessionid == null) {
					DOM("GROUP_CREATE_OR_JOIN").style.display = "block";
				} else {
					if(isSessionManager) {
						
						DOM("HOSTED_SESSION").innerHTML = sessionid;			
						DOM("GROUP_HOST").style.display = "block";			
					} else {
						DOM("GROUP_ACTIVE").style.display = "block";
						DOM("GROUP_QUIT").style.display = "block";
					}
				}
			}
		}
	}
}


function session_signin_button() {
	DOM("GROUP_SIGNIN").style.backgroundColor = "rgba(255,255,255,.5)";
	setTimeout(function() { 
		DOM("GROUP_SIGNIN").style.backgroundColor = "rgba(255,255,255,.25)";
		session_panel_show();
	}, 150);
}
function session_join_button() {
	DOM("GROUP_JOIN").style.backgroundColor = "rgba(255,255,255,.5)";
	setTimeout(function() { 
		DOM("GROUP_JOIN").style.backgroundColor = "rgba(255,255,255,.25)";
		session_panel_show();
	}, 150);
}
function session_quit_button() {
	DOM("GROUP_QUIT").style.backgroundColor = "rgba(255,255,255,.5)";
	DOM("ACTIVE_SESSION").innerHTML = "";
	DOM("ACTIVE_HOST").innerHTML = "";
	setTimeout(function() { 
		DOM("GROUP_QUIT").style.backgroundColor = "rgba(255,255,255,.25)";
	}, 250);
	sessionPanel_settingsSessend()
}
function session_close_button() {
	DOM("GROUP_CLOSE").style.backgroundColor = "rgba(255,255,255,.5)";
	DOM("ACTIVE_SESSION").innerHTML = "";
	DOM("ACTIVE_HOST").innerHTML = "";
	setTimeout(function() { 
		DOM("GROUP_CLOSE").style.backgroundColor = "rgba(255,255,255,.25)";
	}, 250);
	sessionPanel_settingsSessend()
}
