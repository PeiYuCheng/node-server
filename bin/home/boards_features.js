

function cat_click_featured() {
	hideMenubar(false);
	DOM("TITLE_SHARED").className = "cat_tab_sel";
	DOM("TITLE_LOCAL").className = "cat_tab";
	DOM("FILES_SHARED").style.display = "block";
	DOM("FILES_LOCAL").style.display = "none";
	DOM("GRID").style.display = "none";
	DOM("GRIDICON").setAttribute("fill", "#9EAABB");
	DOM("INFO_HEADER_CONTAINER").style.display = "block";	
	document.body.scrollTop = 0;
	currentTab = "featured";
	memset("home_tab", currentTab);
}

// --------------------------------Featured list ---------------------

var featuredLoadingList = [];

function list_render_featured() {
	currentMenuKey = "";
	featuredLoadIndex = 0;
	var H = "";
	for(var index in featured) {
		H += "<div id='DIV_"+featured[index][0]+"' name='shared_preview_container' class='imagePreviewContainer' style='display: none;'>"
			+ "<img id='F_"+featured[index][0]+"' name='shared_preview' "
				+ "onload='this.parentNode.style.display = \"block\"; this.style.display = \"block\"; loadNextFeaturedPreview()' "
				+ "onerror='loadNextFeaturedPreview()' "
				+ "onclick='featured_click("+slidesLoadIndex+")' "
				+ "class='imagePreview' style='width:"+slideWidth+"px; height:"+slideHeight+"px;' "
			+ ">"
			+ previewMenu("F", slidesLoadIndex, " onclick='featured_click("+slidesLoadIndex+")' ", featured[index][3])
		+ "</div>";
		featuredLoadingList[slidesLoadIndex++] = [ featured[index][0], featured[index][1], featured[index][2], featured[index][3] ];
	}
	DOM("FILES_SHARED").innerHTML = H;
	resize();
}
function featured_click(index) {
	slide_click(index, "F", featuredLoadingList[index][0], featuredLoadingList[index][1], "/data/users/" + featuredLoadingList[index][1] + "/boards/" + featuredLoadingList[index][0] + "/board.html?nocache=" + Date.now());
}

function loadNextFeaturedPreview() {
	if(featuredLoadIndex < featuredLoadMax) {
		var file = "/data/users/"+ featuredLoadingList[featuredLoadIndex][1] + "/boards/" + featuredLoadingList[featuredLoadIndex][0] + "/0.jpg?" + featuredLoadingList[featuredLoadIndex][2];
		DOM("F_" + featuredLoadingList[featuredLoadIndex][0]).src = file + "&" + version;
		featuredLoadIndex++;
	}
}
