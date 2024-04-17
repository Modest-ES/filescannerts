<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
    <link rel="icon" href="http://localhost:9015/ui/img/logo.png" />
    <link rel="stylesheet" type="text/css" href="http://localhost:9015/ui/css/styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com " />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat&family=Roboto&display=swap">
    <title>File Scanner Stats</title>
</head>
<body>
    <!-- <div id="load-animation" class="load-animation">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    </div> -->
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
        echo "<button class='btn-back'>";
        echo "<img src='http://localhost:9015/ui/img/cross.png' alt='Close' title='Закрыть статистику'/>";
        echo "</button>";
        echo "</a>";
        echo "<h2>Статистика для директории : " . $rootval . "</h2>";
        echo "</div>";
        echo "</header>";
        // echo "<ul>";
        // echo "<li>" . $rootval . "</li>";
        // echo "<li>" . $sortval . "</li>";
        // echo "</ul>";

        $jsonUrl = 'http://localhost:9015/files?root=' . $rootval . '&sort=' . $sortval;

        $jsonData = file_get_contents($jsonUrl);

        if ($jsonData === false) {
            die('Error: Could not fetch the JSON data.');
        }

        $dataArray = json_decode($jsonData, true);

        if ($dataArray === null) {
            die('Error: Could not decode the JSON data.');
        }

        print_r($dataArray);
        ?>
    </div>
</body>
</html>

