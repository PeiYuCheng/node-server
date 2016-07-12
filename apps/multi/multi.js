var childOf = (window.frameElement !== null ? window.frameElement.id : "");
function memset(mkey, mvalue) { localStorage.setItem((childOf == "" ? "" : childOf + "-)") + mkey, mvalue);}
function memget(mkey) {return localStorage.getItem((childOf == "" ? "" : childOf + "-)") + mkey);}

function resize_table_2() {
	DOM("PLOT").style.left = "50%";
	DOM("PLOT").style.top = "65%";

	DOM("DO").style.webkitTransform = "rotate(90deg) ";
	DOM("DO").style.transform = "rotate(90deg) ";
	
	DOM("DO").style.transformOrigin = "top left";
	DOM("DO").style.webkitTransformOrigin = "top left";
	
	DOM("DO").style.left = ~~(scr.w / 2 - 1) + "px";
	DOM("DO").style.top = ~~(0) + "px";
	DOM("DO").style.width = ~~(scr.h) + "px";
	DOM("DO").style.height = ~~(scr.w / 2 - 1) + "px";
	
	DOM("FA").style.webkitTransform = "rotate(-90deg)";
	DOM("FA").style.transform = "rotate(-90deg)";
	
	DOM("FA").style.webkitTransformOrigin = "top left";
	DOM("FA").style.transformOrigin = "top left";
	
	DOM("FA").style.left = ~~(scr.w / 2) + "px";
	DOM("FA").style.top = ~~(scr.h) + "px";
	DOM("FA").style.width = ~~(scr.h) + "px";
	DOM("FA").style.height = ~~(scr.w / 2) + "px";
	
	DOM("MI").style.webkitTransform = "rotate(90deg)";
	DOM("MI").style.transform = "rotate(90deg)";
	
	DOM("MI").style.left = ~~(scr.w / 2) + "px";
	DOM("MI").style.top = "60%";
	DOM("MI").style.width = ~~(0) + "px";
	DOM("MI").style.height = ~~(0) + "px";	
	
	DOM("RE").style.webkitTransform = "rotate(-90deg)";
	DOM("RE").style.transform = "rotate(-90deg)";
	DOM("RE").style.left = ~~(scr.w / 2) + "px";
	DOM("RE").style.top = "60%";
	DOM("RE").style.width = ~~(0) + "px";
	DOM("RE").style.height = ~~(0) + "px";	
	
	if(plot_open) {
		DOM("FDO").style.left = "45%";
		DOM("FDO").style.top = "30%";
		
		DOM("FRE").style.left = "50%";
		DOM("FRE").style.top = "150%";
		
		DOM("FMI").style.left = "50%";
		DOM("FMI").style.top = "150%";
		
		DOM("FFA").style.left = "55%";
		DOM("FFA").style.top = "30%";
		
		DOM("FS").style.left = "50%";
		DOM("FS").style.top = "30%";		
		
		DOM("HM").style.left = "50%";
		DOM("HM").style.top = "45%";
		
	} else {
		DOM("FDO").style.left = "40%";
		DOM("FDO").style.top = "-200px";

		DOM("FRE").style.left = "60%";
		DOM("FRE").style.top = "150%";
		
		DOM("FMI").style.left = "50%";
		DOM("FMI").style.top = "150%";
		
		DOM("FFA").style.left = "50%";
		DOM("FFA").style.top = "-200px";
		
		DOM("FS").style.left = "50%";
		DOM("FS").style.top = "-200px";
		
		DOM("HM").style.left = "50%";
		DOM("HM").style.top = "-200px";		
	}
}

