const express = require('express');
const { body } = require('express-validator');
const eventController = require('../controllers/event.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Validation rules
const eventValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional().isString(),
  body('location').optional().isString(),
  body('startTime').isISO8601().withMessage('Valid start time is required'),
  body('endTime').isISO8601().withMessage('Valid end time is required'),
  body('isAllDay').optional().isBoolean(),
  body('status').optional().isIn(['SCHEDULED', 'COMPLETED', 'CANCELLED']),
  body('categoryId').optional().isString(),
  body('tagIds').optional().isArray(),
  body('attendees').optional().isArray(),
  body('reminderTime').optional().isISO8601(),
  body('isRecurring').optional().isBoolean(),
  body('recurrenceRule').optional().isString(),
  body('recurrenceEnd').optional().isISO8601()
];

// Routes
router.post('/', eventValidation, validate, eventController.createEvent);
router.get('/', eventController.getEvents);
router.get('/by-date', eventController.getEventsByDate);
router.get('/:id', eventController.getEventById);
router.get('/:id/recurring-instances', eventController.getRecurringInstances);
router.put('/:id', validate, eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

module.exports = router;
