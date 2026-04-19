const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Visit = sequelize.define(
  'Visit',
  {
    visitorId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    page: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '/',
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'visits',
    updatedAt: false,
  }
);

module.exports = Visit;
