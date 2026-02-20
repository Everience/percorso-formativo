const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verificaToken = require('../middlewares/authMiddleware');

router.get('/:id', verificaToken, userController.getUserById);
router.post('/login', verificaToken, userController.loginUser);
router.post('/', verificaToken, userController.addUserToDB);
module.exports = router;
