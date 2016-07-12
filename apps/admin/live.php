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

<BODY onload='main();' style='background-color:#000000; overflow: hidden' scroll=no>

<div id='MAINC' style='position: absolute; color:#007700;'>
<div id='MAIN' style='transform-origin: top left; width: 1920px; height: 1080px; background-color:#000000;'>
<div id='LOG' style='position: absolute; left: 10px; top: 10px; width: 300px; overflow:hidden; color:#008800; text-align: left; font-family:regular; font-size: 16px;'></div>
<div id='INFO' style='position: absolute; left: 400px; width: 350px; top: 10px;  text-align: center; font-family:thin; font-size: 26px; color:#00AA00;'></div>
<div id='DMIN' style='position: absolute; left: 400px; width: 350px; top: 200px;  text-align: center; font-family:thin; font-size: 200px; color:#006600;'></div>
<div id='AV' style='position: absolute; left: 400px; width: 350px;top: 400px;  text-align: center; font-family:thin; color:#00FF00; font-size: 200px;'></div>
<div id='DMAX' style='position: absolute; left: 400px; width: 350px;top: 610px;  text-align: center; font-family:thin; color:#006600;  font-size: 200px;'></div>

<div id='ERRLOG' style='position: absolute; right: 10px; width: 180px; height:180px; line-height: 180px; top: 50px; border-radius: 100%;  text-align: center; font-family:thin; color:#00FF00;  font-size: 80px;'></div>

<div id='ONLINE' style='position: absolute; left: 950px; top: 0px;  text-align: left; font-family:light; font-size: 32px; color:#00FF00;'></div>
<div id='SERVER' style='position: absolute; right: 10px; bottom: 0px; width: auto; font-family:thin; font-size: 46px; letter-spacing: 20px; color:#D32B4F;'></div>
<div style='position: absolute; left: 1500px; top: 0px; font-family:light; font-size: 16px;'><span id='USERS_COUNT' style='font-family:thin; font-size: 240px; color:#00FF00;'></span><span id='USERS_W'></span></div>
</div>
<script>

var scr = { w: 0, h: 0 }; // Document size
function resize() {
	scr = {
		w: window.innerWidth,
		h: window.innerHeight
	}
	var w;
	var h;
	if(scr.w / 1920 < scr.h / 1080) {
		scale = scr.w / 1920;
	} else {
		scale = scr.h / 1080;
	}
	DOM("MAIN").style.transform = "scale("+scale+")"
	DOM("MAINC").style.left = (scr.w / 2  - (1920 * scale / 2)) + "px"
	DOM("MAINC").style.top = (scr.h / 2  - (1080 * scale / 2)) + "px"
}
window.addEventListener('resize', resize);
function main() {
	DOM("SERVER").innerHTML = String(document.location).split("/")[2];
	loop();
	resize();
}

var users = [];
var devices = [];
var delays = [];

var snapshotDuration = 60000;

