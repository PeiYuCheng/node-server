

//var ROOT_URL = document.location.origin ? document.location.origin : window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '') + "/";
//var serverKey = document.location.hostname;

/** Doc id of the last active document **/
var lastActiveDocid = null;
var lastImportFromOwner = null;

// -------------- load ------------

/** ID of the last document loaded **/
var loadDocid;
/** Owner of the last document loaded  **/
var loadOwnerId;
/** ID of the last template  **/
var loadTemplateId;
/** Owner of the last template  **/
var loadTemplateOwnerId;

/** Execute callback if file exists on the server (relative to root) **/
function serverFileExists(file, callback, callbackFail) {
	waitbox_start();
	query("fexists=" + file, function(status, result) {
		if(status && result === "FOUND") {
			callback();
		} else {
			if(exists(callbackFail)) callbackFail(result);
		}
	});
}

/** Reload the current document from the server **/
function cloud_reload() {
	cloud_load(loadDocid, loadTemplateId, loadTemplateOwnerId, loadOwnerId);
}

var loadMessageDisplayed = false;
/** Load a document from the server **/
function cloud_load(get_loadDocid, get_loadTemplateId, get_loadTemplateOwnerId, get_loadOwnerId) {
	waitbox_start(); // Removed to keep load clean
	//message_start("Loading");
	loadMessageDisplayed = true;
	loadDocid = get_loadDocid;
	loadTemplateId = get_loadTemplateId;
	loadTemplateOwnerId = get_loadTemplateOwnerId;
	loadOwnerId = typeof get_loadOwnerId == "undefined" ? "" : get_loadOwnerId;
	
	if(typeof(loadDocid) == "undefined") {
		loadDocid = lastActiveDocid;
	} else {
		lastActiveDocid = loadDocid;
	}
	lastImportFromOwner = loadTemplateOwnerId;

	serverComBusy = true;
	
	
	//board_description
	
	
	
	var http = new XMLHttpRequest();
	http.onprogress = function(e) {
/*		if(!loadMessageDisplayed) {
			waitbox_start(); // Removed to keep load clean
			message_start("Loading");
			loadMessageDisplayed = true;
		} */
		//message_progress(e.loaded, e.total);
	}

	http.onreadystatechange = function() {
		switch(http.readyState) {
			case 4:
				if(http.status == 200) {
					var dataSaveData = http.responseText;
					if(dataSaveData !== "") { // A copy already saved?
						documentSavedOnce = true;
						message_end();
						finalizeLoad(dataSaveData);
					} else { // No, we can load the template
						documentSavedOnce = false;
						if(lastImportFromOwner != "") {
							cloud_load_fromTemplate();
						} else { // No template - New empty document
							waitbox_end();	
							if(editor && dot_init_requested) {
								window.setTimeout(function() {
									dot_init();
								}, 250);
							}
						}
						docChecksum = getDocumentChecksum();
					}
				} else {
					message_update("Failed");
					setTimeout(function() {
						//message_end();
						waitbox_end();
						if(editor && dot_init_requested) {
							dot_init();
						}
					}, 3000);					
				}
				serverComBusy = false;
				docServerStamp = 0;
				session_initialize();
				break;
		}
	}
	http.open("GET", QUERY_URL + "?load=" + loadDocid + "&userid="+(loadOwnerId == "" ? userid : loadOwnerId)+"&nocache=" + Date.now(), true);
	http.send();
}

function cloud_load_fromTemplate() {
	var http = new XMLHttpRequest();
	//http.onprogress = function(e) {
	//	message_progress(e.loaded, e.total);
	//}
	http.onreadystatechange = function() {
		switch(http.readyState) {
			case 4:
				if(http.status == 200) {
					var dataSaveData = http.responseText;
					if(dataSaveData !== "") { 
						finalizeLoad(dataSaveData);
						documentSavedOnce = false;
					} else {
						//message_end();
						waitbox_end();							
						if(editor && dot_init_requested) {
							dot_init();
						}
					}
				}
		}
	}
	http.open("GET", QUERY_URL + "?load=" + loadTemplateId + "&userid="+loadTemplateOwnerId+"&nocache=" + Date.now(), true);
	http.send();
}

