<?php
$host = 'localhost';
$dbname = 'food_for_all';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Drop and recreate database
    $pdo->exec("DROP DATABASE IF EXISTS `$dbname`");
    $pdo->exec("CREATE DATABASE `$dbname`");
    $pdo->exec("USE `$dbname`");
    
    echo "<h1>🏗️ Setting Up Complete Database Schema</h1>";

    // Users table with profiles and avatars
    $pdo->exec("
        CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(20),
            address TEXT,
            type ENUM('user', 'restaurant', 'admin') DEFAULT 'user',
            status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
            avatar VARCHAR(500),
            bio TEXT,
            donation_count INT DEFAULT 0,
            food_saved_kg DECIMAL(8,2) DEFAULT 0,
            points_earned INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB
    ");
    echo "<p>✅ Users table created with profiles</p>";

    // Areas table for filtering
    $pdo->exec("
        CREATE TABLE areas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            city VARCHAR(255) NOT NULL,
            status ENUM('active', 'inactive') DEFAULT 'active'
        ) ENGINE=InnoDB
    ");
    echo "<p>✅ Areas table created</p>";

    // Restaurants table
    $pdo->exec("
        CREATE TABLE restaurants (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            cuisine_type VARCHAR(100),
            rating DECIMAL(3,2) DEFAULT 0.00,
            total_reviews INT DEFAULT 0,
            image VARCHAR(500),
            license_number VARCHAR(100),
            verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
            status ENUM('active', 'inactive') DEFAULT 'active',
            area_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL
        ) ENGINE=InnoDB
    ");
    echo "<p>✅ Restaurants table created</p>";

    // Products table with AI detection and inventory
    $pdo->exec("
        CREATE TABLE products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            restaurant_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            original_price DECIMAL(10,2) NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            quantity INT NOT NULL DEFAULT 1,
            category VARCHAR(100),
            image VARCHAR(500),
            ai_detected_type VARCHAR(100),
            confidence_score DECIMAL(3,2),
            expires_at DATETIME NOT NULL,
            status ENUM('available', 'sold', 'expired', 'out_of_stock') DEFAULT 'available',
            views_count INT DEFAULT 0,
            saved_count INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
        ) ENGINE=InnoDB
    ");
    echo "<p>✅ Products table created with AI & inventory</p>";

    // Cart table
    $pdo->exec("
        CREATE TABLE cart_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            product_id INT NOT NULL,
            quantity INT NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
            UNIQUE KEY unique_cart_item (user_id, product_id)
        ) ENGINE=InnoDB
    ");
    echo "<p>✅ Cart table created</p>";

    // Orders table with checkout
    $pdo->exec("
        CREATE TABLE orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            restaurant_id INT NOT NULL,
            total_amount DECIMAL(10,2) NOT NULL,
            status ENUM('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled') DEFAULT 'pending',
            payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
            delivery_address TEXT,
            phone VARCHAR(20),
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
        ) ENGINE=InnoDB
    ");
    echo "<p>✅ Orders table created</p>";

    // Order items
    $pdo->exec("
        CREATE TABLE order_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT NOT NULL,
            product_id INT NOT NULL,
            quantity INT NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        ) ENGINE=InnoDB
    ");
    echo "<p>✅ Order items table created</p>";

    // Donations table
    $pdo->exec("
        CREATE TABLE donations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            food_type VARCHAR(100),
            quantity VARCHAR(100),
            location VARCHAR(255) NOT NULL,
            detailed_location TEXT,
            contact_phone VARCHAR(20),
            contact_email VARCHAR(255),
            expires_at DATETIME NOT NULL,
            pickup_instructions TEXT,
            dietary_info TEXT,
            status ENUM('available', 'claimed', 'completed', 'expired') DEFAULT 'available',
            interested_count INT DEFAULT 0,
            area_id INT,
            image VARCHAR(500),
            ai_detected_type VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL
        ) ENGINE=InnoDB
    ");
    echo "<p>✅ Donations table created with AI detection</p>";

    // Reviews and ratings system
    $pdo->exec("
        CREATE TABLE reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            restaurant_id INT NOT NULL,
            product_id INT,
            rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            helpful_count INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
        ) ENGINE=InnoDB
    ");
    echo "<p>✅ Reviews table created</p>";

    // Community posts with reactions
    $pdo->exec("
        CREATE TABLE community_posts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            content TEXT NOT NULL,
            image VARCHAR(500),
            type ENUM('story', 'tip', 'question', 'general', 'donation_activity', 'pickup_activity') DEFAULT 'general',
            likes_count INT DEFAULT 0,
            comments_count INT DEFAULT 0,
            shares_count INT DEFAULT 0,
            status ENUM('active', 'hidden', 'reported') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB
    ");
    echo "<p>✅ Community posts table created with reactions</p>";

    // Post reactions (emoji reactions)
    $pdo->exec("
        CREATE TABLE post_reactions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            post_id INT NOT NULL,
            user_id INT NOT NULL,
            reaction_type ENUM('like', 'love', 'laugh', 'wow', 'sad', 'angry') DEFAULT 'like',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_reaction (post_id, user_id)
        ) ENGINE=InnoDB
    ");
    echo "<p>✅ Post reactions table created</p>";

    // Comments
    $pdo->exec("
        CREATE TABLE post_comments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            post_id INT NOT NULL,
            user_id INT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB
    ");
    echo "<p>✅ Comments table created</p>";

    // Donation interests/claims
    $pdo->exec("
        CREATE TABLE donation_interests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            donation_id INT NOT NULL,
            user_id INT NOT NULL,
            message TEXT,
            status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_interest (donation_id, user_id)
        ) ENGINE=InnoDB
    ");
    echo "<p>✅ Donation interests table created</p>";

    // User activities for community feed
    $pdo->exec("
        CREATE TABLE user_activities (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            activity_type ENUM('donation_added', 'product_listed', 'food_rescued', 'review_posted', 'milestone_reached') NOT NULL,
            reference_id INT,
            description TEXT,
            points_earned INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB
    ");
    echo "<p>✅ User activities table created</p>";

    // Monthly leaderboard
    $pdo->exec("
        CREATE TABLE leaderboard (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            month_year VARCHAR(7) NOT NULL,
            donations_count INT DEFAULT 0,
            food_saved_kg DECIMAL(8,2) DEFAULT 0,
            points_earned INT DEFAULT 0,
            rank_position INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_user_month (user_id, month_year)
        ) ENGINE=InnoDB
    ");
    echo "<p>✅ Leaderboard table created</p>";

    // Insert sample areas
    $pdo->exec("INSERT INTO areas (name, city) VALUES 
        ('Dhanmondi', 'Dhaka'),
        ('Gulshan', 'Dhaka'),
        ('Uttara', 'Dhaka'),
        ('Mirpur', 'Dhaka'),
        ('Banani', 'Dhaka'),
        ('Wari', 'Dhaka'),
        ('Old Dhaka', 'Dhaka'),
        ('Tejgaon', 'Dhaka')
    ");
    echo "<p>✅ Sample areas inserted</p>";

    // Insert enhanced sample users
    $adminPassword = password_hash('password123', PASSWORD_DEFAULT);
    $restaurantPassword = password_hash('password123', PASSWORD_DEFAULT);
    $userPassword = password_hash('password123', PASSWORD_DEFAULT);
    
    $pdo->exec("
        INSERT INTO users (id, name, email, password, phone, address, type, avatar, bio, donation_count, food_saved_kg, points_earned) VALUES 
        (1, 'Admin User', 'admin@demo.com', '$adminPassword', '+880 1700-000000', 'Admin Office, Dhaka', 'admin', '/avatars/admin.jpg', 'Platform administrator committed to reducing food waste', 0, 0, 0),
        (2, 'Green Garden Restaurant', 'restaurant@demo.com', '$restaurantPassword', '+880 1700-111111', 'House 123, Road 4, Dhanmondi', 'restaurant', '/avatars/green_garden.jpg', 'Eco-friendly restaurant committed to zero waste', 15, 125.5, 850),
        (3, 'John Doe', 'user@demo.com', '$userPassword', '+880 1700-222222', 'House 456, Road 7, Gulshan', 'user', '/avatars/john.jpg', 'Food rescue enthusiast and community volunteer', 8, 45.2, 320),
        (4, 'Spice Palace', 'spice@demo.com', '$restaurantPassword', '+880 1700-333333', 'Sector 3, Uttara', 'restaurant', '/avatars/spice_palace.jpg', 'Authentic South Asian cuisine with surplus sharing program', 12, 89.3, 650),
        (5, 'Jane Smith', 'jane@demo.com', '$userPassword', '+880 1700-444444', 'Block C, Mirpur-1', 'user', '/avatars/jane.jpg', 'Home baker sharing extra food with neighbors', 22, 78.9, 890),
        (6, 'Ahmed Hassan', 'ahmed@demo.com', '$userPassword', '+880 1700-555555', 'Road 15, Banani', 'user', '/avatars/ahmed.jpg', 'Student and food waste warrior', 5, 23.1, 180),
        (7, 'Fatima Restaurant', 'fatima@demo.com', '$restaurantPassword', '+880 1700-666666', 'Wari, Old Dhaka', 'restaurant', '/avatars/fatima.jpg', 'Traditional Bengali restaurant with daily surplus sharing', 18, 156.7, 920)
    ");
    echo "<p>✅ Enhanced sample users inserted</p>";

    // Insert restaurants with area mapping
    $pdo->exec("
        INSERT INTO restaurants (id, user_id, name, description, cuisine_type, rating, total_reviews, verification_status, status, area_id) VALUES 
        (1, 2, 'Green Garden Restaurant', 'Fresh and healthy food with a focus on reducing waste. We offer organic meals and donate surplus food daily.', 'Bengali', 4.5, 127, 'verified', 'active', 1),
        (2, 4, 'Spice Palace', 'Authentic Indian and Pakistani cuisine with aromatic spices. Join our food rescue program!', 'Indian', 4.2, 89, 'verified', 'active', 3),
        (3, 7, 'Fatima Restaurant', 'Traditional Bengali home-style cooking with love. We believe no food should go to waste.', 'Bengali', 4.7, 203, 'verified', 'active', 6)
    ");
    echo "<p>✅ Restaurants with areas inserted</p>";

    // Insert sample products with AI detection and inventory status
    $pdo->exec("
        INSERT INTO products (restaurant_id, name, description, original_price, price, quantity, category, expires_at, status, ai_detected_type, confidence_score, views_count, saved_count) VALUES 
        (1, 'Chicken Biryani', 'Aromatic basmati rice with tender chicken pieces, perfect for lunch or dinner', 450.00, 350.00, 5, 'Main Course', DATE_ADD(NOW(), INTERVAL 4 HOUR), 'available', 'Rice Dish', 0.95, 45, 12),
        (1, 'Beef Curry', 'Spicy beef curry with traditional Bengali spices and tender meat pieces', 380.00, 280.00, 3, 'Main Course', DATE_ADD(NOW(), INTERVAL 3 HOUR), 'available', 'Curry', 0.92, 32, 8),
        (1, 'Fish Fry', 'Crispy fried fish with special Bengali seasoning and fresh herbs', 250.00, 180.00, 0, 'Main Course', DATE_ADD(NOW(), INTERVAL 2 HOUR), 'out_of_stock', 'Fish', 0.89, 28, 15),
        (1, 'Vegetable Curry', 'Mixed vegetable curry with coconut milk and fresh herbs', 200.00, 150.00, 6, 'Vegetarian', DATE_ADD(NOW(), INTERVAL 5 HOUR), 'available', 'Vegetable Curry', 0.93, 18, 5),
        (2, 'Butter Chicken', 'Creamy butter chicken with naan bread, a customer favorite', 420.00, 320.00, 4, 'Main Course', DATE_ADD(NOW(), INTERVAL 3 HOUR), 'available', 'Chicken Curry', 0.91, 67, 23),
        (2, 'Mutton Karahi', 'Traditional mutton karahi with fresh tomatoes and green chilies', 500.00, 380.00, 2, 'Main Course', DATE_ADD(NOW(), INTERVAL 4 HOUR), 'available', 'Meat Curry', 0.88, 41, 11),
        (2, 'Vegetable Samosas', 'Crispy vegetable samosas with mint chutney, perfect snack', 150.00, 100.00, 12, 'Appetizer', DATE_ADD(NOW(), INTERVAL 8 HOUR), 'available', 'Snack', 0.96, 89, 34),
        (3, 'Hilsa Fish Curry', 'Traditional Bengali hilsa fish curry with mustard paste', 380.00, 280.00, 3, 'Main Course', DATE_ADD(NOW(), INTERVAL 3 HOUR), 'available', 'Fish Curry', 0.94, 52, 19),
        (3, 'Panta Bhat', 'Traditional fermented rice with fried fish and vegetables', 120.00, 80.00, 8, 'Traditional', DATE_ADD(NOW(), INTERVAL 6 HOUR), 'available', 'Rice Dish', 0.87, 24, 7)
    ");
    echo "<p>✅ Products with AI detection inserted</p>";

    // Insert sample donations with area mapping
    $pdo->exec("
        INSERT INTO donations (user_id, title, description, food_type, quantity, location, detailed_location, contact_phone, contact_email, expires_at, pickup_instructions, status, area_id, ai_detected_type, interested_count) VALUES 
        (2, 'Fresh Vegetables from Restaurant', 'We have excess fresh vegetables including carrots, potatoes, onions, and leafy greens. Perfect condition, just surplus from our daily prep.', 'Vegetables', '10-15 servings', 'Dhanmondi, Dhaka', 'Green Garden Restaurant, House #123, Road #4, Dhanmondi', '+880 1700-111111', 'restaurant@demo.com', DATE_ADD(NOW(), INTERVAL 6 HOUR), 'Please call 30 minutes before pickup. Available between 5 PM - 8 PM.', 'available', 1, 'Mixed Vegetables', 3),
        (3, 'Homemade Bread and Pastries', 'Made too much bread and pastries for a family event. All fresh and delicious! Includes dinner rolls, croissants, and muffins.', 'Bakery Items', '20 pieces', 'Gulshan, Dhaka', 'House #456, Road #7, Gulshan-2', '+880 1700-222222', 'user@demo.com', DATE_ADD(NOW(), INTERVAL 8 HOUR), 'Flexible pickup time. Please message before coming.', 'available', 2, 'Baked Goods', 2),
        (4, 'Cooked Rice and Dal', 'Prepared extra rice and lentil curry for a community event. Still hot and fresh!', 'Cooked Meals', '15-20 servings', 'Uttara, Dhaka', 'Spice Palace Restaurant, Sector 3, Uttara', '+880 1700-333333', 'spice@demo.com', DATE_ADD(NOW(), INTERVAL 4 HOUR), 'Best picked up within 2 hours. Call before coming.', 'available', 3, 'Rice and Lentils', 4),
        (5, 'Fresh Fruits', 'Have extra mangoes, bananas, and apples from a bulk purchase. All ripe and sweet!', 'Fruits', '5-8 kg mixed fruits', 'Mirpur, Dhaka', 'House #789, Block C, Mirpur-1', '+880 1700-444444', 'jane@demo.com', DATE_ADD(NOW(), INTERVAL 12 HOUR), 'Available for pickup anytime today. Ring the doorbell.', 'available', 4, 'Fresh Fruits', 1),
        (6, 'Wedding Leftover Food', 'High-quality catered food from wedding ceremony. Biryani, kebabs, and desserts available.', 'Party Food', '30-40 servings', 'Banani, Dhaka', 'Community Center, Road 15, Banani', '+880 1700-555555', 'ahmed@demo.com', DATE_ADD(NOW(), INTERVAL 5 HOUR), 'Large quantity available. Bring containers. Available until 10 PM.', 'available', 5, 'Mixed Party Food', 8)
    ");
    echo "<p>✅ Donations with AI detection inserted</p>";

    // Insert sample reviews
    $pdo->exec("
        INSERT INTO reviews (user_id, restaurant_id, product_id, rating, comment, helpful_count) VALUES 
        (3, 1, 1, 5, 'Amazing chicken biryani at a great discount! Saved money and helped reduce waste. Will definitely order again!', 12),
        (5, 1, 2, 4, 'The beef curry was delicious and still fresh despite being discounted. Great initiative!', 8),
        (6, 2, 5, 5, 'Butter chicken was perfect! Love this app for getting quality food at lower prices.', 15),
        (3, 2, 6, 4, 'Mutton karahi was tasty but a bit spicy for my preference. Good value though.', 6),
        (5, 3, 8, 5, 'Authentic hilsa curry! Tasted just like my grandmother used to make. Excellent quality.', 18),
        (6, 1, 4, 4, 'Fresh vegetables curry with great flavor. Happy to support food waste reduction.', 9)
    ");
    echo "<p>✅ Sample reviews inserted</p>";

    // Insert enhanced community posts with activities
    $pdo->exec("
        INSERT INTO community_posts (user_id, content, type, likes_count, comments_count, shares_count) VALUES 
        (2, 'Just donated 20 meals to a local shelter! It feels amazing to contribute to reducing food waste while helping those in need. 🌱❤️ #FoodForAll #ZeroWaste', 'donation_activity', 25, 6, 3),
        (3, 'Pro tip: Store your fruits and vegetables properly to extend their life. Keep bananas separate as they release ethylene gas that ripens other fruits faster! 🍌', 'tip', 18, 4, 7),
        (4, 'Successfully rescued 50 kg of food this month through Food For All! Every restaurant owner should join this movement. It\\'s good for business and the planet! 🌍', 'story', 32, 8, 12),
        (1, 'Welcome to the Food For All community! Let\\'s work together to reduce food waste and help those in need. Share your stories and tips! 🤝', 'general', 45, 12, 5),
        (5, 'Amazing experience today! Got fresh vegetables at 50% off from Green Garden Restaurant. The food was perfect and I saved money too! 💚', 'pickup_activity', 28, 7, 4),
        (6, 'Question: What\\'s the best way to preserve leftover rice? I always end up throwing it away after 2 days. Any suggestions?', 'question', 12, 15, 2),
        (7, 'Reached 100 donations milestone today! 🎉 Thank you Food For All community for making food sharing so easy and impactful!', 'story', 67, 23, 15)
    ");
    echo "<p>✅ Enhanced community posts inserted</p>";

    // Insert user activities for community feed
    $pdo->exec("
        INSERT INTO user_activities (user_id, activity_type, reference_id, description, points_earned) VALUES 
        (2, 'donation_added', 1, 'Added fresh vegetables donation worth 10-15 servings', 50),
        (3, 'food_rescued', 1, 'Rescued chicken biryani from Green Garden Restaurant', 25),
        (5, 'milestone_reached', NULL, 'Reached 20 donations milestone', 100),
        (4, 'product_listed', 5, 'Listed butter chicken with 24% discount', 30),
        (6, 'review_posted', 1, 'Posted 5-star review for Green Garden Restaurant', 10),
        (7, 'milestone_reached', NULL, 'Reached 100 donations milestone', 500)
    ");
    echo "<p>✅ User activities inserted</p>";

    // Insert current month leaderboard
    $currentMonth = date('Y-m');
    $pdo->exec("
        INSERT INTO leaderboard (user_id, month_year, donations_count, food_saved_kg, points_earned, rank_position) VALUES 
        (5, '$currentMonth', 22, 78.9, 890, 1),
        (7, '$currentMonth', 18, 156.7, 920, 2),
        (2, '$currentMonth', 15, 125.5, 850, 3),
        (4, '$currentMonth', 12, 89.3, 650, 4),
        (3, '$currentMonth', 8, 45.2, 320, 5),
        (6, '$currentMonth', 5, 23.1, 180, 6)
    ");
    echo "<p>✅ Current month leaderboard inserted</p>";

    // Update restaurant ratings based on reviews
    $pdo->exec("
        UPDATE restaurants r SET 
        rating = (SELECT AVG(rating) FROM reviews WHERE restaurant_id = r.id),
        total_reviews = (SELECT COUNT(*) FROM reviews WHERE restaurant_id = r.id)
    ");
    echo "<p>✅ Restaurant ratings updated</p>";

    echo "<br><h2>📊 Database Statistics:</h2>";
    
    $tables = [
        'users', 'areas', 'restaurants', 'products', 'cart_items', 'orders', 
        'donations', 'reviews', 'community_posts', 'post_reactions', 'user_activities', 'leaderboard'
    ];
    
    foreach ($tables as $table) {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
        $count = $stmt->fetch()['count'];
        echo "<p>📋 <strong>$table:</strong> $count records</p>";
    }
    
    echo "<br><div style='background: #e6f7ff; border: 2px solid #1890ff; padding: 30px; border-radius: 12px; margin: 30px 0;'>";
    echo "<h2>🎉 COMPLETE DATABASE SETUP SUCCESSFUL!</h2>";
    echo "<h3>🚀 ALL SPRINT FEATURES READY:</h3>";
    echo "<p>✅ <strong>Sprint 1:</strong> Cart system, area filtering, UI foundation</p>";
    echo "<p>✅ <strong>Sprint 2:</strong> User authentication, seller dashboard, donation history</p>";
    echo "<p>✅ <strong>Sprint 3:</strong> AI detection, ratings/reviews, inventory badges, impact stats</p>";
    echo "<p>✅ <strong>Sprint 4:</strong> User profiles/avatars, community feed, leaderboard system</p>";
    echo "<br>";
    echo "<h3>🔐 Demo Accounts:</h3>";
    echo "<p>👑 Admin: admin@demo.com / password123</p>";
    echo "<p>🏪 Restaurant 1: restaurant@demo.com / password123 (Green Garden)</p>";
    echo "<p>🏪 Restaurant 2: spice@demo.com / password123 (Spice Palace)</p>";
    echo "<p>🏪 Restaurant 3: fatima@demo.com / password123 (Fatima Restaurant)</p>";
    echo "<p>👤 User 1: user@demo.com / password123 (John Doe)</p>";
    echo "<p>👤 User 2: jane@demo.com / password123 (Jane Smith - Top Donor)</p>";
    echo "<p>👤 User 3: ahmed@demo.com / password123 (Ahmed Hassan)</p>";
    echo "<br>";
    echo "<p><strong>🌐 Your complete app is ready at:</strong> <a href='http://localhost:5173' target='_blank'>http://localhost:5173</a></p>";
    echo "<p><strong>📊 Test backend at:</strong> <a href='http://localhost/food_for_all/backend.php?action=test' target='_blank'>Backend Test</a></p>";
    echo "</div>";
    
} catch (PDOException $e) {
    echo "<div style='background: #fff2f0; border: 1px solid #ffccc7; padding: 20px; border-radius: 8px; margin: 20px 0;'>";
    echo "<h3>❌ Database Error:</h3>";
    echo "<p><strong>Error:</strong> " . $e->getMessage() . "</p>";
    echo "<p><strong>Code:</strong> " . $e->getCode() . "</p>";
    echo "</div>";
}
?>
