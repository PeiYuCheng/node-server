
sessionPanelInit();

function sessionPanelInit() {
	var mask = document.createElement("div");
	mask.setAttribute("id", "MASK");
	mask.setAttribute("style", "transition: all .5s; z-index:90000; position: fixed; display: none; opacity:0; left: 0px; top: 0px; width: 100%; height: 100%; overflow-y: auto; overflow-x: hidden; background-color:rgba(130,130,130,.9); font-size:12px; text-align: center;");
	mask.setAttribute(clickEventName, "session_panel_hide()");
	document.body.appendChild(mask);
	var edom = document.createElement("div");
	edom.setAttribute("id", "PARTICIPANTS_VIEW");
	edom.setAttribute("style", "transition: all .5s; z-index:100010; position: fixed; display: none; left: 0px; top: -100%; width: 100%; height: 100%; overflow-y: auto; overflow-x: hidden; background-color:rgb(150,150,150); font-size:12px; text-align: center;");
	document.body.appendChild(edom);
	
	setTimeout(function() {
		refreshSessionPanel();
		DOM("SESSION_INFO").style.top = "0px";
	}, 1000);
}

function refreshSessionPanel() {
	if(!SesssettingsMenuIsOpen) {
		users = memget('users') != null && memget('users') != "" ? JSON.parse(memget('users')) : [];

		var H = "";
		if(userid === null) userid = "";
		if(userid == "") {
			H += refreshSessionPanelSignin();
		} else {
			if(joiningSessionDialog) {
				H += refreshSessionPanelJoinSession();
			} else {
				if(sessionid === "" || sessionid === null) {
					H += refreshSessionPanelNoSession();
				} else {
					H += refreshSessionPanelSession();
					
				}
			}
		}
		if(!joiningSessionDialog) {	
			var fcolor = SesssettingsMenuIsOpen ? "#606060" : "#BABABA";
			var blk = SesssettingsMenuIsOpen ? "block" : "none";
			var op = SesssettingsMenuIsOpen ? "1" : "0";
		
			H += "<div "+clickEventName+"='sessionPanel_settingsMenuHide()' id='SETTINGS_MENU_MASK' style='opacity: "+op+";display: "+blk+"; transition: opacity .4s; font-size: 20px; z-index: 110999; position: absolute; border-radius: 0px 0px 4px 4px; left: -1px; top: 0px; width:301px; height: 300px; background-color:rgba(160,160,160,.85)'></div>";
			H += "<div id='SETTINGS_MENU' style='display: "+blk+"; font-size: 16px; font-family: regular; z-index: 111100; position: absolute; text-align: left; right: 10px; top: 30px; overflow: hidden; width: 200px; background-color:#FFFFFF;'>";
				H += "<div id='SETTINGS_MENU_BODY' style='display: block; font-size: 16px; font-family: regular; text-align: left;  transition: all .65s; margin-top: -300px; overflow: hidden; width: 200px; background-color:#FFFFFF;'>";
					H += "<div  id='STMN_SESSEND' "+clickEventName+"='sessionPanel_settingsSessend()'  style='"+(sessionid === "" || sessionid === null ? "color: #C0C0C0;" : "")+" width: 190px; padding-left: 10px; line-height: 40px; border-bottom:1px solid #E0E0E0;'>"+(isSessionManager ? "Close " : "Quit ")+" session</div>";
					H += "<div id='STMN_SIGNOUT' "+clickEventName+"='sessionPanel_settingsSignout()'  style='"+(userid === "" ? "color: #C0C0C0;" : "")+" width: 190px; padding-left: 10px; line-height: 40px; border-bottom:1px solid #E0E0E0;'>Sign-out</div>";
				
					if(users !== null && users.length > 1) {
						H += "<div id='STMN_SWITCH' "+clickEventName+"='sessionPanel_switchUser()'  style='width: 190px; padding-left: 10px; line-height: 40px; border-bottom:1px solid #E0E0E0;'>Switch Account</div>";
					}
					if(userid !== null && userid !== "") {
						H += "<div id='STMN_DEVICES' "+clickEventName+"='sessionPanel_devices()'  style='width: 190px; padding-left: 10px; line-height: 40px; border-bottom:1px solid #E0E0E0;'>Control My Devices</div>";
					}
					H += "<div id='STMN_MULTI' "+clickEventName+"='sessionPanel_multi()'  style='width: 190px; padding-left: 10px; line-height: 40px; border-bottom:1px solid #E0E0E0;'>Multi</div>";
			
					if(userid.indexOf("exoucom") > -1 || userid.indexOf("gmailcompixinuum") > -1) {
						H += "<table cellspacing=0 cellpadding=0 style='width: 100%;'><tr>";
						H += "<td id='STMN_ADMIN'"+clickEventName+"='sessionPanel_admin()'  style='width: 50%;padding-left: 10px; border-right:1px solid #E0E0E0; line-height: 40px;'>Admin</td>";
						H += "<td id='STMN_HELP'"+clickEventName+"='sessionPanel_settingsHelp()'  style='width: 50%;padding-left: 10px;  line-height: 40px;'>Help</td>";
						H += "</tr></table>";
					} else {
						H += "<div id='STMN_HELP'"+clickEventName+"='sessionPanel_settingsHelp()'  style='width: 190px;padding-left: 10px;  line-height: 40px;'>Help</div>";
					}
				H += "</div>"
			H += "</div>"

			H += "<div "+clickEventName+"='sessionPanel_settingsMenuShowHide()' id='SETTINGS_ICO_DIV' style='position: absolute; z-index: 111100; right: 0px; top: 0px; width: 40px; height: 40px;'>"
				H += "<svg id='SETTINGS_ICO' version='1.1' style='pointer-events: none; padding-left: 5px; padding-top: 5px; width: 25px; height: 25px;' width='448' height='512' viewBox='0 0 448 512'><path style='transition: fill .5s;' fill='"+fcolor+"' d='M223.969 175c-44.703 0-80.969 36.266-80.969 81 0 44.688 36.266 81.031 80.969 81.031 44.719 0 80.719-36.344 80.719-81.031-0-44.734-36-81-80.719-81zM386.313 302.531l-14.594 35.156 29.469 57.875-36.094 36.094-59.218-27.969-35.156 14.438-17.844 54.625-2.281 7.25h-51.016l-22.078-61.656-35.156-14.5-57.952 29.344-36.078-36.063 27.938-59.25-14.484-35.125-61.767-20.156v-50.984l61.703-22.109 14.485-35.094-25.953-51.234-3.422-6.719 36.031-36.031 59.297 27.922 35.109-14.516 17.828-54.594 2.297-7.234h51l22.094 61.734 35.063 14.516 58.031-29.406 36.063 36.031-27.938 59.203 14.438 35.172 61.875 20.125v50.969l-61.688 22.187z'></path></svg>";
			H += "</div>";

			var home_svgPath = "<path d='M597.504 352h-53.504v192c0 14.24-6.208 32-32 32h-128v-192h-128v192h-128c-25.792 0-32-17.76-32-32v-192h-53.504c-19.136 0-15.040-10.368-1.92-23.936l256.768-257.024c6.24-6.464 14.432-9.664 22.656-9.984 8.224 0.32 16.416 3.488 22.656 9.984l256.736 256.992c13.152 13.6 17.248 23.968-1.888 23.968z'></path>";
			if(!home) {
				H += "<div "+clickEventName+"='sessionPanel_gohome()' id='HOME_ICO_DIV' style='position: absolute; z-index: 110998; left: 10px; top: 0px; width: 40px; height: 40px;'>"
					H += "<svg fill='#B0B0B0' id='HOME_ICO' version='1.1' style='pointer-events: none; padding-left: 0px; padding-top: 8px; width: 24px; height: 24px;' width='640' height='640' viewBox='0 0 640 640'>"+home_svgPath+"</svg>";
				H += "</div>";
			} else {
				H += "<div "+clickEventName+"='sessionPanel_gohome()' id='HOME_ICO_DIV' style='position: absolute; z-index: 110998; left: 0px; top: 0px; width: 40px; height: 40px;'>"
					H += "<svg fill='#C9C9C9' id='HOME_ICO' version='1.1' style='pointer-events: none; padding-left: 0px; padding-top: 6px; width: 24px; height: 24px;' width='640' height='640' viewBox='0 0 640 640'>"+home_svgPath+"</svg>";
				H += "</div>";
			}
		}
		DOM("SESSION_PANEL").innerHTML = H;
		//if(typeof local_sessionEvent_refresh !== "undefined") {
		//	local_sessionEvent_refresh();
		//}
		remote_overlay_refresh();
	}
}

