const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const User = require("./models/User");
const bcrypt = require('bcryptjs');
// load envir var
dotenv.config();

//db con
connectDB();

// Create default admin user
const createDefaultAdmin = async () => {
  try {
    const adminEmail = 'rami@gmail.com';
    const adminPassword = 'admin123456';
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      // Create new admin user
      const adminUser = new User({
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      
      await adminUser.save();
      console.log('✅ Default admin user created successfully!');
      console.log('📧 Email: admin@productivity.com');
      console.log('🔑 Password: admin123456');
      console.log('⚠️  Remember to change these credentials in production!');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
};

// Create admin user after database connection
createDefaultAdmin();

const app = express();

app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));


//middleware setup

app.use(cors());//enable cors

// setting headers to solve the CORS ERROR (cross origin resourse sharing)
app.use((req,res,next)=>{
    // we allow an origins to access our conent'data'
    // we can add specific domains by seprate them by comma
    res.setHeader('Access-Control-Allow-Origin','*')
    // we allow this origins to use specific http methos
    res.setHeader('Access-Control-Allow-Methods','GET, POST, PUT, PATCH, DELETE');
    // the headers our client might set on thier requests
    // so the client can sent request with exta authoriztion data in the header and also define the content type of the request
    res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');
    next();
    
});





// Import and use the router
const routes = require('./routes');
app.use('/', routes); // Mount all routes at the root level

// Admin routes
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);


// Base routes


// --- custom JSON error handler ---
app.use((error, req, res, next) => {
    // Log the full error to the console for debugging
    console.error(error); 
    
    const status = error.statusCode || 500;
    const message = error.message || 'An unexpected error occurred.';
    const data = error.data; // For passing extra error data, like validation errors

    // In a development environment, you might want to send the stack trace
    const stack = process.env.NODE_ENV === 'development' ? error.stack : undefined;

    res.status(status).json({ message, data, stack });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
