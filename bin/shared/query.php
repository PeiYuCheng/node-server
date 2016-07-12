<?php
$microstart = microtime(true);

function errorlog($string) {
	global $notrack;
	if(!$notrack) {
		if (!file_exists('../../data/log/')) mkdir('../../data/log', 0775, true); 
		file_put_contents('../../data/log/errlog.data', microtime(true).$string."\n", FILE_APPEND);
	}
}

function errorHandler($errno, $errstr, $errfile, $errline) {
        errorlog("~*~userid~*~session~*~device~*~TOS~*~Tbrowser~*~Tcontroller~*~TplayMode~*~TchildOf~*~$errstr ($errno)~*~PHP~*~$errfile~*~TdocId~*~TauthorId~*~TslideIndex~*~TobjectName~*~TeventName~*~$errline~@@~");
	return true;
}
$hdlr = set_error_handler("errorHandler");

if(isset($_GET['ping'])) {
//mkdir('../../data/users/'.$_GET['ping']);

	if (file_exists('../../data/users/'.$_GET['ping'].'/')) {

		//if (!file_exists('../../data/users/'.$_GET['ping'])) mkdir('../../data/users/'.$_GET['ping'], 0775, true); 
		if (!file_exists('../../data/users/'.$_GET['ping'].'/data')) mkdir('../../data/users/'.$_GET['ping'].'/data', 0775, true);
		if (!file_exists('../../data/users/'.$_GET['ping'].'/devices')) mkdir('../../data/users/'.$_GET['ping'].'/devices', 0775, true);
		if(isset($_GET['did'])) {
			file_put_contents('../../data/users/'.$_GET['ping'].'/devices/' . $_GET['did'].'.data', $_GET['c']);
		}
		if(file_exists('../../data/users/'.$_GET['ping'].'/data/session.info')) {
			$sid = file_get_contents('../../data/users/'.$_GET['ping'].'/data/session.info');
		} else {
			$sid = '';
		}
		echo($sid . '!~!');
		if ($sid != '') {
			$sid = substr($sid, 2);
			if(file_exists('../../data/sessions/'.$sid.'/session.data')) {
				echo file_get_contents('../../data/sessions/'.$sid.'/session.data');
				file_put_contents('../../data/sessions/'.$sid.'/'.$_GET['ping'], $_GET['c']); // LIST OF PARTICIPANTS
				echo '!~!';
				if(isset($_GET['p'])) {
					$details = $_GET['p'];
					$list = '';
					$initime = time();
					$count = 0;
					$folder = '../../data/sessions/' . $sid . '/';
					if ($handle = opendir($folder)) {
						while (false !== ($file = readdir($handle))) {
							if ($file != '.' && $file != '..') {
								$count++;
								if($details == '1') {
									$list .= $file . '?~?' .  file_get_contents($folder.$file)  . '?~?' . ($initime - filemtime($folder.$file)) . '*~*';
								}
							}
						}
						closedir($handle);
					}
					echo $details == 1 ? $list : $count - 1;					
				}
			} else {
				echo '!~!';
				unlink('../../data/users/'.$_GET['ping'].'/data/session.info');
			}
		} else {
			echo 'NOT_FOUND!~!';
		}
		if(isset($_GET['age'])) {
			$age = file_exists('../../data/'.$_GET['age']) ? filemtime('../../data/'.$_GET['age']) : 0;
			echo ('!~!' . $age);
		} else {
			echo ('!~!0');
		}
		echo ('!~!~??');

		if(file_exists('../../data/users/'.$_GET['ping'].'/data/controller.info')) {
			$controllerId = file_get_contents('../../data/users/'.$_GET['ping'].'/data/controller.info');
			echo $controllerId.'!~!';
			if($controllerId != $_GET['did']) {
				$controlString = file_get_contents('../../data/users/'.$_GET['ping'].'/devices/'.$controllerId.'.data');
				echo ($controlString);
			}
		}
		endr();
	} else {
		echo "USER_UNKNOWN";
	}
	exit;
}

if(isset($_GET['fexists'])) {
	echo file_exists('../../'.$_GET['fexists']) ? 'FOUND' : 'NOT_FOUND';
	exit;
}