var selectSharingType = false;
function refreshSessionPanelSession() {
	var H = "";
	DOM("SESSION_INFO_TITLE").style.paddingTop = "0px";
	DOM("SESSION_INFO_ID").style.display = "block";
	DOM("SESSION_INFO_ID").innerHTML = sessionid === null ? "" : sessionid;	
	
	if(isSessionManager) {
		DOM("SESSION_INFO_TITLE").innerHTML = username;
		DOM("SESSION_INFO_ID").style.fontFamily = "bold";
		DOM("SESSION_INFO_ID").style.fontSize = "24px";
		//DOM("SESSION_INFO_ID").style.color = "#DE514E";
		
		if(selectSharingType) {
			H += "<div style='position: absolute; left: 0px; top: 30px; right: 0px; color: #606060; font-size: 26px; font-family: light; text-align: center; padding-top: 15px;'>Sharing Options</div>";
			
			H += "<div id='SHARE_NOW_ACTIVITY' "+clickEventName+"='share_now_click_activity()' style='position: absolute; transition: all .3s; left: 0px; top: 90px; color: #606060; border-top: 1px solid #EFF2F6; background-color: #FFFFFF; font-size: 22px; right: 0px; height: 90px; font-family: regular; text-align: center; padding-top: 15px;'>Interactive Mode<div style='font-size:16px;'>Students can interact with<br>the document, but cannot edit.</div></div>";
			H += "<div id='SHARE_NOW_TEMPLATE' "+clickEventName+"='share_now_click_template()' style='position: absolute; transition: all .3s; left: 0px; top: 195px; color: #606060; border-top: 1px solid #EFF2F6; background-color: #FFFFFF; font-size: 22px; right: 0px; height: 90px; font-family: regular; text-align: center; padding-top: 15px;'>Edit Mode<div style='font-size:16px;'>Students can edit a copy<br>of this document.</div></div>";
			
		} else {
			H += "<div id='RND_RADAR' class='radar' style='top: "+ (home ? 65 : 45) +"px;'></div>";
			H += "<div style='position: absolute; left: 20px; top: 9px; font-size:16px; width: 260px; text-align: center; color:#606060;'>You host the session " + sessionid + "</div>";
			var icon = "<svg style='pointer-event: none; position: absolute; right: 137px; top: "+ (home ? 145 : 124) +"px; width:20px; height:20px;' version='1.1' fill='#60A0E0' width='640' height='640' viewBox='0 0 640 640'><path d='M603.794 613.188l-190.189-207.478c42.858-44.846 66.395-103.468 66.395-165.71 0-64.106-24.964-124.375-70.294-169.706s-105.6-70.294-169.706-70.294-124.375 24.964-169.706 70.294-70.294 105.6-70.294 169.706 24.964 124.376 70.294 169.706 105.6 70.294 169.706 70.294c55.226 0 107.595-18.542 150.027-52.655l190.178 207.467c3.156 3.442 7.471 5.188 11.799 5.188 3.862 0 7.736-1.391 10.808-4.205 6.513-5.972 6.954-16.093 0.982-22.607zM32 240c0-114.691 93.309-208 208-208s208 93.309 208 208-93.309 208-208 208-208-93.309-208-208z'></path></svg>"
			var PINF = "";
			if(participantsCount > 0) {
				PINF += "<div id='RND_MEMBERS_BT' style='pointer-events: none; margin-top:"+ (home ? 30 : 10) +"px; margin-left: 80px; width: 144px; height: 144px; background-color:#FFFFFF; border-radius: 100%;'>";
				PINF += "<div style='pointer-events: none; padding-top: 45px; font-size:60px; font-family: thin; color:#A0A0A0; line-height: 45px;'>" + icon + (participantsCount - 1) + "</div><div style='font-size: 14px;'>participant" + (participantsCount > 2 ? "s" : "")+"</div>";
				PINF += "</div>";

				H += "<div "+clickEventName+"='participants_view_show()' id='SHARE_INFX' style='position: absolute; left: 0px; top: 35px; font-size:24px; width: 300px; height: 180px; text-align: center;'>"+PINF+"</div>";
				var noParticipant = "<div id='SHARE_NOW' style='pointer-events: none; position: absolute; left: 20px; top: 220px; font-size:16px; width: 260px; padding-top: 20px; text-align: center; color:#606060;'>Share the code "+sessionid+" to allow participants to join this session.</div>";
				if(home) {
					if(participantsCount < 2) {
						H += noParticipant;
					} else {
						H += "<div id='SHARE_NOW' style='pointer-events: none; position: absolute; left: 20px; top: 220px; font-size:16px; width: 260px; padding-top: 20px; text-align: center; color:#606060;'>Open a document then come here<br>to share it with the participants.</div>";
					}
				} else {
					if(participantsCount < 2) {
						H += noParticipant;
					} else {
						H += "<div id='SHARE_NOW' "+clickEventName+"='share_now_click()' style='position: absolute; left: 0px; bottom: 0px; right: 0px; color: #606060; background-color:#FFFFFF; transition: all .3s;  font-size: 20px; height: 80px; font-family: regular; line-height: 80px; text-align: center;'>Share with "+(participantsCount - 1) +" participant" + (participantsCount > 2 ? "s" : "") + "</div>";
					}
				}
			}
		}
	} else {
		DOM("SESSION_INFO_TITLE").innerHTML = username;
		DOM("SESSION_INFO").style.color = "#606060";
		//DOM("SESSION_INFO_ID").style.color = "#DF5552";
		DOM("SESSION_INFO_ID").style.fontSize = "24px";
		DOM("SESSION_INFO_ID").style.fontFamily = "regular";
		
		H += "<div id='RND_RADAR' class='radar' style='top: 50px;'></div>";
		
		var PINF = "";
		if(participantsCount > 0) {
			PINF += "<div style='margin-left: 80px; width: 144px; height: 144px; background-color:#FFFFFF; border-radius: 100%;'>";
			PINF += "<div style='padding-top: 45px; font-size:60px; font-family: thin; color:#A0A0A0; line-height: 45px;'>" + (participantsCount - 1) + "</div><div style='font-size: 14px;'>participant" + (participantsCount > 2 ? "s" : "") + "</div>";
			PINF += "</div>";
		} else {
			PINF += "<div style='height: 144px;'>&nbsp;</div>";
		}
		if(sessionHostName !== "") {
			PINF += "<div style='font-size:12px; padding-top: 32px;'>Session supervised by</div>"
			PINF += "<div style='font-size:20px; line-height: 22px; color:#606060; font-family: bold;'>"+sessionHostName+"</div>"
		}
		H += "<div id='SHARE_INFX' style='position: absolute; left: 0px; top: 40px; font-size:24px; width: 300px;text-align: center;  padding-top: 10px; '>"+PINF+"</div>";
	}
	return(H);
}

