const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Product = require('./Product');
const User = require('./User');

const FridgeItem = sequelize.define('FridgeItem', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
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

User.hasMany(FridgeItem, { foreignKey: 'user_id', onDelete: 'CASCADE' });
FridgeItem.belongsTo(User, { foreignKey: 'user_id' });

module.exports = FridgeItem;