function finalizeLoad(dataSaveData) {
	var boardAuthorId = loadTemplateOwnerId === "" ? userid : loadTemplateOwnerId;

	query("getdocinfo&docid=" + loadDocid + "&userid=" + boardAuthorId, function(status, result) {
		if(status) {
			var res = result.split("~.~");
			board_description = res[1];
			
		}
		
		
		waitbox_end();
		message_end();
		fileDataImport(dataSaveData);
		docChecksum = getDocumentChecksum();
		if(editor) {
			if(dot_init_requested) {
				dot_init();
			}
			if(autosave) {
				autosave = false;
				cloud_save();
			}

		}
		
		
	});
		
	
	
}

function fileDataImport(data) {
	// Clear existing slides
	if(editor) {
		set_selection( null );
	}
	slides_clearAll();

	if(board_description == null) board_description = "";
	if(board_description.indexOf("<br>")) board_description = board_description.split("<br>").join("\n");
	DOM("DOC_DESC_IN").value = board_description;
	
	// prepare data
	data = str_replace(data, "~`", "+");
	data = str_replace(data, "\n", "");
	
	// Read title
	var titleStart = data.indexOf("<TITLE>") + 7;
	var titleEnd = data.indexOf("</TITLE>");

	if(titleEnd > -1) {
		var pretenderTitle = decodeURIComponent(data.substr(titleStart, titleEnd - titleStart)).trim();
		if(pretenderTitle !== "" && pretenderTitle !== "Ormiboard") {
			document.title = pretenderTitle;
			DOM("DOC_NAME_IN").value = document.title;
		} else {
			document.title = "Ormiboard";
			DOM("DOC_NAME_IN").value = "";
		}
	}
	
	var start = data.indexOf("<BODY>") + 6;
	var end = data.indexOf("</BODY>");
	if(end > -1) {
		if(DOMexists("GLOBAL_E")) { // Remove if exists
			DOM("GLOBAL_E").parentNode.removeChild(DOM("GLOBAL_E"));
		}
		data = data.substr(start, end - start);
		document.body.insertAdjacentHTML('beforeend', data);
		
		if(!DOMexists("GLOBAL_E")) { // Create if was not in the loaded document
			document.body.insertAdjacentHTML('beforeend', '<div id="GLOBAL_E"></div>');
		}
	}
	var slides = document.getElementsByClassName("slide");
	var slides_count = slides.length;	
	if(slides_count == 0) {
		slide_add(false);
	}
	var slides = document.getElementsByClassName("slide");
	slides_count = slides.length;

	
	// --- Make sure ids are unique ---
	var stringUID = "";
	for(var i = 0; i < slides_count; i++) {
		slides.item(i).style.opacity = 0;
		if(stringUID.indexOf(slides.item(i).id) > -1) {
			slides.item(i).id = "SLIDE_" + createId();
		}
		stringUID += "~" + slides.item(i).id;
	}
	stringUID = "";
	var elements = document.querySelectorAll("[removable]");
	var elementsCount = elements.length;
	for(var index = 0; index < elementsCount; index++) {
		if(stringUID.indexOf(elements.item(index).id) > -1) {
			elements.item(index).id = elements.item(index).id.split("_")[0] + "_" + createId();
		}
		stringUID += "~" + elements.item(index).id;
	}
	
	
	

	slide_goto(openSlideWhenReady, false);
	openSlideWhenReady = 0;
	resize();
	setTimeout(function() { 
	//	message_end() ;
	}, 100);
}

// -------------- save ------------

