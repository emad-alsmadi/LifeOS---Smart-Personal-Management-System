const User = require("./models/User");

async function getAllUsers() {
  try {
    const users = await User.find();
    console.log(users);
  } catch (err) {
    console.error("Error fetching users:", err);
  }
}

getAllUsers();