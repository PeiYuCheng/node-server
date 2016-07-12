<!DOCTYPE html>
<HTML>
<HEAD>
	<title>Ormiboard Gallery</title>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
	<meta http-equiv="Pragma" content="no-cache" />
	<meta http-equiv="Expires" content="0" />
	<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1, maximum-scale=1">
	<meta name="apple-mobile-web-app-capable" content="no">
	<link type="text/css" rel="stylesheet" href="rsc/css/shared.css"/>
	<link type="text/css" rel="stylesheet" href="rsc/css/home.css"/>
</HEAD>

<BODY onload="main()" style='overflow-y: scroll; font-family: light; font-size:26px; text-align: center; background-color: #F4F5F8;'>

<script>
var masterSlideWidth = 320;
var masterSlideHeight = 180;
var masterSlideWidth = 390;
var masterSlideHeight = 219;
var slideWidth = masterSlideWidth;
var slideHeight = masterSlideHeight;
var slideRatio = slideWidth / slideHeight;
var server_userList = "";

var localSlides = [];
var hideMenubarAt = false;

var slidesLoadingList = [];
var slidesLoadIndex = 0;

var featuredLoadMax = 0;
var featuredLoadIndex = 0;

var userLoadIndex = 0;
var userLoadMax = 0;

var featured = [];
var feaidx = 0;
var version = 10;

var isFirefox = typeof InstallTrigger !== 'undefined';
var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
var isIE = /*@cc_on!@*/false || !!document.documentMode;
var isEdge = !isIE && !!window.StyleMedia;
var isChrome = (!!window.chrome && !!window.chrome.webstore) || (navigator.userAgent.indexOf("Chrome"));

function previewMenu(mkey, mindex, actionClick, ptitle) {
	if(ptitle === "") {
		return("<div id='MNU_"+mkey+mindex+"' class='previewMenu' "+actionClick+">" + menuIcon + "</div>");
	} else {
		H = "";
		H += "<table id='MNU_"+mkey+mindex+"' "+actionClick+" style='padding-top: 5px; height: 40px; width: 100%;' cellspacing=0 cellpadding=0>";
		H += "<tr>";
		H += "<td  name='shared_title' style='color: #606B7E; line-height: 20px; width: 0px; font-size: 20px; padding-left: 10px; padding-top: 5px; white-space: nowrap; text-overflow: ellipsis;display: block; overflow: hidden;'>" + ptitle + "</td>";
		H += "</tr>";
		H += "</table>";
		return(H);
	}
}

<?php



if($_SERVER['QUERY_STRING'] !== "") {
	$userid = strtolower($_SERVER['QUERY_STRING']);
	echo "var userid = '".$userid."';";
	
	$folder = "data/users/".$userid;
	
	if (file_exists($folder)) {
	
		echo 'var userinfo = "' . (@file_get_contents($folder . '/data/user.info')).'";';

		$folder = $folder."/boards/";
		if ($Bhandle = opendir($folder)) {
			while (false !== ($Bfile = readdir($Bhandle))) {
				if($Bfile !== "" && $Bfile !== "." && $Bfile !== "..") {
					//if (substr($Bfile, strrpos($Bfile, '.') + 1) == 'data') {

						if(file_exists(  $folder.$Bfile."/board.info")) {
							$binf = @file_get_contents($folder.$Bfile."/board.info");
							if(strlen($binf) > 3) {
								$binf = substr($binf, 0, strlen($binf) - 3);
							}
							echo 'featured[feaidx++] = [ "'.$Bfile.'", "'.$userid.'", 0, "' . ($binf === "" ? "Interactive Board" : $binf ).'"];';
						}
					//}
				}
			}
		}
		closedir($Bhandle);
	} else {
	
		echo 'var userinfo = "";';
	}
}



?>


</script>

