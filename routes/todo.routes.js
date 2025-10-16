const express = require('express');
const { body } = require('express-validator');
const todoController = require('../controllers/todo.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Validation rules
const todoValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional().isString(),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('status').optional().isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  body('dueDate').optional().isISO8601(),
  body('categoryId').optional().isString(),
  body('parentId').optional().isString(),
  body('tagIds').optional().isArray(),
  body('estimatedTime').optional().isInt({ min: 1 }),
  body('actualTime').optional().isInt({ min: 1 }),
  body('reminderTime').optional().isISO8601()
];

// Routes
router.post('/', todoValidation, validate, todoController.createTodo);
router.get('/', todoController.getTodos);
router.get('/date-range', todoController.getTodosByDateRange);
router.get('/:id', todoController.getTodoById);
router.put('/:id', validate, todoController.updateTodo);
router.delete('/:id', todoController.deleteTodo);

module.exports = router;
