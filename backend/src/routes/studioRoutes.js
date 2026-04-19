const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  getPublicStudio,
  getAdminStudio,
  updateStudio,
} = require('../controllers/studioController');

const router = express.Router();

router.get('/', getPublicStudio);
router.get('/admin', authMiddleware, getAdminStudio);
router.put('/admin', authMiddleware, updateStudio);

module.exports = router;