<div id='HEADER_CNT' style='transition: all 1.5s; padding-top: 50px; padding-bottom: 50px; position: fixed; top: 0px; left: 0px ;right: 0px; z-index: 100; border-bottom: 2px solid #EDEFF5; background-color:rgba(255,255,255,.92); '>
<table cellspacing=0 cellpadding=0 style="width: 100%;">
	<tr>
		<td id='USERNAME' style='transition: all 1s; font-family: thin; font-size: 0px; letter-spacing: 0px; color: #000000;'></td>
	</tr><tr>
		<td id='SUBTITLE' style='transition: all .5s; font-family: light; font-size: 0px; line-height: 20px; letter-spacing: 2px; color: #808080;'>G&nbsp;A&nbsp;L&nbsp;L&nbsp;E&nbsp;R&nbsp;Y</td>
	</tr>
</table>
</div>

<div style='height: 150px;'></div>
<div id='INFO_HEADER_CONTAINER' style='position: relative;  margin:0 auto; overflow: hidden; '>
</div>

<div id='PREVIEW_CONTAINER' style='display: block; margin:0 auto; opacity: 1; width: 100%; transition: opacity 800ms; padding-top: 30px; padding-bottom: 70px;'>
	<div id='FILES_LOCAL' style='display: none; min-height: 210px; padding-top: 0px; padding-bottom: 30px; text-align: left; '></div>
	<div id='FILES_SHARED' style='display: block; padding-top: 0px; padding-bottom: 10px; text-align: left; '></div>
</div>
<div id='MENU' class='dropMenu'>
<div id='MENU_SUB' class='dropMenuSub'>
	<div id='MENU_OPEN' class='dropMenuItem' onclick='slide_open(this)'>Open</div>
	<div id='MENU_EDIT' class='dropMenuItem' onclick='slide_edit(this)'>Edit</div>
	<div id='MENU_COPY' class='dropMenuItem' onclick='slide_clone(this)'>Duplicate</div>
	<div id='MENU_DEL' class='dropMenuItem' style='border-bottom: 0px;' onclick='slide_delete(this)'>Delete</div>
</div>
</div>

<table id='MENU_L' style='display: none; position: absolute; overflow:hidden; color:#FFFFFF; height: 53px; font-family:thin; font-size: 20px; border: 0px; background-color:rgba(120,120,120,.9);' cellspacing=0 cellpadding=0>
	<tr>
		<td style='cursor: pointer; padding: 15px;' onclick='slide_delete(this)'><svg fill="#FFFFFF" style="width:18px; height:18px;" version="1.1" width="640" height="640" viewBox="0 0 640 640"><path d="M496 64h-112v-16c0-26.467-21.533-48-48-48h-64c-26.467 0-48 21.533-48 48v16h-112c-26.467 0-48 21.533-48 48v32c0 20.858 13.377 38.643 32 45.248v402.752c0 26.468 21.533 48 48 48h320c26.468 0 48-21.532 48-48v-402.752c18.623-6.605 32-24.39 32-45.248v-32c0-26.467-21.532-48-48-48zM256 48c0-8.822 7.178-16 16-16h64c8.822 0 16 7.178 16 16v16h-96v-16zM464 608h-320c-8.822 0-16-7.178-16-16v-400h352v400c0 8.822-7.178 16-16 16zM512 144c0 8.822-7.178 16-16 16h-384c-8.822 0-16-7.178-16-16v-32c0-8.822 7.178-16 16-16h384c8.822 0 16 7.178 16 16v32z"></path><path d="M400 224c-8.837 0-16 7.164-16 16v320c0 8.837 7.163 16 16 16s16-7.163 16-16v-320c0-8.836-7.163-16-16-16z"></path><path d="M304 224c-8.836 0-16 7.164-16 16v320c0 8.837 7.164 16 16 16s16-7.163 16-16v-320c0-8.836-7.164-16-16-16z"></path><path d="M208 224c-8.836 0-16 7.164-16 16v320c0 8.837 7.164 16 16 16s16-7.163 16-16v-320c0-8.836-7.164-16-16-16z"></path></svg></td>
		<td style='cursor: pointer; padding: 15px;' onclick='slide_clone(this)'>Copy</td>
		<td style='width:100%;'></td>
		<td id='MENU_L_EDIT' style='display: none; cursor: pointer; font-family: bold; padding: 15px;' onclick='slide_edit(this)'>Edit</td>
		<td style='cursor: pointer; font-family: bold; padding: 15px;' onclick='slide_open(this)'>Open</td>
	</tr>
