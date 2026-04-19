const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

const router = express.Router();

router.get('/', getCategories);
router.post('/', authMiddleware, createCategory);
router.put('/:id', authMiddleware, updateCategory);
router.delete('/:id', authMiddleware, deleteCategory);

module.exports = router;
