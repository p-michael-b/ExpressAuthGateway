// Import the crypto module for cryptographic operations.
const crypto = require("crypto");

// Determine the 'root' variable based on the environment (development or production).
const root = (process.env.NODE_ENV === 'development') ? 'http://localhost:3000' : process.env.PRODUCTION_ROOT

/**
 * Get an operator by email from the 'operators' table.
 *
 * @param {Object} knex - The Knex instance for database queries.
 * @param {string} email - The email of the operator to retrieve.
 * @returns {Promise<Object>} - A promise that resolves to the operator with the specified email.
 * @throws {Error} - If there's an error during the database query.
 */

const getOperatorByEmail = async (knex, email) => {
    try {
        return await knex.select('*').from('operators').where('email', email).first();
    } catch (error) {
        throw new Error(error.message);
    }
}


/**
 * Get an operator by name from the 'operators' table.
 *
 * @param {Object} knex - The Knex instance for database queries.
 * @param {string} name - The email of the operator to retrieve.
 * @returns {Promise<Object>} - A promise that resolves to the operator with the specified email.
 * @throws {Error} - If there's an error during the database query.
 */

const getOperatorByName = async (knex, name) => {
    try {
        return await knex.select('*').from('operators').where('operator', name).first();
    } catch (error) {
        throw new Error(error.message)
    }
}

/**
 * Retrieve an operator by their token from the 'tokens' and 'operators' tables.
 *
 * @param {Object} knex - The Knex instance for database queries.
 * @param {string} token - The token associated with the operator.
 * @returns {Promise<Object>} - A promise that resolves to the operator linked to the provided token.
 * @throws {Error} - If there is an error during the database query.
 */

const getOperatorByToken = async (knex, token) => {
    try {
        return await knex
            .select('*')
            .from('tokens')
            .join('operators', 'tokens._fk_operator', 'operators._id')
            .where('tokens.token', token)
            .first();
    } catch (error) {
        throw new Error(error.message);
    }
}

/**
 * Retrieve a reset token record from the 'auth.tokens' table.
 *
 * @param {Object} knex - The Knex instance for database queries.
 * @param {string} token - The reset token to look up.
 * @returns {Promise<Object>} - A promise that resolves to the reset token record.
 * @throws {Error} - If there is an error during the database query.
 */

const getResetTokenRecord = async (knex, token) => {
    try {
        return await knex('auth.tokens')
            .where('token', token)
            .where('created_at', '>', knex.raw('NOW() - INTERVAL \'1 HOUR\''))
            .first();
    } catch (error) {
        throw new Error(error.message)
    }
}

/**
 * Retrieve an invite token record from the 'auth.tokens' table.
 *
 * @param {Object} knex - The Knex instance for database queries.
 * @param {string} token - The invite token to look up.
 * @returns {Promise<Object>} - A promise that resolves to the invite token record.
 * @throws {Error} - If there is an error during the database query.
 */

const getInviteTokenRecord = async (knex, token) => {
    try {
        return await knex('auth.tokens')
            .where('token', token)
            .first();
    } catch (error) {
        throw new Error(error.message)
    }
}

/**
 * Set a reset token for a given operator in the 'tokens' table.
 *
 * @param {Object} knex - The Knex instance for database queries.
 * @param {number} operator - The operator's ID.
 * @param {string} token - The reset token to be stored.
 * @throws {Error} - If there is an error during the database operation.
 * @throws {Error} - If a unique constraint error occurs, indicating a limit on password reset requests.
 */

const setResetToken = async (knex, operator, token) => {
    try {
        const currentTime = new Date().toISOString();
        await knex('tokens').insert({
            _fk_operator: operator,
            token: token,
            created_at: currentTime
        });
    } catch (error) {
        if (error.code === '23505') {
            throw new Error('Take it easy! For your safety, only one password reset request per hour.');
        } else {
            throw new Error(error.message)
        }
    }
}