function sessionEvent_end() {
	//if(typeof local_sessionEvent_end !== "undefined") {
	//	local_sessionEvent_end();
	//}
}
function sessionEvent_join() {
	//if(typeof local_sessionEvent_join !== "undefined") {
	//	local_sessionEvent_join();
	//}
	//refreshSessionPanel();
}

var session_panel_visible = false;

function session_click() {
	if(session_initialized) {
		if(selectSharingType) {
			selectSharingType = false;
			refreshSessionPanel();
		}
		session_panel_visible = !session_panel_visible;
		if(session_panel_visible) {
			session_panel_show();
		} else {
			session_panel_hide();
		}
	}
}

/** Open the top drop-down menu **/
function session_panel_hide() {
	sessionPanel_settingsMenuHide();
	DOM("SESSION_INFO").style.top = "0px";
	setTimeout(function() {
		DOM("SESSION_PANEL").style.top = "-301px";
	}, 20)
	DOM("SESSION_INFO").style.backgroundColor = "#FFFFFF";
	DOM("SESSION_INFO_TITLE").style.color = "#3D4D65";
	DOM("SESSION_INFO_ID").style.color = "#D32B4F";
	
	DOM("MASK").style.opacity = 0;
	setTimeout(function() {
		DOM("MASK").style.display = "none";
		refreshSessionPanel();
	}, 500);
	session_panel_visible = false;
}

