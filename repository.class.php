<?php
		
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

class Web extends System {
		
		protected static $arrRoad;
		protected static $arrName;
		protected static $arrType;
		protected static $arrPath;
		protected static $arrTime;
		
		protected static $localPath = 'www';
		
		protected static function sleep($time = 1) {
			sleep($time);
		}
		protected static function getNodeViaId($index = '<>') {
			if (!file_exists("relationship/$index")) return null;
			$property = unserialize(parent::getTextContent("property/$index"));
			$relationship = unserialize(parent::getTextContent("relationship/$index"));
			return new Node($index, $property, $relationship);
		}
		protected static function loadPrototype() {
			self::$arrName = unserialize(parent::getTextContent('common/nodeName'));
			self::$arrPath = unserialize(parent::getTextContent('common/nodePath'));
			self::$arrType = unserialize(parent::getTextContent('common/nodeType'));
			self::$arrRoad = unserialize(parent::getTextContent('common/pathNode'));
			self::$arrTime = unserialize(parent::getTextContent('common/timeView'));
		}
		protected static function savePrototype() {
			parent::putContentFile('common/pathNode', serialize(self::$arrRoad));
			parent::putContentFile('common/nodeName', serialize(self::$arrName));
			parent::putContentFile('common/nodePath', serialize(self::$arrPath));
			parent::putContentFile('common/nodeType', serialize(self::$arrType));
			parent::putContentFile('common/timeView', serialize(self::$arrTime));
		}
}

class Node extends Web {
		
		public $nodeName;
		public $nodePath;
		public $nodeType;
		public $timeView;
			
		private $transparent;
		private $index;
		private $property;
		private $relationship;
		
		public function Node($index, $property, $relationship) {
			$this->nodeName = parent::$arrName[$index];
			$this->nodePath = parent::$arrPath[$index];
			$this->nodeType = parent::$arrType[$index];
			$this->timeView = parent::$arrTime[$index];
			$this->index = $index;
			$this->property = $property;
			$this->relationship = $relationship;
		}
		public function removeSelf() {
			if ($this->transparent) return;
			//unlock
			if (file_exists('common/running')) {
				parent::sleep();
				$this->removeSelf();
			}
			parent::createFile('common/running');
			$this->transparent = true;
			parent::loadPrototype();
			//remove from road map
			foreach ($this->nodePath as $path) {
				if (count(parent::$arrRoad[$path]) > 1) {
					$position = array_search($this->index, parent::$arrRoad[$path]);
					unset(parent::$arrRoad[$path][$position]);
				} else unset(parent::$arrRoad[$path]);
			}
			//remove from prototype
			unset(parent::$arrName[$this->index]);
			unset(parent::$arrPath[$this->index]);
			unset(parent::$arrType[$this->index]);
			unset(parent::$arrTime[$this->index]);
			parent::savePrototype();
			//update recyclebin
			$recycle = unserialize(parent::getTextContent('common/recycleBin'));
			if (!isset($recycle[$this->index])) {
				array_push($recycle, $this->index);
				parent::putContentFile('common/recycleBin', serialize($recycle));
			}
			//remove content
			parent::removePath("content/$this->index");
			//remove property
			parent::removePath("property/$this->index");
			//remove relationship
			foreach ($this->relationship['parentNodes'] as $index) {
				$relationship = unserialize(parent::getTextContent("relationship/$index"));
				unset($relationship['childNodes'][$this->index]);
				parent::putContentFile("relationship/$index", serialize($relationship));
			}
			foreach ($this->relationship['friendNodes'] as $index) {
				$relationship = unserialize(parent::getTextContent("relationship/$index"));
				unset($relationship['friendNodes'][$this->index]);
				parent::putContentFile("relationship/$index", serialize($relationship));
			}
			foreach ($this->relationship['childNodes'] as $index) {
				$relationship = unserialize(parent::getTextContent("relationship/$index"));
				unset($relationship['parentNodes'][$this->index]);
				parent::putContentFile("relationship/$index", serialize($relationship));
			}
			parent::removePath("relationship/$this->index");
			//remove interface;
			$this->nodeName = null;
			$this->nodePath = null;
			$this->nodeType = null;
			$this->timeView = null;
			//unlock
			parent::removePath('common/running');
		}	
		
