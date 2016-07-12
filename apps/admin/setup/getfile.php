<?php
require_once("setup_lib.php");
if($_SERVER['QUERY_STRING'] !== "") {
	$data = file_get_contents("../../../".$_SERVER['QUERY_STRING']);
	if(substr($_SERVER['QUERY_STRING'], -4) == ".php") {
		$data = str_replace("<"."?php", "<"."%php", $data);
	}
	echo $data;
}
?>