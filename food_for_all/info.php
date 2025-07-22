<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Define database credentials
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "food_for_all";

// Create and initialize the connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check the connection for errors
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} else {
    echo "Database connected successfully!";
}

// Handle User Registration
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['register_user'])) {
    $username = $_POST['username'];
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

    $stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $username, $email, $password);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "User registered successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Registration failed"]);
    }

    $stmt->close();
}

// Handle Volunteer Registration
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['register_volunteer'])) {
    $full_name = $_POST['full_name'];
    $email = $_POST['email'];
    $phone = $_POST['phone'];
    $address = $_POST['address'];
    $availability = $_POST['availability'];
    $experience = $_POST['experience'];
    $interests = isset($_POST['interests']) ? implode(",", $_POST['interests']) : "";
    $transportation = $_POST['transportation'];

    $stmt = $conn->prepare("INSERT INTO volunteers (full_name, email, phone, address, availability, experience, interests, transportation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssssss", $full_name, $email, $phone, $address, $availability, $experience, $interests, $transportation);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Volunteer registered successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Registration failed"]);
    }

    $stmt->close();
}

// Handle Food Donation
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['donate_food'])) {
    $donor_name = $_POST['donor_name'];
    $food_type = $_POST['food_type'];
    $donation_type = $_POST['donation_type'];
    $expiry_date = $_POST['expiry_date'];
    $food_image = "";

    // Handle image upload
    if (isset($_FILES['food_image'])) {
        $target_dir = "uploads/";
        $target_file = $target_dir . basename($_FILES['food_image']['name']);
        if (move_uploaded_file($_FILES['food_image']['tmp_name'], $target_file)) {
            $food_image = $target_file;
        }
    }

    $stmt = $conn->prepare("INSERT INTO donations (donor_name, food_type, donation_type, expiry_date, food_image) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $donor_name, $food_type, $donation_type, $expiry_date, $food_image);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Donation submitted successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Donation submission failed"]);
    }

    $stmt->close();
}

$conn->close();
?>
