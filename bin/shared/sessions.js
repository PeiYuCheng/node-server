
/** ID of the current instance, unique for each browser tab **/
var instanceId = typeof queryString.instanceid !== "undefined" ? parseInt(queryString.instanceid) : Date.now();
/** Ping refresh rate in ms **/ 
var pingRefreshRate = localServer ? 1500 : 2500;
var updateMembersData = false;
/** Session ID **/
var sessionid = "";
/** Session host ID **/
var sessionHost = "";
/** Session host name **/
var sessionHostName = "";
/** Session data, updated by the session manager and available for all participants (read only) **/
var sessionLiveData = "";
var session_initialized = false;
/** Is current user manager for the current session **/
var isSessionManager = false;
var locallyClosedSession = "";

/** The activity string for the current app and current session.
Can be updated from scripting, then call pingASAP() to push to the server **/
var activityString = "";

var sharedSessionLiveData = memget("liveData", sessionLiveData);
var pingCompleted = true;
var pingPulseNext = Date.now() + 1000;
var pingTimeout = 1500;
/** Ping happened at least one time since the page was loaded **/
var pingOnceOk = false;

/** Ask for the ping to happen as soon as possible, without waiting for the delay **/
function pingASAP() {
	pingPulseNext = 0;
}

function session_initialize() {
	if(!session_initialized) {
		var Ic = '<svg style="width: 30px; height: 30px;" fill="#FFFFFF" version="1.1" width="640" height="640" viewBox="0 0 640 640"><path d="M368 640h-128c-26.467 0-48-21.532-48-48v-224c0-26.468 21.533-48 48-48h128c26.468 0 48 21.532 48 48v224c0 26.468-21.532 48-48 48zM240 352c-8.822 0-16 7.178-16 16v224c0 8.822 7.178 16 16 16h128c8.822 0 16-7.178 16-16v-224c0-8.822-7.178-16-16-16h-128z"></path><path d="M304 480c-26.467 0-48-21.532-48-48s21.533-48 48-48c26.468 0 48 21.532 48 48s-21.532 48-48 48zM304 416c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z"></path><path d="M376.556 257.127c-4.478 0-8.93-1.869-12.094-5.517-15.22-17.547-37.257-27.61-60.462-27.61-23.204 0-45.241 10.063-60.461 27.61-5.79 6.675-15.895 7.392-22.571 1.602-6.675-5.79-7.392-15.896-1.602-22.571 21.301-24.557 52.15-38.641 84.634-38.641 32.486 0 63.334 14.085 84.636 38.643 5.79 6.675 5.072 16.781-1.604 22.571-3.026 2.625-6.761 3.913-10.476 3.913z"></path><path d="M158.899 194.252c-3.717 0-7.449-1.288-10.477-3.914-6.675-5.79-7.393-15.895-1.603-22.57 39.562-45.61 96.852-71.768 157.181-71.768 60.327 0 117.616 26.157 157.178 71.764 5.791 6.675 5.073 16.78-1.602 22.571s-16.779 5.072-22.57-1.602c-33.481-38.597-81.96-60.733-133.006-60.733-51.048 0-99.527 22.137-133.008 60.736-3.163 3.647-7.617 5.516-12.093 5.516z"></path><path d="M86.352 131.376c-3.717 0-7.449-1.287-10.478-3.914-6.675-5.79-7.392-15.896-1.602-22.571 57.823-66.66 141.556-104.891 229.728-104.891 88.17 0 171.901 38.23 229.724 104.888 5.791 6.675 5.073 16.78-1.602 22.571s-16.78 5.073-22.57-1.602c-51.742-59.648-126.662-93.857-205.552-93.857-78.892 0-153.813 34.21-205.555 93.86-3.164 3.647-7.617 5.516-12.093 5.516z"></path></svg>';
		H = "<div id='RC-OVERLAY' class='rcOverlay' style='display: none;'>"+Ic+"</div>";
		DOM("SESSION_INFO_TITLE").insertAdjacentHTML("afterend", H);
		DOM("RC-OVERLAY").setAttribute(clickEventName, "event.stopPropagation(); remoteControlDialog()");
		remote_overlay_refresh();
		
		session_initialized = true;
		session_loop();
	}
}