/** Close the top drop-down menu **/
function session_panel_show() {
	DOM("MASK").style.display = "block";
	setTimeout(function() {
		DOM("MASK").style.opacity = 1;	
		DOM("SESSION_INFO").style.backgroundColor = "#D32B4F";
		DOM("SESSION_INFO_TITLE").style.color = "rgba(255,255,255,.8)";
		DOM("SESSION_INFO_ID").style.color = "#FFFFFF";
	}, 50);
	DOM("SESSION_INFO").style.top = "299px";
	DOM("SESSION_PANEL").style.top = "0px";
	session_panel_visible = true;
	if(sessionid !== "" && sessionid !== null) {
		pingASAP();
	}
}

function sessionPanel_settingsSessend() {
	if(sessionid !== "" && sessionid !== null) {
		DOM("STMN_SESSEND").style.backgroundColor = "#EAEAEA";
		setTimeout(function() {
			sessionPanel_settingsMenuHide();
			session_panel_hide();
			
			if(isSessionManager) {
				ask("Close Session", "The session "+sessionid+" hosts "+(participantsCount - 1)+" participant"+(participantsCount - 1 > 1 ? "s" : "")+"."+(participantsCount > 1 ? "<br>Are you sure you want to close this session?" : ""), "Cancel", "Close Session", function(choice) {
					if(choice == "B") {
						session_delete(sessionid);
						sessingsSessEndComplete();
					} else {
						DOM("STMN_SESSEND").style.backgroundColor = "#FFFFFF";
					}
				}, true);

			} else {
				session_quit(sessionid);
				sessingsSessEndComplete();
			}
		}, 150);
	}
}
function sessingsSessEndComplete() {
	sessionClearData();
	DOM("STMN_SESSEND").style.backgroundColor = "#FFFFFF";
	refreshSessionPanel();
	if(home) {
		refreshGroupDisplay();
	}	
}

