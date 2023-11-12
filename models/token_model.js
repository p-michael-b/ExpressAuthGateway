const tokenModel = {
    schema: process.env.AUTH_SCHEMA,
    table: 'tokens',
    columns: {
        _id: { type: 'serial', primaryKey: true, notNull: true },
        _fk_operator: { type: 'integer', primaryKey: false, notNull: true },
        token: { type: 'text', primaryKey: false, notNull: true },
        created_at: { type: 'dateTime', primaryKey: false, notNull: true },
    },
};

module.exports = tokenModel;