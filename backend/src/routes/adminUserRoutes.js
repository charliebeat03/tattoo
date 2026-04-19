const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} = require('../controllers/adminUserController');

const router = express.Router();

router.use(authMiddleware);
router.get('/', getAdmins);
router.post('/', createAdmin);
router.put('/:id', updateAdmin);
router.delete('/:id', deleteAdmin);

module.exports = router;
