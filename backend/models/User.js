const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password_hash: { type: DataTypes.STRING },
  google_connected: { type: DataTypes.BOOLEAN, defaultValue: false },
  google_id: { type: DataTypes.STRING, unique: true },
  name: { type: DataTypes.STRING },
  avatar_url: { type: DataTypes.TEXT },
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = User;