function remote_overlay_refresh() {
	if(DOMexists("RC-OVERLAY")) {
		var rcOverlayVisible = (controllerid !== "" ? "block" : "none");
		var rcOverlayColor = (controllerid === deviceid ? "#2BD34F" : "#D32B4F");
		DOM("RC-OVERLAY").style.backgroundColor = rcOverlayColor;
		DOM("RC-OVERLAY").style.display = rcOverlayVisible;
	}
}

var ormiboardRegisterWindow_wasOpen = false;
	
function session_loop() {
	if(pingPulseNext < Date.now() && !serverComBusy && tellAskAutoClose === -1) {
		pingPulseNext = Date.now() + pingRefreshRate;			
		if(userid !== null && userid !== "" && pingCompleted) {
			session_loop_proceed();
		} else {
			if(loadFileWhenReady) {
				cloud_load(docid, templateId, templateOwner, authorid);//documentOwner);
				loadFileWhenReady = false;
			}			
		}
	}

	setTimeout(session_loop, 50);
}

var showJoinSessionAlert = false;
var pingStartStamp = 0;
var firstPing=true;
function session_loop_proceed() {
	pingCompleted = false;
	var context = "";
	var clientSideContext = "";
	var controllerData = "";
	var ignoreOtherDevices = false;
	
	if(typeof ormiboard_home !== "undefined") {
		context = "HOME~~~" + username + "~~";
	} else {
		if(editor) {
			if(playMode) {
				context = "READ~" + docid + "_" + getSlideIndex(currentSlide) + "~" + authorid + "~" + username + "~";
			} else {
				context = "EDIT~" + (documentSavedOnce ? docid : "") + "_" + getSlideIndex(currentSlide) + "~" + userid + "~" + username + "~" + (documentSavedOnce ? lastPublicationTimeStamp : "") + "~" + authorid +  "~";
			}
		} else {
			context = "READ~" + docid + "_" + getSlideIndex(currentSlide) + "~" + (exists(authorid) ? authorid : userid) + "~" + username + "~";
		}
		context += "~" + activityString
	}
	context +=  "~" + instanceId;
//console.log("ping |---> " + context)
	
	ping(userid, deviceid, context, function() {		
		if(Date.now() - pingStartStamp > pingTimeout) {
			console.log("--- PULSE MISSED ---");
			pingPulseNext = Date.now() + pingTimeout * 2;
		} else {
			if(!pingOnceOk) {
				pingOnceOk = true;
				if(home) {
					refreshGroupDisplay();
				}
			}
		}
		if(sessionLiveData !== "") {
		
			var rootData = sessionLiveData.split("~??");
			controllerData = rootData[1];
			var allData = rootData[0].split("!~!");
		
			var get_docServerStamp = parseInt(allData[3]);
			var ds = allData[0].split(":");
			
			var context = allData[1].split("~");
			var contextDocid = context[0].trim();
			var contextName = context[1];
			var contextAction = context[2];
			var contextVersion = context[3];
			
			if(allData[1] == "NOT_FOUND") {
				if(sessionid !== "" && sessionid !== null) {
					if(locallyClosedSession !== sessionid) {
						if(!isSessionManager && !asking) {
							tell("Session closed.", "The current session was closed by the host.", true);
						}
					}
					showJoinSessionAlert = false;
					sessionClearData();
					//signoutClearData();
					refreshSessionPanel();
					if(home) {
						refreshGroupDisplay();
					}
					// CAN HAPPEN WHEN LOCAL CLOSE SESSION
				}
			} else {
				if(sessionid != ds[1] && String(ds[1]).length === 5) {
					if(memget("sessionid") === ds[1]) {
						sessionid = ds[1];
						isSessionManager = ds[0] === "H";
						sessionHostName = contextName;
						refreshSessionPanel();
						if(home) {
							refreshGroupDisplay();
						}

					} else {
						if(ds[0] == "H") {
							if(showJoinSessionAlert) {
								ask("Session Host", "You host the session "+ds[1]+".", "Close Session", "Continue", function(choice) {
									if(choice == "A") {
										session_delete(ds[1]);
									}
									if(choice == "B") {
										updateSessionSettings(ds[1], true);
									}
								}, true);
							} else {
								updateSessionSettings(ds[1], true);
							}
						} else {
							if(showJoinSessionAlert) {
								ask("Participation in session " + ds[1], "You participate in the session "+ds[1]+". You may be redirected by the host.", "Quit Session", "Continue", function(choice) {
									if(choice == "A") {
										session_quit(ds[1]);
									}
									if(choice == "B") {
										updateSessionSettings(ds[1], false);
									}
								}, true);
							} else {
								updateSessionSettings(ds[1], false);
							}
						}
					}
					
				}
			}
			if(sessionid !== "" && sessionid !== null) {
				var sessionData = allData[1];
				sharedSessionLiveData = memget("liveData");
				if(sessionData != sharedSessionLiveData) {
					sharedSessionLiveData = sessionData;
					memset("liveData", sessionData);
					interpretSharedCommand(sharedSessionLiveData);
					ignoreOtherDevices = true;
					memset("liveHostName", sessionHostName);
					refreshSessionPanel();
				} else {
					if(sessionHostName == "") {
						sessionHostName = memget("liveHostName");
						if(sessionHostName !== "") {
							refreshSessionPanel();
						}
					}
				}
				if(typeof allData[2] !== "undefined" && allData[2] !== "")  {
					var pdata = allData[2];
					if(session_panel_visible || updateMembersData) {
						if(participants_view_visible || updateMembersData) {
							if(pdata !== participants) {
								participants = pdata;
								participantsCount = participants.split("*~*").length - 2;
								participants_view_refresh();
								refreshSessionPanel();
							}
						} else {
							if(!isNaN(pdata)) {
								pdata = parseInt(pdata);
								if(pdata !== participantsCount) {
									participantsCount = pdata;
									refreshSessionPanel();
								}
							}
						}
					}
				}
			}
			if(loadFileWhenReady) {
				cloud_load(docid, templateId, templateOwner, authorid);
				loadFileWhenReady = false;
			}

			if(home) {
				if(get_docServerStamp !== 0) {
					if(get_docServerStamp !== server_grids_age) {
						query("get_grids&userid=" + userid, function(status, result) {
							var get_grids = result;
							grids = get_grids.split("~#~");
							memset("grids", get_grids);
							server_grids_age = get_docServerStamp;
							memset("server_grids_age", server_grids_age);
							grid_build();
						});
					}
				} else {
					if(server_grids_age === 0) {
						server_grids_age = 1;
						grid_build();
					}
				}
				
			} else {
				if(get_docServerStamp !== 0 && docServerStamp !== 0 && get_docServerStamp !== docServerStamp) {
					if(!editor) {
						var slindex = getSlideIndex(currentSlide);
						document.location = ROOT_URL + "data/users/" + authorid + "/boards/" + docid + "/board.html?slide=" + slindex + "&nocache=" + Date.now();
					} else {
						if(playMode) {
							cloud_reload();
						} else {
							if(docChecksum != getDocumentChecksum()) {
								message_start("<span "+clickEventName+"='msg_bt_reload()' class='msg_button' id='MSG_BT_RELOAD'>RELOAD</span><span "+clickEventName+"='msg_bt_ignore()' id='MSG_BT_IGNORE' class='msg_button'>IGNORE</span>", "Document updated on the server")
							} else {
								cloud_reload();
							}
						}
					}
				}
			}
			docServerStamp = get_docServerStamp;

			if(typeof controllerData !== "undefined") {
				controllerData = controllerData.split("!~!");
				if(controllerid !== controllerData[0]) {
					controllerid = controllerData[0];
					memset("controllerid", controllerid);
					if(controllerid !== "" && controllerid !== deviceid) {
						DOM("RC-OVERLAY").style.display = "block";
						session_panel_hide();
					} else {
						DOM("RC-OVERLAY").style.display = "none";						
					}
					remote_overlay_refresh();
				}
				if(controllerid !== deviceid && typeof controllerData[1] !== 'undefined' && controllerData[1] !== "") {
					remoteControlled_action(controllerData[1]);
				}
			}
		}
		pingCompleted = true;
		firstPing = false;
	}) 
}

