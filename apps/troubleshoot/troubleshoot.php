<!doctype html>
<HTML>
<HEAD>
<title>Ormiboard Trace</title>
<meta charset="utf-8">
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1, maximum-scale=1">
<meta name="apple-mobile-web-app-capable" content="no">
<link type="text/css" rel="stylesheet" href="../../rsc/css/shared.css"/>


</HEAD>

<BODY onload="main();" style='cursor: default; font-family: light; font-size:20px; text-align: center;'>
<script>

home = false;
document.write("<script src='../../bin/shared/lib.js?" + Date.now() + "'><"+"/script>");
document.write("<script src='../../bin/shared/weblib.js?" + Date.now() + "'><"+"/script>");
document.write("<script src='../../bin/shared/devices.js?" + Date.now() + "'><"+"/script>");
document.write("<script src='../../rsc/libs/fastclick.js?" + Date.now() + "'><"+"/script>");
<?php

$R = "";

if(!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $ip_address = $_SERVER['HTTP_X_FORWARDED_FOR'];
} else {
    $ip_address = $_SERVER['REMOTE_ADDR'];
}
$R .= "HostName~~".gethostname()."~~1@@";
$R .= "Local IP~~".$ip_address."~~1@@";
$R .= "Server IP~~".$_SERVER['SERVER_ADDR']."~~1@@";
$R .= "Port~~".$_SERVER['REMOTE_PORT']."~~1@@";
$R .= "Root~~".$_SERVER['DOCUMENT_ROOT']."~~1@@";
$R .= "Self~~".$_SERVER['PHP_SELF']."~~1@@";

$R .= checkFolder("");
$R .= checkFolder("data");
$R .= checkFolder("pending");
$R .= checkFolder("sessions");

echo "var srvdata = \"".$R."\";";

function checkFolder($get_fold) {
	$fold = "../../".$get_fold."/";
	$disp = ($get_fold == "" ? "Root" : $get_fold."/");
	if (!file_exists($fold)) {
		@mkdir($fold, 0775, true);
	}
	if (!file_exists($fold)) {
		return("Folder ".$disp."~~Cannot create folder~~0@@");
	}
	@file_put_contents($fold."TST", "OKTST");
	$res = @file_get_contents($fold."TST");
	unlink($fold."TST");
	if($res !== "OKTST") {
		return("Folder ".$disp."~~Cannot write or read~~0@@");
	}
	if (file_exists($fold."TST")) {
		return("Folder ".$disp."~~Cannot remove test file~~0@@");
	}
	return("Folder ".$disp."~~Ok~~1@@");
}

?>

</script>

<center>
<img src='../../rsc/images/ormiboard.svg' style='width: 54px; height: 54px; padding-top: 10px; '>
<div id='OUTPUT' style='width: 95%; max-width: 500px; background-color:#FFFFFF; text-align: left; padding: 0px 20px 0px 20px'></div>

<script>

var chrono;

function main() {

	var H = "";
	H += title("CLIENT")
	H += item("User ID", userid, userid !== null && userid !== "");
	H += item("Username", username, username !== "");
	H += item("Counter", runCounter, runCounter !== null);
	H += item("OS", osArray[OSID], true);
	H += item("Browser", browserArray[BRID], true);
	var vprefix = getVendorPrefix();
	H += item("Vendor prefix", vprefix == "" ? "No prefix" : vprefix, true);
	H += item("Rendering Sync", typeof requestAnimationFrame === "function" ? "Native" : "Polyfill", typeof requestAnimationFrame === "function");
	H += item("User agent", navigator.userAgent, true);
	H += item("Online", navigator.onLine, navigator.onLine);
	H += item("Language", navigator.language, true);
	H += item("Notifications", (!("Notification" in window)) ? "Unsupported " : "Supported", "Notification" in window);
	localStorage.setItem("storage_test", "Ok");
	var LS = " &nbsp; <a style='pointer: cursor;font-family: regular; font-size: 12px; cursor: pointer;color:#303030; text-decoration: none;' href='localStorage.php'>VIEW</a>";
	H += item("Local Storage", localStorage.getItem("storage_test") ? "Ok "+ LS : "Failed", localStorage.getItem("storage_test"));
	H += item("&nbsp;", "");
	H += title("SERVER");
	H += item("Ping", "<span id='PING' style='font-family: bold; padding: 5px 10px 5px 10px; border-radius:100%;'></span> ms</div>", true);
	H += item("Base URL", ROOT_URL, ROOT_URL !== "");
	H += item("Local ServerKey",  serverKey, true);
	
	console.log(srvdata)
	srvdata = srvdata.split("@@");
	for(var index in srvdata) {
		if(srvdata[index] !== "") {
			var e = srvdata[index].split("~~");
			H += item(e[0], e[1], e[2] == "1");
		}
	}
	
	H += "<br>";
	DOM("OUTPUT").innerHTML = H;
 	FastClick.attach(document.body);
	
	pingloop()
}

function title(text) {
	return("<div style='font-size: 40px; font-family: thin; padding-top: 30px; padding-bottom:20px; color: #D32B4F;'>"+text+"</div>")
}

function item(text, value, isGood) {
	var SH = "";
	SH += "<table cellspacing=0 cellpadding=0 style='font-size: 20px; padding-bottom: 10px; font-family: light; '>";
	SH += "<tr>";
	SH += "<td style='width: 160px; vertical-align: top;'>"+text+"</td>";
	if(isGood) {
		SH += "<td style='color:#007700; vertical-align: top;'>"+value+"</td>";
	} else {
		SH += "<td style='color:#FF0000; vertical-align: top;'>"+value+"</td>";
	}
	SH += "</tr>";
	SH += "</table>";
	return SH;
}

function pingloop() {
	chrono = Date.now();
	DOM("PING").style.backgroundColor = '#FFCCAA';
	query("", function(status, result) {
		delay = Date.now() - chrono;
		DOM("PING").innerHTML = delay;
		DOM("PING").style.backgroundColor = '#CCFFCC';
		setTimeout(pingloop, 1000);
	});
}

/** Returns the string representing the browser vendor prefix, ex. webkit- **/
function getVendorPrefix() {
	if(isAndroid) {
		return("webkit-");
	} else {
		var regex = /^(Moz|webkit|Khtml|O|ms|Icab)(?=[A-Z])/;
		var someScript = document.getElementsByTagName('script')[0];
		for(var prop in someScript.style) if(regex.test(prop)) return prop.match(regex)[0] + "-";
		return '';
	}
}
</script>
<br><br>
</center>
</BODY>
</HTML>