
var iconsBank = "";
var server_grids_age = 0;
var currentGrid = 0;
var defaultGrids = [];
defaultGrids[0] = "~!~1466560396958~~/data/users/gmailcompixinuum/boards/1459478956618/board.html~~Colorate my classroom~~Design/Color_Spray.svg~!~1466223868008~~/data/users/gmailcompixinuum/boards/1464257912606/board.html~~Quick Poll~~The_Essentials/Time.svg~!~1466224738094~~/apps/troubleshoot/~~Troubleshooting~~Tech/Motherboard.svg~!~1466224773317~~/apps/doc/~~Ormiboard Help~~The_Essentials/Help.svg~!~1466224817111~~/apps/doc/builder.php~~Developer Reference~~Baby/Story_Book.svg~!~1466225285524~~/apps/admin/import/import.html~~Import Tool~~Arrows/Import_In.svg~!~1466225586364~~/apps/multi/~~Multi~~Tech/Curved_Display.svg~!~1466225699157~~/data/users/gmailcompixinuum/boards/1465870000007/board.html~~Demo Kit~~The_Essentials/Presentation.svg~!~1466614645332~~/data/users/gmailcompixinuum/boards/1466614645332/board.html~~Devices Management~~Interactions/Lock_Smartphone.svg~!~~!~1466422208379~~/apps/admin/errorlog.php~~Error Log~~Design/Spiral_Tool.svg~!~1466866480508~~http://exoroot.com/rsc/obp.apk~~Ormiboard for Android~~Arrows/Download.svg";

var grids = "";

var getGridsFromMem;
var defaultIcon = "Arrows/Expand_Nucleum.svg";

var menu_item_hideStamp = null;

var i_menu = '<svg version="1.1" fill="#95a5a6" width="20px" height="20px" viewBox="150 0 700 200"><path d="M237 250.5l147 147 147-147 45 45-192 192-192-192z"></path></svg>';
// var i_plus = '<div  id="BTADD" class="iconimage"><svg fill="#95a5a6" width="50px" height="50px" viewBox="0 0 640 640"><path d="M592 320h-272v-272c0-8.836-7.164-16-16-16s-16 7.164-16 16v272h-272c-8.836 0-16 7.163-16 16s7.164 16 16 16h272v272c0 8.837 7.164 16 16 16s16-7.163 16-16v-272h272c8.837 0 16-7.163 16-16s-7.163-16-16-16z"></path></svg></div>';
var endOfCat = Array(6).join("<div class='iconbox' style='height: 0px;'></div>");


function grid_init() {
	server_grids_age = int(memget("server_grids_age"));
	if(isNaN(server_grids_age)) server_grids_age = 0;
	getGridsFromMem = memget("grids");
	if(getGridsFromMem !== null && getGridsFromMem !== "") {
		grids = getGridsFromMem.split("~#~");
	} 
	
	grid_build();
}


function cat_click_grid() {
	DOM("GRID").style.display = "block";
	DOM("GRIDICON").setAttribute("fill", "#D32B4F");
	DOM("TITLE_SHARED").className = "cat_tab";
	DOM("TITLE_LOCAL").className = "cat_tab";	
	DOM("FILES_SHARED").style.display = "none";
	DOM("FILES_LOCAL").style.display = "none";	
	DOM("INFO_HEADER_CONTAINER").style.display = "none";
	currentTab = "grid";
	memset("home_tab", currentTab);	
}


