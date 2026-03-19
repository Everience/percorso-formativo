const express = require('express');
const router = express.Router();
const verificaAdmin = require('../middlewares/adminMiddleware');
const adminAnalyticsController = require('../controllers/adminAnalyticsController');

router.get('/', verificaAdmin, adminAnalyticsController.getOverview);

module.exports = router;
