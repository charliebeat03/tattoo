const jwt = require('jsonwebtoken');

const getJwtSecret = () => process.env.ADMIN_JWT_SECRET || process.env.ADMIN_SECRET || 'cambia-este-secret';

const signAdminToken = (admin) =>
  jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      nombre: admin.nombre,
    },
    getJwtSecret(),
    { expiresIn: '12h' }
  );

const verifyAdminToken = (token) => jwt.verify(token, getJwtSecret());

module.exports = {
  signAdminToken,
  verifyAdminToken,
};
