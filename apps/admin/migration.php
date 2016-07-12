
<!DOCTYPE html>
<HTML>
<HEAD>
	<title>Ormiboard Server Cleanup</title>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
	<meta http-equiv="Pragma" content="no-cache" />
	<meta http-equiv="Expires" content="0" />
	<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1, maximum-scale=1">
	<meta name="apple-mobile-web-app-capable" content="no">
	<link type="text/css" rel="stylesheet" href="/rsc/css/shared.css"/>
<style>
img { text-decoration: none; vertical-align: middle;}
a { text-decoration: none; vertical-align: middle;}
.DEL { font-family: regular; color:#D32B4F; font-size: 14px; }
</style>
</HEAD>

<BODY>
<?php



$usersCounter = 0;
$totalSize = 0;
$totalinodes = 0;
$actions = 0;

if ($handle = opendir('../../data/users')) {
    $blacklist = array('.', '..', '_deleted');
    while (false !== ($file = readdir($handle))) {
        if (!in_array($file, $blacklist)) {
			$Bfolder = '../../data/users/' . $file . '/';
			
			@mkdir($Bfolder."boards/");
			@mkdir($Bfolder."data/");
			@mkdir($Bfolder."devices/");
			
			@rename('../../data/users/' . $file . '/_user.info', '../../data/users/' . $file . '/data/user.info');
			@rename('../../data/users/' . $file . '/_session.info', '../../data/users/' . $file . '/data/session.info');
			@rename('../../data/users/' . $file . '/_grids.data', '../../data/users/' . $file . '/data/grids.data');
			
			
			
			if ($Bhandle = opendir($Bfolder)) {
				
				echo "<div style='font-family:regular; background-color:#FFFFFF; font-size: 20px; margin-top: 20px; margin-bottom: 20px; padding: 20px;'>";
				if(file_exists('../../data/users/' . $file . '/data/user.info') || @file_get_contents('../users/' . $file . '/data/user.info') != "") {
					echo "<div style='font-family:bold; font-size: 30px; color:#3BC79F;'>".$file."</div>";
				} else {
					echo "<div style='font-family:bold; font-size: 30px; color:#D32B4F;'>".$file."</div>";
					
					$newmail = "me@anonymous.cloud";
					if(strpos($file, "exoucom") === 0) {
						$newmail = substr($file, 7)."@exou.com";
					} else if(strpos($file, "gmailcom") === 0) {
						$newmail = substr($file, 8)."@gmail.com";
					}
					$actions++;
					$udata = time()."?~?".$newmail."?~?Anonymous?~?User";
					echo "Created settings: ".$newmail."<br>";
					
					file_put_contents('../../data/users/' . $file . '/data/user.info', $udata);
				}
				
				echo "user: ".@file_get_contents('../../data/users/' . $file . '/data/user.info')."<br>";
				echo "session: ".@file_get_contents('../../data/users/' . $file . '/data/session.info')."<br>";
				echo "grids: ".@file_get_contents('../../data/users/' . $file . '/data/grids.info')."<br>";
				echo "<br>";
				$H = "";
				while (false !== ($Bfile = readdir($Bhandle))) {
					if($Bfile !== "" && $Bfile !== "." && $Bfile !== ".." && $Bfile !== "..") {
						
						$fileroot = $Bfolder.substr($Bfile, 0, strrpos($Bfile, '.'));
						$targetroot = $Bfolder."/boards/".substr($Bfile, 0, strrpos($Bfile, '.'));
						
						if (substr($Bfile, strrpos($Bfile, '.') + 1) == 'data') {
							$H  .= "<div class='DEL'>TO MOVE: ".$Bfile."</div>";
							@mkdir($targetroot);
							@rename($fileroot.".data", $targetroot."/board.data");
							@rename($fileroot.".html", $targetroot."/board.html");
							@rename($fileroot.".def", $targetroot."/board.info");
							for($ptr = 0; $ptr < 50; $ptr++) {
								@rename($fileroot."_".$ptr.".jpg", $targetroot."/".$ptr.".jpg");
							}
						}
						
							$fileroot = $targetroot;
									
							if (is_dir($fileroot)) {
								if($FBhandle = opendir($fileroot)) {		
									// ---------------------------------------------
									
									while (false !== ($FBfile = readdir($FBhandle))) {
										if($FBfile !== "" && $FBfile !== "." && $FBfile !== "..") {
											
											//if (is_dir($FBfile)) {
											
												$fileroot = $Bfolder."boards/".$FBfile."/";
												
												$H .= $fileroot."board.html"."<br>";
												if(!file_exists(  $fileroot."board.html")) {
													$H .= "<div class='DEL'>HTML not found - <a target='_blank' href='/editor.html?owner=".$file."&id=".substr($FBfile, 0, strrpos($FBfile, '.'))."'>REBUILD</a></div>";
												} else {
													$fdata = file_get_contents($fileroot."board.html");	
													if(strpos($fdata, "/com/portable.css") !== FALSE) {
														$H .= "<div class='DEL'>DEPRECIATED - <a target='_blank' href='/editor.html?owner=".$file."&id=".substr($FBfile, 0, strrpos($FBfile, '.'))."'>REBUILD</a></div>";
													}
												}
												
												if(!file_exists(  $fileroot."0.jpg")) {
													$H .= "<div class='DEL'>Preview not found - <a target='_blank' href='/editor.html?owner=".$file."&id=".substr($FBfile, 0, strrpos($FBfile, '.'))."'>REBUILD</a></div>";
												}
												$H .= "<a target='_blank' href='/data/users/".$file."/boards/".$FBfile."/board.html'><img style='border:0px; width:100px;' src='/data/users/".$file."/boards/".$FBfile."/0.jpg'></a> ";
												$H .= "<a target='_blank' href='/editor.html?owner=".$file."&id=".substr($FBfile, 0, strrpos($FBfile, '.'))."'>E</a> ";
										//	}
										}
									}
									$H .= "<br>";
								//	$H .= "</div>";
									
									closedir($FBhandle);
								}	
														
							//}
						
						
						
						
						
						}
					}
				}
				echo "<br>" . $H;
				echo "</div>";
				
				closedir($Bhandle);
				

				
				$usersCounter++;
			}
        }
    }
    closedir($handle);
    
    echo "<div style='padding: 44px; font-family: light; color:#303030; font-size: 30px;'>";
    echo "Actions: " .$actions. "<br>" ;
    echo "Users: " .$usersCounter. "<br>" ;
    echo "Usage: ". (intval($totalSize / 1024 / 1024 * 10) / 10)." MB<br>";
    echo "</div>";
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
</BODY>
</HTML>

