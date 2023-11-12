const sessionModel = {
    schema: process.env.AUTH_SCHEMA,
    table: 'sessions',
    columns: {
        sid: { type: 'varchar', primaryKey: true, notNull: true },
        sess: { type: 'json', primaryKey: false, notNull: true },
        expired: { type: 'dateTime', primaryKey: false, notNull: true },
    },
};

module.exports = sessionModel;