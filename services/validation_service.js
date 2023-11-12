//import deep email validator for validating email addresses
const { validate } = require('deep-email-validator');

/**
 * Check if the provided value contains at least one lowercase letter.
 * @param {string} value - The value to be checked.
 * @returns {Object} - An object with 'valid' indicating if the condition is met and a corresponding 'message'.
 */
const containsLowercase = (value) => ({
    valid: /[a-z]/.test(value),
    message: 'Password must contain at least one lowercase letter'
});


/**
 * Check if the provided value contains at least one uppercase letter.
 * @param {string} value - The value to be checked.
 * @returns {Object} - An object with 'valid' indicating if the condition is met and a corresponding 'message'.
 */
const containsUppercase = (value) => ({
    valid: /[A-Z]/.test(value),
    message: 'Password must contain at least one uppercase letter'
});

/**
 * Check if the provided value contains at least one number.
 * @param {string} value - The value to be checked.
 * @returns {Object} - An object with 'valid' indicating if the condition is met and a corresponding 'message'.
 */
const containsNumber = (value) => ({
    valid: /\d/.test(value),
    message: 'Password must contain at least one number'
});

/**
 * * Check if the provided value contains only allowed characters.
 * @param {string} value - The value to be checked.
 * @returns {Object} - An object with 'valid' indicating if the condition is met and a corresponding 'message'.
 */
const onlyAllowedChars = (value) => ({
    valid: !/[^a-zA-Z0-9 !@#$%^&*()_+\-=[\]{};:,.?]/.test(value),
    message: 'Password can only contain the following characters: \n' +
        'a-z, A-Z, 0-9, spaces, and these special characters: \n' +
        '!@#$%^&*()_+-=[]{};:,.?'
});

/**
 * Check if the provided value contains at least one special character.
 * @param {string} value - The value to be checked.
 * @returns {Object} - An object with 'valid' indicating if the condition is met and a corresponding 'message'.
 */
const containsSpecialChar = (value) => ({
    valid: /[!@#$%^&*()_+\-=[\]{};:,.?]/.test(value),
    message: 'Password must contain at least one special character: \n' +
        '(!@#$%^&*()_+-=[]{};:,.?)'
});

/**
 * Check if the provided value contains at least eight characters.
 * @param {string} value - The value to be checked.
 * @returns {Object} - An object with 'valid' indicating if the condition is met and a corresponding 'message'.
 */
const atLeastEightCharacters = (value) => ({
    valid: value.length >= 8,
    message: 'Password must have at least eight characters'
});

/**
 * Check if the provided value contains at most twenty characters.
 * @param {string} value - The value to be checked.
 * @returns {Object} - An object with 'valid' indicating if the condition is met and a corresponding 'message'.
 */
const atMostTwentyCharacters = (value) => ({
    valid: value.length <= 20,
    message: 'Password must have at most 20 characters'
});

/**
 * Check if the provided value contains at least five characters.
 * @param {string} value - The value to be checked.
 * @returns {Object} - An object with 'valid' indicating if the condition is met and a corresponding 'message'.
 */
const atLeastFiveCharactersOperator = (value) => ({
    valid: value.length >= 5,
    message: 'Make it grow a little.'
});

/**
 * Check if the provided value contains at most twenty characters.
 * @param {string} value - The value to be checked.
 * @returns {Object} - An object with 'valid' indicating if the condition is met and a corresponding 'message'.
 */
const atMostTwentyCharactersOperator = (value) => ({
    valid: value.length <= 20,
    message: 'Easy... Take it easy.'
});

/**
 * Check if the provided value is a valid email address.
 * @param {string} value - The value to be checked.
 * @returns {Object} - An object with 'valid' indicating if the condition is met and a corresponding 'message'.
 */
const validEmail = async (value) => {
    let result = {};
    const validation = await validate(value);
    result.valid= validation.valid;
    result.message= validation.reason;
    return result;
};


/**
 * Validate a password based on a set of validation functions.
 * @param {string} password - The password to be validated.
 * @returns {boolean} - `true` if the password passes all validations, `false` otherwise.
 */
const validatePassword = (password) => {
    const validators = [
        containsLowercase,
        containsUppercase,
        containsNumber,
        containsSpecialChar,
        onlyAllowedChars,
        atLeastEightCharacters,
        atMostTwentyCharacters,
    ]
    let errors = {};
    // run each validator function on the value
    for (let validator of validators) {
        let result = validator(password);
        // if the validation fails, add an error message to the errors object
        if (!result.valid) {
            errors[0] = errors[0] || [];
            errors[0].push(result.message);
        }
    }
    return Object.keys(errors).length === 0
}

/**
 * Validate an operator's name based on a set of validation functions.
 * @param {string} operator - The operator's name to be validated.
 * @returns {boolean} - `true` if the operator's name passes all validations, `false` otherwise.
 */
const validateOperator = (operator) => {
    const validators = [
        atLeastFiveCharactersOperator,
        atMostTwentyCharactersOperator,
    ]
    let errors = {};
    // run each validator function on the value
    for (let validator of validators) {
        let result = validator(operator);
        // if the validation fails, add an error message to the errors object
        if (!result.valid) {
            errors[0] = errors[0] || [];
            errors[0].push(result.message);
        }
    }
    return Object.keys(errors).length === 0
}

/**
 * Validate an operator's email based on a set of validation functions.
 * @param {string} operator - The operator's email to be validated.
 * @returns {boolean} - `true` if the operator's name passes all validations, `false` otherwise.
 */
const validateEmail = async (operator) => {
    const validators = [
        validEmail
    ]
    let errors = {};
    // run each validator function on the value
    for (let validator of validators) {
        let result = await validator(operator);
        // if the validation fails, add an error message to the errors object
        if (!result.valid) {
            errors[0] = errors[0] || [];
            errors[0].push(result.message);
        }
    }
    return Object.keys(errors).length === 0
}

module.exports = {
    validatePassword,
    validateOperator,
    validateEmail
};