var cloud_save_callback = null;
var cloud_save_currentSlide = 0;
/** Save the current document to the cloud, and generate the previews **/
function cloud_save(gcallback) {
	cloud_save_callback = typeof gcallback == "undefined" ? null : gcallback;
	lastImportFromOwner = (loadOwnerId == "" ? userid : loadOwnerId); // If was a template, break the link
	authorid = authorid == '' ? lastImportFromOwner : authorid;
	lastActiveDocid = docid;
	docServerStamp = 0; // Avoid reload
	waitbox_start();
	message_start("Publishing");
	
	memset("lastUpdateStamp", createId());
	memset("home_tab", "cloud");
	
	serverComBusy = true;
	
	var slides = DOMC("slide", true);
	slides_count = slides.length;	
	cloud_save_currentSlide = -1; // So will start at 0
	var title = (document.title === "Ormiboard" ? "" : document.title);
//console.log("setdocinfo&userid=" + (loadOwnerId == "" ? userid : loadOwnerId) + "&docid=" + docid + "&title=" + title);	
	query("setdocinfo&userid=" + (loadOwnerId == "" ? userid : loadOwnerId) + "&docid=" + docid + "&title=" + title + "&description=" + board_description, function(status, result) {
		cloud_save_preview();
	})
}

function cloud_save_preview() {
	var thisSlide = DOMC("slide", true)[++cloud_save_currentSlide];
	//thisSlide.style.display = "none";
	//thisSlide.style.opacity = 0;
	build_preview(thisSlide, 320);
	//thisSlide.style.display = thisSlide === currentSlide ? "block" : "none";
	//thisSlide.style.opacity = thisSlide === currentSlide ? 1 : 0;
	
}

function preview_built(data) {	
	var http = new XMLHttpRequest();
	data = str_replace(data, "+", "~`");
	var datalen = data.length;
	data = "preview=" + docid + "&slide=" + cloud_save_currentSlide + "&userid=" + (loadOwnerId == "" ? userid : loadOwnerId) + (sessionid == "" ? "" : "&sessionid=" + sessionid) + "&data=" + data;
	http.open("POST", QUERY_URL, true);
	http.timeout = 5000;
	http.setRequestHeader("Cache-Control", "no-cache");
	http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	http.onreadystatechange = function() {
		if(http.readyState == 4) {
			if(http.status == 200) {
				if(cloud_save_currentSlide < slides_count - 1) {
					cloud_save_preview();
				} else {
					cloud_save_slides();
					lastPublicationTimeStamp = Date.now();
				}
			} else {
				waitbox_end();
				message_start("Please Retry", "Your Internet access may be down")
				serverComBusy = false;
				setTimeout(function() {
					message_end();
					if(cloud_save_callback !== null) {
						cloud_save_callback();
					}
				}, 3000);
			}
		}
	}
	http.send(data);
}

var packet_max = 0;
var packet_index = 0;
var dataSaveData, http;
var totalFileSize = 0;
var doneFileSize = 0;

function cloud_save_slides() {
	documentSavedOnce = true;
	http = new XMLHttpRequest();
	dataSaveData = get_exportable_data();
	
	var datalen = dataSaveData.length;
	totalFileSize = datalen;
	packet_max = ~~(datalen / FILE_SIZE_LIMIT);
	packet_index = 0;
	
 	if(datalen > TOTAL_FILE_SIZE_LIMIT) {
		var over = ~~(datalen * 100 / TOTAL_FILE_SIZE_LIMIT + 1);
		message_start(over + "% OVER", "Size limit exceeded");
		setTimeout(function() {
			message_end();
			waitbox_end();
			if(cloud_save_callback !== null) {
				cloud_save_callback();
			}
			serverComBusy = false;
			pingASAP();
		}, 3000);
		
	} else {
		cloud_save_slides_packet();
	}
}
	