		public function allowParent($parentNode = '') {
			if ($this->transparent) return;
			if (!is_object($parentNode) || $parentNode->timeView > $this->timeView) return;
			if ($parentNode->hasChild($this)) return;
			//lock
			if (file_exists('common/running')) {
				parent::sleep();
				$this->allowParent($parentNode);
			}
			parent::createFile('common/running');
			parent::loadPrototype();
			
			array_push($this->relationship['parentNodes'], $parentNode->getId());
			parent::putContentFile("relationship/$this->index", serialize($this->relationship));
			
			$relationship = unserialize(parent::getTextContent('relationship/'.$parentNode->getId()));
			array_push($relationship['childNodes'], $this->index);
			parent::putContentFile('relationship/'.$parentNode->getId(), serialize($relationship));
			
			//update node path 
			if ($this->nodePath[0] == $this->nodeName) unset($this->nodePath[0]);
			foreach ($parentNode->nodePath as $path) {
				$newPath = $path.'/'.$this->nodeName;
				array_push($this->nodePath, $newPath);
				//create path node
				if (isset(parent::$arrRoad[$newPath])) {
					array_push(parent::$arrRoad[$newPath], $this->index);
				} else parent::$arrRoad[$newPath] = array($this->index);
			}
			parent::$arrPath[$this->index] = $this->nodePath;
			parent::putContentFile('common/nodePath', serialize(parent::$arrPath));
			//update path node
			if (isset(parent::$arrRoad[$this->nodeName])) {
				if (count(parent::$arrRoad[$this->nodeName]) > 1) {
					unset(parent::$arrRoad[$this->nodeName][$this->index]);
				} else unset(parent::$arrRoad[$this->nodeName]);
			}
			parent::putContentFile('common/pathNode', serialize(parent::$arrRoad));
			//unlock
			parent::removePath('common/running');
		}
		public function allowFriend($friendNode = '') {
			if ($this->transparent) return;
			if (!is_object($friendNode)) return;
			if ($this->hasChild($friendNode) || $friendNode->hasChild($this)) return;
			if ($this->hasFriend($friendNode) || $friendNode->hasFriend($this)) return;
			//lock
			if (file_exists('common/running')) {
				parent::sleep();
				$this->allowParent($parentNode);
			}
			parent::createFile('common/running');
			parent::loadPrototype();
			
			array_push($this->relationship['friendNodes'], $friendNode->getId());
			parent::putContentFile("relationship/$this->index", serialize($this->relationship));
			$relationship = unserialize(parent::getTextContent('relationship/'.$friendNode->getId()));
			array_push($relationship['friendNodes'], $this->index);
			parent::putContentFile('relationship/'.$friendNode->getId(), serialize($relationship));
			//unlock
			parent::removePath('common/running');
		}
		
