const express = require('express');
const { body } = require('express-validator');
const categoryController = require('../controllers/category.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

router.use(authMiddleware);

const categoryValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Invalid color format'),
  body('description').optional().isString()
];

router.post('/', categoryValidation, validate, categoryController.createCategory);
router.get('/', categoryController.getCategories);
router.put('/:id', validate, categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
