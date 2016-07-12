
function pick_slide_template() {
	
	
	set_selection( null );
	var slides = document.getElementsByClassName("slide");
	var slides_count = slides.length;
	if(slides_count < slides_max) {
		
		var H = "";
		var svg_cross = '<svg inputpress="template_close_bt()" id="TEMPLATE_CLOSE" style="position: absolute; right:0px; top: 0px; padding: 10px; width: 20px; height: 20px;" fill="#54657E" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="640" height="640" viewBox="0 0 640 640"><path d="M342.627 336l276.686-276.687c6.249-6.248 6.249-16.379 0-22.627s-16.379-6.249-22.627 0l-276.686 276.687-276.687-276.686c-6.248-6.249-16.379-6.249-22.627 0s-6.249 16.379 0 22.627l276.687 276.686-276.686 276.687c-6.249 6.248-6.249 16.379 0 22.627 3.124 3.124 7.218 4.686 11.313 4.686s8.189-1.562 11.313-4.687l276.687-276.686 276.687 276.687c3.124 3.124 7.218 4.686 11.313 4.686s8.189-1.562 11.313-4.687c6.249-6.248 6.249-16.379 0-22.627l-276.686-276.686z"></path></svg>';
		H += svg_cross;
		H += "<div id='TEMPLATES_LIST' class='templates_list'></div>";
		H += "<div id='TEMPLATES_LIST' class='templates_list'></div>";
		
		DOM("WTEMPLATES").innerHTML = H;
		DOM("WTEMPLATES").style.display = "block";
		
		query("getlist=exoucomtemplates", function(status, result) {
			if(status) {
				templates_picker_render(result)
			} else {
				pick_slide_template_hide();
			}
			window.setTimeout(function() {
				DOM("WTEMPLATES").style.left = "0px";
			}, 150);
		});
	}
}

function template_close_bt() {
	
	DOM("TEMPLATE_CLOSE").style.borderRadius = "100%";
	DOM("TEMPLATE_CLOSE").style.backgroundColor = "rgba(84,105,86,.15)";
	window.setTimeout(function() {
		pick_slide_template_hide();
	}, 50);

}

function pick_slide_template_hide() {
	DOM("WTEMPLATES").style.left = "-800px";
	window.setTimeout(function() {
		DOM("WTEMPLATES").style.display = "none";
	}, 500);
}

var templateData;
var currentTemplateIndex = -1;
function templates_picker_render(data) {
	var H = "";
	templateData = data.split("~@~");
	for(var index in templateData) {
		if(templateData[index].indexOf("~!~") > -1) {
			var line = templateData[index].split("~!~");
			var info = line[2].split("~.~");
			H += "<div id='TPLIST_"+index+"' inputpress=\"template_preview("+index+")\" class='template_item_preview'>" + info[0] + "</div>";
			H += "<div id='TPZOOM_"+index+"' class='template_zoom'></div>";
		}
	}
	DOM("TEMPLATES_LIST").innerHTML = H;
}

function template_preview(templateIndex) {
	if(currentTemplateIndex === templateIndex) {
		templateIndex = -1;
	} else {
		var line = templateData[templateIndex].split("~!~");
		var info = line[2].split("~.~");
		var imagePreview = "<img class='template_preview' src='/data/users/exoucomtemplates/boards/"+line[0]+"/0.jpg?"+Date.now()+"'>";
		var selectBt = "<div class='btTemplateAction' id='TEMPLATE_SELECT' inputpress=\"template_insert("+line[0]+")\"><div class='btTemplateActionSub'>Insert</div></div>"
		DOM("TPZOOM_" + templateIndex).innerHTML = "<table class='template_table' cellspacing=0 cellpadding=0><tr><td class='template_tr1'>" + imagePreview + "</td><td class='template_tr2'>" + info[1] + "</td></tr></table>" + selectBt;
	}
	currentTemplateIndex = templateIndex;

	for(var index in templateData) {
		if(templateData[index].indexOf("~!~") > -1) {
			DOM("TPLIST_" + index).className = int(index) === int(templateIndex) ? "template_item_selected" : "template_item_preview";
			DOM("TPZOOM_" + index).style.height = int(index) === int(templateIndex) ? "200px" : "0px";
		}
	}
}

function template_insert(templateId) {
	DOM("TEMPLATE_SELECT").style.backgroundColor = "rgba(84,105,86,.3)";
	waitbox_start();
	var http = new XMLHttpRequest();
	http.onreadystatechange = function() {
		if(http.readyState === 4) {
			if(http.status == 200) {
				var data = http.responseText;
				var data = data.split("<div id=\"GLOBAL_E\" style=\"display:none\"></div>")[1].split("</BODY>")[0];
				document.body.insertAdjacentHTML("beforeend", data);
				var slides = document.getElementsByClassName("slide");
				slides_count = slides.length;
				currentSlide =  slides[slides_count - 1];
				for(var i = 0; i < slides_count; i++) {
					slide_renewAllIDs(slides[i]);
				}
			}
			pick_slide_template_hide();
			waitbox_end();
//alert(document.body.innerHTML)
			slides_resetIndexes();
			slides_refreshVisibility();
			slide_refresh_dot();
			slides_refresh();
			
			slides_count = document.getElementsByClassName("slide").length;
			slide_index = slides_count;
			 
		}
	}
	http.open("GET", QUERY_URL + "?load=" + templateId + "&userid=exoucomtemplates&nocache=" + Date.now(), true);
	http.send();
			
	
}