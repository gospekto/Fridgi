const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  category: { type: DataTypes.STRING(255), allowNull: false },
  quantity: { type: DataTypes.DECIMAL(10,2), defaultValue: 1 },
  unit: { type: DataTypes.STRING(50), defaultValue: 'szt' },
  expiryDate: { type: DataTypes.DATE, allowNull: true },
  barcode: { type: DataTypes.STRING(100), allowNull: true, unique: true },
  barcodeType: { type: DataTypes.STRING(50), allowNull: true },
  imageUri: { type: DataTypes.TEXT, allowNull: true },
  storageLocation: { type: DataTypes.STRING(100), defaultValue: 'Lodówka' },
  notes: { type: DataTypes.TEXT, allowNull: true },
  estimatedShelfLife: { type: DataTypes.INTEGER, allowNull: true },
  typicalShelfLife: { type: DataTypes.INTEGER, allowNull: true },
  addedDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'products',
  timestamps: false,
});

module.exports = Product;
