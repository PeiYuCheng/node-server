
function go_create_account() {
	DOM("GET_INFO").style.display = "block";
	DOM("GET_PIN").style.display = "none";
	DOM("ADD_USER").style.display = "none";
	DOM("ADD_OR_CREATE").style.display = "none";
	DOM("INPUT_FIRSTNAME").value = "";
	DOM("INPUT_LASTNAME").value = "";
	DOM("INPUT_FIRSTNAME").focus()
}

// Form completed, start create account
function create() {
	DOM("CREATE_ACCOUNT").className = "account_item_selected";
	setTimeout(function() {
		DOM("CREATE_ACCOUNT").className = "account_item";
		
		var try_firstname = DOM("INPUT_FIRSTNAME").value;
		var try_lastname = DOM("INPUT_LASTNAME").value;

		var allGood = true;

		if(try_firstname == "" || try_lastname == "") {
			errorMessage("All fields are mandatory.");
			allGood = false;
		}
		
		if(allGood) {
			if(localServer) {
				//CREATE_ACCOUNT
				create_pin_activate();
			} else {
				//	if(grecaptcha.getResponse() == "") {
						
				//	} else {
						//go_wait_for_pin();
						new_userAccount_requestPin()
				//	}
			}
		}
	}, 150);
}

function create_cancel() {
	DOM("CREATE_CANCEL").className = "account_item_selected";
	setTimeout(function() {
		DOM("CREATE_CANCEL").className = "account_item";
		//createJoin_show();
		go_account_add();
	}, 150);	
	
}

/*
function create_account_item() {
	DOM("CREATE_ACCOUNT_ITEM").style.backgroundColor = "#D0D0D0";
	setTimeout(function() {
		DOM("CREATE_ACCOUNT_ITEM").style.backgroundColor = "#FFFFFF";
		go_create_account();
	}, 150);
}
*/

function new_userAccount_requestPin() {
	var pin = DOM("PIN_ID");
	
	var http = new XMLHttpRequest();
	http.onreadystatechange = function() {
		if (http.readyState == XMLHttpRequest.DONE ) {
			if(http.status == 200) {
				if(http.responseText == "EXISTS") {
					// The email exists
					pin_exists();
				} else {
					pin_callback_ok = "create_pin_activate()";
					pin_callback_back = "go_create_account()";
					go_wait_for_pin();
				};
			} else {
				// Connect error
				errorMessage("Sorry, could not connect.<br>Please retry.");
			}
			waitbox_end();
		}
	}
	//var EMAIL = DOM("INPUT_EMAIL").value.toLowerCase();
	new_userid = userIdFromEmail(new_email_pretender);
	waitbox_start();
	
	
	var phonestr = (DOM("INPUT_PHONE_ADD").value).split(".").join("").split(" ").join("").split("-").join("");
	phonestr = (phonestr == "" ? "" : "&phone=" + phonestr);
	
	http.open("GET", QUERY_URL + "?userpincreate&userid=" + new_userid + "&email=" + new_email_pretender + "&firstname=" + DOM("INPUT_FIRSTNAME").value + "&lastname=" + DOM("INPUT_LASTNAME").value + phonestr + "&local=" + (localServer ? "1" : "0"), true);
	http.send();
}


function create_pin_activate() {
	var dpin = (localServer ? "LOCAL" : DOM("PIN_ID").value);
	if(dpin.length == 4 || localServer) {
		var rpin = validFourDigits(dpin);
		if(rpin.valid == true || localServer) {
			var http = new XMLHttpRequest();
			http.onreadystatechange = function() {
				if (http.readyState == XMLHttpRequest.DONE ) {
					if(http.status == 200) {
						if(http.responseText == "OK") {
							
							//var user_email = DOM("INPUT_EMAIL").value.toLowerCase();
							var user_firstname = DOM("INPUT_FIRSTNAME").value;
							var user_lastname = DOM("INPUT_LASTNAME").value;
							add_account_local(new_userid, new_email_pretender, user_firstname, user_lastname);
							document.location = ROOT_URL;
						} else {
							if(http.responseText == "WRONG") {
								// Wrong pin, not activated
								pin_error();
							}
							if(http.responseText == "EXISTS") {
								// Wrong pin, not activated
								pin_exists();
							}
						};
					} else {
						// Connect error, not activated
					}
					waitbox_end();
				}
			}
			//EMAIL = DOM("INPUT_EMAIL").value.toLowerCase();
			new_userid = userIdFromEmail(new_email_pretender);

			if(new_userid !== "") {
				
				waitbox_start();
				http.open("GET", QUERY_URL + "?userpinactivate&pin=" + (localServer ? "LOCAL" : rpin.pin) + "&email=" + new_email_pretender + "&userid=" + new_userid + "&firstname=" + DOM("INPUT_FIRSTNAME").value + "&lastname=" + DOM("INPUT_LASTNAME").value, true);
				http.send();
			}			
		} else {
			pin_error();
		}
	} else {
		pin_error();
	}
}
