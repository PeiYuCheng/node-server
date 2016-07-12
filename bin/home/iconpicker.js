
var iconPickerCallback = null;

function iconpicker_open(get_iconPickerCallback) {
	iconPickerCallback = get_iconPickerCallback;
	if(!exists(DOM("ICONPICKER_CONTAINER"))) {
		var H = "";
		H += "<div id='ICONPICKER_CONTAINER' class='iconpicker_container'></div>";
		document.body.insertAdjacentHTML("beforeend", H);
	} else {
		DOM("ICONPICKER_CONTAINER").innerHTML = "";
		DOM("ICONPICKER_CONTAINER").style.display = "block";
	}
	var opts = {
		lines: 9, length: 7, width: 10, radius: 17, scale: 0.75, corners: 1, color: '#d35400', opacity: 0.1, rotate: 11, direction: 1,
		speed: 1.2, trail: 64, fps: 20, zIndex: 2e9, className: 'spinner', top: '50%', left: '50%', shadow: false, hwaccel: false, position: 'absolute'
	}
	var spinner = new Spinner(opts).spin(DOM("ICONPICKER_CONTAINER"));
	setTimeout(function() {
		query("get_icons", function(status, result) {
			iconsBank = result.split("*");
			var iconCategory = "";
			var count = iconsBank.length;
			
			var H = "<div class='iconpicker_sub'>";
			var iconTagOpen = false;
			for(var index = 0; index < (count > 3500 ? 3500 : count); index++) {
				if(iconsBank[index] !== "") {
					if(iconsBank[index][0] == ":") {
						H += endOfCat;
						iconCategory = iconsBank[index].substr(1);
						if(iconTagOpen) H += "</div>";
						H += "<div class='caticons'>" + iconsBank[index].substr(1).split("_").join(" ") + "</div>";
						H += "<div class='iconscontainer'>";
						iconTagOpen = true;
					} else {
						H += "<div onclick='iconpicker_iconClick(\""+ iconCategory + "/" + iconsBank[index] +"\")' class='iconbox'>";
						H += "<img class='iconimage' src='/rsc/icons/" + iconCategory + "/" + iconsBank[index]+"'><br>";
						H += iconsBank[index].split(".")[0].split("_").join(" ");
						H += "</div>";
					}
				}
			}
			H += endOfCat;
			H += "</div>";		
			DOM("ICONPICKER_CONTAINER").innerHTML = H;
		});
	});
}

function iconpicker_iconClick(iconurl) {
	if(exists(iconPickerCallback)) {
		iconPickerCallback(iconurl);
		DOM("ICONPICKER_CONTAINER").style.display = "none";
	}
}