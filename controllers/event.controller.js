const { PrismaClient } = require('@prisma/client');
const { RRule } = require('rrule');

const prisma = new PrismaClient();

// Create a new event
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      startTime,
      endTime,
      isAllDay,
      categoryId,
      tagIds,
      attendees,
      reminderTime,
      isRecurring,
      recurrenceRule,
      recurrenceEnd
    } = req.body;

    // Validate time
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    // Check for conflicts
    const conflicts = await prisma.event.findMany({
      where: {
        userId: req.user.id,
        status: 'SCHEDULED',
        OR: [
          {
            AND: [
              { startTime: { lte: start } },
              { endTime: { gt: start } }
            ]
          },
          {
            AND: [
              { startTime: { lt: end } },
              { endTime: { gte: end } }
            ]
          },
          {
            AND: [
              { startTime: { gte: start } },
              { endTime: { lte: end } }
            ]
          }
        ]
      },
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true
      }
    });

    // Create event
    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        startTime: start,
        endTime: end,
        isAllDay: isAllDay || false,
        isRecurring: isRecurring || false,
        recurrenceRule,
        recurrenceEnd: recurrenceEnd ? new Date(recurrenceEnd) : null,
        userId: req.user.id,
        categoryId: categoryId || null,
        ...(tagIds && tagIds.length > 0 && {
          tags: {
            create: tagIds.map(tagId => ({
              tag: { connect: { id: tagId } }
            }))
          }
        }),
        ...(attendees && attendees.length > 0 && {
          attendees: {
            create: attendees.map(att => ({
              email: att.email,
              name: att.name,
              status: 'pending'
            }))
          }
        })
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true
          }
        },
        attendees: true
      }
    });

    // Create reminder if specified
    if (reminderTime) {
      await prisma.reminder.create({
        data: {
          userId: req.user.id,
          eventId: event.id,
          reminderTime: new Date(reminderTime),
          type: 'PUSH'
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: {
        event,
        conflicts: conflicts.length > 0 ? conflicts : null
      }
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message
    });
  }
};

// Get all events with filtering
const getEvents = async (req, res) => {
  try {
    const {
      status,
      categoryId,
      tagId,
      search,
      startDate,
      endDate,
      sortBy = 'startTime',
      order = 'asc',
      page = 1,
      limit = 50
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {
      userId: req.user.id,
      ...(status && { status }),
      ...(categoryId && { categoryId }),
      ...(tagId && {
        tags: {
          some: {
            tagId
          }
        }
      }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { location: { contains: search } }
        ]
      }),
      ...((startDate || endDate) && {
        AND: [
          ...(startDate ? [{ endTime: { gte: new Date(startDate) } }] : []),
          ...(endDate ? [{ startTime: { lte: new Date(endDate) } }] : [])
        ]
      })
    };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          category: true,
          tags: {
            include: {
              tag: true
            }
          },
          attendees: true,
          reminders: {
            where: {
              isSent: false
            }
          }
        },
        orderBy: { [sortBy]: order },
        skip,
        take: parseInt(limit)
      }),
      prisma.event.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
};

// Get single event by ID
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true
          }
        },
        attendees: true,
        reminders: true
      }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event',
      error: error.message
    });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      location,
      startTime,
      endTime,
      isAllDay,
      status,
      categoryId,
      tagIds,
      attendees
    } = req.body;

    // Check if event exists and belongs to user
    const existingEvent = await prisma.event.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Validate time if updating
    if (startTime || endTime) {
      const start = startTime ? new Date(startTime) : existingEvent.startTime;
      const end = endTime ? new Date(endTime) : existingEvent.endTime;

      if (end <= start) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time'
        });
      }
    }

    const updateData = {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(location !== undefined && { location }),
      ...(startTime && { startTime: new Date(startTime) }),
      ...(endTime && { endTime: new Date(endTime) }),
      ...(isAllDay !== undefined && { isAllDay }),
      ...(status && { status }),
      ...(categoryId !== undefined && { categoryId })
    };

    // Update event
    const event = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        tags: {
          include: {
            tag: true
          }
        },
        attendees: true
      }
    });

    // Update tags if provided
    if (tagIds) {
      await prisma.eventTag.deleteMany({
        where: { eventId: id }
      });

      if (tagIds.length > 0) {
        await prisma.eventTag.createMany({
          data: tagIds.map(tagId => ({
            eventId: id,
            tagId
          }))
        });
      }
    }

    // Update attendees if provided
    if (attendees) {
      await prisma.attendee.deleteMany({
        where: { eventId: id }
      });

      if (attendees.length > 0) {
        await prisma.attendee.createMany({
          data: attendees.map(att => ({
            eventId: id,
            email: att.email,
            name: att.name,
            status: att.status || 'pending'
          }))
        });
      }
    }

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: error.message
    });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    await prisma.event.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting event',
      error: error.message
    });
  }
};

// Get events by date (day view)
const getEventsByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const events = await prisma.event.findMany({
      where: {
        userId: req.user.id,
        OR: [
          {
            AND: [
              { startTime: { gte: startOfDay } },
              { startTime: { lte: endOfDay } }
            ]
          },
          {
            AND: [
              { startTime: { lt: startOfDay } },
              { endTime: { gt: startOfDay } }
            ]
          }
        ]
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true
          }
        },
        attendees: true
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Get events by date error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
};

// Get recurring event instances
const getRecurringInstances = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const event = await prisma.event.findFirst({
      where: {
        id,
        userId: req.user.id,
        isRecurring: true
      }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Recurring event not found'
      });
    }

    if (!event.recurrenceRule) {
      return res.status(400).json({
        success: false,
        message: 'Event does not have a recurrence rule'
      });
    }

    // Parse RRULE and generate instances
    const rule = RRule.fromString(event.recurrenceRule);
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : event.recurrenceEnd || new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days

    const instances = rule.between(start, end, true);

    res.json({
      success: true,
      data: {
        event,
        instances: instances.map(date => ({
          startTime: date,
          endTime: new Date(date.getTime() + (event.endTime - event.startTime))
        }))
      }
    });
  } catch (error) {
    console.error('Get recurring instances error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recurring instances',
      error: error.message
    });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventsByDate,
  getRecurringInstances
};
