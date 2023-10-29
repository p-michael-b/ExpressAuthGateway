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

// Validates an email address to ensure it meets standard email format requirements.
const isValidEmail = (email) => {
    // Check if the email string is empty or undefined
    if (!email) {
        return false;
    }

    // Check that the email contains a "@" symbol
    if (!email.includes("@")) {
        return false;
    }

    // Split the email into local and domain parts
    const parts = email.split("@");
    const localPart = parts[0];
    const domainPart = parts[1];

    // Check that the local part is not empty
    if (localPart.length === 0) {
        return false;
    }

    // Check that the domain part contains a dot
    if (!domainPart.includes(".")) {
        return false;
    }

    // Check that the domain part has at least two characters after the dot
    const domainParts = domainPart.split(".");
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2) {
        return false;
    }

    // Check that the domain part does not have consecutive dots
    if (domainPart.includes("..")) {
        return false;
    }

    // Check that the domain part does not start or end with a hyphen
    if (domainPart.startsWith("-") || domainPart.endsWith("-")) {
        return false;
    }

    // Check that the local and domain parts do not contain invalid characters
    const localPartPattern = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]+$/;
    if (!localPartPattern.test(localPart)) {
        return false;
    }
    const domainPartPattern = /^[a-zA-Z0-9.-]+$/;
    if (!domainPartPattern.test(domainPart)) {
        return false;
    }

    // If all checks pass, the email is valid
    return true;
};

/**
 * Check if the provided value is a valid email address.
 * @param {string} value - The value to be checked.
 * @returns {Object} - An object with 'valid' indicating if the condition is met and a corresponding 'message'.
 */
const validEmail = (value) => ({
    valid: isValidEmail(value),
    message: `That doesn't seem to be right.`,
});


/**
 * Validate an operator's email based on a set of validation functions.
 * @param {string} operator - The operator's email to be validated.
 * @returns {boolean} - `true` if the operator's name passes all validations, `false` otherwise.
 */
const validateEmail = (operator) => {
    const validators = [
        validEmail
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

module.exports = {
    validatePassword,
    validateOperator,
    validateEmail
};