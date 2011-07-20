<?php
// import data to the database

$doc = new DOMDocument();
$doc->load("config.xml");
$mysqlDoc = $doc->getElementsByTagName("mysql");

$config = array(
'DB_HOST'=>$mysqlDoc->item(0)->getElementsByTagName("dbHost")->item(0)->nodeValue,
'DB_NAME'=>$mysqlDoc->item(0)->getElementsByTagName("dbName")->item(0)->nodeValue,
'DB_USER'=>$mysqlDoc->item(0)->getElementsByTagName("dbUser")->item(0)->nodeValue,
'DB_PWD'=>$mysqlDoc->item(0)->getElementsByTagName("dbPwd")->item(0)->nodeValue,
'DB_PORT'=>$mysqlDoc->item(0)->getElementsByTagName("dbPort")->item(0)->nodeValue,
'DB_PREFIX'=>$mysqlDoc->item(0)->getElementsByTagName("dbPrefix")->item(0)->nodeValue,
);

$webappRoot = $doc->getElementsByTagName("webappRoot")->item(0)->nodeValue;
$dst = $webappRoot."/data/wav/";
if(!isset($argv[1])){
    die("path required");
}
$folderPath = $argv[1];
$lastFolder = basename($folderPath);
#echo "lastFolder = $lastFolder\n\n";

#echo "dst = $dst\n\n";

if($lastFolder != ".svn"){
	mysql_connect($config['DB_HOST'].':'.$config['DB_PORT'], $config['DB_USER'], $config['DB_PWD']) or die("[ERROR]Failed to connect mysql");
	mysql_select_db($config['DB_NAME']) or die("[ERROR]Failed to select database");
	mysql_query("set names 'utf8'") or die("[ERROR]Failed to execute query");
	
	$dst = $dst.$lastFolder."/";
	$list = getTaskPath($dst);
	#print_r($list);
	#echo "\n\n\n";

	foreach ($list as $value) {
		$stdAnswers = "";
		$len = 0;
		echo $dst.$value."/autocheck.xml\n\n";
		if(file_exists($dst.$value."/autocheck.xml")){
			$stdAnswers = addslashes(file_get_contents($dst.$value."/autocheck.xml"));
			$len = file_get_contents($dst.$value."/len");
			$a = split("\.",$len);
			$ax = split(":",$a[0]);
			$len = $ax[0] * 60 + $ax[1];
		}
		$sql = "INSERT INTO ".$config['DB_PREFIX']."list(path, status, StdAnswers, audioLength)
	VALUES('/$lastFolder/$value', 0, '$stdAnswers', '$len')";
		$result = mysql_query($sql);
		if ($result) {
			echo "[OK]$sql\n";
		} else {
			echo "[ERROR]failed to execute: $sql\n";
		}
	}

	//generate file loadhits-input.csv
	//$sql = "SELECT id FROM ".$config['DB_PREFIX']."list ORDER BY id";
	//$fileContent = "id\n";
	//$result = mysql_query($sql);
	//while ($row = mysql_fetch_row($result)) {
	//    $fileContent .= $row[0]."\n";
	//}
	//echo $fileContent;
	//$fp=fopen("loadhits-input.csv",'w');
	//fwrite($fp,$fileContent);
	//fclose($fp);

	mysql_close();
}


function getTaskPath($path) {
    $list = array(
    );
    if (is_dir($path)) {
        $dir = opendir($path);
        while ($file = readdir($dir)) {
            if ($file != "." && $file != ".." && $file !=".svn") {
                #echo "getTaskPath = $path$file\n";
                #if ($file != "." && $file != ".." && is_dir("$path$file")) {
                #    $dir2 = opendir($path.$file);
                #    while ($file2 = readdir($dir2)) {
                #        if ($file2 != "." && $file2 != ".." && is_dir($path.$file.'/'.$file2)) {
                #            array_push($list, $file.'/'.$file2);
                array_push($list, $file);
                #        }
                #    }
                #}
            }
        }
        closedir($dir);
    } else {
        echo "$path is not a valid folder";
    }
    return $list;
}//dir_read*/
?>
