const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
  id:               { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name:             { type: DataTypes.STRING(255), allowNull: false },
  category:         { type: DataTypes.STRING(255), allowNull: false },
  typicalShelfLife: { type: DataTypes.INTEGER, allowNull: true },
  storageLocation:  { type: DataTypes.STRING(100), defaultValue: 'Lodówka' },
  unit:             { type: DataTypes.STRING(50), defaultValue: 'szt' },
  notes:            { type: DataTypes.TEXT, allowNull: true },
  barcode:          { type: DataTypes.STRING(100), allowNull: true, unique: true },
  imageUri:         { type: DataTypes.TEXT, allowNull: true },
  barcodeType:      { type: DataTypes.STRING(50), allowNull: true },
  addedDate:        { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'products',
  timestamps: false,
});

module.exports = Product;
