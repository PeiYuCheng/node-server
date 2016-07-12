
function cat_click_local() {
	hideMenubar(false);
	DOM("TITLE_SHARED").className = "cat_tab";
	DOM("TITLE_LOCAL").className = "cat_tab_sel";	
	DOM("FILES_SHARED").style.display = "none";
	DOM("FILES_LOCAL").style.display = "block";
	DOM("GRID").style.display = "none";
	DOM("GRIDICON").setAttribute("fill", "#9EAABB");
	DOM("INFO_HEADER_CONTAINER").style.display = "block";	
	document.body.scrollTop = 0;
	currentTab = "cloud";
	memset("home_tab", currentTab);	
}

// -------------------------------- User list ---------------------

var userLoadingList = [];

function server_loadSlidesList() {
	query("getlist=" + userid, function(status, result) {
		if(status) {
			server_userList = result;
			list_render_userList();
			list_render_featured();
			loadNextUserPreview();
		}
	});
 }

function list_render_userList() {
	currentMenuKey = "";
	var H = "";

	if(userid !== null && userid !== "") {
		//H += "<span id='FILE_ADD' onclick='newFile()' class='addSlide'>+</span>";
		if(server_userList !== "") {
			localSlides = server_userList.split("~@~").sort().reverse();
			userLoadIndex = 0;
			userLoadMax = 0;
			for(var index in localSlides) {
				if(localSlides[index] != "" &&  localSlides[index].indexOf("~!~") > -1) {
					var k = localSlides[index].split("~!~");
					var title = k[2] == "" ? "" : decodeURIComponent(k[2].split("~.~")[0]);		
					H += "<div name='shared_preview_container' class='imagePreviewContainer' style='display: none;'>"
						+ "<img  id='L_" + k[0] + "' name='shared_preview' "
						+ "onload='this.parentNode.style.display = \"block\"; this.style.display = \"block\"; loadNextUserPreview()' "
						+ "onerror='loadNextUserPreview()' "
						+ "onclick='userlist_click("+userLoadMax+")' "
						+ "class='imagePreview' style='width:"+slideWidth+"px; height:"+slideHeight+"px;' "
					+ ">"+previewMenu("L", userLoadMax, " onclick='userlist_click("+userLoadMax+")' ", title)
					+ "</div>";
					userLoadingList[userLoadMax++] = [ k[0], userid, k[1] ];
				}
			}
		}
	}
	if(H == "") {
		H = "<div style='font-size: 32px; font-family: light; color:#B0B0B0; text-align: center; font-family: light; padding-top: 40px;'>";
		H += "No saved board.<br><br>Your boards<br>will be listed here.";
		H += "</div>";
	}
	DOM("FILES_LOCAL").innerHTML = H;
	DOM("PREVIEW_CONTAINER").style.display = "block";
	resize();
}

function userlist_click(index) {
	slide_click(index, "L", userLoadingList[index][0], userid, "/data/users/" + userLoadingList[index][1] + "/boards/" + userLoadingList[index][0] + "/board.html?nocache=" + Date.now());
}

function loadNextUserPreview() {
	if(userLoadIndex < userLoadMax && userLoadMax > 0) {
		var ufile = userLoadingList[userLoadIndex][2];
		
		DOM("L_" + userLoadingList[userLoadIndex][0]).src = "/data/users/"
				+ userLoadingList[userLoadIndex][1] + "/boards/" 
				+ userLoadingList[userLoadIndex][0] + "/0.jpg?" + userLoadingList[userLoadIndex][2];
		userLoadIndex++;
	} else {
		loadNextFeaturedPreview();
		
	}
}