function sessionPanel_switchUser() {
	DOM("STMN_SWITCH").style.backgroundColor = "#EAEAEA";
	setTimeout(function() {
		DOM("STMN_SWITCH").style.backgroundColor = "#FFFFFF";
		
		if(editor && !playMode && docChecksum != getDocumentChecksum()) {
			sessionPanel_settingsMenuHide();
			session_panel_hide();			
			panelMessageSignoutUnsaved();
		} else {
			show_register_window();
			sessionPanel_settingsMenuHide();
			//session_panel_hide();
		}
	}, 150);
}

function sessionPanel_devices() {
	DOM("STMN_DEVICES").style.backgroundColor = "#EAEAEA";
	setTimeout(function() {
		DOM("STMN_DEVICES").style.backgroundColor = "#FFFFFF";
		sessionPanel_settingsMenuHide();
		devices_show();
	}, 150);
}

	
function sessionPanel_settingsSignout() {
	if(userid !== "") {
		
		if(editor && !playMode && docChecksum != getDocumentChecksum()) {
			sessionPanel_settingsMenuHide();
			session_panel_hide();			
			panelMessageSignoutUnsaved();
		} else {
			DOM("STMN_SIGNOUT").style.backgroundColor = "#EAEAEA";
			setTimeout(function() {
				DOM("STMN_SESSEND").style.backgroundColor = "#FFFFFF";
				DOM("STMN_SIGNOUT").style.backgroundColor = "#FFFFFF";
				signOut();
				setTimeout(function() { 
					sessionPanel_settingsMenuHide()
				}, 50); 		
			}, 150);	
		}
	}
}

