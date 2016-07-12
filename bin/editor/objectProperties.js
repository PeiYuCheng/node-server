
// --------------------------------- DIALOG


//var propertiesAdvanced = false;
//var current_action_interaction = "none";
//interaction_label = {
//	"none": "Fixed position",
//	"xy": "Can be moved"
//}

function action_dialog_isVisible() { 
	return(DOM("PROPERTIES").style.display === "block");
}

function action_dialog_hide() {
	DOM("PROPERTIES").style.display = "none";
}

var grid_size = 40;
var current_show_grid = memget("editor_show_grid") !== "false";
var current_snap_grid = memget("editor_snap_grid") === "true";

function action_dialog_show() {
	if(selection !== null) {
		DOM("ACTION_NAME").value = selection.hasAttribute("uid")? selection.getAttribute("uid") : "";
		DOM("ACTION_EASY").value = selection.hasAttribute("aclke")? deCode(selection.getAttribute("aclke")) : "";
		//reflectFieldsContentInTabs();
		
		var current_action_interaction = (selection.getAttribute("interaction") != "xy" ? "none" : "xy");

		var objectType = selection.id.split("_")[0];
		
		H = "";
		H += getSwitchCode("EDITLOCK_SWITCH", "Lock position in edit mode", "action_dialog_editlock()", selection.getAttribute("editlock") === "true");
		H += getSwitchCode("FIXED_SWITCH", "User can move this object", "action_dialog_interaction()", current_action_interaction === "xy");
		H += getSwitchCode("VPLAY_SWITCH", "Visible in play mode", "action_dialog_vplay()", selection.getAttribute("runtimevisible") !== "false");
		H += getSwitchCode("VPREVIEW_SWITCH", "Visible in preview", "action_dialog_vpreview()", selection.getAttribute("previewvisible") !== "false");
		
console.log(objectType)
		if(objectType === "IMG") H += getSwitchCode("VZOOM_SWITCH", "Magnify on click", "action_dialog_vzoom()", selection.getAttribute("autozoom") === "true");
		if(objectType === "TXTCT") H += getSwitchCode("VCOLUMN_SWITCH", "Multi-column", "action_dialog_vcolumn()", selection.style.columnCount !== "");
		
		
		DOM("OBJECT_PARAMS").innerHTML = H;
		
		DOM("DOC_TAB").style.display = "none";
		DOM("DOC_TAB_BOARDMORE").style.display ="none";
		DOM("EASY_TAB").style.display = "block";// propertiesAdvanced ? "none" : "block";
		
	} else {
		DOM("DOC_TAB").style.display = "block";//propertiesAdvanced ? "none" : "block";
		DOM("EASY_TAB").style.display ="none";
		
		DOM("DOC_TAB_BOARDMORE").style.display ="block";
		
		var H = "";
		H += getSwitchCode("GRID_SHOW_SWITCH", "Show grid", "action_dialog_vgrid_show()", current_show_grid);
		H += getSwitchCode("GRID_SNAP_SWITCH", "Snap to grid", "action_dialog_vgrid_snap()", current_snap_grid);
		DOM("DOC_TAB_BOARDMORE").innerHTML =H;
	}
	reflectFieldsContentInTabs();
	DOM("PROPERTIES").style.display = "block";
	DOM("PROPERTIES").style.touchAction = "none";
}

function reflectFieldsContentInTabs() {
	
	if(selection === null) {
		var size = (document.body.innerHTML.length / 1024);
		size = size < 1024 ? (size < 10 ? (~~(size * 10) / 10) : ~~size) + " Kb" : (~~((size / 1024) * 10) / 10) + " Mb";
		var Ssize = (currentSlide.innerHTML.length / 1024);
		Ssize = Ssize < 1024 ? (Ssize < 10 ? (~~(Ssize * 10) / 10) : ~~Ssize) + " Kb" : (~~((Ssize / 1024) * 10) / 10) + " Mb";
		DOM("DOC_TAB_BOTTTOM").innerHTML = "<div style='line-height: 40px;'>File: " + size + " - Slide: " + Ssize + "</div>";
		DOM("EASY_TAB_BOTTTOM").style.display = "block";
	} else {
		DOM("EASY_TAB_BOTTTOM").style.display = "none";
	}
	if(devwin !== null) {
		var targetElement = selection === null ? DOM("GLOBAL_E") : selection;
		devwin.DOM("ACTION_BT_ainit").style.fontFamily = targetElement.hasAttribute("ainit") ? "bold" : "light";
		devwin.DOM("ACTION_BT_atick").style.fontFamily = targetElement.hasAttribute("atick") ? "bold" : "light";
		devwin.DOM("ACTION_BT_aclk").style.fontFamily = targetElement.hasAttribute("aclk") ? "bold" : "light";
		devwin.DOM("ACTION_BT_astart").style.fontFamily = targetElement.hasAttribute("astart") ? "bold" : "light";
		devwin.DOM("ACTION_BT_amv").style.fontFamily = targetElement.hasAttribute("amv") ? "bold" : "light";
		devwin.DOM("ACTION_BT_aend").style.fontFamily = targetElement.hasAttribute("aend") ? "bold" : "light";
	}
}

