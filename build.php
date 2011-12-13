<?php
	include("system.class.php");
	
	$dfocus = array(
		"core.js",
		"ajax.js",
		"html.js",
		"dragdrop.js",
		"debug.js",
		"canvas.js",
		"transform.js"
	);
	
	$nfocus = array(
		"core.js",
		"ajax.js",
		"html.js",
		"dragdrop.js"
	);
	
	$content = "";
	
	foreach($dfocus as $file) {
		$content .= "\n\n\n\n\n\n\n\n\n";
		$content .= System::getTextContent("module/$file");
	}
	
	System::putContentFile("dfocus.js", $content);
	
	$content = "";
	
	foreach($nfocus as $file) {
		$content .= "\n\n\n\n\n\n\n\n\n";
		$content .= System::getTextContent("module/$file");
	}
	
	System::putContentFile("nfocus.js", $content);
	
	echo $content;
?>