		public function rename($newName = '') {
		
		}
		// working with relationship of node
		public function findParentsByName($nodeName = '') {
			if ($this->transparent) return;
			$result = array();
			foreach($this->relationship['parentNodes'] as $index) {
				if ($nodeName == parent::$arrName[$index]) {
					array_push($result, parent::getNodeViaId($index));
				}
			}
			return $result;
		}
		public function findParentsByType($nodeType = '') {
			if ($this->transparent) return;
			$result = array();
			foreach($this->relationship['parentNodes'] as $index) {
				if ($nodeType == parent::$arrType[$index]) {
					array_push($result, parent::getNodeViaId($index));
				}
			}
			return $result;
		}
		public function findFriendsByName($nodeName = '') {
			if ($this->transparent) return;
			$result = array();
			foreach($this->relationship['friendNodes'] as $index) {
				if ($nodeName == parent::$arrName[$index]) {
					array_push($result, parent::getNodeViaId($index));
				}
			}
			return $result;
		}
		public function findFriendsByType($nodeType = '') {
			if ($this->transparent) return;
			$result = array();
			foreach($this->relationship['friendNodes'] as $index) {
				if ($nodeType == parent::$arrType[$index]) {
					array_push($result, parent::getNodeViaId($index));
				}
			}
			return $result;
		}
		public function findChildsByName($nodeName = '') {
			if ($this->transparent) return;
			$result = array();
			foreach($this->relationship['childNodes'] as $index) {
				if ($nodeName == parent::$arrName[$index]) {
					array_push($result, parent::getNodeViaId($index));
				}
			}
			return $result;
		}
		public function findChildsByType($nodeType = '') {
			if ($this->transparent) return;
			$result = array();
			foreach($this->relationship['childNodes'] as $index) {
				if ($nodeType == parent::$arrType[$index]) {
					array_push($result, parent::getNodeViaId($index));
				}
			}
			return $result;
		}
		public function hasParent($parentNode) {
			if ($this->transparent) return;
			if (!is_object($parentNode)) return false;
			if (in_array($parentNode->getId(), $this->relationship['parentNodes'])) return true;
			return false;
		}
		public function hasFriend($friendNode) {
			if ($this->transparent) return;
			if (!is_object($friendNode)) return false;
			if (in_array($friendNode->getId(), $this->relationship['friendNodes'])) return true;
			return false;
		}
		public function hasChild($childNode) {
			if ($this->transparent) return;
			if (!is_object($childNode)) return false;
			if (in_array($childNode->getId(), $this->relationship['childNodes'])) return true;
			return false;
		}
		public function getId() {
			if ($this->transparent) return;
			return $this->index;
		}
		//working with content of Node
		public function getContent() {
			if ($this->transparent) return;
			return parent::getContentFile("content/$this->index");
		}
		public function setContent($content = '') {
			if ($this->transparent) return;
			//lock content
			if (file_exists("common/$this->index")) {
				parent::sleep();
				$this->setContent($content);
			}
			parent::createFile("common/$this->index");

			if ($this->nodeType !== 'folder') {
				parent::putContentFile("content/$this->index", $content);
			}
			//unlock
			parent::removePath("common/$this->index");
		}
		//working with property of Node
		public function hasProperty($name = '') {
			if ($this->transparent) return;
			if (array_key_exists($name, $this->property)) return true;
			return false;
		}
		public function getProperty($name = '') {
			if ($this->transparent) return;
			return $this->property[$name];
		}
		public function setProperty($name = '', $value = '') {
			if ($this->transparent || $name == '') return;
			//lock property
			if (file_exists("common/$this->index")) {
				parent::sleep();
				$this->setProperty($name, $value);
			}
			parent::createFile("common/$this->index");
			
			$this->property[$name] = $value;
			if (file_exists("property/$this->index")) {
				parent::putContentFile("property/$this->index", serialize($this->property));
			}
			//unlock
			parent::removePath("common/$this->index");
		}
		public function removeProperty($name = '') {
			if ($this->transparent || $name == '') return;
			//lock property
			if (file_exists("common/$this->index")) {
				parent::sleep();
				$this->setProperty($name, $value);
			}
			parent::createFile("common/$this->index");
			
			if (array_key_exists($name, $this->property)) {
				unset($this->property[$name]);
				if (file_exists("property/$this->index")) {
					parent::putContentFile("property/$this->index", serialize($this->property));
				}
			}
			//unlock
			parent::removePath("common/$this->index");
		}
}

class Session extends Web {

