const express = require('express');
const upload = require('../middlewares/upload');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  getAllTatuajes,
  getTatuajeById,
  createTatuaje,
  updateTatuaje,
  deleteTatuaje,
} = require('../controllers/tatuajeController');

const router = express.Router();
const uploadFields = upload.fields([
  { name: 'fotoPrincipal', maxCount: 1 },
  { name: 'fotos', maxCount: 12 },
]);

router.get('/', getAllTatuajes);
router.get('/:id', getTatuajeById);
router.post('/', authMiddleware, uploadFields, createTatuaje);
router.put('/:id', authMiddleware, uploadFields, updateTatuaje);
router.delete('/:id', authMiddleware, deleteTatuaje);

module.exports = router;
