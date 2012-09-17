<?php
	include("system.class.php");
	
	$dfocus = array(
		"module/core.js",
		"module/ajax.js",
		"module/html.js",
		"module/drag.js",
		"module/canvas.js",
		"module/transform.js",
		"plugin/debug.js"
	);
	
	$nfocus = array(
		"module/core.js",
		"module/ajax.js",
		"module/html.js",
		"module/drag.js"
	);
	
	$content = "";
	
	foreach($dfocus as $file) {
		$content .= "\n\n\n\n\n\n\n\n\n";
		$content .= System::getTextContent("$file");
	}
	
	System::putContentFile("dfocus.js", $content);
	
	$content = "";
	
	foreach($nfocus as $file) {
		$content .= "\n\n\n\n\n\n\n\n\n";
		$content .= System::getTextContent("$file");
	}
	
	System::putContentFile("nfocus.js", $content);
	
	echo $content;
?>