const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const normalizeDatabaseUrl = (value) => {
  if (!value) {
    return '';
  }

  const trimmed = value.trim();
  const unquoted = trimmed.replace(/^(['"])(.*)\1$/, '$2');

  return unquoted.replace(/^postgresql:\/\//i, 'postgres://');
};

const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
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
