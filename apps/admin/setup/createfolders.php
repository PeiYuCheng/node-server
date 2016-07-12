<?php
require_once("setup_lib.php");
if($_SERVER['QUERY_STRING'] !== "") {
	$data = explode("~*~", $_SERVER['QUERY_STRING']);
	 foreach($data as $key => $value) {
		if($value !== "") {
			@mkdir($targetURL."/".$value, 0775);
			//@chmod($targetURL."/".$value, 0775);
		}
	}
}
?>