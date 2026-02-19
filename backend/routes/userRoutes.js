const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/:id', userController.getUserById);
router.post('/login', userController.loginUser);
router.post('/add', userController.addUserToDB);
module.exports = router;