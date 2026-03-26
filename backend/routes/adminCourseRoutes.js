const express = require('express');
const router = express.Router();
const verificaAdmin = require('../middlewares/adminMiddleware');
const { validate } = require('../middlewares/validate');
const schemas = require('../validations/schemas');
const adminCourseController = require('../controllers/adminCourseController');

router.get('/', verificaAdmin, adminCourseController.getAllCoursesPaginated);
router.post('/', verificaAdmin, validate(schemas.createCourse), adminCourseController.createCourse);
router.get('/:id/completions', verificaAdmin, adminCourseController.getCourseCompletions);
router.get('/:id', verificaAdmin, adminCourseController.getCourseDetail);
router.patch('/:id', verificaAdmin, validate(schemas.updateCourse), adminCourseController.updateCourse);
router.delete('/:id', verificaAdmin, adminCourseController.deleteCourse);

router.get('/:id/resources', verificaAdmin, adminCourseController.getCourseResources);
router.post('/:id/resources', verificaAdmin, validate(schemas.createResource), adminCourseController.createResource);
router.patch('/:id/resources/:resourceId', verificaAdmin, validate(schemas.updateResource), adminCourseController.updateResource);
router.delete('/:id/resources/:resourceId', verificaAdmin, adminCourseController.deleteResource);
router.put('/:id/resources/reorder', verificaAdmin, validate(schemas.reorderResources), adminCourseController.reorderResources);

module.exports = router;