function resize_table_4() {
	DOM("PLOT").style.left = "50%";
	DOM("PLOT").style.top = "50%";

	DOM("DO").style.transform = "rotate(180deg) ";
	DOM("DO").style.transformOrigin = "top left";
	
	DOM("DO").style.webkitTransform = "rotate(180deg) ";
	DOM("DO").style.webkitTransformOrigin = "top left";
	
	DOM("DO").style.left = ~~(scr.w / 2) + "px";
	DOM("DO").style.top = ~~(scr.h / 2) + "px";
	DOM("DO").style.width = ~~(scr.w / 2) + "px";
	DOM("DO").style.height = ~~(scr.h / 2) + "px";
	
	DOM("FA").style.transform = "rotate(180deg) ";
	DOM("FA").style.webkitTransform = "rotate(180deg) ";
	DOM("FA").style.webkitTransformOrigin = "top left";
	DOM("FA").style.transformOrigin = "top left";
	DOM("FA").style.left = ~~(scr.w  + 1) + "px";
	DOM("FA").style.top = ~~(scr.h / 2) + "px";
	DOM("FA").style.width = ~~(scr.w / 2 - 1) + "px";
	DOM("FA").style.height = ~~(scr.h / 2) + "px";

	DOM("MI").style.transform = "rotate(0deg)";
	DOM("MI").style.webkitTransform = "rotate(0deg)";
	DOM("MI").style.left = ~~(0) + "px";
	DOM("MI").style.top = ~~(scr.h / 2 + 1) + "px";
	DOM("MI").style.width = ~~(scr.w / 2) + "px";
	DOM("MI").style.height = ~~(scr.h / 2 - 1) + "px";

	DOM("RE").style.webkitTransform = "rotate(0deg)";
	DOM("RE").style.transform = "rotate(0deg)";
	DOM("RE").style.left = ~~(scr.w / 2 + 1) + "px";
	DOM("RE").style.top = ~~(scr.h / 2 + 1) + "px";
	DOM("RE").style.width = ~~(scr.w / 2 - 1) + "px";
	DOM("RE").style.height = ~~(scr.h / 2 - 1) + "px";
	
	if(plot_open) {
		DOM("FDO").style.left = "25%";
		DOM("FDO").style.top = "40%";
		
		DOM("FRE").style.left = "75%";
		DOM("FRE").style.top = "60%";
		
		DOM("FMI").style.left = "25%";
		DOM("FMI").style.top = "60%";
		
		DOM("FFA").style.left = "75%";
		DOM("FFA").style.top = "40%";
		
		DOM("FS").style.left = "50%";
		DOM("FS").style.top = "25%";
		
		
		DOM("HM").style.left = "50%";
		DOM("HM").style.top = "10%";		
		
		
	} else {
		DOM("FDO").style.left = "40%";
		DOM("FDO").style.top = "-200px";

		DOM("FRE").style.left = "60%";
		DOM("FRE").style.top = "150%";
		
		DOM("FMI").style.left = "40%";
		DOM("FMI").style.top = "150%";
		
		DOM("FFA").style.left = "60%";
		DOM("FFA").style.top = "-200px";
		
		DOM("FS").style.left = "50%";
		DOM("FS").style.top = "-200px";
		
		
		DOM("HM").style.left = "50%";
		DOM("HM").style.top = "-200px";		
	}		
}

function resize_wall_4() {
	DOM("PLOT").style.left = "50%";
	DOM("PLOT").style.top = "50%";

	DOM("DO").style.webkitTransform = "rotate(0deg)";
	DOM("DO").style.transform = "rotate(0deg)";
	DOM("DO").style.left = ~~(0) + "px";
	DOM("DO").style.top = ~~(0) + "px";
	DOM("DO").style.width = ~~(scr.w / 2) + "px";
	DOM("DO").style.height = ~~(scr.h / 2) + "px";
	
	DOM("RE").style.webkitTransform = "rotate(0deg)";
	DOM("RE").style.transform = "rotate(0deg)";
	DOM("RE").style.left = ~~(scr.w / 2 + 1) + "px";
	DOM("RE").style.top = ~~(scr.h / 2 + 1) + "px";
	DOM("RE").style.width = ~~(scr.w / 2 - 1) + "px";
	DOM("RE").style.height = ~~(scr.h / 2 - 1) + "px";
	
	DOM("MI").style.webkitTransform = "rotate(0deg)";
	DOM("MI").style.transform = "rotate(0deg)";
	DOM("MI").style.left = ~~(0) + "px";
	DOM("MI").style.top = ~~(scr.h / 2 + 1) + "px";
	DOM("MI").style.width = ~~(scr.w / 2) + "px";
	DOM("MI").style.height = ~~(scr.h / 2 - 1) + "px";

	DOM("FA").style.webkitTransform = "rotate(0deg)";
	DOM("FA").style.transform = "rotate(0deg)";
	DOM("FA").style.left = ~~(scr.w / 2 + 1) + "px";
	DOM("FA").style.top = ~~(0) + "px";
	DOM("FA").style.width = ~~(scr.w / 2 - 1) + "px";
	DOM("FA").style.height = ~~(scr.h / 2) + "px";
	
	if(plot_open) {
		DOM("FDO").style.left = "25%";
		DOM("FDO").style.top = "10%";
		
		DOM("FRE").style.left = "75%";
		DOM("FRE").style.top = "60%";
		
		DOM("FMI").style.left = "25%";
		DOM("FMI").style.top = "60%";
		
		DOM("FFA").style.left = "75%";
		DOM("FFA").style.top = "10%";
		
		DOM("FS").style.left = "50%";
		DOM("FS").style.top = "30%";
		
		
		DOM("HM").style.left = "50%";
		DOM("HM").style.top = "15%";		
		
	} else {
		DOM("FDO").style.left = "40%";
		DOM("FDO").style.top = "-200px";

		DOM("FRE").style.left = "60%";
		DOM("FRE").style.top = "150%";
		
		DOM("FMI").style.left = "40%";
		DOM("FMI").style.top = "150%";
		
		DOM("FFA").style.left = "60%";
		DOM("FFA").style.top = "-200px";
		
		DOM("FS").style.left = "50%";
		DOM("FS").style.top = "-200px";
		
		
		DOM("HM").style.left = "50%";
		DOM("HM").style.top = "-200px";		
	}	
}

