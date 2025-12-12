const User = require('../models/User');

// List users (no sensitive info)
exports.listUsers = async (req, res) => {
  const users = await User.find({}, 'name email role isActive createdAt updatedAt');
  res.json(users);
};

// Update user (role, isActive)
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { role, isActive } = req.body;
  const user = await User.findByIdAndUpdate(
    id,
    { role, isActive },
    { new: true, fields: 'name email role isActive createdAt updatedAt' }
  );
  res.json(user);
};

// Delete user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  res.json({ message: 'User deleted' });
};