function action_dialog_vgrid_show() {
	current_show_grid = getSwitchState("GRID_SHOW_SWITCH") ? false : true;
	setSwitchState("GRID_SHOW_SWITCH", current_show_grid);
	if(!current_show_grid) current_snap_grid = current_show_grid == false ? false : current_snap_grid;
	DOM("EGRID").style.display = current_show_grid ? "block" : "none";
	setSwitchState("GRID_SNAP_SWITCH", current_snap_grid);
	memset("editor_show_grid", current_show_grid ? "true" : "false");
	memset("editor_snap_grid", current_snap_grid ? "true" : "false");
}
function action_dialog_vgrid_snap() {
	current_snap_grid = getSwitchState("GRID_SNAP_SWITCH") ? false : true;
	setSwitchState("GRID_SNAP_SWITCH", current_snap_grid);
	if(current_snap_grid) current_show_grid = current_snap_grid == true ? true : current_show_grid;
	setSwitchState("GRID_SHOW_SWITCH", current_show_grid);
	DOM("EGRID").style.display = current_show_grid ? "block" : "none";
	memset("editor_show_grid", current_show_grid ? "true" : "false");
	memset("editor_snap_grid", current_snap_grid ? "true" : "false");
}

function action_dialog_vcolumn() {
	var value = getSwitchState("VCOLUMN_SWITCH") ? false : true;
	setSwitchState("VCOLUMN_SWITCH", value);
	if(value) {
		selection.style.columnCount = "2";
		textAutoColumns(selection);
	} else {
		selection.style.columnCount = "";
	}
}
function action_dialog_vzoom() {
	var value = getSwitchState("VZOOM_SWITCH") ? false : true;
	setSwitchState("VZOOM_SWITCH", value);
	if(value) {
		selection.setAttribute("autozoom", "true");
	} else {
		if(selection.hasAttribute("autozoom")) selection.removeAttribute("autozoom");
	}
}
function action_dialog_vpreview() {
	var value = getSwitchState("VPREVIEW_SWITCH") ? false : true;
	setSwitchState("VPREVIEW_SWITCH", value);
	if(value) {
		if(selection.hasAttribute("previewvisible")) selection.removeAttribute("previewvisible");
	} else {
		selection.setAttribute("previewvisible", "false");
	}
}
function action_dialog_vplay() {
	var value = getSwitchState("VPLAY_SWITCH") ? false : true;
	setSwitchState("VPLAY_SWITCH", value);
	if(value) {
		if(selection.hasAttribute("runtimevisible")) selection.removeAttribute("runtimevisible");
	} else {
		selection.setAttribute("runtimevisible", "false");
	}
}
function action_dialog_editlock() {
	var value = getSwitchState("EDITLOCK_SWITCH") ? false : true;
	setSwitchState("EDITLOCK_SWITCH", value);
	if(!value) {
		if(selection.hasAttribute("editlock")) selection.removeAttribute("editlock");
	} else {
		selection.setAttribute("editlock", "true");
	}
}
function action_dialog_interaction() {
	var current_action_interaction = getSwitchState("FIXED_SWITCH") ? "none" : "xy";
	setSwitchState("FIXED_SWITCH", current_action_interaction === "xy");
	selection.setAttribute("interaction", current_action_interaction);
}
function action_dialog_ok() {
	DOM("PRO_BT_CLOSE").style.backgroundColor = "#EAEAEA";
	setTimeout(function() {
		DOM("PRO_BT_CLOSE").style.backgroundColor = "transparent";
		setTimeout(function() {
			DOM("PROPERTIES").style.display = "none";
		}, 25);
	}, 150);
}

function propLiveChange(oid) {
	if(selection === null) {
		if(oid === "DOC_NAME_IN") {
			document.title = DOM("DOC_NAME_IN").value.trim();
		}
		if(oid === "DOC_DESC_IN") {
			board_description = DOM("DOC_DESC_IN").value.trim().split("\n").join("<br>");
		}
	} else {
		element = DOM(oid);

		if(oid == "ACTION_EASY") {
			var actionCode = enCode(DOM("ACTION_EASY").value);
			action_assign_code(selection, "aclke", actionCode);
		}
		
		if(oid == "ACTION_NAME") {
			var uid = DOM("ACTION_NAME").value.trim().toUpperCase();
			uid = uid.replace(/\W+/g, "");
			if(uid != DOM("ACTION_NAME").value) {
				DOM("ACTION_NAME").value = uid;
			}
			selection.setAttribute("uid", uid);
		}
	}
	reflectFieldsContentInTabs();
}

function action_assign_code(element, actionName, actionCode) {
	if(element === null) element = DOM("GLOBAL_E");
	if(exists(element)) {
		if(actionCode.trim() == "") {
			element.removeAttribute(actionName);
		} else {
			element.setAttribute(actionName, actionCode);
		}
	}
}

var devwin = null;
function devwin_show() {
	DOM("ADV_CODE_BUTTON").style.backgroundColor = "#EAEAEA";
	setTimeout(function() {
		DOM("ADV_CODE_BUTTON").style.backgroundColor = "transparent";

		if(devwin !== null) {
				devwin.focus();
		} else {
			devwin = window.open("/bin/editor/devwin.html", "_blank", "toolbar=yes,scrollbars=yes,location=no,resizable=yes,top=100,left=50,width=1000,height=600");
		}
	}, 150);
}

function action_easy() {
	var tabs = document.querySelectorAll("[name=NACTION_TAB]");
	if(tabs !== null) {
		var count = tabs.length;
		for(var index = 0; index < count; index++) {
			tabs[index].style.display = "none";
		}
	}
	DOM("EASY_TAB").style.display = selection == null ? "none" : "block";
	DOM("DOC_TAB").style.display = selection == null ? "block" : "none";
	DOM("PROPERTIES").style.width = "400px";
	DOM("PROPERTIES").style.height = "400px";
}
