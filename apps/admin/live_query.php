<?php

if (file_exists("../../data/log/errlog.data")) {
	echo filesize("../../data/log/errlog.data")."*";
} else {
	echo "0*";
}
echo @file_get_contents('../../data/log/log.data');
?>