<?php
date_default_timezone_set("Asia/Krasnoyarsk");
		
class System {
		
		public static function getData($path = '<>', $offset = 4, $seek = 0) {
			if (!is_file($path) && !file_exists($path)) return false;
			$file = fopen($path, 'r');
			fseek($file, $seek, 0);
			$marker = fread($file, $offset);
			fclose($file);
			$marker = unpack("H*", $marker);
			//echo "$marker[1]<br>";
			return $marker[1];
		}
		
		public static function checkMediaFile($path = '<>') {
			$data = self::getData($path);
			return ($data == "3026b275" || $data == "49443303" ||
					$data == "52494646" || $data == "52494646");
		}
		public static function checkImageFile($path = '<>') {
			$data = self::getData($path);
			return ($data == "ffd8ffe0" || $data == "89504e47" ||
					$data == "47494638" || $data == "424d36c4");
		}
		public static function checkFlashFile($path = '<>') {
			$data = self::getData($path);
			return ($data == "464c5601" || $data == "25504446");
		}
		public static function checkAppFile($path = '<>') {
			$data = self::getData($path);
			return ($data == "4d5a9000" || $data == "4d5a5000");
		}
		
		public static function checkTextFile($path = '<>') {
			$data = self::getData($path);
			return (
				//meida file
				$data != "3026b275" && $data != "49443303" &&
				$data != "52494646" && $data != "52494646" &&
				//image file
				$data != "ffd8ffe0" && $data != "89504e47" &&
				$data != "47494638" && $data != "424d36c4" &&
				//flash file
				$data != "464c5601" && $data != "25504446" &&
				//app file
				$data != "4d5a9000" && $data != "4d5a5000" ||
				//empty file
				$data == null 
			);
		}
		
		public static function getMimeType($path = '<>') {
			if (is_dir($path)) return 'folder';
			else if (self::checkTextFile($path)) return 'file/text';
			else if (self::checkMediaFile($path)) return 'file/media';
			else if (self::checkImageFile($path)) return 'file/image';
			else if (self::checkFlashFile($path)) return 'file/flash';
			else if (self::checkAppFile($path)) return 'file/application';
		}
		
		public static function createFile($path = '', $content = '') {
			if (file_exists($path)) return;
			file_put_contents($path, $content);
		}
		public static function createFolder($path = '', $mode = 0700) {
			if (is_dir($path)) return;
			mkdir($path, $mode);
		}
		public static function getContentFile($path = '<>') {
			if (!file_exists($path)) return null;
			if (self::checkTextFile($path)) {
				return file_get_contents($path);
			} else {
				$file = fopen($path, 'r');
				if (filesize($path)) return fread($file, filesize($path));
				else return null;
			}
		}
		public static function getTextContent($path = '<>') {
			if (file_exists($path)) return file_get_contents($path);
			return null ;
		}
		public static function putContentFile($path = '', $content = '') {
			file_put_contents($path, $content);
		}
		public static function addContentFile($path = '<>', $content = '') {
			if (file_exists($path)) file_put_contents($path, file_get_contents($path).$content);
			else file_put_contents($path = '', $content = '');
		}
		public static function getFileName($path = '<>') {
			if (is_file($path)) return basename($path);
			return null;
		}
		public static function getFolderName($path = '<>') {
			if (is_file($path)) {
				$folder = pathinfo($path);
				$path = $folder['dirname'];
			}
			if (is_dir($path)) {
				$path = str_replace(dirname($path), '', $path);
				return preg_replace('/^(\/|\\\)/', '', $path);
			} 
			return null;
		}
		public static function createPath($path = '', $isFile = false) {
			$part = explode('/', $path);
			$dir = '';
			$size = count($part);
			for ($i = 0; $i < $size; $i++) {
				if ($dir == '') $dir = $part[0];
				else $dir = $dir.'/'.$part[$i];
				if (!file_exists($dir)) mkdir($dir);
			}
			if ($isFile && !is_file($dir)) {
				rmdir($dir);
				fopen($path, 'a');
			}
		}
		public static function removePath($path = '<>') {
			if (is_file($path)) {
				unlink($path);
			} else if(is_dir($path)) {
				$folder = escapeshellarg($path);
				if (stristr(PHP_OS, 'WIN')) exec("rmdir /s /q $folder");
				else exec("rm -rf $folder");
			}
		}
		public static function copyPath($source = '<>', $dest = '<>') {
			if ($dest == '') return;
			if (is_file($source)) {
				copy($source, $dest);
			} else if (is_dir($source)) {
				if (!is_dir($dest)) mkdir($dest);
				$source = escapeshellarg($source);
				$dest = escapeshellarg($dest);
				if (stristr(PHP_OS, 'WIN')) {
					$source = str_replace('/', '\\', $source);
					$dest = str_replace('/', '\\', $dest);
					exec("xcopy $source $dest /e /y");
				} else {
					exec("cp -r $source $dest");
				}
			}
		}
		public static function movePath($source = '<>', $dest = '<>') {
			if (is_file($dest) || is_dir($dest)) {
				self::copyPath($source, $dest);
				self::removePath($source);
			}
		}
		public static function renamePath($source = '<>', $dest = '<>') {
			$source = escapeshellarg($source);
			$dest = escapeshellarg($source);
			if(is_file($source)) rename($source, $dest);
			if (dirname($source) !== dirname($dest)) return;
			if (stristr(PHP_OS, 'WIN')) {
				$source = str_replace('/', '\\', $source);
				$dest = preg_replace('/(.*)(\/|\\\)/', '', $dest);
				exec("rename $source $dest");
			} else {
				exec("mv $source $dest");
			}
		}
}
?>