const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.get('/', courseController.getAllCourses);
router.get('/dashboard/:userId', courseController.getUserDashboard);
router.get('/:id', courseController.getCourseById);
router.get('/:id/resources', courseController.getResourcesByCourse);

router.post('/:id', courseController.updateCourseStatus);

module.exports = router;