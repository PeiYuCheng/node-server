<!doctype html>
<HTML>
<HEAD>
<title>Home</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/>
<meta name="apple-mobile-web-app-capable" content="yes">
<style>
.button { float:left; background-color:#FFFFFF; font-family:regular; width:100px; min-height:24px; font-size:20px; padding-bottom:5px; color:#0076CE; padding:10px; margin-right:10px; margin-top:5px; margin-botton:5px; text-align:center; border:1px solid #0076CE; border-radius:5px; } 
.title { font-size:28px; font-family:regular; color:#0076CE;  }
.normal { font-size:20px; font-family:light; color:#444444; }
</style>
<link href="docedit.css" rel="stylesheet" type="text/css" />
</HEAD>

<script src="../../bin/global/api.js"></script>
<script src="../../rsc/libs/fastclick.js"></script>

<BODY onload="main();" onresize="resize();" style='cursor:default; background-color:#F0F0F0; font-size:20px; width:100%; height:100%; font-family:light;' leftmargin=0 topmargin=0>
<center>
<div id='ED_block' style='margin:auto; max-width:1000px; display:none; text-align:left;'>
	<div style='margin-bottom:10px;'>
		<button class='button' onclick='document.execCommand("insertHTML", false, "<p class=\"title\">"+ document.getSelection()+"</p>");'>Title</button>
		<button class='button' onclick='document.execCommand("insertHTML", false, "<span class=\"normal\">"+ document.getSelection()+"</span>");'>Normal</button>
	</div>
	<div style='clear:both;'></div>
	<div id='ED' style='clear:both; max-width:1000px; background-color:#FFFFFF; padding:20px; margin-top:10px; border:1px solid #BABABA; border-radius:5px; min-height:40px; overflow:auto; ' contentEditable="true"></div>
	<div style='text-align:center; padding-top:30px; padding-bottom:30px;'><span style='padding:10px; color:#A0A0A0;' onclick='deleteThis()'>Delete</span></div>
</div>

<div id='LIST' style='margin:auto; max-width:1000px; display:block; overflow:auto; text-align:left;'></div>

<div id='POINT' onclick="point_click()" style='transition:left .5s; position:fixed; border-radius:100%; width:70px; height:70px; background-color:rgba(255,255,255,.6)'>
	<div id='POINT_CONTENT' style='font-family:light; font-size:46px; line-height:68px; color:#FFFFFF; margin:1px; text-align:center; border-radius:100%; width:68px; height:68px; background-color:rgba(0,0,0,.75)'>
		+
	</div>
</div>
</center>
<script>

function main() {
	window.setTimeout("saveLoop()", 1000);
	resize();
	list_documents();
}

function list_documents() {
	basicQuery("apps/docedit/docedit_srv.php?list&userid=" + userid, function(status, result) {
		if(status && result !== "") {
			var ldata = result.split("~@~");
			H = "";
			for(did in ldata) {
				if( ldata[did] !== "") {
					var item = ldata[did].split("~!~");
					var url = item[0];
					var title = item[1];
					H = "<div style='padding-top:10px; padding-bottom:20px; padding-left:20px; padding-right:20px; margin-top:10px; border:1px solid #BABABA; border-radius:5px; background-color:#FFFFFF;' onclick='this.style.backgroundColor = \"#C0C0C0\"; window.setTimeout(function() {openDocument("+did+")},150)'>"+ title + "</div>" + H;
				}
			}
			DOM("LIST").innerHTML  = H;
		}
		resize();
	});
}

function openDocument(did) {
	/*docid = did;
	DOM("ED").innerHTML = ldata[docid] ;
	 editMode(); */
}

function resize() {
	var w = document.documentElement.clientWidth;
	var h = document.documentElement.clientHeight;
	DOM("ED").style.width = (w - 20) + "px";
	DOM("POINT").style.top = (h - 75) + "px";
}

function saveCurrentDocument() {
	/*if(docid > 0) {
		ldata[docid] = DOM("ED").innerHTML;
		saveData()
	}*/
}

function deleteThis() {
	/*D = "";
	for(did in ldata) {
		if(did != docid) D += (D == "" ? "" : "^~^") + did + "~~" + ldata[did];
	}
	localStorage.notes = D;
	docid = 0;
	DOM("ED").innerHTML = "";
	list_documents();*/
}

function saveData() {
	D = "";
	for(did in ldata) {
		D += (D == "" ? "" : "^~^") + did + "~~" + ldata[did];
	}
	localStorage.notes = D;
}

function saveLoop() {
	/*saveCurrentDocument();
	window.setTimeout("saveLoop()", 1000); */
}

function add(did) {
	/* docid = new Date().getTime();
	editMode(); */
}
function editMode() {
	/* DOM("LIST").style.display  = "none";
	DOM("ED_block").style.display = "block";
	DOM("ED").focus();
	
	set_edit_mode();
	resize(); */
}

function set_view_mode() {
	/*_MODE = _VIEW;
	DOM('POINT_CONTENT').innerHTML = '+';*/
}
function set_edit_mode() {
	/*_MODE = _EDIT;
	DOM('POINT_CONTENT').innerHTML = '<svg fill="#FFFFFF" width="40" height="40" viewBox="0 0 640 640"><g transform="scale(.7) translate(150, 220)"><path d="M176 560c-4.095 0-8.189-1.562-11.314-4.687l-160-160c-6.248-6.248-6.248-16.379 0-22.627s16.379-6.248 22.628 0l148.686 148.686 436.687-436.686c6.248-6.248 16.379-6.248 22.627 0s6.249 16.379 0 22.628l-448 448c-3.125 3.124-7.219 4.686-11.314 4.686z"></path></g></svg>';*/
}

function ok() {
	/*saveCurrentDocument();
	DOM("ED").innerHTML = "";
	docid = 0;
	list_documents(); */
}

function point_click() {
	DOM("POINT").style.backgroundColor = "rgba(0,0,0,1)";
	window.setTimeout(function() {
		DOM("POINT").style.backgroundColor = "rgba(255,255,255,.75)";
/*		if(_MODE == _VIEW) {
			add();
		} else {
			if(_MODE == _EDIT) {
				ok();
			}
		} */		
	}, 150);
}


</script>
</BODY>
</HTML>