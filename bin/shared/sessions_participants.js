
var participants = "";
var participantsCount = 0;
var participants_view_visible = false;
var offlineAfterSeconds = 10; // Considered offline after 10s

/** Show the participants list **/
function participants_view_show() {
	participants_view_visible = true;
	pingASAP();
	DOM("RND_MEMBERS_BT").style.backgroundColor = "#E0E0E0";
	setTimeout(function() {
		DOM("PARTICIPANTS_VIEW").style.display = "block";
		setTimeout(function() {
			DOM("PARTICIPANTS_VIEW").style.top = "0px";
			DOM("RND_MEMBERS_BT").style.backgroundColor = "#FFFFFF";
		}, 100)
	}, 150)
}

/** Hides the participants list **/
function participants_view_hide() {
	DOM("PARTICIPANTS_CLOSE").style.backgroundColor = "rgba(0,0,0,.2)";
	setTimeout(function() {
		DOM("PARTICIPANTS_CLOSE").style.backgroundColor = "transparent";
		participants_view_visible = false;
		DOM("PARTICIPANTS_VIEW").style.top = "-100%";
		setTimeout(function() {
			DOM("PARTICIPANTS_VIEW").style.display = "none";
		}, 500);
	}, 50);
}

var participant_preview_refid = "";
var participant_preview_docid = "";
var participant_preview_index = "";
function participant_preview_click(documentState, index, refid, docid) {
	if(parent && isAndroid) {
		parent.postMessage("getUserScreenshot", "*");
	} else {

		participant_preview_index = index;
		participant_preview_refid = refid;
		participant_preview_docid = docid;
		var P = DOM("PREVACT_" + index).getBoundingClientRect();
		DOM("docPanel").style.left = (P.left) + "px";
		DOM("docPanel").style.top = (P.top + 78 + DOM("PARTICIPANTS_VIEW").scrollTop) + "px";
		DOM("docPanel").style.display = "block";
	}
}

function participant_preview_edit() {
	DOM("PART_DOC_EDIT").style.backgroundColor = "rgba(180,180,180,9)";
	setTimeout(function() {
		var dref = participant_preview_docid.split("_");
		go(ROOT_URL + "editor.html?id=" + dref[0] + "&slide=" + dref[1] + "&owner=" + participant_preview_refid)
		setTimeout(function() {
			DOM("docPanel").style.display = "none";
		}, 300);
	}, 150);
}

function participant_preview_open() {
	DOM("PART_DOC_READ").style.backgroundColor = "rgba(180,180,180,9)";
	setTimeout(function() {
		var dref = participant_preview_docid.split("_");
		go(ROOT_URL + "data/users/" + participant_preview_refid + "/boards/" + dref[0] + "/board.html?slide="+dref[1] + "&nocache=" + Date.now());
		setTimeout(function() {
			DOM("docPanel").style.display = "none";
		}, 300);		
	}, 150);
}

/** Returns an array with the list of members for the current session.
Returns { id, lastPresence, context, activity, docid, refid, username, lastActionTime, activityString} **/
function getMembers() {
	var list = [];
	var members = participants.split("*~*");
	var members_count = members.length - 1;
	var realIndex = 0;
	for(var index = 0; index < members_count; index++) {
		var info = members[index].split("?~?"); // userid - context - age
		if(info[0] != "session.data") {
			list[realIndex] = {};
			list[realIndex].id = info[0];
			list[realIndex].lastPresence = info[2];
			list[realIndex].context = info[1].split("~");
			var cc = list[realIndex].context.length;
			list[realIndex].activity = cc > 0 ? list[realIndex].context[0] : "";
			list[realIndex].docid = cc > 1 ? list[realIndex].context[1] : "";
			list[realIndex].refid = cc > 2 ? list[realIndex].context[2] : "";
			list[realIndex].username = cc > 3 ? list[realIndex].context[3] : "";
			list[realIndex].lastActionTime = cc > 4 ? list[realIndex].context[4] : "";
			list[realIndex].activityString = cc > 5 ? list[realIndex].context[5] : "";
			realIndex++;
		}
	}

	return list;
}

