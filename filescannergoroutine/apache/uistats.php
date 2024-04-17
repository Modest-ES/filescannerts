<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
    <link rel="icon" href="ui/img/statslogo.png" />
    <link rel="stylesheet" type="text/css" href="ui/css/styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com " />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat&family=Roboto&display=swap">
    <title>File Scanner Stats</title>
</head>
<body>
    <div class="main-shell" id="directory-info">
        <?php
        if (isset($_GET['root'])) {
            $rootval = htmlspecialchars($_GET['root'], ENT_QUOTES, 'UTF-8');
        } else {
            $rootval = '/home';
        }

        if (isset($_GET['sort'])) {
            $sortval = htmlspecialchars($_GET['sort'], ENT_QUOTES, 'UTF-8');
        } else {
            $sortval = 'asc';
        }
        echo "<header>";
        echo "<div class='left-side'>";
        echo "<a href='http://localhost:9015/?root=" . $rootval . "&sort=" . $sortval . "' >";
        echo "<button class='btn-close'>";
        echo "<img src='ui/img/cross.png' alt='Close' title='Закрыть статистику'/>";
        echo "</button>";
        echo "</a>";
        echo "<h2>Статистика директорий</h2>";
        echo "</div>";
        echo "</header>";

        // $jsonUrl = 'http://localhost:9015/files?root=' . $rootval . '&sort=' . $sortval;

        // $jsonData = file_get_contents($jsonUrl);

        // if ($jsonData === false) {
        //     die('Error: Could not fetch the JSON data.');
        // }

        // $dataArray = json_decode($jsonData, true);

        // if ($dataArray === null) {
        //     die('Error: Could not decode the JSON data.');
        // }

        // print_r($dataArray);

        echo "<div class='content'>";
        $DBconnect = mysqli_connect("localhost","mainUser","passwordmain","mainDB");
        $result = mysqli_query($DBconnect,"SELECT * FROM fileStats");
        while($row = mysqli_fetch_array($result)) {
            echo "<div class='statline'>";
            echo "<p class='c-id'>" . $row['c_id'] . "</p>";
            echo "<p class='c-path'>" . $row['c_path'] . "</p>";
            echo "<p class='c-size'>" . $row['c_size'] . "</p>";
            echo "<p class='c-elapsed-time'>" . $row['c_elapsed_time'] . "</p>";
            echo "<p class='c-date'>" . $row['c_date'] . "</p>";
            echo "</div>";
        }
        mysqli_close($DBconnect);
        echo "</div>";
        echo "<footer>";
        echo "<p>® File Scanner 2024</p>";
        echo "</footer>";
        ?>
    </div>
</body>
</html>

