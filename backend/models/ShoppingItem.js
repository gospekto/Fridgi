const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Product = require('./Product');
const User = require('./User');

const ShoppingItem = sequelize.define('ShoppingItem', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
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

User.hasMany(ShoppingItem, { foreignKey: 'user_id', onDelete: 'CASCADE' });
ShoppingItem.belongsTo(User, { foreignKey: 'user_id' });

module.exports = ShoppingItem;
