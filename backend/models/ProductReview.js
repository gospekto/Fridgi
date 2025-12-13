const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = require('./User');
const Product = require('./Product');

const ProductReview = sequelize.define('ProductReview', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  productId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  rating: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'product_reviews',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'productId']
    }
  ]
});

User.hasMany(ProductReview, { foreignKey: 'user_id', onDelete: 'CASCADE' });
ProductReview.belongsTo(User, { foreignKey: 'user_id' });

Product.hasMany(ProductReview, { foreignKey: 'productId', onDelete: 'CASCADE' });
ProductReview.belongsTo(Product, { foreignKey: 'productId' });

module.exports = ProductReview;
