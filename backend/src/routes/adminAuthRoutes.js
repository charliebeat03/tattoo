const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { loginAdmin, getCurrentAdmin } = require('../controllers/adminAuthController');

const router = express.Router();

router.post('/login', loginAdmin);
router.get('/me', authMiddleware, getCurrentAdmin);

module.exports = router;
