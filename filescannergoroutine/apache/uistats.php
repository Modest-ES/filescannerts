<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
    <link rel="icon" href="ui/img/statslogo.png" />
    <link rel="stylesheet" type="text/css" href="ui/css/styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com " />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat&family=Roboto&display=swap">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
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
        echo "<div class='canvas-shell'>";
        echo "<canvas id='statsChart'></canvas>";
        echo "</div>";
        echo "<div class='content'>";
        echo "<div class='statline'>";
        echo "<p class='c-id'>ID</p>";
        echo "<p class='c-path'>Директория</p>";
        echo "<p class='c-size'>Размер (бит)</p>";
        echo "<p class='c-elapsed-time'>Время подсчета</p>";
        echo "<p class='c-date'>Дата/Время запроса</p>";
        echo "</div>";

        $sizeValues = [];
        $elapsedTimeValues = [];

        $DBconnect = mysqli_connect("localhost","mainUser","passwordmain","mainDB");
        $result = mysqli_query($DBconnect,"SELECT c_id, c_path, c_size, c_elapsed_time, c_date FROM fileStats");
        while($row = mysqli_fetch_array($result)) {
            echo "<div class='statline'>";
            echo "<p class='c-id'>" . $row['c_id'] . "</p>";
            echo "<p class='c-path'>" . $row['c_path'] . "</p>";
            echo "<p class='c-size'>" . $row['c_size'] . "</p>";
            array_push($sizeValues, intval($row['c_size']));
            echo "<p class='c-elapsed-time'>" . $row['c_elapsed_time'] . "</p>";
            if (substr($row['c_elapsed_time'], -2) === 'ms') {
                array_push($elapsedTimeValues, floatval(substr($row['c_elapsed_time'], 0, -2)) * 1000);
            } else {
                array_push($elapsedTimeValues, floatval(substr($row['c_elapsed_time'], 0, -2)));
            }
            echo "<p class='c-date'>" . $row['c_date'] . "</p>";
            echo "</div>";
        }
        mysqli_close($DBconnect);
        echo "</div>";
        echo "<footer>";
        echo "<p>® File Scanner 2024</p>";
        echo "</footer>";

        $jsonData = json_encode([
            'sizeValues' => $sizeValues,
            'elapsedTimeValues' => $elapsedTimeValues
        ]);
        ?>
    </div>
    <script>
        var data = <?php echo $jsonData; ?>;

        var ctx = document.getElementById('statsChart').getContext('2d');
        var myChart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Elapsed Time vs Size',
                    data: data.sizeValues.map(function(size, index) {
                        return {
                            x: data.elapsedTimeValues[index],
                            y: size
                        };
                    }),
                    backgroundColor: 'rgba(254, 185, 22, 0.6)',
                    showLine: true
                }]
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Elapsed Time (µs)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Size (bytes)'
                        }
                    }
                }
            }
        });
    </script>
</body>
</html>

