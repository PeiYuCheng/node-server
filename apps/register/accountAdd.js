
var new_email_pretender = "";

function add_account_item() {
	DOM("ADD_ACCOUNT_ITEM").className = "account_item_selected";
	setTimeout(function() {
		DOM("ADD_ACCOUNT_ITEM").className = "account_item";
		go_account_add();
	}, 150);
}

function go_account_add() {
	DOM("GET_INFO").style.display = "none";
	DOM("ADD_USER").style.display = "block";
	DOM("GET_PIN").style.display = "none";
	DOM("ADD_OR_CREATE").style.display = "none";
	DOM("INPUT_ADD_EMAIL").focus();
}

function add_account() {
	DOM("ADD_ACCOUNT").className = "account_item_selected"
	setTimeout(function() {
		DOM("ADD_ACCOUNT").className = "account_item"
		
		setTimeout(function() {
			new_email_pretender =  DOM("INPUT_ADD_EMAIL").value.toLowerCase();
			if(!validateEmail(new_email_pretender)) {
				errorMessage("Invalid email address.<br>Please retry.");
			} else {
				new_userid = userIdFromEmail(new_email_pretender);
				if(new_userid == "") {
					errorMessage("Invalid email address.<br>Please retry.");
				} else {
					var http = new XMLHttpRequest();
					http.onreadystatechange = function() {
						if (http.readyState == XMLHttpRequest.DONE ) {
							if(http.status == 200) {
								if(http.responseText != "" && http.responseText == "NOT_FOUND") {
									go_create_account();
								} else {

									var nda = String(http.responseText);
									if(nda == "") {
										createJoin_show();
										errorMessage("Sorry, this account<br>cannot be added.");	
									} else {
										if(localServer) {
											add_pin_activate();
										} else {
											pin_callback_ok = "add_pin_activate()";
											pin_callback_back = "go_account_add()";
											go_wait_for_pin();
										}

									}
								};
							} else {
								errorMessage("Sorry, could not connect.<br>Please retry.");
							}
							waitbox_end();
						}
					}
					waitbox_start();
					
									
					var phonestr = (DOM("INPUT_PHONE_ADD").value).split(".").join("").split(" ").join("").split("-").join("");
					phonestr = (phonestr == "" ? "" : "&phone=" + phonestr);					
					http.open("GET", QUERY_URL + "?userpinadd&userid=" + new_userid + "&email=" + new_email_pretender + phonestr + "&local=" + (localServer ? "1" : "0"), true);
					http.send();
				}
			}
		}, 50);
	}, 150);
	
	
}
	
function add_pin_activate() {
	var dpin = (localServer ? "LOCAL" : DOM("PIN_ID").value);
	if(dpin.length == 4 || localServer) {
		var rpin = validFourDigits(dpin);
		if(rpin.valid == true || localServer) {
			var http = new XMLHttpRequest();
			http.onreadystatechange = function() {
				if (http.readyState == XMLHttpRequest.DONE ) {
					if(http.status == 200) {

						if(http.responseText == "EMPTY") {
							errorMessage("Sorry, could not load account information.");	
						} else {
						
							if(http.responseText != "" && http.responseText != "WRONG" && http.responseText != "EXISTS") {
								var nda = String(http.responseText).split("?~?");
								var new_firstname = nda[2];
								var new_lastname = nda[3];

								add_account_local(new_userid, new_email_pretender, new_firstname, new_lastname);
								document.location = ROOT_URL;
							} else {
								if(http.responseText == "WRONG") {
									// Wrong pin, not activated
									pin_error();
								} else {
									if(http.responseText == "EXISTS") {
										// Wrong pin, not activated
										pin_exists();
									} else {
										errorMessage("Sorry, could not connect.<br>Please retry.");									
									}
								}
							};
						}
					} else {
						errorMessage("Sorry, could not connect.<br>Please retry.");
					}
					waitbox_end()
				}
			}
			new_email_pretender = DOM("INPUT_ADD_EMAIL").value.toLowerCase();
			new_userid = userIdFromEmail(new_email_pretender);

		if(new_userid !== "") {
			waitbox_start();
			http.open("GET", QUERY_URL + "?addpinactivate&pin=" + (localServer ? "LOCAL" : rpin.pin) + "&email=" + new_email_pretender + "&userid=" + new_userid, true);
			http.send();
}			
		} else {
			pin_error();
		}
	} else {
		pin_error();
	}
}


function cancel_add_account() {
	DOM("CANCEL_ADD").className = "account_item_selected";
	setTimeout(function() {
		DOM("CANCEL_ADD").className = "account_item";
		createJoin_show();
	}, 150);
}