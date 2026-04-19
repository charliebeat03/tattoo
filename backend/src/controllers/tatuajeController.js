const { Op } = require('sequelize');
const Tatuaje = require('../models/Tatuaje');
const Category = require('../models/Category');
const { serializeTatuaje } = require('../utils/tatuajeSerializer');
const { uploadFileToStorage, safeDeleteStoredFile } = require('../utils/storageHelper');

const normalizeBooleanField = (value) => value === true || value === 'true' || value === 'on' || value === '1';
const normalizeNullableField = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  return value;
};
const normalizeNullableInteger = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? null : numericValue;
};

const normalizeArrayField = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch (_error) {
    return [];
  }
};

const tattooInclude = [
  {
    model: Category,
    as: 'category',
    attributes: ['id', 'nombre', 'slug', 'descripcion'],
    required: false,
  },
];

const getAllTatuajes = async (req, res, next) => {
  try {
    const where = {};

    if (req.query.categoryId) {
      where.categoryId = Number(req.query.categoryId);
    }

    if (req.query.search) {
      where[Op.or] = [
        { titulo: { [Op.iLike]: `%${req.query.search}%` } },
        { descripcion: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }

    const include = tattooInclude.map((item) => ({ ...item }));

    if (req.query.category) {
      include[0].required = true;
      include[0].where = { slug: req.query.category };
    }

    const tatuajes = await Tatuaje.findAll({
      where,
      include,
      order: [['createdAt', 'DESC']],
    });

    res.json(tatuajes.map((tatuaje) => serializeTatuaje(tatuaje)));
  } catch (error) {
    next(error);
  }
};

const getTatuajeById = async (req, res, next) => {
  try {
    const tatuaje = await Tatuaje.findByPk(req.params.id, { include: tattooInclude });

    if (!tatuaje) {
      return res.status(404).json({ message: 'Tatuaje no encontrado.' });
    }

    res.json(serializeTatuaje(tatuaje));
  } catch (error) {
    next(error);
  }
};

const getTatuajePayload = (req, currentTatuaje) => {
  const fotosExistentes = normalizeArrayField(req.body.fotosExistentes);
  const precioOferta = normalizeNullableField(req.body.precioOferta);

  return {
    titulo: req.body.titulo || currentTatuaje?.titulo,
    descripcion: req.body.descripcion || currentTatuaje?.descripcion,
    precio: req.body.precio || currentTatuaje?.precio,
    precioOferta,
    ofertaActiva:
      req.body.ofertaActiva !== undefined
        ? normalizeBooleanField(req.body.ofertaActiva)
        : currentTatuaje?.ofertaActiva || false,
    ofertaEtiqueta: normalizeNullableField(req.body.ofertaEtiqueta),
    ofertaInicio: normalizeNullableField(req.body.ofertaInicio),
    ofertaFin: normalizeNullableField(req.body.ofertaFin),
    fotoPrincipal: req.body.fotoPrincipal || currentTatuaje?.fotoPrincipal || '',
    fotos: currentTatuaje ? fotosExistentes : normalizeArrayField(req.body.fotos),
    categoryId:
      req.body.categoryId !== undefined
        ? normalizeNullableInteger(req.body.categoryId)
        : currentTatuaje?.categoryId || null,
    fotosExistentes,
  };
};

const validateCategory = async (categoryId) => {
  if (!categoryId) {
    return;
  }

  const category = await Category.findByPk(categoryId);

  if (!category) {
    const error = new Error('La categoria seleccionada no existe.');
    error.status = 400;
    throw error;
  }
};

const createTatuaje = async (req, res, next) => {
  const uploadedFiles = [...(req.files?.fotoPrincipal || []), ...(req.files?.fotos || [])];
  const uploadedPaths = [];

  try {
    const payload = getTatuajePayload(req);
    const fotoPrincipalSubida = req.files?.fotoPrincipal?.[0]
      ? await uploadFileToStorage(req.files.fotoPrincipal[0], 'principal')
      : payload.fotoPrincipal;
    const fotosSubidas = req.files?.fotos?.length
      ? await Promise.all(req.files.fotos.map((file) => uploadFileToStorage(file, 'galeria')))
      : payload.fotos;

    payload.fotoPrincipal = fotoPrincipalSubida;
    payload.fotos = fotosSubidas;
    if (req.files?.fotoPrincipal?.[0] && fotoPrincipalSubida) {
      uploadedPaths.push(fotoPrincipalSubida);
    }
    if (req.files?.fotos?.length) {
      uploadedPaths.push(...fotosSubidas);
    }

    if (!payload.titulo || !payload.descripcion || !payload.precio || !payload.fotoPrincipal) {
      await Promise.all(uploadedPaths.map((value) => safeDeleteStoredFile(value)));
      return res.status(400).json({
        message: 'Titulo, descripcion, precio y foto principal son obligatorios.',
      });
    }

    await validateCategory(payload.categoryId);

    const tatuaje = await Tatuaje.create(payload);
    const tatuajeConCategoria = await Tatuaje.findByPk(tatuaje.id, { include: tattooInclude });
    res.status(201).json(serializeTatuaje(tatuajeConCategoria));
  } catch (error) {
    const localTempPaths = uploadedFiles
      .filter((file) => file?.path)
      .map((file) => `/uploads/${file.filename}`);
    await Promise.all([...uploadedPaths, ...localTempPaths].map((value) => safeDeleteStoredFile(value)));
    next(error);
  }
};

const updateTatuaje = async (req, res, next) => {
  const uploadedFiles = [...(req.files?.fotoPrincipal || []), ...(req.files?.fotos || [])];
  const uploadedPaths = [];

  try {
    const tatuaje = await Tatuaje.findByPk(req.params.id);

    if (!tatuaje) {
      const localTempPaths = uploadedFiles
        .filter((file) => file?.path)
        .map((file) => `/uploads/${file.filename}`);
      await Promise.all(localTempPaths.map((value) => safeDeleteStoredFile(value)));
      return res.status(404).json({ message: 'Tatuaje no encontrado.' });
    }

    const payload = getTatuajePayload(req, tatuaje);
    await validateCategory(payload.categoryId);
    const fotoPrincipalAnterior = tatuaje.fotoPrincipal;

    if (req.files?.fotoPrincipal?.[0]) {
      payload.fotoPrincipal = await uploadFileToStorage(req.files.fotoPrincipal[0], 'principal');
      uploadedPaths.push(payload.fotoPrincipal);
    }

    const nuevasFotos = req.files?.fotos?.length
      ? await Promise.all(req.files.fotos.map((file) => uploadFileToStorage(file, 'galeria')))
      : [];
    uploadedPaths.push(...nuevasFotos);
    payload.fotos = [...payload.fotos, ...nuevasFotos];

    const fotosRemovidas = (tatuaje.fotos || []).filter((foto) => !payload.fotosExistentes.includes(foto));

    delete payload.fotosExistentes;
    await tatuaje.update(payload);
    if (req.files?.fotoPrincipal?.[0]) {
      await safeDeleteStoredFile(fotoPrincipalAnterior);
    }
    await Promise.all(fotosRemovidas.map((foto) => safeDeleteStoredFile(foto)));

    const tatuajeConCategoria = await Tatuaje.findByPk(tatuaje.id, { include: tattooInclude });
    res.json(serializeTatuaje(tatuajeConCategoria));
  } catch (error) {
    const localTempPaths = uploadedFiles
      .filter((file) => file?.path)
      .map((file) => `/uploads/${file.filename}`);
    await Promise.all([...uploadedPaths, ...localTempPaths].map((value) => safeDeleteStoredFile(value)));
    next(error);
  }
};

const deleteTatuaje = async (req, res, next) => {
  try {
    const tatuaje = await Tatuaje.findByPk(req.params.id);

    if (!tatuaje) {
      return res.status(404).json({ message: 'Tatuaje no encontrado.' });
    }

    await safeDeleteStoredFile(tatuaje.fotoPrincipal);
    await Promise.all((tatuaje.fotos || []).map((foto) => safeDeleteStoredFile(foto)));

    await tatuaje.destroy();

    res.json({ message: 'Tatuaje eliminado correctamente.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTatuajes,
  getTatuajeById,
  createTatuaje,
  updateTatuaje,
  deleteTatuaje,
};
