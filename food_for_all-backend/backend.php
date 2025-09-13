<?php
// backend.php - Food For All Backend API

ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Cache-Control");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (ob_get_level()) {
    ob_clean();
}

session_start();

// --- DATABASE & OTP CONFIG ---
$host = 'localhost';
$dbname = 'food_for_all';
$username = 'root';
$password = '';
define('OTP_LOG_FILE', __DIR__ . '/otp_log.txt');
define('OTP_EXPIRY_SECONDS', 600); // 10 minutes

// --- HELPER FUNCTIONS ---
function sendResponse($success, $message, $data = null) {
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit();
}

function generateImageUrl($title) {
    $keywords = strtolower(preg_replace('/[^a-z0-9, ]/i', '', $title));
    $keywords = urlencode(str_replace(' ', ',', $keywords));
    // Using a reliable placeholder service to simulate AI image generation
    return "https://placehold.co/400x300/22c55e/FFFFFF?text=" . urlencode($title);
}

function timeAgo($datetime, $full = false) {
    $now = new DateTime;
    $ago = new DateTime($datetime);
    $diff = $now->diff($ago);
    $diff->w = floor($diff->d / 7);
    $diff->d -= $diff->w * 7;
    $string = ['y' => 'year','m' => 'month','w' => 'week','d' => 'day','h' => 'hour','i' => 'minute','s' => 'second'];
    foreach ($string as $k => &$v) {
        if ($diff->$k) $v = $diff->$k . ' ' . $v . ($diff->$k > 1 ? 's' : '');
        else unset($string[$k]);
    }
    if (!$full) $string = array_slice($string, 0, 1);
    return $string ? implode(', ', $string) . ' ago' : 'just now';
}

function detectFoodType($foodName, $description = '') {
    $foodTypes = [
        'rice' => ['keywords' => ['rice', 'biryani', 'pulao', 'fried rice'], 'confidence' => 0.95],
        'curry' => ['keywords' => ['curry', 'gravy', 'masala'], 'confidence' => 0.92],
        'bread' => ['keywords' => ['bread', 'naan', 'roti', 'paratha'], 'confidence' => 0.96],
        'dessert' => ['keywords' => ['sweet', 'dessert', 'cake', 'pastry'], 'confidence' => 0.87]
    ];
    $text = strtolower($foodName . ' ' . $description);
    foreach ($foodTypes as $type => $data) {
        foreach ($data['keywords'] as $keyword) {
            if (strpos($text, $keyword) !== false) {
                return ['type' => ucwords($type), 'confidence' => $data['confidence']];
            }
        }
    }
    return ['type' => 'Mixed Food', 'confidence' => 0.75];
}

// --- DATABASE CONNECTION ---
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    sendResponse(false, 'Database connection failed: ' . $e->getMessage());
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true) ?? [];

