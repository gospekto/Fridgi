const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Product = require('./Product');

const FridgeItem = sequelize.define('FridgeItem', {
  fridgeId: { type: DataTypes.STRING(50), primaryKey: true },
  quantity: { type: DataTypes.DECIMAL(10,2), defaultValue: 1 },
  unit: { type: DataTypes.STRING(50), defaultValue: 'szt' },
  addedDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  lastUpdated: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  productId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
}, {
  tableName: 'fridge_items',
  timestamps: false,
});

FridgeItem.belongsTo(Product, { foreignKey: 'productId', onDelete: 'CASCADE' });
Product.hasMany(FridgeItem, { foreignKey: 'productId' });

module.exports = FridgeItem;
