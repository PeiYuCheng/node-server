<!doctype html>
<HTML>
<HEAD>
<title>Ormiboard Admin</title>
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
a { text-decoration: none; color: #000000; font-size: 16px; font-family: light; }
a:hover { text-decoration: none; color: #D8364D; font-size: 16px; font-family: light; }
</STYLE>
</HEAD>

<BODY onload='main();' style='background-color:#F0F0F0;'>
<br>

<center>
<?php
$microstart = microtime(true);
$localServer = (intval($_SERVER["SERVER_PORT"]) != 80 || strpos(str_replace(".local", "", $_SERVER["HTTP_HOST"]), ".") == FALSE);

$quota_total = 250000;
$quota_user = 1000;

$server_consums = 0;

$max_users = $localServer ? 99 : 50000;
$fixed_max_users = $max_users;

echo "<img src='../../rsc/images/ormiboard.svg' style='width:60px; height: 60px;'><br><span style='font-size:26px;'>". ($localServer ? "Ormiboard Classroom Server" : "Ormiboard Public Server") . "</span>";
echo "<br>". PHP_OS . " - " . intval(disk_free_space("/") / 1024 / 1024 / 1024) . " GB available";

?>

<script>

var home = false;
var users = [];

var fixedMaxUsers = <?php echo $fixed_max_users; ?>;
var maxFilesPerUser = <?php  echo intval(($quota_user - 10) / 3) ?>;

<?php

$usersCounter = 0;
if ($handle = opendir('../../data/users')) {
    $blacklist = array('.', '..');
    while (false !== ($file = readdir($handle))) {
        if (!in_array($file, $blacklist)) {
		$Bfolder = '../../data/users/' . $file . '/';
		if(file_exists($Bfolder)) {
			
			$devicesCounter = 0;
			if(file_exists($Bfolder . 'devices/')) {
				if($dir = opendir($Bfolder . 'devices/')) {
					while (false !== ($filec = readdir($dir))) { 
						if (!in_array($filec, array('.', '..')) and !is_dir($filec)) $devicesCounter++;
					}
				}
			}		
			if ($Bhandle = opendir($Bfolder)) {
				echo "users[".$usersCounter."] = {};";
				echo "users[".$usersCounter."].info = \"" . @file_get_contents('../../data/users/' . $file . '/data/user.info') . "\";";
				echo "users[".$usersCounter."].id = '".$file."';";
				echo "users[".$usersCounter."].devicesCount = ".$devicesCounter.";";
				//
				
				/*$fileindex = 0;
				while (false !== ($Bfile = readdir($Bfolder))) {
					if ($Bfile != "" && $Bfile != "." && $Bfile != "..") {
						echo "users[".$usersCounter."].files[".$fileindex."] = '".$Bfile."';";
						$fileindex++;
					}
				} */
				closedir($Bhandle); 
				
				echo "users[".$usersCounter."].files = [];";
				$Bfolder2 = $Bfolder . '/boards';
				if(file_exists($Bfolder2)) {    
					if($dir2 = opendir($Bfolder2)) {
						$fileindex = 0;
						while (false !== ($Bfile2 = readdir($dir2))) {
							if ($Bfile2 != "" && $Bfile2 != "." && $Bfile2 != "..") {
								echo "users[".$usersCounter."].files[".$fileindex."] = '".$Bfile2."';";
								$fileindex++;
							}
						}
						closedir($dir2);
					}
				}	
				$usersCounter++;

			}
			
			
					
			
			
		}
	}
    }
    closedir($handle);
}
echo "var computeTime = ".(~~((microtime(true) - $microstart) * 1000000)) ;
echo ";\n";
?>
var users_count = <?php echo $usersCounter ?>;
</script>

<script src="../../rsc/libs/fastclick.js"></script>

<script>
var childOf = (window.frameElement !== null ? window.frameElement.id : "");
function memset(mkey, mvalue) {localStorage.setItem((childOf == "" ? "" : childOf + "-)") + mkey, mvalue);}
function memget(mkey) {return localStorage.getItem((childOf == "" ? "" : childOf + "-)") + mkey);}

//var userid = localStorage.getItem("userid");
var userid = memget("userid");
if(userid == null || userid == "null") userid = "";
if(userid.substr(0, 7) !== "exoucom" && userid !== "gmailcompixinuum") {
	document.write("</div><br><br>");
	document.write("<span style='color:#D8394D;'>Please sign-in with an administrator account to use this tool.</span>")
} else {
	document.write("<div id='USERS_COUNT' style='background-color:#707070; color: #FFFFFF; border-radius: 100%; width: 140px; height: 140px; font-size:14px;'>");
	document.write( "<div style='margin-top: 15px; font-size: 60px; padding-top:40px; line-height:55px;'>"+users_count+"</div>users");
	document.write("</div><br>");

	var ulist = "";
	for(var index = 0; index < users_count; index++) {
		
		ulist += "<table style='margin-bottom: 10px; background-color:#FFFFFF; text-align: left; width: 90%; max-width:600px;'>";
		ulist += "<tr><td style='padding: 20px;'>";
		
		var info = users[index].info.split("?~?");
		var uid = info[0];
		var email = info[1];
		var first = info[2];
		var last = info[3];
			
		ulist += "<div style='color:#000000; font-size: 22px;'><a href='userinfo.php?user="+users[index].id+"'>" + first + " " + last + "</a></div>";
		ulist += "<div style='color:#808080;  font-size: 16px;'>" + email + "</div>"
		ulist += "<div style='color:#808080;  font-size: 16px;'>" + users[index].id + "</div>"
		
		if(users[index].id !== "gmailcompixinuum" && users[index].id !== "examplecommano") {
			ulist += "<div style='cursor: pointer; font-size: 14px; color:#DDAAAA;' onclick='user_delete(\""+users[index].id+"\")'>Delete</div>";
		}
		
		ulist += "</td><td style='text-align: right; padding: 20px;  font-size: 14px;'>";
		var files = users[index].files;
		var filesCount = files.length;
		var devicesCount = users[index].devicesCount
		ulist += "<div style='color:#808080'>document"+(filesCount > 1 ? "s" : "")+" <span style='font-size: 28px; vertical-align: middle; color:#000000;'>"+filesCount+"</span></div>"
		ulist += "<div style='color:#808080'>device"+(devicesCount > 1 ? "s" : "")+" <span style='font-size: 28px; vertical-align: middle; color:#000000;'>"+devicesCount+"</span></div>"
		
		ulist += "</td></tr></table>";
		
	}
	
	document.write("<div id='USERS_LIST' style='max-width: 600px; text-align: left; font-size: 16px;'></div>");
	document.write(ulist);
	
	document.write("<a href='import/import.html'>Import</a> - ");
	document.write("<a href='setup/'>Server Update</a> - ");
	document.write("<a href='../troubleshoot'>Troubleshooting</a> - ");
	document.write("<a href='live.php'>Live activity</a> - ");
	document.write("<a href='../doc/builder.php'>Doc</a>");
	//if(userid === "gmailcompixinuum" || userid === "exoucomjbmartinoli") {
	//	document.write("<div style='font-family:bold; font-size: 14px;'><a href='migration.php'>Server Migration Tool</a></div>");
	//}
	document.write("<div style='font-size: 16px; color:#909090; padding-top:15px;'>Signed in as "+userid+"</div>");
	document.write("<div style='font-size: 16px; color:#909090;'>Built in "+ (~~(computeTime / 100) / 10)+" ms</div>");

	document.write("<br>");
	document.write("<span style='font-family: bold; color: #000000;'>Branding: </span> ");
	var brand = memget("branding");
	if(brand == "") {
		document.write("<span style='font-family: bold; color:#000000;'>None</span>");
	} else {
		document.write("<span><a href='javascript:memset(\"branding\", \"\"); document.location = document.location;'>None</a></span>");
	}
	document.write(" | ");
	if(brand == "panasonic") {
		document.write("<span style='font-family: bold; color:#000000;'>Panasonic</span>");
	} else {
		document.write("<span><a href='javascript:memset(\"branding\", \"panasonic\"); document.location = document.location;'>Panasonic</span>");
	}
	document.write(" | ");
	if(brand == "qomo") {
		document.write("<span style='font-family: bold; color:#000000;'>QOMO</span>");
	} else {
		document.write("<span><a href='javascript:memset(\"branding\", \"qomo\"); document.location = document.location;'>Qomo</span>");
	}
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
					} else {
						alert(http.responseText);
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