const express = require('express');
const { body } = require('express-validator');
const reminderController = require('../controllers/reminder.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

router.use(authMiddleware);

const reminderValidation = [
  body('type').optional().isIn(['EMAIL', 'PUSH', 'SMS']),
  body('reminderTime').isISO8601().withMessage('Valid reminder time is required'),
  body('message').optional().isString(),
  body('todoId').optional().isString(),
  body('eventId').optional().isString()
];

router.post('/', reminderValidation, validate, reminderController.createReminder);
router.get('/', reminderController.getReminders);
router.put('/:id', validate, reminderController.updateReminder);
router.delete('/:id', reminderController.deleteReminder);

module.exports = router;
