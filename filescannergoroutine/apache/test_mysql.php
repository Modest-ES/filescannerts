<?php
$DBconnect=mysqli_connect("localhost","phpUser","password","testDB");
$result = mysqli_query($DBconnect,"SELECT * FROM breakfastMenu");
while($row = mysqli_fetch_array($result))
    printf("FOOD: %s, DESCRIPTION: %s", $row['food'], $row['description']);
mysqli_close($DBconnect);
?>