
function createSessionId() {
	var c0 = 'O', c1 = 'O', c2, c3, c4 = 'O';
	while(c0 == 'O' || c0 == 'I') c0 = String.fromCharCode(~~(Math.random() * 24) + 65);
	while(c1 == 'O' || c1 == 'I') c1 = String.fromCharCode(~~(Math.random() * 24) + 65);
	var c2 = String.fromCharCode(~~(Math.random() * 8) + 50);
	var c3 = String.fromCharCode(~~(Math.random() * 8) + 50);
	while(c4 == 'O' || c4 == 'I') c4 = String.fromCharCode(~~(Math.random() * 24) + 65);
	return(c0 + c1 + c2 + c3 + c4);
}

var sharedCommandCallbackData = "";
function interpretSharedCommand(commandString) {
//console.log(commandString)
	if(!isSessionManager && commandString.indexOf("~") > -1) {
		var commandStringSplit = commandString.split("~");
		var stamp = commandStringSplit[0];
		if(sessionHostName !== commandStringSplit[1]) {
			sessionHostName = commandStringSplit[1];
			memset("liveHostName", sessionHostName);
			if(home) refreshGroupDisplay();
		}
		
		var action = commandStringSplit[2];
		var processed = false;
		if(action == "home") {
			setTimeout(function() {
				document.location = ROOT_URL;
			}, 50);
			processed = true;
		}
		if(!processed) {
			if(action.indexOf(":") > -1) {
				action = action.split(":");
			} else {
				action = [action, ""];
			}
			if(action[0] == "open") {
				var author = action[1].split("/")[0];
				var refid = action[1].split("/")[1].split("_");
				var bodyURL = "data/users/" + author + "/boards/" + refid[0] + "/board.html";
				sharedCommandCallbackData = ROOT_URL + bodyURL + "?slide=" + refid[1] + "&nocache=" + Date.now();
				if(refid[0] !== docid) {
					serverFileExists(bodyURL, 
						function() {
							document.location = sharedCommandCallbackData;
						},
						function(result) {
							// Failed
							err("Try to open unexisting file " + sharedCommandCallbackData, "sessions_lib.js", "interpretSharedCommand");
							waitbox_end();
						}
					);
				} else {
					slide_goto(refid[1], false);
				}
			}
			if(action[0] == "copy") { // Clone
				var author = action[1].split("/")[0];
				var refid = action[1].split("/")[1].split("_");
				// we can use refid[0]  as docid instead of createId() to keep link between clone and template
				document.location = ROOT_URL + "editor.html?id=" + createId() + "&slide=" + refid[1] + "&template=" + refid[0] + "&owner=" + author + "&nocache=" + Date.now();
			}
		}
	}
}


function session_create_bt() {
	DOM("SESS_CREATE").style.backgroundColor = "#EAEAEA";
	setTimeout(function() {
		locallyClosedSession = "";
		sessionid = createSessionId();
		memset("sessionid", sessionid);
		isSessionManager = true;
		session_create();
		
		DOM("SESS_CREATE").style.backgroundColor = "#FFFFFF";
		setTimeout(function() {
			refreshSessionPanel();
			session_panel_show();
		}, 50);
	}, 150);
}

function session_create() {
	sessionLiveData = "";
	sessionHostName = "";
	participants = "";
	participantsCount = 0;
	memset("liveData", "");
	memset("liveHostName", "");
	sharedSessionLiveData = Date.now() + "~" + username + "~" + "idle";
	query("createsession=" + sessionid + "&userid=" + userid + "&data=" + sharedSessionLiveData, function(status, result) {
		if(status) {
			sessionHost = userid;
		} else {
			sessionHost = "";
		}
		if(home) {
			refreshGroupDisplay();
		}
	});
}

function session_quit(sid, callback) {
	locallyClosedSession = sid;
	query("quitsession=" + sid + "&userid=" + userid, function(status, result) {
		participants = "";
		participantsCount = 0;
		if(typeof callback !== "undefined") callback();
	});
}

function session_delete(sid) {
	locallyClosedSession = sid;
	query("deletesession=" + sid + "&userid=" + userid, function(status, result) {
		participants = "";
		participantsCount = 0;
	});
}

// -------------------------------------- Sign-in

