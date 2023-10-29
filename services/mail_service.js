// Import JWT library for authentication and authorization.
const jwt = require('jsonwebtoken');

// Define API URL based on the environment .
const apiUrl = (process.env.NODE_ENV === 'development') ? 'http://localhost:5002/sendmail' : 'https://apebase.app/sendmail';

/**
 * Send an email using the provided data to a designated mail service.
 *
 * @param {string} mailRecipient - The recipient's email address.
 * @param {string} mailSubject - The subject of the email.
 * @param {string} mailText - The email content.
 * @returns {Promise<Response>} - A promise that resolves to the result of the email sending operation.
 */
const sendMail = async (mailRecipient, mailSubject, mailText) => {
    const jwtToken = jwt.sign({}, process.env.JWT_SECRET, {expiresIn: '1h'});
    try {
        return await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}` // pass token to mail service
            },
            body: JSON.stringify({mailRecipient, mailSubject, mailText})
        })
    } catch (error) {
        throw new Error(error.message)
    }
}


module.exports = {
    sendMail,
};