<?php

ini_set('display_errors', 1);
error_reporting(-1);
$SERVER_SRC = "http://exoroot.com/";
//$SERVER_SRC = "http://vr/";
$simulationMode = gethostname() === "VR";
$targetURL = $simulationMode ? "../../../__simulated/" : "../../../";
if($simulationMode) {
	if (!file_exists($targetURL)) mkdir($targetURL, 0775, true); 
}
?>