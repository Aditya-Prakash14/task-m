const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Create a new todo
const createTodo = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      categoryId,
      parentId,
      tagIds,
      estimatedTime,
      reminderTime
    } = req.body;

    // Create todo with relations
    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedTime,
        userId: req.user.id,
        categoryId: categoryId || null,
        parentId: parentId || null,
        ...(tagIds && tagIds.length > 0 && {
          tags: {
            create: tagIds.map(tagId => ({
              tag: { connect: { id: tagId } }
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
        parent: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    // Create reminder if specified
    if (reminderTime) {
      await prisma.reminder.create({
        data: {
          userId: req.user.id,
          todoId: todo.id,
          reminderTime: new Date(reminderTime),
          type: 'PUSH'
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Todo created successfully',
      data: todo
    });
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating todo',
      error: error.message
    });
  }
};

// Get all todos with filtering and sorting
const getTodos = async (req, res) => {
  try {
    const {
      status,
      priority,
      categoryId,
      tagId,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 50
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {
      userId: req.user.id,
      parentId: null, // Only get top-level todos
      ...(status && { status }),
      ...(priority && { priority }),
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
          { description: { contains: search } }
        ]
      })
    };

    // Get todos with count
    const [todos, total] = await Promise.all([
      prisma.todo.findMany({
        where,
        include: {
          category: true,
          tags: {
            include: {
              tag: true
            }
          },
          subTodos: {
            include: {
              category: true
            }
          },
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
      prisma.todo.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        todos,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching todos',
      error: error.message
    });
  }
};

// Get single todo by ID
const getTodoById = async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await prisma.todo.findFirst({
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
        parent: {
          select: {
            id: true,
            title: true
          }
        },
        subTodos: {
          include: {
            category: true,
            tags: {
              include: {
                tag: true
              }
            }
          }
        },
        reminders: true
      }
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    res.json({
      success: true,
      data: todo
    });
  } catch (error) {
    console.error('Get todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching todo',
      error: error.message
    });
  }
};

// Update todo
const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      categoryId,
      tagIds,
      estimatedTime,
      actualTime
    } = req.body;

    // Check if todo exists and belongs to user
    const existingTodo = await prisma.todo.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existingTodo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    // If status is being updated to COMPLETED, set completedAt
    const updateData = {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(categoryId !== undefined && { categoryId }),
      ...(estimatedTime !== undefined && { estimatedTime }),
      ...(actualTime !== undefined && { actualTime }),
      ...(status === 'COMPLETED' && !existingTodo.completedAt && {
        completedAt: new Date()
      })
    };

    // Update todo
    const todo = await prisma.todo.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        tags: {
          include: {
            tag: true
          }
        },
        subTodos: true
      }
    });

    // Update tags if provided
    if (tagIds) {
      // Remove existing tags
      await prisma.todoTag.deleteMany({
        where: { todoId: id }
      });

      // Add new tags
      if (tagIds.length > 0) {
        await prisma.todoTag.createMany({
          data: tagIds.map(tagId => ({
            todoId: id,
            tagId
          }))
        });
      }
    }

    res.json({
      success: true,
      message: 'Todo updated successfully',
      data: todo
    });
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating todo',
      error: error.message
    });
  }
};

// Delete todo
const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if todo exists and belongs to user
    const todo = await prisma.todo.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    // Delete todo (cascade will handle relations)
    await prisma.todo.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Todo deleted successfully'
    });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting todo',
      error: error.message
    });
  }
};

// Get todos by date range
const getTodosByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const todos = await prisma.todo.findMany({
      where: {
        userId: req.user.id,
        dueDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    });

    res.json({
      success: true,
      data: todos
    });
  } catch (error) {
    console.error('Get todos by date range error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching todos',
      error: error.message
    });
  }
};

module.exports = {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
  getTodosByDateRange
};
