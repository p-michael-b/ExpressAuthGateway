// Initialize a PostgreSQL database connection using Knex for the 'auth' schema.
module.exports = {
    development: {
        client: 'pg',
        searchPath: 'auth',
        connection: {
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
        },
        pool: {
            min: 2,
            max: 10
        },
        debug: true
    },
    production: {
        client: 'pg',
        searchPath: 'auth',
        connection: {
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            ssl: {rejectUnauthorized: false},
            pool: {
                min: 2,
                max: 10
            },
            debug: false
        }
    }
}
