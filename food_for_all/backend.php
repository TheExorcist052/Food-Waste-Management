<?php
// Enable CORS and set headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Error handling configuration
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

// Database configuration
$host = "localhost";
$user = "root";
$password = "";
$dbname = "food_for_all";

// Create database connection
$conn = new mysqli($host, $user, $password, $dbname);

if ($conn->connect_error) {
    error_log("Database connection failed: " . $conn->connect_error);
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit();
}

// Get request data
$input = file_get_contents('php://input');
$data = json_decode($input, true) ?? $_POST;
$files = $_FILES ?? [];

// Helper function to validate required fields
function validateRequiredFields($data, $required) {
    $missing = [];
    foreach ($required as $field) {
        if (!isset($data[$field]) || $data[$field] === '') {
            $missing[] = $field;
        }
    }
    return $missing;
}

// User Registration
if (isset($data['register_user'])) {
    $required = ['user_type', 'username', 'email', 'password', 'phone', 'address'];
    
    if ($data['user_type'] === 'individual') {
        $required[] = 'national_id';
    }
    
    if ($data['user_type'] === 'restaurant') {
        $required = array_merge($required, ['restaurant_name', 'restaurant_type', 'business_license']);
    }
    
    $missing = validateRequiredFields($data, $required);
    if (!empty($missing)) {
        echo json_encode(["status" => "error", "message" => "Missing required fields: " . implode(", ", $missing)]);
        exit();
    }

    try {
        // Check if user exists
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
        $stmt->bind_param("ss", $data['email'], $data['username']);
        $stmt->execute();
        
        if ($stmt->get_result()->num_rows > 0) {
            echo json_encode(["status" => "error", "message" => "User with this email or username already exists"]);
            exit();
        }
        
        // Hash password
        $hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT);
        
        // Insert user
        $sql = "INSERT INTO users (user_type, username, email, password, phone, address, national_id, restaurant_name, restaurant_type, business_license) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        $nationalId = $data['national_id'] ?? null;
        $restaurantName = $data['restaurant_name'] ?? null;
        $restaurantType = $data['restaurant_type'] ?? null;
        $businessLicense = $data['business_license'] ?? null;
        
        $stmt->bind_param(
            "ssssssssss", 
            $data['user_type'],
            $data['username'],
            $data['email'],
            $hashedPassword,
            $data['phone'],
            $data['address'],
            $nationalId,
            $restaurantName,
            $restaurantType,
            $businessLicense
        );
        
        if ($stmt->execute()) {
            echo json_encode([
                "status" => "success", 
                "message" => "User registered successfully",
                "user_id" => $conn->insert_id
            ]);
        } else {
            throw new Exception("Database error: " . $conn->error);
        }
    } catch (Exception $e) {
        error_log("Registration error: " . $e->getMessage());
        echo json_encode(["status" => "error", "message" => "Registration failed"]);
    }
    exit();
}

// User Login
if (isset($data['login_user'])) {
    if (empty($data['username']) || empty($data['password'])) {
        echo json_encode(["status" => "error", "message" => "Username and password are required"]);
        exit();
    }

    try {
        $stmt = $conn->prepare("SELECT id, password, user_type, username, email, phone, address, restaurant_name, restaurant_type 
                               FROM users WHERE username = ? OR email = ?");
        $stmt->bind_param("ss", $data['username'], $data['username']);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            echo json_encode(["status" => "error", "message" => "User not found"]);
            exit();
        }

        $user = $result->fetch_assoc();
        if (password_verify($data['password'], $user['password'])) {
            $token = bin2hex(random_bytes(32));
            
            echo json_encode([
                "status" => "success",
                "message" => "Login successful",
                "user_id" => $user['id'],
                "user_type" => $user['user_type'],
                "username" => $user['username'],
                "email" => $user['email'],
                "phone" => $user['phone'],
                "address" => $user['address'],
                "restaurant_name" => $user['restaurant_name'],
                "restaurant_type" => $user['restaurant_type'],
                "token" => $token
            ]);
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid credentials"]);
        }
    } catch (Exception $e) {
        error_log("Login error: " . $e->getMessage());
        echo json_encode(["status" => "error", "message" => "Login failed"]);
    }
    exit();
}

