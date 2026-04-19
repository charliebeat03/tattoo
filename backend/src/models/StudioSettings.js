const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StudioSettings = sequelize.define(
  'StudioSettings',
  {
    studioName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'AzojuanitoP41',
    },
    slogan: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Tatuajes con identidad, reserva directa y catalogo vivo.',
    },
    aboutStudio: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue:
        'AzojuanitoP41 es un estudio orientado a piezas curadas, reservas directas y una experiencia clara para que cada cliente encuentre estilo, precio y contacto sin friccion.',
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Direccion pendiente de confirmar por el estudio',
    },
    instagramUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
    facebookUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
    whatsappNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '5215512345678',
    },
    mapUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
    developerName: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Desarrollador principal',
    },
  },
  {
    tableName: 'studio_settings',
  }
);

module.exports = StudioSettings;
