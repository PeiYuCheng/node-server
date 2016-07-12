<?php

/** Build icons.data file, cleanup file names */

ini_set('display_errors', 1);
error_reporting(-1);
$file = "";
processFolder(".");
file_put_contents("icons.data", $file);
echo("<a href='icons.data'>icons.data</a> built.");

function processFolder($folder) {
	global $file;
	if($folder !== ".") {
		$file .= ":".substr($folder, 2)."*";
	}
	// Files
	$currentFolder = "";
	$handle = opendir($folder); 
	while (false !== $f = readdir($handle)) { 
		if ($f != '' && $f != '.' && $f != '..') { 
			$filePath = $folder."/".$f;
			if(!is_dir($filePath)) {
				if(substr($f, -4) === ".svg") {
					$nf = $f;
					$nf = str_replace(" and ", " ", $nf);
					$nf = str_replace(" with ", " ", $nf);
					$nf = str_replace(" (Flat)", "", $nf);
					$nf = str_replace(" ", "_", $nf);
					$nf = str_replace("'", "", $nf);
					if(strpos($nf, " - ") !== FALSE) {
						$nf = explode(" - ", $nf)[1];
					}
					
					if($f !== $nf) {
						rename($folder."/".$f, $folder."/".$nf);
					}
					$file .= $nf."*";
				}
			} else {
				processFolder($filePath);
			}
		}
	}
	closedir($handle);
/*	
	// Folders
	$handle = opendir($folder); 
	while (false !== $f = readdir($handle)) { 
		if ($f != '.' && $f != '..' && strpos("$blacklist", $f) == FALSE) { 
			$filePath = "$folder/$f"; 
			if(is_dir($filePath) && strpos($filePath, "__") === FALSE) {
				if(strpos($filePath, "/users/") == FALSE || (strpos($filePath, "gmailcompixinuum") != FALSE && $f !== "devices")) {
					processFolder($filePath);			
				}
			}
		}
	}
	closedir($handle);	
	*/
}

?>