// Guest Login
if (isset($data['guest_login'])) {
    try {
        $guestUsername = "guest_" . bin2hex(random_bytes(4));
        $stmt = $conn->prepare("INSERT INTO users (user_type, username) VALUES ('guest', ?)");
        $stmt->bind_param("s", $guestUsername);
        
        if ($stmt->execute()) {
            $guestId = $conn->insert_id;
            echo json_encode([
                "status" => "success",
                "message" => "Guest login successful",
                "user_id" => $guestId,
                "user_type" => "guest",
                "token" => bin2hex(random_bytes(32))
            ]);
        } else {
            throw new Exception("Database error: " . $conn->error);
        }
    } catch (Exception $e) {
        error_log("Guest login error: " . $e->getMessage());
        echo json_encode(["status" => "error", "message" => "Guest login failed"]);
    }
    exit();
}

// Submit Food (Donation/Discount)
if (isset($data['give_food'])) {
    $required = ['user_id', 'donor_name', 'food_type', 'give_type', 'expiry_date', 'location'];
    $missing = validateRequiredFields($data, $required);
    if (!empty($missing)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Missing fields: " . implode(", ", $missing)]);
        exit();
    }

    // Handle file upload
    $imagePath = null;
    if (!empty($files['food_image']['tmp_name'])) {
        $uploadDir = "uploads";
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        $ext = pathinfo($files['food_image']['name'], PATHINFO_EXTENSION);
        $filename = uniqid() . '.' . $ext;
        $targetPath = "$uploadDir/$filename";
        
        if (move_uploaded_file($files['food_image']['tmp_name'], $targetPath)) {
            $imagePath = $targetPath;
        }
    }

    // Set price and discount
    $price = 0;
    $discount = 0;
    if ($data['give_type'] === 'discount') {
        $price = $data['price'] ?? 0;
        $discount = $data['discount_percentage'] ?? 0;
        
        if (!is_numeric($price) || $price <= 0) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Invalid price"]);
            exit();
        }
        if (!is_numeric($discount) || $discount <= 0 || $discount > 100) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Invalid discount"]);
            exit();
        }
    }

    // Insert food item
    $stmt = $conn->prepare("INSERT INTO foods (user_id, donor_name, food_type, give_type, expiry_date, price, discount_percentage, image_path, location, status) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')");
    
    $stmt->bind_param(
        "issssdsss", 
        $data['user_id'],
        $data['donor_name'],
        $data['food_type'],
        $data['give_type'],
        $data['expiry_date'],
        $price,
        $discount,
        $imagePath,
        $data['location']
    );

    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success", 
            "message" => "Food submitted successfully",
            "food_id" => $conn->insert_id
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to submit food"]);
    }
    exit();
}

