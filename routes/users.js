const express = require('express');
const router = express.Router();
const userSchema = require('../model/usersModel');
const authenticateToken = require('../middleware/token.middleware');
const authorizeRoles = require('../middleware/token.authorizeRoles');

// Get all users
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await userSchema.find({}).select('-password');
    res.status(200).json({
      status: 200,
      message: 'Users fetched successfully. ',
      data: users
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500, message: 'Server error. ', data: null });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await userSchema.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ status: 404, message: 'User not found. ', data: null });
    }

    res.status(200).json({
      status: 200,
      message: 'User fetched successfully. ',
      data: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500, message: 'Server error. ', data: null });
  }
});

// Put /:id/approve
router.put('/:id/approve', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const userId = req.params.id;
    const { isApproved } = req.body;

    const user = await userSchema.findByIdAndUpdate(
      userId,
      { isApproved },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ status: 404, message: 'User not found. ', data: null });
    }

    res.status(200).json({
      status: 200,
      message: 'User approved successfully. ',
      data: {
        userId: user._id,
        username: user.username,
        email: user.email,
        isApproved: user.isApproved,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500, message: 'Server error. ', data: null });
  }
});

// Delete user
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const userId = req.params.id;

    const deletedUser = await userSchema.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ status: 404, message: 'User not found. ', data: null });
    }

    res.status(200).json({
      status: 200,
      message: 'User deleted successfully. '
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500, message: 'Server error. ', data: null });
  }
});

module.exports = router;
