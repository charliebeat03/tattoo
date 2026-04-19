const bcrypt = require('bcryptjs');
const AdminUser = require('../models/AdminUser');
const { serializeAdmin } = require('./adminAuthController');

const normalizeBoolean = (value) => value === true || value === 'true' || value === 'on' || value === '1';
const normalizeNullableString = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  return String(value).trim();
};

const getVisibilityValue = (profileType, value, fallback = false) => {
  if (profileType === 'desarrollador') {
    return false;
  }

  if (value === undefined) {
    return fallback;
  }

  return normalizeBoolean(value);
};

const ensureUniqueEmail = async (email, currentAdminId = null) => {
  const existing = await AdminUser.findOne({ where: { email: email.trim().toLowerCase() } });

  if (existing && existing.id !== currentAdminId) {
    const error = new Error('Ya existe un usuario administrador con ese email.');
    error.status = 409;
    throw error;
  }
};

const getAdmins = async (_req, res, next) => {
  try {
    const admins = await AdminUser.findAll({ order: [['createdAt', 'ASC']] });
    res.json(admins.map(serializeAdmin));
  } catch (error) {
    next(error);
  }
};

const createAdmin = async (req, res, next) => {
  try {
    const {
      nombre,
      email,
      password,
      role = 'admin',
      profileType = 'admin',
      activo = true,
      publicVisible = false,
      publicBio,
      instagramUrl,
      facebookUrl,
      telefonoPublico,
      direccionPublica,
      avatarUrl,
    } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ message: 'Nombre, email y password son obligatorios.' });
    }

    await ensureUniqueEmail(email);

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await AdminUser.create({
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role,
      profileType,
      activo: normalizeBoolean(activo),
      publicVisible: getVisibilityValue(profileType, publicVisible),
      publicBio: normalizeNullableString(publicBio),
      instagramUrl: normalizeNullableString(instagramUrl),
      facebookUrl: normalizeNullableString(facebookUrl),
      telefonoPublico: normalizeNullableString(telefonoPublico),
      direccionPublica: normalizeNullableString(direccionPublica),
      avatarUrl: normalizeNullableString(avatarUrl),
    });

    res.status(201).json(serializeAdmin(admin));
  } catch (error) {
    next(error);
  }
};

const updateAdmin = async (req, res, next) => {
  try {
    const admin = await AdminUser.findByPk(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: 'Administrador no encontrado.' });
    }

    const nextEmail = req.body.email ? req.body.email.trim().toLowerCase() : admin.email;
    await ensureUniqueEmail(nextEmail, admin.id);

    const nextProfileType = req.body.profileType || admin.profileType;
    const payload = {
      nombre: req.body.nombre ? req.body.nombre.trim() : admin.nombre,
      email: nextEmail,
      role: req.body.role || admin.role,
      profileType: nextProfileType,
      activo: req.body.activo !== undefined ? normalizeBoolean(req.body.activo) : admin.activo,
      publicVisible: getVisibilityValue(nextProfileType, req.body.publicVisible, admin.publicVisible),
      publicBio: req.body.publicBio !== undefined ? normalizeNullableString(req.body.publicBio) : admin.publicBio,
      instagramUrl:
        req.body.instagramUrl !== undefined ? normalizeNullableString(req.body.instagramUrl) : admin.instagramUrl,
      facebookUrl:
        req.body.facebookUrl !== undefined ? normalizeNullableString(req.body.facebookUrl) : admin.facebookUrl,
      telefonoPublico:
        req.body.telefonoPublico !== undefined
          ? normalizeNullableString(req.body.telefonoPublico)
          : admin.telefonoPublico,
      direccionPublica:
        req.body.direccionPublica !== undefined
          ? normalizeNullableString(req.body.direccionPublica)
          : admin.direccionPublica,
      avatarUrl: req.body.avatarUrl !== undefined ? normalizeNullableString(req.body.avatarUrl) : admin.avatarUrl,
    };

    if (req.body.password) {
      payload.passwordHash = await bcrypt.hash(req.body.password, 10);
    }

    await admin.update(payload);
    res.json(serializeAdmin(admin));
  } catch (error) {
    next(error);
  }
};

const deleteAdmin = async (req, res, next) => {
  try {
    const admin = await AdminUser.findByPk(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: 'Administrador no encontrado.' });
    }

    const totalAdmins = await AdminUser.count();
    const totalSuperadmins = await AdminUser.count({ where: { role: 'superadmin' } });

    if (totalAdmins <= 1 || (admin.role === 'superadmin' && totalSuperadmins <= 1)) {
      return res.status(400).json({
        message: 'No puedes eliminar el ultimo administrador con acceso al panel.',
      });
    }

    await admin.destroy();
    res.json({ message: 'Administrador eliminado correctamente.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
};
