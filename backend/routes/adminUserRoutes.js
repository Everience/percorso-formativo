const express = require('express');
const router = express.Router();
const verificaAdmin = require('../middlewares/adminMiddleware');

const adminUserController = require('../controllers/adminUserController'); 


router.get('/', verificaAdmin, adminUserController.getAllUsersPaginated);
router.get('/:id', verificaAdmin, adminUserController.getUserDetail);
router.patch('/:id', verificaAdmin, adminUserController.updateUserRole);
router.get('/:id/progress', verificaAdmin, adminUserController.getUserProgress);

module.exports = router;