function resize_wall_2() {
	DOM("PLOT").style.left = "50%";
	DOM("PLOT").style.top = "65%";

	DOM("DO").style.transform = "rotate(0deg)";
	DOM("DO").style.webkitTransform = "rotate(0deg)";
	DOM("DO").style.left = ~~(0) + "px";
	DOM("DO").style.top = ~~(0) + "px";
	DOM("DO").style.width = ~~(scr.w / 2 - 1) + "px";
	DOM("DO").style.height = ~~(scr.h) + "px";

	DOM("FA").style.transform = "rotate(0deg)";
	DOM("FA").style.webkitTransform = "rotate(0deg)";
	DOM("FA").style.left = ~~(scr.w / 2) + "px";
	DOM("FA").style.top = ~~(0) + "px";
	DOM("FA").style.width = ~~(scr.w / 2) + "px";
	DOM("FA").style.height = ~~(scr.h) + "px";
	
	DOM("MI").style.transform = "rotate(-90deg)";
	DOM("MI").style.webkitTransform = "rotate(-90deg)";
	DOM("MI").style.left = ~~(scr.w / 2) + "px";
	DOM("MI").style.top = ~~(scr.h / 2) + "px";
	DOM("MI").style.width = ~~(0) + "px";
	DOM("MI").style.height = ~~(0) + "px";	
	
	DOM("RE").style.transform = "rotate(90deg)";
	DOM("RE").style.webkitTransform = "rotate(90deg)";
	DOM("RE").style.left = ~~(scr.w / 2) + "px";
	DOM("RE").style.top = "60%";
	DOM("RE").style.width = ~~(0) + "px";
	DOM("RE").style.height = ~~(0) + "px";

	if(plot_open) {
		DOM("FDO").style.left = "25%";
		DOM("FDO").style.top = "10%";
		
		DOM("FRE").style.left = "50%";
		DOM("FRE").style.top = "150%";
		
		DOM("FMI").style.left = "50%";
		DOM("FMI").style.top = "150%";
		
		DOM("FFA").style.left = "75%";
		DOM("FFA").style.top = "10%";
		
		DOM("FS").style.left = "50%";
		DOM("FS").style.top = "30%";
		
		DOM("HM").style.left = "50%";
		DOM("HM").style.top = "45%";		
	} else {
		DOM("FDO").style.left = "25%";
		DOM("FDO").style.top = "-200px";

		DOM("FRE").style.left = "50%";
		DOM("FRE").style.top = "150%";
		
		DOM("FMI").style.left = "50%";
		DOM("FMI").style.top = "150%";
		
		DOM("FFA").style.left = "75%";
		DOM("FFA").style.top = "-200px";
		
		DOM("FS").style.left = "50%";
		DOM("FS").style.top = "-200px";
		
		
		DOM("HM").style.left = "50%";
		DOM("HM").style.top = "-200px";		
	}
}

var pageZoomActive = "";
function FDO_click() {
	hideAllZoomDots();
	pageZoomActive = pageZoomActive == "DO" ? "" : "DO";
	DOM("FDO").innerHTML = pageZoomActive == "DO" ? iunsize : isize;
	resize();
}

function FRE_click() {
	hideAllZoomDots();
	pageZoomActive = pageZoomActive == "RE" ? "" : "RE";
	resize();
}

function FMI_click() {
	hideAllZoomDots();
	pageZoomActive = pageZoomActive == "MI" ? "" : "MI";
	resize();
}

function FFA_click() {
	hideAllZoomDots();
	pageZoomActive = pageZoomActive == "FA" ? "" : "FA";
	resize();
}


function hideAllZoomDots() {
	DOM("FDO").style.left = "50%";
	DOM("FDO").style.top = "-150%";
	
	DOM("FRE").style.left = "50%";
	DOM("FRE").style.top = "150%";
	
	DOM("FMI").style.left = "50%";
	DOM("FMI").style.top = "150%";
	
	DOM("FFA").style.left = "50%";
	DOM("FFA").style.top = "-150%";
	
	DOM("FS").style.left = "50%";
	DOM("FS").style.top = "150%";
	
	DOM("HM").style.left = "50%";
	DOM("HM").style.top = "150%";	
}

// -------------

var isFull = false;
function fullscreen_switch() {
	if( (screen.availHeight || screen.height-30) <= window.innerHeight || isFull === true) {
		fullscreen_end();
		DOM("FS").innerHTML = izoom;
		isFull = false;
	} else {
		fullscreen_start();
		DOM("FS").innerHTML = iunzoom;
		isFull = true;
	}
	setTimeout(function() {
		overlay_click();
	}, 150);

}

function fullscreen_start() {
	var elem = document.body;
	if (elem.requestFullscreen) {
		elem.requestFullscreen();
	} else if (elem.msRequestFullscreen) {
		elem.msRequestFullscreen();
	} else if (elem.mozRequestFullScreen) {
		elem.mozRequestFullScreen();
	} else if (elem.webkitRequestFullscreen) {
		elem.webkitRequestFullscreen();
	}
}

function fullscreen_end() {
	if (document.exitFullscreen) {
	      document.exitFullscreen();
	    } else if (document.msExitFullscreen) {
	      document.msExitFullscreen();
	    } else if (document.mozCancelFullScreen) {
	      document.mozCancelFullScreen();
	    } else if (document.webkitExitFullscreen) {
	      document.webkitExitFullscreen();
	    }	
}