function grid_build() {
	var H = "";
	if(userid === "" &&  grids === "") {
		grids = defaultGrids;
	}
	if(server_grids_age > 0 && grids === "") {
		grids = defaultGrids;
	}
	if(grids === "") {
		H += "<div class='container' style='color:rgba(0,0,0,.5); font-size: 16px;'>Loading...</div>";
	} else {
		icons = grids[currentGrid].split("~!~");
		var count = icons.length;

		H += "<div id='FMENU' class='appmenu'>"
		H += "<div id='FMENU_EDIT' onclick='editIconButton()' class='appmenuitem'>Edit</div>"
		H += "<div id='FMENU_REMOVE' onclick='removeIconButton()' class='appmenuitem'>Remove</div>"
		H += "</div>"

		H += "<div class='container' onclick='menu_item_hide();'>";
			H += "<div class='iconscontainer'>";
			for(var index = 0; index < count; index++) {
				if(icons[index].indexOf("~~") > 0) {
					var item = icons[index].split("~~");
					var id = item[0];
					H += "<div class='iconbox'>";
					if(userid !== "") {
						H += "<div  id='T"+id+"' class='uimenubt' onclick='event.stopPropagation(); menu_item_click("+id+")'>" + i_menu + "</div>";
					}
					H += "<img onclick='home_item_click("+id+", \""+item[1]+"\");' id='I"+id+"' class='iconimage' src='/rsc/icons/" + item[3] +"'><br>";
					H += item[2];
					H += "</div>";
				}
			}
			
			//if(count > 4) H += endOfCat;
			
			H += "</div>";		
		H += "</div>";	
	}
	DOM("GRID").innerHTML = H;
}

function grid_add() {
	url_edit();
}

// Icon menu
var menuSelectionId = null;
function menu_item_click(id) {
	if(DOMexists("FMENU") && DOM("FMENU").style.display === "block" && menuSelectionId === id) {
		menu_item_hide();
	} else {
		menuSelectionId = id;
		var brect = document.body.getBoundingClientRect();
		var mrect = DOM("T" + id).getBoundingClientRect();
		menux = mrect.left - brect.left + 10;
		menuy = mrect.top - brect.top;
		var w = document.documentElement.clientWidth;
		var imw = 120;
		if(menux + imw > w) {
			menux = w - imw;
		}
		DOM("FMENU").style.left = (menux) + "px";
		DOM("FMENU").style.top = (menuy + 25) + "px";
		DOM("FMENU").style.display = "block";
		DOM("T" + id).style.opacity = 1;
		menu_item_hideStamp = Date.now() + 3500;
	}
}
function menu_item_hide() {
	if(DOMexists("FMENU")) {
		DOM("FMENU").style.display = "none";
	}
	menu_item_hideStamp = null;
}

// Icon action
function home_item_click(id, url) {
	DOM("I" + id).className = "iconimageSelected";
	setTimeout(function() {
		document.location = url;
		setTimeout(function() {
			DOM("I" + id).className = "iconimage";	
		}, 250);
	}, 50);
}

function editIconButton() {
	DOM('FMENU_EDIT').className = "appmenuitemSelected";
	setTimeout(function() {
		DOM('FMENU_EDIT').className = "appmenuitem";
		if(exists(menuSelectionId)) {
			menu_item_hide();
			url_edit(menuSelectionId);
		}
	}, 150);
}

function removeIconButton() {
	DOM('FMENU_REMOVE').className = "appmenuitemSelected";
	setTimeout(function() {
		DOM('FMENU_REMOVE').className = "appmenuitem";
		if(exists(menuSelectionId)) {
			menu_item_hide();
			removeIcon(menuSelectionId);
		}
	}, 150);
}

function removeIcon(removeid) {	
	var newIcons = "";
	icons = grids[currentGrid].split("~!~");
	var count = icons.length;
	for(var index = 0; index < count; index++) {
		if(icons[index] !== "") {
			var item = icons[index].split("~~");
			var id = item[0];
			if(~~removeid !== ~~id) {
				newIcons += icons[index] + "~!~";
			}
		}
	}
	grids[currentGrid] = newIcons;
	grid_build(document.body);
	saveGrids();
}

function saveGrids() {
	var gridsString = grids.join("~#~");
	gridsString = str_replace(gridsString, "~#~~#~", "~#~");
	memset("grids", gridsString);
	query("savegrids&userid=" + userid + "&age=" + server_grids_age + "&grids=" + gridsString, function(status, result) {
		if(status && result.indexOf("~$~") > -1) {
			var resplit = result.split("~$~");
			if(resplit[0] === "AGE") {
				server_grids_age = resplit[1];
				memset("server_grids_age", server_grids_age);
			}
		}
	});
}

function getGridItemInfo(id) {
	var links = grids[currentGrid].split("~!~");
	var count = links.length;
	var found = false;
	for(var index = 0; index < count; index++) {
		if(links[index] !== "") {
			var item = links[index].split("~~");
			if(int(item[0]) === int(id)) return item;
		}
	}
	return null;
}
