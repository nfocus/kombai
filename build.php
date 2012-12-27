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
	
	$focus = array(
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
	
	foreach($focus as $file) {
		$content .= System::getTextContent("$file");
	}
	
	$content = preg_replace('/\/\/(.*)\n/im', " ", $content);

	$content = preg_replace('/\/\*([^\*])*\*\//i', " ", $content);

	$content = preg_replace('/\s+|\n|\f|\t|\r/i', " ", $content);

	System::putContentFile("focus.js", $content);
	
	echo $content;
?>