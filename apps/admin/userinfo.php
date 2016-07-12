<!doctype html>
<HTML>
<HEAD>
<title>Ormiboard User Info</title>
<meta charset="utf-8">
<META HTTP-EQUIV="EXPIRES" CONTENT="-1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1, maximum-scale=1">
<meta name="apple-mobile-web-app-capable" content="no">
<link type="text/css" rel="stylesheet" href="../../rsc/css/shared.css"/>
<STYLE>
BODY { 
	background-color:#FAFAFA; 
	border: 0px; margin: 0px; 
	text-align: center;
	-webkit-touch-callout: none;
	-webkit-tap-highlight-color: transparent;
	-webkit-user-select: none; 
	-moz-user-select: none; 
	-ms-user-select: none; 
	-ms-touch-action: none;
	user-select: none; 
	font-family: regular; 
	font-size: 20px; 
	text-align: center;
}
a { text-decoration: none; color: #D8364D;}
</STYLE>

<script src="../../bin/shared/weblib.js"></script>
<script>userid = memget("userid");</script>
<script src="../../bin/shared/devices.js"></script>

</HEAD>

<BODY onload='main();' style='background-color:#F0F0F0;'>

<br>

<center>
<?php
$microstart = microtime(true);
$initime = time();
$userid = $_GET['user'];
$Bfolder = '../../data/users/' . $userid . '/';
$userinfo = @file_get_contents($Bfolder . '/data/user.info');
$sessioninfo = @file_get_contents($Bfolder . '/data/session.info');
$sessiondata = "";
$sessionid = "";
if($sessioninfo !== "" && strpos($sessioninfo, ":") !== FALSE) {
	$sessionid = explode(":", $sessioninfo)[1];
	$sessiondata = @file_get_contents("../../data/sessions/".$sessionid . '/session.data');
}

echo "<script>\n";
echo "serverStamp = \"".$initime."\";\n";
echo "current_userid = \"".$userid."\";\n";
echo "sessioninfo = \"".$sessioninfo."\";\n";
echo "sessiondata = \"".$sessiondata."\";\n";
echo "userinfo = \"".$userinfo."\";\n";
 
echo "var sessionMembers = [];";
echo "var sessionMembersId = [];";
$Bfolder = "../../data/sessions/".$sessionid . "/";
if(file_exists($Bfolder)) {
	if($Bhandle = opendir($Bfolder)) {
		$fileindex = 0;
		while (false !== ($Bfile = readdir($Bhandle))) {
			if ($Bfile != "" && $Bfile != "."  && strpos(".", $Bfile ) === FALSE) {
				$dat = @file_get_contents("../../data/sessions/".$sessionid . '/'.$Bfile);
				echo "sessionMembers[".$fileindex."] = '".$dat."';\n";
				echo "sessionMembersId[".$fileindex."] = '".$Bfile."';\n";
				$fileindex++;
			}
		}
	}
	closedir($Bhandle);
}

$Bfolder = '../../data/users/' . $userid . '/';

$devicesCounter = 0;
echo "var devices = [];\n";
echo "var devices_id = [];\n";
echo "var devices_lastuse = [];\n";
if(file_exists($Bfolder . 'devices/')) {
	if($dir = opendir($Bfolder . 'devices/')) {
		while (false !== ($filec = readdir($dir))) { 
			if (!in_array($filec, array('.', '..')) and !is_dir($filec)) {
				$fcontent = @file_get_contents($Bfolder . 'devices/' . $filec);
				$age = ($initime - filemtime($Bfolder . 'devices/' . $filec));
				echo "devices_lastuse[".$devicesCounter."] = \"".$age."\";\n";
				echo "devices_id[".$devicesCounter."] = \"".$filec."\";\n";
				echo "devices[".$devicesCounter."] = \"".$fcontent."\";\n";
				$devicesCounter++;
			};
		}
	}
	closedir($dir);
}
 
 
echo "var files = [];";
if(file_exists($Bfolder."/boards/")) {
	if($Bhandle = opendir($Bfolder."/boards/")) {
		$fileindex = 0;
		while (false !== ($Bfile = readdir($Bhandle))) {
			if ($Bfile != "" && $Bfile != "." && $Bfile != "..") {// && substr($Bfile, strrpos($Bfile, '.') - 2) == '_0.jpg') {
				echo "files[".$fileindex."] = '".$Bfile."';";
				$fileindex++;
			}
		}
	}
	closedir($Bhandle);
}

echo "var computeTime = ".(~~((microtime(true) - $microstart) * 1000000)) ;";";

?>
</script>

<script src="../../rsc/libs/fastclick.js"></script>

<script>
var childOf = (window.frameElement !== null ? window.frameElement.id : "");
function memset(mkey, mvalue) {localStorage.setItem((childOf == "" ? "" : childOf + "-)") + mkey, mvalue);}
function memget(mkey) {return localStorage.getItem((childOf == "" ? "" : childOf + "-)") + mkey);}

var userid = memget("userid");
if(userid == null || userid == "null") userid = "";
if(userid.substr(0, 7) !== "exoucom" && userid !== "gmailcompixinuum") {
	document.write("</div><br><br>");
	document.write("<span style='color:#D8394D;'>Please sign-in with an administrator account to use this tool.</span>")
} else {
	
	var ulist = "";
	ulist += "<div><img src='../../rsc/images/ormiboard.svg' style='width:60px; height: 60px;'></div>";
		
	ulist += "<table style='margin-bottom: 10px; background-color:#FFFFFF; text-align: left; width: 90%; max-width:640px;  '>";
	ulist += "<tr><td style='padding: 20px;'>";
		
	var info = userinfo.split("?~?");
	var stamp = info[0];
	var email = info[1];
	var first = info[2];
	var last = info[3];

	ulist += "<div style='color:#800000; font-size: 26px; font-family: bold;'>" + first + " " + last + "</div>";
	ulist += "<div style='color:#808080;  font-size: 16px;'>" + email + "</div>";
	ulist += "<div style='color:#808080;  font-size: 16px;'>id: " + current_userid + "</div>";

	var creation = ~~((serverStamp - parseInt(stamp)) / 1000 / 60);
	var creationText = "";
	if(creation < 60) {
		var minutes = ~~(creation / 60);
		if(minutes < 1) {
			creationText = "< 1 minute";
		} else {
			creationText = minutes + " minute" + (minutes > 1 ? "s" : "");
		}
	} else if(creation < 60 * 24) {
		var hours = ~~(creation / 60);
		creationText = days + " day" + (hours > 1 ? "s" : "");
	} else {
		var days = ~~(creation / 60 / 24);
		creationText = days + " day" + (days > 1 ? "s" : "");
	}
	ulist += "<div style='color:#808080;  font-size: 14px;'>Last access: <span  style='font-family:bold;'>" + creationText + " ago.</span></div>";
	ulist += "<div style='color:#808080;  font-size: 14px;'><a href='../../gallery.php?"+current_userid+"'>Gallery</a></div>";

	if(userid !== "gmailcompixinuum") {
		ulist += "<div style='cursor: pointer; font-size: 14px; color:#DDAAAA;' onclick='user_delete(\""+userid+"\")'>Delete</div>";
	}
	ulist += "</td></tr></table>";

	// ----------------------------------------------------------------------- docs

	ulist += "<div style='padding-top: 20px; font-family: light; font-size: 30px; color:#A0A0A0; '>"+(files.length)+" DOCUMENT"+(files.length > 1 ? "S" : "" )+"</div>";
	ulist += "<table style='padding-top: 15px; padding-bottom: 15px; background-color:#FFFFFF; text-align: left; width: 90%; max-width:640px;'>";
	ulist += "<tr><td style='padding-left: 20px; padding-top: 5px; padding-bottom: 5px; font-size: 14px; color:"+(10 < 10 ? "#000000" : "#808080")+"''>";
	if(files.length === 0) {
		ulist += "No document.";
	} else {
		var uslist = "";
		for(index in files) {
			uslist = "<a href='docinfo.php?docid=" + files[index] + "&userid="+current_userid+"'><img src='../../data/users/" +current_userid+ "/boards/" + files[index] + "/0.jpg' style='cursor: pointer; border: 1px solid #EAEAEA; width:194px; margin-left: 3px; margin-right: 3px;'></a>" + uslist;
		}
		ulist += uslist;
	}
	ulist += "</td></tr>";
	ulist += "</table>";
	// ----------------------------------------------------------------------- session
	
	ulist += "<div style='padding-top: 20px; font-family: light; font-size: 30px; color:#A0A0A0; '>SESSION</div>";
	ulist += "<table style='padding-top: 15px; padding-bottom: 15px; background-color:#FFFFFF; text-align: left; width: 90%; max-width:640px;'>";
	ulist += "<tr><td style='padding-left: 20px; padding-top: 5px; padding-bottom: 5px; font-size: 14px; color:"+(10 < 10 ? "#000000" : "#808080")+"''>";
	if(sessioninfo == "") {
		ulist += "No session.";
	} else {
		ulist += sessioninfo;
		ulist += "<br>";
		ulist += sessiondata;
		ulist += "<br>";
		for(var index in sessionMembers) {
			if(sessionMembersId[index] !== "" && sessionMembersId[index] !== "" && sessionMembersId[index] !== ".." && sessionMembersId[index]  !== "session.data") {
				ulist += "<div style='padding-top: 6px;'>" + sessionMembersId[index] + "<br>" + sessionMembers[index].split("~").join("<span style='color:#CACACA'>~</span> ") + "</div>";
			}
		}
		
	}
	ulist += "</td></tr>";	
	
	ulist += "</td></tr>";	
	ulist += "</table>";
	
	// ---------------------------------------------------------------------- devices

	ulist += "<div style='padding-top: 20px; font-family: light; font-size: 30px; color:#A0A0A0; '>"+(devices.length)+" DEVICE"+(devices.length > 1 ? "S" : "" )+"</div>";
	ulist += "<table style='padding-top: 15px; padding-bottom: 15px; background-color:#FFFFFF; text-align: left; width: 90%; max-width:640px;'>";

	for(index in devices) {
		var device = devices[index].split("~");
		var device_user = device[3];
		var deviceid = devices_id[index].split(".")[0];
		
		var fab = deviceid.split("");
		osName =  osArray[parseInt(fab[6])];
		brName = browserArray[parseInt(fab[7])];
	
		var lastuse = devices_lastuse[index];
		
		ulist += "<tr><td style='padding-left: 20px; padding-top: 5px; padding-bottom: 5px; font-size: 14px; color:"+(lastuse < 10 ? "#000000" : "#808080")+"''>";
			ulist += "<div style='font-size: 20px; font-family: regular; color:"+(lastuse < 10 ? "#009700" : "#666666")+"'>" + osName + " - " + brName + "</div>";
			ulist += "<div>id: " + deviceid + "</div>";
			
			var lastuseString = "";
			if(lastuse < 120) {
				lastuseString = lastuse + " second" + (lastuse > 1 ? "s" : "");
			} else if (lastuse < 3600) {
				lastuseString = ~~(lastuse / 60) + " mn";
			} else if (lastuse < 3600 * 48){
				lastuseString = ~~(lastuse / 60 / 60) + " hours";
			} else {
				lastuseString = ~~(lastuse / 60 / 60 / 24) + " days";
			}
			
			ulist += "<div>Last use: <span  style='font-family:bold;'>" + lastuseString + " ago</span></div>";
			//ulist += "<div>data: " +devices[index] + "</div>";
		ulist += "</td></tr>";
	}

	ulist += "</table>";
		
	ulist += "<div style='font-size: 16px; color:#909090; padding-top:15px;'>Built in "+computeTime+" ns</div>";
	
	document.write(ulist);
	
	document.write("<br><br><br>");

	
}


function DOM(s) { return document.getElementById(s); }
function str_replace(str, src, tar) { return(str.split(src).join(tar)); }



function user_delete(uid) {
	if(confirm("Remove this user?")) {
		var http = new XMLHttpRequest();
		http.onreadystatechange = function() {
			if (http.readyState == XMLHttpRequest.DONE ) {
				if(http.status == 200) {
					if(http.responseText == "OK") {
						document.location = document.location;
					}
				}
			}
		}
		http.open("GET", "api.php?user_delete=" + uid, true);
		http.send();
	}
}

function main() {
	FastClick.attach(document.body);
}


</script>


</center>
</BODY>
</HTML>