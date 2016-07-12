
var shareDocumentAsCopy = false;
var sharedDocumentId = "";

function share_now_click_template() {
	DOM("SHARE_NOW_TEMPLATE").style.backgroundColor = "#D32B4F";
	DOM("SHARE_NOW_TEMPLATE").style.color = "#FFFFFF";
	selectSharingType = false;
	shareDocumentAsCopy = true;
	execute_share_now();
	setTimeout(function() {
		if(DOMexists("SHARE_NOW_TEMPLATE")) {
			DOM("SHARE_NOW_TEMPLATE").style.backgroundColor = "#FFFFFF";
			DOM("SHARE_NOW_TEMPLATE").style.color = "#000000";
		}
		//refreshSessionPanelSession()
		refreshSessionPanel();
	}, 150);	
}
function share_now_click_activity() {
	DOM("SHARE_NOW_ACTIVITY").style.backgroundColor = "#D32B4F";
	DOM("SHARE_NOW_ACTIVITY").style.color = "#FFFFFF";
	setTimeout(function() {
		selectSharingType = false;
		shareDocumentAsCopy = false;
		execute_share_now();
		if(DOMexists("SHARE_NOW_ACTIVITY")) {
			DOM("SHARE_NOW_ACTIVITY").style.backgroundColor = "#FFFFFF";
			DOM("SHARE_NOW_ACTIVITY").style.color = "#000000";
		}
		refreshSessionPanel();
		//refreshSessionPanelSession()
	}, 100);
	
}
function execute_share_now() {
	if(editor && (docChecksum != getDocumentChecksum() || !documentSavedOnce)) {
		cloud_save(function() { share_now_now(); });
	} else {
		share_now_now();
	}
}

function share_now_click() {
	DOM("SHARE_NOW").style.backgroundColor = "#D32B4F";
	DOM("SHARE_NOW").style.color = "#FFFFFF";
	setTimeout(function() {
		selectSharingType = true;
		refreshSessionPanel();
	}, 100);
}
	
function share_now_now() {
	if(shareDocumentAsCopy) {
		var action = "copy:" + (authorid !== "" ? authorid : userid) + "/" + docid + "_" + getSlideIndex(currentSlide);
		sharedDocumentId = "";
	} else {
		var action = "open:" + (authorid !== "" ? authorid : userid) + "/" + docid + "_" + getSlideIndex(currentSlide);
		sharedDocumentId = docid; // enable slides follow mode for this document
	}

	session_set(action, function() {
		setTimeout(function() {
			refreshSessionPanel();
			session_panel_hide();
		}, 100);
	});
}

/** Push the current board with a string to the participants of the current session **/
function activity_share(activityString) {
	sharedDocumentId = ""; // Action from a script, do not enable slide follow
	session_set("open:" + (authorid !== "" ? authorid : userid)  + "/" + docid + "_0" + (typeof activityString == "undefined" ? "" : ":" + activityString));
}


