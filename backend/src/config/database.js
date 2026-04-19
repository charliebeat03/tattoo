const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions:
        process.env.NODE_ENV === 'production'
          ? {
              ssl: {
                require: true,
                rejectUnauthorized: false,
              },
            }
          : {},
    })
  : new Sequelize(
      process.env.DB_NAME || 'tattoo_catalogo',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'postgres',
      {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        dialect: 'postgres',
        logging: false,
      }
    );

module.exports = sequelize;