function panelMessageSignoutUnsaved() {
	message_start("Save your changes before sign-out", "Unsaved changes");
	setTimeout(function() {
		message_end()
	}, 3500);	
}

function sessionPanel_settingsHelp() {
	DOM("STMN_HELP").style.backgroundColor = "#EAEAEA";
	setTimeout(function() {
		go(ROOT_URL + "apps/doc");
		DOM("STMN_HELP").style.backgroundColor = "#FFFFFF";
		setTimeout(function() { 
			sessionPanel_settingsMenuHide()
		}, 50); 		
	}, 150);	
}

function sessionPanel_admin() {
	DOM("STMN_ADMIN").style.backgroundColor = "#EAEAEA";
	setTimeout(function() {
		go(ROOT_URL + "/apps/admin/");
		DOM("STMN_ADMIN").style.backgroundColor = "#FFFFFF";
		setTimeout(function() { 
			sessionPanel_settingsMenuHide()
		}, 50); 		
	}, 150);	
}

function sessionPanel_multi() {
	DOM("STMN_MULTI").style.backgroundColor = "#EAEAEA";
	setTimeout(function() {
		if(isAndroid) {
			go(ROOT_URL + "/apps/multi?fast");
		} else {
			go(ROOT_URL + "/apps/multi");
		}
		DOM("STMN_MULTI").style.backgroundColor = "#FFFFFF";
		setTimeout(function() { 
			sessionPanel_settingsMenuHide()
		}, 50); 		
	}, 150);	
}

function sessionPanel_gohome() {
	DOM("HOME_ICO").childNodes[0].setAttribute("fill", "#606060");
	setTimeout(function() {
		DOM("HOME_ICO").childNodes[0].setAttribute("fill", "#BABABA");
		setTimeout(function() {
			document.location = ROOT_URL;
		}, 50);
	}, 150);
}

var SesssettingsMenuIsOpen = false;
function sessionPanel_settingsMenuShowHide() {
	if(Date.now() > settingMenuDelay) {
		if(DOM("SETTINGS_MENU").style.display == "none") {
			sessionPanel_settingsMenuShow();
		} else {
			sessionPanel_settingsMenuHide();
		}
	}
}
var settingMenuDelay = 0;
function sessionPanel_settingsMenuHide() {
	if(Date.now() > settingMenuDelay) {
		SesssettingsMenuIsOpen = false;
		settingMenuDelay = Date.now() + 600;
		joiningSessionDialog = false;
		if(DOM("SETTINGS_ICO") !== null) {
			DOM("SETTINGS_ICO").childNodes[0].setAttribute("fill", "#BABABA");
			
			DOM("SETTINGS_MENU_BODY").style.marginTop = "-300px";
			
			
			
			DOM("SETTINGS_MENU_MASK").style.opacity = 0;
			setTimeout(function() {
				if(DOMexists("SETTINGS_MENU_MASK")) {
					DOM("SETTINGS_MENU").style.display = "none";
					DOM("SETTINGS_MENU_MASK").style.display = "none";
				}
			}, 500);
		}
	}
}
function sessionPanel_settingsMenuShow() {
	if(Date.now() > settingMenuDelay) {
		SesssettingsMenuIsOpen = true;
		settingMenuDelay = Date.now() + 100;
		DOM("SETTINGS_ICO").childNodes[0].setAttribute("fill", "#606060");
		DOM("SETTINGS_MENU_MASK").style.display = "block";
		setTimeout(function() {
			DOM("SETTINGS_MENU_MASK").style.opacity = 1;
			DOM("SETTINGS_MENU_BODY").style.marginTop = "0px";
		}, 10);
		DOM("SETTINGS_MENU").style.display = "block";
	}
}

