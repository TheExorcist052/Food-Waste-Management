<?php
// create_database.php - Simple database creator
$host = 'localhost';
$username = 'root';
$password = '';
$dbname = 'food_for_all';

echo "<h1>🗄️ Creating Database</h1>";

try {
    // Connect to MySQL server (not to a specific database)
    $pdo = new PDO("mysql:host=$host;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<p>✅ Connected to MySQL server</p>";
    
    // Drop database if exists and create new one
    $pdo->exec("DROP DATABASE IF EXISTS `$dbname`");
    echo "<p>🗑️ Dropped existing database (if any)</p>";
    
    $pdo->exec("CREATE DATABASE `$dbname` CHARACTER SET utf8 COLLATE utf8_general_ci");
    echo "<p>✅ Created database: $dbname</p>";
    
    // Select the database
    $pdo->exec("USE `$dbname`");
    echo "<p>✅ Selected database: $dbname</p>";
    
    // Now create tables one by one with error checking
    echo "<h2>📋 Creating Tables...</h2>";
    
    // 1. Users table
    $sql = "CREATE TABLE `users` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(255) NOT NULL,
        `email` VARCHAR(255) UNIQUE NOT NULL,
        `password` VARCHAR(255) NOT NULL,
        `phone` VARCHAR(20),
        `address` TEXT,
        `type` ENUM('user', 'restaurant', 'admin') DEFAULT 'user',
        `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB";
    
    $pdo->exec($sql);
    echo "<p>✅ Created table: users</p>";
    
    // 2. Restaurants table
    $sql = "CREATE TABLE `restaurants` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `user_id` INT NOT NULL,
        `name` VARCHAR(255) NOT NULL,
        `description` TEXT,
        `cuisine_type` VARCHAR(100),
        `rating` DECIMAL(3,2) DEFAULT 0.00,
        `image` VARCHAR(500),
        `license_number` VARCHAR(100),
        `verification_status` ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
        `status` ENUM('active', 'inactive') DEFAULT 'active',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB";
    
    $pdo->exec($sql);
    echo "<p>✅ Created table: restaurants</p>";
    
    // 3. Products table
    $sql = "CREATE TABLE `products` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `restaurant_id` INT NOT NULL,
        `name` VARCHAR(255) NOT NULL,
        `description` TEXT,
        `original_price` DECIMAL(10,2) NOT NULL,
        `price` DECIMAL(10,2) NOT NULL,
        `quantity` INT NOT NULL DEFAULT 1,
        `category` VARCHAR(100),
        `image` VARCHAR(500),
        `expires_at` DATETIME NOT NULL,
        `status` ENUM('available', 'sold', 'expired') DEFAULT 'available',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB";
    
    $pdo->exec($sql);
    echo "<p>✅ Created table: products</p>";
    
    // 4. Other tables (simplified)
    $tables = [
        "orders" => "CREATE TABLE `orders` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `user_id` INT NOT NULL,
            `restaurant_id` INT NOT NULL,
            `total_amount` DECIMAL(10,2) NOT NULL,
            `status` ENUM('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled') DEFAULT 'pending',
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
            FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB",
        
        "donations" => "CREATE TABLE `donations` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `user_id` INT NOT NULL,
            `title` VARCHAR(255) NOT NULL,
            `description` TEXT NOT NULL,
            `food_type` VARCHAR(100),
            `quantity` VARCHAR(100),
            `location` VARCHAR(255) NOT NULL,
            `expires_at` DATETIME NOT NULL,
            `status` ENUM('available', 'claimed', 'completed', 'expired') DEFAULT 'available',
            `interested_count` INT DEFAULT 0,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB",
        
        "community_posts" => "CREATE TABLE `community_posts` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `user_id` INT NOT NULL,
            `content` TEXT NOT NULL,
            `type` ENUM('story', 'tip', 'question', 'general') DEFAULT 'general',
            `likes_count` INT DEFAULT 0,
            `comments_count` INT DEFAULT 0,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB"
    ];
    
    foreach ($tables as $tableName => $sql) {
        $pdo->exec($sql);
        echo "<p>✅ Created table: $tableName</p>";
    }
    
    echo "<h2>🎲 Inserting Sample Data...</h2>";
    
    // Insert sample users
    $adminPassword = password_hash('password123', PASSWORD_DEFAULT);
    $restaurantPassword = password_hash('password123', PASSWORD_DEFAULT);
    $userPassword = password_hash('password123', PASSWORD_DEFAULT);
    
    $pdo->exec("INSERT INTO `users` (`id`, `name`, `email`, `password`, `type`) VALUES 
        (1, 'Admin User', 'admin@demo.com', '$adminPassword', 'admin'),
        (2, 'Green Garden Restaurant', 'restaurant@demo.com', '$restaurantPassword', 'restaurant'),
        (3, 'John Doe', 'user@demo.com', '$userPassword', 'user')
    ");
    echo "<p>✅ Sample users inserted</p>";
    
    // Insert sample restaurant
    $pdo->exec("INSERT INTO `restaurants` (`id`, `user_id`, `name`, `description`, `cuisine_type`, `rating`, `verification_status`) VALUES 
        (1, 2, 'Green Garden Restaurant', 'Fresh and healthy food', 'Bengali', 4.5, 'verified')
    ");
    echo "<p>✅ Sample restaurant inserted</p>";
    
    // Insert sample products
    $pdo->exec("INSERT INTO `products` (`restaurant_id`, `name`, `description`, `original_price`, `price`, `quantity`, `category`, `expires_at`) VALUES 
        (1, 'Chicken Biryani', 'Delicious chicken biryani', 450.00, 350.00, 5, 'Main Course', DATE_ADD(NOW(), INTERVAL 4 HOUR)),
        (1, 'Beef Curry', 'Spicy beef curry', 380.00, 280.00, 3, 'Main Course', DATE_ADD(NOW(), INTERVAL 3 HOUR)),
        (1, 'Fish Fry', 'Crispy fried fish', 250.00, 180.00, 4, 'Main Course', DATE_ADD(NOW(), INTERVAL 2 HOUR))
    ");
    echo "<p>✅ Sample products inserted</p>";
    
    // Insert sample donations
    $pdo->exec("INSERT INTO `donations` (`user_id`, `title`, `description`, `food_type`, `quantity`, `location`, `expires_at`) VALUES 
        (2, 'Fresh Vegetables', 'Excess vegetables from restaurant', 'Vegetables', '10 servings', 'Dhanmondi, Dhaka', DATE_ADD(NOW(), INTERVAL 6 HOUR)),
        (3, 'Homemade Bread', 'Extra bread from family event', 'Bakery', '20 pieces', 'Gulshan, Dhaka', DATE_ADD(NOW(), INTERVAL 8 HOUR))
    ");
    echo "<p>✅ Sample donations inserted</p>";
    
    // Insert sample posts
    $pdo->exec("INSERT INTO `community_posts` (`user_id`, `content`, `type`, `likes_count`) VALUES 
        (2, 'Just donated 20 meals to a local shelter! 🌱❤️', 'story', 15),
        (3, 'Pro tip: Store fruits properly to extend their life 🍌', 'tip', 8),
        (1, 'Welcome to Food For All community! 🤝', 'general', 25)
    ");
    echo "<p>✅ Sample posts inserted</p>";
    
    // Verify tables exist
    echo "<h2>🔍 Verifying Tables...</h2>";
    $result = $pdo->query("SHOW TABLES");
    $tables = $result->fetchAll(PDO::FETCH_COLUMN);
    
    foreach ($tables as $table) {
        $count = $pdo->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
        echo "<p>📋 Table '$table': $count records</p>";
    }
    
    echo "<div style='background: #f6ffed; border: 2px solid #52c41a; padding: 20px; border-radius: 8px; margin: 20px 0;'>";
    echo "<h2>🎉 SUCCESS!</h2>";
    echo "<p><strong>Database created successfully with all tables and sample data!</strong></p>";
    echo "<p><strong>🔐 Demo Accounts:</strong></p>";
    echo "<p>👑 Admin: admin@demo.com / password123</p>";
    echo "<p>🏪 Restaurant: restaurant@demo.com / password123</p>";
    echo "<p>👤 User: user@demo.com / password123</p>";
    echo "<br>";
    echo "<p><strong>🚀 Test your app now:</strong></p>";
    echo "<p>🌐 Frontend: <a href='http://localhost:5173' target='_blank'>http://localhost:5173</a></p>";
    echo "<p>🔧 Backend Test: <a href='http://localhost/food_for_all/backend.php?action=test' target='_blank'>Backend Test</a></p>";
    echo "<p>📦 Products API: <a href='http://localhost/food_for_all/backend.php?action=get_products' target='_blank'>Products API</a></p>";
    echo "</div>";
    
} catch (PDOException $e) {
    echo "<div style='background: #fff2f0; border: 2px solid #ff4d4f; padding: 20px; border-radius: 8px;'>";
    echo "<h2>❌ Database Error</h2>";
    echo "<p><strong>Error:</strong> " . $e->getMessage() . "</p>";
    echo "<p><strong>Error Code:</strong> " . $e->getCode() . "</p>";
    echo "<p><strong>File:</strong> " . $e->getFile() . "</p>";
    echo "<p><strong>Line:</strong> " . $e->getLine() . "</p>";
    echo "</div>";
    
    echo "<div style='background: #fff7e6; border: 1px solid #ffa940; padding: 20px; border-radius: 8px; margin-top: 20px;'>";
    echo "<h3>🛠️ Troubleshooting:</h3>";
    echo "<p>1. Make sure MySQL is running in XAMPP</p>";
    echo "<p>2. Check if you can access phpMyAdmin: <a href='http://localhost/phpmyadmin' target='_blank'>http://localhost/phpmyadmin</a></p>";
    echo "<p>3. Try changing the database password in the script if you have set one</p>";
    echo "</div>";
}
?>
