// ------------- Keyboard shortcuts
document.addEventListener("keydown", function (event) { input_key_down(event); });
document.addEventListener("keyup", function (event) { input_key_up(event); });

var k_SHIFT = false;
var k_CTRL = false;

var lastUserInteraction;

function input_key_down(event) {	
	lastUserInteraction = Date.now();
	var key = event.keyCode;
	var tname = event.target.tagName.toLowerCase();

console.log("Key-down: " + key);	
console.log("tname: " + tname);	
	
	
	if(key === 17) { // CTRL
		k_CTRL = true;
		event.preventDefault();
	}
	if(key === 16) {
		k_SHIFT = true;
	}	
	if(k_CTRL && key === 68) {
		event.preventDefault();
	}
	if(k_CTRL && key === 83) { // CTRL+S
		event.preventDefault();
	}

	
	if (key === 9) { // TAB
		if(tname === "textarea") {
			//insertAtCaret(event.target.id, "    ");
			event.preventDefault();
		}
	}
	if (key === 8) { // BACK
		if(tname !== "textarea") {
			event.preventDefault();
		}
	}
	if(key === 13 && !k_SHIFT) { // Enter
		event.preventDefault();
		line_enter();
	}
}

function input_key_up(event) {
	var key = event.keyCode;
	if(key === 17) k_CTRL = false;
	if(key === 16) k_SHIFT = false;
	
}	