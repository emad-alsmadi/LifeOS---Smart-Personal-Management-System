const express = require('express');
const { body } = require('express-validator');

const User = require('../models/User');
const authController = require('../controllers/authController');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// Public routes (no authentication required)
router.post('/signup',
    [
        body('email')
            .isEmail()
            .withMessage('please enter a valid email.')
            .custom( ( value, { req }) => { 
                return User.findOne({email: value})
                    .then(userDoc => {
                        if (userDoc){
                            return Promise.reject('E-mail address already exists');
                        }
                    })
            })
            .normalizeEmail(),
        body('password')
            .trim()
            .isLength({ min:5 }),
        body('name')
            .trim()
            // not be Empty
            .not()
            .isEmpty()
    ],
    authController.signup
)

router.post('/login',authController.login);
router.get('/profile', isAuth, authController.getProfile);
router.put('/change-password', 
    isAuth,
    [
        body('currentPassword')
            .trim()
            .not()
            .isEmpty()
            .withMessage('Current password is required.'),
        body('newPassword')
            .trim()
            .isLength({ min: 6 })
            .withMessage('New password must be at least 6 characters long.')
    ],
    authController.changePassword
);

router.put('/update-profile', 
    isAuth,
    [
        body('name')
            .trim()
            .not()
            .isEmpty()
            .withMessage('Name is required.')
            .isLength({ min: 2 })
            .withMessage('Name must be at least 2 characters long.')
    ],
    authController.updateProfile
);

module.exports = router;
