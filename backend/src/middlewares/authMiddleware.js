const AdminUser = require('../models/AdminUser');
const { verifyAdminToken } = require('../utils/authHelper');

const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';

    if (!token) {
      return res.status(401).json({ message: 'Debes iniciar sesion como administrador.' });
    }

    const payload = verifyAdminToken(token);
    const admin = await AdminUser.findByPk(payload.id);

    if (!admin || !admin.activo) {
      return res.status(401).json({ message: 'La sesion del administrador no es valida.' });
    }

    req.admin = admin;
    next();
  } catch (_error) {
    return res.status(401).json({ message: 'Sesion expirada o invalida.' });
  }
};

module.exports = authMiddleware;
