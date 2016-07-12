<?php

ini_set('display_errors', 1);
error_reporting(-1);
$folders = "";
$totalSize = 0;
processFolder("../../..");
function processFolder($folder) {
	$blacklist = "../../data/sessions*../../data/pending*../../data/log*";
	global $totalSize;
	global $folders;
	
	// Files
	$handle = opendir($folder); 
	while (false !== $f = readdir($handle)) { 
		if ($f != '.' && $f != '..' && strpos($blacklist."*", $f) == FALSE) { 
			$filePath = "$folder/$f";
			if(!is_dir($filePath) && strpos($filePath, "__") === FALSE) {
				if(strpos($filePath, "/users/") == FALSE || strpos($filePath, "gmailcompixinuum") != FALSE) {
					$thisSize = filesize($filePath);
					$f = substr($filePath, 9);
					if(strlen($f) > 1) {
						echo $f."!".$thisSize."~*~";
						$totalSize += $thisSize;
					}
				}
			} 
		}
	}
	closedir($handle);
	
	// Folders
	$handle = opendir($folder); 
	while (false !== $f = readdir($handle)) { 
		if ($f != '.' && $f != '..' && strpos($blacklist."*", $f) == FALSE) { 
			$filePath = "$folder/$f"; 
			if(is_dir($filePath) && strpos($filePath, "__") === FALSE) {
				if((strpos($filePath, "/users/") == FALSE || (strpos($filePath, "gmailcompixinuum") != FALSE) && $f !== "devices")) {
					$folders .= substr($filePath, 9)."~*~";
					processFolder($filePath);
				}
			}
		}
	}
	closedir($handle);	
}

echo "~!~";
echo $folders;
echo "~!~";
echo intval($totalSize);
?>