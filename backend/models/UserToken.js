const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const UserToken = sequelize.define('UserToken', {
  id: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    autoIncrement: true, 
    primaryKey: true 
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  refresh_token: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'user_tokens',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

User.hasMany(UserToken, { foreignKey: 'user_id', onDelete: 'CASCADE' });
UserToken.belongsTo(User, { foreignKey: 'user_id' });

module.exports = UserToken;
