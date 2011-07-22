<?php
/**
 * Get system setting
 * @return Array
 */
function getConfig(){
	return array(
	'DB_TYPE'=>'mysql',
	'DB_HOST'=>'localhost',
	'DB_NAME'=>'zzzzz',
	'DB_USER'=>'zzzzz',
	'DB_PWD'=>'zzzzzzz',
	'DB_PORT'=>'zzzz',
	'DB_PREFIX'=>'zzzzzz',
	);
}

class LisDB{
	private $link;

	private $config;

	function __construct(){
		$this->config = getConfig();
		$this->link = mysql_connect($this->config['DB_HOST'].':'.$this->config['DB_PORT'], $this->config['DB_USER'], $this->config['DB_PWD']) or die("failed to connect mysql");
		mysql_select_db($this->config['DB_NAME'], $this->link) or die("failed to select database");
		mysql_query("set names 'utf8'", $this->link) or die("failed to execute query");
	}

	function __destruct(){
		mysql_close($this->link);
	}

	/**
	 * Get HITs to publish, of which status=0
	 * @return Array
	 */
	function getAvailTask(){
		$list = array();
		$sql = "SELECT id,path,status
			FROM ".$this->config['DB_PREFIX']."list
			WHERE status='0'";
		$result = mysql_query($sql, $this->link);
		while ($row = mysql_fetch_object($result)) {
			array_push($list, $row);
		}
		return $list;
	}
	
	/**
	 * Get Transcription HIT details
	 * @param int $id
	 * @return stdClass
	 */
	function getTaskById($id){
		$sql = "SELECT id,path,status
			FROM ".$this->config['DB_PREFIX']."list
			WHERE id='$id'";
		$result = mysql_query($sql);
		if ($row = mysql_fetch_object($result)) {
			return $row;
		}
		return new stdClass;
	}
	
	/**
	 * Get Validation HIT details
	 * @param int $id
	 * @return stdClass
	 */
	function getTask2ById($id){
		$sql = "SELECT id,path,status,StdQuestions
			FROM ".$this->config['DB_PREFIX']."list2
			WHERE id='$id'";
		$result = mysql_query($sql);
		if ($row = mysql_fetch_object($result)) {
			return $row;
		}
		return new stdClass;
	}
}


?>
