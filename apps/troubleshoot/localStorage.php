<!doctype html>
<HTML>
<HEAD>
<title>Ormiboard Local Storage</title>
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
</script>

<center>
<div style='font-size: 34px; font-family: thin; margin-top: 20px; color: #B08040;'>Local Storage<div>
<div id='OUTPUT' style='background-color:#FFFFFF; height: 100%; text-align: left; margin-top: 30px;'></div>
<a style='font-size: 16px; font-family: regular; color:#C00000; text-decoration: none;' href='javascript: if(confirm("Are you sure you want to clear the local storage?")) localStorage.clear();'>CLEAR</a>

<script>

var chrono;

function loop() {
	var sz = 0;
	var LS = "";
	for ( var i = 0, len = localStorage.length; i < len; ++i ) {
		LS += "<tr>";
		LS += "<td style='border-bottom: 1px solid #E0E0E0; padding: 10px; vertical-align: top; color: #A0A0A0;'>" + localStorage.key( i ) + "</td>";
		LS += "<td style='width: 100%; border-bottom: 1px solid #E0E0E0; padding: 10px; vertical-align: top; color: #000000'>" + localStorage.getItem( localStorage.key( i ) )  + "</td>";
		LS += "</tr>";
		sz += (localStorage.getItem( localStorage.key( i ) ).length + localStorage.key( i ).length) / 1024;
	}
	
	LS = "<tr><td style='border-bottom: 1px solid #E0E0E0; padding: 10px; vertical-align: top; '>In use</td><td style='width: 100%; border-bottom: 1px solid #E0E0E0; padding: 10px; vertical-align: top; font-family: bold;'>" + (~~sz < 1 ? "< 1" : ~~sz) + " Kb</td></tr>" + LS;  
	
	LS = "<table style='font-family: regular; font-size: 16px; background-color:#FFFFFF;  width: 100%; min-width: 100%; max-width: 800px;' cellspacing=0 cellpadding=0>" + LS;
	LS += "</table>";
	
	DOM("OUTPUT").innerHTML = LS;
	setTimeout(function() {
		loop();
	}, 500);
}

function main() {
	loop();
}
</script>
<br><br>
</center>
</BODY>
</HTML>