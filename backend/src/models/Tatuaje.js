const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tatuaje = sequelize.define(
  'Tatuaje',
  {
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
      },
    },
    precioOferta: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    ofertaActiva: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    ofertaEtiqueta: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ofertaInicio: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ofertaFin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fotoPrincipal: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    fotos: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: 'tatuajes',
  }
);

module.exports = Tatuaje;