</table>
<table id='MENU_F' style='display: none; position: absolute; overflow:hidden; color:#FFFFFF; height: 53px; font-family:thin; font-size: 20px; border: 0px; background-color:rgba(120,120,120,.9);' cellspacing=0 cellpadding=0>
	<tr>
		<td id="BARBT_NEW_COPY" style='cursor: pointer; padding: 15px;' onclick='slide_clone(this)'>Copy</td>
		<td style='width: 100%; vertical-align:middle;'>&nbsp;</td>
		<td style='cursor: pointer; font-family: bold; padding: 15px;' onclick='slide_open(this)'>Open</td>
	</tr>
</table>
<table id='MENU_DELETE' style="display: none; position: absolute; color:#FFFFFF; height: 53px; font-family:thin; font-size: 20px; border: 0px; background-color:rgba(180,0,0,.9);" cellspacing=0 cellpadding=0>
	<tr>
		<td style='cursor: default; padding: 15px; width: 100%; text-align: left;'>Sure?</td>
		<td style='cursor: pointer; padding: 15px;' onclick='deleteNow(this);'>Delete</td>
		<td style='cursor: pointer; padding: 15px;' onclick='hideCancelbar(this);'>Cancel</td>
	</tr>
</table>

<div class='waitboxBg' id='waitboxBg'><div class='waitbox' id='waitbox'>&nbsp;</div></div>
<script>

// Immediate show at startup - before other includes
document.getElementById("waitboxBg").style.opacity = 1;
document.getElementById("waitboxBg").style.marginTop = "-110px";
</script>

<script src="bin/shared/weblib.js"></script>
<script src="bin/home/boards_features.js"></script>
<script src="rsc/libs/fastclick.js"></script>

<script>
var ormiboard_home = true;
var maybe_sessionid = "";
function main() {
 	FastClick.attach(document.body);
	featuredLoadMax = featured.length;
	list_render_featured();
	loadNextFeaturedPreview();

	DOM("MENU_L_EDIT").style.display = "block";
	resize();
	DOM("FILES_SHARED").style.display = "block";
	userinfo = userinfo.split("?~?");
	DOM("USERNAME").innerHTML = userinfo[2] + " " + userinfo[3];
	
	setInterval(function() {
		var scrolly = isFirefox ? document.documentElement.scrollTop : document.body.scrollTop;
		if(scrolly == 0) {
			DOM("USERNAME").style.fontSize = "50px";
			DOM("USERNAME").style.letterSpacing = "4px";
			DOM("SUBTITLE").style.fontSize = "16px";
			DOM("SUBTITLE").style.lineHeight = "25px";
			DOM("HEADER_CNT").style.paddingTop = "22px";
			DOM("HEADER_CNT").style.paddingBottom = "22px";
		} else {
			DOM("USERNAME").style.fontSize = "14px";
			DOM("USERNAME").style.letterSpacing = "7px";
			DOM("SUBTITLE").style.fontSize = "0px";
			DOM("SUBTITLE").style.lineHeight = "0px";
			DOM("HEADER_CNT").style.paddingTop = "5px";
			DOM("HEADER_CNT").style.paddingBottom = "5px";
		}
	
	}, 100);
	
	waitbox_end();
	
}

function local_sessionEvent_join() {
	//refreshGroupDisplay();
}
function local_sessionEvent_end() {
	//refreshGroupDisplay();
}

