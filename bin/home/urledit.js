
var linkid, editedTitle, editedLink, editedIcon;

function url_edit(get_linkid) {
console.log("get_linkid: " + get_linkid)
	if(exists(get_linkid)) {
		var item = getGridItemInfo(get_linkid);
		if(item) {
			linkid = item[0];
			editedLink = item[1];
			editedTitle = item[2];
			editedIcon = item[3];
		}
	} else {
		linkid = createId(); 
		editedTitle = "";
		editedLink = "";
		editedIcon = defaultIcon;
		//DOM("INPUT_TITLE").value = "";
		//DOM("INPUT_URL").value = "";
	}
	create_url_edit();
	DOM("URL_EDIT").style.display = "block";
	setTimeout(function() {
		DOM("URL_EDIT").className = "urleditContainer_open";
		DOM("URL_EDIT_SUB").className = "urleditSub_open";
	}, 25);
}

function create_url_edit() {
	var H = "";
	H += "<div id='URL_EDIT' class='urleditContainer_close'>";
	H += "<div id='URL_EDIT_SUB' class='urleditSub_close'>";
	H += "<img id='ICON_PREVIEW' onclick='iconPreviewClick()' class='dlgicon' src='"+ROOT_URL+"/rsc/icons/"+editedIcon+"'>";
	H += "<div class='dlginputblock'>Title<div class='finputcontainer'><input id='INPUT_TITLE' value=\""+editedTitle+"\" class='finput' type='text'></div></div>";
	H += "<div class='dlginputblock'>Web Link<div class='finputcontainer'><input id='INPUT_URL' value=\""+editedLink+"\" class='finput' type='text' placeholder='http://'></div></div>";
	H += "<table class='dlgtbl' cellspacing=0 cellpadding=0><tr>";
	H += "<td id='BT_EDIT_CANCEL' class='dlgtblbt' onclick='url_edit_cancel()'>Cancel</td>";
	H += "<td id='BT_EDIT_OK' class='dlgtblbt' onclick='url_edit_ok()'>Ok</td>";
	H += "</tr></table>";
	H += "</div>";
	H += "</div>";
	DOM("URLEDIT_CONTAINER").innerHTML = H;
}

function url_edit_cancel() {
	DOM("BT_EDIT_CANCEL").className = "dlgtblbt_sel";
	setTimeout(function() {
		setTimeout(function() {
			DOM("BT_EDIT_CANCEL").className = "dlgtblbt";	
			
			setTimeout(function() {
				DOM("URL_EDIT").className = "urleditContainer_close";
				DOM("URL_EDIT_SUB").className = "urleditSub_close";
				setTimeout(function() {
					DOM("URL_EDIT").style.display = "none";
				}, 550);
			}, 25);
		}, 100);
	}, 50);
}

function url_edit_ok() {
	var url = DOM("INPUT_URL").value;
	url = url.split("#")[0];  // Prevent issues
	var title = DOM("INPUT_TITLE").value;
	title = title.split("#").join("");
	var newdata = linkid + "~~" + url + "~~" + title + "~~" + editedIcon;
	var links = grids[currentGrid].split("~!~");
	var count = links.length;
	var found = false;
	for(var index = 0; index < count; index++) {
		if(links[index] !== "") {
			var item = links[index].split("~~");
			if(~~linkid === ~~item[0]) {
				links[index] = newdata;
				found = true;
			} 
		}
	}
	if(!found) links.push(newdata);
	grids[currentGrid] = links.join("~!~");
	saveGrids();
	
	DOM("BT_EDIT_OK").className = "dlgtblbt_sel";
	setTimeout(function() {
		setTimeout(function() {
			DOM("BT_EDIT_OK").className = "dlgtblbt";	
			//DOM("URL_EDIT").style.display = "none";
			grid_build();
			
			setTimeout(function() {
				DOM("URL_EDIT").className = "urleditContainer_close";
				DOM("URL_EDIT_SUB").className = "urleditSub_close";
				setTimeout(function() {
					DOM("URL_EDIT").style.display = "none";
				}, 550);
			}, 25);

		}, 100);
	}, 50);	
}

function iconPreviewClick() {
	iconpicker_open(function(get_icon) {
		editedIcon = get_icon;
		DOM("ICON_PREVIEW").src = ROOT_URL + "/rsc/icons/" + editedIcon;
	});
}

