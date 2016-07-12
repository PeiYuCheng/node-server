
var ROOT_URL = (document.location.origin ? document.location.origin : window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port: '')) + '/';
var serverKey = String(document.location.hostname);


var childOf = (window.frameElement !== null && typeof window.frameElement !== "undefined" ? window.frameElement.id : "");
function memset(mkey, mvalue) {localStorage.setItem((childOf == "" ? "" : childOf + "-") + mkey, mvalue);}
function memget(mkey) {return localStorage.getItem((childOf == "" ? "" : childOf + "-") + mkey);}

var userid = memget("userid");
if(userid == null || userid == "null") userid = "";

var username = memget("username");
if(username == null) username = "";

function str_replace(strsrc, strold, strnew) {return((strsrc + "").split(strold).join(strnew))}

function DOMexists(strx) {
	return(document.getElementById(strx) !== null);
}
function DOM(strx, returnAll) {
	if(strx[0] == ".") {
		return(returnAll === true ? document.getElementsByClassName(strx.substr(1)) : document.getElementsByClassName(strx.substr(1))[0]);
	} else {
		return(document.getElementById(strx));
	}
}

function basicQuery(sQueryString, sQueryCallback, sQueryTimeout) {
	var http = new XMLHttpRequest();
	http.onreadystatechange = function() {
		if (http.readyState == XMLHttpRequest.DONE) {
			if(typeof sQueryCallback !== "undefined") {
				sQueryCallback(http.status == 200, http.responseText);
			}
		}
	}
	http.open("GET", ROOT_URL + sQueryString, true);
	http.timeout = (typeof sQueryTimeout === "undefined" ? 10000 : sQueryTimeout);
	http.send();
}