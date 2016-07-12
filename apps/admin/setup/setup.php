<!doctype html>
<HTML>
<HEAD>
<title>Ormiboard Admin</title>
<meta charset="utf-8">
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=1920, user-scalable=no, initial-scale=1, maximum-scale=1">
<meta name="apple-mobile-web-app-capable" content="no">
<link type="text/css" rel="stylesheet" href="setup.css"/>
</HEAD>

<BODY onload="main()" scroll=no style='cursor: default; font-family: light; background-color:#EAEAEA; color:#000000; font-size: 14px; -webkit-user-select: text; -moz-user-select: text; -ms-user-select: text; -ms-touch-action: text;  margin:0px;' marginleft=0 margintop=0 marginright=0 marginbottom=0>
<center>
<div style="padding: 30px; font-family: regular; background-color:#FFFFFF; text-align:left; width: 500px; max-width: 95%;">
<div style='font-family: bold; font-size:32px;'>Ormiboard Server Update</div>

<?php
require_once("setup_lib.php");
?>
<br>
Source:<br><span style='font-family: bold;'><?php echo $SERVER_SRC; ?></span><br>
Version <?php echo file_get_contents($SERVER_SRC."version.data"); ?><br>
<br>
Target:<div><span style='font-family: bold;'><?php echo $_SERVER['HTTP_HOST']; ?></span> (this server) <?php echo $simulationMode ? "<div style='font-family: bold; color:#e74c3c'>Simulation Mode</div>" : ""; ?></div>
<?php $sz = @file_get_contents($targetURL."/version.data"); echo $sz == "" ? "New install" : "Version ".$sz; ?><br>

<div id='INFO' style='font-family: regular; padding-top: 20px;'></div>
<div style='cursor: pointer; font-family: regular; background-color:#bdc3c7; color:#FFFFFF; padding: 5px; width: 80px; text-align: center; border-radius: 5px;' onclick="document.getElementById('HIDDER').style.height = document.getElementById('HIDDER').style.height == '0px' ? 'auto' : '0px';">Details</div>
<div id='HIDDER' style='height: 0px; overflow: hidden;'></div>
<br>
<center>

<div id='START' onclick='start()' style='display:<?php  echo $_SERVER['HTTP_HOST'] === "exoroot.com" ? "none" : "block"; ?>; font-family: regular; margin-top: 20px; padding: 20px; font-size: 20px; width: 160px; text-align:center; border-radius: 6px; background-color: #d35400; color:#FFFFFF;'>Start Update</div>

<div id='PROGRESS' style='display: none; overfow: hidden; font-family: regular; margin-top: 20px; padding: 0px; font-size: 0px; width: 100%; max-width: 400px; text-align:center; border-radius: 6px; border: 5px solid #27ae60;'>
	<div id='PROGRESSIN' style='font-family: regular; height: 30px; font-size: 20px; width: 0px; transition: .5s; text-align:center; overflow: hidden; border: 1px solid #27ae60; background-color: #27ae60; color:#FFFFFF;'></div>
</div>
<div id='PROGRESSINFO' style='display: none; font-family: regular; margin-top: 5px; padding: 0px; font-size: 14px; text-align:center; width: 100%; border-radius: 6px; color:#808080;'></div>
<?php
echo "<script>var data = \"".file_get_contents($SERVER_SRC . "apps/admin/setup/files.php")."\"</script>";
?>
</center>
<script>
var filesCount = 0;
var folders = "";
function main() {
	resize();
	var output = "<div style='font-family: bold; color:#A0A0A0;'>Files containing double underline (__) are ignored.</div>";
	data = data.split("~!~");
	folders = data[1];
	var size = data[2];
	data = data[0].split("~*~");
	for(var index in data) {
		if(data[index] !== "") {
			var line = data[index].split("!");
			output += "<div>" + line[0] + " <span style='font-family:bold;'>" + (parseInt(line[1] / 102.4) / 10) + "</span>kb</div>";
			filesCount++;
		}
	}
	DOM("HIDDER").innerHTML = output;
	DOM("INFO").innerHTML = filesCount + " files, " + (parseInt(size / 102.4 / 1024) / 10) + " Mb";
}

var currentFile = 0;
function start() {
	DOM("START").style.display = "none";
	DOM("PROGRESS").style.display = "block";
	DOM("PROGRESSINFO").style.display = "block";
		wquery("createfolders.php?" + folders, function(status, result) {
			if(status) {
				nextFile();
			} else {
				DOM("PROGRESSINFO").innerHTML = "ERROR";
			}
		});
	
}

function nextFile() {
	var filename = data[currentFile].split("!")[0];
	if(filename !== "") {
		var pgress = (currentFile * 100 / filesCount);
		DOM("PROGRESSIN").style.width = pgress + "%";
		wquery("copyfile.php?" + filename, function(status, result) {
			//console.log(result);
			if(++currentFile < filesCount) {
				DOM("PROGRESSINFO").innerHTML = currentFile + "/" +filesCount + "<br>"+ data[currentFile].split("!")[0];
				nextFile();
			} else {
				DOM("PROGRESSINFO").innerHTML = "<div style='font-family: bold; color:#000000;'>Completed</div>";
			}
		});
	}
}

var scr = { w: 0, h: 0 }; // Document size
function resize() {
	scr = {
		w: window.innerWidth,
		h: window.innerHeight
	}
}
window.addEventListener('resize', resize);
function DOM(strx, returnAll) {
	if(strx[0] == ".") {
		return(returnAll === true ? document.getElementsByClassName(strx.substr(1)) : document.getElementsByClassName(strx.substr(1))[0]);
	} else {
		return(document.getElementById(strx));
	}
}
function wquery(sQueryString, sQueryCallback, sQueryTimeout) {
	var http = new XMLHttpRequest();
	http.onreadystatechange = function() {
		if (http.readyState == XMLHttpRequest.DONE) {
			if(typeof sQueryCallback !== "undefined") {
				sQueryCallback(http.status == 200, http.responseText);
			}
		}
	}
	http.open("GET", sQueryString, true);
	http.timeout = (typeof sQueryTimeout === "undefined" ? 10000 : sQueryTimeout);
	http.send();
}
</script>
</div>
</center>
</BODY>
</HTML>