// Get Ongoing Donations
if (isset($_GET['get_donations'])) {
    try {
        $result = $conn->query("SELECT f.*, u.username FROM foods f JOIN users u ON f.user_id = u.id 
                               WHERE f.give_type = 'donation' AND f.status = 'available' 
                               ORDER BY f.created_at DESC");
        
        $donations = [];
        while ($row = $result->fetch_assoc()) {
            $donations[] = $row;
        }
        echo json_encode($donations);
    } catch (Exception $e) {
        error_log("Get donations error: " . $e->getMessage());
        echo json_encode(["status" => "error", "message" => "Failed to retrieve donations"]);
    }
    exit();
}

// Get Discounted Foods
if (isset($_GET['get_discounts'])) {
    try {
        $result = $conn->query("SELECT f.*, u.username FROM foods f JOIN users u ON f.user_id = u.id 
                               WHERE f.give_type = 'discount' AND f.status = 'available' 
                               ORDER BY f.created_at DESC");
        
        $discounts = [];
        while ($row = $result->fetch_assoc()) {
            $discounts[] = $row;
        }
        echo json_encode($discounts);
    } catch (Exception $e) {
        error_log("Get discounts error: " . $e->getMessage());
        echo json_encode(["status" => "error", "message" => "Failed to retrieve discounts"]);
    }
    exit();
}

// Checkout Process
if (isset($data['checkout'])) {
    if (empty($data['user_id']) || empty($data['items']) || empty($data['payment_method']) || 
        empty($data['name']) || empty($data['email']) || empty($data['phone']) || empty($data['address'])) {
        echo json_encode(["status" => "error", "message" => "Missing required data"]);
        exit();
    }

    $conn->begin_transaction();
    try {
        $totalPrice = 0;
        $deliveryFee = 40;
        
        $stmt = $conn->prepare("INSERT INTO transactions (
            user_id, food_id, quantity, total_price, delivery_fee, payment_method, status,
            customer_name, customer_email, customer_phone, customer_address
        ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)");
        
        foreach ($data['items'] as $item) {
            // Verify food item
            $checkStmt = $conn->prepare("SELECT status, price, discount_percentage, give_type FROM foods WHERE id = ?");
            $checkStmt->bind_param("i", $item['food_id']);
            $checkStmt->execute();
            $result = $checkStmt->get_result();
            
            if ($result->num_rows === 0) {
                throw new Exception("Food item not found");
            }
            
            $food = $result->fetch_assoc();
            
            if ($food['status'] !== 'available') {
                throw new Exception("Item no longer available");
            }
            
            if ($food['give_type'] !== $item['type']) {
                throw new Exception("Item type mismatch");
            }
            
            // Calculate price
            $price = $item['type'] === 'donation' ? 0 : 
                    $food['price'] * (1 - ($food['discount_percentage'] / 100));
            $totalPrice += $price * $item['quantity'];
            
            // Bind parameters
            $params = [
                (int)$data['user_id'],
                (int)$item['food_id'],
                (int)$item['quantity'],
                (float)($price * $item['quantity']),
                (float)$deliveryFee,
                $data['payment_method'],
                $data['name'],
                $data['email'],
                $data['phone'],
                $data['address']
            ];
            
            $stmt->bind_param("iiiddsssss", ...$params);
            
            if (!$stmt->execute()) {
                throw new Exception("Transaction failed: " . $conn->error);
            }
            
            // Mark food as claimed
            $updateStmt = $conn->prepare("UPDATE foods SET status = 'claimed' WHERE id = ?");
            $updateStmt->bind_param("i", $item['food_id']);
            if (!$updateStmt->execute()) {
                throw new Exception("Failed to update food status");
            }
        }
        
        $conn->commit();
        echo json_encode([
            "status" => "success", 
            "message" => "Order placed successfully", 
            "total_price" => $totalPrice,
            "delivery_fee" => $deliveryFee
        ]);
    } catch (Exception $e) {
        $conn->rollback();
        error_log("Checkout error: " . $e->getMessage());
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}

// Submit Review
if (isset($data['submit_review'])) {
    if (empty($data['user_id']) || empty($data['rating'])) {
        echo json_encode(["status" => "error", "message" => "User ID and rating are required"]);
        exit();
    }

    try {
        // Get the latest transaction for this user
        $stmt = $conn->prepare("SELECT id FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC LIMIT 1");
        $stmt->bind_param("i", $data['user_id']);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            throw new Exception("No transactions found for this user");
        }
        
        $transaction = $result->fetch_assoc();
        $transactionId = $transaction['id'];

        // Insert review
        $stmt = $conn->prepare("INSERT INTO reviews (user_id, transaction_id, rating, comment) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("iiis", 
            $data['user_id'],
            $transactionId,
            $data['rating'],
            $data['comment'] ?? ''
        );

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Review submitted successfully"]);
        } else {
            throw new Exception("Failed to submit review: " . $conn->error);
        }
    } catch (Exception $e) {
        error_log("Review submission error: " . $e->getMessage());
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}

// Get User Profile
if (isset($_GET['get_profile'])) {
    if (empty($_GET['user_id'])) {
        echo json_encode(["status" => "error", "message" => "User ID required"]);
        exit();
    }

    try {
        $stmt = $conn->prepare("SELECT id, username, email, phone, address, user_type, restaurant_name, restaurant_type 
                               FROM users WHERE id = ?");
        $stmt->bind_param("i", $_GET['user_id']);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            echo json_encode(["status" => "error", "message" => "User not found"]);
            exit();
        }
        
        $user = $result->fetch_assoc();
        echo json_encode(["status" => "success", "user" => $user]);
    } catch (Exception $e) {
        error_log("Get profile error: " . $e->getMessage());
        echo json_encode(["status" => "error", "message" => "Failed to retrieve profile"]);
    }
    exit();
}

// Get User Transactions
if (isset($_GET['get_transactions'])) {
    if (empty($_GET['user_id'])) {
        echo json_encode(["status" => "error", "message" => "User ID required"]);
        exit();
    }

    try {
        $stmt = $conn->prepare("SELECT t.*, f.food_type, f.donor_name, f.image_path, f.give_type 
                               FROM transactions t JOIN foods f ON t.food_id = f.id 
                               WHERE t.user_id = ? ORDER BY t.transaction_date DESC");
        $stmt->bind_param("i", $_GET['user_id']);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $transactions = [];
        while ($row = $result->fetch_assoc()) {
            $transactions[] = $row;
        }
        echo json_encode($transactions);
    } catch (Exception $e) {
        error_log("Get transactions error: " . $e->getMessage());
        echo json_encode(["status" => "error", "message" => "Failed to retrieve transactions"]);
    }
    exit();
}

// Get Reviews
if (isset($_GET['get_all_reviews'])) {
    try {
        $result = $conn->query("SELECT r.*, u.username, f.food_type 
                               FROM reviews r
                               JOIN users u ON r.user_id = u.id
                               JOIN transactions t ON r.transaction_id = t.id
                               JOIN foods f ON t.food_id = f.id
                               ORDER BY r.created_at DESC");
        
        $reviews = [];
        while ($row = $result->fetch_assoc()) {
            $reviews[] = $row;
        }
        echo json_encode($reviews);
    } catch (Exception $e) {
        error_log("Get all reviews error: " . $e->getMessage());
        echo json_encode(["status" => "error", "message" => "Failed to retrieve reviews"]);
    }
    exit();
}

// Get reviews for a specific user
if (isset($_GET['get_user_reviews'])) {
    if (empty($_GET['user_id'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "User ID required"]);
        exit();
    }

    try {
        $stmt = $conn->prepare("SELECT r.*, f.food_type 
                               FROM reviews r
                               JOIN transactions t ON r.transaction_id = t.id
                               JOIN foods f ON t.food_id = f.id
                               WHERE r.user_id = ?
                               ORDER BY r.created_at DESC");
        $stmt->bind_param("i", $_GET['user_id']);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $reviews = [];
        while ($row = $result->fetch_assoc()) {
            $reviews[] = $row;
        }
        echo json_encode($reviews);
    } catch (Exception $e) {
        error_log("Get user reviews error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to retrieve reviews"]);
    }
    exit();
}

// Get transactions eligible for review
if (isset($_GET['get_reviewable_transactions'])) {
    if (empty($_GET['user_id'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "User ID required"]);
        exit();
    }

    try {
        $stmt = $conn->prepare("SELECT t.id, t.transaction_date, f.food_type, f.donor_name
                               FROM transactions t
                               JOIN foods f ON t.food_id = f.id
                               WHERE t.user_id = ? 
                               AND t.status = 'delivered'
                               AND NOT EXISTS (
                                   SELECT 1 FROM reviews r 
                                   WHERE r.transaction_id = t.id
                               )
                               ORDER BY t.transaction_date DESC");
        $stmt->bind_param("i", $_GET['user_id']);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $transactions = [];
        while ($row = $result->fetch_assoc()) {
            $transactions[] = $row;
        }
        echo json_encode($transactions);
    } catch (Exception $e) {
        error_log("Get reviewable transactions error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to retrieve transactions"]);
    }
    exit();
}
if (isset($_GET['get_user_reviews'])) {
    if (empty($_GET['user_id'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "User ID required"]);
        exit();
    }

    try {
        $stmt = $conn->prepare("SELECT r.*, f.food_type 
                               FROM reviews r
                               JOIN transactions t ON r.transaction_id = t.id
                               JOIN foods f ON t.food_id = f.id
                               WHERE r.user_id = ?
                               ORDER BY r.created_at DESC");
        $stmt->bind_param("i", $_GET['user_id']);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $reviews = [];
        while ($row = $result->fetch_assoc()) {
            $reviews[] = $row;
        }
        echo json_encode($reviews);
    } catch (Exception $e) {
        error_log("Get user reviews error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to retrieve reviews"]);
    }
    exit();
}
// Test Endpoint
if (isset($_GET['test'])) {
    echo json_encode([
        "status" => "success", 
        "message" => "API is working",
        "timestamp" => date('Y-m-d H:i:s')
    ]);
    exit();
}

// Invalid Request
http_response_code(404);
echo json_encode(["status" => "error", "message" => "Invalid request"]);
$conn->close();
?>