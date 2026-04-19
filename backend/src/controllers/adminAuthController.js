const bcrypt = require('bcryptjs');
const AdminUser = require('../models/AdminUser');
const { signAdminToken } = require('../utils/authHelper');

const serializeAdmin = (admin) => ({
  id: admin.id,
  nombre: admin.nombre,
  email: admin.email,
  role: admin.role,
  profileType: admin.profileType,
  publicVisible: admin.publicVisible,
  publicBio: admin.publicBio,
  instagramUrl: admin.instagramUrl,
  facebookUrl: admin.facebookUrl,
  telefonoPublico: admin.telefonoPublico,
  direccionPublica: admin.direccionPublica,
  avatarUrl: admin.avatarUrl,
  activo: admin.activo,
  ultimoAcceso: admin.ultimoAcceso,
  createdAt: admin.createdAt,
});

const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y password son obligatorios.' });
    }

    const admin = await AdminUser.findOne({ where: { email: email.trim().toLowerCase() } });

    if (!admin || !admin.activo) {
      return res.status(401).json({ message: 'Credenciales invalidas.' });
    }

    const validPassword = await bcrypt.compare(password, admin.passwordHash);

    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales invalidas.' });
    }

    await admin.update({ ultimoAcceso: new Date() });

    res.json({
      token: signAdminToken(admin),
      admin: serializeAdmin(admin),
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentAdmin = async (req, res) => {
  res.json({ admin: serializeAdmin(req.admin) });
};

module.exports = {
  loginAdmin,
  getCurrentAdmin,
  serializeAdmin,
};