/**
 * Set an invite token for a new operator in the 'auth.tokens' table and create the operator.
 *
 * @param {Object} knex - The Knex instance for database queries.
 * @param {string} operator - The email address of the new operator.
 * @param {string} token - The invite token to be stored.
 * @returns {Object} - An object indicating the success and an optional message.
 * @throws {Error} - If there is an error during the database operation.
 */

const setInviteToken = async (knex, operator, token) => {
    try {
        await knex.transaction(function (trx) {
            knex('auth.operators')
                .insert({
                    email: operator,
                    operator: "New Operator",
                })
                .returning('_id')
                .transacting(trx)
                .then(function (operator_id) {
                    const currentTime = new Date().toISOString();
                    return knex('auth.tokens')
                        .insert({
                            _fk_operator: operator_id[0]._id,
                            token: token,
                            created_at: currentTime
                        })
                        .transacting(trx)
                })
                .then(trx.commit)
                .catch(trx.rollback);
        })
        return {
            success: true,
            message: 'Till next time.',
        };
    } catch (error) {
        throw new Error(error.message)
    }
}

/**
 * Update the name of an operator in the 'auth.operators' table.
 *
 * @param {Object} knex - The Knex instance for database queries.
 * @param {string} name - The new name for the operator.
 * @param {number} operator - The ID of the operator to update.
 * @returns {number} - The ID of the updated operator.
 * @throws {Error} - If there is an error during the database operation.
 */

const updateOperator = async (knex, name, operator) => {
    try {
        await knex('auth.operators')
            .where({_id: operator})
            .update({operator: name})
        return operator;
    } catch (error) {
        throw new Error(error.message);
    }
}

/**
 * Update the password for an operator and delete the associated reset token from the database.
 *
 * @param {Object} knex - The Knex instance for database queries.
 * @param {string} hash - The hashed password to set for the operator.
 * @param {Object} token_record - The reset token record associated with the operator.
 * @throws {Error} - If there is an error during the database transaction.
 */

const updatePassword = async (knex, hash, token_record) => {
    try {
        await knex.transaction(function (trx) {
            knex('auth.operators')
                .where({_id: token_record._fk_operator})
                .update({password: hash})
                .transacting(trx)
                .then(function () {
                    return knex('auth.tokens')
                        .where('token', token_record.token)
                        .del()
                        .transacting(trx)
                })
                .then(trx.commit)
                .catch(trx.rollback);
        })
    } catch (error) {
        throw new Error(error.message);
    }
}


/**
 * Initialize an operator with a new password and update the operator's name, deleting the associated invite token.
 *
 * @param {Object} knex - The Knex instance for database queries.
 * @param {string} operator - The operator's name to set.
 * @param {string} hash - The hashed password to set for the operator.
 * @param {Object} token_record - The invite token record associated with the operator.
 * @throws {Error} - If there is an error during the database transaction.
 */

const initOperator = async (knex, operator, hash, token_record) => {
    try {
        await knex.transaction(function (trx) {
            knex('auth.operators')
                .where({_id: token_record._fk_operator})
                .update({password: hash, operator: operator})
                .transacting(trx)
                .then(function () {
                    return knex('auth.tokens')
                        .where('token', token_record.token)
                        .del()
                        .transacting(trx)
                })
                .then(trx.commit)
                .catch(trx.rollback);
        })
    } catch (error) {
        throw new Error(error.message)
    }
}

/**
 * Generate a random token for various purposes, such as reset tokens and invite tokens.
 *
 * @returns {string} - A randomly generated token in hexadecimal format.
 */

const generateToken = () => {
    return crypto.randomBytes(20).toString('hex');
}

/**
 * Generate a link by combining the root URL, a route, and a token.
 *
 * @param {string} route - The route to which the token is associated.
 * @param {string} token - The token to be included in the link.
 * @returns {string} - The complete link formed by combining the root, route, and token.
 */

const generateLink = (route, token) => {
    return root + '/' + route + '/' + token;
}

module.exports = {
    getOperatorByEmail,
    getOperatorByName,
    getOperatorByToken,
    getResetTokenRecord,
    getInviteTokenRecord,
    setResetToken,
    setInviteToken,
    updateOperator,
    updatePassword,
    initOperator,
    generateToken,
    generateLink,
};