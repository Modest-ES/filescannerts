<?php
    $jsonByteArray = file_get_contents('php://input');

    $jsonString = '';
    for ($i = 0; $i < strlen($jsonByteArray); $i++) {
        $jsonString .= chr(ord($jsonByteArray[$i]));
    }
    $data = json_decode($jsonString, true); 
    
    if ($data !== null) {

        $rootPath = $data['RootPath'];
        $duration = $data['Duration'];
        $status = $data['Status'];
        $errorMessage = $data['ErrorMessage'];

        $sizeSum = 0;
        foreach ($data['FilesList'] as $file) {
            $sizeSum += $file['FileSize'];
        }
        $DBconnect = mysqli_connect("localhost","mainUser","passwordmain","mainDB");
        $result = mysqli_query($DBconnect,"INSERT INTO mainDB.fileStats(c_path, c_size, c_elapsed_time, c_date) VALUES ('" . $rootPath . "', '" . $sizeSum . "', '" . $duration . "', NOW())");
        mysqli_close($DBconnect);
    }
?>

