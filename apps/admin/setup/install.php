<br><br><center>Please wait...</center>
<?php

$SERVER_SRC = "http://exoroot.com/";

if(!file_exists("apps/admin/setup/index.php")) {
	if (!file_exists("apps")) @mkdir("apps", 0775, true); 
	if (!file_exists("apps")) {
		echo "Cannot create folder. Please check access rights.";
	} else {
		if (!file_exists("apps/admin")) mkdir("apps/admin", 0775, true); 
		if (!file_exists("apps/admin/setup")) mkdir("apps/admin/setup", 0775, true); 
		
		copyFile("apps/admin/setup/copyfile.php");
		copyFile("apps/admin/setup/createfolders.php");
		copyFile("apps/admin/setup/files.php");
		copyFile("apps/admin/setup/getfile.php");
		copyFile("apps/admin/setup/index.php");
		copyFile("apps/admin/setup/setup.php");
		copyFile("apps/admin/setup/setup.css");
		copyFile("apps/admin/setup/setup_lib.php");
		echo "<script>document.location = 'apps/admin/setup/index.php';</script>";
	}
} else {
	echo "<script>document.location = 'apps/admin/setup/index.php';</script>";
}

function copyFile($file) {
	global $SERVER_SRC;
	//$data = file_get_contents($SERVER_SRC.$file);
	$data = file_get_contents($SERVER_SRC."apps/admin/setup/getfile.php?".$file);
	if(substr($file, -4) == ".php") {
		$data = str_replace("<"."%php", "<"."?php", $data);
	}
	file_put_contents($file, $data);
}



?>