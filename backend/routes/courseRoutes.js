const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const verificaToken = require('../middlewares/authMiddleware');

router.get('/', courseController.getAllCourses);
router.get('/dashboard/:userId', verificaToken, courseController.getUserDashboard);
router.get('/dashboard/me', verificaToken, courseController.getUserDashboard);
router.get('/:id', courseController.getCourseById);
router.get('/:id/resources', courseController.getResourcesByCourse);

router.patch('/:id/status', verificaToken, courseController.updateCourseStatus);

module.exports = router;