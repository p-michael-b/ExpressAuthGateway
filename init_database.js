// Load environment variables from a .env file
const dotenv = require('dotenv');

// Set NODE_ENV to 'development' by default if the argument isn't passed
process.env.NODE_ENV = process.argv[2] || 'development';

// Load environment variables based on NODE_ENV
const envFile = `.env_${process.env.NODE_ENV}`;
dotenv.config({ path: envFile });

// Barebone Knex configuration just for creating the database
const knexConfig = {
    client: 'pg',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        database: 'postgres', // Connect to 'postgres' as the default database for administrative tasks
    }
};

// Customize the database and schema names
const newDatabaseName = process.env.DB_NAME;
const newSchemaName = process.env.AUTH_SCHEMA;

// Initialize a Knex instance using the barebone configuration.
const knex = require('knex')(knexConfig);

// Create the new database
knex.raw(`CREATE DATABASE ${newDatabaseName}`)
    .then(() => {
        console.log(`Database '${newDatabaseName}' created.`);

        // Modify the Knex configuration to use the new database
        const newKnexConfig = {
            ...knexConfig,
            connection: {
                ...knexConfig.connection,
                database: newDatabaseName,
            },
        };

        // Initialize a new Knex instance with the updated configuration
        const db = require('knex')(newKnexConfig);

        // Use the new schema
        return db.raw(`CREATE SCHEMA ${newSchemaName}`)
            .then(() => {
                console.log(`Schema '${newSchemaName}' created.`);
            })
            .catch((error) => {
                console.error('Error creating schema:', error);
            })
            .finally(() => {
                db.destroy(); // Close the new database connection
            });
    })
    .catch((error) => {
        console.error('Error creating database:', error);
    })
    .finally(() => {
        knex.destroy(); // Close the initial database connection
    });