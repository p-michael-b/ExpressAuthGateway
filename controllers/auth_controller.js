// Import the database service module for handling database operations.
const databaseService = require('../services/database_service');

// Import the validation service module for data validation.
const validationService = require('../services/validation_service');

// Import the mail service module for sending email notifications.
const mailService = require('../services/mail_service');

// Import the Passport library for client-side authentication and authorization.
const passport = require("passport");

// Import JWT library for server-side authentication and authorization.
const jwt = require("jsonwebtoken");

// Import the bcrypt library for password hashing and comparison.
const bcrypt = require("bcrypt");

// Define the number of salt rounds for bcrypt password hashing (recommended value: 10).
const saltRounds = 10;

// Authenticate a user using Passport's 'local' strategy, create a session, and sign the session with a JWT upon successful login.
const login = async (req, res, next) => {
    passport.authenticate('local', async (error, authenticatedUser) => {
        if (!authenticatedUser) {
            return res.status(400).json({
                success: false,
                message: 'You shall not pass!',
            });
        }
        req.login(authenticatedUser, async (error) => {
            if (error) return next(error)

            req.session.token = jwt.sign({userId: authenticatedUser.id}, process.env.JWT_SECRET, {expiresIn: '1h'});
            return res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: authenticatedUser
                }
            });
        })
    })(req, res, next);
}

// Log out the user by clearing their session.
const logout = async (req, res) => {
    req.logout(() => {
        req.session.destroy(() => {
            return res.status(200).json({
                success: true,
                message: 'The operator has been logged out'
            })
        })
    })
}

/**
 * Handle the 'forgot password' process:
 * 1. Retrieve the recipient email from the request.
 * 2. Check if the email is valid.
 * 3. Check if the email corresponds to a registered operator.
 * 4. Generate a reset token and a link for the reset process.
 * 5. Send a password reset email with the reset link.
 * 6. Handle success and error responses accordingly.
 */