function cloud_save_slides_packet() {
	doneFileSize = packet_index * FILE_SIZE_LIMIT;
	var data_part = "publish=" + docid + "&userid=" + (loadOwnerId == "" ? userid : loadOwnerId) + "&part=" + packet_index + "&partmax="+ packet_max + "&data=" + dataSaveData.substr(packet_index * FILE_SIZE_LIMIT, FILE_SIZE_LIMIT);
	http.open("POST", QUERY_URL, true);
	http.setRequestHeader("Cache-Control", "no-cache");
	http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

	http.upload.onprogress = function(e) {
		message_progress(e.loaded + doneFileSize, totalFileSize);
	}
	http.onreadystatechange = function() {//Call a function when the state changes.
		if(http.readyState == 4) {
			if(http.status == 200) {
				if(packet_index < packet_max) {
					packet_index++;
					setTimeout(function() {
						cloud_save_slides_packet();
					}, 150);
				} else {
					message_end();
					waitbox_end();
					serverComBusy = false;
					
					if(cloud_save_callback !== null) {
						cloud_save_callback();
					}
				}
				docChecksum = getDocumentChecksum();
			} else {
				message_progress_hide();
				message_update("Failed", "Please retry.");
				setTimeout(function() {
					message_end();
					waitbox_end();
				}, 3000);
				serverComBusy = false;
				if(cloud_save_callback !== null) {
					cloud_save_callback();
				}
			}
		}
	}
	http.send(data_part);
}

function get_exportable_data() {
	var DATA_EXPORT = DOM("GLOBAL_E").outerHTML + "\n";

	//currentSlide.style.opacity = "0";
	
	var slides = document.getElementsByClassName("slide");
	slides_count = slides.length;
	for(var i = 0; i < slides_count; i++) {
		slides.item(i).style.display = "none";
		slides.item(i).style.opacity = 0;
		//slides.item(i).style.transform = "scale(0)";
		//slides.item(i).style.webkitTransform = "scale(0)";
	}
	
	for(var i = 0; i < slides_count; i++) {
		DATA_EXPORT += slides.item(i).outerHTML + "\n";
	}
	currentSlide.style.opacity = 1;
	currentSlide.style.display = "block";
	resize(); 
	var D = "";
	D += "<!DOCTYPE html>\n<HTML>\n";
	D += "<HEAD>\n";
	D += "<TITLE>" + document.title.split("&").join("%26") + "</TITLE>\n";
	D += '<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />\n';
	D += "<meta charset=\"utf-8\">\n";
	D += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
	D += '<meta name = "viewport" content = "width=device-width, initial-scale=1, maximum-scale=1">\n';
	D += '<meta name="apple-mobile-web-app-capable" content="yes">\n';
	D += '<link type="text/css" rel="stylesheet" href="/rsc/css/portable.css?v='+version+'"/>\n';
	D += "</HEAD>\n";
	D += "<BODY>\n";
	D += "<div class='waitboxBg' id='waitboxBg'><div class='waitbox' id='waitbox'></div></div>\n";
	D += "<div id='SESSION_PANEL' class='sess-panel'></div>\n";
	D += "<div id='SESSION_INFO' class='sess-info' inputpress='session_click()'><div id='SESSION_INFO_TITLE' class='sess-title'></div><div id='SESSION_INFO_ID' class='sess-id'></div></div>\n";
	DATA_EXPORT = str_replace(DATA_EXPORT, 'class="slide" style="display: block; opacity: 1;', 'class="slide" style="display: none; opacity: 0;');
	D += str_replace(DATA_EXPORT, "&", "%26");
	D += "</BODY>\n";
	D += "<script>var home = false;\n";
	D += "var ROOT_URL = (document.location.origin ? document.location.origin : window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port: '')) + '/';\n";
	D += "function load_portable() {\n var scrpt = document.createElement('script');\n";
	D += "scrpt.src=ROOT_URL + 'bin/shared/portable.js?'  + Date.now();\ndocument.head.appendChild(scrpt);\n}\n";
	D += "var scrpt = document.createElement('script'); scrpt.onload = function() { load_portable(); }\n";
	D += "scrpt.src=ROOT_URL + 'bin/shared/shared.js?'  + Date.now();\ndocument.head.appendChild(scrpt);\n";
	D += "</script>\n</HTML>\n";
	D = str_replace(D, "+", "~`");
	
	return(D);
}

/** Returns the checksum for all the slides for the current document **/
function getDocumentChecksum() {
	var DATA_CALC = "";
	var slides = document.getElementsByClassName("slide");
	slides_count = slides.length;
	for(var i = 0; i < slides_count; i++) {
		DATA_CALC += slides.item(i).innerHTML + slides.item(i).style.backgroundColor;
	}
	return(checksum(DATA_CALC));
}
