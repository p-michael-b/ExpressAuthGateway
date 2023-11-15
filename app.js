// Load environment variables from a .env file
const dotenv = require('dotenv');

// Set NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Load environment variables based on NODE_ENV
const envFile = `.env_${process.env.NODE_ENV}`;
dotenv.config({ path: envFile });

// Import the Express.js framework
const express = require('express');

// Import morgan middleware for request logging (for debugging and monitoring)
const morgan = require('morgan');

// Import cors middleware for enabling Cross-Origin Resource Sharing
const cors = require('cors');

// Import helmet middleware for enhancing security by setting various HTTP headers
const helmet = require('helmet');

// Import passport for authentication of clientside gateway requests.
const passport = require('passport');

// Import express-session for clientside session management.
const session = require('express-session');

// Import connect-session-knex for clientside session storage.
const knexSessionStore = require('connect-session-knex')(session);

// Define the port for your Express app, allowing it to be set through an environment variable
const PORT = process.env.SERVER_PORT || 5001;

// Creating an Express application instance.
const app = express();

// Creating an HTTP server instance to serve our Express app.
const server = require('http').Server(app);

// Parsing incoming JSON data in requests using Express middleware.
app.use(express.json());

// Configuring Cross-Origin Resource Sharing (CORS) middleware with credentials and origin options.
// credentials flag allows the client to send the session info in the header
// origin flag allows the server to reflect (enable) the requested origin in the CORS response
// this is a low security origin flag, should be changed in production
app.use(cors({credentials: true, origin: true}))

// Enhancing security by applying Helmet middleware for HTTP header protection.
app.use(helmet());


//Importing the environment variables and making sure they are all available
const requiredEnvVars = ['JWT_SECRET', 'COOKIE_SECRET', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_PORT', 'SERVER_PORT', 'PRODUCTION_MAIL', 'PRODUCTION_CLIENT', 'AUTH_SCHEMA'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}

// Load the Knex configuration from the 'knexfile.js' file based on the current environment.
const knexConfig = require('./knexfile.js')[process.env.NODE_ENV];

console.log(knexConfig)

// Initialize a Knex instance using the loaded configuration for database operations.
const knex = require('knex')(knexConfig);

// Create a session store using the configured Knex connection for session management.
const store = new knexSessionStore({knex: knex,});

//For session lifecycle
const oneDay = 1000 * 60 * 60 * 24;

// Set up session middleware with the defined session store and configuration options.
// The secure option depends on SSL settings and cannot be set in current digital ocean setup
app.use(session({
    store: store,
    name: 'session',
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        domain: process.env.NODE_ENV === 'production' ?  process.env.PRODUCTION_DOMAIN : null,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: oneDay,
        sameSite: "none",
    }
}));

// Import the local authentication strategy for user login.
const localStrategy = require('./localStrategy.js');

// Configure Passport to use the local authentication strategy for user login.
passport.use(localStrategy);

// Initialize Passport to enable authentication in the application.
app.use(passport.initialize());

// Enable Passport session support to maintain user sessions.
app.use(passport.session());

// Define the serialization process for Passport user sessions.
passport.serializeUser(function (user, done) {
    process.nextTick(function () {
        return done(null, user)
    });
});
// Define the deserialization process for Passport user sessions.
passport.deserializeUser(function (user, done) {
    process.nextTick(function () {
        return done(null, user);
    });
});

// Middleware to make the Knex instance available in the request object.
app.use((req, res, next) => {
    req.knex = knex;
    next();
});

// Setting up Morgan middleware to log Authentication Service requests.
app.use(morgan('\n********** AUTH SERVICE REQUEST **********\n' +
    'Date       :date[iso]\n' +
    'Request    :method :url\n' +
    'Status     :status\n' +
    'Response   :response-time ms\n' +
    'Remote IP  :remote-addr\n' +
    'HTTP ver.  :http-version\n' +
    'Referrer   :referrer\n' +
    'User Agent :user-agent\n' +
    '********** END REQUEST **********\n\n'));

//after passport can use routes
const authRoutes = require('./routes/auth_routes');

// Use the 'authRoutes' middleware for routes under the '/auth' path.
app.use('/auth', authRoutes);

// Health Route to provide health check for the authentication gateway
app.get('/', (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'The auth gateway',
        data:[]
    });
})



// Starting the server and listening on the specified port, logging the listening status.
server.listen(PORT, () => console.log(`server listening on port ${PORT}`));
