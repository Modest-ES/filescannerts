<?php
    echo "<h1>DB ADD</h1>";

    $json = file_get_contents('php://input');
    echo "Received JSON Data:<br>";
    echo "<pre>";
    print_r($json);
    echo "</pre>";
    // Decode the JSON data into an associative array
    $data = json_decode($json, true);
    
    // Check if the decoding was successful
    if ($data !== null) {
        // Output the JSON data
        echo "Received JSON Data:<br>";
        echo "<pre>";
        print_r($data);
        echo "</pre>";
    } else {
        // If the JSON could not be decoded, output an error message
        echo "Error: Invalid JSON data received.";
    }
?>