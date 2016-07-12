<?php

if(isset($_GET['list'])) {
	$data = "";
	if($_GET['userid'] !== "") {
		if (!file_exists('../../data/users/'.$_GET['userid'])) mkdir('../../data/users/'.$_GET['userid'], 0775, true); 
		if (!file_exists('../../data/users/'.$_GET['userid']."/apps")) mkdir('../../data/users/'.$_GET['userid']."/apps", 0775, true); 
		if (!file_exists('../../data/users/'.$_GET['userid']."/apps/docs")) mkdir('../../data/users/'.$_GET['userid']."/apps/docs", 0775, true); 
		$data = @file_get_contents('../../data/users/'.$_GET['userid'].'/apps/docs/docs.list');
	}
	echo $data;
}

if(isset($_GET['load'])) {
	echo "";
}

if(isset($_GET['save'])) {
	echo "";
}


?>