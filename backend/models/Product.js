class Product {
  constructor(pool) {
    this.pool = pool;
  }

  async create(productData) {
    const [result] = await this.pool.execute(
      `INSERT INTO products 
      (name, category, quantity, unit, expiry_date, barcode, barcode_type, 
       image_path, storage_location, notes, estimated_shelf_life, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productData.name,
        productData.category,
        productData.quantity,
        productData.unit,
        productData.expiryDate,
        productData.barcode,
        productData.barcodeType,
        productData.imagePath,
        productData.storageLocation,
        productData.notes,
        productData.estimatedShelfLife,
        productData.userId
      ]
    );
    return { id: result.insertId, ...productData };
  }

  async findByUserId(userId) {
    const [rows] = await this.pool.execute(
      'SELECT * FROM products WHERE user_id = ? ORDER BY expiry_date ASC',
      [userId]
    );
    return rows;
  }

  // Pozostałe metody...
}

module.exports = Product;