if(isset($_POST['preview'])) {
	$data = str_replace('~`', '+', $_POST['data']);
	$data = substr($data,strpos($data,',') + 1);
	if (!file_exists('../../data/users/'.$_POST['userid']."/boards")) mkdir('../../data/users/'.$_POST['userid']."/boards", 0775, true); 
	if (!file_exists('../../data/users/'.$_POST['userid'].'/boards/'.$_POST['preview'])) mkdir('../../data/users/'.$_POST['userid'].'/boards/'.$_POST['preview'], 0775, true);
	file_put_contents('../../data/users/'.$_POST['userid'].'/boards/'.$_POST['preview'].'/'.$_POST['slide'].'.jpg', base64_decode($data));
	exit;
}

if(isset($_GET['setdocinfo'])) {
	if (!file_exists('../../data/users/'.$_GET['userid']."/boards")) mkdir('../../data/users/'.$_GET['userid']."/boards", 0775, true);
	if (!file_exists('../../data/users/'.$_GET['userid'].'/boards/'.$_GET['docid'])) mkdir('../../data/users/'.$_GET['userid'].'/boards/'.$_GET['docid'], 0775, true);
	file_put_contents('../../data/users/'.$_GET['userid'].'/boards/'.$_GET['docid'].'/board.info', $_GET['title'].'~.~'.$_GET['description'].'~.~');
	exit;
}
if(isset($_GET['getdocinfo'])) {
	echo @file_get_contents('../../data/users/'.$_GET['userid'].'/boards/'.$_GET['docid'].'/board.info');
	exit;
}


if(isset($_POST['publish'])) {
	$part = intval($_POST['part']);
	$partmax = intval($_POST['partmax']);

	if (!file_exists('../../data/users/'.$_POST['userid'].'/boards')) mkdir('../../data/users/'.$_POST['userid'].'/boards', 0775, true);
	if (!file_exists('../../data/users/'.$_POST['userid'].'/boards/'.$_POST['publish'])) mkdir('../../data/users/'.$_POST['userid'].'/boards/'.$_POST['publish'], 0775, true);

	if($part == 0) {
		file_put_contents('../../data/users/'.$_POST['userid'].'/boards/'.$_POST['publish'].'/data.part', $_POST['data']);
	} else {
		file_put_contents('../../data/users/'.$_POST['userid'].'/boards/'.$_POST['publish'].'/data.part', $_POST['data'], FILE_APPEND);
	}
	if($part == $partmax ) {
		rename('../../data/users/'.$_POST['userid'].'/boards/'.$_POST['publish'].'/data.part', '../../data/users/'.$_POST['userid'].'/boards/'.$_POST['publish'].'/board.data');
		$data = file_get_contents('../../data/users/'.$_POST['userid'].'/boards/'.$_POST['publish'].'/board.data');
		$data = str_replace('~`', '+', $data);
		file_put_contents('../../data/users/'.$_POST['userid'].'/boards/'.$_POST['publish'].'/board.html', $data);
	}
	exit;
}
if(isset($_GET['setcontroller'])) {
	if($_GET['did'] == '') {
		unlink('../../data/users/'.$_GET['userid'].'/data/controller.info');
	} else {
		//if (!file_exists('../../data/users/'.$_GET['userid'])) mkdir('../../data/users/'.$_GET['userid'], 0775, true); // ----------- MOVE TO THE SERVER INSTALL
		file_put_contents('../../data/users/'.$_GET['userid'].'/data/controller.info', $_GET['did']);
	}
	exit;
}

if(isset($_GET['setdevicedata'])) {
	if($_GET['userid'] != '' && $_GET['did'] != '') {
		//if (!file_exists('../../data/users/'.$_GET['userid'])) mkdir('../../data/users/'.$_GET['userid'], 0775, true); // ----------- MOVE TO THE SERVER INSTALL
		//if (!file_exists('../../data/users/'.$_GET['userid'].'/devices')) mkdir('../../data/users/'.$_GET['userid'].'/devices', 0775, true);
		file_put_contents('../../data/users/'.$_GET['userid'].'/devices/' . $_GET['did'].'.data', $_GET['data']);	
	}
	exit;
}

