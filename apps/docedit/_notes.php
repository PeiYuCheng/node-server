<!doctype html>
<HTML>
<HEAD>
<title>Notes</title>
<meta charset="utf-8">
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1, maximum-scale=1">
<meta name="apple-mobile-web-app-capable" content="no">
<style>

@font-face {
    font-family: 'thin';
    src: url(/rsc/fonts/thin.woff) format('woff');
    font-weight: normal; font-style: normal;
}
@font-face {
    font-family: 'light';
    src: url(/rsc/fonts/light.woff) format('woff');
    font-weight: normal; font-style: normal;
}
@font-face {
    font-family: 'regular';
    src: url(/rsc/fonts/regular.woff) format('woff');
    font-weight: normal; font-style: normal;

}
@font-face {
    font-family: 'bold';
    src: url(/rsc/fonts/bold.woff) format('woff');
    font-weight: normal; font-style: normal;
}
 textarea {
    resize: none;
	outline-width: 0;
	-ms-user-select: text;
	-webkit-user-select: text;
	-moz-user-select: text;
}
.item {

}
.itemInner {
	border-bottom:1px solid #E0E0E0;
	font-family: regular;
	font-size: 20px;
	padding: 10px;
}
</style>
</HEAD>

<BODY onload="main();" style='cursor: default; font-family: light; font-size:20px; text-align: center; background-color: #F4F5F8;' leftmargin=0 topmargin=0>
<script>
home = false;
document.write("<script src='keyboard.js?" + Date.now() + "'><"+"/script>");
document.write("<script src='edit.js?" + Date.now() + "'><"+"/script>");
document.write("<script src='../../bin/global/api.js?" + Date.now() + "'><"+"/script>");
document.write("<script src='../../rsc/libs/fastclick.js?" + Date.now() + "'><"+"/script>");

var data = [];

function main() {
	newEntry();
	loop();
}

function loop() {
	if(DOMexists("IN")) {
		DOM("IN").style.height = '0px';
		DOM("IN").style.height =DOM("IN").scrollHeight + 'px';
	}
	setTimeout(loop, 25);
}

function bgclick() {
	console.log("bgclick")
}

</script>
<center>
<div  onclick='bgclick()' style='padding-bottom: 30px; width: 100%; min-height: 100%; height: auto; position: absolute; background-color:#FFF8E1;'>
<div id='ADD' style='text-align: left; width: 800px; min-height: 40px; max-width: 100%; font-family: regular; font-size: 16px; color:#606060; background-color: #FFFFFF''></div>
<div id='DOC' style='text-align: left; width: 800px; max-width: 100%; font-family: regular; font-size: 16px; color:#606060; background-color: #FFFFFF''></div>
</div>
</center>
</BODY>
</HTML>