const forgot = async (req, res) => {
    const {mailRecipient} = req.body;
    const knex = req.knex;
    try {
        const validEmail = await validationService.validateEmail(mailRecipient);
        if (!validEmail) {
            throw new Error("That's not a valid email!");
        }
        const operator = await databaseService.getOperatorByEmail(knex, mailRecipient);
        if (!operator) {
            return res.status(200).json({
                success: true,
                message: 'If that was your email, you will soon get mail.',
            });
        }
        const token = databaseService.generateToken();
        const link = databaseService.generateLink('forgot', token);
        const mailSubject = "Of course I forget things, it's not like I have an elephant for a brain."
        const mailText = `You have requested password reset for your apebase account. If it wasn't you, please let us know. Here is your link:

    ${link}`
        await databaseService.setResetToken(knex, operator._id, token);
        const response = await mailService.sendMail(mailRecipient, mailSubject, mailText);
        const responseData = await response.json();
        if (response.ok) {
            return res.status(200).json({
                success: true,
                message: 'If that was your email, you will soon get mail.',
            });
        } else {
            return res.status(response.status).json({
                success: false,
                message: responseData.error
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

/**
 * Handle the password reset process:
 * 1. Retrieve the reset token and new password from the request.
 * 2. Validate the new password.
 * 3. Check if the reset token is valid and exists.
 * 4. Hash the new password.
 * 5. Update the user's password with the hashed password.
 * 6. Return a response indicating the success or failure of the password update.
 */
const password = async (req, res) => {
    const {token, password} = req.body;
    const knex = req.knex;
    try {
        const validPassword = await validationService.validatePassword(password);
        if (!validPassword) {
            throw new Error("That's not a valid password!");
        }
        const tokenRecord = await databaseService.getResetTokenRecord(knex, token);
        if (!tokenRecord) {
            throw new Error("This token isn't valid. Tokens time out after an hour.");
        }
        const hash = await bcrypt.hash(password, saltRounds);
        await databaseService.updatePassword(knex, hash, tokenRecord);
        return res.status(200).json({
            success: true,
            message: 'Password updated successfully',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

/**
 * Handle the creation or update of an operator's name:
 * 1. Retrieve the operator name from the request.
 * 2. Validate the operator name for correctness.
 * 3. Check if the operator name is already taken in the database.
 * 4. Create or update the operator's name if it's available.
 * 5. Return a response indicating success or an error message.
 */
const operator = async (req, res) => {
    const {operator} = req.body;
    const knex = req.knex;
    try {
        const validOperator = await validationService.validateOperator(operator);
        if (!validOperator) {
            throw new Error("That's not a valid name.");
        }
        const operatorRecord = await databaseService.getOperatorByName(knex, operator);
        if (operatorRecord) {
            throw new Error("This name is taken.");
        } else {
            await databaseService.updateOperator(knex, operator, req.user._id);
            return res.status(200).json({
                success: true,
                message: 'Stand and be recognized ' + operator
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

/**
 * Handle the creation or update of an operator's name:
 * 1. Retrieve the operator name from the request.
 * 2. Check if the operator name is already taken in the database.
 * 3. Create or update the operator's name if it's available.
 * 4. Return a response indicating success or an error message.
 */
const probe = async (req, res) => {
    const {operator} = req.body;
    const knex = req.knex;
    try {
        const operatorRecord = await databaseService.getOperatorByName(knex, operator);
        if (operatorRecord) {
            throw new Error("This name is taken.");
        } else {
            return res.status(200).json({
                success: true,
                message: 'Name ' + operator + ' is available'
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

/**
 * Handle the invitation process for a new operator:
 * 1. Check if the operator's email already exists in the database.
 * 2. If not, generate an invitation token and link.
 * 3. Send an invitation email to the recipient.
 * 4. Return a response indicating success or an error message.
 */
const invite = async (req, res) => {
    const {mailRecipient} = req.body;
    const knex = req.knex;
    try {
        const validEmail = await validationService.validateEmail(mailRecipient);
        if (!validEmail) {
            throw new Error("That's not a valid email!");
        }
        const operatorRecord = await databaseService.getOperatorByEmail(knex, mailRecipient);
        if (operatorRecord) {
            throw new Error("This operator has already joined.");
        }
        const token = databaseService.generateToken();
        const link = databaseService.generateLink('welcome', token);
        const mailSubject = `The fate of our digital world rests in your hands.`
        const mailText = `A friend has invited you to join the apebase. Here is your link:

    ${link}`
        await databaseService.setInviteToken(knex, mailRecipient, token);
        await mailService.sendMail(mailRecipient, mailSubject, mailText);
        return res.status(200).json({
            success: true,
            message: 'Your invitation has been extended.',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

/**
 * Handle the welcome process for an invited operator:
 * 1. Check if an operator with the provided token exists in the database.
 * 2. If found, respond with a success message containing the operator's email.
 * 3. If not found, respond with an error message indicating no invitation exists for the token.
 */
const welcome = async (req, res) => {
    const {token} = req.body;
    const knex = req.knex;
    try {
        const operator = await databaseService.getOperatorByToken(knex, token);
        if (!operator) {
            throw new Error("There is no invitation for this token.");
        } else {
            return res.status(200).json({
                success: true,
                message: operator.email
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


/**
 * Initialize an operator using a provided token and credentials:
 * 1. Check if the operator name already exists in the database.
 * 2. Validate the operator name.
 * 3. Validate the password.
 * 4. Verify the validity of the invitation token.
 * 5. Hash the provided password.
 * 6. Initialize the operator using the valid name, hashed password, and the token record.
 * 7. Respond with a success message if the operator is successfully initialized.
 * 8. Handle and respond to any errors that may occur during the initialization process.
 */
const init = async (req, res) => {
    const {token, password, operator} = req.body;
    const knex = req.knex;

    try {
        const validOperator = await validationService.validateOperator(operator);
        if (!validOperator) {
            throw new Error("That's not a valid name.");
        }
        const existingOperator = await databaseService.getOperatorByName(knex, operator);
        if (existingOperator) {
            throw new Error("This name is taken.");
        }
        const validPassword = await validationService.validatePassword(password);
        if (!validPassword) {
            throw new Error("That's not a valid password.");
        }
        const tokenRecord = await databaseService.getInviteTokenRecord(knex, token);
        if (!tokenRecord) {
            throw new Error("This invitation is invalid.");
        }
        const hash = await bcrypt.hash(password, saltRounds);
        //We must pass both the token and tokenRecord because we also delete the token
        await databaseService.initOperator(knex, operator, hash, tokenRecord);
        return res.status(200).json({
            success: true,
            message: 'Operator successfully initialized.',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    login,
    logout,
    forgot,
    password,
    operator,
    probe,
    invite,
    welcome,
    init
};