var ormiboardRegisterWindow = null;
function ormiboardSignIn() {
	DOM("SIGNIN_ORMIBOARD").style.backgroundColor = "#EAEAEA";
	setTimeout(function() {
		DOM("SIGNIN_ORMIBOARD").style.backgroundColor = "#FFFFFF";
	}, 150);
	show_register_window();
}

function show_register_window() {
	document.location = ROOT_URL + "apps/register/register.html?childof=" + childOf;
}

function googleSignIn() {
	DOM("SIGNIN_GOOGLE").style.backgroundColor = "#EAEAEA";
	
	setTimeout(function() {
		DOM("SIGNIN_GOOGLE").style.backgroundColor = "#FFFFFF";
		canGoogleSignIn = true;
		fireEvent(DOM("GOOGLESN").childNodes[0], "click");
	}, 150);
}

function onGoogleSignIn(googleUser) {
	if(canGoogleSignIn) { 
		var profile = googleUser.getBasicProfile();
		var eml = profile.getEmail().split("@");
		
		controllerid = "";
		userid = str_replace(encodeURIComponent(str_replace(eml[1], ".", "") + str_replace(eml[0], ".", "d")), "%", "");
		username = profile.getName();
		add_account_local(userid, profile.getEmail(), profile.getGivenName(), profile.getFamilyName())
		refreshSessionPanel();
		showJoinSessionAlert = true;
		
		// Save account information
		query("setuserinfo&userid=" + userid + "&email=" + profile.getEmail()  + "&firstname=" + profile.getGivenName() + "&lastname=" + profile.getFamilyName(),
			function(status, result) {
				if(status && home) {
					if(DOMexists("MENU_L_EDIT")) DOM("MENU_L_EDIT").style.display = "block";
					refreshGroupDisplay();
					server_loadSlidesList();
					setTimeout(function() {
						session_panel_hide();
					}, 250);
				}
			}
		);
	}
}


// -------------------------------------- Sign-out

function signOut() {
	if(controllerid === deviceid) {
		disableRemoteController(function() {
			finalize_signOut();	
		});
	} else {
		controllerid = "";		
		finalize_signOut();
	}
}

function finalize_signOut() {
	signoutClearData();
	showJoinSessionAlert = true;
	window.setTimeout(function() {
		document.location = ROOT_URL;
	}, 150);
}


function signoutClearData() {
	memset("server_grids_age", "0");
	memset("grids", "");
	memset("liveData", "");
	memset("sessionid", "");
	memset("liveHostName", "");			
	memset("userid", "");
	memset("username", "");
	memset("firstname", "");
	memset("lastname", "");
	memset("email", "");
	memset("controllerid", "");	
	controllerid = "";
	isSessionManager = false;
	sessionid = "";
	userid = "";
	username = "";
	participants = "";
	participantsCount = 0;
	sessionHostName = "";
	server_grids_age = 0;
	currentGrid = 0;
	grids = "";
}
function sessionClearData() {
	memset("liveData", "");
	memset("sessionid", "");
	memset("liveHostName", "");			
	isSessionManager = false;
	sessionid = "";
	participants = "";
	participantsCount = 0;
	sessionHostName = "";
}

// ---------------------------------------

// Add and apply an account
function add_account_local(add_userid, add_email, add_firstname, add_lastname) {
console.log(users);	
	users = users === null ? [] : users;
	var accountFound = false;
	var newUserData = {userid: add_userid, firstname: add_firstname, lastname: add_lastname, email: add_email };
	for(var index in users) {
		if(users[index] !== null && users[index].userid == add_userid) {
			accountFound = true;
			users[index] = newUserData;
		}
	}
	if(!accountFound) {
		var newUserElement = users.push( newUserData );
		newUserElement.userid = add_userid;
	}
	memset('users', JSON.stringify(users));
	var accountIndex = null;
	for(var index in users) {
		if(users[index] !== null && users[index].userid == add_userid) {
			accountIndex = index;
		}
	}
	apply_account(accountIndex);
}

function apply_account(accountIndex) {
	memset("userid", users[accountIndex].userid);
	memset("email", users[accountIndex].email);
	memset("username", users[accountIndex].firstname + " " + users[accountIndex].lastname);
	memset("firstname", users[accountIndex].firstname);
	memset("lastname", users[accountIndex].lastname);
}