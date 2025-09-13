<?php
$host = 'localhost';
$dbname = 'food_for_all';
$username = 'root'; 
$password = ''; // Default XAMPP password is empty

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Test connection
    $pdo->query("SELECT 1");
} catch (PDOException $e) {
    // Create database if it doesn't exist
    if ($e->getCode() === 1049) { // Database doesn't exist
        $pdo = new PDO("mysql:host=$host", $username, $password);
        $pdo->exec("CREATE DATABASE $dbname");
        $pdo->exec("USE $dbname");
        
        // Run your schema SQL here or include it from a file
        $schema = file_get_contents('food_for_all.sql');
        $pdo->exec($schema);
    } else {
        die("Database connection failed: " . $e->getMessage());
    }
}
?>