function updateSessionSettings(new_sessid, new_isSessionManager) {
	sessionid = new_sessid;
	memset("sessionid", sessionid);
	isSessionManager = new_isSessionManager;
	refreshSessionPanel();
	if(home) {
		refreshGroupDisplay();
	}
	showJoinSessionAlert = false;
}

function msg_bt_reload() {
	DOM("MSG_BT_RELOAD").className = "msg_btdown";
	setTimeout(function() {
		DOM("MSG_BT_RELOAD").className = "msg_button";
		message_end();
		cloud_reload();
	}, 300);
}

function msg_bt_ignore() {
	DOM("MSG_BT_IGNORE").className = "msg_btdown";
	setTimeout(function() {
		DOM("MSG_BT_IGNORE").className = "msg_button";
		message_end();
	}, 300);	
}

function ping(uid, get_deviceid, context, callback) {
	var http = new XMLHttpRequest();
	http.onreadystatechange = function() {
		if (http.readyState == XMLHttpRequest.DONE ) {
			if(http.status == 200) {
				sessionLiveData = http.responseText;
//console.log("ping |<--- " + sessionLiveData)
				if(sessionLiveData === "USER_UNKNOWN") {
					accountRemoved();
				}
				if(sessionLiveData.indexOf("!~!") == -1) sessionLiveData = "";
			} else {
				sessionLiveData = "";
			}
			callback();
		}
	}
	if(updateMembersData) {
		var participantsDetails = "&p=1";
	} else {
		var participantsDetails = participants_view_visible ? "&p=1" : session_panel_visible ? "&p=0" : "";
	}

	// File currently edited was updated on the server?
	var queryFileAge = "";
	if(home) {
		queryFileAge = "&age=/users/" + userid + "/data/grids.data";
	} else {
		if(docid !== null && documentSavedOnce) {
			queryFileAge = "&age=/users/" + authorid + "/boards/" + docid + "/board.html";
		}
	}
	pingStartStamp = Date.now();
//console.log("?ping=" + uid + "&did=" + get_deviceid + queryFileAge + "&c=" + context + participantsDetails)
	http.open("GET", QUERY_URL + "?ping=" + uid + "&did=" + get_deviceid + queryFileAge + "&c=" + context + participantsDetails + "&nc=" + Date.now(), true);
	http.timeout = pingTimeout;
	http.send();
}

