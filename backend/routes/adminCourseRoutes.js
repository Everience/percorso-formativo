const express = require('express');
const router = express.Router();
const verificaAdmin = require('../middlewares/adminMiddleware');
const adminCourseController = require('../controllers/adminCourseController'); 

router.get('/', verificaAdmin, adminCourseController.getAllCoursesPaginated);
router.post('/', verificaAdmin, adminCourseController.createCourse);
router.get('/:id', verificaAdmin, adminCourseController.getCourseDetail);
router.patch('/:id', verificaAdmin, adminCourseController.updateCourse);
router.delete('/:id', verificaAdmin, adminCourseController.deleteCourse);

router.get('/:id/resources', verificaAdmin, adminCourseController.getCourseResources);
router.post('/:id/resources', verificaAdmin, adminCourseController.createResource);
router.patch('/:id/resources/:resourceId', verificaAdmin, adminCourseController.updateResource);
router.delete('/:id/resources/:resourceId', verificaAdmin, adminCourseController.deleteResource);

module.exports = router;