		public function createNode($content = '', $nodeName = '', $nodeType = 'file/text') {
			if (file_exists('common/running')) {
				parent::sleep();
				$this->createNode($content, $nodeName, $nodeType);
			}
			parent::createFile('common/running');
			parent::loadPrototype();
			$recycle = unserialize(parent::getTextContent('common/recycleBin'));
			$index = array_shift($recycle);
			if (isset($index)) {
				parent::putContentFile('common/recycleBin', serialize($recycle));
			} else {
				$index = parent::getTextContent("common/nodeIndex") + 1;
				parent::putContentFile('common/nodeIndex', $index);
			}
			parent::createFile("content/$index", $content);
			parent::$arrName[$index] = $nodeName;
			parent::$arrPath[$index] = array($nodeName);
			parent::$arrType[$index] = $nodeType;
			parent::$arrTime[$index] = date("Y:m:d H:i:s:").microtime()*10E6;
			if (!isset(parent::$arrRoad[$nodeName])) {
				parent::$arrRoad[$nodeName] = array($index);
			} else if (!in_array($index, parent::$arrRoad[$nodeName])) {
				array_push(parent::$arrRoad[$nodeName], $index);
			}
			parent::savePrototype();
			$property = array('status' => 'public');
			parent::createFile("property/$index", serialize($property));
			$relationship = array(
				'parentNodes' => array(),
				'friendNodes' => array(),
				'childNodes' => array());
			parent::createFile("relationship/$index", serialize($relationship));
			parent::removePath('common/running');
			return new Node($index, $property, $relationship);
		}
		public function importPath($path = '<>', $nodeName = '', $parentNode = null) {
			if (is_file($path)) {
				$nodeContent = parent::getContentFile($path);
				$nodeName = ($nodeName == '') ? parent::getFileName($path): $nodeName;
				$nodeType = parent::getMimeType($path);
				$babyNode = $this->createNode($nodeContent, $nodeName, $nodeType);
				if (isset($parentNode)) $babyNode->allowParent($parentNode);
			} else if(is_dir($path)) {
				$nodeName = ($nodeName == '') ? parent::getFolderName($path): $nodeName;
				$nodeType = parent::getMimeType($path);
				$babyNode = $this->createNode('', $nodeName, $nodeType);
				if (isset($parentNode)) $babyNode->allowParent($parentNode);
				$contentFolder = scandir($path);
				foreach ($contentFolder as $item) {
					if ($item == '.' || $item == '..') continue;
					$this->importPath($path.'/'.$item, $item, $babyNode);
				}
			}
		}
		public function getNodeById($index = '<>') {
			return parent::getNodeViaId($index);
		}
		public function getNodesByName($name = '') {
			$result = array();
			foreach(parent::$arrName as $index => $nodeName) {
				if ($name == $nodeName) {
					$node = parent::getNodeViaId($index);
					array_push($result, $node);
				}
			}
			return $result;
		}
		public function getNodesByPath($path = '') {
			$result = array();
			if (array_key_exists($path, parent::$arrRoad)) {
				foreach(parent::$arrRoad[$path] as $index) {
					array_push($result, parent::getNodeViaId($index));
				}
			}
			return $result;
		}
		public function getNodesByType($type = '') {
			$result = array();
			foreach(parent::$arrType as $index => $nodeType) {
				if ($type == $nodeType) array_push($result, parent::getNodeViaId($index));
			}
			return $result;
		}
}

class PC extends Web {
		
		protected static $homePath;
		protected static $workPath;
		
		public static function createLocation($name = '<>') {
			if (!isset(self::$homePath)) self::$homePath = dirname(__FILE__);
			if (!isset(self::$workPath)) self::$workPath = getcwd();
			chdir(self::$homePath);
			$location = parent::$localPath.'/'.$name;
			if (!is_dir($location)) {
				parent::createPath($location);
				chdir($location);
				
				parent::createFolder('common');
				parent::createFolder('content');
				parent::createFolder('property');
				parent::createFolder('relationship');
				
				parent::createFile('common/nodeIndex', 999999999);
				parent::createFile('common/nodeName', serialize(array()));
				parent::createFile('common/nodePath', serialize(array()));
				parent::createFile('common/nodeType', serialize(array()));
				parent::createFile('common/pathNode', serialize(array()));
				parent::createFile('common/timeView', serialize(array()));
				parent::createFile('common/recycleBin', serialize(array()));
				
				chdir(self::$workPath);
			}
			return self::openLocation($name);
		}
		
		public static function openLocation($name = '<>') {
			if (!isset(self::$homePath)) self::$homePath = dirname(__FILE__);
			if (!isset(self::$workPath)) self::$workPath = getcwd();
			chdir(self::$homePath);
			$location = parent::$localPath.'/'.$name;
			if (!is_dir($location)) {
				chdir(self::$workPath);
				return;
			}
			chdir($location);
			parent::loadPrototype();
			return new Session();
        }
		
		public static function closeLocation($name = '<>') {
			$location = parent::$localPath.'/'.$name;
			if (!is_dir($location)) return;
			if (file_exists('common/running')) {
				parent::sleep();
				self::saveLocation();
			}
			chdir(self::$workPath);
		}
		
		public static function destroyLocation($name = '<>') {
			chdir(self::$homePath);
			$location = parent::$localPath.'/'.$name;
			if (is_dir($location)) parent::removePath($location);
			chdir(self::$workPath);
		}
}

$Pcr =  PC::createLocation('src');
$Root = $Pcr->createNode('This is content of root node', 'root');

if (isset($Root)) {
	echo "Tao dung node thanh cong: <b>".$Root->nodeName."</b>";
	echo "<br> Noi dung node vua tao: <b>".$Root->getContent()."</b>";
} else {
	echo "Qua trinh tao bi loi";
}
PC::closeLocation('src');
?>