var scr = { w: 0, h: 0 }; // Document size
function wresize() {
	resize();
}
function resize() {
	scr = {
		w: window.innerWidth,
		h: window.innerHeight
	}
	slideWidth = masterSlideWidth > scr.w - 40 ? scr.w - 40 : masterSlideWidth;

	if(scr.w > slideWidth + 40) {
		slideWidth = (scr.w - 40) / 2 - 20;
	} else {
		slideWidth = scr.w - 40;
	}
	if(slideWidth > masterSlideWidth) slideWidth = masterSlideWidth;
	var hwidth = (slideWidth * 2 + 24);
	var groupWidth = (hwidth > scr.w - 40 ? scr.w - 40 : hwidth);
	if(scr.w > 640 && groupWidth < 600) groupWidth = 600;
	var iscale = groupWidth / 800 ;
	iscale = iscale > 1 ? 1 : iscale;
	
	DOM("MENU_L").style.width = (slideWidth + 20) + "px";
	DOM("MENU_F").style.width = (slideWidth + 20) + "px";
	slideHeight = slideWidth / slideRatio;
	DOM("PREVIEW_CONTAINER").style.width = (groupWidth + 20) + "px";
	
	var elements = document.getElementsByName("shared_preview");
	var elementsCount = elements.length;
	for(var index = 0; index < elementsCount; index++) {
		elements[index].style.width = slideWidth + "px";
		elements[index].style.height = slideHeight + "px";
	}
	var elements = document.getElementsByName("shared_preview_container");
	var elementsCount = elements.length;
	for(var index = 0; index < elementsCount; index++) {
		elements[index].style.width = slideWidth + "px";
		elements[index].style.height = slideHeight + "px";
	}
	
	var elements = document.getElementsByName("shared_title");
	var elementsCount = elements.length;
	for(var index = 0; index < elementsCount; index++) {
		elements[index].style.width = (slideWidth - 40) + "px";
	}
	
}
window.addEventListener('resize', wresize);


function getScrollbarWidth() {
    var outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.width = "100px";
    outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

    document.body.appendChild(outer);

    var widthNoScroll = outer.offsetWidth;
    // force scrollbars
    outer.style.overflow = "scroll";

    // add innerdiv
    var inner = document.createElement("div");
    inner.style.width = "100%";
    outer.appendChild(inner);        

    var widthWithScroll = inner.offsetWidth;

    // remove divs
    outer.parentNode.removeChild(outer);

    return widthNoScroll - widthWithScroll;
}


document.onkeydown = function (event) {
	if (!event) event = window.event;
	var keyCode = event.keyCode;
	if (keyCode == 13) {
		if (navigator.userAgent.toLowerCase().indexOf("msie") == -1) {
			event.stopPropagation();
		} else {
			event.returnValue = false;
		}
		return false;
	}
	if (keyCode == 8 &&
		((event.target || event.srcElement).tagName != "TEXTAREA") && 
		((event.target || event.srcElement).tagName != "INPUT")) { 
		if (navigator.userAgent.toLowerCase().indexOf("msie") == -1) {
			event.stopPropagation();
		} else {
			event.returnValue = false;
		}
		return false;
	}
};	

function slide_click(index, key, uid, ownerid, filename) {
	if(k_SHIFT) {
		var newId = Date.now();
		document.location = "editor.html?id="+newId+"&template=" + uid + "&owner=" + ownerid;
	} else {
		document.location = filename;
	}
}

// ------------- Keyboard shortcuts
document.addEventListener("keydown", function (event) { input_key_down(event); });
document.addEventListener("keyup", function (event) { input_key_up(event); });
function input_key_down(event) {
	var key = event.keyCode;
	if(key === 16) {
		k_SHIFT = true;
	}	
}

function input_key_up(event) {
	var key = event.keyCode;
	if(key === 16) k_SHIFT = false;
}	
var k_SHIFT = false;
var k_CTRL = false;


</script>

</BODY>
</HTML>