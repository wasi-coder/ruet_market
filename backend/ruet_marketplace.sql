-- RUET Marketplace Database Schema

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    ruet_id VARCHAR(20) UNIQUE NOT NULL,
    department ENUM('CSE', 'Civil', 'Architecture', 'Mechanical', 'Electrical', 'Chemical', 'Industrial', 'Textile') NOT NULL,
    phone VARCHAR(15),
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    product_updates BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    type ENUM('sale', 'rent') NOT NULL,
    category ENUM('Books', 'Electronics', 'Bikes', 'Furniture', 'Clothing', 'Sports', 'Other') NOT NULL,
    department ENUM('CSE', 'Civil', 'Architecture', 'Mechanical', 'Electrical', 'Chemical', 'Industrial', 'Textile') NOT NULL,
    condition_rating ENUM('New', 'Like New', 'Good', 'Fair', 'Poor') NOT NULL,
    image VARCHAR(500),
    contact_phone VARCHAR(15),
    contact_name VARCHAR(100),
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Buy Requests table
CREATE TABLE buy_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category ENUM('Books', 'Electronics', 'Bikes', 'Furniture', 'Clothing', 'Sports', 'Other') NOT NULL,
    max_price DECIMAL(10,2),
    image VARCHAR(500),
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Buy Request Replies table
CREATE TABLE buy_request_replies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    buy_request_id INT NOT NULL,
    replier_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buy_request_id) REFERENCES buy_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (replier_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    read_status BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample users
INSERT INTO users (name, email, password, ruet_id, department, phone) VALUES
('John Doe', 'john@example.com', '$2b$10$example_hash', '2020-CSE-001', 'CSE', '+8801712345678'),
('Jane Smith', 'jane@example.com', '$2b$10$example_hash', '2020-Civil-002', 'Civil', '+8801812345678');

-- Insert sample products
INSERT INTO products (title, description, price, type, category, department, condition_rating, contact_phone, contact_name, user_id) VALUES
('Calculus Textbook', 'Calculus: Early Transcendentals 8th Edition, used for 2 semesters', 500.00, 'sale', 'Books', 'CSE', 'Good', '+8801712345678', 'John Doe', 1),
('Mountain Bike', 'Giant mountain bike, perfect for campus commuting', 15000.00, 'sale', 'Bikes', 'CSE', 'Like New', '+8801712345678', 'John Doe', 1),
('Arduino Kit', 'Complete Arduino starter kit with sensors and components', 2500.00, 'rent', 'Electronics', 'Electrical', 'New', '+8801812345678', 'Jane Smith', 2);