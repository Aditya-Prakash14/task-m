const express = require('express');
const { body } = require('express-validator');
const tagController = require('../controllers/tag.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

router.use(authMiddleware);

const tagValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Invalid color format')
];

router.post('/', tagValidation, validate, tagController.createTag);
router.get('/', tagController.getTags);
router.put('/:id', validate, tagController.updateTag);
router.delete('/:id', tagController.deleteTag);

module.exports = router;