// --- API ROUTER ---
switch ($action) {
    // --- AUTHENTICATION ---
    case 'register':
        if ($method !== 'POST') sendResponse(false, 'Method not allowed');
        try {
            $name = trim($input['name'] ?? '');
            $email = trim($input['email'] ?? '');
            $password = $input['password'] ?? '';
            $type = $input['type'] ?? 'user';
            $avatar = $input['avatar'] ?? '/avatars/default_user.jpg';
            $nid_tin = trim($input['nid_tin_number'] ?? '');

            if (empty($name) || empty($email) || empty($password) || empty($avatar) || empty($nid_tin)) {
                sendResponse(false, 'All fields, including avatar and NID/TIN, are required.');
            }
            
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                sendResponse(false, 'Please enter a valid email address.');
            }
            
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                sendResponse(false, 'Email already exists');
            }
            
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            
            $stmt = $pdo->prepare("INSERT INTO users (name, email, password, type, avatar, nid_tin_number, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')");
            $stmt->execute([$name, $email, $hashedPassword, $type, $avatar, $nid_tin]);
            $userId = $pdo->lastInsertId();
            
            if ($type === 'restaurant') {
                $stmt = $pdo->prepare("INSERT INTO restaurants (user_id, name, description, status, area_id) VALUES (?, ?, 'New restaurant on Food For All', 'active', 1)");
                $stmt->execute([$userId, $name]);
            }
            
            sendResponse(true, 'Registration successful. Please verify with OTP.', ['user' => ['id' => $userId, 'name' => $name, 'email' => $email]]);
            
        } catch (Exception $e) {
            sendResponse(false, 'Registration failed: ' . $e->getMessage());
        }
        break;

    case 'send_otp':
        if ($method !== 'POST') sendResponse(false, 'Method not allowed');
        $email = trim($input['email'] ?? '');
        if (!$email) sendResponse(false, 'Email is required.');
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) sendResponse(false, 'Please enter a valid email address.');

        $otp = rand(100000, 999999);
        $timestamp = time();
        $log_entry = "$timestamp|$email|$otp\n";

        if (file_put_contents(OTP_LOG_FILE, $log_entry, FILE_APPEND | LOCK_EX) === false) {
            sendResponse(false, 'Failed to save OTP. Check server permissions.');
        }

        sendResponse(true, 'OTP sent successfully (check otp_log.txt).', ['otp_for_testing' => $otp]);
        break;

    case 'verify_otp':
        if ($method !== 'POST') sendResponse(false, 'Method not allowed');
        $email = trim($input['email'] ?? '');
        $otp_submitted = trim($input['otp'] ?? '');

        if (!$email || !$otp_submitted) sendResponse(false, 'Email and OTP are required.');
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) sendResponse(false, 'Please enter a valid email address.');

        if (!file_exists(OTP_LOG_FILE)) sendResponse(false, 'OTP log not found. Send an OTP first.');

        $lines = file(OTP_LOG_FILE, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $valid_otp_found = false;
        
        foreach (array_reverse($lines) as $line) {
            $parts = explode('|', $line);
            if (count($parts) !== 3) continue;
            
            list($timestamp, $log_email, $log_otp) = $parts;
            if ($log_email === $email && $log_otp === $otp_submitted) {
                if (time() - $timestamp <= OTP_EXPIRY_SECONDS) {
                    $valid_otp_found = true;
                    $stmt = $pdo->prepare("UPDATE users SET status = 'active' WHERE email = ?");
                    $stmt->execute([$email]);
                    break;
                }
            }
        }
        
        if (!$valid_otp_found) {
            sendResponse(false, 'Invalid or expired OTP.');
        } else {
            sendResponse(true, 'Account verified successfully! You can now log in.');
        }
        break;

    case 'login':
        if ($method !== 'POST') sendResponse(false, 'Method not allowed');
        try {
            $email = trim($input['email'] ?? '');
            $password = $input['password'] ?? '';
            if (empty($email) || empty($password)) {
                sendResponse(false, 'Email and password are required');
            }
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                sendResponse(false, 'Please enter a valid email address.');
            }
            
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            
            if ($user && password_verify($password, $user['password'])) {
                if ($user['status'] === 'pending') {
                    sendResponse(false, 'Your account is not verified. Please check the OTP sent upon registration.');
                }
                if ($user['status'] !== 'active') {
                    sendResponse(false, 'Your account is currently inactive or banned.');
                }
                unset($user['password'], $user['verification_otp']);
                
                if ($user['type'] === 'restaurant') {
                    $stmt = $pdo->prepare("SELECT * FROM restaurants WHERE user_id = ?");
                    $stmt->execute([$user['id']]);
                    $user['restaurant'] = $stmt->fetch();
                }
                sendResponse(true, 'Login successful', ['user' => $user]);
            } else {
                sendResponse(false, 'Invalid email or password');
            }
        } catch (Exception $e) {
            sendResponse(false, 'Login failed: ' . $e->getMessage());
        }
        break;

    case 'get_areas':
        try {
            $stmt = $pdo->prepare("SELECT id, name FROM areas ORDER BY name ASC");
            $stmt->execute();
            sendResponse(true, 'Areas retrieved successfully', ['areas' => $stmt->fetchAll()]);
        } catch (Exception $e) {
            sendResponse(false, 'Error retrieving areas: ' . $e->getMessage());
        }
        break;

    // --- ADMIN ACTIONS ---
    case 'get_all_users':
        $stmt = $pdo->prepare("SELECT id, name, email, type, status FROM users WHERE type != 'admin'");
        $stmt->execute();
        sendResponse(true, 'Users retrieved.', ['users' => $stmt->fetchAll()]);
        break;

    case 'delete_user':
        $userId = intval($input['user_id'] ?? 0);
        if (!$userId) sendResponse(false, 'User ID is required.');
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        sendResponse(true, 'User deleted successfully.');
        break;

    case 'get_all_posts':
        $stmt = $pdo->prepare("SELECT cp.*, u.name as user_name FROM community_posts cp JOIN users u ON cp.user_id = u.id ORDER BY cp.created_at DESC");
        $stmt->execute();
        sendResponse(true, 'Posts retrieved.', ['posts' => $stmt->fetchAll()]);
        break;

    case 'delete_post':
        $postId = intval($input['post_id'] ?? 0);
        if (!$postId) sendResponse(false, 'Post ID is required.');
        $stmt = $pdo->prepare("DELETE FROM community_posts WHERE id = ?");
        $stmt->execute([$postId]);
        sendResponse(true, 'Post deleted successfully.');
        break;

    case 'delete_product':
        $productId = intval($input['product_id'] ?? 0);
        if (!$productId) sendResponse(false, 'Product ID is required.');
        $stmt = $pdo->prepare("DELETE FROM discounted_products WHERE id = ?");
        $stmt->execute([$productId]);
        sendResponse(true, 'Product deleted successfully.');
        break;

    case 'update_product':
        if ($method !== 'POST') sendResponse(false, 'Method not allowed');
        try {
            $productId = intval($input['product_id'] ?? 0);
            if (!$productId) sendResponse(false, 'Product ID is required.');
            
            $name = trim($input['name'] ?? '');
            $description = trim($input['description'] ?? '');
            $price = floatval($input['price'] ?? 0);
            $quantity = intval($input['quantity'] ?? 0);

            if (empty($name) || $price <= 0 || $quantity <= 0) {
                sendResponse(false, 'Valid name, price and quantity are required.');
            }

            $stmt = $pdo->prepare("UPDATE discounted_products SET title = ?, description = ?, discounted_price = ?, quantity = ? WHERE id = ?");
            $stmt->execute([$name, $description, $price, $quantity, $productId]);
            
            sendResponse(true, 'Product updated successfully.');

        } catch (Exception $e) {
            sendResponse(false, 'Failed to update product: ' . $e->getMessage());
        }
        break;

    // --- PROFILE & USER DATA ---
    case 'get_user_profile':
        $userId = intval($_GET['user_id'] ?? 0);
        if (!$userId) sendResponse(false, 'User ID required');
        
        try {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();
            if (!$user) sendResponse(false, 'User not found');
            unset($user['password'], $user['verification_otp']);
            
            $stmt = $pdo->prepare("SELECT COUNT(id) as total_orders FROM orders WHERE user_id = ?");
            $stmt->execute([$userId]);
            $stats = $stmt->fetch();
            
            $stmt = $pdo->prepare("SELECT * FROM user_activities WHERE user_id = ? ORDER BY created_at DESC LIMIT 5");
            $stmt->execute([$userId]);
            $activities = $stmt->fetchAll();
            
            $impactMetrics = [
                'co2_saved_kg' => round(($user['food_saved_kg'] ?? 0) * 2.5, 1), 
                'meals_equivalent' => round(($user['food_saved_kg'] ?? 0) / 0.4)
            ];
            sendResponse(true, 'User profile retrieved', [
                'user' => $user, 
                'stats' => $stats, 
                'activities' => $activities, 
                'impact_metrics' => $impactMetrics
            ]);
        } catch (Exception $e) {
            sendResponse(false, 'Error retrieving profile: ' . $e->getMessage());
        }
        break;

    case 'update_profile':
        if ($method !== 'POST') sendResponse(false, 'Method not allowed');
        try {
            $userId = intval($input['user_id'] ?? 0);
            if (!$userId) sendResponse(false, 'User ID required');
            
            $name = trim($input['name'] ?? '');
            $bio = trim($input['bio'] ?? '');
            $phone = trim($input['phone'] ?? '');
            $address = trim($input['address'] ?? '');
            
            if (empty($name)) sendResponse(false, 'Name is required');
            
            $stmt = $pdo->prepare("UPDATE users SET name = ?, bio = ?, phone = ?, address = ? WHERE id = ?");
            $stmt->execute([$name, $bio, $phone, $address, $userId]);
            sendResponse(true, 'Profile updated successfully');
        } catch (Exception $e) {
            sendResponse(false, 'Error updating profile: ' . $e->getMessage());
        }
        break;

    case 'get_orders':
        $userId = intval($_GET['user_id'] ?? 0);
        if (!$userId) sendResponse(false, 'User ID required');
        
        try {
            $stmt = $pdo->prepare("SELECT o.*, r.name as restaurant_name, (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as total_items FROM orders o JOIN restaurants r ON o.restaurant_id = r.id WHERE o.user_id = ? ORDER BY o.created_at DESC");
            $stmt->execute([$userId]);
            $orders = $stmt->fetchAll();
            
            foreach ($orders as &$order) {
                $order['created_at_formatted'] = date('M j, Y \a\t g:i A', strtotime($order['created_at']));
            }
            sendResponse(true, 'Orders retrieved', ['orders' => $orders]);
        } catch (Exception $e) {
            sendResponse(false, 'Error retrieving orders: ' . $e->getMessage());
        }
        break;

    // --- PRODUCTS & CART ---
    case 'get_products':
        try {
            $areaId = intval($_GET['area_id'] ?? 0);
            $category = trim($_GET['category'] ?? '');
            $sortByInput = $_GET['sort_by'] ?? 'created_at';
            $allowedSorts = ['created_at', 'discount'];
            $sortBy = in_array($sortByInput, $allowedSorts) ? $sortByInput : 'created_at';
            $orderByClause = ($sortBy === 'discount') ? 'ORDER BY (p.original_price - p.price) DESC' : 'ORDER BY p.created_at DESC';
            
            $sql = "
                SELECT 
                    p.*,
                    r.name as restaurant_name,
                    r.rating as restaurant_rating,
                    u.name as owner_name,
                    a.name as area_name
                FROM products p
                JOIN restaurants r ON p.restaurant_id = r.id
                JOIN users u ON r.user_id = u.id
                LEFT JOIN areas a ON r.area_id = a.id
                WHERE p.expires_at > NOW() AND p.status = 'available'
            ";
            
            $params = [];
            if ($areaId) {
                $sql .= " AND r.area_id = ?";
                $params[] = $areaId;
            }
            if ($category) {
                $sql .= " AND p.category = ?";
                $params[] = $category;
            }
            
            $sql .= " " . $orderByClause;
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $products = $stmt->fetchAll();
            
            foreach ($products as &$product) {
                $originalPrice = floatval($product['original_price']);
                $currentPrice = floatval($product['price']);
                $product['discount_percentage'] = $originalPrice > 0 ? round((($originalPrice - $currentPrice) / $originalPrice) * 100) : 0;
                $product['hours_remaining'] = max(0, floor((strtotime($product['expires_at']) - time()) / 3600));
            }
            
            sendResponse(true, 'Products retrieved successfully', ['products' => $products]);
            
        } catch (Exception $e) {
            sendResponse(false, 'Error retrieving products: ' . $e->getMessage());
        }
        break;

    case 'add_product':
        if ($method !== 'POST') sendResponse(false, 'Method not allowed');
        try {
            $userId = intval($input['user_id'] ?? 0);
            $name = trim($input['name'] ?? '');
            $description = trim($input['description'] ?? '');
            $originalPrice = floatval($input['original_price'] ?? 0);
            $discountedPrice = floatval($input['discounted_price'] ?? 0);
            $quantity = intval($input['quantity'] ?? 1);
            $category = trim($input['category'] ?? '');
            $expiryDate = $input['expiry_date'] ?? '';
            
            if (empty($name) || $originalPrice <= 0 || $discountedPrice <= 0 || empty($expiryDate)) {
                sendResponse(false, 'Name, prices, and expiry date are required');
            }
            
            if ($discountedPrice >= $originalPrice) {
                sendResponse(false, 'Discounted price must be less than original price');
            }
            
            $stmt = $pdo->prepare("SELECT id FROM restaurants WHERE user_id = ?");
            $stmt->execute([$userId]);
            $restaurant = $stmt->fetch();
            
            if (!$restaurant) {
                sendResponse(false, 'Restaurant not found for this user');
            }
            
            $imageUrl = generateImageUrl($name);
            $expiresAt = date('Y-m-d 23:59:59', strtotime($expiryDate));
            
            $stmt = $pdo->prepare("INSERT INTO products (restaurant_id, name, description, original_price, price, quantity, category, expires_at, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$restaurant['id'], $name, $description, $originalPrice, $discountedPrice, $quantity, $category, $expiresAt, $imageUrl]);
            $productId = $pdo->lastInsertId();
            
            sendResponse(true, 'Product added successfully', ['product_id' => $productId]);
            
        } catch (Exception $e) {
            sendResponse(false, 'Failed to add product: ' . $e->getMessage());
        }
        break;

    // --- DISCOUNTED PRODUCTS (Fixed Implementation) ---
    case 'add_discounted_product':
        if ($method !== 'POST') sendResponse(false, 'Method not allowed');
        try {
            $userId = intval($input['user_id'] ?? 0);
            $title = trim($input['title'] ?? '');
            $description = trim($input['description'] ?? '');
            $originalPrice = floatval($input['original_price'] ?? 0);
            $discountedPrice = floatval($input['discounted_price'] ?? 0);
            $quantity = trim($input['quantity'] ?? '');
            $location = trim($input['location'] ?? '');
            $contactPhone = trim($input['contact_phone'] ?? '');
            $areaId = intval($input['area_id'] ?? 0);
            $expiryDate = $input['expiry_date'] ?? '';
            $imageUrl = $input['image_url'] ?? null;
            
            // Detailed validation
            if (!$userId) {
                sendResponse(false, 'User authentication required');
            }
            if (empty($title)) {
                sendResponse(false, 'Product title is required');
            }
            if (empty($description)) {
                sendResponse(false, 'Product description is required');
            }
            if ($originalPrice <= 0) {
                sendResponse(false, 'Valid original price is required');
            }
            if ($discountedPrice <= 0) {
                sendResponse(false, 'Valid discounted price is required');
            }
            if ($discountedPrice >= $originalPrice) {
                sendResponse(false, 'Discounted price must be less than original price');
            }
            if (empty($quantity)) {
                sendResponse(false, 'Quantity information is required');
            }
            if (empty($location)) {
                sendResponse(false, 'Pickup location is required');
            }
            if (empty($contactPhone)) {
                sendResponse(false, 'Contact phone number is required');
            }
            if (!$areaId) {
                sendResponse(false, 'Area selection is required');
            }
            if (empty($expiryDate)) {
                sendResponse(false, 'Expiry date is required');
            }
            
            // Verify user exists and is active
            $stmt = $pdo->prepare("SELECT id, name, type FROM users WHERE id = ? AND status = 'active'");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();
            if (!$user) {
                sendResponse(false, 'User not found or inactive');
            }
            
            // Verify area exists
            $stmt = $pdo->prepare("SELECT id FROM areas WHERE id = ?");
            $stmt->execute([$areaId]);
            if (!$stmt->fetch()) {
                sendResponse(false, 'Invalid area selected');
            }
            
            // Generate image URL if not provided
            if (!$imageUrl) {
                $imageUrl = generateImageUrl($title);
            }
            
            $expiresAt = date('Y-m-d 23:59:59', strtotime($expiryDate));
            
            // Ensure table exists (create if not exists)
            $createTableSQL = "
                CREATE TABLE IF NOT EXISTS discounted_products (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    original_price DECIMAL(10,2) NOT NULL,
                    discounted_price DECIMAL(10,2) NOT NULL,
                    quantity VARCHAR(100) NOT NULL,
                    location VARCHAR(500) NOT NULL,
                    contact_phone VARCHAR(20) NOT NULL,
                    area_id INT NOT NULL,
                    expires_at DATETIME NOT NULL,
                    image_url VARCHAR(500),
                    status ENUM('available', 'sold', 'expired') DEFAULT 'available',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_user_id (user_id),
                    INDEX idx_area_id (area_id),
                    INDEX idx_expires_at (expires_at),
                    INDEX idx_status (status)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            ";
            $pdo->exec($createTableSQL);
            
            $stmt = $pdo->prepare("INSERT INTO discounted_products (user_id, title, description, original_price, discounted_price, quantity, location, contact_phone, area_id, expires_at, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')");
            $stmt->execute([$userId, $title, $description, $originalPrice, $discountedPrice, $quantity, $location, $contactPhone, $areaId, $expiresAt, $imageUrl]);
            
            $productId = $pdo->lastInsertId();
            
            sendResponse(true, 'Discounted product added successfully', ['product_id' => $productId]);
            
        } catch (Exception $e) {
            error_log("Error adding discounted product: " . $e->getMessage());
            sendResponse(false, 'Failed to add discounted product: ' . $e->getMessage());
        }
        break;

    case 'get_discounted_products':
        try {
            $areaId = intval($_GET['area_id'] ?? 0);
            
            $sql = "
                SELECT 
                    dp.*,
                    u.name as seller_name,
                    u.type as seller_type,
                    u.avatar as seller_avatar,
                    a.name as area_name,
                    TIMESTAMPDIFF(HOUR, NOW(), dp.expires_at) as hours_remaining
                FROM discounted_products dp
                LEFT JOIN users u ON dp.user_id = u.id
                LEFT JOIN areas a ON dp.area_id = a.id
                WHERE dp.expires_at > NOW() AND dp.status = 'available'
            ";
            
            $params = [];
            if ($areaId > 0) {
                $sql .= " AND dp.area_id = ?";
                $params[] = $areaId;
            }
            
            $sql .= " ORDER BY dp.created_at DESC";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $products = $stmt->fetchAll();
            
            foreach ($products as &$product) {
                $product['hours_remaining'] = max(0, intval($product['hours_remaining']));
                $product['original_price'] = floatval($product['original_price']);
                $product['discounted_price'] = floatval($product['discounted_price']);
            }
            
            sendResponse(true, 'Discounted products retrieved successfully', ['products' => $products]);
            
        } catch (Exception $e) {
            error_log("Error retrieving discounted products: " . $e->getMessage());
            sendResponse(false, 'Error retrieving discounted products: ' . $e->getMessage());
        }
        break;

    case 'add_to_cart':
        if ($method !== 'POST') sendResponse(false, 'Method not allowed');
        try {
            $userId = intval($input['user_id'] ?? 0);
            $productId = intval($input['product_id'] ?? 0);
            $quantity = intval($input['quantity'] ?? 1);
            
            if (!$userId || !$productId || $quantity <= 0) {
                sendResponse(false, 'Valid User ID, Product ID and quantity required');
            }
            
            $stmt = $pdo->prepare("SELECT quantity, status FROM products WHERE id = ?");
            $stmt->execute([$productId]);
            $product = $stmt->fetch();
            
            if (!$product || $product['status'] !== 'available' || $product['quantity'] < $quantity) {
                sendResponse(false, 'Product not available or insufficient quantity');
            }
            
            $stmt = $pdo->prepare("INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)");
            $stmt->execute([$userId, $productId, $quantity]);
            
            sendResponse(true, 'Item added to cart');
        } catch (Exception $e) {
            sendResponse(false, 'Error adding to cart: ' . $e->getMessage());
        }
        break;

    case 'get_cart':
        try {
            $userId = intval($_GET['user_id'] ?? 0);
            if (!$userId) sendResponse(false, 'User ID required');
            
            $stmt = $pdo->prepare("SELECT c.*, p.name, p.price, p.original_price, p.quantity as available_quantity, p.expires_at, r.name as restaurant_name FROM cart_items c JOIN products p ON c.product_id = p.id JOIN restaurants r ON p.restaurant_id = r.id WHERE c.user_id = ? AND p.status = 'available' AND p.expires_at > NOW()");
            $stmt->execute([$userId]);
            $cartItems = $stmt->fetchAll();
            
            $totalAmount = 0;
            $totalDiscount = 0;
            
            foreach ($cartItems as &$item) {
                $item['subtotal'] = $item['quantity'] * $item['price'];
                $totalAmount += $item['subtotal'];
                $item['discount_amount'] = $item['quantity'] * ($item['original_price'] - $item['price']);
                $totalDiscount += $item['discount_amount'];
            }
            
            sendResponse(true, 'Cart retrieved', [
                'items' => $cartItems, 
                'total_amount' => $totalAmount, 
                'total_items' => count($cartItems), 
                'total_discount' => $totalDiscount
            ]);
        } catch (Exception $e) {
            sendResponse(false, 'Error getting cart: ' . $e->getMessage());
        }
        break;

    case 'update_cart':
        if ($method !== 'POST') sendResponse(false, 'Method not allowed');
        try {
            $userId = intval($input['user_id'] ?? 0);
            $productId = intval($input['product_id'] ?? 0);
            $quantity = intval($input['quantity'] ?? 0);
            
            if (!$userId || !$productId || $quantity < 0) {
                sendResponse(false, 'User ID, Product ID and a valid quantity are required');
            }
            
            if ($quantity === 0) {
                $stmt = $pdo->prepare("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?");
                $stmt->execute([$userId, $productId]);
            } else {
                $stmt = $pdo->prepare("UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?");
                $stmt->execute([$quantity, $userId, $productId]);
            }
            
            sendResponse(true, 'Cart updated');
        } catch (Exception $e) {
            sendResponse(false, 'Error updating cart: ' . $e->getMessage());
        }
        break;

    case 'checkout':
        if ($method !== 'POST') sendResponse(false, 'Method not allowed');
        try {
            $userId = intval($input['user_id'] ?? 0);
            $deliveryAddress = trim($input['delivery_address'] ?? '');
            $phone = trim($input['phone'] ?? '');
            $notes = trim($input['notes'] ?? '');
            
            if (!$userId) sendResponse(false, 'User ID required');
            
            $stmt = $pdo->prepare("SELECT c.*, p.price, p.restaurant_id, p.original_price FROM cart_items c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?");
            $stmt->execute([$userId]);
            $cartItems = $stmt->fetchAll();
            
            if (empty($cartItems)) {
                sendResponse(false, 'Cart is empty');
            }
            
            $ordersByRestaurant = [];
            foreach ($cartItems as $item) {
                $restaurantId = $item['restaurant_id'];
                if (!isset($ordersByRestaurant[$restaurantId])) {
                    $ordersByRestaurant[$restaurantId] = [];
                }
                $ordersByRestaurant[$restaurantId][] = $item;
            }
            
            $totalSaved = 0;
            $orderIds = [];
            
            $pdo->beginTransaction();
            
            foreach ($ordersByRestaurant as $restaurantId => $items) {
                $totalAmount = array_sum(array_map(function($item) { 
                    return $item['quantity'] * $item['price']; 
                }, $items));
                
                $stmt = $pdo->prepare("INSERT INTO orders (user_id, restaurant_id, total_amount, delivery_address, phone, notes, status, payment_status) VALUES (?, ?, ?, ?, ?, ?, 'pending', 'paid')");
                $stmt->execute([$userId, $restaurantId, $totalAmount, $deliveryAddress, $phone, $notes]);
                $orderId = $pdo->lastInsertId();
                $orderIds[] = $orderId;
                
                foreach ($items as $item) {
                    $stmt = $pdo->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
                    $stmt->execute([$orderId, $item['product_id'], $item['quantity'], $item['price']]);
                    
                    $stmt = $pdo->prepare("UPDATE products SET quantity = quantity - ? WHERE id = ?");
                    $stmt->execute([$item['quantity'], $item['product_id']]);
                    
                    $totalSaved += $item['quantity'] * ($item['original_price'] - $item['price']);
                }
            }
            
            $stmt = $pdo->prepare("DELETE FROM cart_items WHERE user_id = ?");
            $stmt->execute([$userId]);
            
            $kgSaved = $totalSaved * 0.1; // estimate 0.1kg food waste saved per dollar discount
            $points = $totalSaved * 10;
            $stmt = $pdo->prepare("UPDATE users SET food_saved_kg = COALESCE(food_saved_kg, 0) + ?, points_earned = COALESCE(points_earned, 0) + ? WHERE id = ?");
            $stmt->execute([$kgSaved, $points, $userId]);
            
            $stmt = $pdo->prepare("INSERT INTO user_activities (user_id, activity_type, description, points_earned) VALUES (?, 'food_rescued', ?, ?)");
            $stmt->execute([$userId, "Rescued items worth $totalSaved through checkout", $points]);
            
            $pdo->commit();
            
            sendResponse(true, 'Checkout successful', [
                'order_ids' => $orderIds, 
                'total_items_saved' => count($cartItems), 
                'points_earned' => $points
            ]);
            
        } catch (Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollback();
            }
            sendResponse(false, 'Checkout failed: ' . $e->getMessage());
        }
        break;

    // --- DONATIONS WITH AI ---
    case 'add_donation':
        if ($method !== 'POST') sendResponse(false, 'Method not allowed');
        try {
            $userId = intval($input['user_id'] ?? 0);
            $title = trim($input['title'] ?? '');
            $description = trim($input['description'] ?? '');
            $quantity = trim($input['quantity'] ?? '');
            $location = trim($input['location'] ?? '');
            $contactPhone = trim($input['contact_phone'] ?? '');
            $areaId = intval($input['area_id'] ?? 0);
            $expiryDate = $input['expiry_date'] ?? '';

            if (!$userId || empty($title) || !$areaId || empty($expiryDate)) {
                sendResponse(false, 'Required fields including expiry date are missing.');
            }
            
            $imageUrl = generateImageUrl($title);
            $expiresAt = date('Y-m-d 23:59:59', strtotime($expiryDate));

            $stmt = $pdo->prepare("INSERT INTO donations (user_id, title, description, quantity, location, contact_phone, area_id, expires_at, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$userId, $title, $description, $quantity, $location, $contactPhone, $areaId, $expiresAt, $imageUrl]);
            $donationId = $pdo->lastInsertId();
            
            sendResponse(true, 'Donation added successfully', ['donation_id' => $donationId]);
            
        } catch (Exception $e) {
            sendResponse(false, 'Failed to add donation: ' . $e->getMessage());
        }
        break;

    case 'get_donations':
        try {
            $areaId = intval($_GET['area_id'] ?? 0);
            
            $sql = "SELECT d.*, u.name as donor_name, u.type as donor_type, u.avatar as donor_avatar, a.name as area_name FROM donations d LEFT JOIN users u ON d.user_id = u.id LEFT JOIN areas a ON d.area_id = a.id WHERE d.expires_at > NOW() AND d.status = 'available' ";
            $params = [];
            
            if ($areaId > 0) {
                $sql .= " AND d.area_id = ?";
                $params[] = $areaId;
            }
            
            $sql .= " ORDER BY d.created_at DESC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $donations = $stmt->fetchAll();
            
            foreach ($donations as &$donation) {
                $donation['hours_remaining'] = max(0, floor((strtotime($donation['expires_at']) - time()) / 3600));
            }
            sendResponse(true, 'Donations retrieved successfully', ['donations' => $donations]);
        } catch (Exception $e) {
            sendResponse(false, 'Error retrieving donations: ' . $e->getMessage());
        }
        break;

    // --- REVIEWS & RATINGS ---
    case 'add_review':
        if ($method !== 'POST') sendResponse(false, 'Method not allowed');
        try {
            $userId = intval($input['user_id'] ?? 0);
            $restaurantId = intval($input['restaurant_id'] ?? 0);
            $productId = isset($input['product_id']) ? intval($input['product_id']) : null;
            $rating = intval($input['rating'] ?? 0);
            $comment = trim($input['comment'] ?? '');
            
            if (!$userId || !$restaurantId || $rating < 1 || $rating > 5) {
                sendResponse(false, 'Valid user ID, restaurant ID and rating (1-5) required');
            }
            
            $stmt = $pdo->prepare("INSERT INTO reviews (user_id, restaurant_id, product_id, rating, comment) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$userId, $restaurantId, $productId, $rating, $comment]);
            $reviewId = $pdo->lastInsertId();
            
            $stmt = $pdo->prepare("UPDATE restaurants SET rating = (SELECT AVG(rating) FROM reviews WHERE restaurant_id = ?), total_reviews = (SELECT COUNT(*) FROM reviews WHERE restaurant_id = ?) WHERE id = ?");
            $stmt->execute([$restaurantId, $restaurantId, $restaurantId]);
            
            $points = 10;
            $stmt = $pdo->prepare("INSERT INTO user_activities (user_id, activity_type, reference_id, description, points_earned) VALUES (?, 'review_posted', ?, ?, ?)");
            $stmt->execute([$userId, $reviewId, "Posted a $rating-star review", $points]);
            
            sendResponse(true, 'Review added successfully', ['points_earned' => $points]);
            
        } catch (Exception $e) {
            sendResponse(false, 'Error adding review: ' . $e->getMessage());
        }
        break;

    case 'get_reviews':
        try {
            $restaurantId = intval($_GET['restaurant_id'] ?? 0);
            if (!$restaurantId) sendResponse(false, 'Restaurant ID required');
            
            $stmt = $pdo->prepare("SELECT r.*, u.name as user_name, u.avatar as user_avatar FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.restaurant_id = ? ORDER BY r.created_at DESC");
            $stmt->execute([$restaurantId]);
            $reviews = $stmt->fetchAll();
            
            sendResponse(true, 'Reviews retrieved', ['reviews' => $reviews]);
        } catch (Exception $e) {
            sendResponse(false, 'Error getting reviews: ' . $e->getMessage());
        }
        break;

    // --- COMMUNITY FEED ---
    case 'get_community_feed':
        try {
            $limit = intval($_GET['limit'] ?? 20);
            $sql = "
                (SELECT 'post' as type, cp.id, cp.user_id, u.name as user_name, u.avatar as user_avatar, u.type as user_type, cp.content, cp.type as post_type, cp.likes_count, cp.comments_count, cp.shares_count, cp.created_at
                FROM community_posts cp
                JOIN users u ON cp.user_id = u.id
                WHERE cp.status = 'active')
                UNION ALL
                (SELECT 'activity' as type, ua.id, ua.user_id, u.name as user_name, u.avatar as user_avatar, u.type as user_type, ua.description as content, ua.activity_type as post_type, 0 as likes_count, 0 as comments_count, 0 as shares_count, ua.created_at
                FROM user_activities ua
                JOIN users u ON ua.user_id = u.id)
                ORDER BY created_at DESC
                LIMIT ?
            ";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$limit]);
            $feed = $stmt->fetchAll();
            
            sendResponse(true, 'Community feed retrieved', ['feed' => $feed]);
        } catch (Exception $e) {
            sendResponse(false, 'Error retrieving feed: ' . $e->getMessage());
        }
        break;

        case 'add_discounted_to_cart':
    if ($method !== 'POST') sendResponse(false, 'Method not allowed');
    try {
        $userId = intval($input['user_id'] ?? 0);
        $discountedProductId = intval($input['discounted_product_id'] ?? 0);
        $quantity = intval($input['quantity'] ?? 1);
        
        if (!$userId || !$discountedProductId || $quantity <= 0) {
            sendResponse(false, 'Valid User ID, Product ID and quantity required');
        }
        
        // Check if discounted product exists and is available
        $stmt = $pdo->prepare("SELECT * FROM discounted_products WHERE id = ? AND status = 'available' AND expires_at > NOW()");
        $stmt->execute([$discountedProductId]);
        $product = $stmt->fetch();
        
        if (!$product) {
            sendResponse(false, 'Product not available or has expired');
        }
        
        // Create cart_discounted_items table if it doesn't exist
        $createTableSQL = "
            CREATE TABLE IF NOT EXISTS cart_discounted_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                discounted_product_id INT NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_user_product (user_id, discounted_product_id),
                INDEX idx_user_id (user_id),
                INDEX idx_product_id (discounted_product_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ";
        $pdo->exec($createTableSQL);
        
        // Add to cart or update quantity
        $stmt = $pdo->prepare("INSERT INTO cart_discounted_items (user_id, discounted_product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)");
        $stmt->execute([$userId, $discountedProductId, $quantity]);
        
        sendResponse(true, 'Item added to cart');
    } catch (Exception $e) {
        sendResponse(false, 'Error adding to cart: ' . $e->getMessage());
    }
    break;

case 'get_full_cart':
    try {
        $userId = intval($_GET['user_id'] ?? 0);
        if (!$userId) sendResponse(false, 'User ID required');
        
        // Get regular products
        $stmt = $pdo->prepare("
            SELECT 'regular' as item_type, c.id as cart_id, c.quantity, c.product_id as id,
                   p.name as title, p.price as discounted_price, p.original_price, 
                   p.quantity as available_quantity, p.expires_at, p.image_url,
                   r.name as seller_name, 'restaurant' as seller_type,
                   r.id as restaurant_id, null as contact_phone, null as location
            FROM cart_items c 
            JOIN products p ON c.product_id = p.id 
            JOIN restaurants r ON p.restaurant_id = r.id 
            WHERE c.user_id = ? AND p.status = 'available' AND p.expires_at > NOW()
        ");
        $stmt->execute([$userId]);
        $regularItems = $stmt->fetchAll();
        
        // Get discounted products
        $stmt = $pdo->prepare("
            SELECT 'discounted' as item_type, c.id as cart_id, c.quantity, c.discounted_product_id as id,
                   dp.title, dp.discounted_price, dp.original_price, 
                   dp.quantity as available_quantity, dp.expires_at, dp.image_url,
                   u.name as seller_name, u.type as seller_type,
                   null as restaurant_id, dp.contact_phone, dp.location
            FROM cart_discounted_items c 
            JOIN discounted_products dp ON c.discounted_product_id = dp.id 
            JOIN users u ON dp.user_id = u.id 
            WHERE c.user_id = ? AND dp.status = 'available' AND dp.expires_at > NOW()
        ");
        $stmt->execute([$userId]);
        $discountedItems = $stmt->fetchAll();
        
        // Combine and calculate totals
        $allItems = array_merge($regularItems, $discountedItems);
        $totalAmount = 0;
        $totalDiscount = 0;
        
        foreach ($allItems as &$item) {
            $item['subtotal'] = $item['quantity'] * $item['discounted_price'];
            $totalAmount += $item['subtotal'];
            $item['discount_amount'] = $item['quantity'] * ($item['original_price'] - $item['discounted_price']);
            $totalDiscount += $item['discount_amount'];
        }
        
        sendResponse(true, 'Full cart retrieved', [
            'items' => $allItems, 
            'total_amount' => $totalAmount, 
            'total_items' => count($allItems), 
            'total_discount' => $totalDiscount
        ]);
    } catch (Exception $e) {
        sendResponse(false, 'Error getting cart: ' . $e->getMessage());
    }
    break;

case 'update_discounted_cart':
    if ($method !== 'POST') sendResponse(false, 'Method not allowed');
    try {
        $userId = intval($input['user_id'] ?? 0);
        $discountedProductId = intval($input['discounted_product_id'] ?? 0);
        $quantity = intval($input['quantity'] ?? 0);
        
        if (!$userId || !$discountedProductId || $quantity < 0) {
            sendResponse(false, 'User ID, Product ID and a valid quantity are required');
        }
        
        if ($quantity === 0) {
            $stmt = $pdo->prepare("DELETE FROM cart_discounted_items WHERE user_id = ? AND discounted_product_id = ?");
            $stmt->execute([$userId, $discountedProductId]);
        } else {
            $stmt = $pdo->prepare("UPDATE cart_discounted_items SET quantity = ? WHERE user_id = ? AND discounted_product_id = ?");
            $stmt->execute([$quantity, $userId, $discountedProductId]);
        }
        
        sendResponse(true, 'Cart updated');
    } catch (Exception $e) {
        sendResponse(false, 'Error updating cart: ' . $e->getMessage());
    }
    break;

case 'checkout_with_discounted':
    if ($method !== 'POST') sendResponse(false, 'Method not allowed');
    try {
        $userId = intval($input['user_id'] ?? 0);
        $deliveryAddress = trim($input['delivery_address'] ?? '');
        $phone = trim($input['phone'] ?? '');
        $notes = trim($input['notes'] ?? '');
        $paymentMethod = trim($input['payment_method'] ?? 'cash'); // bkash, nagad, card, cash
        
        if (!$userId) sendResponse(false, 'User ID required');
        if (!in_array($paymentMethod, ['bkash', 'nagad', 'card', 'cash'])) {
            sendResponse(false, 'Invalid payment method');
        }
        
        // Get regular cart items
        $stmt = $pdo->prepare("SELECT c.*, p.price, p.restaurant_id, p.original_price FROM cart_items c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?");
        $stmt->execute([$userId]);
        $regularItems = $stmt->fetchAll();
        
        // Get discounted cart items
        $stmt = $pdo->prepare("SELECT c.*, dp.discounted_price as price, dp.user_id as seller_id, dp.original_price, dp.title, dp.contact_phone FROM cart_discounted_items c JOIN discounted_products dp ON c.discounted_product_id = dp.id WHERE c.user_id = ?");
        $stmt->execute([$userId]);
        $discountedItems = $stmt->fetchAll();
        
        if (empty($regularItems) && empty($discountedItems)) {
            sendResponse(false, 'Cart is empty');
        }
        
        // Create orders table for discounted products if it doesn't exist
        $createOrdersTableSQL = "
            CREATE TABLE IF NOT EXISTS discounted_orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                seller_id INT NOT NULL,
                total_amount DECIMAL(10,2) NOT NULL,
                delivery_address TEXT,
                phone VARCHAR(20),
                notes TEXT,
                payment_method ENUM('bkash', 'nagad', 'card', 'cash') DEFAULT 'cash',
                status ENUM('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled') DEFAULT 'pending',
                payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_user_id (user_id),
                INDEX idx_seller_id (seller_id),
                INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ";
        $pdo->exec($createOrdersTableSQL);
        
        // Create order items table for discounted products
        $createOrderItemsTableSQL = "
            CREATE TABLE IF NOT EXISTS discounted_order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                discounted_product_id INT NOT NULL,
                quantity INT NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_order_id (order_id),
                INDEX idx_product_id (discounted_product_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ";
        $pdo->exec($createOrderItemsTableSQL);
        
        $totalSaved = 0;
        $orderIds = [];
        $discountedOrderIds = [];
        
        $pdo->beginTransaction();
        
        // Process regular restaurant orders (existing logic)
        if (!empty($regularItems)) {
            $ordersByRestaurant = [];
            foreach ($regularItems as $item) {
                $restaurantId = $item['restaurant_id'];
                if (!isset($ordersByRestaurant[$restaurantId])) {
                    $ordersByRestaurant[$restaurantId] = [];
                }
                $ordersByRestaurant[$restaurantId][] = $item;
            }
            
            foreach ($ordersByRestaurant as $restaurantId => $items) {
                $totalAmount = array_sum(array_map(function($item) { 
                    return $item['quantity'] * $item['price']; 
                }, $items));
                
                $stmt = $pdo->prepare("INSERT INTO orders (user_id, restaurant_id, total_amount, delivery_address, phone, notes, payment_method, status, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'paid')");
                $stmt->execute([$userId, $restaurantId, $totalAmount, $deliveryAddress, $phone, $notes, $paymentMethod]);
                $orderId = $pdo->lastInsertId();
                $orderIds[] = $orderId;
                
                foreach ($items as $item) {
                    $stmt = $pdo->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
                    $stmt->execute([$orderId, $item['product_id'], $item['quantity'], $item['price']]);
                    
                    $stmt = $pdo->prepare("UPDATE products SET quantity = quantity - ? WHERE id = ?");
                    $stmt->execute([$item['quantity'], $item['product_id']]);
                    
                    $totalSaved += $item['quantity'] * ($item['original_price'] - $item['price']);
                }
            }
            
            $stmt = $pdo->prepare("DELETE FROM cart_items WHERE user_id = ?");
            $stmt->execute([$userId]);
        }
        
        // Process discounted product orders (new logic)
        if (!empty($discountedItems)) {
            $ordersBySeller = [];
            foreach ($discountedItems as $item) {
                $sellerId = $item['seller_id'];
                if (!isset($ordersBySeller[$sellerId])) {
                    $ordersBySeller[$sellerId] = [];
                }
                $ordersBySeller[$sellerId][] = $item;
            }
            
            foreach ($ordersBySeller as $sellerId => $items) {
                $totalAmount = array_sum(array_map(function($item) { 
                    return $item['quantity'] * $item['price']; 
                }, $items));
                
                $stmt = $pdo->prepare("INSERT INTO discounted_orders (user_id, seller_id, total_amount, delivery_address, phone, notes, payment_method, status, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'paid')");
                $stmt->execute([$userId, $sellerId, $totalAmount, $deliveryAddress, $phone, $notes, $paymentMethod]);
                $discountedOrderId = $pdo->lastInsertId();
                $discountedOrderIds[] = $discountedOrderId;
                
                foreach ($items as $item) {
                    $stmt = $pdo->prepare("INSERT INTO discounted_order_items (order_id, discounted_product_id, quantity, price) VALUES (?, ?, ?, ?)");
                    $stmt->execute([$discountedOrderId, $item['discounted_product_id'], $item['quantity'], $item['price']]);
                    
                    // Mark discounted product as sold if fully purchased
                    $stmt = $pdo->prepare("UPDATE discounted_products SET status = 'sold' WHERE id = ?");
                    $stmt->execute([$item['discounted_product_id']]);
                    
                    $totalSaved += $item['quantity'] * ($item['original_price'] - $item['price']);
                }
            }
            
            $stmt = $pdo->prepare("DELETE FROM cart_discounted_items WHERE user_id = ?");
            $stmt->execute([$userId]);
        }
        
        // Update user stats
        $kgSaved = $totalSaved * 0.1; // estimate 0.1kg food waste saved per dollar discount
        $points = $totalSaved * 10;
        $stmt = $pdo->prepare("UPDATE users SET food_saved_kg = COALESCE(food_saved_kg, 0) + ?, points_earned = COALESCE(points_earned, 0) + ? WHERE id = ?");
        $stmt->execute([$kgSaved, $points, $userId]);
        
        $stmt = $pdo->prepare("INSERT INTO user_activities (user_id, activity_type, description, points_earned) VALUES (?, 'food_rescued', ?, ?)");
        $stmt->execute([$userId, "Rescued items worth $totalSaved through checkout", $points]);
        
        $pdo->commit();
        
        sendResponse(true, 'Checkout successful', [
            'regular_order_ids' => $orderIds, 
            'discounted_order_ids' => $discountedOrderIds,
            'total_items_saved' => count($regularItems) + count($discountedItems), 
            'points_earned' => $points,
            'payment_method' => $paymentMethod
        ]);
        
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollback();
        }
        sendResponse(false, 'Checkout failed: ' . $e->getMessage());
    }
    break;

case 'add_review_discounted':
    if ($method !== 'POST') sendResponse(false, 'Method not allowed');
    try {
        $userId = intval($input['user_id'] ?? 0);
        $sellerId = intval($input['seller_id'] ?? 0);
        $discountedProductId = isset($input['discounted_product_id']) ? intval($input['discounted_product_id']) : null;
        $rating = intval($input['rating'] ?? 0);
        $comment = trim($input['comment'] ?? '');
        
        if (!$userId || !$sellerId || $rating < 1 || $rating > 5) {
            sendResponse(false, 'Valid user ID, seller ID and rating (1-5) required');
        }
        
        // Create reviews table for discounted products if it doesn't exist
        $createReviewsTableSQL = "
            CREATE TABLE IF NOT EXISTS discounted_reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                seller_id INT NOT NULL,
                discounted_product_id INT NULL,
                rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_user_id (user_id),
                INDEX idx_seller_id (seller_id),
                INDEX idx_product_id (discounted_product_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ";
        $pdo->exec($createReviewsTableSQL);
        
        $stmt = $pdo->prepare("INSERT INTO discounted_reviews (user_id, seller_id, discounted_product_id, rating, comment) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$userId, $sellerId, $discountedProductId, $rating, $comment]);
        $reviewId = $pdo->lastInsertId();
        
        // Award points for reviewing
        $points = 10;
        $stmt = $pdo->prepare("INSERT INTO user_activities (user_id, activity_type, reference_id, description, points_earned) VALUES (?, 'review_posted', ?, ?, ?)");
        $stmt->execute([$userId, $reviewId, "Posted a $rating-star review for discounted product", $points]);
        
        sendResponse(true, 'Review added successfully', ['points_earned' => $points]);
        
    } catch (Exception $e) {
        sendResponse(false, 'Error adding review: ' . $e->getMessage());
    }
    break;

case 'get_discounted_reviews':
    try {
        $sellerId = intval($_GET['seller_id'] ?? 0);
        if (!$sellerId) sendResponse(false, 'Seller ID required');
        
        $stmt = $pdo->prepare("SELECT r.*, u.name as user_name, u.avatar as user_avatar FROM discounted_reviews r JOIN users u ON r.user_id = u.id WHERE r.seller_id = ? ORDER BY r.created_at DESC");
        $stmt->execute([$sellerId]);
        $reviews = $stmt->fetchAll();
        
        sendResponse(true, 'Reviews retrieved', ['reviews' => $reviews]);
    } catch (Exception $e) {
        sendResponse(false, 'Error getting reviews: ' . $e->getMessage());
    }
    break;

case 'get_user_orders_full':
    $userId = intval($_GET['user_id'] ?? 0);
    if (!$userId) sendResponse(false, 'User ID required');
    
    try {
        // Get regular restaurant orders
        $stmt = $pdo->prepare("
            SELECT 'regular' as order_type, o.id, o.total_amount, o.status, o.payment_status, 
                   o.payment_method, o.created_at, r.name as seller_name,
                   (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as total_items
            FROM orders o 
            JOIN restaurants r ON o.restaurant_id = r.id 
            WHERE o.user_id = ?
        ");
        $stmt->execute([$userId]);
        $regularOrders = $stmt->fetchAll();
        
        // Get discounted product orders
        $stmt = $pdo->prepare("
            SELECT 'discounted' as order_type, do.id, do.total_amount, do.status, do.payment_status,
                   do.payment_method, do.created_at, u.name as seller_name,
                   (SELECT COUNT(*) FROM discounted_order_items WHERE order_id = do.id) as total_items
            FROM discounted_orders do 
            JOIN users u ON do.seller_id = u.id 
            WHERE do.user_id = ?
        ");
        $stmt->execute([$userId]);
        $discountedOrders = $stmt->fetchAll();
        
        // Combine and sort by date
        $allOrders = array_merge($regularOrders, $discountedOrders);
        usort($allOrders, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });
        
        foreach ($allOrders as &$order) {
            $order['created_at_formatted'] = date('M j, Y \a\t g:i A', strtotime($order['created_at']));
        }
        
        sendResponse(true, 'Orders retrieved', ['orders' => $allOrders]);
    } catch (Exception $e) {
        sendResponse(false, 'Error retrieving orders: ' . $e->getMessage());
    }
    break;

    // --- IMPACT & LEADERBOARD ---
    case 'get_impact_stats':
        try {
            $sql = "SELECT 
                (SELECT COUNT(id) FROM donations) as total_donations, 
                (SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi) as total_products_rescued, 
                (SELECT COALESCE(SUM(food_saved_kg), 0) FROM users) as total_food_saved_kg, 
                (SELECT COUNT(id) FROM users WHERE status = 'active') as active_users, 
                (SELECT COUNT(id) FROM donation_interests) as total_claims";
                
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            $globalStats = $stmt->fetch();
            
            $impactMetrics = [
                'meals_provided' => round(($globalStats['total_food_saved_kg'] ?? 0) / 0.4), 
                'co2_prevented_kg' => round(($globalStats['total_food_saved_kg'] ?? 0) * 2.5, 1)
            ];
            
            sendResponse(true, 'Global impact stats retrieved', [
                'stats' => $globalStats, 
                'metrics' => $impactMetrics
            ]);
        } catch (Exception $e) {
            sendResponse(false, 'Error retrieving impact stats: ' . $e->getMessage());
        }
        break;

    case 'get_leaderboard':
        try {
            $stmt = $pdo->prepare("SELECT id, name, avatar, COALESCE(points_earned, 0) as points_earned FROM users WHERE status = 'active' ORDER BY points_earned DESC LIMIT 10");
            $stmt->execute();
            $leaderboard = $stmt->fetchAll();
            
            sendResponse(true, 'Leaderboard retrieved', ['leaderboard' => $leaderboard]);
        } catch (Exception $e) {
            sendResponse(false, 'Error retrieving leaderboard: ' . $e->getMessage());
        }
        break;

    case 'test':
        sendResponse(true, 'Backend working perfectly!', [
            'database' => 'connected',
            'features' => ['auth', 'cart', 'ai_images', 'reviews', 'leaderboard', 'community', 'areas', 'discounted_products'],
            'server_time' => date('Y-m-d H:i:s'),
            'php_version' => PHP_VERSION
        ]);
        break;

    default:
        sendResponse(false, 'Invalid action specified.');
        break;
}
?>```