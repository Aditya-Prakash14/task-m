const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Create tag
const createTag = async (req, res) => {
  try {
    const { name, color } = req.body;

    const tag = await prisma.tag.create({
      data: {
        name,
        color: color || '#6b7280',
        userId: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Tag created successfully',
      data: tag
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Tag with this name already exists'
      });
    }

    console.error('Create tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating tag',
      error: error.message
    });
  }
};

// Get all tags
const getTags = async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      where: {
        userId: req.user.id
      },
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

    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tags',
      error: error.message
    });
  }
};

// Update tag
const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    const tag = await prisma.tag.updateMany({
      where: {
        id,
        userId: req.user.id
      },
      data: {
        ...(name && { name }),
        ...(color && { color })
      }
    });

    if (tag.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    const updatedTag = await prisma.tag.findUnique({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Tag updated successfully',
      data: updatedTag
    });
  } catch (error) {
    console.error('Update tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating tag',
      error: error.message
    });
  }
};

// Delete tag
const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await prisma.tag.deleteMany({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    res.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting tag',
      error: error.message
    });
  }
};

module.exports = {
  createTag,
  getTags,
  updateTag,
  deleteTag
};