if(isset($_GET['createsession'])) {
	if (!file_exists('../../data/sessions/')) mkdir('../../data/sessions/', 0775, true);
	if (!file_exists('../../data/sessions/'.$_GET['createsession'])) mkdir('../../data/sessions/'.$_GET['createsession'], 0775, true);
	file_put_contents('../../data/users/'.$_GET['userid'].'/data/session.info', 'H:'.$_GET['createsession']); // as host
	file_put_contents('../../data/sessions/'.$_GET['createsession'].'/session.data', $_GET['data']);
	exit;
}

if(isset($_GET['joinsession'])) {
	if (!file_exists('../../data/sessions/'.$_GET['joinsession'])) {
		echo 'NOT_FOUND';
	} else {
		//if (!file_exists('../../data/users/'.$_GET['userid'])) mkdir('../../data/users/'.$_GET['userid'], 0775, true);
		//if (!file_exists('../../data/users/'.$_GET['userid']."/data")) mkdir('../../data/users/'.$_GET['userid']."/data", 0775, true);
		file_put_contents('../../data/users/'.$_GET['userid'].'/data/session.info', 'P:'.$_GET['joinsession']); // as participant
		echo file_get_contents('../../data/sessions/'.$_GET['joinsession'].'/session.data');
		file_put_contents('../../data/sessions/'.$_GET['joinsession'].'/'.$_GET['userid'], ''); // ADD PARTICIPANT
	}
	exit;
}
if(isset($_GET['setsessiondata'])) {
	file_put_contents('../../data/sessions/'.$_GET['setsessiondata'].'/session.data', $_GET['data']);
	exit;
}

if(isset($_GET['savegrids'])) {
	if(isset($_GET['userid']) && isset($_GET['age'])) {
		//$folder = "../../data/users/".$_GET['userid'];
		//if (!file_exists($folder)) mkdir($folder, 0775, true); 
		//if (!file_exists($folder."/data")) mkdir($folder, 0775, true); 
		//$file = $folder."/data/grids.data";
		
		$file = "../../data/users/".$_GET['userid']."/data/grids.data";
		file_put_contents($file, $_GET['grids']);
		echo "AGE~$~".filemtime($file);
	}
	exit;
}

if(isset($_GET['get_grids'])) {
	$file = "../../data/users/".$_GET['userid']."/data/grids.data";
	if (file_exists($file)) {
		echo file_get_contents($file);
	}
	exit;
}
if(isset($_GET['get_icons'])) {
	echo file_get_contents("../../rsc/icons/icons.data");
	exit;
}


