
function go_wait_for_pin() {
	DOM("GET_INFO").style.display = "none";
	DOM("GET_PIN").style.display = "block";
	DOM("ADD_USER").style.display = "none";
	DOM("ADD_OR_CREATE").style.display = "none";
	DOM("PIN_ID").focus();
}

function pin_keypress(e) {
	if (!e) e = window.event;
	var rpin = validFourDigits(DOM("PIN_ID").value);
	if(rpin.valid == true) {
		DOM("PIN_ID").value = rpin.pin;
		if(e.keyCode === 13) {
			pin_activate();
			return;
		}
	}
}

function pin_error() {
	DOM("PIN_ID").style.backgroundColor = "#FFA0A0";
	setTimeout(function() {
		DOM("PIN_ID").style.backgroundColor = "#FFFFFF";
	}, 350);
}

var pin_callback_ok = "";
var pin_callback_back = "";
function pin_activate() {
	DOM("BT_PIN_ACTIVATE").className = "account_item_selected";
	setTimeout(function() {
		DOM("BT_PIN_ACTIVATE").className = "account_item";
		eval(pin_callback_ok);
	}, 150);	
}

function pin_back() {
	DOM("BT_PIN_BACK").className = "account_item_selected";
	setTimeout(function() {
		DOM("BT_PIN_BACK").className = "account_item";
		eval(pin_callback_back);
	}, 150);	
}


function pin_exists() {
	errorMessage("An account already exists<br>for this email address.");
}