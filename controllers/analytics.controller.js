const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get dashboard analytics
const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Get todo statistics
    const [
      totalTodos,
      pendingTodos,
      inProgressTodos,
      completedTodos,
      overdueTodos
    ] = await Promise.all([
      prisma.todo.count({ where: { userId } }),
      prisma.todo.count({ where: { userId, status: 'PENDING' } }),
      prisma.todo.count({ where: { userId, status: 'IN_PROGRESS' } }),
      prisma.todo.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.todo.count({
        where: {
          userId,
          status: { not: 'COMPLETED' },
          dueDate: { lt: now }
        }
      })
    ]);

    // Get event statistics
    const [
      totalEvents,
      upcomingEvents,
      todayEvents
    ] = await Promise.all([
      prisma.event.count({ where: { userId } }),
      prisma.event.count({
        where: {
          userId,
          status: 'SCHEDULED',
          startTime: { gte: now }
        }
      }),
      prisma.event.count({
        where: {
          userId,
          startTime: {
            gte: new Date(now.setHours(0, 0, 0, 0)),
            lt: new Date(now.setHours(23, 59, 59, 999))
          }
        }
      })
    ]);

    // Get category usage
    const categoryUsage = await prisma.category.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            todos: true,
            events: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Get tag usage
    const tagUsage = await prisma.tag.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            todos: true,
            events: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Get upcoming reminders
    const upcomingReminders = await prisma.reminder.count({
      where: {
        userId,
        isSent: false,
        reminderTime: { gte: now }
      }
    });

    // Get todos by priority
    const todosByPriority = await prisma.todo.groupBy({
      by: ['priority'],
      where: {
        userId,
        status: { notIn: ['COMPLETED', 'CANCELLED'] }
      },
      _count: true
    });

    res.json({
      success: true,
      data: {
        todos: {
          total: totalTodos,
          pending: pendingTodos,
          inProgress: inProgressTodos,
          completed: completedTodos,
          overdue: overdueTodos,
          byPriority: todosByPriority.reduce((acc, item) => {
            acc[item.priority.toLowerCase()] = item._count;
            return acc;
          }, {})
        },
        events: {
          total: totalEvents,
          upcoming: upcomingEvents,
          today: todayEvents
        },
        categories: categoryUsage.map(cat => ({
          id: cat.id,
          name: cat.name,
          color: cat.color,
          todosCount: cat._count.todos,
          eventsCount: cat._count.events,
          totalCount: cat._count.todos + cat._count.events
        })),
        tags: tagUsage.map(tag => ({
          id: tag.id,
          name: tag.name,
          color: tag.color,
          todosCount: tag._count.todos,
          eventsCount: tag._count.events,
          totalCount: tag._count.todos + tag._count.events
        })),
        upcomingReminders
      }
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
};

// Get productivity analytics
const getProductivityAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
    const end = endDate ? new Date(endDate) : new Date();

    // Completed todos in period
    const completedTodos = await prisma.todo.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        completedAt: {
          gte: start,
          lte: end
        }
      },
      select: {
        completedAt: true,
        estimatedTime: true,
        actualTime: true,
        priority: true
      }
    });

    // Calculate completion rate
    const totalTodosInPeriod = await prisma.todo.count({
      where: {
        userId,
        createdAt: {
          gte: start,
          lte: end
        }
      }
    });

    const completionRate = totalTodosInPeriod > 0
      ? (completedTodos.length / totalTodosInPeriod) * 100
      : 0;

    // Calculate time accuracy
    const todosWithTime = completedTodos.filter(t => t.estimatedTime && t.actualTime);
    const timeAccuracy = todosWithTime.length > 0
      ? todosWithTime.reduce((acc, todo) => {
          const accuracy = Math.abs(todo.actualTime - todo.estimatedTime) / todo.estimatedTime;
          return acc + (1 - accuracy);
        }, 0) / todosWithTime.length * 100
      : 0;

    // Group by day
    const completionsByDay = {};
    completedTodos.forEach(todo => {
      const day = todo.completedAt.toISOString().split('T')[0];
      completionsByDay[day] = (completionsByDay[day] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        period: {
          start,
          end
        },
        completedCount: completedTodos.length,
        totalCount: totalTodosInPeriod,
        completionRate: Math.round(completionRate * 100) / 100,
        timeAccuracy: Math.round(timeAccuracy * 100) / 100,
        completionsByDay,
        completedByPriority: completedTodos.reduce((acc, todo) => {
          const priority = todo.priority.toLowerCase();
          acc[priority] = (acc[priority] || 0) + 1;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Get productivity analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching productivity analytics',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardAnalytics,
  getProductivityAnalytics
};
