
 
function createJoin_show() {
	DOM("GET_INFO").style.display = "none";
	DOM("GET_PIN").style.display = "none";
	DOM("ADD_USER").style.display = "none";
	DOM("ADD_OR_CREATE").style.display = "block";
	refresh_users_list();
}
/*
function cj_create() { 
console.log("cj_create")
	DOM("CJ_CREATE").style.backgroundColor = "#D8374D";
	setTimeout(function() {
		DOM("CJ_CREATE").style.backgroundColor = "#F47F43";
		window.setTimeout(function() {
			go_create_account();
		}, 50);
	}, 150);
}
*/
function cj_add() {
	DOM("CJ_ADD").className = "account_item_selected";
	DOM("INPUT_ADD_EMAIL").value = "";
	setTimeout(function() {
		DOM("CJ_ADD").className = "account_item";
		window.setTimeout(function() {
			go_account_add();
		}, 50);
	}, 150);
}

function cj_cancel() {
	DOM("CJ_CANCEL").className = "account_item_selected";
	setTimeout(function() {
		DOM("CJ_CANCEL").className = "account_item";
		window.setTimeout(function() {
			document.location = ROOT_URL;
		}, 50);
	}, 150);
}

var currentUserSelectedIndex = -1;
function refresh_users_list() {
	var H = "";
	var count = 0;
	var cindex = 0;
	for(var index in users) {
		if(users[index] !== null) {
			count++;
		}
	}
	
	for(var index in users) {
		if(users[index] !== null) {
			var isGoogle = users[index].email.indexOf("@gmail.com") > -1;
			var typicon = "<img src='/rsc/images/" + (isGoogle ? "google.png" : "ormiboard.svg") + "' style='margin-top: -3px; vertical-align: middle; padding-right: 8px; width: 30px;'>";
			
			var es = "";
			if(count > 1) {
				es = "border-radius: 0px; border-bottom: 0px;";
				if(count > 1 && cindex === 0)  es = "border-radius: 10px 10px 0px 0px; border-bottom: 0px; ";
				if(count > 1 && cindex === count - 1)  es = "border-radius: 0px 0px 10px 10px; ";
			}
			var theclass = userid == users[index].userid ? "account_item_selected" : "account_item";
			if(userid == users[index].userid) {
				currentUserSelectedIndex = index;
			}
			H += "<div id='ACCOUNT_ITEM_"+index+"' class='"+theclass+"' style='"+es+"' onclick='switch_account("+index+")'>";
			H += typicon + users[index].firstname + " " + users[index].lastname;
			H += "</div>";
			cindex++;
		}
	}
	DOM("ALL_USERS_LIST").innerHTML = H;
}

function switch_account(index) {
	if(currentUserSelectedIndex > -1) {
		DOM("ACCOUNT_ITEM_" + currentUserSelectedIndex).className = "account_item";
	}
	DOM("ACCOUNT_ITEM_" + index).className = "account_item_selected";
	
	signoutClearData();
	
	setTimeout(function() {
		var cid = memget("controllerid");
		var did = memget("deviceid");
		if(cid === did) {
			query("setcontroller&did=&userid=" + userid, function(status, result) {
				memset("controllerid", cid);
				apply_account(index);
				document.location = ROOT_URL;
			});
		} else {
			setTimeout(function() {
				apply_account(index);
				document.location = ROOT_URL;
			}, 50);
		}
	}, 150);
}