function participants_view_refresh() {
	var members = participants.split("*~*");
	var members_count = members.length - 1;
	var H = "";
	H += "<table id='docPanel' style='cursor: default; position: absolute; display: none; background-color:rgba(220,220,220,.9); width: 192px; height: 30px; font-size: 14px; font-family: bold;' cellspacing=0 cellpadding=0>";
	H += "<tr>";
	H += "<td id='PART_DOC_EDIT' style='width:96px; line-height: 30px; text-align: center;' "+clickEventName+"='participant_preview_edit()'>EDIT</td>";
	H += "<td id='PART_DOC_READ' style='width:96px; line-height: 30px; text-align: center;' "+clickEventName+"='participant_preview_open()'>OPEN</td>";
	H += "</tr>";
	H += "</table>";

	H += "<table class='participants_topbar'>"
	H += "<tr>"
	H += "<td style='font-size: 11px; width:80px;'>" +  (members_count > 1 ?  "<div style='font-size:30px; line-height:26px;'>" + (members_count - 2) + "</div>participant" + (members_count > 3 ? "s" : "") : "") +"</td>"
	H += "<td style='font-size: 11px; font-family: regular; color:#C0C0C0;'>SESSION<div style=' line-height:26px; font-size:30px; color:#FFFFFF;'>"+sessionid+"</div></td>"
	var svg_cross = '<svg style="width: 20px; height: 20px;" fill="#FFFFFF" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="640" height="640" viewBox="0 0 640 640"><path d="M342.627 336l276.686-276.687c6.249-6.248 6.249-16.379 0-22.627s-16.379-6.249-22.627 0l-276.686 276.687-276.687-276.686c-6.248-6.249-16.379-6.249-22.627 0s-6.249 16.379 0 22.627l276.687 276.686-276.686 276.687c-6.249 6.248-6.249 16.379 0 22.627 3.124 3.124 7.218 4.686 11.313 4.686s8.189-1.562 11.313-4.687l276.687-276.686 276.687 276.687c3.124 3.124 7.218 4.686 11.313 4.686s8.189-1.562 11.313-4.687c6.249-6.248 6.249-16.379 0-22.627l-276.686-276.686z"></path></svg>';
	H += "<td style='width: 38px;'>&nbsp;</td>"
	H += "<td id='PARTICIPANTS_CLOSE' "+clickEventName+"='participants_view_hide()' style='width: 42px; padding-left: 3px; padding-top: 4px;'>"+svg_cross+"</td>";
	H += "</td>"
	H += "</table>"
	H += "<div style='cursor: default; height: 60px;'>&nbsp;</div><div style='display: flex; flex-flow: row wrap; justify-content: center;'>"
	
	for(var index = 0; index < members_count; index++) {
		var info = members[index].split("?~?"); // userid - context - age
		var e_userid = info[0];
		var e_context = info[1];
		var e_age = info[2];
		if(e_userid != "session.data") {
			var seconds =  parseInt(e_age);
			var secondsText = "Away since ";
			var userOnline = seconds < offlineAfterSeconds;
			if(seconds < 60) {
				secondsText += ~~(seconds) + " seconds";
			} else {
				if(seconds < 60 * 60) {
					var mn = ~~(seconds / 60);
					secondsText += mn + " minute"+(mn > 1 ? "s" : "");
				} else {
					var h = ~~(seconds / 60 / 60);
					secondsText += h + " hour" +(h > 1 ? "s" : "");
				}
			}
			var lif = info[1].split("~"); 
			// STATUS=READ ~ DOCUMENT_ID ~ AUTHOR_ID ~ USERNAME
			// STATUS=EDIT ~ DOCUMENT_ID ~ PARENT_ID ~ USERNAME
			// STATUS=HOME ~ void ~ void ~ USERNAME
			var e_activity = lif[0];
			var e_docid = lif[1];
			var e_refid = lif[2];
			var e_name = lif[3];
			var e_stamp = lif[4];
		
			if(typeof e_name == 'undefined' || e_name == "undefined" || e_name == "") {
				H += "<div style='overflow: hidden; cursor: default; margin:5px; border-radius: 5px; width: 192px; height: 144px; background-color:#EAEAEA;'></div>";
			} else {
				if(e_userid != userid) {
				if(userOnline || e_userid == userid) {
					var textOnline =  "<div style='font-family: bold; color: #606060; padding-top: 7px;'>" + e_name + "</div>"
				} else {
					var textOnline = "<div style='font-family: bold;  padding-top: 3px;'>" + e_name + "</div><div style='font-size: 11px;'>" + secondsText + "</div>";	
				}

				var understood = false;
				if(e_userid == userid) {
					var previewImage = "<div style='margin-bottom: 2px; width: 192px; height: 73px; background-color:#D0DADF; padding-top: 35px; color:#A0A0A0;'><div style='font-size:30px;'>YOU</div>the host</div>"					
					understood = true;
				}
				if(e_activity == 'EDIT' && !understood) {
					if(e_docid.split("_")[.0] !== '') {
						var previewImage = "<img id='PREVACT_"+index+"' "+clickEventName+"=\"participant_preview_click('EDIT', "+index+", '" + e_refid +"','"+e_docid+"')\" src='/data/users/"+e_refid+"/boards/"+(e_docid.split("_").join("/"))+".jpg?stamp=" + e_stamp + "' style='width:192px; height: 108px;' onerror='this.style.opacity=0;'>"
					} else {
						var previewImage = "<div style='margin-bottom: 2px; width: 192px; height: 73px; background-color:#EAEAEA; padding-top: 35px; color:#A0A0A0;'><div style='font-size:30px;'>EDITING</div>a new document</div>"	
					}
					understood = true;
				}
				if(e_activity == 'READ' && !understood) {
					var previewImage = "<img id='PREVACT_"+index+"' "+clickEventName+"=\"participant_preview_click('READ', "+index+", '" + e_refid +"','"+e_docid+"')\" src='/data/users/"+e_refid+"/boards/"+(e_docid.split("_").join("/"))+".jpg' style='width: 192px; height: 108px;'  onerror='this.style.opacity=0;'>"
					understood = true;
				}
				if(e_activity == 'HOME' && !understood) {
					var previewImage = "<div style='margin-bottom: 2px; width: 192px; height: 73px; background-color:#EAEAEA; padding-top: 35px; color:#A0A0A0; '>Ormiboard<div style='font-size:30px;'>HOME</div></div>"	
					understood = true;
				}
				if(!understood) {
					var previewImage = "<div style='margin-bottom: 2px; width: 192px; height: 108px; background-color:#EAEAEA'></div>"				
				}
				H += "<div style='overflow: hidden; cursor: default; margin:5px; border-radius: 5px; width: 192px; height: 144px; background-color:#FFFFFF;'>"
				H += previewImage + textOnline + "</div>"
			}
			}
		}
	}
	H += "</div>"
	DOM("PARTICIPANTS_VIEW").innerHTML = H;
}




