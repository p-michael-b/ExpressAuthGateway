// Import the bcrypt library for hashing and verifying passwords.
const bcrypt = require('bcrypt');

// Import the LocalStrategy from 'passport-local' for local authentication.
const LocalStrategy = require('passport-local').Strategy;

// Load the Knex configuration from the 'knexfile.js' file based on the current environment.
const knexConfig = require('./knexfile.js')[process.env.NODE_ENV];

// Initialize a Knex instance using the loaded configuration for database operations.
const knex = require('knex')(knexConfig);

/**
 * Local authentication strategy using Passport for user login.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {function} - An asynchronous function that handles user login and authentication.
 */

module.exports = new LocalStrategy({usernameField: 'email', passwordField: 'password'}, async (email, password, done) => {
    knex.select('_id', 'email', 'password', 'operator')
        .from('auth.operators')
        .where({email: email})
        .first()
        .then((operator) => {
            if (!operator) {
                return done(null, null, 'Operator not found');
            }
            bcrypt.compare(password, operator.password, function (error, isMatch) {
                if (error) {
                    return done(error, null, 'Bcrypt error');
                }
                if (!isMatch) {
                    return done(null, null, 'Password does not match');
                }
                return done(null, operator, 'Successfully authenticated');
            });
        })
        .catch((error) => {
            return done(error, null, 'knex error');
        });
});