function loop() {

	wquery(ROOT_URL+ "apps/admin/live_query.php" , function(status, result) {

		// ------------------------ Add new data -------------------
		var pos = result.indexOf("*");
		var brutsize= parseInt( result.substr(0, pos));
		var logsize = ~~(brutsize / 102.4) / 10;
		if(logsize > 10) logsize = ~~logsize;
		if(logsize > 100) DOM("ERRLOG").style.fontSize = "16px";
		DOM("ERRLOG").innerHTML = logsize;
		DOM("ERRLOG").style.backgroundColor = brutsize === 0 ? "#002200" : "#AA0000";
		
		result = result.substr(pos + 1);
		var data = result.split("\n");
		var prevIndex = 0;
		for(var Findex in data) {
			var line = data[Findex].split("~")			
			if(typeof line[3] !== "undefined") {
				var index = parseInt(line[0] * 1000);
				if(index == prevIndex) index++;
				prevIndex = index;
				delays[index] = parseFloat(line[1]);
				users[index] = line[2];
				devices[index] = line[3];
			}
		}
		DOM("LOG").innerHTML = result.split("\n").join("<br>");

	// ----------------------- Detect recent ---------------
		
		var recent = 0;
		for(var index in delays) {
			if(index > 0) {
				recent = recent < index ? index : recent;
			}
		}		
		

		// ------------------------------- Keep recent data only ------------
		var muDelay = delays;
		var muDevices = devices;
		var muUsers = users;

		users = [];
		devices = [];
		delays = [];
		
		var total = 0;
		var goodCount = 0;
		for(var index in muDelay) {
			if(parseFloat(index) > recent - snapshotDuration) {
				users[index] = muUsers[index];
				devices[index] = muDevices[index];
				delays[index] =muDelay[index];
				total += parseFloat(muDelay[index]);
				goodCount++;
			}
		}
		

		// ----------------------- Detect min and max ---------------
		
		var xmin = 99999;
		var xmax = 0;
		for(var index in delays) {
			if(index > 0) {
				xmin = xmin > delays[index]  ? delays[index] : xmin;
				xmax = xmax < delays[index] ? delays[index] : xmax;
			}
		}
		
		// ------------------------ Detect live users --------------------
		
		var online = [];
		var usersCount = 0;
		for(var index in users) {
			if(online.indexOf(users[index]) === -1) {
				usersCount++;
				online.push(users[index])
			}
		}
		online.sort();
		
		// Track time per user
		var usersDelays = [];
		var usersDelaysCount = [];
		var usersRecent = [];
		for(var index in delays) {
			if(index > 0) {
				if(typeof usersDelays[users[index]] == "undefined") {
					usersDelays[users[index]] = 0;
					usersDelaysCount[users[index]] = 0;
					usersRecent[users[index]] = 0;
				}
				usersDelays[users[index]] += delays[index];
				usersDelaysCount[users[index]]++;
				if(index > usersRecent[users[index]]) {
					usersRecent[users[index]]= index;
				}
			}
		}		
		
		// -------------------- Build users list
		
		var onlineH = "";
		var userIndex = 0;
		for(var oindex in online) {
			var t = "";
			t += online[oindex];
			t = str_replace(t, "exoucom", "<span style='color:#446600; font-size:15px;'>exoucom</span>");
			t = str_replace(t, "gmailcom", "<span style='color:#006644; font-size:15px;'>gmailcom</span>");
			userIndex++;
			
			var U= "";
			U += "<table><tr>";
			U += "<td style='font-size: 15px; width: 30px;'>" + userIndex + "</td>"
			U += "<td style='font-size: 20px; width: 200px;'>" + t + "</td>"
			U += "<td style='width: 70px; font-size: 20px; '>" + (~~((usersDelays[online[oindex]] * 100 / usersDelaysCount[online[oindex]])) / 100) + "</td>"
			var level = (snapshotDuration / 1000) - ~~((recent - usersRecent[online[oindex]])/1000);
			if(level > 60) level = 60;
			var color = "rgb("+((20 - level) * 7)+","+(level * 7)+", 0); "
			U += "<td style='width: 70px; '><div style='background-color:"+color+"; font-size: 1px; height: 4px; width:"+(level * 3)+"px;'>&nbsp;</div></td>"
			U += "</tr></table>";
			
			onlineH += U;
			
			
			
		}
		var evps = goodCount;
		DOM("INFO").innerHTML = (snapshotDuration / 1000) + "s snapshot<br>"
			+ (~~(evps * 100) / 100)+" events";
			


		if(xmin < 99999) {
			DOM("AV").innerHTML = (~~((total / goodCount) * 100) / 100);
			DOM("DMIN").innerHTML = xmin;
			DOM("DMAX").innerHTML = xmax;
			DOM("ONLINE").innerHTML = onlineH;
			DOM("USERS_W").innerHTML = usersCount > 1 ? "USERS" : "USER";
			DOM("USERS_COUNT").innerHTML = usersCount;
		}
			
		window.setTimeout(function() {
			loop();
		}, 2500);
	});
}


</script>


</center>
</BODY>
</HTML>