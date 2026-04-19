const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { trackVisit, getDashboardStats } = require('../controllers/analyticsController');

const router = express.Router();

router.post('/visit', trackVisit);
router.get('/dashboard', authMiddleware, getDashboardStats);

module.exports = router;
