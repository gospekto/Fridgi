const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Product = require('./Product');

const ShoppingItem = sequelize.define('ShoppingItem', {
  shoppingId: { type: DataTypes.STRING(50), primaryKey: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  quantity: { type: DataTypes.DECIMAL(10,2), defaultValue: 1 },
  checked: { type: DataTypes.BOOLEAN, defaultValue: false },
  addedDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  lastUpdated: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  productId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
}, {
  tableName: 'shopping_items',
  timestamps: false,
});

ShoppingItem.belongsTo(Product, { foreignKey: 'productId', onDelete: 'SET NULL' });
Product.hasMany(ShoppingItem, { foreignKey: 'productId' });

module.exports = ShoppingItem;
