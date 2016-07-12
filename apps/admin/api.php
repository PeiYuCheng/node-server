<?php
ini_set('display_errors', 1);
error_reporting(-1);

if(isset($_GET['user_delete'])) {
	if($_GET['user_delete'] !== "gmailcompixinuum" && $_GET['user_delete'] !== "examplecommano" && $_GET['user_delete'] !== "") {
		deleteFolder("../../data/users/" . $_GET['user_delete']);
		echo "OK";
	}
	exit;
}

function deleteFolder($path) {
    if (is_dir($path) === true) {
        $files = array_diff(scandir($path), array('.', '..'));
        foreach ($files as $file) {
            deleteFolder(realpath($path) . '/' . $file);
        }
        rmdir($path);
    } else if (is_file($path) === true) {
        return unlink($path);
    }
    return false;
}

?>