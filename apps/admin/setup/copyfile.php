<?php
require_once("setup_lib.php");
if($_SERVER['QUERY_STRING'] !== "") {
	$data = file_get_contents($SERVER_SRC."apps/admin/setup/getfile.php?".$_SERVER['QUERY_STRING']);
	if(substr($_SERVER['QUERY_STRING'], -4) == ".php") {
		$data = str_replace("<"."%php", "<"."?php", $data);
	}
	file_put_contents($targetURL.$_SERVER['QUERY_STRING'], $data);
}
echo $_SERVER['QUERY_STRING'];
?>