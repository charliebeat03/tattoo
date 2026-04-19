const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdminUser = sequelize.define(
  'AdminUser',
  {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
      set(value) {
        this.setDataValue('email', value.trim().toLowerCase());
      },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('superadmin', 'admin'),
      allowNull: false,
      defaultValue: 'admin',
    },
    profileType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'admin',
      validate: {
        isIn: [['desarrollador', 'tatuador', 'admin']],
      },
    },
    publicVisible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    publicBio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    instagramUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    facebookUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    telefonoPublico: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    direccionPublica: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    avatarUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    ultimoAcceso: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'admin_users',
  }
);

module.exports = AdminUser;
