// Import the Express.js framework
const express = require('express');

// Create an instance of the Express Router.
const router = express.Router();

// Import the local authentication controller.
const authController = require('../controllers/auth_controller');


//middleware for protecting the routes
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(403).json({
        status: 403,
        success: false,
        message: 'Unauthenticated. Please log in first',
        data: [],
    });
}

//Authentication routes

//Login endpoint for acquiring authentication. Sets JWT token to authenticate with microservices
//not a protected route, user is just logging in
router.post('/login', authController.login);

//Logout endpoint for exiting the apebase
//This must be a protected route
router.get('/logout', isAuthenticated, authController.logout);

//Forgot endpoint for sending password reset email.
//not a protected route, user cannot login, requests password reset email
router.post('/forgot', authController.forgot);

//set password endpoint for setting new password.
//not a protected route, user received password reset email and is verified by token
router.post('/password', authController.password);

//update operator endpoint for setting new operator name.
//This must be a protected route
router.post('/operator', isAuthenticated, authController.operator);

//probe operator endpoint for probing availability of new operator name.
//This must be a protected route
router.post('/probe', isAuthenticated, authController.probe);

//invite friend endpoint for sending invitation email.
//This must be a protected route
router.post('/invite', isAuthenticated, authController.invite);

//welcome endpoint for retrieving email address from token.
//not a protected route, welcoming user from token and sending back email
router.post('/welcome', authController.welcome);

//welcome endpoint for retrieving email address from token.
//not a protected route, registering operator name and password
router.post('/init', authController.init);

module.exports = router;
