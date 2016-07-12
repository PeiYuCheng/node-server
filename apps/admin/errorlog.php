<!doctype html>
<HTML>
<HEAD>
<title>Ormiboard Errors Log</title>
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
	-webkit-user-select: text; 
	-moz-user-select: text; 
	-ms-user-select: text; 
	-ms-touch-action: text;
	user-select: text; 
	font-family: regular; 
	font-size: 20px; 
	text-align: center;
}
a { text-decoration: none; color: #D8364D;}
</STYLE>

<script src="../../bin/global/api.js"></script>

</HEAD>

<BODY onload='main();' style='background-color:#F0F0F0;'>

<br>

<center>
<?php
$microstart = microtime(true);
$log = @file_get_contents("../../data/log/errlog.data");

echo "<script>\n";
echo "serverStamp = \"".$microstart."\";\n";
echo "</script>\n";
echo '<textarea style="display: none;" id="TLOG">'.$log.'</textarea>';
?>


<script src="../../rsc/libs/fastclick.js"></script>
<div id='OUTPUT'></div><br><br>
<script>


function main() {
	FastClick.attach(document.body);
	refresh_log();
}

function refresh_log() {
	var errCount = 0;
	var H = "<table style='width: 90%; max-width: 1000px; background-color:#FFFFFF; padding: 20px; font-size: 14px; text-align: left;'>";
	
	
	
	log = document.getElementById("TLOG").innerHTML.split("~@@~");
	var logcount = log.length;
	for(var index = 0; index < logcount - 1; index++) {
		
		// stamp "~*~"  userid + "~*~" + sessionid + "~*~" + deviceid + "~*~" +OS+ "~*~" +BROWSER+ "~*~" + controllerid + "~*~" + playMode + "~*~" + childOf + "~*~" + args + "~@@~";
		// args: msg, scriptLg, srcFile, cDocId, cAuthorId, cSlideIndex, cObjName, cEventName, lineNbr
		
		var line = log[index].split("~*~");
		var Tstamp = parseInt(line[0]);
		var Tuserid = line[1];
		var Tsessionid = line[2];
		var Tdeviceid = line[3];
		var TOS = line[4];
		var Tbrowser = line[5];
		var Tcontrollerid = line[6];
		var TplayMode = line[7];
		var TchildOf = line[8];
		var Tmsg = line[9];
		var TscriptLg = line[10];
		var TsrcFile = line[11];
		var TdocId = line[12];
		var TauthorId = line[13];
		var TslideIndex = line[14];
		var TobjName = line[15];
		var TeventName = line[16];
		var TlineNbr = line[17];
		
		delay = ~~((serverStamp - Tstamp) );
		
		var delayUnit = "s";
		if(delay > 120) {
			delay = parseInt(delay / 60);
			delayUnit = "mn";
		}
		
		// errorLog
		
		H += "<tr>";
		
		if(TscriptLg === "JS") {
			H += "<td>" + delay + " " + delayUnit+ "</td>";
			H += "<td><div style='color:rgb(211,43,79);'>" + Tuserid + "</div><div>" + TOS+ " with " + Tbrowser + "</td>";
			H += "<td><div style='color:rgb(211,43,79)'>" + Tmsg + "</div>"+TobjName +"<div style='color:#A0A0A0;'><span style='font-family: bold;'>"+TscriptLg + ": </span>" + TeventName +" - Slide "+(~~TslideIndex + 1)+" line "+TlineNbr+(TsrcFile == "" ? "" : "<div>"+TsrcFile+"</div>")+"</td>";
			H += "<td><a href='../../editor.html?id="+Date.now() +"&template="+TdocId+"&owner="+TauthorId+"'><img src='../../data/users/"+Tuserid+"/boards/"+TdocId+"/"+TslideIndex+".jpg' style='height: 60px;' onerror='this.style.display = \"none\";'></td>";
		} else {
			H += "<td>" + delay + " " + delayUnit+ "</td>";
			H += "<td>Server line <span style='color:rgb(211,43,79);'>"+TlineNbr+"</span></td>";
			H += "<td><div style='color:rgb(211,43,79)'>" + Tmsg + "</div></td>";
			H += "<td>&nbsp;</td>";
		
		}
		H += "</tr>";
		
		errCount++;
	}
	if(errCount === 0) {
		H += "<tr><td>No error found.</td></tr>";
	}
	
	H += "</table><br><br>";
	H += "<a href='javascript:clearLog()' style='font-size: 16px;'>Clear Log</a><br><br>";
	//H += log;
	DOM("OUTPUT").innerHTML = H;
}

function clearLog() {
	basicQuery("apps/admin/errorlog_remove.php", function(status, result) {
		document.location = document.location;
	});
}
</script>


</center>
</BODY>
</HTML>