<?php
if(empty($_GET['id'])){
	header("HTTP/1.0 404 Not Found");
	die('{}');
}
//header("Content-type: text/xml");
header("Content-type: text/javascript");
include("common.php");

$listDB = new LisDB();
$item = $listDB->getTask2ById($_GET['id']);
echo json_encode($item);

?>