function refreshSessionPanelSignin() {
	var H = "";
	DOM("SESSION_INFO_TITLE").style.paddingTop = "5px";
	DOM("SESSION_INFO_TITLE").innerHTML = "";
	DOM("SESSION_INFO_ID").style.display = "block";
	DOM("SESSION_INFO_ID").innerHTML = "<span style='font-size: 20px; letter-spacing: 0px; '>Sign-in</span>";
	H += "<div style='position: absolute; left: 15px; top: 50px; color:#404040; font-size:16px; width: 270px; text-align: center;'>Sign-in to create documents<br>and collaborate.</div>";
	H += "<div id='SIGNIN_ORMIBOARD' class='sess-panel-bt' "+clickEventName+"='ormiboardSignIn()' style='font-size:16px; font-family: bold; top: 100px; padding-top: 28px; height: 60px; color: #435269;'><img src='"+ROOT_URL+"rsc/images/ormiboard.svg' style='width: 36px; height: 36px; vertical-align:middle; padding-right: 5px;'> Sign-in with Ormiboard</div>";
	if(!localServer) {
		H += "<div id='SIGNIN_GOOGLE' class='sess-panel-bt' "+clickEventName+"='googleSignIn()' style='font-size:16px; font-family: bold; top: 200px; padding-top: 28px; height: 60px; color: #435269;'><img src='"+ROOT_URL+"rsc/images/google.png' style='width: 26px; height: 26px; vertical-align:middle; padding-right: 8px;'> Sign-in with Google</div>";
	} else {
		H += "<div style='font-size:14px; top: 220px; left: 40px; width: 220px; position: absolute;'>Other account providers<br>are not available on a local server.</div>";
	}
	return(H);
}

function refreshSessionPanelNoSession() {
	var H = "";
	if(DOM("SESSION_INFO_TITLE") !== null) {
		DOM("SESSION_INFO_TITLE").innerHTML = username;
		DOM("SESSION_INFO_TITLE").style.paddingTop = "10px";
		DOM("SESSION_INFO_ID").style.display = "none";
	}
	H += "<div class='sess-panel-text' style='top: 40px;'>A session allows a group<br>to collaborate using a code.</div>";
	H += "<div id='SESS_CREATE' class='sess-panel-bt' "+clickEventName+"='session_create_bt()' style='font-family: light; font-size:16px; left: 25px; top: 90px; padding-top: 15px; height: 55px;'><div style='font-size:30px; line-height: 25px; font-family:regular;'>Create</div>a new session</div>";
	H += "<div class='sess-panel-text' style='top: 175px;'>If you have a code:</div>";
	H += "<div id='SESS_JOIN' class='sess-panel-bt' "+clickEventName+"='session_join_bt()' style='font-family: light; font-size:16px; left: 25px; top: 200px; padding-top: 18px; height: 55px;'><div style='font-size:30px; line-height: 25px; font-family: regular;'>Join</div>an existing session</div>";
	
	return(H);
}

function refreshSessionPanelJoinSession() {
	var H = "";
	H += "<div class='sess-panel-text' style='top: 15px; font-size:24px;'>Join a Session</div>";
	H += "<div class='sess-panel-text' style='top: 60px; font-size:14px;'>Please enter the access code.</div>";
	H += "<input type='text' id='GROUP_INPUT_FIELD' DEFAULT_BEHAVIOR class='sessinput' autocomplete='off' maxlength='5' onkeyup='groupInputFieldPress(event)'>";
	H += "<div class='sess-panel-text' style='top: 164px; font-size:14px; color:#A0A0A0;'>If you don't have a code, choose Cancel,<br>create a new session, and provide the code<br>to people you want to collaborate with.</div>";
	H += "<div id='SESS_JOIN_SIDX' class='sess-panel-bt' "+clickEventName+"='session_join_sid_btX()' style='font-size:20px; line-height: 40px; left: 20px; top: 240px; width: 100px; height: 40px;'>Cancel</div>";
	H += "<div id='SESS_JOIN_SID' class='sess-panel-bt' "+clickEventName+"='session_join_sid_bt()' style='font-size:20px; line-height: 40px; left: 130px; top: 240px; width: 150px; height: 40px;'>Join</div>";
	
	return(H);
}

