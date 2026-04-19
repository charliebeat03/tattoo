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
const isProduction = process.env.NODE_ENV === 'production';
const commonOptions = {
  dialect: 'postgres',
  logging: false,
  dialectOptions: isProduction
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
};

const buildSequelizeFromUrl = (connectionString) => {
  const parsed = new URL(connectionString);
  const dialect = parsed.protocol.replace(/:$/, '') || 'postgres';

  return new Sequelize(
    decodeURIComponent(parsed.pathname.replace(/^\//, '') || 'postgres'),
    decodeURIComponent(parsed.username),
    decodeURIComponent(parsed.password),
    {
      ...commonOptions,
      dialect,
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : 5432,
    }
  );
};

const sequelize = databaseUrl
  ? buildSequelizeFromUrl(databaseUrl)
  : new Sequelize(
      process.env.DB_NAME || 'tattoo_catalogo',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'postgres',
      {
        ...commonOptions,
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
      }
    );

module.exports = sequelize;
