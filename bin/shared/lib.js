
var ROOT_URL = (document.location.origin ? document.location.origin : window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port: '')) + '/';
var serverKey = String(document.location.hostname);
var hostsplit = serverKey.split("."); var hsip0 = parseInt(hostsplit[0]); var hsip1 = parseInt(hostsplit[1]);
var localServer = (location.port !== "" || serverKey.replace(".local", "").indexOf(".") == -1 || hsip0 == 10 || (hsip0 == 172 && hsip1 >= 16 && hsip1 <= 31) || (hsip0 == 192 && hsip1 == 168));


var childOf = (window.frameElement !== null && typeof window.frameElement !== "undefined" ? window.frameElement.id : "");
function memset(mkey, mvalue) {localStorage.setItem((childOf == "" ? "" : childOf + "-") + mkey, mvalue);}
function memget(mkey) {return localStorage.getItem((childOf == "" ? "" : childOf + "-") + mkey);}

var runCounter = memget("runCounter");
runCounter = parseInt(runCounter == null ? 0 : runCounter);

var userid = memget("userid");
if(userid == null || userid == "null") userid = "";

var username = memget("username");
if(username == null) username = "";

var QUERY_URL = ROOT_URL + "bin/shared/query.php";

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


function query(sQueryString, sQueryCallback, sQueryTimeout) {
console.log("query >>>> " + sQueryString)
	var http = new XMLHttpRequest();
	http.onreadystatechange = function() {
		if (http.readyState == XMLHttpRequest.DONE) {
console.log("<<<<<<<< " + http.responseText)
			if(typeof sQueryCallback !== "undefined") {
				sQueryCallback(http.status == 200, http.responseText);
			}
		}
	}
	http.open("GET", QUERY_URL + "?" + sQueryString + "&nocache=" + Date.now(), true);
	http.timeout = (typeof sQueryTimeout === "undefined" ? 10000 : sQueryTimeout);
	http.send();
}