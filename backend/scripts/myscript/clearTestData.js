
require('dotenv').config();
const mongoose = require('mongoose');
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([
    mongoose.connection.collection('users').deleteMany({}),
    mongoose.connection.collection('pillars').deleteMany({}),
    mongoose.connection.collection('goals').deleteMany({}),
    // add others as needed
  ]);
  console.log('Test data wiped ✅');
  process.exit(0);
})();
//to run this file : node scripts\myscript/clearTestData.js