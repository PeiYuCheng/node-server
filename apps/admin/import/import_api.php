<?php
ini_set('display_errors', 1);
error_reporting(-1);

if(isset($_GET['import'])) {
	//$previewFolder = '../../../data/import/'.$_GET['userid'] . '_' . $_GET['targetdocid']."/";
	$url = $_GET['import'];
	
	if(strpos($url, "/users/") !== false) {
		@mkdir('../../../data/users/' . $_GET['userid'] . '/boards/');
		@mkdir('../../../data/users/' . $_GET['userid'] . '/boards/' . $_GET['targetdocid']);
		if(!copy($url, '../../../data/users/' . $_GET['userid'] . '/boards/' . $_GET['targetdocid'] .  '/board.data')) {
			echo "FAIL";
			exit;
		}
		echo "OK";
		exit;
	}

}

?>