<!doctype html>
<HTML>
<HEAD>
<title>Player</title>
<meta charset="utf-8">
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=1920, user-scalable=no, initial-scale=1, maximum-scale=1">
<meta name="apple-mobile-web-app-capable" content="no">
<link type="text/css" rel="stylesheet" href="../../rsc/css/shared.css"/>
</HEAD>

<BODY onload="main()" scroll=no style='overflow: hidden; cursor: default; font-family: light; font-size:20px; background-color:#000000; color:#000000; font-size: 0px; -webkit-user-select: text; -moz-user-select: text; -ms-user-select: text; -ms-touch-action: text; padding:0px; margin:0px;' marginleft=0 margintop=0 marginright=0 marginbottom=0>
<script>
// http://vr/app/player/?../../data/media/fire.mp4
// http://vr/app/player/?http://vjs.zencdn.net/v/oceans.mp4
var url = document.location.search.substr(1);
var H = "";
H += '<video onload="this.style.display = \"block\";" id="VPLAYER" style="border: 0px; padding: 0px; margin: 0px; position: absolulte; left: 0px; top: 0px;" loop autoplay controls preload="none" width="640" height="264" poster="'+url+'" data-setup="{}">';
H += '<source src="'+url+'" type="video/mp4">';
H += '</video>';
document.write(H);

function main() {
	resize();
}

var scr = { w: 0, h: 0 }; // Document size
function resize() {
	scr = {
		w: window.innerWidth,
		h: window.innerHeight
	}
	document.getElementById("VPLAYER").setAttribute("width", scr.w);
	document.getElementById("VPLAYER").setAttribute("height", scr.h - 5);
}
window.addEventListener('resize', resize);
</script>

</div>
</BODY>
</HTML>