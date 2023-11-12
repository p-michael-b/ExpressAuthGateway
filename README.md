# This is an express api gateway with authentication service
# environment variables
The environment variables are set up in two different .env files:
.env_development and .env_production respectively.

# database setup
The gateway depends on a postgres database in order to save operator, session and token data.
The database setup can be done with two scripts:

### database and schema setup
To create the database and schema call node init_tables with the respective environment you want to setup w
i.e. `node init_database development` to setup your production database

### table setup
To create the tables (operators, sessions, tokens) call node init_tables with the respective environment you want to setup
i.e. `node init_tables development` to setup your production database
This will also create a genesis operator with email and name specified in the .env. The password for this user is 111111aA!

# starting the app
To start the app in development environment call npm run dev
To start the app in production environment call npm run start

