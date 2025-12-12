const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const connectDB = require('../config/db');

dotenv.config();

const email = process.argv[2];
if (!email) {
  console.error('Usage: node makeAdmin.js ahmad@gmail.com');
  process.exit(1);
}

(async () => {
  try {
    await connectDB();
    const user = await User.findOne({ email });
    if (!user) {
      console.error('User not found');
      process.exit(1);
    }
    user.role = 'admin';
    await user.save();
    console.log(`User ${user.email} is now an admin.`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
