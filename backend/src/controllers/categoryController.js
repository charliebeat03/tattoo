const Category = require('../models/Category');
const Tatuaje = require('../models/Tatuaje');
const { slugify } = require('../utils/slugHelper');

const normalizeBoolean = (value) => value === true || value === 'true' || value === 'on' || value === '1';

const serializeCategory = (category) => ({
  id: category.id,
  nombre: category.nombre,
  slug: category.slug,
  descripcion: category.descripcion,
  activa: category.activa,
  sortOrder: category.sortOrder,
  createdAt: category.createdAt,
});

const getCategories = async (_req, res, next) => {
  try {
    const categories = await Category.findAll({ order: [['sortOrder', 'ASC'], ['nombre', 'ASC']] });
    res.json(categories.map(serializeCategory));
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    if (!req.body.nombre) {
      return res.status(400).json({ message: 'El nombre de la categoria es obligatorio.' });
    }

    const category = await Category.create({
      nombre: req.body.nombre.trim(),
      slug: slugify(req.body.slug || req.body.nombre),
      descripcion: req.body.descripcion || '',
      activa: req.body.activa !== undefined ? normalizeBoolean(req.body.activa) : true,
      sortOrder: Number(req.body.sortOrder || 0),
    });

    res.status(201).json(serializeCategory(category));
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Categoria no encontrada.' });
    }

    await category.update({
      nombre: req.body.nombre ? req.body.nombre.trim() : category.nombre,
      slug: slugify(req.body.slug || req.body.nombre || category.nombre),
      descripcion: req.body.descripcion !== undefined ? req.body.descripcion : category.descripcion,
      activa: req.body.activa !== undefined ? normalizeBoolean(req.body.activa) : category.activa,
      sortOrder: req.body.sortOrder !== undefined ? Number(req.body.sortOrder) : category.sortOrder,
    });

    res.json(serializeCategory(category));
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Categoria no encontrada.' });
    }

    const tatuajesRelacionados = await Tatuaje.count({ where: { categoryId: category.id } });

    if (tatuajesRelacionados > 0) {
      return res.status(400).json({
        message: 'No puedes eliminar una categoria que todavia tiene tatuajes asignados.',
      });
    }

    await category.destroy();
    res.json({ message: 'Categoria eliminada correctamente.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  serializeCategory,
};
