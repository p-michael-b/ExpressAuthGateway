// Load environment variables from a .env file
const dotenv = require('dotenv');

// Set NODE_ENV to 'development' by default if argument isnt passed
process.env.NODE_ENV = process.argv[2] || 'development';

// Load environment variables based on NODE_ENV
const envFile = `.env_${process.env.NODE_ENV}`;
dotenv.config({ path: envFile });


// Load the Knex configuration from the 'knexfile.js' file based on the current environment.
const knexConfig = require('./knexfile.js')[process.env.NODE_ENV];

// Initialize a Knex instance using the loaded configuration for database operations.
const knex = require('knex')(knexConfig);

// Import your model schemas (e.g., operator, token, session)
const operatorModel = require('./models/operator_model');
const tokenModel = require('./models/token_model');
const sessionModel = require('./models/session_model');

// Function to create tables based on model
const createTable = async (model) => {
    const { schema, table, columns } = model;

    await knex.schema.withSchema(schema).createTable(table, (table) => {
        for (const column in columns) {
            const { type, primaryKey, notNull } = columns[column];

            let columnBuilder;

            // Step 1: Check if the type is 'serial'
            if (type === 'serial') {
                columnBuilder = table.increments(column);
            } else {
                columnBuilder = table[type](column);
            }

            // Step 2: If it's a primary key, mark it as primary
            if (primaryKey) {
                columnBuilder.primary();
            }

            // Step 3: If it's not null mark it as not null
            if (notNull) {
                columnBuilder.notNullable();
            }
        }
    });
};

// Initialize tables based on model schemas
const initDataTables = async () => {
    try {
        // Create tables for each model schema
        await createTable(operatorModel);
        await createTable(tokenModel);
        await createTable(sessionModel);
        console.log('Database tables created.');

        await insertGenesisUser();
        console.log('Genesis User inserted.');
    } catch (error) {
        console.error('Error creating database tables:', error);
    } finally {
        knex.destroy(); // Close the database connection
    }
};

// Initialize Genesis User
const insertGenesisUser = async () => {
    try {
        await knex('operators').insert({
            _id: 0,
            email: process.env.GENESIS_EMAIL,
            operator: process.env.GENESIS_OPERATOR,
            password: '$2b$10$BT4kpEreyvcDT69xLRRIWuwofKYKT9DbXY7Z5zmf71caWxVAh2XW2'
        });
    } catch (error) {
        console.error('Error inserting super admin user:', error);
    }
};


initDataTables();