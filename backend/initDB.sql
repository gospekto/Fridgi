CREATE DATABASE IF NOT EXISTS fridgi;

USE fridgi;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  expiry_date DATE,
  barcode VARCHAR(100),
  barcode_type VARCHAR(50),
  image_path VARCHAR(255),
  storage_location VARCHAR(100) DEFAULT 'Lodówka',
  notes TEXT,
  estimated_shelf_life INT,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) -- jeśli masz tabelę users
);

-- Dodaj indeksy dla lepszej wydajności
CREATE INDEX idx_user_id ON products(user_id);
CREATE INDEX idx_expiry_date ON products(expiry_date);