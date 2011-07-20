<?php
//header("Content-type: text/xml");
header("Content-type: text/javascript");
include("common.php");

$listDB = new LisDB();
$list = $listDB->getAvailTask();
if(($count = count($list))>0){
	srand((double)microtime()*1000000);
	$itemIndex = rand(0, $count - 1);

	$item = $list[$itemIndex];

	//display item
	echo json_encode($item);
	//	$fileName = $item->path."/session.xml";
	//	$fp=fopen($fileName, 'r');
	//	while (!feof($fp)){
	//		$line = fgets($fp);
	//		echo $line;
	//	}
}
?>