const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Create reminder
const createReminder = async (req, res) => {
  try {
    const { type, reminderTime, message, todoId, eventId } = req.body;

    if (!todoId && !eventId) {
      return res.status(400).json({
        success: false,
        message: 'Either todoId or eventId is required'
      });
    }

    const reminder = await prisma.reminder.create({
      data: {
        type: type || 'PUSH',
        reminderTime: new Date(reminderTime),
        message,
        userId: req.user.id,
        todoId: todoId || null,
        eventId: eventId || null
      },
      include: {
        todo: {
          select: {
            id: true,
            title: true
          }
        },
        event: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Reminder created successfully',
      data: reminder
    });
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating reminder',
      error: error.message
    });
  }
};

// Get all reminders
const getReminders = async (req, res) => {
  try {
    const { isSent, upcoming } = req.query;

    const where = {
      userId: req.user.id,
      ...(isSent !== undefined && { isSent: isSent === 'true' }),
      ...(upcoming === 'true' && {
        reminderTime: { gte: new Date() },
        isSent: false
      })
    };

    const reminders = await prisma.reminder.findMany({
      where,
      include: {
        todo: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            startTime: true
          }
        }
      },
      orderBy: {
        reminderTime: 'asc'
      }
    });

    res.json({
      success: true,
      data: reminders
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reminders',
      error: error.message
    });
  }
};

// Update reminder
const updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, reminderTime, message, isSent } = req.body;

    const reminder = await prisma.reminder.updateMany({
      where: {
        id,
        userId: req.user.id
      },
      data: {
        ...(type && { type }),
        ...(reminderTime && { reminderTime: new Date(reminderTime) }),
        ...(message !== undefined && { message }),
        ...(isSent !== undefined && { isSent })
      }
    });

    if (reminder.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    const updatedReminder = await prisma.reminder.findUnique({
      where: { id },
      include: {
        todo: {
          select: {
            id: true,
            title: true
          }
        },
        event: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Reminder updated successfully',
      data: updatedReminder
    });
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating reminder',
      error: error.message
    });
  }
};

// Delete reminder
const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await prisma.reminder.deleteMany({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    res.json({
      success: true,
      message: 'Reminder deleted successfully'
    });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting reminder',
      error: error.message
    });
  }
};

module.exports = {
  createReminder,
  getReminders,
  updateReminder,
  deleteReminder
};