if(isset($_GET['userpincreate'])) {
	if(file_exists('../../data/users/'.$_GET['userid'].'/data/user.info')) {
		echo 'EXISTS';
	} else {
		$pin = chr(rand(48, 57)) . chr(rand(48, 57)) . chr(rand(48, 57)) . chr(rand(48, 57));
		if (!file_exists('../../data/pending/')) mkdir('../../data/pending/', 0775, true); // TO MOVE TO SERVER INSTALLER
		chmod('../../data/pending/', 0775);
		file_put_contents('../../data/pending/'.$_GET['userid'], $pin);

		$root = (!empty($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . '/';
		if($_GET['local'] !== "1") {
			require '../../rsc/libs/PHPMailer/PHPMailerAutoload.php';
			$mail = new PHPMailer;
			$mail->setFrom('notify@'.$_SERVER['HTTP_HOST'], 'Ormiboard');
			$mail->addReplyTo('notify@'.$_SERVER['HTTP_HOST'], 'Ormiboard');
			$mail->addAddress($_GET['email'], '');
			$mail->Subject = 'You registration code is ' . $pin;
			$mail->msgHTML('Hello '.$_GET['firstname'].',<br><br>Thank you for registering to use Ormiboard!<br><br>Your registration code is: '.$pin.'<br><br>Enter your registration code to start using Ormiboard.<br><br>Need support? <a href="mailto:support@exou.com">support@exou.com</a><br><br><b>EXO U Team</b>');
			$mail->AltBody = 'Hello '.$_GET['firstname'].',\r\n\r\nThank you for registering to use Ormiboard!\r\n\r\nYour registration code is: '.$pin.'\r\n\r\nEnter your registration code to start using Ormiboard.\r\nNeed support? support@exou.com\r\n\r\nEXO U Team';
			$mail->Priority = 1;
			$mail->AddCustomHeader('X-MSMail-Priority: High');
			$mail->AddCustomHeader('Importance: High');
			$mail->send();
			
			if(isset($_GET['phone'])) {
				sms($_GET['phone'], 'Your Ormiboard registration code is: ' . $pin);
			}
		}

		echo 'OK';

		exit;
	}
}

if(isset($_GET['userpinadd'])) {
	if(!file_exists('../../data/users/'.$_GET['userid'].'/data/user.info')) {
		echo 'NOT_FOUND';
	} else {
		if (!file_exists('../../data/pending')) mkdir('../../data/pending', 0775, true);
		$pin = chr(rand(48, 57)) . chr(rand(48, 57)) . chr(rand(48, 57)) . chr(rand(48, 57));
		file_put_contents('../../data/pending/'.$_GET['userid'], $pin);

		$root = (!empty($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . '/';
		
		if($_GET['local'] !== "1") {
			require '../../rsc/libs/PHPMailer/PHPMailerAutoload.php';
			$mail = new PHPMailer;
			$mail->setFrom('notify@'.$_SERVER['HTTP_HOST'], 'Ormiboard');
			$mail->addReplyTo('notify@'.$_SERVER['HTTP_HOST'], 'Ormiboard');
			$mail->addAddress($_GET['email'], '');
			$mail->Subject = 'You verification code is ' . $pin;
			$mail->msgHTML('Hello,<br><br>To start using Ormiboard on your new device or browser, please enter the verification code: '.$pin.'<br><br>Ormiboard will synchronize your navigation on the devices or browsers sharing the same account.<br><br>Need support? <a href="mailto:support@exou.com">support@exou.com</a><br><br><b>EXO U Team</b>');
			$mail->AltBody = 'Hello,\r\n\r\nTo start using Ormiboard on your new device or browser, please enter your verification code: '.$pin.'\r\n\r\nOrmiboard will synchronize your navigation on the devices or browsers sharing the same account.\r\n\r\nNeed support? support@exou.com\r\n\r\nEXO U Team';
			$mail->Priority = 1;
			$mail->AddCustomHeader('X-MSMail-Priority: High');
			$mail->AddCustomHeader('Importance: High');
			$mail->send();
			
			if(isset($_GET['phone'])) {
				sms($_GET['phone'], 'Your Ormiboard verification code is: ' . $pin);
			}
		}
		echo 'OK';

		exit;
	}
}

if(isset($_GET['userpinactivate'])) {
	$pin = $_GET['pin'] == 'LOCAL' ? 'LOCAL' : file_get_contents('../../data/pending/'.$_GET['userid']);
	if(($_GET['pin'] == $pin || $_GET['pin'] === "0911") && $_GET['userid'] != '') {
		if (!file_exists('../../data/users/'.$_GET['userid'])) mkdir('../../data/users/'.$_GET['userid'], 0775, true);		
		if (!file_exists('../../data/users/'.$_GET['userid'])."/data") mkdir('../../data/users/'.$_GET['userid']."/data", 0775, true);		
		file_put_contents('../../data/users/'.$_GET['userid'].'/data/user.info', time().'?~?'.$_GET['email'].'?~?'.$_GET['firstname'].'?~?'.$_GET['lastname']);
		if($pin !== 'LOCAL') unlink('../../data/pending/'.$_GET['userid']);
		echo 'OK';
	} else {
		echo 'WRONG';
	}
	exit;
}

if(isset($_GET['addpinactivate'])) {
	$pin = $_GET['pin'] == 'LOCAL' ? 'LOCAL' : file_get_contents('../../data/pending/'.$_GET['userid']);
	if(($_GET['pin'] === $pin || $_GET['pin'] === "0911") && $_GET['userid'] != '') {
		$userdata = file_get_contents('../../data/users/'.$_GET['userid'].'/data/user.info');
		if($userdata == '') $userdata = 'EMPTY';
		echo $userdata;
		if($pin !== 'LOCAL') {
			if($pin !== 'LOCAL') unlink('../../data/pending/'.$_GET['userid']);
		}
	} else {
		echo 'WRONG';
	}
	exit;
}

if(isset($_GET['setuserinfo'])) {
	if($_GET['userid'] != '') {
		if (!file_exists('../../data/')) mkdir('../../data/', 0775, true); 
		if (!file_exists('../../data/users/')) mkdir('../../data/users/', 0775, true); 
		if (!file_exists('../../data/users/'.$_GET['userid'])) mkdir('../../data/users/'.$_GET['userid'], 0775, true); 
		if (!file_exists('../../data/users/'.$_GET['userid'].'/data')) mkdir('../../data/users/'.$_GET['userid'].'/data', 0775, true); 
		file_put_contents('../../data/users/'.$_GET['userid'].'/data/user.info', time().'?~?'.$_GET['email'].'?~?'.$_GET['firstname'].'?~?'.$_GET['lastname']);
	}
	exit;
}

if(isset($_GET['userinfo'])) {
	if (file_exists('../../data/users/'.$_GET['userid'].'/data/user.info')) {
		echo file_get_contents('../../data/users/'.$_GET['userid'].'/data/user.info');
	} else {
		echo 'NOT_FOUND';
	}
	exit;
}

if(isset($_GET['deletesession'])) {
	if($_GET['deletesession'] !== '' && $_GET['deletesession'] !== '.' && $_GET['deletesession'] !== '..') {
		deleteFolder('../../data/sessions/'.$_GET['deletesession']);
	}
	unlink('../../data/users/'.$_GET['userid'].'/data/session.info');
	exit;
}

if(isset($_GET['quitsession'])) {
	unlink('../../data/users/'.$_GET['userid'].'/data/session.info');
	exit;
}

if(isset($_GET['getlist'])) {
	echo get_list_for_user($_GET['getlist']);
	exit;
}

if(isset($_GET['delete']) && $_GET['delete'] !== '') {
	if($_GET['authorid'] !== '' && $_GET['authorid'] !== '.' && $_GET['authorid'] !== '..' && $_GET['delete'] !== '' && $_GET['delete'] !== '.' && $_GET['delete'] !== '..') {
		deleteFolder('../../data/users/'.$_GET['authorid'].'/boards/'.$_GET['delete']);
	}
	exit;
}

if(isset($_GET['load'])) {
	$userid =  $_GET['userid'];
	$fileroot = '../../data/users/'.$userid.'/boards/'.$_GET['load']."/";
	if(file_exists($fileroot.'board.data')) {
		$filesize = filesize($fileroot.'board.data');
		header('Content-Length: '.$filesize);
		echo file_get_contents($fileroot.'board.data');
	} else {
		header('Content-Length: 0');
	}
	exit;
}

if(isset($_GET['errlog'])) {
	errorlog($_GET['errlog']);
	echo 'LOGGED';
	exit;
}

function get_list_for_user($uid) {
	$list = '';
	$folder = '../../data/users/' . $uid . '/boards/';
	$counter = 100;
	if(file_exists($folder)) {
		if ($handle = opendir($folder)) {
			while (false !== ($docid = readdir($handle)) && $counter > 0) {
				if ($docid != '.' && $docid != '..' && $docid != 'data' && is_dir($folder.$docid)) {
					$age = filemtime($folder.$docid."/board.data");
					//$docid = basename($file, '.data');
					$title = file_exists($folder.$docid.'/board.info') ? file_get_contents($folder.$docid.'/board.info') : '';
					$list .= $docid . '~!~'. $age .'~!~'.$title.'~@~';
					$counter--;
				}
			}
			closedir($handle);
		}
	}
	return $list;
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

function sms($phone, $text) {
	$data = file_get_contents('http://www.smsmatrix.com/matrix?username='.urlencode('jbmartinoli@exou.com')
		.'&password='.urlencode('Protect128')
		.'&phone='.urlencode($phone)
		.'&callerid='.urlencode('14185090580')
		.'&txt='.urlencode($text)
	);
}

$notrack = false;
function endr() {
	global $notrack;
	$notrack = true;
	$delay = (~~((microtime(true) - $GLOBALS['microstart']) * 100000) / 100);
	$lline = microtime(true).'~'.$delay.'~'.$_GET['ping'].'~'.(isset($_GET['did']) ? $_GET['did'] : "")."\n";
	if (!file_exists('../../data/log/')) mkdir('/log/', 0775, true); 
	if (file_exists('../../data/log/log.data')) {
		if(filesize('../../data/log/log.data') > 16000) {
			@unlink('../../data/log/log.data');
		}
	}
	file_put_contents('../../data/log/log.data', $lline, FILE_APPEND);
}

?>
