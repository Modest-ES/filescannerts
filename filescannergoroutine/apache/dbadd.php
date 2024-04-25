<?php
    include 'dbconnect.php';
    $jsonByteArray = file_get_contents('php://input');

    $jsonString = '';
    for ($i = 0; $i < strlen($jsonByteArray); $i++) {
        $jsonString .= chr(ord($jsonByteArray[$i]));
    }
    $data = json_decode($jsonString, true); 

    if ($data !== null) {
        try {
            if (empty($data['RootPath'])) {
                throw new Exception('Поле RootPath пустое');
            }
            if (empty($data['Duration'])) {
                throw new Exception('Поле Duration пустое');
            }
            if (empty($data['DirectorySize'])) {
                throw new Exception('Поле DirectorySize пустое');
            }

            $rootPath = $data['RootPath'];
            $duration = $data['Duration'];
            $directorySize = $data['DirectorySize'];

            $DBconnect = $connection;
            if (!$DBconnect) {
                throw new Exception('Ошибка подключения к базе данных: ' . mysqli_connect_error());
            }

            $result = mysqli_query($DBconnect,"INSERT INTO mainDB.fileStats(c_path, c_size, c_elapsed_time, c_date) VALUES ('" . $rootPath . "', '" . $directorySize . "', '" . $duration . "', NOW())");
            if (!$result) {
                throw new Exception('Ошибка запроса на добавление в базу данных: ' . mysqli_error($DBconnect));
            }

            mysqli_close($DBconnect);

            echo json_encode(['status' => 'success', 'message' => 'Данные успешно добавлены']);
        } catch (Exception $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Данные отсутствуют']);
    }
?>

