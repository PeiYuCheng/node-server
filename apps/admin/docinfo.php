<!doctype html>
<HTML>
<HEAD>
<title>Ormiboard Document Info</title>
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
<script>
<?php
$microstart = microtime(true);
$initime = time();
$userid = $_GET['userid'];
$docid = $_GET['docid'];
$Bfolder = '../../data/users/' . $userid . '/';
$filesize = @filesize($Bfolder.$docid.".data");
$filesize = $filesize == "" ? 0 : $filesize;
$age = ($initime - @filemtime($Bfolder.$docid.".data"));

$slidescount = 0;
while(file_exists($Bfolder."boards/".$docid."/".$slidescount.".jpg")):
	$slidescount++;
endwhile;

echo "authorid = '" . $userid . "';\n";
echo "docid = '" . $docid . "';\n";
echo "size = " . $filesize . ";\n";
echo "slides_count = " . $slidescount . ";\n";
echo "lastsaved = " . $age . ";\n";

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
	ulist += "<tr><td style='padding: 20px; color:#CACACA'>";
		
		
		
	ulist += "<div style='color:#800000; font-size: 26px; font-family: bold;'>" + docid + "</div>";
	ulist += "<div style='color:#808080;  font-size: 16px;'>Author: " + authorid + "</div>"
	ulist += "<div style='color:#808080;  font-size: 16px;'>Size: " + (~~(size / 102.4) / 10) + " kb</div>"
	var lasts = ~~(lastsaved / 1000 / 60);

	ulist += "<div style='color:#808080;  font-size: 16px;'>Saved " + (lasts < 1 ? "less than a minute " : lasts + " minutes ") + "ago</div>"
	
	ulist += "</td></tr></table>";	
	

	
	ulist += "<table style='margin-bottom: 10px; background-color:#FFFFFF; text-align: left; width: 90%; max-width:640px;  '>";
	ulist += "<tr><td style='padding: 20px; color:#CACACA'>";
	
	ulist += "<div style='color:#800000; font-size: 26px; font-family: light; padding-bottom: 20px;'>" + slides_count + " slide"+(slides_count > 1 ? "s" : "")+"</div>";
	
	for(var index = 0; index < slides_count; index++) {
		ulist += "<img src='../../data/users/"+authorid+"/boards/"+docid+"/"+index+".jpg' style='width: 280px; padding-left: 5px; padding-right: 5px;'>";
	}
	
	ulist += "</td></tr></table>";
	ulist += "</table>";
		
		
	ulist += "<table style='margin-bottom: 10px; background-color:#FFFFFF; text-align: left; width: 90%; max-width:640px;  '>";
	ulist += "<tr><td style='padding: 20px; color:#CACACA'>";

	//if(authorid !== "gmailcompixinuum") {
		ulist += "<a href='../../editor.html?owner="+authorid+"&id="+docid+"' style='cursor: pointer; font-size: 16px; color:#606060;' onclick='edit(\""+authorid+"\")'>Edit</a> | ";
	//}
	ulist += "<a href='../../editor.html?&id="+Date.now()+"&owner="+authorid+"&template="+docid+"'  style='cursor: pointer; font-size: 16px; color:#606060;' onclick='edit(\""+authorid+"\")'>Duplicate</a> | ";
	ulist += "<a href='../../data/users/"+authorid+"/boards/"+docid+"/board.html' style='cursor: pointer; font-size: 16px; color:#606060;' onclick='edit(\""+authorid+"\")'>Open</a>";
	ulist += "</div>";
	ulist += "</td></tr></table>";
	
			
		
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