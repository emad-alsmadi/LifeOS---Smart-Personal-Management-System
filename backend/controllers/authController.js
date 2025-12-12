const User = require('../models/User');
const { validationResult} = require('express-validator')
const bcrypt =  require('bcryptjs');
const jwt = require('jsonwebtoken');



exports.signup = async(req,res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        const error =  new Error('Validation failed')
        error.statusCode = 422;
        // throw the errors array
        error.data =  errors.array();
        throw error;
    }

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    try{
        const hashed = await bcrypt.hash(password, 12);
        const user =new User({
            email: email,
            name: name,
            password: hashed
        });
        const result = await user.save();
        
        // Generate token for the new user
        const token = jwt.sign(
            {
                email: result.email,
                userId: result._id.toString()
            },
            process.env.JWT_SECRET,
            { expiresIn: '90d' }
        );

        // Get user data without password
        const userData = await User.findById(result._id).select('-password').lean();

        res.status(201).json({ 
            message: 'User created!', 
            token: token,
            user: userData 
        });
    }catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
    }
}

exports.login = async(req,res,next)=>{
    const email =  req.body.email;
    const password =  req.body.password;
    let loadeduser;
    try{
        const user = await User.findOne({ email: email }).select('email password').lean();

        if (!user) {
            const error = new Error('A user with this email could not be found.');
            error.statusCode = 401;
            throw error;
        }

        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('Wrong password!');
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign(
            {
                email: user.email,
                userId: user._id.toString()
            },
            process.env.JWT_SECRET,
            { expiresIn: '90d' }
        );

        // Get full user data without password
        const userData = await User.findById(user._id).select('-password').lean();

        res.status(200).json({ 
            token: token, 
            user: userData 
        });
    }catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
    }
}

exports.getProfile = async(req,res,next)=>{
    try{
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ user: user });
    }catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.changePassword = async(req,res,next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;

    try{
        // Get user with password for comparison
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            const error = new Error('Current password is incorrect.');
            error.statusCode = 401;
            throw error;
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        // Update password
        user.password = hashedNewPassword;
        await user.save();

        res.status(200).json({ 
            message: 'Password changed successfully!',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.updateProfile = async(req,res,next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const name = req.body.name;

    try{
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }

        // Update user name
        user.name = name;
        await user.save();

        // Return updated user data without password
        const updatedUser = await User.findById(req.userId).select('-password').lean();

        res.status(200).json({ 
            message: 'Profile updated successfully!',
            user: updatedUser
        });
    }catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}