/** Set the data for the current session on the server **/
function session_set(data, callback) {
	if(sessionid !== null && sessionid !== "") {
		sessionLiveData = "";
		sharedSessionLiveData = Date.now() + "~" + username + "~" + data;
		//var http = new XMLHttpRequest();
		//http.onreadystatechange = function() {
		//	if (http.readyState == XMLHttpRequest.DONE ) {
		//		if(http.status == 200) {			
		//			sessionLiveData = http.responseText;
		//		}
		//		if(typeof callback !== "undefined") {
		//			callback();
		//		}
		//	}
		//}
		//http.open("GET", QUERY_URL + "?setsessiondata=" + sessionid + "&data="+sharedSessionLiveData, true);
		//http.send();
		
		query("setsessiondata=" + sessionid + "&data="+sharedSessionLiveData, function(status, result) {
			if(status) {
				sessionLiveData = result;
			}
			if(typeof callback !== "undefined") {
				callback();
			}
		});
	} else {
		if(typeof callback !== "undefined") {
			callback();
		}
	}
}

function accountRemoved() {
	var users = memget('users') != null && memget('users') != "" ? JSON.parse(memget('users')) : [];
	var newUsers = [];
	var newIndex = 0;
	for(var ptr in users) {
		if(users[ptr] !== null && users[ptr].userid !== null && users[ptr].userid !== userid) {
			newUsers[newIndex++] = users[ptr];
		}
	}
	memset('users', JSON.stringify(newUsers));
	signoutClearData();
	window.setTimeout(function() {
		document.location = ROOT_URL;
	}, 150);
}


