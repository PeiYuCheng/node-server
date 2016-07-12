
var line_edit = -1;

function newEntry() {
	line_edit = -1;
	DOM("ADD").innerHTML = getInput("");
	DOM("IN").focus();
}
function getInput(defaultValue) {
	var H = "";
	H += "<textarea id='IN' style='border: 0px; padding-left: 10px; padding-right: 10px; padding-top: 10px; background-color: #FFCCBC; font-family: regular; font-size: 20px; width: 100%; height: auto;' autocomplete='false' autocorrect='false' autocapitalize='false' spellcheck='false'>"+defaultValue+"</textarea>"
	return(H);
	
}

function line_enter() {
	var entry = DOM("IN").value;
	if(line_edit === -1) {
		if(entry !== "" && entry !== "\n") {
			data.push(entry);
		}
	} else {
		if(entry === "" || entry === "\n") {
			data.splice(line_edit, 1);
		}
	}
	render();
	newEntry();
}

function render() {
	var H = "";
	var count = data.length;
	for(var index = 0; index < count; index++) {
		var out = data[index];
		out = out.split("\n").join("<br>");
		H = "<div id='I_"+index+"' onclick='item_click(\""+index+"\")' class='item'><div class='itemInner'>" + out + "</div></div>" + H;
	}
	DOM("DOC").innerHTML = H;
}

function item_click(index) {
	if(line_edit !== index) {
		if(line_edit > -1) line_enter();
		DOM("ADD").innerHTML = "";
		DOM("I_" + index).innerHTML = getInput(data[index]);
		line_edit = index;
		DOM("IN").focus();
	}
}